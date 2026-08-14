import { describe, expect, test } from "bun:test";
import { parseHttpUrl, parseWordPressConnectionKey } from "../main/wordpressConnection";

describe("parseWordPressConnectionKey", () => {
	test("parses the 79-character WordPress connection key format used by 2.0", () => {
		const secret = "a".repeat(24);
		const connectionKey = `${secret}${encodeURIComponent(
			"https://darkgrey-chicken-782355.hostingersite.com",
		)}`;

		expect(connectionKey).toHaveLength(79);
		expect(parseWordPressConnectionKey(connectionKey)).toEqual({
			connectionKey,
			siteUrl: "https://darkgrey-chicken-782355.hostingersite.com",
		});
	});

	test("does not depend on the browser URL constructor", () => {
		const originalUrl = globalThis.URL;
		Reflect.deleteProperty(globalThis, "URL");

		try {
			const connectionKey = `${"b".repeat(24)}${encodeURIComponent("https://example.com")}`;
			expect(parseWordPressConnectionKey(connectionKey)?.siteUrl).toBe("https://example.com");
		} finally {
			globalThis.URL = originalUrl;
		}
	});

	test("rejects missing, non-HTTP, and credential-bearing site URLs", () => {
		expect(parseWordPressConnectionKey("a".repeat(24))).toBeNull();
		expect(parseWordPressConnectionKey(`${"a".repeat(24)}ftp%3A%2F%2Fexample.com`)).toBeNull();
		expect(
			parseWordPressConnectionKey(`${"a".repeat(24)}https%3A%2F%2Fuser%40example.com`),
		).toBeNull();
	});
});

describe("parseHttpUrl", () => {
	test("returns the origin, path, and query without browser APIs", () => {
		expect(parseHttpUrl("https://Example.com/wp-json/core-framework/v2/preset?context=figma#ignored")).toEqual({
			href: "https://example.com/wp-json/core-framework/v2/preset?context=figma",
			origin: "https://example.com",
			pathname: "/wp-json/core-framework/v2/preset",
		});
	});
});
