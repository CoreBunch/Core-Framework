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

namespace CoreFramework\Common\Utils\Requirements;

use Micropackage\Requirements\Abstracts\Checker;

class RWFile extends Checker {

	/**
	 * Checker name
	 *
	 * @var string
	 */
	protected $name = 'RWFile';

	/**
	 * Checks if the requirement is met
	 *
	 * @param  string $value Requirement.
	 */
    // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
	public function check( $value ): void {
		if ( $value === true && ( ! function_exists( 'is_readable' ) || ! function_exists( 'file_get_contents' ) ) ) {
			$this->add_error( 'Functions is_readable and file_get_contents are required.' );
		}
	}
}
