import { memo } from "react";
import { Select, Switch } from "@mantine/core";
import { useAtom, useSetAtom } from "jotai";
import { capitalize } from "utils";
import { NumberInput } from "components/basic/NumberInput";
import { Row } from "components/ui/Row";
import { currentPresetAtom, themeModeAtom } from "state";
import { onboardingAllowCloseAtom, onboardingAtom } from "state/onboardingAtom";

export const Preferences = memo(() => {
	const [currentPreset, setCurrentPreset] = useAtom(currentPresetAtom);
	const [theme, setTheme] = useAtom(themeModeAtom);

	const setIsOnboarding = useSetAtom(onboardingAtom);
	const setOnboardingAllowClose = useSetAtom(onboardingAllowCloseAtom);

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

	const openOnboarding = () => {
		setIsOnboarding(true);
		setOnboardingAllowClose(true);
	};

	return (
		<section id="preferences" className="section">
			<div className="subsection">
				<h2>Project Settings</h2>
				<div className="grid border-secondary radius bg-overlay-1">
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
							}}
							value={capitalize(currentPreset?.preferences?.theme_mode ?? "light")}
							data={["Light", "Dark", "Auto"]}
							id="theme_method"
							className="preferences-right-side"
						/>
					</Row>
				</div>
			</div>
			<div className="subsection">
				<h2>Font and Spacing</h2>
				<div className="grid border-secondary radius bg-overlay-1">
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

					<Row
						label="Max Screen Width"
						description="Define the maximum screen width for fluid calculators (spacing and typography). You can also use the variable of var(--max-screen-width) to set this value wherever necessary."
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
				</div>
			</div>

			<div className="subsection">
				<h2>CSS Processing</h2>
				<div className="grid border-secondary radius bg-overlay-1">
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
				</div>
			</div>

			<div className="subsection">
				<h2>Prefixes and Customization</h2>
				<div className="grid border-secondary radius bg-overlay-1">
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

					<hr />

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
				</div>
			</div>

			<div className="subsection">
				<h2>Accessibility and Usability</h2>
				<div className="grid border-secondary radius bg-overlay-1">
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
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("prefers_reduced_motion", checked)
							}
							checked={currentPreset?.preferences?.prefers_reduced_motion}
							id="prefers_reduced_motion"
						/>
					</Row>
				</div>
			</div>

			<div className="subsection">
				<h2>Readability</h2>
				<div className="grid border-secondary radius bg-overlay-1">
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
				</div>
			</div>

			<section id="preferences" className="section">
				<div className="subsection">
					<h2>App Preferences</h2>
					<div className="grid border-secondary radius bg-overlay-1">
						<Row label="Theme" description="Choose a color theme for Core Framework editor." htmlFor="theme">
							<div className="input-wrapper">
								<Select
									onChange={(value) => {
										setTheme(value as "light" | "dark" | "gray");
										document.documentElement.dataset.colorMode = value === "dark" ? "" : value || "";
									}}
									value={theme}
									data={["light", "dark", "gray"].map((theme) => {
										return {
											value: theme,
											label: capitalize(theme),
										};
									})}
									id="theme"
									className="preferences-right-side"
								/>
							</div>
						</Row>
					</div>
				</div>
			</section>

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
