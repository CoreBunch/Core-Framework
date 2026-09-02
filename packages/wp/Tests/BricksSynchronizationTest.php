<?php

use CoreFramework\App\Bricks\Functions as BricksFunctions;
use CoreFramework\App\Rest\AllPoints;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

if ( ! class_exists( 'WP_REST_Response' ) ) {
	class WP_REST_Response {
		private $data;

		public function __construct( $data ) {
			$this->data = $data;
		}

		public function get_data() {
			return $this->data;
		}
	}
}

if ( ! class_exists( 'WP_REST_Request' ) ) {
	class WP_REST_Request {
		private $body;

		public function __construct( $body = '' ) {
			$this->body = $body;
		}

		public function get_body() {
			return $this->body;
		}
	}
}

if ( ! function_exists( 'get_option' ) ) {
	function get_option( $option, $default = false ) {
		return array_key_exists( $option, $GLOBALS['cf_test_options'] )
			? $GLOBALS['cf_test_options'][ $option ]
			: $default;
	}
}

if ( ! function_exists( 'update_option' ) ) {
	function update_option( $option, $value, $autoload = null ) {
		$current = get_option( $option, null );
		if ( $current === $value ) {
			return false;
		}

		$GLOBALS['cf_test_options'][ $option ] = $value;
		++$GLOBALS['cf_test_mutations'];
		return true;
	}
}

if ( ! function_exists( 'get_post_types' ) ) {
	function get_post_types( $args = array(), $output = 'names' ) {
		return array(
			'page'            => 'page',
			'bricks_template' => 'bricks_template',
		);
	}
}

if ( ! function_exists( 'get_posts' ) ) {
	function get_posts( $args = array() ) {
		$meta_keys = array_column( array_filter( $args['meta_query'] ?? array(), 'is_array' ), 'key' );
		$post_ids  = array();

		foreach ( $GLOBALS['cf_test_post_meta'] as $post_id => $post_meta ) {
			if ( array_intersect( $meta_keys, array_keys( $post_meta ) ) ) {
				$post_ids[] = $post_id;
			}
		}

		return $post_ids;
	}
}

if ( ! function_exists( 'get_post_meta' ) ) {
	function get_post_meta( $post_id, $key, $single = false ) {
		return $GLOBALS['cf_test_post_meta'][ $post_id ][ $key ] ?? '';
	}
}

if ( ! function_exists( 'update_post_meta' ) ) {
	function update_post_meta( $post_id, $key, $value ) {
		$current = get_post_meta( $post_id, $key, true );
		if ( $current === $value ) {
			return false;
		}

		$GLOBALS['cf_test_post_meta'][ $post_id ][ $key ] = $value;
		++$GLOBALS['cf_test_mutations'];
		return true;
	}
}

if ( ! function_exists( 'update_meta_cache' ) ) {
	function update_meta_cache( $meta_type, $object_ids ) {
		$GLOBALS['cf_test_meta_primes'][] = $object_ids;
		// Captured here so a test can assert the class list is already durable by the
		// time element references are swept.
		$GLOBALS['cf_test_sweep_classes'] = $GLOBALS['cf_test_options']['bricks_global_classes'] ?? null;
		return array();
	}
}

if ( ! function_exists( 'wp_cache_delete' ) ) {
	function wp_cache_delete( $key, $group = '' ) {
		return true;
	}
}

if ( ! function_exists( 'sanitize_title' ) ) {
	function sanitize_title( $title ) {
		$title = strtolower( trim( (string) $title ) );
		$title = preg_replace( '/[^a-z0-9_-]+/', '-', $title );
		return trim( $title, '-' );
	}
}

if ( ! function_exists( 'wp_upload_dir' ) ) {
	function wp_upload_dir() {
		return array(
			'basedir' => 'C:/tmp/uploads',
			'baseurl' => 'https://example.test/uploads',
		);
	}
}

if ( ! function_exists( 'trailingslashit' ) ) {
	function trailingslashit( $value ) {
		return rtrim( $value, '/\\' ) . '/';
	}
}

if ( ! function_exists( 'WP_Filesystem' ) ) {
	function WP_Filesystem() {
		return true;
	}
}

final class CoreFrameworkTestFilesystem {
	public function get_contents( $path ) {
		return $GLOBALS['cf_test_stylesheet'];
	}
}

final class CoreFrameworkTestBuilder {
	public $active;
	public $selectors = array();
	public $variable_refreshes = 0;

	public function __construct( bool $active ) {
		$this->active = $active;
	}

