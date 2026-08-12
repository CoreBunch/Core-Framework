import { FontsData } from "components/modules/fonts";
import { StylesheetsData } from "components/modules/stylesheets";
import { atom } from "jotai";
import { COLOR_SYSTEM_INITIAL_STATE, ColorSystemFormData } from "components/modules/colorSystem";
import { COMPONENTS_INITIAL_STATE, ComponentData } from "components/modules/components";
import { SpacingData } from "components/modules/spacing";
import { Results, TypographyData } from "components/modules/typography";
import {
	SPACING_CALCULATOR_INITIAL_STATE,
	STYLESHEETS_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "data/defaults";
import { changeVariablesAtom } from "./globalCssVarsAtoms";

export const typographyDataAtom = atom<TypographyData>(TYPOGRAPHY_INITIAL_STATE);

export const fluidTypoGraphyHelperResultsAtom = atom<Results>({
	typeScales: [],
	declarations: [],
});

export const spacingDataAtom = atom<SpacingData>(SPACING_CALCULATOR_INITIAL_STATE);

export const fluidSpacingHelperResultsAtom = atom<Results>({
	typeScales: [],
	declarations: [],
});

const _colorSystemFormDataAtom = atom<ColorSystemFormData>(COLOR_SYSTEM_INITIAL_STATE);

export const colorSystemFormDataAtom = atom<ColorSystemFormData, [ColorSystemFormData], void>(
	(get) => get(_colorSystemFormDataAtom),
	(_get, set, newColorSystemFormData: ColorSystemFormData) => {
		set(_colorSystemFormDataAtom, newColorSystemFormData);

		const { groups } = newColorSystemFormData;
		const variables: {
			name: string;
			colorValue: string;
			transparent?: number;
		}[] = [];

		if (newColorSystemFormData?.isDisabled) {
			set(changeVariablesAtom, {
				variables,
				type: "COLOR_SYSTEM",
			});
			return;
		}

		for (const { colors } of groups) {
			for (const color of colors) {
				variables.push({
					name: color.name,
					colorValue: color.value,
				});

				if (color.isShades && color.shades?.length) {
					for (const shade of color.shades) {
						variables.push({
							name: shade.name,
							colorValue: shade.value,
						});
					}
				}

				if (color.isTints && color.tints?.length) {
					for (const tint of color.tints) {
						variables.push({
							name: tint.name,
							colorValue: tint.value,
						});
					}
				}

				if (color.transparent && color.transparentVariables?.length) {
					for (const transValue of color.transparentVariables) {
						variables.push({
							name: `${color.name}-${transValue}`,
							colorValue: color.value,
							transparent: Number(transValue),
						});
					}
				}
			}
		}

		set(changeVariablesAtom, {
			variables,
			type: "COLOR_SYSTEM",
		});
	},
);

export const fontsDataAtom = atom<FontsData>({ fonts: [] });

export const componentsDataAtom = atom<ComponentData>(COMPONENTS_INITIAL_STATE);

export const stylesheetsDataAtom = atom<StylesheetsData>(STYLESHEETS_INITIAL_STATE);
