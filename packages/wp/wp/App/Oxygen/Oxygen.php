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

namespace CoreFramework\App\Oxygen;

use CoreFramework\Common\Abstracts\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Oxygen
 *
 * @package CoreFramework\App\Oxygen
 * @since 0.0.0
 */
class Oxygen extends Base {

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.0
	 */
	public function init(): void {
		/**
		 * This Oxygen class is only being instantiated in the Oxygen builder as requested in the Scaffold class
		 *
		 * @see Requester::isOxygen()
		 * @see Scaffold::__construct
		 *
		 * Add plugin code here
		 */

		if ( ! CoreFrameworkOxygen()->determine_load() ) {
			return;
		}

		\add_action( 'plugins_loaded', array( $this, 'include_oxygen_elements' ), 100 );
	}

	public function include_oxygen_elements(): void {
		if ( ! class_exists( 'OxygenElement' ) ) {
			return;
		}

		foreach ( glob( ( __DIR__ ) . '/Elements/*.php' ) as $filename ) {
			include $filename;
		}
	}
}
