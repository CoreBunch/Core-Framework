// import { CSS_TRANSFORM_FUNCTIONS } from "constants/cssFunctions";
import { COLORS_EXTENDED } from "../data/colors";
import { LENGTH_UNITS, TIME_UNITS } from "../data/units";

function _length(value: string) {
	if (Number.isNaN(Number(value[0]))) {
		return false;
	}

	const unit = value.replace(/[0-9]/g, "");
	return LENGTH_UNITS.includes(unit as (typeof LENGTH_UNITS)[number]);
}

function _percentage(value: string) {
	return value.includes("%");
}

function _number(value: string) {
	return !Number.isNaN(Number(value));
}

function _time(value: string) {
	const unit = value.replace(/[0-9]/g, "");
	if (unit.includes(" ")) {
		return false;
	}
	return TIME_UNITS.includes(unit as (typeof TIME_UNITS)[number]);
}

// function _transform(value: string) {
//   return CSS_TRANSFORM_FUNCTIONS.includes(
//     value as typeof CSS_TRANSFORM_FUNCTIONS[number]
//   );
// }

function _color(color: string) {
	if (COLORS_EXTENDED.includes(color as (typeof COLORS_EXTENDED)[number])) {
		return true;
	}

	if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
		return true;
	}

	if (color.match(/^rgb\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}\s*\)$/)) {
		return true;
	}

	if (color.match(/^rgba\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0|1|0\.\d+)\s*\)$/)) {
		return true;
	}

	if (color.match(/^hsl\(\s*\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\s*\)$/)) {
		return true;
	}

	if (color.match(/^hsla\(\s*\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%,\s*(0|1|0\.\d+)\s*\)$/)) {
		return true;
	}

	return false;
}

const measurementsValidationMap = {
	length: _length,
	percentage: _percentage,
	number: _number,
	time: _time,
	color: _color,
};

export function validateMeasurement(measurement: string, value: string) {
	return measurementsValidationMap[measurement as keyof typeof measurementsValidationMap]?.(value);
}
