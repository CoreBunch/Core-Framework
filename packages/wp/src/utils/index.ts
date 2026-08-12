export * from "@core-framework/core/utils";

export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard) {
			await navigator?.clipboard?.writeText(text);
			return true;
		} else {
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.opacity = "0";
			textArea.style.position = "fixed";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				const success = document.execCommand("copy");
				if (success) {
					(window as any).clipboardData = text;
					document.body.removeChild(textArea);
					return true;
				} else {
					document.body.removeChild(textArea);
					return false;
				}
			} catch (err) {
				document.body.removeChild(textArea);
				return false;
			}
		}
	} catch (err) {
		console.error("Failed to copy text: ", err);
		return false;
	}
}

export async function readClipboard(): Promise<string> {
	if (navigator?.clipboard?.readText) {
		try {
			return await navigator.clipboard.readText();
		} catch (err) {
			return "";
		}
	} else {
		const data = (window as any).clipboardData ?? "";
		delete (window as any).clipboardData;

		return data;
	}
}
