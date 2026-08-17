import { memo, useCallback, useMemo, useState } from "react";
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	UniqueIdentifier,
	closestCorners,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { fetchRemotePresetJson, parseRemotePresetId } from "functions/fetchRemotePreset";
import { preparePresetToLoad } from "functions/preparePresetToLoad";
import { sanitizePreset } from "functions/sanitizePreset";
import { validatePreset } from "functions/validatePreset";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { ulid } from "ulid";
import { convertSafeCssName, downloadFile, encodeCompressedString } from "utils";
import { Info } from "assets/icons/Info.icon";
import { Dropzone } from "components/basic/Dropzone";
import { Loader } from "components/basic/Loader";
import { ColorGroup, ColorItem } from "components/modules/colorSystem";
import { Component } from "components/modules/components";
import { Tooltip } from "components/ui/Tooltip";
import { useCurrentPreset } from "hooks/useCurrentPreset";
import { useImportExternalPreset } from "hooks/useImportExternalPreset";
import { DEFAULT_PRESET, clearPresetData } from "data/presets";
import { CORE_FILE_FORMAT } from "constants/coreFileName";
import { IS_DEV } from "constants/isDev";
import { presetPreferencesSelector } from "state";
import { Container } from "./Container";
import { Skeleton } from "./Skeleton";
import { Item } from "./SortableItem";

const addLabel = (arg: string | HTMLElement) => {
	if (typeof arg === "string") {
		const el = document.getElementById(arg);
		el?.classList.add("has-label");
		return;
	}

	arg.classList.add("has-label");
};

export interface HandleExternalGroupImportProps {
	readonly group: Group;
	readonly categoryId: StylesheetDataKeys;
}

