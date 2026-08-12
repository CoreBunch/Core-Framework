import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { generateFluidSpacingResult } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { retrieveVariablesFromSpacingState } from "components/modules/spacing/functions/retrieveVariablesFromSpacingState";
import { generateFluidTypographyResult } from "components/modules/typography/functions/getFluidTypeVariables";
import { retrieveVariablesFromTypographyState } from "components/modules/typography/functions/retrieveVariablesFromTypographyState";
import {
	DEFAULT_MAX_SCREEN_WIDTH,
	DEFAULT_MIN_SCREEN_WIDTH,
	DEFAULT_PREFERENCES,
	SPACING_CALCULATOR_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "data/defaults";
import {
	changeVariablesAtom,
	currentPresetAtom,
	fluidSpacingHelperResultsAtom,
	fluidTypoGraphyHelperResultsAtom,
} from "state";

const retrieveGlobalCssVariables = (styleSheetData: Preset["styleSheetData"]) => {
	const groupsMap = new Map([
		["colorStyles", styleSheetData?.colorStyles],
		["typographyStyles", styleSheetData?.typographyStyles],
		["spacingStyles", styleSheetData?.spacingStyles],
		["layoutsStyles", styleSheetData?.layoutsStyles],
		["designStyles", styleSheetData?.designStyles],
		["componentsStyles", styleSheetData?.componentsStyles],
		["otherStyles", styleSheetData?.otherStyles],
		["fontsStyles", styleSheetData?.fontsStyles],
	]);

	if (!styleSheetData) {
		return [];
	}

	const acc = [];

	for (const [, data] of groupsMap) {
		if (!data) {
			continue;
		}

		for (const group of data) {
			if (!group?.cssObjects || group?.isDisabled) {
				continue;
			}

			if (group?.type !== "variable") {
				continue;
			}

			const { declarations } = group?.cssObjects[0];

			acc.push(
				declarations
					.map((declaration) => declaration?.property && declaration?.value && `var(${declaration.property})`)
					.filter(Boolean),
			);
		}
	}

	return acc.flat();
};

const retrieveGlobalCssObjects = (styleSheetData: Preset["styleSheetData"]) => {
	const groupsMap = new Map([
		["colorStyles", styleSheetData?.colorStyles],
		["typographyStyles", styleSheetData?.typographyStyles],
		["spacingStyles", styleSheetData?.spacingStyles],
		["layoutsStyles", styleSheetData?.layoutsStyles],
		["designStyles", styleSheetData?.designStyles],
		["componentsStyles", styleSheetData?.componentsStyles],
		["otherStyles", styleSheetData?.otherStyles],
		["fontsStyles", styleSheetData?.fontsStyles],
	]);

	if (!styleSheetData) {
		return [];
	}

	const acc = [];

	for (const [, data] of groupsMap) {
		if (!data) {
			continue;
		}

		for (const group of data) {
			if (!group?.cssObjects || group?.isDisabled) {
				continue;
			}

			if (group?.type !== "variable") {
				continue;
			}

			acc.push(group?.cssObjects);
		}
	}

	return acc.flat();
};

export const useAutoCompleteLoad = () => {
	const changeGlobalCssVariables = useSetAtom(changeVariablesAtom);
	const setFluidTypographyResult = useSetAtom(fluidTypoGraphyHelperResultsAtom);
	const setFluidSpacingResult = useSetAtom(fluidSpacingHelperResultsAtom);

	const getPreset = useAtomCallback(useCallback((get) => get(currentPresetAtom), []));

	const handleLoadOfAutocomplete = (preset: Preset) => {
		setFluidTypographyResult(
			generateFluidTypographyResult({
				typographyData: preset?.modulesData?.FLUID_TYPOGRAPHY || TYPOGRAPHY_INITIAL_STATE,
				root_font_size: Number(preset?.preferences?.root_font_size || DEFAULT_PREFERENCES.root_font_size),
				is_rem: Boolean(preset?.preferences?.is_rem || DEFAULT_PREFERENCES.is_rem),
				min_screen_width: preset?.preferences?.min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
				max_screen_width: preset?.preferences?.max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			}),
		);

		setFluidSpacingResult(
			generateFluidSpacingResult({
				spacingState: preset?.modulesData?.FLUID_SPACING || SPACING_CALCULATOR_INITIAL_STATE,
				root_font_size: Number(preset?.preferences?.root_font_size || DEFAULT_PREFERENCES.root_font_size),
				is_rem: Boolean(preset?.preferences?.is_rem || DEFAULT_PREFERENCES.is_rem),
				min_screen_width: preset?.preferences?.min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
				max_screen_width: preset?.preferences?.max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			}),
		);

		const spacingVariables = [];
		for (const space of preset?.modulesData?.FLUID_SPACING?.groups ||
			SPACING_CALCULATOR_INITIAL_STATE.groups) {
			spacingVariables.push(...retrieveVariablesFromSpacingState(space));
		}

		changeGlobalCssVariables({
			variables: spacingVariables,
			type: "SPACING",
		});

		const typographyVariables = [];
		for (const type of preset?.modulesData?.FLUID_TYPOGRAPHY?.groups || TYPOGRAPHY_INITIAL_STATE.groups) {
			typographyVariables.push(...retrieveVariablesFromTypographyState(type));
		}

		changeGlobalCssVariables({
			variables: typographyVariables,
			type: "FLUID_TYPOGRAPHY",
		});

		const globalVariables = retrieveGlobalCssVariables(preset?.styleSheetData);
		changeGlobalCssVariables({
			variables: globalVariables,
			type: "GLOBAL",
		});
	};

	const getCssVarsObjects = () => {
		const preset = getPreset();
		return retrieveGlobalCssObjects(preset?.styleSheetData);
	};

	return {
		handleLoadOfAutocomplete: (...args: Parameters<typeof handleLoadOfAutocomplete>) =>
			setTimeout(() => handleLoadOfAutocomplete(...args), 200),
		getCssVarsObjects,
	};
};
