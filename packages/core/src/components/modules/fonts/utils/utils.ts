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

export const applyFontToStylesheet = (fontFamily: string): void => {
	const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily?.replace(" ", "+")}`;
	const linkElement = document.createElement("link");
	linkElement.href = fontUrl;
	linkElement.rel = "stylesheet";
	document.head.appendChild(linkElement);
};
