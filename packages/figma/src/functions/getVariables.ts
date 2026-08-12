import { Preset, SimpleVariable } from "../types";
import { getSimpleVariable } from "./getSimpleVariable";

const dissallowedValues = ["calc"];

export function getVariables(preset: Preset): SimpleVariable[] {
	const { preferences } = preset;

	const variables: SimpleVariable[] = [];

	if (!preset.styleSheetData) {
		return variables;
	}

	for (const stylesheetCategory of Object.values(preset.styleSheetData)) {
		for (const group of stylesheetCategory) {
			const groupName = group.name ? group.name : "No name";

			if (group.type !== "variable") {
				continue;
			}

			if (group.isDisabled) {
				continue;
			}

			for (const cssObject of group.cssObjects) {
				if (cssObject.isDisabled) {
					continue;
				}

				for (const declaration of cssObject.declarations) {
					if (dissallowedValues.some((value) => declaration.value.includes(value))) {
						continue;
					}

					variables.push(getSimpleVariable({ preferences, declaration, groupName }));
				}
			}
		}
	}

	return variables;
}
