export * from "@core-framework/core/state/saveAtom";

import { atom } from "jotai";

// Shared push state atom — used by both Nav and Side components
// Only tracks IDLE vs active saving states (no SAVED state — that's a UI concern)
export const pushStateAtom = atom<string>("IDLE");

// Derived atom — true when a save is in progress (any state other than IDLE)
export const isSavingAtom = atom((get) => {
	return get(pushStateAtom) !== "IDLE";
});
