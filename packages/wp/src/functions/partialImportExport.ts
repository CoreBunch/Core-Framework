import { stylesGroupSchema } from "schema/preset.schema";
import { ulid } from "ulid";
import { decodeCompressedStringSimple, encodeCompressedStringSimple } from "utils";
import { z } from "zod";
import { ColorGroup, ColorItem, colorGroupSchema, colorItemSchema } from "components/modules/colorSystem";
import { Component, componentsSchema, variantSchema } from "components/modules/components";
import { SpacingData, spacingData } from "components/modules/spacing";
import { TypographyData, fluidTypographySchema } from "components/modules/typography";

const compress = async <T extends unknown>(data: T): Promise<{ string: string }> => {
	const compressed = encodeCompressedStringSimple(JSON.stringify(data));
	return { string: compressed };
};

const uncompress = async (data: { string: string }) => {
	const uncompressed = decodeCompressedStringSimple(data.string);
	return JSON.parse(uncompressed);
};

export enum PartialExportTypes {
	group = "group",
	colorGroup = "colorGroup",
	color = "color",
	fluidTypography = "fluidTypography",
	fluidSpacing = "fluidSpacing",
	component = "component",
	componentVariant = "componentVariant",
}

type Data = {
	[PartialExportTypes.group]: StylesGroup;
	[PartialExportTypes.colorGroup]: ColorGroup;
	[PartialExportTypes.color]: ColorItem;
	[PartialExportTypes.fluidTypography]: TypographyData;
	[PartialExportTypes.fluidSpacing]: SpacingData;
	[PartialExportTypes.component]: Component;
	[PartialExportTypes.componentVariant]: {
		variant: ComponentVariant;
		children: ComponentVariant[];
	};
};

const dataSchemas = {
	[PartialExportTypes.group]: stylesGroupSchema,
	[PartialExportTypes.colorGroup]: colorGroupSchema,
	[PartialExportTypes.color]: colorItemSchema,
	[PartialExportTypes.fluidTypography]: fluidTypographySchema,
	[PartialExportTypes.fluidSpacing]: spacingData,
	[PartialExportTypes.component]: componentsSchema,
	[PartialExportTypes.componentVariant]: z.object({
		variant: variantSchema,
		children: z.array(variantSchema).optional(),
	}),
};

export const createPartialExport = async ({
	type,
	data,
}: {
	type: PartialExportTypes;
	data: Data[typeof type];
}) => {
	switch (type) {
		case PartialExportTypes.group: {
			const group = data as StylesGroup;

			const preppedGroup = {
				...data,
				cssObjects: group?.cssObjects.map((cssObject) => ({
					...cssObject,
					id: ulid(),
				})),
				id: ulid(),
			};

			const groupExport = {
				data: preppedGroup,
				type: PartialExportTypes.group,
			};

			return compress(groupExport);
		}
		case PartialExportTypes.component: {
			const component = data as Component;

			const preppedComponent = {
				...component,
				id: ulid(),
			};

			const componentExport = {
				data: preppedComponent,
				type: PartialExportTypes.component,
			};

			return compress(componentExport);
		}
		case PartialExportTypes.colorGroup: {
			const colorGroup = data as ColorGroup;

			const preppedColorGroup = {
				...colorGroup,
				colors: colorGroup.colors.map((color) => ({
					...color,
					id: ulid(),
				})),
				id: ulid(),
			};

			const colorGroupExport = {
				data: preppedColorGroup,
				type: PartialExportTypes.colorGroup,
			};

			return compress(colorGroupExport);
		}
		case PartialExportTypes.color: {
			const color = data as ColorItem;
			const colorExport = {
				data: color,
				type: PartialExportTypes.color,
			};

			return compress(colorExport);
		}
		case PartialExportTypes.fluidSpacing: {
			const spacing = data as SpacingData;
			const spacingExport = {
				data: spacing,
				type: PartialExportTypes.fluidSpacing,
			};

			return compress(spacingExport);
		}
		case PartialExportTypes.fluidTypography: {
			const typography = data as TypographyData;
			const typographyExport = {
				data: typography,
				type: PartialExportTypes.fluidTypography,
			};

			return compress(typographyExport);
		}
		case PartialExportTypes.componentVariant: {
			const _data = data as {
				variant: ComponentVariant;
				children: ComponentVariant[];
			};

			const variantExport = {
				data: _data,
				type: PartialExportTypes.componentVariant,
			};

			return compress(variantExport);
		}
		default: {
			return null;
		}
	}
};

export const parsePartialImport = async ({ compressedString }: { compressedString: string }) => {
	try {
		const uncompressed = await uncompress({
			string: compressedString,
		});
		const { type } = uncompressed as {
			type: PartialExportTypes;
		};
		const { data } = uncompressed as {
			data: unknown;
		};
		const schema = dataSchemas[type];
		const parsedData = schema.parse(data);

		return {
			type,
			data: parsedData as Data[typeof type],
		};
	} catch (error) {
		console.warn("Error during group import");
		console.warn(error);
		return null;
	}
};
