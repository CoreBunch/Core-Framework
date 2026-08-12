import { useCallback } from "react";
import { generateColorSystemObjects } from "components/modules/colorSystem/functions/generateColorSystemObjects";
import { generateSpacingObjects } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { generateFluidTypographyObjects } from "components/modules/typography/functions/getFluidTypeVariables";
import { DEFAULT_MIN_SCREEN_WIDTH } from "data/defaults";
import { useAtomCallback } from "jotai/utils";
import {
	colorStylesAtom,
	componentsStylesAtom,
	designStylesAtom,
	getNestedCssObjects,
	getPresetFromCurrentPresetAtom,
	layoutsStylesAtom,
	otherStylesAtom,
	presetPreferencesSelector,
	spacingStylesAtom,
	typographyStylesAtom,
} from "state";

// import { generateComponentsObjects } from "components/modules/components/functions/generateComponentsObjects";

export type SearchItems = {
	colors: CssObject[];
	typography: CssObject[];
	spacing: CssObject[];
	components: CssObject[];
	layouts: CssObject[];
	design: CssObject[];
	other: CssObject[];
};

const TRANSFORM_SELECTORS = [":root", "cf-theme"];
const SELECTOR_STARTS = [".", "--"];

const filterCssObjects = (items: CssObject[], inputValue: string) => {
	return items
		.map((cssObject) => {
			const isRoot = TRANSFORM_SELECTORS.some((selector) =>
				cssObject.selector.toLowerCase().includes(selector.toLowerCase()),
			);
			const matchesSelector = cssObject.selector.toLowerCase().includes(inputValue);

			if (isRoot) {
				const filteredDeclarations = cssObject.declarations.filter((declaration) =>
					declaration.property.toLowerCase().includes(inputValue),
				);
				return filteredDeclarations.length ? { ...cssObject, declarations: filteredDeclarations } : null;
			}
			return matchesSelector ? cssObject : null;
		})
		.filter(Boolean);
};

const transformDeclarations = (items: CssObject[]): CssObject[] => {
	const transformedDeclarations: CssObject[] = [...items]
		.reduce((acc: any[], item: CssObject) => {
			const shouldTransform = TRANSFORM_SELECTORS.some((selector) =>
				item.selector.toLowerCase().includes(selector.toLowerCase()),
			);
			if (shouldTransform) {
				const transformed = item.declarations.map((declaration) => ({
					id: declaration.id,
					selector: declaration.property,
					types: declaration.types || [],
					mediaQuery: item.mediaQuery,
					groupName: declaration.groupName ?? item.groupName,
					declaration: [],
				}));
				return [...acc, ...transformed];
			}
			return acc;
		}, [])
		.filter((el: CssObject) => SELECTOR_STARTS.some((symbol) => el.selector.startsWith(symbol)));

	const filteredData: CssObject[] = items.filter(
		(item) =>
			!TRANSFORM_SELECTORS.some((selector) => item.selector.toLowerCase().includes(selector.toLowerCase())),
	);

	return [...filteredData, ...transformedDeclarations];
};

export function useGlobalSearch() {
	const getAtoms = useAtomCallback(
		useCallback(
			(get) => ({
				preset: get(getPresetFromCurrentPresetAtom),
				preferences: get(presetPreferencesSelector),
				colorStyles: get(colorStylesAtom),
				typographyStyles: get(typographyStylesAtom),
				spacingStyles: get(spacingStylesAtom),
				layoutsStyles: get(layoutsStylesAtom),
				designStyles: get(designStylesAtom),
				componentsStyles: get(componentsStylesAtom),
				otherStyles: get(otherStylesAtom),
			}),
			[],
		),
	);

	const search = (value: string) => {
		const result: SearchItems = {
			colors: [],
			typography: [],
			spacing: [],
			design: [],
			other: [],
			components: [],
			layouts: [],
		};
		const {
			preset,
			preferences,
			colorStyles,
			typographyStyles,
			spacingStyles,
			layoutsStyles,
			designStyles,
			componentsStyles,
			otherStyles,
		} = getAtoms();

		if (!value || !preset) return result;
		value = value.toLowerCase();

		const {
			root_font_size = 16,
			min_screen_width = DEFAULT_MIN_SCREEN_WIDTH,
			max_screen_width = DEFAULT_MIN_SCREEN_WIDTH,
			is_rem = true,
			is_add_group_comments,
		} = preferences;
		const { COLOR_SYSTEM, FLUID_TYPOGRAPHY, FLUID_SPACING, COMPONENTS } = preset.modulesData || {};

		const defaultPreferences = {
			min_screen_width,
			max_screen_width,
			is_rem,
			root_font_size,
			is_add_group_comments,
			includeVariants: true,
		};

		const processStyles = (styles: StylesGroup[], targetArray: CssObject[]) => {
			const nestedStyles = getNestedCssObjects(styles, is_add_group_comments, true);
			if (nestedStyles.length) {
				const transformedData = transformDeclarations(nestedStyles);
				targetArray.push(...filterCssObjects(transformedData, value));
			}
		};

		const generateObjects = (
			generator: Function,
			preferences: any,
			targetArray: CssObject[],
			value: string,
		) => {
			const objects: CssObject[] = generator({ ...preferences });
			const transformedData = transformDeclarations(objects);
			targetArray.push(...filterCssObjects(transformedData, value));
		};

		if (COLOR_SYSTEM) {
			generateObjects(
				generateColorSystemObjects,
				{
					formData: COLOR_SYSTEM,
					manualTheme: true,
					classPrefix: "",
					isAddGroupComments: is_add_group_comments,
					includeVariants: true,
				},
				result.colors,
				value,
			);
		}
		if (FLUID_TYPOGRAPHY) {
			generateObjects(
				generateFluidTypographyObjects,
				{
					formData: FLUID_TYPOGRAPHY,
					...defaultPreferences,
				},
				result.typography,
				value,
			);
		}
		if (FLUID_SPACING) {
			generateObjects(
				generateSpacingObjects,
				{
					formData: FLUID_SPACING,
					...defaultPreferences,
				},
				result.spacing,
				value,
			);
		}

		// TODO: By component
		// if (COMPONENTS) {
		//     generateObjects(generateComponentsObjects, {
		//         componentsData: COMPONENTS,
		//         is_add_group_comments,
		//         includeVariants: true
		//     }, result.components, value);
		// }

		processStyles(colorStyles, result.colors);
		processStyles(typographyStyles, result.typography);
		processStyles(spacingStyles, result.spacing);
		processStyles(componentsStyles, result.components);
		processStyles(layoutsStyles, result.layouts);
		processStyles(designStyles, result.design);
		processStyles(otherStyles, result.other);

		return result;
	};

	return {
		search,
	};
}
