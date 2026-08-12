import { INDENTATION, NEW_LINE_CHAR } from "cssGenerator/constants";
import { CssGeneratorOptions } from "cssGenerator/cssGenerator";
import { generateRules } from "./rules";

export const SupportedPropertiesKeys = ["CLAMP", "NOT_CLAMP", "ASPECT_RATIO", "NOT_ASPECT_RATIO"] as const;

type SupportedPropertiesKeys = (typeof SupportedPropertiesKeys)[number];

const SUPPORTED_PROPERTIES_MAP = new Map<SupportedPropertiesKeys, string>([
	["CLAMP", "(width: clamp(1px, 1px, 1px))"],
	["NOT_CLAMP", "not (width: clamp(1px, 1px, 1px))"],
	["ASPECT_RATIO", "(aspect-ratio: 1/1)"],
	["NOT_ASPECT_RATIO", "not (aspect-ratio: 1/1)"],
]);

interface IGenerateSupportString {
	readonly cssObject: CssObject;
	readonly options: Required<CssGeneratorOptions>;
}

export function generateRuleWithSupport({ cssObject, options }: IGenerateSupportString): string {
	const { support, ...rest } = cssObject;
	const rule = generateRules({
		cssObject: rest,
		options,
	});

	if (!support) {
		return rule;
	}

	const supportString = SUPPORTED_PROPERTIES_MAP.get(support);

	if (!supportString) {
		return rule;
	}

	return `${NEW_LINE_CHAR}@supports ${supportString} {${rule
		.split(NEW_LINE_CHAR)
		.join(NEW_LINE_CHAR + INDENTATION)}${NEW_LINE_CHAR}}`;
}
