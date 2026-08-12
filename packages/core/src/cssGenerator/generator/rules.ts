import { INDENTATION } from "cssGenerator/constants";
import { CssGeneratorOptions } from "cssGenerator/cssGenerator";
import { filterSameDeclarations } from "cssGenerator/filter/filterSameDeclarations";
import { generateDeclarations } from "./declarations";
import { generateMediaString } from "./media";
import { generateMediaQueryOption } from "./mediaQuery";
import { generateSelectors } from "./selectors";
import { generateRuleWithSupport } from "./support";

function getRuleString(selector: string, declarations: string) {
	if (!(declarations && selector)) {
		return "";
	}

	return `
${selector} {
${INDENTATION}${declarations.trim()}
}`;
}

function wrapWithMediaQuery(rule: string, mediaQuery: string) {
	return `
@media ${mediaQuery} {
${INDENTATION}${rule.trim()}
}`;
}

export interface IGenerateRules {
	readonly cssObject: CssObject;
	readonly options: Required<CssGeneratorOptions>;
}

// todo indentation can be passed here to limit loops
export function generateRules({ cssObject, options }: IGenerateRules) {
	const { selector, declarations, variants } = cssObject;

	if (selector.startsWith("/*") && !selector.endsWith("Vars */")) {
		return `
${selector}`;
	}

	const selectorString = generateSelectors({
		value: selector,
		prefix: options.classPrefix,
		selectorPrefix: options.selectorPrefix,
	});
	const filteredDeclarations = filterSameDeclarations(declarations);
	const declarationsString = generateDeclarations(filteredDeclarations, options);
	let rule = getRuleString(selectorString, declarationsString);

	if (!variants) {
		return rule;
	}

	for (const { declarations, mediaQuery } of variants) {
		const declarationsString = generateDeclarations(declarations, options);
		const mediaQueryString = generateMediaQueryOption(mediaQuery);
		const variantRule = getRuleString(selectorString, declarationsString);

		rule += wrapWithMediaQuery(variantRule, mediaQueryString);
	}

	return rule;
}

interface IRuleGeneratorSwitch {
	readonly cssObject: CssObject;
	readonly options: Required<CssGeneratorOptions>;
}

export function ruleGeneratorSwitch({ cssObject, options }: IRuleGeneratorSwitch) {
	if (cssObject.media) {
		return generateMediaString({
			cssObject,
			options,
		});
	}

	if (cssObject.support) {
		return generateRuleWithSupport({
			cssObject,
			options,
		});
	}

	return generateRules({
		cssObject,
		options,
	});
}
