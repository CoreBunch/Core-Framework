import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Back } from "../../../assets/icons/Back.icon";
import { GoogleFontLogo } from "../../../assets/icons/GoogleFontLogo.icon";
import { Plus } from "../../../assets/icons/Plus.icon";
import { ClassHeader } from "../../ClassHeader";
import clsx from "clsx";
import { useAtom } from "jotai/index";
import { fontsDataAtom } from "../../../state";
import { FontCodePreview } from "@core-framework/core/components/modules/fonts/components/FontCodePreview";
import { FontVariantsList } from "@core-framework/core/components/modules/fonts/components/FontVariantsList";
import { FontForm } from "@core-framework/core/components/modules/fonts/components/UI/FontForm";
import { FONT_DISPLAY_OPTIONS } from "@core-framework/core/components/modules/fonts/constants";
import { FontData, FontVariantData } from "@core-framework/core/components/modules/fonts/types";
import { applyFontToStylesheet, generateFontFaceCSS } from "./utils/utils";

enum Tabs {
	USER_FONTS = "user_fonts",
}

interface IImportGoogleFontsProps {
	googleFonts: FontFace[];
	setActiveTab: Dispatch<SetStateAction<string>>;
	selectedVariants: string[];
	setSelectedVariants: Dispatch<SetStateAction<string[]>>;
	toggleVariant: (variant: string) => void;
	downloadFontsLocally: (font: FontData) => Promise<void>;
}

export function ImportGoogleFonts({
	googleFonts,
	setActiveTab,
	setSelectedVariants,
	selectedVariants,
	downloadFontsLocally,
	toggleVariant,
}: IImportGoogleFontsProps) {
	const fontInitialData = {
		title: "",
		fontDisplay: FONT_DISPLAY_OPTIONS[0],
		customSelectors: "",
		customVariable: "",
	};
	const [selectedFont, setSelectedFont] = useState<FontData>(fontInitialData);
	const [fontsFormData] = useAtom(fontsDataAtom);

	const onGoogleFontEdit = useCallback(
		(_: any, propName: string, value: string): void => {
			if (propName === "family") {
				const fontData = googleFonts.find((font) => font.family === value) as FontData;
				applyFontToStylesheet(value);

				if (fontData) {
					const cssAdaptedVariants = fontData.variants.map((v: string) => {
						if (v.toLowerCase() === "italic") return "400italic";
						return v.toLowerCase() === "regular" ? "400" : v;
					});
					const parsedVariants = cssAdaptedVariants.map((variant: FontVariantData) => {
						return {
							id: variant as string,
							fontDisplay: selectedFont.fontDisplay,
							comment: "",
							cssSelector: "",
						};
					});

					setSelectedVariants(cssAdaptedVariants as string[]);
					setSelectedFont({
						...fontInitialData,
						...fontData,
						...(parsedVariants.length ? { variants: parsedVariants } : {}),
						title: fontData.family,
						[propName]: value,
					});
				}
			} else {
				if (propName === "fontDisplay") {
					selectedFont.variants = selectedFont.variants.map((variant: FontVariantData) => {
						return { ...variant, [propName]: value };
					});
				}
				setSelectedFont({ ...selectedFont, [propName]: value });
			}
		},
		[selectedFont, fontInitialData, googleFonts.find, setSelectedVariants],
	);

	const onEditFontVariant = useCallback(
		(variantId: string, propName: string, value: string): void => {
			const updatedVariants = selectedFont?.variants.map((v: FontVariantData) => {
				return v.id === variantId ? { ...v, [propName]: value } : v;
			});

			setSelectedFont((prev: FontData) => ({
				...prev,
				variants: updatedVariants,
			}));
		},
		[selectedFont],
	);

	return (
		<>
			<header className="class-section-heading row gap-xl h-auto">
				<button className="import-fonts-back" onClick={() => setActiveTab(Tabs.USER_FONTS)}>
					<Back />
					<span className="text-s">Back</span>
				</button>
				<h2 className="import-fonts-title">
					<GoogleFontLogo /> Import Google Fonts
				</h2>
				{selectedFont.family && selectedVariants.length ? (
					<button
						className={clsx("btn-primary btn-m relative transition-global margin-left-auto", {
							"pulse-animation": !fontsFormData.fonts.length,
						})}
						style={{ marginRight: !fontsFormData.fonts.length ? 15 : 0 }}
						onClick={() => downloadFontsLocally(selectedFont)}
					>
						<Plus />
						<span className="text-s">Add Font</span>
					</button>
				) : null}
			</header>

			<FontForm googleFonts={googleFonts} font={selectedFont} onFontEdit={onGoogleFontEdit} />

			<div className="import-fonts-selected-family row gap-m space-between align-center">
				<span>
					Font Family:{" "}
					<span className="import-fonts-family">{selectedFont?.family || "(none selected)"}</span>
				</span>
				{selectedFont.family && selectedVariants.length ? (
					<FontCodePreview fontFaceCss={generateFontFaceCSS(selectedFont, selectedVariants)} />
				) : null}
			</div>

			{!selectedFont.family ? (
				<div style={{ height: "30vh" }}>
					<ClassHeader type="font-variants" />
					<div className="row border-primary radius class-row font-variants-empty">
						<p>Fonts will display here</p>
					</div>
				</div>
			) : (
				<>
					<FontVariantsList
						selectedFont={selectedFont}
						toggleVariant={toggleVariant}
						selectedVariants={selectedVariants}
						onEditFontVariant={onEditFontVariant}
					/>
				</>
			)}
		</>
	);
}
