import cssColorNames from "data/cssColorNames";
import { isValidColor } from "utils";
import { ColorVariable } from "../types";

const variableRegex = /^var\(--(.*?)\)$/;

export const getColor = (
	value: string,
	colorVariables: ColorVariable[] = [],
	isDark?: boolean,
): string => {
	function resolveColor(
		color: string,
		visited: Set<string> = new Set(),
		isDarkColor: boolean = isDark ?? false,
	): string {
		const regMatch = color.trim().match(variableRegex);
		if (!regMatch) return cssColorNames[color] ?? color;

		const varName = regMatch[1];
		const variable = colorVariables.find((el) => el.name === varName);

		if (visited.has(varName)) return "";

		if (variable) {
			visited.add(varName);
			const color = isDarkColor ? variable.colorDarkValue || variable.colorValue : variable.colorValue;
			return resolveColor(color, visited, isDarkColor);
		}
		// Keep references supplied by themes/custom CSS in generated declarations.
		// Callers doing colour arithmetic must still require a resolved literal.
		return color;
	}

	return resolveColor(value);
};

export const isValidColorValue = (color: string) => {
	const regMatch = color.match(variableRegex);
	return !!(isValidColor(color) || cssColorNames[color] || (getColor(color) && regMatch?.length));
};
