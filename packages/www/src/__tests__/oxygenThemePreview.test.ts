import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ScriptTarget, transpileModule } from "typescript";

const scripts = Object.fromEntries(
	["oxygen_builder", "oxygen6_builder"].map((name) => [
		name,
		transpileModule(
			readFileSync(resolve(__dirname, `../../../builder-integrations/src/${name}.ts`), "utf8"),
			{ compilerOptions: { target: ScriptTarget.ES2017 } },
		).outputText,
	]),
);

// Run the actual entry scripts in isolated builder/canvas windows. Other addon
// features are disabled so these tests exercise the theme controls and iframe lifecycle.
describe.each(["oxygen_builder", "oxygen6_builder"])("%s theme preview", (name) => {
	let host: HTMLIFrameElement;
	let builder: Window;
	let canvas: HTMLIFrameElement;

	async function boot(mode: string, saved: string | null = null, systemDark = false) {
		host = document.createElement("iframe");
		const loaded = new Promise<void>((resolve) => { host.onload = () => resolve(); });
		document.body.appendChild(host);
		await loaded;
		builder = host.contentWindow!;
		builder.document.body.innerHTML = '<div class="oxygen-toolbar-panel topbar-section"></div><div id="oxy-page-loader"></div>';
		canvas = builder.document.createElement("iframe");
		canvas.id = name === "oxygen_builder" ? "ct-artificial-viewport" : "iframe";
		builder.document.body.appendChild(canvas);
		const runtime = name === "oxygen_builder" ? builder : canvas.contentWindow!;
		runtime.localStorage.clear();
		if (saved) runtime.localStorage.setItem("cf-theme", saved);
		Object.assign(runtime, {
			core_framework_connector: { theme_mode: mode, oxygen_enable_dark_mode_preview: true },
			coreframework: { core_api_url: "https://example.test/" },
			matchMedia: () => ({ matches: systemDark }),
			fetch: async () => ({ ok: true, json: async () => ({}) }),
		});
		// Window.eval evaluates within the same realm as this builder's DOM.
		(runtime as Window & { eval: (script: string) => void }).eval(scripts[name]);
		if (name === "oxygen_builder") runtime.document.dispatchEvent(new Event("DOMContentLoaded"));
		canvas.dispatchEvent(new Event("load"));
		await new Promise((resolve) => setTimeout(resolve, 15));
	}

	function button() {
		return builder.document.querySelector<HTMLElement>(".cf-theme-toggle-button-builder, .cf-theme-toggle")!;
	}
	function expectTheme(theme: "dark" | "light") {
		for (const html of [builder.document.documentElement, canvas.contentDocument!.documentElement]) {
			expect(html.classList.contains(`cf-theme-${theme}`)).toBe(true);
			expect(html.classList.contains(`cf-theme-${theme === "dark" ? "light" : "dark"}`)).toBe(false);
		}
	}
	afterEach(() => { host?.remove(); });

	test("the first click switches a dark default to light and keeps the builder in sync", async () => {
		await boot("dark");
		expectTheme("dark");
		button().click();
		expectTheme("light");
		expect(builder.localStorage.getItem("cf-theme")).toBe("light");
		button().click();
		expectTheme("dark");
		canvas.dispatchEvent(new Event("load"));
		await new Promise((resolve) => setTimeout(resolve, 15));
		expectTheme("dark");
	});

	test.each([true, false])("resolves an automatic default (system dark=%s)", async (dark) => {
		await boot("auto", null, dark);
		expectTheme(dark ? "dark" : "light");
	});

	test("resolves a saved automatic preference instead of adding cf-theme-auto", async () => {
		await boot("light", "auto", true);
		expectTheme("dark");
	});

	test("honors a saved light preference over a dark default", async () => {
		await boot("dark", "light");
		expectTheme("light");
	});
});
