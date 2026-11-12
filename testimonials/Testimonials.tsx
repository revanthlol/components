"use client";

/**
 * Testimonials carousel (React, no dependencies besides React 17+).
 *
 *   import Testimonials from "./Testimonials";
 *   <Testimonials testimonials={[{ quote: "...", name: "...", byline: "...", image: "/me.jpg" }]} />
 *
 * Styling lives in testimonials.css (imported below). Override any --tc-* variable
 * through `className` or `style`.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type CSSProperties,
  type RefObject,
} from "react";
import "./testimonials.css";

// ---- types ----------------------------------------------------------------

export type TestimonialImage = string | { src: string; srcSet?: string };

export interface Testimonial {
  quote: string;
  name?: string;
  byline?: string;
  image?: TestimonialImage;
  /** Empty by default, the name is already next to the avatar. */
  alt?: string;
  imageFit?: "cover" | "contain";
  /** 0 to 100 */
  focalX?: number;
  /** 0 to 100 */
  focalY?: number;
  /** 1 to 3 */
  imageZoom?: number;
}

export interface TestimonialsLabels {
  arrows: string;
  progress: string;
  previous: string;
  next: string;
  /** {n} and {total} are replaced */
  goTo: string;
  slide: string;
}

export interface TestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  /** seconds per slide */
  duration?: number;
  pauseOnHover?: boolean;
  respectReducedMotion?: boolean;
  showArrows?: boolean;
  showProgress?: boolean;
  ariaLabel?: string;
  labels?: Partial<TestimonialsLabels>;
  lineDuration?: number;
  lineStagger?: number;
  lineOffset?: number;
  blurAmount?: number;
  authorDelay?: number;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_LABELS: TestimonialsLabels = {
  arrows: "Testimonial navigation",
  progress: "Testimonial progress",
  previous: "Show previous testimonial",
  next: "Show next testimonial",
  goTo: "Show testimonial {n} of {total}",
  slide: "{n} of {total}",
};

interface Anim {
  lineDuration: number;
  lineStagger: number;
  lineOffset: number;
  blurAmount: number;
  authorDelay: number;
}

// ---- helpers --------------------------------------------------------------

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const clamp = (n: number | undefined, min: number, max: number, fallback: number) =>
  typeof n !== "number" || !Number.isFinite(n) ? fallback : Math.min(max, Math.max(min, n));

const fmt = (s: string, n: number, total: number) => s.replace("{n}", String(n)).replace("{total}", String(total));

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

const sameLines = (a: string[], b: string[]) => a.length === b.length && a.every((l, i) => l === b[i]);

const toImage = (img?: TestimonialImage) => (img ? (typeof img === "string" ? { src: img } : img) : undefined);

// Spring (stiffness 380, damping 26, mass 1) sampled into WAAPI keyframes.
const SPRING_MS = 700;
const SPRING_FRAMES: Keyframe[] = (() => {
  const k = 380, c = 26, m = 1;
  const wn = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const wd = wn * Math.sqrt(1 - zeta * zeta);
  const steps = 40;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (SPRING_MS / 1000);
    let v = 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + ((zeta * wn) / wd) * Math.sin(wd * t));
    if (i === steps) v = 1;
    frames.push({ opacity: Math.min(1, Math.max(0, v)), transform: `scale(${v})` });
  }
  return frames;
})();

// ---- hooks ----------------------------------------------------------------

function useReducedMotion(enabled: boolean) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.matchMedia) {
      setReduce(false);
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [enabled]);
  return reduce;
}

function useTabVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** Resolves once Inter is ready (or after 600ms) so line breaks are measured with the final font. */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let dead = false;
    const done = () => !dead && setReady(true);
    if (!document.fonts?.load) {
      done();
      return;
    }
    const timer = setTimeout(done, 600);
    Promise.all([
      document.fonts.load('400 40px "Testimonials Inter"'),
      document.fonts.load('italic 400 28px "Testimonials Inter"'),
    ])
      .catch(() => undefined)
      .then(() => {
        clearTimeout(timer);
        done();
      });
    return () => {
      dead = true;
      clearTimeout(timer);
    };
  }, []);
  return ready;
}

