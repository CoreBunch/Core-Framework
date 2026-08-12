import { atomWithStorage } from "jotai/utils";

export const themeModeAtom = atomWithStorage<"light" | "dark" | "gray">("themeMode", "dark");

export const previewedThemeAtom = atomWithStorage<boolean>("previewedTheme", false);
