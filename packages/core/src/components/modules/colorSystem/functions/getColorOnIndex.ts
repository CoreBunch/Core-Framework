import { ColorItem, ColorVariable } from "../types";
import { getColor } from "./getColor";
import { generateShades, generateTints } from "./generateShadesTints";

interface GetColorOnIndexProps {
	readonly state: ColorItem;
	readonly index: number;
	readonly type: "shade" | "tint";
	readonly dark?: boolean;
	readonly colorVariables?: ColorVariable[];
}

export function getColorOnIndex({ state, index, type, dark, colorVariables }: GetColorOnIndexProps) {
	const { value, darkValue, name, shadesNumber, tintsNumber } = state;

	const options = {
		midColor: getColor(dark ? darkValue ?? value : value, colorVariables, dark),
		name: name,
		number: type === "shade" ? shadesNumber : tintsNumber,
	};

	const colors = type === "shade" ? generateShades(options) : generateTints(options);

	return colors?.[index]?.value ?? "";
}
