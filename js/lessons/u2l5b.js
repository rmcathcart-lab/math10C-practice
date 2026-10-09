/* Math 10C · Unit 2 · Lesson 5B — Simplifying with Rational Exponents (AN3)
 * Assignment questions 1–11 (u2_L05B.tex, Parts A–C) and the exponent-law items of the Lesson 5 Extra Practice
 * (u2_EP05.tex: Q15–18, Q21(a)–(b), Q23). Evaluating, converting and application items of EP05 belong to Lesson 5A.
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  var CODES = {
    'exp-decimal': 'Wrote an exponent as a decimal', 'exp-lowest': 'Exponent fraction not in lowest terms', 'exp-simplify': 'Exponent not worked out',
    'radical-reduce': 'Radical index and exponent share a factor', 'nested-root': 'Left a root of a root', 'combine-root': 'Same base inside and outside the radical',
    'index-power': 'Swapped the index and the power', 'x-one': 'Forgot the factor x = x¹', 'one-num': 'Added 1 to the numerator only',
    'law-added': 'Added exponents where the law multiplies or subtracts', 'law-divided': 'Divided the exponents instead of subtracting', mult: 'Multiplied exponents instead of adding',
    'add-den': 'Added numerators and denominators of the exponents', 'missed-factor': 'Didn’t apply the power to every factor', backwards: 'Subtracted the exponents in the wrong order',
    'neg-one': 'Mishandled the exponent −1', 'no-flip': 'Didn’t flip for the negative exponent', 'add-index': 'Added the indices of a root of a root',
    recip: 'Missed the reciprocal (negative exponent)', 'coef-root': 'Didn’t take the root of the coefficient', 'coef-raise': 'Didn’t raise the coefficient to the power',
    'coef-recip': 'Coefficient upside down (negative exponent)', 'coef-times': 'Multiplied the coefficient by the exponent', 'coef-added': 'Added the coefficients',
    'one-root': 'Took only one of the two roots', 'skip-root': 'Skipped the root inside the bracket', 'minus-outside': 'Put the minus sign inside the base',
    'neg-value': 'Made the value negative for a negative exponent', 'mult-index': 'Multiplied the index into the exponent', malik: 'Repeated Malik’s error',
    'repeat-error': 'Repeated the error in the question', 'inner-root': 'Didn’t apply the outer root to everything inside', 'nr-no-square': 'Forgot the final square',
    'nr-round-early': 'Rounded before the last step', 'bases-mult': 'Multiplied the bases', 'missed-power': 'Forgot the outside exponent', 'only-one-root': 'Took only one root',
    'mc-said-equiv': 'Picked an equivalent expression', 'mc-said-all': 'Said all are equivalent'
  };
  HW.addCodes(Object.keys(CODES).reduce(function (o, k) { if (!(HW.CODES && HW.CODES[k])) o[k] = CODES[k]; return o; }, {}));   // don’t relabel other lessons’ codes

  /* ---------- fractions and LaTeX ---------- */
  function R(x) { return typeof x === 'number' ? [x, 1] : x; }
  function nrm(p, q) { return ex.norm(p, q == null ? 1 : q); }
  function add(a, b) { a = R(a); b = R(b); return nrm(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function sub(a, b) { b = R(b); return add(a, [-b[0], b[1]]); }
  function mul(a, b) { a = R(a); b = R(b); return nrm(a[0] * b[0], a[1] * b[1]); }
  function neg(a) { a = R(a); return [-a[0], a[1]]; }
  function inv(a) { a = R(a); return nrm(a[1], a[0]); }
  function eqR(a, b) { a = R(a); b = R(b); return a[0] * b[1] === b[0] * a[1]; }
  function gcd(a, b) { return ex.gcd(a, b); }
  function cop(a, b) { return gcd(a, b) === 1; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function eT(e) { e = R(e); return e[1] === 1 ? String(e[0]) : (e[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(e[0]) + '}{' + e[1] + '}'; }
  function pT(e) { e = R(e); return e[0] < 0 ? '\\left(' + eT(e) + '\\right)' : eT(e); }           // exponent in a product
  function pw(v, e) { e = R(e); if (e[0] === 0) return ''; if (e[0] === 1 && e[1] === 1) return v; return v + '^{' + eT(e) + '}'; }
  function rootT(n, inner) { return n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}'; }
  function cT(c) { c = R(c); return c[1] === 1 ? String(c[0]) : (c[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  function cK(c) { c = R(c); return c[1] === 1 && Math.abs(c[0]) === 1 ? (c[0] < 0 ? '-' : '') : cT(c); }   // coefficient in front of variables
  /* positive-exponent form: coef [p,q], fs [[base, [p,q]]] */
  function ptex(coef, fs) {
    coef = R(coef);
    var num = '', den = '', s = coef[0] < 0 ? '-' : '', cp = Math.abs(coef[0]), cq = coef[1];
    fs.forEach(function (f) { var e = R(f[1]); if (e[0] > 0) num += pw(f[0], e); else if (e[0] < 0) den += pw(f[0], neg(e)); });
    var N = (cp === 1 && num ? '' : String(cp)) + num, D = (cq === 1 ? '' : String(cq)) + den;
    return s + (D ? '\\frac{' + N + '}{' + D + '}' : N);
  }
  /* any-sign form (for working lines) */
  function rtex(coef, fs) {
    coef = R(coef); var vs = fs.map(function (f) { return pw(f[0], f[1]); }).join('');
    var c = coef[1] === 1 ? (vs && Math.abs(coef[0]) === 1 ? (coef[0] < 0 ? '-' : '') : String(coef[0])) : cT(coef);
    return c + vs;
  }
  function radSide(list) {
    var ints = '', g = {}, order = [];
    list.forEach(function (f) { var e = R(f[1]); if (e[1] === 1) ints += pw(f[0], e); else { if (g[e[1]] == null) { g[e[1]] = ''; order.push(e[1]); } g[e[1]] += pw(f[0], [e[0], 1]); } });
    return ints + order.map(function (q) { return rootT(q, g[q]); }).join('');
  }
  /* radical form of a product of powers */
  function radT(coef, fs) {
    coef = R(coef);
    var num = fs.filter(function (f) { return R(f[1])[0] > 0; }), den = fs.filter(function (f) { return R(f[1])[0] < 0; }).map(function (f) { return [f[0], neg(f[1])]; });
    var s = coef[0] < 0 ? '-' : '', cp = Math.abs(coef[0]), N = radSide(num), D = radSide(den);
    N = (cp === 1 && N ? '' : String(cp)) + N; D = (coef[1] === 1 ? '' : String(coef[1])) + D;
    return s + (D ? '\\frac{' + N + '}{' + D + '}' : N);
  }
  function pickWhere(gen, test) { for (var i = 0; i < 800; i++) { var v = gen(); if (test(v)) return v; } throw new Error('generator found no values'); }
  function rootName(n) { return K.rootName(n); }

  /* ---------- checking helpers ---------- */
  function walk(x, fn) { if (!x || typeof x !== 'object') return; fn(x); ['a', 'b', 'n'].forEach(function (k) { if (x[k] && typeof x[k] === 'object') walk(x[k], fn); }); }
  function strip(x) { while (x && x.t === 'paren') x = x.a; return x; }
  function varsOf(ast) { return Object.keys(ex.shape(ast).vars); }
  function union(a, b) { return a.concat(b.filter(function (v) { return a.indexOf(v) < 0; })); }
  function same(a, b, vs) { return vs.length ? ex.equiv(a, b, vs, 6) : ex.eq(ex.value(a), ex.value(b)); }
  /* an exponent written as a single integer or a fraction in lowest terms */
  function expIssue(e) {
    e = strip(e); if (e.t === 'neg') e = strip(e.a);
    if (e.t === 'num') return e.dec ? form('exp-decimal', 'Right value — write the exponent as a fraction (for example ' + t('x^{\\frac{3}{2}}') + ' rather than ' + t('x^{1.5}') + ').') : null;
    if (e.t === 'var') return null;
    if (e.t === 'div') {
      var n = strip(e.a), d = strip(e.b); if (n.t === 'neg') n = strip(n.a); if (d.t === 'neg') d = strip(d.a);
      if (n.t === 'num' && d.t === 'num' && !n.dec && !d.dec) {
        if (d.v === 1 || gcd(n.v, d.v) > 1) return form('exp-lowest', 'Right value — now reduce the exponent ' + t('\\frac{' + n.v + '}{' + d.v + '}') + ' to lowest terms.');
        return null;
      }
    }
    return form('exp-simplify', 'Right value — now work each exponent out to a single number or fraction.');
  }
  var POS = 'Right value — now write it with <b>positive exponents</b> only (a power with a negative exponent moves to the other side of the fraction bar).';
  function fmtIssue(ast, opt) {
    opt = opt || {}; var res = null, rad = opt.form === 'radical';
    walk(ast, function (x) {
      if (res) return;
      if (x.t === 'pow') { res = expIssue(x.b); if (!res && rad) { var e = ex.rat(x.b); if (e && e[0] < 0) res = form('neg-exp', POS); } }
      else if (x.t === 'root' && rad) {
        var nested = false; walk(x.a, function (y) { if (y.t === 'root') nested = true; });
        if (nested) { res = form('nested-root', 'Right value — now write it with a <b>single</b> radical: a root of a root is one root (multiply the indices).'); return; }
        var n = ex.rat(x.n), an = ex.analyze(x.a); if (!n || n[1] !== 1 || !an.coef || an.flags.complex || an.flags.nested) return;
        var vs = Object.keys(an.vars), g = n[0];
        if (!vs.length || vs.some(function (v) { return an.vars[v][1] !== 1; })) return;
        vs.forEach(function (v) { g = gcd(g, an.vars[v][0]); });
        if (g > 1 && Math.abs(an.coef[0]) === 1 && an.coef[1] === 1) res = form('radical-reduce', 'Right value — but the index and the exponent' + (vs.length > 1 ? 's' : '') + ' share a factor of ' + t(g) + ', so the radical simplifies (for example ' + t('\\sqrt[6]{x^{4}}=\\sqrt[3]{x^{2}}') + ').');
      }
    });
    if (res || !rad) return res;
    var outside = ex.analyze(ast).vars, roots = [];
    walk(ast, function (x) { if (x.t === 'root') roots.push(x); });
    for (var i = 0; i < roots.length; i++) {
      var n2 = ex.rat(roots[i].n), a2 = ex.analyze(roots[i].a); if (!n2 || n2[1] !== 1) continue;
      for (var v in a2.vars) if (outside[v] && outside[v][0] && a2.vars[v][1] === 1 && a2.vars[v][0] >= n2[0]) return form('combine-root', 'Right value — but ' + t(v) + ' is both outside and inside the radical, and ' + t(pw(v, a2.vars[v])) + ' under the ' + rootName(n2[0]) + ' root can still be simplified. Write it as one radical (or take out only what you can).');
    }
    if (opt.entire && roots.length && Object.keys(outside).some(function (v) { return outside[v][0] !== 0; })) return form('not-entire', 'Right value — now write it as an <b>entire</b> radical: everything under one radical sign, in the form ' + t('\\sqrt[n]{a^{m}}') + '.');
    return null;
  }
  /* K.expo plus: exponents in lowest terms, radical form simplified */
  function EX(target, opt) {
    opt = opt || {}; var c = K.expo(target, opt);
    return function (resp) { var r = c(resp); if (r.v !== 'correct') return r; var p = ex.parse(resp); return (p.ok && fmtIssue(p.ast, opt)) || r; };
  }
  /* diagnoses by equivalence with known wrong answers: list [[tex, code, hint]] (entries equal to target are dropped) */
  function known(list, target) {
    var tp = target ? ex.parse(target).ast : null, tv = tp ? varsOf(tp) : [], L = [];
    list.forEach(function (k) {
      if (!k) return; var p = ex.parse(k[0]); if (!p.ok) throw new Error('bad known tex ' + k[0]);
      var vs = union(varsOf(p.ast), tv); if (tp && same(p.ast, tp, vs)) return;
      if (L.some(function (y) { return same(p.ast, y.ast, union(vs, y.vars)); })) return;
      L.push({ tex: k[0], ast: p.ast, vars: vs, code: k[1], hint: k[2] });
    });
    var f = function (an, ast) { var sv = varsOf(ast); for (var i = 0; i < L.length; i++) if (same(ast, L[i].ast, union(L[i].vars, sv))) return { code: L[i].code, hint: L[i].hint }; return null; };
    f.texs = L.map(function (x) { return x.tex; });
    return f;
  }
  /* one exponent-law answer box */
  function XP(prompt, target, opt, sol, hints, text, kn, extra) {
    opt = opt || {}; if (kn) opt.diag = kn;
    var p = P.expo(prompt, target, opt, sol, hints, text); p.check = EX(target, opt);
    p.bad = kn ? kn.texs.slice() : [];
    if (extra && extra.good) p.good = extra.good;
    return p;
  }
  /* power box + radical box */
  function twoForms(prompt, powT, rT, vars, o) {
    var pd = o.pd || known([], powT), rd = o.rd || known([], rT);
    var fields = [{ name: 'Power', label: 'Power', mode: 'math', keys: 'expo', vars: vars }, { name: 'Radical form', label: (o.entire ? 'Entire radical' : 'Radical form'), mode: 'math', keys: 'expo', vars: vars }];
    var p = P.fields(prompt, fields, [EX(powT, { form: 'power', diag: pd }), EX(rT, { form: 'radical', diag: rd, entire: o.entire })], [powT, rT],
      'Power: ' + t(powT) + '<br>' + (o.entire ? 'Entire radical' : 'Radical form') + ': ' + t(rT), o.sol, o.hints || HINT_TWO, o.text);
    p.bad = pd.texs.map(function (x) { return [x, rT]; }).concat(rd.texs.map(function (x) { return [powT, x]; }));
    if (o.good) p.good = o.good;
    return p;
  }
  var IDX = 'The <b>denominator</b> of the exponent is the index of the root and the numerator is the power: ' + t('x^{\\frac{m}{n}}=\\sqrt[n]{x^{m}}') + '.';
  var HINT_TWO = ['Use the exponent law first, working with the fractions exactly. Then convert: in ' + t('x^{\\frac{m}{n}}') + ' the denominator ' + t('n') + ' is the index and ' + t('m') + ' is the power.',
    'If the exponent comes out negative, write the power in the denominator: ' + t('x^{-\\frac{m}{n}}=\\frac{1}{x^{\\frac{m}{n}}}') + '.'];
  var LAWS = 'Product law: add the exponents. Quotient law: subtract. Power of a power: multiply.';
  function radSol(powT, rT) { return 'Radical form — the denominator of the exponent is the index: ' + t(powT + '=' + rT) + '.'; }
  function swapRad(v, e) { e = R(e); return [pw(v, nrm(e[1], e[0])), 'index-power', IDX]; }   // radical box: index and power swapped

  /* ================= Q1 — one law, then radical form ================= */
  function q1a(r) {
    var b = r.pick([3, 4, 5]), a = pickWhere(function () { return r.int(b + 1, 3 * b); }, function (a) { return cop(a, b) && a + b <= 18; });   // small radicands (see note on ex.value)
    var e = [a + b, b], powT = pw('x', e), rT = rootT(b, pw('x', [a + b, 1]));
    return twoForms(t(pw('x', [a, b]) + '\\times x'), powT, rT, ['x'], {
      pd: known([[pw('x', [a, b]), 'x-one', 'Don’t lose the second factor: ' + t('x=x^{1}') + ', so the exponents add to ' + t(eT([a, b]) + '+1') + '.'],
        [pw('x', nrm(a + 1, b)), 'one-num', 'To add ' + t('1') + ' to a fraction, write it as ' + t('\\frac{' + b + '}{' + b + '}') + ': ' + t(eT([a, b]) + '+\\frac{' + b + '}{' + b + '}=' + eT(e)) + '.']], powT),
      rd: known([swapRad('x', e)], rT),
      sol: 'Product law (same base, add the exponents; ' + t('x=x^{1}') + '):<br>' + t(pw('x', [a, b]) + '\\times x^{1}=x^{' + eT([a, b]) + '+\\frac{' + b + '}{' + b + '}}=' + powT) + '.<br>' + radSol(powT, rT),
      good: [['x^(' + (a + b) + '/' + b + ')', '\\left(' + rootT(b, 'x') + '\\right)^{' + (a + b) + '}']], text: 'x^(' + a + '/' + b + ')·x' });
  }
  function q1b(r, after) { // y^{a/b} ÷ y^{c/b}; after: result negative (Q1f)
    var g = pickWhere(function () { var b = r.pick([6, 8, 9, 10, 12]); return [r.int(1, 2 * b), r.int(1, 2 * b), b]; },
      function (x) { var a = x[0], c = x[1], b = x[2], d = after ? c - a : a - c; return cop(a, b) && cop(c, b) && d > 0 && d < b && gcd(d, b) > 1; });
    var a = g[0], c = g[1], b = g[2], e = nrm(a - c, b), powT = ptex(1, [['y', e]]), rT = radT(1, [['y', e]]), ae = R(e), pos = [Math.abs(ae[0]), ae[1]];
    var pd = known([[pw('y', nrm(a + c, b)), 'law-added', 'Dividing powers of the same base: <b>subtract</b> the exponents (quotient law).'],
      [pw('y', nrm(a, c)), 'law-divided', 'Subtract the exponents — don’t divide them.'],
      after ? [pw('y', pos), 'backwards', 'Subtract in order — the first exponent minus the second: ' + t(eT([a, b]) + '-' + eT([c, b]) + '=' + eT([a - c, b])) + '. The result is negative, so the power goes in the denominator.'] : null], powT);
    var sol = 'Quotient law (same base, subtract the exponents):<br>' + t(pw('y', [a, b]) + '\\div ' + pw('y', [c, b]) + '=y^{' + eT([a, b]) + '-' + eT([c, b]) + '}=y^{' + eT([a - c, b]) + '}=' + pw('y', e) + (after ? '=' + powT : '')) + '.<br>' + radSol(powT, rT);
    return twoForms(t(pw('y', [a, b]) + '\\div ' + pw('y', [c, b])), powT, rT, ['y'], { pd: pd, rd: known([], rT), sol: sol, text: 'y^(' + a + '/' + b + ')÷y^(' + c + '/' + b + ')' });
  }
  function q1c(r) { // (a^{p/q})^{q/s}
    var g = pickWhere(function () { var q = r.pick([3, 5, 7]); return [r.int(2, q - 1), q, r.pick([2, 3, 4, 5])]; }, function (x) { return cop(x[0], x[1]) && x[2] !== x[1] && cop(x[2], x[0]); });
    var p = g[0], q = g[1], s = g[2], e = [p, s], powT = pw('a', e), rT = rootT(s, pw('a', [p, 1]));
    return twoForms(t('\\left(' + pw('a', [p, q]) + '\\right)^{' + eT([q, s]) + '}'), powT, rT, ['a'], {
      pd: known([[pw('a', add([p, q], [q, s])), 'law-added', 'Power of a power: <b>multiply</b> the exponents.']], powT), rd: known([swapRad('a', e)], rT),
      sol: 'Power of a power (multiply the exponents):<br>' + t('a^{' + eT([p, q]) + '\\cdot ' + eT([q, s]) + '}=a^{\\frac{' + (p * q) + '}{' + (q * s) + '}}=' + powT) + ' (the ' + t(q) + 's cancel).<br>' + radSol(powT, rT),
      text: '(a^(' + p + '/' + q + '))^(' + q + '/' + s + ')' });
  }
  function q1d(r) { // (m^k n)^{c/d}
    var cd = r.pick([[2, 3], [3, 4], [1, 3], [3, 2], [2, 5], [4, 3]]), c = cd[0], d = cd[1], k = pickWhere(function () { return r.pick([2, 4, 5, 7]); }, function (k) { return k % d !== 0 && k * c + c <= 18; });
    var fs = [['m', nrm(k * c, d)], ['n', [c, d]]], powT = ptex(1, fs), rT = rootT(d, pw('m', [k * c, 1]) + pw('n', [c, 1]));
    return twoForms(t('\\left(m^{' + k + '}n\\right)^{' + eT([c, d]) + '}'), powT, rT, ['m', 'n'], {
      pd: known([[ptex(1, [['m', nrm(k * c, d)], ['n', 1]]), 'missed-factor', 'The outside exponent applies to <b>every</b> factor in the bracket — ' + t('n') + ' too.'],
        [ptex(1, [['m', add(k, [c, d])], ['n', [c, d]]]), 'law-added', 'Power of a power: <b>multiply</b> the exponents, ' + t(k + '\\times ' + eT([c, d])) + '.']], powT),
      sol: 'Power of a product (every factor gets the exponent):<br>' + t('\\left(m^{' + k + '}n\\right)^{' + eT([c, d]) + '}=m^{' + k + '\\cdot ' + eT([c, d]) + '}n^{' + eT([c, d]) + '}=' + powT) + '.<br>Radical form — both have denominator ' + t(d) + ', so one ' + rootName(d) + ' root: ' + t(powT + '=' + rT) + '.',
      text: '(m^' + k + ' n)^(' + c + '/' + d + ')' });
  }
  function q1e(r) { // x^{a/b} × x^{-1}
    var b = r.pick([3, 4, 5, 6]), a = pickWhere(function () { return r.int(1, b - 1); }, function (a) { return cop(a, b); }), e = [a - b, b];
    var powT = ptex(1, [['x', e]]), rT = radT(1, [['x', e]]);
    return twoForms(t(pw('x', [a, b]) + '\\times x^{-1}'), powT, rT, ['x'], {
      pd: known([[pw('x', [a + b, b]), 'neg-one', 'Adding ' + t('-1') + ' means subtracting ' + t('1=\\frac{' + b + '}{' + b + '}') + ': ' + t(eT([a, b]) + '-\\frac{' + b + '}{' + b + '}') + '.'],
        [ptex(1, [['x', [-a, b]]]), 'mult', 'Multiplying powers of the same base: <b>add</b> the exponents, ' + t(eT([a, b]) + '+(-1)') + '.']], powT),
      rd: known([[ptex(1, [['x', [-b, b - a]]]), 'index-power', IDX]], rT),
      sol: 'Product law: ' + t(pw('x', [a, b]) + '\\times x^{-1}=x^{' + eT([a, b]) + '-\\frac{' + b + '}{' + b + '}}=' + pw('x', e)) + '.<br>Positive exponent: ' + t(pw('x', e) + '=' + powT) + '.<br>' + radSol(powT, rT),
      text: 'x^(' + a + '/' + b + ')·x^-1' });
  }
  function q1g(r) { // (p/q^k)^{1/d}
    var d = r.pick([2, 3]), k = pickWhere(function () { return r.int(2, 5); }, function (k) { return cop(k, d); });
    var fs = [['p', [1, d]], ['q', [-k, d]]], powT = ptex(1, fs), rT = radT(1, fs);
    return twoForms(t('\\left(\\dfrac{p}{q^{' + k + '}}\\right)^{' + eT([1, d]) + '}'), powT, rT, ['p', 'q'], {
      pd: known([[ptex(1, [['p', 1], ['q', [-k, d]]]), 'missed-factor', 'The exponent applies to the numerator <b>and</b> the denominator: ' + t('\\left(\\frac{x}{y}\\right)^{m}=\\frac{x^{m}}{y^{m}}') + '.'],
        [ptex(1, [['p', [1, d]], ['q', neg(add(k, [1, d]))]]), 'law-added', 'Power of a power: <b>multiply</b> the exponents, ' + t(k + '\\times ' + eT([1, d])) + '.']], powT),
      sol: 'Power of a quotient (top and bottom both get the exponent):<br>' + t('\\left(\\frac{p}{q^{' + k + '}}\\right)^{' + eT([1, d]) + '}=\\frac{p^{' + eT([1, d]) + '}}{q^{' + k + '\\cdot ' + eT([1, d]) + '}}=' + powT) + '.<br>' + radSol(powT, rT),
      text: '(p/q^' + k + ')^(1/' + d + ')' });
  }
  function q1h(r) { // (p^d/q)^{-c/d}
    var d = r.pick([2, 3]), c = r.pick(d === 2 ? [3, 5, 7] : [2, 4, 5]);
    var fs = [['q', [c, d]], ['p', [-c, 1]]], powT = ptex(1, fs), rT = radT(1, fs);
    return twoForms(t('\\left(\\dfrac{p^{' + d + '}}{q}\\right)^{-' + eT([c, d]) + '}'), powT, rT, ['p', 'q'], {
      pd: known([[ptex(1, [['p', [c, 1]], ['q', [-c, d]]]), 'no-flip', 'The exponent is <b>negative</b>: flip the fraction first, then apply the positive exponent ' + t(eT([c, d])) + '.'],
        [ptex(1, [['q', [c, d]], ['p', neg(add(d, [c, d]))]]), 'law-added', 'Power of a power: <b>multiply</b> the exponents, ' + t(d + '\\times ' + eT([c, d])) + '.']], powT),
      sol: 'Flip first (negative exponent), then give every factor the exponent:<br>' + t('\\left(\\frac{p^{' + d + '}}{q}\\right)^{-' + eT([c, d]) + '}=\\left(\\frac{q}{p^{' + d + '}}\\right)^{' + eT([c, d]) + '}=\\frac{q^{' + eT([c, d]) + '}}{p^{' + d + '\\cdot ' + eT([c, d]) + '}}=' + powT) + '.<br>' + radSol(powT, rT),
      text: '(p^' + d + '/q)^(-' + c + '/' + d + ')' });
  }

  /* ================= Q2 / e18c — a root of a root as one power, then evaluate ================= */
  function singlePow(N, e, addE) {
    var V = Math.pow(N, R(e)[0] / R(e)[1]);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var top = strip(a.ast), isP = top.t === 'pow', b = isP ? ex.rat(top.a) : null, ee = isP ? ex.rat(top.b) : null, baseN = !!(b && b[1] === 1 && b[0] === N);
      if (ex.eq(a.val, V)) {
        if (baseN && ee) return expIssue(top.b) || ok();
        if (top.t === 'div') return form('single-power', 'Right value — now write it as <b>one</b> power of ' + t(F(N)) + ': a root in the denominator becomes a <b>negative</b> exponent, ' + t('\\frac{1}{\\sqrt[n]{a}}=a^{-\\frac{1}{n}}') + '.');
        return form('single-power', 'Right value — but first write it as a <b>single power</b> of ' + t(F(N)) + ' (one base, one exponent), as the question asks. Then evaluate in the next box.');
      }
      if (baseN && ee) {
        if (addE && eqR(ee, addE)) return wrong('add-index', 'A root of a root <b>multiplies</b> the indices — it doesn’t add them.');
        if (eqR(ee, neg(e))) return wrong('recip', R(e)[0] < 0 ? 'The root is in the <b>denominator</b>, so the exponent is negative: ' + t('\\frac{1}{\\sqrt[n]{a}}=a^{-\\frac{1}{n}}') + '.' : 'Check the sign of the exponent.');
        return wrong('exp', 'Check the exponent: each ' + t('n') + 'th root is the power ' + t('\\frac{1}{n}') + ', and a root of a root multiplies them.');
      }
      return wrong('value', null);
    };
  }
  function rootsPart(prompt, N, e, val, addE, sol, text) { // val: integer or [1,k]
    var fields = [{ name: 'Single power', label: 'Single power', mode: 'math', keys: 'expo', vars: [] }, { name: 'Value', label: 'Value', mode: 'math', keys: 'expo', vars: [] }];
    var vk = typeof val === 'number', key = [String(N) + '^{' + eT(e) + '}', vk ? String(val) : '\\frac{1}{' + val[1] + '}'];
    var vchk = vk ? K.value(val, { only: 'integer', diag: function (v) { if (ex.eq(v, Math.sqrt(N)) && Math.sqrt(N) !== val) return { code: 'only-one-root', hint: 'That’s only one square root — there are two roots to take.' }; return null; } }) : K.fraction(val);
    var p = P.fields(prompt, fields, [singlePow(N, e, addE), vchk], key, 'Single power: ' + t(F(N) + '^{' + eT(e) + '}') + '<br>Value: ' + t(vk ? val : '\\frac{1}{' + val[1] + '}'), sol,
      ['Write each root as a power ' + t('\\frac{1}{n}') + '; a root of a root multiplies these powers. A root in a denominator gives a negative exponent.', 'To evaluate, find the number that, raised to the index, gives ' + t(F(N)) + '.'], text);
    p.bad = [[String(N) + '^{' + eT(neg(e)) + '}', key[1]], [key[0], vk ? String(val + 1) : '\\frac{1}{' + (val[1] + 1) + '}']];
    if (addE) p.bad.push([String(N) + '^{' + eT(addE) + '}', key[1]]);
    return p;
  }

  /* ================= Q4(e) — a binomial base ================= */
  function binomCheck(a, b, m, n) {
    var B = a + 'w-' + b, T = '\\frac{1}{(' + B + ')^{' + eT([m, n]) + '}}', tp = ex.parse(T).ast;
    var kd = known([['(' + B + ')^{' + eT([m, n]) + '}', 'recip', 'A negative exponent means <b>reciprocal</b>: ' + t('u^{-k}=\\frac{1}{u^{k}}') + '. Keep the exponent positive and put the power in the denominator.'],
      ['\\frac{1}{(' + B + ')^{' + eT([n, m]) + '}}', 'index-power', IDX],
      ['\\frac{1}{(' + B + ')^{' + (m * n) + '}}', 'mult-index', 'The ' + rootName(n) + ' root is the power ' + t('\\frac{1}{' + n + '}') + ', so the index goes in the <b>denominator</b> of the exponent: ' + t('\\left(\\sqrt[' + n + ']{u}\\right)^{-' + m + '}=u^{-\\frac{' + m + '}{' + n + '}}') + '.'],
      ['-(' + B + ')^{' + eT([m, n]) + '}', 'neg-value', 'A negative exponent doesn’t make the answer negative — it means reciprocal.']], T);
    var chk = function (resp) {
      var A = K.read(resp); if (A.res) return A.res;
      if (ex.equiv(A.ast, tp, ['w'], 6)) {
        var negE = false, roots = false; walk(A.ast, function (x) { if (x.t === 'root') roots = true; if (x.t === 'pow') { var e = ex.rat(x.b); if (e && e[0] < 0) negE = true; } });
        if (negE) return form('neg-exp', POS);
        if (roots) return form('not-power', 'Right value — now write it with a rational exponent instead of a radical.');
        return fmtIssue(A.ast, {}) || ok();
      }
      var h = kd(null, A.ast); if (h) return wrong(h.code, h.hint);
      return wrong('value', null);
    };
    return { check: chk, T: T, bad: kd.texs };
  }
  /* Q4(g)(h): the minus sign outside the radical vs a negative base (odd index, odd power: equal values) */
  function negZPow(ast) { var x = strip(ast); if (x.t !== 'pow') return null; var b = strip(x.a); return b.t === 'neg' && strip(b.a).t === 'var' ? x : null; }

  /* ================= Q7 — matching ================= */
  function q7(r) {
    var pr = r.pick([[5, 2], [3, 2], [4, 3], [5, 3], [7, 2], [5, 4]]), U = [pr[0], pr[1]], V = [pr[1], pr[0]];
    function rad(a, b, e) { return rootT(e[1], '\\dfrac{' + a + '^{' + e[0] + '}}{' + b + '^{' + e[0] + '}}'); }
    function base(a, b, e) { return '\\left(\\dfrac{' + a + '}{' + b + '}\\right)^{' + eT(e) + '}'; }
    var TYPES = { QPV: rad('q', 'p', V), PQV: rad('p', 'q', V), nPQV: '-' + rad('p', 'q', V), PQU: rad('p', 'q', U), QPU: rad('q', 'p', U), nQPU: '-' + rad('q', 'p', U) };
    var ROWS = [{ id: 'r1', tex: base('p', 'q', U), ans: 'PQU' }, { id: 'r2', tex: base('p', 'q', V), ans: 'PQV' }, { id: 'r3', tex: base('q', 'p', neg(U)), ans: 'PQU' },
      { id: 'r4', tex: base('p', 'q', neg(V)), ans: 'QPV' }, { id: 'r5', tex: base('q', 'p', V), ans: 'QPV' }, { id: 'r6', tex: base('p', 'q', neg(U)), ans: 'QPU' }];
    var keys = r.shuffle(Object.keys(TYPES)), L = 'ABCDEF', letterOf = {}, typeOf = {};
    keys.forEach(function (k, i) { letterOf[k] = L[i]; typeOf[L[i]] = k; });
    var rows = r.shuffle(ROWS), want = {}, byId = {};
    rows.forEach(function (x, i) { x.lab = '(' + 'abcdef'[i] + ')'; want[x.id] = letterOf[x.ans]; byId[x.id] = x; });
    var col2 = keys.map(function (k) { return '<span style="display:inline-block;margin:.25em 1.1em .25em 0"><b>' + letterOf[k] + '.</b> ' + t(TYPES[k]) + '</span>'; }).join('');
    var prompt = 'Match each item in Column 1 with the equivalent item in Column 2. Each item in Column 2 may be used once, more than once, or not at all.<div style="margin:.4em 0"><b>Column 2:</b><br>' + col2 + '</div>';
    function why(rid, got) {
      var w = typeOf[want[rid]], g = typeOf[got]; if (!g) return null;
      var row = byId[rid];
      if (g.charAt(0) === 'n') return { code: 'neg-value', hint: 'Row ' + row.lab + ': a negative exponent means <b>reciprocal</b> — flip the base. It never makes the value negative.' };
      if (g.slice(-1) !== w.slice(-1)) return { code: 'index-power', hint: 'Row ' + row.lab + ': ' + IDX };
      return { code: 'no-flip', hint: 'Row ' + row.lab + ': check which way up the base is. A negative exponent flips the fraction: ' + t('\\left(\\frac{q}{p}\\right)^{-n}=\\left(\\frac{p}{q}\\right)^{n}') + '.' };
    }
    var sol = 'Flip for a negative exponent, then the denominator of the exponent is the index:<br>' + rows.map(function (x) {
      var w = x.ans, flipped = x.tex.indexOf('^{-') >= 0;
      return x.lab + ' ' + t(x.tex) + (flipped ? ' ' + t('=' + base(w.slice(0, 2) === 'PQ' ? 'p' : 'q', w.slice(0, 2) === 'PQ' ? 'q' : 'p', w.slice(-1) === 'U' ? U : V)) : '') + ' ' + t('=' + TYPES[w]) + ' → <b>' + letterOf[w] + '</b>';
    }).join('<br>') + '<br>The two negative radicals are never used: a negative exponent gives a reciprocal, not a negative.';
    var p = P.grid(prompt, rows.map(function (x) { return { id: x.id, html: x.lab + ' ' + t(x.tex) }; }), L.split('').map(function (c) { return { id: c, html: '<b>' + c + '</b>' }; }), want,
      { why: why, rowHead: 'Column 1', colHead: 'Column 2' }, sol, ['First get rid of any negative exponent by flipping the base. Then read the exponent: the denominator is the index, the numerator is the power.'], 'matching (p/q)^(' + U[0] + '/' + U[1] + ')');
    return p;
  }

  /* ================= Q6 — Malik's error ================= */
  function q6shared(r) {
    return pickWhere(function () { var q = r.pick([2, 3]); return { q: q, p: q === 2 ? 1 : r.pick([1, 2]), k: r.int(2, 6), s: q === 2 ? r.pick([1, 3]) : r.pick([1, 2]) }; },
      function (o) { var g = nrm(o.p * o.k + o.s, o.q), m = nrm(o.p + o.k * o.q + o.s, o.q); return g[1] > 1 && !eqR(g, m) && o.p * o.k + o.s < 4 * o.q + 3; });
  }
  function q6expr(o) { return '\\left(x^{' + eT([o.p, o.q]) + '}\\right)^{' + o.k + '}\\cdot x^{' + eT([o.s, o.q]) + '}'; }
  function q6stem(o) {
    var E = q6expr(o), l2 = nrm(o.p + o.k * o.q, o.q), l3 = nrm(o.p + o.k * o.q + o.s, o.q);
    return 'Malik simplified ' + t(E) + ' as shown.\\[\\begin{array}{lrl}\\text{Line 1:}&' + E + '&=x^{' + eT([o.p, o.q]) + '+' + o.k + '}\\cdot x^{' + eT([o.s, o.q]) + '}\\\\ \\text{Line 2:}&&=' + pw('x', l2) + '\\cdot x^{' + eT([o.s, o.q]) + '}\\\\ \\text{Line 3:}&&=' + pw('x', l3) + '\\end{array}\\]';
  }

  /* ================= Q11 ================= */
  function q11(r) {
    var g = pickWhere(function () { return [r.pick([3, 4, 5, 6]), r.pick([20, 30, 40, 50, 60, 70, 75, 80, 90]), r.pick([2, 3, 4])]; }, function (x) {
      var inner = x[0] * x[0] - Math.sqrt(x[1]) + x[2], v = inner * inner, fr = v - Math.floor(v);
      return inner > 2 && v < 9999 && Math.abs(fr - 0.5) > 0.08 && Math.round(v) !== Math.pow(x[0] * x[0] - Math.round(Math.sqrt(x[1])) + x[2], 2);
    });
    var c = g[0], y = g[1], f = g[2], X = c * c * c, Z = Math.pow(f, 4), sy = Math.sqrt(y), inner = c * c - sy + f, v = inner * inner, ans = Math.round(v);
    var prompt = 'Find the value, to the nearest whole number, of ' + t('\\left(x^{\\frac{2}{3}}-y^{\\frac{1}{2}}+z^{\\frac{1}{4}}\\right)^{2}') + ' when ' + t('x=' + X) + ', ' + t('y=' + y) + ', and ' + t('z=' + Z) + '.';
    var p = P.approx(prompt, v, 0, { nr: true, diag: function (u) {
      if (u === Math.round(inner)) return { code: 'nr-no-square', hint: 'You found the value inside the bracket — now square it.' };
      if (u === Math.pow(c * c - Math.round(sy) + f, 2)) return { code: 'nr-round-early', hint: 'Don’t round ' + t('\\sqrt{' + y + '}') + ' first — keep every digit until the very end.' };
      return null;
    } }, t('x^{\\frac{2}{3}}=\\left(\\sqrt[3]{' + X + '}\\right)^{2}=' + c + '^{2}=' + (c * c)) + '; ' + t('y^{\\frac{1}{2}}=\\sqrt{' + y + '}\\approx ' + sy.toFixed(7)) + '; ' + t('z^{\\frac{1}{4}}=\\sqrt[4]{' + Z + '}=' + f) + '.<br>' +
      t((c * c) + '-' + sy.toFixed(7) + '+' + f + '=' + inner.toFixed(7)) + ', and ' + t('(' + inner.toFixed(7) + ')^{2}\\approx ' + v.toFixed(4)) + '.<br>To the nearest whole number: <b>' + ans + '</b>.',
      ['Evaluate each power separately first: the denominator of each exponent is the index of the root.', 'Keep the decimal for ' + t('\\sqrt{' + y + '}') + ' in your calculator; square at the very end.'], 'NR (x^(2/3)-y^(1/2)+z^(1/4))^2, x=' + X);
    return p;
  }

  HW.defineLesson({
    id: 'u2l5b', unit: 2, num: '5B', title: 'Simplifying with Rational Exponents', outcome: 'AN3',
    blurb: 'The exponent laws with fractional exponents — single laws, roots of roots as single powers, the form ' + t('ax^{n}') + ', and multi-law chains with rational and negative exponents.',
    questions: [
      { num: '1', section: 'Part A — Simplifying and Converting', stem: 'Simplify each expression. Write your answer as a power with a positive exponent, and then in radical form.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { return q1a(r); } },
        { id: '1b', level: 'EMG', make: function (r) { return q1b(r, false); } },
        { id: '1c', level: 'BEG', make: function (r) { return q1c(r); } },
        { id: '1d', level: 'EMG', make: function (r) { return q1d(r); } },
        { id: '1e', level: 'EMG', make: function (r) { return q1e(r); } },
        { id: '1f', level: 'EMG', make: function (r) { return q1b(r, true); } },
        { id: '1g', level: 'EMG', make: function (r) { return q1g(r); } },
        { id: '1h', level: 'PRG', make: function (r) { return q1h(r); } }] },
      { num: '2', stem: 'Write each expression as a single power, then evaluate.', parts: [
        { id: '2a', level: 'EMG', make: function (r) {
          var o = r.pick([[2, 3], [3, 2]]), k = r.pick([2, 3, 4, 5]), n = o[0] * o[1], N = Math.pow(k, n);
          return rootsPart(t(rootT(o[0], rootT(o[1], F(N)))), N, [1, n], k, [1, o[0] + o[1]],
            'Indices multiply: ' + t(o[0] + '\\times ' + o[1] + '=' + n) + ', so ' + t(rootT(o[0], rootT(o[1], F(N))) + '=' + F(N) + '^{\\frac{1}{' + n + '}}') + '.<br>' + t(k + '^{' + n + '}=' + F(N)) + ', so it equals <b>' + k + '</b>.', 'root of root of ' + N);
        } },
        { id: '2b', level: 'BEG', make: function (r) {
          var o = r.pick([[4, 3], [4, 2], [4, 5], [3, 4], [3, 5], [5, 2], [5, 3]]), n = o[0], k = o[1], N = Math.pow(k, n);
          return rootsPart(t('\\dfrac{1}{' + rootT(n, F(N)) + '}'), N, [-1, n], [1, k], null,
            t(rootT(n, F(N)) + '=' + k) + ' since ' + t(k + '^{' + n + '}=' + F(N)) + '. A root in the denominator is a negative exponent:<br>' + t('\\frac{1}{' + rootT(n, F(N)) + '}=' + F(N) + '^{-\\frac{1}{' + n + '}}=\\frac{1}{' + k + '}') + '.', '1/root ' + n + ' of ' + N);
        } },
        { id: '2c', level: 'EMG', make: function (r) {
          var k = r.pick([4, 5, 6, 7, 8, 9]), N = Math.pow(k, 4);
          return rootsPart(t('\\sqrt{\\sqrt{' + F(N) + '}}'), N, [1, 4], k, null,
            'Indices multiply: ' + t('2\\times 2=4') + ', so ' + t('\\sqrt{\\sqrt{' + F(N) + '}}=' + F(N) + '^{\\frac{1}{4}}') + '.<br>' + t(k + '^{4}=' + F(N)) + ' (' + t('\\sqrt{' + F(N) + '}=' + (k * k)) + ', then ' + t('\\sqrt{' + (k * k) + '}=' + k) + '), so it equals <b>' + k + '</b>.', 'sqrt sqrt ' + N);
        } }] },
      { num: '3', stem: 'Write each expression in the form ' + t('ax^{n}') + ', where ' + t('a\\in I') + ' and ' + t('n\\in Q') + '.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var a = r.pick([2, 3, 4, 5]), e = r.pick([4, 5, 7, 8, 10, 11]), T = ptex(a, [['x', [e, 3]]]), A = a * a * a;
          return XP(t('\\sqrt[3]{' + A + 'x^{' + e + '}}'), T, { form: 'power' },
            'The cube root applies to both factors: ' + t('\\sqrt[3]{' + A + 'x^{' + e + '}}=' + A + '^{\\frac{1}{3}}x^{\\frac{' + e + '}{3}}=' + T) + ', since ' + t(a + '^{3}=' + A) + '.',
            ['Write the cube root as the power ' + t('\\frac{1}{3}') + ' and apply it to each factor.', 'For the number, find ' + t('\\sqrt[3]{' + A + '}') + '; for the variable, divide its exponent by ' + t('3') + '.'], 'cbrt(' + A + 'x^' + e + ')',
            known([[ptex(A, [['x', [e, 3]]]), 'coef-root', 'The root applies to the number too: ' + t('\\sqrt[3]{' + A + '}=' + a) + '.'], [ptex(a, [['x', [3, e]]]), 'index-power', IDX], [ptex(a, [['x', 3 * e]]), 'exp', 'A cube root <b>divides</b> the exponent by ' + t('3') + ' (it is the power ' + t('\\frac{1}{3}') + ').']], T));
        } },
        { id: '3b', level: 'EMG', make: function (r) {
          var n = r.pick([4, 5]), a = r.pick([2, 3]), m = r.pick([2, 3, 4]), A = Math.pow(a, n), T = ptex(a, [['x', m]]);
          return XP(t(rootT(n, A + 'x^{' + (n * m) + '}')), T, { form: 'power' },
            t(rootT(n, A + 'x^{' + (n * m) + '}') + '=' + A + '^{\\frac{1}{' + n + '}}x^{\\frac{' + (n * m) + '}{' + n + '}}=' + T) + ', since ' + t(a + '^{' + n + '}=' + A) + '.',
            ['The ' + rootName(n) + ' root is the power ' + t('\\frac{1}{' + n + '}') + ': apply it to the number and to the variable.'], 'root' + n + '(' + A + 'x^' + (n * m) + ')',
            known([[ptex(A, [['x', m]]), 'coef-root', 'The root applies to the number too: ' + t(rootT(n, A) + '=' + a) + '.'], [ptex(a, [['x', n * m * n]]), 'exp', 'A ' + rootName(n) + ' root <b>divides</b> the exponent by ' + t(n) + '.']], T));
        } },
        { id: '3c', level: 'BEG', make: function (r) {
          var a = r.pick([11, 12, 13, 14, 15, 20]), T = ptex(a, [['x', [1, 2]]]);
          return XP(t('\\sqrt{' + (a * a) + 'x}'), T, { form: 'power' }, t('\\sqrt{' + (a * a) + 'x}=\\sqrt{' + (a * a) + '}\\,x^{\\frac{1}{2}}=' + T) + ', since ' + t(a + '^{2}=' + (a * a)) + '.',
            ['A square root is the power ' + t('\\frac{1}{2}') + '. Take the square root of the number; ' + t('x') + ' becomes ' + t('x^{\\frac{1}{2}}') + '.'], 'sqrt(' + (a * a) + 'x)',
            known([[ptex(a * a, [['x', [1, 2]]]), 'coef-root', 'The root applies to the number too: ' + t('\\sqrt{' + (a * a) + '}=' + a) + '.'], [ptex(a, [['x', 2]]), 'index-power', 'A square root is the power ' + t('\\frac{1}{2}') + ', not ' + t('2') + '.']], T));
        } },
        { id: '3d', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { var n = r.pick([3, 4, 5]), m = r.pick([2, 3, 4]), e1 = r.int(1, n * m - 1); return [n, m, e1, n * m - e1]; }, function (x) { return x[2] % x[0] && x[3] % x[0] && x[2] !== x[3]; });
          var n = g[0], m = g[1], e1 = g[2], e2 = g[3], T = pw('x', m);
          return XP(t('\\left(' + rootT(n, pw('x', e1)) + '\\right)\\left(' + rootT(n, pw('x', e2)) + '\\right)'), T, { form: 'power' },
            'Same base, add the exponents: ' + t(pw('x', [e1, n]) + '\\cdot ' + pw('x', [e2, n]) + '=x^{\\frac{' + (e1 + e2) + '}{' + n + '}}=' + T) + '.',
            ['Write each radical as a power: ' + t(rootT(n, 'x^{m}') + '=x^{\\frac{m}{' + n + '}}') + '.', 'Then use the product law (add the exponents) and simplify the fraction.'], 'root' + n + ' x^' + e1 + ' · root' + n + ' x^' + e2,
            known([[pw('x', nrm(e1 * e2, n * n)), 'mult', 'Multiplying powers of the same base: <b>add</b> the exponents.'], [pw('x', nrm(e1 + e2, 2 * n)), 'add-den', 'The denominators are already the same — add the numerators only: ' + t('\\frac{' + e1 + '}{' + n + '}+\\frac{' + e2 + '}{' + n + '}=\\frac{' + (e1 + e2) + '}{' + n + '}') + '.']], T));
        } },
        { id: '3e', level: 'EMG', make: function (r) {
          var o = r.pick([[3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [5, 2], [5, 3]]), n = o[0], a = o[1], A = Math.pow(a, n), T = ptex(-a, [['x', [1, n]]]);
          return XP(t(rootT(n, '-' + A + 'x')), T, { form: 'power' }, t(rootT(n, '-' + A + 'x') + '=' + T) + ', since ' + t('(-' + a + ')^{' + n + '}=-' + A) + ' (the index ' + t(n) + ' is odd, so the root of a negative is negative).',
            ['The index is odd, so the ' + rootName(n) + ' root of a negative number is negative.', 'Take the root of the number; ' + t('x') + ' becomes ' + t('x^{\\frac{1}{' + n + '}}') + '.'], 'root' + n + '(-' + A + 'x)',
            known([[ptex(-A, [['x', [1, n]]]), 'coef-root', 'The root applies to the number too: ' + t(rootT(n, '-' + A) + '=-' + a) + '.']], T));
        } },
        { id: '3f', level: 'PRG', make: function (r) {
          var mn = r.pick([[3, 4], [2, 3], [2, 5], [3, 5], [4, 5], [4, 3], [3, 2]]), m = mn[0], n = mn[1], c1 = r.int(2, 6), c2 = r.int(2, 6), e = add([1, m], [1, n]), T = ptex(c1 * c2, [['x', e]]);
          return XP(t(c1 + rootT(m, 'x') + '\\times ' + c2 + rootT(n, 'x')), T, { form: 'power' },
            'Multiply the coefficients and add the exponents: ' + t(c1 + '\\times ' + c2 + '=' + (c1 * c2)) + '; ' + t('\\frac{1}{' + m + '}+\\frac{1}{' + n + '}=\\frac{' + (lcm(m, n) / m) + '}{' + lcm(m, n) + '}+\\frac{' + (lcm(m, n) / n) + '}{' + lcm(m, n) + '}=' + eT(e)) + '.<br>' + t(c1 + rootT(m, 'x') + '\\times ' + c2 + rootT(n, 'x') + '=' + T),
            ['Write each radical as a power of ' + t('x') + ', multiply the numbers, and add the exponents (common denominator!).'], c1 + 'root' + m + 'x·' + c2 + 'root' + n + 'x',
            known([[ptex(c1 + c2, [['x', e]]), 'coef-added', 'The coefficients <b>multiply</b>: ' + t(c1 + '\\times ' + c2) + '.'], [ptex(c1 * c2, [['x', [1, m * n]]]), 'mult', 'Multiplying powers of the same base: <b>add</b> the exponents (use a common denominator).'],
              [ptex(c1 * c2, [['x', nrm(2, m + n)]]), 'add-den', 'To add fractions, use a common denominator — don’t add the denominators: ' + t('\\frac{1}{' + m + '}+\\frac{1}{' + n + '}=\\frac{' + (lcm(m, n) / m) + '}{' + lcm(m, n) + '}+\\frac{' + (lcm(m, n) / n) + '}{' + lcm(m, n) + '}') + '.']], T));
        } }] },
      { num: '4', stem: 'Write an equivalent expression using positive rational exponents.',
        shared: function (r) { return { gh: r.pick([[5, 3], [3, 5], [7, 3], [7, 5], [3, 7], [5, 7]]) }; },
        parts: [
          { id: '4a', level: 'BEG', make: function (r) {
            var e = r.pick([3, 5, 7, 9, 11, 13]), T = pw('z', [e, 4]);
            return XP(t('\\sqrt{\\sqrt{z^{' + e + '}}}'), T, { form: 'power' }, 'Indices multiply: ' + t('2\\times 2=4') + '. ' + t('\\sqrt{\\sqrt{z^{' + e + '}}}=\\left(z^{' + e + '}\\right)^{\\frac{1}{2}\\cdot\\frac{1}{2}}=' + T) + '.',
              ['Each square root is the power ' + t('\\frac{1}{2}') + '; a root of a root multiplies them.'], 'sqrt sqrt z^' + e,
              known([[pw('z', [e, 2]), 'one-root', 'There are <b>two</b> square roots: ' + t('\\frac{1}{2}\\cdot\\frac{1}{2}=\\frac{1}{4}') + '.'], [pw('z', [4, e]), 'index-power', IDX]], T));
          } },
          { id: '4b', level: 'EMG', make: function (r) {
            var e = r.pick([4, 8, 9, 10, 14, 15]), T = pw('a', nrm(e, 6));
            return XP(t('\\sqrt[3]{\\sqrt{a^{' + e + '}}}'), T, { form: 'power' }, 'Indices multiply: ' + t('3\\times 2=6') + '. ' + t('\\sqrt[3]{\\sqrt{a^{' + e + '}}}=a^{\\frac{' + e + '}{6}}=' + T) + '.',
              ['A root of a root is one root: multiply the indices. Then reduce the exponent.'], 'cbrt sqrt a^' + e,
              known([[pw('a', nrm(e, 5)), 'add-index', 'A root of a root <b>multiplies</b> the indices: ' + t('3\\times 2=6') + '.'], [pw('a', nrm(6, e)), 'index-power', IDX]], T));
          } },
          { id: '4c', level: 'PRG', make: function (r) {
            var k = r.pick([2, 3, 5]), m = r.pick([2, 3, 4]), N = Math.pow(k, 6), T = ptex(k, [['y', m]]), o = r.pick([[3, 2], [2, 3]]);
            return XP(t(rootT(o[0], rootT(o[1], F(N) + 'y^{' + (6 * m) + '}'))), T, { form: 'power' },
              'Indices multiply: ' + t(o[0] + '\\times ' + o[1] + '=6') + ', and ' + t(k + '^{6}=' + F(N)) + '.<br>' + t('\\left(' + F(N) + 'y^{' + (6 * m) + '}\\right)^{\\frac{1}{6}}=' + F(N) + '^{\\frac{1}{6}}y^{\\frac{' + (6 * m) + '}{6}}=' + T) + '.',
              ['Combine the two roots into one ' + t('6') + 'th root, then apply it to both factors.', 'Which number to the power ' + t('6') + ' gives ' + t(F(N)) + '? Try ' + t('k^{6}=\\left(k^{3}\\right)^{2}') + '.'], 'root of root ' + N + 'y^' + (6 * m),
              known([[ptex(N, [['y', m]]), 'coef-root', 'The root applies to the number too: ' + t(F(N) + '^{\\frac{1}{6}}=' + k) + '.'], [ptex(k * k * k, [['y', 3 * m]]), 'only-one-root', 'That’s only the square root — the cube root still has to be applied.'], [ptex(k * k, [['y', 2 * m]]), 'only-one-root', 'That’s only the cube root — the square root still has to be applied.']], T));
          } },
          { id: '4d', level: 'EMG', make: function (r) {
            var o = r.pick([[4, 3], [2, 5], [3, 4], [5, 2], [2, 3], [3, 2]]), N = o[0] * o[1], e = pickWhere(function () { return r.int(2, N - 1); }, function (e) { return cop(e, N); }), T = pw('z', [e, N]);
            return XP(t(rootT(o[0], rootT(o[1], 'z^{' + e + '}'))), T, { form: 'power' }, 'Indices multiply: ' + t(o[0] + '\\times ' + o[1] + '=' + N) + '. ' + t(rootT(o[0], rootT(o[1], 'z^{' + e + '}')) + '=' + T) + '.',
              ['A root of a root is a single root: multiply the indices.'], 'root of root z^' + e,
              known([[pw('z', nrm(e, o[0] + o[1])), 'add-index', 'A root of a root <b>multiplies</b> the indices: ' + t(o[0] + '\\times ' + o[1]) + '.'], [pw('z', nrm(N, e)), 'index-power', IDX]], T));
          } },
          { id: '4e', level: 'PRG', make: function (r) {
            var a = r.pick([2, 3, 4, 5]), b = pickWhere(function () { return r.int(1, 5); }, function (b) { return cop(a, b); }), mn = r.pick([[2, 5], [2, 3], [3, 5], [4, 3], [4, 5], [1, 3]]), m = mn[0], n = mn[1];
            var bc = binomCheck(a, b, m, n), B = a + 'w-' + b;
            return { prompt: t('\\left(' + rootT(n, B) + '\\right)^{-' + m + '}'), input: { type: 'math', keys: 'expo', vars: ['w'] }, check: bc.check, key: bc.T, answer: t(bc.T), bad: bc.bad,
              good: ['1/(' + B + ')^(' + m + '/' + n + ')'], text: '(root' + n + '(' + B + '))^-' + m,
              solution: 'The whole bracket ' + t('(' + B + ')') + ' is the base. ' + t('\\left(' + rootT(n, B) + '\\right)^{-' + m + '}=(' + B + ')^{-\\frac{' + m + '}{' + n + '}}=' + bc.T) + '.',
              hints: ['Treat ' + t('(' + B + ')') + ' as one base: the ' + rootName(n) + ' root is the power ' + t('\\frac{1}{' + n + '}') + ', then the power of a power multiplies.', 'Finish with a positive exponent: ' + t('u^{-k}=\\frac{1}{u^{k}}') + '.'] };
          } },
          { id: '4f', level: 'PRG', make: function (r) {
            var g = pickWhere(function () { return [r.pick([3, 4, 5]), r.pick([2, 3]), r.pick([[4, 3], [2, 3], [5, 3], [3, 2], [5, 2], [3, 4]])]; }, function (x) { return x[1] % x[2][1] !== 0; });
            var n = g[0], be = g[1], c = g[2][0], d = g[2][1], E = [c, d], fs = [['z', E], ['w', nrm(be * c, d)]], T = ptex(1, fs);
            return XP(t('\\left(' + rootT(n, 'z^{' + n + '}w^{' + (n * be) + '}') + '\\right)^{' + eT(E) + '}'), T, { form: 'power' },
              'Inside the ' + rootName(n) + ' root: ' + t('z^{\\frac{' + n + '}{' + n + '}}w^{\\frac{' + (n * be) + '}{' + n + '}}=zw^{' + be + '}') + '.<br>Raised to ' + t(eT(E)) + ': ' + t('\\left(zw^{' + be + '}\\right)^{' + eT(E) + '}=' + T) + '.',
              ['Simplify the radical first: the ' + rootName(n) + ' root divides each exponent by ' + t(n) + '.', 'Then give every factor the outside exponent (multiply).'], '(root' + n + '(z^' + n + 'w^' + (n * be) + '))^(' + c + '/' + d + ')',
              known([[ptex(1, [['z', nrm(n * c, d)], ['w', nrm(n * be * c, d)]]), 'skip-root', 'Don’t skip the ' + rootName(n) + ' root inside the bracket: it divides each exponent by ' + t(n) + ' first.'], [ptex(1, [['z', E], ['w', add(be, E)]]), 'law-added', 'Power of a power: <b>multiply</b> the exponents.']], T));
          } },
          { id: '4g', level: 'EMG', make: function (r, sh) {
            var n = sh.gh[0], m = sh.gh[1], T = '-' + pw('z', [m, n]), base = EX(T, { form: 'power', diag: known([[pw('z', [n, m]), 'index-power', IDX], ['-' + pw('z', [n, m]), 'index-power', IDX]], T) });
            var chk = function (resp) {
              var res = base(resp);
              if (res.v === 'form' && res.code === 'brackets') { var p = ex.parse(resp); if (p.ok && negZPow(p.ast)) return form('minus-outside', 'Same value here (an odd root of a negative is negative), but in this expression the minus sign is <b>outside</b> the radical — write it in front: ' + t(T) + '.'); }
              return res;
            };
            return { prompt: t('-' + rootT(n, 'z^{' + m + '}')), input: { type: 'math', keys: 'expo', vars: ['z'] }, check: chk, key: T, answer: t(T), bad: [pw('z', [m, n]), '-' + pw('z', [n, m])], text: '-root' + n + '(z^' + m + ')',
              solution: 'The minus sign is outside the radical, so it stays in front: ' + t('-' + rootT(n, 'z^{' + m + '}') + '=' + T) + '.', hints: ['Only ' + t('z^{' + m + '}') + ' is under the radical. Convert that part; the minus sign stays in front.'] };
          } },
          { id: '4h', level: 'EMG', make: function (r, sh) {
            var n = sh.gh[0], m = sh.gh[1], T = '(-z)^{' + eT([m, n]) + '}', alt = '-' + pw('z', [m, n]), altA = ex.parse(alt).ast;
            var base = EX(alt, { form: 'power', diag: known([['(-z)^{' + eT([n, m]) + '}', 'index-power', IDX], [pw('z', [m, n]), 'sign', 'Check the sign: the base ' + t('-z') + ' is negative, and an odd root and an odd power of a negative stay negative.']], alt) });
            var chk = function (resp) { var p = ex.parse(resp); if (p.ok) { var x = negZPow(p.ast); if (x && ex.equiv(p.ast, altA, ['z'], 6)) return expIssue(x.b) || ok(); } return base(resp); };
            return { prompt: t(rootT(n, '(-z)^{' + m + '}')), input: { type: 'math', keys: 'expo', vars: ['z'] }, check: chk, key: T, answer: t(T), good: [alt], bad: ['(-z)^{' + eT([n, m]) + '}', pw('z', [m, n])], text: 'root' + n + '((-z)^' + m + ')',
              solution: 'Here the base is ' + t('(-z)') + ': ' + t(rootT(n, '(-z)^{' + m + '}') + '=' + T) + '.<br>(Because the index ' + t(n) + ' and the power ' + t(m) + ' are both odd, this also equals ' + t(alt) + ' — compare part (g).)',
              hints: ['The whole base ' + t('(-z)') + ' is under the radical, so keep it in brackets: the index is the denominator, the power the numerator.'] };
          } }] },
      { num: '5', section: 'Part B — Multi-Law Chains and Error Correction', stem: 'Simplify. Write each answer with positive exponents.', parts: [
        { id: '5a', level: 'PRG', make: function (r) {
          var dc = r.pick([[4, 3], [4, 3], [3, 2], [3, 4]]), d = dc[0], c = dc[1], k = d === 4 ? r.pick([2, 3]) : c === 4 ? 2 : r.pick([2, 3, 4]), u = r.pick([1, 2]);
          var v = d === 4 ? r.pick([2, 6, 10]) : c === 4 ? r.pick([1, 2]) : r.pick([1, 2, 4, 5]), Kc = Math.pow(k, d), kc = Math.pow(k, c), E = [-c, d], ye = mul(v, E);
          var fs = [['x', c * u], ['y', ye]], T = ptex([1, kc], fs), inside = Kc + 'x^{-' + (d * u) + '}' + pw('y', v);
          return XP(t('\\left(' + inside + '\\right)^{' + eT(E) + '}'), T, { form: 'power' },
            'Multiply every exponent by ' + t(eT(E)) + ':<br>' + t(Kc + '^{' + eT(E) + '}=\\frac{1}{\\left(' + rootT(d, Kc) + '\\right)^{' + c + '}}=\\frac{1}{' + kc + '}') + ', ' + t('x^{-' + (d * u) + '\\cdot ' + pT(E) + '}=x^{' + (c * u) + '}') + ', ' + t('y^{' + v + '\\cdot ' + pT(E) + '}=' + pw('y', ye)) + '.<br>' + t(rtex([1, kc], fs) + '=' + T),
            ['Apply the outside exponent to every factor — the number too. Multiply the exponents.', 'For the number: ' + t(Kc + '^{' + eT(E) + '}') + ' — negative means reciprocal, the denominator is the root, the numerator the power.'], '(' + Kc + 'x^-' + (d * u) + 'y^' + v + ')^(-' + c + '/' + d + ')',
            known([[ptex(Kc, fs), 'coef-raise', 'The exponent applies to ' + t(Kc) + ' too: ' + t(Kc + '^{' + eT(E) + '}=\\frac{1}{' + kc + '}') + '.'], [ptex([1, Kc], fs), 'coef-raise', 'The exponent applies to ' + t(Kc) + ' too: ' + t(Kc + '^{' + eT(E) + '}=\\frac{1}{' + kc + '}') + '.'],
              [ptex(kc, fs), 'coef-recip', 'The exponent on ' + t(Kc) + ' is negative, so it becomes a reciprocal: ' + t(Kc + '^{' + eT(E) + '}=\\frac{1}{' + kc + '}') + '.'], [ptex(mul(Kc, E), fs), 'coef-times', 'Raise the coefficient to the power — don’t multiply it by the exponent.']], T));
        } },
        { id: '5b', level: 'PRG', make: function (r) {
          var kj = r.pick([[3, 3], [3, 3], [2, 2], [4, 2], [4, 4]]), k = kj[0], j = kj[1], p = r.pick([[1, 2], [1, 2], [1, 4], [5, 4]]), s = r.pick([1, 2]);
          var a1 = mul(p, [2, 3]), ae = add(a1, [1, 2]), C = nrm(k * k, j), fs = [['a', ae], ['b', -2 * s]], T = ptex(C, fs), K3 = k * k * k, J2 = j * j;
          return XP(t('\\left(' + K3 + pw('a', p) + 'b^{-' + (3 * s) + '}\\right)^{\\frac{2}{3}}\\div\\left(' + J2 + 'a^{-1}\\right)^{\\frac{1}{2}}'), T, { form: 'power' },
            t('\\left(' + K3 + pw('a', p) + 'b^{-' + (3 * s) + '}\\right)^{\\frac{2}{3}}=' + (k * k) + pw('a', a1) + 'b^{-' + (2 * s) + '}') + ' (since ' + t(K3 + '^{\\frac{2}{3}}=' + k + '^{2}=' + (k * k)) + ') and ' + t('\\left(' + J2 + 'a^{-1}\\right)^{\\frac{1}{2}}=' + j + 'a^{-\\frac{1}{2}}') + '.<br>' +
              t('\\frac{' + (k * k) + pw('a', a1) + 'b^{-' + (2 * s) + '}}{' + j + 'a^{-\\frac{1}{2}}}=' + cK(C) + 'a^{' + eT(a1) + '+\\frac{1}{2}}b^{-' + (2 * s) + '}=' + rtex(C, fs) + '=' + T),
            ['Simplify each bracket first (every factor gets the exponent, numbers too), then divide: divide the coefficients and subtract the exponents of ' + t('a') + '.', 'Subtracting ' + t('-\\frac{1}{2}') + ' is adding ' + t('\\frac{1}{2}') + '. Finish with positive exponents.'], '(' + K3 + 'a^p b^-' + (3 * s) + ')^(2/3)÷(' + J2 + 'a^-1)^(1/2)',
            known([[ptex(C, [['a', sub(a1, [1, 2])], ['b', -2 * s]]), 'backwards', 'Dividing by ' + t('a^{-\\frac{1}{2}}') + ' means subtracting ' + t('-\\frac{1}{2}') + ', which is <b>adding</b> ' + t('\\frac{1}{2}') + '.'], [ptex(C, [['a', ae], ['b', 2 * s]]), 'flip-exp', 'Check ' + t('b') + ': ' + t('b^{-' + (2 * s) + '}') + ' belongs in the denominator.']], T));
        } },
        { id: '5c', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3]), c = r.pick([k * k, k * k, 2 * k * k]), p = r.pick([[1, 3], [1, 3], [1, 6], [1, 2]]), e = sub(p, [2, 3]), C = nrm(c, k * k), K3 = k * k * k, T = ptex(C, [['x', e]]);
          return XP(t(c + pw('x', p) + '\\cdot(' + K3 + 'x)^{-\\frac{2}{3}}'), T, { form: 'power' },
            t('(' + K3 + 'x)^{-\\frac{2}{3}}=' + K3 + '^{-\\frac{2}{3}}x^{-\\frac{2}{3}}=\\frac{1}{' + (k * k) + '}x^{-\\frac{2}{3}}') + ' (since ' + t(K3 + '^{\\frac{2}{3}}=' + k + '^{2}') + ').<br>' + t(c + pw('x', p) + '\\cdot\\frac{1}{' + (k * k) + '}x^{-\\frac{2}{3}}=' + cK(C) + 'x^{' + eT(p) + '-\\frac{2}{3}}=' + rtex(C, [['x', e]]) + '=' + T),
            ['Expand the bracket first: ' + t(K3) + ' and ' + t('x') + ' both get the exponent ' + t('-\\frac{2}{3}') + '.', 'Then multiply the coefficients, add the exponents, and finish with a positive exponent.'], c + 'x^p·(' + K3 + 'x)^(-2/3)',
            known([[ptex(c * k * k, [['x', e]]), 'coef-recip', t(K3 + '^{-\\frac{2}{3}}') + ' is a reciprocal: ' + t('\\frac{1}{' + (k * k) + '}') + ', so divide by ' + t(k * k) + '.'], [ptex(nrm(c, K3), [['x', e]]), 'coef-raise', 'The exponent applies to ' + t(K3) + ' too: ' + t(K3 + '^{-\\frac{2}{3}}=\\frac{1}{' + (k * k) + '}') + '.'], [ptex(C, [['x', neg(e)]]), 'flip-exp', 'Check the sign of the exponent: ' + t(eT(p) + '-\\frac{2}{3}=' + eT(e)) + ', so ' + t('x') + ' ends up in the denominator.']], T));
        } },
        { id: '5d', level: 'PRG', make: function (r) {
          var k = r.pick([3, 4, 5, 5, 6]), c = r.pick([k, k, 2 * k]), u = r.pick([2, 3]), w = r.int(1, u - 1), v = r.pick([[2, 3], [2, 3], [2, 5], [4, 3], [6, 5]]), ne = mul(v, [-1, 2]), C = nrm(c, k);
          var fs = [['m', u - w], ['n', ne]], T = ptex(C, fs);
          return XP(t('\\left(' + (k * k) + 'm^{-' + (2 * u) + '}' + pw('n', v) + '\\right)^{-\\frac{1}{2}}\\cdot ' + c + 'm^{-' + w + '}'), T, { form: 'power' },
            t('\\left(' + (k * k) + 'm^{-' + (2 * u) + '}' + pw('n', v) + '\\right)^{-\\frac{1}{2}}=\\frac{1}{' + k + '}m^{' + u + '}' + pw('n', ne)) + ' (since ' + t((k * k) + '^{-\\frac{1}{2}}=\\frac{1}{' + k + '}') + ').<br>' +
              t('\\frac{1}{' + k + '}m^{' + u + '}' + pw('n', ne) + '\\cdot ' + c + 'm^{-' + w + '}=' + cK(C) + 'm^{' + u + '-' + w + '}' + pw('n', ne) + '=' + rtex(C, fs) + '=' + T),
            ['Expand the bracket: multiply each exponent by ' + t('-\\frac{1}{2}') + ', and ' + t((k * k) + '^{-\\frac{1}{2}}=\\frac{1}{' + k + '}') + '.', 'Then multiply by the second factor: coefficients multiply, exponents of ' + t('m') + ' add.'], '(' + (k * k) + 'm^-' + (2 * u) + 'n^v)^(-1/2)·' + c + 'm^-' + w,
            known([[ptex(c * k, fs), 'coef-recip', t((k * k) + '^{-\\frac{1}{2}}') + ' is a reciprocal, ' + t('\\frac{1}{' + k + '}') + '.'], [ptex(C, [['m', u + w], ['n', ne]]), 'law-added', 'Check ' + t('m') + ': ' + t('m^{' + u + '}\\cdot m^{-' + w + '}=m^{' + u + '-' + w + '}') + '.'], [ptex(C, [['m', u - w], ['n', neg(ne)]]), 'flip-exp', 'Check ' + t('n') + ': ' + t(pw('n', v) + '\\to ' + pw('n', ne)) + ', a negative exponent, so ' + t('n') + ' goes in the denominator.']], T));
        } }] },
      { num: '6', stem: function (o) { return q6stem(o); }, shared: q6shared, parts: [
        { id: '6a', level: 'PRG', make: function (r, o) {
          var l2 = nrm(o.p + o.k * o.q, o.q), x0 = Math.pow(2, o.q), good = o.p * o.k + o.s, mal = o.p + o.k * o.q + o.s;
          return P.mc(r, '(a) Identify the line with the error, and explain the mistake.', [
            { html: '<b>Line 1.</b> A power of a power <b>multiplies</b> the exponents; Malik added ' + t(eT([o.p, o.q])) + ' and ' + t(o.k) + '.', right: true },
            { html: '<b>Line 2.</b> ' + t(eT([o.p, o.q]) + '+' + o.k) + ' does not equal ' + t(eT(l2)) + '.', why: 'Check the arithmetic: ' + t(eT([o.p, o.q]) + '+' + o.k + '=' + eT(l2)) + ' is right, so Line 2 follows from Line 1. The mistake is earlier.' },
            { html: '<b>Line 3.</b> When two powers are multiplied, their exponents should be multiplied.', why: 'Line 3 is right to <b>add</b>: multiplying powers of the same base adds the exponents. Look at the bracket in Line 1.' },
            { html: 'There is no error.', why: 'Test it with ' + t('x=' + x0) + ': ' + t(q6expr(o)) + ' gives ' + t('2^{' + good + '}=' + F(Math.pow(2, good))) + ', but Malik’s answer gives ' + t('2^{' + mal + '}=' + F(Math.pow(2, mal))) + '.' }],
            'Line 1 uses the power of a power law, which <b>multiplies</b> exponents: ' + t('\\left(x^{' + eT([o.p, o.q]) + '}\\right)^{' + o.k + '}=x^{' + eT([o.p, o.q]) + '\\cdot ' + o.k + '}') + '. Malik added them instead (' + t(eT([o.p, o.q]) + '+' + o.k) + '). Lines 2 and 3 follow correctly from Line 1, but the answer is wrong because Line 1 is.',
            ['Check each line against the law it uses: a power of a power multiplies exponents; a product of powers adds them.'], 'Malik error line', true);
        } },
        { id: '6b', level: 'EMG', make: function (r, o) {
          var A = nrm(o.p * o.k, o.q), g = nrm(o.p * o.k + o.s, o.q), mal = nrm(o.p + o.k * o.q + o.s, o.q), T = pw('x', g);
          return XP('(b) Write a correct simplification of ' + t(q6expr(o)) + '.', T, { form: 'power' },
            t('\\left(x^{' + eT([o.p, o.q]) + '}\\right)^{' + o.k + '}=x^{' + eT([o.p, o.q]) + '\\cdot ' + o.k + '}=' + pw('x', A)) + ', so ' + t(pw('x', A) + '\\cdot x^{' + eT([o.s, o.q]) + '}=x^{' + eT(A) + '+' + eT([o.s, o.q]) + '}=' + T) + '.',
            ['Power of a power first (multiply), then the product law (add).'], 'Malik correct',
            known([[pw('x', mal), 'malik', 'That’s Malik’s answer — Line 1’s error is still there. ' + t('\\left(x^{' + eT([o.p, o.q]) + '}\\right)^{' + o.k + '}') + ' multiplies the exponents.'], [pw('x', mul(A, [o.s, o.q])), 'mult', 'After the bracket, the two powers are multiplied: same base, <b>add</b> the exponents.']], T));
        } }] },
      { num: '7', section: 'Part C — Matching, Multiple Choice and Numerical Response', stem: '<i>(Matching)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) { return q7(r); } }] },
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var nm = r.pick([[5, 4], [5, 4], [5, 2], [3, 2], [3, 4], [5, 3], [3, 5]]), n = nm[0], m = nm[1], even = m % 2 === 0;
          var X = pw('x', m);
          return P.mc(r, 'Which of the following is equivalent to ' + t('(-x^{' + n + '})^{-' + eT([m, n]) + '}') + '?', [
            { html: t(X), why: 'The exponent is negative, so the answer is a <b>reciprocal</b>.' },
            { html: t('-' + X), why: 'The exponent is negative, so the answer is a <b>reciprocal</b> — a negative exponent never just makes the answer negative.' },
            { html: t('\\dfrac{1}{' + X + '}'), right: even, why: even ? null : 'Check the sign: ' + t(rootT(n, '-x^{' + n + '}') + '=-x') + ', and ' + t('(-x)^{' + m + '}') + ' is an <b>odd</b> power of a negative, so it stays negative.' },
            { html: t('-\\dfrac{1}{' + X + '}'), right: !even, why: even ? 'Check the sign: ' + t(rootT(n, '-x^{' + n + '}') + '=-x') + ', but then ' + t('(-x)^{' + m + '}') + ' is an <b>even</b> power, which makes it positive.' : null }],
            t('(-x^{' + n + '})^{-' + eT([m, n]) + '}=\\dfrac{1}{(-x^{' + n + '})^{' + eT([m, n]) + '}}') + '. Now ' + t('(-x^{' + n + '})^{' + eT([m, n]) + '}=\\left(' + rootT(n, '-x^{' + n + '}') + '\\right)^{' + m + '}=(-x)^{' + m + '}=' + (even ? '' : '-') + X) + ' — the ' + rootName(n) + ' root of a negative is negative, and the ' + (even ? 'even' : 'odd') + ' power ' + t(m) + ' makes it ' + (even ? 'positive' : 'stay negative') + '.<br>So the answer is ' + t((even ? '' : '-') + '\\dfrac{1}{' + X + '}') + '.',
            ['Take the root first: the denominator ' + t(n) + ' is an odd index, so ' + t(rootT(n, '-x^{' + n + '}')) + ' is fine. Then the power, then the reciprocal.'], '(-x^' + n + ')^(-' + m + '/' + n + ')', true);
        } }] },
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var mn = r.pick([[3, 5], [3, 5], [2, 3], [3, 4], [2, 5], [4, 3], [5, 2]]), m = mn[0], n = mn[1], E = 'b^{-' + eT([m, n]) + '}';
          var eqv = [{ tex: E, how: 'by definition' }, { tex: '\\left(' + rootT(n, 'b') + '\\right)^{-' + m + '}', how: t('=\\left(b^{\\frac{1}{' + n + '}}\\right)^{-' + m + '}=' + E) }, { tex: '\\dfrac{1}{' + rootT(n, 'b^{' + m + '}') + '}', how: t('=\\frac{1}{b^{' + eT([m, n]) + '}}=' + E) }, { tex: '\\dfrac{1}{\\left(' + rootT(n, 'b') + '\\right)^{' + m + '}}', how: t('=\\frac{1}{b^{' + eT([m, n]) + '}}=' + E) }];
          var bad = r.pick([{ tex: '\\left(\\dfrac{1}{b^{' + n + '}}\\right)^{' + m + '}', how: t('=b^{-' + (n * m) + '}') + ', not ' + t(E) }, { tex: '\\left(\\dfrac{1}{b^{' + n + '}}\\right)^{' + m + '}', how: t('=b^{-' + (n * m) + '}') + ', not ' + t(E) },
            { tex: '\\dfrac{1}{' + rootT(m, 'b^{' + n + '}') + '}', how: t('=b^{-' + eT([n, m]) + '}') + ' (index and power swapped), not ' + t(E) }, { tex: '-' + rootT(n, 'b^{' + m + '}'), how: t('=-b^{' + eT([m, n]) + '}') + ' — a negative exponent means reciprocal, not negative' }]);
          var three = [eqv[0]].concat(r.sample(eqv.slice(1), 2));
          var opts = three.map(function (x) { return { html: t(x.tex), why: 'This one <b>is</b> equivalent to the others' + (x.how === 'by definition' ? ' — they all equal ' + t(E) + '.' : ': ' + t(x.tex) + ' ' + x.how + '.') + ' Look for the one that isn’t.', code: 'said-equiv' }; }).concat([{ html: t(bad.tex), right: true }]);
          return P.mc(r, 'Which expression is <b>not</b> equivalent to the others?', opts,
            'Write each as a power of ' + t('b') + ':<br>' + three.map(function (x) { return t(x.tex) + (x.how === 'by definition' ? '' : ' ' + x.how); }).join('<br>') + '<br>' + t(bad.tex) + ' ' + bad.how + '. So ' + t(bad.tex) + ' is the odd one out.',
            ['Convert every option to a single power of ' + t('b') + ': the root’s index goes in the denominator, and a reciprocal makes the exponent negative.'], 'not equivalent to b^(-' + m + '/' + n + ')');
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var k = r.pick([2, 2, 3]), n = r.pick([3, 3, 2, 4, 5]), kn = k * n, S = 'c^{' + k + '}' + rootT(n, 'd'), D1 = 'd^{\\frac{1}{' + n + '}}', W = 'c^{' + k + '}' + D1;
          var addOk = k + n !== kn;
          var A = { tex: W, ok: true, how: ', since ' + t(D1 + '=' + rootT(n, 'd')) + ' — equivalent' },
            B = { tex: '\\left(c^{' + kn + '}d\\right)^{\\frac{1}{' + n + '}}', ok: true, how: ' ' + t('=c^{\\frac{' + kn + '}{' + n + '}}' + D1 + '=' + W) + ' — equivalent' },
            C = { tex: rootT(n, 'c^{' + kn + '}d'), ok: true, how: ' ' + t('=\\left(c^{' + kn + '}d\\right)^{\\frac{1}{' + n + '}}=' + W) + ' — equivalent' };
          if (r.chance(0.45)) {
            var which = r.pick(['A', 'B', 'C']), useAdd = addOk && r.chance(0.5), e = useAdd ? nrm(k + n, n) : nrm(k, n);
            var how = ' ' + t('=c^{' + eT(e) + '}' + D1) + ' — not equivalent: ' + (useAdd ? 'the exponents multiply, they don’t add' : t('c^{' + k + '}') + ' must be raised to the power ' + t(n) + ' before it goes inside');
            var inside = 'c^{' + (useAdd ? k + n : k) + '}d';
            if (which === 'A') A = { tex: 'c^{' + k + '}d^{' + n + '}', ok: false, how: ' — not equivalent: ' + t('d^{' + n + '}\\ne ' + rootT(n, 'd')) + ' (the ' + rootName(n) + ' root is the power ' + t('\\frac{1}{' + n + '}') + ')' };
            if (which === 'B') B = { tex: '\\left(' + inside + '\\right)^{\\frac{1}{' + n + '}}', ok: false, how: how };
            if (which === 'C') C = { tex: rootT(n, inside), ok: false, how: how };
          }
          var allOk = A.ok && B.ok && C.ok;
          var opts = [A, B, C].map(function (x) { return { html: t(x.tex), right: !x.ok, why: x.ok ? 'This one <b>is</b> equivalent: ' + t(x.tex) + x.how + '.' : null, code: x.ok ? 'said-equiv' : undefined }; })
            .concat([{ html: 'All of the expressions are equivalent to ' + t(S) + '.', right: allOk, why: allOk ? null : 'Check each one by writing it as ' + t('c^{?}d^{?}') + ' — one of them doesn’t match.', code: 'said-all' }]);
          return P.mc(r, 'For all positive integers ' + t('c') + ' and ' + t('d') + ', which of the following is <b>not</b> equivalent to ' + t(S) + '?', opts,
            'Rewrite ' + t(S + '=' + W) + '.<br>' + [A, B, C].map(function (x, i) { return 'ABC'[i] + ': ' + t(x.tex) + x.how + '.'; }).join('<br>') + '<br>' + (allOk ? 'All three are equivalent, so the answer is <b>D</b>.' : 'So the one that is not equivalent is ' + t([A, B, C].filter(function (x) { return !x.ok; })[0].tex) + '.'),
            ['Write each option as ' + t('c^{?}d^{?}') + '. Moving ' + t('c^{' + k + '}') + ' inside a ' + rootName(n) + ' root means raising it to the power ' + t(n) + '.'], 'not equivalent to c^' + k + ' root' + n + ' d', true);
        } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) { return q11(r); } }] }
    ],

    extra: [
      { num: '15', section: 'Extra practice E — The exponent laws with rational exponents', stem: 'The laws do not change when the exponents become fractions — you still add, subtract and multiply them. Simplify each expression. Write your answer as a power with a positive exponent, and then as an entire radical.', parts: [
        { id: 'e15a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { var q1 = r.pick([2, 3, 4, 5, 6]), q2 = r.pick([2, 3, 4, 5, 6]); return [r.int(1, 2 * q1 + 1), q1, r.int(1, 2 * q2 + 1), q2]; },
            function (x) { var e = add([x[0], x[1]], [x[2], x[3]]); return x[1] !== x[3] && lcm(x[1], x[3]) <= 12 && cop(x[0], x[1]) && cop(x[2], x[3]) && e[1] > 1 && e[0] <= 19; });
          var e1 = [g[0], g[1]], e2 = [g[2], g[3]], e = add(e1, e2), L = lcm(g[1], g[3]), powT = pw('a', e), rT = rootT(e[1], pw('a', [e[0], 1]));
          return twoForms(t(pw('a', e1) + '\\cdot ' + pw('a', e2)), powT, rT, ['a'], { entire: true,
            pd: known([[pw('a', mul(e1, e2)), 'mult', 'Multiplying powers of the same base: <b>add</b> the exponents.'], [pw('a', nrm(g[0] + g[2], g[1] + g[3])), 'add-den', 'Use a common denominator to add the fractions — don’t add the denominators.']], powT), rd: known([swapRad('a', e)], rT),
            sol: 'Product law — add: ' + t(eT(e1) + '+' + eT(e2) + '=\\frac{' + (g[0] * L / g[1]) + '}{' + L + '}+\\frac{' + (g[2] * L / g[3]) + '}{' + L + '}=' + eT(e)) + '.<br>' + t(powT + '=' + rT), text: 'a^e1·a^e2' });
        } },
        { id: 'e15b', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { var q = r.pick([3, 5, 7]); return [r.int(2, q - 1), q, r.pick([2, 3]), r.pick([2, 3, 4, 5, 7])]; },
            function (x) { var p = x[0], q = x[1], k = x[2], s = x[3]; return cop(p, q) && s !== q && cop(k * q, s) && nrm(p * k, s)[1] > 1; });
          var p = g[0], q = g[1], k = g[2], s = g[3], e = nrm(p * k, s), powT = pw('x', e), rT = rootT(e[1], pw('x', [e[0], 1]));
          return twoForms(t('\\left(' + pw('x', [p, q]) + '\\right)^{' + eT([k * q, s]) + '}'), powT, rT, ['x'], { entire: true,
            pd: known([[pw('x', add([p, q], [k * q, s])), 'law-added', 'Power of a power: <b>multiply</b> the exponents.']], powT), rd: known([swapRad('x', e)], rT),
            sol: 'Power of a power — multiply: ' + t(eT([p, q]) + '\\cdot ' + eT([k * q, s]) + '=\\frac{' + (p * k * q) + '}{' + (q * s) + '}=' + eT(e)) + '.<br>' + t(powT + '=' + rT), text: '(x^(p/q))^(r/s)' });
        } },
        { id: 'e15c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { var q1 = r.pick([2, 3, 4, 5, 6]), q2 = r.pick([2, 3, 4, 5, 6]); return [r.int(1, 2 * q1 - 1), q1, r.int(1, 2 * q2 - 1), q2]; },
            function (x) { var d = sub([x[0], x[1]], [x[2], x[3]]); return x[1] !== x[3] && lcm(x[1], x[3]) <= 12 && cop(x[0], x[1]) && cop(x[2], x[3]) && d[0] < 0 && d[0] > -d[1]; });
          var e1 = [g[0], g[1]], e2 = [g[2], g[3]], e = sub(e1, e2), L = lcm(g[1], g[3]), powT = ptex(1, [['m', e]]), rT = radT(1, [['m', e]]);
          return twoForms(t(pw('m', e1) + '\\div ' + pw('m', e2)), powT, rT, ['m'], { entire: true,
            pd: known([[pw('m', neg(e)), 'backwards', 'Subtract in order — first minus second: ' + t(eT(e1) + '-' + eT(e2)) + ' is negative, so the power ends up in the denominator.'], [pw('m', add(e1, e2)), 'law-added', 'Dividing powers of the same base: <b>subtract</b> the exponents.']], powT),
            sol: 'Quotient law — subtract: ' + t(eT(e1) + '-' + eT(e2) + '=\\frac{' + (g[0] * L / g[1]) + '}{' + L + '}-\\frac{' + (g[2] * L / g[3]) + '}{' + L + '}=' + eT(e)) + '.<br>' + t(pw('m', e) + '=' + powT + '=' + rT), text: 'm^e1 ÷ m^e2 (negative)' });
        } },
        { id: 'e15d', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { var b = r.pick([2, 3, 4]), e = r.pick([2, 3, 4]); return [r.int(1, 2 * b + 1), b, r.int(1, e - 1), e, r.pick([2, 2, 3])]; },
            function (x) { var d = sub([x[0], x[1]], [x[2], x[3]]), res = mul(d, x[4]); return x[1] !== x[3] && cop(x[0], x[1]) && cop(x[2], x[3]) && d[0] > 0 && d[1] > 1 && res[1] > 1 && res[0] <= 18; });
          var e1 = [g[0], g[1]], e2 = [g[2], g[3]], k = g[4], d = sub(e1, e2), e = mul(d, k), powT = pw('c', e), rT = rootT(e[1], pw('c', [e[0], 1]));
          return twoForms(t('\\left(\\dfrac{' + pw('c', e1) + '}{' + pw('c', e2) + '}\\right)^{' + k + '}'), powT, rT, ['c'], { entire: true,
            pd: known([[pw('c', d), 'missed-power', 'Don’t forget the outside exponent ' + t(k) + ': multiply.'], [pw('c', mul(add(e1, e2), k)), 'law-added', 'Inside the bracket, dividing powers means <b>subtracting</b> exponents.']], powT), rd: known([swapRad('c', e)], rT),
            sol: 'Inside first: ' + t(eT(e1) + '-' + eT(e2) + '=' + eT(d)) + '. Then ' + t('\\left(' + pw('c', d) + '\\right)^{' + k + '}=c^{' + eT(d) + '\\cdot ' + k + '}=' + powT) + '.<br>' + t(powT + '=' + rT), text: '(c^e1/c^e2)^k' });
        } }] },
      { num: '16', stem: 'Coefficients obey their own arithmetic — multiply, divide or raise them as whole numbers while the exponents are added, subtracted or multiplied. Write each answer with positive exponents.', parts: [
        { id: 'e16a', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { var b = r.pick([2, 3, 4, 5]), e = r.pick([2, 3, 4]); return [r.int(1, 2 * b - 1), b, r.int(1, 2 * e - 1), e]; },
            function (x) { return x[1] !== x[3] && cop(x[0], x[1]) && cop(x[2], x[3]) && add([x[0], x[1]], [x[2], x[3]])[1] > 1; });
          var c1 = r.int(2, 7), c2 = r.int(2, 7), e1 = [g[0], g[1]], e2 = [g[2], g[3]], e = add(e1, e2), T = ptex(c1 * c2, [['p', e]]);
          return XP(t(c1 + pw('p', e1) + '\\times ' + c2 + pw('p', e2)), T, { form: 'power' }, 'Multiply the coefficients, add the exponents: ' + t(c1 + '\\times ' + c2 + '=' + (c1 * c2)) + '; ' + t(eT(e1) + '+' + eT(e2) + '=' + eT(e)) + '.<br>' + t(T),
            ['Numbers multiply as usual; exponents of ' + t('p') + ' add (common denominator).'], 'c1p^e1 × c2p^e2',
            known([[ptex(c1 + c2, [['p', e]]), 'coef-added', 'The coefficients <b>multiply</b>.'], [ptex(c1 * c2, [['p', mul(e1, e2)]]), 'mult', 'Multiplying powers of the same base: <b>add</b> the exponents.']], T));
        } },
        { id: 'e16b', level: 'PRG', make: function (r) {
          var cc = r.pick([[12, 8], [10, 4], [9, 6], [15, 6], [14, 4], [6, 4], [10, 6], [20, 8]]), C = nrm(cc[0], cc[1]);
          var g = pickWhere(function () { var b = r.pick([2, 3, 4, 5]), e = r.pick([2, 3, 4]); return [r.int(1, 3 * b), b, r.int(1, 2 * e - 1), e]; },
            function (x) { var d = sub([x[0], x[1]], [x[2], x[3]]); return x[1] !== x[3] && cop(x[0], x[1]) && cop(x[2], x[3]) && d[0] > 0 && d[1] > 1; });
          var e1 = [g[0], g[1]], e2 = [g[2], g[3]], e = sub(e1, e2), T = ptex(C, [['q', e]]);
          return XP(t('\\dfrac{' + cc[0] + pw('q', e1) + '}{' + cc[1] + pw('q', e2) + '}'), T, { form: 'power' }, 'Divide the coefficients, subtract the exponents: ' + t('\\frac{' + cc[0] + '}{' + cc[1] + '}=' + cT(C)) + '; ' + t(eT(e1) + '-' + eT(e2) + '=' + eT(e)) + '.<br>' + t(T),
            ['Reduce the number fraction; subtract the exponents of ' + t('q') + ' (common denominator).'], 'c1q^e1/(c2q^e2)',
            known([[ptex(C, [['q', add(e1, e2)]]), 'law-added', 'Dividing powers of the same base: <b>subtract</b> the exponents.'], [ptex(C, [['q', neg(e)]]), 'backwards', 'Subtract in order — top exponent minus bottom exponent.']], T));
        } },
        { id: 'e16c', level: 'EMG', make: function (r) {
          var o = r.pick([[4, 3, 2], [4, 3, 3], [3, 2, 2], [3, 2, 3], [3, 2, 4], [3, 4, 2]]), d = o[0], c = o[1], k = o[2], m = r.pick([1, 2, 3]), Kd = Math.pow(k, d), kc = Math.pow(k, c), T = ptex(kc, [['r', m * c]]);
          return XP(t('\\left(' + Kd + 'r^{' + (d * m) + '}\\right)^{' + eT([c, d]) + '}'), T, { form: 'power' }, 'Apply ' + t(eT([c, d])) + ' to both factors: ' + t(Kd + '^{' + eT([c, d]) + '}=\\left(' + rootT(d, Kd) + '\\right)^{' + c + '}=' + k + '^{' + c + '}=' + kc) + '; ' + t('r^{' + (d * m) + '\\cdot ' + eT([c, d]) + '}=r^{' + (m * c) + '}') + '.<br>' + t(T),
            ['Both factors get the exponent. For the number, take the root first (denominator), then the power (numerator).'], '(' + Kd + 'r^' + (d * m) + ')^(' + c + '/' + d + ')',
            known([[ptex(Kd, [['r', m * c]]), 'coef-raise', 'The exponent applies to ' + t(Kd) + ' too.'], [ptex(mul(Kd, [c, d]), [['r', m * c]]), 'coef-times', 'Raise the coefficient to the power — don’t multiply it by the exponent.']], T));
        } },
        { id: 'e16d', level: 'PRG', make: function (r) {
          var o = r.pick([[3, 2, 2], [3, 2, 2], [3, 2, 3], [4, 3, 2]]), d = o[0], c = o[1], k = o[2], m = r.pick([1, 2]), n = r.pick([1, 2]), Kd = Math.pow(k, d), kc = Math.pow(k, c);
          var fs = [['s', c * m], ['t', -c * n]], T = ptex([1, kc], fs);
          return XP(t('\\left(' + Kd + 's^{-' + (d * m) + '}t^{' + (d * n) + '}\\right)^{-' + eT([c, d]) + '}'), T, { form: 'power' },
            'Apply ' + t('-' + eT([c, d])) + ' to every factor: ' + t(Kd + '^{-' + eT([c, d]) + '}=\\frac{1}{\\left(' + rootT(d, Kd) + '\\right)^{' + c + '}}=\\frac{1}{' + kc + '}') + '; ' + t('s^{-' + (d * m) + '\\cdot\\left(-' + eT([c, d]) + '\\right)}=s^{' + (c * m) + '}') + '; ' + t('t^{' + (d * n) + '\\cdot\\left(-' + eT([c, d]) + '\\right)}=t^{-' + (c * n) + '}') + '.<br>' + t(T),
            ['Every factor gets the exponent ' + t('-' + eT([c, d])) + '. A negative exponent on the number gives a reciprocal.'], '(' + Kd + 's^-' + (d * m) + 't^' + (d * n) + ')^(-' + c + '/' + d + ')',
            known([[ptex(kc, fs), 'coef-recip', t(Kd + '^{-' + eT([c, d]) + '}') + ' is a reciprocal: ' + t('\\frac{1}{' + kc + '}') + '.'], [ptex([1, Kd], fs), 'coef-raise', 'The exponent applies to ' + t(Kd) + ' too.'], [ptex(Kd, fs), 'coef-raise', 'The exponent applies to ' + t(Kd) + ' too: ' + t(Kd + '^{-' + eT([c, d]) + '}=\\frac{1}{' + kc + '}') + '.']], T));
        } }] },
      { num: '17', stem: 'Each of these collapses to a whole number. Simplify to a single power first, and only then evaluate.', parts: [
        { id: 'e17a', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { var n = r.pick([3, 4, 5]), T = r.pick([n, 2 * n]); return [n, T, r.int(1, T - 1)]; }, function (x) { return x[2] % x[0] && (x[1] - x[2]) % x[0]; });
          var n = g[0], T = g[1], p = g[2], q = T - p, b = T === n ? r.int(5, 15) : r.int(2, 7), v = Math.pow(b, T / n);
          return P.number(t(b + '^{' + eT(nrm(p, n)) + '}\\times ' + b + '^{' + eT(nrm(q, n)) + '}'), v, function (u) { if (u === b * b && v !== b * b) return { code: 'bases-mult', hint: 'Same base: keep the base ' + t(b) + ' and <b>add</b> the exponents — don’t multiply the bases.' }; return null; },
            'Same base — add: ' + t(b + '^{\\frac{' + p + '}{' + n + '}+\\frac{' + q + '}{' + n + '}}=' + b + '^{' + (T / n) + '}=' + v) + '.', ['Add the exponents first — they make a whole number.'], 'b^p·b^q collapse');
        } },
        { id: 'e17b', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { return [r.pick([2, 3, 5]), r.pick([3, 4, 5]), r.pick([1, 2, 3]), r.int(1, 4)]; }, function (x) { return Math.pow(x[0], x[2]) <= 125 && x[3] < x[1] && cop(x[3], x[1]) && cop(x[3] + x[2] * x[1], x[1]); });
          var b = g[0], n = g[1], k = g[2], c = g[3], a = c + k * n, v = Math.pow(b, k);
          return P.number(t('\\dfrac{' + b + '^{' + eT([a, n]) + '}}{' + b + '^{' + eT([c, n]) + '}}'), v, function (u) { if (a % c === 0 && u === Math.pow(b, a / c)) return { code: 'law-divided', hint: 'Subtract the exponents — don’t divide them.' }; if (u === 1) return { code: 'law-divided', hint: 'Same base: keep ' + t(b) + ' and subtract the exponents.' }; return null; },
            'Same base — subtract: ' + t(b + '^{' + eT([a, n]) + '-' + eT([c, n]) + '}=' + b + '^{' + k + '}=' + v) + '.', ['Subtract the exponents first.'], 'b^a/b^c collapse');
        } },
        { id: 'e17c', level: 'BEG', make: function (r) {
          var g = pickWhere(function () { return [r.int(2, 7), r.pick([3, 4, 5]), r.pick([2, 3])]; }, function (x) { return cop(x[2], x[1]) && Math.pow(x[0], x[2]) <= 343; });
          var b = g[0], n = g[1], m = g[2], v = Math.pow(b, m);
          return P.number(t('\\left(' + b + '^{' + eT([m, n]) + '}\\right)^{' + n + '}'), v, null, 'Power of a power — multiply: ' + t(b + '^{' + eT([m, n]) + '\\cdot ' + n + '}=' + b + '^{' + m + '}=' + v) + '.', ['Multiply the exponents first.'], '(b^(m/n))^n');
        } },
        { id: 'e17d', level: 'EMG', make: function (r) {
          var o = r.pick([[8, 2, 2, 4], [2, 18, 2, 6], [3, 12, 2, 6], [5, 20, 2, 10], [2, 32, 2, 8], [3, 27, 2, 9], [4, 2, 3, 2], [9, 3, 3, 3], [4, 16, 3, 4], [25, 5, 3, 5]]), a = o[0], b = o[1], n = o[2], v = o[3];
          return P.number(t(a + '^{\\frac{1}{' + n + '}}\\times ' + b + '^{\\frac{1}{' + n + '}}'), v, function (u) { if (u === a * b) return { code: 'law-added', hint: 'The exponents don’t add here — the bases are different. Same exponent: multiply the bases, ' + t('a^{\\frac{1}{' + n + '}}b^{\\frac{1}{' + n + '}}=(ab)^{\\frac{1}{' + n + '}}') + '.' }; return null; },
            'Same exponent — multiply the bases: ' + t('(' + a + '\\times ' + b + ')^{\\frac{1}{' + n + '}}=' + (a * b) + '^{\\frac{1}{' + n + '}}=' + v) + '.', ['The bases are different but the exponents are the same: use the power of a product law backwards.'], a + '^(1/' + n + ')·' + b + '^(1/' + n + ')');
        } },
        { id: 'e17e', level: 'EMG', make: function (r) {
          var o = r.pick([[27, [5, 6], [1, 2], 3], [64, [5, 6], [1, 2], 4], [8, [5, 6], [1, 2], 2], [125, [5, 6], [1, 2], 5], [81, [3, 4], [1, 2], 3], [16, [3, 4], [1, 2], 2], [32, [7, 10], [1, 2], 2], [81, [7, 12], [1, 3], 3], [64, [2, 3], [1, 2], 2]]);
          var b = o[0], e1 = o[1], e2 = o[2], v = o[3], d = sub(e1, e2), dv = mul(e1, inv(e2)), wrongV = Math.pow(b, dv[0] / dv[1]);
          return P.number(t('\\dfrac{' + b + '^{' + eT(e1) + '}}{' + b + '^{' + eT(e2) + '}}'), v, function (u) { if (Math.abs(u - wrongV) < 1e-6) return { code: 'law-divided', hint: 'Subtract the exponents — don’t divide them.' }; return null; },
            'Same base — subtract: ' + t(eT(e1) + '-' + eT(e2) + '=' + eT(d)) + ', so ' + t(b + '^{' + eT(d) + '}=' + rootT(d[1], b) + '=' + v) + '.', ['Subtract the exponents (common denominator), then evaluate the root.'], b + '^e1/' + b + '^e2');
        } }] },
      { num: '18', stem: 'A root of a root is a single root: convert everything to exponent form, simplify, and write each as a single power.', parts: [
        { id: 'e18a', level: 'BEG', make: function (r) {
          var o = r.pick([[3, 2, 12], [2, 3, 12], [2, 2, 12], [3, 2, 18], [2, 4, 16], [4, 2, 24], [2, 3, 18]]), N = o[0] * o[1], T = pw('x', o[2] / N);
          return XP(t(rootT(o[0], rootT(o[1], 'x^{' + o[2] + '}'))), T, { form: 'power' }, t(rootT(o[0], rootT(o[1], 'x^{' + o[2] + '}')) + '=x^{' + o[2] + '\\cdot\\frac{1}{' + o[1] + '}\\cdot\\frac{1}{' + o[0] + '}}=' + T) + '.',
            ['Each root is a power ' + t('\\frac{1}{n}') + '; multiply all the exponents.'], 'root root x^' + o[2],
            known([[pw('x', nrm(o[2], o[0] + o[1])), 'add-index', 'A root of a root <b>multiplies</b> the indices: ' + t(o[0] + '\\times ' + o[1] + '=' + N) + '.']], T));
        } },
        { id: 'e18b', level: 'EMG', make: function (r) {
          var o = r.pick([[2, 4, 20], [4, 2, 12], [2, 3, 4], [3, 2, 10], [2, 2, 6], [2, 5, 15], [3, 2, 9]]), N = o[0] * o[1], e = nrm(o[2], N), T = pw('y', e);
          return XP(t(rootT(o[0], rootT(o[1], 'y^{' + o[2] + '}'))), T, { form: 'power' }, t(rootT(o[0], rootT(o[1], 'y^{' + o[2] + '}')) + '=y^{' + o[2] + '\\cdot\\frac{1}{' + o[1] + '}\\cdot\\frac{1}{' + o[0] + '}}=y^{\\frac{' + o[2] + '}{' + N + '}}=' + T) + '.',
            ['Multiply the indices to get one root, then reduce the exponent.'], 'root root y^' + o[2],
            known([[pw('y', nrm(o[2], o[0] + o[1])), 'add-index', 'A root of a root <b>multiplies</b> the indices: ' + t(o[0] + '\\times ' + o[1] + '=' + N) + '.'], [pw('y', inv(e)), 'index-power', IDX]], T));
        } },
        { id: 'e18c', level: 'EMG', make: function (r) {
          var o = r.pick([[3, 4, 2], [2, 3, 3], [3, 2, 2], [2, 4, 2], [4, 2, 3], [2, 5, 2]]), N = o[0] * o[1], k = o[2], V = Math.pow(k, N);
          return rootsPart(t(rootT(o[0], rootT(o[1], F(V)))), V, [1, N], k, [1, o[0] + o[1]],
            'Indices multiply: ' + t(o[0] + '\\times ' + o[1] + '=' + N) + '. ' + t(rootT(o[0], rootT(o[1], F(V))) + '=' + F(V) + '^{\\frac{1}{' + N + '}}') + '.<br>' + t(F(V) + '=' + k + '^{' + N + '}') + ', so ' + t('\\left(' + k + '^{' + N + '}\\right)^{\\frac{1}{' + N + '}}=' + k) + '.', 'root root ' + V);
        } },
        { id: 'e18d', level: 'EMG', make: function (r) {
          var g = pickWhere(function () { return [r.pick([2, 3, 4, 5]), r.int(1, 7), r.pick([2, 3, 4, 5]), r.int(1, 4)]; },
            function (x) { var d = sub([x[1], x[0]], [x[3], x[2]]); return x[0] !== x[2] && cop(x[1], x[0]) && cop(x[3], x[2]) && x[1] > 1 && d[0] > 0 && d[1] > 1 && lcm(x[0], x[2]) <= 15; });
          var p = g[0], a = g[1], q = g[2], b = g[3], e = sub([a, p], [b, q]), T = pw('x', e), L = lcm(p, q);
          return XP(t('\\dfrac{' + rootT(p, pw('x', a)) + '}{' + rootT(q, pw('x', b)) + '}'), T, { form: 'power' }, t('\\frac{' + pw('x', [a, p]) + '}{' + pw('x', [b, q]) + '}=x^{' + eT([a, p]) + '-' + eT([b, q]) + '}=x^{\\frac{' + (a * L / p) + '}{' + L + '}-\\frac{' + (b * L / q) + '}{' + L + '}}=' + T) + '.',
            ['Write both radicals as powers, then subtract the exponents (common denominator).'], 'root x^a / root x^b',
            known([[pw('x', add([a, p], [b, q])), 'law-added', 'Dividing powers of the same base: <b>subtract</b> the exponents.'], [pw('x', neg(e)), 'backwards', 'Subtract in order — top exponent minus bottom exponent.']], T));
        } }] },
      { num: '21', section: 'Extra practice F — Find the error', stem: 'Each line contains exactly one error. Name the mistake and write the correct answer.', parts: [
        { id: 'e21a1', sub: 'a i', level: 'EMG', make: function (r) {
          var mn = r.pick([[2, 3], [2, 3], [2, 5], [3, 4], [3, 5], [2, 7]]), m = mn[0], n = mn[1], x0 = Math.pow(2, m * n);
          var line = 'a^{\\frac{1}{' + m + '}}\\cdot a^{\\frac{1}{' + n + '}}=a^{\\frac{1}{' + (m * n) + '}}';
          return P.mc(r, 'A student wrote ' + t(line) + '. What is the mistake?', [
            { html: 'The exponents were <b>multiplied</b>; multiplying powers of the same base <b>adds</b> the exponents.', right: true },
            { html: 'The base should have changed to ' + t('a^{2}') + ' because two powers of ' + t('a') + ' are multiplied.', why: 'The base stays ' + t('a') + ' — the product law keeps the base. The problem is what happened to the exponents.' },
            { html: 'The exponents should have been subtracted.', why: 'Subtracting exponents is for <b>dividing</b> powers (quotient law). This is a product.' },
            { html: 'There is no mistake.', why: 'Test it with ' + t('a=' + F(x0)) + ': the left side is ' + t('2^{' + n + '}\\cdot 2^{' + m + '}=' + Math.pow(2, m + n)) + ', but the right side is ' + t('2') + '.' }],
            'The product law adds exponents: ' + t('a^{\\frac{1}{' + m + '}}\\cdot a^{\\frac{1}{' + n + '}}=a^{\\frac{1}{' + m + '}+\\frac{1}{' + n + '}}') + '. The student multiplied ' + t('\\frac{1}{' + m + '}\\cdot\\frac{1}{' + n + '}') + ' instead.',
            ['Which law is used when two powers of the same base are multiplied?'], 'name error a^(1/m)a^(1/n)', true);
        } },
        { id: 'e21a2', sub: 'a ii', level: 'BEG', make: function (r) {
          var mn = r.pick([[2, 3], [2, 3], [2, 5], [3, 4], [3, 5], [2, 7]]), m = mn[0], n = mn[1], e = add([1, m], [1, n]), T = pw('a', e);
          return XP('Write the correct answer: ' + t('a^{\\frac{1}{' + m + '}}\\cdot a^{\\frac{1}{' + n + '}}=\\ ?') + ' (the student wrote ' + t('a^{\\frac{1}{' + (m * n) + '}}') + ').', T, { form: 'power' },
            t('a^{\\frac{1}{' + m + '}}\\cdot a^{\\frac{1}{' + n + '}}=a^{\\frac{' + n + '}{' + (m * n) + '}+\\frac{' + m + '}{' + (m * n) + '}}=' + T) + '.', ['Add the exponents with a common denominator.'], 'a^(1/m)a^(1/n) corrected',
            known([[pw('a', [1, m * n]), 'repeat-error', 'That’s the student’s answer — add the exponents instead of multiplying.'], [pw('a', nrm(2, m + n)), 'add-den', 'Use a common denominator — don’t add the denominators.']], T));
        } },
        { id: 'e21b1', sub: 'b i', level: 'EMG', make: function (r) {
          var nk = r.pick([[2, 3], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [2, 7]]), n = nk[0], k = nk[1], m = r.pick([2, 3]), Kn = Math.pow(k, n);
          var line = '\\left(' + Kn + 'x^{' + (n * m) + '}\\right)^{\\frac{1}{' + n + '}}=' + Kn + 'x^{' + m + '}';
          return P.mc(r, 'A student wrote ' + t(line) + '. What is the mistake?', [
            { html: 'The exponent ' + t('\\frac{1}{' + n + '}') + ' was not applied to ' + t(Kn) + ': ' + t(Kn + '^{\\frac{1}{' + n + '}}=' + k) + '.', right: true },
            { html: 'The exponent of ' + t('x') + ' should be ' + t((n * m) + '+\\frac{1}{' + n + '}') + '.', why: 'A power of a power <b>multiplies</b> the exponents, so ' + t('x^{' + m + '}') + ' is right. Look at the number.' },
            { html: 'Only the number should get the exponent: ' + t('\\left(' + Kn + 'x^{' + (n * m) + '}\\right)^{\\frac{1}{' + n + '}}=' + k + 'x^{' + (n * m) + '}') + '.', why: 'Every factor in the bracket gets the exponent — ' + t('x^{' + (n * m) + '}') + ' too (and that part was done right).' },
            { html: 'There is no mistake.', why: 'Test it with ' + t('x=1') + ': the left side is ' + t(rootT(n, Kn) + '=' + k) + ', but the right side is ' + t(Kn) + '.' }],
            'Power of a product: every factor gets the exponent. ' + t(Kn + '^{\\frac{1}{' + n + '}}=' + k) + ' and ' + t('x^{' + (n * m) + '\\cdot\\frac{1}{' + n + '}}=x^{' + m + '}') + ', so the answer should be ' + t(k + 'x^{' + m + '}') + '. The student left ' + t(Kn) + ' unchanged.',
            ['Check each factor in the bracket: did each one get the exponent?'], 'name error (Kx^nm)^(1/n)', true);
        } },
        { id: 'e21b2', sub: 'b ii', level: 'BEG', make: function (r) {
          var nk = r.pick([[2, 3], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [2, 7]]), n = nk[0], k = nk[1], m = r.pick([2, 3]), Kn = Math.pow(k, n), T = ptex(k, [['x', m]]);
          return XP('Write the correct answer: ' + t('\\left(' + Kn + 'x^{' + (n * m) + '}\\right)^{\\frac{1}{' + n + '}}=\\ ?') + ' (the student wrote ' + t(Kn + 'x^{' + m + '}') + ').', T, { form: 'power' },
            t('\\left(' + Kn + 'x^{' + (n * m) + '}\\right)^{\\frac{1}{' + n + '}}=' + Kn + '^{\\frac{1}{' + n + '}}x^{\\frac{' + (n * m) + '}{' + n + '}}=' + T) + '.', ['Apply the exponent to the number and to the variable.'], '(Kx^nm)^(1/n) corrected',
            known([[ptex(Kn, [['x', m]]), 'repeat-error', 'That’s the student’s answer — the exponent applies to ' + t(Kn) + ' too.']], T));
        } }] },
      { num: '23', section: 'Extra practice G — Stretch', stem: 'Nested radicals become easy once every root is an exponent. Convert, simplify, and give each answer as a single power of ' + t('x') + '. Assume ' + t('x>0') + '.', parts: [
        { id: 'e23a', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { return [r.pick([2, 3, 4]), r.pick([2, 3]), r.pick([1, 1, 2])]; }, function (x) { return nrm(x[2] * x[1] + 1, x[1] * x[0])[1] > 1; });
          var n = g[0], m = g[1], a = g[2], inner = nrm(a * m + 1, m), e = mul(inner, [1, n]), T = pw('x', e), xa = pw('x', a);
          return XP(t(rootT(n, xa + rootT(m, 'x'))), T, { form: 'power' },
            t(xa + rootT(m, 'x') + '=x^{' + a + '}\\cdot x^{\\frac{1}{' + m + '}}=' + pw('x', inner)) + '.<br>' + t(rootT(n, pw('x', inner)) + '=x^{' + eT(inner) + '\\cdot\\frac{1}{' + n + '}}=' + T) + '.',
            ['Work from the inside out: combine ' + t(xa + rootT(m, 'x')) + ' into one power first.', 'Then the outer root multiplies that exponent by ' + t('\\frac{1}{' + n + '}') + '.'], 'root(x root x)',
            known([[pw('x', add([a, n], [1, m])), 'inner-root', 'The outer root applies to <b>everything</b> under it — to ' + t(rootT(m, 'x')) + ' as well: combine ' + t(xa + rootT(m, 'x')) + ' first.'], [pw('x', inv(e)), 'index-power', IDX]], T));
        } },
        { id: 'e23b', level: 'ADV', make: function (r) {
          var g = pickWhere(function () { var n = r.pick([2, 2, 3]); return [n, r.pick(n === 2 ? [1, 1, 3] : [1, 1, 2]), r.pick(n === 2 ? [1, 1, 3] : [1, 1, 2]), r.pick(n === 2 ? [1, 1, 3] : [1, 2])]; },
            function (x) { return nrm(x[1] * x[0] * x[0] + x[2] * x[0] + x[3], x[0] * x[0] * x[0])[1] > 1; });
          var n = g[0], a = g[1], b = g[2], c = g[3], e1 = [c, n], e2 = mul(add(b, e1), [1, n]), e3 = mul(add(a, e2), [1, n]), T = pw('x', e3);
          var expr = rootT(n, pw('x', a) + rootT(n, pw('x', b) + rootT(n, pw('x', c))));
          return XP(t(expr), T, { form: 'power' },
            'Work from the inside out:<br>' + t(rootT(n, pw('x', c)) + '=' + pw('x', e1)) + '<br>' + t(pw('x', b) + '\\cdot ' + pw('x', e1) + '=' + pw('x', add(b, e1)) + ',\\quad ' + rootT(n, pw('x', add(b, e1))) + '=' + pw('x', e2)) + '<br>' + t(pw('x', a) + '\\cdot ' + pw('x', e2) + '=' + pw('x', add(a, e2)) + ',\\quad ' + rootT(n, pw('x', add(a, e2))) + '=' + T),
            ['Start with the innermost root and work outward: each time, combine the power in front (add exponents), then apply the root (multiply by ' + t('\\frac{1}{' + n + '}') + ').'], 'triple nested root',
            known([[pw('x', mul(a + b + c, [1, n])), 'inner-root', 'Each root only covers what is under it — work from the innermost root outward.'], [pw('x', inv(e3)), 'index-power', IDX]], T));
        } },
        { id: 'e23c', level: 'PRG', make: function (r) {
          var g = pickWhere(function () { var s = r.sample([2, 3, 4, 5, 6], 3); return [s[0], r.int(1, 3), s[1], s[2]]; },
            function (x) { var e = sub(add([x[1], x[0]], [1, x[2]]), [1, x[3]]); return cop(x[1], x[0]) && x[1] < x[0] && e[0] > 0 && e[1] > 1 && e[1] <= 30; });
          var p = g[0], a = g[1], q = g[2], s = g[3], e = sub(add([a, p], [1, q]), [1, s]), T = pw('x', e), L = e[1];
          var ex1 = '\\dfrac{' + rootT(p, pw('x', a)) + '\\cdot ' + rootT(q, 'x') + '}{' + rootT(s, 'x') + '}';
          var lc = lcm(lcm(p, q), s);
          return XP(t(ex1), T, { form: 'power' },
            t('\\frac{' + pw('x', [a, p]) + '\\cdot x^{\\frac{1}{' + q + '}}}{x^{\\frac{1}{' + s + '}}}=x^{' + eT([a, p]) + '+\\frac{1}{' + q + '}-\\frac{1}{' + s + '}}=x^{\\frac{' + (a * lc / p) + '}{' + lc + '}+\\frac{' + (lc / q) + '}{' + lc + '}-\\frac{' + (lc / s) + '}{' + lc + '}}=' + T) + '.',
            ['Write each radical as a power of ' + t('x') + '. Add the exponents on top, subtract the one on the bottom (common denominator ' + t(lc) + ').'], 'root product over root',
            known([[pw('x', add(add([a, p], [1, q]), [1, s])), 'law-added', 'The ' + t(rootT(s, 'x')) + ' is in the denominator: <b>subtract</b> its exponent.']], T));
        } }] }
    ]
  });
})(window);
