import { memo } from "react";
import { Switch } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { Row } from "components/ui/Row";
import { localPreferencesAtom, setLocalPreferencesAtom } from "state";
import { isOxygen6Atom } from "state/activeBuildersAtoms";

export const Oxygen = memo(() => {
	const localPreferences = useAtomValue(localPreferencesAtom);
	const setPreferences = useSetAtom(setLocalPreferencesAtom);
	const isOxygen6 = useAtomValue(isOxygen6Atom);

	const handlePreferenceChange = (key: keyof Preferences, value: boolean | number) =>
		setPreferences({
			...localPreferences,
			[key]: value,
		});

	return (
		<section id="addons" className="section">
			<div className="subsection">
				<h1>Oxygen Addon Preferences</h1>

				<div className="grid border-secondary radius bg-overlay-1">
					{!isOxygen6 && (
						<>
							<Row
								label="Enable Variable UI"
								description={`Open by holding down ${
									navigator?.platform?.toUpperCase().includes("MAC") ? "⌘ (CMD)" : "Alt"
								} and clicking on an input.`}
								htmlFor="oxygen_variable_ui"
							>
								<Switch
									onChange={({ target: { checked } }) => handlePreferenceChange("oxygen_variable_ui", checked)}
									checked={localPreferences.oxygen_variable_ui ?? true}
									id="oxygen_variable_ui"
								/>
							</Row>
							<hr />
							<Row
								label="Auto-hide Variable UI"
								description="The modal UI will disappear after selecting a variable or clicking away."
								htmlFor="oxygen_enable_variable_ui_auto_hide"
							>
								<Switch
									onChange={({ target: { checked } }) =>
										handlePreferenceChange("oxygen_enable_variable_ui_auto_hide", checked)
									}
									checked={localPreferences.oxygen_enable_variable_ui_auto_hide ?? true}
									id="oxygen_enable_variable_ui_auto_hide"
								/>
							</Row>
							<hr />
							<Row
								label="Open Variable UI by right clicking on an input"
								description=""
								htmlFor="oxygen_enable_variable_context_menu"
							>
								<Switch
									onChange={({ target: { checked } }) =>
										handlePreferenceChange("oxygen_enable_variable_context_menu", checked)
									}
									checked={localPreferences.oxygen_enable_variable_context_menu ?? true}
									id="oxygen_enable_variable_context_menu"
								/>
							</Row>
							<hr />
							<Row
								label="Enable dropdowns for variables"
								description=""
								htmlFor="oxygen_enable_variable_dropdown"
							>
								<Switch
									onChange={({ target: { checked } }) =>
										handlePreferenceChange("oxygen_enable_variable_dropdown", checked)
									}
									checked={localPreferences.oxygen_enable_variable_dropdown ?? true}
									id="oxygen_enable_variable_dropdown"
								/>
							</Row>
							<hr />
						</>
					)}
					<Row label="Display the Dark Mode toggle" description="" htmlFor="oxygen_enable_dark_mode_preview">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("oxygen_enable_dark_mode_preview", checked)
							}
							checked={localPreferences.oxygen_enable_dark_mode_preview ?? true}
							id="oxygen_enable_dark_mode_preview"
						/>
					</Row>
					<hr />
					<Row label="Preview class on hover" description="" htmlFor="oxygen_apply_class_on_hover">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("oxygen_apply_class_on_hover", checked)
							}
							checked={localPreferences.oxygen_apply_class_on_hover ?? true}
							id="oxygen_apply_class_on_hover"
						/>
					</Row>
					<hr />
					<Row
						label={
							isOxygen6
								? "Preview variable value on hover in variable dropdown"
								: "Automatically set unit to 'none' and preview value on hover in variable dropdown/UI"
						}
						description=""
						htmlFor="oxygen_enable_unit_and_value_preview"
					>
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("oxygen_enable_unit_and_value_preview", checked)
							}
							checked={localPreferences.oxygen_enable_unit_and_value_preview ?? true}
							id="oxygen_enable_unit_and_value_preview"
						/>
					</Row>
				</div>
			</div>
		</section>
	);
});

Oxygen.displayName = "Oxygen";
