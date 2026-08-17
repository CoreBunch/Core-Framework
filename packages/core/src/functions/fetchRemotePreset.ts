import { z } from "zod";

/**
 * Public, read-only endpoint that returns a project only when its owner marked
 * it as public. No credentials are sent — see the WordPress shell for the
 * server-side variant that avoids a browser request entirely.
 */
export const REMOTE_PRESET_ENDPOINT =
	"https://us-central1-core-framework-6bdc9.cloudfunctions.net/getPreset";

/** Crockford base32 as used by ULID: no I, L, O or U. Mirrors the server-side check. */
const PRESET_ID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export const remotePresetResponseSchema = z.object({
	success: z.boolean(),
	data: z
		.object({
			json: z.string(),
		})
		.optional(),
});

export type RemotePresetFailure = "invalid-id" | "not-found" | "request-failed";

export type RemotePresetJson =
	| { readonly success: true; readonly json: string }
	| { readonly success: false; readonly reason: RemotePresetFailure };

/**
 * Accepts either a bare project ID or a shareable link such as
 * `https://coreframework.com/app/01H...`, and returns the normalised ID.
 */
export function parseRemotePresetId(value: string): string | null {
	const trimmed = value.trim();

	if (!trimmed) {
		return null;
	}

	let candidate = trimmed;

	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const segments = new URL(trimmed).pathname.split("/").filter(Boolean);
			candidate = segments.at(-1) ?? "";
		} catch {
			return null;
		}
	}

	const normalized = candidate.toUpperCase();

	return PRESET_ID_PATTERN.test(normalized) ? normalized : null;
}

export async function fetchRemotePresetJson(id: string): Promise<RemotePresetJson> {
	if (!PRESET_ID_PATTERN.test(id)) {
		return { success: false, reason: "invalid-id" };
	}

	const response = await fetch(`${REMOTE_PRESET_ENDPOINT}?id=${encodeURIComponent(id)}`);

	if (response.status === 404) {
		return { success: false, reason: "not-found" };
	}

	if (!response.ok) {
		return { success: false, reason: "request-failed" };
	}

	const parsed = remotePresetResponseSchema.safeParse(await response.json());

	if (!parsed.success || !parsed.data.success || !parsed.data.data) {
		return { success: false, reason: "not-found" };
	}

	return { success: true, json: parsed.data.data.json };
}
