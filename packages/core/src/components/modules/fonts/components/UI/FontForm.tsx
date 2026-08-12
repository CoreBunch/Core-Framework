import React, { useMemo } from "react";
import { FONT_DISPLAY_OPTIONS } from "../../constants";
import { FontData } from "../../types";
import { Badge, Select } from "@mantine/core";

interface IFontFormProps {
	font: FontData;
	googleFonts: FontData[];
	onFontEdit: (_: any, propName: string, value: string) => void;
}

export function FontForm({ font, onFontEdit, googleFonts }: IFontFormProps) {
	const fontsOptions = useMemo(
		() =>
			googleFonts.map((font) => ({
				label: font.family,
				value: font.family,
				type: font.category,
			})),
		[googleFonts.map],
	);

	return (
		<div className="row gap-3xl space-between">
			<div className="row gap-xs space-between import-fonts-form">
				<div className="row gap-xs">
					<div>
						<label htmlFor="family" className="import-fonts-label">
							Google font
						</label>
						<Select
							name={"family"}
							searchable={true}
							onChange={(value) => onFontEdit(font.id, "family", value as string)}
							value={font?.family || ""}
							data={fontsOptions}
							style={{ minWidth: "15rem" }}
							placeholder={"Type to Search"}
							itemComponent={({ label, type, ...others }) => (
								<div {...others} id={"import-fonts-select-item"}>
									<span>{label}</span>
									<Badge
										variant="filled"
										style={{ backgroundColor: "#5c68f9" }}
										sx={{
											fontSize: "8px",
											padding: "0 3px",
											borderRadius: "4px",
										}}
									>
										{type}
									</Badge>
								</div>
							)}
						/>
					</div>
					<div>
						<label htmlFor={"fontDisplay"} className="import-fonts-label">
							Font display
						</label>
						<Select
							name={"fontDisplay"}
							onChange={(value) => onFontEdit(font.id, "fontDisplay", value as string)}
							value={font.fontDisplay}
							data={FONT_DISPLAY_OPTIONS}
							style={{ minWidth: "12rem" }}
						/>
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
						value={font.title || ""}
						onChange={({ target: { value, name } }) => onFontEdit(font.id, name, value)}
						placeholder="ex. My Custom Font"
					/>
				</div>
			</div>
			<div className="row gap-xs" style={{ height: "fit-content", flexDirection: "column" }}>
				<div className="prefixed-input-container input-wrapper">
					<div>
						<label htmlFor={"customSelectors"} className="import-fonts-label">
							Custom selector(s)
						</label>
						<input
							id="custom-selectors"
							name="customSelectors"
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							size={20}
							value={font.customSelectors}
							onChange={({ target: { value, name } }) => onFontEdit(font.id, name, value)}
							placeholder="ex: .my-font, label"
						/>
					</div>
				</div>
				<div>
					<label htmlFor={"customVariable"} className="import-fonts-label">
						Custom variable
					</label>
					<div
						className="prefixed-input-container input-wrapper custom-variable"
						style={{ height: "fit-content" }}
					>
						<span>--</span>
						<input
							id="custom-variable"
							name="customVariable"
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							size={40}
							value={font.customVariable}
							onChange={({ target: { value, name } }) => {
								onFontEdit(font.id, name, value);
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
