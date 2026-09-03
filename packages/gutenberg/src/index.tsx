import React, { useEffect, useMemo, useRef, useState } from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, PanelRow, SearchControl, Spinner, TabPanel } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import { registerPlugin } from "@wordpress/plugins";
import { CheckboxItemGrid } from "./assets/icons/CheckboxItemGrid.icon";
import { ColorPalette } from "./assets/icons/ColorPalette.icon";
import { EditSquare } from "./assets/icons/EditSquare.icon";
import { Layouts } from "./assets/icons/Layouts.icon";
import { PenEditCircle } from "./assets/icons/PenEditCircle.icon";
import { Spacing } from "./assets/icons/Spacing.icon";
import { Typography } from "./assets/icons/Typography.icon";
import "./assets/styles/main.scss";
import { PreviewTheme } from "./preview-theme";

registerPlugin("core-framework-theme-preview", {
	render: PreviewTheme as any,
});

export function scrollToNestedElement(
	container: string | HTMLElement,
	element: string | HTMLElement,
	scrollWhenElementIsVisible = false,
	offset?: number,
) {
	const containerElement = typeof container === "string" ? document.querySelector(container) : container;
	const elementToScrollTo = typeof element === "string" ? document.querySelector(element) : element;

	if (!(containerElement && elementToScrollTo)) {
		return false;
	}

	if (
		scrollWhenElementIsVisible &&
		containerElement.scrollTop <= (elementToScrollTo as HTMLElement).offsetTop &&
		containerElement.scrollTop + containerElement.clientHeight >=
			(elementToScrollTo as HTMLElement).offsetTop + (elementToScrollTo as HTMLElement).clientHeight
	) {
		return false;
	}

	const offsetTop = (elementToScrollTo as HTMLElement).offsetTop;
	containerElement.scrollTop = offsetTop - (offset || 0);
	return true;
}

const stylesGroupsLabelMap: Record<string, string> = {
	colorStyles: "Colors",
	typographyStyles: "Typography",
	spacingStyles: "Spacing",
	layoutsStyles: "Layouts",
	designStyles: "Design",
	componentsStyles: "Components",
	otherStyles: "Other",
};

type StylesheetDataKeys = keyof typeof stylesGroupsLabelMap;

type GroupedClasses = Record<StylesheetDataKeys, Record<string, string[]>>;

enum GetClassesRequestState {
	Idle,
	Loading,
	Loaded,
	Failed,
}

declare global {
	interface Window {
		coreframework: {
			nonce: string;
			rest_url: string;
			core_api_url: string;
			classes?: GroupedClasses;
			get_classes_request_state?: GetClassesRequestState;
		};
		wpApiSettings: {
			nonce: string;
			root: string;
		};
		wp: {
			element: {
				useState: typeof useState;
				useEffect: typeof useEffect;
			};
			hooks: {
				addFilter: (name: string, hookName: string, callback: any) => void;
			};
		};
		core_framework_connector: {
			theme_mode: "light" | "dark" | "auto";
			plugin_name: string;
			gutenberg_enable_dark_mode_preview: boolean;
			gutenberg_place_controls_at_the_top: boolean;
			gutenberg_close_widget_default: boolean;
		};
	}
}

window.coreframework = {
	nonce: window.wpApiSettings.nonce,
	rest_url: window.wpApiSettings.root,
	core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
	get_classes_request_state: GetClassesRequestState.Idle,
};

const removeDuplicates = <T extends unknown>(arr: T[]): T[] => [...new Set(arr)];

const stylesGroupsIconsMap: Record<string, React.ComponentType<any>> = {
	colorStyles: ColorPalette,
	typographyStyles: Typography,
	spacingStyles: Spacing,
	layoutsStyles: Layouts,
	designStyles: PenEditCircle,
	componentsStyles: CheckboxItemGrid,
	otherStyles: EditSquare,
};

const GROUPS_WITH_COLOR_PREVIEW = ["Border Colors", "Backgrounds", "Text Colors"];
const colorSystemClasses = ["border-", "bg-", "text-"];

const getColorName = (className: string): string => {
	const isColorSystemClass = colorSystemClasses.some((v) => className.includes(v));

	if (!isColorSystemClass) {
		return "";
	}

	return className.replace("border-", "").replace("bg-", "").replace("text-", "");
};

const fetchClasses = async () => {
	const { get_classes_request_state } = window.coreframework;

	if (
		get_classes_request_state === GetClassesRequestState.Loading ||
		get_classes_request_state === GetClassesRequestState.Loaded
	) {
		return;
	}

	window.coreframework.get_classes_request_state = GetClassesRequestState.Loading;

	try {
		const res = await fetch(`${window.coreframework.core_api_url}get-classes`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": window.wpApiSettings.nonce,
			},
		});
		const json = await res.json();

		if (!("classes" in json)) {
			window.coreframework.get_classes_request_state = GetClassesRequestState.Failed;
			return;
		}

		const classes = json?.classes;

		window.coreframework.classes = classes;
		window.coreframework.get_classes_request_state = GetClassesRequestState.Loaded;

		return {
			data: {
				classes,
			},
			success: true,
		};
	} catch (e) {
		console.error(e);
	}
};
fetchClasses();

