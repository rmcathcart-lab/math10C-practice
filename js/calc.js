/* On-screen scientific calculator laid out like the TI-30XIIS (two-line display: entry on top, result below).
 * Supports the keys students use in Math 10C: + − × ÷, (−), ( ), x², √, ^, ˣ√, x⁻¹, π, EE, %, fractions (a b/c, d/e,
 * F◂▸D), LOG/10ˣ, LN/eˣ, SIN/COS/TAN and inverses (DEG/RAD via MODE), nPr/nCr/! (PRB), STO▸/RCL (A–E), ANS,
 * entry history with ▲ ▼, cursor editing with ◄ ► DEL and INS, CLEAR, FIX decimal places.
 * HW.Calc.toggle() shows/hides the floating calculator. Evaluation follows the TI order of operations
 * (powers before negation, so (−)2² = −4; implicit multiplication before × and ÷). */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {}, el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* ---------------- exact fractions where possible ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function V(f, q) { return { f: f, q: q || null }; } // float value + optional exact [num, den]
  function fracOf(v) { // [n, d] with 1 < d < 1000, or null
    if (v.q && v.q[1] !== 1 && v.q[1] < 1000) return v.q;
    var x = v.f; if (!isFinite(x) || Math.abs(x) >= 1e7 || x % 1 === 0) return null;
    var h0 = 1, h1 = Math.floor(x), k0 = 0, k1 = 1, b = x - Math.floor(x);
    for (var i = 0; i < 30 && k1 < 1000; i++) {
      if (Math.abs(x - h1 / k1) <= 5e-10 * Math.max(1, Math.abs(x))) return k1 > 1 ? [h1, k1] : null;
      if (b < 1e-12) break;
      b = 1 / b; var a = Math.floor(b); b -= a;
      var h2 = a * h1 + h0, k2 = a * k1 + k0; h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    }
    return k1 < 1000 && k1 > 1 && Math.abs(x - h1 / k1) <= 5e-10 * Math.max(1, Math.abs(x)) ? [h1, k1] : null;
  }
  function fromQ(n, d) {
    if (d === 0) throw err('DIVIDE BY 0');
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1; n /= g; d /= g;
    if (Math.abs(n) > 1e12 || d > 1e12) return V(n / d, null);
    return V(n / d, [n, d]);
  }
  function err(msg) { var e = new Error(msg); e.calc = true; return e; }
  function num(v) { if (!isFinite(v.f)) throw err(isNaN(v.f) ? 'DOMAIN' : 'OVERFLOW'); return v; }
  var OPS = {
    add: function (a, b) { return a.q && b.q ? fromQ(a.q[0] * b.q[1] + b.q[0] * a.q[1], a.q[1] * b.q[1]) : V(a.f + b.f); },
    sub: function (a, b) { return a.q && b.q ? fromQ(a.q[0] * b.q[1] - b.q[0] * a.q[1], a.q[1] * b.q[1]) : V(a.f - b.f); },
    mul: function (a, b) { return a.q && b.q ? fromQ(a.q[0] * b.q[0], a.q[1] * b.q[1]) : V(a.f * b.f); },
    div: function (a, b) { if (b.f === 0) throw err('DIVIDE BY 0'); return a.q && b.q ? fromQ(a.q[0] * b.q[1], a.q[1] * b.q[0]) : V(a.f / b.f); },
    pow: function (a, b) {
      if (a.f === 0 && b.f < 0) throw err('DIVIDE BY 0');
      if (a.q && b.q && b.q[1] === 1 && Math.abs(b.q[0]) <= 64) { var e = b.q[0], n = Math.pow(a.q[0], Math.abs(e)), d = Math.pow(a.q[1], Math.abs(e)); if (Math.abs(n) < 1e15 && d < 1e15) return e >= 0 ? fromQ(n, d) : fromQ(d, n); }
      if (a.f < 0 && b.q && b.q[1] % 2 === 1) { var r = Math.pow(-a.f, b.f); return V(b.q[0] % 2 ? -r : r); } // odd-denominator roots of negatives
      if (a.f < 0 && b.f % 1) throw err('DOMAIN');
      return V(Math.pow(a.f, b.f));
    },
    neg: function (a) { return a.q ? fromQ(-a.q[0], a.q[1]) : V(-a.f); }
  };
  function exactRoot(v, k) { // ˣ√ of an exact value: return exact if it is a perfect power
    if (v.q && v.q[0] >= 0) { var n = Math.round(Math.pow(v.q[0], 1 / k)), d = Math.round(Math.pow(v.q[1], 1 / k)); if (Math.pow(n, k) === v.q[0] && Math.pow(d, k) === v.q[1]) return fromQ(n, d); }
    return null;
  }
  function fact(n) { if (n < 0 || n % 1 || n > 69) throw err(n > 69 ? 'OVERFLOW' : 'DOMAIN'); var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }

  /* ---------------- tokens ----------------
   * The entry line is a list of tokens; each has s (what the display shows) and k (kind). */
  var T = {
    d: function (c) { return { s: c, k: 'digit' }; },
    op: function (s, o) { return { s: s, k: 'op', o: o }; }, // binary operators
    fn: function (s, f) { return { s: s, k: 'fn', f: f }; }, // prefix functions that open a bracket
    post: function (s, p) { return { s: s, k: 'post', p: p }; },
    neg: function () { return { s: '⁻', k: 'neg' }; }, // small raised minus, like the TI's (−)
    lp: function () { return { s: '(', k: 'lp' }; }, rp: function () { return { s: ')', k: 'rp' }; },
    c: function (s, name) { return { s: s, k: 'const', n: name } },
    frac: function () { return { s: '┘', k: 'frac' }; } // ┘ fraction bar
  };

  function Calc() {
    this.entry = []; this.cur = 0; this.ins = false; this.second = false; this.mode = { angle: 'DEG', fix: -1 };
    this.ans = V(0, [0, 1]); this.hist = []; this.hpos = -1; this.result = null; this.resultShown = false; this.showFrac = true;
    this.vars = { A: V(0, [0, 1]), B: V(0, [0, 1]), C: V(0, [0, 1]), D: V(0, [0, 1]), E: V(0, [0, 1]) };
    this.menu = null; this.error = null; this.on = true;
  }
  Calc.prototype = {
    entryText: function () { return this.entry.map(function (t) { return t.s; }).join(''); },
    clearEntry: function () { this.entry = []; this.cur = 0; },
    insert: function (tok) {
      if (this.resultShown) { // after ENTER: an operator continues from Ans, anything else starts fresh
        this.resultShown = false; this.hpos = -1;
        if (tok.k === 'op' || (tok.k === 'post')) { this.entry = [{ s: 'Ans', k: 'ans' }]; this.cur = 1; }
        else { this.entry = []; this.cur = 0; }
      }
      if (this.ins || this.cur >= this.entry.length) this.entry.splice(this.cur, 0, tok); else this.entry[this.cur] = tok;
      this.cur++;
      if (tok.k === 'fn') { /* the bracket is part of the function name, e.g. "sin(" */ }
    },
    del: function () { if (this.resultShown) { this.resultShown = false; } if (this.cur < this.entry.length) this.entry.splice(this.cur, 1); else if (this.entry.length) { this.entry.pop(); this.cur = this.entry.length; } },

    /* ---------- parsing (TI order of operations) ---------- */
    parse: function () {
      var toks = this.entry, i = 0, self = this;
      function peek() { return toks[i]; }
      function numberLit() { // digits with optional . and E, and fraction bars a┘b or a┘b┘c
        var s = '', parts = [];
        function readNum() {
          var t = '', seenE = false;
          while (i < toks.length) {
            var tk = toks[i];
            if (tk.k === 'digit' && /[0-9.]/.test(tk.s)) { t += tk.s; i++; }
            else if (tk.k === 'ee' && !seenE) { t += 'E'; seenE = true; i++; if (toks[i] && toks[i].k === 'neg') { t += '-'; i++; } }
            else break;
          }
          if (!t || t === '.' || /E-?$/.test(t) || (t.match(/\./g) || []).length > 1) throw err('SYNTAX');
          return t;
        }
        parts.push(readNum());
        while (toks[i] && toks[i].k === 'frac') { i++; parts.push(readNum()); }
        if (parts.length === 1) { s = parts[0]; var f = Number(s); if (/^\d*\.?\d*$/.test(s) && !/E/.test(s)) { var dec = (s.split('.')[1] || '').length; return fromQ(Math.round(f * Math.pow(10, dec)), Math.pow(10, dec)); } return V(f); }
        self.usedFrac = true;
        var ints = parts.map(function (p) { if (!/^\d+$/.test(p)) throw err('SYNTAX'); return Number(p); });
        if (ints.length === 2) return fromQ(ints[0], ints[1]);
        if (ints.length === 3) return fromQ(ints[0] * ints[2] + ints[1], ints[2]);
        throw err('SYNTAX');
      }
      function primary() {
        var tk = peek(); if (!tk) throw err('SYNTAX');
        if (tk.k === 'digit' || tk.k === 'ee') return numberLit();
        if (tk.k === 'lp') { i++; var v = expr(); if (peek() && peek().k === 'rp') i++; return v; }
        if (tk.k === 'fn') { i++; var a = expr(); if (peek() && peek().k === 'rp') i++; return self.applyFn(tk.f, a); }
        if (tk.k === 'const') { i++; return tk.n === 'pi' ? V(Math.PI) : tk.n === 'e' ? V(Math.E) : V(0); }
        if (tk.k === 'ans') { i++; return self.ans; }
        if (tk.k === 'var') { i++; return self.vars[tk.n]; }
        throw err('SYNTAX');
      }
      function postfix() {
        var v = primary();
        while (peek() && peek().k === 'post') {
          var p = peek().p; i++;
          if (p === 'sq') v = OPS.mul(v, v);
          else if (p === 'inv') { if (v.f === 0) throw err('DIVIDE BY 0'); v = v.q ? fromQ(v.q[1], v.q[0]) : V(1 / v.f); }
          else if (p === 'fact') v = V(fact(v.f), [fact(v.f), 1]);
          else if (p === 'pct') v = OPS.div(v, V(100, [100, 1]));
          else if (p === 'cube') v = OPS.mul(OPS.mul(v, v), v);
        }
        return v;
      }
      function power() { // left to right, like the TI-30XIIS
        var v = postfix();
        while (peek() && peek().k === 'op' && (peek().o === 'pow' || peek().o === 'root')) {
          var o = peek().o; i++;
          var b = signedPostfix();
          if (o === 'pow') v = num(OPS.pow(v, b));
          else { // v ˣ√ b : the v-th root of b
            if (v.f === 0) throw err('DOMAIN');
            var ex = v.q && v.q[1] === 1 ? exactRoot(b, v.q[0]) : null;
            if (ex) v = ex; else if (b.f < 0 && v.q && v.q[1] === 1 && Math.abs(v.q[0]) % 2 === 1) v = V(-Math.pow(-b.f, 1 / v.f)); else if (b.f < 0) throw err('DOMAIN'); else v = V(Math.pow(b.f, 1 / v.f));
          }
        }
        return v;
      }
      function signedPostfix() { if (peek() && peek().k === 'neg') { i++; return OPS.neg(signedPostfix()); } return postfix(); }
      function negation() { if (peek() && peek().k === 'neg') { i++; return OPS.neg(negation()); } return power(); }
      function perm() {
        var v = negation();
        while (peek() && peek().k === 'op' && (peek().o === 'npr' || peek().o === 'ncr')) {
          var o = peek().o; i++; var r = negation(), n = v.f, k = r.f;
          if (n % 1 || k % 1 || n < 0 || k < 0 || k > n) throw err('DOMAIN');
          var p = fact(n) / fact(n - k); v = o === 'npr' ? V(p, [p, 1]) : V(Math.round(p / fact(k)), [Math.round(p / fact(k)), 1]);
        }
        return v;
      }
      function startsTerm(tk) { return tk && (tk.k === 'digit' || tk.k === 'ee' || tk.k === 'lp' || tk.k === 'fn' || tk.k === 'const' || tk.k === 'ans' || tk.k === 'var'); }
      function implicit() { var v = perm(); while (startsTerm(peek())) v = OPS.mul(v, perm()); return v; }
      function term() {
        var v = implicit();
        while (peek() && peek().k === 'op' && (peek().o === 'mul' || peek().o === 'div')) { var o = peek().o; i++; var b = implicit(); v = OPS[o](v, b); }
        return v;
      }
      function expr() {
        var v = term();
        while (peek() && peek().k === 'op' && (peek().o === 'add' || peek().o === 'sub')) { var o = peek().o; i++; var b = term(); v = OPS[o](v, b); }
        return v;
      }
      this.usedFrac = false;
      if (!toks.length) return null;
      var out = expr();
      if (i < toks.length) throw err('SYNTAX');
      return num(out);
    },
    applyFn: function (f, a) {
      var deg = this.mode.angle === 'DEG', rad = this.mode.angle === 'RAD', k = deg ? Math.PI / 180 : rad ? 1 : Math.PI / 200;
      function clean(x) { return Math.abs(x) < 1e-12 ? 0 : x; }
      switch (f) {
        case 'sqrt': if (a.f < 0) throw err('DOMAIN'); return exactRoot(a, 2) || V(Math.sqrt(a.f));
        case 'log': if (a.f <= 0) throw err('DOMAIN'); return V(Math.log10(a.f));
        case 'ln': if (a.f <= 0) throw err('DOMAIN'); return V(Math.log(a.f));
        case 'tenx': return V(Math.pow(10, a.f));
        case 'ex': return V(Math.exp(a.f));
        case 'sin': return V(clean(Math.sin(a.f * k)));
        case 'cos': return V(clean(Math.cos(a.f * k)));
        case 'tan': if (Math.abs(Math.cos(a.f * k)) < 1e-12) throw err('DOMAIN'); return V(clean(Math.tan(a.f * k)));
        case 'asin': if (Math.abs(a.f) > 1) throw err('DOMAIN'); return V(Math.asin(a.f) / k);
        case 'acos': if (Math.abs(a.f) > 1) throw err('DOMAIN'); return V(Math.acos(a.f) / k);
        case 'atan': return V(Math.atan(a.f) / k);
        case 'abs': return a.q ? fromQ(Math.abs(a.q[0]), a.q[1]) : V(Math.abs(a.f));
        case 'round': var dp = this.mode.fix >= 0 ? this.mode.fix : 9; return V(Math.round(a.f * Math.pow(10, dp)) / Math.pow(10, dp));
      }
      throw err('SYNTAX');
    },
    enter: function () {
      if (this.error) { this.error = null; return; }
      if (!this.entry.length) { if (this.hist.length) { this.entry = this.hist[0].entry.slice(); } else return; }
      try {
        var v = this.parse(); if (!v) return;
        if (Math.abs(v.f) >= 1e100) throw err('OVERFLOW');
        this.ans = v; this.result = v; this.showFrac = !!this.usedFrac;
        this.hist.unshift({ entry: this.entry.slice(), result: v, frac: this.showFrac }); if (this.hist.length > 30) this.hist.pop();
        this.resultShown = true; this.hpos = -1; this.cur = this.entry.length;
      } catch (e) { if (!e.calc) throw e; this.error = e.message + ' ERROR'; }
    },
    // F◂▸D: like the real calculator, a decimal converts when it matches a fraction with denominator below 1000 to 10 digits
    toggleFD: function () { if (this.result) { this.showFrac = !this.showFrac; if (!fracOf(this.result)) this.showFrac = false; } },
    fmt: function (v) {
      if (!v) return '';
      var fq = this.showFrac ? fracOf(v) : null;
      if (fq) {
        var n = fq[0], d = fq[1];
        if (this.mixed && Math.abs(n) > d) { var w = Math.trunc(n / d), r = Math.abs(n % d); return w + '┘' + r + '┘' + d; }
        return n + '┘' + d;
      }
      var x = v.f; if (Math.abs(x) < 1e-99) x = 0;
      if (this.mode.fix >= 0) { var s1 = x.toFixed(this.mode.fix); if (s1.replace(/[-.]/g, '').length <= 10) return { m: s1 }; }
      if (x !== 0 && (Math.abs(x) >= 1e10 || Math.abs(x) < 1e-9)) {
        var e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e);
        if (Math.abs(m) >= 9.9999999995) { m /= 10; e++; }
        var ms = String(Number(m.toPrecision(10))); if (!/\./.test(ms) && ms.length < 2) ms += '';
        return { m: ms, e: e };
      }
      var s = Number(x.toPrecision(10)).toString();
      if (/e/.test(s)) { var p = s.split('e'); return { m: p[0], e: Number(p[1]) }; }
      if (s.replace(/[-.]/g, '').length > 10) s = Number(x.toPrecision(10 - Math.max(0, Math.floor(Math.log10(Math.abs(x))) + 1 - 10))).toString();
      if (!/\./.test(s) && x % 1 === 0) s = s + '.';
      return { m: s };
    }
  };

  /* ---------------- the keypad ---------------- */
  // [primary label, 2nd label, primary action, 2nd action, class]
  var KEYS = [
    [['2nd', '', 'second', null, 'k-2nd'], ['MODE', 'QUIT', 'mode', 'quit', 'k-fn'], ['DEL', 'INS', 'del', 'ins', 'k-fn']],
    [['LOG', '10<sup>x</sup>', 'log', 'tenx', 'k-fn'], ['PRB', '', 'prb', null, 'k-fn'], ['DATA', 'STAT', 'data', 'data', 'k-fn']],
    [['LN', 'e<sup>x</sup>', 'ln', 'ex', 'k-fn'], ['a<sup>b</sup>/<sub>c</sub>', 'd/e', 'frac', 'mixed', 'k-fn'], ['F◂▸D', '', 'fd', null, 'k-fn'], ['%', '', 'pct', null, 'k-fn'], ['CLEAR', '', 'clear', null, 'k-clear']],
    [['π', '', 'pi', null, 'k-fn'], ['SIN', 'SIN<sup>-1</sup>', 'sin', 'asin', 'k-fn'], ['COS', 'COS<sup>-1</sup>', 'cos', 'acos', 'k-fn'], ['TAN', 'TAN<sup>-1</sup>', 'tan', 'atan', 'k-fn'], ['^', '<sup>x</sup>√', 'pow', 'root', 'k-op']],
    [['x<sup>-1</sup>', 'x!', 'inv', 'fact', 'k-fn'], ['EE', '', 'ee', null, 'k-fn'], ['(', '', 'lp', null, 'k-fn'], [')', '', 'rp', null, 'k-fn'], ['÷', '', 'div', null, 'k-op']],
    [['x<sup>2</sup>', '√', 'sq', 'sqrt', 'k-fn'], ['7', '', '7', null, 'k-num'], ['8', '', '8', null, 'k-num'], ['9', '', '9', null, 'k-num'], ['×', '', 'mul', null, 'k-op']],
    [['|x|', 'x<sup>3</sup>', 'abs', 'cube', 'k-fn'], ['4', '', '4', null, 'k-num'], ['5', '', '5', null, 'k-num'], ['6', '', '6', null, 'k-num'], ['−', '', 'sub', null, 'k-op']],
    [['STO▸', 'RCL', 'sto', 'rcl', 'k-fn'], ['1', '', '1', null, 'k-num'], ['2', '', '2', null, 'k-num'], ['3', '', '3', null, 'k-num'], ['+', '', 'add', null, 'k-op']],
    [['ON', 'OFF', 'on', 'off', 'k-on'], ['0', '', '0', null, 'k-num'], ['.', '', '.', null, 'k-num'], ['(−)', 'ANS', 'neg', 'ans', 'k-num'], ['ENTER', '', 'enter', null, 'k-enter']]
  ];

  // The arrow keys sit in a round 4-way pad at the top right, like the real TI-30XIIS (columns 4-5, rows 1-2).
  var ARROWS = [['▲', 'up', 'ca-up'], ['◄', 'left', 'ca-left'], ['►', 'right', 'ca-right'], ['▼', 'down', 'ca-down']];

  Calc.prototype.press = function (act) {
    var c = this;
    if (!c.on && act !== 'on') return;
    if (c.error) { c.error = null; if (act === 'clear' || act === 'enter' || act === 'left' || act === 'right' || act === 'del') return; c.clearEntry(); c.resultShown = false; }
    if (c.menu) return c.menuKey(act);
    var wasSecond = c.second; c.second = false;
    switch (act) {
      case 'second': c.second = !wasSecond; return;
      case 'on': c.on = true; c.clearEntry(); c.resultShown = false; return;
      case 'off': c.on = false; return;
      case 'clear': c.clearEntry(); c.resultShown = false; c.result = null; c.hpos = -1; return;
      case 'del': c.del(); return;
      case 'ins': c.ins = !c.ins; return;
      case 'left': if (c.resultShown) { c.resultShown = false; } c.cur = Math.max(0, c.cur - 1); return;
      case 'right': if (c.resultShown) { c.resultShown = false; } c.cur = Math.min(c.entry.length, c.cur + 1); return;
      case 'up': if (c.hist.length) { c.hpos = Math.min(c.hist.length - 1, c.hpos + 1); var h = c.hist[c.hpos]; c.entry = h.entry.slice(); c.cur = c.entry.length; c.result = h.result; c.showFrac = h.frac; c.resultShown = true; } return;
      case 'down': if (c.hpos > 0) { c.hpos--; var h2 = c.hist[c.hpos]; c.entry = h2.entry.slice(); c.cur = c.entry.length; c.result = h2.result; c.showFrac = h2.frac; c.resultShown = true; } else { c.hpos = -1; c.clearEntry(); c.resultShown = false; c.result = null; } return;
      case 'enter': c.enter(); return;
      case 'fd': c.toggleFD(); return;
      case 'mixed': c.mixed = !c.mixed; return;
      case 'mode': c.menu = { kind: 'mode', row: 0, col: [['DEG', 'RAD', 'GRAD'].indexOf(c.mode.angle), c.mode.fix + 1] }; return;
      case 'quit': c.menu = null; return;
      case 'prb': c.menu = { kind: 'prb', row: 0, col: [0] }; return;
      case 'data': c.error = 'STAT not used in Math 10C'; return;
      case 'sto': if (!c.entry.length && !c.resultShown) return; c.menu = { kind: 'sto', row: 0, col: [0] }; return;
      case 'rcl': c.menu = { kind: 'rcl', row: 0, col: [0] }; return;
    }
    var tok = null;
    if (/^[0-9.]$/.test(act)) tok = T.d(act);
    else if (act === 'add') tok = T.op('+', 'add'); else if (act === 'sub') tok = T.op('-', 'sub');
    else if (act === 'mul') tok = T.op('*', 'mul'); else if (act === 'div') tok = T.op('/', 'div');
    else if (act === 'pow') tok = T.op('^', 'pow'); else if (act === 'root') tok = T.op('ˣ√', 'root');
    else if (act === 'neg') tok = T.neg();
    else if (act === 'lp') tok = T.lp(); else if (act === 'rp') tok = T.rp();
    else if (act === 'pi') tok = T.c('π', 'pi');
    else if (act === 'ee') tok = { s: 'E', k: 'ee' };
    else if (act === 'frac') tok = T.frac();
    else if (act === 'ans') tok = { s: 'Ans', k: 'ans' };
    else if (act === 'sq') tok = T.post('²', 'sq'); else if (act === 'cube') tok = T.post('³', 'cube');
    else if (act === 'inv') tok = T.post('⁻¹', 'inv'); else if (act === 'fact') tok = T.post('!', 'fact'); else if (act === 'pct') tok = T.post('%', 'pct');
    else if (act === 'sqrt') tok = T.fn('√(', 'sqrt'); else if (act === 'log') tok = T.fn('log(', 'log'); else if (act === 'ln') tok = T.fn('ln(', 'ln');
    else if (act === 'tenx') tok = T.fn('10^(', 'tenx'); else if (act === 'ex') tok = T.fn('e^(', 'ex');
    else if (act === 'abs') tok = T.fn('abs(', 'abs');
    else if (/^a?(sin|cos|tan)$/.test(act)) tok = T.fn(act.length === 4 ? act.slice(1) + '⁻¹(' : act + '(', act);
    if (tok) c.insert(tok);
  };
  Calc.prototype.menuKey = function (act) {
    var c = this, m = c.menu;
    var rows = c.menuRows();
    if (act === 'clear' || act === 'quit' || act === 'mode' && m.kind === 'mode') { c.menu = null; return; }
    if (act === 'second') { c.second = !c.second; return; }
    if (act === 'left') { m.col[m.row] = Math.max(0, m.col[m.row] - 1); return; }
    if (act === 'right') { m.col[m.row] = Math.min(rows[m.row].length - 1, m.col[m.row] + 1); return; }
    if (act === 'up') { m.row = Math.max(0, m.row - 1); return; }
    if (act === 'down') { m.row = Math.min(rows.length - 1, m.row + 1); if (m.col[m.row] == null) m.col[m.row] = 0; return; }
    if (act !== 'enter') return;
    var choice = rows[m.row][m.col[m.row]];
    if (m.kind === 'mode') { if (m.row === 0) c.mode.angle = choice; else c.mode.fix = choice === 'FLO' ? -1 : Number(choice); return; }
    c.menu = null; c.second = false;
    if (m.kind === 'prb') { c.insert(choice === '!' ? T.post('!', 'fact') : T.op(choice === 'nPr' ? ' nPr ' : ' nCr ', choice === 'nPr' ? 'npr' : 'ncr')); return; }
    if (m.kind === 'rcl') { c.insert({ s: choice, k: 'var', n: choice }); return; }
    if (m.kind === 'sto') { // store the current entry (or the last result) in a letter
      if (!c.resultShown) c.enter();
      if (!c.error) { c.vars[choice] = c.ans; c.storeMsg = c.fmtPlain(c.ans) + '▸' + choice; }
    }
  };
  Calc.prototype.menuRows = function () {
    var m = this.menu; if (!m) return [];
    if (m.kind === 'mode') return [['DEG', 'RAD', 'GRAD'], ['FLO', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']];
    if (m.kind === 'prb') return [['nPr', 'nCr', '!']];
    return [['A', 'B', 'C', 'D', 'E']];
  };
  Calc.prototype.fmtPlain = function (v) { var f = this.fmt(v); return typeof f === 'string' ? f : f.m + (f.e != null ? 'E' + f.e : ''); };

  /* ---------------- the floating window ---------------- */
  var UI = null;
  function build() {
    var c = new Calc(), box = el('div', 'calc hidden'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Calculator (TI-30XIIS layout)');
    box.tabIndex = -1;
    var head = el('div', 'calc-head', '<span class="calc-brand">TI-30X<span>IIS</span> <em>style</em></span>');
    var close = el('button', 'calc-close', '×'); close.type = 'button'; close.title = 'Close calculator'; head.appendChild(close);
    var screen = el('div', 'calc-screen'), ind = el('div', 'calc-ind'), l1 = el('div', 'calc-l1'), l2 = el('div', 'calc-l2');
    screen.appendChild(ind); screen.appendChild(l1); screen.appendChild(l2);
    var pad = el('div', 'calc-pad');
    function wire(b, a1, a2) {
      b.type = 'button'; b.dataset.a = a1; if (a2) b.dataset.b = a2;
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); var act = (c.second && a2) ? a2 : a1; c.press(act); render(); b.classList.add('down'); setTimeout(function () { b.classList.remove('down'); }, 90); });
      b.addEventListener('click', function (e) { e.preventDefault(); });
      return b;
    }
    KEYS.forEach(function (row, ri) {
      row.forEach(function (k) {
        pad.appendChild(wire(el('button', 'ck ' + k[4], (k[1] ? '<span class="ck2">' + k[1] + '</span>' : '<span class="ck2">&nbsp;</span>') + '<span class="ck1">' + k[0] + '</span>'), k[2], k[3]));
      });
      if (ri === 0) {
        var dpad = el('div', 'calc-dpad'), ring = el('div', 'cd-ring');
        ARROWS.forEach(function (a) { var b = wire(el('button', 'ca ' + a[2], '<span>' + a[0] + '</span>'), a[1], null); b.setAttribute('aria-label', a[1]); ring.appendChild(b); });
        ring.appendChild(el('div', 'cd-hub'));
        dpad.appendChild(ring); pad.appendChild(dpad);
      }
    });
    box.appendChild(head); box.appendChild(screen); box.appendChild(pad);
    document.body.appendChild(box);
    function render() {
      ind.innerHTML = (c.second ? '<b>2nd</b>' : '<b class="off">2nd</b>') + '<span>' + c.mode.angle + '</span>' + (c.mode.fix >= 0 ? '<span>FIX</span>' : '') + (c.ins ? '<span>INS</span>' : '') + (c.menu ? '' : (c.hpos >= 0 ? '<span>▲</span>' : ''));
      if (!c.on) { l1.textContent = ''; l2.textContent = ''; box.classList.add('off'); return; }
      box.classList.remove('off');
      if (c.menu) {
        var rows = c.menuRows();
        l1.innerHTML = rows.map(function (r, ri) { return r.map(function (o, ci) { var sel = c.menu.col[ri] === ci; return '<span class="mi' + (sel ? ' sel' : '') + (ri === c.menu.row && sel ? ' cur' : '') + '">' + o + '</span>'; }).join(' '); })[0];
        l2.innerHTML = rows[1] ? rows[1].map(function (o, ci) { var sel = c.menu.col[1] === ci; return '<span class="mi' + (sel ? ' sel' : '') + (c.menu.row === 1 && sel ? ' cur' : '') + '">' + o + '</span>'; }).join(' ') : '';
        l2.classList.add('menu'); return;
      }
      l2.classList.remove('menu');
      if (c.error) { l1.innerHTML = '<span class="calc-err">' + c.error + '</span>'; l2.textContent = ''; return; }
      // entry line with cursor
      var html = '', toks = c.entry;
      for (var i = 0; i <= toks.length; i++) {
        if (i === c.cur && !c.resultShown) html += '<span class="calc-cur' + (c.ins ? ' ins' : '') + '">' + (toks[i] ? esc(toks[i].s) : '&nbsp;') + '</span>';
        else if (toks[i]) html += esc(toks[i].s);
      }
      l1.innerHTML = '<span class="calc-entry">' + html + '</span>';
      l1.scrollLeft = l1.scrollWidth;
      if (c.storeMsg) { l2.innerHTML = esc(c.storeMsg); c.storeMsg = null; return; }
      if (c.resultShown && c.result) {
        var f = c.fmt(c.result);
        l2.innerHTML = typeof f === 'string' ? esc(f) : esc(f.m) + (f.e != null ? '<span class="calc-x10">×10</span><sup>' + f.e + '</sup>' : '');
      } else l2.innerHTML = '';
    }
    function esc(s) { return String(s).replace(/[&<>]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]; }); }
    close.addEventListener('click', function () { api.hide(); });
    // drag by the head (desktop)
    var drag = null;
    head.addEventListener('pointerdown', function (e) { if (e.target === close) return; var r = box.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }; head.setPointerCapture(e.pointerId); });
    head.addEventListener('pointermove', function (e) { if (!drag) return; var x = Math.max(0, Math.min(innerWidth - box.offsetWidth, e.clientX - drag.dx)), y = Math.max(0, Math.min(innerHeight - 40, e.clientY - drag.dy)); box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.right = 'auto'; box.style.bottom = 'auto'; });
    head.addEventListener('pointerup', function () { drag = null; });
    // physical keyboard while the calculator has focus
    var KB = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '.': '.', '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '^': 'pow', '(': 'lp', ')': 'rp', 'Enter': 'enter', '=': 'enter', 'Backspace': 'del', 'Delete': 'del', 'Escape': 'clear', 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down', '%': 'pct', '!': 'fact' };
    box.addEventListener('keydown', function (e) { var a = KB[e.key]; if (a) { e.preventDefault(); e.stopPropagation(); c.press(a); render(); } });
    box.addEventListener('pointerdown', function () { try { box.focus({ preventScroll: true }); } catch (e) {} });
    render();
    var api = {
      calc: c, node: box, render: render,
      show: function () { box.classList.remove('hidden'); document.body.classList.add('calc-open'); render(); try { box.focus({ preventScroll: true }); } catch (e) {} if (api.onToggle) api.onToggle(true); },
      hide: function () { box.classList.add('hidden'); document.body.classList.remove('calc-open'); if (api.onToggle) api.onToggle(false); },
      toggle: function () { if (box.classList.contains('hidden')) api.show(); else api.hide(); },
      isOpen: function () { return !box.classList.contains('hidden'); },
      press: function (seq) { seq.forEach(function (a) { c.press(a); }); render(); return { l1: l1.textContent, l2: l2.textContent }; }
    };
    return api;
  }
  HW.Calc = { engine: Calc, get: function () { if (!UI) UI = build(); return UI; }, toggle: function () { HW.Calc.get().toggle(); } };
})(window);
