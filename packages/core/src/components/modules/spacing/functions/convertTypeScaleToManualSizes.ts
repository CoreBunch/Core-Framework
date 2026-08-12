import { SpacingData, SpacingItem } from "../types";
import { ulid } from "ulid";
import {
	DEFAULT_MAX_SCREEN_WIDTH,
	DEFAULT_MIN_SCREEN_WIDTH,
	DEFAULT_PREFERENCES,
	DEFAULT_SPACING_SIZE,
} from "data/defaults";
import { getCssForSingleTypeScale } from "./getCssForSingleTypeScale";
import { generateFluidSpacingResult } from "./getFluidSpacingVariables";

interface IConvertTypeScaleToManualSizes {
	readonly spacingState: SpacingItem;
	readonly preferences:
		| {
				min_screen_width: NonNullable<PresetPreferences>["min_screen_width"];
				max_screen_width: NonNullable<PresetPreferences>["max_screen_width"];
				root_font_size: NonNullable<PresetPreferences>["root_font_size"];
				is_rem: NonNullable<PresetPreferences>["is_rem"];
		  }
		| NonNullable<PresetPreferences>;
}

export function convertTypeScaleToManualSizes({
	spacingState,
	preferences: { min_screen_width, max_screen_width, root_font_size, is_rem },
}: IConvertTypeScaleToManualSizes) {
	const { typeScales } = generateFluidSpacingResult({
		min_screen_width: min_screen_width ?? DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width ?? DEFAULT_MAX_SCREEN_WIDTH,
		is_rem: Boolean(is_rem),
		root_font_size: root_font_size ?? DEFAULT_PREFERENCES.root_font_size!,
		spacingState: { groups: [spacingState] },
	});
	const { namingConvention, steps } = spacingState;
	const stepsArray = steps.split(",");

	return typeScales.map((item, index) => ({
		name: stepsArray[index] ? `${namingConvention}-${stepsArray[index]}` : DEFAULT_SPACING_SIZE,
		min: Number(item.min),
		max: Number(item.max),
		css: getCssForSingleTypeScale({
			minFontSize: Number(item.min),
			maxFontSize: Number(item.max),
			minScreenWidth: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
			maxScreenWidth: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			isRem: Boolean(is_rem),
			rootFontSize: root_font_size,
		}),
		id: ulid(),
	}));
}
