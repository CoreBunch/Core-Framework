import { useEffect, useState } from "react";
import bg from "../public/bg.jpg";
import "./app.scss";
import { getColorVariables } from "./colors/getColorVariables";
import { SelectProjectSection } from "./components/SelectProjectSection";
import { getSimpleVariable } from "./functions/getSimpleVariable";
import { getVariables } from "./functions/getVariables";
import { processFluidDeclarations } from "./functions/processFluidDeclarations";
import { Home } from "./home";
import { generateSpacingObjects } from "./spacing/getFluidSpacingVariables";
import "./style.scss";
import { ColorVariable, Declaration, Preset, SimpleVariable } from "./types";
import { generateFluidTypographyObjects } from "./typography/getFluidTypeVariables";
import { footerLinks } from "./utils/footer";
import {
	getPluginMessage,
	isMessageFromEditor,
	postMessageToIframe,
	postMessageToParent,
} from "./utils/frameMessaging";

// Sync variables to Figma - must be outside component to avoid stale closures
function syncVariables(presetData: Preset, colorVariables: ColorVariable[]) {
	if (!presetData || !colorVariables) {
		console.error("No preset or color variables");
		return;
	}

	const preferences = presetData?.preferences;

	const styleVariables = getVariables(presetData);

	const fluidSpacingObjects = generateSpacingObjects({
		formData: presetData?.modulesData?.FLUID_SPACING,
		min_screen_width: preferences?.min_screen_width || 320,
		max_screen_width: preferences?.max_screen_width || 1400,
		is_rem: false,
		root_font_size: preferences?.root_font_size || 16,
		is_add_group_comments: false,
		onlyVariables: true,
	});

	const fluidTypographyObjects = generateFluidTypographyObjects({
		formData: presetData?.modulesData?.FLUID_TYPOGRAPHY,
		min_screen_width: preferences?.min_screen_width || 320,
		max_screen_width: preferences?.max_screen_width || 1400,
		is_rem: false,
		root_font_size: preferences?.root_font_size || 16,
		is_add_group_comments: false,
		onlyVariables: true,
	});

	const colorVariablesDeclarations = getColorVariables({
		preset: presetData,
		colorVariables,
	});

	const { mobile: fluidSpacingMobileDeclarations, desktop: fluidSpacingDesktopDeclarations } =
		processFluidDeclarations(fluidSpacingObjects, presetData);

	const { mobile: fluidTypographyMobileDeclarations, desktop: fluidTypographyDesktopDeclarations } =
		processFluidDeclarations(fluidTypographyObjects, presetData);

	const screenSizeVariables: Declaration[] = [
		...(preferences?.min_screen_width
			? [
					{
						id: "min-screen-width",
						property: "--min-screen-width",
						value: `${preferences?.min_screen_width}px`,
					},
				]
			: []),
		...(preferences?.max_screen_width
			? [
					{
						id: "max-screen-width",
						property: "--max-screen-width",
						value: `${preferences?.max_screen_width}px`,
					},
				]
			: []),
	];

	const variables = [
		...styleVariables,
		...screenSizeVariables.map((declaration) =>
			getSimpleVariable({ groupName: "Screen Size", preferences, declaration }),
		),
		...fluidSpacingMobileDeclarations.map((declaration) =>
			getSimpleVariable({ groupName: "Fluid Spacing Mobile", preferences, declaration }),
		),
		...fluidSpacingDesktopDeclarations.map((declaration) =>
			getSimpleVariable({ groupName: "Fluid Spacing Desktop", preferences, declaration }),
		),
		...fluidTypographyMobileDeclarations.map((declaration) =>
			getSimpleVariable({ groupName: "Fluid Typography Mobile", preferences, declaration }),
		),
		...fluidTypographyDesktopDeclarations.map((declaration) =>
			getSimpleVariable({ groupName: "Fluid Typography Desktop", preferences, declaration }),
		),
		...colorVariablesDeclarations,
	].filter((variable) => {
		return (
			Boolean(variable.variable) &&
			Boolean(variable.value) &&
			variable.variable !== "/" &&
			variable.value !== ""
		);
	});

	postMessageToParent({ type: "add-variables", variables });
}

