import { ulid } from "ulid";

export * from '@core-framework/core/data/defaults';

// WP-only defaults

export const DEFAULT_LOCAL_PREFERENCES = {
	selected_id: "",
	root_font_size: 16,
} as const;

export const DEFAULT_EXPAND_CLICK_CLASSNAME = ".expand-click";
export const DEFAULT_EXPAND_CLICK: CssObject[] = [
	{
		id: ulid(),
		selector: `${DEFAULT_EXPAND_CLICK_CLASSNAME}:not(a)`,
		declarations: [
			{
				id: ulid(),
				property: "position",
				value: "static",
				fluidValue: [0, 0, "px"],
			},
		],
	},
	{
		id: ulid(),
		selector: `${DEFAULT_EXPAND_CLICK_CLASSNAME}:not(a) a`,
		declarations: [
			{
				id: ulid(),
				property: "position",
				value: "static",
				fluidValue: [0, 0, "px"],
			},
		],
	},
	{
		id: ulid(),
		selector: `${DEFAULT_EXPAND_CLICK_CLASSNAME}:not(a) > a:before`,
		declarations: [
			{
				id: ulid(),
				property: "content",
				value: "''",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "position",
				value: "absolute",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "inset",
				value: "0",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "cursor",
				value: "pointer",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "display",
				value: "flex",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "z-index",
				value: "2",
				fluidValue: [0, 0, "px"],
			},
		],
	},
	{
		id: ulid(),
		selector: `a${DEFAULT_EXPAND_CLICK_CLASSNAME}`,
		declarations: [
			{
				id: ulid(),
				property: "position",
				value: "static",
				fluidValue: [0, 0, "px"],
			},
		],
	},
	{
		id: ulid(),
		selector: `a${DEFAULT_EXPAND_CLICK_CLASSNAME}:before`,
		declarations: [
			{
				id: ulid(),
				property: "content",
				value: "''",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "position",
				value: "absolute",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "inset",
				value: "0",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "cursor",
				value: "pointer",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "display",
				value: "flex",
				fluidValue: [0, 0, "px"],
			},
		],
	},
	{
		id: ulid(),
		selector: `${DEFAULT_EXPAND_CLICK_CLASSNAME}:focus-within:after`,
		declarations: [
			{
				id: ulid(),
				property: "content",
				value: "''",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "position",
				value: "absolute",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "inset",
				value: "-2px",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "z-index",
				value: "1",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "outline",
				value: "2px solid var(--primary)",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "outline-offset",
				value: "2px",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "display",
				value: "var(--after-display)",
				fluidValue: [0, 0, "px"],
			},
		],
	},
	{
		id: ulid(),
		selector: `${DEFAULT_EXPAND_CLICK_CLASSNAME}:focus-within:focus`,
		declarations: [
			{
				id: ulid(),
				property: "outline",
				value: "none",
				fluidValue: [0, 0, "px"],
			},
		],
	},
];

export const DEFAULT_SR_ONLY_CLASSNAME = ".sr-only";
export const DEFAULT_SR_ONLY: CssObject[] = [
	{
		id: ulid(),
		selector: `${DEFAULT_SR_ONLY_CLASSNAME}`,
		declarations: [
			{
				id: ulid(),
				property: "position",
				value: "absolute",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "width",
				value: "1px",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "height",
				value: "1px",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "padding",
				value: "0",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "margin",
				value: "-1px",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "overflow",
				value: "hidden",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "clip-path",
				value: "inset(0 100% 100% 0)",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "white-space",
				value: "nowrap",
				fluidValue: [0, 0, "px"],
			},
			{
				id: ulid(),
				property: "border-width",
				value: "0",
				fluidValue: [0, 0, "px"],
			},
		],
	},
];
