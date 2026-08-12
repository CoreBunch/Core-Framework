import { useState } from "react";
import { CssFile } from "assets/icons/CssFile.icon";
import { Hide } from "assets/icons/Hide.icon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Popover, Tooltip } from "@mantine/core";
import clsx from "clsx";
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Eye } from "assets/icons/Eye.icon";
import { Remove } from "assets/icons/Remove.icon";
import { SixDots } from "assets/icons/SixDots.icon";
import { cssGenerator } from "cssGenerator";

hljs.registerLanguage("css", css);

const cssGeneratorOptions = {
	format: true,
	combineSelectors: true,
	propertyValidation: false,
	valueValidation: false,
};

export function Item(props: { id: string; title: string; isMyFramework?: boolean; className?: string }) {
	const prefix = props.isMyFramework ? "my-framework-" : "skeleton-";

	return (
		<p
			id={`${prefix}${props.id}`}
			className={clsx("manage-table-item-title", props.title === "" && "opacity-50", props.className)}
		>
			{props.title === "" ? "Untitled" : props.title}
		</p>
	);
}

export function SortableItem(props: {
	id: string;
	title: string;
	onGroupRemove: (props: { categoryId: StylesheetDataKeys; groupId: string }) => void;
	onGroupDisable: (props: { categoryId: StylesheetDataKeys; groupId: string }) => void;
	group: StylesGroup;
	categoryId?: string;
}) {
	const [cssPreview, setCssPreview] = useState("");

	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="manage-table-item">
			<div className="grab">
				<SixDots />
			</div>

			<Item
				isMyFramework={true}
				title={props.title}
				id={props.id}
				className={clsx({ "opacity-30": props.group.isDisabled })}
			/>

			<div className="row">
				<Popover
					width={400}
					position="top"
					withArrow
					shadow="md"
					onOpen={async () => {
						setCssPreview(
							await cssGenerator({
								cssObjects: props.group.cssObjects ?? [],
								options: cssGeneratorOptions,
							}),
						);

						setTimeout(() => hljs.highlightAll(), 2);
					}}
				>
					<Tooltip label="Preview CSS">
						<Popover.Target>
							<button className="btn-quaternary btn-box">
								<CssFile />
							</button>
						</Popover.Target>
					</Tooltip>

					<Popover.Dropdown>
						<pre
							className="generated-code padding-s margin-0 overflow-scroll"
							style={{
								overflow: "auto",
								maxHeight: 400,
							}}
						>
							<code className="language-css">{cssPreview}</code>
						</pre>
					</Popover.Dropdown>
				</Popover>

				<Tooltip label={props.group.isDisabled ? "Enable" : "Disable"}>
					<button
						onClick={() => {
							props.onGroupDisable({
								categoryId: props.categoryId as StylesheetDataKeys,
								groupId: props.id,
							});
						}}
						className="btn-quaternary btn-box"
					>
						{props.group.isDisabled ? <Eye /> : <Hide />}
					</button>
				</Tooltip>

				<Tooltip label={isDeleteConfirmationOpen ? "Confirm delete" : "Delete"}>
					<button
						onClick={() => {
							if (isDeleteConfirmationOpen) {
								props.onGroupRemove({
									categoryId: props.categoryId as StylesheetDataKeys,
									groupId: props.id,
								});
								setIsDeleteConfirmationOpen(false);
								return;
							}
							setIsDeleteConfirmationOpen(true);
							setTimeout(() => setIsDeleteConfirmationOpen(false), 2000);
						}}
						className="btn-quaternary btn-box"
					>
						{isDeleteConfirmationOpen ? <Checkmark /> : <Remove />}
					</button>
				</Tooltip>
			</div>
		</div>
	);
}
