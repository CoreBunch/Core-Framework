---
name: release
description: How core-framework ships, and the agent's operating procedure around it. Covers the three distinct release paths — the WordPress plugin (tag-driven, deployed to WordPress.org over SVN), the Figma plugin (packaged by the same tag but published to Figma Community by hand), and the web app (a static bundle this repo does not deploy at all) — plus what must be true on main first, which single version constant drives all ten pinned files, what the tag workflow does automatically, and which steps are irreversible and therefore need David's explicit go-ahead. Use this skill when cutting a release in core-framework, when preparing main for one, when a tag or publish is being considered, or when working out whether a change has actually shipped.
---

# Releasing core-framework

**`RELEASING.md` is the source of truth.** Read it before acting; this skill is the agent's operating procedure around it, not a copy.

> **Cutting a release is David's decision, never inferred.** Do not bump, tag, or publish because a change looks finished, because CI is green, or because the changelog has entries. Ask.

## Three release paths, one tag

They share a version and a trigger but end in different places on different cadences. Never merge them into one narrative — the wrong one gets run.

| Artifact | Trigger | Destination | Automated? |
|---|---|---|---|
| **WordPress plugin** | push tag `v*.*.*` | WordPress.org (SVN) + GitHub Release | fully |
| **Figma plugin** | push tag `v*.*.*` | GitHub Release ZIP only | packaging only |
| **Web app** (`www`) | — | static `packages/www/dist` | **not deployed by this repo** |

**The web app has no release path here.** No workflow builds or deploys it; `README.md:210` describes it as a static bundle to serve from any host. Hosting lives outside the repository, so "released" for www means whatever the external host does. Do not claim a www change has shipped on the strength of a tag.

**Figma Community publishing is manual and separate.** The tag packages `core-framework-figma-X.Y.Z.zip` and attaches it to the GitHub Release, but does not touch Figma Community. That is a maintainer action through Figma Desktop (`RELEASING.md` → *Figma Community publishing*). A tagged release therefore leaves Figma Community users on the old version until David publishes. Say so rather than implying the release is complete.

## Before a tag: what must be true on main

1. **On `main`, clean tree, CI green.** `scripts/release.ts` enforces branch and cleanliness and stops otherwise.
2. **Version bumped via `bun run bump`.** One constant, `APP_VERSION` in `packages/core/src/constants/version.ts`, drives ten pinned files — see `maintain` → *Registries*. The release builders reject a tag that does not match all of them, including `packages/wp/readme.txt`'s WordPress.org stable tag.
3. **Changelog closed.** Per `maintain`, entries are written per change, so release only *verifies*. Confirm every PR merged since the last tag is either present or justifiably absent, then close the open version by **adding its date** to the existing dateless heading. Nothing else moves. If you are authoring entries from `git log` at this point, the discipline failed upstream — say so.
4. **The gate passes.** See `run-and-test`. Docker must be running for `e2e:wp`.

## Cutting it

The helper does the whole sequence and stops for confirmation before anything irreversible:

```bash
bun run release
```

`scripts/release.ts` checks branch and cleanliness, resolves the version, refuses if the tag already exists, then runs `test:www`, a Composer install, PHPUnit, `release:wp`, and `release:figma` — and **only then** asks before creating and pushing the tag. If you decline, the built ZIPs remain in `.tmp/release/`.

The manual equivalent is in `RELEASING.md` → *Manual tag flow*.

## What the tag workflow does on its own

`.github/workflows/release.yml`, on `v*.*.*`:

- **verify** — audits JS and PHP dependencies, runs the web and PHP tests, lints PHP syntax, builds www/figma/wp, checks the production Vite manifest exists, and runs `check:open-source`
- **package** — builds both release ZIPs at the tag's version and **runs the full WordPress E2E against the actual ZIP being shipped**
- **publish** — deploys to WordPress.org over SVN via the `wordpress-org` environment, creates the GitHub Release if missing, and uploads both ZIPs

It never deletes or rewrites an existing WordPress.org tag.

Requires the protected `wordpress-org` environment with `SVN_USERNAME` and `SVN_PASSWORD`. The GitHub Release uses the built-in `GITHUB_TOKEN`.

## Irreversible — get David's explicit go-ahead

Ask before each, and never batch them into one approval:

- **Pushing the tag.** It starts the whole chain, including the WordPress.org deploy. Deleting a tag afterwards does not un-publish anything.
- **The WordPress.org SVN deploy.** Public and effectively permanent; the workflow will not rewrite an existing tag, so a mistake ships as a new version.
- **Publishing to Figma Community.** Reaches every installed user through Figma's own channel.

Reverting means shipping a *new, higher* version. Plan accordingly.

## Ordering

- The tag must exist and its artifacts must be built before anything is published — the workflow enforces this with `verify → package → publish`.
- **A security fix must not be described publicly before the fixed artifact exists.** Let the release complete, then publish the advisory. `SECURITY.md` covers private reporting.
- Publish to Figma Community only after the GitHub Release carries the matching Figma ZIP, so the manifest ID and the artifact agree.

## Verifying a release actually landed

- WordPress.org shows the new stable tag, matching `packages/wp/readme.txt`.
- The GitHub Release carries **both** `core-framework-X.Y.Z.zip` and `core-framework-figma-X.Y.Z.zip`.
- The `publish` job succeeded — a green `verify` alone means nothing shipped.
- Figma Community still shows the old version until David publishes by hand. Report that as outstanding, not done.
