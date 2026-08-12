import { memo } from "react";
import clsx from "clsx";

interface IClassHeader {
	readonly type: "selector" | "variable" | "generation" | "fonts" | "font-variants";
}

export const ClassHeader = memo(({ type }: IClassHeader) => {
	return (
		<div
			className={clsx("class-row selectors-layout header", {
				variable: type === "variable",
				fonts: type === "fonts",
				"font-variants": type === "font-variants",
			})}
		>
			{type === "selector" && (
				<>
					<span>Selector</span>
					<span>CSS Property & value</span>
				</>
			)}

			{type === "variable" && (
				<>
					<span>Variable</span>
					<span>Value</span>
				</>
			)}

			{type === "generation" && (
				<>
					<span>Generated class name</span>
					<span>Generated property</span>
				</>
			)}

			{type === "fonts" && (
				<>
					<span>Enable</span>
					<span>Title</span>
					<span>Font Family</span>
					<span>Preview</span>
				</>
			)}

			{type === "font-variants" && (
				<>
					<span>Variants</span>
					<span>Preview</span>
				</>
			)}
		</div>
	);
});

ClassHeader.displayName = "ClassHeader";
