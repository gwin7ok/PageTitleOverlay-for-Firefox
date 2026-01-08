(function () {
  const DEFAULT = 'left-bottom';
  const form = document.getElementById('posForm');
  const status = document.getElementById('status');
  const saveBtn = document.getElementById('save');

  function setStatus(msg, ok) {
    status.textContent = msg;
    status.style.color = ok ? 'green' : 'red';
    setTimeout(() => status.textContent = '', 2000);
  }

  function load() {
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.get({ position: DEFAULT }).then(res => {
        const v = res.position || DEFAULT;
        const el = form.querySelector(`input[name=position][value="${v}"]`);
        if (el) el.checked = true;
      });
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get({ position: DEFAULT }, res => {
        const v = res.position || DEFAULT;
        const el = form.querySelector(`input[name=position][value="${v}"]`);
        if (el) el.checked = true;
      });
    }
  }

  function save(e) {
    e.preventDefault();
    const val = form.position.value || DEFAULT;
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.set({ position: val }).then(() => setStatus('保存しました', true), () => setStatus('保存失敗', false));
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ position: val }, () => {
        if (chrome.runtime.lastError) setStatus('保存失敗', false);
        else setStatus('保存しました', true);
      });
    }
  }

  saveBtn.addEventListener('click', save);
  load();
})();
(() => {
  const DEFAULT = 'left-bottom';
  const form = document.getElementById('posForm');
  const status = document.getElementById('status');
  const saveBtn = document.getElementById('save');

  function setStatus(msg, ok) {
    status.textContent = msg;
    status.style.color = ok ? 'green' : 'red';
    setTimeout(() => status.textContent = '', 2000);
  }

  function load() {
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.get({ position: DEFAULT }).then(res => {
        const v = res.position || DEFAULT;
        const el = form.querySelector(`input[name=position][value="${v}"]`);
        if (el) el.checked = true;
      });
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get({ position: DEFAULT }, res => {
        const v = res.position || DEFAULT;
        const el = form.querySelector(`input[name=position][value="${v}"]`);
        if (el) el.checked = true;
      });
    }
  }

  function save(e) {
    e.preventDefault();
    const val = form.position.value || DEFAULT;
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.set({ position: val }).then(() => setStatus('保存しました', true), () => setStatus('保存失敗', false));
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ position: val }, () => {
        if (chrome.runtime.lastError) setStatus('保存失敗', false);
        else setStatus('保存しました', true);
      });
    }
  }

  saveBtn.addEventListener('click', save);
  load();
})();
