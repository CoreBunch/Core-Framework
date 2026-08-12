# Releasing Core Framework

Core Framework uses a tag-driven release process. A push to `main` never publishes the WordPress plugin.

## Release flow

1. Keep `main` releasable and make sure CI is green.
2. Run `bun run bump`, then update the changelog.
3. Commit the release changes to `main`.
4. Create and push a semantic version tag such as `v1.11.0`.
5. GitHub Actions verifies the repository and builds one WordPress release bundle.
6. The protected `wordpress-org` environment deploys that bundle to WordPress.org.
7. GitHub Actions creates the GitHub Release and uploads the same ZIP.

The workflow never deletes or rewrites an existing WordPress.org tag.

## Automated local helper

From a clean `main` branch, run:

```sh
bun run release
```

The helper runs the web and PHP tests, builds the WordPress ZIP, and asks before creating and pushing the tag.

## Manual tag flow

To trigger the workflow without the helper:

```sh
bun run release:wp -- 1.11.0
git tag -a v1.11.0 -m "Core Framework 1.11.0"
git push origin v1.11.0
```

The tag version must exactly match the plugin header, package metadata, Core Framework version constant, and WordPress.org stable tag. The release builder rejects mismatches.

## Required GitHub configuration

Create a protected environment named `wordpress-org` and add:

- `SVN_USERNAME`
- `SVN_PASSWORD`

Require maintainer approval for that environment. The workflow uses the repository `GITHUB_TOKEN` to create the GitHub Release; no separate GitHub token is needed.
