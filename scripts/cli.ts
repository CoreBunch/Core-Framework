/**
 * Shared CLI utilities for Core Framework scripts
 *
 * Provides interactive terminal UI components:
 * - Arrow-key picker (choose)
 * - Text prompt
 * - Yes/No confirm
 * - Colored logging
 * - Semver utilities (parse, bump, picker)
 * - Version dashboard
 */

import * as readline from "readline";

// ─── Colors ─────────────────────────────────────────────────────────────────

export const c = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	inverse: "\x1b[7m",
	hideCursor: "\x1b[?25l",
	showCursor: "\x1b[?25h",
};

// ─── Logging ────────────────────────────────────────────────────────────────

export const log = (msg: string) => console.log(msg);
export const logStep = (msg: string) => log(`\n${c.bold}${c.blue}==> ${msg}${c.reset}`);
export const logSuccess = (msg: string) => log(`${c.green}✅ ${msg}${c.reset}`);
export const logError = (msg: string) => log(`${c.red}❌ ${msg}${c.reset}`);
export const logWarning = (msg: string) => log(`${c.yellow}⚠️  ${msg}${c.reset}`);

// ─── Prompt ─────────────────────────────────────────────────────────────────

export async function prompt(question: string): Promise<string> {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

export async function confirm(question: string): Promise<boolean> {
	const answer = await prompt(`${question} [y/N] `);
	return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

// ─── Interactive Picker ─────────────────────────────────────────────────────

export async function choose(title: string, options: string[]): Promise<number> {
	return new Promise((resolve) => {
		let selected = 0;

		const render = () => {
			// Move cursor up to redraw (except first render)
			if (rendered) {
				process.stdout.write(`\x1b[${options.length}A`);
			}

			for (let i = 0; i < options.length; i++) {
				const isSelected = i === selected;
				const prefix = isSelected ? `${c.cyan}❯${c.reset}` : " ";
				const label = isSelected
					? `${c.bold}${c.cyan}${options[i]}${c.reset}`
					: `${c.gray}${options[i]}${c.reset}`;
				process.stdout.write(`\x1b[2K  ${prefix} ${label}\n`);
			}
		};

		let rendered = false;

		log(`\n${c.bold}${title}${c.reset} ${c.dim}(↑↓ to move, Enter to select)${c.reset}`);
		render();
		rendered = true;

		process.stdout.write(c.hideCursor);

		if (!process.stdin.isTTY) {
			// Fallback for non-TTY (e.g. piped input)
			process.stdout.write(c.showCursor);
			resolve(0);
			return;
		}

		process.stdin.setRawMode(true);
		process.stdin.resume();

		const onKeypress = (data: Buffer) => {
			const key = data.toString();

			// Ctrl+C
			if (key === "\x03") {
				cleanup();
				process.exit(0);
			}

			// Enter
			if (key === "\r" || key === "\n") {
				cleanup();
				resolve(selected);
				return;
			}

			// Arrow keys (escape sequences)
			if (key === "\x1b[A" || key === "k") {
				// Up
				selected = (selected - 1 + options.length) % options.length;
				render();
			} else if (key === "\x1b[B" || key === "j") {
				// Down
				selected = (selected + 1) % options.length;
				render();
			}

			// Number keys (1-9)
			const num = parseInt(key, 10);
			if (num >= 1 && num <= options.length) {
				selected = num - 1;
				render();
				cleanup();
				resolve(selected);
			}
		};

		const cleanup = () => {
			process.stdin.setRawMode(false);
			process.stdin.pause();
			process.stdin.removeListener("data", onKeypress);
			process.stdout.write(c.showCursor);
		};

		process.stdin.on("data", onKeypress);
	});
}

// ─── Semver Utilities ──────────────────────────────────────────────────────

export type SemVer = {
	major: number;
	minor: number;
	patch: number;
	prerelease: string | null;
	prereleaseNum: number | null;
};

export function parseSemver(version: string): SemVer {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.?(\d+))?$/i);
	if (!match) throw new Error(`Invalid semver: ${version}`);
	return {
		major: parseInt(match[1]),
		minor: parseInt(match[2]),
		patch: parseInt(match[3]),
		prerelease: match[4] || null,
		prereleaseNum: match[5] != null ? parseInt(match[5]) : null,
	};
}

export function formatSemver(v: SemVer): string {
	let s = `${v.major}.${v.minor}.${v.patch}`;
	if (v.prerelease) {
		s += `-${v.prerelease}`;
		if (v.prereleaseNum != null) s += `.${v.prereleaseNum}`;
	}
	return s;
}

