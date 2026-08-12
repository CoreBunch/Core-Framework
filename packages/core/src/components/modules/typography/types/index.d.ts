import {
	breakpointConfigSchema,
	fluidTypographyGroupSchema,
	fluidTypographySchema,
	oldFluidTypographySchema,
	typographyClassGenerationSchema,
} from "../schema/fluidTypographyCalculator.schema";
import { z } from "zod";

export type BreakpointConfig = z.infer<typeof breakpointConfigSchema>;

export type TypographyData = z.infer<typeof fluidTypographySchema>;

export type TypographyItem = z.infer<typeof fluidTypographyGroupSchema>;

export type OldTypographyItem = z.infer<typeof oldFluidTypographySchema>;

export type TypographyClassItem = z.infer<typeof typographyClassGenerationSchema>;

export type TypeScale = {
	min: string;
	max: string;
	preferred: string;
	getFontSize: (breakpoint: number) => string;
};

export type Results = {
	typeScales: TypeScale[];
	declarations: Record<string, string>[];
};

export type Size = {
	fontSize: number;
	breakpoint: number;
};

export type MainFormAction =
	| {
			type: "delete";
			payload: {
				id: string;
			};
	  }
	| {
			type: "duplicate";
			payload: {
				id: string;
			};
	  }
	| {
			type: "rename";
			payload: {
				id: string;
				name: string;
			};
	  }
	| {
			type: "reset";
			payload: {
				id: string;
			};
	  }
	| {
			type: "update";
			payload: {
				id: string;
				typography: TypographyItem;
			};
	  }
	| {
			type: "create";
			payload: TypographyItem;
	  }
	| {
			type: "disable";
	  };

export type FormAction =
	| {
			type: "minFontSize";
			payload: number | string;
	  }
	| {
			type: "maxFontSize";
			payload: number | string;
	  }
	| {
			type: "minScreenWidth";
			payload: number | string;
	  }
	| {
			type: "maxScreenWidth";
			payload: number | string;
	  }
	| {
			type: "minScaleRatio";
			payload: number | string;
	  }
	| {
			type: "maxScaleRatio";
			payload: number | string;
	  }
	| {
			type: "baseScaleIndex";
			payload: number;
	  }
	| {
			type: "namingConvention";
			payload: string;
	  }
	| {
			type: "steps";
			payload: string;
	  }
	| { type: "addStepBefore" }
	| { type: "addStepAfter" }
	| {
			type: "updateFormData";
			payload: TypographyItem;
	  }
	| { type: "removeStepBefore" }
	| { type: "removeStepAfter" }
	| { type: "toggleIsCustomMinScaleRatio" }
	| { type: "toggleIsCustomMaxScaleRatio" }
	| {
			type: "minScaleRatioInputValue";
			payload: number;
	  }
	| {
			type: "maxScaleRatioInputValue";
			payload: number;
	  }
	| {
			type: "updateManualSize";
			payload: any[];
	  };
