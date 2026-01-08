// Open the options page when the toolbar icon is clicked
(function () {
  var LOG_PREFIX = '[StatusTitle]';
  function log() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(LOG_PREFIX);
      if (console && console.log) console.log.apply(console, args);
    } catch (e) {}
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
    if (request && request.action === 'getTheme') {
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
  }

  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(handleMessage);
  } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleMessage);
  }
})();
