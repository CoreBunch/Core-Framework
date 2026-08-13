import { describe, expect, test } from "bun:test";
import { getPluginMessage } from "../src/utils/frameMessaging";

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
