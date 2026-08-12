import { useMemo, useState } from "react";
import { useGetColor } from "hooks/useGetColor";
import { Popover } from "@mantine/core";
import { clsx } from "clsx";
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import { Eye } from "assets/icons/Eye.icon";
import { ImportExport } from "assets/icons/ImportExport.icon";
import { ColorGroup, ColorItem, ColorSystemFormData } from "components/modules/colorSystem";
import { Component } from "components/modules/components";
import { Tooltip } from "components/ui/Tooltip";
import { cssGenerator } from "cssGenerator";
import { HandleExternalGroupImportProps } from "./PresetManager";
import { Item } from "./SortableItem";

hljs.registerLanguage("css", css);

interface IColorRow {
	readonly colorGroup: ColorGroup;
	readonly onColorGroupImport: (color: ColorGroup) => void;
	readonly setColorToImport: (color: ColorItem | null) => void;
}

const ColorRow = ({ colorGroup, onColorGroupImport }: IColorRow) => {
	const { parseColorValue } = useGetColor();

	return (
		<div key={`Skeleton-${colorGroup.id}`} className="manage-table-item module">
			<button onClick={() => onColorGroupImport(colorGroup)} className="btn-secondary btn-box">
				<ImportExport />
			</button>

			<div className="row gap-s">
				<Item isMyFramework={false} title={colorGroup.name} id={colorGroup.id} />

				<div
					className="row"
					style={{
						marginLeft: 5,
					}}
				>
					{colorGroup.colors.map((color) => {
						const isVariable = color.value.startsWith("var");
						const parsedColor = isVariable ? parseColorValue(color.value, "rgba", false) : color.value;

						return (
							<div
								className="shadow-s"
								style={{
									aspectRatio: "1/1",
									height: 20,
									backgroundColor: parsedColor as string,
									borderRadius: 999,
									marginLeft: -5,
								}}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};

interface SkeletonProps {
	readonly styleSheetData?: StylesheetData;
	readonly colorSystemData?: ColorSystemFormData;
	readonly components?: Component[];
	readonly handleExternalGroupImport: (props: HandleExternalGroupImportProps) => void;
	readonly onColorGroupImport: (color: ColorGroup) => void;
	readonly onComponentImport: (props: { component: Component }) => void;
	readonly onFluidTypographyReplace: () => void;
	readonly onFluidSpacingReplace: () => void;
	readonly setColorToImport: (color: ColorItem | null) => void;
}

const Category = ({
	id,
	group,
	colorSystemData,
	components,
	handleExternalGroupImport,
	onColorGroupImport,
	onComponentImport,
	onFluidTypographyReplace,
	onFluidSpacingReplace,
	setColorToImport,
}: SkeletonProps & {
	id: StylesheetDataKeys;
	group: StylesheetData[StylesheetDataKeys];
}) => {
	const [cssPreview, setCssPreview] = useState("");

	const dependencies = [
		id === "colorStyles" && colorSystemData?.groups?.length,
		id === "componentsStyles" && components?.length,
		id === "typographyStyles",
		id === "spacingStyles",
		group?.length,
	];

	const isEmptySection = useMemo(() => dependencies.every((item) => !item), dependencies);

	return (
		<div key={`Skeleton-${id}`} className="grid gap-l">
			<b className="opacity-50 text-s">{categoriesMap.get(id as StylesheetDataKeys)}</b>

			<div className={clsx("manage-table", isEmptySection && "padding-s text-m opacity-60")}>
				{id === "colorStyles" && colorSystemData && (
					<>
						{colorSystemData.groups.map((group) => (
							<ColorRow
								key={`Skeleton-${group.id}`}
								colorGroup={group}
								onColorGroupImport={onColorGroupImport}
								setColorToImport={setColorToImport}
							/>
						))}
					</>
				)}

				{id === "componentsStyles" && components?.length ? (
					<>
						{components?.map((component) => (
							<div key={`Skeleton-${component.id}`} className="manage-table-item module">
								<Tooltip label="Paste">
									<button
										onClick={() =>
											onComponentImport({
												component,
											})
										}
										className="btn-secondary btn-box"
									>
										<ImportExport />
									</button>
								</Tooltip>

								<Item isMyFramework={false} title={component.selector} id={component.id} />
							</div>
						))}
					</>
				) : null}

				{id === "typographyStyles" && (
					<div key={`Skeleton-fluidTypography`} className="manage-table-item module">
						<Tooltip label="Paste">
							<button onClick={() => onFluidTypographyReplace()} className="btn-secondary btn-box">
								<ImportExport />
							</button>
						</Tooltip>

						<Item isMyFramework={false} title={"Fluid typography"} id={"fluidTypography"} />
					</div>
				)}

				{id === "spacingStyles" && (
					<div key={`Skeleton-fluidSpacing`} className="manage-table-item module">
						<Tooltip label="Paste">
							<button onClick={() => onFluidSpacingReplace()} className="btn-secondary btn-box">
								<ImportExport />
							</button>
						</Tooltip>

						<Item isMyFramework={false} title={"Fluid spacing"} id={"fluidSpacing"} />
					</div>
				)}

				{group?.length
					? group.map((group) => (
							<div key={`Skeleton-${group.id}`} className="manage-table-item">
								<Tooltip label="Paste">
									<button
										onClick={() =>
											handleExternalGroupImport({
												group,
												categoryId: id as StylesheetDataKeys,
											})
										}
										className="btn-secondary btn-box"
									>
										<ImportExport />
									</button>
								</Tooltip>

								<Item isMyFramework={false} title={group.name} id={group.id} />

								<Popover
									width={400}
									position="top"
									withArrow
									shadow="md"
									onOpen={async () => {
										setCssPreview(
											await cssGenerator({
												cssObjects: group.cssObjects ?? [],
												options: cssGeneratorOptions,
											}),
										);

										setTimeout(() => hljs.highlightAll(), 2);
									}}
								>
									<Tooltip label="Preview CSS">
										<Popover.Target>
											<button className="btn-quaternary btn-box">
												<Eye />
											</button>
										</Popover.Target>
									</Tooltip>

									<Popover.Dropdown>
										<pre
											className="generated-code padding-s overflow-scroll"
											style={{
												overflow: "scroll",
												maxHeight: 400,
											}}
										>
											<code className="language-css">{cssPreview}</code>
										</pre>
									</Popover.Dropdown>
								</Popover>
							</div>
					  ))
					: null}

				{isEmptySection ? "No groups" : null}
			</div>
		</div>
	);
};

export const categoriesMap = new Map([
	["colorStyles", "Colors"],
	["typographyStyles", "Typography"],
	["spacingStyles", "Spacing"],
	["layoutsStyles", "Layouts"],
	["designStyles", "Design"],
	["componentsStyles", "Components"],
	["otherStyles", "Other"],
]) as Map<StylesheetDataKeys, string>;

const cssGeneratorOptions = {
	format: true,
	combineSelectors: true,
	propertyValidation: false,
	valueValidation: false,
};

export const Skeleton = ({
	styleSheetData,
	colorSystemData,
	components,
	handleExternalGroupImport,
	onColorGroupImport,
	onComponentImport,
	onFluidTypographyReplace,
	onFluidSpacingReplace,
	setColorToImport,
}: SkeletonProps) => {
	if (!styleSheetData) {
		return null;
	}

	return (
		<>
			{Object.entries(styleSheetData).map(([id, group]) => (
				<Category
					key={`Skeleton-${id}`}
					id={id as StylesheetDataKeys}
					group={group}
					colorSystemData={colorSystemData}
					components={components}
					handleExternalGroupImport={handleExternalGroupImport}
					onColorGroupImport={onColorGroupImport}
					onComponentImport={onComponentImport}
					onFluidTypographyReplace={onFluidTypographyReplace}
					onFluidSpacingReplace={onFluidSpacingReplace}
					setColorToImport={setColorToImport}
				/>
			))}
		</>
	);
};
