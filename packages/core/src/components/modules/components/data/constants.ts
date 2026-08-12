export const DEFAULT_COMPONENTS_STATE = "default" as const;

export const CUSTOM_COMPONENTS_STATE = "custom" as const;

export const VARIANT_COMPONENTS_STATE = "variant" as const;

export const COMPONENTS_STATES = [
	VARIANT_COMPONENTS_STATE,
	"hover",
	"focus",
	"active",
	"disabled",
	"before",
	"after",
	"checked",
	"invalid",
	"valid",
	"checked",
	"focus-visible",
] as const;

export const AVAILABLE_VARIANTS_WITHOUT_VARIANT = COMPONENTS_STATES.filter((s) => s !== "variant");

export const COMPONENTS_TYPES = [
	"button",
	"input",
	"select",
	"textarea",
	"checkbox",
	"radio",
	"img",
	"icon",
	"hr",
	"link",
	"card",
] as const;

export const COMPONENTS_TAGS_MAP = new Map<(typeof COMPONENTS_TYPES)[number], string>([
	["button", "button"],
	["input", "input"],
	["select", "select"],
	["textarea", "textarea"],
	["checkbox", "input"],
	["radio", "input"],
	["img", "img"],
	["icon", "svg"],
	["hr", "hr"],
	["link", "a"],
	["card", "div"],
]);

export const PREVIEW_BACKGROUNDS = ["transparent", "white", "gray", "black"] as const;
