import { atom } from "jotai";

type FigmaState = {
	apiKey: string;
};

export const figmaAtom = atom<FigmaState>({ apiKey: "" });
