import { CssObject, Preset } from "../types";

const convertToPx = (value: string, rootFontSize: any) => {
	const isPx = value.trim().endsWith("px");
	if (isPx) {
		return value.trim();
	}

	const isRem = value.trim().endsWith("rem");
	if (isRem) {
		return `${parseFloat(value) * rootFontSize}px`;
	}
};

const processDeclaration = (declaration, rootFontSize) => {
	const value = declaration.value.trim();
	if (value.startsWith("clamp(")) {
		const [min, _, max] = value.slice(6, -1).split(",");
		const minPx = convertToPx(min, rootFontSize);
		const maxPx = convertToPx(max, rootFontSize);

		return [
			{ ...declaration, value: minPx },
			{ ...declaration, value: maxPx },
		];
	}
	return [declaration, declaration];
};

export const processFluidDeclarations = (objects: CssObject[], preset: Preset) => {
	const rootFontSize = preset?.preferences?.root_font_size || 16;

	return objects?.[0]?.declarations?.reduce(
		(acc, declaration) => {
			const [mobileDeclaration, desktopDeclaration] = processDeclaration(declaration, rootFontSize);
			return {
				mobile: [...acc.mobile, mobileDeclaration],
				desktop: [...acc.desktop, desktopDeclaration],
			};
		},
		{ mobile: [], desktop: [] },
	);
};
