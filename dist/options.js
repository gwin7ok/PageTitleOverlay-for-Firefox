(function () {
  var DEFAULT = 'left-bottom';
  var form = document.getElementById('posForm');
  var status = document.getElementById('status');
  var colorForm = document.getElementById('colorForm');
  var statusColors = document.getElementById('statusColors');
  var bgInput = document.getElementById('bgColor');
  var textInput = document.getElementById('textColor');
  var bgAlphaInput = document.getElementById('bgAlpha');
  var bgAlphaVal = document.getElementById('bgAlphaVal');
  var textAlphaInput = document.getElementById('textAlpha');
  var textAlphaVal = document.getElementById('textAlphaVal');

  function setChecked(val) {
    var radios = form.elements['position'];
    for (var i = 0; i < radios.length; i++) {
      radios[i].checked = (radios[i].value === val);
    }
  }

  function load() {
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    if (storage && storage.local) {
      try {
        var defaults = { position: DEFAULT, bgColor: '', textColor: '', bgAlpha: 60, textAlpha: 0 };
        if (storage.local.get.length === 1) {
          storage.local.get(defaults, function (res) {
            setChecked((res && res.position) || DEFAULT);
            if (bgInput && typeof res.bgColor !== 'undefined') bgInput.value = res.bgColor || '#000000';
            if (textInput && typeof res.textColor !== 'undefined') textInput.value = res.textColor || '#ffffff';
            if (bgAlphaInput && typeof res.bgAlpha !== 'undefined') { bgAlphaInput.value = res.bgAlpha; if (bgAlphaVal) bgAlphaVal.textContent = res.bgAlpha; }
            if (textAlphaInput && typeof res.textAlpha !== 'undefined') { textAlphaInput.value = res.textAlpha; if (textAlphaVal) textAlphaVal.textContent = res.textAlpha; }
          });
        } else {
          storage.local.get(defaults).then(function (res) {
            setChecked((res && res.position) || DEFAULT);
            if (bgInput && typeof res.bgColor !== 'undefined') bgInput.value = res.bgColor || '#000000';
            if (textInput && typeof res.textColor !== 'undefined') textInput.value = res.textColor || '#ffffff';
            if (alphaInput && typeof res.alpha !== 'undefined') { alphaInput.value = res.alpha; if (alphaVal) alphaVal.textContent = res.alpha; }
          });
        }
      } catch (e) {
        try { storage.local.get({ position: DEFAULT }, function (res) { setChecked((res && res.position) || DEFAULT); }); } catch (e) { setChecked(DEFAULT); }
      }
    } else {
      setChecked(DEFAULT);
      if (bgInput) bgInput.value = '#000000';
      if (textInput) textInput.value = '#ffffff';
      if (bgAlphaInput) bgAlphaInput.value = 60; if (bgAlphaVal) bgAlphaVal.textContent = 60;
      if (textAlphaInput) textAlphaInput.value = 0; if (textAlphaVal) textAlphaVal.textContent = 0;
    }
  }

  function save(e) {
    e.preventDefault();
    var radios = form.elements['position'];
    var val = DEFAULT;
    for (var i = 0; i < radios.length; i++) { if (radios[i].checked) { val = radios[i].value; break; } }
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    if (storage && storage.local) {
      try {
        if (storage.local.set.length === 1) {
          storage.local.set({ position: val }, function () { status.textContent = '保存しました'; setTimeout(function () { status.textContent = ''; }, 1500); });
        } else {
          storage.local.set({ position: val }).then(function () { status.textContent = '保存しました'; setTimeout(function () { status.textContent = ''; }, 1500); });
        }
      } catch (e) {
        try { storage.local.set({ position: val }, function () { status.textContent = '保存しました'; setTimeout(function () { status.textContent = ''; }, 1500); }); } catch (e) { status.textContent = '保存に失敗しました'; setTimeout(function () { status.textContent = ''; }, 1500); }
      }
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
        if (storage.local.set.length === 1) {
          storage.local.set(obj, function () { statusColors.textContent = '保存しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); });
        } else {
          storage.local.set(obj).then(function () { statusColors.textContent = '保存しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); });
        }
      } catch (e) {
        try { storage.local.set(obj, function () { statusColors.textContent = '保存しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); }); } catch (e) { statusColors.textContent = '保存に失敗しました'; setTimeout(function () { statusColors.textContent = ''; }, 1500); }
      }
    } else {
      statusColors.textContent = '保存できませんでした';
      setTimeout(function () { statusColors.textContent = ''; }, 1500);
    }
  }

  if (form) {
    form.addEventListener('submit', save);
    load();
    if (colorForm) {
      colorForm.addEventListener('submit', saveColors);
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
                var p = runtimeApi.sendMessage({ action: 'saveThemeColors' });
                if (p && typeof p.then === 'function') {
                  p.then(function (res) { statusFetch.textContent = res && res.ok ? '取得しました' : '取得できませんでした'; setTimeout(function () { statusFetch.textContent = ''; }, 1400); }).catch(function () { statusFetch.textContent = '取得に失敗'; setTimeout(function () { statusFetch.textContent = ''; }, 1400); });
                }
              }
            } catch (e) { statusFetch.textContent = '取得に失敗'; setTimeout(function () { statusFetch.textContent = ''; }, 1400); }
          });
        }
      } catch (e) { }
    }
    // pick buttons (スポイト) - request picker via background
    try {
      var picks = document.querySelectorAll('.pick');
      for (var pi = 0; pi < picks.length; pi++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var field = btn.getAttribute('data-field');
            if (!field) return;
            statusColors.textContent = 'スポイト中…ページをクリックしてください（Escでキャンセル）';
            try {
              var runtimeApi = (typeof browser !== 'undefined' && browser.runtime) ? browser.runtime : (typeof chrome !== 'undefined' ? chrome.runtime : null);
              if (runtimeApi && runtimeApi.sendMessage) {
                runtimeApi.sendMessage({ action: 'startPicker', field: field });
              }
            } catch (e) { statusColors.textContent = 'スポイトを開始できませんでした'; setTimeout(function () { statusColors.textContent = ''; }, 1500); }
          });
        })(picks[pi]);
      }
    } catch (e) { }
    // reflect storage changes in UI (when background stores picked colors)
    try {
      var storageApi = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
      if (storageApi && storageApi.onChanged) {
        storageApi.onChanged.addListener(function (changes, area) {
          if (area !== 'local') return;
          if (changes.bgColor && bgInput) bgInput.value = changes.bgColor.newValue || '#000000';
          if (changes.textColor && textInput) textInput.value = changes.textColor.newValue || '#ffffff';
          if (changes.bgAlpha && bgAlphaInput) { bgAlphaInput.value = changes.bgAlpha.newValue; if (bgAlphaVal) bgAlphaVal.textContent = changes.bgAlpha.newValue; }
          if (changes.textAlpha && textAlphaInput) { textAlphaInput.value = changes.textAlpha.newValue; if (textAlphaVal) textAlphaVal.textContent = changes.textAlpha.newValue; }
          // no UI confirmation needed when storage changes from picker/save
        });
      }
    } catch (e) { }
  }
})();