export const PresetManger = memo(() => {
	const { currentPreset, setCurrentPreset, saveChanges, getCurrentPreset, recoverBackup } =
		useCurrentPreset();

	const { externalPreset, setExternalPreset, onExternalPresetDrop } = useImportExternalPreset();

	const [singleColorImport, setSingleColorImport] = useState<{
		color: ColorItem | null;
	}>({
		color: null,
	});

	const [isExternalPresetLoading, setIsExternalPresetLoading] = useState(false);

	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const [isRemoveConfirmationOpen, setIsRemoveConfirmationOpen] = useState(false);

	const styleSheetData = useMemo(() => {
		const empty: StylesheetData = {
			colorStyles: [],
			typographyStyles: [],
			spacingStyles: [],
			layoutsStyles: [],
			designStyles: [],
			componentsStyles: [],
			otherStyles: [],
			fontsStyles: [],
		};

		return currentPreset?.styleSheetData ?? empty;
	}, [currentPreset]);

	const [activeId, setActiveId] = useState<{
		id: string;
		title: string;
	} | null>(null);

	const sensors = useSensors(
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 15,
			},
		}),
	);

	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

	function findContainer(id: string | UniqueIdentifier) {
		if (id in styleSheetData) {
			return id;
		}

		return Object.keys(styleSheetData).find((key) =>
			styleSheetData?.[key as StylesheetDataKeys]?.find((item) => item.id === id),
		);
	}

	function handleDragStart(event: DragStartEvent) {
		const { active } = event;
		const { id } = active;

		const activeContainer = findContainer(id);

		if (!activeContainer) {
			return;
		}

		const name = styleSheetData?.[activeContainer as StylesheetDataKeys]?.find(
			(item) => item.id === id,
		)?.name;

		setActiveId({
			id: id as string,
			title: name ?? "",
		});
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;
		const { id } = active;
		const overId = over?.id;

		// Find the containers
		const activeContainer = findContainer(id);
		const overContainer = findContainer(overId ?? "");

		if (!activeContainer || !overContainer || !overId || activeContainer === overContainer) {
			return;
		}

		setCurrentPreset((prev) => {
			const stylesheetData = prev?.styleSheetData;

			if (!stylesheetData) {
				return prev;
			}

			const activeItems = stylesheetData?.[activeContainer as StylesheetDataKeys];
			const overItems = stylesheetData?.[overContainer as StylesheetDataKeys];

			if (!activeItems || !overItems) {
				return prev;
			}

			// Find the indexes for the items
			const activeIndex = activeItems.findIndex((item) => item.id === id);
			const overIndex = overItems.findIndex((item) => item.id === overId);

			let newIndex: number;
			if (stylesheetData?.[overContainer as StylesheetDataKeys]?.length === 0) {
				// We're at the root droppable of a container
				newIndex = overItems.length + 1;
			} else {
				const modifier = 0;

				newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
			}

			const activeContainerItems =
				prev?.styleSheetData?.[activeContainer as StylesheetDataKeys]?.filter(
					(item) => item.id !== active.id,
				) ?? [];

			const overContainerItems = [
				...(prev?.styleSheetData?.[overContainer as StylesheetDataKeys]?.slice(0, newIndex) ?? []),
				prev?.styleSheetData?.[activeContainer as StylesheetDataKeys]?.[activeIndex] ?? [],
				...(prev?.styleSheetData?.[overContainer as StylesheetDataKeys]?.slice(
					newIndex,
					prev?.styleSheetData?.[overContainer as StylesheetDataKeys]?.length ?? 0,
				) ?? []),
			] as Groups;

			return {
				...prev,
				styleSheetData: {
					...prev?.styleSheetData,
					[activeContainer]: activeContainerItems,
					[overContainer]: overContainerItems,
				},
			};
		});
	}

	function handleDragEnd(event: DragEndEvent) {
		setHasUnsavedChanges(true);

		const { active, over } = event;
		const { id } = active;
		const overId = over?.id;
		const activeContainer = findContainer(id);
		const overContainer = findContainer(overId ?? "");

		if (!activeContainer || !overContainer || !overId) {
			return;
		}

		const activeIndex = styleSheetData[activeContainer as StylesheetDataKeys]?.findIndex(
			(item) => item.id === id,
		);

		const overIndex = styleSheetData[overContainer as StylesheetDataKeys]?.findIndex(
			(item) => item.id === overId,
		);

		if ([activeIndex, overIndex].includes(-1) || activeIndex === undefined || overIndex === undefined) {
			return;
		}

		setCurrentPreset((prev) => {
			if (!prev?.styleSheetData) {
				return prev;
			}

			if (typeof prev.styleSheetData?.[overContainer as StylesheetDataKeys] === "undefined") {
				return prev;
			}

			const prevOverContainer = prev.styleSheetData?.[overContainer as StylesheetDataKeys];

			if (!prevOverContainer) {
				return prev;
			}

			return {
				...prev,
				styleSheetData: {
					...prev.styleSheetData,
					[overContainer]: arrayMove(prevOverContainer, activeIndex, overIndex),
				},
			};
		});

		setActiveId(null);
	}

	function handleExternalGroupImport({ group, categoryId }: HandleExternalGroupImportProps) {
		const groupWithNewId = {
			...group,
			id: ulid().substring(5),
		};

		setHasUnsavedChanges(true);

		setCurrentPreset((prev) => {
			if (!prev?.styleSheetData) {
				return prev;
			}

			const prevCategory = prev.styleSheetData?.[categoryId];

			if (!prevCategory) {
				return prev;
			}

			return {
				...prev,
				styleSheetData: {
					...prev.styleSheetData,
					[categoryId]: [...prevCategory, groupWithNewId],
				},
			};
		});

		setTimeout(() => {
			const element = document.getElementById(`my-framework-${groupWithNewId.id}`);

			if (!element) {
				return;
			}

			addLabel(element);
			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 100);
	}

	function onGroupRemove({ categoryId, groupId }: { categoryId: StylesheetDataKeys; groupId: string }) {
		setCurrentPreset((prev) => {
			if (!prev?.styleSheetData) {
				return prev;
			}

			setHasUnsavedChanges(true);

			const prevCategory = prev.styleSheetData?.[categoryId];

			if (!prevCategory) {
				return prev;
			}

			return {
				...prev,
				styleSheetData: {
					...prev.styleSheetData,
					[categoryId]: prevCategory.filter((item) => item.id !== groupId),
				},
			};
		});
	}

	function onGroupDisable({ categoryId, groupId }: { categoryId: StylesheetDataKeys; groupId: string }) {
		setCurrentPreset((prev) => {
			if (!prev?.styleSheetData) return prev;

			setHasUnsavedChanges(true);

			const prevCategory = prev.styleSheetData?.[categoryId];
			if (!prevCategory) return prev;

			return {
				...prev,
				styleSheetData: {
					...prev.styleSheetData,
					[categoryId]: prevCategory.map((group) =>
						group.id === groupId ? { ...group, isDisabled: !group.isDisabled } : group,
					),
				},
			};
		});
	}

	async function onExternalImportSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const value = String(new FormData(e.currentTarget).get("url") ?? "");
		const id = parseRemotePresetId(value);

		if (!id) {
			toast.error("Paste a shareable project link or a project ID");
			return;
		}

		setIsExternalPresetLoading(true);

		try {
			const result = await fetchRemotePresetJson(id);

			if (!result.success) {
				toast.error(
					result.reason === "not-found"
						? "Project not found — make sure it is shared publicly"
						: "Could not reach the project, please try again",
				);
				return;
			}

			const preset = JSON.parse(result.json) as Preset;
			const parseReturn = validatePreset(preset);

			if (!parseReturn.success) {
				toast.error("Project is not valid");
				return;
			}

			setExternalPreset(
				preparePresetToLoad({
					preset,
					oldPreferences: await getPreferences(),
				}),
			);
		} catch (error) {
			toast.error("Something went wrong");
			console.warn(error);
		} finally {
			setIsExternalPresetLoading(false);
		}
	}

	const onProjectExport = useCallback(async () => {
		const newPreset = getCurrentPreset();

		if (!newPreset) {
			return;
		}

		const newEntry: Preset = {
			...sanitizePreset(newPreset),
			date: new Date().toISOString(),
			id: ulid(),
		};

		const base = encodeCompressedString(JSON.stringify(newEntry));
		const file = new Blob([base], {
			type: "text/plain",
		});

		downloadFile(file, `${convertSafeCssName(newEntry.name)}.${CORE_FILE_FORMAT}`);
	}, [getCurrentPreset]);

	const onProjectJsonExport = useCallback(async () => {
		const newPreset = getCurrentPreset();

		if (!newPreset) {
			return;
		}

		const newEntry: Preset = {
			...sanitizePreset(newPreset),
			date: new Date().toISOString(),
			id: ulid(),
		};

		const file = new Blob([JSON.stringify(newEntry)], {
			type: "text/plain",
		});

		downloadFile(file, `${convertSafeCssName(newEntry.name)}.json`);
	}, [getCurrentPreset]);

	const onColorGroupImport = useCallback(
		(colorGroup: ColorGroup) => {
			setHasUnsavedChanges(true);

			const newId = ulid().substring(5);

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) {
					return prev;
				}

				const prevColorSystem = prev.modulesData.COLOR_SYSTEM;

				if (!prevColorSystem) {
					return prev;
				}

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COLOR_SYSTEM: {
							...prevColorSystem,
							groups: [
								...prevColorSystem.groups,
								{
									...colorGroup,
									id: newId,
								},
							],
						},
					},
				};
			});

			setTimeout(() => {
				const element = document.getElementById(`my-framework-${newId}`);

				if (!element) {
					return;
				}

				addLabel(element);
				element.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 100);
		},
		[setCurrentPreset],
	);

	const onColorGroupRemove = useCallback(
		({ groupId }: { groupId: string }) => {
			setHasUnsavedChanges(true);

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) {
					return prev;
				}

				const prevColorSystem = prev.modulesData.COLOR_SYSTEM;

				if (!prevColorSystem) {
					return prev;
				}

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COLOR_SYSTEM: {
							...prevColorSystem,
							groups: prevColorSystem.groups.filter((group) => group.id !== groupId),
						},
					},
				};
			});
		},
		[setCurrentPreset],
	);

	const onColorGroupDisable = useCallback(
		({ groupId }: { groupId: string }) => {
			setHasUnsavedChanges(true);

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) return prev;

				const prevColorSystem = prev.modulesData.COLOR_SYSTEM;
				if (!prevColorSystem) return prev;

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COLOR_SYSTEM: {
							...prevColorSystem,
							groups: prevColorSystem.groups.map((group) =>
								group.id === groupId ? { ...group, isDisabled: !group.isDisabled } : group,
							),
						},
					},
				};
			});
		},
		[setCurrentPreset],
	);

	const onSingleColorImport = useCallback(
		({ groupId }: { groupId: string }) => {
			if (!(singleColorImport.color && groupId)) {
				setSingleColorImport({
					color: null,
				});
				return;
			}

			setHasUnsavedChanges(true);

			const newId = ulid().substring(5);
			const newColor = {
				...singleColorImport.color,
				id: newId,
			};

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) {
					return prev;
				}

				const prevColorSystem = prev.modulesData.COLOR_SYSTEM;

				if (!prevColorSystem) {
					return prev;
				}

				const prevGroups = prevColorSystem.groups;
				const targetGroup = prevGroups.find((group) => group.id === groupId);

				if (!targetGroup) {
					return prev;
				}

				const newColorInTargetGroup = [...targetGroup.colors, newColor];
				const newTargetGroup = {
					...targetGroup,
					colors: newColorInTargetGroup,
				};
				const newGroups = prevGroups.map((group) => (group.id === groupId ? newTargetGroup : group));

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COLOR_SYSTEM: {
							...prevColorSystem,
							groups: newGroups,
						},
					},
				};
			});

			setSingleColorImport({
				color: null,
			});
		},
		[setCurrentPreset, singleColorImport.color],
	);

	const onColorRemove = useCallback(
		({ groupId, colorId }: { groupId: string; colorId: string }) => {
			setHasUnsavedChanges(true);

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) {
					return prev;
				}

				const prevColorSystem = prev.modulesData.COLOR_SYSTEM;

				if (!prevColorSystem) {
					return prev;
				}

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COLOR_SYSTEM: {
							...prevColorSystem,
							groups: prevColorSystem.groups.map((group) => {
								if (group.id !== groupId) {
									return group;
								}

								return {
									...group,
									colors: group.colors.filter((color) => color.id !== colorId),
								};
							}),
						},
					},
				};
			});
		},
		[setCurrentPreset],
	);

	const onComponentImport = useCallback(
		({ component }: { component: Component }) => {
			setHasUnsavedChanges(true);

			const newId = ulid().substring(5);

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) {
					return prev;
				}

				const prevComponents = prev.modulesData.COMPONENTS;

				if (!prevComponents) {
					return prev;
				}

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COMPONENTS: {
							...prevComponents,
							components: [
								...prevComponents.components,
								{
									...component,
									id: newId,
								},
							],
						},
					},
				};
			});

			setTimeout(() => {
				const element = document.getElementById(`my-framework-${newId}`);

				if (!element) {
					return;
				}

				addLabel(element);
				element.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 100);
		},

		[setCurrentPreset],
	);

	const onComponentRemove = useCallback(
		({ id }: { id: string }) => {
			setHasUnsavedChanges(true);

			setCurrentPreset((prev) => {
				if (!prev?.modulesData) {
					return prev;
				}

				const prevComponents = prev.modulesData.COMPONENTS;

				if (!prevComponents) {
					return prev;
				}

				return {
					...prev,
					modulesData: {
						...prev.modulesData,
						COMPONENTS: {
							...prevComponents,
							components: prevComponents.components.filter((component) => component.id !== id),
						},
					},
				};
			});
		},
		[setCurrentPreset],
	);

	const onFluidTypographyReplace = useCallback(() => {
		setHasUnsavedChanges(true);

		const importedFluidTypographyData = externalPreset?.modulesData?.FLUID_TYPOGRAPHY;

		if (!importedFluidTypographyData) {
			return;
		}

		setCurrentPreset((prev) => {
			if (!prev?.modulesData || !importedFluidTypographyData) {
				return prev;
			}

			return {
				...prev,
				modulesData: {
					...prev.modulesData,
					FLUID_TYPOGRAPHY: importedFluidTypographyData,
				},
			};
		});

		setTimeout(() => {
			const element = document.getElementById(`my-framework-fluidTypography`);

			if (!element) {
				return;
			}

			addLabel(element);

			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 100);
	}, [externalPreset, setCurrentPreset]);

	const onFluidSpacingReplace = useCallback(() => {
		setHasUnsavedChanges(true);

		const importedFluidSpacingData = externalPreset?.modulesData?.FLUID_SPACING;

		if (!importedFluidSpacingData) {
			return;
		}

		setCurrentPreset((prev) => {
			if (!prev?.modulesData || !importedFluidSpacingData) {
				return prev;
			}

			return {
				...prev,
				modulesData: {
					...prev.modulesData,
					FLUID_SPACING: importedFluidSpacingData,
				},
			};
		});

		setTimeout(() => {
			const element = document.getElementById(`my-framework-fluidSpacing`);

			if (!element) {
				return;
			}

			addLabel(element);
			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 100);
	}, [externalPreset, setCurrentPreset]);

	const onOverwriteAll = useCallback(() => {
		if (!(externalPreset && currentPreset)) {
			return;
		}

		const prevId = currentPreset.id;
		const prevName = currentPreset.name;
		const preset = {
			...externalPreset,
			id: prevId,
			name: prevName,
		};

		setCurrentPreset(preset);
		saveChanges(preset);
		setExternalPreset(null);
		setHasUnsavedChanges(true);
		const event = new CustomEvent("addon-enabled", {
			detail: {
				addon: "oxygen",
			},
		});
		document.dispatchEvent(event);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [externalPreset, setCurrentPreset]);

	const onRemoveAll = useCallback(() => {
		setHasUnsavedChanges(true);

		const clearedPreset = clearPresetData(currentPreset ?? DEFAULT_PRESET);
		setCurrentPreset(clearedPreset);
	}, [currentPreset, setCurrentPreset]);

	return (
		<div className="grid columns-2 align-start gap-2xl">
			<div className="grid gap-xl">
				<div className="row gap-s">
					<h2>Manage Your Project</h2>
					<Tooltip
						label="Within this area, you can manage your currect project. You can drag and drop, preview or remove your groups. After you make any changes, press [Save changes] to apply. They will not be pushed until you save the project."
						width={300}
						multiline
						withArrow
					>
						<span className="help-tooltip">
							<Info />
						</span>
					</Tooltip>
				</div>

				<div className="bg-overlay-1 row gap-m padding-m radius">
					<button
						onClick={() => {
							recoverBackup();
							setHasUnsavedChanges(false);
						}}
						className={clsx("btn-s transition-global", {
							"btn-secondary": hasUnsavedChanges,
							"btn-secondary disabled opacity-50 pointer-events-none": !hasUnsavedChanges,
						})}
					>
						Cancel Changes
					</button>
					<button onClick={onProjectExport} className="btn-secondary btn-s">
						Export
					</button>
					{IS_DEV ? (
						<button onClick={onProjectJsonExport} className="btn-secondary btn-s">
							Export JSON (dev)
						</button>
					) : null}

					<button
						onClick={() => {
							if (isRemoveConfirmationOpen) {
								onRemoveAll();
								setIsRemoveConfirmationOpen(false);
								return;
							}

							setIsRemoveConfirmationOpen(true);
							setTimeout(() => setIsRemoveConfirmationOpen(false), 3000);
						}}
						className="btn-red btn-s"
					>
						{isRemoveConfirmationOpen ? "Confirm" : "Remove All"}
					</button>
				</div>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					{Object.entries(styleSheetData).map(([id, group]) => (
						<Container
							key={id}
							id={id}
							items={group}
							onGroupRemove={onGroupRemove}
							onGroupDisable={onGroupDisable}
							colorSystemData={id === "colorStyles" ? currentPreset?.modulesData?.COLOR_SYSTEM : undefined}
							components={
								id === "componentsStyles" ? currentPreset?.modulesData?.COMPONENTS?.components : undefined
							}
							fluidSpacingData={
								id === "spacingStyles" ? currentPreset?.modulesData?.FLUID_SPACING : undefined
							}
							fluidTypographyData={
								id === "typographyStyles" ? currentPreset?.modulesData?.FLUID_TYPOGRAPHY : undefined
							}
							singleColorImport={singleColorImport.color}
							onSingleColorImport={(groupId) => onSingleColorImport(groupId)}
							onColorGroupRemove={onColorGroupRemove}
							onColorGroupDisable={onColorGroupDisable}
							onColorRemove={onColorRemove}
							onComponentRemove={onComponentRemove}
						/>
					))}

					<DragOverlay>
						{activeId ? (
							<div
								style={{
									pointerEvents: "none",
									background: "#1b1e26",
									padding: 10,
									borderRadius: 5,
								}}
							>
								<Item id={activeId.id} title={activeId.title} />
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>

			<div className="grid gap-xl">
				<div className="row gap-s">
					<h2>Import</h2>
					<Tooltip
						label="Import entire frameworks or specific groups, colors or components. After you add anything to your project, press [Apply changes] to import."
						width={300}
						multiline
						withArrow
					>
						<span className="help-tooltip">
							<Info />
						</span>
					</Tooltip>
				</div>

				{externalPreset ? (
					<div className="bg-overlay-1 row gap-m padding-m radius">
						<button onClick={onOverwriteAll} className="btn-secondary btn-s">
							Overwrite All
						</button>
						{/* <button className="btn-secondary btn-s">Merge</button> */}
						<button onClick={() => setExternalPreset(null)} className="btn-red btn-s">
							Clear
						</button>
					</div>
				) : null}

				<Skeleton
					styleSheetData={externalPreset?.styleSheetData}
					colorSystemData={externalPreset?.modulesData?.COLOR_SYSTEM}
					components={externalPreset?.modulesData?.COMPONENTS?.components}
					handleExternalGroupImport={handleExternalGroupImport}
					onColorGroupImport={onColorGroupImport}
					onComponentImport={onComponentImport}
					onFluidTypographyReplace={onFluidTypographyReplace}
					onFluidSpacingReplace={onFluidSpacingReplace}
					setColorToImport={(color) =>
						setSingleColorImport((prev) => ({
							...prev,
							color,
						}))
					}
				/>

				<Dropzone onDrop={onExternalPresetDrop} accept={`.json,.${CORE_FILE_FORMAT}`} multiple={false} />

				<div className="grid padding-l radius align-center gap-m bg-overlay-1">
					<div className="grid gap-xs">
						<h4>Remote import from the link</h4>
						<p className="text-s">
							<span className="opacity-50">
								You can import a project remotely by pasting a shareable link or a project ID from the web
								app.
							</span>
						</p>
						<a
							style={{
								fontWeight: "600",
								fontSize: "var(--text-s)",
								color: "var(--color-main)",
							}}
							target="_blank"
							href="https://docs.coreframework.com/remote-import"
						>
							How it works?
						</a>
					</div>

					<form onSubmit={onExternalImportSubmit} className="row align-center gap-s full-width">
						<input
							type="text"
							name="url"
							placeholder="https://coreframework.com/app/..."
							className="full-width"
							style={{
								flex: 1,
							}}
						/>

						{isExternalPresetLoading ? (
							<Loader />
						) : (
							<button type="submit" className="btn-tertiary btn-l">
								Confirm
							</button>
						)}
					</form>
				</div>
			</div>
		</div>
	);
});
