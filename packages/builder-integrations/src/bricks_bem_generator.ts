{
    interface GlobalCls {
        name: string;
        id: string;
        category?: string;
        settings: Record<string, any>[];
    }

    interface Element {
        id: string;
        name: string;
        label: string;
        parent: number;
        children: string[];
        settings: {
            _cssGlobalClasses?: string[];
            [key: string]: any;
        };
    }

    interface Component {
        id: string;
        elements: Element[];
        [key: string]: any;
    }

    interface State {
        updating: number;
        globalClasses: GlobalCls[];
        content: Element[];
        header: Element[];
        footer: Element[];
        components: Component[];
    }

    interface BemTree {
        name: string;
        id: string;
        children: BemTree[];
        isRoot: boolean;
        bemName?: string;
        rootName?: string;
    }

    interface VueHTMLElement extends HTMLElement {
        __vue_app__?: any;
    }

    type AppDataGetter = () => {
        config?: {
            globalProperties?: {
                $_state?: State;
            };
        };
    } | undefined;

    const LATIN_CHARACTER_REPLACEMENTS: Record<string, string> = {
        "\u00c4": "Ae",
        "\u00d6": "Oe",
        "\u00dc": "Ue",
        "\u00e4": "ae",
        "\u00f6": "oe",
        "\u00fc": "ue",
        "\u00df": "ss",
        "\u1e9e": "SS",
        "\u00c6": "AE",
        "\u00e6": "ae",
        "\u0152": "OE",
        "\u0153": "oe",
        "\u00d8": "O",
        "\u00f8": "o",
        "\u00d0": "D",
        "\u00f0": "d",
        "\u0110": "D",
        "\u0111": "d",
        "\u00de": "Th",
        "\u00fe": "th",
        "\u0141": "L",
        "\u0142": "l",
        "\u0131": "i"
    };

    const LATIN_CHARACTER_REPLACEMENT_PATTERN =
        /[\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u1e9e\u00c6\u00e6\u0152\u0153\u00d8\u00f8\u00d0\u00f0\u0110\u0111\u00de\u00fe\u0141\u0142\u0131]/g;

    function transliterateLatinCharacters(input: string): string {
        // Expand characters like German umlauts before generic accent stripping.
        return input
            .replace(
                LATIN_CHARACTER_REPLACEMENT_PATTERN,
                (character) => LATIN_CHARACTER_REPLACEMENTS[character] ?? character
            )
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    //
    class VUE_APP {
        private getAppData: AppDataGetter;

        public static generateId(): string {
            return (Math.random() + 1).toString(36).slice(-6);
        }

        constructor(getAppData: AppDataGetter) {
            this.getAppData = getAppData;
        }

        get state(): State {
            return <State>this.getAppData()?.config?.globalProperties?.$_state;
        }

        private getElements(): Element[] {
            // Component elements first so getElementById prefers the full element
            // over the content stub (which has no children)
            const elements: Element[] = [];

            const components = this.state.components;
            if (Array.isArray(components)) {
                for (const component of components) {
                    if (Array.isArray(component?.elements)) {
                        elements.push(...component.elements);
                    }
                }
            }

            elements.push(...this.state.content, ...this.state.header, ...this.state.footer);
            return elements;
        }

        private getElementById(id: string): Element | undefined {
            return this.getElements().find((el: Element) => el.id === id);
        }

        private getElementLabel(name: string): string | undefined {
            if (!name) return;

            return transliterateLatinCharacters(name)
                .replace(/\([^)]*\)/g, "")
                .replace(/\[[^\]]*]/g, "")
                .replace(/[^A-Za-z0-9 _-]/g, "")
                .replace(/\s+/g, "-")
                .trim()
                .toLowerCase();
        }

        private sanitizeBemInput(input: HTMLInputElement): string | undefined {
            const className = this.getElementLabel(input.value);
            if (className !== undefined) {
                input.value = className;
            }

            return className;
        }

        private addClass(className: string, elementId: string): boolean | undefined {
            let element = this.getElementById(elementId);

            if (!element) return;

            let existingClasses = element?.settings?._cssGlobalClasses;
            let classExists = false;
            let classId = VUE_APP.generateId();

            this.state.globalClasses.forEach((cls: GlobalCls) => {
                if (cls.name === className) {
                    classExists = true;
                    classId = cls.id;
                } else if (cls.id === classId) {
                    classId = VUE_APP.generateId();
                }
            });

            if (!classExists) {
                const newClass: GlobalCls = {
                    id: classId,
                    name: className,
                    settings: []
                };
                this.state.globalClasses.push(newClass);
            }

            if (!existingClasses) {
                if (!element.settings) element.settings = {};
                element.settings._cssGlobalClasses = [];
                existingClasses = element.settings._cssGlobalClasses;
            }

            if (!existingClasses?.includes(classId)) {
                existingClasses.push(classId);
            }

            return true;
        }

        private getElementTree(elementId: string): BemTree | null {
            const element = this.getElementById(elementId);
            if (!element) return null;

            const tree = {
                id: element.id,
                name: element.label || element.name,
                bemName: this.getElementLabel(element.label || element.name),
                rootName: this.getElementLabel(element.label || element.name),
                isRoot: true,
                children: []
            };

            if (element.children && Array.isArray(element.children)) {
                element.children.forEach((childId: string) => {
                    const childTree = this.getElementTree(childId);
                    if (childTree) {
                        childTree.isRoot = false;
                        childTree.rootName = <string>tree.rootName;
                        tree.children.push(childTree as never);
                    }
                });
            }

            return tree;
        }

        private renderTree(node: BemTree): string {
            const isRoot = node.isRoot;
            const rootName = node.rootName;
            const bemClass = isRoot ? node.bemName : `${rootName}__${node.bemName}`;
            const safeName = node.name
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');

            let bemTreeItem = `
                <div class="bem-tree-item" data-element-id="${node.id}">
                    <span class="label-inline">
                        <span class="element-label--label">Label</span>
                        <span class="element-name">${safeName}</span>
                    </span>
                    <input
                        type="text"
                        class="bem-name-input"
                        value="${bemClass}"
                       data-is-root="${isRoot}"
                       data-root-name="${rootName}"
                   />
                </div>
            `;

            if (node.children.length) {
                bemTreeItem += '<div class="bem-tree-children">';
                node.children.forEach((child: BemTree) => {
                    child.rootName = rootName;
                    bemTreeItem += this.renderTree(child);
                });
                bemTreeItem += '</div>';
            }

            return bemTreeItem;
        }

        private showBemPopup(elementId: string): void {
            const existingPopup = document.querySelector('.bem-popup-wrapper');
            const bemTree = this.getElementTree(elementId);

            existingPopup && existingPopup.remove();
            if (!bemTree) return;

            const popupWrapper = document.createElement('div');
            const glow = document.createElement('div');
            const popup = document.createElement('div');

            popupWrapper.className = 'bem-popup-wrapper';
            glow.className = 'bem-popup-glow';
            popup.className = 'bem-popup';
            popup.innerHTML = `
                <div class="bem-header">
                    <span class="bem-header--svg">
                    <svg
                        id="b"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 31.82 24.84"
                    >
                    <defs>
                        <linearGradient id="e" x1="3.77" y1="7.44" x2="31.03" y2="24.04"
                            gradientTransform="translate(0 26) scale(1 -1)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0" stop-color="#5c68f9"></stop>
                            <stop offset="1" stop-color="#8e97fe"></stop>
                        </linearGradient>
                        <linearGradient id="f" x1="8.16" y1=".31" x2="13.63" y2="17.26"
                            gradientTransform="translate(0 26) scale(1 -1)"
                            gradientUnits="userSpaceOnUse"
                        >
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
                            <rect x="18.78" y="10.68" width="13.03" height="7.07" style="fill:#a4a4a4;"></rect>
                            <path d="m12.42,0C5.56,0,0,5.56,0,12.42h0c0,6.86,5.56,12.42,12.42,12.42h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0c0-2.95,2.39-5.35,5.35-5.35h19.4V0H12.42Z" style="fill:#bcbcbc;"></path>
                            <path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" style="fill:#919191;"></path>
                        </g>
                    </g>
                </svg>
                    </span>
                    <h3>BEM Class Generator</h3>
                    <button class="bem-close">✕</button>
                </div>
                <div class="bem-content">
                    <div class="bem-section">
                        <div class="bem-tree"></div>
                    </div>
                </div>
                <div class="bem-footer">
                    <button class="bem-button secondary bem-cancel">Cancel</button>
                    <button class="bem-button bem-apply">Apply Classes</button>
                </div>
            `;

            popupWrapper.appendChild(glow);
            popupWrapper.appendChild(popup);
            document.body.appendChild(popupWrapper);

            const header = popup.querySelector('.bem-header')! as HTMLHeadingElement;
            const cleanupDraggable = this.initDragging(header, popupWrapper);
            const bemTreeContainer = popup.querySelector('.bem-tree');

            bemTreeContainer!.innerHTML = this.renderTree(bemTree);
            bemTreeContainer!.addEventListener('input', (e: Event) => {
                const target = e.target as HTMLInputElement | null;

                if (target?.classList.contains('bem-name-input')) {
                    const className = this.sanitizeBemInput(target);
                    const isRoot = target.dataset.isRoot === 'true';

                    if (isRoot && className) {
                        const childInputs = bemTreeContainer!
                            .querySelectorAll<HTMLInputElement>('.bem-name-input:not([data-is-root="true"])');

                        childInputs.forEach((input: HTMLInputElement) => {
                            const elementName = this.getElementLabel(input.value.split('__').pop() || "");
                            input.value = elementName ? `${className}__${elementName}` : className;
                        });
                    }
                }
            });

            const removePopup = () => {
                cleanupDraggable();
                popupWrapper.remove();
            };
            popup.querySelector('.bem-close')?.addEventListener('click', removePopup);
            popup.querySelector('.bem-cancel')?.addEventListener('click', removePopup);

            popup.querySelector('.bem-apply')?.addEventListener('click', () => {
                const elements = bemTreeContainer?.querySelectorAll<HTMLDivElement>('.bem-tree-item');

                elements?.forEach((element: HTMLDivElement) => {
                    const elementId = element.dataset.elementId as string;
                    const input = element.querySelector('.bem-name-input') as HTMLInputElement | null;
                    const className = input ? this.sanitizeBemInput(input) : undefined;
                    if (elementId && className) {
                        this.addClass(className, elementId);
                    }
                });

                removePopup();
                this.state.updating = Date.now();
            });
        }

        private addBemButton(element: HTMLDivElement): void {
            const vueApp = this;
            const actionsList = element.querySelector(".actions");
            const titleDiv = element.querySelector(".title");

            if (!actionsList && !titleDiv) return;

            if (actionsList) {
                if (actionsList.querySelector(".bem-generator")) return;
            } else {
                if (titleDiv?.querySelector(".bem-generator")) return;
            }

            const bemButton = document.createElement("span");
            bemButton.innerHTML = `
                <svg
                    id="b"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 31.82 24.84"
                >
                    <defs>
                        <linearGradient id="e-btn" x1="3.77" y1="7.44" x2="31.03" y2="24.04" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stop-color="#5c68f9"></stop>
                            <stop offset="1" stop-color="#8e97fe"></stop>
                        </linearGradient>
                        <linearGradient id="f-btn" x1="8.16" y1=".31" x2="13.63" y2="17.26" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse">
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

            bemButton.classList.add("bricks-svg-wrapper", "bem-generator");
            bemButton.setAttribute("title", "Add BEM Classes");
            bemButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const elementId = element?.closest(".bricks-draggable-item")?.getAttribute("data-id");

                elementId && vueApp.showBemPopup(elementId);
            });

            if (actionsList) {
                const bemActionLi = document.createElement("li");
                bemActionLi.classList.add("action", "bem");
                bemActionLi.style.width = "22px";
                bemActionLi.append(bemButton);
                actionsList.append(bemActionLi);
            } else if (titleDiv) {
                const iconDiv = titleDiv.querySelector(".icon");
                iconDiv && iconDiv.insertAdjacentElement('afterend', bemButton);
            }
        }

        public applyBemButtomToPanelElements() {
            const vueApp = this;
            document.querySelectorAll<HTMLDivElement>('.structure-item').forEach(this.addBemButton.bind(vueApp));

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement) {
                            if (node.classList.contains('structure-item')) {
                                this.addBemButton.bind(vueApp, <HTMLDivElement>node)();
                            }
                            if (node.querySelectorAll) {
                                node.querySelectorAll<HTMLElement>('.structure-item').forEach((childNode) => {
                                    this.addBemButton.bind(vueApp, <HTMLDivElement>childNode)();
                                });
                            }
                        }
                    });
                });
            });

            const structurePanel = document.querySelector('#bricks-structure');
            structurePanel && observer.observe(structurePanel, { childList: true, subtree: true });
        }

        public initDragging(header: HTMLHeadingElement | null, popupWrapper: HTMLDivElement): () => void {
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX = 0;
            let initialY = 0;
            let xOffset = 0;
            let yOffset = 0;

            function startDragging(e: MouseEvent) {
                const target = e.target as HTMLHeadingElement;
                if (target.classList.contains('bem-close') || target.closest('svg')) return;

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                isDragging = true;
                header!.style.cursor = 'grabbing';
            }

            function drag(e: MouseEvent) {
                if (!isDragging) return;
                e.preventDefault();

                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                popupWrapper.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
            }

            function stopDragging() {
                isDragging = false;
                header!.style.cursor = 'move';
            }

            header!.addEventListener('mousedown', startDragging);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDragging);

            return () => {
                header!.removeEventListener('mousedown', startDragging);
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDragging);
            }
        }
    }

    // @ts-ignore
    if (window?.core_framework_connector?.bricks_bem_generator) {
        const getDynamicAppData: AppDataGetter = () => (document?.querySelector(".brx-body")! as VueHTMLElement)?.__vue_app__;
        const app = new VUE_APP(getDynamicAppData);
        const MAX_RETRIES = 30; // 15 seconds at 500ms intervals
        let retryCount = 0;
        const checkBricksReady = setInterval(() => {
            retryCount++;
            if (getDynamicAppData()) {
                clearInterval(checkBricksReady);
                app.applyBemButtomToPanelElements();
            } else if (retryCount >= MAX_RETRIES) {
                clearInterval(checkBricksReady);
            }
        }, 500);
    }
}
