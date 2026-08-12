import { useBlockProps } from "@wordpress/block-editor";
import { Icons } from "./Icons";

export const Save = ({ attributes }) => {
	const blockProps = useBlockProps.save({
		className: "cf-theme-toggle-button cf-theme-dark",
	});

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
			aria-label="Toggle theme"
		>
			<Icons
				icon_size={attributes.icon_size}
				dark_mode_color={attributes.dark_mode_color}
				light_mode_color={attributes.light_mode_color}
				icon_type={attributes.icon_type}
			/>
		</button>
	);
};