/** Measures how a string wraps and returns it as an array of visual lines. */
function useLines(text: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>(() => [text]);

  useIsoLayoutEffect(() => {
    let dead = false;
    const measure = () => {
      const root = ref.current;
      if (dead || !root) return;
      const words = Array.from(root.querySelectorAll<HTMLElement>("[data-line-word]"));
      if (!words.length) {
        setLines((p) => (sameLines(p, [""]) ? p : [""]));
        return;
      }
      const out: string[] = [];
      let cur: string[] = [];
      let prev: number | null = null;
      for (const w of words) {
        const top = Math.round(w.getBoundingClientRect().top * 2) / 2;
        const t = w.dataset.emptyLine === "true" ? "" : (w.textContent || "").trim();
        if (prev !== null && Math.abs(top - prev) > 0.75) {
          out.push(cur.join(" "));
          cur = [];
        }
        prev = top;
        cur.push(t);
      }
      if (cur.length) out.push(cur.join(" "));
      setLines((p) => (sameLines(p, out) ? p : out));
    };

    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : undefined;
    if (ref.current) ro?.observe(ref.current);
    window.addEventListener("resize", measure);
    document.fonts?.addEventListener?.("loadingdone", measure);
    return () => {
      dead = true;
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener?.("loadingdone", measure);
    };
  }, [text]);

  return { lines, ref };
}

// ---- pieces ---------------------------------------------------------------

function Words({ text }: { text: string }) {
  const rows = text.replace(/\r/g, "").split("\n");
  return (
    <>
      {rows.map((row, li) => {
        const words = row.trim() ? row.trim().split(/\s+/) : [];
        return (
          <Fragment key={li}>
            {words.length ? (
              words.map((w, wi) => (
                <span key={wi} data-line-word="true">
                  {w}
                  {wi < words.length - 1 ? " " : ""}
                </span>
              ))
            ) : (
              <span data-line-word="true" data-empty-line="true">
                {"\u00A0"}
              </span>
            )}
            {li < rows.length - 1 && <br />}
          </Fragment>
        );
      })}
    </>
  );
}

function RevealLine({
  line,
  index,
  delay,
  start,
  anim,
  reduce,
}: {
  line: string;
  index: number;
  delay: number;
  start: number;
  anim: Anim;
  reduce: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { lineDuration, lineStagger, lineOffset, blurAmount } = anim;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduce || !el.animate) return;
    // negative delay = resume where the timeline already is (no replay after a re-wrap)
    const elapsed = (performance.now() - start) / 1000;
    const a = el.animate(
      [
        { opacity: 0, transform: `translateY(${lineOffset}px)`, filter: `blur(${blurAmount}px)` },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
      ],
      { duration: lineDuration * 1000, delay: (delay + index * lineStagger - elapsed) * 1000, easing: EASE, fill: "both" }
    );
    return () => a.cancel();
  }, [delay, index, start, reduce, lineDuration, lineStagger, lineOffset, blurAmount]);

  return (
    <span className="tc__clip">
      <span ref={ref} className="tc__line">
        {line || "\u00A0"}
      </span>
    </span>
  );
}

function RevealText({
  text,
  lines,
  measureRef,
  delay,
  start,
  anim,
  reduce,
}: {
  text: string;
  lines: string[];
  measureRef: RefObject<HTMLDivElement>;
  delay: number;
  start: number;
  anim: Anim;
  reduce: boolean;
}) {
  return (
    <div className="tc__text">
      <span className="tc__sr">{text}</span>
      <div ref={measureRef} className="tc__measure" aria-hidden="true">
        <Words text={text} />
      </div>
      <div className="tc__overlay" aria-hidden="true">
        {lines.map((line, i) => (
          <RevealLine
            key={`${i}-${line}`}
            line={line}
            index={i}
            delay={delay}
            start={start}
            anim={anim}
            reduce={reduce}
          />
        ))}
      </div>
    </div>
  );
}

function Avatar({ item, delay, reduce }: { item: Testimonial; delay: number; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const img = toImage(item.image);
  const fx = clamp(item.focalX, 0, 100, 50);
  const fy = clamp(item.focalY, 0, 100, 50);
  const zoom = clamp(item.imageZoom, 1, 3, 1);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduce || !el.animate) return;
    const a = el.animate(SPRING_FRAMES, { duration: SPRING_MS, delay: delay * 1000, fill: "both" });
    return () => a.cancel();
  }, [delay, reduce]);

  return (
    <div ref={ref} className="tc__avatar">
      {img?.src ? (
        <img
          className="tc__img"
          src={img.src}
          srcSet={img.srcSet}
          sizes={img.srcSet ? "80px" : undefined}
          alt={item.alt ?? ""}
          draggable={false}
          loading="eager"
          decoding="async"
          style={{
            objectFit: item.imageFit === "contain" ? "contain" : "cover",
            objectPosition: `${fx}% ${fy}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${fx}% ${fy}%`,
          }}
        />
      ) : (
        <span className="tc__initials" aria-hidden="true">
          {initials(item.name)}
        </span>
      )}
    </div>
  );
}

