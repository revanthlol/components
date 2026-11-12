import { build } from "esbuild";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
const common = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: true,
  target: "es2020",
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
  logLevel: "info",
};
await build({ ...common, format: "esm", outfile: "dist/index.js" });
await build({ ...common, format: "cjs", outfile: "dist/index.cjs" });
execSync("npx tsc -p tsconfig.json", { stdio: "inherit" });
console.log("build ok");
