import chroma from "chroma-js";
import { easingCoordinates } from "easing-coordinates";
import type { Plugin } from "postcss";
import valueParser from "postcss-value-parser";

type Options = {
	alphaDecimals?: number;
	colorMode?: NonNullable<Parameters<typeof chroma.mix>[3]>;
	stops?: number;
};

const timingFunctions = ["ease", "ease-in", "ease-out", "ease-in-out", "cubic-bezier", "steps"];

const functionName = (value: string) => value.split("(", 1)[0];

const isTimingFunction = (value: string) => timingFunctions.includes(functionName(value));

const transparentFix = (colors: string[]) =>
	colors.map((color, index) =>
		color === "transparent"
			? chroma(colors[Math.abs(index - 1)])
					.alpha(0)
					.css("hsl")
			: color,
	);

const roundHslAlpha = (color: string, alphaDecimals: number) => {
	const openingParenthesis = color.indexOf("(");
	const prefix = openingParenthesis === -1 ? color : color.slice(0, openingParenthesis);
	const values = color
		.slice(openingParenthesis + 1, -1)
		.split(",")
		.map((value) => (value.includes("%") ? value.trim() : Number(value).toFixed(alphaDecimals).replace(/\.?0+$/, "")));

	return `${prefix}(${values.join(", ")})`;
};

const getColorStops = (
	colors: string[],
	coordinates: ReturnType<typeof easingCoordinates>,
	alphaDecimals: number,
	colorMode: NonNullable<Parameters<typeof chroma.mix>[3]>,
) => {
	const normalizedColors = transparentFix(colors);

	return coordinates.map((coordinate) => {
		const color = roundHslAlpha(
			chroma.mix(normalizedColors[0], normalizedColors[1], coordinate.y, colorMode).css("hsl"),
			alphaDecimals,
		);

		if (coordinate.x === 0 || coordinate.x === 1) {
			return color;
		}

		return `${color} ${Number((coordinate.x * 100).toFixed(2))}%`;
	});
};

/**
 * Expands easing functions embedded between two gradient colors into color stops.
 * Adapted for the PostCSS 8 plugin API from postcss-easing-gradients.
 */
export default function postcssEasingGradients(options: Options = {}): Plugin {
	const { alphaDecimals = 5, colorMode = "lrgb", stops = 13 } = options;

	return {
		postcssPlugin: "easing-gradient",
		Declaration(declaration) {
			if (!declaration.value.includes("-gradient")) {
				return;
			}

			const parsedValue = valueParser(declaration.value);
			parsedValue.walk((node) => {
				if (node.type !== "function" || !["linear-gradient", "radial-gradient"].includes(node.value)) {
					return;
				}

				const gradientParameters = valueParser
					.stringify(
						node.nodes.map((child) => (child.type === "div" ? { ...child, value: ";" } : child)),
					)
					.split(";")
					.map((value) => value.trim());

				gradientParameters.forEach((parameter, index) => {
					if (!isTimingFunction(parameter) || !gradientParameters[index - 1] || !gradientParameters[index + 1]) {
						return;
					}

					try {
						const coordinates = easingCoordinates(parameter, stops - 1);
						const colorStops = getColorStops(
							[gradientParameters[index - 1], gradientParameters[index + 1]],
							coordinates,
							alphaDecimals,
							colorMode,
						);
						const direction = gradientParameters.length === 4 ? `${gradientParameters[0]}, ` : "";

						Object.assign(node, {
							type: "word",
							value: `${node.value}(${direction}${colorStops.join(", ")})`,
						});
						declaration.value = parsedValue.toString();
					} catch {
						// Keep unsupported or malformed gradients unchanged.
					}
				});
			});
		},
	};
}
