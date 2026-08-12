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
import { DEFAULT_MANUAL_FONT_SIZE } from "data/defaults";
import { presetPreferencesSelector } from "state";
import { ManualRow } from "./FluidTypographyCalculator.manualRow";
import { convertTypeScaleToManualSizes } from "./functions/convertTypeScaleToManualSizes";
import { singleTypographyReducer } from "./hooks/singleTypographyReducer";
import { TypographyItem } from "./types";

interface FluidTypographyCalculatorManual {
	readonly typography: TypographyItem;
	readonly updateTypography: ({ typography, id }: { typography: TypographyItem; id: string }) => void;
}

export const Manual = memo<FluidTypographyCalculatorManual>(({ typography, updateTypography }) => {
	const [copy, setCopy] = useReducer(singleTypographyReducer, typography);

	const typeScale = useMemo(() => copy, [copy]);

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
			...DEFAULT_MANUAL_FONT_SIZE,
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
			typographyState: typeScale,
		});

		setCopy({
			type: "updateManualSize",
			payload: newManualSizes,
		});
	};

	const handleDragEnd = (event: { active: any; over: any }) => {
		const { active, over } = event;

		if (active.id === over.id) return;

		const newSizes = [...(typeScale?.manualSizes || [])];
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
		const newSizes = [...(typeScale?.manualSizes || [])].sort((a, b) => a.min - b.min);

		setCopy({
			type: "updateManualSize",
			payload: newSizes,
		});
	};

	useEffect(() => {
		if (!deepEqual(typography, typeScale)) {
			setCopy({ type: "updateFormData", payload: { ...typeScale } });
			updateTypography({ id: typeScale.id, typography: typeScale });
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [typeScale]);

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
						items={typeScale?.manualSizes?.map((item) => item.id) || []}
						strategy={verticalListSortingStrategy}
					>
						{typeScale?.manualSizes?.map((size, index) => (
							<ManualRow
								key={size.id}
								size={size}
								typography={typeScale}
								onTypographyChange={(sizes) => {
									setCopy({ type: "updateManualSize", payload: sizes });
									updateTypography({ id: typeScale.id, typography: { ...typeScale, manualSizes: sizes } });
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
