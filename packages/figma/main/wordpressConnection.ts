const CONNECTION_KEY_SECRET_LENGTH = 24;

export interface ParsedHttpUrl {
	href: string;
	origin: string;
	pathname: string;
}

export interface WordPressConnection {
	connectionKey: string;
	siteUrl: string;
}

export function parseHttpUrl(value: string): ParsedHttpUrl | null {
	const match = value.match(/^(https?):\/\/([^/?#]+)(\/[^?#]*)?(\?[^#]*)?(?:#.*)?$/i);
	if (!match) return null;

	const [, scheme, authority, path = "/", query = ""] = match;
	if (!authority || authority.includes("@") || /[\\\s]/.test(authority)) return null;

	const origin = `${scheme.toLowerCase()}://${authority.toLowerCase()}`;

	return {
		href: `${origin}${path}${query}`,
		origin,
		pathname: path,
	};
}

export function parseWordPressConnectionKey(rawConnectionKey: string): WordPressConnection | null {
	const connectionKey = rawConnectionKey.trim();
	if (connectionKey.length <= CONNECTION_KEY_SECRET_LENGTH) return null;

	try {
		const siteUrl = parseHttpUrl(decodeURIComponent(connectionKey.slice(CONNECTION_KEY_SECRET_LENGTH)));
		if (!siteUrl) return null;

		return { connectionKey, siteUrl: siteUrl.origin };
	} catch {
		return null;
	}
}

const WP_JSON_PREFIX = "/wp-json";

// The REST route the "Connect a WordPress project" flow reads the preset from.
export const PRESET_REST_ROUTE = "/core-framework/v2/preset";

// Namespace-relative REST routes the plugin is allowed to reach on the connected
// site. Kept form-independent (no /wp-json prefix) so a request is validated the
// same way whether it arrives as /wp-json/... or as ?rest_route=/...
export const ALLOWED_REST_ROUTES: ReadonlySet<string> = new Set([
	PRESET_REST_ROUTE,
	"/core-framework/v2/preset-css",
	"/core-framework/v2/figma/update-colors",
	"/core-framework/v2/figma/update-classes",
	"/core-framework/v2/figma/update-grouped-classes",
	"/core-framework/v2/figma/update-prefixed-css-file",
	"/core-framework/v2/figma/save-oxygen-css-helper",
]);

// Normalize a request URL to its namespace-relative REST route, accepting both
// the pretty-permalink form (/wp-json/<route>) and the plain-permalink form
// (/?rest_route=/<route>). Returns null when no REST route is present.
export function extractRestRoute(rawUrl: string): string | null {
	const parsed = parseHttpUrl(rawUrl);
	if (!parsed) return null;

	if (parsed.pathname === WP_JSON_PREFIX || parsed.pathname.startsWith(`${WP_JSON_PREFIX}/`)) {
		const route = parsed.pathname.slice(WP_JSON_PREFIX.length);
		return route.startsWith("/") ? route : null;
	}

	const restRouteMatch = parsed.href.match(/[?&]rest_route=([^&#]+)/);
	if (restRouteMatch) {
		try {
			const route = decodeURIComponent(restRouteMatch[1]);
			return route.startsWith("/") ? route : `/${route}`;
		} catch {
			return null;
		}
	}

	return null;
}

// Both URL forms WordPress can serve a REST route from. Sites using the default
// "Plain" permalink setting do not route /wp-json/ (it 301-redirects away), but
// ?rest_route= works on every permalink setting, so we try the pretty form first
// and fall back to it.
export function buildRestRequestUrls(siteUrl: string, route: string): string[] {
	const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
	return [`${siteUrl}${WP_JSON_PREFIX}${normalizedRoute}`, `${siteUrl}/?rest_route=${normalizedRoute}`];
}

export interface WordPressRestResult {
	ok: boolean;
	status: number;
	data: unknown;
	reachable: boolean;
}

export interface WordPressRestRequest {
	method: "GET" | "POST" | "PUT";
	connectionKey: string;
	body?: string;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

// Reach a REST route on the connected site, trying both permalink forms. Only a
// redirect (or a 404, or a 200 that is not JSON) triggers the fallback to the
// next form; a real answer from the route (2xx JSON, 401, 403, 5xx) is returned
// as-is so genuine key rejections are not masked. `reachable` is false only when
// no form could be contacted at all.
export async function fetchWordPressRest(
	siteUrl: string,
	route: string,
	request: WordPressRestRequest,
	fetchImpl: FetchLike = (input, init) => fetch(input, init),
): Promise<WordPressRestResult> {
	const urls = buildRestRequestUrls(siteUrl, route);
	let reachable = false;
	let lastResult: WordPressRestResult | null = null;

	for (const url of urls) {
		let response: Response;
		try {
			response = await fetchImpl(url, {
				method: request.method,
				headers: {
					"Content-Type": "application/json",
					"X-Core-Framework-Key": request.connectionKey,
				},
				body: request.body,
				// Do not chase a redirect into an ambiguous page: on "plain" permalinks
				// /wp-json/ 301-redirects away from the route, and we want the
				// ?rest_route= form instead of whatever that redirect lands on.
				redirect: "manual",
			});
		} catch {
			// Could not contact this form; try the next one.
			continue;
		}

		reachable = true;
		const status = response.status;
		const isRedirect =
			response.type === "opaqueredirect" || status === 0 || (status >= 300 && status < 400);

		if (isRedirect || status === 404) {
			lastResult = { ok: false, status: status || 404, data: null, reachable: true };
			continue;
		}

		let data: unknown = null;
		let parsedJson = true;
		try {
			data = await response.json();
		} catch {
			parsedJson = false;
		}

		// A 200 that is not JSON means a followed redirect landed on an HTML page
		// (a runtime that ignores redirect: "manual"); try the other form.
		if (response.ok && !parsedJson) {
			lastResult = { ok: false, status, data: null, reachable: true };
			continue;
		}

		return { ok: response.ok, status, data, reachable: true };
	}

	return lastResult ?? { ok: false, status: 0, data: null, reachable };
}
