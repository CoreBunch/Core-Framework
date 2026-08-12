import { ColorItem, ColorSystemFormData, ColorVariable } from "../types";
import { colord } from "colord";
import { ulid } from "ulid";
import { convertToDesiredColorFormat, convertToVariableDeclarationName } from "utils";
import { colorGroupsToVariables } from "./colorGroupsToVariables";
import { getColor, isValidColorValue } from "./getColor";

export function getTransparentVariable(
	color: ColorItem,
	variant: string | number,
	includeRawValue: boolean = false,
	darkMode: boolean = false,
	includeVariants: boolean = false,
) {
	const { format } = color;
	const colorValue = darkMode
		? getColor(color.darkValue as string, [], true, true)
		: getColor(color.value, [], true);

	if (!colorValue || !isValidColorValue(colorValue)) return null;

	const name = `${color.name}-${String(variant).replace("0.", "")}`;
	const instance = colord(colorValue).alpha(Number(variant) / 100);
	const value = convertToDesiredColorFormat(instance, format);
	const id = [color.id, variant].join(".");

	return {
		name,
		value,
		format,
		id,
		...(includeRawValue && {
			raw: color.value,
		}),
		...(includeVariants
			? {
					types: darkMode
						? ["variable", "transparent-class", "dark-mode"]
						: ["variable", "transparent-class"],
			  }
			: {}),
	};
}

function createDeclarations(
	groups: {
		id: string;
		name: string;
		colors: ColorItem[];
		isDisabled?: boolean;
	}[],
	darkMode: boolean = false,
	includeVariants: boolean = false,
) {
	const colorsToProcess: ColorItem[] = [];
	const vars = colorGroupsToVariables({ groups }) as ColorVariable[];

	for (const { colors, isDisabled, name: groupName } of groups) {
		if (isDisabled) continue;

		for (const color of colors) {
			const colorValue = darkMode ? color.darkValue : color.value;
			if (!colorValue || !isValidColorValue(getColor(colorValue, vars))) continue;

			const processedColor = darkMode ? { ...color, value: color.darkValue ?? "" } : color;
			colorsToProcess.push({
				...processedColor,
				...(includeVariants ? { types: ["variable"], groupName } : {}),
			});

			if (color?.transparent && color?.transparentVariables?.length) {
				color.transparentVariables.forEach((variant) => {
					const variable = getTransparentVariable(color, variant, false, darkMode, includeVariants);
					if (variable) colorsToProcess.push({ ...variable, ...(includeVariants ? { groupName } : {}) });
				});
			}

			if (color.isShades && (darkMode ? color.darkShades : color.shades)) {
				const shades = darkMode ? color.darkShades : color.shades;
				shades?.map(({ name, value }, i) => {
					colorsToProcess.push({
						id: String(i) + value,
						name,
						value,
						...(includeVariants
							? { types: ["variable", "shade-tint", ...(darkMode ? ["dark-mode"] : [])], groupName }
							: {}),
					});
				});
			}

			if (color.isTints && (darkMode ? color.darkTints : color.tints)) {
				const tints = darkMode ? color.darkTints : color.tints;
				tints?.forEach(({ name, value }, i) => {
					colorsToProcess.push({
						id: String(i) + value,
						name,
						value,
						...(includeVariants
							? { types: ["variable", "shade-tint", ...(darkMode ? ["dark-mode"] : [])], groupName }
							: {}),
					});
				});
			}
		}
	}

	return colorsToProcess.map((color) => {
		const { value, name } = color;
		const { types, groupName } = color as unknown as CSSDeclaration;
		const property = convertToVariableDeclarationName(name);

		return {
			id: ulid(),
			property,
			value,
			...(types?.length ? { types } : {}),
			...(groupName ? { groupName } : {}),
		};
	});
}

interface IGenerateColorSystemVariables {
	readonly colorSystemState: ColorSystemFormData;
	readonly manual_theme?: boolean;
	readonly darkModeSelector?: string;
	readonly lightModeSelector?: string;
	readonly classPrefix?: string;
	readonly includeVariants?: boolean;
}

export function generateColorSystemVariables({
	colorSystemState,
	manual_theme,
	darkModeSelector = ".cf-theme-dark",
	lightModeSelector = ".cf-theme-light",
	classPrefix = "",
	includeVariants,
}: IGenerateColorSystemVariables): CssObject[] {
	if (colorSystemState.isDisabled) return [];

	const declarations = createDeclarations(colorSystemState.groups, false, includeVariants);
	const cssObject: CssObject = {
		id: ulid(),
		selector: ":root",
		declarations,
		...(includeVariants ? { types: ["variable"] } : {}),
	};

	const darkModeDeclarations = createDeclarations(colorSystemState.groups, true, includeVariants);

	const darkModeCssObject: CssObject = manual_theme
		? {
				id: ulid(),
				selector: `:root${darkModeSelector}, :root${lightModeSelector} .${classPrefix}theme-inverted, :root${lightModeSelector} .theme-always-dark, :root${darkModeSelector} .${classPrefix}theme-inverted .theme-always-dark`,
				declarations: darkModeDeclarations,
				...(includeVariants ? { types: ["variable", "dark-mode"] } : {}),
		  }
		: {
				id: ulid(),
				selector: ":root",
				media: "DARK_MODE",
				declarations: darkModeDeclarations,
				...(includeVariants ? { types: ["variable", "dark-mode"] } : {}),
		  };

	const htmlPreferColorSchemaCssObject: CssObject[] = darkModeDeclarations.length
		? [
				{
					id: "prefers-color-scheme-html",
					selector: `html${manual_theme ? darkModeSelector : ""}`,
					...(manual_theme ? {} : { media: "DARK_MODE" }),
					declarations: [
						{
							id: "1",
							property: "color-scheme",
							value: "dark",
						},
					],
				},
		  ]
		: [];

	return [cssObject, darkModeCssObject, ...htmlPreferColorSchemaCssObject];
}
