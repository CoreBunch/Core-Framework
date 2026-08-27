import { safeLocalStorage } from "functions/safeLocalStorage";
import { rateLimiter } from "hooks/usePush";

// Reproduces issue #11: inside the Figma plugin the editor runs in an
// `about:srcdoc` iframe where reading `window.localStorage` throws
//   SecurityError: Failed to read the 'localStorage' property from 'Window':
//   Access is denied for this document.
// The save path (usePush's rateLimiter) touched localStorage unconditionally,
// so the click threw an uncaught promise rejection and the save never ran.

const LIMITER_KEY = "cf-limiter";
const originalDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");

function denyLocalStorage() {
	Object.defineProperty(window, "localStorage", {
		configurable: true,
		get() {
			throw new DOMException(
				"Failed to read the 'localStorage' property from 'Window': Access is denied for this document.",
				"SecurityError",
			);
		},
	});
}

function allowLocalStorage() {
	if (originalDescriptor) {
		Object.defineProperty(window, "localStorage", originalDescriptor);
	}
}

// `safeLocalStorage` keeps a module-level in-memory fallback that persists
// across tests. Reset both backing stores before each test so the limiter
// timestamp from one test does not throttle the next.
beforeEach(() => {
	allowLocalStorage();
	window.localStorage.clear();
	denyLocalStorage();
	safeLocalStorage.removeItem(LIMITER_KEY);
	allowLocalStorage();
});

afterEach(() => {
	allowLocalStorage();
	window.localStorage.clear();
});

describe("save path under a denied-storage sandbox (issue #11)", () => {
	test("save proceeds when storage access is denied (Figma srcdoc)", async () => {
		denyLocalStorage();

		const save = jest.fn().mockResolvedValue(undefined);

		// Must not reject with the SecurityError, and must still run the save.
		await expect(rateLimiter(save)()).resolves.toBeUndefined();
		expect(save).toHaveBeenCalledTimes(1);
	});

	test("rate limiting still throttles with the in-memory fallback", async () => {
		denyLocalStorage();

		const save = jest.fn().mockResolvedValue(undefined);
		const limitedSave = rateLimiter(save);

		await limitedSave();
		await limitedSave(); // second call within the 2s window is throttled

		expect(save).toHaveBeenCalledTimes(1);
	});

	test("normal storage path is unchanged (timestamp persisted)", async () => {
		const save = jest.fn().mockResolvedValue(undefined);
		await rateLimiter(save)();

		expect(window.localStorage.getItem(LIMITER_KEY)).not.toBeNull();
		expect(save).toHaveBeenCalledTimes(1);
	});
});

describe("safeLocalStorage", () => {
	test("falls back to an in-memory store when access is denied", () => {
		denyLocalStorage();

		expect(() => safeLocalStorage.setItem("probe", "v")).not.toThrow();
		expect(safeLocalStorage.getItem("probe")).toBe("v");

		safeLocalStorage.removeItem("probe");
		expect(safeLocalStorage.getItem("probe")).toBeNull();
	});

	test("reads and writes real localStorage when it is available", () => {
		safeLocalStorage.setItem("probe", "v");

		expect(window.localStorage.getItem("probe")).toBe("v");
		expect(safeLocalStorage.getItem("probe")).toBe("v");

		safeLocalStorage.removeItem("probe");
	});
});
