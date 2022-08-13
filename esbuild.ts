import { build } from "esbuild";
import svelte from "esbuild-svelte";
import { Dir, opendirSync } from "fs";
import { copyFile, mkdir, rm } from "fs/promises";

const PROD = process.env.NODE_ENV === "production";

await rm("./lib", { recursive: true });

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

async function copyStaticFiles(directory: Dir, dest = "./lib") {
	for await (const entry of directory) {
		if (entry.isFile()) {
			await copyFile(`${directory.path}/${entry.name}`, `${dest}/${entry.name}`);
		} else if (entry.isDirectory()) {
			await mkdir(`${dest}/${entry.name}`, { recursive: true });
			await copyStaticFiles(opendirSync(`${directory.path}/${entry.name}`), `${dest}/${entry.name}`);
		}
	}
}

copyStaticFiles(opendirSync("./static"));
