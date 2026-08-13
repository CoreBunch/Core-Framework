import react from "@vitejs/plugin-react-swc";
import "dotenv/config";
import fs from "fs";
import { cyan, green, red, yellow } from "kolorist";
import { resolve } from "path";
import { defineConfig } from "vite";
import liveReload from "vite-plugin-live-reload";
import tsconfigPaths from "vite-tsconfig-paths";

const rootpath = "./src";

// TODO: Check for 'development' APP_ENV variable
if (!process.env.APP_ENV) {
	process.stdout.write(`  ${red("Missing: APP_ENV")}\n`);
	fs.writeFileSync(".env", "APP_ENV='development'\n", { flag: "a" });
	process.stdout.write(`  ${green("Created: APP_ENV='development'")}\n`);
	process.stdout.write(`  ${yellow("Please, start project again.")}\n`);
	process.exit(1);
}

const { CERT_PATH, HOME: HOME_DIR, DEV_URL: HOST, DEV_PROTOCOL: PROTOCOL } = process.env;
const isHttpS = PROTOCOL === "https";
const target = "es2020";

process.stdout.write(`\n  ${cyan(`MODE: ${process.env.APP_ENV}`)}\n`);

const certs =
	process.env.APP_ENV === "development" && isHttpS && HOME_DIR && CERT_PATH && HOST
		? {
				key: fs.readFileSync(`${HOME_DIR}${CERT_PATH}${HOST}.key`),
				cert: fs.readFileSync(`${HOME_DIR}${CERT_PATH}${HOST}.crt`),
			}
		: undefined;

export default defineConfig(async ({ command, mode }) => {
	//const env = loadEnv(mode, process.cwd(), "");

	return {
		root: rootpath,
		base: process.env.APP_ENV === "development" ? "/" : "/wp-content/plugins/core-framework/dist/",
		build: {
			target,
			manifest: true,
			emptyOutDir: true,
			outDir: resolve(__dirname, "dist"),
			minify: true,
			sourcemap: false,
			chunkSizeWarningLimit: 2000,
			watch: command === "serve" ? {} : false,
			assetsDir: "",
			rollupOptions: {
				input: {
					main: resolve(__dirname, `${rootpath}/main.tsx`),
				},
				treeshake: true,
				//input: ["js/app.js"],
				//output: { entryFileNames: `[name].js` },
			},
			assetsInlineLimit: 40 * 1024, // 40kb
		},
		server: {
			host: HOST,
			cors: true,
			strictPort: true,
			port: 5173,
			https: isHttpS ? certs : undefined,
			origin: `${PROTOCOL}://${HOST}:5173`,
			hmr: {
				port: 5173,
				host: HOST,
				protocol: isHttpS ? "wss" : "ws",
			},
			watch: {
				// ignore all dot files, e.g. .cache, .mypy_cache
				ignored: [/\/\.(.+?)\/?/],
			},
			//proxy: {
			//	"/": {
			//		target: "http://hakken.local/",
			//		changeOrigin: true,
			//		secure: false,
			//		configure: (proxy, options) => {},
			//	},
			//},
		},
		css: { devSourcemap: false },
		esbuild: {
			//loader: "jsx",
			//include: /src\/.*\.jsx?$/,
			loader: "tsx",
			include: /src\/.*\.[tj]sx?$/,
			exclude: [],
			//jsxFactory: "h",
			//jsxFragment: "Fragment",
		},
		optimizeDeps: {
			esbuildOptions: {
				target,
			},
		},
		resolve: {
			dedupe: ["jotai", "react", "react-dom"],
			alias: {
				"@": resolve(__dirname, "src"),
				"@Views": resolve(__dirname, "src/views"),
				"@Constants": resolve(__dirname, "src/constants"),
				process: "process/browser",
				"@core-framework/core": resolve(__dirname, "../core/src"),
				cssGenerator: resolve(__dirname, "../core/src/cssGenerator"),
				functions: resolve(__dirname, "src/functions"),
				utils: resolve(__dirname, "src/utils"),
				components: resolve(__dirname, "src/components"),
				constants: resolve(__dirname, "src/constants"),
				data: resolve(__dirname, "src/data"),
				assets: resolve(__dirname, "src/assets"),
				hooks: resolve(__dirname, "src/hooks"),
				state: resolve(__dirname, "src/state"),
			},
		},
		plugins: [
			react(),
			{
				...liveReload([`${__dirname}/**/*.php`]),
				apply: "serve", // build or serve
				//enforce: "pre", // pre or post
			},
			tsconfigPaths(),
		],
		clearScreen: false,
	};
});
