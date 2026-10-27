import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { Provider, createStore } from "jotai";
import { saveFigmaProject } from "functions/saveFigmaProject";
import { syncCSSWithFigma, updatePresetWithFigma } from "functions/wpdb-proxy";
import { usePushFigma } from "hooks/usePushFigma";
import { toast } from "sonner";
import { figmaAtom } from "state/figmaAtom";

const mockBuilderSync = jest.fn();
jest.mock("functions/wpdb-proxy", () => ({ syncCSSWithFigma: jest.fn(), updatePresetWithFigma: jest.fn() }));
jest.mock("hooks/usePushFigmaSync", () => ({
	usePushFigmaSync: () => ({ handleFigmaPushSync: mockBuilderSync }),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const preset = { id: "local" } as Preset;
const payload = { preset, colorVariables: [] };
let post: jest.SpyInstance;
const unmounts: (() => void)[] = [];

function renderPush(apiKey = "") {
	const store = createStore();
	store.set(figmaAtom, { apiKey });
	let hook: ReturnType<typeof usePushFigma>;
	function Probe() {
		hook = usePushFigma();
		return null;
	}
	const root = createRoot(document.createElement("div"));
	act(() => root.render(createElement(Provider, { store }, createElement(Probe))));
	unmounts.push(() => act(() => root.unmount()));
	const setIsLoading = jest.fn();
	return {
		setIsLoading,
		done: hook!.handleFigmaPush({
			newPresetData: preset,
			colorVariables: [],
			cssString: ":root{}",
			setIsLoading,
		}),
	};
}

function reply(data: Record<string, unknown>, source: MessageEventSource | null = window.parent) {
	window.dispatchEvent(new MessageEvent("message", { source, data }));
}

function successReply() {
	return { type: "cf-figma-local-save-response", requestId: post.mock.calls[0][0].requestId, success: true };
}

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers();
	post = jest.spyOn(window.parent, "postMessage").mockImplementation(() => {});
});
afterEach(() => {
	for (const unmount of unmounts.splice(0)) unmount();
	jest.restoreAllMocks();
	jest.useRealTimers();
});

test("local save waits for its own confirmed response, ignoring unrelated messages", async () => {
	const { done, setIsLoading } = renderPush();
	expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: "cf-push-local", payload }), "*");
	jest.advanceTimersByTime(200);
	const response = successReply();
	reply({ ...response, type: "cf-figma-wordpress-response" });
	reply({ ...response, requestId: "another-save" });
	reply(response, null);
	await Promise.resolve();
	expect(toast.success).not.toHaveBeenCalled();
	expect(setIsLoading).not.toHaveBeenCalled();
	reply(response);
	await done;
	expect(toast.success).toHaveBeenCalledWith("Synced successfully");
	expect(setIsLoading).toHaveBeenCalledWith(false);
	expect(jest.getTimerCount()).toBe(0);
	expect(syncCSSWithFigma).not.toHaveBeenCalled();
});

test("failed persistence stops loading and reports the failure without success", async () => {
	const { done, setIsLoading } = renderPush();
	reply({ ...successReply(), success: false, error: "Could not store the project" });
	await done;
	expect(toast.error).toHaveBeenCalledWith("Could not store the project");
	expect(toast.success).not.toHaveBeenCalled();
	expect(setIsLoading).toHaveBeenCalledWith(false);
	expect(jest.getTimerCount()).toBe(0);
});

test("missing confirmation times out and a late reply cannot report success", async () => {
	const { done, setIsLoading } = renderPush();
	jest.advanceTimersByTime(15_000);
	await done;
	reply(successReply());
	expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("did not confirm"));
	expect(toast.success).not.toHaveBeenCalled();
	expect(setIsLoading).toHaveBeenCalledWith(false);
	expect(jest.getTimerCount()).toBe(0);
});

test("registers the response listener before sending and cleans it up after success", async () => {
	const remove = jest.spyOn(window, "removeEventListener");
	post.mockImplementation((message) =>
		reply({ type: "cf-figma-local-save-response", requestId: message.requestId, success: true }),
	);
	await expect(saveFigmaProject(payload)).resolves.toBeUndefined();
	expect(remove).toHaveBeenCalledWith("message", expect.any(Function));
	expect(jest.getTimerCount()).toBe(0);
});

test("cleans up and reports an error when the save cannot be sent", async () => {
	post.mockImplementation(() => {
		throw new Error("Cannot post message");
	});
	const { done, setIsLoading } = renderPush();
	await done;
	expect(toast.error).toHaveBeenCalledWith("Cannot post message");
	expect(setIsLoading).toHaveBeenCalledWith(false);
	expect(jest.getTimerCount()).toBe(0);
});

test("WordPress saves still wait for both writes before syncing the saved preset (#30)", async () => {
	let finishCss!: (value: boolean) => void;
	let finishPreset!: (value: boolean) => void;
	(syncCSSWithFigma as jest.Mock).mockImplementation(
		() =>
			new Promise((resolve) => {
				finishCss = resolve;
			}),
	);
	(updatePresetWithFigma as jest.Mock).mockImplementation(
		() =>
			new Promise((resolve) => {
				finishPreset = resolve;
			}),
	);
	const { done, setIsLoading } = renderPush(`${"p".repeat(24)}${encodeURIComponent("https://example.test")}`);
	expect(post).toHaveBeenCalledWith({ type: "cf-push", payload }, "*");
	expect(mockBuilderSync).not.toHaveBeenCalled();
	finishCss(true);
	await Promise.resolve();
	expect(mockBuilderSync).not.toHaveBeenCalled();
	finishPreset(true);
	await done;
	expect(mockBuilderSync).toHaveBeenCalledWith(expect.objectContaining({ preset }));
	expect(toast.success).toHaveBeenCalledTimes(1);
	expect(setIsLoading).toHaveBeenCalledWith(false);
	expect(jest.getTimerCount()).toBe(0);
});
