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

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Common\Utils\Errors;
use CoreFramework\Common\Utils\Requirements\RWFile;

/**
 * Check if any requirements are needed to run this plugin. We use the
 * "Requirements" package from "MicroPackage" to check if any PHP Extensions,
 * plugins, themes or PHP/WP version are required.
 *
 * @docs https://github.com/micropackage/requirements
 *
 * @package CoreFramework\Config
 * @since 0.0.0
 */
final class Requirements extends Base {

	public $requirements;

	/**
	 * Specifications for the requirements
	 *
	 * @return array : used to specify the requirements
	 * @since 0.0.0
	 */
	public function specifications(): array {
		return \apply_filters(
			'core_framework_plugin_requirements',
			array(
				'php'            => $this->plugin->requiredPHP(),
				'php_extensions' => array(),
				'wp'             => $this->plugin->requiredWP(),
				'plugins'        => array(),
				'RWFile'         => true,
			)
		);
	}

	/**
	 * Plugin requirements checker
	 *
	 * @since 0.0.0
	 */
	public function check(): void {
		if ( class_exists( '\\' . \Micropackage\Requirements\Requirements::class ) ) {
			$this->requirements = new \Micropackage\Requirements\Requirements(
				$this->plugin->name(),
				$this->specifications()
			);
			$this->requirements->register_checker( RWFile::class );
			if ( ! $this->requirements->satisfied() ) {
				// Print notice
				$this->requirements->print_notice();
				// Kill plugin
				Errors::pluginDie();
			}
		} else {
			// Else we do a version check based on version_compare
			$this->versionCompare();
		}
	}

	/**
	 * Compares PHP & WP versions and kills plugin if it's not compatible
	 *
	 * @since 0.0.0
	 */
	public function versionCompare(): void {
		foreach ( array( // PHP version check
			array(
				'current' => phpversion(),
				'compare' => $this->plugin->requiredPHP(),
				'title'   => \__( 'Invalid PHP version', 'core-framework' ),
				'message' => sprintf( /* translators: %1$1s: required php version, %2$2s: current php version */\__( 'You must be using PHP %1$1s or greater. You are currently using PHP %2$2s.', 'core-framework' ), $this->plugin->requiredPHP(), phpversion() ),
			), // WP version check
			array(
				'current' => \get_bloginfo( 'version' ),
				'compare' => $this->plugin->requiredWP(),
				'title'   => \__( 'Invalid WordPress version', 'core-framework' ),
				'message' => sprintf( /* translators: %1$1s: required wordpress version, %2$2s: current wordpress version */\__( 'You must be using WordPress %1$1s or greater. You are currently using WordPress %2$2s.', 'core-framework' ), $this->plugin->requiredWP(), \get_bloginfo( 'version' ) ),
			),
		) as $compat_check ) {
			if ( version_compare( $compat_check['compare'], $compat_check['current'], '>=' ) ) {
				Errors::pluginDie( $compat_check['message'], $compat_check['title'], CORE_FRAMEWORK_MAIN_FILE );
			}
		}
	}
}
