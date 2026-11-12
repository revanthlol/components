/*!
 * Testimonials carousel (vanilla JS, no dependencies)
 *
 *   <link rel="stylesheet" href="testimonials.css">
 *   <div id="testimonials"></div>
 *   <script src="testimonials.js"></script>
 *   <script>
 *     const t = new Testimonials("#testimonials", { items: [ ... ] });
 *   </script>
 *
 * Also works with CommonJS / bundlers: const Testimonials = require("./testimonials.js")
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Testimonials = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DEFAULTS = {
    items: [], // { quote, name, byline, image, alt, imageZoom, focalX, focalY, imageFit }
    autoplay: true,
    duration: 6, // seconds per slide
    pauseOnHover: false,
    respectReducedMotion: true,
    showArrows: true,
    showProgress: true,
    ariaLabel: "Customer testimonials",
    labels: {
      arrows: "Testimonial navigation",
      progress: "Testimonial progress",
      previous: "Show previous testimonial",
      next: "Show next testimonial",
      goTo: "Show testimonial {n} of {total}",
      slide: "{n} of {total}",
    },
    // animation tuning
    lineDuration: 0.7,
    lineStagger: 0.1,
    lineOffset: 20,
    blurAmount: 8,
    authorDelay: 0.2,
  };

  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var SVG_NS = "http://www.w3.org/2000/svg";

  // ---- helpers ------------------------------------------------------------

  function clamp(n, min, max, fallback) {
    return typeof n !== "number" || !isFinite(n) ? fallback : Math.min(max, Math.max(min, n));
  }

  function fill(str, n, total) {
    return String(str).replace("{n}", n).replace("{total}", total);
  }

  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(c);
    });
    return node;
  }

  function initials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) {
        return w.charAt(0).toUpperCase();
      })
      .join("");
  }

  function sameLines(a, b) {
    return a.length === b.length && a.every(function (l, i) { return l === b[i]; });
  }

  // Spring (stiffness 380, damping 26, mass 1) sampled into WAAPI keyframes.
  var SPRING_MS = 700;
  var SPRING_FRAMES = (function () {
    var k = 380, c = 26, m = 1;
    var wn = Math.sqrt(k / m);
    var zeta = c / (2 * Math.sqrt(k * m));
    var wd = wn * Math.sqrt(1 - zeta * zeta);
    var frames = [];
    var steps = 40;
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * (SPRING_MS / 1000);
      var v = 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + ((zeta * wn) / wd) * Math.sin(wd * t));
      if (i === steps) v = 1;
      frames.push({ opacity: Math.min(1, Math.max(0, v)), transform: "scale(" + v + ")" });
    }
    return frames;
  })();

  function arrowIcon(dir) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", dir === "prev" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  // ---- reveal text: measures wrapped lines, animates each one --------------

  function createText(text) {
    var srText = h("span", { class: "tc__sr", text: text });
    var measure = h("div", { class: "tc__measure", "aria-hidden": "true" });
    var overlay = h("div", { class: "tc__overlay", "aria-hidden": "true" });
    var rootEl = h("div", { class: "tc__text" }, [srText, measure, overlay]);

    String(text).replace(/\r/g, "").split("\n").forEach(function (line, li, all) {
      var words = line.trim() ? line.trim().split(/\s+/) : [];
      if (!words.length) {
        var empty = h("span", { "data-line-word": "true", "data-empty-line": "true" });
        empty.textContent = "\u00A0";
        measure.appendChild(empty);
      }
      words.forEach(function (w, wi) {
        var s = h("span", { "data-line-word": "true" });
        s.textContent = w + (wi < words.length - 1 ? " " : "");
        measure.appendChild(s);
      });
      if (li < all.length - 1) measure.appendChild(document.createElement("br"));
    });

    var current = null;

    return {
      el: rootEl,
      measureEl: measure,
      // returns the visual lines as currently wrapped
      lines: function () {
        var words = Array.prototype.slice.call(measure.querySelectorAll("[data-line-word]"));
        if (!words.length) return [""];
        var out = [], cur = [], prev = null;
        words.forEach(function (w) {
          var top = Math.round(w.getBoundingClientRect().top * 2) / 2;
          var t = w.getAttribute("data-empty-line") === "true" ? "" : (w.textContent || "").trim();
          if (prev !== null && Math.abs(top - prev) > 0.75) {
            out.push(cur.join(" "));
            cur = [];
          }
          prev = top;
          cur.push(t);
        });
        if (cur.length) out.push(cur.join(" "));
        return out.length ? out : [""];
      },
      // (re)build the visible lines. elapsed lets a re-wrap resume instead of replaying.
      paint: function (lines, delay, elapsed, o) {
        if (current && sameLines(current.lines, lines) && current.delay === delay) return;
        current = { lines: lines, delay: delay };
        overlay.textContent = "";
        lines.forEach(function (line, i) {
          var span = h("span", { class: "tc__line" });
          span.textContent = line || "\u00A0";
          overlay.appendChild(h("span", { class: "tc__clip" }, [span]));
          if (o.reduce || !span.animate) return;
          span.animate(
            [
              { opacity: 0, transform: "translateY(" + o.lineOffset + "px)", filter: "blur(" + o.blurAmount + "px)" },
              { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
            ],
            {
              duration: o.lineDuration * 1000,
              delay: (delay + i * o.lineStagger - elapsed) * 1000,
              easing: EASE,
              fill: "both",
            }
          );
        });
      },
    };
  }

  // ---- main class ---------------------------------------------------------

  function Testimonials(target, options) {
    var root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) throw new Error("Testimonials: target element not found");

    var o = Object.assign({}, DEFAULTS, options || {});
    o.labels = Object.assign({}, DEFAULTS.labels, (options && options.labels) || {});
    o.items = (o.items || []).filter(Boolean);
    o.duration = clamp(o.duration, 0.5, 60, 6);
    o.lineDuration = clamp(o.lineDuration, 0, 2, 0.7);
    o.lineStagger = clamp(o.lineStagger, 0, 0.5, 0.1);
    o.lineOffset = clamp(o.lineOffset, 0, 80, 20);
    o.blurAmount = clamp(o.blurAmount, 0, 24, 8);
    o.authorDelay = clamp(o.authorDelay, 0, 2, 0.2);

    this.opts = o;
    this.root = root;
    this.count = o.items.length;
    this.index = 0;
    this._dead = false;
    this._figCleanup = null;
    this._elapsed = 0;
    this._last = 0;
    this._raf = 0;
    this._hover = false;
    this._focus = false;
    this._inView = false;
    this._ready = false;
    this._fills = [];

    this._mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    this._build();
    this._bind();
    this._whenFontsReady(
      function () {
        if (this._dead) return;
        this._ready = true;
        this._showSlide();
        this._startTimer();
      }.bind(this)
    );
  }

  var P = Testimonials.prototype;

  P._reduce = function () {
    return this.opts.respectReducedMotion && !!(this._mq && this._mq.matches);
  };

  P._canPlay = function () {
    return this.opts.autoplay && this.count > 1 && !this._reduce();
  };

  P._paused = function () {
    return (
      (this.opts.pauseOnHover && this._hover) ||
      this._focus ||
      !this._inView ||
      document.visibilityState === "hidden"
    );
  };

  P._whenFontsReady = function (cb) {
    if (!document.fonts || !document.fonts.load) return cb();
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      cb();
    }
    var timer = setTimeout(finish, 600);
    Promise.all([
      document.fonts.load('400 40px "Testimonials Inter"'),
      document.fonts.load('italic 400 28px "Testimonials Inter"'),
    ])
      .catch(function () {})
      .then(function () {
        clearTimeout(timer);
        finish();
      });
  };

  P._build = function () {
    var self = this;
    var o = this.opts;
    var root = this.root;

    root.textContent = "";
    root.classList.add("tc");
    root.classList.toggle("tc--no-progress", !o.showProgress);
    root.classList.toggle("tc--static", this._reduce());
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", o.ariaLabel);
    root.style.setProperty("--tc-count", String(Math.max(1, this.count)));

    if (!this.count) {
      root.appendChild(h("p", { class: "tc__quote", text: "" }));
      return;
    }

    if (o.showArrows && this.count > 1) {
      var prev = h("button", { type: "button", class: "tc__arrow", "aria-label": o.labels.previous }, [arrowIcon("prev")]);
      var next = h("button", { type: "button", class: "tc__arrow", "aria-label": o.labels.next }, [arrowIcon("next")]);
      prev.addEventListener("click", function () { self.prev(); });
      next.addEventListener("click", function () { self.next(); });
      root.appendChild(h("nav", { class: "tc__arrows", "aria-label": o.labels.arrows }, [prev, next]));
    }

    if (o.showProgress) {
      var nav = h("nav", { class: "tc__progress", "aria-label": o.labels.progress });
      this._segs = o.items.map(function (_, i) {
        var f = h("span", { class: "tc__fill" });
        self._fills.push(f);
        var seg = h(
          "button",
          { type: "button", class: "tc__seg", "aria-label": fill(o.labels.goTo, i + 1, self.count) },
          [h("span", { class: "tc__track" }, [f])]
        );
        seg.addEventListener("click", function () { self.goTo(i); });
        nav.appendChild(seg);
        return seg;
      });
      root.appendChild(nav);
    }

    // hidden sizer: every slide stacked in one grid cell so the stage keeps the tallest height
    var sizer = h("div", { class: "tc__sizer", "aria-hidden": "true" });
    o.items.forEach(function (item) {
      var caption = null;
      if ((item.name || item.byline || item.image)) {
        var who = h("span", { class: "tc__who" });
        if (item.name) who.appendChild(h("span", { class: "tc__name", text: item.name }));
        if (item.byline) who.appendChild(h("span", { class: "tc__byline", text: item.byline }));
        caption = h("figcaption", { class: "tc__caption" }, [h("span", { class: "tc__avatar-gap" }), who]);
      }
      sizer.appendChild(
        h("figure", { class: "tc__figure" }, [h("blockquote", { class: "tc__quote", text: item.quote || "\u00A0" }), caption])
      );
    });

    this._live = h("div", { class: "tc__live" });
    root.appendChild(h("div", { class: "tc__stage" }, [sizer, this._live]));

    this._updateProgress(0);
  };

  P._bind = function () {
    var self = this;
    var root = this.root;
    if (!this.count) return;

    this._on = [];
    function on(el, type, fn, opts) {
      el.addEventListener(type, fn, opts);
      self._on.push(function () { el.removeEventListener(type, fn, opts); });
    }

    on(root, "pointerenter", function (e) {
      if (e.pointerType === "mouse" || e.pointerType === "pen") self._hover = true;
    });
    on(root, "pointerleave", function () { self._hover = false; });
    // keyboard focus pauses; a mouse click on an arrow does not
    on(root, "focusin", function (e) {
      var focusVisible = false;
      try { focusVisible = e.target.matches(":focus-visible"); } catch (err) { focusVisible = true; }
      if (focusVisible) self._focus = true;
    });
    on(root, "focusout", function (e) {
      if (!e.relatedTarget || !root.contains(e.relatedTarget)) self._focus = false;
    });

    if (this._mq) {
      var onMq = function () {
        root.classList.toggle("tc--static", self._reduce());
        self._elapsed = 0;
        self._updateProgress(0);
      };
      if (this._mq.addEventListener) {
        this._mq.addEventListener("change", onMq);
        this._on.push(function () { self._mq.removeEventListener("change", onMq); });
      }
    }

    if ("IntersectionObserver" in window) {
      this._io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { self._inView = en.isIntersecting; });
      }, { threshold: 0.2 });
      this._io.observe(root);
    } else {
      this._inView = true;
    }
  };

  // ---- slide rendering ------------------------------------------------------

  P._showSlide = function () {
    if (!this.count || !this._live) return;
    var self = this;
    var o = this.opts;
    var item = o.items[this.index];
    var reduce = this._reduce();

    if (this._figCleanup) this._figCleanup();
    this._live.textContent = "";

    var start = performance.now();
    var quote = createText(item.quote || "");
    var name = item.name ? createText(item.name) : null;
    var byline = item.byline ? createText(item.byline) : null;

    var figure = h("figure", {
      class: "tc__figure",
      role: "group",
      "aria-roledescription": "slide",
      "aria-label": fill(o.labels.slide, this.index + 1, this.count),
      "aria-live": this._canPlay() && !this._paused() ? "off" : "polite",
      "aria-atomic": "true",
    });
    figure.appendChild(h("blockquote", { class: "tc__quote" }, [quote.el]));

    var avatar = null;
    if (item.name || item.byline || item.image) {
      avatar = this._avatar(item);
      var who = h("div", { class: "tc__who" });
      if (name) who.appendChild(h("div", { class: "tc__name" }, [name.el]));
      if (byline) who.appendChild(h("div", { class: "tc__byline" }, [byline.el]));
      figure.appendChild(h("figcaption", { class: "tc__caption" }, [avatar, who]));
    }
    this._live.appendChild(figure);
    this._figure = figure;

    var avatarPlayed = false;
    function layout() {
      var elapsed = (performance.now() - start) / 1000;
      var q = quote.lines();
      var n = name ? name.lines() : [];
      var b = byline ? byline.lines() : [];
      var me = Math.max(0, q.length - 1) * o.lineStagger + o.lineDuration * 0.55 + o.authorDelay;
      var he = me + Math.max(1, n.length) * o.lineStagger;
      var cfg = { reduce: reduce, lineOffset: o.lineOffset, blurAmount: o.blurAmount, lineDuration: o.lineDuration, lineStagger: o.lineStagger };
      quote.paint(q, 0, elapsed, cfg);
      if (name) name.paint(n, me, elapsed, cfg);
      if (byline) byline.paint(b, he, elapsed, cfg);
      if (avatar && !avatarPlayed) {
        avatarPlayed = true;
        if (!reduce && avatar.animate) avatar.animate(SPRING_FRAMES, { duration: SPRING_MS, delay: me * 1000, fill: "both" });
      }
    }
    layout();

    if (!reduce && figure.animate) figure.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "both" });

    var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(layout) : null;
    if (ro) [quote, name, byline].forEach(function (t) { if (t) ro.observe(t.measureEl); });
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", layout);
    window.addEventListener("resize", layout);

    this._figCleanup = function () {
      if (ro) ro.disconnect();
      if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener("loadingdone", layout);
      window.removeEventListener("resize", layout);
      self._figCleanup = null;
    };

    // warm the next avatar
    if (this.count > 1) {
      var nx = o.items[(this.index + 1) % this.count];
      if (nx && nx.image) {
        var src = typeof nx.image === "string" ? nx.image : nx.image.src;
        var im = new Image();
        if (typeof nx.image === "object" && nx.image.srcSet) im.srcset = nx.image.srcSet;
        im.src = src;
      }
    }
  };

  P._avatar = function (item) {
    var wrap = h("div", { class: "tc__avatar" });
    var img = item.image ? (typeof item.image === "string" ? { src: item.image } : item.image) : null;
    if (img && img.src) {
      var fx = clamp(item.focalX, 0, 100, 50);
      var fy = clamp(item.focalY, 0, 100, 50);
      var zoom = clamp(item.imageZoom, 1, 3, 1);
      var el = h("img", {
        class: "tc__img",
        src: img.src,
        srcset: img.srcSet,
        sizes: img.srcSet ? "80px" : undefined,
        alt: item.alt || "",
        draggable: "false",
        loading: "eager",
        decoding: "async",
      });
      el.style.objectFit = item.imageFit === "contain" ? "contain" : "cover";
      el.style.objectPosition = fx + "% " + fy + "%";
      el.style.transform = "scale(" + zoom + ")";
      el.style.transformOrigin = fx + "% " + fy + "%";
      wrap.appendChild(el);
    } else {
      wrap.appendChild(h("span", { class: "tc__initials", "aria-hidden": "true", text: initials(item.name) }));
    }
    return wrap;
  };

  // ---- autoplay -------------------------------------------------------------

  P._updateProgress = function (p) {
    var self = this;
    var playing = this._canPlay();
    this._fills.forEach(function (f, i) {
      var v = i < self.index ? 1 : i === self.index ? (playing ? p : 1) : 0;
      f.style.transform = "scaleX(" + v + ")";
    });
  };

  P._startTimer = function () {
    var self = this;
    if (this._raf || this._dead) return;
    this._last = performance.now();
    function tick(now) {
      if (self._dead) return;
      var dt = now - self._last;
      self._last = now;
      if (self._canPlay()) {
        if (!self._paused()) self._elapsed += dt;
        var p = Math.min(1, self._elapsed / (self.opts.duration * 1000));
        self._updateProgress(p);
        if (p >= 1) {
          self.goTo((self.index + 1) % self.count);
        }
      }
      self._raf = requestAnimationFrame(tick);
    }
    this._raf = requestAnimationFrame(tick);
  };

  // ---- public API -----------------------------------------------------------

  P.goTo = function (i) {
    if (this._dead || i < 0 || i >= this.count) return;
    this.index = i;
    this._elapsed = 0;
    this._updateProgress(0);
    if (this._ready) this._showSlide();
  };

  P.next = function () { this.goTo((this.index + 1) % this.count); };
  P.prev = function () { this.goTo((this.index - 1 + this.count) % this.count); };

  P.destroy = function () {
    this._dead = true;
    cancelAnimationFrame(this._raf);
    if (this._figCleanup) this._figCleanup();
    if (this._io) this._io.disconnect();
    (this._on || []).forEach(function (off) { off(); });
    this.root.textContent = "";
    this.root.classList.remove("tc", "tc--no-progress", "tc--static");
    ["role", "aria-roledescription", "aria-label"].forEach(function (a) { this.root.removeAttribute(a); }, this);
  };

  return Testimonials;
});
