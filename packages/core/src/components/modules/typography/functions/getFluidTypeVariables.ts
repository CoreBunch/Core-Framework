import type { TypeScale, TypographyData, TypographyItem } from "../types";
import { ulid } from "ulid";
import { convertToDesiredUnit, convertToVariableDeclarationName, getVariableName } from "utils";
import { TYPOGRAPHY_INITIAL_STATE } from "data/defaults";
import { getCssForSingleTypeScale } from "./getCssForSingleTypeScale";
import { getTypeScale } from "./getTypeScale";

const getTypoComment = (isAddGroupComments: boolean | undefined) =>
	isAddGroupComments
		? [
				{
					id: "cs-c",
					selector: `/* Fluid Typography */`,
					declarations: [],
				},
		  ]
		: [];

interface IGenerateFontSizeClassesForManualFluidTypography {
	readonly id: string;
	readonly manualSizes: WithRequiredProperty<TypographyData["groups"][0], "manualSizes">["manualSizes"];
	readonly data: TypographyData;
	readonly includeVariants?: boolean;
}

function generateFontSizeClassesForManualFluidTypography({
	id,
	manualSizes,
	data,
	includeVariants,
}: IGenerateFontSizeClassesForManualFluidTypography): CssObject[] {
	if (!manualSizes.length) return [];

	const classes: CssObject[] = [];

	data.classes?.map(({ isDisabled, property, tabId, name }) => {
		if (isDisabled) return;

		const validTabId = id === tabId ? tabId : "";
		if (id !== validTabId) return;

		const group = data.groups.find((el) => el.id === validTabId);
		const steps = group?.steps?.split(",");

		steps?.map((size, idx) => {
			if (idx >= manualSizes.length) return null;

			const className = name.replace("*", size);
			const sizeValue = manualSizes[idx];
			const value = `var(--${sizeValue.name})`;

			classes.push({
				id: className,
				selector: className,
				declarations: property.map((prop, propIdx) => ({
					id: (propIdx + 1).toString(),
					property: prop,
					value: value,
				})),
				...(includeVariants ? { types: ["class", "typo-class"], groupName: group?.name ?? "" } : {}),
			});
		});
	});

	return classes;
}

interface IGenerateManualFluidTypographyObjects {
	readonly typographyState: TypographyItem;
	readonly preferences: Partial<PresetPreferences>;
	readonly includeVariants?: boolean;
}

function generateManualFluidTypographyObjects({
	typographyState,
	preferences,
	includeVariants,
}: IGenerateManualFluidTypographyObjects): CssObject[] {
	const { isDisabled, manualSizes, id, name } = typographyState;

	if (!manualSizes?.length) return [];

	const CssDeclarations = manualSizes.map((size, index) => {
		const property = convertToVariableDeclarationName(size.name);
		const value = getCssForSingleTypeScale({
			minFontSize: Number(size.min),
			maxFontSize: Number(size.max),
			minScreenWidth: Number(preferences.min_screen_width),
			maxScreenWidth: Number(preferences.max_screen_width),
			isRem: Boolean(preferences.is_rem),
			rootFontSize: Number(preferences.root_font_size),
		});
		const id = `f_m_${index}}`;

		return {
			property,
			value,
			id,
			...(includeVariants ? { types: ["variable", "typo-variable"], groupName: name } : {}),
		};
	}) as CSSDeclaration[];

	const variables: CssObject = {
		selector: ":root",
		id: ulid(),
		declarations: isDisabled ? [] : CssDeclarations,
	};

	return [...getTypoComment(preferences.is_add_group_comments), variables];
}

