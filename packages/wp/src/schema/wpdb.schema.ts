import { z } from "zod";

export const presetRowSchema = z.nullable(
	z.object({
		id: z.string(),
		data: z.string(),
		time: z.string(),
	}),
);
