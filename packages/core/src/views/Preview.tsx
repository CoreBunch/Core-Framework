import { useCallback, useState } from "react";
import { FontData } from "components/modules/fonts";
import { mergeRootSelectors } from "components/modules/fonts/utils/utils";
import { retrieveStylesFromState } from "components/modules/stylesheets";
import { CssCodeViewer } from "components/modules/stylesheets/components/CssCodeViewer";
import clsx from "clsx";
import { devLog } from "functions/devLog";
import { minifyCss } from "functions/minifyCss";
import { sanitizePreset } from "functions/sanitizePreset";
import { useAtomCallback } from "jotai/utils";
import {
	convertToSnakeCase,
	copyToClipboard,
	downloadFile,
	encodeCompressedString,
	humanFileSize,
	lzwEncode,
} from "utils";
import { Loader } from "components/basic/Loader";
import { Tooltip } from "components/ui/Tooltip";
import { useEffectOnce } from "hooks/useEffectOnce";
import { CORE_FILE_FORMAT } from "constants/coreFileName";
import { reducedMotionString } from "constants/preferesReducedMotion";
import { cssGenerator } from "cssGenerator";
import {
	colorSystemFormDataAtom,
	currentPresetAtom,
	getPresetFromCurrentPresetAtom,
	getSortedStylesAtom,
	presetPreferencesSelector,
	stylesheetsDataAtom,
} from "state";

