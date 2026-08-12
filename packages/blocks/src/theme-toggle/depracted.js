import { useBlockProps } from "@wordpress/block-editor";
import { Icons } from "./Icons";

export const v1 = {
	attributes: {
		icon_type: {
			type: "string",
			default: "filled",
		},
		icon_size: {
			type: "number",
			default: 24,
		},
		dark_mode_color: {
			type: "string",
		},
		light_mode_color: {
			type: "string",
		},
		background_color: {
			type: "string",
			default: "transparent",
		},
		button_padding: {
			type: "number",
			default: 0,
		},
	},
	save: ({ attributes }) => {
		const blockProps = useBlockProps.save({ className: "cf-theme-toggle-button cf-theme-dark" });

		return (
			<button
				{...blockProps}
				style={{
					display: "flex",
					alignItems: "center",
					width: `${attributes?.icon_size ?? 24}px`,
					height: `${attributes?.icon_size ?? 24}px`,
					...(Boolean(attributes?.button_padding) ? { padding: `${attributes?.button_padding}px` } : {}),
					...(Boolean(attributes?.background_color) && attributes?.background_color !== "transparent"
						? { backgroundColor: attributes?.background_color }
						: {}),
				}}
			>
				<Icons
					icon_size={attributes.icon_size}
					dark_mode_color={attributes.dark_mode_color}
					light_mode_color={attributes.light_mode_color}
					icon_type={attributes.icon_type}
				/>
			</button>
		);
	},
};

export const deprecated = [v1];
