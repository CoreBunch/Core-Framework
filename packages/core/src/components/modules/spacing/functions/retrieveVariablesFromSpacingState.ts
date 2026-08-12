import { SpacingItem } from "../types";
import { convertToVariableDeclarationName } from "utils";

export function retrieveVariablesFromSpacingState(spacingState: SpacingItem) {
	const { mode, manualSizes, steps, namingConvention } = spacingState;

	if (mode === "fluid") {
		return steps.split(",").map((step) => convertToVariableDeclarationName(`${namingConvention}-${step}`));
	}

	return manualSizes?.map((size) => convertToVariableDeclarationName(size.name)) || [];
}
