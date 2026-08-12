import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Down } from "assets/icons/Down.icon";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { ImportExport } from "assets/icons/ImportExport.icon";
import { Remove } from "assets/icons/Remove.icon";
import { ThreeDots } from "assets/icons/ThreeDots.icon";
import { Up } from "assets/icons/Up.icon";
import { PartialExportTypes, createPartialExport } from "functions/partialImportExport";
import { useDebounce } from "hooks/useDebounce";
import { useDidMountEffect } from "hooks/useDidMountEffect";
import { useGetColor } from "hooks/useGetColor";
import { copyToClipboard } from "utils";
import { Tooltip } from "components/ui/Tooltip";
import { singleColorReducer } from "../functions/singleColorReducer";
import { ColorFormatValue, ColorItem } from "../index";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Collapse, Menu, Select } from "@mantine/core";
import { clsx } from "clsx";
import { toast } from "sonner";
import { ColorBodyValues } from "./ColorBodyValues";
import { ColorPickerPreview } from "./ColorPickerPreview";
import { ColorValue } from "./ColorValue";
import { ColorVariableName } from "./ColorVariableName";

const SELECTABLE_FORMATS: ColorFormatValue[] = ["hex", "hexa", "rgb", "rgba", "hsl", "hsla", "raw"];

interface ColorSingleRow {
	color: ColorItem;
	groupId: string;
	isExpanded: boolean;
	onDelete: ({ id, groupId }: { id: string; groupId: string }) => void;
	onDuplicate: ({ id, groupId }: { id: string; groupId: string }) => void;
	onMove: ({ id, groupId, direction }: { id: string; groupId: string; direction: "up" | "down" }) => void;
	onImport: (groupId: string, id?: string) => void;
	onUpdate: (color: ColorItem, groupId: string, withStateUpdate?: boolean) => void;
	toggleExpanded: ({ id, groupId }: { id: string; groupId: string }) => void;
	triggerSave?: boolean;
}

