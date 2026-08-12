/**
 * Refresh the bundled Google Fonts directory without using an API key.
 *
 * Source: https://fonts.google.com/metadata/fonts
 * Output: packages/core/src/components/modules/fonts/data/google-fonts.json
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const METADATA_URL = "https://fonts.google.com/metadata/fonts";
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = join(
	PROJECT_ROOT,
	"packages/core/src/components/modules/fonts/data/google-fonts.json",
);

interface RawFamily {
	family: string;
	category: string;
	fonts: Record<string, unknown>;
}

interface RawDirectory {
	familyMetadataList: RawFamily[];
}

function normalizeVariant(tag: string): string {
	if (!/^\d+i?$/.test(tag)) return tag;
	return tag.endsWith("i") ? `${tag.slice(0, -1)}italic` : tag;
}

function normalizeCategory(category: string): string {
	return category.trim().toLowerCase().replace(/\s+/g, "-");
}

function stripJsonAntiHijackPrefix(raw: string): string {
	if (!raw.startsWith(")]}'")) return raw;
	return raw.slice(raw.indexOf("\n") + 1);
}

function sortVariants(a: string, b: string): number {
	const matchA = /^(\d+)(italic)?$/.exec(a);
	const matchB = /^(\d+)(italic)?$/.exec(b);

	if (!matchA || !matchB) return a.localeCompare(b);

	const weightDifference = Number(matchA[1]) - Number(matchB[1]);
	return weightDifference || Number(Boolean(matchA[2])) - Number(Boolean(matchB[2]));
}

async function main(): Promise<void> {
	const response = await fetch(METADATA_URL);

	if (!response.ok) {
		throw new Error(`Failed to fetch Google Fonts metadata: HTTP ${response.status}`);
	}

	const directory = JSON.parse(
		stripJsonAntiHijackPrefix(await response.text()),
	) as RawDirectory;

	const items = (directory.familyMetadataList ?? [])
		.map((entry) => ({
			family: entry.family,
			category: normalizeCategory(entry.category),
			variants: Object.keys(entry.fonts ?? {}).map(normalizeVariant).sort(sortVariants),
		}))
		.filter((entry) => entry.family && entry.variants.length > 0)
		.sort((a, b) => a.family.localeCompare(b.family));

	const snapshot = {
		fetchedAt: new Date().toISOString(),
		items,
	};

	await mkdir(dirname(OUTPUT_PATH), { recursive: true });
	await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot)}\n`, "utf8");

	console.log(
		`Wrote ${items.length} Google Font families (${(JSON.stringify(snapshot).length / 1024).toFixed(1)} KiB)`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
