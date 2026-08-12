import { cssColorNames } from "../../data/cssColorNames";
import { isValidColor } from "../../utils";
import { ColorVariable } from "../types";

const variableRegex = /^var\(--(.*?)\)$/;

export const getColor = (value: string, colorVariables?: ColorVariable[], isDark?: boolean): string => {
	if (cssColorNames[value]) {
		return cssColorNames[value];
	}

	function resolveColor(
		color: string,
		visited: Set<string> = new Set(),
		isDarkColor: boolean = isDark ?? false,
	): string {
		const regMatch = color.match(variableRegex);
		const varName = regMatch?.[1];
		const variable = colorVariables?.find((el) => el.name === varName);

		if (visited.has(varName)) {
			return "";
		}

		if (variable) {
			visited.add(varName);
			return variable.colorValue;
		}
	}

	return resolveColor(value);
};

export const isValidColorValue = (color: string) => {
	const regMatch = color.match(variableRegex);
	return !!(isValidColor(color) || (getColor(color) && regMatch?.length));
};
