import { act, createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider, createStore, type PrimitiveAtom } from "jotai";
import { toast } from "sonner";

// The WP shell has its own globals and aliases, checked by build:wp.
// Runtime imports keep that separate type environment out of the web build.
const { FontsTab } = require("../../../wp/src/components/modules/fonts/FontsTab") as { FontsTab: ComponentType };
const { fontsDataAtom } = require("../../../wp/src/state") as { fontsDataAtom: PrimitiveAtom<{ fonts: Record<string, unknown>[] }> };

jest.mock("../../../wp/src/state", () => {
	const { atom } = jest.requireActual("jotai");
	return { fontsDataAtom: atom({ fonts: [] }) };
});
jest.mock("../../../wp/src/components/ClassSectionHeading", () => ({ ClassSectionHeading: () => null }));
jest.mock("../../../wp/src/components/modules/fonts/components/FontsList", () => ({ FontsList: () => null }));
jest.mock("../../../wp/src/components/modules/fonts/ImportGoogleFonts", () => ({ ImportGoogleFonts: () => null }));
jest.mock("../../../wp/src/components/modules/fonts/ImportCustomFonts", () => ({
	ImportCustomFonts: ({ setSelectedVariants, downloadFontsLocally }: { setSelectedVariants: (variants: string[]) => void; downloadFontsLocally: (font: unknown) => Promise<void> }) =>
		createElement("div", null, createElement("button", {
			onClick: () => {
				setSelectedVariants(["400normal"]);
			},
		}, "Select file"),
		createElement("button", { onClick: (event: Event) => {
			event.stopPropagation();
			return downloadFontsLocally({ family: "Local Test Font", title: "Local Test Font", category: "custom-font",
				files: { "400normal": "data:font/woff2;base64,d09GMg==" },
				variants: [{ id: "400normal", cssSelector: "", comment: "", fontDisplay: "auto" }],
				customSelectors: "", customVariable: "" });
		} }, "Add Font")),
}));
jest.mock("../../../wp/src/components/modules/fonts/utils/utils", () => {
	Object.assign(globalThis, { TextEncoder: require("node:util").TextEncoder, TextDecoder: require("node:util").TextDecoder });
	return jest.requireActual("../../../wp/src/components/modules/fonts/utils/utils");
});
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const originalFetch = globalThis.fetch;
let root: Root;
let container: HTMLDivElement;
let store: ReturnType<typeof createStore>;
const fetchMock = jest.fn();

beforeEach(async () => {
	jest.clearAllMocks();
	jest.spyOn(console, "error").mockImplementation(() => {});
	globalThis.fetch = fetchMock;
	Object.assign(window, {
		coreframework: { core_api_url: "https://example.test/wp-json/core-framework/v2/" },
		wpApiSettings: { nonce: "test-nonce" },
	});
	fetchMock.mockImplementation(async (url: string) => {
		if (url.includes("googleapis.com")) throw new Error("This local font is not on Google Fonts");
		return { ok: true, json: async () => ({ success: true }) };
	});
	store = createStore();
	container = document.createElement("div");
	root = createRoot(container);
	await act(async () => root.render(createElement(Provider, { store }, createElement(FontsTab))));
});

afterEach(() => {
	act(() => root.unmount());
	globalThis.fetch = originalFetch;
	jest.restoreAllMocks();
});

async function click(text: string) {
	const button = [...container.querySelectorAll("button")].find((button) => button.textContent === text || button.firstChild?.textContent === text);
	if (!button) throw new Error(`Missing button: ${text}`);
	await act(async () => button.click());
}

test("uploads the selected local file without replacing it with a Google Fonts lookup", async () => {
	await click("Import Local Font");
	await click("Select file");
	await click("Add Font");
	expect(fetchMock).toHaveBeenCalledTimes(1);
	expect(fetchMock).toHaveBeenCalledWith("https://example.test/wp-json/core-framework/v2/upload-fonts", expect.objectContaining({
		method: "POST",
		body: JSON.stringify({ fonts: [{ font_base64: "d09GMg==", filename: "Local-Test-Font-400normal.woff2" }] }),
	}));
	expect(store.get(fontsDataAtom).fonts).toEqual([expect.objectContaining({ family: "Local Test Font", category: "custom-font" })]);
	expect(toast.success).toHaveBeenCalledWith("Font added successfully");
	expect(toast.error).not.toHaveBeenCalled();
});

test("keeps a failed local upload out of the project and reports a custom-font error", async () => {
	fetchMock.mockResolvedValue({ ok: false, status: 500 });
	await click("Import Local Font");
	await click("Select file");
	await click("Add Font");
	expect(store.get(fontsDataAtom).fonts).toEqual([]);
	expect(toast.success).not.toHaveBeenCalled();
	expect(toast.error).toHaveBeenCalledWith("Could not upload the selected custom font");
});
