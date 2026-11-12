"use client"

import * as React from "react"
import { InteractiveHalftoneWordmark } from "@/components/ui/interactive-halftone-wordmark"

const MAPS_URL = "https://maps.app.goo.gl/es7rea6o8RAKE8639"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu/" },
  { label: "About us", href: "/#about-us" },
  { label: "Reserve a table", href: "#reserve-table" },
  { label: "Contact", href: "/contact-us" },
]

const CSS = `
.mkf-footer {
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #762326;
  color: #f4dfb8;
  font-family: "Gabarito", "Inter Tight", Arial, sans-serif;
  container-type: inline-size;
}
.mkf-footer * { box-sizing: border-box; }
.mkf-footer p { margin: 0; }
.mkf-footer a { color: inherit; text-decoration: none; }
.mkf-footer a:focus-visible { outline: 2px solid #f4dfb8; outline-offset: 5px; }
.mkf-footer a:hover { text-decoration: underline; text-underline-offset: 5px; }

.mkf-band {
  flex: none;
  height: 44px;
  background: url('/assets/kolam-diamond.svg') repeat-x center / auto 36px;
  border-bottom: 0.5px solid rgb(244 223 184 / 0.2);
  opacity: 0.85;
}

.bwf-inner {
  width: 100%;
  max-width: 1320px;
  margin: auto;
  padding: 76px 56px 0;
  display: grid;
  grid-template-columns: 1.1fr 1.15fr 0.7fr;
  gap: 64px;
}
.bwf-label {
  font-size: 0.75rem;
  line-height: 1.3;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding-bottom: 17px;
  border-bottom: 1px solid rgba(244, 223, 184, 0.3);
  margin: 0 0 24px;
  font-weight: 500;
}
.bwf-logo {
  width: 260px;
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 0 24px;
}
.bwf-copy {
  font-size: 1rem;
  line-height: 1.6;
  text-wrap: pretty;
  max-width: 300px;
  color: #ead1ad;
}
.bwf-telugu {
  font-size: 0.8125rem;
  margin-top: 14px;
  line-height: 1.7;
  color: #ead1ad;
}
.bwf address {
  font-size: 0.9375rem;
  font-style: normal;
  line-height: 1.7;
  color: #ead1ad;
}
.bwf-call {
  display: block;
  width: fit-content;
  font-size: 1.375rem;
  margin: 18px 0 12px;
  font-weight: 700;
}
.bwf-direction {
  font-size: 0.875rem;
  display: inline-block;
  opacity: 0.9;
}
.bwf-map {
  border-radius: 24px;
  overflow: hidden;
  width: 100%;
  height: 142px;
  border: 1px solid rgba(244, 223, 184, 0.3);
  margin-top: 22px;
  display: block;
  filter: saturate(0.65);
}
#reserve-table {
  scroll-margin-top: 110px;
}
.bwf-links {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bwf-links a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  font-size: 1rem;
}
.bwf-links span {
  font-size: 1.0625rem;
  opacity: 0.65;
}
.bwf-note {
  width: 100%;
  max-width: 1320px;
  margin: 52px auto 24px;
  padding: 22px 56px 0;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  font-size: 0.75rem;
  color: #e1bd99;
  border-top: 0.5px solid rgba(244, 223, 184, 0.16);
}
.bwf-note p:first-child {
  max-width: 70%;
}

@container(max-width: 950px) {
  .bwf-inner {
    padding: 54px 32px 0;
    gap: 32px;
    grid-template-columns: 1fr 1fr;
  }
  .bwf-brand {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .bwf-brand .bwf-label {
    grid-column: 1 / -1;
    margin-bottom: 0;
  }
  .bwf-logo { margin: 0; }
  .bwf-note { padding: 22px 32px 0; }
}

@container(max-width: 520px) {
  .bwf-inner {
    padding: 36px 24px 0;
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .bwf-brand { display: block; }
  .bwf-brand .bwf-label { margin-bottom: 24px; }
  .bwf-logo { width: 255px; margin-bottom: 22px; }
  .bwf-copy { max-width: none; }
  .bwf-map { height: 170px; }
  .bwf-note {
    padding: 0 24px;
    margin-top: 36px;
    display: block;
    line-height: 1.7;
  }
  .bwf-note p:first-child {
    max-width: none;
    margin-bottom: 8px;
  }
}
`

