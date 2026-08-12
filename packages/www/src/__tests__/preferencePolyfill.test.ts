import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { GET_DEFAULT_PRESET_1_1_0 } from "data/presets-110";

const DEFAULT_PRESET_1_1_0 = GET_DEFAULT_PRESET_1_1_0();

jest.mock("colord", () => ({
	colord: jest.fn().mockImplementation(() => ({
		toHslString: jest.fn(),
		isValid: jest.fn().mockReturnValue(true),
	})),
	extend: jest.fn(),
	getFormat: jest.fn(),
	random: jest.fn(),
	alpha: jest.fn(),
}));
test("mock colord", () => {
	expect(1).toBe(1);
});

global.window = {
	secret_dev_mode: false,
} as any;

test("Add missing preferences to preset", () => {
	const defaultPresetWithoutPreferences = {
		DEFAULT_PRESET_1_1_0,
		preferences: undefined,
	};

	const preparedPreset = preparePresetToLoad({
		preset: defaultPresetWithoutPreferences as any,
		oldPreferences: DEFAULT_PRESET_1_1_0.preferences,
	});

	expect(preparedPreset).toEqual({
		...preparedPreset,
		...{
			preferences: DEFAULT_PRESET_1_1_0.preferences,
		},
	});
});

test("Don't add preferences if they already exist", () => {
	const defaultPresetWithPreferences = {
		DEFAULT_PRESET_1_1_0,
		preferences: DEFAULT_PRESET_1_1_0.preferences,
	};

	const preparedPreset = preparePresetToLoad({
		preset: defaultPresetWithPreferences as any,
	});

	expect(preparedPreset).toEqual({
		...preparedPreset,
	});
});

test("Add missing preferences to preset when not passing old preferences, brand new install", () => {
	const defaultPresetWithoutPreferences = {
		DEFAULT_PRESET_1_1_0,
		preferences: undefined,
	};

	const preparedPreset = preparePresetToLoad({
		preset: defaultPresetWithoutPreferences as any,
	});

	expect(preparedPreset).toEqual({
		...preparedPreset,
		...{
			preferences: DEFAULT_PRESET_1_1_0.preferences,
		},
	});
});

test("If one of the old preferences is not defined, use the default value", () => {
	const defaultPresetWithoutPreferences = {
		DEFAULT_PRESET_1_1_0,
		preferences: undefined,
	};

	const preparedPreset = preparePresetToLoad({
		preset: defaultPresetWithoutPreferences as any,
		oldPreferences: {
			...DEFAULT_PRESET_1_1_0.preferences,
			root_font_size: undefined,
			is_rem: undefined,
		},
	});

	expect(preparedPreset).toEqual({
		...preparedPreset,
		...{
			preferences: DEFAULT_PRESET_1_1_0.preferences,
		},
	});
});
