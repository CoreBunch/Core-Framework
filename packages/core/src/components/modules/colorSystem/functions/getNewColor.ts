import { DEFAULT_COLOR_ITEM } from "../data/defaults";
import { random } from "colord";
import { ulid } from "ulid";

export function getNewColor(length: number) {
	const randomColor = random();
	const alpha = randomColor.alpha();
	const hsl = randomColor.toHsl();
	const hslaColor = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`;

	return {
		...DEFAULT_COLOR_ITEM,
		name: `${DEFAULT_COLOR_ITEM.name}-${length + 1}`,
		value: hslaColor,
		id: ulid(),
	};
}
