export * from "@core-framework/core/utils";

import { isEmbed } from "functions/isEmbed";

export async function copyToClipboard(text: string): Promise<boolean> {
	if (isEmbed()) {
		window.parent.postMessage(
			{
				type: "cf-copy-to-clipboard",
				text,
			},
			"*",
		);
		return true;
	}

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error("Failed to copy text: ", err);
		return false;
	}
}

export async function readClipboard() {
	if (isEmbed()) {
		return new Promise<string>((resolve) => {
			window.parent.postMessage(
				{
					type: "cf-read-clipboard",
				},
				"*",
			);
			window.addEventListener(
				"message",
				(event) => {
					if (event.data.type === "cf-read-clipboard") resolve(event.data.text);
				},
				{
					once: true,
				},
			);
		});
	}

	return await navigator?.clipboard?.readText();
}
