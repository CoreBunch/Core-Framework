export function createPluginDataStore() {
	const entries = new Map<string, string>();
	let failWrite: ((key: string, value: string) => boolean) | undefined;
	return {
		entries,
		failWritesWhen(predicate?: typeof failWrite) {
			failWrite = predicate;
		},
		getPluginData(key: string) {
			return entries.get(key) ?? "";
		},
		getPluginDataKeys() {
			return [...entries.keys()];
		},
		setPluginData(key: string, value: string) {
			if (Buffer.byteLength(`1425159447572460002${key}${value}`, "utf8") > 100_000) {
				throw new Error("Plugin data exceeds 100 kB");
			}
			if (failWrite?.(key, value)) throw new Error("Simulated storage failure");
			if (value) entries.set(key, value);
			else entries.delete(key);
		},
	};
}
