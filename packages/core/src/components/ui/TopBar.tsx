import { memo, useMemo, useState } from "react";
import { Maximize } from "assets/icons/Maximize.icon";
import { Minimize } from "assets/icons/Minimize.icon";
import { Search } from "assets/icons/Search.icon";
import { Popover, Select } from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { isFigma } from "../../functions/isFigma";
import { useAtom } from "jotai";
import { Breakpoints } from "assets/icons/Breakpoints.icon";
import { Create } from "assets/icons/Create.icon";
import { Edit } from "assets/icons/Edit.icon";
import { Range } from "assets/icons/Range.icon";
import { Remove } from "assets/icons/Remove.icon";
import { NumberInput } from "components/basic/NumberInput";
import { useStylesEdit } from "hooks/useStylesEdit";
import { generateMediaQueryOption } from "cssGenerator/generator/mediaQuery";
import { isFullScreenModeAtom } from "state/fullscreenAtoms";
import { searchAtom } from "state/searchAtom";
import { breakpointsAtom, selectedBreakpointAtom } from "state";
import { Tooltip } from "./Tooltip";

const convertMediaQueryToObjectWithLabel = (value: [number, number]) => ({
	label: generateMediaQueryOption(value),
	value: JSON.stringify(value),
});

const INFINITY_SYMBOL = "∞" as const;

const ALL_BREAKPOINTS = {
	label: "All breakpoints",
	value: JSON.stringify([null, null]),
} as const;

const DEFAULT_BREAKPOINT: [number, number] = [0, 768];

const MAX_BREAKPOINT = 9999;

