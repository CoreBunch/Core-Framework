import { CompareOperator, compare } from "compare-versions";

const cases: [string, string, CompareOperator, boolean][] = [
	["1.3.7", "1.2.4", "<", false],
	["1.2.2", "1.2.4", "<", true],
	["1.2.1", "1.2.4", "<", true],
];

for (const [a, b, op, expected] of cases) {
	test(`compare(${a}, ${b}) === ${expected}`, () => {
		const res = compare(a, b, op);

		console.log(res);

		expect(res).toBe(expected);
	});
}
