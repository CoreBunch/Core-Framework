import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

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
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/index.mjs"),
			},
			{
				find: "jotai/index",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/index.mjs"),
			},
			{
				find: "jotai/utils",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/utils.mjs"),
			},
			{
				find: "jotai/react/utils",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/react/utils.mjs"),
			},
			{
				find: "jotai/react",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/react.mjs"),
			},
			{
				find: "jotai/vanilla/internals",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/vanilla/internals.mjs"),
			},
			{
				find: "jotai/vanilla/utils",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/vanilla/utils.mjs"),
			},
			{
				find: "jotai/vanilla",
				replacement: path.resolve(__dirname, "../../node_modules/jotai/esm/vanilla.mjs"),
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
		dedupe: [
			"jotai",
			"react",
			"react-dom",
			"@react-spectrum/provider",
			"@react-aria/utils",
			"@react-aria/ssr",
			"@react-stately/utils",
			"@react-spectrum/utils",
			"react-aria-components",
			"@codemirror/state",
			"@codemirror/view",
			"@codemirror/language",
			"@codemirror/autocomplete",
			"@codemirror/commands",
			"@codemirror/lint",
			"@codemirror/lang-css",
			"@lezer/common",
			"@lezer/highlight",
			"@lezer/lr",
			"@lezer/css",
		],
	},
});
