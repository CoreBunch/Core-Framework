import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Down } from "../../../assets/icons/Down.icon";
import { Duplicate } from "../../../assets/icons/Duplicate.icon";
import { Hide } from "../../../assets/icons/Hide.icon";
import { ImportExport } from "../../../assets/icons/ImportExport.icon";
import { Plus } from "../../../assets/icons/Plus.icon";
import { Remove } from "../../../assets/icons/Remove.icon";
import { Up } from "../../../assets/icons/Up.icon";
import {
	PartialExportTypes,
	createPartialExport,
	parsePartialImport,
} from "../../../functions/partialImportExport";
import { useDebounce } from "../../../hooks/useDebounce";
import { useDidMountEffect } from "../../../hooks/useDidMountEffect";
import { copyToClipboard, readClipboard } from "../../../utils";
import { ClassSectionHeading } from "../../ClassSectionHeading";
import { CreateNewGroup } from "../../CreateNewGroup";
import { EmptyClassSection } from "../../ui/EmptyClassSection";
import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAtom } from "jotai/index";
import { toast } from "sonner";
import { ulid } from "ulid";
import { colorSystemFormDataAtom } from "../../../state";
import { saveAtom } from "../../../state/saveAtom";
import { ColorSingleRow } from "@core-framework/core/components/modules/colorSystem/components/ColorSingleRow";
import { useColorSystem } from "@core-framework/core/components/modules/colorSystem/hooks/useColorSystem";
import { ColorGroup, ColorItem, ColorSystemFormData } from "@core-framework/core/components/modules/colorSystem";

