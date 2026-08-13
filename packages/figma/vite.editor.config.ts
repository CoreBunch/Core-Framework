import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import path from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const require = createRequire(import.meta.url);
const jotaiRoot = path.dirname(require.resolve("jotai/package.json"));

export default defineConfig({
	root: __dirname,
	publicDir: false,
	plugins: [react(), viteSingleFile()],
	build: {
		target: "ES2022",
		outDir: path.resolve(__dirname, ".generated/editor"),
		emptyOutDir: false,
		cssCodeSplit: false,
		assetsInlineLimit: 100_000_000,
		rollupOptions: {
			input: path.resolve(__dirname, "editor.html"),
		},
	},
	resolve: {
		alias: [
			{
				find: /^jotai$/,
				replacement: path.join(jotaiRoot, "esm/index.mjs"),
			},
			{
				find: "jotai/index",
				replacement: path.join(jotaiRoot, "esm/index.mjs"),
			},
			{
				find: "jotai/utils",
				replacement: path.join(jotaiRoot, "esm/utils.mjs"),
			},
			{
				find: "jotai/react/utils",
				replacement: path.join(jotaiRoot, "esm/react/utils.mjs"),
			},
			{
				find: "jotai/react",
				replacement: path.join(jotaiRoot, "esm/react.mjs"),
			},
			{
				find: "jotai/vanilla/internals",
				replacement: path.join(jotaiRoot, "esm/vanilla/internals.mjs"),
			},
			{
				find: "jotai/vanilla/utils",
				replacement: path.join(jotaiRoot, "esm/vanilla/utils.mjs"),
			},
			{
				find: "jotai/vanilla",
				replacement: path.join(jotaiRoot, "esm/vanilla.mjs"),
			},
			{
				find: "@core-framework/core",
				replacement: path.resolve(__dirname, "../core/src"),
			},
			{
				find: "cssGenerator",
				replacement: path.resolve(__dirname, "../core/src/cssGenerator"),
			},
			{ find: "functions", replacement: path.resolve(__dirname, "../www/src/functions") },
			{ find: "utils", replacement: path.resolve(__dirname, "../www/src/utils") },
			{ find: "components", replacement: path.resolve(__dirname, "../www/src/components") },
			{ find: "constants", replacement: path.resolve(__dirname, "../www/src/constants") },
			{ find: "data", replacement: path.resolve(__dirname, "../www/src/data") },
			{ find: "assets", replacement: path.resolve(__dirname, "../www/src/assets") },
			{ find: "hooks", replacement: path.resolve(__dirname, "../www/src/hooks") },
			{ find: "state", replacement: path.resolve(__dirname, "../www/src/state") },
			{ find: "schema", replacement: path.resolve(__dirname, "../www/src/schema") },
			{ find: "views", replacement: path.resolve(__dirname, "../www/src/views") },
			{ find: "flags", replacement: path.resolve(__dirname, "../www/src/flags.ts") },
		],
		dedupe: ["jotai", "react", "react-dom"],
	},
});
