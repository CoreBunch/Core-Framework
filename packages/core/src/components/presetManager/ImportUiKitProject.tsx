import { useCallback, useState } from "react";
import { Select } from "@mantine/core";
import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { validatePreset } from "functions/validatePreset";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { z } from "zod";
import { Loader } from "components/basic/Loader";
import { presetPreferencesSelector } from "state";

const projects = [{ id: "01HNWT819FT272ZBTXK14Z9QT3", value: "01HNWT819FT272ZBTXK14Z9QT3", label: "Violet" }];

interface IImportUiKitProject {
	readonly setExternalPreset: (preset: Preset) => void;
}

export const ImportUiKitProjectForm = ({ setExternalPreset }: IImportUiKitProject) => {
	const [isLoading, setIsLoading] = useState(false);

	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

	const onSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setIsLoading(true);

			const form = e.currentTarget;
			const input = form.querySelector("input");
			const id = input?.value.trim() ?? "";

			try {
				const response = await fetch(
					`https://us-central1-core-framework-6bdc9.cloudfunctions.net/getPreset?id=${id}`,
				);

				const json = await response.json();

				const schema = z.object({
					success: z.boolean(),
					data: z
						.object({
							json: z.string(),
						})
						.optional(),
				});

				const parsed = schema.parse(json);

				if (!parsed.success || !parsed.data) {
					setIsLoading(false);
					return toast.error("Something went wrong");
				}

				const preset = JSON.parse(parsed.data.json) as Preset;

				const parseReturn = validatePreset(preset);

				if (!parseReturn.success) {
					setIsLoading(false);
					return toast.error("Project is not valid");
				}

				const preparedPreset = preparePresetToLoad({
					preset,
					oldPreferences: await getPreferences(),
				});

				setExternalPreset(preparedPreset);
				setIsLoading(false);
			} catch (e) {
				setIsLoading(false);
				toast.error("Something went wrong [#1]");
				console.warn(e);
			}
		},
		[getPreferences, setExternalPreset],
	);

	return (
		<div className="grid padding-l radius align-center gap-m bg-overlay-1">
			<div className="grid gap-xs">
				<h4>Select your UI Kit or template</h4>
			</div>

			<form onSubmit={onSubmit} className="row align-center gap-s full-width">
				<Select
					data={projects}
					className="full-width"
					defaultValue={projects[0]?.value}
					style={{ flex: 1 }}
				/>

				{isLoading ? (
					<Loader />
				) : (
					<button type="submit" className="btn-tertiary btn-l">
						Import
					</button>
				)}
			</form>
		</div>
	);
};
