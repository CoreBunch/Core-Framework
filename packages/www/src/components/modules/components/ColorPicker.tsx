import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Info } from "../../../assets/icons/Info.icon";
import { useDebounce } from "../../../hooks/useDebounce";
import { useGetColor } from "../../../hooks/useGetColor";
import { Autocomplete } from "../../basic/Autocomplete";
import { ColorFormatValue } from "../colorSystem";
import { Tooltip } from "@mantine/core";
import { colord } from "colord";
import { getDefaultColorInFormat } from "utils";
import { parseColor } from "@adobe/react-spectrum";

const hexFormats = ["hex", "hexa"];

interface ColorPickerProps {
	onChange: (color: string) => void;
	onBlur: (color: string) => void;
	value: string | undefined;
	format: ColorFormatValue;
	variableName: string;
	isDark?: boolean;
}

export const ColorPicker = memo<ColorPickerProps>(
	({ onChange, onBlur, value, format, variableName, isDark = false }) => {
		const { getColor, isValidColorValue, errorMsg, parseColorValue, colorVariables } = useGetColor();

		const loadedColor = useRef(value);

		const inputValue = useDebounce(value ?? "", 200);
		const [pasteValue, setPasteValue] = useState("");
		const [previewVariable, setPreviewVariable] = useState(value ?? "");

		const [isFormatChanged, setIsFormatChanged] = useState(false);
		const [prevFormat, setPrevFormat] = useState(format);

		const isRawFormat = useMemo(() => format === "raw", [format]);
		const validFormat = useMemo(() => (format === "raw" ? "hex" : format), [format]);

		const parsedColor = useMemo(() => {
			try {
				if (!value) return parseColor(getDefaultColorInFormat(validFormat));

				const color = getColor(value, isDark);
				const isConversionFromHslToHex = color?.startsWith("hsl") && hexFormats.includes(validFormat);
				if (isConversionFromHslToHex) {
					const colorDInstance = colord(color ?? getDefaultColorInFormat(validFormat));
					return parseColor(colorDInstance.toHex());
				}

				return parseColor(color ?? getDefaultColorInFormat(validFormat)).toFormat(validFormat);
			} catch {
				return parseColor(getDefaultColorInFormat(validFormat)).toFormat(validFormat);
			}
		}, [value, validFormat, getColor, isDark]);

		const filteredSuggestions = useMemo(() => {
			if (!isRawFormat) return [];

			return colorVariables
				.filter(({ colorDarkValue, colorValue, name }) => {
					const colorCheck = isDark ? colorDarkValue : colorValue;
					return colorCheck && !name.toLowerCase().includes(variableName.toLowerCase());
				})
				.map(({ colorDarkValue, colorValue, name }) => {
					return {
						value: `--${name}`,
						color: isDark ? getColor(colorDarkValue ?? "", true) : getColor(colorValue),
						group: "Colors",
					};
				});
		}, [isRawFormat, colorVariables, getColor, isDark, variableName.toLowerCase]);

		const handleValueChange = (value: string) => {
			const validColor = !isRawFormat ? getColor(value, isDark) : value;
			const isSameColor =
				validColor.toLowerCase() ===
				parseColorValue(getColor(value, isDark), validFormat, isDark).toString(validFormat).toLowerCase();

			onChange(validColor);
			if (!isSameColor) onBlur?.(validColor);
		};

		const handleValueInputFocus = () => {};

		const handleValueInputBlur = () => {
			const color = pasteValue || (value as string);
			const isSameColor =
				getColor(color, isDark) ===
				parseColorValue(loadedColor.current as string, validFormat, isDark).toString(validFormat);
			const handleChangeOnBlur = !isSameColor && !isRawFormat;

			let validColor: string;
			try {
				validColor = !isRawFormat
					? parseColor(getColor(color as string, isDark)).toString(validFormat) || color
					: (color as string) ?? previewVariable;
			} catch (e) {
				validColor = (color as string) ?? previewVariable;
			}

			if (handleChangeOnBlur) onChange(validColor);
			if (!isSameColor) onBlur?.(validColor);
			setPasteValue("");
		};

		const handleSuggestionPreview = (value: string) => {
			setPreviewVariable(`var(${value})`);
		};

		const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
			setTimeout(() => {
				const pastedValue = (event.target as HTMLInputElement)?.value;
				setPasteValue(pastedValue);
			}, 0);
		};

		useEffect(() => {
			if (isFormatChanged) {
				onChange(parsedColor.toString(validFormat));
				setIsFormatChanged(false);
			}
		}, [isFormatChanged, onChange, parsedColor.toString, validFormat]);

		useEffect(() => {
			if (prevFormat !== format) {
				loadedColor.current = value;
				setIsFormatChanged(true);
			}
			setPrevFormat(format);
		}, [format, prevFormat, value]);

		return (
			<Tooltip label={isDark ? "Color value in dark mode" : "Color value"} withArrow>
				<div className="ColorInput">
					<Autocomplete
						onBlur={handleValueInputBlur}
						onChange={handleValueChange}
						onFocus={handleValueInputFocus}
						onSuggestionPreview={handleSuggestionPreview}
						onPaste={handlePaste}
						value={inputValue}
						data={filteredSuggestions || []}
						allowMultipleWords={true}
						placeholder="Value"
					/>

					{isRawFormat && !isValidColorValue(value as string, isDark) && (
						<Tooltip label={errorMsg.current} position="top" openDelay={300} width={250} multiline withArrow>
							<span className="help-tooltip">
								<Info />
							</span>
						</Tooltip>
					)}
				</div>
			</Tooltip>
		);
	},
);
