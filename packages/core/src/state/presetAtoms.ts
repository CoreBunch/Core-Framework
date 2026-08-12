import { FontsData } from "components/modules/fonts";
import { Getter, PrimitiveAtom, atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { COLOR_SYSTEM_INITIAL_STATE, ColorSystemFormData } from "components/modules/colorSystem";
import { COMPONENTS_INITIAL_STATE, ComponentData } from "components/modules/components";
import { SpacingData } from "components/modules/spacing";
import { StylesheetsData } from "components/modules/stylesheets";
import { TypographyData } from "components/modules/typography";
import {
	DEFAULT_PREFERENCES,
	SPACING_CALCULATOR_INITIAL_STATE,
	STYLESHEETS_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "data/defaults";
import { breakpointsAtom, selectedBreakpointAtom } from "./breakpointsAtoms";
import {
	colorStylesAtom,
	componentsStylesAtom,
	designStylesAtom,
	fontsStylesAtom,
	layoutsStylesAtom,
	otherStylesAtom,
	spacingStylesAtom,
	typographyStylesAtom,
} from "./groupsAtoms";
import {
	colorSystemFormDataAtom,
	componentsDataAtom,
	fontsDataAtom,
	spacingDataAtom,
	stylesheetsDataAtom,
	typographyDataAtom,
} from "./modulesAtoms";

export const currentPresetAtom = atom<Preset | null>(null);

export const temporaryPresetAtom = atom<Preset | null>(null);

export const presetPreferencesSelector = selectAtom(currentPresetAtom, (preset) =>
	preset ? preset.preferences : DEFAULT_PREFERENCES,
);

export const writeStylesFromPresetAtom = atom(null, (_get, set, preset: Preset) => {
	const { styleSheetData } = preset;
	const hasModulesData = "modulesData" in preset;

	type ModulesMap = Map<
		"FLUID_TYPOGRAPHY" | "COLOR_SYSTEM" | "FLUID_SPACING" | "COMPONENTS" | "FONTS" | "STYLESHEETS",
		[
			PrimitiveAtom<any>,
			TypographyData | ColorSystemFormData | SpacingData | ComponentData | FontsData | StylesheetsData,
		]
	>;

	const modulesMap: ModulesMap = new Map([
		["FLUID_TYPOGRAPHY", [typographyDataAtom, TYPOGRAPHY_INITIAL_STATE]],
		["COLOR_SYSTEM", [colorSystemFormDataAtom, COLOR_SYSTEM_INITIAL_STATE]],
		["FLUID_SPACING", [spacingDataAtom, SPACING_CALCULATOR_INITIAL_STATE]],
		["COMPONENTS", [componentsDataAtom, COMPONENTS_INITIAL_STATE]],
		["FONTS", [fontsDataAtom, { fonts: [] }]],
		["STYLESHEETS", [stylesheetsDataAtom, STYLESHEETS_INITIAL_STATE]],
	]);

	if (hasModulesData) {
		const { modulesData } = preset;

		for (const [key, [atom, defaultData]] of modulesMap) {
			const moduleData = modulesData?.[key as keyof typeof modulesData];

			// If the module exists in the preset (even if empty), use it
			if (modulesData && key in modulesData) {
				// Use only the module data from the preset, don't merge with defaults
				// This prevents issues with IDs being regenerated
				if (atom && moduleData) {
					set(atom, moduleData);
				}
			} else {
				// Module doesn't exist in the preset at all
				// Only set to default data without modifications
				set(atom, defaultData);
			}
		}
	}

	const groupsMap = new Map([
		["colorStyles", colorStylesAtom],
		["typographyStyles", typographyStylesAtom],
		["spacingStyles", spacingStylesAtom],
		["layoutsStyles", layoutsStylesAtom],
		["designStyles", designStylesAtom],
		["componentsStyles", componentsStylesAtom],
		// stylesheetsStyles is not used - stylesheets are handled as raw CSS
		["otherStyles", otherStylesAtom],
		["fontsStyles", fontsStylesAtom],
	]);

	if (!styleSheetData) {
		for (const [, atom] of groupsMap) {
			set(atom, []);
		}

		return;
	}

	for (const [key, atom] of groupsMap) {
		const hasKey =
			styleSheetData && key in styleSheetData && styleSheetData[key as keyof typeof styleSheetData];

		if (hasKey) {
			const styles = styleSheetData?.[key as keyof typeof styleSheetData];

			if (styles) {
				set(atom, styles);
			}
		}

		if (!hasKey) {
			set(atom, []);
		}
	}
});

//todo rename this non-sense
export const getPresetFromCurrentPresetAtom = atom<Preset | null>((get: Getter) => {
	const currentPreset = get(currentPresetAtom);

	if (!currentPreset) {
		return null;
	}

	const breakpoints = get(breakpointsAtom);

	const modulesData = {
		FLUID_TYPOGRAPHY: get(typographyDataAtom),
		COLOR_SYSTEM: get(colorSystemFormDataAtom),
		FLUID_SPACING: get(spacingDataAtom),
		COMPONENTS: get(componentsDataAtom),
		FONTS: get(fontsDataAtom),
		STYLESHEETS: get(stylesheetsDataAtom),
	};

	const styleSheetData: Record<StylesheetDataKeys, StylesGroup[]> = {
		colorStyles: get(colorStylesAtom),
		typographyStyles: get(typographyStylesAtom),
		spacingStyles: get(spacingStylesAtom),
		layoutsStyles: get(layoutsStylesAtom),
		designStyles: get(designStylesAtom),
		componentsStyles: get(componentsStylesAtom),
		stylesheetsStyles: [], // Not used - stylesheets handled separately
		otherStyles: get(otherStylesAtom),
		fontsStyles: get(fontsStylesAtom),
	};

	return {
		...currentPreset,
		...(breakpoints?.length && { breakpoints }),
		modulesData,
		styleSheetData,
		// Don't update timestamp here as it causes false change detection
		// updatedAt should only be set when actually saving
	};
});

export const setCurrentPresetAtom = atom(null, (_get, set, preset: Preset | null) => {
	if (!preset) {
		set(currentPresetAtom, null);
		set(temporaryPresetAtom, null);
		set(breakpointsAtom, []);
		set(typographyDataAtom, TYPOGRAPHY_INITIAL_STATE);
		set(colorSystemFormDataAtom, COLOR_SYSTEM_INITIAL_STATE);
		set(spacingDataAtom, SPACING_CALCULATOR_INITIAL_STATE);
		set(componentsDataAtom, COMPONENTS_INITIAL_STATE);
		set(colorStylesAtom, []);
		set(typographyStylesAtom, []);
		set(spacingStylesAtom, []);
		set(layoutsStylesAtom, []);
		set(designStylesAtom, []);
		set(componentsStylesAtom, []);
		set(otherStylesAtom, []);
		set(selectedBreakpointAtom, null);
		return;
	}

	if (preset?.breakpoints) {
		set(breakpointsAtom, preset.breakpoints as [number, number][] | []);
	} else {
		set(breakpointsAtom, []);
	}

	set(writeStylesFromPresetAtom, preset);
	set(selectedBreakpointAtom, null);
	set(currentPresetAtom, preset);
});
