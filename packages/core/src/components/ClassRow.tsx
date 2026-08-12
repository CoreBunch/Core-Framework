import { memo, useMemo, useState } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Menu, Switch } from "@mantine/core";
import clsx from "clsx";
import { focusNextDeclaration } from "functions/focusNextDeclaration";
import { parseCSS } from "functions/parseCss";
import { ulid } from "ulid";
import { getEmptyDeclaration } from "utils";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Copy } from "assets/icons/Copy.icon.";
import { Down } from "assets/icons/Down.icon";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { Plus } from "assets/icons/Plus.icon";
import { Remove } from "assets/icons/Remove.icon";
import { ThreeDots } from "assets/icons/ThreeDots.icon";
import { Up } from "assets/icons/Up.icon";
import { useCopyToClipboard } from "hooks/useClipboard";
import { useDebounce } from "hooks/useDebounce";
import { useDidMountEffect } from "hooks/useDidMountEffect";
import { DndItem } from "./DndItem";
import { CssForm } from "./cssForm";

interface IClassRow {
	readonly updateItem: (value: CssObject) => void;
	readonly duplicateItem: (id: string) => void;
	readonly moveItemUp: (id: string) => void;
	readonly moveItemDown: (id: string) => void;
	readonly deleteItem: (id: string) => void;
	readonly addMultipleSelectorsOnPaste: (cssObjects: CssObject[]) => void;
	readonly item: CssObject;
	readonly isMoveUpDisabled: boolean;
	readonly isMoveDownDisabled: boolean;
	readonly isGenerateClass?: boolean;
	readonly isDisabled?: boolean;
	readonly selectData?: { value: string; label: string }[];
}

