import { Ref, forwardRef, useMemo, useState } from "react";
import { useDebounce } from "hooks/useDebounce";
import { useDidMountEffect } from "hooks/useDidMountEffect";
import { Menu, MenuItemProps } from "@mantine/core";
import clsx from "clsx";
import { ThreeDots } from "assets/icons/ThreeDots.icon";
import { AutoSizeInput } from "./AutoSizeInput";

interface IClassSectionHeading {
	onTitleChange?: (title: string) => unknown;
	onTitleBlur?: () => unknown;
	onTargetClick?: () => unknown;
	title: string;
	leftItems?: JSX.Element[];
	rightItems?: JSX.Element[];
	menuItems?: (MenuItemProps & {
		label: string;
		onClick?: () => void;
		disabled?: boolean;
		confirm?: boolean;
	})[];
	titleInputClassName?: string;
}

export const ClassSectionHeading = forwardRef(
	(
		{
			onTitleChange,
			onTargetClick,
			onTitleBlur,
			title,
			leftItems,
			rightItems,
			menuItems,
			titleInputClassName,
		}: IClassSectionHeading,
		ref: Ref<HTMLDivElement>,
	) => {
		const [titleValue, setTitleValue] = useState(title);
		const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

		const debouncedTitle = useDebounce(titleValue, 300);

		const menuItemsCopy = useMemo(
			() =>
				menuItems?.map((item) => {
					if (item.confirm) {
						return {
							...Object.fromEntries(Object.entries(item).filter(([key]) => key !== "confirm")),
							onClick: () => (isConfirmationOpen ? item.onClick?.() : setIsConfirmationOpen(true)),
							closeMenuOnClick: isConfirmationOpen,
							style: isConfirmationOpen ? { background: "#c2344e" } : {},
							label: isConfirmationOpen ? "Are you sure?" : item.label,
						};
					}

					return item;
				}),
			[isConfirmationOpen, menuItems],
		);

		const handleTargetClick = () => {
			setIsConfirmationOpen(false);
			onTargetClick?.();
		};

		useDidMountEffect(() => onTitleChange?.(debouncedTitle), [debouncedTitle]);

		return (
			<header className="class-section-heading row space-between gap-m">
				<div className="input-wrapper row align-center gap-m">
					{onTitleChange ? (
						<AutoSizeInput
							className={clsx("heading-input group-heading-input", titleInputClassName)}
							value={titleValue}
							onChange={(value) => setTitleValue(value)}
							onBlur={() => onTitleBlur?.() ?? undefined}
						/>
					) : (
						<h2>{title}</h2>
					)}

					{!!leftItems?.length && (
						<div ref={ref} className="row align-center gap-s">
							{leftItems}
						</div>
					)}
				</div>

				<div className="row align-center gap-s">
					{!!rightItems?.length && <div className="row align-center gap-s full-height">{rightItems}</div>}

					{!!menuItems?.length && (
						<Menu width={215}>
							<Menu.Target>
								<button onClick={handleTargetClick} className="btn-quaternary btn-box">
									<ThreeDots />
								</button>
							</Menu.Target>

							<Menu.Dropdown>
								{menuItemsCopy?.map(({ label, ...rest }) => (
									<Menu.Item key={label} {...rest}>
										{label}
									</Menu.Item>
								))}
							</Menu.Dropdown>
						</Menu>
					)}
				</div>
			</header>
		);
	},
);

ClassSectionHeading.displayName = "ClassSectionHeading";
