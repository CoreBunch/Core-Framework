import { z } from "zod";

const AVAILABLE_FORMATS = [
	"name",
	"hex",
	"rgb",
	"hsl",
	"hsv",
	"hwb",
	"xyz",
	"lab",
	"lch",
	"cmyk",
	"hexa",
	"rgba",
	"hsla",
	"hsva",
	"hwba",
	"lcha",
	"raw",
] as const;

const shadeOrTintSchema = z.object({
	name: z.string(),
	value: z.string(),
});

export const colorItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	value: z.string(),
	isDarkMode: z.boolean().optional(),
	darkValue: z.string().optional(),
	format: z.enum(AVAILABLE_FORMATS).optional(),
	transparent: z.boolean().optional(),
	transparentVariables: z.array(z.union([z.number(), z.string()])).optional(),
	isShades: z.boolean().optional(),
	shades: z.array(shadeOrTintSchema).optional(),
	darkShades: z.array(shadeOrTintSchema).optional(),
	shadesNumber: z.number().optional(),
	isTints: z.boolean().optional(),
	tints: z.array(shadeOrTintSchema).optional(),
	darkTints: z.array(shadeOrTintSchema).optional(),
	tintsNumber: z.number().optional(),
	gen: z.array(z.string()).optional(),
	prevFormat: z.string().optional(),
});

export const colorGroupSchema = z.object({
	name: z.string(),
	colors: z.array(colorItemSchema),
	id: z.string(),
	isDisabled: z.boolean().optional(),
});

export const colorSystemSchema = z.object({
	genBg: z.boolean().optional(), // ! legacy not used since 0.0.2 - Can be removed in the future
	genText: z.boolean().optional(), // ! legacy not used since 0.0.2 - Can be removed in the future
	groups: z.array(colorGroupSchema),
});
