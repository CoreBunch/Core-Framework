import { ColorFormat } from "@mantine/core/lib/ColorPicker/types";
import { ColorChannel } from "@react-types/color";

export const HSL_FORMATS = ["hsl", "hsla"];

export const COLOR_CHANNELS_CONFIG: Partial<Record<ColorFormat, ColorChannel[]>> = {
	hsl: ["hue", "saturation", "lightness"],
	hsla: ["hue", "saturation", "lightness", "alpha"],
	rgb: ["red", "green", "blue"],
	rgba: ["red", "green", "blue", "alpha"],
	hex: ["red", "green", "blue"],
	hexa: ["red", "green", "blue", "alpha"],
};
