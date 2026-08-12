import { combinedPresetSchema } from "schema/preset.schema";

export function validatePreset(preset: unknown) {
	return combinedPresetSchema.safeParse(preset);
}
