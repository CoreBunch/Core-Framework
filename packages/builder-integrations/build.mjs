import * as esbuild from "esbuild";
import { readdirSync } from "fs";
import { join } from "path";

const srcDir = "src";
const outDir = "../wp/assets/public/js";

const files = readdirSync(srcDir).filter((f) => f.endsWith(".ts"));

for (const file of files) {
	const entryPoint = join(srcDir, file);
	const outfile = join(outDir, file.replace(".ts", ".js"));

	await esbuild.build({
		entryPoints: [entryPoint],
		outfile,
		bundle: false,
		minify: true,
		target: "es2017",
		format: "iife",
	});

	console.log(`Built: ${outfile}`);
}
