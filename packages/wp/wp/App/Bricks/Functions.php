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
use CoreFramework\StylesheetStorage;

/**
 * Class Bricks
 *
 * @package CoreFramework\App\Bricks
 * @since 0.0.1
 */
class Functions extends Base {


	/**
	 * Core framework prefix
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const CORE_SUFFIX = '_c';

	/**
	 * Core framework variable category
	 *
	 * @since 1.4.2
	 * @var string
	 */
	public const CORE_VARIABLE_CATEGORY = 'corefrm';

	/**
	 * Bricks classes option
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const BRICKS_CLASSES_OPTION = 'bricks_global_classes';

	/**
	 * Bricks locked classes option
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const BRICKS_LOCKED_CLASSES_OPTION = 'bricks_global_classes_locked';

	/**
	 * Bricks classes categories
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const BRICKS_CLASSES_CATEGORY = 'bricks_global_classes_categories';

	/**
	 * Bricks variables options
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const BRICKS_VARIABLES_OPTION = 'bricks_global_variables';

	/**
	 * Bricks variables categories
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const BRICKS_VARIABLES_CATEGORY = 'bricks_global_variables_categories';

	/**
	 * Bricks color palettes option
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const BRICKS_COLOR_PALETTES_OPTION = 'bricks_color_palette';

	/**
	 * Core Framework color palette name
	 *
	 * @since 0.0.1
	 * @var string
	 */
	public const CORE_COLOR_PALETTE_NAME = 'Core Framework';

	/**
	 * How many posts to prime and process per batch when sweeping class references.
	 *
	 * Bricks page content is stored as one large serialized array per post, so priming
	 * every post at once would trade query count for memory. 50 keeps both bounded.
	 *
	 * @since 0.0.1
	 * @var int
	 */
	private const REFERENCE_SWEEP_CHUNK_SIZE = 50;

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.1
	 */
	public function init(): void {
		/**
		 * @see Requester::is_bricks()
		 * @see Scaffold::__construct
		 *
		 * Add plugin code here
		 */
		self::add_to_bricks_categories();
	}

