import { useCallback } from "react";
import { devLog } from "functions/devLog";
import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { sanitizePreset } from "functions/sanitizePreset";
import { validatePreset } from "functions/validatePreset";
import { getRowFromWpDb } from "functions/wpdb";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { localPreferencesSchema } from "schema/preferences.schema";
import { withDevTimeLogger } from "utils";
import { generateFluidSpacingResult } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { retrieveVariablesFromSpacingState } from "components/modules/spacing/functions/retrieveVariablesFromSpacingState";
import { generateFluidTypographyResult } from "components/modules/typography/functions/getFluidTypeVariables";
import { retrieveVariablesFromTypographyState } from "components/modules/typography/functions/retrieveVariablesFromTypographyState";
import {
	DEFAULT_LOCAL_PREFERENCES,
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
	getPresetFromCurrentPresetAtom,
	setCurrentPresetAtom,
	setLocalPreferencesAtom,
} from "state";
import { onboardingAtom } from "state/onboardingAtom";
import { lastSavedStateAtom } from "state/saveAtom";
import { useAutoCompleteLoad } from "./useAutoCompleteLoad";
import { useEffectOnce } from "./useEffectOnce";

export function useInitialLoad() {
	const setCurrentPreset = useSetAtom(setCurrentPresetAtom);
	const setPreferences = useSetAtom(setLocalPreferencesAtom);
	const setFluidTypographyResult = useSetAtom(fluidTypoGraphyHelperResultsAtom);
	const setFluidSpacingResult = useSetAtom(fluidSpacingHelperResultsAtom);
	const changeGlobalCssVariables = useSetAtom(changeVariablesAtom);
	const setLastSavedState = useSetAtom(lastSavedStateAtom);

	// Add callback to get the preset from atoms after they're set
	const getCompletePreset = useAtomCallback(useCallback((get) => get(getPresetFromCurrentPresetAtom), []));

	const currentPreset = useAtomValue(currentPresetAtom);

	const [isOnboarding, setIsOnboarding] = useAtom(onboardingAtom);

	const { handleLoadOfAutocomplete } = useAutoCompleteLoad();

	async function getSettings(): Promise<Preferences> {
		const ERROR_MESSAGE = "Error while fetching settings";

		return new Promise((resolve) => {
			window.wp.api.loadPromise.done(async () => {
				const wpSettings = new window.wp.api.models.Settings();

				try {
					const wpOptions = await wpSettings.fetch();
					const pluginSettings = wpOptions?.core_framework_main;
					const parseResult = localPreferencesSchema.safeParse(pluginSettings);

					if (!parseResult.success) {
						setPreferences({
							...DEFAULT_LOCAL_PREFERENCES,
							...pluginSettings,
						});
						resolve(DEFAULT_LOCAL_PREFERENCES);
						console.warn(ERROR_MESSAGE);
						return;
					}

					setPreferences(parseResult.data);
					resolve(parseResult.data);
					return parseResult.data;
				} catch (err) {
					console.warn(ERROR_MESSAGE);
					resolve(DEFAULT_LOCAL_PREFERENCES);
				}
			});
		});
	}

	async function handleInitialLoad() {
		const preferences = (await getSettings()) || DEFAULT_LOCAL_PREFERENCES;

		const { selected_id } = preferences;
		const { success, data: row } = await getRowFromWpDb(selected_id);

		if (!(success && row && row.data)) {
			devLog("No preset selected", { selected_id });
			setIsOnboarding(true);
			return;
		}

		const preset = JSON.parse(row.data);
		const parseReturn = withDevTimeLogger(validatePreset)(preset);

		if (!parseReturn.success) {
			devLog("Preset validation failed", parseReturn);
			setIsOnboarding(true);
			return;
		}

		const preparedPreset = preparePresetToLoad({
			preset: parseReturn.data,
			oldPreferences: preferences,
		});

		setFluidTypographyResult(
			generateFluidTypographyResult({
				typographyData: preparedPreset?.modulesData?.FLUID_TYPOGRAPHY || TYPOGRAPHY_INITIAL_STATE,
				root_font_size: Number(preferences?.root_font_size || DEFAULT_PREFERENCES.root_font_size),
				is_rem: Boolean(preferences?.is_rem),
				min_screen_width: preferences?.min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
				max_screen_width: preferences?.max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			}),
		);
		setFluidSpacingResult(
			generateFluidSpacingResult({
				spacingState: preparedPreset?.modulesData?.FLUID_SPACING || SPACING_CALCULATOR_INITIAL_STATE,
				root_font_size: Number(preferences?.root_font_size || DEFAULT_PREFERENCES.root_font_size),
				is_rem: Boolean(preferences?.is_rem),
				min_screen_width: preferences?.min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
				max_screen_width: preferences?.max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			}),
		);

		const spacingVariables = retrieveVariablesFromSpacingState(
			preparedPreset?.modulesData?.FLUID_SPACING?.groups?.[0] ||
				SPACING_CALCULATOR_INITIAL_STATE?.groups?.[0],
		);
		const typographyVariables = retrieveVariablesFromTypographyState(
			preparedPreset?.modulesData?.FLUID_TYPOGRAPHY?.groups?.[0] || TYPOGRAPHY_INITIAL_STATE?.groups?.[0],
		);

		changeGlobalCssVariables({
			variables: spacingVariables,
			type: "SPACING",
		});
		changeGlobalCssVariables({
			variables: typographyVariables,
			type: "FLUID_TYPOGRAPHY",
		});

		setCurrentPreset(preparedPreset);
		handleLoadOfAutocomplete(preparedPreset);

		// Initialize the last saved state after atoms are populated
		// This prevents showing "unsaved changes" when the app first loads
		setTimeout(async () => {
			const completePreset = await getCompletePreset();
			if (completePreset) {
				const sanitized = sanitizePreset(completePreset);
				// Sort object keys recursively for consistent comparison
				const sortObjectKeys = (obj: any): any => {
					if (obj === null || obj === undefined) return obj;
					if (Array.isArray(obj)) return obj.map(sortObjectKeys);
					if (typeof obj === "object") {
						const sorted: any = {};
						Object.keys(obj)
							.sort()
							.forEach((key) => {
								sorted[key] = sortObjectKeys(obj[key]);
							});
						return sorted;
					}
					return obj;
				};
				setLastSavedState(JSON.stringify(sortObjectKeys(sanitized)));
			}
		}, 1000);
	}

	useEffectOnce(() => {
		handleInitialLoad();
	});

	return {
		isOnboarding,
		setIsOnboarding,
		handleInitialLoad,
		currentPreset,
	};
}
