<?php

use CoreFramework\App\Oxygen\Functions as OxygenFunctions;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
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

final class CoreFrameworkOxygenTestDatabase {
	public $prefix        = 'wp_';
	public $prepared_args = array();
	public $last_query    = '';

	public function prepare( $query, ...$args ) {
		$this->prepared_args = $args;
		return $query;
	}

	public function get_row( $query ) {
		$this->last_query = $query;
		return (object) array(
			'data' => json_encode( $GLOBALS['cf_test_preset'] ),
		);
	}
}

final class OxygenCustomFontsTest extends TestCase {
	protected function setUp(): void {
		global $wpdb;

		$GLOBALS['cf_test_options'] = array(
			'core_framework_main' => array(
				'selected_id'   => 'preset-id',
				'disable_fonts' => false,
			),
		);
		$GLOBALS['cf_test_preset'] = $this->createPreset( array() );
		$wpdb                      = new CoreFrameworkOxygenTestDatabase();
	}

	private function createPreset( array $families ): array {
		return array(
			'modulesData' => array(
				'FONTS' => array(
					'fonts' => array_map(
						fn( string $family ): array => array( 'family' => $family ),
						$families
					),
				),
			),
		);
	}

	private function renderCustomFonts( array $families ): string {
		$GLOBALS['cf_test_preset'] = $this->createPreset( $families );

		$reflection = new ReflectionClass( OxygenFunctions::class );
		$functions  = $reflection->newInstanceWithoutConstructor();

		ob_start();
		try {
			$functions->elegant_custom_fonts();
			return ob_get_clean();
		} catch ( Throwable $throwable ) {
			ob_end_clean();
			throw $throwable;
		}
	}

	private function parseNgInitAttribute( string $hook_output ): string {
		$document           = new DOMDocument();
		$previous_use_errors = libxml_use_internal_errors( true );

		$document->loadHTML(
			'<div ng-init="' . $hook_output . '"></div>',
			LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
		);

		libxml_clear_errors();
		libxml_use_internal_errors( $previous_use_errors );

		return $document->getElementsByTagName( 'div' )->item( 0 )->getAttribute( 'ng-init' );
	}

	public function testFontFamiliesAreEscapedForOxygenNgInitAttribute(): void {
		$families = array( 'ABeeZee', 'IBM Plex Sans' );
		$output   = $this->renderCustomFonts( $families );

		$this->assertSame(
			'elegantCustomFonts=[&quot;ABeeZee&quot;,&quot;IBM Plex Sans&quot;];',
			$output
		);
		$this->assertSame(
			'elegantCustomFonts=' . json_encode( $families ) . ';',
			$this->parseNgInitAttribute( $output )
		);
	}

	public function testSpecialCharactersRoundTripThroughHtmlAttribute(): void {
		$families = array(
			'A &quot; B',
			'O"Brien & Sons',
			'<script>alert(1)</script>',
		);
		$output = $this->renderCustomFonts( $families );

		$this->assertStringNotContainsString( '"', $output );
		$this->assertStringContainsString( '&amp;quot;', $output );
		$this->assertStringContainsString( '&lt;script&gt;', $output );
		$this->assertSame(
			'elegantCustomFonts=' . json_encode( $families ) . ';',
			$this->parseNgInitAttribute( $output )
		);
	}

	public function testEmptyFontListRemainsValid(): void {
		$output = $this->renderCustomFonts( array() );

		$this->assertSame( 'elegantCustomFonts=[];', $output );
		$this->assertSame( 'elegantCustomFonts=[];', $this->parseNgInitAttribute( $output ) );
	}

	public function testDisabledFontIntegrationEmitsNothing(): void {
		$GLOBALS['cf_test_options']['core_framework_main']['disable_fonts'] = true;

		$this->assertSame( '', $this->renderCustomFonts( array( 'ABeeZee' ) ) );
	}
}
