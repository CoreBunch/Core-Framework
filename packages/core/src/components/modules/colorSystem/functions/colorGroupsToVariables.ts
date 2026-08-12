import { ColorSystemFormData } from "../types";

export function colorGroupsToVariables(colorData: ColorSystemFormData) {
	return colorData.groups.flatMap((group) => {
		if (group.isDisabled) return [];

		return group.colors.flatMap((color) => {
			const isDarkMode = color.isDarkMode ?? false;

			const mainColor = {
				name: color.name,
				colorValue: color.value,
				colorDarkValue: isDarkMode ? color.darkValue || null : null,
			};

			const shades =
				color.shades?.map((shade, idx) => ({
					name: shade.name,
					colorValue: shade.value,
					colorDarkValue: isDarkMode ? color.darkShades?.[idx]?.value || null : null,
				})) || [];

			const tints =
				color.tints?.map((tint, idx) => ({
					name: tint.name,
					colorValue: tint.value,
					colorDarkValue: isDarkMode ? color.darkTints?.[idx]?.value || null : null,
				})) || [];

			const transparentVars =
				color.transparentVariables?.map((transparent) => ({
					name: `${color.name}-${transparent}`,
					colorValue: color.value,
					colorDarkValue: isDarkMode ? color.darkValue || null : null,
					transparent: Number(transparent),
				})) || [];

			return [mainColor, ...shades, ...tints, ...transparentVars];
		});
	});
}
