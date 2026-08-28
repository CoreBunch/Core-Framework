import { describe, expect, test } from "bun:test";
import {
	ALLOWED_REST_ROUTES,
	PRESET_REST_ROUTE,
	buildRestRequestUrls,
	extractRestRoute,
	fetchWordPressRest,
	parseHttpUrl,
	parseWordPressConnectionKey,
} from "../main/wordpressConnection";

// A fetch stand-in that maps exact URLs to canned responses. Any URL not mapped
// throws, simulating a connection failure.
function stubFetch(routes: Record<string, { status: number; type?: string; body?: unknown; nonJson?: boolean }>) {
	const calls: string[] = [];
	const fetchImpl = async (input: string) => {
		calls.push(input);
		const canned = routes[input];
		if (!canned) throw new TypeError("Failed to fetch");
		return {
			status: canned.status,
			ok: canned.status >= 200 && canned.status < 300,
			type: canned.type ?? "default",
			json: async () => {
				if (canned.nonJson) throw new SyntaxError("Unexpected token < in JSON");
				return canned.body ?? null;
			},
		};
	};
	return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

const SITE = "https://biroty.s6-tastewp.com";
const PRETTY = `${SITE}/wp-json${PRESET_REST_ROUTE}`;
const REST_ROUTE = `${SITE}/?rest_route=${PRESET_REST_ROUTE}`;
const REQUEST = { method: "GET", connectionKey: "k".repeat(24) } as const;

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

describe("extractRestRoute", () => {
	test("normalizes the pretty-permalink form to the namespace route", () => {
		expect(extractRestRoute(`${SITE}/wp-json/core-framework/v2/preset`)).toBe("/core-framework/v2/preset");
	});

	test("normalizes the plain-permalink ?rest_route= form to the same route", () => {
		expect(extractRestRoute(`${SITE}/?rest_route=/core-framework/v2/figma/update-colors`)).toBe(
			"/core-framework/v2/figma/update-colors",
		);
	});

	test("returns null when there is no REST route in the URL", () => {
		expect(extractRestRoute(`${SITE}/some/other/path`)).toBeNull();
		expect(extractRestRoute("not a url")).toBeNull();
	});
});

describe("buildRestRequestUrls", () => {
	test("offers the pretty form first, then the permalink-independent form", () => {
		expect(buildRestRequestUrls(SITE, PRESET_REST_ROUTE)).toEqual([PRETTY, REST_ROUTE]);
	});

	test("every allowed route round-trips through extractRestRoute for both forms", () => {
		for (const route of ALLOWED_REST_ROUTES) {
			const [pretty, restRoute] = buildRestRequestUrls(SITE, route);
			expect(extractRestRoute(pretty)).toBe(route);
			expect(extractRestRoute(restRoute)).toBe(route);
		}
	});
});

describe("fetchWordPressRest permalink fallback (issue #12/#18)", () => {
	test("falls back to ?rest_route= when /wp-json/ 301-redirects (plain permalinks)", async () => {
		const { fetchImpl, calls } = stubFetch({
			[PRETTY]: { status: 301 },
			[REST_ROUTE]: { status: 200, body: { success: true, data: { ok: 1 } } },
		});

		const result = await fetchWordPressRest(SITE, PRESET_REST_ROUTE, REQUEST, fetchImpl);

		expect(result).toEqual({ ok: true, status: 200, data: { success: true, data: { ok: 1 } }, reachable: true });
		expect(calls).toEqual([PRETTY, REST_ROUTE]);
	});

	test("also falls back on an opaque redirect (runtime honours redirect: manual)", async () => {
		const { fetchImpl } = stubFetch({
			[PRETTY]: { status: 0, type: "opaqueredirect" },
			[REST_ROUTE]: { status: 200, body: { success: true } },
		});

		const result = await fetchWordPressRest(SITE, PRESET_REST_ROUTE, REQUEST, fetchImpl);
		expect(result.ok).toBe(true);
		expect(result.status).toBe(200);
	});

	test("also falls back when a followed redirect returns 200 HTML instead of JSON", async () => {
		const { fetchImpl } = stubFetch({
			[PRETTY]: { status: 200, nonJson: true },
			[REST_ROUTE]: { status: 200, body: { success: true } },
		});

		const result = await fetchWordPressRest(SITE, PRESET_REST_ROUTE, REQUEST, fetchImpl);
		expect(result.ok).toBe(true);
	});

	test("uses /wp-json/ directly and does not probe ?rest_route= when pretty permalinks work", async () => {
		const { fetchImpl, calls } = stubFetch({
			[PRETTY]: { status: 200, body: { success: true } },
			[REST_ROUTE]: { status: 500 },
		});

		const result = await fetchWordPressRest(SITE, PRESET_REST_ROUTE, REQUEST, fetchImpl);
		expect(result.ok).toBe(true);
		expect(calls).toEqual([PRETTY]);
	});

	test("does not mask a genuine key rejection (401) as a permalink problem", async () => {
		const { fetchImpl } = stubFetch({
			[PRETTY]: { status: 301 },
			[REST_ROUTE]: { status: 401, body: { code: "rest_forbidden" } },
		});

		const result = await fetchWordPressRest(SITE, PRESET_REST_ROUTE, REQUEST, fetchImpl);
		expect(result.ok).toBe(false);
		expect(result.status).toBe(401);
	});

	test("reports the site as unreachable when no form can be contacted", async () => {
		const { fetchImpl } = stubFetch({});

		const result = await fetchWordPressRest(SITE, PRESET_REST_ROUTE, REQUEST, fetchImpl);
		expect(result).toEqual({ ok: false, status: 0, data: null, reachable: false });
	});
});
