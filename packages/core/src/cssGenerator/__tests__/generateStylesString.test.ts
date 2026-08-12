import { ulid } from "ulid";
import { cssGenerator } from "../cssGenerator";

const cssObjects: CssObject[] = [
	{
		id: ulid(),
		selector: ":root",
		declarations: [
			{
				property: "--red",
				value: "red",
				id: ulid(),
			},
			{
				property: "--green",
				value: "green",
				id: ulid(),
			},
		],
	},
	{
		id: ulid(),
		selector: ".test",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: ulid(),
			},
			{
				property: "height",
				value: "100%",
				id: ulid(),
			},
		],
	},
	{
		id: ulid(),
		selector: ".test2",
		declarations: [
			{
				property: "pointer-events",
				value: "none",
				id: ulid(),
			},
			{
				property: "background",
				value: "red",
				id: ulid(),
			},
		],
	},
	{
		id: ulid(),
		selector: ".test2",
		declarations: [
			{
				property: "width",
				value: "100%",
				id: ulid(),
			},
			{
				property: "height",
				value: "100%",
				id: ulid(),
			},
			{
				property: "INVALID",
				value: "ANY",
				id: ulid(),
			},
		],
	},
];

const result =
	":root{--red:red;--green:green;}.test{width:100%;height:100%;}.test2{pointer-events:none;background:red;width:100%;height:100%;/*invalid:ANY;*/}";

const options = {
	format: true,
	combineSelectors: true,
	styleSheetValidation: false,
};

test(`Generate styles string with whitespace | ${JSON.stringify(options)}`, async () => {
	return expect(
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
		selector: ":root",
		declarations: [
			{
				property: "--red",
				value: "red",
				id: "1",
			},
			{
				property: "--red",
				value: "red",
				id: "2",
			},
		],
	},
];

const result2 = ":root{--red:red;}";

test(`Remove same declarations | ${JSON.stringify(options)}`, async () =>
	expect(
		(
			await cssGenerator({
				cssObjects: cssObjects2,
				options,
			})
		).replace(/\s/g, ""),
	).toBe(result2));
