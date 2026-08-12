import { Fonts } from "../assets/icons/Fonts.icon";
import { Stylesheets } from "../assets/icons/Stylesheets.icon";
import { CheckboxItemGrid } from "assets/icons/CheckboxItemGrid.icon";
import { ColorPalette } from "assets/icons/ColorPalette.icon";
import { EditSquare } from "assets/icons/EditSquare.icon";
import { ImportExport } from "assets/icons/ImportExport.icon";
import { Layouts } from "assets/icons/Layouts.icon";
import { PenEditCircle } from "assets/icons/PenEditCircle.icon";
import { Settings } from "assets/icons/Settings.icon";
import { Spacing } from "assets/icons/Spacing.icon";
import { Typography } from "assets/icons/Typography.icon";

export const NAV_ITEMS = [
	{
		name: "Colors",
		icon: ColorPalette,
		value: "COLOR_SYSTEM",
	},
	{
		name: "Typography",
		icon: Typography,
		value: "TYPOGRAPHY",
	},
	{
		name: "Spacing",
		icon: Spacing,
		value: "SPACING",
	},
	{
		name: "Components",
		icon: CheckboxItemGrid,
		value: "COMPONENTS",
	},
	{
		name: "Layouts",
		icon: Layouts,
		value: "LAYOUTS",
	},
	{
		name: "Design",
		icon: PenEditCircle,
		value: "DESIGN",
	},
	{
		name: "Fonts",
		icon: Fonts,
		value: "FONTS",
	},
	{
		name: "Stylesheets",
		icon: Stylesheets,
		value: "STYLESHEETS",
	},
	{
		name: "Other",
		icon: EditSquare,
		value: "OTHER",
	},
] as const;

export const NAV_ITEMS_BOTTOM = [
	{
		name: "Manage project",
		icon: ImportExport,
		value: "IMPORT_EXPORT",
	},
	{
		name: "Preferences",
		icon: Settings,
		value: "PREFERENCES",
	},
] as const;
