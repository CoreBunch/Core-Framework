export const postMessageToIframe = (type: string, payload: Record<string, unknown>) => {
	const iframe = document.getElementById("web-app") as HTMLIFrameElement | null;
	iframe?.contentWindow?.postMessage({ type, ...payload }, "*");
};

export const isMessageFromEditor = (event: MessageEvent) => {
	const iframe = document.getElementById("web-app") as HTMLIFrameElement | null;
	return Boolean(iframe?.contentWindow && event.source === iframe.contentWindow);
};

export const postMessageToParent = (message: Record<string, unknown>) => {
	parent.postMessage({ pluginMessage: message }, "*");
};
