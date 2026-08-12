import { toast } from "sonner";
import { z } from "zod";
import { devLog } from "./devLog";

export interface WpApiProxyProps {
	readonly url: string;
	readonly apiKey: string;
}

interface WordPressResponse<T = unknown> {
	readonly ok: boolean;
	readonly status: number;
	readonly data?: T;
	readonly error?: string;
}

interface WordPressRequest {
	readonly url: string;
	readonly path: string;
	readonly method: "GET" | "POST" | "PUT";
	readonly body?: string;
}

function requestWordPress<T = unknown>({ url, path, method, body }: WordPressRequest) {
	const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const targetUrl = new URL(path, new URL(url).origin).toString();

	return new Promise<WordPressResponse<T>>((resolve, reject) => {
		const timeout = window.setTimeout(() => {
			window.removeEventListener("message", handleResponse);
			reject(new Error("WordPress request timed out"));
		}, 15_000);

		function handleResponse(event: MessageEvent) {
			if (event.data?.type !== "cf-figma-wordpress-response" || event.data?.requestId !== requestId) return;

			window.clearTimeout(timeout);
			window.removeEventListener("message", handleResponse);
			resolve({
				ok: Boolean(event.data.ok),
				status: Number(event.data.status),
				data: event.data.data as T,
				error: typeof event.data.error === "string" ? event.data.error : undefined,
			});
		}

		window.addEventListener("message", handleResponse);
		window.parent.postMessage(
			{
				type: "cf-figma-wordpress-request",
				requestId,
				url: targetUrl,
				method,
				body,
			},
			"*",
		);
	});
}

interface SyncCSSWithFigmaProps extends WpApiProxyProps {
	readonly cssString: string;
}

export async function syncCSSWithFigma({ cssString, url }: SyncCSSWithFigmaProps) {
	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/preset-css",
			method: "PUT",
			body: JSON.stringify({ css: cssString }),
		});
		return response.ok;
	} catch (error) {
		console.error(error);
		toast.error("Failed to sync css with Figma");
		return false;
	}
}

interface UpdatePresetWithFigmaProps extends WpApiProxyProps {
	readonly newPresetData: Preset;
}

export async function updatePresetWithFigma({ newPresetData, url }: UpdatePresetWithFigmaProps) {
	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/preset",
			method: "PUT",
			body: JSON.stringify({ preset: newPresetData }),
		});
		return response.ok;
	} catch (error) {
		console.error(error);
		toast.error("Failed to update project");
		return false;
	}
}

interface IUpdateColors extends WpApiProxyProps {
	readonly colors: { id: string; name: string; value: string; raw: string }[];
}

export async function updateColors({ colors, url }: IUpdateColors) {
	const errorMessage = "Failed to update colors in builder. [#03]";

	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/figma/update-colors",
			method: "POST",
			body: JSON.stringify({ colors }),
		});
		const parsed = z
			.object({ success: z.boolean(), active_builders: z.array(z.string()).or(z.null()) })
			.safeParse(response.data);

		devLog("IUpdateColors", parsed);

		if (!response.ok || !parsed.success) throw new Error(errorMessage);

		return { success: true, data: parsed.data };
	} catch (error) {
		console.warn(errorMessage, error);
		toast.error("Failed to update colors in targeted builder.");
		return { success: false, data: null };
	}
}

interface IUpdateClasses extends WpApiProxyProps {
	readonly classes: string;
}

export async function updateClasses({ classes, url }: IUpdateClasses) {
	const errorMessage = "Failed to update classes in builder. [#04]";

	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/figma/update-classes",
			method: "POST",
			body: JSON.stringify({ classes }),
		});
		const parsed = z
			.object({ success: z.boolean(), active_builders: z.array(z.string()).or(z.null()) })
			.safeParse(response.data);

		devLog("IUpdateClasses", parsed);

		if (!response.ok || !parsed.success) throw new Error(errorMessage);

		return { success: true, data: parsed.data };
	} catch (error) {
		console.warn(errorMessage, error);
		toast.error("Failed to update classes in targeted builder.");
		return { success: false, data: null };
	}
}

interface IUpdateGroupedClasses extends WpApiProxyProps {
	readonly groupedClassNames: Record<
		Exclude<StylesheetDataKeys, "stylesheetsStyles">,
		Record<string, string[]>
	>;
}

export async function updateGroupedClasses({ groupedClassNames, url }: IUpdateGroupedClasses) {
	const errorMessage = "Failed to update classes in builder. [#04]";

	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/figma/update-grouped-classes",
			method: "POST",
			body: JSON.stringify({ groupedClassNames }),
		});
		const parsed = z.object({ success: z.boolean() }).safeParse(response.data);

		devLog("IUpdateGroupedClasses", parsed);

		if (!response.ok || !parsed.success) throw new Error(errorMessage);

		return { success: true };
	} catch (error) {
		console.warn(errorMessage, error);
		toast.error("Failed to update classes in targeted builder.");
		return { success: false };
	}
}

interface IUpdatePrefixedCssFile extends WpApiProxyProps {
	readonly cssString: string;
}

export async function updatePrefixedCssFile({ cssString, url }: IUpdatePrefixedCssFile) {
	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/figma/update-prefixed-css-file",
			method: "POST",
			body: JSON.stringify({ cssString }),
		});
		const parsed = z.object({ success: z.boolean() }).safeParse(response.data);

		return { success: response.ok && parsed.success };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}

interface IHandleSavingOxygenHelperCssString extends WpApiProxyProps {
	readonly cssString: string;
}

export async function saveOxygenCssHelper({ cssString, url }: IHandleSavingOxygenHelperCssString) {
	try {
		const response = await requestWordPress({
			url,
			path: "/wp-json/core-framework/v2/figma/save-oxygen-css-helper",
			method: "POST",
			body: JSON.stringify({ cssString }),
		});
		const parsed = z.object({ success: z.boolean() }).safeParse(response.data);

		return { success: response.ok && parsed.success };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}
