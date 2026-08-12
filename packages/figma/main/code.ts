import { SimpleVariable } from "../src/types";

const G_CLOUD_FUNCTION_BASE = "https://us-central1-core-framework-6bdc9.cloudfunctions.net";
const WEB_SYNC_PREFIX = "cfweb:";

const PRESET_API_KEY_STORAGE_KEY = "cf_plugin_project_api_key";
const PRESET_LOCAL_STORAGE_KEY = "cf_plugin_project_local";

async function fetchPreset(url: string, apiKey: string) {
	const endpoint = new URL("/wp-json/core-framework/v2/preset", new URL(url).origin);
	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"X-Core-Framework-Key": apiKey,
		},
	});

	if (response?.status !== 200) {
		throw new Error("Failed to fetch preset");
	}

	return await response.json();
}

const ALLOWED_WORDPRESS_PATHS = new Set([
	"/wp-json/core-framework/v2/preset",
	"/wp-json/core-framework/v2/preset-css",
	"/wp-json/core-framework/v2/figma/update-colors",
	"/wp-json/core-framework/v2/figma/update-classes",
	"/wp-json/core-framework/v2/figma/update-grouped-classes",
	"/wp-json/core-framework/v2/figma/update-prefixed-css-file",
	"/wp-json/core-framework/v2/figma/save-oxygen-css-helper",
]);

function getWordPressConnection() {
	const connectionKey = figma.root.getPluginData(PRESET_API_KEY_STORAGE_KEY);
	if (!connectionKey || connectionKey.startsWith(WEB_SYNC_PREFIX) || connectionKey.length === 26) return null;

	const siteUrl = decodeURIComponent(connectionKey.slice(24));
	return { connectionKey, siteUrl };
}

async function handleWordPressRequest(msg: {
	requestId: string;
	url: string;
	method: "GET" | "POST" | "PUT";
	body?: string;
}) {
	try {
		const connection = getWordPressConnection();
		const target = new URL(msg.url);
		const connectedSite = connection ? new URL(connection.siteUrl) : null;

		if (
			!connection ||
			!connectedSite ||
			target.origin !== connectedSite.origin ||
			!ALLOWED_WORDPRESS_PATHS.has(target.pathname) ||
			!["GET", "POST", "PUT"].includes(msg.method)
		) {
			throw new Error("Blocked WordPress request");
		}

		const response = await fetch(target.toString(), {
			method: msg.method,
			headers: {
				"Content-Type": "application/json",
				"X-Core-Framework-Key": connection.connectionKey,
			},
			body: msg.body,
		});
		const data = await response.json();

		figma.ui.postMessage({
			type: "wordpress-response",
			requestId: msg.requestId,
			ok: response.ok,
			status: response.status,
			data,
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
		case "import-project": {
			const { apiKey } = msg;
			await importProject(apiKey);
			break;
		}
		case "get-project-id": {
			const projectId = figma.root.getPluginData(PRESET_API_KEY_STORAGE_KEY);
			figma.ui.postMessage({ type: "get-project-id", projectId });
			break;
		}
		case "delete-project-id": {
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
		case "add-variables": {
			try {
				const variables = msg?.variables as SimpleVariable[];
				const currentVarNames = variables.map((variable) => variable.variable);
				const localCollections = [...(await figma.variables.getLocalVariableCollectionsAsync())];
				const localVariables = await figma.variables.getLocalVariablesAsync();

				let coreFrameworkVariableCollection = localCollections.find(
					(collection) => collection.name === CORE_FRAMEWORK_COLLECTION_NAME,
				);

				if (!coreFrameworkVariableCollection) {
					coreFrameworkVariableCollection = figma.variables.createVariableCollection(
						CORE_FRAMEWORK_COLLECTION_NAME,
					);
				}

				const defaultModeId = coreFrameworkVariableCollection.modes[0].modeId;

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
					}
				}

				localVariables.forEach((variableNode) => {
					currentVarNames.includes(variableNode.name) || variableNode.remove();
				});

				figma.ui.postMessage({
					type: "added-variables",
				});
			} catch (e) {
				console.warn("Failed to add variables");
				console.warn(e);
			}

			break;
		}
		case "import-project-from-plugin-api": {
			try {
				const { apiKey, url } = msg;
				const resJson = await fetchPreset(url, apiKey);

				if (resJson?.success && resJson?.data) {
					figma.ui.postMessage({ type: "import-project", preset: resJson?.data });
					figma.root.setPluginData(PRESET_API_KEY_STORAGE_KEY, apiKey);
					return;
				}

				figma.ui.postMessage({ type: "import-project-error", error: "Failed to import project" });
			} catch (e) {
				console.error(e);
				figma.ui.postMessage({ type: "import-project-error", error: e });
			}
			break;
		}
		case "save-project-locally": {
			const { payload: preset } = msg;
			figma.root.setPluginData(PRESET_LOCAL_STORAGE_KEY, JSON.stringify(preset));
			break;
		}
		case "get-project-locally": {
			const preset = figma.root.getPluginData(PRESET_LOCAL_STORAGE_KEY);
			figma.ui.postMessage({ type: "get-project-locally", preset: JSON.parse(preset) });
			break;
		}
	}
};

function parseWebSyncKey(connectionKey: string) {
	if (!connectionKey.startsWith(WEB_SYNC_PREFIX)) return null;

	const [, presetId, token] = connectionKey.split(":");
	if (!presetId || !token) return null;

	return { presetId, token };
}

async function importProject(connectionKey: string) {
	try {
		const webSync = parseWebSyncKey(connectionKey);
		const endpoint = webSync
			? `${G_CLOUD_FUNCTION_BASE}/figmaPreset?presetId=${webSync.presetId}`
			: `${G_CLOUD_FUNCTION_BASE}/getPreset?id=${connectionKey}`;
		const response = await fetch(endpoint, {
			method: "GET",
			headers: webSync ? { Authorization: `Bearer ${webSync.token}` } : undefined,
		});

		const json = await response.json();

		if (!json?.success) {
			figma.ui.postMessage({ type: "import-project-error", error: json?.error });
			return;
		}

		const data = webSync ? json.preset : json.data;
		const preset = JSON.parse(data.json);

		figma.ui.postMessage({ type: "import-project", preset });
		figma.root.setPluginData(PRESET_API_KEY_STORAGE_KEY, connectionKey);
	} catch (e) {
		console.error(e);
		figma.ui.postMessage({ type: "import-project-error", error: e });
	}
}
