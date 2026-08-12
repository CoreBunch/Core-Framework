import { Dispatch, SetStateAction, memo, useCallback, useEffect, useState } from "react";
import { Select, Switch } from "@mantine/core";
import clsx from "clsx";
import { devLog } from "functions/devLog";
import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { sanitizePreset } from "functions/sanitizePreset";
import { validatePreset } from "functions/validatePreset";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtom } from "jotai/index";
import { localPreferencesSchema } from "schema/preferences.schema";
import { toast } from "sonner";
import { decodeCompressedString, withDevTimeLogger } from "utils";
import { Addons } from "views/Addons";
import { Plus } from "assets/icons/Plus.icon";
import coreFrameworkLogo from "assets/logo_transparent.png";
import { useActiveBuilders } from "hooks/useActiveBuilders";
import { useAutoCompleteLoad } from "hooks/useAutoCompleteLoad";
import { usePush } from "hooks/usePush";
import {
	DEFAULT_LOCAL_PREFERENCES,
	DEFAULT_MAX_SCREEN_WIDTH,
	DEFAULT_MIN_SCREEN_WIDTH,
	DEFAULT_PREFERENCES,
	SPACING_CALCULATOR_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "data/defaults";
import { DEFAULT_PRESET, getBlankPreset, getMinimalPreset } from "data/presets";
import { CORE_FILE_FORMAT } from "constants/coreFileName";
import {
	changeVariablesAtom,
	fluidSpacingHelperResultsAtom,
	fluidTypoGraphyHelperResultsAtom,
	setCurrentPresetAtom,
	setLocalPreferencesAtom,
	spacingDataAtom,
	typographyDataAtom,
	viewAtom,
} from "state";
import { onboardingAllowCloseAtom } from "state/onboardingAtom";
import { lastSavedStateAtom } from "state/saveAtom";
import { Dropzone } from "./basic/Dropzone";
import { Loader } from "./basic/Loader";
import { generateFluidSpacingResult } from "./modules/spacing/functions/getFluidSpacingVariables";
import { retrieveVariablesFromSpacingState } from "./modules/spacing/functions/retrieveVariablesFromSpacingState";
import { generateFluidTypographyResult } from "./modules/typography/functions/getFluidTypeVariables";
import { retrieveVariablesFromTypographyState } from "./modules/typography/functions/retrieveVariablesFromTypographyState";
import { ImportUiKitProjectForm } from "./presetManager/ImportUiKitProject";
import { Row } from "./ui/Row";

const PresetCard = ({
	onClick,
	title,
	subTitle,
	description,
	isSelected,
}: {
	onClick: () => void;
	title: string;
	subTitle: string;
	description: string;
	isSelected: boolean;
}) => {
	return (
		<div className={clsx("preset-card", isSelected && "preset-card-selected")} onClick={onClick}>
			<div className="preset-card-header">
				<b className="preset-card-title">{title}</b>
				<div className="preset-card-subtitle">{subTitle}</div>
			</div>
			<div className="preset-card-description">{description}</div>
		</div>
	);
};

const PRESET_CARDS = [
	{
		title: "Core Framework",
		subTitle: "Full experience",
		description: "Import default colors, typography, spacing, utility classes and variables.",
	},
	{
		title: "Variables only",
		subTitle: "Minimalistic",
		description: "Imports default CSS variables for colors, font sizes, and spacings. No utility classes.",
	},
	{
		title: "Empty",
		subTitle: "Create your own",
		description: "Load an empty interface and start from scratch to create your own framework.",
	},
];

type FormData = {
	selectedPreset: 1 | 2 | 3;
	selectPresetType: "default" | "file" | "uiKit";
	rootFontSize: number;
	isDarkMode: boolean;
};

interface IOnboarding {
	readonly setIsOnboarding: Dispatch<SetStateAction<boolean>>;
}

export const Onboarding = memo(({ setIsOnboarding }: IOnboarding) => {
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<FormData>({
		selectedPreset: 1,
		selectPresetType: "default",
		rootFontSize: 16,
		isDarkMode: true,
	});
	const [tempPreset, setTempPreset] = useState<Preset | null>(null);
	const [info, setInfo] = useState("");

	const setCurrentPreset = useSetAtom(setCurrentPresetAtom);
	const setLastSavedState = useSetAtom(lastSavedStateAtom);
	const setPreferences = useSetAtom(setLocalPreferencesAtom);
	const setFluidTypographyResult = useSetAtom(fluidTypoGraphyHelperResultsAtom);
	const setFluidSpacingResult = useSetAtom(fluidSpacingHelperResultsAtom);
	const changeGlobalCssVariables = useSetAtom(changeVariablesAtom);
	const setView = useSetAtom(viewAtom);

	const [typographyState, setFluidTypography] = useAtom(typographyDataAtom);
	const [spacingState, setSpacingState] = useAtom(spacingDataAtom);

	const onboardingAllowClose = useAtomValue(onboardingAllowCloseAtom);

	async function handleBuildersLoad(builders: string[] | undefined | null) {
		if (builders?.includes("bricks")) {
			setFormData((prev) => ({ ...prev, rootFontSize: 10 }));
		}
	}

	const { activeBuilders } = useActiveBuilders(handleBuildersLoad);

	const { handleLoadOfAutocomplete } = useAutoCompleteLoad();

	const { handlePush } = usePush();

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
						setPreferences({ ...DEFAULT_LOCAL_PREFERENCES, ...pluginSettings });
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

	const onExternalPresetDrop = useCallback(async ([file]: File[]) => {
		toast.promise(
			new Promise(async (resolve, reject) => {
				let preset: Preset;

				try {
					const json = file.name.endsWith(`.${CORE_FILE_FORMAT}`)
						? decodeCompressedString(await file.text())
						: await file.text();

					preset = (await JSON.parse(json)) as Preset;
				} catch (e) {
					return reject("Invalid preset file");
				}

				const parseReturn = validatePreset(preset);

				if (!parseReturn.success) {
					devLog("Invalid preset file", parseReturn);
					return reject("Invalid preset file");
				}

				const preparedPreset = preparePresetToLoad({
					preset,
				});

				setTempPreset(preparedPreset);
				setFormData((prev) => ({ ...prev, selectedPreset: 1, selectPresetType: "file" }));
				setInfo("Selected project from file");
				resolve(preparedPreset);
			}),
			{
				loading: "Loading...",
				success: "Loaded!",
				error: "Failed to import project from file. Ensure the file is valid and try again.",
			},
		);
	}, []);

	async function loadDefaultPreset() {
		if (isLoading) {
			return;
		}

		setIsLoading(true);

		const preferences = (await withDevTimeLogger(getSettings)()) || DEFAULT_LOCAL_PREFERENCES;

		let preset = DEFAULT_PRESET;

		switch (formData.selectedPreset) {
			case 1:
				preset = DEFAULT_PRESET;
				break;
			case 2:
				preset = getMinimalPreset();
				break;
			case 3:
				preset = getBlankPreset();
				break;
		}

		if (!formData.isDarkMode) {
			const newColorGroups = preset.modulesData?.COLOR_SYSTEM?.groups?.map((group) => {
				return {
					...group,
					colors: group.colors.map((color) => {
						return { ...color, isDarkMode: false };
					}),
				};
			})!;

			preset = {
				...preset,
				modulesData: {
					...preset.modulesData,
					COLOR_SYSTEM: { ...preset.modulesData?.COLOR_SYSTEM, groups: newColorGroups },
				},
			};
		}

		preset = {
			...preset,
			preferences: { ...preset.preferences, root_font_size: formData.rootFontSize },
		};

		const ADJUSTED_DEFAULT_PRESET = preparePresetToLoad({
			preset,
			oldPreferences: preferences,
		});

		// Dismiss the onboarding UI first so it doesn't freeze while heavy
		// computation runs synchronously in the next tick.
		setIsLoading(false);
		setIsOnboarding(false);

		setTimeout(() => {
			setFluidTypographyResult(
				generateFluidTypographyResult({
					typographyData: ADJUSTED_DEFAULT_PRESET?.modulesData?.FLUID_TYPOGRAPHY || TYPOGRAPHY_INITIAL_STATE,
					root_font_size: Number(preferences?.root_font_size || DEFAULT_PREFERENCES.root_font_size),
					is_rem: Boolean(preferences?.is_rem),
					min_screen_width: preferences?.min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
					max_screen_width: preferences?.max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
				}),
			);

			setFluidSpacingResult(
				generateFluidSpacingResult({
					spacingState: ADJUSTED_DEFAULT_PRESET?.modulesData?.FLUID_SPACING || SPACING_CALCULATOR_INITIAL_STATE,
					root_font_size: Number(preferences?.root_font_size || DEFAULT_PREFERENCES.root_font_size),
					is_rem: Boolean(preferences?.is_rem),
					min_screen_width: preferences?.min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
					max_screen_width: preferences?.max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
				}),
			);

			const spacingVariables = retrieveVariablesFromSpacingState(
				ADJUSTED_DEFAULT_PRESET?.modulesData?.FLUID_SPACING?.groups[0] ||
					SPACING_CALCULATOR_INITIAL_STATE.groups[0],
			);
			const typographyVariables = retrieveVariablesFromTypographyState(
				ADJUSTED_DEFAULT_PRESET?.modulesData?.FLUID_TYPOGRAPHY?.groups[0] || TYPOGRAPHY_INITIAL_STATE.groups[0],
			);

			changeGlobalCssVariables({ variables: spacingVariables, type: "SPACING" });
			changeGlobalCssVariables({ variables: typographyVariables, type: "FLUID_TYPOGRAPHY" });

			handleLoadOfAutocomplete(ADJUSTED_DEFAULT_PRESET);

			setCurrentPreset(ADJUSTED_DEFAULT_PRESET);

			// Initialize save state baseline so change detection works correctly after onboarding
			const sanitized = sanitizePreset(ADJUSTED_DEFAULT_PRESET);
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

			setView("COLOR_SYSTEM");

			// Disable typography & spacing modules on 'Empty Preset'
			const isEmptyPreset = formData.selectedPreset === 3;
			if (isEmptyPreset) {
				setFluidTypography((prev) => ({ ...prev, isDisabled: true }));
				setSpacingState((prev) => ({ ...prev, isDisabled: true }));
			}
		}, 0);
	}

	useEffect(() => {
		handleBuildersLoad(activeBuilders);
	}, [activeBuilders]);

	return (
		<div className="onboarding-container">
			<div className="onboarding">
				{onboardingAllowClose ? (
					<button className="onboarding-close" onClick={() => setIsOnboarding(false)}>
						<Plus />
					</button>
				) : null}

				<div className="header">
					<div className="left">
						<img src={coreFrameworkLogo} alt="Core Framework Logo" />
						<h1>Let's get started</h1>
					</div>

					<div className="right">
						<div className="progress">
							{new Array(3).fill(0).map((_, index) => (
								<div
									key={index}
									className={clsx("progress-dot", step >= index + 1 && "progress-dot-active")}
								/>
							))}
						</div>
					</div>
				</div>

				<div className="inner-container">
					{step === 1 ? (
						<div className="">
							<h2>1. How do you wish to start?</h2>
							<div
								className={clsx(
									"preset-selector-container",
									formData.selectPresetType === "default" && "selected",
								)}
							>
								{PRESET_CARDS.map((preset, index) => (
									<PresetCard
										key={preset.title}
										{...preset}
										onClick={() => {
											setInfo("");
											setFormData((prev) => ({
												...prev,
												selectedPreset: (index + 1) as 1 | 2 | 3,
												selectedPresetType: "default",
											}));
										}}
										isSelected={
											formData.selectedPreset === ((index + 1) as 1 | 2 | 3) &&
											formData.selectPresetType === "default"
										}
									/>
								))}
							</div>

							{/* <div className="preset-selector-container external-presets-container">
								<div
									className={clsx("dropzone-container", formData.selectPresetType === "file" && "selected")}
								>
									<Dropzone onDrop={onExternalPresetDrop} />
								</div>

								<div
									className={clsx("ui-kit-import-form", formData.selectPresetType === "uiKit" && "selected")}
								>
									<ImportUiKitProjectForm
										setExternalPreset={(preset) => {
											setFormData((prev) => ({ ...prev, selectedPreset: 1, selectPresetType: "uiKit" }));
											setTempPreset(preset);
											setInfo(`Selected project "${preset.name}"`);
										}}
									/>
								</div>
							</div> */}
						</div>
					) : null}

					{step === 2 ? (
						<div>
							<h2>2. Do you want to activate any addons?</h2>
							<div className="addons-container">
								<Addons withoutSection isMinimal />
							</div>
						</div>
					) : null}

					{step === 3 ? (
						<div className="">
							<h2>3. Set up your basic preferences</h2>
							<div className="preference-row">
								<Row label="Root font size" htmlFor="root_font_size">
									<Select
										onChange={(value) =>
											setFormData((prev) => ({ ...prev, rootFontSize: value === "62.5%" ? 10 : 16 }))
										}
										value={formData.rootFontSize === 10 ? "62.5%" : "100%"}
										data={["100%", "62.5%"]}
										id="root_font_size"
										className="preferences-right-side"
									/>
								</Row>
							</div>

							{formData.selectPresetType === "default" ? (
								<div className="preference-row">
									<Row label="Dark mode" htmlFor="is_dark_mode">
										<Switch
											onChange={({ target: { checked } }) =>
												setFormData((prev) => ({ ...prev, isDarkMode: checked }))
											}
											checked={formData.isDarkMode}
											id="is_dark_mode"
										/>
									</Row>
								</div>
							) : null}
						</div>
					) : null}
				</div>

				<div className="footer">
					<a
						className="help"
						href="https://docs.coreframework.com/getting-started/initial-setup-and-configuration#onboarding"
						target="_blank"
						rel="noreferrer"
					>
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<g clipPath="url(#clip0_13_64)">
								<path
									d="M10 21H14"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M10 3H14"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M3 10V14"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M21 10V14"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M7 21V21C4.79086 21 3 19.2091 3 17V17"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M7 21V21C4.79086 21 3 19.2091 3 17V17"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M17 3C19.2091 3 21 4.79086 21 7"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M3 7C3 4.79086 4.79086 3 7 3"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M21 17C21 19.2091 19.2091 21 17 21"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M12 13.5V12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M12 15.95C11.9736 15.9494 11.9516 15.9704 11.951 15.9969V16C11.951 16.0271 11.973 16.049 12 16.049C12.0271 16.049 12.049 16.0271 12.049 16C12.049 15.9729 12.0271 15.951 12 15.951H11.999"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M12.05 16C12.05 16.0276 12.0276 16.05 12 16.05C11.9723 16.05 11.95 16.0276 11.95 16C11.95 15.9724 11.9723 15.95 12 15.95"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M12 15.95C12.0276 15.95 12.05 15.9724 12.05 16"
									stroke="white"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</g>
							<defs>
								<clipPath id="clip0_13_64">
									<rect width="24" height="24" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</a>

					<div className="right">
						<p className="info">{info}</p>

						{[2, 3].includes(step) && (
							<button
								className="btn-tertiary padding-s"
								style={{ whiteSpace: "nowrap" }}
								onClick={() => {
									setStep((p) => (p - 1 <= 0 ? 1 : p - 1));
								}}
							>
								Go Back
							</button>
						)}

						{step === 3 ? (
							<button
								id="push1"
								onClick={() => {
									toast.promise(loadDefaultPreset(), {
										loading: "Loading...",
										success: "Loaded!",
										error: "Something went wrong [#07]",
									});
								}}
								className={clsx("btn-primary btn-m full-width relative")}
							>
								<span style={{ opacity: isLoading ? 0 : 1 }}>Finish</span>
								{isLoading && <Loader size="within-button" />}
							</button>
						) : (
							<button
								className="btn-primary btn-m full-width relative"
								onClick={() => {
									setStep((p) => (p + 1 >= 4 ? 3 : p + 1));
								}}
							>
								Continue
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});

Onboarding.displayName = "Onboarding";
