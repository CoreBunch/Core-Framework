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

declare (strict_types = 1);

namespace CoreFramework\App\Backend;

use CoreFramework\Common\Abstracts\Base;

/**
 * Class Notices
 *
 * @package CoreFramework\App\Backend
 * @since 0.0.0
 */
class Notices extends Base {

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
		 * Add plugin code here for admin notices specific functions
		 */
		// \add_action('admin_notices', [$this, 'exampleAdminNotice']);
	}
}
