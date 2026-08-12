import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ColorInput, Select } from "@mantine/core";
import clsx from "clsx";
import { Code } from "assets/icons/Code.icon";
import { ColorPalette } from "assets/icons/ColorPalette.icon";
import { Spacing } from "assets/icons/Spacing.icon";
import { useAutocomplete } from "hooks/useAutocomplete";
import { useDebounce } from "hooks/useDebounce";
import { isClampInputSupportedProperty, isColorInputSupportedProperty } from "constants/inputTypes";
import { Autocomplete } from "./basic/Autocomplete";
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

interface ICssForm {
	readonly onPropertyChange: (value: string) => void;
	readonly onValueChange: (value: string) => void;
	readonly onColorValueChange?: (value: string) => void;
	readonly onFluidValueChange?: (value: FluidInputValue) => void;
	readonly onTypeChange?: (value: InputTypes) => void;
	readonly onNewRow?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	readonly onRemoveRow?: () => void;
	readonly onSuggestionPreview?: ({ property, value }: { property: string; value: string }) => void;
	readonly onSuggestionPreviewAbort?: () => void;
	readonly onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
	readonly property: string;
	readonly value: string;
	readonly colorValue?: string;
	readonly fluidValue?: FluidInputValue;
	readonly type?: string;
	readonly selectData?: { value: string; label: string }[];
	readonly hideTypeColumn?: boolean;
}

