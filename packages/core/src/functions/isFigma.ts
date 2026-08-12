export const isFigma = () => {
	const figmaWindow = window as Window & { __CORE_FRAMEWORK_FIGMA__?: boolean };
	return figmaWindow.__CORE_FRAMEWORK_FIGMA__ === true || window.location.hash.includes("#figma");
};
