import { validateCSS } from "../utils/validateCSS";

describe("validateCSS", () => {
	test("accepts multiline block comments containing selector-like text", () => {
		const css = `/* =========================================
HOVER ROWS
Excludes:
- first header,
- section titles,
- header after a section title
========================================= */
.price-table td {
	color: red;
}`;

		expect(validateCSS(css)).toMatchObject({
			isValid: true,
			errors: [],
		});
	});

	test("accepts comma-separated selectors split across lines", () => {
		const css = `.test1,
.test2 {
	color: red;
}`;

		expect(validateCSS(css)).toMatchObject({
			isValid: true,
			errors: [],
		});
	});

	test("accepts the reported multiline :has() selector list", () => {
		const css = `.pricing table tbody > tr:has(> td:first-child a):hover > td:nth-child(7),
.pricing table tbody > tr:has(> td:first-child a):hover > td:nth-child(12) {
	background-color: var(--table-hover);
	background-image: none;
}`;

		expect(validateCSS(css)).toMatchObject({
			isValid: true,
			errors: [],
		});
	});

	test("accepts selectors continued across lines", () => {
		const css = `.parent >
.child {
	color: red;
}`;

		expect(validateCSS(css)).toMatchObject({
			isValid: true,
			errors: [],
		});
	});

	test.each([
		["a missing opening brace", `.test\ncolor: red;`],
		["a missing closing brace", `.test {\n\tcolor: red;`],
	])("continues to reject %s", (_name, css) => {
		expect(validateCSS(css).isValid).toBe(false);
	});
});
