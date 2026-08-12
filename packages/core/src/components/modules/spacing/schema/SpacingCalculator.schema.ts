import { z } from "zod";
import { MediaSupportedPropertiesKeys } from "cssGenerator/generator/media";
import { SupportedPropertiesKeys } from "cssGenerator/generator/support";

const cssDeclarationSchema = z.object({
	property: z.string(),
	value: z.string(),
	type: z.string().optional(),
	fluidValue: z.array(z.number().or(z.string())).length(3).optional(),
	colorValue: z.string().optional(),
	id: z.string(),
});

const variantsSchema = z.object({
	id: z.string(),
	declarations: z.array(cssDeclarationSchema),
	mediaQuery: z.array(z.number()).length(2),
});

const cssObjectSchema = z.object({
	id: z.string(),
	selector: z.string(),
	declarations: z.array(cssDeclarationSchema),
	isDisabled: z.boolean().optional(),
	mediaQuery: z.array(z.number()).length(2).optional(),
	variants: z.array(variantsSchema).optional(),
	media: z.enum(MediaSupportedPropertiesKeys).optional(),
	support: z.enum(SupportedPropertiesKeys).optional(),
});

export const breakpointConfigSchema = z.object({
	size: z.union([z.number(), z.string()]),
	screenWidth: z.union([z.number(), z.string()]).optional(),
	scaleRatio: z.union([z.number(), z.string()]),
	isCustomScaleRatio: z.boolean().optional(),
	scaleRatioInputValue: z.number().optional(),
});

export const spacingGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	min: breakpointConfigSchema,
	max: breakpointConfigSchema,
	steps: z.string(),
	namingConvention: z.string(),
	baseScaleIndex: z.number(),
	isDisabled: z.boolean().optional(),
	isRem: z.boolean().optional(),
	genMargin: z.boolean().optional().describe("Deprecated"),
	genPadding: z.boolean().optional().describe("Deprecated"),
	genGap: z.boolean().optional().describe("Deprecated"),
	genAutoMargins: z.boolean().optional().describe("Deprecated"),
	mode: z.enum(["fluid", "fluid_manual"]).default("fluid").optional(),
	manualSizes: z
		.array(
			z.object({
				min: z.number(),
				max: z.number(),
				name: z.string(),
				css: z.string(),
				id: z.string(),
			}),
		)
		.optional(),
	genSemanticVariables: z.boolean().optional().describe("Deprecated"),
	semanticVariables: z.array(cssObjectSchema).optional().describe("Deprecated"),
});

export const oldSpacingSchema = spacingGroupSchema.omit({ id: true, name: true });

export const spacingClassGenerationSchema = z.object({
	id: z.string(),
	name: z.string(),
	property: z.array(z.string()),
	tabId: z.string(),
	isDisabled: z.boolean().optional(),
});

export const spacingData = z.object({
	groups: z.array(spacingGroupSchema),
	isDisabled: z.boolean().optional(),
	classes: z.array(spacingClassGenerationSchema).optional(),
	has_legacy_manual_class_generator: z.boolean().optional(),
});
