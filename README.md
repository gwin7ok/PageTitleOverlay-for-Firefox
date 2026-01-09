# PageTitleOverlay for Firefox

PageTitleOverlay displays the current page's title in a small overlay inside each web page. It's implemented as a WebExtension for Gecko (Waterfox/Firefox) and is configurable via an Options page.

Features

- Overlay showing the page title, updated live when `document.title` changes.
- Options UI to configure: position (four corners), background color & alpha, text color & alpha, font size, and enable/disable.
- Persistent settings via `storage.local` (shared defaults live in `page-title-overlay-defaults.json`).
- Toolbar action: left-click toggles enabled/disabled, right-click opens Options.
- Context menu entry to open Options when available.
- Hide-on-hover: the overlay temporarily hides while the mouse is over it so underlying page elements remain accessible.

Installation (recommended)

1. Expand or clone this repository to a local folder.
2. Run the bundling script to create the XPI. You can double-click `build_xpi.bat` in Explorer, or run it from a terminal in the repository root:

```powershell
.\build_xpi.bat
```

This produces `PageTitleOverlay for Firefox.xpi` in the repository root (zips the `dist/` folder).

3. Install into Firefox/Waterfox by dragging the generated `.xpi` file into the browser window and confirming the install.

Notes:
- This is the recommended workflow for local installs and distributing a single file to other machines. If you prefer quick development iteration you can still use `about:debugging` → "Load Temporary Add-on" and select `dist/manifest.json`, but the unified process above is the canonical install path.

Files of interest (in `dist/`)

- `manifest.json` — extension manifest used when loading/packaging.
- `page-title-overlay-content_script.js` — content script: creates the overlay, applies dynamic settings (position offsets, max-width, visibility, colors, font size) and reacts to storage changes.
- `page-title-overlay-background.js` — background script: toolbar action, icon state, context menu, opening options.
- `page-title-overlay-options.*` — options UI files (`.html`, `.js`, `.css`).
- `page-title-overlay-style.css` — base CSS for the overlay (visual rules). Some presentation values (colors, font-size, position offsets) are applied at runtime from stored settings.
- `page-title-overlay-defaults.json` — shared defaults packaged with the extension.

Options (how to open and what each setting does)

- Opening the Options UI:
	- Right-click the extension toolbar icon → choose "Options" (left-click toggles enable/disable).
	- Or open Add-ons Manager (`about:addons`) → Extensions → PageTitleOverlay → Preferences / Options.
	- A context-menu entry is also added (when available) to open Options directly.

- Settings explained:
	- **Position**: choose one of `left-top`, `right-top`, `right-bottom`, or `left-bottom`. The script applies a small margin from the window edge; position changes are applied immediately.
	- **Background color**: hex color (e.g. `#000000`).
	- **Background alpha**: transparency percentage for the background where `0` means fully opaque and `100` means fully transparent (internally interpreted as opacity = 1 - (alpha% / 100)).
	- **Text color**: hex color for the title text.
	- **Text alpha**: transparency percentage for text (same interpretation as background alpha).
	- **Font size**: size in pixels applied to the title text.
	- **Enabled**: global toggle to show/hide the overlay across pages (toolbar left-click also toggles this).

Behavior notes:
- The overlay hides itself while the mouse is over it so underlying page elements can be clicked.
- For right-aligned positions we calculate available width using `document.documentElement.clientWidth` so the presence of a vertical scrollbar doesn't cause the title to overflow the visible area.

Notes & troubleshooting

- The content script intentionally keeps some properties dynamic (position offsets, `max-width` calculated from the viewport, `visibility` / `display`, colors, and `font-size`) so user settings and scrollbars are handled correctly. Other visual properties are defined in CSS.
- If the title is long and a vertical scrollbar is present, the extension uses `document.documentElement.clientWidth` when calculating available width for right-aligned positions so scrollbar width is excluded.
- If you see the overlay not updating or not appearing on some pages: internal pages (about: pages), certain cross-origin iframes, or pages that heavily sandbox scripts may prevent the content script from running.


