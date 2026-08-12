import React, { useEffect, useState } from "react";
import { GoogleFontLogo } from "../../../assets/icons/GoogleFontLogo.icon";
import { ClassSectionHeading } from "../../ClassSectionHeading";
import { useAtom } from "jotai/index";
import { toast } from "sonner";
import { fontsDataAtom } from "../../../state";
import { ImportGoogleFonts } from "./ImportGoogleFonts";
import {
	fetchGoogleFontFiles,
	fetchGoogleFonts,
} from "@core-framework/core/components/modules/fonts/api";
import { FontNotFound } from "@core-framework/core/components/modules/fonts/components/FontNotFound";
import { FontsList } from "./components/FontsList";
import { FontData, FontVariantData } from "@core-framework/core/components/modules/fonts/types";
import { applyFontToStylesheet, generateFontFaceCSS } from "./utils/utils";

enum Tabs {
	USER_FONTS = "user_fonts",
	IMPORT_GOOGLE_FONTS = "import_google_fonts",
}

export function FontsTab() {
	const { USER_FONTS, IMPORT_GOOGLE_FONTS } = Tabs;
	const [googleFonts, setGoogleFonts] = useState<FontFace[]>([]);
	const [activeTab, setActiveTab] = useState<string>(USER_FONTS);
	const [fontsFormData, setFontsFormData] = useAtom(fontsDataAtom);
	const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

	useEffect(() => {
		if (!googleFonts.length) {
			fetchGoogleFonts().then((data) => setGoogleFonts(data.items as unknown as FontFace[]));
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [googleFonts.length]);

	useEffect(() => {
		fontsFormData.fonts.forEach((font: FontData) => applyFontToStylesheet(font.family));
	}, [fontsFormData.fonts]);

	const downloadFontsLocally = async (font: FontData): Promise<void> => {
		if (!font.family) return;

		try {
			const files = await fetchGoogleFontFiles(font.family, selectedVariants);
			const resolvedFont = { ...font, files };
			const id = `${font.title}-${font.family}-${selectedVariants.join(".")}`;
			const variants = font.variants.reduce((acc: FontVariantData[], v: FontVariantData) => {
				return selectedVariants.includes(v.id) ? [...acc, { ...v, enable: true }] : acc;
			}, []);

			const newUserFont = {
				...resolvedFont,
				id,
				variants,
				enable: true,
				cssPreview: generateFontFaceCSS(resolvedFont, selectedVariants),
			};
			handleFontsUpdate(newUserFont);
			setActiveTab(USER_FONTS);
			toast.success("Font added successfully");
		} catch (error) {
			console.error("Failed to resolve Google Font files:", error);
			toast.error("Could not download the selected Google Font");
		}
	};

	const handleFontsUpdate = (newFont: FontData): void => {
		let updatedFonts = [...fontsFormData.fonts];
		const existingFontIndex = updatedFonts.findIndex((font) => font.id === newFont.id);

		existingFontIndex >= 0 ? (updatedFonts[existingFontIndex] = newFont) : updatedFonts.push(newFont);
		const updatedState = { ...fontsFormData, fonts: updatedFonts };
		setFontsFormData(updatedState);
	};

	const toggleVariant = (variant: string): void => {
		const targetVariant = selectedVariants.includes(variant);
		const updatedVariants = targetVariant
			? selectedVariants.filter((v) => v !== variant)
			: [...selectedVariants, variant];

		setSelectedVariants(updatedVariants);
	};

	return (
		<div className="subsection fonts-wrapper">
			{activeTab === USER_FONTS && (
				<>
					<ClassSectionHeading title="Fonts" />
					<div className="titles-wrapper">
						<button className="new-group" onClick={() => setActiveTab(IMPORT_GOOGLE_FONTS)}>
							<GoogleFontLogo />
							<span className="text-s">Import Google Font</span>
						</button>
					</div>
					<div style={{ minHeight: "50vh" }}>
						{!fontsFormData?.fonts?.length ? <FontNotFound /> : <FontsList googleFonts={googleFonts} />}
					</div>
				</>
			)}

			{activeTab === IMPORT_GOOGLE_FONTS && (
				<ImportGoogleFonts
					googleFonts={googleFonts}
					setActiveTab={setActiveTab}
					selectedVariants={selectedVariants}
					setSelectedVariants={setSelectedVariants}
					toggleVariant={toggleVariant}
					downloadFontsLocally={downloadFontsLocally}
				/>
			)}
		</div>
	);
}
