import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: "inherit", env: { ...process.env, NODE_PATH: path.join(root, "node_modules") } });
run("node", ["scripts/build.mjs"]);
run("node", ["scripts/build-test-engine.mjs"]);
for (const t of ["ssr-parity", "engine-parity", "dom-parity"]) run("node", [`tests/parity/${t}.mjs`]);
console.log("all parity tests passed");
