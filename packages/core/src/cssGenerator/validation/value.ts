import { UNSUPPORTED_PROPERTIES } from "../data/unsupported";
import { cssReference } from "../readOnly/cssReference";
import { mergeArrays } from "utils";
import { validateMeasurement } from "./measurement";

function measurementsValidation(measurements: string[], value: string) {
	if (!measurements.length) {
		return null;
	}

	const measurementsArray = measurements.map((item) => item.replace(/[\[\]]/g, ""));

	return measurementsArray.some((item) => validateMeasurement(item, value));
}

function enumValidation(enumValues: string[], value: string) {
	return enumValues.includes(value);
}

function nestedValidation(unionValues: string[], value: string) {
	if (!unionValues.length) {
		return null;
	}

	for (const union of unionValues) {
		const isMeasurement = () => union.startsWith("[") && measurementsValidation([union], value);
		const isEnum = () => enumValidation([union], value);

		if (isMeasurement() || isEnum()) {
			return true;
		}
	}

	return false;
}

export function validateValue(property: string, value: string): boolean {
	const cssProperty = cssReference?.[property as keyof typeof cssReference];
	const isCssVariable = property.startsWith("--") || value.startsWith("var(--");

	if (isCssVariable) {
		return true;
	}

	if (!cssProperty) {
		return false;
	}

	let CSS_VALUES = cssProperty.values;
	let NESTED_VALUES: string[] = [];

	const isUnionOfStyles = CSS_VALUES.some((item) => item.startsWith("[prop:"));

	if (isUnionOfStyles) {
		const unions = CSS_VALUES.filter((item) => item.startsWith("[prop:"));

		for (const union of unions) {
			const property = union.replace("[prop:", "").replace("]", "");
			const propertyValues = cssReference?.[property as keyof typeof cssReference]?.values;

			if (propertyValues) {
				NESTED_VALUES = mergeArrays(NESTED_VALUES, propertyValues);
			}
		}

		CSS_VALUES = CSS_VALUES.filter((item) => !item.startsWith("[prop:"));
	}

	const measurements = CSS_VALUES.filter((item: string) => item.includes("["));
	const enums = CSS_VALUES.filter((item: string) => !item.match(/\[|\(/));
	const isPropertySupported = UNSUPPORTED_PROPERTIES.includes(
		property as (typeof UNSUPPORTED_PROPERTIES)[number],
	);

	const isValueValid = [
		isPropertySupported,
		measurementsValidation(measurements, value),
		enumValidation(enums, value),
		nestedValidation(NESTED_VALUES, value),
	].some(Boolean);

	if (!isValueValid) {
		console.warn(`Invalid value: ${value} for property: ${property}`);
	}

	return isValueValid;
}
