import { atom } from "jotai";
import { DEFAULT_VIEW } from "data/defaults";
import { NAV_ITEMS } from "constants/navItems";
import { selectedBreakpointAtom } from "./breakpointsAtoms";

const _viewAtom = atom<View>(DEFAULT_VIEW);

export const viewAtom = atom(
	(get) => get(_viewAtom),
	(_get, set, view: View) => {
		set(_viewAtom, view);

		const isPartOfContentNavigation = NAV_ITEMS.some((item) => item.value === view);

		if (!isPartOfContentNavigation) {
			set(selectedBreakpointAtom, null);
		}
	},
);
