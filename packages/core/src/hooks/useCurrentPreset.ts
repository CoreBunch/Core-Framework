import { useCallback, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { getPresetFromCurrentPresetAtom, setCurrentPresetAtom } from "state";

export const useCurrentPreset = () => {
	const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
	const [backup, setBackup] = useState<Preset | null>(null);

	const getCurrentPreset = useAtomCallback(useCallback((get) => get(getPresetFromCurrentPresetAtom), []));

	const saveAndWrite = useSetAtom(setCurrentPresetAtom);

	const saveChanges = useCallback(
		(preset?: Preset) => {
			if (!currentPreset) {
				return;
			}

			saveAndWrite(currentPreset || preset);
		},
		[currentPreset, saveAndWrite],
	);

	const recoverBackup = useCallback(async () => {
		if (!backup) {
			return;
		}

		const myPresetToRecover = JSON.parse(JSON.stringify(backup)) as Preset;

		setCurrentPreset(null);

		await new Promise((resolve) => setTimeout(resolve, 1));

		setCurrentPreset(myPresetToRecover);
		saveChanges(myPresetToRecover);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [backup]);

	useEffect(() => {
		if (currentPreset) {
			return;
		}

		const preset = getCurrentPreset();

		setBackup(preset);
		setCurrentPreset(preset);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	useEffect(saveChanges, [currentPreset]);

	return {
		currentPreset,
		setCurrentPreset,
		saveChanges,
		getCurrentPreset,
		recoverBackup,
	};
};
