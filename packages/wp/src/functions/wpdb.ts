import { presetRowSchema } from "schema/wpdb.schema";
import { toast } from "sonner";
import { z } from "zod";
import { SupportedBuildersSchema } from "constants/support";
import { devLog } from "./devLog";
import { sanitizePreset } from "./sanitizePreset";

export async function sendPresetToWpDb(preset: Omit<Preset, "cssString">) {
	const res = await fetch(`${window.coreframework.core_api_url}update-presets`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-WP-Nonce": window.wpApiSettings.nonce,
		},
		body: JSON.stringify({
			id: preset.id,
			data: JSON.stringify(sanitizePreset(preset)),
		}),
	});

	const resJson = (await res.json()) as unknown;
	const parsed = z
		.object({
			success: z.boolean(),
			action: z.enum(["updated", "created"]),
		})
		.safeParse(resJson);

	if (!parsed.success) {
		return {
			success: false,
		};
	}

	return {
		success: true,
		action: parsed.data.action,
	};
}

export async function deleteRowFromWpDb(id: string) {
	try {
		const res = await fetch(`${window.coreframework.core_api_url}delete-preset`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({ id }),
		});

		const resJson = (await res.json()) as unknown;
		const parse = z
			.object({
				success: z.boolean(),
			})
			.safeParse(resJson);

		if (!parse.success) {
			return {
				success: false,
			};
		}

		return {
			success: true,
		};
	} catch (err) {
		return {
			success: false,
		};
	}
}

interface IHandlePush {
	readonly id: string;
	readonly cssString: string;
}

export async function handlePushDb({ id, cssString }: IHandlePush) {
	const ERROR_MESSAGE = "Failed to update main table. [#02]";

	try {
		const url = new URL(`${window.coreframework.core_api_url}update-main`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({
				id,
				cssString,
			}),
		});

		const resJson = (await res.json()) as unknown;
		const parsed = z
			.object({
				success: z.boolean(),
				bytes_saved: z.number(),
			})
			.safeParse(resJson);

		if (!parsed.success) {
			console.warn(ERROR_MESSAGE);
			return {
				success: false,
				bytes_saved: 0,
			};
		}

		return {
			...parsed.data,
		};
	} catch (e) {
		// The caller decides what the user sees: it is the only place that knows whether
		// this push was meant to be silent, and it now reports the failure for both this
		// branch and the parse branch above, which never had a message at all.
		console.warn(ERROR_MESSAGE, e);
		return {
			success: false,
			bytes_saved: 0,
		};
	}
}

export async function getRowFromWpDb(id: string) {
	const ERROR_MESSAGE =
		"Failed to load project from database. Please make sure permalink structure is set to option other than plain. If issue persists please contact support. [#01]";

	try {
		const url = new URL(`${window.coreframework.core_api_url}get-preset-row`);
		url.searchParams.append("id", id);

		const res = await fetch(String(url), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		});

		const resJson = (await res.json()) as unknown;
		const parsed = z
			.object({
				success: z.boolean(),
				data: presetRowSchema,
			})
			.parse(resJson);

		if (parsed.data === null) {
			console.info("No project found in database. Creating new one.");
			return {
				success: false,
				data: null,
			};
		}

		if (!parsed.success) {
			console.warn(ERROR_MESSAGE);
			return {
				success: false,
				data: null,
			};
		}

		return {
			success: true,
			data: parsed?.data,
		};
	} catch (e) {
		console.warn(ERROR_MESSAGE);
		toast.error(ERROR_MESSAGE);
		devLog("getRowFromWpDb", e);
		return {
			success: false,
			data: null,
		};
	}
}

interface IUpdateColors {
	readonly addonEnableArray: {
		addon: "bricks" | "oxygen" | "gutenberg" | "";
		enabled: boolean;
	}[];
	readonly colors: {
		id: string;
		name: string;
		value: string;
		raw: string;
	}[];
}

export async function updateColors({ addonEnableArray, colors }: IUpdateColors) {
	const ERROR_MESSAGE = "Failed to update colors in builder. [#03]";

	try {
		const url = new URL(`${window.coreframework.core_api_url}update-colors`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({
				colors,
				addonEnableArray,
			}),
		});

		const resJson = (await res.json()) as unknown;

		const parsed = z
			.object({
				success: z.boolean(),
				active_builders: z.array(z.string()).or(z.null()),
			})
			.safeParse(resJson);

		devLog("IUpdateColors", parsed);

		if (!parsed.success) {
			console.warn(ERROR_MESSAGE);
			toast.error("Failed to update colors in targeted builder.");
			return {
				success: false,
				data: null,
			};
		}

		return {
			success: true,
			data: parsed.data,
		};
	} catch (e) {
		console.warn(ERROR_MESSAGE);
		toast.error("Failed to update colors in targeted builder.");
		return {
			success: false,
			data: null,
		};
	}
}

interface IUpdateClasses {
	readonly classes: string[];
	readonly addonEnableArray: {
		addon: "bricks" | "oxygen" | "gutenberg" | "";
		enabled: boolean;
	}[];
}

