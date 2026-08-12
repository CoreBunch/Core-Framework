import { useCallback } from "react";
import { SetStateAction, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import {
	colorStylesAtom,
	componentsStylesAtom,
	designStylesAtom,
	layoutsStylesAtom,
	spacingStylesAtom,
	typographyStylesAtom,
} from "state";

export const useStylesEdit = () => {
	const getColorStyles = useAtomCallback(useCallback((get) => get(colorStylesAtom), []));
	const getTypographyStyles = useAtomCallback(useCallback((get) => get(typographyStylesAtom), []));
	const getSpacingStyles = useAtomCallback(useCallback((get) => get(spacingStylesAtom), []));
	const getLayoutsStyles = useAtomCallback(useCallback((get) => get(layoutsStylesAtom), []));
	const getDesignStyles = useAtomCallback(useCallback((get) => get(designStylesAtom), []));
	const getComponentsStyles = useAtomCallback(useCallback((get) => get(componentsStylesAtom), []));

	const setColorStyles = useSetAtom(colorStylesAtom);
	const setTypographyStyles = useSetAtom(typographyStylesAtom);
	const setSpacingStyles = useSetAtom(spacingStylesAtom);
	const setLayoutsStyles = useSetAtom(layoutsStylesAtom);
	const setDesignStyles = useSetAtom(designStylesAtom);
	const setComponentsStyles = useSetAtom(componentsStylesAtom);

	const getStylesMap = () =>
		new Map<
			StylesheetDataKeys,
			[
				(arg?: unknown) => StylesGroup[] | Promise<StylesGroup[]>,
				(arg: SetStateAction<StylesGroup[]>) => void,
			]
		>([
			["colorStyles", [getColorStyles, setColorStyles]],
			["typographyStyles", [getTypographyStyles, setTypographyStyles]],
			["spacingStyles", [getSpacingStyles, setSpacingStyles]],
			["layoutsStyles", [getLayoutsStyles, setLayoutsStyles]],
			["designStyles", [getDesignStyles, setDesignStyles]],
			["componentsStyles", [getComponentsStyles, setComponentsStyles]],
		]);

	const removeObjectsWithMediaQuery = async (mediaQuery: [number, number]) => {
		for (const [_key, [_getter, setter]] of getStylesMap()) {
			setter((prev) => {
				return prev.map((group) => {
					if (!group.cssObjects) {
						return group;
					}

					const cssObjectsCopy = [...group.cssObjects];
					for (const object of group.cssObjects) {
						if (String(object?.mediaQuery) === String(mediaQuery)) {
							const index = cssObjectsCopy.indexOf(object);
							cssObjectsCopy.splice(index, 1);
						}
					}

					group.cssObjects = cssObjectsCopy;
					return group;
				});
			});
		}
	};

	const editMediaQuery = async (prevMediaQuery: [number, number], newMediaQuery: [number, number]) => {
		for (const [_key, [_getter, setter]] of getStylesMap()) {
			setter((prev) => {
				for (const group of prev) {
					const { cssObjects } = group;

					if (!cssObjects) {
						continue;
					}

					for (const object of cssObjects) {
						if (object.mediaQuery && String(object.mediaQuery) === String(prevMediaQuery)) {
							object.mediaQuery = newMediaQuery;
						}
					}
				}

				return prev;
			});
		}
	};

	return {
		editMediaQuery,
		removeObjectsWithMediaQuery,
	};
};
