import { ColorSystemFormData } from "components/modules/colorSystem";
import { generateColorSystemObjects } from "components/modules/colorSystem/functions/generateColorSystemObjects";
import { cssGenerator } from "cssGenerator/cssGenerator";

const cssGeneratorOptions = {
	format: true,
	combineSelectors: true,
	styleSheetValidation: false,
	valueValidation: false,
	propertyValidation: false,
};

test(`Test without darkmode`, async () => {
	const colorSystemObjects = generateColorSystemObjects({
		formData: {
			groups: [
				{
					name: "Brand",
					colors: [
						{
							id: "1",
							name: "one",
							value: "hsl(238, 100%, 62%)",
							format: "hsla",
						},
					],
					id: "1",
				},
			],
		},
		manualTheme: false,
		isAddGroupComments: false,
	});

	const result = `:root{--one:hsl(238,100%,62%);}`;

	expect(
		(
			await cssGenerator({
				cssObjects: colorSystemObjects,
				options: cssGeneratorOptions,
			})
		).replace(/\s/g, ""),
	).toBe(result);
});

test(`Test with dark mode auto mode`, async () => {
	const formData: ColorSystemFormData = {
		groups: [
			{
				name: "Brand",
				colors: [
					{
						id: "1",
						name: "one",
						value: "hsl(238, 100%, 62%)",
						darkValue: "hsl(138, 100%, 62%)",
						isDarkMode: true,
						format: "hsla",
					},
				],
				id: "1",
			},
		],
	};

	const colorSystemObjects = generateColorSystemObjects({
		manualTheme: false,
		formData,
		isAddGroupComments: false,
	});

	const result = `
@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}
:root {
  --one: hsl(238, 100%, 62%);
}
@media (prefers-color-scheme: dark) {
  :root {
    --one: hsl(138, 100%, 62%);
  }
}`;

	expect(
		(
			await cssGenerator({
				cssObjects: colorSystemObjects,
				options: cssGeneratorOptions,
			})
		).replace(/\s/g, ""),
	).toBe(result.replace(/\s/g, ""));
});

test(`Test with dark mode manual mode`, async () => {
	const formData: ColorSystemFormData = {
		groups: [
			{
				name: "Brand",
				colors: [
					{
						id: "1",
						name: "one",
						value: "hsl(238, 100%, 62%)",
						darkValue: "hsl(138, 100%, 62%)",
						isDarkMode: true,
						format: "hsla",
					},
				],
				id: "1",
			},
		],
	};

	const colorSystemObjects = generateColorSystemObjects({
		manualTheme: true,
		formData,
		isAddGroupComments: false,
	});

	const result = `
html.cf-theme-dark{
    color-scheme:dark;
}
:root{
    --one:hsl(238,100%,62%);
}
:root.cf-theme-dark, :root.cf-theme-light .theme-inverted, :root.cf-theme-light .theme-always-dark, :root.cf-theme-dark .theme-inverted .theme-always-dark{
    --one:hsl(138,100%,62%);
}
`;

	expect(
		(
			await cssGenerator({
				cssObjects: colorSystemObjects,
				options: cssGeneratorOptions,
			})
		).replace(/\s/g, ""),
	).toBe(result.replace(/\s/g, ""));
});

test(`Test with dark mode manual mode`, async () => {
	const formData: ColorSystemFormData = {
		groups: [
			{
				name: "Brand",
				colors: [
					{
						id: "1",
						name: "one",
						value: "hsl(238, 100%, 62%)",
						darkValue: "hsl(138, 100%, 62%)",
						isDarkMode: true,
						format: "hsla",
					},
				],
				id: "1",
			},
		],
	};

	const colorSystemObjects = generateColorSystemObjects({
		manualTheme: true,
		formData,
		darkModeSelector: ".DARK_MODE_SELECTOR",
		isAddGroupComments: false,
	});

	const result = `
html.DARK_MODE_SELECTOR{
    color-scheme:dark;
}
:root,:root.DARK_MODE_SELECTOR .theme-inverted, :root.DARK_MODE_SELECTOR .theme-always-light, :root.cf-theme-light .theme-inverted .theme-always-light{
    --one:hsl(238,100%,62%);
}
:root.DARK_MODE_SELECTOR,:root.cf-theme-light.theme-inverted, :root.cf-theme-light .theme-always-dark, :root.DARK_MODE_SELECTOR .theme-inverted .theme-always-dark{
	--one:hsl(138,100%,62%);
}
`;

	expect(
		(
			await cssGenerator({
				cssObjects: colorSystemObjects,
				options: {
					...cssGeneratorOptions,
					darkModeSelector: ".DARK_MODE_SELECTOR",
					manualDarkMode: true,
				},
			})
		).replace(/\s/g, ""),
	).toBe(result.replace(/\s/g, ""));
});

test(`Prefix variables in dark mode`, async () => {
	const formData: ColorSystemFormData = {
		groups: [
			{
				name: "Brand",
				colors: [
					{
						id: "1",
						name: "one",
						value: "hsl(238, 100%, 62%)",
						darkValue: "hsl(138, 100%, 62%)",
						isDarkMode: true,
						format: "hsla",
					},
				],
				id: "1",
			},
		],
	};

	const colorSystemObjects = generateColorSystemObjects({
		manualTheme: false,
		formData,
		isAddGroupComments: false,
	});
	const variablePrefix = "prefix-";
	const result = `
@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}
:root {
  --${variablePrefix}one: hsl(238, 100%, 62%);
}
@media (prefers-color-scheme: dark) {
  :root {
    --${variablePrefix}one: hsl(138, 100%, 62%);
  }
}
`;

	expect(
		(
			await cssGenerator({
				cssObjects: colorSystemObjects,
				options: {
					...cssGeneratorOptions,
					variablePrefix,
				},
			})
		).replace(/\s/g, ""),
	).toBe(result.replace(/\s/g, ""));
});

test(`Prefix variables in dark mode`, async () => {
	const formData: ColorSystemFormData = {
		groups: [
			{
				name: "Brand",
				colors: [
					{
						id: "1",
						name: "one",
						value: "hsl(238, 100%, 62%)",
						darkValue: "hsl(138, 100%, 62%)",
						isDarkMode: true,
						format: "hsla",
						gen: ["bg"],
					},
				],
				id: "1",
			},
		],
	};

	const colorSystemObjects = generateColorSystemObjects({
		manualTheme: false,
		formData,
		isAddGroupComments: false,
	});
	const variablePrefix = "cats-and-dogs-";
	const result = `
@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}
:root {
  --${variablePrefix}one: hsl(238, 100%, 62%);
}
@media (prefers-color-scheme: dark) {
  :root {
    --${variablePrefix}one: hsl(138, 100%, 62%);
  }
}
.bg-one {
	background-color: var(--${variablePrefix}one);
}
`;

	expect(
		(
			await cssGenerator({
				cssObjects: colorSystemObjects,
				options: {
					...cssGeneratorOptions,
					variablePrefix,
				},
			})
		).replace(/\s/g, ""),
	).toBe(result.replace(/\s/g, ""));
});
