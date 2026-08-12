interface Window {
	ADMINBRXC: any;
	coreframework: {
		nonce: string;
		rest_url: string;
		core_api_url: string;
	};
	wpApiSettings: {
		nonce: string;
		root: string;
	};
	core_framework_connector: {
		theme_mode: "light" | "dark" | "auto";
		oxygen_enable_variable_dropdown: boolean;
		oxygen_enable_dark_mode_preview: boolean;
		oxygen_variable_ui: boolean;
		oxygen_enable_variable_ui_auto_hide: boolean;
		oxygen_enable_variable_ui_hint: boolean;
		oxygen_apply_class_on_hover: boolean;
		oxygen_enable_variable_context_menu: boolean;
		oxygen_enable_unit_and_value_preview: boolean;
		bricks_enable_dark_mode_preview: boolean;
		bricks_enable_variable_dropdown: boolean;
		bricks_enable_variable_ui_auto_hide: boolean;
		bricks_enable_variable_ui_hint: boolean;
		bricks_variable_ui: boolean;
		bricks_enable_variable_context_menu: boolean;
		bricks_apply_class_on_hover: boolean;
		bricks_apply_variable_on_hover: boolean;
		bricks_bem_generator: boolean;
	};
}

enum ThemeClasses {
	DARK = "cf-theme-dark",
	LIGHT = "cf-theme-light",
}

interface Font {
	id: string;
	family: string;
	title: string;
	enable: boolean;
}

type Styles = Record<string, Record<string, string[]>>;

