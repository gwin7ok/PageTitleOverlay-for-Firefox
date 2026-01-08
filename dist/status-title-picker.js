(function () {
    // Injected picker script: draws captured image and lets user click to pick color
    var LOG_PREFIX = '[StatusTitle-Picker]';
    function log() { try { var args = Array.prototype.slice.call(arguments); args.unshift(LOG_PREFIX); if (console && console.log) console.log.apply(console, args); } catch (e) { } }

    var overlay = null;
    function removeOverlay() {
        try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (e) { }
        overlay = null;
        try { window.removeEventListener('keydown', onKey); } catch (e) { }
        try { chrome.runtime.sendMessage({ action: 'pickerClosed' }); } catch (e) { try { browser.runtime.sendMessage({ action: 'pickerClosed' }); } catch (e) { } }
    }

    function onKey(e) {
        try {
            if (e.key === 'Escape' || e.keyCode === 27) { removeOverlay(); }
        } catch (e) { }
    }

    function hexFromRgb(r, g, b) {
        function h(v) { var s = v.toString(16); return s.length === 1 ? '0' + s : s; }
        return '#' + h(r) + h(g) + h(b);
    }

    function startPickerWithImage(imageDataUrl, field) {
        try {
            if (overlay) removeOverlay();
            overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = '2147483647';
            overlay.style.cursor = 'crosshair';
            overlay.style.background = 'rgba(0,0,0,0.2)';

            var canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            canvas.style.imageRendering = 'pixelated';
            overlay.appendChild(canvas);

            var preview = document.createElement('div');
            preview.style.position = 'fixed';
            preview.style.right = '10px';
            preview.style.top = '10px';
            preview.style.width = '120px';
            preview.style.height = '40px';
            preview.style.background = '#000';
            preview.style.color = '#fff';
            preview.style.padding = '6px';
            preview.style.fontFamily = 'monospace';
            preview.style.fontSize = '12px';
            preview.style.zIndex = '2147483648';
            preview.textContent = 'クリックで色を選択';
            overlay.appendChild(preview);

            document.documentElement.appendChild(overlay);

            var img = new Image();
            img.onload = function () {
                try {
                    var dpr = window.devicePixelRatio || 1;
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    // set display size to viewport size
                    canvas.style.width = window.innerWidth + 'px';
                    canvas.style.height = window.innerHeight + 'px';
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    function onMove(ev) {
                        try {
                            var rect = canvas.getBoundingClientRect();
                            var cx = ev.clientX - rect.left;
                            var cy = ev.clientY - rect.top;
                            var x = Math.round(cx * (canvas.width / rect.width));
                            var y = Math.round(cy * (canvas.height / rect.height));
                            try {
                                var p = ctx.getImageData(x, y, 1, 1).data;
                                if (p && p.length >= 3) {
                                    var hex = hexFromRgb(p[0], p[1], p[2]);
                                    preview.style.background = hex;
                                    preview.style.color = (p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114) > 186 ? '#000' : '#fff';
                                    preview.textContent = hex + ' (' + p[0] + ',' + p[1] + ',' + p[2] + ')';
                                }
                            } catch (e) { }
                        } catch (e) { }
                    }

                    function onClick(ev) {
                        try {
                            var rect = canvas.getBoundingClientRect();
                            var cx = ev.clientX - rect.left;
                            var cy = ev.clientY - rect.top;
                            var x = Math.round(cx * (canvas.width / rect.width));
                            var y = Math.round(cy * (canvas.height / rect.height));
                            try {
                                var p = ctx.getImageData(x, y, 1, 1).data;
                                if (p && p.length >= 3) {
                                    var hex = hexFromRgb(p[0], p[1], p[2]);
                                    try { chrome.runtime.sendMessage({ action: 'colorPicked', field: field, value: hex }); } catch (e) { try { browser.runtime.sendMessage({ action: 'colorPicked', field: field, value: hex }); } catch (e) { } }
                                }
                            } catch (e) { }
                        } catch (e) { }
                        removeOverlay();
                    }

                    canvas.addEventListener('mousemove', onMove);
                    canvas.addEventListener('click', onClick);
                    window.addEventListener('keydown', onKey);
                } catch (e) {
                    removeOverlay();
                }
            };
            img.onerror = function () { removeOverlay(); };
            img.src = imageDataUrl;
        } catch (e) { removeOverlay(); }
    }

    // listen for start message
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener(function (req) { try { if (req && req.action === 'startPicker') startPickerWithImage(req.image, req.field); } catch (e) { } });
        } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
            browser.runtime.onMessage.addListener(function (req) { try { if (req && req.action === 'startPicker') startPickerWithImage(req.image, req.field); } catch (e) { } });
        }
    } catch (e) { }
})();
