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

namespace CoreFramework\Common\Utils;

use CoreFramework\Config\Plugin;

/**
 * Class Vite
 *
 * @package CoreFramework\App\Backend
 * @since 0.0.0
 */
class Vite {

	/**
	 * Enqueue Vita files
	 *
	 * @since 0.0.0
	 */
	public static function getPluginData(): array {
		return Plugin::init()->data(); // CoreFramework()->getData()->version
	}

	private static function getDevFullPath(): string {
		return 'https://' . CoreFramework()->getDevURL() . ':5173/';
	}

	public static function useVite( string $script = '', array $args = array() ) {
		if ( ! $script ) {
			return;
		}

		$has_js    = $args['js'];
		$has_style = $args['css'];

		$has_js && self::jsPreloadImports( $script );
		$has_style && self::cssTag( $script );
		$has_js && self::enqueue( $script, $args['js_dep'], $args['in_footer'] );
		return 'module/' . CORE_FRAMEWORK_ASSETS_PREFIX . $script;
	}

	/**
	 * Add preload links for vite files
	 *
	 * @param string $entry
	 * @return void
	 */
	private static function jsPreloadImports( string $entry ): void {
		unset( $entry );

		/**
		 * Allows HMR to work properly. Only needed in development.
		 */
		if ( self::getPluginData()['development'] ) {
			\add_action(
				'wp_print_scripts',
				function (): void {
					$url             = self::getDevFullPath();
					$refresh_runtime = \wp_json_encode( $url . '@react-refresh' );
					$preamble        = "import RefreshRuntime from {$refresh_runtime};\n"
						. "window.RefreshRuntime = RefreshRuntime;\n"
						. "RefreshRuntime.injectIntoGlobalHook(window);\n"
						. "window.\$RefreshReg\$ = () => {};\n"
						. "window.\$RefreshSig\$ = () => (type) => type;\n"
						. 'window.__vite_plugin_react_preamble_installed__ = true;';

					\wp_print_inline_script_tag( $preamble, array( 'type' => 'module' ) );
					\wp_print_script_tag(
						array(
							'type' => 'module',
							'src'  => \esc_url( $url . '@vite/client' ),
						)
					);
				},
				99
			);
		}
	}

	private static function cssTag( string $entry ): string {
		// not needed on dev, it's inject by Vite
		// prettier-ignore
		if ( self::getPluginData()['development'] ) {
			return '';
		}

		$tags = '';
		foreach ( self::cssUrls( $entry ) as $url ) {
			\wp_enqueue_style(
				CORE_FRAMEWORK_ASSETS_PREFIX . $entry,
				$url,
				array(),
				self::getPluginData()['version']
			);
		}

		return $tags;
	}

	private static function enqueue( $entry, $deps, $in_footer ) {
		$url = self::getPluginData()['development'] ? self::getDevFullPath() . $entry : self::assetUrl( $entry );

		// prettier-ignore
		if ( ! $url ) {
			return '';
		}

		\wp_enqueue_script(
			'module/' . CORE_FRAMEWORK_ASSETS_PREFIX . $entry,
			$url,
			$deps,
			self::getPluginData()['development'] ?? self::getPluginData()['version'],
			$in_footer
		);
	}

	// ? Helpers to locate files

	private static function getManifest(): array {
		$fName = '.vite/manifest.json';
		$fPath = CORE_FRAMEWORK_DIR_ROOT . 'dist/' . $fName;
		if ( file_exists( $fPath ) ) {
			$content = file_get_contents( $fPath );
			return json_decode( $content, true, 512, JSON_THROW_ON_ERROR );
		}

		return array();
	}

	private static function assetUrl( string $entry ): string {
		$manifest = self::getManifest();
		return isset( $manifest[ $entry ] )
		? CORE_FRAMEWORK_DIR_URL . 'dist/' . $manifest[ $entry ]['file']
		: CORE_FRAMEWORK_DIR_URL . 'dist/' . $entry;
	}

	private static function getPublicURLBase() {
		// return IS_DEVELOPMENT ? '/dist/' : CORE_FRAMEWORK_DIR_URL . 'dist/';
		return self::getPluginData()['development'] ? '/' : CORE_FRAMEWORK_DIR_URL . 'dist/';
	}

	private static function importsUrls( string $entry ): array {
		$urls     = array();
		$manifest = self::getManifest();

		if ( ! empty( $manifest[ $entry ]['imports'] ) ) {
			foreach ( $manifest[ $entry ]['imports'] as $imports ) {
				$urls[] = self::getPublicURLBase() . $manifest[ $imports ]['file'];
			}
		}

		return $urls;
	}

	private static function cssUrls( string $entry ): array {
		$urls     = array();
		$manifest = self::getManifest();

		if ( ! empty( $manifest[ $entry ]['css'] ) ) {
			foreach ( $manifest[ $entry ]['css'] as $file ) {
				$urls[] = self::getPublicURLBase() . $file;
			}
		}

		return $urls;
	}
}
