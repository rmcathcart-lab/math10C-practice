/* Runs backend/Code.gs locally for tests, with in-memory stand-ins for the Apps Script services.
 *   node backend/mock_server.js [port] [delayMs]
 * GET ?action=… (JSON, or JSONP with callback=) and POST (text/plain JSON) behave like the deployed /exec URL.
 * Test-only extras: /__stats (sheets and properties), /__set?KEY=value (script properties; __offset=ms moves the clock). */
var fs = require('fs'), http = require('http'), url = require('url'), vm = require('vm'), path = require('path'), crypto = require('crypto');
var PORT = Number(process.argv[2] || 8765), DELAY = Number(process.argv[3] || 60);

function Sheet(name) { this.name = name; this.rows = []; }
Sheet.prototype = {
  appendRow: function (r) { this.rows.push(r.slice()); return this; },
  setFrozenRows: function () { return this; },
  getLastRow: function () { return this.rows.length; },
  getLastColumn: function () { return this.rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0); },
  deleteRow: function (i) { this.rows.splice(i - 1, 1); },
  getRange: function (r, c, nr, nc) {
    var sh = this; nr = nr || 1; nc = nc || 1;
    var rg = {
      getValues: function () { var out = []; for (var i = 0; i < nr; i++) { var row = sh.rows[r - 1 + i] || [], o = []; for (var j = 0; j < nc; j++) { var v = row[c - 1 + j]; o.push(v === undefined ? '' : v); } out.push(o); } return out; },
      setValues: function (vals) { for (var i = 0; i < nr; i++) { var row = sh.rows[r - 1 + i] = sh.rows[r - 1 + i] || []; for (var j = 0; j < nc; j++) row[c - 1 + j] = vals[i][j]; } return rg; },
      setValue: function (v) { var row = sh.rows[r - 1] = sh.rows[r - 1] || []; row[c - 1] = v; return rg; },
      setFontWeight: function () { return rg; }
    };
    return rg;
  }
};
var book = { sheets: {} };
var SS = {
  getId: function () { return 'mock-sheet'; }, getUrl: function () { return 'https://docs.google.com/spreadsheets/d/mock'; },
  getSheetByName: function (n) { return book.sheets[n] || null; },
  insertSheet: function (n) { return (book.sheets[n] = new Sheet(n)); },
  getSheets: function () { return Object.keys(book.sheets).map(function (k) { return book.sheets[k]; }); },
  deleteSheet: function (s) { delete book.sheets[s.name]; }
};
var SpreadsheetApp = { create: function () { return SS; }, openById: function () { return SS; } };
var props = { TEACHER_KEY: 'testkey', SHEET_ID: 'mock-sheet', SECRET: 'mocksecret' };
var PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return props[k] == null ? null : props[k]; }, setProperty: function (k, v) { props[k] = String(v); } }; } };
var cache = {};
var CacheService = { getScriptCache: function () { return {
  get: function (k) { var e = cache[k]; if (!e || e.exp < Date.now()) return null; return e.v; },
  put: function (k, v, ttl) { cache[k] = { v: String(v), exp: Date.now() + (ttl || 600) * 1000 }; },
  remove: function (k) { delete cache[k]; } }; } };
var LockService = { getScriptLock: function () { return { waitLock: function () {}, releaseLock: function () {} }; } };
var ContentService = { MimeType: { JAVASCRIPT: 'js', JSON: 'json' }, createTextOutput: function (t) { var o = { text: t, mime: 'json', setMimeType: function (m) { o.mime = m; return o; } }; return o; } };
function toSigned(buf) { return Array.prototype.map.call(buf, function (b) { return b > 127 ? b - 256 : b; }); }
var Utilities = {
  DigestAlgorithm: { SHA_256: 'sha256' },
  getUuid: function () { return crypto.randomUUID(); },
  computeDigest: function (alg, s) { return toSigned(crypto.createHash('sha256').update(String(s), 'utf8').digest()); },
  computeHmacSha256Signature: function (s, key) { return toSigned(crypto.createHmac('sha256', key).update(String(s), 'utf8').digest()); },
  base64EncodeWebSafe: function (bytes) { return Buffer.from(bytes.map(function (b) { return b & 255; })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'); },
  formatDate: function (d, tz, f) {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz || 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
      .formatToParts(new Date(d)).forEach(function (p) { o[p.type] = p.value; });
    var u = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[o.weekday];
    return String(f).replace(/yyyy|MM|dd|HH|mm|u/g, function (t) { return { yyyy: o.year, MM: o.month, dd: o.day, HH: o.hour, mm: o.minute, u: String(u) }[t]; });
  }
};
var Logger = { log: function (m) { console.log('[Logger]', m); } };
var OFFSET = 0;
function FakeDate() { var a = Array.prototype.slice.call(arguments); return a.length ? new (Function.prototype.bind.apply(Date, [null].concat(a)))() : new Date(Date.now() + OFFSET); }
FakeDate.now = function () { return Date.now() + OFFSET; }; FakeDate.UTC = Date.UTC; FakeDate.parse = Date.parse; FakeDate.prototype = Date.prototype;
var ctx = vm.createContext({ Intl: Intl, SpreadsheetApp: SpreadsheetApp, PropertiesService: PropertiesService, CacheService: CacheService, LockService: LockService, ContentService: ContentService, Utilities: Utilities, Logger: Logger, JSON: JSON, Math: Math, Date: FakeDate, String: String, Number: Number, Object: Object, Array: Array, isFinite: isFinite });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8'), ctx, { filename: 'Code.gs' });
vm.runInContext('setup()', ctx);

http.createServer(function (req, res) {
  var u = url.parse(req.url, true), body = '';
  if (u.pathname === '/__stats') { res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify({ sheets: Object.keys(book.sheets).reduce(function (o, k) { o[k] = book.sheets[k].rows; return o; }, {}), props: props, cache: cache })); return; }
  if (u.pathname === '/__set') { Object.keys(u.query).forEach(function (k) { if (k === '__offset') OFFSET = Number(u.query[k]) || 0; else props[k] = u.query[k]; }); res.end('ok'); return; }
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }); res.end(); return; }
  req.on('data', function (c) { body += c; });
  req.on('end', function () {
    setTimeout(function () {
      var out;
      try { out = req.method === 'POST' ? ctx.doPost({ postData: { contents: body } }) : ctx.doGet({ parameter: u.query }); }
      catch (e) { out = { text: JSON.stringify({ ok: false, error: String(e) }), mime: 'json' }; }
      res.writeHead(200, { 'content-type': out.mime === 'js' ? 'application/javascript' : 'application/json', 'access-control-allow-origin': '*' });
      res.end(out.text);
    }, DELAY);
  });
}).listen(PORT, function () { console.log('mock backend on ' + PORT); });
