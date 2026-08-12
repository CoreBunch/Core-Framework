import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { SixDots } from "assets/icons/SixDots.icon";

interface IDndItem {
	readonly id: string;
	readonly children: React.ReactNode;
	readonly className?: string;
}

export const DndItem = ({ id, children, className }: IDndItem) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id,
		attributes: {
			tabIndex: -1,
		},
	});

	const style = {
		transform:
			CSS.Transform.toString(transform)?.split(")")[0] !== undefined
				? `${CSS.Transform.toString(transform)?.split(")")[0]})`
				: "",
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} className={clsx(className)}>
			<div {...listeners} className="dnd-handle grab transition-global">
				<div className="svg-s">
					<SixDots />
				</div>
			</div>

			{children}
		</div>
	);
};
