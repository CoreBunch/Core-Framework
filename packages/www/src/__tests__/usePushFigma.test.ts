import { createStore } from "jotai";
import { syncCSSWithFigma, updatePresetWithFigma } from "functions/wpdb-proxy";
import { usePushFigma } from "hooks/usePushFigma";
import { toast } from "sonner";
import { figmaAtom } from "state/figmaAtom";
import { renderHook } from "./renderHook";

// Saving from the Figma plugin to a connected WordPress site. The save button
// shows a spinner until setIsLoading(false); if the builder sync threw, or
// either WordPress write came back falsy, the spinner stuck or the save ended
// with no feedback at all.

const handleFigmaPushSync = jest.fn();

jest.mock("functions/wpdb-proxy", () => ({
	syncCSSWithFigma: jest.fn(),
	updatePresetWithFigma: jest.fn(),
}));

jest.mock("hooks/usePushFigmaSync", () => ({
	usePushFigmaSync: () => ({ handleFigmaPushSync }),
}));

jest.mock("sonner", () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedSyncCss = syncCSSWithFigma as jest.MockedFunction<typeof syncCSSWithFigma>;
const mockedUpdatePreset = updatePresetWithFigma as jest.MockedFunction<typeof updatePresetWithFigma>;

function renderPushFigma() {
	const store = createStore();
	store.set(figmaAtom, { apiKey: `${"p".repeat(24)}${encodeURIComponent("https://example.test")}` });
	return renderHook(() => usePushFigma(), store);
}

function push(handleFigmaPush: ReturnType<typeof usePushFigma>["handleFigmaPush"]) {
	const setIsLoading = jest.fn();
	const done = handleFigmaPush({
		newPresetData: { id: "preset" } as unknown as Preset,
		setIsLoading,
		cssString: ":root{}",
		colorVariables: [],
	});
	return { setIsLoading, done };
}

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	jest.restoreAllMocks();
});

test("reports success and clears loading when every write succeeds", async () => {
	mockedSyncCss.mockResolvedValue(true);
	mockedUpdatePreset.mockResolvedValue(true);
	handleFigmaPushSync.mockResolvedValue(undefined);

	const { result, unmount } = renderPushFigma();
	const { setIsLoading, done } = push(result.current.handleFigmaPush);
	await done;

	expect(handleFigmaPushSync).toHaveBeenCalledTimes(1);
	expect(toast.success).toHaveBeenCalledWith("Synced successfully");
	expect(toast.error).not.toHaveBeenCalled();
	expect(setIsLoading).toHaveBeenLastCalledWith(false);
	unmount();
});

test("clears loading and reports an error when the builder sync throws", async () => {
	mockedSyncCss.mockResolvedValue(true);
	mockedUpdatePreset.mockResolvedValue(true);
	handleFigmaPushSync.mockRejectedValue(new Error("builder sync failed"));

	const { result, unmount } = renderPushFigma();
	const { setIsLoading, done } = push(result.current.handleFigmaPush);
	await expect(done).resolves.toBeUndefined();

	expect(setIsLoading).toHaveBeenLastCalledWith(false);
	expect(toast.error).toHaveBeenCalled();
	expect(toast.success).not.toHaveBeenCalled();
	unmount();
});

test("clears loading and reports an error when a WordPress write throws", async () => {
	mockedSyncCss.mockRejectedValue(new Error("network"));
	mockedUpdatePreset.mockResolvedValue(true);

	const { result, unmount } = renderPushFigma();
	const { setIsLoading, done } = push(result.current.handleFigmaPush);
	await expect(done).resolves.toBeUndefined();

	expect(setIsLoading).toHaveBeenLastCalledWith(false);
	expect(toast.error).toHaveBeenCalled();
	expect(handleFigmaPushSync).not.toHaveBeenCalled();
	unmount();
});

test.each([
	["stylesheet", false, true],
	["project", true, false],
])("reports an error when the %s write returns a falsy result", async (_name, cssOk, presetOk) => {
	mockedSyncCss.mockResolvedValue(cssOk);
	mockedUpdatePreset.mockResolvedValue(presetOk);

	const { result, unmount } = renderPushFigma();
	const { setIsLoading, done } = push(result.current.handleFigmaPush);
	await done;

	expect(setIsLoading).toHaveBeenLastCalledWith(false);
	expect(toast.error).toHaveBeenCalled();
	expect(toast.success).not.toHaveBeenCalled();
	expect(handleFigmaPushSync).not.toHaveBeenCalled();
	unmount();
});
