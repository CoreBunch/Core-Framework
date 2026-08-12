import { mergeArrays } from "utils";

export function mergeSameSelectors(cssObjects: CssObject[]) {
	let newCssObjects: CssObject[] = [];

	cssObjects.forEach((cssObject) => {
		const objectWithTheSameSelector = newCssObjects.find(
			({ selector, mediaQuery, media, support }) =>
				selector === cssObject.selector &&
				String(mediaQuery ?? "0,3") === String(cssObject.mediaQuery ?? "0,3") &&
				String(media) === String(cssObject.media) &&
				String(support) === String(cssObject.support),
		);
		const id = objectWithTheSameSelector?.id;

		if (objectWithTheSameSelector) {
			const newDeclarations = mergeArrays(objectWithTheSameSelector.declarations, cssObject.declarations);

			newCssObjects = newCssObjects.map((cssObject) => {
				if (cssObject.id === id) {
					return {
						...cssObject,
						declarations: newDeclarations,
					};
				}

				return cssObject;
			});
		}

		if (!objectWithTheSameSelector) {
			newCssObjects.push(cssObject);
		}
	});

	return newCssObjects;
}
