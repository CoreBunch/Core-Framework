#!/usr/bin/env bun
/**
 * Version Display Script for Core Framework
 *
 * Shows local package versions alongside their published versions
 * in a clean dashboard format.
 *
 * WP Plugin checks WordPress.org API, Web version is Vercel (no published version check).
 *
 * Usage: bun run version
 */

import { c, log, renderDashboard, type VersionRow } from "./cli";

type Package = {
	label: string;
	file: string;
	wpSlug?: string;
};

const PACKAGES: Package[] = [
	{ label: "WP Plugin", file: "packages/wp/package.json", wpSlug: "core-framework" },
	{ label: "Web App", file: "packages/www/package.json" },
	{ label: "Core", file: "packages/core/src/constants/version.ts" },
	{ label: "Gutenberg", file: "packages/gutenberg/package.json" },
];

async function getLocalVersion(filePath: string): Promise<string> {
	try {
		if (filePath.endsWith(".ts")) {
			const content = await Bun.file(filePath).text();
			const match = content.match(/APP_VERSION\s*=\s*"([^"]+)"/);
			return match?.[1] || "—";
		}
		const pkg = await Bun.file(filePath).json();
		return pkg.version;
	} catch {
		return "—";
	}
}

async function getWpOrgVersion(slug: string): Promise<string> {
	try {
		const res = await fetch(`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&slug=${slug}`);
		const data = await res.json();
		return data.version || "—";
	} catch {
		return "—";
	}
}

async function main() {
	log(`\n${c.dim}  Fetching published versions...${c.reset}`);

	// Fetch all versions in parallel
	const localVersions = await Promise.all(PACKAGES.map((p) => getLocalVersion(p.file)));

	const publishedVersions = await Promise.all(
		PACKAGES.map((pkg) => {
			if (pkg.wpSlug) return getWpOrgVersion(pkg.wpSlug);
			return Promise.resolve("—");
		})
	);

	// Clear the "fetching" line
	process.stdout.write("\x1b[1A\x1b[2K");

	const rows: VersionRow[] = PACKAGES.map((pkg, i) => ({
		label: pkg.label,
		local: localVersions[i],
		published: publishedVersions[i],
	}));

	renderDashboard("Core Framework Versions", rows);
}

main().catch((e) => {
	log(`${c.red}Error: ${e}${c.reset}`);
	process.exit(1);
});
