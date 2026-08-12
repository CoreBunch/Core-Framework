import { atom } from "jotai";
import { DEFAULT_SAVE } from "data/defaults";

export const isHandleSave = atom<boolean>(false);

const _saveAtom = atom<boolean>(DEFAULT_SAVE);

export const saveAtom = atom(
	(get) => get(_saveAtom),
	(_get, set, isSave: boolean) => {
		set(_saveAtom, isSave);
		if (isSave) {
			set(isHandleSave, false);

			setTimeout(() => {
				set(_saveAtom, false);
				set(isHandleSave, true);
			}, 0);
		}
	},
);

// Store the last saved state for comparison
export const lastSavedStateAtom = atom<string>("");

// Track whether there are unsaved changes
export const hasUnsavedChangesAtom = atom<boolean>(false);
