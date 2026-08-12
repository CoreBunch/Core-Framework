import { Size, SpacingItem, TypeScale } from "../types";
import { round } from "utils";

interface IGetTypeScale {
	readonly state: SpacingItem;
	readonly minScreenWidth: number;
	readonly maxScreenWidth: number;
}

export function getTypeScale({ state, minScreenWidth, maxScreenWidth }: IGetTypeScale): TypeScale[] {
	const sizes: TypeScale[] = [];
	const scaleArray = state.steps.split(",").map((_, i) => i - state.baseScaleIndex);

	for (const i of scaleArray) {
		const minScaleRatio =
			state.min.isCustomScaleRatio && state.min.scaleRatioInputValue
				? state.min.scaleRatioInputValue
				: state.min.scaleRatio;
		const maxScaleRatio =
			state.max.isCustomScaleRatio && state.max.scaleRatioInputValue
				? state.max.scaleRatioInputValue
				: state.max.scaleRatio;

		let min: Size = {
			fontSize: Number(state.min.size) * Math.pow(Number(minScaleRatio), i),
			breakpoint: minScreenWidth,
		};

		let max: Size = {
			fontSize: Number(state.max.size) * Math.pow(Number(maxScaleRatio), i),
			breakpoint: maxScreenWidth,
		};

		// if (min.fontSize > max.fontSize) {
		// 	[min, max] = [max, min];
		// }

		const slope = (max.fontSize - min.fontSize) / (max.breakpoint - min.breakpoint);
		const slopeVw = `${round(slope * 100)}vw`;
		const intercept = min.fontSize - slope * min.breakpoint;

		sizes.push({
			min: `${round(min.fontSize)}`,
			max: `${round(max.fontSize)}`,
			preferred: `${slopeVw} + ${round(intercept)}`,
			getFontSize: (breakpoint: number) => {
				const pref = slope * breakpoint + intercept;
				return `${round(Math.min(max.fontSize, pref))}`;
			},
		});
	}

	return sizes;
}
