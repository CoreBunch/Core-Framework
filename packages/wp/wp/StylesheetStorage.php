<?php

namespace CoreFramework;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores generated CSS in the current site's WordPress uploads directory.
 *
 * This class was introduced with Core Framework 2.0 so it cannot collide with
 * an opcode-cached 1.10.4 Helper class during an in-place plugin update.
 */
final class StylesheetStorage {
	/**
	 * Get the generated stylesheet directory details.
	 *
	 * @return array{path: string, url: string}
	 */
	private static function get_directory(): array {
		$uploads = wp_upload_dir();

		return array(
			'path' => trailingslashit( $uploads['basedir'] ) . 'core-framework/css',
			'url'  => trailingslashit( $uploads['baseurl'] ) . 'core-framework/css',
		);
	}

	/**
	 * Get the stylesheet path used by versions through 1.10.4.
	 */
	private static function get_legacy_path(): string {
		$filename = is_multisite()
			? 'core_framework_' . get_current_blog_id() . '.css'
			: 'core_framework.css';

		return plugin_dir_path( CORE_FRAMEWORK_ABSOLUTE ) . 'assets/public/css/' . $filename;
	}

	/**
	 * Initialize the WordPress filesystem API.
	 *
	 * @return \WP_Filesystem_Base|null
	 */
	private static function get_filesystem() {
		global $wp_filesystem;

		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! WP_Filesystem() || ! is_object( $wp_filesystem ) ) {
			return null;
		}

		return $wp_filesystem;
	}

	/**
	 * Get the public stylesheet URL for the current site.
	 */
	public static function get_url(): string {
		$directory = self::get_directory();

		return trailingslashit( $directory['url'] ) . 'core_framework.css';
	}

	/**
	 * Get the stylesheet filesystem path for the current site.
	 */
	public static function get_path(): string {
		$directory = self::get_directory();

		return trailingslashit( $directory['path'] ) . 'core_framework.css';
	}

	/**
	 * Persist generated CSS.
	 *
	 * @return int|false Number of bytes saved, or false on failure.
	 */
	public static function write( string $css ) {
		$filesystem = self::get_filesystem();

		if ( null === $filesystem ) {
			return false;
		}

		$directory = self::get_directory();
		if ( ! $filesystem->is_dir( $directory['path'] ) && ! wp_mkdir_p( $directory['path'] ) ) {
			return false;
		}

		$written = $filesystem->put_contents(
			self::get_path(),
			$css,
			defined( 'FS_CHMOD_FILE' ) ? FS_CHMOD_FILE : 0644
		);

		return $written ? strlen( $css ) : false;
	}

	/**
	 * Read the generated stylesheet.
	 *
	 * @return string|false
	 */
	public static function read() {
		$filesystem = self::get_filesystem();

		return null === $filesystem ? false : $filesystem->get_contents( self::get_path() );
	}

	/**
	 * Ensure a stylesheet exists, migrating legacy CSS or the database backup.
	 */
	public static function ensure(): bool {
		$filesystem      = self::get_filesystem();
		$stylesheet_path = self::get_path();

		if ( null === $filesystem ) {
			return false;
		}

		$stylesheet_exists = $filesystem->is_file( $stylesheet_path );
		$stylesheet_size   = $stylesheet_exists ? $filesystem->size( $stylesheet_path ) : false;

		if ( false !== $stylesheet_size && $stylesheet_size > 0 ) {
			return true;
		}

		$css         = '';
		$legacy_path = self::get_legacy_path();

		if ( $filesystem->is_file( $legacy_path ) && $filesystem->size( $legacy_path ) > 0 ) {
			$legacy_css = $filesystem->get_contents( $legacy_path );
			$css        = false !== $legacy_css ? $legacy_css : '';
		}

		if ( '' === $css ) {
			$css = (string) get_option( 'core_framework_selected_preset_backup', '' );
		}

		if ( '' === $css && $stylesheet_exists ) {
			return true;
		}

		return false !== self::write( $css );
	}

	/**
	 * Get a cache-busting version for the generated stylesheet.
	 */
	public static function get_version(): string {
		$stylesheet_path = self::get_path();

		if ( is_file( $stylesheet_path ) ) {
			$version = filemtime( $stylesheet_path );

			if ( false !== $version ) {
				return (string) $version;
			}
		}

		return CORE_FRAMEWORK_VERSION;
	}
}
