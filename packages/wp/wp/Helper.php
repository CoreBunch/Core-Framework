<?php

namespace CoreFramework;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Core Framework Helper class
 * Can be used to retrieve an array of class names and variables.
 * Class names and variables can be grouped into categories.
 *
 * @since 1.2.7
 */
class Helper {
	private $preset               = null;
	private $stylesheet_data_keys = array(
		'colorStyles',
		'typographyStyles',
		'spacingStyles',
		'layoutsStyles',
		'designStyles',
		'componentsStyles',
		'otherStyles',
	);

	public function __construct() {
	}

	public function getPresetId(): ?string {
		$options = get_option( 'core_framework_main', array() );
		return $options['selected_id'] ?? null;
	}

	/**
	 * Check if fonts integration is disabled in plugin preferences
	 *
	 * @return bool
	 * @since 1.10.0
	 */
	public function isFontsDisabled(): bool {
		$option = get_option( 'core_framework_main', array() );
		return isset( $option['disable_fonts'] ) && $option['disable_fonts'];
	}

	/**
	 * Get fonts that are enabled in the selected preset.
	 *
	 * @return array
	 */
	public function getEnabledFonts(): array {
		$preset = $this->loadPreset();
		$fonts  = isset( $preset['modulesData']['FONTS']['fonts'] )
			? $preset['modulesData']['FONTS']['fonts']
			: array();

		if ( ! is_array( $fonts ) ) {
			return array();
		}

		return array_values(
			array_filter(
				$fonts,
				static fn( $font ): bool => is_array( $font ) && true === ( $font['enable'] ?? false )
			)
		);
	}

	public function setPresetId( string $preset_id ): void {
		$options                = get_option( 'core_framework_main', array() );
		$options['selected_id'] = $preset_id;
		update_option( 'core_framework_main', $options );
	}

	/**
	 * Load selected preset from database
	 *
	 * @return array|null
	 */
	public function loadPreset(): ?array {
		if ( $this->preset ) {
			return $this->preset;
		}

		$options = get_option( 'core_framework_main', array() );

		if ( ! is_array( $options ) || ! isset( $options['selected_id'] ) || empty( $options ) ) {
			return null;
		}

		global $wpdb;

		$id         = $options['selected_id'];
		$table_name = \esc_sql( $wpdb->prefix . 'core_framework_presets' );
		$row        = $wpdb->get_row(
			// The identifier is the WordPress-controlled table prefix plus a fixed plugin suffix.
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->prepare( "SELECT * FROM $table_name WHERE id = %s", $id )
		);

		if ( ! $row ) {
			return null;
		}

		$preset       = json_decode( $row->data, true );
		$this->preset = $preset;
		return $preset;
	}

	public function getPreset() {
		return $this->preset;
	}

	/**
	 * Get the generated stylesheet directory details.
	 *
	 * WordPress provides a site-specific uploads directory on multisite, so the
	 * same relative path can safely be used for every site.
	 *
	 * @return array{path: string, url: string}
	 */
	private function getStylesheetDirectory(): array {
		$uploads = \wp_upload_dir();

		return array(
			'path' => \trailingslashit( $uploads['basedir'] ) . 'core-framework/css',
			'url'  => \trailingslashit( $uploads['baseurl'] ) . 'core-framework/css',
		);
	}

	/**
	 * Get the stylesheet path used by versions through 1.10.4.
	 */
	private function getLegacyStylesheetPath(): string {
		$filename = \is_multisite()
			? 'core_framework_' . \get_current_blog_id() . '.css'
			: 'core_framework.css';

		return \plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/css/' . $filename;
	}

	/**
	 * Initialize the WordPress filesystem API.
	 *
	 * @return \WP_Filesystem_Base|null
	 */
	private function getFilesystem() {
		global $wp_filesystem;

		if ( ! \function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! \WP_Filesystem() || ! \is_object( $wp_filesystem ) ) {
			return null;
		}

		return $wp_filesystem;
	}

	/**
	 * Get stylesheet URL.
	 *
	 * @return string
	 * @since 1.3.3
	 */
	public function getStylesheetUrl(): string {
		$directory = $this->getStylesheetDirectory();

		return \trailingslashit( $directory['url'] ) . 'core_framework.css';
	}

	/**
	 * Get Stylesheet plain path
	 *
	 * @return string
	 * @since 1.3.3
	 */
	public function getStylesheetPath(): string {
		$directory = $this->getStylesheetDirectory();

		return \trailingslashit( $directory['path'] ) . 'core_framework.css';
	}

	/**
	 * Persist the generated stylesheet in WordPress-managed storage.
	 *
	 * @return int|false Number of bytes saved, or false on failure.
	 */
	public function writeStylesheet( string $css ) {
		$filesystem = $this->getFilesystem();

		if ( null === $filesystem ) {
			return false;
		}

		$directory = $this->getStylesheetDirectory();

		if ( ! $filesystem->is_dir( $directory['path'] ) && ! \wp_mkdir_p( $directory['path'] ) ) {
			return false;
		}

		$written = $filesystem->put_contents(
			$this->getStylesheetPath(),
			$css,
			defined( 'FS_CHMOD_FILE' ) ? FS_CHMOD_FILE : 0644
		);

		return $written ? \strlen( $css ) : false;
	}

	/**
	 * Read the generated stylesheet from WordPress-managed storage.
	 *
	 * @return string|false
	 */
	public function readStylesheet() {
		$filesystem = $this->getFilesystem();

		if ( null === $filesystem ) {
			return false;
		}

		return $filesystem->get_contents( $this->getStylesheetPath() );
	}

	/**
	 * Ensure a generated stylesheet exists, migrating legacy data if possible.
	 */
	public function ensureStylesheet(): bool {
		$filesystem      = $this->getFilesystem();
		$stylesheet_path = $this->getStylesheetPath();

		if ( null === $filesystem ) {
			return false;
		}

		$stylesheet_exists = $filesystem->is_file( $stylesheet_path );
		$stylesheet_size   = $stylesheet_exists ? $filesystem->size( $stylesheet_path ) : false;

		if ( false !== $stylesheet_size && $stylesheet_size > 0 ) {
			return true;
		}

		$css         = '';
		$legacy_path = $this->getLegacyStylesheetPath();

		if ( $filesystem->is_file( $legacy_path ) && $filesystem->size( $legacy_path ) > 0 ) {
			$legacy_css = $filesystem->get_contents( $legacy_path );
			$css        = false !== $legacy_css ? $legacy_css : '';
		}

		if ( '' === $css ) {
			$css = (string) \get_option( 'core_framework_selected_preset_backup', '' );
		}

		if ( '' === $css && $stylesheet_exists ) {
			return true;
		}

		return false !== $this->writeStylesheet( $css );
	}

