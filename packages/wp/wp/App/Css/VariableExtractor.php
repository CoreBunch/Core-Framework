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

declare(strict_types=1);

namespace CoreFramework\App\Css;

use CoreFramework\Common\Abstracts\Base;
use CoreFramework\Common\Functions;

/**
 * Class VariableExtractor
 *
 * @package CoreFramework\App\Css
 * @since 0.0.1
 */
class VariableExtractor extends Base {

	/**
	 * Current framework stylesheet
	 */
	private $stylesheet = '';

	/**
	 * Core Framework Functions
	 *
	 * @var Functions
	 */
	private $functions;

	public function __construct( $stylesheet = '' ) {
		$this->stylesheet = $stylesheet;

		$this->functions = new Functions();
	}

	public function init() {}

	/**
	 * Get variables from stylesheet
	 *
	 * @since 0.0.1
	 * @return array
	 */
	public function getVariablesFromStyleSheet() {
		if ( empty( $this->stylesheet ) ) {
			return array();
		}

		$variables    = array();
		$rootPattern  = '/:root[^{]*\{([^}]+)\}/';
		$mediaPattern = '/@media[^{]+\{[^}]*:root[^{]*\{([^}]+)\}/';

		if ( preg_match( $rootPattern, $this->stylesheet, $rootMatch ) ) {
			$this->extractVariables( $rootMatch[1], $variables );
		}

		preg_match_all( $mediaPattern, $this->stylesheet, $mediaMatches, PREG_SET_ORDER );
		foreach ( $mediaMatches as $mediaMatch ) {
			$this->extractVariables( $mediaMatch[1], $variables, true );
		}

		return array_values( $variables );
	}

	/**
	 * Extract variables from a CSS block
	 *
	 * @param string $block
	 * @param array  &$variables
	 * @param bool   $isNested
	 */
	private function extractVariables( $block, &$variables, $isNested = false ) {
		preg_match_all( '/--([^:]+):\s*([^;]+);/', $block, $varMatches, PREG_SET_ORDER );
		foreach ( $varMatches as $varMatch ) {
			$name  = trim( $varMatch[1] );
			$value = trim( $varMatch[2] );

			if ( ! array_key_exists( $name, $variables ) ) {
				$variables[ $name ] = array(
					'name'  => $name,
					'value' => $isNested ? 'var(--' . $this->functions->str_replace_first( '--', '', $name ) . ')' : $value,
				);
			}
		}
	}
}
