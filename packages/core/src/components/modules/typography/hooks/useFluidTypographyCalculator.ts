import { useReducer } from "react";
import { DEFAULT_TYPOGRAPHY_NAME } from "constants/modules";
import { duplicateTab, getNewTab } from "../functions/tabs";
import { MainFormAction, TypographyData } from "../types";
import { ulid } from "ulid";
import { TYPOGRAPHY_INITIAL_STATE } from "data/defaults";

const formReducer = (state: TypographyData, action: MainFormAction) => {
	switch (action.type) {
		case "delete": {
			const { id } = action.payload;

			return {
				...state,
				groups: state.groups.filter((group) => group.id !== id),
			};
		}
		case "duplicate": {
			const { id } = action.payload;
			const typography = state?.groups.find((group) => group.id === id);

			let duplicatedTab;
			if (typography) duplicatedTab = duplicateTab(typography, state.groups);

			return {
				...state,
				groups: [...state.groups, duplicatedTab].filter(Boolean),
			};
		}
		case "rename": {
			const { id, name } = action.payload;

			return {
				...state,
				groups: state.groups.map((group) => (group.id === id ? { ...group, name } : group)),
			};
		}
		case "reset": {
			const { id } = action.payload;
			const typography = state?.groups.find((group) => group.id === id);
			if (!typography) return state;

			const reset = getNewTab(typography.name);
			return {
				...state,
				groups: state.groups.map((group) => (group.id === id ? reset : group)),
			};
		}
		case "update": {
			const { id, typography } = action.payload;

			// IMPORTANT: never mutate `state.groups[index]` directly. The reducer's
			// initial state is the same object reference held by the Jotai atom; an
			// in-place mutation propagates to the atom *without* triggering Jotai
			// listeners, which then makes the change-detection in the parent (and in
			// useChangeDetection) see no change and leaves the "Save changes" button
			// stuck on "Changes saved" until the tab is unmounted and remounted.
			return {
				...state,
				groups: state.groups.map((group) => (group.id === id ? typography : group)),
			};
		}
		case "create": {
			const { id, name } = action.payload;

			return {
				...state,
				groups: [
					...state.groups,
					{
						...action.payload,
						id: id || ulid(),
						name: name || DEFAULT_TYPOGRAPHY_NAME,
					},
				],
			};
		}
		case "disable": {
			// Treat "enabled but empty" the same as "disabled" so a user trapped
			// in the pathological { groups: [], isDisabled: false } state gets a
			// single-click recovery path to a fully seeded default scale.
			const isCurrentlyDisabled = !!state.isDisabled || !state?.groups?.length;
			const data = isCurrentlyDisabled ? [...TYPOGRAPHY_INITIAL_STATE.groups] : [];
			const classes = isCurrentlyDisabled ? [...(TYPOGRAPHY_INITIAL_STATE.classes ?? [])] : [];

			return {
				...state,
				groups: [...data],
				isDisabled: !isCurrentlyDisabled,
				classes,
			};
		}
		default:
			return state;
	}
};

export function useFluidTypographyCalculator(TypographyData?: TypographyData) {
	const [state, dispatch] = useReducer(formReducer, TypographyData ?? TYPOGRAPHY_INITIAL_STATE);

	return {
		state,
		dispatch,
	};
}