export const CssForm = memo<ICssForm>(
	({
		onPropertyChange,
		onValueChange,
		onColorValueChange,
		onFluidValueChange,
		onTypeChange,
		onNewRow,
		onSuggestionPreview,
		onSuggestionPreviewAbort,
		onRemoveRow,
		onPaste,
		property,
		value,
		colorValue,
		fluidValue,
		type,
		selectData,
		hideTypeColumn,
	}) => {
		const [innerProperty, setInnerProperty] = useState(property);

		const [innerValue, setInnerValue] = useState(value);
		const [innerColorValue, setInnerColorValue] = useState(colorValue);
		const [innerFluidValue, setInnerFluidValue] = useState<FluidInputValue>(fluidValue ?? [0, 0, "px"]);

		const { refreshSuggestions, valueSuggestions, propertySuggestions } = useAutocomplete();

		const debouncedInnerProperty = useDebounce(innerProperty, 100);

		const debouncedInnerValue = useDebounce(innerValue, 100);
		const debouncedInnerColorValue = useDebounce(innerColorValue, 100);
		const debouncedInnerFluidValue = useDebounce(innerFluidValue, 100);

		const valueContainerRef = useRef<HTMLDivElement>(null);

		const avaliableInputTypes = useMemo(() => {
			return inputTypes.filter((type) => {
				if (type === "color") {
					return isColorInputSupportedProperty(property);
				}

				if (type === "fluid") {
					return isClampInputSupportedProperty(property);
				}

				return true;
			});
		}, [property]);

		const inputToggleIcon = useMemo(() => icons[(type as InputTypes) || "text"], [type]);

		const inputToggleLabel = useMemo(
			() => inputToggleLabels[getNewType(type, property, avaliableInputTypes)],
			[type, property, avaliableInputTypes],
		);

		function handlePropertyChange(value: string) {
			setInnerProperty(value);
		}

		function handleValueChange(value: string) {
			setInnerValue(value);
		}

		function handlePropertyInputBlur() {
			refreshSuggestions(innerProperty);
		}

		function handleValueInputFocus() {
			refreshSuggestions(innerProperty);
		}

		function handleValueInputBlur() {
			if (value !== innerValue) {
				onValueChange(innerValue);
			}
		}

		function handleNewRowOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
			if (onNewRow) {
				onNewRow(e);
			}
		}

		function handleSuggestionPreview(value: string) {
			if (onSuggestionPreview) {
				onSuggestionPreview({
					property: innerProperty,
					value,
				});
			}
		}

		function onBackspaceEmptyValueInput() {
			const focusedInput = document.activeElement as HTMLInputElement | null;
			if (!focusedInput) {
				return;
			}

			const container = focusedInput.parentElement?.parentElement?.parentElement;
			const propertyInput = container?.querySelector(
				".autocomplete-wrapper input",
			) as HTMLInputElement | null;

			// focusedInput?.blur();
			propertyInput?.focus();
		}

		useEffect(() => {
			if (property !== innerProperty) {
				setInnerProperty(property);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only sync when external prop changes
		}, [JSON.stringify(property)]);

		useEffect(() => {
			if (value !== innerValue) {
				setInnerValue(value);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only sync when external prop changes
		}, [JSON.stringify(value)]);

		useEffect(() => {
			if (property !== debouncedInnerProperty) {
				onPropertyChange(debouncedInnerProperty);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only fire on debounce resolution
		}, [JSON.stringify(debouncedInnerProperty)]);

		useEffect(() => {
			if (value !== debouncedInnerValue) {
				onValueChange(debouncedInnerValue);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only fire on debounce resolution
		}, [JSON.stringify(debouncedInnerValue)]);

		useEffect(() => {
			if (colorValue !== innerColorValue) {
				setInnerColorValue(colorValue);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only sync when external prop changes
		}, [JSON.stringify(colorValue)]);

		useEffect(() => {
			if (colorValue !== debouncedInnerColorValue) {
				onColorValueChange?.(debouncedInnerColorValue || "");
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only fire on debounce resolution, not prop echo
		}, [JSON.stringify(debouncedInnerColorValue)]);

		useEffect(() => {
			if (fluidValue !== innerFluidValue) {
				setInnerFluidValue(fluidValue || [0, 0, "px"]);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only sync when external prop changes
		}, [JSON.stringify(fluidValue)]);

		useEffect(() => {
			if (fluidValue !== debouncedInnerFluidValue) {
				onFluidValueChange?.(debouncedInnerFluidValue || [0, 0, "px"]);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only fire on debounce resolution
		}, [JSON.stringify(debouncedInnerFluidValue)]);

		return (
			<>
				<Autocomplete
					onChange={handlePropertyChange}
					onFocus={handleValueInputFocus}
					onBlur={handlePropertyInputBlur}
					onPaste={onPaste}
					onBackspaceEmpty={onRemoveRow}
					value={innerProperty || ""}
					data={
						propertySuggestions.map((item) => ({
							value: item,
						})) || []
					}
					placeholder="Property"
				/>

				{!hideTypeColumn && (
					<div
						className={clsx("value-column", {
							"with-type-toggle": avaliableInputTypes.length > 1,
						})}
						ref={valueContainerRef}
					>
						<Tooltip label={avaliableInputTypes.length > 1 ? inputToggleLabel : ""}>
							<button
								onClick={() => {
									onTypeChange?.(getNewType(type, property, avaliableInputTypes));
									setTimeout(() => {
										const input = valueContainerRef.current?.querySelector("input");
										input?.focus();
									}, 20);
								}}
								className={clsx("svg-m type-toggle", {
									disabled: avaliableInputTypes.length < 2,
								})}
								tabIndex={-1}
							>
								{inputToggleIcon}
							</button>
						</Tooltip>

						{(type === "text" || !type) && (
							<Autocomplete
								onFocus={handleValueInputFocus}
								onBlur={handleValueInputBlur}
								onAddNewRow={handleNewRowOnEnter}
								onBackspaceEmpty={onBackspaceEmptyValueInput}
								onChange={handleValueChange}
								onSuggestionPreview={handleSuggestionPreview}
								onSuggestionPreviewAbort={onSuggestionPreviewAbort}
								onPaste={onPaste}
								value={innerValue || ""}
								data={valueSuggestions || []}
								allowMultipleWords={true}
								placeholder="Value"
								refreshSuggestions={() => {
									refreshSuggestions(innerProperty);
								}}
							/>
						)}

						{type === "fluid" && <FluidInput value={innerFluidValue} onChange={setInnerFluidValue} />}

						{type === "color" && (
							<ColorInput
								onChange={(value) => {
									setInnerColorValue(value);
									onColorValueChange?.(value);
								}}
								withinPortal={true}
								portalProps={{
									target: valueContainerRef.current ?? document.body,
								}}
								value={innerColorValue}
								placeholder="Value"
								withPreview={true}
							/>
						)}

						{type === "tab" && (
							<Select
								placeholder="Tab name"
								data={selectData || []}
								onChange={(value) => {
									setInnerValue(value ?? "");
								}}
								value={innerValue}
								transitionProps={{
									duration: 150,
									transition: "fade",
								}}
								className="choose-tab-select"
								disabled={!selectData?.length}
							/>
						)}
					</div>
				)}

				{hideTypeColumn && <div className="value-column" style={{ height: "100%" }}></div>}
			</>
		);
	},
);

CssForm.displayName = "CssForm";
