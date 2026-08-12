import { InspectorControls, PanelColorSettings } from "@wordpress/block-editor";
import { SelectControl, PanelBody, RangeControl } from "@wordpress/components";
import { useBlockProps } from "@wordpress/block-editor";
import { Icons } from "./Icons";

export const Edit = ({ attributes, setAttributes }) => {
	const blockProps = useBlockProps({
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
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<InspectorControls key="cf-theme-toggle-settings">
				<PanelBody title="Theme toggle settings" initialOpen={true} className="cf-theme-toggle-settings">
					<PanelColorSettings
						title={"Icon colors"}
						colorSettings={[
							{
								value: attributes.dark_mode_color,
								onChange: (value) => setAttributes({ dark_mode_color: value }),
								label: "Dark mode color",
							},
							{
								value: attributes.light_mode_color,
								onChange: (value) => setAttributes({ light_mode_color: value }),
								label: "Light mode color",
							},
							{
								value: attributes.background_color,
								onChange: (value) => setAttributes({ background_color: value }),
								label: "Background color",
							},
						]}
					/>

					<div className="coreframework-panel">
						<SelectControl
							label="Icon type"
							value={attributes.icon_type}
							options={[
								{ label: "Filled", value: "filled" },
								{ label: "Outline", value: "outline" },
							]}
							onChange={(value) => setAttributes({ icon_type: value })}
						/>

						<RangeControl
							help="Size of the icon in pixels"
							initialPosition={16}
							label="Icon size"
							max={100}
							min={12}
							value={attributes.icon_size}
							onChange={(value) => setAttributes({ icon_size: value })}
						/>

						<RangeControl
							help="Padding around the icon in pixels"
							initialPosition={0}
							label="Padding"
							max={40}
							min={0}
							value={attributes.button_padding}
							onChange={(value) => setAttributes({ button_padding: value })}
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			<Icons
				icon_size={attributes.icon_size}
				dark_mode_color={attributes.dark_mode_color}
				light_mode_color={attributes.light_mode_color}
				icon_type={attributes.icon_type}
			/>
		</button>
	);
};
