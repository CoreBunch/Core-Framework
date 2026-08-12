import { round } from "utils";
import { Size } from "components/modules/spacing";

export const getSingleTypeScale = ({
	minSize,
	maxSize,
	minScreenWidth,
	maxScreenWidth,
	rootFontSize = 16,
	sizeUnit = "px",
}: {
	minSize: number;
	maxSize: number;
	minScreenWidth: number;
	maxScreenWidth: number;
	rootFontSize?: number;
	sizeUnit?: "px" | "rem";
}) => {
	const min: Size = {
		fontSize: Number(minSize),
		breakpoint: minScreenWidth,
	};

	const max: Size = {
		fontSize: Number(maxSize),
		breakpoint: maxScreenWidth,
	};

	const slope = (max.fontSize - min.fontSize) / (max.breakpoint - min.breakpoint);
	const slopeVw = `${round(slope * 100)}vw`;
	const intercept = min.fontSize - slope * min.breakpoint;

	const args = {
		min: `${round(min.fontSize)}${sizeUnit}`,
		max: `${round(max.fontSize)}${sizeUnit}`,
		preferred: `${slopeVw} + ${round(intercept)}${sizeUnit}`,
	};

	return {
		clamp: `clamp(${args.min}, calc(${args.preferred}), ${args.max})`,
		args,
	};
};
