import { memo, useCallback, useState } from "react";
import {
	DndContext,
	DragEndEvent,
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
import { ColorInput } from "@mantine/core";
import { parseCSS } from "functions/parseCss";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { ulid } from "ulid";
import { convertToVariableDeclarationName, copyToClipboard, getEmptyDeclaration } from "utils";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Code } from "assets/icons/Code.icon";
import { ColorPalette } from "assets/icons/ColorPalette.icon";
import { Copy } from "assets/icons/Copy.icon.";
import { Plus } from "assets/icons/Plus.icon";
import { Spacing } from "assets/icons/Spacing.icon";
import { useDebounce } from "hooks/useDebounce";
import { useDidMountEffect } from "hooks/useDidMountEffect";
import { changeVariablesAtom, globalCssVariablesAtom } from "state";
import { DndItem } from "./DndItem";
import { FluidInput } from "./ui/FluidInput";
import { Tooltip } from "./ui/Tooltip";

const inputTypes: InputTypes[] = ["text", "color", "fluid"];

const icons = {
	text: <Code />,
	color: <ColorPalette />,
	fluid: <Spacing />,
};

const inputToggleLabels = {
	text: "Switch to custom input",
	color: "Switch to color input",
	fluid: "Switch to fluid input",
};

const getNewType = (prevType: string | undefined, property: string, filteredInputTypes: InputTypes[]) => {
	if (!prevType) {
		return filteredInputTypes[1] ?? "text";
	}

	const currentIndex = filteredInputTypes.indexOf(prevType);

	if (currentIndex === filteredInputTypes.length - 1) {
		return "text";
	}

	return filteredInputTypes[currentIndex + 1];
};

interface IVariableRow {
	readonly updateItem: (value: CssObject) => void;
	readonly duplicateItem: (id: string) => void;
	readonly moveItemUp: (id: string) => void;
	readonly moveItemDown: (id: string) => void;
	readonly deleteItem: (id: string) => void;
	readonly item: CssObject;
	readonly isMoveUpDisabled: boolean;
	readonly isMoveDownDisabled: boolean;
	readonly disableColorInput?: boolean;
}