	/**
	 * Refresh Bricks classes
	 *
	 * @param array $new_core_selectors_array string[]
	 * @return array{status: string}
	 * @since 0.0.1
	 */
	public function refresh_selectors( $new_core_selectors_array ): array {
		$bricks_classes           = get_option( self::BRICKS_CLASSES_OPTION, array() );
		$bricks_locked_classes    = get_option( self::BRICKS_LOCKED_CLASSES_OPTION, array() );
		$new_core_selectors_array = is_array( $new_core_selectors_array )
			? array_values(
				array_unique(
					array_filter(
						array_map(
							fn( $class ): string => is_string( $class ) ? trim( $class ) : '',
							$new_core_selectors_array
						),
						fn( $class ): bool => '' !== $class
					)
				)
			)
			: array();

		$bricks_classes        = is_array( $bricks_classes ) ? $bricks_classes : array();
		$bricks_locked_classes = is_array( $bricks_locked_classes ) ? $bricks_locked_classes : array();

		$splitted_array = array(
			'core'   => array(),
			'others' => array(),
		);

		foreach ( $bricks_classes as $class ) {
			$is_core_class = isset( $class['id'], $class['name'] )
				&& str_ends_with( $class['id'], self::CORE_SUFFIX )
				&& self::CORE_VARIABLE_CATEGORY === ( $class['category'] ?? '' );

			if ( $is_core_class ) {
				$splitted_array['core'][] = $class;
				continue;
			}

			$splitted_array['others'][] = $class;
		}

		$core_prev_classes   = $splitted_array['core'];
		$others_prev_classes = $splitted_array['others'];

		$locked_classes_to_remove = array_column(
			array_filter(
				$core_prev_classes,
				fn( $class ): bool => ! in_array( $class['name'], $new_core_selectors_array, true )
			),
			'id'
		);
		$core_prev_classes        = array_filter(
			$core_prev_classes,
			fn( $class ): bool => in_array( $class['name'], $new_core_selectors_array, true )
		);
		$bricks_locked_classes    = array_filter(
			$bricks_locked_classes,
			fn( $class ): bool => ! in_array( $class, $locked_classes_to_remove, true )
		);

		foreach ( $new_core_selectors_array as $new_core_selector_array ) {
			if ( in_array( $new_core_selector_array, array_column( $core_prev_classes, 'name' ), true ) ) {
				continue;
			}

			$sanitized_selector = sanitize_title( $new_core_selector_array );

			if ( '' === $sanitized_selector ) {
				continue;
			}

			$id = $new_core_selector_array === 'z--1' ? 'z--1_c' : $sanitized_selector . self::CORE_SUFFIX;

			// Distinct selector names can sanitize to the same slug, and Bricks keys
			// elements by class id. Emitting both would put two classes with one id in
			// the option, making which of them applies arbitrary.
			if ( in_array( $id, array_column( $core_prev_classes, 'id' ), true ) ) {
				continue;
			}

			$core_prev_classes[] = array(
				'name'     => $new_core_selector_array,
				'id'       => $id,
				'settings' => array(),
				'category' => self::CORE_VARIABLE_CATEGORY,
			);

			if ( ! in_array( $id, $bricks_locked_classes, true ) ) {
				$bricks_locked_classes[] = $id;
			}
		}

		$all = array( ...$others_prev_classes, ...$core_prev_classes );

		update_option( self::BRICKS_CLASSES_OPTION, array_values( $all ), false );
		update_option( self::BRICKS_LOCKED_CLASSES_OPTION, array_values( $bricks_locked_classes ), false );

		// Sweep element references only once the class list itself is durable. Running
		// the sweep first means a request that dies partway through leaves elements
		// stripped of their class references while the classes still exist, which
		// nothing recovers from. This order fails the other way: stale references
		// survive and the next synchronization removes them.
		$this->remove_class_references( $locked_classes_to_remove );

		return array( 'status' => 'success' );
	}

	/**
	 * Remove deleted Core Framework class IDs from Bricks element settings.
	 *
	 * @param string[] $class_ids Removed Core Framework class IDs.
	 */
	private function remove_class_references( array $class_ids ): void {
		if ( empty( $class_ids ) ) {
			return;
		}

		$meta_keys = array(
			defined( 'BRICKS_DB_PAGE_HEADER' ) ? constant( 'BRICKS_DB_PAGE_HEADER' ) : '_bricks_page_header_2',
			defined( 'BRICKS_DB_PAGE_CONTENT' ) ? constant( 'BRICKS_DB_PAGE_CONTENT' ) : '_bricks_page_content_2',
			defined( 'BRICKS_DB_PAGE_FOOTER' ) ? constant( 'BRICKS_DB_PAGE_FOOTER' ) : '_bricks_page_footer_2',
			defined( 'BRICKS_DB_PAGE_SETTINGS' ) ? constant( 'BRICKS_DB_PAGE_SETTINGS' ) : '_bricks_page_settings',
			defined( 'BRICKS_DB_TEMPLATE_SETTINGS' ) ? constant( 'BRICKS_DB_TEMPLATE_SETTINGS' ) : '_bricks_template_settings',
		);

		$meta_query = array( 'relation' => 'OR' );
		foreach ( $meta_keys as $meta_key ) {
			$meta_query[] = array(
				'key'     => $meta_key,
				'compare' => 'EXISTS',
			);
		}

		$post_ids = get_posts(
			array(
				'post_type'              => array_values( get_post_types( array(), 'names' ) ),
				'post_status'            => 'any',
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'suppress_filters'       => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_query'             => $meta_query,
			)
		);

		// 'fields' => 'ids' means WP_Query never primes the meta cache, so without this
		// every get_post_meta below is its own query: five per post, 25k on a 5k-post
		// site. Priming per chunk costs one query per chunk instead, while bounding how
		// much Bricks page content is held in memory at once.
		foreach ( array_chunk( $post_ids, self::REFERENCE_SWEEP_CHUNK_SIZE ) as $post_id_chunk ) {
			update_meta_cache( 'post', $post_id_chunk );

			foreach ( $post_id_chunk as $post_id ) {
				foreach ( $meta_keys as $meta_key ) {
					$settings = get_post_meta( $post_id, $meta_key, true );

					if ( ! is_array( $settings ) ) {
						continue;
					}

					$updated_settings = $this->remove_class_references_from_settings( $settings, $class_ids );
					if ( $updated_settings !== $settings ) {
						update_post_meta( $post_id, $meta_key, $updated_settings );
					}
				}

				wp_cache_delete( $post_id, 'post_meta' );
			}
		}
	}

