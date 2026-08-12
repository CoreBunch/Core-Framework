const page = window.parent.document;

interface Window {
    Breakdance?: {
        stores: {
            globalStore: any;
            documentStore: any;
            uiStore: any;
            configStore: any;
        },
        restNonce: any;
        restUrl: any;
    };
    breakdanceUndo?: {
        transaction: (...args: any[]) => any;
    };
}

interface SelectorClass {
    id: string;
    name: string;
    properties?: Record<string, any> | null;
    children: [];
    locked: boolean;
    collection: string;
    type: 'class' | 'custom';
}

interface CoreColor {
    id: string;
    name: string;
    value: string;
    raw: string;
    dark?: boolean;
}

interface Font {
    family: string;
    title: string;
    enable: boolean;
}

interface OxyVariable {
    collection: string;
    cssVariableName: string;
    id: string;
    label: string;
    type: "color" | "font" | "unit";
    value: string | { number: string; style: string; unit: string };
}

interface OxygenGlobalStore {
    variables: OxyVariable[];
    variablesCollections: string[];
    oxySelectors: SelectorClass[];
    oxySelectorsCollections: string[];
    setVariables: (variables: OxyVariable[]) => void;
    setVariablesCollections: (collections: string[]) => void;
    setOxygenSelectors: (selectors: SelectorClass[]) => void;
    setOxygenSelectorsCollections: (collections: string[]) => void;
}

