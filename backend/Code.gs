/* ============================================================
 * Math 10C Practice — teacher ledger (Google Apps Script backend)
 * ------------------------------------------------------------
 * A standalone Apps Script project deployed as a web app (Execute as: me · Who has access: Anyone).
 * It only stores data: the student site and the teacher dashboard are static pages on GitHub Pages.
 *
 * Run setup() once from the editor: it creates the "Math 10C Practice Ledger" spreadsheet and a teacher key,
 * and logs both (View → Logs / Execution log).
 *
 * Sheets (created automatically):
 *   Roster    one row per student: class, name, PIN (salted hash), first/last seen, devices
 *   Attempts  one row per answer checked (right, wrong, format nudge, ladder/tree step), tagged in class Y/N
 *   Events    question opened, left the page (new numbers), answer revealed, new version, away
 *   Progress  one row per student per lesson: counts + the lesson state (for resuming on another device)
 *   Days      one row per student per lesson per day: seconds worked (all / in class), answers, right, first try
 *
 * Script properties: SHEET_ID, TEACHER_KEY, SECRET (token signing), CLASSES (list of class codes with a roster),
 *   BLOCKS ({ class: 'A'..'D' }), NOSCHOOL (["2026-10-12", …]). Live "who is on right now" lives in the script cache.
 * In class: an answer counts as in class when the student's device stamped it inside the class's block on the bell
 * schedule AND it reached the server inside the block (+5 min for batching). A class with no block = always in class.
 * ============================================================ */

var COLS = {
  Roster: ['class', 'name', 'pin', 'pinSet', 'firstSeen', 'lastSeen', 'devices', 'fails', 'lockUntil'],
  Attempts: ['time', 'class', 'name', 'lesson', 'item', 'label', 'outcome', 'level', 'extra', 'practice', 'ver', 'verdict', 'code', 'tryNo', 'answer', 'prompt', 'inClass', 'device'],
  Events: ['time', 'class', 'name', 'lesson', 'item', 'type', 'secs', 'inClass'],
  Progress: ['key', 'class', 'name', 'lesson', 'reqDone', 'req', 'reqFirst', 'extraDone', 'extra', 'clientSecs', 'updated', 'state'],
  Days: ['key', 'date', 'class', 'name', 'lesson', 'secs', 'secsIn', 'answers', 'right', 'firstTry']
};
var TZ = 'America/Edmonton';

/* ---------------- plumbing ---------------- */
function props_() { return PropertiesService.getScriptProperties(); }
function ss_() {
  var id = props_().getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var ss = SpreadsheetApp.create('Math 10C Practice Ledger'); props_().setProperty('SHEET_ID', ss.getId());
  return ss;
}
var SHEETS_ = {};
function sheet_(name) {
  if (SHEETS_[name]) return SHEETS_[name];
  var ss = ss_(), sh = ss.getSheetByName(name), cols = COLS[name];
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cols.length).setFontWeight('bold'); }
  return (SHEETS_[name] = sh);
}
function rows_(name) { var sh = sheet_(name), n = sh.getLastRow() - 1; return n > 0 ? sh.getRange(2, 1, n, COLS[name].length).getValues() : []; }
function col_(name, c) { return COLS[name].indexOf(c); }
function json_(obj, cb) {
  var txt = JSON.stringify(obj);
  if (cb && /^[A-Za-z_$][\w$]*$/.test(cb)) return ContentService.createTextOutput(cb + '(' + txt + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.JSON);
}
function norm_(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
function clean_(s, max) { s = String(s == null ? '' : s).replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim(); if (s.length > max) s = s.slice(0, max); return /^[=+\-@]/.test(s) ? "'" + s : s; } // a leading = + - @ would make Sheets read a formula
function list_(p) { try { var v = JSON.parse(props_().getProperty(p) || 'null'); return v; } catch (e) { return null; } }
function save_(p, v) { props_().setProperty(p, JSON.stringify(v)); }
function teacherKey_() { return props_().getProperty('TEACHER_KEY') || ''; }
function secret_() { var s = props_().getProperty('SECRET'); if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props_().setProperty('SECRET', s); } return s; }
function hex_(bytes) { return bytes.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''); }
function hashPin_(klass, name, pin) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secret_() + '|' + norm_(klass) + '|' + norm_(name) + '|' + pin)); }
function token_(klass, name, pinHash) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(norm_(klass) + '|' + norm_(name) + '|' + pinHash, secret_())).slice(0, 24); }
function day_(ms) { return Utilities.formatDate(new Date(ms), TZ, 'yyyy-MM-dd'); }

