import { memo, useEffect, useMemo, useState } from "react";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { Edit } from "assets/icons/Edit.icon";
import { Keyboard } from "assets/icons/Keyboard.icon";
import { Remove } from "assets/icons/Remove.icon";
import { Menu } from "@mantine/core";

type ActionNames = "rename" | "duplicate" | "delete" | "reset";

interface TypographyTabMenu {
	position: {
		x: number;
		y: number;
	};
	opened: boolean;
	onClose: (value: boolean) => void;
	onMenuAction: (value: ActionNames) => void;
	excludedItems?: number[];
}

export const TypographyTabMenu = memo<TypographyTabMenu>(
	({ position, opened, onClose, onMenuAction, excludedItems }) => {
		const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false);
		const [isResetConfirmation, setIsResetConfirmation] = useState(false);

		const menuItems = useMemo(
			() =>
				[
					{
						icon: <Edit />,
						label: "Rename",
						onClick: () => onMenuAction("rename"),
					},
					{
						icon: <Duplicate />,
						label: "Duplicate",
						onClick: () => onMenuAction("duplicate"),
					},
					{
						icon: <Keyboard />,
						label: isResetConfirmation ? "Are you sure?" : "Restore default",
						onClick: isResetConfirmation
							? () => {
									onMenuAction("reset");
									setIsResetConfirmation(false);
							  }
							: () => setIsResetConfirmation(true),
						closeMenuOnClick: isResetConfirmation,
						style: isResetConfirmation ? { background: "#c2344e" } : {},
					},
					{
						icon: <Remove />,
						label: isDeleteConfirmation ? "Are you sure?" : "Remove",
						onClick: isDeleteConfirmation
							? () => {
									onMenuAction("delete");
									setIsDeleteConfirmation(false);
							  }
							: () => setIsDeleteConfirmation(true),
						closeMenuOnClick: isDeleteConfirmation,
						style: isDeleteConfirmation ? { background: "#c2344e" } : {},
					},
				].filter((item, idx) => !excludedItems?.includes(idx)),
			[isResetConfirmation, isDeleteConfirmation, excludedItems, onMenuAction],
		);

		useEffect(() => {
			if (opened) {
				setIsDeleteConfirmation(false);
				setIsResetConfirmation(false);
			}
		}, [opened]);

		return (
			<div
				className="tab-menu"
				style={{
					left: `${position.x}px`,
					top: `${position.y}px`,
				}}
			>
				<Menu opened={opened} onChange={onClose} position="bottom-end">
					<Menu.Target>
						<span></span>
					</Menu.Target>

					<Menu.Dropdown>
						{menuItems.map(({ label, ...rest }) => (
							<Menu.Item key={label} {...rest}>
								{label}
							</Menu.Item>
						))}
					</Menu.Dropdown>
				</Menu>
			</div>
		);
	},
);