(() => {
    // Cleanup registry for observers and listeners
    const observers: MutationObserver[] = [];
    const cleanupFns: (() => void)[] = [];

    const registerObserver = (obs: MutationObserver) => {
        observers.push(obs);
        return obs;
    };

    const registerParentListener = (
        target: EventTarget,
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ) => {
        target.addEventListener(event, handler, options);
        cleanupFns.push(() => target.removeEventListener(event, handler, options as any));
    };

    // Clean up on iframe unload (builder navigation/refresh)
    window.addEventListener("unload", () => {
        observers.forEach(obs => obs.disconnect());
        cleanupFns.forEach(fn => fn());
        observers.length = 0;
        cleanupFns.length = 0;
    });

    const getChild = (children: ChildNode[], data: Font): ChildNode | undefined => {
        return children.find(child => child.textContent?.trim() === data.title);
    };

    const DEFAULT_CORE_FRAMEWORK_CONNECTOR = {
        theme_mode: "light",
        oxygen_enable_dark_mode_preview: true,
        oxygen_apply_class_on_hover: true,
        oxygen_enable_unit_and_value_preview: true,
    } as const satisfies Partial<Window["core_framework_connector"]>;

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

    enum ThemeClasses {
        DARK = "cf-theme-dark",
        LIGHT = "cf-theme-light",
    }

    const log = (_message: string, ..._args: unknown[]) => {};

    const addThemeToggleButton = () => {
        if (!assertOption("oxygen_enable_dark_mode_preview")) {
            return;
        }

        const themeMode = window?.core_framework_connector?.theme_mode ?? "light";
        const CT_IFRAME_ID = "iframe";
        const topbarSection = page.querySelector(".topbar-section");
        const toggleButton = page.createElement("div");
        const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
        const isDark = savedTheme === "dark";

        if (!topbarSection) {
            log("Left panel not found");
            return;
        }

        toggleButton.classList.add("breakdance-toolbar-icon-button", "cf-theme-toggle");
        toggleButton.setAttribute("title", "Toggle dark/light theme (Core Framework)");

        // Sun icon (shown in light mode — represents current state)
        const sunIcon = `<svg class="cf-theme-icon cf-theme-icon--sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`;

        // Moon icon (shown in dark mode — represents current state)
        const moonIcon = `<svg class="cf-theme-icon cf-theme-icon--moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>`;

        // Small CF badge
        const cfBadge = `<span class="cf-theme-badge">${coreIconSvg}</span>`;

        toggleButton.innerHTML = sunIcon + moonIcon + cfBadge;

        // Set initial visibility
        const sunEl = toggleButton.querySelector(".cf-theme-icon--sun") as HTMLElement;
        const moonEl = toggleButton.querySelector(".cf-theme-icon--moon") as HTMLElement;
        if (sunEl) sunEl.style.display = isDark ? "none" : "block";
        if (moonEl) moonEl.style.display = isDark ? "block" : "none";

        topbarSection.appendChild(toggleButton);

        const style = page.createElement("style");
        const css = `
            .cf-theme-toggle {
                position: relative;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                transition: background-color 0.15s ease;
                color: var(--oxy-text-secondary, #9ca3af);
            }
            .cf-theme-toggle:hover {
                background-color: var(--oxy-hover, rgba(255,255,255,0.08));
                color: var(--oxy-text-primary, #fff);
            }
            .cf-theme-icon {
                width: 18px;
                height: 18px;
            }
            .cf-theme-badge {
                position: absolute;
                bottom: 1px;
                right: 1px;
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
        `;

        style.appendChild(page.createTextNode(css));
        page.head.appendChild(style);

        type ThemeState = "dark" | "light";
        const flipToggles = (state: ThemeState) => {
            const iframeDocument = (page.getElementById(CT_IFRAME_ID) as HTMLIFrameElement | null)
                ?.contentDocument;

            if (!iframeDocument) {
                log("Iframe document not found");
                return;
            }

            [...iframeDocument.querySelectorAll(".cf-theme-toggle-button")].forEach((button) => {
                button.classList.add(state === "dark" ? ThemeClasses.DARK : ThemeClasses.LIGHT);
                button.classList.remove(state === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);
            });
        };

        const getSystemThemeClass = (): ThemeClasses =>
            window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
                ? ThemeClasses.DARK
                : ThemeClasses.LIGHT;

        const iframe = page.getElementById(CT_IFRAME_ID) as HTMLIFrameElement | null;

        iframe?.addEventListener("load", () =>
            setTimeout(() => {
                const iframeHtml = iframe?.contentDocument?.querySelector("html");
                const html = page.querySelector("html");
                if (!iframeHtml) {
                    log("Iframe html not found");
                    return;
                }

                iframeHtml.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);

                const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
                const defaultTheme = String(themeMode === "auto" ? getSystemThemeClass() : `cf-theme-${themeMode}`);

                iframeHtml.classList.add(savedTheme ? `cf-theme-${savedTheme}` : defaultTheme);
                html?.classList.add(savedTheme ? `cf-theme-${savedTheme}` : defaultTheme);
            }, 5),
        );

        toggleButton.addEventListener("click", () => {
            const iframeDocument = (page.getElementById(CT_IFRAME_ID) as HTMLIFrameElement | null)
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

            const html = page.querySelector("html");
            html?.classList.toggle(ThemeClasses.DARK);
            html?.classList.toggle(ThemeClasses.LIGHT);

            const sunIcon = toggleButton.querySelector(".cf-theme-icon--sun") as HTMLElement;
            const moonIcon = toggleButton.querySelector(".cf-theme-icon--moon") as HTMLElement;

            if (sunIcon) sunIcon.style.display = isDefaultDark ? "block" : "none";
            if (moonIcon) moonIcon.style.display = isDefaultDark ? "none" : "block";

            flipToggles(isDefaultDark ? "light" : "dark");
            window?.localStorage?.setItem("cf-theme", !isDefaultDark ? "dark" : "light");

            // Update color variable swatches when theme changes
            if (typeof updateColorVariablesForTheme === "function") {
                updateColorVariablesForTheme(!isDefaultDark);
            }
        });
    };

    // Generate UUID format for Oxygen 6 compatibility
    const generateUUID = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Shared utility: flatten grouped class structure into flat array
    const flattenClasses = (obj: any): string[] => {
        const result: string[] = [];
        for (const value of Object.values(obj)) {
            if (Array.isArray(value)) {
                result.push(...value.filter((v): v is string => typeof v === 'string'));
            } else if (typeof value === 'object' && value !== null) {
                result.push(...flattenClasses(value));
            }
        }
        return result;
    };

    const CORE_FRAMEWORK_CLASS_COLLECTION = "CoreFramework";
    const CORE_FRAMEWORK_COLOR_COLLECTION = "CoreFrameworkColors";
    const CORE_FRAMEWORK_UTILS_COLLECTION = "CoreFrameworkUtils";

    const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const mergeCollections = (existing: string[], collectionsToAdd: string[]) => {
        return [...new Set([...existing, ...collectionsToAdd])];
    };

    const hasCollections = (existing: string[], collectionsToFind: string[]) => {
        return collectionsToFind.every((collection) => existing.includes(collection));
    };

    const areEqual = (first: unknown, second: unknown) => {
        return JSON.stringify(first) === JSON.stringify(second);
    };

    const isOxygenGlobalStoreReady = (store: any): store is OxygenGlobalStore => {
        return !!store
            && Array.isArray(store.variables)
            && Array.isArray(store.variablesCollections)
            && Array.isArray(store.oxySelectors)
            && Array.isArray(store.oxySelectorsCollections)
            && typeof store.setVariables === "function"
            && typeof store.setVariablesCollections === "function"
            && typeof store.setOxygenSelectors === "function"
            && typeof store.setOxygenSelectorsCollections === "function";
    };

    const getReadyOxygenGlobalStore = (): OxygenGlobalStore | null => {
        const stores = window.parent.Breakdance?.stores;
        if (
            stores?.uiStore?.interfaceState === "loading"
            || stores?.uiStore?.saveInProgress
        ) {
            return null;
        }

        return isOxygenGlobalStoreReady(stores?.globalStore)
            ? stores.globalStore
            : null;
    };

    const waitForOxygenGlobalStore = async (): Promise<OxygenGlobalStore | null> => {
        for (let attempt = 0; attempt < 50; attempt++) {
            const globalStore = getReadyOxygenGlobalStore();
            if (globalStore) {
                return globalStore;
            }

            await delay(100);
        }

        return null;
    };

    const saveOxygenBuilder = async () => {
        for (let attempt = 0; attempt < 50; attempt++) {
            const save = page.querySelector(".button-save-oxygen") as HTMLButtonElement | null;
            const isSaving = window.parent.Breakdance?.stores?.uiStore?.saveInProgress
                || save?.classList.contains("button-save-oxygen-loading");

            if (save && !isSaving) {
                save.click();

                for (let saveAttempt = 0; saveAttempt < 100; saveAttempt++) {
                    await delay(100);
                    const saveInProgress = window.parent.Breakdance?.stores?.uiStore?.saveInProgress
                        || save.classList.contains("button-save-oxygen-loading");
                    if (!saveInProgress) {
                        return;
                    }
                }

                return;
            }

            await delay(100);
        }
    };

    const runOxygenTransaction = (callback: () => void, label: string) => {
        const undo = window.parent.breakdanceUndo;
        if (typeof undo?.transaction === "function") {
            undo.transaction(callback, label);
            return;
        }

        callback();
    };

    class ClassAutosuggestions {
        suggestions: string[] = [];

        constructor() {
            this.init();
        }

        async init() {
            this.suggestions = await this.getClasses();
            this.initClassInputEvents();
        }

        async getClasses(): Promise<string[]> {
            try {
                // Use grouped classes API (NOT type=oxy which has wrong names)
                const res = await fetch(`${window.coreframework.core_api_url}get-classes`, {
                    method: "GET",
                    headers: {
                        "X-WP-Nonce": window.coreframework.nonce,
                    },
                });

                if (!res.ok) {
                    log("Failed to load classes.");
                    return [];
                }

                const json = (await res.json()) as { classes: Record<string, any> };

                if (!json?.classes) {
                    log("No classes found. Please save changes again in the Core Framework plugin.");
                    return [];
                }

                return [...new Set(flattenClasses(json.classes))];
            } catch (e) {
                log("Failed to load classes.");
                log("Error:", e);
                return [];
            }
        }

        getActiveElement(): HTMLElement | null {
            const iframe = page.getElementById("iframe") as HTMLIFrameElement | null;
            return iframe?.contentDocument?.querySelector(".breakdance--active-element") as HTMLElement | null;
        }

        initClassInputEvents() {
            const classInput = page.querySelector(".oxy-class-selector input");

            classInput?.addEventListener('input', (e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = target.value;

                if (value.length > 0) {
                    const newClassItem = page.querySelector(".oxy-class-selector-new-class") as HTMLDivElement | null;
                    if (!newClassItem) return;

                    const autosuggestionList = newClassItem.closest(".v-list") as HTMLDivElement | null;
                    if (!autosuggestionList) return;

                    // Get existing selectors to check if class already exists
                    const stores = window.parent.Breakdance?.stores;
                    const existingSelectors = stores?.globalStore.oxySelectors as SelectorClass[] || [];

                    this.suggestions.forEach((suggestion) => {
                        // Skip if this class already exists as a selector (Oxygen will show it natively)
                        const selectorExists = existingSelectors.some((s: SelectorClass) => s.name === suggestion);
                        if (selectorExists) return;

                        const existedSuggestionClassItem: any = Array.from(autosuggestionList?.children)
                            .find((child) => child.getAttribute("id") === `list-item-${suggestion}`);

                        if (existedSuggestionClassItem) {
                            suggestion.includes(value) || existedSuggestionClassItem.remove();
                        } else if (suggestion.includes(value) || value.trim().length === 0) {
                            const wrapper = page.createElement("div");

                            wrapper.setAttribute("tabindex", "0");
                            wrapper.setAttribute("role", "option");
                            wrapper.setAttribute("id", `list-item-${suggestion}`);
                            wrapper.className = "v-list-item v-list-item--density-compact v-list-item--link";

                            // Build DOM programmatically to avoid innerHTML XSS
                            const contentDiv = page.createElement("div");
                            contentDiv.className = "v-list-item__content";
                            const titleDiv = page.createElement("div");
                            titleDiv.className = "v-list-item-title";
                            const newClassDiv = page.createElement("div");
                            newClassDiv.className = "oxy-class-selector-new-class";
                            newClassDiv.appendChild(page.createTextNode("Create "));
                            const tokenDiv = page.createElement("div");
                            tokenDiv.className = "oxy-class-token oxy-class-token--active";
                            const tokenSpan = page.createElement("span");
                            tokenSpan.className = "oxy-class-token-source";
                            tokenSpan.textContent = suggestion;
                            tokenDiv.appendChild(tokenSpan);
                            newClassDiv.appendChild(tokenDiv);
                            titleDiv.appendChild(newClassDiv);
                            contentDiv.appendChild(titleDiv);
                            wrapper.appendChild(contentDiv);

                            wrapper.addEventListener("click", () => {
                                // Remove preview class before adding permanently
                                const activeElement = this.getActiveElement();
                                if (activeElement) {
                                    activeElement.classList.remove(suggestion);
                                }

                                const stores = window.parent.Breakdance?.stores;
                                if (!stores) return;
                                const globalStore = getReadyOxygenGlobalStore();
                                if (!globalStore) return;
                                const selectors = globalStore.oxySelectors;
                                const elementId = stores.uiStore.activeElement?.id;
                                if (!elementId) return;

                                // Find existing selector by name, or create new one
                                let selector = selectors.find((s: SelectorClass) => s.name === suggestion);

                                if (!selector) {
                                    selector = this.createSelectorFromName(suggestion);
                                    const newSelectors = [...selectors, selector];
                                    globalStore.setOxygenSelectors(newSelectors);
                                    globalStore.setOxygenSelectorsCollections(
                                        mergeCollections(
                                            globalStore.oxySelectorsCollections,
                                            [CORE_FRAMEWORK_CLASS_COLLECTION]
                                        )
                                    );
                                }

                                // Get element directly from lookup table
                                const documentData = stores?.documentStore.document;
                                const element = documentData?.tree?._lookupTable?.[elementId];

                                // Classes are stored at element.data.properties.meta
                                const existingMeta = element?.data?.properties?.meta;
                                const existingClasses = existingMeta?.classes || [];

                                // Only add if not already present
                                if (!existingClasses.includes(selector.id)) {
                                    const updatedClasses = [...existingClasses, selector.id];
                                    // Clone the entire meta object and update classes, preserving friendlyName
                                    const clonedMeta = existingMeta ? JSON.parse(JSON.stringify(existingMeta)) : {};
                                    clonedMeta.classes = updatedClasses;

                                    // Write the full meta object to preserve all properties
                                    stores?.documentStore.unthrottledPropertyChanged({
                                        elementId: elementId,
                                        path: "meta",
                                        meta: {
                                            snapshotLabel: `Add class: ${suggestion}`
                                        },
                                        value: clonedMeta
                                    });
                                }

                                this.activateSelector(selector.id, target);
                            });

                            // Preview class on hover
                            wrapper.addEventListener("mouseenter", () => {
                                if (!assertOption("oxygen_apply_class_on_hover")) return;
                                const activeElement = this.getActiveElement();
                                if (activeElement) {
                                    activeElement.classList.add(suggestion);
                                }
                            });

                            wrapper.addEventListener("mouseleave", () => {
                                if (!assertOption("oxygen_apply_class_on_hover")) return;
                                const activeElement = this.getActiveElement();
                                if (activeElement) {
                                    activeElement.classList.remove(suggestion);
                                }
                            });

                            autosuggestionList?.appendChild(wrapper);
                        }
                    });
                }
            });
        }

        createSelectorFromName(
            name: string,
            properties?: Record<string, any> | null,
            type: "class" | "custom" = "class",
            collection = CORE_FRAMEWORK_CLASS_COLLECTION
        ): SelectorClass {
            return {
                id: generateUUID(),
                name,
                properties,
                children: [],
                locked: collection === "CoreFramework",
                collection,
                type
            };
        };

        activateSelector(id: string, target: HTMLInputElement) {
            const store = window.parent.Breakdance?.stores.uiStore;

            store.setCurrentElementOxySelector(id);
            store.setCurrentElementTab("classes");

            target.focus();
            target.blur();
        }
    }

    class CoreFonts {
        fonts: Font[] = [];

        constructor() {
            this.init();
        }

        async init() {
            this.fonts = await this.getFonts();
            this.initCoreFonts();
        }

        async getFonts(): Promise<Font[] | []> {
            try {
                const response = await fetch(`${window.coreframework.core_api_url}get-core-fonts`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': window.coreframework.nonce,
                    }
                });

                if (!response.ok) {
                    log("Failed to load fonts — HTTP " + response.status);
                    return [];
                }

                const data = await response.json();
                const fonts = data?.fonts;
                if (!Array.isArray(fonts)) return [];

                return fonts.filter((font: Font) => font.enable);
            } catch(e) {
                log("Failed to load fonts.");
                log("Error:", e);
                return [];
            }
        }

        addCoreSubtitleAndIcons() {
            const optionTitles = page.querySelectorAll(".v-list-item-title");
            if (!optionTitles.length || !this.fonts[0]) return;
            const fontsOption = Array.from(optionTitles)
                .find((option) => option.textContent?.includes(this.fonts[0]?.title as string));
            const fontsList = fontsOption?.closest(".v-list");
            const coreIcons = fontsList?.querySelectorAll(".core-icon");
            coreIcons?.forEach((icon) => icon.remove());

            if (fontsList) {
                const coreGroup = fontsList.querySelector("#core-subtitle");
                const children = Array.from(fontsList?.children) as ChildNode[];
                let atLeastOneCoreFont = false;
                const modified: string[] = [];

                this.fonts.forEach((font: Font) => {
                    const fontOption = getChild(children, font) as HTMLDivElement;
                    if (fontOption) atLeastOneCoreFont = true;

                    if (fontOption && !modified.includes(font.title)) {
                        modified.push(font.title);
                        Object.assign(fontOption.style, {
                            "display": "flex",
                            "justify-content": "space-between",
                            "align-items": "center"
                        });

                        const coreIcon = page.createElement("span");
                        coreIcon.style.setProperty("width", "14px");
                        coreIcon.style.setProperty("height", "14px");
                        Object.assign(coreIcon.style, {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        });
                        coreIcon.classList.add("core-icon");
                        coreIcon.innerHTML = coreIconSvg;
                        fontOption.appendChild(coreIcon);
                    }
                });

                atLeastOneCoreFont || coreGroup?.remove();

                if (!coreGroup && atLeastOneCoreFont) {
                    const coreSubTitle = children[1]?.cloneNode(true) as HTMLDivElement;
                    coreSubTitle.setAttribute('id', 'core-subtitle')
                    coreSubTitle.textContent = 'Core Framework';
                    Object.assign(coreSubTitle.style, {
                        backgroundColor: 'var(--oxygenActive)',
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: '.2px',
                        pointerEvents: 'none',
                        textTransform: 'uppercase'
                    });
                    fontsList.prepend(coreSubTitle);
                    atLeastOneCoreFont = false;
                }
            }
        }

        private fontInputListenerAttached = false;

        initCoreOptionsView(mutationsList: MutationRecord[]) {
            const fontInput = page.querySelector(".oxy-font-input input");
            const isFontsChanged = mutationsList.some((mutation: MutationRecord) => {
                return (mutation?.target as Element).closest(".oxy-font-input");
            });

            if (isFontsChanged) {
                if (!this.fontInputListenerAttached && fontInput) {
                    fontInput.addEventListener("input", () => {
                        this.addCoreSubtitleAndIcons();
                    });
                    this.fontInputListenerAttached = true;
                }
                this.addCoreSubtitleAndIcons();
            }
        };

        applyCoreOptionsView(){
            const propertiesPanel = page.querySelector(".oxy-class-properties");
            if (!propertiesPanel) {
                log("propertiesPanel panel not found, can't initialize preview of variables on hover");
                return;
            }

            const accordions = page.querySelectorAll(".oxy-accordion");
            const typographySection = Array.from(accordions)
                .find(el => el.textContent?.includes("Typography"));
            if (!typographySection) {
                log(`Target not found for selector typographySection`);
                return;
            }

            const observer = registerObserver(new MutationObserver(this.initCoreOptionsView.bind(this)));
            observer.observe(typographySection, {
                subtree: true,
                childList: true,
                attributes: true
            });
        }

        initCoreFonts() {
            const coreFonts = this.fonts;
            const breakdance = window.parent.Breakdance;
            const stores = breakdance?.stores;

            if (coreFonts?.length && stores) {
                const defaultFonts = stores.configStore.fonts;
                const parsedCoreFonts = coreFonts.map((font: Font) => {
                    return  {
                        cssName: font.family,
                        dependencies: {
                            googleFonts: []
                        },
                        fallbackString: "sans-serif",
                        label: font.title,
                        slug: font.family
                    };
                });
                const newFonts = [
                    ...parsedCoreFonts,
                    ...defaultFonts,
                ];

                stores.configStore.setFonts(newFonts);
                this.applyCoreOptionsView();
            }
        }
    }

    // Store color map globally so theme toggle can access it
    type ColorValues = { light: string; dark: string; id: string };
    const colorValuesMap = new Map<string, ColorValues>();

    const buildColorValuesMap = () => {
        const coreColors = (window as any).parent.core_colors as CoreColor[] | undefined;
        if (!coreColors?.length) return;

        colorValuesMap.clear();

        for (const color of coreColors) {
            const existing = colorValuesMap.get(color.name);
            if (color.dark) {
                // This is a dark mode entry - update the dark value
                if (existing) {
                    existing.dark = color.value;
                } else {
                    colorValuesMap.set(color.name, { light: color.value, dark: color.value, id: color.id });
                }
            } else {
                // This is a light mode entry
                if (existing) {
                    existing.light = color.value;
                } else {
                    colorValuesMap.set(color.name, { light: color.value, dark: color.value, id: color.id });
                }
            }
        }
    };

    const updateColorVariablesForTheme = (isDark: boolean) => {
        const globalStore = getReadyOxygenGlobalStore();
        if (!globalStore) return;

        const updatedVariables = globalStore.variables.map((variable) => {
            if (variable.collection !== CORE_FRAMEWORK_COLOR_COLLECTION) {
                return variable;
            }

            const colorData = colorValuesMap.get(variable.cssVariableName);
            if (!colorData) {
                return variable;
            }

            return {
                ...variable,
                value: isDark ? colorData.dark : colorData.light
            };
        });

        runOxygenTransaction(() => {
            globalStore.setVariables(updatedVariables);
            globalStore.setVariablesCollections(
                mergeCollections(
                    globalStore.variablesCollections,
                    [CORE_FRAMEWORK_COLOR_COLLECTION]
                )
            );
        }, "Toggle Core Framework Theme");
    };

    const buildCoreColorVariables = (): OxyVariable[] | null => {
        const coreColors = (window as any).parent.core_colors as CoreColor[] | undefined;
        if (!coreColors?.length) {
            return null;
        }

        buildColorValuesMap();

        const savedTheme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;
        const isDark = savedTheme === "dark";

        return Array.from(colorValuesMap.entries()).map(([name, colorData]) => ({
            collection: CORE_FRAMEWORK_COLOR_COLLECTION,
            cssVariableName: name,
            id: colorData.id,
            label: name,
            type: "color" as const,
            value: isDark ? colorData.dark : colorData.light
        }));
    };

    const buildCoreUnitVariables = (): OxyVariable[] | null => {
        const variablesGroups = (window as any).parent.core_variables as Record<string, any> | undefined;
        if (!variablesGroups) {
            return null;
        }

        const coreVarNames: string[] = [];
        for (const [key, value] of Object.entries(variablesGroups)) {
            if (key === "colorStyles") {
                continue;
            }

            const values = value && typeof value === "object"
                ? Object.values(value)
                : value;

            if (Array.isArray(values)) {
                coreVarNames.push(...values.filter((item): item is string => typeof item === "string"));
            }
        }

        return [...new Set(coreVarNames)].map((varName) => ({
            collection: CORE_FRAMEWORK_UTILS_COLLECTION,
            cssVariableName: varName,
            id: varName,
            label: varName,
            type: "unit" as const,
            value: {
                number: `var(--${varName})`,
                style: `var(--${varName})`,
                unit: "custom"
            }
        }));
    };

    const fetchCoreClassNames = async (): Promise<string[] | null> => {
        try {
            const response = await fetch(`${window.coreframework.core_api_url}get-classes`, {
                method: "GET",
                headers: {
                    "X-WP-Nonce": window.coreframework.nonce,
                },
            });

            if (!response.ok) {
                return null;
            }

            const json = (await response.json()) as { classes: Record<string, any> };
            if (!json?.classes) {
                return null;
            }

            return [...new Set(flattenClasses(json.classes))];
        } catch (e) {
            return null;
        }
    };

    const buildCoreSelectors = (
        existingSelectors: SelectorClass[],
        classNames: string[]
    ): SelectorClass[] => {
        const existingCoreSelectors = new Map<string, SelectorClass>();
        existingSelectors.forEach((selector) => {
            if (selector.collection === CORE_FRAMEWORK_CLASS_COLLECTION) {
                existingCoreSelectors.set(selector.name, selector);
            }
        });

        const nonCoreSelectors = existingSelectors.filter(
            (selector) => selector.collection !== CORE_FRAMEWORK_CLASS_COLLECTION
        );
        const isValidUUID = (id: string) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        const freshCoreSelectors = classNames.map((name) => {
            const existing = existingCoreSelectors.get(name);
            if (existing && isValidUUID(existing.id)) {
                return existing;
            }

            return {
                id: generateUUID(),
                name,
                properties: null,
                children: [] as [],
                locked: true,
                collection: CORE_FRAMEWORK_CLASS_COLLECTION,
                type: "class" as const
            };
        });

        return [...nonCoreSelectors, ...freshCoreSelectors];
    };

    const syncCoreFrameworkDataNow = async (): Promise<boolean> => {
        const globalStore = await waitForOxygenGlobalStore();
        if (!globalStore) {
            return false;
        }

        const freshColorVariables = buildCoreColorVariables();
        const freshUnitVariables = buildCoreUnitVariables();
        const coreClassNames = await fetchCoreClassNames();
        const replacedVariableCollections = new Set<string>();

        if (freshColorVariables) {
            replacedVariableCollections.add(CORE_FRAMEWORK_COLOR_COLLECTION);
        }
        if (freshUnitVariables) {
            replacedVariableCollections.add(CORE_FRAMEWORK_UTILS_COLLECTION);
        }

        const nextVariables = replacedVariableCollections.size
            ? [
                ...globalStore.variables.filter(
                    (variable) => !replacedVariableCollections.has(variable.collection)
                ),
                ...(freshColorVariables ?? []),
                ...(freshUnitVariables ?? [])
            ]
            : globalStore.variables;
        const nextSelectors = coreClassNames
            ? buildCoreSelectors(globalStore.oxySelectors, coreClassNames)
            : globalStore.oxySelectors;
        const variableCollectionsToAdd = [...replacedVariableCollections];
        const selectorCollectionsToAdd = coreClassNames
            ? [CORE_FRAMEWORK_CLASS_COLLECTION]
            : [];
        const nextVariableCollections = mergeCollections(
            globalStore.variablesCollections,
            variableCollectionsToAdd
        );
        const nextSelectorCollections = mergeCollections(
            globalStore.oxySelectorsCollections,
            selectorCollectionsToAdd
        );

        const variablesChanged = !areEqual(globalStore.variables, nextVariables);
        const selectorsChanged = !areEqual(globalStore.oxySelectors, nextSelectors);
        const variableCollectionsChanged = !hasCollections(
            globalStore.variablesCollections,
            variableCollectionsToAdd
        );
        const selectorCollectionsChanged = !hasCollections(
            globalStore.oxySelectorsCollections,
            selectorCollectionsToAdd
        );

        if (
            !variablesChanged
            && !selectorsChanged
            && !variableCollectionsChanged
            && !selectorCollectionsChanged
        ) {
            return false;
        }

        runOxygenTransaction(() => {
            if (variablesChanged) {
                globalStore.setVariables(nextVariables);
            }
            if (variableCollectionsChanged) {
                globalStore.setVariablesCollections(nextVariableCollections);
            }
            if (selectorsChanged) {
                globalStore.setOxygenSelectors(nextSelectors);
            }
            if (selectorCollectionsChanged) {
                globalStore.setOxygenSelectorsCollections(nextSelectorCollections);
            }
        }, "Sync Core Framework Data");

        await saveOxygenBuilder();
        return true;
    };

    let syncPromise: Promise<boolean> | null = null;

    const syncCoreFrameworkData = () => {
        if (!syncPromise) {
            syncPromise = syncCoreFrameworkDataNow().finally(() => {
                syncPromise = null;
            });
        }

        return syncPromise;
    };

    const applyVariableOnHover = () => {
        if (!assertOption("oxygen_enable_unit_and_value_preview")) {
            return;
        }

        const parentDocument = window.parent.document;

        // State for preview restoration
        let savedElementStyle: string | null = null;
        let currentElement: HTMLElement | null = null;

        // Track the exact clicked element and its CSS property context
        let lastClickedElement: HTMLElement | null = null;
        let targetCSSProperty: string | null = null;

        /**
         * Extract the CSS property from a clicked element by walking up the DOM
         * and looking for property indicators (data attributes, class names, text content)
         */
        const extractCSSProperty = (clickedElement: HTMLElement): string | null => {
            let el: HTMLElement | null = clickedElement;

            // Walk up the DOM looking for property indicators
            for (let i = 0; i < 15 && el; i++) {
                // Check path attribute first (e.g., "layout.gap.unit" -> "gap")
                // This is more specific than data-name which might be generic like "unit"
                const pathAttr = el.getAttribute("path");
                if (pathAttr) {
                    const parts = pathAttr.split(".");
                    // Look for known CSS properties in the path (skip generic terms like "unit", "layout")
                    const knownProps = ["gap", "margin", "padding", "width", "height", "color", "background", "border", "font", "top", "right", "bottom", "left"];
                    for (const part of parts) {
                        if (knownProps.includes(part.toLowerCase())) {
                            return part.toLowerCase();
                        }
                    }
                }

                // Check data-name attribute (but skip generic values like "unit")
                const dataName = el.getAttribute("data-name");
                if (dataName && dataName !== "unit") {
                    return dataName;
                }

                // Check data-option attribute (often contains full property path)
                const dataOption = el.getAttribute("data-option");
                if (dataOption) {
                    // Extract property name from option path like "styles.color" or "styles.border.color"
                    const parts = dataOption.split(".");
                    const prop = parts[parts.length - 1] || null;
                    if (prop) {
                        return prop;
                    }
                }

                // Check for specific class patterns that indicate property type
                const classList = el.classList;
                if (classList.contains("oxy-control--color")) {
                    // Look for more specific context within color control
                    const labelText = el.querySelector(".oxy-control-wrapper__label")?.textContent?.toLowerCase() || "";
                    if (labelText.includes("text") || labelText.includes("font")) return "color";
                    if (labelText.includes("background") || labelText.includes("bg")) return "background-color";
                    if (labelText.includes("border")) return "border-color";
                }

                // Check for text content that indicates property (e.g., "Color", "Background", "Border")
                if (el.classList.contains("oxy-control-wrapper__label") || el.classList.contains("oxy-margin-label")) {
                    const text = el.textContent?.toLowerCase()?.trim() || "";
                    if (text === "color" || text === "text color") return "color";
                    if (text === "background" || text === "background color" || text === "bg") return "background-color";
                    if (text.includes("border") && text.includes("color")) return "border-color";
                    if (text === "margin") return "margin";
                    if (text === "padding") return "padding";
                    if (text === "width") return "width";
                    if (text === "height") return "height";
                    if (text === "top") return "top";
                    if (text === "right") return "right";
                    if (text === "bottom") return "bottom";
                    if (text === "left") return "left";
                }

                el = el.parentElement;
            }

            return null;
        };

        /**
         * Determine spacing context (margin vs padding) from clicked element
         */
        const getSpacingContext = (clickedElement: HTMLElement | null): "margin" | "padding" | null => {
            if (!clickedElement) return null;
            let el: HTMLElement | null = clickedElement;
            for (let i = 0; i < 15 && el; i++) {
                const text = el.textContent?.trim().substring(0, 30).toLowerCase() || "";
                if (text.startsWith("margin")) return "margin";
                if (text.startsWith("padding")) return "padding";

                // Check class names safely (classList is safer than className which can be SVGAnimatedString)
                if (el.classList?.contains("margin")) return "margin";
                if (el.classList?.contains("padding")) return "padding";
                // Check className as string if it exists
                const classStr = typeof el.className === "string" ? el.className : "";
                if (classStr.includes("margin")) return "margin";
                if (classStr.includes("padding")) return "padding";

                el = el.parentElement;
            }
            return null;
        };

        /**
         * Normalize a property name to a valid CSS property
         */
        const normalizeCSSProperty = (prop: string, spacingContext: "margin" | "padding" | null): string => {
            // Directional properties need prefix
            const directional = ["top", "right", "bottom", "left"];
            if (directional.includes(prop)) {
                return `${spacingContext || "padding"}-${prop}`;
            }

            // Handle common variations
            const normalized = prop.toLowerCase().replace(/_/g, "-");

            // Map common names to CSS properties
            const propertyMap: Record<string, string> = {
                "backgroundcolor": "background-color",
                "bgcolor": "background-color",
                "bg": "background-color",
                "textcolor": "color",
                "fontcolor": "color",
                "bordercolor": "border-color",
            };

            return propertyMap[normalized.replace(/-/g, "")] || normalized;
        };

        // Capture clicks to track the exact element and extract its CSS property
        registerParentListener(parentDocument, "click", ((e: Event) => {
            const target = e.target as HTMLElement;

            // Only track clicks within oxy-controls
            const control = target.closest(".oxy-control:not(.oxy-class-selector)") as HTMLElement | null;
            if (!control) return;

            lastClickedElement = target;

            // Extract the CSS property from the clicked element's context
            targetCSSProperty = extractCSSProperty(target);

            // If we couldn't find a specific property, try the control's data-name
            if (!targetCSSProperty) {
                targetCSSProperty = control.getAttribute("data-name");
            }

            // Get spacing context if applicable
            const spacingCtx = getSpacingContext(target);
            if (spacingCtx && targetCSSProperty) {
                targetCSSProperty = normalizeCSSProperty(targetCSSProperty, spacingCtx);
            }

        }) as EventListener, true);

        // Also track focus events for inputs
        registerParentListener(parentDocument, "focusin", ((e: Event) => {
            const target = e.target as HTMLElement;
            if (!target.matches("input, button, [role='button']")) return;

            const control = target.closest(".oxy-control:not(.oxy-class-selector)") as HTMLElement | null;
            if (!control) return;

            lastClickedElement = target;
            targetCSSProperty = extractCSSProperty(target);

            if (!targetCSSProperty) {
                targetCSSProperty = control.getAttribute("data-name");
            }

            const spacingCtx = getSpacingContext(target);
            if (spacingCtx && targetCSSProperty) {
                targetCSSProperty = normalizeCSSProperty(targetCSSProperty, spacingCtx);
            }

        }) as EventListener, true);

        // Get the active element in the iframe
        const getActiveElement = (): HTMLElement | null => {
            const iframe = parentDocument.getElementById("iframe") as HTMLIFrameElement | null;
            return iframe?.contentDocument?.querySelector(".breakdance--active-element") as HTMLElement | null;
        };

        const handleMouseEnter = (variableItem: HTMLElement) => {

            if (!targetCSSProperty) {
                return;
            }

            const activeElement = getActiveElement();
            if (!activeElement) {
                return;
            }

            // Get the variable info
            const titleEl = variableItem.querySelector(".variables-chooser-variable__title") as HTMLElement | null;
            const variableName = titleEl?.textContent?.trim();
            const swatch = variableItem.querySelector(".breakdance-color-swatch__color") as HTMLElement | null;
            const valueEl = variableItem.querySelector(".variables-chooser-variable__value") as HTMLElement | null;
            const variableValue = valueEl?.textContent?.trim();

            // Determine the value to apply
            let valueToApply: string | null = null;
            if (variableName) {
                valueToApply = `var(--${variableName})`;
            } else if (swatch) {
                valueToApply = swatch.style.background;
            } else if (variableValue) {
                valueToApply = variableValue;
            }

            if (!valueToApply) {
                return;
            }

            // Save original style on first enter
            if (!currentElement) {
                currentElement = activeElement;
                savedElementStyle = activeElement.style.cssText;
            }

            // Apply the preview using the detected CSS property
            const cssProperty = normalizeCSSProperty(targetCSSProperty, getSpacingContext(lastClickedElement!));
            const camelCase = cssProperty.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

            (activeElement.style as any)[camelCase] = valueToApply;
        };

        /**
         * Restore the original element style (cleanup function)
         */
        const restoreOriginalStyle = () => {
            if (currentElement && savedElementStyle !== null) {
                currentElement.style.cssText = savedElementStyle;
                savedElementStyle = null;
                currentElement = null;
            }
        };

        const handleMouseLeave = () => {
            restoreOriginalStyle();
        };

        const handleClick = () => {
            restoreOriginalStyle();
        };

        // Watch for variable dropdown appearing AND disappearing
        const variablesObserver = registerObserver(new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Handle dropdown being removed (closed)
                for (const node of mutation.removedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    const el = node as Element;

                    // If a dropdown or variables list is removed, restore the style
                    if (el.classList?.contains("variables-chooser-dropdown") ||
                        el.classList?.contains("variables-chooser-variables-list") ||
                        el.querySelector?.(".variables-chooser-dropdown")) {
                        restoreOriginalStyle();
                    }
                }

                // Handle dropdown being added (opened)
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    const el = node as Element;

                    const isDropdown = el.classList?.contains("variables-chooser-dropdown");
                    const variablesList = isDropdown
                        ? el.querySelector?.(".variables-chooser-variables-list")
                        : el.classList?.contains("variables-chooser-variables-list")
                            ? el
                            : el.querySelector?.(".variables-chooser-variables-list");

                    if (variablesList) {
                        // Attach listeners to each variable item
                        const variableItems = variablesList.querySelectorAll(".variables-chooser-variable");
                        variableItems.forEach((item) => {
                            const itemEl = item as HTMLElement;
                            itemEl.addEventListener("mouseenter", () => handleMouseEnter(itemEl));
                            itemEl.addEventListener("mouseleave", handleMouseLeave);
                            // Restore style when clicking to select a variable
                            itemEl.addEventListener("click", handleClick);
                        });
                    }
                }
            }
        }));

        variablesObserver.observe(parentDocument.body, { childList: true, subtree: true });

        // Also restore style when clicking anywhere outside the dropdown (safety net)
        registerParentListener(parentDocument, "click", ((e: Event) => {
            const target = e.target as HTMLElement;
            // If clicking outside the variables dropdown, restore style
            if (!target.closest(".variables-chooser-dropdown") && !target.closest(".variables-chooser-variables-list")) {
                if (currentElement && savedElementStyle !== null) {
                    restoreOriginalStyle();
                }
            }
        }) as EventListener, true);
    };

    /**
     * Preview utility classes on hover in Oxygen 6's class picker dropdown
     * Uses event delegation - no MutationObserver, no individual element listeners
     */
    const applyClassOnHover = () => {
        if (!assertOption("oxygen_apply_class_on_hover")) {
            return;
        }

        const parentDocument = window.parent.document;

        // Track preview state
        let previewClass: string | null = null;
        let previewElement: HTMLElement | null = null;
        let isClicking = false;

        // Get the active element in the iframe
        const getActiveElement = (): HTMLElement | null => {
            const iframe = parentDocument.getElementById("iframe") as HTMLIFrameElement | null;
            return iframe?.contentDocument?.querySelector(".breakdance--active-element") as HTMLElement | null;
        };

        // Remove preview class
        const removePreview = () => {
            if (previewClass && previewElement) {
                previewElement.classList.remove(previewClass);
                previewClass = null;
                previewElement = null;
            }
        };

        // Track mousedown to know when user is clicking
        registerParentListener(parentDocument, "mousedown", ((e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest('.v-list-item[role="option"]')) {
                isClicking = true;
                // Clear preview state but DON'T remove class - let Oxygen handle it
                previewClass = null;
                previewElement = null;
                // Reset clicking flag after a short delay
                setTimeout(() => { isClicking = false; }, 100);
            }
        }) as EventListener, { passive: true, capture: true });

        // Handle mouseover using event delegation
        registerParentListener(parentDocument, "mouseover", ((e: Event) => {
            const target = e.target as HTMLElement;

            // Check if we're over a class option item
            const listItem = target.closest('.v-list-item[role="option"]') as HTMLElement | null;
            if (!listItem) {
                if (!isClicking) removePreview();
                return;
            }

            // Check if it's inside a class dropdown
            const dropdown = listItem.closest('.v-autocomplete__content, .v-overlay__content');
            if (!dropdown) {
                if (!isClicking) removePreview();
                return;
            }

            // Get class name
            const titleEl = listItem.querySelector(".v-list-item__content .v-list-item-title");
            const className = titleEl?.textContent?.trim();

            // Skip compound selectors or empty
            if (!className || className.includes(">") || className.includes(" ")) {
                if (!isClicking) removePreview();
                return;
            }

            // Don't reapply same class
            if (previewClass === className) return;

            // Remove old preview
            if (!isClicking) removePreview();

            // Apply new preview
            const activeElement = getActiveElement();
            if (activeElement) {
                previewClass = className;
                previewElement = activeElement;
                activeElement.classList.add(className);
            }
        }) as EventListener, { passive: true });

        // Remove preview on mouseout from dropdown area - but not if clicking
        registerParentListener(parentDocument, "mouseout", ((e: MouseEvent) => {
            if (isClicking) return;

            const target = e.target as HTMLElement;
            const relatedTarget = e.relatedTarget as HTMLElement | null;

            // If leaving a list item and not entering another list item in the dropdown
            if (target.closest('.v-list-item[role="option"]')) {
                if (!relatedTarget?.closest('.v-list-item[role="option"]')) {
                    removePreview();
                }
            }
        }) as EventListener, { passive: true });
    };

    const main = () => {
        const breakdance = window.parent.Breakdance;
        const parentDocument = window.parent.document;

        const root = breakdance?.restUrl?.split("breakdance")[0];

        // Use Breakdance values if available, otherwise preserve PHP-injected values
        const existingConfig = window.coreframework;
        window.coreframework = {
            nonce: breakdance?.restNonce ?? existingConfig?.nonce,
            rest_url: root ?? existingConfig?.rest_url,
            core_api_url: root ? `${root}core-framework/v2/` : existingConfig?.core_api_url,
        };

        const observer = registerObserver(new MutationObserver((mutationsList, obs) => {
            mutationsList.forEach(mutation => {
                const isPanel = [...mutation.addedNodes].some((node: Node) => {
                    const el = node as Element;
                    return el.nodeType === Node.ELEMENT_NODE && el.classList?.contains("oxy-properties-panel");
                });

                if (isPanel) {
                    new ClassAutosuggestions();
                }
            });
        }));

        observer.observe(parentDocument.body, {
            childList: true,
            subtree: true
        });

        addThemeToggleButton();
        new CoreFonts();
        void syncCoreFrameworkData().catch((error) => {
            log("Initial Oxygen 6.1 sync failed.", error);
        });

        // Listen for push events from the CF admin panel (cross-tab live sync)
        try {
            const syncChannel = new BroadcastChannel('cf_push_sync');
            syncChannel.onmessage = async (event) => {
                if (event.data?.type === 'push_complete') {
                    log('Push detected, re-syncing Oxygen 6...');

                    try {
                        // Fetch fresh colors from server
                        const colorsRes = await fetch(`${window.coreframework.core_api_url}get-colors`, {
                            method: 'GET',
                            headers: {
                                'X-WP-Nonce': window.coreframework.nonce,
                            },
                        });
                        if (colorsRes.ok) {
                            const colorsData = await colorsRes.json();
                            (window as any).parent.core_colors = colorsData.colors;
                        }

                        // Fetch fresh variables from server
                        const varsRes = await fetch(`${window.coreframework.core_api_url}get-variables?type=oxygen_dropdown`, {
                            method: 'GET',
                            headers: {
                                'X-WP-Nonce': window.coreframework.nonce,
                            },
                        });
                        if (varsRes.ok) {
                            const varsData = await varsRes.json();
                            (window as any).parent.core_variables = varsData.variables;
                        }

                        // Now sync with fresh data
                        await syncCoreFrameworkData();

                        // Force-reload the CSS stylesheet in the iframe
                        const link = document.querySelector('link[id*="core-framework"]') as HTMLLinkElement;
                        if (link) {
                            const baseHref = link.href.replace(/([?&])ver=[^&]+/, '$1ver=' + Date.now());
                            link.href = baseHref;
                        }

                        log('Oxygen 6 re-sync complete.');
                    } catch (e) {
                        log('Re-sync failed:');
                        log("Error:", e);
                    }
                }
            };
        } catch (e) {
            // BroadcastChannel not supported in this context
        }

        // Hover previews initialize independently of the asynchronous data sync
        setTimeout(() => {
            applyVariableOnHover();
            applyClassOnHover();
        }, 2000);
    };

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        main();
    }
})();
