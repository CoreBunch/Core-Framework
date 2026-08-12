import { memo } from "react";
import { AutoSizeInput } from "components/AutoSizeInput";

interface TypographyTabTitle {
	onContextMenu?: (value: boolean) => void;
	onTabChange?: () => void;
	onTitleChange: (title: string) => void;
	value: string;
	isActive: boolean;
}

export const TypographyTabTitle = memo<TypographyTabTitle>(
	({ value, onTitleChange, isActive, onContextMenu, onTabChange }) => {
		return (
			<div
				className={`tab-name ${isActive && "active"}`}
				onContextMenu={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onContextMenu?.(true);
				}}
				onClick={onTabChange}
			>
				<AutoSizeInput value={value} onBlur={() => {}} onChange={(value) => onTitleChange(value)} />
			</div>
		);
	},
);
