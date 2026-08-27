import { useEffect } from "react";
import { useCallback } from "react";
import clsx from "clsx";
import { devLog } from "functions/devLog";
import { isEmbed } from "functions/isEmbed";
import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { safeLocalStorage } from "functions/safeLocalStorage";
import { sanitizePreset } from "functions/sanitizePreset";
import { validatePreset } from "functions/validatePreset";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { withDevTimeLogger } from "utils";
import { LoaderView } from "views/LoaderView";
import { Onboarding } from "components/Onboarding";
import { useAutoCompleteLoad } from "hooks/useAutoCompleteLoad";
import { useEffectOnce } from "hooks/useEffectOnce";
import { isFullScreenModeAtom } from "./state/fullscreenAtoms";
import { searchAtom } from "./state/searchAtom";
import { currentPresetAtom, getPresetFromCurrentPresetAtom, setCurrentPresetAtom } from "state";
import { figmaAtom } from "state/figmaAtom";
import { onboardingAtom, onboardingNameAtom } from "state/onboardingAtom";
import { lastSavedStateAtom } from "state/saveAtom";
import { GlobalSearch } from "./components/GlobalSearch";
import { Nav } from "./components/Nav";
import { Side } from "./components/Side";
import { ViewRouter } from "./components/ViewRouter";
import { isFigma } from "./functions/isFigma";
import "./styles/hljs.scss";
import "./styles/index.scss";

