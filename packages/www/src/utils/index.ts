export * from "@core-framework/core/utils";

import { EMBED_READ_CLIPBOARD, waitForEmbedMessage } from "functions/embedBridge";
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
		const reply = waitForEmbedMessage<{ text?: string }>(EMBED_READ_CLIPBOARD);
		window.parent.postMessage({ type: EMBED_READ_CLIPBOARD }, "*");

		return (await reply)?.text ?? "";
	}

	return await navigator?.clipboard?.readText();
}
