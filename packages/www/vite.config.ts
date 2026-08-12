import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	build: {
		target: "ES2022",
	},

	resolve: {
		alias: [
			// Force ALL jotai entry points to their ESM (.mjs) files so that Vite
			// never resolves them to the CJS files. The CJS versions use dynamic
			// Object.defineProperty exports that esbuild cannot statically analyze,
			// causing "does not provide an export named 'useAtom'" crashes in dev
			// mode.
			//
			// IMPORTANT: The bare `jotai` alias uses a regex exact-match (/^jotai$/)
			// rather than a plain string. Plain string aliases do prefix replacement,
			// so "jotai" would also match "jotai/react" and rewrite it to
			// "index.mjs/react" (a non-existent path). The regex ensures only the
			// exact specifier "jotai" is matched; sub-paths like "jotai/react" fall
			// through to their own more-specific aliases below.
			{
				find: /^jotai$/,
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/index.mjs",
				),
			},
			{
				find: "jotai/index",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/index.mjs",
				),
			},
			{
				find: "jotai/utils",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/utils.mjs",
				),
			},
			{
				find: "jotai/react/utils",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/react/utils.mjs",
				),
			},
			{
				find: "jotai/react",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/react.mjs",
				),
			},
			{
				find: "jotai/vanilla/internals",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/vanilla/internals.mjs",
				),
			},
			{
				find: "jotai/vanilla/utils",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/vanilla/utils.mjs",
				),
			},
			{
				find: "jotai/vanilla",
				replacement: path.resolve(
					__dirname,
					"../../node_modules/jotai/esm/vanilla.mjs",
				),
			},
			{
				find: "@core-framework/core",
				replacement: path.resolve(__dirname, "../core/src"),
			},
			{
				find: "cssGenerator",
				replacement: path.resolve(__dirname, "../core/src/cssGenerator"),
			},
			{ find: "functions", replacement: path.resolve(__dirname, "src/functions") },
			{ find: "utils", replacement: path.resolve(__dirname, "src/utils") },
			{
				find: "components",
				replacement: path.resolve(__dirname, "src/components"),
			},
			{
				find: "constants",
				replacement: path.resolve(__dirname, "src/constants"),
			},
			{ find: "data", replacement: path.resolve(__dirname, "src/data") },
			{ find: "assets", replacement: path.resolve(__dirname, "src/assets") },
			{ find: "hooks", replacement: path.resolve(__dirname, "src/hooks") },
			{ find: "state", replacement: path.resolve(__dirname, "src/state") },
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
