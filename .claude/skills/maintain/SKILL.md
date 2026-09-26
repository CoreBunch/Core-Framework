---
name: maintain
description: What a change owes the core-framework repo before it is finished — which document to read before touching a given area, which document goes stale when you change it, how this repo's changelog works (Keep a Changelog headings, bracketed version numbers, never an `Unreleased` section: the open version is a bracketed number with no date, and an agent asks David which bump to open rather than guessing), and the registries that must stay in step: the ten files the version bump touches, the open-source boundary gate and its allowlist, the WordPress database version that is asserted in two places at once, and the generated third-party licence inventory. Use this skill when changing code in core-framework, when deciding whether a change is finished, when a change touches docs or the changelog, or when review-pr needs to know what this repo expects of a pull request.
---

# Maintaining core-framework

What a change owes this repo. For how to run and verify anything here, see `run-and-test`.

## Read before you touch it

| Touching | Read first |
|---|---|
| Anything at all | `CLAUDE.md` — the rulebook, including the never-change constraints |
| Shared logic, preset shape, data flow | `docs.md` → *Architecture*, *Project Data* |
| Preset schema, validation | `packages/core/src/schema/preset.schema.ts`, `packages/core/src/functions/validatePreset.ts` |
| Colors, shades, tints | `CLAUDE.md` → *Never Change*; colour-system IDs are a builder-compatibility contract |
| WordPress persistence, REST | `docs.md` → *WordPress Plugin*; routes live under `core-framework/v2` |
| Plugin activation, upgrades, options | `packages/wp/wp/Config/Setup.php` — the only place retired licence options may be named |
| Bricks / Oxygen behaviour | `packages/builder-integrations`; it is built **into** the WP ZIP, not shipped separately |
| Figma sync, connection keys | `docs.md` → *Figma Plugin*; keys are secrets |
| Release, versioning, tagging | `RELEASING.md`, and this repo's `release` skill |
| Opening a pull request | `CONTRIBUTING.md`, plus the global `pull-requests` skill |

There is no `docs/` tree yet — `docs/` currently holds only `assets/`. The root `docs.md`, `README.md`, `CONTRIBUTING.md`, and `RELEASING.md` carry that weight for now. If you find yourself wanting `docs/architecture.md`, that gap is known and tracked against `repo-standards`; note it, finish your work, and offer the tree as its own change.

## Update in the same change

**A doc that lies is worse than a missing one.** When your change makes one of these wrong, fix it in the same commit — not a follow-up, not a TODO.

| You changed | Update |
|---|---|
| Boot, setup, or prerequisites for any package | `docs.md`, and `run-and-test` if the command or its traps changed |
| The verification commands | `CONTRIBUTING.md` → *Verification*, `docs.md`, and `run-and-test` |
| Package roles or where logic lives | `docs.md` → *Architecture*, `CLAUDE.md` → *Package Structure* |
| Preset shape, migrations, persisted data | `docs.md` → *Project Data* and *Compatibility Constraints* |
| Release flow, artifacts, or required secrets | `RELEASING.md`, and the `release` skill |
| Anything a user would notice | `CHANGELOG.md` — see below |

If a change adds a case that a registry below tracks, register it in the same commit.

## The changelog

`CHANGELOG.md`, Keep a Changelog format. Versions are **bracketed** headings; released ones carry a date:

```markdown
## [2.0.1] - 2026-08-18

### Fixed

- Restored the Auto BEM class generator in the Bricks structure panel. 2.0.0 moved the
  builder connector into the page footer while the generator still loaded in the head, so
  the generator read an undefined connector, failed its own feature check, and never started.
```

Theme headings in use: `### Fixed`, `### Changed`, `### Added`. Match them; never introduce a second format.

**Voice:** write for the person upgrading. Say what changed and what they must do about it. This repo's entries routinely explain the *cause* when it helps a user understand the blast radius — copy that. Never describe which files moved.

### No `Unreleased` section

**Never create or write into a section called `Unreleased`.** The top section is the version currently being accumulated, written as a bracketed version number with **no date**:

```markdown
## [2.0.3]

### Fixed

- ...

## [2.0.2] - 2026-08-28
```

**The missing date is what marks it unreleased.** On release, `release` adds the date to that heading. Nothing else moves.

Deciding where your entry goes:

1. **Top heading is a version with no date** → add your entry there, under the matching theme heading (create the theme heading if it is missing).
2. **Top heading has a date** → everything is released, so your change opens a new version. **Ask David which bump it is** (patch, minor, major), describing the change so he can judge. Do not pick a number silently, and never fall back to an `Unreleased` heading.
3. **Unsure it earns an entry at all** → ask. A missing entry is easier to spot than a wrong one.

