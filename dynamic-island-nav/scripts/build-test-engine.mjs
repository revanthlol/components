import { build } from "esbuild";
await build({ entryPoints: ["src/engine.ts"], bundle: true, format: "esm", outfile: "dist/engine-for-tests.mjs", target: "es2020", logLevel: "silent" });
