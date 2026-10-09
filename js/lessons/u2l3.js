/* Math 10C · Unit 2 · Lesson 3 — Negative Exponents (AN3)
 * Assignment questions 1–17 (u2_L03.tex) and all of the Lesson 3 Extra Practice (u2_EP03.tex, Q1–20).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Answers with variables are checked with K.expo (positive-exponent
 * form); exact values with a local fraction checker. Answers are built with a small monomial engine (M, mm, md, mp)
 * so the key always follows from the question. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    opposite: 'Treated a negative exponent as a negative sign (opposite instead of reciprocal)',
    'coef-side': 'Number on the wrong side of the fraction bar (moved one with no negative exponent, or left one that has one)',
    'coef-not-raised': 'Didn’t raise the coefficient to the power', 'neg-base': 'Applied the exponent to the minus sign (−aⁿ read as (−a)ⁿ)',
    'even-neg': 'Kept a negative sign under an even power', 'odd-neg': 'Dropped the negative sign under an odd power', 'zero-power': 'Took a zero exponent to give 0',
    'zero-base': 'Took a⁰ to be a', 'zero-coef': 'Applied a zero exponent to the variable only, not the whole bracket', 'mult-exp': 'Multiplied exponents instead of adding (product law)',
    'add-exp': 'Added exponents instead of multiplying (power of a power)', 'sign-exp': 'Sign slip when combining exponents', 'no-flip': 'Raised the fraction to the power without flipping it',
    'no-power': 'Flipped the fraction but didn’t raise it to the power', 'one-exp': 'Forgot that a bare base has exponent 1', 'base-times-exp': 'Multiplied the base by the exponent',
    'div-neg': 'Divided by a negative power instead of multiplying by the positive power', 'flip-back': 'Didn’t move the negative power up from the denominator',
    sam: 'Repeated Sam’s error (coefficient not raised to the power)', 'coef-pos-power': 'Raised the coefficient to the positive power instead of the negative one',
    'split-sum': 'Split a power over a sum', 'repeat-error': 'Repeated the error in the worked line', single: 'Not written as a single fraction', 'not-flipped': 'Didn’t take the reciprocal',
    count: 'Miscounted the power of 10', 'neg-zero': 'Read −w⁰ as (−w)⁰'
  });

  /* ---------- rationals ---------- */
  function R(p, q) { return ex.norm(p, q == null ? 1 : q); }
  function rm(a, b) { return R(a[0] * b[0], a[1] * b[1]); }
  function rinv(a) { return R(a[1], a[0]); }
  function rpow(a, n) { if (n < 0) { a = rinv(a); n = -n; } return R(Math.pow(a[0], n), Math.pow(a[1], n)); }
  function near(x, y) { return ex.eq(x, y, 1e-9); }
  function frTex(a) { return a[1] === 1 ? F(a[0]) : (a[0] < 0 ? '-' : '') + '\\frac{' + F(Math.abs(a[0])) + '}{' + F(a[1]) + '}'; }
  function gcd(a, b) { return ex.gcd(a, b); }
  function pickWhere(gen, test) { for (var i = 0; i < 500; i++) { var v = gen(); if (test(v)) return v; } throw new Error('u2l3: no value found'); }
  function cop(r, lo, hi, o) { o = o || {}; return pickWhere(function () { return [r.int(lo, hi), r.int(lo, hi)]; }, function (pq) { return pq[0] !== pq[1] && gcd(pq[0], pq[1]) === 1 && (!o.lt || pq[0] < pq[1]) && (!o.gt || pq[0] > pq[1]); }); }

  /* ---------- monomials: { c: [p, q], v: { x: e, … } } (insertion order = display order) ---------- */
  function M(c, v) { return { c: typeof c === 'number' ? [c, 1] : c, v: v || {} }; }
  function tmono(c, pairs) { var v = {}; if (!Array.isArray(pairs)) { Object.keys(pairs).forEach(function (k) { v[k] = pairs[k]; }); return M(c, v); } pairs.forEach(function (pe) { v[pe[0]] = (v[pe[0]] || 0) + pe[1]; }); return M(c, v); }
  function mm(a, b) { var v = {}; Object.keys(a.v).forEach(function (k) { v[k] = a.v[k]; }); Object.keys(b.v).forEach(function (k) { v[k] = (v[k] || 0) + b.v[k]; }); return { c: rm(a.c, b.c), v: v }; }
  function minv(a) { var v = {}; Object.keys(a.v).forEach(function (k) { v[k] = -a.v[k]; }); return { c: rinv(a.c), v: v }; }
  function md(a, b) { return mm(a, minv(b)); }
  function mp(a, n) { var v = {}; Object.keys(a.v).forEach(function (k) { v[k] = a.v[k] * n; }); return { c: rpow(a.c, n), v: v }; }
  function vt(x, e) { return e === 1 ? x : x + '^{' + e + '}'; }
  function cTex(c, alone) {
    if (c[1] === 1) return alone ? F(c[0]) : c[0] === 1 ? '' : c[0] === -1 ? '-' : F(c[0]);
    return (c[0] < 0 ? '-' : '') + '\\frac{' + F(Math.abs(c[0])) + '}{' + F(c[1]) + '}';
  }
  /* positive-exponent form, the way the answer key writes it: -\frac{2a^{9}}{9}, \frac{432r^{4}}{p^{14}q^{5}} */
  function posTex(m) {
    var c = m.c, up = '', dn = '';
    Object.keys(m.v).forEach(function (x) { var e = m.v[x]; if (e > 0) up += vt(x, e); else if (e < 0) dn += vt(x, -e); });
    var top = (Math.abs(c[0]) === 1 && up ? '' : F(Math.abs(c[0]))) + up, bot = (c[1] === 1 ? '' : F(c[1])) + dn;
    return (c[0] < 0 ? '-' : '') + (bot ? '\\frac{' + top + '}{' + bot + '}' : top);
  }
  /* one line with negative exponents still showing (for worked solutions) */
  function rawTex(m) { var vs = Object.keys(m.v).filter(function (x) { return m.v[x] !== 0; }).map(function (x) { return vt(x, m.v[x]); }).join(''); return cTex(m.c, !vs) + vs; }
  /* a term as written in a question, e.g. 4b^{6}b^{-10} or -9a^{-2} (zero exponents shown) */
  function tt(c, pairs) { c = typeof c === 'number' ? [c, 1] : c; var vs = pairs.map(function (pe) { return vt(pe[0], pe[1]); }).join(''); return cTex(c, !vs) + vs; }
  function pT(m) { return posTex(m); }
  function fin(m) { var a = rawTex(m), b = posTex(m); return a === b ? b : a + '=' + b; }
  var LET = ['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z'];

  /* ---------- hints ---------- */
  var OPP = 'A negative exponent doesn’t make anything negative — it means <b>reciprocal</b>: ' + t('a^{-n}=\\frac{1}{a^{n}}') + ', not ' + t('-a^{n}') + '.';
  var H = {
    neg: 'A negative exponent means reciprocal: ' + t('a^{-n}=\\frac{1}{a^{n}}') + ' and ' + t('\\frac{1}{a^{-n}}=a^{n}') + '.',
    move: 'Move each factor with a negative exponent to the other side of the fraction bar and make its exponent positive. Everything else stays where it is.',
    only: 'An exponent belongs only to the base it touches. ' + t('5x^{-2}') + ' has the ' + t('-2') + ' on ' + t('x') + ' only; ' + t('(5x)^{-2}') + ' has it on ' + t('5') + ' and ' + t('x') + '.',
    laws: 'Use the product, quotient and power laws first, then move every factor with a negative exponent across the fraction bar.',
    coef: 'Work out the numbers and each variable separately: multiply/divide the coefficients, add/subtract the exponents.',
    flip: 'A fraction to a negative power: flip it and make the exponent positive, ' + t('\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^{n}') + '.',
    sign: 'Decide the sign first: is the minus sign inside the bracket (part of the base) or outside? A negative base to an even power is positive.',
    eval: 'Rewrite with a positive exponent first, then evaluate the power and write the reciprocal.'
  };

  /* ---------- checkers ---------- */
  /* an exact value (integer or fraction in lowest terms). o.pow: a power such as 7^{2} is also accepted */
  function exactChk(fr, diag, o) {
    o = o || {}; var T = fr[0] / fr[1];
    var base = K.fraction(fr, { diag: function (val, ast) {
      var h = diag ? diag(val, ast) : null; if (h) return h;
      if (T !== 0 && Math.abs(T) !== 1 && near(val, -1 / T)) return { code: 'opposite', hint: OPP };
      return null;
    } });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (near(a.val, T)) {
        var an = ex.analyze(a.ast);
        if (an.flags.negExp) return form('neg-exp', 'Right value — now ' + (o.pow ? 'write it with a positive exponent.' : 'evaluate it: rewrite the negative exponent as a reciprocal and work out the power.'));
        if (ex.shape(a.ast).pow) { if (o.pow) return ok(); return form('evaluate', 'Right value — now work out the power(s) and give a single number' + (fr[1] !== 1 ? ' or fraction' : '') + '.'); }
      }
      return base(resp);
    };
  }
  function exP(prompt, fr, diag, sol, hints, text, o) {
    o = o || {}; fr = R(fr[0], fr[1]);
    var p = P.math(prompt, exactChk(fr, diag, o), o.key || frTex(fr), sol, hints, text, { keys: o.pow ? 'expo' : 'fraction', before: o.before });
    if (o.bad) p.bad = o.bad.filter(function (b) { return !near(ex.value(ex.parse(b).ast), fr[0] / fr[1]); }); // a 'typical wrong answer' can coincide with the key for some numbers
    if (o.good) p.good = o.good;
    return p;
  }
  /* compare a student's analysed answer with a target monomial */
  function cmp(an, m) {
    var keys = Object.keys(m.v).filter(function (k) { return m.v[k] !== 0; }); Object.keys(an.vars).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
    var same = true, mixed = true, negd = 0;
    keys.forEach(function (k) { var x = m.v[k] || 0, y = an.vars[k] ? an.vars[k][0] / an.vars[k][1] : 0; if (y !== x) { same = false; if (y === -x) negd++; else mixed = false; } });
    var tc = m.c, sc = an.coef;
    return { same: same, negOnly: !same && mixed && negd > 0, sc: sc,
      coefEq: !!sc && sc[0] * tc[1] === tc[0] * sc[1], coefNeg: !!sc && sc[0] * tc[1] === -tc[0] * sc[1], coefRecip: !!sc && sc[0] * tc[0] === sc[1] * tc[1],
      coefIs: function (c) { c = typeof c === 'number' ? [c, 1] : c; return !!sc && sc[0] * c[1] === c[0] * sc[1]; } };
  }
  function gdiag(m, extra) {
    return function (an, ast) {
      if (!an.coef) return extra ? extra(an, ast, null) : null;
      var c = cmp(an, m);
      if (extra) { var h = extra(an, ast, c); if (h) return h; }
      if (c.coefNeg && c.negOnly) return { code: 'opposite', hint: OPP };
      if (c.coefNeg && c.same) return { code: 'sign', hint: 'Your variables are right — check the <b>sign</b>. A negative exponent never makes anything negative; a minus sign comes only from a minus in front, or from a negative base in brackets raised to an odd power.' };
      if (c.same && c.coefRecip && !(Math.abs(m.c[0]) === 1 && m.c[1] === 1)) return { code: 'coef-side', hint: 'Your variables are right, but the number is on the wrong side of the fraction bar. A number crosses the bar only if it carries a negative exponent itself.' };
      return null;
    };
  }
  /* exponent-law answer (positive exponents) for the monomial m */
  function X(prompt, m, sol, hints, text, o) {
    o = o || {};
    var p = P.expo(prompt, o.target || posTex(m), { diag: gdiag(m, o.diag), vars: o.vars, evaluate: o.evaluate }, sol, hints, text);
    if (o.bad) p.bad = o.bad; if (o.good) p.good = o.good;
    return p;
  }
  /* true / false with an explanation */
  function tfP(r, lhs, good, badRhs, truth, expl, text) {
    var rhs = truth ? good : badRhs;
    return P.tf(r, t(lhs + '=' + rhs), truth, expl, expl + '<br>So ' + t(lhs + '=' + good) + (truth ? ': the statement is <b>true</b>.' : ', not ' + t(rhs) + ': the statement is <b>false</b>.'), [H.only], text);
  }

  /* ---------- AST helpers for answers that K.expo can't judge (sums in a base, symbolic exponents) ---------- */
  function walk(a, fn) { if (!a || typeof a !== 'object') return; fn(a); ['a', 'b', 'n'].forEach(function (k) { if (a[k] && typeof a[k] === 'object') walk(a[k], fn); }); }
  function strip(a) { while (a && a.t === 'paren') a = a.a; return a; }
  function negExpIn(ast) { var f = false; walk(ast, function (x) { if (x.t === 'pow') { var e = ex.rat(x.b); if ((e && e[0] < 0) || x.b.t === 'neg') f = true; } }); return f; }
  function powOfFrac(ast) { var f = false; walk(ast, function (x) { if (x.t === 'pow' && strip(x.a).t === 'div') f = true; }); return f; }
  function nestedFrac(ast) { var f = false; walk(ast, function (x) { if (x.t === 'div') { walk(x.a, function (y) { if (y.t === 'div') f = true; }); walk(x.b, function (y) { if (y.t === 'div') f = true; }); } }); return f; }
  function singleFrac(ast) { var a = strip(ast); while (a.t === 'neg') a = strip(a.a); if (a.t === 'div') return true; var d = false; walk(a, function (x) { if (x.t === 'div') d = true; }); return !d; }
  function varsOf(ast) { return Object.keys(ex.shape(ast).vars); }
  /* any expression equal to targetTex with no negative exponents; o.single: one fraction; o.noFrac: no fractions at all;
   * o.alts: [[tex, code, hint]] typical wrong answers */
  function sumChk(targetTex, vars, o) {
    o = o || {}; var tp = ex.parse(targetTex).ast, alts = (o.alts || []).map(function (a) { return [ex.parse(a[0]).ast, a[1], a[2]]; });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var extra = varsOf(a.ast).filter(function (v) { return vars.indexOf(v) < 0; });
      if (extra.length) return wrong('var', 'Your answer has a variable ' + t(extra[0]) + ' that isn’t in the question.');
      if (!ex.equiv(a.ast, tp, vars, 6)) {
        for (var i = 0; i < alts.length; i++) if (ex.equiv(a.ast, alts[i][0], vars, 6)) return wrong(alts[i][1], alts[i][2]);
        return wrong('value', null);
      }
      if (negExpIn(a.ast)) return form('neg-exp', 'Right value — now write it with <b>positive exponents</b> only.');
      if (powOfFrac(a.ast)) return form('brackets', 'Right value — now apply the exponent to the top and to the bottom of the fraction.');
      if (nestedFrac(a.ast)) return form('simplify', 'Right value — now simplify the fraction inside the fraction.');
      if (o.noFrac && ex.shape(a.ast).divs) return form('simplify', 'Right value — keep simplifying: this one has no fraction left at the end.');
      if (o.single && !singleFrac(a.ast)) return form('single', 'Right value — now write it as a <b>single fraction</b> (one numerator over one denominator).');
      return ok();
    };
  }
  /* base^{c n}: a single power with a simplified symbolic exponent. wrongs: [[c', hint]] */
  function symExpChk(base, c, wrongs) {
    function tex(k) { return base + '^{' + (k === 1 ? '' : k === -1 ? '-' : k) + 'n}'; }
    var tp = ex.parse(tex(c)).ast, vars = [base, 'n'];
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var extra = varsOf(a.ast).filter(function (v) { return vars.indexOf(v) < 0; });
      if (extra.length) return wrong('var', 'Your answer has a variable ' + t(extra[0]) + ' that isn’t in the question.');
      if (!ex.equiv(a.ast, tp, vars, 6)) {
        for (var i = 0; i < (wrongs || []).length; i++) if (ex.equiv(a.ast, ex.parse(tex(wrongs[i][0])).ast, vars, 6)) return wrong(wrongs[i][2] || 'exp', wrongs[i][1]);
        return wrong('value', null);
      }
      var top = strip(a.ast);
      if (top.t !== 'pow' || strip(top.a).t !== 'var') return form('single-power', 'Right value — now write it as a single power of ' + t(base) + '.');
      var sh = ex.shape(top.b), neg = false; walk(top.b, function (x) { if (x.t === 'neg') neg = true; });
      if (sh.ops || sh.paren || neg || sh.divs) return form('simplify', 'Right value — now simplify the exponent (collect the ' + t('n') + ' terms into one).');
      return ok();
    };
  }

  /* ---------- reusable part makers ---------- */
  /* x^{-n} -> 1/x^n */
  function negVarPart(x, n) {
    var m = M(1, {}); m.v[x] = -n;
    return X(t(vt(x, -n)), m, t(vt(x, -n) + '=\\frac{1}{' + vt(x, n) + '}') + ': a negative exponent means the reciprocal of the positive power.', [H.neg], 'positive exponent: ' + x + '^-' + n, { bad: ['-' + vt(x, n), vt(x, n)] });
  }
  /* evaluate (p/q)^{-n} */
  function fracBasePart(p, q, n, neg) {
    var b = R(neg ? -p : p, q), ans = rpow(b, -n), bt = '\\left(' + (neg ? '-' : '') + '\\dfrac{' + p + '}{' + q + '}\\right)^{-' + n + '}';
    var flipT = (neg ? '-' : '') + (p === 1 ? String(q) : '\\frac{' + q + '}{' + p + '}');
    return exP(t(bt), ans, function (v) {
      if (n > 1 && near(v, rpow(b, n)[0] / rpow(b, n)[1])) return { code: 'no-flip', hint: 'You raised the fraction to the power ' + t(n) + ' but didn’t flip it. The negative exponent means: flip the fraction, then use the positive exponent.' };
      if (n > 1 && near(v, rinv(b)[0] / rinv(b)[1])) return { code: 'no-power', hint: 'Good flip — now raise the flipped fraction to the power ' + t(n) + '.' };
      if (neg && near(v, -ans[0] / ans[1])) return { code: n % 2 ? 'odd-neg' : 'even-neg', hint: n % 2 ? 'The base is negative and the power is odd, so the answer stays negative.' : 'The base is negative and the power is even, so the answer is positive.' };
      return null;
    }, t(bt + '=\\left(' + flipT + '\\right)^{' + n + '}=' + frTex(ans)), [H.flip], 'evaluate (' + (neg ? '-' : '') + p + '/' + q + ')^-' + n, { bad: [frTex(rpow(b, n)), frTex(rinv(b))].filter(function (s) { return n > 1 || s !== frTex(rinv(b)); }) });
  }
  /* -b^{-n}, (-b)^{-n}, -(-b)^{-n} evaluated exactly. kind: 'neg-out' | 'neg-in' | 'neg-both' */
  function signPowPart(b, n, kind) {
    var val = kind === 'neg-out' ? R(-1, Math.pow(b, n)) : kind === 'neg-in' ? R(n % 2 ? -1 : 1, Math.pow(b, n)) : R(n % 2 ? 1 : -1, Math.pow(b, n));
    var tex = kind === 'neg-out' ? '-' + b + '^{-' + n + '}' : kind === 'neg-in' ? '(-' + b + ')^{-' + n + '}' : '-(-' + b + ')^{-' + n + '}';
    var bn = F(Math.pow(b, n));
    var sol = kind === 'neg-out' ? 'The exponent is on ' + t(b) + ' only; the minus sign is applied last: ' + t(tex + '=-\\frac{1}{' + b + '^{' + n + '}}=' + frTex(val)) + '.'
      : kind === 'neg-in' ? 'The exponent is on the whole base ' + t('-' + b) + ': ' + t(tex + '=\\frac{1}{(-' + b + ')^{' + n + '}}=' + (n % 2 ? '\\frac{1}{-' + bn + '}=' : '') + frTex(val)) + ' (' + (n % 2 ? 'odd power: stays negative' : 'even power: positive') + ').'
        : 'Work out ' + t('(-' + b + ')^{-' + n + '}') + ' first, then take the opposite: ' + t(tex + '=-\\frac{1}{(-' + b + ')^{' + n + '}}=-\\left(' + frTex(R(n % 2 ? -1 : 1, Math.pow(b, n))) + '\\right)=' + frTex(val)) + '.';
    return exP(t(tex), val, function (v) {
      if (near(v, -val[0] / val[1])) {
        if (kind === 'neg-out') return { code: 'neg-base', hint: 'The exponent belongs to ' + t(b) + ' only — there are no brackets around ' + t('-' + b) + '. Work out ' + t(b + '^{-' + n + '}') + ', then put the minus sign in front.' };
        if (kind === 'neg-in') return { code: n % 2 ? 'odd-neg' : 'even-neg', hint: 'The brackets make ' + t('-' + b) + ' the base. ' + (n % 2 ? 'An odd power of a negative number is negative.' : 'An even power of a negative number is positive.') };
        return { code: 'sign', hint: 'Two signs to track: the one inside the bracket (with an ' + (n % 2 ? 'odd' : 'even') + ' power) and the one in front, applied last.' };
      }
      return null;
    }, sol, [H.sign, H.neg], 'evaluate ' + tex);
  }

  HW.defineLesson({
    id: 'u2l3', unit: 2, num: '3', title: 'Negative Exponents', outcome: 'AN3',
    blurb: 'Extending the exponent laws past zero: a negative exponent means a reciprocal — for numbers, variables, coefficients and fractional bases.',
    questions: [
      { num: '1', section: 'Part A — The negative exponent law', stem: 'Write the following with positive exponents.', parts: [
        { id: '1a', level: 'LIM', make: function (r) { return negVarPart(r.pick(['x', 'x', 'a', 'b', 'm', 'n', 'p', 't', 'w', 'z']), r.int(2, 9)); } },
        { id: '1b', level: 'LIM', make: function (r) { return negVarPart(r.pick(['y', 'y', 'c', 'd', 'h', 'k', 'q', 'r', 's']), r.int(2, 9)); } },
        { id: '1c', level: 'LIM', make: function (r) {
          var b = r.int(2, 12);
          return exP(t(b + '^{-1}'), [1, b], null, t(b + '^{-1}=\\frac{1}{' + b + '^{1}}=\\frac{1}{' + b + '}') + '.', [H.neg], 'positive exponent: ' + b + '^-1', { bad: [String(-b), String(b)] });
        } },
        { id: '1d', level: 'BEG', make: function (r) {
          var x = r.pick(['a', 'a', 'b', 'k', 'm', 'p', 'x', 'y']), n = r.int(2, 9), m = M(1, {}); m.v[x] = n;
          return X(t('\\dfrac{1}{' + vt(x, -n) + '}'), m, 'The power ' + t(vt(x, -n)) + ' is in the denominator with a negative exponent, so it moves up and the exponent becomes positive: ' + t('\\frac{1}{' + vt(x, -n) + '}=' + vt(x, n)) + '.',
            [H.neg], '1/' + x + '^-' + n, { bad: ['\\frac{1}{' + vt(x, n) + '}', '-' + vt(x, n)] });
        } },
        { id: '1e', level: 'BEG', make: function (r) {
          var b = r.int(2, 9), n = b <= 5 ? r.pick([2, 3]) : 2, v = Math.pow(b, n);
          return exP(t('\\dfrac{1}{' + b + '^{-' + n + '}}'), [v, 1], function (x) { if (near(x, 1 / v)) return { code: 'flip-back', hint: 'The power with the negative exponent is in the denominator, so it moves <b>up</b>: ' + t('\\frac{1}{a^{-n}}=a^{n}') + '.' }; return null; },
            t('\\frac{1}{' + b + '^{-' + n + '}}=' + b + '^{' + n + '}') + ' (' + t('=' + F(v)) + '). Either form is fine.', [H.neg], '1/' + b + '^-' + n, { pow: true, key: b + '^{' + n + '}', good: [F(v, true)], bad: ['\\frac{1}{' + v + '}', b + '^{-' + n + '}'] });
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', level: 'BEG', make: function (r) {
          var b = r.pick([2, 2, 3, 4, 5]), n = b === 2 ? r.int(2, 4) : b === 3 ? r.int(2, 3) : 2, a = r.int(2, 7), bn = Math.pow(b, n), V = a * bn;
          var lhs = a + '\\div ' + b + '^{-' + n + '}';
          var p = P.fields('Without using a calculator, show that ' + t(lhs + '=' + F(V)) + '. Fill in each step.',
            [{ name: 'Step 1', before: t(lhs + '=' + a + '\\times'), mode: 'math', keys: 'expo' }, { name: 'Step 2', before: t('=' + a + '\\times'), after: t('=' + F(V)) }],
            [exactChk([bn, 1], function (v) {
              if (near(v, 1 / bn)) return { code: 'div-neg', hint: 'Dividing by ' + t(b + '^{-' + n + '}') + ' is the same as multiplying by its reciprocal, ' + t('\\frac{1}{' + b + '^{-' + n + '}}=' + b + '^{' + n + '}') + '.' };
              return null;
            }, { pow: true }), K.number(bn, function (v) {
              if (v === b * n) return { code: 'base-times-exp', hint: t(b + '^{' + n + '}') + ' means ' + t(Array(n + 1).join(b + '\\times ').slice(0, -7)) + ', not ' + t(b + '\\times ' + n) + '.' };
              if (v === -bn) return { code: 'opposite', hint: OPP };
              return null;
            })],
            [b + '^{' + n + '}', String(bn)], t(lhs + '=' + a + '\\times ' + b + '^{' + n + '}=' + a + '\\times ' + bn + '=' + F(V)),
            'Dividing by a power with a negative exponent is the same as multiplying by the matching positive power, because ' + t('\\frac{1}{' + b + '^{-' + n + '}}=' + b + '^{' + n + '}') + ':<br>' + t(lhs + '=' + a + '\\times ' + b + '^{' + n + '}=' + a + '\\times ' + bn + '=' + F(V)) + ' ✓',
            [H.neg], 'show ' + a + '÷' + b + '^-' + n + '=' + V);
          p.good = [[String(bn), String(bn)]]; p.bad = [['\\frac{1}{' + bn + '}', String(bn)]].concat(b * n !== bn ? [[b + '^{' + n + '}', String(b * n)]] : []);
          return p;
        } }] },
      { num: '3', stem: 'Simplify, express with positive exponents, and evaluate without using a calculator.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var b = r.int(2, 6), k = b === 2 ? r.int(2, 5) : b <= 3 ? r.int(2, 4) : b <= 5 ? r.int(2, 3) : 2, m = r.int(1, 4), n = m + k, v = Math.pow(b, k);
          var tex = vt(String(b), m) + '\\times ' + b + '^{-' + n + '}';
          return exP(t(tex), [1, v], function (x) {
            if (m * n < 12 && near(x, Math.pow(b, -m * n))) return { code: 'mult-exp', hint: 'Product law: when you multiply powers of the same base, <b>add</b> the exponents: ' + t(m + '+(-' + n + ')') + '.' };
            if (m + n < 12 && near(x, Math.pow(b, -(m + n)))) return { code: 'sign-exp', hint: 'Check the exponent: ' + t(m + '+(-' + n + ')=' + (m - n)) + '.' };
            return null;
          }, t(tex + '=' + b + '^{' + m + '+(-' + n + ')}=' + b + '^{-' + k + '}=\\frac{1}{' + b + '^{' + k + '}}=\\frac{1}{' + F(v) + '}'), [H.laws, H.eval], tex, { bad: [String(v), '\\frac{1}{' + Math.pow(b, k + 1) + '}'] });
        } },
        { id: '3b', level: 'BEG', make: function (r) {
          var b = r.int(2, 9), n = b <= 3 ? r.int(2, 4) : 2, v = Math.pow(b, n), tex = b + '^{0}\\times ' + b + '^{-' + n + '}';
          return exP(t(tex), [1, v], function (x) {
            if (near(x, 0)) return { code: 'zero-power', hint: 'Any nonzero number to the power ' + t('0') + ' is ' + t('1') + ', not ' + t('0') + ': ' + t(b + '^{0}=1') + '.' };
            if (near(x, b / v)) return { code: 'zero-base', hint: t(b + '^{0}') + ' is ' + t('1') + ', not ' + t(b) + '.' };
            return null;
          }, t(b + '^{0}=1') + ', so this is just ' + t(b + '^{-' + n + '}=\\frac{1}{' + b + '^{' + n + '}}=\\frac{1}{' + v + '}') + '.', [H.eval], tex, { bad: ['0', '\\frac{1}{' + Math.pow(b, n - 1) + '}'] });
        } },
        { id: '3c', level: 'BEG', make: function (r) {
          var b = r.int(2, 9), n = b <= 5 ? r.pick([2, 2, 3]) : 2, v = Math.pow(b, n), tex = '\\dfrac{1}{' + b + '^{-' + n + '}}';
          return exP(t(tex), [v, 1], function (x) { if (near(x, 1 / v)) return { code: 'flip-back', hint: 'The negative power is in the <b>denominator</b>, so it moves up: ' + t('\\frac{1}{a^{-n}}=a^{n}') + '.' }; return null; },
            t('\\frac{1}{' + b + '^{-' + n + '}}=' + b + '^{' + n + '}=' + F(v)) + '.', [H.neg], '1/' + b + '^-' + n, { bad: ['\\frac{1}{' + v + '}'] });
        } },
        { id: '3d', level: 'EMG', make: function (r) {
          var b, n; do { b = r.int(2, 7); n = r.int(1, 3); } while (Math.pow(b, n + 1) > 512);
          var v = Math.pow(b, n + 1), tex = b + '^{-' + n + '}\\div ' + b;
          return exP(t(tex), [1, v], function (x) {
            if (n > 1 && near(x, Math.pow(b, -(n - 1)))) return { code: 'sign-exp', hint: 'Quotient law: subtract the exponents. ' + t(b) + ' on its own is ' + t(b + '^{1}') + ', so the exponent is ' + t('-' + n + '-1') + '.' };
            if (n === 1 && near(x, 1)) return { code: 'sign-exp', hint: 'Quotient law: subtract the exponents. ' + t(b) + ' on its own is ' + t(b + '^{1}') + ', so the exponent is ' + t('-1-1') + '.' };
            if (near(x, Math.pow(b, -n))) return { code: 'one-exp', hint: 'Don’t lose the ' + t('\\div ' + b) + ': ' + t(b + '=' + b + '^{1}') + ', so subtract one more from the exponent.' };
            return null;
          }, t(tex + '=' + b + '^{-' + n + '-1}=' + b + '^{-' + (n + 1) + '}=\\frac{1}{' + b + '^{' + (n + 1) + '}}=\\frac{1}{' + v + '}'), [H.laws, 'A base on its own has exponent ' + t('1') + '.'], tex, { bad: [String(v)] });
        } },
        { id: '3e', level: 'EMG', make: function (r) {
          var c = r.pick([[4, 2, 2], [4, 2, 2], [2, 2, 2], [2, 3, 2], [2, 2, 3], [3, 2, 2], [2, 4, 2], [5, 2, 2], [3, 3, 2], [2, 3, 3]]), b = c[0], m = c[1], n = c[2], v = Math.pow(b, m * n);
          var tex = '(' + b + '^{' + m + '})^{-' + n + '}';
          return exP(t(tex), [1, v], function (x) {
            if (near(x, Math.pow(b, m - n))) return { code: 'add-exp', hint: 'Power of a power: <b>multiply</b> the exponents, ' + t(m + '\\times(-' + n + ')') + '.' };
            return null;
          }, t(tex + '=' + b + '^{' + m + '\\times(-' + n + ')}=' + b + '^{-' + m * n + '}=\\frac{1}{' + b + '^{' + m * n + '}}=\\frac{1}{' + v + '}'), [H.laws, H.eval], tex, { bad: [String(v)] });
        } }] },
      { num: '4', stem: 'Express with positive exponents.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var L = r.sample(LET, 2), a = r.int(2, 9), b = r.int(2, 9), m = tmono(1, [[L[0], a], [L[1], -b]]);
          return X(t(tt(1, [[L[0], a], [L[1], -b]])), m, 'Only ' + t(vt(L[1], -b)) + ' has a negative exponent, so only it moves to the denominator: ' + t(pT(m)) + '.', [H.move], 'positive exponents ' + L.join(''), { bad: [vt(L[0], a) + vt(L[1], b)] });
        } },
        { id: '4b', level: 'BEG', make: function (r) {
          var L = r.sample(LET, 2), a = r.int(2, 9), b = r.int(2, 9), m = tmono(1, [[L[0], -a], [L[1], -b]]);
          return X(t(tt(1, [[L[0], -a], [L[1], -b]])), m, 'Both factors have negative exponents, so both move to the denominator: ' + t(pT(m)) + '.', [H.move], 'positive exponents ' + L.join(''), { bad: [vt(L[0], a) + vt(L[1], b), '-' + vt(L[0], a) + vt(L[1], b)] });
        } },
        { id: '4c', level: 'EMG', make: function (r) {
          var x = r.pick(['h', 'h', 'k', 'm', 'x', 'y', 't']), k = r.int(2, 30), n = r.pick([1, 1, 2, 3]), m = tmono(k, [[x, -n]]);
          return X(t(tt(k, [[x, -n]])), m, 'The exponent ' + t(-n) + ' belongs to ' + t(x) + ' only, so ' + t(vt(x, -n)) + ' moves down and the ' + t(k) + ' stays on top: ' + t(pT(m)) + '.', [H.only, H.move], k + x + '^-' + n, { bad: ['\\frac{1}{' + k + vt(x, n) + '}'] });
        } },
        { id: '4d', level: 'EMG', make: function (r) {
          var pq = cop(r, 2, 9, { lt: true }), x = r.pick(['b', 'b', 'a', 'c', 'm', 'y']), n = r.int(2, 9), m = tmono([pq[0], pq[1]], [[x, -n]]);
          return X(t('\\dfrac{' + pq[0] + '}{' + pq[1] + '}' + vt(x, -n)), m, 'Only ' + t(vt(x, -n)) + ' moves below the fraction bar; the ' + t('\\frac{' + pq[0] + '}{' + pq[1] + '}') + ' is unchanged: ' + t('\\frac{' + pq[0] + '}{' + pq[1] + '}\\cdot\\frac{1}{' + vt(x, n) + '}=' + pT(m)) + '.', [H.only, H.move], pq.join('/') + x + '^-' + n,
            { bad: ['\\frac{' + pq[1] + '}{' + pq[0] + vt(x, n) + '}', '\\frac{' + pq[0] + vt(x, n) + '}{' + pq[1] + '}'] });
        } },
        { id: '4e', level: 'BEG', make: function (r) {
          var x = r.pick(['z', 'z', 'a', 'k', 'w', 'y']), a = r.int(2, 5), b = r.int(2, 4), m = tmono(1, [[x, a * b]]);
          return X(t('(' + vt(x, -a) + ')^{-' + b + '}'), m, 'Power of a power: multiply the exponents. ' + t('(' + vt(x, -a) + ')^{-' + b + '}=' + x + '^{(-' + a + ')(-' + b + ')}=' + vt(x, a * b)) + '.', [H.laws, 'A negative times a negative is positive.'], '(' + x + '^-' + a + ')^-' + b,
            { bad: ['\\frac{1}{' + vt(x, a * b) + '}', '\\frac{1}{' + vt(x, a + b) + '}'], diag: function (an, ast, c) {
              var y = an.vars[x] ? an.vars[x][0] / an.vars[x][1] : null;
              if (y === -(a + b) || y === a + b) return { code: 'add-exp', hint: 'Power of a power: <b>multiply</b> the exponents, ' + t('(-' + a + ')(-' + b + ')') + '.' };
              if (y === -a * b) return { code: 'sign-exp', hint: 'A negative times a negative is positive: ' + t('(-' + a + ')(-' + b + ')=' + a * b) + '.' };
              return null;
            } });
        } },
        { id: '4f', level: 'EMG', make: function (r) {
          var x = r.pick(['s', 's', 'a', 'k', 'n', 'x']), n = r.int(2, 9), k = r.int(2, 12), m = tmono([1, k], [[x, -n]]);
          return X(t('\\dfrac{' + vt(x, -n) + '}{' + k + '}'), m, t(vt(x, -n)) + ' moves to the denominator, where the ' + t(k) + ' already is: ' + t('\\frac{' + vt(x, -n) + '}{' + k + '}=\\frac{1}{' + k + vt(x, n) + '}') + '.', [H.move], x + '^-' + n + '/' + k,
            { bad: ['\\frac{' + k + '}{' + vt(x, n) + '}', '\\frac{' + vt(x, n) + '}{' + k + '}'] });
        } },
        { id: '4g', level: 'EMG', make: function (r) {
          var x = r.pick(['y', 'y', 'b', 'm', 't', 'x']), n = r.int(2, 9), k = r.int(2, 12), m = tmono([1, k], [[x, n]]);
          return X(t('\\dfrac{1}{' + k + vt(x, -n) + '}'), m, 'Only ' + t(vt(x, -n)) + ' has a negative exponent, so only it moves up; the ' + t(k) + ' stays below: ' + t('\\frac{1}{' + k + vt(x, -n) + '}=\\frac{' + vt(x, n) + '}{' + k + '}') + '.', [H.only, H.move], '1/(' + k + x + '^-' + n + ')',
            { bad: [k + vt(x, n), '\\frac{1}{' + k + vt(x, n) + '}'] });
        } },
        { id: '4h', level: 'BEG', make: function (r) {
          var x = r.pick(['y', 'y', 'a', 'c', 'n', 'z']), n = r.int(2, 9), k = r.int(2, 12), m = tmono(k, [[x, n]]);
          return X(t('\\dfrac{' + k + '}{' + vt(x, -n) + '}'), m, t(vt(x, -n)) + ' is in the denominator with a negative exponent, so it moves up: ' + t('\\frac{' + k + '}{' + vt(x, -n) + '}=' + k + vt(x, n)) + '.', [H.move], k + '/' + x + '^-' + n,
            { bad: ['\\frac{' + k + '}{' + vt(x, n) + '}'] });
        } },
        { id: '4i', level: 'BEG', make: function (r) {
          var L = r.pick([['p', 'q'], ['p', 'q'], ['a', 'b'], ['m', 'n'], ['x', 'y'], ['s', 't']]), a = r.int(2, 9), b = r.int(2, 9), m = tmono(1, [[L[0], a], [L[1], b]]);
          return X(t('\\dfrac{' + vt(L[0], a) + '}{' + vt(L[1], -b) + '}'), m, t(vt(L[1], -b)) + ' moves up from the denominator: ' + t(pT(m)) + '.', [H.move], L[0] + '^' + a + '/' + L[1] + '^-' + b,
            { bad: ['\\frac{' + vt(L[0], a) + '}{' + vt(L[1], b) + '}'] });
        } },
        { id: '4j', level: 'BEG', make: function (r) {
          var L = r.pick([['p', 'q'], ['p', 'q'], ['a', 'b'], ['m', 'n'], ['x', 'y'], ['s', 't']]), a = r.int(2, 9), b = r.int(2, 9), m = tmono(1, [[L[0], -a], [L[1], -b]]);
          return X(t('\\dfrac{' + vt(L[0], -a) + '}{' + vt(L[1], b) + '}'), m, t(vt(L[0], -a)) + ' moves down to join ' + t(vt(L[1], b)) + ': ' + t(pT(m)) + '.', [H.move], L[0] + '^-' + a + '/' + L[1] + '^' + b,
            { bad: ['\\frac{' + vt(L[1], b) + '}{' + vt(L[0], a) + '}', vt(L[0], a) + vt(L[1], b)] });
        } }] },
      { num: '5', stem: 'Evaluate the following without using a calculator.', parts: [
        { id: '5a', level: 'EMG', make: function (r) { return signPowPart(r.int(2, 9), 2, 'neg-out'); } },
        { id: '5b', level: 'EMG', make: function (r) { var b = r.int(2, 9); return signPowPart(b, b <= 3 ? r.pick([2, 2, 4]) : 2, 'neg-in'); } },
        { id: '5c', level: 'EMG', make: function (r) {
          var ab = cop(r, 2, 7), a = ab[0], b = ab[1], n = b <= 3 ? r.pick([2, 2, 3]) : 2, val = R(-a * a, Math.pow(b, n)), tex = '-' + a + '^{2}\\cdot ' + b + '^{-' + n + '}';
          return exP(t(tex), val, function (v) {
            if (near(v, -val[0] / val[1])) return { code: 'neg-base', hint: t('-' + a + '^{2}') + ' means ' + t('-(' + a + '^{2})=-' + a * a) + ': the exponent is on ' + t(a) + ' only, so the answer is negative.' };
            if (near(v, -a * a * Math.pow(b, n))) return { code: 'opposite', hint: t(b + '^{-' + n + '}=\\frac{1}{' + b + '^{' + n + '}}') + ' — it divides, it doesn’t multiply.' };
            return null;
          }, t(tex + '=-' + a * a + '\\times\\frac{1}{' + Math.pow(b, n) + '}=' + frTex(val)) + '. (The exponent ' + t('2') + ' is on ' + t(a) + ' only.)', [H.sign, H.eval], tex, { bad: [frTex(R(a * a, Math.pow(b, n))), String(-a * a * Math.pow(b, n))] });
        } },
        { id: '5d', level: 'LIM', make: function (r) {
          var d = r.pick(['6.2', '3.7', '8.4', '2.5', '9.1', '4.6', '1.3', '7.5']), tex = '(-' + d + ')^{0}';
          return exP(t(tex), [1, 1], function (v) {
            if (near(v, -1)) return { code: 'sign', hint: 'The brackets make the whole number ' + t('-' + d) + ' the base, and any nonzero base to the power ' + t('0') + ' is ' + t('1') + '.' };
            if (near(v, 0)) return { code: 'zero-power', hint: 'Any nonzero number to the power ' + t('0') + ' is ' + t('1') + ', not ' + t('0') + '.' };
            return null;
          }, 'Any nonzero base to the power ' + t('0') + ' is ' + t('1') + ', and here the base is ' + t('-' + d) + ': ' + t(tex + '=1') + '.', ['What is any nonzero number to the power ' + t('0') + '?'], tex, { bad: ['-1', '0'] });
        } },
        { id: '5e', level: 'EMG', make: function (r) {
          var d = r.pick(['2.7', '3.4', '5.8', '1.9', '4.2']), n = r.int(2, 5), val = n % 2 ? -1 : 1, tex = '\\left[-(' + d + ')^{0}\\right]^{-' + n + '}';
          return exP(t(tex), [val, 1], function (v) {
            if (near(v, 0)) return { code: 'zero-power', hint: t('(' + d + ')^{0}=1') + ', not ' + t('0') + '. So the bracket is ' + t('-1') + '.' };
            if (near(v, -val)) return { code: 'sign', hint: 'The bracket is ' + t('-1') + '. ' + (n % 2 ? 'An odd power of ' + t('-1') + ' is ' + t('-1') + '.' : 'An even power of ' + t('-1') + ' is ' + t('1') + '.') };
            return null;
          }, 'First ' + t('(' + d + ')^{0}=1') + ', so the bracket is ' + t('-1') + '. Then ' + t('(-1)^{-' + n + '}=\\frac{1}{(-1)^{' + n + '}}=\\frac{1}{' + val + '}=' + val) + '.', ['Work from the inside out: what is ' + t('(' + d + ')^{0}') + '?', H.sign], tex, { bad: [String(-val), '0'] });
        } }] },
      { num: '6', stem: 'Use a calculator to find the exact value of the following. (For a negative exponent use the negative key, put a negative base in brackets, and use ▶Frac for an exact fraction.)', parts: [
        { id: '6a', level: 'BEG', make: function (r) {
          var c = r.pick([[3, 5], [3, 5], [2, 6], [2, 7], [3, 4], [4, 4], [2, 9], [5, 3], [4, 5]]), b = c[0], n = c[1], val = R(-1, Math.pow(b, n)), tex = '-' + b + '^{-' + n + '}';
          return exP(t(tex), val, function (v) { if (near(v, -val[0] / val[1])) return { code: 'neg-base', hint: 'The exponent is on ' + t(b) + ' only; the minus sign is applied last, so the answer is negative.' }; return null; },
            t(tex + '=-\\frac{1}{' + b + '^{' + n + '}}=' + frTex(val)) + '.', [H.sign, 'Enter it as (−) ' + b + ' ^ (−) ' + n + ', then MATH ▶Frac.'], tex, { bad: [frTex(R(1, Math.pow(b, n))), String(-Math.pow(b, n))] });
        } },
        { id: '6b', level: 'BEG', make: function (r) {
          var c = r.pick([[6, 3], [6, 3], [4, 3], [5, 3], [3, 5], [2, 7], [7, 3], [8, 3], [9, 3], [2, 5]]), b = c[0], n = c[1], val = R(-1, Math.pow(b, n)), tex = '(-' + b + ')^{-' + n + '}';
          return exP(t(tex), val, function (v) { if (near(v, -val[0] / val[1])) return { code: 'odd-neg', hint: 'The base ' + t('-' + b) + ' is negative and ' + t(n) + ' is odd, so the answer is negative. On the calculator, put ' + t('-' + b) + ' in brackets.' }; return null; },
            t(tex + '=\\frac{1}{(-' + b + ')^{' + n + '}}=\\frac{1}{-' + F(Math.pow(b, n)) + '}=' + frTex(val)) + '.', [H.sign], tex, { bad: [frTex(R(1, Math.pow(b, n)))] });
        } },
        { id: '6c', level: 'BEG', make: function (r) {
          var c = r.pick([['0.5', 3], ['0.5', 3], ['0.5', 4], ['0.5', 5], ['0.25', 2], ['0.25', 3], ['0.2', 2], ['0.2', 3], ['0.1', 3]]), d = c[0], n = c[1], v = Math.round(Math.pow(1 / Number(d), n)), tex = '(' + d + ')^{-' + n + '}';
          return exP(t(tex), [v, 1], function (x) { if (near(x, 1 / v)) return { code: 'not-flipped', hint: 'That’s ' + t('(' + d + ')^{' + n + '}') + '. The negative exponent means ' + t('1\\div(' + d + ')^{' + n + '}') + '.' }; return null; },
            t(tex + '=\\frac{1}{(' + d + ')^{' + n + '}}=\\frac{1}{' + (1 / v).toString() + '}=' + F(v)) + '.', [H.neg], tex, { bad: [(1 / v).toString(), String(-v)] });
        } },
        { id: '6d', level: 'EMG', make: function (r) {
          var c = r.pick([['0.02', 2], ['0.02', 2], ['0.05', 2], ['0.04', 2], ['0.25', 2], ['0.5', 4], ['0.2', 4]]), d = c[0], n = c[1], v = Math.round(Math.pow(1 / Number(d), n)), tex = '(-' + d + ')^{-' + n + '}';
          return exP(t(tex), [v, 1], function (x) {
            if (near(x, -v)) return { code: 'even-neg', hint: 'The base ' + t('-' + d) + ' is in brackets and the power is even, so the answer is positive.' };
            if (near(Math.abs(x), 1 / v)) return { code: 'not-flipped', hint: 'That’s ' + t('(-' + d + ')^{' + n + '}') + '. The negative exponent means 1 divided by that.' };
            return null;
          }, t(tex + '=\\frac{1}{(-' + d + ')^{' + n + '}}=\\frac{1}{' + Number((1 / v).toPrecision(6)) + '}=' + F(v)) + ' (even power, so positive).', [H.sign, H.neg], tex, { bad: [String(-v)] });
        } },
        { id: '6e', level: 'BEG', make: function (r) { var pq = r.pick([[3, 8], [3, 8], [2, 7], [4, 9], [5, 7], [2, 9], [5, 6], [3, 7], [7, 9]]); if (r.chance(0.3)) pq = [pq[1], pq[0]]; return fracBasePart(pq[0], pq[1], 3); } }] },
      { num: '7', stem: 'State whether the following are true or false.', parts: [
        { id: '7a', level: 'BEG', make: function (r) { return coefTF(r, r.pick(['x', 'x', 'a', 'm', 'y']), r.int(2, 9), r.int(2, 9), r.chance(0.5)); } },
        { id: '7b', level: 'BEG', make: function (r) { return coefTF(r, r.pick(['a', 'a', 'b', 'k', 'x']), r.int(2, 9), r.int(2, 9), r.chance(0.5)); } },
        { id: '7c', level: 'LIM', make: function (r) {
          var x = r.pick(['c', 'c', 'a', 'p', 'y']), k = r.int(2, 9), n = r.int(2, 9), lhs = '\\dfrac{' + k + '}{' + vt(x, -n) + '}';
          return tfP(r, lhs, k + vt(x, n), '\\dfrac{' + k + '}{' + vt(x, n) + '}', r.chance(0.5), t(vt(x, -n)) + ' is in the denominator with a negative exponent, so it moves up; the ' + t(k) + ' stays on top.', 'T/F ' + k + '/' + x + '^-' + n);
        } },
        { id: '7d', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'x', 'b', 'm', 'y']), k = r.int(2, 9), n = r.int(2, 9), lhs = '\\dfrac{' + vt(x, -n) + '}{' + k + '}';
          return tfP(r, lhs, '\\dfrac{1}{' + k + vt(x, n) + '}', '\\dfrac{' + k + '}{' + vt(x, n) + '}', r.chance(0.5), 'Only ' + t(vt(x, -n)) + ' moves: it goes down to join the ' + t(k) + ', which was already in the denominator.', 'T/F ' + x + '^-' + n + '/' + k);
        } },
        { id: '7e', level: 'BEG', make: function (r) {
          var x = r.pick(['y', 'y', 'a', 'n', 'x']), k = r.int(2, 9), n = r.pick([1, 1, 2, 3]), lhs = '\\dfrac{1}{' + k + vt(x, -n) + '}';
          return tfP(r, lhs, '\\dfrac{' + vt(x, n) + '}{' + k + '}', k + vt(x, n), r.chance(0.5), 'Only ' + t(vt(x, -n)) + ' moves up; the ' + t(k) + ' has no negative exponent, so it stays in the denominator.', 'T/F 1/(' + k + x + '^-' + n + ')');
        } },
        { id: '7f', level: 'EMG', make: function (r) {
          var x = r.pick(['p', 'p', 'a', 'm', 'x']), k = r.int(2, 9), lhs = '\\dfrac{1}{\\frac{1}{' + k + '}' + x + '}';
          return tfP(r, lhs, k + x + '^{-1}', '\\dfrac{1}{' + k + '}' + x + '^{-1}', r.chance(0.5), t('\\frac{1}{\\frac{1}{' + k + '}' + x + '}=\\frac{1}{' + x + '/' + k + '}=\\frac{' + k + '}{' + x + '}') + ', and ' + t('\\frac{' + k + '}{' + x + '}=' + k + x + '^{-1}') + '.', 'T/F 1/((1/' + k + ')' + x + ')');
        } },
        { id: '7g', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'y']), k = r.int(2, 5), n = r.int(2, 5), lhs = '(' + k + x + ')^{' + n + '}';
          return tfP(r, lhs, '\\dfrac{1}{(' + k + x + ')^{-' + n + '}}', '\\dfrac{1}{' + k + x + '^{-' + n + '}}', r.chance(0.5), 'The whole bracket ' + t('(' + k + x + ')') + ' carries the exponent, and ' + t('\\frac{1}{(' + k + x + ')^{-' + n + '}}=(' + k + x + ')^{' + n + '}') + '. (Without the bracket, ' + t('\\frac{1}{' + k + x + '^{-' + n + '}}=\\frac{' + vt(x, n) + '}{' + k + '}') + '.)', 'T/F (' + k + x + ')^' + n);
        } },
        { id: '7h', level: 'EMG', make: function (r) {
          var x = r.pick(['a', 'a', 'b', 'x']), k = r.int(2, 9), n = k <= 5 ? r.pick([2, 2, 3]) : 2, kn = Math.pow(k, n), lhs = '\\dfrac{1}{\\left(\\frac{1}{' + k + '}' + x + '\\right)^{-' + n + '}}';
          return tfP(r, lhs, '\\dfrac{' + vt(x, n) + '}{' + kn + '}', kn + vt(x, n), r.chance(0.5), t('\\frac{1}{\\left(\\frac{1}{' + k + '}' + x + '\\right)^{-' + n + '}}=\\left(\\frac{1}{' + k + '}' + x + '\\right)^{' + n + '}=\\frac{' + vt(x, n) + '}{' + kn + '}') + ' — the ' + t('\\frac{1}{' + k + '}') + ' is raised to the power, it doesn’t flip.', 'T/F 1/((1/' + k + ')' + x + ')^-' + n);
        } }] },
      { num: '8', section: 'Part B — Simplifying algebraic expressions', stem: 'Simplify and write the answer with positive exponents.', parts: [
        { id: '8a', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'k', 'n', 'y']), a = r.int(3, 10), b = r.int(1, a - 1), m = tmono(1, [[x, a - b]]);
          return X(t(vt(x, a) + '\\cdot ' + vt(x, -b)), m, t(vt(x, a) + '\\cdot ' + vt(x, -b) + '=' + x + '^{' + a + '+(-' + b + ')}=' + vt(x, a - b)) + '.', [H.laws], x + '^' + a + '·' + x + '^-' + b, { bad: [vt(x, a + b), '\\frac{1}{' + vt(x, a * b) + '}'] });
        } },
        { id: '8b', level: 'BEG', make: function (r) {
          var x = r.pick(['m', 'm', 'a', 'p', 'y']), a = r.int(1, 7), b = r.int(a + 2, 12), m = tmono(1, [[x, a - b]]);
          return X(t(vt(x, a) + '\\div ' + vt(x, b)), m, t(vt(x, a) + '\\div ' + vt(x, b) + '=' + x + '^{' + a + '-' + b + '}=' + vt(x, a - b) + '=' + pT(m)) + '.', [H.laws, H.neg], x + '^' + a + '÷' + x + '^' + b, { bad: [vt(x, b - a), '-' + vt(x, b - a)] });
        } },
        { id: '8c', level: 'BEG', make: function (r) {
          var x = r.pick(['b', 'b', 'c', 'n', 'x']), a = r.int(1, 6), b = r.int(1, 6), m = tmono(1, [[x, -a - b]]);
          return X(t(vt(x, -a) + '\\cdot ' + vt(x, -b)), m, t(vt(x, -a) + '\\cdot ' + vt(x, -b) + '=' + x + '^{-' + a + '+(-' + b + ')}=' + vt(x, -a - b) + '=' + pT(m)) + '.', [H.laws, H.neg], x + '^-' + a + '·' + x + '^-' + b, { bad: [vt(x, a + b)] });
        } },
        { id: '8d', level: 'EMG', make: function (r) {
          var x = r.pick(['w', 'w', 'a', 'k', 'y']), n = r.int(2, 9), m = tmono(-1, [[x, -n]]);
          return X(t('-' + x + '^{0}\\div ' + vt(x, n)), m, t(x + '^{0}=1') + ', so ' + t('-' + x + '^{0}=-1') + ' (the exponent ' + t('0') + ' is on ' + t(x) + ' only). Then ' + t('-1\\div ' + vt(x, n) + '=' + pT(m)) + '.', ['The exponent ' + t('0') + ' belongs to ' + t(x) + ' only, not to the minus sign.', H.neg], '-' + x + '^0÷' + x + '^' + n,
            { bad: ['\\frac{1}{' + vt(x, n) + '}', '0'], diag: function (an, ast, c) { if (an.coef && an.coef[0] === 0) return { code: 'zero-power', hint: t(x + '^{0}=1') + ', not ' + t('0') + '.' }; if (c && c.same && c.coefNeg) return { code: 'neg-zero', hint: t('-' + x + '^{0}') + ' means ' + t('-(' + x + '^{0})=-1') + ': the minus sign stays.' }; return null; } });
        } }] },
      { num: '9', stem: 'Simplify and write the answer with positive exponents.', parts: [
        { id: '9a', level: 'BEG', make: function (r) {
          var x = r.pick(['a', 'a', 'b', 'm', 'x']), a = r.int(1, 8), b = r.int(a + 1, 12), m = tmono(1, [[x, a - b]]);
          return X(t(vt(x, a) + '\\times ' + vt(x, -b)), m, t(vt(x, a) + '\\times ' + vt(x, -b) + '=' + x + '^{' + a + '-' + b + '}=' + vt(x, a - b) + '=' + pT(m)) + '.', [H.laws, H.neg], x + '^' + a + '×' + x + '^-' + b, { bad: [vt(x, b - a)] });
        } },
        { id: '9b', level: 'EMG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'y', 'n']), c2 = r.int(2, 6), k = r.int(2, 5), a = r.int(1, 6), b = r.int(1, 6), m = tmono(k, [[x, a + b]]);
          var tex = (c2 * k) + vt(x, a) + '\\div ' + c2 + vt(x, -b);
          return X(t(tex), m, 'Divide the coefficients and subtract the exponents: ' + t(tex + '=' + k + x + '^{' + a + '-(-' + b + ')}=' + pT(m)) + '.', [H.coef, 'Subtracting a negative: ' + t(a + '-(-' + b + ')=' + (a + b)) + '.'], tex,
            { bad: a !== b ? [pT(tmono(k, [[x, a - b]]))] : [] });
        } },
        { id: '9c', level: 'EMG', make: function (r) {
          var y = r.pick(['y', 'y', 'b', 'k', 'x']), c2 = r.int(2, 6), k = r.int(2, 5), b = r.int(1, 6), a = r.int(b + 1, 9), m = tmono(k, [[y, b - a]]);
          var tex = '\\dfrac{' + (c2 * k) + vt(y, -a) + '}{' + c2 + vt(y, -b) + '}';
          return X(t(tex), m, t(tex + '=' + k + y + '^{-' + a + '-(-' + b + ')}=' + k + vt(y, b - a) + '=' + pT(m)) + '.', [H.coef, H.neg], (c2 * k) + y + '^-' + a + '/' + c2 + y + '^-' + b,
            { bad: [pT(tmono(k, [[y, -a - b]])), k + vt(y, a - b)] });
        } },
        { id: '9d', level: 'EMG', make: function (r) {
          var L = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q']]), c = r.int(2, 5), k = r.int(2, 4), a = r.int(2, 8), b = r.int(2, 8), m = tmono([1, k], [[L[0], -a], [L[1], -b]]);
          var tex = '\\dfrac{' + c + vt(L[0], -a) + '}{' + (c * k) + vt(L[1], b) + '}';
          return X(t(tex), m, t('\\frac{' + c + '}{' + c * k + '}=\\frac{1}{' + k + '}') + ', and ' + t(vt(L[0], -a)) + ' moves to the denominator: ' + t(tex + '=\\frac{1}{' + k + '}' + vt(L[0], -a) + vt(L[1], -b) + '=' + pT(m)) + '.', [H.coef, H.move], tex,
            { bad: ['\\frac{' + k + '}{' + vt(L[0], a) + vt(L[1], b) + '}', '\\frac{' + vt(L[0], a) + '}{' + k + vt(L[1], b) + '}'] });
        } },
        { id: '9e', level: 'BEG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'y', 't']), k = r.int(2, 12), n = r.int(2, 9), m = tmono(-k, [[x, -n]]);
          return X(t('-' + k + vt(x, -n)), m, 'The ' + t('-' + k) + ' is a coefficient; only ' + t(vt(x, -n)) + ' moves down: ' + t('-' + k + vt(x, -n) + '=' + pT(m)) + '.', [H.only], '-' + k + x + '^-' + n,
            { bad: ['-\\frac{1}{' + k + vt(x, n) + '}', '\\frac{' + k + '}{' + vt(x, n) + '}'] });
        } },
        { id: '9f', level: 'EMG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'y']), k = r.int(2, 9), m = tmono(R(-1, k * k), [[x, -2]]);
          return X(t('-(' + k + x + ')^{-2}'), m, 'The exponent is on the bracket ' + t('(' + k + x + ')') + '; the minus sign is applied last: ' + t('-(' + k + x + ')^{-2}=-\\frac{1}{(' + k + x + ')^{2}}=' + pT(m)) + '.', [H.only, H.sign], '-(' + k + x + ')^-2',
            { bad: ['-\\frac{1}{' + k + x + '^{2}}', '\\frac{1}{' + k * k + x + '^{2}}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs([-1, k])) return { code: 'coef-not-raised', hint: 'The exponent is on the whole bracket, so ' + t(k) + ' is squared too: ' + t('(' + k + x + ')^{2}=' + k * k + x + '^{2}') + '.' }; return null; } });
        } },
        { id: '9g', level: 'EMG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'y']), k = r.int(2, 9), m = tmono(R(1, k * k), [[x, -2]]);
          return X(t('(-' + k + x + ')^{-2}'), m, 'The whole base ' + t('-' + k + x) + ' is squared, and an even power is positive: ' + t('(-' + k + x + ')^{-2}=\\frac{1}{(-' + k + x + ')^{2}}=' + pT(m)) + '.', [H.sign], '(-' + k + x + ')^-2',
            { bad: ['-\\frac{1}{' + k * k + x + '^{2}}', '\\frac{1}{' + k + x + '^{2}}'], diag: function (an, ast, c) { if (c && c.same && (c.coefIs([1, k]) || c.coefIs([-1, k]))) return { code: 'coef-not-raised', hint: 'The exponent is on the whole bracket, so ' + t('-' + k) + ' is squared too.' }; return null; } });
        } },
        { id: '9h', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), x = r.pick(['x', 'x', 'a', 'y']), val = R(-1, k * k * k), tex = '\\dfrac{(-' + k + x + ')^{-2}}{-' + k + x + '^{-2}}';
          return exP(t(tex), val, function (v) {
            if (near(v, 1 / (k * k * k))) return { code: 'sign', hint: 'The top is positive (even power) but the bottom, ' + t('-' + k + x + '^{-2}') + ', is negative.' };
            if (near(Math.abs(v), 1 / (k * k * k * k)) || near(Math.abs(v), 1 / (k * k))) return { code: 'coef-not-raised', hint: 'Check the numbers: ' + t('(-' + k + x + ')^{-2}=\\frac{1}{' + k * k + x + '^{2}}') + ' and ' + t('-' + k + x + '^{-2}=-\\frac{' + k + '}{' + x + '^{2}}') + ' (the exponent there is on ' + t(x) + ' only).' };
            return null;
          }, t('(-' + k + x + ')^{-2}=\\frac{1}{' + k * k + x + '^{2}}') + ' and ' + t('-' + k + x + '^{-2}=-\\frac{' + k + '}{' + x + '^{2}}') + '.<br>' + t('\\frac{1}{' + k * k + x + '^{2}}\\div\\left(-\\frac{' + k + '}{' + x + '^{2}}\\right)=\\frac{1}{' + k * k + x + '^{2}}\\times\\left(-\\frac{' + x + '^{2}}{' + k + '}\\right)=' + frTex(val)) + '. (The ' + t(x) + '’s cancel.)',
            [H.only, H.sign], tex, { bad: [frTex(R(1, k * k * k)), frTex(R(-1, k * k * k * k))] });
        } }] },
      { num: '10', stem: 'Simplify each expression, writing the answer with positive exponents.', parts: [
        { id: '10a', level: 'BEG', make: function (r) {
          var x = r.pick(['a', 'a', 'b', 'x', 'm']), a = r.int(2, 6), b = r.int(2, 6), m = tmono(1, [[x, -a - b]]);
          return X(t(vt(x, -a) + vt(x, -b)), m, t(vt(x, -a) + vt(x, -b) + '=' + x + '^{-' + a + '-' + b + '}=' + vt(x, -a - b) + '=' + pT(m)) + '.', [H.laws, H.neg], x + '^-' + a + x + '^-' + b, { bad: [vt(x, a + b)].concat(a * b !== a + b ? ['\\frac{1}{' + vt(x, a * b) + '}'] : []) });
        } },
        { id: '10b', level: 'EMG', make: function (r) {
          var x = r.pick(['b', 'b', 'a', 'x', 'y']), c1 = r.int(2, 6), c2 = -r.int(2, 9), e = pickWhere(function () { return [r.int(2, 8), r.int(1, 10), r.int(2, 8), r.int(1, 10)]; }, function (e) { var s = e[0] - e[1] + e[2] - e[3]; return s <= -3 && s >= -15 && e[0] !== e[1] && e[2] !== e[3]; });
          var s = e[0] - e[1] + e[2] - e[3], m = tmono(c1 * c2, [[x, s]]), tex = '(' + tt(c1, [[x, e[0]], [x, -e[1]]]) + ')(' + tt(c2, [[x, e[2]], [x, -e[3]]]) + ')';
          return X(t(tex), m, 'Coefficients: ' + t(c1 + '\\times(' + c2 + ')=' + c1 * c2) + '. Exponents: ' + t(e[0] + '-' + e[1] + '+' + e[2] + '-' + e[3] + '=' + s) + '.<br>' + t(fin(m)) + '.', [H.coef, H.neg], tex,
            { bad: [pT(tmono(-c1 * c2, [[x, s]])), pT(tmono(c1 * c2, [[x, -s]]))] });
        } },
        { id: '10c', level: 'EMG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'n', 'y']), c = -r.int(2, 9), e = pickWhere(function () { return [r.int(2, 9), r.int(1, 9), r.int(2, 9), r.int(1, 9)]; }, function (e) { var s = e[0] - e[1] + e[2] - e[3]; return s <= -1 && s >= -3 && e[0] !== e[1] && e[2] !== e[3]; });
          var s = e[0] - e[1] + e[2] - e[3], m = tmono(c, [[x, s]]), tex = '(' + tt(c, [[x, e[0]], [x, -e[1]]]) + ')(' + tt(1, [[x, e[2]], [x, -e[3]]]) + ')';
          return X(t(tex), m, 'Coefficient: ' + t(c) + '. Exponents: ' + t(e[0] + '-' + e[1] + '+' + e[2] + '-' + e[3] + '=' + s) + '.<br>' + t(fin(m)) + '.', [H.coef, H.neg], tex,
            { bad: [pT(tmono(-c, [[x, s]])), pT(tmono(c, [[x, -s]]))] });
        } },
        { id: '10d', level: 'PRG', make: function (r) {
          var x = r.pick(['a', 'a', 'x', 'm']), k = r.pick([3, 3, 2]), c = k === 3 ? r.pick([6, 6, 9, 12, 18]) : r.pick([2, 4, 6]), e = r.int(1, 3), n = 3 * e + r.int(2, 12);
          var inner = mp(tmono(-k, [[x, e]]), -3), m = mm(inner, tmono(c, [[x, n]])), tex = '(' + tt(-k, [[x, e]]) + ')^{-3}\\cdot ' + tt(c, [[x, n]]);
          return X(t(tex), m, t('(' + tt(-k, [[x, e]]) + ')^{-3}=\\frac{1}{(' + tt(-k, [[x, e]]) + ')^{3}}=\\frac{1}{' + tt(-k * k * k, [[x, 3 * e]]) + '}=' + pT(inner)) + '.<br>' + t(pT(inner) + '\\times ' + tt(c, [[x, n]]) + '=-\\frac{' + c + vt(x, n) + '}{' + k * k * k + vt(x, 3 * e) + '}=' + pT(m)) + '.',
            [H.only, H.sign, H.coef], tex, { bad: [pT(mm(mp(tmono(k, [[x, e]]), -3), tmono(c, [[x, n]]))), pT(tmono(R(-c, k), [[x, n - 3 * e]]))],
              diag: function (an, ast, cc) { if (cc && cc.same && (cc.coefIs(R(-c, k)) || cc.coefIs(R(c, k)))) return { code: 'coef-not-raised', hint: 'The power ' + t('-3') + ' applies to the ' + t('-' + k) + ' as well: ' + t('(-' + k + ')^{3}=-' + k * k * k) + '.' }; return null; } });
        } },
        { id: '10e', level: 'EMG', make: function (r) {
          var L = r.pick([['a', 'b'], ['a', 'b'], ['x', 'y'], ['m', 'n']]), k = r.int(2, 6), c2 = r.int(2, 6), a = r.int(2, 9), p = r.int(1, 6), q = r.int(1, 6);
          var m = tmono(-k, [[L[1], -p - q]]), tex = '\\dfrac{' + tt(k * c2, [[L[0], a], [L[1], -p]]) + '}{' + tt(-c2, [[L[0], a], [L[1], q]]) + '}';
          return X(t(tex), m, 'Coefficients: ' + t('\\frac{' + k * c2 + '}{-' + c2 + '}=-' + k) + '. ' + t(L[0]) + ': ' + t(a + '-' + a + '=0') + ' (it cancels). ' + t(L[1]) + ': ' + t('-' + p + '-' + q + '=' + (-p - q)) + '.<br>' + t(fin(m)) + '.', [H.coef, H.neg], tex,
            { vars: [L[0]], bad: [pT(tmono(k, [[L[1], -p - q]])), p !== q ? pT(tmono(-k, [[L[1], q - p]])) : pT(tmono(-k, [[L[1], p + q]]))] });
        } },
        { id: '10f', level: 'PRG', make: function (r) {
          var k = r.pick([2, 2, 3, 4]), a = r.int(1, 5), b = r.int(1, 5), m = tmono(R(1, k * k), [['a', -2 * a], ['b', 2 * b]]), tex = '(' + tt(-k, [['a', a], ['b', -b], ['c', 0]]) + ')^{-2}';
          return X(t(tex), m, t('c^{0}=1') + ', so this is ' + t('(' + tt(-k, [['a', a], ['b', -b]]) + ')^{-2}=(-' + k + ')^{-2}a^{' + (-2 * a) + '}b^{' + 2 * b + '}=\\frac{1}{' + k * k + '}a^{' + (-2 * a) + '}b^{' + 2 * b + '}=' + pT(m)) + '.', [H.laws, 'Multiply every exponent inside the bracket by ' + t('-2') + ' (that includes the ' + t('-' + k) + ').'], tex,
            { vars: ['c'], bad: ['-' + pT(m), pT(tmono(k * k, [['a', -2 * a], ['b', 2 * b]]))] });
        } }] },
      { num: '11', stem: 'Simplify. Write the final answer with positive exponents.', parts: [
        { id: '11a', level: 'PRG', make: function (r) {
          var e = pickWhere(function () { return { c2: r.int(2, 6), k1: r.int(2, 5), c4: r.int(2, 4), k2: r.int(2, 4), p1: r.int(1, 6), q1: r.int(1, 5), p2: r.int(1, 7), q2: r.int(1, 4), p3: r.int(1, 5), q4: r.int(1, 6) }; },
            function (e) { return e.p1 + e.p2 - e.p3 !== 0 && -e.q1 + e.q2 + e.q4 !== 0 && e.q1 !== e.q2; });
          var n1 = [[ 'a', e.p1], ['b', -e.q1]], d1 = [['a', -e.p2], ['b', -e.q2]], f1 = md(tmono(e.c2 * e.k1, n1), tmono(e.c2, d1)), f2 = md(tmono(-e.c4 * e.k2, [['a', -e.p3]]), tmono(-e.c4, [['b', -e.q4]])), m = mm(f1, f2);
          var a1 = '\\dfrac{' + tt(e.c2 * e.k1, n1) + '}{' + tt(e.c2, d1) + '}', a2 = '\\dfrac{' + tt(-e.c4 * e.k2, [['a', -e.p3]]) + '}{' + tt(-e.c4, [['b', -e.q4]]) + '}';
          return X(t(a1 + '\\times ' + a2), m, 'Simplify each fraction, then multiply.<br>' + t(a1 + '=' + rawTex(f1)) + '<br>' + t(a2 + '=' + rawTex(f2)) + '<br>' + t(rawTex(f1) + '\\times ' + rawTex(f2) + '=' + fin(m)) + '.', [H.coef, H.laws], 'product of quotients (11a)',
            { bad: ['-' + pT(m)] });
        } },
        { id: '11b', level: 'PRG', make: function (r) {
          var e = pickWhere(function () { return { c: r.int(2, 12), e1: r.int(1, 3), e2: r.int(1, 4), n: r.pick([2, 3, 3]), d: r.int(2, 6), f1: r.int(1, 5), f2: r.int(1, 4), f3: r.int(1, 3) }; },
            function (e) { return -e.n * e.e2 + 2 * e.f2 !== 0 && e.c * e.d * e.d < 1000; });
          var num = mm(M(e.c), mp(tmono(1, [['p', e.e1], ['q', e.e2], ['r', 0]]), -e.n)), den = mp(tmono(e.d, [['p', -e.f1], ['q', e.f2], ['r', e.f3]]), -2), m = md(num, den);
          var top = e.c + '(' + tt(1, [['p', e.e1], ['q', e.e2], ['r', 0]]) + ')^{-' + e.n + '}', bot = '(' + tt(e.d, [['p', -e.f1], ['q', e.f2], ['r', e.f3]]) + ')^{-2}';
          return X(t('\\dfrac{' + top + '}{' + bot + '}'), m, 'Numerator: ' + t(top + '=' + rawTex(num)) + ' (since ' + t('r^{0}=1') + ').<br>Denominator: ' + t(bot + '=' + rawTex(den)) + '.<br>Divide (subtract exponents): ' + t(fin(m)) + '.', [H.laws, 'Raise every factor in a bracket to the outside power, including the coefficient.'], 'quotient of powers (11b)',
            { bad: [pT(md(num, mp(tmono(1, [['p', -e.f1], ['q', e.f2], ['r', e.f3]]), -2)))] });
        } },
        { id: '11c', level: 'PRG', make: function (r) {
          var k = r.pick([-2, -2, -3]), a1 = r.pick([3, 3, 6]), a2 = 2 * a1 / 3, e = pickWhere(function () { return [r.int(1, 5), -r.int(1, 6), r.int(1, 6), r.int(3, 8)]; }, function (e) { return 3 * e[3] - 2 * e[2] > 0; });
          var A = [['x', a1], ['y', e[0]], ['z', e[2]]], B = [['x', a2], ['y', e[1]], ['z', e[3]]], f1 = mp(tmono(k, A), -2), f2 = mp(tmono(k, B), 3), m = mm(f1, f2);
          var tex = '(' + tt(k, A) + ')^{-2}(' + tt(k, B) + ')^{3}';
          return X(t(tex), m, t('(' + tt(k, A) + ')^{-2}=' + rawTex(f1)) + '<br>' + t('(' + tt(k, B) + ')^{3}=' + rawTex(f2)) + '<br>Multiply (add exponents): ' + t(fin(m)) + ' (the ' + t('x') + '’s cancel exactly).', [H.laws, H.sign], 'product of powers (11c)',
            { vars: ['x'], bad: [pT(M([-m.c[0], m.c[1]], m.v)), pT(mm(mp(tmono(1, A), -2), mp(tmono(k, B), 3)))] });
        } },
        { id: '11d', level: 'ADV', make: function (r) {
          var e = { c: r.pick([6, 6, 2, 4, 10, 12]), j: r.pick([-3, -3, 3, -2]), m1: r.int(1, 4), n1: r.int(1, 4), m2: r.int(1, 4), m3: r.int(2, 6), n3: r.int(2, 6) };
          var A = tmono(e.c, [['a', e.m1], ['b', e.n1]]), B = mp(tmono(-2, [['a', -e.m2], ['b', 1]]), -3), C = mp(tmono(e.j, [['a', e.m3], ['b', -e.n3]]), -2), AB = mm(A, B), m = md(AB, C);
          var tex = '(' + tt(e.c, [['a', e.m1], ['b', e.n1]]) + ')(' + tt(-2, [['a', -e.m2], ['b', 1]]) + ')^{-3}\\div(' + tt(e.j, [['a', e.m3], ['b', -e.n3]]) + ')^{-2}';
          return X(t(tex), m, t('(' + tt(-2, [['a', -e.m2], ['b', 1]]) + ')^{-3}=' + rawTex(B)) + '<br>' + t('(' + tt(e.c, [['a', e.m1], ['b', e.n1]]) + ')\\times' + (B.c[0] < 0 ? '\\left(' + rawTex(B) + '\\right)' : rawTex(B)) + '=' + rawTex(AB)) + '<br>' + t('(' + tt(e.j, [['a', e.m3], ['b', -e.n3]]) + ')^{-2}=' + rawTex(C)) + '<br>Divide: ' + t(fin(m)) + '.',
            [H.laws, 'Work out each bracket first. ' + t('(-2)^{-3}=\\frac{1}{(-2)^{3}}=-\\frac{1}{8}') + '.'], 'mixed operations (11d)', { bad: [pT(tmono([-m.c[0], m.c[1]], m.v)), pT(tmono(m.c, { a: -m.v.a, b: -m.v.b }))] });
        } }] },
      { num: '12', section: 'Part C — Fractional bases', stem: 'Evaluate the following without using a calculator.', parts: [
        { id: '12a', level: 'EMG', make: function (r) { var pq = cop(r, 2, 7, { lt: true }); return fracBasePart(pq[0], pq[1], 2); } },
        { id: '12b', level: 'BEG', make: function (r) { var q = r.int(2, 9); return fracBasePart(1, q, q <= 4 ? r.pick([2, 2, 3]) : 2); } },
        { id: '12c', level: 'BEG', make: function (r) { var pq = cop(r, 2, 12, { gt: true }); return fracBasePart(pq[0], pq[1], 1); } },
        { id: '12d', level: 'EMG', make: function (r) { var pq = cop(r, 2, 5, { gt: true }); return fracBasePart(pq[0], pq[1], 3); } }] },
      { num: '13', stem: 'Simplify. Write the final answers with positive exponents.', parts: [
        { id: '13a', level: 'BEG', make: function (r) {
          var L = r.pick([['e', 'f'], ['e', 'f'], ['a', 'b'], ['m', 'n'], ['x', 'y'], ['p', 'q']]), n = r.int(2, 5), m = tmono(1, [[L[0], -n], [L[1], n]]), tex = '\\left(\\dfrac{' + L[0] + '}{' + L[1] + '}\\right)^{-' + n + '}';
          return X(t(tex), m, 'Flip the fraction and make the exponent positive: ' + t(tex + '=\\left(\\frac{' + L[1] + '}{' + L[0] + '}\\right)^{' + n + '}=' + pT(m)) + '.', [H.flip], '(' + L.join('/') + ')^-' + n, { bad: ['\\frac{' + vt(L[0], n) + '}{' + vt(L[1], n) + '}'] });
        } },
        { id: '13b', level: 'EMG', make: function (r) {
          var x = r.pick(['x', 'x', 'a', 'y', 'm']), k = r.int(2, 6), n = k <= 5 ? r.pick([2, 3, 3]) : 2, m = tmono(Math.pow(k, n), [[x, -n]]), tex = '\\left(\\dfrac{' + x + '}{' + k + '}\\right)^{-' + n + '}';
          return X(t(tex), m, t(tex + '=\\left(\\frac{' + k + '}{' + x + '}\\right)^{' + n + '}=\\frac{' + k + '^{' + n + '}}{' + vt(x, n) + '}=' + pT(m)) + '.', [H.flip, 'The number is raised to the power too.'], '(' + x + '/' + k + ')^-' + n,
            { bad: ['\\frac{' + k + '}{' + vt(x, n) + '}', '\\frac{' + vt(x, n) + '}{' + Math.pow(k, n) + '}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs(k)) return { code: 'coef-not-raised', hint: 'Good flip — but the ' + t(k) + ' is raised to the power ' + t(n) + ' as well.' }; return null; } });
        } },
        { id: '13c', level: 'EMG', make: function (r) {
          var L = r.pick([['p', 'r'], ['p', 'r'], ['a', 'b'], ['x', 'y'], ['m', 'n']]), a = r.int(2, 4), b = r.pick([a, a, r.int(2, 4)]), n = r.int(2, 4), m = tmono(1, [[L[0], -a * n], [L[1], b * n]]), tex = '\\left(\\dfrac{' + vt(L[0], a) + '}{' + vt(L[1], b) + '}\\right)^{-' + n + '}';
          return X(t(tex), m, t(tex + '=\\left(\\frac{' + vt(L[1], b) + '}{' + vt(L[0], a) + '}\\right)^{' + n + '}=' + pT(m)) + '.', [H.flip, 'Power of a power: multiply the exponents.'], tex,
            { bad: ['\\frac{' + vt(L[0], a * n) + '}{' + vt(L[1], b * n) + '}'].concat(a * n !== a + n || b * n !== b + n ? ['\\frac{' + vt(L[1], b + n) + '}{' + vt(L[0], a + n) + '}'] : []), diag: function (an) { var y = an.vars[L[1]]; if (y && y[0] / y[1] === b + n) return { code: 'add-exp', hint: 'Power of a power: <b>multiply</b> the exponents, ' + t(b + '\\times ' + n) + '.' }; return null; } });
        } },
        { id: '13d', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), b = r.int(2, 5), n = r.int(2, 3), m = tmono(1, [['a', a * n], ['b', -b * n]]), tex = '\\left(\\dfrac{a^{-' + a + '}}{b^{-' + b + '}}\\right)^{-' + n + '}';
          return X(t(tex), m, 'Multiply each exponent inside by ' + t('-' + n) + ': ' + t('a^{(-' + a + ')(-' + n + ')}=' + vt('a', a * n)) + ', ' + t('b^{(-' + b + ')(-' + n + ')}=' + vt('b', b * n)) + ' (still in the denominator).<br>' + t(tex + '=' + pT(m)) + '.', [H.laws, 'Negative times negative is positive.'], tex,
            { bad: ['\\frac{' + vt('b', b * n) + '}{' + vt('a', a * n) + '}', vt('a', a * n) + vt('b', b * n)] });
        } },
        { id: '13e', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), c2 = r.int(2, 6), a = r.int(1, 6), b = r.int(1, 7), inner = md(tmono(-k * c2, [['x', -a]]), tmono(c2, [['y', -b]])), m = mp(inner, -1);
          var tex = '\\left(\\dfrac{' + tt(-k * c2, [['x', -a]]) + '}{' + tt(c2, [['y', -b]]) + '}\\right)^{-1}';
          return X(t(tex), m, 'First simplify inside: ' + t('\\frac{' + tt(-k * c2, [['x', -a]]) + '}{' + tt(c2, [['y', -b]]) + '}=' + rawTex(inner)) + '.<br>Then ' + t('(' + rawTex(inner) + ')^{-1}=(-' + k + ')^{-1}' + vt('x', a) + vt('y', -b) + '=' + pT(m)) + '.', [H.laws, H.flip], tex,
            { bad: [pT(inner), pT(tmono(R(1, k), [['x', a], ['y', -b]]))] });
        } },
        { id: '13f', level: 'PRG', make: function (r) {
          var pq = cop(r, 2, 5), g = r.pick([2, 3, 3]), a = r.int(1, 4), b = r.int(1, 5), c = r.int(1, 4), d = r.int(1, 5);
          var N = [['x', a], ['y', -b]], D = [['x', -c], ['y', d]], inner = md(tmono(pq[0] * g, N), tmono(-pq[1] * g, D)), m = mp(inner, -2);
          var tex = '\\left(\\dfrac{' + tt(pq[0] * g, N) + '}{' + tt(-pq[1] * g, D) + '}\\right)^{-2}';
          return X(t(tex), m, 'First simplify inside: ' + t('\\frac{' + tt(pq[0] * g, N) + '}{' + tt(-pq[1] * g, D) + '}=' + rawTex(inner)) + '.<br>Then ' + t('\\left(' + rawTex(inner) + '\\right)^{-2}=\\left(-\\frac{' + pq[0] + '}{' + pq[1] + '}\\right)^{-2}' + vt('x', m.v.x) + vt('y', m.v.y) + '=' + fin(m)) + ' (the even power removes the negative sign).', [H.laws, H.flip, H.sign], tex,
            { bad: ['-' + pT(m), pT(mp(tmono(R(-pq[0], pq[1]), inner.v), 2))] });
        } }] },
      { num: '14', stem: 'Simplify. Write the final answers with positive exponents.', parts: [
        { id: '14a', level: 'PRG', make: function (r) {
          var e = pickWhere(function () { return [r.int(2, 6), r.int(1, 4), r.int(2, 6), r.int(1, 5)]; }, function (e) { return e[3] !== e[0] && e[1] !== e[2]; });
          var f1 = mp(md(tmono(-1, [['x', e[0]]]), tmono(1, [['y', e[1]]])), -2), f2 = mp(md(tmono(1, [['y', e[2]]]), tmono(1, [['x', e[3]]])), 2), m = md(f1, f2);
          var tex = '\\left(\\dfrac{-' + vt('x', e[0]) + '}{' + vt('y', e[1]) + '}\\right)^{-2}\\div\\left(\\dfrac{' + vt('y', e[2]) + '}{' + vt('x', e[3]) + '}\\right)^{2}';
          return X(t(tex), m, t('\\left(\\frac{-' + vt('x', e[0]) + '}{' + vt('y', e[1]) + '}\\right)^{-2}=\\left(\\frac{' + vt('y', e[1]) + '}{-' + vt('x', e[0]) + '}\\right)^{2}=' + pT(f1)) + ' (squaring removes the sign).<br>' + t('\\left(\\frac{' + vt('y', e[2]) + '}{' + vt('x', e[3]) + '}\\right)^{2}=' + pT(f2)) + '.<br>' + t(pT(f1) + '\\times ' + pT(minv(f2)) + '=' + fin(m)) + '.', [H.flip, 'Dividing by a fraction is multiplying by its reciprocal.'], 'fractional bases (14a)',
            { bad: ['-' + pT(m), pT(mm(f1, f2))] });
        } },
        { id: '14b', level: 'ADV', make: function (r) {
          var e = pickWhere(function () { return { k: r.int(2, 5), a: r.int(1, 4), b: r.int(1, 5), c: r.int(1, 4), d: r.int(1, 3), ee: r.int(1, 3), mm: r.pick([20, 20, 6, 8, 12, 15, 24]), f: r.int(1, 6), g: r.int(1, 6), h: r.int(1, 6), i: r.int(1, 8) }; },
            function (e) { return -2 * (e.c - e.ee) - e.i !== 0 && e.c !== e.ee; });
          var inner = md(tmono(e.k, [['w', e.a], ['x', -e.b], ['z', e.c]]), tmono(1, [['w', -e.d], ['z', e.ee]])), A = mm(M(e.k * e.k), mp(inner, -2)), B = md(M(e.mm), tmono(1, [['x', -e.h], ['z', e.i]])), m = mm(A, B);
          var tex = (e.k * e.k) + '\\left(\\dfrac{' + tt(e.k, [['w', e.a], ['x', -e.b], ['z', e.c]]) + '}{' + tt(1, [['w', -e.d], ['z', e.ee]]) + '}\\right)^{-2}\\times\\dfrac{' + e.mm + '(' + tt(1, [['x', e.f], ['z', e.g]]) + ')^{0}}{' + tt(1, [['x', -e.h], ['z', e.i]]) + '}';
          return X(t(tex), m, 'Inside the big bracket: ' + t(rawTex(inner)) + '. To the power ' + t('-2') + ': ' + t(rawTex(mp(inner, -2))) + '; times ' + t(e.k * e.k) + ': ' + t(rawTex(A)) + '.<br>Second factor: ' + t('(' + tt(1, [['x', e.f], ['z', e.g]]) + ')^{0}=1') + ', so it is ' + t(rawTex(B)) + '.<br>Multiply: ' + t(fin(m)) + '.',
            [H.laws, 'Anything (nonzero) to the power ' + t('0') + ' is ' + t('1') + '.'], 'long simplification (14b)', { bad: [pT(mm(mp(inner, -2), B))] });
        } }] },
      { num: '15', section: 'Part D — Error analysis and multiple choice', stem: function (sh) {
          var L = '(' + sh.k + 'x^{-' + sh.m + '})^{-' + sh.n + '}';
          return '<i>(Identify and correct the error)</i> Sam simplified ' + t(L) + ' as shown.\\[\\begin{array}{rl}\\text{Line 1:}&' + L + '=' + sh.k + '\\cdot x^{(-' + sh.m + ')(-' + sh.n + ')}\\\\[2pt]\\text{Line 2:}&\\phantom{' + L + '}=' + sh.k + 'x^{' + sh.m * sh.n + '}\\end{array}\\]';
        },
        shared: function (r) { var k = r.pick([2, 2, 3, 4, 5]), n = k <= 3 ? r.pick([2, 2, 3]) : 2; return { k: k, m: r.int(2, 5), n: n }; },
        parts: [
          { id: '15a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, m = sh.m, n = sh.n;
            return P.mc(r, 'Which line has the error, and what is the mistake?', [
              { html: 'Line 1: the exponent ' + t('-' + n) + ' applies to every factor in the bracket, but Sam did not raise the coefficient ' + t(k) + ' to the power ' + t('-' + n) + '.', right: true },
              { html: 'Line 1: Sam should have added the exponents, ' + t('(-' + m + ')+(-' + n + ')') + ', instead of multiplying them.', why: 'Power of a power: you <b>multiply</b> the exponents, so ' + t('(-' + m + ')(-' + n + ')') + ' is right. Look at what happened to the ' + t(k) + '.' },
              { html: 'Line 2: ' + t('(-' + m + ')(-' + n + ')') + ' should be ' + t(-m * n) + ', so the answer is ' + t(k + 'x^{-' + m * n + '}') + '.', why: 'A negative times a negative is positive: ' + t('(-' + m + ')(-' + n + ')=' + m * n) + '.' },
              { html: 'There is no error: ' + t(k + 'x^{' + m * n + '}') + ' is correct.', why: 'Test ' + t('x=1') + ': ' + t('(' + k + '\\cdot 1)^{-' + n + '}=\\frac{1}{' + Math.pow(k, n) + '}') + ', but ' + t(k + '\\cdot 1^{' + m * n + '}=' + k) + '.' }],
              'The outer exponent applies to every factor inside the bracket (power of a product). In Line 1, Sam applied ' + t('-' + n) + ' to ' + t('x^{-' + m + '}') + ' but not to the coefficient ' + t(k) + '.', ['Check each factor inside the bracket: did each one get raised to the power ' + t('-' + n) + '?'], 'Sam’s error (15a)');
          } },
          { id: '15b', level: 'PRG', make: function (r, sh) {
            var k = sh.k, mx = sh.m, n = sh.n, kn = Math.pow(k, n), m = tmono(R(1, kn), [['x', mx * n]]), L = '(' + k + 'x^{-' + mx + '})^{-' + n + '}';
            var p = P.fields('Write a correct simplification with positive exponents, then check it with ' + t('x=1') + '.',
              [{ name: 'Correct simplification', before: t(L + '='), mode: 'math', keys: 'expo', vars: ['x'] }, { name: 'Check', label: 'Check with ' + t('x=1') + ':', before: t('(' + k + '\\cdot 1^{-' + mx + '})^{-' + n + '}='), mode: 'math', keys: 'expo' }],
              [K.expo(pT(m), { diag: gdiag(m, function (an, ast, c) {
                if (!c || !c.same) return null;
                if (c.coefIs(k)) return { code: 'sam', hint: 'That’s Sam’s answer. The coefficient ' + t(k) + ' must be raised to the power ' + t('-' + n) + ' as well.' };
                if (c.coefIs(kn)) return { code: 'coef-pos-power', hint: t(k + '^{-' + n + '}=\\frac{1}{' + k + '^{' + n + '}}') + ', so ' + t(kn) + ' belongs in the denominator.' };
                if (c.coefIs([1, k])) return { code: 'coef-not-raised', hint: 'Right side of the fraction bar — but ' + t(k) + ' is raised to the power ' + t(n) + ': ' + t(k + '^{-' + n + '}=\\frac{1}{' + kn + '}') + '.' };
                return null;
              }) }), exactChk([1, kn], function (v) { if (near(v, k)) return { code: 'sam', hint: 'That’s the value of Sam’s answer at ' + t('x=1') + '. Evaluate the original: ' + t('(' + k + ')^{-' + n + '}') + '.' }; return null; })],
              [pT(m), frTex(R(1, kn))], t(L + '=' + pT(m)) + '; at ' + t('x=1') + ' both sides equal ' + t(frTex(R(1, kn))) + '.',
              t(L + '=' + k + '^{-' + n + '}x^{(-' + mx + ')(-' + n + ')}=\\frac{1}{' + kn + '}x^{' + mx * n + '}=' + pT(m)) + '.<br>Check ' + t('x=1') + ': ' + t('(' + k + ')^{-' + n + '}=\\frac{1}{' + kn + '}') + ' and ' + t('\\frac{1^{' + mx * n + '}}{' + kn + '}=\\frac{1}{' + kn + '}') + ' ✓ (Sam’s ' + t(k + 'x^{' + mx * n + '}') + ' gives ' + t(k) + ').',
              ['Raise <b>every</b> factor in the bracket to the power ' + t('-' + n) + ', including ' + t(k) + '.', t(k + '^{-' + n + '}=\\frac{1}{' + k + '^{' + n + '}}') + '.'], 'correct Sam’s work (15b)');
            p.bad = [[k + 'x^{' + mx * n + '}', frTex(R(1, kn))], [kn + 'x^{' + mx * n + '}', frTex(R(1, kn))], [pT(m), String(k)]];
            return p;
          } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '16', level: 'EMG', make: function (r) {
          var a = r.int(2, 6), b = r.int(2, 9), c = r.int(3, 9), tex = '\\dfrac{1^{-' + a + '}+' + b + '^{0}}{' + c + '^{-1}}';
          return P.mc(r, 'The value of ' + t(tex) + ' is', [
            { html: t('2'), why: 'That’s the numerator only. Dividing by ' + t(c + '^{-1}') + ' is the same as multiplying by ' + t(c) + '.' },
            { html: t(c), why: 'Check the numerator: ' + t('1^{-' + a + '}=1') + ' and ' + t(b + '^{0}=1') + ', so it is ' + t('1+1=2') + '.' },
            { html: t(2 * c), right: true },
            { html: t(c * c), why: 'Check the numerator: any power of ' + t('1') + ' is ' + t('1') + ', and ' + t(b + '^{0}=1') + '. Then multiply by ' + t(c) + '.' }],
            t('1^{-' + a + '}=1') + ' (any power of ' + t('1') + ' is ' + t('1') + ') and ' + t(b + '^{0}=1') + ', so the numerator is ' + t('2') + '. Dividing by ' + t(c + '^{-1}') + ' means multiplying by ' + t(c) + ': ' + t('2\\times ' + c + '=' + 2 * c) + '.', [H.neg], 'MC value ' + tex, true);
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var k1 = r.int(2, 9), a = r.pick(['a', 'a', 'x', 'm']), n1 = r.int(2, 9), q = r.int(2, 6), c2 = r.int(2, 5), e1 = r.int(2, 6), e2 = e1 + r.int(2, 5), k3 = r.int(2, 9), b3 = r.pick(['a', 'a', 'y', 'p']);
          var tr = r.pick([-1, -1, 0, 1, 2]);
          var S = [
            { f: k1 + vt(a, -n1) + '=\\frac{1}{' + k1 + vt(a, n1) + '}', tf: k1 + vt(a, -n1) + '=\\frac{' + k1 + '}{' + vt(a, n1) + '}', why: t(k1 + vt(a, -n1) + '=\\frac{' + k1 + '}{' + vt(a, n1) + '}') + ': the ' + t(k1) + ' stays on top.' },
            { f: (q * c2) + 'x^{' + e1 + '}\\div ' + c2 + 'x^{' + e2 + '}=\\frac{1}{' + q + vt('x', e2 - e1) + '}', tf: (q * c2) + 'x^{' + e1 + '}\\div ' + c2 + 'x^{' + e2 + '}=\\frac{' + q + '}{' + vt('x', e2 - e1) + '}', why: t((q * c2) + 'x^{' + e1 + '}\\div ' + c2 + 'x^{' + e2 + '}=' + q + 'x^{' + (e1 - e2) + '}=\\frac{' + q + '}{' + vt('x', e2 - e1) + '}') + '.' },
            { f: '\\frac{1}{' + k3 + b3 + '}=' + k3 + b3 + '^{-1}', tf: '\\frac{1}{' + k3 + b3 + '}=\\frac{1}{' + k3 + '}' + b3 + '^{-1}', why: t('\\frac{1}{' + k3 + b3 + '}=\\frac{1}{' + k3 + '}' + b3 + '^{-1}') + ', not ' + t(k3 + b3 + '^{-1}=\\frac{' + k3 + '}{' + b3 + '}') + '.' }];
          var shown = S.map(function (s, i) { return i === tr ? s.tf : s.f; }), nm = ['i', 'ii', 'iii'];
          var stmt = shown.map(function (x, i) { return '<br>' + nm[i] + ')&nbsp; ' + t(x); }).join('');
          var verdict = S.map(function (s, i) { return nm[i] + ') ' + (i === tr ? '<b>true</b>: ' + t(s.tf) + '.' : '<b>false</b>: ' + s.why); }).join('<br>');
          var opts = [0, 1, 2].map(function (i) { return { html: nm[i] + ') only', right: tr === i, why: tr === i ? null : 'Check statement ' + nm[i] + ') again: ' + S[i].why }; });
          opts.push({ html: 'none of the statements are true', right: tr < 0, why: tr < 0 ? null : 'Statement ' + nm[tr] + ') is true: ' + t(S[tr].tf) + '.' });
          return P.mc(r, 'Which of the following statements are true?' + stmt, opts, verdict + '<br>Answer: <b>' + (tr < 0 ? 'none of the statements are true' : nm[tr] + ') only') + '</b>.', [H.only, H.coef], 'MC which are true', true);
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Sign or placement?', stem: function (sh) { return 'A negative exponent and a negative sign are two different things. Decide what the exponent is attached to — the whole base, or only the number after the minus sign — then evaluate exactly.'; },
        shared: function (r) { return { b: r.pick([3, 3, 2, 4, 5]) }; },
        parts: [
          { id: 'e1a', level: 'EMG', make: function (r, sh) { return signPowPart(sh.b, 2, 'neg-out'); } },
          { id: 'e1b', level: 'EMG', make: function (r, sh) { return signPowPart(sh.b, 2, 'neg-in'); } },
          { id: 'e1c', level: 'EMG', make: function (r, sh) { return signPowPart(sh.b, 3, 'neg-in'); } },
          { id: 'e1d', level: 'EMG', make: function (r, sh) { return signPowPart(sh.b, 3, 'neg-out'); } },
          { id: 'e1e', level: 'EMG', make: function (r, sh) { return signPowPart(sh.b, 2, 'neg-both'); } },
          { id: 'e1f', level: 'EMG', make: function (r, sh) {
            var b = sh.b, b2 = b * b, b3 = b * b * b;
            return P.mc(r, 'Compare your answers. Why do ' + t('(-' + b + ')^{-3}') + ' and ' + t('-' + b + '^{-3}') + ' have the same value, while ' + t('(-' + b + ')^{-2}') + ' and ' + t('-' + b + '^{-2}') + ' do not?', [
              { html: 'With the odd exponent ' + t('-3') + ', ' + t('(-' + b + ')^{-3}') + ' stays negative, just like ' + t('-' + b + '^{-3}') + '. With the even exponent ' + t('-2') + ', ' + t('(-' + b + ')^{-2}') + ' is positive but ' + t('-' + b + '^{-2}') + ' is negative.', right: true },
              { html: 'A negative exponent always makes the answer negative.', why: t('(-' + b + ')^{-2}=\\frac{1}{' + b2 + '}') + ' is positive.' },
              { html: 'Brackets never matter when the exponent is negative.', why: 'They mattered for ' + t('-2') + ': ' + t('-\\frac{1}{' + b2 + '}') + ' vs ' + t('\\frac{1}{' + b2 + '}') + '.' },
              { html: t('-' + b + '^{-2}') + ' is the reciprocal of ' + t('(-' + b + ')^{-2}') + '.', why: 'Their values are ' + t('-\\frac{1}{' + b2 + '}') + ' and ' + t('\\frac{1}{' + b2 + '}') + ': opposites, not reciprocals.' }],
              t('(-' + b + ')^{-3}=-\\frac{1}{' + b3 + '}=-' + b + '^{-3}') + ' because an odd power of a negative is negative. But ' + t('(-' + b + ')^{-2}=\\frac{1}{' + b2 + '}') + ' while ' + t('-' + b + '^{-2}=-\\frac{1}{' + b2 + '}') + ': an even power makes the bracketed negative positive.', [H.sign], 'odd vs even negative powers');
          } }] },
      { num: '2', stem: 'The same distinction with a variable factor. Write each with positive exponents.', shared: function (r) { return { k: r.pick([5, 5, 2, 3, 4, 6]), x: r.pick(['x', 'x', 'a', 'y']) }; },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, sh) { var k = sh.k, x = sh.x, m = tmono(R(-1, k * k), [[x, -2]]); return X(t('-(' + k + x + ')^{-2}'), m, 'Exponent on ' + t(k + x) + '; the minus is applied last: ' + t('-\\frac{1}{(' + k + x + ')^{2}}=' + pT(m)) + '.', [H.only, H.sign], '-(' + k + x + ')^-2', { bad: ['\\frac{1}{' + k * k + x + '^{2}}', '-\\frac{1}{' + k + x + '^{2}}'] }); } },
          { id: 'e2b', level: 'EMG', make: function (r, sh) { var k = sh.k, x = sh.x, m = tmono(R(1, k * k), [[x, -2]]); return X(t('(-' + k + x + ')^{-2}'), m, 'Exponent on the whole base ' + t('-' + k + x) + ', and the power is even: ' + t('\\frac{1}{(-' + k + x + ')^{2}}=' + pT(m)) + '.', [H.sign], '(-' + k + x + ')^-2', { bad: ['-\\frac{1}{' + k * k + x + '^{2}}'] }); } },
          { id: 'e2c', level: 'EMG', make: function (r, sh) { var k = sh.k, x = sh.x, m = tmono(R(-1, k * k * k), [[x, -3]]); return X(t('(-' + k + x + ')^{-3}'), m, 'Exponent on the whole base ' + t('-' + k + x) + ', and the power is odd: ' + t('\\frac{1}{(-' + k + x + ')^{3}}=\\frac{1}{-' + k * k * k + x + '^{3}}=' + pT(m)) + '.', [H.sign], '(-' + k + x + ')^-3', { bad: ['\\frac{1}{' + k * k * k + x + '^{3}}'] }); } },
          { id: 'e2d', level: 'BEG', make: function (r, sh) { var k = sh.k, x = sh.x, m = tmono(-k, [[x, -2]]); return X(t('-' + k + x + '^{-2}'), m, 'Only ' + t(x) + ' carries the exponent; ' + t('-' + k) + ' is a coefficient: ' + t('-' + k + '\\cdot\\frac{1}{' + x + '^{2}}=' + pT(m)) + '.', [H.only], '-' + k + x + '^-2', { bad: ['-\\frac{1}{' + k * k + x + '^{2}}', '-\\frac{1}{' + k + x + '^{2}}'] }); } },
          { id: 'e2e', level: 'PRG', make: function (r, sh) { var k = sh.k, x = sh.x, m = tmono(R(1, k * k), [[x, 2]]); return X(t('\\left(-' + k + x + '^{-1}\\right)^{-2}'), m, 'Multiply the exponents: ' + t('(-' + k + ')^{-2}' + x + '^{(-1)(-2)}=\\frac{1}{' + k * k + '}' + x + '^{2}=' + pT(m)) + '.', [H.laws, H.sign], '(-' + k + x + '^-1)^-2', { bad: [k * k + x + '^{2}', '-\\frac{' + x + '^{2}}{' + k * k + '}'] }); } }] },
      { num: '3', stem: function (sh) { return 'Students often read ' + t('x^{-3}') + ' as “the opposite of ' + t('x^{3}') + '.” Test that reading: evaluate each expression at ' + t('x=' + sh.v) + ' <b>and</b> at ' + t('x=-' + sh.v) + '.'; },
        shared: function (r) { return { v: r.pick([2, 2, 3]) }; },
        parts: [
          { id: 'e3a', level: 'BEG', make: function (r, sh) { return twoVals(sh.v, 'x^{-3}', function (x) { return R(1, x * x * x); }); } },
          { id: 'e3b', level: 'BEG', make: function (r, sh) { return twoVals(sh.v, '-x^{3}', function (x) { return R(-x * x * x, 1); }); } },
          { id: 'e3c', level: 'EMG', make: function (r, sh) { return twoVals(sh.v, '(-x)^{3}', function (x) { return R(-x * x * x, 1); }); } },
          { id: 'e3d', level: 'EMG', make: function (r, sh) { return twoVals(sh.v, '(-x)^{-3}', function (x) { return R(-1, x * x * x); }); } },
          { id: 'e3e', level: 'EMG', make: function (r, sh) {
            var v = sh.v, v3 = v * v * v;
            return P.mc(r, 'Using your table, what does a negative exponent actually do to a base?', [
              { html: 'It takes the <b>reciprocal</b>: ' + t('x^{-3}=\\frac{1}{x^{3}}') + '. The reciprocal of a number has the same sign, so the sign never changes.', right: true },
              { html: 'It makes the value negative: ' + t('x^{-3}=-x^{3}') + '.', why: 'At ' + t('x=' + v) + ', ' + t('x^{-3}=\\frac{1}{' + v3 + '}') + ' (positive) but ' + t('-x^{3}=-' + v3) + '.' },
              { html: 'It changes the sign of the base: ' + t('x^{-3}=(-x)^{3}') + '.', why: 'Compare columns (a) and (c): at ' + t('x=' + v) + ' they give ' + t('\\frac{1}{' + v3 + '}') + ' and ' + t('-' + v3) + '.' },
              { html: 'It takes the reciprocal and changes the sign: ' + t('x^{-3}=-\\frac{1}{x^{3}}') + '.', why: 'At ' + t('x=' + v) + ', ' + t('x^{-3}=\\frac{1}{' + v3 + '}') + ' is positive — no sign change.' }],
              'A negative exponent means <b>reciprocal</b>: ' + t('x^{-3}=\\frac{1}{x^{3}}') + '. The sign is decided only by the sign of the base and whether the power is odd or even, so (a) and (b) never match: at ' + t('x=' + v) + ', ' + t('\\frac{1}{' + v3 + '}\\ne -' + v3) + '.', [OPP], 'what a negative exponent does');
          } }] },
      { num: '4', stem: 'State whether each statement is true or false.', shared: function (r) { return { x: r.pick(['x', 'x', 'a', 'y']), n: r.pick([4, 4, 2, 6]), o: r.pick([5, 5, 3, 7]), k: r.int(2, 5) }; },
        parts: [
          { id: 'e4a', level: 'BEG', make: function (r, sh) { var x = sh.x, n = sh.n; return tfP(r, '-' + vt(x, -n), '-\\dfrac{1}{' + vt(x, n) + '}', '\\dfrac{1}{' + vt(x, n) + '}', r.chance(0.5), 'The exponent is on ' + t(x) + ' only; the minus sign stays in front.', 'T/F -' + x + '^-' + n); } },
          { id: 'e4b', level: 'EMG', make: function (r, sh) { var x = sh.x, n = sh.n; return tfP(r, '(-' + x + ')^{-' + n + '}', '\\dfrac{1}{' + vt(x, n) + '}', '-\\dfrac{1}{' + vt(x, n) + '}', r.chance(0.5), 'The exponent is on ' + t('-' + x) + ' and it is even, so the sign is lost: ' + t('\\frac{1}{(-' + x + ')^{' + n + '}}=\\frac{1}{' + vt(x, n) + '}') + '.', 'T/F (-' + x + ')^-' + n); } },
          { id: 'e4c', level: 'EMG', make: function (r, sh) { var x = sh.x, o = sh.o; return tfP(r, '(-' + x + ')^{-' + o + '}', '-\\dfrac{1}{' + vt(x, o) + '}', '\\dfrac{1}{' + vt(x, o) + '}', r.chance(0.5), 'The exponent is on ' + t('-' + x) + ' and it is odd, so the sign stays: ' + t('\\frac{1}{(-' + x + ')^{' + o + '}}=-\\frac{1}{' + vt(x, o) + '}') + '.', 'T/F (-' + x + ')^-' + o); } },
          { id: 'e4d', level: 'BEG', make: function (r, sh) { var x = sh.x, k = sh.k; return tfP(r, '(' + k + x + ')^{-2}', '\\dfrac{1}{' + k * k + x + '^{2}}', k + x + '^{-2}', r.chance(0.5), 'The exponent covers the whole product ' + t(k + x) + ', so the ' + t(k) + ' is squared and moves too.', 'T/F (' + k + x + ')^-2'); } },
          { id: 'e4e', level: 'BEG', make: function (r, sh) { var x = sh.x, n = sh.n, m = tmono(-1, [[x, -n]]); return X('Write the left side of (a), ' + t('-' + vt(x, -n)) + ', with positive exponents.', m, t('-' + vt(x, -n) + '=-\\frac{1}{' + vt(x, n) + '}') + ': the exponent is on ' + t(x) + ' only.', [H.only], '-' + x + '^-' + n, { bad: ['\\frac{1}{' + vt(x, n) + '}', vt(x, n)] }); } },
          { id: 'e4f', level: 'EMG', make: function (r, sh) { var x = sh.x, k = sh.k, m = tmono(R(1, k * k), [[x, -2]]); return X('Write the left side of (d), ' + t('(' + k + x + ')^{-2}') + ', with positive exponents.', m, t('(' + k + x + ')^{-2}=\\frac{1}{(' + k + x + ')^{2}}=' + pT(m)) + '.', [H.only], '(' + k + x + ')^-2', { bad: ['\\frac{' + k + '}{' + x + '^{2}}', '\\frac{1}{' + k + x + '^{2}}'] }); } }] },
      { num: '5', section: 'Extra practice B — Crossing the fraction bar', stem: 'Every expression has negative exponents in both the numerator and the denominator. Write each with positive exponents.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) {
          var e = [r.int(1, 6), r.int(1, 6), r.int(1, 6), r.int(1, 6)], m = tmono(1, [['a', -e[0]], ['b', e[1]], ['c', -e[2]], ['d', e[3]]]), tex = '\\dfrac{' + tt(1, [['a', -e[0]], ['b', e[1]]]) + '}{' + tt(1, [['c', e[2]], ['d', -e[3]]]) + '}';
          return X(t(tex), m, t(vt('a', -e[0])) + ' moves down; ' + t(vt('d', -e[3])) + ' moves up: ' + t(tex + '=' + pT(m)) + '.', [H.move], tex, { bad: [pT(tmono(1, [['a', e[0]], ['b', e[1]], ['c', -e[2]], ['d', -e[3]]]))] });
        } },
        { id: 'e5b', level: 'EMG', make: function (r) {
          var kj = cop(r, 2, 9), e = [r.int(1, 6), r.int(1, 6), r.int(1, 6), r.int(1, 4)], m = tmono(R(kj[0], kj[1]), [['m', -e[0]], ['n', e[1]], ['p', -e[2]], ['q', e[3]]]);
          var tex = '\\dfrac{' + tt(kj[0], [['m', -e[0]], ['n', e[1]]]) + '}{' + tt(kj[1], [['p', e[2]], ['q', -e[3]]]) + '}';
          return X(t(tex), m, t(vt('m', -e[0])) + ' moves down; ' + t(vt('q', -e[3])) + ' moves up; ' + t(kj[0]) + ' and ' + t(kj[1]) + ' stay where they are: ' + t(pT(m)) + '.', [H.move, H.only], tex, { bad: [pT(tmono(R(kj[1], kj[0]), m.v))] });
        } },
        { id: 'e5c', level: 'EMG', make: function (r) {
          var c = r.int(1, 4), a = r.int(c + 1, 7), b = r.int(1, 5), d = r.int(1, 5), m = tmono(1, [['x', c - a], ['y', -b - d]]), tex = '\\dfrac{' + tt(1, [['x', -a], ['y', -b]]) + '}{' + tt(1, [['x', -c], ['y', d]]) + '}';
          return X(t(tex), m, t('x') + ': ' + t('-' + a + '-(-' + c + ')=' + (c - a)) + '. ' + t('y') + ': ' + t('-' + b + '-' + d + '=' + (-b - d)) + '.<br>' + t(fin(m)) + '.', [H.laws, H.neg], tex, { bad: [pT(tmono(1, [['x', -a - c], ['y', -b - d]]))] });
        } },
        { id: 'e5d', level: 'PRG', make: function (r) {
          var kj = cop(r, 2, 4), p = r.int(2, 3), q = r.int(2, 3), m = tmono(R(Math.pow(kj[1], q), Math.pow(kj[0], p)), [['c', -p], ['d', q]]), tex = '\\dfrac{(' + kj[0] + 'c)^{-' + p + '}}{(' + kj[1] + 'd)^{-' + q + '}}';
          return X(t(tex), m, 'Each bracket crosses the bar as a unit: ' + t(tex + '=\\frac{(' + kj[1] + 'd)^{' + q + '}}{(' + kj[0] + 'c)^{' + p + '}}=' + pT(m)) + '.', [H.move, 'Raise the number in each bracket to the power too.'], tex,
            { bad: ['\\frac{' + kj[1] + vt('d', q) + '}{' + kj[0] + vt('c', p) + '}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs(R(kj[1], kj[0]))) return { code: 'coef-not-raised', hint: 'The numbers inside the brackets are raised to the powers too.' }; return null; } });
        } },
        { id: 'e5e', level: 'PRG', make: function (r) {
          var kj = r.pick([[6, 3], [6, 3], [4, 2], [10, 2], [12, 3], [8, 2], [3, 2], [2, 3]]), k = kj[0], j = kj[1], n = r.int(2, 6), q = r.int(2, 6), m = tmono(R(j * j, k), [['s', -n], ['t', q]]);
          var tex = '\\dfrac{' + k + '^{-1}' + vt('s', -n) + '}{' + j + '^{-2}' + vt('t', -q) + '}';
          return X(t(tex), m, 'Every factor crosses the bar: ' + t(tex + '=\\frac{' + j + '^{2}' + vt('t', q) + '}{' + k + vt('s', n) + '}=\\frac{' + j * j + vt('t', q) + '}{' + k + vt('s', n) + '}' + (gcd(j * j, k) > 1 ? '=' + pT(m) : '')) + '.', [H.move, 'Number powers count too: ' + t(k + '^{-1}=\\frac{1}{' + k + '}') + '.'], tex,
            { bad: [pT(tmono(R(-j * j, k), m.v))].concat(j * j !== k ? [pT(tmono(R(k, j * j), m.v))] : []) });
        } }] },
      { num: '6', stem: 'The numerical coefficients carry negative exponents too. Simplify each, writing the answer with positive exponents and the coefficient fully evaluated.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var b = r.pick([3, 3, 2]), p = r.int(1, 3), q = r.int(p + 1, b === 3 ? p + 2 : p + 3), a = r.int(1, 5), c = r.int(1, 5), y1 = r.int(1, 5), y2 = r.int(1, 4), m = tmono(Math.pow(b, q - p), [['x', -a - c], ['y', y1 + y2]]);
          var tex = '\\dfrac{' + b + '^{-' + p + '}' + tt(1, [['x', -a], ['y', y1]]) + '}{' + b + '^{-' + q + '}' + tt(1, [['x', c], ['y', -y2]]) + '}';
          return X(t(tex), m, t(b) + ': ' + t('-' + p + '-(-' + q + ')=' + (q - p)) + '. ' + t('x') + ': ' + t('-' + a + '-' + c + '=' + (-a - c)) + '. ' + t('y') + ': ' + t(y1 + '-(-' + y2 + ')=' + (y1 + y2)) + '.<br>' + t(b + '^{' + (q - p) + '}x^{' + (-a - c) + '}' + vt('y', y1 + y2) + '=' + pT(m)) + '.', [H.laws, 'Treat the number power like any other base, then evaluate it.'], tex,
            { bad: [pT(tmono(R(1, Math.pow(b, q - p)), m.v))] });
        } },
        { id: 'e6b', level: 'PRG', make: function (r) {
          var uv = cop(r, 2, 5), g = r.pick([6, 6, 2, 3, 4]), r1 = r.int(1, 4), p = r.int(r1 + 1, 7), q = r.int(1, 5), s = r.int(1, 5), m = tmono(R(-uv[0], uv[1]), [['a', r1 - p], ['b', q + s]]);
          var tex = '\\dfrac{' + tt(-uv[0] * g, [['a', -p], ['b', q]]) + '}{' + tt(uv[1] * g, [['a', -r1], ['b', -s]]) + '}';
          return X(t(tex), m, 'Coefficient: ' + t('\\frac{-' + uv[0] * g + '}{' + uv[1] * g + '}=-\\frac{' + uv[0] + '}{' + uv[1] + '}') + '. ' + t('a') + ': ' + t('-' + p + '-(-' + r1 + ')=' + (r1 - p)) + '. ' + t('b') + ': ' + t(q + '-(-' + s + ')=' + (q + s)) + '.<br>' + t(fin(m)) + '.', [H.coef, H.neg], tex,
            { bad: [pT(tmono(R(uv[0], uv[1]), m.v)), pT(tmono(R(-uv[1], uv[0]), m.v))] });
        } },
        { id: 'e6c', level: 'PRG', make: function (r) {
          var k = r.pick([3, 3, 2]), n = k === 3 ? 3 : r.pick([2, 3]), a = r.int(1, 3), b = r.int(1, 6), num = mp(tmono(k, [['m', -a]]), -n), m = md(num, tmono(k * k, [['m', -b]]));
          var tex = '\\dfrac{\\left(' + k + 'm^{-' + a + '}\\right)^{-' + n + '}}{' + k * k + 'm^{-' + b + '}}';
          return X(t(tex), m, t('\\left(' + k + 'm^{-' + a + '}\\right)^{-' + n + '}=' + k + '^{-' + n + '}m^{' + a * n + '}=' + pT(num)) + '.<br>Divide by ' + t(k * k + 'm^{-' + b + '}') + ': ' + t('\\frac{m^{' + a * n + '-(-' + b + ')}}{' + Math.pow(k, n) + '\\times ' + k * k + '}=' + pT(m)) + '.', [H.laws, t(k + '^{-' + n + '}=\\frac{1}{' + Math.pow(k, n) + '}') + '.'], tex,
            { bad: [pT(md(mp(tmono(k, [['m', -a]]), n), tmono(k * k, [['m', -b]])))] });
        } },
        { id: 'e6d', level: 'EMG', make: function (r) {
          var b = r.pick([2, 2, 3]), p = r.int(1, 4), q = r.int(p + 1, b === 2 ? p + 3 : p + 2), a = r.int(1, 6), c = r.int(1, 5), x = r.pick(['k', 'k', 'x', 'n']), m = tmono(Math.pow(b, q - p), [[x, a + c]]);
          var tex = '\\dfrac{' + b + '^{-' + p + '}' + vt(x, a) + '}{' + b + '^{-' + q + '}' + vt(x, -c) + '}';
          return X(t(tex), m, t(b) + ': ' + t('-' + p + '-(-' + q + ')=' + (q - p)) + '. ' + t(x) + ': ' + t(a + '-(-' + c + ')=' + (a + c)) + '.<br>' + t(b + '^{' + (q - p) + '}' + vt(x, a + c) + '=' + pT(m)) + '.', [H.laws], tex, { bad: [pT(tmono(R(1, Math.pow(b, q - p)), m.v))] });
        } }] },
      { num: '7', stem: 'Longer chains. Collect the exponents first and move factors across the bar only at the very end.', parts: [
        { id: 'e7a', level: 'PRG', make: function (r) {
          var e = pickWhere(function () { return { c2: r.int(2, 7), u: r.int(1, 5), c3: r.int(2, 5), a1: r.int(1, 4), b1: r.int(1, 6), a2: r.int(1, 4), b2: r.int(1, 3), a3: r.int(1, 5), b3: r.int(1, 4), a4: r.int(1, 7), b4: r.int(1, 4) }; },
            function (e) { var x = -e.a1 - e.a2 - e.a3 + e.a4, y = e.b1 + e.b2 - e.b3 - e.b4; return x !== 0 && y !== 0 && e.u !== e.c3; });
          var f1 = md(tmono(e.c2 * e.u, [['x', -e.a1], ['y', e.b1]]), tmono(e.c2, [['x', e.a2], ['y', -e.b2]])), f2 = md(tmono(1, [['x', -e.a3], ['y', -e.b3]]), tmono(e.c3, [['x', -e.a4], ['y', e.b4]])), m = mm(f1, f2);
          var tex = '\\dfrac{' + tt(e.c2 * e.u, [['x', -e.a1], ['y', e.b1]]) + '}{' + tt(e.c2, [['x', e.a2], ['y', -e.b2]]) + '}\\times\\dfrac{' + tt(1, [['x', -e.a3], ['y', -e.b3]]) + '}{' + tt(e.c3, [['x', -e.a4], ['y', e.b4]]) + '}';
          return X(t(tex), m, 'Coefficient: ' + t('\\frac{' + e.c2 * e.u + '}{' + e.c2 + '\\times ' + e.c3 + '}=' + frTex(m.c)) + '.<br>' + t('x') + ': ' + t('-' + e.a1 + '-' + e.a2 + '+(-' + e.a3 + ')-(-' + e.a4 + ')=' + m.v.x) + '. ' + t('y') + ': ' + t(e.b1 + '-(-' + e.b2 + ')+(-' + e.b3 + ')-' + e.b4 + '=' + m.v.y) + '.<br>' + t(fin(m)) + '.', [H.coef, H.laws], 'long chain (e7a)',
            { bad: [pT(tmono(m.c, { x: -m.v.x, y: m.v.y }))] });
        } },
        { id: 'e7b', level: 'PRG', make: function (r) {
          var uv = cop(r, 2, 5, { lt: true }), g = r.pick([3, 3, 2]), p = r.int(1, 4), q = r.int(1, 5), s = r.int(1, 4), w = r.int(1, 4);
          var inner = md(tmono(uv[0] * g, [['a', -p], ['b', q]]), tmono(uv[1] * g, [['a', s], ['b', -w]])), m = mp(inner, -2);
          var tex = '\\left(\\dfrac{' + tt(uv[0] * g, [['a', -p], ['b', q]]) + '}{' + tt(uv[1] * g, [['a', s], ['b', -w]]) + '}\\right)^{-2}';
          return X(t(tex), m, 'Simplify inside first: ' + t(rawTex(inner)) + '.<br>Raise to the power ' + t('-2') + ': ' + t('\\left(\\frac{' + uv[0] + '}{' + uv[1] + '}\\right)^{-2}' + vt('a', m.v.a) + vt('b', m.v.b) + '=' + fin(m)) + '.', [H.laws, H.flip], tex,
            { bad: [pT(mp(inner, 2)), pT(tmono(R(uv[0] * uv[0], uv[1] * uv[1]), m.v))] });
        } },
        { id: 'e7c', level: 'PRG', make: function (r) {
          var k = r.pick([2, 2, 3]), a = r.int(1, 4), b = r.int(1, 4), c = r.int(1, 4), d = r.int(1, 4), top = mp(tmono(k, [['p', -a], ['q', b]]), -2), bot = mp(tmono(k * k, [['p', c], ['q', -d]]), -1), m = md(top, bot);
          var tex = '\\dfrac{\\left(' + tt(k, [['p', -a], ['q', b]]) + '\\right)^{-2}}{\\left(' + tt(k * k, [['p', c], ['q', -d]]) + '\\right)^{-1}}';
          return X(t(tex), m, 'Top: ' + t(rawTex(top)) + '. Bottom: ' + t(rawTex(bot)) + '.<br>Coefficient: ' + t('\\frac{' + k + '^{-2}}{' + k * k + '^{-1}}=\\frac{1/' + k * k + '}{1/' + k * k + '}=1') + '. ' + t('p') + ': ' + t(2 * a + '-' + (-c < 0 ? '(' + -c + ')' : -c) + '=' + m.v.p) + '; ' + t('q') + ': ' + t(-2 * b + '-' + d + '=' + m.v.q) + '.<br>' + t(fin(m)) + '.', [H.laws, 'Expand each bracket first, then divide.'], tex,
            { bad: [pT(tmono(k * k * k * k, m.v)), pT(tmono(1, { p: m.v.p, q: -m.v.q }))] });
        } }] },
      { num: '8', section: 'Extra practice C — Fractional bases', stem: 'Use ' + t('\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^{n}') + ' to evaluate each exactly without a calculator. Leave your answers as exact fractions or integers — no decimals.', parts: [
        { id: 'e8a', level: 'EMG', make: function (r) { var pq = cop(r, 2, 5, { lt: true }); return fracBasePart(pq[0], pq[1], 3); } },
        { id: 'e8b', level: 'EMG', make: function (r) {
          var c = r.pick([['0.2', [1, 5]], ['0.2', [1, 5]], ['0.5', [1, 2]], ['0.25', [1, 4]], ['0.1', [1, 10]], ['0.4', [2, 5]]]), d = c[0], fr = c[1], ans = rpow(fr, -2), tex = '(' + d + ')^{-2}';
          return exP(t(tex), ans, function (v) { if (near(v, rpow(fr, 2)[0] / rpow(fr, 2)[1])) return { code: 'not-flipped', hint: 'That’s ' + t('(' + d + ')^{2}') + '. The negative exponent means: flip, then square.' }; return null; },
            t(d + '=' + frTex(fr)) + ', so ' + t(tex + '=' + (fr[0] === 1 ? fr[1] : '\\left(\\frac{' + fr[1] + '}{' + fr[0] + '}\\right)') + '^{2}=' + frTex(ans)) + '.', ['Write the decimal as a fraction first.', H.flip], tex, { bad: [frTex(rpow(fr, 2))] });
        } },
        { id: 'e8c', level: 'EMG', make: function (r) { return fracBasePart(1, r.int(2, 5), 3, true); } },
        { id: 'e8d', level: 'EMG', make: function (r) { return fracBasePart(r.pick([3, 3, 7, 9]), 10, 2); } },
        { id: 'e8e', level: 'EMG', make: function (r) { var pq = r.pick([[2, 3], [2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [1, 3]]); return fracBasePart(pq[0], pq[1], 4, true); } }] },
      { num: '9', stem: 'Flipping the fraction takes the coefficients with it. Simplify, writing the final answers with positive exponents.', parts: [
        { id: 'e9a', level: 'EMG', make: function (r) {
          var kj = cop(r, 2, 5), n = r.pick([3, 3, 2]), x = r.pick(['x', 'x', 'a', 'y']), m = tmono(R(Math.pow(kj[1], n), Math.pow(kj[0], n)), [[x, -n]]), tex = '\\left(\\dfrac{' + kj[0] + x + '}{' + kj[1] + '}\\right)^{-' + n + '}';
          return X(t(tex), m, 'Flip; the ' + t(kj[0]) + ' and ' + t(kj[1]) + ' go with it: ' + t('\\left(\\frac{' + kj[1] + '}{' + kj[0] + x + '}\\right)^{' + n + '}=\\frac{' + kj[1] + '^{' + n + '}}{' + kj[0] + '^{' + n + '}' + vt(x, n) + '}=' + pT(m)) + '.', [H.flip, 'Every factor is raised to the power, numbers included.'], tex,
            { bad: ['\\frac{' + kj[1] + '}{' + kj[0] + vt(x, n) + '}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs(R(kj[1], kj[0]))) return { code: 'coef-not-raised', hint: 'Good flip — now raise the numbers to the power ' + t(n) + ' as well.' }; return null; } });
        } },
        { id: 'e9b', level: 'PRG', make: function (r) {
          var kj = cop(r, 2, 5), p = r.int(1, 4), q = r.pick([1, 1, 2, 3]), inner = md(tmono(kj[0], [['a', p]]), tmono(kj[1], [['b', q]])), m = mp(inner, -2), tex = '\\left(\\dfrac{' + tt(kj[0], [['a', p]]) + '}{' + tt(kj[1], [['b', q]]) + '}\\right)^{-2}';
          return X(t(tex), m, t(tex + '=\\left(\\frac{' + tt(kj[1], [['b', q]]) + '}{' + tt(kj[0], [['a', p]]) + '}\\right)^{2}=' + pT(m)) + '.', [H.flip, 'Square every factor: numbers and variables.'], tex,
            { bad: [pT(tmono(R(kj[1], kj[0]), m.v)), pT(mp(inner, 2))] });
        } },
        { id: 'e9c', level: 'PRG', make: function (r) {
          var kj = cop(r, 2, 5), a = r.pick([1, 1, 2]), b = r.int(1, 4), inner = md(tmono(-kj[0], [['m', -a]]), tmono(kj[1], [['n', b]])), m = mp(inner, -3);
          var tex = '\\left(\\dfrac{' + tt(-kj[0], [['m', -a]]) + '}{' + tt(kj[1], [['n', b]]) + '}\\right)^{-3}';
          return X(t(tex), m, 'Flip and cube: ' + t('\\left(\\frac{' + tt(kj[1], [['n', b]]) + '}{' + tt(-kj[0], [['m', -a]]) + '}\\right)^{3}=\\frac{' + Math.pow(kj[1], 3) + vt('n', 3 * b) + '}{-' + Math.pow(kj[0], 3) + vt('m', -3 * a) + '}') + '; ' + t(vt('m', -3 * a)) + ' moves up: ' + t(pT(m)) + '. (Odd power: the sign stays.)', [H.flip, H.sign], tex,
            { bad: [pT(tmono([-m.c[0], m.c[1]], m.v)), pT(tmono(m.c, { m: -m.v.m, n: m.v.n }))] });
        } },
        { id: 'e9d', level: 'PRG', make: function (r) {
          var a = r.int(1, 4), c = r.pick([1, 1, 2, 3]), d = r.pick([1, 1, 2]), b = r.int(1, 4), inner = md(tmono(1, [['x', -a], ['y', c]]), tmono(1, [['x', d], ['y', -b]])), m = mp(inner, -2);
          var tex = '\\left(\\dfrac{' + tt(1, [['x', -a], ['y', c]]) + '}{' + tt(1, [['x', d], ['y', -b]]) + '}\\right)^{-2}';
          return X(t(tex), m, 'Inside first: ' + t(rawTex(inner)) + '. Then ' + t('(' + rawTex(inner) + ')^{-2}=' + fin(m)) + '.', [H.laws], tex, { bad: [pT(mp(inner, 2))] });
        } }] },
      { num: '10', stem: 'The rule does not care what the base is made of — a whole expression flips exactly like a single letter, provided it is not zero.', parts: [
        { id: 'e10a', level: 'EMG', make: function (r) {
          var n = r.pick([2, 2, 3]), tex = '\\left(\\dfrac{a+b}{c}\\right)^{-' + n + '}', ans = '\\frac{c^{' + n + '}}{(a+b)^{' + n + '}}';
          return P.math(t(tex), sumChk(ans, ['a', 'b', 'c'], { alts: [['\\frac{c^{' + n + '}}{a^{' + n + '}+b^{' + n + '}}', 'split-sum', 'Keep ' + t('a+b') + ' together as one base: ' + t('(a+b)^{' + n + '}') + ' is not ' + t('a^{' + n + '}+b^{' + n + '}') + '.'], ['\\frac{(a+b)^{' + n + '}}{c^{' + n + '}}', 'no-flip', 'The negative exponent flips the fraction: ' + t('c') + ' goes on top.']] }), ans,
            'Flip the whole fraction; ' + t('a+b') + ' stays together as one base: ' + t(tex + '=\\left(\\frac{c}{a+b}\\right)^{' + n + '}=' + ans) + '.', [H.flip, 'Keep ' + t('a+b') + ' in brackets.'], tex, { keys: 'expo', vars: ['a', 'b', 'c'] });
        } },
        { id: 'e10b', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), j = r.int(1, 5), n = r.pick([3, 3, 2]), kn = Math.pow(k, n), tex = '\\left(\\dfrac{' + k + '}{x+' + j + '}\\right)^{-' + n + '}', ans = '\\frac{(x+' + j + ')^{' + n + '}}{' + kn + '}';
          var p = P.math(t(tex), sumChk(ans, ['x'], { alts: [['\\frac{(x+' + j + ')^{' + n + '}}{' + k + '}', 'coef-not-raised', 'Good flip — now raise the ' + t(k) + ' to the power ' + t(n) + ' as well.'], ['\\frac{x^{' + n + '}+' + Math.pow(j, n) + '}{' + kn + '}', 'split-sum', 'Keep ' + t('x+' + j) + ' together: ' + t('(x+' + j + ')^{' + n + '}') + ' is not ' + t('x^{' + n + '}+' + Math.pow(j, n)) + '.'], ['\\frac{' + kn + '}{(x+' + j + ')^{' + n + '}}', 'no-flip', 'The negative exponent flips the fraction.']] }), ans,
            'Flip the whole fraction; ' + t('x+' + j) + ' stays together: ' + t(tex + '=\\left(\\frac{x+' + j + '}{' + k + '}\\right)^{' + n + '}=' + ans) + '.', [H.flip], tex, { keys: 'expo', vars: ['x'] });
          p.good = ['\\frac{1}{' + kn + '}(x+' + j + ')^{' + n + '}']; p.bad = ['\\frac{(x+' + j + ')^{' + n + '}}{' + k + '}', '\\left(\\frac{' + k + '}{x+' + j + '}\\right)^{-' + n + '}'];
          return p;
        } },
        { id: 'e10c', level: 'EMG', make: function (r) {
          var xy = r.pick([[2, 3], [2, 3], [2, 5], [3, 4], [2, 7], [3, 5], [4, 5]]), x = xy[0], y = xy[1], s1 = R(1, x + y), s2 = R(x + y, x * y);
          var p = P.fields('Show that ' + t('(x+y)^{-1}') + ' and ' + t('x^{-1}+y^{-1}') + ' are <b>not</b> the same by evaluating both at ' + t('x=' + x) + ' and ' + t('y=' + y) + '.',
            [{ name: '(x+y)⁻¹', before: t('(x+y)^{-1}='), mode: 'math', keys: 'fraction' }, { name: 'x⁻¹+y⁻¹', before: t('x^{-1}+y^{-1}='), mode: 'math', keys: 'fraction' }],
            [exactChk(s1, function (v) { if (near(v, x + y)) return { code: 'not-flipped', hint: t('(' + x + '+' + y + ')^{-1}=' + (x + y) + '^{-1}=\\frac{1}{' + (x + y) + '}') + '.' }; if (near(v, s2[0] / s2[1])) return { code: 'split-sum', hint: 'Add first: ' + t('(' + x + '+' + y + ')^{-1}=' + (x + y) + '^{-1}') + '.' }; return null; }),
              exactChk(s2, function (v) { if (near(v, s1[0] / s1[1])) return { code: 'split-sum', hint: 'Find each reciprocal first: ' + t(x + '^{-1}=\\frac{1}{' + x + '}') + ' and ' + t(y + '^{-1}=\\frac{1}{' + y + '}') + ', then add.' }; if (near(v, 2 / (x + y))) return { code: 'value', hint: 'To add ' + t('\\frac{1}{' + x + '}+\\frac{1}{' + y + '}') + ' use a common denominator, ' + t(x * y) + '.' }; return null; })],
            [frTex(s1), frTex(s2)], t('(x+y)^{-1}=' + frTex(s1)) + ', ' + t('x^{-1}+y^{-1}=' + frTex(s2)),
            t('(' + x + '+' + y + ')^{-1}=' + (x + y) + '^{-1}=\\frac{1}{' + (x + y) + '}') + '.<br>' + t(x + '^{-1}+' + y + '^{-1}=\\frac{1}{' + x + '}+\\frac{1}{' + y + '}=\\frac{' + y + '}{' + x * y + '}+\\frac{' + x + '}{' + x * y + '}=' + frTex(s2)) + '.<br>Since ' + t(frTex(s1) + '\\ne ' + frTex(s2)) + ', they are not the same: a negative exponent flips the whole base and can’t be split over a sum.',
            ['Do the brackets first on the left; on the right, find each reciprocal, then add.'], '(x+y)^-1 vs x^-1+y^-1');
          p.bad = [[frTex(s2), frTex(s1)], [String(x + y), frTex(s2)]];
          return p;
        } },
        { id: 'e10d', level: 'ADV', make: function (r) {
          var k = r.int(2, 7), L = r.pick([['m', 'n'], ['m', 'n'], ['a', 'b'], ['x', 'y']]), a = L[0], b = L[1], tex = '\\left(\\dfrac{' + k + '}{' + a + '^{-1}+' + b + '^{-1}}\\right)^{-1}', ans = '\\frac{' + a + '+' + b + '}{' + k + a + b + '}';
          var p = P.math(t(tex) + ', written as a single fraction.', sumChk(ans, L, { single: true, alts: [['\\frac{' + k + a + b + '}{' + a + '+' + b + '}', 'no-flip', 'That’s the value of the bracket itself. The exponent ' + t('-1') + ' flips it.'], ['\\frac{' + a + '+' + b + '}{' + k + '}', 'split-sum', t(a + '^{-1}+' + b + '^{-1}') + ' is ' + t('\\frac{1}{' + a + '}+\\frac{1}{' + b + '}') + ', not ' + t(a + '+' + b) + '. Combine them over the common denominator ' + t(a + b) + '.']] }), ans,
            'Flip: ' + t('\\frac{' + a + '^{-1}+' + b + '^{-1}}{' + k + '}=\\frac{\\frac{1}{' + a + '}+\\frac{1}{' + b + '}}{' + k + '}=\\frac{\\frac{' + b + '+' + a + '}{' + a + b + '}}{' + k + '}=\\frac{' + a + '+' + b + '}{' + a + b + '}\\times\\frac{1}{' + k + '}=' + ans) + '.',
            [H.flip, 'Rewrite ' + t(a + '^{-1}') + ' and ' + t(b + '^{-1}') + ' as fractions, then add them with a common denominator.'], tex, { keys: 'expo', vars: L });
          p.good = ['\\frac{' + b + '+' + a + '}{' + k + b + a + '}']; p.bad = ['\\frac{1}{' + k + a + '}+\\frac{1}{' + k + b + '}', '\\frac{' + a + '+' + b + '}{' + k + '}'];
          return p;
        } }] },
      { num: '11', section: 'Extra practice D — Where a⁰ = 1 comes from', stem: 'The zero exponent is not a definition pulled out of the air — the quotient law forces it.', parts: [
        { id: 'e11a', level: 'BEG', make: function (r) {
          var b = r.int(2, 9), n = b <= 4 ? r.int(3, 5) : r.int(2, 4), bn = Math.pow(b, n);
          var p = P.fields('Evaluate ' + t(b + '^{' + n + '}\\div ' + b + '^{' + n + '}') + ' directly, then with the quotient law. What must ' + t(b + '^{0}') + ' equal?',
            [{ name: 'Directly', before: t(b + '^{' + n + '}\\div ' + b + '^{' + n + '}=\\frac{' + F(bn) + '}{' + F(bn) + '}=') }, { name: 'Quotient law', label: 'Quotient law: ' + t(b + '^{' + n + '}\\div ' + b + '^{' + n + '}=' + b + '^{' + n + '-' + n + '}') + '. Its exponent is', before: '' }, { name: 'So', before: t(b + '^{0}=') }],
            [K.number(1, function (v) { return v === 0 ? { code: 'value', hint: 'A nonzero number divided by itself is ' + t('1') + '.' } : null; }), K.number(0), K.number(1, function (v) { if (v === 0) return { code: 'zero-power', hint: 'Both lines describe the same quotient, and you found it equals ' + t('1') + ' directly.' }; if (v === b) return { code: 'zero-base', hint: 'Look at your first box: the quotient equals ' + t('1') + '.' }; return null; })],
            ['1', '0', '1'], t(b + '^{' + n + '}\\div ' + b + '^{' + n + '}=1') + ', ' + t('=' + b + '^{0}') + ', so ' + t(b + '^{0}=1'),
            'Directly: ' + t('\\frac{' + F(bn) + '}{' + F(bn) + '}=1') + '. Quotient law: ' + t(b + '^{' + n + '}\\div ' + b + '^{' + n + '}=' + b + '^{' + n + '-' + n + '}=' + b + '^{0}') + '. Both describe the same quotient, so ' + t(b + '^{0}=1') + '.', ['Any nonzero number divided by itself is ' + t('1') + '.'], 'why ' + b + '^0 = 1');
          p.bad = [['1', '0', '0'], ['0', '0', '0']];
          return p;
        } },
        { id: 'e11b', level: 'EMG', make: function (r) {
          return P.mc(r, 'Repeat the argument with ' + t('a^{n}\\div a^{n}') + ' for a general base ' + t('a') + ' and exponent ' + t('n') + '. Which argument is correct?', [
            { html: t('a^{n}\\div a^{n}=1') + ' (a nonzero quantity divided by itself), and the quotient law gives ' + t('a^{n}\\div a^{n}=a^{n-n}=a^{0}') + '. So ' + t('a^{0}=1') + '.', right: true },
            { html: t('a^{0}') + ' means zero factors of ' + t('a') + ', so ' + t('a^{0}=0') + '.', why: 'Divide ' + t('a^{n}') + ' by itself: the result is ' + t('1') + ', not ' + t('0') + '.' },
            { html: 'The quotient law gives ' + t('a^{n}\\div a^{n}=a^{n\\div n}=a^{1}') + ', so ' + t('a^{0}=a') + '.', why: 'The quotient law <b>subtracts</b> exponents: ' + t('a^{n-n}=a^{0}') + '.' },
            { html: t('a^{n}\\div a^{n}=a^{n-n}=a^{0}') + ', and since ' + t('n-n=0') + ', the value is ' + t('0') + '.', why: 'The <b>exponent</b> is ' + t('0') + '; the value of the quotient is ' + t('1') + '.' }],
            'Any nonzero quantity divided by itself is ' + t('1') + ', so ' + t('a^{n}\\div a^{n}=1') + '. The quotient law gives ' + t('a^{n}\\div a^{n}=a^{n-n}=a^{0}') + '. Therefore ' + t('a^{0}=1') + '.', ['What is any nonzero number divided by itself?'], 'general a^0 = 1');
        } },
        { id: 'e11c', level: 'EMG', make: function (r) {
          return P.mc(r, 'The argument divided ' + t('a^{n}') + ' by itself. Why does that force the restriction ' + t('a\\ne 0') + '?', [
            { html: 'If ' + t('a=0') + ', then ' + t('a^{n}\\div a^{n}=\\frac{0}{0}') + ', which is undefined, so the argument proves nothing. The law is ' + t('a^{0}=1,\\ a\\ne 0') + '.', right: true },
            { html: 'Because ' + t('0^{0}=0') + ', so the rule would give the wrong answer.', why: 'The argument can’t tell us anything about ' + t('0^{0}') + ': with ' + t('a=0') + ' the quotient is ' + t('\\frac{0}{0}') + '.' },
            { html: 'Because negative bases don’t follow the exponent laws.', why: 'Negative bases are fine: ' + t('(-3)^{0}=1') + '. The problem is only ' + t('a=0') + '.' },
            { html: 'Because ' + t('n') + ' could be ' + t('0') + '.', why: 'The restriction is on the base ' + t('a') + ', not the exponent. What happens to ' + t('\\frac{a^{n}}{a^{n}}') + ' when ' + t('a=0') + '?' }],
            'The step ' + t('\\frac{a^{n}}{a^{n}}=1') + ' needs ' + t('a^{n}\\ne 0') + ', and ' + t('a^{n}=0') + ' exactly when ' + t('a=0') + '. With ' + t('a=0') + ' the quotient is ' + t('\\frac{0}{0}') + ' (undefined). So the law is ' + t('a^{0}=1,\\ a\\ne 0') + '.', ['What happens to ' + t('\\frac{a^{n}}{a^{n}}') + ' when ' + t('a=0') + '?'], 'why a ≠ 0');
        } }] },
      { num: '12', stem: 'Evaluate exactly. Watch what each zero exponent is attached to.', parts: [
        { id: 'e12a', level: 'BEG', make: function (r) {
          var k = r.int(2, 9), j = r.int(2, 9), a = r.int(1, 5), b = r.int(1, 5), tex = '\\left(\\dfrac{' + k + vt('x', a) + vt('y', -b) + '}{' + j + '}\\right)^{0}';
          return exP(t(tex), [1, 1], function (v) { if (near(v, 0)) return { code: 'zero-power', hint: 'Anything nonzero to the power ' + t('0') + ' is ' + t('1') + ', not ' + t('0') + '.' }; return null; },
            'The whole (nonzero) bracket is raised to the power ' + t('0') + ', so it equals ' + t('1') + '.', ['What is anything (nonzero) to the power ' + t('0') + '?'], 'zero power of a bracket', { bad: ['0'] });
        } },
        { id: 'e12b', level: 'EMG', make: function (r) {
          var p = r.int(2, 6), q = r.int(2, 5), s = r.int(2, 5), tex = '-' + p + '(' + q + 'a)^{0}+(' + s + 'a)^{0}';
          return exP(t(tex), [1 - p, 1], function (v) {
            if (near(v, 0)) return { code: 'zero-power', hint: 'Each bracket to the power ' + t('0') + ' is ' + t('1') + ', not ' + t('0') + '.' };
            if (near(v, -p * q + s)) return { code: 'zero-coef', hint: 'The exponent ' + t('0') + ' is on the whole bracket, so ' + t('(' + q + 'a)^{0}=1') + ', not ' + t(q) + '.' };
            if (near(v, -1 - p) || near(v, p + 1)) return { code: 'sign', hint: 'Only the first bracket is multiplied by ' + t('-' + p) + ': ' + t('-' + p + '(1)+1') + '.' };
            return null;
          }, t('(' + q + 'a)^{0}=1') + ' and ' + t('(' + s + 'a)^{0}=1') + ', so ' + t(tex + '=-' + p + '(1)+1=' + (1 - p)) + '.', ['The exponent ' + t('0') + ' covers everything in its bracket.'], tex, { bad: [String(s - p * q), '0'] });
        } },
        { id: 'e12c', level: 'PRG', make: function (r) {
          var c = r.pick([[4, 2, 2], [4, 2, 2], [9, 3, 2], [8, 2, 3], [16, 4, 2], [25, 5, 2], [27, 3, 3]]), j = c[0], s = c[1], tt2 = c[2], k = r.int(2, 9), x = r.pick(['m', 'm', 'x', 'k']), e = r.int(1, 4);
          var tex = '\\dfrac{(' + k + vt(x, e) + ')^{0}+' + j + '^{-1}}{' + s + '^{-' + tt2 + '}}';
          return exP(t(tex), [j + 1, 1], function (v) {
            if (near(v, 1)) return { code: 'zero-power', hint: t('(' + k + vt(x, e) + ')^{0}=1') + ', not ' + t('0') + '.' };
            if (near(v, (1 + 1 / j) / j)) return { code: 'div-neg', hint: 'Dividing by ' + t(s + '^{-' + tt2 + '}=\\frac{1}{' + j + '}') + ' means multiplying by ' + t(j) + '.' };
            return null;
          }, t('(' + k + vt(x, e) + ')^{0}=1') + ', ' + t(j + '^{-1}=\\frac{1}{' + j + '}') + ', ' + t(s + '^{-' + tt2 + '}=\\frac{1}{' + j + '}') + '.<br>' + t('\\frac{1+\\frac{1}{' + j + '}}{\\frac{1}{' + j + '}}=\\frac{' + (j + 1) + '}{' + j + '}\\times ' + j + '=' + (j + 1)) + '.', [H.neg, 'Dividing by a fraction is multiplying by its reciprocal.'], tex, { bad: ['1', frTex(R(j + 1, j * j))] });
        } },
        { id: 'e12d', level: 'EMG', make: function (r) {
          var d = r.pick(['5.4', '5.4', '2.3', '7.6', '3.9']), n = r.int(2, 5), val = n % 2 ? -1 : 1, tex = '\\left[-(' + d + ')^{0}\\right]^{-' + n + '}';
          return exP(t(tex), [val, 1], function (v) { if (near(v, 0)) return { code: 'zero-power', hint: t('(' + d + ')^{0}=1') + ', so the bracket is ' + t('-1') + '.' }; if (near(v, -val)) return { code: 'sign', hint: 'The bracket is ' + t('-1') + ', and the power is ' + (n % 2 ? 'odd' : 'even') + '.' }; return null; },
            t('(' + d + ')^{0}=1') + ', so the base is ' + t('-1') + '. ' + t('(-1)^{-' + n + '}=\\frac{1}{(-1)^{' + n + '}}=' + val) + '.', [H.sign], tex, { bad: [String(-val), '0'] });
        } },
        { id: 'e12e', level: 'PRG', make: function (r) {
          var b = r.int(2, 6), tex = '\\dfrac{' + b + '^{0}+' + b + '^{-1}}{' + b + '^{-2}}';
          return exP(t(tex), [b * b + b, 1], function (v) {
            if (near(v, b)) return { code: 'zero-power', hint: t(b + '^{0}=1') + ', not ' + t('0') + '.' };
            if (near(v, (1 + 1 / b) / (b * b))) return { code: 'div-neg', hint: 'Dividing by ' + t(b + '^{-2}=\\frac{1}{' + b * b + '}') + ' means multiplying by ' + t(b * b) + '.' };
            if (near(v, b * b * b + b * b)) return { code: 'zero-base', hint: t(b + '^{0}=1') + ', not ' + t(b) + '.' };
            return null;
          }, t(b + '^{0}=1') + ', ' + t(b + '^{-1}=\\frac{1}{' + b + '}') + ', ' + t(b + '^{-2}=\\frac{1}{' + b * b + '}') + '.<br>' + t('\\frac{1+\\frac{1}{' + b + '}}{\\frac{1}{' + b * b + '}}=\\frac{' + (b + 1) + '}{' + b + '}\\times ' + b * b + '=' + (b * b + b)) + '.', [H.neg, 'Dividing by a fraction is multiplying by its reciprocal.'], tex, { bad: [String(b), frTex(R(b + 1, b * b * b))] });
        } }] },
      { num: '13', section: 'Extra practice E — Find the error', stem: function (sh) { return 'Asked to write ' + t('x^{-' + sh.n + '}') + ' with a positive exponent, a student wrote ' + t('x^{-' + sh.n + '}=-x^{' + sh.n + '}') + ', reasoning that “the negative comes out front.”'; },
        shared: function (r) { var n = r.pick([3, 3, 2, 4]); return { n: n, v: n === 4 ? 2 : r.pick([2, 2, 3]) }; },
        parts: [
          { id: 'e13a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, v = sh.v, vn = Math.pow(v, n), L = R(1, vn), Rv = R(-vn, 1);
            var p = P.fields('Substitute ' + t('x=' + v) + ' into both sides to show the claim is false.',
              [{ name: 'Left side', before: t('x^{-' + n + '}='), mode: 'math', keys: 'fraction' }, { name: 'Right side', before: t('-x^{' + n + '}='), mode: 'math', keys: 'fraction' }],
              [exactChk(L), exactChk(Rv, function (x) { if (near(x, vn)) return { code: 'neg-base', hint: t('-x^{' + n + '}') + ' means ' + t('-(x^{' + n + '})') + ': work out ' + t(v + '^{' + n + '}') + ', then take the opposite.' }; return null; })],
              [frTex(L), frTex(Rv)], t('\\frac{1}{' + vn + '}\\ne -' + vn),
              'Left: ' + t(v + '^{-' + n + '}=\\frac{1}{' + v + '^{' + n + '}}=\\frac{1}{' + vn + '}') + '. Right: ' + t('-' + v + '^{' + n + '}=-' + vn) + '.<br>' + t('\\frac{1}{' + vn + '}\\ne -' + vn) + ', so the claim is <b>false</b>.', [H.neg], 'test x^-n = -x^n');
            p.bad = [[String(-vn), String(-vn)], [frTex(L), String(vn)]];
            return p;
          } },
          { id: 'e13b', level: 'BEG', make: function (r, sh) { var m = tmono(1, [['x', -sh.n]]); return X('Give the correct form of ' + t('x^{-' + sh.n + '}') + ' with a positive exponent.', m, 'Take the reciprocal; the sign doesn’t change: ' + t('x^{-' + sh.n + '}=\\frac{1}{x^{' + sh.n + '}}') + '.', [H.neg], 'x^-' + sh.n, { bad: ['-x^{' + sh.n + '}', '-\\frac{1}{x^{' + sh.n + '}}'] }); } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            return P.mc(r, 'What did the student confuse a negative <b>exponent</b> with?', [
              { html: 'A negative <b>sign</b>: a negative exponent means take the <b>reciprocal</b>, not the opposite.', right: true },
              { html: 'The product law: exponents should be added.', why: 'There is only one power here, so no law combines exponents. Think about what the minus sign in the exponent means.' },
              { html: 'A negative base: ' + t('x^{-' + sh.n + '}') + ' should be ' + t('(-x)^{' + sh.n + '}') + '.', why: 'The base is still ' + t('x') + '. Compare the values at ' + t('x=' + sh.v) + ' from part (a).' },
              { html: 'Nothing — the student is right.', why: 'Part (a) shows the two sides have different values.' }],
              'The student treated the negative exponent like a negative sign. A negative exponent means <b>reciprocal</b>: ' + t('x^{-' + sh.n + '}=\\frac{1}{x^{' + sh.n + '}}') + '.', [OPP], 'exponent vs sign');
          } }] },
      { num: '14', stem: function (sh) { return 'Asked to write ' + t('\\dfrac{' + sh.k + 'a^{-' + sh.m + '}}{b^{-' + sh.n + '}}') + ' with positive exponents, a student wrote ' + t('\\dfrac{b^{' + sh.n + '}}{' + sh.k + 'a^{' + sh.m + '}}') + '.'; },
        shared: function (r) { return { k: r.pick([6, 6, 2, 3, 4, 5, 7, 8, 9]), m: r.int(2, 6), n: r.int(2, 5) }; },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, m = sh.m, n = sh.n;
            return P.mc(r, 'The ' + t('b') + ' was handled correctly. What went wrong with the numerator?', [
              { html: 'The ' + t(k) + ' has exponent ' + t('+1') + ', so it should stay in the numerator — only ' + t('a^{-' + m + '}') + ' moves down.', right: true },
              { html: t('a^{-' + m + '}') + ' should have stayed in the numerator.', why: t('a^{-' + m + '}') + ' has a negative exponent, so it does move: ' + t('a^{-' + m + '}=\\frac{1}{a^{' + m + '}}') + '. That part was right.' },
              { html: 'The ' + t(k) + ' should have been raised to the power ' + t('-' + m) + '.', why: 'The exponent ' + t('-' + m) + ' belongs to ' + t('a') + ' only, not to the ' + t(k) + ' in front.' },
              { html: 'Nothing — the error is in the ' + t('b^{' + n + '}') + '.', why: 'The question says ' + t('b') + ' was handled correctly: ' + t('b^{-' + n + '}') + ' in the denominator moves up as ' + t('b^{' + n + '}') + '.' }],
              'Only a factor with a negative exponent crosses the fraction bar. The ' + t(k) + ' is ' + t(k + '^{1}') + ', so it stays in the numerator; the student dragged it down along with ' + t('a^{-' + m + '}') + '.', [H.only], 'what moved wrongly');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) { var m = tmono(sh.k, [['b', sh.n], ['a', -sh.m]]); return X('Give the correct answer.', m, t('a^{-' + sh.m + '}') + ' moves down, ' + t('b^{-' + sh.n + '}') + ' moves up, and the ' + t(sh.k) + ' stays: ' + t('\\frac{' + sh.k + 'a^{-' + sh.m + '}}{b^{-' + sh.n + '}}=' + pT(m)) + '.', [H.move], 'correct ' + sh.k + 'a^-' + sh.m + '/b^-' + sh.n, { bad: ['\\frac{b^{' + sh.n + '}}{' + sh.k + 'a^{' + sh.m + '}}'] }); } },
          { id: 'e14c', level: 'PRG', make: function (r, sh) {
            var k = sh.k, m = sh.m, n = sh.n, km = Math.pow(k, m), A = 'a^{-' + m + '}', B = 'b^{-' + n + '}';
            return P.mc(r, 'The student’s answer isn’t nonsense — it is the right answer to a different question. Which expression <b>would</b> simplify to ' + t('\\dfrac{b^{' + n + '}}{' + k + 'a^{' + m + '}}') + '?', [
              { html: t('\\dfrac{' + k + '^{-1}' + A + '}{' + B + '}'), right: true },
              { html: t('\\dfrac{' + k + A + '}{' + B + '}'), why: 'That is the original expression: it simplifies to ' + t('\\frac{' + k + 'b^{' + n + '}}{a^{' + m + '}}') + '.' },
              { html: t('\\dfrac{(' + k + 'a)^{-' + m + '}}{' + B + '}'), why: t('(' + k + 'a)^{-' + m + '}=\\frac{1}{' + k + '^{' + m + '}a^{' + m + '}}') + ', so the coefficient would be ' + t(F(km)) + ', not ' + t(k) + '.' },
              { html: t('\\dfrac{' + k + '^{-1}a^{' + m + '}}{b^{' + n + '}}'), why: 'This simplifies to ' + t('\\frac{a^{' + m + '}}{' + k + 'b^{' + n + '}}') + ': ' + t('a') + ' and ' + t('b') + ' are on the wrong sides.' }],
              'For the ' + t(k) + ' to end up in the denominator it needs a negative exponent of its own: ' + t('\\frac{' + k + '^{-1}' + A + '}{' + B + '}=\\frac{b^{' + n + '}}{' + k + 'a^{' + m + '}}') + ' ✓', [H.only, 'Simplify each option and compare.'], 'working backwards');
          } }] },
      { num: '15', stem: 'Each line below contains exactly one error. Identify it and write the correct answer.', parts: [
        { id: 'e15a', sub: 'a i', level: 'EMG', make: function (r) { var k = r.int(2, 5), n = r.int(2, 3); return errMC(r, '(' + k + 'x)^{-' + n + '}=\\dfrac{' + k + '}{x^{' + n + '}}', [
          { html: 'The exponent ' + t('-' + n) + ' covers the whole base ' + t(k + 'x') + ', but the ' + t(k) + ' was left on top and never raised to the power ' + t(n) + '.', right: true },
          { html: 'The ' + t('x^{' + n + '}') + ' should be in the numerator.', why: t('x^{-' + n + '}=\\frac{1}{x^{' + n + '}}') + ', so ' + t('x^{' + n + '}') + ' does belong in the denominator.' },
          { html: 'The ' + t(k) + ' should have been multiplied by ' + t(n) + '.', why: 'A power multiplies the base by itself: ' + t(k + '^{' + n + '}') + ', not ' + t(k + '\\times ' + n) + '.' },
          { html: 'There is no error.', why: 'Test ' + t('x=1') + ': ' + t('(' + k + ')^{-' + n + '}=\\frac{1}{' + Math.pow(k, n) + '}') + ', but ' + t('\\frac{' + k + '}{1}=' + k) + '.' }], 'The ' + t('-' + n) + ' applies to every factor of ' + t(k + 'x') + ', so the ' + t(k) + ' must be raised to the power ' + t(n) + ' and moved to the denominator too.', '(' + k + 'x)^-' + n + ' error'); } },
        { id: 'e15b', sub: 'a ii', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), n = r.int(2, 3), m = tmono(R(1, Math.pow(k, n)), [['x', -n]]);
          return X('Correct the line ' + t('(' + k + 'x)^{-' + n + '}=\\dfrac{' + k + '}{x^{' + n + '}}') + ':  ' + t('(' + k + 'x)^{-' + n + '}='), m, t('(' + k + 'x)^{-' + n + '}=\\frac{1}{(' + k + 'x)^{' + n + '}}=' + pT(m)) + '.', [H.only], 'fix (' + k + 'x)^-' + n,
            { bad: ['\\frac{' + k + '}{x^{' + n + '}}', '\\frac{1}{' + k + 'x^{' + n + '}}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs(k)) return { code: 'repeat-error', hint: 'That’s the same answer as the line with the error. The ' + t(k) + ' is inside the bracket too.' }; if (c && c.same && c.coefIs([1, k])) return { code: 'coef-not-raised', hint: 'Right side of the bar — now raise the ' + t(k) + ' to the power ' + t(n) + '.' }; return null; } });
        } },
        { id: 'e15c', sub: 'b i', level: 'EMG', make: function (r) { var y = r.pick(['a', 'a', 'x', 'y']), k = r.int(2, 6), n = r.int(2, 3); return errMC(r, '\\left(\\dfrac{' + y + '}{' + k + '}\\right)^{-' + n + '}=\\dfrac{' + k + '}{' + y + '^{' + n + '}}', [
          { html: 'Flipping the fraction was right, but the new numerator ' + t(k) + ' was not raised to the power ' + t(n) + '.', right: true },
          { html: 'The fraction should not be flipped: ' + t('\\left(\\frac{' + y + '}{' + k + '}\\right)^{-' + n + '}=\\frac{' + y + '^{' + n + '}}{' + k + '^{' + n + '}}') + '.', why: 'A negative exponent <b>does</b> flip the fraction.' },
          { html: 'The ' + t(y + '^{' + n + '}') + ' should be in the numerator.', why: 'After flipping, ' + t(y) + ' is in the denominator.' },
          { html: 'There is no error.', why: 'Test ' + t(y + '=1') + ': ' + t('\\left(\\frac{1}{' + k + '}\\right)^{-' + n + '}=' + Math.pow(k, n)) + ', but ' + t('\\frac{' + k + '}{1}=' + k) + '.' }], 'Flip, then raise <b>both</b> parts to the power: ' + t('\\left(\\frac{' + k + '}{' + y + '}\\right)^{' + n + '}=\\frac{' + Math.pow(k, n) + '}{' + y + '^{' + n + '}}') + '.', '(' + y + '/' + k + ')^-' + n + ' error'); } },
        { id: 'e15d', sub: 'b ii', level: 'EMG', make: function (r) {
          var y = r.pick(['a', 'a', 'x', 'y']), k = r.int(2, 6), n = r.int(2, 3), m = tmono(Math.pow(k, n), [[y, -n]]);
          return X('Correct the line ' + t('\\left(\\dfrac{' + y + '}{' + k + '}\\right)^{-' + n + '}=\\dfrac{' + k + '}{' + y + '^{' + n + '}}') + ':  ' + t('\\left(\\dfrac{' + y + '}{' + k + '}\\right)^{-' + n + '}='), m, t('\\left(\\frac{' + y + '}{' + k + '}\\right)^{-' + n + '}=\\left(\\frac{' + k + '}{' + y + '}\\right)^{' + n + '}=' + pT(m)) + '.', [H.flip], 'fix (' + y + '/' + k + ')^-' + n,
            { bad: ['\\frac{' + k + '}{' + y + '^{' + n + '}}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs(k)) return { code: 'repeat-error', hint: 'That’s the line with the error: raise the ' + t(k) + ' to the power ' + t(n) + '.' }; return null; } });
        } },
        { id: 'e15e', sub: 'c i', level: 'EMG', make: function (r) { var y = r.pick(['y', 'y', 'a', 'x']), k = r.int(2, 9), n = r.int(2, 6); return errMC(r, '\\dfrac{1}{' + k + y + '^{-' + n + '}}=' + k + y + '^{' + n + '}', [
          { html: 'Only ' + t(y + '^{-' + n + '}') + ' has a negative exponent, so only it moves up; the ' + t(k) + ' should stay in the denominator.', right: true },
          { html: t(y + '^{-' + n + '}') + ' should stay in the denominator as ' + t(y + '^{' + n + '}') + '.', why: 'A factor with a negative exponent in the denominator moves up: ' + t('\\frac{1}{' + y + '^{-' + n + '}}=' + y + '^{' + n + '}') + '. That part was right.' },
          { html: 'The ' + t(k) + ' should become ' + t(k + '^{-' + n + '}') + '.', why: 'The exponent ' + t('-' + n) + ' belongs only to ' + t(y) + '.' },
          { html: 'There is no error.', why: 'Test ' + t(y + '=1') + ': ' + t('\\frac{1}{' + k + '}') + ' on the left, but ' + t(k) + ' on the right.' }], 'Only ' + t(y + '^{-' + n + '}') + ' crosses the bar: ' + t('\\frac{1}{' + k + y + '^{-' + n + '}}=\\frac{' + y + '^{' + n + '}}{' + k + '}') + '.', '1/(' + k + y + '^-' + n + ') error'); } },
        { id: 'e15f', sub: 'c ii', level: 'EMG', make: function (r) {
          var y = r.pick(['y', 'y', 'a', 'x']), k = r.int(2, 9), n = r.int(2, 6), m = tmono(R(1, k), [[y, n]]);
          return X('Correct the line ' + t('\\dfrac{1}{' + k + y + '^{-' + n + '}}=' + k + y + '^{' + n + '}') + ':  ' + t('\\dfrac{1}{' + k + y + '^{-' + n + '}}='), m, t('\\frac{1}{' + k + y + '^{-' + n + '}}=' + pT(m)) + ': only ' + t(y + '^{-' + n + '}') + ' moves up.', [H.only], 'fix 1/(' + k + y + '^-' + n + ')',
            { bad: [k + y + '^{' + n + '}'], diag: function (an, ast, c) { if (c && c.same && c.coefIs(k)) return { code: 'repeat-error', hint: 'That’s the line with the error: the ' + t(k) + ' has no negative exponent, so it stays in the denominator.' }; return null; } });
        } }] },
      { num: '16', section: 'Extra practice F — Stretch', stem: 'Write both sides as powers of the same base, then equate the exponents. Solve for ' + t('x') + '.', parts: [
        { id: 'e16a', level: 'EMG', make: function (r) {
          var b, n; do { b = r.pick([2, 2, 3, 4, 5]); n = r.int(2, 6); } while (Math.pow(b, n) > 1024);
          var bn = Math.pow(b, n);
          return P.number(t(b + '^{-x}=\\dfrac{1}{' + F(bn) + '}'), n, function (v) { if (v === -n) return { code: 'sign', hint: 'Check: if ' + t('x=-' + n) + ', then ' + t(b + '^{-x}=' + b + '^{' + n + '}=' + F(bn)) + ', not ' + t('\\frac{1}{' + F(bn) + '}') + '.' }; return null; },
            t('\\frac{1}{' + F(bn) + '}=\\frac{1}{' + b + '^{' + n + '}}=' + b + '^{-' + n + '}') + ', so ' + t(b + '^{-x}=' + b + '^{-' + n + '}') + ', ' + t('-x=-' + n) + ', ' + t('x=' + n) + '.', ['Write ' + t('\\frac{1}{' + F(bn) + '}') + ' as a power of ' + t(b) + ' with a negative exponent.'], b + '^-x = 1/' + bn, { before: t('x=') });
        } },
        { id: 'e16b', level: 'EMG', make: function (r) {
          var b, n; do { b = r.pick([3, 3, 2, 4, 5]); n = r.int(2, 6); } while (Math.pow(b, n) > 1024);
          var bn = Math.pow(b, n);
          return P.number(t(b + '^{x}=\\dfrac{1}{' + F(bn) + '}'), -n, function (v) { if (v === n) return { code: 'sign', hint: t(b + '^{' + n + '}=' + F(bn)) + ', not ' + t('\\frac{1}{' + F(bn) + '}') + '. The reciprocal needs a negative exponent.' }; return null; },
            t('\\frac{1}{' + F(bn) + '}=\\frac{1}{' + b + '^{' + n + '}}=' + b + '^{-' + n + '}') + ', so ' + t(b + '^{x}=' + b + '^{-' + n + '}') + ' and ' + t('x=-' + n) + '.', ['Write ' + t('\\frac{1}{' + F(bn) + '}') + ' as a power of ' + t(b) + '.'], b + '^x = 1/' + bn, { before: t('x=') });
        } },
        { id: 'e16c', level: 'PRG', make: function (r) {
          var pq = cop(r, 2, 5, { lt: true }), n = r.pick([2, 2, 3]), p = pq[0], q = pq[1];
          return P.number(t('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{x}=\\dfrac{' + Math.pow(q, n) + '}{' + Math.pow(p, n) + '}'), -n, function (v) { if (v === n) return { code: 'sign', hint: t('\\left(\\frac{' + p + '}{' + q + '}\\right)^{' + n + '}=\\frac{' + Math.pow(p, n) + '}{' + Math.pow(q, n) + '}') + ' — the right side is the <b>reciprocal</b> of that.' }; return null; },
            t('\\frac{' + Math.pow(q, n) + '}{' + Math.pow(p, n) + '}=\\left(\\frac{' + q + '}{' + p + '}\\right)^{' + n + '}=\\left(\\frac{' + p + '}{' + q + '}\\right)^{-' + n + '}') + ', so ' + t('x=-' + n) + '.', ['Is the right side a power of ' + t('\\frac{' + p + '}{' + q + '}') + ' or of its reciprocal?', H.flip], '(' + p + '/' + q + ')^x', { before: t('x=') });
        } },
        { id: 'e16d', level: 'EMG', make: function (r) {
          var n = r.int(2, 6), dec = '0.' + Array(n).join('0') + '1';
          return P.number(t('10^{-x}=' + dec), n, function (v) { if (v === -n) return { code: 'sign', hint: 'If ' + t('x=-' + n) + ', then ' + t('10^{-x}=10^{' + n + '}') + ', a big number.' }; if (v === n - 1 || v === n + 1) return { code: 'count', hint: t(dec + '=\\frac{1}{' + F(Math.pow(10, n)) + '}') + ': count the zeros in ' + t(F(Math.pow(10, n))) + '.' }; return null; },
            t(dec + '=\\frac{1}{' + F(Math.pow(10, n)) + '}=\\frac{1}{10^{' + n + '}}=10^{-' + n + '}') + ', so ' + t('-x=-' + n) + ' and ' + t('x=' + n) + '.', ['Write the decimal as a fraction with a power of 10 in the denominator.'], '10^-x = ' + dec, { before: t('x=') });
        } }] },
      { num: '17', stem: 'The laws work on symbolic exponents exactly as they do on numbers. Simplify, writing each answer with positive exponents. Take ' + t('n') + ' and ' + t('m') + ' to be integers with ' + t('n>0') + '.', parts: [
        { id: 'e17a', level: 'PRG', make: function (r) {
          var a = r.pick([1, 1, 2, 3]), b = r.int(a + 1, 6), d = b - a, s = function (k) { return k === 1 ? 'n' : k + 'n'; }, tex = '\\dfrac{x^{-' + s(a) + '}}{x^{-' + s(b) + '}}', ans = 'x^{' + s(d) + '}';
          var p = P.math(t(tex), symExpChk('x', d, [[-d, 'Subtracting a negative: ' + t('-' + s(a) + '-(-' + s(b) + ')=-' + s(a) + '+' + s(b) + '=' + s(d)) + '.', 'sign-exp'], [-(a + b), 'Quotient law: <b>subtract</b> the bottom exponent: ' + t('-' + s(a) + '-(-' + s(b) + ')') + '.', 'sign-exp'], [a + b, 'Careful with the signs: ' + t('-' + s(a) + '-(-' + s(b) + ')=-' + s(a) + '+' + s(b)) + '.', 'sign-exp']]), ans,
            t('x^{-' + s(a) + '-(-' + s(b) + ')}=x^{-' + s(a) + '+' + s(b) + '}=' + ans) + '.', [H.laws], tex, { keys: 'expo', vars: ['x', 'n'] });
          p.good = ['x^{n' + (d === 1 ? '' : '\\cdot ' + d) + '}']; p.bad = ['x^{-' + s(d) + '}', 'x^{-' + a + 'n+' + b + 'n}'];
          return p;
        } },
        { id: 'e17b', level: 'EMG', make: function (r) {
          var pp = r.int(2, 4), q = r.int(2, 4), tex = '\\left(a^{-' + pp + 'n}\\right)^{-' + q + '}', ans = 'a^{' + pp * q + 'n}';
          var p = P.math(t(tex), symExpChk('a', pp * q, [[-pp * q, 'Negative times negative is positive: ' + t('(-' + pp + 'n)(-' + q + ')=' + pp * q + 'n') + '.', 'sign-exp']]), ans,
            t('a^{(-' + pp + 'n)(-' + q + ')}=' + ans) + '.', ['Power of a power: multiply the exponents.'], tex, { keys: 'expo', vars: ['a', 'n'] });
          p.bad = ['a^{-' + pp * q + 'n}'];
          return p;
        } },
        { id: 'e17c', level: 'PRG', make: function (r) {
          var a = r.int(1, 4), b = r.int(1, 4), y = r.pick(['y', 'y', 'x', 'b']), m = tmono(1, [[y, -(a + b)]]), tex = '\\dfrac{' + y + '^{\\,n-' + a + '}}{' + y + '^{\\,n+' + b + '}}';
          return X(t(tex), m, t(y + '^{(n-' + a + ')-(n+' + b + ')}=' + y + '^{n-' + a + '-n-' + b + '}=' + vt(y, -(a + b)) + '=' + pT(m)) + ' (the ' + t('n') + '’s cancel).', [H.laws, 'Subtract the <b>whole</b> bottom exponent: put it in brackets.'], tex,
            { vars: ['n'], bad: [vt(y, a + b), a !== b ? pT(tmono(1, [[y, a - b]])) : vt(y, 2 * a)], diag: function (an) { var e = an.vars[y]; if (e && a !== b && e[0] / e[1] === b - a) return { code: 'sign-exp', hint: 'The minus sign applies to both terms of ' + t('n+' + b) + ': ' + t('(n-' + a + ')-(n+' + b + ')=n-' + a + '-n-' + b) + '.' }; return null; } });
        } },
        { id: 'e17d', level: 'PRG', make: function (r) {
          var c = r.pick([[4, 2], [4, 2], [2, 3], [3, 2], [5, 2], [2, 4], [3, 3], [10, 2]]), b = c[0], pp = c[1], v = Math.pow(b, pp), tex = b + '^{\\,m}\\times ' + b + '^{\\,-m-' + pp + '}';
          return exP(t(tex), [1, v], function (x) { if (near(x, v)) return { code: 'opposite', hint: 'The exponent is ' + t('m+(-m-' + pp + ')=-' + pp) + ', so the answer is a reciprocal.' }; return null; },
            t(b + '^{m+(-m-' + pp + ')}=' + b + '^{-' + pp + '}=\\frac{1}{' + b + '^{' + pp + '}}=\\frac{1}{' + F(v) + '}') + ' (the ' + t('m') + '’s cancel).', [H.laws, H.eval], tex, { bad: [String(v)] });
        } }] },
      { num: '18', stem: '', parts: [
        { id: 'e18a', level: 'ADV', make: function (r) {
          var sg = r.pick(['+', '+', '-']), tex = '\\dfrac{x^{-1}' + sg + 'y^{-1}}{(xy)^{-1}}', ans = sg === '+' ? 'x+y' : 'y-x';
          var p = P.math('Simplify ' + t(tex) + ' completely. (Rewrite each negative exponent as a fraction first, then combine.)', sumChk(ans, ['x', 'y'], { noFrac: true, alts: [['\\frac{' + (sg === '+' ? 'x+y' : 'y-x') + '}{xy}', 'div-neg', 'That’s just the numerator. Dividing by ' + t('(xy)^{-1}=\\frac{1}{xy}') + ' means multiplying by ' + t('xy') + '.'], ['\\frac{1}{' + ans + '}', 'flip', 'Upside down: dividing by ' + t('\\frac{1}{xy}') + ' multiplies by ' + t('xy') + '.']].concat(sg === '-' ? [['x-y', 'sign', 'Check the order: ' + t('\\frac{1}{x}-\\frac{1}{y}=\\frac{y-x}{xy}') + '.']] : []) }), ans,
            t(tex + '=\\dfrac{\\frac{1}{x}' + sg + '\\frac{1}{y}}{\\frac{1}{xy}}') + '. Numerator: ' + t('\\frac{y}{xy}' + sg + '\\frac{x}{xy}=\\frac{' + (sg === '+' ? 'y+x' : 'y-x') + '}{xy}') + '. Dividing by ' + t('\\frac{1}{xy}') + ' means multiplying by ' + t('xy') + ': ' + t('\\frac{' + (sg === '+' ? 'y+x' : 'y-x') + '}{xy}\\times xy=' + ans) + '.',
            ['Rewrite: ' + t('x^{-1}=\\frac{1}{x}') + ', ' + t('(xy)^{-1}=\\frac{1}{xy}') + '.', 'Combine the top over the common denominator ' + t('xy') + '.'], 'simplify (x^-1' + sg + 'y^-1)/(xy)^-1', { keys: 'expo', vars: ['x', 'y'] });
          p.good = [sg === '+' ? 'y+x' : '-x+y']; p.bad = ['\\frac{' + ans + '}{xy}', sg === '+' ? 'xy' : 'x-y'];
          return p;
        } },
        { id: 'e18b', level: 'EMG', make: function (r) {
          return P.mc(r, 'State the restrictions on ' + t('x') + ' and ' + t('y') + ' for ' + t('\\dfrac{x^{-1}+y^{-1}}{(xy)^{-1}}') + '.', [
            { html: t('x\\ne 0') + ' and ' + t('y\\ne 0'), right: true },
            { html: 'None — the simplified answer ' + t('x+y') + ' works for every ' + t('x') + ' and ' + t('y') + '.', why: 'Restrictions come from the <b>original</b> expression: ' + t('x^{-1}=\\frac{1}{x}') + ' is undefined when ' + t('x=0') + '.' },
            { html: t('x\\ne -y'), why: t('x=-y') + ' makes the answer ' + t('0') + ', which is allowed. Look for values that put a zero in a denominator.' },
            { html: t('x\\ne y'), why: 'Nothing goes wrong when ' + t('x=y') + '. Where are the hidden denominators?' }],
            'Rewriting the negative exponents puts ' + t('x') + ', ' + t('y') + ' and ' + t('xy') + ' in denominators, so ' + t('x\\ne 0') + ' and ' + t('y\\ne 0') + '.', ['Rewrite each negative exponent as a fraction. Which values make a denominator zero?'], 'restrictions');
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var b = r.pick([2, 2, 3, 4, 5]), ans = b * b + b, tex = '\\dfrac{' + b + '^{-2}+' + b + '^{-1}}{' + b + '^{-3}}';
          return P.mc(r, 'The value of ' + t(tex) + ' is', [
            { html: t(b + 1), why: 'Dividing by ' + t(b + '^{-3}') + ' means multiplying by ' + t(b + '^{3}=' + b * b * b) + ', not ' + t(b + '^{2}') + '.' },
            { html: t(ans), right: true },
            { html: t('\\tfrac{1}{' + ans + '}'), why: 'Upside down: dividing by ' + t('\\frac{1}{' + b * b * b + '}') + ' multiplies by ' + t(b * b * b) + '.' },
            { html: t(b * b * (b + 1)), why: 'Check the numerator: ' + t(b + '^{-2}+' + b + '^{-1}=\\frac{1}{' + b * b + '}+\\frac{1}{' + b + '}=\\frac{' + (b + 1) + '}{' + b * b + '}') + '.' }],
            t(b + '^{-2}=\\frac{1}{' + b * b + '}') + ', ' + t(b + '^{-1}=\\frac{1}{' + b + '}') + ', ' + t(b + '^{-3}=\\frac{1}{' + b * b * b + '}') + '. Numerator: ' + t('\\frac{1}{' + b * b + '}+\\frac{' + b + '}{' + b * b + '}=\\frac{' + (b + 1) + '}{' + b * b + '}') + '. Then ' + t('\\frac{' + (b + 1) + '}{' + b * b + '}\\times ' + b * b * b + '=' + ans) + '.', [H.neg], 'MC ' + tex, true);
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'EMG', make: function (r) {
          var ab = r.pick([[3, 4], [3, 4], [2, 3], [3, 5], [4, 5], [2, 5], [5, 6], [5, 7], [4, 7], [6, 7], [3, 7], [2, 7], [5, 8], [7, 8], [3, 8]]), a = ab[0], b = ab[1], P3 = b * b * b, Q3 = a * a * a, ans = P3 - Q3;
          return P.nr('When ' + t('\\left(\\dfrac{' + a + '}{' + b + '}\\right)^{-3}') + ' is written as ' + t('\\dfrac{p}{q}') + ' in lowest terms, the value of ' + t('p-q') + ' is ________.', ans, function (v) {
            if (v === b - a) return { code: 'no-power', hint: 'Flip, then <b>cube</b> both numbers: ' + t('\\left(\\frac{' + b + '}{' + a + '}\\right)^{3}=\\frac{' + P3 + '}{' + Q3 + '}') + '.' };
            if (v === P3 + Q3) return { code: 'value', hint: 'The question asks for ' + t('p-q') + ', not ' + t('p+q') + '.' };
            return null;
          }, t('\\left(\\frac{' + a + '}{' + b + '}\\right)^{-3}=\\left(\\frac{' + b + '}{' + a + '}\\right)^{3}=\\frac{' + P3 + '}{' + Q3 + '}') + ' (already in lowest terms), so ' + t('p-q=' + P3 + '-' + Q3 + '=' + ans) + '.', [H.flip], 'NR (' + a + '/' + b + ')^-3 p-q');
        } }] }
    ]
  });

  /* ---------- part makers that use the helpers above ---------- */
  /* k x^{-n} = k/x^n (true) or 1/(k x^n) (false) */
  function coefTF(r, x, k, n, truth) {
    return tfP(r, k + vt(x, -n), '\\dfrac{' + k + '}{' + vt(x, n) + '}', '\\dfrac{1}{' + k + vt(x, n) + '}', truth, 'Only ' + t(x) + ' carries the exponent ' + t(-n) + ', so only ' + t(vt(x, -n)) + ' moves below the bar; the ' + t(k) + ' stays on top.', 'T/F ' + k + x + '^-' + n);
  }
  /* evaluate an expression in x at x = v and x = -v */
  function twoVals(v, tex, f) {
    var a = f(v), b = f(-v);
    var p = P.fields(t(tex), [{ name: 'x = ' + v, before: t('x=' + v + ':'), mode: 'math', keys: 'fraction' }, { name: 'x = −' + v, before: t('x=-' + v + ':'), mode: 'math', keys: 'fraction' }],
      [exactChk(a, signDiag(a)), exactChk(b, signDiag(b))], [frTex(a), frTex(b)], t('x=' + v + ':\\ ' + frTex(a)) + ', ' + t('x=-' + v + ':\\ ' + frTex(b)),
      t(tex.replace(/x/g, '(' + v + ')') + '=' + frTex(a)) + '<br>' + t(tex.replace(/x/g, '(-' + v + ')') + '=' + frTex(b)), [H.sign, H.neg], 'evaluate ' + tex + ' at ±' + v);
    p.bad = [[frTex(b), frTex(a)]];
    return p;
  }
  function signDiag(val) { return function (v) { if (near(v, -val[0] / val[1])) return { code: 'sign', hint: 'Check the sign: work out what the exponent is attached to, then whether the power is odd or even.' }; return null; }; }
  /* "identify the error" multiple choice */
  function errMC(r, line, opts, sol, text) {
    return P.mc(r, 'What is the error in ' + t(line) + '?', opts, sol, ['Simplify the left side yourself and compare.'], text);
  }
})(window);
