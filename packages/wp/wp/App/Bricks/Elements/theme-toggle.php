<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CoreFrameworkThemeToggle extends \Bricks\Element {

	public $category     = 'Core Framework';
	public $name         = 'cf-theme-toggle';
	public $icon         = 'ti-flickr';
	public $css_selector = '';
	public $scripts      = array( 'core_framework_theme' );
	public $id           = 'cf-theme-toggle';

	public function get_label() {
		return esc_html__( 'Theme Toggle', 'core-framework' );
	}

	public function set_control_groups() {
		$this->control_groups['icons']  = array(
			'title' => esc_html__( 'Icons', 'core-framework' ),
			'tab'   => 'content',
		);
		$this->control_groups['colors'] = array(
			'title' => esc_html__( 'Colors', 'core-framework' ),
			'tab'   => 'content',
		);
	}

	public function set_controls() {
		/**
		 * General
		 */
		$this->controls['_padding'] = array(
			'tab'     => 'style',
			'group'   => '_layout',
			'label'   => esc_html__( 'Padding', 'core-framework' ),
			'type'    => 'spacing',
			'css'     => array(
				array(
					'property' => 'padding',
				),
			),
			'default' => array(
				'top'    => 'var(--space-xs)',
				'right'  => 'var(--space-xs)',
				'bottom' => 'var(--space-xs)',
				'left'   => 'var(--space-xs)',
			),
		);

		$this->controls['_width'] = array(
			'tab'   => 'style',
			'group' => '_layout',
			'label' => esc_html__( 'Width', 'core-framework' ),
			'type'  => 'number',
			'units' => true,
			'css'   => array(
				array(
					'property' => 'width',
				),
			),
		);

		$this->controls['_height'] = array(
			'tab'   => 'style',
			'group' => '_layout',
			'label' => esc_html__( 'Height', 'core-framework' ),
			'type'  => 'number',
			'units' => true,
			'css'   => array(
				array(
					'property' => 'height',
				),
			),
		);

		$this->controls['_display'] = array(
			'tab'     => 'style',
			'group'   => '_layout',
			'label'   => esc_html__( 'Display', 'core-framework' ),
			'type'    => 'select',
			'options' => array(
				'flex'         => esc_html__( 'Flex', 'core-framework' ),
				'block'        => esc_html__( 'Block', 'core-framework' ),
				'inline-block' => esc_html__( 'Inline Block', 'core-framework' ),
			),
			'css'     => array(
				array(
					'property' => 'display',
				),
			),
			'default' => 'flex',
		);

		$this->controls['_justifyContent'] = array(
			'tab'     => 'style',
			'group'   => '_layout',
			'label'   => esc_html__( 'Justify Content', 'core-framework' ),
			'type'    => 'select',
			'options' => array(
				'flex-start'    => esc_html__( 'Flex Start', 'core-framework' ),
				'flex-end'      => esc_html__( 'Flex End', 'core-framework' ),
				'center'        => esc_html__( 'Center', 'core-framework' ),
				'space-between' => esc_html__( 'Space Between', 'core-framework' ),
				'space-around'  => esc_html__( 'Space Around', 'core-framework' ),
				'space-evenly'  => esc_html__( 'Space Evenly', 'core-framework' ),
			),
			'css'     => array(
				array(
					'property' => 'justify-content',
				),
			),
			'default' => 'center',
		);

		$this->controls['_alignSelf'] = array(
			'tab'     => 'style',
			'group'   => '_layout',
			'label'   => esc_html__( 'Align Self', 'core-framework' ),
			'type'    => 'select',
			'options' => array(
				'flex-start' => esc_html__( 'Flex Start', 'core-framework' ),
				'flex-end'   => esc_html__( 'Flex End', 'core-framework' ),
				'center'     => esc_html__( 'Center', 'core-framework' ),
				'stretch'    => esc_html__( 'Stretch', 'core-framework' ),
				'baseline'   => esc_html__( 'Baseline', 'core-framework' ),
			),
			'css'     => array(
				array(
					'property' => 'align-self',
				),
			),
			'default' => 'center',
		);

		$this->controls['_alignItems'] = array(
			'tab'     => 'style',
			'group'   => '_layout',
			'label'   => esc_html__( 'Align Items', 'core-framework' ),
			'type'    => 'select',
			'options' => array(
				'flex-start' => esc_html__( 'Flex Start', 'core-framework' ),
				'flex-end'   => esc_html__( 'Flex End', 'core-framework' ),
				'center'     => esc_html__( 'Center', 'core-framework' ),
				'stretch'    => esc_html__( 'Stretch', 'core-framework' ),
				'baseline'   => esc_html__( 'Baseline', 'core-framework' ),
			),
			'css'     => array(
				array(
					'property' => 'align-items',
				),
			),
			'default' => 'center',
		);

		$this->controls['_border_radius'] = array(
			'tab'     => 'style',
			'group'   => '_layout',
			'label'   => esc_html__( 'Border Radius', 'core-framework' ),
			'type'    => 'number',
			'units'   => true,
			'css'     => array(
				array(
					'property' => 'border-radius',
				),
			),
			'default' => '999px',
		);

		/**
		 * Component specific
		 */
		$this->controls['custom_light_mode_icon'] = array(
			'tab'   => 'content',
			'group' => 'icons',
			'label' => esc_html__( 'Custom light mode icon', 'core-framework' ),
			'type'  => 'icon',
			'root'  => true,
		);

		$this->controls['custom_dark_mode_icon'] = array(
			'tab'   => 'content',
			'group' => 'icons',
			'label' => esc_html__( 'Custom dark mode icon', 'core-framework' ),
			'type'  => 'icon',
			'root'  => true,
		);

		$this->controls['icon_size'] = array(
			'tab'     => 'content',
			'group'   => 'icons',
			'label'   => esc_html__( 'Icon Size', 'core-framework' ),
			'type'    => 'number',
			'units'   => true,
			'inline'  => true,
			'css'     => array(
				array(
					'property' => 'font-size',
					'selector' => '.cf-light-mode-icon, .cf-dark-mode-icon',
				),
				array(
					'property' => 'width',
					'selector' => 'svg.cf-theme-icon',
				),
				array(
					'property' => 'height',
					'selector' => 'svg.cf-theme-icon',
				),
			),
			'default' => '1.5rem',
		);

		$this->controls['icon_variant'] = array(
			'tab'     => 'content',
			'group'   => 'icons',
			'label'   => esc_html__( 'Icon Variant (Affects only default icon)', 'core-framework' ),
			'type'    => 'select',
			'options' => array(
				'filled'  => esc_html__( 'Filled', 'core-framework' ),
				'outline' => esc_html__( 'Outline', 'core-framework' ),
			),
		);

		$this->controls['light_mode_icon_color'] = array(
			'tab'     => 'content',
			'group'   => 'colors',
			'label'   => esc_html__( 'Light Mode Icon Color', 'core-framework' ),
			'type'    => 'color',
			'inline'  => true,
			'css'     => array(
				array(
					'property' => 'color',
					'selector' => '.cf-light-mode-icon',
				),
			),
			'default' => array( 'hex' => '#ffffff' ),
		);

		$this->controls['dark_mode_icon_color'] = array(
			'tab'     => 'content',
			'group'   => 'colors',
			'label'   => esc_html__( 'Dark Mode Icon Color', 'core-framework' ),
			'type'    => 'color',
			'inline'  => true,
			'css'     => array(
				array(
					'property' => 'color',
					'selector' => '.cf-dark-mode-icon',
				),
			),
			'default' => array( 'hex' => '#000000' ),
		);

		$this->controls['background'] = array(
			'tab'     => 'content',
			'group'   => 'colors',
			'label'   => esc_html__( 'Background', 'core-framework' ),
			'type'    => 'color',
			'inline'  => true,
			'css'     => array(
				array(
					'property' => 'background-color',
				),
			),
			'default' => array( 'hex' => '#00000000' ),
		);
	}

	public function enqueue_scripts() {
		\wp_enqueue_script( 'core_framework_theme' );

		$css = '
			.cf-theme-toggle-button.cf-theme-dark .cf-theme-icon.cf-light-mode-icon {
				display: none;
			}
			.cf-theme-toggle-button.cf-theme-dark .cf-theme-icon.cf-dark-mode-icon {
				display: block;
			}
			.cf-theme-toggle-button.cf-theme-light .cf-theme-icon.cf-light-mode-icon {
				display: block;
			}
			.cf-theme-toggle-button.cf-theme-light .cf-theme-icon.cf-dark-mode-icon {
				display: none;
			}
			.cf-theme-icon-button .cf-theme-icon svg {
				display: block;
			}
		';

		\wp_register_style( 'core-framework-theme', false, array(), CORE_FRAMEWORK_VERSION );
		\wp_enqueue_style( 'core-framework-theme' );
		\wp_add_inline_style( 'core-framework-theme', $css );
	}

	public function render() {
		$settings               = $this->settings;
		$is_outline             = empty( $settings['icon_variant'] ) || $settings['icon_variant'] === 'outline';
		$custom_light_mode_icon = ! empty( $settings['custom_light_mode_icon'] ) ? $settings['custom_light_mode_icon'] : false;
		$custom_dark_mode_icon  = ! empty( $settings['custom_dark_mode_icon'] ) ? $settings['custom_dark_mode_icon'] : false;

		$classes = 'cf-theme-toggle-button';

		if ( ! ( function_exists( 'bricks_is_builder_main' ) && bricks_is_builder_main() ) ) {
			$classes .= ' cf-theme-dark';
		}

		$svg_base_class = 'cf-theme-icon';

		$filled_light_mode_icon = '<svg xmlns="http://www.w3.org/2000/svg" class="' . esc_html( $svg_base_class ) . ' cf-light-mode-icon" color="currentColor" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"></path></svg>';
		$filled_dark_mode_icon  = '<svg xmlns="http://www.w3.org/2000/svg" class="' . esc_html( $svg_base_class ) . ' cf-dark-mode-icon" color="currentColor" fill="currentColor" viewBox="0 0 24 24"><path d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"></path></svg>';

		$outline_light_mode_icon = '<svg xmlns="http://www.w3.org/2000/svg" class="' . esc_html( $svg_base_class ) . ' cf-light-mode-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"></path></svg>';
		$outline_dark_mode_icon  = '<svg xmlns="http://www.w3.org/2000/svg" class="' . esc_html( $svg_base_class ) . ' cf-dark-mode-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"></path></svg>';

		$light_mode_icon = $is_outline ? $outline_light_mode_icon : $filled_light_mode_icon;
		$dark_mode_icon  = $is_outline ? $outline_dark_mode_icon : $filled_dark_mode_icon;

		if ( $custom_light_mode_icon ) {
			$icon_classes    = array( 'cf-theme-icon', 'cf-light-mode-icon', 'cf-theme-icon-custom' );
			$light_mode_icon = self::render_icon( $custom_light_mode_icon, $icon_classes );
		}

		if ( $custom_dark_mode_icon ) {
			$icon_classes   = array( 'cf-theme-icon', 'cf-dark-mode-icon', 'cf-theme-icon-custom' );
			$dark_mode_icon = self::render_icon( $custom_dark_mode_icon, $icon_classes );
		}

		$this->set_attribute( '_root', 'class', $classes );
		$this->set_attribute( '_root', 'aria-label', 'Toggle theme' );

		$wp_kses_options = CoreFramework()->get_wp_kses_options();

		echo wp_kses(
			'<button ' . $this->render_attributes( '_root' ) . '>',
			array_merge(
				$wp_kses_options,
				array(
					'button' => array(
						'class'      => true,
						'aria-label' => true,
						'type'       => true,
						'id'         => true,
					),
				)
			)
		);
		echo wp_kses(
			$light_mode_icon,
			$wp_kses_options
		);
		echo wp_kses(
			$dark_mode_icon,
			$wp_kses_options
		);
		echo wp_kses(
			'</button>',
			'post'
		);
	}
}
