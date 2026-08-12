/**
 * Performs a deep equality check between two values.
 * More efficient than JSON.stringify comparison for nested objects.
 *
 * @param a First value to compare
 * @param b Second value to compare
 * @returns true if values are deeply equal, false otherwise
 */
export function deepEqual(a: unknown, b: unknown): boolean {
	// Handle primitive types and same reference
	if (a === b) return true;

	// Handle null/undefined
	if (a == null || b == null) return false;

	// Must be same type
	if (typeof a !== typeof b) return false;

	// Handle arrays
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], b[i])) return false;
		}
		return true;
	}

	// Handle objects
	if (typeof a === "object" && typeof b === "object") {
		const aObj = a as Record<string, unknown>;
		const bObj = b as Record<string, unknown>;

		const keysA = Object.keys(aObj);
		const keysB = Object.keys(bObj);

		if (keysA.length !== keysB.length) return false;

		for (const key of keysA) {
			if (!keysB.includes(key)) return false;
			if (!deepEqual(aObj[key], bObj[key])) return false;
		}

		return true;
	}

	// For all other types (functions, symbols, etc.)
	return false;
}

/**
 * Performs a shallow equality check between two objects.
 * Only compares the first level of properties.
 *
 * @param a First object to compare
 * @param b Second object to compare
 * @returns true if objects are shallowly equal, false otherwise
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;

	if (a == null || b == null) return false;
	if (typeof a !== "object" || typeof b !== "object") return false;

	const aObj = a as Record<string, unknown>;
	const bObj = b as Record<string, unknown>;

	const keysA = Object.keys(aObj);
	const keysB = Object.keys(bObj);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (!keysB.includes(key)) return false;
		if (aObj[key] !== bObj[key]) return false;
	}

	return true;
}
