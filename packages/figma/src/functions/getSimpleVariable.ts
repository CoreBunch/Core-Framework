import { Declaration, Preset, SimpleVariable } from "../types";

function removeVariablePrefix(variable: string): string {
	return variable.startsWith("--") ? variable.replace("--", "") : variable;
}

function parseValueAndType(
	value: string,
	rootFontSize: number,
): { parsedValue: number | string; valueType: SimpleVariable["type"] } {
	const trimmedValue = value.trim();

	let parsedValue: number | string;
	let valueType: SimpleVariable["type"];

	if (trimmedValue.endsWith("px")) {
		parsedValue = Number(trimmedValue.replace("px", ""));
		valueType = "FLOAT";
	} else if (trimmedValue.endsWith("rem")) {
		parsedValue = Number(trimmedValue.replace("rem", "")) * rootFontSize;
		valueType = "FLOAT";
	} else if (trimmedValue.includes("calc(")) {
		parsedValue = trimmedValue;
		valueType = "FLOAT";
	} else {
		parsedValue = trimmedValue;
		valueType = "STRING";
	}

	return { parsedValue, valueType };
}

type GetSimpleVariableProps = {
	declaration: Declaration;
	groupName: string;
	preferences: Preset["preferences"];
};

export function getSimpleVariable({
	declaration,
	groupName,
	preferences,
}: GetSimpleVariableProps): SimpleVariable {
	const { value, property } = declaration;

	const { parsedValue, valueType } = parseValueAndType(value, preferences.root_font_size ?? 10);
	const variableWithoutPrefix = removeVariablePrefix(property);
	const variable = `${groupName}/${variableWithoutPrefix}`;

	return {
		webSyntax: `var(--${variableWithoutPrefix})`,
		value: parsedValue,
		type: valueType,
		variable,
	};
}

export function getSimpleColorVariable({
	declaration,
	groupName,
	preferences,
}: GetSimpleVariableProps): SimpleVariable {
	const { value, property } = declaration;

	const variableWithoutPrefix = removeVariablePrefix(property);
	const variable = `${groupName}/${variableWithoutPrefix}`;

	console.log({ value, property });

	return {
		webSyntax: `var(--${variableWithoutPrefix})`,
		value,
		type: "COLOR",
		variable,
	};
}
