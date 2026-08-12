import { memo } from "react";
import { Switch } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { Row } from "components/ui/Row";
import { localPreferencesAtom, setLocalPreferencesAtom } from "state";

export const Gutenberg = memo(() => {
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
				<h1>Gutenberg Addon Preferences</h1>

				<div className="grid border-secondary radius bg-overlay-1">
					<Row label="Display the Dark Mode toggle" htmlFor="gutenberg_enable_dark_mode_preview">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("gutenberg_enable_dark_mode_preview", checked)
							}
							checked={localPreferences.gutenberg_enable_dark_mode_preview ?? true}
							id="gutenberg_enable_dark_mode_preview"
						/>
					</Row>

					<hr />

					<Row
						label="Move the Core Framework widget to the top"
						htmlFor="gutenberg_place_controls_at_the_top"
					>
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("gutenberg_place_controls_at_the_top", checked)
							}
							checked={localPreferences.gutenberg_place_controls_at_the_top ?? true}
							id="gutenberg_place_controls_at_the_top"
						/>
					</Row>

					<hr />

					<Row label="Close the widget by default" htmlFor="gutenberg_close_widget_default">
						<Switch
							onChange={({ target: { checked } }) =>
								handlePreferenceChange("gutenberg_close_widget_default", checked)
							}
							checked={localPreferences.gutenberg_close_widget_default ?? true}
							id="gutenberg_close_widget_default"
						/>
					</Row>
				</div>
			</div>
		</section>
	);
});

Gutenberg.displayName = "Bricks";
