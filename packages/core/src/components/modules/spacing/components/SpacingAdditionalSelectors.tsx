import { memo, useMemo } from "react";
import { Chill } from "assets/icons/Chill.icon";
import { Plus } from "assets/icons/Plus.icon";
import { cssObjectToGenerateClass } from "functions/generateClassObject";
import { ClassHeader } from "components/ClassHeader";
import { ClassRow } from "components/ClassRow";
import { ClassSectionHeading } from "components/ClassSectionHeading";
import { EmptyClassSection } from "components/ui/EmptyClassSection";
import { SpacingClassItem } from "../types";
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
import { useAtom } from "jotai/index";
import { ulid } from "ulid";
import { spacingDataAtom } from "state";

interface SpacingAdditionalSelectors {}

export const SpacingAdditionalSelectors = memo<SpacingAdditionalSelectors>(() => {
	const [spacing, setSpacing] = useAtom(spacingDataAtom);

	const tabNames = useMemo(
		() =>
			[...spacing.groups].map((el) => ({
				value: el.id,
				label: el.name,
				disabled: el.mode === "fluid_manual",
			})),
		[spacing],
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

	const onNewClass = () => {
		const newClassItem: SpacingClassItem = {
			id: ulid(),
			name: "",
			tabId: "",
			property: [""],
		};

		setSpacing({
			...spacing,
			classes: [...(spacing.classes ?? []), newClassItem],
		});
	};

	const handleUpdate = (item: CssObject) => {
		const classItem = spacing.classes?.findIndex((el) => el.id === item.id);
		if (typeof classItem === "undefined" || classItem <= -1 || !spacing.classes?.length) return;

		const convertedItem = cssObjectToGenerateClass(item);
		spacing.classes[classItem] = { ...convertedItem };

		setSpacing({
			...spacing,
			classes: [...spacing.classes],
		});
	};

	const handleDuplicate = (id: string) => {
		const classItem = spacing.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !spacing.classes?.length) return;

		const newClassItem: SpacingClassItem = {
			...spacing.classes[classItem],
			id: ulid(),
		};

		setSpacing({
			...spacing,
			classes: [...(spacing.classes ?? []), newClassItem],
		});
	};

	const handleMoveUp = (id: string) => {
		const classItem = spacing.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !spacing.classes?.length) return;

		const newClasses = [...spacing.classes];
		[newClasses[classItem], newClasses[classItem - 1]] = [newClasses[classItem - 1], newClasses[classItem]];

		setSpacing({
			...spacing,
			classes: newClasses,
		});
	};

	const handleMoveDown = (id: string) => {
		const classItem = spacing.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !spacing.classes?.length) return;

		const newClasses = [...spacing.classes];
		[newClasses[classItem], newClasses[classItem + 1]] = [newClasses[classItem + 1], newClasses[classItem]];

		setSpacing({
			...spacing,
			classes: newClasses,
		});
	};

	const handleDelete = (id: string) => {
		const classItem = spacing.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !spacing.classes?.length) return;

		spacing.classes.splice(classItem, 1);
		setSpacing({ ...spacing });
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!active || !over) return;

		const oldIndex = spacing.classes?.findIndex((c) => c.id === active.id) ?? -1;
		const newIndex = spacing.classes?.findIndex((c) => c.id === over.id) ?? -1;

		if (oldIndex === -1 || newIndex === -1) return;

		const newClasses = [...(spacing.classes ?? [])];
		newClasses.splice(newIndex, 0, newClasses.splice(oldIndex, 1)[0]);

		setSpacing({
			...spacing,
			classes: newClasses,
		});
	};

	return (
		<div className="spacing-additional-selectors">
			<div className="subsection">
				<ClassSectionHeading title="Class Generator" />

				<ClassHeader type="generation" />

				<ul className="grid border-primary radius relative">
					{!spacing?.classes?.length && <EmptyClassSection onClick={onNewClass} icon={<Chill />} />}

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={(event) => handleDragEnd(event)}
					>
						<SortableContext items={spacing.classes || []} strategy={rectSortingStrategy}>
							{spacing.classes?.map((item) => {
								const tabId = spacing.groups?.some((el) => el.id === item.tabId)
									? item.tabId
									: spacing.groups?.[0]?.mode === "fluid"
									? spacing.groups?.[0]?.id
									: "";

								const rowProps = {
									updateItem: handleUpdate,
									duplicateItem: handleDuplicate,
									moveItemUp: handleMoveUp,
									moveItemDown: handleMoveDown,
									deleteItem: handleDelete,
									addMultipleSelectorsOnPaste: () => {},
									isMoveDownDisabled: false,
									isMoveUpDisabled: false,
									isGenerateClass: true,
									isDisabled: item.isDisabled,
									item: {
										id: item.id,
										selector: item.name,
										isDisabled: item.isDisabled,
										declarations:
											item.property.map((prop, idx) => ({
												id: `${item.id}-${idx}`,
												type: "tab",
												value: tabId,
												property: prop,
											})) || [],
									},
									selectData: tabNames,
								};

								return <ClassRow key={item.id} {...rowProps} />;
							})}
						</SortableContext>
					</DndContext>

					{!!spacing.classes?.length && (
						<button className="add-remove add-next" onClick={onNewClass}>
							<Plus />
						</button>
					)}
				</ul>
			</div>
		</div>
	);
});
