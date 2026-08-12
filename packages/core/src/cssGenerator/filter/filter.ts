const typeValueMap = {
	fluid: "fluidValue",
	color: "colorValue",
	text: "value",
};

export function filterDeclarations(declarations: CSSDeclaration[]) {
	return declarations.filter((declaration) => {
		const hasProperty = declaration.property.length > 0;
		const targetValue = typeValueMap[(declaration?.type || "text") as keyof typeof typeValueMap];
		const hasValue = (declaration[targetValue as keyof typeof declaration] || "").length > 0;

		return [hasProperty, hasValue].every(Boolean);
	});
}

export function filter(cssObjects: CssObject[]) {
	return cssObjects
		.filter((cssObject) => {
			const isComment = cssObject.selector.startsWith("/*");
			const hasDeclarations = Object.keys(filterDeclarations(cssObject.declarations)).length > 0 || isComment;
			const isDisabled = "isDisabled" in cssObject && cssObject.isDisabled;

			return [cssObject.selector, hasDeclarations, !isDisabled].every(Boolean);
		})
		.map((cssObject) => {
			return {
				...cssObject,
				declarations: filterDeclarations(cssObject.declarations),
			};
		});
}
