import { APP_VERSION } from "constants/version";
import { devLog } from "./devLog";

function removeLegacyColorItemProperties(preset: Preset) {
	const { modulesData } = preset;
	const colorSystemData = modulesData?.COLOR_SYSTEM;

	if (!colorSystemData) {
		return preset;
	}

	const propertiesToRemove = ["genBg", "genText"] as const;

	for (const property of propertiesToRemove) {
		if (colorSystemData?.[property]) {
			delete colorSystemData[property];

			devLog(`Removed legacy property: ${property}`);
		}
	}

	return preset;
}

function addAppVersion(preset: Preset) {
	preset.app_version = APP_VERSION;

	return preset;
}

function removeUnwantedProperties(preset: Preset) {
	/*
		isVariablePrefix was used on one site and is kept to make sure one guy doesn't lose his project, can be removed in 0.0.5
	*/

	const propertiesToRemove = ["cssString", "isVariablePrefix"];

	for (const property of propertiesToRemove) {
		if (preset?.[property as keyof Preset]) {
			delete preset[property as keyof Preset];
		}
	}

	return preset;
}

export function sanitizePreset(preset: Preset): Preset {
	let _preset = JSON.parse(JSON.stringify(preset)) as Preset; // todo replace with structured clone if possible

	_preset = removeLegacyColorItemProperties(_preset);
	_preset = addAppVersion(_preset);
	_preset = removeUnwantedProperties(_preset);

	return _preset;
}
