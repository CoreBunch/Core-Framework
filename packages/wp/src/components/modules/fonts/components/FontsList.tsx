import React, { useState } from "react";
import { Edit } from "../../../../assets/icons/Edit.icon";
import { GoogleFontLogo } from "../../../../assets/icons/GoogleFontLogo.icon";
import { Remove } from "../../../../assets/icons/Remove.icon";
import { ClassHeader } from "../../../ClassHeader";
import { FontData, FontVariantData } from "@core-framework/core/components/modules/fonts/types";
import { generateFontFaceCSS } from "../utils/utils";
import { Switch } from "@mantine/core";
import clsx from "clsx";
import { useAtom } from "jotai/index";
import { fontsDataAtom } from "../../../../state";
import { EditUserFont } from "./EditUserFont";

export function FontsList({ googleFonts }: { googleFonts: FontFace[] }) {
	const [fontsFormData, setFontsFormData] = useAtom(fontsDataAtom);
	const [targetEditedFont, setTargetEditedFont] = useState<string>("");
	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false);
	const [fontToDelete, setFontToDelete] = useState<string>("");

	const onRemoveFont = (fontId: string): void => {
		const updatedFonts = fontsFormData.fonts.filter((font: FontData) => font.id !== fontId);
		setFontsFormData({ ...fontsFormData, fonts: updatedFonts });
	};

	const onFontEdit = (fontId: any, propName: string, value: string | boolean): void => {
		const fonts = fontsFormData.fonts || [];
		const targetFontIndex = fonts.findIndex((fontObj: FontData) => fontId === fontObj.id);

		if (targetFontIndex >= 0) {
			const updatedFonts = [...fonts];
			const selectedVariants = updatedFonts[targetFontIndex].variants.map((v: FontVariantData) => v.id);

			updatedFonts[targetFontIndex] = {
				...updatedFonts[targetFontIndex],
				[propName]: typeof value === "boolean" ? !updatedFonts[targetFontIndex][propName] : value,
			};

			if (propName === "fontDisplay") {
				updatedFonts[targetFontIndex].variants = updatedFonts[targetFontIndex].variants.map(
					(variant: FontVariantData) => {
						return { ...variant, [propName]: value };
					},
				);
			}
			if (propName === "family") {
				updatedFonts[targetFontIndex].title = value;
				updatedFonts[targetFontIndex].category = "sans-serif";
			}
			updatedFonts[targetFontIndex].cssPreview = generateFontFaceCSS(
				updatedFonts[targetFontIndex],
				selectedVariants,
			);

			setFontsFormData({ ...fontsFormData, fonts: updatedFonts });
		}
	};

	const handleRemoveFont = async (font: FontData, { target }: any) => {
		const button = (target as HTMLButtonElement).closest("button");
		const prevFont = fontToDelete;
		const selectedVariants = font.variants.map((v: FontVariantData) => v.id);

		if (button?.name === font.id) {
			setFontToDelete(font.id);
			if (isDeleteConfirmationOpen && prevFont === font.id) {
				setFontToDelete("");
				onRemoveFont(font.id);
				const response = await fetch(`${window.coreframework.core_api_url}delete-fonts`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-WP-Nonce": window.wpApiSettings.nonce,
					},
					body: JSON.stringify({
						fonts: selectedVariants.map((v: string) => ({ filename: `${font.family}-${v}.woff2` })),
					}),
				});
				const result = await response.json();
				console.log(result);
			} else {
				setIsDeleteConfirmationOpen(true);
				setTimeout(() => setIsDeleteConfirmationOpen(false), 10000);
			}
		}
	};

	return (
		<>
			<ClassHeader type="fonts" />
			<ul className="grid border-primary radius relative">
				{fontsFormData.fonts.map((font: FontData) => {
					return (
						<React.Fragment key={font.id}>
							<li className={"class-row selectors-layout font-item align-center"}>
								<Switch
									name={"enable"}
									color={"primary.3"}
									checked={font.enable}
									onChange={({ target: { checked } }) => onFontEdit(font.id, "enable", checked)}
								/>
								<p className="font-item-family">{font.title || "Custom font"}</p>
								<p className="font-item-family">
									{font.category !== "custom-font" ? <GoogleFontLogo /> : null} {font.family}
								</p>
								<p style={{ fontFamily: font.family, fontWeight: 400, fontStyle: "normal" }}>
									The quick brown fox jumps over a lazy dog.
								</p>
								<div className="fonts-actions">
									<button
										className={"btn-secondary edit"}
										onClick={() => setTargetEditedFont(font.id === targetEditedFont ? "" : font.id)}
									>
										<Edit />
									</button>
									<button
										name={font.id}
										className={clsx("btn-red remove", {
											"to-remove": isDeleteConfirmationOpen && fontToDelete === font.id,
										})}
										onClick={(e) => handleRemoveFont(font, e)}
									>
										{isDeleteConfirmationOpen && fontToDelete === font.id ? "Confirm?" : <Remove />}
									</button>
								</div>
							</li>
							{targetEditedFont && targetEditedFont === font.id && (
								<div style={{ padding: 10 }}>
									<EditUserFont googleFonts={googleFonts} font={font} onFontEdit={onFontEdit} />
								</div>
							)}
						</React.Fragment>
					);
				})}
			</ul>
		</>
	);
}
