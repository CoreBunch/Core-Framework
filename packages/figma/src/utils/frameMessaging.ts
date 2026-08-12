export const postMessageToIframe = (type: string, payload: Record<string, unknown>) => {
	const iframe = document.getElementById("web-app") as HTMLIFrameElement | null;
	iframe?.contentWindow?.postMessage({ type, ...payload }, "*");
};

export const postMessageToParent = (message: Record<string, unknown>) => {
	parent.postMessage({ pluginMessage: message }, "*");
};
