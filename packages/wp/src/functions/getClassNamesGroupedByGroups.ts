import { generateColorSystemObjects } from "components/modules/colorSystem/functions/generateColorSystemObjects";
import { generateComponentsObjects } from "components/modules/components/functions/generateComponentsObjects";
import { generateSpacingObjects } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { generateFluidTypographyObjects } from "components/modules/typography/functions/getFluidTypeVariables";
import { DEFAULT_MIN_SCREEN_WIDTH } from "data/defaults";

function removePseudoClasses(selector: string): string {
	return selector.split(":")[0];
}

function extractClassNames(selector: string, classPrefix: string): string[] {
	const acc: string[] = [];

	if (!selector.startsWith(".")) {
		return acc;
	}

	for (const className of selector.split(" ")) {
		if (!className.startsWith(".")) {
			continue;
		}

		const _className = className.slice(1);

		if (!_className.includes(".")) {
			acc.push(classPrefix + removePseudoClasses(_className));
			continue;
		}

		for (const _className of className.split(".")) {
			if (!_className) {
				continue;
			}

			acc.push(removePseudoClasses(_className));
		}
	}

	return acc;
}

export const getClassNamesGroupedByGroups = (preset: Preset) => {
	const classNames: Record<Exclude<StylesheetDataKeys, "fontsStyles" | "stylesheetsStyles">, Record<string, string[]>> = {
		colorStyles: {},
		typographyStyles: {},
		spacingStyles: {},
		layoutsStyles: {},
		designStyles: {},
		componentsStyles: {},
		otherStyles: {},
	};

	const stylesSheetData = preset?.styleSheetData ?? {};

	const { root_font_size, min_screen_width, max_screen_width, is_rem } = preset.preferences;
	const classPrefix = preset.classPrefix ?? "";

	let colorSystemObjects: ReturnType<typeof generateColorSystemObjects> | undefined;

	if (preset?.modulesData?.COLOR_SYSTEM) {
		colorSystemObjects = generateColorSystemObjects({
			formData: preset.modulesData.COLOR_SYSTEM,
		});
	}

	if (colorSystemObjects && Array.isArray(colorSystemObjects)) {
		const colorSystemClasses = colorSystemObjects
			.filter(({ selector }) => selector.startsWith("."))
			.map(({ selector }) => classPrefix + selector.slice(1));

		const uniqueColorSystemClasses = [...new Set(colorSystemClasses)];

		const bordersGroupName = "Border Colors";
		const backgroundsGroupName = "Backgrounds";
		const textGroupName = "Text Colors";

		const [bordersClasses, backgroundsClasses, textClasses]: [string[], string[], string[]] = [[], [], []];

		for (const className of uniqueColorSystemClasses) {
			if (className.includes("border")) {
				bordersClasses.push(className);
			}

			if (className.includes("bg")) {
				backgroundsClasses.push(className);
			}

			if (className.includes("text")) {
				textClasses.push(className);
			}
		}

		if (!classNames.colorStyles[backgroundsGroupName] && backgroundsClasses.length) {
			classNames.colorStyles[backgroundsGroupName] = backgroundsClasses;
		}

		if (classNames.colorStyles[backgroundsGroupName] && backgroundsClasses.length) {
			classNames.colorStyles[backgroundsGroupName].push(...backgroundsClasses);
		}

		if (!classNames.colorStyles[textGroupName] && textClasses.length) {
			classNames.colorStyles[textGroupName] = textClasses;
		}

		if (classNames.colorStyles[textGroupName] && textClasses.length) {
			classNames.colorStyles[textGroupName].push(...textClasses);
		}

		if (!classNames.colorStyles[bordersGroupName] && bordersClasses.length) {
			classNames.colorStyles[bordersGroupName] = bordersClasses;
		}

		if (classNames.colorStyles[bordersGroupName] && bordersClasses.length) {
			classNames.colorStyles[bordersGroupName].push(...bordersClasses);
		}
	}

	const gapGroup = ["Gaps", "gap-"];
	const paddingsGroupName = ["Paddings", "padding-"];
	const marginsGroupName = ["Margins", "margin-"];

	let fluidSpacingObjects: ReturnType<typeof generateSpacingObjects> | undefined;

	if (preset?.modulesData?.FLUID_SPACING) {
		fluidSpacingObjects = generateSpacingObjects({
			formData: preset.modulesData.FLUID_SPACING,
			min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
			max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
			is_rem: is_rem ?? true,
			root_font_size: root_font_size || 16,
			is_add_group_comments: false,
		});
	}

	if (fluidSpacingObjects && Array.isArray(fluidSpacingObjects)) {
		const fluidSpacingClasses = fluidSpacingObjects
			.filter(({ selector }) => selector.startsWith("."))
			.map(({ selector }) => classPrefix + selector.slice(1));

		const uniqueFluidSpacingClasses = [...new Set(fluidSpacingClasses)];

		const [gapsClasses, paddingsClasses, marginsClasses]: [string[], string[], string[]] = [[], [], []];

		for (const className of uniqueFluidSpacingClasses) {
			const spacingClassData = fluidSpacingObjects.find((spacingObj) => {
				return spacingObj.selector.includes(className);
			});
			const property = spacingClassData?.declarations[0].property as string;

			if (!property) continue;

			if (className.includes(gapGroup[1]) || property.includes(gapGroup[1].replace("-", ""))) {
				gapsClasses.push(className);
			}

			if (
				className.includes(paddingsGroupName[1]) ||
				property.includes(paddingsGroupName[1].replace("-", ""))
			) {
				paddingsClasses.push(className);
			}

			if (
				className.includes(marginsGroupName[1]) ||
				property.includes(marginsGroupName[1].replace("-", ""))
			) {
				marginsClasses.push(className);
			}
		}

		if (!classNames.spacingStyles[gapGroup[0]] && gapsClasses.length) {
			classNames.spacingStyles[gapGroup[0]] = gapsClasses;
		}

		if (classNames.spacingStyles[gapGroup[0]] && gapsClasses.length) {
			classNames.spacingStyles[gapGroup[0]].push(...gapsClasses);
		}

		if (!classNames.spacingStyles[paddingsGroupName[0]] && paddingsClasses.length) {
			classNames.spacingStyles[paddingsGroupName[0]] = paddingsClasses;
		}

		if (classNames.spacingStyles[paddingsGroupName[0]] && paddingsClasses.length) {
			classNames.spacingStyles[paddingsGroupName[0]].push(...paddingsClasses);
		}

		if (!classNames.spacingStyles[marginsGroupName[0]] && marginsClasses.length) {
			classNames.spacingStyles[marginsGroupName[0]] = marginsClasses;
		}

		if (classNames.spacingStyles[marginsGroupName[0]] && marginsClasses.length) {
			classNames.spacingStyles[marginsGroupName[0]].push(...marginsClasses);
		}
	}

	let fluidTypographyObjects: ReturnType<typeof generateFluidTypographyObjects> | undefined;

	if (preset?.modulesData?.FLUID_TYPOGRAPHY) {
		fluidTypographyObjects = generateFluidTypographyObjects({
			formData: preset.modulesData.FLUID_TYPOGRAPHY,
			min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
			max_screen_width: max_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
			is_rem: is_rem ?? true,
			root_font_size: root_font_size || 16,
			is_add_group_comments: false,
		});
	}

	if (fluidTypographyObjects && Array.isArray(fluidTypographyObjects)) {
		const fluidTypographyClasses = fluidTypographyObjects
			.filter(({ selector }) => selector.startsWith("."))
			.map(({ selector }) => classPrefix + selector.slice(1));

		const uniqueFluidTypographyClasses = [...new Set(fluidTypographyClasses)];

		const groupName = "Fluid Typography";

		if (!classNames.typographyStyles[groupName]) {
			classNames.typographyStyles[groupName] = uniqueFluidTypographyClasses;
		}

		if (classNames.typographyStyles[groupName]) {
			classNames.typographyStyles[groupName].push(...uniqueFluidTypographyClasses);
		}
	}

	let componentsObjects: ReturnType<typeof generateComponentsObjects> | undefined;

	if (preset?.modulesData?.COMPONENTS) {
		componentsObjects = generateComponentsObjects({
			componentsData: preset.modulesData.COMPONENTS,
			is_add_group_comments: false,
		});
	}

	if (componentsObjects && Array.isArray(componentsObjects)) {
		const componentClasses = componentsObjects
			.filter(({ selector }) => selector.startsWith("."))
			.map(({ selector }) => extractClassNames(selector, classPrefix))
			.flat();

		const uniqueComponentClasses = [...new Set(componentClasses)];
		const groupName = "Components Editor";

		if (!classNames.componentsStyles[groupName]) {
			classNames.componentsStyles[groupName] = uniqueComponentClasses;
		}

		if (classNames.componentsStyles[groupName]) {
			classNames.componentsStyles[groupName].push(...uniqueComponentClasses);
		}
	}

	for (const [key, styles] of Object.entries(stylesSheetData)) {
		for (const group of styles) {
			if (group?.isDisabled || !group?.cssObjects.length) {
				continue;
			}

			const groupClassNames = group.cssObjects
				.filter(({ selector }) => selector.startsWith("."))
				.map(({ selector }) => {
					const classNameWithoutDot = selector.slice(1);
					return `${classPrefix}${classNameWithoutDot}`;
				});

			const groupName = group.name;

			if (!groupClassNames.length) {
				continue;
			}

			if (!classNames[key as keyof typeof classNames][groupName]) {
				classNames[key as keyof typeof classNames][groupName] = groupClassNames;
			}

			if (classNames[key as keyof typeof classNames][groupName]) {
				classNames[key as keyof typeof classNames][groupName].push(...groupClassNames);
			}
		}
	}

	return classNames;
};
