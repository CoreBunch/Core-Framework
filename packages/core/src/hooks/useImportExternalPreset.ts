import { useCallback, useState } from "react";
import { devLog } from "functions/devLog";
import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { validatePreset } from "functions/validatePreset";
import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { decodeCompressedString } from "utils";
import { CORE_FILE_FORMAT } from "constants/coreFileName";
import { presetPreferencesSelector, temporaryPresetAtom } from "state";

export const useImportExternalPreset = () => {
	const [externalPreset, setExternalPreset] = useAtom(temporaryPresetAtom);

	const [loading, setLoading] = useState(false);

	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

	const onExternalPresetDrop = useCallback(async ([file]: File[]) => {
		setLoading(true);

		const t1 = performance.now();
		let preset: Preset;

		try {
			const json = file.name.endsWith(`.${CORE_FILE_FORMAT}`)
				? decodeCompressedString(await file.text())
				: await file.text();

			preset = (await JSON.parse(json)) as Preset;
		} catch (e) {
			setLoading(false);
			return console.warn("Invalid preset file");
		}

		const parseReturn = validatePreset(preset);

		if (!parseReturn.success) {
			setLoading(false);
			devLog("Invalid preset file", parseReturn);
			return console.warn("Invalid preset file");
		}

		const preparedPreset = preparePresetToLoad({
			preset,
			oldPreferences: await getPreferences(),
		});

		setExternalPreset(preparedPreset);

		if (performance.now() - t1 < 300) {
			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		setLoading(false);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	return {
		externalPreset,
		setExternalPreset,
		onExternalPresetDrop,
	};
};
