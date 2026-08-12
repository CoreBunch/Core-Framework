import { AVAILABLE_VARIANTS_WITHOUT_VARIANT, DEFAULT_COMPONENTS_STATE } from "../data/constants";

export const getPseudoSelector = (state: string) =>
	state === DEFAULT_COMPONENTS_STATE ? "" : ["before", "after"].includes(state) ? `::${state}` : `:${state}`;

interface IGetStateLabel {
	readonly mainSelector: string;
	readonly variant: ComponentVariant | undefined;
	readonly parentVariant: ComponentVariant | undefined;
}

export const getSelectorString = ({ mainSelector, variant, parentVariant }: IGetStateLabel) => {
	const createSelector = (mainSelector2: string) => {
		if (!variant) {
			return mainSelector2;
		}

		if (variant?.type === "custom") {
			return variant?.variantSelector ?? "";
		}

		if (parentVariant?.type === "custom") {
			return `${parentVariant?.variantSelector ?? ""}${
				AVAILABLE_VARIANTS_WITHOUT_VARIANT.includes(variant?.type ?? "") ? `:${variant?.type}` : ""
			}`;
		}

		const hasParentVariantDifferentFromMain =
			parentVariant?.type !== DEFAULT_COMPONENTS_STATE && parentVariant;

		if (hasParentVariantDifferentFromMain) {
			return `${mainSelector2}${parentVariant?.variantSelector ?? ""}${
				AVAILABLE_VARIANTS_WITHOUT_VARIANT.includes(variant?.type ?? "") ? `:${variant?.type}` : ""
			}`;
		}

		if (variant?.type === "variant") {
			return `${mainSelector2}${variant?.variantSelector ?? ""}`;
		}

		return `${mainSelector2}${getPseudoSelector(variant?.type)}`;
	};

	const isSpliitedByComma = mainSelector.includes(",");

	if (!isSpliitedByComma) {
		return createSelector(mainSelector);
	}

	const selectors = mainSelector
		.trim()
		.split(",")
		.map((selector) => selector.trim())
		.filter(Boolean)
		.filter((selector) => selector !== ".");

	return selectors.map((selector) => createSelector(selector)).join(", ");
};
