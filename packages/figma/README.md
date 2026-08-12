# Core Framework For Figma

The Figma package synchronizes Core Framework project variables with Figma. It is included with the open-source Core Framework project and does not require a paid license.

## Development

Install dependencies from the repository root, then run:

```sh
bun run dev:figma
```

For a production build:

```sh
bun run build:figma
```

## Install The Development Plugin

1. Open Figma Desktop.
2. Go to **Plugins → Development → Import plugin from manifest**.
3. Select `packages/figma/manifest.json`.

To connect Figma directly to WordPress, create a connection key in **Core Framework → Figma** on the WordPress site and enter that key in the Figma plugin. Treat the key as a secret and revoke it from WordPress when it is no longer needed.

## License

MIT. See the repository [LICENSE](../../LICENSE).
