<?php

use PHPUnit\Framework\TestCase;
use CoreFramework\App\Bricks\Functions as BricksFunctions;

final class BricksColorEntryTest extends TestCase {

	private function createColorEntry( string $id, string $name, string $raw, string $value ): array {
		$method = new ReflectionMethod( BricksFunctions::class, 'create_color_entry' );
		$method->setAccessible( true );

		return $method->invoke( null, $id, $name, $raw, $value );
	}

	public function testVariableColorUsesOnlyRawValue(): void {
		$entry = $this->createColorEntry( 'neutral', 'Neutral', 'var(--neutral)', '#444444' );

		$this->assertSame(
			array(
				'id'   => 'neutral',
				'name' => 'Neutral',
				'raw'  => 'var(--neutral)',
			),
			$entry
		);
		$this->assertArrayNotHasKey( 'hex', $entry );
	}

	public function testLiteralHexColorUsesHexValue(): void {
		$entry = $this->createColorEntry( 'neutral', 'Neutral', '#444444', '#444444' );

		$this->assertSame(
			array(
				'id'   => 'neutral',
				'name' => 'Neutral',
				'hex'  => '#444444',
			),
			$entry
		);
		$this->assertArrayNotHasKey( 'raw', $entry );
	}

	public function testLiteralHslColorUsesHslValue(): void {
		$entry = $this->createColorEntry( 'accent', 'Accent', 'hsl(0, 0%, 27%)', 'hsl(0, 0%, 27%)' );

		$this->assertSame(
			array(
				'id'   => 'accent',
				'name' => 'Accent',
				'hsl'  => 'hsl(0, 0%, 27%)',
			),
			$entry
		);
	}

	public function testLiteralColorFallsBackToRawWhenResolvedValueIsInvalid(): void {
		$entry = $this->createColorEntry( 'neutral', 'Neutral', '#444444', 'not-a-color' );

		$this->assertSame(
			array(
				'id'   => 'neutral',
				'name' => 'Neutral',
				'hex'  => '#444444',
			),
			$entry
		);
	}
}
