# Status Title Overlay (Waterfox)

This extension implements the behavior of `statusTitle.uc.js` as a page-level overlay. It cannot modify the browser chrome (XUL) from a WebExtension, so it creates a fixed overlay element inside each web page.

Usage

- Install the extension in Waterfox's about:debugging -> "This Firefox" -> Load Temporary Add-on and select `manifest.json`.
- The overlay shows the page title near the bottom-left and hides when the mouse is over it or when `Shift` is pressed.

Limitations

- Cannot run on some internal pages (about: pages, browser UI pages).
- Runs per web page (content script), not in the browser chrome.

Files

- `manifest.json` - extension manifest
- `status-title-content_script.js` - core overlay and logic
- `style.css` - styles for the overlay

Want further changes? I can add an options page, an allowlist, or a background script to coordinate tabs.
