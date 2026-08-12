import {
	colorGroupSchema,
	colorItemSchema,
	colorStep,
	colorSystemSchema,
} from "../schema/colorSystem.schema";
import { ColorFormat } from "@mantine/core/lib/ColorPicker/types";
import { z } from "zod";

type Formats =
	| "hex"
	| "rgb"
	| "hsl"
	| "hsv"
	| "hwb"
	| "xyz"
	| "lab"
	| "lch"
	| "cmyk"
	| "hexa"
	| "rgba"
	| "hsla"
	| "hsva"
	| "hwba"
	| "xyz"
	| "lab"
	| "lcha"
	| "raw";

export interface IMoveColor {
	readonly id: string;
	readonly direction: "up" | "down";
}

export type ColorStep = z.infer<typeof colorStep>;

export type ColorItem = z.infer<typeof colorItemSchema>;

export type ColorGroup = z.infer<typeof colorGroupSchema>;

export type ColorSystemFormData = z.infer<typeof colorSystemSchema> & BaseModuleData;

export type ClassGeneratorValue = "text" | "bg" | "border" | "fill";

export type FormAction =
	| {
			type: "deleteColor";
			payload: {
				id: string;
				groupId: string;
			};
	  }
	| { type: "toggleDisable" }
	| {
			type: "restore";
			payload: ColorSystemFormData;
	  }
	| {
			type: "duplicate";
			payload: {
				id: string;
				groupId: string;
			};
	  }
	| {
			type: "renameGroup";
			payload: {
				groupId: string;
				name: string;
			};
	  }
	| {
			type: "restorePrimaryColor";
			payload: {
				id: string;
				groupId: string;
				color: ColorItem;
			};
	  }
	| {
			type: "restoreColorsInGroup";
			payload: {
				groupId: string;
				colors: ColorItem[];
			};
	  }
	| {
			type: "importGroup";
			payload: {
				group: ColorGroup;
				groupId?: string;
			};
	  }
	| {
			type: "importColor";
			payload: {
				color: ColorItem;
				groupId: string;
				id?: string;
			};
	  };

export type SingleColorReducerAction =
	| {
			type: "restore";
			payload: ColorItem;
	  }
	| {
			type: "rename";
			payload: {
				name: string;
				editedShades?: EditedColor[];
				editedTints?: EditedColor[];
				editedDarkShades?: EditedColor[];
				editedDarkTints?: EditedColor[];
			};
	  }
	| {
			type: "updateColor";
			payload: {
				value: string;
				colorVariables?: ColorVariable[];
			};
	  }
	| {
			type: "toggleShades";
			payload: {
				checked: boolean;
				color?: string;
				darkColor?: string;
			};
	  }
	| {
			type: "updateShadesNumber";
			payload: {
				shades: {
					name: string;
					value: string;
				}[];
				darkShades:
					| {
							name: string;
							value: string;
					  }[]
					| null;
				value: number;
			};
	  }
	| {
			type: "toggleTints";
			payload: {
				checked: boolean;
				color?: string;
				darkColor?: string;
			};
	  }
	| {
			type: "updateTintsNumber";
			payload: {
				tints: {
					name: string;
					value: string;
				}[];
				darkTints:
					| {
							name: string;
							value: string;
					  }[]
					| null;
				value: number;
			};
	  }
	| {
			type: "toggleTransparent";
			payload: {
				checked: boolean;
			};
	  }
	| {
			type: "updateClassGenerator";
			payload: {
				typeToToggle: ClassGeneratorValue;
			};
	  }
	| {
			type: "updateFormat";
			payload: {
				format: Format | undefined;
				editedShades: EditedColor[] | undefined;
				editedTints: EditedColor[] | undefined;
				editedDarkShades: EditedColor[] | undefined;
				editedDarkTints: EditedColor[] | undefined;
				colorVariables: ColorVariable[] | undefined;
			};
	  }
	| {
			type: "toggleDarkMode";
			payload: {
				checked: boolean;
				darkValue: string;
				darkShades: {
					name: string;
					value: string;
				}[];
				darkTints: {
					name: string;
					value: string;
				}[];
			};
	  }
	| {
			type: "updateDarkColor";
			payload: {
				value: string | undefined;
				colorVariables?: ColorVariable[] | undefined;
			};
	  }
	| {
			type: "updateSingleShade";
			payload: {
				value: string;
				index: number;
			};
	  }
	| {
			type: "updateSingleTint";
			payload: {
				value: string;
				index: number;
			};
	  }
	| {
			type: "updateSingleShadeDark";
			payload: {
				value: string;
				index: number;
			};
	  }
	| {
			type: "updateSingleTintDark";
			payload: {
				value: string;
				index: number;
			};
	  };

export type EditedColor = {
	index: number;
	value: string;
};

export type Shade = {
	name: string;
	value: string;
};

export type ColorFormatValue = ColorFormat | "raw";

export type ColorVariable = {
	name: string;
	colorValue: string;
	transparent?: number;
	colorDarkValue?: string;
};

export interface UpdatedWindow {
	colorVariables: ColorVariable[];
}
