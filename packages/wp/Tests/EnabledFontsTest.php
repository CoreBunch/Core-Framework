<?php

use CoreFramework\App\Bricks\Bricks;
use CoreFramework\App\Oxygen\Functions as OxygenFunctions;
use CoreFramework\Helper;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

if ( ! defined( 'CORE_FRAMEWORK_VERSION' ) ) {
	define( 'CORE_FRAMEWORK_VERSION', 'test' );
}

if ( ! function_exists( 'get_option' ) ) {
	function get_option( $option, $default = false ) {
		return array_key_exists( $option, $GLOBALS['cf_test_options'] )
			? $GLOBALS['cf_test_options'][ $option ]
			: $default;
	}
}

if ( ! function_exists( 'esc_sql' ) ) {
	function esc_sql( $value ) {
		return $value;
	}
}

if ( ! function_exists( 'wp_json_encode' ) ) {
	function wp_json_encode( $value, $flags = 0, $depth = 512 ) {
		return json_encode( $value, $flags, $depth );
	}
}

if ( ! function_exists( 'wp_register_style' ) ) {
	function wp_register_style() {
		return true;
	}
}

if ( ! function_exists( 'wp_enqueue_style' ) ) {
	function wp_enqueue_style() {
		return true;
	}
}

if ( ! function_exists( 'wp_add_inline_style' ) ) {
	function wp_add_inline_style( $handle, $css ) {
		$GLOBALS['cf_test_inline_styles'][ $handle ] = $css;
		return true;
	}
}

final class CoreFrameworkEnabledFontsTestDatabase {
	public $prefix = 'wp_';

	public function prepare( $query ) {
		return $query;
	}

	public function get_row() {
		return (object) array(
			'data' => json_encode( $GLOBALS['cf_test_preset'] ),
		);
	}
}

final class EnabledFontsTest extends TestCase {
	protected function setUp(): void {
		global $wpdb;

		$GLOBALS['cf_test_options'] = array(
			'core_framework_main' => array(
				'selected_id'   => 'preset-id',
				'disable_fonts' => false,
			),
		);
		$GLOBALS['cf_test_inline_styles'] = array();
		$GLOBALS['cf_test_preset']        = array(
			'modulesData' => array(
				'FONTS' => array(
					'fonts' => array(
						array(
							'family'     => 'Enabled Font',
							'enable'     => true,
							'cssPreview' => '.enabled-font { font-family: "Enabled Font"; }',
						),
						array(
							'family'     => 'Disabled Font',
							'enable'     => false,
							'cssPreview' => '.disabled-font { font-family: "Disabled Font"; }',
						),
					),
				),
			),
		);
		$wpdb = new CoreFrameworkEnabledFontsTestDatabase();
	}

	public function testHelperReturnsOnlyEnabledFonts(): void {
		$fonts = ( new Helper() )->getEnabledFonts();

		$this->assertCount( 1, $fonts );
		$this->assertSame( 'Enabled Font', $fonts[0]['family'] );
	}

	public function testOxygenDropdownReceivesOnlyEnabledFontFamilies(): void {
		$reflection = new ReflectionClass( OxygenFunctions::class );
		$functions  = $reflection->newInstanceWithoutConstructor();

		ob_start();
		$functions->elegant_custom_fonts();
		$output = html_entity_decode( ob_get_clean(), ENT_QUOTES );

		$this->assertSame( 'elegantCustomFonts=["Enabled Font"];', $output );
	}

	public function testOxygenEnqueuesCssForEnabledFontsOnly(): void {
		$reflection = new ReflectionClass( OxygenFunctions::class );
		$functions  = $reflection->newInstanceWithoutConstructor();

		$functions->add_corresponding_css();

		$this->assertInlineCssContainsOnlyEnabledFont( 'core-framework-fonts-inline' );
	}

	public function testBricksEnqueuesCssForEnabledFontsOnly(): void {
		$reflection = new ReflectionClass( Bricks::class );
		$bricks     = $reflection->newInstanceWithoutConstructor();

		$bricks->add_corresponding_css();

		$this->assertInlineCssContainsOnlyEnabledFont( 'core-framework-inline' );
	}

	private function assertInlineCssContainsOnlyEnabledFont( string $handle ): void {
		$css = $GLOBALS['cf_test_inline_styles'][ $handle ];

		$this->assertStringContainsString( '.enabled-font', $css );
		$this->assertStringNotContainsString( '.disabled-font', $css );
	}
}
