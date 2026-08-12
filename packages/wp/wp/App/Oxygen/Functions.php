<?php

/**
 * CoreFramework
 *
 * @package   CoreFramework
 * @author    Core Framework <hello@coreframework.com>
 * @copyright 2023 Core Framework
 * @license   MIT
 * @link      https://coreframework.com
 */

declare(strict_types=1);

namespace CoreFramework\App\Oxygen;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Helper;
use CoreFramework\StylesheetStorage;
use Yabe\Webfont\Utils\Font;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Merge multiple :root selectors into a single one
 *
 * @param string $cssString The CSS string containing multiple :root selectors
 * @return string The CSS with merged :root selectors
 * @since 1.10.0
 */
if ( ! function_exists( 'merge_root_selectors' ) ) {
	function merge_root_selectors( $cssString ) {
		$rootRegex = '/:root\s*\{\s*([^}]*)\s*\}/m';
		$mergedVariables = '';

		if ( preg_match_all( $rootRegex, $cssString, $matches ) ) {
			foreach ( $matches[1] as $match ) {
				$props = explode( ';', $match );

				foreach ( $props as $prop ) {
					$prop = trim( $prop );
					if ( ! empty( $prop ) ) {
						$mergedVariables .= "  " . $prop . ";\n";
					}
				}
			}
		}

		$cleanedCss = preg_replace( $rootRegex, '', $cssString );
		$cleanedCss = trim( $cleanedCss );
		$mergedRoot = ":root {\n{$mergedVariables}}";

		return $mergedRoot . "\n\n" . $cleanedCss;
	}
}

/**
 * Class Oxygen
 *
 * @package CoreFramework\App\Oxygen
 * @since 0.0.0
 */
class Functions extends Base {

	/**
	 * Name of Core Framework selectors folder and color set in Oxygen
	 *
	 * @since 0.0.0
	 * @var string
	 */
	public const CORE_FOLDER = 'CoreFramework';

	/**
	 * Oxygen components classes option
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const OXYGEN_COMPONENTS_CLASSES_OPTION = 'ct_components_classes';

	/**
	 * Oxygen classes folder option
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const OXYGEN_CLASSES_FOLDER_OPTION = 'ct_style_folders';

	/**
	 * Oxygen color palettes option
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const OXYGEN_COLOR_PALETTES_OPTION = 'oxygen_vsb_global_colors';

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.0
	 */
	public function init(): void {
		/**
		 * This Oxygen class is only being instantiated in the Oxygen builder as requested in the Scaffold class
		 *
		 * @see Requester::isOxygen()
		 * @see Scaffold::__construct
		 *
		 * Add plugin code here
		 */
		 \add_action( 'wp_enqueue_scripts', array( $this, 'add_corresponding_css' ), 9999, 12 );
		 \add_action( 'ct_builder_ng_init', fn() => $this->elegant_custom_fonts(), 1000001);
		 \add_action( 'wp_head', array( $this, 'add_font_label_styles' ), 1000001);
	}

