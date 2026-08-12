import { filter } from "cssGenerator/filter/filter";

const filterTests = [
	{
		input: [
			{
				id: "1",
				selector: ".test",
				declarations: [
					{
						property: "",
						value: "100%",
						id: "1",
					},
				],
			},
			{
				id: "2",
				selector: ".test",
				declarations: [
					{
						property: "width",
						value: "",
						id: "1",
					},
				],
			},
			{
				id: "2",
				selector: ".TO BE REMOVED",
				declarations: [],
			},
		],
		output: [],
	},
];

test.each(filterTests)("Filter | %s", ({ input, output }) => expect(filter(input)).toEqual(output));
