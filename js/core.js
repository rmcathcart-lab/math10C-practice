/* Math 10C Practice — core helpers shared by the student app, the lessons and the teacher dashboard.
 * HW.rng      seeded random numbers (every generated question is rebuilt from its seed)
 * HW.nt       number theory (primes, factorizations, divisors)
 * HW.parse    reading student answers typed as plain text or as LaTeX from the math editor
 * HW.tex      KaTeX rendering of \( … \) and \[ … \] inside HTML strings
 * HW.fmt      number formatting (thin-space thousands, like the booklets) */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};

  /* ---------------- seeded random ---------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function Rng(seed) {
    var f = mulberry32(typeof seed === 'number' ? seed : hashStr(seed));
    var r = {
      next: f,
      int: function (a, b) { return a + Math.floor(f() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(f() * arr.length)]; },
      shuffle: function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
      chance: function (p) { return f() < p; },
      sample: function (arr, k) { return r.shuffle(arr).slice(0, k); }
    };
    return r;
  }
  HW.rng = Rng; HW.hashStr = hashStr;
  HW.newSeed = function () { return (Math.floor(Math.random() * 4294967296) ^ Date.now()) >>> 0; };

  /* ---------------- number theory ---------------- */
  var nt = HW.nt = {};
  nt.isPrime = function (n) {
    n = Number(n); if (!isFinite(n) || n < 2 || n % 1) return false;
    if (n < 4) return true; if (n % 2 === 0 || n % 3 === 0) return false;
    for (var i = 5; i * i <= n; i += 6) if (n % i === 0 || n % (i + 2) === 0) return false;
    return true;
  };
  nt.primesBetween = function (a, b) { var out = []; for (var i = Math.max(2, a); i <= b; i++) if (nt.isPrime(i)) out.push(i); return out; };
  /* prime factorization as an ordered list of [prime, exponent] */
  nt.factor = function (n) {
    var out = [], p = 2; n = Math.abs(Math.round(n));
    while (n > 1 && p * p <= n) { var e = 0; while (n % p === 0) { n /= p; e++; } if (e) out.push([p, e]); p += p === 2 ? 1 : 2; }
    if (n > 1) out.push([n, 1]);
    return out;
  };
  nt.primeList = function (n) { var out = []; nt.factor(n).forEach(function (pe) { for (var i = 0; i < pe[1]; i++) out.push(pe[0]); }); return out; };
  nt.distinctPrimes = function (n) { return nt.factor(n).map(function (pe) { return pe[0]; }); };
  nt.divisors = function (n) { var lo = [], hi = []; for (var i = 1; i * i <= n; i++) if (n % i === 0) { lo.push(i); if (i * i !== n) hi.unshift(n / i); } return lo.concat(hi); };
  nt.numDivisors = function (n) { return nt.factor(n).reduce(function (m, pe) { return m * (pe[1] + 1); }, 1); };
  nt.smallestPrimeFactor = function (n) { var f = nt.factor(n); return f.length ? f[0][0] : null; };
  nt.prod = function (arr) { return arr.reduce(function (m, x) { return m * x; }, 1); };
  nt.sum = function (arr) { return arr.reduce(function (m, x) { return m + x; }, 0); };

  /* ---------------- formatting ---------------- */
  /* 3432 -> "3\,432" (LaTeX thin space, as in the booklets); plain=true -> "3 432" */
  HW.fmt = function (n, plain) {
    var s = String(n); if (Math.abs(n) < 1000) return s;
    var neg = s[0] === '-'; if (neg) s = s.slice(1);
    var parts = s.split('.'), i = parts[0], out = '';
    while (i.length > 3) { out = (plain ? ' ' : '\\,') + i.slice(-3) + out; i = i.slice(0, -3); }
    return (neg ? '-' : '') + i + out + (parts[1] ? '.' + parts[1] : '');
  };
  /* LaTeX for a prime factorization in exponent form: [[2,3],[3,1]] -> 2^{3}\times 3 */
  HW.texFactors = function (f) { return f.map(function (pe) { return pe[1] > 1 ? pe[0] + '^{' + pe[1] + '}' : String(pe[0]); }).join('\\times '); };
  HW.texExpanded = function (n) { return nt.primeList(n).join('\\times '); };
  HW.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------------- KaTeX ---------------- */
  /* Renders \( … \) (inline) and \[ … \] (display) in an HTML string. Anything else is left as is. */
  HW.tex = function (html) {
    if (html == null) return '';
    if (!root.katex) return String(html);
    return String(html).replace(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g, function (m, disp, inl) {
      try { return root.katex.renderToString(disp != null ? disp : inl, { displayMode: disp != null, throwOnError: false, strict: false }); }
      catch (e) { return HW.esc(m); }
    });
  };
  HW.k = function (latex, display) { if (!root.katex) return HW.esc(latex); try { return root.katex.renderToString(String(latex), { displayMode: !!display, throwOnError: false, strict: false }); } catch (e) { return HW.esc(latex); } };

  /* ---------------- reading answers ---------------- */
  var parse = HW.parse = {};
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  /* LaTeX (from the math editor) or typed text -> one plain string: digits, ^, *, +, -, /, (, ), commas, letters */
  parse.plain = function (s) {
    s = String(s == null ? '' : s);
    s = s.replace(/\\placeholder(\[[^\]]*\])?\{[^}]*\}/g, '□');
    s = s.replace(/\\left|\\right|\\displaystyle|\\mathrm|\\text|\\operatorname/g, '');
    s = s.replace(/\\times|\\cdot|\\ast|×|·|⋅|∙|•/g, '*');
    s = s.replace(/\\div|÷/g, '/').replace(/\\lbrace|\\\{/g, '{').replace(/\\rbrace|\\\}/g, '}');
    s = s.replace(/\\[,;:! ]|\\quad|\\qquad|~| | /g, ' ');
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) { return '^' + m.split('').map(function (c) { return SUP[c]; }).join(''); });
    s = s.replace(/−|–|—/g, '-');
    s = s.replace(/\^\{([^{}]*)\}/g, '^($1)');
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)');
    s = s.replace(/[{}]/g, function (c) { return c === '{' ? '(' : ')'; });
    s = s.replace(/\\[a-zA-Z]+/g, ' ');
    return s.replace(/\s+/g, ' ').trim();
  };
  parse.hasBlank = function (s) { return /\\placeholder|□/.test(String(s || '')); };
  /* a single number. Returns {ok, value} or {ok:false, code} */
  parse.number = function (s) {
    var t = parse.plain(s).replace(/\s+/g, '').replace(/,(?=\d{3}(\D|$))/g, '');
    if (!t) return { ok: false, code: 'empty' };
    if (/^-?\d+(\.\d+)?$/.test(t) || /^-?\.\d+$/.test(t)) return { ok: true, value: Number(t) };
    if (/^\(?-?\d+(\.\d+)?\)?$/.test(t)) return { ok: true, value: Number(t.replace(/[()]/g, '')) };
    return { ok: false, code: 'notnumber' };
  };
  /* a list of whole numbers separated by commas, spaces, semicolons or "and". Returns {ok, values} or {ok:false, code, bad} */
  parse.numberList = function (s) {
    var t = parse.plain(s).replace(/\band\b|&/gi, ',').replace(/[{}()\[\]]/g, ' ');
    var bits = t.split(/[,;\s]+/).filter(Boolean), out = [];
    for (var i = 0; i < bits.length; i++) {
      if (!/^-?\d+$/.test(bits[i])) return { ok: false, code: /[*×^]/.test(bits[i]) ? 'product' : 'notnumber', bad: bits[i] };
      out.push(Number(bits[i]));
    }
    if (!out.length) return { ok: false, code: 'empty' };
    return { ok: true, values: out };
  };
  /* a product of whole-number powers, e.g. "2^3 × 3 × 11" or "2·2·2·3·11" (an optional "264 =" in front is allowed).
   * Returns {ok, factors:[[base,exp],…] (in the order written), value, lead} or {ok:false, code}.
   * codes: empty, plus (used + or −), comma (listed instead of multiplied), divide, paren, notnumber, equals (two = signs) */
  parse.product = function (s) {
    var t = parse.plain(s).replace(/\s+/g, ''), lead = null;
    if (!t) return { ok: false, code: 'empty' };
    var eq = t.split('=');
    if (eq.length > 2) return { ok: false, code: 'equals' };
    if (eq.length === 2) {
      if (/^\d+$/.test(eq[0])) { lead = Number(eq[0]); t = eq[1]; }
      else if (/^\d+$/.test(eq[1])) { lead = Number(eq[1]); t = eq[0]; }
      else return { ok: false, code: 'equals' };
    }
    if (/,/.test(t)) return { ok: false, code: 'comma' };
    if (/\+|(?!^)-/.test(t)) return { ok: false, code: 'plus' };
    if (/\//.test(t)) return { ok: false, code: 'divide' };
    t = t.replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(');
    var bits = t.split('*'), out = [];
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i].replace(/^\((\d+(\^\(?\d+\)?)?)\)$/, '$1');
      var m = /^(\d+)(?:\^\(?(\d+)\)?)?$/.exec(b) || /^\((\d+)\)\^\(?(\d+)\)?$/.exec(b);
      if (!m) return { ok: false, code: /[a-z]/i.test(b) ? 'notnumber' : (/\(/.test(b) ? 'paren' : 'notnumber'), bad: b };
      out.push([Number(m[1]), m[2] == null ? 1 : Number(m[2])]);
    }
    var value = out.reduce(function (acc, pe) { return acc * Math.pow(pe[0], pe[1]); }, 1);
    return { ok: true, factors: out, value: value, lead: lead };
  };
  /* ordered pairs "(5,7), (11,13)" or "5 & 7; 11 & 13" -> [[5,7],[11,13]] */
  parse.pairs = function (s) {
    var t = parse.plain(s), out = [], m, re = /\(\s*(-?\d+)\s*[,;&]\s*(-?\d+)\s*\)/g;
    while ((m = re.exec(t))) out.push([Number(m[1]), Number(m[2])]);
    if (out.length) return { ok: true, pairs: out };
    var nums = parse.numberList(s);
    if (!nums.ok) return nums;
    if (nums.values.length % 2) return { ok: false, code: 'odd' };
    for (var i = 0; i < nums.values.length; i += 2) out.push([nums.values[i], nums.values[i + 1]]);
    return { ok: true, pairs: out };
  };

  /* ---------------- small DOM helpers ---------------- */
  HW.el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  HW.now = function () { return Date.now(); };
  HW.LEVELS = ['LIM', 'BEG', 'EMG', 'PRG', 'ADV', 'MAS'];
  HW.LEVEL_NAMES = { LIM: 'Limited', BEG: 'Beginning', EMG: 'Emerging', PRG: 'Progressing', ADV: 'Advancing', MAS: 'Mastery' };
})(typeof window !== 'undefined' ? window : globalThis);
