interface ShouldApplyColorValueChange {
	readonly currentValue: string;
	readonly isRawFormat: boolean;
	readonly isSameColor: boolean;
	readonly isValidColor: boolean;
	readonly nextValue: string;
}

export function shouldApplyColorValueChange({
	currentValue,
	isRawFormat,
	isSameColor,
	isValidColor,
	nextValue,
}: ShouldApplyColorValueChange): boolean {
	return isRawFormat || (isValidColor && (!isSameColor || nextValue !== currentValue));
}
