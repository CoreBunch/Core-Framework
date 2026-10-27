import { colord } from "colord";
import { prepareColorSystem as prepareWebColors } from "functions/preparePresetToLoad";
import { prepareColorSystem as prepareWordPressColors } from "../../../../../../../wp/src/functions/preparePresetToLoad";
import { colorItemSchema, colorSystemSchema } from "../../schema/colorSystem.schema";
import { ColorItem, ColorSystemFormData, ColorVariable } from "../../types";
import { colorGroupsToVariables } from "../colorGroupsToVariables";
import { refreshColorReferences, refreshColorSystemReferences } from "../refreshColorReferences";
import { singleColorReducer } from "../singleColorReducer";
import { updateColorVariation, updateColorVariations } from "../updateColorVariations";

const purple = "hsla(242, 78%, 69%, 1)";
const pink = "hsla(354, 78%, 69%, 1)";
const body: ColorItem = { id: "body", name: "bg-body", value: purple, format: "hsla" };
const light: ColorItem = { id: "light", name: "light", value: "var(--bg-body)", format: "raw" };
const form = (...colors: ColorItem[]): ColorSystemFormData => ({
	groups: [{ id: "g", name: "Colors", colors }],
});
const variables = (...colors: ColorItem[]) => colorGroupsToVariables(form(...colors)) as ColorVariable[];
const oldVariables = variables(body);
const newBody = { ...body, value: pink };
const newVariables = variables(newBody);
const generate = (vars = oldVariables) => updateColorVariations(light, "shade", true, 4, vars);
const roundTrip = (color: ColorItem) => colorItemSchema.parse(JSON.parse(JSON.stringify(color)));

test("an edited block survives save/load repair while automatic blocks follow the source", () => {
	const generated = generate();
	const edited = updateColorVariation(generated, "shade", 1, "#123456");
	expect(edited.shades!.map((item) => item.isCustom)).toEqual([false, true, false, false]);
	const saved = roundTrip(edited);
	const state = form(newBody, saved);
	const repaired = refreshColorSystemReferences(state);
	const result = repaired.groups[0].colors[1];
	const expected = generate(newVariables);
	expect(result.shades![0]).toEqual(expected.shades![0]);
	expect(result.shades![1]).toEqual(saved.shades![1]);
	expect(result.shades![2]).toEqual(expected.shades![2]);
	expect(state.groups[0].colors[1]).toEqual(saved);
	expect(refreshColorSystemReferences(repaired)).toBe(repaired);
	expect(colorSystemSchema.parse(repaired).groups[0].colors[1].shades).toEqual(result.shades);
});

test("opening a picker without changing its colour does not mark a generated block custom", () => {
	const generated = generate();
	expect(updateColorVariation(generated, "shade", 0, colord(generated.shades![0].value).toRgbString())).toBe(
		generated,
	);
});

test("Reset releases a custom block back to automatic generation, including after a reload", () => {
	const generated = generate();
	const edited = updateColorVariation(generated, "shade", 1, "#123456");
	const reset = updateColorVariation(edited, "shade", 1, generated.shades![1].value, false, true);
	expect(reset.shades![1].isCustom).toBe(false);
	const reloaded = refreshColorReferences(roundTrip(reset), newVariables, newVariables);
	expect(reloaded.shades).toEqual(generate(newVariables).shades);
});

test("explicit custom colours are retained even if they match a later automatic colour", () => {
	const generated = generate();
	const futureValue = generate(newVariables).shades![0].value;
	const edited = updateColorVariation(generated, "shade", 0, futureValue);
	const pinkState = refreshColorReferences(edited, oldVariables, newVariables);
	const purpleState = refreshColorReferences(roundTrip(pinkState), newVariables, oldVariables);
	expect(purpleState.shades![0]).toEqual(edited.shades![0]);
	expect(purpleState.shades![1]).toEqual(generated.shades![1]);
});

test.each([0, 4])("legacy blocks with count %s are not guessed to be automatic", (count) => {
	const generated = generate();
	const legacy = {
		...generated,
		shadesNumber: count,
		shades: generated.shades!.map(({ name, value }) => ({ name, value })),
	};
	legacy.shades[1].value = "#123456";
	const state = form(newBody, legacy);
	expect(refreshColorSystemReferences(state)).toBe(state);
	const resized = updateColorVariations(legacy, "shade", true, 7, newVariables);
	expect(resized.shades!.slice(0, 4)).toEqual(legacy.shades);
	expect(resized.shades).toHaveLength(7);
	expect(resized.shades![4].isCustom).toBe(false);
});

