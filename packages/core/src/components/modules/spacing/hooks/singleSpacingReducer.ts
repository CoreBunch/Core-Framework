import { incrementSizeSuffix } from "functions/incrementSizeSuffix";
import { convertSafeCssName } from "utils";
import { FormAction, SpacingItem } from "../types";

export const singleSpacingReducer = (state: SpacingItem, action: FormAction): SpacingItem => {
	switch (action.type) {
		case "minSize": {
			return {
				...state,
				min: {
					...state.min,
					size: action.payload,
				},
			};
		}
		case "maxSize": {
			return {
				...state,
				max: {
					...state.max,
					size: action.payload,
				},
			};
		}
		case "minScreenWidth": {
			return {
				...state,
				min: {
					...state.min,
					screenWidth: action.payload,
				},
			};
		}
		case "maxScreenWidth": {
			return {
				...state,
				max: {
					...state.max,
					screenWidth: action.payload,
				},
			};
		}
		case "minScaleRatio": {
			return {
				...state,
				min: {
					...state.min,
					scaleRatio: action.payload,
				},
			};
		}
		case "maxScaleRatio": {
			return {
				...state,
				max: {
					...state.max,
					scaleRatio: action.payload,
				},
			};
		}
		case "namingConvention": {
			const newNamingConvention = convertSafeCssName(action.payload);
			return {
				...state,
				namingConvention: newNamingConvention,
			};
		}
		case "baseScaleIndex": {
			return {
				...state,
				baseScaleIndex: action.payload,
			};
		}
		case "steps": {
			return {
				...state,
				steps: action.payload,
			};
		}
		case "addStepBefore": {
			const steps = incrementSizeSuffix(state.steps, "UP");

			if (steps === state.steps) {
				return state;
			}

			const baseScaleIndex = Math.min(state.baseScaleIndex + 1, state.steps.split(",").length);

			return {
				...state,
				steps,
				baseScaleIndex,
			};
		}
		case "addStepAfter": {
			const steps = incrementSizeSuffix(state.steps, "DOWN");

			if (steps === state.steps) {
				return state;
			}

			const baseScaleIndex = Math.min(state.baseScaleIndex, state.steps.split(",").length);

			return {
				...state,
				steps,
				baseScaleIndex,
			};
		}
		case "removeStepBefore": {
			const selectedStepBefore = state.steps.split(",")[state.baseScaleIndex];
			const steps = state.steps.split(",").slice(1).join(",");
			const newBaseScaleIndex = steps.split(",").findIndex((step) => step === selectedStepBefore);
			const clampBaseScaleIndex = Math.max(Math.min(newBaseScaleIndex, steps.split(",").length - 1), 0);

			return {
				...state,
				steps,
				baseScaleIndex: clampBaseScaleIndex,
			};
		}
		case "removeStepAfter": {
			const selectedStepAfter = state.steps.split(",")[state.baseScaleIndex];
			const steps = state.steps.split(",").slice(0, -1).join(",");
			const newBaseScaleIndex = steps.split(",").findIndex((step) => step === selectedStepAfter);
			const clampBaseScaleIndex = Math.max(Math.min(newBaseScaleIndex, steps.split(",").length - 1), 0);

			return {
				...state,
				steps,
				baseScaleIndex: clampBaseScaleIndex,
			};
		}
		case "updateFormData": {
			return action.payload;
		}
		case "toggleIsCustomMinScaleRatio": {
			return {
				...state,
				min: {
					...state.min,
					isCustomScaleRatio: !state.min.isCustomScaleRatio,
					scaleRatioInputValue: Number(state.min.scaleRatioInputValue ?? state.min.scaleRatio),
				},
			};
		}
		case "toggleIsCustomMaxScaleRatio": {
			return {
				...state,
				max: {
					...state.max,
					isCustomScaleRatio: !state.max.isCustomScaleRatio,
					scaleRatioInputValue: Number(state.max.scaleRatioInputValue ?? state.max.scaleRatio),
				},
			};
		}
		case "minScaleRatioInputValue": {
			return {
				...state,
				min: {
					...state.min,
					scaleRatioInputValue: action.payload,
				},
			};
		}
		case "maxScaleRatioInputValue": {
			return {
				...state,
				max: {
					...state.max,
					scaleRatioInputValue: action.payload,
				},
			};
		}
		case "updateManualSize": {
			return {
				...state,
				manualSizes: action.payload,
			};
		}
		default:
			return state;
	}
};
