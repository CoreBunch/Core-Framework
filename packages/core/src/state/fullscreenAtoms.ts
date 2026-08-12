import { atomWithStorage } from "jotai/utils";

export const isFullScreenModeAtom = atomWithStorage<boolean>("isFullScreen", false);
