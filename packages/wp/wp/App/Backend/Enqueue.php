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

namespace CoreFramework\App\Backend;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Common\Utils\Vite;

/**
 * Class Enqueue
 *
 * @package CoreFramework\App\Backend
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
		 * This backend class is only being instantiated in the backend as requested in the Scaffold class
		 *
		 * @see Requester::isAdminBackend()
		 * @see Scaffold::__construct
		 */
		\add_action( 'admin_enqueue_scripts', array( $this, 'builderScripts' ) );
	}

	private function dequeues(): void {
		\add_filter( 'admin_footer_text', '__return_empty_string', 11 );
		\add_filter( 'update_footer', '__return_empty_string', 11 );
		\remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

		// Brindle QuickPop iframe fix
		if ( defined( 'QP_PLUGIN_DIR' ) ) {
			\wp_dequeue_script( 'qp-functions' );
			\wp_dequeue_style( 'qp-styles' );
			\wp_dequeue_style( 'qp-font-styles' );
		}

		if ( class_exists( 'Udb\Setup' ) ) {
			\wp_dequeue_style( 'udb-admin' );
			\wp_dequeue_script( 'udb-notice-dismissal' );
			\wp_dequeue_style( 'font-awesome' );
			\wp_dequeue_style( 'font-awesome-shims' );
		}
	}

	/**
	 * Enqueue the scripts related to Core Framework builder
	 *
	 * @since    0.0.0
	 */
	public function builderScripts(): void {
		$admin_page = \get_current_screen();
		if ( \is_null( $admin_page ) || $admin_page->id !== 'toplevel_page_core-framework' ) {
			return;
		}

		$this->dequeues();

		function isDBUpdate( $current_dbv ): bool {
			return version_compare( $current_dbv, CORE_FRAMEWORK_DB_VER, '<' );
		}

		$current_dbv = \get_option( 'core_framework_db_version', '1.0' );

		$localization = array(
			'rest_url'    => \get_rest_url( null, 'core-framework/v1' ),
			'admin_url'   => \admin_url(),
			'home_url'    => \home_url(),
			'nonce'       => \wp_create_nonce( CORE_FRAMEWORK_NAME ),
			'homepage_id' => \get_option( 'page_on_front', '0' ),
			'version'     => $this->plugin->version(),
			'dbv'         => $current_dbv,
			'b'           => array(
				'dbUpdate' => isDBUpdate( $current_dbv ),
			),
		);

		$entry_main = Vite::useVite(
			'main.tsx',
			array(
				'js'        => true,
				'css'       => true,
				'js_dep'    => array( 'wp-api' ),
				'css_dep'   => array(),
				'in_footer' => true,
				'media'     => 'all',
			)
		);

		\wp_localize_script( $entry_main, 'coreFramework', $localization );
	}

	/**
	 * Enqueue scripts
	 *
	 * @since 0.0.0
	 */
	public function enqueueScripts(): void {
		// Enqueue CSS
		foreach ( array(
			array(
				'deps'    => array(),
				'handle'  => 'plugin-name-backend-css',
				'media'   => 'all',
				'source'  => \plugins_url( '/assets/public/css/backend.css', CORE_FRAMEWORK_ABSOLUTE ),
				'version' => $this->plugin->version(),
			),
		) as $css ) {
			\wp_enqueue_style( $css['handle'], $css['source'], $css['deps'], $css['version'], $css['media'] );
		}

		// Enqueue JS
		foreach ( array(
			array(
				'deps'      => array(),
				'handle'    => 'plugin-test-backend-js',
				'in_footer' => true,
				'source'    => \plugins_url( '/assets/public/js/backend.js', CORE_FRAMEWORK_ABSOLUTE ),
				'version'   => $this->plugin->version(),
			),
		) as $js ) {
			\wp_enqueue_script( $js['handle'], $js['source'], $js['deps'], $js['version'], $js['in_footer'] );
		}
	}
}