export const TopBar = memo(() => {
	const [newBreakpointValues, setNewBreakpointValues] = useState<[number, number]>(DEFAULT_BREAKPOINT);
	const [editedBreakpoint, setEditedBreakpoint] = useState<[number, number]>(DEFAULT_BREAKPOINT);

	const [isFullScreenMode, setIsFullScreenMode] = useAtom(isFullScreenModeAtom);
	const [selectedBreakpoint, setSelectedBreakpoint] = useAtom(selectedBreakpointAtom);
	const [breakpoints, setBreakpoints] = useAtom(breakpointsAtom);
	const [isSearch, setIsSearch] = useAtom(searchAtom);

	const [isAddPopoverOpen, addPopoverHandler] = useDisclosure(false);
	const [isEditPopoverOpen, editPopoverHandler] = useDisclosure(false);
	const [isDeletePopoverOpen, deletePopoverHandler] = useDisclosure(false);

	useHotkeys([
		["Enter", () => (document.querySelector(".submit") as HTMLButtonElement | null)?.click()],
		[
			"Escape",
			() => [addPopoverHandler, editPopoverHandler, deletePopoverHandler].forEach(({ close }) => close()),
		],
	]);

	const isEditing = useMemo(() => selectedBreakpoint !== null, [selectedBreakpoint]);

	const BREAKPOINTS_SELECT = useMemo(
		() => [
			ALL_BREAKPOINTS,
			...breakpoints
				.sort((a, b) => a[0] - b[0])
				.sort((a, b) => b[1] - a[1])
				.map((value) => convertMediaQueryToObjectWithLabel(value)),
		],
		[breakpoints],
	);

	const { editMediaQuery, removeObjectsWithMediaQuery } = useStylesEdit();

	const exitBreakpointEditMode = () => setSelectedBreakpoint(null);

	const handleNewBreakpointForm = (value: number, index: number) => {
		setNewBreakpointValues((prev) => {
			const newValues = [...prev];
			newValues[index] = value;
			return newValues as [number, number];
		});
	};

	const handleSubmitNewBreakpoint = () => {
		addPopoverHandler.close();

		setBreakpoints((prev) => {
			const newBreakpoints = [...prev];

			const [newMin, newMax] = newBreakpointValues;
			const breakpointExists = newBreakpoints.some(([min, max]) => min === newMin && max === newMax);

			if (breakpointExists) {
				return newBreakpoints;
			}

			newBreakpoints.push(newBreakpointValues);
			return newBreakpoints;
		});

		setSelectedBreakpoint(newBreakpointValues);

		setTimeout(() => DEFAULT_BREAKPOINT.map((value, index) => handleNewBreakpointForm(value, index)), 151);
	};

	const handleBreakpointEditForm = (value: number, index: number) => {
		setEditedBreakpoint((prev) => {
			const newValues = [...prev];
			newValues[index] = value;
			return newValues as [number, number];
		});
	};

	const handleSubmitBreakpointEdit = () => {
		editPopoverHandler.close();

		if (!selectedBreakpoint) {
			return;
		}

		const [prevMin, prevMax] = selectedBreakpoint;
		const [newMin, newMax] = editedBreakpoint;

		setBreakpoints((prev) => {
			const newBreakpoints = [...prev];
			const breakpointExists = newBreakpoints.some(([min, max]) => min === newMin && max === newMax);

			if (breakpointExists) {
				return newBreakpoints;
			}

			const breakpointIndex = newBreakpoints.findIndex(([min, max]) => min === prevMin && max === prevMax);

			if (breakpointIndex === -1) {
				return newBreakpoints;
			}

			newBreakpoints[breakpointIndex] = editedBreakpoint;
			return newBreakpoints;
		});

		editMediaQuery(selectedBreakpoint, editedBreakpoint);
		setSelectedBreakpoint(editedBreakpoint);
	};

	const handleBreakpointSelect = (value: string) => {
		const [min, max] = JSON.parse(value) as [number | null, number | null];

		if (min === null || max === null) {
			setSelectedBreakpoint(null);
			return;
		}

		setSelectedBreakpoint([min, max] as [number, number]);
	};

	const handleDeleteBreakpoint = () => {
		deletePopoverHandler.close();

		if (!selectedBreakpoint) {
			return;
		}

		setSelectedBreakpoint(null);
		setBreakpoints((prev) => prev.filter((mq) => String(mq) !== String(selectedBreakpoint)));
		removeObjectsWithMediaQuery(selectedBreakpoint);
	};

	const handleEditPopoverChange = (value: boolean) => {
		if (value) {
			setEditedBreakpoint(selectedBreakpoint ?? DEFAULT_BREAKPOINT);
		}
	};

	const handleEditToggle = () => {
		editPopoverHandler.toggle();

		const restored = selectedBreakpoint ?? DEFAULT_BREAKPOINT;

		handleBreakpointEditForm(restored[0], 0);
		handleBreakpointEditForm(restored[1], 1);
	};

	const toggleFullscreen = () => setIsFullScreenMode(!isFullScreenMode);

	return (
		<header className="top-bar">
			<div className="top-bar-left">
				<Select
					placeholder="All breakpoints"
					data={BREAKPOINTS_SELECT}
					onChange={handleBreakpointSelect}
					value={JSON.stringify(selectedBreakpoint ?? [null, null])}
					className="breakpoint-select"
					icon={<Breakpoints />}
					transitionProps={{
						duration: 150,
						transition: "fade",
					}}
				/>

				<Popover
					opened={isAddPopoverOpen}
					onClose={() => addPopoverHandler.close()}
					width={250}
					position="bottom"
					withArrow
					shadow="md"
				>
					<Tooltip
						label={
							[isAddPopoverOpen, isEditPopoverOpen, isDeletePopoverOpen].some(Boolean)
								? ""
								: "Add new media query"
						}
					>
						<Popover.Target>
							<button
								onClick={addPopoverHandler.toggle}
								className="btn-secondary btn-box"
								style={{
									zIndex: 10,
								}}
							>
								<Create />
							</button>
						</Popover.Target>
					</Tooltip>

					<Popover.Dropdown>
						<div className="media-dropdown-content">
							<b>Create a new media query</b>
							<i>Set up the media query by using min, max or both widths.</i>

							<hr />

							<div className="inputs-wrapper">
								<div className="input-with-label">
									<label>Min width</label>
									<NumberInput
										value={newBreakpointValues?.[0] ?? 0}
										onChange={(value) => handleNewBreakpointForm(Number(value), 0)}
										max={MAX_BREAKPOINT}
										min={0}
										unit="px"
										allowMouseWheel
										onlyInteger
										hideControls
									/>
								</div>

								<Range />

								<div className="input-with-label">
									<label>Max width</label>
									<NumberInput
										value={
											(Number(newBreakpointValues?.[1]) ?? INFINITY_SYMBOL) === 0 ||
											newBreakpointValues?.[1] === null
												? INFINITY_SYMBOL
												: newBreakpointValues?.[1] ?? INFINITY_SYMBOL
										}
										onChange={(value) => handleNewBreakpointForm(Number(value), 1)}
										defaultOnEmpty={INFINITY_SYMBOL}
										max={MAX_BREAKPOINT}
										min={0}
										unit="px"
										allowMouseWheel
										onlyInteger
										hideControls
									/>
								</div>
							</div>
						</div>
						<button className="submit" onClick={handleSubmitNewBreakpoint}>
							Confirm
						</button>
					</Popover.Dropdown>
				</Popover>

				<Popover
					onChange={handleEditPopoverChange}
					opened={isEditPopoverOpen}
					onClose={editPopoverHandler.close}
					width={250}
					position="bottom"
					withArrow
					shadow="md"
				>
					{selectedBreakpoint ? (
						<Tooltip
							label={
								[isAddPopoverOpen, isEditPopoverOpen, isDeletePopoverOpen].some(Boolean)
									? ""
									: "Edit current media query"
							}
						>
							<Popover.Target>
								<button
									onClick={handleEditToggle}
									className="btn-secondary btn-box disabled z-index-10"
									style={{
										zIndex: 10,
									}}
								>
									<Edit />
								</button>
							</Popover.Target>
						</Tooltip>
					) : null}

					<Popover.Dropdown
						sx={(theme) => ({
							background: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
						})}
					>
						<div className="media-dropdown-content">
							<b>Edit current media query</b>

							<hr />

							<div className="inputs-wrapper">
								<div className="input-with-label">
									<label>Min width</label>
									<NumberInput
										value={editedBreakpoint?.[0] ?? 0}
										onChange={(value) => handleBreakpointEditForm(Number(value), 0)}
										unit="px"
										max={MAX_BREAKPOINT}
										min={0}
										allowMouseWheel
										onlyInteger
										hideControls
									/>
								</div>

								<Range />

								<div className="input-with-label">
									<label>Max width</label>
									<NumberInput
										value={
											(Number(editedBreakpoint?.[1]) ?? INFINITY_SYMBOL) === 0 ||
											editedBreakpoint?.[1] === null
												? INFINITY_SYMBOL
												: editedBreakpoint?.[1] ?? INFINITY_SYMBOL
										}
										onChange={(value) => handleBreakpointEditForm(Number(value), 1)}
										defaultOnEmpty={INFINITY_SYMBOL}
										unit="px"
										max={MAX_BREAKPOINT}
										min={0}
										allowMouseWheel
										onlyInteger
										hideControls
									/>
								</div>
							</div>
						</div>

						<button className="submit" onClick={handleSubmitBreakpointEdit}>
							Apply
						</button>
					</Popover.Dropdown>
				</Popover>

				{selectedBreakpoint ? (
					<Popover
						opened={isDeletePopoverOpen}
						onClose={deletePopoverHandler.close}
						width={250}
						position="bottom"
						shadow="md"
						withArrow
					>
						<Tooltip
							label={
								[isAddPopoverOpen, isEditPopoverOpen, isDeletePopoverOpen].some(Boolean)
									? ""
									: "Delete current media query"
							}
						>
							<Popover.Target>
								<button
									onClick={deletePopoverHandler.toggle}
									style={{
										zIndex: 10,
									}}
									className="btn-red-2 btn-box"
								>
									<Remove />
								</button>
							</Popover.Target>
						</Tooltip>

						<Popover.Dropdown
							sx={(theme) => ({
								background: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
							})}
						>
							<div className="media-dropdown-content">
								<b>Are you sure?</b>
								<i>Careful! This will remove all CSS applied to this media query.</i>
							</div>

							<button className="submit remove" onClick={handleDeleteBreakpoint}>
								DELETE
							</button>
						</Popover.Dropdown>
					</Popover>
				) : null}
			</div>

			<div className="top-bar-right">
				<Tooltip label={`Search (Ctrl/⌘ + K)`}>
					<button onClick={() => setIsSearch(true)} className="btn-secondary btn-box">
						<Search />
					</button>
				</Tooltip>

				{isFigma() ? null : (
					<Tooltip label={isFullScreenMode ? "Minimize" : "Maximize"}>
						<button onClick={toggleFullscreen} className="btn-secondary btn-box">
							{isFullScreenMode ? <Minimize /> : <Maximize />}
						</button>
					</Tooltip>
				)}

				{isEditing && (
					<button onClick={exitBreakpointEditMode} className="btn-secondary btn-s">
						Finish editing
					</button>
				)}
			</div>
		</header>
	);
});

TopBar.displayName = "TopBar";
