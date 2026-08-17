import { useCallback, useMemo, useState } from "react";
import { devLog } from "functions/devLog";
import { getClassNamesGroupedByGroups } from "functions/getClassNamesGroupedByGroups";
import { minifyCss } from "functions/minifyCss";
import { sanitizePreset } from "functions/sanitizePreset";
import {
	handlePushDb,
	saveOxygenCssHelper,
	sendPresetToWpDb,
	updateClasses,
	updateColors,
	updateGroupedClasses,
	updatePrefixedCssFile,
} from "functions/wpdb";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { convertToVariableDeclarationName, humanFileSize, round, withDevTimeLogger } from "utils";
import { ColorSystemFormData } from "components/modules/colorSystem";
import {
	generateColorSystemVariables,
	getTransparentVariable,
} from "components/modules/colorSystem/functions/generateColorSystemVariables";
import { getFirstSelector } from "components/modules/components/Components.editor";
import { retrieveStylesFromState } from "components/modules/stylesheets";
import { reducedMotionString } from "constants/preferesReducedMotion";
import { cssGenerator } from "cssGenerator";
import {
	colorSystemFormDataAtom,
	getPresetFromCurrentPresetAtom,
	joinedStylesAtom,
	localPreferencesAtom,
	presetPreferencesSelector,
	setLocalPreferencesAtom,
	stylesheetsDataAtom,
} from "state";
import {
	hasUnsavedChangesAtom,
	isHandleSave,
	isSavingAtom,
	lastSavedStateAtom,
	pushStateAtom,
} from "state/saveAtom";
import { useAutoCompleteLoad } from "./useAutoCompleteLoad";

export const PUSH_STATE = {
	IDLE: "IDLE",
	CSS_GENERATOR: "CSS_GENERATOR",
	CLASS_REFRESH: "CLASS_REFRESH",
	COLOR_REFRESH: "COLOR_REFRESH",
	PUSH_DB: "PUSH_DB",
	FINISHED: "FINISHED",
};

export type PushState = (typeof PUSH_STATE)[keyof typeof PUSH_STATE];

