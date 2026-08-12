import { useReducer } from "react";
import { STYLESHEETS_INITIAL_STATE } from "data/defaults";
import { StylesheetGroup, StylesheetsAction, StylesheetsData } from "../types";
import { ulid } from "ulid";

function stylesheetsReducer(state: StylesheetsData, action: StylesheetsAction): StylesheetsData {
	switch (action.type) {
		case "create": {
			return {
				...state,
				groups: [...state.groups, action.payload],
			};
		}

		case "update": {
			return {
				...state,
				groups: state.groups.map((group) =>
					group.id === action.payload.id
						? {
								...group,
								css: action.payload.css,
								hasErrors: action.payload.hasErrors,
						  }
						: group,
				),
			};
		}

		case "delete": {
			// Don't delete if it's the only tab
			if (state.groups.length <= 1) return state;

			return {
				...state,
				groups: state.groups.filter((group) => group.id !== action.payload.id),
			};
		}

		case "duplicate": {
			const groupToDuplicate = state.groups.find((g) => g.id === action.payload.id);
			if (!groupToDuplicate) return state;

			const duplicatedGroup: StylesheetGroup = {
				...groupToDuplicate,
				id: ulid(),
				name: `${groupToDuplicate.name} (Copy)`,
			};

			const index = state.groups.findIndex((g) => g.id === action.payload.id);
			const newGroups = [...state.groups];
			newGroups.splice(index + 1, 0, duplicatedGroup);

			return {
				...state,
				groups: newGroups,
			};
		}

		case "rename": {
			return {
				...state,
				groups: state.groups.map((group) =>
					group.id === action.payload.id ? { ...group, name: action.payload.name } : group,
				),
			};
		}

		case "reset": {
			return {
				...state,
				groups: state.groups.map((group) =>
					group.id === action.payload.id ? { ...group, css: "/* Add your custom CSS here */\n" } : group,
				),
			};
		}

		case "disable": {
			return {
				...state,
				isDisabled: !state.isDisabled,
			};
		}

		case "toggle": {
			return {
				...state,
				groups: state.groups.map((group) =>
					group.id === action.payload.id ? { ...group, isActive: !group.isActive } : group,
				),
			};
		}

		default:
			return state;
	}
}

export function useStylesheets(initialState: StylesheetsData = STYLESHEETS_INITIAL_STATE) {
	const [state, dispatch] = useReducer(stylesheetsReducer, initialState);

	return {
		state,
		dispatch,
	};
}
