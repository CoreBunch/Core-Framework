<?php
/**
 * CoreFramework
 *
 * @package   CoreFramework
 * @author    Core Framework <hello@coreframework.com>
 * @copyright 2023 Core Framework
 * @license   MIT
 * @link      https://coreframework.com
 */

declare (strict_types = 1);

namespace CoreFramework\Compatibility\Siteground;

/**
 * Class Example
 *
 * @package CoreFramework\Compatibility\Siteground
 * @since 0.0.0
 */
class Example {

	/**
	 * Initialize the class.
	 *
	 * @since 0.0.0
	 */
	public function init(): void {
		/**
		 * Add 3rd party compatibility code here.
		 * Compatibility classes instantiates after anything else
		 *
		 * @see Scaffold::__construct
		 */
		\add_filter( 'sgo_css_combine_exclude', array( $this, 'excludeCssCombine' ) );
	}

	/**
	 * Siteground optimizer compatibility.
	 *
	 * @since 0.0.0
	 */
	public function excludeCssCombine( array $exclude_list ): array {
		$exclude_list[] = 'plugin-name-frontend-css';
		return $exclude_list;
	}
}