type AddonEnableArray = {
	addon: "bricks" | "oxygen" | "gutenberg" | "";
	enabled: boolean;
}[];

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
	const [cssSize, setCssSize] = useState("");
	const [cssString, setCssString] = useState<string | null>(null);
	const [newPresetData, setNewPresetData] = useState<Preset | null>(null);
	const state = useAtomValue(pushStateAtom);
	const setState = useSetAtom(pushStateAtom);

	const setLastSavedState = useSetAtom(lastSavedStateAtom);
	const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
	const setIsHandleSave = useSetAtom(isHandleSave);

	const getIsSaving = useAtomCallback(useCallback((get) => get(isSavingAtom), []));
	const getJoinedStyles = useAtomCallback(useCallback((get) => get(joinedStylesAtom), []));
	const getNewPreset = useAtomCallback(useCallback((get) => get(getPresetFromCurrentPresetAtom), []));
	const getLocalPreferences = useAtomCallback(useCallback((get) => get(localPreferencesAtom), []));
	const getPresetPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));
	const getColorSystemFormDataAtom = useAtomCallback(useCallback((get) => get(colorSystemFormDataAtom), []));
	const getStylesheetsData = useAtomCallback(useCallback((get) => get(stylesheetsDataAtom), []));

	useAutoCompleteLoad();

	const setLocalPreferences = useSetAtom(setLocalPreferencesAtom);

	const checkIfHasDarkMode = useCallback(
		(colorSystemFormData: ColorSystemFormData) =>
			colorSystemFormData.groups.some(({ colors }) => colors.some(({ isDarkMode }) => isDarkMode)),
		[],
	);

	interface IHandleClassesRefresh {
		readonly cssObjects: CssObject[];
		readonly addonEnableArray: AddonEnableArray;
		readonly preset: Preset;
		readonly classPrefix?: string;
	}

	async function handleClassesRefresh({
		cssObjects,
		classPrefix,
		addonEnableArray,
		preset,
	}: IHandleClassesRefresh) {
		setState(PUSH_STATE.CLASS_REFRESH);

		const hasSomeAddons = addonEnableArray.some(({ enabled }) => enabled);

		if (!hasSomeAddons) {
			return;
		}

		const classAccumulator: string[] = [];

		for (const { selector: initialSelector } of cssObjects) {
			const selector = initialSelector.trim().includes(",")
				? getFirstSelector(initialSelector)
				: initialSelector.trim();

			if (selector.startsWith(".") && !selector?.includes(":")) {
				const dots = selector.match(/\./g)?.length;

				if (dots && dots > 1) {
					const split = selector.split(".");
					const last = split.at(-1);

					if (last) {
						classAccumulator.push(last);
					}

					continue;
				}

				const className = selector.replace(".", "");
				const prefixedClassName = classPrefix ? `${classPrefix}${className}` : className;

				classAccumulator.push(prefixedClassName);
			}
		}

		const hasDarkMode = checkIfHasDarkMode(getColorSystemFormDataAtom());

		if (hasDarkMode) {
			const themeInvertedClass = classPrefix ? `${classPrefix}theme-inverted` : "theme-inverted";
			classAccumulator.push(themeInvertedClass);
		}

		// Update grouped classes for Gutenberg/Oxygen (independent of classAccumulator)
		if (
			addonEnableArray.some(({ addon, enabled }) => (addon === "gutenberg" || addon === "oxygen") && enabled)
		) {
			await updateGroupedClasses({
				groupedClassNames: getClassNamesGroupedByGroups(preset),
			});
		}

		await Promise.allSettled([
			updateClasses({
				classes: [...new Set(classAccumulator)],
				addonEnableArray,
			}),
		]);
	}

	interface IHandleColorsRefresh {
		readonly addonEnableArray: AddonEnableArray;
		readonly classPrefix?: string;
		readonly variablePrefix?: string;
		readonly preset: Preset;
	}

	async function handleColorsRefresh({ addonEnableArray, variablePrefix, preset }: IHandleColorsRefresh) {
		setState(PUSH_STATE.COLOR_REFRESH);

		if (!addonEnableArray.some(({ enabled }) => enabled)) {
			return;
		}

		const colorSystemFormData = preset?.modulesData?.COLOR_SYSTEM;

		if (!colorSystemFormData) {
			return;
		}

		const colors = [];

		for (const group of colorSystemFormData.groups) {
			if (group.isDisabled) continue;

			for (const colorItem of group.colors) {
				const {
					value,
					name,
					id,
					transparentVariables,
					transparent,
					isShades,
					shades,
					isTints,
					tints,
					darkValue,
					isDarkMode,
				} = colorItem;

				if (!value.includes("gradient") && value && name) {
					const raw = `var(${convertToVariableDeclarationName(
						variablePrefix ? `${variablePrefix}${name}` : name,
					)})`;

					colors.push({
						name,
						value,
						raw,
						id,
					});

					if (transparent && transparentVariables && transparentVariables.length) {
						transparentVariables.forEach((variant) => {
							const {
								name = "",
								value = "",
								id = "",
							} = getTransparentVariable(colorItem, variant, true) || {};

							if (!id) return;

							const raw = `var(${convertToVariableDeclarationName(
								variablePrefix ? `${variablePrefix}${name}` : name,
							)})`;

							colors.push({
								name,
								value,
								raw,
								id,
							});
						});
					}

					if (isShades && shades) {
						shades.forEach((shade, i) => {
							const { name, value } = shade;
							const raw = `var(${convertToVariableDeclarationName(
								variablePrefix ? `${variablePrefix}${name}` : name,
							)})`;
							const _id = `${id}.d.${i}`;

							colors.push({
								name,
								value,
								raw,
								id: _id,
							});
						});
					}

					if (isTints && tints) {
						tints.forEach((tint, i) => {
							const { name, value } = tint;
							const raw = `var(${convertToVariableDeclarationName(
								variablePrefix ? `${variablePrefix}${name}` : name,
							)})`;
							const _id = `${id}.t.${i}`;

							colors.push({
								name,
								value,
								raw,
								id: _id,
							});
						});
					}

					if (!(isDarkMode && darkValue)) {
						continue;
					}

					const { darkShades, darkTints } = colorItem;

					const darkRaw = `var(${convertToVariableDeclarationName(
						variablePrefix ? `${variablePrefix}${name}` : name,
					)})`;

					colors.push({
						name,
						value: darkValue,
						raw: darkRaw,
						id: `${id}.td`,
						dark: true,
					});

					if (isShades && darkShades) {
						darkShades.forEach((shade, i) => {
							const { name, value } = shade;
							const raw = `var(${convertToVariableDeclarationName(
								variablePrefix ? `${variablePrefix}${name}` : name,
							)})`;
							const _id = `${id}.td.d.${i}`;

							colors.push({
								name,
								value,
								raw,
								id: _id,
								dark: true,
							});
						});
					}

					if (isTints && darkTints) {
						darkTints.forEach((tint, i) => {
							const { name, value } = tint;
							const raw = `var(${convertToVariableDeclarationName(
								variablePrefix ? `${variablePrefix}${name}` : name,
							)})`;
							const _id = `${id}.td.t.${i}`;

							colors.push({
								name,
								value,
								raw,
								id: _id,
								dark: true,
							});
						});
					}

					if (transparent && transparentVariables && transparentVariables.length) {
						transparentVariables.forEach((variant) => {
							const transparentColor = getTransparentVariable(colorItem, variant, false, true);
							if (!transparentColor) {
								return;
							}

							const { name, value, id } = transparentColor;
							const raw = `var(${convertToVariableDeclarationName(
								variablePrefix ? `${variablePrefix}${name}` : name,
							)})`;

							colors.push({
								name,
								value,
								raw,
								id,
								dark: true,
							});
						});
					}
				}
			}
		}

		await updateColors({
			colors,
			addonEnableArray,
		});
	}

	interface IHandleCssGenerator {
		readonly cssObjects: CssObject[];
		readonly classPrefix: string | undefined;
		readonly variablePrefix: string | undefined;
		readonly minScreenWidth: number | undefined;
		readonly maxScreenWidth: number | undefined;
		readonly id: string;
	}

	async function handleCssGenerator({
		cssObjects,
		classPrefix,
		variablePrefix,
		minScreenWidth,
		maxScreenWidth,
		id,
	}: IHandleCssGenerator) {
		const { postcss, theme_mode, postcss_easing_gradients, postcss_hover_media, root_font_size, is_rem } =
			getPresetPreferences();

		const has_theme = checkIfHasDarkMode(getColorSystemFormDataAtom());

		devLog(`Saved project has dark theme: ${has_theme}`);

		setLocalPreferences({
			...getLocalPreferences(),
			has_theme,
			theme_mode,
			selected_id: id,
		});

		const cssString = await cssGenerator({
			cssObjects,
			options: {
				format: true,
				combineSelectors: true,
				propertyValidation: false,
				valueValidation: false,
				minScreenWidth,
				maxScreenWidth,
				manualDarkMode: has_theme,
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

	async function handleCssGeneratorPrefixed({
		cssObjects,
		classPrefix,
		variablePrefix,
		minScreenWidth,
		maxScreenWidth,
		enabled,
	}: IHandleCssGenerator & {
		enabled: boolean;
	}) {
		if (!enabled) {
			return;
		}

		const { postcss, postcss_easing_gradients, is_rem } = await getPresetPreferences();

		const prefixedCssString = await cssGenerator({
			cssObjects,
			options: {
				format: true,
				combineSelectors: true,
				propertyValidation: false,
				valueValidation: false,
				minScreenWidth,
				maxScreenWidth,
				variablePrefix,
				classPrefix,
				postcss,
				selectorPrefix: "html .editor-styles-wrapper ",
				postcssEasingGradients: postcss_easing_gradients,
				isRem: is_rem,
			},
		});

		const minifiedCssString = minifyCss(prefixedCssString);

		await updatePrefixedCssFile({
			cssString: minifiedCssString,
		});

		return;
	}

	interface IHandleOxygenHelperStyleSheetGenerator {
		readonly classPrefix: string | undefined;
		readonly variablePrefix: string | undefined;
		readonly minScreenWidth: number | undefined;
		readonly maxScreenWidth: number | undefined;
		readonly preset: Preset;
		readonly enabled: boolean;
	}

	async function handleOxygenHelperStyleSheetGenerator({
		classPrefix,
		variablePrefix,
		minScreenWidth,
		maxScreenWidth,
		preset,
		enabled,
	}: IHandleOxygenHelperStyleSheetGenerator) {
		if (!enabled) {
			return;
		}

		const colorSystemState = preset?.modulesData?.COLOR_SYSTEM;

		if (!colorSystemState) {
			return;
		}

		const { postcss, root_font_size, is_rem } = await getPresetPreferences();

		const vars = await generateColorSystemVariables({
			colorSystemState,
			manual_theme: true,
		});

		const cssString = await cssGenerator({
			cssObjects: vars,
			options: {
				format: true,
				combineSelectors: true,
				propertyValidation: false,
				valueValidation: false,
				manualDarkMode: checkIfHasDarkMode(colorSystemState),
				minScreenWidth,
				maxScreenWidth,
				variablePrefix,
				classPrefix,
				postcss,
				rootFontSize: root_font_size,
				isRem: is_rem,
			},
		});

		if (cssString) {
			await saveOxygenCssHelper({
				cssString: minifyCss(cssString),
			});
		}
	}

	const handlePush = useCallback(async (withToast = true) => {
		// Guard against concurrent saves — read latest state from atom
		if (getIsSaving()) return;

		window.onbeforeunload = () => "";
		setState(PUSH_STATE.CSS_GENERATOR);
		const t1_total = performance.now();

		const {
			oxygen: isOxygenEnabled,
			bricks: isBricksEnabled,
			gutenberg: isGutenbergEnabled,
		} = getLocalPreferences();
		const { root_font_size, min_screen_width, max_screen_width, prefers_reduced_motion } =
			getPresetPreferences();

		const latestPreset = await getNewPreset();

		if (!latestPreset) {
			toast.error("Something went wrong. Please, try again.");
			setState(PUSH_STATE.IDLE);
			return;
		}

		const { isSuccessful, message } = await validate(latestPreset);

		if (!isSuccessful) {
			toast.error(message);
			setState(PUSH_STATE.IDLE);
			return;
		}

		const addonEnableArray: AddonEnableArray = [
			{
				addon: "bricks",
				enabled: Boolean(isBricksEnabled),
			},
			{
				addon: "oxygen",
				enabled: Boolean(isOxygenEnabled),
			},
			{
				addon: "gutenberg",
				enabled: Boolean(isGutenbergEnabled),
			},
		];

		if (latestPreset === null) {
			return null;
		}

		const cssObjects = getJoinedStyles();
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

		let cssString = await withDevTimeLogger(handleCssGenerator)({
			cssObjects,
			classPrefix: latestPreset.classPrefix,
			variablePrefix: latestPreset.variablePrefix,
			minScreenWidth: min_screen_width,
			maxScreenWidth: max_screen_width,
			id: latestPreset.id,
		});
		if (prefers_reduced_motion) cssString += reducedMotionString;
		if (isGutenbergEnabled) cssString += ".wp-block{}";

		// Add stylesheets CSS at the end
		const stylesheetsData = getStylesheetsData();
		const stylesheetsCss = retrieveStylesFromState(stylesheetsData);
		if (stylesheetsCss.length > 0) {
			cssString += "\n/* Custom Stylesheets */\n";
			cssString += stylesheetsCss.join("\n");
		}

		const newPresetData: Preset = {
			...latestPreset,
		};
		const id = newPresetData.id;

		setNewPresetData(newPresetData);
		setState(PUSH_STATE.PUSH_DB);

		const responses = await Promise.allSettled([
			withDevTimeLogger(sendPresetToWpDb)(latestPreset),
			withDevTimeLogger(handlePushDb)({
				cssString: minifyCss(cssString),
				id,
			}),
			withDevTimeLogger(handleCssGeneratorPrefixed)({
				cssObjects,
				classPrefix: latestPreset.classPrefix,
				variablePrefix: latestPreset.variablePrefix,
				minScreenWidth: min_screen_width,
				maxScreenWidth: max_screen_width,
				id: latestPreset.id,
				enabled: Boolean(isGutenbergEnabled),
			}),
			withDevTimeLogger(handleOxygenHelperStyleSheetGenerator)({
				preset: latestPreset,
				classPrefix: latestPreset.classPrefix,
				variablePrefix: latestPreset.variablePrefix,
				minScreenWidth: min_screen_width,
				maxScreenWidth: max_screen_width,
				enabled: Boolean(isOxygenEnabled),
			}),
		]);

		responses.forEach((response) => {
			if (response.status === "rejected") {
				console.warn(response.reason);
			}
		});

		const mainTableResponse = responses[1];
		const stylesheetWasPersisted =
			mainTableResponse.status === "fulfilled" && mainTableResponse.value.success;

		if (stylesheetWasPersisted) {
			// Colors used to refresh inside the batch above, so they reached the builder
			// even when the stylesheet never persisted. They belong behind the same gate
			// as the classes, and still ahead of them, which is the order the batch gave.
			const [colorsSync] = await Promise.allSettled([
				withDevTimeLogger(handleColorsRefresh)({
					classPrefix: latestPreset.classPrefix,
					variablePrefix: latestPreset.variablePrefix,
					preset: latestPreset,
					addonEnableArray,
				}),
			]);

			if (colorsSync.status === "rejected") {
				console.warn(colorsSync.reason);
			}

			await withDevTimeLogger(handleClassesRefresh)({
				cssObjects,
				classPrefix: latestPreset.classPrefix,
				preset: latestPreset,
				addonEnableArray,
			});
		}

		const t2_total = performance.now();
		const bytesSaved = mainTableResponse.status === "fulfilled" ? mainTableResponse.value.bytes_saved : 0;
		const totalTime = t2_total - t1_total;

		console.table({
			"Total time": [`${round(totalTime)}ms`, `${round(totalTime / 1000)}s`],
			"Saved CSS size": [humanFileSize(bytesSaved)],
		});

		if (withToast) {
			if (stylesheetWasPersisted) {
				toast.success(
					addonEnableArray.some(({ enabled }) => enabled)
						? "Successfully pushed and synced."
						: "Successfully pushed.",
				);
			} else {
				// Without this the push is completely silent when the stylesheet fails to
				// persist: no success, no error, nothing. Save is the primary action here.
				toast.error("Failed to save. Your changes were not applied.");
			}
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

		setState(PUSH_STATE.IDLE);

		// Notify other tabs/windows (e.g. Oxygen 6 builder) that a push has completed
		try {
			const channel = new BroadcastChannel("cf_push_sync");
			channel.postMessage({ type: "push_complete", timestamp: Date.now() });
			channel.close();
		} catch (e) {
			// BroadcastChannel not supported — O6 builder will sync on next reload
		}

		window.onbeforeunload = null;
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		handlePush,
		cssSize,
		newPresetData,
		cssString,
		state,
	};
}