	public function is_bricks(): bool {
		return $this->active;
	}

	public function is_oxygen(): bool {
		return $this->active;
	}

	public function refresh_selectors( $selectors ): void {
		$this->selectors[] = $selectors;
	}

	public function refresh_variables(): void {
		++$this->variable_refreshes;
	}
}

if ( ! function_exists( 'CoreFrameworkBricks' ) ) {
	function CoreFrameworkBricks() {
		return $GLOBALS['cf_test_bricks_builder'];
	}
}

if ( ! function_exists( 'CoreFrameworkOxygen' ) ) {
	function CoreFrameworkOxygen() {
		return $GLOBALS['cf_test_oxygen_builder'];
	}
}

final class BricksSynchronizationTest extends TestCase {
	protected function setUp(): void {
		global $wp_filesystem;

		$GLOBALS['cf_test_options'] = array(
			'core_framework_main' => array(
				'bricks' => true,
				'oxygen' => false,
			),
		);
		$GLOBALS['cf_test_post_meta']      = array();
		$GLOBALS['cf_test_mutations']      = 0;
		$GLOBALS['cf_test_meta_primes']    = array();
		$GLOBALS['cf_test_sweep_classes']  = null;
		$GLOBALS['cf_test_stylesheet']     = '';
		$GLOBALS['cf_test_bricks_builder'] = new CoreFrameworkTestBuilder( true );
		$GLOBALS['cf_test_oxygen_builder'] = new CoreFrameworkTestBuilder( false );
		$wp_filesystem                     = new CoreFrameworkTestFilesystem();
	}

	private function createBricksFunctions(): BricksFunctions {
		$reflection = new ReflectionClass( BricksFunctions::class );
		return $reflection->newInstanceWithoutConstructor();
	}

	private function createRestController(): AllPoints {
		$reflection = new ReflectionClass( AllPoints::class );
		return $reflection->newInstanceWithoutConstructor();
	}

	private function createRequest( array $params ) {
		return new class( $params ) {
			private $params;

			public function __construct( array $params ) {
				$this->params = $params;
			}

			public function get_param( $key ) {
				return $this->params[ $key ] ?? null;
			}
		};
	}

	private function createFigmaRequest( array $body ): WP_REST_Request {
		return new WP_REST_Request( json_encode( $body ) );
	}

	public function testEmptySelectorPayloadStillRefreshesBricksVariables(): void {
		$request = $this->createRequest(
			array(
				'classes'          => '',
				'addonEnableArray' => array(
					array(
						'addon'   => 'bricks',
						'enabled' => true,
					),
				),
			)
		);

		$response = $this->createRestController()->update_classes( $request );

		$this->assertSame( array( array() ), $GLOBALS['cf_test_bricks_builder']->selectors );
		$this->assertSame( 1, $GLOBALS['cf_test_bricks_builder']->variable_refreshes );
		$this->assertSame(
			array(
				'success'         => true,
				'active_builders' => array( 'bricks' ),
			),
			$response->get_data()
		);
	}

	public function testSelectorPayloadIsTrimmedFilteredAndDeduplicated(): void {
		$request = $this->createRequest(
			array(
				'classes'          => array( ' padding ', '', null, 'padding', 'margin' ),
				'addonEnableArray' => array(
					array(
						'addon'   => 'bricks',
						'enabled' => true,
					),
				),
			)
		);

		$this->createRestController()->update_classes( $request );

		$this->assertSame( array( array( 'padding', 'margin' ) ), $GLOBALS['cf_test_bricks_builder']->selectors );
	}

	public function testFigmaEmptySelectorPayloadDoesNotCreateBlankOxygenSelector(): void {
		$GLOBALS['cf_test_options']['core_framework_main'] = array(
			'bricks' => false,
			'oxygen' => true,
		);
		$GLOBALS['cf_test_bricks_builder'] = new CoreFrameworkTestBuilder( false );
		$GLOBALS['cf_test_oxygen_builder'] = new CoreFrameworkTestBuilder( true );

		$response = $this->createRestController()->figma_update_classes(
			$this->createFigmaRequest( array( 'classes' => '' ) )
		);

		$this->assertSame( array( array() ), $GLOBALS['cf_test_oxygen_builder']->selectors );
		$this->assertSame(
			array(
				'success'         => true,
				'active_builders' => array( 'oxygen' ),
			),
			$response->get_data()
		);
	}

