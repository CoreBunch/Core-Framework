import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "assets/icons/Plus.icon";
import { useDebounce } from "hooks/useDebounce";
import { EmptyClassSection } from "components/ui/EmptyClassSection";
import { Tooltip } from "@mantine/core";
import { useAtom } from "jotai";
import { useSetAtom } from "jotai";
import { ulid } from "ulid";
import { changeVariablesAtom, stylesheetsDataAtom } from "state";
import { StylesheetsTabContent } from "./components/StylesheetsTabContent";
import { StylesheetsTabMenu } from "./components/StylesheetsTabMenu";
import { StylesheetsTabTitle } from "./components/StylesheetsTabTitle";
import { useStylesheets } from "./hooks/useStylesheets";
import { StylesheetGroup, StylesheetsData } from "./types";

type ActionNames = "rename" | "duplicate" | "delete" | "reset";

export const StylesheetsTabs = memo(() => {
	const [stylesheetsFormData, setStylesheetsFormData] = useAtom(stylesheetsDataAtom);
	const { state, dispatch } = useStylesheets(stylesheetsFormData);
	const titlesList = useRef<HTMLDivElement>(null);

	const [activeTabIndex, setActiveTabIndex] = useState(0);
	const tabs = useMemo(
		() => state.groups.map(({ name, id, hasErrors }) => ({ value: name, id, hasErrors })),
		[state],
	);

	const clickedTitle = useRef("");
	const clickedTitleIndex = useRef<number | null>(null);
	const [openedMenu, setOpenedMenu] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

	const activeTab = useMemo(() => state.groups[activeTabIndex], [activeTabIndex, state]);
	const debouncedState = useDebounce(state, 500);
	const changeGlobalCssVariables = useSetAtom(changeVariablesAtom);

	const onTitleChange = (idx: number, value: string) => {
		dispatch({
			type: "rename",
			payload: {
				id: state.groups[idx].id,
				name: value,
			},
		});
	};

	const addNewTab = () => {
		setTimeout(() => {
			if (titlesList.current) titlesList.current.scrollLeft = titlesList.current.scrollWidth;
		}, 10);

		const tabNumber = state.groups.length + 1;
		const newTab: StylesheetGroup = {
			id: ulid(),
			name: `Stylesheet ${tabNumber}`,
			css: "/* Add your custom CSS here */\n",
			isActive: true,
		};

		dispatch({
			type: "create",
			payload: newTab,
		});

		// Switch to the new tab
		setActiveTabIndex(state.groups.length);
	};

	const changeActiveTab = (index: number) => setActiveTabIndex(index);

	const onMenuOpen = (value: boolean, id: string, idx: number) => {
		const { x, y } = (event as MouseEvent) || { x: 0, y: 0 };
		clickedTitle.current = id;
		clickedTitleIndex.current = idx;
		setMenuPosition({ x, y });
		setTimeout(() => setOpenedMenu(value), 10);
	};

	const onMenuItemClick = (action: ActionNames) => {
		const index = activeTabIndex;
		switch (action) {
			case "delete": {
				if (state.groups.length > 1) {
					dispatch({
						type: "delete",
						payload: { id: clickedTitle.current },
					});
					// Adjust active tab if needed
					if (clickedTitleIndex.current !== null && clickedTitleIndex.current <= activeTabIndex) {
						setActiveTabIndex(Math.max(0, activeTabIndex - 1));
					}
				}
				break;
			}
			case "duplicate": {
				dispatch({
					type: "duplicate",
					payload: { id: clickedTitle.current },
				});
				// Switch to duplicated tab
				if (clickedTitleIndex.current !== null) {
					setActiveTabIndex(clickedTitleIndex.current + 1);
				}
				break;
			}
			case "rename": {
				if (typeof clickedTitleIndex.current !== "number") return;
				const input = document.querySelectorAll(".stylesheets-wrapper .autosize-input input")?.[
					clickedTitleIndex.current
				] as HTMLInputElement;
				setActiveTabIndex(clickedTitleIndex.current);
				if (input) {
					setTimeout(() => {
						input.focus();
						input.select();
					}, 100);
				}
				break;
			}
			default:
				break;
		}
	};

	const onDisable = () => dispatch({ type: "disable" });

	const handleStylesheetsStateChange = (value: StylesheetsData) => {
		if (value?.isDisabled) {
			changeGlobalCssVariables({
				variables: [],
				type: "STYLESHEETS",
			});
			return;
		}

		// Collect all CSS from active stylesheets (excluding those with errors)
		const cssStrings: string[] = [];
		for (const group of value.groups) {
			if (group.isActive && group.css && !group.hasErrors) {
				cssStrings.push(group.css);
			}
		}

		// For stylesheets, we pass raw CSS strings instead of variables
		changeGlobalCssVariables({
			variables: cssStrings,
			type: "STYLESHEETS",
		});
	};

	useEffect(() => {
		setStylesheetsFormData(state);
		// Note: stylesheets are handled as raw CSS in usePush, not as StylesGroups
	}, [state, setStylesheetsFormData]);

	useEffect(() => {
		if (!openedMenu) {
			clickedTitle.current = "";
			clickedTitleIndex.current = null;
		}
	}, [openedMenu]);

	useEffect(() => {
		handleStylesheetsStateChange(debouncedState);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [debouncedState]);

	if (state?.isDisabled) {
		return (
			<div className="subsection">
				<EmptyClassSection
					title="Stylesheets module is disabled"
					description="Click to enable"
					onClick={onDisable}
				/>
			</div>
		);
	}

	return (
		<div className="subsection stylesheets-wrapper">
			<div className="titles-wrapper">
				<div ref={titlesList} className="titles-list">
					{tabs.map(({ value, id, hasErrors }, index) => (
						<StylesheetsTabTitle
							key={id}
							value={value}
							isActive={activeTabIndex === index}
							hasErrors={hasErrors}
							onTitleChange={(value) => onTitleChange(index, value)}
							onTabChange={() => changeActiveTab(index)}
							onContextMenu={(value) => onMenuOpen(value, id, index)}
						/>
					))}

					<StylesheetsTabMenu
						opened={openedMenu}
						position={menuPosition}
						onClose={setOpenedMenu}
						onMenuAction={onMenuItemClick}
						excludedItems={state.groups.length === 1 ? [2] : []}
					/>
				</div>

				<Tooltip label="Create a new stylesheet">
					<button className="new-tab" onClick={addNewTab}>
						<Plus />
					</button>
				</Tooltip>
			</div>

			<div className="content-wrapper">
				{activeTab && (
					<StylesheetsTabContent
						key={activeTab.id}
						stylesheet={activeTab}
						updateStylesheet={(props) => {
							dispatch({
								type: "update",
								payload: props,
							});
						}}
					/>
				)}
			</div>
		</div>
	);
});
