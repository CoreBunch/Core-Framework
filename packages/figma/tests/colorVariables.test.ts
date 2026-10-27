import { expect, test } from "bun:test";
import { getColorVariables } from "../src/colors/getColorVariables";
import type { Preset } from "../src/types";

const colorVariables = [
	{ name: "brand-navy", colorValue: "#0a2545", colorDarkValue: "#ffffff" },
];

function variables(color: Record<string, unknown>) {
	const preset = {
		modulesData: {
			COLOR_SYSTEM: { groups: [{ name: "Brand", colors: [{ name: "ink", ...color }] }] },
		},
	} as Preset;
	return getColorVariables({ preset, colorVariables });
}

test("exports a RAW reference without a dark value, including transparent variants", () => {
	expect(
		variables({ value: "var(--brand-navy)", transparent: true, transparentVariables: [50] }),
	).toEqual([
		{
			variable: "Colors/Brand/ink",
			type: "COLOR",
			value: { r: 10 / 255, g: 37 / 255, b: 69 / 255, a: 1 },
			webSyntax: "var(--ink)",
		},
		{
			variable: "Colors/Brand/ink-50",
			type: "COLOR",
			value: { r: 10 / 255, g: 37 / 255, b: 69 / 255, a: 0.5 },
			webSyntax: "var(--ink-50)",
		},
	]);
});

for (const darkValue of [undefined, null, ""]) {
	test(`does not resolve an absent dark value (${darkValue})`, () => {
		expect(variables({ value: "var(--brand-navy)", isDarkMode: true, darkValue })).toHaveLength(1);
	});
}

for (const value of ["#0a2545", "var(--brand-navy)"]) {
	for (const darkValue of ["#ffffff", "var(--brand-navy)"]) {
		test(`resolves light ${value} and dark ${darkValue} independently`, () => {
			const result = variables({ value, darkValue, isDarkMode: true });
			expect(result[0].value).toEqual({ r: 10 / 255, g: 37 / 255, b: 69 / 255, a: 1 });
			expect(result[1].variable).toBe("Dark Colors/Brand/ink");
			expect(result[1].value).toEqual({ r: 1, g: 1, b: 1, a: 1 });
		});
	}
}

test("does not export dark variables when dark mode is disabled", () => {
	expect(
		variables({ value: "var(--brand-navy)", darkValue: "var(--brand-navy)", isDarkMode: false }),
	).toHaveLength(1);
});
