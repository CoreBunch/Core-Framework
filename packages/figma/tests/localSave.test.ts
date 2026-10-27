import { afterAll, beforeAll, beforeEach, expect, mock, test } from "bun:test";
import { readLocalProject } from "../main/localProjectStorage";
import { createPluginDataStore } from "./helpers/pluginDataStore";

const globals = globalThis as unknown as { figma: PluginAPI; __html__: string };
const originalFigma = globals.figma;
const originalHtml = globals.__html__;
let handleMessage: (message: unknown) => Promise<void>;
let store: ReturnType<typeof createPluginDataStore>;
let replies: any[];
let nodes: any[];
let variableReads: ReturnType<typeof mock>;
const collection = { id: "cf-collection", name: "Core Framework", modes: [{ modeId: "default" }] };

function variable(name: string, collectionId = collection.id, type = "FLOAT") {
	return {
		name,
		variableCollectionId: collectionId,
		resolvedType: type,
		remove: mock(() => {}),
		setValueForMode: mock(() => {}),
		setVariableCodeSyntax: mock(() => {}),
	};
}

beforeAll(async () => {
	globals.__html__ = "";
	globals.figma = { showUI() {}, ui: {} } as unknown as PluginAPI;
	await import("../main/code");
	handleMessage = globals.figma.ui.onmessage as typeof handleMessage;
});

beforeEach(() => {
	store = createPluginDataStore();
	replies = [];
	nodes = [];
	variableReads = mock(async () => nodes);
	globals.figma = {
		root: store,
		ui: { postMessage: (message: unknown) => replies.push(message) },
		variables: {
			getLocalVariableCollectionsAsync: async () => [collection],
			getLocalVariablesAsync: variableReads,
			createVariable: (name: string, target: typeof collection, type: string) => {
				const node = variable(name, target.id, type);
				nodes.push(node);
				return node;
			},
		},
	} as unknown as PluginAPI;
});

afterAll(() => {
	globals.figma = originalFigma;
	globals.__html__ = originalHtml;
});

const preset = { id: "saved", data: "x".repeat(150_000) };
function saveMessage() {
	return {
		type: "save-project-locally",
		requestId: "save-1",
		payload: { preset },
		variables: [{ variable: "size/s", value: 24, type: "FLOAT", webSyntax: "var(--size-s)" }],
	};
}

test("acknowledges a persisted local project after updating its variables and restores it on reopen", async () => {
	await handleMessage(saveMessage());
	expect(readLocalProject(store)).toEqual(preset);
	expect(nodes[0].setValueForMode).toHaveBeenCalledWith("default", 24);
	expect(nodes[0].setVariableCodeSyntax).toHaveBeenCalledWith("WEB", "var(--size-s)");
	expect(replies).toEqual([{ type: "save-project-locally-response", requestId: "save-1", success: true }]);
	await handleMessage({ type: "get-project-locally" });
	expect(replies.at(-1)).toEqual({ type: "get-project-locally", preset });
});

test("a storage failure reports failure and does not change any variables", async () => {
	store.failWritesWhen(() => true);
	await handleMessage(saveMessage());
	expect(variableReads).not.toHaveBeenCalled();
	expect(replies).toEqual([expect.objectContaining({ requestId: "save-1", success: false })]);
});

test("unreadable saved projects report a load error instead of looking like a new file", async () => {
	store.entries.set("cf_plugin_project_local", "invalid json");
	await handleMessage({ type: "get-project-locally" });
	expect(replies).toEqual([
		expect.objectContaining({
			type: "get-project-locally",
			preset: null,
			error: expect.stringContaining("Could not read"),
		}),
	]);
});

test("a variable failure reports failure instead of a false successful save", async () => {
	const node = variable("size/s");
	node.setValueForMode.mockImplementation(() => {
		throw new Error("Figma write failed");
	});
	nodes.push(node);
	await handleMessage(saveMessage());
	expect(replies).toEqual([expect.objectContaining({ requestId: "save-1", success: false })]);
});

for (const type of ["save-project-locally", "add-variables"]) {
	test(`${type} only updates and deletes variables in the Core Framework collection`, async () => {
		const sameNameElsewhere = variable("size/s", "other-collection");
		const unrelated = variable("brand/custom", "other-collection");
		const current = variable("size/s");
		const obsolete = variable("size/obsolete");
		nodes.push(sameNameElsewhere, unrelated, current, obsolete);
		await handleMessage({ ...saveMessage(), type });
		expect(current.setValueForMode).toHaveBeenCalledWith("default", 24);
		expect(obsolete.remove).toHaveBeenCalledTimes(1);
		for (const node of [sameNameElsewhere, unrelated]) {
			expect(node.setValueForMode).not.toHaveBeenCalled();
			expect(node.remove).not.toHaveBeenCalled();
		}
		if (type === "add-variables") {
			expect(replies).toEqual([{ type: "added-variables" }]);
			expect(readLocalProject(store)).toBeNull();
		}
	});
}
