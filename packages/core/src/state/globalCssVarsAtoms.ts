import { deepEqual } from "../utils/deepEqual";
import { atom } from "jotai";

export const globalCssVariablesAtom = atom<GlobalCssVariables>({
	FLUID_TYPOGRAPHY: [],
	COLOR_SYSTEM: [],
	SPACING: [],
	GLOBAL: [],
	FONTS: [],
	STYLESHEETS: [],
});

type ChangeVariablesActions =
	| {
			type: "FLUID_TYPOGRAPHY";
			variables: string[];
	  }
	| {
			type: "COLOR_SYSTEM";
			variables: {
				name: string;
				colorValue: string;
			}[];
	  }
	| {
			type: "SPACING";
			variables: string[];
	  }
	| {
			type: "GLOBAL";
			variables: string[];
	  }
	| {
			type: "STYLESHEETS";
			variables: string[];
	  };

export const changeVariablesAtom = atom(null, (_get, set, { variables, type }: ChangeVariablesActions) => {
	const globalCssVariables = _get(globalCssVariablesAtom);

	// Check if the variables have actually changed
	const currentVariables = globalCssVariables[type];
	const hasChanged = !deepEqual(currentVariables, variables);

	// Only update if there's an actual change
	if (hasChanged) {
		set(globalCssVariablesAtom, {
			...globalCssVariables,
			[type]: variables,
		});
	}
});
