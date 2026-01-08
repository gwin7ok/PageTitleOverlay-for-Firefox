(function () {
  var DEFAULT = 'left-bottom';
  var form = document.getElementById('posForm');
  var status = document.getElementById('status');
  var saveBtn = document.getElementById('save');

  function setStatus(msg, ok) {
    status.textContent = msg;
    status.style.color = ok ? 'green' : 'red';
    setTimeout(function () { status.textContent = ''; status.style.color = ''; }, 2000);
  }

  function load() {
    if (typeof browser !== 'undefined' && browser.storage) {
      try {
        browser.storage.local.get({ position: DEFAULT }).then(function (res) {
          var v = (res && res.position) || DEFAULT;
          var el = form.querySelector('input[name=position][value="' + v + '"]');
          if (el) el.checked = true;
        }).catch(function () { });
      } catch (e) { }
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        chrome.storage.local.get({ position: DEFAULT }, function (res) {
          var v = (res && res.position) || DEFAULT;
          var el = form.querySelector('input[name=position][value="' + v + '"]');
          if (el) el.checked = true;
        });
      } catch (e) { }
    }
  }

  function save(e) {
    e.preventDefault();
    var val = (form.position && form.position.value) || DEFAULT;
    if (typeof browser !== 'undefined' && browser.storage) {
      try {
        browser.storage.local.set({ position: val }).then(function () { setStatus('保存しました', true); }).catch(function () { setStatus('保存失敗', false); });
      } catch (e) { setStatus('保存失敗', false); }
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        chrome.storage.local.set({ position: val }, function () {
          if (chrome.runtime && chrome.runtime.lastError) setStatus('保存失敗', false);
          else setStatus('保存しました', true);
        });
      } catch (e) { setStatus('保存失敗', false); }
    }
  }

  saveBtn.addEventListener('click', save);
  load();
})();