	/**
	 * Recursively remove class IDs only from Bricks' global-class setting.
	 *
	 * @param array    $settings Bricks settings or element data.
	 * @param string[] $class_ids Removed Core Framework class IDs.
	 * @return array
	 */
	private function remove_class_references_from_settings( array $settings, array $class_ids ): array {
		foreach ( $settings as $key => $value ) {
			if ( '_cssGlobalClasses' === $key ) {
				if ( is_array( $value ) ) {
					$settings[ $key ] = array_values(
						array_filter(
							$value,
							fn( $class_id ): bool => ! in_array( $class_id, $class_ids, true )
						)
					);
				} elseif ( is_string( $value ) ) {
					$class_references = preg_split( '/\s+/', trim( $value ) ) ?: array();
					$settings[ $key ] = implode(
						' ',
						array_filter(
							$class_references,
							fn( $class_id ): bool => ! in_array( $class_id, $class_ids, true )
						)
					);
				}

				continue;
			}

			if ( is_array( $value ) ) {
				$settings[ $key ] = $this->remove_class_references_from_settings( $value, $class_ids );
			}
		}

		return $settings;
	}

	public function refresh_variables(): array {
		$bricks_variables = get_option( self::BRICKS_VARIABLES_OPTION, array() );

		if ( empty( $bricks_variables ) ) {
			$bricks_variables = array();
		}

		try {
			$stylesheet_content = StylesheetStorage::read();

			if ( $stylesheet_content === false ) {
				return array(
					'status'  => 'error',
					'message' => 'Failed to read stylesheet content.',
				);
			}

			$variable_sync     = new \CoreFramework\App\Css\VariableExtractor( $stylesheet_content );
			$current_variables = $variable_sync->getVariablesFromStyleSheet();

		} catch ( \Exception $e ) {
			return array(
				'status'  => 'error',
				'message' => 'Failed to read stylesheet content.',
			);
		}

		$new_core_variables = array_map(
			fn( $variable ) => array(
				'id'       => $variable['name'],
				'name'     => $variable['name'],
				'value'    => $variable['value'],
				'category' => self::CORE_VARIABLE_CATEGORY,
			),
			$current_variables
		);

		$others_variables  = array_filter( $bricks_variables, fn( $variable ): bool => ( $variable['category'] ?? '' ) !== self::CORE_VARIABLE_CATEGORY );
		$all_new_variables = array( ...$others_variables, ...$new_core_variables );

		update_option( self::BRICKS_VARIABLES_OPTION, array_values( $all_new_variables ), false );

		return array( 'status' => 'success' );
	}