function App() {
	const [preset, setPreset] = useState<Preset | null>(null);
	const [showIframe, setShowIframe] = useState<boolean | null>(false);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// Raw messages belong to the bundled editor iframe. Figma host messages
			// arrive wrapped in event.data.pluginMessage.
			if (event.data?.type && !isMessageFromEditor(event)) return;

			if (event.data.type === "figma-reopen") {
				setPreset(null);
				setShowIframe(false);
				setTimeout(() => {
					postMessageToParent({ type: "get-project-id" });
				}, 250);
			}

			if (event.data.type === "cf-figma-wordpress-request") {
				postMessageToParent({
					type: "wordpress-request",
					requestId: event.data.requestId,
					url: event.data.url,
					method: event.data.method,
					body: event.data.body,
				});
			}

			if (event.data.type === "update-project") {
				const apiKey = typeof event.data.apiKey === "string" ? event.data.apiKey.trim() : "";
				if (apiKey) {
					postMessageToParent({ type: "import-project-from-plugin-api", apiKey });
				}
			}

			// Handle messages from Figma main code (code.ts)
			// This handler must be in app.tsx because SelectProjectSection unmounts after project loads
			const pluginMessage = getPluginMessage<{
				type?: string;
				error?: string;
				preset?: Preset;
				projectId?: string;
			}>(event);
			if (pluginMessage?.type === "wordpress-response") {
				postMessageToIframe("cf-figma-wordpress-response", pluginMessage);
			}

			if (pluginMessage?.type === "import-project") {
				const importedPreset = pluginMessage?.preset as Preset | undefined;
				if (importedPreset) {
					if (pluginMessage?.projectId) {
						postMessageToIframe("cf-figma-set-api-key", { apiKey: pluginMessage.projectId });
					}
					setPreset(importedPreset);
					setShowIframe(true);
					postMessageToIframe("cf-figma-load-preset", { preset: JSON.stringify(importedPreset) });
				} else {
					console.error("Failed to import project: preset data is missing");
				}
			}

			if (pluginMessage?.type === "import-project-error") {
				console.error("Failed to import project:", pluginMessage?.error);
				// Reset state to allow retry
				setShowIframe(false);
			}

			// Handle cf-push from iframe (Save button)
			// This must be in app.tsx because SelectProjectSection unmounts after project loads
			if (event.data.type === "cf-push") {
				const payload = event.data.payload;
				if (payload?.preset && payload?.colorVariables) {
					setPreset(payload.preset);
					setShowIframe(true);
					syncVariables(payload.preset, payload.colorVariables);
				}
			}

			if (event.data.type === "cf-push-local") {
				const payload = event.data.payload;
				parent.postMessage({ pluginMessage: { type: "save-project-locally", payload } }, "*");
				if (payload?.preset && payload?.colorVariables) {
					syncVariables(payload.preset, payload.colorVariables);
				}
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	return (
		<div className={`app-container ${!showIframe || !preset ? "loading-screen" : ""}`}>
			{!showIframe && (
				<>
					<div className="background-circles" />
					<div className="background-circles-bottom" />

					<div className="background-image">
						<img src={bg} alt="" />
					</div>

					<div className="content-container">
						<div className="container-wrapper">
							<div className="welcome-block">
								<h1 className="title">Welcome to Core Framework for Figma</h1>
								<p className="description">You have two options to get started:</p>
							</div>

							<SelectProjectSection
								handleLoadedPreset={(value) => setPreset(value)}
								handleShowIframe={(value) => setShowIframe(value)}
							/>
						</div>
					</div>

					<div className="content-footer">
						<ul className="footer-nav">
							{footerLinks.map(({ label, link }) => (
								<li className="nav-item">
									<a href={link} target="_blank">
										{label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</>
			)}

			<Home showIframe={showIframe} />
		</div>
	);
}

export default App;
