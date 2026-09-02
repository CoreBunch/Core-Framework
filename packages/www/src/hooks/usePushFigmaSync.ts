import { useCallback } from "react";
import { getClassNamesGroupedByGroups } from "functions/getClassNamesGroupedByGroups";
import { minifyCss } from "functions/minifyCss";
import {
	WpApiProxyProps,
	saveOxygenCssHelper,
	updateClasses,
	updateColors,
	updateGroupedClasses,
	updatePrefixedCssFile,
} from "functions/wpdb-proxy";
import { useAtomCallback } from "jotai/utils";
import { convertToVariableDeclarationName } from "utils";
import { ColorSystemFormData } from "components/modules/colorSystem";
import {
	generateColorSystemVariables,
	getTransparentVariable,
} from "components/modules/colorSystem/functions/generateColorSystemVariables";
import { getFirstSelector } from "components/modules/components/Components.editor";
import { cssGenerator } from "cssGenerator";
import {
	colorSystemFormDataAtom,
	joinedStylesAtom,
	presetPreferencesSelector,
} from "state";

export function usePushFigmaSync() {
	const getJoinedStyles = useAtomCallback(useCallback((get) => get(joinedStylesAtom), []));
	const getPresetPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));
	const getColorSystemFormDataAtom = useAtomCallback(useCallback((get) => get(colorSystemFormDataAtom), []));

	const checkIfHasDarkMode = useCallback(
		(colorSystemFormData: ColorSystemFormData) =>
			colorSystemFormData.groups.some(({ colors }) => colors.some(({ isDarkMode }) => isDarkMode)),
		[],
	);

	interface IHandleClassesRefresh extends WpApiProxyProps {
		readonly cssObjects: CssObject[];
		readonly preset: Preset;
		readonly classPrefix?: string;
	}

	async function handleClassesRefresh({
		cssObjects,
		classPrefix,
		preset,
		url,
		apiKey,
	}: IHandleClassesRefresh) {
		const classAccumulator: string[] = [];

		for (const { selector: initialSelector } of cssObjects) {
			const selector = initialSelector.trim().includes(",")
				? getFirstSelector(initialSelector)
				: initialSelector.trim();

			if (selector.startsWith(".") && !selector.includes(":")) {
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

		// The classes endpoint also refreshes builder variables, so it must run for
		// projects whose stylesheet contains variables but no class selectors.
		await Promise.allSettled([
			updateGroupedClasses({
				groupedClassNames: getClassNamesGroupedByGroups(preset),
				url,
				apiKey,
			}),
			updateClasses({
				classes: [...new Set(classAccumulator)].join(","),
				url,
				apiKey,
			}),
		]);
	}

	interface IHandleColorsRefresh extends WpApiProxyProps {
		readonly classPrefix?: string;
		readonly variablePrefix?: string;
		readonly preset: Preset;
	}

	async function handleColorsRefresh({ variablePrefix, preset, url, apiKey }: IHandleColorsRefresh) {
		const colorSystemFormData = preset?.modulesData?.COLOR_SYSTEM;

		if (!colorSystemFormData) {
			return;
		}

		const colors = [];

		for (const group of colorSystemFormData.groups) {
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
			url,
			apiKey,
		});
	}

	interface IHandleCssGenerator extends WpApiProxyProps {
		readonly cssObjects: CssObject[];
		readonly classPrefix: string | undefined;
		readonly variablePrefix: string | undefined;
		readonly minScreenWidth: number | undefined;
		readonly maxScreenWidth: number | undefined;
	}

	async function handleCssGeneratorPrefixed({
		cssObjects,
		classPrefix,
		variablePrefix,
		minScreenWidth,
		maxScreenWidth,
		url,
		apiKey,
	}: IHandleCssGenerator) {
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
			url,
			apiKey,
		});

		return;
	}

	interface IHandleOxygenHelperStyleSheetGenerator extends WpApiProxyProps {
		readonly classPrefix: string | undefined;
		readonly variablePrefix: string | undefined;
		readonly minScreenWidth: number | undefined;
		readonly maxScreenWidth: number | undefined;
		readonly preset: Preset;
	}

	async function handleOxygenHelperStyleSheetGenerator({
		classPrefix,
		variablePrefix,
		minScreenWidth,
		maxScreenWidth,
		preset,
		url,
		apiKey,
	}: IHandleOxygenHelperStyleSheetGenerator) {
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
			await saveOxygenCssHelper({ cssString: minifyCss(cssString), url, apiKey });
		}
	}

	interface IHandleFigmaPushSync extends WpApiProxyProps {
		readonly preset: Preset;
	}

	const handleFigmaPushSync = useCallback(async (props: IHandleFigmaPushSync) => {
		const { preset, ...wpApiProxyProps } = props;

		const cssObjects = getJoinedStyles();
		const preferences = getPresetPreferences();

		await Promise.allSettled([
			handleClassesRefresh({ cssObjects, preset, ...wpApiProxyProps }),
			handleColorsRefresh({ preset, ...wpApiProxyProps }),
			handleCssGeneratorPrefixed({
				cssObjects,
				classPrefix: preset.classPrefix,
				variablePrefix: preset.variablePrefix,
				minScreenWidth: preferences.min_screen_width,
				maxScreenWidth: preferences.max_screen_width,
				...wpApiProxyProps,
			}),
			handleOxygenHelperStyleSheetGenerator({
				preset,
				classPrefix: preset.classPrefix,
				variablePrefix: preset.variablePrefix,
				minScreenWidth: preferences.min_screen_width,
				maxScreenWidth: preferences.max_screen_width,
				...wpApiProxyProps,
			}),
		]);
	}, [getJoinedStyles, getPresetPreferences, handleClassesRefresh, handleColorsRefresh, handleCssGeneratorPrefixed, handleOxygenHelperStyleSheetGenerator]);

	return {
		handleFigmaPushSync,
	};
}
