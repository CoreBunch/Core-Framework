import { z } from 'zod';
import {
	presetPreferencesSchema as basePresetPreferencesSchema,
	presetSchema as basePresetSchema,
	modulesDataSchema,
} from '@core-framework/core/schema/preset.schema';

// Re-export everything from core first
export * from '@core-framework/core/schema/preset.schema';

// Re-import legacy schemas needed for combinedPresetSchema reconstruction
import { colorSystemSchema } from 'components/modules/colorSystem';
import { componentsDataSchema } from 'components/modules/components';
import { oldSpacingSchema } from 'components/modules/spacing';
import { oldFluidTypographySchema } from 'components/modules/typography';
import { fontsDataSchema } from '../components/modules/fonts';
import { stylesheetsDataSchema } from '../components/modules/stylesheets/schema/stylesheets.schema';

// Override with WP-extended versions
export const presetPreferencesSchema = basePresetPreferencesSchema.extend({
	has_theme: z.boolean().optional(),
	is_clickable_parent: z.boolean().optional(),
	disable_focusable_parent: z.boolean().optional(),
	enable_sr_only: z.boolean().optional(),
});

export const presetSchema = basePresetSchema.extend({
	pluginName: z.string().optional(),
	pluginIcon: z.string().optional(),
	hidePlugin: z.boolean().optional(),
	pluginAuthor: z.string().optional(),
	pluginDescription: z.string().optional(),
	clickableParentClass: z.string().optional(),
	srOnlyClass: z.string().optional(),
	preferences: presetPreferencesSchema,
});

// Rebuild derived schemas with extended versions
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
