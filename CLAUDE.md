# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Core Framework is a sophisticated CSS framework and design system builder that exists as a monorepo with two main deployments:

- **Web Version** (`packages/www/`) - Standalone web app at coreframework.com
- **WordPress Plugin** (`packages/wp/`) - Full-featured WordPress plugin with builder integrations

## Essential Commands

All commands use **bun** as the package manager and task runner.

### Development

```bash
# Web app development
bun run dev:www

# WordPress plugin development (requires symlink setup first)
bun run dev:wp

# Builder integrations development
bun run dev:builders

# Gutenberg package development
bun run build:gutenberg

# Blocks development
bun run dev:blocks

# Figma plugin development
bun run dev:figma
```

### Testing & Quality

```bash
# Run test suite (CRITICAL - must pass before any changes)
bun run test:www

# Run PHP tests for WordPress plugin
cd packages/wp && bun run php-test

# Lint code (both www and wp packages)
bun run lint

# Format code
bun run format
```

### Building & Deployment

```bash
# Build web app
bun run build:www

# Build WordPress plugin
bun run build:wp

# Build builder integrations
bun run build:builders

# Build Gutenberg package
bun run build:gutenberg

# Build blocks
bun run build:blocks

# Build Figma plugin
bun run build:figma

# Export WordPress plugin for distribution
bun run export:wp

# Version bumping (run before releases)
bun run bump <current-version> <new-version>
```

## Architecture

> **Refactored Monorepo (post deduplication)**: The codebase has been restructured so that all shared logic lives in `packages/core/`. Both `packages/www/` and `packages/wp/` are thin platform shells with re-export stubs pointing into core. See "Package Structure" below.

### Package Roles

- **`packages/core/`** — The shared package containing all business logic, UI components, state management, CSS generation, and utilities. This is where virtually all feature development happens.
- **`packages/www/`** — Thin platform shell for the web app. Contains ~179 re-export stubs pointing to core, plus ~37 genuinely platform-specific files (localStorage adapter, Figma bridge, embed bridge, web-specific Vite entry points).
- **`packages/wp/`** — Thin platform shell for WordPress. Contains ~179 re-export stubs pointing to core, plus ~41 genuinely platform-specific files (REST API integration, builder integrations for Bricks/Oxygen, PHP backend, WP-specific hooks).

### Core Data Structure

The application revolves around a `presetSchema` that defines the entire framework configuration:

- **styleSheetData**: Contains all CSS classes/variables organized by category (colors, typography, spacing, layouts, design, components, other)
- **modulesData**: Calculators, components, and other dynamic modules
- **breakpoints**: Responsive breakpoint definitions
- **preferences**: User preferences and settings

### State Management

- Uses **Jotai** for atomic state management (lives in `packages/core/`)
- State divided into specialized atoms for performance:
  - `presetAtoms.ts` - Core preset data
  - `groupsAtoms.ts` - Style groups management
  - `modulesAtoms.ts` - Calculator and component modules
  - `breakpointsAtoms.ts` - Responsive breakpoint management

### Data Flow

1. Data loaded from database/storage
2. Validated using Zod schema (`validatePreset.ts`)
3. Prepared/migrated via `preparePresetToLoad.ts`
4. Preview data generated for calculators
5. Autocomplete updated with spacing/typography
6. Atoms updated triggering UI refresh

## Critical Constraints

### Never Change

- **Color system IDs** - Breaking these breaks Bricks/Oxygen compatibility
- **Shade/tint generation functions** - Must remain consistent
- **App version tracking** - Prevents breaking migrations

### Always Test

- Run `bun run test:www` before committing
- Tests in `packages/www/src/__tests__/` are critical for CSS generation
- Verify builder integrations if touching that code

## WordPress Plugin Setup

1. Create symlink from `packages/wp` to WordPress plugins folder:

   ```bash
   ln -s <path-to-repo>/packages/wp <path-to-wp>/wp-content/plugins/core-framework
   ```

2. Configure `packages/wp/.env` with local server URL

3. Install dependencies:
   ```bash
   cd packages/wp
   bun run composer:dev
   bun install
   ```

## Package Structure

- **packages/core/** - Shared package: all business logic, UI components, state management (Jotai atoms), CSS generation, schemas, utilities, and hooks
- **packages/www/** - Web platform shell: ~179 re-export stubs → core, ~37 platform-specific files (localStorage, Figma bridge, embed bridge)
- **packages/wp/** - WordPress platform shell: ~179 re-export stubs → core, ~41 platform-specific files (REST API, builder integrations, PHP backend)
- **packages/gutenberg/** - Gutenberg editor integration
- **packages/builder-integrations/** - Oxygen, Bricks builder integrations
- **packages/blocks/** - WordPress block editor components
- **packages/figma/** - Figma plugin integration

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Jotai, Zod
- **Styling**: PostCSS, Sass, CSS-in-JS
- **UI Libraries**: Adobe React Spectrum, Mantine, DnD Kit
- **Backend**: PHP (WordPress), Composer
- **Testing**: Jest, ts-jest, PHPUnit
- **Tooling**: bun, Biome, Prettier, Husky
- **Deployment**: Vercel (web), SVN (WordPress repo)

## Development Notes

- Web version uses local storage in development/preview environments
- WordPress integration uses REST API endpoints: `core-framework/v2/`
- Pre-commit hooks run formatting via Husky
- Monorepo managed with bun workspaces
- SSL certificates required for local WordPress development
