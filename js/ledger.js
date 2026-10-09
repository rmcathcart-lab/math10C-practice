/* Talking to the teacher's ledger (Google Apps Script web app, see backend/Code.gs).
 * Reads:  GET  <backend>?action=…  (fetch without cookies; JSONP fallback)
 * Writes: POST <backend>  text/plain JSON { class, name, token, events, status, progress } (no-cors; batched every 15 s,
 *         right away for important events, and with sendBeacon when the page is hidden or closed).
 * With no backend configured, everything stays on the device. */
(function (root) {
  'use strict';
  var HW = root.HW, cfg = root.HW_CONFIG || {}, URL = cfg.backend || '';
  var L = HW.Ledger = { enabled: !!URL, session: null, queue: [], status: null, progress: {}, lastPost: 0, ok: null, listeners: [] };
  var cbN = 0;
  function qs(params) { return Object.keys(params).filter(function (k) { return params[k] != null; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&'); }
  function jsonp(params, timeout) {
    return new Promise(function (resolve, reject) {
      var name = '__hwcb' + (++cbN) + '_' + Date.now(), s = document.createElement('script'), done = false;
      root[name] = function (data) { done = true; cleanup(); resolve(data); };
      function cleanup() { try { delete root[name]; } catch (e) { root[name] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); }
      s.src = URL + '?' + qs(Object.assign({}, params, { callback: name }));
      s.onerror = function () { if (!done) { cleanup(); reject(new Error('network')); } };
      setTimeout(function () { if (!done) { cleanup(); reject(new Error('timeout')); } }, timeout || 15000);
      document.head.appendChild(s);
    });
  }
  L.get = function (action, params, timeout) {
    if (!URL) return Promise.reject(new Error('no backend'));
    var p = Object.assign({ action: action }, params || {});
    var ctl = root.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, timeout || 15000);
    return fetch(URL + '?' + qs(p), { credentials: 'omit', redirect: 'follow', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(tm); if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch(function () { clearTimeout(tm); return jsonp(p, timeout); })
      .then(function (d) { setOk(true); return d; }, function (e) { setOk(false); throw e; });
  };
  function setOk(v) { if (L.ok !== v) { L.ok = v; L.listeners.forEach(function (fn) { try { fn(v); } catch (e) {} }); } }
  L.onStatus = function (fn) { L.listeners.push(fn); };

  L.push = function (ev, urgent) { if (!L.session) return; ev.at = ev.at || Date.now(); L.queue.push(ev); if (urgent) L.flushSoon(400); };
  L.setStatus = function (st, urgent) { L.status = Object.assign({ at: Date.now() }, st); if (urgent) L.flushSoon(300); };
  L.setProgress = function (lessonId, summary, state) { L.progress[lessonId] = { summary: summary, state: state }; };
  var soon = null;
  L.flushSoon = function (ms) { if (soon) return; soon = setTimeout(function () { soon = null; L.flush(); }, ms || 1500); };
  function payload() {
    var s = L.session; if (!s) return null;
    var body = { 'class': s.klass, name: s.name, token: s.token, device: s.device, events: L.queue.splice(0, 200), status: L.status, sent: Date.now() };
    var prog = L.progress, keys = Object.keys(prog); if (keys.length) { body.progress = prog; L.progress = {}; }
    return body;
  }
  L.flush = function (beacon) {
    if (!URL || !L.session) { L.queue = []; L.progress = {}; return; }
    var body = payload(); if (!body) return;
    var txt = JSON.stringify(body); L.lastPost = Date.now();
    if (beacon && navigator.sendBeacon) { try { if (navigator.sendBeacon(URL, new Blob([txt], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) {} }
    try {
      fetch(URL, { method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: txt.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: txt })
        .then(function () { setOk(true); }, function () { setOk(false); requeue(body); });
    } catch (e) { requeue(body); }
  };
  function requeue(body) { L.queue = (body.events || []).concat(L.queue).slice(-500); if (body.progress) Object.keys(body.progress).forEach(function (k) { if (!L.progress[k]) L.progress[k] = body.progress[k]; }); }
  L.start = function () {
    if (L.timer) return;
    L.timer = setInterval(function () {
      if (!L.session) return;
      var age = Date.now() - L.lastPost, live = L.status && L.status.view === 'lesson' && !L.status.away;
      if (L.queue.length || Object.keys(L.progress).length || age > (live ? 15000 : 45000)) L.flush();
    }, 5000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') L.flush(true); });
    root.addEventListener('pagehide', function () { L.flush(true); });
  };
})(window);
