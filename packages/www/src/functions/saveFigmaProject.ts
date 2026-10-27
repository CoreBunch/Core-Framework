import type { ColorVariable } from "components/modules/colorSystem/types";

export function saveFigmaProject(payload: {
	preset: Preset;
	colorVariables: ColorVariable[];
}): Promise<void> {
	const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	return new Promise((resolve, reject) => {
		const cleanup = () => {
			window.clearTimeout(timeout);
			window.removeEventListener("message", handleResponse);
		};
		const timeout = window.setTimeout(() => {
			cleanup();
			reject(new Error("Figma did not confirm the save. Please try again."));
		}, 15_000);
		function handleResponse(event: MessageEvent) {
			if (
				event.source !== window.parent ||
				event.data?.type !== "cf-figma-local-save-response" ||
				event.data.requestId !== requestId
			)
				return;
			cleanup();
			if (event.data.success === true) resolve();
			else reject(new Error(event.data.error || "Failed to save the local Figma project."));
		}
		window.addEventListener("message", handleResponse);
		try {
			window.parent.postMessage({ type: "cf-push-local", requestId, payload }, "*");
		} catch (error) {
			cleanup();
			reject(error);
		}
	});
}
