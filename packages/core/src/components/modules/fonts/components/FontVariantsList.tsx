import React from "react";
import { ClassHeader } from "components/ClassHeader";
import { FontData, FontVariantData } from "../types";
import { FontVariantsItem } from "./FontVariantsItem";

interface IFontVariantsListProps {
	selectedFont: FontData;
	toggleVariant: (variant: string) => void;
	selectedVariants: string[];
	onEditFontVariant: (variantId: string, propName: string, value: string) => void;
}

export function FontVariantsList({
	selectedVariants,
	selectedFont,
	toggleVariant,
	onEditFontVariant,
}: IFontVariantsListProps) {
	return (
		<>
			<ClassHeader type="font-variants" />
			<ul className="grid border-primary radius relative">
				{selectedFont?.variants?.map((variant: FontVariantData) => (
					<FontVariantsItem
						key={variant.id}
						selectedFont={selectedFont}
						variant={variant}
						selectedVariants={selectedVariants}
						onEditFontVariant={onEditFontVariant}
						toggleVariant={toggleVariant}
					/>
				))}
			</ul>
		</>
	);
}
