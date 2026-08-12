import type { ColorSystemFormData } from "../types";
import { generateClass } from "functions/generateClass";
import { mergeArrays } from "utils";
import { generateColorSystemVariables } from "./generateColorSystemVariables";

interface IGenerateTransparentClasses {
	readonly name: string;
	readonly transparentVariables: (string | number)[];
	readonly property: string;
	readonly prefix: string;
	readonly includeVariants?: boolean;
}

function generateTransparentClasses({
	name,
	transparentVariables,
	property,
	prefix,
	includeVariants,
}: IGenerateTransparentClasses) {
	const transparentClasses: CssObject[] = [];

	for (const number of transparentVariables) {
		const transparentVariableName = `${name}-${number}`;
		const transparentVariable = `--${transparentVariableName}`;

		transparentClasses.push({
			...generateClass({
				variable: transparentVariable,
				name: transparentVariableName,
				property,
				prefix,
			}),
			...(includeVariants && { types: ["class", "transparent-class"] }),
		});
	}

	return transparentClasses;
}

interface IGenerateShadesAndTintsClasses {
	readonly shades: {
		name: string;
		value: string;
	}[];
	readonly prefix: string;
	readonly property: string;
	readonly includeVariants?: boolean;
}

function generateShadesAndTintsClasses({
	shades,
	prefix,
	property,
	includeVariants,
}: IGenerateShadesAndTintsClasses) {
	const classes: CssObject[] = [];

	for (const { name } of shades) {
		classes.push({
			...generateClass({
				variable: `--${name}`,
				name,
				prefix,
				property,
			}),
			...(includeVariants && { types: ["class", "shade-tint"] }),
		});
	}

	return classes;
}

interface IGenerateColorSystemObjects {
	readonly formData: ColorSystemFormData;
	readonly darkModeSelector?: string;
	readonly lightModeSelector?: string;
	readonly classPrefix?: string;
	readonly manualTheme?: boolean;
	readonly onlyVariables?: boolean;
	readonly isAddGroupComments?: boolean;
	readonly includeVariants?: boolean;
}

export function generateColorSystemObjects({
	formData,
	darkModeSelector,
	lightModeSelector,
	classPrefix,
	onlyVariables = false,
	manualTheme = true,
	isAddGroupComments,
	includeVariants,
}: IGenerateColorSystemObjects) {
	const { groups } = formData;

	const colorSystemVariables = generateColorSystemVariables({
		colorSystemState: formData,
		manual_theme: manualTheme,
		darkModeSelector,
		lightModeSelector,
		classPrefix,
		includeVariants,
	});

	if (onlyVariables) return colorSystemVariables;

	const colorClasses: CssObject[] = [];
	const types: CssObject["types"] = ["class"];

	const mergeVariants = (el: CssObject, types: CssObject["types"] = [], groupName?: string) => ({
		...el,
		...(includeVariants && {
			types: [...new Set([...(el.types || []), ...types])],
			groupName,
		}),
	});

	const generateClasses = ({
		name,
		variable,
		transparentVariables,
		isShades,
		shades,
		isTints,
		tints,
		property,
		prefix,
		types = [],
		groupName,
	}: {
		name: string;
		variable: string;
		transparentVariables?: any[];
		isShades?: boolean;
		shades?: any[];
		isTints?: boolean;
		tints?: any[];
		property: string;
		prefix: string;
		types?: CssObject["types"];
		groupName?: string;
	}) => {
		colorClasses.push(
			mergeVariants(generateClass({ variable, name, prefix, property }), types, groupName),
			...(transparentVariables
				? generateTransparentClasses({ name, transparentVariables, property, prefix, includeVariants }).map(
						(el) => mergeVariants(el, types, groupName),
				  )
				: []),
			...(isShades && shades?.length
				? generateShadesAndTintsClasses({ shades, prefix, property, includeVariants }).map((el) =>
						mergeVariants(el, types, groupName),
				  )
				: []),
			...(isTints && tints?.length
				? generateShadesAndTintsClasses({ shades: tints, prefix, property, includeVariants }).map((el) =>
						mergeVariants(el, types, groupName),
				  )
				: []),
		);
	};

	for (const { colors, name: groupName } of groups) {
		for (const { transparentVariables, name, isShades, shades, isTints, tints, gen } of colors) {
			const variable = `--${name}`;
			const createClassByType = (property: string, prefix: string, types: CssObject["types"] = []) =>
				generateClasses({
					name,
					variable,
					transparentVariables,
					isShades,
					shades,
					isTints,
					tints,
					property,
					prefix,
					types,
					groupName,
				});

			gen?.includes("bg") && createClassByType("background-color", "bg", [...types, "bg-class"]);
			gen?.includes("text") && createClassByType("color", "text", [...types, "text-class"]);
			gen?.includes("border") && createClassByType("border-color", "border", [...types, "border-class"]);
			gen?.includes("fill") && createClassByType("fill", "fill", [...types, "fill-class"]);
		}
	}

	const groupComment: CssObject[] = isAddGroupComments
		? [{ id: "cs-c", selector: `/* Color System */`, declarations: [] }]
		: [];

	return mergeArrays(groupComment, colorSystemVariables, colorClasses);
}
