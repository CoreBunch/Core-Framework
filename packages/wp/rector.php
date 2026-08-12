<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Set\ValueObject\SetList;

use Rector\CodeQuality\Rector\Ternary\ArrayKeyExistsTernaryThenValueToCoalescingRector;
use Rector\CodeQuality\Rector\FuncCall\ArrayKeysAndInArrayToArrayKeyExistsRector;
use Rector\CodeQuality\Rector\If_\CombineIfRector;
use Rector\CodeQuality\Rector\Assign\CombinedAssignRector;
use Rector\CodeQuality\Rector\Class_\CompleteDynamicPropertiesRector;
use Rector\CodeQuality\Rector\If_\ConsecutiveNullCompareReturnsToNullCoalesceQueueRector;
use Rector\CodeQuality\Rector\Identical\FlipTypeControlToUseExclusiveTypeRector;
use Rector\CodeQuality\Rector\ClassMethod\InlineArrayReturnAssignRector;
use Rector\CodeQuality\Rector\Class_\InlineConstructorDefaultToPropertyRector;
use Rector\CodeQuality\Rector\FuncCall\IntvalToTypeCastRector;
use Rector\CodeQuality\Rector\Isset_\IssetOnPropertyObjectToPropertyExistsRector;
use Rector\CodeQuality\Rector\Concat\JoinStringConcatRector;
use Rector\CodeQuality\Rector\ClassMethod\NarrowUnionTypeDocRector;
use Rector\CodeQuality\Rector\ClassMethod\ReturnTypeFromStrictScalarReturnExprRector;
use Rector\CodeQuality\Rector\If_\ShortenElseIfRector;
use Rector\CodeQuality\Rector\If_\SimplifyIfElseToTernaryRector;
use Rector\CodeQuality\Rector\FuncCall\SimplifyRegexPatternRector;
use Rector\CodeQuality\Rector\FuncCall\StrvalToTypeCastRector;
use Rector\CodeQuality\Rector\Ternary\SwitchNegatedTernaryRector;
use Rector\CodeQuality\Rector\Expression\TernaryFalseExpressionToIfRector;
use Rector\CodeQuality\Rector\Ternary\UnnecessaryTernaryExpressionRector;
use Rector\CodeQuality\Rector\Foreach_\UnusedForeachValueToArrayKeysRector;
use Rector\CodeQuality\Rector\Equal\UseIdenticalOverEqualWithSameTypeRector;

use Rector\CodingStyle\Rector\Class_\AddArrayDefaultToArrayPropertyRector;
use Rector\CodingStyle\Rector\Property\AddFalseDefaultToBoolPropertyRector;
use Rector\CodingStyle\Rector\FuncCall\ConsistentImplodeRector;
use Rector\CodingStyle\Rector\FuncCall\CountArrayToEmptyArrayComparisonRector;
use Rector\CodingStyle\Rector\Encapsed\EncapsedStringsToSprintfRector;
use Rector\CodingStyle\Rector\Property\InlineSimplePropertyAnnotationRector;
use Rector\CodingStyle\Rector\ClassMethod\MakeInheritedMethodVisibilitySameAsParentRector;
use Rector\CodingStyle\Rector\Stmt\NewlineAfterStatementRector;
use Rector\CodingStyle\Rector\ClassMethod\NewlineBeforeNewAssignSetRector;
use Rector\CodingStyle\Rector\FuncCall\StrictArraySearchRector;
use Rector\CodingStyle\Rector\String_\SymplifyQuoteEscapeRector;
use Rector\CodingStyle\Rector\String_\UseClassKeywordForClassNameResolutionRector;
use Rector\CodingStyle\Rector\Plus\UseIncrementAssignRector;
use Rector\CodingStyle\Rector\ClassConst\VarConstantCommentRector;
use Rector\CodingStyle\Rector\FuncCall\VersionCompareFuncCallToConstantRector;
use Rector\CodingStyle\Rector\Encapsed\WrapEncapsedVariableInCurlyBracesRector;

use Rector\Naming\Rector\Foreach_\RenameForeachValueVariableToMatchExprVariableRector;
use Rector\Naming\Rector\Foreach_\RenameForeachValueVariableToMatchMethodCallReturnTypeRector;
use Rector\Naming\Rector\Assign\RenameVariableToMatchMethodCallReturnTypeRector;
use Rector\Naming\Rector\ClassMethod\RenameVariableToMatchNewTypeRector;

