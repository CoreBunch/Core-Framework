import { WpApiProxyProps, syncCSSWithFigma, updatePresetWithFigma } from "functions/wpdb-proxy";
import { saveFigmaProject } from "functions/saveFigmaProject";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { ColorVariable } from "components/modules/colorSystem/types";
import { figmaAtom } from "state/figmaAtom";
import { usePushFigmaSync } from "./usePushFigmaSync";

const extractApiKey = (apiKey: string) => {
	const [pass, url] = [apiKey.slice(0, 24), decodeURIComponent(apiKey.slice(24))];
	return { pass, url };
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
		]);

		if (cssResponse && presetResponse) {
			await handleFigmaPushSync({ preset: props.newPresetData, ...wpApiProxyProps });
			toast.success("Synced successfully");
		}

		props.setIsLoading(false);
	};

	const handleFigmaPush = async (props: HandleFigmaPushProps) => {
		if (!figma.apiKey) {
			try {
				await saveFigmaProject({ preset: props.newPresetData, colorVariables: props.colorVariables });
				toast.success("Synced successfully");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Failed to save the local Figma project.");
			} finally {
				props.setIsLoading(false);
			}
			return;
		}

		await syncWp(props);
	};

	return {
		handleFigmaPush,
	};
}
