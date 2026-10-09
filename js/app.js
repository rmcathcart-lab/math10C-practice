/* Math 10C Practice — the student app.
 * Screens: sign in (class code → name → PIN), home (every lesson with a progress bar), lesson (one question at a time).
 * Progress lives on the device (localStorage) and is mirrored to the teacher's ledger when one is configured. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, L = HW.Ledger, cfg = root.HW_CONFIG || {};
  var view = document.getElementById('view'), top = document.getElementById('topbar');
  var STORE = 'hw:v1:', SESSION = 'hw:session', AWAY_GRACE = 1500, IDLE_MS = 120000;
  var S = null, session = null, cur = { lesson: null, item: null, inst: null, widget: null, practice: false, notice: null };
  var lastInteract = Date.now(), pendingSecs = {}, saveTimer = null;

  /* ---------------- storage ---------------- */
  function ls(k, v) { try { if (v === undefined) return root.localStorage.getItem(k); if (v === null) root.localStorage.removeItem(k); else root.localStorage.setItem(k, v); } catch (e) { return null; } }
  function deviceId() { var d = ls('hw:device'); if (!d) { d = 'd' + HW.newSeed().toString(36) + Date.now().toString(36); ls('hw:device', d); } return d; }
  function studentKey() { return (session.klass || 'local').toLowerCase() + '|' + session.name.toLowerCase(); }
  function loadState() { var raw = ls(STORE + studentKey()); try { S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; } if (!S || S.v !== 1) S = { v: 1, lessons: {} }; }
  function saveState() { ls(STORE + studentKey(), JSON.stringify(S)); }
  function saveSoon(lid) { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveTimer = null; saveState(); if (lid) pushProgress(lid); }, 600); }
  function LS(lid) { var x = S.lessons[lid]; if (!x) x = S.lessons[lid] = { items: {}, qv: {}, cur: null, secs: 0, updated: 0 }; return x; }
  function IR(lid, id) { var l = LS(lid), r = l.items[id]; if (!r) r = l.items[id] = { s: 'new', v: 0, tv: 0, wrong: 0, steps: 0, forms: 0, reveals: 0, credit: null, secs: 0, at: 0, prac: 0 }; return r; }
  function touch(lid) { LS(lid).updated = Date.now(); saveSoon(lid); }

  /* ---------------- seeds: each student gets their own numbers, the same on every device ---------------- */
  function seedFor(lid, id, v, prac) { return HW.hashStr(studentKey() + '|' + lid + '|' + id + '|' + v + (prac ? '|p' + prac : '')); }
  function qseedFor(lid, qnum) { return HW.hashStr(studentKey() + '|' + lid + '|q' + qnum + '|' + (LS(lid).qv[qnum] || 0)); }
  function instanceFor(lesson, it, prac) {
    var r = IR(lesson.id, it.id);
    return HW.makeInstance(lesson, it, seedFor(lesson.id, it.id, r.v, prac ? r.prac : 0), prac ? seedFor(lesson.id, 'q' + it.q.num, r.prac, 1) : qseedFor(lesson.id, it.q.num));
  }

  /* ---------------- progress summary ---------------- */
  function summary(lesson) {
    var l = LS(lesson.id), s = { req: lesson.required.length, reqDone: 0, reqFirst: 0, reqShown: 0, extra: lesson.extras.length, extraDone: 0, secs: l.secs || 0, cur: l.cur };
    lesson.items.forEach(function (it) {
      var r = l.items[it.id]; if (!r || r.s !== 'done') return;
      if (it.extra) s.extraDone++; else { s.reqDone++; if (r.credit === 'first') s.reqFirst++; if (r.credit === 'shown') s.reqShown++; }
    });
    return s;
  }
  function pushProgress(lid) { var lesson = HW.lessons[lid]; if (!lesson || !L.enabled) return; L.setProgress(lid, summary(lesson), LS(lid)); }
  function bar(lesson, big) {
    var s = summary(lesson), w = el('div', 'pbar' + (big ? ' big' : ''));
    var req = el('div', 'pb-track pb-req'); req.style.flexGrow = s.req;
    var helpN = s.reqDone - s.reqFirst;
    req.innerHTML = '<span class="pb-fill first" style="width:' + (100 * s.reqFirst / s.req) + '%"></span><span class="pb-fill help" style="width:' + (100 * helpN / s.req) + '%"></span>';
    w.appendChild(req);
    if (s.extra) { var ex = el('div', 'pb-track pb-extra'); ex.style.flexGrow = s.extra; ex.innerHTML = '<span class="pb-fill extra" style="width:' + (100 * s.extraDone / s.extra) + '%"></span>'; w.appendChild(ex); }
    w.title = s.reqDone + ' of ' + s.req + ' required done (' + s.reqFirst + ' first try)' + (s.extra ? ', ' + s.extraDone + ' of ' + s.extra + ' extra practice' : '');
    w.setAttribute('role', 'img'); w.setAttribute('aria-label', w.title);
    return w;
  }

  /* ---------------- top bar ---------------- */
  function drawTop(crumb) {
    top.innerHTML = '';
    var brand = el('a', 'brand', '<span class="brand-mark" aria-hidden="true">10C</span><span class="brand-name">' + esc(cfg.siteName || 'Math 10C Practice') + '</span>'); brand.href = '#/';
    top.appendChild(brand);
    if (crumb) top.appendChild(el('div', 'crumb', crumb));
    var right = el('div', 'top-right');
    if (session) {
      var calcB = el('button', 'btn btn-ghost top-calc', '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="7.5" y="5" width="9" height="4" rx=".6" fill="currentColor" opacity=".35"/><g fill="currentColor"><circle cx="9" cy="12.5" r="1"/><circle cx="12" cy="12.5" r="1"/><circle cx="15" cy="12.5" r="1"/><circle cx="9" cy="15.5" r="1"/><circle cx="12" cy="15.5" r="1"/><circle cx="15" cy="15.5" r="1"/><circle cx="9" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="15" cy="18.5" r="1"/></g></svg><span>Calculator</span>');
      calcB.type = 'button'; calcB.title = 'On-screen calculator (TI-30XIIS layout)'; calcB.addEventListener('click', function () { HW.Calc.toggle(); });
      right.appendChild(calcB);
      if (L.enabled) { var dot = el('span', 'sync-dot' + (L.ok === false ? ' bad' : L.ok ? ' good' : ''), ''); dot.title = L.ok === false ? 'Can’t reach your teacher’s ledger right now — your work is saved on this device and will be sent later.' : 'Your work is being saved for your teacher.'; right.appendChild(dot); }
      var who = el('button', 'btn btn-ghost who', esc(session.name) + (session.klass ? ' <span class="muted">· ' + esc(session.klass) + '</span>' : '')); who.type = 'button'; who.title = 'Sign out';
      who.addEventListener('click', function () { if (confirm('Sign out of ' + session.name + '?')) signOut(); });
      right.appendChild(who);
    }
    top.appendChild(right);
  }

  /* ---------------- sign in ---------------- */
  function signOut(msg) { L.flush(true); session = null; ls(SESSION, null); L.session = null; S = null; location.hash = '#/'; renderSignIn(msg); }
  function startSession(sess) {
    session = sess; ls(SESSION, JSON.stringify(sess)); L.session = { klass: sess.klass, name: sess.name, token: sess.token, device: deviceId() };
    loadState(); L.start();
    if (L.enabled) {
      L.get('progress', { 'class': sess.klass, name: sess.name, token: sess.token }).then(function (d) {
        if (d && d.ok === false && d.error === 'badtoken') { signOut('Your PIN was reset by your teacher. Sign in again.'); return; }
        if (d && d.ok && d.lessons) { var changed = merge(d.lessons); if (changed) { saveState(); route(); } }
        if (d && d.ok) { drawTop(top.dataset.crumb); }
      }).catch(function () {});
    }
    route();
  }
  /* server copy vs this device: per item keep the further-along record */
  function rank(r) { return r ? ({ 'new': 0, open: 1, shown: 2, done: 3 }[r.s] || 0) * 1e6 + (r.wrong || 0) + (r.v || 0) * 10 : -1; }
  function merge(remote) {
    var changed = false;
    Object.keys(remote).forEach(function (lid) {
      var rs = remote[lid]; if (!rs || !rs.items) return;
      var mine = LS(lid);
      Object.keys(rs.items).forEach(function (id) { if (rank(rs.items[id]) > rank(mine.items[id])) { mine.items[id] = rs.items[id]; changed = true; } });
      Object.keys(rs.qv || {}).forEach(function (q) { if ((rs.qv[q] || 0) > (mine.qv[q] || 0)) { mine.qv[q] = rs.qv[q]; changed = true; } });
      if ((rs.secs || 0) > (mine.secs || 0)) { mine.secs = rs.secs; changed = true; }
      if (!mine.cur && rs.cur) mine.cur = rs.cur;
    });
    return changed;
  }
  function renderSignIn(msg) {
    drawTop(); document.body.className = 'signin';
    view.innerHTML = '';
    var card = el('div', 'signin-card');
    card.appendChild(el('div', 'signin-mark', '10C'));
    card.appendChild(el('h1', '', esc(cfg.siteName || 'Math 10C Practice')));
    card.appendChild(el('p', 'muted', 'Homework practice for every lesson — new numbers each time, hints when you’re stuck.'));
    if (msg) card.appendChild(el('div', 'notice', esc(msg)));
    var body = el('div', 'signin-body'); card.appendChild(body); view.appendChild(card);
    if (!L.enabled) return localSignIn(body);
    var params = new URLSearchParams(location.search), preset = params.get('class') || params.get('c') || ls('hw:lastclass') || '';
    stepClass(body, preset, !!(params.get('class') || params.get('c')));
  }
  function localSignIn(body) {
    body.innerHTML = '<label class="lbl" for="nm">Your name</label>';
    var inp = el('input', 'field'); inp.id = 'nm'; inp.placeholder = 'First and last name'; inp.autocomplete = 'name'; body.appendChild(inp);
    var go = el('button', 'btn btn-primary btn-block', 'Start'); go.type = 'button'; body.appendChild(go);
    body.appendChild(el('p', 'small muted', 'Practice mode: your work is saved on this device only.'));
    function start() { var n = inp.value.trim(); if (n.length < 2) { inp.focus(); return; } startSession({ klass: '', name: n, token: '' }); }
    go.addEventListener('click', start); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); }); inp.focus();
  }
  function stepClass(body, preset, auto) {
    body.innerHTML = '<label class="lbl" for="cc">Class code</label>';
    var inp = el('input', 'field'); inp.id = 'cc'; inp.placeholder = 'From your teacher'; inp.value = preset; inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'off'); body.appendChild(inp);
    var go = el('button', 'btn btn-primary btn-block', 'Continue'); go.type = 'button'; body.appendChild(go);
    var err = el('div', 'form-err'); body.appendChild(err);
    function next() {
      var code = inp.value.trim(); if (!code) { inp.focus(); return; }
      go.disabled = true; go.textContent = 'Finding your class…'; err.textContent = '';
      L.get('roster', { 'class': code }).then(function (d) {
        go.disabled = false; go.textContent = 'Continue';
        if (!d || !d.ok) { err.textContent = d && d.error === 'unknown class' ? 'That class code wasn’t found. Check it with your teacher.' : 'Something went wrong. Try again.'; return; }
        ls('hw:lastclass', code); stepName(body, d.code || code, d.names || [], d.label);
      }).catch(function () { go.disabled = false; go.textContent = 'Continue'; err.textContent = 'Can’t reach the class list right now. Check your internet connection and try again.'; });
    }
    go.addEventListener('click', next); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') next(); });
    if (auto && preset) next(); else inp.focus();
  }
  function stepName(body, klass, names, label) {
    body.innerHTML = '';
    body.appendChild(el('div', 'step-head', '<b>' + esc(label || klass) + '</b> · Who are you?'));
    var filter = el('input', 'field'); filter.placeholder = 'Type to find your name'; filter.autocomplete = 'off'; body.appendChild(filter);
    var grid = el('div', 'name-grid'); body.appendChild(grid);
    function draw() {
      var f = filter.value.trim().toLowerCase(); grid.innerHTML = '';
      names.filter(function (n) { return !f || n.name.toLowerCase().indexOf(f) >= 0; }).forEach(function (n) {
        var b = el('button', 'name-btn', esc(n.name)); b.type = 'button';
        b.addEventListener('click', function () { stepPin(body, klass, n.name, !n.pin); });
        grid.appendChild(b);
      });
      if (!grid.children.length) grid.appendChild(el('div', 'muted small', names.length ? 'No names match.' : 'Your teacher hasn’t added a class list yet.'));
    }
    filter.addEventListener('input', draw); draw(); filter.focus();
    var back = el('button', 'btn btn-ghost btn-small', '← Different class code'); back.type = 'button'; back.addEventListener('click', function () { stepClass(body, '', false); }); body.appendChild(back);
  }
  function stepPin(body, klass, name, create) {
    body.innerHTML = '';
    body.appendChild(el('div', 'step-head', '<b>' + esc(name) + '</b>'));
    body.appendChild(el('p', 'small', create ? 'First time here: make up a 4-digit PIN. You’ll use it to sign in on any device, so pick one you’ll remember (and keep it to yourself).' : 'Enter your 4-digit PIN.'));
    var a = el('input', 'field pin'); a.type = 'password'; a.setAttribute('inputmode', 'numeric'); a.maxLength = 4; a.placeholder = '••••'; a.autocomplete = create ? 'new-password' : 'current-password'; body.appendChild(a);
    var b = null; if (create) { b = el('input', 'field pin'); b.type = 'password'; b.setAttribute('inputmode', 'numeric'); b.maxLength = 4; b.placeholder = 'again'; body.appendChild(b); }
    var go = el('button', 'btn btn-primary btn-block', create ? 'Create PIN and start' : 'Sign in'); go.type = 'button'; body.appendChild(go);
    var err = el('div', 'form-err'); body.appendChild(err);
    var back = el('button', 'btn btn-ghost btn-small', '← Not you?'); back.type = 'button'; back.addEventListener('click', function () { L.get('roster', { 'class': klass }).then(function (d) { stepName(body, klass, d.names || [], d.label); }); }); body.appendChild(back);
    function submit() {
      var p = a.value.trim();
      if (!/^\d{4}$/.test(p)) { err.textContent = 'Your PIN is 4 digits.'; a.focus(); return; }
      if (create && b.value.trim() !== p) { err.textContent = 'The two PINs don’t match.'; b.focus(); return; }
      go.disabled = true; err.textContent = '';
      L.get(create ? 'setpin' : 'signin', { 'class': klass, name: name, pin: p, device: deviceId() }).then(function (d) {
        go.disabled = false;
        if (d && d.ok && d.token) { startSession({ klass: klass, name: name, token: d.token }); return; }
        err.textContent = d && d.error === 'badpin' ? 'That PIN isn’t right. Ask your teacher to reset it if you forgot it.' : d && d.error === 'haspin' ? 'This name already has a PIN.' : d && d.error === 'locked' ? 'Too many tries. Wait a few minutes or ask your teacher.' : 'Something went wrong. Try again.';
        if (d && d.error === 'haspin') stepPin(body, klass, name, false);
      }).catch(function () { go.disabled = false; err.textContent = 'Can’t reach the server. Check your internet connection.'; });
    }
    go.addEventListener('click', submit);
    [a, b].forEach(function (x) { if (x) x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { if (x === a && b && !b.value) b.focus(); else submit(); } }); });
    a.focus();
  }

  /* ---------------- router ---------------- */
  function route() {
    if (!session) return renderSignIn();
    var h = location.hash.replace(/^#\/?/, '').split('/');
    if (h[0] === 'lesson' && HW.lessons[h[1]]) return openLesson(HW.lessons[h[1]], h[2]);
    renderHome();
  }
  root.addEventListener('hashchange', route);

  /* ---------------- home ---------------- */
  /* the student's level on each outcome of a unit: the highest question level answered correctly on the first try or after a hint */
  function unitLevels(u) {
    var LV = HW.LEVELS, best = {}, outs = String(u.outcomes || '').split(/\s*·\s*/).filter(Boolean);
    u.lessons.forEach(function (c) {
      var lesson = HW.lessons[c.id]; if (!lesson) return;
      lesson.items.forEach(function (it) {
        var r = (S.lessons[lesson.id] || { items: {} }).items[it.id];
        if (!r || r.s !== 'done' || (r.credit !== 'first' && r.credit !== 'hint')) return;
        if (outs.indexOf(it.outcome) < 0) outs.push(it.outcome);
        if (best[it.outcome] == null || LV.indexOf(it.level) > LV.indexOf(best[it.outcome])) best[it.outcome] = it.level;
      });
    });
    var wrap = el('span', 'unit-levels', '<span class="ulv-note">Your level:</span>');
    wrap.title = 'Your level on each outcome: the hardest level of question you have answered correctly on the first try or after a hint.';
    outs.forEach(function (o) {
      var lv = best[o], i = lv ? LV.indexOf(lv) : -1, dots = '';
      for (var k = 0; k < LV.length; k++) dots += '<i class="' + (k <= i ? 'on lvbg-' + lv : '') + '"></i>';
      wrap.appendChild(el('span', 'ulv' + (lv ? '' : ' none'), '<b>' + esc(o) + '</b><span class="ulv-dots" aria-hidden="true">' + dots + '</span>' +
        (lv ? '<span class="lvl lvl-' + lv + '">' + HW.LEVEL_NAMES[lv] + '</span>' : '<span class="ulv-none">No level yet</span>')));
    });
    return wrap;
  }
  function renderHome() {
    leaveLesson(); document.body.className = 'home';
    drawTop(); top.dataset.crumb = '';
    view.innerHTML = '';
    var head = el('div', 'home-head');
    head.appendChild(el('h1', '', 'Hi, ' + esc(session.name.split(' ')[0]) + '.'));
    var cont = lastLesson();
    head.appendChild(el('p', 'muted', cont ? 'Pick up where you left off, or choose any lesson below.' : 'Choose a lesson to start practising.'));
    view.appendChild(head);
    var legend = el('div', 'legend', '<span><i class="lg first"></i>Done first try</span><span><i class="lg help"></i>Done with a hint</span><span><i class="lg extra"></i>Extra practice</span><span><i class="lg empty"></i>Still to do</span>');
    view.appendChild(legend);
    HW.CATALOG.forEach(function (u) {
      var sec = el('section', 'unit');
      var uh = el('h2', 'unit-title', '<span class="unit-num">Unit ' + u.unit + '</span> ' + esc(u.title) + ' <span class="unit-out">' + esc(u.outcomes) + '</span>');
      sec.appendChild(uh);
      if (u.lessons.some(function (c) { return HW.lessons[c.id]; })) uh.appendChild(unitLevels(u));
      if (!u.lessons.length) { sec.classList.add('soon'); sec.appendChild(el('div', 'soon-note', 'Coming soon')); view.appendChild(sec); return; }
      var list = el('div', 'lesson-list');
      u.lessons.forEach(function (c) {
        var lesson = HW.lessons[c.id], row = el(lesson ? 'a' : 'div', 'lesson-row' + (lesson ? '' : ' locked'));
        var info = el('div', 'lr-info', '<div class="lr-num">Lesson ' + esc(c.num) + '</div><div class="lr-title">' + HW.tex(esc(c.title)) + '</div>');
        row.appendChild(info);
        if (lesson) {
          row.href = '#/lesson/' + lesson.id;
          var s = summary(lesson), right = el('div', 'lr-progress');
          right.appendChild(bar(lesson));
          right.appendChild(el('div', 'lr-counts', '<b>' + s.reqDone + '</b>/' + s.req + ' required' + (s.extra ? ' · <b>' + s.extraDone + '</b>/' + s.extra + ' extra' : '') + (s.secs ? ' · ' + mins(s.secs) : '')));
          row.appendChild(right);
          row.appendChild(el('span', 'lr-go', s.reqDone || s.extraDone ? (s.reqDone === s.req ? 'Review' : 'Continue') : 'Start'));
        } else row.appendChild(el('span', 'lr-soon', 'Coming soon'));
        list.appendChild(row);
      });
      sec.appendChild(list); view.appendChild(sec);
    });
    L.setStatus({ view: 'home' }, false);
  }
  function lastLesson() { var best = null; Object.keys(S.lessons).forEach(function (k) { if (!best || (S.lessons[k].updated || 0) > (S.lessons[best].updated || 0)) best = k; }); return best; }
  function mins(s) { if (s < 60) return '<1 min'; var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }

  /* ---------------- lesson ---------------- */
  function leaveLesson() { if (cur.lesson) { saveState(); pushProgress(cur.lesson.id); } cur = { lesson: null, item: null, inst: null, widget: null, practice: false, notice: null }; }
  function openLesson(lesson, itemId) {
    var switching = !cur.lesson || cur.lesson.id !== lesson.id;
    if (switching) leaveLesson();
    cur.lesson = lesson;
    document.body.className = 'lesson';
    var l = LS(lesson.id);
    var id = itemId && lesson.byId[itemId] ? itemId : (l.cur && lesson.byId[l.cur] ? l.cur : firstOpen(lesson));
    if (!itemId) { history.replaceState(null, '', '#/lesson/' + lesson.id + '/' + id); }
    showItem(id, switching);
  }
  function firstOpen(lesson) { var l = LS(lesson.id); for (var i = 0; i < lesson.required.length; i++) { var r = l.items[lesson.required[i].id]; if (!r || r.s !== 'done') return lesson.required[i].id; } return lesson.items[0].id; }
  function nextOpen(lesson, fromId) {
    var l = LS(lesson.id), idx = lesson.items.findIndex(function (it) { return it.id === fromId; });
    for (var i = idx + 1; i < lesson.items.length; i++) { var it = lesson.items[i]; var r = l.items[it.id]; if ((!r || r.s !== 'done') && it.extra === lesson.byId[fromId].extra) return it.id; }
    for (i = 0; i < lesson.items.length; i++) { it = lesson.items[i]; r = l.items[it.id]; if ((!r || r.s !== 'done') && !it.extra) return it.id; }
    return lesson.items[Math.min(idx + 1, lesson.items.length - 1)].id;
  }
  function showItem(id, fresh) {
    var lesson = cur.lesson, it = lesson.byId[id], l = LS(lesson.id), r = IR(lesson.id, id);
    cur.item = id; cur.practice = false; l.cur = id;
    if (r.s === 'new') { r.s = 'open'; r.at = Date.now(); L.push({ t: 'event', type: 'open', lesson: lesson.id, item: id }); }
    touch(lesson.id);
    drawTop('<a href="#/">All lessons</a><span class="sep">/</span>Unit ' + lesson.unit + ' · Lesson ' + esc(lesson.num));
    if (fresh || !document.querySelector('.lesson-wrap')) buildLessonFrame(lesson);
    drawNav(); drawHeaderBar();
    drawCard();
    L.setStatus({ view: 'lesson', lesson: lesson.id, item: id, label: it.label, away: false }, true);
    var a = document.querySelector('.qnav .qi.on'); if (a && a.scrollIntoView) { try { a.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
  }
  function buildLessonFrame(lesson) {
    view.innerHTML = '';
    var wrap = el('div', 'lesson-wrap');
    var head = el('div', 'lesson-head');
    head.innerHTML = '<div class="lh-eyebrow">Unit ' + lesson.unit + ' · Lesson ' + esc(lesson.num) + ' · ' + esc(lesson.outcome) + '</div><h1>' + HW.tex(esc(lesson.title)) + '</h1>';
    var hb = el('div', 'lh-bar'); head.appendChild(hb);
    wrap.appendChild(head);
    var body = el('div', 'lesson-body');
    var nav = el('nav', 'qnav'); nav.setAttribute('aria-label', 'Questions');
    var main = el('div', 'qmain');
    body.appendChild(nav); body.appendChild(main); wrap.appendChild(body);
    view.appendChild(wrap);
  }
  function drawHeaderBar() {
    var hb = document.querySelector('.lh-bar'); if (!hb) return; hb.innerHTML = '';
    var s = summary(cur.lesson); hb.appendChild(bar(cur.lesson, true));
    hb.appendChild(el('div', 'lh-counts', '<b>' + s.reqDone + '</b> of ' + s.req + ' required · <b>' + s.extraDone + '</b> of ' + s.extra + ' extra practice'));
  }
  function drawNav() {
    var nav = document.querySelector('.qnav'); if (!nav) return; nav.innerHTML = '';
    var lesson = cur.lesson, l = LS(lesson.id), groups = [], lastQ = null;
    lesson.items.forEach(function (it) {
      if (it.q !== lastQ) { groups.push({ q: it.q, extra: it.extra, items: [] }); lastQ = it.q; }
      groups[groups.length - 1].items.push(it);
    });
    var extraHead = false;
    nav.appendChild(el('div', 'qnav-title', 'Assignment'));
    groups.forEach(function (g) {
      if (g.extra && !extraHead) { extraHead = true; nav.appendChild(el('div', 'qnav-title extra', 'Extra practice <span>optional</span>')); }
      var row = el('div', 'qrow');
      row.appendChild(el('span', 'qn', (g.extra ? 'E' : '') + esc(g.q.num)));
      var pills = el('div', 'qpills');
      g.items.forEach(function (it) {
        var r = l.items[it.id], st = r ? r.s : 'new';
        var b = el('a', 'qi st-' + st + (r && r.s === 'done' ? ' cr-' + r.credit : '') + (it.id === cur.item ? ' on' : ''), g.items.length > 1 ? (it.p.sub || it.label.replace(/^.*\(|\)$/g, '')) : '•');
        b.href = '#/lesson/' + lesson.id + '/' + it.id; b.title = it.label + ' — ' + ({ 'new': 'not started', open: 'in progress', shown: 'answer shown — try a new version', done: r && r.credit === 'first' ? 'done (first try)' : 'done' }[st]);
        pills.appendChild(b);
      });
      row.appendChild(pills); nav.appendChild(row);
    });
  }

  function drawCard() {
    var main = document.querySelector('.qmain'); if (!main) return;
    var lesson = cur.lesson, it = lesson.byId[cur.item], r = IR(lesson.id, it.id);
    var inst = cur.inst = instanceFor(lesson, it, cur.practice);
    main.innerHTML = '';
    var card = el('article', 'qcard');
    card.appendChild(el('div', 'qsection', esc(it.q.sectionLabel || (it.extra ? 'Extra practice' : ''))));
    var h = el('div', 'qhead');
    h.appendChild(el('h2', '', (it.extra ? 'Extra ' : 'Question ') + esc(it.q.num) + (it.q.parts.length > 1 ? ' <span class="qpart">(' + esc(it.label.replace(/^.*\(|\)$/g, '')) + ')</span>' : '')));
    h.appendChild(el('span', 'lvl lvl-' + it.level, HW.LEVEL_NAMES[it.level]));
    card.appendChild(h);
    if (cur.notice) { card.appendChild(el('div', 'notice warn', cur.notice)); cur.notice = null; }
    if (inst.stem) card.appendChild(el('div', 'qstem', HW.tex(inst.stem)));
    card.appendChild(el('div', 'qprompt', (it.q.parts.length > 1 && !/^[A-Z]/.test(stripTags(inst.prompt)) ? '<span class="qlabel">(' + esc(it.label.replace(/^.*\(|\)$/g, '')) + ')</span> ' : '') + HW.tex(inst.prompt)));
    var fb = el('div', 'feedback'); fb.setAttribute('aria-live', 'polite');
    var done = r.s === 'done' && !cur.practice, shown = r.s === 'shown' && !cur.practice;

    if (done) {
      card.appendChild(el('div', 'answered', '<div class="ans-label">Your answer</div><div class="ans-val">' + (r.ansHtml || '—') + '</div>'));
      fb.className = 'feedback good';
      fb.innerHTML = '<div class="fb-title">' + (r.credit === 'first' ? '✓ Correct on the first try' : r.credit === 'shown' ? '✓ Correct (after the answer was shown)' : '✓ Correct') + '</div>';
      card.appendChild(fb);
      card.appendChild(solutionBlock(inst, false));
      var acts = el('div', 'qactions');
      var again = el('button', 'btn btn-ghost', 'Try another one like this'); again.type = 'button';
      again.addEventListener('click', function () { r.prac = (r.prac || 0) + 1; cur.practice = true; touch(lesson.id); drawCard(); });
      acts.appendChild(again); acts.appendChild(nextBtn(it)); card.appendChild(acts);
      main.appendChild(card); return;
    }
    if (shown) {
      fb.className = 'feedback shown';
      fb.innerHTML = '<div class="fb-title">Here’s the answer</div><div class="fb-ans">' + HW.tex(inst.answer) + '</div>';
      card.appendChild(fb);
      card.appendChild(solutionBlock(inst, true));
      var acts2 = el('div', 'qactions');
      var nv = el('button', 'btn btn-primary', 'Try a new version'); nv.type = 'button';
      nv.addEventListener('click', function () { newVersion(lesson, it, 'after-reveal'); r.s = 'open'; r.tv = 0; touch(lesson.id); L.push({ t: 'event', type: 'newversion', lesson: lesson.id, item: it.id }); drawNav(); drawCard(); });
      acts2.appendChild(nv); acts2.appendChild(nextBtn(it, true)); card.appendChild(acts2);
      card.appendChild(el('p', 'small muted', 'Study the solution, then try a new version with different numbers to finish this question.'));
      main.appendChild(card); return;
    }

    var w = cur.widget = makeWidget(inst, fb);
    card.appendChild(el('div', 'qinput')).appendChild(w.node);
    var acts3 = el('div', 'qactions');
    var check = el('button', 'btn btn-primary btn-check', 'Check'); check.type = 'button';
    check.addEventListener('click', onCheck); w.onEnter(onCheck);
    acts3.appendChild(check);
    var tries = el('span', 'tries'); acts3.appendChild(tries); drawTries(tries, inst, cur.practice ? (cur.ptv || 0) : r.tv);
    acts3.appendChild(el('span', 'spacer'));
    acts3.appendChild(nextBtn(it, true));
    card.appendChild(acts3);
    card.appendChild(fb);
    if (cur.practice) card.appendChild(el('p', 'small muted', 'Practice version — this question is already done, so this one is just for practice.'));
    main.appendChild(card);
    setTimeout(function () { try { w.focus(); } catch (e) {} }, 60);
  }
  function stripTags(s) { return String(s).replace(/<[^>]+>/g, '').replace(/\\\(|\\\)/g, '').trim(); }
  function nextBtn(it, ghost) {
    var b = el('button', 'btn ' + (ghost ? 'btn-ghost' : 'btn-primary') + ' btn-next', 'Next →'); b.type = 'button';
    b.addEventListener('click', function () { location.hash = '#/lesson/' + cur.lesson.id + '/' + nextOpen(cur.lesson, it.id); });
    return b;
  }
  function drawTries(node, inst, used) { var n = inst.tries, out = ''; for (var i = 0; i < n; i++) out += '<i class="' + (i < n - used ? 'left' : 'used') + '"></i>'; node.innerHTML = out; node.title = (n - used) + ' of ' + n + ' tries left before the answer is shown'; }
  function solutionBlock(inst, open) {
    var d = el('details', 'solution'); if (open) d.open = true;
    d.innerHTML = '<summary>Worked solution</summary><div class="sol-body">' + HW.tex(inst.solution) + '</div>';
    return d;
  }
  function makeWidget(inst, fb) {
    var I = inst.input, W = HW.widgets;
    switch (I.type) {
      case 'number': return W.number({ nr: I.nr, before: I.before, after: I.after });
      case 'list': return W.list({});
      case 'math': return W.math({ before: I.before, keys: I.keys, vars: I.vars, pi: I.pi, placeholder: I.placeholder });
      case 'mc': return W.mc({ options: I.options, columns: I.columns });
      case 'select': return W.select({ options: I.options });
      case 'classify': return W.classify({ n: I.n });
      case 'pairs': return W.pairs({ start: I.start });
      case 'ladder': return W.ladder({ n: I.n, exponent: I.exponent, onStep: function (s) { onStep(s, fb); } });
      case 'tree': return W.tree({ n: I.n, exponent: I.exponent, onStep: function (s) { onStep(s, fb); } });
    }
    if (W[I.type]) return W[I.type](I);
    throw new Error('unknown input ' + I.type);
  }
  function onStep(s, fb) {
    var lesson = cur.lesson, it = lesson.byId[cur.item], r = IR(lesson.id, it.id);
    if (s.ok) { fb.className = 'feedback'; fb.innerHTML = ''; return; }
    if (!s.form && !cur.practice) { r.steps = (r.steps || 0) + 1; touch(lesson.id); }
    showFb(fb, s.form ? 'form' : 'hint', s.form ? '' : (s.shown ? 'Step shown' : 'Not quite'), s.hint);
    logAttempt(it, s.form ? 'form' : 'step', s.code, '', null);
  }
  function showFb(fb, kind, title, body) {
    fb.className = 'feedback ' + kind;
    fb.innerHTML = (title ? '<div class="fb-title">' + title + '</div>' : '') + (body ? '<div class="fb-body">' + HW.tex(body) + '</div>' : '');
  }
  function answerText(inst, resp) {
    var t = inst.input.type;
    try {
      if (t === 'list' || t === 'select') return (resp || []).join(', ');
      if (t === 'pairs') return (resp || []).map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(' ');
      if (t === 'classify') return resp ? resp.choice + (resp.choice === 'composite' ? ' ' + resp.a + '×' + resp.b : '') : '';
      if (t === 'mc') { var o = inst.input.options.filter(function (x) { return x.key === resp; })[0]; return resp ? resp + '. ' + (o ? stripTags(o.html) : '') : ''; }
      if (t === 'ladder' || t === 'tree') return resp ? String(resp.final || '') : '';
      if (t === 'order') { var byO = {}; inst.input.items.forEach(function (x) { byO[x.id] = stripTags(x.html) || x.id; }); return (resp || []).map(function (id) { return byO[id] || id; }).join(' , '); }
      if (t === 'grid') { var colN = {}; inst.input.cols.forEach(function (c) { colN[c.id] = c.label || stripTags(c.html); }); return inst.input.rows.map(function (r) { var g = (resp || {})[r.id]; return (r.label || stripTags(r.html)) + ': ' + (Array.isArray(g) ? g.map(function (c) { return colN[c]; }).join('+') || '–' : g == null ? '–' : colN[g]); }).join('; '); }
      if (t === 'fields') return (resp || []).join(' | ');
      return String(resp == null ? '' : resp);
    } catch (e) { return ''; }
  }
  function answerHtml(inst, resp) {
    var t = inst.input.type, txt = answerText(inst, resp);
    if (t === 'math' || t === 'ladder' || t === 'tree') { var v = t === 'math' ? resp : resp.final; var latex = /\\/.test(v) ? v : HW.parse.plain(v).replace(/\^\(?(\d+)\)?/g, '^{$1}').replace(/\*/g, '\\times '); return HW.k((inst.input.before ? stripTags(inst.input.before) : '') + latex); }
    if (t === 'number') return HW.k(String(resp).trim());
    if (t === 'mc') { var o = inst.input.options.filter(function (x) { return x.key === resp; })[0]; return o ? '<b>' + o.key + '.</b> ' + HW.tex(o.html) : esc(txt); }
    if (t === 'classify') return resp.choice === 'prime' ? 'Prime' : 'Composite: ' + HW.k(HW.fmt(inst.input.n) + '=' + resp.a + '\\times ' + resp.b);
    if (t === 'list' || t === 'select') return HW.k((resp || []).join(',\\ '));
    if (t === 'order') { var byH = {}; inst.input.items.forEach(function (x) { byH[x.id] = HW.tex(x.html); }); return (resp || []).map(function (id) { return byH[id] || esc(id); }).join(', '); }
    if (t === 'fields') return (resp || []).map(function (v, i) { var f = inst.input.fields[i] || {}; return (f.label ? HW.tex(f.label) + ' ' : '') + (f.before ? HW.tex(f.before) + ' ' : '') + (f.mode === 'math' && v !== 'none' ? HW.k(String(v)) : esc(v)); }).join(' &nbsp;·&nbsp; ');
    return esc(txt);
  }
  function logAttempt(it, verdict, code, answer, tryNo) {
    var lesson = cur.lesson;
    L.push({ t: 'attempt', lesson: lesson.id, item: it.id, label: it.label, outcome: it.outcome, level: it.level, extra: it.extra ? 1 : 0, practice: cur.practice ? 1 : 0,
      ver: IR(lesson.id, it.id).v, verdict: verdict, code: code || '', answer: String(answer || '').slice(0, 200), tryNo: tryNo || 0, prompt: cur.inst ? cur.inst.text || stripTags(cur.inst.prompt).slice(0, 160) : '' }, verdict === 'correct' || verdict === 'reveal');
  }
  function onCheck() {
    var lesson = cur.lesson, it = lesson.byId[cur.item], r = IR(lesson.id, it.id), inst = cur.inst, w = cur.widget;
    var fb = document.querySelector('.qcard .feedback'); if (!w || !fb) return;
    lastInteract = Date.now();
    if (w.structured && !w.ready()) { showFb(fb, 'form', '', inst.input.type === 'tree' ? 'Finish the factor tree first: every branch must end in a circled prime.' : 'Finish the ladder first: keep dividing until the quotient is \\(1\\).'); return; }
    var resp = w.value(), res;
    try { res = inst.check(resp); } catch (e) { res = { v: 'form', hint: 'I couldn’t read that answer. Check the format and try again.' }; }
    var ansT = answerText(inst, resp);
    if (res.v === 'form') {
      if (!cur.practice) r.forms = (r.forms || 0) + 1;
      showFb(fb, 'form', 'Almost — check the format', res.hint); logAttempt(it, 'form', res.code, ansT); touch(lesson.id); return;
    }
    if (res.v === 'correct') {
      logAttempt(it, 'correct', '', ansT, (cur.practice ? cur.ptv || 0 : r.tv) + 1);
      if (cur.practice) { r.pracRight = (r.pracRight || 0) + 1; cur.ptv = 0; touch(lesson.id); showFb(fb, 'good', '✓ Correct', ''); fb.appendChild(solutionBlock(inst, false)); w.disable(true); swapToNext(it); return; }
      r.s = 'done'; r.credit = r.reveals ? 'shown' : (r.wrong || r.steps) ? 'hint' : 'first'; r.done = Date.now(); r.ansHtml = answerHtml(inst, resp); r.ans = ansT;
      touch(lesson.id); drawNav(); drawHeaderBar();
      showFb(fb, 'good', r.credit === 'first' ? '✓ Correct on the first try!' : '✓ Correct', r.credit === 'first' ? '' : 'Nice work sticking with it.');
      fb.appendChild(solutionBlock(inst, false)); w.disable(true); swapToNext(it); return;
    }
    // wrong
    var tv;
    if (cur.practice) { cur.ptv = (cur.ptv || 0) + 1; tv = cur.ptv; }
    else { r.wrong = (r.wrong || 0) + 1; r.tv = (r.tv || 0) + 1; tv = r.tv; touch(lesson.id); }
    logAttempt(it, 'wrong', res.code, ansT, tv);
    var tries = document.querySelector('.qcard .tries'); if (tries) drawTries(tries, inst, tv);
    if (w.mark && inst.input.type === 'mc') w.mark(resp);
    if (tv >= inst.tries) {
      if (cur.practice) { showFb(fb, 'shown', 'Here’s the answer', ''); fb.appendChild(el('div', 'fb-ans', HW.tex(inst.answer))); fb.appendChild(solutionBlock(inst, true)); w.disable(true); cur.ptv = 0; return; }
      r.s = 'shown'; r.reveals = (r.reveals || 0) + 1; touch(lesson.id);
      L.push({ t: 'event', type: 'reveal', lesson: lesson.id, item: it.id, at: Date.now() + 5 }, true);
      drawNav(); drawCard(); return;
    }
    var generic = inst.hints[Math.min(tv - 1, inst.hints.length - 1)];
    var body = res.hint || generic || 'Check your work and try again.';
    if (res.hint && tv >= 2 && generic && generic !== res.hint) body += '<div class="fb-more">' + HW.tex(generic) + '</div>';
    var left = inst.tries - tv;
    showFb(fb, 'hint', 'Not quite — try again', body);
    fb.appendChild(el('div', 'fb-left', left === 1 ? 'One more try before the answer is shown.' : left + ' tries left.'));
  }
  function swapToNext(it) {
    var btn = document.querySelector('.qcard .btn-check'); if (!btn) return;
    var nb = nextBtn(it, false); btn.parentNode.replaceChild(nb, btn);
    var gh = document.querySelectorAll('.qcard .btn-next.btn-ghost'); gh.forEach(function (g) { g.remove(); });
    var tries = document.querySelector('.qcard .tries'); if (tries) tries.remove();
    setTimeout(function () { try { nb.focus(); } catch (e) {} }, 30);
  }
  function newVersion(lesson, it, why) {
    var r = IR(lesson.id, it.id); r.v = (r.v || 0) + 1;
    if (it.q.shared) LS(lesson.id).qv[it.q.num] = (LS(lesson.id).qv[it.q.num] || 0) + 1;
  }

  /* ---------------- leaving the page = new numbers ---------------- */
  var awayAt = 0;
  function working() { if (!cur.lesson || !cur.item) return false; if (cur.practice) return true; var r = IR(cur.lesson.id, cur.item); return r.s === 'open'; }
  function goneAway() { if (awayAt) return; awayAt = Date.now(); if (cur.lesson) L.setStatus(Object.assign({}, L.status || {}, { away: true }), true); }
  function cameBack() {
    if (!awayAt) return; var gone = Date.now() - awayAt; awayAt = 0;
    if (!cur.lesson) return;
    L.setStatus(Object.assign({}, L.status || {}, { away: false }), true);
    if (gone < AWAY_GRACE || !working()) { if (gone >= AWAY_GRACE) L.push({ t: 'event', type: 'away', lesson: cur.lesson.id, item: cur.item, secs: Math.round(gone / 1000) }); return; }
    var it = cur.lesson.byId[cur.item];
    if (cur.practice) { IR(cur.lesson.id, it.id).prac++; }
    else newVersion(cur.lesson, it, 'leave');
    touch(cur.lesson.id);
    L.push({ t: 'event', type: 'leave', lesson: cur.lesson.id, item: it.id, secs: Math.round(gone / 1000) }, true);
    cur.notice = '<b>You left the page</b> (' + Math.round(gone / 1000) + ' s), so this question has new numbers. Keep this tab open while you work — use the on-screen calculator or your own calculator.';
    drawCard();
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') goneAway(); else if (document.hasFocus()) cameBack(); });
  root.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) goneAway(); }, 50); });
  root.addEventListener('focus', function () { if (document.visibilityState === 'visible') cameBack(); });

  /* ---------------- time on task ---------------- */
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { root.addEventListener(ev, function () { lastInteract = Date.now(); }, { passive: true, capture: true }); });
  setInterval(function () {
    if (!session || !cur.lesson || awayAt || document.visibilityState !== 'visible' || !document.hasFocus() || Date.now() - lastInteract > IDLE_MS) return;
    var lid = cur.lesson.id, l = LS(lid); l.secs = (l.secs || 0) + 1;
    var r = IR(lid, cur.item); r.secs = (r.secs || 0) + 1;
    pendingSecs[lid] = (pendingSecs[lid] || 0) + 1;
    if (l.secs % 20 === 0) saveSoon(lid);
  }, 1000);
  setInterval(function () { Object.keys(pendingSecs).forEach(function (lid) { if (pendingSecs[lid]) { L.push({ t: 'tick', lesson: lid, item: cur.item, secs: pendingSecs[lid] }); pendingSecs[lid] = 0; } }); }, 15000);
  L.onStatus(function () { var d = document.querySelector('.sync-dot'); if (d) { d.className = 'sync-dot' + (L.ok === false ? ' bad' : ' good'); } });

  /* ---------------- start ---------------- */
  HW.App = { route: route, state: function () { return S; }, session: function () { return session; }, cur: function () { return cur; }, signOut: signOut };
  function boot() {
    if (root.MathfieldElement) { try { root.MathfieldElement.fontsDirectory = null; root.MathfieldElement.soundsDirectory = null; } catch (e) {} }
    var saved = null; try { saved = JSON.parse(ls(SESSION) || 'null'); } catch (e) {}
    var params = new URLSearchParams(location.search), want = params.get('class') || params.get('c');
    if (saved && saved.name && (!want || (saved.klass || '').toLowerCase() === want.toLowerCase())) startSession(saved);
    else renderSignIn();
  }
  // wait briefly for the math editor (MathLive) so answer boxes can use it; carry on without it if it is slow or blocked
  var t0 = Date.now();
  (function wait() {
    if ((root.customElements && root.customElements.get('math-field')) || Date.now() - t0 > 2500 || root.HW_NO_MATHLIVE) { boot(); return; }
    setTimeout(wait, 80);
  })();
})(window);