function generateFontSizeClass(
	declarations: {
		[x: string]: Record<string, string>[];
	},
	data: TypographyData,
	includeVariants?: boolean,
) {
	if (!Object.values(declarations).length) return [];

	const classes: CssObject[] = [];

	data.classes?.map(({ tabId, name, isDisabled, property }) => {
		if (isDisabled) return;

		const validTabId = tabId && declarations[tabId] ? tabId : "";
		if (!validTabId || !declarations[validTabId]) return;

		const group = data.groups.find((el) => el.id === validTabId);
		const steps = group?.steps?.split(",");

		steps?.map((size, idx) => {
			const className = name.replace("*", size);
			const sizeValue = declarations[validTabId][idx];
			const varName = Object.keys(sizeValue)[0];
			const value = `var(${varName})`;

			classes.push({
				id: className,
				selector: className,
				declarations: property.map((prop, propIdx) => ({
					id: (propIdx + 1).toString(),
					property: prop,
					value: value,
				})),
				...(includeVariants ? { types: ["class", "typo-class"], groupName: group?.name ?? "" } : {}),
			});
		});
	});

	return classes;
}

const getStepAtIndex = (index: number, states: string) => {
	const steps = states.split(",");
	return steps[index];
};

interface IGetFluidTypeVariables {
	readonly typeScales: TypeScale[];
	readonly namingConvention: string;
	readonly steps: string;
	readonly targetUnit: string;
	readonly root_font_size: number;
}

const getFluidTypographyDeclaration = ({
	typeScales,
	namingConvention,
	steps,
	targetUnit,
	root_font_size,
}: IGetFluidTypeVariables) => {
	return typeScales.map(({ min, max, preferred }, index) => ({
		[getVariableName(namingConvention, String(getStepAtIndex(index, steps)))]: `clamp(${convertToDesiredUnit(
			Number(min),
			targetUnit,
			root_font_size,
		)}, calc(${[
			preferred.split(" + ")[0],
			convertToDesiredUnit(preferred.split(" + ")[1], targetUnit, root_font_size),
		].join(" + ")}), ${convertToDesiredUnit(max, targetUnit, root_font_size)})`,
	}));
};

interface IGenerateFluidTypographyObjects {
	readonly formData: TypographyData;
	readonly onlyVariables?: boolean;
	readonly root_font_size: number;
	readonly min_screen_width: number;
	readonly max_screen_width: number;
	readonly is_rem: boolean;
	readonly is_add_group_comments: boolean | undefined;
	readonly includeVariants?: boolean;
}

export function generateFluidTypographyObjects({
	formData,
	onlyVariables,
	root_font_size,
	min_screen_width,
	max_screen_width,
	is_rem,
	is_add_group_comments,
	includeVariants,
}: IGenerateFluidTypographyObjects): CssObject[] {
	const typeScales: TypeScale[] = [];
	const manualSizes: CssObject[] = [];
	const CSSDeclarations: { property: string; value: string; id: string }[] = [];
	const selectableCSSDeclarations: Record<string, Record<string, string>[]> = {};

	const { groups, has_legacy_manual_class_generator, classes } = formData;
	const manualClasses = classes?.filter(
		({ tabId, isDisabled }) =>
			groups.some(({ id, mode }) => id === tabId && mode === "fluid_manual") && !isDisabled,
	);

	if (has_legacy_manual_class_generator && manualClasses?.length) {
		const groupsForGenerate = groups.filter(({ id }) => manualClasses.some(({ tabId }) => tabId === id));

		for (const { id, manualSizes: groupManualSizes } of groupsForGenerate) {
			if (!groupManualSizes?.length) continue;
			const generatedClasses = generateFontSizeClassesForManualFluidTypography({
				id,
				manualSizes: groupManualSizes,
				data: formData,
			});
			manualSizes.push(...generatedClasses);
		}
	}

	for (const group of groups) {
		const { isDisabled, namingConvention, steps, mode, manualSizes: groupManualSizes, id } = group;

		if (isDisabled) continue;

		if (mode === "fluid_manual" && groupManualSizes?.length) {
			manualSizes.push(
				...generateManualFluidTypographyObjects({
					typographyState: group,
					preferences: {
						root_font_size,
						min_screen_width,
						max_screen_width,
						is_rem,
						is_add_group_comments,
					},
					includeVariants,
				}),
			);
		} else {
			const typeScale = getTypeScale({
				state: group,
				minScreenWidth: min_screen_width,
				maxScreenWidth: max_screen_width,
			});
			typeScales.push(...typeScale);

			const targetUnit = is_rem ? "rem" : "px";

			const declarations = typeScale.map(({ min, max, preferred }, index) => ({
				[getVariableName(
					namingConvention,
					String(getStepAtIndex(index, steps)),
				)]: `clamp(${convertToDesiredUnit(Number(min), targetUnit, root_font_size)}, calc(${[
					preferred.split(" + ")[0],
					convertToDesiredUnit(preferred.split(" + ")[1], targetUnit, root_font_size),
				].join(" + ")}), ${convertToDesiredUnit(max, targetUnit, root_font_size)})`,
			}));

			if (!selectableCSSDeclarations[id]) selectableCSSDeclarations[id] = [];
			selectableCSSDeclarations[id].push(...declarations);

			declarations.forEach((declaration) => {
				const property = Object.keys(declaration)[0];
				const value = declaration[property];

				CSSDeclarations.push({
					id: ulid(),
					property,
					value,
					...(includeVariants ? { types: ["variable", "typo-variable"], groupName: name } : {}),
				});
			});
		}
	}

	const variables: CssObject = {
		selector: ":root",
		id: "font-sizes-root",
		declarations: CSSDeclarations,
		...(includeVariants ? { types: ["variable"] } : {}),
	};

	if (onlyVariables) return [variables, ...manualSizes];

	const fluidSelectors = formData.classes?.some((item) => !item.isDisabled)
		? generateFontSizeClass(selectableCSSDeclarations, formData, includeVariants)
		: [];

	return [...getTypoComment(is_add_group_comments), ...fluidSelectors, variables, ...manualSizes];
}

