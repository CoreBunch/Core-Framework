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
