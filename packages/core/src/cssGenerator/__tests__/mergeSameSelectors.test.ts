import { mergeSameSelectors } from "cssGenerator/generator/mergeSameSelectors";

const cssObjects: CssObject[] = [
	{
		id: "1",
		selector: "body",
		declarations: [
			{
				property: "color",
				value: "red",
				id: "1",
			},
		],
	},
	{
		id: "2",
		selector: "body",
		declarations: [
			{
				property: "background-color",
				value: "blue",
				id: "2",
			},
		],
	},
];

const expectedResults: CssObject[] = [
	{
		id: "1",
		selector: "body",
		declarations: [
			{
				property: "color",
				value: "red",
				id: "1",
			},
			{
				property: "background-color",
				value: "blue",
				id: "2",
			},
		],
	},
];

test("Merge same selectors", () => expect(mergeSameSelectors(cssObjects)).toEqual(expectedResults));

const cssObjects2: CssObject[] = [
	{
		id: "1",
		selector: "body",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "color",
				value: "red",
				id: "1",
			},
		],
	},
	{
		id: "2",
		selector: "body",
		declarations: [
			{
				property: "background-color",
				value: "blue",
				id: "2",
			},
		],
	},
];

const expectedResults2: CssObject[] = [
	{
		id: "1",
		selector: "body",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "color",
				value: "red",
				id: "1",
			},
		],
	},
	{
		id: "2",
		selector: "body",
		declarations: [
			{
				property: "background-color",
				value: "blue",
				id: "2",
			},
		],
	},
];

test("Don't merge selectors with different media queries", () =>
	expect(mergeSameSelectors(cssObjects2)).toEqual(expectedResults2));

const cssObjects3: CssObject[] = [
	{
		id: "1",
		selector: "body",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "color",
				value: "red",
				id: "1",
			},
		],
	},
	{
		id: "2",
		selector: "body",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "background-color",
				value: "blue",
				id: "2",
			},
		],
	},
];

const expectedResults3: CssObject[] = [
	{
		id: "1",
		selector: "body",
		mediaQuery: [0, 300],
		declarations: [
			{
				property: "color",
				value: "red",
				id: "1",
			},
			{
				property: "background-color",
				value: "blue",
				id: "2",
			},
		],
	},
];

test("Merge selectors with same media queries", () =>
	expect(mergeSameSelectors(cssObjects3)).toEqual(expectedResults3));
