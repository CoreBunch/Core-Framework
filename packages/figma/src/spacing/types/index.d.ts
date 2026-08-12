import {
	breakpointConfigSchema,
	oldSpacingSchema,
	spacingClassGenerationSchema,
	spacingData,
	spacingGroupSchema,
} from "../schema/SpacingCalculator.schema";
import { z } from "zod";

export type BreakpointConfig = z.infer<typeof breakpointConfigSchema>;

export type SpacingData = z.infer<typeof spacingData> & BaseModuleData;

export type SpacingItem = z.infer<typeof spacingGroupSchema>;

export type OldSpacingItem = z.infer<typeof oldSpacingSchema>;

export type SpacingClassItem = z.infer<typeof spacingClassGenerationSchema>;

export type TypeScale = {
	min: string;
	max: string;
	preferred: string;
	getFontSize: (breakpoint: number) => string;
};

export type Scale = {
	min: string;
	max: string;
	preferred: string;
	getSize: (breakpoint: number) => string;
};

export type Results = {
	scales: Scale[];
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
				space: SpacingItem;
			};
	  }
	| {
			type: "create";
			payload: SpacingItem;
	  }
	| {
			type: "disable";
	  };

export type FormAction =
	| {
			type: "minSize";
			payload: number | string;
	  }
	| {
			type: "maxSize";
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
			payload: SpacingItem;
	  }
	| { type: "removeStepBefore" }
	| { type: "removeStepAfter" }
	| {
			type: "toggleIsCustomMinScaleRatio";
	  }
	| {
			type: "toggleIsCustomMaxScaleRatio";
	  }
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
