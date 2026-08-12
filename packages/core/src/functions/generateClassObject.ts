export function cssObjectToGenerateClass(data: CssObject) {
	const { id, selector, declarations, isDisabled } = data;
	const props = declarations.map((declaration) => declaration.property);
	const tabId = declarations?.[0]?.value;

	return {
		id,
		tabId,
		isDisabled,
		name: selector,
		property: props,
	};
}
