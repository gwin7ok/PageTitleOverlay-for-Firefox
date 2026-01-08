(function () {
  const ID = 'status-title-overlay';
  if (document.getElementById(ID)) return;

  const panel = document.createElement('div');
  panel.id = ID;
  panel.setAttribute('role', 'status');
  panel.style.pointerEvents = 'none';

  const label = document.createElement('span');
  label.id = 'status-title-label';
  panel.appendChild(label);

  (document.body || document.documentElement).appendChild(panel);

  let cachedRect = { left: 0, top: 0, right: 0, bottom: 0 };
  let isShiftPressed = false;
  let hasNoTitle = false;

  function debugLog(msg) {
    // console.debug(`[StatusTitle][content] ${msg}`);
  }

  function refreshMemory() {
    if (hasNoTitle) return;
    const origDisplay = panel.style.display;
    (function () {
      const ID = 'status-title-overlay';
      if (document.getElementById(ID)) return;

      const panel = document.createElement('div');
      panel.id = ID;
      panel.setAttribute('role', 'status');
      panel.style.pointerEvents = 'none';

      const label = document.createElement('span');
      label.id = 'status-title-label';
      panel.appendChild(label);

      (document.body || document.documentElement).appendChild(panel);

      let cachedRect = { left: 0, top: 0, right: 0, bottom: 0 };
      let isShiftPressed = false;
      let hasNoTitle = false;

      function debugLog(msg) {
        // console.debug(`[StatusTitle][content] ${msg}`);
      }

      function refreshMemory() {
        if (hasNoTitle) return;
        const origDisplay = panel.style.display;
        panel.style.removeProperty('display');
        panel.style.removeProperty('visibility');

        const rect = panel.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          cachedRect = {
            left: Math.floor(rect.left) - 3,
            top: Math.floor(rect.top) - 3,
            right: Math.ceil(rect.right) + 3,
            bottom: Math.ceil(rect.bottom) + 3,
          };
          debugLog(`width:${Math.round(rect.width)} L:${cachedRect.left} R:${cachedRect.right}`);
        }

        panel.style.removeProperty('display');
        panel.style.removeProperty('visibility');
        try { panel.style.display = origDisplay; } catch (e) {}
      }

      function updateMargin() {
        const isFullscreen = !!(document.fullscreenElement || (window.fullScreen && window.fullScreen === true));
        if (isFullscreen) {
          // when fullscreen, keep small gap
          panel.style.setProperty('margin', '0', 'important');
        } else {
          panel.style.removeProperty('margin');
        }
        setTimeout(refreshMemory, 150);
      }

      function updateVisibility(e) {
        const mouseX = e ? e.clientX : -1;
        const mouseY = e ? e.clientY : -1;
        const isMouseInside = (
          mouseX >= cachedRect.left && mouseX <= cachedRect.right &&
          mouseY >= cachedRect.top && mouseY <= cachedRect.bottom
        );

        const shouldHide = isMouseInside || isShiftPressed || hasNoTitle;
        if (shouldHide && !panel.hasAttribute('force-hide')) {
          panel.setAttribute('force-hide', 'true');
          debugLog('hide');
        } else if (!shouldHide && panel.hasAttribute('force-hide')) {
          panel.removeAttribute('force-hide');
          debugLog('show');
        }
      }

      window.addEventListener('mousemove', updateVisibility, { passive: true });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift' && !isShiftPressed) { isShiftPressed = true; updateVisibility(); }
      }, true);
      window.addEventListener('keyup', (e) => {
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

      // Apply stored position (left-top/right-top/left-bottom/right-bottom)
      function applyPosition(pos) {
        panel.style.removeProperty('left');
        panel.style.removeProperty('right');
        panel.style.removeProperty('top');
        panel.style.removeProperty('bottom');
        switch (pos) {
          case 'left-top':
            panel.style.setProperty('left', '8px', 'important');
            panel.style.setProperty('top', '8px', 'important');
            break;
          case 'right-top':
            panel.style.setProperty('right', '8px', 'important');
            panel.style.setProperty('top', '8px', 'important');
            break;
          case 'right-bottom':
            panel.style.setProperty('right', '8px', 'important');
            panel.style.setProperty('bottom', '30px', 'important');
            break;
          case 'left-bottom':
          default:
            panel.style.setProperty('left', '8px', 'important');
            panel.style.setProperty('bottom', '30px', 'important');
            break;
        }
        setTimeout(refreshMemory, 120);
      }

      (function initPosition() {
        try {
          const storage = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : (typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : null);
          if (storage && storage.local) {
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
      })();

      updateMargin();
      update();
    })();
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
})();
