import { memo, useMemo } from "react";
import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { PartialExportTypes, createPartialExport, parsePartialImport } from "functions/partialImportExport";
import { PrimitiveAtom, SetStateAction, useAtom, useAtomValue } from "jotai";
import { toast } from "sonner";
import { ulid } from "ulid";
import { copyToClipboard, getEmptyObject, readClipboard, scrollToNestedElement } from "utils";
import { Chill } from "assets/icons/Chill.icon";
import { Down } from "assets/icons/Down.icon";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { Hide } from "assets/icons/Hide.icon";
import { ImportExport } from "assets/icons/ImportExport.icon";
import { Plus } from "assets/icons/Plus.icon";
import { Remove } from "assets/icons/Remove.icon";
import { Up } from "assets/icons/Up.icon";
import { selectedBreakpointAtom, viewAtom } from "state";
import { ClassHeader } from "./ClassHeader";
import { ClassRow } from "./ClassRow";
import { ClassSectionHeading } from "./ClassSectionHeading";
import { VariableRow } from "./VariableRow";
import { EmptyClassSection } from "./ui/EmptyClassSection";
import { ImportButton } from "./ui/ImportButton";
import { Tooltip } from "./ui/Tooltip";

interface IGroup {
	readonly atom: PrimitiveAtom<StylesGroup[]>;
	readonly groupKey: StylesheetDataKeys;
	readonly title: string;
	readonly components?: JSX.Element[];
}