	/**
	 * Add CSS styles for Core Framework font labels in Oxygen builder
	 *
	 * @since 1.10.0
	 */
	public function add_font_label_styles(): void {
		if ( ! defined( 'SHOW_CT_BUILDER' ) || defined( 'OXYGEN_IFRAME' ) ) {
			return;
		}

		$helper = new Helper();
		if ( $helper->isFontsDisabled() ) {
			return;
		}

		$selector = '.oxygen-select-box-option.ng-binding.ng-scope[ng-repeat*="elegantCustomFonts"]';
		$svg      = 'data:image/svg+xml,' . rawurlencode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.82 24.84"><defs><linearGradient id="e" x1="3.77" y1="7.44" x2="31.03" y2="24.04" gradientTransform="translate(0 26) scale(1 -1)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5c68f9"/><stop offset="1" stop-color="#8e97fe"/></linearGradient></defs><rect x="18.78" y="10.68" width="13.03" height="7.07" fill="#fa5e5e"/><path d="m12.42,0C5.56,0,0,5.56,0,12.42h0c0,6.86,5.56,12.42,12.42,12.42h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0c0-2.95,2.39-5.35,5.35-5.35h19.4V0H12.42Z" fill="#7d87fc"/><path d="m7.07,12.42h0c0-1.23.43-2.35,1.13-3.25h-.02L.74,16.6c1.72,4.79,6.3,8.23,11.68,8.23h6.37v-7.07h-6.37c-2.95,0-5.35-2.39-5.35-5.35h0Z" fill="#424ae1"/></svg>' );
		$css      = $selector . '{display:flex;justify-content:space-between;align-items:center;}'
			. $selector . '::after{content:"";width:15px;height:15px;background-image:url("' . $svg . '");background-size:contain;background-repeat:no-repeat;margin-left:auto;flex-shrink:0;}';
		$handle   = 'core-framework-oxygen-font-labels';

		wp_register_style( $handle, false, array(), CORE_FRAMEWORK_VERSION );
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}

	/**
	 * Refresh Oxygen selectors
	 *
	 * @since 0.0.0
	 */
	public function refresh_selectors( $new_core_selectors_array ): void {
		$this->add_selectors_folder();

		$ct_class_names            = get_option( self::OXYGEN_COMPONENTS_CLASSES_OPTION, array() );
		$prev_core_selectors_array = array();

		foreach ( $ct_class_names as $ct_class_name ) {
			if ( $ct_class_name['parent'] === self::CORE_FOLDER ) {
				array_push( $prev_core_selectors_array, $ct_class_name['key'] );
			}
		}

		foreach ( $prev_core_selectors_array as $prev_core_selector_array ) {
			unset( $ct_class_names[ $prev_core_selector_array ] );
		}

		foreach ( $new_core_selectors_array as $new_core_selector_array ) {
			$is_duplicate = array_key_exists( $new_core_selector_array, $ct_class_names );

			if ( $is_duplicate ) {
				continue;
			}

			$ct_class_names[ $new_core_selector_array ] = array(
				'key'      => $new_core_selector_array,
				'parent'   => self::CORE_FOLDER,
				'original' => array( 'selector-locked' => 'true' ),
			);
		}

		update_option( self::OXYGEN_COMPONENTS_CLASSES_OPTION, $ct_class_names, false );
	}

	public function elegant_custom_fonts() {
		$helper = new Helper();

		if ( $helper->isFontsDisabled() ) {
			return;
		}

		$preset = $helper->loadPreset();
		$preset_fonts = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FONTS'] )
			? $preset['modulesData']['FONTS']['fonts']
			: array();
		$customCoreFontFamilies = array_column($preset_fonts, 'family');

		$output = \wp_json_encode($customCoreFontFamilies);
		if ( $output === false ) {
			$output = '[]';
		}
		// The value is JSON-encoded specifically for this Oxygen JavaScript hook.
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo \sprintf( 'elegantCustomFonts=%s;', $output );
	}

	/**
	 * Remove Core Framework selectors from Oxygen. Used when uninstalling the plugin
	 *
	 * @since 0.0.0
	 */
	public function remove_selectors(): void {
		$is_oxygen                = $this->is_oxygen();
		$has_ct_components_option = get_option( self::OXYGEN_COMPONENTS_CLASSES_OPTION, array() ) ?: array();

		if ( ! $is_oxygen || ! $has_ct_components_option ) {
			return;
		}

		$ct_class_names = get_option( self::OXYGEN_COMPONENTS_CLASSES_OPTION, array() ) ?: array();

		foreach ( $ct_class_names as $ct_class_name ) {
			if ( ( $ct_class_name['parent'] ?? '' ) === self::CORE_FOLDER ) {
				unset( $ct_class_names[ $ct_class_name['key'] ] );
			}
		}

		update_option( self::OXYGEN_COMPONENTS_CLASSES_OPTION, $ct_class_names, false );
	}

