import directory from "../data/google-fonts.json";
import { FontData } from "../types";

type GoogleFont = Pick<FontData, "family" | "category" | "files"> & {
	variants: string[];
};

interface GoogleFontsRes {
	items: GoogleFont[];
}

const GOOGLE_FONTS_CSS_URL = "https://fonts.googleapis.com/css2";

function parseVariant(variant: string): { weight: number; italic: boolean } | null {
	const match = /^(\d+)(italic)?$/.exec(variant);
	if (!match) return null;

	return { weight: Number(match[1]), italic: Boolean(match[2]) };
}

function getCss2Axis(variants: string[]): string {
	const parsedVariants = variants
		.map(parseVariant)
		.filter((variant): variant is NonNullable<typeof variant> => variant !== null)
		.sort((a, b) => Number(a.italic) - Number(b.italic) || a.weight - b.weight);

	if (!parsedVariants.length) {
		throw new Error("No supported Google Font variants were selected");
	}

	const hasItalic = parsedVariants.some((variant) => variant.italic);

	if (!hasItalic) {
		return `wght@${parsedVariants.map((variant) => variant.weight).join(";")}`;
	}

	return `ital,wght@${parsedVariants
		.map((variant) => `${Number(variant.italic)},${variant.weight}`)
		.join(";")}`;
}

function getFileKey(variant: string): string {
	if (variant === "400") return "regular";
	if (variant === "400italic") return "italic";
	return variant;
}

function parseCss2Files(css: string, variants: string[]): Record<string, string> {
	const requestedVariants = new Set(variants);
	const candidates = new Map<string, { priority: number; url: string }>();
	const tokenPattern = /\/\*([\s\S]*?)\*\/|@font-face\s*\{([^}]+)\}/g;
	let activeSubset = "";
	let match: RegExpExecArray | null;

	while ((match = tokenPattern.exec(css)) !== null) {
		if (match[1] !== undefined) {
			const subset = match[1].trim().toLowerCase();
			if (/^[a-z][a-z0-9-]*$/.test(subset)) activeSubset = subset;
			continue;
		}

		const block = match[2];
		const weight = /font-weight\s*:\s*(\d+)/.exec(block)?.[1];
		const style = /font-style\s*:\s*(italic|normal)/.exec(block)?.[1];
		const url = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/.exec(block)?.[1];

		if (!weight || !style || !url) continue;

		const variant = `${weight}${style === "italic" ? "italic" : ""}`;
		if (!requestedVariants.has(variant)) continue;

		const priority = activeSubset === "latin" ? 3 : activeSubset === "latin-ext" ? 2 : 1;
		const current = candidates.get(variant);

		if (!current || priority > current.priority) {
			candidates.set(variant, { priority, url });
		}
	}

	const files: Record<string, string> = {};

	for (const variant of variants) {
		const candidate = candidates.get(variant);
		if (!candidate) throw new Error(`Google Fonts returned no WOFF2 file for ${variant}`);
		files[getFileKey(variant)] = candidate.url;
	}

	return files;
}

export const fetchGoogleFonts = async (): Promise<GoogleFontsRes> => {
	return {
		items: directory.items.map((font) => ({ ...font, files: {} })),
	};
};

export const fetchGoogleFontFiles = async (
	family: string,
	variants: string[],
): Promise<Record<string, string>> => {
	const axis = getCss2Axis(variants);
	const response = await fetch(
		`${GOOGLE_FONTS_CSS_URL}?family=${encodeURIComponent(family)}:${axis}&display=swap`,
	);

	if (!response.ok) {
		throw new Error(`Google Fonts CSS request failed with status ${response.status}`);
	}

	return parseCss2Files(await response.text(), variants);
};
