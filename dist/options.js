(function () {
  var DEFAULT = 'left-bottom';
  var form = document.getElementById('posForm');
  var status = document.getElementById('status');

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
        if (storage.local.get.length === 1) {
          storage.local.get({ position: DEFAULT }, function (res) { setChecked((res && res.position) || DEFAULT); });
        } else {
          storage.local.get({ position: DEFAULT }).then(function (res) { setChecked((res && res.position) || DEFAULT); });
        }
      } catch (e) {
        try { storage.local.get({ position: DEFAULT }, function (res) { setChecked((res && res.position) || DEFAULT); }); } catch (e) { setChecked(DEFAULT); }
      }
    } else {
      setChecked(DEFAULT);
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

  if (form) {
    form.addEventListener('submit', save);
    load();
  }
})();
