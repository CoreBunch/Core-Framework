import { StylesheetsData } from "../types";

export function retrieveStylesFromState(data: StylesheetsData | undefined | null): string[] {
	if (!data || data.isDisabled) {
		return [];
	}

	const cssStrings: string[] = [];

	for (const group of data.groups) {
		if (!group.isActive || !group.css || group.hasErrors) {
			continue;
		}

		cssStrings.push(group.css);
	}

	return cssStrings;
}
