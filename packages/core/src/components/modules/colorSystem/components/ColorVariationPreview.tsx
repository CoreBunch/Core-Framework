import { memo, useEffect, useMemo, useState } from "react";
import { flags } from "flags";
import { useGetColor } from "hooks/useGetColor";
import { copyToClipboard } from "utils";
import { Popover, PopoverContent, PopoverTrigger } from "components/CustomPopover";
import { Tooltip } from "components/ui/Tooltip";
import { COLOR_CHANNELS_CONFIG, HSL_FORMATS } from "../constants/formats";
import { ColorFormatValue } from "../index";
import { ColorArea, ColorSlider, ColorWheel, Provider, defaultTheme } from "@adobe/react-spectrum";
import { Input } from "@mantine/core";
import type { Color } from "@adobe/react-spectrum";

interface ColorVariationPreview {
	color: string;
	format: ColorFormatValue;
	colorName: string;
	defaultValue: string;
	onChangeEnd: (color: string) => void;
	onReset?: () => void;
}

export const ColorVariationPreview = memo<ColorVariationPreview>(
	({ color, format, colorName, defaultValue, onChangeEnd, onReset }) => {
		const { parseColorValue, colorChannels } = useGetColor();

		const [colorValue, setColorValue] = useState(color);
		const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);

		const [isVariableCopied, setIsVariableCopied] = useState(false);
		const [isColorCopied, setIsColorCopied] = useState(false);

		const validFormat = useMemo(() => (format === "raw" ? "hex" : format), [format]);
		const parsedColor = useMemo(
			() => parseColorValue(isEditPopoverOpen ? colorValue : color, validFormat),
			[isEditPopoverOpen, color, colorValue, validFormat, parseColorValue],
		);

		const [, saturationChannel, lightnessChannel] = colorChannels(parsedColor, validFormat);
		const currentChannels = COLOR_CHANNELS_CONFIG[validFormat] || [];

		const handleChange = (value: string | Color) => setColorValue(value.toString(validFormat));
		const handleChangeEnd = (value: Color) => onChangeEnd(value.toString(validFormat));
		const handleBlur = () => {
			const value = parsedColor.toString(validFormat);
			setColorValue(value);
			onChangeEnd(value);
		};
		const handleReset = () => {
			onReset?.();
			setColorValue(defaultValue);
		};

		const copyVariable = async (type: "var" | "color") => {
			await copyToClipboard(type === "var" ? `var(--${colorName})` : parsedColor.toString(validFormat));

			const setCopied = type === "var" ? setIsVariableCopied : setIsColorCopied;
			setCopied(true);

			setTimeout(() => setCopied(false), 2000);
		};

		// Sync local colorValue with prop when color changes externally (not while editing).
		// Note: this intentionally discards in-flight popover edits when the popover closes —
		// the input's onBlur (handleBlur) commits valid edits before this fires in the normal flow.
		useEffect(() => {
			if (!isEditPopoverOpen) setColorValue(color);
		}, [color, isEditPopoverOpen]);

		return (
			<div className="color-preview" style={{ backgroundColor: colorValue }}>
				<div className="top-overlay" style={{ opacity: isEditPopoverOpen ? 1 : undefined }}>
					<Popover onOpenChange={setIsEditPopoverOpen} open={isEditPopoverOpen} placement="bottom" modal>
						{flags.editShadeAndTint && (
							<PopoverTrigger
								onClick={() => setIsEditPopoverOpen(!isEditPopoverOpen)}
								className="copy-color"
								style={{ zIndex: 10 }}
							>
								Edit
							</PopoverTrigger>
						)}

						<PopoverContent className="ColorPickerTrigger">
							<Provider theme={defaultTheme} UNSAFE_style={{ borderRadius: "var(--radius-btn)" }}>
								<div className="padding-m bg-dropdown radius">
									<span
										className="opacity-60 text-l"
										style={{ marginBottom: "var(--space-s)", display: "block" }}
									>
										--{colorName}
									</span>

									<Input.Wrapper __staticSelector="ColorInput" style={{ marginBottom: "var(--space-s)" }}>
										<Input<"input">
											spellCheck={false}
											value={colorValue}
											onChange={(e) => setColorValue(e.currentTarget.value)}
											onBlur={handleBlur}
										/>
									</Input.Wrapper>

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

									<button
										onClick={handleReset}
										className="copy-color btn-tertiary btn-s"
										style={{ marginTop: "var(--space-m)" }}
									>
										Reset
									</button>
								</div>
							</Provider>
						</PopoverContent>
					</Popover>
				</div>

				<div
					className="bottom-overlay"
					style={{ ...(isEditPopoverOpen ? { zIndex: 99999, opacity: 1 } : {}) }}
				>
					<Tooltip
						label={isVariableCopied ? "Variable copied!" : `var(--${colorName})`}
						style={{ backgroundColor: isVariableCopied ? "green" : "" }}
						position="bottom"
						withArrow
					>
						<button onClick={() => copyVariable("var")} className="copy-color">
							Var
						</button>
					</Tooltip>

					<Tooltip
						label={isColorCopied ? "Color copied!" : parsedColor.toString(validFormat)}
						style={{ backgroundColor: isColorCopied ? "green" : "" }}
						position="bottom"
						withArrow
					>
						<button onClick={() => copyVariable("color")} className="copy-color">
							Color
						</button>
					</Tooltip>
				</div>
			</div>
		);
	},
);

ColorVariationPreview.displayName = "ColorVariationPreview";
