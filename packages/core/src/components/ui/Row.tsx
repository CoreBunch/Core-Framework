import { memo } from "react";
import { clsx } from "@mantine/core";

interface IRow {
	readonly children: React.ReactNode;
	readonly htmlFor?: string;
	readonly label?: string;
	readonly description?: string | React.ReactNode;
	readonly disabled?: boolean;
	readonly isColumn?: boolean;
}

export const Row = memo(({ children, htmlFor, label, description, disabled = false, isColumn }: IRow) => {
	return (
		<div
			className={clsx(
				"row space-between padding-xl align-center",
				disabled && "opacity-50 pointer-events-none",
				!isColumn && "gap-3xl",
				isColumn && "grid columns-1 gap-xl",
			)}
		>
			<label
				style={{
					cursor: htmlFor ? "pointer" : "default",
				}}
				className="grid gap-2xs"
				htmlFor={htmlFor}
			>
				<h4>{label}</h4>
				{description ? <p className="text-m opacity-50">{description}</p> : null}
			</label>
			{children}
		</div>
	);
});
