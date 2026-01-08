(function () {
  var DEFAULT = 'left-bottom';
  var form = document.getElementById('posForm');
  var status = document.getElementById('status');
  var colorForm = document.getElementById('colorForm');
  var statusColors = document.getElementById('statusColors');
  var bgInput = document.getElementById('bgColor');
  var textInput = document.getElementById('textColor');
  var alphaInput = document.getElementById('alpha');
  var alphaVal = document.getElementById('alphaVal');

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
        var defaults = { position: DEFAULT, bgColor: '', textColor: '', alpha: 60 };
        if (storage.local.get.length === 1) {
          storage.local.get(defaults, function (res) {
            setChecked((res && res.position) || DEFAULT);
            if (bgInput && typeof res.bgColor !== 'undefined') bgInput.value = res.bgColor || '#000000';
            if (textInput && typeof res.textColor !== 'undefined') textInput.value = res.textColor || '#ffffff';
            if (alphaInput && typeof res.alpha !== 'undefined') { alphaInput.value = res.alpha; if (alphaVal) alphaVal.textContent = res.alpha; }
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
      if (alphaInput) alphaInput.value = 60; if (alphaVal) alphaVal.textContent = 60;
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
    var a = (alphaInput && alphaInput.value) ? parseInt(alphaInput.value, 10) : 60;
    var storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' ? chrome.storage : null);
    if (storage && storage.local) {
      try {
        var obj = { bgColor: bc, textColor: tc, alpha: a };
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
      if (alphaInput && alphaVal) {
        alphaInput.addEventListener('input', function () { alphaVal.textContent = alphaInput.value; });
      }
    }
  }
})();
