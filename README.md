# PageTitleOverlay for Firefox

This extension displays the current page's title in a small, configurable overlay inside each web page.

Usage

- Install the extension temporarily via `about:debugging` -> "This Firefox" -> Load Temporary Add-on and select `manifest.json` from the `dist/` folder.
- Configure position, colors, transparency, and font size from the Options page.

Limitations

- Cannot run on some internal pages (about: pages, browser UI pages).
- Runs per web page (content script), not in the browser chrome.

Files

- `manifest.json` - extension manifest
- `page-title-overlay-content_script.js` - core overlay and logic
- `page-title-overlay-background.js` - background script (toolbar, context menu, theme handling)
- `page-title-overlay-options.html` / `page-title-overlay-options.js` / `page-title-overlay-options.css` - options UI
- `page-title-overlay-style.css` - styles for the overlay

If you want additional features (allowlist, delay on hover, or different positioning presets), tell me and I can implement them.
