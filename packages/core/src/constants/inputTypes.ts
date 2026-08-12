export const CLAMP_INPUT_SUPPORTED_PROPERTIES = [
	"font-size",
	"line-height",
	"letter-spacing",
	"margin",
	"padding",
	"width",
	"height",
	"border-radius",
	"border-width",
	"border-top-width",
	"border-bottom-width",
	"border-left-width",
	"border-right-width",
	"border-top-left-radius",
	"border-top-right-radius",
	"border-bottom-left-radius",
	"border-bottom-right-radius",
	"border-image-width",
	"border-image-outset",
	"border-image-slice",
	"border-image-width",
];

export const COLOR_INPUT_SUPPORTED_PROPERTIES = [
	"color",
	"background-color",
	"border-color",
	"box-shadow",
	"text-shadow",
	"fill",
	"stroke",
	"outline-color",
	"caret-color",
	"column-rule-color",
	"background",
];

export const isColorInputSupportedProperty = (property: string) =>
	COLOR_INPUT_SUPPORTED_PROPERTIES.includes(property);

export const isClampInputSupportedProperty = (property: string) =>
	CLAMP_INPUT_SUPPORTED_PROPERTIES.includes(property);
