interface IGenerateClass {
	readonly property: string;
	readonly value?: string;
	readonly variable?: string;
	readonly name: string;
	readonly prefix?: string;
	readonly suffix?: string;
}

export function generateClass({
	property,
	value,
	variable,
	name,
	prefix,
	suffix,
}: IGenerateClass): CssObject {
	const nameWithRemovedPrefix = prefix ? name.replace(`${prefix}-`, "") : name;
	const selector = `.${prefix ? `${prefix}-` : ""}${nameWithRemovedPrefix}${suffix ? `-${suffix}` : ""}`;
	const id = String(Math.random()).slice(2, 6);
	const declarations = [
		{
			property,
			value: value ?? `var(${variable})`,
			id: "0",
		},
	];

	return {
		declarations,
		selector,
		id,
	};
}
