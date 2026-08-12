import { atom } from "jotai";
import { mergeArrays } from "utils";
import { generateColorSystemObjects } from "components/modules/colorSystem/functions/generateColorSystemObjects";
import { generateComponentsObjects } from "components/modules/components/functions/generateComponentsObjects";
import { generateSpacingObjects } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { generateFluidTypographyObjects } from "components/modules/typography/functions/getFluidTypeVariables";
import { DEFAULT_MIN_SCREEN_WIDTH } from "data/defaults";
import {
	colorSystemFormDataAtom,
	componentsDataAtom,
	spacingDataAtom,
	typographyDataAtom,
} from "./modulesAtoms";
import { currentPresetAtom, presetPreferencesSelector } from "./presetAtoms";

export const colorStylesAtom = atom<StylesGroup[]>([]);

export const typographyStylesAtom = atom<StylesGroup[]>([]);

export const spacingStylesAtom = atom<StylesGroup[]>([]);

export const layoutsStylesAtom = atom<StylesGroup[]>([]);

export const designStylesAtom = atom<StylesGroup[]>([]);

export const componentsStylesAtom = atom<StylesGroup[]>([]);

export const stylesheetsStylesAtom = atom<StylesGroup[]>([]);

export const otherStylesAtom = atom<StylesGroup[]>([]);

export const fontsStylesAtom = atom<StylesGroup[]>([]);

export const getNestedCssObjects = (
	stylesGroup: StylesGroup[],
	isAddGroupComments: boolean | undefined,
	includeGroupName?: boolean,
): CssObject[] => {
	return stylesGroup.flatMap((group, i) => {
		const groupName = group?.name;

		if (isAddGroupComments) {
			return group?.isDisabled
				? []
				: [
						{
							id: `${groupName.replace(/\s/g, "-")}-${i}`,
							selector: `/* ${groupName} */`,
							declarations: [],
							...(includeGroupName ? { groupName } : {}),
						},
						...group.cssObjects.map((css) => ({ ...css, ...(includeGroupName ? { groupName } : {}) })),
				  ];
		} else {
			return group?.isDisabled
				? []
				: group.cssObjects.map((css) => ({ ...css, ...(includeGroupName ? { groupName } : {}) }));
		}
	});
};

