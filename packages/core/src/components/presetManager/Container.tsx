import { useMemo, useState } from "react";
import { Eye } from "assets/icons/Eye.icon";
import { Hide } from "assets/icons/Hide.icon";
import { useGetColor } from "hooks/useGetColor";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Lock } from "assets/icons/Lock.icon";
import { Remove } from "assets/icons/Remove.icon";
import { ColorItem, ColorSystemFormData } from "components/modules/colorSystem";
import { Component } from "components/modules/components";
import { SpacingData } from "components/modules/spacing";
import { TypographyData } from "components/modules/typography";
import { Tooltip } from "components/ui/Tooltip";
import { categoriesMap } from "./Skeleton";
import { Item, SortableItem } from "./SortableItem";

let timeout: NodeJS.Timeout | null = null;

export function Container(props: {
	id: string;
	items?: Group[];
	colorSystemData: ColorSystemFormData | undefined;
	components: Component[] | undefined;
	fluidTypographyData: TypographyData | undefined;
	fluidSpacingData: SpacingData | undefined;
	singleColorImport: ColorItem | null;
	onGroupRemove: (props: { categoryId: StylesheetDataKeys; groupId: string }) => void;
	onGroupDisable: (props: { categoryId: StylesheetDataKeys; groupId: string }) => void;
	onColorGroupRemove: (props: { categoryId: StylesheetDataKeys; groupId: string }) => void;
	onColorGroupDisable: (props: { categoryId: StylesheetDataKeys; groupId: string }) => void;
	onColorRemove: (props: { categoryId: StylesheetDataKeys; groupId: string; colorId: string }) => void;
	onComponentRemove: (props: { id: string }) => void;
	onSingleColorImport: (props: { groupId: string }) => void;
}) {
	const {
		id,
		items,
		colorSystemData,
		onColorGroupRemove,
		onColorGroupDisable,
		components,
		fluidTypographyData,
		fluidSpacingData,
	} = props;

	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const { parseColorValue } = useGetColor();
	const { setNodeRef } = useDroppable({ id });

	const dependencies = [
		items?.length,
		colorSystemData?.groups.length,
		components?.length,
		fluidTypographyData,
		fluidSpacingData,
	];

	const isEmptySection = useMemo(() => dependencies.every((item) => !item), dependencies);

	if (!items) {
		return null;
	}

	return (
		<SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
			<div ref={setNodeRef} className="grid gap-l">
				<b className="opacity-50 text-s">{categoriesMap.get(id as StylesheetDataKeys)}</b>

				<div
					className={clsx("manage-table", isEmptySection && "padding-s text-m opacity-60")}
					style={{ overflow: "hidden" }}
				>
					{colorSystemData && id === "colorStyles" && (
						<>
							{colorSystemData.groups.map((colorGroup) => (
								<div key={`Skeleton-${colorGroup.id}`} className="manage-table-item module">
									<Lock />

									<div className={clsx("row gap-s", { "opacity-30": colorGroup.isDisabled })}>
										<Item isMyFramework={true} title={colorGroup.name} id={colorGroup.id} />

										<div className="row" style={{ marginLeft: 5 }}>
											{colorGroup.colors.map((color) => {
												const isVariable = color.value.startsWith("var");
												const parsedColor = isVariable
													? parseColorValue(color.value, "rgba", false)
													: color.value;

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

									<div className="row">
										<Tooltip label={colorGroup.isDisabled ? "Enable" : "Disable"}>
											<button
												onClick={() => {
													onColorGroupDisable({
														categoryId: id,
														groupId: colorGroup.id,
													});
												}}
												className={clsx("btn-quaternary btn-box", { "active-btn": colorGroup.isDisabled })}
											>
												{colorGroup.isDisabled ? <Eye /> : <Hide />}
											</button>
										</Tooltip>

										<Tooltip label={deleteConfirmation === colorGroup.id ? "Confirm delete" : "Delete"}>
											<button
												onClick={() => {
													if (deleteConfirmation === colorGroup.id) {
														onColorGroupRemove({
															categoryId: id,
															groupId: colorGroup.id,
														});
														setDeleteConfirmation("");
														return;
													}

													setDeleteConfirmation(colorGroup.id);
													if (timeout) clearTimeout(timeout);
													timeout = setTimeout(() => setDeleteConfirmation(""), 3000);
												}}
												className="btn-quaternary btn-box"
											>
												{deleteConfirmation === colorGroup.id ? <Checkmark /> : <Remove />}
											</button>
										</Tooltip>
									</div>
								</div>
							))}
						</>
					)}

					{(components?.length ?? 0) > 0 && id === "componentsStyles" && (
						<>
							{components?.map((component) => (
								<div key={`Skeleton-${component.id}`} className="manage-table-item module">
									<Lock />
									<Item isMyFramework={true} title={component.selector} id={component.id} />

									<div className="row gap-s">
										<Tooltip label={deleteConfirmation === `${component.id}_c` ? "Confirm delete" : "Delete"}>
											<button
												onClick={() => {
													const id = `${component.id}_c`;
													if (deleteConfirmation === id) {
														props.onComponentRemove({
															id: component.id,
														});
														setDeleteConfirmation("");
														return;
													}

													setDeleteConfirmation(id);
													if (timeout) clearTimeout(timeout);
													timeout = setTimeout(() => setDeleteConfirmation(""), 3000);
												}}
												className="btn-quaternary btn-box"
											>
												{deleteConfirmation === `${component.id}_c` ? <Checkmark /> : <Remove />}
											</button>
										</Tooltip>
									</div>
								</div>
							))}
						</>
					)}

					{fluidTypographyData && id === "typographyStyles" && (
						<div className="manage-table-item module">
							<Lock />
							<Item isMyFramework={true} title={"Fluid Typography"} id={"fluidTypography"} />
						</div>
					)}

					{fluidSpacingData && id === "spacingStyles" && (
						<div className="manage-table-item module">
							<Lock />
							<Item isMyFramework={true} title={"Fluid Spacing"} id={"fluidSpacing"} />
						</div>
					)}

					{items.map((group) => (
						<SortableItem
							key={group.id}
							id={group.id}
							title={group.name}
							onGroupRemove={props.onGroupRemove}
							onGroupDisable={props.onGroupDisable}
							categoryId={id}
							group={group as StylesGroup}
						/>
					))}

					{isEmptySection ? "No groups" : null}
				</div>
			</div>
		</SortableContext>
	);
}
