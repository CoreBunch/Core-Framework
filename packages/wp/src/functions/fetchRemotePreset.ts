import { z } from "zod";
import { parseRemotePresetId } from "@core-framework/core/functions/fetchRemotePreset";

export { parseRemotePresetId };
export type {
	RemotePresetFailure,
	RemotePresetJson,
} from "@core-framework/core/functions/fetchRemotePreset";

import type { RemotePresetJson } from "@core-framework/core/functions/fetchRemotePreset";

const responseSchema = z.object({
	success: z.boolean(),
	json: z.string().optional(),
	reason: z.enum(["invalid-id", "not-found", "request-failed"]).optional(),
});

/**
 * WordPress fetches the project through the plugin's own REST route so the
 * request leaves the server rather than the administrator's browser. That also
 * keeps the import working on sites where the admin screen blocks third-party
 * requests.
 */
export async function fetchRemotePresetJson(id: string): Promise<RemotePresetJson> {
	if (!parseRemotePresetId(id)) {
		return { success: false, reason: "invalid-id" };
	}

	const response = await fetch(
		`${window.coreframework.core_api_url}remote-import?id=${encodeURIComponent(id)}`,
		{
			headers: {
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		},
	);

	const parsed = responseSchema.safeParse(await response.json());

	if (!parsed.success) {
		return { success: false, reason: "request-failed" };
	}

	if (!parsed.data.success || !parsed.data.json) {
		return { success: false, reason: parsed.data.reason ?? "not-found" };
	}

	return { success: true, json: parsed.data.json };
}
