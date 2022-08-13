import { build } from "esbuild";
import svelte from "esbuild-svelte";

const PROD = process.env.NODE_ENV === "production";

build({
	entryPoints: ["./src/index.ts"],
	outfile: "./lib/index.js",
	bundle: true,
	target: "esnext",
	format: "iife",
	sourcemap: PROD ? false : "inline",
	watch: !PROD,
	minify: !PROD,
	plugins: [
		svelte({
			compilerOptions: {
				css: true,
			},
		}),
	],
});