export const joinedStylesAtom = atom<CssObject[]>((get) => {
	const { root_font_size, min_screen_width, max_screen_width, is_rem, is_add_group_comments } =
		get(presetPreferencesSelector);

	const screenSizeVariables: CssObject[] = [
		{
			id: "screen-size-variables",
			selector: ":root",
			declarations: [
				...(min_screen_width
					? [{ id: "min-screen-width", property: "--min-screen-width", value: `${min_screen_width}px` }]
					: []),
				...(max_screen_width
					? [{ id: "max-screen-width", property: "--max-screen-width", value: `${max_screen_width}px` }]
					: []),
			],
		},
	];

	const currentPreset = get(currentPresetAtom);
	const classPrefix = currentPreset?.classPrefix;

	const colorSystemObjects = generateColorSystemObjects({
		formData: get(colorSystemFormDataAtom),
		manualTheme: true,
		classPrefix,
		isAddGroupComments: is_add_group_comments,
	});

	const fluidSpacingObjects = generateSpacingObjects({
		formData: get(spacingDataAtom),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	const fluidTypographyObjects = generateFluidTypographyObjects({
		formData: get(typographyDataAtom),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	const componentsData = get(componentsDataAtom);

	const componentsObjects = generateComponentsObjects({
		componentsData,
		is_add_group_comments,
	});

	const colorStyles = getNestedCssObjects(get(colorStylesAtom), is_add_group_comments);
	const typographyStyles = getNestedCssObjects(get(typographyStylesAtom), is_add_group_comments);
	const spacingStyles = getNestedCssObjects(get(spacingStylesAtom), is_add_group_comments);
	const layoutsStyles = getNestedCssObjects(get(layoutsStylesAtom), is_add_group_comments);
	const designStyles = getNestedCssObjects(get(designStylesAtom), is_add_group_comments);
	const componentsStyles = getNestedCssObjects(get(componentsStylesAtom), is_add_group_comments);
	// Stylesheets are handled as raw CSS, not as CssObjects
	const otherStyles = getNestedCssObjects(get(otherStylesAtom), is_add_group_comments);
	const fontsStyles = getNestedCssObjects(get(fontsStylesAtom), is_add_group_comments);

	return mergeArrays(
		screenSizeVariables,
		componentsObjects,
		colorSystemObjects,
		fluidSpacingObjects,
		fluidTypographyObjects,
		colorStyles,
		typographyStyles,
		spacingStyles,
		layoutsStyles,
		designStyles,
		componentsStyles,
		// stylesheetsStyles removed - handled as raw CSS
		otherStyles,
		fontsStyles,
	);
});

export const variablesStylesAtom = atom<CssObject[]>((get) => {
	const { root_font_size, min_screen_width, max_screen_width, is_rem, is_add_group_comments } =
		get(presetPreferencesSelector);
	const currentPreset = get(currentPresetAtom);
	const classPrefix = currentPreset?.classPrefix;

	const colorSystemObjects = generateColorSystemObjects({
		formData: get(colorSystemFormDataAtom),
		manualTheme: true,
		onlyVariables: true,
		classPrefix,
	});

	const fluidTypographyObjects = generateFluidTypographyObjects({
		formData: get(typographyDataAtom),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		onlyVariables: true,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	const fluidSpacingObjects = generateSpacingObjects({
		formData: get(spacingDataAtom),
		onlyVariables: true,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	return mergeArrays(colorSystemObjects, fluidTypographyObjects, fluidSpacingObjects);
});

export const variablesStylesWithoutColorsAtom = atom<CssObject[]>((get) => {
	const { root_font_size, min_screen_width, max_screen_width, is_rem, is_add_group_comments } =
		get(presetPreferencesSelector);

	const fluidTypographyObjects = generateFluidTypographyObjects({
		formData: get(typographyDataAtom),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		onlyVariables: true,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	const fluidSpacingObjects = generateSpacingObjects({
		formData: get(spacingDataAtom),
		onlyVariables: true,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	return mergeArrays(fluidTypographyObjects, fluidSpacingObjects);
});

export const getSortedStylesAtom = atom<CssObject[]>((get) => {
	const { root_font_size, min_screen_width, max_screen_width, is_rem, is_add_group_comments } =
		get(presetPreferencesSelector);

	const screenSizeVariables: CssObject[] = [
		{
			id: "screen-size-variables",
			selector: ":root",
			declarations: [
				...(min_screen_width
					? [{ id: "min-screen-width", property: "--min-screen-width", value: `${min_screen_width}px` }]
					: []),
				...(max_screen_width
					? [{ id: "max-screen-width", property: "--max-screen-width", value: `${max_screen_width}px` }]
					: []),
			],
		},
	];

	const currentPreset = get(currentPresetAtom);
	const classPrefix = currentPreset?.classPrefix;

	const colorSystemObjects = generateColorSystemObjects({
		formData: get(colorSystemFormDataAtom),
		manualTheme: true,
		classPrefix,
		isAddGroupComments: is_add_group_comments,
	});

	const fluidSpacingObjects = generateSpacingObjects({
		formData: get(spacingDataAtom),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	const fluidTypographyObjects = generateFluidTypographyObjects({
		formData: get(typographyDataAtom),
		min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		is_rem: is_rem ?? true,
		root_font_size: root_font_size || 16,
		is_add_group_comments,
	});

	const componentsObjects = generateComponentsObjects({
		componentsData: get(componentsDataAtom),
		is_add_group_comments,
	});

	const colorStyles = getNestedCssObjects(get(colorStylesAtom), is_add_group_comments);
	const typographyStyles = getNestedCssObjects(get(typographyStylesAtom), is_add_group_comments);
	const spacingStyles = getNestedCssObjects(get(spacingStylesAtom), is_add_group_comments);
	const layoutsStyles = getNestedCssObjects(get(layoutsStylesAtom), is_add_group_comments);
	const designStyles = getNestedCssObjects(get(designStylesAtom), is_add_group_comments);
	const componentsStyles = getNestedCssObjects(get(componentsStylesAtom), is_add_group_comments);
	// Stylesheets are handled as raw CSS, not as CssObjects
	const otherStyles = getNestedCssObjects(get(otherStylesAtom), is_add_group_comments);
	const fontsStyles = getNestedCssObjects(get(fontsStylesAtom), is_add_group_comments);

	return mergeArrays(
		screenSizeVariables,
		componentsObjects,
		colorSystemObjects,
		fluidSpacingObjects,
		fluidTypographyObjects,
		colorStyles,
		typographyStyles,
		spacingStyles,
		layoutsStyles,
		designStyles,
		componentsStyles,
		// stylesheetsStyles removed - handled as raw CSS
		otherStyles,
		fontsStyles,
	);
});
