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

namespace CoreFramework\App\Gutenberg;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Helper;
use CoreFramework\StylesheetStorage;

/**
 * Class Gutenberg
 *
 * @package CoreFramework\App\Gutenberg
 * @since 0.0.1
 */
class Functions extends Base {

	/**
	 * COre Framework slug prefix
	 */
	const CORE_FRAMEWORK_PREFIX = 'cf_';

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.1
	 */
	public function init(): void {
		if ( ! CoreFrameworkGutenberg()->determine_load() ) {
			return;
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_scripts' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_styles' ) );

		if ( is_admin() ) {
			add_action( 'enqueue_block_assets', array( $this, 'enqueue_iframe_styles' ) );
			add_action( 'enqueue_block_assets', array( $this, 'add_corresponding_css' ), 9999 );
		}

		add_filter( 'wp_theme_json_data_theme', array( $this, 'add_colors' ), 9999, 1 );
		add_action( 'wp_enqueue_scripts', array( $this, 'add_corresponding_css' ), 9999 );
	}

	public function add_corresponding_css() {
		$core_colors = get_option( 'core_framework_colors', array() );

		$css_string = ':root {';

		for ( $i = 0; $i < count( $core_colors ); $i++ ) {
			$slug  = self::CORE_FRAMEWORK_PREFIX . $core_colors[ $i ]['name'];
			$color = $core_colors[ $i ]['raw'];

			if ( isset( $core_colors[ $i ]['dark'] ) && $core_colors[ $i ]['dark'] ) {
				continue;
			}

			$css_string .= '--' . 'wp--preset--color' . '--' . $slug . ': ' . $color . ';';
		}

		$css_string .= '}';

		$has_any_dark_mode_color = CoreFramework()->array_some(
			$core_colors,
			function ( $color ) {
				return ! empty( $color['dark'] );
			}
		);

		if ( $has_any_dark_mode_color ) {
			$css_string .= ':root.cf-theme-dark {';

			for ( $i = 0; $i < count( $core_colors ); $i++ ) {
				$slug  = self::CORE_FRAMEWORK_PREFIX . $core_colors[ $i ]['name'];
				$color = $core_colors[ $i ]['raw'];

				if ( isset( $core_colors[ $i ]['dark'] ) && $core_colors[ $i ]['dark'] ) {
					continue;
				}

				$css_string .= '--' . 'wp--preset--color' . '--' . $slug . ': ' . $color . ';';
			}

			$css_string .= '}';
		}

		//generate css for text color classes
		$styles = ':root {';

		for ( $i = 0; $i < count( $core_colors ); $i++ ) {
			$slug = 'has-cf-' . sanitize_title($core_colors[ $i ]['name']) . '-color';
			$color_value = $core_colors[ $i ]['value'];
			$styles .= ".$slug { color: {$color_value} !important; }";
		}

		$styles .= '}';

		wp_register_style( 'core-framework-inline', false, array(), CORE_FRAMEWORK_VERSION );
		wp_enqueue_style( 'core-framework-inline' );
		wp_add_inline_style( 'core-framework-inline', $css_string );

		wp_register_style( 'core-framework-colors-classes-inline', false, array(), CORE_FRAMEWORK_VERSION );
    wp_enqueue_style( 'core-framework-colors-classes-inline' );
		wp_add_inline_style( 'core-framework-colors-classes-inline', $styles );
	}

	public function is_gutenberg() {
		return function_exists( 'register_block_type' ) && function_exists( 'register_block_style' );
	}

	/**
	 * Enqueue css in iframe
	 */
	public function enqueue_iframe_styles() {
		\wp_enqueue_style(
			'core-framework-gutenberg',
			plugins_url( 'gutenberg/index.css', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			StylesheetStorage::get_version(),
			'all'
		);
	}

	/**
	 * Enqueue Gutenberg Integration styles
	 *
	 * @since 1.0.0
	 */
	public function enqueue_styles() {
		if ( is_admin() ) {
			$prefixed_css = get_option( 'core_framework_editor_prefixed_css', '' );
			$name         = 'core-framework-prefixed-css';

			wp_register_style( $name, false, array(), CORE_FRAMEWORK_VERSION );
			wp_enqueue_style( $name );
			wp_add_inline_style( $name, $prefixed_css );

			$version = StylesheetStorage::get_version();

			\wp_enqueue_style(
				'core-framework-gutenberg',
				plugins_url( 'gutenberg/index.css', CORE_FRAMEWORK_ABSOLUTE ),
				array(),
				$version,
				'all'
			);
		}

		\add_theme_support( 'editor-styles' );
	}

	/**
	 * Add colors to theme.json
	 *
	 * @since 1.0.0
	 * @param object $theme_json
	 */
	public function add_colors( $theme_json ) {
		$previous_palette = $theme_json->get_data()['settings']['color']['palette']['theme'] ?? array();
		$core_colors      = get_option( 'core_framework_colors', array() );

		if ( empty( $core_colors ) ) {
			return $theme_json;
		}

		if ( is_child_theme() ) {
			$parent_theme_json = $this->get_parent_theme_colors();

			foreach ( (array) $parent_theme_json as $key => $data ) {
				if ( array_search( $data['slug'], array_column( $previous_palette, 'slug' ) ) !== false ) {
					continue;
				}

				$previous_palette[] = array(
					'name'  => $data['name'],
					'slug'  => $data['slug'],
					'color' => $data['color'],
				);
			}
		}

		$editor_color_palette = current( (array) get_theme_support( 'editor-color-palette' ) );
		if ( ! empty( $editor_color_palette ) ) {
			foreach ( (array) $editor_color_palette as $key => $data ) {
				if ( array_search( $data['slug'], array_column( $previous_palette, 'slug' ) ) !== false ) {
					continue;
				}

				$previous_palette[] = array(
					'name'  => $data['name'],
					'slug'  => $data['slug'],
					'color' => $data['color'],
				);
			}
		}

		if ( $this->is_generatepress_active() ) {
			$generatepress_colors = $this->get_generatepress_colors();

			foreach ( (array) $generatepress_colors as $key => $data ) {
				if ( array_search( $data['slug'], array_column( $previous_palette, 'slug' ) ) !== false ) {
					continue;
				}

				$previous_palette[] = array(
					'name'  => $data['name'],
					'slug'  => $data['slug'],
					'color' => 'var(--' . $data['slug'] . ')',
				);
			}
		}

		for ( $i = 0; $i < count( $core_colors ); $i++ ) {
			$slug = self::CORE_FRAMEWORK_PREFIX . $core_colors[ $i ]['name'];

			if ( array_search( $slug, array_column( $previous_palette, 'slug' ) ) !== false ) {
				continue;
			}

			if ( isset( $core_colors[ $i ]['dark'] ) && $core_colors[ $i ]['dark'] ) {
				continue;
			}

			$name  = $core_colors[ $i ]['name'];
			$color = $core_colors[ $i ]['value'] or $core_colors[ $i ]['raw'];

			$previous_palette[] = array(
				'name'  => $name,
				'slug'  => $slug,
				'color' => $color,
			);
		}

		$new_data = array(
			'version'  => 2,
			'settings' => array(
				'color' => array(
					'palette' => $previous_palette,
				),
			),
		);

		return $theme_json->update_with( $new_data );
	}

	/**
	 * Enqueue Gutenberg Integration scripts
	 *
	 * @since 1.0.0
	 */
	public function enqueue_scripts() {
		CoreFramework()->enqueue_core_framework_connector();

		$version = $this->plugin->version();

		if ( \file_exists( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'gutenberg/index.js' ) ) {
			$version = \filemtime( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'gutenberg/index.js' );
		}

		wp_enqueue_script(
			'core-framework-gutenberg-plugin',
			plugins_url( 'gutenberg/index.js', CORE_FRAMEWORK_ABSOLUTE ),
			array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ),
			$version,
			true
		);
	}

	/**
	 * Check if GeneratePress is active
	 *
	 * @since 1.0.4
	 * @return bool
	 */
	public function is_generatepress_active() {
		if ( 'generatepress' === \wp_get_theme()->template && \wp_get_theme()->parent() && 'generatepress' === \wp_get_theme()->parent()->template ) {
			return true;
		}

		return false;
	}

	/**
	 * Get colors from GeneratePress
	 *
	 * @since 1.0.4
	 * @return array $colors
	 */
	public function get_generatepress_colors() {
		$colors = array();

		if ( ! $this->is_generatepress_active() ) {
			return $colors;
		}

		$colors = wp_parse_args(
			\get_option( 'generate_settings', array() ),
			array(
				'global_colors' => array(
					array(
						'name'  => __( 'Contrast', 'core-framework' ),
						'slug'  => 'contrast',
						'color' => '#222222',
					),
					array(
						/* translators: Contrast number */
						'name'  => sprintf( __( 'Contrast %s', 'core-framework' ), '2' ),
						'slug'  => 'contrast-2',
						'color' => '#575760',
					),
					array(
						/* translators: Contrast number */
						'name'  => sprintf( __( 'Contrast %s', 'core-framework' ), '3' ),
						'slug'  => 'contrast-3',
						'color' => '#b2b2be',
					),
					array(
						'name'  => __( 'Base', 'core-framework' ),
						'slug'  => 'base',
						'color' => '#f0f0f0',
					),
					array(
						/* translators: Base number */
						'name'  => sprintf( __( 'Base %s', 'core-framework' ), '2' ),
						'slug'  => 'base-2',
						'color' => '#f7f8f9',
					),
					array(
						/* translators: Base number */
						'name'  => sprintf( __( 'Base %s', 'core-framework' ), '3' ),
						'slug'  => 'base-3',
						'color' => '#ffffff',
					),
					array(
						'name'  => __( 'Accent', 'core-framework' ),
						'slug'  => 'accent',
						'color' => '#1e73be',
					),
				),
			)
		)['global_colors'];

		return $colors;
	}

	/**
	 * Get colors from parent theme.json if it exists
	 *
	 * @since 1.0.5
	 */
	public function get_parent_theme_colors() {
		$colors = array();

		if ( ! is_child_theme() ) {
			return $colors;
		}

		$parent_theme_path = get_template_directory() . '/theme.json';

		if ( ! file_exists( $parent_theme_path ) ) {
			return $colors;
		}

		$parent_theme_json = json_decode( file_get_contents( $parent_theme_path ), true );

		if ( empty( $parent_theme_json ) ) {
			return $colors;
		}

		$colors = $parent_theme_json['settings']['color']['palette'] ?? array();

		return $colors;
	}

	/**
	 * Determine if is Gutenberg Integrations should be loaded
	 *
	 * @since 1.2.3
	 */
	public function determine_load(): bool {
		$is_gutenberg_addon_enabled = get_option( 'core_framework_main', array() )['gutenberg'] ?? false;
		$has_gutenberg              = $this->is_gutenberg();
		return $is_gutenberg_addon_enabled && $has_gutenberg;
	}
}
