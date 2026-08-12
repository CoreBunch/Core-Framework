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

namespace CoreFramework\Config;

use CoreFramework\Common\Traits\Singleton;

/**
 * Plugin data which are used through the plugin, most of them are defined
 * by the root file meta data. The data is being inserted in each class
 * that extends the Base abstract class
 *
 * @see Base
 * @package CoreFramework\Config
 * @since 0.0.0
 */
final class Plugin {

	/**
	 * Singleton trait
	 */
	use Singleton;

	/**
	 * Get the plugin meta data from the root file and include own data
	 *
	 * @since 0.0.0
	 */
	public function data(): array {
		$plugin_data = \apply_filters(
			'core_framework_plugin_data',
			array(
				'development' => CoreFramework()->isDev(),
			)
		);
		return array_merge(
			\apply_filters(
				'core_framework_plugin_meta_data',
				\get_file_data(
					CORE_FRAMEWORK_ABSOLUTE,
					array(
						'name'         => 'Plugin Name',
						'uri'          => 'Plugin URI',
						'description'  => 'Description',
						'version'      => 'Version',
						'author'       => 'Author',
						'author-uri'   => 'Author URI',
						'text-domain'  => 'Text Domain',
						'domain-path'  => 'Domain Path',
						'required-php' => 'Requires PHP',
						'required-wp'  => 'Requires WP',
						'namespace'    => 'Namespace',
					),
					'plugin'
				)
			),
			$plugin_data
		);
	}

	/**
	 * Get the plugin settings
	 *
	 * @since 0.0.0
	 */
	public function settings(): string {
		return $this->data()['settings'];
	}

	/**
	 * Get the plugin version number
	 *
	 * @since 0.0.0
	 */
	public function version(): string {
		return $this->data()['version'];
	}

	/**
	 * Get the required minimum PHP version
	 *
	 * @since 0.0.0
	 */
	public function requiredPHP(): string {
		return $this->data()['required-php'];
	}

	/**
	 * Get the required minimum WP version
	 *
	 * @since 0.0.0
	 */
	public function requiredWP(): string {
		return $this->data()['required-wp'];
	}

	/**
	 * Get the plugin name
	 *
	 * @since 0.0.0
	 */
	public function name(): string {
		return $this->data()['name'];
	}

	/**
	 * Get the plugin url
	 *
	 * @since 0.0.0
	 */
	public function uri(): string {
		return $this->data()['uri'];
	}

	/**
	 * Get the plugin description
	 *
	 * @since 0.0.0
	 */
	public function description(): string {
		return $this->data()['description'];
	}

	/**
	 * Get the plugin author
	 *
	 * @since 0.0.0
	 */
	public function author(): string {
		return $this->data()['author'];
	}

	/**
	 * Get the plugin author uri
	 *
	 * @since 0.0.0
	 */
	public function authorUri(): string {
		return $this->data()['author-uri'];
	}

	/**
	 * Get the plugin text domain
	 *
	 * @since 0.0.0
	 */
	public function textDomain(): string {
		return $this->data()['text-domain'];
	}

	/**
	 * Get the plugin domain path
	 *
	 * @since 0.0.0
	 */
	public function domainPath(): string {
		return $this->data()['domain-path'];
	}

	/**
	 * Get the plugin namespace
	 *
	 * @since 0.0.0
	 */
	public function namespace(): string {
		return $this->data()['namespace'];
	}

	/**
	 * Get the plugin namespace
	 *
	 * @since 0.0.0
	 */
	public function isDev(): bool {
		return $this->data()['development'];
	}
}
