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
use CoreFramework\StylesheetStorage;

/**
 * Plugin setup hooks (activation, deactivation, uninstall)
 *
 * @package CoreFramework\Config
 * @since 0.0.0
 */
final class Setup {


	/**
	 * Singleton trait
	 */
	use Singleton;

	/**
	 * Remove credentials that belonged to the retired EDD licensing system.
	 */
	private static function remove_retired_commercial_options(): void {
		$legacy_options = array(
			'core_framework_free_license',
			'core_framework_bricks_license_key',
			'core_framework_oxygen_license_key',
			'core_framework_figma_license_key',
		);

		foreach ( $legacy_options as $option ) {
			\delete_option( $option );
		}
	}

	/**
	 * Ensure the generated stylesheet exists after an update.
	 *
	 * A PHP OPcache worker can briefly retain the 1.10.4 Helper class while
	 * loading this newer Setup class immediately after the plugin files are
	 * replaced. Keep a self-contained fallback for that mixed-code request.
	 */
	private static function ensure_stylesheet(): bool {
		return StylesheetStorage::ensure();
	}

	/**
	 * Read the version from the installed plugin file.
	 *
	 * This intentionally avoids CORE_FRAMEWORK_VERSION during the first request
	 * after an update because an OPcache worker can briefly retain the previous
	 * bootstrap constant while the new plugin files are already on disk.
	 */
	private static function get_installed_version(): string {
		$plugin_data = get_file_data(
			CORE_FRAMEWORK_ABSOLUTE,
			array( 'version' => 'Version' ),
			'plugin'
		);

		return isset( $plugin_data['version'] ) && '' !== $plugin_data['version']
			? (string) $plugin_data['version']
			: CORE_FRAMEWORK_VERSION;
	}

	/**
	 * Run only once after plugin is activated
	 *
	 * @docs https://developer.wordpress.org/reference/functions/register_activation_hook/
	 */
	public static function activation( bool $network_wide ): void {
		if ( $network_wide ) {
			foreach ( \get_sites() as $site ) {
				\switch_to_blog( $site->blog_id );

				$db_version    = \get_option( 'core_framework_db_version', '1.0' );
				$is_db_upgrade = \version_compare( $db_version, CORE_FRAMEWORK_DB_VER, '<' );

				if ( $is_db_upgrade ) {
					CoreFramework()->db_upgrade();
				}

				CoreFramework()->createSettings();
				CoreFramework()->createTable();
				self::ensure_stylesheet();

				flush_rewrite_rules();

				\restore_current_blog();
			}

			return;
		}

		$db_version    = \get_option( 'core_framework_db_version', '1.0' );
		$is_db_upgrade = \version_compare( $db_version, CORE_FRAMEWORK_DB_VER, '<' );

		if ( $is_db_upgrade ) {
			CoreFramework()->db_upgrade();
		}

		CoreFramework()->createSettings();
		CoreFramework()->createTable();
		self::ensure_stylesheet();

		flush_rewrite_rules();

		set_transient( 'core-framework-update-notice', true, 5 );
	}

	/**
	 * Run only once after plugin is deactivated
	 *
	 * @docs https://developer.wordpress.org/reference/functions/register_deactivation_hook/
	 */
	public static function deactivation(): void {
		\flush_rewrite_rules();
	}

	/**
	 * Run only once after plugin is uninstalled
	 *
	 * @docs https://developer.wordpress.org/reference/functions/register_uninstall_hook/
	 */
	public static function uninstall(): void {
		$is_delete_data = get_option( 'core_framework_main' )['delete_data'] ?? false;

		if ( $is_delete_data ) {
			CoreFrameworkOxygen()->handle_uninstall();
			CoreFrameworkBricks()->handle_uninstall();

			CoreFramework()->removeSettings();
			CoreFramework()->removeTable();
		}
	}

	/**
	 * Restore css file on update and set transient
	 */
	public static function on_plugin_update_completed() {
		$installed_version = self::get_installed_version();

		if ( is_multisite() ) {
			foreach ( \get_sites() as $site ) {
				\switch_to_blog( $site->blog_id );
				self::remove_retired_commercial_options();

				if ( get_transient( 'core_framework_updated' ) !== $installed_version ) {
					if ( self::ensure_stylesheet() ) {
						set_transient( 'core_framework_updated', $installed_version, 0 );
						set_transient( 'core_framework_updated_time', time(), 60 * 60 * 24 );
					}
				}

				\restore_current_blog();
			}
			return;
		}

		self::remove_retired_commercial_options();

		if ( get_transient( 'core_framework_updated' ) === $installed_version ) {
			return;
		}

		if ( self::ensure_stylesheet() ) {
			set_transient( 'core_framework_updated', $installed_version, 0 );
			set_transient( 'core_framework_updated_time', time(), 60 * 60 * 24 );
		}
	}

	public static function on_new_multi_site_blog( object $new_site, $args = array() ): void {
		unset( $args );

		\switch_to_blog( $new_site->blog_id );

		CoreFramework()->createSettings();
		CoreFramework()->createTable();
		self::ensure_stylesheet();

		flush_rewrite_rules();

		\restore_current_blog();
	}
}
