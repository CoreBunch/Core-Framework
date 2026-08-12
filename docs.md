# Developer Documentation

Core Framework is a Bun workspace with a shared application core and platform-specific shells for the web, WordPress, and Figma.

## Architecture

- `packages/core` contains shared UI, schemas, Jotai state, CSS generation, migrations, and application behavior.
- `packages/www` adapts the shared core to browser storage and hosted web features.
- `packages/wp` adapts the shared core to WordPress persistence, REST endpoints, and frontend delivery.
- `packages/figma` provides the Figma UI and sandbox implementation.
- `packages/gutenberg`, `packages/blocks`, and `packages/builder-integrations` produce editor-specific integration bundles.

Shared features should normally be implemented in `packages/core`. Keep platform packages focused on storage, transport, bootstrapping, and external-platform APIs.

## Prerequisites

- [Bun](https://bun.sh)
- PHP 8.0 or newer and Composer for WordPress development
- A local WordPress installation with HTTPS for the WordPress UI
- Figma Desktop for local Figma plugin development

Install JavaScript dependencies from the repository root:

```sh
bun install
```

## Web App

```sh
bun run dev:www
```

The local web app stores projects in browser storage. Production and preview environments may enable hosted sharing and import features.

## WordPress Plugin

Link `packages/wp` into the local WordPress plugin directory:

```sh
ln -s <path-to-core-framework>/packages/wp <path-to-wordpress>/wp-content/plugins/core-framework
```

Copy `packages/wp/.env.example` to `packages/wp/.env`, then configure the local WordPress URL and certificate path.

```sh
cd packages/wp
bun run composer:dev
cd ../..
bun run dev:wp
```

The WordPress integration stores projects through Core Framework REST endpoints under `core-framework/v2` and writes the generated framework CSS used by WordPress and supported builders.

## Figma Plugin

```sh
bun run dev:figma
```

Import `packages/figma/manifest.json` through **Figma → Plugins → Development → Import plugin from manifest**.

The WordPress-to-Figma flow uses a site-generated connection key. That key authorizes access to the relevant Core Framework REST endpoints and should be treated as a secret.

## Project Data

The project schema is defined in the shared core and describes:

- stylesheet groups for colors, typography, spacing, layouts, design, components, and custom styles
- modules such as fluid spacing and typography calculators
- breakpoints and responsive settings
- project preferences and version information

The usual load flow is:

1. Load project data from browser storage, WordPress, or an explicit import.
2. Validate it against the shared schema.
3. Apply versioned migrations and normalization.
4. Generate calculator previews and autocomplete data.
5. Hydrate the shared Jotai atoms.
6. Generate CSS from the current project state.

## Compatibility Constraints

- Do not change established color-system IDs without a migration. Builder integrations use them for synchronization.
- Keep shade, tint, spacing, and typography generation deterministic.
- Update the application version and migrations when changing persisted project shapes.
- Validate all imported or remotely loaded project data before use.
- Test shared-core changes in both web and WordPress builds.

## Integration Builds

```sh
bun run build:builders
bun run build:gutenberg
bun run build:blocks
bun run build:figma
```

Generated integration files are consumed by the WordPress plugin. Commit generated output only when the repository's release policy requires it, and explain it in the pull request.

## Verification

```sh
bun run test:www
bun run build:www
bun run build:wp
bun run build:figma
```

With Composer dependencies installed:

```sh
bun run php-test:wp
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for pull-request expectations and [SECURITY.md](SECURITY.md) for private vulnerability reporting.
