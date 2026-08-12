# Contributing To Core Framework

Thanks for helping improve Core Framework. Contributions should keep projects portable, CSS output stable, and the shared core consistent across the web app, WordPress, and Figma.

## Start Here

1. Read [README.md](README.md) for product context and local setup.
2. Read [docs.md](docs.md) before changing shared data, CSS generation, or platform integrations.
3. Check existing issues before starting a large change.
4. For security-sensitive findings, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Local Development

Use Bun for JavaScript dependencies and project commands:

```sh
bun install
bun run dev:www
```

Useful development commands:

```sh
bun run dev:www
bun run dev:wp
bun run dev:figma
bun run build:builders
bun run build:gutenberg
```

The WordPress package also requires PHP 8.0 or newer and Composer:

```sh
cd packages/wp
bun run composer:dev
```

## Verification

Run checks relevant to the packages you changed. Changes to `packages/core` must be verified against both the web and WordPress builds.

```sh
bun run test:www
bun run build:www
bun run build:wp
bun run build:figma
bun run lint
```

When Composer dependencies are installed:

```sh
bun run php-test:wp
```

If a change touches Bricks, Oxygen, or Gutenberg behavior, verify it in the relevant WordPress editor as well as in automated checks.

## Pull Requests

- Keep each pull request focused on one problem.
- Include tests for behavior changes and regressions.
- Update documentation when behavior, configuration, public APIs, or setup instructions change.
- Explain any generated-file changes in the pull request description.
- Do not commit `.env` files, credentials, private site URLs, WordPress uploads, or local build artifacts.
- Preserve third-party copyright and license notices.

## Project Conventions

Shared application logic belongs in `packages/core`. Keep `packages/www` and `packages/wp` focused on platform-specific storage, transport, and integration behavior.

The project schema and generated CSS are compatibility surfaces. In particular:

- Do not change established color-system IDs without a migration plan.
- Keep shade and tint generation deterministic.
- Preserve project migrations and application-version tracking.
- Validate imported or remotely loaded project data before using it.
- Keep generated CSS behavior covered by tests.

Use existing UI components and state patterns before adding another library or parallel abstraction.

## Licensing Contributions

By submitting a contribution, you agree that it may be distributed under the [MIT License](LICENSE). Only submit code, documentation, and assets that you have the right to contribute.

## Reporting Security Issues

Do not report vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md).
