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

namespace CoreFramework\App\Bricks;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Helper;

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
 * Class Bricks
 *
 * @package CoreFramework\App\Bricks
 * @since 0.0.1
 */
class Bricks extends Base {

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.1
	 */
	public function init(): void {
		/**
		 * This Bricks class is only being instantiated in the Bricks builder as requested in the Scaffold class
		 *
		 * @see Requester::is_brick()
		 * @see Scaffold::__construct
		 *
		 * Add plugin code here
		 */

		if ( ! CoreFrameworkBricks()->determine_load() ) {
			return;
		}

		\add_action( 'init', array( $this, 'enqueue_builder_helpers' ), 9 );
		\add_action( 'init', array( $this, 'register_frontend_theme_helper' ), 10 );
		\add_action( 'init', array( $this, 'register_bricks_elements' ), 11 );
		\add_action( 'wp_enqueue_scripts', array( $this, 'add_corresponding_css' ), 9999, 12 );
	}

	public function add_corresponding_css() {
		$helper = new Helper();

		if ( $helper->isFontsDisabled() ) {
			return;
		}

		$preset = $helper->loadPreset();
		$preset_fonts = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FONTS'] )
			? $preset['modulesData']['FONTS']['fonts']
			: array();
		$css = '';

		foreach ( $preset_fonts as $font ) {
				$css .= $font['cssPreview'];
		}

		wp_register_style( 'core-framework-inline', false, array(), CORE_FRAMEWORK_VERSION );
		wp_enqueue_style( 'core-framework-inline' );
		wp_add_inline_style( 'core-framework-inline', merge_root_selectors( $css ) );
	}

	/**
	 * Determine if the plugin should be loaded.
	 *
	 * @since 1.2.0
	 */
	public static function register_bricks_elements() {
		if (
			! CoreFrameworkBricks()->is_bricks() ||
			! class_exists( 'Bricks\Elements' )
		) {
			return;
		}

		foreach ( glob( ( __DIR__ ) . '/Elements/*.php' ) as $filename ) {
			\Bricks\Elements::register_element( $filename );
		}
	}

	/**
	 * Enqueue helper scripts and styles in bricks builder
	 *
	 * @since 1.2.0
	 */
	public function enqueue_builder_helpers() {
		if ( ! ( function_exists( 'bricks_is_builder_main' ) && bricks_is_builder_main() ) ) {
			return;
		}

		CoreFramework()->enqueue_core_framework_connector();

		$name = 'core-framework-bricks-helper';

		\wp_register_script(
			$name,
			\plugins_url( '/assets/public/js/bricks_builder.js', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			\filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/js/bricks_builder.js' ),
			true,
		);
		\wp_enqueue_script( $name );

		\wp_register_script(
			'bricks_bem_generator',
			\plugins_url( '/assets/public/js/bricks_bem_generator.js', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			filemtime( CORE_FRAMEWORK_DIR_ROOT . '/assets/public/js/bricks_bem_generator.js' ),
			false
		);
		\wp_enqueue_script( 'bricks_bem_generator' );

		\wp_register_style(
			$name,
			\plugins_url( '/assets/public/css/bricks_builder.css', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			\filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/css/bricks_builder.css' ),
		);
		\wp_enqueue_style( $name );

		\wp_register_style(
			'core_framework_bricks_variable_ui',
			\plugins_url( '/assets/public/css/variable_ui.css', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			\filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/css/variable_ui.css' ),
		);
		\wp_enqueue_style( 'core_framework_bricks_variable_ui' );
	}

	/**
	 * Register frontend theme helper
	 *
	 * @since 1.2.0
	 */
	public static function register_frontend_theme_helper() {
		if ( function_exists( 'bricks_is_builder_iframe' ) && bricks_is_builder_iframe() ) {
			return;
		}

		\wp_register_script(
			'core_framework_theme',
			\plugins_url( '/assets/public/js/core_framework_theme.js', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			filemtime( CORE_FRAMEWORK_DIR_ROOT . '/assets/public/js/core_framework_theme.js' ),
			false
		);
	}
}
