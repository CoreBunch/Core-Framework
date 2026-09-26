import {
	EMBED_PUSH_RESPONSE,
	EMBED_READ_CLIPBOARD,
	skipWhenViewOnly,
	waitForEmbedMessage,
	waitForEmbedPushResponse,
} from "functions/embedBridge";

// The hosted editor at coreframework.com/app runs this app in an iframe. After
// a save the editor waits for the host's `cf-push-response`. It used to wait
// with a one-shot listener, so any other message reaching the window first
// used it up and the host's answer was ignored: no "Saved successfully", no
// error. View-only mode removed the save buttons from the DOM before they had
// rendered, so a read-only project could still be saved.

function post(data: unknown) {
	window.dispatchEvent(new MessageEvent("message", { data }));
}

afterEach(() => {
	jest.useRealTimers();
});

describe("waitForEmbedPushResponse", () => {
	it("still receives the host's reply when another message arrives first", async () => {
		const response = waitForEmbedPushResponse();

		post({ source: "react-devtools-content-script" });
		post({ type: "cf-embed-load-preset-default" });
		post({ type: EMBED_PUSH_RESPONSE, success: true });

		await expect(response).resolves.toBe(true);
	});

	it("reports a save the host rejected", async () => {
		const response = waitForEmbedPushResponse();

		post({ type: EMBED_PUSH_RESPONSE, success: false });

		await expect(response).resolves.toBe(false);
	});

	it("reports a failure when the host never answers", async () => {
		jest.useFakeTimers();
		const response = waitForEmbedPushResponse();

		jest.advanceTimersByTime(30_000);

		await expect(response).resolves.toBe(false);
	});

	it("stops listening once the reply arrives", async () => {
		const removeSpy = jest.spyOn(window, "removeEventListener");
		const response = waitForEmbedPushResponse();

		post({ type: EMBED_PUSH_RESPONSE, success: true });
		await response;

		expect(removeSpy).toHaveBeenCalledWith("message", expect.any(Function));
		removeSpy.mockRestore();
	});
});

describe("waitForEmbedMessage", () => {
	it("returns the clipboard text the host sends back", async () => {
		const reply = waitForEmbedMessage<{ text: string }>(EMBED_READ_CLIPBOARD);

		post({ type: "something-else", text: "wrong" });
		post({ type: EMBED_READ_CLIPBOARD, text: "--primary: red;" });

		await expect(reply).resolves.toEqual({ type: EMBED_READ_CLIPBOARD, text: "--primary: red;" });
	});
});

describe("skipWhenViewOnly", () => {
	it("does not save a project opened read-only", async () => {
		const save = jest.fn(async () => {});

		await skipWhenViewOnly(() => true, save)();

		expect(save).not.toHaveBeenCalled();
	});

	it("saves an editable project", async () => {
		const save = jest.fn(async () => {});

		await skipWhenViewOnly(() => false, save)();

		expect(save).toHaveBeenCalledTimes(1);
	});
});
