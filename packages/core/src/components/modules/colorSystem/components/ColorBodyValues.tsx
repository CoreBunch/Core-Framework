import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useGetColor } from "hooks/useGetColor";
import { convertToDesiredColorFormat } from "utils";
import { generateWithCheck } from "../functions/generateShadesTints";
import { ClassGeneratorValue, ColorItem, DEFAULT_OPACITY_VARIANTS, Shade } from "../index";
import { colord } from "colord";
import { ColorAdditionalVariations, VariantValues } from "./ColorAdditionalVariations";
import { ColorFeatureToggle } from "./ColorFeatureToggle";
import { ColorUtilityClasses } from "./ColorUtilityClasses";

interface ColorBodyValues {
	color: ColorItem;
	onUpdateItem: (value: ColorItem) => void;
}

export const ColorBodyValues = memo<ColorBodyValues>(({ color, onUpdateItem }) => {
	const { getColor } = useGetColor();
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
			const { isActive, number } = value;
			const { value: midColor, isDarkMode, darkValue, darkShades, darkTints, shades, tints } = color;
			const isShadeType = type === "shade";
			const isTintType = type === "tint";

			const generate = (colorValue: string, isDark = false) => {
				const baseProps = { ...color, isShades: isShadeType && isActive, isTints: isTintType && isActive };
				return {
					shades:
						isShadeType && isActive
							? generateWithCheck(
									{ ...baseProps, shadesNumber: number, prevFormat },
									colorValue,
									"shade",
									isDark,
							  )
							: (isDark ? darkShades : shades) ?? [],
					tints:
						isTintType && isActive
							? generateWithCheck(
									{ ...baseProps, tintsNumber: number, prevFormat },
									colorValue,
									"tint",
									isDark,
							  )
							: (isDark ? darkTints : tints) ?? [],
				};
			};

			const { shades: newShades, tints: newTints } = generate(midColor);
			const { shades: newDarkShades, tints: newDarkTints } =
				isDarkMode && darkValue ? generate(darkValue, true) : { shades: [], tints: [] };

			onUpdateItem({
				...color,
				isShades: isShadeType ? isActive : color.isShades,
				isTints: isTintType ? isActive : color.isTints,
				shadesNumber: newShades.length,
				tintsNumber: newTints.length,
				...(newShades.length ? { shades: newShades } : {}),
				...(newTints.length ? { tints: newTints } : {}),
				...(newDarkShades.length ? { darkShades: newDarkShades } : {}),
				...(newDarkTints.length ? { darkTints: newDarkTints } : {}),
			});
		},
		[color, onUpdateItem, prevFormat],
	);

	const handleColorChange = useCallback(
		(value: string, index: number, isDark: boolean, type: "shade" | "tint") => {
			const updateColorArray = (colorArray?: Shade[]) =>
				colorArray?.map((item, i) => (i === index ? { ...item, value } : item));

			onUpdateItem({
				...color,
				shades: !isDark && type === "shade" ? updateColorArray(color.shades) : color.shades,
				tints: !isDark && type === "tint" ? updateColorArray(color.tints) : color.tints,
				darkShades: isDark && type === "shade" ? updateColorArray(color.darkShades) : color.darkShades,
				darkTints: isDark && type === "tint" ? updateColorArray(color.darkTints) : color.darkTints,
			});
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
				onUpdateColor={(...props) => handleColorChange(...props, "shade")}
			/>

			<hr />
			<ColorAdditionalVariations
				color={color}
				variant="tint"
				onChange={(value) => handleColorVariationChange("tint", value)}
				onUpdateColor={(...props) => handleColorChange(...props, "tint")}
			/>
		</div>
	);
});

ColorBodyValues.displayName = "ColorBodyValues";
