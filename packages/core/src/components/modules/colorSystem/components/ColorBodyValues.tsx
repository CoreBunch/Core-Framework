import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useGetColor } from "hooks/useGetColor";
import { convertToDesiredColorFormat } from "utils";
import { updateColorVariation, updateColorVariations } from "../functions/updateColorVariations";
import { generateWithCheck } from "../functions/generateShadesTints";
import { ClassGeneratorValue, ColorItem, DEFAULT_OPACITY_VARIANTS } from "../index";
import { colord } from "colord";
import { ColorAdditionalVariations, VariantValues } from "./ColorAdditionalVariations";
import { ColorFeatureToggle } from "./ColorFeatureToggle";
import { ColorUtilityClasses } from "./ColorUtilityClasses";

interface ColorBodyValues {
	color: ColorItem;
	onUpdateItem: (value: ColorItem) => void;
}

export const ColorBodyValues = memo<ColorBodyValues>(({ color, onUpdateItem }) => {
	const { getColor, colorVariables } = useGetColor();
	const prevState = useRef<any>();
	const [prevFormat, setPrevFormat] = useState(color.format);

	useEffect(() => {
		if (prevState.current !== undefined) setPrevFormat(prevState.current);
		prevState.current = color.format;
	}, [color.format]);

	const handleClassesToggle = useCallback(
		(value: ClassGeneratorValue) => {
			const gen = color.gen?.includes(value)
				? color.gen.filter((type) => type !== value)
				: [...(color.gen || []), value];
			onUpdateItem({ ...color, gen });
		},
		[color, onUpdateItem],
	);

	const handleDarkModeToggle = useCallback(
		(checked: boolean) => {
			const { isShades, isTints, darkShades, darkTints } = color;
			const darkValue = checked
				? convertToDesiredColorFormat(colord(getColor(color.value)).darken(0.2), color.format)
				: "";

			onUpdateItem({
				...color,
				darkValue,
				isDarkMode: checked,
				darkShades:
					isShades && checked && darkShades?.length
						? darkShades
						: generateWithCheck({ ...color, darkValue }, darkValue, "shade", true),
				darkTints:
					isTints && checked && darkTints?.length
						? darkTints
						: generateWithCheck({ ...color, darkValue }, darkValue, "tint", true),
			});
		},
		[color, onUpdateItem, getColor],
	);

	const handleTransparentVarsToggle = useCallback(
		(checked: boolean) => {
			onUpdateItem({
				...color,
				transparent: checked,
				transparentVariables: checked ? DEFAULT_OPACITY_VARIANTS : [],
			});
		},
		[color, onUpdateItem],
	);

	const handleColorVariationChange = useCallback(
		(type: "shade" | "tint", value: VariantValues) => {
			onUpdateItem(updateColorVariations(color, type, value.isActive, value.number, colorVariables, prevFormat));
		},
		[color, onUpdateItem, prevFormat, colorVariables],
	);

	const handleColorChange = useCallback(
		(value: string, index: number, isDark: boolean, type: "shade" | "tint", reset = false) => {
			onUpdateItem(updateColorVariation(color, type, index, value, isDark, reset));
		},
		[color, onUpdateItem],
	);

	return (
		<div className="grid gap-l padding-l">
			<ColorUtilityClasses color={color} onOptionToggle={handleClassesToggle} />

			<hr />
			<ColorFeatureToggle
				color={color}
				featureLabel="Enable dark mode"
				tooltipLabel="Set an alternative color for a dark mode. Check preferences for additional settings."
				featureStateKey="isDarkMode"
				onToggleFeature={handleDarkModeToggle}
			/>

			<hr />
			<ColorFeatureToggle
				color={color}
				featureLabel="Generate transparent variants"
				tooltipLabel={`Generate 10 transparent variants. Eg. --${color.name}-5, --${color.name}-10, --${color.name}-20, etc.`}
				featureStateKey="transparent"
				onToggleFeature={handleTransparentVarsToggle}
				className="transparent-vars-row"
			/>

			<hr />
			<ColorAdditionalVariations
				color={color}
				variant="shade"
				onChange={(value) => handleColorVariationChange("shade", value)}
				onUpdateColor={(value, index, isDark, reset) => handleColorChange(value, index, isDark, "shade", reset)}
			/>

			<hr />
			<ColorAdditionalVariations
				color={color}
				variant="tint"
				onChange={(value) => handleColorVariationChange("tint", value)}
				onUpdateColor={(value, index, isDark, reset) => handleColorChange(value, index, isDark, "tint", reset)}
			/>
		</div>
	);
});

ColorBodyValues.displayName = "ColorBodyValues";
