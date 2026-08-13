# Releasing Core Framework

Core Framework uses a tag-driven release process. A push to `main` never publishes a WordPress or Figma update.

## Release flow

1. Keep `main` releasable and make sure CI is green.
2. Run `bun run bump`, then update the changelog.
3. Commit the release changes to `main`.
4. Create and push a semantic version tag such as `v2.0.0`.
5. GitHub Actions verifies the repository and builds versioned WordPress and Figma release bundles.
6. The `wordpress-org` environment deploys the WordPress bundle to WordPress.org.
7. GitHub Actions creates the GitHub Release and uploads both ZIPs.

The workflow never deletes or rewrites an existing WordPress.org tag.

## Automated local helper

From a clean `main` branch, run:

```sh
bun run release
```

The helper runs the web and PHP tests, builds both release ZIPs, and asks before creating and pushing the tag.

## Manual tag flow

To trigger the workflow without the helper:

```sh
bun run release:wp -- 2.0.0
bun run release:figma -- 2.0.0
git tag -a v2.0.0 -m "Core Framework 2.0.0"
git push origin v2.0.0
```

The tag version must exactly match the WordPress plugin header, package metadata (including `packages/figma/package.json`), Core Framework version constant, and WordPress.org stable tag. The release builders reject mismatches.

The release builders also reject retired hosted-service URLs, remote placeholder images, the removed remote interface font, and stale Figma version copy. They generate a production dependency license inventory for each artifact.

The GitHub Release contains:

- `core-framework-X.Y.Z.zip` for WordPress and WordPress.org deployment.
- `core-framework-figma-X.Y.Z.zip` for a self-contained local Figma installation.

## Figma Community publishing

The tag workflow packages the Figma plugin but does not publish or update it in Figma Community. Community publishing is a separate maintainer action:

1. Complete the tagged release and confirm that the Figma ZIP is attached to the GitHub Release.
2. Build the same tag locally with `bun install --frozen-lockfile` and `bun run build:figma`.
3. Import `packages/figma/manifest.json` in Figma Desktop and verify the production build.
4. Use Figma Desktop's plugin publishing flow to publish or update the plugin associated with the manifest ID.

Users who install the GitHub ZIP through **Plugins → Development → Import plugin from manifest** must download and import newer archives manually. Figma Community installations receive updates through Figma's own distribution channel.

## Required GitHub configuration

Create a protected environment named `wordpress-org` and add:

- `SVN_USERNAME`
- `SVN_PASSWORD`

For a multi-maintainer repository, consider requiring approval for this environment before deployment. In the current single-maintainer setup, possession of repository tag-push access is the release gate. The workflow uses the repository `GITHUB_TOKEN` to create the GitHub Release; no separate GitHub token is needed.
