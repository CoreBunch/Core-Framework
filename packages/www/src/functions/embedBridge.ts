// Messages exchanged with the page that embeds the editor in an iframe
// (coreframework.com/app). The host's side lives in the private website repo,
// so these names are a contract: renaming one breaks the hosted editor.
//
// Host -> editor: cf-embed-load-preset, cf-embed-load-preset-default,
//                 cf-push-response, cf-read-clipboard (reply carrying `text`)
// Editor -> host: cf-ready, cf-push, cf-copy-to-clipboard, cf-read-clipboard (request)

export const EMBED_PUSH_RESPONSE = "cf-push-response";
export const EMBED_READ_CLIPBOARD = "cf-read-clipboard";

const PUSH_RESPONSE_TIMEOUT = 30_000;

/**
 * Resolves with the data of the first message of `type`, ignoring any other
 * message that reaches the window first, or with `null` after `timeout` ms.
 */
export function waitForEmbedMessage<T = Record<string, unknown>>(
	type: string,
	{ target = window, timeout }: { target?: Window; timeout?: number } = {},
): Promise<T | null> {
	return new Promise((resolve) => {
		let timer: ReturnType<typeof setTimeout> | undefined;

		function onMessage(event: MessageEvent) {
			if (event.data?.type !== type) {
				return;
			}

			finish(event.data as T);
		}

		function finish(data: T | null) {
			target.removeEventListener("message", onMessage);
			clearTimeout(timer);
			resolve(data);
		}

		target.addEventListener("message", onMessage);

		if (timeout !== undefined) {
			timer = setTimeout(() => finish(null), timeout);
		}
	});
}

/** Whether the host saved the pushed project. A host that never answers counts as a failure. */
export async function waitForEmbedPushResponse(target: Window = window): Promise<boolean> {
	const data = await waitForEmbedMessage<{ success?: boolean }>(EMBED_PUSH_RESPONSE, {
		target,
		timeout: PUSH_RESPONSE_TIMEOUT,
	});

	return Boolean(data?.success);
}

/** Wraps a save so it does nothing while the host has opened the project read-only. */
export const skipWhenViewOnly =
	<T extends (...args: any[]) => Promise<any>>(isViewOnly: () => boolean, fn: T) =>
	async (...args: Parameters<T>) => {
		if (isViewOnly()) {
			return;
		}

		return fn(...args);
	};
