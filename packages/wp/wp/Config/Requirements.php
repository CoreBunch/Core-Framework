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

/**
 * Check the PHP, WordPress, and filesystem requirements needed by the plugin.
 *
 * @package CoreFramework\Config
 * @since 0.0.0
 */
final class Requirements extends Base {

	/**
	 * Plugin requirements checker
	 *
	 * @since 0.0.0
	 */
	public function check(): void {
		$this->versionCompare();

		if ( ! \function_exists( 'is_readable' ) || ! \function_exists( 'file_get_contents' ) ) {
			Errors::pluginDie(
				\__( 'The PHP functions is_readable and file_get_contents are required.', 'core-framework' ),
				\__( 'Missing PHP functions', 'core-framework' ),
				CORE_FRAMEWORK_MAIN_FILE
			);
		}
	}

	/**
	 * Compares PHP & WP versions and kills plugin if it's not compatible
	 *
	 * @since 0.0.0
	 */
	public function versionCompare(): void {
		foreach ( array(
			array(
				'type'    => 'php',
				'current' => phpversion(),
				'compare' => $this->plugin->requiredPHP(),
			),
			array(
				'type'    => 'wordpress',
				'current' => \get_bloginfo( 'version' ),
				'compare' => $this->plugin->requiredWP(),
			),
		) as $compat_check ) {
			if ( ! version_compare( $compat_check['current'], $compat_check['compare'], '<' ) ) {
				continue;
			}

			if ( 'php' === $compat_check['type'] ) {
				$title   = \__( 'Invalid PHP version', 'core-framework' );
				$message = sprintf(
					/* translators: %1$1s: required PHP version, %2$2s: current PHP version */
					\__( 'You must be using PHP %1$1s or greater. You are currently using PHP %2$2s.', 'core-framework' ),
					$this->plugin->requiredPHP(),
					phpversion()
				);
			} else {
				$title   = \__( 'Invalid WordPress version', 'core-framework' );
				$message = sprintf(
					/* translators: %1$1s: required WordPress version, %2$2s: current WordPress version */
					\__( 'You must be using WordPress %1$1s or greater. You are currently using WordPress %2$2s.', 'core-framework' ),
					$this->plugin->requiredWP(),
					\get_bloginfo( 'version' )
				);
			}

			Errors::pluginDie( $message, $title, CORE_FRAMEWORK_MAIN_FILE );
		}
	}
}
