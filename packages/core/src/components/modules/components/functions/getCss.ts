import { getSelectorString } from "./selectorUtils";
import { DEFAULT_COMPONENTS_STATE } from "../data/constants";
import { Component } from "../types";
import { cssGenerator } from "cssGenerator";
import { CssGeneratorOptions } from "cssGenerator/cssGenerator";

export { getPseudoSelector } from "./selectorUtils";

const cssGeneratorOptions: Partial<CssGeneratorOptions> = {
	format: true,
	combineSelectors: false,
	propertyValidation: false,
	valueValidation: false,
};

export const getCss = (component: Component) => {
	const { variants, selector: mainSelector } = component;

	const cssObjects: CssObject[] = [];

	variants?.map((variant, index) => {
		const parent = component.variants?.find((v) => v.id === variant.parentId);
		const selector = getSelectorString({
			mainSelector,
			variant,
			parentVariant: parent,
		});

		cssObjects.push({
			selector,
			declarations: variant?.declarations,
			id: `c-${component.id}-${index}`,
		});
	});

	return cssGenerator({
		cssObjects,
		options: cssGeneratorOptions,
	});
};

const getPseudo = (type: string) => (["before", "after"].includes(type) ? `::${type}` : "");

interface IGetPreviewCss {
	readonly mainSelector: string;
	readonly variants: ComponentVariant[];
	readonly selectedVariant: ComponentVariant | undefined;
	readonly parentVariant: ComponentVariant | undefined;
	readonly mainVariant: ComponentVariant | undefined;
}

