export const postMessageToIframe = (type: string, payload: Record<string, unknown>) => {
	const iframe = document.getElementById("web-app") as HTMLIFrameElement | null;
	iframe?.contentWindow?.postMessage({ ...payload, type }, "*");
};

export const isMessageFromEditor = (event: MessageEvent) => {
	const iframe = document.getElementById("web-app") as HTMLIFrameElement | null;
	return Boolean(iframe?.contentWindow && event.source === iframe.contentWindow);
};

export const getPluginMessage = <T extends Record<string, unknown>>(event: MessageEvent): T | null => {
	const pluginMessage = event.data?.pluginMessage;

	return pluginMessage && typeof pluginMessage === "object" ? (pluginMessage as T) : null;
};

export const postMessageToParent = (message: Record<string, unknown>) => {
	parent.postMessage({ pluginMessage: message }, "*");
};
