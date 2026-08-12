import { INDENTATION, NEW_LINE_CHAR } from "cssGenerator/constants";
import { IGenerateRules, generateRules } from "./rules";

export function generateMediaQueryOption([min, max]: number[]) {
	if (min === 0) return `(max-width: ${max}px)`;
	if (max === 0) return `(min-width: ${min}px)`;

	const [_min, _max] = [min, max].sort((a, b) => a - b);

	return `(min-width: ${_min}px) and (max-width: ${_max}px)`;
}

interface IGenerateMediaQueryString {
	readonly objectsWithMediaQueries: CssObject[];
	readonly ruleGeneratorOptions: IGenerateRules["options"];
}

export function generateMediaQueryString({
	objectsWithMediaQueries,
	ruleGeneratorOptions,
}: IGenerateMediaQueryString) {
	const mediaQueryGroups: [[number, number], CssObject[]][] = [];

	for (const cssObject of objectsWithMediaQueries) {
		const { mediaQuery } = cssObject;

		if (!mediaQuery) {
			continue;
		}

		const index = mediaQueryGroups.findIndex(([mq]) => String(mq) === String(mediaQuery));

		if (index > -1) {
			mediaQueryGroups[index][1].push(cssObject);
		}

		if (index === -1) {
			mediaQueryGroups.push([mediaQuery as [number, number], [cssObject]]);
		}
	}

	mediaQueryGroups.sort(([a], [b]) => a[0] - b[0]);
	mediaQueryGroups.sort(([a], [b]) => b[1] - a[1]);

	let mediaQueryCss = "";

	for (const [mediaQuery, cssObjects] of mediaQueryGroups) {
		let mediaQueryString = `${NEW_LINE_CHAR}@media ${generateMediaQueryOption(mediaQuery)} {`;

		const rules = cssObjects
			.map((cssObject) =>
				generateRules({
					cssObject: {
						...cssObject,
						mediaQuery: undefined,
					},
					options: ruleGeneratorOptions,
				}),
			)
			.join("");

		mediaQueryString += rules
			.split(NEW_LINE_CHAR)
			.map((line, i) => (i === 0 ? line : `${NEW_LINE_CHAR}${INDENTATION}${line}`))
			.join("");

		mediaQueryString += `${NEW_LINE_CHAR}}`;
		mediaQueryCss += mediaQueryString;
	}

	return mediaQueryCss;
}
