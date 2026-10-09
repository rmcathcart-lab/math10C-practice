/* Math 10C · Unit 2 · Lesson 4 — Scientific Notation (Application / Extension) (AN3)
 * Assignment questions 1–11 (u2_L04.tex) and the Lesson 4 Extra Practice (u2_EP04.tex, all of it).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS.
 *
 * All the arithmetic is done EXACTLY on decimals stored as { m: integer, e: integer } (value m × 10^e), so keys and
 * worked solutions never show float noise. Local checkers (not the shared ones) are used for answers because
 * K.sci (without sig) and K.number compare with an absolute tolerance of 1e-9, which accepts wrong answers for
 * numbers smaller than about 10^-8 (e.g. K.sci(2.4e-13) accepts 2.4 × 10^-12):
 *   sciChk(x, opt)   scientific notation, exact (relative) value; delegates formatting nudges to K.sci
 *   stdChk(d, diag)  standard notation, compared digit by digit (exact for 0.0000000562 and for 407 000 000 000 000)
 *   prodChk(d)       product form, e.g. 2.35 × 10 × 10 × 10 or 4 / (10 × 10 × 10)
 *   linChk(c)        an exponent written in terms of k (k + c) — K.expo rejects 'k-1' as "not simplified" */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, P = K.P, F = HW.fmt, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  /* ---------- exact decimals ---------- */
  function P10(k) { return Math.pow(10, k); }
  function D(m, e) { if (m === 0) return { m: 0, e: 0 }; while (m % 10 === 0) { m /= 10; e++; } return { m: m, e: e }; }
  function dec(s) { s = String(s).replace(/\s|\\,/g, ''); var sg = s[0] === '-'; if (sg) s = s.slice(1); var p = s.split('.'), fr = p[1] || ''; var m = Number((p[0] || '0') + fr); return D(sg ? -m : m, -fr.length); }
  function val(d) { return Number(d.m + 'e' + d.e); }
  function nd(d) { return String(Math.abs(d.m)).length; }               // significant digits
  function sN(d) { return d.m === 0 ? 0 : d.e + nd(d) - 1; }            // exponent in scientific notation
  function mul(a, b) { return D(a.m * b.m, a.e + b.e); }
  function div(a, b) { for (var k = 0; k <= 12; k++) { var n = a.m * P10(k); if (!Number.isSafeInteger(n)) return null; if (n % b.m === 0) return D(n / b.m, a.e - b.e - k); } return null; }
  function add(a, b) { var e = Math.min(a.e, b.e); return D(a.m * P10(a.e - e) + b.m * P10(b.e - e), e); }
  function neg(a) { return { m: -a.m, e: a.e }; }
  function sub(a, b) { return add(a, neg(b)); }
  function pw(a, k) { var r = D(1, 0); for (var i = 0; i < k; i++) r = mul(r, a); return r; }
  function sh(a, k) { return { m: a.m, e: a.e + k }; }                  // × 10^k
  function coef(d) { return D(d.m, -(nd(d) - 1)); }                     // the scientific-notation coefficient
  function inRange(c) { var v = Math.abs(val(c)); return v >= 1 && v < 10; }
  function std(d) {
    if (d.m === 0) return '0';
    var s = String(Math.abs(d.m)), sg = d.m < 0 ? '-' : '';
    if (d.e >= 0) return sg + s + '0'.repeat(d.e);
    var pos = s.length + d.e;
    return pos > 0 ? sg + s.slice(0, pos) + '.' + s.slice(pos) : sg + '0.' + '0'.repeat(-pos) + s;
  }
  function stdTex(d) {
    var s = std(d), sg = ''; if (s[0] === '-') { sg = '-'; s = s.slice(1); }
    var p = s.split('.'), i = p[0], out = '';
    if (i.length >= 4) while (i.length > 3) { out = '\\,' + i.slice(-3) + out; i = i.slice(0, -3); }
    return sg + i + out + (p[1] ? '.' + p[1] : '');
  }
  function stdPlain(d) { return stdTex(d).replace(/\\,/g, ' '); }
  function sciT(d) { return std(coef(d)) + '\\times 10^{' + sN(d) + '}'; }
  function sciPlain(d) { return std(coef(d)) + ' × 10^' + sN(d); }
  function pt(c, p) { return stdTex(c) + '\\times 10^{' + p + '}'; }   // c × 10^p, c not necessarily in range
  function par(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function S(m, n) { return D(m, n - (String(m).length - 1)); }        // digits m with the decimal point after the first digit, × 10^n
  function relEq(a, b, tol) { return isFinite(a) && isFinite(b) && Math.abs(a - b) <= (tol || 1e-9) * Math.max(Math.abs(a), Math.abs(b)); }

  /* ---------- random pieces ---------- */
  function mant(r, sig) { if (sig === 1) return r.int(1, 9); var s = String(r.int(1, 9)); for (var i = 1; i < sig - 1; i++) s += r.int(0, 9); return Number(s + r.int(1, 9)); }
  function nz(r, lo, hi) { var v; do { v = r.int(lo, hi); } while (v % 10 === 0); return v; }
  function find(r, gen, okf, fallback) { if (fallback && r.chance(0.12)) return fallback; for (var i = 0; i < 600; i++) { var v = gen(); if (v && okf(v)) return v; } return fallback; }

  /* ---------- checkers ---------- */
  function cands(list) { // [[value(D or number), code, hint], …] -> diag(v)
    return function (v) {
      for (var i = 0; i < list.length; i++) { var c = list[i]; if (c && c[0] != null && relEq(v, typeof c[0] === 'number' ? c[0] : val(c[0]))) return { code: c[1], hint: c[2] }; }
      return null;
    };
  }
  var LETTER_X = /\d\s*[xX]\s*\d/;
  function letterX(resp) { return LETTER_X.test(String(resp || '')) ? form('letter-x', 'For “times”, use the ' + t('\\times') + ' key (or type <code>*</code>) — the letter x reads as a variable.') : null; }
  function sciChk(x, opt) {
    opt = opt || {};
    var X = typeof x === 'number' ? x : val(x), base = K.sci(X, { sig: opt.sig }), want = opt.sig ? Number(X.toPrecision(opt.sig)) : X;
    return function (resp) {
      var lx = letterX(resp); if (lx) return lx;
      var a = K.read(resp); if (a.res) return a.res;
      if (relEq(a.val, want) || (opt.sig && (relEq(a.val, X, 1e-7) || Number(a.val.toPrecision(opt.sig)) === want))) return base(resp);
      var h = opt.diag ? opt.diag(a.val, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      if (relEq(-a.val, want)) return wrong('sign', 'Check the sign.');
      var q = a.val / want, lg = Math.log10(Math.abs(q));
      if (q > 0 && Math.abs(lg - Math.round(lg)) < 1e-9 && Math.round(lg) !== 0) return wrong('power-off', 'The digits are right, but the power of ' + t('10') + ' is off by ' + t(Math.abs(Math.round(lg))) + '. Count how many places the decimal point moves, and in which direction.');
      if (opt.sig) for (var s = 1; s <= 6; s++) if (s !== opt.sig && relEq(a.val, Number(X.toPrecision(s)))) return form('sig', 'Round the coefficient to ' + opt.sig + ' significant digits' + (opt.place ? ' (the nearest ' + opt.place + ')' : '') + '.');
      return wrong('value', null);
    };
  }
  function stdChk(d, diag) {
    var n = sN(d), X = val(d);
    return function (resp) {
      var raw = String(resp == null ? '' : resp), p = HW.parse.number(raw);
      if (!p.ok) {
        if (p.code === 'empty') return form('empty', 'Type your answer first.');
        var a = K.read(raw);
        if (!a.res && relEq(a.val, X)) return form('not-standard', 'Right value — now write it in <b>standard notation</b>: all the digits, with no power of ' + t('10') + '.');
        return form('notnumber', 'Write the number in standard notation: digits and a decimal point only, no power of ' + t('10') + '.');
      }
      var g = dec(HW.parse.plain(raw).replace(/\s+/g, '').replace(/,(?=\d{3}(\D|$))/g, '').replace(/[()]/g, ''));
      if (g.m === d.m && g.e === d.e) return ok();
      if (g.m === -d.m && g.e === d.e) return wrong('sign', 'Check the sign.');
      var h = diag ? diag(val(g), g) : null; if (h) return wrong(h.code || 'diag', h.hint);
      if (g.m === d.m) {
        var gn = sN(g);
        if (n !== 0 && (gn === -n || (n < 0) !== (gn < 0))) return wrong('direction', n < 0 ? 'A <b>negative</b> exponent makes the number small: move the decimal point to the <b>left</b> (the answer is less than ' + t('1') + ').' : 'A <b>positive</b> exponent makes the number big: move the decimal point to the <b>right</b>.');
        return wrong('places', 'The digits are right, but the decimal point is ' + Math.abs(gn - n) + ' place' + (Math.abs(gn - n) === 1 ? '' : 's') + ' off. Move it exactly ' + t(Math.abs(n)) + ' place' + (Math.abs(n) === 1 ? '' : 's') + ' — count the hops one at a time.');
      }
      return wrong('value', null);
    };
  }
  function isTen(x) { return x.t === 'num' && x.v === 10; }
  function prodTex(d) { var n = sN(d), c = stdTex(coef(d)), tens = []; for (var i = 0; i < Math.abs(n); i++) tens.push('10'); return n >= 0 ? c + (n ? '\\times ' + tens.join('\\times ') : '') : '\\dfrac{' + c + '}{' + tens.join('\\times ') + '}'; }
  function prodKey(d) { return prodTex(d).replace(/\\dfrac/g, '\\frac').replace(/\\times /g, '\\times'); }
  function prodChk(d) {
    var X = val(d), n = sN(d), c = val(coef(d)), ex1 = n >= 0 ? '5.2\\times 10\\times 10' : '\\frac{5.2}{10\\times 10}';
    return function (resp) {
      var lx = letterX(resp); if (lx) return lx;
      var a = K.read(resp); if (a.res) return a.res;
      var shp = ex.shape(a.ast), f = ex.factors(a.ast);
      var tn = f.num.filter(isTen).length, td = f.den.filter(isTen).length, on = f.num.filter(function (x) { return !isTen(x); }), od = f.den.filter(function (x) { return !isTen(x); });
      if (relEq(a.val, X)) {
        if (shp.pow) return form('power', 'Right value — but <b>product form</b> writes every ' + t('10') + ' out, like ' + t(ex1) + ', instead of using a power of ' + t('10') + '.');
        if (on.length !== 1 || od.length || on[0].t !== 'num') return form('prod-shape', 'Write it as the coefficient ' + (n >= 0 ? 'times' : 'divided by') + ' a row of ' + t('10') + 's, like ' + t(ex1) + '.');
        if (!(on[0].v >= 1 && on[0].v < 10)) return form('coef-range', 'Right value, but start from the scientific-notation coefficient (at least ' + t('1') + ' and less than ' + t('10') + '): ' + t(std(coef(d))) + '.');
        if ((n >= 0 && td) || (n < 0 && tn)) return form('prod-shape', 'Simplify: write it with the ' + t('10') + 's ' + (n >= 0 ? 'only multiplied' : 'only in the denominator') + ', like ' + t(ex1) + '.');
        return ok();
      }
      if (!shp.pow && on.length === 1 && on[0].t === 'num' && relEq(on[0].v, c) && !od.length) {
        var got = tn - td;
        if (n !== 0 && got === -n) return wrong('direction', n < 0 ? 'This number is less than ' + t('1') + ', so the ' + t('10') + 's go <b>under</b> the coefficient (divide), not beside it.' : 'This number is bigger than ' + t('10') + ', so the ' + t('10') + 's are <b>multiplied</b>, not dividing.');
        return wrong('count-tens', 'Check the number of ' + t('10') + 's: the decimal point moves ' + t(Math.abs(n)) + ' place' + (Math.abs(n) === 1 ? '' : 's') + ', and each place is one ' + t('10') + '.');
      }
      return wrong('value', null);
    };
  }
  function linChk(c) { // k + c
    return function (resp) {
      var p = ex.parse(resp); if (!p.ok) return K.read(resp).res || form('unreadable', 'I can’t read that.');
      var vs = {}; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') vs[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(p.ast);
      var names = Object.keys(vs);
      if (!names.length) return wrong('no-k', 'The answer depends on ' + t('k') + ': write it in terms of ' + t('k') + ', like ' + t('k+3') + '.');
      if (names.length > 1 || names[0] !== 'k') return form('letter', 'Use the letter ' + t('k') + ' only.');
      var same = [0, 1, 2, 5, -3].every(function (k) { return relEq(ex.value(p.ast, { k: k }), k + c, 1e-9) || Math.abs(ex.value(p.ast, { k: k }) - (k + c)) < 1e-9; });
      if (same) return ok();
      var negd = [0, 1, 2, 5].every(function (k) { return Math.abs(ex.value(p.ast, { k: k }) - (k - c)) < 1e-9; });
      if (negd) return wrong('adjust-direction', c < 0 ? 'The coefficient got <b>bigger</b>, so the exponent must get <b>smaller</b> to keep the value the same.' : 'The coefficient got <b>smaller</b>, so the exponent must get <b>bigger</b> to keep the value the same.');
      return wrong('value', null);
    };
  }

  /* ---------- part makers ---------- */
  function sciPart(prompt, d, o, sol, hints, text) {
    o = o || {};
    var X = o.sig ? val(d) : d, key = o.sig ? K.sciTex(val(d), o.sig) : sciT(d);
    var p = P.math(prompt, sciChk(X, { sig: o.sig, place: o.place, diag: o.diag }), key, sol, hints, text, { keys: 'sci', before: o.before });
    p.good = [key.replace(/\\times 10\^\{(-?\d+)\}/, ' × 10^$1')];
    p.bad = (o.bad || []).slice();
    return p;
  }
  function stdPart(prompt, d, diag, sol, hints, text, inp) {
    var p = { prompt: prompt, input: Object.assign({ type: 'number' }, inp || {}), check: stdChk(d, diag), key: std(d), answer: t(stdTex(d)), solution: sol, hints: hints || [], text: text };
    p.good = [stdPlain(d)];
    p.bad = [std(sh(d, 1)), std(sh(d, -1))];
    if (sN(d) !== 0) p.bad.push(std(sh(d, -2 * sN(d))));
    return p;
  }
  var SCI_HINTS = ['Move the decimal point until exactly one non-zero digit is in front of it. That gives the coefficient ' + t('a') + ', with ' + t('1\\le a<10') + '.',
    'Count the places you moved: that is the exponent. Moving <b>left</b> (a big number) gives a positive exponent; moving <b>right</b> (a number less than 1) gives a negative one.'];
  var STD_HINTS = ['The exponent tells you how many places to move the decimal point.',
    'Positive exponent: move it to the <b>right</b> (a big number). Negative exponent: move it to the <b>left</b> (a number less than ' + t('1') + '). Fill the empty places with zeros.'];
  function moveWords(d) { var n = sN(d); return t(Math.abs(n)) + ' place' + (Math.abs(n) === 1 ? '' : 's') + ' ' + (n >= 0 ? 'left' : 'right'); }
  function signDiag(d) { // the exponent's sign flipped
    var n = sN(d); if (!n) return null;
    return [sh(d, -2 * n), 'exp-sign', n > 0 ? 'Your exponent is negative, but ' + t(stdTex(d)) + ' is <b>bigger</b> than ' + t('1') + ', so its exponent is positive.' : 'Your exponent is positive, but ' + t(stdTex(d)) + ' is <b>less</b> than ' + t('1') + ', so its exponent is negative.'];
  }
  /* standard -> scientific */
  function toSci(d, prompt) {
    var n = sN(d);
    return sciPart(prompt || t(stdTex(d)), d, { diag: cands([signDiag(d), [sh(d, n >= 0 ? 1 : -1), 'counted-digits', 'Count the <b>hops</b> the decimal point makes to sit just after the first non-zero digit (' + t(std(coef(d))) + ') — not the number of digits.']]) },
      'Move the decimal point ' + moveWords(d) + ' to get ' + t(std(coef(d))) + ', so the exponent is ' + t(n) + ':<br>' + t(stdTex(d) + '=' + sciT(d)) + '.',
      SCI_HINTS, 'to scientific notation: ' + std(d));
  }
  /* scientific -> standard */
  function toStd(d, prompt) {
    var n = sN(d);
    var p = stdPart(prompt || t(sciT(d)), d, null,
      (n >= 0 ? 'The exponent is positive: move the decimal point ' + t(n) + ' place' + (n === 1 ? '' : 's') + ' <b>right</b>.' : 'The exponent is negative: move the decimal point ' + t(-n) + ' place' + (n === -1 ? '' : 's') + ' <b>left</b>.') + '<br>' + t(sciT(d) + '=' + stdTex(d)) + '.',
      STD_HINTS, 'to standard notation: ' + sciPlain(d));
    return p;
  }
  /* "not written correctly": coefficient C × 10^k (value V) -> V in scientific notation */
  function fixPart(V, k, promptPre) {
    var C = sh(V, -k), s = sN(C), n = sN(V), shown = pt(C, k), mv = Math.abs(s);
    var p = sciPart((promptPre || '') + t(shown), V, { diag: cands([[sh(V, -2 * s), 'adjust-direction', s < 0 ? 'The coefficient got <b>bigger</b> (' + t(stdTex(C) + '\\to ' + std(coef(V))) + '), so the power of ' + t('10') + ' must get <b>smaller</b> by the same number of places to keep the value the same.' : 'The coefficient got <b>smaller</b> (' + t(stdTex(C) + '\\to ' + std(coef(V))) + '), so the power of ' + t('10') + ' must get <b>bigger</b> by the same number of places to keep the value the same.']]) },
      t(stdTex(C) + '\\to ' + std(coef(V))) + ' moves the decimal point ' + t(mv) + ' place' + (mv === 1 ? '' : 's') + ' ' + (s < 0 ? 'right' : 'left') + ' (the coefficient got ' + (s < 0 ? 'bigger' : 'smaller') + '), so the exponent goes ' + (s < 0 ? 'down' : 'up') + ' by ' + t(mv) + ': ' + t(k + (s < 0 ? '-' + mv : '+' + mv) + '=' + n) + '.<br>' + t(shown + '=' + sciT(V)) + '.',
      ['Rewrite the coefficient ' + t(stdTex(C)) + ' in scientific notation first, then multiply the powers of ' + t('10') + ' (add the exponents).', 'Each place the decimal point moves <b>right</b> makes the coefficient 10 times bigger, so the exponent must go <b>down</b> by 1 — and the other way round.'],
      'rewrite ' + std(C) + '×10^' + k);
    p.bad.push(std(coef(V)) + '\\times10^{' + k + '}');
    return p;
  }
  /* multiply / divide two numbers a × 10^p.  A, B = { c: D, p: int, bare: bool }, op 'mul' | 'div' | 'frac' */
  function cTex(A) { return A.bare ? stdTex(A.c) : pt(A.c, A.p); }
  function opTex(A, B, op) { return op === 'mul' ? '(' + cTex(A) + ')(' + cTex(B) + ')' : op === 'frac' ? '\\dfrac{' + cTex(A) + '}{' + cTex(B) + '}' : (A.bare ? cTex(A) : '(' + cTex(A) + ')') + '\\div(' + cTex(B) + ')'; }
  function opRes(A, B, op) { var m = op === 'mul'; var C = m ? mul(A.c, B.c) : div(A.c, B.c); var E = m ? A.p + B.p : A.p - B.p; return { C: C, E: E, R: sh(C, E) }; }
  function renormSol(C, E, R, last) {
    if (inRange(C)) return t(pt(C, E)) + ' — already in range: ' + (last ? '<b>' + t(sciT(R)) + '</b>.' : t(sciT(R)) + '.');
    return t(pt(C, E)) + '; ' + t(stdTex(C)) + ' is not between ' + t('1') + ' and ' + t('10') + '. ' + t(stdTex(C) + '=' + sciT(C)) + ', so ' + (last ? 'the result is <b>' + t(sciT(R)) + '</b>.' : 'it is ' + t(sciT(R)) + '.');
  }
  function opSol(A, B, op) {
    var o = opRes(A, B, op), m = op === 'mul';
    return 'Coefficients: ' + t(stdTex(A.c) + (m ? '\\times ' : '\\div ') + stdTex(B.c) + '=' + stdTex(o.C)) + '. Exponents: ' + t(m ? A.p + '+' + par(B.p) + '=' + o.E : A.p + '-' + par(B.p) + '=' + o.E) + (A.bare ? ' (' + t(stdTex(A.c)) + ' has no power of ' + t('10') + ', so its exponent is ' + t('0') + ')' : '') + '.<br>' + renormSol(o.C, o.E, o.R, true);
  }
  function opDiag(A, B, op, extra) {
    var o = opRes(A, B, op), m = op === 'mul', list = (extra || []).slice();
    if (!inRange(o.C)) { var k = sN(o.C); list.push([sh(o.R, -2 * k), 'renorm-dir', k > 0 ? 'Renormalizing: ' + t(stdTex(o.C) + '\\to ' + std(coef(o.C))) + ' makes the coefficient smaller, so the exponent must go <b>up</b> by ' + t(k) + ', not down.' : 'Renormalizing: ' + t(stdTex(o.C) + '\\to ' + std(coef(o.C))) + ' makes the coefficient bigger, so the exponent must go <b>down</b> by ' + t(-k) + ', not up.']); }
    if (m) {
      list.push([sh(add(A.c, B.c), o.E), 'add-coef', 'The coefficients are <b>multiplied</b>, not added: ' + t(stdTex(A.c) + '\\times ' + stdTex(B.c)) + '.']);
      list.push([sh(o.C, A.p * B.p), 'mult-exp', 'Product law: <b>add</b> the exponents (' + t('10^{m}\\times 10^{n}=10^{m+n}') + '), don’t multiply them.']);
      list.push([sh(o.C, A.p - B.p), 'sub-exp', 'When you multiply, <b>add</b> the exponents: ' + t(A.p + '+' + par(B.p)) + '.']);
    } else {
      list.push([sh(o.C, A.p + B.p), 'add-exp', 'Quotient law: <b>subtract</b> the exponents (top minus bottom): ' + t(A.p + '-' + par(B.p)) + '.' + (B.p < 0 ? ' Subtracting a negative is adding.' : '')]);
      var fl = div(B.c, A.c); if (fl) list.push([sh(fl, o.E), 'flip-ratio', 'Divide the coefficients in the right order: ' + t(stdTex(A.c) + '\\div ' + stdTex(B.c)) + '.']);
      list.push([sh(mul(A.c, B.c), o.E), 'mult-coef', 'This is a division — divide the coefficients: ' + t(stdTex(A.c) + '\\div ' + stdTex(B.c)) + '.']);
    }
    return cands(list.filter(function (c) { return c[0] && !relEq(val(c[0]), val(o.R)); }));
  }
  var OP_HINTS = ['Work with the coefficients and the powers of ' + t('10') + ' separately: multiply (or divide) the coefficients, add (or subtract) the exponents.',
    'Finish by checking the coefficient: if it isn’t at least ' + t('1') + ' and less than ' + t('10') + ', move the decimal point and adjust the exponent.'];
  function opPart(A, B, op, extra) {
    var o = opRes(A, B, op);
    var p = sciPart(t(opTex(A, B, op)), o.R, { diag: opDiag(A, B, op, extra) }, opSol(A, B, op), OP_HINTS, (op === 'mul' ? 'multiply ' : 'divide ') + opTex(A, B, op).replace(/\\times 10\^\{(-?\d+)\}/g, 'e$1').replace(/\\[a-z]+|[{}\\]/g, ''));
    if (!inRange(o.C)) p.bad.push(stdTex(o.C) + '\\times10^{' + o.E + '}');
    return p;
  }
  function opStdPart(A, B, op) {
    var o = opRes(A, B, op);
    var p = stdPart(t(opTex(A, B, op)), o.R, (function (dg) { return function (v) { return dg(v); }; })(opDiag(A, B, op)),
      opSol(A, B, op).replace(/<b>|<\/b>/g, '') + '<br>Standard notation: ' + t(sciT(o.R) + '=') + '<b>' + t(stdTex(o.R)) + '</b>.', OP_HINTS.concat(['Then write the result in standard notation.']), 'evaluate to standard: ' + opTex(A, B, op).replace(/\\[a-z]+|[{}\\]/g, ''));
    return p;
  }
  function c1(r) { return D(r.int(2, 9), 0); }
  function c2(r) { return D(nz(r, 11, 99), -1); }
  function A_(c, p, bare) { return { c: typeof c === 'string' ? dec(c) : c, p: p, bare: !!bare }; }

  /* ---------- data for context questions ---------- */
  var INNER = [{ n: 'Mercury', d: '57.9' }, { n: 'Venus', d: '108.2' }, { n: 'Earth', d: '149.6' }, { n: 'Mars', d: '227.9' }, { n: 'Jupiter', d: '778.5' }];   // million km
  var OUTER = [{ n: 'Saturn', d: '1.4' }, { n: 'Uranus', d: '2.9' }, { n: 'Neptune', d: '4.5' }];                                                      // billion km
  var LONG = [['The length of the Yangtze River is approximately', 6300000, 'm'], ['The length of the Nile River is approximately', 6650000, 'm'], ['The length of the Mackenzie River is approximately', 1740000, 'm'],
    ['The length of the Yukon River is approximately', 3190000, 'm'], ['The length of the Trans-Canada Highway is approximately', 7820000, 'm'], ['The distance from Earth to the Moon is approximately', 384400000, 'm'],
    ['The circumference of Earth is approximately', 40075000, 'm'], ['The length of Canada’s coastline is approximately', 243000000, 'm']];
  var STARS = [{ n: 'Wolf 359', d: '7.5', e: 16 }, { n: 'Barnard’s Star', d: '5.7', e: 16 }, { n: 'Sirius', d: '8.1', e: 16 }, { n: 'Epsilon Eridani', d: '9.9', e: 16 }, { n: 'Ross 128', d: '1.05', e: 17 }, { n: 'Procyon', d: '1.08', e: 17 }];
  var BODIES = { Sun: { m: '1.99', me: 30, d: '1.39', de: 9 }, Earth: { m: '5.97', me: 24, d: '1.28', de: 7 }, Jupiter: { m: '1.90', me: 27, d: '1.43', de: 8 }, Saturn: { m: '5.68', me: 26, d: '1.21', de: 8 }, Moon: { m: '7.35', me: 22, d: '3.47', de: 6 }, Mars: { m: '6.42', me: 23, d: '6.79', de: 6 } };
  function bn(x, cap) { return x === 'Sun' || x === 'Moon' ? (cap ? 'The ' : 'the ') + x : x; }
  var BODY_PAIRS = [['Sun', 'Earth'], ['Sun', 'Jupiter'], ['Jupiter', 'Earth'], ['Earth', 'Moon'], ['Earth', 'Mars'], ['Saturn', 'Earth'], ['Jupiter', 'Moon']];

  HW.addCodes({
    'exp-sign': 'Exponent has the wrong sign', 'counted-digits': 'Counted digits instead of places moved', direction: 'Moved the decimal point the wrong way', places: 'Decimal point moved the wrong number of places',
    'not-standard': 'Not written in standard notation', 'adjust-direction': 'Adjusted the exponent the wrong way when renormalizing', 'renorm-dir': 'Renormalized in the wrong direction',
    'add-coef': 'Added the coefficients instead of multiplying', 'mult-exp': 'Multiplied the exponents instead of adding', 'sub-exp': 'Subtracted exponents when multiplying', 'add-exp': 'Added exponents when dividing',
    'mult-coef': 'Multiplied the coefficients when dividing', power: 'Used a power instead of product form', 'prod-shape': 'Product form not set up as coefficient and 10s', 'count-tens': 'Wrong number of 10s in product form',
    'no-k': 'Gave a number instead of an expression in k', letter: 'Used another letter', 'no-align': 'Added/subtracted without a common power of 10', 'add-exps-sum': 'Added the exponents when adding',
    'coef-not-raised': 'Did not raise the coefficient to the power', 'coef-times': 'Multiplied the coefficient by the exponent', 'power-add': 'Added the exponent and the power instead of multiplying',
    'flip-ratio': 'Divided the wrong way round', scale: 'Lost a million/billion when converting', 'round-up': 'Rounded up a count of whole items', 'sci-not-n': 'Gave the exponent of the wrong number', 'no-renorm': 'Did not renormalize the coefficient', 'letter-x': 'Typed the letter x for times', mix: 'Mixed up the student’s answer and the correct one', 'ignored-power': 'Ignored the power of 10 already there'
  });

  HW.defineLesson({
    id: 'u2l4', unit: 2, num: '4', title: 'Scientific Notation (Application / Extension)', outcome: 'AN3',
    blurb: 'An application of the exponent laws: writing very large and very small numbers as a × 10ⁿ, then multiplying and dividing them.',
    questions: [
      { num: '1', section: 'Assignment — Converting', stem: 'Complete the row of the table: standard notation, product form and scientific notation. (Product form writes every ' + t('10') + ' out, e.g. ' + t('5.2\\times 10\\times 10') + ' or ' + t('\\frac{4.7}{10\\times 10}') + '.)', parts: [
        { id: '1a', level: 'BEG', make: function (r) { return tableRow(r.chance(0.15) ? D(235, 3) : S(mant(r, r.pick([2, 3])), r.int(3, 6)), 'std'); } },
        { id: '1b', level: 'BEG', make: function (r) { return tableRow(r.chance(0.15) ? D(4, -7) : S(mant(r, r.pick([1, 1, 2])), -r.int(4, 7)), 'std'); } },
        { id: '1c', level: 'BEG', make: function (r) { return tableRow(r.chance(0.15) ? D(53, 2) : S(mant(r, 2), r.int(2, 4)), 'sci'); } },
        { id: '1d', level: 'BEG', make: function (r) { return tableRow(r.chance(0.15) ? D(73, -3) : S(mant(r, 2), -r.int(1, 3)), 'sci'); } }] },
      { num: '2', stem: 'Express each number in scientific notation.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(825, 4) : S(mant(r, 3), r.int(5, 7))); } },
        { id: '2b', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(41, -6) : S(mant(r, 2), -r.int(4, 6))); } },
        { id: '2c', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(63, 9) : S(mant(r, 2), r.int(9, 11))); } },
        { id: '2d', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(362, -4) : S(mant(r, 3), -r.int(1, 3))); } }] },
      { num: '3', stem: 'Express each number in standard notation.', parts: [
        { id: '3a', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(542, 4) : S(mant(r, 3), r.int(5, 7))); } },
        { id: '3b', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(34, -5) : S(mant(r, 2), -r.int(3, 5))); } },
        { id: '3c', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(562, -10) : S(mant(r, 3), -r.int(6, 9))); } },
        { id: '3d', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(675, 5) : S(mant(r, 3), r.int(6, 8))); } }] },
      { num: '4', section: 'Assignment — Renormalizing, multiplying and dividing', stem: 'Each number is <i>not</i> written correctly in scientific notation. Rewrite each one correctly.', parts: [
        { id: '4a', level: 'EMG', make: function (r) { var k = r.int(2, 5); return r.chance(0.15) ? fixPart(D(6, 1), 2) : fixPart(S(mant(r, 1), k - 1), k); } },
        { id: '4b', level: 'EMG', make: function (r) { var k = -r.int(4, 8); return r.chance(0.15) ? fixPart(D(45, -9), -6) : fixPart(S(mant(r, 2), k - 2), k); } },
        { id: '4c', level: 'EMG', make: function (r) { var k = -r.int(5, 9); return r.chance(0.15) ? fixPart(D(621, -9), -8) : fixPart(S(mant(r, 3), k + 1), k); } },
        { id: '4d', level: 'EMG', make: function (r) { var k = r.int(9, 12); return r.chance(0.15) ? fixPart(D(58, 7), 11) : fixPart(S(mant(r, 2), k - 3), k); } }] },
      { num: '5', stem: 'Evaluate and write each result in scientific notation.', parts: [
        { id: '5a', level: 'EMG', make: function (r) {
          var v = find(r, function () { return [A_(c2(r), r.int(4, 8)), A_(r.chance(0.7) ? c2(r) : c1(r), -r.int(1, 4))]; }, function (v) { var C = mul(v[0].c, v[1].c); return inRange(C) && nd(C) <= 2 && v[0].p + v[1].p >= 1; }, [A_('2.4', 6), A_('3.5', -2)]);
          return opPart(v[0], v[1], 'mul');
        } },
        { id: '5b', level: 'EMG', make: function (r) {
          var v = find(r, function () { var Q = r.chance(0.5) ? c1(r) : c2(r), B = c2(r), A = mul(Q, B); return [A_(A, r.int(6, 9)), A_(B, r.int(2, 4))]; }, function (v) { return inRange(v[0].c) && nd(v[0].c) <= 2 && val(v[1].c) < 5 && nd(div(v[0].c, v[1].c)) <= 2; }, [A_('4.5', 7), A_('1.5', 3)]);
          return opPart(v[0], v[1], 'div');
        } },
        { id: '5c', level: 'PRG', make: function (r) {
          var v = find(r, function () { return [A_(D(nz(r, 11, 99), -2), -r.int(1, 4)), A_(D(r.int(2, 9), -1), -r.int(6, 10))]; }, function (v) { return v[0].c.m * v[1].c.m < 100 && nd(mul(v[0].c, v[1].c)) <= 2; }, [A_('0.12', -2), A_('0.2', -9)]);
          return opPart(v[0], v[1], 'mul');
        } },
        { id: '5d', level: 'PRG', make: function (r) {
          var v = find(r, function () { var d = r.int(2, 8), Q = nz(r, 11, 99); return [A_(D(Q * d, -1), 0, true), A_(D(d, -1), r.int(4, 7))]; }, function (v) { var m = v[0].c; return val(m) >= 10 && val(m) < 100 && nd(m) === 3; }, [A_('18.4', 0, true), A_('0.4', 6)]);
          return opPart(v[0], v[1], 'div');
        } }] },
      { num: '6', stem: 'Evaluate and write each result in <b>standard notation</b>.', parts: [
        { id: '6a', level: 'PRG', make: function (r) {
          var v = find(r, function () { var d = r.int(2, 6), Q = nz(r, 11, 99); return [A_(D(Q * d, -1), r.int(2, 5)), A_(D(d, -1), -r.int(1, 3))]; }, function (v) { var m = v[0].c; return inRange(m) && nd(m) === 2 && v[0].p - v[1].p <= 8; }, [A_('9.6', 4), A_('0.6', -2)]);
          return opStdPart(v[0], v[1], 'div');
        } },
        { id: '6b', level: 'PRG', make: function (r) {
          var v = find(r, function () { return [A_(D(r.int(2, 9), -2), -r.int(2, 4)), A_(c1(r), -r.int(1, 3))]; }, function (v) { var p = v[0].c.m * v[1].c.m; return p >= 10 && p < 100 && p % 10 !== 0; }, [A_('0.08', -3), A_('4', -2)]);
          return opStdPart(v[0], v[1], 'mul');
        } }] },
      { num: '7', section: 'Assignment — In context', stem: function (s) { return s.inner.n + ' is about ' + t(s.inner.d) + ' million km from the Sun, and ' + s.outer.n + ' is about ' + t(s.outer.d) + ' billion km from the Sun.'; },
        shared: function (r) {
          var pairs = []; INNER.forEach(function (a) { OUTER.forEach(function (b) { var q = Number(b.d) * 1000 / Number(a.d); if (q >= 2 && Math.abs(q - Math.floor(q) - 0.5) > 0.12) pairs.push({ inner: a, outer: b }); }); });
          return r.chance(0.15) ? { inner: INNER[1], outer: OUTER[1] } : r.pick(pairs);
        },
        parts: [
          { id: '7a', level: 'EMG', make: function (r, s) {
            var A = sh(dec(s.inner.d), 6), B = sh(dec(s.outer.d), 9), chA = sciChk(A, { diag: cands([[sh(A, -6), 'scale', 'One million is ' + t('10^{6}') + ': ' + t(s.inner.d + '\\text{ million}=' + s.inner.d + '\\times 10^{6}') + '. Now renormalize.']]) }), chB = sciChk(B, { diag: cands([[sh(B, -3), 'scale', 'One <b>billion</b> is ' + t('10^{9}') + ', not ' + t('10^{6}') + '.'], [sh(B, -9), 'scale', 'One billion is ' + t('10^{9}') + ': ' + t(s.outer.d + '\\text{ billion}=' + s.outer.d + '\\times 10^{9}') + '.']]) });
            var p = P.fields('Write each distance in scientific notation (in km).', [{ name: s.inner.n, label: s.inner.n, mode: 'math', keys: 'sci', wide: true }, { name: s.outer.n, label: s.outer.n, mode: 'math', keys: 'sci', wide: true }],
              [chA, chB], [sciT(A), sciT(B)], s.inner.n + ': ' + t(sciT(A) + '\\text{ km}') + '<br>' + s.outer.n + ': ' + t(sciT(B) + '\\text{ km}'),
              s.inner.n + ': ' + t(s.inner.d + '\\text{ million km}=' + stdTex(A) + '\\text{ km}=') + '<b>' + t(sciT(A) + '\\text{ km}') + '</b>.<br>' + s.outer.n + ': ' + t(s.outer.d + '\\text{ billion km}=' + stdTex(B) + '\\text{ km}=') + '<b>' + t(sciT(B) + '\\text{ km}') + '</b>.',
              ['One million is ' + t('10^{6}') + ' and one billion is ' + t('10^{9}') + '. Write each number out in full first if that helps.', 'Then move the decimal point so the coefficient is at least ' + t('1') + ' and less than ' + t('10') + '.'], 'planet distances in sci notation');
            p.bad = [[sciT(sh(A, -6)), sciT(B)], [sciT(A), sciT(sh(B, -3))]];
            return p;
          } },
          { id: '7b', level: 'EMG', make: function (r, s) {
            var A = sh(dec(s.inner.d), 6), B = sh(dec(s.outer.d), 9), q = val(B) / val(A);
            var p = P.approx('About how many times as far from the Sun as ' + s.inner.n + ' is ' + s.outer.n + '? Round to the nearest whole number.', q, 0, {
              after: 'times', diag: function (v) {
                if (Math.abs(v - K.roundTo(1 / q, 3)) < 0.002 || (v > 0 && v < 1)) return { code: 'flip-ratio', hint: '“How many times as far” is the bigger distance divided by the smaller one: ' + s.outer.n + ' ÷ ' + s.inner.n + '.' };
                if (Math.abs(v - K.roundTo(q / 1000, 0)) < 1e-9 || Math.abs(v - K.roundTo(q * 1000, 0)) < 1e-9) return { code: 'scale', hint: 'A billion is a thousand million. Put both distances in scientific notation (in km) first, then divide.' };
                return null;
              } },
              t('\\dfrac{' + sciT(B) + '}{' + sciT(A) + '}=\\dfrac{' + std(coef(B)) + '}{' + std(coef(A)) + '}\\times 10^{' + sN(B) + '-' + sN(A) + '}\\approx ' + (q / P10(sN(B) - sN(A))).toFixed(3) + '\\times 10^{' + (sN(B) - sN(A)) + '}\\approx ' + q.toFixed(1)) + ', so about <b>' + t(K.roundTo(q, 0)) + '</b> times as far.',
              ['Divide the larger distance by the smaller one. Both must be in the same unit (km).', 'Divide the coefficients and subtract the exponents, then round.'], s.outer.n + '/' + s.inner.n + ' distance ratio');
            return p;
          } }] },
      { num: '8', section: 'Assignment — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'LIM', make: function (r) {
          var L = r.chance(0.15) ? LONG[0] : r.pick(LONG), d = dec(String(L[1])), n = sN(d);
          return P.mc(r, L[0] + ' ' + t(stdTex(d)) + ' ' + L[2] + '. When this number is written in scientific notation in the form ' + t('a\\times 10^{n}') + ', the value of ' + t('n') + ' is', [
            { html: t(n - 3), why: 'Count every place the decimal point moves to get to ' + t(std(coef(d))) + ' (just after the first digit), not just some of them.' },
            { html: t(n), right: true },
            { html: t(n + 1), why: 'That’s the number of digits. Count the <b>hops</b> the decimal point makes to sit just after the first digit — one fewer than the number of digits.' },
            { html: t(-n), why: 'A negative exponent is for numbers <b>less than 1</b>. This number is huge.' }],
            t(stdTex(d) + '=' + sciT(d)) + ': the decimal point moves ' + moveWords(d) + ', so ' + t('n=' + n) + '.', ['Write the number as ' + t(std(coef(d)) + '\\times 10^{n}') + '. How many places does the decimal point move?'], 'exponent of ' + std(d), true);
        } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'BEG', make: function (r) {
          var ctxs = [['In 2023, a certain film’s world-wide box office earnings were approximately', 4], ['A video game’s first-year sales were approximately', 4], ['Canada’s maple syrup exports in one year were worth approximately', 3], ['A city’s yearly budget is approximately', 4]];
          var c = r.pick(ctxs), X = c[1] === 4 ? mant(r, 3) * 10 : mant(r, 3); if (r.chance(0.15)) { c = ctxs[0]; X = 2320; }
          var dg = String(X).length, d = sh(dec(String(X)), 6), cf = std(coef(d)), ks = [dg - 1, 6, dg + 5, dg + 8];
          var opts = ks.map(function (k) { return { html: t(cf + '\\times 10^{' + k + '}'), right: k === dg + 5,
            why: k === dg - 1 ? 'That is only ' + t(F(X)) + '. The amount is ' + t(F(X)) + ' <b>million</b> dollars, so multiply by ' + t('10^{6}') + ' as well.' : k === 6 ? 'That would be ' + t(cf) + ' million. Write ' + t(F(X)) + ' itself in scientific notation first, then multiply by ' + t('10^{6}') + '.' : k === dg + 8 ? 'One million is ' + t('10^{6}') + ' (six zeros), not ' + t('10^{9}') + '.' : null }; });
          return P.mc(r, c[0] + ' ' + t(F(X)) + ' million dollars. In scientific notation, the number of dollars is', opts,
            t(F(X) + '\\text{ million}=' + F(X) + '\\times 10^{6}=' + cf + '\\times 10^{' + (dg - 1) + '}\\times 10^{6}=' + sciT(d)) + ' dollars.', ['One million is ' + t('10^{6}') + '. Write ' + t(F(X)) + ' in scientific notation, then use the product law.'], F(X) + ' million in sci', true);
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var v = find(r, function () { var a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9); return { a: a, b: b, c: c, x: -r.int(3, 7), y: r.int(2, 6), n: r.int(2, 7) }; },
            function (v) { var ab = v.a * v.b; return ab >= 10 && ab % v.c === 0 && ab / v.c <= 9 && v.c !== ab / v.c && v.a !== v.b && v.c !== v.a && v.c !== v.b; }, { a: 8, b: 3, c: 6, x: -5, y: 4, n: 5 });
          var ab = v.a * v.b, d = ab / v.c, z = v.x + v.y - v.n, n = v.n;
          var opts = [-n, n, -(n + 1), n + 1].map(function (k) { return { html: t(k), right: k === n, why: k === -n ? 'Check the sign when you solve for ' + t('n') + ': ' + t('10^{' + v.x + '+' + v.y + '}\\div 10^{n}=10^{' + (v.x + v.y) + '-n}') + '.' : 'Watch the coefficients: ' + t(v.a + '\\times ' + v.b + '=' + ab) + ' and ' + t(ab + '\\div ' + v.c + '=' + d) + ' exactly, so no extra power of ' + t('10') + ' is needed.' }; });
          return P.mc(r, t('p=' + v.a + '\\times 10^{' + v.x + '}') + ' and ' + t('q=' + v.b + '\\times 10^{' + v.y + '}') + '. If ' + t('r=' + v.c + '\\times 10^{n}') + ' and ' + t('\\dfrac{pq}{r}=' + d + '\\times 10^{' + z + '}') + ', then ' + t('n') + ' is equal to', opts,
            t('pq=(' + v.a + '\\times 10^{' + v.x + '})(' + v.b + '\\times 10^{' + v.y + '})=' + ab + '\\times 10^{' + (v.x + v.y) + '}') + '.<br>' + t('\\dfrac{pq}{r}=\\dfrac{' + ab + '\\times 10^{' + (v.x + v.y) + '}}{' + v.c + '\\times 10^{n}}=' + d + '\\times 10^{' + (v.x + v.y) + '-n}') + '. Setting this equal to ' + t(d + '\\times 10^{' + z + '}') + ' gives ' + t((v.x + v.y) + '-n=' + z) + ', so ' + t('n=' + n) + '.',
            ['Multiply ' + t('p') + ' and ' + t('q') + ' first, then divide by ' + t('r') + ' using the quotient law.', 'Match the exponents of ' + t('10') + ' on both sides and solve for ' + t('n') + '.'], 'solve pq/r for n', true);
        } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var c = r.int(4, 9), m = r.int(1, 4); if (r.chance(0.15)) { c = 8; m = 1; }
          var dist = sh(D(3 * c, 0), m + 8), dm = sN(dist), what = ['A space probe', 'A space probe', 'A spacecraft', 'A distant probe'][m - 1], sig = ['a radio signal', 'a radio signal', 'a laser pulse', 'a radio signal'][m - 1];
          var ans = c + m, a0 = std(div(coef(dist), D(3, 0)));
          return P.nr('The speed of light is ' + t('3\\times 10^{8}') + ' m/s. ' + what + ' is ' + t(sciT(dist)) + ' m from Earth. If the time, in seconds, for ' + sig + ' to travel this distance is expressed in scientific notation in the form ' + t('a\\times 10^{n}') + ', the value of ' + t('a+n') + ' is ________.', ans, function (v) {
            if (Math.abs(v - (Number(a0) + m + 1)) < 1e-9) return { code: 'no-renorm', hint: 'Check the coefficient: ' + t(std(coef(dist)) + '\\div 3=' + a0) + ' is less than ' + t('1') + ', so renormalize before you read off ' + t('a') + ' and ' + t('n') + '.' };
            if (v === c + m + 1) return { code: 'renorm-dir', hint: 'When the coefficient goes from ' + t(a0) + ' up to ' + t(c) + ', the exponent must go <b>down</b> by ' + t('1') + '.' };
            var mu = 3 * val(coef(dist)), me = dm + 8 + (mu >= 10 ? 1 : 0), ma = mu >= 10 ? mu / 10 : mu;
            if (Math.abs(v - (ma + me)) < 1e-6) return { code: 'mult-coef', hint: 'Time = distance ÷ speed. Divide, don’t multiply.' };
            return null;
          }, 'Time ' + t('=') + ' distance ' + t('\\div') + ' speed ' + t('=\\dfrac{' + sciT(dist) + '}{3\\times 10^{8}}=' + a0 + '\\times 10^{' + (dm - 8) + '}=' + c + '\\times 10^{-1}\\times 10^{' + (dm - 8) + '}=' + c + '\\times 10^{' + m + '}') + ' s.<br>So ' + t('a=' + c) + ', ' + t('n=' + m) + ' and ' + t('a+n=' + ans) + '.',
          ['Time = distance ÷ speed. Divide the coefficients and subtract the exponents.', 'Make sure the coefficient is between ' + t('1') + ' and ' + t('10') + ' before you read off ' + t('a') + ' and ' + t('n') + '.'], 'light travel time a+n');
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Both directions, and the sign of the exponent', stem: 'Write each number in scientific notation. Keep every significant figure — nothing here is rounded.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(304, -8) : S(Number(r.int(1, 9) + '0' + r.int(1, 9)), -r.int(5, 7))); } },
        { id: 'e1b', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(85, -10) : S(mant(r, 2), -r.int(8, 10))); } },
        { id: 'e1c', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(407, 12) : S(Number(r.int(1, 9) + '0' + r.int(1, 9)), r.int(12, 14))); } },
        { id: 'e1d', level: 'EMG', make: function (r) { return toSci(r.chance(0.15) ? D(10203, -5) : S(Number(r.int(1, 9) + '0' + r.int(1, 9) + '0' + r.int(1, 9)), -r.int(1, 2))); } },
        { id: 'e1e', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(999, -6) : S(r.pick([999, 998, 995, 99, 909]), -r.int(3, 5))); } },
        { id: 'e1f', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(607, 4) : S(Number(r.int(1, 9) + '0' + r.int(1, 9)), r.int(5, 7))); } },
        { id: 'e1g', level: 'BEG', make: function (r) { return toSci(r.chance(0.15) ? D(5, -2) : S(r.int(1, 9), -r.int(1, 3))); } },
        { id: 'e1h', level: 'BEG', make: function (r) { return toSci(D(1, r.chance(0.15) ? 12 : r.int(9, 13))); } }] },
      { num: '2', stem: 'Write each number in standard notation. Watch the negative exponents — they move the decimal point the other way.', parts: [
        { id: 'e2a', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(706, -9) : S(Number(r.int(1, 9) + '0' + r.int(1, 9)), -r.int(5, 7))); } },
        { id: 'e2b', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(12, -2) : S(mant(r, 2), -1)); } },
        { id: 'e2c', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(9003, 2) : S(Number(r.int(1, 9) + '00' + r.int(1, 9)), r.int(4, 6))); } },
        { id: 'e2d', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(5, -6) : S(r.int(1, 9), -r.int(4, 7))); } },
        { id: 'e2e', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(325, -6) : S(mant(r, 3), -r.int(3, 5))); } },
        { id: 'e2f', level: 'BEG', make: function (r) { return toStd(r.chance(0.15) ? D(6401, 6) : S(Number(String(r.int(1, 9)) + r.int(1, 9) + '0' + r.int(1, 9)), r.int(8, 10))); } }] },
      { num: '3', stem: function (s) { return 'These numbers are all built from the same digits (and the last one is the special case): ' + s.items.map(function (d) { return t(stdTex(d)); }).join(', ') + '.'; },
        shared: function (r) {
          var m = r.chance(0.15) ? 805 : Number(r.int(1, 9) + '' + r.int(0, 9) + r.int(1, 9));
          var ns = r.chance(0.15) ? [-2, 0, 1, 5, -6] : [-r.int(1, 3), 0, r.int(1, 2), r.int(4, 6), -r.int(5, 7)];
          return { items: ns.map(function (n) { return S(m, n); }).concat([D(1, 0)]) };
        },
        parts: [
          { id: 'e3a', level: 'LIM', make: function (r, s) {
            var rows = s.items.map(function (d, i) { return { id: 'r' + i, html: t(stdTex(d)) }; }), cols = [{ id: 'pos', html: 'positive' }, { id: 'neg', html: 'negative' }, { id: 'zero', html: 'zero' }], want = {};
            s.items.forEach(function (d, i) { var n = sN(d); want['r' + i] = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero'; });
            return P.grid('<b>Before</b> converting: will the exponent in scientific notation be positive, negative or zero?', rows, cols, want, { colHead: 'Exponent', why: function (row) { var d = s.items[Number(row.slice(1))]; return val(d) < 1 ? t(stdTex(d)) + ' is less than ' + t('1') + ': the exponent is negative.' : val(d) >= 10 ? t(stdTex(d)) + ' is ' + t('10') + ' or more: the exponent is positive.' : t(stdTex(d)) + ' is already between ' + t('1') + ' and ' + t('10') + ': the exponent is zero.'; } },
              'Rule: a number that is ' + t('10') + ' or more has a <b>positive</b> exponent; a number below ' + t('1') + ' has a <b>negative</b> exponent; a number from ' + t('1') + ' up to (not including) ' + t('10') + ' has exponent <b>zero</b>.', ['Compare each number with ' + t('1') + ' and with ' + t('10') + '.'], 'predict exponent sign');
          } },
          { id: 'e3b', level: 'EMG', make: function (r, s) {
            var fields = s.items.map(function (d) { return { name: t(stdTex(d)), label: t(stdTex(d)), before: t('='), mode: 'math', keys: 'sci', wide: true }; });
            var p = P.fields('Now write each number in scientific notation.', fields, s.items.map(function (d) { return sciChk(d, { diag: cands([signDiag(d)].filter(Boolean)) }); }), s.items.map(sciT),
              s.items.map(function (d) { return t(stdTex(d) + '=' + sciT(d)); }).join('<br>'),
              s.items.map(function (d) { var n = sN(d); return t(stdTex(d)) + ': ' + (n ? 'move ' + moveWords(d) : 'no move needed') + ', so ' + t(sciT(d)) + '.'; }).join('<br>') + '<br>A number already between ' + t('1') + ' and ' + t('10') + ' is written with ' + t('\\times 10^{0}') + ' (since ' + t('10^{0}=1') + ').',
              SCI_HINTS.concat(['For a number already between ' + t('1') + ' and ' + t('10') + ', the decimal point doesn’t move: use ' + t('10^{0}') + '.']), 'same digits, many exponents');
            p.bad = [s.items.map(function (d) { return sciT(d).replace(/\{(-?\d+)\}/, function (m0, e) { return '{' + (-Number(e) || 1) + '}'; }); })];
            return p;
          } }] },
      { num: '4', section: 'Extra practice B — Getting the coefficient back into range', stem: 'None of these is in scientific notation, because the coefficient does not satisfy ' + t('1\\le a<10') + '. Rewrite each correctly. The <i>value</i> must not change.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) { var k = r.int(3, 8); return r.chance(0.15) ? fixPart(D(45, 4), 6) : fixPart(S(mant(r, 2), k - 1), k); } },
        { id: 'e4b', level: 'EMG', make: function (r) { var k = -r.int(6, 10); return r.chance(0.15) ? fixPart(D(127, -9), -9) : fixPart(S(mant(r, 3), k + 2), k); } },
        { id: 'e4c', level: 'EMG', make: function (r) { var k = r.int(2, 4); return r.chance(0.15) ? fixPart(D(72, -1), 3) : fixPart(S(mant(r, 2), k - 3), k); } },
        { id: 'e4d', level: 'EMG', make: function (r) { var k = -r.int(10, 14); return r.chance(0.15) ? fixPart(D(845, -11), -12) : fixPart(S(Number(mant(r, 3) + '0'), k + 3), k); } },
        { id: 'e4e', level: 'EMG', make: function (r) { var k = -r.int(3, 6); return r.chance(0.15) ? fixPart(D(31, -9), -4) : fixPart(S(mant(r, 2), k - 4), k); } },
        { id: 'e4f', level: 'EMG', make: function (r) { return r.chance(0.15) ? fixPart(D(963, -1), 0) : fixPart(S(mant(r, 3), 1), 0); } }] },
      { num: '5', stem: 'Each line is a true statement once the missing exponent is filled in. Find it.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) { var k = r.int(3, 7), m = mant(r, 2), s = r.int(2, 3); if (r.chance(0.15)) { k = 5; m = 36; s = 3; } return missingN(S(m, s), k); } },
        { id: 'e5b', level: 'EMG', make: function (r) { var k = -r.int(1, 5), m = mant(r, 2), s = -3; if (r.chance(0.15)) { k = -2; m = 47; } return missingN(S(m, s), k); } },
        { id: 'e5c', level: 'EMG', make: function (r) { var k = -r.int(4, 9), m = mant(r, 2); if (r.chance(0.15)) { k = -7; m = 52; } return missingN(S(m, 1), k); } },
        { id: 'e5d', level: 'PRG', make: function (r) {
          var s = r.chance(0.4) ? -1 : r.pick([-2, 1, 2]), dgt = r.chance(0.3) ? 9 : r.int(2, 9), C = S(dgt, s), shown = stdTex(C), c = s;
          var p = P.math(t(shown + '\\times 10^{k}=' + dgt + '\\times 10^{n}') + ' for every integer ' + t('k') + '. Give ' + t('n') + ' in terms of ' + t('k') + '.', linChk(c), 'k' + (c < 0 ? c : '+' + c),
            t(shown + '\\to ' + dgt) + ' moves the decimal point ' + t(Math.abs(s)) + ' place' + (Math.abs(s) === 1 ? '' : 's') + ' ' + (s < 0 ? 'right' : 'left') + ', so the coefficient is ' + t(P10(Math.abs(s))) + ' times ' + (s < 0 ? 'larger' : 'smaller') + ' and the exponent must be ' + t(Math.abs(s)) + ' ' + (s < 0 ? 'smaller' : 'larger') + ':<br>' + t('n=k' + (c < 0 ? c : '+' + c)) + '. Check: ' + t(dgt + '\\times 10^{k' + (c < 0 ? c : '+' + c) + '}=' + dgt + '\\times 10^{' + c + '}\\times 10^{k}=' + shown + '\\times 10^{k}') + '.',
            ['Try a number for ' + t('k') + ', say ' + t('k=5') + ': what is ' + t('n') + '? Then try ' + t('k=8') + '.', 'Moving the decimal point to the right makes the coefficient bigger, so the exponent must get smaller.'], 'n in terms of k: ' + std(C), { keys: 'expo', vars: ['k'], before: t('n=') });
          p.good = ['k' + (c < 0 ? ' - ' + (-c) : ' + ' + c), (c < 0 ? c + '+k' : c + '+k')];
          p.bad = ['k' + (c < 0 ? '+' + (-c) : '-' + c), String(c), 'k'];
          return p;
        } },
        { id: 'e5e', level: 'BEG', make: function (r) {
          return P.mc(r, '<b>State the rule.</b> When the decimal point in the coefficient moves one place to the <b>left</b>, what happens to the exponent? And one place to the <b>right</b>?', [
            { html: 'Left: the exponent goes <b>up</b> by 1. Right: it goes <b>down</b> by 1.', right: true },
            { html: 'Left: the exponent goes <b>down</b> by 1. Right: it goes <b>up</b> by 1.', why: 'Try it: ' + t('52\\times 10^{-7}=5.2\\times 10^{?}') + '. Moving left made the coefficient 10 times <b>smaller</b>, so the power of 10 must be 10 times <b>bigger</b>.' },
            { html: 'The exponent doesn’t change — only the coefficient does.', why: 'Then the value would change: ' + t('5.2\\times 10^{3}') + ' is not equal to ' + t('52\\times 10^{3}') + '.' },
            { html: 'Either way the exponent goes up by 1, because the decimal point moved.', why: 'The direction matters. Check with ' + t('0.47\\times 10^{2}=47') + ' and ' + t('4.7\\times 10^{?}=47') + '.' }],
            'Moving the decimal point one place <b>left</b> makes the coefficient 10 times smaller, so the exponent goes <b>up by 1</b>; moving it one place <b>right</b> makes the coefficient 10 times larger, so the exponent goes <b>down by 1</b>. The value never changes.', ['Test the rule on an example you can check, like ' + t('52\\times 10^{0}=5.2\\times 10^{1}') + '.'], 'renormalizing rule');
        } }] },
      { num: '6', section: 'Extra practice C — Multiplying and dividing, then renormalizing', stem: 'Multiply or divide, then check that the coefficient satisfies ' + t('1\\le a<10') + '. Write each result in scientific notation.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(c1(r), -r.int(2, 6)), A_(c1(r), -r.int(5, 10))]; }, function (v) { return v[0].c.m * v[1].c.m >= 10 && (v[0].c.m * v[1].c.m) % 10 !== 0; }, [A_('6', -4), A_('8', -9)]); return opPart(v[0], v[1], 'mul'); } },
        { id: 'e6b', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(c2(r), r.int(5, 9)), A_(c2(r), -r.int(2, 5))]; }, function (v) { var C = mul(v[0].c, v[1].c); return val(C) >= 10 && nd(C) <= 2; }, [A_('2.5', 7), A_('9.2', -3)]); return opPart(v[0], v[1], 'mul'); } },
        { id: 'e6c', level: 'PRG', make: function (r) { var v = find(r, function () { var Q = D(r.int(1, 9), -1), B = c1(r); return [A_(mul(Q, B), -r.int(3, 7)), A_(B, r.int(1, 4))]; }, function (v) { return inRange(v[0].c) && nd(v[0].c) === 2; }, [A_('3.6', -5), A_('9', 2)]); return opPart(v[0], v[1], 'div'); } },
        { id: 'e6d', level: 'EMG', make: function (r) { var v = find(r, function () { var Q = c2(r), B = c2(r); return [A_(mul(Q, B), -r.int(2, 5)), A_(B, -r.int(6, 9))]; }, function (v) { return inRange(v[0].c) && nd(v[0].c) === 3 && val(v[0].c) >= val(v[1].c); }, [A_('1.44', -3), A_('1.2', -8)]); return opPart(v[0], v[1], 'div'); } },
        { id: 'e6e', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(c2(r), -r.int(3, 7)), A_(c1(r), -r.int(4, 8))]; }, function (v) { var C = mul(v[0].c, v[1].c); return val(C) >= 10 && nd(C) === 1; }, [A_('7.5', -6), A_('4', -7)]); return opPart(v[0], v[1], 'mul'); } },
        { id: 'e6f', level: 'EMG', make: function (r) { var v = find(r, function () { var Q = c1(r), B = c2(r); return [A_(mul(Q, B), r.int(8, 12)), A_(B, -r.int(2, 5))]; }, function (v) { return inRange(v[0].c) && nd(v[0].c) === 2; }, [A_('8.1', 11), A_('2.7', -4)]); return opPart(v[0], v[1], 'frac'); } }] },
      { num: '7', stem: 'A power of a number in scientific notation raises <b>both</b> the coefficient and the power of ten. Evaluate each, and renormalize where you need to.', parts: [
        { id: 'e7a', level: 'PRG', make: function (r) { return r.chance(0.15) ? powPart(5, 6, 2) : powPart(r.int(4, 9), r.int(3, 8), 2); } },
        { id: 'e7b', level: 'EMG', make: function (r) { return r.chance(0.15) ? powPart(2, -3, 3) : r.chance(0.5) ? powPart(2, -r.int(2, 6), 3) : powPart(r.int(2, 3), -r.int(2, 6), 2); } },
        { id: 'e7c', level: 'PRG', make: function (r) { return r.chance(0.15) ? powPart(4, -5, 2) : powPart(r.int(4, 9), -r.int(2, 7), 2); } },
        { id: 'e7d', level: 'PRG', make: function (r) { return r.chance(0.15) ? powPart(3, 8, 3) : powPart(r.int(3, 5), r.int(3, 9), 3); } }] },
      { num: '8', stem: 'Two operations in one expression. Simplify the top and the bottom separately, then divide; write every result in scientific notation.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(c1(r), r.int(3, 7)), A_(c1(r), -r.int(1, 4)), A_(c1(r), r.int(2, 6))]; }, function (v) { var T = mul(v[0].c, v[1].c), Q = div(T, v[2].c); return val(T) >= 10 && Q && nd(Q) <= 2 && v[2].c.m !== v[0].c.m && v[2].c.m !== v[1].c.m; }, [A_('8', 5), A_('3', -2), A_('6', 4)]); return twoOp(v, 'frac'); } },
        { id: 'e8b', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(c2(r), -r.int(2, 5)), A_(c1(r), r.int(5, 9)), A_(c2(r), r.int(6, 10))]; }, function (v) { var T = mul(v[0].c, v[1].c), Q = div(T, v[2].c); return Q && nd(Q) <= 2 && nd(T) <= 2; }, [A_('1.2', -3), A_('5', 7), A_('2.4', 9)]); return twoOp(v, 'frac'); } },
        { id: 'e8c', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(r.pick([D(25, -1), D(15, -1), D(12, -1), D(35, -1), D(45, -1), D(3, 0), D(6, 0)]), -r.int(3, 7)), null, A_(c1(r), -r.int(5, 10))]; }, function (v) { var T = pw(v[0].c, 2), Q = div(T, v[2].c); return Q && nd(Q) <= 3; }, [A_('2.5', -6), null, A_('5', -9)]); return twoOp(v, 'sq'); } },
        { id: 'e8d', level: 'PRG', make: function (r) { var v = find(r, function () { return [A_(c1(r), -r.int(1, 4)), A_(c1(r), r.int(3, 7)), A_(c2(r), -r.int(2, 6))]; }, function (v) { var T = mul(v[0].c, v[1].c), Q = div(T, v[2].c); return val(T) >= 10 && Q && nd(Q) <= 2 && val(v[2].c) < 5; }, [A_('6', -2), A_('4', 5), A_('1.5', -4)]); return twoOp(v, 'inline'); } }] },
      { num: '9', section: 'Extra practice D — Adding and subtracting (beyond the booklet)', stem: 'Adding and subtracting don’t work term by term: first rewrite both numbers over a <b>common power of ten</b> (usually the larger one), then add or subtract the coefficients and renormalize if needed. For example ' + t('5.2\\times 10^{6}+4\\times 10^{5}=5.2\\times 10^{6}+0.4\\times 10^{6}=5.6\\times 10^{6}') + '.', parts: [
        { id: 'e9a', level: 'EMG', make: function (r) { var v = find(r, function () { var k = r.int(3, 8); return [S(nz(r, 11, 99), k), '+', S(nz(r, 11, 99), k)]; }, function (v) { var s = add(v[0], v[2]); return sN(s) > sN(v[0]) && nd(s) <= 3; }, [D(34, 4), '+', D(81, 4)]); return addPart(v); } },
        { id: 'e9b', level: 'PRG', make: function (r) { var v = find(r, function () { var k = -r.int(2, 5); return [S(nz(r, 11, 99), k), '+', S(nz(r, 11, 99), k - 1)]; }, function (v) { var s = add(v[0], v[2]); return sN(s) === sN(v[0]); }, [D(72, -4), '+', D(45, -5)]); return addPart(v); } },
        { id: 'e9c', level: 'PRG', make: function (r) { var v = find(r, function () { var k = r.int(5, 9); return [S(nz(r, 11, 99), k), '-', S(nz(r, 11, 99), k - 1)]; }, function (v) { var s = sub(v[0], v[2]); return sN(s) === sN(v[0]); }, [D(96, 7), '-', D(48, 6)]); return addPart(v); } },
        { id: 'e9d', level: 'PRG', make: function (r) { var v = find(r, function () { var k = -r.int(3, 7), m = nz(r, 11, 99); return [S(m, k), '-', S(m, k - 1)]; }, function (v) { return val(coef(v[0])) >= 1.2; }, [D(25, -7), '-', D(25, -8)]); return addPart(v); } }] },
      { num: '10', stem: function (s) { return 'Combine each over the <b>larger</b> power of ten, as in Question 9. Some of the results then need renormalizing.'; },
        shared: function (r) {
          var a = find(r, function () { var k = r.int(3, 6), x = nz(r, 11, 89); return [S(x, k), '+', S(nz(r, 11, 99), k)]; }, function (v) { var s = add(v[0], v[2]); return sN(s) === sN(v[0]) && nd(s) <= 2; }, [D(63, 3), '+', D(27, 3)]);
          var b = find(r, function () { var k = -r.int(1, 4); return [S(nz(r, 11, 19), k), '-', S(nz(r, 51, 99), k - 1)]; }, function (v) { var s = sub(v[0], v[2]); return val(s) > 0 && sN(s) < sN(v[0]); }, [D(14, -3), '-', D(96, -4)]);
          var c = find(r, function () { var k = r.int(6, 10), x = r.pick([875, 625, 750, 550, 325, 450]); return [S(x, k), '+', S(1000 - x, k)]; }, function () { return true; }, [D(875, 7), '+', D(125, 7)]);
          var d = find(r, function () { var k = -r.int(3, 6); return [S(r.int(5, 9), k), '+', S(r.int(3, 9), k), '+', S(r.int(1, 9), k - 2)]; }, function (v) { return val(coef(v[0])) + val(coef(v[2])) >= 10; }, [D(8, -5), '+', D(3, -5), '+', D(4, -7)]);
          return { list: [a, b, c, d] };
        },
        parts: [
          { id: 'e10a', level: 'EMG', make: function (r, s) { return addPart(s.list[0]); } },
          { id: 'e10b', level: 'PRG', make: function (r, s) { return addPart(s.list[1]); } },
          { id: 'e10c', level: 'EMG', make: function (r, s) { return addPart(s.list[2]); } },
          { id: 'e10d', level: 'PRG', make: function (r, s) { return addPart(s.list[3]); } },
          { id: 'e10e', level: 'EMG', make: function (r, s) {
            var whyR = ['', 'The coefficient left over is less than ' + t('1') + ', so it does need renormalizing.', 'The coefficients add up to exactly ' + t('10') + ', and ' + t('10') + ' is not less than ' + t('10') + ' — it needs renormalizing.', 'The coefficients add up to more than ' + t('10') + ', so it needs renormalizing.'];
            return P.mc(r, 'Which one of these did <b>not</b> need renormalizing after combining?', s.list.map(function (v, i) { return { html: t(addTex(v)), right: i === 0, why: whyR[i] || null }; }),
              s.list.map(function (v) { var raw = addRaw(v); return t(addTex(v) + '=' + pt(raw.c, raw.k)) + (inRange(raw.c) ? ' — already in range.' : ' — renormalize: ' + t(sciT(raw.v)) + '.'); }).join('<br>'),
              ['Combine each one over the larger power of ten. Is the coefficient you get at least ' + t('1') + ' and less than ' + t('10') + '?'], 'which did not need renormalizing');
          } }] },
      { num: '11', stem: function (s) { return 'A student writes: “To add, add the coefficients and add the exponents — same as multiplying.”'; },
        shared: function (r) { return r.chance(0.15) ? { c: 3, n: 4 } : { c: r.int(1, 4), n: r.int(2, 7) }; },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, s) {
            var tex = s.c + '\\times 10^{' + s.n + '}+' + s.c + '\\times 10^{' + s.n + '}', stu = S(2 * s.c, 2 * s.n), cor = S(2 * s.c, s.n);
            var p = P.fields('Test the claim on ' + t(tex) + '. What does the student get, and what is the correct answer?', [{ name: 'Student’s answer', label: 'Student gets', mode: 'math', keys: 'sci', wide: true }, { name: 'Correct answer', label: 'Correct answer', mode: 'math', keys: 'sci', wide: true }],
              [sciChk(stu, { diag: cands([[cor, 'mix', 'That’s the <b>correct</b> sum. What does the student’s rule (add the exponents too) give?']]) }), sciChk(cor, { diag: cands([[stu, 'add-exps-sum', 'That is the student’s answer. The powers of ten already match, so just add the coefficients: ' + t('(' + s.c + '+' + s.c + ')\\times 10^{' + s.n + '}') + '.']]) })],
              [sciT(stu), sciT(cor)], 'Student: ' + t(sciT(stu)) + '<br>Correct: ' + t(sciT(cor)),
              'Student: ' + t(s.c + '+' + s.c + '=' + 2 * s.c) + ' and ' + t(s.n + '+' + s.n + '=' + 2 * s.n) + ', giving ' + t(sciT(stu) + '=' + stdTex(stu)) + '.<br>Correct: the powers already match, so ' + t('(' + s.c + '+' + s.c + ')\\times 10^{' + s.n + '}=') + '<b>' + t(sciT(cor)) + '</b> ' + t('=' + stdTex(cor)) + '. The student’s answer is ' + t('10^{' + s.n + '}') + ' times too big.',
              ['Follow the student’s rule exactly for the first box.', 'For the correct answer, think of ' + t('10^{' + s.n + '}') + ' as a unit, like adding 3 apples and 3 apples.'], 'test the add-the-exponents claim');
            p.bad = [[sciT(cor), sciT(cor)], [sciT(stu), sciT(stu)]];
            return p;
          } },
          { id: 'e11b', level: 'EMG', make: function (r) {
            return P.mc(r, '<b>Explain</b> why multiplying numbers in scientific notation needs no common power of ten, but adding does.', [
              { html: 'Multiplying uses the law ' + t('10^{m}\\times 10^{n}=10^{m+n}') + ', which works for any ' + t('m') + ' and ' + t('n') + '. There is no such law for ' + t('10^{m}+10^{n}') + ': different powers of ten are different-sized units, so they must match before the coefficients can be combined.', right: true },
              { html: 'Adding needs a common power of ten only because the answer must be in scientific notation.', why: 'Even without scientific notation, ' + t('3\\times 10^{4}+3\\times 10^{2}') + ' is not ' + t('6\\times 10^{\\text{anything simple}}') + ' — the two terms count different-sized units.' },
              { html: 'Multiplying also needs a common power of ten; we just usually skip that step.', why: 'Try ' + t('(2\\times 10^{3})(3\\times 10^{5})') + ': the product law gives ' + t('6\\times 10^{8}') + ' directly, no matching needed.' },
              { html: 'For adding, you multiply the exponents instead of adding them.', why: 'No law combines exponents when you add. Try ' + t('10^{2}+10^{3}=100+1000') + '.' }],
              'Multiplication has the product law ' + t('10^{m}\\times 10^{n}=10^{m+n}') + '. Addition has no such law — ' + t('10^{m}') + ' and ' + t('10^{n}') + ' are different-sized units, so (as with fractions and a common denominator) both numbers are first written over the <b>same</b> power of ten.', ['Try a small example both ways, e.g. ' + t('10^{2}\\times 10^{3}') + ' and ' + t('10^{2}+10^{3}') + '.'], 'why adding needs a common power');
          } },
          { id: 'e11c', level: 'PRG', make: function (r) {
            return P.mc(r, 'Is ' + t('a\\times 10^{n}+a\\times 10^{n}') + ' ever equal to ' + t('2a\\times 10^{2n}') + ' (for ' + t('a\\ne 0') + ')?', [
              { html: 'Yes, but only when ' + t('n=0') + '.', right: true },
              { html: 'Never.', why: 'Try ' + t('n=0') + ': both sides become ' + t('2a') + '.' },
              { html: 'Always — that is how you add powers.', why: 'Test ' + t('3\\times 10^{4}+3\\times 10^{4}') + ': the true sum is ' + t('6\\times 10^{4}') + ', not ' + t('6\\times 10^{8}') + '.' },
              { html: 'Only when ' + t('n=1') + '.', why: 'With ' + t('n=1') + ': ' + t('2a\\times 10^{1}') + ' vs ' + t('2a\\times 10^{2}') + ' — not equal.' }],
              'The true sum is ' + t('a\\times 10^{n}+a\\times 10^{n}=2a\\times 10^{n}') + '. This equals ' + t('2a\\times 10^{2n}') + ' only when ' + t('10^{2n}=10^{n}') + ', i.e. ' + t('2n=n') + ', so <b>only when ' + t('n=0') + '</b>.', ['Write the true sum first, then compare the powers of ten.'], 'when is the add-exponents rule right');
          } }] },
      { num: '12', section: 'Extra practice E — Comparing and ordering', stem: 'Order each set from <b>least to greatest</b>. Compare the exponents first; only compare coefficients when the exponents tie.', parts: [
        { id: 'e12a', level: 'EMG', make: function (r) { return r.chance(0.15) ? orderPart(r, -6, [[87, 0], [99, 0], [2, 1], [42, 1], [13, 2]]) : orderPart(r, -r.int(4, 7), null); } },
        { id: 'e12b', level: 'EMG', make: function (r) { return r.chance(0.15) ? orderPart(r, 6, [[98, 0], [305, 1], [31, 1], [11, 2], [29, 2]]) : orderPart(r, r.int(5, 8), null, true); } }] },
      { num: '13', stem: '', parts: [
        { id: 'e13a', level: 'BEG', make: function (r) {
          var k = -r.int(2, 6), bm = nz(r, 51, 99), sm = nz(r, 11, bm - 1);
          if (r.chance(0.15)) { k = -4; bm = 63; sm = 59; }
          var A = D(bm, -1), B = D(sm, -1), aT = std(A) + '\\times 10^{' + k + '}', bT = std(B) + '\\times 10^{' + (k + 1) + '}';
          return P.mc(r, 'Which is larger, ' + t(aT) + ' or ' + t(bT) + '?', [
            { html: t(bT) + ' — its exponent is larger, and one step in the exponent is a factor of ' + t('10') + ', more than any difference in the coefficients can make up.', right: true },
            { html: t(aT) + ' — its coefficient is larger.', why: 'Compare the exponents first: ' + t((k + 1) + '>' + k) + '. The coefficient only matters when the exponents are equal.' },
            { html: t(aT) + ' — because ' + t(-k) + ' is greater than ' + t(-(k + 1)) + '.', why: 'The exponents are <b>negative</b>: ' + t(k) + ' is <b>less</b> than ' + t(k + 1) + '. Write both in standard notation to check.' },
            { html: 'They are equal.', why: 'Write both in standard notation: ' + t(stdTex(sh(A, k)) + '\\text{ and }' + stdTex(sh(B, k + 1))) + '.' }],
            'Exponents: ' + t((k + 1) + '>' + k) + ', so ' + t(bT) + ' is larger (' + t(stdTex(sh(B, k + 1)) + '>' + stdTex(sh(A, k))) + '). With both coefficients between ' + t('1') + ' and ' + t('10') + ', one step in the exponent (a factor of ' + t('10') + ') beats any difference in the coefficients.', ['Compare the exponents first. Which is bigger, ' + t(k) + ' or ' + t(k + 1) + '?'], 'compare sci numbers');
        } },
        { id: 'e13b', level: 'EMG', make: function (r) {
          var m = r.chance(0.15) ? 52 : nz(r, 11, 99), k = r.chance(0.15) ? -4 : -r.int(3, 6), a = S(m, k), b = S(m, k + 1), cT = String(m) + '\\times 10^{' + (k - 1) + '}', aT = stdTex(a), bT = sciT(b);
          return P.mc(r, 'Put ' + t(aT) + ', ' + t(bT) + ' and ' + t(cT) + ' in order from least to greatest. (Two of the three are equal.)', [
            { html: t(aT + '=' + cT + '<' + bT), right: true },
            { html: t(aT + '<' + cT + '<' + bT), why: 'Rewrite ' + t(cT) + ' in scientific notation: ' + t(sciT(a)) + '. Compare it with ' + t(aT) + '.' },
            { html: t(bT + '<' + aT + '=' + cT), why: 'Write ' + t(aT) + ' in scientific notation: ' + t(sciT(a)) + '. Its exponent is ' + t(k) + ', smaller than ' + t(k + 1) + '.' },
            { html: t(aT + '<' + bT + '=' + cT), why: 'Rewrite ' + t(cT) + ' in scientific notation: ' + t(String(m) + '=' + std(coef(D(m, 0))) + '\\times 10^{1}') + ', so the exponent goes up by ' + t('1') + ' to ' + t(k) + '.' }],
            'Write all three in scientific notation: ' + t(aT + '=' + sciT(a)) + ', ' + t(cT + '=' + sciT(a)) + ', and ' + t(bT) + '.<br>So ' + t(aT + '=' + cT + '<' + bT) + ': the first and third are equal.', ['Write all three in scientific notation first.'], 'order with an equal pair');
        } },
        { id: 'e13c', level: 'EMG', make: function (r) {
          var rows = [], want = {}, cols = [{ id: 'lt', html: t('<') }, { id: 'eq', html: t('=') }, { id: 'gt', html: t('>') }], items = [];
          var m1 = nz(r, 11, 99), k1 = r.int(3, 7); items.push([std(coef(D(m1, 0))) + '\\times 10^{' + k1 + '}', m1 + '\\times 10^{' + (k1 - 1) + '}', 'eq']);
          var a2 = r.int(2, 9), b2 = r.int(1, a2 - 1), k2 = -r.int(1, 3); items.push(r.chance(0.5) ? [a2 + '\\times 10^{' + (k2 - 1) + '}', b2 + '\\times 10^{' + k2 + '}', 'lt'] : [b2 + '\\times 10^{' + k2 + '}', a2 + '\\times 10^{' + (k2 - 1) + '}', 'gt']);
          var c3 = std(D(nz(r, 11, 99), -1)), k3 = -r.int(5, 8); items.push(r.chance(0.5) ? [c3 + '\\times 10^{' + k3 + '}', c3 + '\\times 10^{' + (k3 - 1) + '}', 'gt'] : [c3 + '\\times 10^{' + (k3 - 1) + '}', c3 + '\\times 10^{' + k3 + '}', 'lt']);
          var k4 = r.int(2, 4), c4 = r.pick(['9.9', '9.8', '9.95']); items.push(r.chance(0.5) ? [c4 + '\\times 10^{' + k4 + '}', '1.0\\times 10^{' + (k4 + 1) + '}', 'lt'] : ['1.0\\times 10^{' + (k4 + 1) + '}', c4 + '\\times 10^{' + k4 + '}', 'gt']);
          if (r.chance(0.15)) items = [['7.4\\times 10^{5}', '74\\times 10^{4}', 'eq'], ['3\\times 10^{-2}', '2\\times 10^{-1}', 'lt'], ['6.1\\times 10^{-7}', '6.1\\times 10^{-8}', 'gt'], ['9.9\\times 10^{3}', '1.0\\times 10^{4}', 'lt']];
          items.forEach(function (it, i) { rows.push({ id: 'p' + i, html: t(it[0] + '\\ \\square\\ ' + it[1]) }); want['p' + i] = it[2]; });
          var sym = { lt: '<', eq: '=', gt: '>' };
          return P.grid('Choose ' + t('<') + ', ' + t('=') + ' or ' + t('>') + ' for each pair. Not every number is in scientific notation.', rows, cols, want, { why: function (row) { var it = items[Number(row.slice(1))]; return 'Check ' + t(it[0] + '\\ \\square\\ ' + it[1]) + ' again: write both in scientific notation (coefficient between 1 and 10), then compare the exponents first.'; } },
            items.map(function (it) { return t(it[0] + sym[it[2]] + it[1]); }).join('<br>') + '<br>Put both sides in scientific notation and compare the exponents first; compare coefficients only when the exponents tie.', ['Rewrite any number whose coefficient is not between ' + t('1') + ' and ' + t('10') + '.', 'A larger exponent wins, whatever the coefficients are.'], 'compare pairs <,=,>');
        } }] },
      { num: '14', section: 'Extra practice F — Real quantities: the units must survive', stem: function (s) { return 'Light travels at ' + t('3.0\\times 10^{8}') + ' m/s. The star ' + s.n + ' is about ' + t(s.d + '\\times 10^{' + s.e + '}') + ' m from Earth.'; },
        shared: function (r) { return r.chance(0.15) ? STARS[0] : r.pick(STARS); },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, s) {
            var dist = sh(dec(s.d), s.e), T = div(dist, D(3, 8));
            var p = sciPart('How long does light from ' + s.n + ' take to reach Earth, in seconds?', T, { before: t('t='), diag: cands([[mul(dist, D(3, 8)), 'mult-coef', 'Time = distance ÷ speed. Divide, don’t multiply.'], [div(D(3, 8), dist), 'flip-ratio', 'Time = distance ÷ speed: the distance goes on top.']]) },
              'Time ' + t('=\\dfrac{\\text{distance}}{\\text{speed}}=\\dfrac{' + s.d + '\\times 10^{' + s.e + '}\\text{ m}}{3.0\\times 10^{8}\\text{ m/s}}') + '. Coefficients: ' + t(s.d + '\\div 3.0=' + std(div(dec(s.d), D(3, 0)))) + '; exponents: ' + t(s.e + '-8=' + (s.e - 8)) + '.<br>' + renormSol(div(dec(s.d), D(3, 0)), s.e - 8, T, true).replace('</b>.', ' s</b>.'),
              ['Time = distance ÷ speed.', 'Divide the coefficients and subtract the exponents. The metres cancel, leaving seconds.'], 'light time from ' + s.n);
            return p;
          } },
          { id: 'e14b', level: 'EMG', make: function (r, s) {
            var T = div(sh(dec(s.d), s.e), D(3, 8)), y = val(T) / 3.15e7;
            return P.approx('One year is about ' + t('3.15\\times 10^{7}') + ' s. Express the light-travel time from ' + s.n + ' in years, to the nearest tenth.', y, 1, { after: 'years', diag: function (v) { if (Math.abs(v - K.roundTo(val(T) * 3.15e7, 1)) < 1e-6 || v > 1e6) return { code: 'mult-coef', hint: 'To change seconds into years, <b>divide</b> by the number of seconds in a year.' }; return null; } },
              'Time in seconds: ' + t(sciT(T)) + ' s (from part (a)).<br>' + t('\\dfrac{' + sciT(T) + '\\text{ s}}{3.15\\times 10^{7}\\text{ s/year}}=\\dfrac{' + std(coef(T)) + '}{3.15}\\times 10^{' + sN(T) + '-7}\\approx ' + y.toFixed(3)) + ', so about <b>' + t(K.roundTo(y, 1).toFixed(1)) + '</b> years.',
              ['Find the time in seconds first (part (a)): distance ÷ speed.', 'Then divide by the number of seconds in one year.'], 'light years to ' + s.n);
          } },
          { id: 'e14c', level: 'EMG', make: function (r, s) {
            var dist = sh(dec(s.d), s.e), q = 9.0e20 / val(dist);
            return sciPart('The Milky Way is about ' + t('9.0\\times 10^{20}') + ' m across. That distance is how many times the distance to ' + s.n + '? Answer in scientific notation to 2 significant digits.', dec(q.toPrecision(12)), { sig: 2, diag: cands([[val(dist) / 9e20, 'flip-ratio', '“How many times” is the larger distance divided by the smaller: Milky Way ÷ star distance.']]) },
              t('\\dfrac{9.0\\times 10^{20}\\text{ m}}{' + s.d + '\\times 10^{' + s.e + '}\\text{ m}}=\\dfrac{9.0}{' + s.d + '}\\times 10^{20-' + s.e + '}\\approx ' + (9 / Number(s.d)).toFixed(3) + '\\times 10^{' + (20 - s.e) + '}') + ', so about <b>' + t(K.sciTex(q, 2)) + '</b> times (the metres cancel — no unit).',
              ['Divide the size of the Milky Way by the distance to the star.', 'Divide the coefficients, subtract the exponents, then round the coefficient to 2 significant digits.'], 'Milky Way / ' + s.n);
          } }] },
      { num: '15', stem: function (s) { return 'A typical animal cell is about ' + t(sciT(s.cell)) + ' m across, a certain virus particle about ' + t(sciT(s.virus)) + ' m across, and a certain bacterium about ' + t(sciT(s.bact)) + ' m long.'; },
        shared: function (r) {
          return find(r, function () { return { cell: r.pick([D(5, -6), D(4, -6), D(25, -7), D(8, -6), D(2, -5), D(1, -5)]), virus: r.pick([D(25, -9), D(1, -7), D(5, -8), D(3, -8), D(2, -8)]), bact: r.pick([D(2, -6), D(1, -6), D(3, -6), D(15, -7)]) }; },
            function (v) { var q = div(v.cell, v.virus); return val(v.cell) > val(v.bact) && q && nd(q) <= 2 && div(D(1, -2), v.cell); }, { cell: D(5, -6), virus: D(25, -9), bact: D(2, -6) });
        },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, s) {
            var A = A_(D(1, 0), -2), B = A_(coef(s.cell), sN(s.cell)), o = opRes(A, B, 'div');
            var p = sciPart('How many cells, placed edge to edge, span ' + t('1') + ' cm, that is ' + t('1\\times 10^{-2}') + ' m?', o.R, { diag: opDiag(A, B, 'div') },
              t('\\dfrac{1\\times 10^{-2}\\text{ m}}{' + sciT(s.cell) + '\\text{ m}}') + ': ' + opSol(A, B, 'div').replace('</b>.', '</b> cells.'), ['Divide the length to be covered by the width of one cell.'], 'cells across 1 cm');
            return p;
          } },
          { id: 'e15b', level: 'EMG', make: function (r, s) {
            var A = A_(coef(s.cell), sN(s.cell)), B = A_(coef(s.virus), sN(s.virus)), o = opRes(A, B, 'div');
            return sciPart('How many times wider than the virus particle is the cell?', o.R, { diag: opDiag(A, B, 'div') },
              t('\\dfrac{' + sciT(s.cell) + '\\text{ m}}{' + sciT(s.virus) + '\\text{ m}}') + ': ' + opSol(A, B, 'div').replace('</b>.', '</b> times.'), ['“How many times wider” is a division: cell ÷ virus.'], 'cell / virus');
          } },
          { id: 'e15c', level: 'EMG', make: function (r, s) {
            var p = addPart([s.cell, '-', s.bact]);
            p.prompt = 'How much wider is the cell than the bacterium is long? (This one is a subtraction — see Question 9.) Give the answer in metres.';
            p.solution = p.solution.replace(/<\/b>\.$/, ' m</b>.');
            p.text = 'cell − bacterium';
            return p;
          } }] },
      { num: '16', stem: function (s) { return 'A video file is ' + t(sciT(s.file)) + ' bytes. A drive holds ' + t(sciT(s.drive)) + ' bytes, and one byte is ' + t('8') + ' bits.'; },
        shared: function (r) {
          return find(r, function () { return { file: r.pick([D(5, 9), D(2, 9), D(4, 9), D(8, 9), D(25, 8), D(12, 9)]), drive: r.pick([D(15, 11), D(1, 12), D(2, 12), D(5, 11), D(4, 12)]), rate: r.pick([D(125, 6), D(25, 7), D(5, 8), D(1, 8), D(2, 8)]) }; },
            function (v) { var tt = div(v.file, v.rate); return tt && nd(tt) <= 2 && val(v.drive) / val(v.file) >= 20; }, { file: D(5, 9), drive: D(15, 11), rate: D(125, 6) });
        },
        parts: [
          { id: 'e16a', level: 'EMG', make: function (r, s) {
            var q = val(s.drive) / val(s.file), n = Math.floor(q + 1e-9), exact = Math.abs(q - Math.round(q)) < 1e-9;
            var p = P.number('How many whole files of that size fit on the drive?', n, function (v) { if (!exact && v === n + 1) return { code: 'round-up', hint: 'Only <b>whole</b> files fit: the last one would be cut off. Round down.' }; if (relEq(v, val(s.file) / val(s.drive))) return { code: 'flip-ratio', hint: 'Divide the drive’s capacity by the size of one file.' }; return null; },
              t('\\dfrac{' + sciT(s.drive) + '\\text{ bytes}}{' + sciT(s.file) + '\\text{ bytes}}=\\dfrac{' + std(coef(s.drive)) + '}{' + std(coef(s.file)) + '}\\times 10^{' + sN(s.drive) + '-' + sN(s.file) + '}' + (exact ? '=' + HW.fmt(n) : '\\approx ' + q.toFixed(2))) + (exact ? ', so <b>' + t(HW.fmt(n)) + '</b> files (exactly).' : '. Only whole files count, so <b>' + t(HW.fmt(n)) + '</b> files.'),
              ['Divide the drive’s capacity by the size of one file.'], 'files on a drive', { after: 'files' });
            if (!exact) p.bad = [String(n + 1)];
            return p;
          } },
          { id: 'e16b', level: 'EMG', make: function (r, s) {
            var b = mul(s.file, D(8, 0)), raw = mul(coef(s.file), D(8, 0));
            return sciPart('How many bits are in one file?', b, { diag: cands([[div(s.file, D(8, 0)), 'flip-ratio', 'Each byte is 8 bits, so there are <b>more</b> bits than bytes: multiply by 8.']]) },
              t('(' + sciT(s.file) + '\\text{ bytes})\\times 8\\text{ bits/byte}=' + pt(raw, sN(s.file))) + (inRange(raw) ? '' : '; ' + t(stdTex(raw) + '=' + sciT(raw))) + ', so <b>' + t(sciT(b)) + '</b> bits.', ['Multiply the number of bytes by 8, then renormalize.'], 'bits in a file');
          } },
          { id: 'e16c', level: 'EMG', make: function (r, s) {
            var A = A_(coef(s.file), sN(s.file)), B = A_(coef(s.rate), sN(s.rate)), o = opRes(A, B, 'div');
            var p = sciPart('The drive transfers ' + t(sciT(s.rate)) + ' bytes per second. How long does one file take to copy, in seconds?', o.R, { diag: opDiag(A, B, 'div') },
              t('\\dfrac{' + sciT(s.file) + '\\text{ bytes}}{' + sciT(s.rate) + '\\text{ bytes/s}}') + ': ' + opSol(A, B, 'div').replace('</b>.', ' s</b> (' + t(stdTex(o.R)) + ' s).'), ['Time = amount ÷ rate.'], 'copy time');
            return p;
          } }] },
      { num: '17', section: 'Extra practice G — Find the error', stem: function (s) { return 'Asked to evaluate ' + t(opTex(s.A, s.B, 'div')) + ', a student divided ' + t(stdTex(s.A.c)) + ' by ' + t(stdTex(s.B.c)) + ', subtracted the exponents, wrote ' + t(pt(s.q, s.E)) + ', and circled it as the final answer.'; },
        shared: function (r) {
          var v = find(r, function () { var B = c1(r), Q = D(nz(r, 11, 99), -2); return { A: A_(mul(Q, B), r.int(2, 6)), B: A_(B, -r.int(1, 3)) }; }, function (v) { return inRange(v.A.c) && nd(v.A.c) <= 2; }, { A: A_('1.8', 4), B: A_('4', -2) });
          v.q = div(v.A.c, v.B.c); v.E = v.A.p - v.B.p; v.R = sh(v.q, v.E); return v;
        },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, s) {
            return toStdNamed(s.R, 'Is the student’s <i>value</i> correct? Write the student’s answer ' + t(pt(s.q, s.E)) + ' in standard notation (then check it against ' + t(stdTex(sh(s.A.c, s.A.p)) + '\\div ' + stdTex(sh(s.B.c, s.B.p))) + ').',
              t(pt(s.q, s.E)) + ': move the decimal point ' + t(s.E) + ' places right: <b>' + t(stdTex(s.R)) + '</b>.<br>Check: ' + t(stdTex(sh(s.A.c, s.A.p)) + '\\div ' + stdTex(sh(s.B.c, s.B.p)) + '=' + stdTex(s.R)) + ' — the value <b>is</b> correct.');
          } },
          { id: 'e17b', level: 'EMG', make: function (r, s) {
            return P.mc(r, 'Why is ' + t(pt(s.q, s.E)) + ' nevertheless <b>not</b> an acceptable final answer?', [
              { html: 'The coefficient must satisfy ' + t('1\\le a<10') + ', and ' + t(stdTex(s.q)) + ' is less than ' + t('1') + ', so it is not in scientific notation.', right: true },
              { html: 'The exponents should have been added, not subtracted.', why: 'For division the quotient law says <b>subtract</b>: ' + t(s.A.p + '-' + par(s.B.p) + '=' + s.E) + ' is right.' },
              { html: 'The value is wrong.', why: 'Check part (a): the value matches ' + t(stdTex(sh(s.A.c, s.A.p)) + '\\div ' + stdTex(sh(s.B.c, s.B.p))) + '.' },
              { html: 'A coefficient can’t be a decimal.', why: 'Coefficients like ' + t('4.5') + ' are fine; the problem is that this one is less than ' + t('1') + '.' }],
              'The value is right, but the coefficient ' + t(stdTex(s.q)) + ' is less than ' + t('1') + ', so the number is <b>not in scientific notation</b>. It still needs renormalizing.', ['Look at the coefficient. What is the rule for the coefficient in scientific notation?'], 'why 0.45×10^6 is not acceptable');
          } },
          { id: 'e17c', level: 'EMG', make: function (r, s) {
            var k = sN(s.q);
            return sciPart('Give the correct answer in scientific notation.', s.R, { diag: cands([[sh(s.R, -2 * k), 'renorm-dir', 'The coefficient got bigger (' + t(stdTex(s.q) + '\\to ' + std(coef(s.q))) + '), so the exponent must go <b>down</b>.']]) },
              t(stdTex(s.q) + '\\to ' + std(coef(s.q))) + ' moves the decimal point ' + t(-k) + ' place' + (k === -1 ? '' : 's') + ' right, so the exponent drops by ' + t(-k) + ': ' + t(s.E + '-' + (-k) + '=' + sN(s.R)) + '.<br><b>' + t(sciT(s.R)) + '</b>', ['Renormalize: make the coefficient between ' + t('1') + ' and ' + t('10') + ' and adjust the exponent the opposite way.'], 'correct 0.45×10^6');
          } }] },
      { num: '18', stem: function (s) { return 'Asked to write ' + t(stdTex(s.d)) + ' in scientific notation, a student counted ' + (-sN(s.d)) + ' places correctly but moved the decimal point the wrong way and wrote ' + t(std(coef(s.d)) + '\\times 10^{' + (-sN(s.d)) + '}') + '.'; },
        shared: function (r) { return r.chance(0.15) ? { d: D(815, -8), e: D(72, -6) } : { d: S(mant(r, 3), -r.int(5, 7)), e: S(mant(r, 2), -r.int(4, 6)) }; },
        parts: [
          { id: 'e18a', level: 'BEG', make: function (r, s) {
            var w = sh(s.d, -2 * sN(s.d));
            return toStdNamed(w, 'What number did the student actually write? Give it in standard notation.', t(sciT(w)) + ': move the decimal point ' + t(sN(w)) + ' places right: <b>' + t(stdTex(w)) + '</b>. The true value is ' + t(stdTex(s.d)) + ', so this is ' + t('10^{' + 2 * sN(w) + '}') + ' times too big.');
          } },
          { id: 'e18b', level: 'BEG', make: function (r, s) { return toSci(s.d, 'Give the correct scientific notation for ' + t(stdTex(s.d)) + '.'); } },
          { id: 'e18c', level: 'LIM', make: function (r, s) {
            return P.mc(r, 'Which quick check catches this error every time?', [
              { html: 'A number less than ' + t('1') + ' must have a <b>negative</b> exponent (and a number ' + t('10') + ' or more a positive one).', right: true },
              { html: 'The exponent equals the number of zeros in the number.', why: 'Count the zeros in ' + t(stdTex(s.d)) + ' — the rule doesn’t even give the right size, and says nothing about the sign.' },
              { html: 'The coefficient must be less than ' + t('10') + '.', why: 'The student’s coefficient ' + t(std(coef(s.d))) + ' was already less than ' + t('10') + '. The mistake is in the exponent.' },
              { html: 'The exponent is always the number of digits in the number.', why: 'That isn’t a rule. Think about whether the number is bigger or smaller than ' + t('1') + '.' }],
              t(stdTex(s.d)) + ' is less than ' + t('1') + ', so its exponent must be negative: ' + t(sciT(s.d)) + '. Checking the sign of the exponent against the size of the number catches a wrong-way move every time.', ['Is ' + t(stdTex(s.d)) + ' bigger or smaller than 1? What does that say about the exponent?'], 'sign check rule');
          } },
          { id: 'e18d', level: 'BEG', make: function (r, s) {
            var w = sh(s.e, -2 * sN(s.e));
            var p = toStdNamed(s.e, 'A second student converts ' + t(sciT(s.e)) + ' to standard notation and writes ' + t(stdTex(w)) + '. Give the correct standard notation.',
              'The exponent ' + t(sN(s.e)) + ' is negative, so the decimal point moves ' + t(-sN(s.e)) + ' places <b>left</b>; the student moved it right (that gives ' + t(sciT(w)) + ').<br>Correct: ' + t(sciT(s.e) + '=') + '<b>' + t(stdTex(s.e)) + '</b>.');
            p.bad.push(std(w));
            return p;
          } }] },
      { num: '19', stem: 'Decide whether each statement is true or false. If it is false, choose the correct right-hand side.', parts: [
        { id: 'e19a', level: 'BEG', make: function (r) {
          var d = r.chance(0.15) ? D(64, -4) : S(mant(r, 2), -r.int(2, 5)), truth = r.chance(0.5), n = sN(d);
          var wrongs = [sh(d, -1), sh(d, 1), sh(d, -2 * n)], shown = truth ? d : r.pick(wrongs.slice(0, 2));
          return tfFix(r, sciT(d), stdTex(shown), stdTex(d), wrongs.map(stdTex).filter(function (x) { return x !== stdTex(shown); }),
            'The exponent is ' + t(n) + ': move the decimal point ' + t(-n) + ' places left: ' + t(sciT(d) + '=' + stdTex(d)) + '.', 'statement: sci = standard');
        } },
        { id: 'e19b', level: 'EMG', make: function (r) {
          var c = r.chance(0.15) ? 2 : r.int(2, 4), k = r.chance(0.15) ? 5 : r.int(2, 6), p = 3, cor = D(Math.pow(c, p), k * p), lhs = '(' + c + '\\times 10^{' + k + '})^{' + p + '}';
          var w1 = D(c * p, k * p), w2 = D(Math.pow(c, p), k + p), w3 = S(c, k * p);   // values c^3·10^(3k), 3c·10^(3k), c^3·10^(k+3) (D, not S: 27 × 10^9 = 2.7 × 10^10)
          var shown = r.chance(0.35) ? cor : r.pick([w1, w2]);
          return tfFix(r, lhs, sciT(shown), sciT(cor), [w1, w2, w3].map(sciT).filter(function (x) { return x !== sciT(shown) && x !== sciT(cor); }),
            'The cube applies to the coefficient <b>and</b> the power of ten: ' + t(lhs + '=' + c + '^{3}\\times 10^{' + k + '\\times 3}=' + pt(D(Math.pow(c, p), 0), k * p) + (Math.pow(c, p) >= 10 ? '=' + sciT(cor) : '')) + '.', 'statement: power of sci');
        } },
        { id: 'e19c', level: 'BEG', make: function (r) {
          var k = -r.int(1, 4), a = std(D(nz(r, 11, 49), -1)), b = std(D(nz(r, 51, 99), -1)), truth = r.chance(0.5);
          if (r.chance(0.15)) { k = -2; a = '3.5'; b = '9.9'; truth = true; }
          var L = a + '\\times 10^{' + k + '}', R = b + '\\times 10^{' + (k - 1) + '}', stmt = truth ? L + '>' + R : R + '>' + L;
          return P.tf(r, t(stmt), truth, truth ? 'Compare the exponents first: ' + t(k + '>' + (k - 1)) + ', so ' + t(L) + ' is the larger number.' : 'Compare the exponents first: ' + t((k - 1) + '<' + k) + ', so ' + t(R) + ' is the <b>smaller</b> number, even though its coefficient is bigger.',
            'Exponents: ' + t(k + '>' + (k - 1)) + ', so ' + t(L + '>' + R) + ' (' + t(stdTex(sh(dec(a), k)) + '>' + stdTex(sh(dec(b), k - 1))) + '). The statement is <b>' + (truth ? 'true' : 'false') + '</b>.', ['Compare the exponents first; the coefficients only matter if the exponents are equal.'], 'statement: compare');
        } },
        { id: 'e19d', level: 'EMG', make: function (r) {
          var v = find(r, function () { var b = r.int(2, 4), q = r.int(2, 4); return { a: b * q, b: b, p: r.int(4, 8), q: r.int(6, 9) }; }, function (v) { return v.a <= 9 && v.q > v.p; }, { a: 8, b: 2, p: 6, q: 8 });
          var lhs = '(' + v.a + '\\times 10^{' + v.p + '})\\div(' + v.b + '\\times 10^{' + v.q + '})', d = v.a / v.b, cor = S(d, v.p - v.q), w1 = S(d, v.q - v.p), w2 = S(d, v.p + v.q), w3 = S(v.a * v.b, v.p - v.q);
          var shown = r.chance(0.35) ? cor : w1;
          return tfFix(r, lhs, sciT(shown), sciT(cor), [w1, w2, w3].map(sciT).filter(function (x) { return x !== sciT(shown) && x !== sciT(cor); }),
            'Coefficients: ' + t(v.a + '\\div ' + v.b + '=' + d) + '. Exponents: ' + t(v.p + '-' + v.q + '=' + (v.p - v.q)) + ' (top minus bottom). So ' + t(lhs + '=' + sciT(cor)) + '.', 'statement: quotient');
        } }] },
      { num: '20', section: 'Extra practice H — Stretch', stem: 'Three operations in one expression. Work the numerator and the denominator down to single powers of ten before you divide.', parts: [
        { id: 'e20a', level: 'PRG', make: function (r) {
          var pool = [D(6, 0), D(15, -1), D(2, 0), D(45, -1), D(3, 0), D(4, 0), D(25, -1), D(12, -1), D(8, 0), D(5, 0)];
          var v = find(r, function () { return [A_(r.pick(pool), -r.int(2, 6)), A_(r.pick(pool), r.int(6, 10)), A_(r.pick(pool), r.int(2, 5)), A_(r.pick(pool), -r.int(1, 4))]; },
            function (v) { var T = mul(v[0].c, v[1].c), B = mul(v[2].c, v[3].c), Q = div(T, B); return Q && nd(Q) === 1 && v[0].c.m !== v[2].c.m; }, [A_('6', -4), A_('1.5', 9), A_('2', 3), A_('4.5', -2)]);
          return fourOp(v, false);
        } },
        { id: 'e20b', level: 'PRG', make: function (r) {
          var pool = [D(8, 0), D(2, 0), D(4, 0), D(5, 0), D(16, -1), D(25, -1), D(12, -1)];
          var v = find(r, function () { return [A_(r.pick([D(32, -1), D(16, -1), D(24, -1), D(12, -1), D(36, -1), D(48, -1)]), -r.int(3, 6)), null, A_(r.pick(pool), -r.int(2, 5)), A_(r.pick(pool), -r.int(5, 8))]; },
            function (v) { var T = pw(v[0].c, 2), B = mul(v[2].c, v[3].c), Q = div(T, B); return Q && nd(Q) <= 2 && val(T) >= 10 && val(B) >= 10 && v[2].p !== v[3].p && v[2].c.m !== v[3].c.m; }, [A_('3.2', -5), null, A_('8', -4), A_('2', -7)]);
          return fourOp(v, true);
        } }] },
      { num: '21', stem: function (s) { var a = BODIES[s[0]], b = BODIES[s[1]]; return '“How many times larger” is always a division. ' + bn(s[0], true) + '’s mass is about ' + t(a.m + '\\times 10^{' + a.me + '}') + ' kg and ' + bn(s[1]) + '’s is about ' + t(b.m + '\\times 10^{' + b.me + '}') + ' kg; ' + bn(s[0]) + '’s diameter is about ' + t(a.d + '\\times 10^{' + a.de + '}') + ' m and ' + bn(s[1]) + '’s is about ' + t(b.d + '\\times 10^{' + b.de + '}') + ' m.'; },
        shared: function (r) {
          var good = BODY_PAIRS.filter(function (p) { var a = BODIES[p[0]], b = BODIES[p[1]]; return [Number(a.m) / Number(b.m), Number(a.d) / Number(b.d)].every(function (q) { var c = q < 1 ? q * 10 : q, f = c * 100 - Math.floor(c * 100); return Math.abs(f - 0.5) > 0.06; }); });
          return r.chance(0.15) ? BODY_PAIRS[0] : r.pick(good);
        },
        parts: [
          { id: 'e21a', level: 'EMG', make: function (r, s) { return ratioPart(s, 'm'); } },
          { id: 'e21b', level: 'EMG', make: function (r, s) {
            var b = BODIES[s[1]], nm = bn(s[1]), g = r.chance(0.15) ? D(5, -5) : r.pick([D(5, -5), D(2, -5), D(4, -5), D(8, -5), D(1, -4)]), M = sh(dec(b.m), b.me), q = div(M, g);
            return sciPart('A grain of sand has a mass of about ' + t(sciT(g)) + ' kg. How many grains would have ' + nm + '’s mass? (No rounding needed.)', q, { diag: opDiag(A_(dec(b.m), b.me), A_(coef(g), sN(g)), 'div') },
              t('\\dfrac{' + b.m + '\\times 10^{' + b.me + '}\\text{ kg}}{' + sciT(g) + '\\text{ kg}}') + ': ' + opSol(A_(dec(b.m), b.me), A_(coef(g), sN(g)), 'div').replace('</b>.', '</b> grains.'), ['Divide the total mass by the mass of one grain.', 'Subtracting a negative exponent is adding.'], 'grains of sand');
          } },
          { id: 'e21c', level: 'EMG', make: function (r, s) { return ratioPart(s, 'd'); } }] },
      { num: '22', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e22', level: 'BEG', make: function (r) {
          var v = find(r, function () { var Q = c1(r), B = c2(r); return { A: mul(Q, B), B: B, p: -r.int(2, 6), q: r.int(2, 7) }; }, function (v) { return inRange(v.A) && nd(v.A) <= 2 && v.p + v.q !== 0 && v.p !== -v.q; }, { A: D(48, -1), B: D(16, -1), p: -3, q: 5 });
          var n = v.p - v.q, ks = [v.p + v.q, n, -(v.p + v.q), -n].filter(function (k, i, arr) { return arr.indexOf(k) === i; });
          while (ks.length < 4) ks.push(n - ks.length);
          var opts = ks.map(function (k) { return { html: t(k), right: k === n, why: k === v.p + v.q ? 'Dividing: <b>subtract</b> the exponents, top minus bottom: ' + t(v.p + '-' + v.q) + '.' : k === -n ? 'Top minus bottom: ' + t(v.p + '-' + v.q) + ', not the other way round.' : 'Quotient law: subtract the exponents, top minus bottom.' }; });
          return P.mc(r, 'When ' + t('(' + pt(v.A, v.p) + ')\\div(' + pt(v.B, v.q) + ')') + ' is written in the form ' + t('a\\times 10^{n}') + ' with ' + t('1\\le a<10') + ', the value of ' + t('n') + ' is', opts,
            'Coefficients: ' + t(stdTex(v.A) + '\\div ' + stdTex(v.B) + '=' + stdTex(div(v.A, v.B))) + '. Exponents: ' + t(v.p + '-' + v.q + '=' + n) + '. ' + t(pt(div(v.A, v.B), n)) + ' is already in range, so ' + t('n=' + n) + '.', ['Divide the coefficients and subtract the exponents (top minus bottom).'], 'exponent of a quotient', true);
        } }] },
      { num: '23', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e23', level: 'PRG', make: function (r) {
          var v = find(r, function () { return { a: c2(r), b: c1(r), p: -r.int(2, 6), q: r.int(4, 9) }; }, function (v) {
            var C = mul(v.a, v.b), R = sh(C, v.p + v.q), ap = val(coef(R)), n = sN(R), an = ap * n; return val(C) >= 10 && n >= 1 && Math.abs(an * 10 - Math.round(an * 10)) < 1e-9 && an < 100 && String(Math.round(an * 10) / 10).length <= 4;
          }, { a: D(25, -1), b: D(6, 0), p: -4, q: 7 });
          var C = mul(v.a, v.b), R = sh(C, v.p + v.q), a = val(coef(R)), n = sN(R), ans = Math.round(a * n * 10) / 10;
          return P.nr('When ' + t('(' + pt(v.a, v.p) + ')\\times(' + pt(v.b, v.q) + ')') + ' is written in the form ' + t('a\\times 10^{n}') + ' with ' + t('1\\le a<10') + ', the value of ' + t('a\\times n') + ' is ________.', ans, function (x) {
            if (Math.abs(x - Math.round(val(C) * (v.p + v.q) * 10) / 10) < 1e-9) return { code: 'no-renorm', hint: 'Renormalize first: ' + t(stdTex(C)) + ' is not between ' + t('1') + ' and ' + t('10') + '.' };
            if (Math.abs(x - Math.round(a * (n - 2) * 10) / 10) < 1e-9) return { code: 'renorm-dir', hint: 'When the coefficient gets smaller (' + t(stdTex(C) + '\\to ' + std(coef(C))) + '), the exponent goes <b>up</b> by ' + t('1') + '.' };
            return null;
          }, 'Coefficients: ' + t(stdTex(v.a) + '\\times ' + stdTex(v.b) + '=' + stdTex(C)) + '. Exponents: ' + t(v.p + '+' + v.q + '=' + (v.p + v.q)) + '.<br>' + t(pt(C, v.p + v.q) + '=' + sciT(R)) + ', so ' + t('a=' + std(coef(R))) + ', ' + t('n=' + n) + ' and ' + t('a\\times n=' + ans) + '.',
          ['Multiply, then renormalize so the coefficient is between ' + t('1') + ' and ' + t('10') + '.', 'Then multiply ' + t('a') + ' by ' + t('n') + '.'], 'a×n of a product');
        } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  function tableRow(d, given) {
    var n = sN(d), stdF = { name: 'Standard notation', label: 'Standard notation' }, prodF = { name: 'Product form', label: 'Product form', mode: 'math', keys: 'expr', wide: true }, sciF = { name: 'Scientific notation', label: 'Scientific notation', mode: 'math', keys: 'expr', wide: true };
    var sol = 'The decimal point moves ' + moveWords(d) + ' between ' + t(stdTex(d)) + ' and ' + t(std(coef(d))) + ', so there ' + (Math.abs(n) === 1 ? 'is one ' + t('10') : 'are ' + Math.abs(n) + ' tens') + ' in the product form' + (n < 0 ? ', in the denominator' : '') + ':<br>' + t(stdTex(d) + '=' + prodTex(d) + '=' + sciT(d)) + '.';
    var hints = ['Find the coefficient first: move the decimal point so exactly one non-zero digit is in front of it.', 'Each place the decimal point moves is one ' + t('10') + '. A number less than ' + t('1') + ' has its ' + t('10') + 's in the denominator (and a negative exponent).'];
    var p;
    if (given === 'std') {
      p = P.fields('Standard notation: ' + t(stdTex(d)) + '. Fill in the product form and the scientific notation.', [prodF, sciF], [prodChk(d), sciChk(d, { diag: cands([signDiag(d)].filter(Boolean)) })], [prodKey(d), sciT(d)],
        'Product form: ' + t(prodTex(d)) + '<br>Scientific notation: ' + t(sciT(d)), sol, hints, 'table row from ' + std(d));
      p.bad = [[prodKey(d), sciT(sh(d, -2 * n))], [prodKey(sh(d, 1)), sciT(d)]];
    } else {
      p = P.fields('Scientific notation: ' + t(sciT(d)) + '. Fill in the standard notation and the product form.', [stdF, prodF], [stdChk(d), prodChk(d)], [std(d), prodKey(d)],
        'Standard notation: ' + t(stdTex(d)) + '<br>Product form: ' + t(prodTex(d)), sol, hints, 'table row from ' + sciPlain(d));
      p.bad = [[std(sh(d, -2 * n)), prodKey(d)], [std(d), prodKey(sh(d, -1))]];
    }
    return p;
  }
  function toStdNamed(d, prompt, sol) { var p = toStd(d, prompt); p.solution = sol; return p; }
  function missingN(C, k) { // C × 10^k = coef × 10^n
    var V = sh(C, k), n = sN(V), s = sN(C);
    return P.number(t(stdTex(C) + '\\times 10^{' + k + '}=' + std(coef(V)) + '\\times 10^{n}'), n, function (v) {
      if (v === k - s) return { code: 'adjust-direction', hint: s > 0 ? 'The coefficient got <b>smaller</b> (' + t(stdTex(C) + '\\to ' + std(coef(V))) + '), so the exponent must go <b>up</b>.' : 'The coefficient got <b>bigger</b> (' + t(stdTex(C) + '\\to ' + std(coef(V))) + '), so the exponent must go <b>down</b>.' };
      if (v === s) return { code: 'ignored-power', hint: 'Don’t forget the ' + t('10^{' + k + '}') + ' that is already there: adjust its exponent.' };
      return null;
    }, t(stdTex(C) + '\\to ' + std(coef(V))) + ' moves the decimal point ' + t(Math.abs(s)) + ' place' + (Math.abs(s) === 1 ? '' : 's') + ' ' + (s > 0 ? 'left' : 'right') + ', so the exponent goes ' + (s > 0 ? 'up' : 'down') + ' by ' + t(Math.abs(s)) + ':<br>' + t('n=' + k + (s > 0 ? '+' + s : String(s)) + '=' + n) + '.',
    ['How many places does the decimal point move to turn ' + t(stdTex(C)) + ' into ' + t(std(coef(V))) + '? In which direction?', 'Coefficient smaller → exponent bigger, and the other way round.'], 'missing exponent ' + std(C) + '×10^' + k, { before: t('n=') });
  }
  function powPart(c, k, p) {
    var C = D(Math.pow(c, p), 0), R = sh(C, k * p), lhs = '(' + c + '\\times 10^{' + k + '})^{' + p + '}';
    return sciPart(t(lhs), R, { diag: cands([[S(c, k * p), 'coef-not-raised', 'Raise the coefficient too: ' + t(c + '^{' + p + '}=' + Math.pow(c, p)) + '.'], [S(c * p, k * p), 'coef-times', t(c + '^{' + p + '}') + ' means ' + t(Array(p + 1).join(c + '\\times ').slice(0, -7)) + ', not ' + t(c + '\\times ' + p) + '.'], [sh(C, k + p), 'power-add', 'Power of a power: <b>multiply</b> the exponents, ' + t('(10^{' + k + '})^{' + p + '}=10^{' + k + '\\times ' + p + '}') + '.'], [sh(sh(C, k * p), -2 * sN(C)), 'renorm-dir', 'Renormalizing ' + t(Math.pow(c, p) + '\\to ' + std(coef(C))) + ' makes the coefficient smaller, so the exponent goes <b>up</b>.']].filter(function (x) { return !relEq(val(x[0]), val(R)); })) },
      t(lhs + '=' + c + '^{' + p + '}\\times (10^{' + k + '})^{' + p + '}=' + pt(C, k * p)) + (inRange(C) ? ' — already in range: <b>' + t(sciT(R)) + '</b>.' : '; ' + t(Math.pow(c, p) + '=' + sciT(C)) + ', so <b>' + t(sciT(R)) + '</b>.'),
      ['Raise the coefficient to the power, and multiply the exponent of ' + t('10') + ' by the power.', 'Then renormalize if the coefficient is ' + t('10') + ' or more.'], 'power ' + c + 'e' + k + '^' + p);
  }
  function twoOp(v, kind) { // kind: 'frac' (a·b)/c, 'sq' a²/c, 'inline' a·b ÷ c
    var A = v[0], B = v[1], Cc = v[2];
    var top = kind === 'sq' ? pw(A.c, 2) : mul(A.c, B.c), te = kind === 'sq' ? 2 * A.p : A.p + B.p, T = sh(top, te), Q = div(top, Cc.c), E = te - Cc.p, R = sh(Q, E);
    var lhs = kind === 'sq' ? '\\dfrac{(' + cTex(A) + ')^{2}}{' + cTex(Cc) + '}' : kind === 'frac' ? '\\dfrac{(' + cTex(A) + ')(' + cTex(B) + ')}{' + cTex(Cc) + '}' : '(' + cTex(A) + ')(' + cTex(B) + ')\\div(' + cTex(Cc) + ')';
    var s1 = kind === 'sq' ? 'Top: ' + t(stdTex(A.c) + '^{2}=' + stdTex(top)) + ', ' + t(par(A.p) + '\\times 2=' + te) + ', so ' + t(pt(top, te)) + '.' : (kind === 'inline' ? 'First product: ' : 'Top: ') + t(stdTex(A.c) + '\\times ' + stdTex(B.c) + '=' + stdTex(top)) + ', ' + t(A.p + '+' + par(B.p) + '=' + te) + ', so ' + t(pt(top, te)) + '.';
    var s2 = 'Divide: ' + t(stdTex(top) + '\\div ' + stdTex(Cc.c) + '=' + stdTex(Q)) + ', ' + t(te + '-' + par(Cc.p) + '=' + E) + '.<br>' + renormSol(Q, E, R, true);
    var wrongTop = sh(div(top, Cc.c), te + Cc.p);
    return sciPart(t(lhs), R, { diag: cands([[wrongTop, 'add-exp', 'When you divide by ' + t(cTex(Cc)) + ', <b>subtract</b> its exponent: ' + t(te + '-' + par(Cc.p)) + '.'], inRange(Q) ? null : [sh(R, -2 * sN(Q)), 'renorm-dir', 'Check the direction when you renormalize ' + t(stdTex(Q)) + ': coefficient smaller → exponent bigger, and the other way round.']].filter(function (x) { return x && !relEq(val(x[0]), val(R)); })) },
      s1 + '<br>' + s2, ['Simplify the top first: one coefficient times one power of ten.', 'Then divide the coefficients and subtract the exponents. Renormalize at the end.'], 'two operations');
  }
  function fourOp(v, sq) {
    var A = v[0], B = v[1], C = v[2], E2 = v[3];
    var top = sq ? pw(A.c, 2) : mul(A.c, B.c), te = sq ? 2 * A.p : A.p + B.p, bot = mul(C.c, E2.c), be = C.p + E2.p, Q = div(top, bot), E = te - be, R = sh(Q, E);
    var lhs = '\\dfrac{' + (sq ? '(' + cTex(A) + ')^{2}' : '(' + cTex(A) + ')(' + cTex(B) + ')') + '}{(' + cTex(C) + ')(' + cTex(E2) + ')}';
    function norm(x, e) { return inRange(x) ? t(pt(x, e)) : t(pt(x, e) + '=' + sciT(sh(x, e))); }
    var sol = 'Top: ' + (sq ? t(stdTex(A.c) + '^{2}=' + stdTex(top)) + ', ' + t(par(A.p) + '\\times 2=' + te) : t(stdTex(A.c) + '\\times ' + stdTex(B.c) + '=' + stdTex(top)) + ', ' + t(A.p + '+' + par(B.p) + '=' + te)) + ', so ' + norm(top, te) + '.<br>' +
      'Bottom: ' + t(stdTex(C.c) + '\\times ' + stdTex(E2.c) + '=' + stdTex(bot)) + ', ' + t(C.p + '+' + par(E2.p) + '=' + be) + ', so ' + norm(bot, be) + '.<br>' +
      'Divide: ' + t(stdTex(top) + '\\div ' + stdTex(bot) + '=' + stdTex(Q)) + ', ' + t(te + '-' + par(be) + '=' + E) + '.<br>' + renormSol(Q, E, R, true);
    return sciPart(t(lhs), R, { diag: cands([[sh(Q, te + be), 'add-exp', 'Dividing by the bottom: <b>subtract</b> its exponent, ' + t(te + '-' + par(be)) + '.'], inRange(Q) ? null : [sh(R, -2 * sN(Q)), 'renorm-dir', 'Check the direction when you renormalize ' + t(stdTex(Q)) + '.']].filter(function (x) { return x && !relEq(val(x[0]), val(R)); })) },
      sol, ['Simplify the numerator to one coefficient times one power of ten, then the denominator the same way.', 'Then divide: coefficients divide, exponents subtract. Renormalize at the end.'], 'three operations');
  }
  function addTex(v) { var out = sciT(v[0]); for (var i = 1; i < v.length; i += 2) out += v[i] + sciT(v[i + 1]); return out; }
  function addRaw(v) { // combine over the largest power of ten
    var k = sN(v[0]), c = coef(v[0]), parts = [{ d: v[0], c: c }];
    for (var i = 1; i < v.length; i += 2) { var x = sh(v[i + 1], -k); parts.push({ d: v[i + 1], c: x, op: v[i] }); c = v[i] === '+' ? add(c, x) : sub(c, x); }
    return { k: k, c: c, parts: parts, v: sh(c, k) };
  }
  function addPart(v) {
    var R = addRaw(v), k = R.k, res = R.v, tex = addTex(v);
    var conv = R.parts.slice(1).filter(function (p) { return sN(p.d) !== k; }).map(function (p) { return t(sciT(p.d) + '=' + pt(p.c, k)); });
    var line = t('(' + R.parts.map(function (p, i) { return (i ? p.op : '') + stdTex(p.c); }).join('') + ')\\times 10^{' + k + '}=' + pt(R.c, k));
    var sol = 'Common power: ' + t('10^{' + k + '}') + (conv.length ? '. ' + conv.join(', ') + '.' : ' (already shared).') + '<br>' + line + (inRange(R.c) ? ' — already in range: <b>' + t(sciT(res)) + '</b>.' : '; ' + t(stdTex(R.c)) + ' is not between ' + t('1') + ' and ' + t('10') + ', so renormalize: <b>' + t(sciT(res)) + '</b>.');
    // naive: combine the coefficients as written, keep the larger power
    var naive = coef(v[0]); for (var i = 1; i < v.length; i += 2) naive = v[i] === '+' ? add(naive, coef(v[i + 1])) : sub(naive, coef(v[i + 1]));
    var list = [];
    if (conv.length) list.push([sh(naive, k), 'no-align', 'The powers of ten are different, so the coefficients can’t be combined yet. Rewrite ' + t(sciT(R.parts.filter(function (p) { return sN(p.d) !== k; })[0].d)) + ' over ' + t('10^{' + k + '}') + ' first.']);
    if (v.length === 3) list.push([sh(naive, sN(v[0]) + sN(v[2])), 'add-exps-sum', 'Adding doesn’t add the exponents. Write both over the same power of ten, then add (or subtract) only the coefficients.']);
    if (!inRange(R.c)) list.push([sh(res, -2 * sN(R.c)), 'renorm-dir', 'Check the direction when you renormalize ' + t(stdTex(R.c)) + '.']);
    return sciPart(t(tex), res, { diag: cands(list.filter(function (x) { return val(x[0]) > 0 && !relEq(val(x[0]), val(res)); })) }, sol,
      ['Rewrite the number with the smaller power of ten over the larger one (its coefficient gets smaller).', 'Then add or subtract the coefficients, keep the power of ten, and renormalize if needed.'], 'add/subtract: ' + tex.replace(/\\times 10\^\{(-?\d+)\}/g, 'e$1').replace(/\\[a-z]+|[{}\\]/g, ''));
  }
  function orderPart(r, E, fixed, posTrap) {
    var specs = fixed;
    if (!specs) {
      var hi = [], lo = [];
      while (hi.length < 2) { var h = r.int(70, 99); if (h % 10 && hi.indexOf(h) < 0) hi.push(h); }
      var m1 = r.chance(0.5) ? r.int(2, 4) : nz(r, 15, 49), m2;
      do { m2 = posTrap ? (r.chance(0.5) ? m1 * 10 + r.pick([-5, 5]) : nz(r, 15, 49)) : nz(r, 15, 49); } while (m2 === m1 || m2 === m1 * 10 || m1 === m2 * 10);
      var t1 = nz(r, 11, 29);
      specs = [[hi[0], 0], [hi[1], 0], [m1, 1], [m2, 1], [t1, 2]];
      if (r.chance(0.5)) specs.push([nz(r, 31, 69), 2]), specs.splice(r.int(0, 1), 1);
    }
    var items = specs.map(function (sp, i) { var d = S(sp[0], E + sp[1]); return { id: 'n' + i, d: d, tex: sciT(d) }; });
    items.sort(function (a, b) { return val(a.d) - val(b.d); });
    return P.order(r, 'Order from least to greatest.', items.map(function (x) { return { id: x.id, tex: x.tex }; }), { why: function (a, b) { var A = items.filter(function (x) { return x.id === a; })[0], B = items.filter(function (x) { return x.id === b; })[0]; return sN(A.d) !== sN(B.d) ? t(A.tex) + ' comes after ' + t(B.tex) + '? Compare the exponents first: ' + t(sN(A.d)) + ' vs ' + t(sN(B.d)) + '.' : t(A.tex) + ' and ' + t(B.tex) + ' have the same exponent, so compare the coefficients.'; } },
      'Group by exponent, then compare coefficients within a group:<br>' + items.map(function (x) { return t(x.tex); }).join(', ') + '.', ['Sort by the exponent first (remember ' + t('-6<-5') + ').', 'Only when two exponents are equal do you compare the coefficients.'], 'order sci numbers');
  }
  function tfFix(r, lhs, shownRhs, corRhs, wrongRhs, sol, text) {
    var truth = shownRhs === corRhs, opts = [{ html: '<b>True</b>', right: truth, why: truth ? null : 'Work out the left side yourself and compare it with ' + t(shownRhs) + '.' }];
    if (!truth) opts.push({ html: '<b>False</b> — it should be ' + t(corRhs), right: true });
    wrongRhs.slice(0, truth ? 3 : 2).forEach(function (w) { opts.push({ html: '<b>False</b> — it should be ' + t(w), why: truth ? 'Check again: the statement is actually true.' : 'It is false, but ' + t(w) + ' isn’t the correct value either. Work out the left side step by step.' }); });
    while (opts.length < 4) opts.push({ html: '<b>False</b> — it should be ' + t('0'), why: 'Work out the left side step by step.' });
    var p = P.mc(r, t(lhs + '=' + shownRhs), opts, sol + ' The statement is <b>' + (truth ? 'true' : 'false') + '</b>.', ['Work out the left side yourself, then compare.'], text, true);
    return p;
  }
  function ratioPart(s, kind) {
    var a = BODIES[s[0]], b = BODIES[s[1]], nm = bn(s[1]), A = kind === 'm' ? a.m : a.d, B = kind === 'm' ? b.m : b.d, Ae = kind === 'm' ? a.me : a.de, Be = kind === 'm' ? b.me : b.de;
    var q = Number(A) / Number(B) * P10(Ae - Be), raw = Number(A) / Number(B);
    return sciPart('How many times ' + (kind === 'm' ? 'more massive' : 'wider') + ' than ' + nm + ' is ' + bn(s[0]) + '? Answer in scientific notation to the nearest hundredth (3 significant digits).', dec(q.toPrecision(12)), { sig: 3, place: 'hundredth', diag: cands([[1 / q, 'flip-ratio', '“How many times larger” is the larger quantity divided by the smaller: ' + bn(s[0]) + ' ÷ ' + nm + '.']]) },
      t('\\dfrac{' + A + '\\times 10^{' + Ae + '}}{' + B + '\\times 10^{' + Be + '}}') + ': ' + t(A + '\\div ' + B + '=' + raw.toFixed(4) + '\\ldots') + '; ' + t(Ae + '-' + Be + '=' + (Ae - Be)) + '.<br>' + t(raw.toFixed(4) + '\\ldots\\times 10^{' + (Ae - Be) + '}' + (raw < 1 ? '=' + (raw * 10).toFixed(3) + '\\ldots\\times 10^{' + (Ae - Be - 1) + '}' : '')) + ' ' + t('\\approx') + ' <b>' + t(K.sciTex(q, 3)) + '</b> times.',
      ['Divide: ' + bn(s[0]) + ' ÷ ' + nm + '. Divide the coefficients (calculator) and subtract the exponents.', 'Renormalize if needed, then round the coefficient to the nearest hundredth.'], s[0] + '/' + s[1] + ' ' + (kind === 'm' ? 'mass' : 'diameter'));
  }
})(window);
