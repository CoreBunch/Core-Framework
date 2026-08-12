interface IObjectsFilter {
	readonly key: keyof CssObject;
	readonly cssObjects: CssObject[];
}

/**
 * Splits the array of objects into two arrays by boolean value of the given key
 */
export function objectsFilter({ key, cssObjects }: IObjectsFilter): [CssObject[], CssObject[]] {
	const filteredCssObjects = [];
	const objectsWithKey = [];

	for (const cssObject of cssObjects) {
		const value = cssObject?.[key];

		if (value) {
			objectsWithKey.push(cssObject);
			continue;
		}

		filteredCssObjects.push(cssObject);
	}

	return [filteredCssObjects, objectsWithKey];
}
