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

namespace CoreFramework\App\Frontend;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Helper;
use CoreFramework\StylesheetStorage;

/**
 * Class Enqueue
 *
 * @package CoreFramework\App\Frontend
 * @since 0.0.0
 */
class Enqueue extends Base {


	/**
	 * Initialize the class.
	 *
	 * @since 0.0.0
	 */
	public function init(): void {
		/**
		 * This frontend class is only being instantiated in the frontend as requested in the Scaffold class
		 *
		 * @see Requester::isFrontend()
		 * @see Scaffold::__construct
		 */

		$helper = new Helper();
		StylesheetStorage::ensure();

		$option = get_option( 'core_framework_main', array() );
		$preset = $helper->loadPreset();

		if ( isset( $option['has_theme'] ) && $option['has_theme'] === true ) {
			add_action( 'wp_enqueue_scripts', array( $this, 'add_theme_helper' ), 999 );
		}

		$presetPreferences         = isset( $preset['preferences'] ) ? $preset['preferences'] : null;
		$hasDisableFocusableParent = isset( $presetPreferences['disable_focusable_parent'] ) && $presetPreferences['disable_focusable_parent'] === true;
		$hasClickableParent        = isset( $presetPreferences['is_clickable_parent'] ) && $presetPreferences['is_clickable_parent'] === true;

		if ( $hasDisableFocusableParent && $hasClickableParent ) {
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles_clickable_parent' ), 999 );
		}

		if ( CoreFrameworkOxygen()->is_oxygen() ) {
			// For Oxygen 6, load CSS in wp_footer to ensure it loads AFTER oxy-selectors.css
			// This prevents Oxygen's empty variable definitions from overriding Core Framework values
			if ( CoreFrameworkOxygen()->is_oxygen6() ) {
				// Enqueue scripts at the proper time
				add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_oxygen6_scripts' ), 999 );
				// Enqueue styles in footer
				add_action( 'wp_footer', array( $this, 'enqueue_styles_oxygen' ), 1 );
			} else {
				add_action( 'wp_head', array( $this, 'enqueue_styles_oxygen' ), 1_000_000 );
			}

				$enable           = isset( $option['oxygen'] ) && $option['oxygen'];
			// Check for both old Oxygen iframe param and Oxygen 6 (Breakdance-based) iframe param
			$in_oxygen_iframe = sanitize_text_field( filter_input( INPUT_GET, 'oxygen_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );
			$in_breakdance_iframe = sanitize_text_field( filter_input( INPUT_GET, 'breakdance_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );

			if ( ( $in_oxygen_iframe || $in_breakdance_iframe ) && $enable ) {
				add_action( 'wp_body_open', array( $this, 'enqueue_styles_oxygen_iframe' ), 1_000_000 );
			}

			return;
		}

		if ( CoreFrameworkBricks()->is_bricks() ) {
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles_bricks' ), 999 );
			add_action( 'wp_footer', array( $this, 'enqueue_styles_bricks_iframe' ), 999 );

			return;
		}

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ), 999 );
	}

	/**
	 * This function determines if stylesheet should be loaded.
	 * User can use 'core_framework_exclude_pages' filter to disable loading of stylesheet.
	 * They can pass either post id or slug to the filter.
	 * Usage: add_filter( 'core_framework_exclude_pages', function( $pages ) { $pages[] = 1; return $pages; } );
	 *
	 * @since 1.3.3
	 */
	public function determine_load(): bool {
		$exclude_pages = apply_filters( 'core_framework_exclude_pages', array() ) ?? array();
		if ( empty( $exclude_pages ) ) {
			return true;
		}
		return ! is_page( $exclude_pages );
	}

	/**
	 * Enqueue scripts function
	 *
	 * @since 0.0.0
	 */
	public function enqueue_styles(): void {
		if ( ! $this->determine_load() ) {
			return;
		}

		\wp_enqueue_style(
			'core-framework-frontend',
			StylesheetStorage::get_url(),
			array(),
			StylesheetStorage::get_version(),
			'all'
		);
	}

	/**
	 * Enqueue styles bricks
	 *
	 * @since 1.0.0
	 */
	public function enqueue_styles_bricks(): void {
		if ( function_exists( 'bricks_is_builder_iframe' ) && bricks_is_builder_iframe() ) {
			return;
		}

		if ( function_exists( 'bricks_is_builder_main' ) && bricks_is_builder_main() ) {

			function is_at_active() {
				if ( \is_plugin_active( 'bricks-advanced-themer/bricks-advanced-themer.php' ) ) {
					return true;
				}

				$prefix         = 'bricks-advanced-themer';
				$active_plugins = get_option( 'active_plugins', array() );

				foreach ( $active_plugins as $plugin ) {
					if ( strpos( $plugin, $prefix ) !== false ) {
						return true;
					}
				}

				return false;
			}

			if ( is_at_active() ) {
				$helper    = new Helper();
				$variables = $helper->getVariableString();

				echo wp_kses(
					'<style id="core-framework-bricks-main-variables">' . htmlspecialchars( $variables ) . '</style>',
					array(
						'style' => array(
							'id' => array(),
						),
					)
				);
			}

			return;
		}

		if ( ! $this->determine_load() ) {
			return;
		}

		$this->enqueue_styles();
	}

	/**
	 * Enqueue styles bricks iframe
	 *
	 * @since 1.2.5
	 */
	public function enqueue_styles_bricks_iframe(): void {
		if ( ! ( function_exists( 'bricks_is_builder_iframe' ) && bricks_is_builder_iframe() && CoreFrameworkBricks()->determine_load() ) ) {
			return;
		}

		$url     = StylesheetStorage::get_url();
		$version = StylesheetStorage::get_version();
		$handle  = 'core-framework-frontend-bricks-iframe';

		wp_enqueue_style( $handle, $url, array(), $version, 'all' );
		wp_print_styles( $handle );
	}

	/**
	 * Enqueue styles oxygen
	 *
	 * @since 0.0.1
	 */
	public function enqueue_styles_oxygen(): void {
			$option            = get_option( 'core_framework_main', array() );
			$enable            = isset( $option['oxygen'] ) && $option['oxygen'];

		// Check for old Oxygen iframe param
		$in_oxygen_iframe  = sanitize_text_field( filter_input( INPUT_GET, 'oxygen_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );

		// Check for Oxygen 6 (Breakdance-based) iframe param
		$in_breakdance_iframe = sanitize_text_field( filter_input( INPUT_GET, 'breakdance_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );

		$in_oxygen_builder = false;

		// Old Oxygen builder detection
		if ( sanitize_text_field( filter_input( INPUT_GET, 'ct_builder', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ) ) {
			if ( ! defined( 'OXYGEN_IFRAME' ) ) {
				$in_oxygen_builder = true;
			}
		}

		// Oxygen 6 builder detection - when in breakdance_iframe, we're in the builder
		$in_oxygen6_builder = $in_breakdance_iframe && CoreFrameworkOxygen()->is_oxygen6();

		if ( ! $in_oxygen_builder && ! $in_oxygen_iframe && ! $in_oxygen6_builder ) {
			if ( $this->determine_load() ) {
				CoreFrameworkOxygen()->enqueue();
			}
		}

		// Load helper scripts for builder context
		if ( ( $in_oxygen_builder || $in_oxygen6_builder ) && $enable ) {
			CoreFrameworkOxygen()->enqueue_helper();
		}
	}

	/**
	 * Enqueue helper scripts for Oxygen 6 builder
	 * Called on wp_enqueue_scripts hook to ensure proper timing
	 *
	 * @return void
	 */
	public function enqueue_oxygen6_scripts(): void {
			$option = get_option( 'core_framework_main', array() );
			$enable = isset( $option['oxygen'] ) && $option['oxygen'];

		// Check if we're in the Oxygen 6 builder context
		$in_breakdance_iframe = sanitize_text_field( filter_input( INPUT_GET, 'breakdance_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );
		$in_oxygen6_builder   = $in_breakdance_iframe && CoreFrameworkOxygen()->is_oxygen6();

		// Load helper scripts for builder context
		if ( $in_oxygen6_builder && $enable ) {
			CoreFrameworkOxygen()->enqueue_helper();
		}
	}

	/**
	 * Enqueue styles oxygen iframe
	 *
	 * @since 1.0.3
	 */
	public function enqueue_styles_oxygen_iframe(): void {
		CoreFrameworkOxygen()->enqueue_styles_oxygen_iframe();
	}

	/**
	 * Add theme helper script if needed
	 *
	 * @since 1.2.0
	 */
	public function add_theme_helper(): void {
		if ( CoreFrameworkBricks()->is_bricks() ) {
			if ( function_exists( 'bricks_is_builder_iframe' ) && bricks_is_builder_iframe() ) {
				return;
			}
		}

		if ( CoreFrameworkOxygen()->is_oxygen() ) {
			$in_oxygen_iframe  = sanitize_text_field( filter_input( INPUT_GET, 'oxygen_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );
			$in_breakdance_iframe = sanitize_text_field( filter_input( INPUT_GET, 'breakdance_iframe', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) );
			$in_oxygen_builder = false;

			if ( sanitize_text_field( filter_input( INPUT_GET, 'ct_builder', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ) ) {
				if ( ! defined( 'OXYGEN_IFRAME' ) ) {
					$in_oxygen_builder = true;
				}
			}

			// Don't add theme helper in builder contexts
			if ( $in_oxygen_iframe || $in_oxygen_builder || $in_breakdance_iframe ) {
				return;
			}
		}

		$js_light = '(()=>{const e=localStorage.getItem("cf-theme"),t=document.querySelector("html");["light","dark"].includes(String(e))?t?.classList?.add("dark"===e?"cf-theme-dark":"cf-theme-light"):t?.classList?.add("auto"===e&&window.matchMedia("(prefers-color-scheme: dark)").matches?"cf-theme-dark":"cf-theme-light")})();';
		$js_dark  = '(()=>{const e=localStorage.getItem("cf-theme"),t=document.querySelector("html");["light","dark"].includes(String(e))?t?.classList?.add("dark"===e?"cf-theme-dark":"cf-theme-light"):t?.classList?.add("auto"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"cf-theme-dark":"cf-theme-light":"cf-theme-dark")})();';
		$js_auto  = '(()=>{const e=localStorage.getItem("cf-theme"),t=document.querySelector("html");["light","dark"].includes(String(e))?t?.classList?.add("dark"===e?"cf-theme-dark":"cf-theme-light"):t?.classList?.add(window.matchMedia("(prefers-color-scheme: dark)").matches?"cf-theme-dark":"cf-theme-light")})();';

		$option      = get_option( 'core_framework_main', array() );
		$mode        = isset( $option['theme_mode'] ) ? $option['theme_mode'] : 'light';
		$script_name = 'core-framework-theme-loader';
		$script      = $js_light;

		if ( $mode === 'dark' ) {
			$script = $js_dark;
		} elseif ( $mode === 'auto' ) {
			$script = $js_auto;
		}

		\wp_register_script( $script_name, false, array(), $this->plugin->version(), false );
		\wp_enqueue_script( $script_name );
		\wp_add_inline_script( $script_name, $script, 'after' );
	}

	/**
	 * Enqueue styles clickable parent
	 *
	 * @since 1.2.0
	 */
	public function enqueue_styles_clickable_parent(): void {
		$helper = new Helper();
		$preset = $helper->loadPreset();

		$class_name = isset( $preset['clickableParentClass'] ) ? $preset['clickableParentClass'] : '';

		if ( empty( $class_name ) ) {
			return;
		}

		$js = '
			document.addEventListener("DOMContentLoaded", () => {
    		document.querySelectorAll("' . $class_name . '").forEach(el => {
			 		let wasFocusedByMouse = false;

					el.addEventListener("mousedown", () => {
						 wasFocusedByMouse = true;
					});

					el.addEventListener("focus", () => {
						 if (wasFocusedByMouse) {
								 el.style.setProperty("--after-display", "none");
						 } else {
								 el.style.setProperty("--after-display", "block");
						 }
					}, true);

					el.addEventListener("blur", () => {
						 wasFocusedByMouse = false;
						 el.style.removeProperty("--after-display");
					}, true);
				});
    	})
		';

		\wp_register_script( 'core-framework-clickable-parent', false, array(), $this->plugin->version(), false );
		\wp_enqueue_script( 'core-framework-clickable-parent' );
		\wp_add_inline_script( 'core-framework-clickable-parent', $js, 'after' );
	}
}
