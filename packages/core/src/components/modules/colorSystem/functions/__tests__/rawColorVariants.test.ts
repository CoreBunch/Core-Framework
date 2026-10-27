import { colord } from "colord";
import { ColorItem, ColorSystemFormData, ColorVariable } from "../../types";
import { colorGroupsToVariables } from "../colorGroupsToVariables";
import { generateColorSystemVariables, getTransparentVariable } from "../generateColorSystemVariables";
import { getColor } from "../getColor";
import { getColorOnIndex } from "../getColorOnIndex";
import { refreshColorReferences } from "../refreshColorReferences";
import { singleColorReducer } from "../singleColorReducer";
import { updateColorVariation, updateColorVariations } from "../updateColorVariations";

const purple = "hsla(242, 78%, 69%, 1)";
const pink = "hsla(354, 78%, 69%, 1)";
const body: ColorItem = { id: "body", name: "bg-body", value: pink, format: "hsla" };
const light: ColorItem = {
	id: "light",
	name: "light",
	value: "var(--bg-body)",
	format: "raw",
	transparent: true,
	transparentVariables: [80],
};
const form = (...colors: ColorItem[]): ColorSystemFormData => ({
	groups: [{ id: "group", name: "Colors", colors }],
});
const variables = (...colors: ColorItem[]) => colorGroupsToVariables(form(...colors)) as ColorVariable[];
const declarations = (state: ColorSystemFormData, dark = false) =>
	Object.fromEntries(
		generateColorSystemVariables({ colorSystemState: state })[dark ? 1 : 0].declarations.map(
			({ property, value }) => [property, value],
		),
	);

test("transparency uses the supplied colours without a Preview CSS window snapshot", () => {
	const previous = (window as any).colorVariables;
	try {
		for (const snapshot of [undefined, variables({ ...body, value: purple })]) {
			(window as any).colorVariables = snapshot;
			const css = declarations(form(body, light));
			expect(css["--light"]).toBe("var(--bg-body)");
			expect(css["--light-80"]).toBe("#ee727fcc");
			expect(getTransparentVariable(light, 80, true, false, false, variables(body))?.value).toBe("#ee727fcc");
		}
	} finally {
		(window as any).colorVariables = previous;
	}
});

test("transparency follows nested references and successive base colour changes", () => {
	const alias = { ...light, id: "alias", name: "alias", value: "var(--light)" };
	expect(declarations(form({ ...body, value: purple }, light, alias))["--alias-80"]).toBe("#7672eecc");
	expect(declarations(form(body, light, alias))["--alias-80"]).toBe("#ee727fcc");
});

test("dark references use the dark source, falling back to an unchanged light source", () => {
	const darkLight = { ...light, isDarkMode: true, darkValue: "var(--bg-body)" };
	expect(
		declarations(form({ ...body, isDarkMode: true, darkValue: purple }, darkLight), true)["--light-80"],
	).toBe("#7672eecc");
	expect(declarations(form(body, darkLight), true)["--light-80"]).toBe("#ee727fcc");
});

test.each(["var(--theme-color)", "var(--theme-color, #ee727f)"])(
	"preserves externally supplied RAW %s and saved variants without inventing transparency",
	(value) => {
		const external: ColorItem = {
			...light,
			value,
			isDarkMode: true,
			darkValue: value,
			isShades: true,
			shades: [{ name: "light-d-1", value: "#123456" }],
			darkShades: [{ name: "light-d-1", value: "#654321" }],
		};
		for (const dark of [false, true]) {
			const css = declarations(form(external), dark);
			expect(css["--light"]).toBe(value);
			expect(css["--light-d-1"]).toBe(dark ? "#654321" : "#123456");
			expect(css["--light-80"]).toBeUndefined();
		}
	},
);

test.each(["var(--missing)", "var(--light)", "var(--loop)"])(
	"unresolved/circular %s does not generate black transparency",
	(value) => {
		const invalid = { ...light, value };
		const loop = { ...body, name: "loop", value: "var(--light)" };
		expect(declarations(form(invalid, loop))["--light-80"]).toBeUndefined();
		expect(getTransparentVariable(invalid, 80, false, false, false, variables(invalid, loop))).toBeNull();
	},
);

