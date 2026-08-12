import { colorGroupSchema, colorItemSchema, colorSystemSchema } from "../schema/colorSystem.schema";
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
	| "lcha"
	| "raw";

export type ColorItem = z.infer<typeof colorItemSchema>;

export type ColorGroup = z.infer<typeof colorGroupSchema>;

export type ColorSystemFormData = z.infer<typeof colorSystemSchema> & BaseModuleData;

export type ClassGeneratorValue = "text" | "bg" | "border" | "fill";

export type FormAction =
	| {
			type: "restore";
			payload: ColorSystemFormData;
	  }
	| { type: "addGroup" }
	| {
			type: "renameGroup";
			payload: {
				groupId: string;
				name: string;
			};
	  }
	| {
			type: "deleteGroup";
			payload: {
				groupId: string;
			};
	  }
	| {
			type: "disableGroup";
			payload: {
				groupId: string;
			};
	  }
	| {
			type: "duplicateGroup";
			payload: {
				groupId: string;
			};
	  }
	| {
			type: "moveGroup";
			payload: {
				groupId: string;
				direction: "up" | "down";
			};
	  }
	| {
			type: "addColor";
			payload: {
				groupId: string;
			};
	  }
	| {
			type: "deleteColor";
			payload: {
				groupId: string;
				id: string;
			};
	  }
	| {
			type: "duplicateColor";
			payload: {
				groupId: string;
				id: string;
			};
	  }
	| {
			type: "moveColor";
			payload: {
				groupId: string;
				id: string;
				direction: "up" | "down";
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
			};
	  }
	| {
			type: "updateColor";
			payload: {
				value: string;
				colorVariables: ColorVariable[];
			};
	  }
	| {
			type: "updateFormat";
			payload: {
				format: ColorFormatValue;
				colorVariables: ColorVariable[];
			};
	  }
	| {
			type: "updateDarkColor";
			payload: {
				value: string | undefined;
				colorVariables: ColorVariable[];
			};
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
