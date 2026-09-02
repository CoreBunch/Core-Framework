interface Window {
	$scope: any;
}

interface Font {
	id: string;
	family: string;
	title: string;
	enable: boolean;
}

(() => {
	const observe = ({
		selector,
		callback,
		options,
	}: {
		selector: string;
		callback: MutationCallback;
		options?: MutationObserverInit;
	}) => {
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

	const throttle = (fn: Function, wait: number = 300) => {
		let inThrottle: boolean;
		let lastFn: ReturnType<typeof setTimeout>;
		let lastTime: number;
		return function (this: any) {
			const args = arguments;
			if (!inThrottle) {
				fn.apply(this, args);
				lastTime = Date.now();
				inThrottle = true;
				return;
			}
			clearTimeout(lastFn);
			lastFn = setTimeout(() => {
				if (Date.now() - lastTime >= wait) {
					fn.apply(this, args);
					lastTime = Date.now();
				}
			}, Math.max(wait - (Date.now() - lastTime), 0));
		};
	};

	const getChild = (children: ChildNode[], data: any): ChildNode | undefined => {
		return children.find((child) => child.textContent?.trim().includes(data.family));
	};

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

	const excludedNgModels = [
		"iframeScope.component.options[iframeScope.component.active.id]['model']['background-image']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['icon-size']",
		"iframeScope.fontsFilter",
		"postsFilter",
		"currentlyEditingFilter",
		"iframeScope.iconFilter.title",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['z-index']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['src']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['rel']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['url']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['testimonial_photo']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['pricing_box_price",
	];

	const excludedNgModelsWithWildcard = [
		"iframeScope.component.options[iframeScope.component.active.id]['model']['title-*']",
		"iframeScope.component.options[iframeScope.component.active.id]['model']['icon-*']",
		"duration",
		"url",
		"speed",
		"time",
		"address",
		"zoom",
	].map((s) => s.replace("*']", ""));

	const inputsSelector = `.oxygen-control input[type="text"]:not(.ct-iris-colorpicker):not([ng-model*="shortcode"])${excludedNgModels
		.map((s) => `:not([ng-model="${s}"])`)
		.join("")}${excludedNgModelsWithWildcard.map((s) => `:not([ng-model*="${s}"])`).join("")}`;

	const getCoreFrameworkConnector = () =>
		window?.core_framework_connector ?? DEFAULT_CORE_FRAMEWORK_CONNECTOR;

	const assertOption = (feature: keyof typeof DEFAULT_CORE_FRAMEWORK_CONNECTOR) =>
		getCoreFrameworkConnector()?.[feature] ?? false;

	enum ThemeClasses {
		DARK = "cf-theme-dark",
		LIGHT = "cf-theme-light",
	}

	const log = (message: string, ...args: unknown[]) => console.log(`[Core Framework] ${message}`, ...args);

	const addThemeToggleButton = () => {
		if (!assertOption("oxygen_enable_dark_mode_preview")) {
			return;
		}

		const themeMode = window?.core_framework_connector?.theme_mode ?? "light";

		const CT_IFRAME_ID = "ct-artificial-viewport";
		const leftPanel = document.querySelector(".oxygen-toolbar-panel");
		const toggleButton = document.createElement("div");
		const THEME_TOGGLE_BUTTON_CLASS = "cf-theme-toggle-button";
		const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
		const isDark = savedTheme === "dark";

		if (!leftPanel) {
			log("Left panel not found");
			return;
		}

		toggleButton.classList.add("oxygen-toolbar-panel-toggle-button", "cf-theme-toggle-button-builder");

		const toggleButtonIconLight = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		toggleButtonIconLight.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		toggleButtonIconLight.setAttribute("fill", "none");
		toggleButtonIconLight.setAttribute("stroke", "currentColor");
		toggleButtonIconLight.setAttribute("stroke-width", "1.5");
		toggleButtonIconLight.setAttribute("stroke-linecap", "round");
		toggleButtonIconLight.setAttribute("stroke-linejoin", "round");
		toggleButtonIconLight.setAttribute("viewBox", "0 0 24 24");
		toggleButtonIconLight.style.display = !isDark ? "block" : "none";
		const toggleButtonIconLightPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		toggleButtonIconLightPath.setAttribute(
			"d",
			"M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z",
		);
		toggleButtonIconLight.appendChild(toggleButtonIconLightPath);
		toggleButton.appendChild(toggleButtonIconLight);
		const toggleButtonIconDark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		toggleButtonIconDark.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		toggleButtonIconDark.setAttribute("fill", "none");
		toggleButtonIconDark.setAttribute("stroke", "currentColor");
		toggleButtonIconDark.setAttribute("stroke-width", "1.5");
		toggleButtonIconDark.setAttribute("stroke-linecap", "round");
		toggleButtonIconDark.setAttribute("stroke-linejoin", "round");
		toggleButtonIconDark.setAttribute("viewBox", "0 0 24 24");
		const toggleButtonIconDarkPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		toggleButtonIconDarkPath.setAttribute(
			"d",
			"M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z",
		);
		toggleButtonIconDark.appendChild(toggleButtonIconDarkPath);
		toggleButtonIconDark.style.display = isDark ? "block" : "none";
		toggleButton.appendChild(toggleButtonIconDark);
		leftPanel.appendChild(toggleButton);

		const style = document.createElement("style");
		const css = `
			.cf-theme-toggle-button-builder {
				background-color: var(--oxy-dark);
				cursor: pointer;
				display: flex;
				position: relative;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				width: 30px;
				height: 30px;
				padding: 5px;
			}
			.cf-theme-toggle-button-builder path {
				fill: none;
				stroke: white;
			}
		`;

		style.appendChild(document.createTextNode(css));

		leftPanel.appendChild(style);

		type ThemeState = "dark" | "light";
		const flipToggles = (state: ThemeState) => {
			const iframeDocument = (document.getElementById(CT_IFRAME_ID) as HTMLIFrameElement | null)
				?.contentDocument;

			if (!iframeDocument) {
				log("Iframe document not found");
				return;
			}

			[...iframeDocument.querySelectorAll(`.${THEME_TOGGLE_BUTTON_CLASS}`)].forEach((button) => {
				button.classList.add(state === "dark" ? ThemeClasses.DARK : ThemeClasses.LIGHT);
				button.classList.remove(state === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);
			});
		};

		const getSystemThemeClass = (): ThemeClasses =>
			window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
				? ThemeClasses.DARK
				: ThemeClasses.LIGHT;

		const iframe = document.getElementById(CT_IFRAME_ID) as HTMLIFrameElement | null;

		iframe?.addEventListener("load", () =>
			setTimeout(() => {
				const iframeHtml = iframe?.contentDocument?.querySelector("html");
				const html = document.querySelector("html");
				if (!iframeHtml) {
					log("Iframe html not found");
					return;
				}

				iframeHtml.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);

				const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
				const defaultTheme = String(themeMode === "auto" ? getSystemThemeClass : `cf-theme-${themeMode}`);

				iframeHtml.classList.add(savedTheme ? `cf-theme-${savedTheme}` : defaultTheme);
				html?.classList.add(savedTheme ? `cf-theme-${savedTheme}` : defaultTheme);
			}, 5),
		);

		toggleButton.addEventListener("click", () => {
			const iframeDocument = (document.getElementById(CT_IFRAME_ID) as HTMLIFrameElement | null)
				?.contentDocument;

			if (!iframeDocument) {
				log("Iframe document not found");
				return;
			}

			const iframeHtml = iframeDocument.querySelector("html");

			if (!iframeHtml) {
				log("Iframe html not found");
				return;
			}

			const theme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
			const isDefaultDark = theme === "dark";

			if (isDefaultDark) {
				iframeHtml.classList.remove(ThemeClasses.DARK);
				iframeHtml.classList.add(ThemeClasses.LIGHT);
			} else {
				iframeHtml.classList.remove(ThemeClasses.LIGHT);
				iframeHtml.classList.add(ThemeClasses.DARK);
			}

			const html = document.querySelector("html");

			html?.classList.toggle(ThemeClasses.DARK);
			html?.classList.toggle(ThemeClasses.LIGHT);

			const toggleButtonIconLight = toggleButton.querySelector("svg:first-child");
			const toggleButtonIconDark = toggleButton.querySelector("svg:last-child");
			const isDark = iframeHtml.classList.contains(ThemeClasses.DARK);

			if (toggleButtonIconLight) {
				(toggleButtonIconLight as HTMLElement).style.display = isDefaultDark ? "block" : "none";
			}

			if (toggleButtonIconDark) {
				(toggleButtonIconDark as HTMLElement).style.display = isDefaultDark ? "none" : "block";
			}

			flipToggles(!isDefaultDark ? "light" : "dark");
			window?.localStorage?.setItem("cf-theme", !isDefaultDark ? "dark" : "light");
		});
	};

	const modifyClass = (className: string, action: "add" | "remove") => {
		const iframeId = "ct-artificial-viewport";
		const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
		const iframeDocument = iframe?.contentDocument;

		if (!iframeDocument) {
			log("Iframe document not found");
			return;
		}

		const activeClass = "ct-active";
		const activeElement = iframeDocument.querySelector(`.${activeClass}`);

		if (!activeElement) {
			log("Active element not found");
			return;
		}

		if (action === "add") {
			activeElement.classList.add(className);
		} else {
			activeElement.classList.remove(className);
		}
	};

	const applyColorPreview = (target: HTMLInputElement, variable: string) => {
		const nearest = target?.closest(".oxygen-color-picker");
		const colorPicker = nearest?.querySelector(".button.wp-color-result") as HTMLElement | null;

		if (!colorPicker) {
			return;
		}

		colorPicker.style.backgroundColor = variable;
	};

	const applyClassOnHover = () => {
		if (!assertOption("oxygen_apply_class_on_hover")) {
			return;
		}

		const onClick = (value: string) => {
			setTimeout(() => {
				modifyClass(value, "add");
			}, 5);
		};

		const callback = () => {
			const suggestions = document.querySelectorAll(
				".oxygen-classes-dropdown .oxygen-classes-suggestions li",
			);

			suggestions.forEach((suggestion) => {
				const secondChildTextContent = suggestion.children[1]?.textContent;

				if (!secondChildTextContent) {
					log("Second child text content not found");
					return;
				}

				suggestion.removeEventListener("click", () => onClick(secondChildTextContent));
				suggestion.addEventListener("click", () => onClick(secondChildTextContent));
				suggestion.removeEventListener("mouseenter", () => modifyClass(secondChildTextContent, "add"));
				suggestion.addEventListener("mouseenter", () => modifyClass(secondChildTextContent, "add"));
				suggestion.removeEventListener("mouseleave", () => modifyClass(secondChildTextContent, "remove"));
				suggestion.addEventListener("mouseleave", () => modifyClass(secondChildTextContent, "remove"));
			});
		};

		const sideBarId = "oxygen-sidebar";
		observe({
			selector: `#${sideBarId}`,
			callback: throttle(callback, 100),
		});
	};

	class VariableAutoComplete {
		variables: string[] = [];
		variablesGroups: Record<string, string[]> = {};
		colorVariables: string[] = [];

		constructor() {
			this.init();
		}

		async init() {
			const isVariableDropdownEnabled = assertOption("oxygen_enable_variable_dropdown");

			if (!isVariableDropdownEnabled) {
				return;
			}

			const didLoadVariables = await this.getVariables();

			if (!didLoadVariables) {
				return;
			}

			const targets = [
				"#oxygen-sidebar-control-panel-basic-styles",
				".oxygen-select",
				"#oxygen-sidebar",
				".oxygen-sidebar-advanced-home",
			];

			targets.forEach((target) => {
				observe({
					selector: target,
					callback: () => {
						this.setVariableAutocomplete();
					},
					options: {
						subtree: false,
						childList: false,
						attributes: true,
					},
				});
			});

			observe({
				selector: ".oxygen-active-element-name",
				callback: () => {
					this.setVariableAutocomplete();
				},
				options: {
					subtree: true,
					childList: true,
					attributes: false,
				},
			});

			this.setVariableAutocomplete();
		}

		filterVariables(value: string): string[] {
			return this.variables.filter(
				(variable) => variable.toLocaleLowerCase().includes(value.toLocaleLowerCase()) && variable !== value,
			);
		}

		sortVariables(input: HTMLInputElement): string[] {
			const SPACING_KEYS = ["padding", "margin", "gap", "width", "height"];

			const isSpacing = SPACING_KEYS.some((key) => String(input.dataset.option).includes(key));
			const isColorPicker = input.parentElement?.classList.contains("oxygen-color-picker");
			const isFontSize = input.dataset.option === "font-size";

			let output: string[] = [];

			for (let [key, value] of Object.entries(this.variablesGroups)) {
				value = typeof value === "object" ? Object.values(value) : value;

				if (isColorPicker && key === "colorStyles") {
					output = [...value];
					break;
				}

				if (key === "colorStyles") {
					continue;
				}

				if (isFontSize && key === "typographyStyles" && isFontSize) {
					output.unshift(...value);
					continue;
				}

				if (isFontSize && key === "typographyStyles" && !isFontSize) {
					output.push(...value);
					continue;
				}

				if (isSpacing && key === "spacingStyles" && isSpacing) {
					output.unshift(...value);
					continue;
				}

				if (isSpacing && key === "spacingStyles" && !isSpacing) {
					output.push(...value);
					continue;
				}

				output.push(...value);
			}

			output = output.map((v) => `var(--${v})`);
			this.variables = output;
			return output;
		}

		emitInputEvent(input: HTMLInputElement, value: string) {
			input.value = value;
			input.dispatchEvent(new Event("input"));
		}

		setUnitToNone(input: HTMLInputElement) {
			try {
				const option = input.previousElementSibling?.classList.contains("oxygen-color-picker-color")
					? "color"
					: input.getAttribute("data-option");
				window?.$scope.iframeScope.setOptionUnit(option, " ");
			} catch {}
		}

		createDropdown({ options, target }: { options: string[]; target: HTMLInputElement }) {
			document.querySelectorAll(".cf-variable-dropdown").forEach((dropdown) => {
				dropdown?.remove();
			});

			if (target?.parentElement) {
				target.parentElement.style.position = "relative";
			}

			const dropdown = document.createElement("div");

			const onMouseEnter = () => {
				if (assertOption("oxygen_enable_unit_and_value_preview")) {
					this.setUnitToNone(target);
				}
			};

			dropdown.addEventListener("mouseenter", onMouseEnter);

			["cf-variable-dropdown"].forEach((className) => dropdown.classList.add(className));

			const dropdownList = document.createElement("ul");

			const displayHint =
				assertOption("oxygen_enable_variable_ui_hint") && assertOption("oxygen_variable_ui");

			if (displayHint) {
				const hint = document.createElement("div");
				hint.classList.add("cf-variable-dropdown-hint");
				hint.classList.add("variable-dropdown-item");
				hint.textContent = `${
					navigator?.platform?.toUpperCase().includes("MAC") ? "⌘" : "Alt"
				} + Click to open variable UI`;
				hint.style.padding = "4px 10px";
				hint.style.color = "white";
				hint.style.opacity = "0.7";
				hint.style.fontSize = "12px";

				dropdown.appendChild(hint);
			}

			options.forEach((option) => {
				const listItem = document.createElement("li");
				listItem.textContent = option;
				listItem.setAttribute("tabindex", "0");
				listItem.setAttribute("role", "option");
				listItem.dataset.type = "variable-dropdown-item";
				listItem.dataset.value = option;

				let temp = "";

				setTimeout(() => {
					listItem.addEventListener("mouseenter", (e) => {
						if (assertOption("oxygen_enable_unit_and_value_preview")) {
							temp = target.value;
							this.emitInputEvent(target, option);
						}
					});

					listItem.addEventListener("mouseleave", (e) => {
						if (assertOption("oxygen_enable_unit_and_value_preview")) {
							this.emitInputEvent(target, temp);
							temp = "";
						}
					});
				}, 5);

				if (this.colorVariables.includes(option)) {
					const span = document.createElement("span");
					span.style.backgroundColor = option;
					listItem.prepend(span);
				}

				dropdownList.appendChild(listItem);
			});

			dropdown.appendChild(dropdownList);
			target.parentElement?.appendChild(dropdown);

			const dropdownItems = dropdown.querySelectorAll("li");

			target?.parentElement?.querySelectorAll("li").forEach((item) => {
				item.addEventListener("mouseEnter", () => {
					if (!assertOption("oxygen_enable_unit_and_value_preview")) {
						return;
					}
					item.classList.add("selected");
					target.value = item.dataset.value || temp;

					target.dispatchEvent(new Event("input"));
				});

				item.addEventListener("mouseLeave", () => {
					if (!assertOption("oxygen_enable_unit_and_value_preview")) {
						return;
					}
					item.classList.remove("selected");
					target.value = temp;
					target.dispatchEvent(new Event("input"));
				});
			});

			const temp = target.value;

			let activeIndex = -1;
			const setActiveIndex = (index: number) => {
				activeIndex = index;
				dropdownItems.forEach((item, i) => {
					if (i === activeIndex) {
						item.classList.add("selected");
						return;
					}
					item.classList.remove("selected");
				});
			};

			target.addEventListener("keydown", (e) => {
				switch (e.key) {
					case "Escape": {
						const item = dropdownItems[activeIndex];
						if (!item) {
							return;
						}

						this.emitInputEvent(target, temp || "");
						target.focus();

						break;
					}
					case "ArrowDown": {
						e.preventDefault();

						if (activeIndex === -1) {
							setActiveIndex(0);
							return;
						}
						if (activeIndex === dropdownItems.length - 1) {
							return;
						}

						setActiveIndex(activeIndex + 1);

						const activeItem = dropdownItems[activeIndex];

						if (!activeItem) {
							return;
						}

						dropdown.scrollTop = activeItem.offsetTop - dropdown.clientHeight + activeItem.clientHeight;

						const item = dropdownItems[activeIndex];
						if (!item) {
							return;
						}

						const value = item.dataset.value;

						if (!value) {
							return;
						}

						this.setUnitToNone(target);
						this.emitInputEvent(target, value);
						target.focus();

						break;
					}
					case "ArrowUp": {
						e.preventDefault();
						if (activeIndex === -1) {
							setActiveIndex(dropdownItems.length - 1);

							return;
						}
						if (activeIndex === 0) {
							return;
						}

						setActiveIndex(activeIndex - 1);

						const activeItem = dropdownItems[activeIndex];

						if (!activeItem) {
							return;
						}

						dropdown.scrollTop = activeItem.offsetTop - dropdown.clientHeight + activeItem.clientHeight;

						const item = dropdownItems[activeIndex];
						if (!item) {
							return;
						}

						const value = item.dataset.value;

						if (!value) {
							return;
						}

						this.setUnitToNone(target);
						this.emitInputEvent(target, value);
						target.focus();

						break;
					}
					case "Enter": {
						e.preventDefault();
						if (activeIndex === -1) {
							return;
						}
						const item = dropdownItems[activeIndex];
						if (!item) {
							return;
						}

						const value = item.dataset.value;

						if (!value) {
							return;
						}

						this.emitInputEvent(target, value);
						target.focus();

						document.querySelectorAll(".cf-variable-dropdown").forEach((dropdown) => {
							dropdown?.remove();
						});

						this.setUnitToNone(target);
						applyColorPreview(target, value);

						break;
					}
				}
			});
		}

		onClick(
			e: Event & {
				metaKey?: boolean;
				altKey?: boolean;
			},
		) {
			if (!e.isTrusted) {
				return;
			}

			if (e?.metaKey || e?.altKey) {
				return;
			}

			const target = e.target as HTMLInputElement;

			this.sortVariables(target);

			const options = this.filterVariables(target.value);

			if (!options.length) {
				return;
			}

			this.createDropdown({
				options,
				target,
			});
		}

		onType(
			e: Event & {
				metaKey?: boolean;
				altKey?: boolean;
			},
		) {
			if (!e.isTrusted) {
				return;
			}

			if (e?.metaKey || e?.altKey) {
				return;
			}

			const target = e.target as HTMLInputElement;
			const value = target.value;
			const options = this.filterVariables(value);

			if (!options.length) {
				return;
			}

			this.createDropdown({
				options,
				target,
			});
		}

		onInputBlur(e: FocusEvent | Event) {
			document.querySelectorAll(".cf-variable-dropdown").forEach((dropdown) => {
				dropdown?.remove();
			});

			const inputs = document.querySelectorAll(`.oxygen-control input[type="text"]`);
			inputs.forEach((input) => {
				// @ts-ignore
				input.removeEventListener("click", this.onInputFocus);
				input.removeEventListener("blur", this.onInputBlur);
			});

			const relatedItem = (e as FocusEvent).relatedTarget as HTMLElement | null;

			if (!relatedItem) {
				return;
			}

			const isDropdownItem = relatedItem.dataset.type === "variable-dropdown-item";

			if (!isDropdownItem) {
				return;
			}

			const value = relatedItem.dataset.value;
			const input = e?.target as HTMLInputElement | null;

			if (!input || !value) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			input.value = value;
			input.dispatchEvent(new Event("input"));
			input.focus();

			const option = input.previousElementSibling?.classList.contains("oxygen-color-picker-color")
				? "color"
				: input.getAttribute("data-option");

			try {
				window?.$scope.iframeScope.setOptionUnit(option, " ");
			} catch {}

			applyColorPreview(input, value);
		}

		setVariableAutocomplete() {
			const previousDropdowns = document.querySelectorAll(".cf-variable-dropdown");
			previousDropdowns.forEach((dropdown) => {
				dropdown?.remove();
			});

			const inputs = document.querySelectorAll(inputsSelector);

			inputs.forEach((input) => {
				input.removeEventListener("click", this.onClick.bind(this));
				input.removeEventListener("focusout", this.onInputBlur.bind(this));
				input.removeEventListener("input", this.onType.bind(this));

				input.addEventListener("click", this.onClick.bind(this));
				input.addEventListener("focusout", this.onInputBlur.bind(this));
				input.addEventListener("input", this.onType.bind(this));
			});
		}

		async getVariables(): Promise<boolean> {
			window.coreframework = {
				nonce: window.wpApiSettings.nonce,
				rest_url: window.wpApiSettings.root,
				core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
			};

			try {
				const res = await fetch(`${window.coreframework.core_api_url}get-variables?type=oxygen_dropdown`, {
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
				console.error(e);
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

		instance: HTMLElement | null = null;
		focusedInput: HTMLInputElement | null = null;
		tempInputValue: string | null = null;
		isOpen: boolean = false;
		boundOnClickCallback: (e: MouseEvent) => void;

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

		constructor() {
			this.init();
			this.boundOnClickCallback = this.onClickCallback.bind(this);
		}

		async init() {
			if (!assertOption("oxygen_variable_ui")) {
				return;
			}

			const didLoadVariables = await this.getVariables();

			if (!didLoadVariables) {
				return;
			}

			const targets = [
				"#oxygen-sidebar-control-panel-basic-styles",
				".oxygen-select",
				"#oxygen-sidebar",
				".oxygen-sidebar-advanced-home",
			];

			targets.forEach((target) => {
				observe({
					selector: target,
					callback: () => {
						this.addTriggers();
					},
					options: {
						subtree: false,
						childList: false,
						attributes: true,
					},
				});
			});

			observe({
				selector: ".oxygen-active-element-name",
				callback: () => {
					this.addTriggers();
				},
				options: {
					subtree: true,
					childList: true,
					attributes: false,
				},
			});

			this.createInstance();
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

				this.focusedInput.value = variableParsed;
				this.tempInputValue = variableParsed;
				this.focusedInput.dispatchEvent(new Event("input"));
				this.focusedInput.focus();

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}

				applyColorPreview(this.focusedInput, variableParsed);

				if (assertOption("oxygen_enable_variable_ui_auto_hide")) {
					this.close();
				}
			});

			button.addEventListener("mouseenter", () => {
				if (!this.focusedInput || !assertOption("oxygen_enable_unit_and_value_preview")) {
					return;
				}

				const variableParsed = variable.startsWith("var(--") ? variable : `var(--${variable})`;

				this.focusedInput.value = variableParsed;
				this.focusedInput.dispatchEvent(new Event("input"));
				this.focusedInput.focus();

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}

				applyColorPreview(this.focusedInput, variableParsed);
			});

			button.addEventListener("mouseleave", () => {
				if (
					!this.focusedInput ||
					this.tempInputValue === null ||
					!assertOption("oxygen_enable_unit_and_value_preview")
				) {
					return;
				}

				this.focusedInput.value = this.tempInputValue;
				this.focusedInput.dispatchEvent(new Event("input"));
				this.focusedInput.focus();

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}

				applyColorPreview(this.focusedInput, this.tempInputValue);
			});

			return button;
		}

		getPrefixedVariableName(variable: string) {
			return variable.startsWith(this.variablePrefix) ? variable : `${this.variablePrefix}${variable}`;
		}

		createColorButton({
			variable,
			color,
			darkColor,
			transparent,
		}: {
			variable: string;
			color: string;
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
				}

				if (transparent === undefined) {
					button.style.setProperty("--cf-variable-ui-color", color);
					button.style.setProperty("--cf-variable-ui-color-dark", darkColor ?? color);
				}
			}

			button.addEventListener("click", () => {
				if (!this.focusedInput) {
					return;
				}

				const variableParsed = variable.startsWith("var(--") ? variable : `var(--${variable})`;

				this.focusedInput.value = variableParsed;
				this.tempInputValue = variableParsed;
				this.focusedInput.dispatchEvent(new Event("input"));
				this.focusedInput.focus();

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}

				applyColorPreview(this.focusedInput, variableParsed);

				if (assertOption("oxygen_enable_variable_ui_auto_hide")) {
					this.close();
				}
			});

			button.addEventListener("mouseenter", () => {
				if (!this.focusedInput || !assertOption("oxygen_enable_unit_and_value_preview")) {
					return;
				}

				const variableParsed = variable.startsWith("var(--") ? variable : `var(--${variable})`;

				this.focusedInput.value = variableParsed;
				this.focusedInput.dispatchEvent(new Event("input"));
				this.focusedInput.focus();

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}

				applyColorPreview(this.focusedInput, variableParsed);
			});

			button.addEventListener("mouseleave", () => {
				if (
					!this.focusedInput ||
					this.tempInputValue === null ||
					!assertOption("oxygen_enable_unit_and_value_preview")
				) {
					return;
				}

				this.focusedInput.value = this.tempInputValue;
				this.focusedInput.dispatchEvent(new Event("input"));
				this.focusedInput.focus();

				const option = this.focusedInput.previousElementSibling?.classList.contains(
					"oxygen-color-picker-color",
				)
					? "color"
					: this.focusedInput.getAttribute("data-option");

				try {
					window?.$scope.iframeScope.setOptionUnit(option, " ");
				} catch {}

				applyColorPreview(this.focusedInput, this.tempInputValue);
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

			draggable.addEventListener("mousedown", handleDragStart);

			const handleDrag = (e: MouseEvent) => {
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

			document.addEventListener("mousemove", handleDrag);

			const endDragging = (e: MouseEvent) => {
				[...document.querySelectorAll("iframe")].forEach((iframe) => {
					iframe.style.pointerEvents = "auto";
					iframe.style.userSelect = "auto";
				});

				isDragging = false;
			};

			document.addEventListener("mouseup", endDragging);
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
			main.classList.add("is-oxygen");
			main.style.position = "fixed";
			main.style.display = "none";
			main.style.width = "300px";
			main.style.height = "500px";
			main.style.zIndex = "1000";
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
			openCoreFrameworkLink.classList.add("cf-variable-ui-open-core-framework");
			openCoreFrameworkLink.textContent = "Open";
			openCoreFrameworkLink.dataset.cftooltip = "Open Core Framework plugin";

			const closeButton = document.createElement("button");
			closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
			closeButton.classList.add("cf-variable-ui-close-button");
			closeButton.dataset.cftooltip = "Close";

			closeButton.addEventListener("click", this.close.bind(this));

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
						color.isShades && color.shades
							? color.shades.map((shade, index) => {
									const darkColor = color.darkShades?.[index]?.value;
									return this.createColorButton({
										variable: shade.name,
										color: shade.value,
										darkColor,
									});
								})
							: [];

					if (shades.length) {
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
						color.isTints && color.tints
							? color.tints.map((tint, index) => {
									const darkColor = color.darkTints?.[index]?.value;
									return this.createColorButton({
										variable: tint.name,
										color: tint.value,
										darkColor,
									});
								})
							: [];

					if (tints.length) {
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
							});
						}) ?? [];

					if (transparent.length) {
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
							const prefix =
								this.variablePrefix +
								(category === "Fluid Typography"
									? this.fluid_typography_naming_convention
									: this.fluid_spacing_naming_convention) +
								"-";
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
			this.isOpen = false;
			this.tempInputValue = null;

			const html = document.querySelector("html");

			if (!html) {
				return;
			}

			html.dataset.cfVariableUiOpen = "false";
			[...document.querySelectorAll("iframe")].forEach((iframe) => {
				iframe.style.pointerEvents = "auto";
				iframe.style.userSelect = "auto";
			});
		}

		async getVariables(): Promise<boolean> {
			window.coreframework = {
				nonce: window.wpApiSettings.nonce,
				rest_url: window.wpApiSettings.root,
				core_api_url: `${window.wpApiSettings.root}core-framework/v2/`,
			};

			try {
				const res = await fetch(`${window.coreframework.core_api_url}builders-var-ui`, {
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
					variables: Record<string, Record<string, string[]>>;
					color_system_data: ColorSystem;
					variable_prefix: string;
					fluid_typography_naming_convention: TypographyScale;
					fluid_spacing_naming_convention: SpacingScale;
				};

				if (!json?.variables) {
					log("No variables found. Please save changes again in the Core Framework plugin.");
					return false;
				}

				this.variables = getUniqueVariables(json.variables);

				if (!json.color_system_data) {
					log("No color system data found. Please save changes again in the Core Framework plugin.");
					return false;
				}

				this.colorSystemData = json.color_system_data;
				this.variablePrefix = json.variable_prefix;
				this.fluid_typography_naming_convention = json.fluid_typography_naming_convention;
				this.fluid_spacing_naming_convention = json.fluid_spacing_naming_convention;

				return true;
			} catch (e) {
				log("Failed to load variables.");
				console.error(e);
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

		onClickCallback(e: MouseEvent) {
			const isContextMenu = e.type === "contextmenu" && assertOption("oxygen_enable_variable_context_menu");

			if (isContextMenu) {
				e.preventDefault();
				e.stopPropagation();
			}

			if (!this.isOpen && !(e?.metaKey || e?.altKey) && !isContextMenu) {
				return;
			}

			const input = e.target as HTMLInputElement | null;

			if (!input) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			this.focusedInput = input;
			this.tempInputValue = input.value;

			const isColorDropdown = input.parentElement?.classList.contains("oxygen-color-picker");
			const isFontSize = input.dataset.option === "font-size";
			const SPACING_KEYS = ["padding", "margin", "gap", "width", "height"];
			const isSpacing = SPACING_KEYS.some((key) => String(input.dataset.option).includes(key));

			if (this.instance) {
				this.instance.dataset.enableColors = isColorDropdown ? "true" : "false";
				const colorWrapper = this.instance.querySelector(
					".cf-variable-ui-wrapper[data-type='color-system']",
				) as HTMLDivElement | null;
				const fontSizeWrapper = this.instance.querySelector(
					".cf-variable-ui-wrapper[data-type='typographyStyles']",
				) as HTMLDivElement | null;
				const target = this.instance.querySelector(
					".cf-variable-ui-wrapper[data-type='spacingStyles']",
				) as HTMLDivElement | null;

				for (const wrapper of [colorWrapper, fontSizeWrapper, target]) {
					if (!wrapper) {
						return;
					}
					wrapper.dataset.groupExpand = "false";
				}

				if (isColorDropdown && colorWrapper) colorWrapper.dataset.groupExpand = "true";
				if (isFontSize && fontSizeWrapper) fontSizeWrapper.dataset.groupExpand = "true";
				if (isSpacing && target) target.dataset.groupExpand = "true";
			}

			this.open();

			document.querySelectorAll(".cf-variable-dropdown").forEach((dropdown) => dropdown?.remove());
		}

		addTriggers() {
			document.querySelectorAll(".cf-variable-ui-trigger").forEach((trigger) => {
				trigger?.remove();
			});

			(document.querySelectorAll(inputsSelector) as NodeListOf<HTMLInputElement>).forEach((input) => {
				input.removeEventListener("click", this.boundOnClickCallback);
				input.addEventListener("click", this.boundOnClickCallback);

				if (assertOption("oxygen_enable_variable_context_menu")) {
					input?.removeEventListener("contextmenu", this.boundOnClickCallback);
					input?.addEventListener("contextmenu", this.boundOnClickCallback);
				}
			});

			const onKeyDowListener = (e: KeyboardEvent) => {
				if (e.key === "Escape" && this.instance?.style.getPropertyValue("display") === "block") {
					this.close();
				}
			};

			document.removeEventListener("keydown", onKeyDowListener);
			document.addEventListener("keydown", onKeyDowListener);

			const onClick = (e: MouseEvent) => {
				if (
					this.isOpen &&
					!this?.instance?.contains(e.target as Node) &&
					!(e.target as HTMLButtonElement)?.classList.contains("cf-variable-ui-trigger") &&
					!(e.target as HTMLButtonElement)?.parentElement?.classList.contains("cf-variable-ui-trigger")
				) {
					this.close();
				}
			};

			if (assertOption("oxygen_enable_variable_ui_auto_hide")) {
				document.removeEventListener("click", onClick);
				document.addEventListener("click", onClick);
			}
		}
	}

	class Fonts {
		fonts: Font[] = [];

		constructor() {
			this.init();
		}

		async init() {
			await this.setFonts();
			let prevEventMap = new Map<HTMLInputElement, EventListener>();

			observe({
				selector: `#oxygen-sidebar`,
				callback: (mutationsList) => {
					const isCoreGroupAdded = mutationsList.some((mutation) => {
						return [...mutation.addedNodes].some((node: any) => {
							return (
								(node.nodeType === Node.ELEMENT_NODE && node.id === "core-subtitle") ||
								node.id === "core-icon"
							);
						});
					});

					if (!isCoreGroupAdded) {
						const fontFamilyDropdown = document.getElementById("oxygen-typography-font-family");
						const input = fontFamilyDropdown?.querySelector("input");
						const onChange = (dropdown: any) => {
							this.applyCoreOptionsView(dropdown as HTMLElement, true);
						};

						fontFamilyDropdown && this.applyCoreOptionsView(fontFamilyDropdown, true);

						if (input && !prevEventMap.get(input)) {
							input.addEventListener("input", () => onChange(fontFamilyDropdown));
							prevEventMap.set(input, () => onChange(fontFamilyDropdown));
						}
					}
				},
				options: {
					subtree: true,
					childList: true,
					attributes: false,
				},
			});

			observe({
				selector: `#oxygen-global-settings`,
				callback: (mutationsList) => {
					const isCoreGroupAdded = mutationsList.some((mutation) => {
						return [...mutation.addedNodes].some((node: any) => {
							return (
								(node.nodeType === Node.ELEMENT_NODE && node.id === "core-subtitle") ||
								node.id === "core-icon"
							);
						});
					});

					if (!isCoreGroupAdded) {
						const settingsFontDropdownList = document.querySelectorAll(".oxygen-control-global-font");
						const onChange = (dropdown: any) => {
							this.applyCoreOptionsView(dropdown as HTMLElement);
						};

						settingsFontDropdownList.forEach((dropdown) => {
							this.applyCoreOptionsView(dropdown as HTMLElement);
							const input = dropdown.querySelector("input");

							if (input && !prevEventMap.get(input)) {
								input.addEventListener("input", () => onChange(dropdown));
								prevEventMap.set(input, () => onChange(dropdown));
							}
						});
					}
				},
				options: {
					subtree: true,
					childList: true,
					attributes: false,
				},
			});
		}

		async setFonts(): Promise<void> {
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

				this.fonts = fonts.filter((font: Font) => font.enable);
			} catch (e) {
				console.log(e);
			}
		}

		applyCoreOptionsView(wrapperSelector: HTMLElement, isSidebar = false): void {
			const mainOxyFonts = Object.values(window.$scope.iframeScope.globalSettings.fonts) || [];
			const yabeFonts = (window as any)["core_yabe_fonts"] || [];
			const fontsWrapper = wrapperSelector.querySelector(".oxygen-select-box-options");
			const coreSubtitle = wrapperSelector.querySelector("#core-subtitle");
			coreSubtitle?.remove();

			if (fontsWrapper && this.fonts.length) {
				const children = Array.from(fontsWrapper.children);
				const coreSubTitle = document.createElement("div");
				let theLastFontOption = null,
					theFirstFontOption: any = null;

				coreSubTitle.setAttribute("id", "core-subtitle");
				coreSubTitle.textContent = "Core Framework";
				coreSubTitle.classList.add("oxygen-select-box-option");
				Object.assign(coreSubTitle.style, {
					backgroundColor: "var(--oxy-dark)",
					fontWeight: 700,
					letterSpacing: ".2px",
					pointerEvents: "none",
					textTransform: "uppercase",
				});

				this.fonts.forEach((font) => {
					const targetFontOption = getChild(children, font) as HTMLDivElement;
					const isConflictedFont = yabeFonts.includes(font.family);
					const coreSub = fontsWrapper.querySelector("#core-subtitle");

					coreSub && coreSub.remove();

					if (targetFontOption && isConflictedFont) {
						targetFontOption.style.setProperty("border-bottom", "none");
						targetFontOption.querySelector("#core-icon")?.remove();
					}

					if (targetFontOption && !isConflictedFont) {
						const check = isSidebar ? !mainOxyFonts.includes(font.family) : true;
						if (check) {
							theLastFontOption = targetFontOption;
							!theFirstFontOption && (theFirstFontOption = targetFontOption);
						}

						targetFontOption.style.setProperty("justify-content", "space-between");
						targetFontOption.style.setProperty("border-bottom", "none");

						const coreIcon = document.createElement("span");
						coreIcon.setAttribute("id", "core-icon");
						Object.assign(coreIcon.style, {
							width: "13px",
							height: "13px",
							padding: "0",
							background: "none",
						});
						coreIcon.innerHTML = `
							<svg
								id="b"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 31.82 24.84"
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
										path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" style="fill:#424ae1;"></path>
									</g>
								</g>
							</svg>
						`;

						if (mainOxyFonts.includes(font.family) && isSidebar) {
							targetFontOption.style.setProperty("border-bottom", "none");
							targetFontOption.querySelector("#core-icon")?.remove();
						} else {
							targetFontOption.textContent = `${font.title} (${font.family})`;
							targetFontOption.appendChild(coreIcon);
						}
					}
				});

				theLastFontOption &&
					((theLastFontOption as HTMLDivElement).style.borderBottom = "2px solid var(--oxy-dark)");
				theFirstFontOption && fontsWrapper.insertBefore(coreSubTitle, theFirstFontOption);
				theFirstFontOption = null;
			}
		}
	}

	const main = () => {
		addThemeToggleButton();
		applyClassOnHover();
		new VariableAutoComplete();
		new VariableUi();

		const pageLoader = document.querySelector("#oxy-page-loader")!;
		const observer = new MutationObserver((mutations) => {
			mutations.forEach(() => {
				const isLoaded = window.getComputedStyle(pageLoader).display === "none";

				if (isLoaded) {
					observer.disconnect();
					new Fonts();
				}
			});
		});
		observer.observe(pageLoader, {
			childList: true,
			subtree: true,
		});
	};

	document.addEventListener("DOMContentLoaded", main);
})();