	/**
	 * Remove Core Framework classes from Bricks
	 * Used when uninstalling/deactivating the plugin
	 *
	 * @return array{status: string}
	 * @since 0.0.1
	 */
	public function remove_selectors(): array {
		$bricks_classes        = get_option( self::BRICKS_CLASSES_OPTION, array() );
		$bricks_locked_classes = get_option( self::BRICKS_LOCKED_CLASSES_OPTION, array() );

		$core_framework_ids = array();

		foreach ( $bricks_classes as $class ) {
			if ( str_ends_with( $class['id'], self::CORE_SUFFIX ) ) {
				$core_framework_ids[] = $class['id'];
			}
		}

		if ( is_array( $bricks_classes ) && ! empty( $bricks_classes ) ) {
			$bricks_classes = array_filter( $bricks_classes, fn( $class ): bool => strpos( $class['id'], self::CORE_SUFFIX ) === false );
		}

		if ( is_array( $bricks_locked_classes ) && ! empty( $bricks_locked_classes ) ) {
			$bricks_locked_classes = array_filter( $bricks_locked_classes, fn( $class ): bool => ! in_array( $class, $core_framework_ids ) );
		}

		update_option( self::BRICKS_CLASSES_OPTION, array_values( $bricks_classes ), false );
		update_option( self::BRICKS_LOCKED_CLASSES_OPTION, array_values( $bricks_locked_classes ), false );

		return array( 'status' => 'success' );
	}

	/**
	 * Check if bricks is activated
	 *
	 * @since 0.0.1
	 */
	public function is_bricks(): bool {

		$current_theme = wp_get_theme();
		return 'Bricks' === $current_theme->name || 'Bricks' === $current_theme->parent_theme;
	}

	/**
	 * handle bricks builder deactivation
	 * Remove classes and folder on deactivation
	 *
	 * @since 0.0.1
	 */
	public function handle_uninstall(): void {
		if ( ! $this->is_bricks() ) {
			return;
		}

		$this->remove_selectors();
		$this->remove_colors();
	}

	/**
	 * Add colors to Bricks color system
	 * Color palette structure:
	 *     Array(
	 *         [0] => Array(
	 *             [id] => 66a6c2
	 *             [name] => Default
	 *             [colors] => Array(
	 *            [0] => Array(
	 *                [hex] => #f5f5f5 // One of type : "HEX", "RGB", "HSL", "RAW"
	 *                [id] => 47f036
	 *                [name] => Color #1
	 *
	 * @param array $new_colors { id: string, raw: string, value: string, name: string }
	 * @return array{status: string}
	 * @since 0.0.1
	 */
	public function update_colors( $new_colors ): array {
		$bricks_colors = get_option( self::BRICKS_COLOR_PALETTES_OPTION, array() );

		if ( empty( $bricks_colors ) ) {
			$bricks_colors = array();
		}

		$core_palette   = array();
		$others_palette = array();

		for ( $i = 0; $i < ( is_countable( $bricks_colors ) ? count( $bricks_colors ) : 0 ); $i++ ) {
			if ( str_ends_with( $bricks_colors[ $i ]['id'], self::CORE_SUFFIX ) ) {
				continue;
			}

			$others_palette[] = $bricks_colors[ $i ];
		}

		$core_id        = 'core_framework' . self::CORE_SUFFIX;
		$core_palette[] = array(
			'id'     => $core_id,
			'name'   => self::CORE_COLOR_PALETTE_NAME,
			'colors' => array(),
		);

		foreach ( $new_colors as $new_color ) {
			if ( isset( $new_color['dark'] ) && $new_color['dark'] ) {
				continue;
			}

			$name  = sanitize_text_field( $new_color['name'] ?? '' );
			$id    = $new_color['id'] ?? '';
			$raw   = $new_color['raw'] ?? '';
			$value = $new_color['value'] ?? '';

			if ( ! preg_match( '/^[a-zA-Z0-9._-]+$/', $id ) ) {
				continue;
			}

			if ( ! preg_match( '/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|var\(--[^)]+\))$/', $raw ) ) {
				continue;
			}

			$core_palette[0]['colors'][] = self::create_color_entry( $id, $name, $raw, $value );
		}

		$all = array( ...$others_palette, ...$core_palette );

		update_option( self::BRICKS_COLOR_PALETTES_OPTION, array_values( $all ), false );

		return array( 'status' => 'success' );
	}