export const ColorSingleRow = memo<ColorSingleRow>(
	({
		color,
		groupId,
		isExpanded,
		onMove,
		onImport,
		onDuplicate,
		onDelete,
		onUpdate,
		toggleExpanded,
		triggerSave,
	}) => {
		const { getColor, colorVariables } = useGetColor();

		const [copy, setCopy] = useReducer(singleColorReducer, color);
		const debouncedCopy = useDebounce(copy, 500);

		const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
			id: color.id,
			attributes: {
				tabIndex: -1,
			},
		});

		const copyRef = useRef<ColorItem>(copy);
		const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

		const handleComponentExport = useCallback(async () => {
			const componentExport = await createPartialExport({
				type: "color" as PartialExportTypes,
				data: copy,
			});

			if (!componentExport) {
				toast.error("Something went wrong. Failed to export color.");
				return;
			}

			copyToClipboard(componentExport.string);
			toast.success("Color copied to clipboard.");
		}, [copy]);

		const menuItems = useMemo(
			() => [
				{
					onClick: () => onDuplicate({ id: color.id, groupId }),
					label: "Duplicate",
					icon: <Duplicate />,
				},
				{
					onClick: () => onMove({ id: color.id, groupId, direction: "up" }),
					label: "Move up",
					icon: <Up />,
				},
				{
					onClick: () => onMove({ id: color.id, groupId, direction: "down" }),
					label: "Move down",
					icon: <Down />,
				},
				{
					onClick: () => handleComponentExport(),
					icon: <ImportExport />,
					label: "Copy color",
				},
				{
					onClick: () => onImport(groupId, color.id),
					icon: (
						<div style={{ transform: "rotate(180deg)" }}>
							<ImportExport />
						</div>
					),
					label: "Paste color",
				},
				{
					onClick: isDeleteConfirmationOpen
						? () => onDelete({ id: color.id, groupId })
						: () => setIsDeleteConfirmationOpen(true),
					label: isDeleteConfirmationOpen ? "Are you sure?" : "Delete",
					icon: <Remove />,
					closeMenuOnClick: isDeleteConfirmationOpen,
					style: isDeleteConfirmationOpen ? { background: "#c2344e" } : {},
				},
			],
			[color.id, groupId, isDeleteConfirmationOpen, onDelete, onDuplicate, onMove, handleComponentExport, onImport],
		);

		const style = {
			transform:
				CSS.Transform.toString(transform)?.split(")")[0] !== undefined
					? `${CSS.Transform.toString(transform)?.split(")")[0]})`
					: "",
			transition,
		};

		const changeColor = (value: string, isDark = false) => {
			const color = copy.format === "raw" ? value : getColor(value, isDark);
			setCopy({
				type: isDark ? "updateDarkColor" : "updateColor",
				payload: { value: color, colorVariables },
			});
		};
		const handleColorRename = (value: string) => setCopy({ type: "rename", payload: { name: value } });
		const handleColorUpdate = (value: ColorItem) => setCopy({ type: "restore", payload: value });

		useDidMountEffect(() => {
			if (JSON.stringify(color) !== JSON.stringify(debouncedCopy)) onUpdate(debouncedCopy, groupId);
		}, [debouncedCopy]);
		useEffect(() => {
			copyRef.current = copy;
		}, [copy]);

		useEffect(() => {
			return () => {
				if (JSON.stringify(copyRef.current) !== JSON.stringify(copy))
					onUpdate(copyRef.current, groupId, true);
			};
			// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
		}, []);

		useEffect(() => {
			if (triggerSave && JSON.stringify(color) !== JSON.stringify(copy)) onUpdate(copy, groupId, true);
			// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
		}, [triggerSave]);

		return (
			<li ref={setNodeRef} style={style} {...attributes} className="class-row color-layout relative">
				<div className="color-head-row">
					<div
						className="radius shadow-s pointer grid"
						style={{ gridTemplateColumns: copy.isDarkMode ? "1fr 1fr" : "1fr" }}
					>
						<ColorPickerPreview
							value={copy.value}
							format={copy.format as ColorFormatValue}
							isDarkModeEnabled={copy.isDarkMode}
							onChangeEnd={(value) => changeColor(value)}
						/>

						{copy.isDarkMode && (
							<ColorPickerPreview
								value={copy.darkValue as string}
								format={copy.format as ColorFormatValue}
								isDarkModeEnabled={copy.isDarkMode}
								isDark
								onChangeEnd={(value) => changeColor(value, true)}
							/>
						)}
					</div>

					<div>
						<ColorVariableName value={copy.name} onChange={handleColorRename} />
					</div>

					<div className={clsx({ "double-input": copy.isDarkMode })}>
						<ColorValue
							value={copy.value}
							format={copy.format as ColorFormatValue}
							variableName={copy.name}
							onChange={(value) => changeColor(value)}
						/>

						{copy.isDarkMode && (
							<ColorValue
								value={copy.darkValue as string}
								format={copy.format as ColorFormatValue}
								variableName={copy.name}
								isDark
								onChange={(value) => changeColor(value, true)}
							/>
						)}
					</div>

					<div>
						<Tooltip label="Color format" withArrow>
							<Select
								data={SELECTABLE_FORMATS.map((format) => ({
									value: format,
									label: format.toUpperCase(),
								}))}
								value={copy.format}
								onChange={(format: ColorFormatValue) =>
									setCopy({ type: "updateFormat", payload: { format, colorVariables } })
								}
								className="format-select"
							/>
						</Tooltip>
					</div>

					<button
						className="btn-quaternary btn-box"
						onClick={() => toggleExpanded({ id: color.id, groupId })}
						style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
					>
						<Down />
					</button>
				</div>

				<Collapse in={isExpanded}>
					<hr />

					<ColorBodyValues color={copy} onUpdateItem={handleColorUpdate} />
				</Collapse>

				<Menu transitionProps={{ duration: 0 }} shadow="md" width={180}>
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
						{menuItems.map(({ label, ...rest }) => (
							<Menu.Item key={label} {...rest}>
								{label}
							</Menu.Item>
						))}
					</Menu.Dropdown>
				</Menu>
			</li>
		);
	},
);

ColorSingleRow.displayName = "ColorSingleRow";
