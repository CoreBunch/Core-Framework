import { useReducer } from "react";
import { COLOR_SYSTEM_INITIAL_STATE } from "../data/defaults";
import { getNewColor } from "../functions/getNewColor";
import { ColorSystemFormData, FormAction } from "../types";
import { ulid } from "ulid";

const formReducer = (state: ColorSystemFormData, action: FormAction) => {
	switch (action.type) {
		case "restore":
			return action.payload;
		case "addGroup": {
			const groups = state?.groups || [];
			const totalNumberOfColors = groups.reduce((acc, group) => acc + group.colors.length, 0);

			const newGroup = {
				id: ulid(),
				name: "New Group",
				colors: [getNewColor(totalNumberOfColors)],
			};

			return { ...state, groups: [...groups, newGroup] };
		}
		case "deleteGroup": {
			const { groupId } = action.payload;
			const groups = state.groups.filter((group) => group.id !== groupId);

			return { ...state, groups };
		}
		case "disableGroup": {
			const { groupId } = action.payload;
			const groups = state.groups?.map((group) =>
				group.id === groupId ? { ...group, isDisabled: !group.isDisabled } : group,
			);

			return { ...state, groups };
		}
		case "duplicateGroup": {
			const { groupId } = action.payload;
			const groups = state.groups || [];
			const index = groups.findIndex((group) => group.id === groupId);

			if (index === -1) return state;

			const group = groups[index];
			const duplicatedGroup = {
				...group,
				id: ulid(),
				colors: group.colors.map((color) => ({
					...color,
					id: ulid(),
				})),
			};

			const updatedGroups = [...groups.slice(0, index + 1), duplicatedGroup, ...groups.slice(index + 1)];

			return { ...state, groups: updatedGroups };
		}
		case "moveGroup": {
			const { groupId, direction } = action.payload;
			const groups = state.groups || [];
			const index = groups.findIndex((group) => group.id === groupId) || 0;

			if (index === -1) return state;

			if (direction === "up" && index > 0) {
				[groups[index - 1], groups[index]] = [groups[index], groups[index - 1]];
			} else if (direction === "down" && index < groups.length - 1) {
				[groups[index], groups[index + 1]] = [groups[index + 1], groups[index]];
			}

			return { ...state, groups };
		}
		case "renameGroup": {
			const { groupId, name } = action.payload;
			const groups = state.groups.map((group) => (group.id === groupId ? { ...group, name } : group));

			return { ...state, groups };
		}
		case "addColor": {
			const { groupId } = action.payload;
			const groups = state.groups || [];
			const totalNumberOfColors = groups.reduce((acc, group) => acc + group.colors.length, 0);

			const updatedGroups = groups.map((group) =>
				group.id === groupId
					? { ...group, colors: [...group.colors, getNewColor(totalNumberOfColors)] }
					: group,
			);

			return { ...state, groups: updatedGroups };
		}
		case "deleteColor": {
			const { groupId, id } = action.payload;
			const groups = state.groups.map((group) =>
				group.id === groupId ? { ...group, colors: group.colors.filter((color) => color.id !== id) } : group,
			);

			return { ...state, groups };
		}
		case "duplicateColor": {
			const { groupId, id } = action.payload;
			const groups = state.groups.map((group) => {
				if (group.id === groupId) {
					const index = group.colors.findIndex((color) => color.id === id);
					if (index !== -1) {
						const newColors = [
							...group.colors.slice(0, index + 1),
							{ ...group.colors[index], id: ulid() },
							...group.colors.slice(index + 1),
						];

						return { ...group, colors: newColors };
					}
				}

				return group;
			});

			return { ...state, groups };
		}
		case "moveColor": {
			const { groupId, id, direction } = action.payload;
			const groups = state.groups.map((group) => {
				if (group.id === groupId) {
					const colors = [...group.colors];
					const index = colors.findIndex((color) => color.id === id);
					if (index === -1) return group;

					let newIndex = index;
					if (direction === "up" && index > 0) newIndex--;
					else if (direction === "down" && index < colors.length - 1) newIndex++;
					else return group;

					const [movedColor] = colors.splice(index, 1);
					colors.splice(newIndex, 0, movedColor);

					return { ...group, colors };
				}

				return group;
			});

			return { ...state, groups };
		}
		default:
			return state;
	}
};

export function useColorSystem(colorSystemData: ColorSystemFormData = COLOR_SYSTEM_INITIAL_STATE) {
	const [state, dispatch] = useReducer(formReducer, colorSystemData);

	return { state, dispatch } as { state: ColorSystemFormData; dispatch: React.Dispatch<FormAction> };
}
