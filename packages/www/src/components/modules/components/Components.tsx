import { useCallback, useEffect, useMemo, useState } from "react";
import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Menu, Modal } from "@mantine/core";
import clsx from "clsx";
import { PartialExportTypes, createPartialExport, parsePartialImport } from "functions/partialImportExport";
import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { capitalize, copyToClipboard, readClipboard } from "utils";
import { Down } from "assets/icons/Down.icon";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { Hide } from "assets/icons/Hide.icon";
import { ImportExport } from "assets/icons/ImportExport.icon";
import { Keyboard } from "assets/icons/Keyboard.icon";
import { Moon } from "assets/icons/Moon.icon";
import { Plus } from "assets/icons/Plus.icon";
import { Remove } from "assets/icons/Remove.icon";
import { Sun } from "assets/icons/Sun.icon";
import { Up } from "assets/icons/Up.icon";
import { ClassSectionHeading } from "components/ClassSectionHeading";
import { EmptyClassSection } from "components/ui/EmptyClassSection";
import { ImportButton } from "components/ui/ImportButton";
import { Tooltip } from "components/ui/Tooltip";
import { useAutoCompleteLoad } from "hooks/useAutoCompleteLoad";
import { useEffectOnce } from "hooks/useEffectOnce";
import { cssGenerator } from "cssGenerator";
import { CssGeneratorOptions } from "cssGenerator/cssGenerator";
import {
	componentsDataAtom,
	presetPreferencesSelector,
	previewedThemeAtom,
	variablesStylesAtom,
} from "state";
import { ComponentsCard } from "@core-framework/core/components/modules/components/Components.card";
import { ComponentsEditor } from "./Components.editor";
import { COMPONENTS_TYPES } from "@core-framework/core/components/modules/components/data/constants";
import { COMPONENTS_INITIAL_STATE, DEFAULT_COMPONENT } from "@core-framework/core/components/modules/components/data/defaults";
import { getCss } from "@core-framework/core/components/modules/components/functions/getCss";
import { Component, ComponentsType } from "@core-framework/core/components/modules/components/types";

const cssGeneratorOptions: Partial<CssGeneratorOptions> = {
	format: true,
	combineSelectors: true,
	propertyValidation: false,
	valueValidation: false,
	manualDarkMode: true,
};

