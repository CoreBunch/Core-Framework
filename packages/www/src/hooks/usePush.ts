import { useCallback, useMemo, useState } from "react";
import { isEmbed } from "functions/isEmbed";
import { isFigma } from "functions/isFigma";
import { minifyCss } from "functions/minifyCss";
import { sanitizePreset } from "functions/sanitizePreset";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { humanFileSize, round } from "utils";
import { colorGroupsToVariables } from "components/modules/colorSystem/functions/colorGroupsToVariables";
import { ColorVariable } from "components/modules/colorSystem/types";
import { retrieveStylesFromState } from "components/modules/stylesheets/functions/retrieveStylesFromState";
import { reducedMotionString } from "constants/preferesReducedMotion";
import { cssGenerator } from "cssGenerator";
import {
	colorSystemFormDataAtom,
	getPresetFromCurrentPresetAtom,
	getSortedStylesAtom,
	presetPreferencesSelector,
	stylesheetsDataAtom,
} from "state";
import { hasUnsavedChangesAtom, isHandleSave, lastSavedStateAtom } from "state/saveAtom";
import { usePushFigma } from "./usePushFigma";

const LIMITER_LOCAL_STORAGE_KEY = "cf-limiter";
const LIMITER_TIMEOUT = 2000;

const rateLimiter =
	<T extends (...args: any[]) => Promise<any>>(fn: T) =>
	async (...args: Parameters<T>) => {
		const now = Date.now();
		const lastCall = localStorage.getItem(LIMITER_LOCAL_STORAGE_KEY);

		if (lastCall) {
			const diff = now - Number(lastCall);

			if (diff < LIMITER_TIMEOUT) {
				toast.error("You can only push once per second");
				return;
			}
		}

		localStorage.setItem(LIMITER_LOCAL_STORAGE_KEY, String(now));

		// Add small delay to ensure all state updates are flushed
		await new Promise((resolve) => setTimeout(resolve, 150));
		await fn();
	};

async function validate(preset: Preset): Promise<{
	isSuccessful: boolean;
	message: string;
}> {
	const hasColorNames = preset?.modulesData?.COLOR_SYSTEM?.groups.every(({ colors }) =>
		colors.every(({ name }) => Boolean(name)),
	);

	if (!hasColorNames) {
		return {
			isSuccessful: false,
			message: "Please, fill in all color names.",
		};
	}

	return {
		isSuccessful: true,
		message: "",
	};
}

