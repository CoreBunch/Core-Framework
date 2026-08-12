import { convertToSnakeCase } from "utils";
import { minifyCss } from "./minifyCss";

export const getCssFile = (cssString: string, name: string, suffix: string = "core") => {
	const minifiedCss = minifyCss(cssString);

	const element = document.createElement("a");
	const file = new Blob([minifiedCss], {
		type: "text/css",
	});

	element.href = URL.createObjectURL(file);
	element.classList.add("__download");
	element.download = `${convertToSnakeCase(name)}_${suffix}.css`;

	document.body.appendChild(element);

	return { file, link: element };
};
