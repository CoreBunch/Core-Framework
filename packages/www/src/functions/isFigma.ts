export const isFigma = () => {
	return window.__CORE_FRAMEWORK_FIGMA__ === true || window.location.hash.includes("#figma");
};
