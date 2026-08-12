import { atom } from "jotai";

export const breakpointsAtom = atom<Breakpoints>([]);

export const selectedBreakpointAtom = atom<Breakpoint | null>(null);
