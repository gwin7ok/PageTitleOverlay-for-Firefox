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
    // picker state
    // pickerActive: whether user started a picker session
    // pickerField: which field ('bgColor' or 'textColor') is being picked
    if (typeof handleMessage.pickerActive === 'undefined') { handleMessage.pickerActive = false; handleMessage.pickerField = null; }
    var pickerActive = function (v) { if (typeof v === 'undefined') return handleMessage.pickerActive; handleMessage.pickerActive = !!v; };
    var setPickerField = function (f) { if (typeof f === 'undefined') return handleMessage.pickerField; handleMessage.pickerField = f; };
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
                out.background = theme.colors.accentcolor || theme.colors.toolbar || null;
                out.color = theme.colors.textcolor || theme.colors.toolbar_text || null;
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
                    var bg = theme.colors.accentcolor || theme.colors.toolbar || theme.colors.frame || null;
                    var col = theme.colors.textcolor || theme.colors.toolbar_text || null;
                    if (bg) out.bgColor = bg; if (col) out.textColor = col; out.bgAlpha = 60; out.textAlpha = 0;
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
    // start a page picker: capture visible tab, inject picker, send image
    if (request.action === 'startPicker') {
      try {
        var field = request.field || 'bgColor';
        // mark picker active
        pickerActive(true);
        setPickerField(field);
        var tabsApi = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : (typeof chrome !== 'undefined' && chrome.tabs ? chrome.tabs : null);
        if (tabsApi && tabsApi.captureVisibleTab) {
          // capture current window
          try {
            // get active tab id first
            var q = (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) ? chrome.tabs.query : (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query ? browser.tabs.query : null);
            if (q) {
              q({ active: true, currentWindow: true }, function (tabs) {
                var tabId = (tabs && tabs[0] && tabs[0].id) ? tabs[0].id : null;
                try {
                  var windowId = null;
                  try { if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.getCurrent) { chrome.windows.getCurrent(function (w) { windowId = w && w.id; }); } } catch (e) { }
                } catch (e) { }
                try {
                  chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, function (dataUrl) {
                    try {
                      if (!dataUrl) return;
                      // inject picker script then send it the image
                      try {
                        chrome.tabs.executeScript(tabId, { file: 'status-title-picker.js' }, function () {
                          try { chrome.tabs.sendMessage(tabId, { action: 'startPicker', image: dataUrl, field: field }); } catch (e) { log('sendMessage to picker failed', e && e.message); }
                        });
                      } catch (e) { log('executeScript failed', e && e.message); }
                    } catch (e) { log('capture callback failed', e && e.message); }
                  });
                } catch (e) { log('captureVisibleTab call failed', e && e.message); }
              });
            }
          } catch (e) { log('startPicker flow failed', e && e.message); }
        }
      } catch (e) { log('startPicker handler error', e && e.message); }
      // ensure we listen for tab activation while pickerActive
      try {
        var tabsOnActivated = (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onActivated) ? chrome.tabs.onActivated : (typeof browser !== 'undefined' && browser.tabs && browser.tabs.onActivated ? browser.tabs.onActivated : null);
        if (tabsOnActivated && !handleMessage._tabsListenerAdded) {
          tabsOnActivated.addListener(function (activeInfo) {
            try {
              if (!pickerActive()) return;
              // capture visible (new active) tab and inject picker there
              try {
                var winId = (activeInfo && activeInfo.windowId) ? activeInfo.windowId : null;
                chrome.tabs.captureVisibleTab(winId, { format: 'png' }, function (dataUrl) {
                  try {
                    if (!dataUrl) return;
                    var tid = activeInfo && activeInfo.tabId ? activeInfo.tabId : null;
                    if (tid) {
                      try { chrome.tabs.executeScript(tid, { file: 'status-title-picker.js' }, function () { try { chrome.tabs.sendMessage(tid, { action: 'startPicker', image: dataUrl, field: setPickerField() }); } catch (e) { log('sendMessage fail', e && e.message); } }); } catch (e) { log('executeScript fail', e && e.message); }
                    }
                  } catch (e) { }
                });
              } catch (e) { }
            } catch (e) { }
          });
          handleMessage._tabsListenerAdded = true;
        }
      } catch (e) { }
      return false;
    }
    // color picked by injected picker
    if (request.action === 'colorPicked') {
      try {
        var f = request.field || 'bgColor';
        var v = request.value || '';
        var storageApi = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null);
        if (storageApi && storageApi.local && storageApi.local.set) {
          var obj = {};
          obj[f] = v;
          try {
            if (storageApi.local.set.length === 1) {
              storageApi.local.set(obj, function () { log('stored picked color', obj); });
            } else {
              storageApi.local.set(obj).then(function () { log('stored picked color', obj); });
            }
          } catch (e) { try { storageApi.local.set(obj); } catch (e) { log('storage set failed', e && e.message); } }
        }
      } catch (e) { log('colorPicked handler failed', e && e.message); }
      // stop picker across tabs
      try {
        pickerActive(false);
        setPickerField(null);
        var tq = (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) ? chrome.tabs.query : (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query ? browser.tabs.query : null);
        if (tq) {
          tq({ currentWindow: true }, function (tabs) {
            try {
              for (var i = 0; i < tabs.length; i++) {
                try { chrome.tabs.sendMessage(tabs[i].id, { action: 'stopPicker' }); } catch (e) { }
              }
            } catch (e) { }
          });
        }
      } catch (e) { }
      return false;
    }

    // picker closed/cancelled in a tab -> stop whole session
    if (request.action === 'pickerClosed') {
      try {
        pickerActive(false);
        setPickerField(null);
        var tq2 = (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) ? chrome.tabs.query : (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query ? browser.tabs.query : null);
        if (tq2) {
          tq2({ currentWindow: true }, function (tabs) {
            try { for (var i = 0; i < tabs.length; i++) { try { chrome.tabs.sendMessage(tabs[i].id, { action: 'stopPicker' }); } catch (e) { } } } catch (e) { }
          });
        }
      } catch (e) { }
      return false;
    }
  }

  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(handleMessage);
  } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleMessage);
  }
})();
