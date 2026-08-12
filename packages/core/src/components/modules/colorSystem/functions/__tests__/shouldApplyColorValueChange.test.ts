import { shouldApplyColorValueChange } from "../shouldApplyColorValueChange";

describe("shouldApplyColorValueChange", () => {
	test("applies a valid textual change even when the parsed color is visually the same", () => {
		expect(
			shouldApplyColorValueChange({
				currentValue: "#4444",
				isRawFormat: false,
				isSameColor: true,
				isValidColor: true,
				nextValue: "#444444",
			}),
		).toBe(true);
	});

	test("skips unchanged equivalent color values", () => {
		expect(
			shouldApplyColorValueChange({
				currentValue: "#444444",
				isRawFormat: false,
				isSameColor: true,
				isValidColor: true,
				nextValue: "#444444",
			}),
		).toBe(false);
	});

	test("does not apply invalid non-raw color values", () => {
		expect(
			shouldApplyColorValueChange({
				currentValue: "#444444",
				isRawFormat: false,
				isSameColor: false,
				isValidColor: false,
				nextValue: "not-a-color",
			}),
		).toBe(false);
	});

	test("applies raw values without color validation", () => {
		expect(
			shouldApplyColorValueChange({
				currentValue: "var(--primary)",
				isRawFormat: true,
				isSameColor: true,
				isValidColor: false,
				nextValue: "var(--secondary)",
			}),
		).toBe(true);
	});
});