use Rector\Visibility\Rector\ClassMethod\ExplicitPublicClassMethodRector;

return static function (RectorConfig $rectorConfig): void {
	$rectorConfig->paths([__DIR__ . '/wp']);

	$rectorConfig->autoloadPaths([
		__DIR__ . '/vendor/squizlabs/php_codesniffer/autoload.php',
		__DIR__ . '/vendor/php-stubs/wordpress-stubs/wordpress-stubs.php'
	]);

	$rectorConfig->importNames();
	$rectorConfig->importShortClasses(false);

	$rectorConfig->sets([
		SetList::DEAD_CODE,
		LevelSetList::UP_TO_PHP_80,
		SetList::TYPE_DECLARATION,
	]);

	// CodeQuality
	$rectorConfig->rule(ArrayKeyExistsTernaryThenValueToCoalescingRector::class);
	$rectorConfig->rule(ArrayKeysAndInArrayToArrayKeyExistsRector::class);
	$rectorConfig->rule(CombineIfRector::class);
	$rectorConfig->rule(CombinedAssignRector::class);
	$rectorConfig->rule(CompleteDynamicPropertiesRector::class);
	$rectorConfig->rule(ConsecutiveNullCompareReturnsToNullCoalesceQueueRector::class);
	$rectorConfig->rule(FlipTypeControlToUseExclusiveTypeRector::class);
	$rectorConfig->rule(InlineArrayReturnAssignRector::class);
	$rectorConfig->rule(InlineConstructorDefaultToPropertyRector::class);
	$rectorConfig->rule(IntvalToTypeCastRector::class);
	$rectorConfig->rule(IssetOnPropertyObjectToPropertyExistsRector::class);
	$rectorConfig->rule(JoinStringConcatRector::class);
	$rectorConfig->rule(NarrowUnionTypeDocRector::class);
	$rectorConfig->rule(ReturnTypeFromStrictScalarReturnExprRector::class);
	$rectorConfig->rule(ShortenElseIfRector::class);
	$rectorConfig->rule(SimplifyIfElseToTernaryRector::class);
	$rectorConfig->rule(SimplifyRegexPatternRector::class);
	$rectorConfig->rule(StrvalToTypeCastRector::class);
	$rectorConfig->rule(SwitchNegatedTernaryRector::class);
	$rectorConfig->rule(TernaryFalseExpressionToIfRector::class);
	$rectorConfig->rule(UnnecessaryTernaryExpressionRector::class);
	$rectorConfig->rule(UnusedForeachValueToArrayKeysRector::class);
	$rectorConfig->rule(UseIdenticalOverEqualWithSameTypeRector::class);

	// CodeStyle
	$rectorConfig->rule(AddArrayDefaultToArrayPropertyRector::class);
	$rectorConfig->rule(AddFalseDefaultToBoolPropertyRector::class);
	$rectorConfig->rule(ConsistentImplodeRector::class);
	$rectorConfig->rule(CountArrayToEmptyArrayComparisonRector::class);
	$rectorConfig->rule(EncapsedStringsToSprintfRector::class);
	$rectorConfig->rule(InlineSimplePropertyAnnotationRector::class);
	$rectorConfig->rule(MakeInheritedMethodVisibilitySameAsParentRector::class);
	$rectorConfig->rule(NewlineAfterStatementRector::class);
	$rectorConfig->rule(NewlineBeforeNewAssignSetRector::class);
	$rectorConfig->rule(StrictArraySearchRector::class);
	$rectorConfig->rule(SymplifyQuoteEscapeRector::class);
	$rectorConfig->rule(UseClassKeywordForClassNameResolutionRector::class);
	$rectorConfig->rule(UseIncrementAssignRector::class);
	$rectorConfig->rule(VarConstantCommentRector::class);
	$rectorConfig->rule(VersionCompareFuncCallToConstantRector::class);
	$rectorConfig->rule(WrapEncapsedVariableInCurlyBracesRector::class);

	// Naming
	$rectorConfig->rule(RenameForeachValueVariableToMatchExprVariableRector::class);
	$rectorConfig->rule(RenameForeachValueVariableToMatchMethodCallReturnTypeRector::class);
	$rectorConfig->rule(RenameVariableToMatchMethodCallReturnTypeRector::class);
	$rectorConfig->rule(RenameVariableToMatchNewTypeRector::class);

	// Visibility
	$rectorConfig->rule(ExplicitPublicClassMethodRector::class);
};