test("a mixed tracked/legacy row repairs only the tracked automatic blocks on load", () => {
	const generated = generate();
	delete generated.shades![1].isCustom;
	const next = refreshColorReferences(generated, newVariables, newVariables);
	expect(next.shades![0]).toEqual(generate(newVariables).shades![0]);
	expect(next.shades![1].value).toBe(generated.shades![1].value);
	expect(next.shades![1].isCustom).toBe(true);
});

test("dark shades and light tints retain their independent manual edits during load repair", () => {
	const oldVars = variables({ ...body, isDarkMode: true, darkValue: pink });
	const newVars = variables({ ...body, value: pink, isDarkMode: true, darkValue: purple });
	let color = updateColorVariations(
		{ ...light, isDarkMode: true, darkValue: "var(--bg-body)" },
		"shade",
		true,
		4,
		oldVars,
	);
	color = updateColorVariations(color, "tint", true, 3, oldVars);
	color = updateColorVariation(color, "shade", 1, "#123456", true);
	color = updateColorVariation(color, "tint", 0, "#abcdef");
	const next = refreshColorReferences(roundTrip(color), newVars, newVars);
	expect(next.darkShades![1]).toEqual(color.darkShades![1]);
	expect(next.tints![0]).toEqual(color.tints![0]);
	expect(next.darkShades![0].value).not.toBe(color.darkShades![0].value);
	expect(next.tints![1].value).not.toBe(color.tints![1].value);
});

test("load repair settles aliases that reference another generated block", () => {
	const source = generate();
	const alias = updateColorVariations(
		{ ...light, id: "alias", name: "alias", value: "var(--light-d-1)" },
		"shade",
		true,
		3,
		variables(body, source),
	);
	const next = refreshColorSystemReferences(form(newBody, alias, source));
	const expectedSource = generate(newVariables);
	const expectedAlias = updateColorVariations(
		{ ...alias, shades: [] },
		"shade",
		true,
		3,
		variables(newBody, expectedSource),
	);
	expect(next.groups[0].colors[1].shades).toEqual(expectedAlias.shades);
	expect(next.groups[0].colors[2].shades).toEqual(expectedSource.shades);
	expect(refreshColorSystemReferences(next)).toBe(next);
});

test("unresolved references do not erase saved custom colours", () => {
	const color = updateColorVariation(generate(), "shade", 0, "#123456");
	const next = singleColorReducer(color, {
		type: "updateColor",
		payload: { value: "var(--missing)", colorVariables: newVariables },
	});
	expect(next.shades).toEqual(color.shades);
});

test.each([prepareWebColors, prepareWordPressColors])(
	"preset loading repairs tracked colours before the version guard",
	(prepare) => {
		const edited = updateColorVariation(generate(), "shade", 1, "#123456");
		const state = form(newBody, roundTrip(edited));
		const prepared = prepare({ app_version: "99.0.0", modulesData: { COLOR_SYSTEM: state } } as Preset);
		expect(prepared.modulesData!.COLOR_SYSTEM!.groups[0].colors[1].shades![0]).toEqual(
			generate(newVariables).shades![0],
		);
		expect(prepared.modulesData!.COLOR_SYSTEM!.groups[0].colors[1].shades![1]).toEqual(edited.shades![1]);
	},
);

test.each([prepareWebColors, prepareWordPressColors])(
	"old preset polyfills preserve unclassified blocks with a zero count",
	(prepare) => {
		const legacy = {
			...generate(),
			shadesNumber: 0,
			shades: generate().shades!.map(({ name, value }) => ({ name, value })),
		};
		legacy.shades[1].value = "#123456";
		const prepared = prepare({
			app_version: "1.0.0",
			modulesData: { COLOR_SYSTEM: form(newBody, legacy) },
		} as Preset);
		const result = prepared.modulesData!.COLOR_SYSTEM!.groups[0].colors[1];
		expect(result.shades).toEqual(legacy.shades);
		expect(result.shadesNumber).toBe(4);
	},
);
