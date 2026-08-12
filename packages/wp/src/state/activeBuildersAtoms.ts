import { atom } from "jotai";
import { SUPPORTED_BUILDERS } from "constants/support";

export const activeBuildersAtom = atom<(typeof SUPPORTED_BUILDERS)[number][] | null>(null);
export const isOxygen6Atom = atom<boolean>(false);
