(function () {
  var DEFAULT = 'left-bottom';
  function log() { try { var a = Array.prototype.slice.call(arguments); a.unshift('[page-title-overlay]'); if (console && console.debug) console.debug.apply(console, a); } catch (e) { } }
  var form = document.getElementById('posForm');
  var status = document.getElementById('status');
  var enabledOn = document.getElementById('enabled_on');
  var enabledOff = document.getElementById('enabled_off');
  var fontInput = document.getElementById('fontSize');
  var colorForm = document.getElementById('colorForm');
  var statusColors = document.getElementById('statusColors');
  var bgInput = document.getElementById('bgColor');
  var textInput = document.getElementById('textColor');
  var bgAlphaInput = document.getElementById('bgAlpha');
  var bgAlphaVal = document.getElementById('bgAlphaVal');
  var textAlphaInput = document.getElementById('textAlpha');
  var textAlphaVal = document.getElementById('textAlphaVal');
  var saveAllBtn = document.getElementById('saveAll');
  var statusAll = document.getElementById('statusAll');

  function setChecked(val) {
    var radios = form.elements['position'];
    for (var i = 0; i < radios.length; i++) {
      radios[i].checked = (radios[i].value === val);
    }
  }

  function load() {
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    log('load: storage API ->', !!storage ? (typeof browser !== 'undefined' && browser.storage ? 'browser.storage' : 'chrome.storage') : 'none');
    // load shared defaults.json first, then call storage.get with those defaults
    getDefaults(function (defaults) {
      if (storage && storage.local) {
        try {
          if (storage.local.get.length === 1) {
            log('load: storage.local.get -> callback style');
            storage.local.get(defaults, function (res) { populateFromStorage(res, defaults); });
          } else {
            log('load: storage.local.get -> promise style');
            storage.local.get(defaults).then(function (res) { populateFromStorage(res, defaults); });
          }
        } catch (e) {
          log('load: storage.local.get threw, attempting callback fallback');
          try { storage.local.get(defaults, function (res) { populateFromStorage(res, defaults); }); } catch (e) { log('load: storage.get fallback failed, using defaults'); populateFromStorage(defaults, defaults); }
        }
      } else {
        populateFromStorage(defaults, defaults);
      }
    });
  }

  function populateFromStorage(res, defaults) {
    res = res || defaults || {};
    setChecked((res && res.position) || DEFAULT);
    if (bgInput && typeof res.bgColor !== 'undefined') bgInput.value = res.bgColor || defaults.bgColor || '#000000';
    if (textInput && typeof res.textColor !== 'undefined') textInput.value = res.textColor || defaults.textColor || '#ffffff';
    if (bgAlphaInput && typeof res.bgAlpha !== 'undefined') { bgAlphaInput.value = res.bgAlpha; if (bgAlphaVal) bgAlphaVal.textContent = res.bgAlpha; }
    if (textAlphaInput && typeof res.textAlpha !== 'undefined') { textAlphaInput.value = res.textAlpha; if (textAlphaVal) textAlphaVal.textContent = res.textAlpha; }
    if (typeof res.enabled !== 'undefined') {
      if (enabledOn) enabledOn.checked = !!res.enabled;
      if (enabledOff) enabledOff.checked = !res.enabled;
    } else if (typeof defaults.enabled !== 'undefined') {
      if (enabledOn) enabledOn.checked = !!defaults.enabled;
      if (enabledOff) enabledOff.checked = !defaults.enabled;
    }
    if (fontInput && typeof res.fontSize !== 'undefined' && !fontTouched) { fontInput.value = parseInt(res.fontSize, 10) || defaults.fontSize || 20; }
  }

  // fetch and cache defaults.json
  var defaultsCache = null;
  function getDefaults(cb) {
    if (defaultsCache) { cb(defaultsCache); return; }
    try {
      var url = (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) ? browser.runtime.getURL('defaults.json') : (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('defaults.json') : 'defaults.json');
      log('getDefaults: attempting fetch from', url);
      fetch(url).then(function (r) { return r.json(); }).then(function (j) { defaultsCache = j || {}; cb(defaultsCache); }).catch(function () { defaultsCache = { position: DEFAULT, bgColor: '#c0d7e5', textColor: '#000000', bgAlpha: 0, textAlpha: 0, enabled: true, fontSize: 20 }; cb(defaultsCache); });
    } catch (e) { log('getDefaults: fetch failed, using fallback defaults', e && e.message); defaultsCache = { position: DEFAULT, bgColor: '#c0d7e5', textColor: '#000000', bgAlpha: 0, textAlpha: 0, enabled: true, fontSize: 20 }; cb(defaultsCache); }
  }

  // helper: robust storage.set that supports Promise and callback styles
  function storageSet(obj, cb) {
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    if (!storage || !storage.local) {
      if (cb) cb(new Error('no storage'));
      return;
    }
    try {
      var ret = storage.local.set(obj);
      if (ret && typeof ret.then === 'function') {
        log('storageSet: using promise-style storage.local.set');
        ret.then(function () { if (cb) cb(null); }).catch(function (err) { if (cb) cb(err || new Error('set failed')); });
        return;
      }
    } catch (e) { }
    try {
      log('storageSet: using callback-style storage.local.set');
      storage.local.set(obj, function () { if (cb) cb(null); });
    } catch (e) { log('storageSet: callback-style set failed', e && e.message); if (cb) cb(e || new Error('set failed')); }
  }

  // track if user has interacted with font input to avoid overwriting with async load
  var fontTouched = false;

  function save(e) {
    e.preventDefault();
    var radios = form.elements['position'];
    var val = DEFAULT;
    for (var i = 0; i < radios.length; i++) { if (radios[i].checked) { val = radios[i].value; break; } }
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    if (storage && storage.local) {
      try {
        storageSet({ position: val }, function (err) { if (!err) { status.textContent = '保存しました'; setTimeout(function () { status.textContent = ''; }, 1500); } else { status.textContent = '保存に失敗しました'; setTimeout(function () { status.textContent = ''; }, 1500); } });
      } catch (e) { status.textContent = '保存に失敗しました'; setTimeout(function () { status.textContent = ''; }, 1500); }
    } else {
      status.textContent = '保存できませんでした';
      setTimeout(function () { status.textContent = ''; }, 1500);
    }
  }

  function saveColors(e) {
    e.preventDefault();
    var bc = (bgInput && bgInput.value) ? bgInput.value : '';
    var tc = (textInput && textInput.value) ? textInput.value : '';
    var a = (bgAlphaInput && bgAlphaInput.value) ? parseInt(bgAlphaInput.value, 10) : 60;
    var ta = (textAlphaInput && textAlphaInput.value) ? parseInt(textAlphaInput.value, 10) : 0;
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    if (storage && storage.local) {
      try {
        var obj = { bgColor: bc, textColor: tc, bgAlpha: a, textAlpha: ta };
        storageSet(obj, function (err) { if (!err) { statusColors.textContent = '保存しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); } else { statusColors.textContent = '保存に失敗しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); } });
      } catch (e) { statusColors.textContent = '保存に失敗しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); }
    } else {
      statusColors.textContent = '保存できませんでした';
      setTimeout(function () { statusColors.textContent = ''; }, 1500);
    }
  }

  if (form) {
    load();
    // enabled radios: save immediately when changed
    try {
      function saveEnabled(val) {
        var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
        if (!storage || !storage.local) return;
        try {
          storageSet({ enabled: !!val }, function (err) { if (!err) { if (statusAll) statusAll.textContent = '保存しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1200); } else { if (statusAll) statusAll.textContent = '保存に失敗しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1200); } });
        } catch (e) { if (statusAll) statusAll.textContent = '保存に失敗しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1200); }
      }
      if (enabledOn) enabledOn.addEventListener('change', function () { if (enabledOn.checked) saveEnabled(true); });
      if (enabledOff) enabledOff.addEventListener('change', function () { if (enabledOff.checked) saveEnabled(false); });
    } catch (e) { }
    // live font size preview
    try {
      if (fontInput) {
        fontInput.addEventListener('input', function () { try { fontTouched = true; } catch (e) { } });
      }
    } catch (e) { }
    if (colorForm) {
      if (bgAlphaInput && bgAlphaVal) { bgAlphaInput.addEventListener('input', function () { bgAlphaVal.textContent = bgAlphaInput.value; }); }
      if (textAlphaInput && textAlphaVal) { textAlphaInput.addEventListener('input', function () { textAlphaVal.textContent = textAlphaInput.value; }); }
      // fetch theme button
      try {
        var fetchBtn = document.getElementById('fetchTheme');
        var statusFetch = document.getElementById('statusFetch');
        if (fetchBtn) {
          fetchBtn.addEventListener('click', function () {
            try {
              statusFetch.textContent = '取得中…';
              var runtimeApi = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : (typeof chrome !== 'undefined' ? chrome.runtime : null);
              if (runtimeApi && runtimeApi.sendMessage) {
                log('fetchTheme: using runtime.sendMessage');
                // Request theme colors from background but do NOT save them to storage here.
                // Background's 'getTheme' returns an object with { background, color } if available.
                var p = runtimeApi.sendMessage({ action: 'getTheme' });
                if (p && typeof p.then === 'function') {
                  p.then(function (res) {
                    try {
                      if (res) {
                        if (res.background && bgInput) bgInput.value = res.background || bgInput.value;
                        if (res.color && textInput) textInput.value = res.color || textInput.value;
                      }
                      statusFetch.textContent = '取得しました（未保存）';
                      setTimeout(function () { statusFetch.textContent = ''; }, 1400);
                    } catch (e) { statusFetch.textContent = '取得に失敗'; setTimeout(function () { statusFetch.textContent = ''; }, 1400); }
                  }).catch(function () { statusFetch.textContent = '取得に失敗'; setTimeout(function () { statusFetch.textContent = ''; }, 1400); });
                }
              }
            } catch (e) { statusFetch.textContent = '取得に失敗'; setTimeout(function () { statusFetch.textContent = ''; }, 1400); }
          });
        }
      } catch (e) { }
    }
    // unified save button handler
    try {
      if (saveAllBtn) {
        saveAllBtn.addEventListener('click', function () {
          try {
            var radios = form.elements['position'];
            var val = DEFAULT;
            for (var i = 0; i < radios.length; i++) { if (radios[i].checked) { val = radios[i].value; break; } }
            var bc = (bgInput && bgInput.value) ? bgInput.value : '';
            var tc = (textInput && textInput.value) ? textInput.value : '';
            var a = (bgAlphaInput && bgAlphaInput.value) ? parseInt(bgAlphaInput.value, 10) : 60;
            var ta = (textAlphaInput && textAlphaInput.value) ? parseInt(textAlphaInput.value, 10) : 0;
            var enabledVal = (enabledOn && enabledOn.checked) ? true : false;
            var fz = (fontInput && fontInput.value) ? parseInt(fontInput.value, 10) : 20;
            var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
            if (storage && storage.local) {
              try {
                var obj = { position: val, bgColor: bc, textColor: tc, bgAlpha: a, textAlpha: ta, enabled: enabledVal, fontSize: fz };
                storageSet(obj, function (err) { if (!err) { if (statusAll) statusAll.textContent = '保存しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1500); } else { if (statusAll) statusAll.textContent = '保存に失敗しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1500); } });
              } catch (e) { if (statusAll) statusAll.textContent = '保存に失敗しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1500); }
            } else { if (statusAll) statusAll.textContent = '保存できませんでした'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1500); }
          } catch (e) { if (statusAll) statusAll.textContent = '保存に失敗しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1500); }
        });
      }
    } catch (e) { }
    // picker removed: no pick buttons
    // reflect storage changes in UI (when background stores picked colors)
    try {
      var storageApi = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
      if (storageApi && storageApi.onChanged) {
        storageApi.onChanged.addListener(function (changes, area) {
          log('options: storage.onChanged', changes, area);
          if (area !== 'local') return;
          if (changes.bgColor && bgInput) bgInput.value = changes.bgColor.newValue || '#000000';
          if (changes.textColor && textInput) textInput.value = changes.textColor.newValue || '#ffffff';
          if (changes.bgAlpha && bgAlphaInput) { bgAlphaInput.value = changes.bgAlpha.newValue; if (bgAlphaVal) bgAlphaVal.textContent = changes.bgAlpha.newValue; }
          if (changes.textAlpha && textAlphaInput) { textAlphaInput.value = changes.textAlpha.newValue; if (textAlphaVal) textAlphaVal.textContent = changes.textAlpha.newValue; }
          if (changes.fontSize && fontInput) { fontInput.value = parseInt(changes.fontSize.newValue, 10) || 20; }
          if (changes.enabled) {
            try { if (enabledOn) enabledOn.checked = !!changes.enabled.newValue; if (enabledOff) enabledOff.checked = !changes.enabled.newValue; if (statusAll) statusAll.textContent = '設定を保存しました'; setTimeout(function () { if (statusAll) statusAll.textContent = ''; }, 1200); } catch (e) { }
          }
          // no UI confirmation needed when storage changes from picker/save
        });
      }
    } catch (e) { }
  }
})();
