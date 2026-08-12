import { memo, useEffect, useMemo, useState } from "react";
import { Duplicate } from "assets/icons/Duplicate.icon";
import { Edit } from "assets/icons/Edit.icon";
import { Remove } from "assets/icons/Remove.icon";
import { Menu } from "@mantine/core";

type ActionNames = "rename" | "duplicate" | "delete";

interface StylesheetsTabMenuProps {
	opened: boolean;
	position: { x: number; y: number };
	onClose: (value: boolean) => void;
	onMenuAction: (action: ActionNames) => void;
	excludedItems?: number[];
}

export const StylesheetsTabMenu = memo<StylesheetsTabMenuProps>(
	({ opened, position, onClose, onMenuAction, excludedItems = [] }) => {
		const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false);

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
						icon: <Remove />,
						label: isDeleteConfirmation ? "Are you sure?" : "Delete",
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
			[isDeleteConfirmation, excludedItems, onMenuAction],
		);

		useEffect(() => {
			if (opened) {
				setIsDeleteConfirmation(false);
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
