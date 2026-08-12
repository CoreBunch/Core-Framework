import { useState } from "react";
import { clsx } from "clsx";
import { Import } from "assets/icons/Import.icon";

interface IDropzone {
	onDrop: (files: File[]) => void;
	onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
	accept?: string;
	multiple?: boolean;
	children?: React.ReactNode;
	className?: string;
	title?: string;
}

export function Dropzone({
	onDrop,
	onDragOver,
	onDragLeave,
	accept,
	multiple,
	children,
	title = "Drop preset here",
}: IDropzone) {
	const [dragging, setDragging] = useState(false);

	function onDropHandler(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();

		setDragging(false);
		if (e.dataTransfer.files.length > 0) {
			onDrop(Array.from(e.dataTransfer.files));
		}
	}

	function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();

		setDragging(true);
		if (onDragOver) {
			onDragOver(e);
		}
	}

	function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();

		setDragging(false);
		if (onDragLeave) {
			onDragLeave(e);
		}
	}

	function handleClick() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept || "";
		input.multiple = multiple || false;
		input.onchange = () => {
			if (input.files) {
				onDrop(Array.from(input.files));
			}
		};
		input.click();
	}

	return (
		<div
			className={clsx("dropzone", {
				dragging,
			})}
			onClick={handleClick}
			onDrop={onDropHandler}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
		>
			<span className="svg-4xl svg-filter-1">
				<Import />
			</span>

			{/*{title}
			{children}*/}
			<h4>
				Drop a <b>.core</b> file here to import the framework
			</h4>
			<p className="text-s opacity-50">or</p>
			<button className="btn-primary btn-l">Browse files</button>
		</div>
	);
}
