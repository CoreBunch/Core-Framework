import { filterSameDeclarations } from "cssGenerator/filter/filterSameDeclarations";

const declarations = [
	{
		id: "1",
		property: "color",
		value: "red",
	},
	{
		id: "2",
		property: "color",
		value: "red",
	},
];

const expectedResults = [
	{
		property: "color",
		value: "red",
	},
];

test("Filter same declarations", () => expect(filterSameDeclarations(declarations)).toEqual(expectedResults));

const declarations2 = [
	{
		id: "1",
		property: "color",
		value: "red",
	},
	{
		id: "2",
		property: "background-color",
		value: "blue",
	},
];

const expectedResults2 = declarations2.map(({ id, ...rest }) => rest);

test("Don't filter different declarations", () =>
	expect(filterSameDeclarations(declarations2)).toEqual(expectedResults2));