	/**
	 * Get stylesheet version
	 *
	 * @return string
	 * @since 1.3.3
	 */
	public function getStylesheetVersion(): string {
		$stylesheet_path = $this->getStylesheetPath();

		if ( \is_file( $stylesheet_path ) ) {
			$version = \filemtime( $stylesheet_path );

			if ( false !== $version ) {
				return (string) $version;
			}
		}

		return CORE_FRAMEWORK_VERSION;
	}

	/**
	 * Extract all classNames from selector. Prefix first className with class_prefix.
	 *
	 * @param string $selector
	 * @param string $class_prefix
	 * @return array
	 * @since 1.2.7
	 */
	private function extractClassNames( string $selector, string $class_prefix ): array {
		if ( ! $selector || $selector === '.' ) {
			return array();
		}

		$get_first_selector = function ( $selector ) {
			$arr = explode( ',', $selector );
			$arr = array_map(
				function ( $s ) {
					return trim( $s );
				},
				$arr
			);
			$arr = array_filter(
				$arr,
				function ( $s ) {
					return ! empty( $s );
				}
			);
			$arr = array_filter(
				$arr,
				function ( $s ) {
					return $s !== '.';
				}
			);

			return $arr[0];
		};

		$class_accumulator = array();

		$selector = strpos( $selector, ',' ) !== false
			? $get_first_selector( $selector )
			: trim( $selector );

		if ( strpos( $selector, '.' ) === 0 && strpos( $selector, ':' ) === false ) {
			$dots = substr_count( $selector, '.' );

			if ( $dots && $dots > 1 ) {
				$split = explode( '.', $selector );
				$last  = end( $split );

				if ( $last ) {
					$class_accumulator[] = $last;
				}

				return $class_accumulator;
			}

			$class_accumulator[] = str_replace( '.', '', $class_prefix . $selector );
		}

		return $class_accumulator;
	}

