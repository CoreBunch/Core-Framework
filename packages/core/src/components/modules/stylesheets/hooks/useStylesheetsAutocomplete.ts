import { useMemo } from "react";
import { retrieveVariablesFromSpacingState } from "../../spacing/functions/retrieveVariablesFromSpacingState";
import { retrieveVariablesFromTypographyState } from "../../typography/functions/retrieveVariablesFromTypographyState";
import { AutocompleteItem } from "../types";
import { useAtomValue } from "jotai";
import {
	colorStylesAtom,
	colorSystemFormDataAtom,
	componentsStylesAtom,
	currentPresetAtom,
	designStylesAtom,
	layoutsStylesAtom,
	spacingDataAtom,
	spacingStylesAtom,
	typographyDataAtom,
	typographyStylesAtom,
} from "state";

export function useStylesheetsAutocomplete() {
	const preset = useAtomValue(currentPresetAtom);
	const colorStyles = useAtomValue(colorStylesAtom);
	const typographyStyles = useAtomValue(typographyStylesAtom);
	const spacingStyles = useAtomValue(spacingStylesAtom);
	const layoutsStyles = useAtomValue(layoutsStylesAtom);
	const designStyles = useAtomValue(designStylesAtom);
	const componentsStyles = useAtomValue(componentsStylesAtom);
	const typographyData = useAtomValue(typographyDataAtom);
	const spacingData = useAtomValue(spacingDataAtom);
	const colorSystemData = useAtomValue(colorSystemFormDataAtom);

	const autocompleteData = useMemo(() => {
		const items: AutocompleteItem[] = [];
		const classPrefix = preset?.classPrefix || "";
		const variablePrefix = preset?.variablePrefix || "";

		// Helper function to extract classes from style groups
		const extractClasses = (styleGroups: StylesGroup[], groupName: string) => {
			styleGroups.forEach((group) => {
				if (group.isDisabled) return;

				group.cssObjects?.forEach((cssObj) => {
					if (cssObj.selector?.startsWith(".")) {
						const className = cssObj.selector.slice(1).split(":")[0]; // Remove pseudo-classes
						items.push({
							label: classPrefix + className,
							type: "class",
							apply: `.${classPrefix}${className}`,
							detail: `${groupName} - ${group.name}`,
						});
					}
				});
			});
		};

		// Helper function to extract variables from style groups
		const extractVariables = (styleGroups: StylesGroup[], groupName: string) => {
			styleGroups.forEach((group) => {
				if (group.isDisabled || group.type !== "variable") return;

				group.cssObjects?.[0]?.declarations?.forEach((decl) => {
					if (decl.property?.startsWith("--")) {
						items.push({
							label: decl.property,
							type: "variable",
							apply: `var(${decl.property})`,
							detail: `${groupName} - ${group.name}`,
						});
					}
				});
			});
		};

		// Extract classes and variables from all style groups
		extractClasses(colorStyles, "Colors");
		extractClasses(typographyStyles, "Typography");
		extractClasses(spacingStyles, "Spacing");
		extractClasses(layoutsStyles, "Layouts");
		extractClasses(designStyles, "Design");
		extractClasses(componentsStyles, "Components");

		extractVariables(colorStyles, "Colors");
		extractVariables(typographyStyles, "Typography");
		extractVariables(spacingStyles, "Spacing");
		extractVariables(layoutsStyles, "Layouts");
		extractVariables(designStyles, "Design");
		extractVariables(componentsStyles, "Components");

		// Add typography calculator variables
		if (!typographyData.isDisabled) {
			typographyData.groups.forEach((group) => {
				const variables = retrieveVariablesFromTypographyState(group);
				variables.forEach((varName) => {
					// varName is already in the format "--text-s"
					if (varName.startsWith("--")) {
						items.push({
							label: varName,
							type: "variable",
							apply: `var(${varName})`,
							detail: `Typography Scale - ${group.name}`,
						});
					}
				});
			});
		}

		// Add spacing calculator variables
		if (!spacingData.isDisabled) {
			spacingData.groups.forEach((group) => {
				const variables = retrieveVariablesFromSpacingState(group);
				variables.forEach((varName) => {
					// varName is already in the format "--space-s"
					if (varName.startsWith("--")) {
						items.push({
							label: varName,
							type: "variable",
							apply: `var(${varName})`,
							detail: `Spacing Scale - ${group.name}`,
						});
					}
				});
			});
		}

		// Add color system variables
		if (!colorSystemData.isDisabled) {
			colorSystemData.groups.forEach((group) => {
				group.colors.forEach((color) => {
					// Convert color name to CSS variable format with prefix
					const varName = `--${variablePrefix}${color.name}`;

					// Main color
					items.push({
						label: varName,
						type: "variable",
						apply: `var(${varName})`,
						detail: `Color System - ${group.name}`,
						color: color.value,
					});

					// Shades
					if (color.isShades && color.shades?.length) {
						color.shades.forEach((shade) => {
							const shadeVarName = `--${variablePrefix}${shade.name}`;
							items.push({
								label: shadeVarName,
								type: "variable",
								apply: `var(${shadeVarName})`,
								detail: `Color System - ${group.name} (Shade)`,
								color: shade.value,
							});
						});
					}

					// Tints
					if (color.isTints && color.tints?.length) {
						color.tints.forEach((tint) => {
							const tintVarName = `--${variablePrefix}${tint.name}`;
							items.push({
								label: tintVarName,
								type: "variable",
								apply: `var(${tintVarName})`,
								detail: `Color System - ${group.name} (Tint)`,
								color: tint.value,
							});
						});
					}

					// Transparent variants
					if (color.transparent && color.transparentVariables?.length) {
						color.transparentVariables.forEach((transValue) => {
							const transVarName = `--${variablePrefix}${color.name}-${transValue}`;
							items.push({
								label: transVarName,
								type: "variable",
								apply: `var(${transVarName})`,
								detail: `Color System - ${group.name} (Alpha: ${transValue}%)`,
								color: color.value,
							});
						});
					}
				});
			});
		}

		// Remove duplicates
		const uniqueItems = items.filter(
			(item, index, self) => index === self.findIndex((i) => i.label === item.label && i.type === item.type),
		);

		return uniqueItems;
	}, [
		preset,
		colorStyles,
		typographyStyles,
		spacingStyles,
		layoutsStyles,
		designStyles,
		componentsStyles,
		typographyData,
		spacingData,
		colorSystemData,
	]);

	return autocompleteData;
}
