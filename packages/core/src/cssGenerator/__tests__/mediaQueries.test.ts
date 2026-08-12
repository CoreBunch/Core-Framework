import { cssGenerator } from "../cssGenerator";
import { generateMediaQueryOption } from "cssGenerator/generator/mediaQuery";

test("test generateMediaQueryOption", () => {
	expect(generateMediaQueryOption([0, 999])).toBe("(max-width: 999px)");
	expect(generateMediaQueryOption([1000, 0])).toBe("(min-width: 1000px)");
	expect(generateMediaQueryOption([1000, 999])).toBe("(min-width: 999px) and (max-width: 1000px)");
	expect(generateMediaQueryOption([999, 1000])).toBe("(min-width: 999px) and (max-width: 1000px)");
});

const cssObjects: CssObject[] = [
	{
		id: "1",
		selector: ".test",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
		variants: [
			{
				id: "1",
				mediaQuery: [0, 300],
				declarations: [
					{
						property: "width",
						value: "80%",
						id: "1",
					},
				],
			},
		],
	},
];

const result = `
.test {
    width: 100%;
}
@media (max-width: 300px) {
    .test {
        width: 80%;
    }
}
`.replaceAll(/\s/g, "");

const options = {
	format: true,
	combineSelectors: true,
	styleSheetValidation: false,
};

test(`Generate css with variants | ${JSON.stringify(options)}`, async () => {
	expect(
		(
			await cssGenerator({
				cssObjects,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result);
});

const cssObjects2: CssObject[] = [
	{
		id: "1",
		selector: ".test2",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
		variants: [
			{
				id: "1",
				mediaQuery: [100, 200],
				declarations: [
					{
						property: "width",
						value: "80%",
						id: "1",
					},
				],
			},
		],
	},
];

const result2 = `
.test2 {
    width: 100%;
}
@media (min-width: 100px) and (max-width: 200px) {
    .test2 {
        width: 80%;
    }
}
`.replaceAll(/\s/g, "");

test(`Generate css with variants | ${JSON.stringify(options)}`, async () =>
	expect(
		(
			await cssGenerator({
				cssObjects: cssObjects2,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result2));

const cssObjectsWithTwoVariants: CssObject[] = [
	{
		id: "1",
		selector: ".test3",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
		variants: [
			{
				id: "1",
				mediaQuery: [0, 300],
				declarations: [
					{
						property: "width",
						value: "80%",
						id: "1",
					},
				],
			},
			{
				id: "1",
				mediaQuery: [600, 900],
				declarations: [
					{
						property: "width",
						value: "60%",
						id: "1",
					},
				],
			},
		],
	},
];

const result3 = `
.test3 {
    width: 100%;
}
@media (max-width: 300px) {
    .test3 {
        width: 80%;
    }
}
@media (min-width: 600px) and (max-width: 900px) {
    .test3 {
        width: 60%;
    }
}
`.replaceAll(/\s/g, "");

test(`Generate css with variants | ${JSON.stringify(options)}`, async () => {
	expect(
		(
			await cssGenerator({
				cssObjects: cssObjectsWithTwoVariants,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result3);
});

const cssObjectsWithThreeVariants: CssObject[] = [
	{
		id: "1",
		selector: ".test4",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
		variants: [
			{
				id: "1",
				mediaQuery: [0, 100],
				declarations: [
					{
						property: "width",
						value: "80%",
						id: "1",
					},
				],
			},
			{
				id: "1",
				mediaQuery: [100, 200],
				declarations: [
					{
						property: "width",
						value: "60%",
						id: "1",
					},
				],
			},
			{
				id: "1",
				mediaQuery: [300, 0],
				declarations: [
					{
						property: "width",
						value: "40%",
						id: "1",
					},
				],
			},
		],
	},
];

const result4 = `
.test4 {
    width: 100%;
}
@media (max-width: 100px) {
    .test4 {
        width: 80%;
    }
}
@media (min-width: 100px) and (max-width: 200px) {
    .test4 {
        width: 60%;
    }
}
@media (min-width: 300px) {
    .test4 {
        width: 40%;
    }
}
`.replaceAll(/\s/g, "");

test(`Generate css with variants | ${JSON.stringify(options)}`, async () => {
	expect(
		(
			await cssGenerator({
				cssObjects: cssObjectsWithThreeVariants,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result4);
});

const cssObjects3 = [
	{
		id: "1",
		selector: ".first",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
	},
	{
		id: "2",
		selector: ".second",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
	},
];

const result5 = `
@media (max-width: 300px) {
	.first {
		width: 100%;
	}
	.second {
		width: 100%;
	}
}
`.replaceAll(/\s/g, "");

test(`Generate one media query with two selectors | ${JSON.stringify(options)}`, async () =>
	expect(
		(
			await cssGenerator({
				cssObjects: cssObjects3,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result5));

const cssObjects4 = [
	{
		id: "1",
		selector: ".first",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
	},
	{
		id: "2",
		selector: ".second",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "height",
				value: "100%",
				id: "1",
			},
		],
	},
	{
		id: "3",
		selector: ".third",
		mediaQuery: [500, 1000],
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
	},
	{
		id: "4",
		selector: ".fourth",
		mediaQuery: [500, 1000],
		declarations: [
			{
				property: "height",
				value: "100%",
				id: "1",
			},
		],
	},
	{
		id: "5",
		selector: ".fifth",
		mediaQuery: [1000, 1500],
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "1",
			},
		],
	},
];

const result6 = `
@media (min-width: 1000px) and (max-width: 1500px) {
	.fifth {
		width:100%;
	}
}
@media (min-width: 500px) and (max-width: 1000px) {
	.third {
		width:100%;
	}
	.fourth { height:100%;
	}
}
@media(max-width:300px) {
	.first {
		width:100%;
	}
	.second {
		height:100%;
	}
}
`.replaceAll(/\s/g, "");

test(`Generate multiple media queries with multiple selectors | ${JSON.stringify(options)}`, async () =>
	expect(
		(
			await cssGenerator({
				cssObjects: cssObjects4,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result6));