	public function testFigmaEmptySelectorPayloadStillRefreshesBricksVariables(): void {
		$response = $this->createRestController()->figma_update_classes(
			$this->createFigmaRequest( array( 'classes' => '' ) )
		);

		$this->assertSame( array( array() ), $GLOBALS['cf_test_bricks_builder']->selectors );
		$this->assertSame( 1, $GLOBALS['cf_test_bricks_builder']->variable_refreshes );
		$this->assertSame(
			array(
				'success'         => true,
				'active_builders' => array( 'bricks' ),
			),
			$response->get_data()
		);
	}

	public function testClassSynchronizationRemovesFinalCoreClassAndOnlyItsReferences(): void {
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ] = array(
			array(
				'id'       => 'user-class',
				'name'     => 'user-class',
				'settings' => array( 'color' => 'red' ),
				'category' => 'custom',
			),
			array(
				'id'       => 'user-owned_c',
				'name'     => 'user-owned',
				'settings' => array(),
				'category' => 'custom',
			),
		);
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ] = array( 'user-class', 'user-owned_c' );
		$GLOBALS['cf_test_post_meta'][10] = array(
			'_bricks_page_content_2' => array(
				array(
					'id'       => 'element-one',
					'settings' => array(
						'_cssGlobalClasses' => array( 'padding_c', 'user-class', 'user-owned_c' ),
						'_cssClasses'       => 'padding_c unrelated-class',
					),
				),
			),
			'_bricks_page_settings' => array(
				'container' => array(
					'_cssGlobalClasses' => 'padding_c user-class',
					'customValue'       => 'padding_c',
				),
			),
			'unrelated_meta' => array(
				'_cssGlobalClasses' => array( 'padding_c' ),
			),
		);

		$functions = $this->createBricksFunctions();
		$functions->refresh_selectors( array( 'padding' ) );

		$classes = $GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ];
		$this->assertSame( array( 'user-class', 'user-owned', 'padding' ), array_column( $classes, 'name' ) );
		$this->assertSame(
			array( 'user-class', 'user-owned_c', 'padding_c' ),
			$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ]
		);

		$state_after_first_sync = array(
			'options'   => $GLOBALS['cf_test_options'],
			'post_meta' => $GLOBALS['cf_test_post_meta'],
			'mutations' => $GLOBALS['cf_test_mutations'],
		);

		$functions->refresh_selectors( array( 'padding', 'padding', '' ) );

		$this->assertSame( $state_after_first_sync['options'], $GLOBALS['cf_test_options'] );
		$this->assertSame( $state_after_first_sync['post_meta'], $GLOBALS['cf_test_post_meta'] );
		$this->assertSame( $state_after_first_sync['mutations'], $GLOBALS['cf_test_mutations'] );

		$functions->refresh_selectors( array() );

		$classes = $GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ];
		$this->assertSame( array( 'user-class', 'user-owned' ), array_column( $classes, 'name' ) );
		$this->assertSame(
			array( 'user-class', 'user-owned_c' ),
			$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ]
		);
		$this->assertSame(
			array( 'user-class', 'user-owned_c' ),
			$GLOBALS['cf_test_post_meta'][10]['_bricks_page_content_2'][0]['settings']['_cssGlobalClasses']
		);
		$this->assertSame(
			'padding_c unrelated-class',
			$GLOBALS['cf_test_post_meta'][10]['_bricks_page_content_2'][0]['settings']['_cssClasses']
		);
		$this->assertSame(
			'user-class',
			$GLOBALS['cf_test_post_meta'][10]['_bricks_page_settings']['container']['_cssGlobalClasses']
		);
		$this->assertSame(
			'padding_c',
			$GLOBALS['cf_test_post_meta'][10]['_bricks_page_settings']['container']['customValue']
		);
		$this->assertSame(
			array( 'padding_c' ),
			$GLOBALS['cf_test_post_meta'][10]['unrelated_meta']['_cssGlobalClasses']
		);

		$state_after_removal = array(
			'options'   => $GLOBALS['cf_test_options'],
			'post_meta' => $GLOBALS['cf_test_post_meta'],
			'mutations' => $GLOBALS['cf_test_mutations'],
		);

		$functions->refresh_selectors( array() );

		$this->assertSame( $state_after_removal['options'], $GLOBALS['cf_test_options'] );
		$this->assertSame( $state_after_removal['post_meta'], $GLOBALS['cf_test_post_meta'] );
		$this->assertSame( $state_after_removal['mutations'], $GLOBALS['cf_test_mutations'] );
	}

	public function testEmptyInputCannotCreateBlankCoreClass(): void {
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ]        = array();
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ] = array();

		$this->createBricksFunctions()->refresh_selectors( array( '', '   ', null, '!!!' ) );

		$this->assertSame( array(), $GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ] );
		$this->assertSame( array(), $GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ] );
	}

	public function testSelectorsThatSanitizeToTheSameIdProduceOneClass(): void {
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ]        = array();
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ] = array();

		// Both names sanitize to 'text-lg'. Bricks keys elements by class id, so emitting
		// two classes sharing 'text-lg_c' would make which one applies arbitrary.
		$this->createBricksFunctions()->refresh_selectors( array( 'text lg', 'text.lg' ) );

		$classes = $GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ];

		$this->assertSame( array( 'text-lg_c' ), array_column( $classes, 'id' ) );
		$this->assertSame(
			array( 'text-lg_c' ),
			$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ]
		);
	}

	public function testReferenceSweepIsBatchedAndRunsAfterClassesArePersisted(): void {
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_CLASSES_OPTION ] = array(
			array(
				'id'       => 'padding_c',
				'name'     => 'padding',
				'settings' => array(),
				'category' => BricksFunctions::CORE_VARIABLE_CATEGORY,
			),
		);
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_LOCKED_CLASSES_OPTION ] = array( 'padding_c' );

		for ( $post_id = 1; $post_id <= 120; $post_id++ ) {
			$GLOBALS['cf_test_post_meta'][ $post_id ] = array(
				'_bricks_page_content_2' => array(
					array(
						'id'       => 'element-' . $post_id,
						'settings' => array( '_cssGlobalClasses' => array( 'padding_c', 'keep-me' ) ),
					),
				),
			);
		}

		$this->createBricksFunctions()->refresh_selectors( array() );

		// 120 posts at a chunk size of 50 is three primed batches. Without priming, each
		// post would cost one uncached read per Bricks meta key instead.
		$this->assertSame(
			array( 50, 50, 20 ),
			array_map( 'count', $GLOBALS['cf_test_meta_primes'] )
		);

		// The sweep is destructive and slow, so the class list must already be durable
		// when it starts. Otherwise an interrupted sweep strips references from elements
		// while the classes still exist, and nothing recovers from that.
		$this->assertSame(
			array(),
			array_column( $GLOBALS['cf_test_sweep_classes'], 'id' ),
			'classes must be persisted before element references are swept'
		);

		$this->assertSame(
			array( 'keep-me' ),
			$GLOBALS['cf_test_post_meta'][120]['_bricks_page_content_2'][0]['settings']['_cssGlobalClasses']
		);
	}

	public function testVariableSynchronizationPreservesNonCoreVariablesAndCategories(): void {
		$GLOBALS['cf_test_stylesheet'] = ':root{--primary:#ffffff;}';
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_VARIABLES_OPTION ] = array(
			array(
				'id'       => 'custom-variable',
				'name'     => 'custom-variable',
				'value'    => '42px',
				'category' => 'custom-category',
			),
			array(
				'id'       => 'old-core-variable',
				'name'     => 'old-core-variable',
				'value'    => 'red',
				'category' => BricksFunctions::CORE_VARIABLE_CATEGORY,
			),
		);
		$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_VARIABLES_CATEGORY ] = array(
			array(
				'id'   => 'custom-category',
				'name' => 'Custom',
			),
			array(
				'id'   => BricksFunctions::CORE_VARIABLE_CATEGORY,
				'name' => 'Core Framework',
			),
		);

		$functions = $this->createBricksFunctions();
		$functions->refresh_variables();

		$this->assertSame(
			array(
				array(
					'id'       => 'custom-variable',
					'name'     => 'custom-variable',
					'value'    => '42px',
					'category' => 'custom-category',
				),
				array(
					'id'       => 'primary',
					'name'     => 'primary',
					'value'    => '#ffffff',
					'category' => BricksFunctions::CORE_VARIABLE_CATEGORY,
				),
			),
			$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_VARIABLES_OPTION ]
		);
		$this->assertSame(
			array(
				array(
					'id'   => 'custom-category',
					'name' => 'Custom',
				),
				array(
					'id'   => BricksFunctions::CORE_VARIABLE_CATEGORY,
					'name' => 'Core Framework',
				),
			),
			$GLOBALS['cf_test_options'][ BricksFunctions::BRICKS_VARIABLES_CATEGORY ]
		);

		$mutations_after_first_sync = $GLOBALS['cf_test_mutations'];
		$functions->refresh_variables();

		$this->assertSame( $mutations_after_first_sync, $GLOBALS['cf_test_mutations'] );
	}
}
