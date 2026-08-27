import { FontData } from "../types";

export const getFontProps = (fontString: string): { weight: string; style: string } => {
	const weightRegex = /^(\d{3})/;
	const match = fontString.match(weightRegex);
	let weight = "400";
	let style = "normal";

	if (match) {
		weight = match[1];
		style = fontString.replace(weight, "").toLowerCase() || style;
	} else if (fontString.includes("italic")) {
		style = "italic";
	} else if (fontString.includes("oblique")) {
		style = "oblique";
	}

	return { weight: weight, style };
};

export const mergeRootSelectors = (cssString: string): string => {
	const rootRegex = /:root\s*{([^}]*)}/g;
	let mergedVariables = "";

	let match;
	while ((match = rootRegex.exec(cssString)) !== null) {
		mergedVariables += "   " + match[1].trim() + "\n";
	}

	const cleanedCss = cssString.replace(rootRegex, "").trim();
	const mergedRoot = `:root {\n${mergedVariables}\n}\n`;

	return mergedRoot + cleanedCss;
};

/**
 * Sanitize a locally-stored font file name so it matches the file WordPress
 * actually writes to disk.
 *
 * The WordPress upload endpoint runs the name through `sanitize_file_name()`,
 * which collapses runs of whitespace and hyphens to a single `-` and strips a
 * set of special characters. When a font family contains a space (e.g.
 * "Source Sans 3") the raw name and the on-disk name diverge, so a
 * `src: url(...)` built from the raw family points at a file that does not
 * exist and the browser silently drops the `@font-face`.
 *
 * This mirrors the transforms `sanitize_file_name()` applies, so its output is
 * a fixed point of that function: whatever the client sends is left unchanged
 * by the server, and the generated CSS URL matches the stored file.
 */
export const sanitizeFontFileName = (name: string): string => {
	// Special characters WordPress strips (wp-includes/formatting.php). Spaces
	// are NOT in this set: they are collapsed to "-" by the step below, exactly
	// as WordPress does.
	const specialChars = new RegExp(
		"[?\\[\\]/\\\\=<>:;,'\"&$#*()|~`!{}%+\\u2019\\u00ab\\u00bb\\u201d\\u201c\\u0000]",
		"g",
	);

	return name
		.replace(/ /g, " ")
		.replace(specialChars, "")
		.replace(/%20|\+/g, "-")
		.replace(/[\r\n\t -]+/g, "-")
		.replace(/^[.\-_]+|[.\-_]+$/g, "");
};

/**
 * Build the `.woff2` file name for a locally-stored font variant, matching the
 * name WordPress writes on upload. Single source of truth for both the upload
 * request and the generated `@font-face` `src`, so they can never diverge.
 */
export const localFontFileName = (family: string, variantId: string): string =>
	sanitizeFontFileName(`${family}-${variantId}.woff2`);

export const applyFontToStylesheet = (fontFamily: string): void => {
	const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily?.replace(" ", "+")}`;
	const linkElement = document.createElement("link");
	linkElement.href = fontUrl;
	linkElement.rel = "stylesheet";
	document.head.appendChild(linkElement);
};