export const Group = memo<IGroup>(({ title, atom, components, groupKey }) => {
	const [groups, setGroups] = useAtom<StylesGroup[], [SetStateAction<StylesGroup[]>], void>(atom);

	const selectedBreakpoint = useAtomValue(selectedBreakpointAtom);
	const view = useAtomValue(viewAtom);

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

	interface IUpdateItem {
		readonly cssObject: CssObject;
		readonly groupId: string;
	}

	const updateItem = ({ cssObject, groupId }: IUpdateItem) => {
		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					group.cssObjects = group.cssObjects?.map((prevCssObject) => {
						if (prevCssObject.id === cssObject.id) {
							return cssObject;
						}
						return prevCssObject;
					});
				}
				return group;
			});
		});
	};

	const onGroupTitleChange = (newTitle: string, groupId: string) => {
		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					group.name = newTitle;
				}
				return group;
			});
		});
	};

	const handleSectionDisable = (groupId: string) => {
		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					group.isDisabled = !group.isDisabled;
				}

				return group;
			});
		});
	};

	const onNewClass = (groupId: string) => {
		const isVariableType = groups.find((group) => group.id === groupId)?.type === "variable";
		const newObject = {
			...getEmptyObject(isVariableType),
			...(selectedBreakpoint && {
				mediaQuery: selectedBreakpoint,
			}),
		};

		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					group.cssObjects = [...group.cssObjects, newObject];
				}

				return group;
			});
		});
	};

	const removeGroup = (groupId: string) => {
		setGroups((prev) => {
			return prev.filter((group) => group.id !== groupId);
		});
	};

	const moveGroupUp = (groupId: string) => {
		setGroups((prev) => {
			const newGroups = [...prev];
			const groupIndex = newGroups.findIndex((group) => group.id === groupId);

			if (groupIndex === -1) return newGroups;

			const group = newGroups[groupIndex];

			let targetIndex = groupIndex - 1;
			while (targetIndex >= 0) {
				const targetGroup = newGroups[targetIndex];
				const groupMediaQuery = group.cssObjects[0].mediaQuery;
				const targetMediaQuery = targetGroup.cssObjects[0].mediaQuery;

				if (
					!targetMediaQuery ||
					(groupMediaQuery && groupMediaQuery.toString() === targetMediaQuery.toString())
				) {
					break;
				}

				targetIndex--;
			}

			if (targetIndex >= 0) {
				newGroups.splice(groupIndex, 1);
				newGroups.splice(targetIndex, 0, group);
			}

			return newGroups;
		});
	};

	const moveGroupDown = (groupId: string) => {
		setGroups((prev) => {
			const newGroups = [...prev];
			const groupIndex = newGroups.findIndex((group) => group.id === groupId);

			if (groupIndex === -1) return newGroups;

			const group = newGroups[groupIndex];

			let targetIndex = groupIndex + 1;
			while (targetIndex < newGroups.length) {
				const targetGroup = newGroups[targetIndex];
				const groupMediaQuery = group.cssObjects[0].mediaQuery;
				const targetMediaQuery = targetGroup.cssObjects[0].mediaQuery;

				if (
					!targetMediaQuery ||
					(groupMediaQuery && groupMediaQuery.toString() === targetMediaQuery.toString())
				) {
					break;
				}

				targetIndex++;
			}

			if (targetIndex < newGroups.length) {
				newGroups.splice(groupIndex, 1);
				newGroups.splice(targetIndex, 0, group);
			}

			return newGroups;
		});
	};

	const duplicateItem = (groupId: string, id: string) => {
		setGroups((prev) =>
			prev.map((group) => {
				if (group.id === groupId) {
					const cssObjectIndex = group.cssObjects.findIndex((cssObject) => cssObject.id === id);
					const cssObject = group.cssObjects[cssObjectIndex];
					group.cssObjects.splice(cssObjectIndex + 1, 0, {
						...cssObject,
						id: ulid(),
					});
				}
				return group;
			}),
		);
	};

	const moveItemUp = (groupId: string, id: string) => {
		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					const cssObjectIndex = group.cssObjects.findIndex((cssObject) => cssObject.id === id);
					const cssObject = group.cssObjects[cssObjectIndex];
					group.cssObjects.splice(cssObjectIndex, 1);
					group.cssObjects.splice(cssObjectIndex - 1, 0, cssObject);
				}
				return group;
			});
		});
	};

	const moveItemDown = (groupId: string, id: string) => {
		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					const cssObjectIndex = group.cssObjects.findIndex((cssObject) => cssObject.id === id);
					const cssObject = group.cssObjects[cssObjectIndex];
					group.cssObjects.splice(cssObjectIndex, 1);
					group.cssObjects.splice(cssObjectIndex + 1, 0, cssObject);
				}
				return group;
			});
		});
	};

	const deleteItem = (groupId: string, id: string) => {
		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					group.cssObjects = group.cssObjects.filter((cssObject) => cssObject.id !== id);
				}
				return group;
			});
		});
	};

	const onNewGroup = async (isVariableGroup = false) => {
		setGroups((prev) => [
			...prev,
			{
				id: ulid(),
				name: "",
				cssObjects: [
					{
						...getEmptyObject(isVariableGroup),
						...(selectedBreakpoint && {
							mediaQuery: selectedBreakpoint,
						}),
					},
				],
				...(isVariableGroup && {
					type: "variable",
				}),
			},
		]);

		await new Promise((resolve) => setTimeout(resolve, 50));

		const contentContainer = document.querySelector(".section") as HTMLElement;
		const newGroup = [...document.getElementsByClassName("subsection")].at(-1) as HTMLElement | null;

		if (contentContainer && newGroup) {
			scrollToNestedElement(contentContainer, newGroup, true);
		}

		await new Promise((resolve) => setTimeout(resolve, 100));

		(
			[...document.getElementsByClassName("heading-input")]
				.at(-1)
				?.querySelector("input") as HTMLElement | null
		)?.focus();
	};

	const handleDragEnd = (event: DragEndEvent, groupId: string) => {
		const { active, over } = event;

		if (!active || !over) {
			return;
		}

		const oldIndex =
			groups.find((group) => group.id === groupId)?.cssObjects.findIndex((c) => c.id === active.id) ?? -1;
		const newIndex =
			groups.find((group) => group.id === groupId)?.cssObjects.findIndex((c) => c.id === over.id) ?? -1;

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		setGroups((prev) => {
			return prev.map((group) => {
				if (group.id === groupId) {
					const newCssObjects = [...group.cssObjects];
					newCssObjects.splice(newIndex, 0, newCssObjects.splice(oldIndex, 1)[0]);
					group.cssObjects = newCssObjects;
				}
				return group;
			});
		});
	};

	interface IHandleGroupExport {
		readonly groupId: string;
	}

	const handleGroupExport = async ({ groupId }: IHandleGroupExport) => {
		const group = groups.find((group) => group.id === groupId);

		if (!group) {
			toast.error("Something went wrong. Failed to export group.");
			return;
		}

		const groupExport = await createPartialExport({
			type: "group" as PartialExportTypes,
			data: group,
		});

		if (!groupExport) {
			toast.error("Something went wrong. Failed to export group.");
			return;
		}

		copyToClipboard(groupExport.string);

		toast.success("Group copied to clipboard.");
	};

	const mediaQueryFilter = (cssObject: CssObject) => {
		if (!(selectedBreakpoint || cssObject.mediaQuery)) return true;
		return String(cssObject.mediaQuery) === String(selectedBreakpoint);
	};

	const handleImportSubmit = async (groupId?: string) => {
		try {
			const compressedString = (await readClipboard()).trim();

			if (!compressedString?.length) {
				toast.message("Clipboard is empty.");
				return;
			}

			const newGroup = await parsePartialImport({
				compressedString,
			});

			if (!newGroup) {
				toast.error("Something went wrong. Failed to paste group.");
				return;
			}

			if (String(newGroup.type) !== "group") {
				toast.error("Something went wrong. Failed to paste group.");
				return;
			}

			if (groupId) {
				const indexOfGroup = groups.findIndex((group) => group.id === groupId);

				if (indexOfGroup === -1) {
					const data = newGroup.data as StylesGroup;
					const groupData = {
						...data,
						id: ulid(),
						cssObjects: data.cssObjects.map((el) => {
							const updatedElement = { ...el };

							if (selectedBreakpoint) updatedElement.mediaQuery = selectedBreakpoint;
							else if (el.mediaQuery) delete updatedElement.mediaQuery;

							return updatedElement;
						}),
					};

					setGroups((prev) => [...prev, groupData]);
					return;
				}

				const newGroups = [...groups];
				newGroups.splice(indexOfGroup + 1, 0, newGroup.data as StylesGroup);
				setGroups(newGroups);
			} else {
				setGroups((prev) => [...prev, newGroup.data as StylesGroup]);
			}

			toast.success("Group imported.");
		} catch (error) {
			toast.error("Something went wrong. Failed to paste group.");
		}
	};

	const duplicateGroup = (groupId: string) => {
		const indexOfTargetGroup = groups.findIndex((group) => group.id === groupId);

		if (indexOfTargetGroup === -1) {
			toast.error("Something went wrong. Failed to duplicate group.");
			return;
		}

		const group = groups[indexOfTargetGroup];
		const newGroup = {
			...group,
			id: ulid().slice(5, 10),
		};

		setGroups((prev) => {
			const newGroups = [...prev];
			newGroups.splice(indexOfTargetGroup + 1, 0, newGroup);
			return newGroups;
		});
	};

	const mediaGroups = useMemo(
		() => groups.filter((item) => item.cssObjects.some(mediaQueryFilter)),
		[groups, mediaQueryFilter],
	);

	return (
		<section id={title.replace(" ", "")} className="section">
			{selectedBreakpoint === null ? components?.map((component) => component ?? null) : null}

			{mediaGroups?.map((group) => (
				<div className="subsection" key={group.id}>
					<ClassSectionHeading
						onTitleChange={(newTitle) => onGroupTitleChange(newTitle, group.id)}
						key={group.id}
						title={group.name}
						menuItems={[
							{
								onClick: () => handleSectionDisable(group.id),
								label: group.cssObjects.every(({ isDisabled }) => isDisabled) ? "Enable" : "Disable",
								icon: <Hide />,
							},
							{
								onClick: () => duplicateGroup(group.id),
								label: "Duplicate",
								icon: <Duplicate />,
							},
							{
								onClick: () => moveGroupUp(group.id),
								label: "Move up",
								icon: <Up />,
							},
							{
								onClick: () => moveGroupDown(group.id),
								label: "Move down",
								icon: <Down />,
							},
							{
								onClick: () =>
									handleGroupExport({
										groupId: group.id,
									}),
								label: "Copy",
								icon: <ImportExport />,
							},
							{
								onClick: () => handleImportSubmit(group.id),
								icon: (
									<div
										style={{
											transform: "rotate(180deg)",
										}}
									>
										<ImportExport />
									</div>
								),
								label: "Paste",
							},
							{
								onClick: () => removeGroup(group.id),
								label: "Remove",
								icon: <Remove />,
								confirm: true,
							},
						]}
					/>

					{group.isDisabled ? null : <ClassHeader type={group?.type ?? "selector"} />}

					<ul className={clsx(!group?.isDisabled && "grid border-primary radius relative")}>
						{group?.cssObjects?.filter(mediaQueryFilter)?.length ? null : (
							<EmptyClassSection onClick={() => onNewClass(group.id)} icon={<Chill />} />
						)}

						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={(event) => handleDragEnd(event, group.id)}
						>
							<SortableContext
								items={group?.cssObjects?.filter(mediaQueryFilter).map((item) => item.id)}
								strategy={rectSortingStrategy}
							>
								{group?.isDisabled
									? null
									: group?.cssObjects?.filter(mediaQueryFilter).map((item) => {
											const rowProps = {
												updateItem: (cssObject: CssObject) =>
													updateItem({
														cssObject,
														groupId: group.id,
													}),
												duplicateItem: (id: string) => duplicateItem(group.id, id),
												moveItemUp: (id: string) => moveItemUp(group.id, id),
												moveItemDown: (id: string) => moveItemDown(group.id, id),
												deleteItem: (id: string) => deleteItem(group.id, id),
												addMultipleSelectorsOnPaste: (cssObjects: CssObject[]) => {
													setGroups((prev) => [
														...prev.filter((prevGroup) => prevGroup.id !== group.id),
														{
															...group,
															cssObjects: [...(group?.cssObjects || [])?.slice(0, -1), ...cssObjects],
														},
													]);
												},
												isMoveDownDisabled: false,
												isMoveUpDisabled: false,
												item,
											};

											return group?.type ? (
												<VariableRow key={item.id} {...rowProps} />
											) : (
												<ClassRow key={item.id} {...rowProps} />
											);
									  })}
							</SortableContext>
						</DndContext>

						{(group.isDisabled || group?.type !== "variable") && (
							<button className="add-remove add-next" onClick={() => onNewClass(group.id)}>
								<Plus />
							</button>
						)}

						{group?.isDisabled ? (
							<EmptyClassSection
								onClick={() => handleSectionDisable(group.id)}
								title="Group is disabled"
								description="Click to enable."
							/>
						) : null}
					</ul>
				</div>
			))}

			{view !== "STYLESHEETS" && (
				<footer className="padding-m row gap-s">
					<button onClick={() => onNewGroup()} className="new-group full-width">
						Create a selector group
					</button>

					<button onClick={() => onNewGroup(true)} className="new-group full-width">
						Create a variable group
					</button>

					<Tooltip
						label="Paste a group from the clipboard. To copy to clipboard, click [Three dots] next to a group heading, and choose [Copy group]."
						width={250}
						multiline
						withArrow
					>
						<ImportButton onclick={handleImportSubmit} />
					</Tooltip>
				</footer>
			)}
		</section>
	);
});

Group.displayName = "Group";
