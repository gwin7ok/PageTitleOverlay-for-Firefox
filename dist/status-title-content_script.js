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
  panel.style.fontSize = '12px';
  panel.style.borderRadius = '3px';
  panel.style.width = 'auto';
  panel.style.overflow = 'hidden';
  panel.style.whiteSpace = 'nowrap';
  panel.style.textOverflow = 'ellipsis';

  var label = document.createElement('span');
  panel.appendChild(label);
  var LOG_PREFIX = '[StatusTitle]';
  function log() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(LOG_PREFIX);
      if (console && console.log) console.log.apply(console, args);
    } catch (e) {}
  }
  document.body.appendChild(panel);

  var DEFAULT = 'left-bottom';
  var CURRENT_POS = DEFAULT;
  var MARGIN_PX = 0;
  function applyPosition(pos) {
    // use 'auto' to explicitly clear opposing sides so computed width/heights behave predictably
    panel.style.top = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = 'auto';
    panel.style.right = 'auto';
    var margin = MARGIN_PX + 'px';
    CURRENT_POS = pos;
    if (pos === 'left-top') { panel.style.top = margin; panel.style.left = margin; panel.style.maxWidth = ''; }
    else if (pos === 'right-top') { panel.style.top = margin; panel.style.right = margin; }
    else if (pos === 'right-bottom') { panel.style.bottom = margin; panel.style.right = margin; }
    else { panel.style.bottom = margin; panel.style.left = margin; panel.style.maxWidth = ''; }

    // For right-anchored positions, ensure panel does not extend beyond left edge
    if (pos.indexOf('right') !== -1) {
      try {
        var avail = window.innerWidth - (MARGIN_PX * 2);
        if (avail > 0) panel.style.maxWidth = avail + 'px';
      } catch (e) { panel.style.maxWidth = ''; }
    }
  }

  function setTitle() { label.textContent = document.title || ''; }
  setTitle();

  var lastTitle = document.title;
  setInterval(function () {
    if (document.title !== lastTitle) { lastTitle = document.title; setTitle(); }
  }, 500);

  var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
  if (storage && storage.local) {
    try {
      if (storage.local.get.length === 1) {
        storage.local.get({ position: DEFAULT }, function (res) { applyPosition((res && res.position) || DEFAULT); });
      } else {
        storage.local.get({ position: DEFAULT }).then(function (res) { applyPosition((res && res.position) || DEFAULT); });
      }
    } catch (e) {
      try { storage.local.get({ position: DEFAULT }, function (res) { applyPosition((res && res.position) || DEFAULT); }); } catch (e) { applyPosition(DEFAULT); }
    }

    if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
      browser.storage.onChanged.addListener(function (changes, area) { if (area === 'local' && changes.position) applyPosition(changes.position.newValue); });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(function (changes, area) { if (area === 'local' && changes.position) applyPosition(changes.position.newValue); });
    }
  } else {
    applyPosition(DEFAULT);
  }

  // Recompute maxWidth on resize when anchored to right
  window.addEventListener('resize', function () {
    if (CURRENT_POS && CURRENT_POS.indexOf('right') !== -1) {
      try {
        var avail = window.innerWidth - (MARGIN_PX * 2);
        if (avail > 0) panel.style.maxWidth = avail + 'px';
      } catch (e) { panel.style.maxWidth = ''; }
    }
  });

  // Request theme colors from background and apply if available
  function normalizeColor(c) {
    try {
      if (!c && c !== 0) return null;
      if (Array.isArray(c)) {
        if (c.length === 3) return 'rgb(' + c.join(',') + ')';
        if (c.length === 4) return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')';
      }
      if (typeof c === 'string') return c;
    } catch (e) {}
    return null;
  }

  try {
    var runtimeApi = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : (typeof chrome !== 'undefined' ? chrome.runtime : null);
    if (runtimeApi && runtimeApi.sendMessage) {
      try {
        log('requesting theme from background');
        var p = runtimeApi.sendMessage({ action: 'getTheme' });
        if (p && typeof p.then === 'function') {
          p.then(function (res) {
            log('theme response', res);
            if (res) {
              var bg = normalizeColor(res.background);
              var col = normalizeColor(res.color);
              if (bg) panel.style.background = bg;
              if (col) panel.style.color = col;
            }
          }).catch(function () {});
        }
      } catch (e) {
        try {
          log('requesting theme (callback style)');
          runtimeApi.sendMessage({ action: 'getTheme' }, function (res) {
            log('theme response (cb)', res);
            if (res) {
              var bg = normalizeColor(res.background);
              var col = normalizeColor(res.color);
              if (bg) panel.style.background = bg;
              if (col) panel.style.color = col;
            }
          });
        } catch (e) {}
      }
    }
  } catch (e) {}
})();
