import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Menu, MenuItemProps, Tooltip } from "@mantine/core";
import { ThreeDots2 } from "assets/icons/ThreeDots2.icon";
import { ComponentsPreview } from "./Components.preview";
import { Component } from "./types";

const getFirstSelector = (selector: string) => {
	if (!selector || selector === ".") {
		return "";
	}

	const arr = selector
		.trim()
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
		.filter((s) => s !== ".");

	return arr[0];
};

interface IComponentsCard {
	readonly onClick: () => void;
	readonly onMenuClick?: () => void;
	readonly component: Component;
	readonly variablesCss: string;
	readonly editorCss: string;
	readonly menuItems: (MenuItemProps & {
		label: string;
		onClick: () => void;
	})[];
	readonly isDarkBackground?: boolean;
}

export const ComponentsCard = memo(
	({
		onClick,
		onMenuClick,
		component,
		variablesCss,
		editorCss,
		menuItems,
		isDarkBackground,
	}: IComponentsCard) => {
		const { selector, type } = component;

		const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
			id: component.id,
		});

		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
		};

		return (
			<div ref={setNodeRef} style={style} {...attributes} className="components-card">
				<header>
					<div {...listeners} className="dnd-handle">
						<Tooltip label={selector} position="top-start">
							<p className="title">{selector}</p>
						</Tooltip>
					</div>

					<div className="right-side">
						<Menu
							transitionProps={{
								duration: 0,
							}}
							shadow="md"
							width={150}
						>
							<Menu.Target>
								<button onClick={onMenuClick ? onMenuClick : undefined} className="btn-quaternary btn-box">
									<ThreeDots2 />
								</button>
							</Menu.Target>

							<Menu.Dropdown>
								{menuItems.map(({ label, ...rest }) => (
									<Menu.Item key={label} {...rest}>
										{label}
									</Menu.Item>
								))}
							</Menu.Dropdown>
						</Menu>

						<button onClick={onClick} className="btn-secondary btn-s">
							Edit
						</button>
					</div>
				</header>

				<div className="component-preview">
					<ComponentsPreview
						editorCss={editorCss}
						variablesCss={variablesCss}
						type={type}
						selectors={[getFirstSelector(selector)]}
						isDarkBackground={isDarkBackground}
					/>
				</div>
			</div>
		);
	},
);

ComponentsCard.displayName = "ComponentsCard";
