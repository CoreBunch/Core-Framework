import { ColorItem } from "../types";
import { generateShades, generateTints } from "./generateShadesTints";

interface GetColorOnIndexProps {
	readonly state: ColorItem;
	readonly index: number;
	readonly type: "shade" | "tint";
	readonly dark?: boolean;
}

export function getColorOnIndex({ state, index, type, dark }: GetColorOnIndexProps) {
	const { value, darkValue, name, shadesNumber, tintsNumber } = state;

	const options = {
		midColor: dark ? darkValue ?? value : value,
		name: name,
		number: type === "shade" ? shadesNumber : tintsNumber,
	};

	const colors = type === "shade" ? generateShades(options) : generateTints(options);

	return colors?.[index]?.value ?? "";
}
