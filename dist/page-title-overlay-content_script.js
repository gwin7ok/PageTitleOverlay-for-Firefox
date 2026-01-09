(function () {
    var ID = 'page-title-overlay';
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
    label.id = 'page-title-overlay-label';
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

    var DEFAULT = 'left-bottom';
    var CURRENT_POS = DEFAULT;
    var MARGIN_PX = 0;
    var overlayRect = null;
    var overlayHiddenByMouse = false;

    function updateOverlayRect() {
        try {
            overlayRect = panel.getBoundingClientRect();
        } catch (e) { overlayRect = null; }
    }

    function applyPosition(pos) {
        panel.style.top = 'auto'; panel.style.bottom = 'auto'; panel.style.left = 'auto'; panel.style.right = 'auto';
        var margin = MARGIN_PX + 'px';
        CURRENT_POS = pos;
        if (pos === 'left-top') { panel.style.top = margin; panel.style.left = margin; panel.style.maxWidth = ''; }
        else if (pos === 'right-top') { panel.style.top = margin; panel.style.right = margin; }
        else if (pos === 'right-bottom') { panel.style.bottom = margin; panel.style.right = margin; }
        else { panel.style.bottom = margin; panel.style.left = margin; panel.style.maxWidth = ''; }
        if (pos.indexOf('right') !== -1) {
            try { var avail = window.innerWidth - (MARGIN_PX * 2); if (avail > 0) panel.style.maxWidth = avail + 'px'; } catch (e) { panel.style.maxWidth = ''; }
        }
        try { updateOverlayRect(); } catch (e) { }
    }

    function setTitle() { label.textContent = document.title || ''; updateOverlayRect(); }
    setTitle();
    var lastTitle = document.title;
    setInterval(function () { if (document.title !== lastTitle) { lastTitle = document.title; setTitle(); } }, 500);

    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    try { log('content_script: storage API ->', storage ? (typeof browser !== 'undefined' && browser.storage ? 'browser.storage' : 'chrome.storage') : 'none'); } catch (e) { }
    // fetch shared defaults and then read storage using those defaults
    var defaultsCache = null;
    function getDefaults(cb) {
        if (defaultsCache) { cb(defaultsCache); return; }
        try {
            var url = (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) ? browser.runtime.getURL('defaults.json') : (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('defaults.json') : 'defaults.json');
            try { log('getDefaults: attempting fetch from', url); } catch (e) { }
            fetch(url).then(function (r) { return r.json(); }).then(function (j) { defaultsCache = j || {}; try { log('getDefaults: fetched defaults.json'); } catch (e) { } cb(defaultsCache); }).catch(function () { try { log('getDefaults: fetch failed, using fallback defaults'); } catch (e) { } defaultsCache = { position: DEFAULT, bgColor: '#c0d7e5', textColor: '#000000', bgAlpha: 0, textAlpha: 0, enabled: true, fontSize: 20 }; cb(defaultsCache); });
        } catch (e) { defaultsCache = { position: DEFAULT, bgColor: '#c0d7e5', textColor: '#000000', bgAlpha: 0, textAlpha: 0, enabled: true, fontSize: 20 }; cb(defaultsCache); }
    }

    if (storage && storage.local) {
        getDefaults(function (defaults) {
            try {
                if (storage.local.get.length === 1) {
                    try { log('content_script: storage.local.get -> callback style'); } catch (e) { }
                    storage.local.get(defaults, function (res) {
                        applyPosition((res && res.position) || defaults.position || DEFAULT);
                        try {
                            if (typeof res.enabled !== 'undefined' && !res.enabled) {
                                panel.style.display = 'none';
                            } else {
                                panel.style.display = 'inline-block';
                                try { panel.style.visibility = 'visible'; } catch (e) { }
                                try { updateOverlayRect(); } catch (e) { }
                            }
                        } catch (e) { }
                        try { if (res && typeof res.fontSize !== 'undefined') panel.style.fontSize = (parseInt(res.fontSize, 10) || defaults.fontSize || 20) + 'px'; } catch (e) { }
                    });
                } else {
                    try { log('content_script: storage.local.get -> promise style'); } catch (e) { }
                    storage.local.get(defaults).then(function (res) {
                        applyPosition((res && res.position) || defaults.position || DEFAULT);
                        try {
                            if (typeof res.enabled !== 'undefined' && !res.enabled) {
                                panel.style.display = 'none';
                            } else {
                                panel.style.display = 'inline-block';
                                try { panel.style.visibility = 'visible'; } catch (e) { }
                                try { updateOverlayRect(); } catch (e) { }
                            }
                        } catch (e) { }
                        try { if (res && typeof res.fontSize !== 'undefined') panel.style.fontSize = (parseInt(res.fontSize, 10) || defaults.fontSize || 20) + 'px'; } catch (e) { }
                    });
                }
            } catch (e) { try { log('content_script: storage.get fallback to callback due to error', e && e.message); storage.local.get(defaults, function (res) { applyPosition((res && res.position) || defaults.position || DEFAULT); try { if (typeof res.enabled !== 'undefined' && !res.enabled) panel.style.display = 'none'; else panel.style.display = 'inline-block'; } catch (e) { } try { if (res && typeof res.fontSize !== 'undefined') panel.style.fontSize = (parseInt(res.fontSize, 10) || defaults.fontSize || 20) + 'px'; } catch (e) { } }); } catch (e) { log('content_script: storage.get fallback failed, applying default position', e && e.message); applyPosition(DEFAULT); } }
        });
    } else {
        applyPosition(DEFAULT);
    }

    if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
        browser.storage.onChanged.addListener(function (changes, area) {
            try { log('content_script: browser.storage.onChanged', changes, area); } catch (e) { }
            if (area !== 'local') return;
            try {
                if (changes.position) applyPosition(changes.position.newValue);
                if (changes.enabled) {
                    try {
                        if (changes.enabled.newValue) {
                            panel.style.display = 'inline-block';
                            try { panel.style.visibility = 'visible'; } catch (e) { }
                            try { updateOverlayRect(); } catch (e) { }
                        } else {
                            panel.style.display = 'none';
                        }
                    } catch (e) { }
                }
                if (changes.fontSize) { try { panel.style.fontSize = (parseInt(changes.fontSize.newValue, 10) || 20) + 'px'; } catch (e) { } }
                if (changes.bgColor || changes.textColor || changes.bgAlpha || changes.textAlpha) {
                    // read full stored values to ensure we have matching color+alpha pairs
                    try {
                        var defaultsLocal = defaultsCache || { bgColor: '', textColor: '', bgAlpha: 0, textAlpha: 0 };
                        if (browser.storage && browser.storage.local && browser.storage.local.get) {
                            if (browser.storage.local.get.length === 1) {
                                browser.storage.local.get(defaultsLocal, function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                            } else {
                                browser.storage.local.get(defaultsLocal).then(function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                            }
                        }
                    } catch (e) { }
                }
            } catch (e) { }
        });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener(function (changes, area) {
            try { log('content_script: chrome.storage.onChanged', changes, area); } catch (e) { }
            if (area !== 'local') return;
            try {
                if (changes.position) applyPosition(changes.position.newValue);
                if (changes.enabled) {
                    try {
                        if (changes.enabled.newValue) {
                            panel.style.display = 'inline-block';
                            try { panel.style.visibility = 'visible'; } catch (e) { }
                            try { updateOverlayRect(); } catch (e) { }
                        } else {
                            panel.style.display = 'none';
                        }
                    } catch (e) { }
                }
                if (changes.bgColor || changes.textColor || changes.bgAlpha || changes.textAlpha) {
                    try {
                        var defaultsLocal = defaultsCache || { bgColor: '', textColor: '', bgAlpha: 0, textAlpha: 0 };
                        if (chrome.storage && chrome.storage.local && chrome.storage.local.get) {
                            if (chrome.storage.local.get.length === 1) {
                                chrome.storage.local.get(defaultsLocal, function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                            } else {
                                chrome.storage.local.get(defaultsLocal).then(function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                            }
                        }
                    } catch (e) { }
                }
            } catch (e) { }
        });
    }

    window.addEventListener('resize', function () { if (CURRENT_POS && CURRENT_POS.indexOf('right') !== -1) { try { var avail = window.innerWidth - (MARGIN_PX * 2); if (avail > 0) panel.style.maxWidth = avail + 'px'; } catch (e) { panel.style.maxWidth = ''; } } });

    // Hide overlay while mouse is within its area so underlying content can be interacted with
    window.addEventListener('mousemove', function (ev) {
        try {
            if (!overlayRect) updateOverlayRect();
            if (!overlayRect) return;
            // if panel is not displayed, nothing to do
            if (panel.style.display === 'none') return;
            var x = ev.clientX, y = ev.clientY;
            var inside = x >= overlayRect.left && x <= overlayRect.right && y >= overlayRect.top && y <= overlayRect.bottom;
            if (inside) {
                if (!overlayHiddenByMouse) {
                    try { panel.style.visibility = 'hidden'; } catch (e) { }
                    overlayHiddenByMouse = true;
                }
            } else {
                if (overlayHiddenByMouse) {
                    try { panel.style.visibility = 'visible'; } catch (e) { }
                    overlayHiddenByMouse = false;
                    // update rect as the panel may have been restored
                    updateOverlayRect();
                }
            }
        } catch (e) { }
    });

    function normalizeColor(c) {
        try {
            if (!c && c !== 0) return null;
            if (Array.isArray(c)) { if (c.length === 3) return 'rgb(' + c.join(',') + ')'; if (c.length === 4) return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')'; }
            if (typeof c === 'string') return c;
        } catch (e) { }
        return null;
    }

    function hexToRgba(hex, alphaPercent) {
        try {
            if (!hex) return null;
            var h = hex.replace('#', '');
            if (h.length === 3) { h = h.split('').map(function (s) { return s + s; }).join(''); }
            if (h.length !== 6) return null;
            var r = parseInt(h.substring(0, 2), 16);
            var g = parseInt(h.substring(2, 4), 16);
            var b = parseInt(h.substring(4, 6), 16);
            var a = 1;
            if (typeof alphaPercent !== 'undefined' && alphaPercent !== null) {
                var ap = parseFloat(alphaPercent);
                if (!isNaN(ap)) {
                    var tp = Math.max(0, Math.min(100, ap));
                    a = 1 - (tp / 100);
                }
            }
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        } catch (e) { return null; }
    }

    function applyStoredColors(bgColor, textColor, bgAlpha, textAlpha) {
        try {
            if (bgColor) { var bg = hexToRgba(bgColor, bgAlpha); if (bg) panel.style.background = bg; }
            if (textColor) { var tc = hexToRgba(textColor, textAlpha); if (tc) panel.style.color = tc; else panel.style.color = textColor; }
        } catch (e) { }
    }

    // On startup, apply any stored explicit colors (use shared defaults)
    try {
        if (storage && storage.local) {
            getDefaults(function (defs) {
                try {
                    var d = defs || { bgColor: '', textColor: '', bgAlpha: 0, textAlpha: 0 };
                    if (storage.local.get.length === 1) {
                        storage.local.get(d, function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
                    } else {
                        storage.local.get(d).then(function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
                    }
                } catch (e) { try { storage.local.get(d, function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); }); } catch (e) { } }
            });
        }
    } catch (e) { }

})();
