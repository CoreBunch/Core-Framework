import { SimpleVariable } from "../src/types";
import { readLocalProject, saveLocalProject } from "./localProjectStorage";
import {
	ALLOWED_REST_ROUTES,
	PRESET_REST_ROUTE,
	extractRestRoute,
	fetchWordPressRest,
	parseHttpUrl,
	parseWordPressConnectionKey,
} from "./wordpressConnection";

const PRESET_API_KEY_STORAGE_KEY = "cf_plugin_project_api_key";

interface PresetResponse {
	success?: boolean;
	data?: unknown;
}

async function fetchPreset(connectionKey: string): Promise<PresetResponse> {
	const connection = parseWordPressConnectionKey(connectionKey);
	if (!connection) throw new Error("Invalid WordPress connection key");

	const result = await fetchWordPressRest(connection.siteUrl, PRESET_REST_ROUTE, {
		method: "GET",
		connectionKey,
	});

	if (!result.reachable) {
		throw new Error(
			`Could not reach ${connection.siteUrl}. Check the site is online and the Core Framework plugin is active.`,
		);
	}

	if (result.status === 401 || result.status === 403) {
		throw new Error(
			"WordPress rejected the connection key. Open the Core Framework plugin on your site, generate a new key, and paste it again.",
		);
	}

	if (!result.ok) {
		throw new Error(`WordPress returned ${result.status} for the preset request.`);
	}

	return (result.data ?? {}) as PresetResponse;
}

async function getStoredConnectionKey() {
	const storedKey = await figma.clientStorage.getAsync(PRESET_API_KEY_STORAGE_KEY);
	if (typeof storedKey === "string" && parseWordPressConnectionKey(storedKey)) return storedKey;

	// Migrate connection keys saved by older plugin versions in the Figma document.
	const legacyKey = figma.root.getPluginData(PRESET_API_KEY_STORAGE_KEY);
	if (!legacyKey) return "";

	figma.root.setPluginData(PRESET_API_KEY_STORAGE_KEY, "");
	if (!parseWordPressConnectionKey(legacyKey)) return "";

	await figma.clientStorage.setAsync(PRESET_API_KEY_STORAGE_KEY, legacyKey);
	return legacyKey;
}

async function getWordPressConnection() {
	const connectionKey = await getStoredConnectionKey();
	if (!connectionKey) return null;

	return parseWordPressConnectionKey(connectionKey);
}

async function handleWordPressRequest(msg: {
	requestId: string;
	url: string;
	method: "GET" | "POST" | "PUT";
	body?: string;
}) {
	try {
		const connection = await getWordPressConnection();
		const target = parseHttpUrl(msg.url);
		const route = extractRestRoute(msg.url);

		if (
			!connection ||
			!target ||
			target.origin !== connection.siteUrl ||
			!route ||
			!ALLOWED_REST_ROUTES.has(route) ||
			!["GET", "POST", "PUT"].includes(msg.method)
		) {
			throw new Error("Blocked WordPress request");
		}

		const result = await fetchWordPressRest(connection.siteUrl, route, {
			method: msg.method,
			connectionKey: connection.connectionKey,
			body: msg.body,
		});

		figma.ui.postMessage({
			type: "wordpress-response",
			requestId: msg.requestId,
			ok: result.ok,
			status: result.status,
			data: result.data,
		});
	} catch (error) {
		figma.ui.postMessage({
			type: "wordpress-response",
			requestId: msg.requestId,
			ok: false,
			status: 500,
			error: error instanceof Error ? error.message : "WordPress request failed",
		});
	}
}

const CORE_FRAMEWORK_COLLECTION_NAME = "Core Framework";

figma.showUI(__html__, {
	width: 700,
	height: 650,
});

