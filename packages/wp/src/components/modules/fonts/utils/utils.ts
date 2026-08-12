export { getFontProps, mergeRootSelectors, applyFontToStylesheet } from '@core-framework/core/components/modules/fonts/utils/utils';
import { FontData, FontVariantData } from '@core-framework/core/components/modules/fonts/types';
import { Font } from "fontkit";
import * as fontkit from "fontkit";

export const getCustomSubpath = () => {
	const path = window.location.pathname;
	const segments = path.split("/").filter(Boolean);
	const wpDirs = ["wp-admin", "wp-content", "wp-includes"];
	const wpIndex = segments.findIndex((seg) => wpDirs.includes(seg));
	const customSegments = wpIndex >= 0 ? segments.slice(0, wpIndex) : segments;

	return customSegments.length ? "/" + customSegments.join("/") : "";
};

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
				const subPath = getCustomSubpath();
				const fontURL = `${subPath}/wp-content/uploads/core-framework/fonts/${selectedFont.family}-${variant.id}.woff2`;
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

export const blobToBase64 = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as any);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

export const extractFontData = async (file: File): Promise<FontData> => {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);
		const font: Font = fontkit.create(buffer as Buffer) as Font;
		const os2 = font["OS/2"];

		return {
			family: font.familyName || null,
			weight: os2 ? os2.usWeightClass.toString() : "400",
			style: os2 ? (os2.fsSelection.italic ? "italic" : "normal") : null,
		};
	} catch (error) {
		console.error("Error extracting font family:", error);
		return null;
	}
};
