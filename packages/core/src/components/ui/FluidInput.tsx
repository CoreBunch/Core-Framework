import { memo, useCallback, useEffect, useState } from "react";
import { getSingleTypeScale } from "functions/getSingeTypescale";
import { useAtomCallback } from "jotai/utils";
import { copyToClipboard } from "utils";
import { NumberInput } from "components/basic/NumberInput";
import { useEffectOnce } from "hooks/useEffectOnce";
import { presetPreferencesSelector } from "state";
import { Tooltip } from "./Tooltip";

export const FluidInput = memo<{
	value: FluidInputValue;
	onChange: (value: FluidInputValue) => void;
}>(({ value, onChange }) => {
	const [restoredMin, restoredMax, restoredUnit] = value;

	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

	const [min, setMin] = useState<number | string>(restoredMin || "");
	const [max, setMax] = useState<number | string>(restoredMax || "");

	const [unit] = useState<"px" | "rem">(restoredUnit || "px");

	const [resultPreview, setResultPreview] = useState(() => {
		const { min_screen_width, max_screen_width, root_font_size } = getPreferences();

		if ([min, max].includes("")) {
			return "";
		}

		const { clamp } = getSingleTypeScale({
			minSize: Number(min),
			maxSize: Number(max),
			minScreenWidth: Number(min_screen_width),
			maxScreenWidth: Number(max_screen_width),
			rootFontSize: Number(root_font_size),
			sizeUnit: unit,
		});

		return clamp;
	});

	const handleClampValueChange = (value: string) => {
		setResultPreview(value);

		const data = {
			min: min === "" ? "" : Number(min),
			max: max === "" ? "" : Number(max),
			unit,
		};

		onChange([data.min, data.max, data.unit] as FluidInputValue);
	};

	useEffectOnce(() => {
		const { min_screen_width, max_screen_width, root_font_size } = getPreferences();

		if ([min, max].includes("")) {
			return handleClampValueChange("");
		}

		const { clamp } = getSingleTypeScale({
			minSize: Number(min),
			maxSize: Number(max),
			minScreenWidth: Number(min_screen_width),
			maxScreenWidth: Number(max_screen_width),
			rootFontSize: Number(root_font_size),
			sizeUnit: unit,
		});

		handleClampValueChange(clamp);
	});

	useEffect(() => {
		const data = {
			min: min === "" ? "" : Number(min),
			max: max === "" ? "" : Number(max),
			unit,
		};

		onChange([data.min, data.max, data.unit] as FluidInputValue);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [min, max, unit]);

	return (
		<div className="clamp-value row align-center gap-xs">
			<Tooltip label={resultPreview}>
				<p onClick={() => copyToClipboard(resultPreview)}>Min</p>
			</Tooltip>

			<NumberInput
				size={4}
				min={0}
				value={min}
				unit={unit}
				hideControls
				onChange={(value) => setMin(value)}
			/>

			<p>Max</p>

			<NumberInput
				size={4}
				min={0}
				value={max}
				unit={unit}
				hideControls
				onChange={(value) => setMax(value ?? "")}
			/>
		</div>
	);
});
