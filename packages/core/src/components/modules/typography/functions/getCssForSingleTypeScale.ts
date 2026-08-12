import { Size } from "../types";
import { convertToDesiredUnit, round } from "utils";

const getSingleTypeScale = ({
	minFontSize,
	maxFontSize,
	minScreenWidth,
	maxScreenWidth,
}: {
	minFontSize: number;
	maxFontSize: number;
	minScreenWidth: number;
	maxScreenWidth: number;
}) => {
	const min: Size = {
		fontSize: Number(minFontSize),
		breakpoint: Number(minScreenWidth),
	};

	const max: Size = {
		fontSize: Number(maxFontSize),
		breakpoint: Number(maxScreenWidth),
	};

	const slope = (max.fontSize - min.fontSize) / (max.breakpoint - min.breakpoint);
	const slopeVw = `${round(slope * 100)}vw`;
	const intercept = min.fontSize - slope * min.breakpoint;

	return {
		min: `${round(min.fontSize)}`,
		max: `${round(max.fontSize)}`,
		preferred: `${slopeVw} + ${round(intercept)}`,
		getFontSize: (breakpoint: number) => {
			const pref = slope * breakpoint + intercept;
			return `${round(Math.min(max.fontSize, pref))}`;
		},
	};
};

interface IGetCssForSingleTypeScale {
	readonly minFontSize: number;
	readonly maxFontSize: number;
	readonly minScreenWidth: number;
	readonly maxScreenWidth: number;
	readonly isRem: boolean;
	readonly rootFontSize?: number;
}

export const getCssForSingleTypeScale = ({
	minFontSize,
	maxFontSize,
	minScreenWidth,
	maxScreenWidth,
	isRem,
	rootFontSize = 16,
}: IGetCssForSingleTypeScale) => {
	const typeScale = getSingleTypeScale({
		minFontSize,
		maxFontSize,
		minScreenWidth,
		maxScreenWidth,
	});

	const min = isRem ? `${convertToDesiredUnit(typeScale.min, "rem", rootFontSize)}` : `${typeScale.min}px`;
	const preferredArray = typeScale.preferred.split(" + ");
	const preferred = `${preferredArray[0]} + ${convertToDesiredUnit(
		preferredArray[1],
		isRem ? "rem" : "px",
		rootFontSize,
	)}`;
	const max = isRem ? `${convertToDesiredUnit(typeScale.max, "rem", rootFontSize)}` : `${typeScale.max}px`;

	return `clamp(${min}, calc(${preferred}), ${max})`;
};
