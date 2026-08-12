import { TypographyItem } from "../types";
import { ulid } from "ulid";
import {
	DEFAULT_FONT_SIZE,
	DEFAULT_MAX_SCREEN_WIDTH,
	DEFAULT_MIN_SCREEN_WIDTH,
	DEFAULT_PREFERENCES,
} from "data/defaults";
import { getCssForSingleTypeScale } from "./getCssForSingleTypeScale";
import { generateFluidTypographyResult } from "./getFluidTypeVariables";

interface IConvertTypeScaleToManualSizes {
	readonly typographyState: TypographyItem;
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
	typographyState,
	preferences: { min_screen_width, max_screen_width, root_font_size, is_rem },
}: IConvertTypeScaleToManualSizes) {
	const { typeScales } = generateFluidTypographyResult({
		typographyData: { groups: [typographyState] },
		is_rem: Boolean(is_rem),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
		root_font_size: DEFAULT_PREFERENCES.root_font_size!,
	});
	const { namingConvention, steps } = typographyState;
	const stepsArray = steps.split(",");

	return typeScales.map((item, index) => ({
		name: stepsArray[index] ? `${namingConvention}-${stepsArray[index]}` : DEFAULT_FONT_SIZE,
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
