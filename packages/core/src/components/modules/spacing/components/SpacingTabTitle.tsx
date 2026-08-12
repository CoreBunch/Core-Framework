import { memo } from "react";
import { AutoSizeInput } from "components/AutoSizeInput";

interface SpacingTabTitle {
	onContextMenu?: (value: boolean) => void;
	onTabChange?: () => void;
	onTitleChange: (title: string) => void;
	value: string;
	isActive: boolean;
}

export const SpacingTabTitle = memo<SpacingTabTitle>(
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
