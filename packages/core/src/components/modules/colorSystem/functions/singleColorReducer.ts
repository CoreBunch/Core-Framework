import { ColorItem, Shade, SingleColorReducerAction } from "../types";
import { colord } from "colord";
import { convertToDesiredColorFormat } from "utils";
import { generateAdditionalColorName, generateWithCheck } from "./generateShadesTints";
import { getColor } from "./getColor";

export const singleColorReducer = (state: ColorItem, action: SingleColorReducerAction): ColorItem => {
	switch (action.type) {
		case "restore":
			return action.payload;
		case "rename": {
			const { name } = action.payload;
			const { isTints, isShades, isDarkMode, darkTints, darkShades, tints, shades, darkValue } = state;

			const generateNames = (list: Shade[], type: "shade" | "tint") =>
				list.map((item, index) => ({ ...item, name: generateAdditionalColorName({ name, index, type }) }));

			return {
				...state,
				name,
				...(isShades ? { shades: generateNames(shades || [], "shade") } : {}),
				...(isTints ? { tints: generateNames(tints || [], "tint") } : {}),
				...(isShades && isDarkMode && darkValue
					? { darkShades: generateNames(darkShades || [], "shade") }
					: {}),
				...(isTints && isDarkMode && darkValue ? { darkTints: generateNames(darkTints || [], "tint") } : {}),
			};
		}
		case "updateColor": {
			const { value, colorVariables } = action.payload;
			const isRaw = state.format === "raw";

			return {
				...state,
				value,
				...(state.isShades
					? { shades: generateWithCheck(state, isRaw ? getColor(value, colorVariables) : value, "shade") }
					: {}),
				...(state.isTints
					? { tints: generateWithCheck(state, isRaw ? getColor(value, colorVariables) : value, "tint") }
					: {}),
			};
		}
		case "updateFormat": {
			const { format, colorVariables } = action.payload;
			const { value, darkValue, isDarkMode, isShades, isTints, shades, tints, darkShades, darkTints } = state;

			const colorInstance = colord(getColor(value, colorVariables));
			const colorInDesiredFormat = convertToDesiredColorFormat(colorInstance, format);

			const colorDarkInstance =
				isDarkMode && darkValue ? colord(getColor(darkValue, colorVariables, false, true)) : colorInstance;
			const colorDarkInDesiredFormat =
				isDarkMode && darkValue
					? convertToDesiredColorFormat(colorDarkInstance, format)
					: colorInDesiredFormat;

			const formatItem = (item: Shade) => ({
				...item,
				value: convertToDesiredColorFormat(item.value, format),
			});

			return {
				...state,
				format,
				value: colorInDesiredFormat,
				darkValue: colorDarkInDesiredFormat,
				...(isShades ? { shades: shades?.map(formatItem) } : {}),
				...(isTints ? { tints: tints?.map(formatItem) } : {}),
				...(isShades && isDarkMode && darkValue ? { darkShades: darkShades?.map(formatItem) } : {}),
				...(isTints && isDarkMode && darkValue ? { darkTints: darkTints?.map(formatItem) } : {}),
			};
		}
		case "updateDarkColor": {
			const { value, colorVariables } = action.payload;
			if (!value) return state;
			const isRaw = state.format === "raw";

			return {
				...state,
				darkValue: value,
				darkShades: state.isShades
					? generateWithCheck(
							state,
							isRaw ? getColor(value, colorVariables, false, true) : value,
							"shade",
							true,
					  )
					: [],
				darkTints: state.isTints
					? generateWithCheck(
							state,
							isRaw ? getColor(value, colorVariables, false, true) : value,
							"tint",
							true,
					  )
					: [],
			};
		}
	}
};