const getClasses = async () => {
	const { classes, get_classes_request_state } = window.coreframework;
	const responseEmpty = {
		data: null,
		success: false,
	};

	if (get_classes_request_state === GetClassesRequestState.Loaded) {
		return {
			data: { classes },
			success: true,
		};
	}

	return responseEmpty;
};

const placeClassesOnTop = window?.core_framework_connector?.gutenberg_place_controls_at_the_top ?? true;
const isClosedByDefault = window?.core_framework_connector?.gutenberg_close_widget_default ?? false;
const pluginName = window?.core_framework_connector?.plugin_name;

const withInspectorControls = createHigherOrderComponent((BlockEdit: React.ComponentType<any>) => {
	return (props) => {
		const [stylesheetGroups, setStylesheetGroups] = useState<GroupedClasses>({});

		const [searchValue, setSearchValue] = useState("");

		const [classNames, setClassNames] = useState<{
			active: string[];
			dynamic: string[];
		}>({
			active: [],
			dynamic: [],
		});

		const [selectedSearchResult, setSelectedSearchResult] = useState(-1);

		const isInitialMount = useRef(true);

		useEffect(() => {
			if (!props.attributes.className) {
				return;
			}

			const regExpToRemoveMultipleSpaces = /\s\s+/g;
			const parsedClassNames = props.attributes.className.replace(regExpToRemoveMultipleSpaces, " ").trim();
			const initialClassNames = parsedClassNames.split(" ");
			setClassNames((prev) => ({
				...prev,
				active: initialClassNames,
			}));
		}, []);

		useEffect(() => {
			if (isInitialMount.current) {
				isInitialMount.current = false;
				return;
			}

			props.setAttributes({
				className: [...classNames.active, ...classNames.dynamic].join(" "),
			});
		}, [classNames]);

		useEffect(() => {
			setSearchValue("");
		}, [props.isSelected]);

		const allClassNames = useMemo(
			() =>
				Object.values(stylesheetGroups)
					?.flatMap((v) => Object.values(v))
					?.flat(),
			[JSON.stringify(stylesheetGroups)],
		);

		const activeCoreClassNames = useMemo(() => {
			if (!allClassNames) return [];

			const classNamesWithRemovedMultipleSpaces = props.attributes.className?.replace(/\s\s+/g, " ");
			const activeClassNames = classNamesWithRemovedMultipleSpaces?.split(" ") || [];

			if (!activeClassNames?.length) {
				return [];
			}

			const activeCoreClassNames = allClassNames?.filter(
				(className) =>
					activeClassNames?.some((v: string) => v === className) &&
					!classNames.dynamic?.some((v: string) => v === className) &&
					className !== "",
			);

			return [...new Set(activeCoreClassNames)];
		}, [props.attributes.className, JSON.stringify(classNames), JSON.stringify(allClassNames)]);

		const searchResult = useMemo(() => {
			if (!searchValue || !allClassNames?.length) {
				setSelectedSearchResult(-1);
				return [];
			}

			return removeDuplicates(
				allClassNames?.filter((className) => className.toLowerCase().startsWith(searchValue.toLowerCase())),
			);
		}, [searchValue, JSON.stringify(allClassNames)]);

		const handleClassNamesLoad = async () => {
			const response = await getClasses();

			if (
				window.coreframework.get_classes_request_state === GetClassesRequestState.Loaded &&
				response?.data?.classes
			) {
				setStylesheetGroups(response.data?.classes);
			}
		};

		const toggleClassName = (className: string) => {
			if (!className) {
				return;
			}

			setClassNames((prev) => {
				const active = prev.active.includes(className)
					? prev.active.filter((v: string) => v !== className)
					: [...prev.active, className];

				props.setAttributes({
					className: [...active, ...classNames.dynamic].join(" "),
				});

				return {
					...prev,
					active,
					dynamic: [],
				}
			});
		};

		const handleClassMouseEnter = (className: string) => {
			if (!className) {
				return;
			}

			const isAlreadyAdded = props.attributes?.className?.split(" ").some((v: string) => v === className);

			if (isAlreadyAdded) {
				return;
			}

			setClassNames((prev) => ({
				...prev,
				dynamic: [className],
			}));
		};

		const handleClassMouseLeave = () =>
			setClassNames((prev) => ({
				...prev,
				dynamic: [],
			}));

		useEffect(() => {
			if (Object.keys(allClassNames).length === 0) {
				handleClassNamesLoad();
			}
		}, [window.coreframework?.classes]);

		const handleSearchControlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
				e.preventDefault();
			}

			setClassNames((prev) => ({
				...prev,
				dynamic: [],
			}));

			switch (e.key) {
				case "ArrowDown": {
					const max = searchResult.length - 1;
					setSelectedSearchResult((prev) => (prev < max ? prev + 1 : 0));
					handleClassMouseEnter(searchResult[selectedSearchResult + 1]);
					break;
				}
				case "ArrowUp": {
					setSelectedSearchResult((prev) => (prev === 0 ? 0 : prev - 1));
					handleClassMouseEnter(searchResult[selectedSearchResult - 1]);
					break;
				}
				case "Enter": {
					toggleClassName(searchResult[selectedSearchResult]);
					break;
				}
			}
		};

		return (
			<>
				{placeClassesOnTop ? null : <BlockEdit {...props} />}

				<InspectorControls>
					<PanelBody className={"coreframework-panel"} title={pluginName} initialOpen={!isClosedByDefault}>
						{window.coreframework.get_classes_request_state === GetClassesRequestState.Failed ? (
							<p className="components-base-control__error">
								Failed to fetch classes. Ensure the Gutenberg addon is enabled and changes are saved.
							</p>
						) : null}

						{activeCoreClassNames?.length ? <h3>Active {pluginName} classes</h3> : null}

						{activeCoreClassNames?.length ? (
							<div className="coreframework-active-classes">
								{activeCoreClassNames?.map((className) => (
									<button
										key={className}
										onClick={() => toggleClassName(className)}
										className="coreframework-class is-destructive"
									>
										{className}
									</button>
								))}
							</div>
						) : null}

						{activeCoreClassNames.length ? null : (
							<p className="components-base-control__help">
								There are no active {pluginName} classes on this block.
							</p>
						)}

						<hr />

						<SearchControl
							value={searchValue}
							onChange={setSearchValue}
							placeholder="Search for a class"
							onKeyDown={handleSearchControlKeyDown}
							onBlur={() => {
								setSelectedSearchResult(-1);
								handleClassMouseLeave();
							}}
							__nextHasNoMarginBottom={true}
						/>

						<PanelRow className="coreframework-utility-classes">
							<TabPanel
								tabs={Object.entries(stylesheetGroups).map(([groupName]) => ({
									name: groupName,
									title: stylesGroupsLabelMap?.[groupName] || groupName,
									icon: stylesGroupsIconsMap?.[groupName] || <CheckboxItemGrid />,
								}))}
								className={searchValue ? "disable" : ""}
							>
								{(tab) =>
									searchValue ? (
										<></>
									) : (
										<>
											{Object.entries(stylesheetGroups?.[tab.name]).map(([groupName, classNames]) => (
												<PanelBody title={groupName} initialOpen={false}>
													<PanelRow>
														{removeDuplicates(classNames).map((className) => (
															<button
																key={className}
																className={`coreframework-class ${
																	props.attributes.className?.split(" ").some((v: string) => v === className)
																		? "is-active"
																		: ""
																}`}
																onClick={() => toggleClassName(className)}
																onMouseEnter={() => handleClassMouseEnter(className)}
																onMouseLeave={handleClassMouseLeave}
															>
																{GROUPS_WITH_COLOR_PREVIEW.includes(groupName) && getColorName(className) && (
																	<span
																		className={`coreframework-color-preview`}
																		style={{
																			backgroundColor: `var(--${getColorName(className)})`,
																		}}
																	/>
																)}

																{className}
															</button>
														))}
													</PanelRow>
												</PanelBody>
											))}
										</>
									)
								}
							</TabPanel>

							{searchResult.length ? (
								<div className="coreframework-search-results">
									<h3>Search Results</h3>
									{searchResult.map((className, index) => (
										<button
											key={className}
											className={`coreframework-class ${
												props.attributes.className?.split(" ").some((v: string) => v === className)
													? "is-active"
													: ""
											} ${selectedSearchResult === index ? "is-selected" : ""}`}
											onClick={() => toggleClassName(className)}
											onMouseEnter={() => handleClassMouseEnter(className)}
											onMouseLeave={handleClassMouseLeave}
										>
											{className}
										</button>
									))}
								</div>
							) : null}

							{searchValue && !searchResult.length ? (
								<p className="components-base-control__help">No results found.</p>
							) : null}

							{!allClassNames?.length && !searchValue
								&& <p className="components-base-control__help">No Classes Found.</p>
							}
						</PanelRow>
					</PanelBody>
				</InspectorControls>

				{placeClassesOnTop ? <BlockEdit {...props} /> : null}
			</>
		);
	};
}, "withInspectorControl");

window.wp.hooks.addFilter("editor.BlockEdit", "my-plugin/with-inspector-controls", withInspectorControls);
