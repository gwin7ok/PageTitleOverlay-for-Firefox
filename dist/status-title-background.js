// Open the options page when the toolbar icon is clicked
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

  function toggleEnabled() {
    var storageApi = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null);
    if (!storageApi || !storageApi.local) return;
    try {
      var getter = storageApi.local.get;
      if (getter.length === 1) {
        log('toggleEnabled: using storage.get(callback)');
        storageApi.local.get({ enabled: true }, function (res) {
          try {
            var cur = (res && typeof res.enabled !== 'undefined') ? !!res.enabled : true;
            var next = !cur;
            try {
              if (storageApi.local.set.length === 1) {
                log('toggleEnabled: using storage.set(callback)');
                storageApi.local.set({ enabled: next }, function () { log('toggled enabled ->', next); });
              } else {
                log('toggleEnabled: using storage.set(promise)');
                storageApi.local.set({ enabled: next }).then(function () { log('toggled enabled ->', next); });
              }
            } catch (e) { try { log('toggleEnabled: storage.set fallback'); storageApi.local.set({ enabled: next }); } catch (e) { log('storage set failed', e && e.message); } }
          } catch (e) { log('toggleEnabled callback processing failed', e && e.message); }
        });
      } else {
        log('toggleEnabled: using storage.get(promise)');
        storageApi.local.get({ enabled: true }).then(function (res) {
          try {
            var cur = (res && typeof res.enabled !== 'undefined') ? !!res.enabled : true;
            var next = !cur;
            try {
              if (storageApi.local.set.length === 1) {
                log('toggleEnabled: using storage.set(callback)');
                storageApi.local.set({ enabled: next }, function () { log('toggled enabled ->', next); });
              } else {
                log('toggleEnabled: using storage.set(promise)');
                storageApi.local.set({ enabled: next }).then(function () { log('toggled enabled ->', next); });
              }
            } catch (e) { try { log('toggleEnabled: storage.set fallback'); storageApi.local.set({ enabled: next }); } catch (e) { log('storage set failed', e && e.message); } }
          } catch (e) { log('toggleEnabled promise processing failed', e && e.message); }
        }).catch(function (e) { log('toggleEnabled: storage.get(promise) rejected', e && e.message); });
      }
    } catch (e) { }
  }

  if (typeof browser !== 'undefined' && browser.browserAction) {
    browser.browserAction.onClicked.addListener(toggleEnabled);
  } else if (typeof chrome !== 'undefined' && chrome.browserAction) {
    chrome.browserAction.onClicked.addListener(toggleEnabled);
  }

  // helper to set toolbar icon based on enabled state
  function setToolbarIcon(enabled) {
    try {
      var runtimeApi = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : ((typeof chrome !== 'undefined' && chrome.runtime) ? chrome.runtime : null);
      var pathEnabled = 'icon48.png';
      var pathDisabled = 'icondisable48.png';
      var p = enabled ? pathEnabled : pathDisabled;
      var ba = (typeof browser !== 'undefined' && browser.browserAction) ? browser.browserAction : ((typeof chrome !== 'undefined' && chrome.browserAction) ? chrome.browserAction : null);
      if (ba && ba.setIcon) {
        try {
          log('setToolbarIcon: attempting setIcon with path', p);
          // some implementations accept string path, others accept object
          ba.setIcon({ path: p });
          return;
        } catch (e) {
          log('setToolbarIcon: setIcon(path) threw, trying URL fallback', e && e.message);
          try {
            // fallback to full URL
            var url = runtimeApi && runtimeApi.getURL ? runtimeApi.getURL(p) : p;
            log('setToolbarIcon: attempting setIcon with url', url);
            ba.setIcon({ path: url });
            return;
          } catch (e) { log('setToolbarIcon: setIcon(url) failed', e && e.message); }
        }
      } else {
        log('setToolbarIcon: browserAction API not available');
      }
    } catch (e) { }
  }

  // initialize toolbar icon from stored enabled state
  try {
    var storageApiInit = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null);
    if (storageApiInit && storageApiInit.local && storageApiInit.local.get) {
      try {
        if (storageApiInit.local.get.length === 1) {
          log('init: storage.get(callback)');
          storageApiInit.local.get({ enabled: true }, function (r) { try { var val = !!(r && typeof r.enabled !== 'undefined' ? r.enabled : true); log('init: got enabled via callback', val); setToolbarIcon(val); } catch (e) { log('init callback processing failed', e && e.message); } });
        } else {
          log('init: storage.get(promise)');
          storageApiInit.local.get({ enabled: true }).then(function (r) { try { var val = !!(r && typeof r.enabled !== 'undefined' ? r.enabled : true); log('init: got enabled via promise', val); setToolbarIcon(val); } catch (e) { log('init promise processing failed', e && e.message); } }).catch(function (e) { log('init: storage.get(promise) rejected', e && e.message); });
        }
      } catch (e) { log('init: storage.get threw', e && e.message); }
    }
  } catch (e) { }

  // listen for storage changes to update icon immediately
  try {
    var storOnChanged = (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) ? browser.storage.onChanged : ((typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) ? chrome.storage.onChanged : null);
    if (storOnChanged && storOnChanged.addListener) {
      storOnChanged.addListener(function (changes, area) {
        try {
          log('storage.onChanged', area, changes);
          if (area !== 'local') return;
          if (changes.enabled) {
            try { log('storage.onChanged: enabled changed ->', !!changes.enabled.newValue); setToolbarIcon(!!changes.enabled.newValue); } catch (e) { log('storage.onChanged processing failed', e && e.message); }
          }
        } catch (e) { log('storage.onChanged handler threw', e && e.message); }
      });
    }
  } catch (e) { }

  // Create a context menu item when right-clicking the toolbar icon
  try {
    var cmApi = (typeof browser !== 'undefined' && browser.contextMenus) ? browser.contextMenus : ((typeof chrome !== 'undefined' && chrome.contextMenus) ? chrome.contextMenus : null);
    if (cmApi && cmApi.create) {
      try {
        // id used to identify clicks
        var CM_ID = 'page-title-overlay-open-options';
        // remove existing (safe no-op in many implementations)
        try {
          if (cmApi.remove) {
            try {
              var rem = cmApi.remove(CM_ID);
              if (rem && typeof rem.then === 'function') rem.catch(function () { /* ignore */ });
            } catch (e) { /* some implementations use callback-style remove; ignore sync errors */ }
          }
        } catch (e) { }
        cmApi.create({ id: CM_ID, title: 'オプションを開く', contexts: ['browser_action'] });
        if (cmApi.onClicked && cmApi.onClicked.addListener) {
          cmApi.onClicked.addListener(function (info, tab) {
            try { if (info && info.menuItemId === CM_ID) openOptions(); } catch (e) { }
          });
        }
      } catch (e) { log('contextMenus.create failed', e && e.message); }
    }
  } catch (e) { }

  // On startup, attempt to read current theme and log it for debugging
  try {
    var themeApiStartup = (typeof browser !== 'undefined' && browser.theme) ? browser.theme : ((typeof chrome !== 'undefined' && chrome.theme) ? chrome.theme : null);
    if (themeApiStartup && themeApiStartup.getCurrent) {
      try {
        var pstart = themeApiStartup.getCurrent();
        if (pstart && typeof pstart.then === 'function') {
          pstart.then(function (t) { log('startup theme.getCurrent', t); }).catch(function (e) { log('startup theme.getCurrent error', e && e.message); });
        }
      } catch (e) { log('startup theme.getCurrent threw', e && e.message); }
    } else {
      log('startup: theme API not present');
    }
  } catch (e) { log('startup theme check failed', e && e.message); }

  // Respond to content scripts asking for theme colors
  function handleMessage(request, sender, sendResponse) {
    log('handleMessage', request, sender);
    function colorFromValue(v) {
      try {
        if (!v && v !== 0) return null;
        if (Array.isArray(v)) {
          if (v.length === 3) return 'rgb(' + v.join(',') + ')';
          if (v.length === 4) return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + v[3] + ')';
        }
        if (typeof v === 'string') return v;
      } catch (e) { }
      return null;
    }

    function pickFirstColor(colors, keys) {
      try {
        if (!colors) return null;
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (typeof colors[key] !== 'undefined' && colors[key] !== null) {
            var c = colorFromValue(colors[key]);
            if (c) return c;
          }
        }
      } catch (e) { }
      return null;
    }
    if (!request || !request.action) return false;
    if (request.action === 'getTheme') {
      var themeApi = (typeof browser !== 'undefined' && browser.theme) ? browser.theme : ((typeof chrome !== 'undefined' && chrome.theme) ? chrome.theme : null);
      if (themeApi && themeApi.getCurrent) {
        try {
          // browser.theme.getCurrent may return a Promise
          var p = themeApi.getCurrent();
          if (p && typeof p.then === 'function') {
            p.then(function (theme) {
              log('theme.getCurrent result', theme);
              var out = {};
              if (theme && theme.colors) {
                out.background = pickFirstColor(theme.colors, ['accentcolor', 'toolbar', 'frame', 'tab_background_text']);
                out.color = pickFirstColor(theme.colors, ['toolbar_text', 'tab_background_text', 'bookmark_text', 'textcolor', 'toolbar_field_text']);
              }
              sendResponse(out);
            }).catch(function () { sendResponse({}); });
            return true; // indicate async response
          }
        } catch (e) { }
      }
      log('theme API not available or returned sync; responding empty');
      sendResponse({});
      return false;
    }
    // save theme colors into storage.local when requested from options
    if (request.action === 'saveThemeColors') {
      try {
        var themeApi2 = (typeof browser !== 'undefined' && browser.theme) ? browser.theme : ((typeof chrome !== 'undefined' && chrome.theme) ? chrome.theme : null);
        if (themeApi2 && themeApi2.getCurrent) {
          try {
            var pp = themeApi2.getCurrent();
            if (pp && typeof pp.then === 'function') {
              pp.then(function (theme) {
                try {
                  var out = {};
                  if (theme && theme.colors) {
                    // only store colors from theme; do NOT overwrite existing alpha settings
                    out.bgColor = pickFirstColor(theme.colors, ['accentcolor', 'toolbar', 'frame', 'tab_background_text']);
                    out.textColor = pickFirstColor(theme.colors, ['toolbar_text', 'tab_background_text', 'bookmark_text', 'textcolor', 'toolbar_field_text']);
                  }
                  var storageApi = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null);
                  if (storageApi && storageApi.local && storageApi.local.set) {
                    try {
                      if (storageApi.local.set.length === 1) {
                        log('saveThemeColors: using storage.set(callback)');
                        storageApi.local.set(out, function () { log('saved theme colors', out); });
                      } else {
                        log('saveThemeColors: using storage.set(promise)');
                        storageApi.local.set(out).then(function () { log('saved theme colors', out); });
                      }
                    } catch (e) { try { storageApi.local.set(out); } catch (e) { log('storage set failed', e && e.message); } }
                  }
                } catch (e) { log('processing theme failed', e && e.message); }
              }).catch(function (e) { log('getCurrent failed', e && e.message); });
            }
          } catch (e) { log('saveThemeColors flow failed', e && e.message); }
        }
      } catch (e) { log('saveThemeColors handler failed', e && e.message); }
      // respond to caller (options) that request was handled
      if (sendResponse) sendResponse({ ok: true });
      return true;
    }
    // picker feature removed: no startPicker handling
    // picker feature removed: no colorPicked/pickerClosed handling
  }

  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(handleMessage);
  } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleMessage);
  }
})();
