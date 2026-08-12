import { TypographyItem } from "../types";
import { convertToVariableDeclarationName } from "utils";

export function retrieveVariablesFromTypographyState(typographyState: TypographyItem) {
	const { mode, manualSizes, steps, namingConvention } = typographyState;

	if (mode === "fluid") {
		return steps.split(",").map((step) => convertToVariableDeclarationName(`${namingConvention}-${step}`));
	}

	return manualSizes?.map((size) => convertToVariableDeclarationName(size.name)) || [];
}
