import { SimpleVariable } from "../src/types";
import { parseHttpUrl, parseWordPressConnectionKey } from "./wordpressConnection";

const PRESET_API_KEY_STORAGE_KEY = "cf_plugin_project_api_key";
const PRESET_LOCAL_STORAGE_KEY = "cf_plugin_project_local";

async function fetchPreset(connectionKey: string) {
	const connection = parseWordPressConnectionKey(connectionKey);
	if (!connection) throw new Error("Invalid WordPress connection key");

	const endpoint = `${connection.siteUrl}/wp-json/core-framework/v2/preset`;
	const response = await fetch(endpoint, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"X-Core-Framework-Key": connectionKey,
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

		if (
			!connection ||
			!target ||
			target.origin !== connection.siteUrl ||
			!ALLOWED_WORDPRESS_PATHS.has(target.pathname) ||
			!["GET", "POST", "PUT"].includes(msg.method)
		) {
			throw new Error("Blocked WordPress request");
		}

		const response = await fetch(target.href, {
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
		case "save-project-locally": {
			const preset = msg.payload?.preset;
			if (preset) {
				figma.root.setPluginData(PRESET_LOCAL_STORAGE_KEY, JSON.stringify(preset));
			}
			break;
		}
		case "get-project-locally": {
			const serializedPreset = figma.root.getPluginData(PRESET_LOCAL_STORAGE_KEY);
			let preset = null;
			if (serializedPreset) {
				try {
					preset = JSON.parse(serializedPreset);
				} catch (error) {
					console.warn("Failed to read the local Core Framework project", error);
				}
			}
			figma.ui.postMessage({ type: "get-project-locally", preset });
			break;
		}
	}
};
