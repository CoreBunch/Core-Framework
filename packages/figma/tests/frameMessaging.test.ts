import { describe, expect, test } from "bun:test";
import { getPluginMessage, isMessageFromEditor, postMessageToIframe } from "../src/utils/frameMessaging";

describe("getPluginMessage", () => {
	test("accepts Figma host messages when event.source is null", () => {
		const pluginMessage = { type: "import-project", projectId: "connection-key" };
		const event = {
			data: { pluginMessage },
			source: null,
		} as unknown as MessageEvent;

		expect(getPluginMessage(event)).toEqual(pluginMessage);
	});

	test("accepts Figma host messages without assuming the parent source", () => {
		const pluginMessage = { type: "import-project-error", error: "Failed to fetch preset" };
		const event = {
			data: { pluginMessage },
			source: {} as MessageEventSource,
		} as MessageEvent;

		expect(getPluginMessage(event)).toEqual(pluginMessage);
	});

	test("rejects raw editor and malformed messages", () => {
		expect(getPluginMessage({ data: { type: "cf-figma-ready" } } as MessageEvent)).toBeNull();
		expect(getPluginMessage({ data: { pluginMessage: "invalid" } } as MessageEvent)).toBeNull();
	});
});

test("keeps response routing types when forwarding host payloads (#30)", () => {
	const originalDocument = globalThis.document;
	const messages: unknown[] = [];
	const contentWindow = { postMessage: (message: unknown) => messages.push(message) };
	globalThis.document = { getElementById: () => ({ contentWindow }) } as unknown as Document;
	try {
		for (const [hostType, editorType] of [
			["wordpress-response", "cf-figma-wordpress-response"],
			["save-project-locally-response", "cf-figma-local-save-response"],
		]) {
			const payload = { type: hostType, requestId: "reply", success: true };
			const message = getPluginMessage({ data: { pluginMessage: payload }, source: null } as MessageEvent)!;
			postMessageToIframe(editorType, message);
			expect(messages.at(-1)).toEqual({ ...payload, type: editorType });
		}
		expect(isMessageFromEditor({ source: contentWindow } as unknown as MessageEvent)).toBe(true);
		expect(isMessageFromEditor({ source: null } as MessageEvent)).toBe(false);
	} finally {
		globalThis.document = originalDocument;
	}
});
