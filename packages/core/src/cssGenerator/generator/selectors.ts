interface ISelectivelyApplySelectorPrefix {
	readonly selectorPrefix: string;
	readonly selector: string;
}

function selectivelyApplySelectorPrefix({ selectorPrefix, selector }: ISelectivelyApplySelectorPrefix) {
	if (selectorPrefix === "") {
		return "";
	}

	if (selector === "html") {
		return "";
	}

	if (selector.startsWith(":root")) {
		return "";
	}

	if (selector === "body") {
		return ".editor-styles-wrapper";
	}

	return selectorPrefix;
}

interface IGenerateSelectors {
	readonly value: string | string[];
	readonly prefix?: string;
	readonly selectorPrefix?: string;
}

export function generateSelectors({ value, prefix = "", selectorPrefix = "" }: IGenerateSelectors) {
	return Array.isArray(value)
		? value.join(", ")
		: value
				.split(",")
				.map((selector) => {
					selector = selector.trim();

					if (selector.at(0) !== ".") {
						return `${selectivelyApplySelectorPrefix({
							selectorPrefix,
							selector,
						})}${selector}`;
					}

					if ([",", "&"].some((char) => selector.includes(char))) {
						return `${selectivelyApplySelectorPrefix({
							selectorPrefix,
							selector,
						})}${selector}`;
					}

					return `${selectivelyApplySelectorPrefix({
						selectorPrefix,
						selector,
					})}.${prefix}${selector.replace(".", "")}`;
				})
				.join(", ");
}