figma.ui.onmessage = async (msg) => {
	switch (msg.type) {
		case "get-project-id": {
			const projectId = await getStoredConnectionKey();
			figma.ui.postMessage({ type: "get-project-id", projectId });
			break;
		}
		case "delete-project-id": {
			await figma.clientStorage.deleteAsync(PRESET_API_KEY_STORAGE_KEY);
			figma.root.setPluginData(PRESET_API_KEY_STORAGE_KEY, "");
			break;
		}
		case "close-plugin": {
			figma.closePlugin();
			break;
		}
		case "wordpress-request": {
			await handleWordPressRequest(msg);
			break;
		}
		case "save-project-locally":
		case "add-variables": {
			const isLocalSave = msg.type === "save-project-locally";
			try {
				const variables = msg?.variables as SimpleVariable[];
				const currentVarNames = variables.map((variable) => variable.variable);
				if (isLocalSave) saveLocalProject(figma.root, msg.payload?.preset);
				const localCollections = [...(await figma.variables.getLocalVariableCollectionsAsync())];
				const allLocalVariables = await figma.variables.getLocalVariablesAsync();

				let coreFrameworkVariableCollection = localCollections.find(
					(collection) => collection.name === CORE_FRAMEWORK_COLLECTION_NAME,
				);

				if (!coreFrameworkVariableCollection) {
					coreFrameworkVariableCollection = figma.variables.createVariableCollection(
						CORE_FRAMEWORK_COLLECTION_NAME,
					);
				}

				const defaultModeId = coreFrameworkVariableCollection.modes[0].modeId;
				const localVariables = allLocalVariables.filter(
					(variable) => variable.variableCollectionId === coreFrameworkVariableCollection.id,
				);

				for (const { variable, value, type, webSyntax } of variables) {
					try {
						let variableNode = localVariables.find((v) => v?.name === variable);

						if (variableNode && variableNode.resolvedType !== type) {
							variableNode.remove();
							variableNode = figma.variables.createVariable(variable, coreFrameworkVariableCollection, type);
						}

						if (!variableNode) {
							variableNode = figma.variables.createVariable(variable, coreFrameworkVariableCollection, type);
						}
						variableNode.setValueForMode(defaultModeId, value);

						if (webSyntax) {
							variableNode.setVariableCodeSyntax("WEB", webSyntax);
						}
					} catch (e) {
						console.warn("Failed to set variable");
						console.warn({ variable, value, type, webSyntax });
						console.error(e);
						if (isLocalSave)
							throw new Error(`Project saved, but failed to update Figma variable "${variable}".`);
					}
				}

				localVariables.forEach((variableNode) => {
					currentVarNames.includes(variableNode.name) || variableNode.remove();
				});

				figma.ui.postMessage(
					isLocalSave
						? { type: "save-project-locally-response", requestId: msg.requestId, success: true }
						: { type: "added-variables" },
				);
			} catch (e) {
				console.warn("Failed to add variables");
				console.warn(e);
				if (isLocalSave) {
					figma.ui.postMessage({
						type: "save-project-locally-response",
						requestId: msg.requestId,
						success: false,
						error: e instanceof Error ? e.message : "Failed to save the local Figma project",
					});
				}
			}

			break;
		}
		case "import-project-from-plugin-api": {
			try {
				const { apiKey } = msg;
				const resJson = await fetchPreset(apiKey);

				if (resJson?.success && resJson?.data) {
					figma.ui.postMessage({ type: "import-project", preset: resJson?.data, projectId: apiKey });
					await figma.clientStorage.setAsync(PRESET_API_KEY_STORAGE_KEY, apiKey);
					return;
				}

				figma.ui.postMessage({ type: "import-project-error", error: "Failed to import project" });
			} catch (e) {
				console.error(e);
				figma.ui.postMessage({
					type: "import-project-error",
					error: e instanceof Error ? e.message : "Failed to import project",
				});
			}
			break;
		}
		case "get-project-locally": {
			let preset = null;
			try {
				preset = readLocalProject(figma.root);
			} catch (error) {
				console.warn("Failed to read the local Core Framework project", error);
				figma.ui.postMessage({
					type: "get-project-locally",
					preset: null,
					error:
						"Could not read the saved local project. Try reopening the plugin before starting a new project.",
				});
				break;
			}
			figma.ui.postMessage({ type: "get-project-locally", preset });
			break;
		}
	}
};
