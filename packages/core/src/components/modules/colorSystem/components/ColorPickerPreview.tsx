import { memo, useEffect, useMemo, useState } from "react";
import { useGetColor } from "hooks/useGetColor";
import { Popover, PopoverContent, PopoverTrigger } from "components/CustomPopover";
import { Tooltip } from "components/ui/Tooltip";
import { COLOR_CHANNELS_CONFIG, HSL_FORMATS } from "../constants/formats";
import { ColorFormatValue } from "../index";
import { ColorArea, ColorSlider, ColorWheel, Provider, defaultTheme } from "@adobe/react-spectrum";
import type { Color } from "@adobe/react-spectrum";
import { clsx } from "clsx";

interface ColorPickerPreview {
	value: string;
	format: ColorFormatValue;
	onChangeEnd: (color: string) => void;
	isDarkModeEnabled?: boolean;
	isDark?: boolean;
}

export const ColorPickerPreview = memo<ColorPickerPreview>(
	({ value, format, onChangeEnd, isDarkModeEnabled, isDark }) => {
		const { getColor, parseColorValue, colorChannels } = useGetColor();
		const [open, setOpen] = useState(false);
		const [colorValue, setColorValue] = useState(value);

		const validFormat = useMemo(() => (format === "raw" ? "hex" : format), [format]);

		const parsedColor = useMemo(
			() => parseColorValue(open ? colorValue : value, validFormat, isDark),
			[open, colorValue, value, validFormat, isDark, parseColorValue],
		);
		const [, saturationChannel, lightnessChannel] = colorChannels(parsedColor, validFormat);

		const currentChannels = COLOR_CHANNELS_CONFIG[validFormat] || [];

		const handleChange = (color: string | Color) => setColorValue(color.toString(validFormat));
		const handleChangeEnd = (color: Color) => onChangeEnd(color.toString(validFormat));

		useEffect(() => {
			if (open) setColorValue(value);
		}, [open, value]);

		return (
			<Tooltip label={isDark ? "Color preview in dark mode" : "Color preview"} withArrow>
				<Popover open={open} onOpenChange={setOpen} placement="bottom-start" initialOpen modal>
					<PopoverTrigger className={clsx("preview-item-button", { radius: !isDarkModeEnabled })}>
						<div
							className="preview-item"
							onClick={() => setOpen(true)}
							style={{ backgroundColor: getColor(open ? colorValue : value, isDark) }}
						/>
					</PopoverTrigger>

					<PopoverContent className="ColorPickerPopover">
						<Provider theme={defaultTheme}>
							{HSL_FORMATS.includes(validFormat) ? (
								<div>
									<div className="color-wheel-wrapper">
										<ColorWheel
											value={parsedColor}
											onChange={handleChange}
											onChangeEnd={handleChangeEnd}
											size="size-2400"
										/>
										<div className="color-area-wrapper">
											<ColorArea
												xChannel={saturationChannel}
												yChannel={lightnessChannel}
												value={parsedColor}
												onChange={handleChange}
												onChangeEnd={handleChangeEnd}
												size="size-1200"
											/>
										</div>
									</div>
								</div>
							) : (
								<ColorArea value={parsedColor} onChange={handleChange} onChangeEnd={handleChangeEnd} />
							)}

							{currentChannels?.map((channel, idx) => (
								<ColorSlider
									key={idx}
									defaultValue={parsedColor}
									value={parsedColor}
									onChange={handleChange}
									onChangeEnd={handleChangeEnd}
									channel={channel}
								/>
							))}
						</Provider>
					</PopoverContent>
				</Popover>
			</Tooltip>
		);
	},
);

ColorPickerPreview.displayName = "ColorPickerPreview";
