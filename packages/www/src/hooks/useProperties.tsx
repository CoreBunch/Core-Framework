import { useMemo } from "react";
import { ColorModule } from "../components/modules/colorSystem";
import { FontsTab } from "../components/modules/fonts";
import { SpacingTabs } from "../components/modules/spacing";
import { StylesheetsTabs } from "../components/modules/stylesheets";
import { FluidTypographyTabs } from "../components/modules/typography";
import { PrimitiveAtom } from "jotai";
import { Components } from "components/modules/components";
import { propertyGroups } from "constants/properties";
import {
	colorStylesAtom,
	componentsStylesAtom,
	designStylesAtom,
	fontsStylesAtom,
	layoutsStylesAtom,
	otherStylesAtom,
	spacingStylesAtom,
	stylesheetsStylesAtom,
	typographyStylesAtom,
} from "state";

type usePropertiesReturn = {
	[key in keyof typeof propertyGroups]: {
		atom: PrimitiveAtom<StylesGroup[]>;
		groupKey: StylesheetDataKeys;
		title: string;
		components?: JSX.Element[];
	};
};

export function useProperties(): usePropertiesReturn {
	// Memoize the components to prevent re-creation on every render
	const colorModule = useMemo(() => <ColorModule key="color-pickers" />, []);
	const typographyModule = useMemo(() => <FluidTypographyTabs key="fluid-typography-calculator" />, []);
	const spacingModule = useMemo(() => <SpacingTabs key="spacing-calculator" />, []);
	const fontsModule = useMemo(() => <FontsTab key="fonts" />, []);
	const componentsModule = useMemo(() => <Components key="components" />, []);
	const stylesheetsModule = useMemo(() => <StylesheetsTabs key="stylesheets" />, []);

	// Memoize the entire return object
	return useMemo(
		() => ({
			COLOR_SYSTEM: {
				atom: colorStylesAtom,
				groupKey: "colorStyles",
				title: "Color System",
				components: [colorModule],
			},
			TYPOGRAPHY: {
				atom: typographyStylesAtom,
				groupKey: "typographyStyles",
				title: "Typography",
				components: [typographyModule],
			},
			SPACING: {
				atom: spacingStylesAtom,
				groupKey: "spacingStyles",
				title: "Spacing",
				components: [spacingModule],
			},
			LAYOUTS: {
				atom: layoutsStylesAtom,
				groupKey: "layoutsStyles",
				title: "Layouts",
			},
			DESIGN: {
				atom: designStylesAtom,
				groupKey: "designStyles",
				title: "Design",
			},
			FONTS: {
				atom: fontsStylesAtom,
				groupKey: "fontsStyles",
				title: "Fonts",
				components: [fontsModule],
			},
			COMPONENTS: {
				atom: componentsStylesAtom,
				groupKey: "componentsStyles",
				title: "Components",
				components: [componentsModule],
			},
			STYLESHEETS: {
				atom: stylesheetsStylesAtom,
				groupKey: "stylesheetsStyles",
				title: "Stylesheets",
				components: [stylesheetsModule],
			},
			OTHER: {
				atom: otherStylesAtom,
				groupKey: "otherStyles",
				title: "Other",
			},
		}),
		[colorModule, typographyModule, spacingModule, fontsModule, componentsModule, stylesheetsModule],
	);
}
