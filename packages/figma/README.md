# Core Framework for Figma

The Figma package synchronizes Core Framework project variables with Figma. The complete editor is compiled into the plugin, so installing the plugin does not load a Core Framework-hosted web app or require a Core Framework backend.

Core Framework for Figma is free and open source. There is no license activation or license key.

## Development

Install dependencies from the repository root, then run:

```sh
bun run dev:figma
```

For a production build:

```sh
bun run build:figma
```

The build first compiles the shared editor from `packages/www` into a generated single-file HTML document, then embeds that document in `dist/index.html`. Generated files under `.generated` and `dist` are not committed.

## Install a GitHub release

Every repository release includes a self-contained `core-framework-figma-X.Y.Z.zip`:

1. Download the Figma ZIP from [GitHub Releases](https://github.com/corebunch/core-framework/releases) and extract it.
2. Open Figma Desktop.
3. Go to **Plugins → Development → Import plugin from manifest**.
4. Select `core-framework-figma/manifest.json` from the extracted folder.

Figma treats this as a local development plugin. It does not update automatically, so download and import the newer archive for each update. A Figma Community installation is maintained separately through Figma's publishing flow.

Fork maintainers who publish their own Community listing must create their own plugin in Figma and use the ID Figma assigns to it instead of reusing Core Framework's manifest ID.

## Install the development plugin

1. Open Figma Desktop.
2. Go to **Plugins → Development → Import plugin from manifest**.
3. Select `packages/figma/manifest.json`.

You can create and save a project locally without any network connection. To synchronize with WordPress, create a connection key in **Core Framework → Figma** on the WordPress site and enter it in the Figma plugin. This key authenticates requests to that WordPress site; it is not a product license. Treat it as a secret and revoke it from WordPress when it is no longer needed.

The plugin no longer supports the legacy hosted web-project IDs or `cfweb:` synchronization keys. Export those projects as `.core` files and import them locally instead.

## License

MIT. See the repository [LICENSE](../../LICENSE).
