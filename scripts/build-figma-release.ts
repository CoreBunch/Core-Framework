#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const FIGMA_DIR = join(ROOT, "packages", "figma");
const RELEASE_DIR = join(ROOT, ".tmp", "release");
const STAGING_DIR = join(RELEASE_DIR, "core-framework-figma");

const requestedVersion = Bun.argv[2]?.replace(/^v/, "");

function fail(message: string): never {
	throw new Error(message);
}

async function run(command: string, args: string[], cwd = ROOT) {
	const process = Bun.spawn([command, ...args], {
		cwd,
		env: Bun.env,
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
	const packageJson = JSON.parse(await readFile(join(FIGMA_DIR, "package.json"), "utf8"));
	const version = packageJson.version;

	if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
		fail(`Figma package version is not valid semver: ${String(version)}`);
	}
	if (requestedVersion && requestedVersion !== version) {
		fail(`Release version ${requestedVersion} does not match Figma package version ${version}`);
	}

	const versionFile = await readFile(join(ROOT, "packages/core/src/constants/version.ts"), "utf8");
	const coreVersion = versionFile.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
	if (coreVersion !== version) {
		fail(`packages/core/src/constants/version.ts has version ${coreVersion ?? "<missing>"}; expected ${version}`);
	}

	return version;
}

async function copyReleaseEntry(source: string, destination = source, fromRoot = FIGMA_DIR) {
	const from = join(fromRoot, source);
	if (!existsSync(from)) fail(`Required Figma release entry is missing: ${from}`);

	const to = join(STAGING_DIR, destination);
	await mkdir(dirname(to), { recursive: true });
	await cp(from, to, { recursive: true });
}

const version = await getReleaseVersion();
const archivePath = join(RELEASE_DIR, `core-framework-figma-${version}.zip`);

console.log(`Building Core Framework for Figma ${version} release...`);

await run("bun", ["run", "build:figma"]);
await run("bun", ["run", "scripts/check-open-source-boundaries.ts", "source"]);
await run("bun", ["run", "scripts/check-open-source-boundaries.ts", "figma"]);

const manifest = JSON.parse(await readFile(join(FIGMA_DIR, "manifest.json"), "utf8"));
if (manifest.main !== "dist/code.js" || manifest.ui !== "dist/index.html") {
	fail("packages/figma/manifest.json must point to dist/code.js and dist/index.html");
}

await rm(STAGING_DIR, { recursive: true, force: true });
await rm(archivePath, { force: true });
await mkdir(STAGING_DIR, { recursive: true });

for (const entry of ["manifest.json", "README.md", "dist/code.js", "dist/index.html"]) {
	await copyReleaseEntry(entry);
}

for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
	await copyReleaseEntry(file, file, ROOT);
}

await run("bun", [
	"run",
	"scripts/generate-third-party-licenses.ts",
	"figma",
	join(STAGING_DIR, "THIRD_PARTY_LICENSES.txt"),
]);

for (const forbiddenEntry of [".env", ".generated", "node_modules", "src"]) {
	if (existsSync(join(STAGING_DIR, forbiddenEntry))) {
		fail(`Forbidden Figma release entry was staged: ${forbiddenEntry}`);
	}
}

await run("zip", ["-X", "-q", "-r", archivePath, basename(STAGING_DIR)], RELEASE_DIR);

console.log(`Figma release directory: ${STAGING_DIR}`);
console.log(`Figma release archive: ${archivePath}`);
