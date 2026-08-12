import { getSelectorString } from "./selectorUtils";
import { ComponentData } from "../types";

const getComponentComment = (isAddGroupComments: boolean | undefined) =>
	isAddGroupComments
		? [
				{
					id: "cs-c",
					selector: `/* Components */`,
					declarations: [],
				},
		  ]
		: [];

interface IGenerateComponentsObjects {
	readonly componentsData: ComponentData;
	readonly is_add_group_comments: boolean | undefined;
	readonly includeVariants?: boolean;
}

export const generateComponentsObjects = ({
	componentsData,
	is_add_group_comments,
	includeVariants,
}: IGenerateComponentsObjects) => {
	const { components } = componentsData;

	if (!components?.length || componentsData?.isDisabled) {
		return [];
	}

	const cssObjects: CssObject[] = [];

	Object.values(components).forEach((component) => {
		const { variants, selector: mainSelector, type } = component;

		variants?.map((variant, index) => {
			if (includeVariants && index !== 0) return;

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
				...(includeVariants ? { types: ["class", "component"], groupName: type } : {}),
			});
		});
	});

	return [...getComponentComment(is_add_group_comments), ...cssObjects];
};
