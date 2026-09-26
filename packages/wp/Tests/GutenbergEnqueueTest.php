<?php

use CoreFramework\App\Gutenberg\Functions as GutenbergFunctions;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

if ( ! defined( 'CORE_FRAMEWORK_ABSOLUTE' ) ) {
	define( 'CORE_FRAMEWORK_ABSOLUTE', dirname( __DIR__ ) . '/core-framework.php' );
}

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $hook_name, $value ) {
		return $value;
	}
}

if ( ! function_exists( 'get_file_data' ) ) {
	function get_file_data( $file, $headers, $context = '' ) {
		return array_merge( array_fill_keys( array_keys( $headers ), '' ), array( 'version' => '0.0.0-test' ) );
	}
}

if ( ! function_exists( 'plugin_dir_path' ) ) {
	function plugin_dir_path( $file ) {
		return rtrim( dirname( $file ), '/\\' ) . '/';
	}
}

if ( ! function_exists( 'plugins_url' ) ) {
	function plugins_url( $path = '', $plugin = '' ) {
		return 'https://example.test/wp-content/plugins/core-framework/' . ltrim( $path, '/' );
	}
}

if ( ! function_exists( 'wp_enqueue_script' ) ) {
	function wp_enqueue_script( $handle, $src = '', $deps = array(), $ver = false, $args = array() ) {
		$GLOBALS['cf_test_enqueued_scripts'][ $handle ] = array(
			'src'  => $src,
			'deps' => $deps,
			'ver'  => $ver,
		);
	}
}

final class CoreFrameworkGutenbergEnqueueTestPlugin {
	public function enqueue_core_framework_connector(): void {}

	public function isDev(): bool {
		return false;
	}
}

if ( ! function_exists( 'CoreFramework' ) ) {
	function CoreFramework() {
		return new CoreFrameworkGutenbergEnqueueTestPlugin();
	}
}

final class GutenbergEnqueueTest extends TestCase {
	private const HANDLE = 'core-framework-gutenberg-plugin';

	protected function setUp(): void {
		$GLOBALS['cf_test_enqueued_scripts'] = array();
	}

	private function enqueue(): array {
		( new GutenbergFunctions() )->enqueue_scripts();

		$this->assertArrayHasKey( self::HANDLE, $GLOBALS['cf_test_enqueued_scripts'] );

		return $GLOBALS['cf_test_enqueued_scripts'][ self::HANDLE ];
	}

	private function manifest(): array {
		return require dirname( __DIR__ ) . '/gutenberg/index.asset.php';
	}

	public function test_bundle_declares_the_jsx_runtime_it_calls(): void {
		$bundle = file_get_contents( dirname( __DIR__ ) . '/gutenberg/index.js' );

		$this->assertStringContainsString( 'ReactJSXRuntime', $bundle );
		$this->assertContains( 'react-jsx-runtime', $this->manifest()['dependencies'] );
	}

	public function test_enqueue_depends_on_the_jsx_runtime(): void {
		$this->assertContains( 'react-jsx-runtime', $this->enqueue()['deps'] );
	}

	public function test_enqueue_uses_the_shipped_asset_manifest(): void {
		$script   = $this->enqueue();
		$manifest = $this->manifest();

		$this->assertSame( $manifest['dependencies'], $script['deps'] );
		$this->assertSame( $manifest['version'], $script['ver'] );
	}
}
