<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CoreFrameworkOxygenThemeToggle extends OxyEl {

	public function init() {
	}

	public function afterInit() {
		$this->removeApplyParamsButton();
	}

	public function name() {
		return 'Theme Toggle';
	}

	public function slug() {
		return 'cf-theme-toggle';
	}

	public function icon() {
		return CORE_FRAMEWORK_DIR_URL . 'wp/App/Oxygen/assets/moon-regular.svg';
	}

	public function button_place() {
		return '';
	}

	public function button_priority() {
	}

	public function render( $options ) {
			$svg_base_class = 'cf-theme-icon';
			$size           = ( isset( $options['slug_cfthemetogglebutton_width'] ) && ! empty( $options['slug_cfthemetogglebutton_width'] ) ) ? $options['slug_cfthemetogglebutton_width'] . $options['slug_cfthemetogglebutton_width_unit'] : '16px';

			$filled_light_mode_icon_clean = '<svg xmlns="http://www.w3.org/2000/svg" width="' . esc_html( $size ) . '" class="' . esc_html( $svg_base_class ) . ' cf-light-mode-icon" color="currentColor" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"></path></svg>';
			$filled_dark_mode_icon_clean  = '<svg xmlns="http://www.w3.org/2000/svg" width="' . esc_html( $size ) . '" class="' . esc_html( $svg_base_class ) . ' cf-dark-mode-icon" color="currentColor" fill="currentColor" viewBox="0 0 24 24"><path d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"></path></svg>';

			$outline_light_mode_icon_clean = '<svg xmlns="http://www.w3.org/2000/svg" width="' . esc_html( $size ) . '" class="' . esc_html( $svg_base_class ) . ' cf-light-mode-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"></path></svg>';
			$outline_dark_mode_icon_clean  = '<svg xmlns="http://www.w3.org/2000/svg" width="' . esc_html( $size ) . '" class="' . esc_html( $svg_base_class ) . ' cf-dark-mode-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"></path></svg>';

			$icon_variant = $options['icon_variant'];
			$is_outline   = empty( $icon_variant ) || $icon_variant === 'Outline';

			$wp_kses_options = CoreFramework()->get_wp_kses_options();

		?>
<button class='cf-theme-toggle-button cf-theme-dark' id='cf-theme-toggle-button' aria-label='Toggle theme'>
		<?php
		echo wp_kses(
			$is_outline ? $outline_dark_mode_icon_clean : $filled_dark_mode_icon_clean,
			$wp_kses_options
		);
		echo wp_kses(
			$is_outline ? $outline_light_mode_icon_clean : $filled_light_mode_icon_clean,
			$wp_kses_options
		);
		?>
</button>
		<?php

		$js = file_get_contents( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/js/core_framework_theme.js' );
		$js = preg_replace( '/\s+/', ' ', $js );

		$this->El->inlineJS( $js );
	}

	public function controls() {
		$this->addOptionControl(
			array(
				'type' => 'dropdown',
				'name' => __( 'Icon variant', 'core-framework' ),
				'slug' => 'icon_variant',
			)
		)->setValue(
			array(
				'Filled',
				'Outline',
			)
		)->rebuildElementOnChange();

		$this->addStyleControls(
			array(
				array(
					'control_type' => 'colorpicker',
					'name'         => __( 'Icon color for light mode', 'core-framework' ),
					'property'     => 'color',
					'selector'     => '.cf-light-mode-icon',
					'default'      => '#ffffff',
				),
			)
		);

		$this->addStyleControls(
			array(
				array(
					'control_type' => 'colorpicker',
					'name'         => __( 'Icon color for dark mode', 'core-framework' ),
					'property'     => 'color',
					'selector'     => '.cf-dark-mode-icon',
					'default'      => '#000000',
				),
			)
		);

		$this->addStyleControls(
			array(
				array(
					'name'     => __( 'Size', 'core-framework' ),
					'property' => 'width',
					'default'  => '30',
					'selector' => '.cf-theme-toggle-button',
				),
			)
		);
	}

	public function defaultCSS() {
		$css = '
		.cf-theme-toggle-button {
			border: none;
			outline: none;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0);
			border-radius: 999px;
			width: 30px;
			aspect-ratio: 1;
			cursor: pointer;
			padding: 1px 6px;
		}
		.cf-theme-toggle-button > svg {
			width: 100%;
			height: 100%;
		}
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
		.cf-theme-toggle-button svg.cf-light-mode-icon {
			color: #000000;
		}
		.cf-theme-toggle-button svg.cf-dark-mode-icon {
			color: #ffffff;
		}
		';

		return $css;
	}
}

new CoreFrameworkOxygenThemeToggle();
