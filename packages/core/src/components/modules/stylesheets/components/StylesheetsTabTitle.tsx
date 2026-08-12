import { memo } from "react";
import { AutoSizeInput } from "components/AutoSizeInput";
import clsx from "clsx";

interface StylesheetsTabTitleProps {
	value: string;
	isActive: boolean;
	hasErrors?: boolean;
	onTitleChange: (value: string) => void;
	onTabChange: () => void;
	onContextMenu: (value: boolean) => void;
}

export const StylesheetsTabTitle = memo<StylesheetsTabTitleProps>(
	({ value, isActive, hasErrors, onTitleChange, onTabChange, onContextMenu }) => {
		const handleContextMenu = (e: React.MouseEvent) => {
			e.preventDefault();
			onContextMenu(true);
		};

		return (
			<div
				className={clsx("tab-name", {
					active: isActive,
					"has-errors": hasErrors,
				})}
				onClick={onTabChange}
				onContextMenu={handleContextMenu}
			>
				<AutoSizeInput value={value} onChange={onTitleChange} onBlur={() => {}} />
			</div>
		);
	},
);
