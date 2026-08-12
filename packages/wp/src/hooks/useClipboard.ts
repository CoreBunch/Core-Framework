import { useState } from "react";

type CopyFn = (text: string) => Promise<boolean>;

const TIMEOUT = 1500;

export function useCopyToClipboard() {
	const [isCopied, setIsCopied] = useState(false);

	const copy: CopyFn = async (text) => {
		if (!navigator?.clipboard) {
			console.warn("Clipboard not supported");
			return false;
		}

		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);

			setTimeout(() => {
				setIsCopied(false);
			}, TIMEOUT);

			return true;
		} catch (error) {
			console.warn("Copy failed", error);
			return false;
		}
	};

	return { isCopied, copy };
}
