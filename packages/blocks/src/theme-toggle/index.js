import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import "./editor.scss";
import { Edit } from "./edit";
import { Save } from "./save";
import metadata from "./block.json";
import { deprecated } from "./depracted";

const { name, example, attributes } = metadata;

/**
 * Every block starts by registering a new block type definition.
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
registerBlockType(name, {
	example,
	attributes,
	deprecated,
	edit: Edit,
	save: Save,
	icon: {
		src: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
			</svg>
		),
	},
});
