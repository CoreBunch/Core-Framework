import { memo } from "react";
import { Switch } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { Row } from "components/ui/Row";
import { localPreferencesAtom, setLocalPreferencesAtom } from "state";

export const Bricks = memo(() => {
	const localPreferences = useAtomValue(localPreferencesAtom);
	const setPreferences = useSetAtom(setLocalPreferencesAtom);

	const handlePreferenceChange = (key: keyof Preferences, value: boolean | number) =>
		setPreferences({
			...localPreferences,
			[key]: value,
		});

	return (
		<section id="addons" className="section">
			<div className="subsection">
				<h1>Bricks Addon Preferences</h1>

				<div className="grid border-secondary radius bg-overlay-1">
					<Row
						label="Enable Variable UI"
						description={`Open by holding down ${
							navigator?.platform?.toUpperCase().includes("MAC") ? "⌘ (CMD)" : "Alt"
						} and clicking on an input.`}
						htmlFor="bricks_variable_ui"
					>
						<Switch
							onChange={({ target: { checked } }) => handlePreferenceChange("bricks_variable_ui", checked)}
							checked={localPreferences.bricks_variable_ui ?? true}
							id="bricks_variable_ui"
						/>
					</Row>
					<hr />
					<Row
						label="Auto-hide Variable UI"
						description="The modal UI will disappear after selecting a variable or clicking away."
						htmlFor="bricks_enable_variable_ui_auto_hide"
					>
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_enable_variable_ui_auto_hide", checked)
							}
							checked={localPreferences.bricks_enable_variable_ui_auto_hide ?? true}
							id="bricks_enable_variable_ui_auto_hide"
						/>
					</Row>
					<hr />
					<Row
						label="Open Variable UI by right clicking on an input"
						description=""
						htmlFor="bricks_enable_variable_context_menu"
					>
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_enable_variable_context_menu", checked)
							}
							checked={localPreferences.bricks_enable_variable_context_menu ?? true}
							id="bricks_enable_variable_context_menu"
						/>
					</Row>
					<hr />
					{/*<Row
						label="Enable variable autosuggestion dropdown"
						description=""
						htmlFor="bricks_enable_variable_dropdown"
					>
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_enable_variable_dropdown", checked)
							}
							checked={localPreferences.bricks_enable_variable_dropdown ?? true}
							id="bricks_enable_variable_dropdown"
						/>
					</Row> */}
					{/* <Row
						label="Show variable ui hint"
						description="Display hint icon next to input where variable Ui is available."
						htmlFor="bricks_enable_variable_ui_hint"
					>
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_enable_variable_ui_hint", checked)
							}
							checked={localPreferences.bricks_enable_variable_ui_hint ?? true}
							id="bricks_enable_variable_ui_hint"
						/>
					</Row> */}
					<hr />
					<Row label="Display the Dark Mode toggle" description="" htmlFor="bricks_enable_dark_mode_preview">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_enable_dark_mode_preview", checked)
							}
							checked={localPreferences.bricks_enable_dark_mode_preview ?? true}
							id="bricks_enable_dark_mode_preview"
						/>
					</Row>
					<hr />
					<Row label="Preview class on hover" description="" htmlFor="bricks_apply_class_on_hover">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_apply_class_on_hover", checked)
							}
							checked={localPreferences.bricks_apply_class_on_hover ?? true}
							id="bricks_apply_class_on_hover"
						/>
					</Row>
					<hr />
					<Row label="Preview variable on hover" description="" htmlFor="bricks_apply_variable_on_hover">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("bricks_apply_variable_on_hover", checked)
							}
							checked={localPreferences.bricks_apply_variable_on_hover ?? true}
							id="bricks_apply_variable_on_hover"
						/>
					</Row>
					<hr />
					<Row
						label="Enable BEM Class Generator"
						description={`Show BEM class generation icon when hovering over the elements in the structure pane.`}
						htmlFor="bricks_bem_generator"
					>
						<Switch
							onChange={({ target: { checked } }) => handlePreferenceChange("bricks_bem_generator", checked)}
							checked={localPreferences.bricks_bem_generator ?? true}
							id="bricks_bem_generator"
						/>
					</Row>
				</div>
			</div>
		</section>
	);
});

Bricks.displayName = "Bricks";
