import React, { Dispatch, SetStateAction, useState } from "react";
import { Back } from "../../../assets/icons/Back.icon";
import { Plus } from "../../../assets/icons/Plus.icon";
import { ClassHeader } from "../../ClassHeader";
import clsx from "clsx";
import { useAtom } from "jotai/index";
import { fontsDataAtom } from "../../../state";
import { FontCodePreview } from "@core-framework/core/components/modules/fonts/components/FontCodePreview";
import { FontVariantsList } from "@core-framework/core/components/modules/fonts/components/FontVariantsList";
import { FontData, FontVariantData } from "@core-framework/core/components/modules/fonts/types";
import { blobToBase64, extractFontData, generateFontFaceCSS } from "./utils/utils";

enum Tabs {
	USER_FONTS = "user_fonts",
}

interface IImportCustomFontsProps {
	setActiveTab: Dispatch<SetStateAction<string>>;
	selectedVariants: string[];
	setSelectedVariants: Dispatch<SetStateAction<string[]>>;
	toggleVariant: (variant: string) => void;
	downloadFontsLocally: (font: FontData) => Promise<void>;
}

export function ImportCustomFonts({
	setActiveTab,
	selectedVariants,
	setSelectedVariants,
	toggleVariant,
	downloadFontsLocally,
}: IImportCustomFontsProps) {
	const [uploadedFont, setUploadedFont] = useState<FontData>(null);
	const [fileName, setFileName] = useState<string>("");
	const [fontsFormData] = useAtom(fontsDataAtom);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const arrayBuffer = await file.arrayBuffer();
			const { family, weight, style } = await extractFontData(file);
			const fontFace = new FontFace(family, arrayBuffer, { weight, style });

			try {
				await fontFace.load();

				if (fontFace) {
					const fontBlob = new Blob([file], { type: file.type });
					const fontBase64 = await blobToBase64(fontBlob);
					const variants = [
						{
							id: weight + style,
							fontDisplay: "auto",
							comment: "",
							cssSelector: "",
						},
					];
					const newFont = {
						family: fontFace.family,
						category: "custom-font",
						variants,
						title: fontFace.family,
						customSelectors: "",
						customVariable: "",
						files: { [variants[0].id]: fontBase64 },
						fontDisplay: fontFace.display,
						enable: true,
					};

					setFileName(file.name);
					setSelectedVariants([variants[0].id]);
					setUploadedFont(newFont as FontData);
					document.fonts.add(fontFace);
				}
			} catch (error) {
				console.error("Error loading font:", error);
			}
		}
	};

	const onEditFontVariant = (variantId: string, propName: string, value: string): void => {
		const updatedVariants = uploadedFont?.variants.map((v: FontVariantData) => {
			return v.id === variantId ? { ...v, [propName]: value } : v;
		});
		setUploadedFont((prev: FontData) => ({
			...prev,
			variants: updatedVariants,
		}));
	};

	return (
		<>
			<header className="class-section-heading row gap-xl h-auto">
				<button className="import-fonts-back" onClick={() => setActiveTab(Tabs.USER_FONTS)}>
					<Back />
					<span className="text-s">Back</span>
				</button>
				<h2 className="import-fonts-title">Import Custom Font</h2>
				{uploadedFont?.family && selectedVariants.length ? (
					<button
						className={clsx("btn-primary btn-m relative transition-global margin-left-auto", {
							"pulse-animation": !fontsFormData.fonts.length,
						})}
						style={{ marginRight: !fontsFormData.fonts.length ? 15 : 0 }}
						onClick={() => downloadFontsLocally(uploadedFont)}
					>
						<Plus />
						<span className="text-s">Add Font</span>
					</button>
				) : null}
			</header>
			<div style={{ minHeight: "50vh" }}>
				<div className="row gap-xl">
					<div className="prefixed-input-container input-wrapper" style={{ gap: "0" }}>
						<label htmlFor={"title"} className="import-fonts-label">
							Font file
						</label>
						<input
							id="plugin_icon"
							className="preferences-right-side uploader"
							type="file"
							accept=".ttf,.woff,.woff2"
							size={30}
							onChange={handleFileUpload}
						/>
						<div className={"uploader-wrapper"}>
							<label htmlFor="plugin_icon" className="uploader-label font-uploader" title={fileName}>
								{fileName || "Choose a font file"}
							</label>
						</div>
					</div>
					<div className="prefixed-input-container input-wrapper" style={{ gap: "0" }}>
						<label htmlFor={"title"} className="import-fonts-label">
							Font title
						</label>
						<input
							id="font-title"
							type="text"
							name="title"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							value={uploadedFont?.title || ""}
							onChange={({ target: { value } }) => {
								setUploadedFont((prev: FontData) => ({ ...prev, title: value }));
							}}
							placeholder="ex. My Custom Font"
						/>
					</div>
				</div>

				<div
					className="import-fonts-selected-family row gap-m space-between align-center"
					style={{ padding: "10px 0" }}
				>
					<span>
						Font Family: <span className="import-fonts-family">{uploadedFont?.family || "(none)"}</span>
					</span>
					{uploadedFont?.family && selectedVariants.length ? (
						<FontCodePreview fontFaceCss={generateFontFaceCSS(uploadedFont, selectedVariants)} />
					) : null}
				</div>

				{!uploadedFont ? (
					<div style={{ height: "30vh" }}>
						<ClassHeader type="font-variants" />
						<div className="row border-primary radius class-row font-variants-empty">
							<p>Fonts will display here</p>
						</div>
					</div>
				) : (
					<div className="user-font-variants">
						<FontVariantsList
							selectedFont={uploadedFont}
							toggleVariant={toggleVariant}
							selectedVariants={selectedVariants}
							onEditFontVariant={onEditFontVariant}
						/>
					</div>
				)}
			</div>
		</>
	);
}
