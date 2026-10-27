import { atom } from "jotai";

// Set when the embedding page opens a project with `isViewOnly` (a public
// project someone else owns). Hides the save controls and blocks saving.
export const embedViewOnlyAtom = atom<boolean>(false);
