export function filterSameDeclarations(declarations: CSSDeclaration[]) {
	if (declarations.length < 1) {
		return declarations;
	}

	const uniqueDeclarations: Omit<CSSDeclaration, "id">[] = [];

	for (const { property, value, type, colorValue, fluidValue } of declarations) {
		const isDeclarationUnique = uniqueDeclarations.every(
			(uniqueDeclarations) => uniqueDeclarations.property !== property || uniqueDeclarations.value !== value,
		);

		if (isDeclarationUnique) {
			uniqueDeclarations.push({
				property,
				value,
				...(type
					? {
							type,
					  }
					: {}),
				...(colorValue
					? {
							colorValue,
					  }
					: {}),
				...(fluidValue
					? {
							fluidValue,
					  }
					: {}),
			});
		}
	}

	return uniqueDeclarations;
}
