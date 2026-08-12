import { cssGenerator } from "cssGenerator/cssGenerator";

const cssObjects: CssObject[] = [
	{
		id: "00",
		selector: ":root",
		declarations: [
			{
				property: "--space",
				value: "8px",
				id: "01",
			},
			{
				property: "--space-xs",
				value: "8px",
				id: "01",
			},
		],
	},
	{
		id: "01",
		selector: ".only-selector",
		declarations: [
			{
				property: "height",
				value: "var(--space)",
				id: "01",
			},
		],
	},
	{
		id: "02",
		selector: ".second-selector",
		declarations: [
			{
				property: "height",
				value: "var(--dont-touch-this)",
				id: "01",
			},
		],
	},
	{
		id: "01",
		selector: ".third-selector",
		declarations: [
			{
				property: "height",
				value: "23px",
				id: "01",
			},
		],
	},
];

const result = `:root {
    --c-space: 8px;
	--c-space-xs: 8px;
}
.c-only-selector {
	height: var(--c-space);
}
.c-second-selector {
	height: var(--dont-touch-this);
}
.c-third-selector {
	height: 23px;
}`;

test("prefixVariables", async () => {
	const css = await cssGenerator({
		options: {
			variablePrefix: "c-",
			classPrefix: "c-",
		},
		cssObjects,
	});

	expect(css.replace(/\s/g, "")).toBe(result.replace(/\s/g, ""));
});