export type BumpType = "patch" | "minor" | "major" | "prerelease" | "custom";

export function bumpSemver(version: string, type: Exclude<BumpType, "custom">, preTag = "beta"): string {
	const v = parseSemver(version);
	switch (type) {
		case "patch":
			return formatSemver({ major: v.major, minor: v.minor, patch: v.patch + 1, prerelease: null, prereleaseNum: null });
		case "minor":
			return formatSemver({ major: v.major, minor: v.minor + 1, patch: 0, prerelease: null, prereleaseNum: null });
		case "major":
			return formatSemver({ major: v.major + 1, minor: 0, patch: 0, prerelease: null, prereleaseNum: null });
		case "prerelease":
			if (v.prerelease) {
				// Already a prerelease — increment the number
				return formatSemver({ ...v, prereleaseNum: (v.prereleaseNum ?? 0) + 1 });
			}
			// Bump patch and add prerelease tag
			return formatSemver({ major: v.major, minor: v.minor, patch: v.patch + 1, prerelease: preTag, prereleaseNum: 1 });
	}
}

/**
 * Interactive semver bump picker. Shows options with previews and returns the new version.
 * Returns null if the user cancels.
 */
export async function chooseBump(label: string, currentVersion: string): Promise<string | null> {
	const previews: { type: BumpType; label: string; version: string }[] = [
		{ type: "patch", label: "patch", version: bumpSemver(currentVersion, "patch") },
		{ type: "minor", label: "minor", version: bumpSemver(currentVersion, "minor") },
		{ type: "major", label: "major", version: bumpSemver(currentVersion, "major") },
		{ type: "prerelease", label: "pre", version: bumpSemver(currentVersion, "prerelease") },
	];

	const options = [
		...previews.map((p) => `${p.label.padEnd(6)} → ${p.version}`),
		"custom → enter manually",
		"skip",
	];

	const choice = await choose(`Bump ${label} (${c.cyan}${currentVersion}${c.reset})`, options);

	if (choice === options.length - 1) return null; // skip

	if (choice === options.length - 2) {
		// custom
		const custom = await prompt(`  Enter new version: `);
		if (!custom) return null;
		// Validate
		try {
			parseSemver(custom);
		} catch {
			logError(`Invalid semver: ${custom}`);
			return null;
		}
		return custom;
	}

	return previews[choice].version;
}

// ─── Version Dashboard ─────────────────────────────────────────────────────

export type VersionRow = {
	label: string;
	local: string;
	published: string;
};

export function renderDashboard(title: string, rows: VersionRow[]) {
	const maxLabel = Math.max(...rows.map((r) => r.label.length), 7);
	const maxLocal = Math.max(...rows.map((r) => r.local.length), 5);
	const maxPub = Math.max(...rows.map((r) => r.published.length), 9);

	const w = maxLabel + maxLocal + maxPub + 22; // padding + status column
	const line = "─".repeat(w);

	log("");
	log(`  ${c.gray}${line}${c.reset}`);
	log(`  ${c.bold}${c.cyan} ${title}${c.reset}`);
	log(`  ${c.gray}${line}${c.reset}`);

	// Header
	const hLabel = "Package".padEnd(maxLabel);
	const hLocal = "Local".padEnd(maxLocal);
	const hPub = "Published".padEnd(maxPub);
	log(`  ${c.dim} ${hLabel}   ${hLocal}   ${hPub}   Status${c.reset}`);
	log(`  ${c.gray}${line}${c.reset}`);

	for (const row of rows) {
		const label = row.label.padEnd(maxLabel);
		const local = row.local.padEnd(maxLocal);
		const pub = row.published.padEnd(maxPub);

		let status: string;
		if (row.published === "—") {
			status = `${c.gray}not published${c.reset}`;
		} else if (row.local === row.published) {
			status = `${c.green}✓ synced${c.reset}`;
		} else {
			status = `${c.yellow}↑ needs release${c.reset}`;
		}

		const localColor = row.local === row.published ? c.green : c.cyan;
		const pubColor = row.published === "—" ? c.gray : row.local === row.published ? c.green : c.yellow;

		log(
			`  ${c.bold} ${label}${c.reset}   ${localColor}${local}${c.reset}   ${pubColor}${pub}${c.reset}   ${status}`
		);
	}

	log(`  ${c.gray}${line}${c.reset}`);
	log("");
}
