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
  panel.style.fontSize = '14px';
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
  }

  function setTitle() { label.textContent = document.title || ''; }
  setTitle();
  var lastTitle = document.title;
  setInterval(function () { if (document.title !== lastTitle) { lastTitle = document.title; setTitle(); } }, 500);

  var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
  if (storage && storage.local) {
    try {
      if (storage.local.get.length === 1) {
        storage.local.get({ position: DEFAULT, enabled: true, fontSize: 14 }, function (res) { applyPosition((res && res.position) || DEFAULT); try { if (typeof res.enabled !== 'undefined' && !res.enabled) panel.style.display = 'none'; else panel.style.display = 'inline-block'; } catch (e) { } try { if (res && typeof res.fontSize !== 'undefined') panel.style.fontSize = (parseInt(res.fontSize, 10) || 14) + 'px'; } catch (e) { } });
      } else {
        storage.local.get({ position: DEFAULT, enabled: true, fontSize: 14 }).then(function (res) { applyPosition((res && res.position) || DEFAULT); try { if (typeof res.enabled !== 'undefined' && !res.enabled) panel.style.display = 'none'; else panel.style.display = 'inline-block'; } catch (e) { } try { if (res && typeof res.fontSize !== 'undefined') panel.style.fontSize = (parseInt(res.fontSize, 10) || 14) + 'px'; } catch (e) { } });
      }
    } catch (e) { try { storage.local.get({ position: DEFAULT, enabled: true, fontSize: 14 }, function (res) { applyPosition((res && res.position) || DEFAULT); try { if (typeof res.enabled !== 'undefined' && !res.enabled) panel.style.display = 'none'; else panel.style.display = 'inline-block'; } catch (e) { } try { if (res && typeof res.fontSize !== 'undefined') panel.style.fontSize = (parseInt(res.fontSize, 10) || 14) + 'px'; } catch (e) { } }); } catch (e) { applyPosition(DEFAULT); } }

    if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
      browser.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'local') return;
        try {
          if (changes.position) applyPosition(changes.position.newValue);
          if (changes.enabled) {
            try { if (changes.enabled.newValue) panel.style.display = 'inline-block'; else panel.style.display = 'none'; } catch (e) { }
          }
          if (changes.fontSize) { try { panel.style.fontSize = (parseInt(changes.fontSize.newValue, 10) || 14) + 'px'; } catch (e) { } }
          if (changes.bgColor || changes.textColor || changes.bgAlpha || changes.textAlpha) {
            // read full stored values to ensure we have matching color+alpha pairs
            try {
              var defaults = { bgColor: '', textColor: '', bgAlpha: 60, textAlpha: 0 };
              if (browser.storage && browser.storage.local && browser.storage.local.get) {
                if (browser.storage.local.get.length === 1) {
                  browser.storage.local.get(defaults, function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                } else {
                  browser.storage.local.get(defaults).then(function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                }
              }
            } catch (e) { }
          }
        } catch (e) { }
      });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'local') return;
        try {
          if (changes.position) applyPosition(changes.position.newValue);
          if (changes.enabled) {
            try { if (changes.enabled.newValue) panel.style.display = 'inline-block'; else panel.style.display = 'none'; } catch (e) { }
          }
          if (changes.bgColor || changes.textColor || changes.bgAlpha || changes.textAlpha) {
            try {
              var defaults2 = { bgColor: '', textColor: '', bgAlpha: 60, textAlpha: 0 };
              if (chrome.storage && chrome.storage.local && chrome.storage.local.get) {
                if (chrome.storage.local.get.length === 1) {
                  chrome.storage.local.get(defaults2, function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                } else {
                  chrome.storage.local.get(defaults2).then(function (res) { applyStoredColors(res.bgColor, res.textColor, res.bgAlpha, res.textAlpha); });
                }
              }
            } catch (e) { }
          }
        } catch (e) { }
      });
    }
  } else {
    applyPosition(DEFAULT);
  }

  window.addEventListener('resize', function () { if (CURRENT_POS && CURRENT_POS.indexOf('right') !== -1) { try { var avail = window.innerWidth - (MARGIN_PX * 2); if (avail > 0) panel.style.maxWidth = avail + 'px'; } catch (e) { panel.style.maxWidth = ''; } } });

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

  // On startup, apply any stored explicit colors
  try {
    var defaults = { position: DEFAULT, bgColor: '', textColor: '', bgAlpha: 60, textAlpha: 0 };
    if (storage && storage.local) {
      try {
        if (storage.local.get.length === 1) {
          storage.local.get(defaults, function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
        } else {
          storage.local.get(defaults).then(function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); });
        }
      } catch (e) { try { storage.local.get(defaults, function (sres) { applyStoredColors(sres.bgColor, sres.textColor, sres.bgAlpha, sres.textAlpha); }); } catch (e) { } }
    }
  } catch (e) { }

})();
