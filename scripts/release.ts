#!/usr/bin/env bun

import { $ } from "bun";
import { resolve } from "node:path";
import { confirm } from "./cli";

const ROOT = resolve(import.meta.dir, "..");

async function output(command: ReturnType<typeof $>): Promise<string> {
	return (await command.quiet()).stdout.toString().trim();
}

async function fail(message: string): Promise<never> {
	console.error(`\nRelease stopped: ${message}\n`);
	process.exit(1);
}

process.chdir(ROOT);

const branch = await output($`git branch --show-current`);
if (branch !== "main") await fail(`current branch is ${branch || "unknown"}; expected main`);

const status = await output($`git status --porcelain`);
if (status) await fail("the working tree is not clean");

const versionFile = await Bun.file("packages/core/src/constants/version.ts").text();
const version = versionFile.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) await fail("could not resolve a valid release version");

const tag = `v${version}`;
const existingTag = await output($`git tag --list ${tag}`);
if (existingTag) await fail(`tag ${tag} already exists locally`);

console.log(`Preparing Core Framework ${version}...`);

await $`bun run test:www -- --watchman=false`;
await $`composer install --working-dir=packages/wp --prefer-dist --no-interaction --no-progress`;
await $`packages/wp/vendor/bin/phpunit packages/wp/Tests`;
await $`bun run release:wp -- ${version}`;
await $`bun run release:figma -- ${version}`;

console.log(`\nReady to publish ${tag}.`);
console.log(`Pushing the tag will run verification, deploy WordPress.org, create the GitHub Release, and upload both ZIPs.`);

if (!(await confirm(`Create and push ${tag}?`))) {
	console.log("Release cancelled. The local ZIPs remain in .tmp/release/.");
	process.exit(0);
}

await $`git tag -a ${tag} -m ${`Core Framework ${version}`}`;
await $`git push origin ${tag}`;

console.log(`\n${tag} pushed. Follow the Release workflow in GitHub Actions.`);