export const ColorModule = memo(() => {
	const [colorSystem, setColorSystem] = useAtom(colorSystemFormDataAtom);
	const [isSave] = useAtom(saveAtom);
	const { state, dispatch } = useColorSystem(colorSystem);
	const debouncedState = state;

	const stateRef = useRef<ColorSystemFormData>(state);
	const [expandedColor, setExpandedColor] = useState<{ id: string; group: string } | null>(null);
	const [temporaryGroupNames, setTemporaryGroupNames] = useState<{ groupId: string; name: string } | null>(
		null,
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 15,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const addGroup = useCallback(async () => {
		dispatch({ type: "addGroup" });

		await new Promise((resolve) => setTimeout(resolve, 100));

		const contentContainer = document.querySelector(".content") as HTMLElement;
		if (!contentContainer) return;

		const newGroupElement = [...contentContainer.querySelectorAll(".group-title-input")].at(-1);
		if (newGroupElement) newGroupElement.scrollIntoView({ behavior: "smooth" });

		await new Promise((resolve) => setTimeout(resolve, 100));

		newGroupElement?.querySelector("input")?.focus();
	}, [dispatch]);
	const deleteGroup = useCallback(
		(groupId: string) => dispatch({ type: "deleteGroup", payload: { groupId } }),
		[dispatch],
	);
	const disableGroup = useCallback(
		(groupId: string) => dispatch({ type: "disableGroup", payload: { groupId } }),
		[dispatch],
	);
	const duplicateGroup = useCallback(
		(groupId: string) => dispatch({ type: "duplicateGroup", payload: { groupId } }),
		[dispatch],
	);
	const moveGroup = useCallback(
		(groupId: string, direction: "up" | "down") =>
			dispatch({ type: "moveGroup", payload: { groupId, direction } }),
		[dispatch],
	);
	const renameGroup = useCallback(
		(groupId: string, name: string) => dispatch({ type: "renameGroup", payload: { groupId, name } }),
		[dispatch],
	);

	const addColor = useCallback(
		(groupId: string) => dispatch({ type: "addColor", payload: { groupId } }),
		[dispatch],
	);
	const onDeleteColor = useCallback(
		({ groupId, id }: { groupId: string; id: string }) =>
			dispatch({ type: "deleteColor", payload: { groupId, id } }),
		[dispatch],
	);
	const onDuplicateColor = useCallback(
		({ groupId, id }: { groupId: string; id: string }) =>
			dispatch({ type: "duplicateColor", payload: { groupId, id } }),
		[dispatch],
	);
	const onMoveColor = useCallback(
		({ groupId, id, direction }: { groupId: string; id: string; direction: "up" | "down" }) =>
			dispatch({ type: "moveColor", payload: { groupId, id, direction } }),
		[dispatch],
	);
	const handleDragEnd = useCallback(
		(event: DragEndEvent, groupId: string) => {
			const { active, over } = event;
			const targetGroup = state.groups.find((group) => group.id === groupId);

			if (!targetGroup) return;

			const colors = [...targetGroup.colors];
			const oldIndex = colors.findIndex((color) => color.id === active.id);
			const newIndex = colors.findIndex((color) => color.id === over?.id);

			if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

			const [movedColor] = colors.splice(oldIndex, 1);
			colors.splice(newIndex, 0, movedColor);

			const updatedGroups = state.groups.map((group) =>
				group.id === groupId ? { ...group, colors } : group,
			);

			dispatch({ type: "restore", payload: { ...state, groups: updatedGroups } });
		},
		[state, dispatch],
	);

	const handleColorGroupExport = useCallback(
		async (group: ColorGroup) => {
			const componentExport = await createPartialExport({
				type: "colorGroup" as PartialExportTypes,
				data: group,
			});

			if (!componentExport) {
				toast.error("Something went wrong. Failed to export color group.");
				return;
			}

			copyToClipboard(componentExport.string);
			toast.success("Color group copied to clipboard.");
		},
		[],
	);
	const handleColorGroupImport = useCallback(
		async (groupId?: string) => {
			try {
				const compressedString = (await readClipboard()).trim();

				if (!compressedString) {
					toast.message("Clipboard is empty.");
					return;
				}

				const newGroup = await parsePartialImport({ compressedString });
				if (!newGroup || String(newGroup.type) !== "colorGroup") {
					toast.error("Clipboard does not contain a valid color group.");
					return;
				}

				const newFullColorGroup = { ...newGroup.data, id: ulid() } as ColorGroup;
				const indexOfTargetGroup = groupId ? state.groups.findIndex((g) => g.id === groupId) : -1;

				let updatedGroups;

				if (indexOfTargetGroup === -1) updatedGroups = [...state.groups, newFullColorGroup];
				else {
					updatedGroups = [
						...state.groups.slice(0, indexOfTargetGroup + 1),
						newFullColorGroup,
						...state.groups.slice(indexOfTargetGroup + 1),
					];
				}

				dispatch({ type: "restore", payload: { ...state, groups: updatedGroups } });
				toast.success("Color group imported.");
			} catch (error) {
				toast.error("Something went wrong. Failed to paste color group. Please check clipboard permissions.");
			}
		},
		[state, dispatch],
	);

	const onImportColor = useCallback(
		async (groupId: string, id?: string) => {
			try {
				const compressedString = (await readClipboard()).trim();

				if (!compressedString?.length) {
					toast.message("Clipboard is empty.");
					return;
				}

				const newColor = await parsePartialImport({ compressedString });
				if (!newColor || String(newColor.type) !== "color") {
					toast.error("Clipboard does not contain a valid color.");
					return;
				}

				const newColorFull = { ...newColor.data, id: ulid() } as ColorItem;

				const updatedGroups = state.groups.map((group) => {
					if (group.id === groupId) {
						const updatedColors = id ? [...group.colors] : [...group.colors, newColorFull];

						if (id) {
							const index = updatedColors.findIndex((color) => color.id === id);
							if (index !== -1) updatedColors.splice(index + 1, 0, newColorFull);
							else updatedColors.push(newColorFull);
						}

						return { ...group, colors: updatedColors };
					}

					return group;
				});

				dispatch({ type: "restore", payload: { ...state, groups: updatedGroups } });
				toast.success("Color imported.");
			} catch (error) {
				toast.error("Something went wrong. Failed to paste color. Please check clipboard permissions.");
			}
		},
		[state, dispatch],
	);
	const handleColorUpdate = useCallback(
		async (value: ColorItem, groupId: string, withStateUpdate?: boolean) => {
			const { groups } = state;
			const group = groups.find((group) => group.id === groupId);
			if (!group) return;

			const colors = group.colors || [];
			const index = colors.findIndex((color) => color.id === value.id);
			if (index === -1) return;

			const updatedColors = [...colors.slice(0, index), value, ...colors.slice(index + 1)];

			const updatedGroups = groups.map((group) =>
				group.id === groupId ? { ...group, colors: updatedColors } : group,
			);
			const updatedState = { ...state, groups: updatedGroups };

			stateRef.current = updatedState;
			dispatch({ type: "restore", payload: updatedState });

			if (withStateUpdate) setColorSystem(updatedState);
		},
		[state, dispatch, setColorSystem],
	);

	useDidMountEffect(() => setColorSystem(debouncedState), [debouncedState]);
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	useEffect(() => {
		return () => {
			if (JSON.stringify(stateRef.current) !== JSON.stringify(state)) setColorSystem(stateRef.current);
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [setColorSystem, state]);

	return (
		<div className="subsection">
			{!Object?.keys(state.groups).length && (
				<EmptyClassSection
					title="No color groups"
					description="Add a color group to get started."
					onClick={addGroup}
				/>
			)}

			{Object?.entries(state.groups).map(([, group]) => (
				<div key={group.id} className="group">
					<ClassSectionHeading
						onTitleChange={(name) => setTemporaryGroupNames({ groupId: group.id, name })}
						onTitleBlur={() => {
							if (temporaryGroupNames?.groupId === group.id) {
								renameGroup(group.id, temporaryGroupNames?.name);
								setTemporaryGroupNames(null);
							}
						}}
						key={group.id}
						title={temporaryGroupNames?.groupId === group.id ? temporaryGroupNames?.name : group.name}
						menuItems={[
							{
								onClick: () => disableGroup(group.id),
								label: group?.isDisabled ? "Enable" : "Disable",
								icon: <Hide />,
							},
							{
								onClick: () => duplicateGroup(group.id),
								label: "Duplicate",
								icon: <Duplicate />,
							},
							{
								onClick: () => moveGroup(group.id, "up"),
								label: "Move up",
								icon: <Up />,
							},
							{
								onClick: () => moveGroup(group.id, "down"),
								label: "Move down",
								icon: <Down />,
							},
							{
								onClick: () => handleColorGroupExport(group),
								icon: <ImportExport />,
								label: "Copy group",
							},
							{
								onClick: () => handleColorGroupImport(group.id),
								icon: (
									<div
										style={{
											transform: "rotate(180deg)",
										}}
									>
										<ImportExport />
									</div>
								),
								label: "Paste group",
							},
							{
								onClick: () => deleteGroup(group.id),
								label: "Delete",
								icon: <Remove />,
								confirm: true,
							},
						]}
						titleInputClassName="group-title-input"
					/>

					{group?.isDisabled ? (
						<EmptyClassSection
							title="Group is disabled"
							description="Click to enable"
							onClick={() => disableGroup(group.id)}
						/>
					) : (
						<ul className="grid border-primary radius relative margin-bottom-l">
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={(e) => handleDragEnd(e, group.id)}
							>
								<SortableContext
									items={group.colors.map((color) => color.id)}
									strategy={verticalListSortingStrategy}
								>
									{group.colors.map((color) => (
										<ColorSingleRow
											key={color.id}
											color={color}
											groupId={group.id}
											isExpanded={expandedColor?.id === color.id && expandedColor?.group === group.id}
											onImport={onImportColor}
											onDelete={onDeleteColor}
											onDuplicate={onDuplicateColor}
											onMove={onMoveColor}
											onUpdate={handleColorUpdate}
											toggleExpanded={({ id, groupId }) =>
												setExpandedColor((prev) =>
													prev?.id === id && prev?.group === groupId ? null : { id, group: groupId },
												)
											}
											triggerSave={isSave}
										/>
									))}
								</SortableContext>
							</DndContext>

							<button onClick={() => addColor(group.id)} className="add-remove add-next">
								<Plus />
							</button>
						</ul>
					)}
				</div>
			))}

			<CreateNewGroup
				btnLabel="Create new color group"
				tooltipLabel="Paste a color group from the clipboard. To copy to clipboard, click [Three dots] next to a group heading, and choose [Copy group]"
				onBtnClick={addGroup}
				onImportClick={handleColorGroupImport}
			/>
		</div>
	);
});

ColorModule.displayName = "ColorModule";
