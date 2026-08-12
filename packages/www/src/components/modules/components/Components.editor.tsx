import { memo, useCallback, useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Menu, Select } from "@mantine/core";
import { clsx } from "clsx";
import { focusNextDeclaration } from "functions/focusNextDeclaration";
import { parseCSS } from "functions/parseCss";
import { PartialExportTypes, createPartialExport, parsePartialImport } from "functions/partialImportExport";
import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { toast } from "sonner";
import { ulid } from "ulid";
import { copyToClipboard, getEmptyDeclaration, readClipboard } from "utils";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { ColorPalette } from "assets/icons/ColorPalette.icon";
import { Cross } from "assets/icons/Cross.icon";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { EditPen } from "assets/icons/EditPen.icon";
import { Info } from "assets/icons/Info.icon";
import { Moon } from "assets/icons/Moon.icon";
import { Plus } from "assets/icons/Plus.icon";
import { Remove } from "assets/icons/Remove.icon";
import { SixDots } from "assets/icons/SixDots.icon";
import { Sun } from "assets/icons/Sun.icon";
import { ThreeDots } from "assets/icons/ThreeDots.icon";
import { DndItem } from "components/DndItem";
import { CssForm } from "components/cssForm";
import { Tooltip } from "components/ui/Tooltip";
import { useAsyncMemo } from "hooks/useAsyncMemo";
import { useEffectOnce } from "hooks/useEffectOnce";
import { presetPreferencesSelector, previewedThemeAtom } from "state";
import { ComponentsPreview } from "@core-framework/core/components/modules/components/Components.preview";
import {
	AVAILABLE_VARIANTS_WITHOUT_VARIANT,
	COMPONENTS_TYPES,
	CUSTOM_COMPONENTS_STATE,
	DEFAULT_COMPONENTS_STATE,
	PREVIEW_BACKGROUNDS,
	VARIANT_COMPONENTS_STATE,
} from "@core-framework/core/components/modules/components/data/constants";
import { DEFAULT_SELECTOR } from "@core-framework/core/components/modules/components/data/defaults";
import { getCss, getPseudoSelector } from "@core-framework/core/components/modules/components/functions/getCss";
import { Component, ComponentsType } from "@core-framework/core/components/modules/components/types";

export const getFirstSelector = (selector: string) => {
	if (!selector || selector === ".") {
		return "";
	}

	const arr = selector
		.trim()
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
		.filter((s) => s !== ".");

	return arr[0];
};

type ComponentVariantsGroup = {
	id: string;
	mainComponent: ComponentVariant;
	variants: ComponentVariant[];
};

interface GenerateGroupsOfVariantsProps {
	readonly variants: ComponentVariant[];
	readonly order?: string[];
}

const generateGroupsOfVariants = ({ variants, order }: GenerateGroupsOfVariantsProps) => {
	const groups: Record<string, ComponentVariant[]> = {};

	for (const variant of variants) {
		if (variant.parentId === undefined && variant.type === "custom") {
			const variantName = variant.id ?? "custom";

			if (!groups[variantName]) {
				groups[variantName] = [];
			}

			groups[variantName].push(variant);

			continue;
		}

		if (variant.id === "default" || variant.type === "variant") {
			const variantName = variant.id;

			if (!groups[variantName]) {
				groups[variantName] = [];
			}

			groups[variantName].push(variant);

			continue;
		}

		if (variant.parentId) {
			const variantName = variant.parentId;

			if (!groups[variantName]) {
				groups[variantName] = [];
			}

			groups[variantName].push(variant);

			continue;
		}

		if (variant.type === "custom") {
			const name = variant.variantSelector || "custom";

			if (!groups[name]) {
				groups[name] = [];
			}

			groups[name].push(variant);

			continue;
		}

		const parentId = variant.parentId ?? "default";

		if (!groups[parentId]) {
			groups[parentId] = [];
		}

		groups[parentId].push(variant);
	}

	const grouped = Object.entries(groups).map(([id, variants]) => {
		const mainComponent = variants.find(
			(variant) =>
				variant.type === DEFAULT_COMPONENTS_STATE || variant.type === "variant" || variant.type === "custom",
		)!;

		const variantsWithoutMain = variants.filter(
			(variant) =>
				variant.type !== DEFAULT_COMPONENTS_STATE && variant.type !== "variant" && variant.type !== "custom",
		);

		return {
			id,
			mainComponent,
			variants: variantsWithoutMain,
		};
	});

	order = order?.length ? order : grouped.map(({ mainComponent }) => mainComponent?.id ?? "");

	const defaultComponent = grouped.find(
		({ mainComponent }) => mainComponent.type === DEFAULT_COMPONENTS_STATE,
	)!.id;

	const defaultComponentIndex = order.indexOf(defaultComponent);

	if (defaultComponentIndex !== 0) {
		const newOrder = [...order];
		newOrder.splice(defaultComponentIndex, 1);
		newOrder.unshift(defaultComponent);

		order = newOrder;
	}

	const sorted = grouped.sort((a, b) => {
		const aIndex = order?.indexOf(a.mainComponent.id) ?? 0;
		const bIndex = order?.indexOf(b.mainComponent.id) ?? 0;

		return aIndex - bIndex;
	});

	return { sorted, order };
};

