import { INPUT_TYPES } from "../data/defaults";
import {
	componentsSchema,
	componentsStateSchema,
	componentsTypeSchema,
	declarationsWithStateSchema,
} from "../schema/components.schema";
import { z } from "zod";

export type ComponentsType = z.infer<typeof componentsTypeSchema>;

export type ComponentsState = z.infer<typeof componentsStateSchema>;

export type DeclarationsWithState = z.infer<typeof declarationsWithStateSchema>;

export type Component = z.infer<typeof componentsSchema>;

export type ComponentData = {
	components: Component[];
} & BaseModuleData;
