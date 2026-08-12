const variableRegex = /var\(--([^)]+)\)/g;

function prefixVarWithValue(value: string, targets: string[], prefix: string) {
	return value.replace(variableRegex, (match, variable) =>
		targets.includes(variable) ? `var(--${prefix}${variable})` : match,
	);
}

interface PrefixRoot {
	readonly prefix: string;
	readonly targetVariables: string[];
	readonly cssObjects: CssObject[];
}

export function prefixRoot({ prefix, targetVariables, cssObjects }: PrefixRoot): CssObject[] {
	return cssObjects.map((cssObject) => {
		const { declarations } = cssObject;
		const prefixedDeclarations = [];

		for (const declaration of declarations) {
			const { property, ...rest } = declaration;

			if (property.startsWith("--") && !property.startsWith(`--${prefix}`)) {
				prefixedDeclarations.push({
					...rest,
					property: `--${prefix}${property.replace("--", "")}`,
					value: prefixVarWithValue(declaration.value, targetVariables, prefix),
				});
			} else {
				prefixedDeclarations.push(declaration);
			}
		}

		return {
			...cssObject,
			declarations: prefixedDeclarations,
		};
	});
}

interface PrefixVariablesInCssObjects {
	readonly prefix: string;
	readonly targetVariables: string[];
	readonly cssObjects: CssObject[];
}

export function prefixVariablesInCssObjects({
	prefix,
	targetVariables,
	cssObjects,
}: PrefixVariablesInCssObjects): CssObject[] {
	const prefixedCssObjects = [];

	for (const cssObject of cssObjects) {
		const { declarations, ...rest } = cssObject;
		const prefixedDeclarations = [];

		for (const declaration of declarations) {
			const { value, ...declarationRest } = declaration;

			if (value.includes("var(--") && !value.includes(`var(--${prefix}`)) {
				prefixedDeclarations.push({
					...declarationRest,
					value: prefixVarWithValue(value, targetVariables, prefix),
				});
			} else {
				prefixedDeclarations.push(declaration);
			}
		}

		prefixedCssObjects.push({
			...rest,
			declarations: prefixedDeclarations,
		});
	}

	return prefixedCssObjects;
}

interface PrefixVariables {
	readonly prefix: string;
	readonly cssObjects: CssObject[];
	readonly rootObject: CssObject;
}

export function prefixVariables({ prefix, cssObjects, rootObject }: PrefixVariables): CssObject[] {
	const targetVariables = rootObject.declarations.map((declaration) =>
		declaration.property.replace("--", ""),
	);

	const allRootObjects = cssObjects.filter(({ selector }) => selector.startsWith(":root"));

	const prefixedRootObjects = prefixRoot({
		cssObjects: allRootObjects,
		targetVariables,
		prefix,
	});

	const prefixedCssObjects = prefixVariablesInCssObjects({
		prefix,
		cssObjects,
		targetVariables,
	}).filter(({ selector }) => !selector.startsWith(":root"));

	return [...prefixedRootObjects, ...prefixedCssObjects];
}

interface IPrefixRootVariablesAndAddDarkModeSelector {
	readonly cssObjects: CssObject[];
	readonly variablePrefix: string;
	readonly darkModeSelector: string;
	readonly manualDarkMode: boolean;
	readonly classPrefix?: string;
	readonly alwaysLightSelector?: string;
}

export function prefixRootVariablesAndAddDarkModeSelector({
	cssObjects,
	variablePrefix,
	darkModeSelector,
	manualDarkMode,
	classPrefix,
	alwaysLightSelector,
}: IPrefixRootVariablesAndAddDarkModeSelector) {
	const hasRootStyles = cssObjects?.some(({ selector }) => selector.startsWith(":root"));

	if (!hasRootStyles) {
		return {
			cssObjects,
			mainRootObjectId: "",
		};
	}

	const mainRootObject = cssObjects.find(
		({ selector, media, support, mediaQuery }) =>
			selector === ":root" && [media, support, mediaQuery].every((item) => !item),
	);

	if (!mainRootObject) {
		return {
			cssObjects,
			mainRootObjectId: "",
		};
	}

	const mainRootObjectId = mainRootObject?.id || "";

	if (manualDarkMode) {
		mainRootObject.selector = `:root, :root${darkModeSelector} .${
			classPrefix ?? ""
		}theme-inverted, :root${darkModeSelector} ${alwaysLightSelector ?? ""}, :root.cf-theme-light .${
			classPrefix ?? ""
		}theme-inverted ${alwaysLightSelector ?? ""}`;
	}

	if (variablePrefix) {
		return {
			cssObjects: prefixVariables({
				prefix: variablePrefix,
				rootObject: mainRootObject,
				cssObjects,
			}),
			mainRootObjectId,
		};
	}

	cssObjects.splice(cssObjects.indexOf(mainRootObject), 1);
	cssObjects.unshift(mainRootObject);

	return {
		cssObjects,
		mainRootObjectId,
	};
}
