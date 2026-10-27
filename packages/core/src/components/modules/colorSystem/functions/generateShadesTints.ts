import { DEFAULT_SHADES_COUNT } from "../data/defaults";
import { ColorItem, ColorVariable, Shade } from "../types";
import { getColor } from "./getColor";
import { ColorFormat } from "@mantine/core/lib/ColorPicker/types";
import chroma from "chroma-js";
import { colord, getFormat } from "colord";
import { extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import { convertToDesiredColorFormat } from "utils";

try {
	extend([mixPlugin]);
} catch (error) {
	console.log(error);
}

type ColorType = "shade" | "tint";
interface IGenerateShadesOrTints {
	number?: number;
	midColor: string;
	name: string;
	format?: ColorFormat;
}

const PERCENTAGE_ERROR = 3;

function generateShadesOrTints({
	number = DEFAULT_SHADES_COUNT,
	midColor,
	name,
	format,
	type,
}: IGenerateShadesOrTints & { type: ColorType }) {
	if (!chroma.valid(midColor.trim())) return [];
	if (number === 0) number = 3;

	const colorFormat = format ?? getFormat(midColor.trim());
	const instance = colord(midColor.trim());
	const colorsArray = type === "shade" ? instance.shades(number + 2) : instance.tints(number + 2);

	return colorsArray.slice(1, -1).map((color, index) => ({
		name: generateAdditionalColorName({ name, index, type }),
		value: convertToDesiredColorFormat(color, colorFormat),
	}));
}

export function generateShades(options: IGenerateShadesOrTints) {
	return generateShadesOrTints({ ...options, type: "shade" });
}

export function generateTints(options: IGenerateShadesOrTints) {
	return generateShadesOrTints({ ...options, type: "tint" });
}

interface IGenerateShadeName {
	readonly name: string;
	readonly index: number;
	readonly type: ColorType;
}

export function generateAdditionalColorName({ name, index, type }: IGenerateShadeName): string {
	const types = {
		shade: "d",
		tint: "l",
	};
	return `${name}-${types[type]}-${index + 1}`;
}

export function generateWithCheck(
	state: ColorItem,
	newColor: string,
	type: ColorType,
	isDark = false,
	colorVariables: ColorVariable[] = [],
) {
	const formatItem = (item: Shade) => ({
		...item,
		value: convertToDesiredColorFormat(item.value, state.format),
	});
	const generateItems = (color: string, count: number): Shade[] =>
		generateFn({ midColor: color, name: state.name, number: count, format: "hsla" }).map((item) => ({
			...formatItem(item),
			isCustom: false,
		}));

	const isShade = type === "shade";
	const generateFn = isShade ? generateShades : generateTints;
	const number = (isShade ? state.shadesNumber : state.tintsNumber) ?? 0;
	const midColor = getColor(isDark ? (state.darkValue ?? "") : state.value, colorVariables, isDark);
	const savedItems = isDark
		? isShade
			? state.darkShades
			: state.darkTints
		: isShade
			? state.shades
			: state.tints;
	const existingItems = savedItems?.map(formatItem);

	let generatedItems =
		number !== existingItems?.length
			? generateItems(midColor, existingItems?.length ?? 0)
			: generateItems(midColor, number);
	const newGeneratedItems = generateItems(getColor(newColor, colorVariables, isDark), number);
	// An unresolved reference must not erase custom or unclassified legacy values.
	if (!newGeneratedItems.length && savedItems?.some((item) => item.isCustom !== false)) return savedItems;

	for (let i = 0; i < (existingItems?.length ?? 0); i++) {
		const existingItem = existingItems?.[i];
		const generatedItem = generatedItems[i];

		if (existingItem && newGeneratedItems[i]) {
			if (existingItem.isCustom === false) continue;
			if (existingItem.isCustom === true || !generatedItem) {
				newGeneratedItems[i] = savedItems![i];
				continue;
			}
			const totalDiff = calculateTotalDifference(generatedItem.value, existingItem.value);
			const isCustomRawColor =
				state.format === "raw" && colord(generatedItem.value).toHex() !== colord(existingItem.value).toHex();
			if (
				isCustomRawColor ||
				(state.format !== "raw" && state.prevFormat !== state.format && totalDiff > PERCENTAGE_ERROR)
			)
				newGeneratedItems[i] = savedItems![i];
		}
	}

	return newGeneratedItems;
}

function parseHSLA(hslaString: string) {
	const regex = /hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*([\d.]+)\)/;
	const result = hslaString.match(regex);

	return result
		? {
				h: parseInt(result[1], 10),
				s: parseInt(result[2], 10),
				l: parseInt(result[3], 10),
				a: parseFloat(result[4]),
			}
		: { h: 0, s: 0, l: 0, a: 0 };
}

function calculatePercentageDifference(value1: number, value2: number) {
	const avg = (value1 + value2) / 2;
	return parseFloat(Math.abs(((value1 - value2) / avg) * 100).toFixed(2));
}

function calculateTotalDifference(value1: string, value2: string) {
	const parsed1 = parseHSLA(convertToDesiredColorFormat(value1, "hsla"));
	const parsed2 = parseHSLA(convertToDesiredColorFormat(value2, "hsla"));

	const hDifference = calculatePercentageDifference(parsed1.h, parsed2.h);
	const sDifference = calculatePercentageDifference(parsed1.s, parsed2.s);
	const lDifference = calculatePercentageDifference(parsed1.l, parsed2.l);
	const aDifference = calculatePercentageDifference(parsed1.a, parsed2.a);

	return hDifference + sDifference + lDifference + aDifference;
}
