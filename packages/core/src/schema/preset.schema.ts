import { fontsDataSchema } from "components/modules/fonts";
import { stylesheetsDataSchema } from "components/modules/stylesheets/schema/stylesheets.schema";
import { z } from "zod";
import { colorSystemSchema } from "components/modules/colorSystem";
import { componentsDataSchema } from "components/modules/components";
import { oldSpacingSchema, spacingData } from "components/modules/spacing";
import { fluidTypographySchema, oldFluidTypographySchema } from "components/modules/typography";
import { MediaSupportedPropertiesKeys } from "cssGenerator/generator/media";
import { SupportedPropertiesKeys } from "cssGenerator/generator/support";

export const objectTypeSchema = z.enum([
	"shade-tint",
	"class",
	"variable",
	"text-class",
	"bg-class",
	"transparent-class",
	"fill-class",
	"border-class",
	"dark-mode",
	"typo-class",
	"space-class",
	"typo-variable",
	"space-variable",
	"component",
]);

export const cssDeclarationSchema = z.object({
	property: z.string(),
	value: z.string(),
	type: z.string().optional(),
	fluidValue: z.array(z.number().or(z.string())).length(3).optional(),
	colorValue: z.string().optional(),
	id: z.string(),
	types: z.array(objectTypeSchema).optional(),
	groupName: z.string().optional(),
});

export const variantsSchema = z.object({
	id: z.string(),
	declarations: z.array(cssDeclarationSchema),
	mediaQuery: z.array(z.number()).length(2),
});

export const cssObjectSchema = z.object({
	id: z.string(),
	selector: z.string(),
	declarations: z.array(cssDeclarationSchema),
	isDisabled: z.boolean().optional(),
	mediaQuery: z.array(z.number()).length(2).optional(),
	variants: z.array(variantsSchema).optional(),
	media: z.enum(MediaSupportedPropertiesKeys).optional(),
	support: z.enum(SupportedPropertiesKeys).optional(),
	types: z.array(objectTypeSchema).optional(),
	groupName: z.string().optional(),
});

export const modulesDataSchema = z.object({
	FLUID_TYPOGRAPHY: fluidTypographySchema.optional(),
	COLOR_SYSTEM: colorSystemSchema.optional(),
	FLUID_SPACING: spacingData.optional(),
	COMPONENTS: componentsDataSchema.optional(),
	FONTS: fontsDataSchema.optional(),
	STYLESHEETS: stylesheetsDataSchema.optional(),
});

export const groupSchema = z.object({
	id: z.string(),
	name: z.string(),
	cssObjects: z.array(cssObjectSchema).optional(),
});

export const stylesheetDataKeysSchema = z.enum([
	"colorStyles",
	"typographyStyles",
	"spacingStyles",
	"layoutsStyles",
	"designStyles",
	"componentsStyles",
	"stylesheetsStyles",
	"otherStyles",
	"fontsStyles",
]);

export const stylesGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	isDisabled: z.boolean().optional(),
	cssObjects: z.array(cssObjectSchema),
	type: z.enum(["variable"]).optional(),
});

export const groupsSchema = z.record(stylesheetDataKeysSchema, z.array(groupSchema));

export const presetPreferencesSchema = z.object({
	root_font_size: z.number().default(16).optional(),
	postcss: z.boolean().default(true).optional(),
	postcss_easing_gradients: z.boolean().default(false).optional(),
	postcss_hover_media: z.boolean().default(false).optional(),
	min_screen_width: z.number().optional(),
	max_screen_width: z.number().optional(),
	is_rem: z.boolean().default(true).optional(),
	prefers_reduced_motion: z.boolean().optional(),
	theme_mode: z.enum(["light", "dark", "auto"]).optional(),
	is_add_group_comments: z.boolean().default(false).optional(),
});

export const presetSchema = z.object({
	id: z.string(),
	name: z.string(),
	updatedAt: z.number().optional().catch(Date.now()),
	app_version: z.string().optional(),
	classPrefix: z.string().optional(),
	isVariablePrefix: z.boolean().optional(), // DEPRECATED
	variablePrefix: z.string().optional(),
	description: z.string(),
	date: z.string(),
	groups: groupsSchema.optional(),
	breakpoints: z.array(z.array(z.number()).length(2)).optional(),
	styleSheetData: z
		.object({
			colorStyles: z.array(stylesGroupSchema).optional(),
			typographyStyles: z.array(stylesGroupSchema).optional(),
			spacingStyles: z.array(stylesGroupSchema).optional(),
			layoutsStyles: z.array(stylesGroupSchema).optional(),
			designStyles: z.array(stylesGroupSchema).optional(),
			componentsStyles: z.array(stylesGroupSchema).optional(),
			stylesheetsStyles: z.array(stylesGroupSchema).optional(),
			otherStyles: z.array(stylesGroupSchema).optional(),
			fontsStyles: z.array(stylesGroupSchema).optional(),
		})
		.optional(),
	modulesData: modulesDataSchema.optional(),
	cssString: z.string().optional(),
	preferences: presetPreferencesSchema,
	has_updated_columns: z.boolean().optional(),
});

export const presetSchemaWithOptionalPreferences = presetSchema.partial({
	preferences: true,
});

export const combinedPresetSchema = presetSchema
	.extend({
		modulesData: modulesDataSchema
			.or(
				z.object({
					FLUID_TYPOGRAPHY: oldFluidTypographySchema.optional(),
					FLUID_SPACING: oldSpacingSchema.optional(),
					COLOR_SYSTEM: colorSystemSchema.optional(),
					COMPONENTS: componentsDataSchema.optional(),
					FONTS: fontsDataSchema.optional(),
					STYLESHEETS: stylesheetsDataSchema.optional(),
				}),
			)
			.optional(),
	})
	.partial({
		preferences: true,
	});
