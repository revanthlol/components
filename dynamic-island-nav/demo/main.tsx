import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DynamicIslandNav, type DynamicIslandNavProps, type NavItem } from "../src";

const items: NavItem[] = [
  { label: "Home", icon: "home", section: "home" },
  { label: "Work", icon: "grid", section: "work" },
  { label: "Lab", icon: "sparkle", section: "lab" },
  { label: "Journal", icon: "pen", section: "journal" },
  { label: "About", icon: "user", section: "about" },
  { label: "Contact", icon: "mail", section: "contact" },
];

const sections = [
  { id: "home", title: "Home", body: "Scroll down. The island follows the section that fills the screen and the pill glides to the matching item." },
  { id: "work", title: "Work", body: "Hover another item to unfold its label. Click one to smooth scroll to its section." },
  { id: "lab", title: "Lab", body: "Scrolling down shrinks the island to the current item. Hover it, or press the dots button, to bring the others back." },
  { id: "journal", title: "Journal", body: "Use the controls at the bottom left to try themes, label modes and the mobile menu layout." },
  { id: "about", title: "About", body: "Tab through the items: focus rings, labels and the current page state are exposed to keyboards and screen readers." },
  { id: "contact", title: "Contact", body: "Resize the window under 640px, or pick Mobile layout, to see the menu with its staggered rows." },
];

function Select<T extends string>(props: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  const id = "ctl-" + props.label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="ctl">
      <label htmlFor={id}>{props.label}</label>
      <select id={id} value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<NonNullable<DynamicIslandNavProps["theme"]>>("Dark");
  const [labels, setLabels] = useState<NonNullable<DynamicIslandNavProps["labels"]>>("Active");
  const [layout, setLayout] = useState<NonNullable<DynamicIslandNavProps["layout"]>>("Auto");
  const [expand, setExpand] = useState<NonNullable<DynamicIslandNavProps["expand"]>>("Hover");
  const [align, setAlign] = useState<NonNullable<DynamicIslandNavProps["align"]>>("Center");
  const [logo, setLogo] = useState<NonNullable<DynamicIslandNavProps["logoType"]>>("None");
  const [compact, setCompact] = useState(true);

  return (
    <>
      <DynamicIslandNav
        fixed
        items={items}
        theme={theme}
        labels={labels}
        layout={layout}
        expand={expand}
        align={align}
        compact={compact}
        logoType={logo}
        logoText="Studio"
        logoLink="#home"
      />
      <main>
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className={"band band-" + (i < 3 ? "a" : "b")} aria-labelledby={s.id + "-title"}>
            {i === 0 ? <h1 id={s.id + "-title"}>{s.title}</h1> : <h2 id={s.id + "-title"}>{s.title}</h2>}
            <p>{s.body}</p>
          </section>
        ))}
      </main>
      <aside className="panel" aria-label="Demo controls">
        <Select label="Theme" value={theme} options={["Dark", "Light", "Auto"]} onChange={setTheme} />
        <Select label="Labels" value={labels} options={["Active", "All"]} onChange={setLabels} />
        <Select label="Layout" value={layout} options={["Auto", "Desktop", "Mobile"]} onChange={setLayout} />
        <Select label="Expand" value={expand} options={["Hover", "Click"]} onChange={setExpand} />
        <Select label="Align" value={align} options={["Left", "Center", "Right"]} onChange={setAlign} />
        <Select label="Logo" value={logo} options={["None", "Text"]} onChange={setLogo} />
        <div className="ctl">
          <label htmlFor="ctl-compact">Compact on scroll</label>
          <input id="ctl-compact" type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
        </div>
      </aside>
    </>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