export async function updateClasses({ classes, addonEnableArray }: IUpdateClasses) {
	const ERROR_MESSAGE = "Failed to update classes in builder. [#04]";

	try {
		const url = new URL(`${window.coreframework.core_api_url}update-classes`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({
				classes,
				addonEnableArray,
			}),
		});

		const resJson = (await res.json()) as unknown;

		const parsed = z
			.object({
				success: z.boolean(),
				active_builders: z.array(z.string()).or(z.null()),
			})
			.safeParse(resJson);

		devLog("IUpdateClasses", parsed);

		if (!parsed.success) {
			console.warn(ERROR_MESSAGE);
			toast.error("Failed to update classes in targeted builder.");
			return {
				success: false,
				data: null,
			};
		}

		return {
			success: true,
			data: parsed.data,
		};
	} catch (e) {
		console.warn(ERROR_MESSAGE, e);
		toast.error("Failed to update classes in targeted builder.");
		return {
			success: false,
			data: null,
		};
	}
}

interface IUpdateGroupedClasses {
	readonly groupedClassNames: Record<
		Exclude<StylesheetDataKeys, "fontsStyles" | "stylesheetsStyles">,
		Record<string, string[]>
	>;
}

export async function updateGroupedClasses({ groupedClassNames }: IUpdateGroupedClasses) {
	const ERROR_MESSAGE = "Failed to update classes in builder. [#04]";

	try {
		const url = new URL(`${window.coreframework.core_api_url}update-grouped-classes`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({
				groupedClassNames,
			}),
		});

		const resJson = (await res.json()) as unknown;

		const parsed = z
			.object({
				success: z.boolean(),
			})
			.safeParse(resJson);

		devLog("IUpdateGroupedClasses", parsed);

		if (!parsed.success) {
			console.warn(ERROR_MESSAGE);
			toast.error("Failed to update classes in targeted builder.");
			return {
				success: false,
			};
		}

		return {
			success: true,
		};
	} catch (e) {
		console.warn(ERROR_MESSAGE, e);
		toast.error("Failed to update classes in targeted builder.");
		return {
			success: false,
		};
	}
}

export async function getActiveBuilders() {
	try {
		const res = await fetch(`${window.coreframework.core_api_url}get-builders`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		});
		const resJson = await res.json();
		const parsed = z
			.object({
				builders: SupportedBuildersSchema,
				isOxygen6: z.boolean().optional(),
			})
			.safeParse(resJson);

		if (!parsed.success) {
			console.error(parsed);
			return { builders: [], isOxygen6: false };
		}

		return {
			builders: parsed.data.builders ?? [],
			isOxygen6: parsed.data.isOxygen6 ?? false,
		};
	} catch (e) {
		console.error(e);
		return { builders: [], isOxygen6: false };
	}
}

interface IUpdatePrefixedCssFile {
	readonly cssString: string;
}

export async function updatePrefixedCssFile({ cssString }: IUpdatePrefixedCssFile) {
	try {
		const url = new URL(`${window.coreframework.core_api_url}update-prefixed-css-file`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({
				cssString,
			}),
		});

		const resJson = await res.json();
		const parsed = z
			.object({
				success: z.boolean(),
			})
			.safeParse(resJson);

		if (!parsed.success) {
			console.error(parsed);
			return {
				success: false,
			};
		}

		return {
			success: true,
		};
	} catch (e) {
		console.error(e);
	}
}

interface IHandleSavingOxygenHelperCssString {
	readonly cssString: string;
}

export async function saveOxygenCssHelper({ cssString }: IHandleSavingOxygenHelperCssString) {
	try {
		const url = new URL(`${window.coreframework.core_api_url}save-oxygen-css-helper`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({
				cssString,
			}),
		});

		const resJson = await res.json();
		const parsed = z
			.object({
				success: z.boolean(),
			})
			.safeParse(resJson);

		if (!parsed.success) {
			console.error(parsed);
			return {
				success: false,
			};
		}

		return {
			success: true,
		};
	} catch (e) {
		console.error(e);
	}
}

export async function getApiKey() {
	try {
		const url = new URL(`${window.coreframework.core_api_url}api-key`);
		const res = await fetch(String(url), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		});

		const resJson = await res.json();
		const parsed = z
			.object({
				key: z.string(),
			})
			.safeParse(resJson);

		if (!parsed.success) {
			console.error(parsed);
			return {
				key: "",
			};
		}

		return {
			key: parsed.data.key,
		};
	} catch (e) {
		console.error(e);
		return {
			key: "",
		};
	}
}

export async function createApiKey() {
	try {
		const url = new URL(`${window.coreframework.core_api_url}api-key`);
		const res = await fetch(String(url), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		});

		const resJson = await res.json();
		const parsed = z.object({ success: z.boolean(), key: z.string() }).safeParse(resJson);

		if (!parsed.success) {
			console.error(parsed);
			return {
				success: false,
				key: "",
			};
		}

		return {
			success: true,
			key: parsed.data.key,
		};
	} catch (e) {
		console.error(e);
		return {
			success: false,
			key: "",
		};
	}
}

export async function deleteApiKey() {
	try {
		const url = new URL(`${window.coreframework.core_api_url}api-key`);
		const res = await fetch(String(url), {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		});

		const resJson = await res.json();
		const parsed = z.object({ success: z.boolean() }).safeParse(resJson);

		if (!parsed.success) {
			console.error(parsed);
			return {
				success: false,
			};
		}

		return {
			success: true,
		};
	} catch (e) {
		console.error(e);
		return {
			success: false,
		};
	}
}