	/**
	 * Check if Oxygen 6.0 or higher is activated
	 *
	 * @since 1.10.0
	 */
	public function is_oxygen6(): bool {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
		if ( file_exists( WP_PLUGIN_DIR . '/oxygen/plugin.php' ) && is_plugin_active( 'oxygen/plugin.php' ) ) {
			$plugin_data = get_plugin_data( WP_PLUGIN_DIR . '/oxygen/plugin.php' );
			return version_compare( $plugin_data['Version'], '6.0', '>=' );
		}
		return false;
	}

	/**
	 * Check if oxygen is activated
	 *
	 * @since 0.0.0
	 */
	public function is_oxygen(): bool {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
		$ct_builder = sanitize_text_field( (string) filter_input( INPUT_GET, 'ct_builder', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );

		return ( is_plugin_active( 'oxygen/functions.php' ) || 'true' === $ct_builder || class_exists( 'CT_Component' ) ) || $this->is_oxygen6();
	}

	/**
	 * Handle oxygen builder uninstall. Remove Core Framework selectors and colors
	 *
	 * @since 0.0.0
	 */
	public function handle_uninstall(): void {
		if ( ! $this->is_oxygen() ) {
			return;
		}

		$this->remove_selectors();
		$this->remove_selectors_folder();
		$this->remove_colors();
	}

	/**
	 * Add Core Framework folder to organize selectors
	 *
	 * @since 0.0.0
	 */
	public function add_selectors_folder(): void {
		$folders = get_option( self::OXYGEN_CLASSES_FOLDER_OPTION, array() ) ?: array();

		if ( array_key_exists( self::CORE_FOLDER, $folders ) ) {
			return;
		}

		$folders[ self::CORE_FOLDER ] = array(
			'key'    => self::CORE_FOLDER,
			'status' => 1,
		);

		update_option( self::OXYGEN_CLASSES_FOLDER_OPTION, $folders, false );
	}

	/**
	 * Remove Core Framework folder
	 *
	 * @since 0.0.0
	 */
	public function remove_selectors_folder(): void {
		$folders = get_option( self::OXYGEN_CLASSES_FOLDER_OPTION, array() ) ?: array();

		if ( ! array_key_exists( self::CORE_FOLDER, $folders ) ) {
			return;
		}

		unset( $folders[ self::CORE_FOLDER ] );
		update_option( self::OXYGEN_CLASSES_FOLDER_OPTION, $folders, false );
	}

	/**
	 * Add colors to Oxygen color system
	 */
	public function update_colors( $new_colors ): void {
		if ( ( is_countable( $new_colors ) ? count( $new_colors ) : 0 ) < 1 ) {
			$this->remove_colors();
			return;
		}

		$this->add_color_folder_name();

		$oxygen_colors = get_option( self::OXYGEN_COLOR_PALETTES_OPTION, array() );
		$oxygen_sets   = $oxygen_colors['sets'] ?? array();
		$core_set_id   = null;

		foreach ( $oxygen_sets as $oxygen_set ) {
			if ( $oxygen_set['name'] === self::CORE_FOLDER ) {
				$core_set_id = $oxygen_set['id'];
			}
		}

		if ( $core_set_id === null ) {
			return;
		}

		$colors = $oxygen_colors['colors'] ?? array();
		$colors = array_filter( $colors, fn ( $color ): bool => $color['set'] !== $core_set_id );

		foreach ( $new_colors as $new_color ) {
			if ( isset( $new_color['dark'] ) && $new_color['dark'] ) {
				continue;
			}

			$colors[] = array(
				'name'  => $new_color['name'],
				'value' => $new_color['raw'],
				'id'    => substr( $new_color['id'], -6 ),
				'set'   => $core_set_id,
			);
		}

		$colors                           = array_values( $colors );
		$oxygen_colors['colors']          = $colors;
		$oxygen_colors['colorsIncrement'] = is_countable( $colors ) ? count( $colors ) : 0;
		$oxygen_colors['setsIncrement']   = is_countable( $oxygen_sets ) ? count( $oxygen_sets ) : 0;

		update_option( self::OXYGEN_COLOR_PALETTES_OPTION, $oxygen_colors, false );
	}

	/**
	 * Add color folder name to Oxygen color system
	 *
	 * @since 0.0.0
	 */
	public function add_color_folder_name(): void {
		$oxygen_colors = get_option( self::OXYGEN_COLOR_PALETTES_OPTION, array() );

		if ( empty( $oxygen_colors ) ) {
			$oxygen_colors = array(
				'colors' => array(),
				'sets'   => array(),
			);
		}

		$oxygen_sets = $oxygen_colors['sets'] ?? array();

		$existing_set = CoreFramework()->array_some( $oxygen_sets, fn ( $set ): bool => $set['name'] === self::CORE_FOLDER );

		if ( $existing_set ) {
			return;
		}

		$oxygen_sets[] = array(
			'name' => self::CORE_FOLDER,
			'id'   => ( is_countable( $oxygen_sets ) ? count( $oxygen_sets ) : 0 ) + 1,
		);

		$oxygen_colors['sets'] = $oxygen_sets;

		update_option( self::OXYGEN_COLOR_PALETTES_OPTION, $oxygen_colors, false );
	}

	/**
	 * Remove colors and color set from Oxygen color system
	 *
	 * @since 0.0.0
	 */
	public function remove_colors(): bool {
		$oxygen_global_colors = get_option( self::OXYGEN_COLOR_PALETTES_OPTION, array() );

		if ( empty( $oxygen_global_colors ) ) {
			return false;
		}

		$oxygen_sets   = $oxygen_global_colors['sets'] ?: array();
		$oxygen_colors = $oxygen_global_colors['colors'] ?? array();

		if ( empty( $oxygen_sets ) || empty( $oxygen_colors ) ) {
			return false;
		}

		$core_set_id = null;

		foreach ( $oxygen_sets as $set ) {
			if ( $set['name'] === self::CORE_FOLDER ) {
				$core_set_id = $set['id'];
			}
		}

		if ( $core_set_id === null ) {
			return false;
		}

		$oxygen_colors = array_filter( $oxygen_colors, fn ( $color ): bool => $color['set'] !== $core_set_id );

		$oxygen_sets = array_filter( $oxygen_sets, fn ( $set ): bool => $set['name'] !== self::CORE_FOLDER );

		$oxygen_global_colors['colors']          = $oxygen_colors;
		$oxygen_global_colors['sets']            = $oxygen_sets;
		$oxygen_global_colors['colorsIncrement'] = count( (array) $oxygen_colors );
		$oxygen_global_colors['setsIncrement']   = count( (array) $oxygen_sets );

		update_option( self::OXYGEN_COLOR_PALETTES_OPTION, $oxygen_global_colors, false );

		return true;
	}

	/**
	 * Enqueue styles for Oxygen
	 *
	 * @return void
	 */
	public function enqueue() {
		global $wp_styles;

		$wp_styles->add(
			'core-framework-frontend',
			StylesheetStorage::get_url(),
			array(),
			StylesheetStorage::get_version(),
			'all'
		);
		$wp_styles->do_items( 'core-framework-frontend' );
	}

	/**
	 * Apply inline styles to root
	 *
	 * @return void
	 */
	public function add_corresponding_css() {
		$helper = new Helper();

		if ( $helper->isFontsDisabled() ) {
			return;
		}

		$preset       = $helper->loadPreset();
		$preset_fonts = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FONTS'] )
			? $preset['modulesData']['FONTS']['fonts']
			: array();
		$css          = '';

		foreach ( $preset_fonts as $font ) {
			$css .= $font['cssPreview'];
		}

		wp_register_style( 'core-framework-fonts-inline', false, array(), CORE_FRAMEWORK_VERSION );
		wp_enqueue_style( 'core-framework-fonts-inline' );
		wp_add_inline_style( 'core-framework-fonts-inline', merge_root_selectors( $css ) );
	}

	/**
	 * Enqueue styles in oxygen builder iframe
	 *
	 * @return void
	 */
	public function enqueue_styles_oxygen_iframe() {
		$this->enqueue();
	}

	/**
	 * Enqueue Helper styles for Oxygen allowing preview of colors defined by a variable
	 *
	 * @return void
	 */
	public function enqueue_helper() {
		CoreFramework()->enqueue_core_framework_connector();

		if ( class_exists( 'Yabe\Webfont\Utils\Font' ) ) {
			$yabe_fonts = \wp_json_encode( \array_column( Font::get_fonts(), 'family' ) ) ?: '[]';
			$js = 'window.core_yabe_fonts = ' . $yabe_fonts . ';';
			$name = 'core-framework-fonts';

			\wp_register_script( $name, '', array(), CORE_FRAMEWORK_VERSION, true );
			\wp_enqueue_script( $name );
			\wp_add_inline_script( $name, $js, 'before' );
		}

		$helper    = new Helper();
		$variables = $helper->getVariables(
			array(
				'group_by_category' => true,
			)
		);
		$core_colors = get_option( 'core_framework_colors', array() );
		$js = 'window.parent.core_colors = ' . ( \wp_json_encode( $core_colors ) ?: '[]' ) . ';';
		$js .= 'window.parent.core_variables = ' . ( \wp_json_encode( $variables ) ?: '{}' ) . ';';
		$colors_script_name = 'core-framework-colors';

		\wp_register_script( $colors_script_name, '', array(), CORE_FRAMEWORK_VERSION, true );
		\wp_enqueue_script( $colors_script_name );
		\wp_add_inline_script( $colors_script_name, $js, 'before' );

		$name       = 'core_framework_oxygen_css_helper';
		$css_string = get_option(
			$name,
			''
		);

		wp_register_style( $name, false, array(), CORE_FRAMEWORK_VERSION );
		wp_enqueue_style( $name );
		wp_add_inline_style(
			$name,
			$css_string
		);

		$script_name = 'core_framework_oxygen_js_helper';
		$oxy_script_file = $this->is_oxygen6() ? 'oxygen6_builder.js' : 'oxygen_builder.js';

		\wp_register_script(
			$script_name,
			\plugins_url( '/assets/public/js/' . $oxy_script_file, CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			\filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . '/assets/public/js/' . $oxy_script_file ),
			true,
		);
		\wp_enqueue_script( $script_name );

		if ( $this->is_oxygen6() ) {
			// Inject REST API credentials for Oxygen 6 builder
			$coreframework_config = array(
				'nonce'        => \wp_create_nonce( 'wp_rest' ),
				'rest_url'     => \get_rest_url(),
				'core_api_url' => \get_rest_url( null, 'core-framework/v2/' ),
			);
			$coreframework_js = 'window.coreframework = ' . \wp_json_encode( $coreframework_config ) . ';';
			\wp_add_inline_script( $script_name, $coreframework_js, 'before' );

		}

		\wp_register_style(
			'core_framework_oxygen_css_builder',
			\plugins_url( '/assets/public/css/oxygen_builder.css', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			\filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/css/oxygen_builder.css' ),
		);
		\wp_enqueue_style( 'core_framework_oxygen_css_builder' );

		\wp_register_style(
			'core_framework_oxygen_variable_ui',
			\plugins_url( '/assets/public/css/variable_ui.css', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			\filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/css/variable_ui.css' ),
		);
		\wp_enqueue_style( 'core_framework_oxygen_variable_ui' );
	}

	/**
	 * Determine loading of integration
	 *
	 * @since 1.1.2
	 */
	public function determine_load(): bool {
		$option = get_option( 'core_framework_main', array() );
		return isset( $option['oxygen'] ) && $option['oxygen'];
	}
}
