import { ChangeEvent, memo, useCallback, useMemo, useState } from "react";
import { Info } from "assets/icons/Info.icon";
import { NumberInput } from "components/basic/NumberInput";
import { Tooltip } from "components/ui/Tooltip";
import { getColorOnIndex } from "../functions/getColorOnIndex";
import { ColorFormatValue, ColorItem, DEFAULT_SHADES_COUNT, DEFAULT_TINTS_COUNT, Shade } from "../index";
import { Collapse, Switch } from "@mantine/core";
import { clsx } from "clsx";
import { ColorVariationPreview } from "./ColorVariationPreview";

const getInitialVariation = (color: ColorItem, variant: Variant): VariantValues => {
	if (variant === "shade") {
		return {
			isActive: color.isShades ?? false,
			number: color.shadesNumber || DEFAULT_SHADES_COUNT,
		};
	} else {
		return {
			isActive: color.isTints ?? false,
			number: color.tintsNumber || DEFAULT_TINTS_COUNT,
		};
	}
};

export interface VariantValues {
	isActive: boolean;
	number: number;
}

type Variant = "shade" | "tint";

interface ColorAdditionalVariations {
	color: ColorItem;
	variant: Variant;
	onChange: (value: VariantValues) => void;
	onUpdateColor: (value: string, index: number, isDark: boolean) => void;
}

export const ColorAdditionalVariations = memo<ColorAdditionalVariations>(
	({ color, variant, onChange, onUpdateColor }) => {
		const [variation, setVariation] = useState(() => getInitialVariation(color, variant));

		const items = useMemo(() => (variant === "shade" ? color.shades : color.tints), [color, variant]);
		const darkItems = useMemo(() => (variant === "shade" ? color.darkShades : color.darkTints), [color, variant]);

		const handleSwitchChange = useCallback(
			({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
				onChange({ ...variation, isActive: checked });
				setVariation((prev) => ({ ...prev, isActive: checked }));
			},
			[onChange, variation],
		);

		const handleNumberChange = useCallback(
			(value: number | string) => {
				onChange({ ...variation, number: Number(value) });
				setVariation((prev) => ({ ...prev, number: Number(value) }));
			},
			[onChange, variation],
		);

		const label = variant === "shade" ? "Generate shades" : "Generate tints";
		const tooltipLabel =
			variant === "shade"
				? `Shades are darker variants of your main color, mixed with black. Eg. --${color.name}-d-1, --${color.name}-d-2, ...`
				: `Tints are lighter variants of your main color, mixed with white. Eg. --${color.name}-l-1, --${color.name}-l-2, ...`;

		return (
			<>
				<div className="row gap-l space-between align-center">
					<div className="row gap-s align-center">
						<label htmlFor="shades">
							<h5
								className="pointer"
								onClick={() => setVariation((prev) => ({ ...prev, isActive: !variation.isActive }))}
							>
								{label}
							</h5>
						</label>

						<Tooltip label={tooltipLabel} position="top" openDelay={300} width={250} multiline withArrow>
							<span className="help-tooltip">
								<Info />
							</span>
						</Tooltip>

						<div className={clsx("transition-global", { "opacity-0": !variation.isActive })}>
							<NumberInput
								onChange={handleNumberChange}
								value={variation.number}
								unit="count"
								size={10}
								max={10}
								min={3}
								step={1}
								onlyInteger
								allowMouseWheel
							/>
						</div>
					</div>

					<Switch labelPosition="left" checked={variation.isActive} onChange={handleSwitchChange} />
				</div>

				{Boolean(variation.isActive) && (
					<Collapse in={Boolean(variation.isActive)}>
						<div className="row">
							{items?.map(({ value, name }, index) => {
								const defaultValue = getColorOnIndex({ state: color, index, type: variant });
								return (
									<ColorVariationPreview
										key={name}
										color={value}
										colorName={name}
										format={color.format as ColorFormatValue}
										defaultValue={defaultValue}
										onChangeEnd={(value) => onUpdateColor(value, index, false)}
										onReset={() => onUpdateColor(defaultValue, index, false)}
									/>
								);
							})}
						</div>

						{color.isDarkMode && (
							<div className="row margin-top-m">
								{darkItems?.map(({ value, name }, index) => {
									const defaultValue = getColorOnIndex({ state: color, index, type: variant });
									return (
										<ColorVariationPreview
											key={name}
											color={value}
											colorName={name}
											format={color.format as ColorFormatValue}
											defaultValue={defaultValue}
											onChangeEnd={(value) => onUpdateColor(value, index, true)}
											onReset={() => onUpdateColor(defaultValue, index, true)}
										/>
									);
								})}
							</div>
						)}
					</Collapse>
				)}
			</>
		);
	},
);

ColorAdditionalVariations.displayName = "ColorAdditionalVariations";
