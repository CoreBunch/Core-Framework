import { COMPONENTS_TYPES } from "../data/constants";
import { z } from "zod";

export const componentsTypeSchema = z.enum(COMPONENTS_TYPES);

/**
 * This should be imported - but throws an error
 */
const cssDeclarationSchema = z.object({
	property: z.string(),
	value: z.string(),
	type: z.string().optional(),
	fluidValue: z.array(z.number().or(z.string())).length(3).optional(),
	colorValue: z.string().optional(),
	id: z.string(),
});

export const declarationsWithStateSchema = z.record(z.string(), z.array(cssDeclarationSchema));

export const variantSchema = z.object({
	id: z.string(),
	type: z.string(),
	parentId: z.string().optional(),
	variantSelector: z.string().optional(),
	declarations: z.array(cssDeclarationSchema),
});

export const componentsSchema = z.object({
	id: z.string(),
	selector: z.string(),
	type: componentsTypeSchema,
	declarations: declarationsWithStateSchema.optional(),
	variants: z.array(variantSchema).optional(),
	order: z.array(z.string()).optional(),
});

export const componentsDataSchema = z.object({
	components: z.array(componentsSchema),
	isDisabled: z.boolean().optional(),
});