export const ClassRow = memo<IClassRow>(({ isGenerateClass, selectData, isDisabled, ...classRowProps }) => {
	const [copy, setCopy] = useState(classRowProps.item);

	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: copy.id,
		attributes: {
			tabIndex: -1,
		},
	});

	const { isCopied: isSelectorCopied, copy: copySelector } = useCopyToClipboard();

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

	const style = {
		transform:
			CSS.Transform.toString(transform)?.split(")")[0] !== undefined
				? `${CSS.Transform.toString(transform)?.split(")")[0]})`
				: "",
		transition,
	};

	const debouncedItem = useDebounce(copy, 200);

	const menuItems = useMemo(
		() => [
			{
				onClick: () => classRowProps.duplicateItem(copy.id),
				label: "Duplicate",
				icon: <Duplicate />,
			},
			{
				onClick: () => classRowProps.moveItemUp(copy.id),
				label: "Move up",
				icon: <Up />,
				disabled: classRowProps.isMoveUpDisabled,
			},
			{
				onClick: () => classRowProps.moveItemDown(copy.id),
				label: "Move down",
				icon: <Down />,
				disabled: classRowProps.isMoveDownDisabled,
			},
			{
				onClick: isDeleteConfirmationOpen
					? () => classRowProps.deleteItem(copy.id)
					: () => setIsDeleteConfirmationOpen(true),
				label: isDeleteConfirmationOpen ? "Are you sure?" : "Remove",
				closeMenuOnClick: isDeleteConfirmationOpen,
				style: isDeleteConfirmationOpen
					? {
							background: "#c2344e",
					  }
					: {},
				icon: <Remove />,
			},
		],
		[classRowProps, isDeleteConfirmationOpen, copy],
	);

	const handleMenuClick = () => setIsDeleteConfirmationOpen(false);

	function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
		const pastedText = e.clipboardData.getData("text/plain");

		const isCssRule =
			pastedText.includes("{") &&
			pastedText.includes("}") &&
			pastedText.includes(":") &&
			pastedText.includes(";");

		if (!isCssRule) {
			return;
		}

		e.preventDefault();

		const parsed = parseCSS(pastedText);
		const cssObjects = parsed.cssObjects;

		if (cssObjects.length === 0) {
			return;
		}

		const declarations = cssObjects[0].declarations;

		setCopy((prev) => ({
			...prev,
			declarations: declarations.map((declaration) => ({
				...declaration,
				id: ulid(),
			})),
		}));
	}

	const handleSelectorInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = e.clipboardData.getData("text/plain");
		const isCssRule =
			pastedText.includes("{") &&
			pastedText.includes("}") &&
			pastedText.includes(":") &&
			pastedText.includes(";");

		if (!isCssRule) {
			return;
		}

		e.preventDefault();

		const parsed = parseCSS(pastedText);
		const cssObjects = parsed.cssObjects;

		if (cssObjects.length === 0) {
			return;
		}

		if (cssObjects.length === 1) {
			const { selector, declarations } = cssObjects[0];
			setCopy((prev) => ({
				...prev,
				declarations: declarations.map((declaration) => ({
					...declaration,
					id: ulid(),
				})),
				selector,
			}));
		} else {
			classRowProps?.addMultipleSelectorsOnPaste(cssObjects);
		}
	};

	const onPropertyChange = (value: string, id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							property: value,
					  }
					: declaration,
			),
		}));
	};

	const onValueChange = (value: string, id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							value,
					  }
					: declaration,
			),
		}));
	};

	const onColorValueChange = (value: string, id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							colorValue: value,
					  }
					: declaration,
			),
		}));
	};

	const onFluidValueChange = (value: FluidInputValue, id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							fluidValue: value,
					  }
					: declaration,
			),
		}));
	};

	const onTypeChange = (value: string, id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							type: value,
					  }
					: declaration,
			),
		}));
	};

	const onSelectorBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		let name = e.target.value.trim();

		if (isGenerateClass && name.length) {
			if (!name.startsWith(".")) name = `.${name}`;
			if (!name.includes("*")) name = `${name}*`;
			if (name.includes(" ")) name = name.replaceAll(" ", "-");
		}

		setCopy((prev) => ({
			...prev,
			selector: name,
		}));
	};

	const onSelectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCopy((prev) => ({
			...prev,
			selector: e.target.value,
		}));
	};

	const onDeclarationDelete = (id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.filter((declaration) => declaration.id !== id),
		}));
	};

	const onDeclarationAdd = () => {
		setCopy((prev) => ({
			...prev,
			declarations: [...prev.declarations, getEmptyDeclaration()],
		}));
	};

	const onSelectorToggle = () => {
		setCopy((prev) => ({
			...prev,
			isDisabled: !prev.isDisabled,
		}));
	};

	async function onNewRowEnter(e: React.KeyboardEvent<HTMLInputElement>) {
		focusNextDeclaration({
			e,
			onDeclarationAdd,
		});
	}

	function handleDragEnd(event: { active: any; over: any }) {
		const { active, over } = event;
		const targetDeclaration =
			copy?.declarations?.find((declaration) => declaration?.id === active?.id) || null;

		if (!targetDeclaration) {
			return;
		}

		const declarations = copy?.declarations;
		const oldIndex = declarations?.findIndex((declaration) => declaration?.id === active?.id) || 0;
		const newIndex = declarations?.findIndex((declaration) => declaration?.id === over?.id) || 0;

		if (oldIndex === newIndex || oldIndex === -1 || newIndex === -1) {
			return;
		}

		declarations?.splice(newIndex, 0, declarations?.splice(oldIndex, 1)[0]);

		setCopy((prev) => ({
			...prev,
			declarations,
		}));
	}

	function removeDeclarationOnBackSpace(id: string) {
		const focusedElement = document.activeElement as HTMLInputElement | null;

		if (!focusedElement) {
			return;
		}

		const isInput = focusedElement.tagName === "INPUT";

		if (!isInput && focusedElement?.value) {
			return;
		}

		const declarationRowAbove = focusedElement?.parentElement?.parentElement?.previousElementSibling;
		const valueInputOfDeclarationRowAbove = declarationRowAbove?.querySelector(
			".value-column input",
		) as HTMLInputElement | null;

		valueInputOfDeclarationRowAbove?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
		});
		valueInputOfDeclarationRowAbove?.focus();

		setCopy((prev) => ({
			...prev,
			declarations:
				prev.declarations.length === 1
					? [getEmptyDeclaration()]
					: prev.declarations.filter((declaration) => declaration.id !== id),
		}));
	}

	useDidMountEffect(() => {
		classRowProps.updateItem(copy);
	}, [JSON.stringify(debouncedItem)]);

	return (
		<li
			key={copy.id}
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={clsx("class-row selectors-layout", { "class-row-generate": isGenerateClass })}
		>
			{isGenerateClass && (
				<Switch
					color={!isDisabled ? "primary.3" : "secondary"}
					checked={!isDisabled}
					onChange={onSelectorToggle}
				/>
			)}

			<div className="input-wrapper">
				<input
					type="text"
					onChange={onSelectorChange}
					onPaste={handleSelectorInputPaste}
					onBlur={(e) => (isGenerateClass ? onSelectorBlur(e) : null)}
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
					placeholder=".class-name"
					name={copy.selector}
					value={copy.selector}
					className="slight-style"
				/>

				{!isGenerateClass && (
					<div className="copy" onClick={() => copySelector(copy.selector)}>
						{isSelectorCopied ? <Checkmark /> : <Copy />}
					</div>
				)}
			</div>

			<div className="declarations-container">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e)}>
					<SortableContext
						items={copy.declarations.map((declaration) => declaration.id)}
						strategy={verticalListSortingStrategy}
					>
						{copy.declarations.map(({ property, value, id, type, colorValue, fluidValue }, idx) => (
							<DndItem
								id={id}
								key={id}
								className={clsx("declaration", { multiple: isGenerateClass && idx !== 0 })}
							>
								<CssForm
									onRemoveRow={() => removeDeclarationOnBackSpace(id)}
									onPropertyChange={(value) => onPropertyChange(value, id)}
									onValueChange={(value) => onValueChange(value, id)}
									onColorValueChange={(value) => onColorValueChange(value, id)}
									onFluidValueChange={(value) => onFluidValueChange(value, id)}
									onTypeChange={(value) => onTypeChange(value, id)}
									onNewRow={onNewRowEnter}
									onPaste={handlePaste}
									property={property}
									value={value}
									colorValue={colorValue}
									fluidValue={fluidValue as FluidInputValue}
									type={type}
									selectData={selectData}
									hideTypeColumn={isGenerateClass && idx !== 0}
								/>

								<button
									onClick={() => onDeclarationDelete(id)}
									className="add-remove remove-prop"
									tabIndex={-1}
								>
									<Plus />
								</button>
							</DndItem>
						))}
					</SortableContext>
				</DndContext>

				<button onClick={onDeclarationAdd} className="add-remove add-prop">
					<Plus />
				</button>
			</div>

			<Menu
				transitionProps={{
					duration: 0,
				}}
				shadow="md"
				width={150}
			>
				<Menu.Target>
					<button {...listeners} onClick={handleMenuClick} className="class-settings">
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
});

ClassRow.displayName = "ClassRow";
