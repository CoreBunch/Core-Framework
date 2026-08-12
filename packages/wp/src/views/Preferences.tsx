import { ChangeEvent, memo, useCallback, useState } from "react";
import { Select, Switch } from "@mantine/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { capitalize } from "utils";
import { Remove } from "assets/icons/Remove.icon";
import coreFrameworkLogo from "assets/logo_transparent.png";
import { NumberInput } from "components/basic/NumberInput";
import { Row } from "components/ui/Row";
import { currentPresetAtom, localPreferencesAtom, setLocalPreferencesAtom, themeModeAtom } from "state";
import { onboardingAllowCloseAtom, onboardingAtom } from "state/onboardingAtom";

const PreferenceSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
	return (
		<div className="subsection">
			<h2>{title}</h2>
			<div className="grid border-secondary radius bg-overlay-1">{children}</div>
		</div>
	);
};

export const Preferences = memo(() => {
	const localPreferences = useAtomValue(localPreferencesAtom);

	const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);
	const [theme, setTheme] = useAtom(themeModeAtom);

	const setLocalPreferences = useSetAtom(setLocalPreferencesAtom);
	const setIsOnboarding = useSetAtom(onboardingAtom);
	const setOnboardingAllowClose = useSetAtom(onboardingAllowCloseAtom);

	const [imageName, setImageName] = useState("");
	const [showRemoveIcon, setShowRemoveIcon] = useState(false);

	const handlePreferenceChange = (
		key: keyof NonNullable<PresetPreferences>,
		value: number | boolean | string,
	) => {
		setCurrentPreset((prev) =>
			prev
				? {
						...prev,
						preferences: {
							...prev?.preferences,
							[key]: value,
						},
				  }
				: null,
		);
	};

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>, prop: string): void => {
		const file = e.target.files?.[0];
		let base64img = "";

		if (!file?.type.split("/")[1].includes("svg")) {
			return;
		}

		if (file?.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onload = function ({ target }) {
				base64img = target?.result as string;
				setImageName(file.name);
				setCurrentPreset(
					(prev) =>
						prev && {
							...prev,
							[prop]: base64img,
						},
				);
			};
			reader.readAsDataURL(file);
		} else {
			alert("Please select a valid image file.");
		}
	};

	const openOnboarding = useCallback(() => {
		setIsOnboarding(true);
		setOnboardingAllowClose(true);
	}, [setIsOnboarding, setOnboardingAllowClose]);

	return (
		<section id="preferences" className="section">
			<PreferenceSection title="Project Settings">
				<Row
					label="Project Title"
					description="Set a title for your project. This will also be used as the file name when exporting your preset."
					htmlFor="preset_title"
				>
					<input
						id="preset_title"
						className="preferences-right-side"
						type="text"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						value={currentPreset?.name || ""}
						onChange={({ target: { value } }) => {
							setCurrentPreset(
								(prev) =>
									prev && {
										...prev,
										name: value,
									},
							);
						}}
					/>
				</Row>

				<hr />

				<Row
					label="Default Theme"
					description="Select the default theme for your project. Use .cf-theme-dark on the <html> element for manual dark mode. Auto will use system preferences."
					htmlFor="theme_method"
				>
					<Select
						onChange={(value) => {
							const parsedValue = String(value).toLowerCase() as "light" | "dark" | "auto";
							handlePreferenceChange("theme_mode", parsedValue);
							setLocalPreferences({
								...localPreferences,
								theme_mode: parsedValue,
							});
						}}
						value={capitalize(currentPreset?.preferences?.theme_mode ?? "light")}
						data={["Light", "Dark", "Auto"]}
						id="theme_method"
						className="preferences-right-side"
					/>
				</Row>
			</PreferenceSection>

			<PreferenceSection title="Font and Spacing">
				<Row
					label="Root Font Size"
					description="Choose between 100% or 62.5% for the root font size. Fluid calculator values will adjust automatically."
					htmlFor="root_font_size"
				>
					<Select
						onChange={(value) => handlePreferenceChange("root_font_size", value === "62.5%" ? 10 : 16)}
						value={currentPreset?.preferences?.root_font_size === 10 ? "62.5%" : "100%"}
						data={["100%", "62.5%"]}
						id="root_font_size"
						className="preferences-right-side"
					/>
				</Row>

				<hr />

				<Row
					label="Min Screen Width"
					description="Define the minimum screen width for fluid calculators (spacing and typography)."
					htmlFor="min_screen_width"
				>
					<div className="preferences-right-side">
						<NumberInput
							id="min_screen_width"
							value={currentPreset?.preferences?.min_screen_width || 340}
							onChange={(value) => handlePreferenceChange("min_screen_width", Number(value))}
							min={1}
							max={currentPreset?.preferences?.max_screen_width || 2000}
							unit={"px"}
							step={1}
							size={14}
						/>
					</div>
				</Row>

				<hr />

				<div>
					<Row
						label="Max Screen Width"
						description="Define the maximum screen width for fluid calculators (spacing and typography)."
						htmlFor="max_screen_width"
					>
						<div className="preferences-right-side">
							<NumberInput
								id="max_screen_width"
								value={currentPreset?.preferences?.max_screen_width || 1440}
								onChange={(value) => handlePreferenceChange("max_screen_width", Number(value))}
								min={currentPreset?.preferences?.min_screen_width || 340}
								max={4000}
								unit={"px"}
								size={14}
								step={1}
							/>
						</div>
					</Row>

					<div className="bg-blue radius padding-xl margin-left-xl margin-right-xl margin-bottom-xl">
						<p className="text-m opacity-60">
							If using a website builder, we recommend using var(--max-screen-width) to set your website's
							width in the global styles.
						</p>
					</div>
				</div>
			</PreferenceSection>

			<PreferenceSection title="CSS Processing">
				<Row
					label="Enable PostCSS"
					description="Enable PostCSS to process CSS with vendor prefixes and fallbacks for cross-browser compatibility."
					htmlFor="postcss"
				>
					<Switch
						onChange={({ target: { checked } }) => handlePreferenceChange("postcss", checked)}
						checked={currentPreset?.preferences?.postcss}
						id="postcss"
					/>
				</Row>

				<hr />

				<Row
					label="Output REM Units"
					description="Convert pixel values to REM units for typography and spacing in the final stylesheet."
					htmlFor="is_rem"
				>
					<Switch
						onChange={({ target: { checked } }) => handlePreferenceChange("is_rem", checked)}
						checked={currentPreset?.preferences?.is_rem}
						id="is_rem"
					/>
				</Row>

				<hr />

				<Row
					label="Smooth Linear Gradients"
					description="Generates more iterations on the value to create smoother linear gradients for enhanced visual appeal."
					htmlFor="postcss_easing_gradients"
					disabled={!currentPreset?.preferences?.postcss}
				>
					<Switch
						onChange={({ target: { checked } }) =>
							handlePreferenceChange("postcss_easing_gradients", checked)
						}
						checked={currentPreset?.preferences?.postcss_easing_gradients}
						id="postcss_easing_gradients"
					/>
				</Row>
			</PreferenceSection>

			<PreferenceSection title="Prefixes and Customization">
				<div>
					<Row
						label="Class Prefix"
						description="Add a custom prefix to all Core Framework classes to avoid naming conflicts."
						htmlFor="class_prefix"
					>
						<input
							id="class_prefix"
							className="preferences-right-side"
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							size={10}
							value={currentPreset?.classPrefix || ""}
							onChange={({ target: { value } }) => {
								const allowedChars = /[^\w\d\-_]/g;
								const classPrefix = value.replace(allowedChars, "").replace(".", "").replace(" ", "-");

								setCurrentPreset(
									(prev) =>
										prev && {
											...prev,
											classPrefix,
										},
								);
							}}
							placeholder="Eg. cf-"
						/>
					</Row>

					<div className="bg-red radius padding-xl margin-left-xl margin-right-xl margin-bottom-xl">
						<p className="text-m opacity-60">
							We recommend setting this before building your website. Adding class prefixes later requires
							re-adding classes to your elements.
						</p>
					</div>
				</div>

				<hr />

				<div>
					<Row
						label="Variable Prefix"
						description="Add a custom prefix to all Core Framework variables to avoid naming conflicts."
						htmlFor="variable_prefix"
					>
						<input
							id="variable_prefix"
							className="preferences-right-side"
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							size={12}
							value={currentPreset?.variablePrefix || ""}
							onChange={({ target: { value } }) => {
								const allowedChars = /[^\w\d\-_]/g;
								const variablePrefix = value.replace(allowedChars, "").replace(".", "").replace(" ", "-");

								setCurrentPreset(
									(prev) =>
										prev && {
											...prev,
											variablePrefix,
										},
								);
							}}
							placeholder="Eg. cf-"
						/>
					</Row>

					<div className="bg-red radius padding-xl margin-left-xl margin-right-xl margin-bottom-xl">
						<p className="text-m opacity-60">
							We recommend setting this before building your website. Adding variable prefixes later requires
							re-adding variables to your elements.
						</p>
					</div>
				</div>
			</PreferenceSection>

			<PreferenceSection title="Accessibility and Usability">
				<Row
					label="Disable Hover on Touch Devices"
					description="Disable hover styles on touch devices for improved user experience."
					htmlFor="postcss_hover_media"
					disabled={!currentPreset?.preferences?.postcss}
				>
					<Switch
						onChange={({ target: { checked } }) => handlePreferenceChange("postcss_hover_media", checked)}
						checked={currentPreset?.preferences?.postcss_hover_media}
						id="postcss_hover_media"
					/>
				</Row>

				<hr />

				<Row
					label="Respect Reduced Motion"
					description="Disable animations if the user has enabled ‘Reduce motion’ in OS settings."
					htmlFor="prefers_reduced_motion"
				>
					<Switch
						onChange={({ target: { checked } }) => handlePreferenceChange("prefers_reduced_motion", checked)}
						checked={currentPreset?.preferences?.prefers_reduced_motion}
						id="prefers_reduced_motion"
					/>
				</Row>

				<hr />

				<div>
					<Row
						label="Enable Clickable Parent"
						description="Enable a clickable parent class to use on links."
						htmlFor="is_clickable_parent"
					>
						<div className="row align-center gap-xl right-side-multiple">
							<input
								id="variable_prefix"
								className="preferences-right-side"
								type="text"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck={false}
								size={12}
								disabled={!currentPreset?.preferences?.is_clickable_parent}
								value={currentPreset?.clickableParentClass || ""}
								onChange={({ target: { value } }) => {
									setCurrentPreset(
										(prev) =>
											prev && {
												...prev,
												clickableParentClass: value,
											},
									);
								}}
								placeholder="Eg. .expand-click"
							/>

							<Switch
								onChange={({ target: { checked } }) => handlePreferenceChange("is_clickable_parent", checked)}
								checked={currentPreset?.preferences?.is_clickable_parent}
								id="is_clickable_parent"
							/>
						</div>
					</Row>

					<div className="bg-blue radius padding-xl margin-left-xl margin-right-xl margin-bottom-xl">
						<p className="text-m opacity-60">Parent wrapper must be set to relative.</p>
					</div>
				</div>

				<hr />

				<Row
					label="Disable Focusable Parent On Click"
					description="A focusable parent is added on click by default, toggle this to turn it off."
					htmlFor="disable_focusable_parent"
					disabled={!currentPreset?.preferences?.is_clickable_parent}
				>
					<Switch
						onChange={({ target: { checked } }) =>
							handlePreferenceChange("disable_focusable_parent", checked)
						}
						checked={currentPreset?.preferences?.disable_focusable_parent}
						id="disable_focusable_parent"
					/>
				</Row>

				<hr />

				<Row
					label="Enable Screen Reader Only Class"
					description="Use this class to hide an element visually without hiding it from screen readers."
					htmlFor="enable_sr_only"
				>
					<div className="row align-center gap-xl right-side-multiple">
						<input
							id="sr_only_class"
							className="preferences-right-side"
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							size={12}
							disabled={!currentPreset?.preferences?.enable_sr_only}
							value={currentPreset?.srOnlyClass || ""}
							onChange={({ target: { value } }) => {
								const allowedChars = /[^\w\d\-_.]/g;
								const srOnlyClass = value.replace(allowedChars, "").replace(" ", "-");

								setCurrentPreset(
									(prev) =>
										prev && {
											...prev,
											srOnlyClass,
										},
								);
							}}
							placeholder="Eg. .expand-click"
						/>

						<Switch
							onChange={({ target: { checked } }) => handlePreferenceChange("enable_sr_only", checked)}
							checked={currentPreset?.preferences?.enable_sr_only}
							id="enable_sr_only"
						/>
					</div>
				</Row>
			</PreferenceSection>

			<PreferenceSection title="Readability">
				<Row
					label="Add Group Comments"
					description="Enable comments in the final stylesheet to identify and organize groups easily."
					htmlFor="is_add_group_comments"
				>
					<Switch
						onChange={({ target: { checked } }) => handlePreferenceChange("is_add_group_comments", checked)}
						checked={currentPreset?.preferences?.is_add_group_comments}
						id="is_add_group_comments"
					/>
				</Row>
			</PreferenceSection>

			<PreferenceSection title="Plugin Preferences">
				<Row label="Theme" description="Choose a color theme for Core Framework editor." htmlFor="theme">
					<div className="input-wrapper">
						<Select
							onChange={(value) => {
								setTheme(value as "light" | "dark" | "gray");
								document.documentElement.dataset.colorMode = value === "dark" ? "" : value || "";
							}}
							value={theme}
							data={["light", "dark", "gray"].map((theme) => ({
								value: theme,
								label: capitalize(theme),
							}))}
							id="theme"
							className="preferences-right-side"
						/>
					</div>
				</Row>

				<hr />

				<Row
					label="Disable Fonts Integration"
					description="Disable Core Framework fonts in page builders to prevent conflicts with other font plugins."
					htmlFor="disable_fonts"
				>
					<Switch
						onChange={() =>
							setLocalPreferences({
								...localPreferences,
								disable_fonts: !localPreferences?.disable_fonts,
							})
						}
						checked={Boolean(localPreferences?.disable_fonts)}
						color={localPreferences?.disable_fonts ? "primary.3" : "secondary"}
						id="disable_fonts"
					/>
				</Row>

				<hr />

				<Row
					label="Uninstall"
					description="Remove all data on uninstall, including core framework classes and colors from builders (can't be undone)."
					htmlFor="delete_data"
				>
					<Switch
						onChange={() =>
							setLocalPreferences({
								...localPreferences,
								delete_data: !localPreferences?.delete_data,
							})
						}
						checked={Boolean(localPreferences?.delete_data)}
						color={localPreferences?.delete_data ? "primary.3" : "secondary"}
						id="delete_data"
					/>
				</Row>
			</PreferenceSection>

			<PreferenceSection title="White Labeling">
				<Row label="Plugin name" description="Change the name of the plugin." htmlFor="plugin_name">
					<input
						id="plugin_name"
						className="preferences-right-side"
						type="text"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						value={currentPreset?.pluginName || ""}
						onChange={({ target: { value } }) => {
							setCurrentPreset(
								(prev) =>
									prev && {
										...prev,
										pluginName: value,
									},
							);
							setLocalPreferences({
								...localPreferences,
								plugin_name: value,
							});
						}}
						placeholder="Eg. My Framework"
					/>
				</Row>

				<hr />

				<Row label="Plugin icon" description="Change the icon of the plugin." htmlFor="plugin_icon">
					<input
						id="plugin_icon"
						className="preferences-right-side uploader"
						type="file"
						accept="image/svg+xml"
						size={12}
						onChange={(e) => handleImageChange(e, "pluginIcon")}
					/>
					<div className={"uploader-wrapper"}>
						<div onMouseEnter={() => setShowRemoveIcon(true)} onMouseLeave={() => setShowRemoveIcon(false)}>
							<img
								src={currentPreset?.pluginIcon || coreFrameworkLogo}
								alt={"Plugin icon preview"}
								width={25}
							/>
							{showRemoveIcon && currentPreset?.pluginIcon && (
								<span
									onClick={() => {
										setCurrentPreset(
											(prev) =>
												prev && {
													...prev,
													["pluginIcon"]: "",
												},
										);
									}}
								>
									<Remove />
								</span>
							)}
						</div>
						<label htmlFor="plugin_icon" className="uploader-label">
							{imageName || "Choose an icon"}
						</label>
					</div>
				</Row>

				<hr />

				<Row label="Plugin author" description="Change the author of the plugin." htmlFor="plugin_author">
					<input
						id="plugin_author"
						className="preferences-right-side"
						type="text"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						value={currentPreset?.pluginAuthor || ""}
						onChange={({ target: { value } }) => {
							setCurrentPreset(
								(prev) =>
									prev && {
										...prev,
										pluginAuthor: value,
									},
							);
						}}
						placeholder="Eg. Ilon Mask"
					/>
				</Row>

				<hr />

				<Row
					label="Plugin description"
					description="Change the description of the plugin."
					htmlFor="plugin_description"
				>
					<textarea
						id="plugin_author"
						className="preferences-right-side"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						rows={3}
						value={currentPreset?.pluginDescription || ""}
						onChange={({ target: { value } }) => {
							setCurrentPreset(
								(prev) =>
									prev && {
										...prev,
										pluginDescription: value,
									},
							);
						}}
						placeholder="Eg. core of my project"
					/>
				</Row>

				<hr />

				<Row label="Hide plugin" description="Hide plugin completely from the WP menu." htmlFor="hide_plugin">
					<Switch
						onChange={({ target: { checked } }) => {
							setCurrentPreset(
								(prev) =>
									prev && {
										...prev,
										hidePlugin: checked,
									},
							);
						}}
						checked={currentPreset?.hidePlugin}
						id="hide_plugin"
					/>
				</Row>
			</PreferenceSection>

			<div className="subsection">
				<div className="row space-between align-start bg-red radius gap-xs padding-xl">
					<div className="grid gap-xs">
						<h4>Reset to default</h4>
						<div className="grid gap-3xs">
							<p className="text-m opacity-60">
								This option restores all settings to their defaults and launches the onboarding wizard.
							</p>
							<p className="text-xs opacity-40">Warning: After saving you can't undo this action.</p>
						</div>
					</div>

					<button onClick={openOnboarding} className="btn-red btn-l">
						Reset
					</button>
				</div>
			</div>
		</section>
	);
});

Preferences.displayName = "Preferences";
