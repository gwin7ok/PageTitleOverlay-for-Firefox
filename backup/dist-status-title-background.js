// Backup of dist/status-title-background.js
// Copied before removal during renaming to page-title-overlay-*.js
// Original contents follow:
(function () {
    var LOG_PREFIX = '[page-title-overlay]';
    function log() {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(LOG_PREFIX);
            if (console && console.debug) console.debug.apply(console, args);
        } catch (e) { }
    }
    function openOptions() {
        try {
            if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
                log('openOptions via browser.runtime.openOptionsPage');
                browser.runtime.openOptionsPage();
                return;
            }
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
                log('openOptions via chrome.runtime.openOptionsPage');
                chrome.runtime.openOptionsPage();
                return;
            }
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.create) {
                log('openOptions via chrome.tabs.create fallback');
                chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
                return;
            }
            log('openOptions: no options API available');
        } catch (e) { log('openOptions threw', e && e.message); }
    }
    // ... (truncated backup)
})();
