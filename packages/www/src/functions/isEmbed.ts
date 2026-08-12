import { isFigma } from "./isFigma";

export const isEmbed = () => {
	return window.top !== window.self;
};

export const isEmbedOrLocalhost = () => {
	return (
		isEmbed() ||
		window.location.hostname === "localhost" ||
		window.location.hostname.includes("core-framework-git-") ||
		isFigma()
	);
};
