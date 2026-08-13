import { memo, useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "@mantine/core";
import { useAtomCallback } from "jotai/utils";
import { Loader } from "components/basic/Loader";
import { useEffectOnce } from "hooks/useEffectOnce";
import { presetPreferencesSelector } from "state";
import { PREVIEW_IMAGE_DATA_URL } from "../../../constants/previewImage";
import { cssReset } from "./constants";
import type { ComponentsType } from "./types";

const safeAddClass = (node: HTMLElement | SVGElement, className: string) => {
	if (node.classList.contains(className)) {
		return;
	}

	if (className && !/\s/.test(className)) {
		node.classList.add(className);
	} else {
		className.split(" ").forEach((className) => {
			const parsedClassName = className.trim().replace(/\s/g, "-");

			if (parsedClassName) node.classList.add(parsedClassName);
		});
	}

	return node;
};

const safeAddId = (node: HTMLElement | SVGElement, id: string) => {
	if (node.id === id) {
		return;
	}

	node.id = id;

	return node;
};

interface IAddSelector {
	readonly type: ComponentsType;
	readonly selectors: string[];
	readonly node: HTMLElement | SVGElement;
}

const addSelector = ({ selectors, node, type }: IAddSelector) => {
	if (!selectors?.length) {
		return;
	}

	selectors = selectors.map((s) => s.trim()).filter(Boolean);

	selectors.forEach((selector) => {
		const isClass = selector.startsWith(".");
		const isId = selector.startsWith("#");

		selector = selector.slice(1);

		if (type === "radio") {
			const radios = node.querySelectorAll("input[type=radio]") as NodeListOf<HTMLInputElement>;

			[...radios].forEach((radio) => {
				if (isClass && selector) safeAddClass(radio, selector);
				if (isId && selector) safeAddId(radio, selector);
			});

			return;
		}

		if (type === "checkbox") {
			const checkboxes = node.querySelectorAll("input[type=checkbox]") as NodeListOf<HTMLInputElement>;

			[...checkboxes].forEach((checkbox) => {
				if (isClass && selector) safeAddClass(checkbox, selector);
				if (isId && selector) safeAddId(checkbox, selector);
			});

			return;
		}

		if (isClass && selector) safeAddClass(node, selector);
		if (isId && selector) safeAddId(node, selector);
	});

	return node;
};

interface IAddElement {
	readonly type: ComponentsType;
	readonly selectors: string[];
	readonly body: HTMLBodyElement;
}

const addElement = ({ type, body, selectors }: IAddElement) => {
	let node;

	switch (type) {
		case "button":
			node = document.createElement("button");
			node.textContent = "Hello World";

			break;
		case "input":
			node = document.createElement("input");
			node.type = "text";
			node.placeholder = "Just tell me...";

			break;
		case "select":
			node = document.createElement("select");

			const option = document.createElement("option");
			option.value = "1";
			option.textContent = "Select me!";

			node.appendChild(option);

			break;
		case "textarea":
			node = document.createElement("textarea");
			node.placeholder = "What a story...";

			break;
		case "checkbox":
			node = document.createElement("fieldset");

			for (let i = 0; i < 3; i++) {
				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.name = `checkbox-${i}`;
				checkbox.id = `checkbox-${i}`;

				node.appendChild(checkbox);
			}

			break;
		case "radio":
			node = document.createElement("fieldset");

			for (let i = 0; i < 3; i++) {
				const radio = document.createElement("input");
				radio.type = "radio";
				radio.name = "radio";
				radio.id = `radio-${i}`;

				node.appendChild(radio);
			}

			break;
		case "img":
			node = document.createElement("img");
				node.src = PREVIEW_IMAGE_DATA_URL;
			node.alt = "Preview of image";

			break;
		case "icon":
			node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			node.setAttribute("viewBox", "0 0 24 24");
			node.setAttribute("width", "24");
			node.setAttribute("height", "24");
			node.setAttribute("stroke", "currentColor");
			node.innerHTML = `
				<path d="M12,10a8.51784,8.51784,0,0,1,9,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M3,10c0-4.41828,4.02944-8,9-8s9,3.58172,9,8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><line x1="12" y1="15" x2="3" y2="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><line x1="21" y1="10" x2="12" y2="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><rect x="7" y="15" width="10" height="7" rx="1.5" stroke-width="1.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="12" y1="15" x2="12" y2="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M10.35,15h3.3a0,0,0,0,1,0,0v2.5a.5.5,0,0,1-.5.5h-2.3a.5.5,0,0,1-.5-.5V15a0,0,0,0,1,0,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
			`;

			break;
		case "hr":
			node = document.createElement("hr");

			break;
		case "link":
			node = document.createElement("a");
			node.href = "#0";
			node.onclick = (e) => e.preventDefault();
			node.textContent = "I will lead a way";

			break;
		case "card":
			node = document.createElement("div");
			node.innerHTML = `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><line x1="16.5" y1="2.99999" x2="16.5" y2="5.99999" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><line x1="7.5" y1="2.99999" x2="7.5" y2="5.99999" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><rect x="3" y="4.49999" width="18" height="16.5" rx="3" stroke-width="1.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/><g id="Layer_22" data-name="Layer 22"><circle cx="12" cy="12.99999" r="4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M16,12.9982l-7.99989.00353" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></g><path d="M24,0H0V24H24Z" fill="none"/></svg>
				<b>A silly headline, I am</b>
				<p>Here's something amazing about this card. It may not sound that amazing, but it is.</p>`;

			break;
	}

	if (!node) {
		return;
	}

	addSelector({
		selectors,
		node,
		type,
	});
	body.appendChild(node);
};

const RESET_STYLESHEET_NAME = "reset";
const VARIABLES_STYLESHEET_NAME = "variables";
const EDITOR_STYLESHEET_NAME = "editor";
const DYNAMIC_STYLESHEET_NAME = "dynamic";
const FOUC_SCRIPT_NAME = "fouc";

interface IComponentsPreview {
	readonly editorCss: string;
	readonly type: ComponentsType;
	readonly selectors: string[];
	readonly variablesCss: string;
	readonly dynamicCss?: string;
	readonly isDarkBackground?: boolean;
}

export const ComponentsPreview = memo(
	({ editorCss, type, selectors, variablesCss, dynamicCss, isDarkBackground }: IComponentsPreview) => {
		const [isLoading, setIsLoading] = useState(true);

		const getPreferences = useAtomCallback(useCallback((get) => get(presetPreferencesSelector), []));

		const ref = useRef<HTMLDivElement>(null);

		useEffectOnce(() => {
			const iframe = document.createElement("iframe");

			iframe.srcdoc = "<html><head></head><body></body></html>";
			iframe.style.width = "100%";
			iframe.style.height = "100%";
			iframe.style.border = "none";
			//iframe.style.background = "transparent";

			iframe.onload = async () => {
				const { root_font_size } = await getPreferences();

				const head = iframe.contentDocument?.querySelector("head");
				const body = iframe.contentDocument?.querySelector("body");

				const resetStylesheetElement = iframe.contentDocument?.createElement("style");
				const editorStylesheetElement = iframe.contentDocument?.createElement("style");
				const coreStylesheetElement = iframe.contentDocument?.createElement("style");
				const dynamicStylesheetElement =
					dynamicCss !== undefined ? iframe.contentDocument?.createElement("style") : undefined;

				const foucScript = iframe.contentDocument?.createElement("script");

				if (
					!(
						head &&
						body &&
						resetStylesheetElement &&
						editorStylesheetElement &&
						coreStylesheetElement &&
						foucScript
					)
				) {
					return;
				}

				resetStylesheetElement.id = RESET_STYLESHEET_NAME;
				editorStylesheetElement.id = EDITOR_STYLESHEET_NAME;
				coreStylesheetElement.id = VARIABLES_STYLESHEET_NAME;
				if (dynamicStylesheetElement) {
					dynamicStylesheetElement.id = DYNAMIC_STYLESHEET_NAME;
				}
				foucScript.id = FOUC_SCRIPT_NAME;

				resetStylesheetElement.innerHTML = cssReset;
				editorStylesheetElement.innerHTML = editorCss;
				coreStylesheetElement.innerHTML = variablesCss;
				if (dynamicStylesheetElement && dynamicCss !== undefined) {
					dynamicStylesheetElement.innerHTML = dynamicCss;
				}

				if (root_font_size === 10) {
					const rootFontSizeStylesheetElement = iframe.contentDocument?.createElement("style");

					if (rootFontSizeStylesheetElement) {
						rootFontSizeStylesheetElement.innerHTML = "html { font-size: 10px; }";
						head?.appendChild(rootFontSizeStylesheetElement);
					}
				}

				const editorStylesheet = head.querySelector(`#${EDITOR_STYLESHEET_NAME}`);

				if (editorStylesheet) {
					head.insertBefore(resetStylesheetElement, editorStylesheet);
					head.insertBefore(coreStylesheetElement, editorStylesheet);
				} else {
					head?.appendChild(resetStylesheetElement);
					head?.appendChild(coreStylesheetElement);
				}

				head?.appendChild(foucScript);

				if (!head.querySelector(`#${EDITOR_STYLESHEET_NAME}`) && editorCss) {
					head?.appendChild(editorStylesheetElement);
				}

				if (dynamicStylesheetElement) {
					head?.appendChild(dynamicStylesheetElement);
				}

				addElement({
					type,
					body,
					selectors,
				});

				setTimeout(() => setIsLoading(false), 40);
			};

			ref.current?.appendChild(iframe);
		});

		useEffect(() => {
			const iframe = ref.current?.querySelector("iframe");
			const body = iframe?.contentDocument?.querySelector("body");

			if (!(iframe && body)) {
				return;
			}

			[...body.querySelectorAll("*")].forEach((element) => element.remove());

			addElement({
				type,
				body,
				selectors,
			});
		}, [JSON.stringify(type), JSON.stringify(selectors)]);

		useEffect(() => {
			let timeoutId: ReturnType<typeof setTimeout> | null = null;

			const injectCss = () => {
				const iframe = ref.current?.querySelector("iframe");
				const head = iframe?.contentDocument?.querySelector("head");

				if (!(iframe && head)) {
					timeoutId = setTimeout(injectCss, 100);
					return;
				}

				let editorStylesheetElement = iframe?.contentDocument?.getElementById(EDITOR_STYLESHEET_NAME);

				if (!editorStylesheetElement) {
					editorStylesheetElement = iframe?.contentDocument?.createElement("style");

					const resetStylesheetElement = head?.querySelector(`#${RESET_STYLESHEET_NAME}`);

					if (!editorStylesheetElement) {
						return;
					}

					editorStylesheetElement.id = EDITOR_STYLESHEET_NAME;

					if (resetStylesheetElement) {
						head?.insertBefore(editorStylesheetElement, resetStylesheetElement.nextSibling);
					} else {
						head?.appendChild(editorStylesheetElement);
					}
				}

				if (!(iframe && head && editorStylesheetElement)) {
					return;
				}

				editorStylesheetElement.innerHTML = editorCss;
			};

			injectCss();

			return () => {
				if (timeoutId) clearTimeout(timeoutId);
			};
		}, [JSON.stringify(type), JSON.stringify(selectors), JSON.stringify(editorCss), isLoading]);

		useEffect(() => {
			if (dynamicCss === undefined) {
				return;
			}

			const iframe = ref.current?.querySelector("iframe");
			const head = iframe?.contentDocument?.querySelector("head");
			const dynamicStylesheetElement = head?.querySelector(`#${DYNAMIC_STYLESHEET_NAME}`);

			if (!dynamicStylesheetElement) {
				return;
			}

			dynamicStylesheetElement.innerHTML = dynamicCss || "";
		}, [JSON.stringify(dynamicCss)]);

		return (
			<>
				<div
					ref={ref}
					className={clsx("iframe-container full-width full-height", isDarkBackground && "is-dark")}
				/>

				{isLoading && (
					<div className="iframe-container-loader">
						<Loader />
					</div>
				)}
			</>
		);
	},
);
