import React, { useState } from "react";
import { EditNew } from "assets/icons/EditNew.icon";
import { FONT_DISPLAY_OPTIONS } from "../constants";
import { FontData, FontVariantData } from "../types";
import { getFontProps } from "../utils/utils";
import { Select, Switch } from "@mantine/core";

interface IFontVariantsItem {
	selectedFont: FontData;
	variant: FontVariantData;
	selectedVariants: string[];
	onEditFontVariant: (variantId: string, propName: string, value: string) => void;
	toggleVariant: (variant: string) => void;
}

export function FontVariantsItem({
	variant,
	selectedVariants,
	toggleVariant,
	selectedFont,
	onEditFontVariant,
}: IFontVariantsItem) {
	const [targetVariant, setTargetVariant] = useState<string>("");
	const { weight, style } = getFontProps(variant.id);

	return (
		<>
			<li key={variant.id} className={"class-row selectors-layout font-variants"}>
				<div className="row gap-m align-center">
					<Switch
						color={"primary.3"}
						checked={selectedVariants.includes(variant.id)}
						onChange={() => toggleVariant(variant.id)}
						style={{ marginRight: 20 }}
					/>
					<span className="font-variants-bold">{weight}</span>
					<span className="font-variants-bold" style={{ fontStyle: style }}>
						{style[0].toUpperCase() + style.slice(1)}
					</span>
				</div>
				<p style={{ fontFamily: selectedFont?.family, fontWeight: weight, fontStyle: style }}>
					The quick brown fox jumps over a lazy dog.
				</p>
				<div className="fonts-actions">
					<button
						className={"btn-secondary edit"}
						onClick={() => setTargetVariant(variant.id === targetVariant ? "" : variant.id)}
					>
						<EditNew />
					</button>
				</div>
			</li>
			{targetVariant && targetVariant === variant.id && (
				<div className="row gap-s" style={{ padding: "13px 10px" }}>
					<div>
						<label htmlFor={"variant_display"} className="import-fonts-label">
							Font display
						</label>
						<Select
							name={"variant_display"}
							onChange={(value) => onEditFontVariant(variant.id, "fontDisplay", value || "")}
							value={variant.fontDisplay}
							data={FONT_DISPLAY_OPTIONS}
							style={{ minWidth: "12rem" }}
						/>
					</div>
					<div>
						<label htmlFor={"variant_comment"} className="import-fonts-label">
							Comment
						</label>
						<div className="prefixed-input-container input-wrapper" style={{ height: "fit-content" }}>
							<input
								id="variant-comment"
								name="variant_comment"
								type="text"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
								size={40}
								value={variant.comment}
								onChange={({ target: { value } }) => {
									onEditFontVariant(variant.id, "comment", value);
								}}
								placeholder={"Primary font variant"}
							/>
						</div>
					</div>
					<div>
						<label htmlFor={"variant_css_selector"} className="import-fonts-label">
							CSS Selector
						</label>
						<div className="prefixed-input-container input-wrapper" style={{ height: "fit-content" }}>
							<input
								id="variant-css-selector"
								name="variant_css_selector"
								type="text"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
								size={40}
								value={variant.cssSelector}
								onChange={({ target: { value } }) => {
									onEditFontVariant(variant.id, "cssSelector", value);
								}}
								placeholder={"eg: .my-font-variant, h1"}
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
