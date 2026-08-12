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

namespace CoreFramework\Config;

/**
 * This array is being used in ../Scaffold.php to instantiate the classes
 *
 * @package CoreFramework\Config
 * @since 0.0.0
 */
final class Classes {

	/**
	 * Init the classes inside these folders based on type of request.
	 *
	 * @see Requester for all the type of requests or to add your own
	 */
	public static function get(): array {
		return array(
			array( 'init' => 'Integrations' ),
			array( 'init' => 'App\\General' ),
			array(
				'init'       => 'App\\Frontend',
				'on_request' => 'frontend',
			),
			array(
				'init'       => 'App\\Backend',
				'on_request' => 'backend',
			),
			array(
				'init'       => 'App\\Rest',
				'on_request' => 'rest',
			),
			array(
				'init'       => 'App\\Oxygen',
				'on_request' => 'oxygen',
			),
			array(
				'init'       => 'App\\Bricks',
				'on_request' => 'bricks',
			),
			array(
				'init'       => 'App\\Gutenberg\\Gutenberg',
				'on_request' => 'gutenberg',
			),
			array( 'init' => 'Compatibility' ),
		);
	}
}
