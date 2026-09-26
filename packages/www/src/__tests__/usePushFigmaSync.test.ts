import { updateClasses, updateColors } from "functions/wpdb-proxy";
import { usePushFigmaSync } from "hooks/usePushFigmaSync";
import { renderHook } from "./renderHook";

// Saving from the Figma plugin refreshes the connected site's Bricks/Oxygen
// class and color lists. The WordPress plugin's own save passes the project's
// class and variable prefixes to that refresh; the Figma path did not, so a
// prefixed project synced unprefixed class names and color variables.

jest.mock("state", () => {
	const { atom } = jest.requireActual("jotai");
	return {
		joinedStylesAtom: atom([
			{ selector: ".btn", properties: {} },
			{ selector: ".card", properties: {} },
			{ selector: ":root", properties: {} },
		]),
		presetPreferencesSelector: atom({ min_screen_width: 320, max_screen_width: 1400 }),
		colorSystemFormDataAtom: atom({ groups: [{ colors: [{ isDarkMode: true }] }] }),
	};
});

jest.mock("functions/wpdb-proxy", () => ({
	updateClasses: jest.fn().mockResolvedValue(true),
	updateColors: jest.fn().mockResolvedValue(true),
	updateGroupedClasses: jest.fn().mockResolvedValue(true),
	updatePrefixedCssFile: jest.fn().mockResolvedValue(true),
	saveOxygenCssHelper: jest.fn().mockResolvedValue(true),
}));

jest.mock("functions/getClassNamesGroupedByGroups", () => ({
	getClassNamesGroupedByGroups: () => ({}),
}));

jest.mock("components/modules/components/Components.editor", () => ({
	getFirstSelector: (selector: string) => selector.split(",")[0].trim(),
}));

jest.mock("components/modules/colorSystem/functions/generateColorSystemVariables", () => ({
	generateColorSystemVariables: jest.fn().mockResolvedValue([]),
	getTransparentVariable: jest.fn(),
}));

jest.mock("cssGenerator", () => ({
	cssGenerator: jest.fn().mockResolvedValue(""),
}));

const preset = {
	id: "preset",
	classPrefix: "cf-",
	variablePrefix: "v-",
	modulesData: {
		COLOR_SYSTEM: {
			groups: [{ colors: [{ id: "c1", name: "primary", value: "#ff0000" }] }],
		},
	},
} as unknown as Preset;

test("syncs builder classes with the project's class prefix", async () => {
	const { result, unmount } = renderHook(() => usePushFigmaSync());

	await result.current.handleFigmaPushSync({ preset, url: "https://example.test", apiKey: "key" });

	expect(updateClasses).toHaveBeenCalledWith(
		expect.objectContaining({ classes: "cf-btn,cf-card,cf-theme-inverted" }),
	);
	unmount();
});

test("syncs builder colors with the project's variable prefix", async () => {
	const { result, unmount } = renderHook(() => usePushFigmaSync());

	await result.current.handleFigmaPushSync({ preset, url: "https://example.test", apiKey: "key" });

	expect(updateColors).toHaveBeenCalledWith(
		expect.objectContaining({
			colors: [expect.objectContaining({ name: "primary", raw: "var(--v-primary)" })],
		}),
	);
	unmount();
});
