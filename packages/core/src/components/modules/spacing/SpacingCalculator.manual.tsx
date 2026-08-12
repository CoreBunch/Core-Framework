import { memo, useEffect, useMemo, useReducer } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAtomValue } from "jotai";
import { ulid } from "ulid";
import { Plus } from "assets/icons/Plus.icon";
import { deepEqual } from "utils/deepEqual";
import { DEFAULT_MANUAL_SPACING_SIZE } from "data/defaults";
import { presetPreferencesSelector } from "state";
import { ManualRow } from "./SpacingCalculator.manualRow";
import { convertTypeScaleToManualSizes } from "./functions/convertTypeScaleToManualSizes";
import { singleSpacingReducer } from "./hooks/singleSpacingReducer";
import { SpacingItem } from "./types";

interface SpacingCalculatorManual {
	readonly space: SpacingItem;
	readonly updateSpace: ({ space, id }: { space: SpacingItem; id: string }) => void;
}

export const Manual = memo<SpacingCalculatorManual>(({ space, updateSpace }) => {
	const [copy, setCopy] = useReducer(singleSpacingReducer, space);

	const spaceScale = useMemo(() => copy, [copy]);

	const { min_screen_width, max_screen_width, root_font_size, is_rem } =
		useAtomValue(presetPreferencesSelector);

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

	const handleAddNewSize = () => {
		const newSize = {
			...DEFAULT_MANUAL_SPACING_SIZE,
			id: ulid(),
		};

		setCopy({
			type: "updateManualSize",
			payload: [...(copy.manualSizes || []), newSize],
		});
	};

	const copyTypeScales = () => {
		const newManualSizes = convertTypeScaleToManualSizes({
			preferences: {
				min_screen_width,
				max_screen_width,
				root_font_size,
				is_rem,
			},
			spacingState: spaceScale,
		});

		setCopy({
			type: "updateManualSize",
			payload: newManualSizes,
		});
	};

	const handleDragEnd = (event: { active: any; over: any }) => {
		const { active, over } = event;

		if (active.id === over.id) return;

		const newSizes = [...(spaceScale?.manualSizes || [])];
		const activeIndex = newSizes.findIndex((item) => item.id === active.id);
		const overIndex = newSizes.findIndex((item) => item.id === over.id);

		if (activeIndex === -1 || overIndex === -1) return;

		const item = newSizes[activeIndex];

		newSizes.splice(activeIndex, 1);
		newSizes.splice(overIndex, 0, item);

		setCopy({
			type: "updateManualSize",
			payload: newSizes,
		});
	};

	const sortSizes = () => {
		const newSizes = [...(spaceScale?.manualSizes || [])].sort((a, b) => a.min - b.min);

		setCopy({
			type: "updateManualSize",
			payload: newSizes,
		});
	};

	useEffect(() => {
		if (!deepEqual(space, spaceScale)) {
			setCopy({ type: "updateFormData", payload: { ...spaceScale } });
			updateSpace({ id: spaceScale.id, space: spaceScale });
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [spaceScale]);

	return (
		<div
			className="subsection"
			style={{
				padding: 0,
				marginTop: "1rem",
			}}
		>
			<div className="row gap-m">
				<button key="1" onClick={copyTypeScales} className="btn-tertiary btn-s">
					Copy Automatic
				</button>

				<button onClick={sortSizes} className="btn-tertiary btn-s">
					Sort Sizes
				</button>
			</div>

			<div className="class-row typo-layout-manual header">
				<span>Variable Name</span>
				<span>Min Size</span>
				<span>Max Size</span>
				<span>Preview</span>
			</div>

			<ul className="grid border-primary radius relative">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e)}>
					<SortableContext
						items={spaceScale?.manualSizes?.map((item) => item.id) || []}
						strategy={verticalListSortingStrategy}
					>
						{spaceScale?.manualSizes?.map((size, index) => (
							<ManualRow
								key={size.id}
								size={size}
								spacingState={spaceScale}
								onSpaceChange={(sizes) => {
									setCopy({ type: "updateManualSize", payload: sizes });
									updateSpace({ id: spaceScale.id, space: { ...spaceScale, manualSizes: sizes } });
								}}
							/>
						))}
					</SortableContext>
				</DndContext>

				<button className="add-remove add-next" onClick={handleAddNewSize}>
					<Plus />
				</button>
			</ul>
		</div>
	);
});

Manual.displayName = "Manual";
