import { FONT_DISPLAY_OPTIONS } from "../constants";
import { z } from "zod";

export const fontVariantSchema = z.object({
	id: z.string(),
	comment: z.string(),
	cssSelector: z.string(),
	enable: z.boolean(),
	fontDisplay: z.string(),
});

export const userFontSchema = z.object({
	id: z.string(),
	category: z.string(),
	cssPreview: z.string(),
	customSelectors: z.string(),
	customVariable: z.string(),
	enable: z.boolean(),
	family: z.string(),
	fontDisplay: z.string(),
	files: z.record(z.string(), z.string()),
	title: z.string(),
	variants: z.array(fontVariantSchema),
});

export const fontsDataSchema = z.object({
	fonts: z.array(userFontSchema),
	isDisabled: z.boolean().optional(),
});
