import { ColorItem, ColorSystemFormData, ColorVariable } from "../types";
import { DEFAULT_SHADES_COUNT, DEFAULT_TINTS_COUNT } from "../data/defaults";
import { colorGroupsToVariables } from "./colorGroupsToVariables";
import { getColor } from "./getColor";
import { generateWithCheck } from "./generateShadesTints";
import { colord } from "colord";

// Recalculate automatic variants using the previous resolved colour as the
// baseline, so manually edited swatches survive changes to a referenced colour.
export function refreshColorReferences(
	color: ColorItem,
	previousVariables: ColorVariable[],
	colorVariables: ColorVariable[],
): ColorItem {
	if (color.format !== "raw") return color;
	let next = color;
	for (const isDark of [false, true]) {
		if (isDark && !color.isDarkMode) continue;
		const value = isDark ? (color.darkValue ?? "") : color.value;
		if (!value.trim().startsWith("var(")) continue;
		const previousValue = getColor(value, previousVariables, isDark);
		const resolvedValue = getColor(value, colorVariables, isDark);
		if (!colord(resolvedValue).isValid()) continue;

		const previous = { ...color, [isDark ? "darkValue" : "value"]: previousValue };
		for (const type of ["shade", "tint"] as const) {
			if (!(type === "shade" ? color.isShades : color.isTints)) continue;
			const key = isDark
				? type === "shade"
					? "darkShades"
					: "darkTints"
				: type === "shade"
					? "shades"
					: "tints";
			const items = color[key];
			// On load there is no previous source colour. Only explicitly automatic
			// blocks (or missing blocks) can be repaired without guessing about edits.
			const sourceChanged = previousValue !== resolvedValue;
			if (!sourceChanged && items?.length && !items.some((item) => item.isCustom === false)) continue;
			const countKey = type === "shade" ? "shadesNumber" : "tintsNumber";
			const count =
				color[countKey] || items?.length || (type === "shade" ? DEFAULT_SHADES_COUNT : DEFAULT_TINTS_COUNT);
			const generationState = {
				...previous,
				[countKey]: count,
				// Unknown legacy blocks must remain unchanged during a load-time repair.
				...(!sourceChanged && items
					? { [key]: items.map((item) => ({ ...item, isCustom: item.isCustom ?? true })) }
					: {}),
			};
			const generated = generateWithCheck(generationState, resolvedValue, type, isDark);
			if (JSON.stringify(items) !== JSON.stringify(generated) || color[countKey] !== count)
				next = { ...next, [key]: generated, [countKey]: count };
		}
	}
	return next;
}

export function refreshColorSystemReferences(state: ColorSystemFormData): ColorSystemFormData {
	if (state.isDisabled) return state;
	let next = state;
	// A reference may target another colour's generated block. Resolve those
	// dependencies in bounded passes, stopping as soon as the values settle.
	const limit = state.groups.reduce((sum, group) => sum + group.colors.length, 0);
	for (let pass = 0; pass < limit; pass++) {
		const variables = colorGroupsToVariables(next) as ColorVariable[];
		let changed = false;
		const groups = next.groups.map((group) => {
			if (group.isDisabled) return group;
			const colors = group.colors.map((color) => {
				const refreshed = refreshColorReferences(color, variables, variables);
				if (refreshed !== color) changed = true;
				return refreshed;
			});
			return { ...group, colors };
		});
		if (!changed) return next;
		next = { ...next, groups };
	}
	return next;
}
