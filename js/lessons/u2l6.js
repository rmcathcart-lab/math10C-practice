/* Math 10C · Unit 2 · Lesson 6 — Exponent Laws in Review (AN3)
 * Assignment questions 1–19 (u2_L06.tex; Part F, questions 17–19, is the scientific-notation extension) and the
 * cumulative Lesson 6 Extra Practice (u2_EP06.tex, questions 1–23). Every part is a generator: it keeps the idea and
 * difficulty of the booklet question (the booklet's numbers are one of the possible values) and changes the numbers.
 * Multiple-choice distractors are computed from the generated numbers, one per real misconception, each with a hint.
 * Levels: LIM BEG EMG PRG ADV MAS (recognition formats capped at PRG). */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = K.P;

  HW.addCodes({
    'said-none': 'Said “no meaning” for a power that has a value', 'has-value': 'Gave a value for a power with no real meaning',
    'jordan': 'Repeated Jordan’s answer', 'fix-step2': 'Fixed only Step 3 (coefficient still wrong)', 'fix-step3': 'Fixed only Step 2 (exponent of a still wrong)',
    'neg-power': 'Treated a negative exponent as a negative number', 'no-flip': 'Didn’t take the reciprocal (negative exponent)', 'exp-times': 'Multiplied exponents instead of adding',
    'no-root': 'Didn’t take the root of the coefficient', 'zero-pow': 'Treated a power of 0 as 0', 'no-double': 'Didn’t apply the outside exponent to every factor',
    standard: 'Not in standard form', 'not-round': 'Not rounded as asked', 'same-pair': 'Gave the pair from the question', 'cond': 'Pair doesn’t satisfy the condition',
    'renorm': 'Didn’t renormalize the coefficient', 'sum-sq': 'Multiplied instead of using the power of a power', 'odd-sign': 'Sign of a root of a negative base'
  });

  /* ---------- rational numbers [p, q] ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var x = a % b; a = b; b = x; } return a; }
  function Q(p, q) { if (Array.isArray(p)) return p; q = q == null ? 1 : q; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function qadd(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qsub(a, b) { b = Q(b); return qadd(a, [-b[0], b[1]]); }
  function qmul(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[0], a[1] * b[1]); }
  function qdiv(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1], a[1] * b[0]); }
  function qeq(a, b) { a = Q(a); b = Q(b); return a[0] === b[0] && a[1] === b[1]; }
  function qv(a) { a = Q(a); return a[0] / a[1]; }
  function isInt(a) { return Q(a)[1] === 1; }
  function iroot(x, n) {
    if (x < 0) { if (n % 2 === 0) return null; var r0 = iroot(-x, n); return r0 == null ? null : -r0; }
    var r = Math.round(Math.pow(x, 1 / n)); for (var d = -1; d <= 1; d++) if (r + d >= 0 && Math.pow(r + d, n) === x) return r + d; return null;
  }
  function qpow(c, e) {
    c = Q(c); e = Q(e); var a = iroot(c[0], e[1]), b = iroot(c[1], e[1]);
    if (a == null || b == null) throw new Error('no exact root ' + c + '^' + e);
    var m = Math.abs(e[0]), res = Q(Math.pow(a, m), Math.pow(b, m)); return e[0] < 0 ? Q(res[1], res[0]) : res;
  }
  var rT = function (r) { return ex.texRat(Q(r)); };
  function releq(a, b) { return Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b)); }

  /* ---------- exponents and monomials ---------- */
  function eS(e) { e = Q(e); return e[1] === 1 ? String(e[0]) : e[0] + '/' + e[1]; }                     // working / prompt style: 2/3
  function eF(e) { e = Q(e); return e[1] === 1 ? String(e[0]) : (e[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(e[0]) + '}{' + e[1] + '}'; }
  function pw(b, e, frac) { e = Q(e); if (e[0] === e[1]) return b; return b + '^{' + (frac ? eF(e) : eS(e)) + '}'; }
  function opE(a, b, op) { var bs = eS(b); return eS(a) + op + (Q(b)[0] < 0 ? '(' + bs + ')' : bs); }
  function M(c, v) { var o = {}; Object.keys(v || {}).forEach(function (k) { o[k] = Q(v[k]); }); return { c: Q(c), v: o }; }
  function mmul(A, B) { var v = {}; [A, B].forEach(function (X) { Object.keys(X.v).forEach(function (k) { v[k] = v[k] ? qadd(v[k], X.v[k]) : X.v[k]; }); }); return { c: qmul(A.c, B.c), v: v }; }
  function minv(A) { var v = {}; Object.keys(A.v).forEach(function (k) { v[k] = qmul(A.v[k], -1); }); return { c: qdiv(1, A.c), v: v }; }
  function mdiv(A, B) { return mmul(A, minv(B)); }
  function mpow(A, r) { var v = {}; Object.keys(A.v).forEach(function (k) { v[k] = qmul(A.v[k], r); }); return { c: qpow(A.c, r), v: v }; }
  function cTex(c, hasVars) { c = Q(c); if (c[1] === 1) return hasVars && c[0] === 1 ? '' : hasVars && c[0] === -1 ? '-' : String(c[0]); return (c[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  function keys(A, ord) { return (ord || Object.keys(A.v)).filter(function (k) { return A.v[k] && A.v[k][0] !== 0; }); }
  /* as written in a question or a working line (negative exponents allowed, slash exponents) */
  function rawTex(A, ord, frac) { var vs = keys(A, ord).map(function (k) { return pw(k, A.v[k], frac); }).join(''); return cTex(A.c, !!vs) + vs; }
  /* final answer: positive exponents, one fraction bar */
  function posTex(A, ord) {
    var c = Q(A.c), neg = c[0] < 0, cn = Math.abs(c[0]), cd = c[1], ks = keys(A, ord);
    var nv = ks.filter(function (k) { return A.v[k][0] > 0; }).map(function (k) { return pw(k, A.v[k], true); }).join('');
    var dv = ks.filter(function (k) { return A.v[k][0] < 0; }).map(function (k) { return pw(k, qmul(A.v[k], -1), true); }).join('');
    var num = (cn !== 1 || !nv ? String(cn) : '') + nv, den = (cd !== 1 ? String(cd) : '') + dv;
    return (neg ? '-' : '') + (den ? '\\frac{' + num + '}{' + den + '}' : num);
  }
  function br(s) { return '\\left(' + s + '\\right)'; }
  function fin(A, ord) { var a = rawTex(A, ord), b = posTex(A, ord); return a === b ? a : a + '=' + b; }
  /* working for A × B or A ÷ B: coefficients, then exponents added / subtracted */
  function lawWork(A, B, ord, div) {
    var cw = qeq(B.c, 1) ? cTex(A.c, true) : '\\left(' + cTex(A.c, false) + (div ? '\\div ' : '\\times ') + (Q(B.c)[0] < 0 ? '(' + cTex(B.c, false) + ')' : cTex(B.c, false)) + '\\right)';
    var vs = (ord || []).filter(function (k) { return (A.v[k] && A.v[k][0]) || (B.v[k] && B.v[k][0]); }).map(function (k) {
      var a = A.v[k] || [0, 1], b = B.v[k] || [0, 1];
      if (!b[0]) return pw(k, a); if (!a[0]) return k + '^{' + (div ? opE(0, b, '-') : eS(b)) + '}';
      return k + '^{' + opE(a, b, div ? '-' : '+') + '}';
    }).join('');
    return cw + vs;
  }
  /* value of a number to a rational power, with the root shown: 8^{2/3}=(∛8)^2=4 */
  function rootTex(n, x) { return n === 2 ? '\\sqrt{' + x + '}' : '\\sqrt[' + n + ']{' + x + '}'; }
  function powNote(C, r) {
    r = Q(r); var m = r[0], n = r[1], v = qpow(C, r), cs = cTex(C, false), base = Q(C)[0] < 0 || Q(C)[1] !== 1 ? br(cs) : cs;
    if (n === 1) return base + '^{' + m + '}=' + rT(v);
    var inner = br(rootTex(n, cs)), am = Math.abs(m), core = am === 1 ? rootTex(n, cs) : inner + '^{' + am + '}';
    return base + '^{' + eS(r) + '}=' + (m < 0 ? '\\frac{1}{' + core + '}' : core) + '=' + rT(v);
  }
  /* radical form of k·x^(p/q) */
  function radTex(c, x, e) { e = Q(e); var cs = cTex(c, true); if (e[1] === 1) return cs + pw(x, e, true); return cs + rootTex(e[1], e[0] === 1 ? x : x + '^{' + e[0] + '}'); }
  function expTex(x, e) { return pw(x, e, true); }
  function letters(r, pool, k) { return r.sample(pool, k); }
  function mcOpt(html, right, why, code) { return { html: html, right: !!right, why: why, code: code }; }
  /* MC whose options are values: drop any distractor that matches the answer or another distractor */
  function distinctOpts(right, cands, key) {
    var seen = {}, out = [mcOpt(right.html, true, null)]; seen[key(right)] = 1;
    cands.forEach(function (c) { var k = key(c); if (!seen[k]) { seen[k] = 1; out.push(mcOpt(c.html, false, c.why, c.code)); } });
    return out;
  }
  function sortByVal(opts) { return opts.slice().sort(function (a, b) { return a.val - b.val; }); }

  /* ---------- scientific notation helpers ---------- */
  // exact decimal string for an integer × 10^e (e may be negative)
  function decStr(n, e) {
    var neg = n < 0, s = String(Math.abs(n));
    if (e >= 0) s = s + new Array(e + 1).join('0');
    else { var k = -e; if (s.length <= k) s = '0.' + new Array(k - s.length + 1).join('0') + s; else s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); }
    return (neg ? '-' : '') + s;
  }
  function stdTex(n, e) { var s = decStr(n, e); if (s.indexOf('.') < 0) return F(Number(s)); var p = s.split('.'); return p[0] + '.' + p[1].replace(/(\d{3})(?=\d)/g, '$1\\,'); }
  function sciT(x, sig) { return K.sciTex(x, sig); }
  // K.sci compares with an absolute tolerance for very small values; re-check the value relatively
  function sciChk(x, opt) {
    opt = opt || {}; var base = K.sci(x, opt);
    return function (resp) { var res = base(resp); if (res.v === 'correct' && !opt.sig) { var a = K.read(resp); if (a.ast && !releq(a.val, x)) return wrong('value', null); } return res; };
  }
  function sciPart(prompt, x, opt, sol, hints, text) { var p = P.sci(prompt, x, opt, sol, hints, text); p.check = sciChk(x, opt); return p; }
  function stdChk(x) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim(); if (!s) return form('empty', 'Type your answer first.');
      var pn = HW.parse.number(s);
      if (!pn.ok) { var a = K.read(s); if (a.res) return a.res; if (releq(a.val, x)) return form('standard', 'Right value — now write it in <b>standard (decimal) form</b>, with no power of ' + t('10') + '.'); return wrong('value', null); }
      if (releq(pn.value, x)) return ok();
      var lg = Math.log10(Math.abs(pn.value / x));
      if (isFinite(lg) && Math.abs(lg - Math.round(lg)) < 1e-9 && Math.round(lg) !== 0) { var d = Math.abs(Math.round(lg)); return wrong('power-off', 'The digits are right, but the decimal point is ' + d + ' place' + (d > 1 ? 's' : '') + ' off. Count the places again.'); }
      return wrong('value', null);
    };
  }
  // any exact form (standard or scientific) of a value
  function anyNum(x) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (releq(a.val, x)) return ok();
      var lg = Math.log10(Math.abs(a.val / x));
      if (isFinite(lg) && Math.abs(lg - Math.round(lg)) < 1e-9 && Math.round(lg) !== 0) return wrong('power-off', 'The digits are right, but the size is off by a factor of ' + t('10^{' + Math.abs(Math.round(lg)) + '}') + '.');
      return wrong('value', null);
    };
  }
  function num1(x) { return Number(x.toFixed(6)); } // tidy decimals like 2.4*5.5

  /* ---------- "no meaning" or a value (Extra 6) ---------- */
  function noneOr(val, noneWhy, valueWhy, diag) {
    var chk = val == null ? null : K.fraction(val, { diag: diag });
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type the value, or press <b>none</b> if the power has no meaning as a real number.');
      if (/^none$/i.test(s) || /\\text\{\s*none\s*\}/.test(s)) return val == null ? ok() : wrong('said-none', noneWhy);
      if (val == null) { var a = K.read(s); if (a.res) return a.res; return wrong('has-value', valueWhy); }
      return chk(s);
    };
  }

  /* =====================================================================================================
   * Assignment parts
   * ===================================================================================================== */

  /* Q1 — base / coefficient / the −c⁰ trap: exactly one statement is true */
  function q1(r) {
    var c = r.pick(['c', 'a', 'x', 'm']), b = r.pick([2, 3, 4, 5, 6, 7]), n = r.pick([3, 4, 5]);
    var w = r.pick(['x', 'y', 'p', 'k'].filter(function (x) { return x !== c; })), k = r.pick([2, 3, 4, 5, 6]);
    var pq = r.pick([[3, 7], [2, 5], [4, 9], [5, 8], [3, 4], [2, 9], [5, 6], [7, 9]]), p = pq[0], q = pq[1], tr = r.pick([0, 1, 2, 2, 3]);
    var pow = '(-' + b + ')^{' + n + '}', term = '-\\dfrac{' + p + w + '^{' + k + '}}{' + q + '}';
    var S = [
      { yes: 'In ' + t(pow) + ', the base is ' + t('-' + b) + '.', no: 'In ' + t(pow) + ', the base is ' + t(b) + '.',
        why: 'The brackets make the whole of ' + t('-' + b) + ' the base: ' + t(pow + '=(-' + b + ')\\times(-' + b + ')\\times\\cdots') + '.',
        sol: 'The brackets make ' + t('-' + b) + ' the base.' },
      { yes: 'The coefficient of ' + t(term) + ' is ' + t('-\\frac{' + p + '}{' + q + '}') + '.', no: 'The coefficient of ' + t(term) + ' is ' + t('-' + p) + '.',
        why: 'The coefficient is the whole number multiplying the power: ' + t(term + '=-\\frac{' + p + '}{' + q + '}' + w + '^{' + k + '}') + '.',
        sol: t(term + '=-\\frac{' + p + '}{' + q + '}' + w + '^{' + k + '}') + ', so the coefficient is ' + t('-\\frac{' + p + '}{' + q + '}') + '.' },
      { yes: t('-' + c + '^{0}=-1'), no: t('-' + c + '^{0}=1'),
        why: 'Without brackets the exponent ' + t('0') + ' applies only to ' + t(c) + ': ' + t('-' + c + '^{0}=-(' + c + '^{0})=-1') + '.',
        sol: 'The exponent applies only to ' + t(c) + ': ' + t('-' + c + '^{0}=-(1)=-1') + '.' },
      { yes: t('(-' + c + ')^{0}=1'), no: t('(-' + c + ')^{0}=-1'),
        why: 'With brackets the whole of ' + t('-' + c) + ' is the base, and any nonzero base to the power ' + t('0') + ' is ' + t('1') + '.',
        sol: 'The whole of ' + t('-' + c) + ' is the base, so ' + t('(-' + c + ')^{0}=1') + '.' }];
    var opts = S.map(function (s, i) { return mcOpt(i === tr ? s.yes : s.no, i === tr, i === tr ? null : s.why); });
    return P.mc(r, 'Which statement is true? (Assume ' + t(c + '\\neq 0') + '.)', opts,
      S.map(function (s, i) { return (i === tr ? '✔ ' : '✘ ') + (i === tr ? s.yes : s.no) + ' — ' + s.sol; }).join('<br>'),
      ['Check each statement: what exactly is the base when there are (or aren’t) brackets?', 'The coefficient is the entire number multiplying the variable part, fraction and sign included.'], 'base/coefficient/zero-exponent statements');
  }

  /* Q2 — two expansions as repeated multiplication */
  function q2(r) {
    var L1 = r.pick([['m', 'n'], ['a', 'b'], ['x', 'y']]), L2 = r.pick([['p', 'q'], ['r', 's'], ['c', 'd']]), u = L1[0], v = L1[1], pp = L2[0], qq = L2[1];
    var k = r.int(2, 9), e = r.int(3, 5), j = r.int(2, 9), f = r.int(2, 3), ok1 = r.chance(0.6), ok2 = r.chance(0.35);
    function rep(x, n) { var a = []; for (var i = 0; i < n; i++) a.push(x); return a; }
    var e1 = ok1 ? [k, u].concat(rep(v, e)) : [k].concat(rep(u, e)).concat(rep(v, e));
    var e2 = ok2 ? [j].concat(rep(pp, f)).concat(rep(qq, f)) : rep(j, f).concat(rep(pp, f)).concat(rep(qq, f));
    var s1 = k + u + v + '^{' + e + '}', s2 = j + '(' + pp + qq + ')^{' + f + '}';
    var why1 = ok1 ? 'Statement 1 is correct: ' + t(s1) + ' has one ' + t(k) + ', one ' + t(u) + ' and ' + e + ' factors of ' + t(v) + '.' : 'Check Statement 1: in ' + t(s1) + ' the exponent ' + t(e) + ' belongs only to ' + t(v) + ', so ' + t(u) + ' appears just once.';
    var why2 = ok2 ? 'Statement 2 is correct: only ' + t(pp) + ' and ' + t(qq) + ' are inside the brackets, and ' + t(j) + ' appears once.' : 'Check Statement 2: only ' + t(pp) + ' and ' + t(qq) + ' are inside the brackets. The ' + t(j) + ' outside is a coefficient, used once — it is not squared or cubed.';
    var claims = [[true, false], [false, true], [true, true], [false, false]], texts = ['Statement 1 is correct and Statement 2 is incorrect.', 'Statement 2 is correct and Statement 1 is incorrect.', 'Both statements are correct.', 'Both statements are incorrect.'];
    var opts = claims.map(function (cl, i) { var right = cl[0] === ok1 && cl[1] === ok2; return mcOpt(texts[i], right, right ? null : (cl[1] !== ok2 ? why2 : why1)); });
    return P.mc(r, 'Consider the following two statements about repeated multiplication.\\[\\text{Statement 1: } ' + s1 + '=' + e1.join('\\times ') + '\\]\\[\\text{Statement 2: } ' + s2 + '=' + e2.join('\\times ') + '\\]Which one of the following is true?', opts,
      '<b>Statement 1:</b> ' + t(s1) + ' is one ' + t(k) + ', one ' + t(u) + ' and ' + e + ' factors of ' + t(v) + ': ' + t(s1 + '=' + [k, u].concat(rep(v, e)).join('\\times ')) + '. ' + (ok1 ? 'Correct.' : 'So the statement is <b>incorrect</b>.') +
      '<br><b>Statement 2:</b> only ' + t(pp) + ' and ' + t(qq) + ' are inside the brackets, so ' + t(s2 + '=' + [j].concat(rep(pp, f)).concat(rep(qq, f)).join('\\times ')) + '. ' + (ok2 ? 'Correct.' : 'Repeating the ' + t(j) + ' is <b>incorrect</b>.'),
      ['An exponent applies only to the base right in front of it (or to the whole bracket it is attached to).'], 'expansions ' + s1 + ', ' + s2, true);
  }

  /* Q3 — which expressions simplify to c^T */
  function q3(r) {
    var c = r.pick(['c', 'b', 'x', 'y']), T = r.pick([8, 10, 12]), a = r.int(2, T - 2), d = r.int(2, 4), e = r.int(3, 8);
    var items = [{ tex: c + '^{' + a + '}\\times ' + c + '^{' + (T - a) + '}', ok: true, how: t(c + '^{' + a + '+' + (T - a) + '}=' + c + '^{' + T + '}') + ' (Product Law) ✔' },
      { tex: c + '^{' + (T + d) + '}+' + c + '^{' + d + '}', ok: false, how: 'a sum of unlike terms — no exponent law applies ✘' },
      { tex: c + '^{' + (T + e) + '}\\div ' + c + '^{' + e + '}', ok: true, how: t(c + '^{' + (T + e) + '-' + e + '}=' + c + '^{' + T + '}') + ' (Quotient Law) ✔' },
      { tex: c + '^{' + (T / 2) + '}+' + c + '^{' + (T / 2) + '}', ok: false, how: t('=2' + c + '^{' + (T / 2) + '}\\neq ' + c + '^{' + T + '}') + ' ✘' }];
    var shown = r.shuffle(items), R = ['I', 'II', 'III', 'IV'];
    var good = [], bad = []; shown.forEach(function (it, i) { (it.ok ? good : bad).push(R[i]); });
    var pairs = [good, bad].sort(function (x, y) { return R.indexOf(x[0]) - R.indexOf(y[0]); });
    var opts = pairs.map(function (pr) { var right = pr === good; return mcOpt(pr[0] + ' and ' + pr[1] + ' only', right, right ? null : 'Those are the sums. Adding powers never combines exponents: ' + t(c + '^{' + (T / 2) + '}+' + c + '^{' + (T / 2) + '}=2' + c + '^{' + (T / 2) + '}') + '.'); });
    opts.push(mcOpt('I, II, III, and IV', false, 'Check the two sums: exponent laws are for powers that are <b>multiplied</b> or <b>divided</b>, not added.'));
    opts.push(mcOpt('none of I, II, III, and IV', false, 'Two of them do work: the Product Law adds exponents and the Quotient Law subtracts them.'));
    return P.mc(r, 'Which of the following can be simplified to ' + t(c + '^{' + T + '}') + '?\\[' + shown.map(function (it, i) { return '\\text{' + R[i] + '.}\\ \\ ' + it.tex; }).join('\\qquad ') + '\\]', opts,
      shown.map(function (it, i) { return R[i] + ': ' + t(it.tex) + ' — ' + it.how; }).join('<br>') + '<br>Only ' + good.join(' and ') + ' work.',
      ['The Product and Quotient Laws only apply when powers of the same base are multiplied or divided.'], 'which simplify to ' + c + '^' + T, true);
  }

  /* Q4 / Q5 — product and quotient laws with coefficients */
  function q4(r) {
    var x = r.pick(['b', 'x', 'y', 'm', 'a']), a = r.int(2, 9), b = r.int(2, 9), m = r.int(2, 8), n = r.int(2, 8);
    if (a === 2 && b === 2) b = 3; if (m === 2 && n === 2) n = 3;
    var mono = function (c, e) { return t(c + pw(x, e)); };
    var opts = distinctOpts({ html: mono(a * b, m + n) }, [
      { html: mono(a + b, m * n), why: 'Both parts are backwards: <b>multiply</b> the coefficients and <b>add</b> the exponents.', k: (a + b) + '|' + m * n },
      { html: mono(a * b, m * n), why: 'The coefficient is right, but for a product of powers the exponents are <b>added</b> (Product Law). Multiplying exponents is for a power of a power.', k: a * b + '|' + m * n },
      { html: mono(a + b, m + n), why: 'The exponent is right, but the coefficients are <b>multiplied</b>: ' + t(a + '\\times ' + b) + '.', k: (a + b) + '|' + (m + n) }],
      function (o) { return o.k || (a * b + '|' + (m + n)); });
    return P.mc(r, t(a + x + '^{' + m + '}\\times ' + b + x + '^{' + n + '}') + ' can be simplified to', opts,
      'Multiply the coefficients and add the exponents: ' + t(a + x + '^{' + m + '}\\times ' + b + x + '^{' + n + '}=(' + a + '\\times ' + b + ')' + x + '^{' + m + '+' + n + '}=' + (a * b) + x + '^{' + (m + n) + '}') + '.',
      ['Deal with the numbers and the powers separately.'], 'product law ' + a + x + '^' + m + '×' + b + x + '^' + n);
  }
  function q5(r) {
    var x = r.pick(['x', 'y', 'b', 'n', 'a']), q = r.int(2, 6), b = r.int(2, 6), m = r.int(10, 20), n = r.int(2, 9);
    if (q === 2 && b === 2) b = 3; var a = b * q;
    var mono = function (c, e) { return t(c + pw(x, e)); };
    var opts = distinctOpts({ html: mono(q, m - n) }, [
      { html: mono(q, m + n), why: 'Dividing powers of the same base <b>subtracts</b> the exponents (Quotient Law).', k: q + '|' + (m + n) },
      { html: mono(a - b, m - n), why: 'The exponent is right, but the coefficients are <b>divided</b>: ' + t(a + '\\div ' + b) + ', not subtracted.', k: (a - b) + '|' + (m - n) },
      { html: mono(a - b, m + n), why: 'Divide the coefficients and subtract the exponents.', k: (a - b) + '|' + (m + n) }],
      function (o) { return o.k || (q + '|' + (m - n)); });
    return P.mc(r, t('\\dfrac{' + a + x + '^{' + m + '}}{' + b + x + '^{' + n + '}}') + ' can be simplified to', opts,
      'Divide the coefficients and subtract the exponents: ' + t('\\dfrac{' + a + x + '^{' + m + '}}{' + b + x + '^{' + n + '}}=\\left(\\dfrac{' + a + '}{' + b + '}\\right)' + x + '^{' + m + '-' + n + '}=' + q + pw(x, m - n)) + '.',
      ['Deal with the numbers and the powers separately.'], 'quotient law ' + a + x + '^' + m + '/' + b + x + '^' + n);
  }

  /* Q7–Q9 — negative exponents */
  function q7(r) {
    var y = r.pick(['y', 'x', 'm', 'a', 'k']), n = r.int(2, 9);
    var opts = [mcOpt(t('\\dfrac{1}{' + y + '^{' + n + '}}'), true),
      mcOpt(t('\\dfrac{1}{' + y + '^{-' + n + '}}'), false, 'That is the reciprocal of ' + t(y + '^{-' + n + '}') + ', which equals ' + t(y + '^{' + n + '}') + '. A negative exponent means: take the reciprocal <b>and</b> make the exponent positive.'),
      mcOpt(t('-' + n + y), false, 'An exponent is not a multiplier. A negative exponent means the reciprocal of the positive power.'),
      mcOpt(t('\\dfrac{1}{' + y + '^{1/' + n + '}}'), false, 'The exponent stays ' + t(n) + ' (just positive); ' + t('\\frac{1}{' + n + '}') + ' would be a root.')];
    return P.mc(r, t(y + '^{-' + n + '}') + ' is equivalent to', opts, 'A negative exponent means the reciprocal of the positive power: ' + t(y + '^{-' + n + '}=\\dfrac{1}{' + y + '^{' + n + '}}') + '.', ['Negative exponent Law: ' + t('a^{-n}=\\frac{1}{a^{n}}') + '.'], 'y^-' + n);
  }
  function q8(r) {
    var x = r.pick(['x', 'y', 'm', 'b']), q = r.int(2, 6), b = r.int(2, 6), m = r.int(2, 6), n = r.int(2, 9);
    if (q === 2 && b === 2) b = 5; if (m === n) n = m + 1; var a = b * q;
    var mono = function (c, e) { return t(c + pw(x, e)); };
    var opts = distinctOpts({ html: mono(q, m + n) }, [
      { html: mono(q, m - n), why: 'Subtract the exponent of the denominator, sign and all: ' + t(m + '-(-' + n + ')=' + m + '+' + n) + '.', k: q + '|' + (m - n) },
      { html: mono(a - b, m + n), why: 'The exponent is right, but the coefficients are <b>divided</b>: ' + t(a + '\\div ' + b + '=' + q) + '.', k: (a - b) + '|' + (m + n) },
      { html: mono(a - b, m - n), why: 'Divide the coefficients, and subtract the exponents carefully: ' + t(m + '-(-' + n + ')') + '.', k: (a - b) + '|' + (m - n) }],
      function (o) { return o.k || (q + '|' + (m + n)); });
    return P.mc(r, t('\\dfrac{' + a + x + '^{' + m + '}}{' + b + x + '^{-' + n + '}}') + ' can be simplified to', opts,
      t('\\dfrac{' + a + x + '^{' + m + '}}{' + b + x + '^{-' + n + '}}=\\left(\\dfrac{' + a + '}{' + b + '}\\right)' + x + '^{' + m + '-(-' + n + ')}=' + q + x + '^{' + (m + n) + '}') + '.',
      ['Quotient Law: subtract the exponent in the denominator. Watch the double negative.'], 'quotient with negative exponent');
  }
  function q9(r) {
    var y = r.pick(['y', 'x', 'n', 'p']), k = r.int(2, 9), n = r.int(2, 5);
    var opts = [mcOpt(t('\\dfrac{' + k + '}{' + y + '^{' + n + '}}'), true),
      mcOpt(t('\\dfrac{1}{' + k + y + '^{' + n + '}}'), false, 'The exponent ' + t('-' + n) + ' belongs only to ' + t(y) + '. The coefficient ' + t(k) + ' is not affected, so it stays in the numerator.'),
      mcOpt(t('-' + (k * n) + y), false, 'An exponent is not a multiplier. ' + t(y + '^{-' + n + '}') + ' means ' + t('\\frac{1}{' + y + '^{' + n + '}}') + '.'),
      mcOpt(t('\\dfrac{1}{' + Math.pow(k, n) + y + '^{' + n + '}}'), false, 'That would be ' + t('(' + k + y + ')^{-' + n + '}') + '. Without brackets, only ' + t(y) + ' has the exponent.')];
    return P.mc(r, t(k + y + '^{-' + n + '}') + ' is equivalent to', opts,
      'The exponent ' + t('-' + n) + ' applies only to ' + t(y) + ': ' + t(k + y + '^{-' + n + '}=' + k + '\\times\\dfrac{1}{' + y + '^{' + n + '}}=\\dfrac{' + k + '}{' + y + '^{' + n + '}}') + '.', ['Which part of ' + t(k + y + '^{-' + n + '}') + ' does the exponent belong to?'], k + 'y^-' + n);
  }

  /* Q10 — rational exponent to radical form */
  function q10(r) {
    var x = r.pick(['x', 'y', 'a', 'm']), n = r.int(3, 9), cands = []; for (var m = 2; m < n; m++) if (gcd(m, n) === 1) cands.push(m);
    var m2 = r.pick(cands);
    var opts = [mcOpt(t('\\sqrt[' + n + ']{' + x + '^{' + m2 + '}}'), true),
      mcOpt(t('\\sqrt[' + m2 + ']{' + x + '^{' + n + '}}'), false, 'Swapped: the <b>denominator</b> ' + t(n) + ' is the index of the root and the numerator ' + t(m2) + ' is the power.'),
      mcOpt(t(n + '\\sqrt{' + x + '^{' + m2 + '}}'), false, 'The denominator ' + t(n) + ' is not a coefficient — it becomes the index of the root.'),
      mcOpt(t('\\dfrac{1}{' + n + '}\\sqrt{' + x + '^{' + m2 + '}}'), false, 'A fractional exponent is a root, not a fraction in front: ' + t(x + '^{m/n}=\\sqrt[n]{' + x + '^{m}}') + '.')];
    return P.mc(r, 'Expressed in radical form, ' + t(x + '^{' + m2 + '/' + n + '}') + ' is equivalent to', opts,
      'The denominator ' + t(n) + ' becomes the index of the radical and the numerator ' + t(m2) + ' becomes the power inside: ' + t(x + '^{' + m2 + '/' + n + '}=\\sqrt[' + n + ']{' + x + '^{' + m2 + '}}') + '.', [t('a^{m/n}=\\sqrt[n]{a^{m}}') + ': denominator = index.'], x + '^' + m2 + '/' + n + ' radical form');
  }

  /* Q11 — evaluate p^{3/2} − q^{−2/3} */
  function q11(r) {
    var p = r.pick([4, 9, 16]), s = r.pick([2, 3, 4, 5]), q = -s * s * s, A = Math.pow(Math.sqrt(p), 3), B = 1 / (s * s), x = A - B;
    var rd = function (v) { return K.roundTo(v, 1); };
    return P.approx('If ' + t('p=' + p) + ' and ' + t('q=' + q) + ', the value of ' + t('p^{3/2}-q^{-2/3}') + ' to the nearest tenth is ________.', x, 1, { nr: true, diag: function (v) {
      if (v === rd(A + B)) return { code: 'neg-power', hint: t('q^{2/3}=(\\sqrt[3]{' + q + '})^{2}=(' + (-s) + ')^{2}=' + (s * s)) + ' is positive, and the negative exponent only means reciprocal — it doesn’t make the value negative.' };
      if (v === rd(A - s * s) || v === rd(A + s * s)) return { code: 'no-flip', hint: 'The exponent on ' + t('q') + ' is <b>negative</b>: ' + t('q^{-2/3}=\\dfrac{1}{q^{2/3}}') + '.' };
      if (v === rd(p * 1.5 - B)) return { code: 'exp-times', hint: t('p^{3/2}') + ' is not ' + t('p\\times\\frac{3}{2}') + '. It means ' + t('(\\sqrt{p})^{3}') + '.' };
      return null; } },
      t('p^{3/2}=' + p + '^{3/2}=(\\sqrt{' + p + '})^{3}=' + Math.sqrt(p) + '^{3}=' + A) + '.<br>' + t('q^{2/3}=(\\sqrt[3]{' + q + '})^{2}=(' + (-s) + ')^{2}=' + (s * s)) + ', so ' + t('q^{-2/3}=\\dfrac{1}{' + (s * s) + '}\\approx ' + K.roundTo(B, 4)) + '.<br>' + t(A + '-\\frac{1}{' + (s * s) + '}=' + K.roundTo(x, 4) + '\\approx ' + K.roundTo(x, 1).toFixed(1)),
      ['Root first, then power: ' + t('a^{m/n}=(\\sqrt[n]{a})^{m}') + '.', 'A negative exponent means reciprocal; an even power of a negative number is positive.'], 'p^(3/2)-q^(-2/3), p=' + p + ', q=' + q);
  }

  /* Q12 — product of two radicals as a^{p/D} */
  function q12(r) {
    var pair, m1, m2, D, p;
    for (var g = 0; g < 200; g++) {
      pair = r.pick([[3, 2], [3, 2], [2, 3], [4, 3], [3, 4], [5, 2], [2, 5]]);
      var n1 = pair[0], n2 = pair[1]; D = n1 * n2 / gcd(n1, n2);
      m1 = r.pick([1, 2, 4, 5, 7].filter(function (m) { return gcd(m, n1) === 1 && m < 2 * n1 + 1; }));
      m2 = r.pick([1, 3, 5, 7].filter(function (m) { return gcd(m, n2) === 1 && m < 3 * n2; }));
      p = m1 * D / n1 + m2 * D / n2; if (gcd(p, D) === 1 && m1 > 1 && p !== m1 + m2) break;
    }
    var n1 = pair[0], n2 = pair[1];
    var r1 = rootTex(n1, pw('a', m1)), r2 = rootTex(n2, pw('a', m2));
    var mult = qmul(Q(m1, n1), Q(m2, n2)), multP = qmul(mult, D);
    return P.nr(t(br(r1) + br(r2)) + ' can be written in the form ' + t('a^{p/' + D + '}') + '. The value of ' + t('p') + ' is ________.', p, function (v) {
      if (v === m1 + m2) return { code: 'exp', hint: 'Write each radical as a power first (' + t(rootTex(n1, 'a^{' + m1 + '}') + '=a^{' + m1 + '/' + n1 + '}') + '), then add the exponents over a common denominator of ' + t(D) + '.' };
      if (isInt(multP) && v === qv(multP)) return { code: 'exp-times', hint: 'The powers are <b>multiplied</b>, so the exponents are <b>added</b> (Product Law), not multiplied.' };
      return null; },
      'Rewrite each radical as a power: ' + t(r1 + '=a^{' + m1 + '/' + n1 + '}') + ', ' + t(r2 + '=a^{' + m2 + '/' + n2 + '}') + '.<br>Multiplying adds the exponents over a common denominator of ' + t(D) + ': ' + t('a^{\\frac{' + (m1 * D / n1) + '}{' + D + '}+\\frac{' + (m2 * D / n2) + '}{' + D + '}}=a^{' + p + '/' + D + '}') + ', so ' + t('p=' + p) + '.',
      ['Change each radical to a rational exponent: the index is the denominator.', 'Use the Product Law: add the exponents (common denominator ' + t(D) + ').'], 'radicals to a^(p/' + D + ')');
  }

  /* Q13 — (C x^e)^{m/n} */
  function q13(r) {
    var x = r.pick(['x', 'y', 'a', 'm']), spec = r.pick([[3, 2, [2, 3, 4, 5]], [3, 2, [2, 3, 4, 5]], [2, 3, [3, 4, 5, 6, 7]], [4, 3, [2, 3]], [3, 4, [2]]]);
    var n = spec[0], m = spec[1], k = r.pick(spec[2]), j = r.int(1, 3), C = Math.pow(k, n), e = n * j, cR = Math.pow(k, m), eR = j * m;
    var mono = function (c, ee) { return t(c + x + (ee === 1 ? '' : '^{' + ee + '}')); };
    var cands = [];
    if ((C * m) % n === 0) cands.push({ html: mono(C * m / n, eR), why: 'The coefficient is raised to the power ' + t(m + '/' + n) + ' — don’t multiply ' + t(C + '\\times\\frac{' + m + '}{' + n + '}') + '. ' + t(C + '^{' + m + '/' + n + '}=(\\sqrt[' + n + ']{' + C + '})^{' + m + '}') + '.', k: (C * m / n) + '|' + eR });
    if ((e * n) % m === 0) cands.push({ html: mono(cR, e * n / m), why: 'Check the exponent: power of a power means ' + t(e + '\\times\\frac{' + m + '}{' + n + '}') + ', not ' + t(e + '\\times\\frac{' + n + '}{' + m + '}') + '.', k: cR + '|' + (e * n / m) });
    cands.push({ html: mono(C, eR), why: 'The exponent ' + t(m + '/' + n) + ' applies to the ' + t(C) + ' as well (Power of a Product Law).', k: C + '|' + eR });
    cands.push({ html: mono(cR, e * m), why: 'Multiply ' + t(e) + ' by the whole exponent ' + t('\\frac{' + m + '}{' + n + '}') + ', not just by ' + t(m) + '.', k: cR + '|' + (e * m) });
    cands.push({ html: mono(k, eR), why: 'You took the root of ' + t(C) + ' but forgot to raise it to the power ' + t(m) + '.', k: k + '|' + eR });
    var opts = distinctOpts({ html: mono(cR, eR) }, cands, function (o) { return o.k || (cR + '|' + eR); }).slice(0, 4);
    return P.mc(r, t('\\left(' + C + x + '^{' + e + '}\\right)^{' + m + '/' + n + '}') + ' simplifies to', opts,
      t(powNote(C, Q(m, n))) + ' and ' + t(x + '^{' + e + '\\cdot\\frac{' + m + '}{' + n + '}}=' + x + (eR === 1 ? '' : '^{' + eR + '}')) + ', so the answer is ' + mono(cR, eR) + '.',
      ['Apply the exponent to the number and to the power of ' + t(x) + '.', 'For the number, take the root first, then the power.'], '(' + C + x + '^' + e + ')^(' + m + '/' + n + ')');
  }

  /* Q14 — x^u · x^v ÷ x^w */
  function q14(r) {
    var x = r.pick(['x', 'y', 'a', 'b']), sp = r.pick([[[1, 2], [1, 3], 1], [[1, 2], [1, 3], 1], [[1, 2], [1, 4], 1], [[1, 3], [1, 4], 1], [[2, 3], [1, 4], 1], [[1, 2], [1, 5], 1], [[3, 2], [1, 3], 2], [[3, 4], [1, 2], 2], [[2, 5], [1, 2], 1]]);
    var u = Q(sp[0]), v = Q(sp[1]), T = Q(sp[2]), w = qsub(qadd(u, v), T);
    var ex1 = function (e) { return t(pw(x, e)); };
    var opts = distinctOpts({ html: ex1(T) }, [
      { html: ex1(qadd(qadd(u, v), w)), why: 'Dividing by ' + t(pw(x, w)) + ' subtracts a <b>negative</b> exponent: ' + t(opE(qadd(u, v), w, '-')) + ' — the result goes up.', k: eS(qadd(qadd(u, v), w)) },
      { html: ex1(qmul(u, v)), why: 'When powers are multiplied, <b>add</b> the exponents — don’t multiply them.', k: eS(qmul(u, v)) },
      { html: ex1(qadd(u, v)), why: 'That is just ' + t(pw(x, u) + '\\cdot ' + pw(x, v)) + '. You still have to divide by ' + t(pw(x, w)) + '.', k: eS(qadd(u, v)) }],
      function (o) { return o.k || eS(T); });
    return P.mc(r, t(pw(x, u) + '\\cdot ' + pw(x, v) + '\\div ' + pw(x, w)) + ' simplifies to', opts,
      'Product Law: ' + t(eS(u) + '+' + eS(v) + '=' + eS(qadd(u, v))) + '. Quotient Law: ' + t(opE(qadd(u, v), w, '-') + '=' + eS(T)) + ', so the result is ' + ex1(T) + '.',
      ['Add exponents for multiplication, subtract for division. Use a common denominator.'], 'x^u x^v / x^w rational');
  }

  /* Q15 — (C a^{e1})^{r}·D a^{e2} = k a^n, find k+n */
  function q15(r) {
    var sp = r.pick([[3, 2, [2, 3, 4]], [3, 2, [2, 3, 4]], [2, 3, [2, 3]], [3, 4, [2]]]), m = sp[0], n = sp[1], k0 = r.pick(sp[2]), C = Math.pow(k0, n), R = Q(m, n);
    var js = [1, 2, 3].filter(function (j) { return j % m !== 0; }).slice(0, 2), j = r.pick(js), e1 = Q(-j * n, m);
    var D = r.pick([2, 3, 5]), e2 = r.int(j + 1, j + 3), N = e2 - j, Kc = Math.pow(k0, m) * D, ans = Kc + N;
    var mono = M(C, { a: e1 }), afterP = mpow(mono, R);
    return P.nr(t(br(C + 'a^{' + eS(e1) + '}') + '^{' + eS(R) + '}\\cdot ' + D + 'a^{' + e2 + '}') + ' can be written in the form ' + t('ka^{n}') + '. The value of ' + t('k+n') + ' is ________.', ans, function (v) {
      if (v === C * D + N) return { code: 'no-root', hint: 'The exponent ' + t(eS(R)) + ' applies to the ' + t(C) + ' too: ' + t(powNote(C, R)) + '.' };
      if (v === Kc + e2 + j) return { code: 'sign', hint: 'Check the sign: ' + t('\\left(' + eS(e1) + '\\right)\\left(' + eS(R) + '\\right)=-' + j) + '.' };
      if (v === Math.pow(k0, m) + D + N) return { code: 'coef', hint: 'Coefficients are multiplied, not added.' };
      if (v === Kc) return { code: 'incomplete', hint: 'That is ' + t('k') + '. Add ' + t('n') + ' as well.' };
      return null; },
      t(powNote(C, R)) + ' and ' + t('a^{(' + eS(e1) + ')(' + eS(R) + ')}=a^{-' + j + '}') + ', so ' + t(br(C + 'a^{' + eS(e1) + '}') + '^{' + eS(R) + '}=' + rawTex(afterP, ['a'])) + '.<br>' +
      t(rawTex(afterP, ['a']) + '\\cdot ' + D + 'a^{' + e2 + '}=' + Kc + 'a^{-' + j + '+' + e2 + '}=' + Kc + (N === 1 ? 'a' : 'a^{' + N + '}')) + ', so ' + t('k=' + Kc) + ', ' + t('n=' + N) + ' and ' + t('k+n=' + ans) + '.',
      ['Power of a product first: the outside exponent applies to the ' + t(C) + ' and to the power of ' + t('a') + '.', 'Then multiply: coefficients multiply, exponents add.'], 'k+n for (' + C + 'a^' + eS(e1) + ')^' + eS(R));
  }

  /* Q16 — Jordan’s simplification (shared numbers) */
  function q16shared(r) {
    var C = r.pick([27, 27, 216]), rn = r.pick([-2, -2, -1]), Rr = Q(rn, 3), u = r.int(1, 2), v = r.int(1, 2), w;
    var al = u * rn, be = -v * rn; // a exponent after step 1 (negative), b exponent (positive)
    do { w = r.int(2, 5); } while (al + w === 0);
    var s = Math.round(Math.pow(Math.round(Math.cbrt(C)), -rn)), J = C * rn / 3; // C^r = 1/s ; Jordan's coefficient
    var full = M(Q(1, s), { a: al + w, b: be });
    var orig = br(C + 'a^{' + (3 * u) + '}b^{-' + (3 * v) + '}') + '^{' + eS(Rr) + '}\\cdot\\left(a^{1/2}\\right)^{' + (2 * w) + '}';
    var s1 = C + '^{' + eS(Rr) + '}' + pw('a', al) + pw('b', be) + '\\cdot ' + pw('a', w);
    var s2 = J + pw('a', al) + pw('b', be) + '\\cdot ' + pw('a', w), s3 = J + pw('a', al * w) + pw('b', be), s4 = '-\\dfrac{' + (-J) + pw('b', be) + '}{' + pw('a', -al * w) + '}';
    return { C: C, Rr: Rr, rn: rn, u: u, v: v, w: w, al: al, be: be, s: s, J: J, full: full, orig: orig, steps: [s1, s2, s3, s4] };
  }
  function q16stem(sh) {
    return '<b>Written response.</b> Jordan simplified ' + t(sh.orig) + ' as shown.\\[\\begin{array}{rl}\\text{Step 1:} & ' + sh.orig + '=' + sh.steps[0] + '\\\\ \\text{Step 2:} & =' + sh.steps[1] + '\\\\ \\text{Step 3:} & =' + sh.steps[2] + '\\\\ \\text{Step 4:} & =' + sh.steps[3] + '\\end{array}\\]';
  }

  /* Q17–Q19 — scientific notation (extension) */
  function q17(r) {
    var a, b, pr;
    for (var g = 0; g < 300; g++) { a = r.int(12, 95) / 10; b = r.int(12, 95) / 10; pr = Math.round(a * b * 100); if (pr >= 1000 && pr % 10 === 0) break; }
    if (g >= 300) { a = 2.4; b = 5.5; pr = 1320; }
    var p = r.int(-6, -1), q = r.int(3, 8), n = p + q + 1, c = num1(pr / 1000);
    var opts = [{ val: n, right: true }, { val: n - 1, why: 'You added the exponents, but ' + t(num1(pr / 100) + '\\times 10^{' + (p + q) + '}') + ' isn’t proper scientific notation yet: ' + t(num1(pr / 100)) + ' is not less than ' + t('10') + '. Moving the decimal one place left adds ' + t('1') + ' to the exponent.' },
      { val: n - 2, why: 'Renormalizing ' + t(num1(pr / 100)) + ' to ' + t(c) + ' makes the coefficient smaller, so the exponent goes <b>up</b> by ' + t('1') + ', not down.' },
      { val: -p + q + 1, why: 'Watch the sign of ' + t('10^{' + p + '}') + ': ' + t('10^{' + p + '}\\times 10^{' + q + '}=10^{' + p + '+' + q + '}=10^{' + (p + q) + '}') + '.' }];
    opts = sortByVal(opts).map(function (o) { return mcOpt(t(o.val), o.right, o.why); });
    return P.mc(r, 'If ' + t('(' + a.toFixed(1) + '\\times 10^{' + p + '})\\times(' + b.toFixed(1) + '\\times 10^{' + q + '})=' + c + '\\times 10^{n}') + ', then the value of ' + t('n') + ' is', opts,
      'Multiply the coefficients and add the powers of ' + t('10') + ': ' + t('(' + a.toFixed(1) + '\\times ' + b.toFixed(1) + ')\\times 10^{' + p + '+' + q + '}=' + num1(pr / 100) + '\\times 10^{' + (p + q) + '}') + '.<br>' + t(num1(pr / 100)) + ' is not between ' + t('1') + ' and ' + t('10') + ', so ' + t(num1(pr / 100) + '\\times 10^{' + (p + q) + '}=' + c + '\\times 10^{1}\\times 10^{' + (p + q) + '}=' + c + '\\times 10^{' + n + '}') + ', giving ' + t('n=' + n) + '.',
      ['Product Law for the powers of 10, then check that the coefficient is between 1 and 10.'], 'sci product exponent', true);
  }
  function q18(r) {
    var mat = r.pick([['gold leaf', [9.2, 9.2, 8.5, 6.4]], ['aluminum foil', [6.4, 1.6, 2.4]], ['plastic wrap', [1.2, 1.5, 2.5]], ['tissue paper', [3.2, 2.8, 4.5]]]);
    var a, d, j, k, Hn, He;
    for (var g = 0; g < 300; g++) {
      a = r.pick(mat[1]); d = r.pick([2, 4, 5, 5]); j = r.int(3, 5); k = r.int(4, 7);
      var ai = Math.round(a * 10); Hn = ai * d; He = j - k - 1; var H = Hn * Math.pow(10, He); if (H >= 0.05 && H <= 5 && String(Hn).replace(/0+$/, '').length <= 2) break;
    }
    var N = d * Math.pow(10, j), Hs = decStr(Hn, He);
    var vals = [N / 10, N, N * 10, N * 100];
    var opts = vals.map(function (v) { var d10 = Math.round(Math.log10(v / N)); return { val: v, right: v === N, why: v === N ? null : 'Check the power of ' + t('10') + ': your answer is ' + t('10^{' + Math.abs(d10) + '}') + ' times too ' + (d10 > 0 ? 'big' : 'small') + '. ' + t('\\dfrac{' + Hs + '}{' + a.toFixed(1) + '\\times 10^{-' + k + '}}=\\dfrac{' + Hs + '}{' + a.toFixed(1) + '}\\times 10^{' + k + '}') + '.' }; });
    opts = sortByVal(opts).map(function (o) { return mcOpt(t(F(o.val)), o.right, o.why); });
    return P.mc(r, 'A sheet of ' + mat[0] + ' is ' + t(a.toFixed(1) + '\\times 10^{-' + k + '}') + ' m thick. Approximately how many sheets are required to make a stack ' + t(Hs) + ' m high?', opts,
      'Divide the stack height by the thickness of one sheet: ' + t('\\dfrac{' + Hs + '}{' + a.toFixed(1) + '\\times 10^{-' + k + '}}=\\dfrac{' + Hs + '}{' + a.toFixed(1) + '}\\times 10^{' + k + '}=' + num1(Hn * Math.pow(10, He) / a) + '\\times 10^{' + k + '}=' + F(N)) + ' sheets.',
      ['Number of sheets = total height ÷ thickness of one sheet.'], 'stack of ' + mat[0], true);
  }
  var BODIES = [{ name: 'the Moon', c: 1.09e7, ct: '1.09\\times 10^{7}' }, { name: 'the Moon', c: 1.09e7, ct: '1.09\\times 10^{7}' }, { name: 'Earth', c: 4.01e7, ct: '4.01\\times 10^{7}' }, { name: 'Mars', c: 2.13e7, ct: '2.13\\times 10^{7}' }];
  var LONGS = [{ name: 'adult giraffe', what: 'giraffes', how: 'lie head-to-hoof', fact: 'The average height of an adult giraffe is ' + t('5.5') + ' m.', L: 5.5 }, { name: 'school bus', what: 'school buses', how: 'park bumper-to-bumper', fact: 'A school bus is about ' + t('12') + ' m long.', L: 12 }];
  var GROW = [{ fact: 'Human hair grows about ' + t('1.20\\times 10^{-2}') + ' m per month.', g: 1.2e-2, gt: '1.20\\times 10^{-2}', what: 'hair growth' }, { fact: 'Fingernails grow about ' + t('3.00\\times 10^{-3}') + ' m per month.', g: 3e-3, gt: '3.00\\times 10^{-3}', what: 'fingernail growth' }];
  var POPS = [{ name: 'India', p: 1.4e9, pt: '1.40\\times 10^{9}' }, { name: 'China', p: 1.41e9, pt: '1.41\\times 10^{9}' }, { name: 'the United States', p: 3.4e8, pt: '3.40\\times 10^{8}' }, { name: 'Canada', p: 4.15e7, pt: '4.15\\times 10^{7}' }];
  var BIG = [{ name: 'Jupiter', m: 1.9e27, mt: '1.90\\times 10^{27}' }, { name: 'Jupiter', m: 1.9e27, mt: '1.90\\times 10^{27}' }, { name: 'Saturn', m: 5.68e26, mt: '5.68\\times 10^{26}' }];
  var SMALLP = [{ name: 'Earth', m: 5.98e24, mt: '5.98\\times 10^{24}' }, { name: 'Earth', m: 5.98e24, mt: '5.98\\times 10^{24}' }, { name: 'Uranus', m: 8.68e25, mt: '8.68\\times 10^{25}' }];
  var PART = [{ name: 'proton', an: 'a proton', m: 1.67e-27, mt: '1.67\\times 10^{-27}' }, { name: 'proton', an: 'a proton', m: 1.67e-27, mt: '1.67\\times 10^{-27}' }, { name: 'electron', an: 'an electron', m: 9.11e-31, mt: '9.11\\times 10^{-31}' }];
  function q19shared(r) { return { body: r.pick(BODIES), lng: r.pick(LONGS), grow: r.pick(GROW), pop: r.pick(POPS), big: r.pick(BIG), small: r.pick(SMALLP), part: r.pick(PART) }; }
  function q19stem(sh) {
    return 'Use the following information to answer this question.<br>' + [sh.lng.fact, 'The circumference of ' + sh.body.name + ' is about ' + t(sh.body.ct) + ' m.', sh.grow.fact, 'The population of ' + sh.pop.name + ' is approximately ' + t(sh.pop.pt) + '.',
      'The mass of ' + sh.big.name + ' is about ' + t(sh.big.mt) + ' kg.', 'The mass of ' + sh.small.name + ' is about ' + t(sh.small.mt) + ' kg.', 'The mass of ' + sh.part.an + ' is approximately ' + t(sh.part.mt) + ' kg.'].map(function (s) { return '• ' + s; }).join('<br>');
  }

  /* =====================================================================================================
   * Extra-practice makers
   * ===================================================================================================== */
  function expoPart(prompt, A, ord, sol, hints, text, opt) { return P.expo(prompt, posTex(A, ord), opt || {}, sol, hints, text); }

  /* E1(a): (C x^{3a} y^{-3b})^{2/3} ÷ (D x^{-c} y^{d}) */
  function e1a(r) {
    var s = r.pick([2, 2, 3, 4, 5]), C = s * s * s, D = r.pick({ 2: [2], 3: [3], 4: [2, 4, 8], 5: [5] }[s]), a = r.int(1, 2), b = r.int(1, 3), c = r.int(1, 3), d = r.int(1, 3);
    var ord = ['x', 'y'], top = M(C, { x: 3 * a, y: -3 * b }), bot = M(D, { x: -c, y: d }), R = Q(2, 3), T = mpow(top, R), A = mdiv(T, bot);
    var pr = t('\\dfrac{' + br(rawTex(top, ord)) + '^{2/3}}{' + rawTex(bot, ord) + '}');
    return expoPart(pr, A, ord, 'Power law first, with ' + t(powNote(C, R)) + ': ' + t(br(rawTex(top, ord)) + '^{2/3}=' + rawTex(T, ord)) + '.<br>Quotient law: ' + t('\\dfrac{' + rawTex(T, ord) + '}{' + rawTex(bot, ord) + '}=' + lawWork(T, bot, ord, true) + '=' + fin(A, ord)) + '.',
      ['Do the bracket first: the exponent ' + t('\\frac{2}{3}') + ' applies to ' + t(C) + ', to the ' + t('x') + ' and to the ' + t('y') + '.', 'Then divide: subtract exponents, and move any negative exponent across the fraction bar.'], 'E1a ' + C + ',' + D);
  }
  /* E1(b) / E2(a): ((a^{α1} b^{β1}) / (a^{α2} b^{β2}))^{k} with fractional α's */
  function fracPair(r) { return r.pick([[1, 3, 2], [1, 1, 2], [3, 1, 2], [1, 5, 2], [1, 2, 3], [2, 1, 3], [1, 5, 3], [4, 2, 3]]); }
  function e1b(r) {
    var x = 'a', y = 'b', ord = [x, y], fp = fracPair(r), al1 = Q(-fp[0], fp[2]), al2 = Q(fp[1], fp[2]), be1 = r.int(2, 4), be2 = r.int(1, 2), k = r.pick([-2, -2, -3]);
    var N = M(1, { a: al1, b: be1 }), Dn = M(1, { a: al2, b: -be2 }), I = mdiv(N, Dn), A = mpow(I, k);
    var pr = t('\\left(\\dfrac{' + rawTex(N, ord) + '}{' + rawTex(Dn, ord) + '}\\right)^{' + k + '}');
    return expoPart(pr, A, ord, 'Inside first (quotient law): ' + t(lawWork(N, Dn, ord, true) + '=' + rawTex(I, ord)) + '.<br>Power law: ' + t(br(rawTex(I, ord)) + '^{' + k + '}=' + fin(A, ord)) + '.',
      ['Simplify inside the brackets first (subtract exponents), then multiply every exponent by ' + t(k) + '.'], 'E1b');
  }
  function e2a(r) {
    var ord = ['x', 'y'], fp = fracPair(r), al1 = Q(fp[0], fp[2]), al2 = Q(-fp[1], fp[2]), be1 = r.int(1, 3), be2 = r.int(1, 2), k = r.pick([3, 3, 2]);
    var N = M(1, { x: al1, y: -be1 }), Dn = M(1, { x: al2, y: be2 }), I = mdiv(N, Dn), A = mpow(I, k);
    var pr = t('\\left(\\dfrac{' + rawTex(N, ord) + '}{' + rawTex(Dn, ord) + '}\\right)^{' + k + '}');
    return expoPart(pr, A, ord, 'Inside first (quotient law): ' + t(lawWork(N, Dn, ord, true) + '=' + rawTex(I, ord)) + '.<br>Power law: ' + t(br(rawTex(I, ord)) + '^{' + k + '}=' + fin(A, ord)) + '.',
      ['Simplify inside the brackets first, then multiply every exponent by ' + t(k) + '.'], 'E2a');
  }
  /* E1(c): A m^{p/2} n^{-e} ÷ (B m^{1/2} n^{f})^2 */
  function e1c(r) {
    var ord = ['m', 'n'], B = r.pick([2, 3, 4, 4, 5]), tt = r.pick([1, 1, 2, 3]), p = r.pick([3, 5, 5, 7, 9]), e = r.int(1, 3), f = r.int(1, 2);
    var top = M(tt * B * B, { m: Q(p, 2), n: -e }), inner = M(B, { m: Q(1, 2), n: f }), bot = mpow(inner, 2), A = mdiv(top, bot);
    var pr = t('\\dfrac{' + rawTex(top, ord) + '}{' + br(rawTex(inner, ord)) + '^{2}}');
    return expoPart(pr, A, ord, 'Denominator (power law): ' + t(br(rawTex(inner, ord)) + '^{2}=' + rawTex(bot, ord)) + '.<br>Quotient law: ' + t('\\dfrac{' + rawTex(top, ord) + '}{' + rawTex(bot, ord) + '}=' + lawWork(top, bot, ord, true) + '=' + fin(A, ord)) + '.',
      ['Square the bracket in the denominator first — the ' + t(B) + ' is squared too.', 'Then subtract exponents; a fractional exponent can stay in the answer.'], 'E1c');
  }
  /* E1(d): (C p^{3a} q^{-3b})^{-2/3} · D p^{c} q^{-d} */
  function e1d(r) {
    var ord = ['p', 'q'], s = r.pick([2, 3, 3, 4]), C = s * s * s, D = r.pick([s * s, s * s, s, 2 * s * s]), a = r.int(1, 2), b = r.int(1, 2), c, d;
    do { c = r.int(1, 4); } while (c === 2 * a); do { d = r.int(1, 3); } while (d === 2 * b);
    var top = M(C, { p: 3 * a, q: -3 * b }), R = Q(-2, 3), T = mpow(top, R), other = M(D, { p: c, q: -d }), A = mmul(T, other);
    var pr = t(br(rawTex(top, ord)) + '^{-2/3}\\cdot ' + rawTex(other, ord));
    return expoPart(pr, A, ord, t(powNote(C, R)) + ', so ' + t(br(rawTex(top, ord)) + '^{-2/3}=' + rawTex(T, ord)) + '.<br>Product law: ' + t(rawTex(T, ord) + '\\cdot ' + rawTex(other, ord) + '=' + lawWork(T, other, ord, false) + '=' + fin(A, ord)) + '.',
      ['A negative rational exponent on a number: take the root, then the power, then the reciprocal.', 'Then multiply: add exponents.'], 'E1d');
  }
  /* E2(b): (k a^{-e} b^{f/2})^{-3} ÷ (D a^{g} b^{-h}) */
  function e2b(r) {
    var ord = ['a', 'b'], k = r.pick([2, 2, 3]), e = r.int(1, 2), f = r.pick([1, 1, 3]), D = r.pick(k === 2 ? [2, 4, 16, 3, 5] : [2, 3]), g = r.int(1, 3 * e - 1), h = f === 1 ? r.int(2, 4) : r.int(5, 6);
    var inner = M(k, { a: -e, b: Q(f, 2) }), T = mpow(inner, -3), bot = M(D, { a: g, b: -h }), A = mdiv(T, bot);
    var pr = t('\\dfrac{' + br(rawTex(inner, ord)) + '^{-3}}{' + rawTex(bot, ord) + '}');
    return expoPart(pr, A, ord, 'Numerator (power law): ' + t(br(rawTex(inner, ord)) + '^{-3}=' + rawTex(T, ord)) + ' (since ' + t(k + '^{-3}=\\frac{1}{' + (k * k * k) + '}') + ').<br>Divide: ' + t(lawWork(T, bot, ord, true) + '=' + fin(A, ord)) + '.',
      ['The exponent ' + t('-3') + ' applies to the ' + t(k) + ' as well: ' + t(k + '^{-3}=\\frac{1}{' + (k * k * k) + '}') + '.', 'An answer can keep both a fraction in front and a fractional exponent.'], 'E2b');
  }
  /* E2(c): (C c^{2a} / d^{-2b})^{1/2} ÷ (t c^{e} d^{f})^{-1} */
  function e2c(r) {
    var ord = ['c', 'd'], s = r.int(2, 6), tt = r.int(2, 5), a = r.int(1, 3), b = r.int(1, 3), e = r.int(1, 3), f = r.int(1, 3);
    var rad = M(s * s, { c: 2 * a, d: 2 * b }), sq = mpow(rad, Q(1, 2)), other = M(tt, { c: e, d: f }), A = mmul(sq, other);
    var pr = t('\\left(\\dfrac{' + (s * s) + 'c^{' + (2 * a) + '}}{d^{-' + (2 * b) + '}}\\right)^{1/2}\\div ' + br(rawTex(other, ord)) + '^{-1}');
    return expoPart(pr, A, ord, t('\\dfrac{' + (s * s) + 'c^{' + (2 * a) + '}}{d^{-' + (2 * b) + '}}=' + rawTex(rad, ord)) + ', and ' + t(br(rawTex(rad, ord)) + '^{1/2}=' + rawTex(sq, ord)) + '.<br>Dividing by ' + t(br(rawTex(other, ord)) + '^{-1}') + ' means multiplying by ' + t(rawTex(other, ord)) + ': ' + t(rawTex(sq, ord) + '\\cdot ' + rawTex(other, ord) + '=' + posTex(A, ord)) + '.',
      ['A negative exponent in the denominator moves the factor to the numerator.', 'Dividing by something to the power ' + t('-1') + ' is the same as multiplying by it.'], 'E2c');
  }
  /* E3: expressions that collapse to a number */
  function e3a(r) {
    var x = r.pick(['x', 'x', 'y']), k = r.pick([2, 3, 3]), n = r.pick([2, 3]), e = r.int(1, 3), f = r.int(1, e * n - 1), g = e * n - f, Kn = Math.pow(k, n), tv = r.pick([1, 1, k]), D = Kn / tv;
    var pr = t('\\dfrac{' + br(k + pw(x, e)) + '^{' + n + '}\\cdot ' + x + '^{-' + f + '}}{' + D + pw(x, g) + '}');
    return P.expo('Simplify: ' + pr, String(tv), { vars: [x] }, t(br(k + pw(x, e)) + '^{' + n + '}=' + Kn + x + '^{' + (e * n) + '}') + ', and ' + t(Kn + x + '^{' + (e * n) + '}\\cdot ' + x + '^{-' + f + '}=' + Kn + pw(x, g)) + '.<br>' + t('\\dfrac{' + Kn + pw(x, g) + '}{' + D + pw(x, g) + '}=' + tv) + ' (the powers of ' + t(x) + ' cancel: ' + t(x + '^{0}=1') + ').<br>Check with ' + t(x + '=2') + ': both sides give ' + t(tv) + '.',
      ['Simplify the numerator first, then divide.', 'When everything cancels you are left with a number.'], 'E3a');
  }
  function e3b(r) {
    var s = r.pick([2, 3, 2]), B = r.pick([s, s, 1]), p = r.int(2, 4), q = r.int(1, 2), h = r.int(1, 2), j = r.int(1, 2), ord = ['a', 'b'];
    var N = M(s * s, { a: p, b: -q }), Dn = M(1, { a: p + 2 * h, b: -q - 2 * j }), I = mdiv(N, Dn), S = mpow(I, Q(1, 2)), other = M(Q(1, B), { a: h, b: -j }), A = mmul(S, other);
    var val = rT(A.c);
    var pr = t('\\left(\\dfrac{' + rawTex(N, ord) + '}{' + rawTex(Dn, ord) + '}\\right)^{1/2}\\cdot\\dfrac{' + pw('a', h) + '}{' + (B === 1 ? '' : B) + pw('b', j) + '}');
    return P.expo('Simplify: ' + pr, val, { vars: ['a', 'b'] }, 'Inside first: ' + t(lawWork(N, Dn, ord, true) + '=' + rawTex(I, ord)) + '.<br>' + t(br(rawTex(I, ord)) + '^{1/2}=' + rawTex(S, ord)) + '.<br>' + t(rawTex(S, ord) + '\\cdot\\dfrac{' + pw('a', h) + '}{' + (B === 1 ? '' : B) + pw('b', j) + '}=' + val) + ' (every exponent adds to ' + t('0') + ').',
      ['Inside the bracket first, then the square root, then multiply.'], 'E3b');
  }
  function e3c(r) {
    var C = r.pick([16, 16, 81]), c34 = C === 16 ? 8 : 27, D = r.pick([c34, c34, c34 === 8 ? 4 : 9]), e = r.int(1, 3), g = r.int(3 * e + 1, 3 * e + 4), h = g - 3 * e, val = c34 / D;
    var pr = t('\\dfrac{' + br(C + 'm^{' + (4 * e) + '}') + '^{3/4}}{' + D + 'm^{' + g + '}}\\cdot ' + pw('m', h));
    return P.expo('Simplify: ' + pr, String(val), { vars: ['m'] }, t(powNote(C, Q(3, 4))) + ', so ' + t(br(C + 'm^{' + (4 * e) + '}') + '^{3/4}=' + c34 + 'm^{' + (3 * e) + '}') + '.<br>' + t('\\dfrac{' + c34 + 'm^{' + (3 * e) + '}}{' + D + 'm^{' + g + '}}\\cdot ' + pw('m', h) + '=' + (val === 1 ? '' : val) + 'm^{' + (3 * e) + '-' + g + '+' + h + '}=' + (val === 1 ? '' : val) + 'm^{0}=' + val) + '.',
      ['Root first, then power, for ' + t(C + '^{3/4}') + '.'], 'E3c');
  }

  /* E4: (p^n/q^n)^{-m/n} */
  function e4part(r, n, m, pairs) {
    var pq = r.pick(pairs), p = pq[0], q = pq[1], base = Q(Math.pow(p, n), Math.pow(q, n)), R = Q(-m, n), val = qpow(base, R);
    var bt = rT(base), flip = Q(base[1], base[0]);
    return P.fraction(t('\\left(' + (base[1] === 1 ? bt : '\\dfrac{' + base[0] + '}{' + base[1] + '}') + '\\right)^{' + eS(R) + '}'), val, { diag: function (v) {
      if (ex.eq(v, qv(qpow(base, Q(m, n))))) return { code: 'no-flip', hint: 'The exponent is <b>negative</b>: flip the base first, ' + t('\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^{n}') + '.' };
      if (ex.eq(v, -qv(val))) return { code: 'neg-power', hint: 'A negative exponent means reciprocal — it doesn’t make the value negative.' };
      return null; } },
      t('\\left(' + bt + '\\right)^{' + eS(R) + '}=\\left(' + rT(flip) + '\\right)^{' + m + '/' + n + '}=\\left(' + rootTex(n, rT(flip)) + '\\right)^{' + m + '}=\\left(' + rT(Q(q, p)) + '\\right)^{' + m + '}=' + rT(val)),
      ['Flip first (negative exponent), then take the root (denominator), then the power (numerator).'], 'E4 (' + bt + ')^' + eS(R));
  }
  /* E5 */
  function e5a(r) {
    var A = r.pick([[16, 4, 3], [16, 4, 3], [8, 3, 2], [4, 2, 3], [32, 5, 2], [9, 2, 3]]), B = r.pick([[27, 3, 2], [8, 3, 2], [25, 2, 3], [4, 2, 3], [125, 3, 2]].filter(function (b) { return b[0] !== A[0]; }));
    var va = qpow(A[0], Q(-A[2], A[1])), vb = qpow(B[0], Q(B[2], B[1])), val = qadd(va, vb);
    return P.fraction(t(A[0] + '^{-' + A[2] + '/' + A[1] + '}+' + B[0] + '^{' + B[2] + '/' + B[1] + '}'), val, { diag: function (v) {
      if (ex.eq(v, qv(qadd(qdiv(1, va), vb)))) return { code: 'no-flip', hint: 'The first exponent is negative: ' + t(A[0] + '^{-' + A[2] + '/' + A[1] + '}') + ' is a reciprocal.' };
      return null; } },
      t(powNote(A[0], Q(-A[2], A[1]))) + '<br>' + t(powNote(B[0], Q(B[2], B[1]))) + '<br>' + t(rT(va) + '+' + rT(vb) + '=' + rT(val)), ['Evaluate each power separately: root first, then power, then reciprocal for a negative exponent.'], 'E5a');
  }
  function e5b(r) {
    var pq = r.pick([[2, 3], [2, 3], [3, 4], [2, 5], [4, 5], [3, 5]]), p = pq[0], q = pq[1], c = r.int(2, 9), d = r.int(2, 9), first = Q(q, p), val = qsub(first, Q(1, d));
    if (qv(val) === 0) d = d === 9 ? 8 : d + 1, val = qsub(first, Q(1, d));
    return P.fraction(t('\\left(\\dfrac{' + p * p + '}{' + q * q + '}\\right)^{-1/2}-' + c + '^{0}\\cdot ' + d + '^{-1}'), val, { diag: function (v) {
      if (ex.eq(v, qv(first))) return { code: 'zero-pow', hint: t(c + '^{0}=1') + ', not ' + t('0') + '.' };
      if (ex.eq(v, qv(qsub(Q(p, q), Q(1, d))))) return { code: 'no-flip', hint: 'Flip the base first: ' + t('\\left(\\frac{' + p * p + '}{' + q * q + '}\\right)^{-1/2}=\\left(\\frac{' + q * q + '}{' + p * p + '}\\right)^{1/2}') + '.' };
      if (ex.eq(v, qv(qsub(first, Q(c, d))))) return { code: 'zero-pow', hint: 'Any nonzero number to the power ' + t('0') + ' is ' + t('1') + ': ' + t(c + '^{0}=1') + '.' };
      return null; } },
      t('\\left(\\dfrac{' + p * p + '}{' + q * q + '}\\right)^{-1/2}=\\left(\\dfrac{' + q * q + '}{' + p * p + '}\\right)^{1/2}=' + rT(first)) + '<br>' + t(c + '^{0}\\cdot ' + d + '^{-1}=1\\cdot\\dfrac{1}{' + d + '}=\\dfrac{1}{' + d + '}') + '<br>' + t(rT(first) + '-\\dfrac{1}{' + d + '}=' + rT(val)),
      ['Flip, then square root. Remember ' + t('a^{0}=1') + '.'], 'E5b');
  }
  function e5c(r) {
    var k = r.pick([2, 3, 4, 5, 5]), j = k <= 3 ? r.int(1, 2) : 1, val = Math.pow(k, 3 + j);
    return P.fraction(t('\\dfrac{' + k * k + '^{3/2}}{' + k + '^{-' + j + '}}'), val, { diag: function (v) {
      if (v === Math.pow(k, 3 - j)) return { code: 'sign', hint: 'Subtract the exponents with care: ' + t('3-(-' + j + ')=3+' + j) + '.' };
      return null; } },
      t(k * k + '^{3/2}=(\\sqrt{' + k * k + '})^{3}=' + k + '^{3}') + '<br>' + t('\\dfrac{' + k + '^{3}}{' + k + '^{-' + j + '}}=' + k + '^{3-(-' + j + ')}=' + k + '^{' + (3 + j) + '}=' + F(val)),
      ['Write ' + t(k * k) + ' as ' + t(k + '^{2}') + ', then use the quotient law.'], 'E5c');
  }
  function e5d(r) {
    var A = r.pick([[32, 5, 2], [32, 5, 2], [8, 3, 2], [27, 3, 2], [16, 4, 3], [243, 5, 2]]), B = r.pick([[8, 3, 2], [27, 3, 2], [32, 5, 2], [64, 3, 2], [125, 3, 2], [8, 3, 4]]);
    var va = qpow(A[0], Q(A[2], A[1])), vb = qpow(-B[0], Q(B[2], B[1])), val = qadd(va, vb);
    return P.fraction(t('\\left(' + A[0] + '^{-' + A[2] + '/' + A[1] + '}\\right)^{-1}+(-' + B[0] + ')^{' + B[2] + '/' + B[1] + '}'), val, { diag: function (v) {
      if (ex.eq(v, qv(qsub(va, vb)))) return { code: 'odd-sign', hint: t('(-' + B[0] + ')^{' + B[2] + '/' + B[1] + '}=(\\sqrt[' + B[1] + ']{-' + B[0] + '})^{' + B[2] + '}') + ': the root is negative, but an even power makes it positive.' };
      if (ex.eq(v, qv(qadd(qdiv(1, va), vb)))) return { code: 'no-flip', hint: 'The outside exponent ' + t('-1') + ' flips ' + t(A[0] + '^{-' + A[2] + '/' + A[1] + '}') + ' back: power of a power gives ' + t(A[0] + '^{' + A[2] + '/' + A[1] + '}') + '.' };
      return null; } },
      t('\\left(' + A[0] + '^{-' + A[2] + '/' + A[1] + '}\\right)^{-1}=' + A[0] + '^{' + A[2] + '/' + A[1] + '}=(\\sqrt[' + A[1] + ']{' + A[0] + '})^{' + A[2] + '}=' + rT(va)) + '<br>' + t('(-' + B[0] + ')^{' + B[2] + '/' + B[1] + '}=(\\sqrt[' + B[1] + ']{-' + B[0] + '})^{' + B[2] + '}=(' + iroot(-B[0], B[1]) + ')^{' + B[2] + '}=' + rT(vb)) + ' (odd index, so the negative base is fine)<br>' + t(rT(va) + '+' + rT(vb) + '=' + rT(val)),
      ['Power of a power first: ' + t('(a^{m})^{-1}=a^{-m}') + '.', 'An odd root of a negative number is negative; an even power of it is positive.'], 'E5d');
  }
  /* E6: six powers, two with no real meaning */
  function e6part(r, which) {
    var tex, val = null, sol, noneWhy, valueWhy = null, diag = null;
    if (which === 'a') { var A = r.pick([[64, 3, 2], [8, 3, 2], [27, 3, 2], [125, 3, 2], [32, 5, 2], [216, 3, 2]]); tex = '(-' + A[0] + ')^{' + A[2] + '/' + A[1] + '}'; val = qpow(-A[0], Q(A[2], A[1]));
      sol = 'Odd index ' + t(A[1]) + ', so a negative base is fine: ' + t(tex + '=\\left(\\sqrt[' + A[1] + ']{-' + A[0] + '}\\right)^{' + A[2] + '}=(' + iroot(-A[0], A[1]) + ')^{' + A[2] + '}=' + rT(val)) + '.';
      noneWhy = 'The index ' + t(A[1]) + ' is <b>odd</b>, and an odd root of a negative number exists: ' + t('\\sqrt[' + A[1] + ']{-' + A[0] + '}=' + iroot(-A[0], A[1])) + '.';
      diag = function (v) { return ex.eq(v, -qv(val)) ? { code: 'odd-sign', hint: 'The root is negative, but it is then raised to an <b>even</b> power.' } : null; }; }
    if (which === 'b') { var B = r.pick([[64, -1, 2], [36, -1, 2], [49, -1, 2], [16, -3, 4], [81, -1, 4], [100, -3, 2]]); tex = '(-' + B[0] + ')^{' + B[1] + '/' + B[2] + '}';
      sol = t(tex + '=\\dfrac{1}{' + (B[1] === -1 ? '' : '\\left(') + rootTex(B[2], '-' + B[0]) + (B[1] === -1 ? '' : '\\right)^{' + (-B[1]) + '}') + '}') + '. An even-index root of a negative number is not real, so this has <b>no meaning</b> (as a real number).';
      valueWhy = 'The index ' + t(B[2]) + ' is <b>even</b> and the base ' + t('-' + B[0]) + ' is negative. No real number to an even power gives a negative number.'; }
    if (which === 'c') { var C = r.pick([[64, 1, 2], [36, 1, 2], [16, 3, 4], [81, 1, 4], [25, 3, 2], [100, 1, 2]]); tex = '-' + C[0] + '^{' + C[1] + '/' + C[2] + '}'; val = qmul(-1, qpow(C[0], Q(C[1], C[2])));
      sol = 'The base is ' + t(C[0]) + '; the minus sign is applied last: ' + t(tex + '=-\\left(' + (C[1] === 1 ? rootTex(C[2], C[0]) : '\\left(' + rootTex(C[2], C[0]) + '\\right)^{' + C[1] + '}') + '\\right)=' + rT(val)) + '.';
      noneWhy = 'There are no brackets, so the base is ' + t(C[0]) + ' (positive). The minus sign is applied after the root.';
      diag = function (v) { return ex.eq(v, -qv(val)) ? { code: 'sign', hint: 'The minus sign is not part of the base — it stays in front of the answer.' } : null; }; }
    if (which === 'd') { var D = r.pick([[32, 3, 5], [32, 3, 5], [8, 1, 3], [27, 1, 3], [125, 1, 3], [243, 3, 5], [64, 1, 3]]); tex = '(-' + D[0] + ')^{-' + D[1] + '/' + D[2] + '}'; val = qpow(-D[0], Q(-D[1], D[2]));
      sol = 'Odd index ' + t(D[2]) + ', so a negative base is fine: ' + t(tex + '=\\dfrac{1}{' + (D[1] === 1 ? rootTex(D[2], '-' + D[0]) : '\\left(' + rootTex(D[2], '-' + D[0]) + '\\right)^{' + D[1] + '}') + '}=\\dfrac{1}{(' + iroot(-D[0], D[2]) + ')' + (D[1] === 1 ? '' : '^{' + D[1] + '}') + '}=' + rT(val)) + '.';
      noneWhy = 'The index ' + t(D[2]) + ' is <b>odd</b>, so the root of a negative number exists.';
      diag = function (v) { return ex.eq(v, -qv(val)) ? { code: 'odd-sign', hint: 'An odd root of a negative number is negative, and an odd power keeps it negative. The negative exponent only flips it.' } : ex.eq(v, 1 / qv(val)) ? { code: 'no-flip', hint: 'The exponent is negative: take the reciprocal.' } : null; }; }
    if (which === 'e') { var E = r.pick([[1, 16, 3, 4], [1, 81, 1, 4], [1, 4, 3, 2], [9, 4, 1, 2], [1, 16, 1, 2], [1, 81, 3, 4]]); tex = '\\left(-\\dfrac{' + E[0] + '}{' + E[1] + '}\\right)^{' + E[2] + '/' + E[3] + '}';
      sol = t(tex + '=\\left(' + rootTex(E[3], '-\\frac{' + E[0] + '}{' + E[1] + '}') + '\\right)' + (E[2] === 1 ? '' : '^{' + E[2] + '}')) + '. Index ' + t(E[3]) + ' is even and the base is negative, so this has <b>no meaning</b> (as a real number).';
      valueWhy = 'The index ' + t(E[3]) + ' is <b>even</b> and the base is negative, so there is no real root.'; }
    if (which === 'f') { var G = r.pick([[16, 3, 4], [16, 3, 4], [8, 2, 3], [27, 2, 3], [32, 3, 5], [81, 3, 4], [4, 3, 2]]); tex = '-\\left(\\dfrac{1}{' + G[0] + '}\\right)^{-' + G[1] + '/' + G[2] + '}'; var pv = qpow(G[0], Q(G[1], G[2])); val = qmul(-1, pv);
      sol = 'The minus sign is outside the power: ' + t('\\left(\\dfrac{1}{' + G[0] + '}\\right)^{-' + G[1] + '/' + G[2] + '}=' + G[0] + '^{' + G[1] + '/' + G[2] + '}=\\left(' + rootTex(G[2], G[0]) + '\\right)^{' + G[1] + '}=' + rT(pv)) + ', so ' + t(tex + '=' + rT(val)) + '.';
      noneWhy = 'The base ' + t('\\frac{1}{' + G[0] + '}') + ' is positive — the minus sign is outside the bracket.';
      diag = function (v) { return ex.eq(v, -qv(val)) ? { code: 'sign', hint: 'Keep the minus sign that is in front of the bracket.' } : ex.eq(v, -1 / qv(pv)) ? { code: 'no-flip', hint: 'The exponent is negative, so flip ' + t('\\frac{1}{' + G[0] + '}') + ' to ' + t(G[0]) + '.' } : null; }; }
    var chk = noneOr(val, noneWhy, valueWhy, diag);
    var key = val == null ? 'none' : rT(val);
    return { prompt: t(tex), input: { type: 'fields', fields: [{ name: 'Value', label: t(tex + '='), mode: 'math', keys: 'fraction', none: true, wide: true }] },
      check: function (resp) { var res = chk((resp || [])[0]); return res; }, key: [key], answer: val == null ? 'No meaning (as a real number)' : t(tex + '=' + rT(val)),
      solution: sol, hints: ['Look at the index (the denominator of the exponent): even or odd? Is the base negative?', 'A minus sign outside the power (no brackets) is applied last.'], text: 'E6' + which + ' ' + tex };
  }
  /* E7 / E8: radicals ↔ powers, two answer boxes.
   * ex.value snaps a root of a tiny radicand to 0 (absolute tolerance), so ex.equiv can disagree at its 0.37 sample
   * point when a radicand has a large exponent. expoChk re-checks equivalence at sample points above 1. */
  function localEquiv(a, b, vars) {
    var pts = [1.31, 1.77, 2.23, 2.71];
    for (var i = 0; i < pts.length; i++) { var env = {}; vars.forEach(function (v, j) { env[v] = pts[i] + 0.17 * j; }); var x = ex.value(a, env), y = ex.value(b, env); if (!isFinite(x) || !isFinite(y) || !releq(x, y)) return false; }
    return true;
  }
  function expoChk(targetTex, opt) {
    var base = K.expo(targetTex, opt), tp = ex.parse(targetTex).ast, tv = Object.keys(ex.shape(tp).vars);
    return function (resp) {
      var res = base(resp), a = K.read(resp); if (a.res) return res;
      var vars = tv.concat(Object.keys(ex.shape(a.ast).vars)).filter(function (v, i, arr) { return arr.indexOf(v) === i; }), same = localEquiv(a.ast, tp, vars);
      if (same && res.v === 'wrong') {
        var f = ex.analyze(a.ast).flags;
        if (opt.form === 'radical' && f.ratExp) return form('not-radical', 'Right value — now write it in <b>radical form</b> (use the root key; no fractional exponents).');
        if (opt.form === 'power' && f.roots) return form('not-power', 'Right value — now write it with a rational exponent instead of a radical.');
        return ok();
      }
      if (!same && res.v !== 'wrong') return wrong('value', null);
      return res;
    };
  }
  function twoForm(prompt, c, x, e, sol, hints, text) {
    var pT = cTex(c, true) + pw(x, e, true), rTx = radTex(c, x, e);
    var p = P.fields(prompt, [{ name: 'As a power', label: 'As a power:', mode: 'math', keys: 'expo', vars: [x], wide: true }, { name: 'As a radical', label: 'As an entire radical:', mode: 'math', keys: 'expo', vars: [x], wide: true }],
      [expoChk(pT, { form: 'power' }), expoChk(rTx, { form: 'radical' })], [pT, rTx], t(pT) + ' ' + t('=') + ' ' + t(rTx), sol, hints, text);
    var q = Q(e), w = Math.floor(q[0] / q[1]);
    if (w >= 1 && q[1] > 1) p.good = [[pT, cTex(c, true) + pw(x, w, true) + rootTex(q[1], (q[0] - w * q[1]) === 1 ? x : x + '^{' + (q[0] - w * q[1]) + '}')]];
    p.bad = [[cTex(c, true) + pw(x, qadd(e, 1), true), rTx], [pT, radTex(c, x, qadd(e, 1))]];
    return p;
  }
  function e7a(r) {
    var n1, n2, m1, m2, s;
    for (var g = 0; g < 200; g++) { var pr = r.pick([[3, 4], [3, 4], [2, 3], [3, 5], [2, 5], [4, 3]]); n1 = pr[0]; n2 = pr[1]; m1 = r.int(1, n1 - 1); m2 = r.int(1, n2 - 1); s = qadd(Q(m1, n1), Q(m2, n2)); if (gcd(m1, n1) === 1 && gcd(m2, n2) === 1 && (m1 > 1 || m2 > 1) && !isInt(s)) break; }
    var D = n1 * n2 / gcd(n1, n2);
    var xm = function (m) { return m === 1 ? 'x' : 'x^{' + m + '}'; };
    return twoForm(t(rootTex(n1, xm(m1)) + '\\cdot ' + rootTex(n2, xm(m2))), 1, 'x', s,
      t(rootTex(n1, xm(m1)) + '\\cdot ' + rootTex(n2, xm(m2)) + '=x^{' + m1 + '/' + n1 + '}\\cdot x^{' + m2 + '/' + n2 + '}=x^{\\frac{' + (m1 * D / n1) + '}{' + D + '}+\\frac{' + (m2 * D / n2) + '}{' + D + '}}=' + pw('x', s, true) + '=' + radTex(1, 'x', s)),
      ['Write each radical as a power (index = denominator), then add the exponents over a common denominator.'], 'E7a');
  }
  function e7b(r) {
    var n1, n2, m1, m2, s;
    for (var g = 0; g < 200; g++) { var pr = r.pick([[2, 3], [2, 3], [3, 4], [2, 5], [4, 3]]); n1 = pr[0]; n2 = pr[1]; m1 = r.int(n1 + 1, 2 * n1 + 1); m2 = r.int(1, n2 - 1); s = qsub(Q(m1, n1), Q(m2, n2)); if (gcd(m1, n1) === 1 && gcd(m2, n2) === 1 && qv(s) > 0 && !isInt(s)) break; }
    var D = n1 * n2 / gcd(n1, n2);
    return twoForm(t('\\dfrac{' + rootTex(n1, 'y^{' + m1 + '}') + '}{' + rootTex(n2, m2 === 1 ? 'y' : 'y^{' + m2 + '}') + '}'), 1, 'y', s,
      t('\\dfrac{y^{' + m1 + '/' + n1 + '}}{y^{' + m2 + '/' + n2 + '}}=y^{\\frac{' + (m1 * D / n1) + '}{' + D + '}-\\frac{' + (m2 * D / n2) + '}{' + D + '}}=' + pw('y', s, true) + '=' + radTex(1, 'y', s)),
      ['Write each radical as a power, then subtract the exponents over a common denominator.'], 'E7b');
  }
  function e7c(r) {
    var n, m, k, j, s;
    for (var g = 0; g < 200; g++) { n = r.pick([5, 5, 3, 4, 7]); m = r.int(1, n - 1); k = r.int(2, 3); j = Math.ceil(m * k / n) + r.int(0, 1); s = qadd(Q(-m * k, n), j); if (gcd(m, n) === 1 && qv(s) > 0 && !isInt(s)) break; }
    return twoForm(t(br(rootTex(n, m === 1 ? 'z' : 'z^{' + m + '}')) + '^{-' + k + '}\\cdot ' + pw('z', j)), 1, 'z', s,
      t(br('z^{' + m + '/' + n + '}') + '^{-' + k + '}\\cdot ' + pw('z', j) + '=z^{' + eS(Q(-m * k, n)) + '}\\cdot ' + pw('z', j) + '=z^{' + eS(Q(-m * k, n)) + '+' + (j * n) + '/' + n + '}=' + pw('z', s, true) + '=' + radTex(1, 'z', s)),
      ['Power of a power: multiply ' + t('\\frac{m}{n}') + ' by the outside exponent. Then add the exponent of the other power.'], 'E7c');
  }
  function e7d(r) {
    var n1, m1, k, n2, m2, s;
    for (var g = 0; g < 300; g++) { var pr = r.pick([[3, 4], [3, 4], [2, 3], [4, 3], [3, 5]]); n1 = pr[0]; n2 = pr[1]; m1 = r.int(1, n1 - 1); k = r.int(2, 3); m2 = r.int(2, 2 * n2 - 1); s = qsub(Q(m1 * k, n1), Q(m2, n2)); if (gcd(m1, n1) === 1 && gcd(m2, n2) === 1 && qv(s) > 0 && !isInt(s)) break; }
    return twoForm(t(br(rootTex(n1, m1 === 1 ? 'w' : 'w^{' + m1 + '}')) + '^{' + k + '}\\div ' + rootTex(n2, 'w^{' + m2 + '}')), 1, 'w', s,
      t(br('w^{' + m1 + '/' + n1 + '}') + '^{' + k + '}\\div w^{' + m2 + '/' + n2 + '}=' + pw('w', Q(m1 * k, n1)) + '\\div w^{' + eS(Q(m2, n2)) + '}=w^{' + eS(Q(m1 * k, n1)) + '-' + eS(Q(m2, n2)) + '}=' + pw('w', s, true) + '=' + radTex(1, 'w', s)),
      ['Power of a power first, then the quotient law with a common denominator.'], 'E7d');
  }
  function e8a(r) {
    var k1 = r.int(2, 5), k2 = r.int(2, 5), n1, m1, m2, s;
    for (var g = 0; g < 200; g++) { n1 = r.pick([3, 3, 4]); m1 = r.int(n1 + 1, 2 * n1 - 1); m2 = r.pick([1, 1, 3]); s = qadd(Q(m1, n1), Q(m2, 2)); if (gcd(m1, n1) === 1 && !isInt(s)) break; }
    var D = n1 * 2 / gcd(n1, 2), c = k1 * k2;
    return twoForm(t(k1 + rootTex(n1, 'm^{' + m1 + '}') + '\\times ' + k2 + '\\sqrt{' + (m2 === 1 ? 'm' : 'm^{' + m2 + '}') + '}'), c, 'm', s,
      t(k1 + 'm^{' + m1 + '/' + n1 + '}\\times ' + k2 + 'm^{' + m2 + '/2}=' + c + 'm^{\\frac{' + (m1 * D / n1) + '}{' + D + '}+\\frac{' + (m2 * D / 2) + '}{' + D + '}}=' + cTex(c, true) + pw('m', s, true) + '=' + radTex(c, 'm', s)),
      ['Multiply the coefficients; add the exponents. A coefficient outside the power stays outside the radical.'], 'E8a');
  }
  function e8b(r) {
    var AB = r.pick([[10, 4], [10, 4], [6, 4], [9, 6], [15, 6], [14, 4]]), pj = r.pick([[5, 1], [5, 1], [7, 3], [3, 3], [9, 1]]), c = Q(AB[0], AB[1]), s = Q(pj[0] + pj[1], 4);
    return twoForm(t('\\dfrac{' + AB[0] + rootTex(4, 'n^{' + pj[0] + '}') + '}{' + AB[1] + 'n^{-' + pj[1] + '/4}}'), c, 'n', s,
      t('\\dfrac{' + AB[0] + 'n^{' + pj[0] + '/4}}{' + AB[1] + 'n^{-' + pj[1] + '/4}}=\\dfrac{' + AB[0] + '}{' + AB[1] + '}n^{\\frac{' + pj[0] + '}{4}-\\left(-\\frac{' + pj[1] + '}{4}\\right)}=' + cTex(c, true) + pw('n', s, true) + '=' + radTex(c, 'n', s)),
      ['Divide the coefficients (reduce the fraction), subtract the exponents.'], 'E8b');
  }
  function e8c(r) {
    var C = r.pick([8, 8, 27, 64]), c23 = Math.round(Math.pow(Math.cbrt(C), 2)), S = r.pick({ 8: [4, 16], 27: [9], 64: [4, 16] }[C]), sr = Math.sqrt(S), a = r.int(2, 3), b, s;
    for (var g = 0; g < 50; g++) { b = r.pick([1, 3, 5]); s = qsub(2 * a, Q(b, 2)); if (qv(s) > 0) break; }
    var c = c23 / sr;
    return twoForm(t(br(C + 't^{' + (3 * a) + '}') + '^{2/3}\\div ' + br(S + pw('t', b)) + '^{1/2}'), c, 't', s,
      t(br(C + 't^{' + (3 * a) + '}') + '^{2/3}=' + c23 + 't^{' + (2 * a) + '}') + ' (since ' + t(powNote(C, Q(2, 3))) + '), ' + t(br(S + pw('t', b)) + '^{1/2}=' + sr + 't^{' + b + '/2}') + '.<br>' + t('\\dfrac{' + c23 + 't^{' + (2 * a) + '}}{' + sr + 't^{' + b + '/2}}=' + cTex(c, true) + 't^{' + (2 * a) + '-' + b + '/2}=' + cTex(c, true) + pw('t', s, true) + '=' + radTex(c, 't', s)),
      ['Apply each outside exponent to the coefficient and the power, then divide.'], 'E8c');
  }
  /* E9: working backwards */
  function e9a(r) {
    var n = r.pick([4, 4, 3, 5, 2]), m = r.pick([3, 2].filter(function (x) { return x !== n; })), i = r.int(2, 4), k = i * n, T = i * m;
    return P.number(t('\\left(' + rootTex(n, 'x^{k}') + '\\right)^{' + m + '}=x^{' + T + '}') + '. Find ' + t('k') + '.', k, function (v) {
      if (v === T * n) return { code: 'exp', hint: 'Use all of it: ' + t('\\left(x^{k/' + n + '}\\right)^{' + m + '}=x^{' + m + 'k/' + n + '}') + '.' };
      return null; },
      t('\\left(x^{k/' + n + '}\\right)^{' + m + '}=x^{' + m + 'k/' + n + '}') + ', so ' + t('\\frac{' + m + 'k}{' + n + '}=' + T) + ', ' + t(m + 'k=' + (T * n)) + ' and ' + t('k=' + k) + '.', ['Write the radical as a power, use the power of a power law, then set the exponents equal.'], 'E9a');
  }
  function e9b(r) {
    var q = r.pick([3, 3, 4, 5]), s = r.pick([1, 1, 2].filter(function (x) { return gcd(x, q) === 1; })), k = r.int(1, 3), p = k * q + s;
    return P.number(t('\\dfrac{x^{' + p + '/' + q + '}}{x^{k}}=' + rootTex(q, s === 1 ? 'x' : 'x^{' + s + '}')) + '. Find ' + t('k') + '.', k, function (v) {
      if (ex.eq(v, -k)) return { code: 'sign', hint: 'Dividing subtracts: ' + t('\\frac{' + p + '}{' + q + '}-k=\\frac{' + s + '}{' + q + '}') + '.' };
      return null; },
      t('x^{\\frac{' + p + '}{' + q + '}-k}=x^{' + s + '/' + q + '}') + ', so ' + t('\\frac{' + p + '}{' + q + '}-k=\\frac{' + s + '}{' + q + '}') + ' and ' + t('k=\\frac{' + (p - s) + '}{' + q + '}=' + k) + '.', ['Write the right side as a power of ' + t('x') + ', then compare exponents.'], 'E9b');
  }
  function e9c(r) {
    var ab = r.pick([[2, 5], [2, 5], [3, 5], [2, 3], [3, 4], [2, 7]]), a = ab[0], b = ab[1], j = r.int(1, 3), k = -j * b, T = j * a;
    return P.number(t('\\left(y^{' + a + '/' + b + '}\\right)^{k}=\\dfrac{1}{y^{' + T + '}}') + '. Find ' + t('k') + '.', k, function (v) {
      if (v === -k) return { code: 'sign', hint: t('\\frac{1}{y^{' + T + '}}=y^{-' + T + '}') + ': the exponent is negative.' };
      return null; },
      t('y^{' + a + 'k/' + b + '}=y^{-' + T + '}') + ', so ' + t('\\frac{' + a + 'k}{' + b + '}=-' + T) + ', ' + t(a + 'k=-' + (T * b)) + ' and ' + t('k=' + k) + '.', ['Write ' + t('\\frac{1}{y^{' + T + '}}') + ' as a power with a negative exponent.'], 'E9c');
  }
  function e9d(r) {
    var pq = r.pick([[3, 2], [3, 2], [2, 3], [5, 2], [3, 4], [4, 3]]), g = r.pick([2, 2, 3]), c = pq[0] * g, n = pq[1] * g;
    return P.number(t(rootTex('n', 'b^{' + c + '}') + '=b^{' + pq[0] + '/' + pq[1] + '}') + '. Find ' + t('n') + '.', n, function (v) {
      if (v === pq[1]) return { code: 'exp', hint: t('\\frac{' + c + '}{n}') + ' must equal ' + t('\\frac{' + pq[0] + '}{' + pq[1] + '}') + ' — the numerators aren’t equal yet, so the denominators aren’t either.' };
      return null; },
      t(rootTex('n', 'b^{' + c + '}') + '=b^{' + c + '/n}') + ', so ' + t('\\frac{' + c + '}{n}=\\frac{' + pq[0] + '}{' + pq[1] + '}') + ', ' + t(pq[0] + 'n=' + (c * pq[1])) + ' and ' + t('n=' + n) + '.', ['Write the radical as a power: the index ' + t('n') + ' is the denominator.'], 'E9d');
  }
  /* E10 / E20: equations with a common base */
  function fracAns(prompt, val, sol, hints, text, diag) { return P.fraction(prompt, val, { diag: diag }, sol, hints, text); }
  function e10a(r) {
    var s = r.pick([2, 2, 3]), a = r.pick(s === 2 ? [2, 3, 3] : [2, 3]), n = r.int(2, 5), b = r.int(1, 6), c = a * n - b;
    if (c < 1) { b = 1; c = a * n - 1; }
    var B = Math.pow(s, a);
    return fracAns(t('\\dfrac{' + B + '^{n}}{' + pw(String(s), b) + '}=' + s + '^{' + c + '}') + '. Solve for ' + t('n') + '.', n,
      t(B + '^{n}=(' + s + '^{' + a + '})^{n}=' + s + '^{' + a + 'n}') + '<br>' + t('\\dfrac{' + s + '^{' + a + 'n}}{' + s + '^{' + b + '}}=' + s + '^{' + a + 'n-' + b + '}=' + s + '^{' + c + '}') + '<br>' + t(a + 'n-' + b + '=' + c) + ', so ' + t(a + 'n=' + (c + b)) + ' and ' + t('n=' + n) + '.',
      ['Write ' + t(B) + ' as a power of ' + t(s) + ', then equate the exponents.'], 'E10a');
  }
  function e10bc(r, neg) {
    var sp = r.pick([[3, 2, 3], [3, 2, 3], [2, 3, 2], [2, 2, 3], [2, 4, 3], [2, 3, 4], [5, 2, 3], [2, 2, 5], [3, 3, 2]]), s = sp[0], a = sp[1], b = sp[2], x = Q(neg ? -b : b, a);
    var L = Math.pow(s, a), Rv = Math.pow(s, b);
    return fracAns(t(L + '^{x}=' + (neg ? '\\dfrac{1}{' + Rv + '}' : Rv)) + '. Solve for ' + t('x') + '.', x,
      t('(' + s + '^{' + a + '})^{x}=' + s + '^{' + (neg ? '-' : '') + b + '}') + '<br>' + t(s + '^{' + a + 'x}=' + s + '^{' + (neg ? '-' : '') + b + '}') + '<br>' + t(a + 'x=' + (neg ? '-' : '') + b) + ', so ' + t('x=' + rT(x)) + '.',
      ['Write both sides as powers of ' + t(s) + (neg ? ' (a reciprocal is a negative exponent)' : '') + '.', 'Not every answer is a whole number.'], 'E10' + (neg ? 'c' : 'b'), function (v) {
        if (ex.eq(v, -qv(x))) return { code: 'sign', hint: neg ? t('\\frac{1}{' + Rv + '}=' + s + '^{-' + b + '}') + ' — the exponent is negative.' : 'Check the sign.' };
        if (ex.eq(v, 1 / qv(x))) return { code: 'flip', hint: 'Solve ' + t(a + 'x=' + (neg ? '-' : '') + b) + ': divide by ' + t(a) + '.' };
        return null; });
  }
  function e10d(r) {
    var pq = r.pick([[2, 3], [2, 3], [1, 2], [2, 5], [3, 4], [1, 3]]), p = pq[0], q = pq[1], ab = r.pick([[2, 3], [2, 3], [3, 2], [2, 1], [3, 1]].filter(function (z) { return Math.pow(Math.max(p, q), Math.max(z[0], z[1])) < 300; }));
    if (!ab) ab = [2, 3]; var a = ab[0], b = ab[1], x = Q(-b, a);
    var Lt = '\\dfrac{' + Math.pow(p, a) + '}{' + Math.pow(q, a) + '}', Rt = p === 1 ? String(Math.pow(q, b)) : '\\dfrac{' + Math.pow(q, b) + '}{' + Math.pow(p, b) + '}';
    return fracAns(t('\\left(' + Lt + '\\right)^{x}=' + Rt) + '. Solve for ' + t('x') + '.', x,
      t(Rt + '=' + (p === 1 ? (b === 1 ? '' : pw(String(q), b) + '=') : '\\left(\\dfrac{' + q + '}{' + p + '}\\right)^{' + b + '}=') + '\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + b + '}') + '<br>' + t('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{' + a + 'x}=\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + b + '}') + '<br>' + t(a + 'x=-' + b) + ', so ' + t('x=' + rT(x)) + '.',
      ['Write both sides as powers of ' + t('\\frac{' + p + '}{' + q + '}') + '. Flipping a fraction makes the exponent negative.'], 'E10d', function (v) {
        if (ex.eq(v, -qv(x))) return { code: 'sign', hint: 'The right side is the <b>flipped</b> fraction, so its exponent is negative.' }; return null; });
  }
  function e10e(r) {
    var s = r.pick([5, 5, 2, 3]), a = r.pick([2, 2, 3]), x = r.pick([-3, -2, -2, -1, 1, 2]), b = r.int(1, 4), c = a * x + b;
    if (c === 0 || c === 1) { b += 2; c += 2; }
    return fracAns(t(Math.pow(s, a) + '^{x}\\cdot ' + s + '^{' + b + '}=' + s + '^{' + c + '}') + '. Solve for ' + t('x') + '.', x,
      t('(' + s + '^{' + a + '})^{x}\\cdot ' + s + '^{' + b + '}=' + s + '^{' + a + 'x+' + b + '}') + '<br>' + t(a + 'x+' + b + '=' + c) + '<br>' + t(a + 'x=' + (c - b)) + ', so ' + t('x=' + x) + '.',
      ['Write ' + t(Math.pow(s, a)) + ' as a power of ' + t(s) + '; multiplying powers adds the exponents.'], 'E10e');
  }
  function e10f(r) {
    var sp, d, x;
    for (var g = 0; g < 100; g++) { sp = r.pick([[2, 4, 3], [2, 4, 3], [2, 3, 2], [2, 2, 3], [2, 3, 4], [3, 2, 3], [3, 3, 2]]); d = r.pick([1, 1, 2]); x = Q(sp[2] * d, sp[1] - sp[2]); if (!qeq(x, 6)) break; }
    var s = sp[0], a = sp[1], b = sp[2];
    return fracAns(t(Math.pow(s, a) + '^{x}=' + Math.pow(s, b) + '^{x+' + d + '}') + '. Solve for ' + t('x') + '.', x,
      t('(' + s + '^{' + a + '})^{x}=(' + s + '^{' + b + '})^{x+' + d + '}') + '<br>' + t(s + '^{' + a + 'x}=' + s + '^{' + b + 'x+' + (b * d) + '}') + '<br>' + t(a + 'x=' + b + 'x+' + (b * d)) + ', so ' + t('x=' + rT(x)) + '.',
      ['Write both sides as powers of ' + t(s) + '. Multiply the whole bracket ' + t('x+' + d) + ' by the exponent.'], 'E10f', function (v) {
        if (ex.eq(v, qv(Q(d, a - b)))) return { code: 'no-double', hint: 'Distribute: ' + t(b + '(x+' + d + ')=' + b + 'x+' + (b * d)) + '.' }; return null; });
  }

  HW.defineLesson({
    id: 'u2l6', unit: 2, num: '6', title: 'Exponent Laws in Review', outcome: 'AN3',
    blurb: 'Every law from the unit in one place — vocabulary, the product and quotient laws, zero and negative exponents, rational exponents, an error-analysis written response, and scientific notation as an extension.',
    questions: [
      { num: '1', section: 'Part A — Vocabulary and Repeated Multiplication', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '1', level: 'BEG', make: q1 }] },
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '2', level: 'BEG', make: q2 }] },
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '3', level: 'BEG', make: q3 }] },
      { num: '4', section: 'Part B — Product and Quotient Laws', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '4', level: 'BEG', make: q4 }] },
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '5', level: 'BEG', make: q5 }] },
      { num: '6', stem: function (sh) { return 'Use the following information to answer this question.\\[' + sh.tex + '\\ \\text{can be written in the form}\\ ap^{x}q^{y},\\]where ' + t('a') + ', ' + t('x') + ' and ' + t('y') + ' are integers.'; },
        shared: function (r) {
          var a = r.int(2, 4), b = r.pick([2, 3, 5]), c = r.int(2, 5), sg = r.pick([[-1, -1], [-1, -1], [-1, 1], [1, -1]]), x1 = r.int(2, 3), x2 = r.int(1, 2), y1 = r.int(1, 2), y2 = r.int(3, 5), y3 = r.int(2, 4);
          var f1 = (sg[0] < 0 ? '-' : '') + a + pw('p', x1) + pw('q', y1), f2 = (sg[1] < 0 ? '-' : '') + b + pw('p', x2) + pw('q', y2), f3 = '-' + c + pw('q', y3);
          return { a: a, b: b, c: c, sg: sg, x1: x1, x2: x2, y1: y1, y2: y2, y3: y3, A: sg[0] * sg[1] * a * b * c * c, X: x1 + x2, Y: y1 + y2 + 2 * y3, tex: br(f1) + br(f2) + br(f3) + '^{2}', f1: f1, f2: f2, f3: f3 };
        },
        parts: [
          { id: '6a', level: 'EMG', make: function (r, sh) {
            var Pv = Math.abs(sh.A), Qv = sh.a * sh.b * sh.c, sq = '(-' + sh.c + pw('q', sh.y3) + ')^{2}=' + (sh.c * sh.c) + 'q^{' + (2 * sh.y3) + '}';
            var opts = [Pv, -Pv, Qv, -Qv].map(function (v) {
              return mcOpt(t(v), v === sh.A, v === sh.A ? null : Math.abs(v) === Qv ? 'The exponent ' + t('2') + ' applies to the ' + t('-' + sh.c) + ' too: ' + t(sq) + '.' : 'Check the sign: count the negative factors. The squared bracket is positive.'); });
            return P.mc(r, '<i>(Multiple Choice)</i> The value of ' + t('a') + ' is', opts,
              'Square the last bracket first — both the ' + t('-' + sh.c) + ' and the ' + t(pw('q', sh.y3)) + ' are squared: ' + t(sq) + '.<br>' + t('\\left[(' + sh.sg[0] * sh.a + ')(' + sh.sg[1] * sh.b + ')(' + (sh.c * sh.c) + ')\\right]p^{' + sh.x1 + '+' + sh.x2 + '}q^{' + sh.y1 + '+' + sh.y2 + '+' + (2 * sh.y3) + '}=' + sh.A + 'p^{' + sh.X + '}q^{' + sh.Y + '}') + ', so ' + t('a=' + sh.A) + '.',
              ['Deal with the last bracket first: everything inside is squared.'], 'coefficient of product', true);
          } },
          { id: '6b', level: 'EMG', make: function (r, sh) {
            var ans = sh.X + sh.Y;
            return P.nr('<i>(Numerical Response)</i> The value of ' + t('x+y') + ' is ________.', ans, function (v) {
              if (v === sh.X + sh.y1 + sh.y2 + sh.y3) return { code: 'no-double', hint: 'The exponent ' + t('2') + ' applies to ' + t(pw('q', sh.y3)) + ' too: ' + t('(' + pw('q', sh.y3) + ')^{2}=q^{' + (2 * sh.y3) + '}') + '.' };
              if (sh.y1 === 1 && v === ans - 1) return { code: 'exp', hint: 'A variable with no exponent shown has exponent ' + t('1') + ': ' + t('q=q^{1}') + '.' };
              return null; },
              'Product Law for each base: ' + t('p^{' + sh.x1 + '+' + sh.x2 + '}=p^{' + sh.X + '}') + ' and ' + t('q^{' + sh.y1 + '+' + sh.y2 + '+' + (2 * sh.y3) + '}=q^{' + sh.Y + '}') + ' (the squared bracket gives ' + t('q^{' + (2 * sh.y3) + '}') + ').<br>' + t('x+y=' + sh.X + '+' + sh.Y + '=' + ans) + '.',
              ['Find the exponent of ' + t('p') + ' and of ' + t('q') + ' in the simplified product.', 'Square the last bracket first.'], 'x+y of product');
          } }] },
      { num: '7', section: 'Part C — Negative Exponents', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '7', level: 'LIM', make: q7 }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '8', level: 'BEG', make: q8 }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '9', level: 'BEG', make: q9 }] },
      { num: '10', section: 'Part D — Rational Exponents', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '10', level: 'EMG', make: q10 }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [{ id: '11', level: 'PRG', make: q11 }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [{ id: '12', level: 'PRG', make: q12 }] },
      { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '13', level: 'EMG', make: q13 }] },
      { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '14', level: 'EMG', make: q14 }] },
      { num: '15', stem: '<i>(Numerical Response)</i>', parts: [{ id: '15', level: 'PRG', make: q15 }] },
      { num: '16', section: 'Part E — Written Response', stem: q16stem, shared: q16shared, parts: [
        { id: '16a', level: 'BEG', make: function (r, sh) {
          return P.mc(r, '(a) Step 1 is correct. Which exponent law(s) did Jordan use in Step 1?', [
            mcOpt('The Power of a Product Law and the Power of a Power Law', true),
            mcOpt('The Product Law and the Quotient Law', false, 'Step 1 doesn’t multiply or divide two powers of the same base. It applies an outside exponent to everything in a bracket, then multiplies exponents.'),
            mcOpt('The Power of a Quotient Law and the Zero Exponent Law', false, 'There is no fraction inside the bracket and no zero exponent in Step 1.'),
            mcOpt('The Negative Exponent Law only', false, 'Jordan didn’t rewrite anything as a reciprocal in Step 1. He sent the exponent ' + t(eS(sh.Rr)) + ' to each factor and multiplied exponents.')],
            '<b>Power of a Product Law:</b> the exponent ' + t(eS(sh.Rr)) + ' applies to ' + t(sh.C) + ', to ' + t('a^{' + (3 * sh.u) + '}') + ' and to ' + t('b^{-' + (3 * sh.v) + '}') + '.<br><b>Power of a Power Law:</b> multiply the exponents: ' + t((3 * sh.u) + '\\cdot\\left(' + eS(sh.Rr) + '\\right)=' + sh.al) + ', ' + t('-' + (3 * sh.v) + '\\cdot\\left(' + eS(sh.Rr) + '\\right)=' + sh.be) + ', ' + t('\\frac{1}{2}\\cdot ' + (2 * sh.w) + '=' + sh.w) + '.',
            ['What happens to the exponent outside a bracket? What happens to the exponents inside?'], 'Jordan step 1 laws');
        } },
        { id: '16b', sub: 'b-i', level: 'EMG', make: function (r, sh) {
          var C = sh.C, R = eS(sh.Rr), ok2 = '\\frac{1}{' + sh.s + '}', root = rootTex(3, C), core = sh.rn === -1 ? root : br(root) + '^{' + (-sh.rn) + '}';
          return P.mc(r, '(b) What is the error in <b>Step 2</b>?', [
            mcOpt('Jordan multiplied ' + t(C + '\\times\\left(' + R + '\\right)') + '. But ' + t(C + '^{' + R + '}=\\dfrac{1}{' + core + '}=' + ok2) + '.', true),
            mcOpt('Only the size is wrong: a negative exponent makes the value negative, so ' + t(C + '^{' + R + '}=-' + ok2) + '.', false, 'A negative exponent means <b>reciprocal</b>. It never makes a positive base negative.'),
            mcOpt('He forgot the root: ' + t(C + '^{' + R + '}=' + sh.s) + '.', false, t(sh.s) + ' is ' + t(C + '^{' + eS(qmul(sh.Rr, -1)) + '}') + '. The exponent is negative, so take the reciprocal: ' + t(ok2) + '.'),
            mcOpt('There is no error in Step 2: ' + t(C + '\\times\\left(' + R + '\\right)=' + sh.J) + '.', false, 'An exponent isn’t a multiplier. ' + t(C + '^{' + R + '}') + ' means take the cube root, raise it to the power ' + t(-sh.rn) + ', then take the reciprocal.')],
            t(C + '^{' + R + '}') + ' is not ' + t(C + '\\times\\left(' + R + '\\right)') + '. It is the reciprocal of ' + (sh.rn === -1 ? t(root) : t(core)) + ': ' + t(C + '^{' + R + '}=\\dfrac{1}{' + core + '}=' + (sh.rn === -1 ? '' : '\\dfrac{1}{' + Math.round(Math.cbrt(C)) + '^{2}}=') + ok2) + '.',
            ['What does a rational exponent on a number mean? Root, power, reciprocal.'], 'Jordan step 2 error');
        } },
        { id: '16c', sub: 'b-ii', level: 'EMG', make: function (r, sh) {
          var al = sh.al, w = sh.w, a1 = 'a^{' + al + '}\\cdot a^{' + w + '}';
          return P.mc(r, '(b) What is the error in <b>Step 3</b>?', [
            mcOpt('He multiplied the exponents, ' + t('(' + al + ')(' + w + ')=' + (al * w)) + '. A product of powers <b>adds</b> exponents: ' + t(a1 + '=' + pw('a', al + w, true)) + '.', true),
            mcOpt('He should have subtracted: ' + t(a1 + '=a^{' + (al - w) + '}') + '.', false, 'Subtracting exponents is for <b>dividing</b> powers. Here the powers are multiplied.'),
            mcOpt('He should have added the sizes of the exponents: ' + t(a1 + '=a^{' + (-al + w) + '}') + '.', false, 'Add the exponents with their signs: ' + t(al + '+' + w + '=' + (al + w)) + '.'),
            mcOpt('There is no error in Step 3: the Power of a Power Law multiplies exponents.', false, 'The Power of a Power Law is for ' + t('(a^{m})^{n}') + '. In Step 3 two powers of ' + t('a') + ' are multiplied, so the Product Law applies.')],
            t(a1) + ' is a product of powers with the same base, so the exponents are added (Product Law): ' + t('a^{' + al + '+' + w + '}=' + pw('a', al + w, true)) + ', not multiplied.',
            ['Is Step 3 a power of a power, or a product of powers?'], 'Jordan step 3 error');
        } },
        { id: '16d', sub: 'c', level: 'ADV', make: function (r, sh) {
          var tgt = posTex(sh.full, ['a', 'b']), al = sh.al, w = sh.w, be = sh.be, s = sh.s;
          var p = P.expo('(c) Write a correct simplification of ' + t(sh.orig) + ' with positive exponents.', tgt, { diag: function (an) {
            if (!an.coef || !an.vars.a) return null; var ca = an.coef, ea = an.vars.a;
            var isA = function (e) { return ea[0] === e * ea[1]; }, isC = function (c) { return ca[0] === Q(c)[0] && ca[1] === Q(c)[1]; };
            if (isC(sh.J) && isA(al * w)) return { code: 'jordan', hint: 'That is Jordan’s answer — fix both of his errors (the value of ' + t(sh.C + '^{' + eS(sh.Rr) + '}') + ' and the exponent of ' + t('a') + ').' };
            if (isC(sh.J) && isA(al + w)) return { code: 'fix-step2', hint: 'The exponent of ' + t('a') + ' is fixed. Now the coefficient: ' + t(sh.C + '^{' + eS(sh.Rr) + '}=\\frac{1}{' + s + '}') + ', not ' + t(sh.J) + '.' };
            if (isC(Q(1, s)) && isA(al * w)) return { code: 'fix-step3', hint: 'The coefficient is fixed. Now the exponent of ' + t('a') + ': ' + t('a^{' + al + '}\\cdot a^{' + w + '}') + ' adds the exponents.' };
            return null; } },
            'Step 1 is correct: ' + t(sh.steps[0]) + '.<br>' + t(sh.C + '^{' + eS(sh.Rr) + '}=\\frac{1}{' + s + '}') + ', and ' + t('a^{' + al + '}\\cdot a^{' + w + '}=' + pw('a', al + w, true)) + '.<br>' + t('\\frac{1}{' + s + '}' + pw('a', al + w) + pw('b', be) + '=' + tgt) + '.',
            ['Start again from Step 1, which is correct. Fix the coefficient, then add the exponents of ' + t('a') + '.'], 'Jordan corrected');
          p.bad = [sh.J + 'a^{' + (al * w) + '}b^{' + be + '}'];
          return p;
        } },
        { id: '16e', sub: 'd', level: 'EMG', make: function (r, sh) {
          var s = sh.s;
          return P.fraction('(d) Verify: substitute ' + t('a=1') + ' and ' + t('b=1') + ' into the <b>original</b> expression. What is its value?', [1, s], { diag: function (v) {
            if (ex.eq(v, sh.J)) return { code: 'jordan', hint: 'That is what Jordan’s answer gives. Substitute into the original expression: ' + t('(' + sh.C + '\\cdot 1\\cdot 1)^{' + eS(sh.Rr) + '}\\cdot 1') + '.' };
            if (ex.eq(v, s)) return { code: 'no-flip', hint: 'The exponent ' + t(eS(sh.Rr)) + ' is negative: take the reciprocal.' };
            return null; } },
            'Original: ' + t('\\left(' + sh.C + '\\cdot 1\\cdot 1\\right)^{' + eS(sh.Rr) + '}\\cdot\\left(1^{1/2}\\right)^{' + (2 * sh.w) + '}=' + sh.C + '^{' + eS(sh.Rr) + '}=\\frac{1}{' + s + '}') + '. The corrected answer also gives ' + t('\\frac{1}{' + s + '}') + ' ✔, while Jordan’s gives ' + t(sh.J) + '.',
            ['Every power of ' + t('1') + ' is ' + t('1') + ', so only the number ' + t(sh.C + '^{' + eS(sh.Rr) + '}') + ' is left.'], 'Jordan check a=b=1');
        } }] },
      { num: '17', section: 'Part F — Extension: Scientific Notation', stem: '<i>(Extension, Multiple Choice)</i>', parts: [{ id: '17', level: 'BEG', make: q17 }] },
      { num: '18', stem: '<i>(Extension, Multiple Choice)</i>', parts: [{ id: '18', level: 'BEG', make: q18 }] },
      { num: '19', stem: q19stem, shared: q19shared, parts: [
        { id: '19a', level: 'EMG', make: function (r, sh) {
          var x = sh.body.c / sh.lng.L, N = Math.round(x / 1e6) * 1e6;
          return { prompt: '(a) Determine, to the nearest million, the number of ' + sh.lng.what + ' that would need to ' + sh.lng.how + ' (each one ' + t(sh.lng.L) + ' m long) to encircle ' + sh.body.name + '.', input: { type: 'math', keys: 'sci' }, key: String(N), answer: t(F(N)), text: '19a ' + sh.body.name + '/' + sh.lng.L,
            check: function (resp) {
              var pn = HW.parse.number(resp), v; if (pn.ok) v = pn.value; else { var a = K.read(resp); if (a.res) return a.res; v = a.val; }
              if (releq(v, N)) return ok();
              if (Math.abs(v - x) / x < 0.01) return form('not-round', 'Right calculation — now round it to the nearest million.');
              var lg = Math.log10(Math.abs(v / x)); if (isFinite(lg) && Math.abs(lg - Math.round(lg)) < 0.03 && Math.round(lg) !== 0) return wrong('power-off', 'Check the power of ' + t('10') + ' in the circumference.');
              if (Math.abs(v - sh.body.c * sh.lng.L) / (sh.body.c * sh.lng.L) < 0.01) return wrong('value', 'Divide the circumference by the length of one ' + sh.lng.name + ' — don’t multiply.');
              return wrong('value', null); },
            solution: 'Divide the circumference of ' + sh.body.name + ' by one length: ' + t('\\dfrac{' + sh.body.ct + '}{' + sh.lng.L + '}\\approx ' + F(Math.round(x))) + ', which is ' + t(F(N)) + ' to the nearest million.',
            hints: ['Number needed = circumference ÷ length of one.'], good: [F(N, true), K.sciTex(N)], bad: [String(Math.round(x))] };
        } },
        { id: '19b', level: 'BEG', make: function (r, sh) {
          var x = sh.grow.g * sh.pop.p;
          return sciPart('(b) Estimate the total ' + sh.grow.what + ' in one month, summed across the entire population of ' + sh.pop.name + '. Answer in scientific notation to the nearest hundredth (in metres).', x, { sig: 3 },
            'Multiply the growth per person by the population: ' + t('(' + sh.grow.gt + ')\\times(' + sh.pop.pt + ')=' + K.roundTo(x / Math.pow(10, K.sciParts(x).n), 4) + '\\times 10^{' + K.sciParts(x).n + '}\\approx ' + sciT(x, 3)) + ' m.',
            ['Product: multiply the coefficients, add the exponents.'], '19b');
        } },
        { id: '19c', level: 'EMG', make: function (r, sh) {
          var x = sh.big.m / sh.part.m;
          return sciPart('(c) Approximately how many ' + sh.part.name + 's would have the same combined mass as ' + sh.big.name + '? Answer in scientific notation to the nearest hundredth.', x, { sig: 3 },
            'Divide ' + sh.big.name + '’s mass by the mass of one ' + sh.part.name + ': ' + t('\\dfrac{' + sh.big.mt + '}{' + sh.part.mt + '}=\\left(\\dfrac{' + sh.big.mt.split('\\times')[0] + '}{' + sh.part.mt.split('\\times')[0] + '}\\right)\\times 10^{' + K.sciParts(sh.big.m).n + '-(' + K.sciParts(sh.part.m).n + ')}\\approx ' + sciT(x, 3)) + '.',
            ['Quotient: divide the coefficients, subtract the exponents (careful with the negative).'], '19c');
        } },
        { id: '19d', level: 'BEG', make: function (r, sh) {
          var x = sh.big.m / sh.small.m;
          return P.approx('(d) How many times heavier is ' + sh.big.name + ' than ' + sh.small.name + '? Answer in standard decimal form to the nearest whole number.', x, 0, {},
            t('\\dfrac{' + sh.big.mt + '}{' + sh.small.mt + '}=\\dfrac{' + sh.big.mt.split('\\times')[0] + '}{' + sh.small.mt.split('\\times')[0] + '}\\times 10^{' + (K.sciParts(sh.big.m).n - K.sciParts(sh.small.m).n) + '}\\approx ' + K.roundTo(x, 2) + '\\approx ' + K.roundTo(x, 0)) + ' times.',
            ['Divide the larger mass by the smaller one.'], '19d');
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Simplifying with every law', stem: 'Simplify. Write every final answer with positive exponents. Work the brackets first.', parts: [
        { id: 'e1a', level: 'PRG', make: e1a }, { id: 'e1b', level: 'PRG', make: e1b }, { id: 'e1c', level: 'PRG', make: e1c }, { id: 'e1d', level: 'PRG', make: e1d }] },
      { num: '2', stem: 'Three more of the same kind. One of these answers keeps both a fractional exponent and a fraction in front — that is not a sign that you have gone wrong.', parts: [
        { id: 'e2a', level: 'PRG', make: e2a }, { id: 'e2b', level: 'PRG', make: e2b }, { id: 'e2c', level: 'PRG', make: e2c }] },
      { num: '3', stem: 'Each expression collapses all the way to a <b>number</b>. Simplify it.', parts: [
        { id: 'e3a', level: 'EMG', make: e3a }, { id: 'e3b', level: 'PRG', make: e3b }, { id: 'e3c', level: 'PRG', make: e3c },
        { id: 'e3d', level: 'EMG', make: function (r) {
          var x = r.pick([2, 3, -2, -3]), y = r.pick([5, -1, 4].filter(function (v) { return v !== x; }));
          return P.mc(r, 'A student checks an answer of this kind by substituting ' + t('x=' + x) + ' and ' + t('x=' + y) + ', and both work. Which statement is true?', [
            mcOpt('Two successful substitutions are good evidence but not a proof. The simplification proves it, because each exponent law holds for every allowed value.', true),
            mcOpt('Two substitutions prove it, because two points are enough to check any expression.', false, 'Different expressions can agree at two values and still differ somewhere else. No finite list of checks can rule that out.'),
            mcOpt('Substitution can never be trusted, so the check was a waste of time.', false, 'A substitution can catch a mistake — it is good evidence. It just can’t prove the result for <i>every</i> value.'),
            mcOpt('It is proved only once every whole number has been substituted.', false, 'There are infinitely many values to try — that would never finish. The exponent laws give a proof that covers all of them at once.')],
            'A substitution checks one value at a time; an expression could match at ' + t('x=' + x) + ' and ' + t('x=' + y) + ' and still differ elsewhere. What <b>proves</b> it is the simplification: every step used an exponent law, and those laws hold for every allowed value (' + t('x\\neq 0') + ').',
            ['What can a single substitution tell you, and what can’t it?'], 'evidence vs proof');
        } }] },
      { num: '4', section: 'Extra practice B — Evaluating exactly', stem: 'Evaluate exactly. Flip first, then take the root, then apply the power. Give each answer as a fraction in lowest terms (or a whole number).', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) { return e4part(r, 4, 3, [[2, 3], [2, 3], [3, 2], [1, 2], [1, 3], [2, 5]]); } },
        { id: 'e4b', level: 'PRG', make: function (r) { return e4part(r, 3, 2, [[2, 5], [2, 5], [2, 3], [3, 4], [1, 4], [3, 5], [4, 5]]); } },
        { id: 'e4c', level: 'PRG', make: function (r) { var pq = r.pick([[3, 2], [3, 2], [2, 3], [5, 2], [4, 3]]); return e4part(r, 2, pq[0] + pq[1] === 5 ? (r.chance(0.7) ? 5 : 3) : 3, [pq]); } },
        { id: 'e4d', level: 'EMG', make: function (r) { var k = r.pick([2, 2, 3]); return e4part(r, 5, k === 2 ? r.int(2, 4) : r.int(2, 3), [[1, k]]); } }] },
      { num: '5', stem: 'Evaluate exactly (a fraction in lowest terms or a whole number).', parts: [
        { id: 'e5a', level: 'PRG', make: e5a }, { id: 'e5b', level: 'PRG', make: e5b }, { id: 'e5c', level: 'EMG', make: e5c }, { id: 'e5d', level: 'PRG', make: e5d }] },
      { num: '6', stem: 'Two of the six powers in this question have <b>no meaning</b> (as a real number). For each power, give its exact value, or press <b>none</b> if it has no meaning.', parts: ['a', 'b', 'c', 'd', 'e', 'f'].map(function (w) {
        return { id: 'e6' + w, level: { a: 'EMG', b: 'EMG', c: 'EMG', d: 'PRG', e: 'EMG', f: 'PRG' }[w], make: function (r) { return e6part(r, w); } }; }) },
      { num: '7', section: 'Extra practice C — Radicals and rational exponents', stem: 'Rewrite each radical as a power first, then use the laws. Write the answer as a power with a positive exponent, and then as an entire radical.', parts: [
        { id: 'e7a', level: 'PRG', make: e7a }, { id: 'e7b', level: 'PRG', make: e7b }, { id: 'e7c', level: 'PRG', make: e7c }, { id: 'e7d', level: 'PRG', make: e7d }] },
      { num: '8', stem: 'Same job, but a coefficient now rides along. A coefficient outside the power stays outside the radical.', parts: [
        { id: 'e8a', level: 'PRG', make: e8a }, { id: 'e8b', level: 'PRG', make: e8b }, { id: 'e8c', level: 'PRG', make: e8c }] },
      { num: '9', stem: 'Working backwards. Find the missing exponent or index.', parts: [
        { id: 'e9a', level: 'PRG', make: e9a }, { id: 'e9b', level: 'PRG', make: e9b }, { id: 'e9c', level: 'ADV', make: e9c }, { id: 'e9d', level: 'ADV', make: e9d }] },
      { num: '10', stem: 'Write both sides as powers of one common base, then equate the exponents. Not every answer is a whole number.', parts: [
        { id: 'e10a', level: 'PRG', make: e10a }, { id: 'e10b', level: 'PRG', make: function (r) { return e10bc(r, false); } }, { id: 'e10c', level: 'PRG', make: function (r) { return e10bc(r, true); } },
        { id: 'e10d', level: 'ADV', make: e10d }, { id: 'e10e', level: 'PRG', make: e10e }, { id: 'e10f', level: 'ADV', make: e10f }] },
      { num: '11', section: 'Extra practice D — Scientific notation in context', stem: 'Write the given quantity in scientific notation, carry out the operation using an exponent law, and report the result both in scientific notation and in standard decimal form.', parts: [
        { id: 'e11a', level: 'BEG', make: function (r) { return e11(r, 'a'); } }, { id: 'e11b', level: 'EMG', make: function (r) { return e11(r, 'b'); } },
        { id: 'e11c', level: 'BEG', make: function (r) { return e11(r, 'c'); } }, { id: 'e11d', level: 'EMG', make: function (r) { return e11(r, 'd'); } }] },
      { num: '12', stem: function (sh) { return 'A single bacterium has a mass of about ' + t(sh.at + '\\times 10^{-' + sh.p + '}') + ' g.'; },
        shared: function (r) {
          var pairs = [[9.5, 4], [9.5, 4], [6.5, 2], [8.5, 4], [1.5, 8], [4.5, 4], [7.5, 2], [2.4, 5], [6.5, 6], [8.5, 2]], pr = r.pick(pairs);
          return { a: pr[0], at: pr[0].toFixed(1), b: pr[1], bt: pr[1].toFixed(1), p: r.int(11, 14), q: r.int(6, 9) };
        },
        parts: [
          { id: 'e12a', level: 'BEG', make: function (r, sh) {
            var prod = num1(sh.a * sh.b), x = prod * Math.pow(10, sh.q - sh.p);
            return sciPart('(a) A colony holds ' + t(sh.bt + '\\times 10^{' + sh.q + '}') + ' of them. Find the colony’s mass in scientific notation (in grams).', x, {},
              'Multiply the coefficients and add the exponents: ' + t('(' + sh.at + '\\times ' + sh.bt + ')\\times 10^{-' + sh.p + '+' + sh.q + '}=' + prod + '\\times 10^{' + (sh.q - sh.p) + '}=' + sciT(x)) + ' g.',
              ['Total mass = number of bacteria × mass of one.'], 'colony mass');
          } },
          { id: 'e12b', level: 'EMG', make: function (r, sh) {
            var x = 1 / (sh.a * Math.pow(10, -sh.p));
            return sciPart('(b) How many bacteria have a combined mass of ' + t('1') + ' g? Answer in scientific notation to the nearest hundredth.', x, { sig: 3 },
              'Divide ' + t('1') + ' g by the mass of one: ' + t('\\dfrac{1}{' + sh.at + '\\times 10^{-' + sh.p + '}}=\\dfrac{1}{' + sh.at + '}\\times 10^{0-(-' + sh.p + ')}=' + K.roundTo(1 / sh.a, 5) + '\\times 10^{' + sh.p + '}\\approx ' + sciT(x, 3)) + '.',
              ['Number = total mass ÷ mass of one.', 'The coefficient ' + t('\\frac{1}{' + sh.at + '}') + ' is less than 1, so renormalize.'], 'bacteria in 1 g');
          } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            return P.mc(r, '(c) Which exponent laws were used in (a) and (b)?', [
              mcOpt('(a) multiplies, so the Product Law (add exponents); (b) divides, so the Quotient Law (subtract exponents).', true),
              mcOpt('(a) uses the Quotient Law and (b) uses the Product Law.', false, 'In (a) you multiply the number of bacteria by the mass of one; in (b) you divide.'),
              mcOpt('Both use the Power of a Power Law.', false, 'Neither part raises a power to another power. Look at whether you multiplied or divided.'),
              mcOpt('Both use the Product Law, because scientific notation always multiplies.', false, 'In (b) the mass of one bacterium is in the <b>denominator</b>: ' + t('10^{0-(-' + sh.p + ')}') + ' subtracts exponents.')],
              '(a) <b>multiplies</b>, so the Product Law adds the exponents (' + t('-' + sh.p + '+' + sh.q) + '). (b) <b>divides</b>, so the Quotient Law subtracts them (' + t('0-(-' + sh.p + ')') + '). Both then renormalized the coefficient.',
              ['Did you multiply or divide in each part?'], 'laws used in sci notation');
          } }] },
      { num: '13', stem: 'Powers and roots of numbers in scientific notation. For a root, first rewrite the coefficient so that the index divides the exponent of 10 evenly (for example ' + t('4.9\\times 10^{-7}=49\\times 10^{-8}') + '). Give every answer in proper scientific notation.', parts: [
        { id: 'e13a', level: 'BEG', make: function (r) { return e13(r, 'a'); } }, { id: 'e13b', level: 'EMG', make: function (r) { return e13(r, 'b'); } }, { id: 'e13c', level: 'EMG', make: function (r) { return e13(r, 'c'); } },
        { id: 'e13d', level: 'BEG', make: function (r) { return e13(r, 'd'); } }, { id: 'e13e', level: 'EMG', make: function (r) { return e13(r, 'e'); } }, { id: 'e13f', level: 'EMG', make: function (r) { return e13(r, 'f'); } }] },
      { num: '14', stem: function (sh) { return 'A cube-shaped tank holds ' + t(sh.Vt) + ' m' + t('^{3}') + ' of liquid.'; },
        shared: function (r) {
          var d = r.pick([3, 3, 2, 4, 5]), j = r.pick([1, 1, 2]), f = r.pick([8, 8, 27, 64]), g = Math.round(Math.cbrt(f)), Vi = d * d * d, Ve = -3 * j;
          return { d: d, j: j, f: f, g: g, Vi: Vi, Ve: Ve, V: Vi * Math.pow(10, Ve), Vt: K.sciTex(Vi * Math.pow(10, Ve)), edge: d * Math.pow(10, -j) };
        },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            var e = sh.edge, sci = K.sciTex(e), std = decStr(sh.d, -sh.j), rw = sh.Vi >= 10 ? '=\\left(' + sh.Vi + '\\times 10^{' + sh.Ve + '}\\right)^{1/3}' : '';
            return P.fields('(a) The edge length is ' + t('V^{1/3}') + '. Find the edge length in scientific notation and in standard form.', [{ name: 'Scientific notation', label: 'Edge (scientific notation):', mode: 'math', keys: 'sci', wide: true, after: 'm' }, { name: 'Standard form', label: 'Edge (standard form):', after: 'm' }],
              [sciChk(e), stdChk(e)], [sci, std], t(sci) + ' m = ' + t(std) + ' m',
              t('V=s^{3}') + ', so ' + t('s=V^{1/3}=\\left(' + sh.Vt + '\\right)^{1/3}' + rw + '=' + sh.d + '\\times 10^{' + (-sh.j) + '}') + ' m ' + t('=' + std) + ' m.',
              ['Rewrite the coefficient so the exponent of 10 is a multiple of 3, then take the cube root of each part.'], 'tank edge');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            var SA = 6 * sh.d * sh.d * Math.pow(10, -2 * sh.j);
            return sciPart('(b) Find the total surface area of the tank, in scientific notation (in m' + t('^{2}') + ').', SA, {},
              'A cube has 6 square faces: ' + t('SA=6s^{2}=6\\left(' + sh.d + '\\times 10^{' + (-sh.j) + '}\\right)^{2}=6\\left(' + (sh.d * sh.d) + '\\times 10^{' + (-2 * sh.j) + '}\\right)=' + (6 * sh.d * sh.d) + '\\times 10^{' + (-2 * sh.j) + '}=' + sciT(SA)) + ' m' + t('^{2}') + '.',
              ['Surface area of a cube = 6 × (edge)².'], 'tank surface area');
          } },
          { id: 'e14c', level: 'PRG', make: function (r, sh) {
            var ne = sh.g * sh.d * Math.pow(10, -sh.j), std = decStr(sh.g * sh.d, -sh.j);
            return P.fields('(c) A second tank is a cube with ' + t(sh.f) + ' times the volume. By what factor does the edge grow, and what is the new edge length?', [{ name: 'Factor', label: 'The edge is multiplied by' }, { name: 'New edge', label: 'New edge:', mode: 'math', keys: 'sci', wide: true, after: 'm' }],
              [K.number(sh.g, function (v) { return v === sh.f ? { code: 'no-root', hint: 'The <b>volume</b> is ' + t(sh.f) + ' times as big. The edge is the cube root of the volume: ' + t('(' + sh.f + 'V)^{1/3}=' + sh.f + '^{1/3}V^{1/3}') + '.' } : null; }), anyNum(ne)], [String(sh.g), std],
              'factor ' + t(sh.g) + '; new edge ' + t(std) + ' m',
              t('(' + sh.f + 'V)^{1/3}=' + sh.f + '^{1/3}\\cdot V^{1/3}=' + sh.g + 'V^{1/3}') + ': the edge grows by a factor of ' + t(sh.g) + '.<br>New edge ' + t('=' + sh.g + '(' + decStr(sh.d, -sh.j) + ')=' + std) + ' m.',
              ['Power of a product: ' + t('(' + sh.f + 'V)^{1/3}=' + sh.f + '^{1/3}V^{1/3}') + '.'], 'tank scaled');
          } }] },
      { num: '15', section: 'Extra practice E — Reasoning and error analysis', stem: 'True or false?', parts: [
        { id: 'e15a', level: 'BEG', make: function (r) { var b = r.pick([2, 3, 5]), n = r.int(2, 3); return P.tf(r, 'A negative exponent makes the value of a power negative.', false, 'Try one: ' + t(b + '^{-' + n + '}=\\frac{1}{' + Math.pow(b, n) + '}') + ', which is positive.', '<b>False.</b> ' + t(b + '^{-' + n + '}=\\dfrac{1}{' + b + '^{' + n + '}}=\\dfrac{1}{' + Math.pow(b, n) + '}') + ' is positive. A negative exponent means the <b>reciprocal</b>: ' + t('a^{-n}=\\frac{1}{a^{n}}') + ' (' + t('a\\neq 0') + ').', ['Evaluate a simple example, like ' + t('2^{-3}') + '.'], 'neg exponent ≠ negative'); } },
        { id: 'e15b', level: 'PRG', make: function (r) { var a = r.pick([5, 3, 4]); return P.tf(r, t('\\sqrt[n]{a^{n}}=a') + ' for every real number ' + t('a') + ' and every natural number ' + t('n') + '.', false, 'Try ' + t('n=2') + ' and ' + t('a=-' + a) + ': ' + t('\\sqrt{(-' + a + ')^{2}}=\\sqrt{' + (a * a) + '}=' + a) + ', not ' + t('-' + a) + '.', '<b>False.</b> Counterexample: ' + t('\\sqrt{(-' + a + ')^{2}}=\\sqrt{' + (a * a) + '}=' + a + '\\neq -' + a) + '. It is true when ' + t('n') + ' is odd; when ' + t('n') + ' is even, ' + t('\\sqrt[n]{a^{n}}=|a|') + '.', ['Try a negative value of ' + t('a') + ' with an even index.'], 'nth root of a^n'); } },
        { id: 'e15c', level: 'PRG', make: function (r) { var a = r.pick([4, 9, 16]); return P.tf(r, t('a^{1/2}\\cdot a^{1/2}=a') + ' for every real number ' + t('a') + '.', false, 'Try ' + t('a=-' + a) + ': ' + t('(-' + a + ')^{1/2}=\\sqrt{-' + a + '}') + ' has no meaning as a real number.', '<b>False.</b> For ' + t('a=-' + a) + ', ' + t('(-' + a + ')^{1/2}=\\sqrt{-' + a + '}') + ' is not a real number, so the left side doesn’t exist. It is true for every ' + t('a\\ge 0') + '.', ['What happens for a negative value of ' + t('a') + '?'], 'a^(1/2)·a^(1/2)'); } },
        { id: 'e15d', level: 'PRG', make: function (r) { var m = r.int(2, 4), n = r.int(5, 7); return P.tf(r, 'If ' + t('a^{m}=a^{n}') + ', then ' + t('m=n') + '.', false, 'Try ' + t('a=1') + ': ' + t('1^{' + m + '}=1^{' + n + '}') + ', but ' + t(m + '\\neq ' + n) + '.', '<b>False.</b> ' + t('1^{' + m + '}=1^{' + n + '}=1') + ' but ' + t(m + '\\neq ' + n) + ' (also ' + t('0^{' + m + '}=0^{' + n + '}') + '). It is true when ' + t('a>0') + ' and ' + t('a\\neq 1') + '.', ['Are there any bases where every power is the same?'], 'equal powers ⇒ equal exponents?'); } },
        { id: 'e15e', level: 'EMG', make: function (r) {
          var k = r.pick([2, 2, 3, 4, 5]), tr = r.chance(0.6), rhs = tr ? k * k : -k * k;
          return P.tf(r, t('(-' + (k * k * k) + ')^{2/3}=' + rhs), tr, tr ? 'The index ' + t('3') + ' is odd, so ' + t('\\sqrt[3]{-' + k * k * k + '}=-' + k) + ' exists, and ' + t('(-' + k + ')^{2}=' + k * k) + '.' : 'Square the cube root: ' + t('(-' + k + ')^{2}=' + k * k) + ', which is positive.',
            '<b>' + (tr ? 'True' : 'False') + '.</b> The index ' + t('3') + ' is odd, so the negative base is fine: ' + t('(-' + k * k * k + ')^{2/3}=\\left(\\sqrt[3]{-' + k * k * k + '}\\right)^{2}=(-' + k + ')^{2}=' + k * k) + '.', ['Cube root first, then square.'], '(-' + k * k * k + ')^(2/3)');
        } },
        { id: 'e15f', level: 'EMG', make: function (r) {
          var a = r.pick([5, 4, 6, 8, 2, 3]), p = r.int(2, 6), a2 = a * a, tr = a2 < 10;
          return P.tf(r, t('(' + a + '\\times 10^{' + p + '})^{2}=' + a2 + '\\times 10^{' + (2 * p) + '}') + ', written in scientific notation.', tr, tr ? t('1\\le ' + a2 + '<10') + ', so this already is proper scientific notation.' : 'The value is right, but is ' + t(a2) + ' between ' + t('1') + ' and ' + t('10') + '?',
            '<b>' + (tr ? 'True' : 'False') + '.</b> ' + t('(' + a + '\\times 10^{' + p + '})^{2}=' + a2 + '\\times 10^{' + (2 * p) + '}') + (tr ? ', and ' + t('1\\le ' + a2 + '<10') + '.' : ' has the right value, but ' + t(a2) + ' is not less than ' + t('10') + ', so it isn’t scientific notation. Correct: ' + t(sciT(a2 * Math.pow(10, 2 * p))) + '.'), ['Check the coefficient: is it at least 1 and less than 10?'], 'sci notation squared');
        } }] },
      { num: '16', stem: function (sh) { return 'A student simplified ' + t(sh.orig) + ' like this. Exactly one line is the first to go wrong.\\[\\begin{array}{rl}\\text{Line 1:} & ' + sh.l1 + '\\\\ \\text{Line 2:} & ' + sh.l2 + '\\\\ \\text{Line 3:} & ' + sh.l3 + '\\\\ \\text{Line 4:} & ' + sh.l4 + '\\end{array}\\]'; },
        shared: function (r) {
          var k = r.pick([2, 2, 3]), a = r.int(1, 3), b = r.int(1, 3), D = r.pick(k === 2 ? [8, 8, 2, 3, 5] : [2, 4, 5]), c = r.int(1, 4), d = r.int(1, 4), ord = ['x', 'y'];
          var inner = M(k, { x: -a, y: b }), num = mpow(inner, -2), den = M(D, { x: -c, y: d }), ans = mdiv(num, den);
          var wc = Q(-k * k, D), X = 2 * a + c, Y = 2 * b + d;
          return { k: k, a: a, b: b, D: D, c: c, d: d, ord: ord, inner: inner, num: num, ans: ans, X: X, Y: Y, wc: wc, orig: '\\dfrac{' + br(rawTex(inner, ord)) + '^{-2}}{' + rawTex(den, ord) + '}',
            l1: '\\dfrac{' + (-k * k) + 'x^{' + (2 * a) + '}y^{' + (-2 * b) + '}}{' + rawTex(den, ord) + '}', l2: cTex(wc, true) + 'x^{' + (2 * a) + '-(' + (-c) + ')}y^{' + (-2 * b) + '-' + d + '}', l3: cTex(wc, true) + 'x^{' + X + '}y^{' + (-Y) + '}',
            l4: '-\\dfrac{' + (Math.abs(wc[0]) === 1 ? '' : Math.abs(wc[0])) + 'x^{' + X + '}}{' + (wc[1] === 1 ? '' : wc[1]) + 'y^{' + Y + '}}', den: den };
        },
        parts: [
          { id: 'e16a', level: 'EMG', make: function (r, sh) {
            return P.mc(r, '(a) Which line is the first to go wrong, and what did the student do?', [
              mcOpt('Line 1: the student read ' + t(sh.k + '^{-2}') + ' as ' + t(-sh.k * sh.k) + '. It should be ' + t('\\frac{1}{' + sh.k * sh.k + '}') + '.', true),
              mcOpt('Line 2: ' + t('x^{' + (2 * sh.a) + '-(' + (-sh.c) + ')}') + ' should be ' + t('x^{' + (2 * sh.a - sh.c) + '}') + '.', false, 'Subtracting a negative exponent adds: ' + t((2 * sh.a) + '-(' + (-sh.c) + ')=' + sh.X) + '. Line 2 is fine — look earlier.'),
              mcOpt('Line 4: ' + t('y^{' + (-sh.Y) + '}') + ' should stay in the numerator.', false, 'Moving ' + t('y^{' + (-sh.Y) + '}') + ' to the denominator as ' + t('y^{' + sh.Y + '}') + ' is exactly right.'),
              mcOpt('Line 1: ' + t('(x^{-' + sh.a + '})^{-2}') + ' should be ' + t('x^{-' + (2 * sh.a) + '}') + '.', false, 'Power of a power: ' + t('(-' + sh.a + ')(-2)=' + (2 * sh.a)) + ', positive. The ' + t('x') + ' part of Line 1 is correct.')],
              '<b>Line 1.</b> The exponent ' + t('-2') + ' on the ' + t(sh.k) + ' was treated as a negative sign: ' + t(sh.k + '^{-2}') + ' is not ' + t(-sh.k * sh.k) + '. A negative exponent means reciprocal: ' + t(sh.k + '^{-2}=\\frac{1}{' + sh.k + '^{2}}=\\frac{1}{' + sh.k * sh.k + '}') + '. (The ' + t('x^{' + 2 * sh.a + '}') + ' and ' + t('y^{' + (-2 * sh.b) + '}') + ' are correct.)',
              ['Check each part of Line 1 against ' + t(br(rawTex(sh.inner, sh.ord)) + '^{-2}') + '.'], 'first wrong line');
          } },
          { id: 'e16b', level: 'PRG', make: function (r, sh) {
            var tgt = posTex(sh.num, sh.ord);
            return P.expo('(b) Rewrite the numerator ' + t(br(rawTex(sh.inner, sh.ord)) + '^{-2}') + ' correctly, with positive exponents.', tgt, { diag: function (an) {
              if (an.coef && an.coef[0] === -sh.k * sh.k && an.coef[1] === 1) return { code: 'neg-power', hint: t(sh.k + '^{-2}') + ' is a reciprocal, ' + t('\\frac{1}{' + sh.k * sh.k + '}') + ', not a negative number.' };
              if (an.coef && an.coef[0] === sh.k * sh.k && an.coef[1] === 1) return { code: 'no-flip', hint: 'The exponent on ' + t(sh.k) + ' is negative too: ' + t(sh.k + '^{-2}=\\frac{1}{' + sh.k * sh.k + '}') + '.' };
              return null; } },
              t(br(rawTex(sh.inner, sh.ord)) + '^{-2}=' + sh.k + '^{-2}x^{' + (2 * sh.a) + '}y^{' + (-2 * sh.b) + '}=\\frac{1}{' + sh.k * sh.k + '}x^{' + (2 * sh.a) + '}y^{' + (-2 * sh.b) + '}=' + tgt) + '.',
              ['Send ' + t('-2') + ' to every factor in the bracket, including the ' + t(sh.k) + '.'], 'corrected numerator');
          } },
          { id: 'e16c', level: 'ADV', make: function (r, sh) {
            var tgt = posTex(sh.ans, sh.ord), wrongC = qmul(sh.wc, 1);
            return P.expo('(c) Finish the simplification and state the correct final answer.', tgt, { diag: function (an) {
              if (an.coef && an.coef[0] === wrongC[0] && an.coef[1] === wrongC[1]) return { code: 'jordan', hint: 'That’s the student’s answer. Start from the corrected numerator, with ' + t('\\frac{1}{' + sh.k * sh.k + '}') + ' in front.' };
              return null; } },
              t('\\dfrac{\\frac{1}{' + sh.k * sh.k + '}x^{' + (2 * sh.a) + '}y^{' + (-2 * sh.b) + '}}{' + rawTex(sh.den, sh.ord) + '}=\\dfrac{1}{' + sh.k * sh.k + '\\cdot ' + sh.D + '}x^{' + (2 * sh.a) + '-(' + (-sh.c) + ')}y^{' + (-2 * sh.b) + '-' + sh.d + '}=' + fin(sh.ans, sh.ord)) + '.',
              ['Divide the coefficients (' + t('\\frac{1}{' + sh.k * sh.k + '}\\div ' + sh.D) + '), subtract the exponents, then make every exponent positive.'], 'corrected final');
          } }] },
      { num: '17', stem: 'Where the rational-exponent laws come from.', parts: [
        { id: 'e17a', level: 'EMG', make: function (r) {
          var n = r.pick([3, 3, 4, 5]), f = '1/' + n, prod = []; for (var i = 0; i < n; i++) prod.push('a^{' + f + '}');
          var test = Math.pow(2, n);
          return P.mc(r, '(a) Assume only that the product law holds for fractional exponents. Which argument shows that ' + t('a^{' + f + '}') + ' must mean ' + t(rootTex(n, 'a')) + '?', [
            mcOpt(t(prod.join('\\cdot ') + '=a^{' + Array(n + 1).join('+' + f).slice(1).replace(/\+/g, '+') + '}=a^{1}=a') + ', so ' + t('a^{' + f + '}') + ' is a number that, used ' + n + ' times as a factor, gives ' + t('a') + ' — that is ' + t(rootTex(n, 'a')) + '.', true),
            mcOpt(t('a^{' + f + '}=a\\div ' + n) + ', because the exponent ' + t('\\frac{1}{' + n + '}') + ' means “divide by ' + n + '”.', false, 'Test it: ' + t(test + '^{' + f + '}=2') + ', but ' + t(test + '\\div ' + n + '\\neq 2') + '.'),
            mcOpt(t(prod.join('\\cdot ') + '=a^{1/' + Math.pow(n, n) + '}') + ', so ' + t('a^{' + f + '}') + ' must be a very small number.', false, 'The product law <b>adds</b> exponents; it doesn’t multiply them.'),
            mcOpt(t('a^{' + f + '}') + ' is just a new symbol; it was defined as a root and no argument is possible.', false, 'The definition isn’t arbitrary: the product law <i>forces</i> it. Multiply ' + t('a^{' + f + '}') + ' by itself ' + n + ' times.')],
            t(prod.join('\\cdot ') + '=a^{1}=a') + '. So ' + t('a^{' + f + '}') + ' used ' + n + ' times as a factor gives ' + t('a') + ', which is exactly what ' + t(rootTex(n, 'a')) + ' means. The product law leaves no choice: ' + t('a^{' + f + '}=' + rootTex(n, 'a')) + '.',
            ['Multiply ' + t('a^{' + f + '}') + ' by itself ' + n + ' times using the product law.'], 'why a^(1/n) is a root');
        } },
        { id: 'e17b', level: 'EMG', make: function (r) {
          var n = r.int(2, 5);
          return P.mc(r, '(b) Which argument uses the quotient law to explain why ' + t('a^{0}=1') + ', and why the law needs ' + t('a\\neq 0') + '?', [
            mcOpt(t('\\dfrac{a^{' + n + '}}{a^{' + n + '}}=1') + ' (a nonzero number over itself), and the quotient law gives ' + t('a^{' + n + '-' + n + '}=a^{0}') + ', so ' + t('a^{0}=1') + '. If ' + t('a=0') + ' the quotient is ' + t('\\frac{0}{0}') + ', which is undefined.', true),
            mcOpt(t('a^{0}=0') + ', because zero factors of ' + t('a') + ' multiply to nothing.', false, 'Compare ' + t('\\frac{a^{' + n + '}}{a^{' + n + '}}') + ' with the quotient law: the result must be ' + t('1') + ', not ' + t('0') + '.'),
            mcOpt(t('a^{0}=1') + ' for every ' + t('a') + ', including ' + t('a=0') + ', because ' + t('\\frac{0}{0}=1') + '.', false, t('\\frac{0}{0}') + ' is undefined — that is exactly why the law needs ' + t('a\\neq 0') + '.'),
            mcOpt(t('a^{0}=a') + ', because subtracting exponents leaves ' + t('a') + ' unchanged.', false, 'The quotient law gives ' + t('a^{' + n + '-' + n + '}=a^{0}') + ', and the quotient itself is ' + t('1') + '.')],
            t('\\dfrac{a^{' + n + '}}{a^{' + n + '}}=1') + ' for any ' + t('a\\neq 0') + '. The quotient law gives ' + t('\\dfrac{a^{' + n + '}}{a^{' + n + '}}=a^{0}') + '. Both must agree, so ' + t('a^{0}=1') + '. If ' + t('a=0') + ' the first step is ' + t('\\frac{0}{0}') + ', which is undefined.',
            ['Divide a power by itself in two ways.'], 'why a^0 = 1');
        } },
        { id: 'e17c', level: 'EMG', make: function (r) {
          var sp = r.pick([[32, 4, 5], [32, 4, 5], [81, 3, 4], [16, 3, 4], [27, 2, 3], [125, 2, 3], [64, 5, 6]]), A = sp[0], m = sp[1], n = sp[2], rt = iroot(A, n), val = Math.pow(rt, m), big = Math.pow(A, m);
          return P.number('(c) Evaluate ' + t(A + '^{' + m + '/' + n + '}') + ' without a calculator.', val, function (v) {
            if (v === A * m / n) return { code: 'exp-times', hint: 'The exponent is not a multiplier: ' + t(A + '^{' + m + '/' + n + '}=(' + rootTex(n, A) + ')^{' + m + '}') + '.' };
            if (v === rt) return { code: 'exp', hint: 'Good root — now raise it to the power ' + t(m) + '.' };
            return null; },
            'Root first: ' + t('(' + rootTex(n, A) + ')^{' + m + '}=' + rt + '^{' + m + '}=' + val) + '.<br>Power first: ' + t(rootTex(n, A + '^{' + m + '}') + '=' + rootTex(n, F(big)) + '=' + val) + '.<br>Both are ' + t(A + '^{' + m + '/' + n + '}') + ' because ' + t('\\frac{1}{' + n + '}\\cdot ' + m + '=' + m + '\\cdot\\frac{1}{' + n + '}') + '. Root first is easier — the numbers stay small.',
            ['Take the ' + K.rootName(n) + ' root first, then the power.'], A + '^(' + m + '/' + n + ')');
        } }] },
      { num: '18', stem: 'Scientific notation is the exponent laws in disguise. (Here ' + t('a\\times 10^{m}') + ' is written properly, so ' + t('1\\le a<10') + '.)', parts: [
        { id: 'e18a', level: 'EMG', make: function (r) {
          var a = r.pick([4, 5, 6, 8]), b = r.pick([3, 5, 4]), pr = a * b;
          return P.mc(r, '(a) Why can multiplying ' + t('(a\\times 10^{m})(b\\times 10^{n})') + ' force you to renormalize the coefficient, even though the exponent step ' + t('m+n') + ' is never in doubt?', [
            mcOpt('The coefficients multiply to ' + t('ab') + ', and from ' + t('1\\le a<10') + ', ' + t('1\\le b<10') + ' we only know ' + t('1\\le ab<100') + '. When ' + t('ab\\ge 10') + ' (e.g. ' + t(a + '\\times ' + b + '=' + pr) + ') one factor of ' + t('10') + ' must move onto the exponent.', true),
            mcOpt('The exponents ' + t('m+n') + ' can be negative, which is not allowed in scientific notation.', false, 'Negative exponents are fine in scientific notation (' + t('3.2\\times 10^{-4}') + '). The problem is the coefficient.'),
            mcOpt('The coefficient ' + t('ab') + ' can be less than ' + t('1') + '.', false, 'With ' + t('a\\ge 1') + ' and ' + t('b\\ge 1') + ', the product is at least ' + t('1') + '. It can be <b>too big</b>, not too small.'),
            mcOpt('Because ' + t('10^{m}\\times 10^{n}=10^{mn}') + ', the exponent has to be fixed.', false, 'Product Law: ' + t('10^{m}\\times 10^{n}=10^{m+n}') + '. That step is always fine.')],
            'The powers of ten combine by the Product Law, ' + t('10^{m}\\times 10^{n}=10^{m+n}') + ', and never need adjusting. The coefficients multiply to ' + t('ab') + ', and all we know is ' + t('1\\le ab<100') + '. Whenever ' + t('ab\\ge 10') + ' (e.g. ' + t(a + '\\times ' + b + '=' + pr) + '), the coefficient has left the legal range, so one factor of ' + t('10') + ' moves onto the exponent.',
            ['How big can ' + t('a\\times b') + ' be?'], 'why renormalize');
        } },
        { id: 'e18b', level: 'PRG', make: function (r) {
          return P.mc(r, '(b) For which values of ' + t('a') + ' does the coefficient of ' + t('(a\\times 10^{m})^{2}') + ' need renormalizing?', [
            mcOpt(t('a\\ge\\sqrt{10}\\approx 3.16'), true),
            mcOpt(t('a\\ge 5'), false, 'Try ' + t('a=4') + ': ' + t('4^{2}=16') + ', which is already ' + t('\\ge 10') + '.'),
            mcOpt(t('a>1'), false, 'Try ' + t('a=2') + ': ' + t('2^{2}=4') + ', still between ' + t('1') + ' and ' + t('10') + '.'),
            mcOpt('Never: squaring keeps the coefficient between ' + t('1') + ' and ' + t('10') + '.', false, 'Try ' + t('a=5') + ': ' + t('5^{2}=25') + '.')],
            'The coefficient becomes ' + t('a^{2}') + ', and from ' + t('1\\le a<10') + ' we get ' + t('1\\le a^{2}<100') + '. Renormalizing is needed when ' + t('a^{2}\\ge 10') + ', that is ' + t('a\\ge\\sqrt{10}\\approx 3.16') + '.',
            ['When is ' + t('a^{2}\\ge 10') + '?'], 'when squaring needs renormalizing', true);
        } },
        { id: 'e18c', level: 'EMG', make: function (r) {
          var a = r.pick([2, 4, 5, 8, 2.5, 1.6, 1.25]), n = r.pick([3, 4, 5, 6, -3, -4]), x = 1 / (a * Math.pow(10, n));
          return sciPart('(c) Write ' + t('(' + a + '\\times 10^{' + n + '})^{-1}') + ' in proper scientific notation.', x, {},
            t('(' + a + '\\times 10^{' + n + '})^{-1}=\\frac{1}{' + a + '}\\times 10^{' + (-n) + '}=' + num1(1 / a) + '\\times 10^{' + (-n) + '}') + '. The coefficient ' + t(num1(1 / a)) + ' is less than ' + t('1') + ', so renormalize: ' + t('=\\frac{10}{' + a + '}\\times 10^{' + (-n - 1) + '}=' + sciT(x)) + '.',
            ['Power of a product: ' + t('(a\\times 10^{n})^{-1}=a^{-1}\\times 10^{-n}') + '.', 'Then make the coefficient between 1 and 10.'], 'reciprocal in sci notation');
        } }] },
      { num: '19', section: 'Extra practice F — Challenge', stem: function (sh) { return 'Order ' + t('2^{' + sh.A + '}') + ', ' + t('3^{' + sh.B + '}') + ' and ' + t('5^{' + sh.C + '}') + ' from least to greatest without a calculator. The three exponents share no common factor, so match them two at a time.'; },
        shared: function (r) {
          var tr = r.pick([[40, 25, 18], [40, 25, 18], [21, 14, 9], [45, 27, 20], [55, 35, 22], [55, 33, 25]]), A = tr[0], B = tr[1], C = tr[2], g1 = gcd(A, B), g2 = gcd(A, C);
          var lg = function (b, e) { return e * Math.log(b); }, vals = [{ id: 'two', tex: '2^{' + A + '}', v: lg(2, A) }, { id: 'three', tex: '3^{' + B + '}', v: lg(3, B) }, { id: 'five', tex: '5^{' + C + '}', v: lg(5, C) }];
          return { A: A, B: B, C: C, g1: g1, g2: g2, b2a: Math.pow(2, A / g1), b3: Math.pow(3, B / g1), b2b: Math.pow(2, A / g2), b5: Math.pow(5, C / g2), order: vals.sort(function (x, y) { return x.v - y.v; }) };
        },
        parts: [
          { id: 'e19a', level: 'EMG', make: function (r, sh) {
            var g = sh.g1;
            return P.fields('(a) ' + t(sh.A) + ' and ' + t(sh.B) + ' are both multiples of ' + t(g) + '. Write ' + t('2^{' + sh.A + '}') + ' and ' + t('3^{' + sh.B + '}') + ' as ' + (g === 2 ? 'squares' : g === 3 ? 'cubes' : g + 'th powers') + ' (give each base as a whole number).',
              [{ name: '2^' + sh.A, label: t('2^{' + sh.A + '}=\\Big('), after: t('\\Big)^{' + g + '}') }, { name: '3^' + sh.B, label: t('3^{' + sh.B + '}=\\Big('), after: t('\\Big)^{' + g + '}') }],
              [K.number(sh.b2a, function (v) { return v === sh.A / g ? { code: 'exp', hint: 'The base is ' + t('2^{' + (sh.A / g) + '}') + ' — work out its value.' } : null; }), K.number(sh.b3, function (v) { return v === sh.B / g ? { code: 'exp', hint: 'The base is ' + t('3^{' + (sh.B / g) + '}') + ' — work out its value.' } : null; })],
              [String(sh.b2a), String(sh.b3)], t('2^{' + sh.A + '}=' + F(sh.b2a) + '^{' + g + '}') + ', ' + t('3^{' + sh.B + '}=' + F(sh.b3) + '^{' + g + '}'),
              t('2^{' + sh.A + '}=\\left(2^{' + (sh.A / g) + '}\\right)^{' + g + '}=' + F(sh.b2a) + '^{' + g + '}') + ' and ' + t('3^{' + sh.B + '}=\\left(3^{' + (sh.B / g) + '}\\right)^{' + g + '}=' + F(sh.b3) + '^{' + g + '}') + '. Since ' + t(F(Math.min(sh.b2a, sh.b3)) + '<' + F(Math.max(sh.b2a, sh.b3))) + ', ' + (sh.b2a < sh.b3 ? t('2^{' + sh.A + '}<3^{' + sh.B + '}') : t('3^{' + sh.B + '}<2^{' + sh.A + '}')) + '.',
              ['Power of a power in reverse: ' + t('2^{' + sh.A + '}=(2^{?})^{' + g + '}') + '.'], 'match exponents 2,3');
          } },
          { id: 'e19b', level: 'EMG', make: function (r, sh) {
            var g = sh.g2;
            return P.fields('(b) ' + t(sh.A) + ' and ' + t(sh.C) + ' are both multiples of ' + t(g) + '. Write ' + t('2^{' + sh.A + '}') + ' and ' + t('5^{' + sh.C + '}') + ' as ' + (g === 2 ? 'squares' : g === 3 ? 'cubes' : g + 'th powers') + '. (You may type each base as a power, e.g. ' + t('2^{' + (sh.A / g) + '}') + ', or as a number.)',
              [{ name: '2^' + sh.A, label: t('2^{' + sh.A + '}=\\Big('), after: t('\\Big)^{' + g + '}'), mode: 'math', keys: 'expo', vars: [] }, { name: '5^' + sh.C, label: t('5^{' + sh.C + '}=\\Big('), after: t('\\Big)^{' + g + '}'), mode: 'math', keys: 'expo', vars: [] }],
              [K.value(sh.b2b), K.value(sh.b5)], ['2^{' + (sh.A / g) + '}', '5^{' + (sh.C / g) + '}'], t('2^{' + sh.A + '}=\\left(2^{' + (sh.A / g) + '}\\right)^{' + g + '}') + ', ' + t('5^{' + sh.C + '}=\\left(5^{' + (sh.C / g) + '}\\right)^{' + g + '}'),
              t('2^{' + sh.A + '}=\\left(2^{' + (sh.A / g) + '}\\right)^{' + g + '}=' + F(sh.b2b) + '^{' + g + '}') + ' and ' + t('5^{' + sh.C + '}=\\left(5^{' + (sh.C / g) + '}\\right)^{' + g + '}=' + F(sh.b5) + '^{' + g + '}') + '. Since ' + t(F(Math.min(sh.b2b, sh.b5)) + '<' + F(Math.max(sh.b2b, sh.b5))) + ', ' + (sh.b2b < sh.b5 ? t('2^{' + sh.A + '}<5^{' + sh.C + '}') : t('5^{' + sh.C + '}<2^{' + sh.A + '}')) + '.',
              ['Divide each exponent by ' + t(g) + '.'], 'match exponents 2,5');
          } },
          { id: 'e19c', level: 'MAS', make: function (r, sh) {
            var o = sh.order;
            return P.order(r, '(c) Put the three powers in order from least to greatest.', o.map(function (x) { return { id: x.id, tex: x.tex }; }), {},
              'From (a) and (b), ' + t('2^{' + sh.A + '}') + ' lies between the other two, so ' + t(o.map(function (x) { return x.tex; }).join('<')) + '. Two comparisons are enough: “less than” is transitive, so the third pair never needs a common exponent.',
              ['Use your comparisons from (a) and (b): where does ' + t('2^{' + sh.A + '}') + ' sit?'], 'order 2^' + sh.A + ', 3^' + sh.B + ', 5^' + sh.C);
          } }] },
      { num: '20', stem: 'Solve each equation by writing both sides as powers of a single base.', parts: [
        { id: 'e20a', level: 'PRG', make: function (r) {
          var sp, d, x; for (var g = 0; g < 50; g++) { sp = r.pick([[5, 2, 3], [5, 2, 3], [2, 2, 3], [2, 3, 4], [3, 2, 3], [2, 2, 4]]); d = r.pick([1, 1, 2]); x = Q(sp[1] * d, sp[2] - sp[1]); if (!qeq(x, 6)) break; }
          var s = sp[0], a = sp[1], b = sp[2], L = Math.pow(s, a), R = Math.pow(s, b);
          return fracAns(t(L + '^{x+' + d + '}=' + R + '^{x}') + '. Solve for ' + t('x') + '.', x,
            t('(' + s + '^{' + a + '})^{x+' + d + '}=(' + s + '^{' + b + '})^{x}') + '<br>' + t(s + '^{' + a + 'x+' + (a * d) + '}=' + s + '^{' + b + 'x}') + '<br>' + t(a + 'x+' + (a * d) + '=' + b + 'x') + ', so ' + t('x=' + rT(x)) + '.',
            ['Write ' + t(L) + ' and ' + t(R) + ' as powers of ' + t(s) + '.'], 'E20a', function (v) { if (ex.eq(v, qv(Q(d, b - a)))) return { code: 'no-double', hint: 'Multiply the whole ' + t('x+' + d) + ' by ' + t(a) + '.' }; return null; });
        } },
        { id: 'e20b', level: 'PRG', make: function (r) {
          var s = r.pick([2, 2, 3]), n = r.pick([3, 3, 2, 4]), c = r.pick(s === 2 ? [4, 3, 5] : [2, 3, 4]); if (n * c === 6) c = c + 1; var R = Math.pow(s, c), x = n * c;
          return fracAns(t(br(rootTex(n, s)) + '^{x}=' + R) + '. Solve for ' + t('x') + '.', x,
            t(br(s + '^{1/' + n + '}') + '^{x}=' + s + '^{' + c + '}') + '<br>' + t(s + '^{x/' + n + '}=' + s + '^{' + c + '}') + ', so ' + t('\\frac{x}{' + n + '}=' + c) + ' and ' + t('x=' + x) + '.',
            ['Write ' + t(rootTex(n, s)) + ' as ' + t(s + '^{1/' + n + '}') + '.'], 'E20b', function (v) { if (ex.eq(v, c / n)) return { code: 'exp', hint: t('\\frac{x}{' + n + '}=' + c) + ': multiply both sides by ' + t(n) + '.' }; return null; });
        } },
        { id: 'e20c', level: 'ADV', make: function (r) {
          var ab = r.pick([[2, 3], [2, 3], [3, 2], [2, 4]]), a = ab[0], b = ab[1], d = r.pick([1, 1, 2]), c = r.int(5, 12), x = Q(c + b * d, a + b);
          return fracAns(t(Math.pow(2, a) + '^{x}\\cdot ' + Math.pow(2, b) + '^{x-' + d + '}=2^{' + c + '}') + '. Solve for ' + t('x') + '.', x,
            t('(2^{' + a + '})^{x}\\cdot(2^{' + b + '})^{x-' + d + '}=2^{' + c + '}') + '<br>' + t('2^{' + a + 'x}\\cdot 2^{' + b + 'x-' + (b * d) + '}=2^{' + (a + b) + 'x-' + (b * d) + '}=2^{' + c + '}') + '<br>' + t((a + b) + 'x-' + (b * d) + '=' + c) + ', so ' + t('x=' + rT(x)) + '.',
            ['Powers of 2 on both sides. Product Law: add the exponents.'], 'E20c', function (v) { if (ex.eq(v, qv(Q(c + d, a + b)))) return { code: 'no-double', hint: 'Distribute: ' + t(b + '(x-' + d + ')=' + b + 'x-' + (b * d)) + '.' }; return null; });
        } },
        { id: 'e20d', level: 'ADV', make: function (r) {
          var s = r.pick([3, 3, 2, 5]), a = r.pick(s === 5 ? [2] : [3, 2]), n = r.pick([2, 2, 3]), x = Q(-1, a * n);
          return fracAns(t('\\left(\\dfrac{1}{' + Math.pow(s, a) + '}\\right)^{x}=' + rootTex(n, s)) + '. Solve for ' + t('x') + '.', x,
            t('(' + s + '^{-' + a + '})^{x}=' + s + '^{1/' + n + '}') + '<br>' + t(s + '^{-' + a + 'x}=' + s + '^{1/' + n + '}') + ', so ' + t('-' + a + 'x=\\frac{1}{' + n + '}') + ' and ' + t('x=' + rT(x)) + '.',
            ['A reciprocal is a negative exponent; a root is a fractional exponent.'], 'E20d', function (v) { if (ex.eq(v, -qv(x))) return { code: 'sign', hint: t('\\frac{1}{' + Math.pow(s, a) + '}=' + s + '^{-' + a + '}') + ' — the exponent is negative.' }; return null; });
        } }] },
      { num: '21', stem: function (sh) { return 'Consider ' + t(sh.tex) + ', with ' + t('a>0') + ' and ' + t('b>0') + '.'; },
        shared: function (r) {
          var sp = r.pick([[[3, 2], -6], [[3, 2], -6], [[3, 2], -4], [[2, 3], -6], [[2, 3], -3]]), Bn = Q(sp[0][0], sp[0][1]), k = sp[1], al2 = r.pick([Q(1, 3), Q(1, 3), Q(1, 2), Q(2, 3)]), al1 = qsub(al2, 1);
          var be2 = Bn[1] === 2 ? Q(-1) : Q(-1, 3), be1 = qadd(Bn, be2), ord = ['a', 'b'];
          var N = M(1, { a: al1, b: be1 }), D = M(1, { a: al2, b: be2 }), I = mdiv(N, D), A = mpow(I, k), P1 = qv(A.v.a), Q1 = -qv(A.v.b), g = gcd(P1, Q1), cp = Q1 / g, cq = P1 / g; // a^{P1} = b^{Q1} ⇔ a^{cq}... condition a^{P1/g} = b^{Q1/g}
          var tt = r.pick([2, 2, 3]);
          return { N: N, D: D, I: I, A: A, k: k, ord: ord, P1: P1, Q1: Q1, ea: Q1 / g, eb: P1 / g, tt: tt, av: Math.pow(tt, Q1 / g), bv: Math.pow(tt, P1 / g), tex: '\\left(\\dfrac{' + rawTex(N, ord) + '}{' + rawTex(D, ord) + '}\\right)^{' + k + '}' };
        },
        parts: [
          { id: 'e21a', level: 'PRG', make: function (r, sh) {
            return P.expo('(a) Simplify it, writing the answer with positive exponents.', posTex(sh.A, sh.ord), {},
              'Inside first (quotient law): ' + t(lawWork(sh.N, sh.D, sh.ord, true) + '=' + rawTex(sh.I, sh.ord)) + '.<br>Power law: ' + t(br(rawTex(sh.I, sh.ord)) + '^{' + sh.k + '}=' + fin(sh.A, sh.ord)) + '.',
              ['Simplify inside the bracket first, then multiply each exponent by ' + t(sh.k) + '.'], 'E21a');
          } },
          { id: 'e21b', level: 'EMG', make: function (r, sh) {
            return P.fraction('(b) Evaluate the simplified form at ' + t('a=' + sh.av) + ' and ' + t('b=' + sh.bv) + '.', 1, {},
              t('\\dfrac{' + sh.av + '^{' + sh.P1 + '}}{' + sh.bv + '^{' + sh.Q1 + '}}=\\dfrac{(' + sh.tt + '^{' + sh.ea + '})^{' + sh.P1 + '}}{(' + sh.tt + '^{' + sh.eb + '})^{' + sh.Q1 + '}}=\\dfrac{' + sh.tt + '^{' + sh.ea * sh.P1 + '}}{' + sh.tt + '^{' + sh.eb * sh.Q1 + '}}=1') + '.',
              ['Write ' + t(sh.av) + ' and ' + t(sh.bv) + ' as powers of ' + t(sh.tt) + '.'], 'E21b');
          } },
          { id: 'e21c', level: 'MAS', make: function (r, sh) {
            var t2 = sh.tt === 2 ? 3 : 2, ka = Math.pow(t2, sh.ea), kb = Math.pow(t2, sh.eb), P1 = sh.P1, Q1 = sh.Q1;
            var chk = function (resp) {
              resp = resp || []; var pa = HW.parse.number(resp[0] || ''), pb = HW.parse.number(resp[1] || '');
              if (!pa.ok || !pb.ok) return form('empty', 'Type a positive number in each box.');
              var A = pa.value, B = pb.value; if (A <= 0 || B <= 0) return wrong('value', t('a') + ' and ' + t('b') + ' must both be positive.');
              if (A === sh.av && B === sh.bv) return form('same-pair', 'That’s the pair from (b) — find a <b>different</b> pair.');
              if (Math.abs(P1 * Math.log(A) - Q1 * Math.log(B)) < 1e-9 * Math.max(1, Math.abs(P1 * Math.log(A)))) return ok();
              return wrong('cond', 'At ' + t('a=' + A) + ', ' + t('b=' + B) + ' the value isn’t ' + t('1') + '. You need ' + t('a^{' + P1 + '}=b^{' + Q1 + '}') + (P1 === sh.eb ? '' : ', that is ' + t('a^{' + sh.eb + '}=b^{' + sh.ea + '}')) + '. Try ' + t('a') + ' and ' + t('b') + ' as powers of the same number.');
            };
            return { prompt: '(c) Find <b>another</b> pair ' + t('a,b>0') + ' that gives the same value as in (b).', input: { type: 'fields', fields: [{ name: 'a', label: t('a=') }, { name: 'b', label: t('b=') }] }, check: chk, key: [String(ka), String(kb)],
              answer: 'For example ' + t('a=' + ka) + ', ' + t('b=' + kb) + ' (any pair with ' + t('a^{' + sh.eb + '}=b^{' + sh.ea + '}') + ')',
              solution: 'The value is ' + t('1') + ' exactly when ' + t('a^{' + P1 + '}=b^{' + Q1 + '}') + (P1 === sh.eb ? '' : ', that is ' + t('a^{' + sh.eb + '}=b^{' + sh.ea + '}')) + ' (check: ' + t(sh.av + '^{' + sh.eb + '}=' + Math.pow(sh.av, sh.eb) + '=' + sh.bv + '^{' + sh.ea + '}') + ').<br>Another pair: ' + t('a=' + ka) + ', ' + t('b=' + kb) + ', since ' + t(ka + '^{' + sh.eb + '}=' + F(Math.pow(ka, sh.eb)) + '=' + kb + '^{' + sh.ea + '}') + '.',
              hints: ['When is ' + t(posTex(sh.A, sh.ord)) + ' equal to ' + t('1') + '?', 'Look at how ' + t(sh.av) + ' and ' + t(sh.bv) + ' are related as powers of ' + t(sh.tt) + '.'], text: 'E21c another pair', good: [[String(ka), String(kb)]], bad: [[String(sh.av), String(sh.bv)], [String(kb), String(ka)]] };
          } }] },
      { num: '22', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e22', level: 'EMG', make: function (r) {
          var C = r.pick([8, 8, 27, 64]), s2 = Math.round(Math.pow(Math.cbrt(C), 2)), Dd = r.pick(s2 === 4 ? [2, 2] : s2 === 9 ? [3] : [2, 4, 8]), a = r.int(1, 2), b = r.int(1, 2), c = r.int(1, 3), d = r.int(2 * b + 1, 2 * b + 3), ord = ['x', 'y'];
          var top = M(C, { x: 3 * a, y: -3 * b }), T = mpow(top, Q(2, 3)), bot = M(Dd, { x: -c, y: -d }), A = mdiv(T, bot), k = s2 / Dd, X = 2 * a + c, Y = d - 2 * b;
          var mono = function (cc, xe, ye, flipY) { return t(flipY ? '\\dfrac{' + (cc === 1 ? '' : cc) + pw('x', xe) + '}{' + pw('y', ye) + '}' : (cc === 1 ? '' : cc) + pw('x', xe) + pw('y', ye)); };
          var opts = distinctOpts({ html: mono(k, X, Y) }, [
            { html: mono(k, 2 * a - c, Y), why: 'Subtract the denominator’s exponent with its sign: ' + t((2 * a) + '-(-' + c + ')=' + X) + '.', k: k + '|' + (2 * a - c) + '|' + Y },
            { html: mono(k, X, Y, true), why: t('y') + ' is on the wrong side: ' + t((-2 * b) + '-(-' + d + ')=' + Y) + ' is positive, so it stays in the numerator.', k: k + '|' + X + '|-' + Y },
            { html: mono(C / Dd, X, Y), why: t(C + '^{2/3}') + ' is not ' + t(C) + ': ' + t(powNote(C, Q(2, 3))) + '.', k: (C / Dd) + '|' + X + '|' + Y }],
            function (o) { return o.k || (k + '|' + X + '|' + Y); });
          return P.mc(r, 'The expression ' + t('\\dfrac{' + br(rawTex(top, ord)) + '^{2/3}}{' + rawTex(bot, ord) + '}') + ' simplifies to', opts,
            t(br(rawTex(top, ord)) + '^{2/3}=' + rawTex(T, ord)) + ' (since ' + t(powNote(C, Q(2, 3))) + ').<br>' + t('\\dfrac{' + rawTex(T, ord) + '}{' + rawTex(bot, ord) + '}=' + lawWork(T, bot, ord, true) + '=' + posTex(A, ord)) + '.',
            ['Bracket first, then the quotient law.'], 'E22');
        } }] },
      { num: '23', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e23', level: 'EMG', make: function (r) {
          var ab = r.pick([[6, 4], [6, 4], [4, 2], [8, 8], [9, 9], [6, 9], [5, 5], [3, 1.5]]), a = ab[0], b = ab[1], c = num1(a * a / b), p, q, n;
          for (var g = 0; g < 100; g++) { p = r.int(-6, -2); q = r.int(2 * p - 9, 2 * p - 1); n = 2 * p - q; if (n >= 1 && n <= 9) break; }
          var p2 = P.nr(t('\\dfrac{(' + a.toFixed(1) + '\\times 10^{' + p + '})^{2}}{' + b.toFixed(1) + '\\times 10^{' + q + '}}=' + c.toFixed(1) + '\\times 10^{n}') + '. The value of ' + t('n') + ' is ________. (Record your answer as a three-digit number; for example, ' + t('12') + ' is recorded as ' + t('012') + '.)', n, function (v) {
            if (v === 2 * p + q) return { code: 'sign', hint: 'Dividing subtracts: ' + t((2 * p) + '-(' + q + ')') + '.' };
            if (v === p - q) return { code: 'no-double', hint: 'Square the power of ten too: ' + t('(10^{' + p + '})^{2}=10^{' + (2 * p) + '}') + '.' };
            return null; },
            t('(' + a.toFixed(1) + '\\times 10^{' + p + '})^{2}=' + num1(a * a) + '\\times 10^{' + (2 * p) + '}') + '<br>' + t('\\dfrac{' + num1(a * a) + '\\times 10^{' + (2 * p) + '}}{' + b.toFixed(1) + '\\times 10^{' + q + '}}=' + c.toFixed(1) + '\\times 10^{' + (2 * p) + '-(' + q + ')}=' + c.toFixed(1) + '\\times 10^{' + n + '}') + ', so ' + t('n=' + n) + '. Record ' + t('00' + n) + '.',
            ['Square the numerator (coefficient and power of ten), then divide.'], 'E23');
          p2.good = ['00' + n, '0' + n];
          return p2;
        } }] }
    ]
  });

  /* ---------- scientific-notation makers used above (hoisted) ---------- */
  function e11(r, w) {
    var giv, giT, res, resI, resE, op, sol;
    if (w === 'a') { var d = r.int(4, 9), k = r.int(3, 5); giv = d * Math.pow(10, -k); giT = decStr(d, -k); resI = d * d; resE = -2 * k; op = 'A square has side ' + t(giT) + ' m. Find its area (in m' + t('^{2}') + ').';
      sol = t(giT + '=' + d + '\\times 10^{-' + k + '}') + ' m. ' + t('A=(' + d + '\\times 10^{-' + k + '})^{2}=' + resI + '\\times 10^{' + resE + '}') + '.'; }
    if (w === 'b') { var d2 = r.int(3, 9), k2 = r.int(2, 3); giv = d2 * Math.pow(10, -k2); giT = decStr(d2, -k2); resI = d2 * d2 * d2; resE = -3 * k2; op = 'A cube has edge ' + t(giT) + ' m. Find its volume (in m' + t('^{3}') + ').';
      sol = t(giT + '=' + d2 + '\\times 10^{-' + k2 + '}') + ' m. ' + t('V=(' + d2 + '\\times 10^{-' + k2 + '})^{3}=' + resI + '\\times 10^{' + resE + '}') + '.'; }
    if (w === 'c') { var d3 = r.int(4, 9), k3 = r.int(3, 5); giv = d3 * Math.pow(10, k3); giT = F(giv); resI = d3 * d3; resE = 2 * k3; op = 'Square the number ' + t(giT) + '.';
      sol = t(giT + '=' + d3 + '\\times 10^{' + k3 + '}') + '. ' + t('(' + d3 + '\\times 10^{' + k3 + '})^{2}=' + resI + '\\times 10^{' + resE + '}') + '.'; }
    if (w === 'd') { var d4 = r.pick([4, 4, 2, 5, 8]), k4 = r.int(3, 5); giv = d4 * Math.pow(10, -k4); giT = decStr(d4, -k4); resI = 10 / d4; resE = k4 - 1; op = 'Find the reciprocal of ' + t(giT) + '.';
      sol = t(giT + '=' + d4 + '\\times 10^{-' + k4 + '}') + '. ' + t('(' + d4 + '\\times 10^{-' + k4 + '})^{-1}=\\frac{1}{' + d4 + '}\\times 10^{' + k4 + '}=' + num1(1 / d4) + '\\times 10^{' + k4 + '}') + '.'; }
    // exact result: integer mantissa × 10^e
    // reciprocal: 1000/d4 is an exact integer for d4 = 2, 4, 5, 8 (10/8 = 1.25 needs three digits, so don't round)
    var mInt, mE; if (w === 'd') { mInt = 1000 / d4; mE = resE - 2; } else { mInt = resI; mE = resE; }
    res = mInt * Math.pow(10, mE); var std = decStr(mInt, mE), sci = K.sciTex(res), gsci = K.sciTex(giv);
    return P.fields(op, [{ name: 'Given', label: 'Given quantity in scientific notation:', mode: 'math', keys: 'sci', wide: true }, { name: 'Result (sci.)', label: 'Result in scientific notation:', mode: 'math', keys: 'sci', wide: true }, { name: 'Result (std.)', label: 'Result in standard form:', wide: true }],
      [sciChk(giv), sciChk(res), stdChk(res)], [gsci, sci, std], t(gsci) + '; result ' + t(sci) + ' ' + t('=' + stdTex(mInt, mE)),
      sol + ' In proper scientific notation: ' + t(sci) + ' ' + t('=' + stdTex(mInt, mE)) + '.',
      ['Scientific notation: ' + t('a\\times 10^{n}') + ' with ' + t('1\\le a<10') + '.', 'Raise the coefficient and the power of 10 separately, then renormalize if the coefficient is 10 or more (or less than 1).'], 'E11' + w);
  }
  function e13(r, w) {
    var x, pr, sol;
    if (w === 'a') { var a = r.pick([1.5, 1.5, 1.2, 1.3, 2.5, 3.0, 1.1]), k = r.int(2, 6); x = a * a * Math.pow(10, -2 * k); pr = '(' + a.toFixed(1) + '\\times 10^{-' + k + '})^{2}';
      sol = t(pr + '=' + a.toFixed(1) + '^{2}\\times(10^{-' + k + '})^{2}=' + num1(a * a) + '\\times 10^{' + (-2 * k) + '}') + ' (' + t('1\\le ' + num1(a * a) + '<10') + ', so no renormalizing).'; }
    if (w === 'b') { var ab = r.pick([[6, 2], [6, 2], [4, 2], [8, 2], [9, 3], [5, 2], [3, 2]]), p = r.int(3, 8), q = r.int(-4, -2), co = ab[0] * ab[0] / (ab[1] * ab[1] * ab[1]), n = 2 * p - 3 * q; x = co * Math.pow(10, n);
      pr = '\\dfrac{(' + ab[0].toFixed(1) + '\\times 10^{' + p + '})^{2}}{(' + ab[1].toFixed(1) + '\\times 10^{' + q + '})^{3}}';
      sol = 'Top: ' + t(ab[0] * ab[0] + '\\times 10^{' + (2 * p) + '}') + '. Bottom: ' + t(Math.pow(ab[1], 3) + '\\times 10^{' + (3 * q) + '}') + '.<br>' + t('\\dfrac{' + ab[0] * ab[0] + '}{' + Math.pow(ab[1], 3) + '}\\times 10^{' + (2 * p) + '-(' + (3 * q) + ')}=' + num1(co) + '\\times 10^{' + n + '}') + '.'; }
    if (w === 'c' || w === 'e') { var sq = r.pick([[4.9, 7], [1.6, 4], [3.6, 6], [6.4, 8], [8.1, 9], [2.5, 5]]), e = r.pick([-9, -7, -7, -5, -3, 5, 7]); x = sq[1] * Math.pow(10, (e - 1) / 2); pr = '(' + sq[0].toFixed(1) + '\\times 10^{' + e + '})^{1/2}';
      sol = t(sq[0].toFixed(1) + '\\times 10^{' + e + '}=' + (sq[1] * sq[1]) + '\\times 10^{' + (e - 1) + '}') + '.<br>' + t(sq[1] * sq[1] + '^{1/2}\\times(10^{' + (e - 1) + '})^{1/2}=' + sq[1] + '\\times 10^{' + ((e - 1) / 2) + '}') + '.'; }
    if (w === 'd') { var j = r.pick([-3, -3, -4, -2, -1, 2, 3]); x = 2 * Math.pow(10, j); pr = '(8.0\\times 10^{' + (3 * j) + '})^{1/3}';
      sol = 'The exponent ' + t(3 * j) + ' is already divisible by ' + t('3') + ': ' + t('8.0^{1/3}\\times(10^{' + (3 * j) + '})^{1/3}=2\\times 10^{' + j + '}') + '.'; }
    if (w === 'f') { var cu = r.pick([[2.7, 3, 1], [2.7, 3, 1], [6.4, 4, 1], [1.25, 5, 2], [3.43, 7, 2], [2.16, 6, 2]]), ee; do { ee = r.pick([10, 7, 4, -2, -5, 8, 5, -1, -4]); } while (((ee - cu[2]) % 3 + 3) % 3 !== 0);
      x = cu[1] * Math.pow(10, (ee - cu[2]) / 3); pr = '(' + cu[0] + '\\times 10^{' + ee + '})^{1/3}'; var big = Math.round(cu[0] * Math.pow(10, cu[2]));
      sol = t(cu[0] + '\\times 10^{' + ee + '}=' + big + '\\times 10^{' + (ee - cu[2]) + '}') + '.<br>' + t(big + '^{1/3}\\times(10^{' + (ee - cu[2]) + '})^{1/3}=' + cu[1] + '\\times 10^{' + ((ee - cu[2]) / 3) + '}') + '.'; }
    return sciPart(t(pr), x, {}, sol, ['Raise (or root) the coefficient and the power of 10 separately.', 'For a root, make the exponent of 10 divisible by the index first.'], 'E13' + w + ' ' + pr);
  }
})(window);
