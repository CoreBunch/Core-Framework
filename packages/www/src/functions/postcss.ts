import postcss, { type AcceptedPlugin, Rule } from "postcss";
import process from "process";
import postcssEasingGradients from "@core-framework/core/functions/postcssEasingGradients";
import postcssPresetEnv from "postcss-preset-env";
import selectorParser from "postcss-selector-parser";

const selectorProcessor = selectorParser?.((selectors) => {
	const hoverSelectors: string[] = [];
	selectors.walk((selector) => {
		if (
			selector.type === "pseudo" &&
			selector.toString() === ":hover" &&
			selector?.parent?.value !== ":not" &&
			selector?.parent?.toString() !== ":hover" &&
			selector?.parent
		) {
			hoverSelectors.push(selector?.parent.toString());
		}
	});

	const nonHoverSelectors = selectors.reduce<string[]>((acc, selector) => {
		if (hoverSelectors.includes(selector.toString())) {
			return [...acc];
		}

		return [...acc, selector.toString()];
	}, []);

	return {
		hoverSelectors,
		nonHoverSelectors,
	};
});

const postcssHoverMedia = ({
	fallback = false,
	fallbackSelector = "html:not(.supports-touch)",
	rootSelectors = [],
} = {}) => {
	function createMediaQuery(rule: any, { AtRule }: any) {
		const media = new AtRule({
			name: "media",
			params: "(hover: hover)",
		});
		media.source = rule.source;
		media.append(rule);
		return media;
	}

	function isAlreadyNested(rule: any) {
		let container = rule.parent;

		while (container !== null && container.type !== "root") {
			if (container.type === "atrule" && container.params.includes("hover: hover")) {
				return true;
			}

			container = container.parent;
		}

		return false;
	}

	return {
		postcssPlugin: "postcss-hover-media-feature",
		Rule(rule: Rule, { AtRule }: { AtRule: Rule }) {
			if (
				!rule.selector.includes(":hover") ||
				isAlreadyNested(rule) ||
				rule.selector.includes(fallbackSelector)
			) {
				return;
			}

			let { hoverSelectors = [], nonHoverSelectors = [] } = selectorProcessor.transformSync(rule.selector, {
				lossless: false,
			});

			if (hoverSelectors.length === 0) {
				return;
			}

			const mediaQuery = createMediaQuery(
				rule.clone({
					selectors: hoverSelectors,
				}),
				{ AtRule },
			);

			rule.after(mediaQuery);

			if (fallback) {
				rule.before(
					rule.clone({
						selectors: hoverSelectors.map((hoverSelector) => {
							if (rootSelectors.some((rootSelector) => hoverSelector.startsWith(rootSelector))) {
								return `${fallbackSelector}${hoverSelector}`;
							}

							return `${fallbackSelector} ${hoverSelector}`;
						}),
					}),
				);
			}

			if (nonHoverSelectors.length > 0) {
				rule.replaceWith(rule.clone({ selectors: nonHoverSelectors }));
				return;
			}

			rule.remove();
		},
	};
};

type Options = {
	postcssEasingGradients: boolean;
	postcssHoverMedia: boolean;
};

export const runPostCss = async (input: string, options: Options) => {
	if (!window?.process) {
		window.process = process;
	}

	const { css: output } = await postcss([
		postcssPresetEnv({
			browsers: ["> 2% and not dead"],
			features: {
				clamp: false,
			},
		}),
		...(options.postcssEasingGradients ? [postcssEasingGradients()] : []),
		...(options.postcssHoverMedia ? [postcssHoverMedia()] : []),
	] as AcceptedPlugin[]).process(input, {
		from: undefined,
	});

	return output;
};
