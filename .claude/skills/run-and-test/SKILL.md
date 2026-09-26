---
name: run-and-test
description: How to boot, drive, and test every deliverable in the core-framework monorepo — the web app (www), the WordPress plugin (wp), and the Figma plugin (figma), plus the three integration bundles that ship inside the WordPress ZIP. Covers the exact commands and ports, the first-run onboarding wizard that blocks a clean browser profile, the rule that www is verified live through the agent browser rather than by an automated browser suite, the Docker-backed WordPress end-to-end harness and what it already asserts, the composer-install trap that makes the PHP tests look broken, worktree setup, the full verification gate with exit codes read directly, and the known traps that make a green run misleading. Use this skill before running or testing anything in core-framework, when review-pr needs to know how to boot the project, when a change needs verifying, or when setting up a worktree here.
---

# Running and testing core-framework

A bun workspace that ships **three products** from one shared core. Work out which one your change touches before running anything — the commands, the tests, and the proof differ completely.

| Deliverable | Package | Boot | Test | Verified live by |
|---|---|---|---|---|
| Web app | `packages/www` | `bun run dev:www` | `bun run test:www` | **agent browser, as a user** |
| WordPress plugin | `packages/wp` | `bun run dev:wp` | `bun run php-test:wp`, `bun run e2e:wp` | `e2e:wp` (Docker) |
| Figma plugin | `packages/figma` | `bun run dev:figma` | `bun run --filter './packages/figma' test` | Figma Desktop, by hand |

`packages/core` holds nearly all the logic and has no boot or test of its own — it is exercised through `test:www`. `packages/gutenberg`, `packages/blocks`, and `packages/builder-integrations` are **not** separate products: `scripts/build-wp-release.ts:81-83` builds all three into the WordPress ZIP.

Package manager is **bun** (`packageManager: bun@1.3.11`, `engines.bun: >=1.3.0 <1.4.0`). A `preinstall` hook hard-blocks npm and yarn. There is a stray `pnpm-workspace.yaml`; ignore it, bun's `workspaces` field in the root `package.json` is what is real.

## Live verification is done through the agent browser

**For anything user-visible in the web app, drive it in the browser yourself and look at it.** Not a headless script, not an assertion count — open it, click it, read it. This repo deliberately has no automated browser suite for www, and adding one is not the fix for a change you have not looked at.

```
preview_start {name: "www"}      # .claude/launch.json declares this, port 5173
read_page                        # structure and refs — prefer this over screenshot for text
computer {action: "screenshot"}  # what it actually looks like
read_console_messages            # errors the UI swallows
```

Then send David a screenshot as evidence. Never ask him to check something manually.

### The onboarding wizard will block you

`packages/www/src/App.tsx` opens a two-step onboarding wizard whenever storage holds no valid preset, so **a clean browser profile lands on the wizard, not the editor**:

1. *"How do you wish to start?"* — Core Framework / Variables only / Empty → **Continue**
2. *"Set up your basic preferences"* — root font size, dark mode → **Finish**

Source: `packages/www/src/components/Onboarding.tsx`.

**Finishing the wizard does not persist anything.** Reload and it comes straight back. `localStorage.current_framework` is written only by the explicit save/push (`packages/www/src/hooks/usePush.ts:246`) — the UI nudges you with *"Please, save changes to apply."* So:

- To reach the editor: click through the wizard (two clicks), or press **Save changes** once to persist.
- To reproduce a first-run bug: use a fresh origin or clear `localStorage.current_framework`.
- Don't read an empty `localStorage` as broken storage. It is the documented state until the first save.

### Ports drift, so confirm the one you are on

Vite **silently moves to the next free port** — with 5173 busy it takes 5174 without failing. Two checkouts and a worktree can each be serving a different build. Read the port out of the dev server's own output and drive that one; never assume 5173. `preview_start` returns the port it actually bound.

## packages/www — the web app

```bash
bun run dev:www
```

Vite 6 on :5173. No account, no database, no seed, no external service — projects live in browser storage. Boots straight to the editor once a preset is saved (880 selectors / 126 variables in the default preset).

```bash
bun run test:www
```

Jest with coverage, 23 suites / 147 tests, about 4s. This is the **only** automated coverage for `packages/core`, so a change to shared logic is tested here even when the change is for WordPress.

Build is `tsc && vite build` — the type-check is part of the build, so a change that runs in dev can still fail `build:www`.

## packages/wp — the WordPress plugin

### PHP tests, and the trap that makes them look broken

```bash
cd packages/wp && composer install     # or: bun run composer:dev
bun run php-test:wp
```

**Run `composer install` first.** `bun run composer:prod` installs `--no-dev`, which leaves `packages/wp/vendor/` without phpunit, and `php-test:wp` then dies with `no such file or directory: ./vendor/bin/phpunit`. That is a missing dev dependency, not a broken test suite. With dev deps installed: 28 tests, 52 assertions.

### The end-to-end harness

```bash
bun run e2e:wp        # builds the release ZIP, then tests it in disposable Docker
```

**Requires Docker running.** It builds the real release ZIP and installs it into a throwaway WordPress + MariaDB pair via wp-cli, on a random free port, tearing everything down on exit (`scripts/test-wp-e2e.sh`). It takes a few minutes. It runs on every PR in CI, and again inside the tag release workflow against the exact artifact being shipped.

