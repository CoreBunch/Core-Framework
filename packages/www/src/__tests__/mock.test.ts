jest.mock("colord", () => ({
	colord: jest.fn().mockImplementation(() => ({
		toHslString: jest.fn(),
		isValid: jest.fn().mockReturnValue(true),
	})),
	extend: jest.fn(),
	getFormat: jest.fn(),
	random: jest.fn(),
	alpha: jest.fn(),
}));

test("mock colord", () => {
	expect(1).toBe(1);
});

