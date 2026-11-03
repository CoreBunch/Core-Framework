<?php

use CoreFramework\App\Oxygen\Functions as OxygenFunctions;
use PHPUnit\Framework\TestCase;

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class OxygenVersionDetectionTest extends TestCase {
	private $directory;

	protected function setUp(): void {
		$this->directory = sys_get_temp_dir() . '/cf-oxygen-' . uniqid();
		mkdir( $this->directory . '/wp-admin/includes', 0777, true );
		mkdir( $this->directory . '/plugins/oxygen', 0777, true );
		define( 'ABSPATH', $this->directory . '/' );
		define( 'WP_PLUGIN_DIR', $this->directory . '/plugins' );
		file_put_contents( WP_PLUGIN_DIR . '/oxygen/plugin.php', '<?php /* Plugin Name: Oxygen */' );
		// Model Oxygen's strict error handler: translated metadata before init is
		// an exception, while an ordinary version read is safe during bootstrap.
		file_put_contents( ABSPATH . 'wp-admin/includes/plugin.php', '<?php
function is_plugin_active( $plugin ) { return $GLOBALS["cf_oxygen_active"]; }
function get_plugin_data( $file, $markup = true, $translate = true ) {
    if ( $translate ) { throw new RuntimeException("Translation loaded before init"); }
    return array("Version" => $GLOBALS["cf_oxygen_version"]);
}
' );
	}

	protected function tearDown(): void {
		unlink( WP_PLUGIN_DIR . '/oxygen/plugin.php' );
		unlink( ABSPATH . 'wp-admin/includes/plugin.php' );
		rmdir( WP_PLUGIN_DIR . '/oxygen' );
		rmdir( WP_PLUGIN_DIR );
		rmdir( ABSPATH . 'wp-admin/includes' );
		rmdir( ABSPATH . 'wp-admin' );
		rmdir( $this->directory );
	}

	/** @dataProvider versions */
	public function testDetectionBeforeInitDoesNotLoadTranslations( string $version, bool $active, bool $expected ): void {
		$GLOBALS['cf_oxygen_version'] = $version;
		$GLOBALS['cf_oxygen_active']  = $active;
		$functions = ( new ReflectionClass( OxygenFunctions::class ) )->newInstanceWithoutConstructor();
		$this->assertSame( $expected, $functions->is_oxygen6() );
	}

	public function versions(): array {
		return array(
			'current' => array( '6.1.0', true, true ),
			'minimum' => array( '6.0.0', true, true ),
			'older' => array( '5.9.0', true, false ),
			'inactive' => array( '6.1.0', false, false ),
		);
	}
}
