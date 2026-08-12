import { memo, useEffect, useState } from "react";
import { getColorVariables } from "../colors/getColorVariables";
import { getSimpleVariable } from "../functions/getSimpleVariable";
import { getVariables } from "../functions/getVariables";
import { processFluidDeclarations } from "../functions/processFluidDeclarations";
import { generateSpacingObjects } from "../spacing/getFluidSpacingVariables";
import { ColorVariable, Declaration, Preset, SimpleVariable } from "../types";
import { generateFluidTypographyObjects } from "../typography/getFluidTypeVariables";
import { devLog } from "../utils";
import { postMessageToIframe, postMessageToParent } from "../utils/frameMessaging";
import { Card } from "./Card";

export const DEFAULT_PROJECT_ID = "01HMB7EMKGNDV86N20VTS7J0MZ";
const WEB_SYNC_PREFIX = "cfweb:";

interface SelectProjectSection {
	handleShowIframe: (value: boolean | null) => void;
	handleLoadedPreset: (value: Preset | null) => void;
}

export const SelectProjectSection = memo<SelectProjectSection>(({ handleLoadedPreset, handleShowIframe }) => {
	const [, setVariables] = useState<SimpleVariable[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const [localPreset, setLocalPreset] = useState<Preset | null>(null);
	const [showConfirmation, setShowConfirmation] = useState(false);

	const onImport = (apiKey: string) => {
		setIsLoading(true);

		if (!apiKey) {
			setIsLoading(false);
			return;
		}
		let parsedApiKey = apiKey;
		if (apiKey.startsWith("https://")) {
			const url = new URL(apiKey ?? "");
			parsedApiKey = url.pathname.split("/")[2];
		}

		const isWebProject = parsedApiKey.length === DEFAULT_PROJECT_ID.length;
		const isWebSyncKey = parsedApiKey.startsWith(WEB_SYNC_PREFIX);

		postMessageToIframe("cf-figma-set-api-key", {
			apiKey: isWebProject ? "" : parsedApiKey,
		});

		if (!isWebProject && !isWebSyncKey) {
			try {
				const [pass, url] = [parsedApiKey.slice(0, 24), decodeURIComponent(parsedApiKey.slice(24))];
				postMessageToParent({
					type: "import-project-from-plugin-api",
					apiKey,
					pass,
					url: url.replace("http://", "https://"),
				});
			} catch (e) {
				console.error(e);
				setError("An error occurred while validating the project ID. Please try again.");
				setIsLoading(false);
			}

			return;
		}

		postMessageToParent({ type: "import-project", apiKey: parsedApiKey });
	};

	interface SyncVariablesProps {
		preset: Preset | undefined;
		colorVariables: ColorVariable[] | undefined;
	}

	const syncVariables = ({ preset, colorVariables }: SyncVariablesProps) => {
		if (!preset || !colorVariables) {
			console.error("No preset or color variables");
			return;
		}

		const preferences = preset?.preferences;

		const styleVariables = getVariables(preset);

		const fluidSpacingObjects = generateSpacingObjects({
			formData: preset?.modulesData?.FLUID_SPACING,
			min_screen_width: preferences?.min_screen_width || 320,
			max_screen_width: preferences?.max_screen_width || 1400,
			is_rem: false,
			root_font_size: preferences?.root_font_size || 16,
			is_add_group_comments: false,
			onlyVariables: true,
		});

		const fluidTypographyObjects = generateFluidTypographyObjects({
			formData: preset?.modulesData?.FLUID_TYPOGRAPHY,
			min_screen_width: preferences?.min_screen_width || 320,
			max_screen_width: preferences?.max_screen_width || 1400,
			is_rem: false,
			root_font_size: preferences?.root_font_size || 16,
			is_add_group_comments: false,
			onlyVariables: true,
		});

		const colorVariablesDeclarations = getColorVariables({
			preset,
			colorVariables,
		});

		const { mobile: fluidSpacingMobileDeclarations, desktop: fluidSpacingDesktopDeclarations } =
			processFluidDeclarations(fluidSpacingObjects, preset);

		const { mobile: fluidTypographyMobileDeclarations, desktop: fluidTypographyDesktopDeclarations } =
			processFluidDeclarations(fluidTypographyObjects, preset);

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

		setVariables(variables);
		postMessageToParent({ type: "add-variables", variables });
	};

	const loadOnboarding = () => {
		if (localPreset?.id) {
			setShowConfirmation(true);
		} else {
			startNewProject();
		}
	};

	const startNewProject = () => {
		handleShowIframe(true);
		setIsLoading(false);
		postMessageToIframe("cf-figma-load-preset-default", { name: "Default Project" });
		postMessageToIframe("cf-figma-set-api-key", { apiKey: "" });
	};

	const useLocalProject = () => {
		postMessageToIframe("cf-figma-set-api-key", { apiKey: "" });
		postMessageToIframe("cf-figma-load-preset", { preset: JSON.stringify(localPreset) });
		handleShowIframe(true);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (apiKey) {
			onImport(apiKey);
		}
	};

	useEffect(() => {
		window.onmessage = (event: {
			data?: {
				pluginMessage?: {
					type?: any;
					message?: any;
					projectId?: string;
					preset?: Preset;
				};
			};
		}) => {
			const pluginMessage = event?.data?.pluginMessage;
			devLog("pluginMessage", pluginMessage);
			switch (pluginMessage?.type) {
				// Note: "import-project" and "import-project-error" are handled in app.tsx
				// because this component unmounts after project loads
				case "added-variables": {
					setIsLoading(false);
					break;
				}
				case "get-project-id": {
					const receivedApiKey = event.data.pluginMessage?.projectId;

					if (receivedApiKey) {
						postMessageToIframe("cf-figma-set-api-key", {
							apiKey: receivedApiKey.length === DEFAULT_PROJECT_ID.length ? "" : receivedApiKey,
						});

						setApiKey(receivedApiKey);
						// onImport(receivedApiKey); // This will automatically open the latest project
					}

					break;
				}
				case "get-project-locally": {
					const preset = event.data.pluginMessage?.preset;
					if (preset) {
						setLocalPreset(preset);
					}
					setIsLoading(false);
					break;
				}
			}
		};

		postMessageToParent({ type: "get-project-id" });
		postMessageToParent({ type: "get-project-locally" });

		window.addEventListener("message", (event) => {
			if (event.data.type === "cf-figma-ready") {
				devLog("Figma is ready");
			}
			// Note: "cf-push" and "cf-push-local" are handled in app.tsx
			// because this component unmounts after project loads
		});
	}, []);

	return (
		<div className="main-content">
			<div className="content-row">
				<Card
					icon="cloud"
					title="Connect existing project"
					input={{
						label: "Project ID / Connection key",
						placeholder: "Enter Project ID / Connection key",
						value: apiKey,
						disabled: isLoading,
						onChange: (e) => setApiKey((e.target as HTMLInputElement).value),
					}}
					button={{
						label: isLoading ? "Connecting..." : "Connect",
						disabled: isLoading,
					}}
					footerContent={
						<>
							<p>
								<span>Web App</span>: Enter Project ID of your web project.
							</p>
							<p>
								<span>WordPress</span>: Enter a connection key from the Figma add-on settings panel
							</p>
						</>
					}
					onSubmit={handleSubmit}
					error={error}
					isLoading={isLoading}
					isForm
				/>

				<p>or</p>

				<Card
					icon="brush"
					title="Start a new project"
					content={
						<>
							{showConfirmation ? (
								<div className="confirmation-inline">
									<p>You have a local project. What would you like to do?</p>
									<div className="confirmation-buttons">
										<button className="btn-primary" onClick={startNewProject}>
											Start from scratch
										</button>
										<button className="btn-cancel" onClick={() => setShowConfirmation(false)}>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<>
									{localPreset?.id && (
										<button className="btn-primary" onClick={useLocalProject}>
											Use local project
										</button>
									)}
									<button
										className={localPreset?.id ? "btn-secondary" : "btn-primary"}
										onClick={loadOnboarding}
									>
										Start New Project
									</button>
								</>
							)}
						</>
					}
					footerContent={
						<p>
							The new Core Framework project will be created in current Figma file, allowing you to set up
							your color, text and space variables.
						</p>
					}
				/>
			</div>
		</div>
	);
});