/** Matches the dot pitch to the viewport so the word stays crisp and legible on phones. */
function useDotGap() {
  const [gap, setGap] = React.useState(6)
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)")
    const apply = () => setGap(mq.matches ? 4 : 6)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
  return gap
}

export type MalnaduFooterProps = {
  wordmark?: string
  className?: string
}

export default function MalnaduFooter({
  wordmark = "MALNADU KITCHEN",
  className = "",
}: MalnaduFooterProps) {
  const dotGap = useDotGap()

  return (
    <footer id="visit-us" className={`mkf-footer ${className}`}>
      <style>{CSS}</style>

      {/* Heritage Top Pattern Band */}
      <div className="mkf-band" aria-hidden="true" />

      {/* Main 3-Column Content from the Actual Site */}
      <div className="bwf-inner">
        {/* Column 1: Brand & Regional Identity */}
        <div className="bwf-brand">
          <h2 className="bwf-label">Taste of Telangana</h2>
          <img
            className="bwf-logo"
            src="/assets/malnadu-logo-horizontal-cream.svg"
            alt="Malnadu Kitchen"
            width="920"
            height="184"
          />
          <div>
            <p className="bwf-copy">
              Authentic Telangana regional dining at Kompally, Hyderabad. Fresh ingredients,
              time-honoured spice blends, and warm hospitality.
            </p>
            <p className="bwf-telugu" lang="te">
              మలనాడు కిచెన్ · టేస్ట్ ఆఫ్ తెలంగాణ
            </p>
          </div>
        </div>

        {/* Column 2: Visit us, Address, Phone, & Map */}
        <section id="reserve-table" tabIndex={-1} aria-labelledby="bwf-visit">
          <h2 className="bwf-label" id="bwf-visit">Visit us</h2>
          <address>
            1st floor, Hoysala Inn, Kompally Road,<br />
            next to Srikara Hospital, near Croma,<br />
            Ruby Block, Kompally, Hyderabad,<br />
            Telangana 500100
          </address>
          <a
            className="bwf-call"
            aria-label="Call Malnadu Kitchen to reserve a table"
            href="tel:+917995133353"
          >
            79951 33353
          </a>
          <a
            className="bwf-direction"
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
          >
            Get directions <span aria-hidden="true">↗</span>
          </a>
          <iframe
            className="bwf-map"
            title="Malnadu Kitchen location map"
            loading="lazy"
            src="https://maps.google.com/maps?q=Malnadu%20Kitchen%2C%201st%20floor%2C%20Hoysala%20Inn%2C%20Kompally%20Road%2C%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
          />
        </section>

        {/* Column 3: Navigation Links */}
        <nav aria-label="At your table">
          <h2 className="bwf-label">At your table</h2>
          <ul className="bwf-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>
                  {label}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Copyright Note */}
      <div className="bwf-note">
        <p>© {new Date().getFullYear()} Malnadu Kitchen. All rights reserved.</p>
        <p>Kompally, Hyderabad · Taste of Telangana</p>
      </div>

      {/* The Interactive Halftone Big Text */}
      <div style={{ marginTop: "auto", width: "100%" }}>
        <InteractiveHalftoneWordmark
          text={wordmark}
          preset="crimson"
          dotGap={dotGap}
          radius={90}
          crop={0.18}
          grain={0.45}
          fontFamily={'"Gabarito", "Inter Tight", "Helvetica Neue", Arial, system-ui, sans-serif'}
          fontWeight={800}
          height="clamp(240px, 22vw, 380px)"
        />
      </div>
    </footer>
  )
}