	/**
	 * Get all class names from project
	 *
	 * @param array $options
	 *  - group_by_category: bool (default: true) - if true, returns array of grouped class names, otherwise returns flat array
	 *  - excluded_keys: array of ['colorStyles', 'typographyStyles', 'spacingStyles', 'layoutsStyles', 'designStyles', 'componentsStyles', 'otherStyles']
	 * @return array
	 * @since 1.2.7
	 */
	public function getClassNames(array $options = array(
		'group_by_category' => true,
		'excluded_keys'     => array(),
	)): array {
		$options = \wp_parse_args(
			$options,
			array(
				'group_by_category' => true,
				'excluded_keys'     => array(),
			)
		);

		$preset = $this->loadPreset();

		if ( ! $preset ) {
			return array();
		}

		$class_prefix = isset( $preset['classPrefix'] ) ? $preset['classPrefix'] : '';

		$grouped_class_names = array(
			'colorStyles'      => array(),
			'typographyStyles' => array(),
			'spacingStyles'    => array(),
			'layoutsStyles'    => array(),
			'designStyles'     => array(),
			'componentsStyles' => array(),
			'otherStyles'      => array(),
		);

		if ( isset( $preset['styleSheetData'] ) && is_array( $preset['styleSheetData'] ) ) {
			foreach ( $this->stylesheet_data_keys as $key ) {
				if ( isset( $preset['styleSheetData'][ $key ] ) && is_array( $preset['styleSheetData'][ $key ] ) ) {
					foreach ( $preset['styleSheetData'][ $key ] as $group ) {
						$is_variable_group = isset( $group['type'] ) && $group['type'] === 'variable';
						$is_group_disabled = isset( $group['isDisabled'] ) && $group['isDisabled'] === true;

						if ( $is_variable_group || $is_group_disabled ) {
							continue;
						}

						if ( isset( $group['cssObjects'] ) && is_array( $group['cssObjects'] ) ) {
							foreach ( $group['cssObjects'] as $cssObject ) {
								$is_disabled = isset( $cssObject['isDisabled'] ) && $cssObject['isDisabled'] === true;

								if ( $is_disabled ) {
									continue;
								}

								$selector                    = isset( $cssObject['selector'] ) ? $cssObject['selector'] : '';
								$grouped_class_names[ $key ] = array_merge(
									$grouped_class_names[ $key ],
									$this->extractClassNames( $selector, $class_prefix )
								);
							}
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COMPONENTS'] ) && isset( $preset['modulesData']['COMPONENTS']['components'] ) ) {
			$is_disabled = isset( $preset['modulesData']['COMPONENTS']['isDisabled'] ) && $preset['modulesData']['COMPONENTS']['isDisabled'] === true;

			if ( ! $is_disabled ) {
				foreach ( $preset['modulesData']['COMPONENTS']['components'] as $component ) {
					if ( strpos( $component['selector'], '.' ) === 0 ) {
						$grouped_class_names['componentsStyles'] = array_merge(
							$grouped_class_names['componentsStyles'],
							$this->extractClassNames( $component['selector'], $class_prefix )
						);

						if ( isset( $component['variants'] ) ) {
							foreach ( $component['variants'] as $variant ) {
								if ( isset( $variant['variantSelector'] ) && strpos( $variant['variantSelector'], '.' ) === 0 ) {
									$grouped_class_names['componentsStyles'] = array_merge(
										$grouped_class_names['componentsStyles'],
										$this->extractClassNames( $variant['variantSelector'], '' )
									);
								}
							}
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_SPACING'] ) ) {
			$spacing_data            = $preset['modulesData']['FLUID_SPACING'];
			$is_disabled             = isset( $spacing_data['isDisabled'] ) && $spacing_data['isDisabled'] === true;
			$is_manual_fluid_spacing = isset( $spacing_data['mode'] ) && $spacing_data['mode'] === 'fluid_manual';
			$is_gen_padding          = isset( $spacing_data['genPadding'] ) && $spacing_data['genPadding'] === true;
			$is_gen_margin           = isset( $spacing_data['genMargin'] ) && $spacing_data['genMargin'] === true;
			$is_gen_gap              = isset( $spacing_data['genGap'] ) && $spacing_data['genGap'] === true;
			$generate_any_classes    = $is_gen_padding || $is_gen_margin || $is_gen_gap;

			$key = 'spacingStyles';

			if ( $generate_any_classes ) {
				if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $spacing_data['manualSizes'] ) ) {
					foreach ( $spacing_data['manualSizes'] as $manual_size ) {
						$name       = $manual_size['name'];
						$get_suffix = function ( $name ) {
							$parts = explode( '-', $name );
							return end( $parts );
						};
						$suffix     = $get_suffix( $name );

						if ( $is_gen_gap ) {
							$grouped_class_names[ $key ][] = $class_prefix . 'gap-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'gap-horizontal-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'gap-vertical-' . $suffix;
						}

						if ( $is_gen_padding ) {
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-horizontal-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-vertical-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-top-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-right-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-bottom-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-left-' . $suffix;
						}

						if ( $is_gen_margin ) {
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-horizontal-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-vertical-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-top-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-right-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-bottom-' . $suffix;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-left-' . $suffix;
						}
					}
				}

				if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $spacing_data['steps'] ) && isset( $spacing_data['namingConvention'] ) ) {
					$steps = $spacing_data['steps'];
					$steps = explode( ',', $steps );

					foreach ( $steps as $step ) {
						if ( $is_gen_gap ) {
							$grouped_class_names[ $key ][] = $class_prefix . 'gap-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'gap-horizontal-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'gap-vertical-' . $step;
						}

						if ( $is_gen_padding ) {
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-horizontal-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-vertical-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-top-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-right-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-bottom-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'padding-left-' . $step;
						}

						if ( $is_gen_margin ) {
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-horizontal-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-vertical-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-top-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-right-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-bottom-' . $step;
							$grouped_class_names[ $key ][] = $class_prefix . 'margin-left-' . $step;
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_TYPOGRAPHY'] ) ) {
			$typography_data         = $preset['modulesData']['FLUID_TYPOGRAPHY'];
			$is_disabled             = isset( $typography_data['isDisabled'] ) && $typography_data['isDisabled'] === true;
			$is_manual_fluid_spacing = isset( $typography_data['mode'] ) && $typography_data['mode'] === 'fluid_manual';
			$is_gen_text_class       = isset( $typography_data['genFontSizeClass'] ) && $typography_data['genFontSizeClass'] === true;
			$key                     = 'typographyStyles';

			if ( $is_gen_text_class ) {
				if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $typography_data['manualSizes'] ) ) {
					foreach ( $typography_data['manualSizes'] as $manual_size ) {
						$name              = $manual_size['name'];
						$get_suffix        = function ( $name ) {
							$parts = explode( '-', $name );
							return end( $parts );
						};
						$suffix            = $get_suffix( $name );
						$naming_convention = $typography_data['namingConvention'];

						$grouped_class_names[ $key ][] = $class_prefix . $naming_convention . '-' . str_replace( 'text-', '', $name );
					}
				}

				if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $typography_data['steps'] ) && isset( $typography_data['namingConvention'] ) ) {
					$steps             = $typography_data['steps'];
					$steps             = explode( ',', $steps );
					$naming_convention = $typography_data['namingConvention'];

					foreach ( $steps as $step ) {
						$grouped_class_names[ $key ][] = $class_prefix . $naming_convention . '-' . str_replace( 'text-', '', $step );
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COLOR_SYSTEM'] ) && isset( $preset['modulesData']['COLOR_SYSTEM']['groups'] ) ) {
			foreach ( $preset['modulesData']['COLOR_SYSTEM']['groups'] as $group ) {
				if ( isset( $group['isDisabled'] ) && $group['isDisabled'] ) {
					continue;
				}

				if ( isset( $group['colors'] ) && is_array( $group['colors'] ) ) {
					foreach ( $group['colors'] as $color ) {
						$key = 'colorStyles';

						$local_color_names   = array();
						$main_name           = $color['name'];
						$local_color_names[] = $main_name;

						$shades = isset( $color['shades'] ) ? $color['shades'] : array();
						foreach ( $shades as $shade ) {
							$local_color_names[] = $shade['name'];
						}

						$tints = isset( $color['tints'] ) ? $color['tints'] : array();
						foreach ( $tints as $tint ) {
							$local_color_names[] = $tint['name'];
						}

						$process_name = function ( $name, $prefix ) {
							if ( strpos( $name, $prefix ) === 0 ) {
								$name = str_replace( $prefix, '', $name );
							}

							return $name;
						};

						$class_generation_array = isset( $color['gen'] ) ? $color['gen'] : array();
						$is_gen_bg              = in_array( 'bg', $class_generation_array );
						$is_gen_text            = in_array( 'text', $class_generation_array );
						$is_gen_border          = in_array( 'border', $class_generation_array );

						$is_transparent        = isset( $color['transparent'] ) && $color['transparent'] === true;
						$transparent_variables = isset( $color['transparentVariables'] ) ? $color['transparentVariables'] : array();

						foreach ( $local_color_names as $name ) {
							if ( $is_gen_bg ) {
								$prefix                        = 'bg-';
								$grouped_class_names[ $key ][] = $class_prefix . $prefix . $process_name( $name, $prefix );

								if ( $is_transparent ) {
									foreach ( $transparent_variables as $transparent_value ) {
										$grouped_class_names[ $key ][] = $class_prefix . $prefix . $main_name . '-' . $transparent_value;
									}
								}
							}

							if ( $is_gen_text ) {
								$prefix                        = 'text-';
								$grouped_class_names[ $key ][] = $class_prefix . $prefix . $process_name( $name, $prefix );

								if ( $is_transparent ) {
									foreach ( $transparent_variables as $transparent_value ) {
										$grouped_class_names[ $key ][] = $class_prefix . $prefix . $main_name . '-' . $transparent_value;
									}
								}
							}

							if ( $is_gen_border ) {
								$prefix                        = 'border-';
								$grouped_class_names[ $key ][] = $class_prefix . $prefix . $process_name( $name, $prefix );

								if ( $is_transparent ) {
									foreach ( $transparent_variables as $transparent_value ) {
										$grouped_class_names[ $key ][] = $class_prefix . $prefix . $main_name . '-' . $transparent_value;
									}
								}
							}
						}
					}
				}
			}
		}

		$core_framework_main = \get_option( 'core_framework_main', array() );
		$has_theme           = isset( $core_framework_main['has_theme'] ) && $core_framework_main['has_theme'];
		if ( $has_theme ) {
			$grouped_class_names['otherStyles'][] = $class_prefix . 'theme-inverted';
		}

		if ( isset( $options['excluded_keys'] ) && is_array( $options['excluded_keys'] ) && ! empty( $options['excluded_keys'] ) ) {
			foreach ( $options['excluded_keys'] as $excluded_key ) {
				if ( isset( $grouped_class_names[ $excluded_key ] ) ) {
					unset( $grouped_class_names[ $excluded_key ] );
				}
			}
		}

		foreach ( array_keys( $grouped_class_names ) as $key ) {
			$grouped_class_names[ $key ] = array_values( array_unique( $grouped_class_names[ $key ] ) );
		}

		if ( $options['group_by_category'] === false ) {
			$grouped_class_names = array_merge( ...array_values( $grouped_class_names ?? array() ) );
		}

		return $grouped_class_names;
	}

	/**
	 * @return array
	 * @since 1.2.7
	 */
	public function getClassNamesGroupedByCategoriesAndGroups(): array {
		$preset = $this->loadPreset();

		if ( ! $preset ) {
			return array();
		}

		$class_prefix = isset( $preset['classPrefix'] ) ? $preset['classPrefix'] : '';

		$grouped_class_names = array(
			'colorStyles'      => array(),
			'typographyStyles' => array(),
			'spacingStyles'    => array(),
			'layoutsStyles'    => array(),
			'designStyles'     => array(),
			'componentsStyles' => array(),
			'otherStyles'      => array(),
		);

		if ( isset( $preset['styleSheetData'] ) && is_array( $preset['styleSheetData'] ) ) {
			foreach ( $this->stylesheet_data_keys as $key ) {
				if ( isset( $preset['styleSheetData'][ $key ] ) && is_array( $preset['styleSheetData'][ $key ] ) ) {
					foreach ( $preset['styleSheetData'][ $key ] as $group ) {
						$is_variable_group = isset( $group['type'] ) && $group['type'] === 'variable';
						$is_group_disabled = isset( $group['isDisabled'] ) && $group['isDisabled'] === true;
						$group_name        = isset( $group['name'] ) ? $group['name'] : 'No name';

						if ( $is_variable_group || $is_group_disabled ) {
							continue;
						}

						if ( isset( $group['cssObjects'] ) && is_array( $group['cssObjects'] ) ) {
							foreach ( $group['cssObjects'] as $cssObject ) {
								$selector                                   = isset( $cssObject['selector'] ) ? $cssObject['selector'] : '';
								$grouped_class_names[ $key ][ $group_name ] = array_merge(
									$grouped_class_names[ $key ][ $group_name ] ?? array(),
									$this->extractClassNames( $selector, $class_prefix )
								);
							}
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COMPONENTS'] ) && isset( $preset['modulesData']['COMPONENTS']['components'] ) ) {
			$is_disabled = isset( $preset['modulesData']['COMPONENTS']['isDisabled'] ) && $preset['modulesData']['COMPONENTS']['isDisabled'] === true;
			$group_name  = 'Components';

			if ( ! $is_disabled ) {
				foreach ( $preset['modulesData']['COMPONENTS']['components'] as $component ) {
					if ( strpos( $component['selector'], '.' ) === 0 ) {
						$grouped_class_names['componentsStyles'][ $group_name ] = array_merge(
							$grouped_class_names['componentsStyles'][ $group_name ] ?? array(),
							$this->extractClassNames( $component['selector'], $class_prefix )
						);

						if ( isset( $component['variants'] ) ) {
							foreach ( $component['variants'] as $variant ) {
								if ( isset( $variant['variantSelector'] ) && strpos( $variant['variantSelector'], '.' ) === 0 ) {
									$grouped_class_names['componentsStyles'][ $group_name ] = array_merge(
										$grouped_class_names['componentsStyles'][ $group_name ] ?? array(),
										$this->extractClassNames( $variant['variantSelector'], $class_prefix )
									);
								}
							}
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_SPACING'] ) ) {
			$spacing_data            = $preset['modulesData']['FLUID_SPACING'];
			$is_disabled             = isset( $spacing_data['isDisabled'] ) && $spacing_data['isDisabled'] === true;
			$is_manual_fluid_spacing = isset( $spacing_data['mode'] ) && $spacing_data['mode'] === 'fluid_manual';
			$is_gen_padding          = isset( $spacing_data['genPadding'] ) && $spacing_data['genPadding'] === true;
			$is_gen_margin           = isset( $spacing_data['genMargin'] ) && $spacing_data['genMargin'] === true;
			$is_gen_gap              = isset( $spacing_data['genGap'] ) && $spacing_data['genGap'] === true;
			$generate_any_classes    = $is_gen_padding || $is_gen_margin || $is_gen_gap;

			$key = 'spacingStyles';

			if ( $generate_any_classes ) {
				if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $spacing_data['manualSizes'] ) ) {
					foreach ( $spacing_data['manualSizes'] as $manual_size ) {
						$name       = $manual_size['name'];
						$get_suffix = function ( $name ) {
							$parts = explode( '-', $name );
							return end( $parts );
						};
						$suffix     = $get_suffix( $name );

						if ( $is_gen_gap ) {
							$group_name                                   = 'Gaps';
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'gap-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'gap-horizontal-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'gap-vertical-' . $suffix;
						}

						if ( $is_gen_padding ) {
							$group_name                                   = 'Paddings';
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-horizontal-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-vertical-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-top-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-right-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-bottom-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-left-' . $suffix;
						}

						if ( $is_gen_margin ) {
							$group_name                                   = 'Margins';
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-horizontal-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-vertical-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-top-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-right-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-bottom-' . $suffix;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-left-' . $suffix;
						}
					}
				}

				if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $spacing_data['steps'] ) && isset( $spacing_data['namingConvention'] ) ) {
					$steps = $spacing_data['steps'];
					$steps = explode( ',', $steps );

					foreach ( $steps as $step ) {
						if ( $is_gen_gap ) {
							$group_name                                   = 'Gaps';
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'gap-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'gap-horizontal-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'gap-vertical-' . $step;
						}

						if ( $is_gen_padding ) {
							$group_name                                   = 'Paddings';
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-horizontal-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-vertical-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-top-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-right-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-bottom-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'padding-left-' . $step;
						}

						if ( $is_gen_margin ) {
							$group_name                                   = 'Margins';
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-horizontal-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-vertical-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-top-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-right-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-bottom-' . $step;
							$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . 'margin-left-' . $step;
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_TYPOGRAPHY'] ) ) {
			$typography_data         = $preset['modulesData']['FLUID_TYPOGRAPHY'];
			$is_disabled             = isset( $typography_data['isDisabled'] ) && $typography_data['isDisabled'] === true;
			$is_manual_fluid_spacing = isset( $typography_data['mode'] ) && $typography_data['mode'] === 'fluid_manual';
			$is_gen_text_class       = isset( $typography_data['genFontSizeClass'] ) && $typography_data['genFontSizeClass'] === true;
			$key                     = 'typographyStyles';
			$group_name              = 'Fluid Typography';

			if ( $is_gen_text_class ) {
				if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $typography_data['manualSizes'] ) ) {
					foreach ( $typography_data['manualSizes'] as $manual_size ) {
						$name              = $manual_size['name'];
						$get_suffix        = function ( $name ) {
							$parts = explode( '-', $name );
							return end( $parts );
						};
						$suffix            = $get_suffix( $name );
						$naming_convention = $typography_data['namingConvention'];

						$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $naming_convention . '-' . str_replace( 'text-', '', $name );
					}
				}

				if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $typography_data['steps'] ) && isset( $typography_data['namingConvention'] ) ) {
					$steps             = $typography_data['steps'];
					$steps             = explode( ',', $steps );
					$naming_convention = $typography_data['namingConvention'];

					foreach ( $steps as $step ) {
						$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $naming_convention . '-' . str_replace( 'text-', '', $step );
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COLOR_SYSTEM'] ) && isset( $preset['modulesData']['COLOR_SYSTEM']['groups'] ) ) {
			foreach ( $preset['modulesData']['COLOR_SYSTEM']['groups'] as $group ) {
				if ( isset( $group['isDisabled'] ) && $group['isDisabled'] ) {
					continue;
				}

				if ( isset( $group['colors'] ) && is_array( $group['colors'] ) ) {
					foreach ( $group['colors'] as $color ) {
						$key = 'colorStyles';

						$local_color_names   = array();
						$main_name           = $color['name'];
						$local_color_names[] = $main_name;

						$shades = isset( $color['shades'] ) ? $color['shades'] : array();
						foreach ( $shades as $shade ) {
							$local_color_names[] = $shade['name'];
						}

						$tints = isset( $color['tints'] ) ? $color['tints'] : array();
						foreach ( $tints as $tint ) {
							$local_color_names[] = $tint['name'];
						}

						$process_name = function ( $name, $prefix ) {
							if ( strpos( $name, $prefix ) === 0 ) {
								$name = str_replace( $prefix, '', $name );
							}

							return $name;
						};

						$class_generation_array = isset( $color['gen'] ) ? $color['gen'] : array();
						$is_gen_bg              = in_array( 'bg', $class_generation_array );
						$is_gen_text            = in_array( 'text', $class_generation_array );
						$is_gen_border          = in_array( 'border', $class_generation_array );

						$is_transparent        = isset( $color['transparent'] ) && $color['transparent'] === true;
						$transparent_variables = isset( $color['transparentVariables'] ) ? $color['transparentVariables'] : array();

						foreach ( $local_color_names as $name ) {
							if ( $is_gen_bg ) {
								$prefix                                       = 'bg-';
								$group_name                                   = 'Backgrounds';
								$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $prefix . $process_name( $name, $prefix );

								if ( $is_transparent ) {
									foreach ( $transparent_variables as $transparent_value ) {
										$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $prefix . $main_name . '-' . $transparent_value;
									}
								}
							}

							if ( $is_gen_text ) {
								$prefix                                       = 'text-';
								$group_name                                   = 'Text Colors';
								$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $prefix . $process_name( $name, $prefix );

								if ( $is_transparent ) {
									foreach ( $transparent_variables as $transparent_value ) {
										$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $prefix . $main_name . '-' . $transparent_value;
									}
								}
							}

							if ( $is_gen_border ) {
								$prefix                                       = 'border-';
								$group_name                                   = 'Border Colors';
								$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $prefix . $process_name( $name, $prefix );

								if ( $is_transparent ) {
									foreach ( $transparent_variables as $transparent_value ) {
										$grouped_class_names[ $key ][ $group_name ][] = $class_prefix . $prefix . $main_name . '-' . $transparent_value;
									}
								}
							}
						}
					}
				}
			}
		}

		$core_framework_main = \get_option( 'core_framework_main', array() );
		$has_theme           = isset( $core_framework_main['has_theme'] ) && $core_framework_main['has_theme'];
		if ( $has_theme ) {
			$group_name = 'Theme';
			$grouped_class_names['otherStyles'][ $group_name ][] = $class_prefix . 'theme-inverted';
		}

		foreach ( array_keys( $grouped_class_names ) as $key ) {
			foreach ( array_keys( $grouped_class_names[ $key ] ) as $key2 ) {
				$grouped_class_names[ $key ][ $key2 ] = array_values( array_unique( $grouped_class_names[ $key ][ $key2 ] ) );
				if ( empty( $grouped_class_names[ $key ][ $key2 ] ) ) {
					unset( $grouped_class_names[ $key ][ $key2 ] );
				}
			}
		}

		return $grouped_class_names;
	}

	/**
	 * @param array $options
	 *  - group_by_category: bool (default: true) - if true, returns array of grouped variables, otherwise returns flat array
	 *  - excluded_keys: array of ['colorStyles', 'typographyStyles', 'spacingStyles', 'layoutsStyles', 'designStyles', 'componentsStyles', 'otherStyles']
	 * @return array
	 * @since 1.2.7
	 */
	public function getVariables(array $options = array(
		'group_by_category' => true,
		'excluded_keys'     => array(),
	)): array {
		$options = \wp_parse_args(
			$options,
			array(
				'group_by_category' => true,
				'excluded_keys'     => array(),
			)
		);

		$preset = $this->loadPreset();

		if ( ! $preset ) {
			return array();
		}

		$variable_prefix = isset( $preset['variablePrefix'] ) ? $preset['variablePrefix'] : '';

		$grouped_variables = array(
			'colorStyles'      => array(),
			'typographyStyles' => array(),
			'spacingStyles'    => array(),
			'layoutsStyles'    => array(),
			'designStyles'     => array(),
			'componentsStyles' => array(),
			'otherStyles'      => array(),
		);

		if ( isset( $preset['styleSheetData'] ) && is_array( $preset['styleSheetData'] ) ) {
			foreach ( $this->stylesheet_data_keys as $key ) {
				if ( isset( $preset['styleSheetData'][ $key ] ) && is_array( $preset['styleSheetData'][ $key ] ) ) {
					$stylesheet_category = $preset['styleSheetData'][ $key ];

					foreach ( $stylesheet_category as $group ) {
						$is_variable_group = isset( $group['type'] ) && $group['type'] === 'variable';
						$is_group_disabled = isset( $group['isDisabled'] ) && $group['isDisabled'] === true;

						if ( ! $is_variable_group || $is_group_disabled ) {
							continue;
						}

						if ( isset( $group['cssObjects'] ) && is_array( $group['cssObjects'] ) ) {
							foreach ( $group['cssObjects'] as $cssObject ) {
								$is_disabled = isset( $cssObject['isDisabled'] ) && $cssObject['isDisabled'] === true;

								if ( $is_disabled ) {
									continue;
								}

								$declarations = isset( $cssObject['declarations'] ) ? $cssObject['declarations'] : array();

								if ( ! is_array( $declarations ) || empty( $declarations ) ) {
									continue;
								}

								foreach ( $declarations as $declaration ) {
									$property                    = $declaration['property'];
									$grouped_variables[ $key ][] = $variable_prefix . CoreFramework()->str_replace_first( '--', '', $property );
								}
							}
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_SPACING'] ) ) {
			if ( isset( $preset['modulesData']['FLUID_SPACING']['namingConvention'] ) ) {
				$single_object                                      = $preset['modulesData']['FLUID_SPACING'];
				$preset['modulesData']['FLUID_SPACING']['groups'][] = $single_object;

				if ( isset( $preset['modulesData']['FLUID_SPACING']['isDisabled'] ) ) {
					$preset['modulesData']['FLUID_SPACING']['isDisabled'] = $single_object['isDisabled'] || false;
				}
			}

			if ( isset( $preset['modulesData']['FLUID_SPACING']['groups'] ) ) {
				$is_disabled = isset( $preset['modulesData']['FLUID_SPACING']['isDisabled'] ) && $preset['modulesData']['FLUID_SPACING']['isDisabled'] === true;

				foreach ( $preset['modulesData']['FLUID_SPACING']['groups'] as $group ) {
					$key = 'spacingStyles';

					$is_manual_fluid_spacing   = isset( $group['mode'] ) && $group['mode'] === 'fluid_manual';
					$is_gen_semantic_variables = isset( $group['genSemanticVariables'] ) && $group['genSemanticVariables'] === true;

					if ( $is_gen_semantic_variables ) {
						$sematic_variables_css_object_array = isset( $group['semanticVariables'] ) ? $group['semanticVariables'] : array();

						foreach ( $sematic_variables_css_object_array as $css_object ) {
							$declarations = isset( $css_object['declarations'] ) ? $css_object['declarations'] : array();

							if ( ! is_array( $declarations ) || empty( $declarations ) ) {
								continue;
							}

							foreach ( $declarations as $declaration ) {
								$property                    = $declaration['property'];
								$grouped_variables[ $key ][] = $variable_prefix . CoreFramework()->str_replace_first( '--', '', $property );
							}
						}
					}

					if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $group['manualSizes'] ) ) {
						$manual_sizes = $group['manualSizes'];

						foreach ( $manual_sizes as $manual_size ) {
							$grouped_variables[ $key ][] = $variable_prefix . $manual_size['name'];
						}
					}

					if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $group['steps'] ) && isset( $group['namingConvention'] ) ) {
						$steps             = $group['steps'];
						$steps             = explode( ',', $steps );
						$naming_convention = $group['namingConvention'];

						foreach ( $steps as $step ) {
							$grouped_variables[ $key ][] = $variable_prefix . $naming_convention . '-' . $step;
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_TYPOGRAPHY'] ) ) {
			if ( isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['namingConvention'] ) ) {
				$single_object = $preset['modulesData']['FLUID_TYPOGRAPHY'];
				$preset['modulesData']['FLUID_TYPOGRAPHY']['groups'][] = $single_object;

				if ( isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] ) ) {
					$preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] = $single_object['isDisabled'] || false;
				}
			}

			if ( isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['groups'] ) ) {
				$is_disabled = isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] ) && $preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] === true;

				foreach ( $preset['modulesData']['FLUID_TYPOGRAPHY']['groups'] as $group ) {
					$key = 'typographyStyles';

					$typography_data           = $group;
					$is_manual_fluid_spacing   = isset( $typography_data['mode'] ) && $typography_data['mode'] === 'fluid_manual';
					$is_gen_semantic_variables = isset( $typography_data['genSemanticVariables'] ) && $typography_data['genSemanticVariables'] === true;

					if ( $is_gen_semantic_variables ) {
						$sematic_variables_css_object_array = isset( $typography_data['semanticVariables'] ) ? $typography_data['semanticVariables'] : array();

						foreach ( $sematic_variables_css_object_array as $css_object ) {
							$declarations = isset( $css_object['declarations'] ) ? $css_object['declarations'] : array();

							if ( ! is_array( $declarations ) || empty( $declarations ) ) {
								continue;
							}

							foreach ( $declarations as $declaration ) {
								$property                    = $declaration['property'];
								$grouped_variables[ $key ][] = $variable_prefix . CoreFramework()->str_replace_first( '--', '', $property );
							}
						}
					}

					if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $typography_data['manualSizes'] ) ) {
						$manual_sizes = $typography_data['manualSizes'];

						foreach ( $manual_sizes as $manual_size ) {
							$grouped_variables[ $key ][] = $variable_prefix . $manual_size['name'];
						}
					}

					if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $typography_data['steps'] ) && isset( $typography_data['namingConvention'] ) ) {
						$steps             = $typography_data['steps'];
						$steps             = explode( ',', $steps );
						$naming_convention = $typography_data['namingConvention'];

						foreach ( $steps as $step ) {
							$grouped_variables[ $key ][] = $variable_prefix . $naming_convention . '-' . $step;
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COLOR_SYSTEM'] ) && isset( $preset['modulesData']['COLOR_SYSTEM']['groups'] ) ) {
			foreach ( $preset['modulesData']['COLOR_SYSTEM']['groups'] as $group ) {
				if ( isset( $group['isDisabled'] ) && $group['isDisabled'] ) {
					continue;
				}

				if ( isset( $group['colors'] ) && is_array( $group['colors'] ) ) {
					foreach ( $group['colors'] as $color ) {
						$name                               = $color['name'];
						$grouped_variables['colorStyles'][] = $variable_prefix . $name;

						$shades = isset( $color['shades'] ) ? $color['shades'] : array();
						foreach ( $shades as $shade ) {
							$grouped_variables['colorStyles'][] = $variable_prefix . $shade['name'];
						}

						$tints = isset( $color['tints'] ) ? $color['tints'] : array();
						foreach ( $tints as $tint ) {
							$grouped_variables['colorStyles'][] = $variable_prefix . $tint['name'];
						}

						$is_transparent        = isset( $color['transparent'] ) && $color['transparent'] === true;
						$transparent_variables = isset( $color['transparentVariables'] ) ? $color['transparentVariables'] : array();

						if ( $is_transparent ) {
							foreach ( $transparent_variables as $transparent_variable ) {
								$grouped_variables['colorStyles'][] = $variable_prefix . $name . '-' . $transparent_variable;
							}
						}
					}
				}
			}
		}

		// Add screen width preference variables
		if ( isset( $preset['preferences'] ) ) {
			if ( isset( $preset['preferences']['min_screen_width'] ) && $preset['preferences']['min_screen_width'] ) {
				$grouped_variables['layoutsStyles'][] = 'min-screen-width';
			}
			if ( isset( $preset['preferences']['max_screen_width'] ) && $preset['preferences']['max_screen_width'] ) {
				$grouped_variables['layoutsStyles'][] = 'max-screen-width';
			}
		}

		foreach ( array_keys( $grouped_variables ) as $key ) {
			$grouped_variables[ $key ] = array_unique( $grouped_variables[ $key ] );
		}

		if ( isset( $options['excluded_keys'] ) && is_array( $options['excluded_keys'] ) && ! empty( $options['excluded_keys'] ) ) {
			foreach ( $options['excluded_keys'] as $excluded_key ) {
				if ( isset( $grouped_variables[ $excluded_key ] ) ) {
					unset( $grouped_variables[ $excluded_key ] );
				}
			}
		}

		if ( $options['group_by_category'] === false ) {
			$grouped_variables = array_merge( ...array_values( $grouped_variables ?? array() ) );
		}

		return $grouped_variables ?? array();
	}

	public function getVariablesGroupedByCategoriesAndGroups(array $options = array(
		'group_by_category'              => true,
		'excluded_keys'                  => array(),
		'exclude_color_system_variables' => false,
	)): array {
		$options = \wp_parse_args(
			$options,
			array(
				'group_by_category'              => true,
				'excluded_keys'                  => array(),
				'exclude_color_system_variables' => false,
			)
		);

		$preset = $this->loadPreset();

		if ( ! $preset ) {
			return array();
		}

		$variable_prefix = isset( $preset['variablePrefix'] ) ? $preset['variablePrefix'] : '';

		$grouped_variables = array(
			'colorStyles'      => array(),
			'typographyStyles' => array(),
			'spacingStyles'    => array(),
			'layoutsStyles'    => array(),
			'designStyles'     => array(),
			'componentsStyles' => array(),
			'otherStyles'      => array(),
		);

		$protected_group_names = array( 'Fluid Layouts', 'Fluid Typography', 'Fluid Spacing', 'Color System', 'Components' );

		if ( isset( $preset['styleSheetData'] ) && is_array( $preset['styleSheetData'] ) ) {
			foreach ( $this->stylesheet_data_keys as $key ) {
				if ( isset( $preset['styleSheetData'][ $key ] ) && is_array( $preset['styleSheetData'][ $key ] ) ) {
					$stylesheet_category = $preset['styleSheetData'][ $key ];

					$i = 1;

					foreach ( $stylesheet_category as $group ) {
						++$i;
						$is_variable_group = isset( $group['type'] ) && $group['type'] === 'variable';
						$is_group_disabled = isset( $group['isDisabled'] ) && $group['isDisabled'] === true;

						$group_name = isset( $group['name'] ) ? $group['name'] : 'No name';

						if ( array_search( $group_name, $protected_group_names ) !== false ) {
							$group_name = $group_name . ' (' . $i . ')';
						}

						if ( ! $is_variable_group || $is_group_disabled ) {
							continue;
						}

						if ( isset( $group['cssObjects'] ) && is_array( $group['cssObjects'] ) ) {
							foreach ( $group['cssObjects'] as $cssObject ) {
								$is_disabled = isset( $cssObject['isDisabled'] ) && $cssObject['isDisabled'] === true;

								if ( $is_disabled ) {
									continue;
								}

								$declarations = isset( $cssObject['declarations'] ) ? $cssObject['declarations'] : array();

								if ( ! is_array( $declarations ) || empty( $declarations ) ) {
									continue;
								}

								foreach ( $declarations as $declaration ) {
									$property                                   = $declaration['property'];
									$grouped_variables[ $key ][ $group_name ][] = $variable_prefix . CoreFramework()->str_replace_first( '--', '', $property );
								}
							}
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_SPACING'] ) ) {
			if ( isset( $preset['modulesData']['FLUID_SPACING']['namingConvention'] ) ) {
				$single_object                                      = $preset['modulesData']['FLUID_SPACING'];
				$preset['modulesData']['FLUID_SPACING']['groups'][] = $single_object;

				if ( isset( $preset['modulesData']['FLUID_SPACING']['isDisabled'] ) ) {
					$preset['modulesData']['FLUID_SPACING']['isDisabled'] = $single_object['isDisabled'] || false;
				}
			}

			if ( isset( $preset['modulesData']['FLUID_SPACING']['groups'] ) ) {
				$is_disabled = isset( $preset['modulesData']['FLUID_SPACING']['isDisabled'] ) && $preset['modulesData']['FLUID_SPACING']['isDisabled'] === true;

				foreach ( $preset['modulesData']['FLUID_SPACING']['groups'] as $group ) {
					$key        = 'spacingStyles';
					$group_name = 'Fluid Spacing';

					$spacing_data              = $group;
					$is_manual_fluid_spacing   = isset( $spacing_data['mode'] ) && $spacing_data['mode'] === 'fluid_manual';
					$is_gen_semantic_variables = isset( $spacing_data['genSemanticVariables'] ) && $spacing_data['genSemanticVariables'] === true;

					if ( $is_gen_semantic_variables ) {
						$sematic_variables_group_name       = 'Contextual Spacing Variables';
						$sematic_variables_css_object_array = isset( $spacing_data['semanticVariables'] ) ? $spacing_data['semanticVariables'] : array();

						foreach ( $sematic_variables_css_object_array as $css_object ) {
							$declarations = isset( $css_object['declarations'] ) ? $css_object['declarations'] : array();

							if ( ! is_array( $declarations ) || empty( $declarations ) ) {
								continue;
							}

							foreach ( $declarations as $declaration ) {
								$property = $declaration['property'];
								$grouped_variables[ $key ][ $sematic_variables_group_name ][] = $variable_prefix . CoreFramework()->str_replace_first( '--', '', $property );
							}
						}
					}

					if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $spacing_data['manualSizes'] ) ) {
						$manual_sizes = $spacing_data['manualSizes'];
						foreach ( $manual_sizes as $manual_size ) {
							$grouped_variables[ $key ][ $group_name ][] = $variable_prefix . $manual_size['name'];
						}
					}

					if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $spacing_data['steps'] ) && isset( $spacing_data['namingConvention'] ) ) {
						$steps             = $spacing_data['steps'];
						$steps             = explode( ',', $steps );
						$naming_convention = $spacing_data['namingConvention'];

						foreach ( $steps as $step ) {
							$grouped_variables[ $key ][ $group_name ][] = $variable_prefix . $naming_convention . '-' . $step;
						}
					}
				}
			}
		}

		if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_TYPOGRAPHY'] ) ) {
			if ( isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['namingConvention'] ) ) {
				$single_object = $preset['modulesData']['FLUID_TYPOGRAPHY'];
				$preset['modulesData']['FLUID_TYPOGRAPHY']['groups'][] = $single_object;

				if ( isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] ) ) {
					$preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] = $single_object['isDisabled'] || false;
				}
			}

			if ( isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['groups'] ) ) {
				$is_disabled = isset( $preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] ) && $preset['modulesData']['FLUID_TYPOGRAPHY']['isDisabled'] === true;

				foreach ( $preset['modulesData']['FLUID_TYPOGRAPHY']['groups'] as $group ) {
					$key        = 'typographyStyles';
					$group_name = 'Fluid Typography';

					$typography_data           = $group;
					$is_manual_fluid_spacing   = isset( $typography_data['mode'] ) && $typography_data['mode'] === 'fluid_manual';
					$is_gen_semantic_variables = isset( $typography_data['genSemanticVariables'] ) && $typography_data['genSemanticVariables'] === true;

					if ( $is_gen_semantic_variables ) {
						$sematic_variables_group_name       = 'Contextual Typography Variables';
						$sematic_variables_css_object_array = isset( $typography_data['semanticVariables'] ) ? $typography_data['semanticVariables'] : array();

						foreach ( $sematic_variables_css_object_array as $css_object ) {
							$declarations = isset( $css_object['declarations'] ) ? $css_object['declarations'] : array();

							if ( ! is_array( $declarations ) || empty( $declarations ) ) {
								continue;
							}

							foreach ( $declarations as $declaration ) {
								$property = $declaration['property'];
								$grouped_variables[ $key ][ $sematic_variables_group_name ][] = $variable_prefix . CoreFramework()->str_replace_first( '--', '', $property );
							}
						}
					}

					if ( ! $is_disabled && $is_manual_fluid_spacing && isset( $typography_data['manualSizes'] ) ) {
						$manual_sizes = $typography_data['manualSizes'];

						foreach ( $manual_sizes as $manual_size ) {
							$grouped_variables[ $key ][ $group_name ][] = $variable_prefix . $manual_size['name'];
						}
					}

					if ( ! $is_disabled && ! $is_manual_fluid_spacing && isset( $typography_data['steps'] ) && isset( $typography_data['namingConvention'] ) ) {
						$steps             = $typography_data['steps'];
						$steps             = explode( ',', $steps );
						$naming_convention = $typography_data['namingConvention'];

						foreach ( $steps as $step ) {
							$grouped_variables[ $key ][ $group_name ][] = $variable_prefix . $naming_convention . '-' . $step;
						}
					}
				}
			}
		}

		if ( $options['exclude_color_system_variables'] === false ) {
			if ( isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COLOR_SYSTEM'] ) && isset( $preset['modulesData']['COLOR_SYSTEM']['groups'] ) ) {
				foreach ( $preset['modulesData']['COLOR_SYSTEM']['groups'] as $group ) {
					if ( isset( $group['isDisabled'] ) && $group['isDisabled'] ) {
						continue;
					}

					if ( isset( $group['colors'] ) && is_array( $group['colors'] ) ) {
						$group_name = isset( $group['name'] ) ? $group['name'] : 'No name';
						foreach ( $group['colors'] as $color ) {
							$name = $color['name'];
							$grouped_variables['colorStyles'][ $group_name ][] = $variable_prefix . $name;

							$shades = isset( $color['shades'] ) ? $color['shades'] : array();
							foreach ( $shades as $shade ) {
								$grouped_variables['colorStyles'][ $group_name ][] = $variable_prefix . $shade['name'];
							}

							$tints = isset( $color['tints'] ) ? $color['tints'] : array();
							foreach ( $tints as $tint ) {
								$grouped_variables['colorStyles'][ $group_name ][] = $variable_prefix . $tint['name'];
							}

							$is_transparent        = isset( $color['transparent'] ) && $color['transparent'] === true;
							$transparent_variables = isset( $color['transparentVariables'] ) ? $color['transparentVariables'] : array();

							if ( $is_transparent ) {
								foreach ( $transparent_variables as $transparent_variable ) {
									$grouped_variables['colorStyles'][ $group_name ][] = $variable_prefix . $name . '-' . $transparent_variable;
								}
							}
						}
					}
				}
			}
		}

		// Add screen width preference variables
		if ( isset( $preset['preferences'] ) ) {
			$preferences_group_name = 'Preferences';
			if ( isset( $preset['preferences']['min_screen_width'] ) && $preset['preferences']['min_screen_width'] ) {
				$grouped_variables['layoutsStyles'][ $preferences_group_name ][] = 'min-screen-width';
			}
			if ( isset( $preset['preferences']['max_screen_width'] ) && $preset['preferences']['max_screen_width'] ) {
				$grouped_variables['layoutsStyles'][ $preferences_group_name ][] = 'max-screen-width';
			}
		}

		if ( isset( $options['excluded_keys'] ) && is_array( $options['excluded_keys'] ) && ! empty( $options['excluded_keys'] ) ) {
			foreach ( $options['excluded_keys'] as $excluded_key ) {
				if ( isset( $grouped_variables[ $excluded_key ] ) ) {
					unset( $grouped_variables[ $excluded_key ] );
				}
			}
		}

		if ( $options['group_by_category'] === false ) {
			$grouped_variables = array_merge( ...array_values( $grouped_variables ?? array() ) );
		}

		return $grouped_variables ?? array();
	}

	public function getVariableString(): string {
		$cssString = get_option( 'core_framework_selected_preset_backup', '' );

		if ( ! $cssString ) {
			return '';
		}

		$pattern = '/(:root[^{]*\{[^}]*--[^}]*\})/s';
		preg_match_all( $pattern, $cssString, $matches );

		return implode( "\n\n", $matches[0] );
	}
}
