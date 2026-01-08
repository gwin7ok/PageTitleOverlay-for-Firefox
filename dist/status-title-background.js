// Open the options page when the toolbar icon is clicked
(function () {
  var LOG_PREFIX = '[StatusTitle]';
  function log() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(LOG_PREFIX);
      if (console && console.log) console.log.apply(console, args);
    } catch (e) { }
  }
  function openOptions() {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  }

  if (typeof browser !== 'undefined' && browser.browserAction) {
    browser.browserAction.onClicked.addListener(openOptions);
  } else if (typeof chrome !== 'undefined' && chrome.browserAction) {
    chrome.browserAction.onClicked.addListener(openOptions);
  }

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
                        storageApi.local.set(out, function () { log('saved theme colors', out); });
                      } else {
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
