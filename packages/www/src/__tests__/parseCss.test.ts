import { parseCSS } from "functions/parseCss";

jest.mock("colord", () => ({
	colord: jest.fn(),
	extend: jest.fn(),
	getFormat: jest.fn(),
}));

test("Parse CSS | should parse CSS into CSS Objects", () => {
	const CSS = `
	:root {
        --color: red;
        --color2: blue;
    }
    
    #id {
        color: red;
    }
	`;

	const result = {
		cssObjects: [
			{
				id: "rule-:root-0",
				selector: ":root",
				declarations: [
					{
						property: "--color",
						value: "red",
						id: "--color-red",
					},
					{
						id: "--color2-blue",
						property: "--color2",
						value: "blue",
					},
				],
			},
			{
				id: "rule-#id-0",
				selector: "#id",
				declarations: [
					{
						id: "color-red",
						property: "color",
						value: "red",
					},
				],
			},
		],
		modulesData: {
			COLOR_SYSTEM: {
				colors: [],
			},
		},
	};

	const parsedCSS = parseCSS(CSS);

	expect(parsedCSS).toEqual(result);
});