This is a genuinely strong harness — **adopt it, do not replace it.** It already asserts:

- the plugin activates, at the expected version, with `core_framework_db_version` at `1.3`
- the `wp_core_framework_presets` table is created
- the generated stylesheet is written to uploads on activation
- REST routes reject a request with no nonce
- the Figma connection-key lifecycle: create → use → delete
- the CORS preflight allows Figma's `null` origin and the `X-Core-Framework-Key` header
- the editor CSS bundles `@font-face`/Inter Variable and makes **no** remote Google Fonts request
- deactivate → reactivate survives, the front end and REST index still respond
- retired commercial licence options are removed
- `debug.log` contains no fatal, parse, or uncaught error

To test a ZIP you already built, pass it: `bash scripts/test-wp-e2e.sh path/to.zip`.

### The dev server

```bash
bun run dev:wp        # builds builder integrations first, then vite
```

**Not verified during onboarding — it needs a real local WordPress.** Per `docs.md` it requires: a symlink from `packages/wp` into `wp-content/plugins/core-framework`, `packages/wp/.env` copied from `.env.example` and pointed at the local site (`DEV_PROTOCOL`, `DEV_URL`, `CERT_PATH`), HTTPS certificates, and `bun run composer:dev`. `dev`/`start` also rewrites `.env` to `development` via `env:dev`, and `build` rewrites it to `production` — so **the build mutates a tracked-adjacent file**; do not commit the flip.

If a change touches Bricks, Oxygen, or Gutenberg behaviour, verify it in that editor. `e2e:wp` does not open a builder.

## packages/figma — the Figma plugin

```bash
bun run --filter './packages/figma' test    # bun test, 7 tests, instant
bun run dev:figma                            # watch build
```

Then import `packages/figma/manifest.json` through **Figma → Plugins → Development → Import plugin from manifest**. **Not verified during onboarding** — it needs Figma Desktop, so there is no automated coverage of the plugin inside Figma. The two test files cover frame messaging and the WordPress connection only.

## Worktrees

Worktrees live at `<repo>/.worktrees/<slug>` (see the global `worktrees` skill). `.worktrees/` is gitignored.

```bash
git worktree add -f --detach .worktrees/<slug> origin/main
cd .worktrees/<slug>
bun install --frozen-lockfile
```

**`bun install` is the only setup a worktree needs.** About 7s with a warm bun cache, 3690 packages. Verified from a clean worktree: `dev:www` boots and reaches the editor, `test:www` passes 147/147, and the full `e2e:wp` passes — `e2e:wp` needs no `.env` because it builds a release ZIP and runs it in Docker.

You only need to copy `packages/wp/.env` (gitignored) if you intend to run `dev:wp` against a local WordPress from the worktree.

## The verification gate

Run this **once, at the end**, not after every edit. Capture exit codes directly — piping into `tail` or `grep` reports the pipe's status and will show green over a failed build.

```bash
bun run test:www      > /tmp/t.log  2>&1; echo "TEST=$?"
bun run build:www     > /tmp/bw.log 2>&1; echo "BUILD_WWW=$?"
bun run build:wp      > /tmp/bp.log 2>&1; echo "BUILD_WP=$?"
bun run build:figma   > /tmp/bf.log 2>&1; echo "BUILD_FIGMA=$?"
bun run check:open-source > /tmp/os.log 2>&1; echo "BOUNDARIES=$?"
```

With Composer dev dependencies installed, and Docker running for the last one:

```bash
bun run php-test:wp   > /tmp/php.log 2>&1; echo "PHP=$?"
bun run e2e:wp        > /tmp/e2e.log 2>&1; echo "E2E=$?"
```

Scale it to the change: a www-only change does not need `e2e:wp`; anything touching `packages/core`, `packages/wp`, or the release scripts does.

`bun run check:open-source` is an **architecture gate**, not a lint — see `maintain` for what it forbids and why. CI runs it on the built `wp` and `figma` bundles too, so it can fail on output that looks fine in source.

## Traps that make a run misleading

- **`bun run lint` rewrites your files.** Both packages run `biome check --write --unsafe`. It is a formatter-with-fixes, not a read-only check; run it deliberately and read the resulting diff. `bun run format` (prettier over every package) also writes.
- **`build:wp` rewrites `packages/wp/.env` to `production`** (via `env:prod`), and `dev:wp`/`start` rewrites it back to `development` (via `env:dev`). An unexpected `.env` diff is usually this, not your change. Note `release:wp` and `e2e:wp` do **not** touch the file — they pass `APP_ENV` as an environment variable instead (`scripts/build-wp-release.ts:85-86`), so a stale `production` in `.env` came from a previous `build:wp`, not from the release path.
- **`e2e:wp` fails fast and loudly without Docker** — "Docker is required for the WordPress end-to-end test." That is an environment problem, not a regression.
- **The type-check lives in the build**, not in the tests. `test:www` passing tells you nothing about types.
- **`test:www` is the only coverage for `packages/core`.** A green WordPress PHP suite says nothing about shared logic.
- **A passing `e2e:wp` does not exercise any builder UI.** Bricks and Oxygen behaviour is unverified by every automated check in this repo.
- Vite's silent port increment (above) — the most common way to verify the wrong build.
