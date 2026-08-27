# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Fixed

- Fixed saving from the Figma plugin, which did nothing and logged `SecurityError: Failed to read the 'localStorage' property from 'Window'`. The editor runs inside Figma's sandboxed `about:srcdoc` frame, where reading `localStorage` is denied, and the save's rate limiter read it on every push and threw before the save could run. Storage access now falls back to an in-memory store when the browser blocks it, so saving from the Figma Desktop app works again.
- Fixed the Oxygen Classic builder hanging on its loading screen when the active preset contained custom fonts. The font list was written into Oxygen's `ng-init` attribute without HTML-escaping, so the first quote closed the attribute and left AngularJS with a truncated expression that never finished loading the builder. The value is now escaped as Oxygen's own core does.
- Stopped disabled fonts from reaching the Oxygen and Bricks builders. The Oxygen font dropdown and the styles injected into both builders now cover only the fonts you have enabled, matching what the editor previews.
- Fixed local fonts whose family name contains a space (for example Source Sans 3) never applying on the front end. WordPress stores the uploaded file under a sanitized name (spaces become dashes), but the generated `@font-face` `src` kept the spaces, so it pointed at a file that returns 404 and the browser dropped the font silently. The upload, the generated CSS, and deletion now all use the same sanitized file name. Re-save an affected font once after updating to regenerate its CSS.

## [2.0.1] - 2026-08-18

### Fixed

- Restored the Auto BEM class generator in the Bricks structure panel. 2.0.0 moved the builder connector into the page footer while the generator still loaded in the head, so the generator read an undefined connector, failed its own feature check, and never started.
- Restored remote project import from a shareable link or a project ID. Preparing 2.0.0 for open source removed the importer's client-side credential, which left every request failing, and the input that no longer worked was then deleted, taking the feature and every shared link with it.
- Fixed Bricks synchronization for empty class sets.
- Batched the Bricks reference sweep and reported pushes that fail instead of passing silently.
- Fixed Figma plugin host message handling.
- Fixed the WordPress URLs used inside the Figma sandbox.
- Allowed the Figma connection key header through the REST CORS preflight, so Figma synchronization reaches the site.

### Changed

- WordPress now retrieves a shared project through the plugin's own REST route rather than from the administrator's browser, so the request leaves the server and the admin screen contacts no third-party host.

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
