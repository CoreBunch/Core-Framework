import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fetchGoogleFontFiles, fetchGoogleFonts } from "..";

const GOOGLE_CSS = `
/* cyrillic */
@font-face {
  font-family: 'Example';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/example/cyrillic-400.woff2) format('woff2');
}
/* latin */
@font-face {
  font-family: 'Example';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/example/latin-400.woff2) format('woff2');
}
/* latin */
@font-face {
  font-family: 'Example';
  font-style: italic;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/example/latin-700-italic.woff2) format('woff2');
}
`;

const originalFetch = globalThis.fetch;

describe("keyless Google Fonts directory", () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	it("loads the bundled catalog without a network request", async () => {
		const fetchSpy = jest.fn();
		globalThis.fetch = fetchSpy as typeof fetch;
		const directory = await fetchGoogleFonts();

		expect(directory.items.length).toBeGreaterThan(1_000);
		expect(directory.items.find((font) => font.family === "Roboto")?.variants).toContain("400");
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("resolves selected variants through the keyless CSS2 endpoint", async () => {
		const fetchSpy = jest.fn().mockResolvedValue({
			ok: true,
			text: async () => GOOGLE_CSS,
		} as never);
		globalThis.fetch = fetchSpy as typeof fetch;

		const files = await fetchGoogleFontFiles("Example Font", ["400", "700italic"]);

		expect(fetchSpy).toHaveBeenCalledWith(
			"https://fonts.googleapis.com/css2?family=Example%20Font:ital,wght@0,400;1,700&display=swap",
		);
		expect(files).toEqual({
			regular: "https://fonts.gstatic.com/s/example/latin-400.woff2",
			"700italic": "https://fonts.gstatic.com/s/example/latin-700-italic.woff2",
		});
	});
});
