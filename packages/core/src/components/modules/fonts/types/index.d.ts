import { z } from "zod";

export type FontData = z.infer<typeof userFontSchema>;

export type FontVariantData = z.infer<typeof fontVariantSchema>;

export type FontsData = {
	fonts: FontData[];
} & BaseModuleData;
