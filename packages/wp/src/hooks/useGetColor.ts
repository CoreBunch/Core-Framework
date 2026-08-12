import { useCallback, useMemo, useRef } from "react";
import { ColorVariable } from "../components/modules/colorSystem";
import { colorGroupsToVariables } from "../components/modules/colorSystem/functions/colorGroupsToVariables";
import cssColorNames from "../data/cssColorNames";
import { getDefaultColorInFormat, isValidColor } from "../utils";
import { ColorFormat } from "@mantine/core/lib/ColorPicker/types";
import type { Color } from "@adobe/react-spectrum";
import { parseColor } from "@adobe/react-spectrum";
import { colord } from "colord";
import { useAtomCallback } from "jotai/utils";
import { colorSystemFormDataAtom } from "../state";

const errors = {
	overlap: "Variables cannot overlap.",
	invalid: "No such variable or color.",
};

export function useGetColor() {
	const getColorSystemFormDataAtom = useAtomCallback(useCallback((get) => get(colorSystemFormDataAtom), []));
	const colorVariables = useMemo(
		() => colorGroupsToVariables(getColorSystemFormDataAtom()),
		[getColorSystemFormDataAtom().groups],
	) as ColorVariable[];

	const errorMsg = useRef("");
	const variableRegex = /^var\(--(.*?)\)$/;
	const hexFormats = ["hex", "hexa"];

	function getColor(value: string, isDark: boolean = false, visited: Set<string> = new Set()): string {
		const regMatch = value.match(variableRegex);
		if (!regMatch) return cssColorNames[value] ?? value;

		const varName = regMatch[1];
		const variable = colorVariables.find((el) => el.name === varName);

		if (visited.has(varName)) {
			errorMsg.current = errors.overlap;
			return "";
		}

		if (variable) {
			visited.add(varName);
			const color = isDark ? variable.colorDarkValue || "" : variable.colorValue;
			return getColor(color, isDark, visited);
		}
		return cssColorNames[value] ?? value;
	}

	function isValidColorValue(value: string, isDark: boolean = false) {
		const color = getColor(value, isDark);
		const isValid = isValidColor(color);

		errorMsg.current = isValid ? "" : errorMsg.current === errors.overlap ? errors.overlap : errors.invalid;
		return isValid;
	}

	function checkInfinite(value: string, isDark: boolean = false, visited: Set<string> = new Set()): boolean {
		const regMatch = value.match(variableRegex);
		if (!regMatch) return false;

		const varName = regMatch[1];
		const variable = colorVariables.find((el) => el.name === varName);

		if (visited.has(varName)) {
			errorMsg.current = errors.overlap;
			return true;
		}

		if (variable) {
			visited.add(varName);
			const color = isDark ? variable.colorDarkValue || "" : variable.colorValue;
			return checkInfinite(color, isDark, visited);
		}

		return false;
	}

	function parseColorValue(value: string, format: ColorFormat, isDark: boolean = false) {
		try {
			if (!value) return parseColor(getDefaultColorInFormat(format));

			const color = getColor(value, isDark);
			const isConversionFromHslToHex = color?.startsWith("hsl") && hexFormats.includes(format);
			if (isConversionFromHslToHex) {
				const colorDInstance = colord(color ?? getDefaultColorInFormat(format));
				return parseColor(colorDInstance.toHex());
			}

			return parseColor(color ?? getDefaultColorInFormat(format)).toFormat(format);
		} catch {
			return parseColor(getDefaultColorInFormat(format)).toFormat(format);
		}
	}

	function colorChannels(parsedColor: Color, format: ColorFormat) {
		return useMemo(() => {
			try {
				return parsedColor.getColorChannels();
			} catch {
				const defaultColor = parseColor(getDefaultColorInFormat(format));
				return defaultColor.getColorChannels();
			}
		}, [parsedColor]);
	}

	return {
		getColor,
		colorVariables,
		errorMsg,
		isValidColorValue,
		checkInfinite,
		parseColorValue,
		colorChannels,
	};
}
