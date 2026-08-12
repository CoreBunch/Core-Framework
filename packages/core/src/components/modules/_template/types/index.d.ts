import { z } from "zod";

export type TemplateData = z.infer<typeof templateSchema>;

export type FormAction = {
	type: "reset";
	payload: Color;
};
