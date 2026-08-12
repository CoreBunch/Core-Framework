export { getFontProps, mergeRootSelectors, applyFontToStylesheet } from '@core-framework/core/components/modules/fonts/utils/utils';
import { FontData, FontVariantData } from '@core-framework/core/components/modules/fonts/types';

export const generateFontFaceCSS = (selectedFont: FontData, selectedVariants: string[]): string => {
	const customVar =
		selectedFont.customVariable?.length > 0
			? `--${selectedFont.customVariable}`
			: `--cf-font-family--${selectedFont?.family.split(" ").join("-").toLowerCase()}`;
	const rootSelector = `
:root {
	${customVar}: '${selectedFont?.family}';
}`;
	const customFontSelectors = selectedFont.customSelectors.length
		? `
${selectedFont.customSelectors} {
	font-family: var(${customVar});
}`
		: "";

	return (
		selectedFont.variants
			.filter((v: FontVariantData) => selectedVariants.includes(v.id))
			.map((variant: FontVariantData) => {
				const weight = variant.id.match(/\d{3}/)?.[0] || "400";
				const style = variant.id.includes("italic") ? "italic" : "normal";
				// Map CSS variant IDs back to Google Fonts API file keys
				const fileKey = variant.id === "400" ? "regular" : variant.id === "400italic" ? "italic" : variant.id;
				const fontURL = selectedFont.files?.[fileKey] || selectedFont.files?.[variant.id];
				const comment = variant.comment ? `\n//${variant.comment}` : "";
				const cssSelector = variant.cssSelector.length
					? `
${variant.cssSelector} {
	font-family: var(${customVar});
	font-style: ${style};
	font-weight: ${weight};
}\n`
					: "";

				return (
					comment +
					`
@font-face {
	font-family: '${selectedFont?.family}';
	font-style: ${style};
	font-weight: ${weight};
	font-stretch: 100%;
	font-display: ${variant.fontDisplay.toLowerCase()};
	src: url('${fontURL}') format('woff2');
}\n` +
					cssSelector
				);
			})
			.join("") +
		`${rootSelector}
					` +
		customFontSelectors
	);
};
