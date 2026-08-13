import react from "@vitejs/plugin-react-swc";
import { createRequire } from "node:module";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const require = createRequire(import.meta.url);
const jotaiRoot = path.dirname(require.resolve("jotai/package.json"));

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
		dedupe: ["jotai", "react", "react-dom"],
	},
});
