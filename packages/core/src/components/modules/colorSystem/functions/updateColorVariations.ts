import { ColorItem, ColorVariable } from "../types";
import { generateWithCheck } from "./generateShadesTints";
import { colord } from "colord";

export function updateColorVariations(
	color: ColorItem,
	type: "shade" | "tint",
	isActive: boolean,
	number: number,
	colorVariables: ColorVariable[],
	prevFormat?: string,
): ColorItem {
	number = Math.max(3, Math.min(10, Number.isFinite(number) ? Math.round(number) : 3));
	const isShade = type === "shade";
	const countKey = isShade ? "shadesNumber" : "tintsNumber";
	const itemsKey = isShade ? "shades" : "tints";
	const darkItemsKey = isShade ? "darkShades" : "darkTints";
	const next = { ...color, [isShade ? "isShades" : "isTints"]: isActive, [countKey]: number };
	if (!isActive) return next;

	const generationState = { ...next, prevFormat };
	return {
		...next,
		[itemsKey]: generateWithCheck(generationState, color.value, type, false, colorVariables),
		[darkItemsKey]:
			color.isDarkMode && color.darkValue
				? generateWithCheck(generationState, color.darkValue, type, true, colorVariables)
				: [],
	};
}

export function updateColorVariation(
	color: ColorItem,
	type: "shade" | "tint",
	index: number,
	value: string,
	isDark = false,
	reset = false,
): ColorItem {
	const key = isDark
		? type === "shade"
			? "darkShades"
			: "darkTints"
		: type === "shade"
			? "shades"
			: "tints";
	const items = color[key];
	const item = items?.[index];
	if (!item) return color;
	// Opening and closing the picker can emit the same colour in another format.
	const unchanged =
		item.value === value ||
		(colord(item.value).isValid() &&
			colord(value).isValid() &&
			colord(item.value).toHex() === colord(value).toHex());
	if (!reset && unchanged) return color;
	return {
		...color,
		[key]: items.map((item, i) => (i === index ? { ...item, value, isCustom: !reset } : item)),
	};
}
