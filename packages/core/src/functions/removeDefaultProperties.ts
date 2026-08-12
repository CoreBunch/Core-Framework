export function removeDefaultProperties<T extends Record<string, unknown>>(
	object: T,
	defaults: T,
	skipKeys: string[] = [],
): T {
	const newObject = { ...object };

	Object.keys(defaults).forEach((key) => {
		if (skipKeys.includes(key)) {
			return;
		}

		if (newObject[key] === defaults[key]) {
			delete newObject[key];
		}
	});

	return newObject;
}
