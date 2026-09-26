<?php

use CoreFramework\Helper;
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

if ( ! function_exists( 'wp_parse_args' ) ) {
	function wp_parse_args( $args, $defaults = array() ) {
		return array_merge( $defaults, $args );
	}
}

final class CoreFrameworkHelperColorVariantsTestDatabase {
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

final class HelperColorVariantsTest extends TestCase {
	protected function setUp(): void {
		global $wpdb;

		$GLOBALS['cf_test_options'] = array(
			'core_framework_main' => array(
				'selected_id' => 'preset-id',
			),
		);
		$GLOBALS['cf_test_preset']  = array(
			'styleSheetData' => array(),
			'modulesData'    => array(
				'COLOR_SYSTEM' => array(
					'groups' => array(
						array(
							'name'   => 'Brand',
							'colors' => array(
								array(
									'name'     => 'secondary',
									'isShades' => false,
									'shades'   => array(
										array(
											'name'  => 'secondary-d-4',
											'value' => '#000000',
										),
									),
									'isTints'  => false,
									'tints'    => array(
										array(
											'name'  => 'secondary-l-1',
											'value' => '#eeeeee',
										),
									),
									'gen'      => array( 'bg', 'text', 'border' ),
								),
								array(
									'name'     => 'primary',
									'isShades' => true,
									'shades'   => array(
										array(
											'name'  => 'primary-d-1',
											'value' => '#111111',
										),
									),
									'isTints'  => true,
									'tints'    => array(
										array(
											'name'  => 'primary-l-1',
											'value' => '#dddddd',
										),
									),
									'gen'      => array( 'bg', 'text', 'border' ),
								),
								array(
									'name'   => 'neutral',
									'shades' => array(
										array(
											'name'  => 'neutral-d-1',
											'value' => '#222222',
										),
									),
									'tints'  => array(
										array(
											'name'  => 'neutral-l-1',
											'value' => '#cccccc',
										),
									),
									'gen'    => array( 'bg', 'text', 'border' ),
								),
							),
						),
					),
				),
			),
		);
		$wpdb                         = new CoreFrameworkHelperColorVariantsTestDatabase();
	}

	public function testVariablesIncludeOnlyEnabledColorVariants(): void {
		$variables = ( new Helper() )->getVariables(
			array(
				'group_by_category' => false,
			)
		);

		$this->assertSame(
			array( 'secondary', 'primary', 'primary-d-1', 'primary-l-1', 'neutral' ),
			$variables
		);
	}

	public function testGroupedVariablesIncludeOnlyEnabledColorVariants(): void {
		$variables = ( new Helper() )->getVariablesGroupedByCategoriesAndGroups();

		$this->assertSame(
			array( 'secondary', 'primary', 'primary-d-1', 'primary-l-1', 'neutral' ),
			$variables['colorStyles']['Brand']
		);
	}

	public function testClassNamesIncludeOnlyEnabledColorVariants(): void {
		$class_names = ( new Helper() )->getClassNames(
			array(
				'group_by_category' => false,
			)
		);

		$this->assertContains( 'bg-primary-d-1', $class_names );
		$this->assertContains( 'text-primary-l-1', $class_names );
		$this->assertNotContains( 'bg-secondary-d-4', $class_names );
		$this->assertNotContains( 'text-secondary-l-1', $class_names );
		$this->assertNotContains( 'border-neutral-d-1', $class_names );
		$this->assertNotContains( 'border-neutral-l-1', $class_names );
	}

	public function testGroupedClassNamesIncludeOnlyEnabledColorVariants(): void {
		$class_names = ( new Helper() )->getClassNamesGroupedByCategoriesAndGroups();

		$this->assertContains( 'bg-primary-d-1', $class_names['colorStyles']['Backgrounds'] );
		$this->assertContains( 'text-primary-l-1', $class_names['colorStyles']['Text Colors'] );
		$this->assertNotContains( 'bg-secondary-d-4', $class_names['colorStyles']['Backgrounds'] );
		$this->assertNotContains( 'text-secondary-l-1', $class_names['colorStyles']['Text Colors'] );
		$this->assertNotContains( 'border-neutral-d-1', $class_names['colorStyles']['Border Colors'] );
		$this->assertNotContains( 'border-neutral-l-1', $class_names['colorStyles']['Border Colors'] );
	}
}
