import { updatePresetInWebApp } from "functions/web-api";
import { WpApiProxyProps, syncCSSWithFigma, updatePresetWithFigma } from "functions/wpdb-proxy";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { ColorVariable } from "components/modules/colorSystem/types";
import { figmaAtom } from "state/figmaAtom";
import { usePushFigmaSync } from "./usePushFigmaSync";

const extractApiKey = (apiKey: string) => {
	const [pass, url] = [apiKey.slice(0, 24), decodeURIComponent(apiKey.slice(24))];
	return { pass, url };
};

const extractWebSyncKey = (connectionKey: string) => {
	if (!connectionKey.startsWith("cfweb:")) return null;

	const [, presetId, syncToken] = connectionKey.split(":");
	return presetId && syncToken ? { presetId, syncToken } : null;
};

export function usePushFigma() {
	const { handleFigmaPushSync } = usePushFigmaSync();

	const figma = useAtomValue(figmaAtom);

	interface HandleFigmaPushProps {
		readonly newPresetData: Preset;
		readonly setIsLoading: (isLoading: boolean) => void;
		readonly cssString: string;
		readonly colorVariables: ColorVariable[];
	}

	const syncWp = async (props: HandleFigmaPushProps) => {
		const { url } = extractApiKey(figma.apiKey);

		window.parent.postMessage(
			{
				type: "cf-push",
				payload: {
					preset: props.newPresetData,
					colorVariables: props.colorVariables,
				},
			},
			"*",
		);

		const wpApiProxyProps: WpApiProxyProps = {
			apiKey: figma.apiKey,
			url,
		};

		const [cssResponse, presetResponse] = await Promise.all([
			syncCSSWithFigma({ cssString: props.cssString, ...wpApiProxyProps }),
			updatePresetWithFigma({ newPresetData: props.newPresetData, ...wpApiProxyProps }),
			handleFigmaPushSync({ ...wpApiProxyProps }),
		]);

		if (cssResponse && presetResponse) {
			toast.success("Synced successfully");
		}

		props.setIsLoading(false);
	};

	const syncWeb = async (props: HandleFigmaPushProps) => {
		const webSync = extractWebSyncKey(figma.apiKey);

		if (!webSync) {
			toast.error("Invalid Figma connection key");
			props.setIsLoading(false);
			return;
		}

		window.parent.postMessage(
			{
				type: "cf-push",
				payload: {
					preset: props.newPresetData,
					colorVariables: props.colorVariables,
				},
			},
			"*",
		);

		if (props.newPresetData.id !== webSync.presetId) {
			toast.error("Failed to validate preset location");
			props.setIsLoading(false);
			return;
		}

		const response = await updatePresetInWebApp({
			presetId: webSync.presetId,
			syncToken: webSync.syncToken,
			newPresetData: props.newPresetData,
		});

		props.setIsLoading(false);

		if (response) {
			toast.success("Synced successfully");
		}
	};

	const handleFigmaPush = async (props: HandleFigmaPushProps) => {
		if (!figma.apiKey) {
			window.parent.postMessage(
				{
					type: "cf-push-local",
					payload: {
						preset: props.newPresetData,
						colorVariables: props.colorVariables,
					},
				},
				"*",
			);
			await new Promise((resolve) => setTimeout(resolve, 200));
			props.setIsLoading(false);
			console.log("Synced successfully");
			toast.success("Synced successfully");
			return;
		}

		const isWeb = figma.apiKey.startsWith("cfweb:");

		await (isWeb ? syncWeb : syncWp)(props);
	};

	return {
		handleFigmaPush,
	};
}
