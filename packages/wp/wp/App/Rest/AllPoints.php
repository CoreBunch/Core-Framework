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

namespace CoreFramework\App\Rest;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Helper;
use CoreFramework\StylesheetStorage;

/**
 * Class AllPoints
 *
 * @package CoreFramework\App\Rest
 * @since 0.0.0
 */
class AllPoints extends Base {
	/**
	 * Public, read-only endpoint serving projects their owner marked as public.
	 * Fixed here on purpose: the REST route accepts a project ID, never a URL.
	 */
	private const REMOTE_IMPORT_ENDPOINT = 'https://us-central1-core-framework-6bdc9.cloudfunctions.net/getPreset';

	/** Generous ceiling for a single project payload, guarding against a runaway response. */
	private const REMOTE_IMPORT_MAX_BYTES = 8388608;

	/**
	 * Initialize the WordPress filesystem API.
	 *
	 * @return \WP_Filesystem_Base|null
	 */
	private function get_filesystem() {
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
	 * Check if an add-on is enabled.
	 *
	 * @param string $addon The addon name (e.g., 'oxygen', 'bricks', 'gutenberg')
	 * @return bool Whether the add-on is enabled
	 */
	private function is_addon_enabled( $addon ) {
		$options = get_option( 'core_framework_main', array() );

		return isset( $options[ $addon ] ) && $options[ $addon ];
	}

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.0
	 */
	public function init() {
		/**
		 * This class is only being instantiated if REST_REQUEST is defined in the requester as requested in the Scaffold class
		 *
		 * @see Requester::isRest()
		 * @see Scaffold::__construct
		 */

		if ( class_exists( 'WP_REST_Server' ) ) {
			\add_action( 'rest_api_init', array( $this, 'add_plugin_rest_api' ) );
			\add_filter( 'rest_allowed_cors_headers', array( $this, 'allow_figma_connection_header' ) );
		}
	}

	/**
	 * Allow the authentication header used by the Figma plugin.
	 *
	 * Figma plugin requests use a null origin and trigger a CORS preflight.
	 * WordPress allows that origin by default, but custom request headers must
	 * be added to the REST API allowlist explicitly.
	 *
	 * @param string[] $allow_headers REST request headers allowed by CORS.
	 * @return string[]
	 */
	public function allow_figma_connection_header( array $allow_headers ): array {
		$allow_headers[] = 'X-Core-Framework-Key';

		return array_values( array_unique( $allow_headers ) );
	}

	/**
	 * @since 0.0.0
	 */
	public function add_plugin_rest_api() {
		$this->register_routes();
		$this->register_options();
	}

	/**
	 * @since   0.0.0
	 * @version 1.0
	 */
	public function register_options(): void {
		$preferences = array(
			'oxygen'                               => array(
				'type' => 'boolean',
			),
			'bricks'                               => array(
				'type' => 'boolean',
			),
			'gutenberg'                            => array(
				'type' => 'boolean',
			),
			'figma'                                => array(
				'type' => 'boolean',
			),
			'disable_fonts'                        => array(
				'type' => 'boolean',
			),
			'selected_id'                          => array(
				'type' => 'string',
			),
			'delete_data'                          => array(
				'type' => 'boolean',
			),
			'show_update_notice'                   => array(
				'type' => 'boolean',
			),
			'theme_mode'                           => array(
				'type' => 'string',
			),
			'plugin_name'                           => array(
				'type' => 'string',
			),
			'has_theme'                            => array(
				'type' => 'boolean',
			),
			'oxygen_enable_variable_dropdown'      => array(
				'type' => 'boolean',
			),
			'oxygen_enable_dark_mode_preview'      => array(
				'type' => 'boolean',
			),
			'oxygen_variable_ui'                   => array(
				'type' => 'boolean',
			),
			'oxygen_enable_variable_ui_auto_hide'  => array(
				'type' => 'boolean',
			),
			'oxygen_enable_variable_ui_hint'       => array(
				'type' => 'boolean',
			),
			'oxygen_apply_class_on_hover'          => array(
				'type' => 'boolean',
			),
			'oxygen_enable_variable_context_menu'  => array(
				'type' => 'boolean',
			),
			'oxygen_enable_unit_and_value_preview' => array(
				'type' => 'boolean',
			),
			'bricks_enable_variable_dropdown'      => array(
				'type' => 'boolean',
			),
			'bricks_enable_dark_mode_preview'      => array(
				'type' => 'boolean',
			),
			'bricks_variable_ui'                   => array(
				'type' => 'boolean',
			),
			'bricks_enable_variable_ui_auto_hide'  => array(
				'type' => 'boolean',
			),
			'bricks_enable_variable_ui_hint'       => array(
				'type' => 'boolean',
			),
			'bricks_apply_class_on_hover'          => array(
				'type' => 'boolean',
			),
			'bricks_apply_variable_on_hover'       => array(
				'type' => 'boolean',
			),
			'bricks_bem_generator'       					 => array(
				'type' => 'boolean',
      ),
			'bricks_enable_variable_context_menu'  => array(
				'type' => 'boolean',
			),
			'gutenberg_enable_dark_mode_preview'   => array(
				'type' => 'boolean',
			),
			'gutenberg_place_controls_at_the_top'  => array(
				'type' => 'boolean',
			),
			'gutenberg_close_widget_default'  => array(
				'type' => 'boolean',
			),
			// Legacy
			'root_font_size'                       => array(
				'type' => 'number',
			),
			'postcss'                              => array(
				'type' => 'boolean',
			),
			'min_screen_width'                     => array(
				'type' => 'number',
			),
			'max_screen_width'                     => array(
				'type' => 'number',
			),
			'is_rem'                               => array(
				'type' => 'boolean',
			),
		);

		\register_setting(
			'core_framework',
			'core_framework_main',
			array(
				'type'         => 'object',
				'show_in_rest' => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => $preferences,
					),
				),
			)
		);
	}

	protected function permission( string $nonce, bool $readonly_capabilites = false ): bool {
		if ( ! isset( $nonce ) || empty( $nonce ) ) {
			return false;
		}

		if ( $readonly_capabilites ) {
			return ( \current_user_can( 'manage_options' ) || \current_user_can( 'edit_pages' ) ) && \wp_verify_nonce( $nonce, 'wp_rest' );
		}

		return \current_user_can( 'manage_options' ) && \wp_verify_nonce( $nonce, 'wp_rest' );
	}

	/**
	 * @since 0.0.0
	 * @return bool
	 */
	public function verify_nonce( \WP_REST_Request $request ): bool {
		$route           = $request->get_route() ?? '';
		$readonly_routes = array(
			'/get-builders',
			'/get-classes',
			'/get-colors',
			'/get-variables',
			'/builders-var-ui',
			'/get-bricks-sync-data',
		);

		foreach ( $readonly_routes as $key => $value ) {
			$readonly_routes[ $key ] = '/core-framework/v2' . $value;
		}

		$nonce = (string) $request->get_header( 'X-WP-Nonce' );
		return $this->permission( $nonce, in_array( $route, $readonly_routes, true ) );
	}

	/**
	 * Verify connection key
	 *
	 * @return bool
	 */
	public function verify_api_key( \WP_REST_Request $request ): bool {
		$authorization = $request->get_header( 'authorization' ) ?? '';
		$key           = $request->get_header( 'x-core-framework-key' ) ?? '';

		if ( ! $key && strpos( $authorization, 'Bearer ' ) === 0 ) {
			$key = substr( $authorization, strlen( 'Bearer ' ) );
		}

		if ( ! $key ) {
			$key = $request->get_param( 'key' ) ?? '';
		}

		if ( ! $key || strlen( $key ) < 24 ) {
			return false;
		}

		$target_key = \get_option( 'core_framework_api_key', '' );

		if ( ! $target_key ) {
			return false;
		}

		// The connection key is composed of a 24-char random password + URL-encoded site URL.
		// When passed as a query parameter, PHP auto-decodes the URL portion, so the
		// full strings won't match. Compare only the 24-char password portion.
		$target_checksum = substr( $target_key, 0, 24 );
		$key_checksum    = substr( $key, 0, 24 );

		if ( ! hash_equals( $target_checksum, $key_checksum ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Register the routes
	 *
	 * @return void
	 * @since 0.0.0
	 */
	public function register_routes() {
		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/update-presets',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_presets' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/upload-fonts',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_font_upload' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/delete-fonts',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_font_delete' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/get-core-fonts',
			array(
				'methods' 						=> \WP_REST_Server::READABLE,
				'callback' 						=> array( $this, 'get_core_fonts' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/remote-import',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'remote_import' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/delete-preset',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'delete_preset_row' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/get-preset-row',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_preset_row' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/update-main',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_main' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		// THIS
		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/update-colors',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_colors' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		// THIS
		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/update-classes',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_classes' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		// THIS
		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/update-grouped-classes',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_grouped_classes' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/get-builders',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_builders' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/get-classes',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_classes' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route( CORE_FRAMEWORK_NAME . '/v2', '/get-colors', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_colors' ),
			'permission_callback' => array( $this, 'verify_nonce' ),
		) );

		register_rest_route( CORE_FRAMEWORK_NAME . '/v2', '/get-bricks-sync-data', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_bricks_sync_data' ),
			'permission_callback' => array( $this, 'verify_nonce' ),
		) );

		// THIS
		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/update-prefixed-css-file',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_prefixed_css_file' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		// THIS
		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/save-oxygen-css-helper',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_oxygen_css_helper' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/get-variables',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_variables' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/builders-var-ui',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'builders_var_ui' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/api-key',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_api_key' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/api-key',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_api_key' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/api-key',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_api_key' ),
				'permission_callback' => array( $this, 'verify_nonce' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/preset',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_preset' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/preset',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_preset' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/preset-css',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_preset_css' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/figma/update-colors',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'figma_update_colors' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/figma/update-classes',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'figma_update_classes' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/figma/update-grouped-classes',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'figma_update_grouped_classes' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/figma/update-prefixed-css-file',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'figma_update_prefixed_css_file' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);

		register_rest_route(
			CORE_FRAMEWORK_NAME . '/v2',
			'/figma/save-oxygen-css-helper',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'figma_save_oxygen_css_helper' ),
				'permission_callback' => array( $this, 'verify_api_key' ),
			)
		);
	}

	/**
	 * Update the 'core_framework_presets' table
	 *
	 * @since 0.0.0
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update_presets( \WP_REST_Request $request ) {
		$data = $request->get_param( 'data' ) ?? '';
		$id   = $request->get_param( 'id' ) ?? '';

		$time = \current_time( 'mysql' );

		global $wpdb;
		$table_name   = \esc_sql( $wpdb->prefix . 'core_framework_presets' );
		$target_table = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) );

		if ( $target_table != $table_name ) {
			CoreFramework()->createTable();
		}

		// The identifier is the WordPress-controlled table prefix plus a fixed plugin suffix.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table_name WHERE id = %s", $id ) );

		if ( $exists ) {
			$wpdb->update(
				$table_name,
				array(
					'id'   => $id,
					'time' => $time,
					'data' => $data,
				),
				array( 'id' => $id )
			);

			if ( $wpdb->last_error ) {
				return new \WP_REST_Response( array( 'message' => 'Database error' ), 400 );
			}

			CoreFramework()->purge_cache();

			return new \WP_REST_Response(
				array(
					'success' => true,
					'action'  => 'updated',
				)
			);
		}

		$wpdb->insert(
			$table_name,
			array(
				'id'   => $id,
				'time' => $time,
				'data' => $data,
			)
		);

		if ( $wpdb->last_error ) {
			return new \WP_REST_Response( array( 'message' => 'Database error' ), 400 );
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success' => true,
				'action'  => 'created',
			)
		);
	}

	public function handle_font_upload( \WP_REST_Request $request ) {
		$uploads = \wp_upload_dir();

		if ( ! empty( $uploads['error'] ) ) {
			return new \WP_Error( 'upload_directory_error', $uploads['error'], array( 'status' => 500 ) );
		}

		$upload_dir = \trailingslashit( $uploads['basedir'] ) . 'core-framework/fonts/';
		$filesystem = $this->get_filesystem();

		if ( null === $filesystem || ( ! $filesystem->is_dir( $upload_dir ) && ! \wp_mkdir_p( $upload_dir ) ) ) {
			return new \WP_Error( 'upload_directory_error', 'Unable to prepare the font upload directory.', array( 'status' => 500 ) );
		}

		$fonts = $request->get_param( 'fonts' );

		if ( empty( $fonts ) || ! \is_array( $fonts ) ) {
			return new \WP_Error( 'invalid_request', 'No fonts provided or invalid format.', array( 'status' => 400 ) );
		}

		$saved_files       = array();
		$errors            = array();
		$allowed_extensions = array( 'woff', 'woff2', 'ttf', 'otf', 'eot' );

		foreach ( $fonts as $font ) {
			if ( ! \is_array( $font ) || ! isset( $font['filename'], $font['font_base64'] ) || ! \is_string( $font['filename'] ) || ! \is_string( $font['font_base64'] ) ) {
				$errors[] = array(
					'filename' => null,
					'error'    => 'Invalid font entry.',
				);
				continue;
			}

			$filename = \sanitize_file_name( $font['filename'] );
			$extension = \strtolower( \pathinfo( $filename, PATHINFO_EXTENSION ) );

			if ( '' === $filename || ! \in_array( $extension, $allowed_extensions, true ) ) {
				$errors[] = array(
					'filename' => $filename,
					'error'    => 'Invalid font file type.',
				);
				continue;
			}

			$font_content = \base64_decode( $font['font_base64'], true );

			if ( false === $font_content || \strlen( $font_content ) > 10 * MB_IN_BYTES ) {
				$errors[] = array(
					'filename' => $filename,
					'error'    => 'Invalid or oversized font data.',
				);
				continue;
			}

			$file_path = $upload_dir . $filename;
			$written   = $filesystem->put_contents(
				$file_path,
				$font_content,
				\defined( 'FS_CHMOD_FILE' ) ? FS_CHMOD_FILE : 0644
			);

			if ( ! $written ) {
				$errors[] = array(
					'filename' => $filename,
					'error'    => 'Failed to save file.',
				);
				continue;
			}

			$saved_files[] = array(
				'filename'  => $filename,
				'file_path' => $file_path,
			);
		}

		return array(
			'success'     => empty( $errors ),
			'saved_files' => $saved_files,
			'errors'      => $errors,
		);
	}

	public function handle_font_delete( \WP_REST_Request $request ) {
		$uploads    = \wp_upload_dir();
		$upload_dir = \trailingslashit( $uploads['basedir'] ) . 'core-framework/fonts/';
		$fonts      = $request->get_param( 'fonts' );

		if ( empty( $fonts ) || ! \is_array( $fonts ) ) {
			return new \WP_Error( 'invalid_request', 'No fonts provided or invalid format.', array( 'status' => 400 ) );
		}

		$deleted = array();
		$errors  = array();

		foreach ( $fonts as $font ) {
			if ( ! \is_array( $font ) || ! isset( $font['filename'] ) || ! \is_string( $font['filename'] ) ) {
				$errors[] = array(
					'filename' => null,
					'error'    => 'Missing filename key in font entry.',
				);
				continue;
			}

			$filename  = \sanitize_file_name( $font['filename'] );
			$file_path = $upload_dir . $filename;

			if ( ! \is_file( $file_path ) ) {
				$errors[] = array(
					'filename' => $filename,
					'error'    => 'File does not exist.',
				);
				continue;
			}

			\wp_delete_file( $file_path );

			if ( \is_file( $file_path ) ) {
				$errors[] = array(
					'filename' => $filename,
					'error'    => 'Failed to delete file.',
				);
				continue;
			}

			$deleted[] = $filename;
		}

		return array(
			'success' => empty( $errors ),
			'deleted' => $deleted,
			'errors'  => $errors,
		);
	}

	public function get_core_fonts() {
		$helper = new Helper();

		if ( $helper->isFontsDisabled() ) {
			return ['success' => true, 'fonts' => array()];
		}

		$preset = $helper->loadPreset();
		$preset_fonts = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FONTS'] )
			? $preset['modulesData']['FONTS']['fonts']
			: array();

		return ['success' => true, 'fonts' => $preset_fonts];
	}

	/**
	 * Fetch a publicly shared Core Framework project by its ID.
	 *
	 * The request is made from the server, so the administrator's browser never
	 * contacts a third-party host. The target URL is fixed here and the ID is
	 * validated against the ULID alphabet before use, so no caller-supplied URL
	 * is ever requested.
	 *
	 * @since 2.0.1
	 * @param \WP_REST_Request $request { id: string }
	 * @return array
	 */
	public function remote_import( \WP_REST_Request $request ) {
		$id = strtoupper( trim( (string) ( $request->get_param( 'id' ) ?? '' ) ) );

		if ( ! preg_match( '/^[0-9A-HJKMNP-TV-Z]{26}$/', $id ) ) {
			return array( 'success' => false, 'reason' => 'invalid-id' );
		}

		$response = \wp_remote_get(
			self::REMOTE_IMPORT_ENDPOINT . '?id=' . rawurlencode( $id ),
			array(
				'timeout'     => 15,
				'redirection' => 0,
				'user-agent'  => 'CoreFramework/' . CORE_FRAMEWORK_VERSION,
			)
		);

		if ( \is_wp_error( $response ) ) {
			return array( 'success' => false, 'reason' => 'request-failed' );
		}

		$code = \wp_remote_retrieve_response_code( $response );

		if ( 200 !== $code ) {
			return array(
				'success' => false,
				'reason'  => 404 === $code ? 'not-found' : 'request-failed',
			);
		}

		$body = \wp_remote_retrieve_body( $response );

		if ( strlen( $body ) > self::REMOTE_IMPORT_MAX_BYTES ) {
			return array( 'success' => false, 'reason' => 'request-failed' );
		}

		$decoded = json_decode( $body, true );

		if (
			! is_array( $decoded )
			|| empty( $decoded['success'] )
			|| ! isset( $decoded['data']['json'] )
			|| ! is_string( $decoded['data']['json'] )
		) {
			return array( 'success' => false, 'reason' => 'not-found' );
		}

		return array( 'success' => true, 'json' => $decoded['data']['json'] );
	}

	/**
	 * Delete a row from the 'core_framework_presets' table
	 *
	 * @since 0.0.0
	 * @param \WP_REST_Request $request { id: string }
	 * @return \WP_REST_Response
	 */
	public function delete_preset_row( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' ) ?? '';

		global $wpdb;
		$table_name = \esc_sql( $wpdb->prefix . 'core_framework_presets' );

		$wpdb->delete(
			$table_name,
			array( 'id' => $id )
		);

		if ( \is_wp_error( $wpdb->insert_id ) ) {
			http_response_code( 400 );
			exit();
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success' => true,
				'action'  => 'deleted',
			)
		);
	}

	/**
	 * Returns a row from the 'core_framework_presets' table
	 *
	 * @since 0.0.0
	 * @param \WP_REST_Request $request { id: string }
	 * @return \WP_REST_Response { success: boolean, data: Row }
	 */
	public function get_preset_row( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' ) ?? '';

		global $wpdb;
		$table_name = \esc_sql( $wpdb->prefix . 'core_framework_presets' );
		$row        = $wpdb->get_row(
			// The identifier is the WordPress-controlled table prefix plus a fixed plugin suffix.
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->prepare( "SELECT * FROM $table_name WHERE id = %s", $id )
		);

		if ( \is_wp_error( $row ) ) {
			http_response_code( 400 );
			exit();
		}

		return new \WP_REST_Response(
			array(
				'success' => $row ? true : false,
				'data'    => $row,
			)
		);
	}

	/**
	 * Updates code and id in `core_framework_main` table
	 *
	 * @since 0.0.0
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update_main( \WP_REST_Request $request ) {
		$cssString = $request->get_param( 'cssString' ) ?? '';
		$id        = $request->get_param( 'id' ) ?? '';

		if ( ! \is_string( $cssString ) || '' === $cssString || ! \is_string( $id ) || '' === $id ) {
			return new \WP_REST_Response( array( 'message' => 'CSS and preset ID are required.' ), 400 );
		}

		$forbidden_css = ['<script', 'expression(', 'javascript:', '@import url("http'];
		foreach ( $forbidden_css as $pattern ) {
			if ( false !== stripos( $cssString, $pattern ) ) {
				return new \WP_REST_Response( array( 'message' => 'Invalid CSS content' ), 400 );
			}
		}

		$option_name = 'core_framework_main';
		$settings    = \get_option( $option_name, array() );

		if ( ! \is_array( $settings ) ) {
			$settings = array();
		}

		$settings['selected_id'] = $id;
		\update_option( $option_name, $settings, false );

		\update_option( 'core_framework_selected_preset_backup', $cssString, false );

		$bytes_saved = StylesheetStorage::write( $cssString );

		if ( false === $bytes_saved ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Unable to write the generated stylesheet to the WordPress uploads directory.',
				),
				500
			);
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success'      => true,
				'bytes_saved'  => $bytes_saved,
				'is_multisite' => is_multisite(),
				'blog_id'      => get_current_blog_id(),
			)
		);
	}

	/**
	 * Class names sync
	 *
	 * @since 0.0.0
	 */
	public function update_classes( $request ) {
		$classes            = $request->get_param( 'classes' ) ?? '';
		$addon_enable_array = $request->get_param( 'addonEnableArray' ) ?? array();

		$is_addon_enabled = function( $addon_enable_array, $addon ) {
			foreach ( $addon_enable_array as $addon_enable ) {
				if ( $addon_enable['addon'] === $addon ) {
					return $addon_enable['enabled'];
				}
			}
			return false;
		};

		if ( $classes === null || $addon_enable_array === null ) {
			http_response_code( 400 );
			exit();
		}

		if ( is_string( $classes ) ) {
			$classes = explode( ',', $classes );
		}

		$new_selectors_array = is_array( $classes )
			? array_values(
				array_unique(
					array_filter(
						array_map(
							fn( $class ): string => is_string( $class ) ? trim( $class ) : '',
							$classes
						),
						fn( $class ): bool => '' !== $class
					)
				)
			)
			: array();
		$builder_array       = array(
			'oxygen' => array(
				'is_active'     => CoreFrameworkOxygen()->is_oxygen(),
				'class'         => CoreFrameworkOxygen(),
				'key'           => 'oxygen',
				'is_enabled'    => $is_addon_enabled( $addon_enable_array, 'oxygen' ),
			),
			'bricks' => array(
				'is_active'     => CoreFrameworkBricks()->is_bricks(),
				'class'         => CoreFrameworkBricks(),
				'key'           => 'bricks',
				'is_enabled'    => $is_addon_enabled( $addon_enable_array, 'bricks' ),
			),
		);

		$active_builders = array();
		$core_option     = \get_option( 'core_framework_main' );

		foreach ( $builder_array as $builder ) {
			if ( ! $builder['is_active'] ) {
				continue;
			}

			if ( ! $builder['is_enabled'] ) {
				continue;
			}

			if ( ! $core_option[ $builder['key'] ] ) {
				continue;
			}

			if ( method_exists( $builder['class'], 'refresh_selectors' ) ) {
				$builder['class']->refresh_selectors( $new_selectors_array );
			}

			if ( method_exists( $builder['class'], 'refresh_variables' ) ) {
				$builder['class']->refresh_variables();
			}

			$active_builders[] = $builder['key'];

			break;
		}

		return new \WP_REST_Response(
			array(
				'success'         => true,
				'active_builders' => $active_builders,
			)
		);
	}

	/**
	 * @since 1.0.3
	 */
	public function update_grouped_classes( $request ) {
		$grouped_classes = $request->get_param( 'groupedClassNames' ) ?? '';

		if ( $grouped_classes === null ) {
			http_response_code( 400 );
			exit();
		}

		$response = update_option( 'core_framework_grouped_classes', $grouped_classes, false );

		if ( \is_wp_error( $response ) ) {
			http_response_code( 400 );
			exit();
		}

		return new \WP_REST_Response(
			array(
				'success' => $response,
			)
		);
	}

	/**
	 * Color palette sync
	 *
	 * @since 0.0.0
	 * @param \WP_REST_Request
	 */
	public function update_colors( \WP_REST_Request $request ) {
		$colors             = $request->get_param( 'colors' ) ?? '';
		$addon_enable_array = $request->get_param( 'addonEnableArray' ) ?? array();

		$is_addon_enabled = function( $addon_enable_array, $addon ) {
			foreach ( $addon_enable_array as $addon_enable ) {
				if ( $addon_enable['addon'] === $addon ) {
					return $addon_enable['enabled'];
				}
			}
			return false;
		};

		if ( $colors === null ) {
			http_response_code( 400 );
			exit();
		}

		update_option( 'core_framework_colors', $colors, false );

		$builder_array = array(
			'oxygen' => array(
				'is_active'     => CoreFrameworkOxygen()->is_oxygen(),
				'class'         => CoreFrameworkOxygen(),
				'key'           => 'oxygen',
				'is_enabled'    => $is_addon_enabled( $addon_enable_array, 'oxygen' ),
			),
			'bricks' => array(
				'is_active'     => CoreFrameworkBricks()->is_bricks(),
				'class'         => CoreFrameworkBricks(),
				'key'           => 'bricks',
				'is_enabled'    => $is_addon_enabled( $addon_enable_array, 'bricks' ),
			),
		);

		$active_builders = array();
		$core_setting    = \get_option( 'core_framework_main' );

		foreach ( $builder_array as $builder ) {
			if ( ! $builder['is_enabled'] ) {
				continue;
			}

			if ( ! $builder['is_active'] ) {
				continue;
			}

			if ( ! $core_setting[ $builder['key'] ] ) {
				continue;
			}

			$builder['class']->update_colors( $colors );
			$active_builders[] = $builder['key'];

			break;
		}

		return new \WP_REST_Response(
			array(
				'success'         => true,
				'active_builders' => $active_builders,
			)
		);
	}

	/**
	 * Returns activate builders array
	 *
	 * @since 0.0.0
	 * @return \WP_REST_Response { builders: string[] }
	 */
	public function get_builders() {
		$builders       = array();
		$builders_array = array(
			'oxygen'    => CoreFrameworkOxygen()->is_oxygen(),
			'bricks'    => CoreFrameworkBricks()->is_bricks(),
			'gutenberg' => true,
		);

		foreach ( $builders_array as $key => $value ) {
			if ( $value ) {
				array_push( $builders, $key );
			}
		}

		return new \WP_REST_Response(
			array(
				'builders'  => $builders,
				'isOxygen6' => CoreFrameworkOxygen()->is_oxygen6(),
			)
		);
	}

	/**
	 * Get classes
	 *
	 * @since 1.0.0
	 */
	public function get_classes( \WP_REST_Request $request ) {
		$type = $request->get_param( 'type' ) ?? '';
		$classes = '';

		if ( $type === 'oxy' ) {
			$classes = get_option( 'ct_components_classes' );
		} else {
			$classes = get_option( 'core_framework_grouped_classes' );
		}

		return new \WP_REST_Response(
			array(
				'classes' => $classes
			)
		);
	}

	/**
	 * Get colors
	 *
	 * @since 1.0.0
	 */
	public function get_colors() {
		$colors = get_option( 'core_framework_colors', array() );
		return new \WP_REST_Response( array( 'colors' => $colors ) );
	}

	/**
	 * Get Bricks sync data (global classes, color palette, variables)
	 *
	 * @since 1.5.0
	 */
	public function get_bricks_sync_data() {
		$classes              = get_option( 'bricks_global_classes', array() );
		$colors               = get_option( 'bricks_color_palette', array() );
		$variables            = get_option( 'bricks_global_variables', array() );
		$variables_categories = get_option( 'bricks_global_variables_categories', array() );

		return new \WP_REST_Response(
			array(
				'globalClasses'             => $classes,
				'colorPalette'              => $colors,
				'globalVariables'           => $variables,
				'globalVariablesCategories' => $variables_categories,
			)
		);
	}

	/**
	 * @since 1.0.3
	 * @param \WP_REST_Request $request
	 */
	public function update_prefixed_css_file( \WP_REST_Request $request ) {
		$cssString = $request->get_param( 'cssString' ) ?? '';

		if ( ! $cssString ) {
			http_response_code( 400 );
			exit();
		}

		$success = update_option( 'core_framework_editor_prefixed_css', $cssString, false );

		if ( \is_wp_error( $success ) ) {
			http_response_code( 400 );
			exit();
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success' => $success,
			)
		);
	}

	/**
	 * @since 1.0.3
	 * @param \WP_REST_Request $request
	 */
	public function save_oxygen_css_helper( \WP_REST_Request $request ) {
		$cssString = $request->get_param( 'cssString' ) ?? '';

		if ( ! $cssString ) {
			http_response_code( 400 );
			exit();
		}

		$success = update_option( 'core_framework_oxygen_css_helper', $cssString, false );

		if ( \is_wp_error( $success ) ) {
			http_response_code( 400 );
			exit();
		}

		return new \WP_REST_Response(
			array(
				'success' => $success,
			)
		);
	}

	/**
	 * @since 1.2.4
	 */
	public function get_variables( \WP_REST_Request $request ) {
		$type = $request->get_param( 'type' ) ?? '';

		if ( $type === 'oxygen_dropdown' || $type === 'bricks_dropdown' ) {
			$helper    = new Helper();
			$variables = $helper->getVariables(
				array(
					'group_by_category' => true,
				)
			);

			return new \WP_REST_Response(
				array(
					'variables' => $variables,
				)
			);
		}

		$helper    = new Helper();
		$variables = $helper->getVariables(
			array(
				'group_by_category' => false,
				'excluded_keys'     => array( 'colorStyles' ),
			)
		);

		return new \WP_REST_Response(
			array(
				'variables' => $variables,
			)
		);
	}

	/**
	 *
	 * @since 1.3.0
	 * @return mixed
	 */
	public function builders_var_ui() {
		$empty_response = array(
			'variables'                          => array(),
			'color_system_data'                  => array(),
			'variable_prefix'                    => '',
			'fluid_typography_naming_convention' => array(),
			'fluid_spacing_naming_convention'    => array(),
		);
		$options        = get_option( 'core_framework_main' );
		$is_bricks      = isset( $options['bricks'] ) ? $options['bricks'] : false;
		$is_oxygen      = isset( $options['oxygen'] ) ? $options['oxygen'] : false;

		if ( ! $is_bricks && ! $is_oxygen ) {
			return new \WP_REST_Response(
				$empty_response
			);
		}

		$helper    = new Helper();
		$variables = $helper->getVariablesGroupedByCategoriesAndGroups(
			array(
				'group_by_category'              => true,
				'exclude_color_system_variables' => true,
			)
		);

		$preset = $helper->getPreset();

		$color_system_data = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['COLOR_SYSTEM'] ) ? $preset['modulesData']['COLOR_SYSTEM'] : array();
		$variable_prefix   = isset( $preset['variablePrefix'] ) ? $preset['variablePrefix'] : '';
		$fluid_typography  = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_TYPOGRAPHY'] ) ? $preset['modulesData']['FLUID_TYPOGRAPHY'] : array();
		$fluid_spacing     = isset( $preset['modulesData'] ) && isset( $preset['modulesData']['FLUID_SPACING'] ) ? $preset['modulesData']['FLUID_SPACING'] : array();

		return new \WP_REST_Response(
			array(
				'variables'                          => $variables,
				'color_system_data'                  => $color_system_data,
				'variable_prefix'                    => $variable_prefix,
				'fluid_typography_naming_convention' => $fluid_typography,
				'fluid_spacing_naming_convention'    => $fluid_spacing,
			)
		);
	}

	/**
	 * Create connection key
	 *
	 * @since 1.6.0
	 */
	public function create_api_key( \WP_REST_Request $request ) {
		unset( $request );

		if ( ! in_array( 'administrator', wp_get_current_user()->roles ) ) {
			http_response_code( 400 );
			exit();
		}

		$key = \wp_generate_password( 24, false, false ) . rawurlencode( \home_url() );

		\update_option( 'core_framework_api_key', $key, false );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'key'     => $key,
			)
		);
	}

	/**
	 * Get connection key
	 *
	 * @since 1.6.0
	 */
	public function get_api_key() {
		if ( ! in_array( 'administrator', wp_get_current_user()->roles ) ) {
			http_response_code( 400 );
			exit();
		}

		$key = \get_option( 'core_framework_api_key', '' );

		return new \WP_REST_Response(
			array(
				'key' => $key,
			)
		);
	}

	/**
	 * Delete connection key
	 *
	 * @since 1.6.0
	 */
	public function delete_api_key() {
		if ( ! in_array( 'administrator', wp_get_current_user()->roles ) ) {
			http_response_code( 400 );
			exit();
		}

		\delete_option( 'core_framework_api_key' );

		return new \WP_REST_Response(
			array(
				'success' => true,
			)
		);
	}

	/**
	 * Get preset using a connection key
	 *
	 * @since 1.6.0
	 */
	public function get_preset( \WP_REST_Request $request ) {
		unset( $request );

		try {
			$helper = new Helper();
			$preset = $helper->loadPreset();

			return new \WP_REST_Response(
				array(
					'success' => true,
					'data'    => $preset,
				)
			);
		} catch ( Exception $e ) {
			http_response_code( 400 );
			exit();
		}
	}

	/**
	 * Update preset using a connection key
	 *
	 * @since 1.6.0
	 */
	public function update_preset( \WP_REST_Request $request ) {
		$body   = $request->get_body();
		$json   = json_decode( $body, true );
		$preset = isset( $json['preset'] ) ? $json['preset'] : null;
		$data   = json_encode( $preset );

		if ( ! $data || $data == null || $data == '' ) {
			http_response_code( 200 );
			exit();
		}

		$helper    = new Helper();
		$preset_id = $helper->getPresetId();

		$time = \current_time( 'mysql' );

		if ( ! $preset_id ) {
			$preset_id = Functions()->get_random_id();
			$helper->setPresetId( $preset_id );
		}

		global $wpdb;
		$table_name   = \esc_sql( $wpdb->prefix . 'core_framework_presets' );
		$target_table = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) );

		if ( $target_table != $table_name ) {
			CoreFramework()->createTable();
		}

		// The identifier is the WordPress-controlled table prefix plus a fixed plugin suffix.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table_name WHERE id = %s", $preset_id ) );

		if ( $exists ) {
			$wpdb->update(
				$table_name,
				array(
					'id'   => $preset_id,
					'time' => $time,
					'data' => $data,
				),
				array( 'id' => $preset_id )
			);

			if ( \is_wp_error( $wpdb->insert_id ) ) {
				http_response_code( 400 );
				exit();
			}

			CoreFramework()->purge_cache();

			return new \WP_REST_Response(
				array(
					'success' => true,
					'action'  => 'updated',
				)
			);
		}

		$wpdb->insert(
			$table_name,
			array(
				'id'   => $preset_id,
				'time' => $time,
				'data' => $data,
			)
		);

		if ( \is_wp_error( $wpdb->insert_id ) ) {
			http_response_code( 400 );
			exit();
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success' => true,
				'action'  => 'created',
			)
		);
	}

	/**
	 * Update css
	 *
	 * @since 1.6.0
	 */
	public function update_preset_css( \WP_REST_Request $request ) {
		$body = $request->get_body();
		$data = json_decode( $body, true );
		$css  = \is_array( $data ) && isset( $data['css'] ) ? $data['css'] : null;

		if ( ! \is_string( $css ) || '' === $css ) {
			return new \WP_REST_Response( array( 'message' => 'CSS is required.' ), 400 );
		}

		$forbidden_css = ['<script', 'expression(', 'javascript:', '@import url("http'];
		foreach ( $forbidden_css as $pattern ) {
			if ( false !== stripos( $css, $pattern ) ) {
				return new \WP_REST_Response( array( 'message' => 'Invalid CSS content' ), 400 );
			}
		}

		\update_option( 'core_framework_selected_preset_backup', $css, false );

		$bytes_saved = StylesheetStorage::write( $css );

		if ( false === $bytes_saved ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Unable to write the generated stylesheet to the WordPress uploads directory.',
				),
				500
			);
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success'     => true,
				'bytes_saved' => $bytes_saved,
			)
		);
	}

	/**
	 * @since 1.8.0
	 */
	public function figma_update_colors( \WP_REST_Request $request ) {
		$body   = $request->get_body();
		$data   = json_decode( $body, true );
		$colors = isset( $data['colors'] ) ? $data['colors'] : null;

		if ( $colors === null ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Colors are null',
				),
				400
			);
		}

		update_option( 'core_framework_colors', $colors, false );

		$builder_array = array(
			'oxygen' => array(
				'is_active'     => CoreFrameworkOxygen()->is_oxygen(),
				'class'         => CoreFrameworkOxygen(),
				'key'           => 'oxygen',
				'is_enabled'    => $this->is_addon_enabled( 'oxygen' ),
			),
			'bricks' => array(
				'is_active'     => CoreFrameworkBricks()->is_bricks(),
				'class'         => CoreFrameworkBricks(),
				'key'           => 'bricks',
				'is_enabled'    => $this->is_addon_enabled( 'bricks' ),
			),
		);

		$active_builders = array();
		$core_setting    = \get_option( 'core_framework_main' );

		foreach ( $builder_array as $builder ) {
			if ( ! $builder['is_enabled'] ) {
				continue;
			}

			if ( ! $builder['is_active'] ) {
				continue;
			}

			if ( ! $core_setting[ $builder['key'] ] ) {
				continue;
			}

			$builder['class']->update_colors( $colors );
			$active_builders[] = $builder['key'];

			break;
		}

		return new \WP_REST_Response(
			array(
				'success'         => true,
				'active_builders' => $active_builders,
			)
		);
	}

	/**
	 * @since 1.8.0
	 */
	public function figma_update_classes( \WP_REST_Request $request ) {
		$body    = $request->get_body();
		$json    = json_decode( $body, true );
		$classes = isset( $json['classes'] ) ? $json['classes'] : null;

		if ( $classes === null ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Classes or addon enable array is null',
				),
				400
			);
		}

		$new_selectors_array = explode( ',', $classes ) ?? array();
		$builder_array       = array(
			'oxygen' => array(
				'is_active'     => CoreFrameworkOxygen()->is_oxygen(),
				'class'         => CoreFrameworkOxygen(),
				'key'           => 'oxygen',
				'is_enabled'    => $this->is_addon_enabled( 'oxygen' ),
			),
			'bricks' => array(
				'is_active'     => CoreFrameworkBricks()->is_bricks(),
				'class'         => CoreFrameworkBricks(),
				'key'           => 'bricks',
				'is_enabled'    => $this->is_addon_enabled( 'bricks' ),
			),
		);

		$active_builders = array();
		$core_option     = \get_option( 'core_framework_main' );

		foreach ( $builder_array as $builder ) {
			if ( ! $builder['is_active'] ) {
				continue;
			}

			if ( ! $builder['is_enabled'] ) {
				continue;
			}

			if ( ! $core_option[ $builder['key'] ] ) {
				continue;
			}

			if ( method_exists( $builder['class'], 'refresh_selectors' ) ) {
				$builder['class']->refresh_selectors( $new_selectors_array );
			}

			if ( method_exists( $builder['class'], 'refresh_variables' ) ) {
				$builder['class']->refresh_variables();
			}

			$active_builders[] = $builder['key'];

			break;
		}

		return new \WP_REST_Response(
			array(
				'success'         => true,
				'active_builders' => $active_builders,
			)
		);
	}

	/**
	 * @since 1.8.0
	 */
	public function figma_update_grouped_classes( \WP_REST_Request $request ) {
		try {
			if ( ! $this->is_addon_enabled( 'gutenberg' ) ) {
				return new \WP_REST_Response(
					array(
						'success' => false,
						'message' => 'Gutenberg integration is not enabled',
					),
					200
				);
			}

			$body            = $request->get_body();
			$data            = json_decode( $body, true );
			$grouped_classes = isset( $data['groupedClassNames'] ) ? $data['groupedClassNames'] : null;

			if ( $grouped_classes === null ) {
				return new \WP_REST_Response(
					array(
						'success' => false,
						'message' => 'Grouped classes are null',
					),
					400
				);
			}

			$response = update_option( 'core_framework_grouped_classes', $grouped_classes, false );

			if ( \is_wp_error( $response ) ) {
				return new \WP_REST_Response(
					array(
						'success' => false,
						'message' => 'Failed to update grouped classes',
					),
					400
				);
			}

			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'Grouped classes updated successfully',
				)
			);
		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'An error occurred: ' . $e->getMessage(),
				),
				500
			);
		}
	}

	/**
	 * @since 1.8.0
	 */
	public function figma_update_prefixed_css_file( \WP_REST_Request $request ) {
		if ( ! $this->is_addon_enabled( 'gutenberg' ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Gutenberg integration is not enabled',
				),
				200
			);
		}

		$body      = $request->get_body();
		$data      = json_decode( $body, true );
		$cssString = isset( $data['cssString'] ) ? $data['cssString'] : null;

		if ( ! $cssString ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'CSS string is null',
				),
				400
			);
		}

		$success = update_option( 'core_framework_editor_prefixed_css', $cssString, false );

		if ( \is_wp_error( $success ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Failed to update prefixed CSS file',
				),
				400
			);
		}

		CoreFramework()->purge_cache();

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => 'Prefixed CSS file updated successfully',
			)
		);
	}

	/**
	 * @since 1.8.0
	 */
	public function figma_save_oxygen_css_helper( \WP_REST_Request $request ) {
		if ( ! $this->is_addon_enabled( 'oxygen' ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Oxygen integration is not enabled',
				),
				200
			);
		}

		$body      = $request->get_body();
		$data      = json_decode( $body, true );
		$cssString = isset( $data['cssString'] ) ? $data['cssString'] : null;

		if ( ! $cssString ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'CSS string is null',
				),
				400
			);
		}

		$success = update_option( 'core_framework_oxygen_css_helper', $cssString, false );

		if ( \is_wp_error( $success ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Failed to update Oxygen CSS helper',
				),
				400
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => 'Oxygen CSS helper updated successfully',
			)
		);
	}
}
