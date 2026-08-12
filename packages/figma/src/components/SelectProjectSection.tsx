import { memo, useEffect, useState } from "react";
import { getColorVariables } from "../colors/getColorVariables";
import { getSimpleVariable } from "../functions/getSimpleVariable";
import { getVariables } from "../functions/getVariables";
import { processFluidDeclarations } from "../functions/processFluidDeclarations";
import { generateSpacingObjects } from "../spacing/getFluidSpacingVariables";
import { ColorVariable, Declaration, Preset, SimpleVariable } from "../types";
import { generateFluidTypographyObjects } from "../typography/getFluidTypeVariables";
import { devLog } from "../utils";
import { isMessageFromEditor, postMessageToIframe, postMessageToParent } from "../utils/frameMessaging";
import { Card } from "./Card";

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
		setError(null);

		const connectionKey = apiKey.trim();
		if (!connectionKey) {
			setIsLoading(false);
			return;
		}

		postMessageToParent({ type: "import-project-from-plugin-api", apiKey: connectionKey });
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
		const handlePluginMessage = (
			event: MessageEvent<{
				pluginMessage?: {
					type?: string;
					error?: string;
					projectId?: string;
					preset?: Preset;
				};
			}>,
		) => {
			if (event.data?.pluginMessage && event.source !== parent) return;

			const pluginMessage = event?.data?.pluginMessage;
			devLog("pluginMessage", pluginMessage);
			switch (pluginMessage?.type) {
				case "import-project": {
					setIsLoading(false);
					break;
				}
				case "import-project-error": {
					setIsLoading(false);
					setError(pluginMessage?.error || "Could not connect. Check the WordPress connection key.");
					break;
				}
				case "added-variables": {
					setIsLoading(false);
					break;
				}
				case "get-project-id": {
					const receivedApiKey = event.data.pluginMessage?.projectId;

					if (receivedApiKey) {
						postMessageToIframe("cf-figma-set-api-key", { apiKey: receivedApiKey });
						setApiKey(receivedApiKey);
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
		window.addEventListener("message", handlePluginMessage);

		postMessageToParent({ type: "get-project-id" });
		postMessageToParent({ type: "get-project-locally" });

		const handleEditorMessage = (event: MessageEvent) => {
			if (isMessageFromEditor(event) && event.data.type === "cf-figma-ready") {
				devLog("Figma is ready");
			}
		};
		window.addEventListener("message", handleEditorMessage);

		return () => {
			window.removeEventListener("message", handlePluginMessage);
			window.removeEventListener("message", handleEditorMessage);
		};
	}, []);

	return (
		<div className="main-content">
			<div className="content-row">
				<Card
					icon="cloud"
					title="Connect a WordPress project"
					input={{
						label: "WordPress connection key",
						placeholder: "Paste the key from Core Framework → Figma",
						value: apiKey,
						disabled: isLoading,
						onChange: (e) => setApiKey((e.target as HTMLInputElement).value),
					}}
					button={{
						label: isLoading ? "Connecting..." : "Connect",
						disabled: isLoading,
					}}
					footerContent={
						<p>
							This is a private connection credential, not a license key. Core Framework for Figma is free and
							open source.
						</p>
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
