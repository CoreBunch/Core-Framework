import { validateProperty } from "../validation";

const cases = [
	{
		property: "width",
		result: true,
	},
	{
		property: "pointer-events",
		result: true,
	},
	{
		property: "counter-increment",
		result: true,
	},
	{
		property: "transition",
		result: true,
	},
	{
		property: "color",
		result: true,
	},
	{
		property: "background-color",
		result: true,
	},
	{
		property: "background",
		result: true,
	},
	{
		property: "background-image",
		result: true,
	},
	{
		property: "background-position",
		result: true,
	},
	{
		property: "background-size",
		result: true,
	},
	{
		property: "background-repeat",
		result: true,
	},
	{
		property: "background-attachment",
		result: true,
	},
	{
		property: "background-clip",
		result: true,
	},
	{
		property: "background-origin",
		result: true,
	},
	{
		property: "background-blend-mode",
		result: true,
	},
	{
		property: "border",
		result: true,
	},
	{
		property: "border-top",
		result: true,
	},
	{
		property: "border-right",
		result: true,
	},
	{
		property: "border-bottom",
		result: true,
	},
	{
		property: "border-left",
		result: true,
	},
	{
		property: "border-color",
		result: true,
	},
	{
		property: "fsasfa",
		result: false,
	},
	{
		property: "fsdassafsfa",
		result: false,
	},
	{
		property: "f342342sasfa",
		result: false,
	},
	{
		property: "342",
		result: false,
	},
	{
		property: "--c-border",
		result: true,
	},
] as const;

test.each(cases)("Validating CSS values", ({ property, result }) => {
	expect(validateProperty(property)).toBe(result);
});
