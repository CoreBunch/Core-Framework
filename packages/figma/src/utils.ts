import { Colord, colord } from "colord";
import { ulid } from "ulid";
import { CssObject, Declaration } from "./types";

const IS_DEV = import.meta.env.VITE_APP_ENV === "development";

export const tryCatch = <T>(fn: () => T, fallback?: T): T => {
	try {
		return fn();
	} catch (error) {
		return fallback as T;
	}
};

export function scrollToNestedElement(
	container: string | HTMLElement,
	element: string | HTMLElement,
	scrollWhenElementIsVisible = false,
	offset?: number,
) {
	const containerElement = typeof container === "string" ? document.querySelector(container) : container;
	const elementToScrollTo = typeof element === "string" ? document.querySelector(element) : element;

	if (!(containerElement && elementToScrollTo)) {
		return false;
	}

	if (
		scrollWhenElementIsVisible &&
		containerElement.scrollTop <= (elementToScrollTo as HTMLElement).offsetTop &&
		containerElement.scrollTop + containerElement.clientHeight >=
			(elementToScrollTo as HTMLElement).offsetTop + (elementToScrollTo as HTMLElement).clientHeight
	) {
		return false;
	}

	const offsetTop = (elementToScrollTo as HTMLElement).offsetTop;
	containerElement.scrollTop = offsetTop - (offset || 0);
	return true;
}

export function humanFileSize(bytes: number, si = true, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}

	const units = si
		? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

	return `${bytes.toFixed(dp)} ${units[u]}`;
}

export function convertToKebabCase(title: string) {
	return title.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function convertSafeCssName(string: string) {
	return string.replace(" ", "-").replace(/[^a-zA-Z0-9-_]/g, "");
}

export function convertToVariableDeclarationName(name: string) {
	return convertToKebabCase(name.startsWith("--") ? name : `--${name}`);
}

export function convertToVariableName(name: string) {
	return `var(${convertToVariableDeclarationName(name)})`;
}

export function convertToSnakeCase(str: string) {
	return str.toLowerCase().replace(/ /g, "_");
}

export function throttle<T extends (...args: any[]) => any>(fn: T, wait: number) {
	let time = Date.now();
	return function (this: any, ...args: Parameters<T>) {
		if (time + wait - Date.now() < 0) {
			fn.apply(this, args);
			time = Date.now();
		}
	};
}

export const pxToRem = (px: number, root_font_size: number = 16) => `${round(px / root_font_size)}rem`;

export const round = (value: number) => Number(value.toFixed(2));

export const getVariableName = (namingConvention: string, step: string) =>
	`--${namingConvention.replace("{step}", step).replace(/\s/g, "-")}${
		namingConvention.includes("{step}") ? "" : `-${step}`
	}`;

export function convertToDesiredUnit(value: number | string, unit: string, root_font_size: number = 16) {
	switch (unit) {
		case "px":
			return `${value}px`;
		case "rem":
			return pxToRem(Number(value), root_font_size);
		default:
			return String(value);
	}
}

export const getEmptyDeclaration = (): Declaration => ({
	id: ulid(),
	property: "",
	value: "",
});

export const getEmptyObject = (isRootVariable = false): CssObject => ({
	id: ulid(),
	selector: isRootVariable ? ":root" : "",
	declarations: [getEmptyDeclaration()],
});

export function toArray<T>(array?: T | T[]): T[] {
	array = array ?? [];
	return Array.isArray(array) ? array : [array];
}

export type NestedArrayable<T> = T | (T | T[])[];

export function flattenArray<T>(v: NestedArrayable<T>): T[] {
	return toArray(v).flat() as T[];
}

export function mergeArrays<T>(...args: (NestedArrayable<T> | undefined)[]): T[] {
	return args.flatMap((i) => flattenArray(i || []));
}

export function downloadFile(content: BlobPart, filename: string) {
	const element = document.createElement("a");
	const file = new Blob([content], {
		type: "text/json",
	});

	element.href = URL.createObjectURL(file);
	element.download = filename;
	document.body.appendChild(element);
	element.click();
	element.remove();
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function nFormatter(num: number, digits?: number) {
	if (!num) {
		return "0";
	}

	const lookup = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "K" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "G" },
		{
			value: 1e12,
			symbol: "T",
		},
		{
			value: 1e15,
			symbol: "P",
		},
		{
			value: 1e18,
			symbol: "E",
		},
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	const item = lookup
		.slice()
		.reverse()
		.find((item) => num >= item.value);

	return item ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol : "0";
}

export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error("Failed to copy text: ", err);
		return false;
	}
}

