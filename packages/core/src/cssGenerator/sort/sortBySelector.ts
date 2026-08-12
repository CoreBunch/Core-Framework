interface IGenerateRules {
	readonly cssObjects: CssObject[];
	readonly mainRootObjectId: string;
	readonly needsSorting: boolean;
}

export const sortBySelector = ({ cssObjects, mainRootObjectId, needsSorting }: IGenerateRules) => {
	if (needsSorting === false) {
		return cssObjects;
	}

	return cssObjects.sort((a, b) => {
		if (a.selector.startsWith("html")) {
			return -1;
		}

		if (b.selector === "html") {
			return 1;
		}

		if (a.id === mainRootObjectId) {
			return -1;
		}

		if (b.id === mainRootObjectId) {
			return 1;
		}

		if (a.media === "DARK_MODE") {
			return -1;
		}

		if (a.selector.includes(":root")) {
			return -1;
		}

		if (b.selector.includes(":root")) {
			return 1;
		}

		return 0;
	});
};
