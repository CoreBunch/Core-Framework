import postcss from "postcss";

import postcssEasingGradients from "@core-framework/core/functions/postcssEasingGradients";

describe("postcssEasingGradients", () => {
	it("expands an easing function into gradient color stops", async () => {
		const result = await postcss([postcssEasingGradients({ stops: 5 })]).process(
			".example { background: linear-gradient(#000, ease-in-out, #fff); }",
			{ from: undefined },
		);

		expect(result.css).not.toContain("ease-in-out");
		expect(result.css.match(/hsl\(/g)).toHaveLength(5);
		expect(result.css).toMatch(/hsl\([^)]*\) \d+(?:\.\d+)?%/);
		expect(result.css).toContain("linear-gradient(hsl(");
	});

	it("leaves ordinary gradients unchanged", async () => {
		const input = ".example { background: linear-gradient(#000, #fff); }";
		const result = await postcss([postcssEasingGradients()]).process(input, { from: undefined });

		expect(result.css).toBe(input);
	});

	it("preserves a gradient direction", async () => {
		const result = await postcss([postcssEasingGradients({ stops: 3 })]).process(
			".example { background: linear-gradient(to right, red, ease, blue); }",
			{ from: undefined },
		);

		expect(result.css).toContain("linear-gradient(to right,");
		expect(result.css).not.toContain(", ease,");
	});
});
