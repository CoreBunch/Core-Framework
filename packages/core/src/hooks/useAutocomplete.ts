import { useState } from "react";
import { useCallback } from "react";
import { useAtomCallback } from "jotai/utils";
import { convertToVariableName, mergeArrays, throttle } from "utils";
import { INCLUSIONS } from "constants/autocomplete";
import { PROPERTIES, cssReference } from "cssGenerator/readOnly/cssReference";
import { globalCssVariablesAtom } from "state";

interface IGetVariables {
	readonly key: GlobalVariablesKeys;
	readonly globalVariables: GlobalCssVariables;
}

const getVariables = ({ key, globalVariables }: IGetVariables) => {
	switch (key) {
		case "FLUID_TYPOGRAPHY":
			return globalVariables.FLUID_TYPOGRAPHY.map((variable) => ({
				value: convertToVariableName(variable),
				group: "Typography",
			}));
		case "COLOR_SYSTEM":
			return globalVariables.COLOR_SYSTEM.map((color) => ({
				value: convertToVariableName(color.name),
				color: color.colorValue,
				...(color.transparent && {
					transparent: color.transparent,
				}),
				group: "Colors",
			}));
		case "SPACING":
			return globalVariables.SPACING.map((variable) => ({
				value: convertToVariableName(variable),
				group: "Spacing",
			}));
		case "GLOBAL":
			return globalVariables.GLOBAL.map((variable) => ({
				value: variable,
				group: "Global",
			}));
		default:
			return [];
	}
};

export function useAutocomplete() {
	const [valueSuggestions, setValueSuggestion] = useState<
		{
			value: string;
			color?: string;
			group?: string;
		}[]
	>([]);

	const getGlobalCssVariables = useAtomCallback(useCallback((get) => get(globalCssVariablesAtom), []));

	const refreshSuggestions = useCallback(async (property: string) => {
		const cssValues =
			cssReference?.[property as keyof typeof cssReference]?.values
				.filter((value) => !(value?.startsWith("(") || value?.startsWith("[") || value?.startsWith("[prop")))
				.map((value) => ({
					value,
					group: "CSS Values",
				})) ?? [];
		const globalVariables = await getGlobalCssVariables();
		const modulesVariables = INCLUSIONS.filter(([, properties]) => properties.includes(property)).map(
			([key]) =>
				getVariables({
					key,
					globalVariables,
				}),
		);
		const common = getVariables({
			key: "GLOBAL",
			globalVariables,
		});
		const valueSuggestions = mergeArrays([...modulesVariables, common, cssValues]).map((variable) => {
			if (variable.value.startsWith("var(--")) {
				const valueWithoutVar = variable.value.replace("var(", "").replace(")", "");
				return {
					...variable,
					value: valueWithoutVar,
				};
			}

			return variable;
		});

		setValueSuggestion(valueSuggestions);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	return {
		propertySuggestions: PROPERTIES,
		valueSuggestions,
		refreshSuggestions: throttle(refreshSuggestions, 30) as (property: string) => void,
	};
}
