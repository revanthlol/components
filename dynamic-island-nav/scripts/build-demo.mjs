import { build } from "esbuild";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";

rmSync("demo/dist", { recursive: true, force: true });
mkdirSync("demo/dist", { recursive: true });
await build({
  entryPoints: ["demo/main.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: "demo/dist/app.js",
  logLevel: "info",
});
copyFileSync("demo/index.html", "demo/dist/index.html");
console.log("demo built: demo/dist/index.html (open it directly, no server needed)");
