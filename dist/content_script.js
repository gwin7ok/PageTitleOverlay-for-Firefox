(function () {
  const ID = 'status-title-overlay';
  if (document.getElementById(ID)) return;

  const panel = document.createElement('div');
  panel.id = ID;
  panel.setAttribute('role', 'status');
  panel.style.pointerEvents = 'none';

  // Root cleaned content_script.js has been copied here earlier; keep current content (already matches root).
  if (storage.local.get.length === 1) {
    storage.local.get({ position: 'left-bottom' }, res => applyPosition(res.position || 'left-bottom'));
  } else {
    storage.local.get({ position: 'left-bottom' }).then(res => applyPosition(res.position || 'left-bottom'));
  }
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
    browser.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.position) applyPosition(changes.position.newValue); });
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.position) applyPosition(changes.position.newValue); });
  }
} else {
  applyPosition('left-bottom');
}
        } catch (e) {
  applyPosition('left-bottom');
}
      }) ();

updateMargin();
update();
    }) ();
if (e.key === 'Shift') { isShiftPressed = false; updateVisibility(); }
  }, true);
window.addEventListener('blur', () => { isShiftPressed = false; updateVisibility(); });
window.addEventListener('resize', updateMargin);
document.addEventListener('fullscreenchange', updateMargin);

function update() {
  const rawTitle = document.title;
  const newHasNoTitle = (!rawTitle || rawTitle === 'No Title');

  if (label.textContent !== (rawTitle || '') || hasNoTitle !== newHasNoTitle) {
    hasNoTitle = newHasNoTitle;
    label.textContent = rawTitle || '';

    if (!hasNoTitle) {
      setTimeout(refreshMemory, 100);
    }
    updateVisibility();
  }
}

document.addEventListener('visibilitychange', update);
window.addEventListener('focus', update);
setInterval(update, 3000);

updateMargin();
update();
}) ();
