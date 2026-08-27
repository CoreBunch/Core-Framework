// A `localStorage` wrapper that never throws.
//
// The editor is bundled into the Figma plugin, where it runs inside an
// `about:srcdoc` iframe. Reading `window.localStorage` there throws
// `SecurityError: Failed to read the 'localStorage' property from 'Window':
// Access is denied for this document.` (issue #11) — which killed the save
// click as an uncaught promise rejection. The same access is denied in some
// privacy modes and cross-origin sandboxes.
//
// When the real store is unreachable we transparently fall back to an
// in-memory map so storage-backed features keep working for the session
// instead of crashing. On the web, `window.localStorage` is available and
// behaviour is unchanged.

const memoryStore = new Map<string, string>();

export const safeLocalStorage = {
	getItem(key: string): string | null {
		try {
			return window.localStorage.getItem(key);
		} catch {
			return memoryStore.has(key) ? (memoryStore.get(key) as string) : null;
		}
	},

	setItem(key: string, value: string): void {
		try {
			window.localStorage.setItem(key, value);
		} catch {
			memoryStore.set(key, value);
		}
	},

	removeItem(key: string): void {
		try {
			window.localStorage.removeItem(key);
		} catch {
			memoryStore.delete(key);
		}
	},
};
