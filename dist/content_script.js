(function () {
  var ID = 'status-title-overlay';
  if (document.getElementById(ID)) return;

  var panel = document.createElement('div');
  panel.id = ID;
  panel.setAttribute('role', 'status');
  panel.style.position = 'fixed';
  panel.style.zIndex = '2147483647';
  panel.style.pointerEvents = 'none';
  panel.style.padding = '2px 6px';
  panel.style.background = 'rgba(0,0,0,0.6)';
  panel.style.color = '#fff';
  panel.style.fontSize = '12px';
  panel.style.borderRadius = '3px';
  panel.style.maxWidth = '80%';
  panel.style.overflow = 'hidden';
  panel.style.whiteSpace = 'nowrap';
  panel.style.textOverflow = 'ellipsis';

  var label = document.createElement('span');
  panel.appendChild(label);
  document.body.appendChild(panel);

  var DEFAULT = 'left-bottom';
  function applyPosition(pos) {
    panel.style.top = '';
    panel.style.bottom = '';
    panel.style.left = '';
    panel.style.right = '';
    var margin = '10px';
    if (pos === 'left-top') { panel.style.top = margin; panel.style.left = margin; }
    else if (pos === 'right-top') { panel.style.top = margin; panel.style.right = margin; }
    else if (pos === 'right-bottom') { panel.style.bottom = margin; panel.style.right = margin; }
    else { panel.style.bottom = margin; panel.style.left = margin; }
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
})();
