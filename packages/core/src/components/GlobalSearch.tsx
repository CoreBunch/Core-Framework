import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "assets/icons/Search.icon";
import { NAV_ITEMS } from "constants/navItems";
import {
	SEARCH_CLASS,
	SECTIONS,
	extractClassValue,
	extractValue,
	findMatchingRow,
	handleExpandRow,
	isVariable,
	matchTypoOrSpacing,
} from "functions/globalSearchUtil";
import { useDebounce } from "hooks/useDebounce";
import { useDidMountEffect } from "hooks/useDidMountEffect";
import { SearchItems, useGlobalSearch } from "hooks/useGlobalSearch";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { useHotkeys } from "@mantine/hooks";
import clsx from "clsx";
import { useAtom } from "jotai/index";
import { selectedBreakpointAtom, viewAtom } from "state";
import { searchAtom } from "state/searchAtom";

export const GlobalSearch = memo(() => {
	const [selectedBreakpoint, setSelectedBreakpoint] = useAtom(selectedBreakpointAtom);
	const [view, setView] = useAtom(viewAtom);
	const [isSearch, setIsSearch] = useAtom(searchAtom);

	const { search } = useGlobalSearch();

	const searchWrapperRef = useRef(null);

	const [searchValue, setSearchValue] = useState<string>("");
	const [selected, setSelected] = useState<{ listIdx: number | null; itemIdx: number | null }>({
		listIdx: null,
		itemIdx: null,
	});
	const [clickedItem, setClickedItem] = useState<CssObject | null>(null);
	const [items, setItems] = useState<SearchItems>({
		colors: [],
		typography: [],
		spacing: [],
		components: [],
		layouts: [],
		design: [],
		other: [],
	});

	const debouncedValue = useDebounce(searchValue, 300);

	const handleClick = useCallback((view: View, value: CssObject) => {
		setClickedItem(value);
		setView(view);
		setSelectedBreakpoint((value?.mediaQuery ?? null) as Breakpoint);
		setIsSearch(false);
		setSearchValue("");
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	const clearClasses = useCallback(() => {
		const activeItems = Array.from(document.querySelectorAll(`.${SEARCH_CLASS}`));
		if (activeItems.length) activeItems.forEach((item) => item.classList.remove(SEARCH_CLASS));
	}, []);
	const close = useCallback(() => {
		clearClasses();
		setIsSearch(false);
		setSearchValue("");
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	const handleNavigation = useCallback(
		(direction: "up" | "down") => {
			const updatedLists = Object.values(items);

			const findNextValidListIdx = (startIdx: number, direction: "up" | "down") => {
				let idx = startIdx;
				while (idx >= 0 && idx < updatedLists.length && updatedLists[idx].length === 0) {
					idx += direction === "down" ? 1 : -1;
				}
				return idx >= 0 && idx < updatedLists.length ? idx : -1;
			};

			setSelected(({ listIdx, itemIdx }) => {
				if (updatedLists.length === 0) return { listIdx: null, itemIdx: null };
				if (listIdx === null) {
					const firstValidListIdx = updatedLists.findIndex((list) => list.length > 0);
					return firstValidListIdx === -1
						? { listIdx: null, itemIdx: null }
						: { listIdx: firstValidListIdx, itemIdx: 0 };
				}

				let newItemIdx: number = itemIdx ?? 0;
				let newListIdx: number = listIdx;

				if (direction === "down") {
					if (newItemIdx < updatedLists[newListIdx]?.length - 1) {
						newItemIdx++;
					} else {
						newListIdx = findNextValidListIdx(newListIdx + 1, "down");
						if (newListIdx === -1) return { listIdx, itemIdx };
						newItemIdx = 0;
					}
				} else {
					if (newItemIdx > 0) {
						newItemIdx--;
					} else {
						newListIdx = findNextValidListIdx(newListIdx - 1, "up");
						if (newListIdx === -1) return { listIdx, itemIdx };
						newItemIdx = updatedLists[newListIdx].length - 1 || 0;
					}
				}

				return { listIdx: newListIdx, itemIdx: newItemIdx };
			});
		},
		[items],
	);
	const handleEnter = useCallback(() => {
		const { listIdx, itemIdx } = selected;
		if (listIdx === null || itemIdx === null) return;

		const selectedCss: CssObject = (Object.values(items) as CssObject[][])[listIdx][itemIdx];
		const sectionKey = Object.keys(items).find((key) =>
			(items[key as keyof Preset["styleSheetData"]] as CssObject[]).includes(selectedCss),
		);
		if (!sectionKey) return;

		const sectionName = SECTIONS[sectionKey as keyof typeof SECTIONS];
		const navItem = NAV_ITEMS.find((nav) => nav.name === sectionName);
		if (navItem) {
			handleClick(navItem.value, selectedCss);
		}
	}, [selected, items, handleClick]);
	const onkeydown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			const { key } = e;

			if (["ArrowDown", "ArrowUp", "Enter"].includes(key)) {
				e.preventDefault();
				e.stopPropagation();
			}

			switch (key) {
				case "ArrowDown":
					return handleNavigation("down");
				case "ArrowUp":
					return handleNavigation("up");
				case "Enter":
					return handleEnter();
			}
		},
		[handleNavigation, handleEnter],
	);

	const foundedItems = useMemo(() => {
		return (
			<>
				{Object.values(items).some((el) => (el as CssObject[])?.length) && (
					<div className="items-wrapper">
						{Object.entries(items).map(([section, values], listIdx) => {
							if (!(values as any[])?.length) return null;

							const sectionName = SECTIONS[section as keyof typeof SECTIONS];
							const navItem = NAV_ITEMS.find((nav) => nav.name === sectionName);
							if (!navItem) return null;

							return (
								<ul key={listIdx}>
									<li>
										<div className="item-header">
											<navItem.icon />
											<span>{navItem.name}</span>
										</div>

										<div className="item-body">
											{values?.map((css, idx) => (
												<div
													key={idx}
													className={clsx("item-body-row", {
														selected: listIdx === selected.listIdx && idx === selected.itemIdx,
													})}
													onClick={() => handleClick(navItem.value, css)}
												>
													<span className="item-selector-name">{css.selector}</span>
													<div className="item-tags">
														<span className="item-tag">{css.groupName}</span>
														<span className="item-tag tag-var">
															{isVariable(css.types, css.selector) ? "Variable" : "Class"}
														</span>
													</div>
												</div>
											))}
										</div>
									</li>
								</ul>
							);
						})}
					</div>
				)}
			</>
		);
	}, [items, selected, handleClick]);

	useOnClickOutside(searchWrapperRef, close);
	useHotkeys(
		[
			["mod + k", () => setIsSearch(true)],
			["Escape", close],
		],
		[],
		true,
	);

	useEffect(() => {
		if (!clickedItem?.id) return;

		const { types, selector, groupName, id } = clickedItem;
		const promises: Promise<void>[] = [];
		let elements: NodeListOf<Element> | null = null;

		const handleColorSystem = (currentSelector: string, currentTypes: CssObject["types"]) => {
			let value = currentSelector;
			let selectors = "";

			if (currentTypes?.every((type) => type === "variable")) {
				value = value.replace("--", "");
				selectors = ".prefixed-input-container.input-wrapper";
			} else {
				if (currentTypes?.includes("bg-class")) {
					value = extractClassValue(value.replace(".bg-", ""), currentTypes);
					selectors = ".color-option-bg div";
				} else if (currentTypes?.includes("text-class")) {
					value = extractClassValue(value.replace(".text-", ""), currentTypes);
					selectors = ".color-option-text div";
				} else if (currentTypes?.includes("border-class")) {
					value = extractClassValue(value.replace(".border-", ""), currentTypes);
					selectors = ".color-option-border div";
				} else if (currentTypes?.includes("fill-class")) {
					value = extractClassValue(value.replace(".fill-", ""), currentTypes);
					selectors = ".color-option-fill div";
				} else if (currentTypes?.includes("shade-tint")) {
					value = extractClassValue(value, currentTypes).replace("--", "");
					selectors = ".color-preview";
				} else if (currentTypes?.includes("transparent-class")) {
					value = extractValue(/^(.*?)-\d+$/, value).replace("--", "");
					selectors = ".transparent-vars-row";
				}
			}

			const matchRow = findMatchingRow(value);
			handleExpandRow(matchRow);
			return matchRow?.parentElement?.querySelectorAll(selectors) || null;
		};

		const waitForClickFinish = (element: HTMLElement) => {
			return new Promise<void>((resolve) => {
				const handleClick = () => {
					element.removeEventListener("click", handleClick);
					setTimeout(() => resolve(), 0);
				};
				element.addEventListener("click", handleClick);
				element.click();
			});
		};

		const selectElementsByType = () => {
			if (types?.every((type) => type === "class") || !types?.length) {
				elements = isVariable([], selector)
					? document.querySelectorAll(".variable-declaration")
					: document.querySelectorAll(".class-row.selectors-layout");
			} else if (view === "COLOR_SYSTEM") {
				elements = handleColorSystem(selector, types);
			} else if (view === "TYPOGRAPHY") {
				if (types?.includes("typo-class")) {
					elements = document.querySelectorAll(".class-row-generate");
				} else if (types?.includes("typo-variable")) {
					const tabTitles = document.querySelectorAll(".tab-name");
					const validTab = Array.from(tabTitles).find((tab) => tab.innerHTML.includes(groupName ?? ""));

					if (validTab) {
						promises.push(
							waitForClickFinish(validTab as HTMLElement).then(() => {
								elements = id.startsWith("f_m")
									? document.querySelectorAll(".typo-layout-manual")
									: document.querySelectorAll(".typo-layout");
							}),
						);
					}
				}
			} else if (view === "SPACING") {
				if (types?.includes("space-class")) {
					elements = document.querySelectorAll(".class-row-generate");
				} else if (types?.includes("space-variable")) {
					const tabTitles = document.querySelectorAll(".tab-name");
					const validTab = Array.from(tabTitles).find((tab) => tab.innerHTML.includes(groupName ?? ""));

					if (validTab) {
						promises.push(
							waitForClickFinish(validTab as HTMLElement).then(() => {
								elements = id.startsWith("f_m")
									? document.querySelectorAll(".typo-layout-manual")
									: document.querySelectorAll(".typo-layout");
							}),
						);
					}
				}
			}
			// TODO: Add search by components later
			// else if (view === "COMPONENTS") {
			// }
		};

		const handleSearchHighlight = (rows: Element[], searchValue: string, types?: CssObject["types"]) => {
			let matchedItem = null;
			rows.forEach((item) => item.classList.remove(SEARCH_CLASS));
			searchValue = isVariable([], searchValue) ? searchValue.replace("--", "") : searchValue;

			if (
				types?.includes("bg-class") ||
				types?.includes("text-class") ||
				types?.includes("border-class") ||
				types?.includes("fill-class")
			) {
				matchedItem = rows[0];
			} else if (types?.includes("shade-tint")) {
				const index = Number(searchValue.charAt(searchValue.length - 1)) - 1;
				const halfIndex = Math.ceil(rows.length / 2);
				matchedItem = (selector.includes("-d-") ? rows.slice(0, halfIndex) : rows.slice(halfIndex))[index];
			} else if (types?.includes("transparent-class")) {
				matchedItem = rows[0];
			} else if (types?.includes("typo-class") || types?.includes("space-class")) {
				matchedItem = rows
					.filter((item) =>
						matchTypoOrSpacing(searchValue, (item.querySelector(".slight-style") as HTMLInputElement).value),
					)
					.sort(
						(a, b) =>
							(b.querySelector(".slight-style") as HTMLInputElement).value.length -
							(a.querySelector(".slight-style") as HTMLInputElement).value.length,
					)[0];
			} else if (types?.includes("typo-variable") || types?.includes("space-variable")) {
				matchedItem = rows.find((item) => item.innerHTML.includes(searchValue.replace("--", "")));
			} else {
				matchedItem = rows.find((item) => item.innerHTML.includes(searchValue));
			}

			if (matchedItem) {
				matchedItem.scrollIntoView({ behavior: "smooth", block: "center" });
				matchedItem.classList.add(SEARCH_CLASS);
			}
		};

		selectElementsByType();

		Promise.all(promises).then(() => {
			if (elements?.length) {
				const rows = Array.from(elements) as Element[];
				handleSearchHighlight(rows, selector, types);
			}

			setClickedItem(null);
			setTimeout(clearClasses, 4700);
		});
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [view, clickedItem]);

	useEffect(() => {
		if (!isSearch) return;
		(document.querySelector(".search-wrapper input") as HTMLInputElement)?.focus();
	}, [isSearch]);

	useEffect(() => {
		if (selected.itemIdx === null) return;
		document.querySelector(".item-body .selected")?.scrollIntoView({ block: "nearest" });
	}, [selected.itemIdx]);

	useDidMountEffect(() => {
		setSelected({ listIdx: null, itemIdx: null });
		setItems(search(debouncedValue));
	}, [debouncedValue]);

	return (
		<div ref={searchWrapperRef} className="global-search">
			{isSearch && (
				<div className="search-wrapper">
					<Search />
					<input
						type="text"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						placeholder="Search..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						onKeyDown={onkeydown}
					/>

					{foundedItems}
				</div>
			)}
		</div>
	);
});

GlobalSearch.displayName = "GlobalSearch";
