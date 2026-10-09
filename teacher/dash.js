/* Practice Ledger — the teacher dashboard for Math 10C Practice.
 * Tabs: Live (who is working right now), Progress (every student × lesson), Outcomes (highest level reached per
 * outcome), Questions (item analysis and the most common errors), Student (one student's full record), Settings
 * (class lists, PIN resets, class times, the class link + QR code).
 * "In class only" uses the server's in-class tag (the class's block on the bell schedule). */
(function (root) {
  'use strict';
  var HW = root.HW, L = HW.Ledger, el = HW.el, esc = HW.esc, cfg = root.HW_CONFIG || {};
  var view = document.getElementById('view'), top = document.getElementById('topbar');
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  var st = { key: ls('hw:tkey') || '', classes: [], klass: ls('hw:tclass') || '', D: null, tab: ls('hw:ttab') || 'live', scope: ls('hw:tscope') || 'class', rule: ls('hw:trule') || 'hint', lesson: Object.keys(HW.lessons)[0], student: null, loading: false, liveTimer: null, dashTimer: null, sortP: 'name' };
  var LV = HW.LEVELS, LVN = HW.LEVEL_NAMES;
  function api(action, params) { return L.get(action, Object.assign({ key: st.key }, params || {}), 30000); }
  function ago(ms) { if (!ms) return '—'; var s = Math.round((Date.now() - ms) / 1000); if (s < 60) return s + ' s ago'; var m = Math.round(s / 60); if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); if (h < 36) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; }
  function dur(s) { s = Math.round(s || 0); if (s < 60) return s ? s + ' s' : '0'; var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' m'; }
  function since(ms) { var s = Math.max(0, Math.round((Date.now() - ms) / 1000)); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60 < 10 ? '0' : '') + (s % 60) + ' s'; }
  function pct(a, b) { return b ? Math.round(100 * a / b) + '%' : '—'; }
  function short(name) { var p = String(name).trim().split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1][0] + '.' : name; }

  /* ---------------- shell ---------------- */
  function drawTop() {
    top.innerHTML = '';
    var brand = el('a', 'brand', '<span class="brand-mark dark" aria-hidden="true">10C</span><span class="brand-name">Practice Ledger</span>'); brand.href = './'; top.appendChild(brand);
    if (st.key && st.classes.length) {
      var sel = el('select', 'class-pick'); sel.setAttribute('aria-label', 'Class');
      st.classes.forEach(function (c) { var o = el('option', '', esc(c.label) + ' (' + c.students + ')'); o.value = c.code; if (c.code === st.klass) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', function () { st.klass = sel.value; ls('hw:tclass', st.klass); st.student = null; loadDash(); });
      top.appendChild(sel);
      var scope = el('div', 'seg'); [['class', 'In class only'], ['all', 'All work']].forEach(function (s) { var b = el('button', s[0] === st.scope ? 'on' : '', s[1]); b.type = 'button'; b.addEventListener('click', function () { st.scope = s[0]; ls('hw:tscope', s[0]); render(); drawTop(); }); scope.appendChild(b); });
      scope.title = 'In class only: count work done during this class’s block on the bell schedule (what you can grade). All work: include homework done outside class.';
      top.appendChild(scope);
    }
    var right = el('div', 'top-right');
    if (st.D) right.appendChild(el('span', 'small muted', 'Updated ' + new Date(st.D.now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })));
    var stu = el('a', 'btn btn-ghost', 'Student site ↗'); stu.href = '../'; stu.target = '_blank'; right.appendChild(stu);
    top.appendChild(right);
  }
  function tabs() {
    var t = el('nav', 'tabs');
    [['live', 'Live'], ['progress', 'Progress'], ['outcomes', 'Outcomes'], ['questions', 'Questions'], ['student', 'Student'], ['settings', 'Settings']].forEach(function (x) {
      var b = el('button', 'tab' + (st.tab === x[0] ? ' on' : ''), x[1]); b.type = 'button';
      b.addEventListener('click', function () { st.tab = x[0]; ls('hw:ttab', x[0]); render(); });
      t.appendChild(b);
    });
    return t;
  }
  function boot() {
    drawTop();
    if (!L.enabled) { view.innerHTML = '<div class="panel"><h2>No ledger connected</h2><p>Set <code>backend</code> in <code>js/config.js</code> to the Apps Script web-app URL.</p></div>'; return; }
    if (!st.key) return keyScreen();
    loadClasses();
  }
  function keyScreen(msg) {
    drawTop(); view.innerHTML = '';
    var c = el('div', 'signin-card'); c.innerHTML = '<div class="signin-mark dark">10C</div><h1>Practice Ledger</h1><p class="muted">Enter your teacher key. It’s in the Apps Script project (Project Settings → Script properties → TEACHER_KEY).</p>';
    if (msg) c.appendChild(el('div', 'notice', esc(msg)));
    var inp = el('input', 'field'); inp.type = 'password'; inp.placeholder = 'Teacher key'; c.appendChild(inp);
    var go = el('button', 'btn btn-primary btn-block', 'Open the ledger'); go.type = 'button'; c.appendChild(go);
    function sub() { st.key = inp.value.trim(); if (!st.key) return; ls('hw:tkey', st.key); loadClasses(); }
    go.addEventListener('click', sub); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') sub(); });
    view.appendChild(c); inp.focus();
  }
  function loadClasses() {
    view.innerHTML = '<div class="loading">Opening the ledger…</div>';
    api('classes').then(function (d) {
      if (!d.ok) { if (d.error === 'bad key') { ls('hw:tkey', null); st.key = ''; return keyScreen('That key didn’t work.'); } throw new Error(d.error); }
      st.classes = d.classes; st.noSchool = d.noSchool; st.bell = d.bell;
      if (!st.classes.length) { st.tab = 'settings'; st.D = null; drawTop(); return render(); }
      if (!st.classes.some(function (c) { return c.code === st.klass; })) st.klass = st.classes[0].code;
      loadDash();
    }).catch(function (e) { view.innerHTML = '<div class="panel"><h2>Can’t reach the ledger</h2><p class="muted">' + esc(e.message) + '</p></div>'; });
  }
  function loadDash(quiet) {
    if (!st.klass) return render();
    if (!quiet) { st.loading = true; if (!st.D) view.innerHTML = '<div class="loading">Loading ' + esc(st.klass) + '…</div>'; }
    return api('dash', { 'class': st.klass }).then(function (d) {
      st.loading = false;
      if (!d.ok) throw new Error(d.error || 'error');
      st.D = d; st.derived = null; drawTop(); render();
      clearInterval(st.dashTimer); st.dashTimer = setInterval(function () { if (document.visibilityState === 'visible') loadDash(true); }, 120000);
      clearInterval(st.liveTimer); st.liveTimer = setInterval(pollLive, 10000);
    }).catch(function (e) { st.loading = false; if (!quiet) view.innerHTML = '<div class="panel"><h2>Couldn’t load the class</h2><p class="muted">' + esc(e.message) + '</p></div>'; });
  }
  function pollLive() {
    if (!st.D || document.visibilityState !== 'visible' || st.tab !== 'live') return;
    api('live', { 'class': st.klass }).then(function (d) { if (d.ok && st.D) { st.D.live = d.live; st.D.liveNow = d.now; if (st.tab === 'live') render(); } }).catch(function () {});
  }
  setInterval(function () { if (st.tab === 'live') document.querySelectorAll('[data-since]').forEach(function (n) { n.textContent = since(Number(n.dataset.since)); }); }, 1000);

  /* ---------------- derived data ---------------- */
  function derive() {
    if (st.derived && st.derived.scope === st.scope && st.derived.rule === st.rule) return st.derived;
    var D = st.D, A = D.attempts.slice().sort(function (a, b) { return a[0] - b[0]; }), inOnly = st.scope === 'class';
    var reveals = {}; D.events.forEach(function (e) { if (e[4] === 'reveal') { var k = e[1] + '|' + e[2] + '|' + e[3]; (reveals[k] = reveals[k] || []).push(e[0]); } });
    var items = {}; // name|lesson|item -> record
    A.forEach(function (a) {
      var name = a[1], lesson = a[2], id = a[3], verdict = a[9], prac = a[7];
      if (prac) return;
      var k = name + '|' + lesson + '|' + id, r = items[k] || (items[k] = { name: name, lesson: lesson, id: id, outcome: a[4], level: a[5], extra: a[6], errors: 0, forms: 0, codes: [], answers: [], correctAt: 0, correctIn: 0, first: 0, attempts: 0 });
      if (r.correctAt) return;
      if (verdict === 'form') { r.forms++; return; }
      r.attempts++; if (!r.firstAt) r.firstAt = a[0];
      if (verdict === 'wrong' || verdict === 'step') { r.errors++; if (a[10]) r.codes.push(a[10]); if (verdict === 'wrong' && a[12]) r.answers.push(a[12]); return; }
      if (verdict === 'correct') { r.correctAt = a[0]; r.correctIn = a[14]; r.answer = a[12]; var rv = (reveals[k] || []).filter(function (t) { return t <= a[0]; }).length; r.credit = rv ? 'shown' : r.errors ? 'hint' : 'first'; }
    });
    var allow = st.rule === 'first' ? { first: 1 } : st.rule === 'any' ? { first: 1, hint: 1, shown: 1 } : { first: 1, hint: 1 };
    var stu = {};
    D.roster.forEach(function (s) { stu[s.name] = { name: s.name, roster: s, lessons: {}, outcomes: {}, levelAcc: {}, secs: 0, secsIn: 0, answers: 0, right: 0, leaves: 0, leavesIn: 0, reveals: 0 }; });
    function S(n) { return stu[n] || (stu[n] = { name: n, roster: null, lessons: {}, outcomes: {}, levelAcc: {}, secs: 0, secsIn: 0, answers: 0, right: 0, leaves: 0, leavesIn: 0, reveals: 0 }); }
    Object.keys(items).forEach(function (k) {
      var r = items[k], s = S(r.name), counted = r.correctAt && (!inOnly || r.correctIn);
      var ls2 = s.lessons[r.lesson] || (s.lessons[r.lesson] = { done: 0, first: 0, extra: 0, items: {} });
      ls2.items[r.id] = r;
      if (counted) { if (r.extra) ls2.extra++; else { ls2.done++; if (r.credit === 'first') ls2.first++; } }
      var la = s.levelAcc[r.outcome + '|' + r.level] || (s.levelAcc[r.outcome + '|' + r.level] = { tried: 0, first: 0 });
      if (r.attempts && (!inOnly || r.correctIn || !r.correctAt)) { la.tried++; if (counted && r.credit === 'first') la.first++; }
      if (counted && allow[r.credit]) { var cur = s.outcomes[r.outcome]; if (!cur || LV.indexOf(r.level) > LV.indexOf(cur)) s.outcomes[r.outcome] = r.level; }
    });
    D.days.forEach(function (d) { var s = S(d[1]); s.secs += Number(d[3]) || 0; s.secsIn += Number(d[4]) || 0; });
    A.forEach(function (a) { if (a[7]) return; if (inOnly && !a[14]) return; if (a[9] === 'correct' || a[9] === 'wrong') { var s = S(a[1]); s.answers++; if (a[9] === 'correct') s.right++; } });
    D.events.forEach(function (e) { var s = S(e[1]); if (e[4] === 'leave') { s.leaves++; if (e[6]) s.leavesIn++; } if (e[4] === 'reveal') s.reveals++; });
    st.derived = { scope: st.scope, rule: st.rule, items: items, stu: stu };
    return st.derived;
  }
  function students() { var d = derive(); return Object.keys(d.stu).map(function (k) { return d.stu[k]; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
  function builtLessons() { var out = []; HW.CATALOG.forEach(function (u) { u.lessons.forEach(function (c) { if (HW.lessons[c.id]) out.push(HW.lessons[c.id]); }); }); return out; }
  function outcomesBuilt() { var o = []; builtLessons().forEach(function (l) { l.items.forEach(function (it) { if (o.indexOf(it.outcome) < 0) o.push(it.outcome); }); }); return o; }

  /* ---------------- render ---------------- */
  function render() {
    view.innerHTML = '';
    if (!st.D && st.tab !== 'settings') { if (!st.classes.length) st.tab = 'settings'; else return; }
    view.appendChild(tabs());
    var body = el('div', 'tab-body'); view.appendChild(body);
    ({ live: renderLive, progress: renderProgress, outcomes: renderOutcomes, questions: renderQuestions, student: renderStudent, settings: renderSettings }[st.tab] || renderLive)(body);
    HW.texIn && HW.texIn(body);
  }

  /* ---- Live ---- */
  function liveState(rec, now) {
    if (!rec) return { k: 'none', t: 'Not on the site' };
    var age = now - rec.at;
    if (age > 90000) return { k: 'off', t: 'Offline' };
    if (rec.away) return { k: 'away', t: 'Left the page' };
    if (rec.view === 'lesson') return { k: 'work', t: 'Working' };
    return { k: 'idle', t: 'On the lesson list' };
  }
  function renderLive(body) {
    var D = st.D, now = D.liveNow || Date.now(), live = D.live || {}, roster = students();
    var counts = { work: 0, away: 0, idle: 0, off: 0, none: 0 };
    var rows = roster.map(function (s) { var rec = live[s.name], ls2 = liveState(rec, now); counts[ls2.k]++; return { s: s, rec: rec, ls: ls2 }; });
    var order = { work: 0, away: 1, idle: 2, off: 3, none: 4 };
    rows.sort(function (a, b) { return order[a.ls.k] - order[b.ls.k] || a.s.name.localeCompare(b.s.name); });
    var head = el('div', 'live-head');
    head.innerHTML = '<div class="live-chips"><span class="lchip work"><b>' + counts.work + '</b> working</span><span class="lchip away"><b>' + counts.away + '</b> left the page</span><span class="lchip idle"><b>' + counts.idle + '</b> on the lesson list</span><span class="lchip off"><b>' + (counts.off + counts.none) + '</b> not on the site</span></div>' +
      '<div class="small muted">' + classTimeLine() + ' · refreshes every 10 s</div>';
    body.appendChild(head);
    var t = el('table', 'tbl live');
    t.innerHTML = '<thead><tr><th>Student</th><th>Status</th><th>Where</th><th>On this for</th><th>Today</th><th>Left the page today</th><th>Last seen</th></tr></thead>';
    var tb = el('tbody'), today = HW.dayKey ? HW.dayKey(Date.now()) : new Date().toISOString().slice(0, 10);
    var todayStats = {}; st.D.days.forEach(function (d) { if (d[0] === localDay(Date.now())) { var x = todayStats[d[1]] || (todayStats[d[1]] = { secs: 0, secsIn: 0, answers: 0, right: 0 }); x.secs += Number(d[3]) || 0; x.secsIn += Number(d[4]) || 0; x.answers += Number(d[5]) || 0; x.right += Number(d[6]) || 0; } });
    var leavesToday = {}; st.D.events.forEach(function (e) { if (e[4] === 'leave' && localDay(e[0]) === localDay(Date.now())) leavesToday[e[1]] = (leavesToday[e[1]] || 0) + 1; });
    rows.forEach(function (x) {
      var rec = x.rec, where = '—';
      if (rec && rec.view === 'lesson') { var l = HW.lessons[rec.lesson]; where = (l ? 'L' + l.num + ' ' : '') + '<b>' + esc(rec.label || rec.item || '') + '</b>'; }
      else if (rec && rec.view === 'home') where = '<span class="muted">Lesson list</span>';
      var ts = todayStats[x.s.name];
      var tr = el('tr', 'lv-' + x.ls.k);
      tr.innerHTML = '<td><a href="#" class="slink">' + esc(x.s.name) + '</a></td><td><span class="dot ' + x.ls.k + '"></span>' + x.ls.t + (rec && x.ls.k !== 'off' && x.ls.k !== 'none' && rec.inClass === false ? ' <span class="tag">outside class time</span>' : '') + '</td>' +
        '<td>' + where + '</td><td>' + (rec && (x.ls.k === 'work' || x.ls.k === 'away') ? '<span data-since="' + rec.since + '">' + since(rec.since) + '</span>' : '—') + '</td>' +
        '<td>' + (ts ? dur(ts.secs) + ' · ' + ts.right + '/' + ts.answers + ' right' : '—') + '</td><td>' + (leavesToday[x.s.name] ? '<span class="warnnum">' + leavesToday[x.s.name] + '</span>' : '0') + '</td><td>' + (rec ? ago(rec.at) : x.s.roster && x.s.roster.lastSeen ? ago(x.s.roster.lastSeen) : 'never') + '</td>';
      tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(x.s.name); });
      tb.appendChild(tr);
    });
    t.appendChild(tb); body.appendChild(wrapTbl(t));
    body.appendChild(el('p', 'small muted', '“Left the page” means the student switched tabs or windows while a question was open — the question got new numbers. Times count only while the page is open, focused and in use.'));
  }
  function localDay(ms) { var d = new Date(ms); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function classTimeLine() { var c = st.D['class']; return c.block ? 'Class time: block ' + c.block + ' on the bell schedule' : 'No class time set (everything counts as in class) — set a block in Settings'; }
  function wrapTbl(t) { var w = el('div', 'tbl-wrap'); w.appendChild(t); return w; }

  /* ---- Progress ---- */
  function miniBar(l, rec) {
    var req = l.required.length, ex = l.extras.length, done = rec ? rec.done : 0, first = rec ? rec.first : 0, extra = rec ? rec.extra : 0;
    return '<div class="pbar sm"><div class="pb-track" style="flex-grow:' + req + '"><span class="pb-fill first" style="width:' + (100 * first / req) + '%"></span><span class="pb-fill help" style="width:' + (100 * (done - first) / req) + '%"></span></div>' +
      (ex ? '<div class="pb-track pb-extra" style="flex-grow:' + ex + '"><span class="pb-fill extra" style="width:' + (100 * extra / ex) + '%"></span></div>' : '') + '</div>';
  }
  function renderProgress(body) {
    var ls2 = builtLessons(), ss = students();
    body.appendChild(el('div', 'legend', '<span><i class="lg first"></i>Right first try</span><span><i class="lg help"></i>Right after a hint or reveal</span><span><i class="lg extra"></i>Extra practice</span><span class="muted">' + (st.scope === 'class' ? 'Counting work done in class only.' : 'Counting all work, in and out of class.') + '</span>'));
    var t = el('table', 'tbl prog');
    var h = '<thead><tr><th class="sortable" data-s="name">Student</th>';
    ls2.forEach(function (l) { h += '<th class="sortable" data-s="' + l.id + '">Lesson ' + esc(l.num) + '<div class="th-sub">' + l.required.length + ' req · ' + l.extras.length + ' extra</div></th>'; });
    h += '<th class="sortable" data-s="time">Time worked<div class="th-sub">in class / all</div></th><th class="sortable" data-s="acc">Right</th><th class="sortable" data-s="leaves">Left page</th><th>Last seen</th></tr></thead>';
    t.innerHTML = h;
    var key = st.sortP;
    ss.sort(function (a, b) {
      if (key === 'name') return a.name.localeCompare(b.name);
      if (key === 'time') return b.secsIn - a.secsIn;
      if (key === 'acc') return (b.answers ? b.right / b.answers : -1) - (a.answers ? a.right / a.answers : -1);
      if (key === 'leaves') return b.leaves - a.leaves;
      var la = a.lessons[key], lb = b.lessons[key]; return ((lb ? lb.done * 1000 + lb.extra : -1) - (la ? la.done * 1000 + la.extra : -1));
    });
    var tb = el('tbody');
    ss.forEach(function (s) {
      var tr = el('tr'), html = '<td><a href="#" class="slink">' + esc(s.name) + '</a>' + (s.roster && !s.roster.pin ? ' <span class="tag">not signed in yet</span>' : '') + '</td>';
      ls2.forEach(function (l) { var r = s.lessons[l.id]; html += '<td class="pcell">' + miniBar(l, r) + '<div class="pnum"><b>' + (r ? r.done : 0) + '</b>/' + l.required.length + (r && r.extra ? ' · +' + r.extra : '') + '</div></td>'; });
      html += '<td>' + dur(s.secsIn) + ' / ' + dur(s.secs) + '</td><td>' + (s.answers ? pct(s.right, s.answers) + ' <span class="muted">(' + s.answers + ')</span>' : '—') + '</td><td>' + (s.leaves ? '<span class="warnnum">' + s.leaves + '</span>' : '0') + '</td><td>' + (s.roster && s.roster.lastSeen ? ago(s.roster.lastSeen) : 'never') + '</td>';
      tr.innerHTML = html; tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(s.name); });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    t.querySelectorAll('th.sortable').forEach(function (th) { if (th.dataset.s === key) th.classList.add('sorted'); th.addEventListener('click', function () { st.sortP = th.dataset.s; render(); }); });
    body.appendChild(wrapTbl(t));
    var csv = el('button', 'btn btn-small', 'Download progress (CSV)'); csv.type = 'button';
    csv.addEventListener('click', function () {
      var rows = [['Student'].concat(ls2.map(function (l) { return 'Lesson ' + l.num + ' required done'; }), ls2.map(function (l) { return 'Lesson ' + l.num + ' extra done'; }), ['Minutes in class', 'Minutes all', 'Answers', 'Right', 'Left page'])];
      students().forEach(function (s) { rows.push([s.name].concat(ls2.map(function (l) { return s.lessons[l.id] ? s.lessons[l.id].done : 0; }), ls2.map(function (l) { return s.lessons[l.id] ? s.lessons[l.id].extra : 0; }), [Math.round(s.secsIn / 60), Math.round(s.secs / 60), s.answers, s.right, s.leaves])); });
      download(st.klass + '-progress.csv', rows);
    });
    body.appendChild(csv);
  }

  /* ---- Outcomes ---- */
  function renderOutcomes(body) {
    var outs = outcomesBuilt(), ss = students();
    var bar = el('div', 'opt-row');
    bar.innerHTML = '<span class="small muted">A level counts when the student answered a question at that level correctly</span>';
    var seg = el('div', 'seg'); [['first', 'on the first try'], ['hint', 'first try or after a hint'], ['any', 'even after the answer was shown']].forEach(function (r) { var b = el('button', st.rule === r[0] ? 'on' : '', r[1]); b.type = 'button'; b.addEventListener('click', function () { st.rule = r[0]; ls('hw:trule', r[0]); st.derived = null; render(); }); seg.appendChild(b); });
    bar.appendChild(seg); body.appendChild(bar);
    outs.forEach(function (o) {
      var sec = el('section', 'panel');
      sec.appendChild(el('h3', '', esc(o) + ' <span class="muted small">' + esc(HW.OUTCOMES[o] || '') + '</span>'));
      // distribution
      var dist = {}; LV.forEach(function (l) { dist[l] = []; }); dist.NONE = [];
      ss.forEach(function (s) { var lv = s.outcomes[o]; (dist[lv] || dist.NONE).push(s.name); });
      var total = ss.length || 1, stack = el('div', 'stack');
      ['NONE'].concat(LV).forEach(function (l) {
        if (!dist[l].length) return;
        var seg2 = el('button', 'stk lvlbg-' + l, '<b>' + dist[l].length + '</b> ' + (l === 'NONE' ? 'none yet' : LVN[l])); seg2.type = 'button'; seg2.style.flexGrow = dist[l].length;
        seg2.title = dist[l].join(', ');
        seg2.addEventListener('click', function () { var g = sec.querySelector('.group'); g.innerHTML = '<b>' + (l === 'NONE' ? 'No level yet' : LVN[l]) + ':</b> ' + dist[l].map(esc).join(', '); });
        stack.appendChild(seg2);
      });
      sec.appendChild(stack);
      sec.appendChild(el('div', 'group small', '<span class="muted">Click a band to list those students (a ready-made reteach group).</span>'));
      // grid: student x level accuracy
      var t = el('table', 'tbl ogrid');
      var h = '<thead><tr><th>Student</th><th>Level reached</th>'; LV.forEach(function (l) { h += '<th class="c">' + l + '<div class="th-sub">first try</div></th>'; }); t.innerHTML = h + '</tr></thead>';
      var tb = el('tbody');
      ss.forEach(function (s) {
        var lv = s.outcomes[o], row = '<td><a href="#" class="slink">' + esc(s.name) + '</a></td><td>' + (lv ? '<span class="lvl lvl-' + lv + '">' + LVN[lv] + '</span>' : '<span class="muted">—</span>') + '</td>';
        LV.forEach(function (l) { var a = s.levelAcc[o + '|' + l]; row += '<td class="c">' + (a && a.tried ? '<span class="acc" style="--a:' + (a.first / a.tried) + '">' + a.first + '/' + a.tried + '</span>' : '<span class="muted">·</span>') + '</td>'; });
        var tr = el('tr'); tr.innerHTML = row; tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(s.name); }); tb.appendChild(tr);
      });
      t.appendChild(tb); sec.appendChild(wrapTbl(t));
      var csv = el('button', 'btn btn-small', 'Download ' + o + ' levels (CSV)'); csv.type = 'button';
      csv.addEventListener('click', function () { var rows = [['Student', o + ' level', 'Indicator']]; ss.forEach(function (s) { var lv = s.outcomes[o]; rows.push([s.name, lv ? LVN[lv] : '', lv || '']); }); download(st.klass + '-' + o + '-levels.csv', rows); });
      sec.appendChild(csv);
      body.appendChild(sec);
    });
    if (!outs.length) body.appendChild(el('p', 'muted', 'No lessons yet.'));
  }

  /* ---- Questions (item analysis) ---- */
  var CODE = {
    nonfactor: 'Listed a number that isn’t a factor', 'missing-1n': 'Left out 1 or the number itself', 'missing-partner': 'Missed the partner in a factor pair', missing: 'Some missing',
    'no-1n': 'Didn’t count 1 and the number itself', 'no-1orn': 'Left out 1 or the number itself', pairs: 'Counted factor pairs instead of factors', 'square-twice': 'Counted the square root twice',
    'said-prime': 'Called a composite number prime', 'said-composite': 'Called a prime number composite', 'proof-wrong': 'Factor pair didn’t multiply to the number',
    'picked-composite': 'Chose a composite as prime', 'picked-prime': 'Chose a prime as composite', missed: 'Missed some', one: 'Counted 1 as a prime factor', repeat: 'Listed a prime twice',
    composite: 'Kept a non-prime factor', value: 'Wrong value', lead: 'Started with the wrong number', extra: 'Product too big', self: 'Wrote the number itself', nothing: 'Blank',
    'ladder-one': 'Divided by 1 on the ladder', 'ladder-notprime': 'Divided by a non-prime on the ladder', 'ladder-nodivide': 'Divisor doesn’t divide evenly', 'ladder-notsmallest': 'Skipped a smaller prime on the ladder', 'ladder-quotient': 'Division slip on the ladder', 'ladder-shown': 'Asked to be shown a ladder step',
    'tree-splitprime': 'Tried to split a prime', 'tree-one': 'Used a factor pair with 1', 'tree-product': 'Factor pair didn’t multiply to the number', 'tree-circlecomposite': 'Circled a composite as prime', 'tree-shown': 'Asked to be shown a tree step',
    'not-consecutive': 'Pair not 2 apart', 'not-prime': 'Pair included a non-prime', range: 'Pair outside the range', plus1: 'Included 1 in the sum', 'no-r': 'Forgot to add the exponent', power: 'Added q^r instead of r', off: 'Miscounted the repeated prime',
    'triple-579': 'Used 5, 7, 9 (9 isn’t prime)', 'triple-135': 'Used 1, 3, 5 (1 isn’t prime)', 'triple-other': 'Used a triplet with a composite', 'not-smallest': 'Right count, not the smallest number', 'no-plus1': 'Forgot +1 on the exponents', added: 'Added instead of multiplied',
    seven: 'Left out the 7', not3: 'Number without exactly 3 factors', 'even-count': 'Number with an even factor count', 'not-largest': 'A prime factor, not the largest'
  };
  function codeLabel(c) { if (/^mc-/.test(c)) return 'Chose a wrong option'; return CODE[c] || c; }
  function renderQuestions(body) {
    var ls2 = builtLessons(), lesson = HW.lessons[st.lesson] || ls2[0]; if (!lesson) return;
    var bar = el('div', 'opt-row');
    var sel = el('select', 'class-pick'); ls2.forEach(function (l) { var o = el('option', '', 'Lesson ' + l.num + ': ' + esc(l.title)); o.value = l.id; if (l.id === lesson.id) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () { st.lesson = sel.value; render(); }); bar.appendChild(sel);
    bar.appendChild(el('span', 'small muted', 'First try = right with no wrong answers or step mistakes. Click a row for the common errors and wrong answers.'));
    body.appendChild(bar);
    var d = derive(), recs = {};
    Object.keys(d.items).forEach(function (k) { var r = d.items[k]; if (r.lesson !== lesson.id) return; if (st.scope === 'class' && r.correctAt && !r.correctIn) return; (recs[r.id] = recs[r.id] || []).push(r); });
    var secs = {}; st.D.progress.forEach(function (p) { if (p.lesson !== lesson.id) return; Object.keys(p.items || {}).forEach(function (id) { var x = p.items[id]; if (x[0] === 'done') { (secs[id] = secs[id] || []).push(x[3]); } }); });
    var t = el('table', 'tbl items');
    t.innerHTML = '<thead><tr><th>Question</th><th>Level</th><th>Tried</th><th>Done</th><th>First try</th><th>Needed a hint</th><th>Answer shown</th><th>Median time</th><th>Most common error</th></tr></thead>';
    var tb = el('tbody');
    lesson.items.forEach(function (it) {
      var rs = recs[it.id] || [], tried = rs.length, done = rs.filter(function (r) { return r.correctAt; }), first = done.filter(function (r) { return r.credit === 'first'; }).length, hint = done.filter(function (r) { return r.credit === 'hint'; }).length, shown = rs.filter(function (r) { return r.credit === 'shown' || (!r.correctAt && r.errors >= 3); }).length;
      var codes = {}; rs.forEach(function (r) { r.codes.forEach(function (c) { codes[c] = (codes[c] || 0) + 1; }); });
      var top3 = Object.keys(codes).sort(function (a, b) { return codes[b] - codes[a]; });
      var tm = (secs[it.id] || []).sort(function (a, b) { return a - b; }), med = tm.length ? tm[Math.floor(tm.length / 2)] : 0;
      var fr = done.length ? first / done.length : null;
      var tr = el('tr', 'irow' + (it.extra ? ' extra' : ''));
      tr.innerHTML = '<td><b>' + esc(it.label) + '</b></td><td><span class="lvl lvl-' + it.level + '">' + it.level + '</span></td><td>' + tried + '</td><td>' + done.length + '</td>' +
        '<td>' + (fr == null ? '—' : '<span class="acc" style="--a:' + fr + '">' + pct(first, done.length) + '</span>') + '</td><td>' + (done.length ? pct(hint, done.length) : '—') + '</td><td>' + (shown ? '<span class="warnnum">' + shown + '</span>' : '0') + '</td><td>' + (med ? dur(med) : '—') + '</td>' +
        '<td>' + (top3.length ? esc(codeLabel(top3[0])) + ' <span class="muted">×' + codes[top3[0]] + '</span>' : '<span class="muted">—</span>') + '</td>';
      tr.addEventListener('click', function () {
        var nx = tr.nextSibling; if (nx && nx.classList && nx.classList.contains('detail')) { nx.remove(); return; }
        var dr = el('tr', 'detail'), td = el('td'); td.colSpan = 9;
        var answers = {}; rs.forEach(function (r) { r.answers.forEach(function (a) { answers[a] = (answers[a] || 0) + 1; }); });
        var topA = Object.keys(answers).sort(function (a, b) { return answers[b] - answers[a]; }).slice(0, 8);
        td.innerHTML = '<div class="detail-grid"><div><div class="dlabel">Errors (hint triggered)</div>' + (top3.length ? '<ul>' + top3.slice(0, 8).map(function (c) { return '<li>' + esc(codeLabel(c)) + ' <span class="muted">×' + codes[c] + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">None yet.</p>') + '</div>' +
          '<div><div class="dlabel">Wrong answers typed</div>' + (topA.length ? '<ul>' + topA.map(function (a) { return '<li><code>' + esc(a) + '</code> <span class="muted">×' + answers[a] + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">None yet.</p>') + '</div>' +
          '<div><div class="dlabel">Still working / stuck</div>' + (rs.filter(function (r) { return !r.correctAt; }).map(function (r) { return esc(short(r.name)) + ' <span class="muted">(' + r.errors + ' wrong)</span>'; }).join(', ') || '<span class="muted">Nobody.</span>') + '</div></div>';
        dr.appendChild(td); tr.parentNode.insertBefore(dr, tr.nextSibling);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb); body.appendChild(wrapTbl(t));
  }

  /* ---- Student ---- */
  function openStudent(name) { st.student = name; st.tab = 'student'; ls('hw:ttab', 'student'); st.sdata = null; render(); }
  function renderStudent(body) {
    var ss = students();
    var bar = el('div', 'opt-row'), sel = el('select', 'class-pick');
    sel.appendChild(el('option', '', 'Choose a student…'));
    ss.forEach(function (s) { var o = el('option', '', esc(s.name)); o.value = s.name; if (s.name === st.student) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () { openStudent(sel.value); }); bar.appendChild(sel); body.appendChild(bar);
    if (!st.student) { body.appendChild(el('p', 'muted', 'Pick a student (or click a name on any tab).')); return; }
    var s = derive().stu[st.student]; if (!s) return;
    var tiles = el('div', 'tiles');
    function tile(k, v, sub) { tiles.appendChild(el('div', 'tile', '<div class="tk">' + k + '</div><div class="tv">' + v + '</div>' + (sub ? '<div class="ts">' + sub + '</div>' : ''))); }
    var lessonsList = builtLessons();
    var reqTot = 0, reqDone = 0; lessonsList.forEach(function (l) { reqTot += l.required.length; reqDone += s.lessons[l.id] ? s.lessons[l.id].done : 0; });
    tile('Required done', reqDone + ' / ' + reqTot, st.scope === 'class' ? 'in class' : 'all work');
    tile('Right answers', s.answers ? pct(s.right, s.answers) : '—', s.answers + ' answers checked');
    tile('Time worked', dur(s.secsIn), 'in class · ' + dur(s.secs) + ' in all');
    tile('Left the page', s.leaves, s.leavesIn + ' during class');
    tile('Answers shown', s.reveals, 'after 3 wrong tries');
    tile('Last seen', s.roster && s.roster.lastSeen ? ago(s.roster.lastSeen) : 'never', s.roster ? (s.roster.devices + ' device' + (s.roster.devices === 1 ? '' : 's')) : '');
    body.appendChild(tiles);
    // outcomes
    var oc = el('div', 'panel'); oc.appendChild(el('h3', '', 'Outcome levels'));
    var orow = el('div', 'ochips');
    outcomesBuilt().forEach(function (o) { var lv = s.outcomes[o]; orow.appendChild(el('div', 'ochip', '<b>' + o + '</b> ' + (lv ? '<span class="lvl lvl-' + lv + '">' + LVN[lv] + '</span>' : '<span class="muted">none yet</span>'))); });
    oc.appendChild(orow); body.appendChild(oc);
    // per lesson items
    lessonsList.forEach(function (l) {
      var p = el('div', 'panel'); var r = s.lessons[l.id];
      p.appendChild(el('h3', '', 'Lesson ' + esc(l.num) + ': ' + esc(l.title)));
      p.appendChild(el('div', '', miniBar(l, r)));
      var grid = el('div', 'item-grid');
      l.items.forEach(function (it) {
        var rec = r && r.items[it.id], cls = !rec ? 'new' : rec.correctAt ? 'c-' + rec.credit : rec.errors >= 3 ? 'stuck' : 'open';
        var b = el('div', 'ig ' + cls + (it.extra ? ' ex' : ''), esc(it.label.replace('Extra ', 'E')));
        b.title = it.label + ' · ' + it.level + ' · ' + (!rec ? 'not started' : rec.correctAt ? ({ first: 'right first try', hint: 'right after ' + rec.errors + ' mistake(s)', shown: 'right after the answer was shown' }[rec.credit]) : rec.errors + ' wrong so far');
        grid.appendChild(b);
      });
      p.appendChild(grid); body.appendChild(p);
    });
    // time per day
    var days = {}; st.D.days.forEach(function (d) { if (d[1] !== s.name) return; var x = days[d[0]] || (days[d[0]] = [0, 0]); x[0] += Number(d[3]) || 0; x[1] += Number(d[4]) || 0; });
    var dk = Object.keys(days).sort().slice(-21);
    if (dk.length) {
      var tp = el('div', 'panel'); tp.appendChild(el('h3', '', 'Time worked by day <span class="small muted">(last 3 weeks · dark = in class)</span>'));
      var mx = Math.max.apply(null, dk.map(function (k) { return days[k][0]; })) || 1, ch = el('div', 'daychart');
      dk.forEach(function (k) { var v = days[k]; ch.appendChild(el('div', 'dc', '<div class="dcb" style="height:' + (100 * v[0] / mx) + '%"><div class="dci" style="height:' + (v[0] ? 100 * v[1] / v[0] : 0) + '%"></div></div><div class="dcl">' + k.slice(5) + '</div><div class="dcv">' + dur(v[0]) + '</div>')); });
      tp.appendChild(ch); body.appendChild(tp);
    }
    // attempts (loaded on demand)
    var ap = el('div', 'panel'); ap.appendChild(el('h3', '', 'Every answer'));
    var list = el('div', 'alist', '<div class="loading small">Loading…</div>'); ap.appendChild(list); body.appendChild(ap);
    var go = function (d) {
      if (!d || !d.ok) { list.innerHTML = '<p class="muted">Couldn’t load.</p>'; return; }
      var rows = d.attempts.slice().sort(function (a, b) { return b[0] - a[0]; }), evs = d.events.slice().sort(function (a, b) { return b[0] - a[0]; });
      var merged = rows.map(function (a) { return { t: a[0], a: a }; }).concat(evs.filter(function (e) { return e[3] !== 'open'; }).map(function (e) { return { t: e[0], e: e }; })).sort(function (x, y) { return y.t - x.t; });
      var showN = 60;
      function draw() {
        list.innerHTML = '';
        var t = el('table', 'tbl att'); t.innerHTML = '<thead><tr><th>When</th><th>Question</th><th>Prompt</th><th>Answer</th><th>Result</th><th></th></tr></thead>';
        var tb = el('tbody');
        merged.slice(0, showN).forEach(function (m) {
          var tr = el('tr');
          if (m.e) { var e = m.e; tr.className = 'ev'; tr.innerHTML = '<td>' + when(e[0]) + '</td><td>' + esc(lbl(e[1], e[2])) + '</td><td colspan="3" class="muted">' + ({ leave: 'Left the page' + (e[4] ? ' for ' + e[4] + ' s' : '') + ' — new numbers', reveal: 'Answer shown after 3 tries', newversion: 'Started a new version', away: 'Switched away briefly (' + (e[4] || 0) + ' s)' }[e[3]] || esc(e[3])) + '</td><td>' + (e[5] ? '' : '<span class="tag">outside class</span>') + '</td>'; }
          else { var a = m.a, v = a[8]; tr.className = 'v-' + v; tr.innerHTML = '<td>' + when(a[0]) + '</td><td>' + esc(a[3] || a[2]) + (a[6] ? ' <span class="tag">practice</span>' : '') + '</td><td class="pr">' + esc(a[12]) + '</td><td><code>' + esc(a[11]) + '</code></td><td>' + verdictLabel(v, a[9]) + '</td><td>' + (a[13] ? '' : '<span class="tag">outside class</span>') + '</td>'; }
          tb.appendChild(tr);
        });
        t.appendChild(tb); list.appendChild(wrapTbl(t));
        if (merged.length > showN) { var more = el('button', 'btn btn-small', 'Show more'); more.type = 'button'; more.addEventListener('click', function () { showN += 100; draw(); }); list.appendChild(more); }
        if (!merged.length) list.innerHTML = '<p class="muted">No answers yet.</p>';
      }
      draw();
    };
    if (st.sdata && st.sdata.name === s.name) go(st.sdata.d);
    else api('student', { 'class': st.klass, name: s.name }).then(function (d) { st.sdata = { name: s.name, d: d }; if (st.student === s.name && st.tab === 'student') go(d); }).catch(function () { list.innerHTML = '<p class="muted">Couldn’t load.</p>'; });
  }
  function lbl(lesson, item) { var l = HW.lessons[lesson]; var it = l && l.byId[item]; return (l ? 'L' + l.num + ' ' : '') + (it ? it.label : item); }
  function when(ms) { var d = new Date(ms); return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function verdictLabel(v, code) { if (v === 'correct') return '<span class="vd ok">Right</span>'; if (v === 'wrong') return '<span class="vd bad">Wrong</span>' + (code ? ' <span class="muted small">' + esc(codeLabel(code)) + '</span>' : ''); if (v === 'step') return '<span class="vd step">Step mistake</span> <span class="muted small">' + esc(codeLabel(code)) + '</span>'; if (v === 'form') return '<span class="vd form">Format nudge</span>'; return esc(v); }

  /* ---- Settings ---- */
  function renderSettings(body) {
    var c = st.D && st.D['class'];
    if (c) {
      var link = siteUrl() + '?class=' + encodeURIComponent(c.code);
      var p1 = el('div', 'panel'); p1.appendChild(el('h3', '', 'Class link for ' + esc(c.label)));
      p1.innerHTML += '<p class="small muted">Students open this link (or scan the code), pick their name, and make a 4-digit PIN the first time.</p>';
      var row = el('div', 'linkrow'); var inp = el('input', 'field'); inp.readOnly = true; inp.value = link; row.appendChild(inp);
      var cp = el('button', 'btn', 'Copy'); cp.type = 'button'; cp.addEventListener('click', function () { inp.select(); try { navigator.clipboard.writeText(link); cp.textContent = 'Copied'; } catch (e) { document.execCommand('copy'); } }); row.appendChild(cp);
      var qb = el('button', 'btn', 'Show QR code'); qb.type = 'button'; row.appendChild(qb); p1.appendChild(row);
      var qr = el('div', 'qr hidden'); p1.appendChild(qr);
      qb.addEventListener('click', function () { qr.classList.toggle('hidden'); qr.innerHTML = ''; if (!qr.classList.contains('hidden')) { if (root.QRCode) { new root.QRCode(qr, { text: link, width: 320, height: 320, correctLevel: root.QRCode.CorrectLevel.M }); qr.appendChild(el('div', 'qr-cap', esc(c.label) + ' · class code <b>' + esc(c.code) + '</b>')); } else qr.textContent = 'QR library didn’t load.'; } });
      body.appendChild(p1);

      var p2 = el('div', 'panel'); p2.appendChild(el('h3', '', 'Class time'));
      p2.appendChild(el('p', 'small muted', 'Work counts as “in class” only during this block on the bell schedule (Mon/Wed Day 1, Tue/Thu Day 2, Friday short periods). With no block, everything counts as in class.'));
      var bsel = el('select', 'class-pick'); ['', 'A', 'B', 'C', 'D'].forEach(function (b) { var o = el('option', '', b ? 'Block ' + b : 'No block (everything counts)'); o.value = b; if ((c.block || '') === b) o.selected = true; bsel.appendChild(o); });
      bsel.addEventListener('change', function () { api('setblock', { 'class': c.code, block: bsel.value }).then(function () { flash(p2, 'Saved. New work is tagged with this block from now on.'); loadClasses(); }); });
      p2.appendChild(bsel);
      p2.appendChild(el('div', 'lbl', 'No-school days (in-class time doesn’t apply)'));
      var ns = el('textarea', 'field'); ns.rows = 2; ns.placeholder = '2026-10-12, 2026-11-11'; ns.value = (st.D.noSchool || []).join(', '); p2.appendChild(ns);
      var nsb = el('button', 'btn btn-small', 'Save no-school days'); nsb.type = 'button'; nsb.addEventListener('click', function () { api('setnoschool', { dates: ns.value }).then(function (d) { if (d.ok) { st.D.noSchool = d.noSchool; flash(p2, 'Saved ' + d.noSchool.length + ' dates.'); } }); }); p2.appendChild(nsb);
      body.appendChild(p2);

      var p3 = el('div', 'panel'); p3.appendChild(el('h3', '', 'Students in ' + esc(c.label)));
      var t = el('table', 'tbl'); t.innerHTML = '<thead><tr><th>Name</th><th>PIN</th><th>Devices</th><th>Last seen</th><th></th></tr></thead>';
      var tb = el('tbody');
      st.D.roster.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (s) {
        var tr = el('tr'); tr.innerHTML = '<td>' + esc(s.name) + '</td><td>' + (s.pin ? 'set' : '<span class="muted">not yet</span>') + '</td><td>' + s.devices + '</td><td>' + (s.lastSeen ? ago(s.lastSeen) : 'never') + '</td><td class="acts"></td>';
        var acts = tr.querySelector('.acts');
        if (s.pin) { var rp = el('button', 'btn btn-small', 'Reset PIN'); rp.type = 'button'; rp.addEventListener('click', function () { if (!confirm('Reset ' + s.name + '’s PIN? They’ll make a new one next time they sign in (their work is kept).')) return; api('resetpin', { 'class': c.code, name: s.name }).then(function () { loadDash(); }); }); acts.appendChild(rp); }
        var rm = el('button', 'btn btn-small btn-ghost', 'Remove'); rm.type = 'button'; rm.addEventListener('click', function () { if (!confirm('Remove ' + s.name + ' from the class list? Their answers stay in the spreadsheet.')) return; api('removestudent', { 'class': c.code, name: s.name }).then(function () { loadDash(); }); }); acts.appendChild(rm);
        tb.appendChild(tr);
      });
      t.appendChild(tb); p3.appendChild(wrapTbl(t));
      p3.appendChild(el('div', 'lbl', 'Add students (one name per line — first and last name)'));
      var add = el('textarea', 'field'); add.rows = 4; p3.appendChild(add);
      var ab = el('button', 'btn btn-small', 'Add to the class'); ab.type = 'button'; ab.addEventListener('click', function () { if (!add.value.trim()) return; api('setroster', { 'class': c.code, names: add.value, mode: 'add' }).then(function (d) { flash(p3, 'Added ' + d.added + '.'); loadDash(); loadClasses(); }); }); p3.appendChild(ab);
      body.appendChild(p3);
    }
    var p4 = el('div', 'panel'); p4.appendChild(el('h3', '', 'New class'));
    p4.appendChild(el('p', 'small muted', 'A class code is what students type (or what the class link carries). Use something short like <code>10c-b</code>. Paste the class list from PowerSchool — one name per line.'));
    var g = el('div', 'grid2');
    var code = el('input', 'field'); code.placeholder = 'Class code, e.g. 10c-b'; var label = el('input', 'field'); label.placeholder = 'Name shown, e.g. Math 10C · Block B';
    g.appendChild(code); g.appendChild(label); p4.appendChild(g);
    var names = el('textarea', 'field'); names.rows = 8; names.placeholder = 'Jordan Smith\nPriya Patel\n…'; p4.appendChild(names);
    var mk = el('button', 'btn btn-primary', 'Create class'); mk.type = 'button';
    mk.addEventListener('click', function () { if (!code.value.trim()) { code.focus(); return; } api('setroster', { 'class': code.value.trim(), label: label.value.trim() || code.value.trim(), names: names.value, mode: 'add' }).then(function (d) { if (!d.ok) { flash(p4, d.error); return; } st.klass = d['class'].code; ls('hw:tclass', st.klass); loadClasses(); }); });
    p4.appendChild(mk); body.appendChild(p4);
    if (c) {
      var p5 = el('div', 'panel danger'); p5.appendChild(el('h3', '', 'Delete this class'));
      p5.appendChild(el('p', 'small muted', 'Removes the class code and its class list. Answers already in the spreadsheet stay there.'));
      var del = el('button', 'btn btn-small', 'Delete ' + esc(c.label)); del.type = 'button'; del.addEventListener('click', function () { if (prompt('Type the class code (' + c.code + ') to delete it.') !== c.code) return; api('delclass', { 'class': c.code }).then(function () { st.klass = ''; st.D = null; loadClasses(); }); });
      p5.appendChild(del); body.appendChild(p5);
    }
    var p6 = el('div', 'panel'); p6.appendChild(el('h3', '', 'This device'));
    var fk = el('button', 'btn btn-small btn-ghost', 'Forget the teacher key on this device'); fk.type = 'button'; fk.addEventListener('click', function () { ls('hw:tkey', null); st.key = ''; keyScreen(); }); p6.appendChild(fk); body.appendChild(p6);
  }
  function siteUrl() { var u = location.href.split('#')[0].split('?')[0]; return u.replace(/teacher\/?(index\.html)?$/, ''); }
  function flash(node, msg) { var f = el('div', 'flash', esc(msg)); node.appendChild(f); setTimeout(function () { f.remove(); }, 3500); }
  function download(name, rows) {
    var csv = rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 100);
  }
  HW.Dash = { state: st, render: render };
  boot();
})(window);
