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

/**
 * Class Gutenberg
 *
 * @package CoreFramework\App\Gutenberg
 * @since 0.0.1
 */
class Gutenberg extends Base {

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.1
	 */
	public function init(): void {
		/**
		 * This Gutenberg class is only being instantiated in the Gutenberg as requested in the Scaffold class
		 *
		 * @see Requester::is_gutenberg()
		 * @see Scaffold::__construct
		 *
		 * Add plugin code here
		 */

		if ( ! CoreFrameworkGutenberg()->determine_load() ) {
			return;
		}

		CoreFrameworkGutenberg()->init();

		add_action( 'init', array( $this, 'register_blocks' ) );
		add_filter(
			'block_categories_all',
			function ( $categories ) {
				$categories[] = array(
					'slug'  => 'core-framework',
					'title' => 'Core Framework',
				);

				return $categories;
			}
		);
	}

	/**
	 * Register blocks
	 *
	 * @since 1.2.4
	 */
	public function register_blocks(): void {
		\wp_register_script(
			'core_framework_theme',
			\plugins_url( '/assets/public/js/core_framework_theme.js', CORE_FRAMEWORK_ABSOLUTE ),
			array(),
			filemtime( CORE_FRAMEWORK_DIR_ROOT . '/assets/public/js/core_framework_theme.js' ),
			false
		);

		foreach ( glob( plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'gutenberg-blocks/*' ) as $dir ) {
			register_block_type_from_metadata( $dir );
		}
	}
}
