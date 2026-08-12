import { forwardRef, memo, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_MAX_SCREEN_WIDTH, DEFAULT_MIN_SCREEN_WIDTH } from "data/defaults";
import { cssReset } from "components/modules/components/constants";
import { getCss } from "components/modules/components/functions/getCss";
import { generateFluidSpacingResult } from "components/modules/spacing/functions/getFluidSpacingVariables";
import { generateFluidTypographyResult } from "components/modules/typography/functions/getFluidTypeVariables";
import clsx from "clsx";
import { colord } from "colord";
import { minifyCss } from "functions/minifyCss";
import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { capitalize } from "utils";
import { Desktop } from "assets/icons/Desktop.icon";
import { Moon } from "assets/icons/Moon.icon";
import { Phone } from "assets/icons/Phone.icon";
import { Sun } from "assets/icons/Sun.icon";
import { Tooltip } from "components/ui/Tooltip";
import { useAutoCompleteLoad } from "hooks/useAutoCompleteLoad";
import { cssGenerator } from "cssGenerator";
import { CssGeneratorOptions } from "cssGenerator/cssGenerator";
import {
	colorSystemFormDataAtom,
	componentsDataAtom,
	currentPresetAtom,
	presetPreferencesSelector,
	spacingDataAtom,
	typographyDataAtom,
	variablesStylesAtom,
} from "state";
import { styleGuideIframeCss } from "./StyleGuide.IframeCss";
import { createElement } from "./StyleGuide.componentPreview";

type StyleGuideSettings = {
	title: string;
	isDarkMode: boolean;
};

type PreviewComponentGroup = {
	id: string;
	name: string;
	components: PreviewComponent[];
	type: string;
};

type PreviewComponent = {
	element: HTMLElement;
	name: string;
	id: string;
};

const cssGeneratorOptions: Partial<CssGeneratorOptions> = {
	format: true,
	combineSelectors: true,
	propertyValidation: false,
	valueValidation: false,
	manualDarkMode: true,
};

