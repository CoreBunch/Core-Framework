import { convertToKebabCase } from "utils";
import { getCssForSingleTypeScale } from "components/modules/spacing/functions/getCssForSingleTypeScale";
import { INDENTATION, NEW_LINE_CHAR } from "cssGenerator/constants";
import { CssGeneratorOptions } from "cssGenerator/cssGenerator";
import { validateProperty, validateValue } from "cssGenerator/validation";

interface IRegenerateFluidValues {
	readonly minScreenWidth: Required<CssGeneratorOptions>["minScreenWidth"];
	readonly maxScreenWidth: Required<CssGeneratorOptions>["maxScreenWidth"];
	readonly rootFontSize: Required<CssGeneratorOptions>["rootFontSize"];
	readonly isRem: Required<CssGeneratorOptions>["isRem"];
	readonly fluidValue?: FluidInputValue;
}

function regenerateFluidValues({
	minScreenWidth,
	maxScreenWidth,
	rootFontSize,
	fluidValue,
	isRem,
}: IRegenerateFluidValues) {
	if (!fluidValue) {
		return "";
	}

	const [restoredMin, restoredMax] = fluidValue;

	return getCssForSingleTypeScale({
		minFontSize: Number(restoredMin),
		maxFontSize: Number(restoredMax),
		minScreenWidth,
		maxScreenWidth,
		isRem,
		rootFontSize,
	});
}

interface IGenerateDeclarations {
	readonly declarationsArray: Omit<CSSDeclaration, "id">[];
	readonly options: Required<CssGeneratorOptions>;
}

export function generateDeclarations(
	declarationsArray: IGenerateDeclarations["declarationsArray"],
	{
		minScreenWidth,
		maxScreenWidth,
		propertyValidation = true,
		valueValidation = true,
		rootFontSize,
		isRem,
	}: IGenerateDeclarations["options"],
) {
	const numOfDeclarations = declarationsArray.length;
	let declarationsString = "";

	declarationsArray.forEach(({ property, value, type, colorValue, fluidValue }, index) => {
		const propertyKebab = convertToKebabCase(property);

		const isPropertyValid = propertyValidation ? validateProperty(property) : true;
		const isValueValid = valueValidation ? validateValue(propertyKebab, value) : true;

		const newLineChar = index === numOfDeclarations - 1 ? "" : NEW_LINE_CHAR;

		const isValidDeclaration = isPropertyValid && isValueValid;

		let _value = "";

		switch (type) {
			case "fluid":
				_value = regenerateFluidValues({
					fluidValue: fluidValue as FluidInputValue,
					minScreenWidth,
					maxScreenWidth,
					rootFontSize,
					isRem,
				});
				break;
			case "color":
				_value = colorValue?.trim().replace(/;/g, "") || "";
				break;
			default:
				_value = value.trim().replace(/;/g, "");
				break;
		}

		declarationsString += isValidDeclaration
			? `${INDENTATION}${propertyKebab}: ${_value};${newLineChar}`
			: ` /* ${propertyKebab}: ${_value}; */${newLineChar}`;
	});

	return declarationsString;
}
