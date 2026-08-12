import cssColorNames from "data/cssColorNames";
import { isValidColor } from "utils";
import { ColorVariable, UpdatedWindow } from "../types";

const variableRegex = /^var\(--(.*?)\)$/;

export const getColor = (
	value: string,
	colorVariables?: ColorVariable[],
	fromWindow?: boolean,
	isDark?: boolean,
): string => {
	const variables = (fromWindow ? (window as unknown as UpdatedWindow).colorVariables : colorVariables) || [];

	function resolveColor(
		color: string,
		visited: Set<string> = new Set(),
		isDarkColor: boolean = isDark ?? false,
	): string {
		const regMatch = color.match(variableRegex);
		if (!regMatch) return cssColorNames[color] ?? color;

		const varName = regMatch[1];
		const variable = variables.find((el) => el.name === varName);

		if (visited.has(varName)) return "";

		if (variable) {
			visited.add(varName);
			const color = isDarkColor ? variable.colorDarkValue || "" : variable.colorValue;
			return resolveColor(color, visited, isDarkColor);
		}
		return cssColorNames[color] ?? color;
	}

	return resolveColor(value);
};

export const isValidColorValue = (color: string) => {
	const regMatch = color.match(variableRegex);
	return !!(isValidColor(color) || cssColorNames[color] || (getColor(color) && regMatch?.length));
};
