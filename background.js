// Open the options page when the toolbar icon is clicked
(function () {
  function openOptions() {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  }

  if (typeof browser !== 'undefined' && browser.browserAction) {
    browser.browserAction.onClicked.addListener(openOptions);
  } else if (typeof chrome !== 'undefined' && chrome.browserAction) {
    chrome.browserAction.onClicked.addListener(openOptions);
  }
})();
// Open the options page when the toolbar icon is clicked
(function () {
  function openOptions() {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      // fallback: open options page URL
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  }

  if (typeof browser !== 'undefined' && browser.browserAction) {
    browser.browserAction.onClicked.addListener(openOptions);
  } else if (typeof chrome !== 'undefined' && chrome.browserAction) {
    chrome.browserAction.onClicked.addListener(openOptions);
  }
})();