export function compareVersion(v1: string, v2: string) {
	const v1parts = v1.split(".");
	const v2parts = v2.split(".");

	for (let i = 0; i < v1parts.length; ++i) {
		if (v2parts.length === i) {
			return 1;
		}

		if (v1parts[i] === v2parts[i]) {
			continue;
		} else if (v1parts[i] > v2parts[i]) {
			return 1;
		} else {
			return -1;
		}
	}

	if (v1parts.length !== v2parts.length) {
		return -1;
	}

	return 0;
}

export function fuzzySearch(needle: string, haystack: string) {
	const hlen = haystack.length;
	const nlen = needle.length;
	if (nlen > hlen) {
		return false;
	}
	if (nlen === hlen) {
		return needle === haystack;
	}
	outer: for (var i = 0, j = 0; i < nlen; i++) {
		const nch = needle.charCodeAt(i);
		while (j < hlen) {
			if (haystack.charCodeAt(j++) === nch) {
				continue outer;
			}
		}
		return false;
	}
	return true;
}

export function convertToDesiredColorFormat(instance: Colord | string, format?: string) {
	if (typeof instance === "string") {
		try {
			instance = new Colord(instance);
		} catch (error) {
			return "#000000";
		}
	}

	const alpha = instance.alpha();
	switch (format) {
		case "name":
			return instance.toHex();
		case "hex":
			return instance.toHex();
		case "hexa":
			const hex = instance.toHex().slice(0, 7);
			return (
				hex +
				Math.round(alpha * 255)
					.toString(16)
					.padStart(2, "0")
			);
		case "rgb":
			return instance.toRgbString();
		case "rgba":
			const rgb = instance.toRgb();
			return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
		case "hsl":
			return instance.toHslString();
		case "hsla":
			const hsl = instance.toHsl();
			return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`;
		default:
			return instance.toHex();
	}
}

export const isValidColor = (value: string) => colord(value).isValid();

export async function readClipboard() {
	return await navigator?.clipboard?.readText();
}

export function lzwEncode(s: string) {
	try {
		const dict: Record<string, number> = {};
		const data = s.split("");
		const out: (string | number)[] = [];
		let currChar: string;
		let phrase = data[0];
		let code = 256;
		let i: number;

		for (i = 1; i < data.length; i++) {
			currChar = data[i];

			if (dict[phrase + currChar] == null) {
				out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
				dict[phrase + currChar] = code;
				code++;
				phrase = currChar;
			} else {
				phrase += currChar;
			}
		}

		out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));

		for (i = 0; i < out.length; i++) {
			out[i] = String.fromCharCode(Number(out[i]));
		}

		return out.join("");
	} catch (error) {
		return "";
	}
}

export function withDevTimeLogger<T extends any[], U>(
	fn: (...args: T) => Promise<U>,
): (...args: T) => Promise<U>;
export function withDevTimeLogger<T extends any[], U>(fn: (...args: T) => U): (...args: T) => U;
export function withDevTimeLogger<T extends any[], U>(fn: (...args: T) => U | Promise<U>) {
	return (...args: T): U | Promise<U> => {
		const startTime = performance.now();
		const result = fn(...args);

		const logExecutionTime = (endTime: number) => {
			const executionTime = (endTime - startTime).toFixed(2);
			const isQueryParamDevMode =
				new URLSearchParams(window?.location?.search ?? {}).get("dev_mode") !== null;

			if (IS_DEV || isQueryParamDevMode) {
				console.log(`'${fn.name}' time: ${executionTime} ms`);
			}
		};

		if (result instanceof Promise) {
			return result.then((res) => {
				logExecutionTime(performance.now());
				return res;
			});
		} else {
			logExecutionTime(performance.now());
			return result;
		}
	};
}

export function devLog(name: string, data?: any) {
	if (IS_DEV) {
		console.log(name, data);
	}
}
