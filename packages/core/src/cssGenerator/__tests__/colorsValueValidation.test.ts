import { validateValue } from "../validation";

const backgroundColors = [
	{
		property: "background-color",
		value: "red",
		result: true,
	},
	{
		property: "background-color",
		value: "rgb(255, 255, 255)",
		result: true,
	},
	{
		property: "background-color",
		value: "rgba(255, 255, 255, 0.5)",
		result: true,
	},
	{
		property: "background-color",
		value: "hsl(0, 0%, 100%)",
		result: true,
	},
	{
		property: "background-color",
		value: "hsla(0, 0%, 100%, 0.5)",
		result: true,
	},
	{
		property: "background-color",
		value: "transparent",
		result: true,
	},
	{
		property: "background-color",
		value: "currentColor",
		result: true,
	},
	{
		property: "background-color",
		value: "#ff0000",
		result: true,
	},
];

test.each(backgroundColors)("Validate CSS colors | without nested values ", ({ property, value, result }) => {
	expect(validateValue(property, value)).toBe(result);
});

const backgrounds = [
	{
		property: "background",
		value: "red",
		result: true,
	},
	{
		property: "background",
		value: "rgb(255, 255, 255)",
		result: true,
	},
	{
		property: "background",
		value: "rgba(255, 255, 255, 0.5)",
		result: true,
	},
	{
		property: "background",
		value: "hsl(0, 0%, 100%)",
		result: true,
	},
	{
		property: "background",
		value: "hsla(0, 0%, 100%, 0.5)",
		result: true,
	},
	{
		property: "background",
		value: "transparent",
		result: true,
	},
	{
		property: "background",
		value: "currentColor",
		result: true,
	},
	{
		property: "background",
		value: "#ff0000",
		result: true,
	},
	{
		property: "background",
		value: "rab(255, 255, 255)",
		result: false,
	},
];

test.each(backgrounds)("Validate CSS colors | with nested values ", ({ property, value, result }) => {
	expect(validateValue(property, value)).toBe(result);
});

const borderColors = [
	{
		property: "border-color",
		value: "red",
		result: true,
	},
	{
		property: "border-color",
		value: "#ff0000",
		result: true,
	},
	{
		property: "border-color",
		value: "rgb(255, 255, 255)",
		result: true,
	},
	{
		property: "border-color",
		value: "rgba(255, 255, 255, 0.5)",
		result: true,
	},
	{
		property: "border-color",
		value: "hsl(0, 0%, 100%)",
		result: true,
	},
	{
		property: "border-color",
		value: "hsla(0, 0%, 100%, 0.5)",
		result: true,
	},
	{
		property: "border-color",
		value: "transparent",
		result: true,
	},
	{
		property: "border-color",
		value: "currentColor",
		result: true,
	},
	{
		property: "border-color",
		value: "rab(255, 255, 255)",
		result: false,
	},
];

test.each(borderColors)(
	"Validate CSS colors | with nested values | border-color",
	({ property, value, result }) => {
		expect(validateValue(property, value)).toBe(result);
	},
);
