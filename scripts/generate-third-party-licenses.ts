#!/usr/bin/env bun

import { existsSync, realpathSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

type Surface = "figma" | "wp";

interface PackageRecord {
	ecosystem: "Composer" | "JavaScript";
	license: string;
	licenseText: string;
	name: string;
	repository?: string;
	version: string;
}

const ROOT = resolve(import.meta.dir, "..");
const surface = Bun.argv[2] as Surface | undefined;
const outputPath = Bun.argv[3] ? resolve(Bun.argv[3]) : undefined;

if (!surface || !["figma", "wp"].includes(surface) || !outputPath) {
	throw new Error("Usage: bun run scripts/generate-third-party-licenses.ts <figma|wp> <output-path>");
}

const workspacePackagePaths = [
	"package.json",
	"packages/blocks/package.json",
	"packages/builder-integrations/package.json",
	"packages/core/package.json",
	"packages/figma/package.json",
	"packages/gutenberg/package.json",
	"packages/wp/package.json",
	"packages/www/package.json",
];

const internalPackageNames = new Set<string>();
for (const path of workspacePackagePaths) {
	const packageJson = JSON.parse(await readFile(join(ROOT, path), "utf8"));
	if (typeof packageJson.name === "string") internalPackageNames.add(packageJson.name);
}

function dependencyNames(packageJson: Record<string, unknown>): string[] {
	const fields = ["dependencies", "optionalDependencies"] as const;
	const names = new Set<string>();

	for (const field of fields) {
		const dependencies = packageJson[field];
		if (!dependencies || typeof dependencies !== "object") continue;
		for (const name of Object.keys(dependencies)) names.add(name);
	}

	return [...names];
}

function resolveNodePackage(name: string, fromDirectory: string): string | null {
	let current = fromDirectory;

	while (current.startsWith(ROOT)) {
		const candidate = join(current, "node_modules", name);
		if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);

		const parent = dirname(current);
		if (parent === current) break;
		current = parent;
	}

	return null;
}

function normalizeLicense(value: unknown): string {
	if (typeof value === "string") return value.trim();
	if (Array.isArray(value)) {
		return value
			.map((entry) => (typeof entry === "string" ? entry : entry?.type))
			.filter(Boolean)
			.join(" OR ");
	}
	if (value && typeof value === "object" && "type" in value && typeof value.type === "string") {
		return value.type.trim();
	}
	return "";
}

function repositoryUrl(value: unknown): string | undefined {
	if (typeof value === "string") return value;
	if (value && typeof value === "object" && "url" in value && typeof value.url === "string") {
		return value.url.replace(/^git\+/, "").replace(/\.git$/, "");
	}
	return undefined;
}

async function readLicenseText(packageDirectory: string): Promise<string> {
	const entries = await readdir(packageDirectory);
	const licenseFile = entries
		.filter((entry) => /^(licen[cs]e|copying|notice)(\..*)?$/i.test(entry))
		.sort((a, b) => a.localeCompare(b))[0];

	if (!licenseFile) return "No license file was included by the package; see the declared license metadata above.";
	return (await readFile(join(packageDirectory, licenseFile), "utf8")).trim();
}

async function collectJavaScriptPackages(seedPaths: string[]): Promise<PackageRecord[]> {
	const queue: Array<{ name: string; fromDirectory: string }> = [];

	for (const seedPath of seedPaths) {
		const packageDirectory = join(ROOT, seedPath);
		const packageJson = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));
		for (const name of dependencyNames(packageJson)) queue.push({ name, fromDirectory: packageDirectory });
	}

	const visited = new Set<string>();
	const records: PackageRecord[] = [];

	while (queue.length) {
		const item = queue.shift()!;
		if (internalPackageNames.has(item.name)) continue;

		const packageDirectory = resolveNodePackage(item.name, item.fromDirectory);
		if (!packageDirectory || visited.has(packageDirectory)) continue;
		visited.add(packageDirectory);

		const packageJson = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));
		const license = normalizeLicense(packageJson.license ?? packageJson.licenses);
		if (!license || /^(UNLICENSED|SEE LICENSE)$/i.test(license)) {
			throw new Error(`${packageJson.name ?? item.name}@${packageJson.version ?? "unknown"} has no usable license metadata`);
		}

		records.push({
			ecosystem: "JavaScript",
			license,
			licenseText: await readLicenseText(packageDirectory),
			name: packageJson.name ?? item.name,
			repository: repositoryUrl(packageJson.repository),
			version: packageJson.version ?? "unknown",
		});

		for (const name of dependencyNames(packageJson)) queue.push({ name, fromDirectory: packageDirectory });
	}

	return records;
}

async function collectComposerPackages(): Promise<PackageRecord[]> {
	const installedPath = join(ROOT, "packages/wp/vendor/composer/installed.json");
	if (!existsSync(installedPath)) throw new Error("Composer production dependencies are not installed");

	const installed = JSON.parse(await readFile(installedPath, "utf8"));
	const packages = Array.isArray(installed) ? installed : installed.packages;
	const developmentPackages = new Set(Array.isArray(installed) ? [] : installed["dev-package-names"] ?? []);
	const records: PackageRecord[] = [];

	for (const packageJson of packages) {
		if (developmentPackages.has(packageJson.name)) continue;
		const packageDirectory = join(ROOT, "packages/wp/vendor", packageJson.name);
		const license = normalizeLicense(packageJson.license);
		if (!license) throw new Error(`${packageJson.name}@${packageJson.version} has no usable license metadata`);

		records.push({
			ecosystem: "Composer",
			license,
			licenseText: await readLicenseText(packageDirectory),
			name: packageJson.name,
			repository: repositoryUrl(packageJson.source),
			version: packageJson.pretty_version ?? packageJson.version,
		});
	}

	return records;
}

const seedPaths =
	surface === "figma" ? ["packages/core", "packages/figma", "packages/www"] : ["packages/core", "packages/wp"];
const records = await collectJavaScriptPackages(seedPaths);
if (surface === "wp") records.push(...(await collectComposerPackages()));

records.sort(
	(a, b) => a.ecosystem.localeCompare(b.ecosystem) || a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
);

const sections = records.map((record) => {
	const repository = record.repository ? `\nRepository: ${record.repository}` : "";
	return `================================================================================
${record.name}@${record.version} (${record.ecosystem})
License: ${record.license}${repository}
================================================================================

${record.licenseText}`;
});

const header = `Third-Party Runtime Licenses
============================

This file is generated from the production dependency graph for the Core Framework ${surface === "wp" ? "WordPress" : "Figma"} artifact.
Core Framework's original source code is licensed under the MIT License. The packages listed below retain their own licenses.
See THIRD_PARTY_NOTICES.md or third-party-notices.txt for notices covering adapted source and artwork.

Packages: ${records.length}
Generated by: scripts/generate-third-party-licenses.ts
`;

await writeFile(outputPath, `${header}\n${sections.join("\n\n")}\n`);
console.log(`Wrote ${records.length} third-party package licenses to ${outputPath}`);
