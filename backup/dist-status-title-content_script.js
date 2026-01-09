// Backup of dist/status-title-content_script.js
// Copied before removal during renaming to page-title-overlay-*.js
// Original contents follow:
(function () {
    var ID = 'status-title-overlay';
    if (document.getElementById(ID)) return;

    var panel = document.createElement('div');
    panel.id = ID;
    panel.setAttribute('role', 'status');
    panel.style.position = 'fixed';
    panel.style.zIndex = '2147483647';
    panel.style.pointerEvents = 'none';
    panel.style.display = 'inline-block';
    panel.style.boxSizing = 'border-box';
    panel.style.padding = '2px 6px';
    panel.style.background = 'rgba(0,0,0,0.6)';
    panel.style.color = '#fff';
    panel.style.fontSize = '20px';
    panel.style.borderRadius = '3px';
    panel.style.width = 'auto';
    panel.style.overflow = 'hidden';
    panel.style.whiteSpace = 'nowrap';
    panel.style.textOverflow = 'ellipsis';

    var label = document.createElement('span');
    panel.appendChild(label);
    var LOG_PREFIX = '[page-title-overlay]';
    function log() {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(LOG_PREFIX);
            if (console && console.debug) console.debug.apply(console, args);
        } catch (e) { }
    }
    document.body.appendChild(panel);

    // ... (truncated backup)
})();
