export * from '@core-framework/core/data/presets';

// WP overrides getMinimalPreset with platform-specific module field additions
import { DEFAULT_PRESET } from '@core-framework/core/data/presets';

export const getMinimalPreset = (): Preset => {
	let preset: Preset | null = null;

	try {
		preset = structuredClone(DEFAULT_PRESET);
	} catch (e) {
		preset = { ...DEFAULT_PRESET };
	}

	preset = {
		...preset,
		styleSheetData: {
			...preset.styleSheetData,
			colorStyles: preset.styleSheetData?.colorStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			componentsStyles: preset.styleSheetData?.componentsStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			designStyles: preset.styleSheetData?.designStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			layoutsStyles: preset.styleSheetData?.layoutsStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			otherStyles: preset.styleSheetData?.otherStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			spacingStyles: preset.styleSheetData?.spacingStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			typographyStyles: preset.styleSheetData?.typographyStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
			fontsStyles: preset.styleSheetData?.fontsStyles?.map((group) => ({
				...group,
				isDisabled: group?.type === "variable" ? false : true,
			})),
		},
	};

	preset = {
		...preset,
		modulesData: {
			...preset.modulesData,
			COLOR_SYSTEM: {
				...preset.modulesData?.COLOR_SYSTEM,
				groups: preset.modulesData?.COLOR_SYSTEM?.groups?.map((group) => ({
					...group,
					colors: group.colors.map((color) => ({
						...color,
						gen: [],
					})),
				}))!,
			},
			FLUID_TYPOGRAPHY: {
				...preset.modulesData?.FLUID_TYPOGRAPHY!,
				groups: preset.modulesData?.FLUID_TYPOGRAPHY?.groups?.map((group) => ({
					...group,
					genFontSizeClass: false,
				}))!,
				classes: preset.modulesData?.FLUID_TYPOGRAPHY?.classes?.map((item) => ({
					...item,
					isDisabled: true,
				}))!,
			},
			FLUID_SPACING: {
				...preset.modulesData?.FLUID_SPACING!,
				groups: preset.modulesData?.FLUID_SPACING?.groups?.map((group) => ({
					...group,
					genGap: false,
					genMargin: false,
					genPadding: false,
					genAutoMargins: false,
				}))!,
				classes: preset.modulesData?.FLUID_SPACING?.classes?.map((item) => ({
					...item,
					isDisabled: true,
				}))!,
			},
			COMPONENTS: {
				...preset.modulesData?.COMPONENTS!,
				isDisabled: true,
			},
			FONTS: {
				...preset.modulesData?.FONTS!,
				isDisabled: true,
			},
		},
	};

	preset.name = "Minimal";

	return preset;
};