	/**
	 * Create a Bricks color palette entry with a single color representation.
	 *
	 * @param string $id Color ID.
	 * @param string $name Color name.
	 * @param string $raw Raw color value.
	 * @param string $value Resolved color value.
	 * @return array{id: string, name: string, raw?: string, hex?: string, rgb?: string, hsl?: string}
	 */
	private static function create_color_entry( string $id, string $name, string $raw, string $value ): array {
		$color_entry = array(
			'id'   => $id,
			'name' => $name,
		);

		if ( preg_match( '/^var\(--[^)]+\)$/', $raw ) ) {
			$color_entry['raw'] = $raw;
			return $color_entry;
		}

		foreach ( array( $value, $raw ) as $bricks_value ) {
			if ( empty( $bricks_value ) ) {
				continue;
			}

			if ( preg_match( '/^#[0-9a-fA-F]{3,8}$/', $bricks_value ) ) {
				$color_entry['hex'] = $bricks_value;
				return $color_entry;
			}

			if ( preg_match( '/^rgba?\([^)]+\)$/', $bricks_value ) ) {
				$color_entry['rgb'] = $bricks_value;
				return $color_entry;
			}

			if ( preg_match( '/^hsla?\([^)]+\)$/', $bricks_value ) ) {
				$color_entry['hsl'] = $bricks_value;
				return $color_entry;
			}
		}

		$color_entry['raw'] = $raw;
		return $color_entry;
	}

	/**
	 * Remove colors and color set from Bricks color system
	 *
	 * @since 0.0.1
	 */
	public function remove_colors(): void {
		$bricks_colors  = get_option( self::BRICKS_COLOR_PALETTES_OPTION, array() );
		$others_palette = array_filter( $bricks_colors, fn( $palette ): bool => ! str_ends_with( $palette['id'], self::CORE_SUFFIX ) );

		update_option( self::BRICKS_COLOR_PALETTES_OPTION, array_values( $others_palette ), false );
	}

	/**
	 * Determine loading of integration
	 *
	 * @since 1.1.2
	 */
	public function determine_load(): bool {
		$option = get_option( 'core_framework_main', array() );
		return isset( $option['bricks'] ) && $option['bricks'];
	}

	public function add_to_bricks_categories() {
		if ( get_transient( 'cf_bricks_categories_added' ) ) {
			return;
		}

		$current_value_classes = get_option( self::BRICKS_CLASSES_CATEGORY );

		if ( ! is_array( $current_value_classes ) ) {
			$current_value_classes = array();
		}

		$new_element_class = array(
			'id'   => 'corefrm',
			'name' => 'Core Framework',
		);

		$exists = false;
		foreach ( $current_value_classes as $element ) {
			if ( isset( $element['id'] ) && $element['id'] === $new_element_class['id'] ) {
				$exists = true;
				break;
			}
		}

		if ( ! $exists ) {
			$current_value_classes[] = $new_element_class;
			update_option( self::BRICKS_CLASSES_CATEGORY, $current_value_classes, false );
		}

		$current_value_variables = get_option( self::BRICKS_VARIABLES_CATEGORY );

		if ( ! is_array( $current_value_variables ) ) {
			$current_value_variables = array();
		}

		$new_element_variable = array(
			'id'   => 'corefrm',
			'name' => 'Core Framework',
		);

		$exists = false;
		foreach ( $current_value_variables as $element ) {
			if ( isset( $element['id'] ) && $element['id'] === $new_element_variable['id'] ) {
				$exists = true;
				break;
			}
		}

		if ( ! $exists ) {
			$current_value_variables[] = $new_element_variable;
			update_option( self::BRICKS_VARIABLES_CATEGORY, $current_value_variables, false );
		}

		set_transient( 'cf_bricks_categories_added', true );
	}
}
