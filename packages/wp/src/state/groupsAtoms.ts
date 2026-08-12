// Re-export non-overridden atoms from core explicitly (to avoid shadowing conflicts)
export {
	colorStylesAtom,
	typographyStylesAtom,
	spacingStylesAtom,
	layoutsStylesAtom,
	designStylesAtom,
	componentsStylesAtom,
	stylesheetsStylesAtom,
	otherStylesAtom,
	fontsStylesAtom,
	getNestedCssObjects,
	variablesStylesAtom,
	variablesStylesWithoutColorsAtom,
} from "@core-framework/core/state/groupsAtoms";

import { atom } from "jotai";
import { mergeArrays } from "utils";
import { generateColorSystemObjects } from "components/modules/colorSystem/functions/generateColorSystemObjects";
import { generateComponentsObjects } from "components/modules/components/functions/generateComponentsObjects";
import { generateSpacingObjects } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { generateFluidTypographyObjects } from "components/modules/typography/functions/getFluidTypeVariables";
import {
	DEFAULT_EXPAND_CLICK,
	DEFAULT_EXPAND_CLICK_CLASSNAME,
	DEFAULT_MIN_SCREEN_WIDTH,
	DEFAULT_SR_ONLY,
	DEFAULT_SR_ONLY_CLASSNAME,
} from "data/defaults";
import {
	colorSystemFormDataAtom,
	componentsDataAtom,
	spacingDataAtom,
	typographyDataAtom,
} from "@core-framework/core/state/modulesAtoms";
import { currentPresetAtom, presetPreferencesSelector } from "@core-framework/core/state/presetAtoms";
import {
	colorStylesAtom,
	typographyStylesAtom,
	spacingStylesAtom,
	layoutsStylesAtom,
	designStylesAtom,
	componentsStylesAtom,
	otherStylesAtom,
	fontsStylesAtom,
	getNestedCssObjects,
} from "@core-framework/core/state/groupsAtoms";

const getExpandClickStyles = (className: string = DEFAULT_EXPAND_CLICK_CLASSNAME): CssObject[] => {
	return DEFAULT_EXPAND_CLICK.map((css) => ({
		...css,
		selector: css.selector.replace(DEFAULT_EXPAND_CLICK_CLASSNAME, className),
	}));
};

const getSROnlyStyles = (className: string = DEFAULT_SR_ONLY_CLASSNAME): CssObject[] => {
	return DEFAULT_SR_ONLY.map((css) => ({
		...css,
		selector: css.selector.replace(DEFAULT_SR_ONLY_CLASSNAME, className),
	}));
};

export const joinedStylesAtom = atom<CssObject[]>((get) => {
	const {
		root_font_size,
		min_screen_width,
		max_screen_width,
		is_rem,
		is_add_group_comments,
		is_clickable_parent,
		enable_sr_only,
	} = get(presetPreferencesSelector);

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

	let preferenceStyles = [];
	is_clickable_parent && preferenceStyles.push(getExpandClickStyles(currentPreset?.clickableParentClass));
	enable_sr_only && preferenceStyles.push(getSROnlyStyles(currentPreset?.srOnlyClass));

	const colorStyles = getNestedCssObjects(get(colorStylesAtom), is_add_group_comments);
	const typographyStyles = getNestedCssObjects(get(typographyStylesAtom), is_add_group_comments);
	const spacingStyles = getNestedCssObjects(get(spacingStylesAtom), is_add_group_comments);
	const layoutsStyles = getNestedCssObjects(get(layoutsStylesAtom), is_add_group_comments);
	const designStyles = getNestedCssObjects(get(designStylesAtom), is_add_group_comments);
	const componentsStyles = getNestedCssObjects(get(componentsStylesAtom), is_add_group_comments);
	// Stylesheets are handled as raw CSS strings, not CssObjects
	const otherStyles = getNestedCssObjects(get(otherStylesAtom), is_add_group_comments);
	const fontsStyles = getNestedCssObjects(get(fontsStylesAtom), is_add_group_comments);

	return mergeArrays(
		preferenceStyles,
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
		// stylesheetsStyles, // Removed - stylesheets are handled as raw CSS
		otherStyles,
		fontsStyles,
	);
});

export const getSortedStylesAtom = atom<CssObject[]>((get) => {
	const {
		root_font_size,
		min_screen_width,
		max_screen_width,
		is_rem,
		is_add_group_comments,
		is_clickable_parent,
		enable_sr_only,
	} = get(presetPreferencesSelector);

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

	let preferenceStyles = [];
	is_clickable_parent && preferenceStyles.push(getExpandClickStyles(currentPreset?.clickableParentClass));
	enable_sr_only && preferenceStyles.push(getSROnlyStyles(currentPreset?.srOnlyClass));

	const colorStyles = getNestedCssObjects(get(colorStylesAtom), is_add_group_comments);
	const typographyStyles = getNestedCssObjects(get(typographyStylesAtom), is_add_group_comments);
	const spacingStyles = getNestedCssObjects(get(spacingStylesAtom), is_add_group_comments);
	const layoutsStyles = getNestedCssObjects(get(layoutsStylesAtom), is_add_group_comments);
	const designStyles = getNestedCssObjects(get(designStylesAtom), is_add_group_comments);
	const componentsStyles = getNestedCssObjects(get(componentsStylesAtom), is_add_group_comments);
	// Stylesheets are handled as raw CSS strings, not CssObjects
	const otherStyles = getNestedCssObjects(get(otherStylesAtom), is_add_group_comments);
	const fontsStyles = getNestedCssObjects(get(fontsStylesAtom), is_add_group_comments);

	return mergeArrays(
		preferenceStyles,
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
		// stylesheetsStyles, // Removed - stylesheets are handled as raw CSS
		otherStyles,
		fontsStyles,
	);
});
