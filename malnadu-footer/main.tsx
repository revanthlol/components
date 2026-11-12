import * as React from "react"
import { createRoot } from "react-dom/client"
import {
  InteractiveHalftoneWordmark,
  HALFTONE_PRESETS,
  type HalftonePresetName,
} from "./components/ui/interactive-halftone-wordmark"
import MalnaduFooter from "./components/malnadu-footer"

function App() {
  const [viewMode, setViewMode] = React.useState<"standalone" | "footer">("standalone")
  const [text, setText] = React.useState("CREATIVE STUDIO")
  const [preset, setPreset] = React.useState<HalftonePresetName>("night")
  const [dotGap, setDotGap] = React.useState(6)
  const [radius, setRadius] = React.useState(85)
  const [crop, setCrop] = React.useState(0.18)
  const [grain, setGrain] = React.useState(0.45)
  const [copied, setCopied] = React.useState(false)

  const snippet = `<InteractiveHalftoneWordmark
  text="${text}"
  preset="${preset}"
  dotGap={${dotGap}}
  radius={${radius}}
  crop={${crop}}
  grain={${grain}}
  height="clamp(240px, 24vw, 420px)"
/>`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentColors = HALFTONE_PRESETS[preset]

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: viewMode === "standalone" ? currentColors.background : "#140d0e",
        color: viewMode === "standalone" ? currentColors.ink : "#f4dfb8",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Top Navigation & Mode Switcher */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.25)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: "1.1rem",
              color: "#f2a93b",
            }}
          >
            ✦ Interactive Halftone Wordmark
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.1)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Reusable Component
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setViewMode("standalone")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: viewMode === "standalone" ? "#f2a93b" : "transparent",
              color: viewMode === "standalone" ? "#140d0e" : "inherit",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
            }}
          >
            Standalone Wordmark
          </button>
          <button
            type="button"
            onClick={() => setViewMode("footer")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: viewMode === "footer" ? "#f2a93b" : "transparent",
              color: viewMode === "footer" ? "#140d0e" : "inherit",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
            }}
          >
            Full Malnadu Footer View
          </button>
        </div>
      </nav>

      {viewMode === "standalone" ? (
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Controls Playground */}
          <div
            style={{
              maxWidth: "1100px",
              margin: "2rem auto 1rem",
              padding: "0 1.5rem",
              width: "100%",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "1.5rem 2rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
                alignItems: "end",
              }}
            >
              {/* Text Input */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "0.5rem",
                    opacity: 0.7,
                    fontWeight: 600,
                  }}
                >
                  Type Any Wordmark Text:
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter wordmark..."
                  style={{
                    width: "100%",
                    padding: "0.85rem 1.25rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "inherit",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    outline: "none",
                    letterSpacing: "0.02em",
                  }}
                />
              </div>

              {/* Theme Presets */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "0.5rem",
                    opacity: 0.7,
                    fontWeight: 600,
                  }}
                >
                  Theme Preset:
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(Object.keys(HALFTONE_PRESETS) as HalftonePresetName[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreset(p)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: preset === p ? "2px solid #f2a93b" : "1px solid rgba(255,255,255,0.15)",
                        background: HALFTONE_PRESETS[p].background,
                        color: HALFTONE_PRESETS[p].ink,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dot Gap Slider */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "0.5rem",
                    opacity: 0.7,
                    fontWeight: 600,
                  }}
                >
                  <span>Dot Pitch (Gap):</span>
                  <span>{dotGap}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={dotGap}
                  onChange={(e) => setDotGap(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f2a93b", cursor: "pointer" }}
                />
              </div>

              {/* Interaction Radius Slider */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "0.5rem",
                    opacity: 0.7,
                    fontWeight: 600,
                  }}
                >
                  <span>Spring Radius:</span>
                  <span>{radius}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f2a93b", cursor: "pointer" }}
                />
              </div>

              {/* Bottom Crop Slider */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "0.5rem",
                    opacity: 0.7,
                    fontWeight: 600,
                  }}
                >
                  <span>Bottom Crop:</span>
                  <span>{Math.round(crop * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.4"
                  step="0.02"
                  value={crop}
                  onChange={(e) => setCrop(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#f2a93b", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {/* Quick Copy Snippet */}
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto 1.5rem",
              padding: "0 1.5rem",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1.25rem",
                borderRadius: "10px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "0.85rem",
                fontFamily: "monospace",
              }}
            >
              <span style={{ opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {`<InteractiveHalftoneWordmark text="${text}" preset="${preset}" dotGap={${dotGap}} />`}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  background: copied ? "#22c55e" : "rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  marginLeft: "1rem",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "Copied!" : "Copy JSX"}
              </button>
            </div>
          </div>

          {/* Live Standalone Component Demo */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              marginTop: "2rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <InteractiveHalftoneWordmark
              text={text}
              preset={preset}
              dotGap={dotGap}
              radius={radius}
              crop={crop}
              grain={grain}
              height="clamp(280px, 32vw, 520px)"
            />
          </div>
        </div>
      ) : (
        /* Full Malnadu Footer View */
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <header style={{ padding: "3rem 2rem 2rem", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: "2rem", margin: "0 0 0.5rem", fontWeight: 800 }}>
              Full Production Footer Preview
            </h2>
            <p style={{ opacity: 0.75, maxWidth: "600px" }}>
              Showing the complete footer layout with brand logo, Telugu typography, Hoysala Inn address, live Google Map, and the interactive big text wordmark.
            </p>
          </header>
          <div style={{ flex: 1, minHeight: "10vh" }} />
          <MalnaduFooter wordmark="MALNADU KITCHEN" />
        </div>
      )}
    </div>
  )
}

const container = document.getElementById("root")
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
