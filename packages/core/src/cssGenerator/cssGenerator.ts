import { runPostCss } from "functions/postcss";
import { filter } from "./filter/filter";
import { generateMediaQueryString } from "./generator/mediaQuery";
import { mergeSameSelectors } from "./generator/mergeSameSelectors";
import { ruleGeneratorSwitch } from "./generator/rules";
import { prefixRootVariablesAndAddDarkModeSelector } from "./prefixer/variablePrefixer";
import { sortBySelector } from "./sort/sortBySelector";
import { mergeObjects } from "./utils";

const DEFAULT_CSS_GENERATOR_OPTIONS = {
	format: true,
	combineSelectors: false,
	propertyValidation: true,
	valueValidation: true,
	postcss: false,
	classPrefix: "",
	variablePrefix: "",
	minScreenWidth: 300,
	maxScreenWidth: 1200,
	selectorPrefix: "",
	manualDarkMode: false,
	darkModeSelector: ".cf-theme-dark",
	postcssEasingGradients: false,
	postcssHoverMedia: false,
	rootFontSize: 16,
	isRem: true,
	alwaysLightSelector: ".theme-always-light",
};

export type CssGeneratorOptions = typeof DEFAULT_CSS_GENERATOR_OPTIONS;

interface ICssGenerator {
	readonly cssObjects: CssObject[];
	readonly options?: Partial<CssGeneratorOptions>;
}

export async function cssGenerator(
	{ cssObjects, options }: ICssGenerator = {
		cssObjects: [],
		options: DEFAULT_CSS_GENERATOR_OPTIONS,
	},
) {
	const ruleGeneratorOptions: Required<CssGeneratorOptions> = mergeObjects(
		DEFAULT_CSS_GENERATOR_OPTIONS,
		options,
	);
	const {
		format,
		combineSelectors,
		postcss,
		variablePrefix,
		manualDarkMode,
		darkModeSelector,
		classPrefix,
		postcssEasingGradients,
		postcssHoverMedia,
		alwaysLightSelector,
	} = ruleGeneratorOptions;

	cssObjects = filter(cssObjects);

	if (combineSelectors) {
		cssObjects = mergeSameSelectors(cssObjects);
	}

	const { cssObjects: prefixedCssObjects, mainRootObjectId } = prefixRootVariablesAndAddDarkModeSelector({
		cssObjects,
		variablePrefix,
		darkModeSelector,
		manualDarkMode,
		classPrefix,
		alwaysLightSelector,
	});

	cssObjects = prefixedCssObjects;

	cssObjects = sortBySelector({
		cssObjects,
		mainRootObjectId,
		needsSorting: true,
	});

	const hasMediaQuery = cssObjects?.some(({ mediaQuery }) => mediaQuery?.length);
	let mediaQueryCss = "";

	if (hasMediaQuery) {
		const objectsWithMediaQueries = [];
		const filteredCssObjects = [];

		for (const cssObject of cssObjects) {
			const { mediaQuery } = cssObject;

			if (Array.isArray(mediaQuery) && mediaQuery?.length) {
				objectsWithMediaQueries.push(cssObject);
			} else {
				filteredCssObjects.push(cssObject);
			}
		}

		cssObjects = filteredCssObjects;

		mediaQueryCss = generateMediaQueryString({
			objectsWithMediaQueries,
			ruleGeneratorOptions,
		});
	}

	const css = cssObjects
		.map((cssObject) =>
			ruleGeneratorSwitch({
				cssObject,
				options: ruleGeneratorOptions,
			}),
		)
		.join("")
		.concat(mediaQueryCss)
		.trim();
	const formattedCss = format ? css : css.replace(/(\r\n|\n|\r)/gm, "");

	if (!postcss) {
		return formattedCss;
	}

	try {
		return await runPostCss(formattedCss, {
			postcssEasingGradients,
			postcssHoverMedia,
		});
	} catch (error) {
		console.warn(error);
		return formattedCss;
	}
}
