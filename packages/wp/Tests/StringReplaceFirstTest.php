<?php

use PHPUnit\Framework\TestCase;
use CoreFramework\Common\Functions;

final class StringReplaceFirstTest extends TestCase {

		/**
		 * @covers Functions::str_replace_first
		 */
	public function testReplaceFirst() {
				$functions = new Functions();

		$this->assertEquals(
			$functions->str_replace_first( '--', '', '--foo--' ),
			'foo--'
		);
	}

		/**
		 * @covers Functions::str_replace_first
		 */
	public function testReplaceFirstWithEmpty() {
		$functions = new Functions();

		$this->assertEquals(
			$functions->str_replace_first( '--', '', '--' ),
			''
		);
	}

		/**
		 * @covers Functions::str_replace_first
		 */
	public function testReplaceFirstWithEmptyNeedle() {
		$functions = new Functions();

		$this->assertEquals(
			$functions->str_replace_first( '', '', '--foo--' ),
			'--foo--'
		);
	}

		/**
		 * @covers Functions::str_replace_first
		 */
	public function testReplaceFirstWithEmptyHaystack() {
		$functions = new Functions();

		$this->assertEquals(
			$functions->str_replace_first( '--', '', '' ),
			''
		);
	}
}
