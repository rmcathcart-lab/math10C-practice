/* Math 10C · Unit 2 · Lesson 1 — Understanding Powers and the Exponent Laws (AN3)
 * Assignment questions 1–19 (u2_L01.tex, Parts A–D) and the whole Lesson 1 Extra Practice (u2_EP01.tex, Q1–23).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers and letters. Levels: LIM BEG EMG PRG ADV MAS.
 * Local checkers (top of file): exprEq (any expression equal to a target: bases, exponents, coefficients),
 * powerEq (the power itself, compared by base and exponent), repMul (repeated multiplication, factors in any order),
 * singlePow (one base with one exponent, numeric), symPow (K.expo plus "one power per base, exponent simplified"). */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    fence: 'Applied the exponent to the wrong base (−aⁿ vs (−a)ⁿ)', swapped: 'Swapped base and exponent', 'part-base': 'Took only part of the base',
    'coef-exp': 'Gave the exponent as the coefficient', 'coef-zero': 'Said the coefficient is 0', 'coef-den': 'Gave the divisor instead of its reciprocal', 'coef-sign': 'Dropped the negative sign',
    'exp-left': 'Left an exponent (not written as repeated multiplication)', 'not-repeated': 'Right value, base not shown repeated', added: 'Repeated addition instead of multiplication',
    count: 'Wrong number of factors', 'coef-repeated': 'Repeated the coefficient', 'coef-once': 'Wrote the coefficient once (it is inside the bracket)',
    'times-exp': 'Multiplied base by exponent', 'off-one': 'One factor too many or too few', 'zero-is-0': 'Thought a⁰ = 0', 'zero-is-base': 'Thought a⁰ = a',
    'coef-zeroed': 'Applied the zero exponent to the coefficient too', 'num-only': 'Raised only the numerator', 'times-num': 'Multiplied by the exponent',
    'mult-exp': 'Multiplied exponents (should add)', 'add-exp': 'Added exponents (should multiply)', 'div-exp': 'Divided exponents (should subtract)', 'sub-wrong': 'Added exponents (should subtract)',
    'no-one': 'Forgot the invisible exponent 1', base: 'Changed the base', 'single-power': 'Not written as a single power', 'pair-fails': 'A pair that doesn’t work',
    'one-pair': 'Only one pair', 'not-whole': 'Not a whole number', 'coef-added': 'Added coefficients instead of multiplying', 'coef-not-raised': 'Didn’t raise the coefficient',
    'coef-times': 'Multiplied coefficient by the exponent', 'coef-sub': 'Subtracted coefficients instead of dividing', 'exp-simplify': 'Exponent not simplified', 'as-power': 'Not written as a power',
    'minus-dist': 'Didn’t subtract the whole exponent (bracket)', 'n-squared': 'Treated (cⁿ)ⁿ as c²ⁿ', 'pos-only': 'Missed the negative answer', 'not-x3': 'Didn’t use the required part',
    'divided-total': 'Divided by the wrong number', 'with-coef': 'Included the coefficient in the power', 'subtracted': 'Subtracted instead of dividing', 'multiplied': 'Multiplied instead of dividing'
  });

  /* ---------- small helpers ---------- */
  var LET = 'abcdhkmnpqrstuvwxyz'.split('');
  function lets(r, k) { return r.sample(LET, k); }
  function pw(b, e) { return b + '^{' + e + '}'; }
  function par(s) { return '\\left(' + s + '\\right)'; }
  function fr(p, q) { return '\\frac{' + p + '}{' + q + '}'; }
  function dfr(p, q) { return '\\dfrac{' + p + '}{' + q + '}'; }
  function rep(f, n, sep) { var a = []; for (var i = 0; i < n; i++) a.push(f); return a.join(sep == null ? '\\times ' : sep); }
  function gcd(a, b) { return ex.gcd(a, b); }
  function px(s) { var p = ex.parse(s); if (!p.ok) throw new Error('bad TeX ' + s + ' (' + p.code + ')'); return p.ast; }
  function varsOf(a, acc) { (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(a); return acc; }
  function same(a, b) { var vs = Object.keys(varsOf(b, varsOf(a, {}))); if (!vs.length) return ex.eq(ex.value(a), ex.value(b)); return ex.equiv(a, b, vs, 6); }
  function strip(a) { while (a && a.t === 'paren') a = a.a; return a; }
  function fracs(r, maxQ) { var out = []; for (var q = 2; q <= (maxQ || 9); q++) for (var p = 1; p < q; p++) if (gcd(p, q) === 1) out.push([p, q]); return r ? r.pick(out) : out; }
  function pickWhere(gen, test) { for (var i = 0; i < 500; i++) { var v = gen(); if (test(v)) return v; } throw new Error('pickWhere failed'); }
  function cT(c, v) { return (c === 1 ? '' : c === -1 ? '-' : String(c)) + v; } // coefficient in front of a variable part
  function signed(n) { return n < 0 ? '(' + n + ')' : String(n); }

  /* ---------- checkers ---------- */
  /* any expression equal to tgt; diags: [[tex, code, hint]] matched by equivalence */
  function exprEq(tgt, diags) {
    var T = px(tgt), D = (diags || []).filter(function (d) { return !same(px(d[0]), T); });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (same(a.ast, T)) return ok();
      for (var i = 0; i < D.length; i++) if (same(a.ast, px(D[i][0]))) return wrong(D[i][1], D[i][2]);
      return wrong('value', null);
    };
  }
  /* the power itself: one base with one exponent, compared part by part (so (−3)² and 3² are different) */
  function powerEq(baseTex, expTex, diags) {
    var B = px(baseTex), E = px(expTex), D = diags || [];
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var top = strip(a.ast);
      if (top.t !== 'pow') {
        if (same(a.ast, px(pw(par(baseTex), expTex)))) return form('as-power', 'Write the power itself — a base with an exponent — not its value.');
        for (var i = 0; i < D.length; i++) if (same(a.ast, px(D[i][0]))) return wrong(D[i][1], D[i][2]);
        return wrong('value', 'A power is written as a base with an exponent, like ' + t('b^{n}') + '. Which part of the expression is it?');
      }
      if (same(top.a, B) && same(top.b, E)) return ok();
      for (var j = 0; j < D.length; j++) if (same(a.ast, px(D[j][0]))) return wrong(D[j][1], D[j][2]);
      return wrong('value', null);
    };
  }
  /* repeated multiplication: the same factors as the target (any order), no exponents left */
  function leafOf(x) { return x.t === 'num' ? String(x.v) : x.n; }
  function leaves(ast) {
    var st = { num: [], den: [], sign: 1, bad: null };
    (function w(x, inv) {
      var N = inv ? st.den : st.num;
      if (x.t === 'paren') return w(x.a, inv);
      if (x.t === 'mul') { w(x.a, inv); w(x.b, inv); return; }
      if (x.t === 'div') { w(x.a, inv); w(x.b, !inv); return; }
      if (x.t === 'neg') { var y = strip(x.a); if (y.t === 'num' || y.t === 'var') { N.push('-' + leafOf(y)); return; } st.sign = -st.sign; w(x.a, inv); return; }
      if (x.t === 'num' || x.t === 'var') { N.push(leafOf(x)); return; }
      if (!st.bad) st.bad = x.t;
    })(ast, false);
    st.key = st.sign + '|' + st.num.slice().sort().join(',') + '|' + st.den.slice().sort().join(',');
    st.count = st.num.length + st.den.length;
    return st;
  }
  function repMul(tgt, baseTex, n, diags) {
    var T = px(tgt), TL = leaves(T), D = (diags || []).filter(function (d) { return !same(px(d[0]), T); });
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var L = leaves(a.ast);
      if (same(a.ast, T)) {
        if (L.bad === 'pow') return form('exp-left', 'Right value — but the question asks for <b>repeated multiplication</b>: write every factor out, with no exponents.');
        if (!L.bad && L.key === TL.key) return ok();
        return form('not-repeated', 'Right value — now show the repeated multiplication: the base ' + t(baseTex) + ' is used as a factor ' + n + ' times, so each of its factors should appear ' + n + ' times.');
      }
      if (L.bad === 'add' || L.bad === 'sub') return wrong('added', 'An exponent means repeated <b>multiplication</b>, not repeated addition. Use ' + t('\\times') + ' between the factors.');
      for (var i = 0; i < D.length; i++) if (same(a.ast, px(D[i][0]))) return wrong(D[i][1], D[i][2]);
      if (!L.bad && L.count !== TL.count) return wrong('count', 'Count your factors: the exponent ' + t(n) + ' says the base ' + t(baseTex) + ' is used as a factor ' + n + ' times.');
      return wrong('value', null);
    };
  }
  /* one base with one exponent, equal to bv^e (numeric). rows: [[wrongExponent, code, hint]] */
  function singlePow(bv, e, rows, signHint) {
    var V = Math.pow(bv, e);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var top = strip(a.ast), neg = false;
      if (top.t === 'neg') { neg = true; top = strip(top.a); }
      if (ex.eq(a.val, V)) return top.t === 'pow' ? ok() : form('single-power', 'Right value — but this box wants the <b>simpler form</b>: one base with one exponent, like ' + t('a^{n}') + '. Put the value in the next box.');
      if (top.t === 'pow' && !neg) {
        var b = ex.value(top.a), x = ex.value(top.b);
        if (ex.eq(b, bv)) { for (var i = 0; i < (rows || []).length; i++) if (ex.eq(x, rows[i][0])) return wrong(rows[i][1], rows[i][2]); return wrong('exp', 'Keep the base ' + t(signed(bv)) + ' and check the exponent. Product law: add. Quotient law: subtract. Power of a power: multiply.'); }
        if (!ex.eq(Math.abs(b), Math.abs(bv)) && ex.eq(x, e)) return wrong('base', 'The exponent laws change only the exponent — keep the base the same.');
      }
      if (ex.eq(a.val, -V)) return wrong('sign', signHint || 'Check the sign.');
      return wrong('value', null);
    };
  }
  /* symbolic exponents: K.expo, plus each base written once and every exponent simplified (like terms collected, no brackets) */
  function monoSig(x) {
    var vs = [], okk = true;
    (function w(y) { if (y.t === 'mul') { w(y.a); w(y.b); } else if (y.t === 'neg') w(y.a); else if (y.t === 'var') vs.push(y.n); else if (y.t !== 'num') okk = false; })(x);
    return okk ? vs.sort().join(',') : null;
  }
  function linOk(e) {
    var terms = [];
    (function split(x) { if (x.t === 'add' || x.t === 'sub') { split(x.a); split(x.b); } else if (x.t === 'neg' && (strip(x.a).t === 'add')) terms.push(null); else terms.push(x); })(strip(e));
    var seen = {};
    for (var i = 0; i < terms.length; i++) { if (!terms[i]) return false; var s = monoSig(terms[i]); if (s == null || seen[s]) return false; seen[s] = 1; }
    return true;
  }
  function negLead(e) { e = strip(e); return e.t === 'neg' || (e.t === 'mul' && negLead(e.a)) || (e.t === 'num' && e.v < 0); }
  function symShape(ast) {
    var count = {}, bad = null;
    (function w(x) {
      if (!x || typeof x !== 'object' || bad) return;
      if (x.t === 'pow') { var b = strip(x.a); if (b.t === 'var') { count[b.n] = (count[b.n] || 0) + 1; if (negLead(x.b)) bad = 'neg'; else if (!linOk(x.b)) bad = 'exp'; return; } w(x.a); return; }
      if (x.t === 'var') { count[x.n] = (count[x.n] || 0) + 1; return; }
      ['a', 'b'].forEach(function (k) { if (x[k]) w(x[k]); });
    })(ast);
    if (bad === 'neg') return form('neg-exp', 'Right value — now write it with <b>positive exponents</b> only: put a power with a negative exponent on the other side of the fraction bar.');
    if (bad === 'exp') return form('exp-simplify', 'Right — now simplify the exponent: expand any brackets and collect like terms (for example ' + t('n+n+3=2n+3') + ').');
    var rp = Object.keys(count).filter(function (v) { return count[v] > 1; });
    if (rp.length) return form('combine', 'Right value — now combine the powers of ' + t(rp[0]) + ' into a single power.');
    return null;
  }
  function symPow(tgt, alts) {
    var base = K.expo(tgt, {}), A = (alts || []).filter(function (d) { return !same(px(d[0]), px(tgt)); });
    return function (resp) {
      var r0 = base(resp);
      if (r0.v === 'correct') { var s = symShape(ex.parse(resp).ast); return s || ok(); }
      if (r0.v === 'form') { if (r0.code === 'zero-exp') { var s0 = symShape(ex.parse(resp).ast); if (s0) return s0; } return r0; } // K.expo reads an exponent letter that cancels (z^{2n+7}/z^{2n}) as "n^0": say "combine the powers" instead
      var a = ex.parse(resp);
      if (a.ok) for (var i = 0; i < A.length; i++) if (same(a.ast, px(A[i][0]))) return wrong(A[i][1], A[i][2]);
      return r0;
    };
  }
  /* K.expo diagnosis tables. rows: [[test(an), code, hint]] */
  function dg(rows) { return function (an) { for (var i = 0; i < rows.length; i++) if (rows[i][0](an)) return { code: rows[i][1], hint: rows[i][2] }; return null; }; }
  function eIs(v, n) { return function (an) { var e = an.vars && an.vars[v]; return !!e && e[1] === 1 && e[0] === n; }; }
  function cIs(n) { return function (an) { return !!an.coef && an.coef[0] === n * an.coef[1]; }; }
  function cFr(p, q) { return function (an) { return !!an.coef && an.coef[0] * q === p * an.coef[1]; }; }
  function both(f, g) { return function (an) { return f(an) && g(an); }; }

  /* ---------- part makers ---------- */
  function mathPart(prompt, check, key, sol, hints, text, vars, extra) {
    var p = P.math(prompt, check, key, sol, hints, text, { keys: 'expo', vars: vars || [] });
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }
  function expoPart(prompt, tgt, diagRows, sol, hints, text, extra) {
    var p = P.expo(prompt, tgt, diagRows ? { diag: dg(diagRows) } : {}, sol, hints, text);
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }
  function numPart(prompt, ans, diag, sol, hints, text, extra) {
    var p = P.number(prompt, ans, function (v) { var rows = diag || []; for (var i = 0; i < rows.length; i++) if (rows[i][0] !== ans && Math.abs(v - rows[i][0]) < 1e-9) return { code: rows[i][1], hint: rows[i][2] }; return null; }, sol, hints, text);
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }
  function valDiag(rows, ans) { return function (v) { for (var i = 0; i < rows.length; i++) if (!ex.eq(rows[i][0], ans) && ex.eq(v, rows[i][0])) return { code: rows[i][1], hint: rows[i][2] }; return null; }; }
  function fracPart(prompt, pq, rows, sol, hints, text, extra) {
    var ans = pq[0] / pq[1], p = P.fraction(prompt, pq, { diag: valDiag(rows || [], ans) }, sol, hints, text);
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }

  /* Q1 / Q2 / EP1 — vocabulary */
  function baseExpPart(powTex, baseTex, expTex, vars, bDiag, eDiag, sol, text) {
    var fl = [{ name: 'Base', label: 'base', mode: 'math', keys: 'expo', vars: vars }, { name: 'Exponent', label: 'exponent', mode: 'math', keys: 'expo', vars: vars }];
    return P.fields(t(powTex), fl, [exprEq(baseTex, bDiag), exprEq(expTex, eDiag)], [baseTex, expTex], 'base ' + t(baseTex) + ', exponent ' + t(expTex), sol,
      ['The <b>base</b> is the factor being repeated — everything inside the brackets, if there are brackets. The <b>exponent</b> is the small raised number or letter.'], text);
  }
  function fourPart(exprTex, base, expo, coef, vars, sol, text, D) {
    var fl = [{ name: 'Power', label: 'power', mode: 'math', keys: 'expo', vars: vars }, { name: 'Base', label: 'base', mode: 'math', keys: 'expo', vars: vars },
      { name: 'Exponent', label: 'exponent', mode: 'math', keys: 'expo', vars: vars }, { name: 'Coefficient', label: 'coefficient', mode: 'math', keys: 'expo', vars: vars }];
    var powKey = pw(/^-|\\frac/.test(base) || base.length > 1 ? par(base) : base, expo);
    return P.fields(t(exprTex), fl, [powerEq(base, expo, D.pow), exprEq(base, D.base), exprEq(expo), exprEq(coef, (D.coef || []).concat([['0', 'coef-zero', 'If no number multiplies the power, the coefficient is understood to be ' + t('1') + '.']]))],
      [powKey, base, expo, coef], 'power ' + t(powKey) + ', base ' + t(base) + ', exponent ' + t(expo) + ', coefficient ' + t(coef), sol,
      ['The <b>power</b> is the base with its exponent (everything inside the fence); the <b>coefficient</b> is the number multiplying it — a lone minus sign in front means ' + t('-1') + ', nothing at all means ' + t('1') + '.'], text);
  }

  /* Q3 / EP3 — repeated multiplication */
  function repPart(exprTex, tgt, baseTex, n, diags, sol, text) {
    var vs = Object.keys(varsOf(px(tgt), {})).sort();
    return mathPart(t(exprTex), repMul(tgt, baseTex, n, diags), tgt, sol,
      ['The exponent tells how many times the base is used as a factor. Only what is inside the brackets (the fence) is repeated; a coefficient outside is written once.'], text, vs,
      { good: [tgt.split('\\times ').reverse().join('\\times ')], bad: [exprTex] });
  }

  /* Q4, Q5, EP4 — negative bases */
  function negPart(kind, k, e) { // kind 'out' = −kᵉ, 'in' = (−k)ᵉ
    var tex = kind === 'out' ? '-' + pw(k, e) : pw(par('-' + k), e), val = kind === 'out' ? -Math.pow(k, e) : Math.pow(-k, e), other = kind === 'out' ? Math.pow(-k, e) : -Math.pow(k, e);
    var rows = [[other, 'fence', kind === 'out' ? 'No brackets: the exponent applies only to ' + t(k) + '. Work out ' + t(pw(k, e)) + ' first, then put the minus sign in front.' : 'The brackets make ' + t('-' + k) + ' the base, so multiply ' + t(signed(-k)) + ' by itself ' + e + ' times.'],
      [-val, 'sign', e % 2 ? 'An odd number of negative factors gives a negative product.' : 'Check the sign.'], [kind === 'out' ? -k * e : -k * e, 'times-exp', 'The exponent isn’t a multiplier: ' + t(pw(k, e)) + ' means ' + t(rep(k, e)) + '.'], [k * e, 'times-exp', 'The exponent isn’t a multiplier: ' + t(pw(k, e)) + ' means ' + t(rep(k, e)) + '.']];
    var sol = kind === 'out' ? 'No brackets, so the fence holds only ' + t(k) + ': ' + t(tex + '=-\\left(' + rep(k, e) + '\\right)=' + val) + '.'
      : 'The fence holds ' + t('-' + k) + ': ' + t(tex + '=' + rep(par('-' + k), e, '') + '=' + val) + (e % 2 ? ' (odd exponent: negative).' : ' (even exponent: positive).');
    return numPart(t(tex), val, rows, sol, ['Brackets decide the base. In ' + t('-a^{n}') + ' only ' + t('a') + ' is raised to the power; in ' + t('(-a)^{n}') + ' the base is ' + t('-a') + '.'], tex.replace(/\\left|\\right/g, ''));
  }

  /* Q8 — simplify with a law, then evaluate. bTex: base as written in the answer power; val: number or [p,q]; only: 'integer'|'fraction'|'decimal' */
  function lawEval(promptTex, bv, bTex, e, val, valTex, only, rows, sol, hints, text, signHint) {
    var fl = [{ name: 'Simpler form', label: 'simpler form', mode: 'math', keys: 'expo' }, { name: 'Value', label: 'value', mode: 'math', keys: 'expo' }];
    var ansV = typeof val === 'number' ? val : val[0] / val[1];
    var vd = rows.map(function (rw) { return [Math.pow(bv, rw[0]), rw[1], rw[2]]; });
    var vchk = K.value(val, { only: only === 'decimal' ? 'fraction' : only, diag: valDiag(vd, ansV) }); // a decimal answer may also be given as an exact fraction (6.25 or 25/4)
    var key2 = typeof val === 'number' ? String(val) : only === 'decimal' ? String(val[0] / val[1]) : fr(val[0], val[1]);
    return P.fields(t(promptTex), fl, [singlePow(bv, e, rows, signHint), vchk], [pw(bTex, e), key2], t(pw(bTex, e) + '=' + valTex), sol, hints, text);
  }

  /* MC helper with keepOrder false */
  function mc(r, prompt, opts, sol, hints, text, keep) { return P.mc(r, prompt, opts, sol, hints, text, keep); }

  /* the law reminders used in solutions */
  var LAW = {
    prod: 'Product Law: add the exponents', quot: 'Quotient Law: subtract the exponents', pp: 'Power of a Power Law: multiply the exponents',
    prodP: 'Power of a Product Law: raise every factor to the power', quotP: 'Power of a Quotient Law: raise the top and the bottom to the power'
  };

  HW.defineLesson({
    id: 'u2l1', unit: 2, num: '1', title: 'Understanding Powers and the Exponent Laws', outcome: 'AN3',
    blurb: 'Base, exponent and coefficient; where the brackets put the fence (−3² vs (−3)²); the zero exponent; and the five exponent laws rebuilt from repeated multiplication.',
    questions: [
      /* ===================== Part A ===================== */
      { num: '1', section: 'Part A — Power Vocabulary and Repeated Multiplication', stem: 'State the base and the exponent in each of the following powers.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          var k = r.int(2, 9), n = r.pick([2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x !== k; }));
          return baseExpPart(pw(k, n), String(k), String(n), [], [[String(n), 'swapped', 'That’s the exponent. The base is the big number on the bottom.']], [[String(k), 'swapped', 'That’s the base. The exponent is the small raised number.']],
            'The base is the factor being repeated: ' + t(k) + '. The exponent is ' + t(n) + ': ' + t(pw(k, n) + '=' + rep(k, n)) + '.', 'base/exponent of ' + k + '^' + n);
        } },
        { id: '1b', level: 'LIM', make: function (r) {
          var v = r.pick(LET), n = r.int(11, 30);
          return baseExpPart(pw(v, n), v, String(n), [v], null, null, 'Base ' + t(v) + ' (the factor being repeated), exponent ' + t(n) + ' (how many times it is used).', 'base/exponent of ' + v + '^' + n);
        } },
        { id: '1c', level: 'LIM', make: function (r) {
          var k = r.int(2, 9), v = r.pick(LET);
          return baseExpPart(pw(k, v), String(k), v, [v], [[v, 'swapped', 'The letter is the exponent here. The base is the number being repeated.']], [[String(k), 'swapped', 'That’s the base. The exponent is the raised letter.']],
            'An exponent can be a letter. The base is ' + t(k) + ' and the exponent is ' + t(v) + '.', 'base/exponent of ' + k + '^' + v);
        } },
        { id: '1d', level: 'BEG', make: function (r) {
          var v = r.pick(LET), n = r.pick([3, 5, 7, 9]);
          return baseExpPart(pw(par('-' + v), n), '-' + v, String(n), [v], [[v, 'fence', 'The brackets put the minus sign inside the fence, so it is part of the base.']], null,
            'The brackets (the fence) hold ' + t('-' + v) + ', so the base is ' + t('-' + v) + ' and the exponent is ' + t(n) + '.', 'base/exponent of (-' + v + ')^' + n);
        } },
        { id: '1e', level: 'BEG', make: function (r) {
          var f = fracs(r, 9), n = r.int(3, 9), b = fr(f[0], f[1]);
          return baseExpPart(pw(par(dfr(f[0], f[1])), n), b, String(n), [], [[String(f[0]), 'part-base', 'The brackets hold the whole fraction, so the whole fraction is the base.'], [String(f[1]), 'part-base', 'The brackets hold the whole fraction, so the whole fraction is the base.']], null,
            'The fence holds the whole fraction: base ' + t(b) + ', exponent ' + t(n) + '.', 'base/exponent of (' + f[0] + '/' + f[1] + ')^' + n);
        } }] },
      { num: '2', stem: 'State the coefficient in each of the following.', parts: [
        { id: '2a', level: 'LIM', make: function (r) {
          var c = r.int(2, 9), v = r.pick(LET), n = r.pick([2, 3, 4, 5, 6, 7].filter(function (x) { return x !== c; }));
          return numPart(t(c + pw(v, n)), c, [[n, 'coef-exp', 'That’s the exponent. The coefficient is the number multiplying the power.']], 'The number multiplying ' + t(pw(v, n)) + ' is ' + t(c) + ', so the coefficient is ' + t(c) + '.', ['The coefficient is the number in front, multiplying the power.'], 'coefficient of ' + c + v + '^' + n);
        } },
        { id: '2b', level: 'LIM', make: function (r) {
          var c = r.int(2, 9), v = r.pick(LET), n = r.pick([2, 3, 4, 5, 6].filter(function (x) { return x !== c; }));
          return numPart(t('-' + c + pw(v, n)), -c, [[c, 'coef-sign', 'The minus sign belongs to the coefficient.'], [n, 'coef-exp', 'That’s the exponent.']], t('-' + c + pw(v, n) + '=(-' + c + ')\\times ' + pw(v, n)) + ', so the coefficient is ' + t('-' + c) + '.', ['Include the sign: the coefficient is the whole number in front, sign and all.'], 'coefficient of -' + c + v + '^' + n);
        } },
        { id: '2c', level: 'BEG', make: function (r) {
          var v = r.pick(LET), n = r.int(2, 9);
          return numPart(t(pw(v, n)), 1, [[0, 'coef-zero', 'No number is written, but the power is still there once: ' + t(pw(v, n) + '=1\\cdot ' + pw(v, n)) + '.'], [n, 'coef-exp', 'That’s the exponent.']], t(pw(v, n) + '=1\\cdot ' + pw(v, n)) + ', so the coefficient is understood to be ' + t('1') + '.', ['If no number is written in front of a power, what is it multiplied by?'], 'coefficient of ' + v + '^' + n);
        } },
        { id: '2d', level: 'BEG', make: function (r) {
          var v = r.pick(LET), n = r.int(2, 6), d = r.pick([3, 4, 5, 6, 7, 8, 9].filter(function (x) { return x !== n; }));
          return fracPart(t(dfr(pw(v, n), d)), [1, d], [[d, 'coef-den', 'Dividing by ' + t(d) + ' is the same as multiplying by ' + t(fr(1, d)) + '.'], [n, 'coef-exp', 'That’s the exponent.'], [1, 'coef-den', 'The power is divided by ' + t(d) + ', so the coefficient isn’t ' + t('1') + '.']],
            t(dfr(pw(v, n), d) + '=' + fr(1, d) + pw(v, n)) + ', so the coefficient is ' + t(fr(1, d)) + '.', ['Dividing by a number is the same as multiplying by its reciprocal.'], 'coefficient of ' + v + '^' + n + '/' + d);
        } }] },
      { num: '3', stem: 'Write each of the following as a repeated multiplication.',
        shared: function (r) { var vw = lets(r, 2); return { c: r.int(2, 5), v: vw[0], w: vw[1], n: r.pick([2, 2, 3]) }; },
        parts: [
          { id: '3a', level: 'LIM', make: function (r) { var v = r.pick(LET), n = r.int(3, 6); return repPart(pw(v, n), rep(v, n), v, n, null, t(pw(v, n) + '=' + rep(v, n)) + ' — the base ' + t(v) + ' is used ' + n + ' times.', 'repeated mult ' + v + '^' + n); } },
          { id: '3b', level: 'BEG', make: function (r) { var c = r.int(2, 9), v = r.pick(LET), n = r.int(2, 4);
            return repPart(c + pw(v, n), c + '\\times ' + rep(v, n), v, n, [[pw(par(c + v), n), 'coef-repeated', 'Only ' + t(v) + ' is raised to the power ' + t(n) + '; the ' + t(c) + ' is a coefficient, written once.']], 'Only ' + t(v) + ' is raised to the power: ' + t(c + pw(v, n) + '=' + c + '\\times ' + rep(v, n)) + '.', 'repeated mult ' + c + v + '^' + n); } },
          { id: '3c', level: 'BEG', make: function (r) { var vw = lets(r, 2), n = r.pick([2, 2, 3]), b = vw[0] + vw[1];
            return repPart(pw(par(b), n), rep(vw[0] + '\\times ' + vw[1], n), b, n, [[vw[0] + pw(vw[1], n), 'part-base', 'The bracket holds ' + t(b) + ', so both letters are repeated.'], [pw(vw[0], n) + vw[1], 'part-base', 'The bracket holds ' + t(b) + ', so both letters are repeated.']],
              'The fence holds ' + t(b) + ': ' + t(pw(par(b), n) + '=' + rep(par(b), n, '\\times ') + '=' + rep(vw[0] + '\\times ' + vw[1], n)) + '.', 'repeated mult (' + b + ')^' + n); } },
          { id: '3d', level: 'BEG', make: function (r) { var k = r.int(2, 9), n = r.pick([3, 3, 4]);
            return repPart(pw(par('-' + k), n), rep(par('-' + k).replace(/\\left|\\right/g, ''), n), '-' + k, n, [['-' + pw(k, n), 'fence', 'The bracket holds ' + t('-' + k) + ', so the negative is part of every factor.']], 'The fence holds ' + t('-' + k) + ': ' + t(pw(par('-' + k), n) + '=' + rep('(-' + k + ')', n)) + '.', 'repeated mult (-' + k + ')^' + n); } },
          { id: '3e', level: 'BEG', make: function (r) { var vw = lets(r, 2), n = r.pick([2, 2, 3]);
            return repPart(pw(vw[0], n) + vw[1], rep(vw[0], n) + '\\times ' + vw[1], vw[0], n, [[pw(par(vw[0] + vw[1]), n), 'part-base', 'Only ' + t(vw[0]) + ' carries the exponent; ' + t(vw[1]) + ' appears once.']], 'Only ' + t(vw[0]) + ' is raised to the power: ' + t(pw(vw[0], n) + vw[1] + '=' + rep(vw[0], n) + '\\times ' + vw[1]) + '.', 'repeated mult ' + vw[0] + '^' + n + vw[1]); } },
          { id: '3f', level: 'EMG', make: function (r) { var f = fracs(r, 7), c = r.int(2, 5), n = r.pick([2, 3, 3]), b = fr(f[0], f[1]);
            return repPart(c + pw(par(dfr(f[0], f[1])), n), c + '\\times ' + rep(b, n), b, n, [[pw(par(c + '\\times' + b), n), 'coef-repeated', 'The ' + t(c) + ' is outside the brackets: it is a coefficient, written once.'], [c + '\\times' + fr(pw(f[0], n), f[1]), 'part-base', 'The bracket holds the whole fraction, so the whole fraction is repeated.']],
              'The fence holds ' + t(b) + '; the ' + t(c) + ' outside is written once: ' + t(c + '\\times ' + rep(b, n)) + '.', 'repeated mult ' + c + '(' + f[0] + '/' + f[1] + ')^' + n); } },
          { id: '3g', level: 'BEG', make: function (r) { var c = r.int(2, 9), v = r.pick(LET), n = r.pick([2, 3, 3]);
            return repPart(pw(par(c + v), n), rep(c + '\\times ' + v, n), c + v, n, [[c + pw(v, n), 'coef-once', 'The ' + t(c) + ' is inside the brackets, so it is repeated too.']], 'The fence holds ' + t(c + v) + ': ' + t(pw(par(c + v), n) + '=' + rep('(' + c + v + ')', n) + '=' + rep(c + '\\times ' + v, n)) + '.', 'repeated mult (' + c + v + ')^' + n); } },
          { id: '3h', level: 'BEG', make: function (r, s) {
            return repPart(s.c + s.v + pw(s.w, s.n), s.c + '\\times ' + s.v + '\\times ' + rep(s.w, s.n), s.w, s.n, [[s.c + pw(par(s.v + s.w), s.n), 'part-base', 'Only ' + t(s.w) + ' is raised to the power.'], [pw(par(s.c + s.v + s.w), s.n), 'part-base', 'Only ' + t(s.w) + ' is raised to the power.']],
              'Only ' + t(s.w) + ' carries the exponent: ' + t(s.c + s.v + pw(s.w, s.n) + '=' + s.c + '\\times ' + s.v + '\\times ' + rep(s.w, s.n)) + '.', 'repeated mult ' + s.c + s.v + s.w + '^' + s.n); } },
          { id: '3i', level: 'EMG', make: function (r, s) { var b = s.v + s.w;
            return repPart(s.c + pw(par(b), s.n), s.c + '\\times ' + rep(s.v + '\\times ' + s.w, s.n), b, s.n, [[s.c + s.v + pw(s.w, s.n), 'part-base', 'The bracket holds ' + t(b) + ', so both letters are repeated.'], [pw(par(s.c + b), s.n), 'coef-repeated', 'The ' + t(s.c) + ' is outside the brackets, so it is written once.']],
              'The fence holds ' + t(b) + ', with the ' + t(s.c) + ' outside: ' + t(s.c + '\\times ' + rep('(' + b + ')', s.n) + '=' + s.c + '\\times ' + rep(s.v + '\\times ' + s.w, s.n)) + '.', 'repeated mult ' + s.c + '(' + b + ')^' + s.n); } },
          { id: '3j', level: 'EMG', make: function (r, s) { var b = s.c + s.v + s.w;
            return repPart(pw(par(b), s.n), rep(s.c + '\\times ' + s.v + '\\times ' + s.w, s.n), b, s.n, [[s.c + pw(par(s.v + s.w), s.n), 'coef-once', 'The ' + t(s.c) + ' is inside the brackets, so it is repeated too.'], [s.c + s.v + pw(s.w, s.n), 'part-base', 'The bracket holds all of ' + t(b) + '.']],
              'The fence holds ' + t(b) + ': ' + t(rep('(' + b + ')', s.n) + '=' + rep(s.c + '\\times ' + s.v + '\\times ' + s.w, s.n)) + ' ' + '(' + t('=' + Math.pow(s.c, s.n) + pw(s.v, s.n) + pw(s.w, s.n)) + ').', 'repeated mult (' + b + ')^' + s.n); } }] },

      /* ===================== Part B ===================== */
      { num: '4', section: 'Part B — Evaluating Powers, Negative Bases and the Zero Exponent', stem: 'Evaluate.',
        shared: function (r) { return { k: r.pick([2, 3, 4, 4, 5, 6, 7, 8]) }; },
        parts: [
          { id: '4a', level: 'BEG', make: function (r) {
            var b = r.pick([2, 2, 3]), n = b === 2 ? r.int(6, 10) : r.int(4, 6), v = Math.pow(b, n);
            return numPart(t(pw(b, n)), v, [[b * n, 'times-exp', 'The exponent isn’t a multiplier: ' + t(pw(b, n)) + ' means ' + t(b) + ' multiplied by itself ' + n + ' times.'], [Math.pow(b, n - 1), 'off-one', 'Count again: you need ' + n + ' factors of ' + t(b) + '.'], [Math.pow(b, n + 1), 'off-one', 'Count again: you need ' + n + ' factors of ' + t(b) + '.']],
              t(pw(b, n) + '=' + rep(b, n) + '=' + F(v)) + '.', ['Multiply ' + t(b) + ' by itself ' + n + ' times.'], b + '^' + n);
          } },
          { id: '4b', level: 'EMG', make: function (r, s) { return negPart('out', s.k, 2); } },
          { id: '4c', level: 'BEG', make: function (r, s) { return negPart('in', s.k, 2); } },
          { id: '4d', level: 'BEG', make: function (r, s) { return negPart('in', s.k, 3); } },
          { id: '4e', level: 'EMG', make: function (r, s) { return negPart('out', s.k, 3); } },
          { id: '4f', level: 'EMG', make: function (r) {
            var f = r.pick([[5, 8], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [4, 7], [5, 9], [7, 8]]), a = f[0], b = f[1], n = 3;
            return fracPart(t(pw(par(dfr(a, b)), n)), [Math.pow(a, n), Math.pow(b, n)], [[Math.pow(a, n) / b, 'num-only', 'The bracket holds the whole fraction: cube the denominator too.'], [a / Math.pow(b, n), 'num-only', 'The bracket holds the whole fraction: cube the numerator too.'], [3 * a / (3 * b), 'times-num', 'Cubing isn’t multiplying by 3.']],
              LAW.quotP + ': ' + t(pw(par(fr(a, b)), n) + '=' + fr(pw(a, n), pw(b, n)) + '=' + fr(Math.pow(a, n), Math.pow(b, n))) + '.', ['Raise the numerator and the denominator to the power.'], '(' + a + '/' + b + ')^3');
          } }] },
      { num: '5', stem: 'Evaluate without using a calculator.',
        shared: function (r) { return { k: r.pick([5, 6, 7, 8, 9, 9]) }; },
        parts: [
          { id: '5a', level: 'EMG', make: function (r, s) { return negPart('out', s.k, 2); } },
          { id: '5b', level: 'BEG', make: function (r, s) { return negPart('in', s.k, 2); } },
          { id: '5c', level: 'EMG', make: function (r, s) { return negPart('out', s.k, 3); } },
          { id: '5d', level: 'EMG', make: function (r, s) { return negPart('in', s.k, 3); } }] },
      { num: '6', stem: function (sh) { return 'Explain why ' + t('-' + sh.k + '^{0}') + ' and ' + t(pw(par('-' + sh.k), 0)) + ' have different values.'; },
        shared: function (r) { return { k: r.int(2, 12) }; },
        parts: [
          { id: '6a', level: 'EMG', make: function (r, s) {
            var k = s.k, fl = [{ name: t('-' + k + '^{0}'), label: t('-' + k + '^{0}=') }, { name: t(pw('(-' + k + ')', 0)), label: t(pw(par('-' + k), 0) + '=') }];
            return P.fields('First evaluate both.', fl, [K.number(-1, function (v) { return v === 1 ? { code: 'fence', hint: 'No brackets: the exponent ' + t(0) + ' applies only to ' + t(k) + '. The minus sign stays out front.' } : v === 0 ? { code: 'zero-is-0', hint: 'Any nonzero base to the exponent ' + t(0) + ' is ' + t(1) + ', not ' + t(0) + '.' } : v === -k ? { code: 'zero-is-base', hint: t(pw(k, 0)) + ' is ' + t(1) + ', not ' + t(k) + '.' } : null; }),
              K.number(1, function (v) { return v === -1 ? { code: 'fence', hint: 'The brackets make ' + t('-' + k) + ' the base, and any nonzero base to the exponent ' + t(0) + ' is ' + t(1) + '.' } : v === 0 ? { code: 'zero-is-0', hint: 'Any nonzero base to the exponent ' + t(0) + ' is ' + t(1) + '.' } : null; })],
              ['-1', '1'], t('-' + k + '^{0}=-1') + ', ' + t(pw(par('-' + k), 0) + '=1'), t('-' + k + '^{0}=-\\left(' + pw(k, 0) + '\\right)=-1') + ' but ' + t(pw(par('-' + k), 0) + '=1') + ' (the base ' + t('-' + k) + ' is not zero).',
              ['Any nonzero base to the exponent ' + t(0) + ' is ' + t(1) + '. Which base does the exponent belong to in each one?'], '-' + k + '^0 vs (-' + k + ')^0');
          } },
          { id: '6b', level: 'EMG', make: function (r, s) {
            var k = s.k;
            return mc(r, 'Which statement explains the difference?', [
              { html: 'In ' + t('-' + k + '^{0}') + ' the exponent applies only to ' + t(k) + ', so it is ' + t('-(1)=-1') + '; in ' + t(pw(par('-' + k), 0)) + ' the base is ' + t('-' + k) + ', so it is ' + t('1') + '.', right: true },
              { html: 'A negative number to the power ' + t(0) + ' is ' + t('-1') + ', so only ' + t(pw(par('-' + k), 0)) + ' is ' + t('-1') + '.', why: 'Any nonzero base to the exponent ' + t(0) + ' is ' + t(1) + ' — even a negative base. Look at where the brackets are.' },
              { html: t('-' + k + '^{0}') + ' is ' + t('0') + ' because the exponent is ' + t(0) + '.', why: 'An exponent of ' + t(0) + ' gives ' + t(1) + ', not ' + t(0) + '.' },
              { html: 'They actually have the same value: both are ' + t('1') + '.', why: 'Evaluate each one: the minus sign outside the fence in ' + t('-' + k + '^{0}') + ' is never touched by the exponent.' }],
              t('-' + k + '^{0}=-(' + pw(k, 0) + ')=-1') + ': with no brackets the exponent applies only to the base ' + t(k) + '. ' + t(pw(par('-' + k), 0) + '=1') + ': the brackets make ' + t('-' + k) + ' the base, and any nonzero base to the power ' + t(0) + ' is ' + t(1) + '.',
              ['Which base does the exponent belong to in each expression?'], 'why -' + k + '^0 differs from (-' + k + ')^0');
          } }] },
      { num: '7', stem: 'Evaluate without using a calculator.', parts: [
        { id: '7a', level: 'LIM', make: function (r) { var n = r.int(11, 99);
          return numPart(t(pw(n, 0)), 1, [[0, 'zero-is-0', 'Any nonzero base to the exponent ' + t(0) + ' is ' + t(1) + ', not ' + t(0) + '.'], [n, 'zero-is-base', 'The exponent ' + t(0) + ' doesn’t leave the base unchanged — it gives ' + t(1) + '.']], 'Zero Exponent Law: ' + t(pw(n, 0) + '=1') + ' (the base is not zero).', ['What does the pattern ' + t('a^{3},a^{2},a^{1},a^{0}') + ' do each step?'], n + '^0'); } },
        { id: '7b', level: 'EMG', make: function (r) { var k = r.pick([1, 1, 1, 2, 3, 5, 7]);
          return numPart(t('-' + pw(k, 0)), -1, [[1, 'fence', 'No brackets: the exponent ' + t(0) + ' applies only to ' + t(k) + '. The minus sign stays out front.'], [0, 'zero-is-0', 'An exponent of ' + t(0) + ' gives ' + t(1) + ', not ' + t(0) + '.']], 'The exponent applies only to ' + t(k) + ': ' + t('-' + pw(k, 0) + '=-(' + pw(k, 0) + ')=-1') + '.', ['Is the minus sign inside the fence?'], '-' + k + '^0'); } },
        { id: '7c', level: 'BEG', make: function (r) { var f = fracs(r, 9);
          return numPart(t(pw(par('-' + dfr(f[0], f[1])), 0)), 1, [[-1, 'fence', 'The negative is inside the brackets, so the whole base ' + t('-' + fr(f[0], f[1])) + ' is raised to the power ' + t(0) + '.'], [0, 'zero-is-0', 'An exponent of ' + t(0) + ' gives ' + t(1) + '.']], 'The base ' + t('-' + fr(f[0], f[1])) + ' is not zero, so ' + t(pw(par('-' + fr(f[0], f[1])), 0) + '=1') + '.', ['Any nonzero base — even a negative fraction — to the exponent ' + t(0) + ' is ' + t(1) + '.'], '(-' + f[0] + '/' + f[1] + ')^0'); } },
        { id: '7d', level: 'EMG', make: function (r) { var a = r.int(2, 6), b = a * r.int(2, 4);
          return fracPart(t(fr(1, a) + pw(par(b), 0)), [1, a], [[b / a, 'coef-zeroed', 'Only ' + t('(' + b + ')') + ' carries the exponent ' + t(0) + '. Work out ' + t(pw('(' + b + ')', 0)) + ' first.'], [1, 'coef-zeroed', 'The exponent applies only to the bracket. The coefficient ' + t(fr(1, a)) + ' is not raised to the power ' + t(0) + '.'], [0, 'zero-is-0', t(pw('(' + b + ')', 0)) + ' is ' + t(1) + ', not ' + t(0) + '.']],
            t(pw('(' + b + ')', 0) + '=1') + ', so ' + t(fr(1, a) + '\\times 1=' + fr(1, a)) + '.', ['Only what is inside the brackets is raised to the power ' + t(0) + '.'], '1/' + a + '(' + b + ')^0'); } },
        { id: '7e', level: 'EMG', make: function (r) { var a = r.int(2, 6), b = a * r.int(2, 4), c = r.int(2, 3);
          return fracPart(t(fr(1, a) + pw(par(pw(b, c)), 0)), [1, a], [[Math.pow(b, c) / a, 'coef-zeroed', 'The outer exponent is ' + t(0) + ', so ' + t(pw(par(pw(b, c)), 0) + '=1') + '.'], [1, 'coef-zeroed', 'The coefficient ' + t(fr(1, a)) + ' is outside the brackets — it isn’t raised to the power ' + t(0) + '.'], [0, 'zero-is-0', 'Anything nonzero to the power ' + t(0) + ' is ' + t(1) + '.']],
            t(pw(par(pw(b, c)), 0) + '=1') + ' (the base ' + t(pw(b, c)) + ' is not zero), so the answer is ' + t(fr(1, a) + '\\times 1=' + fr(1, a)) + '.', ['Work from the outside: what is anything nonzero to the power ' + t(0) + '?'], '1/' + a + '(' + b + '^' + c + ')^0'); } }] },

      /* ===================== Part C ===================== */
      { num: '8', section: 'Part C — The Exponent Laws', stem: 'Write in a simpler form (one base, one exponent) and evaluate.', parts: [
        { id: '8a', level: 'BEG', make: function (r) {
          var x = pickWhere(function () { return [r.int(2, 6), r.int(2, 6), r.int(2, 5)]; }, function (x) { return x[1] !== x[2] && x[1] * x[2] !== x[1] + x[2] && Math.pow(x[0], x[1] + x[2]) <= 1e6 && Math.pow(x[0], x[1] + x[2]) >= 500; });
          var b = x[0], m = x[1], n = x[2], e = m + n, v = Math.pow(b, e);
          return lawEval(pw(b, m) + '\\cdot ' + pw(b, n), b, String(b), e, v, F(v), 'integer', [[m * n, 'mult-exp', 'Product Law: when you multiply powers with the same base, <b>add</b> the exponents.']],
            LAW.prod + ': ' + t(pw(b, m) + '\\cdot ' + pw(b, n) + '=' + pw(b, m + '+' + n) + '=' + pw(b, e) + '=' + F(v)) + '.', ['Write out the factors: how many ' + t(b) + 's are multiplied altogether?'], b + '^' + m + '*' + b + '^' + n);
        } },
        { id: '8b', level: 'BEG', make: function (r) {
          var x = pickWhere(function () { return [r.int(2, 6), r.int(2, 4), r.int(2, 4)]; }, function (x) { return x[1] * x[2] !== x[1] + x[2] && Math.pow(x[0], x[1] * x[2]) <= 1e6 && Math.pow(x[0], x[1] * x[2]) >= 200; });
          var b = x[0], m = x[1], n = x[2], e = m * n, v = Math.pow(b, e);
          return lawEval(pw(par(pw(b, m)), n), b, String(b), e, v, F(v), 'integer', [[m + n, 'add-exp', 'Power of a Power: the block ' + t(pw(b, m)) + ' is used ' + n + ' times, so <b>multiply</b> the exponents.'], [Math.pow(m, n), 'add-exp', 'Multiply the exponents: ' + t(m + '\\times ' + n) + '.']],
            LAW.pp + ': ' + t(pw(par(pw(b, m)), n) + '=' + pw(b, m + '\\times ' + n) + '=' + pw(b, e) + '=' + F(v)) + '.', ['How many factors of ' + t(b) + ' are in ' + n + ' copies of ' + t(pw(b, m)) + '?'], '(' + b + '^' + m + ')^' + n);
        } },
        { id: '8c', level: 'BEG', make: function (r) {
          var b = r.int(2, 9), d = b <= 4 ? r.pick([2, 3]) : 2, n = r.int(8, 18), m = n + d, v = Math.pow(b, d);
          return lawEval(dfr(pw(b, m), pw(b, n)), b, String(b), d, v, F(v), 'integer', [[m + n, 'sub-wrong', 'Quotient Law: when you divide powers with the same base, <b>subtract</b> the exponents.']],
            LAW.quot + ': ' + t(fr(pw(b, m), pw(b, n)) + '=' + pw(b, m + '-' + n) + '=' + pw(b, d) + '=' + v) + '.', ['Cancel the common factors: how many ' + t(b) + 's are left on top?'], b + '^' + m + '/' + b + '^' + n);
        } },
        { id: '8d', level: 'EMG', make: function (r) {
          var f = r.pick([[3, 4], [2, 3], [1, 2], [2, 5], [3, 5], [1, 3]]), n = f[1] <= 3 ? r.pick([2, 3]) : 2, e = n + 1, bt = par(fr(f[0], f[1])), bd = par(dfr(f[0], f[1]));
          var val = [Math.pow(f[0], e), Math.pow(f[1], e)];
          return lawEval(bd + pw(bd, n), f[0] / f[1], bt, e, val, fr(val[0], val[1]), 'fraction', [[n, 'no-one', 'The first factor ' + t(fr(f[0], f[1])) + ' has an invisible exponent ' + t(1) + '. Add it too.'], [2 * n, 'mult-exp', 'Product Law: add the exponents (the first factor has exponent ' + t(1) + ').']],
            LAW.prod + ' (' + t(fr(f[0], f[1]) + '=' + pw(bt, 1)) + '): ' + t(pw(bt, '1+' + n) + '=' + pw(bt, e) + '=' + fr(val[0], val[1])) + '.', ['A number written without an exponent has exponent ' + t(1) + '.'], '(' + f[0] + '/' + f[1] + ')(' + f[0] + '/' + f[1] + ')^' + n);
        } },
        { id: '8e', level: 'EMG', make: function (r) {
          var d = r.pick([[25, 10], [15, 10], [5, 10], [12, 10], [35, 10], [11, 10], [4, 10]]), bt = String(d[0] / 10), n = r.int(3, 6), m = n + 2, val = [d[0] * d[0], 100];
          return lawEval(dfr(pw(bt, m), pw(bt, n)), d[0] / 10, bt, 2, val, String(val[0] / 100), 'decimal', [[m + n, 'sub-wrong', 'Quotient Law: <b>subtract</b> the exponents.'], [m / n, 'div-exp', 'Subtract the exponents — don’t divide them.']],
            LAW.quot + ': ' + t(pw(bt, m + '-' + n) + '=' + pw(bt, 2) + '=' + bt + '\\times ' + bt + '=' + val[0] / 100) + '.', ['The base is a decimal, but the law is the same.'], bt + '^' + m + '/' + bt + '^' + n);
        } },
        { id: '8f', level: 'EMG', make: function (r) {
          var x = r.pick([[2, 3, 2], [2, 3, 2], [3, 2, 2], [2, 2, 2], [2, 2, 3], [3, 2, 3], [5, 2, 2]]), k = x[0], m = x[1], n = x[2], inner = -Math.pow(k, m), v = Math.pow(inner, n);
          return lawEval(pw(par('-' + pw(k, m)), n), inner, par(inner), n, v, String(v), 'integer', [],
            'The inner fence holds only ' + t(k) + ': ' + t('-' + pw(k, m) + '=' + inner) + '. Then ' + t(pw(par(inner), n) + '=' + v) + (n % 2 ? ' (odd exponent: negative).' : ' (even exponent: positive).'), ['Work inside the brackets first: what is ' + t('-' + pw(k, m)) + '?'], '(-' + k + '^' + m + ')^' + n,
            n % 2 ? t('-' + pw(k, m)) + ' is negative and the outer exponent is odd, so the answer is negative.' : t('-' + pw(k, m) + '=' + inner) + ', and a negative number squared is positive.');
        } },
        { id: '8g', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3, 3]), x = pickWhere(function () { return [r.int(2, 7), r.int(2, 6)]; }, function (x) { return x[0] !== x[1] && x[0] * x[1] !== x[0] + x[1] && Math.pow(b, x[0] + x[1]) <= 1e5 && x[0] + x[1] >= 5; }), m = x[0], n = x[1], e = m + n, v = Math.pow(-b, e);
          return lawEval(pw(par('-' + b), m) + '\\times ' + pw(par('-' + b), n), -b, par('-' + b), e, v, F(v), 'integer', [[m * n, 'mult-exp', 'Product Law: <b>add</b> the exponents.']],
            LAW.prod + ', base ' + t('-' + b) + ': ' + t(pw('(-' + b + ')', m + '+' + n) + '=' + pw('(-' + b + ')', e) + '=' + F(v)) + (e % 2 ? ' (odd exponent: negative).' : ' (even exponent: positive).'), ['The base is ' + t('-' + b) + '. Keep it in brackets.'], '(-' + b + ')^' + m + '(-' + b + ')^' + n,
            'An ' + (e % 2 ? 'odd' : 'even') + ' number of negative factors gives a ' + (e % 2 ? 'negative' : 'positive') + ' answer.');
        } },
        { id: '8h', level: 'EMG', make: function (r) {
          var x = pickWhere(function () { return [r.int(2, 7), r.int(2, 4), r.int(3, 6)]; }, function (x) { return x[1] !== x[2] && Math.pow(x[0], x[1] + x[2]) <= 1e6 && Math.pow(x[0], x[1] + x[2]) >= 1000; });
          var b = x[0], m = x[1], n = x[2], e = m + n, v = Math.pow(b, e);
          return lawEval(pw(b, m) + '\\cdot ' + pw(b, n) + '\\cdot ' + pw(b, 0), b, String(b), e, v, F(v), 'integer', [[0, 'zero-is-0', t(pw(b, 0) + '=1') + ', not ' + t(0) + ' — it doesn’t wipe out the product.'], [m * n, 'mult-exp', 'Product Law: <b>add</b> the exponents.']],
            LAW.prod + ': ' + t(pw(b, m + '+' + n + '+0') + '=' + pw(b, e) + '=' + F(v)) + '. (' + t(pw(b, 0) + '=1') + ' changes nothing.)', ['What is ' + t(pw(b, 0)) + '? Multiplying by it changes nothing.'], b + '^' + m + '*' + b + '^' + n + '*' + b + '^0');
        } }] },
      { num: '9', stem: function (sh) { return 'Explain, using factors, why ' + t(par(pw(sh.v, sh.a)) + par(pw(sh.v, sh.b)) + '\\neq' + pw(par(pw(sh.v, sh.a)), sh.b)) + '.'; },
        shared: function (r) { var ab = pickWhere(function () { return [r.int(2, 5), r.int(3, 6)]; }, function (x) { return x[0] !== x[1] && x[0] + x[1] !== x[0] * x[1]; }); if (r.chance(0.3)) ab = [2, 4]; return { v: r.pick(['m', 'm', 'x', 'k', 'p']), a: ab[0], b: ab[1] }; },
        parts: [
          { id: '9a', level: 'BEG', make: function (r, s) {
            var fl = [{ name: 'Left', label: 'factors of ' + t(s.v) + ' in ' + t(par(pw(s.v, s.a)) + par(pw(s.v, s.b))) + ':' }, { name: 'Right', label: 'factors of ' + t(s.v) + ' in ' + t(pw(par(pw(s.v, s.a)), s.b)) + ':' }];
            var L = s.a + s.b, R = s.a * s.b;
            return P.fields('Write both as repeated multiplication. How many factors of ' + t(s.v) + ' does each have?', fl,
              [K.number(L, function (v) { return v === R ? { code: 'mult-exp', hint: 'Two blocks side by side: ' + s.a + ' factors, then ' + s.b + ' more. Count them all.' } : null; }), K.number(R, function (v) { return v === L ? { code: 'add-exp', hint: t(pw(par(pw(s.v, s.a)), s.b)) + ' means ' + s.b + ' copies of the block ' + t(pw(s.v, s.a)) + '.' } : null; })],
              [String(L), String(R)], t(L) + ' and ' + t(R),
              t(par(pw(s.v, s.a)) + par(pw(s.v, s.b)) + '=' + par(rep(s.v, s.a, '')) + par(rep(s.v, s.b, '')) + '=' + pw(s.v, L)) + ' (' + L + ' factors), but ' + t(pw(par(pw(s.v, s.a)), s.b)) + ' is ' + s.b + ' copies of ' + t(pw(s.v, s.a)) + ': ' + t(s.b + '\\times ' + s.a + '=' + R) + ' factors, ' + t(pw(s.v, R)) + '.',
              ['Write each power out as ' + t(s.v + '\\times ' + s.v + '\\times\\cdots') + ' and count.'], 'count factors ' + s.a + ',' + s.b);
          } },
          { id: '9b', level: 'EMG', make: function (r, s) {
            var L = s.a + s.b, R = s.a * s.b;
            return mc(r, 'Which explanation is correct?', [
              { html: 'The left side has ' + t(s.a + '+' + s.b + '=' + L) + ' factors of ' + t(s.v) + '; the right side is ' + s.b + ' groups of ' + s.a + ', which is ' + t(R) + ' factors. ' + t(pw(s.v, L) + '\\neq ' + pw(s.v, R)) + '.', right: true },
              { html: 'Both sides have ' + t(L) + ' factors of ' + t(s.v) + ', but the brackets make them different.', why: 'Count the factors on the right: ' + t(pw(par(pw(s.v, s.a)), s.b)) + ' is ' + s.b + ' copies of ' + t(pw(s.v, s.a)) + '.' },
              { html: 'The left side is ' + t(pw(s.v, R)) + ' and the right side is ' + t(pw(s.v, L)) + '.', why: 'That has the two laws backwards: multiplying powers <b>adds</b> exponents; a power of a power <b>multiplies</b> them.' },
              { html: 'They are not equal because ' + t(pw(s.v, s.a)) + ' and ' + t(pw(s.v, s.b)) + ' have different exponents, so the laws don’t apply.', why: 'Both laws work with any exponents, as long as the base is the same.' }],
              'Product Law on the left: ' + t(pw(s.v, s.a + '+' + s.b) + '=' + pw(s.v, L)) + '. Power of a Power on the right: ' + t(pw(s.v, s.a + '\\times ' + s.b) + '=' + pw(s.v, R)) + '. ' + L + ' factors of ' + t(s.v) + ' is not the same as ' + R + '.',
              ['Count the factors of ' + t(s.v) + ' on each side.'], 'explain product vs power of power');
          } }] },
      { num: '10', stem: 'Use the Product Law to simplify.', parts: [
        { id: '10a', level: 'BEG', make: function (r) { return prodLaw(r, r.pick(LET), r.int(2, 9), r.int(2, 9)); } },
        { id: '10b', level: 'BEG', make: function (r) { return prodLaw(r, r.pick(LET), r.int(5, 12), r.int(2, 4)); } },
        { id: '10c', level: 'BEG', make: function (r) { var n = r.int(2, 9); return prodLaw(r, r.pick(LET), n, n, true); } }] },
      { num: '11', stem: 'Use the Quotient Law to simplify.', parts: [
        { id: '11a', level: 'BEG', make: function (r) { var n = r.int(2, 5); return quotLaw(r, r.pick(LET), n * r.int(2, 4), n, false, true); } },
        { id: '11b', level: 'BEG', make: function (r) { return quotLaw(r, r.pick(LET), r.int(7, 12), r.int(3, 6), true); } },
        { id: '11c', level: 'EMG', make: function (r) { return quotLaw(r, r.pick(LET), r.int(5, 12), 1, true); } }] },
      { num: '12', stem: 'Use the Power of a Product Law to simplify.', parts: [
        { id: '12a', level: 'BEG', make: function (r) {
          var c = r.int(2, 5), v = r.pick(LET), n = c <= 3 ? r.pick([3, 4]) : r.pick([2, 3]), C = Math.pow(c, n);
          return expoPart(t(pw(par(c + v), n)), C + pw(v, n), [[cIs(c), 'coef-not-raised', 'The ' + t(c) + ' is inside the brackets, so it is raised to the power ' + t(n) + ' too.'], [cIs(c * n), 'coef-times', 'Raise ' + t(c) + ' to the power ' + t(n) + ': ' + t(pw(c, n) + '=' + rep(c, n)) + ', not ' + t(c + '\\times ' + n) + '.']],
            LAW.prodP + ': ' + t(pw(c, n) + pw(v, n) + '=' + C + pw(v, n)) + '.', ['Every factor inside the brackets gets the exponent.'], '(' + c + v + ')^' + n, { bad: [c + pw(v, n), c * n + pw(v, n)] });
        } },
        { id: '12b', level: 'EMG', make: function (r) {
          var d = r.int(2, 5), v = r.pick(LET), n = d <= 3 ? r.pick([2, 3]) : 2, D = Math.pow(d, n);
          return expoPart(t(pw(par(fr(1, d) + v), n)), fr(1, D) + pw(v, n), [[cFr(1, d), 'coef-not-raised', 'The ' + t(fr(1, d)) + ' is inside the brackets, so it is raised to the power ' + t(n) + ' too.'], [cFr(n, d), 'coef-times', 'Raise ' + t(fr(1, d)) + ' to the power: ' + t(pw(par(fr(1, d)), n) + '=' + fr(1, D)) + '.'], [function (an) { return d !== n && cFr(1, d * n)(an); }, 'coef-times', 'Raise ' + t(fr(1, d)) + ' to the power: multiply ' + t(d) + ' by itself, not by ' + t(n) + '.']],
            LAW.prodP + ': ' + t(pw(par(fr(1, d)), n) + pw(v, n) + '=' + fr(1, D) + pw(v, n)) + '.', ['Raise the fraction and the variable to the power.'], '(1/' + d + ' ' + v + ')^' + n, { good: [fr(pw(v, n), D)] });
        } },
        { id: '12c', level: 'EMG', make: function (r) {
          var c = r.int(2, 4), vw = lets(r, 2).sort(), n = 3, C = Math.pow(c, n);
          return expoPart(t(pw(par('-' + c + vw[0] + vw[1]), n)), '-' + C + pw(vw[0], n) + pw(vw[1], n), [[cIs(-c), 'coef-not-raised', 'The ' + t('-' + c) + ' is inside the brackets: raise it to the power too.'], [cIs(-c * n), 'coef-times', t(pw('(-' + c + ')', n)) + ' means ' + t(rep('(-' + c + ')', n)) + '.']],
            LAW.prodP + ': ' + t(pw('(-' + c + ')', n) + pw(vw[0], n) + pw(vw[1], n) + '=-' + C + pw(vw[0], n) + pw(vw[1], n)) + ' (odd exponent: negative).', ['Raise each of ' + t('-' + c) + ', ' + t(vw[0]) + ' and ' + t(vw[1]) + ' to the power.'], '(-' + c + vw.join('') + ')^3', { bad: [C + pw(vw[0], n) + pw(vw[1], n)] });
        } }] },
      { num: '13', stem: 'Use the Power of a Quotient Law to simplify.', parts: [
        { id: '13a', level: 'BEG', make: function (r) {
          var vw = lets(r, 2), n = r.int(2, 6);
          return expoPart(t(pw(par(dfr(vw[0], vw[1])), n)), fr(pw(vw[0], n), pw(vw[1], n)), null, LAW.quotP + ': ' + t(fr(pw(vw[0], n), pw(vw[1], n))) + '.', ['Raise the top and the bottom to the power.'], '(' + vw[0] + '/' + vw[1] + ')^' + n, { bad: [fr(pw(vw[0], n), vw[1])] });
        } },
        { id: '13b', level: 'BEG', make: function (r) {
          var c = r.int(2, 5), v = r.pick(LET), n = c <= 3 ? r.pick([3, 4]) : 3, C = Math.pow(c, n);
          return expoPart(t(pw(par(dfr(c, v)), n)), fr(C, pw(v, n)), [[cIs(c), 'coef-not-raised', 'Raise the numerator ' + t(c) + ' to the power too.'], [cIs(c * n), 'coef-times', t(pw(c, n)) + ' means ' + t(rep(c, n)) + ', not ' + t(c + '\\times ' + n) + '.']],
            LAW.quotP + ': ' + t(fr(pw(c, n), pw(v, n)) + '=' + fr(C, pw(v, n))) + '.', ['Raise the top and the bottom to the power.'], '(' + c + '/' + v + ')^' + n, { bad: [fr(c, pw(v, n))] });
        } },
        { id: '13c', level: 'BEG', make: function (r) {
          var c = r.int(2, 9), v = r.pick(LET), n = 2, C = c * c;
          return expoPart(t(pw(par(dfr(v, c)), n)), fr(pw(v, n), C), [[cFr(1, c), 'coef-not-raised', 'Raise the denominator ' + t(c) + ' to the power too.'], [cFr(1, 2 * c), 'coef-times', t(pw(c, 2)) + ' means ' + t(c + '\\times ' + c) + '.']],
            LAW.quotP + ': ' + t(fr(pw(v, 2), pw(c, 2)) + '=' + fr(pw(v, 2), C)) + '.', ['Raise the top and the bottom to the power.'], '(' + v + '/' + c + ')^2', { good: [fr(1, C) + pw(v, 2)], bad: [fr(pw(v, 2), c)] });
        } }] },
      { num: '14', stem: 'Use the Power of a Power Law to simplify.', parts: [
        { id: '14a', level: 'BEG', make: function (r) { return ppLaw(r.pick(LET), r.int(2, 5), r.int(3, 6)); } },
        { id: '14b', level: 'BEG', make: function (r) { return ppLaw(r.pick(LET), r.int(4, 7), r.int(4, 7)); } },
        { id: '14c', level: 'BEG', make: function (r) { return ppLaw(r.pick(LET), r.int(6, 9), r.int(6, 9)); } }] },
      { num: '15', stem: 'State the value of ' + t('x') + ' in each of the following.', parts: [
        { id: '15a', level: 'EMG', make: function (r) { var a = r.int(2, 9), x = r.int(2, 9), s = a + x;
          return numPart(t(par(pw('a', a)) + par(pw('a', 'x')) + '=' + pw('a', s)), x, [[s + a, 'sub-wrong', 'Product Law: ' + t(a + '+x=' + s) + ', so subtract ' + t(a) + ' from ' + t(s) + '.'], [s / a, 'divided-total', 'Multiplying powers adds the exponents: ' + t(a + '+x=' + s) + '.']],
            LAW.prod + ': ' + t(pw('a', a + '+x') + '=' + pw('a', s)) + ', so ' + t(a + '+x=' + s) + ' and ' + t('x=' + x) + '.', ['Use the Product Law to write the left side as one power, then match exponents.'], 'a^' + a + ' a^x = a^' + s); } },
        { id: '15b', level: 'EMG', make: function (r) { var a = r.int(2, 9), x = r.int(2, 9), s = a + x;
          return numPart(t(pw('b', 'x') + '\\cdot ' + pw('b', a) + '=' + pw('b', s)), x, [[s + a, 'sub-wrong', t('x+' + a + '=' + s) + ': subtract ' + t(a) + '.']],
            LAW.prod + ': ' + t('x+' + a + '=' + s) + ', so ' + t('x=' + x) + '.', ['Use the Product Law, then match exponents.'], 'b^x b^' + a + ' = b^' + s); } },
        { id: '15c', level: 'EMG', make: function (r) { var a = r.int(2, 6), y = r.int(4, 12), x = a + y;
          return numPart(t(pw('c', 'x') + '\\div ' + pw('c', a) + '=' + pw('c', y)), x, [[y - a, 'sub-wrong', 'Dividing subtracts ' + t(a) + ' from ' + t('x') + ': ' + t('x-' + a + '=' + y) + '. So ' + t('x') + ' must be bigger than ' + t(y) + '.'], [y * a, 'multiplied', 'Quotient Law: subtract, so ' + t('x-' + a + '=' + y) + '.']],
            LAW.quot + ': ' + t('x-' + a + '=' + y) + ', so ' + t('x=' + x) + '.', ['Use the Quotient Law, then match exponents.'], 'c^x / c^' + a + ' = c^' + y); } },
        { id: '15d', level: 'EMG', make: function (r) { var y = r.int(2, 6), x = r.int(3, 9), m = x + y;
          return numPart(t(dfr(pw('d', m), pw('d', 'x')) + '=' + pw('d', y)), x, [[m + y, 'sub-wrong', t(m + '-x=' + y) + ': the exponent ' + t('x') + ' is subtracted, so it must be less than ' + t(m) + '.'], [m / y, 'div-exp', 'Quotient Law: subtract the exponents, don’t divide.']],
            LAW.quot + ': ' + t(m + '-x=' + y) + ', so ' + t('x=' + x) + '.', ['Use the Quotient Law, then match exponents.'], 'd^' + m + '/d^x = d^' + y); } },
        { id: '15e', level: 'EMG', make: function (r) { var p = r.int(2, 6), x = r.int(2, 9), s = p * x;
          return numPart(t(pw(par(pw('e', 'x')), p) + '=' + pw('e', s)), x, [[s - p, 'add-exp', 'Power of a Power: multiply, so ' + t(p + 'x=' + s) + '.'], [s * p, 'multiplied', t(p + 'x=' + s) + ': divide by ' + t(p) + '.']],
            LAW.pp + ': ' + t(pw('e', p + 'x') + '=' + pw('e', s)) + ', so ' + t(p + 'x=' + s) + ' and ' + t('x=' + x) + '.', ['Use the Power of a Power Law, then match exponents.'], '(e^x)^' + p + ' = e^' + s); } },
        { id: '15f', level: 'EMG', make: function (r) { var k = r.int(3, 12);
          return numPart(t(pw(par(pw('f', k)), 'x') + '=' + pw('f', k)), 1, [[0, 'zero-is-base', t(pw(par(pw('f', k)), 0) + '=1') + ', not ' + t(pw('f', k)) + '.'], [k, 'add-exp', 'Power of a Power: ' + t(k + 'x=' + k) + '.']],
            LAW.pp + ': ' + t(pw('f', k + 'x') + '=' + pw('f', k)) + ', so ' + t(k + 'x=' + k) + ' and ' + t('x=1') + '. (A power to the exponent ' + t(1) + ' is unchanged.)', ['Multiply the exponents, then match.'], '(f^' + k + ')^x = f^' + k); } }] },
      { num: '16', stem: 'Use the exponent laws to simplify.',
        shared: function (r) { var n = r.int(3, 6); return { v: r.pick(LET), n: n }; },
        parts: [
          { id: '16a', level: 'BEG', make: function (r) { var v = r.pick(LET), b = r.int(2, 6); return quotLaw(r, v, b + r.int(6, 12), b, false); } },
          { id: '16b', level: 'BEG', make: function (r) { var vw = lets(r, 2).sort(), n = r.int(3, 12);
            return expoPart(t(pw(par(vw[0] + vw[1]), n)), pw(vw[0], n) + pw(vw[1], n), [[both(eIs(vw[0], n), eIs(vw[1], 1)), 'part-base', 'Both letters are inside the brackets — raise each one to the power.']], LAW.prodP + ': ' + t(pw(vw[0], n) + pw(vw[1], n)) + '.', ['Every factor inside the brackets gets the exponent.'], '(' + vw.join('') + ')^' + n, { bad: [vw[0] + pw(vw[1], n)] }); } },
          { id: '16c', level: 'BEG', make: function (r, s) { return ppLaw(s.v, s.n, s.n); } },
          { id: '16d', level: 'BEG', make: function (r, s) { return prodLaw(r, s.v, s.n, s.n, false, true); } },
          { id: '16e', level: 'BEG', make: function (r) { return prodLaw(r, r.pick(LET), r.int(3, 9), r.int(3, 9), false, false, '\\times '); } },
          { id: '16f', level: 'BEG', make: function (r) { var vw = lets(r, 2), n = r.int(5, 15);
            return expoPart(t(pw(par(dfr(vw[0], vw[1])), n)), fr(pw(vw[0], n), pw(vw[1], n)), null, LAW.quotP + ': ' + t(fr(pw(vw[0], n), pw(vw[1], n))) + '.', ['Raise the top and the bottom to the power.'], '(' + vw.join('/') + ')^' + n); } },
          { id: '16g', level: 'BEG', make: function (r) { var v = r.pick(LET), c = r.pick([2, 2, 3]), n = c === 2 ? r.int(3, 6) : r.int(2, 4), C = Math.pow(c, n);
            return expoPart(t(pw(par(dfr(v, c)), n)), fr(pw(v, n), C), [[cFr(1, c), 'coef-not-raised', 'Raise the denominator ' + t(c) + ' to the power too.'], [cFr(1, c * n), 'coef-times', t(pw(c, n)) + ' means ' + t(rep(c, n)) + '.']], LAW.quotP + ': ' + t(fr(pw(v, n), pw(c, n)) + '=' + fr(pw(v, n), C)) + '.', ['Raise the top and the bottom to the power.'], '(' + v + '/' + c + ')^' + n); } },
          { id: '16h', level: 'EMG', make: function (r) { var vw = lets(r, 2).sort(), c = r.pick([2, 2, 3]), n = c === 2 ? r.int(5, 8) : r.int(3, 5), C = Math.pow(c, n);
            return expoPart(t(pw(par(c + vw[0] + vw[1]), n)), C + pw(vw[0], n) + pw(vw[1], n), [[cIs(c), 'coef-not-raised', 'The ' + t(c) + ' is inside the brackets, so it is raised to the power too.'], [cIs(c * n), 'coef-times', t(pw(c, n)) + ' means ' + t(c) + ' multiplied by itself ' + n + ' times.']],
              LAW.prodP + ': ' + t(pw(c, n) + pw(vw[0], n) + pw(vw[1], n) + '=' + C + pw(vw[0], n) + pw(vw[1], n)) + '.', ['Raise each factor inside the brackets to the power.'], '(' + c + vw.join('') + ')^' + n); } }] },
      { num: '17', stem: function (sh) { return 'Find <b>two</b> different pairs of whole numbers ' + t('(m,n)') + ' for which ' + t(q17eq(sh.k)) + '. Explain, using the exponent laws, how you know your pairs work.'; },
        shared: function (r) { return { k: r.pick([0, 0, 0, 3, 5, 7, 8]) }; },
        parts: [
          { id: '17a', level: 'MAS', make: function (r, s) { return q17pairs(s.k); } },
          { id: '17b', level: 'PRG', make: function (r, s) {
            var k = s.k, L = 'm+n' + (k ? '+' + k : '');
            return mc(r, 'How do you know a pair works?', [
              { html: 'The Product Law makes the left side ' + t(pw('a', L)) + ' and the Power of a Power Law makes the right side ' + t(pw('a', 'mn')) + ', so a pair works exactly when ' + t(L + '=mn') + '.', right: true },
              { html: 'Both sides simplify to ' + t(pw('a', L)) + ', so every pair works.', why: 'A power of a power <b>multiplies</b> the exponents: ' + t(pw(par(pw('a', 'm')), 'n') + '=' + pw('a', 'mn')) + '.' },
              { html: 'The right side is ' + t(pw('a', 'm^{n}')) + ', so a pair works when ' + t(L + '=m^{n}') + '.', why: t(pw(par(pw('a', 'm')), 'n')) + ' is ' + t('n') + ' copies of ' + t(pw('a', 'm')) + ', which is ' + t('mn') + ' factors of ' + t('a') + ', not ' + t('m^{n}') + '.' },
              { html: 'A pair works whenever ' + t('m=n') + '.', why: 'Test it: ' + (k === 0 ? t('(3,3)') + ' gives ' + t('3+3=6') + ' but ' + t('3\\times 3=9') : t('(2,2)') + ' gives ' + t('2+2+' + k + '=' + (4 + k)) + ' but ' + t('2\\times 2=4')) + '.' }],
              'Left: ' + t(pw('a', 'm') + '\\cdot ' + pw('a', 'n') + (k ? '\\cdot ' + pw('a', k) : '') + '=' + pw('a', L)) + '. Right: ' + t(pw(par(pw('a', 'm')), 'n') + '=' + pw('a', 'mn')) + '. Same base, so the two sides are equal when the exponents match: ' + t(L + '=mn') + '.',
              ['Simplify each side to a single power of ' + t('a') + '.'], 'why pairs work (k=' + k + ')');
          } }] },

      /* ===================== Part D ===================== */
      { num: '18', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '18', level: 'LIM', make: function (r) {
          var mn = r.pick([[4, 3], [4, 3], [2, 3], [3, 2], [2, 5], [5, 2], [3, 4], [2, 6], [5, 3], [3, 5], [6, 2]]), m = mn[0], n = mn[1], v = r.pick(['b', 'b', 'x', 'y', 'a']);
          var opts = [{ e: m + n, why: 'That adds the exponents (the Product Law). Here a power is raised to a power, so multiply.' }, { e: m * n, right: true }, { e: Math.pow(m, n), why: 'That works out ' + t(pw(m, n)) + '. The exponents should be multiplied: ' + t(m + '\\times ' + n) + '.' }, { e: Math.pow(n, m), why: 'That works out ' + t(pw(n, m)) + '. The exponents should be multiplied: ' + t(m + '\\times ' + n) + '.' }]
            .sort(function (a, b) { return a.e - b.e; }).map(function (o) { return { html: t(pw(v, o.e)), right: !!o.right, why: o.why }; });
          return mc(r, 'Which of the following is equivalent to ' + t(pw(par(pw(v, m)), n)) + '?', opts, LAW.pp + ': ' + t(pw(par(pw(v, m)), n) + '=' + pw(v, m + '\\times ' + n) + '=' + pw(v, m * n)) + '.', ['Write it out: ' + n + ' copies of ' + t(pw(v, m)) + '.'], '(' + v + '^' + m + ')^' + n + ' MC', true);
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '19', level: 'EMG', make: function (r) {
          var c = r.pick([4, 4, 3, 5, 6]), n = r.int(3, 9), T = c * n, lhs = rep(par(pw('a', 'n')), c, '');
          return P.nr('If ' + t(lhs + '=' + pw('a', T)) + ', where ' + t('n') + ' is a whole number, then the value of ' + t('n') + ' is ________.', n, function (v) {
            if (v === T - c) return { code: 'subtracted', hint: 'The ' + c + ' factors are multiplied, so their exponents add: ' + t('n+n+\\cdots=' + c + 'n') + '.' };
            if (v === T * c) return { code: 'multiplied', hint: t(c + 'n=' + T) + ': divide, don’t multiply.' };
            if (v === T) return { code: 'divided-total', hint: 'There are ' + c + ' equal factors, so the left side is ' + t(pw('a', c + 'n')) + '.' };
            return null;
          }, LAW.prod + ': ' + c + ' equal factors give ' + t(pw('a', rep('n', c, '+')) + '=' + pw('a', c + 'n')) + '. So ' + t(c + 'n=' + T) + ' and ' + t('n=' + n) + '. Check: ' + t(pw(par(pw('a', n)), c) + '=' + pw('a', T)) + '.',
          ['Add the ' + c + ' exponents on the left.'], c + ' factors a^n = a^' + T);
        } }] }
    ],

    /* =============================== EXTRA PRACTICE =============================== */
    extra: [
      { num: '1', section: 'Extra practice A — What a power actually is', stem: 'For each expression, state the <b>power</b> itself, its <b>base</b>, its <b>exponent</b>, and the <b>coefficient</b> multiplying it. Read the brackets carefully — they decide what the base is.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) { var k = r.int(2, 9), e = r.int(2, 4), P0 = pw(k, e);
          return fourPart('-' + P0, String(k), String(e), '-1', [], 'No brackets: the fence holds only ' + t(k) + '. ' + t('-' + P0 + '=-1\\cdot ' + P0) + ': power ' + t(P0) + ', base ' + t(k) + ', exponent ' + t(e) + ', coefficient ' + t('-1') + '.', '4 things -' + k + '^' + e, {
            pow: [['-' + P0, 'with-coef', 'The minus sign sits outside the fence, so it isn’t part of the power — it is the coefficient ' + t('-1') + '.'], [pw(par('-' + k), e), 'fence', 'There are no brackets, so the minus sign isn’t part of the base.']],
            base: [['-' + k, 'fence', 'No brackets: the minus sign is outside the fence, so the base is just ' + t(k) + '.']],
            coef: [['1', 'coef-sign', 'The minus sign in front is the coefficient: ' + t('-' + P0 + '=-1\\cdot ' + P0) + '.']] }); } },
        { id: 'e1b', level: 'BEG', make: function (r) { var k = r.int(2, 9), e = r.int(2, 4), B = par('-' + k);
          return fourPart(pw(B, e), '-' + k, String(e), '1', [], 'The fence holds ' + t('-' + k) + ': power ' + t(pw(B, e)) + ', base ' + t('-' + k) + ', exponent ' + t(e) + ', coefficient ' + t('1') + ' (understood).', '4 things (-' + k + ')^' + e, {
            pow: [[pw(k, e), 'fence', 'The brackets put the minus sign inside the fence, so it is part of the power.'], ['-' + pw(k, e), 'fence', 'The brackets put the minus sign inside the fence, so it is part of the base.']],
            base: [[String(k), 'fence', 'The brackets put the minus sign inside the fence, so the base is ' + t('-' + k) + '.']],
            coef: [['-1', 'coef-sign', 'The minus sign is inside the brackets — part of the base. Nothing multiplies the power, so the coefficient is the understood ' + t('1') + '.']] }); } },
        { id: 'e1c', level: 'BEG', make: function (r) { var c = r.int(2, 9), v = r.pick(LET), e = r.pick([3, 4, 5, 6, 7].filter(function (x) { return x !== c; }));
          return fourPart('-' + c + pw(v, e), v, String(e), '-' + c, [v], 'Only ' + t(v) + ' is inside the fence: ' + t('-' + c + pw(v, e) + '=-' + c + '\\cdot ' + pw(v, e)) + '. Power ' + t(pw(v, e)) + ', base ' + t(v) + ', exponent ' + t(e) + ', coefficient ' + t('-' + c) + '.', '4 things -' + c + v + '^' + e, {
            pow: [['-' + c + pw(v, e), 'with-coef', 'The coefficient ' + t('-' + c) + ' multiplies the power; it isn’t part of it.'], [c + pw(v, e), 'with-coef', 'The coefficient multiplies the power; it isn’t part of it.']],
            base: [['-' + c + v, 'part-base', 'Only ' + t(v) + ' is inside the fence. The ' + t('-' + c) + ' is the coefficient.'], [c + v, 'part-base', 'Only ' + t(v) + ' is inside the fence.']],
            coef: [[String(c), 'coef-sign', 'Include the sign: the coefficient is ' + t('-' + c) + ', not ' + t(c) + '.'], [String(e), 'coef-exp', 'That’s the exponent.']] }); } },
        { id: 'e1d', level: 'EMG', make: function (r) { var c = r.int(2, 9), v = r.pick(LET), e = r.pick([3, 4, 5, 6, 7].filter(function (x) { return x !== c; })), B = '-' + c + v;
          return fourPart(pw(par(B), e), B, String(e), '1', [v], 'The fence holds ' + t(B) + ': power ' + t(pw(par(B), e)) + ', base ' + t(B) + ', exponent ' + t(e) + ', coefficient ' + t('1') + ' (understood).', '4 things (' + B + ')^' + e, {
            pow: [['-' + c + pw(v, e), 'fence', 'The brackets hold all of ' + t(B) + ', so all of it is raised to the power.'], [pw(v, e), 'part-base', 'The brackets hold all of ' + t(B) + '.']],
            base: [[c + v, 'fence', 'The minus sign is inside the brackets, so it is part of the base.'], [v, 'part-base', 'The brackets hold all of ' + t(B) + ', not just ' + t(v) + '.']],
            coef: [['-' + c, 'part-base', 'The ' + t('-' + c) + ' is inside the brackets — part of the base. Nothing multiplies the power, so the coefficient is the understood ' + t('1') + '.'], ['-1', 'coef-sign', 'The minus sign is inside the brackets, so it belongs to the base.']] }); } },
        { id: 'e1e', level: 'EMG', make: function (r) { var f = pickWhere(function () { return fracs(r, 9); }, function (f) { return f[0] > 1; }), v = r.pick(LET), e = r.int(2, 6);
          return fourPart(dfr(f[0] + pw(v, e), f[1]), v, String(e), fr(f[0], f[1]), [v], t(dfr(f[0] + pw(v, e), f[1]) + '=' + fr(f[0], f[1]) + pw(v, e)) + ': power ' + t(pw(v, e)) + ', base ' + t(v) + ', exponent ' + t(e) + ', coefficient ' + t(fr(f[0], f[1])) + '.', '4 things ' + f[0] + v + '^' + e + '/' + f[1], {
            pow: [[f[0] + pw(v, e), 'with-coef', 'The ' + t(f[0]) + ' is part of the coefficient, not the power.'], [fr(f[0] + pw(v, e), f[1]), 'with-coef', 'The power is only the base with its exponent.']],
            base: [[f[0] + v, 'part-base', 'Only ' + t(v) + ' carries the exponent.']],
            coef: [[String(f[0]), 'coef-den', 'The whole expression is divided by ' + t(f[1]) + ': ' + t(dfr(f[0] + pw(v, e), f[1]) + '=' + fr(f[0], f[1]) + pw(v, e)) + '.'], [fr(1, f[1]), 'coef-den', 'The ' + t(f[0]) + ' on top belongs to the coefficient too.']] }); } },
        { id: 'e1f', level: 'EMG', make: function (r) { var f = fracs(r, 9), e = r.int(2, 9), b = fr(f[0], f[1]);
          return fourPart('-' + pw(par(dfr(f[0], f[1])), e), b, String(e), '-1', [], 'The fence holds ' + t(b) + '; the minus is outside: power ' + t(pw(par(b), e)) + ', base ' + t(b) + ', exponent ' + t(e) + ', coefficient ' + t('-1') + '.', '4 things -(' + f[0] + '/' + f[1] + ')^' + e, {
            pow: [['-' + pw(par(b), e), 'with-coef', 'The minus sign is outside the fence: it is the coefficient ' + t('-1') + ', not part of the power.'], [pw(par('-' + b), e), 'fence', 'The minus sign is outside the brackets.']],
            base: [['-' + b, 'fence', 'The minus sign is outside the brackets, so it isn’t part of the base.'], [String(f[0]), 'part-base', 'The brackets hold the whole fraction.']],
            coef: [['1', 'coef-sign', 'The minus sign in front means the coefficient is ' + t('-1') + '.']] }); } }] },
      { num: '2', stem: 'Decide whether each statement is <b>true</b> or <b>false</b>. (If it is false, think about how you would correct it — the correction is in the solution.)', parts: [
        { id: 'e2a', level: 'LIM', make: function (r) { var c = r.int(2, 9), v = r.pick(LET), n = r.int(2, 6);
          return P.tf(r, 'In ' + t(c + pw(v, n)) + ' the power is ' + t(c + pw(v, n)) + '.', false, 'The ' + t(c) + ' is a coefficient sitting outside the power. The power is ' + t(pw(v, n)) + '.', '<b>False.</b> The power is ' + t(pw(v, n)) + '; the ' + t(c) + ' is the coefficient multiplying it.', ['Which part is the base with its exponent?'], 'TF power of ' + c + v + '^' + n); } },
        { id: 'e2b', level: 'BEG', make: function (r) { var k = r.int(2, 9), n = r.pick([2, 4]);
          return P.tf(r, 'In ' + t('-' + pw(k, n)) + ' the base is ' + t('-' + k) + '.', false, 'With no brackets the minus sign is outside the fence: ' + t('-' + pw(k, n) + '=-(' + pw(k, n) + ')') + '.', '<b>False.</b> With no brackets the minus sign sits outside the fence: ' + t('-' + pw(k, n) + '=-(' + rep(k, n) + ')=' + (-Math.pow(k, n))) + '. Corrected: the base is ' + t(k) + '.', ['Are there brackets around ' + t('-' + k) + '?'], 'TF base of -' + k + '^' + n); } },
        { id: 'e2c', level: 'LIM', make: function (r) { var k = r.int(2, 9), v = r.pick(LET);
          return P.tf(r, 'In ' + t(pw(k, v)) + ' there is no base, because the exponent is a letter.', false, 'An exponent can be a letter; the base is still ' + t(k) + '.', '<b>False.</b> An exponent may be a variable. Corrected: in ' + t(pw(k, v)) + ' the base is ' + t(k) + ' and the exponent is ' + t(v) + '.', ['Can an exponent be a variable?'], 'TF ' + k + '^' + v); } },
        { id: 'e2d', level: 'BEG', make: function (r) { var c = r.int(2, 9), vw = lets(r, 2), n = r.int(2, 4);
          return P.tf(r, 'In ' + t(pw(par(c + vw[0] + vw[1]), n)) + ' the base is ' + t(vw[0] + vw[1]) + '.', false, 'The brackets hold all of ' + t(c + vw[0] + vw[1]) + ', including the ' + t(c) + '.', '<b>False.</b> The brackets put all of ' + t(c + vw[0] + vw[1]) + ' inside the fence. Corrected: the base is ' + t(c + vw[0] + vw[1]) + '.', ['What is inside the brackets?'], 'TF base of (' + c + vw.join('') + ')^' + n); } },
        { id: 'e2e', level: 'LIM', make: function (r) { var v = r.pick(LET);
          return P.tf(r, 'In the expression ' + t(v) + ', the exponent is ' + t(1) + ' and the coefficient is ' + t(1) + '.', true, t(v + '=1\\cdot ' + pw(v, 1)) + ': both are understood to be ' + t(1) + '.', '<b>True.</b> ' + t(v + '=1\\cdot ' + pw(v, 1)) + ': the understood exponent is ' + t(1) + ' and the understood coefficient is ' + t(1) + '.', ['What is ' + t(v) + ' multiplied by, and how many times is it used?'], 'TF ' + v + ' = 1*' + v + '^1'); } },
        { id: 'e2f', level: 'LIM', make: function (r) { var v = r.pick(LET), n = r.int(2, 9);
          return P.tf(r, '“The exponent of ' + t(pw(v, n)) + ' is ' + t(n) + '” and “the power is ' + t(n) + '” say the same thing.', false, 'The exponent is only the ' + t(n) + '; the power is the whole expression ' + t(pw(v, n)) + '.', '<b>False.</b> They are different ideas. Corrected: the exponent of ' + t(pw(v, n)) + ' is ' + t(n) + '; the power is ' + t(pw(v, n)) + '.', ['Is the power the little number, or the whole expression?'], 'TF power vs exponent'); } }] },
      { num: '3', stem: function (sh) { return 'Write each of the following as a repeated multiplication, with no exponents left. (Then decide which are equal.)'; },
        shared: function (r) { var ab = lets(r, 2).sort(); return { c: r.int(2, 5), a: ab[0], b: ab[1], n: r.pick([3, 4, 4]) }; },
        parts: [
          { id: 'e3a', level: 'BEG', make: function (r, s) { return repPart(s.c + s.a + pw(s.b, s.n), s.c + '\\times ' + s.a + '\\times ' + rep(s.b, s.n), s.b, s.n, [[s.c + pw(par(s.a + s.b), s.n), 'part-base', 'Only ' + t(s.b) + ' is raised to the power.']], 'Only ' + t(s.b) + ' is raised to the ' + t(s.n) + ': ' + t(s.c + '\\times ' + s.a + '\\times ' + rep(s.b, s.n)) + '.', 'rep ' + s.c + s.a + s.b + '^' + s.n); } },
          { id: 'e3b', level: 'EMG', make: function (r, s) { var b = s.a + s.b; return repPart(s.c + pw(par(b), s.n), s.c + '\\times ' + rep(s.a + '\\times ' + s.b, s.n), b, s.n, [[pw(par(s.c + b), s.n), 'coef-repeated', 'The ' + t(s.c) + ' is outside the brackets, so it is written once.'], [s.c + s.a + pw(s.b, s.n), 'part-base', 'The bracket holds ' + t(b) + ', so both letters repeat.']], 'The fence holds ' + t(b) + '; the ' + t(s.c) + ' stays outside: ' + t(s.c + '\\times ' + rep(s.a + '\\times ' + s.b, s.n)) + ' ' + t('=' + s.c + pw(s.a, s.n) + pw(s.b, s.n)) + '.', 'rep ' + s.c + '(' + b + ')^' + s.n); } },
          { id: 'e3c', level: 'EMG', make: function (r, s) { var b = s.c + s.a + s.b; return repPart(pw(par(b), s.n), rep(s.c + '\\times ' + s.a + '\\times ' + s.b, s.n), b, s.n, [[s.c + pw(par(s.a + s.b), s.n), 'coef-once', 'The ' + t(s.c) + ' is inside the brackets, so it repeats too.']], 'The fence holds ' + t(b) + ', so the ' + t(s.c) + ' is repeated too: ' + t(rep(s.c + '\\times ' + s.a + '\\times ' + s.b, s.n)) + ' ' + t('=' + Math.pow(s.c, s.n) + pw(s.a, s.n) + pw(s.b, s.n)) + '.', 'rep (' + b + ')^' + s.n); } },
          { id: 'e3d', level: 'BEG', make: function (r, s) { return repPart(par(s.c + s.a) + pw(s.b, s.n), s.c + '\\times ' + s.a + '\\times ' + rep(s.b, s.n), s.b, s.n, [[pw(par(s.c + s.a + s.b), s.n), 'part-base', 'No exponent acts on the bracket ' + t('(' + s.c + s.a + ')') + '; only ' + t(s.b) + ' is raised to the power.']], 'No exponent acts on ' + t('(' + s.c + s.a + ')') + ': ' + t(s.c + '\\times ' + s.a + '\\times ' + rep(s.b, s.n)) + '.', 'rep (' + s.c + s.a + ')' + s.b + '^' + s.n); } },
          { id: 'e3e', level: 'EMG', make: function (r, s) {
            var A = t(s.c + s.a + pw(s.b, s.n)), B = t(s.c + pw(par(s.a + s.b), s.n)), C = t(pw(par(s.c + s.a + s.b), s.n)), D = t(par(s.c + s.a) + pw(s.b, s.n));
            return mc(r, 'Which of the four are equal to each other?', [
              { html: 'Only ' + A + ' and ' + D + ' — they have the same factors.', right: true },
              { html: A + ' and ' + B + '.', why: 'Compare the factors: ' + B + ' repeats ' + t(s.a) + ' as well as ' + t(s.b) + '.' },
              { html: B + ' and ' + C + '.', why: 'In ' + C + ' the ' + t(s.c) + ' is inside the fence, so it is repeated; in ' + B + ' it isn’t.' },
              { html: 'None of them — the brackets are in different places in all four.', why: 'Brackets that no exponent acts on change nothing. Compare the factor lists.' }],
              A + ' and ' + D + ' both equal ' + t(s.c + '\\times ' + s.a + '\\times ' + rep(s.b, s.n)) + '. ' + B + t('=' + s.c + pw(s.a, s.n) + pw(s.b, s.n)) + ' repeats ' + t(s.a + s.b) + '; ' + C + t('=' + Math.pow(s.c, s.n) + pw(s.a, s.n) + pw(s.b, s.n)) + ' repeats the ' + t(s.c) + ' too.',
              ['Compare the repeated multiplications you wrote.'], 'which are equal');
          } }] },
      { num: '4', section: 'Extra practice B — The fence: (−a)ⁿ, −aⁿ and coefficients', stem: 'Evaluate without a calculator. Every one of these turns on where the brackets sit.',
        shared: function (r) { return { k: r.pick([3, 4, 5, 5, 6, 7]), j: r.pick([2, 2, 3]) }; },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, s) { return negPart('out', s.k, 2); } },
          { id: 'e4b', level: 'BEG', make: function (r, s) { return negPart('in', s.k, 2); } },
          { id: 'e4c', level: 'EMG', make: function (r, s) { return negPart('out', s.k, 3); } },
          { id: 'e4d', level: 'BEG', make: function (r, s) { return negPart('in', s.k, 3); } },
          { id: 'e4e', level: 'EMG', make: function (r, s) { var k = s.k, v = -k * k;
            return numPart(t('-' + pw(par('-' + k), 2)), v, [[k * k, 'fence', 'The outside minus sign isn’t inside the fence: work out ' + t(pw('(-' + k + ')', 2)) + ' first, then take its opposite.'], [-2 * k, 'times-exp', 'Squaring isn’t doubling.']], t('-\\left[' + pw('(-' + k + ')', 2) + '\\right]=-(' + k * k + ')=' + v) + '.', ['Evaluate the bracket to the power first, then apply the minus sign in front.'], '-(-' + k + ')^2'); } },
          { id: 'e4f', level: 'EMG', make: function (r, s) { var j = s.j, v = -Math.pow(j, 4);
            return numPart(t('-' + pw(par('-' + j), 4)), v, [[-v, 'fence', 'The outside minus sign isn’t raised to the power: work out ' + t(pw('(-' + j + ')', 4)) + ' first, then take its opposite.'], [-4 * j, 'times-exp', 'The exponent isn’t a multiplier.']], t('-\\left[' + pw('(-' + j + ')', 4) + '\\right]=-(' + (-v) + ')=' + v) + '.', ['Evaluate the bracket to the power first.'], '-(-' + j + ')^4'); } }] },
      { num: '5', stem: 'Simplify each pair. Then think about what the brackets changed.', parts: [
          { id: 'e5a', level: 'EMG', make: function (r) { var c = r.int(2, 5), vw = lets(r, 2).sort(); return pairPart(c + pw(par(vw.join('')), 2), c + pw(vw[0], 2) + pw(vw[1], 2), pw(par(c + vw.join('')), 2), c * c + pw(vw[0], 2) + pw(vw[1], 2), c, 'The brackets put the ' + t(c) + ' inside the fence, so it is squared too (' + t(c + '\\to ' + c * c) + ').'); } },
          { id: 'e5b', level: 'EMG', make: function (r) { var c = r.int(2, 6), vw = lets(r, 2).sort(); return pairPart(c + pw(par(vw.join('')), 2), c + pw(vw[0], 2) + pw(vw[1], 2), pw(par(c + vw.join('')), 2), c * c + pw(vw[0], 2) + pw(vw[1], 2), c, 'The brackets put the ' + t(c) + ' inside the fence, so it is squared too (' + t(c + '\\to ' + c * c) + ').'); } },
          { id: 'e5c', level: 'EMG', make: function (r) { var c = r.int(2, 4), vw = lets(r, 2).sort(), C = Math.pow(c, 3); return pairPart('-' + c + pw(par(vw.join('')), 3), '-' + c + pw(vw[0], 3) + pw(vw[1], 3), pw(par('-' + c + vw.join('')), 3), '-' + C + pw(vw[0], 3) + pw(vw[1], 3), -c, 'The brackets put the ' + t('-' + c) + ' inside the fence, so it is cubed (' + t('-' + c + '\\to -' + C) + ').'); } },
          { id: 'e5d', level: 'EMG', make: function (r) { var c = r.int(2, 3), v = r.pick(LET), C = Math.pow(c, 4); return pairPart('-' + c + pw(v, 4), '-' + c + pw(v, 4), pw(par('-' + c + v), 4), C + pw(v, 4), -c, t('-' + c + pw(v, 4)) + ' is already simplified. The brackets put the ' + t('-' + c) + ' inside the fence, so it is raised to the power ' + t(4) + ' (' + t('-' + c + '\\to ' + C) + ').'); } },
          { id: 'e5e', level: 'EMG', make: function (r) { var c = r.int(2, 3), v = r.pick(LET), C = Math.pow(c, 4); return pairPart('-' + pw(par(c + v), 4), '-' + C + pw(v, 4), pw(par('-' + c + v), 4), C + pw(v, 4), -c, 'Outside the fence the minus sign is never raised to the power, so it survives; inside, the even exponent cancels it.', 'Here the minus sign is inside the fence, and an even exponent makes ' + t(pw('(-' + c + ')', 4) + '=' + C) + ' positive.'); } },
          { id: 'e5f', level: 'EMG', make: function (r) {
            var k = r.pick([2, 3, 5, 5]), m = 2, n = 3, A = Math.pow(-k * k, n), B = Math.pow(k * k, n);
            var fl = [{ name: 'First', label: t(pw(par('-' + pw(k, m)), n) + '=') }, { name: 'Second', label: t(pw(par(pw(par('-' + k), m)), n) + '=') }];
            return P.fields('Evaluate each.', fl, [K.number(A, function (v) { return v === B ? { code: 'fence', hint: t('-' + pw(k, 2) + '=' + (-k * k)) + ' (only the ' + t(k) + ' is squared), and a negative number cubed is negative.' } : null; }), K.number(B, function (v) { return v === A ? { code: 'fence', hint: t(pw('(-' + k + ')', 2) + '=' + k * k) + ' is positive, so its cube is positive.' } : null; })],
              [String(A), String(B)], t(F(A)) + ' and ' + t(F(B)),
              t('-' + pw(k, 2) + '=' + (-k * k)) + ', so ' + t(pw(par(-k * k), 3) + '=' + F(A)) + '. ' + t(pw('(-' + k + ')', 2) + '=' + k * k) + ', so ' + t(pw(k * k, 3) + '=' + F(B)) + '. The inner brackets decide whether ' + t(k) + ' or ' + t('-' + k) + ' is squared.',
              ['Work from the inside out.'], '(-' + k + '^2)^3 vs ((-' + k + ')^2)^3');
          } },
          { id: 'e5g', level: 'EMG', make: function (r) { var c = r.int(2, 5), vw = lets(r, 2).sort(), n = r.pick([2, 3]);
            return mc(r, 'In general, what do the brackets change when you compare ' + t(c + pw(par(vw.join('')), n)) + ' with ' + t(pw(par(c + vw.join('')), n)) + '?', [
              { html: 'In the second one the ' + t(c) + ' is inside the fence, so it is raised to the power too: ' + t(pw(c, n) + '=' + Math.pow(c, n)) + '.', right: true },
              { html: 'Nothing — brackets never change the value.', why: 'Expand both: in one of them the ' + t(c) + ' appears ' + n + ' times.' },
              { html: 'In the second one the variables are not raised to the power.', why: 'Everything inside the brackets is raised to the power, including the variables.' },
              { html: 'In the first one the ' + t(c) + ' is raised to the power ' + t(n) + '.', why: 'In ' + t(c + pw(par(vw.join('')), n)) + ' the ' + t(c) + ' is outside the fence, so it is written once.' }],
              t(c + pw(par(vw.join('')), n) + '=' + c + pw(vw[0], n) + pw(vw[1], n)) + ' but ' + t(pw(par(c + vw.join('')), n) + '=' + Math.pow(c, n) + pw(vw[0], n) + pw(vw[1], n)) + '. Only what is inside the brackets is raised to the power.', ['Expand both as repeated multiplication.'], 'what brackets change');
          } }] },
      { num: '6', stem: function (sh) { return 'Let ' + t('x=' + sh.x) + '. Evaluate each expression. Substitute the value <i>inside brackets</i> first, then apply the exponent, then deal with anything outside the fence.'; },
        shared: function (r) { return { x: r.pick([-2, -2, -3, -4]), c: r.int(2, 4) }; },
        parts: [
          { id: 'e6a', level: 'EMG', make: function (r, s) { var X = s.x, v = -X * X; return numPart(t('-' + pw('x', 2)), v, [[X * X, 'fence', 'Square ' + t('x') + ' first: ' + t(pw('(' + X + ')', 2) + '=' + X * X) + '. Then apply the minus sign in front.']], t('-' + pw('(' + X + ')', 2) + '=-(' + X * X + ')=' + v) + '.', ['Put ' + t(X) + ' in brackets when you substitute.'], '-x^2, x=' + X); } },
          { id: 'e6b', level: 'EMG', make: function (r, s) { var X = s.x, v = X * X; return numPart(t(pw('(-x)', 2)), v, [[-v, 'sign', t('-x=-(' + X + ')=' + (-X)) + ', and a square is never negative.']], t('-x=' + (-X)) + ', so ' + t(pw('(' + (-X) + ')', 2) + '=' + v) + '.', ['Work out ' + t('-x') + ' first.'], '(-x)^2, x=' + X); } },
          { id: 'e6c', level: 'EMG', make: function (r, s) { var X = s.x, v = -Math.pow(X, 3); return numPart(t('-' + pw('x', 3)), v, [[-v, 'sign', t(pw('(' + X + ')', 3) + '=' + Math.pow(X, 3)) + ', and the minus sign in front changes its sign.']], t('-' + pw('(' + X + ')', 3) + '=-(' + Math.pow(X, 3) + ')=' + v) + '.', ['Cube ' + t('x') + ' first, then apply the minus sign.'], '-x^3, x=' + X); } },
          { id: 'e6d', level: 'EMG', make: function (r, s) { var X = s.x, v = Math.pow(-X, 3); return numPart(t(pw('(-x)', 3)), v, [[-v, 'sign', t('-x=' + (-X)) + ', which is positive.']], t('-x=' + (-X)) + ', so ' + t(pw('(' + (-X) + ')', 3) + '=' + v) + '. (Odd exponent: same as (c).)', ['Work out ' + t('-x') + ' first.'], '(-x)^3, x=' + X); } },
          { id: 'e6e', level: 'BEG', make: function (r, s) { var X = s.x, c = s.c, v = c * X * X; return numPart(t(c + pw('x', 2)), v, [[c * c * X * X, 'coef-repeated', 'Only ' + t('x') + ' is squared; the ' + t(c) + ' multiplies afterwards.'], [-v, 'sign', 'A square is positive.']], t(c + pw('(' + X + ')', 2) + '=' + c + '(' + X * X + ')=' + v) + '.', ['Square ' + t('x') + ', then multiply by ' + t(c) + '.'], c + 'x^2, x=' + X); } },
          { id: 'e6f', level: 'BEG', make: function (r, s) { var X = s.x, c = s.c, v = c * c * X * X; return numPart(t(pw('(' + c + 'x)', 2)), v, [[c * X * X, 'coef-once', 'The ' + t(c) + ' is inside the brackets, so it is squared too.'], [-v, 'sign', 'A square is positive.']], t(pw('(' + c + '(' + X + '))', 2) + '=' + pw('(' + c * X + ')', 2) + '=' + v) + '.', ['Work out ' + t(c + 'x') + ' first, then square.'], '(' + c + 'x)^2, x=' + X); } }] },
      { num: '7', stem: 'Now generalise what questions 4 and 6 showed you. Let ' + t('a') + ' be any number and let ' + t('n') + ' be a positive whole number.', parts: [
        { id: 'e7a', level: 'EMG', make: function (r) {
          return mc(r, 'For which exponents ' + t('n') + ' is ' + t('(-a)^{n}=-a^{n}') + '?', [
            { html: 'When ' + t('n') + ' is <b>odd</b>: the ' + t('n') + ' negative factors pair off and one is left over.', right: true },
            { html: 'When ' + t('n') + ' is <b>even</b>: the negatives cancel in pairs.', why: 'If the negatives all cancel, the result is positive, ' + t('a^{n}') + ' — not ' + t('-a^{n}') + '. Try ' + t('n=2, a=3') + '.' },
            { html: 'For every ' + t('n') + '.', why: 'Try ' + t('a=3, n=2') + ': ' + t('(-3)^{2}=9') + ' but ' + t('-3^{2}=-9') + '.' },
            { html: 'Never.', why: 'Try ' + t('a=2, n=3') + ': ' + t('(-2)^{3}=-8') + ' and ' + t('-2^{3}=-8') + '.' }],
            t('(-a)^{n}') + ' has ' + t('n') + ' negative factors. They pair off, each pair giving ' + t('+1') + '; when ' + t('n') + ' is odd one is left over, so ' + t('(-a)^{n}=-a^{n}') + '. Example: ' + t('(-2)^{3}=-8=-2^{3}') + '.', ['Try a few: ' + t('(-2)^{2}, (-2)^{3}, (-2)^{4}') + '.'], 'when (-a)^n = -a^n');
        } },
        { id: 'e7b', level: 'EMG', make: function (r) {
          return mc(r, 'For which exponents ' + t('n') + ' is ' + t('(-a)^{n}=a^{n}') + '?', [
            { html: 'When ' + t('n') + ' is <b>even</b>.', right: true },
            { html: 'When ' + t('n') + ' is <b>odd</b>.', why: 'Try ' + t('(-2)^{3}') + ': is it ' + t('2^{3}') + '?' },
            { html: 'Only when ' + t('n=2') + '.', why: 'Try ' + t('(-2)^{4}') + ' too.' },
            { html: 'Never, because a negative base always gives a negative answer.', why: t('(-2)^{2}=(-2)(-2)=4') + '.' }],
            'When ' + t('n') + ' is even the ' + t('n') + ' negative factors pair off completely, so no minus sign is left: ' + t('(-a)^{n}=a^{n}') + '. Example: ' + t('(-2)^{4}=16=2^{4}') + '.', ['Count the negative factors.'], 'when (-a)^n = a^n');
        } },
        { id: 'e7c', level: 'PRG', make: function (r) {
          return P.number('Is there a value of ' + t('a') + ' for which <b>both</b> equations hold no matter what ' + t('n') + ' is? Enter it.', 0, function (v) {
            if (v === 1 || v === -1) return { code: 'value', hint: 'Test ' + t('n=1') + ' and ' + t('n=2') + ' with ' + t('a=' + v) + ': do both ' + t('(-a)^{n}=-a^{n}') + ' and ' + t('(-a)^{n}=a^{n}') + ' hold?' };
            return null;
          }, 'If both hold for the same ' + t('n') + ', then ' + t('-a^{n}=a^{n}') + ', so ' + t('2a^{n}=0') + ' and ' + t('a=0') + '. Check: ' + t('(-0)^{n}=0') + ', ' + t('-0^{n}=0') + ' and ' + t('0^{n}=0') + ' for every positive ' + t('n') + '.',
          ['If both are true, then ' + t('-a^{n}=a^{n}') + '. What number equals its own opposite?'], 'a with both identities', { before: t('a=') });
        } }] },
      { num: '8', section: 'Extra practice C — The laws with symbolic exponents', stem: 'The exponent laws do not care whether the exponents are numbers or letters. Simplify each, leaving a single power with a simplified exponent. Assume every base is non-zero.', parts: [
        { id: 'e8a', level: 'EMG', make: function (r) { var c = r.int(1, 6), v = r.pick(['x', 'x', 'y', 'b']);
          return symPart(pw(v, 'n') + '\\cdot ' + pw(v, 'n+' + c), pw(v, '2n+' + c), [[pw(v, 'n(n+' + c + ')'), 'mult-exp', 'Product Law: <b>add</b> the exponents.'], [pw(v, 'n+' + c), 'exp', 'Add both exponents: ' + t('n+(n+' + c + ')') + '.']],
            LAW.prod + ': ' + t(pw(v, 'n+(n+' + c + ')') + '=' + pw(v, '2n+' + c)) + '.', v + '^n ' + v + '^(n+' + c + ')'); } },
        { id: 'e8b', level: 'PRG', make: function (r) { var p = r.int(2, 4), c = r.int(3, 8), d = r.int(1, c - 1), v = r.pick(['y', 'y', 'z', 'w']), q = p - 1, k = c - d;
          return symPart(dfr(pw(v, p + 'm+' + c), pw(v, 'm+' + d)), pw(v, cT(q, 'm') + '+' + k), [[pw(v, cT(q, 'm') + '+' + (c + d)), 'minus-dist', 'Subtract the <b>whole</b> exponent ' + t('(m+' + d + ')') + ': the ' + t(d) + ' is subtracted too.'], [pw(v, (p + 1) + 'm+' + (c + d)), 'sub-wrong', 'Quotient Law: <b>subtract</b> the exponents.']],
            LAW.quot + ': ' + t(pw(v, '(' + p + 'm+' + c + ')-(m+' + d + ')') + '=' + pw(v, cT(q, 'm') + '+' + k)) + '.', v + '^(' + p + 'm+' + c + ')/' + v + '^(m+' + d + ')'); } },
        { id: 'e8c', level: 'EMG', make: function (r) { var p = r.int(2, 5), c = r.int(1, 5), v = r.pick(['a', 'a', 'p', 'h']);
          return symPart(pw(par(pw(v, 'k+' + c)), p), pw(v, p + 'k+' + p * c), [[pw(v, p + 'k+' + c), 'minus-dist', 'Multiply the <b>whole</b> exponent by ' + t(p) + ': ' + t(p + '(k+' + c + ')=' + p + 'k+' + p * c) + '.'], [pw(v, 'k+' + (c + p)), 'add-exp', 'Power of a Power: <b>multiply</b> the exponents.']],
            LAW.pp + ': ' + t(pw(v, p + '(k+' + c + ')') + '=' + pw(v, p + 'k+' + p * c)) + '.', '(' + v + '^(k+' + c + '))^' + p); } },
        { id: 'e8d', level: 'EMG', make: function (r) { var c = r.int(1, 6), v = r.pick(['b', 'b', 'q', 't']);
          return symPart(pw(v, 'n-' + c) + '\\cdot ' + pw(v, 'n+' + c), pw(v, '2n'), [[pw(v, '2n-' + 2 * c), 'exp', t('-' + c + '+' + c + '=0') + '.']], LAW.prod + ': ' + t(pw(v, '(n-' + c + ')+(n+' + c + ')') + '=' + pw(v, '2n')) + '.', v + '^(n-' + c + ')' + v + '^(n+' + c + ')'); } },
        { id: 'e8e', level: 'EMG', make: function (r) { var x = pickWhere(function () { return [r.int(2, 5), r.int(1, 4)]; }, function (x) { return x[0] + 1 - x[1] >= 1; }), p = x[0], q = x[1], k = p + 1 - q, v = r.pick(['c', 'c', 'u', 'r']);
          return symPart(pw(v, p + 'n') + '\\cdot ' + pw(v, 'n') + '\\div ' + pw(v, cT(q, 'n')), pw(v, cT(k, 'n')), [[pw(v, cT(p - q, 'n')), 'no-one', 'The middle factor ' + t(pw(v, 'n')) + ' adds ' + t('n') + ' to the exponent too.']],
            LAW.prod + ', then ' + LAW.quot + ': ' + t(pw(v, (p + 1) + 'n') + '\\div ' + pw(v, cT(q, 'n')) + '=' + pw(v, cT(k, 'n'))) + '.', v + '^' + p + 'n ' + v + '^n / ' + v + '^' + q + 'n'); } },
        { id: 'e8f', level: 'PRG', make: function (r) { var p = r.int(3, 5), c = r.int(1, 5), v = r.pick(['w', 'w', 'm', 's']);
          return symPart(dfr(pw(v, p + 'n'), pw(v, 'n-' + c)), pw(v, (p - 1) + 'n+' + c), [[pw(v, (p - 1) + 'n-' + c), 'minus-dist', 'Subtracting ' + t('(n-' + c + ')') + ' means ' + t('-n+' + c) + ': bracket the exponent you subtract.']],
            LAW.quot + ' (bracket the exponent you subtract): ' + t(pw(v, p + 'n-(n-' + c + ')') + '=' + pw(v, p + 'n-n+' + c) + '=' + pw(v, (p - 1) + 'n+' + c)) + '.', v + '^' + p + 'n/' + v + '^(n-' + c + ')'); } }] },
      { num: '9', stem: 'Same idea, with more than one base in play. Assume every base is non-zero.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) { var p = r.int(2, 4), q = r.int(2, 4);
          return symPart(pw(par(pw('x', p + 'n') + pw('y', 'n')), q), pw('x', p * q + 'n') + pw('y', q + 'n'), [[pw('x', p * q + 'n') + pw('y', 'n'), 'part-base', 'The outer exponent applies to ' + t('y') + ' too.'], [pw('x', (p + q) + 'n') + pw('y', q + 'n'), 'add-exp', 'Power of a Power: multiply ' + t(p + 'n\\times ' + q) + '.']],
            LAW.prodP + ', then ' + LAW.pp + ': ' + t(pw('x', p + 'n\\times ' + q) + pw('y', 'n\\times ' + q) + '=' + pw('x', p * q + 'n') + pw('y', q + 'n')) + '.', '(x^' + p + 'n y^n)^' + q); } },
        { id: 'e9b', level: 'EMG', make: function (r) { var p = r.int(3, 6), v = r.pick(['t', 't', 'k', 'z']);
          return symPart(dfr(pw(par(pw(v, 'n')), p), pw(v, 'n')), pw(v, (p - 1) + 'n'), [[pw(v, p + 'n'), 'exp', 'Then divide by ' + t(pw(v, 'n')) + ': subtract ' + t('n') + '.'], [pw(v, 'n+' + p), 'add-exp', 'Power of a Power: ' + t(pw(par(pw(v, 'n')), p) + '=' + pw(v, p + 'n')) + '.']],
            LAW.pp + ', then ' + LAW.quot + ': ' + t(fr(pw(v, p + 'n'), pw(v, 'n')) + '=' + pw(v, p + 'n-n') + '=' + pw(v, (p - 1) + 'n')) + '.', '(' + v + '^n)^' + p + '/' + v + '^n'); } },
        { id: 'e9c', level: 'EMG', make: function (r) { var B = r.pick([['m', 'n', 'a', 'b', 'c'], ['m', 'n', 'a', 'b', 'c'], ['x', 'y', 'p', 'q', 'r']]);
          return symPart(pw(par(pw(B[0], B[2]) + pw(B[1], B[3])), B[4]), pw(B[0], B[2] + B[4]) + pw(B[1], B[3] + B[4]), [[pw(B[0], B[2] + '+' + B[4]) + pw(B[1], B[3] + '+' + B[4]), 'add-exp', 'Power of a Power: <b>multiply</b> the exponents.']],
            LAW.prodP + ', then ' + LAW.pp + ': ' + t(pw(par(pw(B[0], B[2])), B[4]) + pw(par(pw(B[1], B[3])), B[4]) + '=' + pw(B[0], B[2] + B[4]) + pw(B[1], B[3] + B[4])) + '.', '(' + B[0] + '^' + B[2] + B[1] + '^' + B[3] + ')^' + B[4]); } },
        { id: 'e9d', level: 'EMG', make: function (r) { var c = r.int(2, 7), v = r.pick(['p', 'p', 'q', 'w']);
          return mc(r, 'Simplify ' + t(dfr(pw(v, c + 'k'), pw(v, c + 'k'))) + ' and state the restriction on ' + t(v) + '.', [
            { html: t('1') + ', provided ' + t(v + '\\neq 0'), right: true },
            { html: t('0') + ', provided ' + t(v + '\\neq 0'), why: 'Subtracting the exponents gives ' + t(pw(v, 0)) + ', and ' + t(pw(v, 0) + '=1') + ', not ' + t(0) + '.' },
            { html: t(v) + ', with no restriction', why: t(pw(v, c + 'k-' + c + 'k') + '=' + pw(v, 0)) + '. And a quotient needs a non-zero denominator.' },
            { html: t('1') + ', with no restriction', why: 'If ' + t(v + '=0') + ' the quotient is ' + t(fr(0, 0)) + ', which is undefined.' }],
            LAW.quot + ': ' + t(pw(v, c + 'k-' + c + 'k') + '=' + pw(v, 0) + '=1') + ', provided ' + t(v + '\\neq 0') + ' (otherwise the quotient is ' + t(fr(0, 0)) + ', undefined).', ['Anything non-zero divided by itself is...?'], v + '^' + c + 'k/' + v + '^' + c + 'k');
        } },
        { id: 'e9e', level: 'PRG', make: function (r) { var q = r.int(2, 4), p = r.int(1, 3);
          return symPart(pw(par(dfr(pw('r', 'n'), pw('s', p === 1 ? 'n' : p + 'n'))), q), fr(pw('r', q + 'n'), pw('s', p * q + 'n')), [[fr(pw('r', q + 'n'), pw('s', p + 'n')), 'part-base', 'Raise the denominator to the power ' + t(q) + ' as well.'], [fr(pw('r', 'n+' + q), pw('s', cT(p, 'n') + '+' + q)), 'add-exp', 'Power of a Power: <b>multiply</b>.']],
            LAW.quotP + ', then ' + LAW.pp + ': ' + t(fr(pw(par(pw('r', 'n')), q), pw(par(pw('s', cT(p, 'n'))), q)) + '=' + fr(pw('r', q + 'n'), pw('s', p * q + 'n'))) + '.', '(r^n/s^' + p + 'n)^' + q); } },
        { id: 'e9f', level: 'PRG', make: function (r) { var c = r.int(2, 7), v = r.pick(['z', 'z', 'y', 'h']);
          return symPart(dfr(pw(v, 'n+' + c) + '\\cdot ' + pw(v, 'n'), pw(par(pw(v, 'n')), 2)), pw(v, c), [[pw(v, 'n+' + c), 'add-exp', 'The bottom is ' + t(pw(par(pw(v, 'n')), 2) + '=' + pw(v, '2n')) + ' (multiply).']],
            'Top: ' + t(pw(v, '2n+' + c)) + '. Bottom: ' + t(pw(v, '2n')) + '. ' + t(fr(pw(v, '2n+' + c), pw(v, '2n')) + '=' + pw(v, c)) + '.', v + '^(n+' + c + ')' + v + '^n/(' + v + '^n)^2'); } }] },
      { num: '10', stem: 'Coefficients and exponents obey different rules in the same expression: the coefficients are <i>multiplied or divided</i>, while the exponents are <i>added or subtracted</i>. Simplify.', parts: [
        { id: 'e10a', level: 'EMG', make: function (r) { var x = pickWhere(function () { return [r.int(2, 6), r.int(2, 6)]; }, function (x) { return x[0] * x[1] !== x[0] + x[1]; }), a = x[0], b = x[1], m = r.int(2, 6), n = r.int(2, 6), v = r.pick(['x', 'x', 'y', 'm']);
          return expoPart(t(par(a + pw(v, m)) + par(b + pw(v, n))), a * b + pw(v, m + n), [[cIs(a + b), 'coef-added', 'Multiply the coefficients: ' + t(a + '\\times ' + b) + '.'], [eIs(v, m * n), 'mult-exp', 'Product Law: <b>add</b> the exponents.']],
            'Multiply the coefficients, add the exponents: ' + t('(' + a + '\\times ' + b + ')' + pw(v, m + '+' + n) + '=' + a * b + pw(v, m + n)) + '.', ['Coefficients multiply; exponents add.'], '(' + a + v + '^' + m + ')(' + b + v + '^' + n + ')', { bad: [(a + b) + pw(v, m + n)] }); } },
        { id: 'e10b', level: 'EMG', make: function (r) { var c = r.pick([2, 2, 3]), p = c === 2 ? r.int(3, 5) : r.int(2, 4), e = r.int(2, 5), C = Math.pow(c, p), v = r.pick(['a', 'a', 'b', 'k']);
          return expoPart(t(pw(par(c + pw(v, e)), p)), C + pw(v, e * p), [[cIs(c), 'coef-not-raised', 'The ' + t(c) + ' is inside the fence, so raise it too.'], [cIs(c * p), 'coef-times', t(pw(c, p)) + ' means ' + t(rep(c, p)) + '.'], [eIs(v, e + p), 'add-exp', 'Power of a Power: multiply.']],
            'Raise the ' + t(c) + ' too: ' + t(pw(c, p) + pw(par(pw(v, e)), p) + '=' + C + pw(v, e * p)) + '.', ['Every factor inside the brackets gets the exponent.'], '(' + c + v + '^' + e + ')^' + p, { bad: [c + pw(v, e * p)] }); } },
        { id: 'e10c', level: 'EMG', make: function (r) { var b = r.int(2, 5), q = r.int(2, 6), a = b * q, m = r.int(6, 10), n = r.int(2, m - 2), v = r.pick(['w', 'w', 'p', 'z']);
          return expoPart(t(dfr(a + pw(v, m), b + pw(v, n))), (q === 1 ? '' : q) + pw(v, m - n), [[cIs(a - b), 'coef-sub', 'Divide the coefficients: ' + t(a + '\\div ' + b) + '.'], [eIs(v, m / n), 'div-exp', 'Quotient Law: <b>subtract</b> the exponents.']],
            'Divide the coefficients, subtract the exponents: ' + t(fr(a, b) + pw(v, m + '-' + n) + '=' + q + pw(v, m - n)) + '.', ['Coefficients divide; exponents subtract.'], a + v + '^' + m + '/' + b + v + '^' + n); } },
        { id: 'e10d', level: 'PRG', make: function (r) { var c = r.pick([2, 2, 3]), p = c === 2 ? r.pick([3, 4]) : r.pick([2, 3]), e = r.int(2, 4), f = r.int(2, 3), C = Math.pow(c, p);
          return expoPart(t(pw(par(dfr(c + pw('r', e), pw('s', f))), p)), fr(C + pw('r', e * p), pw('s', f * p)), [[cIs(c), 'coef-not-raised', 'Raise the ' + t(c) + ' to the power too.'], [cIs(c * p), 'coef-times', t(pw(c, p)) + ' means ' + t(rep(c, p)) + '.']],
            LAW.quotP + ': ' + t(fr(pw(c, p) + pw(par(pw('r', e)), p), pw(par(pw('s', f)), p)) + '=' + fr(C + pw('r', e * p), pw('s', f * p))) + '.', ['Raise every factor, top and bottom, to the power.'], '(' + c + 'r^' + e + '/s^' + f + ')^' + p); } },
        { id: 'e10e', level: 'EMG', make: function (r) { var c = r.int(2, 4), e = r.int(2, 3), C = Math.pow(c, 3);
          return expoPart(t(pw(par('-' + c + pw('p', e) + 'q'), 3)), '-' + C + pw('p', 3 * e) + pw('q', 3), [[cIs(C), 'sign', 'An odd exponent keeps the negative sign.'], [cIs(-c), 'coef-not-raised', 'Raise the ' + t('-' + c) + ' to the power too.'], [cIs(-3 * c), 'coef-times', t(pw('(-' + c + ')', 3)) + ' means ' + t(rep('(-' + c + ')', 3)) + '.']],
            t(pw('(-' + c + ')', 3) + pw(par(pw('p', e)), 3) + pw('q', 3) + '=-' + C + pw('p', 3 * e) + pw('q', 3)) + ' (odd exponent keeps the sign).', ['Raise each of ' + t('-' + c) + ', ' + t(pw('p', e)) + ' and ' + t('q') + ' to the power.'], '(-' + c + 'p^' + e + 'q)^3'); } },
        { id: 'e10f', level: 'PRG', make: function (r) { var c = r.int(2, 6), e = r.int(2, 4), f = pickWhere(function () { return r.int(2, 2 * e - 1); }, function (f) { return 2 * e - f >= 1 && 2 * e - f <= 3; }), k = 2 * e - f, v = r.pick(['m', 'm', 'n', 'x']);
          return expoPart(t(dfr(pw(par(c + pw(v, e)), 2), c + pw(v, f))), c + (k === 1 ? v : pw(v, k)), [[cIs(1), 'coef-not-raised', 'Square the ' + t(c) + ' on top first: ' + t(pw(c, 2) + '=' + c * c) + '.'], [cIs(2), 'coef-times', t(pw(c, 2)) + ' is ' + t(c * c) + ', not ' + t(2 * c) + '.']],
            'Top: ' + t(pw(c, 2) + pw(par(pw(v, e)), 2) + '=' + c * c + pw(v, 2 * e)) + '. Then ' + t(fr(c * c + pw(v, 2 * e), c + pw(v, f)) + '=' + fr(c * c, c) + pw(v, 2 * e + '-' + f) + '=' + c + (k === 1 ? v : pw(v, k))) + '.', ['Simplify the top first, then divide.'], '(' + c + v + '^' + e + ')^2/' + c + v + '^' + f); } }] },
      { num: '11', section: 'Extra practice D — Working backwards to a missing exponent', stem: 'Simplify the left side first, then read off what the missing exponent ' + t('\\square') + ' must be.', parts: [
        { id: 'e11a', level: 'PRG', make: function (r) { var x = pickWhere(function () { return [r.int(3, 8), r.int(2, 4), r.int(2, 6)]; }, function (x) { return x[0] * x[1] - x[2] >= 4; }), b = x[0], p = x[1], q = x[2], R = b * p - q;
          return numPart(t(dfr(pw(par(pw('a', '\\square')), p), pw('a', q)) + '=' + pw('a', R)), b, [[R + q, 'divided-total', 'You found ' + t(p + '\\square') + '. Divide by ' + t(p) + ' to get the box.'], [(R - q) / p, 'sub-wrong', 'The ' + t(q) + ' is subtracted on the left, so add it back: ' + t(p + '\\square=' + R + '+' + q) + '.'], [R + q - p, 'add-exp', 'Power of a Power: ' + t(pw(par(pw('a', '\\square')), p) + '=' + pw('a', p + '\\square')) + '.']],
            'Simplify: ' + t(pw('a', p + '\\square-' + q)) + '. So ' + t(p + '\\square-' + q + '=' + R) + ', ' + t(p + '\\square=' + (R + q)) + ', and ' + t('\\square=' + b) + '.', ['Write the left side as a single power of ' + t('a') + ' with ' + t('\\square') + ' in its exponent.'], '(a^□)^' + p + '/a^' + q + '=a^' + R, { input: { type: 'number', before: t('\\square=') } }); } },
        { id: 'e11b', level: 'EMG', make: function (r) { var p = r.int(2, 4), q = r.int(2, 4), b = r.int(2, 9), R = p * q + b;
          return numPart(t(pw(par(pw('x', p)), q) + '\\cdot ' + pw('x', '\\square') + '=' + pw('x', R)), b, [[R - p - q, 'add-exp', 'First ' + t(pw(par(pw('x', p)), q) + '=' + pw('x', p * q)) + ' (multiply).']],
            'Simplify: ' + t(pw('x', p * q) + '\\cdot ' + pw('x', '\\square') + '=' + pw('x', p * q + '+\\square')) + '. So ' + t(p * q + '+\\square=' + R) + ' and ' + t('\\square=' + b) + '.', ['Simplify the power of a power first.'], '(x^' + p + ')^' + q + ' x^□=x^' + R, { input: { type: 'number', before: t('\\square=') } }); } },
        { id: 'e11c', level: 'ADV', make: function (r) { var p = r.int(2, 6), q = r.int(2, 4), s = r.pick([2, 2, 3]), R = r.int(5, 14), b = R - p + q * s;
          return numPart(t(dfr(pw('y', '\\square') + '\\cdot ' + pw('y', p), pw(par(pw('y', q)), s)) + '=' + pw('y', R)), b, [[R - p + q + s, 'add-exp', 'The bottom is ' + t(pw(par(pw('y', q)), s) + '=' + pw('y', q * s)) + ' (multiply).'], [R - p - q * s, 'sub-wrong', 'The bottom exponent is subtracted, so add it back.']],
            'Simplify: ' + t(fr(pw('y', '\\square+' + p), pw('y', q * s)) + '=' + pw('y', '\\square+' + p + '-' + q * s)) + '. So ' + t('\\square' + (p - q * s >= 0 ? '+' + (p - q * s) : String(p - q * s)) + '=' + R) + ' and ' + t('\\square=' + b) + '.', ['Simplify the top and the bottom, then use the Quotient Law.'], 'y^□ y^' + p + '/(y^' + q + ')^' + s + '=y^' + R, { input: { type: 'number', before: t('\\square=') } }); } },
        { id: 'e11d', level: 'PRG', make: function (r) { var p = r.int(2, 6), b = r.int(2, 9), s = r.pick([2, 2, 3]), R = s * (p + b);
          return numPart(t(pw(par(pw('z', p) + pw('z', '\\square')), s) + '=' + pw('z', R)), b, [[R - p * s, 'divided-total', 'Divide by ' + t(s) + ' first: ' + t(p + '+\\square=' + R / s) + '.'], [(R - p) / s, 'minus-dist', 'The ' + t(s) + ' multiplies the <b>whole</b> exponent ' + t('(' + p + '+\\square)') + '.'], [R - p, 'add-exp', 'The outer exponent ' + t(s) + ' multiplies the inside exponent.']],
            'Simplify: ' + t(pw(par(pw('z', p + '+\\square')), s) + '=' + pw('z', s + '(' + p + '+\\square)')) + '. So ' + t(s + '(' + p + '+\\square)=' + R) + ', ' + t(p + '+\\square=' + R / s) + ', and ' + t('\\square=' + b) + '.', ['Combine inside the brackets first.'], '(z^' + p + 'z^□)^' + s + '=z^' + R, { input: { type: 'number', before: t('\\square=') } }); } },
        { id: 'e11e', level: 'PRG', make: function (r) { var s = r.pick([2, 3, 4]), d = r.int(2, 6), b = r.int(2, 6), p = b + d, R = s * d;
          return numPart(t(pw(par(dfr(pw('m', p), pw('m', '\\square'))), s) + '=' + pw('m', R)), b, [[p * s - R, 'minus-dist', 'The ' + t(s) + ' multiplies the whole exponent: ' + t(s + '(' + p + '-\\square)=' + R) + ', so ' + t(p + '-\\square=' + d) + '.'], [p + d, 'sub-wrong', t(p + '-\\square=' + d) + ', so the box is less than ' + t(p) + '.']],
            'Simplify: ' + t(pw(par(pw('m', p + '-\\square')), s) + '=' + pw('m', s + '(' + p + '-\\square)')) + '. So ' + t(s + '(' + p + '-\\square)=' + R) + ', ' + t(p + '-\\square=' + d) + ', and ' + t('\\square=' + b) + '.', ['Simplify inside the brackets first.'], '(m^' + p + '/m^□)^' + s + '=m^' + R, { input: { type: 'number', before: t('\\square=') } }); } },
        { id: 'e11f', level: 'EMG', make: function (r) { var v = r.pick(['t', 't', 'k', 'w']);
          return mc(r, t(dfr(pw(v, '\\square'), pw(v, '\\square')) + '=1') + ', with the two boxes <b>different</b> numbers. Is that possible (for a general base ' + t(v) + ')?', [
            { html: 'No: ' + t(fr(pw(v, 'p'), pw(v, 'q')) + '=' + pw(v, 'p-q')) + ', which is ' + t('1=' + pw(v, 0)) + ' only when ' + t('p-q=0') + ', so the boxes must match.', right: true },
            { html: 'Yes: any two exponents work, because a number divided by itself is ' + t(1) + '.', why: 'With different exponents the top and bottom are different numbers. Try ' + t(fr(pw(2, 5), pw(2, 3))) + '.' },
            { html: 'Yes, as long as the top exponent is bigger.', why: t(fr(pw(v, 5), pw(v, 3)) + '=' + pw(v, 2)) + ', not ' + t(1) + '.' },
            { html: 'No, because exponents can’t be subtracted.', why: 'The Quotient Law does subtract exponents — use it.' }],
            'Call the boxes ' + t('p') + ' and ' + t('q') + ': ' + t(fr(pw(v, 'p'), pw(v, 'q')) + '=' + pw(v, 'p-q')) + ', which is ' + t('1=' + pw(v, 0)) + ' only when ' + t('p=q') + '. So for a general base it is <b>not possible</b>. (Only ' + t(v + '=1') + ', or ' + t(v + '=-1') + ' with ' + t('p-q') + ' even, allow it.)', ['Use the Quotient Law with exponents ' + t('p') + ' and ' + t('q') + '.'], 't^□/t^□=1 different boxes');
        } }] },
      { num: '12', stem: 'Find the whole number ' + t('n') + ' in each case.', parts: [
        { id: 'e12a', level: 'EMG', make: function (r) { var c = r.int(3, 6), n = r.int(3, 9), T = c * n;
          return numPart(t(rep(par(pw('w', 'n')), c, '') + '=' + pw('w', T)), n, [[T - c, 'subtracted', 'The ' + c + ' factors multiply, so the exponents add to ' + t(c + 'n') + '.'], [T * c, 'multiplied', t(c + 'n=' + T) + ': divide.']],
            LAW.prod + ', ' + c + ' equal factors: ' + t(pw('w', c + 'n') + '=' + pw('w', T)) + ', so ' + t(c + 'n=' + T) + ' and ' + t('n=' + n) + '.', ['Add the exponents on the left.'], c + ' factors w^n=w^' + T, { input: { type: 'number', before: t('n=') } }); } },
        { id: 'e12b', level: 'EMG', make: function (r) { var p = r.int(3, 5), n = r.int(3, 9), T = (p - 1) * n;
          return numPart(t(dfr(pw('k', p + 'n'), pw('k', 'n')) + '=' + pw('k', T)), n, [[T / p, 'div-exp', 'Quotient Law: ' + t(p + 'n-n=' + (p - 1) + 'n') + '.'], [T / (p + 1), 'sub-wrong', 'Subtract the exponents: ' + t(p + 'n-n') + '.']],
            LAW.quot + ': ' + t(pw('k', p + 'n-n') + '=' + pw('k', cT(p - 1, 'n'))) + ', so ' + t(cT(p - 1, 'n') + '=' + T) + ' and ' + t('n=' + n) + '.', ['Use the Quotient Law first.'], 'k^' + p + 'n/k^n=k^' + T, { input: { type: 'number', before: t('n=') } }); } },
        { id: 'e12c', level: 'EMG', make: function (r) { var p = r.int(3, 7), n = r.int(3, 9), T = p * n;
          return numPart(t(pw(par(pw('y', 'n')), p) + '=' + pw('y', T)), n, [[T - p, 'add-exp', 'Power of a Power: ' + t(p + 'n=' + T) + '.']],
            LAW.pp + ': ' + t(p + 'n=' + T) + ', so ' + t('n=' + n) + '.', ['Multiply the exponents, then match.'], '(y^n)^' + p + '=y^' + T, { input: { type: 'number', before: t('n=') } }); } },
        { id: 'e12d', level: 'PRG', make: function (r) { var a = r.int(1, 6), n = r.int(3, 9), b = n + a;
          return numPart(t(pw('v', '2n+' + a) + '=' + pw('v', 'n+' + b)), n, [[(b - a) / 2, 'exp', 'Collect the ' + t('n') + '-terms: ' + t('2n-n=' + b + '-' + a) + '.']],
            'Same base, so match exponents: ' + t('2n+' + a + '=n+' + b) + ', so ' + t('n=' + n) + '.', ['Set the exponents equal and solve.'], 'v^(2n+' + a + ')=v^(n+' + b + ')', { input: { type: 'number', before: t('n=') } }); } },
        { id: 'e12e', level: 'PRG', make: function (r) { var n = r.int(3, 9), T = n * n;
          return numPart(t(pw(par(pw('c', 'n')), 'n') + '=' + pw('c', T)), n, [[T / 2, 'n-squared', t(pw(par(pw('c', 'n')), 'n') + '=' + pw('c', 'n\\times n')) + ', not ' + t(pw('c', '2n')) + '.'], [-n, 'sign', t('n') + ' is a whole number.']],
            LAW.pp + ': ' + t(pw('c', 'n\\times n') + '=' + pw('c', 'n^{2}')) + '. So ' + t('n^{2}=' + T) + ', ' + t('n=\\pm' + n) + '; a whole number, so ' + t('n=' + n) + '.', ['Multiply the exponents: what is ' + t('n\\times n') + '?'], '(c^n)^n=c^' + T, { input: { type: 'number', before: t('n=') } }); } },
        { id: 'e12f', level: 'PRG', make: function (r) { var a = r.int(2, 6), b = r.int(2, 6), n = a + b;
          return numPart(t(dfr(pw('d', 'n') + '\\cdot ' + pw('d', 'n'), pw('d', a)) + '=' + pw('d', 'n+' + b)), n, [[b - a, 'sub-wrong', 'The top is ' + t(pw('d', '2n')) + '; then subtract ' + t(a) + ': ' + t('2n-' + a + '=n+' + b) + '.'], [(a + b) / 2, 'exp', t('2n-' + a + '=n+' + b) + ': subtract ' + t('n') + ' from both sides.']],
            'Simplify: ' + t(fr(pw('d', '2n'), pw('d', a)) + '=' + pw('d', '2n-' + a)) + '. So ' + t('2n-' + a + '=n+' + b) + ' and ' + t('n=' + n) + '.', ['Simplify the left side to one power first.'], 'd^n d^n/d^' + a + '=d^(n+' + b + ')', { input: { type: 'number', before: t('n=') } }); } }] },
      { num: '13', stem: 'Here the coefficient hides information too. Find <b>both</b> unknowns.', parts: [
        { id: 'e13a', level: 'ADV', make: function (r) { var c = r.pick([3, 3, 2, 5]), n = c === 2 ? r.int(3, 5) : c === 3 ? r.int(2, 4) : r.pick([2, 3]), m = r.int(2, 6), C = Math.pow(c, n); return twoUnk(c, 'x', 'm', 'n', m, n, C, m * n); } },
        { id: 'e13b', level: 'ADV', make: function (r) { var c = r.pick([2, 2, 3]), n = c === 2 ? r.int(3, 6) : r.int(2, 4), m = r.int(2, 6), C = Math.pow(c, n); return twoUnk(c, 'a', 'p', 'q', m, n, C, m * n); } },
        { id: 'e13c', level: 'PRG', make: function (r) { var k = r.int(2, 9), e = r.int(2, 5), K2 = k * k;
          var fl = [{ name: 'One value', label: t('k=') }, { name: 'Other value', label: 'or ' + t('k=') }];
          return { prompt: t(pw(par('k' + pw('x', e)), 2) + '=' + K2 + pw('x', 2 * e)) + ' — there are two values of ' + t('k') + '. Find both.', input: { type: 'fields', fields: fl }, key: [String(k), String(-k)], answer: t('k=' + k) + ' or ' + t('k=-' + k), text: '(kx^' + e + ')^2=' + K2 + 'x^' + 2 * e,
            check: function (resp) {
              resp = resp || []; var a = HW.parse.number(resp[0] || ''), b = HW.parse.number(resp[1] || '');
              if (!a.ok && !b.ok) return form('empty', 'Type a value of ' + t('k') + ' in each box.');
              var got = [a, b].filter(function (x) { return x.ok; }).map(function (x) { return x.value; });
              for (var i = 0; i < got.length; i++) if (Math.abs(got[i]) !== k) return wrong(got[i] === K2 / 2 ? 'times-exp' : 'value', got[i] === K2 / 2 ? t('k^{2}') + ' means ' + t('k\\times k') + ', not ' + t('2k') + '.' : 'The coefficient on the left is ' + t('k^{2}') + ', and it has to equal ' + t(K2) + '.');
              if (got.length < 2) return form('blank', 'Right — now find the other value of ' + t('k') + '.');
              if (got[0] === got[1]) return wrong('pos-only', 'Squaring erases the sign: what else squares to ' + t(K2) + '?');
              return ok();
            },
            solution: t(pw(par('k' + pw('x', e)), 2) + '=k^{2}' + pw('x', 2 * e)) + '. The exponents match either way, so the coefficient alone decides: ' + t('k^{2}=' + K2) + ', so ' + t('k=' + k) + ' <b>or</b> ' + t('k=-' + k) + '.',
            hints: ['Expand the left side: the coefficient becomes ' + t('k^{2}') + '. Which numbers square to ' + t(K2) + '?'], good: [[String(-k), String(k)]], bad: [[String(k), String(k)], [String(k), '']] };
        } }] },
      { num: '14', section: 'Extra practice E — Find the error', stem: function (sh) { return 'Asked to simplify ' + t(par(sh.a + pw('x', sh.m)) + par(sh.b + pw('x', sh.n))) + ', a student wrote ' + t(par(sh.a + pw('x', sh.m)) + par(sh.b + pw('x', sh.n)) + '=' + (sh.a + sh.b) + pw('x', sh.m + sh.n)) + '.'; },
        shared: function (r) { var ab = pickWhere(function () { return [r.int(2, 6), r.int(2, 6)]; }, function (x) { return x[0] * x[1] !== x[0] + x[1]; }), mn = pickWhere(function () { return [r.int(2, 6), r.int(2, 6)]; }, function (x) { return x[0] * x[1] !== x[0] + x[1]; }); return { a: ab[0], b: ab[1], m: mn[0], n: mn[1] }; },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, s) {
            return mc(r, 'The exponent ' + t(s.m + s.n) + ' is correct. What did the student do wrong?', [
              { html: 'Added the coefficients (' + t(s.a + '+' + s.b) + ') instead of multiplying them (' + t(s.a + '\\times ' + s.b) + ').', right: true },
              { html: 'Added the exponents instead of multiplying them.', why: 'The exponent is right: the Product Law <b>adds</b> exponents.' },
              { html: 'Should have multiplied everything: ' + t(s.a * s.b + pw('x', s.m * s.n)) + '.', why: 'Coefficients multiply, but exponents of the same base add.' },
              { html: 'Nothing — the answer is correct.', why: 'Substitute ' + t('x=1') + ' into both and compare.' }],
              'Coefficients multiply; exponents add. The student added the coefficients: ' + t(s.a + '+' + s.b + '=' + (s.a + s.b)) + ' instead of ' + t(s.a + '\\times ' + s.b + '=' + s.a * s.b) + '.', ['Which rule is for coefficients and which is for exponents?'], 'error: added coefficients');
          } },
          { id: 'e14b', level: 'BEG', make: function (r, s) {
            return expoPart('Give the correct answer.', s.a * s.b + pw('x', s.m + s.n), [[cIs(s.a + s.b), 'coef-added', 'That’s the student’s answer — multiply the coefficients.'], [eIs('x', s.m * s.n), 'mult-exp', 'The exponents add.']],
              'Multiply coefficients, add exponents: ' + t('(' + s.a + '\\times ' + s.b + ')' + pw('x', s.m + '+' + s.n) + '=' + s.a * s.b + pw('x', s.m + s.n)) + '.', ['Coefficients multiply; exponents add.'], 'correct (' + s.a + 'x^' + s.m + ')(' + s.b + 'x^' + s.n + ')');
          } },
          { id: 'e14c', level: 'BEG', make: function (r, s) {
            var fl = [{ name: 'Original', label: 'original at ' + t('x=1') + ':' }, { name: 'Student', label: 'student’s answer at ' + t('x=1') + ':' }];
            return P.fields('Substitute ' + t('x=1') + ' into the original and into the student’s answer.', fl, [K.number(s.a * s.b, function (v) { return v === s.a + s.b ? { code: 'coef-added', hint: t(par(s.a + '(1)') + par(s.b + '(1)')) + ' is a product.' } : null; }), K.number(s.a + s.b)],
              [String(s.a * s.b), String(s.a + s.b)], t(s.a * s.b) + ' and ' + t(s.a + s.b),
              'Original: ' + t(par(s.a + pw('(1)', s.m)) + par(s.b + pw('(1)', s.n)) + '=' + s.a + '\\times ' + s.b + '=' + s.a * s.b) + '. Student: ' + t((s.a + s.b) + pw('(1)', s.m + s.n) + '=' + (s.a + s.b)) + '. They disagree, so the student’s answer is wrong.', ['Every power of ' + t(1) + ' is ' + t(1) + '.'], 'x=1 check');
          } }] },
      { num: '15', stem: function (sh) { return 'Asked to simplify ' + t(pw(par(pw('x', sh.a)), sh.b)) + ', a student wrote ' + t(pw(par(pw('x', sh.a)), sh.b) + '=' + pw('x', sh.a + sh.b)) + '.'; },
        shared: function (r) { var ab = pickWhere(function () { return [r.int(2, 5), r.int(2, 5)]; }, function (x) { return x[0] * x[1] !== x[0] + x[1]; }); return { a: ab[0], b: ab[1] }; },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which law did the student use, and which one did the question call for?', [
              { html: 'Used the Product Law (added); needed the Power of a Power Law (multiply): ' + t(pw('x', s.a * s.b)) + '.', right: true },
              { html: 'Used the Power of a Power Law; needed the Product Law.', why: 'Adding exponents is the Product Law — and that is what the student did.' },
              { html: 'Used the Quotient Law; needed the Product Law.', why: 'Nothing was divided here. The student added the exponents.' },
              { html: 'Used the right law, but added wrong.', why: t(s.a + '+' + s.b + '=' + (s.a + s.b)) + ' is correct arithmetic — the problem is the law.' }],
              'The student added (Product Law). A power of a power calls for the Power of a Power Law: ' + t(pw(par(pw('x', s.a)), s.b) + '=' + pw('x', s.a + '\\times ' + s.b) + '=' + pw('x', s.a * s.b)) + '.', ['Is this a product of two powers, or a power raised to a power?'], 'which law (x^' + s.a + ')^' + s.b);
          } },
          { id: 'e15b', level: 'BEG', make: function (r, s) {
            return numPart('Expand ' + t(pw(par(pw('x', s.a)), s.b)) + ' as a repeated multiplication. How many factors of ' + t('x') + ' are there?', s.a * s.b, [[s.a + s.b, 'add-exp', 'There are ' + s.b + ' blocks of ' + t(pw('x', s.a)) + ', each with ' + s.a + ' factors.']],
              t(pw(par(pw('x', s.a)), s.b) + '=' + rep(pw('x', s.a), s.b, '\\cdot ')) + ': ' + s.b + ' groups of ' + s.a + ', so ' + t(s.a * s.b) + ' factors of ' + t('x') + ' — the answer is ' + t(pw('x', s.a * s.b)) + ', not ' + t(pw('x', s.a + s.b)) + '.', ['Write ' + t(pw('x', s.a)) + ' ' + s.b + ' times.'], 'count factors (x^' + s.a + ')^' + s.b);
          } },
          { id: 'e15c', level: 'EMG', make: function (r, s) {
            var A = s.a, T = s.a + s.b, X = px(pw('x', T));
            return mathPart('Write an expression that <b>does</b> simplify to ' + t(pw('x', T)) + ', using ' + t(pw('x', A)) + ' as one of its parts.', function (resp) {
              var a = K.read(resp); if (a.res) return a.res;
              var has = false; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'pow' && strip(x.a).t === 'var' && strip(x.a).n === 'x' && ex.rat(x.b) && ex.rat(x.b)[0] === A && ex.rat(x.b)[1] === 1) has = true; ['a', 'b'].forEach(function (k) { if (x[k]) w(x[k]); }); })(a.ast);
              if (!same(a.ast, X)) return wrong('value', 'Check by simplifying your expression with the exponent laws: it should come out to ' + t(pw('x', T)) + '.');
              if (!has) return form('not-x3', 'That does equal ' + t(pw('x', T)) + ' — now build it using ' + t(pw('x', A)) + ' as one of the parts.');
              return ok();
            }, pw('x', A) + '\\cdot ' + pw('x', s.b), 'Product Law, since ' + t(A + '+' + s.b + '=' + T) + ': ' + t(pw('x', A) + '\\cdot ' + pw('x', s.b) + '=' + pw('x', T)) + '. (Also ' + t(fr(pw('x', T + A), pw('x', A))) + ', among others.)',
            ['Which law <i>adds</i> exponents?'], 'expression with x^' + A + ' = x^' + T, ['x'], { good: [fr(pw('x', T + A), pw('x', A)), pw('x', s.b) + pw('x', A)], bad: [pw('x', T), pw(par(pw('x', A)), s.b)] });
          } }] },
      { num: '16', stem: 'Three more student answers. Decide whether each is right or wrong, and if it is wrong, what the correction is.', parts: [
        { id: 'e16a', level: 'EMG', make: function (r) { var c = r.int(3, 9), /* not 2: 2×2 = 2+2, so the "doubled" distractor would equal the key */ v = r.pick(['y', 'y', 'x', 'm']), C = c * c;
          return mc(r, t(pw(par(c + v), 2) + '=' + c + pw(v, 2)), [
            { html: '<b>Wrong.</b> It should be ' + t(C + pw(v, 2)) + ': the ' + t(c) + ' is inside the fence and must be squared too.', right: true },
            { html: '<b>Right.</b>', why: 'Expand it: ' + t(par(c + v) + par(c + v)) + '. How many ' + t(c) + 's?' },
            { html: '<b>Wrong.</b> It should be ' + t(2 * c + pw(v, 2)) + '.', why: 'Squaring ' + t(c) + ' means ' + t(c + '\\times ' + c) + ', not ' + t('2\\times ' + c) + '.' },
            { html: '<b>Wrong.</b> It should be ' + t(C + v) + '.', why: 'The ' + t(v) + ' is inside the brackets too, so it is squared.' }],
            '<b>Wrong.</b> ' + t(pw(par(c + v), 2) + '=' + pw(c, 2) + pw(v, 2) + '=' + C + pw(v, 2)) + '. Error: forgot to raise the coefficient.', ['Expand ' + t(pw(par(c + v), 2)) + ' as ' + t(par(c + v) + par(c + v)) + '.'], 'check (' + c + v + ')^2=' + c + v + '^2'); } },
        { id: 'e16b', level: 'EMG', make: function (r) { var q = r.int(2, 4), p = q * pickWhere(function () { return r.int(2, 5); }, function (k) { return q * k - q !== k; }), v = r.pick(['a', 'a', 'b', 'k']);
          return mc(r, t(dfr(pw(v, p), pw(v, q)) + '=' + pw(v, p / q)), [
            { html: '<b>Wrong.</b> It should be ' + t(pw(v, p - q)) + ': the Quotient Law subtracts the exponents.', right: true },
            { html: '<b>Right.</b>', why: 'Cancel the common factors: how many ' + t(v) + 's are left on top?' },
            { html: '<b>Wrong.</b> It should be ' + t(pw(v, p + q)) + '.', why: 'Dividing <b>subtracts</b> exponents.' },
            { html: '<b>Wrong.</b> It should be ' + t(pw(v, p * q)) + '.', why: 'Multiplying exponents is the Power of a Power Law. Here powers are divided.' }],
            '<b>Wrong.</b> ' + t(fr(pw(v, p), pw(v, q)) + '=' + pw(v, p + '-' + q) + '=' + pw(v, p - q)) + '. Error: divided the exponents (' + t(p + '\\div ' + q) + ').', ['Cancel ' + q + ' factors of ' + t(v) + ' from the top.'], 'check ' + v + '^' + p + '/' + v + '^' + q); } },
        { id: 'e16c', level: 'EMG', make: function (r) { var c = r.int(2, 4), v = r.pick(['b', 'b', 'y', 'n']), C = c * c * c;
          return mc(r, t(pw(par('-' + c + v), 3) + '=-' + C + pw(v, 3)), [
            { html: '<b>Right.</b> ' + t(pw('(-' + c + ')', 3) + '=-' + C) + ' — an odd exponent keeps the sign.', right: true },
            { html: '<b>Wrong.</b> It should be ' + t(C + pw(v, 3)) + '.', why: 'Three negative factors multiply to a negative.' },
            { html: '<b>Wrong.</b> It should be ' + t('-' + c + pw(v, 3)) + '.', why: 'The ' + t('-' + c) + ' is inside the fence, so it is cubed.' },
            { html: '<b>Wrong.</b> It should be ' + t('-' + 3 * c + pw(v, 3)) + '.', why: 'Cubing ' + t(c) + ' means ' + t(rep(c, 3)) + '.' }],
            '<b>Right.</b> ' + t(pw(par('-' + c + v), 3) + '=' + pw('(-' + c + ')', 3) + pw(v, 3) + '=-' + C + pw(v, 3)) + '. The odd exponent keeps the sign negative.', ['Raise each factor: ' + t('-' + c) + ' and ' + t(v) + '.'], 'check (-' + c + v + ')^3'); } }] },
      { num: '17', section: 'Extra practice F — Why the laws are true', stem: 'Explain why ' + t('a^{m}\\cdot a^{n}=a^{m+n}') + ' for whole numbers ' + t('m') + ' and ' + t('n') + ', arguing from repeated multiplication.', parts: [
        { id: 'e17', level: 'EMG', make: function (r) {
          return mc(r, 'Which argument proves the Product Law (without just citing it)?', [
            { html: t('a^{m}') + ' is ' + t('m') + ' factors of ' + t('a') + ' and ' + t('a^{n}') + ' is ' + t('n') + ' factors. Multiplying puts the two strings end to end: ' + t('m+n') + ' factors of ' + t('a') + ', which is ' + t('a^{m+n}') + '.', right: true },
            { html: 'Because ' + t('2^{3}\\cdot 2^{2}=32=2^{5}') + ', the law is true.', why: 'One example checks the law but doesn’t prove it for <i>all</i> ' + t('m') + ' and ' + t('n') + '.' },
            { html: 'The Product Law says to add exponents, so ' + t('a^{m}\\cdot a^{n}=a^{m+n}') + '.', why: 'That just cites the law — the question asks why it is true.' },
            { html: t('a^{m}\\cdot a^{n}') + ' is ' + t('m') + ' groups of ' + t('n') + ' factors, so there are ' + t('m+n') + ' factors.', why: t('m') + ' groups of ' + t('n') + ' would be ' + t('mn') + ' factors — that describes a power of a power.' }],
            t('a^{m}=\\underbrace{a\\cdots a}_{m}') + ' and ' + t('a^{n}=\\underbrace{a\\cdots a}_{n}') + '. The product is ' + t('\\underbrace{a\\cdots a}_{m+n}=a^{m+n}') + '. The exponents add because the counts of factors add.', ['Write out what ' + t('a^{m}') + ' and ' + t('a^{n}') + ' mean, then count.'], 'why product law');
        } }] },
      { num: '18', stem: 'Two more justifications, each from repeated multiplication.', parts: [
        { id: 'e18a', level: 'EMG', make: function (r) {
          return mc(r, 'Why is ' + t('\\left(a^{m}\\right)^{n}=a^{mn}') + '?', [
            { html: 'The block ' + t('a^{m}') + ' is used as a factor ' + t('n') + ' times: ' + t('n') + ' equal groups of ' + t('m') + ' factors of ' + t('a') + ' is ' + t('mn') + ' factors.', right: true },
            { html: 'The block ' + t('a^{m}') + ' is used ' + t('n') + ' times, so add: ' + t('m+n') + ' factors.', why: 'Counting ' + t('n') + ' equal groups of ' + t('m') + ' is multiplication, not addition.' },
            { html: 'Because ' + t('a^{m}') + ' raised to ' + t('n') + ' is ' + t('a^{m^{n}}') + ', which equals ' + t('a^{mn}') + '.', why: t('m^{n}') + ' and ' + t('mn') + ' are different numbers (try ' + t('m=2, n=3') + ').' },
            { html: 'Because exponents always multiply.', why: 'Multiplying powers with the same base adds exponents — they don’t always multiply.' }],
            t('\\left(a^{m}\\right)^{n}=\\underbrace{a^{m}\\cdots a^{m}}_{n\\text{ blocks}}') + '. Each block is ' + t('m') + ' factors of ' + t('a') + ', and there are ' + t('n') + ' blocks: ' + t('m\\times n') + ' factors. Counting equal-sized groups is multiplication.', ['What is being repeated, and how many times?'], 'why power of a power');
        } },
        { id: 'e18b', level: 'PRG', make: function (r) {
          return mc(r, 'Use the Quotient Law on ' + t('\\dfrac{a^{m}}{a^{m}}') + ' two different ways. What do you get, and what restriction is needed?', [
            { html: 'Way 1: it is ' + t('1') + ' (a non-zero quantity divided by itself). Way 2: ' + t('a^{m-m}=a^{0}') + '. So ' + t('a^{0}=1') + ', with ' + t('a\\neq 0') + ' because of the division.', right: true },
            { html: 'Way 1: ' + t('0') + '. Way 2: ' + t('a^{0}') + '. So ' + t('a^{0}=0') + '.', why: 'A non-zero number divided by itself is ' + t(1) + ', not ' + t(0) + '.' },
            { html: 'Way 1: ' + t('1') + '. Way 2: ' + t('a^{0}') + '. So ' + t('a^{0}=1') + ' for every ' + t('a') + ', including ' + t('0') + '.', why: 'If ' + t('a=0') + ' the quotient is ' + t('\\frac{0}{0}') + ', which is undefined — so the argument needs ' + t('a\\neq 0') + '.' },
            { html: 'Way 1: ' + t('a') + '. Way 2: ' + t('a^{1}') + '. So ' + t('a^{0}=a') + ', with ' + t('a\\neq 0') + '.', why: 'A quantity divided by itself is ' + t(1) + ', and ' + t('m-m=0') + '.' }],
            'Way 1: ' + t('\\frac{a^{m}}{a^{m}}=1') + '. Way 2: ' + t('\\frac{a^{m}}{a^{m}}=a^{m-m}=a^{0}') + '. Both describe the same value, so ' + t('a^{0}=1') + '. Restriction: ' + t('a\\neq 0') + ', forced by the division step.', ['What is any non-zero number divided by itself?'], 'why a^0=1');
        } }] },
      { num: '19', stem: function (sh) { return 'The Power of a Product Law says ' + t('(ab)^{m}=a^{m}b^{m}') + '. A tempting but false companion would be ' + t('(a+b)^{m}=a^{m}+b^{m}') + '. Use ' + t('a=' + sh.a + ',\\ b=' + sh.b + ',\\ m=2') + '.'; },
        shared: function (r) { var ab = r.sample([2, 3, 4, 5, 6], 2); if (r.chance(0.3)) ab = [3, 4]; return { a: ab[0], b: ab[1] }; },
        parts: [
          { id: 'e19a', level: 'BEG', make: function (r, s) { var L = Math.pow(s.a * s.b, 2);
            var fl = [{ name: 'Left', label: t('(ab)^{2}=') }, { name: 'Right', label: t('a^{2}b^{2}=') }];
            return P.fields('Verify ' + t('(ab)^{m}=a^{m}b^{m}') + ': evaluate both sides.', fl, [K.number(L, function (v) { return v === 2 * s.a * s.b ? { code: 'times-exp', hint: 'Squaring isn’t doubling.' } : null; }), K.number(L)], [String(L), String(L)], t(L) + ' and ' + t(L),
              'Left: ' + t(pw('(' + s.a + '\\times ' + s.b + ')', 2) + '=' + pw(s.a * s.b, 2) + '=' + L) + '. Right: ' + t(pw(s.a, 2) + '\\times ' + pw(s.b, 2) + '=' + s.a * s.a + '\\times ' + s.b * s.b + '=' + L) + '. Equal — the law holds.', ['Substitute, then follow the order of operations.'], 'verify (ab)^2'); } },
          { id: 'e19b', level: 'BEG', make: function (r, s) { var L = Math.pow(s.a + s.b, 2), R = s.a * s.a + s.b * s.b;
            var fl = [{ name: 'Left', label: t('(a+b)^{2}=') }, { name: 'Right', label: t('a^{2}+b^{2}=') }];
            return P.fields('Test ' + t('(a+b)^{m}=a^{m}+b^{m}') + ' on the same numbers.', fl, [K.number(L, function (v) { return v === R ? { code: 'value', hint: 'Add first, inside the brackets: ' + t(s.a + '+' + s.b + '=' + (s.a + s.b)) + ', then square.' } : null; }), K.number(R)], [String(L), String(R)], t(L) + ' and ' + t(R),
              'Left: ' + t(pw('(' + s.a + '+' + s.b + ')', 2) + '=' + pw(s.a + s.b, 2) + '=' + L) + '. Right: ' + t(s.a * s.a + '+' + s.b * s.b + '=' + R) + '. ' + t(L + '\\neq ' + R) + ', so the “rule” fails.', ['Brackets first on the left.'], 'test (a+b)^2'); } },
          { id: 'e19c', level: 'EMG', make: function (r, s) { var gap = 2 * s.a * s.b;
            return mc(r, 'Why does the rule work for a product but not for a sum?', [
              { html: t('(ab)^{m}') + ' is ' + t('m') + ' copies of a <b>product</b>, and the factors can be regrouped into ' + t('a^{m}b^{m}') + '. ' + t('(a+b)^{m}') + ' is ' + t('m') + ' copies of a <b>sum</b>, which can’t be split into separate factors — expanding gives extra cross terms like ' + t('2ab') + '.', right: true },
              { html: 'Exponents can only be applied to numbers, not to sums.', why: 'You can raise a sum to a power — ' + t(pw('(' + s.a + '+' + s.b + ')', 2)) + ' is fine. It just isn’t ' + t(pw(s.a, 2) + '+' + pw(s.b, 2)) + '.' },
              { html: 'It does work for sums too; the numbers were just unlucky.', why: 'One counterexample is enough to show a rule is false.' },
              { html: 'Because addition comes before multiplication in the order of operations.', why: 'Multiplication comes before addition. The real reason is about what is being repeated.' }],
              t('(ab)^{m}=(ab)(ab)\\cdots(ab)') + ': the factors regroup into ' + t('a^{m}b^{m}') + '. ' + t('(a+b)^{2}=(a+b)(a+b)=a^{2}+2ab+b^{2}') + ': the cross term ' + t('2ab=' + gap) + ' is exactly the gap you found.', ['Expand ' + t('(a+b)(a+b)') + '.'], 'why sum rule fails');
          } }] },
      { num: '20', section: 'Extra practice G — Stretch', stem: 'No calculator. Rewrite each power so that the two being compared share a <b>common base</b>, then compare.', parts: [
        { id: 'e20a', level: 'EMG', make: function (r) { var v = r.pick([[2, 100], [2, 100], [3, 60], [5, 40], [2, 80], [3, 50]]), b = v[0], N = v[1], B2 = b * b;
          return mc(r, 'Which is larger, ' + t(pw(b, N)) + ' or ' + t(pw(B2, N / 2)) + '?', [
            { html: 'They are equal.', right: true },
            { html: t(pw(b, N)) + ' is larger.', why: 'Write ' + t(B2) + ' as ' + t(pw(b, 2)) + ' and use the Power of a Power Law.' },
            { html: t(pw(B2, N / 2)) + ' is larger.', why: 'A bigger base with a smaller exponent can balance out. Write ' + t(B2 + '=' + pw(b, 2)) + '.' },
            { html: 'You can’t tell without a calculator.', why: 'Write ' + t(B2) + ' as ' + t(pw(b, 2)) + '.' }],
            t(pw(B2, N / 2) + '=' + pw(par(pw(b, 2)), N / 2) + '=' + pw(b, N)) + ', so they are <b>equal</b>.', ['Write ' + t(B2) + ' as a power of ' + t(b) + '.'], b + '^' + N + ' vs ' + B2 + '^' + N / 2, true); } },
        { id: 'e20b', level: 'PRG', make: function (r) { var b = r.pick([2, 2, 3]), M = r.int(15, 35), d = r.pick([1, 1, -1]), N = 3 * M + d, B3 = b * b * b, bigFirst = N > 3 * M;
          if (r.chance(0.3) && b === 2) { M = 33; N = 100; bigFirst = true; }
          return mc(r, 'Which is larger, ' + t(pw(b, N)) + ' or ' + t(pw(B3, M)) + '?', [
            { html: t(pw(b, N)) + ' is larger.', right: bigFirst, why: bigFirst ? null : t(pw(B3, M) + '=' + pw(b, 3 * M)) + ', and ' + t(3 * M + '>' + N) + '.' },
            { html: t(pw(B3, M)) + ' is larger.', right: !bigFirst, why: bigFirst ? t(pw(B3, M) + '=' + pw(par(pw(b, 3)), M) + '=' + pw(b, 3 * M)) + ', and ' + t(3 * M + '<' + N) + '.' : null },
            { html: 'They are equal.', why: 'Work out ' + t(pw(par(pw(b, 3)), M)) + ' as a power of ' + t(b) + ': is the exponent exactly ' + t(N) + '?' },
            { html: 'You can’t tell without a calculator.', why: 'Write ' + t(B3) + ' as ' + t(pw(b, 3)) + '.' }],
            t(pw(B3, M) + '=' + pw(par(pw(b, 3)), M) + '=' + pw(b, 3 * M)) + '. Same base ' + t(b) + ', so compare exponents: ' + (bigFirst ? t(3 * M + '<' + N) + ', so ' + t(pw(b, N)) + ' is larger' : t(3 * M + '>' + N) + ', so ' + t(pw(B3, M)) + ' is larger') + ' (' + b + ' times as large).', ['Write ' + t(B3) + ' as a power of ' + t(b) + '.'], b + '^' + N + ' vs ' + B3 + '^' + M, true); } },
        { id: 'e20c', level: 'PRG', make: function (r) { var N = r.pick([100, 100, 40, 64, 76, 88, 44, 80]), up = (N - 1) % 3 === 0, M = up ? (N - 1) / 3 : (N + 1) / 3;
          var A = t(pw(2, N)), B = t(pw(4, N / 2)), C = t(pw(8, M)), D = t(pw(16, N / 4));
          return mc(r, 'Arrange ' + A + ', ' + B + ', ' + C + ' and ' + D + ' from least to greatest.', [
            { html: up ? C + ' < ' + A + ' = ' + B + ' = ' + D : A + ' = ' + B + ' = ' + D + ' < ' + C, right: true },
            { html: up ? A + ' = ' + B + ' = ' + D + ' < ' + C : C + ' < ' + A + ' = ' + B + ' = ' + D, why: 'Write ' + C + ' as a power of ' + t(2) + ': ' + t(pw(par(pw(2, 3)), M) + '=' + pw(2, 3 * M)) + '.' },
            { html: A + ' < ' + B + ' < ' + C + ' < ' + D, why: 'A bigger base doesn’t mean a bigger power when the exponent is smaller. Write them all as powers of ' + t(2) + '.' },
            { html: 'All four are equal.', why: 'Check ' + C + ': ' + t('3\\times ' + M + '=' + 3 * M) + ', not ' + t(N) + '.' }],
            'As powers of ' + t(2) + ': ' + t(pw(4, N / 2) + '=' + pw(2, N)) + ', ' + t(pw(8, M) + '=' + pw(2, 3 * M)) + ', ' + t(pw(16, N / 4) + '=' + pw(2, N)) + '. So ' + (up ? C + ' < ' + A + ' = ' + B + ' = ' + D : A + ' = ' + B + ' = ' + D + ' < ' + C) + (up ? ' — one smaller value, then a three-way tie.' : ' — a three-way tie, then one larger value.'), ['Write every number as a power of ' + t(2) + '.'], 'order 2^' + N + ',4,8,16'); } }] },
      { num: '21', stem: function (sh) { var v = sh.v; return 'Order ' + t(v.b.map(function (b, i) { return pw(b, v.e[i]); }).join(',\\ ')) + ' from least to greatest, without a calculator. The bases are different, so match the <b>exponents</b> instead: they share the common factor ' + t(v.g) + '.'; },
        shared: function (r) { return { v: r.pick(E21) }; },
        parts: [
          { id: 'e21a', level: 'PRG', make: function (r, s) { var v = s.v, L = ['a', 'b', 'c'];
            var fl = v.b.map(function (b, i) { return { name: t(pw(b, v.e[i])), label: t(pw(b, v.e[i]) + '=' + pw(par(pw(b, L[i])), v.g) + ',\\quad ' + L[i] + '=') }; });
            return P.fields('Write all three numbers as (something)' + t('^{' + v.g + '}') + ': find the missing exponents.', fl, v.b.map(function (b, i) { var w = v.e[i] / v.g; return K.number(w, function (x) { return x === v.e[i] - v.g ? { code: 'sub-wrong', hint: 'Power of a Power: the exponents multiply, so ' + t(L[i] + '\\times ' + v.g + '=' + v.e[i]) + '.' } : null; }); }),
              v.e.map(function (e) { return String(e / v.g); }), v.b.map(function (b, i) { return t(pw(b, v.e[i]) + '=' + pw(par(pw(b, v.e[i] / v.g)), v.g)); }).join(', '),
              'Use the Power of a Power Law in reverse: ' + v.b.map(function (b, i) { return t(pw(b, v.e[i]) + '=' + pw(par(pw(b, v.e[i] / v.g)), v.g)); }).join(', ') + '.', ['What times ' + t(v.g) + ' gives each exponent?'], 'common exponent ' + v.g); } },
          { id: 'e21b', level: 'PRG', make: function (r, s) { var v = s.v, items = v.b.map(function (b, i) { return { id: 'p' + i, tex: pw(b, v.e[i]), inner: Math.pow(b, v.e[i] / v.g), it: pw(b, v.e[i] / v.g) }; });
            var sorted = items.slice().sort(function (a, b) { return a.inner - b.inner; });
            return P.order(r, 'Evaluate the three new bases (' + t(items.map(function (x) { return x.it; }).join(',\\ ')) + ') and put the original numbers in order.', sorted, {},
              items.map(function (x) { return t(x.it + '=' + F(x.inner)); }).join(', ') + '. All three are raised to the same power ' + t(v.g) + ', so the order of the bases is the order of the numbers: ' + t(sorted.map(function (x) { return x.tex; }).join('<')) + '.',
              ['Work out each base, e.g. ' + t(items[0].it + '=' + F(items[0].inner)) + '.'], 'order ' + items.map(function (x) { return x.tex; }).join(','));
          } },
          { id: 'e21c', level: 'EMG', make: function (r, s) { var g = s.v.g;
            return mc(r, 'Why does comparing the bases of equal-exponent powers settle the order?', [
              { html: 'For positive numbers, raising to the same positive power keeps the order: if ' + t('0<B_1<B_2') + ' then ' + t('B_1^{' + g + '}<B_2^{' + g + '}') + '.', right: true },
              { html: 'Because the exponents are equal, all three numbers are equal.', why: 'Equal exponents but different bases give different values — e.g. ' + t('2^{2}\\neq 3^{2}') + '.' },
              { html: 'Because the larger exponent always gives the larger number.', why: 'Here the exponents are the same; the bases are what differ.' },
              { html: 'It doesn’t — you still need a calculator.', why: 'Multiplying bigger positive numbers together gives a bigger product.' }],
              'If ' + t('0<B_1<B_2') + ', then multiplying ' + t(g) + ' copies of each keeps the order: ' + t('B_1^{' + g + '}<B_2^{' + g + '}') + '. So once the exponents match, the larger base gives the larger power.', ['Compare ' + t('2^{2}') + ' and ' + t('3^{2}') + ' — does the order of the bases carry over?'], 'why compare bases');
          } }] },
      { num: '22', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e22', level: 'BEG', make: function (r) { var x = pickWhere(function () { return [r.pick([2, 2, 3]), r.int(2, 5), r.int(2, 4)]; }, function (x) { return Math.pow(x[0], x[2]) !== Math.pow(x[0], x[1]) && x[1] + x[2] !== x[1] * x[2] && x[0] !== Math.pow(x[0], x[1]); }), c = x[0], e = x[1], p = x[2], C = Math.pow(c, p), v = r.pick(['x', 'x', 'a', 'y']);
          return mc(r, 'Which of the following is equivalent to ' + t(pw(par(c + pw(v, e)), p)) + '?', [
            { html: t(c + pw(v, e * p)), why: 'The ' + t(c) + ' is inside the fence: raise it to the power ' + t(p) + ' too.' },
            { html: t(Math.pow(c, e) + pw(v, e * p)), why: 'Raise ' + t(c) + ' to the outer power ' + t(p) + ', not to ' + t(e) + '.' },
            { html: t(C + pw(v, e + p)), why: 'Power of a Power: <b>multiply</b> the exponents.' },
            { html: t(C + pw(v, e * p)), right: true }],
            t(pw(c, p) + pw(par(pw(v, e)), p) + '=' + C + pw(v, e * p)) + '.', ['Raise each factor inside the brackets to the power ' + t(p) + '.'], '(' + c + v + '^' + e + ')^' + p + ' MC', true); } }] },
      { num: '23', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e23', level: 'EMG', make: function (r) { var p = r.int(2, 5), n = r.int(3, 9), T = (p + 1) * n;
          return P.nr('If ' + t(pw(par(pw('x', 'n')), p) + '\\cdot ' + pw('x', 'n') + '=' + pw('x', T)) + ', where ' + t('n') + ' is a whole number, then ' + t('n') + ' is ________.', n, function (v) {
            if (v * p === T) return { code: 'no-one', hint: 'Don’t forget the extra factor ' + t(pw('x', 'n')) + ': the left side is ' + t(pw('x', p + 'n+n')) + '.' };
            if (v === T - p - 1) return { code: 'add-exp', hint: t(pw(par(pw('x', 'n')), p) + '=' + pw('x', p + 'n')) + ' — multiply.' };
            return null;
          }, t(pw(par(pw('x', 'n')), p) + '\\cdot ' + pw('x', 'n') + '=' + pw('x', p + 'n') + '\\cdot ' + pw('x', 'n') + '=' + pw('x', (p + 1) + 'n')) + '. So ' + t((p + 1) + 'n=' + T) + ' and ' + t('n=' + n) + '.', ['Simplify the left side to one power of ' + t('x') + '.'], '(x^n)^' + p + ' x^n = x^' + T);
        } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  function prodLaw(r, v, m, n, brackets, noDot, op) {
    var e = m + n, tex = brackets ? par(pw(v, m)) + par(pw(v, n)) : noDot ? pw(v, m) + pw(v, n) : pw(v, m) + (op || r.pick(['\\cdot ', '\\times '])) + pw(v, n);
    var rows = []; if (m * n !== e) rows.push([eIs(v, m * n), 'mult-exp', 'Product Law: when you multiply powers with the same base, <b>add</b> the exponents.']);
    if (m === n && m * m !== e) rows.push([eIs(v, m * m), 'mult-exp', 'This is a product, not a power of a power: add the exponents.']);
    return expoPart(t(tex), pw(v, e), rows, LAW.prod + ': ' + t(pw(v, m + '+' + n) + '=' + pw(v, e)) + '.', ['Write out the factors: how many ' + t(v) + 's are there altogether?'], v + '^' + m + ' * ' + v + '^' + n, { bad: m * n !== e ? [pw(v, m * n)] : [] });
  }
  function quotLaw(r, v, m, n, divSign, frac) {
    var e = m - n, tex = frac || !divSign ? dfr(pw(v, m), n === 1 ? v : pw(v, n)) : pw(v, m) + '\\div ' + (n === 1 ? v : pw(v, n)), rows = [];
    if (m % n === 0 && m / n !== e) rows.push([eIs(v, m / n), 'div-exp', 'Quotient Law: <b>subtract</b> the exponents — don’t divide them.']);
    rows.push([eIs(v, m + n), 'sub-wrong', 'Quotient Law: when you divide powers with the same base, <b>subtract</b> the exponents.']);
    if (n === 1) rows.unshift([eIs(v, m), 'no-one', t(v) + ' has an invisible exponent ' + t(1) + ': ' + t(v + '=' + pw(v, 1)) + '.']);
    return expoPart(t(tex), e === 1 ? v : pw(v, e), rows, (n === 1 ? t(v + '=' + pw(v, 1)) + ', so ' : '') + LAW.quot + ': ' + t(pw(v, m + '-' + n) + '=' + (e === 1 ? v : pw(v, e))) + '.', ['Cancel the common factors: how many ' + t(v) + 's are left on top?'], v + '^' + m + ' / ' + v + '^' + n, { bad: [pw(v, m + n)] });
  }
  function ppLaw(v, m, n) {
    var e = m * n, rows = []; if (m + n !== e) rows.push([eIs(v, m + n), 'add-exp', 'Power of a Power: the block ' + t(pw(v, m)) + ' is used ' + n + ' times, so <b>multiply</b> the exponents.']);
    if (Math.pow(m, n) !== e) rows.push([eIs(v, Math.pow(m, n)), 'add-exp', 'Multiply the exponents: ' + t(m + '\\times ' + n) + ', not ' + t(pw(m, n)) + '.']);
    return expoPart(t(pw(par(pw(v, m)), n)), pw(v, e), rows, LAW.pp + ': ' + t(pw(v, m + '\\times ' + n) + '=' + pw(v, e)) + '.', ['How many factors of ' + t(v) + ' are in ' + n + ' copies of ' + t(pw(v, m)) + '?'], '(' + v + '^' + m + ')^' + n, { bad: m + n !== e ? [pw(v, m + n)] : [] });
  }
  function symPart(qTex, tgt, alts, sol, text) {
    var vs = Object.keys(varsOf(px(tgt), varsOf(px(qTex), {}))).sort();
    return mathPart(t(qTex), symPow(tgt, alts), tgt, sol, ['Use the laws exactly as with number exponents; then simplify the exponent by collecting like terms.', 'Product: add. Quotient: subtract (the whole exponent). Power of a power: multiply (the whole exponent).'], text, vs,
      { bad: alts.map(function (a) { return a[0]; }).filter(function (a) { return !same(px(a), px(tgt)); }) });
  }
  function pairPart(e1, a1, e2, a2, c, note, h2) {
    var fl = [{ name: 'First', label: t(e1 + '='), mode: 'math', keys: 'expo', vars: Object.keys(varsOf(px(a2), {})) }, { name: 'Second', label: t(e2 + '='), mode: 'math', keys: 'expo', vars: Object.keys(varsOf(px(a2), {})) }];
    var c1 = K.expo(a1, {}), c2 = K.expo(a2, { diag: dg([[cIs(c), 'coef-not-raised', 'Here the ' + t(c) + ' is inside the fence, so it is raised to the power too.']]) });
    return P.fields('Simplify each.', fl, [function (resp) { var a = K.read(resp); if (!a.res && same(a.ast, px(a2)) && !same(px(a1), px(a2))) return wrong('fence', 'That’s the value of the <b>second</b> expression. In the first one, what is inside the fence?'); return c1(resp); },
      function (resp) { var a = K.read(resp); if (!a.res && same(a.ast, px(a1)) && !same(px(a1), px(a2))) return wrong(h2 ? 'fence' : 'coef-not-raised', h2 || 'Here the ' + t(c) + ' is inside the fence, so it is raised to the power too.'); return c2(resp); }],
      [a1, a2], t(a1) + ' and ' + t(a2), t(e1 + '=' + a1) + '; ' + t(e2 + '=' + a2) + '. ' + note, ['Only what is inside the brackets is raised to the power.'], e1.replace(/\\left|\\right/g, '') + ' vs ' + e2.replace(/\\left|\\right/g, ''));
  }
  function twoUnk(c, v, U, W, m, n, C, E) { // (c v^U)^W = C v^E ; U=m, W=n
    var fl = [{ name: U, label: t(U + '=') }, { name: W, label: t(W + '=') }];
    return P.fields(t(pw(par(c + pw(v, U)), W) + '=' + C + pw(v, E)), fl,
      [K.number(m, function (x) { return x === n ? { code: 'swapped', hint: 'Which unknown does the coefficient pin down? ' + t(pw(c, W) + '=' + C) + '.' } : x === E - n ? { code: 'add-exp', hint: 'Power of a Power: ' + t(U + '\\times ' + W + '=' + E) + '.' } : null; }),
        K.number(n, function (x) { return x === m ? { code: 'swapped', hint: 'Use the coefficient: ' + t(pw(c, W) + '=' + C) + '.' } : x === C / c ? { code: 'times-exp', hint: t(pw(c, W)) + ' means ' + t(c) + ' multiplied by itself ' + t(W) + ' times.' } : null; })],
      [String(m), String(n)], t(U + '=' + m) + ', ' + t(W + '=' + n),
      t(pw(par(c + pw(v, U)), W) + '=' + pw(c, W) + pw(v, U + W)) + '. Coefficient: ' + t(pw(c, W) + '=' + C + '=' + pw(c, n)) + ', so ' + t(W + '=' + n) + '. Exponent: ' + t(U + '\\times ' + n + '=' + E) + ', so ' + t(U + '=' + m) + '. The coefficient pinned ' + t(W) + '; the exponent of ' + t(v) + ' then pinned ' + t(U) + '.',
      ['Expand the left side: ' + t(pw(par(c + pw(v, U)), W) + '=' + pw(c, W) + pw(v, U + W)) + '. Match the coefficients first.'], '(' + c + v + '^' + U + ')^' + W + '=' + C + v + '^' + E);
  }
  function q17eq(k) { return 'a^{m}\\cdot a^{n}' + (k ? '\\cdot a^{' + k + '}' : '') + '=\\left(a^{m}\\right)^{n}'; }
  function q17pairs(k) {
    var all = []; for (var m = 0; m <= k + 3; m++) for (var n = 0; n <= k + 3; n++) if (m + n + k === m * n) all.push([m, n]);
    var keyP = all.filter(function (p) { return p[0] <= p[1]; }).slice(0, 2), L = 'm+n' + (k ? '+' + k : '');
    return { prompt: 'Find two different pairs ' + t('(m,n)') + '.', input: { type: 'pairs', start: 2 }, key: keyP.map(function (p) { return [String(p[0]), String(p[1])]; }),
      answer: keyP.map(function (p) { return t('(' + p[0] + ',' + p[1] + ')'); }).join(' and ') + (all.length > 2 ? ' (or ' + all.filter(function (p) { return keyP.every(function (q) { return q[0] !== p[0] || q[1] !== p[1]; }); }).map(function (p) { return t('(' + p[0] + ',' + p[1] + ')'); }).join(', ') + ')' : ''),
      text: 'pairs with ' + L + '=mn',
      check: function (resp) {
        if (!resp || !resp.length) return form('empty', 'Write your first pair in the boxes.');
        var got = [];
        for (var i = 0; i < resp.length; i++) {
          if (resp[i][0] === '' || resp[i][1] === '') return form('blank', 'Each pair needs two numbers.');
          var a = Number(String(resp[i][0]).replace(/\s/g, '')), b = Number(String(resp[i][1]).replace(/\s/g, ''));
          if (!isFinite(a) || !isFinite(b)) return form('blank', 'Each pair needs two whole numbers.');
          if (a < 0 || b < 0 || a % 1 || b % 1) return wrong('not-whole', t('m') + ' and ' + t('n') + ' must be whole numbers: ' + t('0, 1, 2, \\ldots'));
          got.push([a, b]);
        }
        var keys = got.map(function (p) { return p.join(','); });
        for (i = 0; i < keys.length; i++) if (keys.indexOf(keys[i]) !== i) return form('dup', 'You listed ' + t('(' + keys[i] + ')') + ' twice — the pairs must be different.');
        for (i = 0; i < got.length; i++) { var p = got[i], Lv = p[0] + p[1] + k, Rv = p[0] * p[1];
          if (Lv !== Rv) return wrong('pair-fails', 'Test ' + t('(' + p[0] + ',' + p[1] + ')') + ': the left side is ' + t(pw('a', L) + '=' + pw('a', Lv)) + ' but the right side is ' + t(pw('a', 'mn') + '=' + pw('a', Rv)) + '. They don’t match.'); }
        if (got.length < 2) return wrong('one-pair', 'That pair works! The question asks for <b>two</b> different pairs.' + (k === 0 ? ' Don’t forget that ' + t('0') + ' is a whole number.' : ' Try a different value of ' + t('m') + '.'));
        return ok();
      },
      solution: 'Product Law on the left: ' + t(pw('a', L)) + '. Power of a Power Law on the right: ' + t(pw('a', 'mn')) + '. The two sides are equal when ' + t(L + '=mn') + '. ' + all.map(function (p) { return t('(' + p[0] + ',' + p[1] + ')') + ': ' + t(p[0] + '+' + p[1] + (k ? '+' + k : '') + '=' + (p[0] + p[1] + k) + '=' + p[0] + '\\times ' + p[1]) + ' ✓'; }).join('; ') + '.' + (k === 0 ? ' (These are the only whole-number pairs: e.g. ' + t('m=3') + ' needs ' + t('3+n=3n') + ', so ' + t('n=1.5') + '.)' : ''),
      hints: ['Simplify both sides: the left becomes ' + t(pw('a', L)) + ' and the right becomes ' + t(pw('a', 'mn')) + '. When are the exponents equal?', 'Try small values of ' + t('m') + ' (' + t('0, 1, 2, 3, \\ldots') + ') and solve for ' + t('n') + '.'],
      good: [all.slice(-2).map(function (p) { return [String(p[0]), String(p[1])]; })], bad: [[['1', '1'], ['2', '2']], [['3', '3'], ['3', '3']]] };
  }
  var E21 = [{ b: [2, 3, 6], e: [30, 20, 12], g: 2 }, { b: [2, 3, 6], e: [30, 20, 12], g: 2 }, { b: [2, 3, 5], e: [20, 12, 8], g: 4 }, { b: [2, 3, 5], e: [24, 16, 8], g: 8 },
    { b: [2, 3, 7], e: [40, 30, 10], g: 10 }, { b: [2, 5, 10], e: [30, 12, 9], g: 3 }, { b: [3, 5, 7], e: [20, 14, 10], g: 2 }];
})(window);
