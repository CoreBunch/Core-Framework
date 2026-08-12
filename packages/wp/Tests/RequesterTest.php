<?php

use CoreFramework\Common\Traits\Requester;
use PHPUnit\Framework\TestCase;

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $hook_name, $value ) {
		return $value;
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $value ) {
		return is_string( $value ) ? $value : '';
	}
}

if ( ! function_exists( 'wp_unslash' ) ) {
	function wp_unslash( $value ) {
		return $value;
	}
}

final class RequesterTest extends TestCase {
	private $requester;
	private $original_request_uri;

	protected function setUp(): void {
		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? null;
		$this->requester = new class() {
			use Requester;
		};
	}

	protected function tearDown(): void {
		if ( null === $this->original_request_uri ) {
			unset( $_SERVER['REQUEST_URI'] );
			return;
		}

		$_SERVER['REQUEST_URI'] = $this->original_request_uri;
	}

	public function testPrettyPermalinkRestRequest(): void {
		$_SERVER['REQUEST_URI'] = '/wp-json/core-framework/v2/update-main';

		$this->assertTrue( $this->requester->isRest() );
	}

	public function testPlainPermalinkRestRequest(): void {
		$_SERVER['REQUEST_URI'] = '/?rest_route=/core-framework/v2/update-main';

		$this->assertTrue( $this->requester->isRest() );
	}

	public function testUnrelatedQueryStringIsNotRestRequest(): void {
		$_SERVER['REQUEST_URI'] = '/?redirect_to=rest_route%3Dexample';

		$this->assertFalse( $this->requester->isRest() );
	}
}