export function usePush() {
	const { handleFigmaPush } = usePushFigma();

	const [cssSize, setCssSize] = useState("");
	const [cssString, setCssString] = useState<string | null>(null);
	const [newPresetData, setNewPresetData] = useState<Preset | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const setLastSavedState = useSetAtom(lastSavedStateAtom);
	const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
	const setIsHandleSave = useSetAtom(isHandleSave);

	const getSortedStyles = useAtomCallback(useCallback((get) => get(getSortedStylesAtom), []));
	const getNewPreset = useAtomCallback(useCallback((get) => get(getPresetFromCurrentPresetAtom), []));
	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));
	const getColorSystemFormDataAtom = useAtomCallback(useCallback((get) => get(colorSystemFormDataAtom), []));
	const getStylesheetsData = useAtomCallback(useCallback((get) => get(stylesheetsDataAtom), []));

	interface IHandleCssGenerator {
		readonly cssObjects: CssObject[];
		readonly classPrefix: string | undefined;
		readonly variablePrefix: string | undefined;
	}

	async function handleCssGenerator({ cssObjects, classPrefix, variablePrefix }: IHandleCssGenerator) {
		const {
			postcss,
			min_screen_width,
			max_screen_width,
			postcss_easing_gradients,
			postcss_hover_media,
			root_font_size,
			is_rem,
		} = await getPreferences();
		const hasDarkMode = getColorSystemFormDataAtom().groups.some(({ colors }) =>
			colors.some(({ isDarkMode }) => isDarkMode),
		);

		const cssString = await cssGenerator({
			cssObjects,
			options: {
				format: true,
				combineSelectors: true,
				propertyValidation: false,
				valueValidation: false,
				minScreenWidth: min_screen_width,
				maxScreenWidth: max_screen_width,
				manualDarkMode: hasDarkMode,
				variablePrefix,
				classPrefix,
				postcss,
				postcssEasingGradients: postcss_easing_gradients,
				postcssHoverMedia: postcss_hover_media,
				rootFontSize: root_font_size,
				isRem: is_rem,
			},
		});

		setCssString(cssString);

		const minifiedCssString = minifyCss(cssString);
		const blob = new Blob([minifiedCssString], {
			type: "text/css",
		});

		setCssSize(humanFileSize(blob?.size));

		return cssString;
	}

	const handlePush = useCallback(async () => {
		if (isLoading) {
			return;
		}

		const t1_total = performance.now();

		setIsLoading(true);

		const { root_font_size, prefers_reduced_motion } = getPreferences();

		const latestPreset = getNewPreset();

		if (!latestPreset) {
			toast.error(
				"Failed to save project. Please make sure permalink structure is set to option other than plain. If issue persists please contact support. [#05]",
			);
			setIsLoading(false);
			setIsHandleSave(false);
			return null;
		}

		const { isSuccessful, message } = await validate(latestPreset);

		if (!isSuccessful) {
			toast.error(message);
			setIsLoading(false);
			setIsHandleSave(false);
			return;
		}

		const cssObjects: CssObject[] = getSortedStyles();

		if (root_font_size === 10) {
			cssObjects.push({
				selector: "html",
				declarations: [
					{
						property: "font-size",
						value: "62.5%",
						id: "1",
					},
				],
				id: "root-font-size",
			});
		}

		const t1_css = performance.now();

		let cssString = await handleCssGenerator({
			cssObjects,
			classPrefix: latestPreset.classPrefix,
			variablePrefix: latestPreset.variablePrefix,
		});

		if (prefers_reduced_motion) {
			cssString += reducedMotionString;
		}

		// Add stylesheets CSS at the end
		const stylesheetsData = getStylesheetsData();
		const stylesheetsCss = retrieveStylesFromState(stylesheetsData);
		if (stylesheetsCss.length > 0) {
			cssString += "\n/* Custom Stylesheets */\n";
			cssString += stylesheetsCss.join("\n");
		}

		// Update the cssString state and calculate size including stylesheets
		setCssString(cssString);
		const minifiedCssStringWithStylesheets = minifyCss(cssString);
		const blobWithStylesheets = new Blob([minifiedCssStringWithStylesheets], {
			type: "text/css",
		});
		setCssSize(humanFileSize(blobWithStylesheets?.size));

		const t2_css = performance.now();

		const newPresetData: Preset = {
			...latestPreset,
		};

		setNewPresetData(sanitizePreset(newPresetData));

		if (isFigma()) {
			const colorVariables = colorGroupsToVariables(getColorSystemFormDataAtom()) as ColorVariable[];

			handleFigmaPush({
				newPresetData,
				setIsLoading,
				cssString,
				colorVariables,
			});

			return;
		}

		if (isEmbed()) {
			window.parent.postMessage(
				{
					type: "cf-push",
					payload: { ...newPresetData, cssObjects },
				},
				"*",
			);
		} else {
			localStorage.setItem("current_framework", JSON.stringify(sanitizePreset(newPresetData)));
		}

		// Store the current state as the last saved state with sorted keys for consistent comparison
		const sanitized = sanitizePreset(newPresetData);
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
		const currentStateString = JSON.stringify(sortObjectKeys(sanitized));
		setLastSavedState(currentStateString);
		setHasUnsavedChanges(false);
		setIsHandleSave(false);

		let isReceived = false;

		if (isEmbed() && !isFigma()) {
			window.addEventListener(
				"message",
				(event) => {
					if (event.data.type !== "cf-push-response") {
						setIsLoading(false);
						return;
					}

					if (isReceived) {
						setIsLoading(false);
						return;
					}

					isReceived = true;

					if (event.data?.success) {
						setIsLoading(false);
						toast.success("Saved successfully");

						window.removeEventListener("message", () => {});
						return;
					}

					toast.error("Something went wrong");
					setIsLoading(false);

					window.removeEventListener("message", () => {});
				},
				{
					once: true,
				},
			);
		} else {
			toast.success("Saved successfully");
			setIsLoading(false);
		}

		const t2_total = performance.now();

		console.table({
			"Total time": `${round(t2_total - t1_total)}ms`,
			"CSS generator time": `${round(t2_css - t1_css)}ms | ${round(
				((t2_css - t1_css) / (t2_total - t1_total)) * 100,
			)}%`,
			"Saved CSS size": cssSize || "0B",
		});
	}, [isLoading, handleFigmaPush, cssSize, getColorSystemFormDataAtom, getNewPreset, getPreferences, getSortedStyles, getStylesheetsData, handleCssGenerator, setHasUnsavedChanges, setIsHandleSave, setLastSavedState]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		handlePush: useMemo(() => rateLimiter(handlePush), [handlePush]),
		cssSize,
		newPresetData,
		cssString,
		isLoading,
	};
}