export function Components() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

	const [variablesCss, setVariablesCss] = useState<string>("");
	const [editorCss, setEditorCss] = useState<string[]>([]);

	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
	const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);

	const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

	const isInitialLoadDarkMode = useMemo(
		() => (getPreferences().theme_mode === "auto" ? true : getPreferences().theme_mode === "dark"),
		[getPreferences],
	);

	const [isPreviewDarkMode, setIsPreviewDarkMode] = useAtom(previewedThemeAtom);

	const [componentsData, setComponentsData] = useAtom(componentsDataAtom);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const getVariablesObject = useAtomCallback(useCallback((get) => get(variablesStylesAtom), []));

	const { getCssVarsObjects } = useAutoCompleteLoad();

	const closeModal = () => setIsModalOpen(false);

	const onEditorUnmount = (component: Component) => {
		setComponentsData((prev) => {
			const targetIndex = prev.components.findIndex((c) => c.id === component.id);

			if (targetIndex === -1) {
				return prev;
			}

			const newComponents = [...prev.components];
			newComponents[targetIndex] = component;

			return {
				...prev,
				components: newComponents,
			};
		});
	};

	const handleOpenEditor = (id: string) => {
		const targetComponent = componentsData.components.find((c) => c.id === id);

		if (!targetComponent) {
			return;
		}

		setSelectedComponent(targetComponent);
		setIsModalOpen(true);
	};

	const addNewComponent = async (type: ComponentsType) => {
		await new Promise((r) => setTimeout(r, 100));

		const prevId = componentsData.components.reduce(
			(largest, component) => Math.max(largest, parseInt(component.id)),
			0,
		);
		const id = String(prevId + 1);
		const newComponent: Component = {
			...DEFAULT_COMPONENT,
			id,
			type,
			selector: `.${type}-${id}`,
		};

		setComponentsData((prev) => ({
			...prev,
			components: [...prev.components, newComponent],
		}));
		setSelectedComponent(newComponent);
		setIsModalOpen(true);
	};

	const handleRemoveComponent = (id: string) => {
		setIsDeleteConfirmationOpen(false);
		setComponentsData((prev) => ({
			...prev,
			components: prev.components.filter((c) => c.id !== id),
		}));
	};

	useEffectOnce(async () => {
		const modulesVariables = getVariablesObject();
		const variablesFromGroups = getCssVarsObjects();
		const cssObjects = [...modulesVariables, ...variablesFromGroups];
		const css = await cssGenerator({
			cssObjects,
			options: cssGeneratorOptions,
		});

		setVariablesCss(css);
	});

	const componentsJson = JSON.stringify(componentsData.components);

	useEffect(() => {
		const fetchCss = async () => {
			const cssPromises = componentsData.components.map((c) => getCss(c));
			const cssArray = await Promise.all(cssPromises);
			setEditorCss(cssArray);
		};
		fetchCss();
		// biome-ignore lint/correctness/useExhaustiveDependencies: deep comparison via JSON key
	}, [componentsData.components.map]);

	const toggleDisable = () =>
		setComponentsData((prev) => ({
			...prev,
			isDisabled: !prev.isDisabled,
		}));

	const menuItems = useMemo(
		() => [
			{
				icon: <Hide />,
				label: componentsData?.isDisabled ? "Enable" : "Disable",
				onClick: async () => {
					await new Promise((r) => setTimeout(r, 50));
					toggleDisable();
				},
			},
			{
				icon: <Keyboard />,
				label: isResetConfirmationOpen ? "Are you sure?" : "Restore default styles",
				onClick: isResetConfirmationOpen
					? () => {
							setComponentsData(COMPONENTS_INITIAL_STATE);
							setIsResetConfirmationOpen(false);
					  }
					: () => setIsResetConfirmationOpen(true),
				closeMenuOnClick: isResetConfirmationOpen,
				style: isResetConfirmationOpen
					? {
							background: "#c2344e",
					  }
					: {},
			},
		],
		[
			isResetConfirmationOpen, componentsData?.isDisabled, setComponentsData, toggleDisable
		],
	);

	const duplicateComponent = (id: string) => {
		const targetComponent = componentsData.components.find((c) => c.id === id);

		if (!targetComponent) {
			return;
		}

		const largestId = componentsData.components.reduce(
			(largest, component) => Math.max(largest, parseInt(component.id)),
			0,
		);

		const newComponent: Component = {
			...targetComponent,
			id: String(largestId + 1),
		};

		setComponentsData((prev) => {
			const prevComponents = [...prev.components];

			const targetIndex = prevComponents.findIndex((c) => c.id === id);

			if (targetIndex === -1) {
				return prev;
			}

			const newComponents = [...prevComponents];
			newComponents.splice(targetIndex + 1, 0, newComponent);

			setEditorCss((prev) => {
				const newEditorCss = [...prev];
				newEditorCss.splice(targetIndex + 1, 0, newEditorCss[targetIndex]);

				return newEditorCss;
			});

			return {
				...prev,
				components: newComponents,
			};
		});
	};

	const moveComponent = (id: string, direction: "up" | "down") => {
		const targetComponent = componentsData.components.find((c) => c.id === id);

		if (!targetComponent) {
			return;
		}

		setComponentsData((prev) => {
			const prevComponents = [...prev.components];
			const targetIndex = prevComponents.findIndex((c) => c.id === id);
			const newComponents = [...prevComponents];

			if (targetIndex === -1) {
				return prev;
			}

			if (direction === "up") {
				if (targetIndex === 0) {
					return prev;
				}

				newComponents.splice(targetIndex - 1, 0, newComponents.splice(targetIndex, 1)[0]);
			}

			if (direction === "down") {
				if (targetIndex === newComponents.length - 1) {
					return prev;
				}

				newComponents.splice(targetIndex + 1, 0, newComponents.splice(targetIndex, 1)[0]);
			}

			return {
				...prev,
				components: newComponents,
			};
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!active || !over) {
			return;
		}

		const oldIndex = componentsData.components.findIndex((c) => c.id === active.id);
		const newIndex = componentsData.components.findIndex((c) => c.id === over.id);

		if (oldIndex === newIndex || oldIndex === -1 || newIndex === -1) {
			return;
		}

		setEditorCss((prev) => {
			const newEditorCss = [...prev];
			newEditorCss.splice(newIndex, 0, newEditorCss.splice(oldIndex, 1)[0]);

			return newEditorCss;
		});

		setComponentsData((prev) => {
			const newComponents = [...prev.components];
			newComponents.splice(newIndex, 0, newComponents.splice(oldIndex, 1)[0]);

			return {
				...prev,
				components: newComponents,
			};
		});
	};

	const handleComponentExport = async (component: Component) => {
		const componentExport = await createPartialExport({
			type: "component" as PartialExportTypes,
			data: component,
		});

		if (!componentExport) {
			toast.error("Something went wrong. Failed to export component.");
			return;
		}

		copyToClipboard(componentExport.string);
		toast.success("Component exported.");
	};

	const handleImportSubmit = async () => {
		try {
			const compressedString = (await readClipboard()).trim();

			if (!compressedString?.length) {
				toast.message("Clipboard is empty.");
				return;
			}

			const newGroup = await parsePartialImport({
				compressedString,
			});

			if (!newGroup) {
				toast.error("Clipboard does not contain component export.");
				return;
			}

			if (String(newGroup.type) !== "component") {
				toast.error("Something went wrong. Failed to paste component.");
				return;
			}

			const newComponent = newGroup.data as Component;

			const largestId = componentsData.components.reduce(
				(largest, component) => Math.max(largest, parseInt(component.id)),
				0,
			);

			const id = String(largestId + 1);
			const component: Component = {
				...newComponent,
				id,
			};

			setComponentsData((prev) => ({
				...prev,
				components: [...prev.components, component],
			}));

			toast.success("Component imported.");
		} catch (error) {
			toast.error("Something went wrong. Failed to paste component.");
		}
	};

	const handleThemeToggle = useCallback(() => {
		setIsPreviewDarkMode((prev) => !prev);
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [setIsPreviewDarkMode]);

	useEffectOnce(() => {
		setIsPreviewDarkMode(isInitialLoadDarkMode);
	}, [isInitialLoadDarkMode]);

	useEffect(() => {
		setTimeout(() => {
			const iframeContainers = document.getElementsByClassName("iframe-container");

			for (const iframeContainer of iframeContainers) {
				const iframe = iframeContainer.getElementsByTagName("iframe")?.[0];
				const html = iframe.contentDocument?.getElementsByTagName("html")?.[0];

				if (isPreviewDarkMode) html?.classList?.add("cf-theme-dark");
				else html?.classList?.remove("cf-theme-dark");
			}
		}, 50);
	}, [isPreviewDarkMode]);

	if (!variablesCss) {
		return null;
	}

	return (
		<div className="subsection">
			<ClassSectionHeading
				onTargetClick={() => setIsResetConfirmationOpen(false)}
				title="Components"
				menuItems={menuItems}
				rightItems={[
					<Tooltip key="theme-toggle" label={`Enable ${isPreviewDarkMode ? "light" : "dark"} mode`}>
						<button
							className={clsx("theme-toggle", isPreviewDarkMode ? "dark-mode" : "light-mode", "full-height")}
							onClick={handleThemeToggle}
						>
							<span className={isPreviewDarkMode ? "" : "active"}>
								<Sun />
							</span>
							<span className={isPreviewDarkMode ? "active" : ""}>
								<Moon />
							</span>
						</button>
					</Tooltip>,
				]}
			/>

			{componentsData?.isDisabled ? (
				<EmptyClassSection onClick={toggleDisable} title="Module is disabled" description="Click to enable" />
			) : (
				<>
					<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<div className="grid columns-2 gap-m">
							<SortableContext
								items={componentsData.components.map((c) => c.id)}
								strategy={rectSortingStrategy}
							>
								{componentsData.components.map((component, index) => (
									<ComponentsCard
										variablesCss={variablesCss}
										editorCss={editorCss[index]}
										key={component.id}
										onClick={() => handleOpenEditor(component.id)}
										component={component}
										onMenuClick={() => setIsDeleteConfirmationOpen(false)}
										menuItems={[
											{
												onClick: () => duplicateComponent(component.id),
												label: "Duplicate",
												icon: <Duplicate />,
											},
											{
												onClick: () => moveComponent(component.id, "up"),
												label: "Move up",
												icon: <Up />,
											},
											{
												onClick: () => moveComponent(component.id, "down"),
												label: "Move down",
												icon: <Down />,
											},
											{
												onClick: () => handleComponentExport(component),
												label: "Copy",
												icon: <ImportExport />,
											},
											{
												onClick: isDeleteConfirmationOpen
													? () => handleRemoveComponent(component.id)
													: () => setIsDeleteConfirmationOpen(true),
												label: isDeleteConfirmationOpen ? "Are you sure?" : "Remove",
												style: isDeleteConfirmationOpen
													? {
															background: "#c2344e",
													  }
													: {},
												closeMenuOnClick: isDeleteConfirmationOpen,
												icon: <Remove />,
											},
										]}
										isDarkBackground={isPreviewDarkMode}
									/>
								))}
							</SortableContext>
						</div>
					</DndContext>

					<div className="row gap-m">
						<Menu shadow="md" width={100}>
							<Menu.Target>
								<button className="new-group with-icon">
									<Plus />
								</button>
							</Menu.Target>

							<Menu.Dropdown>
								{COMPONENTS_TYPES.map((type) => (
									<Menu.Item key={type} onClick={() => addNewComponent(type)}>
										{capitalize(type)}
									</Menu.Item>
								))}
							</Menu.Dropdown>
						</Menu>

						<Tooltip label="To import single component, paste exported component here">
							<ImportButton onclick={handleImportSubmit} />
						</Tooltip>
					</div>

					<Modal
						onClose={closeModal}
						withCloseButton={false}
						withinPortal={true}
						closeOnClickOutside={false}
						target={(document.getElementById("modalRoot") ?? document.body) as HTMLElement}
						opened={isModalOpen}
						transitionProps={{
							transition: "fade",
							duration: 100,
						}}
						padding={0}
						size="min(max(100vw - 3rem, 300px), 75rem)"
						centered
					>
						{selectedComponent ? (
							<ComponentsEditor
								onUnMount={onEditorUnmount}
								component={selectedComponent}
								closeModal={closeModal}
								onRemove={handleRemoveComponent}
								variablesCss={variablesCss}
							/>
						) : null}
					</Modal>
				</>
			)}
		</div>
	);
}
