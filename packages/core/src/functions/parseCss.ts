import { getFormat } from "colord";
import { ulid } from "ulid";
import type { ColorItem } from "components/modules/colorSystem";

function removeComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "");
}

function extractVariables(cssObjects: CssObject[]): CssObject[] {
	const variables: CssObject[] = [];

	for (const cssObject of cssObjects) {
		if (cssObject.selector !== ":root") {
			continue;
		}

		variables.push(cssObject);
	}

	return variables;
}

function parseColorItem(property: string, value: string): ColorItem | null {
	const name = property.trim();
	const format = getFormat(value);

	if (!format) {
		return null;
	}

	const colorItem: ColorItem = {
		format: format as "hex",
		id: ulid(),
		name,
		value,
	};

	return colorItem;
}

function convertCssObjectToColorSystemItem(cssObject: CssObject): ColorItem[] {
	const { declarations } = cssObject;
	const colorItems: ColorItem[] = [];

	for (const declaration of declarations) {
		const { property, value } = declaration;

		const colorItem = parseColorItem(property, value);

		if (!colorItem) {
			continue;
		}

		colorItems.push(colorItem);
	}

	return colorItems;
}

function parseDeclaration(pair: string): CSSDeclaration | null {
	const [_property, _value] = pair.split(":");

	if (!(_property && _value)) {
		return null;
	}

	const property = _property.trim();
	const value = _value.trim();
	const id = `${property}-${value}`;

	return { property, value, id };
}

function parseRule(rule: string): CssObject | null {
	const [_selector, _declarations] = rule.split("{");

	if (!(_selector && _declarations)) {
		return null;
	}

	const selector = _selector.trim();
	const declarationsString = _declarations.trim();

	const declarationPairs = declarationsString.split(";");
	const declarations: CSSDeclaration[] = [];
	const id = `rule-${selector}-${declarations.length}`;

	for (const pair of declarationPairs) {
		const parsedDeclaration = parseDeclaration(pair);

		if (!parsedDeclaration) {
			continue;
		}

		declarations.push(parsedDeclaration);
	}

	return {
		id,
		selector,
		declarations,
	};
}

export function parseCSS(css: string): {
	cssObjects: CssObject[];
} {
	const cssObjects: CssObject[] = [];

	const rules = removeComments(css).split("}").filter(Boolean);

	for (const rule of rules) {
		const parsedRule = parseRule(rule);

		if (!parsedRule) {
			continue;
		}

		cssObjects.push(parsedRule);
	}

	const variables = extractVariables(cssObjects);

	const colorSystemItems = variables.map(convertCssObjectToColorSystemItem);

	return {
		cssObjects,
		...(colorSystemItems.length && {
			modulesData: {
				COLOR_SYSTEM: {
					colors: colorSystemItems.flat(),
				},
			},
		}),
	};
}