function setFirstValueToZero(str: string): string {
	if (!str) {
		return "";
	}

	const values = str.split(",");

	if (values.length < 3) {
		return str;
	}

	const firstValue = values[0].split("(")[1];

	if (!firstValue) {
		return str;
	}

	return str.replace(firstValue, "0px");
}

interface DndStateItemProps {
	readonly id: string;
	readonly preventDrag?: boolean;
	readonly children: (listeners: any) => React.ReactNode;
}

const DndStateItem = ({ id, preventDrag, children }: DndStateItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

	const style = {
		transform: setFirstValueToZero(
			CSS.Transform.toString(transform)?.split(")")[0] !== undefined
				? `${CSS.Transform.toString(transform)?.split(")")[0]})`
				: "",
		),
		transition,
	};

	const _listeners = preventDrag ? {} : listeners;

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			{children(_listeners)}
		</div>
	);
};

interface IGetStateLabel {
	readonly mainSelector: string;
	readonly variant: ComponentVariant | undefined;
	readonly parentVariant: ComponentVariant | undefined;
}

export const getSelectorString = ({ mainSelector, variant, parentVariant }: IGetStateLabel) => {
	const createSelector = (mainSelector2: string) => {
		if (!variant) {
			return mainSelector2;
		}

		if (variant?.type === "custom") {
			return variant?.variantSelector ?? "";
		}

		if (parentVariant?.type === "custom") {
			return `${parentVariant?.variantSelector ?? ""}${
				AVAILABLE_VARIANTS_WITHOUT_VARIANT.includes(variant?.type ?? "") ? `:${variant?.type}` : ""
			}`;
		}

		const hasParentVariantDifferentFromMain =
			parentVariant?.type !== DEFAULT_COMPONENTS_STATE && parentVariant;

		if (hasParentVariantDifferentFromMain) {
			return `${mainSelector2}${parentVariant?.variantSelector ?? ""}${
				AVAILABLE_VARIANTS_WITHOUT_VARIANT.includes(variant?.type ?? "") ? `:${variant?.type}` : ""
			}`;
		}

		if (variant?.type === "variant") {
			return `${mainSelector2}${variant?.variantSelector ?? ""}`;
		}

		return `${mainSelector2}${getPseudoSelector(variant?.type)}`;
	};

	const isSpliitedByComma = mainSelector.includes(",");

	if (!isSpliitedByComma) {
		return createSelector(mainSelector);
	}

	const selectors = mainSelector
		.trim()
		.split(",")
		.map((selector) => selector.trim())
		.filter(Boolean)
		.filter((selector) => selector !== ".");

	return selectors.map((selector) => createSelector(selector)).join(", ");
};

const getSelectorWithoutPseudo = ({ mainSelector, variant, parentVariant }: IGetStateLabel) => {
	if (variant?.type === "custom") {
		return variant?.variantSelector ?? "";
	}
	if (parentVariant?.type === "custom") {
		return `${parentVariant?.variantSelector ?? ""}`;
	}
	const hasParentVariantDifferentFromMain = parentVariant?.type !== DEFAULT_COMPONENTS_STATE && parentVariant;
	if (hasParentVariantDifferentFromMain) {
		return `${mainSelector}${parentVariant?.variantSelector ?? ""}`;
	}
	if (variant?.type === "variant") {
		return `${mainSelector}${variant?.variantSelector ?? ""}`;
	}

	return mainSelector;
};

interface IComponentsEditor {
	readonly closeModal: () => void;
	readonly onUnMount: (c: Component) => void;
	readonly onRemove: (id: string) => void;
	readonly component: Component;
	readonly variablesCss: string;
}