export const getEditorCss = async ({
	mainSelector,
	selectedVariant,
	variants,
	parentVariant,
	mainVariant,
}: IGetPreviewCss) => {
	if (!selectedVariant) {
		return "";
	}

	const isMain = selectedVariant === mainVariant;
	const isStateOfMainVariant =
		(selectedVariant?.parentId === mainVariant?.id ||
			selectedVariant?.parentId === DEFAULT_COMPONENTS_STATE) &&
		!["variant", "custom"].includes(selectedVariant?.type);
	const isVariant = selectedVariant?.type === "variant" && selectedVariant?.parentId === mainVariant?.id;
	const isStateOfVariant =
		(selectedVariant?.parentId === parentVariant?.id ||
			selectedVariant?.parentId === DEFAULT_COMPONENTS_STATE) &&
		!["variant", "custom"].includes(selectedVariant?.type);
	const isCustom = selectedVariant?.type === "custom";
	const isStateOfCustom =
		(selectedVariant?.parentId === parentVariant?.id ||
			selectedVariant?.parentId === DEFAULT_COMPONENTS_STATE) &&
		!["variant", "custom"].includes(selectedVariant?.type);

	let cssObjects: CssObject[] = [];

	switch (true) {
		case isMain: {
			const mainObject = {
				selector: mainSelector,
				declarations: mainVariant?.declarations ?? [],
				id: "cv-main",
			};
			const statesOfMainObject = variants.filter(
				(variant) =>
					(variant.parentId === mainVariant?.id &&
						variant.type !== "variant" &&
						variant.type !== "custom" &&
						variant.type !== "default") ||
					["before", "after", "checked"].includes(variant.type) ||
					variant.variantSelector?.includes("checked"),
			);

			const variantsCssObjects = statesOfMainObject.map((variant) => {
				const selector = getSelectorString({
					mainSelector,
					variant,
					parentVariant,
				});

				return {
					selector,
					declarations: variant.declarations,
					id: `cv-${variant.id}`,
				};
			});

			cssObjects = [mainObject, ...variantsCssObjects];

			break;
		}
		case isStateOfMainVariant: {
			const mainObject = {
				selector: mainSelector,
				declarations: mainVariant?.declarations ?? [],
				id: "cv-main",
			};

			const selectedStateCssObject = {
				selector: `${mainSelector}${getPseudo(selectedVariant?.type)}`,
				declarations: selectedVariant?.declarations ?? [],
				id: `cv-${selectedVariant?.id}`,
			};

			const statesOfMainObject = variants.filter(
				(variant) =>
					(["before", "after"].includes(variant.type) && selectedVariant?.type === "checked") ||
					(selectedVariant.type === "checked" && variant.variantSelector?.includes("checked")),
			);

			const variantsCssObjects = statesOfMainObject.map((variant) => {
				const selector = getSelectorString({
					mainSelector,
					variant,
					parentVariant,
				});

				return {
					selector,
					declarations: variant.declarations,
					id: `cv-${variant.id}`,
				};
			});

			cssObjects = [mainObject, selectedStateCssObject, ...variantsCssObjects];

			break;
		}
		case isVariant: {
			const mainObject = {
				selector: mainSelector,
				declarations: mainVariant?.declarations ?? [],
				id: "cv-main",
			};

			const selectedVariantCssObject = {
				selector: `${mainSelector}${selectedVariant?.variantSelector}${getPseudo(selectedVariant?.type)}`,
				declarations: selectedVariant?.declarations ?? [],
				id: `cv-${selectedVariant?.id}`,
			};

			const statesOfVariantCssObject = variants
				.filter(
					(variant) =>
						(variant.parentId === selectedVariant?.id &&
							variant.type !== "variant" &&
							variant.type !== "custom" &&
							variant.type !== "default") ||
						["before", "after"].includes(variant.type) ||
						selectedVariant.variantSelector?.includes(variant.type) ||
						(selectedVariant.type === "checked" && variant.variantSelector?.includes("checked")),
				)
				.map((variant) => {
					const selector = getSelectorString({
						mainSelector,
						variant,
						parentVariant,
					});

					return {
						selector,
						declarations: variant.declarations,
						id: `cv-${variant.id}`,
					};
				});

			const defaultComponentObject = variants.find((variant) => variant.type === "default") ?? undefined;
			const statesOfDefaultObject = variants.filter(
				(variant) =>
					variant.parentId === defaultComponentObject?.id &&
					variant.type !== "default" &&
					variant.type !== "variant",
			);
			const defaultStates = statesOfDefaultObject.map((variant) => {
				const selector = getSelectorString({
					mainSelector,
					variant,
					parentVariant: defaultComponentObject,
				});

				return {
					selector,
					declarations: variant.declarations,
					id: `cv-${variant.id}`,
				};
			});

			cssObjects = [mainObject, ...defaultStates, selectedVariantCssObject, ...statesOfVariantCssObject];

			break;
		}
		case isStateOfVariant: {
			const mainObject = {
				selector: mainSelector,
				declarations: mainVariant?.declarations ?? [],
				id: "cv-main",
			};

			const parentVariantCssObject = {
				selector: `${mainSelector}${parentVariant?.variantSelector}`,
				declarations: parentVariant?.declarations ?? [],
				id: `cv-${parentVariant?.id}`,
			};

			const selectedVariantCssObject = {
				selector: `${mainSelector}${parentVariant?.variantSelector}${getPseudo(selectedVariant?.type)}`,
				declarations: selectedVariant?.declarations ?? [],
				id: `cv-${selectedVariant?.id}`,
			};

			const defaultComponentObject = variants.find((variant) => variant.type === "default") ?? undefined;
			const statesOfDefaultObject = variants.filter(
				(variant) =>
					variant.parentId === defaultComponentObject?.id &&
					variant.type !== "default" &&
					variant.type !== "variant",
			);
			const defaultStates = statesOfDefaultObject.map((variant) => {
				const selector = getSelectorString({
					mainSelector,
					variant,
					parentVariant: defaultComponentObject,
				});

				return {
					selector,
					declarations: variant.declarations,
					id: `cv-${variant.id}`,
				};
			});

			cssObjects = [mainObject, ...defaultStates, parentVariantCssObject, selectedVariantCssObject];

			break;
		}
		case isCustom: {
			const customObject = {
				selector: selectedVariant?.variantSelector ?? "",
				declarations: selectedVariant?.declarations ?? [],
				id: `cv-${selectedVariant?.id}`,
			};

			const statesOfCustomObject = variants
				.filter(
					(variant) =>
						variant.parentId === selectedVariant?.id &&
						variant.type !== "variant" &&
						variant.type !== "custom" &&
						variant.type !== "default",
				)
				.map((variant) => {
					const selector = getSelectorString({
						mainSelector,
						variant,
						parentVariant,
					});

					return {
						selector,
						declarations: variant.declarations,
						id: `cv-${variant.id}`,
					};
				});

			cssObjects = [customObject, ...statesOfCustomObject];

			break;
		}
		case isStateOfCustom: {
			const customObject = {
				selector: parentVariant?.variantSelector ?? "",
				declarations: parentVariant?.declarations ?? [],
				id: `cv-${parentVariant?.id}`,
			};

			const selectedStateOfCustomObject = {
				selector: `${selectedVariant?.variantSelector ?? ""}${getPseudo(selectedVariant?.type)}`,
				declarations: selectedVariant?.declarations ?? [],
				id: `cv-${selectedVariant?.id}`,
			};

			cssObjects = [customObject, selectedStateOfCustomObject];

			break;
		}
	}

	return await cssGenerator({
		cssObjects,
		options: cssGeneratorOptions,
	});
};