When several open PRs each add an entry, the first to merge opens the version; later ones rebase onto it and add under the same heading.

Entries are written per change. `release` only *verifies* they exist and closes the version with a date. If release is reconstructing entries from `git log`, the discipline has already failed here.

**Earns an entry:** bug fixes a user could hit, new capabilities, behaviour changes, security fixes.
**Does not:** internal refactors, test-only changes, doc edits, invisible dependency bumps.

## Registries that must stay in step

These are the obligations most easily forgotten and most annoying to reconstruct.

### 1. The version is pinned in ten files

Source of truth is `APP_VERSION` in `packages/core/src/constants/version.ts`. **Never hand-edit the others** — run `bun run bump`, which updates all ten (`scripts/version-change.ts`):

```
packages/blocks/src/theme-toggle/block.json
packages/core/src/constants/version.ts
packages/figma/package.json
packages/gutenberg/package.json
packages/gutenberg/plugin.php
packages/wp/gutenberg-blocks/theme-toggle/block.json
packages/wp/core-framework.php
packages/wp/package.json
packages/wp/readme.txt          ← WordPress.org "Stable tag"
packages/www/package.json
```

The release builders **reject** a tag whose version does not match every one of these.

### 2. The open-source boundary gate

`bun run check:open-source` (`scripts/check-open-source-boundaries.ts`) is an **architecture test, not a lint**. It fails the build on forbidden strings in `packages/{core,figma,wp,www}/src`, `packages/wp/wp`, and — in CI — the built `packages/figma/dist` and `packages/wp/dist`:

| Forbidden | Why |
|---|---|
| `x-api-key` | no client-side credential for the public preset importer |
| `picsum.photos` | no remote placeholder images |
| the remote Inter `fonts.googleapis.com` URL | the UI font is bundled, not fetched |
| `Version 1.0.1` | stale Figma version copy |
| `_license_key`, `free_license` | retired commercial options, **allowed only** in `packages/wp/wp/Config/Setup.php`, the deletion-only migration |

**Never weaken this gate to make a diff pass.** If your change legitimately moves the boundary, update the check in the same change and explain why in the PR. Note it can fail on *built output* that looks clean in source.

### 3. The WordPress database version is asserted in two places

`CORE_FRAMEWORK_DB_VER` is defined in `packages/wp/core-framework.php:42` (currently `1.3`) and read through `packages/wp/wp/Config/Setup.php`. **`scripts/test-wp-e2e.sh` asserts the literal value** (`core_framework_db_version` == `1.3`). Bump one without the other and the E2E fails in CI, not locally.

Stored data is not disposable: schema changes ship as new, additive, non-destructive migrations, and no change may require dropping or recreating a table. Live sites upgrade from 1.10.4 and earlier through this path.

### 4. Generated licence inventory

`THIRD_PARTY_NOTICES.md` and the per-artifact `third-party-licenses.txt` are generated (`scripts/generate-third-party-licenses.ts`) during the release build. Adding or removing a production dependency changes them. Do not hand-edit; explain any generated-file change in the PR, as `CONTRIBUTING.md` requires.

### 5. The E2E assertions are a registry too

`scripts/test-wp-e2e.sh` hard-codes expectations about activation, options, REST behaviour, CORS headers, and bundled fonts. If your change legitimately alters one of those, update the assertion in the same commit and say why.

## Never change without a migration

From `CLAUDE.md` and `docs.md`, because breaking these breaks live sites and builder sync:

- **Colour-system IDs** — Bricks and Oxygen synchronise on them.
- **Shade, tint, spacing, and typography generation** — must stay deterministic.
- **The app version and migrations** when the persisted preset shape changes.

Code has no such constraint: rename freely, delete dead code, fix bad abstractions in place. Do not add compatibility shims for internal APIs nobody has published against.

## Done means

1. The code works and you have **watched it work** — for the web app, in the agent browser, as a user (`run-and-test`).
2. The gate passes with exit codes you actually read, scaled to what the change touches.
3. Every doc describing what you changed is updated in the same change.
4. A changelog entry exists if a user would notice — filed under the open, dateless version heading. If the top heading is dated, ask David which bump to open; never create `Unreleased`.
5. Every registry above that your change touches has been updated.
6. Anything you could not verify is stated plainly. Bricks, Oxygen, and Figma-in-Figma have **no automated coverage** — if you changed them and did not open the editor, say so.