function Slide({
  item,
  index,
  count,
  anim,
  reduce,
  live,
  labels,
}: {
  item: Testimonial;
  index: number;
  count: number;
  anim: Anim;
  reduce: boolean;
  live: "off" | "polite";
  labels: TestimonialsLabels;
}) {
  const [start] = useState(() => performance.now());
  const figRef = useRef<HTMLElement>(null);
  const quote = useLines(item.quote);
  const name = useLines(item.name ?? "");
  const byline = useLines(item.byline ?? "");

  const me = Math.max(0, quote.lines.length - 1) * anim.lineStagger + anim.lineDuration * 0.55 + anim.authorDelay;
  const he = me + Math.max(1, name.lines.length) * anim.lineStagger;
  const hasCaption = !!(item.name?.trim() || item.byline?.trim() || toImage(item.image)?.src);

  useIsoLayoutEffect(() => {
    const el = figRef.current;
    if (!el || reduce || !el.animate) return;
    const a = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "both" });
    return () => a.cancel();
  }, [reduce]);

  return (
    <figure
      ref={figRef}
      className="tc__figure"
      role="group"
      aria-roledescription="slide"
      aria-label={fmt(labels.slide, index + 1, count)}
      aria-live={live}
      aria-atomic="true"
    >
      <blockquote className="tc__quote">
        <RevealText
          text={item.quote}
          lines={quote.lines}
          measureRef={quote.ref}
          delay={0}
          start={start}
          anim={anim}
          reduce={reduce}
        />
      </blockquote>
      {hasCaption && (
        <figcaption className="tc__caption">
          <Avatar item={item} delay={me} reduce={reduce} />
          <div className="tc__who">
            {item.name && (
              <div className="tc__name">
                <RevealText
                  text={item.name}
                  lines={name.lines}
                  measureRef={name.ref}
                  delay={me}
                  start={start}
                  anim={anim}
                  reduce={reduce}
                />
              </div>
            )}
            {item.byline && (
              <div className="tc__byline">
                <RevealText
                  text={item.byline}
                  lines={byline.lines}
                  measureRef={byline.ref}
                  delay={he}
                  start={start}
                  anim={anim}
                  reduce={reduce}
                />
              </div>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
}

/** Invisible copy of every slide, stacked in one grid cell, so the stage never changes height. */
function SizerSlide({ item }: { item: Testimonial }) {
  const hasCaption = !!(item.name?.trim() || item.byline?.trim() || toImage(item.image)?.src);
  return (
    <figure className="tc__figure">
      <blockquote className="tc__quote">{item.quote || "\u00A0"}</blockquote>
      {hasCaption && (
        <figcaption className="tc__caption">
          <span className="tc__avatar-gap" />
          <span className="tc__who">
            {item.name && <span className="tc__name">{item.name}</span>}
            {item.byline && <span className="tc__byline">{item.byline}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

function Arrow({ dir, label, onClick }: { dir: "prev" | "next"; label: string; onClick: () => void }) {
  return (
    <button type="button" className="tc__arrow" aria-label={label} onClick={onClick}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path
          d={dir === "prev" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ---- component ------------------------------------------------------------

export default function Testimonials({
  testimonials,
  autoplay = true,
  duration = 6,
  pauseOnHover = false,
  respectReducedMotion = true,
  showArrows = true,
  showProgress = true,
  ariaLabel = "Customer testimonials",
  labels: labelOverrides,
  lineDuration = 0.7,
  lineStagger = 0.1,
  lineOffset = 20,
  blurAmount = 8,
  authorDelay = 0.2,
  className,
  style,
}: TestimonialsProps) {
  const items = useMemo(() => (Array.isArray(testimonials) ? testimonials.filter(Boolean) : []), [testimonials]);
  const count = items.length;
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);
  const anim = useMemo<Anim>(
    () => ({
      lineDuration: clamp(lineDuration, 0, 2, 0.7),
      lineStagger: clamp(lineStagger, 0, 0.5, 0.1),
      lineOffset: clamp(lineOffset, 0, 80, 20),
      blurAmount: clamp(blurAmount, 0, 24, 8),
      authorDelay: clamp(authorDelay, 0, 2, 0.2),
    }),
    [lineDuration, lineStagger, lineOffset, blurAmount, authorDelay]
  );
  const seconds = clamp(duration, 0.5, 60, 6);

  const reduce = useReducedMotion(respectReducedMotion);
  const tabVisible = useTabVisible();
  const fontsReady = useFontsReady();
  const [sectionRef, inView] = useInView<HTMLElement>(0.2);

  const [index, setIndex] = useState(0);
  const [epoch, setEpoch] = useState(0); // bumps on every change so the slide remounts and replays
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  const current = count ? Math.min(index, count - 1) : 0;
  const playing = autoplay && count > 1 && !reduce;
  const paused = (pauseOnHover && hover) || focus || !inView || !tabVisible;

  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setEpoch((e) => e + 1);
  }, []);

  // progress + autoplay clock
  useEffect(() => {
    // reset every bar by hand: the clock writes straight to the DOM, so React can't be trusted to
    fills.current.forEach((el, i) => {
      if (el) el.style.transform = `scaleX(${i < current ? 1 : i === current ? (playing ? 0 : 1) : 0})`;
    });
    const fill = fills.current[current];
    if (!playing || !fontsReady) return;

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const tick = (now: number) => {
      if (!pausedRef.current) elapsed += now - last;
      last = now;
      const p = Math.min(1, elapsed / (seconds * 1000));
      if (fill) fill.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        goTo((current + 1) % count);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current, epoch, playing, fontsReady, seconds, count, goTo]);

  // warm the next avatar
  const nextImg = count > 1 ? toImage(items[(current + 1) % count]?.image) : undefined;
  useEffect(() => {
    if (!nextImg?.src) return;
    const im = new Image();
    if (nextImg.srcSet) im.srcset = nextImg.srcSet;
    im.src = nextImg.src;
  }, [nextImg?.src, nextImg?.srcSet]);

  const rootClass = ["tc", !showProgress && "tc--no-progress", reduce && "tc--static", className].filter(Boolean).join(" ");
  const rootStyle = { "--tc-count": Math.max(1, count), ...style } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={rootClass}
      style={rootStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" || e.pointerType === "pen") setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={(e) => {
        // keyboard focus pauses; a mouse click on an arrow does not
        let visible = true;
        try {
          visible = (e.target as HTMLElement).matches(":focus-visible");
        } catch {
          /* old browsers: treat as visible */
        }
        if (visible) setFocus(true);
      }}
      onBlurCapture={(e) => {
        const next = e.relatedTarget;
        if (!(next instanceof Node) || !e.currentTarget.contains(next)) setFocus(false);
      }}
    >
      {showArrows && count > 1 && (
        <nav className="tc__arrows" aria-label={labels.arrows}>
          <Arrow dir="prev" label={labels.previous} onClick={() => goTo((current - 1 + count) % count)} />
          <Arrow dir="next" label={labels.next} onClick={() => goTo((current + 1) % count)} />
        </nav>
      )}

      {showProgress && count > 0 && (
        <nav className="tc__progress" aria-label={labels.progress}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className="tc__seg"
              aria-label={fmt(labels.goTo, i + 1, count)}
              aria-current={i === current ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              <span className="tc__track">
                <span
                  ref={(el) => {
                    fills.current[i] = el;
                  }}
                  className="tc__fill"
                  style={{ transform: `scaleX(${i < current ? 1 : i === current ? (playing ? 0 : 1) : 0})` }}
                />
              </span>
            </button>
          ))}
        </nav>
      )}

      <div className="tc__stage">
        <div className="tc__sizer" aria-hidden="true">
          {items.map((item, i) => (
            <SizerSlide key={i} item={item} />
          ))}
        </div>
        <div className="tc__live">
          {count > 0 && fontsReady && (
            <Slide
              key={`${current}-${epoch}`}
              item={items[current]}
              index={current}
              count={count}
              anim={anim}
              reduce={reduce}
              live={playing && !paused ? "off" : "polite"}
              labels={labels}
            />
          )}
        </div>
      </div>
    </section>
  );
}