interface IGenerateFluidTypographyResult {
	readonly typographyData?: TypographyData;
	readonly root_font_size: number;
	readonly is_rem: boolean;
	readonly min_screen_width: number;
	readonly max_screen_width: number;
}

export function generateFluidTypographyResult({
	typographyData = TYPOGRAPHY_INITIAL_STATE,
	root_font_size,
	is_rem,
	min_screen_width,
	max_screen_width,
}: IGenerateFluidTypographyResult) {
	const targetUnit = is_rem ? "rem" : "px";
	const declarations = [];
	const typeScales: TypeScale[] = [];

	for (const type of typographyData?.groups) {
		const { namingConvention, steps } = type;

		const scales: TypeScale[] = getTypeScale({
			state: type,
			minScreenWidth: min_screen_width,
			maxScreenWidth: max_screen_width,
		});

		const declars = getFluidTypographyDeclaration({
			typeScales: scales,
			namingConvention,
			steps,
			targetUnit,
			root_font_size,
		});

		typeScales.push(...scales);
		declarations.push(...declars);
	}

	return {
		typeScales,
		declarations,
	};
}

/**
 * This function is only used for tests @see fluidTypeScale.test.ts
 */
interface IGenerateFluidTypographyCss {
	readonly typographyData: TypographyData;
	readonly root_font_size: number;
	readonly is_rem: boolean;
	readonly min_screen_width: number;
	readonly max_screen_width: number;
}

export function generateFluidTypographyCss({
	typographyData,
	root_font_size,
	is_rem,
	min_screen_width,
	max_screen_width,
}: IGenerateFluidTypographyCss) {
	const targetUnit = is_rem ? "rem" : "px";
	const typeScales: TypeScale[] = [];
	const declarations = [];

	for (const type of typographyData.groups) {
		const { namingConvention, steps } = type;

		const scales = getTypeScale({
			state: type,
			minScreenWidth: min_screen_width,
			maxScreenWidth: max_screen_width,
		});

		const declars = getFluidTypographyDeclaration({
			typeScales: scales,
			namingConvention,
			steps,
			targetUnit,
			root_font_size,
		});

		typeScales.push(...scales);
		declarations.push(...declars);
	}

	return declarations
		.map((variable) => {
			const key = Object.keys(variable)[0];
			const value = variable[key];

			return `${key}: ${value};`;
		})
		.join("\n")
		.trim();
}
