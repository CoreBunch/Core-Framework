#!/usr/bin/env bun
/**
 * Version Change Script for Core Framework
 *
 * Interactively bumps the unified version across all packages using a semver picker
 * (patch/minor/major/pre/custom).
 *
 * All packages share a single version. Files updated:
 * - packages/blocks/src/theme-toggle/block.json
 * - packages/core/src/constants/version.ts
 * - packages/gutenberg/package.json
 * - packages/gutenberg/plugin.php
 * - packages/wp/gutenberg-blocks/theme-toggle/block.json
 * - packages/wp/core-framework.php
 * - packages/wp/package.json
 * - packages/wp/readme.txt
 * - packages/www/package.json
 *
 * Usage: bun run bump
 */

import { $ } from "bun";
import { c, log, logStep, logSuccess, logWarning, logError, chooseBump, confirm } from "./cli";

// ─── Files to update ──────────────────────────────────────────────────────

const VERSION_FILES = [
	"packages/blocks/src/theme-toggle/block.json",
	"packages/core/src/constants/version.ts",
	"packages/gutenberg/package.json",
	"packages/gutenberg/plugin.php",
	"packages/wp/gutenberg-blocks/theme-toggle/block.json",
	"packages/wp/core-framework.php",
	"packages/wp/package.json",
	"packages/wp/readme.txt",
	"packages/www/package.json",
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getCurrentVersion(): Promise<string> {
	const content = await Bun.file("packages/core/src/constants/version.ts").text();
	const match = content.match(/APP_VERSION\s*=\s*"([^"]+)"/);
	if (!match) throw new Error("Could not read current version from packages/core/src/constants/version.ts");
	return match[1];
}

async function updateFile(filePath: string, oldVersion: string, newVersion: string): Promise<boolean> {
	try {
		const file = Bun.file(filePath);
		if (!(await file.exists())) {
			log(`  ${c.yellow}Skipped: ${filePath} (not found)${c.reset}`);
			return true;
		}

		let content = await file.text();
		const originalContent = content;

		if (filePath.endsWith(".json")) {
			// For JSON files, only replace in "version" fields to be safe
			if (filePath.endsWith("block.json")) {
				// block.json has a simple version field
				content = content.replace(
					new RegExp(`"version":\\s*"${escapeRegex(oldVersion)}"`, "g"),
					`"version": "${newVersion}"`
				);
			} else if (filePath.endsWith("package.json")) {
				content = content.replace(
					new RegExp(`"version":\\s*"${escapeRegex(oldVersion)}"`, "g"),
					`"version": "${newVersion}"`
				);
			}
		} else if (filePath.endsWith(".ts")) {
			content = content.replace(
				new RegExp(`"${escapeRegex(oldVersion)}"`, "g"),
				`"${newVersion}"`
			);
		} else if (filePath.endsWith(".php")) {
			// PHP plugin headers
			content = content.replace(
				new RegExp(`Version:\\s+${escapeRegex(oldVersion)}`, "g"),
				`Version:         ${newVersion}`
			);
			content = content.replace(
				new RegExp(`@version\\s+${escapeRegex(oldVersion)}`, "g"),
				`@version  ${newVersion}`
			);
			// PHP constants
			content = content.replace(
				new RegExp(`'${escapeRegex(oldVersion)}'`, "g"),
				`'${newVersion}'`
			);
		} else if (filePath === "packages/wp/readme.txt") {
			content = content.replace(
				new RegExp(`Stable tag:\\s*${escapeRegex(oldVersion)}`, "g"),
				`Stable tag: ${newVersion}`
			);
		} else {
			// Generic replacement
			content = content.replace(
				new RegExp(escapeRegex(oldVersion), "g"),
				newVersion
			);
		}

		if (content !== originalContent) {
			await Bun.write(filePath, content);
			log(`  ${c.green}✓ ${filePath}${c.reset}`);
			return true;
		} else {
			log(`  ${c.yellow}⊘ ${filePath} (no changes)${c.reset}`);
			return true;
		}
	} catch (error) {
		log(`  ${c.red}✗ ${filePath} - ${error}${c.reset}`);
		return false;
	}
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
	console.clear();
	log(`\n${c.bold}${c.cyan}  Core Framework Version Bump${c.reset}\n`);

	const currentVersion = await getCurrentVersion();
	log(`  ${c.gray}Current version: ${c.cyan}${currentVersion}${c.reset}\n`);

	const newVersion = await chooseBump("Core Framework", currentVersion);

	if (!newVersion) {
		log(`\n${c.yellow}  Bump cancelled.${c.reset}\n`);
		process.exit(0);
	}

	logStep(`Bumping ${currentVersion} → ${newVersion}`);
	log("");

	let allSuccess = true;
	for (const file of VERSION_FILES) {
		const success = await updateFile(file, currentVersion, newVersion);
		if (!success) allSuccess = false;
	}

	if (!allSuccess) {
		logError("Some files failed to update!");
		process.exit(1);
	}

	logSuccess(`Version updated to ${newVersion}`);

	// Commit changes
	log("");
	if (await confirm("Commit changes?")) {
		try {
			const commitMsg = `BUMP: ${newVersion}`;
			await $`git add ${VERSION_FILES}`;
			await $`git commit -m ${commitMsg}`;
			logSuccess(`Changes committed: ${commitMsg}`);
		} catch (error) {
			logWarning(`Failed to commit: ${error}`);
			logWarning("You may need to commit manually.");
		}
	} else {
		log(`\n  ${c.dim}Files updated but not committed.${c.reset}`);
	}

	log("");
}

main().catch((error) => {
	logError(`Unexpected error: ${error}`);
	process.exit(1);
});
