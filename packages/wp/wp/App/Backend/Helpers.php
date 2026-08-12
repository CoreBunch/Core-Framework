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

/**
 * Helpers
 *
 * @package CoreFramework\App\Backend
 * @since 0.0.0
 */
class Helpers extends Base {

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
		 *
		 * Add plugin code here for admin helpers specific functions
		 */
		\add_filter( 'script_loader_tag', array( $this, 'filter_scripts' ), 0, 3 );
	}

	/**
	 * Filter script attributes
	 *
	 * @since    0.0.0
	 * @return    string
	 */
	public function filter_scripts( $tag, $handle, $src ) {
		if ( \str_contains( $handle, 'module/core-framework/core-framework/' ) ) {
			$str  = "type='module'";
			$str .= $this->plugin->isDev() ? ' crossorigin' : '';
			$tag  = '<script ' . $str . ' src="' . \esc_url( $src ) . '"></script>';
		}

		return $tag;
	}
}
