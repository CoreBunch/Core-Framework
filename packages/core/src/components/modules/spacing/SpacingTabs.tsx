import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "assets/icons/Plus.icon";
import { useDebounce } from "hooks/useDebounce";
import { deepEqual } from "utils/deepEqual";
import { EmptyClassSection } from "components/ui/EmptyClassSection";
import { Tooltip } from "@mantine/core";
import { useSetAtom } from "jotai";
import { useAtom } from "jotai/index";
import { changeVariablesAtom, spacingDataAtom } from "state";
import { SpacingAdditionalSelectors } from "./components/SpacingAdditionalSelectors";
import { SpacingTabContent } from "./components/SpacingTabContent";
import { SpacingTabMenu } from "./components/SpacingTabMenu";
import { SpacingTabTitle } from "./components/SpacingTabTitle";
import { retrieveVariablesFromSpacingState } from "./functions/retrieveVariablesFromSpacingState";
import { getNewTab, getNewTabValues } from "./functions/tabs";
import { useSpacing } from "./hooks/useSpacing";
import { SpacingData } from "./types";

type ActionNames = "rename" | "duplicate" | "delete" | "reset";

export const SpacingTabs = memo(() => {
	const [spacingFormData, setSpacingFormData] = useAtom(spacingDataAtom);
	const { state, dispatch } = useSpacing(spacingFormData);

	const titlesList = useRef<HTMLDivElement>(null);

	const [activeTabIndex, setActiveTabIndex] = useState(0);
	const tabs = useMemo(() => state.groups.map(({ name, id }) => ({ value: name, id })), [state]);

	const clickedTitle = useRef("");
	const clickedTitleIndex = useRef<number | null>(null);
	const [openedMenu, setOpenedMenu] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

	const activeTab = useMemo(() => state.groups[activeTabIndex], [activeTabIndex, state]);

	const changeGlobalCssVariables = useSetAtom(changeVariablesAtom);

	// Sync local state changes back to global atom immediately
	useEffect(() => {
		// Skip initial mount and when state matches
		if (!deepEqual(state, spacingFormData)) {
			setSpacingFormData(state);
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [state]);

	// Debounce only the expensive CSS variable generation
	const debouncedSpaceState = useDebounce(state, 100);

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
			if (titlesList.current) titlesList.current.scrollLeft = titlesList.current.offsetWidth;
		}, 10);

		const { name, varName } = getNewTabValues(state.groups);
		dispatch({
			type: "create",
			payload: getNewTab(name, varName),
		});
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
				dispatch({
					type: "delete",
					payload: { id: clickedTitle.current },
				});
				setActiveTabIndex(0);
				break;
			}
			case "duplicate": {
				dispatch({
					type: "duplicate",
					payload: { id: clickedTitle.current },
				});
				break;
			}
			case "rename": {
				if (typeof clickedTitleIndex.current !== "number") return;
				const input = document.querySelectorAll(".autosize-input input")?.[
					clickedTitleIndex.current
				] as HTMLInputElement;
				setActiveTabIndex(clickedTitleIndex.current);
				input.focus();
				break;
			}
			case "reset": {
				dispatch({
					type: "reset",
					payload: { id: clickedTitle.current },
				});
				setActiveTabIndex(0);
				setTimeout(() => setActiveTabIndex(index), 0);
				break;
			}
			default:
				break;
		}
	};

	const onDisable = () => dispatch({ type: "disable" });

	const handleSpaceStateChange = (value: SpacingData) => {
		if (state?.isDisabled) {
			changeGlobalCssVariables({
				variables: [],
				type: "SPACING",
			});
			return;
		}

		const variables: string[] = [];
		for (const group of value.groups) {
			variables.push(...retrieveVariablesFromSpacingState(group));
		}

		changeGlobalCssVariables({
			variables,
			type: "SPACING",
		});
	};

	useEffect(() => {
		if (!openedMenu) {
			clickedTitle.current = "";
			clickedTitleIndex.current = null;
		}
	}, [openedMenu]);

	useEffect(() => {
		handleSpaceStateChange(debouncedSpaceState);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [debouncedSpaceState]);

	// Guard against pathological state { groups: [], isDisabled: false } that
	// can be produced by older migrations or by manual DB edits — rendering the
	// main UI with empty groups would pass `undefined` to SpacingTabContent
	// and crash on `space.id`. Treat empty groups the same as disabled so the
	// user can re-enable the module instead of facing a black screen.
	if (state?.isDisabled || !state.groups?.length)
		return (
			<div className="subsection">
				<EmptyClassSection
					title="Spacing module is disabled"
					description="Click to enable"
					onClick={onDisable}
				/>
			</div>
		);

	return (
		<div className="subsection spacing-wrapper">
			<div className="titles-wrapper">
				<div ref={titlesList} className="titles-list">
					{tabs.map(({ value, id }, index) => (
						<SpacingTabTitle
							key={index}
							value={value}
							isActive={activeTabIndex === index}
							onTitleChange={(value) => onTitleChange(index, value)}
							onTabChange={() => changeActiveTab(index)}
							onContextMenu={(value) => onMenuOpen(value, id, index)}
						/>
					))}

					<SpacingTabMenu
						opened={openedMenu}
						position={menuPosition}
						onClose={setOpenedMenu}
						onMenuAction={onMenuItemClick}
						excludedItems={clickedTitleIndex.current === 0 ? [3] : []}
					/>
				</div>

				<Tooltip label="Create a new scale">
					<button className="new-tab" onClick={addNewTab}>
						<Plus />
					</button>
				</Tooltip>
			</div>

			<div className="content-wrapper">
				<SpacingTabContent
					key={activeTabIndex}
					space={activeTab}
					updateSpace={(props) => {
						dispatch({
							type: "update",
							payload: props,
						});
					}}
				/>
			</div>

			{!!spacingFormData.groups.length && <SpacingAdditionalSelectors />}
		</div>
	);
});
