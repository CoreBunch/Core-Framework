import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { scrollToNestedElement } from "utils";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { cssLogicalPropsMap } from "cssGenerator/readOnly/cssReference";

function parseValue(value: string, prevValue: string) {
	const hasMultipleItems = prevValue.includes(" ");

	if (!(hasMultipleItems && value)) {
		return value;
	}

	const splitValue = prevValue.split(" ");
	const lastItem = splitValue.at(-1);
	const filledLastItem = `${lastItem}${value}`.replace(lastItem ?? "", "");

	return `${splitValue.splice(0, splitValue.length - 1).join(" ")} ${filledLastItem ?? ""}`;
}

interface IAutoComplete {
	readonly onChange: (value: string) => void;
	readonly onFocus: () => void;
	readonly onBlur: () => void;
	readonly onAddNewRow?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	readonly onSuggestionPreview?: (value: string) => void;
	readonly onSuggestionPreviewAbort?: () => void;
	readonly onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
	readonly onBackspaceEmpty?: () => void;
	readonly refreshSuggestions?: () => void;
	readonly value: string;
	readonly data: {
		value: string;
		color?: string;
		transparent?: number;
		group?: string;
	}[];
	readonly allowMultipleWords?: boolean;
	readonly placeholder?: string;
}

export const Autocomplete = memo<IAutoComplete>(
	({
		onChange,
		onFocus,
		onBlur,
		onAddNewRow,
		onSuggestionPreview,
		onSuggestionPreviewAbort,
		onPaste,
		value,
		data,
		allowMultipleWords,
		placeholder,
		onBackspaceEmpty,
		refreshSuggestions,
	}) => {
		const [innerValue, setInnerValue] = useState(value);
		const [isOpened, setIsOpened] = useState(false);
		const [selected, setSelected] = useState<number | null>(null);

		const inputRef = useRef<HTMLInputElement>(null);
		const itemsRefs = useRef<Record<string, HTMLDivElement>>({});
		const suggestionsWrapperRef = useRef<HTMLDivElement>(null);

		const filteredData = useMemo(() => {
			if (!innerValue) {
				return data;
			}

			let _innerValue = innerValue;
			const varStrings = ["v", "va", "var", "var(", "var(-", "var(--"];

			for (const string of varStrings) {
				if (string.includes(innerValue)) {
					_innerValue = _innerValue.replace(string, "--");
				}
			}

			if (innerValue.startsWith("var(--") && innerValue.endsWith(")")) {
				_innerValue = innerValue.replace("var(--", "").replace(")", "");
			}

			const baseSuggestion = data.filter(
				(item) =>
					(item.value.startsWith(_innerValue?.toLowerCase()) && item.value !== _innerValue) ||
					item.value.replace("--", "").startsWith(_innerValue?.toLowerCase()) ||
					cssLogicalPropsMap.get(item.value)?.startsWith(_innerValue?.toLowerCase()),
			);

			if (baseSuggestion.length || !allowMultipleWords) {
				return baseSuggestion;
			}

			if (_innerValue.includes(" ")) {
				const innerValueArr = _innerValue.split(" ");
				const lastItem = innerValueArr.at(-1) || "";
				return data.filter(
					(item) => item.value.startsWith(lastItem?.toLowerCase()) && !innerValueArr.includes(item.value),
				);
			}
			return [];
		}, [data, innerValue, allowMultipleWords]);

		type FilteredDataWithIndex = (typeof filteredData)[number] & {
			i: number;
		};

		const groupedData = useMemo(() => {
			const groupedData: Record<string, FilteredDataWithIndex[]> = {};

			for (let i = 0; i < filteredData.length; i++) {
				const item = filteredData[i];

				if (item.group) {
					if (!groupedData[item.group]) {
						groupedData[item.group] = [];
					}

					groupedData[item.group].push({
						...item,
						i,
					});
				}

				if (!item.group) {
					if (!groupedData[""]) {
						groupedData[""] = [];
					}

					groupedData[""].push({
						...item,
						i,
					});
				}
			}

			return groupedData;
		}, [filteredData]);

		function handleChange({ target }: React.ChangeEvent<HTMLInputElement>) {
			const { value } = target;

			if (!isOpened) {
				setIsOpened(true);
			}

			setSelected(null);
			setInnerValue(value);
			onChange(value);
		}

		function handleSuggestionInsert(value: string) {
			if (value.startsWith("--")) {
				value = `var(${value})`;
			}

			const hasMultipleItems = innerValue.includes(" ");

			if (onSuggestionPreviewAbort) {
				setTimeout(() => {
					onSuggestionPreviewAbort();
				}, 250);
			}

			if (!hasMultipleItems) {
				setInnerValue(value);
			}

			if (hasMultipleItems) {
				const splitInnerValue = innerValue.split(" ");
				const lastItem = splitInnerValue.at(-1);
				const filledLastItem = `${lastItem}${value}`.replace(lastItem ?? "", "");
				const fullValue = `${splitInnerValue
					.splice(0, splitInnerValue.length - 1)
					.join(" ")} ${filledLastItem}`;

				setInnerValue(fullValue);
			}

			setIsOpened(false);
		}

		function handleSuggestionsClick(value: string) {
			handleSuggestionInsert(value);
			setIsOpened(false);
		}

		function getNextIndex(
			index: number,
			nextItem: (index: number) => number,
			compareFn: (index: number) => boolean,
		) {
			let i = index;

			while (compareFn(i)) {
				i = nextItem(i);
				return i;
			}

			return index;
		}

		function handleArrowDown() {
			setSelected((current) => {
				const nextIndex = getNextIndex(
					current ?? -1,
					(index) => index + 1,
					(index) => index < filteredData.length - 1,
				);
				const nextItemValue = itemsRefs?.current[filteredData[nextIndex]?.value];

				scrollToNestedElement(suggestionsWrapperRef?.current as HTMLDivElement, nextItemValue, true);

				if (onSuggestionPreview && nextIndex !== undefined) {
					//! FIX ME This is totally hacky, pls fix
					setTimeout(() => {
						onSuggestionPreview(parseValue(filteredData[nextIndex]?.value, innerValue));
					}, 0);
				}

				return nextIndex;
			});
		}

		function handleArrowUp() {
			setSelected((current) => {
				const nextIndex = getNextIndex(
					current ?? 1,
					(index) => index - 1,
					(index) => index > 0,
				);
				const nextItemValue = itemsRefs?.current[filteredData[nextIndex]?.value];

				scrollToNestedElement(suggestionsWrapperRef?.current as HTMLDivElement, nextItemValue, true);

				if (onSuggestionPreview && nextIndex !== undefined) {
					setTimeout(() => {
						const previewedValue = parseValue(filteredData[nextIndex]?.value, innerValue);
						onSuggestionPreview(previewedValue);
					}, 0);
				}

				return nextIndex;
			});
		}

		function handleEnter(e?: React.KeyboardEvent<HTMLInputElement>) {
			setIsOpened(false);

			const hasSelection = selected !== null && selected !== -1;
			const hasSuggestions = filteredData.length > 0;

			if (!(hasSelection && hasSuggestions)) {
				if (e) {
					onAddNewRow?.(e);
				}

				return;
			}

			const closestIndex = Number(selected) > filteredData.length - 1 ? filteredData.length - 1 : selected;
			const suggestion = filteredData[closestIndex]?.value;

			if (!suggestion) {
				return;
			}

			handleSuggestionInsert(suggestion);
		}

		async function handleTab(e: React.KeyboardEvent<HTMLInputElement>) {
			const { currentTarget } = e;
			e.preventDefault();

			if (isOpened) {
				handleEnter();
			}

			await new Promise((resolve) => setTimeout(resolve, 10));

			onBlur?.();

			setTimeout(() => {
				if (onAddNewRow) {
					onAddNewRow(e);
				}

				const input = currentTarget as HTMLInputElement;
				const isValueInput = Boolean(input.parentElement?.parentElement?.classList.contains("value-column"));
				const declaration = input?.parentElement?.parentElement;
				const targetInput = isValueInput
					? (declaration?.nextElementSibling?.querySelector(
							".autocomplete-wrapper input",
					  ) as HTMLInputElement | null)
					: (declaration?.querySelector(".value-column input") as HTMLInputElement | null);

				targetInput?.focus();
			}, 50);
		}

		function onShiftTab(e: React.KeyboardEvent<HTMLInputElement>) {
			e.preventDefault();

			setIsOpened(false);
			setSelected(null);

			const input = e.currentTarget;
			const isValueInput = Boolean(input.parentElement?.parentElement?.classList.contains("value-column"));
			const declarationRowAbove = input?.parentElement?.parentElement?.previousElementSibling;
			const valueInputOfDeclarationRowAbove = declarationRowAbove?.querySelector(
				isValueInput ? ".autocomplete-wrapper input" : ".value-column input",
			) as HTMLInputElement | null;

			valueInputOfDeclarationRowAbove?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
			valueInputOfDeclarationRowAbove?.focus();
		}

		function onkeydown(e: React.KeyboardEvent<HTMLInputElement>) {
			const { key } = e;

			if (["ArrowDown", "ArrowUp", "Enter"].includes(key)) {
				e.preventDefault();
				e.stopPropagation();
			}

			switch (key) {
				case "ArrowDown": {
					handleArrowDown();
					break;
				}

				case "ArrowUp": {
					handleArrowUp();
					break;
				}

				case "Enter": {
					handleEnter(e);
					break;
				}

				case "Tab": {
					if (e.shiftKey) {
						onShiftTab?.(e);
						return;
					}
					handleTab(e);
					break;
				}

				case "Backspace": {
					if (innerValue === "") {
						e.preventDefault();
						onBackspaceEmpty?.();
						setIsOpened(false);
						setSelected(null);
					}

					break;
				}
			}
		}

		function handleFocus() {
			if (onFocus) {
				onFocus();
			}

			setIsOpened(true);
			setSelected(null);

			setTimeout(() => {
				setIsOpened(true);
				setSelected(null);

				if (!data.length) {
					refreshSuggestions?.();
				}
			}, 5);
		}

		function handleBlur() {
			if (onBlur) {
				onBlur();
			}

			// setIsOpened(false);
			setSelected(null);

			if (onSuggestionPreviewAbort) {
				onSuggestionPreviewAbort();
			}
		}

		function onSuggestionMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
			if (!onSuggestionPreview) {
				return;
			}

			const target = e.target as HTMLDivElement;

			if (!target) {
				return;
			}

			const span = target.querySelector("span");
			const value = (span?.textContent ?? "").trim();

			if (!value) {
				onSuggestionPreviewAbort?.();
				return;
			}

			onSuggestionPreview(parseValue(value, innerValue));
		}

		useEffect(() => {
			if (value !== innerValue) {
				setInnerValue(value);
			}
			// biome-ignore lint/correctness/useExhaustiveDependencies: only sync when external prop changes
		}, [JSON.stringify(value)]);

		useEffect(() => {
			onChange(innerValue);
			// biome-ignore lint/correctness/useExhaustiveDependencies: only fire when innerValue settles
		}, [JSON.stringify(innerValue)]);

		useEffect(() => {
			document?.querySelector(".content")?.addEventListener("scroll", () => setIsOpened(false));

			return () => onSuggestionPreviewAbort?.();
			// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
		}, []);

		useOnClickOutside(inputRef, (e) => {
			if ([...(e.target as HTMLElement)?.classList].includes("_drop-item")) {
				return;
			}

			setIsOpened(false);
		});

		return (
			<div className="autocomplete-wrapper">
				{isOpened && Object.keys(groupedData).length ? (
					<div
						ref={suggestionsWrapperRef}
						data-selected={selected}
						className="suggestions-wrapper"
						style={{
							width: inputRef?.current?.offsetWidth,
							left: inputRef?.current?.getBoundingClientRect().left,
							top: inputRef?.current?.getBoundingClientRect().top,
						}}
					>
						{Object.keys(groupedData).map((group) => (
							<div key={group}>
								{group && <div className="item group-title">{group}</div>}

								{groupedData[group].map(({ value, color, transparent, i }) => (
									<div
										onMouseEnter={onSuggestionMouseEnter}
										onMouseLeave={onSuggestionPreviewAbort}
										key={value}
										onClick={() => handleSuggestionsClick(value)}
										ref={(node: HTMLDivElement) => {
											if (node) itemsRefs.current[value] = node;
										}}
										className={clsx("item _drop-item", {
											selected: i === selected,
										})}
									>
										{color && (
											<div
												onClick={() => handleSuggestionsClick(value)}
												className="color-hint _drop-item"
												style={{
													background: color,
													opacity: transparent ? transparent / 100 : 1,
												}}
											/>
										)}

										<span className="_drop-item" onClick={() => handleSuggestionsClick(value)}>
											{value}
										</span>
									</div>
								))}
							</div>
						))}
					</div>
				) : null}

				<input
					ref={inputRef}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onKeyDown={onkeydown}
					onPaste={onPaste}
					value={innerValue}
					placeholder={placeholder || "Enter value"}
					className="autocomplete-input"
					autoComplete="off"
					spellCheck="false"
				/>
			</div>
		);
	},
);

Autocomplete.displayName = "Autocomplete";
