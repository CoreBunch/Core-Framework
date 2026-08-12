import { atom } from "jotai";
import { DEFAULT_SEARCH } from "data/defaults";

const _searchAtom = atom<boolean>(DEFAULT_SEARCH);

export const searchAtom = atom(
	(get) => get(_searchAtom),
	(_get, set, search: boolean) => {
		set(_searchAtom, search);
	},
);
