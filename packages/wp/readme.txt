=== Core Framework ===
Contributors: coreframework
Tags: css, framework, stylesheet, bricks, oxygen
Requires at least: 6.0
Requires PHP: 8.0
Tested up to: 7.0
Stable tag: 2.0.0
License: MIT
License URI: https://opensource.org/license/mit

Build and manage a portable CSS framework and design system directly inside WordPress.

== Description ==

Core Framework is a visual CSS framework and design-token builder. Define colors, typography, spacing, layouts, components, utility classes, and custom styles in one project, then generate the CSS used by your WordPress site.

The plugin and all included integrations are free and open source. There is no license activation and no paid feature gate.

= Features =

* Visual framework and design-token editor
* Fluid typography and spacing scales
* Color shade and tint generation
* Utility classes, components, layouts, and custom stylesheets
* Project import and export
* Gutenberg integration
* Bricks integration
* Oxygen integration
* Figma synchronization

= Integrations =

Enable the integrations you use from **Core Framework → Add-ons**. Gutenberg, Bricks, Oxygen, and Figma support are included with the plugin; they are not separate paid add-ons.

= Marketplace =

The [Core Framework Marketplace](https://coreframework.com/marketplace) sells optional design kits and packs. Those content products are separate from the plugin and are not required to use any Core Framework feature or integration.

= External services =

Core Framework works without a Core Framework account or hosted Core Framework backend. It makes an external request only when an administrator selects, previews, or imports a Google-hosted font:

* The bundled font catalog is local. Selecting or previewing a Google Font requests CSS from https://fonts.googleapis.com. Importing it also downloads font files from https://fonts.gstatic.com, after which WordPress serves the saved font files locally. Requests identify the selected font family and variants; as with any web request, Google receives connection information such as the site's IP address and user agent. No Google API key or Google account is required.
* Google Terms of Service: https://policies.google.com/terms
* Google Privacy Policy: https://policies.google.com/privacy
* Direct Figma-to-WordPress synchronization connects the Figma plugin directly to the user's own WordPress site using a connection key created by a site administrator. Project data is not routed through Core Framework servers.

The plugin's administration interface, image previews, project storage, CSS generation, and included integrations do not load assets from Core Framework servers. Core Framework does not contact a licensing server and does not require account activation.

= Licensing =

Core Framework's original source code is licensed under the MIT License. Bundled dependencies retain their own open-source licenses. The release archive includes third-party-notices.txt for adapted source and artwork and third-party-licenses.txt for the complete production dependency inventory.

== Installation ==

1. Install Core Framework from the WordPress plugin directory or upload the plugin ZIP.
2. Activate **Core Framework**.
3. Open **Core Framework → Add-ons** and enable the integrations you use.
4. Configure your framework and click **Save changes** to generate the CSS.

== Frequently Asked Questions ==

= Is Core Framework free? =

Yes. The plugin, web app, Figma integration, and included builder integrations are open source under the MIT License.

= Are marketplace products required? =

No. Marketplace design kits and packs are optional content products and are not part of the plugin.

= Does Core Framework require a Google Fonts API key? =

No. The font browser uses Google's public, keyless font endpoints.

== Changelog ==

The project changelog is available in the [source repository](https://github.com/corebunch/core-framework/blob/main/CHANGELOG.md) and the [documentation](https://docs.coreframework.com/changelog/changelog).