export const ComponentsEditor = memo(
	({ closeModal, onUnMount, component, variablesCss }: IComponentsEditor) => {
		const [variants, setVariants] = useState<ComponentVariant[]>(component.variants ?? []);

		const [order, setOrder] = useState<string[]>(component.order ?? []);

		const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null);

		const variantsGroupedByParents = useMemo((): ComponentVariantsGroup[] => {
			const { sorted, order: newOrder } = generateGroupsOfVariants({
				variants,
				order,
			});
			setOrder(newOrder);
			return sorted;
		}, [variants, order]);

		const selectedVariant = useMemo(
			() => variants.find((variant) => variant.id === selectedVariantId),
			[selectedVariantId, variants],
		);

		const mainVariant = useMemo(
			() => variants.find((variant) => variant.type === DEFAULT_COMPONENTS_STATE),
			[variants],
		);

		const parentVariant = useMemo(
			() => variants.find((variant) => variant.id === selectedVariant?.parentId),
			[selectedVariant, variants],
		);

		const [mainSelector, setMainSelector] = useState<string>(component.selector ?? DEFAULT_SELECTOR);

		const [previewType, setPreviewType] = useState<ComponentsType>(component.type ?? "input");
		const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

		const isInitialLoadDarkMode = useMemo(
			() => (getPreferences().theme_mode === "auto" ? true : getPreferences().theme_mode === "dark"),
			[getPreferences],
		);

		const [isPreviewDarkMode, setIsPreviewDarkMode] = useAtom(previewedThemeAtom);

		const [background, setBackground] = useState<string>(
			isPreviewDarkMode ? PREVIEW_BACKGROUNDS.at(-1)! : PREVIEW_BACKGROUNDS[1],
		);

		const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

		const [dynamicCss, setDynamicCss] = useState("");

		const sensors = useSensors(
			useSensor(PointerSensor, {
				activationConstraint: {
					distance: 15,
				},
			}),
		);

		const hasVariants = useMemo(
			() => variants.some((variant) => variant.type === VARIANT_COMPONENTS_STATE),
			[variants],
		);

		const editorCss = useAsyncMemo<string>(async () => {
			const newComponent = {
				...component,
				variants,
				order,
				selector: mainSelector,
				type: previewType,
			};
			return getCss(newComponent);
		}, [mainSelector, variants, parentVariant, selectedVariant, mainVariant]);

		const handleCloseAndSave = () => {
			const newComponent = {
				...component,
				variants,
				order,
				selector: mainSelector,
				type: previewType,
			};

			onUnMount(newComponent);
			closeModal();
		};

		const onDeclarationRemove = (id: string) => {
			const newSelectedVariants = selectedVariant?.declarations.filter(
				(declaration) => declaration.id !== id,
			);

			setVariants(
				variants.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: newSelectedVariants?.length ? newSelectedVariants : [getEmptyDeclaration()],
						};
					}

					return variant;
				}),
			);
		};

		function removeDeclarationOnBackSpace(id: string) {
			const focusedElement = document.activeElement as HTMLInputElement | null;

			if (!focusedElement) {
				return;
			}

			const isInput = focusedElement.tagName === "INPUT";

			if (!isInput && focusedElement?.value) {
				return;
			}

			const declarationRowAbove = focusedElement?.parentElement?.parentElement?.previousElementSibling;
			const valueInputOfDeclarationRowAbove = declarationRowAbove?.querySelector(
				".value-column input",
			) as HTMLInputElement | null;

			valueInputOfDeclarationRowAbove?.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
			});
			valueInputOfDeclarationRowAbove?.focus();

			onDeclarationRemove(id);
		}

		const onDeclarationAdd = () => {
			const newDeclaration = getEmptyDeclaration();

			setVariants(
				variants.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: [...variant.declarations, newDeclaration],
						};
					}

					return variant;
				}),
			);
		};

		const onVariantAdd = (variant: string, parentId?: string) => {
			const id = `${variant}-${parentId}-${new Date().getMilliseconds()}`;
			const newVariant: ComponentVariant = {
				id,
				parentId: parentId ?? selectedVariantId ?? variants[0]?.id ?? undefined,
				type: variant,
				declarations: [getEmptyDeclaration()],
			};

			if (variant === VARIANT_COMPONENTS_STATE) {
				const defaultVariant = variants.find((variant) => variant.type === DEFAULT_COMPONENTS_STATE);

				newVariant.parentId = defaultVariant?.id ?? undefined;
				newVariant.variantSelector = ".is-large";
			}

			if ([VARIANT_COMPONENTS_STATE, CUSTOM_COMPONENTS_STATE].includes(variant)) {
				setOrder((prev) => [...prev, id]);
			}

			setVariants((prev) => [...prev, newVariant]);

			setTimeout(() => {
				setSelectedVariantId(id);
			}, 10);
		};

		const onDuplicate = (variantId: string | undefined) => {
			if (!variantId) {
				return;
			}

			const copiedObject = variants.find(({ id: vId }) => vId === variantId);

			if (!copiedObject) {
				return;
			}

			const indexOfCopiedObject = variants.indexOf(copiedObject);

			const id = ulid();

			const copy = {
				...copiedObject,
				id,
			};
			const variantsOfCopiedObject = variants.filter((variant) => variant.parentId === copiedObject.id);

			const indexOfCopiedObjectInOrder = order.indexOf(copiedObject.id);

			if (indexOfCopiedObjectInOrder !== -1) {
				const newOrder = [...order];
				newOrder.splice(indexOfCopiedObjectInOrder + 1, 0, id);
				setOrder(newOrder);
			}

			setVariants((prev) => {
				const newVariants = [...prev];
				newVariants.splice(indexOfCopiedObject + 1, 0, copy);

				if (variantsOfCopiedObject.length) {
					variantsOfCopiedObject.forEach((variant) => {
						const indexOfVariant = variants.indexOf(variant);

						if (indexOfVariant === -1) {
							return;
						}

						const newVariant = {
							...variant,
							id: ulid(),
							parentId: id,
						};

						newVariants.splice(indexOfVariant + 1, 0, newVariant);
					});
				}

				return newVariants;
			});
		};

		const onVariantRemove = (id: string) => {
			setVariants((prev) => {
				const filtered = prev.filter((variant) => variant.id !== id && variant.parentId !== id);

				const newSelectedVariantId = filtered.find(
					(variant) => variant.type === DEFAULT_COMPONENTS_STATE,
				)?.id;

				setTimeout(() => {
					setSelectedVariantId(newSelectedVariantId ?? null);
				}, 10);

				return filtered;
			});

			setIsDeleteConfirmationOpen(false);
		};

		const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

			if (!cssObjects.length) {
				return;
			}

			const declarations = cssObjects[0].declarations;

			if (!declarations.length) {
				return;
			}

			const newDeclarations = declarations.map((declaration, index) => ({
				id: String(index),
				property: declaration.property,
				value: declaration.value,
			}));

			setVariants((prev) =>
				prev.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: [...variant.declarations, ...newDeclarations],
						};
					}

					return variant;
				}),
			);
		};

		const handlePropertyChange = ({ property, id }: { property: string; id: string }) => {
			setVariants(
				variants.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: variant.declarations.map((declaration) => {
								if (declaration.id === id) {
									return {
										...declaration,
										property,
									};
								}

								return declaration;
							}),
						};
					}

					return variant;
				}),
			);
		};

		interface ValueChangeProps {
			readonly value: string;
			readonly id: string;
		}

		const handleValueChange = ({ value, id }: ValueChangeProps) => {
			setVariants(
				variants.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: variant.declarations.map((declaration) => {
								if (declaration.id === id) {
									return {
										...declaration,
										value,
									};
								}

								return declaration;
							}),
						};
					}

					return variant;
				}),
			);
		};

		const handleColorValueChange = ({ value, id }: ValueChangeProps) => {
			setVariants((prev) =>
				prev.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: variant.declarations.map((declaration) => {
								if (declaration.id === id) {
									return {
										...declaration,
										colorValue: value,
									};
								}

								return declaration;
							}),
						};
					}

					return variant;
				}),
			);
		};

		interface FluidValueChangeProps {
			value: FluidInputValue;
			id: string;
		}

		const handleFluidValueChange = ({ value, id }: FluidValueChangeProps) => {
			setVariants((prev) =>
				prev.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: variant.declarations.map((declaration) => {
								if (declaration.id === id) {
									return {
										...declaration,
										fluidValue: value,
									};
								}

								return declaration;
							}),
						};
					}

					return variant;
				}),
			);
		};

		const onPropertyInputTypeChange = ({ value, id }: { value: string; id: string }) => {
			setVariants(
				variants.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: variant.declarations.map((declaration) => {
								if (declaration.id === id) {
									return {
										...declaration,
										type: value,
									};
								}

								return declaration;
							}),
						};
					}

					return variant;
				}),
			);
		};

		const onNewRow = (e: React.KeyboardEvent<HTMLInputElement>) =>
			focusNextDeclaration({
				e,
				onDeclarationAdd,
			});

		interface IHandleSuggestionsPreview {
			readonly property: string;
			readonly value: string;
		}

		const handleSuggestionsPreview = ({ property, value }: IHandleSuggestionsPreview) => {
			if (!selectedVariant) {
				setDynamicCss("");
				return;
			}

			const selector = ["before", "after"].includes(selectedVariant?.type)
				? getSelectorString({
						mainSelector,
						variant: selectedVariant,
						parentVariant: parentVariant ?? mainVariant,
				  })
				: getSelectorWithoutPseudo({
						mainSelector,
						variant: selectedVariant,
						parentVariant,
				  });
			const rule = `${selector} { ${property}: ${value}; }`;
			setDynamicCss(rule);
		};

		const handleDragEndCssForm = (event: DragEndEvent) => {
			const { active, over } = event;
			const targetDeclaration = selectedVariant?.declarations.find(
				(declaration) => declaration?.id === over?.id,
			);

			if (!targetDeclaration || !selectedVariant) {
				return;
			}

			const oldIndex = selectedVariant?.declarations?.findIndex(
				(declaration) => declaration?.id === active?.id,
			);

			const newIndex = selectedVariant?.declarations?.findIndex(
				(declaration) => declaration?.id === over?.id,
			);

			if (oldIndex === newIndex || oldIndex === -1 || newIndex === -1) {
				return;
			}

			const newDeclarations = [...selectedVariant?.declarations];

			newDeclarations?.splice(newIndex, 0, newDeclarations?.splice(oldIndex, 1)[0]);

			setVariants((prev) =>
				prev.map((variant) => {
					if (variant.id === selectedVariantId) {
						return {
							...variant,
							declarations: newDeclarations,
						};
					}

					return variant;
				}),
			);
		};

		const handleDragVariants = (event: DragEndEvent) => {
			const { active, over } = event;

			if (!active || !over) {
				return;
			}

			const oldIndex = order?.findIndex((id) => id === active?.id);
			const newIndex = order?.findIndex((id) => id === over?.id);

			if (oldIndex === newIndex || oldIndex === -1 || newIndex === -1) {
				return;
			}

			const newOrder = [...order];

			newOrder?.splice(newIndex, 0, newOrder?.splice(oldIndex, 1)[0]);

			setOrder(newOrder);
		};

		const toggleBackground = useCallback(() => {
			const currentIndex = PREVIEW_BACKGROUNDS.indexOf(background);
			const nextIndex = currentIndex + 1 < PREVIEW_BACKGROUNDS.length ? currentIndex + 1 : 0;

			setBackground(PREVIEW_BACKGROUNDS[nextIndex]);
		}, [background]);

		const handleThemeToggle = useCallback(() => {
			const iframe = document.querySelector(
				".mantine-Modal-root .preview-container iframe",
			) as unknown as HTMLIFrameElement | null;

			if (!iframe) return;

			const doc = iframe.contentDocument;
			doc?.querySelector("html")?.classList.toggle("cf-theme-dark");
			setIsPreviewDarkMode((b) => {
				setBackground(b ? PREVIEW_BACKGROUNDS[1] : PREVIEW_BACKGROUNDS.at(-1)!);
				return !b;
			});
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
		}, [setIsPreviewDarkMode]);

		const onCopy = async (id: string) => {
			const variant = variants.find((variant) => variant.id === id);
			const children = variants.filter((variant) => variant.parentId === id);

			if (!variant) {
				toast.error("No variant found");
				return;
			}

			const componentVariantExport = await createPartialExport({
				type: "componentVariant" as PartialExportTypes,
				data: {
					variant,
					children,
				},
			});

			if (!componentVariantExport) {
				toast.error("No variant found");
				return;
			}

			copyToClipboard(componentVariantExport?.string);
			toast.success("Component variant copied to clipboard");
		};

		const onPaste = async (id: string) => {
			try {
				const compressedString = (await readClipboard()).trim();

				if (!compressedString?.length) {
					toast.message("Clipboard is empty.");
					return;
				}

				const variantData = await parsePartialImport({
					compressedString,
				});

				if (!variantData) {
					toast.error("Clipboard does not contain component export.");
					return;
				}

				if (String(variantData.type) !== PartialExportTypes.componentVariant) {
					toast.error("Clipboard does not contain component variant export.");
					return;
				}

				const beforeIndex = order.indexOf(id);

				if (beforeIndex === -1) {
					toast.error("Something went wrong. Failed to paste component.");
					return;
				}

				const newId = ulid();
				const newVariants = [...variants];
				const { variant, children } = variantData.data as {
					variant: ComponentVariant;
					children: ComponentVariant[];
				};

				const newVariant: ComponentVariant = {
					...variant,
					id: newId,
				};

				newVariants.push(newVariant);

				const newOrder = [...order];
				const afterIndex = beforeIndex + 1;
				newOrder.splice(afterIndex, 0, newId);

				for (const child of children) {
					const newChildId = ulid();
					const newChild = {
						...child,
						id: newChildId,
						parentId: newId,
					};

					newVariants.push(newChild);
					newOrder.splice(afterIndex, 0, newChildId);
				}

				setOrder(newOrder);
				setVariants(newVariants);

				toast.success("Component imported.");
			} catch (error) {
				toast.error("Something went wrong. Failed to paste component.");
			}
		};

		useEffectOnce(() => {
			if (!isInitialLoadDarkMode && !isPreviewDarkMode) return;

			const iframe = document.querySelector(
				".mantine-Modal-root .preview-container iframe",
			) as unknown as HTMLIFrameElement | null;

			iframe?.addEventListener(
				"load",
				() => {
					const doc = iframe?.contentDocument;
					doc?.querySelector("html")?.classList.toggle("cf-theme-dark");
				},
				{ once: true },
			);
		});

		if (!(component && variablesCss)) {
			return null;
		}

		return (
			<div className="components-editor">
				<header className="row space-between align-center gap-m padding-m">
					<input
						className="heading-input full-width"
						value={mainSelector}
						onChange={(e) => setMainSelector(e.target.value.trim())}
					/>

					<div
						className="row gap-m"
						style={{
							opacity: 100,
						}}
					>
						<Tooltip label="Close without saving">
							<button className="btn-red btn-s btn-box" onClick={closeModal}>
								<Cross />
							</button>
						</Tooltip>

						<Tooltip label="Save and close">
							<button className="btn-green btn-s btn-box" onClick={handleCloseAndSave}>
								<Checkmark />
							</button>
						</Tooltip>
					</div>
				</header>

				<div className="states-container">
					<button className={"btn-secondary btn-s"} onClick={() => onVariantAdd("variant")}>
						Add a modifier
					</button>

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={(e) => handleDragVariants(e)}
					>
						<SortableContext
							items={variantsGroupedByParents.map(({ mainComponent }) => mainComponent?.id ?? "")}
							strategy={verticalListSortingStrategy}
						>
							<ul className="list-none full-height">
								{variantsGroupedByParents.map(({ id, mainComponent, variants }) => (
									<DndStateItem
										id={mainComponent.id}
										key={mainComponent.id}
										preventDrag={mainComponent?.type === DEFAULT_COMPONENTS_STATE}
									>
										{(listeners) => {
											return (
												<>
													{mainComponent?.type === "default" ? (
														<div className="row align-center">
															<p className="variant-subheading">Default styles</p>
															<Tooltip
																multiline
																withArrow
																width={200}
																label="A base styling for the main class of this component."
															>
																<span className="help-tooltip">
																	<Info />
																</span>
															</Tooltip>
														</div>
													) : null}

													<li
														className={clsx("row align-center", {
															active: mainComponent?.id === selectedVariantId,
															"is-default": mainComponent?.type === "default",
														})}
														onClick={() => {
															setSelectedVariantId(mainComponent?.id);
														}}
													>
														{mainComponent?.type === "default" ? null : (
															<div {...listeners} className="dnd-handle grab transition-global opacity-50">
																<div>
																	<SixDots />
																</div>
															</div>
														)}

														{mainComponent?.type === "default" ? (
															<div className="component-variant-input">
																<input
																	type="text"
																	value={mainSelector}
																	className="heading-input-disabled"
																	onChange={(e) => {
																		setMainSelector(e.target.value);
																	}}
																	autoComplete="off"
																	autoCorrect="off"
																	autoCapitalize="off"
																	spellCheck={false}
																/>
																<EditPen />
															</div>
														) : null}
														{mainComponent?.type === "default" ? null : (
															<div className="component-variant-input">
																<input
																	type="text"
																	value={mainComponent?.variantSelector}
																	className=""
																	onChange={(e) => {
																		setVariants((prevVariants) =>
																			prevVariants.map((variant) => {
																				if (variant.id === mainComponent?.id) {
																					return {
																						...variant,
																						variantSelector: e.target.value,
																					};
																				}

																				return variant;
																			}),
																		);
																	}}
																	autoComplete="off"
																	autoCorrect="off"
																	autoCapitalize="off"
																	spellCheck={false}
																/>
																<EditPen />
															</div>
														)}
														<Menu shadow="md" width={100} position="right">
															<Menu.Target>
																<button className={"component-variant-add"}>
																	<Plus />
																	<span>State</span>
																</button>
															</Menu.Target>

															<Menu.Dropdown>
																<Menu.Label>Add State</Menu.Label>

																{AVAILABLE_VARIANTS_WITHOUT_VARIANT.filter(
																	(variant) => !variants.find((v) => v.type === variant),
																).map((variant, i) => (
																	<Menu.Item key={i} onClick={() => onVariantAdd(variant, id)}>
																		{variant}
																	</Menu.Item>
																))}
															</Menu.Dropdown>
														</Menu>
														<Menu shadow="md" position="right">
															{mainComponent?.type === "default" ? null : (
																<Menu.Target>
																	<button className={"component-variant-menu"}>
																		<ThreeDots />
																	</button>
																</Menu.Target>
															)}

															<Menu.Dropdown>
																<Menu.Item
																	icon={<Duplicate />}
																	onClick={() => onDuplicate(mainComponent?.id)}
																>
																	Duplicate
																</Menu.Item>

																<Menu.Item icon={<Duplicate />} onClick={() => onCopy(mainComponent?.id)}>
																	Copy
																</Menu.Item>

																<Menu.Item icon={<Duplicate />} onClick={() => onPaste(mainComponent?.id)}>
																	Paste
																</Menu.Item>

																<Menu.Item
																	onClick={
																		isDeleteConfirmationOpen
																			? () => onVariantRemove(mainComponent?.id)
																			: () => setIsDeleteConfirmationOpen(true)
																	}
																	onBlur={() => setIsDeleteConfirmationOpen(false)}
																	style={
																		isDeleteConfirmationOpen
																			? {
																					background: "#c2344e",
																			  }
																			: {}
																	}
																	closeMenuOnClick={isDeleteConfirmationOpen}
																	icon={<Remove />}
																>
																	{isDeleteConfirmationOpen ? "Are you sure?" : "Remove"}
																</Menu.Item>
															</Menu.Dropdown>
														</Menu>
													</li>

													<ul>
														{variants.map((variant) => (
															<li
																key={variant.id}
																className={clsx("row space-between align-center", {
																	active: variant.id === selectedVariantId,
																})}
																onClick={() => {
																	setSelectedVariantId(variant.id);
																}}
															>
																<div className="row align-center">
																	<span
																		style={{
																			marginLeft: 38,
																		}}
																		className="opacity-60"
																	>
																		:{variant.type}
																	</span>
																</div>

																<Menu shadow="md" position="right">
																	<Menu.Target>
																		<button className="component-variant-menu" tabIndex={-1}>
																			<ThreeDots />
																		</button>
																	</Menu.Target>

																	<Menu.Dropdown>
																		<Menu.Item
																			onClick={
																				isDeleteConfirmationOpen
																					? () => onVariantRemove(variant.id)
																					: () => setIsDeleteConfirmationOpen(true)
																			}
																			onBlur={() => setIsDeleteConfirmationOpen(false)}
																			style={
																				isDeleteConfirmationOpen
																					? {
																							background: "#c2344e",
																					  }
																					: {}
																			}
																			closeMenuOnClick={isDeleteConfirmationOpen}
																			icon={<Remove />}
																		>
																			{isDeleteConfirmationOpen ? "Are you sure?" : "Remove"}
																		</Menu.Item>
																	</Menu.Dropdown>
																</Menu>
															</li>
														))}
													</ul>

													{mainComponent?.type === "default" ? (
														<div className="row align-center margin-top-l">
															<p className="variant-subheading">Modifiers</p>
															<Tooltip
																multiline
																withArrow
																width={200}
																label="A modifier class can append alternative styles to the main class. It can also be used to target inner elements when started with a space."
															>
																<span className="help-tooltip">
																	<Info />
																</span>
															</Tooltip>
														</div>
													) : null}

													{hasVariants ? null : (
														<li
															className="row align-center padding-m margin-m gap-m radius bg-primary hover-bg-tertiary pointer shadow-l empty-state"
															onClick={() => onVariantAdd("variant")}
														>
															<div className="grid gap-s">
																<b className="text-m">Add first modifier</b>
															</div>
														</li>
													)}
												</>
											);
										}}
									</DndStateItem>
								))}
							</ul>
						</SortableContext>
					</DndContext>
				</div>

				<div
					className="preview-container"
					style={{
						background,
					}}
				>
					<ComponentsPreview
						editorCss={editorCss ?? ""}
						variablesCss={variablesCss}
						dynamicCss={dynamicCss}
						selectors={[
							...(selectedVariant?.type === "custom" ? [] : [getFirstSelector(mainSelector)]),
							parentVariant?.variantSelector ?? "",
							selectedVariant?.variantSelector ?? "",
						]}
						type={previewType}
						isDarkBackground={true}
					/>

					<footer>
						<Tooltip label="Previewed output">
							<Select
								onChange={(value: ComponentsType) => setPreviewType(value)}
								value={previewType}
								data={COMPONENTS_TYPES as unknown as string[]}
							/>
						</Tooltip>

						<div className="row gap-s align-stretch">
							<Tooltip label="Preview background">
								<button className="btn-tertiary btn-box" onClick={toggleBackground}>
									<ColorPalette />
								</button>
							</Tooltip>

							<Tooltip label={`Enable ${isPreviewDarkMode ? "light" : "dark"} mode`}>
								<button
									className={isPreviewDarkMode ? "theme-toggle dark-mode" : "theme-toggle light-mode"}
									onClick={handleThemeToggle}
								>
									<span className={!isPreviewDarkMode ? "active" : ""}>
										<Sun />
									</span>
									<span className={!isPreviewDarkMode ? "" : "active"}>
										<Moon />
									</span>
								</button>
							</Tooltip>
						</div>
					</footer>
				</div>

				<div className="editor-container">
					{selectedVariant?.type === DEFAULT_COMPONENTS_STATE ? (
						<span className="text-m text-main">
							CSS for <b>{mainSelector}</b> class.
						</span>
					) : null}

					{selectedVariant?.type !== "variant" &&
					selectedVariant?.type !== DEFAULT_COMPONENTS_STATE &&
					selectedVariant ? (
						<div className="text-m text-main">
							CSS for{" "}
							<b>
								{getSelectorString({
									mainSelector,
									variant: selectedVariant,
									parentVariant,
								})}
							</b>
						</div>
					) : null}

					{selectedVariant?.type === "variant" ? (
						<>
							<span className="text-m text-main">
								CSS for <b>{selectedVariant.variantSelector}</b> class.
							</span>
							<span className="cf-notice">
								{/*<Info />*/}
								<span>
									A modifier class alters styles of the main
									<b className="text-main"> {mainSelector}</b> class, when used together on the same element.
								</span>
							</span>
						</>
					) : null}

					<div className="declarations-container">
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={(e) => handleDragEndCssForm(e)}
						>
							<SortableContext
								items={selectedVariant?.declarations.map(({ id }) => id) ?? []}
								strategy={verticalListSortingStrategy}
							>
								{selectedVariant?.declarations.map(
									({ id, property, type, value, colorValue, fluidValue }) => (
										<DndItem key={id} id={id} className="declaration">
											<CssForm
												onPropertyChange={(property) =>
													handlePropertyChange({
														property,
														id,
													})
												}
												onValueChange={(value) =>
													handleValueChange({
														value,
														id,
													})
												}
												onColorValueChange={(value) =>
													handleColorValueChange({
														value,
														id,
													})
												}
												onFluidValueChange={(value) =>
													handleFluidValueChange({
														value,
														id,
													})
												}
												onTypeChange={(value: string) =>
													onPropertyInputTypeChange({
														value,
														id,
													})
												}
												onSuggestionPreview={handleSuggestionsPreview}
												onSuggestionPreviewAbort={() => setDynamicCss("")}
												onNewRow={onNewRow}
												onRemoveRow={() => removeDeclarationOnBackSpace(id)}
												onPaste={handlePaste}
												property={property}
												type={type}
												value={value}
												colorValue={colorValue}
												fluidValue={fluidValue as FluidInputValue}
											/>

											<button
												onClick={() => onDeclarationRemove(id)}
												className="add-remove remove-prop"
												tabIndex={-1}
											>
												<Plus />
											</button>
										</DndItem>
									),
								)}
							</SortableContext>
						</DndContext>

						<button onClick={onDeclarationAdd} className="add-remove add-prop">
							<Plus />
						</button>
					</div>
				</div>
			</div>
		);
	},
);

ComponentsEditor.displayName = "ComponentsEditor";
