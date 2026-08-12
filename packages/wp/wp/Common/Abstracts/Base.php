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

namespace CoreFramework\Common\Abstracts;

use CoreFramework\Config\Plugin;

/**
 * The Base class which can be extended by other classes to load in default methods
 *
 * @package CoreFramework\Common\Abstracts
 * @since 0.0.0
 */
abstract class Base {

	/**
	 * @var object : will be filled with data from the plugin config class
	 * @see Plugin
	 */
	protected Plugin $plugin;

	/**
	 * Base constructor.
	 *
	 * @since 0.0.0
	 */
	public function __construct() {
		$this->plugin = Plugin::init();
	}
}
