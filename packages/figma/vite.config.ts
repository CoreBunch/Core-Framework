import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), viteSingleFile()],
	assetsInclude: ["**/*.md"],
	build: {
		emptyOutDir: false,
		cssCodeSplit: false,
	},
});
