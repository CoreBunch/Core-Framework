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

namespace CoreFramework\Common;

use CoreFramework\Common\Abstracts\Base;

/**
 * Main function class for external uses
 *
 * @see CoreFramework()
 * @package CoreFramework\Common
 */
class Functions extends Base {

	/**
	 * Get plugin data by using CoreFramework()->getData()
	 *
	 * @since 0.0.0
	 */
	public function getData(): array {
		return $this->plugin->data();
	}

	/**
	 * Read .env file
	 *
	 * @since 0.0.0
	 */
	private function readENV() {
		if ( ! function_exists( 'is_readable' ) ) {
			return false;
		}

		$env = CORE_FRAMEWORK_DIR_ROOT . '.env';
		if ( ! file_exists( $env ) ) {
			return false;
		}

		$env = CORE_FRAMEWORK_DIR_ROOT . '.env';

		if ( ! is_readable( $env ) ) {
			return false;
		}

		return file_get_contents( $env );
	}

	/**
	 * Create settings during activation (in Setup): CoreFramework()->createSettings()
	 *
	 * @since 0.0.0
	 */
	public function createSettings(): void {
		$preferences = array(
			'bricks'      => CoreFrameworkBricks()->is_bricks(),
			'oxygen'      => CoreFrameworkOxygen()->is_oxygen(),
			'gutenberg'   => false,
			'figma'       => false,
			'selected_id' => '',
			'delete_data' => false,
		);

		\add_option( 'core_framework_main', $preferences, '', false );
		\add_option( 'core_framework_db_version', CORE_FRAMEWORK_DB_VER, '', false );
	}

	/**
	 * Database upgrade function
	 *
	 * @since 0.0.3
	 */
	public function db_upgrade(): void {
		$preferences = get_option( 'core_framework_main' );

		/* Legacy properties */
		$properties_to_remove = array( 'root_font_size', 'postcss', 'min_screen_width', 'max_screen_width', 'is_rem' );

		foreach ( $properties_to_remove as $property ) {
			if ( isset( $preferences[ $property ] ) ) {
				unset( $preferences[ $property ] );
			}
		}

		update_option( 'core_framework_main', $preferences, false );
		update_option( 'core_framework_db_version', CORE_FRAMEWORK_DB_VER, false );
	}

