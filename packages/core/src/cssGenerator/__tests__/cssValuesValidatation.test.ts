import { validateValue } from "../validation";

const cases = [
	{
		property: "width",
		value: "100px",
		result: true,
	},
	{
		property: "width",
		value: "100%",
		result: true,
	},
	{
		property: "width",
		value: "100px",
		result: true,
	},
	{
		property: "width",
		value: "100%",
		result: true,
	},
	{
		property: "width",
		value: "100",
		result: false,
	},
	{
		property: "width",
		value: "ASHUFIJHFUISAHFUIHASUIOFH",
		result: false,
	},
	{
		property: "pointer-events",
		value: "none",
		result: true,
	},
	{
		property: "pointer-events",
		value: "auto",
		result: true,
	},
	{
		property: "pointer-events",
		value: "initial",
		result: true,
	},
	{
		property: "pointer-events",
		value: "inherit",
		result: true,
	},
	{
		property: "pointer-events",
		value: "fasifasohjshaio",
		result: false,
	},
	{
		property: "pointer-events",
		value: "100%",
		result: false,
	},
	{
		property: "counter-increment",
		value: "23",
		result: true,
	},
	{
		property: "counter-increment",
		value: "23",
		result: true,
	},
	{
		property: "counter-increment",
		value: "none",
		result: true,
	},
	{
		property: "counter-increment",
		value: "10px",
		result: false,
	},
	{
		property: "z-index",
		value: "10",
		result: true,
	},
	{
		property: "z-index",
		value: "10px",
		result: false,
	},
	{
		property: "z-index",
		value: "10%",
		result: false,
	},
	{
		property: "z-index",
		value: "10em",
		result: false,
	},
	{
		property: "z-index",
		value: "10rem",
		result: false,
	},
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
		property: "counter-increment",
		value: "10px",
		result: false,
	},
	{
		property: "transition",
		value: "all 0.5s ease-in-out",
		result: true,
	},
	{
		property: "--transition",
		value: "all 0.5s ease-in-out",
		result: true,
	},
	{
		property: "--border",
		value: "any value",
		result: true,
	},
	{
		property: "--red",
		value: "red",
		result: true,
	},
	{
		property: "--green",
		value: "green",
		result: true,
	},
	{
		property: "animation-duration",
		value: "1s",
		result: true,
	},
	{
		property: "animation-duration",
		value: "1ms",
		result: true,
	},
	{
		property: "animation-duration",
		value: "1",
		result: false,
	},
	{
		property: "INVALID",
		value: "1",
		result: false,
	},
] as const;

test.each(cases)("Validating CSS values", ({ property, value, result }) => {
	expect(validateValue(property, value)).toBe(result);
});
