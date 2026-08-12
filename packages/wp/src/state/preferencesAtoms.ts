import { updateWpSettings } from "functions/wpSettings";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { DEFAULT_LOCAL_PREFERENCES } from "data/defaults";

export const localPreferencesAtom = atomWithStorage<Preferences>("preferences", DEFAULT_LOCAL_PREFERENCES);

export const setLocalPreferencesAtom = atom(null, async (_get, set, newPreferences: Preferences) => {
	set(localPreferencesAtom, newPreferences);

	const { success } = await updateWpSettings(newPreferences);

	if (!success) {
		const toastErrorMessage = [
			"Please, deactivate and activate the plugin",
			"and make sure permalink structure is set to option other than plain.",
			"If issue persists please contact support.",
			"[#06]",
		].join(" ");

		toast.error(toastErrorMessage, {
			duration: 15_000,
		});
	}
});
