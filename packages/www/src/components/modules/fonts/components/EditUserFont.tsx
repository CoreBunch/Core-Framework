import React, { useMemo, useState } from "react";
import { FontData, FontVariantData } from "@core-framework/core/components/modules/fonts/types";
import { generateFontFaceCSS } from "../utils/utils";
import { useAtom } from "jotai/index";
import { fontsDataAtom } from "../../../../state";
import { FontVariantsList } from "@core-framework/core/components/modules/fonts/components/FontVariantsList";
import { FontForm } from "@core-framework/core/components/modules/fonts/components/UI/FontForm";

interface IEditUserFontProps {
	font: FontData;
	googleFonts: FontData[];
	onFontEdit: (_: any, propName: string, value: string) => void;
}

export function EditUserFont({ googleFonts, font, onFontEdit }: IEditUserFontProps) {
	const [fontsFormData, setFontsFormData] = useAtom(fontsDataAtom);
	const selectedVariantsNames = useMemo(
		() =>
			font.variants.reduce((acc: string[], v: FontVariantData) => {
				return v.enable ? [...acc, v.id] : acc;
			}, []),
		[font.variants.reduce],
	);
	const [selectedVariants, setSelectedVariants] = useState(selectedVariantsNames);

	const onEditFontVariant = (variantId: string, propName: string, value: string): void => {
		const fonts = fontsFormData.fonts || [];
		const targetFontIndex = fonts.findIndex((fontObj: FontData) => font.id === fontObj.id);
		const updatedVariants = font?.variants.map((v: FontVariantData) => {
			return v.id === variantId ? { ...v, [propName]: value } : v;
		});
		const updatedFonts = [...fonts];

		updatedFonts[targetFontIndex].variants = updatedVariants;
		updatedFonts[targetFontIndex].cssPreview = generateFontFaceCSS(
			updatedFonts[targetFontIndex],
			selectedVariants,
		);
		setFontsFormData({ ...fontsFormData, fonts: updatedFonts });
	};

	const toggleVariant = (variant: string): void => {
		const fonts = fontsFormData.fonts || [];
		const targetFontIndex = fonts.findIndex((fontObj: FontData) => font.id === fontObj.id);
		const updatedVariantsNames = selectedVariants.includes(variant)
			? selectedVariants.filter((v: FontVariantData) => v !== variant)
			: [...selectedVariants, variant];
		const updatedFonts = [...fonts];

		updatedFonts[targetFontIndex].variants = updatedFonts[targetFontIndex].variants.map(
			(variant: FontVariantData) => {
				return updatedVariantsNames.includes(variant.id) ? variant : { ...variant, enable: false };
			},
		);
		updatedFonts[targetFontIndex].cssPreview = generateFontFaceCSS(
			updatedFonts[targetFontIndex],
			updatedVariantsNames,
		);
		setSelectedVariants(updatedVariantsNames);
		setFontsFormData({ ...fontsFormData, fonts: updatedFonts });
	};

	return (
		<>
			<FontForm font={font} googleFonts={googleFonts} onFontEdit={onFontEdit} />
			<div className="user-font-variants">
				<FontVariantsList
					selectedFont={font}
					toggleVariant={toggleVariant}
					selectedVariants={selectedVariants}
					onEditFontVariant={onEditFontVariant}
				/>
			</div>
		</>
	);
}
