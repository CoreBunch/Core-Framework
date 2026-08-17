#!/usr/bin/env bun

import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

type Surface = "all" | "figma" | "source" | "wp";

const ROOT = resolve(import.meta.dir, "..");
const surface = (Bun.argv[2] ?? "all") as Surface;
if (!["all", "figma", "source", "wp"].includes(surface)) {
	throw new Error("Usage: bun run scripts/check-open-source-boundaries.ts [all|figma|source|wp]");
}

const forbidden = [
	{
		// The public preset endpoint itself is allowed: it is read-only, serves
		// only projects their owner shared publicly, and is reached solely when a
		// user pastes a link. What must never ship is a credential for it.
		label: "client-side credential for the public preset importer",
		pattern: "x-api-key",
	},
	{ label: "remote placeholder images", pattern: "picsum.photos" },
	{
		label: "remote Core Framework UI font",
		pattern: "fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700",
	},
	{ label: "stale Figma version", pattern: "Version 1.0.1" },
	{
		label: "retired commercial option outside its deletion-only migration",
		pattern: "_license_key",
		allowedPaths: new Set(["packages/wp/wp/Config/Setup.php"]),
	},
	{
		label: "retired free-license option outside its deletion-only migration",
		pattern: "free_license",
		allowedPaths: new Set(["packages/wp/wp/Config/Setup.php"]),
	},
];

const sourceTargets = [
	"packages/core/src",
	"packages/figma/src",
	"packages/wp/src",
	"packages/wp/wp",
	"packages/www/src",
];
const targets: string[] = [];
if (["all", "source"].includes(surface)) targets.push(...sourceTargets);
if (["all", "figma"].includes(surface)) targets.push("packages/figma/dist");
if (["all", "wp"].includes(surface)) targets.push("packages/wp/dist");

const readableExtensions = new Set([
	".css",
	".html",
	".js",
	".json",
	".md",
	".php",
	".scss",
	".ts",
	".tsx",
	".txt",
]);
const failures: string[] = [];

async function scan(directory: string): Promise<void> {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await scan(path);
			continue;
		}
		if (!readableExtensions.has(extname(entry.name))) continue;

		const contents = await readFile(path, "utf8");
		for (const check of forbidden) {
			const relativePath = path.slice(ROOT.length + 1);
			if (contents.includes(check.pattern) && !check.allowedPaths?.has(relativePath)) {
				failures.push(`${path}: ${check.label}`);
			}
		}
	}
}

for (const target of targets) await scan(join(ROOT, target));

if (failures.length) {
	throw new Error(`Open-source boundary check failed:\n${failures.join("\n")}`);
}

console.log(`Open-source boundary check passed for ${surface}`);
