# Security Policy

Core Framework runs inside WordPress, a standalone web app, and Figma. Security reports involving project data, WordPress permissions, connection keys, remote imports, or generated output are taken seriously.

## Supported Versions

Security fixes target the latest `main` branch and the latest tagged release. Older releases are not maintained as long-term supported branches unless explicitly documented.

## Reporting A Vulnerability

Use GitHub's private vulnerability reporting for this repository:

```txt
https://github.com/corebunch/core-framework/security/advisories/new
```

If private vulnerability reporting is unavailable, open a minimal public issue asking for a private reporting channel or contact `hello@coreframework.com`. Do not include exploit details, credentials, connection keys, private site URLs, or proof-of-concept payloads in a public issue.

Helpful reports include:

- affected Core Framework version or commit
- affected surface: web app, WordPress, Figma, Gutenberg, Bricks, or Oxygen
- WordPress, PHP, browser, builder, or Figma version when relevant
- clear reproduction steps and expected impact
- logs or screenshots with credentials and private data redacted

## Scope

In scope:

- WordPress capability, nonce, REST authentication, or authorization bypasses
- exposure or misuse of Figma/WordPress connection keys
- unsafe remote project import, deserialization, or validation behavior
- cross-site scripting or unintended CSS/HTML injection in privileged surfaces
- unauthorized project access, modification, export, or synchronization
- secrets or private project data exposed through logs, bundles, or API responses

Out of scope:

- vulnerabilities that require full WordPress administrator or server-owner access without crossing another security boundary
- reports against third-party builders, WordPress, Figma, Google Fonts, or hosting providers that do not involve Core Framework code
- denial-of-service reports that only exhaust intentionally local resources without a realistic deployment impact

Maintainers will acknowledge valid private reports, assess their impact, and coordinate a fix and disclosure when appropriate.