	/**
	 * Create table 'core_framework_presets' during activation (in Setup): CoreFramework()->createTable()
	 *
	 * @since 0.0.0
	 */
	public function createTable(): void {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$table_name      = \esc_sql( $wpdb->prefix . 'core_framework_presets' );
		// The identifier is the WordPress-controlled table prefix plus a fixed plugin suffix.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$presetsTableSql = "CREATE TABLE IF NOT EXISTS {$table_name} (
				id varchar(50) NOT NULL,
				time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				data longtext NOT NULL,
				PRIMARY KEY  (id)
			) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $presetsTableSql );
	}

	/**
	 * Determine if is development by using CoreFramework()->isDev()
	 *
	 * @return array
	 * @since 0.0.0
	 */
	public function isDev(): bool {
		$env_content = $this->readENV();
		if ( ! $env_content ) {
			return false;
		}

		return strpos( $env_content, 'APP_ENV=development' ) !== false;
	}

	/**
	 * Get development URL by using CoreFramework()->getDevURL()
	 *
	 * @return mixed
	 */
	public function getDevURL() {
		$defaultURL  = 'hakken.local';
		$env_content = $this->readENV();
		if ( ! $env_content ) {
			return $defaultURL;
		}

		preg_match( '/DEV_URL=(.*?)\n/', $env_content, $matches );
		return ! empty( $matches ) && isset( $matches[1] ) ? $matches[1] : $defaultURL;
	}

	/**
	 * Remove plugin options from the database
	 *
	 * @since 0.0.0
	 */
	public function removeSettings(): void {
		$prefix            = 'core_framework_';
		$options_to_delete = array(
			'main',
			'db_version',
			'selected_preset_backup',
			'grouped_classes',
			'colors',
			'oxygen_css_helper',
			'variables',
		);

		foreach ( $options_to_delete as $option ) {
			$name = $prefix . $option;
			\delete_option( $name );
		}
	}

	/**
	 * Delete table core_framework_presets from the database
	 *
	 * @since 0.0.1
	 */
	public function removeTable(): void {
		global $wpdb;

		$table_name = \esc_sql( $wpdb->prefix . 'core_framework_presets' );
		// The identifier is the WordPress-controlled table prefix plus a fixed plugin suffix.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.SchemaChange
		$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );
	}

	/**
	 * Array.Prototype.some, but for PHP
	 */
	public function array_some( array $array, callable $callback ): bool {
		foreach ( $array as $key => $value ) {
			if ( $callback( $value, $key, $array ) ) {
				return true;
			}
		}

		return false;
	}

	public function enqueue_core_framework_connector() {
		$core_framework_options   = get_option( 'core_framework_main', array() );
		$core_framework_connector = array(
			'oxygen_enable_variable_dropdown'      => isset( $core_framework_options['oxygen_enable_variable_dropdown'] ) ? $core_framework_options['oxygen_enable_variable_dropdown'] : true,
			'oxygen_enable_dark_mode_preview'      => isset( $core_framework_options['oxygen_enable_dark_mode_preview'] ) ? $core_framework_options['oxygen_enable_dark_mode_preview'] : true,
			'oxygen_variable_ui'                   => isset( $core_framework_options['oxygen_variable_ui'] ) ? $core_framework_options['oxygen_variable_ui'] : true,
			'oxygen_enable_variable_ui_auto_hide'  => isset( $core_framework_options['oxygen_enable_variable_ui_auto_hide'] ) ? $core_framework_options['oxygen_enable_variable_ui_auto_hide'] : true,
			'oxygen_enable_variable_ui_hint'       => isset( $core_framework_options['oxygen_enable_variable_ui_hint'] ) ? $core_framework_options['oxygen_enable_variable_ui_hint'] : true,
			'oxygen_apply_class_on_hover'          => isset( $core_framework_options['oxygen_apply_class_on_hover'] ) ? $core_framework_options['oxygen_apply_class_on_hover'] : true,
			'oxygen_enable_variable_context_menu'  => isset( $core_framework_options['oxygen_enable_variable_context_menu'] ) ? $core_framework_options['oxygen_enable_variable_context_menu'] : true,
			'oxygen_enable_unit_and_value_preview' => isset( $core_framework_options['oxygen_enable_unit_and_value_preview'] ) ? $core_framework_options['oxygen_enable_unit_and_value_preview'] : true,
			'bricks_enable_variable_dropdown'      => isset( $core_framework_options['bricks_enable_variable_dropdown'] ) ? $core_framework_options['bricks_enable_variable_dropdown'] : true,
			'bricks_enable_dark_mode_preview'      => isset( $core_framework_options['bricks_enable_dark_mode_preview'] ) ? $core_framework_options['bricks_enable_dark_mode_preview'] : true,
			'bricks_variable_ui'                   => isset( $core_framework_options['bricks_variable_ui'] ) ? $core_framework_options['bricks_variable_ui'] : true,
			'bricks_enable_variable_ui_auto_hide'  => isset( $core_framework_options['bricks_enable_variable_ui_auto_hide'] ) ? $core_framework_options['bricks_enable_variable_ui_auto_hide'] : true,
			'bricks_enable_variable_ui_hint'       => isset( $core_framework_options['bricks_enable_variable_ui_hint'] ) ? $core_framework_options['bricks_enable_variable_ui_hint'] : true,
			'bricks_apply_class_on_hover'          => isset( $core_framework_options['bricks_apply_class_on_hover'] ) ? $core_framework_options['bricks_apply_class_on_hover'] : true,
			'bricks_apply_variable_on_hover'       => isset( $core_framework_options['bricks_apply_variable_on_hover'] ) ? $core_framework_options['bricks_apply_variable_on_hover'] : true,
			'bricks_enable_variable_context_menu'  => isset( $core_framework_options['bricks_enable_variable_context_menu'] ) ? $core_framework_options['bricks_enable_variable_context_menu'] : true,
			'bricks_bem_generator'                 => isset( $core_framework_options['bricks_bem_generator'] ) ? $core_framework_options['bricks_bem_generator'] : true,
			'gutenberg_enable_dark_mode_preview'   => isset( $core_framework_options['gutenberg_enable_dark_mode_preview'] ) ? $core_framework_options['gutenberg_enable_dark_mode_preview'] : true,
			'gutenberg_place_controls_at_the_top'  => isset( $core_framework_options['gutenberg_place_controls_at_the_top'] ) ? $core_framework_options['gutenberg_place_controls_at_the_top'] : true,
      'gutenberg_close_widget_default'  		 => isset( $core_framework_options['gutenberg_close_widget_default'] ) ? $core_framework_options['gutenberg_close_widget_default'] : false,
      'plugin_name'  		 										 => isset( $core_framework_options['plugin_name'] ) ? $core_framework_options['plugin_name'] : $this->plugin->name(),
			'theme_mode'                           => isset( $core_framework_options['theme_mode'] ) ? $core_framework_options['theme_mode'] : 'light',
		);

		$js   = 'window.core_framework_connector = ' . \wp_json_encode( $core_framework_connector ) . ';';
		$name = 'core-framework-builders-connector';

		\wp_register_script( $name, '', array(), CORE_FRAMEWORK_VERSION, true );
		\wp_enqueue_script( $name );
		\wp_add_inline_script( $name, $js, 'before' );
	}

	public function str_replace_first( $needle, $replace, $haystack ): string {
		if ( $needle === '' ) {
			return $haystack;
		}

		$pos = strpos( $haystack, $needle );
		if ( $pos !== false ) {
			$haystack = substr_replace( $haystack, $replace, $pos, strlen( $needle ) );
		}

		return $haystack;
	}

	public function get_wp_kses_options() {
		$attributes = array(
			'xmlns'                        => array(),
			'aria-hidden'                  => array(),
			'accent-height'                => array(),
			'accumulate'                   => array(),
			'additive'                     => array(),
			'alignment-baseline'           => array(),
			'alphabetic'                   => array(),
			'amplitude'                    => array(),
			'arabic-form'                  => array(),
			'ascent'                       => array(),
			'attributeName'                => array(),
			'attributeType'                => array(),
			'azimuth'                      => array(),
			'baseFrequency'                => array(),
			'baseline-shift'               => array(),
			'baseProfile'                  => array(),
			'bbox'                         => array(),
			'begin'                        => array(),
			'bias'                         => array(),
			'by'                           => array(),
			'calcMode'                     => array(),
			'cap-height'                   => array(),
			'class'                        => array(),
			'clip'                         => array(),
			'clip-path'                    => array(),
			'clip-rule'                    => array(),
			'clipPathUnits'                => array(),
			'color'                        => array(),
			'color-interpolation'          => array(),
			'color-interpolation-filters'  => array(),
			'color-profile'                => array(),
			'cursor'                       => array(),
			'cx'                           => array(),
			'cy'                           => array(),
			'd'                            => array(),
			'data-*'                       => array(),
			'decoding'                     => array(),
			'descent'                      => array(),
			'diffuseConstant'              => array(),
			'direction'                    => array(),
			'display'                      => array(),
			'divisor'                      => array(),
			'dominant-baseline'            => array(),
			'dur'                          => array(),
			'dx'                           => array(),
			'dy'                           => array(),
			'edgeMode'                     => array(),
			'elevation'                    => array(),
			'enable-background'            => array(),
			'end'                          => array(),
			'exponent'                     => array(),
			'fill'                         => array(),
			'fill-opacity'                 => array(),
			'fill-rule'                    => array(),
			'filter'                       => array(),
			'filterUnits'                  => array(),
			'flood-color'                  => array(),
			'flood-opacity'                => array(),
			'font-family'                  => array(),
			'font-size'                    => array(),
			'font-size-adjust'             => array(),
			'font-stretch'                 => array(),
			'font-style'                   => array(),
			'font-variant'                 => array(),
			'font-weight'                  => array(),
			'fr'                           => array(),
			'from'                         => array(),
			'fx'                           => array(),
			'fy'                           => array(),
			'g1'                           => array(),
			'g2'                           => array(),
			'glyph-name'                   => array(),
			'glyph-orientation-horizontal' => array(),
			'glyph-orientation-vertical'   => array(),
			'gradientTransform'            => array(),
			'gradientUnits'                => array(),
			'hanging'                      => array(),
			'height'                       => array(),
			'horiz-adv-x'                  => array(),
			'horiz-origin-x'               => array(),
			'horiz-origin-y'               => array(),
			'href'                         => array(),
			'id'                           => array(),
			'ideographic'                  => array(),
			'image-rendering'              => array(),
			'in'                           => array(),
			'in2'                          => array(),
			'intercept'                    => array(),
			'k'                            => array(),
			'k1'                           => array(),
			'k2'                           => array(),
			'k3'                           => array(),
			'k4'                           => array(),
			'kernelMatrix'                 => array(),
			'kernelUnitLength'             => array(),
			'kerning'                      => array(),
			'keyPoints'                    => array(),
			'keySplines'                   => array(),
			'keyTimes'                     => array(),
			'lang'                         => array(),
			'lengthAdjust'                 => array(),
			'letter-spacing'               => array(),
			'lighting-color'               => array(),
			'limitingConeAngle'            => array(),
			'marker-end'                   => array(),
			'marker-mid'                   => array(),
			'marker-start'                 => array(),
			'markerHeight'                 => array(),
			'markerUnits'                  => array(),
			'markerWidth'                  => array(),
			'mask'                         => array(),
			'maskContentUnits'             => array(),
			'maskUnits'                    => array(),
			'mathematical'                 => array(),
			'max'                          => array(),
			'media'                        => array(),
			'method'                       => array(),
			'min'                          => array(),
			'mode'                         => array(),
			'name'                         => array(),
			'numOctaves'                   => array(),
				'opacity'                      => array(),
			'operator'                     => array(),
			'order'                        => array(),
			'orient'                       => array(),
			'orientation'                  => array(),
			'origin'                       => array(),
			'overflow'                     => array(),
			'overline-position'            => array(),
			'overline-thickness'           => array(),
			'paint-order'                  => array(),
			'panose-1'                     => array(),
			'path'                         => array(),
			'pathLength'                   => array(),
			'patternContentUnits'          => array(),
			'patternTransform'             => array(),
			'patternUnits'                 => array(),
			'pointer-events'               => array(),
			'points'                       => array(),
			'pointsAtX'                    => array(),
			'pointsAtY'                    => array(),
			'pointsAtZ'                    => array(),
			'preserveAlpha'                => array(),
			'preserveAspectRatio'          => array(),
			'primitiveUnits'               => array(),
			'r'                            => array(),
			'radius'                       => array(),
			'refX'                         => array(),
			'refY'                         => array(),
			'repeatCount'                  => array(),
			'repeatDur'                    => array(),
			'requiredFeatures'             => array(),
			'restart'                      => array(),
			'result'                       => array(),
			'rotate'                       => array(),
			'rx'                           => array(),
			'ry'                           => array(),
			'scale'                        => array(),
			'seed'                         => array(),
			'shape-rendering'              => array(),
			'side'                         => array(),
			'slope'                        => array(),
			'spacing'                      => array(),
			'specularConstant'             => array(),
			'specularExponent'             => array(),
			'spreadMethod'                 => array(),
			'startOffset'                  => array(),
			'stdDeviation'                 => array(),
			'stemh'                        => array(),
			'stemv'                        => array(),
			'stitchTiles'                  => array(),
			'stop-color'                   => array(),
			'stop-opacity'                 => array(),
			'strikethrough-position'       => array(),
			'strikethrough-thickness'      => array(),
			'string'                       => array(),
			'stroke'                       => array(),
			'stroke-dasharray'             => array(),
			'stroke-dashoffset'            => array(),
			'stroke-linecap'               => array(),
			'stroke-linejoin'              => array(),
			'stroke-miterlimit'            => array(),
			'stroke-opacity'               => array(),
			'stroke-width'                 => array(),
			'style'                        => array(),
			'surfaceScale'                 => array(),
			'systemLanguage'               => array(),
			'tabindex'                     => array(),
			'tableValues'                  => array(),
			'target'                       => array(),
			'targetX'                      => array(),
			'targetY'                      => array(),
			'text-anchor'                  => array(),
			'text-decoration'              => array(),
			'text-rendering'               => array(),
			'textLength'                   => array(),
			'to'                           => array(),
			'transform'                    => array(),
			'transform-origin'             => array(),
			'type'                         => array(),
			'u1'                           => array(),
			'u2'                           => array(),
			'underline-position'           => array(),
			'underline-thickness'          => array(),
			'unicode'                      => array(),
			'unicode-bidi'                 => array(),
			'unicode-range'                => array(),
			'units-per-em'                 => array(),
			'v-alphabetic'                 => array(),
			'v-hanging'                    => array(),
			'v-ideographic'                => array(),
			'v-mathematical'               => array(),
			'values'                       => array(),
			'vector-effect'                => array(),
			'version'                      => array(),
			'vert-adv-y'                   => array(),
			'vert-origin-x'                => array(),
			'vert-origin-y'                => array(),
			'viewBox'                      => array(),
			'visibility'                   => array(),
			'width'                        => array(),
			'widths'                       => array(),
			'word-spacing'                 => array(),
			'writing-mode'                 => array(),
			'x'                            => array(),
			'x-height'                     => array(),
			'x1'                           => array(),
			'x2'                           => array(),
			'xChannelSelector'             => array(),
			'xlink:arcrole'                => array(),
			'xlink:href'                   => array(),
			'xlink:show'                   => array(),
			'xlink:title'                  => array(),
			'xlink:type'                   => array(),
			'xml:base'                     => array(),
			'xml:lang'                     => array(),
			'xml:space'                    => array(),
			'y'                            => array(),
			'y1'                           => array(),
			'y2'                           => array(),
			'yChannelSelector'             => array(),
			'z'                            => array(),
			'zoomAndPan'                   => array(),
		);

		foreach ( $attributes as $key => $value ) {
			$attributes[ strtolower( $key ) ] = $value;
		}

		$tag_names = array(
			'svg',
			'span',
			'i',
			'abbr',
			'a',
			'altGlyph',
			'altGlyphDef',
			'altGlyphItem',
			'animate',
			'animateColor',
			'animateMotion',
			'animateTransform',
			'animation',
			'audio',
			'canvas',
			'circle',
			'clipPath',
			'color-profile',
			'cursor',
			'defs',
			'desc',
			'discard',
			'ellipse',
			'feBlend',
			'feColorMatrix',
			'feComponentTransfer',
			'feComposite',
			'feConvolveMatrix',
			'feDiffuseLighting',
			'feDisplacementMap',
			'feDistantLight',
			'feDropShadow',
			'feFlood',
			'feFuncA',
			'feFuncB',
			'feFuncG',
			'feFuncR',
			'feGaussianBlur',
			'feImage',
			'feMerge',
			'feMergeNode',
			'feMorphology',
			'feOffset',
			'fePointLight',
			'feSpecularLighting',
			'feSpotLight',
			'feTile',
			'feTurbulence',
			'filter',
			'font',
			'font-face',
			'font-face-format',
			'font-face-name',
			'font-face-src',
			'font-face-uri',
			'foreignObject',
			'g',
			'glyph',
			'glyphRef',
			'handler',
			'hkern',
			'image',
			'line',
			'linearGradient',
			'listener',
			'marker',
			'mask',
			'metadata',
			'missing-glyph',
			'mpath',
			'path',
			'pattern',
			'polygon',
			'polyline',
			'prefetch',
			'radialGradient',
			'rect',
			'set',
			'solidColor',
			'stop',
			'style',
			'svg',
			'switch',
			'symbol',
			'tbreak',
			'text',
			'textArea',
			'textPath',
			'title',
			'tref',
			'tspan',
			'unknown',
			'use',
			'video',
			'view',
			'vkern',
		);

		foreach ( $tag_names as $tag_name ) {
			$options[ $tag_name ]        = $attributes;
			$options['svg'][ $tag_name ] = $attributes;
		}

		return $options;
	}

	public function purge_cache() {
		if ( \is_plugin_active( 'litespeed-cache/litespeed-cache.php' ) ) {
			// This is LiteSpeed Cache's documented third-party purge hook.
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			\do_action( 'litespeed_purge_all' );
		}
	}

	public function get_random_id( $length = 26 ) {
		return substr( str_shuffle( '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ), 0, $length );
	}
}
