import { cssGenerator } from "../cssGenerator";

const cssObjects: CssObject[] = [
	{
		id: "01",
		selector: ".only-selector",
		declarations: [
			{
				property: "height",
				value: "100%",
				id: "01",
			},
		],
	},
	{
		id: "01",
		selector: ".only-selector",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: "01",
			},
		],
	},
];

const combinedResult = ".only-selector{height:100%;width:100%;}";
const options = {
	combineSelectors: true,
};

test(`Should return one rule with two declarations | ${JSON.stringify(options)}`, async () => {
	const string = await cssGenerator({
		cssObjects,
		options,
	});
	return expect(string.replace(/\s/g, "")).toBe(combinedResult);
});

const notCombinedResult = ".only-selector{height:100%;}.only-selector{width:100%;}";
const options2 = {
	combineSelectors: false,
};

test(`Should return two rules with one declaration each | ${JSON.stringify(options)}`, async () => {
	const string = await cssGenerator({
		cssObjects,
		options: options2,
	});
	return expect(string.replace(/\s/g, "")).toBe(notCombinedResult);
});
