import { memo } from "react";

interface IEmptyClassSection {
	readonly onClick?: () => void;
	readonly title?: string;
	readonly description?: string;
	readonly icon?: React.ReactNode;
	readonly className?: string;
}

export const EmptyClassSection = memo<IEmptyClassSection>(
	({
		onClick,
		icon,
		title = "Nothing in this section...",
		description = "Click here to add a new selector",
	}) => {
		return (
			<li
				className="row align-center padding-l gap-l radius bg-primary hover-bg-tertiary pointer shadow-l"
				onClick={onClick}
			>
				{icon ? <span className="svg-xl svg-filter-1">{icon}</span> : null}

				<div className="grid gap-s">
					<b className="text-m">{title}</b>

					{description ? <p className="text-s opacity-60">{description}</p> : null}
				</div>
			</li>
		);
	},
);

EmptyClassSection.displayName = "EmptyClassSection";
