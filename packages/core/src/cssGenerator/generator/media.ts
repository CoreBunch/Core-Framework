import { INDENTATION, NEW_LINE_CHAR } from "cssGenerator/constants";
import { IGenerateRules, generateRules } from "./rules";

export const MediaSupportedPropertiesKeys = [
	"HOVER",
	"NOT_HOVER",
	"REDUCED_MOTION",
	"NOT_REDUCED_MOTION",
	"LIGHT_MODE",
	"DARK_MODE",
] as const;

type MediaSupportedPropertiesKeys = (typeof MediaSupportedPropertiesKeys)[number];

const MEDIA_SUPPORTED_PROPERTIES_MAP = new Map<MediaSupportedPropertiesKeys, string>([
	["HOVER", "(hover: hover)"],
	["NOT_HOVER", "(hover: none)"],
	["REDUCED_MOTION", "(prefers-reduced-motion: reduce)"],
	["NOT_REDUCED_MOTION", "(prefers-reduced-motion: no-preference)"],
	["LIGHT_MODE", "(prefers-color-scheme: light)"],
	["DARK_MODE", "(prefers-color-scheme: dark)"],
]);

interface IGenerateMediaString {
	readonly cssObject: CssObject;
	readonly options: IGenerateRules["options"];
}

export function generateMediaString({ cssObject, options }: IGenerateMediaString): string {
	const { media, ...rest } = cssObject;
	const rule = generateRules({
		cssObject: rest,
		options,
	});

	if (!media) {
		return rule;
	}

	const mediaString = MEDIA_SUPPORTED_PROPERTIES_MAP.get(media);

	if (!mediaString) {
		return rule;
	}

	return `${NEW_LINE_CHAR}@media ${mediaString} {${rule
		.split(NEW_LINE_CHAR)
		.join(NEW_LINE_CHAR + INDENTATION)}${NEW_LINE_CHAR}}`;
}
