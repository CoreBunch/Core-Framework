import { memo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Menu } from "@mantine/core";
import { useAtomValue } from "jotai";
import { ulid } from "ulid";
import { convertSafeCssName } from "utils";
import { Desktop } from "assets/icons/Desktop.icon";
import { Down } from "assets/icons/Down.icon";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { Phone } from "assets/icons/Phone.icon";
import { Remove } from "assets/icons/Remove.icon";
import { ThreeDots } from "assets/icons/ThreeDots.icon";
import { Up } from "assets/icons/Up.icon";
import { NumberInput } from "components/basic/NumberInput";
import { DEFAULT_MAX_SCREEN_WIDTH, DEFAULT_MIN_SCREEN_WIDTH } from "data/defaults";
import { presetPreferencesSelector } from "state";
import { getCssForSingleTypeScale } from "./functions/getCssForSingleTypeScale";
import { TypographyItem } from "./types";

interface IManualRow {
	readonly size: {
		readonly id: string;
		readonly name: string;
		readonly min: number;
		readonly max: number;
	};
	readonly onTypographyChange: (sizes: any[]) => void;
	readonly typography: TypographyItem;
}

export const ManualRow = memo<IManualRow>(({ size, onTypographyChange, typography }) => {
	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

	const { min_screen_width, max_screen_width, root_font_size, is_rem } =
		useAtomValue(presetPreferencesSelector);

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: size.id,
	});

	const duplicateSize = (id: string) => {
		const newSizes = [...(typography?.manualSizes || [])];
		const index = newSizes.findIndex((item) => item.id === id);

		if (index === -1) return;

		const newSize = {
			...newSizes[index],
			id: ulid(),
		};

		newSizes.splice(index + 1, 0, newSize);

		onTypographyChange(newSizes);
	};

	const deleteSize = (id: string) => {
		if (!isDeleteConfirmationOpen) {
			setIsDeleteConfirmationOpen(true);
			return;
		}

		const newSizes = [...(typography?.manualSizes || [])];
		const index = newSizes.findIndex((item) => item.id === id);

		if (index === -1) return;

		newSizes.splice(index, 1);

		onTypographyChange(newSizes);
	};

	interface IMoveSize {
		id: string;
		direction: "up" | "down";
	}

	const moveSize = ({ id, direction }: IMoveSize) => {
		const newSizes = [...(typography?.manualSizes || [])];
		const index = newSizes.findIndex((item) => item.id === id);

		if (index === -1) return;

		const item = newSizes[index];

		if (direction === "up") {
			newSizes.splice(index, 1);
			newSizes.splice(index - 1, 0, item);
		} else {
			newSizes.splice(index, 1);
			newSizes.splice(index + 1, 0, item);
		}

		onTypographyChange(newSizes);
	};

	const style = {
		transform:
			CSS.Transform.toString(transform)?.split(")")[0] !== undefined
				? `${CSS.Transform.toString(transform)?.split(")")[0]})`
				: "",
		transition,
	};

	return (
		<li ref={setNodeRef} style={style} {...attributes} className="class-row typo-layout-manual">
			<div className="prefixed-input-container">
				<span>--</span>

				<input
					type="text"
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
					value={size.name}
					onChange={(e) => {
						const newSizes = [...(typography?.manualSizes || [])];
						const index = newSizes.findIndex((item) => item.id === size.id);

						if (index === -1) return;

						// IMPORTANT: replace with a new object instead of mutating in place.
						// Mutation corrupts the shared reference held by the Jotai atom and
						// makes the deepEqual change-detection in the parent (and in
						// useChangeDetection) think nothing changed — the "Save changes"
						// button stays greyed out until the tab is unmounted and remounted.
						newSizes[index] = { ...newSizes[index], name: convertSafeCssName(e.target.value) };

						onTypographyChange(newSizes);
					}}
				/>
			</div>

			<NumberInput
				value={size.min}
				onChange={(value) => {
					const newSizes = [...(typography?.manualSizes || [])];
					const index = newSizes.findIndex((item) => item.id === size.id);

					if (index === -1) return;

					const minFontSize = Number(value);
					// Replace the row instead of mutating it in place — see the name
					// handler above for why this matters for change detection.
					newSizes[index] = {
						...newSizes[index],
						min: minFontSize,
						css: getCssForSingleTypeScale({
							minFontSize,
							maxFontSize: newSizes[index].max,
							minScreenWidth: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
							maxScreenWidth: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
							isRem: Boolean(is_rem),
							rootFontSize: root_font_size,
						}),
					};

					onTypographyChange(newSizes);
				}}
				min={0}
				unit="px"
				allowMouseWheel
			/>

			<NumberInput
				value={size.max}
				onChange={(value) => {
					const newSizes = [...(typography?.manualSizes || [])];
					const index = newSizes.findIndex((item) => item.id === size.id);

					if (index === -1) return;

					const maxFontSize = Number(value);
					// Replace the row instead of mutating it in place — see the name
					// handler above for why this matters for change detection.
					newSizes[index] = {
						...newSizes[index],
						max: maxFontSize,
						css: getCssForSingleTypeScale({
							minFontSize: newSizes[index].min,
							maxFontSize,
							minScreenWidth: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
							maxScreenWidth: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
							isRem: Boolean(is_rem),
							rootFontSize: root_font_size,
						}),
					};

					onTypographyChange(newSizes);
				}}
				max={2000}
				min={0}
				unit="px"
				allowMouseWheel
			/>

			<div className="calculator-preview">
				<div className="calculator-preview-single">
					<Phone />
					<p
						style={{
							fontSize: `${size.min}px`,
						}}
					>
						Minimum
					</p>
				</div>

				<div className="calculator-preview-single">
					<Desktop />

					<p
						style={{
							fontSize: `${size.max}px`,
						}}
					>
						Maximum
					</p>
				</div>
			</div>

			<Menu
				transitionProps={{
					duration: 0,
				}}
				shadow="md"
				width={150}
			>
				<Menu.Target>
					<button
						onClick={() => setIsDeleteConfirmationOpen(false)}
						className="class-settings"
						{...listeners}
					>
						<ThreeDots />
					</button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Item onClick={() => duplicateSize(size.id)} icon={<Duplicate />}>
						Duplicate
					</Menu.Item>
					<Menu.Item
						onClick={() =>
							moveSize({
								id: size.id,
								direction: "up",
							})
						}
						icon={<Up />}
					>
						Move Up
					</Menu.Item>
					<Menu.Item
						onClick={() =>
							moveSize({
								id: size.id,
								direction: "down",
							})
						}
						icon={<Down />}
					>
						Move Down
					</Menu.Item>
					<Menu.Item
						onClick={() => deleteSize(size.id)}
						icon={<Remove />}
						closeMenuOnClick={isDeleteConfirmationOpen}
						style={
							isDeleteConfirmationOpen
								? {
										background: "#c2344e",
								  }
								: {}
						}
					>
						{isDeleteConfirmationOpen ? "Are you sure?" : "Delete"}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</li>
	);
});

ManualRow.displayName = "ManualRow";
