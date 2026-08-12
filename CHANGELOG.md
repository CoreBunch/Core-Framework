# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [2.0.0] - 2026-08-12

### Changed

- Released Core Framework-owned source under the MIT License.
- Removed EDD licensing, product activation, and paid add-on gates.
- Made the WordPress, Gutenberg, Bricks, Oxygen, and Figma integrations available without a license check.
- Updated the Oxygen integration for Oxygen 6.1 and newer. Sites remaining on Oxygen 6.0 should stay on Core Framework 1.10.4.
- Replaced the Google Fonts API-key integration with a keyless bundled catalog and public Google Fonts CSS endpoints.
- Replaced Figma's shared cloud credential with scoped project synchronization tokens and WordPress site connection keys.
- Replaced commercially licensed theme-toggle artwork with MIT-licensed Heroicons.
- Replaced the legacy PostCSS 7 easing-gradient chain with an attributed PostCSS 8 implementation and upgraded the CSS processing toolchain.
- Added public contribution, security, conduct, and GitHub community documentation.

### Fixed

- Moved generated CSS to WordPress-managed uploads storage and restored it from the database backup during upgrades from 1.10.4 and earlier.
- Preserved per-site generated CSS on multisite while removing retired EDD license options.
- Registered Core Framework REST routes correctly on sites using WordPress plain permalinks.
- Prevented the Bricks Custom CSS variable picker from closing during variable hover previews.
- Transliterated German umlauts and common accented Latin characters when generating Bricks BEM class names.
- Kept WordPress's registered React runtime available on the Core Framework admin page.
- Preserved explicitly entered Core Framework color values and serialized Bricks HSL palette entries correctly.
- Synchronized Oxygen 6.1 classes, variables, collection metadata, stable selector IDs, and hover previews through its current builder store.
- Accepted valid multiline selectors and comments in custom stylesheets while continuing to reject structurally malformed CSS.

## [1.10.2] - 2026-04-20

### Fixed

- **Bricks integration**: Color sync now correctly passes typed color values (`hex`, `rgb`) to the Bricks color palette, ensuring colors appear properly in the Bricks 2.3 color picker instead of only storing the raw CSS value.
- **Bricks integration**: Color ID validation regex updated to allow dot characters (`.`) in color IDs, preventing valid color entries from being silently dropped during sync.
