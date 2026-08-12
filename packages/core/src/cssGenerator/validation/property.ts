import { cssReference } from "../readOnly/cssReference";

export function validateProperty(property: string) {
	const cssProperties = Object.keys(cssReference);
	const isCssVariable = property.startsWith("--");

	if (isCssVariable) {
		return true;
	}

	if (cssProperties.includes(property)) {
		return true;
	}

	console.warn(`Invalid CSS property: ${property}`);
	return false;
}
