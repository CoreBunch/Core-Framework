import { DEFAULT_PRESET } from "data/presets";
import {
	combinedPresetSchema,
	cssDeclarationSchema,
	groupsSchema,
	presetPreferencesSchema,
} from "@core-framework/core/schema/preset.schema";
import {
	oldSpacingSchema,
	spacingGroupSchema,
} from "@core-framework/core/components/modules/spacing/schema/SpacingCalculator.schema";
import {
	oldFluidTypographySchema,
	fluidTypographyGroupSchema,
} from "@core-framework/core/components/modules/typography/schema/fluidTypographyCalculator.schema";
import { spacingGroupSchema as figmaSpacingSchema } from "../../../figma/src/spacing/schema/SpacingCalculator.schema";
import { fluidTypographyGroupSchema as figmaTypographySchema } from "../../../figma/src/typography/schema/fluidTypographyCalculator.schema";
import { localPreferencesSchema } from "../../../wp/src/schema/preferences.schema";

const preset = { id: "legacy-project", name: "Imported project", description: "", date: "2026-08-28" };
const scale = { steps: "5", namingConvention: "t-shirt", baseScaleIndex: 2 };
const spacing = { ...scale, min: { size: 16, scaleRatio: 1.2 }, max: { size: 24, scaleRatio: 1.25 } };
const typography = {
	...scale,
	min: { fontSize: 16, scaleRatio: 1.2 },
	max: { fontSize: 24, scaleRatio: 1.25 },
};

describe("saved project compatibility", () => {
	it("accepts the complete bundled project without changing its data", () => {
		const result = combinedPresetSchema.parse(DEFAULT_PRESET);
		expect(result).toEqual(DEFAULT_PRESET);
	});

	it.each([{}, { colorStyles: [] }, { colorStyles: [], typographyStyles: [] }])(
		"accepts a partial set of group categories: %j",
		(groups) => {
			const input = { ...preset, groups };
			expect(combinedPresetSchema.parse(input)).toEqual(input);
		},
	);

	it("still rejects unknown group categories and malformed category values", () => {
		expect(groupsSchema.safeParse({ unknownStyles: [] }).success).toBe(false);
		expect(groupsSchema.safeParse({ colorStyles: "invalid" }).success).toBe(false);
	});

	it("does not materialize missing preferences during import", () => {
		expect(presetPreferencesSchema.parse({})).toEqual({});
		expect(combinedPresetSchema.parse({ ...preset, preferences: {} })).toEqual({
			...preset,
			preferences: {},
		});
		expect(localPreferencesSchema.parse({ selected_id: "legacy-project" })).toEqual({
			selected_id: "legacy-project",
		});
	});

	it("preserves explicit false settings and rejects invalid preference values", () => {
		const preferences = { postcss: false, is_rem: false, root_font_size: 10 };
		expect(presetPreferencesSchema.parse(preferences)).toEqual(preferences);
		expect(presetPreferencesSchema.safeParse({ postcss: "false" }).success).toBe(false);
	});

	it("keeps legacy single-group typography and spacing imports unchanged", () => {
		expect(oldSpacingSchema.parse(spacing)).toEqual(spacing);
		expect(oldFluidTypographySchema.parse(typography)).toEqual(typography);
		const input = { ...preset, modulesData: { FLUID_SPACING: spacing, FLUID_TYPOGRAPHY: typography } };
		expect(combinedPresetSchema.parse(input)).toEqual(input);
	});

	it.each([
		["spacing", spacingGroupSchema, spacing],
		["typography", fluidTypographyGroupSchema, typography],
		["Figma spacing", figmaSpacingSchema, spacing],
		["Figma typography", figmaTypographySchema, typography],
	] as const)("preserves omitted and explicit modes in %s groups", (_name, schema, values) => {
		const input = { ...values, id: "group-id", name: "Group" };
		expect(schema.parse(input)).toEqual(input);
		expect(schema.parse({ ...input, mode: "fluid_manual" })).toEqual({ ...input, mode: "fluid_manual" });
	});

	it("rejects oversized constrained arrays without collecting an issue for every element", () => {
		const result = cssDeclarationSchema.safeParse({
			id: "decl",
			property: "width",
			value: "1px",
			fluidValue: Array(10_000).fill({}),
		});
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues.length).toBeLessThanOrEqual(2);
	});
});
