import { z } from "zod";

export const localPreferencesSchema = z.object({
	selected_id: z.string(),
	oxygen: z.boolean().optional(),
	bricks: z.boolean().optional(),
	gutenberg: z.boolean().optional(),
	figma: z.boolean().optional(),
	disable_fonts: z.boolean().optional().describe("Disable Core Framework fonts integration in page builders"),
	delete_data: z.boolean().optional(),
	show_update_notice: z.boolean().optional(),
	has_theme: z.boolean().optional(),
	theme_mode: z.enum(["light", "dark", "auto"]).optional(),
	plugin_name: z.string().optional(),

	oxygen_enable_variable_dropdown: z.boolean().optional().describe("Enable variable dropdown in Oxygen"),
	oxygen_enable_dark_mode_preview: z.boolean().optional().describe("Enable dark mode preview in Oxygen"),
	oxygen_variable_ui: z.boolean().optional().describe("Enable variable UI in Oxygen"),
	oxygen_enable_variable_ui_auto_hide: z
		.boolean()
		.optional()
		.describe("Enable variable UI auto hide in Oxygen"),
	oxygen_apply_class_on_hover: z.boolean().optional().describe("Apply class on hover in Oxygen"),
	oxygen_enable_variable_context_menu: z
		.boolean()
		.optional()
		.describe("Open Variable UI on right click input in Oxygen"),
	oxygen_enable_unit_and_value_preview: z
		.boolean()
		.optional()
		.describe(
			"Enable unit and value preview in Oxygen when hovering over an item in variable UI and variable dropdown",
		),

	bricks_enable_variable_ui_hint: z.boolean().optional().describe("Enable variable UI hint in Oxygen"),
	bricks_enable_variable_dropdown: z.boolean().optional().describe("Enable variable dropdown in Bricks"),
	bricks_enable_dark_mode_preview: z.boolean().optional().describe("Enable dark mode preview in Bricks"),
	bricks_variable_ui: z.boolean().optional().describe("Enable variable UI in Bricks"),
	bricks_bem_generator: z.boolean().optional().describe("Enable BEM Class Generator in Bricks"),
	bricks_enable_variable_ui_auto_hide: z
		.boolean()
		.optional()
		.describe("Enable variable UI auto hide in Bricks"),
	oxygen_enable_variable_ui_hint: z.boolean().optional().describe("Enable variable UI hint in Oxygen"),
	bricks_apply_class_on_hover: z.boolean().optional().describe("Apply class on hover in Bricks"),
	bricks_apply_variable_on_hover: z.boolean().optional().describe("Apply variable on hover in Bricks"),
	bricks_enable_variable_context_menu: z
		.boolean()
		.optional()
		.describe("Open Variable UI on right click input in Bricks"),

	gutenberg_enable_dark_mode_preview: z
		.boolean()
		.optional()
		.describe("Enable dark mode preview in Gutenberg"),
	gutenberg_place_controls_at_the_top: z
		.boolean()
		.optional()
		.describe("Place controls at the top in Gutenberg"),
	gutenberg_close_widget_default: z.boolean().optional().describe("Close the widget by default"),

	/* LEGACY */
	root_font_size: z.number().optional(),
	postcss: z.boolean().optional().default(true).optional(),
	min_screen_width: z.number().optional(),
	max_screen_width: z.number().optional(),
	is_rem: z.boolean().default(true).optional(),
});

export const wpOptionsSchema = z.object({
	core_framework_main: localPreferencesSchema,
});
