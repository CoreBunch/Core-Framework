// Re-export non-overridden atoms from core explicitly (to avoid shadowing conflicts)
export {
	currentPresetAtom,
	temporaryPresetAtom,
	presetPreferencesSelector,
	getPresetFromCurrentPresetAtom,
} from "@core-framework/core/state/presetAtoms";

import { FontsData } from "components/modules/fonts";
import { PrimitiveAtom, atom } from "jotai";
import { COLOR_SYSTEM_INITIAL_STATE, ColorSystemFormData } from "components/modules/colorSystem";
import { COMPONENTS_INITIAL_STATE, ComponentData } from "components/modules/components";
import { SpacingData } from "components/modules/spacing";
import { StylesheetsData } from "components/modules/stylesheets";
import { TypographyData } from "components/modules/typography";
import {
	SPACING_CALCULATOR_INITIAL_STATE,
	STYLESHEETS_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "data/defaults";
import {
	breakpointsAtom,
	selectedBreakpointAtom,
} from "@core-framework/core/state/breakpointsAtoms";
import {
	colorStylesAtom,
	componentsStylesAtom,
	designStylesAtom,
	fontsStylesAtom,
	layoutsStylesAtom,
	otherStylesAtom,
	spacingStylesAtom,
	typographyStylesAtom,
} from "@core-framework/core/state/groupsAtoms";
import {
	colorSystemFormDataAtom,
	componentsDataAtom,
	fontsDataAtom,
	spacingDataAtom,
	stylesheetsDataAtom,
	typographyDataAtom,
} from "@core-framework/core/state/modulesAtoms";
import { currentPresetAtom } from "@core-framework/core/state/presetAtoms";

/**
 * WordPress-only
 */
export const presetsTableAtom = atom<Preset[]>([]);

/**
 * Override: adds classes:[] guard for FLUID_SPACING and FLUID_TYPOGRAPHY
 */
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
					// Special handling for FLUID_SPACING and FLUID_TYPOGRAPHY
					if (key === "FLUID_SPACING" || key === "FLUID_TYPOGRAPHY") {
						const typedModuleData = moduleData as any;
						// Ensure classes property exists (empty array if not present)
						// This prevents components from adding default classes
						if (!("classes" in typedModuleData)) {
							const dataWithEmptyClasses = {
								...moduleData,
								classes: [],
							};
							set(atom, dataWithEmptyClasses);
						} else {
							set(atom, moduleData);
						}
					} else {
						set(atom, moduleData);
					}
				} else if (atom) {
					// Module key exists but data is null/undefined - set empty object
					set(atom, {});
				}
			} else {
				// Module doesn't exist in the preset at all
				// This shouldn't happen for modules that are saved
				set(atom, defaultData);
			}
		}
	} else {
		// No modules data at all - set defaults for everything
		for (const [, [atom, defaultData]] of modulesMap) {
			set(atom, defaultData);
		}
	}

	const groupsMap = new Map([
		["colorStyles", colorStylesAtom],
		["typographyStyles", typographyStylesAtom],
		["spacingStyles", spacingStylesAtom],
		["layoutsStyles", layoutsStylesAtom],
		["designStyles", designStylesAtom],
		["componentsStyles", componentsStylesAtom],
		// ["stylesheetsStyles", stylesheetsStylesAtom], // Removed - stylesheets handled as raw CSS
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

/**
 * Override: no null path (wp always has a preset)
 */
export const setCurrentPresetAtom = atom(null, (_get, set, preset: Preset) => {
	if (preset?.breakpoints) {
		set(breakpointsAtom, preset.breakpoints as [number, number][] | []);
	} else {
		set(breakpointsAtom, []);
	}

	set(writeStylesFromPresetAtom, preset);
	set(selectedBreakpointAtom, null);
	set(currentPresetAtom, preset);
});
