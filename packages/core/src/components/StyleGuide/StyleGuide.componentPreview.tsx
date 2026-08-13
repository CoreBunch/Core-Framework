import { ComponentsType } from "components/modules/components";
import { PREVIEW_IMAGE_DATA_URL } from "../../constants/previewImage";

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
}

export const createElement = ({ type, selectors }: IAddElement) => {
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

	addSelector({ selectors, node, type });

	return node;
};
