import { toast } from "sonner";

export interface WebApiProps {
	readonly presetId: string;
	readonly syncToken: string;
}

const G_CLOUD_FUNCTION_BASE = "https://us-central1-core-framework-6bdc9.cloudfunctions.net";

interface updatePresetInWebAppProps extends WebApiProps {
	readonly newPresetData: Preset;
}

export async function updatePresetInWebApp({
	newPresetData,
	presetId,
	syncToken,
}: updatePresetInWebAppProps) {
	try {
		const response = await fetch(`${G_CLOUD_FUNCTION_BASE}/figmaPreset?presetId=${presetId}`, {
			method: "POST",
			body: JSON.stringify({ preset: JSON.stringify(newPresetData) }),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${syncToken}`,
			},
		});

		return response.ok;
	} catch (error) {
		toast.error("Failed to update project");
		return false;
	}
}