const Doc = forwardRef<any, { settings: StyleGuideSettings }>(({ settings }, ref) => {
	const getVariablesObject = useAtomCallback(useCallback((get) => get(variablesStylesAtom), []));

	const { root_font_size, is_rem, max_screen_width, min_screen_width } =
		useAtomValue(presetPreferencesSelector);
	const currentPreset = useAtomValue(currentPresetAtom);
	const colorSystem = useAtomValue(colorSystemFormDataAtom);
	const spacingData = useAtomValue(spacingDataAtom);
	const typographyData = useAtomValue(typographyDataAtom);
	const componentsData = useAtomValue(componentsDataAtom);

	const { getCssVarsObjects } = useAutoCompleteLoad();

	const [variablesCss, setVariablesCss] = useState<string>("");
	const [editorCss, setEditorCss] = useState<string>("");

	const firstColor = useMemo(() => {
		return colorSystem?.groups?.[0]?.colors?.[0];
	}, [colorSystem]);

	const firstSpacing = useMemo(() => spacingData.groups[0], [spacingData]);
	const resultSpacing = useMemo(() => {
		return generateFluidSpacingResult({
			spacingState: { groups: [firstSpacing] },
			root_font_size: root_font_size || 16,
			is_rem: Boolean(is_rem),
			max_screen_width: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		});
	}, [firstSpacing, is_rem, max_screen_width, min_screen_width, root_font_size]);

	const firstTypography = useMemo(() => typographyData.groups[0], [typographyData]);
	const resultTypography = useMemo(() => {
		return generateFluidTypographyResult({
			typographyData: { groups: [firstTypography] },
			root_font_size: root_font_size || 16,
			is_rem: Boolean(is_rem),
			max_screen_width: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		});
	}, [firstTypography, is_rem, max_screen_width, min_screen_width, root_font_size]);

	const fetchCss = useCallback(async () => {
		const modulesVariables = getVariablesObject();
		const variablesFromGroups = getCssVarsObjects();
		const cssObjects = [...modulesVariables, ...variablesFromGroups];
		const css = await cssGenerator({ cssObjects, options: cssGeneratorOptions });

		setVariablesCss(css);

		const cssPromises = currentPreset?.modulesData?.COMPONENTS?.components?.map((c) => getCss(c));

		if (!cssPromises) {
			return;
		}

		setEditorCss(await Promise.all(cssPromises).then((c) => c.join("\n")));
	}, [
		JSON.stringify(colorSystem),
		JSON.stringify(spacingData),
		JSON.stringify(typographyData),
		JSON.stringify(componentsData),
	]);

	useEffect(() => {
		fetchCss();
	}, [
		JSON.stringify(colorSystem),
		JSON.stringify(spacingData),
		JSON.stringify(typographyData),
		JSON.stringify(componentsData),
	]);

	const components = useMemo(() => {
		return componentsData?.components
			?.map((component) => {
				const mainComponent = {
					element: createElement({
						type: component.type,
						selectors: [component.selector],
					}) as HTMLElement,
					name: component.selector,
					id: "default",
				};
				const previewComponent: PreviewComponentGroup = {
					components: [mainComponent],
					type: component.type,
					name: component.selector,
					id: component.id,
				};

				for (const { variantSelector, id } of component.variants ?? []) {
					if (!variantSelector || variantSelector.startsWith(":")) {
						continue;
					}

					const element = createElement({
						type: component.type,
						selectors: [component.selector, variantSelector ?? ""],
					}) as HTMLElement;

					previewComponent.components.push({
						name: variantSelector,
						element,
						id,
					});
				}

				const order = component.order;

				if (order && order?.length > 0) {
					const sortedComponents = previewComponent.components.sort((a, b) => {
						const aIndex = order?.indexOf(a.id) ?? 0;
						const bIndex = order?.indexOf(b.id) ?? 0;
						return aIndex - bIndex;
					});

					return { ...previewComponent, components: sortedComponents };
				}

				return previewComponent;
			})
			.filter(Boolean);
	}, [JSON.stringify(componentsData)]);

	const accentColor = useMemo(() => {
		const main = colord(firstColor?.value ?? "#ffffff");
		const colors = [
			{ name: "main-color-background", value: main.alpha(0.025).toHex() },
			{ name: "main-color-secondary-background", value: main.alpha(0.05).toHex() },
			{ name: "main-color-accent", value: main.mix("#ffffff", 0.65).toHex() },
			{ name: "main-color-accent-two", value: main.mix("#ffffff", 0.95).toHex() },
		];

		return `:root { ${colors.map((color) => `--${color.name}: ${color.value};`).join(" ")} }`;
	}, [JSON.stringify(firstColor)]);

	useEffect(() => {
		const iframe = document.querySelector("iframe");
		const htmlElement = iframe?.contentDocument?.querySelector("html");

		htmlElement?.classList.remove(...["cf-theme-dark", "cf-theme-light"]);
		htmlElement?.classList.add(settings.isDarkMode ? "cf-theme-dark" : "cf-theme-light");
	}, [settings.isDarkMode]);

	return (
		<div className="cfs-style-guide-main">
			{[
				{ name: "css-reset", css: cssReset },
				{ name: "variables", css: variablesCss },
				{ name: "components", css: editorCss },
				{ name: "accent-color", css: accentColor },
			].map((item) => (
				<style key={item.name} id={`core-framework-style-guide-${item.name}`}>
					{minifyCss(item.css)}
				</style>
			))}
			<style id={`core-framework-style-guide-main`}>{styleGuideIframeCss}</style>
			<style>
				{currentPreset?.preferences?.root_font_size
					? `html { font-size: ${currentPreset?.preferences?.root_font_size}px; }`
					: ""}
			</style>

			<div ref={ref} style={{ paddingBottom: 400 }}>
				<div
					style={{
						backgroundColor: "var(--main-color-secondary-background)",
					}}
				>
					<div className="cfs-header">
						<div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
							<img
								src="data:image/png;base64,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"
								style={{ width: 25, height: 25, marginRight: 6 }}
							/>
							<p className="cfs-title">{settings.title}</p>
						</div>
					</div>
				</div>

				{colorSystem?.isDisabled ? null : (
					<div className="cfs-sub-section">
						<div className="cfs-section">
							<div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
								<svg
									style={{ width: 14, height: 14, marginRight: 4 }}
									width="28"
									height="27"
									viewBox="0 0 28 27"
									fill="none"
								>
									<path
										d="M13.0742 0.767584C13.4128 -0.0617635 14.5872 -0.0617603 14.9258 0.767587L18.1899 8.76229C18.2915 9.01109 18.4889 9.20853 18.7377 9.31011L26.7324 12.5742C27.5618 12.9128 27.5618 14.0872 26.7324 14.4258L18.7377 17.6899C18.4889 17.7915 18.2915 17.9889 18.1899 18.2377L14.9258 26.2324C14.5872 27.0618 13.4128 27.0618 13.0742 26.2324L9.81011 18.2377C9.70853 17.9889 9.51109 17.7915 9.26229 17.6899L1.26758 14.4258C0.438236 14.0872 0.43824 12.9128 1.26759 12.5742L9.26229 9.31011C9.51109 9.20853 9.70853 9.01109 9.81011 8.76229L13.0742 0.767584Z"
										fill={firstColor?.value ?? "blue"}
									/>
								</svg>
								<p className="cfs-sub-title">Colors</p>
							</div>
							<p className="cfs-p">
								Colors play a pivotal role, conveying emotions, establishing a visual language, and creating a
								memorable impression.
							</p>
						</div>

						<div className="cfs-section cfs-column-gap-large">
							{colorSystem?.groups?.map((group) => (
								<div key={group.id}>
									<p className="cfs-sub-title">{group.name} Colors</p>
									<div className="cfs-flex-wrap-container cfs-column-gap-large">
										{group.colors.map((color) => (
											<div
												key={color.id}
												className={clsx({
													"cfs-section-two-columns": color.shades?.length || color.tints?.length,
												})}
											>
												<div className="cfs-column-one">
													<div className="cfs-page-break">
														<p className="cfs-p cfs-color-title">{color.name}</p>
														<div
															className="cfs-color-preview-main"
															style={{ backgroundColor: color.value }}
														/>
														<div
															className="cfs-color-preview-footer"
															style={{
																backgroundColor: colord(color.value).alpha(0.1).toHex(),
																borderColor: colord(color.value).alpha(0.1).toHex(),
															}}
														>
															<p className="cfs-color-preview-badge cfs-var">{color.name}</p>
															<p className="cfs-color-preview-value">{color.value}</p>
														</div>
													</div>
												</div>

												{color.shades?.length || color.tints?.length ? (
													<div className="cfs-column-two" style={{ flexDirection: "column", gap: 10 }}>
														{color.shades?.length ? (
															<div>
																<p className="cfs-p cfs-color-title">Shades</p>
																<div className="cfs-colors-wrapper">
																	{color.shades.map((shade) => (
																		<div
																			className="cfs-color"
																			style={{ backgroundColor: colord(color.value).alpha(0.1).toHex() }}
																			key={shade.name}
																		>
																			<div
																				className="cfs-color-preview-main"
																				style={{ backgroundColor: shade.value }}
																			/>
																			<div
																				className="cfs-color-preview-footer"
																				style={{ borderColor: colord(color.value).alpha(0.1).toHex() }}
																			>
																				<p className="cfs-color-preview-badge cfs-var">{shade.name}</p>
																				<p className="cfs-color-preview-value">{shade.value}</p>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														) : null}

														{color.tints?.length ? (
															<div style={{ marginTop: 10 }}>
																<p className="cfs-p cfs-color-title">Tints</p>
																<div className="cfs-colors-wrapper">
																	{color.tints.map((tint) => (
																		<div
																			style={{
																				backgroundColor: colord(color.value).alpha(0.1).toHex(),
																			}}
																			key={tint.name}
																		>
																			<div
																				className="cfs-color-preview-main"
																				style={{ backgroundColor: tint.value }}
																			/>
																			<div
																				className="cfs-color-preview-footer"
																				style={{
																					borderColor: colord(color.value).alpha(0.1).toHex(),
																				}}
																			>
																				<p className="cfs-color-preview-badge cfs-var">{tint.name}</p>
																				<p className="cfs-color-preview-value">{tint.value}</p>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														) : null}
													</div>
												) : null}
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				{firstTypography?.isDisabled ? null : (
					<div>
						<div className="cfs-section">
							<div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
								<svg
									style={{ width: 14, height: 14, marginRight: 4 }}
									width="28"
									height="27"
									viewBox="0 0 28 27"
									fill="none"
								>
									<path
										d="M13.0742 0.767584C13.4128 -0.0617635 14.5872 -0.0617603 14.9258 0.767587L18.1899 8.76229C18.2915 9.01109 18.4889 9.20853 18.7377 9.31011L26.7324 12.5742C27.5618 12.9128 27.5618 14.0872 26.7324 14.4258L18.7377 17.6899C18.4889 17.7915 18.2915 17.9889 18.1899 18.2377L14.9258 26.2324C14.5872 27.0618 13.4128 27.0618 13.0742 26.2324L9.81011 18.2377C9.70853 17.9889 9.51109 17.7915 9.26229 17.6899L1.26758 14.4258C0.438236 14.0872 0.43824 12.9128 1.26759 12.5742L9.26229 9.31011C9.51109 9.20853 9.70853 9.01109 9.81011 8.76229L13.0742 0.767584Z"
										fill={firstColor?.value ?? "blue"}
									/>
								</svg>
								<p className="cfs-sub-title">Typography</p>
							</div>
							<p className="cfs-p">
								Typography is the art and technique of arranging type to make written language legible,
								readable, and appealing when
							</p>
						</div>

						{(firstTypography?.mode ?? "fluid") === "fluid" ? (
							<div className="cfs-section" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
								{resultTypography?.typeScales?.map((item, index) => (
									<div key={`key-${index}`} className="cfs-calculator-row">
										<span className="cfs-var">
											{(Object.keys(resultTypography.declarations[index]) ?? "")[0].replace("--", "")}
										</span>
										<div className="cfs-calculator-preview">
											<div className="cfs-calculator-preview-single">
												<span className="cfs-calculator-preview-label">
													{resultTypography.typeScales[index].min}
													px
												</span>

												<Phone />

												<p
													style={{
														fontSize: `${resultTypography.typeScales[index].min}px`,
													}}
												>
													Minimum
												</p>
											</div>

											<div className="cfs-calculator-preview-single">
												<span className="cfs-calculator-preview-label">
													{Number(resultTypography.typeScales[index].max) <
													Number(resultTypography.typeScales[index].min)
														? resultTypography.typeScales[index].min
														: resultTypography.typeScales[index].max}
													px
												</span>

												<Desktop />

												<p
													style={{
														fontSize: `${
															Number(resultTypography.typeScales[index].max) <
															Number(resultTypography.typeScales[index].min)
																? resultTypography.typeScales[index].min
																: resultTypography.typeScales[index].max
														}px`,
													}}
												>
													Maximum
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="cfs-section" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
								{firstTypography?.manualSizes?.map((item) => (
									<div key={`key-${item.id}`} className="cfs-calculator-row">
										<span className="cfs-var">{item.name.replace("--", "")}</span>
										<div className="cfs-calculator-preview">
											<div className="cfs-calculator-preview-single">
												<span className="cfs-calculator-preview-label">
													{item.min}
													px
												</span>

												<Phone />

												<p
													style={{
														fontSize: `${item.min}px`,
													}}
												>
													Minimum
												</p>
											</div>

											<div className="cfs-calculator-preview-single">
												<span className="cfs-calculator-preview-label">
													{Number(item.max) < Number(item.min) ? item.min : item.max}
													px
												</span>

												<Desktop />

												<p
													style={{
														fontSize: `${Number(item.max) < Number(item.min) ? item.min : item.max}px`,
													}}
												>
													Maximum
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
				{spacingData?.isDisabled ? null : (
					<div>
						<div className="cfs-section">
							<div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
								<svg
									style={{ width: 14, height: 14, marginRight: 4 }}
									width="28"
									height="27"
									viewBox="0 0 28 27"
									fill="none"
								>
									<path
										d="M13.0742 0.767584C13.4128 -0.0617635 14.5872 -0.0617603 14.9258 0.767587L18.1899 8.76229C18.2915 9.01109 18.4889 9.20853 18.7377 9.31011L26.7324 12.5742C27.5618 12.9128 27.5618 14.0872 26.7324 14.4258L18.7377 17.6899C18.4889 17.7915 18.2915 17.9889 18.1899 18.2377L14.9258 26.2324C14.5872 27.0618 13.4128 27.0618 13.0742 26.2324L9.81011 18.2377C9.70853 17.9889 9.51109 17.7915 9.26229 17.6899L1.26758 14.4258C0.438236 14.0872 0.43824 12.9128 1.26759 12.5742L9.26229 9.31011C9.51109 9.20853 9.70853 9.01109 9.81011 8.76229L13.0742 0.767584Z"
										fill={firstColor?.value ?? "blue"}
									/>
								</svg>
								<p className="cfs-sub-title">Spacing</p>
							</div>
							<p className="cfs-p">
								Fluid variables are used to create consistent spacing between elements. They are based on a
								modular scale and are calculated based on the viewport width.
							</p>
						</div>

						{(firstSpacing?.mode ?? "fluid") === "fluid" ? (
							<div
								className="cfs-section"
								style={{ ...{ display: "flex", flexDirection: "column", gap: 5 } }}
							>
								{resultSpacing?.typeScales?.map((item, i) => (
									<div
										style={{
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											gap: 5,
										}}
										key={String(item.min) + i}
									>
										<div
											style={{
												display: "flex",
												flexDirection: "row",
											}}
										>
											<div
												style={{
													width: item.min,
													height: 15,
													backgroundColor: colord(firstColor?.value ?? "#ffffff")
														.mix("#ffffff", 0.65)
														.toHex(),
												}}
											/>
											<div
												style={{
													width: Number(item.max) - Number(item.min),
													height: 15,
													backgroundColor: colord(firstColor?.value ?? "#ffffff")
														.mix("#ffffff", 0.75)
														.toHex(),
												}}
											/>
										</div>
										<p
											style={{
												fontSize: 14,
												textAlign: "left",
												maxWidth: 300,
												padding: 4,
												marginTop: 0,
											}}
											className="cfs-p"
										>
											<span className="cfs-var">
												{(Object.keys(resultSpacing.declarations[i]) ?? "")[0].replace("--", "")}
											</span>{" "}
											<span style={{ opacity: 0.8 }}>
												{"("}
												{item.min}px - {item.max}px{")"}
											</span>
										</p>
									</div>
								))}
							</div>
						) : (
							<div
								className="cfs-section"
								style={{ ...{ display: "flex", flexDirection: "column", gap: 5 } }}
							>
								{firstSpacing?.manualSizes?.map((item, i) => (
									<div
										style={{
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											gap: 5,
										}}
										key={item.id + i}
									>
										<div style={{ display: "flex", flexDirection: "row" }}>
											<div
												style={{
													width: item.min,
													height: 15,
													backgroundColor: colord(firstColor?.value ?? "#ffffff")
														.mix("#ffffff", 0.65)
														.toHex(),
												}}
											/>
											<div
												style={{
													width: Number(item.max) - Number(item.min),
													height: 15,
													backgroundColor: colord(firstColor?.value ?? "#ffffff")
														.mix("#ffffff", 0.75)
														.toHex(),
												}}
											/>
										</div>
										<p
											style={{
												fontSize: 14,
												textAlign: "left",
												color: "rgba(23, 29, 52, 0.60)",
												maxWidth: 300,
												padding: 4,
											}}
										>
											{item.name.replace("--", "")} {"("}
											{item.min}px - {item.max}px{")"}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}
				{currentPreset?.modulesData?.COMPONENTS?.isDisabled ? null : (
					<div>
						<div className="cfs-section">
							<div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
								<svg
									style={{ width: 14, height: 14, marginRight: 4 }}
									width="28"
									height="27"
									viewBox="0 0 28 27"
									fill="none"
								>
									<path
										d="M13.0742 0.767584C13.4128 -0.0617635 14.5872 -0.0617603 14.9258 0.767587L18.1899 8.76229C18.2915 9.01109 18.4889 9.20853 18.7377 9.31011L26.7324 12.5742C27.5618 12.9128 27.5618 14.0872 26.7324 14.4258L18.7377 17.6899C18.4889 17.7915 18.2915 17.9889 18.1899 18.2377L14.9258 26.2324C14.5872 27.0618 13.4128 27.0618 13.0742 26.2324L9.81011 18.2377C9.70853 17.9889 9.51109 17.7915 9.26229 17.6899L1.26758 14.4258C0.438236 14.0872 0.43824 12.9128 1.26759 12.5742L9.26229 9.31011C9.51109 9.20853 9.70853 9.01109 9.81011 8.76229L13.0742 0.767584Z"
										fill={firstColor?.value ?? "blue"}
									/>
								</svg>
								<p className="cfs-sub-title">Components</p>
							</div>

							<p className="cfs-p">
								Components are the building blocks of your design system. They are reusable elements that can
								be combined to create a user interface.
							</p>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								flexWrap: "wrap",
								gap: 25,
							}}
						>
							{components?.map((component) => (
								<div className="cfs-section" key={component.id}>
									<p className="cfs-sub-title">{capitalize(component.type)}</p>
									<div
										style={{
											gap: 10,
											display: "flex",
											flexDirection: "row",
											flexWrap: "wrap",
											flexGrow: 1,
										}}
										key={component.id}
									>
										{component.components.map((c) => (
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: 10,
													padding: 10,
													background: "var(--main-color-background)",
													border: `1px solid var(--main-color-secondary-background)`,
													borderRadius: 4,
												}}
												key={c.id}
											>
												<p
													className="cfs-badge"
													style={{
														backgroundColor: "var(--main-color-background)",
													}}
												>
													{c.name}
												</p>
												<div
													style={{
														display: "flex",
														flexDirection: "row",
														justifyContent: "center",
														alignItems: "center",
														gap: 10,
														padding: 10,
													}}
												>
													<div
														style={{ minWidth: 50 }}
														dangerouslySetInnerHTML={{ __html: c.element.outerHTML }}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
});

export const StyleGuide = memo(() => {
	const [settings, setSettings] = useState<StyleGuideSettings>({
		title: "Style Guide",
		isDarkMode: false,
	});

	const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
	const mountNode = contentRef?.contentWindow?.document?.body;

	const copyHtml = useCallback(() => {
		let html = mountNode?.innerHTML;
		if (!html) {
			return;
		}

		const styleIdsToRemove = [
			"core-framework-style-guide-variables",
			"core-framework-style-guide-components",
		];

		for (const id of styleIdsToRemove) {
			const regex = new RegExp(`(<style[^>]*id="${id}"[^>]*>)[\\s\\S]*?(<\\/style>)`, "gi");
			html = html.replace(regex, "");
		}

		navigator.clipboard.writeText(html);
	}, [mountNode]);

	return (
		<>
			<header className="top-bar">
				<div className="top-bar-left" />

				<div className="row gap-m">
					<Tooltip label={`Enable ${settings.isDarkMode ? "dark" : "light"} mode`}>
						<button
							className={settings.isDarkMode ? "theme-toggle dark-mode" : "theme-toggle light-mode"}
							onClick={() => setSettings((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }))}
						>
							<span className={settings.isDarkMode ? "" : "active"}>
								<Sun />
							</span>
							<span className={settings.isDarkMode ? "active" : ""}>
								<Moon />
							</span>
						</button>
					</Tooltip>

					<button onClick={copyHtml} className="btn-secondary btn-s">
						Copy HTML
					</button>

				</div>
			</header>

			<div className="style-guide-wrapper">
				<main className="style-guide">
					<iframe style={{ width: "100%", height: "100%" }} ref={setContentRef} frameBorder="0">
						{mountNode && createPortal(<Doc settings={settings} />, mountNode)}
					</iframe>
				</main>
			</div>
		</>
	);
});
