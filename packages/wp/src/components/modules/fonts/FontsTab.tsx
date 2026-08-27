import React, { useEffect, useState } from "react";
import { Download } from "../../../assets/icons/Download.icon";
import { GoogleFontLogo } from "../../../assets/icons/GoogleFontLogo.icon";
import { ClassSectionHeading } from "../../ClassSectionHeading";
import { useAtom } from "jotai/index";
import { toast } from "sonner";
import { fontsDataAtom } from "../../../state";
import { ImportCustomFonts } from "./ImportCustomFonts";
import { ImportGoogleFonts } from "./ImportGoogleFonts";
import {
	fetchGoogleFontFiles,
	fetchGoogleFonts,
} from "@core-framework/core/components/modules/fonts/api";
import { FontNotFound } from "@core-framework/core/components/modules/fonts/components/FontNotFound";
import { FontsList } from "./components/FontsList";
import { FontData, FontVariantData } from "@core-framework/core/components/modules/fonts/types";
import { blobToBase64, generateFontFaceCSS, localFontFileName } from "./utils/utils";

enum Tabs {
	USER_FONTS = "user_fonts",
	IMPORT_GOOGLE_FONTS = "import_google_fonts",
	IMPORT_CUSTOM_FONT = "import_custom_font",
}

export function FontsTab() {
	const { USER_FONTS, IMPORT_GOOGLE_FONTS, IMPORT_CUSTOM_FONT } = Tabs;
	const [googleFonts, setGoogleFonts] = useState<FontFace[]>([]);
	const [activeTab, setActiveTab] = useState<string>(USER_FONTS);
	const [fontsFormData, setFontsFormData] = useAtom(fontsDataAtom);
	const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

	useEffect(() => {
		if (!googleFonts.length) {
			fetchGoogleFonts().then((data) => setGoogleFonts(data.items as unknown as FontFace[]));
		}
	}, []);

	useEffect(() => {
		const styleElements = fontsFormData.fonts
			.filter((font: FontData) => font.cssPreview)
			.map((font: FontData) => {
				const styleElement = document.createElement("style");
				styleElement.dataset.coreFrameworkFont = font.id;
				styleElement.textContent = font.cssPreview;
				document.head.appendChild(styleElement);
				return styleElement;
			});

		return () => styleElements.forEach((styleElement) => styleElement.remove());
	}, [fontsFormData.fonts]);

	const saveFontToWp = async (font: FontData): Promise<void> => {
		const variants = await Promise.all(
			selectedVariants.map(async (variant) => {
				const fileKey =
					(variant === "400" && "regular") || (variant === "400italic" && "italic") || variant;
				const fontFileUrl = font.files[fileKey];
				let fontBase64: string;

				if (font.category !== "custom-font") {
					const fontResponse = await fetch(fontFileUrl);
					if (!fontResponse.ok) throw new Error(`Font download failed with status ${fontResponse.status}`);
					fontBase64 = await blobToBase64(await fontResponse.blob());
				} else {
					fontBase64 = fontFileUrl;
				}

				return {
					font_base64: fontBase64.split(",")[1],
					filename: localFontFileName(font.family, variant),
				};
			}),
		);

		const response = await fetch(`${window.coreframework.core_api_url}upload-fonts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
			body: JSON.stringify({ fonts: variants }),
		});

		if (!response.ok) throw new Error(`Font upload failed with status ${response.status}`);
	};

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
			await saveFontToWp(resolvedFont);
			handleFontsUpdate(newUserFont);
			setActiveTab(USER_FONTS);
			toast.success("Font added successfully");
		} catch (error) {
			console.error("Failed to download Google Font:", error);
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
						<button className="new-group" onClick={() => setActiveTab(IMPORT_CUSTOM_FONT)}>
							<Download />
							<span className="text-s">Import Local Font</span>
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

			{activeTab === IMPORT_CUSTOM_FONT && (
				<ImportCustomFonts
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