export function App() {
	const setCurrentPreset = useSetAtom(setCurrentPresetAtom);
	const setLastSavedState = useSetAtom(lastSavedStateAtom);

	// Add callback to get the preset from atoms after they're set
	const getCompletePreset = useAtomCallback(useCallback((get) => get(getPresetFromCurrentPresetAtom), []));

	const currentPreset = useAtomValue(currentPresetAtom);
	const isFullScreenMode = useAtomValue(isFullScreenModeAtom);
	const [isOnboarding, setIsOnboarding] = useAtom(onboardingAtom);
	const setOnboardingName = useSetAtom(onboardingNameAtom);
	const isSearch = useAtomValue(searchAtom);

	const { handleLoadOfAutocomplete } = useAutoCompleteLoad();

	const setFigma = useSetAtom(figmaAtom);

	function onEmbedLoadPreset(event: MessageEvent) {
		try {
			const currentFramework = event?.data?.preset;
			const isViewOnly = event?.data?.isViewOnly;

			if (isViewOnly) {
				document.getElementById("push1")?.remove();
				document.getElementById("push2")?.remove();
			}

			if (currentFramework) {
				const parsed = JSON.parse(currentFramework);
				const parseReturn = withDevTimeLogger(validatePreset)(parsed);

				if (parseReturn?.success && parseReturn?.data) {
					const preparedPreset = preparePresetToLoad({
						preset: parseReturn?.data,
					});

					setCurrentPreset(preparedPreset);
					handleLoadOfAutocomplete(preparedPreset);
					devLog("Succesfully loaded preset from parent");

					// Initialize the last saved state after atoms are populated
					// Increased timeout to ensure all modules have initialized
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

					return;
				}

				setIsOnboarding(true);

				devLog("Zod Error", parseReturn);
				devLog("Invalid preset, setting to default");
			} else {
				devLog("No preset found, setting to default");
				setIsOnboarding(true);
			}
		} catch (e) {
			setIsOnboarding(true);
			devLog("No preset found, setting to default");
		}
	}

	async function onFigmaLoadPreset(event: MessageEvent) {
		try {
			setCurrentPreset(null);
			await new Promise((resolve) => setTimeout(resolve, 250));

			const currentFramework = event?.data?.preset;

			if (currentFramework) {
				const parsed = JSON.parse(currentFramework);
				const parseReturn = withDevTimeLogger(validatePreset)(parsed);

				if (parseReturn?.success && parseReturn?.data) {
					const preparedPreset = preparePresetToLoad({
						preset: parseReturn?.data,
					});

					setCurrentPreset(preparedPreset);
					handleLoadOfAutocomplete(preparedPreset);
					devLog("Succesfully loaded preset from parent");
					setIsOnboarding(false);

					// Initialize the last saved state after atoms are populated
					// Increased timeout to ensure all modules have initialized
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

					return;
				}

				setIsOnboarding(true);

				devLog("Zod Error", parseReturn);
				devLog("Invalid preset, setting to default");
			} else {
				devLog("No preset found, setting to default");
				setIsOnboarding(true);
			}
		} catch (e) {
			setIsOnboarding(true);
			devLog("No preset found, opening onboarding");
		}
	}

	function onFigmaLoadPresetDefault(event: MessageEvent) {
		try {
			const name = event?.data?.name;
			setIsOnboarding(true);
			devLog("Event: 'cf-figma-load-preset-default'", event);
			if (name) {
				setOnboardingName(name);
			}
		} catch (e) {
			setIsOnboarding(true);
			devLog("No preset found, opening onboarding");
		}
	}

	function handleFigma() {
		setIsOnboarding(true);

		document.getElementById("root")?.classList.add("figma");

		document.body.style.overflow = "hidden";
		document.documentElement.style.overflow = "hidden";

		const app = document.getElementsByClassName("App")?.[0] as HTMLElement | undefined;

		if (app) {
			/**
			 * I have no clue why this does not remove border
			 */
			app.style.border = "none";
			app.style.borderWidth = "10px";
			app.style.borderRadius = "0px";
			app.style.height = "100vh";
			app.style.outline = "none";
		}

		const style = document.createElement("style");
		style.innerHTML = `.App { border: none !important; border-width: 0px !important;}`;
		document.head.appendChild(style);

		window.addEventListener("message", (event) => {
			devLog("figma event", event.data);

			if (event.data.type === "cf-figma-load-preset") {
				setIsOnboarding(false);
				onFigmaLoadPreset(event);
			}

			if (event.data.type === "cf-figma-load-preset-default") {
				setIsOnboarding(true);
				onFigmaLoadPresetDefault(event);
			}

			if (event.data.type === "cf-figma-set-api-key" && event.data.apiKey !== undefined) {
				devLog("setting connection key");
				setFigma((prev) => ({ ...prev, apiKey: event.data.apiKey }));
			}
		});

		window.parent.postMessage({ type: "cf-figma-ready" }, "*");
	}

	function handleEmbed() {
		window.addEventListener("message", (event) => {
			switch (event.data.type) {
				case "cf-embed-load-preset": {
					devLog("Event: 'cf-embed-load-preset'", event);
					onEmbedLoadPreset(event);
					break;
				}
				case "cf-embed-load-preset-default": {
					const name = event.data.name;
					setIsOnboarding(true);
					devLog("Event: 'cf-embed-load-preset-default", event);

					if (name) {
						setOnboardingName(name);
					}

					break;
				}
				default: {
					break;
				}
			}
		});

		window.parent.postMessage({ type: "cf-ready" }, "*");
	}

	function handleLocal() {
		const current_framework = safeLocalStorage.getItem("current_framework");

		if (current_framework) {
			const parsed = JSON.parse(current_framework);
			const parseReturn = validatePreset(parsed);

			if (parseReturn?.success && parseReturn?.data) {
				const preparedPreset = preparePresetToLoad({
					preset: parseReturn?.data,
				});

				setCurrentPreset(preparedPreset);
				handleLoadOfAutocomplete(preparedPreset);

				// Initialize the last saved state after atoms are populated
				// This prevents showing "unsaved changes" when the app first loads
				// Increased timeout to ensure all modules have initialized
				setTimeout(async () => {
					const completePreset = await getCompletePreset();
					if (completePreset) {
						setLastSavedState(JSON.stringify(sanitizePreset(completePreset)));
					}
				}, 1000);

				return;
			}

			console.log("%c Invalid preset, setting to default", "color: #FFA500");
			devLog("Zod Error", parseReturn);
		} else {
			console.log("%c No preset found, setting to default", "color: #FFA500");
		}

		setIsOnboarding(true);
	}

	useEffectOnce(() => {
		if (isFigma()) {
			handleFigma();
			return;
		}

		if (isEmbed()) {
			handleEmbed();
			return;
		}

		handleLocal();

		document.body.style.backgroundColor = "black";
	}, []);

	// Removed automatic save prompt on app load - now using dirty state tracking instead

	if (!currentPreset && !isOnboarding) {
		return (
			<main className="App" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<LoaderView />
			</main>
		);
	}

	if (isOnboarding) {
		return (
			<main
				className="App"
				style={{ gridTemplateColumns: "1fr", border: "none", backgroundColor: "transparent" }}
			>
				<Onboarding setIsOnboarding={setIsOnboarding} />
			</main>
		);
	}

	return (
		<main className={clsx("App", { "is-search": isSearch, "fullscreen-mode": isFullScreenMode })}>
			<GlobalSearch />

			<Nav />
			<ViewRouter />
			<Side />
		</main>
	);
}
