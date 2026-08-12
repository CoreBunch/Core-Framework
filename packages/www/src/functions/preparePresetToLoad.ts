import { OldSpacingItem } from "../components/modules/spacing";
import { OldTypographyItem } from "../components/modules/typography";
import { DEFAULT_SPACING_NAME, DEFAULT_TYPOGRAPHY_NAME } from "../constants/modules";
import { DEFAULT_PRESET } from "../data/presets";
import { compare } from "compare-versions";
import { ulid } from "ulid";
import { compareVersion, withDevTimeLogger } from "utils";
import { DEFAULT_SHADES_COUNT } from "components/modules/colorSystem";
import { generateShades, generateTints } from "components/modules/colorSystem/functions/generateShadesTints";
import {
	COLUMN_LAYOUTS_GROUP_NAME,
	COLUMN_VARIABLES_GROUP_NAME,
	DEFAULT_PREFERENCES,
	SPACING_CALCULATOR_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "data/defaults";
import { APP_VERSION } from "constants/version";
import { devLog } from "./devLog";

interface addNewGroupsProps {
	preset: Preset;
	since: string;
	where: StylesheetDataKeys;
	placeAsLast: boolean;
	groups: Group;
}

function addNewGroups({ preset, since, where, placeAsLast, groups }: addNewGroupsProps): Preset {
	if (compare((preset?.app_version ?? APP_VERSION).replace("_default", ""), since, ">")) {
		return preset;
	}

	const styleSheetData = preset?.styleSheetData;

	if (!styleSheetData) {
		return preset;
	}

	let targetCategory = styleSheetData[where];
	if (!targetCategory) {
		targetCategory = [];
	}

	const alreadyHasThisGroup = targetCategory.some((group) => group?.id === groups?.id);

	if (alreadyHasThisGroup) {
		devLog(`Already has this group (since: ${since}, id: ${groups?.id})`);
		return preset;
	}

	const newGroups = placeAsLast ? [groups, ...targetCategory] : [...targetCategory, groups];

	devLog(`Polyfilled new groups (since: ${since}, id: ${groups?.id})`);

	return {
		...preset,
		styleSheetData: {
			...styleSheetData,
			[where]: newGroups,
		},
	};
}

export function prepareColorSystem(preset: Preset): Preset {
	const { modulesData, app_version } = preset;

	if (
		!app_version?.endsWith("_default") &&
		(compareVersion(app_version || "0.0.1", APP_VERSION) === 1 ||
			compareVersion(app_version || "0.0.1", APP_VERSION) === 0)
	) {
		return preset;
	}

	if (!modulesData) {
		return preset;
	}

	const colorSystemData = modulesData?.COLOR_SYSTEM;

	if (!colorSystemData) {
		return preset;
	}

	const groups = colorSystemData?.groups;

	if (!groups) {
		return preset;
	}

	const newGroups = groups.map((group) => {
		const { colors } = group;

		if (!colors) {
			return group;
		}

		const newColors = colors
			.map((color) => {
				if (!color?.shadesNumber && color?.isShades) {
					const shades = generateShades({
						midColor: color.value,
						number: DEFAULT_SHADES_COUNT,
						name: color.name,
					});

					devLog(`Polyfilled shades (id: ${color.id})`);

					color = {
						...color,
						shadesNumber: DEFAULT_SHADES_COUNT,
						shades,
					};
				}

				if (!color.shades && color.isShades && color.shadesNumber) {
					const shades = generateShades({
						midColor: color.value,
						number: color.shadesNumber,
						name: color.name,
					});

					color = {
						...color,
						shades,
					};

					devLog(`Polyfilled shades (id: ${color.id})`);
				}

				if (!color.tints && color.isTints && color.tintsNumber) {
					const tints = generateTints({
						midColor: color.value,
						number: color.tintsNumber,
						name: color.name,
					});

					color = {
						...color,
						tints,
					};

					devLog(`Polyfilled tints (id: ${color.id})`);
				}

				if (!color.tints && color.isTints && color.tintsNumber) {
					const tints = generateTints({
						midColor: color.value,
						number: color.tintsNumber,
						name: color.name,
					});

					devLog(`Polyfilled tints (id: ${color.id})`);

					return {
						...color,
						tints,
					};
				}

				return color;
			})
			.filter(Boolean);

		return {
			...group,
			colors: newColors,
		};
	});

	return {
		...preset,
		modulesData: {
			...modulesData,
			COLOR_SYSTEM: {
				...colorSystemData,
				groups: newGroups,
			},
		},
	};
}

interface IPolyfillPreferences {
	readonly preset: WithOptionalProperty<Preset, "preferences">;
	readonly preferences?: PresetPreferences;
}

function polyfillPreferences({ preset, preferences }: IPolyfillPreferences): Preset {
	if (preset.preferences) {
		return preset as Preset;
	}

	const propertiesToTransfer = [
		"root_font_size",
		"is_rem",
		"postcss",
		"min_screen_width",
		"max_screen_width",
	];

	if (!preset.preferences) {
		preset.preferences = {} as PresetPreferences;
	}

	for (const _property of propertiesToTransfer) {
		const property = _property as keyof typeof DEFAULT_PREFERENCES;
		if (preferences?.[property]) {
			// @ts-ignore
			preset.preferences[property] = preferences[property as keyof typeof preferences];

			devLog(`Polyfilled preset preferences - property: ${property}`);
		} else {
			// @ts-ignore
			preset.preferences[property] = DEFAULT_PREFERENCES[property as keyof typeof DEFAULT_PREFERENCES];

			devLog(`Polyfilled preset preferences -  property: ${property} [DEFAULT]`);
		}
	}

	return preset as Preset;
}

function polyfillComponentsVariants(preset: Preset): Preset {
	const modulesData = preset.modulesData;

	if (!modulesData) {
		return preset;
	}

	const componentsData = modulesData?.COMPONENTS;

	if (!componentsData) {
		return preset;
	}

	const components = componentsData.components;

	if (components.some((component) => component.variants)) {
		return preset;
	}

	const newComponents = components.map((component) => {
		const { selector } = component;

		const declarations = component?.declarations;

		if (!declarations) {
			return component;
		}

		const indexOfMainVariant = Object.keys(declarations).indexOf("default");

		const variants = Object.keys(declarations).map((variant, index) => {
			const isThisMainVariant = indexOfMainVariant === index;

			const key = Object.keys(declarations)[index];

			let type = "custom";
			let variantSelector = "";
			let parentId: string | undefined = "default";

			if (key === "default") {
				type = "default";
			}

			const isPsuedo = ["hover", "focus", "active", "disabled", "checked", "invalid"].some((psuedo) =>
				key.includes(psuedo),
			);

			if (isPsuedo) {
				type = key;
			}

			const isVariant =
				key.startsWith(selector) &&
				!isPsuedo &&
				(key.match(/\./g) || []).length === 2 &&
				!key.trim().includes(" ");

			if (isVariant) {
				const secondSelector = key.replace(selector, "").trim();
				variantSelector = secondSelector;
				type = "variant";
			}

			if (!isPsuedo && !isVariant && key !== "default") {
				type = "custom";
				variantSelector = key;
				parentId = undefined;
			}

			return {
				id: isThisMainVariant ? "default" : index.toString(),
				declarations: declarations[variant],
				type,
				parentId,
				...(variantSelector && {
					variantSelector,
				}),
			};
		});

		devLog(`Polyfilled variants (id: ${component.id})`);

		return {
			id: component.id,
			selector: component.selector,
			type: component.type,
			variants,
		};
	});

	return {
		...preset,
		modulesData: {
			...modulesData,
			COMPONENTS: {
				...componentsData,
				components: newComponents,
			},
		},
	};
}

function replaceIncorrectColumnClasses(preset: Preset): Preset {
	if (compare((preset?.app_version ?? APP_VERSION).replace("_default", ""), "1.2.4", ">")) {
		return preset;
	}

	const layouts = preset?.styleSheetData?.layoutsStyles;

	if (!layouts) {
		return preset;
	}

	const targetGroup = layouts?.find((group) => group?.id === "3");

	const newCssObjects = targetGroup?.cssObjects?.map((cssObject) => {
		if (
			cssObject?.selector === ".columns-2--on-m" &&
			cssObject?.id === "01GWSGG5YMNP37E37W4KMTSTDE" &&
			JSON.stringify(cssObject?.declarations) ===
				JSON.stringify([
					{
						property: "grid-template-columns",
						value: "repeat(3, 1fr)",
						fluidValue: [0, 0, "px"],
						id: "01GWSGFS118Y66C444FR3N2PRG",
					},
				])
		) {
			const declarations = [
				{
					property: "grid-template-columns",
					value: "repeat(2, 1fr)",
					fluidValue: [0, 0, "px"],
					id: "01GWSGFS118Y66C444FR3N2PRG",
				},
			];

			return {
				...cssObject,
				declarations,
			};
		}

		if (
			cssObject?.selector === ".columns-2--on-s" &&
			cssObject?.id === "01GWSGP1PG7S04VDZ0D5YVCRFM" &&
			JSON.stringify(cssObject?.declarations) ===
				JSON.stringify([
					{
						property: "grid-template-columns",
						value: "repeat(3, 1fr)",
						fluidValue: [0, 0, "px"],
						id: "01GWSGNGWXZP9821GA21NNSEAM",
					},
				])
		) {
			const declarations = [
				{
					property: "grid-template-columns",
					value: "repeat(2, 1fr)",
					fluidValue: [0, 0, "px"],
					id: "01GWSGNGWXZP9821GA21NNSEAM",
				},
			];

			return {
				...cssObject,
				declarations,
			};
		}

		return cssObject;
	});

	if (!newCssObjects) {
		return preset;
	}

	devLog(`Polyfilled incorrect column classes '.columns-2--on-m' and '.columns-2--on-s'`);

	return {
		...preset,
		styleSheetData: {
			...preset.styleSheetData,
			layoutsStyles: layouts?.map((group) => {
				if (group?.id === "3") {
					return {
						...group,
						cssObjects: newCssObjects,
					};
				}

				return group;
			}),
		},
	};
}

function replaceIncorrectBoldClass(preset: Preset): Preset {
	if (compare((preset?.app_version ?? APP_VERSION).replace("_default", ""), "1.2.6", ">")) {
		return preset;
	}

	const typography = preset?.styleSheetData?.typographyStyles;

	if (!typography) {
		return preset;
	}

	const targetGroup = typography?.find((group) => group?.id === "1");

	const newCssObjects = targetGroup?.cssObjects?.map((cssObject) => {
		if (
			cssObject?.selector === ".bold" &&
			cssObject?.id === "01H5YTK2FBN5MMN289XVEP9SY4" &&
			JSON.stringify(cssObject?.declarations) ===
				JSON.stringify([
					{
						property: "font-style",
						value: "bold",
						fluidValue: [0, 0, "px"],
						id: "01GTC7JNS21M04S04HPDHGKTHD",
					},
				])
		) {
			const declarations = [
				{
					property: "font-weight",
					value: "bold",
					fluidValue: [0, 0, "px"],
					id: "01GTC7JNS21M04S04HPDHGKTHD",
				},
			];

			return {
				...cssObject,
				declarations,
			};
		}

		return cssObject;
	});

	if (!newCssObjects) {
		return preset;
	}

	devLog(`Polyfilled incorrect bold class '.bold'`);

	return {
		...preset,
		styleSheetData: {
			...preset.styleSheetData,
			typographyStyles: typography?.map((group) => {
				if (group?.id === "1") {
					return {
						...group,
						cssObjects: newCssObjects,
					};
				}

				return group;
			}),
		},
	};
}

interface IPreparePresetToLoad {
	readonly preset: WithOptionalProperty<MixedPreset, "preferences">;
	readonly oldPreferences?: LocalPreferences | undefined;
}

export function preparePresetToLoad({ preset, oldPreferences: preferences }: IPreparePresetToLoad): Preset {
	const t1 = performance.now();
	const convertedPreset = withDevTimeLogger(convertModulesDataToArray)(preset as Preset);

	let newPreset = withDevTimeLogger(polyfillPreferences)({
		preferences,
		preset: convertedPreset,
	});
	newPreset = withDevTimeLogger(prepareColorSystem)(newPreset);
	newPreset = withDevTimeLogger(replaceIncorrectColumnClasses)(newPreset);
	newPreset = withDevTimeLogger(replaceIncorrectBoldClass)(newPreset);
	newPreset = withDevTimeLogger(polyfillComponentsVariants)(newPreset);

	devLog(`Prepared preset to load in ${performance.now() - t1}ms`);

	return newPreset;
}

export function convertModulesDataToArray(preset: Preset) {
	let updatedPreset: Preset = { ...preset };

	updatedPreset = convertModuleData(updatedPreset, "FLUID_TYPOGRAPHY", DEFAULT_TYPOGRAPHY_NAME);
	updatedPreset = convertModuleData(updatedPreset, "FLUID_SPACING", DEFAULT_SPACING_NAME);
	updatedPreset = updateStyleSheetData(updatedPreset);

	return updatedPreset;
}

function convertModuleData(
	preset: Preset,
	moduleKey: "FLUID_TYPOGRAPHY" | "FLUID_SPACING",
	defaultName: string,
): Preset {
	const moduleData = preset.modulesData?.[moduleKey];
	const shouldBeConverted = !moduleData?.groups?.length;

	if (!shouldBeConverted) return preset;

	const moduleItem =
		moduleData && "groups" in moduleData
			? moduleData.groups?.[0] ?? null
			: (moduleData as unknown as OldTypographyItem | OldSpacingItem);
	const isDisabled = !!moduleItem?.isDisabled || !!moduleData?.isDisabled;

	// Producing `{ groups: [], isDisabled: false }` is pathological — the
	// downstream UI assumes at least one group when the module is enabled and
	// crashes on `undefined.id`. If we have a usable legacy item, wrap it; if
	// the module is explicitly disabled, allow an empty groups array; otherwise
	// (enabled but no legacy data) seed the defaults so the module is never
	// simultaneously empty AND enabled.
	return {
		...preset,
		modulesData: {
			...preset.modulesData,
			[moduleKey]: {
				groups:
					!moduleItem?.isDisabled && moduleItem
						? [
								{
									...moduleItem,
									id: ulid(),
									name: defaultName,
								},
						  ]
						: isDisabled
						? []
						: moduleKey === "FLUID_TYPOGRAPHY"
						? [...TYPOGRAPHY_INITIAL_STATE.groups]
						: [...SPACING_CALCULATOR_INITIAL_STATE.groups],
				isDisabled: isDisabled,
			},
		},
	};
}

function updateStyleSheetData(preset: Preset): Preset {
	let updatedPreset = { ...preset };
	const typography = updatedPreset.modulesData?.FLUID_TYPOGRAPHY;
	const spacing = updatedPreset.modulesData?.FLUID_SPACING;

	const typographyGroups = typography?.groups || [];
	const spacingGroups = spacing?.groups || [];

	const typographyClassGenerator = typography?.has_legacy_manual_class_generator;
	const spacingClassGenerator = spacing?.has_legacy_manual_class_generator;

	// Typography
	if (
		typographyGroups.length &&
		typographyGroups.every((el) => el.genFontSizeClass !== undefined && !el.genFontSizeClass)
	) {
		updatedPreset = disableModuleClasses(updatedPreset, "FLUID_TYPOGRAPHY");
	}

	const isTypoGenPropsAvailable = typographyGroups?.some((el) => {
		return ["genSemanticVariables", "genFontSizeClass"].some((genProp) => el.hasOwnProperty(genProp));
	});

	if (isTypoGenPropsAvailable) {
		if (typographyGroups.some((el) => el.genSemanticVariables)) {
			updatedPreset.styleSheetData?.typographyStyles?.unshift(
				DEFAULT_PRESET.styleSheetData!.typographyStyles![0],
			);
		}

		typographyGroups.forEach((el) => {
			delete el.genFontSizeClass;
			delete el.semanticVariables;
			delete el.genSemanticVariables;
		});
	}

	const manualTypoGroups = typographyGroups.filter((el) => el.mode === "fluid_manual").map((el) => el.id);
	const manualTypoClasses = typography?.classes?.filter(
		(el) => el.tabId && manualTypoGroups.includes(el.tabId) && !el.isDisabled,
	);
	const spaceGenProps = ["genGap", "genSemanticVariables", "genMargin", "genPadding", "genAutoMargins"];

	if (manualTypoClasses?.length && typography) {
		typography.has_legacy_manual_class_generator =
			typeof typographyClassGenerator === "undefined"
				? !!manualTypoClasses?.length
				: typographyClassGenerator;
	}

	// Spacing
	if (spacingGroups.length) {
		if (spacingGroups.every((el) => el.genGap !== undefined && !el.genGap))
			updatedPreset = disableModuleClasses(updatedPreset, "FLUID_SPACING", [".gap"]);
		if (spacingGroups.every((el) => el.genPadding !== undefined && !el.genPadding))
			updatedPreset = disableModuleClasses(updatedPreset, "FLUID_SPACING", [".padding"]);
		if (spacingGroups.every((el) => el.genMargin !== undefined && !el.genMargin))
			updatedPreset = disableModuleClasses(updatedPreset, "FLUID_SPACING", [".margin"]);
	}

	const isSpaceGenPropsAvailable = spacingGroups?.some((el) =>
		spaceGenProps.some((genProp) => el.hasOwnProperty(genProp)),
	);

	if (isSpaceGenPropsAvailable) {
		if (spacingGroups.some((el) => el.genSemanticVariables)) {
			updatedPreset.styleSheetData?.spacingStyles?.unshift(DEFAULT_PRESET.styleSheetData!.spacingStyles![0]);
		}

		spacingGroups.forEach((el) => {
			delete el.genPadding;
			delete el.genGap;
			delete el.genMargin;
			delete el.genAutoMargins;
			delete el.semanticVariables;
			delete el.genSemanticVariables;
		});
	}

	const manualSpaceGroups = spacingGroups.filter((el) => el.mode === "fluid_manual").map((el) => el.id);
	const manualSpaceClasses = spacing?.classes?.filter(
		(el) => manualSpaceGroups.includes(el.tabId) && !el.isDisabled,
	);
	if (manualSpaceClasses?.length && spacing) {
		spacing.has_legacy_manual_class_generator =
			typeof spacingClassGenerator === "undefined" ? !!manualSpaceClasses?.length : spacingClassGenerator;
	}

	// Layouts
	if (!updatedPreset.has_updated_columns) {
		const columnsVariables = DEFAULT_PRESET.styleSheetData?.layoutsStyles?.find(
			(el) => el.name === COLUMN_VARIABLES_GROUP_NAME,
		);
		if (columnsVariables) updatedPreset.styleSheetData?.layoutsStyles?.unshift(columnsVariables);
		const columnLayoutsIndex = DEFAULT_PRESET.styleSheetData?.layoutsStyles?.findIndex(
			(el) => el.name === COLUMN_LAYOUTS_GROUP_NAME,
		);

		if (columnLayoutsIndex !== undefined && columnLayoutsIndex > -1) {
			updatedPreset.styleSheetData?.layoutsStyles?.[columnLayoutsIndex]?.cssObjects.forEach((el) => {
				if (el.selector?.startsWith(".columns-")) {
					const match = el.selector.match(/\d+/);
					const column = match ? parseInt(match[0], 10) : null;

					if (column) {
						el.declarations.forEach((declaration) => {
							if (declaration.property === "grid-template-columns") {
								declaration.value = `var(--columns-${column})`;
							}
						});
					}
				}

				return el;
			});
		}

		updatedPreset.has_updated_columns = true;
	}

	return updatedPreset;
}

function disableModuleClasses(
	preset: Preset,
	moduleKey: "FLUID_TYPOGRAPHY" | "FLUID_SPACING",
	prefixes?: string[],
): Preset {
	const module = preset.modulesData?.[moduleKey];
	// Don't fall back to initial state classes - use empty array if no classes exist
	// This prevents default tab IDs from being introduced
	const classes = (module?.classes ?? []).map((el) => {
		const validTabId = module?.groups?.some((group) => group.id === el.tabId)
			? el.tabId
			: module?.groups?.[0]?.id;

		return { ...el, tabId: validTabId };
	});

	return {
		...preset,
		modulesData: {
			...preset.modulesData,
			[moduleKey]: {
				...module!,
				classes: classes.map((el) => {
					if (prefixes) {
						return prefixes.some((prefix) => el.name.startsWith(prefix)) ? { ...el, isDisabled: true } : el;
					}
					return { ...el, isDisabled: true };
				}),
			},
		},
	};
}
