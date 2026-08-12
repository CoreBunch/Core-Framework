import { useEffect } from "react";
import clsx from "clsx";
import { useAtomValue } from "jotai/index";
import { LoaderView } from "views/LoaderView";
import { Onboarding } from "components/Onboarding";
import { useEffectOnce } from "hooks/useEffectOnce";
import { useInitialLoad } from "hooks/useInitialLoad";
import { isFullScreenModeAtom } from "./state/fullscreenAtoms";
import { searchAtom } from "./state/searchAtom";
import { GlobalSearch } from "./components/GlobalSearch";
import { Nav } from "./components/Nav";
import { Side } from "./components/Side";
import { ViewRouter } from "./components/ViewRouter";
import "./styles/hljs.scss";
import "./styles/index.scss";

window.coreframework = {
	nonce: window.wpApiSettings.nonce,
	rest_url: window.wpApiSettings.root,
	core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
};

export function App() {
	const { currentPreset, isOnboarding, setIsOnboarding } = useInitialLoad();
	const isSearch = useAtomValue(searchAtom);
	const isFullScreenMode = useAtomValue(isFullScreenModeAtom);

	useEffectOnce(() => (document.title = `Core Framework ${document.title}`));

	useEffect(() => {
		if (!isOnboarding) {
			const event = new CustomEvent("addon-enabled", {
				detail: { onboardingFinished: true },
			});
			document.dispatchEvent(event);
		}
	}, [isOnboarding]);

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