export const VariableRow = memo<IVariableRow>((variableRowProps) => {
	const [copy, setCopy] = useState(variableRowProps.item);

	const getGlobalCssVars = useAtomCallback(useCallback((get) => get(globalCssVariablesAtom), []));
	const changeGlobalCssVariables = useSetAtom(changeVariablesAtom);

	const [temporaryNameCopy, setTemporaryNameCopy] = useState("");

	const { attributes, setNodeRef, transform, transition } = useSortable({
		id: copy.id,
	});

	const [justCopiedVariable, setJustCopiedVariable] = useState("");

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
			declarations: [
				...prev?.declarations,
				...declarations.map((declaration) => ({
					...declaration,
					id: ulid(),
				})),
			],
		}));
	}

	const onPropertyChange = (value: string, id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							property: convertToVariableDeclarationName(value),
					  }
					: declaration,
			),
		}));
	};

	const onTypeChange = (id: string, type: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.map((declaration) =>
				declaration.id === id
					? {
							...declaration,
							type,
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

	const onDeclarationDelete = (id: string) => {
		setCopy((prev) => ({
			...prev,
			declarations: prev.declarations.filter((declaration) => declaration.id !== id),
		}));
	};

	const onVariableAdd = () => {
		setCopy((prev) => ({
			...prev,
			declarations: [...prev.declarations, getEmptyDeclaration()],
		}));
	};

	function handleDragEnd(event: DragEndEvent) {
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

	function updateAutoComplete({ newValue }: { newValue: string }) {
		const prev = getGlobalCssVars().GLOBAL;
		const newGlobal = prev.filter((variable) => !variable.includes(temporaryNameCopy));

		if (!newValue) {
			return changeGlobalCssVariables({
				type: "GLOBAL",
				variables: newGlobal,
			});
		}

		const variables = [...newGlobal, `var(${convertToVariableDeclarationName(newValue)})`];

		changeGlobalCssVariables({
			type: "GLOBAL",
			variables,
		});
		setTemporaryNameCopy("");
	}

	useDidMountEffect(() => {
		variableRowProps.updateItem(copy);
	}, [JSON.stringify(debouncedItem)]);

	return (
		<div key={copy.id} ref={setNodeRef} style={style} {...attributes} className="class-row variable-layout">
			<ul>
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e)}>
					<SortableContext
						items={copy.declarations.map((declaration) => declaration.id)}
						strategy={verticalListSortingStrategy}
					>
						{copy.declarations.map(({ property, value, id, type, fluidValue, colorValue }) => (
							<DndItem id={id} key={id} className="variable-declaration">
								<li className="property-value-container">
									<div className="prefixed-input-container input-wrapper">
										<span>--</span>
										<input
											type="text"
											onChange={(e) => onPropertyChange(e.target.value, id)}
											onFocus={(e) => setTemporaryNameCopy(e.target.value)}
											onBlur={(e) =>
												updateAutoComplete({
													newValue: e.target.value,
												})
											}
											value={property.replace("--", "")}
											onPaste={handlePaste}
											autoComplete="off"
											autoCorrect="off"
											autoCapitalize="off"
											spellCheck={false}
											placeholder=""
											name={"variable-property"}
											className="variable-name-input"
										/>

										<div
											className="copy"
											onClick={() => {
												copyToClipboard(`var(${property})`);
												setJustCopiedVariable(id);
												toast.success("Variable name copied to clipboard");
												window.clearTimeout(justCopiedVariable);
												setTimeout(() => setJustCopiedVariable(""), 1000);
											}}
										>
											{justCopiedVariable === id ? <Checkmark /> : <Copy />}
										</div>
									</div>

									<div className="value-container">
										<Tooltip
											label={
												inputToggleLabels[
													getNewType(
														type,
														property,
														variableRowProps?.disableColorInput ? ["text", "fluid"] : inputTypes,
													)
												]
											}
										>
											<button
												onClick={() => {
													const button = document.activeElement as HTMLElement;

													onTypeChange(
														id,
														getNewType(
															type,
															property,
															variableRowProps?.disableColorInput ? ["text", "fluid"] : inputTypes,
														),
													);
													setTimeout(() => {
														const input = button?.parentElement?.querySelector("input");
														input?.focus();
													}, 20);
												}}
												className={"type-toggle"}
												tabIndex={-1}
											>
												{icons[(type as InputTypes) ?? "text"]}
											</button>
										</Tooltip>

										{(type === "text" || !type) && (
											<input
												type="text"
												onChange={(e) => onValueChange(e.target.value, id)}
												value={value}
												onPaste={handlePaste}
												autoComplete="off"
												autoCorrect="off"
												autoCapitalize="off"
												spellCheck={false}
												placeholder=""
												name={"variable-value"}
												className="variable-value-input"
											/>
										)}

										{type === "fluid" && (
											<FluidInput
												value={(fluidValue as FluidInputValue) ?? ["", "", "px"]}
												onChange={(value) => onFluidValueChange(value, id)}
											/>
										)}

										{type === "color" && (
											<ColorInput
												onChange={(value) => onColorValueChange(value, id)}
												value={colorValue}
												placeholder="Value"
												withPreview={true}
											/>
										)}
									</div>
								</li>

								<div className="add-remove-container">
									<button
										onClick={() => onDeclarationDelete(id)}
										className="add-remove remove-prop"
										tabIndex={-1}
									>
										<Plus />
									</button>
								</div>
							</DndItem>
						))}
					</SortableContext>
				</DndContext>
			</ul>

			<button onClick={onVariableAdd} className="add-remove add-prop add-next" tabIndex={-1}>
				<Plus />
			</button>
		</div>
	);
});

VariableRow.displayName = "VariableRow";
