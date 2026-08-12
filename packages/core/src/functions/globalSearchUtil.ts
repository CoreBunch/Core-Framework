export const SECTIONS = {
	colors: "Colors",
	typography: "Typography",
	spacing: "Spacing",
	layouts: "Layouts",
	components: "Components",
	design: "Design",
	other: "Other",
};

export const SEARCH_CLASS = "found-item";

export const isVariable = (types: CssObject["types"], value: string) =>
	(types ?? []).includes("variable") || value.startsWith("--");

export const extractValue = (regex: RegExp, defaultValue: string) => {
	const match = defaultValue.match(regex);
	return match ? match[1] || match[2] : defaultValue;
};

export const findMatchingRow = (value: string) => {
	const rows = Array.from(document.querySelectorAll(`.color-head-row`));
	return rows.find((row) => row.innerHTML.includes(`value="${value}"`));
};

export const handleExpandRow = (matchRow: Element | undefined | null) => {
	if (matchRow?.parentElement) {
		if (matchRow.parentElement.querySelector("& > div[aria-hidden=true]")) {
			(matchRow.querySelector("& > button") as HTMLButtonElement)?.click();
			matchRow.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}
};

export const extractClassValue = (currentValue: string, currentTypes: CssObject["types"]) => {
	if (currentTypes?.includes("shade-tint")) {
		currentValue = extractValue(/^(.*?)-d-|^(.*?)-l-/, currentValue);
	} else if (currentTypes?.includes("transparent-class")) {
		currentValue = extractValue(/^(.*?)-\d+$/, currentValue);
	}

	return currentValue;
};

export const matchTypoOrSpacing = (value: string, pattern: string) => {
	const regexPattern = pattern.replace(/\*/g, ".*");
	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(value);
};
