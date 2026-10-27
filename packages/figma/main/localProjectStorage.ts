const STORAGE_KEY = "cf_plugin_project_local";
const FORMAT = "core-framework-project-chunks";
// Well below Figma's 100 kB per-entry limit, including UTF-8/UTF-16 and key overhead.
// Do not depend on TextEncoder: it is not available in the Figma main sandbox.
const CHUNK_LENGTH = 16_000;

type PluginDataStore = Pick<PluginDataMixin, "getPluginData" | "setPluginData" | "getPluginDataKeys">;
type Manifest = { format: typeof FORMAT; version: 1; bank: "a" | "b"; chunks: number };

function isManifest(value: unknown): value is Manifest {
	const manifest = value as Manifest | null;
	return Boolean(
		manifest &&
		manifest.format === FORMAT &&
		manifest.version === 1 &&
		(manifest.bank === "a" || manifest.bank === "b") &&
		Number.isSafeInteger(manifest.chunks) &&
		manifest.chunks > 0,
	);
}

function chunkKey(bank: Manifest["bank"], index: number) {
	return `${STORAGE_KEY}_${bank}_${index}`;
}

export function readLocalProject(store: PluginDataStore): unknown {
	const serialized = store.getPluginData(STORAGE_KEY);
	if (!serialized) return null;
	const value = JSON.parse(serialized);
	// Older versions stored the preset directly in this entry.
	if (value?.format !== FORMAT) return value;
	if (!isManifest(value)) throw new Error("Invalid local project storage metadata");

	const chunks: string[] = [];
	for (let index = 0; index < value.chunks; index++) {
		const chunk = store.getPluginData(chunkKey(value.bank, index));
		if (!chunk) throw new Error("The saved local project is incomplete");
		chunks.push(chunk);
	}
	return JSON.parse(chunks.join(""));
}

export function saveLocalProject(store: PluginDataStore, preset: unknown): void {
	if (!preset || typeof preset !== "object") throw new Error("No local project to save");
	const serialized = JSON.stringify(preset);
	const previous = store.getPluginData(STORAGE_KEY);
	let previousManifest: unknown;
	try {
		previousManifest = previous ? JSON.parse(previous) : null;
	} catch {
		// A new explicit save may replace unreadable legacy data.
	}
	const bank = isManifest(previousManifest) && previousManifest.bank === "a" ? "b" : "a";
	const keys = new Set<string>();
	let index = 0;
	for (let start = 0; start < serialized.length; index++) {
		let end = Math.min(start + CHUNK_LENGTH, serialized.length);
		// Keep surrogate pairs together when Figma encodes each entry separately.
		const last = serialized.charCodeAt(end - 1);
		if (end < serialized.length && last >= 0xd800 && last <= 0xdbff) end--;
		const key = chunkKey(bank, index);
		store.setPluginData(key, serialized.slice(start, end));
		keys.add(key);
		start = end;
	}
	// Publish only after every chunk is written. A failed write leaves the previous
	// manifest (or legacy preset) and its data intact, including across plugin restarts.
	const manifest: Manifest = { format: FORMAT, version: 1, bank, chunks: index };
	store.setPluginData(STORAGE_KEY, JSON.stringify(manifest));

	// Cleanup is best effort: failure here must not turn a committed save into an error.
	try {
		for (const key of store.getPluginDataKeys()) {
			if (/^cf_plugin_project_local_[ab]_\d+$/.test(key) && !keys.has(key)) {
				store.setPluginData(key, "");
			}
		}
	} catch (error) {
		console.warn("Failed to remove old Core Framework project chunks", error);
	}
}
