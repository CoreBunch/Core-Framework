<?php

use CoreFramework\Config\Plugin;
use PHPUnit\Framework\TestCase;

final class PluginHeadersTest extends TestCase {
	/**
	 * Reads a header the way WordPress's get_file_data() does.
	 */
	private function header( string $file, string $name ): string {
		$contents = file_get_contents( dirname( __DIR__ ) . '/' . $file );

		if ( ! preg_match( '/^(?:[ \t]*<\?php)?[ \t\/*#@]*' . preg_quote( $name, '/' ) . ':(.*)$/mi', $contents, $match ) ) {
			return '';
		}

		return trim( preg_replace( '/\s*(?:\*\/|\?>).*/', '', $match[1] ) );
	}

	public function test_every_header_the_plugin_reads_is_declared(): void {
		foreach ( Plugin::HEADERS as $key => $name ) {
			$this->assertNotSame( '', $this->header( 'core-framework.php', $name ), "core-framework.php does not declare \"{$name}\", so Plugin '{$key}' is empty." );
		}
	}

	public function test_requirement_headers_match_the_readme(): void {
		$this->assertSame(
			$this->header( 'readme.txt', 'Requires at least' ),
			$this->header( 'core-framework.php', Plugin::HEADERS['required-wp'] )
		);
		$this->assertSame(
			$this->header( 'readme.txt', 'Requires PHP' ),
			$this->header( 'core-framework.php', Plugin::HEADERS['required-php'] )
		);
	}
}
