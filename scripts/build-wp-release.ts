#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const WP_DIR = join(ROOT, "packages", "wp");
const RELEASE_DIR = join(ROOT, ".tmp", "release");
const STAGING_DIR = join(RELEASE_DIR, "core-framework");

const requestedVersion = Bun.argv[2]?.replace(/^v/, "");

function fail(message: string): never {
	throw new Error(message);
}

async function run(command: string, args: string[], cwd = ROOT, extraEnv: Record<string, string> = {}) {
	const process = Bun.spawn([command, ...args], {
		cwd,
		env: { ...Bun.env, ...extraEnv },
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});

	const exitCode = await process.exited;
	if (exitCode !== 0) {
		fail(`${command} ${args.join(" ")} failed with exit code ${exitCode}`);
	}
}

async function getReleaseVersion(): Promise<string> {
	const plugin = await readFile(join(WP_DIR, "core-framework.php"), "utf8");
	const match = plugin.match(/^\s*\* Version:\s*([^\s]+)\s*$/m);
	if (!match) fail("Could not read the WordPress plugin version");

	const version = match[1];
	if (!/^\d+\.\d+\.\d+$/.test(version)) {
		fail(`Plugin version is not valid semver: ${version}`);
	}
	if (requestedVersion && requestedVersion !== version) {
		fail(`Release version ${requestedVersion} does not match plugin version ${version}`);
	}

	const versionFiles = [
		["packages/wp/package.json", /"version"\s*:\s*"([^"]+)"/],
		["packages/wp/readme.txt", /^Stable tag:\s*([^\s]+)\s*$/m],
		["packages/core/src/constants/version.ts", /APP_VERSION\s*=\s*"([^"]+)"/],
	] as const;

	for (const [path, pattern] of versionFiles) {
		const content = await readFile(join(ROOT, path), "utf8");
		const fileVersion = content.match(pattern)?.[1];
		if (fileVersion !== version) {
			fail(`${path} has version ${fileVersion ?? "<missing>"}; expected ${version}`);
		}
	}

	return version;
}

async function copyReleaseEntry(source: string, destination = source) {
	const from = join(WP_DIR, source);
	if (!existsSync(from)) fail(`Required release entry is missing: packages/wp/${source}`);

	const to = join(STAGING_DIR, destination);
	await mkdir(dirname(to), { recursive: true });
	await cp(from, to, { recursive: true });
}

const version = await getReleaseVersion();
const archivePath = join(RELEASE_DIR, `core-framework-${version}.zip`);

if (!existsSync(join(WP_DIR, "composer.lock"))) {
	fail("packages/wp/composer.lock is missing. Generate and commit it before building a release.");
}

console.log(`Building Core Framework ${version} release...`);

await run("bun", ["run", "build:gutenberg"]);
await run("bun", ["run", "build:builders"]);
await run("bun", ["run", "build:blocks"]);
await run("composer", ["install", "--no-dev", "--prefer-dist", "--optimize-autoloader", "--no-interaction", "--no-progress"], WP_DIR);
await run("bunx", ["tsc"], WP_DIR, { APP_ENV: "production" });
await run("bunx", ["vite", "build"], WP_DIR, { APP_ENV: "production" });
await run("bun", ["run", "scripts/check-open-source-boundaries.ts", "source"]);
await run("bun", ["run", "scripts/check-open-source-boundaries.ts", "wp"]);

await rm(STAGING_DIR, { recursive: true, force: true });
await rm(archivePath, { force: true });
await mkdir(STAGING_DIR, { recursive: true });

for (const directory of ["assets", "dist", "gutenberg", "gutenberg-blocks", "languages", "vendor", "wp"]) {
	await copyReleaseEntry(directory);
}

for (const file of [
	"composer.json",
	"composer.lock",
	"core-framework.php",
	"index.php",
	"LICENSE",
	"third-party-notices.txt",
	"readme.txt",
]) {
	await copyReleaseEntry(file);
}

await run("bun", [
	"run",
	"scripts/generate-third-party-licenses.ts",
	"wp",
	join(STAGING_DIR, "third-party-licenses.txt"),
]);

// Generated CSS belongs to each WordPress installation, never to the release.
await rm(join(STAGING_DIR, "assets", "public", "css", "core_framework.css"), { force: true });
await rm(join(STAGING_DIR, "assets", "public", "css", ".gitkeep"), { force: true });

// Composer archives can contain development metadata that is not part of the plugin.
await rm(join(STAGING_DIR, "vendor", "bin", ".phpunit.result.cache"), { force: true });
await rm(join(STAGING_DIR, "vendor", "composer", "installers", ".github"), { recursive: true, force: true });

const forbiddenEntries = [".env", "node_modules", "src", "Tests"];
for (const entry of forbiddenEntries) {
	if (existsSync(join(STAGING_DIR, entry))) fail(`Forbidden release entry was staged: ${entry}`);
}

await run("zip", ["-X", "-q", "-r", archivePath, basename(STAGING_DIR)], RELEASE_DIR);

console.log(`Release directory: ${STAGING_DIR}`);
console.log(`Release archive: ${archivePath}`);
