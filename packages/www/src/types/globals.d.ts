import { localPreferencesSchema } from "schema/preferences.schema";
import {
	combinedPresetSchema,
	cssDeclarationSchema,
	cssObjectSchema,
	groupSchema,
	groupsSchema,
	presetPreferencesSchema,
	presetSchema,
	stylesGroupSchema,
	stylesheetDataKeysSchema,
} from "schema/preset.schema";
import { z } from "zod";
import { variantSchema } from "components/modules/components";

declare global {
	window.process =
		{
			env: {
				NODE_ENV: "development",
			},
			versions: {
				node: "0.0.0",
			},
		} | undefined;

	// Window.secret_dev_mode = undefined | boolean;

	interface Window {
		secret_dev_mode?: boolean;
	}

	/**
	 * Utility
	 */

	type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
		[Property in Key]-?: Type[Property];
	};

	type WithOptionalProperty<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

	type PartialRecord<K extends keyof any, T> = {
		[P in K]?: T;
	};

	/**
	 * Common
	 */

	type CSSDeclaration = z.infer<typeof cssDeclarationSchema>;

	type CssObject = z.infer<typeof cssObjectSchema>;

	type Preset = z.infer<typeof presetSchema>;

	type MixedPreset = z.infer<typeof combinedPresetSchema>;

	type LocalPreferences = z.infer<typeof localPreferencesSchema>;

	type PresetPreferences = z.infer<typeof presetPreferencesSchema>;

	type Group = z.infer<typeof groupSchema>;

	type Groups = z.infer<typeof groupsSchema>;

	type StylesGroup = z.infer<typeof stylesGroupSchema>;

	type StylesheetDataKeys = z.infer<typeof stylesheetDataKeysSchema>;

	type StylesheetData = z.infer<typeof groupsSchema>;

	type ComponentVariant = z.infer<typeof variantSchema>;

	type View =
		| "PREFERENCES"
		| "PREVIEW"
		| "IMPORT_EXPORT"
		| "LOADING"
		| "COLOR_SYSTEM"
		| "TYPOGRAPHY"
		| "SPACING"
		| "LAYOUTS"
		| "DESIGN"
		| "FONTS"
		| "COMPONENTS"
		| "STYLESHEETS"
		| "OTHER"
		| "STYLE_GUIDE";

	type GlobalCssVariables = {
		FLUID_TYPOGRAPHY: string[];
		COLOR_SYSTEM: {
			name: string;
			colorValue: string;
			transparent?: number;
		}[];
		SPACING: string[];
		GLOBAL: string[];
		FONTS: string[];
		STYLESHEETS: string[];
	};

	type GlobalVariablesKeys = keyof GlobalCssVariables;

	type BaseModuleData = {
		isDisabled?: boolean;
	};

	type ResultView = {
		cssString: string;
		name: string;
		preset?: Preset;
		description?: string;
	};

	type Breakpoint = [number, number];

	type Breakpoints = Breakpoint[];

	type InputTypes = "text" | "color" | "fluid";

	type FluidInputValue = [number | "", number | "", "px" | "rem"];
}