test.each(["shade", "tint"] as const)(
	"%s count follows 4 → 7 → 3 for references and literal formats",
	(type) => {
		for (const input of [
			light,
			{ ...light, format: "hsla", value: pink },
			{ ...light, format: "rgb", value: "rgb(238, 114, 127)" },
			{ ...light, value: "#ee727f" },
		] as ColorItem[]) {
			let color = input;
			for (const count of [4, 7, 3]) {
				color = updateColorVariations(color, type, true, count, variables(body));
				const items = type === "shade" ? color.shades! : color.tints!;
				expect(type === "shade" ? color.shadesNumber : color.tintsNumber).toBe(count);
				expect(items).toHaveLength(count);
				expect(items.every((item) => colord(item.value).isValid())).toBe(true);
				expect(items.map((item) => item.name)).toEqual(
					Array.from({ length: count }, (_, i) => `light-${type === "shade" ? "d" : "l"}-${i + 1}`),
				);
			}
		}
	},
);

test("changing the shade count leaves the tint count and custom tint untouched", () => {
	let color = updateColorVariations(light, "tint", true, 4, variables(body));
	color = updateColorVariation(color, "tint", 0, "#123456");
	const next = updateColorVariations(color, "shade", true, 7, variables(body));
	expect(next.shades).toHaveLength(7);
	expect(next.tintsNumber).toBe(4);
	expect(next.tints).toEqual(color.tints);
});

test("dark variant counts and reset values resolve the correct reference", () => {
	const vars = variables({ ...body, isDarkMode: true, darkValue: purple });
	const color = updateColorVariations(
		{ ...light, isDarkMode: true, darkValue: "var(--bg-body)" },
		"shade",
		true,
		7,
		vars,
	);
	expect(color.shades).toHaveLength(7);
	expect(color.darkShades).toHaveLength(7);
	expect(
		colord(getColorOnIndex({ state: color, type: "shade", index: 0, colorVariables: vars })).toHex(),
	).toBe(color.shades![0].value);
	expect(
		colord(
			getColorOnIndex({ state: color, type: "shade", index: 0, dark: true, colorVariables: vars }),
		).toHex(),
	).toBe(color.darkShades![0].value);
	expect(color.darkShades![0].value).not.toBe(color.shades![0].value);
});

test("referenced colour changes regenerate automatic variants and retain manual overrides", () => {
	const oldVars = variables({ ...body, value: purple });
	const newVars = variables(body);
	let color = updateColorVariations(light, "shade", true, 4, oldVars);
	color = updateColorVariations(color, "tint", true, 4, oldVars);
	color = updateColorVariation(color, "shade", 1, "#123456");
	const next = singleColorReducer(color, {
		type: "refreshReferences",
		payload: { previousVariables: oldVars, colorVariables: newVars },
	});
	expect(next.value).toBe("var(--bg-body)");
	expect(next.shades![0].value).not.toBe(color.shades![0].value);
	expect(next.tints![0].value).not.toBe(color.tints![0].value);
	expect(next.shades![1].value).toBe("#123456");
	expect(next.shades).toHaveLength(4);
	expect(refreshColorReferences(next, newVars, newVars)).toBe(next);
	const resized = updateColorVariations(next, "shade", true, 7, newVars);
	expect(resized.shades).toHaveLength(7);
	expect(resized.shades![1].value).toBe("#123456");
});

test("changing an alias reference directly regenerates using both old and new resolved colours", () => {
	const vars = variables(body, { ...body, name: "other", value: purple });
	const color = updateColorVariations(light, "shade", true, 4, vars);
	const next = singleColorReducer(color, {
		type: "updateColor",
		payload: { value: "var(--other)", colorVariables: vars },
	});
	expect(next.shades![0].value).not.toBe(color.shades![0].value);
	expect(getColor(next.value, vars)).toBe(purple);
});

test("invalid references clear obsolete swatches without replacing the requested count with zero", () => {
	const color = updateColorVariations(light, "shade", true, 4, variables(body));
	const next = updateColorVariations(
		{ ...color, value: "var(--missing)" },
		"shade",
		true,
		7,
		variables(body),
	);
	expect(next.shadesNumber).toBe(7);
	expect(next.shades).toEqual([]);
});

test("a saved zero count can regenerate tracked automatic swatches", () => {
	const stale = updateColorVariations(light, "shade", true, 4, variables({ ...body, value: purple }));
	const next = updateColorVariations({ ...stale, shadesNumber: 0 }, "shade", true, 7, variables(body));
	const expected = updateColorVariations(light, "shade", true, 7, variables(body));
	expect(next.shadesNumber).toBe(7);
	expect(next.shades).toEqual(expected.shades);
});
