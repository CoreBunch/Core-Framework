import { ColorVariable, Preset, SimpleVariable } from "../types";
import { colord } from "colord";
import { getColor, isValidColorValue } from "./functions/getColor";

export function toRgba(color: string, overrides?: { r?: number; g?: number; b?: number; a?: number }) {
	const rgba = colord(color).toRgb();

	rgba.r = overrides?.r ?? rgba.r / 255;
	rgba.b = overrides?.b ?? rgba.b / 255;
	rgba.g = overrides?.g ?? rgba.g / 255;
	rgba.a = overrides?.a ?? rgba.a;

	return rgba;
}

interface GetColorVariablesProps {
	readonly preset: Preset;
	readonly colorVariables: ColorVariable[];
}

export function getColorVariables({ preset, colorVariables }: GetColorVariablesProps): SimpleVariable[] {
	const colorSystemData = preset?.modulesData?.COLOR_SYSTEM;
	const variablePrefix = preset?.variablePrefix ?? "";

	if (!colorSystemData) {
		return [];
	}

	const variables: SimpleVariable[] = [];

	for (const group of colorSystemData.groups) {
		for (const color of group.colors) {
			const isValidColor = isValidColorValue(color.value);
			const colorValue = isValidColor ? color.value : getColor(color.value, colorVariables);
			const darkColorValue = isValidColor ? color.darkValue : getColor(color.darkValue, colorVariables);

			variables.push({
				variable: `Colors/${group.name}/${variablePrefix}${color.name}`,
				value: toRgba(colorValue),
				type: "COLOR",
				webSyntax: `var(--${color.name})`,
			});

			if (color.shades && color?.isShades) {
				for (const shade of color.shades) {
					variables.push({
						variable: `Colors/${group.name}/${variablePrefix}${shade.name}`,
						value: toRgba(shade.value),
						type: "COLOR",
						webSyntax: `var(--${shade.name})`,
					});
				}
			}

			if (color.tints && color?.isTints) {
				for (const tint of color.tints) {
					variables.push({
						variable: `Colors/${group.name}/${variablePrefix}${tint.name}`,
						value: toRgba(tint.value),
						type: "COLOR",
						webSyntax: `var(--${tint.name})`,
					});
				}
			}

			if (color?.isDarkMode) {
				if (darkColorValue) {
					variables.push({
						variable: `Dark Colors/${group.name}/${variablePrefix}${color.name}`,
						value: toRgba(darkColorValue),
						type: "COLOR",
						webSyntax: `var(--${color.name})`,
					});
				}

				if (color?.darkShades && color?.isShades) {
					for (const shade of color.darkShades) {
						variables.push({
							variable: `Dark Colors/${group.name}/${variablePrefix}${shade.name}`,
							value: toRgba(shade.value),
							type: "COLOR",
							webSyntax: `var(--${shade.name})`,
						});
					}
				}

				if (color?.darkTints && color?.isTints) {
					for (const tint of color.darkTints) {
						variables.push({
							variable: `Dark Colors/${group.name}/${variablePrefix}${tint.name}`,
							value: toRgba(tint.value),
							type: "COLOR",
							webSyntax: `var(--${tint.name})`,
						});
					}
				}
			}

			if (color.transparent && color?.transparent) {
				for (const transparent of color.transparentVariables) {
					variables.push({
						variable: `Colors/${group.name}/${variablePrefix}${color.name}-${transparent}`,
						value: toRgba(colorValue, { a: Number(`0.${transparent.toString().padStart(2, "0")}`) }),
						type: "COLOR",
						webSyntax: `var(--${color.name}-${transparent})`,
					});
				}

				if (color.isDarkMode && darkColorValue) {
					for (const transparent of color.transparentVariables) {
						variables.push({
							variable: `Dark Colors/${group.name}/${variablePrefix}${color.name}-${transparent}`,
							value: toRgba(darkColorValue, { a: Number(`0.${transparent.toString().padStart(2, "0")}`) }),
							type: "COLOR",
							webSyntax: `var(--${color.name}-${transparent})`,
						});
					}
				}
			}
		}
	}

	return variables;
}
