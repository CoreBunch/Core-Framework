<?php

use PHPUnit\Framework\TestCase;
use CoreFramework\App\Css\VariableExtractor;

final class VariableExtractorTest extends TestCase {

	/**
	 * @covers Functions::str_replace_first
	 */
	public function testGetVariablesFromStyleSheetFullPreset(): void {
		$css       = 'html.cf-theme-dark{color-scheme:dark;}:root,:root.cf-theme-dark .theme-inverted{--primary:hsla(238,100%,62%,1);--space-4xs:clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem);--space-3xs:clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem);--space-2xs:clamp(0.51rem,calc(0.16vw + 0.48rem),0.62rem);--space-xs:clamp(0.64rem,calc(0.35vw + 0.57rem),0.88rem);--space-s:clamp(0.8rem,calc(0.65vw + 0.67rem),1.24rem);--space-m:clamp(1rem,calc(1.11vw + 0.78rem),1.75rem);--space-l:clamp(1.25rem,calc(1.81vw + 0.89rem),2.47rem);--space-xl:clamp(1.56rem,calc(2.87vw + 0.99rem),3.5rem);--space-2xl:clamp(1.95rem,calc(4.44vw + 1.07rem),4.95rem);--space-3xl:clamp(2.44rem,calc(6.75vw + 1.09rem),7rem);--space-4xl:clamp(3.05rem,calc(10.13vw + 1.02rem),9.89rem);--text-4xl:clamp(1rem,calc(0.19vw + 0.96rem),1.13rem);--red:green;--radius-xs:clamp(0.25rem,calc(0vw + 0.25rem),0.25rem);--radius-s:clamp(0.38rem,calc(-0.19vw + 0.54rem),0.5rem);--radius-m:clamp(0.63rem,calc(-0.19vw + 0.79rem),0.75rem);--radius-l:clamp(1rem,calc(-0.37vw + 1.32rem),1.25rem);--radius-xl:clamp(1.63rem,calc(-0.56vw + 2.11rem),2rem);--radius-full:999rem;--shadow-xs:0 1px 2px var(--shadow-primary);--shadow-s:0 1.5px 3px var(--shadow-primary);--shadow-m:0 2px 6px var(--shadow-primary);--shadow-l:0 3px 12px var(--shadow-primary);--shadow-xl:0 6px 48px var(--shadow-primary);}:root.cf-theme-dark,:root.cf-theme-light .theme-inverted{--primary:hsla(60,87%,88%,1);}@media (max-width:992px){:root{--color-on-992:orange;}}@media (max-width:768px){:root{--red:red;}}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'primary',
				'value' => 'hsla(238,100%,62%,1)',
			),
			array(
				'name'  => 'space-4xs',
				'value' => 'clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem)',
			),
			array(
				'name'  => 'space-3xs',
				'value' => 'clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem)',
			),
			array(
				'name'  => 'space-2xs',
				'value' => 'clamp(0.51rem,calc(0.16vw + 0.48rem),0.62rem)',
			),
			array(
				'name'  => 'space-xs',
				'value' => 'clamp(0.64rem,calc(0.35vw + 0.57rem),0.88rem)',
			),
			array(
				'name'  => 'space-s',
				'value' => 'clamp(0.8rem,calc(0.65vw + 0.67rem),1.24rem)',
			),
			array(
				'name'  => 'space-m',
				'value' => 'clamp(1rem,calc(1.11vw + 0.78rem),1.75rem)',
			),
			array(
				'name'  => 'space-l',
				'value' => 'clamp(1.25rem,calc(1.81vw + 0.89rem),2.47rem)',
			),
			array(
				'name'  => 'space-xl',
				'value' => 'clamp(1.56rem,calc(2.87vw + 0.99rem),3.5rem)',
			),
			array(
				'name'  => 'space-2xl',
				'value' => 'clamp(1.95rem,calc(4.44vw + 1.07rem),4.95rem)',
			),
			array(
				'name'  => 'space-3xl',
				'value' => 'clamp(2.44rem,calc(6.75vw + 1.09rem),7rem)',
			),
			array(
				'name'  => 'space-4xl',
				'value' => 'clamp(3.05rem,calc(10.13vw + 1.02rem),9.89rem)',
			),
			array(
				'name'  => 'text-4xl',
				'value' => 'clamp(1rem,calc(0.19vw + 0.96rem),1.13rem)',
			),
			array(
				'name'  => 'red',
				'value' => 'green',
			),
			array(
				'name'  => 'radius-xs',
				'value' => 'clamp(0.25rem,calc(0vw + 0.25rem),0.25rem)',
			),
			array(
				'name'  => 'radius-s',
				'value' => 'clamp(0.38rem,calc(-0.19vw + 0.54rem),0.5rem)',
			),
			array(
				'name'  => 'radius-m',
				'value' => 'clamp(0.63rem,calc(-0.19vw + 0.79rem),0.75rem)',
			),
			array(
				'name'  => 'radius-l',
				'value' => 'clamp(1rem,calc(-0.37vw + 1.32rem),1.25rem)',
			),
			array(
				'name'  => 'radius-xl',
				'value' => 'clamp(1.63rem,calc(-0.56vw + 2.11rem),2rem)',
			),
			array(
				'name'  => 'radius-full',
				'value' => '999rem',
			),
			array(
				'name'  => 'shadow-xs',
				'value' => '0 1px 2px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-s',
				'value' => '0 1.5px 3px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-m',
				'value' => '0 2px 6px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-l',
				'value' => '0 3px 12px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-xl',
				'value' => '0 6px 48px var(--shadow-primary)',
			),
			array(
				'name'  => 'color-on-992',
				'value' => 'var(--color-on-992)',
			),
		);

		$this->assertEquals(
			$functions->getVariablesFromStyleSheet(),
			$expected
		);
	}

	/**
	 * @covers VariableExtractor::getVariablesFromStyleSheet
	 */
	public function testGetVariablesFromCompleteStyleSheet(): void {
		$css       = 'html.cf-theme-dark{color-scheme:dark;}:root,:root.cf-theme-dark .theme-inverted{--primary:hsla(238,100%,62%,1);--space-4xs:clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem);--space-3xs:clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem);--red:green;}:root.cf-theme-dark,:root.cf-theme-light .theme-inverted{--primary:hsla(60,87%,88%,1);}@media (max-width:992px){:root{--color-on-992:orange;}}@media (max-width:768px){:root{--red:red;}}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'primary',
				'value' => 'hsla(238,100%,62%,1)',
			),
			array(
				'name'  => 'space-4xs',
				'value' => 'clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem)',
			),
			array(
				'name'  => 'space-3xs',
				'value' => 'clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem)',
			),
			array(
				'name'  => 'red',
				'value' => 'green',
			),
			array(
				'name'  => 'color-on-992',
				'value' => 'var(--color-on-992)',
			),
		);

		$this->assertEquals( $expected, $functions->getVariablesFromStyleSheet() );
	}

	/**
	 * @covers VariableExtractor::getVariablesFromStyleSheet
	 */
	public function testGetVariablesFromSimpleStyleSheet(): void {
		$css       = ':root{--color-1: #fff; --color-2: #000;}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'color-1',
				'value' => '#fff',
			),
			array(
				'name'  => 'color-2',
				'value' => '#000',
			),
		);

		$this->assertEquals( $expected, $functions->getVariablesFromStyleSheet() );
	}

	/**
	 * @covers VariableExtractor::getVariablesFromStyleSheet
	 */
	public function testGetVariablesFromStyleSheetWithOnlyMediaQueries(): void {
		$css       = '@media (max-width: 992px) {:root{--color-large: blue;}} @media (max-width: 768px) {:root{--color-medium: green;}}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'color-large',
				'value' => 'blue',
			),
			array(
				'name'  => 'color-medium',
				'value' => 'var(--color-medium)',
			),
		);

		$this->assertEquals( $expected, $functions->getVariablesFromStyleSheet() );
	}

	/**
	 * @covers VariableExtractor::getVariablesFromStyleSheet
	 */
	public function testGetVariablesFromEmptyStyleSheet(): void {
		$css       = '';
		$functions = new VariableExtractor( $css );
		$expected  = array();

		$this->assertEquals( $expected, $functions->getVariablesFromStyleSheet() );
	}

	/**
	 * @covers VariableExtractor::getVariablesFromStyleSheet
	 */
	public function testGetVariablesFromStyleSheetWithOtherSelectorsInRoot(): void {
		$css       = ':root, .other-selector, #yet-another-selector {--color-1: #fff;}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'color-1',
				'value' => '#fff',
			),
		);

		$this->assertEquals( $expected, $functions->getVariablesFromStyleSheet() );
	}

	/**
	 * @covers VariableExtractor::getVariablesFromStyleSheet
	 */
	public function testGetVariablesFromStyleSheetWithOtherSelectorsInMediaQuery(): void {
		$css       = '@media (max-width: 992px) {:root, .other-selector, #yet-another-selector {--color-1: #fff;}}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'color-1',
				'value' => '#fff',
			),
		);

		$this->assertEquals( $expected, $functions->getVariablesFromStyleSheet() );
	}

	/**
	 * @covers Functions::str_replace_first
	 */
	public function testGetVariablesWithClassPrefix(): void {
		$css       = 'html.cf-theme-dark{color-scheme:dark;}:root,:root.cf-theme-dark .prefix-theme-inverted{--prefix-primary:hsla(238,100%,62%,1);--prefix-space-4xs:clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem);--prefix-space-3xs:clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem);--prefix-space-2xs:clamp(0.51rem,calc(0.16vw + 0.48rem),0.62rem);--prefix-space-xs:clamp(0.64rem,calc(0.35vw + 0.57rem),0.88rem);--prefix-space-s:clamp(0.8rem,calc(0.65vw + 0.67rem),1.24rem);--prefix-space-m:clamp(1rem,calc(1.11vw + 0.78rem),1.75rem);--prefix-space-l:clamp(1.25rem,calc(1.81vw + 0.89rem),2.47rem);--prefix-space-xl:clamp(1.56rem,calc(2.87vw + 0.99rem),3.5rem);--prefix-space-2xl:clamp(1.95rem,calc(4.44vw + 1.07rem),4.95rem);--prefix-space-3xl:clamp(2.44rem,calc(6.75vw + 1.09rem),7rem);--prefix-space-4xl:clamp(3.05rem,calc(10.13vw + 1.02rem),9.89rem);--prefix-text-4xl:clamp(1rem,calc(0.19vw + 0.96rem),1.13rem);--prefix-red:green;--prefix-radius-xs:clamp(0.25rem,calc(0vw + 0.25rem),0.25rem);--prefix-radius-s:clamp(0.38rem,calc(-0.19vw + 0.54rem),0.5rem);--prefix-radius-m:clamp(0.63rem,calc(-0.19vw + 0.79rem),0.75rem);--prefix-radius-l:clamp(1rem,calc(-0.37vw + 1.32rem),1.25rem);--prefix-radius-xl:clamp(1.63rem,calc(-0.56vw + 2.11rem),2rem);--prefix-radius-full:999rem;--prefix-shadow-xs:0 1px 2px var(--shadow-primary);--prefix-shadow-s:0 1.5px 3px var(--shadow-primary);--prefix-shadow-m:0 2px 6px var(--shadow-primary);--prefix-shadow-l:0 3px 12px var(--shadow-primary);--prefix-shadow-xl:0 6px 48px var(--shadow-primary);}:root.cf-theme-dark,:root.cf-theme-light .prefix-theme-inverted{--prefix-primary:hsla(60,87%,88%,1);}@media (max-width:992px){:root{--prefix-color-on-992:orange;}}@media (max-width:768px){:root{--prefix-red:red;}}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'prefix-primary',
				'value' => 'hsla(238,100%,62%,1)',
			),
			array(
				'name'  => 'prefix-space-4xs',
				'value' => 'clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem)',
			),
			array(
				'name'  => 'prefix-space-3xs',
				'value' => 'clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem)',
			),
			array(
				'name'  => 'prefix-space-2xs',
				'value' => 'clamp(0.51rem,calc(0.16vw + 0.48rem),0.62rem)',
			),
			array(
				'name'  => 'prefix-space-xs',
				'value' => 'clamp(0.64rem,calc(0.35vw + 0.57rem),0.88rem)',
			),
			array(
				'name'  => 'prefix-space-s',
				'value' => 'clamp(0.8rem,calc(0.65vw + 0.67rem),1.24rem)',
			),
			array(
				'name'  => 'prefix-space-m',
				'value' => 'clamp(1rem,calc(1.11vw + 0.78rem),1.75rem)',
			),
			array(
				'name'  => 'prefix-space-l',
				'value' => 'clamp(1.25rem,calc(1.81vw + 0.89rem),2.47rem)',
			),
			array(
				'name'  => 'prefix-space-xl',
				'value' => 'clamp(1.56rem,calc(2.87vw + 0.99rem),3.5rem)',
			),
			array(
				'name'  => 'prefix-space-2xl',
				'value' => 'clamp(1.95rem,calc(4.44vw + 1.07rem),4.95rem)',
			),
			array(
				'name'  => 'prefix-space-3xl',
				'value' => 'clamp(2.44rem,calc(6.75vw + 1.09rem),7rem)',
			),
			array(
				'name'  => 'prefix-space-4xl',
				'value' => 'clamp(3.05rem,calc(10.13vw + 1.02rem),9.89rem)',
			),
			array(
				'name'  => 'prefix-text-4xl',
				'value' => 'clamp(1rem,calc(0.19vw + 0.96rem),1.13rem)',
			),
			array(
				'name'  => 'prefix-red',
				'value' => 'green',
			),
			array(
				'name'  => 'prefix-radius-xs',
				'value' => 'clamp(0.25rem,calc(0vw + 0.25rem),0.25rem)',
			),
			array(
				'name'  => 'prefix-radius-s',
				'value' => 'clamp(0.38rem,calc(-0.19vw + 0.54rem),0.5rem)',
			),
			array(
				'name'  => 'prefix-radius-m',
				'value' => 'clamp(0.63rem,calc(-0.19vw + 0.79rem),0.75rem)',
			),
			array(
				'name'  => 'prefix-radius-l',
				'value' => 'clamp(1rem,calc(-0.37vw + 1.32rem),1.25rem)',
			),
			array(
				'name'  => 'prefix-radius-xl',
				'value' => 'clamp(1.63rem,calc(-0.56vw + 2.11rem),2rem)',
			),
			array(
				'name'  => 'prefix-radius-full',
				'value' => '999rem',
			),
			array(
				'name'  => 'prefix-shadow-xs',
				'value' => '0 1px 2px var(--shadow-primary)',
			),
			array(
				'name'  => 'prefix-shadow-s',
				'value' => '0 1.5px 3px var(--shadow-primary)',
			),
			array(
				'name'  => 'prefix-shadow-m',
				'value' => '0 2px 6px var(--shadow-primary)',
			),
			array(
				'name'  => 'prefix-shadow-l',
				'value' => '0 3px 12px var(--shadow-primary)',
			),
			array(
				'name'  => 'prefix-shadow-xl',
				'value' => '0 6px 48px var(--shadow-primary)',
			),
			array(
				'name'  => 'prefix-color-on-992',
				'value' => 'var(--prefix-color-on-992)',
			),
		);

		$this->assertEquals(
			$functions->getVariablesFromStyleSheet(),
			$expected
		);
	}

	/**
	 * @covers Functions::str_replace_first
	 */
	public function testGetVariablesWithoutDarkColor(): void {
		$css       = ':root{--default-1:hsla(21,93%,58%,1);--default-1-d-1:hsl(21,70%,51%);--default-1-d-2:hsl(21,65%,45%);--default-1-d-3:hsl(21,63%,38%);--default-1-d-4:hsl(21,61%,32%);--default-1-d-5:hsl(21,59%,26%);--default-1-d-6:hsl(21,55%,20%);--default-1-d-7:hsl(21,50%,14%);--default-1-d-8:hsl(25,51%,8%);}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'default-1',
				'value' => 'hsla(21,93%,58%,1)',
			),
			array(
				'name'  => 'default-1-d-1',
				'value' => 'hsl(21,70%,51%)',
			),
			array(
				'name'  => 'default-1-d-2',
				'value' => 'hsl(21,65%,45%)',
			),
			array(
				'name'  => 'default-1-d-3',
				'value' => 'hsl(21,63%,38%)',
			),
			array(
				'name'  => 'default-1-d-4',
				'value' => 'hsl(21,61%,32%)',
			),
			array(
				'name'  => 'default-1-d-5',
				'value' => 'hsl(21,59%,26%)',
			),
			array(
				'name'  => 'default-1-d-6',
				'value' => 'hsl(21,55%,20%)',
			),
			array(
				'name'  => 'default-1-d-7',
				'value' => 'hsl(21,50%,14%)',
			),
			array(
				'name'  => 'default-1-d-8',
				'value' => 'hsl(25,51%,8%)',
			),
		);

		$this->assertEquals(
			$functions->getVariablesFromStyleSheet(),
			$expected
		);
	}

	/**
	 * @covers Functions::str_replace_first
	 */
	public function testGetVariablesFromStyleSheetWithAlwaysDarkSelectors(): void {
		$css       = 'html.cf-theme-dark{color-scheme:dark;}:root,:root, :root.cf-theme-dark .theme-inverted, :root.cf-theme-dark .theme-always-light, :root.cf-theme-light .theme-inverted .theme-always-light {--primary:hsla(238,100%,62%,1);--space-4xs:clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem);--space-3xs:clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem);--space-2xs:clamp(0.51rem,calc(0.16vw + 0.48rem),0.62rem);--space-xs:clamp(0.64rem,calc(0.35vw + 0.57rem),0.88rem);--space-s:clamp(0.8rem,calc(0.65vw + 0.67rem),1.24rem);--space-m:clamp(1rem,calc(1.11vw + 0.78rem),1.75rem);--space-l:clamp(1.25rem,calc(1.81vw + 0.89rem),2.47rem);--space-xl:clamp(1.56rem,calc(2.87vw + 0.99rem),3.5rem);--space-2xl:clamp(1.95rem,calc(4.44vw + 1.07rem),4.95rem);--space-3xl:clamp(2.44rem,calc(6.75vw + 1.09rem),7rem);--space-4xl:clamp(3.05rem,calc(10.13vw + 1.02rem),9.89rem);--text-4xl:clamp(1rem,calc(0.19vw + 0.96rem),1.13rem);--red:green;--radius-xs:clamp(0.25rem,calc(0vw + 0.25rem),0.25rem);--radius-s:clamp(0.38rem,calc(-0.19vw + 0.54rem),0.5rem);--radius-m:clamp(0.63rem,calc(-0.19vw + 0.79rem),0.75rem);--radius-l:clamp(1rem,calc(-0.37vw + 1.32rem),1.25rem);--radius-xl:clamp(1.63rem,calc(-0.56vw + 2.11rem),2rem);--radius-full:999rem;--shadow-xs:0 1px 2px var(--shadow-primary);--shadow-s:0 1.5px 3px var(--shadow-primary);--shadow-m:0 2px 6px var(--shadow-primary);--shadow-l:0 3px 12px var(--shadow-primary);--shadow-xl:0 6px 48px var(--shadow-primary);}:root.cf-theme-dark,:root.cf-theme-light .theme-inverted{--primary:hsla(60,87%,88%,1);}@media (max-width:992px){:root{--color-on-992:orange;}}@media (max-width:768px){:root{--red:red;}}';
		$functions = new VariableExtractor( $css );
		$expected  = array(
			array(
				'name'  => 'primary',
				'value' => 'hsla(238,100%,62%,1)',
			),
			array(
				'name'  => 'space-4xs',
				'value' => 'clamp(0.33rem,calc(-0.03vw + 0.33rem),0.31rem)',
			),
			array(
				'name'  => 'space-3xs',
				'value' => 'clamp(0.41rem,calc(0.04vw + 0.4rem),0.44rem)',
			),
			array(
				'name'  => 'space-2xs',
				'value' => 'clamp(0.51rem,calc(0.16vw + 0.48rem),0.62rem)',
			),
			array(
				'name'  => 'space-xs',
				'value' => 'clamp(0.64rem,calc(0.35vw + 0.57rem),0.88rem)',
			),
			array(
				'name'  => 'space-s',
				'value' => 'clamp(0.8rem,calc(0.65vw + 0.67rem),1.24rem)',
			),
			array(
				'name'  => 'space-m',
				'value' => 'clamp(1rem,calc(1.11vw + 0.78rem),1.75rem)',
			),
			array(
				'name'  => 'space-l',
				'value' => 'clamp(1.25rem,calc(1.81vw + 0.89rem),2.47rem)',
			),
			array(
				'name'  => 'space-xl',
				'value' => 'clamp(1.56rem,calc(2.87vw + 0.99rem),3.5rem)',
			),
			array(
				'name'  => 'space-2xl',
				'value' => 'clamp(1.95rem,calc(4.44vw + 1.07rem),4.95rem)',
			),
			array(
				'name'  => 'space-3xl',
				'value' => 'clamp(2.44rem,calc(6.75vw + 1.09rem),7rem)',
			),
			array(
				'name'  => 'space-4xl',
				'value' => 'clamp(3.05rem,calc(10.13vw + 1.02rem),9.89rem)',
			),
			array(
				'name'  => 'text-4xl',
				'value' => 'clamp(1rem,calc(0.19vw + 0.96rem),1.13rem)',
			),
			array(
				'name'  => 'red',
				'value' => 'green',
			),
			array(
				'name'  => 'radius-xs',
				'value' => 'clamp(0.25rem,calc(0vw + 0.25rem),0.25rem)',
			),
			array(
				'name'  => 'radius-s',
				'value' => 'clamp(0.38rem,calc(-0.19vw + 0.54rem),0.5rem)',
			),
			array(
				'name'  => 'radius-m',
				'value' => 'clamp(0.63rem,calc(-0.19vw + 0.79rem),0.75rem)',
			),
			array(
				'name'  => 'radius-l',
				'value' => 'clamp(1rem,calc(-0.37vw + 1.32rem),1.25rem)',
			),
			array(
				'name'  => 'radius-xl',
				'value' => 'clamp(1.63rem,calc(-0.56vw + 2.11rem),2rem)',
			),
			array(
				'name'  => 'radius-full',
				'value' => '999rem',
			),
			array(
				'name'  => 'shadow-xs',
				'value' => '0 1px 2px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-s',
				'value' => '0 1.5px 3px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-m',
				'value' => '0 2px 6px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-l',
				'value' => '0 3px 12px var(--shadow-primary)',
			),
			array(
				'name'  => 'shadow-xl',
				'value' => '0 6px 48px var(--shadow-primary)',
			),
			array(
				'name'  => 'color-on-992',
				'value' => 'var(--color-on-992)',
			),
		);

		$this->assertEquals(
			$functions->getVariablesFromStyleSheet(),
			$expected
		);
	}
}
