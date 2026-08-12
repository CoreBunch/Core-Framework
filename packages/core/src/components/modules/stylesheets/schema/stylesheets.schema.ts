import { z } from "zod";

export const stylesheetGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	css: z.string(),
	isActive: z.boolean(),
});

export const stylesheetsDataSchema = z.object({
	isDisabled: z.boolean().optional(),
	groups: z.array(stylesheetGroupSchema),
});

export type StylesheetGroup = z.infer<typeof stylesheetGroupSchema>;
export type StylesheetsData = z.infer<typeof stylesheetsDataSchema>;
