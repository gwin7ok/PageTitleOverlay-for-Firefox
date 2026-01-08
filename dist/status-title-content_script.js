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
    } catch (e) { }
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
      browser.storage.onChanged.addListener(function (changes, area) {
        if (area === 'local') {
          if (changes.position) applyPosition(changes.position.newValue);
          if (changes.bgColor || changes.textColor || changes.bgAlpha || changes.textAlpha) applyStoredColors(changes.bgColor ? changes.bgColor.newValue : undefined, changes.textColor ? changes.textColor.newValue : undefined, changes.bgAlpha ? changes.bgAlpha.newValue : undefined, changes.textAlpha ? changes.textAlpha.newValue : undefined);
        }
      });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'local') {
          if (changes.position) applyPosition(changes.position.newValue);
          if (changes.bgColor || changes.textColor || changes.bgAlpha || changes.textAlpha) applyStoredColors(changes.bgColor ? changes.bgColor.newValue : undefined, changes.textColor ? changes.textColor.newValue : undefined, changes.bgAlpha ? changes.bgAlpha.newValue : undefined, changes.textAlpha ? changes.textAlpha.newValue : undefined);
        }
      });
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
      // alphaPercent is stored as "透明度(%)": 0 = fully opaque, 100 = fully transparent
      var a = 1;
      if (typeof alphaPercent !== 'undefined' && alphaPercent !== null) {
        var ap = parseFloat(alphaPercent);
        if (!isNaN(ap)) {
          var tp = Math.max(0, Math.min(100, ap));
          a = 1 - (tp / 100); // convert transparency% -> opacity
        }
      }
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    } catch (e) { return null; }
  }

  function applyStoredColors(bgColor, textColor, bgAlpha, textAlpha) {
    try {
      if (bgColor) {
        var bg = hexToRgba(bgColor, bgAlpha);
        if (bg) panel.style.background = bg;
      }
      if (textColor) {
        var tc = hexToRgba(textColor, textAlpha);
        if (tc) panel.style.color = tc; else panel.style.color = textColor;
      }
    } catch (e) { }
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
            try {
              var defaults = { position: DEFAULT, bgColor: '', textColor: '', bgAlpha: 60, textAlpha: 0 };
              if (storage && storage.local) {
                if (storage.local.get.length === 1) {
                  storage.local.get(defaults, function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
                } else {
                  storage.local.get(defaults).then(function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
                }
              }
            } catch (e) { }
          }).catch(function () { });
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
            try {
              var defaults = { position: DEFAULT, bgColor: '', textColor: '', bgAlpha: 60, textAlpha: 0 };
              if (storage && storage.local) {
                storage.local.get(defaults, function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
              }
            } catch (e) { }
          });
        } catch (e) { }
      }
    }
  } catch (e) { }
})();