{
	const VUE = {
		vue: () => (document?.querySelector(".brx-body") as any)?.__vue_app__,
		config: () => (document.querySelector(".brx-body") as any)?.__vue_app__?.config,
		globalProperties: () =>
			(document.querySelector(".brx-body") as any)?.__vue_app__?.config?.globalProperties,
	};
	const IFRAME_ID = "bricks-builder-iframe";

	const DEFAULT_CORE_FRAMEWORK_CONNECTOR: Window["core_framework_connector"] = {
		theme_mode: "light",
		bricks_enable_dark_mode_preview: true,
		bricks_enable_variable_dropdown: true,
		bricks_variable_ui: true,
		bricks_enable_variable_ui_auto_hide: true,
		bricks_enable_variable_ui_hint: true,
		bricks_apply_class_on_hover: true,
		bricks_apply_variable_on_hover: true,
		bricks_enable_variable_context_menu: true,
		bricks_bem_generator: true,
		oxygen_enable_variable_dropdown: true,
		oxygen_enable_dark_mode_preview: true,
		oxygen_enable_variable_ui_auto_hide: true,
		oxygen_variable_ui: true,
		oxygen_enable_variable_context_menu: true,
		oxygen_enable_variable_ui_hint: true,
		oxygen_apply_class_on_hover: true,
		oxygen_enable_unit_and_value_preview: true,
	};

	const bricksInputs = {
		includedFields: [
			'div[data-control="number"]',
			// Bricks 2.2+ fields with native variable picker (exclude number controls already matched above)
			'div[data-control].has-variables:not([data-control="number"])',
			{
				selector: 'div[data-control="text"]',
				hasChild: [
					"#_cssTransition",
					"#_transformOrigin",
					"#_flexBasis",
					"#_overflow",
					"#_gridTemplateColumns",
					"#_gridTemplateRows",
					"#_gridAutoColumns",
					"#_gridAutoRows",
					"#_objectPosition",
					'[id^="raw-"]',
				],
			},
		],
		excludedFields: [
			".control-query",
			'div[data-controlkey="start"]',
			'div[data-controlkey="perPage"]',
			'div[data-controlkey="perMove"]',
			'div[data-controlkey="speed"]',
		],
	} as const;

	const observe = ({
		selector,
		callback,
		options,
	}: {
		selector: string;
		callback: MutationCallback;
		options?: MutationObserverInit;
	}): MutationObserver | undefined => {
		const observer = new MutationObserver(callback);
		const target = document.querySelector(selector);
		if (!target) {
			log(`Target not found for selector: ${selector}`);
			return;
		}

		const DEFAULT_OPTIONS = {
			childList: true,
			subtree: true,
		};

		observer.observe(target, {
			...DEFAULT_OPTIONS,
			...options,
		});
		return observer;
	};

	const getUniqueVariables = (styles: Styles): Styles => {
		const filteredStyles: Styles = {};

		for (const groupKey in styles) {
			const group = styles[groupKey];
			if (!group) continue;

			const seenVariables = new Set<string>();

			filteredStyles[groupKey] = Object.keys(group).reduce((acc: Record<string, string[]>, key) => {
				const value = group[key];

				if (key === "Contextual variables" && Array.isArray(value)) {
					acc[key] = value;
					value.forEach((v) => seenVariables.add(v));
				} else if (Array.isArray(value)) {
					acc[key] = value.filter((v) => !seenVariables.has(v) && seenVariables.add(v));
				}

				return acc;
			}, {});
		}

		return filteredStyles;
	};

	const getCoreFrameworkConnector = () =>
		window?.core_framework_connector ?? DEFAULT_CORE_FRAMEWORK_CONNECTOR;

	const assertOption = (feature: keyof typeof DEFAULT_CORE_FRAMEWORK_CONNECTOR) =>
		getCoreFrameworkConnector()?.[feature] ?? false;

	// SVG uses inline styles instead of gradient IDs to avoid duplicate ID conflicts
	const coreIconSvg = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 31.82 24.84"
			width="14"
			height="14"
		>
			<rect x="18.78" y="10.68" width="13.03" height="7.07" style="fill:#fa5e5e;"></rect>
			<path d="m12.42,0C5.56,0,0,5.56,0,12.42h0c0,6.86,5.56,12.42,12.42,12.42h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0c0-2.95,2.39-5.35,5.35-5.35h19.4V0H12.42Z" style="fill:#7d87fc;"></path>
			<path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" style="fill:#424ae1;"></path>
		</svg>
	`;

	const log = (message: string, ...args: unknown[]) => console.log("[Core Framework]", message, ...args);

	const getChild = (children: ChildNode[], data: any): ChildNode | undefined => {
		return children.find((child) => child.textContent?.trim().includes(data.family));
	};

	const addThemeToggleButton = () => {
		if (!assertOption("bricks_enable_dark_mode_preview")) {
			return;
		}

		const themeMode = window?.core_framework_connector?.theme_mode ?? "light";
		const leftPanel =
			document.querySelector("#bricks-toolbar .group-wrapper.left") ||
			document.querySelector("#bricks-toolbar .group-wrapper.start");
		const THEME_TOGGLE_BUTTON_CLASS = "cf-theme-toggle-button";

		// Sun icon (shown in light mode — click to switch to dark)
		const sunIcon = `<svg class="cf-theme-icon cf-theme-icon--sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`;

		// Moon icon (shown in dark mode — click to switch to light)
		const moonIcon = `<svg class="cf-theme-icon cf-theme-icon--moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>`;

		// Small CF badge
		const cfBadge = `<span class="cf-theme-badge">${coreIconSvg}</span>`;

		if (!leftPanel) {
			log("Left panel not found");
			return;
		}

		const liButton =
			leftPanel.querySelector("li.settings") ||
			leftPanel.querySelector("li.pages") ||
			leftPanel.querySelector("li:not(.logo)");
		const toggleButton = liButton?.cloneNode(true) as HTMLLIElement;

		if (!toggleButton) {
			log("Button not found");
			return;
		}

		toggleButton.classList.remove("settings");
		toggleButton.classList.remove("pages");
		toggleButton.classList.add("theme-toggle", "cf-theme-toggle");
		toggleButton.setAttribute("data-balloon", "Toggle Core Framework theme");

		const svg = toggleButton.querySelector("svg");
		svg?.remove();

		const span = toggleButton.querySelector("span");

		leftPanel.appendChild(toggleButton);

		// Set initial icon content (sun/moon + CF badge)
		const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
		const isDarkInitial = savedTheme === "dark";

		if (span) {
			span.innerHTML = sunIcon + moonIcon + cfBadge;
			const sunEl = span.querySelector(".cf-theme-icon--sun") as HTMLElement;
			const moonEl = span.querySelector(".cf-theme-icon--moon") as HTMLElement;
			if (sunEl) sunEl.style.display = isDarkInitial ? "none" : "block";
			if (moonEl) moonEl.style.display = isDarkInitial ? "block" : "none";
		}

		// Inject CF theme toggle styles
		const cfToggleStyle = document.createElement("style");
		cfToggleStyle.appendChild(
			document.createTextNode(`
			.cf-theme-toggle {
				position: relative;
			}
			.cf-theme-toggle span {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.cf-theme-icon {
				width: 18px;
				height: 18px;
			}
			.cf-theme-badge {
				position: absolute;
				bottom: -3px;
				right: -3px;
				width: 10px;
				height: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				pointer-events: none;
				opacity: 0.85;
			}
			.cf-theme-badge svg {
				width: 10px !important;
				height: 10px !important;
			}
		`),
		);
		document.head.appendChild(cfToggleStyle);

		const getSystemThemeClass = (): ThemeClasses =>
			window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
				? ThemeClasses.DARK
				: ThemeClasses.LIGHT;

		const updateToggleIcons = (isDark: boolean) => {
			const sunEl = toggleButton.querySelector(".cf-theme-icon--sun") as HTMLElement;
			const moonEl = toggleButton.querySelector(".cf-theme-icon--moon") as HTMLElement;
			if (sunEl) sunEl.style.display = isDark ? "none" : "block";
			if (moonEl) moonEl.style.display = isDark ? "block" : "none";
		};

		(document.getElementById(IFRAME_ID) as HTMLIFrameElement)?.addEventListener("load", () =>
			setTimeout(() => {
				const iframeDocument = (document.getElementById(IFRAME_ID) as HTMLIFrameElement)?.contentDocument;
				const iframeHtml = iframeDocument?.querySelector("html");
				const html = document.querySelector("html") as HTMLHtmlElement;

				if (iframeDocument && iframeHtml) {
					iframeHtml.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
					html?.classList?.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);

					const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
					const defaultTheme = String(themeMode === "auto" ? getSystemThemeClass() : `cf-theme-${themeMode}`);

					iframeHtml.classList.add(savedTheme ? `cf-theme-${savedTheme}` : defaultTheme);
					html?.classList?.add(savedTheme ? `cf-theme-${savedTheme}` : defaultTheme);
				}

				updateToggleIcons(html?.classList?.contains(ThemeClasses.DARK) ?? false);

				if (!iframeDocument) {
					log("Iframe document not found");
					return;
				}

				[...iframeDocument.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)].forEach((button) => {
					button.classList.add(
						html?.classList?.contains(ThemeClasses.DARK) ? ThemeClasses.LIGHT : ThemeClasses.DARK,
					);
				});
			}, 5),
		);

		toggleButton.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();

			const iframeDocument = (document.getElementById(IFRAME_ID) as HTMLIFrameElement)?.contentDocument;

			if (!iframeDocument) {
				log("Iframe document not found");
				return;
			}

			const iframeHtml = iframeDocument.querySelector("html");
			const html = document.querySelector("html") as HTMLHtmlElement | null;

			if (!iframeHtml) {
				log("Iframe html not found");
				return;
			}

			iframeHtml.classList.toggle(ThemeClasses.DARK);
			iframeHtml.classList.toggle(ThemeClasses.LIGHT);
			html?.classList?.toggle(ThemeClasses.DARK);
			html?.classList?.toggle(ThemeClasses.LIGHT);

			const isDark = iframeHtml.classList.contains(ThemeClasses.DARK);
			updateToggleIcons(isDark);

			window?.localStorage?.setItem("cf-theme", isDark ? "dark" : "light");

			[...iframeDocument.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)].forEach((button) => {
				const classes = [...button.classList].filter(
					(c) => ![ThemeClasses.DARK, ThemeClasses.LIGHT].includes(c as ThemeClasses),
				);

				classes.push(isDark ? ThemeClasses.LIGHT : ThemeClasses.DARK);
				button.className = classes.join(" ");
			});
		});
	};

	const applyClassOnHover = () => {
		try {
			const globalProperties = VUE.globalProperties();

			if (!globalProperties?.$_state || globalProperties.$_state.activePanel !== "element") {
				return;
			}

			const activeElement = globalProperties.$_state?.activeElement;
			const activeElementId = activeElement?.id;

			if (!activeElementId) {
				return;
			}

			const iframeWindow = (document.getElementById(IFRAME_ID) as HTMLIFrameElement)?.contentWindow;

			if (!iframeWindow) {
				return;
			}

			const activeElementIdSelector = activeElement.settings._cssId
				? `#${activeElement.settings._cssId}`
				: `#brxe-${activeElementId}`;
			const activeElementSelector = iframeWindow.document.querySelector(activeElementIdSelector);

			if (!activeElementSelector) {
				return;
			}

			const classItems = document.querySelectorAll<HTMLElement>(
				"div.bricks-control-popup li[data-class-id]",
			);

			if (classItems.length < 1) {
				return;
			}

			classItems.forEach((singleClass) => {
				const name = singleClass.querySelector("span.name")?.textContent;

				if (!name) {
					return;
				}

				const className = name.substring(1);

				singleClass.onmouseenter = () => {
					activeElementSelector.classList.add(className);
				};

				singleClass.onmouseleave = () => {
					activeElementSelector.classList.remove(className);
				};

				singleClass.onclick = () => {
					activeElementSelector.classList.remove(className);
				};
			});
		} catch (e) {
			log("applyClassOnHover error:", e);
		}
	};

	const initApplyClassOnHover = () => {
		if (!assertOption("bricks_apply_class_on_hover")) {
			return;
		}

		const panel = document.querySelector("#bricks-panel-inner");

		if (!panel) {
			log("Panel not found, can't initialize preview of classes on hover");
			return;
		}

		const observer = new MutationObserver(applyClassOnHover);

		observer.observe(panel, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ["class"],
		});
	};

	// Preview variables on hover (pre-Bricks 2.2 picker — replaces native dropdown with custom one)
	const isCustomCssVariablePickerControl = (element: Element | null | undefined): boolean => {
		if (!element) {
			return false;
		}

		let control = element.closest("[data-controlkey], [data-control]") as HTMLElement | null;

		while (control) {
			const controlKey = control.dataset.controlkey?.toLowerCase() ?? "";
			const controlId = control.id.toLowerCase();

			if (controlKey.includes("csscustom") || controlId.includes("csscustom")) {
				return true;
			}

			if (control.querySelector("[id='_cssCustom'], [id='raw-_cssCustom']")) {
				return true;
			}

			const label = control.querySelector("label")?.textContent?.trim().toLowerCase();
			if (label === "custom css") {
				return true;
			}

			control = control.parentElement?.closest("[data-controlkey], [data-control]") as HTMLElement | null;
		}

		return false;
	};

	const getVariablePickerButton = (element: Element | null | undefined): Element | null => {
		return element?.closest(".options-wrapper")?.parentElement?.querySelector(".variable-picker-button")
			?? document.querySelector(".variable-picker-button.open");
	};

	const isCustomCssVariablePicker = (
		element: Element | null | undefined,
		input?: HTMLInputElement | null,
	): boolean => {
		const button = getVariablePickerButton(element);
		return isCustomCssVariablePickerControl(button)
			|| isCustomCssVariablePickerControl(input)
			|| isCustomCssVariablePickerControl(element);
	};

	const applyVariableOnHover = () => {
		const globalProperties = VUE.globalProperties();
		if (globalProperties.$_state.activePanel !== "element") return;
		if (!globalProperties.$_state?.activeElement?.id) return;

		const wrapper = document.querySelector(".expand .options-wrapper") as HTMLDivElement | null;
		const searchInput = wrapper?.querySelector(".searchable") as HTMLInputElement | null;
		const dropdown = wrapper?.querySelector(".dropdown") as HTMLDivElement | null;
		const hoveredItems = dropdown?.querySelectorAll(
			".variable-picker-item:not(.title)",
		) as NodeListOf<HTMLLIElement>;
		const focusedInput = document.querySelector(".variable-picker-button.open")
			?.previousElementSibling as HTMLInputElement | null;

		if (!focusedInput || !hoveredItems?.length || !wrapper || !dropdown || !searchInput) return;
		if (isCustomCssVariablePicker(wrapper, focusedInput)) return;

		const valueToVar = (value: string) => `var(--${value})`;

		const triggerPreview = (value: string) => {
			focusedInput.value = value;
			focusedInput.dispatchEvent(new Event("input"));
			focusedInput.focus();
		};

		let tempValue = focusedInput.value ?? " ";

		// Extract variable data from native dropdown, then replace it
		const variables: Record<string, string>[] = [];
		hoveredItems.forEach((item) => {
			const name = item.querySelector("span:first-of-type")?.textContent ?? "";
			const content = item.querySelector("span.option-value")?.textContent ?? "";
			variables.push({ [name]: content });
		});
		dropdown.remove();

		// Build custom dropdown
		const customDropdown = document.createElement("ul");
		customDropdown.classList.add("custom-dropdown");
		customDropdown.setAttribute(
			"style",
			`
			max-height: calc(32px * 10); overflow: hidden; overflow-y: auto;
			position: relative; scrollbar-color: rgba(0,0,0,.4) rgba(0,0,0,.2); scrollbar-width: thin;
		`,
		);

		const insertItems = (items: Record<string, string>[], container: HTMLUListElement) => {
			items.forEach((variable) => {
				const [key, value] = Object.entries(variable)[0] || [];
				container.insertAdjacentHTML(
					"beforeend",
					`
					<li class="variable-picker-item">
						<span>${key}</span>
						<span class="option-value">${value}</span>
					</li>
				`,
				);
			});
			container.querySelectorAll<HTMLLIElement>(".variable-picker-item").forEach((item) => {
				item.addEventListener("mouseenter", () => {
					const content = item.querySelector("span:first-of-type")?.textContent ?? "";
					if (content) triggerPreview(valueToVar(content));
				});
				item.addEventListener("click", () => {
					const content = item.querySelector("span:first-of-type")?.textContent ?? "";
					if (!content) return;
					tempValue = valueToVar(content);
					focusedInput.value = tempValue;
					focusedInput.click();
				});
			});
		};

		insertItems(variables, customDropdown);
		wrapper.appendChild(customDropdown);

		searchInput.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
		});
		searchInput.addEventListener("input", () => {
			const query = searchInput.value.toLowerCase();
			const filtered = variables.filter((v) => (Object.keys(v)[0]?.toLowerCase() ?? "").includes(query));
			customDropdown.innerHTML = "";
			insertItems(filtered, customDropdown);
		});

		// IntersectionObserver to re-open the picker button after mouseleave resets the value
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !entry.target.classList.contains("open")) {
						(entry.target as HTMLElement).click();
					}
				});
			},
			{ root: focusedInput.parentElement },
		);

		wrapper.addEventListener("mouseleave", () => {
			triggerPreview(tempValue);
			observer.observe(focusedInput.nextElementSibling as HTMLDivElement);
		});

		observer.disconnect();
	};

	// Bricks 2.2 native variable picker — adds hover preview + click-to-apply
	const initBricks22VariablePicker = () => {
		const items = document.querySelectorAll(".variable-picker-item:not(.cf-b22-processed):not(.title)");
		if (!items.length) return;

		let originalValue = "";
		let isHovering = false;
		let activeInput: HTMLInputElement | null = null;

		const resolveInput = (item: Element): HTMLInputElement | null => {
			const btn = getVariablePickerButton(item);
			return btn?.closest("[data-control]")?.querySelector("input") as HTMLInputElement | null;
		};

		const setInput = (input: HTMLInputElement, value: string, commit = false) => {
			input.value = value;
			input.dispatchEvent(new Event("input", { bubbles: true }));
			if (commit) input.dispatchEvent(new Event("change", { bubbles: true }));
		};

		items.forEach((item) => {
			item.classList.add("cf-b22-processed");
			const varName = item.querySelector("span:first-of-type")?.textContent;
			if (!varName) return;
			const varValue = `var(--${varName})`;

			item.addEventListener("mouseenter", () => {
				const input = resolveInput(item);
				if (!input) return;
				if (isCustomCssVariablePicker(item, input)) return;
				if (!isHovering) {
					originalValue = input.value;
					activeInput = input;
					isHovering = true;
				}
				setInput(input, varValue);
			});

			item.addEventListener("click", () => {
				const input = activeInput ?? resolveInput(item);
				if (!input) return;
				if (isCustomCssVariablePicker(item, input)) return;
				isHovering = false;
				setInput(input, varValue, true);
				activeInput = null;
			});
		});

		const wrapper = items[0]?.closest(".options-wrapper") ?? items[0]?.closest("ul")?.parentElement;
		if (wrapper && !wrapper.classList.contains("cf-b22-wrapper-processed")) {
			wrapper.classList.add("cf-b22-wrapper-processed");
			wrapper.addEventListener("mouseleave", () => {
				if (isHovering && activeInput) {
					setInput(activeInput, originalValue);
					isHovering = false;
					activeInput = null;
				}
			});
		}
	};

	const initApplyVariableOnHover = () => {
		if (!assertOption("bricks_apply_variable_on_hover")) {
			return;
		}

		const innerPanel = document.querySelector("#bricks-panel-inner:not(div.bricks-control-popup *)");

		if (!innerPanel) {
			log("Inner panel not found, can't initialize preview of variables on hover");
			return;
		}

		let bricks22Pending = false;
		const BRICKS_22_THROTTLE = 100;

		const observer = new MutationObserver(() => {
			applyVariableOnHover();

			// Throttle Bricks 2.2 picker init — it does querySelectorAll on each call
			if (!bricks22Pending) {
				bricks22Pending = true;
				setTimeout(() => {
					initBricks22VariablePicker();
					bricks22Pending = false;
				}, BRICKS_22_THROTTLE);
			}
		});
		observer.observe(innerPanel, {
			subtree: true,
			childList: true,
			attributes: true,
		});
	};

	class VariableAutoComplete {
		variables: string[] = [];
		variablesGroups: Record<string, string[]> = {};
		colorVariables: string[] = [];
		previewOnHover: boolean = true;

		boundOnInputFocus: (e: FocusEvent) => void;

		constructor() {
			this.init();
			this.boundOnInputFocus = this.onInputFocus.bind(this);
		}

		async init() {
			if (!assertOption("bricks_enable_variable_dropdown")) {
				return;
			}

			if (window?.ADMINBRXC?.globalSettings?.classFeatures?.includes("autocomplete-variable")) {
				log(
					"Autocomplete variable feature already enabled in Advanced Themer. Only one instance of this feature can be enabled at a time.",
				);
				return;
			}

			const didLoadVariables = await this.getVariables();

			if (!didLoadVariables) {
				return;
			}

			const innerPanel = document.querySelector("#bricks-panel-inner");

			if (!innerPanel) {
				return;
			}

			const TIMEOUT = 100;
			let isObserverRunning = false;

			const observer = new MutationObserver(() => {
				if (isObserverRunning) {
					return;
				}

				isObserverRunning = true;

				this.setVariableAutocomplete();

				setTimeout(() => {
					isObserverRunning = false;
				}, TIMEOUT);
			});

			observer.observe(innerPanel, {
				subtree: true,
				childList: true,
			});
		}

		autoComplete({
			input,
			variables,
			type,
			ignorePreview = false,
		}: {
			input: HTMLInputElement;
			variables: string[];
			type: string;
			ignorePreview?: boolean;
		}) {
			const self = this;

			let currentFocus = 0;
			if (input.dataset.autocomplete === "true") return;

			function addActive(elements: HTMLElement[]) {
				if (!elements.length) {
					return false;
				}

				removeActive(elements);

				if (currentFocus >= elements.length) {
					currentFocus = 0;
				}
				if (currentFocus < 0) {
					currentFocus = elements.length - 1;
				}

				elements[currentFocus]?.classList.add("selected");

				const el = elements[currentFocus];
				el?.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "start",
				});
			}
			function removeActive(elements: HTMLElement[]) {
				for (const element of elements) {
					element.classList.remove("selected");
				}
			}

			function closeAllLists(element?: HTMLElement, tab?: any) {
				const x = document.getElementsByClassName("autocomplete-items");
				for (const element2 of x) {
					if (tab || (element != element2 && element !== input)) {
						element2?.parentNode?.removeChild(element2);
					}
				}
			}

			input.setAttribute("data-autocomplete", "true");

			function onKeyUp(e: KeyboardEvent) {
				if (e.metaKey || e.altKey || e.key === "Meta" || e.key === "Alt") {
					return;
				}

				if (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13) {
					return;
				}

				let a;
				let b;
				let i;
				let j;
				let ul;
				const input = e.target as HTMLInputElement;
				const val = input.value;

				closeAllLists();
				if (!val) {
					return false;
				}
				currentFocus = -1;

				a = document.createElement("div");
				a.setAttribute("id", `autocomplete-list`);
				a.setAttribute("class", "autocomplete-items bricks-control-popup bottom cf-variable-autocomplete");
				a.style.gap = "0px";

				const displayHint =
					assertOption("bricks_enable_variable_ui_hint") && assertOption("bricks_variable_ui");

				if (displayHint) {
					const hint = document.createElement("div");
					hint.classList.add("cf-variable-dropdown-hint");
					hint.classList.add("variable-dropdown-item");
					hint.textContent = `Right-click to open Variable UI`;
					hint.style.padding = "4px 10px";
					hint.style.color = "var(var(--cf-ui--text), white)";
					hint.style.opacity = "0.7";
					hint.style.fontSize = "12px";

					a.appendChild(hint);
				}

				input?.parentNode?.appendChild(a);
				ul = document.createElement("ul");
				a.appendChild(ul);
				for (i = 0, j = 0; i < variables.length; i++) {
					const variable = variables[i];
					if (variable?.toUpperCase().includes(val.toUpperCase())) {
						j++;
						b = document.createElement("li");
						const span = document.createElement("span");
						span.textContent = variable;
						b.appendChild(span);
						const hiddenInput = document.createElement("input");
						hiddenInput.type = "hidden";
						hiddenInput.value = variable;
						b.appendChild(hiddenInput);
						b.addEventListener("click", function (e) {
							input.value = String(this?.getElementsByTagName("input")?.[0]?.value);
							const event = new Event("input", {
								bubbles: true,
								cancelable: true,
							});

							input.dispatchEvent(event);
							closeAllLists();
						});
						if (self.previewOnHover === true && ignorePreview === false) {
							let isMouseMoving = false;
							b.addEventListener("mousemove", function (e) {
								isMouseMoving = true;
							});
							b.addEventListener("mouseleave", function (e) {
								setTimeout(() => {
									input.value = input.dataset.autocompleteInitial ?? "";
									const event = new Event("input", {
										bubbles: false,
										cancelable: true,
									});

									input.dispatchEvent(event);
									input.removeAttribute("data-autocomplete-initial");
								}, 0);
							});
							b.addEventListener("mouseenter", function (e) {
								setTimeout(() => {
									input.setAttribute("data-autocomplete-initial", input.value);

									if (isMouseMoving === false) {
										return;
									}

									input.value = String(this.getElementsByTagName("input")?.[0]?.value);

									const event = new Event("input", {
										bubbles: false,
										cancelable: true,
									});

									input.dispatchEvent(event);
									isMouseMoving = false;
								}, 0);
							});
						}

						ul.appendChild(b);
					}
				}
				if (j === 0) {
					closeAllLists();
				}
			}

			input.removeEventListener("keyup", onKeyUp);
			input.addEventListener("keyup", onKeyUp);

			const onKeyDown = (e: KeyboardEvent) => {
				const autoCompleteList = document.getElementById(`${input.id}autocomplete-list`);

				if (!autoCompleteList) {
					return;
				}

				const autoCompleteListElements = [...autoCompleteList.getElementsByTagName("li")];

				switch (e.key) {
					case "ArrowDown": {
						e.preventDefault();

						const hasMoreItems =
							autoCompleteListElements.length > 0 && autoCompleteListElements.length > currentFocus + 1;

						if (!hasMoreItems) {
							return;
						}

						currentFocus++;

						addActive(autoCompleteListElements);

						const active = autoCompleteListElements.find((el) => el.classList.contains("selected"));
						const value = (active?.querySelector('input[type="hidden"]') as HTMLInputElement).value;

						input.value = value;

						const event = new Event("input", {
							bubbles: false,
							cancelable: true,
						});

						input.dispatchEvent(event);

						return;
					}

					case "ArrowUp": {
						e.preventDefault();

						const hasMoreItems = autoCompleteListElements.length && currentFocus - 1 >= 0;

						if (!hasMoreItems) {
							return;
						}

						currentFocus--;

						addActive(autoCompleteListElements);

						const active = autoCompleteListElements.find((el) => el.classList.contains("selected"));
						const value = (active?.querySelector('input[type="hidden"]') as HTMLInputElement)?.value;

						input.value = value;

						const event = new Event("input", {
							bubbles: false,
							cancelable: true,
						});

						input.dispatchEvent(event);

						return;
					}

					case "Enter": {
						e.preventDefault();

						if (currentFocus > -1 && autoCompleteListElements.length) {
							autoCompleteListElements?.[currentFocus as number]?.click();
						}

						return;
					}

					case "Escape":
					case "Tab": {
						closeAllLists();
					}
				}
			};

			input.removeEventListener("keydown", onKeyDown);
			input.addEventListener("keydown", onKeyDown);

			// MED-03: onDocumentClick is declared inside the closure on each call, so
			// removeEventListener cannot match the previous instance — listeners accumulate.
			// This class is currently dead code (kept commented out in main()), so left as-is.
			const onDocumentClick = (e: MouseEvent) => {
				if (e.target === input) {
					return;
				}

				closeAllLists();
			};

			document.removeEventListener("click", onDocumentClick);
			document.addEventListener("click", onDocumentClick);
		}

		sortVariables(input: HTMLInputElement): string[] {
			const control = input.closest("[data-controlkey]") as HTMLDivElement | null;
			const dataControlKey = control?.dataset.controlkey?.toLocaleLowerCase();
			const isFontSize = ["typography", "font"].some((key) => dataControlKey?.includes(key));
			const isSpacing = ["padding", "margin", "gap", "width", "height"].some((key) =>
				dataControlKey?.includes(key),
			);
			const isColorPicker = input.parentElement?.parentElement?.classList.contains("color-input");

			let output: string[] = [];

			for (const [key, value] of Object.entries(this.variablesGroups)) {
				if (isColorPicker && key === "colorStyles") {
					output = [...value];
					break;
				}

				if (key === "colorStyles") {
					continue;
				}

				if (isFontSize && key === "typographyStyles") {
					output.unshift(...value);
					continue;
				}

				if (!isFontSize && key === "typographyStyles") {
					output.push(...value);
					continue;
				}

				if (isSpacing && key === "spacingStyles") {
					output.unshift(...value);
					continue;
				}

				if (!isSpacing && key === "spacingStyles") {
					output.push(...value);
					continue;
				}

				output.push(...value);
			}

			output = output.map((v) => `var(--${v})`);
			this.variables = output;
			return output;
		}

		onInputFocus(
			e: FocusEvent & {
				metaKey?: boolean;
				altKey?: boolean;
			},
		) {
			if (!e.isTrusted || e?.metaKey || e?.altKey) {
				return;
			}

			const input = e.target as HTMLInputElement | null;

			if (!input) {
				return;
			}

			const variables = this.sortVariables(input);
			this.autoComplete({
				input,
				variables,
				type: "style",
			});
		}

		setVariableAutocomplete() {
			setTimeout(() => {
				bricksInputs.includedFields.forEach((field) => {
					let elements;
					if (typeof field === "string") {
						elements = Array.from(document.querySelectorAll(field));
					} else {
						const filteredElements = Array.from(document.querySelectorAll(field.selector));

						elements = filteredElements.filter((el) =>
							field.hasChild.some((child) => el.querySelector(child)),
						);
					}

					const wrappers = elements.filter(
						(item) =>
							!(item?.parentNode as HTMLElement | null)?.closest?.(bricksInputs?.excludedFields?.join(",")) &&
							!item.classList.contains("autocomplete-active"),
					);

					wrappers.forEach((wrapper) => {
						wrapper.classList.add("autocomplete-active");

						const input = wrapper.querySelector("input[type='text']") as HTMLInputElement | null;
						input?.removeEventListener("focus", this.boundOnInputFocus);
						input?.addEventListener("focus", this.boundOnInputFocus);
					});
				});
			}, 100);
		}

		async getVariables(): Promise<boolean> {
			window.coreframework = {
				nonce: window.wpApiSettings.nonce,
				rest_url: window.wpApiSettings.root,
				core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
			};

			try {
				const res = await fetch(`${window.coreframework.core_api_url}get-variables?type=bricks_dropdown`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"X-WP-Nonce": window.coreframework.nonce,
					},
				});

				if (res.status !== 200) {
					log("Failed to load variables.");
					return false;
				}

				const json = (await res.json()) as {
					variables: Record<string, string[]>;
				};

				if (!json?.variables) {
					log("No variables found. Please save changes again in the Core Framework plugin.");
					return false;
				}

				this.variablesGroups = json.variables;
				this.colorVariables = (this.variablesGroups.colorStyles ?? []).map((v) => `var(--${v})`);
				return true;
			} catch (e) {
				log("Failed to load variables.");
				return false;
			}
		}
	}

	type ColorSystem = {
		groups: {
			name: string;
			colors: {
				name: string;
				value: string;
				isDarkMode?: boolean;
				darkValue?: string;
				format?: string;
				transparent?: boolean;
				transparentVariables?: (string | number)[];
				isShades?: boolean;
				shades?: {
					name: string;
					value: string;
				}[];
				darkShades?: {
					name: string;
					value: string;
				}[];
				shadesNumber?: number;
				isTints?: boolean;
				tints?: {
					name: string;
					value: string;
				}[];
				darkTints?: {
					name: string;
					value: string;
				}[];
				tintsNumber?: number;
				gen?: string[];
				id: string;
			}[];
			id: string;
			isDisabled?: boolean;
		}[];
	};

	type TypographyScale = {
		groups: {
			id: string;
			name: string;
			namingConvention: string;
			mode: string;
			steps: string;
			manualSizes: {
				css: string;
				name: string;
			}[];
			semanticVariables?: {
				declarations: {
					property: string;
					value: string;
				}[];
			}[];
		}[];
		isDisabled?: boolean;
	};

	type SpacingScale = {
		groups: {
			id: string;
			name: string;
			namingConvention: string;
			mode: string;
			steps: string;
			manualSizes: {
				css: string;
				name: string;
			}[];
			semanticVariables?: {
				declarations: {
					property: string;
					value: string;
				}[];
			}[];
		}[];
		isDisabled?: boolean;
	};

	class VariableUi {
		variables: Record<string, Record<string, string[]>> = {};
		colorSystemData: ColorSystem | null = null;
		variablePrefix = "";
		fluid_typography_naming_convention: TypographyScale | null = null;
		fluid_spacing_naming_convention: SpacingScale | null = null;
		recentColorPickerTarget: HTMLInputElement | null = null;
		recentVariableSelectionTimestamp: number = 0;

		HOVER_VARIABLE_PREVIEW_TIMEOUT = 1000;

		instance: HTMLElement | null = null;
		focusedInput: HTMLInputElement | null = null;
		tempInputValue: string | null = null;
		isOpen: boolean = false;
		stylesGroupsLabelMap: Record<string, string> = {
			colorStyles: "Colors",
			typographyStyles: "Typography",
			spacingStyles: "Spacing",
			layoutsStyles: "Layouts",
			designStyles: "Design",
			componentsStyles: "Components",
			otherStyles: "Other",
		};
		logoData =
			"data:image/png;base64,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";
		boundOnInputClick: (e: MouseEvent) => void;
		boundOnFocusCallback: (e: FocusEvent) => void;
		private handleDrag: ((e: MouseEvent) => void) | null = null;
		private endDragging: ((e: MouseEvent) => void) | null = null;
		private boundOnKeyDown: ((e: KeyboardEvent) => void) | null = null;
		private boundOnClick: ((e: MouseEvent) => void) | null = null;
		private innerPanelObserver: MutationObserver | null = null;

		constructor() {
			this.init();

			this.boundOnInputClick = this.onInputClick.bind(this);
			this.boundOnFocusCallback = this.onFocusCallback.bind(this);
		}

		getActiveElement(): HTMLDivElement | null {
			const globalProperties = VUE.globalProperties();

			if (globalProperties.$_state.activePanel !== "element") {
				return null;
			}

			const activeElementId = globalProperties.$_state?.activeElement.id;
			const iframe = globalProperties.$_getIframeDoc();
			return iframe?.getElementById(`brxe-${activeElementId}`);
		}

		// Apply value to input — uses bubbling events for Bricks 2.2 compatibility (harmless on older versions)
		applyValueToInput(value: string, commit = false) {
			if (!this.focusedInput) return;
			this.focusedInput.value = value;
			this.focusedInput.dispatchEvent(new Event("input", { bubbles: true }));
			if (commit) this.focusedInput.dispatchEvent(new Event("change", { bubbles: true }));
			this.focusedInput.focus();
		}

		async init() {
			if (!assertOption("bricks_variable_ui")) {
				return;
			}

			const didLoadVariables = await this.getVariables();

			if (!didLoadVariables) {
				return;
			}

			const innerPanelId = "bricks-panel-inner";
			const innerPanel = document.getElementById(innerPanelId);

			if (!innerPanel) {
				return;
			}

			const TIMEOUT = 100;
			let isObserverRunning = false;

			this.innerPanelObserver =
				observe({
					selector: `#${innerPanelId}`,
					options: {
						subtree: true,
						childList: true,
					},
					callback: () => {
						if (isObserverRunning) {
							return;
						}

						isObserverRunning = true;
						this.addTriggers();

						setTimeout(() => {
							isObserverRunning = false;
						}, TIMEOUT);
					},
				}) ?? null;

			this.createInstance();
			this.addTriggers();
			this.addListeners();
		}

		getPrefixedVariableName(variable: string) {
			return variable.startsWith(this.variablePrefix) ? variable : `${this.variablePrefix}${variable}`;
		}

		createVarButton({
			variable,
			label,
			color,
			transparent,
		}: {
			variable: string;
			label?: string;
			color?: string;
			transparent?: number;
		}): HTMLButtonElement {
			const button = document.createElement("button");
			button.classList.add("cf-variable-ui-list-item");
			button.dataset.cftooltip = `var(--${variable})`;
			button.textContent = label ?? variable;

			if (color) {
				const span = document.createElement("span");
				span.style.backgroundColor = color;
				if (transparent) {
					span.style.opacity = (transparent / 100).toString();
				}
				button.prepend(span);
			}

			button.addEventListener("click", () => {
				if (!this.focusedInput) {
					return;
				}

				const variableParsed = variable.startsWith("var(--") ? variable : `var(--${variable})`;

				this.applyValueToInput(variableParsed, true);
				this.tempInputValue = variableParsed;
				this.recentVariableSelectionTimestamp = performance.now();

				if (assertOption("bricks_enable_variable_ui_auto_hide")) {
					this.close();
				}
			});

			button.addEventListener("mouseenter", () => {
				const timeElapsedBetweenSelections = performance.now() - this.recentVariableSelectionTimestamp;
				const isInCoolDown = timeElapsedBetweenSelections < this.HOVER_VARIABLE_PREVIEW_TIMEOUT;

				if (isInCoolDown) {
					return;
				}

				if (!this.focusedInput) {
					return;
				}

				const variableParsed = variable.startsWith("var(--") ? variable : `var(--${variable})`;

				this.applyValueToInput(variableParsed);
			});

			button.addEventListener("mouseleave", () => {
				if (!this.focusedInput || this.tempInputValue === null) {
					return;
				}

				this.applyValueToInput(this.tempInputValue);
			});

			return button;
		}

		createVarWithValueButton({
			variable,
			value,
			label,
			color,
			transparent,
		}: {
			variable: string;
			value: string;
			label?: string;
			color?: string;
			transparent?: number;
		}): HTMLButtonElement {
			const button = document.createElement("button");
			button.classList.add("cf-variable-ui-list-item");
			button.dataset.cftooltip = variable;
			button.textContent = label ?? variable;

			if (color) {
				const span = document.createElement("span");
				span.style.backgroundColor = color;
				if (transparent) {
					span.style.opacity = (transparent / 100).toString();
				}
				button.prepend(span);
			}

			button.addEventListener("click", () => {
				if (!this.focusedInput) {
					return;
				}

				this.applyValueToInput(value, true);
				this.tempInputValue = value;
				this.recentVariableSelectionTimestamp = performance.now();

				if (assertOption("bricks_enable_variable_ui_auto_hide")) {
					this.close();
				}
			});

			button.addEventListener("mouseenter", () => {
				const timeElapsedBetweenSelections = performance.now() - this.recentVariableSelectionTimestamp;
				const isInCoolDown = timeElapsedBetweenSelections < this.HOVER_VARIABLE_PREVIEW_TIMEOUT;

				if (isInCoolDown) {
					return;
				}

				if (!this.focusedInput) {
					return;
				}

				this.applyValueToInput(value);
			});

			button.addEventListener("mouseleave", () => {
				if (!this.focusedInput || this.tempInputValue === null) {
					return;
				}

				this.applyValueToInput(this.tempInputValue);
			});

			return button;
		}

		// Maps color picker target to the CSS property it controls
		private readonly COLOR_STYLE_MAP = [
			{ property: "color", control: "typography" },
			{ property: "backgroundColor", control: "background" },
			{ property: "borderColor", control: "border" },
		] as const;

		// Applies/clears inline color styles on the active element based on which color control triggered the action
		applyColorPreview(value: string, pickerTarget?: Element | null) {
			const activeElement = this.getActiveElement();
			if (!activeElement) return;
			for (const { property, control } of this.COLOR_STYLE_MAP) {
				if (pickerTarget?.closest(`[data-control="${control}"]`)) {
					activeElement.style[property] = value;
				}
			}
		}

		createColorButton({
			variable,
			color,
			id,
			darkColor,
			transparent,
		}: {
			variable: string;
			color: string;
			id: string;
			darkColor?: string;
			transparent?: number;
		}): HTMLButtonElement {
			variable = this.getPrefixedVariableName(variable);

			const button = document.createElement("button");
			button.dataset.cftooltip = `var(--${variable})`;
			button.classList.add("cf-variable-ui-list-item-color");

			if (color) {
				if (transparent !== undefined) {
					button.style.padding = "0";
					const div = document.createElement("div");
					div.style.setProperty("--cf-variable-ui-color", color);
					div.style.setProperty("--cf-variable-ui-color-dark", darkColor ?? color);
					div.style.opacity = (transparent / 100).toString();
					div.style.width = "100%";
					div.style.height = "100%";
					button.appendChild(div);
				} else {
					button.style.setProperty("--cf-variable-ui-color", color);
					button.style.setProperty("--cf-variable-ui-color-dark", darkColor ?? color);
				}
			}

			const variableString = variable.startsWith("var(--") ? variable : `var(--${variable})`;

			button.addEventListener("click", async (e) => {
				e.stopPropagation();
				e.preventDefault();

				if (!this.focusedInput) {
					const pickerTarget = this.recentColorPickerTarget;
					this.selectColor({ name: variable });
					this.recentVariableSelectionTimestamp = performance.now();
					// Clear inline preview after Bricks applies the color via its own mechanism
					setTimeout(() => this.applyColorPreview("", pickerTarget), 5);
					return;
				}

				this.applyValueToInput(variableString, true);
				this.tempInputValue = variableString;
				this.recentVariableSelectionTimestamp = performance.now();

				if (assertOption("bricks_enable_variable_ui_auto_hide")) {
					this.close();
				}
			});

			button.addEventListener("mouseenter", () => {
				if (performance.now() - this.recentVariableSelectionTimestamp < this.HOVER_VARIABLE_PREVIEW_TIMEOUT)
					return;

				if (!this.focusedInput) {
					this.applyColorPreview(variableString, this.recentColorPickerTarget);
					return;
				}

				this.applyValueToInput(variableString);
			});

			button.addEventListener("mouseleave", () => {
				if (!this.focusedInput || this.tempInputValue === null) {
					this.applyColorPreview("", this.recentColorPickerTarget);
					return;
				}

				this.applyValueToInput(this.tempInputValue);

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}
			});

			return button;
		}

		createCategoryTitle(title: string): HTMLDivElement {
			const div = document.createElement("div");
			div.classList.add("cf-variable-ui-category-title");
			const b = document.createElement("b");
			b.textContent = title;
			div.appendChild(b);

			const toggleButton = document.createElement("button");
			toggleButton.classList.add("cf-variable-ui-section-toggle");
			div.appendChild(toggleButton);

			return div;
		}

		allowDrag(instance: HTMLElement) {
			const draggable = instance.querySelector("#cf-variable-ui-header") as HTMLDivElement | null;

			if (!draggable) {
				return;
			}

			let isDragging = false;
			let offsetX = 0;
			let offsetY = 0;

			const handleDragStart = (e: MouseEvent) => {
				[...document.querySelectorAll("iframe")].forEach((iframe) => {
					iframe.style.pointerEvents = "none";
					iframe.style.userSelect = "none";
				});

				isDragging = true;

				const rect = draggable.getBoundingClientRect();

				offsetX = e.clientX - rect.left;
				offsetY = e.clientY - rect.top;

				if (draggable) {
					draggable.style.transition = "none";
				}
			};

			draggable.removeEventListener("mousedown", handleDragStart);
			draggable.addEventListener("mousedown", handleDragStart);

			if (this.handleDrag) {
				document.removeEventListener("mousemove", this.handleDrag);
			}
			this.handleDrag = (e: MouseEvent) => {
				if (!isDragging) {
					return;
				}

				const rect = draggable.getBoundingClientRect();

				const clientX = e.clientX;
				const clientY = e.clientY;
				const x = clientX - offsetX;
				const y = clientY - offsetY;
				const posX =
					(x < 0 ? 0 : x > window.innerWidth - rect.width ? window.innerWidth - rect.width : x) + 10;
				const posY = y < 0 ? 0 : y > window.innerHeight - rect.height ? window.innerHeight - rect.height : y;

				instance.style.left = `${posX}px`;
				instance.style.top = `${posY}px`;
			};
			document.addEventListener("mousemove", this.handleDrag);

			if (this.endDragging) {
				document.removeEventListener("mouseup", this.endDragging);
			}
			this.endDragging = (e: MouseEvent) => {
				[...document.querySelectorAll("iframe")].forEach((iframe) => {
					iframe.style.pointerEvents = "auto";
					iframe.style.userSelect = "auto";
				});

				isDragging = false;
			};
			document.addEventListener("mouseup", this.endDragging);
		}

		createExpandableWrapper({ title }: { title: string }): HTMLDivElement {
			const className = "cf-variable-ui-wrapper";
			const wrapper = document.createElement("div");

			wrapper.dataset.groupExpand = "false";
			wrapper.classList.add(className);

			const categoryTitle = this.createCategoryTitle(title);

			categoryTitle.addEventListener("click", () => {
				wrapper.dataset.groupExpand = wrapper.dataset.groupExpand === "true" ? "false" : "true";
			});

			wrapper.appendChild(categoryTitle);

			return wrapper;
		}

		createInstance() {
			const main = document.createElement("cf-variable-ui");
			main.classList.add("cf-variable-ui");
			main.classList.add("is-bricks");
			main.style.position = "fixed";
			main.style.display = "none";
			main.style.width = "300px";
			main.style.height = "500px";
			main.style.zIndex = "99999999999";
			main.style.left = `${(window.innerWidth / 2 - 200).toString()}px`;
			main.style.top = `${(window.innerHeight / 2 - 300).toString()}px`;

			const header = document.createElement("div");
			header.id = "cf-variable-ui-header";
			header.style.width = "100%";

			const coreFrameworkLogo = document.createElement("img");

			coreFrameworkLogo.src = this.logoData;
			coreFrameworkLogo.classList.add("cf-variable-ui-logo");
			coreFrameworkLogo.style.setProperty("width", "30px");

			const openCoreFrameworkLink = document.createElement("a");
			openCoreFrameworkLink.href = `${
				new URL(window.location.href).origin
			}/wp-admin/admin.php?page=core-framework`;
			openCoreFrameworkLink.target = "_blank";
			openCoreFrameworkLink.textContent = "Open";
			openCoreFrameworkLink.dataset.cftooltip = "Open Core Framework plugin";
			openCoreFrameworkLink.classList.add("cf-variable-ui-open-core-framework");

			const closeButton = document.createElement("button");
			closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
			closeButton.classList.add("cf-variable-ui-close-button");
			closeButton.dataset.cftooltip = "Close";

			closeButton.addEventListener("click", () => this.close());

			header.appendChild(coreFrameworkLogo);
			header.appendChild(openCoreFrameworkLink);
			header.appendChild(closeButton);

			main.appendChild(header);

			const colorSystemGroups = this.colorSystemData?.groups ?? [];

			const colorSystemWrapper = this.createExpandableWrapper({
				title: "Color System",
			});
			colorSystemWrapper.dataset.type = "color-system";
			colorSystemGroups.forEach(({ colors, name, isDisabled }) => {
				if (isDisabled) return;

				const container = document.createElement("div");
				container.classList.add("cf-variable-ui-color-wrapper");

				colors.forEach((color) => {
					const main = this.createColorButton({
						variable: color.name,
						color: color.value,
						darkColor: color.darkValue,
						id: color.id,
					});
					const colorsWrapper = document.createElement("div");

					const title = document.createElement("div");
					title.classList.add("cf-variable-ui-color-title");
					title.textContent = this.getPrefixedVariableName(color.name);
					title.style.setProperty("font-weight", "bold");

					colorsWrapper.classList.add("cf-variable-ui-color-wrapper-second");
					colorsWrapper.appendChild(title);
					colorsWrapper.appendChild(main);

					const shades =
						color.shades?.map((shade, index) => {
							const darkColor = color.darkShades?.[index]?.value;
							return this.createColorButton({
								variable: shade.name,
								color: shade.value,
								id: `${color.id}.d.${index}`,
								darkColor,
							});
						}) ?? [];

					if (color.isShades && shades.length) {
						const title = document.createElement("div");
						title.classList.add("cf-variable-ui-color-title");
						title.textContent = `Shades of ${this.getPrefixedVariableName(color.name)}`;

						const shadesWrapper = document.createElement("div");
						shadesWrapper.classList.add("cf-variable-ui-shades-wrapper");
						shades.forEach((shade) => {
							shadesWrapper.appendChild(shade);
						});

						colorsWrapper.appendChild(title);
						colorsWrapper.appendChild(shadesWrapper);
					}

					const tints =
						color.tints?.map((tint, index) => {
							const darkColor = color.darkTints?.[index]?.value;
							return this.createColorButton({
								variable: tint.name,
								color: tint.value,
								darkColor,
								id: `${color.id}.l.${index}`,
							});
						}) ?? [];

					if (color.isTints && tints.length) {
						const title = document.createElement("div");
						title.classList.add("cf-variable-ui-color-title");
						title.textContent = `Tints of ${this.getPrefixedVariableName(color.name)}`;

						const tintsWrapper = document.createElement("div");
						tintsWrapper.classList.add("cf-variable-ui-tints-wrapper");
						tints.forEach((tint) => {
							tintsWrapper.appendChild(tint);
						});

						colorsWrapper.appendChild(title);
						colorsWrapper.appendChild(tintsWrapper);
					}

					const transparent =
						color.transparentVariables?.map((transparent) => {
							return this.createColorButton({
								variable: `${color.name}-${transparent}`,
								color: color.value,
								darkColor: color.darkValue,
								transparent: Number(transparent),
								id: `${color.id}.t.${color.name.split("-").slice(-1)[0]}`,
							});
						}) ?? [];

					if (color.transparent && transparent.length) {
						const title = document.createElement("div");
						title.classList.add("cf-variable-ui-color-title");
						title.textContent = `Transparent values of ${this.getPrefixedVariableName(color.name)}`;

						const transparentWrapper = document.createElement("div");
						transparentWrapper.classList.add("cf-variable-ui-transparent-wrapper");
						transparent.forEach((transparent) => {
							transparentWrapper.appendChild(transparent);
						});

						colorsWrapper.appendChild(title);
						colorsWrapper.appendChild(transparentWrapper);
					}

					container.appendChild(colorsWrapper);
				});

				colorSystemWrapper.appendChild(container);
			});

			const scrollContainer = document.createElement("div");

			scrollContainer.classList.add("cf-variable-ui-scroll-container");
			scrollContainer.appendChild(colorSystemWrapper);

			Object.entries(this.variables).forEach(([title, variablesRecord]) => {
				const isEmpty = Object.keys(variablesRecord).length === 0;

				if (isEmpty) {
					return;
				}

				const wrapper = this.createExpandableWrapper({
					title: this.stylesGroupsLabelMap[title] ?? title,
				});
				wrapper.dataset.type = title;

				Object.entries(variablesRecord).forEach(([category, variables]) => {
					const getLabel = (variable: string) => {
						if (category === "Fluid Typography" || category === "Fluid Spacing") {
							const prefix = `${
								this.variablePrefix +
								(category === "Fluid Typography"
									? this.fluid_typography_naming_convention
									: this.fluid_spacing_naming_convention)
							}-`;
							return variable.replace(prefix, "");
						}
						return variable;
					};

					const group = document.createElement("div");
					const b = document.createElement("b");

					b.textContent = category;
					b.classList.add("cf-variable-ui-row-title");

					group.appendChild(b);
					group.classList.add("cf-variable-ui-group");

					const container = document.createElement("div");
					container.classList.add("cf-variable-ui-container");

					variables.forEach((variable) => {
						const button = this.createVarButton({
							variable,
							label: getLabel(variable),
						});
						container.appendChild(button);
					});

					group.appendChild(container);
					wrapper.appendChild(group);
				});

				scrollContainer.appendChild(wrapper);
			});

			const symmetricGrids = new Array(12).fill(0).map((_, index) => {
				return {
					variable: String(index + 1),
					value: `repeat(${index + 1}, minmax(0, 1fr))`,
				};
			});

			const asymmetricGrids = [
				{ variable: "1 / 2", value: "minmax(0, 1fr) minmax(0, 2fr)" },
				{ variable: "2 / 1", value: "minmax(0, 2fr) minmax(0, 1fr)" },
				{ variable: "1 / 3", value: "minmax(0, 1fr) minmax(0, 3fr)" },
				{ variable: "3 / 1", value: "minmax(0, 3fr) minmax(0, 1fr)" },
				{ variable: "2 / 3", value: "minmax(0, 2fr) minmax(0, 3fr)" },
				{ variable: "3 / 2", value: "minmax(0, 3fr) minmax(0, 2fr)" },
				{ variable: "1 / 4", value: "minmax(0, 1fr) minmax(0, 4fr)" },
				{ variable: "4 / 1", value: "minmax(0, 4fr) minmax(0, 1fr)" },
				{ variable: "3 / 4", value: "minmax(0, 3fr) minmax(0, 4fr)" },
				{ variable: "4 / 3", value: "minmax(0, 4fr) minmax(0, 3fr)" },
			];

			const gridWrapper = this.createExpandableWrapper({
				title: "Grid",
			});
			gridWrapper.dataset.type = "_gridVariables";

			[symmetricGrids, asymmetricGrids].forEach((grids, index) => {
				const group = document.createElement("div");
				const b = document.createElement("b");

				b.textContent = index === 0 ? "Symmetric Grids" : "Asymmetric Grids";
				b.classList.add("cf-variable-ui-row-title");

				group.appendChild(b);
				group.classList.add("cf-variable-ui-group");

				const container = document.createElement("div");
				container.classList.add("cf-variable-ui-container");

				grids.forEach((variable) => {
					const button = this.createVarWithValueButton({
						variable: variable.value,
						value: variable.value,
						label: variable.variable,
					});
					container.appendChild(button);
				});

				group.appendChild(container);
				gridWrapper.appendChild(group);
			});

			scrollContainer.appendChild(gridWrapper);
			main.appendChild(scrollContainer);
			document.body.appendChild(main);

			this.instance = main;

			this.allowDrag(main);

			setTimeout(() => {
				this.reposition();
			}, 100);
		}

		open() {
			if (!this.instance) {
				return;
			}

			this.instance.style.setProperty("display", "block");
			this.isOpen = true;
			const html = document.querySelector("html");

			if (!html) {
				return;
			}

			html.dataset.cfVariableUiOpen = "true";
		}

		close() {
			if (!this.instance) {
				return;
			}

			this.instance.style.setProperty("display", "none");
			this.tempInputValue = null;
			this.recentColorPickerTarget = null;
			this.isOpen = false;

			const html = document.querySelector("html");

			if (!html) {
				return;
			}

			html.dataset.cfVariableUiOpen = "false";
		}

		destroy() {
			if (this.boundOnKeyDown) {
				document.removeEventListener("keydown", this.boundOnKeyDown);
				this.boundOnKeyDown = null;
			}
			if (this.boundOnClick) {
				document.removeEventListener("click", this.boundOnClick);
				this.boundOnClick = null;
			}
			if (this.handleDrag) {
				document.removeEventListener("mousemove", this.handleDrag);
				this.handleDrag = null;
			}
			if (this.endDragging) {
				document.removeEventListener("mouseup", this.endDragging);
				this.endDragging = null;
			}
			if (this.innerPanelObserver) {
				this.innerPanelObserver.disconnect();
				this.innerPanelObserver = null;
			}
			if (this.instance) {
				this.instance.remove();
				this.instance = null;
			}
		}

		async getVariables(): Promise<boolean> {
			window.coreframework = {
				nonce: window.wpApiSettings.nonce,
				rest_url: window.wpApiSettings.root,
				core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
			};

			const errorMessageCommon =
				"Please save changes again in the Core Framework plugin. Make sure the Bricks integration is enabled. If the error persists, please contact support at https://coreframework.com/";

			try {
				const res = await fetch(`${window.coreframework.core_api_url}builders-var-ui`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"X-WP-Nonce": window.coreframework.nonce,
					},
				});

				if (res.status !== 200) {
					log(`Failed to load variables. ${errorMessageCommon}`);
					return false;
				}

				const json = (await res.json()) as {
					variables: Record<string, Record<string, string[]>>;
					color_system_data: ColorSystem;
					variable_prefix: string;
					fluid_typography_naming_convention: TypographyScale;
					fluid_spacing_naming_convention: SpacingScale;
				};

				if (!json?.variables) {
					log(`No variables found. ${errorMessageCommon}`);
					return false;
				}

				this.variables = getUniqueVariables(json.variables);

				if (!json.color_system_data) {
					log(`No color system data found. ${errorMessageCommon}`);
					return false;
				}

				this.colorSystemData = json.color_system_data;
				this.variablePrefix = json.variable_prefix;
				this.fluid_typography_naming_convention = json.fluid_typography_naming_convention;
				this.fluid_spacing_naming_convention = json.fluid_spacing_naming_convention;

				return true;
			} catch (e) {
				log(`Failed to load variables. ${errorMessageCommon}`);
				return false;
			}
		}

		reposition() {
			if (!this.instance) {
				return;
			}
			this.instance.style.top = `${(window.innerHeight / 2 - 300).toString()}px`;
			this.instance.style.left = `${(320).toString()}px`;
		}

		// Sets expand/hidden state on Variable UI wrapper sections based on which types to auto-expand
		setWrapperVisibility(autoExpand: {
			color?: boolean;
			typography?: boolean;
			spacing?: boolean;
			design?: boolean;
			grid?: boolean;
		}) {
			if (!this.instance) return;

			const types = [
				["color-system", autoExpand.color],
				["typographyStyles", autoExpand.typography],
				["spacingStyles", autoExpand.spacing],
				["designStyles", autoExpand.design],
				["_gridVariables", autoExpand.grid],
			] as const;

			for (const [type, expand] of types) {
				const wrapper = this.instance.querySelector(
					`.cf-variable-ui-wrapper[data-type='${type}']`,
				) as HTMLDivElement | null;
				if (!wrapper) continue;
				wrapper.dataset.groupExpand = expand ? "true" : "false";
				// For color-only mode, hide non-color sections entirely
				if (
					autoExpand.color &&
					!autoExpand.typography &&
					!autoExpand.spacing &&
					!autoExpand.design &&
					!autoExpand.grid
				) {
					wrapper.dataset.hidden = type === "color-system" ? "false" : "true";
				} else {
					wrapper.dataset.hidden = type === "color-system" && !autoExpand.color ? "true" : "false";
				}
			}
		}

		onInputClick(e: MouseEvent) {
			const isContextMenu = e.type === "contextmenu" && assertOption("bricks_enable_variable_context_menu");

			if (isContextMenu) {
				e.preventDefault();
				e.stopPropagation();
			}

			if (!this.isOpen && !(e?.metaKey || e?.altKey) && !isContextMenu) {
				return;
			}

			const input = e.target as HTMLInputElement | null;
			if (!input) return;

			document?.getSelection()?.removeAllRanges();
			e.preventDefault();
			e.stopPropagation();

			this.focusedInput = input;
			this.tempInputValue = input.value;

			const control = input.closest("[data-controlkey]") as HTMLDivElement | null;
			const key = control?.dataset.controlkey?.toLocaleLowerCase() ?? "";
			const isColor = input.parentElement?.parentElement?.classList.contains("color-input");

			this.setWrapperVisibility({
				color: !!isColor,
				typography: ["typography", "font"].some((k) => key.includes(k)),
				spacing: ["padding", "margin", "gap", "width", "height"].some((k) => key.includes(k)),
				design: key === "_border",
				grid: ["_gridtemplatecolumns", "_gridtemplaterows"].some((k) => key.includes(k)),
			});

			this.open();
		}

		onFocusCallback(e: FocusEvent) {
			const input = e.target as HTMLInputElement | null;
			this.focusedInput = input;
		}

		showBricksColorPopUp() {
			document.querySelectorAll(".cf-variable-ui-style").forEach((style) => {
				style.remove();
			});
		}

		hideBricksColorPopUp() {
			if (document.querySelector(".cf-variable-ui-style")) {
				return;
			}

			const css = `.bricks-control-popup { display: none !important; }`;
			const style = document.createElement("style");
			style.id = "cf-variable-ui-bricks-popup";
			style.appendChild(document.createTextNode(css));
			style.classList.add("cf-variable-ui-style");
			document.head.appendChild(style);
		}

		async selectColor({ name }: { name: string }) {
			this.hideBricksColorPopUp();

			const variableString = name.startsWith("var(--") ? name : `var(--${name})`;
			const colorsGrid = document.querySelector(".bricks-control-popup .color-palette.grid");
			const colorsPalette = document.querySelector(".bricks-control-popup .color-palette");

			if (colorsGrid) {
				colorsGrid.querySelector(`[data-balloon="${variableString}"]`)?.parentElement?.click();
			}

			if (colorsPalette) {
				const colors = colorsPalette.querySelectorAll(".color-name>span");
				const match = Array.from(colors)
					.reverse()
					.find((el) => variableString.includes(el.textContent as string));
				match?.parentElement?.click();
			} else {
				log("Failed to select color. Color grid not found.");
			}

			// If popup wasn't already open, open it first so Bricks can process the selection
			if (!colorsGrid) {
				(this.recentColorPickerTarget?.closest(".bricks-control-preview") as HTMLDivElement)?.click();
				await new Promise((resolve) => setTimeout(resolve, 25));
			}

			// Close the popup
			document.body?.click();
			await new Promise((resolve) => setTimeout(resolve, 2));

			if (document.querySelector(".bricks-control-popup")) {
				// Popup didn't close immediately — retry with delay
				setTimeout(() => {
					document.body?.click();
					setTimeout(() => this.showBricksColorPopUp(), 5);
				}, 5);
				log("Failed to close color picker. Delaying close.");
			} else {
				this.showBricksColorPopUp();
			}
		}

		handleColorVariableUiColorTriggerClick({ target }: { target: HTMLInputElement }) {
			document?.getSelection()?.removeAllRanges();
			this.setWrapperVisibility({ color: true });

			const colorsPalette = document.querySelector(".bricks-control-popup .color-palette");
			colorsPalette || target.click();
			this.recentColorPickerTarget = target;

			// Try to resolve the input from the nearest control with variables (Bricks 2.2)
			const control =
				target.closest(".has-variables") ?? target.closest(".control-inner")?.querySelector(".has-variables");
			const input = control?.querySelector("input") as HTMLInputElement | null;
			this.focusedInput = input;
			this.tempInputValue = input?.value ?? null;

			this.open();
		}

		addTriggers() {
			setTimeout(() => {
				bricksInputs.includedFields.forEach((field) => {
					const wrappers =
						typeof field === "string"
							? [...document.querySelectorAll(field)]
							: [...document.querySelectorAll(field.selector)].filter((n) =>
									field.hasChild.some((c) => n.querySelector(c)),
								);

					wrappers.forEach((wrapper) => {
						// Prefer text inputs, fall back to any input that isn't hidden/checkbox/radio
						const input = (wrapper.querySelector("input[type='text']") ??
							wrapper.querySelector(
								"input:not([type='hidden']):not([type='checkbox']):not([type='radio'])",
							)) as HTMLInputElement | null;

						if (!input || input.getAttribute("cf-variable-ui") === "true") return;

						input.removeEventListener("click", this.boundOnInputClick);
						input.addEventListener("click", this.boundOnInputClick);
						input.removeEventListener("focus", this.boundOnFocusCallback);
						input.addEventListener("focus", this.boundOnFocusCallback);

						if (assertOption("bricks_enable_variable_context_menu")) {
							input.removeEventListener("contextmenu", this.boundOnInputClick);
							input.addEventListener("contextmenu", this.boundOnInputClick);
						}

						input.setAttribute("cf-variable-ui", "true");
					});
				});

				const popupTriggers = [...document.querySelectorAll(".bricks-control-preview")].filter((trigger) => {
					const closestControlInner = trigger.closest(".control-inner");
					const labelFor = closestControlInner?.querySelector("label")?.getAttribute("for");

					return ["color", "fill", "stroke"].includes(labelFor ?? "");
				});

				popupTriggers.forEach((popupTrigger) => {
					const tooltipTrigger = popupTrigger.querySelector(".color-value-tooltip");
					if (tooltipTrigger && !tooltipTrigger.getAttribute("data-balloon")) {
						tooltipTrigger.setAttribute("data-balloon", "Right click to open variable UI");
					}

					popupTrigger.addEventListener("contextmenu", (e) => {
						e.preventDefault();
						e.stopPropagation();

						const target = e.target as HTMLInputElement | null;
						if (!target) return;

						this.handleColorVariableUiColorTriggerClick({ target });
					});
				});
			}, 100);
		}

		addListeners() {
			this.boundOnKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape" && this.instance?.style.getPropertyValue("display") === "block") {
					this.close();
				}
			};

			document.addEventListener("keydown", this.boundOnKeyDown);

			this.boundOnClick = (e: MouseEvent) => {
				if (
					this.isOpen &&
					!this?.instance?.contains(e.target as Node) &&
					!(e.target as HTMLButtonElement)?.classList.contains("cf-variable-ui-trigger") &&
					!(e.target as HTMLButtonElement)?.parentElement?.classList.contains("cf-variable-ui-trigger")
				) {
					this.close();
				}
			};

			if (assertOption("bricks_enable_variable_ui_auto_hide")) {
				document.removeEventListener("click", this.boundOnClick);
				document.addEventListener("click", this.boundOnClick);
			}
		}
	}

	const findNestedValueByKey = (obj: unknown, targetKey: string): any => {
		if (typeof obj !== "object" || obj === null) {
			return null;
		}

		const record = obj as Record<string, unknown>;

		if (Object.prototype.hasOwnProperty.call(record, targetKey)) {
			return record[targetKey];
		}

		for (const key of Object.keys(record)) {
			const value = record[key];
			if (typeof value === "object" && value !== null) {
				const found = findNestedValueByKey(value, targetKey);
				if (found !== null) {
					return found;
				}
			}
		}

		return null;
	};

	const getFonts = async (): Promise<Font[] | []> => {
		window.coreframework = {
			nonce: window.wpApiSettings.nonce,
			rest_url: window.wpApiSettings.root,
			core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
		};

		try {
			const response = await fetch(`${window.coreframework.core_api_url}get-core-fonts`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": window.coreframework.nonce,
				},
			});
			const { fonts } = await response.json();

			return fonts.filter((font: Font) => font.enable);
		} catch (e) {
			return [];
		}
	};

	const applyCoreOptionsView = (enabledFonts: Font[]) => {
		const innerPanel = document.querySelector("#bricks-panel-inner:not(div.bricks-control-popup *)");
		const bricksVersion = parseFloat((window as any).bricksData.version);

		if (!innerPanel) {
			log("Inner panel not found, can't initialize preview of variables on hover");
			return;
		}

		const observer = new MutationObserver((mutations) => {
			let fontsList: HTMLUListElement | null | undefined;
			if (bricksVersion >= 2) {
				const fontsSelect = document.querySelector("label[for='font-family']")?.nextElementSibling;
				fontsList = fontsSelect?.querySelector("ul");
			} else {
				const fontsGroups = document.querySelectorAll("#bricks-panel-inner .options-wrapper .title");
				const coreGroup = Array.from(fontsGroups).find((group) => group.textContent === "Core Framework");
				fontsList = coreGroup?.closest("ul");
			}

			const coreIcons = fontsList?.querySelectorAll(".core-icon");
			const coreGroupLi = document.getElementById("core-group");
			const isCoreMutations = mutations.some((mutation) => {
				return Array.from(mutation.addedNodes).some((addedNode: any) => {
					return (
						(addedNode.nodeType === Node.ELEMENT_NODE && addedNode.id === "core-group") ||
						addedNode.id === "core-icon"
					);
				});
			});

			if (fontsList && !isCoreMutations) {
				coreIcons?.forEach((icon) => icon.remove());
				coreGroupLi?.remove();
				const children = Array.from(fontsList.children);
				enabledFonts
					.sort((a, b) => {
						if (bricksVersion >= 2) [b, a] = [a, b];
						return a.family.localeCompare(b.family);
					})
					.forEach((font) => {
						const targetFontOption = getChild(children, font) as HTMLDivElement;

						if (targetFontOption) {
							Object.assign(targetFontOption.style, {
								display: "flex",
								"justify-content": "space-between",
								"align-items": "center",
							});
							const coreIcon = document.createElement("span");
							coreIcon.style.setProperty("width", "13px");
							coreIcon.style.setProperty("height", "13px");
							coreIcon.classList.add("core-icon");
							coreIcon.setAttribute("id", "core-icon");
							coreIcon.innerHTML = `
							<svg
								id="b"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 31.82 24.84"
								width="15"
								height="15"
							>
								<defs>
									<linearGradient id="e" x1="3.77" y1="7.44" x2="31.03" y2="24.04" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse">
										<stop offset="0" stop-color="#5c68f9"></stop>
										<stop offset="1" stop-color="#8e97fe"></stop>
									</linearGradient>
									<linearGradient id="f" x1="8.16" y1=".31" x2="13.63" y2="17.26" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse">
										<stop offset="0" stop-color="#5c68f9" stop-opacity="0"></stop>
										<stop offset=".08" stop-color="#5561f4" stop-opacity=".1"></stop>
										<stop offset=".32" stop-color="#434ce6" stop-opacity=".42"></stop>
										<stop offset=".55" stop-color="#343cdc" stop-opacity=".67"></stop>
										<stop offset=".74" stop-color="#2930d4" stop-opacity=".85"></stop>
										<stop offset=".9" stop-color="#2329cf" stop-opacity=".96"></stop>
										<stop offset="1" stop-color="#2127ce"></stop>
									</linearGradient>
								</defs>
								<g id="c">
									<g id="d">
										<rect x="18.78" y="10.68" width="13.03" height="7.07" style="fill:#fa5e5e;"></rect>
										<path d="m12.42,0C5.56,0,0,5.56,0,12.42h0c0,6.86,5.56,12.42,12.42,12.42h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0c0-2.95,2.39-5.35,5.35-5.35h19.4V0H12.42Z" style="fill:#7d87fc;"></path>
										<path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" style="fill:#424ae1;"></path>
									</g>
								</g>
							</svg>
						`;
							targetFontOption.appendChild(coreIcon);
							bricksVersion >= 2 && fontsList?.insertBefore(targetFontOption, fontsList.firstChild);
						}
					});

				const subGroup = fontsList.querySelector(".title");
				if (
					document.querySelectorAll(".core-icon").length === enabledFonts.length &&
					subGroup &&
					bricksVersion >= 2
				) {
					const coreGroup = subGroup?.cloneNode() as HTMLLIElement;
					coreGroup.setAttribute("id", "core-group");
					coreGroup.textContent = "Core Framework";
					fontsList.prepend(coreGroup);
				}
			}
		});
		observer.observe(innerPanel, {
			subtree: true,
			childList: true,
			attributes: false,
		});
	};

	const applyCoreFonts = async (): Promise<void> => {
		const enabledFonts = await getFonts();
		const bricksData = (window as any).bricksData;
		const bricksFonts = findNestedValueByKey(bricksData, "fonts");
		const fontsOptionsMap = enabledFonts.reduce(
			(acc: Record<string, string>, font: Font) => ({ ...acc, [font.family]: font.family }),
			{},
		);
		const coreGroup = { coreFontsGroupTitle: "Core Framework" };

		if (enabledFonts.length && bricksFonts) {
			bricksFonts.options = { ...coreGroup, ...fontsOptionsMap, ...bricksFonts.options };
			bricksFonts.core = enabledFonts.map((font) => ({ ...font, files: [] }));

			if (parseFloat(bricksData.version) >= 2) {
				const parsedCoreFonts = enabledFonts.reduce((acc, font) => {
					return { ...acc, [font.family]: { id: font.id, family: font.family, fontFace: null } };
				}, {});
				bricksFonts.custom = Object.assign(bricksFonts.custom || {}, parsedCoreFonts);
			}

			applyCoreOptionsView(enabledFonts);
		}
	};

	// Force-reload a CF stylesheet by replacing the <link> element (cache-bust)
	const reloadStylesheet = (doc: Document, label: string) => {
		// Only target the main CF stylesheet (core_framework.css or core_framework_<blog_id>.css)
		const links = doc.querySelectorAll(
			'link[rel="stylesheet"][href*="core_framework.css"], link[rel="stylesheet"][href*="core_framework_"]',
		) as NodeListOf<HTMLLinkElement>;
		let reloaded = 0;

		links.forEach((oldLink) => {
			const newLink = doc.createElement("link");
			newLink.rel = "stylesheet";
			newLink.type = oldLink.type || "text/css";
			newLink.media = oldLink.media || "all";
			if (oldLink.id) newLink.id = oldLink.id;

			const baseHref = oldLink.href.split("?")[0];
			newLink.href = baseHref + "?ver=" + Date.now();

			oldLink.parentNode?.insertBefore(newLink, oldLink);
			newLink.onload = () => {
				oldLink.remove();
				log(`${label} stylesheet loaded successfully`);
			};
			newLink.onerror = () => {
				log(`${label} stylesheet failed to load, keeping old one`);
				newLink.remove();
			};
			reloaded++;
		});

		return reloaded;
	};

	const main = async () => {
		addThemeToggleButton();
		initApplyClassOnHover();
		initApplyVariableOnHover();
		await applyCoreFonts();
		// new VariableAutoComplete();
		let variableUiInstance: VariableUi | null = new VariableUi();

		// Listen for push events from the CF admin panel (cross-tab live sync)
		try {
			const syncChannel = new BroadcastChannel("cf_push_sync");
			syncChannel.onmessage = async (event) => {
				if (event.data?.type === "push_complete") {
					log("Push detected, re-syncing Bricks...");

					try {
						// Reload CSS stylesheet in iframe (preview) and main document
						const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;
						const iframeDoc = iframe?.contentDocument;
						if (iframeDoc) {
							const count = reloadStylesheet(iframeDoc, "Iframe");
							log(
								count
									? `Reloading ${count} CSS stylesheet(s) in iframe`
									: "No core-framework stylesheet found in iframe",
							);
						}

						const mainCount = reloadStylesheet(document, "Main");
						if (mainCount) {
							log(`Reloading ${mainCount} CSS stylesheet(s) in main document`);
						}

						// Re-initialize Variable UI with fresh data (it fetches from server in its constructor)
						if (variableUiInstance) {
							variableUiInstance.destroy();
						}
						variableUiInstance = new VariableUi();

						// Sync Bricks global classes, colors, and variables from WP options
						try {
							const syncRes = await fetch(`${window.coreframework.core_api_url}get-bricks-sync-data`, {
								method: "GET",
								headers: { "X-WP-Nonce": window.coreframework.nonce },
							});

							if (syncRes.ok) {
								const syncData = await syncRes.json();
								const loadData = (window as any).bricksData?.loadData;
								const state = VUE.globalProperties()?.$_state;

								// Splice Vue reactive arrays to trigger UI updates
								const syncKeys = [
									"globalClasses",
									"colorPalette",
									"globalVariables",
									"globalVariablesCategories",
								] as const;
								for (const key of syncKeys) {
									const fresh = syncData[key];
									if (!fresh || !state?.[key]) continue;
									state[key].splice(0, state[key].length, ...fresh);
									if (loadData) loadData[key] = fresh;
									log(`Synced ${fresh.length} ${key}`);
								}

								// Rebuild the index map Bricks uses for fast class lookups
								if (syncData.globalClasses && state?.globalClassIndexById) {
									const newIndex: Record<string, number> = {};
									syncData.globalClasses.forEach((cls: { id: string }, i: number) => {
										newIndex[cls.id] = i;
									});
									for (const key of Object.keys(state.globalClassIndexById))
										delete state.globalClassIndexById[key];
									Object.assign(state.globalClassIndexById, newIndex);
								}
							} else {
								log("Failed to fetch Bricks sync data:", syncRes.status);
							}
						} catch (syncErr) {
							log("Bricks class/color sync failed:", syncErr);
						}

						log("Bricks re-sync complete.");
					} catch (e) {
						log("Re-sync failed:");
						log("Error:", e);
					}
				}
			};
		} catch (e) {
			// BroadcastChannel not supported in this context
		}
	};

	document.addEventListener("DOMContentLoaded", main);
}
