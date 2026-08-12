import { memo, useMemo } from "react";
import { Chill } from "assets/icons/Chill.icon";
import { Plus } from "assets/icons/Plus.icon";
import { cssObjectToGenerateClass } from "functions/generateClassObject";
import { ClassHeader } from "components/ClassHeader";
import { ClassRow } from "components/ClassRow";
import { ClassSectionHeading } from "components/ClassSectionHeading";
import { EmptyClassSection } from "components/ui/EmptyClassSection";
import { TypographyClassItem } from "../types";
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
import { typographyDataAtom } from "state";

interface TypographyAdditionalSelectors {}

export const TypographyAdditionalSelectors = memo<TypographyAdditionalSelectors>(() => {
	const [typography, setTypography] = useAtom(typographyDataAtom);

	const tabNames = useMemo(
		() =>
			[...typography.groups].map((el) => ({
				value: el.id,
				label: el.name,
				disabled: el.mode === "fluid_manual",
			})),
		[typography],
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
		const newClassItem: TypographyClassItem = {
			id: ulid(),
			name: "",
			tabId: "",
			property: [""],
		};

		setTypography({
			...typography,
			classes: [...(typography.classes ?? []), newClassItem],
		});
	};

	const handleUpdate = (item: CssObject) => {
		const classItem = typography.classes?.findIndex((el) => el.id === item.id);
		if (typeof classItem === "undefined" || classItem <= -1 || !typography.classes?.length) return;

		const convertedItem = cssObjectToGenerateClass(item);
		typography.classes[classItem] = { ...convertedItem };

		setTypography({
			...typography,
			classes: [...typography.classes],
		});
	};

	const handleDuplicate = (id: string) => {
		const classItem = typography.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !typography.classes?.length) return;

		const newClassItem: TypographyClassItem = {
			...typography.classes[classItem],
			id: ulid(),
		};

		setTypography({
			...typography,
			classes: [...(typography.classes ?? []), newClassItem],
		});
	};

	const handleMoveUp = (id: string) => {
		const classItem = typography.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !typography.classes?.length) return;

		const newClasses = [...typography.classes];
		[newClasses[classItem], newClasses[classItem - 1]] = [newClasses[classItem - 1], newClasses[classItem]];

		setTypography({
			...typography,
			classes: newClasses,
		});
	};

	const handleMoveDown = (id: string) => {
		const classItem = typography.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !typography.classes?.length) return;

		const newClasses = [...typography.classes];
		[newClasses[classItem], newClasses[classItem + 1]] = [newClasses[classItem + 1], newClasses[classItem]];

		setTypography({
			...typography,
			classes: newClasses,
		});
	};

	const handleDelete = (id: string) => {
		const classItem = typography.classes?.findIndex((el) => el.id === id);
		if (typeof classItem === "undefined" || classItem <= -1 || !typography.classes?.length) return;

		typography.classes.splice(classItem, 1);
		setTypography({ ...typography });
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!active || !over) return;

		const oldIndex = typography.classes?.findIndex((c) => c.id === active.id) ?? -1;
		const newIndex = typography.classes?.findIndex((c) => c.id === over.id) ?? -1;

		if (oldIndex === -1 || newIndex === -1) return;

		const newClasses = [...(typography.classes ?? [])];
		newClasses.splice(newIndex, 0, newClasses.splice(oldIndex, 1)[0]);

		setTypography({
			...typography,
			classes: newClasses,
		});
	};

	return (
		<div className="typography-additional-selectors">
			<div className="subsection">
				<ClassSectionHeading title="Class Generator" />

				<ClassHeader type="generation" />

				<ul className="grid border-primary radius relative">
					{!typography?.classes?.length && <EmptyClassSection onClick={onNewClass} icon={<Chill />} />}

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={(event) => handleDragEnd(event)}
					>
						<SortableContext items={typography.classes || []} strategy={rectSortingStrategy}>
							{typography.classes?.map((item) => {
								const tabId = typography.groups?.some((el) => el.id === item.tabId)
									? item.tabId
									: typography.groups?.[0]?.mode === "fluid"
									? typography.groups?.[0]?.id
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
												value: tabId || "",
												property: prop,
											})) || [],
									},
									selectData: tabNames,
								};

								return <ClassRow key={item.id} {...rowProps} />;
							})}
						</SortableContext>
					</DndContext>

					{!!typography.classes?.length && (
						<button className="add-remove add-next" onClick={onNewClass}>
							<Plus />
						</button>
					)}
				</ul>
			</div>
		</div>
	);
});
