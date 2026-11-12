// Runs the same interactive scenario against the original and the port in separate jsdom processes and diffs the DOM snapshots.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const f = path.join(path.dirname(fileURLToPath(import.meta.url)), "dom-scenario.mjs");
import { readFileSync } from "node:fs";
import os from "node:os";
const run = (impl) => { const out = path.join(os.tmpdir(), `lis-dom-${impl}.json`); execFileSync("node", [f, impl, out], { stdio: ["ignore", "ignore", "inherit"] }); return JSON.parse(readFileSync(out, "utf8")); };
const A = run("orig"), B = run("port");
let bad = 0;
A.forEach((a, i) => {
  const b = B[i];
  if (a.html === b.html) console.log("  same  ", a.label);
  else { bad++; let k = 0; while (a.html[k] === b.html[k]) k++; console.log("  DIFF  ", a.label, "\n   orig:", a.html.slice(Math.max(0, k - 80), k + 140), "\n   port:", b.html.slice(Math.max(0, k - 80), k + 140)); }
});
console.log(`DOM parity: ${A.length - bad} identical, ${bad} different`);
process.exit(bad ? 1 : 0);
