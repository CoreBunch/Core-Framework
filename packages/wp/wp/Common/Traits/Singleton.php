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

namespace CoreFramework\Common\Traits;

/**
 * The singleton skeleton trait to instantiate the class only once
 *
 * @package CoreFramework\Common\Traits
 * @since 0.0.0
 */
trait Singleton {

	private static $instance;

	private function __construct() {
	}

	private function __clone() {
	}

	public function __wakeup() {
	}

	final public static function init(): self {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