export function Preview() {
	const [cssString, setCssString] = useState<string | null>(null);
	const [newPresetData, setNewPresetData] = useState<Preset | null>(null);
	const [cssSize, setCssSize] = useState<string | null>(null);
	const [gzipSize, setGzipSize] = useState<string | null>(null);

	const getSortedStyles = useAtomCallback(useCallback((get) => get(getSortedStylesAtom), []));
	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));
	const getCurrentPreset = useAtomCallback(useCallback((get) => get(currentPresetAtom), []));
	const getColorSystemFormDataAtom = useAtomCallback(useCallback((get) => get(colorSystemFormDataAtom), []));
	const getNewPreset = useAtomCallback(useCallback((get) => get(getPresetFromCurrentPresetAtom), []));
	const getStylesheetsData = useAtomCallback(useCallback((get) => get(stylesheetsDataAtom), []));

	async function handleCssGenerator(cssObjects: CssObject[]) {
		const {
			postcss,
			min_screen_width,
			max_screen_width,
			postcss_easing_gradients,
			postcss_hover_media,
			root_font_size,
			is_rem,
		} = await getPreferences();

		const currentPreset = await getCurrentPreset();

		const hasDarkMode = getColorSystemFormDataAtom().groups.some(({ colors }) =>
			colors.some(({ isDarkMode }) => isDarkMode),
		);

		setNewPresetData(currentPreset);

		return await cssGenerator({
			cssObjects,
			options: {
				format: true,
				combineSelectors: true,
				propertyValidation: false,
				valueValidation: false,
				classPrefix: currentPreset?.classPrefix,
				variablePrefix: currentPreset?.variablePrefix,
				minScreenWidth: max_screen_width,
				maxScreenWidth: min_screen_width,
				manualDarkMode: hasDarkMode,
				postcss,
				postcssEasingGradients: postcss_easing_gradients,
				postcssHoverMedia: postcss_hover_media,
				rootFontSize: root_font_size,
				isRem: is_rem,
			},
		});
	}

	const generateCss = async () => {
		const { root_font_size, prefers_reduced_motion } = await getPreferences();
		const cssObjects: CssObject[] = await getSortedStyles();
		const newPreset = await getNewPreset();
		const fontsCss = newPreset?.modulesData?.FONTS?.fonts
			.reduce((acc: FontData[], font: FontData) => {
				return font.enable && font.cssPreview ? [...acc, font.cssPreview] : acc;
			}, [])
			.join("");

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

		let cssString = await handleCssGenerator(cssObjects);

		if (prefers_reduced_motion) {
			cssString += reducedMotionString;
		}

		if (fontsCss) {
			cssString = `${mergeRootSelectors(fontsCss).replace(/^\s*\n/gm, "")}\n${cssString}`;
		}

		// Add stylesheets CSS at the end
		const stylesheetsData = getStylesheetsData();
		const stylesheetsCss = retrieveStylesFromState(stylesheetsData);
		if (stylesheetsCss.length > 0) {
			cssString += "\n/* Custom Stylesheets */\n";
			cssString += stylesheetsCss.join("\n");
		}

		setCssString(cssString);

		const minifiedCssString = minifyCss(cssString);
		const blob = new Blob([minifiedCssString], {
			type: "text/css",
		});

		setCssSize(humanFileSize(blob?.size));
		setGzipSize(humanFileSize(lzwEncode(cssString).length));
	};

	function handleDownloadCss() {
		if (!newPresetData) {
			devLog("No preset data to download");
			return;
		}

		const minifiedCss = minifyCss(cssString ?? "");

		const file = new Blob([minifiedCss], {
			type: "text/css",
		});

		downloadFile(file, `${convertToSnakeCase(newPresetData?.name ?? "")}.css`);
	}

	function downloadPreset() {
		if (newPresetData === null) {
			devLog("No preset data to download");
			return;
		}

		const sanitizedPreset = sanitizePreset(newPresetData);

		const base = encodeCompressedString(JSON.stringify(sanitizedPreset));
		const file = new Blob([base], {
			type: "text/plain",
		});

		downloadFile(file, `${convertToSnakeCase(sanitizedPreset.name)}.${CORE_FILE_FORMAT}`);
	}

	function handleCssStringCopy() {
		if (!cssString) {
			devLog("No CSS string to copy");
			return;
		}

		copyToClipboard(cssString ?? "");
	}

	function handleCssStringMinifiedCopy() {
		if (!cssString) {
			devLog("No CSS string to copy");
			return;
		}

		copyToClipboard(minifyCss(cssString ?? ""));
	}

	useEffectOnce(() => {
		setTimeout(() => {
			generateCss();
		}, 2);
	});

	return (
		<section className="section">
			<div className="subsection">
				<h1>Woohoo!</h1>

				<div className="generated-code-wrapper">
					<header>
						<div>
							<span className="red" />
							<span className="yellow" />
							<span className="green" />
						</div>
						<span className="center">{newPresetData?.name ?? ""}</span>
						<span>
							{cssSize ? (
								<Tooltip label="Estimated size of the minified stylesheet" withArrow>
									<b>{cssSize}</b>
								</Tooltip>
							) : null}

							{gzipSize ? (
								<>
									{" "}
									→{" "}
									<Tooltip label="Estimated size of the stylesheet after gzip compression" withArrow>
										<b
											style={{
												color: "var(--color-green)",
											}}
										>
											{gzipSize}
										</b>
									</Tooltip>
								</>
							) : null}
						</span>
					</header>

					<div className="code-buttons">
						<button
							className={clsx(!newPresetData && "disabled", "btn-primary btn-s")}
							onClick={handleDownloadCss}
						>
							Download CSS file
						</button>
						<button
							className={clsx(!newPresetData && "disabled", "btn-secondary btn-s")}
							onClick={downloadPreset}
						>
							Export
						</button>
						<button
							className={clsx(!newPresetData && "disabled", "btn-secondary btn-s")}
							onClick={handleCssStringCopy}
						>
							Copy CSS
						</button>
						<button
							className={clsx(!newPresetData && "disabled", "btn-secondary btn-s")}
							onClick={handleCssStringMinifiedCopy}
						>
							Copy Minified CSS
						</button>
					</div>

					{cssString ? (
						<div className="generated-code">
							<CssCodeViewer value={cssString} />
						</div>
					) : cssString === "" ? (
						<div className="code-container">
							<h2 className="text-xl padding-xl">
								No CSS declarations are present yet. Your classes and variables will be displayed here.
							</h2>
						</div>
					) : (
						<div className="code-container">
							<Loader />
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