function setup() {
  var ss = ss_(); Object.keys(COLS).forEach(function (n) { sheet_(n); });
  var s1 = ss.getSheetByName('Sheet1'); if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  if (!teacherKey_()) props_().setProperty('TEACHER_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 12));
  secret_();
  Logger.log('Ledger spreadsheet: ' + ss.getUrl());
  Logger.log('Teacher key: ' + teacherKey_());
}

/* ---------------- classes and rosters ---------------- */
function classes_() { var c = list_('CLASSES'); return Array.isArray(c) ? c : []; } // [{code, label}]
function classOf_(code) { var k = norm_(code), c = classes_(); for (var i = 0; i < c.length; i++) if (c[i].code === k) return c[i]; return null; }
function rosterRows_(klass) { var k = norm_(klass); return rows_('Roster').map(function (r, i) { return { row: i + 2, v: r }; }).filter(function (x) { return norm_(x.v[0]) === k; }); }
function findStudent_(klass, name) { var n = norm_(name), rs = rosterRows_(klass); for (var i = 0; i < rs.length; i++) if (norm_(rs[i].v[1]) === n) return rs[i]; return null; }

/* ---------------- reads ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {}, cb = p.callback || '';
  try {
    var a = p.action || 'ping';
    if (a === 'ping') return json_({ ok: true, t: Date.now() }, cb);
    if (a === 'roster') return json_(roster_(p['class']), cb);
    if (a === 'setpin') return json_(setPin_(p['class'], p.name, p.pin, p.device), cb);
    if (a === 'signin') return json_(signIn_(p['class'], p.name, p.pin, p.device), cb);
    if (a === 'progress') return json_(progress_(p['class'], p.name, p.token), cb);
    if (!teacherKey_() || p.key !== teacherKey_()) return json_({ ok: false, error: 'bad key' }, cb);
    if (a === 'classes') return json_(classList_(), cb);
    if (a === 'dash') return json_(dash_(p['class']), cb);
    if (a === 'live') return json_({ ok: true, live: live_(p['class']), now: Date.now() }, cb);
    if (a === 'student') return json_(student_(p['class'], p.name), cb);
    if (a === 'setroster') return json_(setRoster_(p['class'], p.label, p.names, p.mode), cb);
    if (a === 'delclass') return json_(delClass_(p['class']), cb);
    if (a === 'resetpin') return json_(resetPin_(p['class'], p.name), cb);
    if (a === 'rename') return json_(rename_(p['class'], p.name, p.to), cb);
    if (a === 'removestudent') return json_(removeStudent_(p['class'], p.name), cb);
    if (a === 'setblock') return json_(setBlock_(p['class'], p.block), cb);
    if (a === 'setnoschool') return json_(setNoSchool_(p.dates), cb);
    return json_({ ok: false, error: 'unknown action' }, cb);
  } catch (err) { return json_({ ok: false, error: String(err) }, cb); }
}

function roster_(klass) {
  var c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var names = rosterRows_(klass).map(function (x) { return { name: String(x.v[1]), pin: !!x.v[2] }; });
  names.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return { ok: true, code: c.code, label: c.label || c.code, names: names, times: { block: blockFor_(klass), noSchool: noSchool_() } };
}
function locked_(st) { var u = Number(st.v[8] || 0); return u && u > Date.now(); }
function addDevice_(st, device) {
  var d = []; try { d = JSON.parse(st.v[6] || '[]'); } catch (e) {}
  if (device && d.indexOf(String(device).slice(0, 40)) < 0) { d.push(String(device).slice(0, 40)); if (d.length > 12) d = d.slice(-12); }
  return JSON.stringify(d);
}
function setPin_(klass, name, pin, device) {
  if (!/^\d{4}$/.test(String(pin || ''))) return { ok: false, error: 'badpin' };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' };
    if (st.v[2]) return { ok: false, error: 'haspin' };
    var h = hashPin_(klass, st.v[1], pin), now = new Date(), sh = sheet_('Roster');
    sh.getRange(st.row, 3, 1, 7).setValues([[h, now, st.v[4] || now, now, addDevice_(st, device), 0, '']]);
    return { ok: true, token: token_(klass, st.v[1], h), name: st.v[1] };
  } finally { lock.releaseLock(); }
}
function signIn_(klass, name, pin, device) {
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' };
    if (!st.v[2]) return { ok: false, error: 'nopin' };
    if (locked_(st)) return { ok: false, error: 'locked' };
    var sh = sheet_('Roster');
    if (hashPin_(klass, st.v[1], String(pin || '')) !== st.v[2]) {
      var fails = Number(st.v[7] || 0) + 1;
      sh.getRange(st.row, 8, 1, 2).setValues([[fails, fails >= 8 ? Date.now() + 10 * 60000 : '']]);
      return { ok: false, error: fails >= 8 ? 'locked' : 'badpin' };
    }
    sh.getRange(st.row, 6, 1, 4).setValues([[new Date(), addDevice_(st, device), 0, '']]);
    return { ok: true, token: token_(klass, st.v[1], st.v[2]), name: st.v[1] };
  } finally { lock.releaseLock(); }
}
function authed_(klass, name, token) { var st = findStudent_(klass, name); if (!st || !st.v[2]) return null; return token_(klass, st.v[1], st.v[2]) === token ? st : null; }
function progress_(klass, name, token) {
  if (!authed_(klass, name, token)) return { ok: false, error: 'badtoken' };
  var out = {}, k = norm_(klass) + '|' + norm_(name) + '|';
  rows_('Progress').forEach(function (r) { if (String(r[0]).indexOf(k) === 0) { try { out[r[3]] = JSON.parse(r[11] || '{}'); } catch (e) {} } });
  return { ok: true, lessons: out, times: { block: blockFor_(klass), noSchool: noSchool_() } };
}

/* ---------------- writes from the student site ---------------- */
function doPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (!body || !body.name || !body['class']) return json_({ ok: false, error: 'missing' });
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (err) { return json_({ ok: false, error: 'busy' }); }
  try {
    var st = authed_(body['class'], body.name, body.token);
    if (!st) return json_({ ok: false, error: 'badtoken' });
    var klass = String(st.v[0]), name = String(st.v[1]), now = Date.now(), block = blockFor_(klass), off = noSchool_();
    var att = [], evs = [], days = {}, dev = clean_(body.device, 40);
    function dayRec(lesson, at) { var d = day_(at), key = norm_(klass) + '|' + norm_(name) + '|' + lesson + '|' + d; return days[key] || (days[key] = { key: key, date: d, lesson: lesson, secs: 0, secsIn: 0, answers: 0, right: 0, first: 0 }); }
    (body.events || []).slice(0, 300).forEach(function (ev) {
      if (!ev || !ev.t) return;
      var at = Number(ev.at) || now; if (at > now + 60000 || at < now - 7 * 864e5) at = now;
      var inC = inClass_(block, off, at, now), lesson = clean_(ev.lesson, 20);
      if (ev.t === 'attempt') {
        att.push([new Date(at), klass, name, lesson, clean_(ev.item, 12), clean_(ev.label, 30), clean_(ev.outcome, 8), clean_(ev.level, 4), ev.extra ? 'Y' : '', ev.practice ? 'Y' : '', Number(ev.ver) || 0,
          clean_(ev.verdict, 10), clean_(ev.code, 30), Number(ev.tryNo) || 0, clean_(ev.answer, 200), clean_(ev.prompt, 300), inC ? 'Y' : 'N', dev]);
        if ((ev.verdict === 'correct' || ev.verdict === 'wrong') && !ev.practice) { var dr = dayRec(lesson, at); dr.answers++; if (ev.verdict === 'correct') { dr.right++; if (Number(ev.tryNo) === 1) dr.first++; } }
      } else if (ev.t === 'event') {
        evs.push([new Date(at), klass, name, lesson, clean_(ev.item, 12), clean_(ev.type, 16), Number(ev.secs) || '', inC ? 'Y' : 'N']);
      } else if (ev.t === 'tick') {
        var s = Math.max(0, Math.min(120, Number(ev.secs) || 0)), d2 = dayRec(lesson, at); d2.secs += s; if (inC) d2.secsIn += s;
      }
    });
    if (att.length) { var a = sheet_('Attempts'); a.getRange(a.getLastRow() + 1, 1, att.length, att[0].length).setValues(att); }
    if (evs.length) { var b = sheet_('Events'); b.getRange(b.getLastRow() + 1, 1, evs.length, evs[0].length).setValues(evs); }
    var dk = Object.keys(days); if (dk.length) upsertDays_(klass, name, dk.map(function (k) { return days[k]; }));
    if (body.progress) upsertProgress_(klass, name, body.progress, now);
    // live status (cache) + last seen
    var stt = body.status || {};
    setLive_(klass, name, { view: clean_(stt.view, 10), lesson: clean_(stt.lesson, 20), item: clean_(stt.item, 12), label: clean_(stt.label, 30), away: !!stt.away, at: now, since: Number(stt.at) || now, inClass: inClass_(block, off, now, now), dev: dev });
    if (!st.v[5] || now - new Date(st.v[5]).getTime() > 60000) sheet_('Roster').getRange(st.row, 6).setValue(new Date(now));
    return json_({ ok: true, wrote: att.length });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
function upsertDays_(klass, name, recs) {
  var sh = sheet_('Days'), last = sh.getLastRow(), keys = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [], idx = {};
  for (var i = keys.length - 1; i >= 0 && i >= keys.length - 4000; i--) idx[keys[i][0]] = i + 2; // recent rows are enough (today)
  var add = [];
  recs.forEach(function (r) {
    var row = idx[r.key];
    if (row) { var v = sh.getRange(row, 6, 1, 5).getValues()[0]; sh.getRange(row, 6, 1, 5).setValues([[Number(v[0]) + r.secs, Number(v[1]) + r.secsIn, Number(v[2]) + r.answers, Number(v[3]) + r.right, Number(v[4]) + r.first]]); }
    else add.push([r.key, r.date, klass, name, r.lesson, r.secs, r.secsIn, r.answers, r.right, r.first]);
  });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, add[0].length).setValues(add);
}
function upsertProgress_(klass, name, prog, now) {
  var sh = sheet_('Progress'), last = sh.getLastRow(), keys = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [], idx = {};
  keys.forEach(function (k, i) { idx[k[0]] = i + 2; });
  Object.keys(prog).slice(0, 20).forEach(function (lesson) {
    var p = prog[lesson] || {}, s = p.summary || {}, key = norm_(klass) + '|' + norm_(name) + '|' + lesson;
    var state = JSON.stringify(p.state || {}); if (state.length > 45000) state = state.slice(0, 45000);
    var row = [key, klass, name, clean_(lesson, 20), Number(s.reqDone) || 0, Number(s.req) || 0, Number(s.reqFirst) || 0, Number(s.extraDone) || 0, Number(s.extra) || 0, Number(s.secs) || 0, new Date(now), state];
    if (idx[key]) sh.getRange(idx[key], 1, 1, row.length).setValues([row]);
    else { sh.appendRow(row); idx[key] = sh.getLastRow(); }
  });
}
function setLive_(klass, name, rec) {
  var c = CacheService.getScriptCache(), k = 'live:' + norm_(klass), m = {};
  try { m = JSON.parse(c.get(k) || '{}'); } catch (e) {}
  m[name] = rec;
  var cut = Date.now() - 6 * 3600000; Object.keys(m).forEach(function (n) { if (m[n].at < cut) delete m[n]; });
  c.put(k, JSON.stringify(m), 21600);
}
function live_(klass) { try { return JSON.parse(CacheService.getScriptCache().get('live:' + norm_(klass)) || '{}'); } catch (e) { return {}; } }

/* ---------------- teacher ---------------- */
function classList_() {
  var counts = {}; rows_('Roster').forEach(function (r) { var k = norm_(r[0]); counts[k] = (counts[k] || 0) + 1; });
  return { ok: true, classes: classes_().map(function (c) { return { code: c.code, label: c.label || c.code, students: counts[c.code] || 0, block: blockFor_(c.code) }; }), noSchool: noSchool_(), bell: BELL };
}
function dash_(klass) {
  var k = norm_(klass), c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var roster = rosterRows_(klass).map(function (x) { var d = []; try { d = JSON.parse(x.v[6] || '[]'); } catch (e) {} return { name: x.v[1], pin: !!x.v[2], firstSeen: ms_(x.v[4]), lastSeen: ms_(x.v[5]), devices: d.length }; });
  var prog = rows_('Progress').filter(function (r) { return norm_(r[1]) === k; }).map(function (r) { return { name: r[2], lesson: r[3], reqDone: r[4], req: r[5], reqFirst: r[6], extraDone: r[7], extra: r[8], secs: r[9], updated: ms_(r[10]), items: itemsOf_(r[11]) }; });
  var days = rows_('Days').filter(function (r) { return norm_(r[2]) === k; }).map(function (r) { return [r[1] instanceof Date ? Utilities.formatDate(r[1], TZ, 'yyyy-MM-dd') : String(r[1]), r[3], r[4], r[5], r[6], r[7], r[8], r[9]]; });
  var att = rows_('Attempts').filter(function (r) { return norm_(r[1]) === k; }).map(function (r) { return [ms_(r[0]), r[2], r[3], r[4], r[6], r[7], r[8] === 'Y' ? 1 : 0, r[9] === 'Y' ? 1 : 0, r[10], r[11], r[12], r[13], r[14], r[15], r[16] === 'Y' ? 1 : 0]; });
  var evs = rows_('Events').filter(function (r) { return norm_(r[1]) === k && r[5] !== 'open'; }).map(function (r) { return [ms_(r[0]), r[2], r[3], r[4], r[5], r[6], r[7] === 'Y' ? 1 : 0]; });
  return { ok: true, 'class': { code: c.code, label: c.label || c.code, block: blockFor_(klass) }, roster: roster, progress: prog, days: days,
    attempts: att, attemptCols: ['time', 'name', 'lesson', 'item', 'outcome', 'level', 'extra', 'practice', 'ver', 'verdict', 'code', 'tryNo', 'answer', 'prompt', 'inClass'],
    events: evs, eventCols: ['time', 'name', 'lesson', 'item', 'type', 'secs', 'inClass'], dayCols: ['date', 'name', 'lesson', 'secs', 'secsIn', 'answers', 'right', 'firstTry'],
    live: live_(klass), now: Date.now(), noSchool: noSchool_(), bell: BELL };
}
function itemsOf_(state) { // compact per-item status for the dashboard: { id: [status, credit, wrong, secs, reveals] }
  var out = {}; try { var s = JSON.parse(state || '{}'), it = s.items || {}; Object.keys(it).forEach(function (id) { var r = it[id]; out[id] = [r.s, r.credit || '', r.wrong || 0, r.secs || 0, r.reveals || 0, r.steps || 0]; }); } catch (e) {}
  return out;
}
function ms_(v) { return v instanceof Date ? v.getTime() : (v ? new Date(v).getTime() || 0 : 0); }
function student_(klass, name) {
  var k = norm_(klass), n = norm_(name);
  var att = rows_('Attempts').filter(function (r) { return norm_(r[1]) === k && norm_(r[2]) === n; }).map(function (r) { return [ms_(r[0]), r[3], r[4], r[5], r[6], r[7], r[9] === 'Y' ? 1 : 0, r[10], r[11], r[12], r[13], r[14], r[15], r[16] === 'Y' ? 1 : 0, r[17]]; });
  var evs = rows_('Events').filter(function (r) { return norm_(r[1]) === k && norm_(r[2]) === n; }).map(function (r) { return [ms_(r[0]), r[3], r[4], r[5], r[6], r[7] === 'Y' ? 1 : 0]; });
  return { ok: true, attempts: att, attemptCols: ['time', 'lesson', 'item', 'label', 'outcome', 'level', 'practice', 'ver', 'verdict', 'code', 'tryNo', 'answer', 'prompt', 'inClass', 'device'], events: evs, eventCols: ['time', 'lesson', 'item', 'type', 'secs', 'inClass'] };
}
/* Teacher: create or update a class roster. names = one per line (or separated by ;). mode = 'replace' removes students who
 * aren't listed (their work stays in the sheets), 'add' only adds. */
function setRoster_(klass, label, names, mode) {
  var code = norm_(klass).replace(/[^a-z0-9\-_ ]/g, '').slice(0, 24); if (!code) return { ok: false, error: 'no class code' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var cs = classes_(), c = null; cs.forEach(function (x) { if (x.code === code) c = x; });
    if (!c) { c = { code: code, label: clean_(label || klass, 40) }; cs.push(c); } else if (label) c.label = clean_(label, 40);
    save_('CLASSES', cs);
    var want = String(names || '').split(/\r?\n|;/).map(function (s) { return clean_(s, 60); }).filter(Boolean), seen = {};
    want = want.filter(function (s) { var k = norm_(s); if (seen[k]) return false; seen[k] = 1; return true; });
    var sh = sheet_('Roster'), have = rosterRows_(code), haveNames = {}; have.forEach(function (x) { haveNames[norm_(x.v[1])] = x; });
    var add = want.filter(function (s) { return !haveNames[norm_(s)]; }).map(function (s) { return [code, s, '', '', '', '', '[]', 0, '']; });
    if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, COLS.Roster.length).setValues(add);
    var removed = 0;
    if (mode === 'replace') {
      var keep = {}; want.forEach(function (s) { keep[norm_(s)] = 1; });
      have.filter(function (x) { return !keep[norm_(x.v[1])]; }).sort(function (a, b) { return b.row - a.row; }).forEach(function (x) { sh.deleteRow(x.row); removed++; });
    }
    return { ok: true, 'class': c, added: add.length, removed: removed };
  } finally { lock.releaseLock(); }
}
function delClass_(klass) {
  var code = norm_(klass), lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    save_('CLASSES', classes_().filter(function (c) { return c.code !== code; }));
    var sh = sheet_('Roster'); rosterRows_(code).sort(function (a, b) { return b.row - a.row; }).forEach(function (x) { sh.deleteRow(x.row); });
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function resetPin_(klass, name) { var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' }; sheet_('Roster').getRange(st.row, 3, 1, 2).setValues([['', '']]); sheet_('Roster').getRange(st.row, 8, 1, 2).setValues([[0, '']]); return { ok: true }; }
function removeStudent_(klass, name) { var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' }; sheet_('Roster').deleteRow(st.row); return { ok: true }; }
function rename_(klass, name, to) { var st = findStudent_(klass, name); to = clean_(to, 60); if (!st || !to) return { ok: false, error: 'unknown student' }; sheet_('Roster').getRange(st.row, 2, 1, 2).setValues([[to, '']]); return { ok: true, note: 'PIN cleared: the student makes a new one.' }; }

/* ---------------- class times: the bell schedule (2026-27) ----------------
 * Mon/Wed are Day 1, Tue/Thu Day 2, Friday has its own shorter periods. [block, start, end] in local time. */
var BELL = {
  day1: [['A', '09:00', '10:28'], ['B', '10:33', '12:00'], ['C', '12:45', '14:13'], ['D', '14:18', '15:45']],
  day2: [['B', '09:00', '10:28'], ['A', '10:33', '12:00'], ['D', '12:45', '14:13'], ['C', '14:18', '15:45']],
  fri:  [['A', '09:00', '10:07'], ['B', '10:11', '11:18'], ['C', '11:48', '12:55'], ['D', '12:58', '14:05']]
};
var BELL_GRACE = 2; // minutes either side of the bells
function blocks_() { var b = list_('BLOCKS'); return (b && typeof b === 'object') ? b : {}; }
function blockFor_(klass) { return blocks_()[norm_(klass)] || ''; }
function noSchool_() { var d = list_('NOSCHOOL'); return Array.isArray(d) ? d : []; }
function period_(block, off, ms) {
  var parts = Utilities.formatDate(new Date(ms), TZ, 'u|HH|mm|yyyy-MM-dd').split('|'), dow = Number(parts[0]);
  if (dow > 5 || off.indexOf(parts[3]) >= 0) return null;
  var day = dow === 5 ? BELL.fri : (dow === 1 || dow === 3) ? BELL.day1 : BELL.day2, mins = Number(parts[1]) * 60 + Number(parts[2]);
  for (var i = 0; i < day.length; i++) if (day[i][0] === block) { var a = day[i][1].split(':'), b = day[i][2].split(':'); return { now: mins, start: a[0] * 60 + Number(a[1]), end: b[0] * 60 + Number(b[1]) }; }
  return null;
}
function inPeriod_(block, off, ms, extraAfter) { var p = period_(block, off, ms); return !!p && p.now >= p.start - BELL_GRACE && p.now <= p.end + BELL_GRACE + (extraAfter || 0); }
function inClass_(block, off, at, now) { if (!block) return true; return Math.abs(now - at) < 10 * 60000 && inPeriod_(block, off, at, 0) && inPeriod_(block, off, now, 5); }
function setBlock_(klass, block) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  var b = String(block || '').trim().toUpperCase(); if (b && !/^[ABCD]$/.test(b)) return { ok: false, error: 'bad block' };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { var all = blocks_(); if (b) all[k] = b; else delete all[k]; save_('BLOCKS', all); return { ok: true, blocks: all }; }
  finally { lock.releaseLock(); }
}
function setNoSchool_(csv) {
  var out = []; String(csv || '').split(/[,\s]+/).forEach(function (x) { x = x.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(x) && out.indexOf(x) < 0) out.push(x); });
  out.sort(); save_('NOSCHOOL', out.slice(-300)); return { ok: true, noSchool: out.slice(-300) };
}
