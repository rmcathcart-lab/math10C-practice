/* Math 10C · Unit 1 · Lesson 6B — Entire and Mixed Radicals: Index 3 and Higher (AN2)
 * Assignment questions 1–11 (u1_L06B.tex, Parts A–B) and the index-3-and-higher / variable items of the Lesson 6
 * Extra Practice (u1_EP06.tex: 3(c), 6–10, 12, 13(a)(c), 14, 15–16, 17(d), 20(c); the square-root items are in 6A).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS.
 * Variable questions use the letters on the keypad (x, y, a, b) so they can be typed on a phone or tablet. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = K.P;

  HW.addCodes({
    'neg-root': 'Lost the sign of an odd root of a negative', 'coef-lost': 'Forgot to multiply by the coefficient in front',
    'wrong-power': 'Took out a perfect square (or wrong power) instead of the index’s power', 'even-neg': 'Put a negative under an even root',
    'den-power': 'Raised only part of a fraction coefficient', 'rad-decimal': 'Decimal under the radical', 'var-no-power': 'Didn’t multiply the variable exponent by the index',
    'outside-lost': 'Dropped the factor in front of the radical', 'dropped-rem': 'Dropped the leftover under the radical', 'kept-inside': 'Took a factor out but left it inside too',
    'added-radicands': 'Added the radicands', 'not-smallest': 'Works, but not the smallest', 'whole-number': 'Gave a perfect power (no radical left)', 'square-thinking': 'Used squares instead of cubes'
  });

  /* ---------- small helpers ---------- */
  function Rq(c) { return typeof c === 'number' ? [c, 1] : c; }
  function rq(c) { c = Rq(c); return c[0] / c[1]; }
  function pw(a, n) { return Math.pow(a, n); }
  function rt(n, inner) { return ex.texRoot(n, inner); }
  var POW = { 2: 'square', 3: 'cube', 4: 'fourth power', 5: 'fifth power', 6: 'sixth power' };
  var ROOT = { 2: 'square root', 3: 'cube root', 4: 'fourth root', 5: 'fifth root', 6: 'sixth root' };
  var LIST = { 2: '4,\\ 9,\\ 16,\\ 25,\\ 36,\\ 49,\\ 64,\\ 81,\\ 100,\\ 144', 3: '8,\\ 27,\\ 64,\\ 125,\\ 216,\\ 343,\\ 512,\\ 729,\\ 1\\,000,\\ 1\\,728',
    4: '16,\\ 81,\\ 256,\\ 625,\\ 1\\,296', 5: '32,\\ 243,\\ 1\\,024,\\ 3\\,125' };
  function nth(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th'; }
  /* coefficient in front of a radical: '' for 1, '-' for -1, a fraction as \frac{p}{q} */
  function coefTex(k) { k = Rq(k); if (k[1] === 1) return k[0] === 1 ? '' : k[0] === -1 ? '-' : String(k[0]); return (k[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(k[0]) + '}{' + k[1] + '}'; }
  function given(c, n, R) { return coefTex(c) + rt(n, F(R)); }
  function mixTex(k, n, m) { return m === 1 ? ex.texRat(Rq(k)) : coefTex(k) + rt(n, F(m)); }
  function ratTex(r) { return ex.texRat(Rq(r)); }
  function valTex(x) { return Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100); }
  /* a radicand f^n·t whose largest perfect nth-power factor is exactly f^n (t > 1) */
  function pickR(r, n, fs, ts, dflt, lo, hi) {
    for (var i = 0; i < 400; i++) {
      var f = r.pick(fs), tt = r.pick(ts), R = pw(f, n) * tt;
      if (tt > 1 && ex.nthFactor(R, n) === f && (!lo || R >= lo) && (!hi || R <= hi)) return R;
    }
    return dflt;
  }
  function hintsFor(n, A) {
    return ['Find the largest perfect ' + POW[n] + ' that divides ' + t(F(A)) + '. Perfect ' + POW[n] + 's: ' + t(LIST[n] + ',\\ \\ldots'),
      'Write ' + t(F(A)) + ' as (perfect ' + POW[n] + ') ' + t('\\times') + ' (what’s left). The ' + ROOT[n] + ' of the perfect ' + POW[n] + ' comes out in front.'];
  }

  /* ---------- extra diagnoses for "convert to a mixed radical" ----------
   * question c·ⁿ√R, answer k·ⁿ√m with |R| = f^n·m. Runs before K.radical's own checks. */
  function mixDiag(c, n, R, f, m, k) {
    var A = Math.abs(R), cA = Math.abs(rq(c)), V = rq(k) * pw(m, 1 / n), hasC = !(c[0] === 1 && c[1] === 1);
    return function (val, r) {
      if (R < 0 && ex.eq(val, -V)) return { code: 'neg-root', hint: 'Watch the sign: an odd root of a negative number is negative, e.g. ' + t(rt(n, '-' + pw(f, n)) + '=-' + f) + '.' };
      if (hasC && ex.eq(val, V / rq(c))) return { code: 'coef-lost', hint: 'You simplified ' + t(rt(n, F(R))) + ' correctly — now multiply by the ' + t(ratTex(c)) + ' in front.' };
      if (hasC && ex.eq(val, -V / rq(c))) return { code: 'coef-lost', hint: 'Simplify ' + t(rt(n, F(R))) + ' first, then multiply by the ' + t(ratTex(c)) + ' in front (watch the sign).' };
      if (!r || r.n !== n) return null;
      var g = Math.abs(rq(r.k)) / cA;
      if (r.m === m && f > 1 && ex.eq(g, pw(f, n))) return { code: 'coef-power', hint: 'You found the right factor, but ' + t(F(pw(f, n))) + ' comes out of the ' + ROOT[n] + ' as ' + t(rt(n, F(pw(f, n))) + '=' + f) + ', not as ' + t(F(pw(f, n))) + '.' };
      if (Number.isInteger(Math.round(g * 1e9) / 1e9) && g > 1) {
        g = Math.round(g);
        for (var j = 2; j <= 5; j++) if (j !== n && pw(g, j) * r.m === A)
          return { code: 'wrong-power', hint: t(F(pw(g, j)) + '=' + g + '^{' + j + '}') + ' is a perfect ' + POW[j] + ', but this is a ' + ROOT[n] + ': ' + t(rt(n, F(pw(g, j))) + '\\neq ' + g) + '. Look for a perfect <b>' + POW[n] + '</b> factor instead.' };
        if (g * r.m === A) return { code: 'divided', hint: 'Check: ' + t(g + '\\times ' + F(r.m) + '=' + F(A)) + ', but a number in front of a ' + ROOT[n] + ' stands for its ' + POW[n] + ' inside. Look for a perfect ' + POW[n] + ' factor of ' + t(F(A)) + '.' };
      }
      return null;
    };
  }
  /* c·ⁿ√R → simplest mixed radical */
  function mixPart(c, n, R, o) {
    o = o || {}; c = Rq(c);
    var A = Math.abs(R), f = ex.nthFactor(A, n), m = A / pw(f, n), sg = R < 0 ? -1 : 1, k = ex.norm(c[0] * sg * f, c[1]);
    var hasC = !(c[0] === 1 && c[1] === 1), inner = mixTex([sg * f, 1], n, m), key = mixTex(k, n, m);
    var sol = 'The largest perfect ' + POW[n] + ' that divides ' + t(F(A)) + ' is ' + t(F(pw(f, n)) + '=' + f + '^{' + n + '}') + ', because ' + t(F(A) + '=' + F(pw(f, n)) + '\\times ' + F(m)) + '.<br>';
    if (R < 0) sol += 'The index is odd, so the negative sign comes out of the root: ' + t(rt(n, F(R)) + '=-' + rt(n, F(A))) + '.<br>';
    sol += t(rt(n, F(R)) + '=' + (sg < 0 ? '-' : '') + rt(n, F(pw(f, n)) + '\\times ' + F(m)) + '=' + (sg < 0 ? '-' : '') + rt(n, F(pw(f, n))) + '\\times ' + rt(n, F(m)) + '=' + inner) + '.';
    if (hasC) sol += '<br>Multiply by the coefficient: ' + t(ratTex(c) + '\\times ' + (sg < 0 ? '(-' + f + ')' : f) + '=' + ratTex(k)) + ', so ' + t(given(c, n, R) + '=' + key) + '.';
    var good = [], bad = [];
    if (k[1] > 1) good.push(ex.texRadical(k, n, m));
    if (n % 2 && k[0] < 0) good.push(mixTex([-k[0], k[1]], n, 1).replace(/^1$/, '') + rt(n, '-' + m));
    if (f > 1) bad.push(coefTex(ex.norm(c[0] * sg * pw(f, n), c[1])) + rt(n, F(m)));
    bad.push(mixTex(k, 2, m === 1 ? 2 : m));
    var p = P.math(o.prompt || t(given(c, n, R)), K.radical({ k: k, n: n, m: m }, 'mixed', { diag: mixDiag(c, n, R, f, m, k) }), key, sol, o.hints || hintsFor(n, A), o.text || 'mixed: ' + given(c, n, R), { keys: 'radical' });
    p.good = good; p.bad = bad; p.spec = { k: k, n: n, m: m, f: f };
    return p;
  }

  /* ---------- "convert to an entire radical" (local checker: K.radical's entire mode rejects −ⁿ√M for an even index,
   * and doesn't handle a fraction under the root) ---------- */
  function entireInfo(c, n, m) {
    c = Rq(c);
    var neg = c[0] < 0, A = ex.norm(pw(Math.abs(c[0]), n) * m, pw(c[1], n));
    var radT = ratTex(A), key = neg ? (n % 2 ? rt(n, '-' + (A[1] === 1 ? F(A[0]) : radT)) : '-' + rt(n, A[1] === 1 ? F(A[0]) : radT)) : rt(n, A[1] === 1 ? F(A[0]) : radT);
    return { c: c, n: n, m: m, neg: neg, A: A, key: key, radT: A[1] === 1 ? F(A[0]) : radT, V: (neg ? -1 : 1) * pw(A[0] / A[1], 1 / n) };
  }
  function entireCheck(c, n, m) {
    var I = entireInfo(c, n, m), cA = Math.abs(rq(I.c)), V = I.V, pAbs = Math.abs(I.c[0]), q = I.c[1];
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var node = a.ast; while (node.t === 'neg' || node.t === 'paren') node = node.a;
      var isRoot = node.t === 'root', idx = isRoot ? ex.rat(node.n) : null, rad = isRoot ? ex.rat(node.a) : null, ni = idx && idx[1] === 1 ? idx[0] : null;
      if (ex.eq(a.val, V)) {
        if (!isRoot || !rad) return form('not-entire', 'Right value, but an entire radical has nothing in front of the root. Move ' + t(ratTex(I.c[0] < 0 && n % 2 === 0 ? [pAbs, q] : I.c)) + ' inside: raise it to the power ' + t(n) + ' first.');
        if (ni !== n) return form('index', 'Right value, but keep the index ' + t(n) + ' (a ' + ROOT[n] + ').');
        if (ex.shape(node.a).decimals) return form('rad-decimal', 'Right value — write the number under the root as a whole number or a fraction.');
        var pf = ex.plainFraction(node.a);
        if (!pf) return form('simplify', 'Right value — now multiply out what’s under the root so it is a single number.');
        if (pf[1] !== 1 && ex.gcd(pf[0], pf[1]) > 1) return form('lowest', 'Right value — reduce the fraction under the root to lowest terms.');
        return ok();
      }
      if (isRoot && ni && ni % 2 === 0 && rad && rad[0] < 0) return wrong('even-neg', 'With an even index the radicand can’t be negative: ' + t(rt(ni, '-' + Math.abs(rad[0]))) + ' is not a real number. A negative coefficient has to stay <b>outside</b> the root.');
      if (isRoot && ni === n && rad) {
        var rv = Math.abs(rad[0] / rad[1]);
        if (ex.eq(Math.abs(a.val), Math.abs(V))) return wrong('sign', I.neg ? (n % 2 ? 'Check the sign. The index is odd, so the negative goes inside with the coefficient: ' + t('(' + ratTex(I.c) + ')^{' + n + '}') + ' is negative' : 'Check the sign. The index is even, so the negative must stay outside: ' + t('-' + rt(n, '\\ldots'))) + '.' : 'Check the sign of your answer.');
        if (cA !== 1 && ex.eq(rv, cA * m)) return wrong('no-power', 'Before ' + t(ratTex([pAbs, q])) + ' moves inside, raise it to the power ' + t(n) + ': ' + t(ratTex([pAbs, q]) + '=' + rt(n, ratTex(ex.norm(pw(pAbs, n), pw(q, n))))) + '.');
        if (ex.eq(rv, pw(cA, n) + m)) return wrong('added', 'Multiply ' + t(ratTex(ex.norm(pw(pAbs, n), pw(q, n)))) + ' by ' + t(m) + ' — don’t add them.');
        if (q > 1 && (ex.eq(rv, pw(pAbs, n) * m / q) || ex.eq(rv, pAbs * m / pw(q, n)))) return wrong('den-power', 'Raise the <b>whole</b> fraction to the power ' + t(n) + ': ' + t('\\left(\\frac{' + pAbs + '}{' + q + '}\\right)^{' + n + '}=\\frac{' + pw(pAbs, n) + '}{' + pw(q, n) + '}') + '.');
        for (var j = 2; j <= 5; j++) if (j !== n && cA > 1 && ex.eq(rv, pw(cA, j) * m)) return wrong('wrong-power', 'The index is ' + t(n) + ', so the coefficient is raised to the power ' + t(n) + ' (not ' + t(j) + ') when it moves inside.');
      }
      if (isRoot && ni && ni !== n) return wrong('index', 'Keep the index: this is a ' + ROOT[n] + '.');
      return wrong('value', null);
    };
  }
  function entirePart(c, n, m, o) {
    o = o || {};
    var I = entireInfo(c, n, m), pAbs = Math.abs(I.c[0]), q = I.c[1], cAt = ratTex([pAbs, q]), powT = ratTex(ex.norm(pw(pAbs, n), pw(q, n)));
    var sol = '';
    if (I.neg && n % 2 === 0) sol += 'The index is even, so the negative sign must stay <b>outside</b> (an even root of a negative isn’t real). Move only ' + t(cAt) + ' inside.<br>' + t(cAt + '=' + rt(n, powT)) + ', so ' + t(given([pAbs, q], n, m) + '=' + rt(n, powT + '\\times ' + m) + '=' + rt(n, I.radT)) + '.<br>So ' + t(given(I.c, n, m) + '=' + I.key) + '.';
    else if (I.neg) sol += 'The index is odd, so the negative sign can go inside: ' + t('\\left(' + ratTex(I.c) + '\\right)^{' + n + '}=-' + powT) + '.<br>' + t(given(I.c, n, m) + '=' + rt(n, '-' + powT + '\\times ' + m) + '=' + I.key) + ' (or ' + t('-' + rt(n, I.radT)) + ').';
    else sol += 'Raise the coefficient to the power ' + t(n) + ': ' + t('\\left(' + cAt + '\\right)^{' + n + '}=' + powT) + '.<br>' + t(given(I.c, n, m) + '=' + rt(n, powT + '\\times ' + m) + '=' + I.key) + '.';
    var good = []; if (I.neg && n % 2) good.push('-' + rt(n, I.radT));
    var bad = [given(I.c, n, m), rt(n, String(Math.max(2, Math.round(pAbs * m / q))))];
    if (I.neg && n % 2 === 0) bad.push(rt(n, '-' + I.radT));
    var p = P.math(o.prompt || t(given(I.c, n, m)), entireCheck(I.c, n, m), I.key, sol,
      o.hints || ['Write the coefficient as a ' + ROOT[n] + ': raise it to the power ' + t(n) + '. Then multiply the two radicands.', n % 2 === 0 ? 'With an even index, a negative sign stays in front of the root.' : 'With an odd index, a negative sign can move inside the root.'],
      o.text || 'entire: ' + given(I.c, n, m), { keys: 'radical' });
    p.good = good; p.bad = bad; p.info = I;
    return p;
  }

  /* ---------- radicals with variables. A monomial is (k, {x: e, …}) ---------- */
  function vtex(k, v) { return ex.texMono(Rq(k), v || {}).replace(/^(-?)(\d{4,})/, function (m0, sg, d) { return sg + F(Number(d)); }); }
  function vout(k, v) { var s = vtex(k, v); return s === '1' ? '' : s === '-1' ? '-' : s; }
  function sameV(a, b) { var ka = Object.keys(a).filter(function (x) { return a[x]; }), kb = Object.keys(b).filter(function (x) { return b[x]; }); return ka.length === kb.length && ka.every(function (x) { return a[x] === b[x]; }); }
  function sameK(a, b) { return a[0] * b[1] === a[1] * b[0]; }
  function vp(x, e) { return e === 1 ? x : x + '^{' + e + '}'; }
  function addV(a, b, mult) { var o = {}; Object.keys(a).forEach(function (x) { o[x] = a[x]; }); Object.keys(b).forEach(function (x) { o[x] = (o[x] || 0) + (mult || 1) * b[x]; }); return o; }
  /* outside·ⁿ√(inside) → entire radical */
  function varEntire(oK, oV, n, iK, iV, o) {
    o = o || {}; oK = Rq(oK);
    var neg = oK[0] < 0, ak = [Math.abs(oK[0]), oK[1]], pk = ex.norm(pw(ak[0], n) * iK, pw(ak[1], n));
    var rv = addV(iV, oV, n), radIn = vtex(pk, rv), target = neg ? (n % 2 ? rt(n, '-' + radIn) : '-' + rt(n, radIn)) : rt(n, radIn);
    var prompt = vout(oK, oV) + rt(n, vtex(iK, iV));
    var outPow = vtex(ex.norm((neg && n % 2 ? -1 : 1) * pw(ak[0], n), pw(ak[1], n)), addV({}, oV, n));
    var sol = (neg && n % 2 === 0 ? 'Even index: the negative stays outside. ' : '') + 'Raise everything in front to the power ' + t(n) + ': ' +
      t('\\left(' + vout(neg && n % 2 === 0 ? ak : oK, oV) + '\\right)^{' + n + '}=' + outPow) + '.<br>Multiply by the radicand: ' + t(outPow + '\\times ' + vtex(iK, iV) + '=' + (neg && n % 2 ? '-' : '') + radIn) + '.<br>So ' + t(prompt + '=' + target) + (neg && n % 2 ? ' (or ' + t('-' + rt(n, radIn)) + ')' : '') + '.';
    var chk = K.varRadical(target, 'entire', { diag: function (r) {
      if (!r || r.n !== n || Object.keys(r.vars).length || Math.abs(r.k[0]) !== 1 || r.k[1] !== 1) return null;
      if (neg && r.k[0] > 0 && r.rad.m === pk[0] && sameV(r.rad.vars, rv)) return { code: 'sign', hint: n % 2 ? 'Check the sign: ' + t('(' + ratTex(oK) + ')^{' + n + '}') + ' is negative, so the radicand is negative (or put the ' + t('-') + ' in front of the root).' : 'Check the sign: with an even index the ' + t('-') + ' stays in front of the root.' };
      if (!(ak[0] === 1 && ak[1] === 1) && ex.eq(r.rad.m, rq(ak) * iK)) return { code: 'no-power', hint: 'Raise the coefficient to the power ' + t(n) + ' before it moves inside: ' + t((ak[1] === 1 ? ak[0] : '\\left(' + ratTex(ak) + '\\right)') + '^{' + n + '}=' + ratTex(ex.norm(pw(ak[0], n), pw(ak[1], n)))) + '.' };
      var vs = Object.keys(oV).filter(function (x) { return (r.rad.vars[x] || 0) === (iV[x] || 0) + oV[x]; });
      if (vs.length) { var x = vs[0]; return { code: 'var-no-power', hint: 'When ' + t(vp(x, oV[x])) + ' moves inside a ' + ROOT[n] + ' it becomes ' + t('\\left(' + vp(x, oV[x]) + '\\right)^{' + n + '}=' + vp(x, n * oV[x])) + ' — multiply its exponent by ' + t(n) + '.' }; }
      return null;
    } });
    var p = P.math(t(prompt), chk, target, sol, o.hints || ['Raise the coefficient <b>and</b> each variable in front to the power ' + t(n) + ' (multiply each exponent by ' + t(n) + ').', 'Then multiply by what is already under the root — add exponents of the same variable.'], o.text || 'entire (variables): ' + prompt, { keys: 'var' });
    p.good = neg && n % 2 ? ['-' + rt(n, radIn)] : []; p.bad = [prompt, rt(n, vtex([ak[0] * iK, 1], addV(iV, oV)))];
    return p;
  }
  /* outside·ⁿ√(inside) → simplest mixed radical */
  function varMixed(oK, oV, n, iK, iV, o) {
    o = o || {}; oK = Rq(oK);
    var s = ex.nthFactor(iK, n), tt = iK / pw(s, n), q = {}, rem = {}, big = {};
    Object.keys(iV).forEach(function (x) { var Q = Math.floor(iV[x] / n), Rm = iV[x] % n; if (Q) { q[x] = Q; big[x] = Q * n; } if (Rm) rem[x] = Rm; });
    var ansK = ex.norm(oK[0] * s, oK[1]), ansOut = addV(oV, q), inTex = vtex([tt, 1], rem), target = vout(ansK, ansOut) + rt(n, inTex);
    var hasOut = !(oK[0] === 1 && oK[1] === 1) || Object.keys(oV).length;
    var prompt = vout(oK, oV) + rt(n, vtex(iK, iV)), perfT = vtex([pw(s, n), 1], big), innerOut = vout([s, 1], q);
    var parts = [];
    if (s > 1) parts.push(t(F(iK) + '=' + F(pw(s, n)) + '\\times ' + tt));
    Object.keys(iV).sort().forEach(function (x) { if (iV[x] >= n && iV[x] % n) parts.push(t(vp(x, iV[x]) + '=' + vp(x, big[x]) + '\\times ' + vp(x, rem[x]))); else if (iV[x] >= n) parts.push(t(vp(x, iV[x])) + ' is a perfect ' + POW[n]); });
    var sol = 'Split each factor into a perfect ' + POW[n] + ' and what’s left: ' + parts.join(', ') + '.<br>' +
      t(rt(n, vtex(iK, iV)) + '=' + rt(n, perfT + '\\times ' + inTex) + '=' + innerOut + rt(n, inTex)) + ' (divide each exponent by ' + t(n) + ': the quotient comes out, the remainder stays under).';
    if (hasOut) sol += '<br>Multiply by the factor in front: ' + t(vout(oK, oV) + '\\times ' + vtex([s, 1], q) + '=' + vtex(ansK, ansOut)) + '.';
    sol += '<br>So ' + t(prompt + '=' + target) + '.';
    var chk = fixWords(n, K.varRadical(target, 'mixed', { diag: function (r) {
      if (!r) return null;
      var radOk = r.rad.m === tt && sameV(r.rad.vars, rem);
      if (r.n === 1 && sameK(r.k, ansK) && sameV(r.vars, ansOut)) return { code: 'dropped-rem', hint: 'Don’t lose the leftover: ' + t(inTex) + ' still has to stay under the ' + ROOT[n] + '.' };
      if (r.n !== n) return null;
      if (hasOut && radOk && sameK(r.k, [s, 1]) && sameV(r.vars, q)) return { code: 'outside-lost', hint: 'You simplified ' + t(rt(n, vtex(iK, iV))) + ' correctly — now multiply by the ' + t(vout(oK, oV)) + ' in front.' };
      if (s > 1 && radOk && sameV(r.vars, ansOut) && ex.eq(Math.abs(rq(r.k)), Math.abs(rq(oK)) * pw(s, n))) return { code: 'coef-power', hint: t(F(pw(s, n))) + ' comes out of the ' + ROOT[n] + ' as ' + t(rt(n, F(pw(s, n))) + '=' + s) + ', not as ' + t(F(pw(s, n))) + '.' };
      var kept = Object.keys(q).filter(function (x) { return (r.rad.vars[x] || 0) === iV[x] && (r.vars[x] || 0) === ansOut[x]; });
      if (kept.length) { var x = kept[0]; return { code: 'kept-inside', hint: 'When ' + t(vp(x, big[x])) + ' comes out as ' + t(vp(x, q[x])) + ', it leaves the radical: only ' + (rem[x] ? t(vp(x, rem[x])) : 'nothing') + ' of ' + t(vp(x, iV[x])) + ' stays inside.' }; }
      return null;
    } }));
    var p = P.math(t(prompt), chk, target, sol, o.hints || ['Divide each exponent by the index ' + t(n) + '. The quotient is the exponent that comes out; the remainder stays under the root.', s > 1 ? 'Take the largest perfect ' + POW[n] + ' out of ' + t(F(iK)) + ' too.' : 'Then multiply by anything already in front of the radical.'], o.text || 'mixed (variables): ' + prompt, { keys: 'var' });
    p.bad = [vout(ansK, ansOut)]; if (Object.keys(q).length) p.bad.push(vout(ansK, addV(ansOut, q)) + rt(n, inTex)); if (Object.keys(rem).length || tt > 1) p.bad.push(prompt);
    return p;
  }
  /* K.varRadical's hints say "cube" for every index above 2; use the right word for index 4 and 5 */
  function fixWords(n, chk) {
    if (n < 4) return chk;
    return function (resp) { var res = chk(resp); if (res && res.hint) res.hint = res.hint.replace(/perfect cube/g, 'perfect ' + POW[n]).replace(/a cube root/g, 'a ' + ROOT[n]); return res; };
  }
  function letters(r, k) { return r.pick([['x', 'y', 'a'], ['a', 'b', 'x'], ['x', 'y', 'b'], ['a', 'b', 'y']]).slice(0, k); }
  function obj(keys, vals) { var o = {}; keys.forEach(function (x, i) { if (vals[i]) o[x] = vals[i]; }); return o; }

  /* ---------- ordering helpers ---------- */
  function entireOf(c, n, m) { var I = entireInfo(c, n, m); return rt(n, I.radT); }

  HW.defineLesson({
    id: 'u1l6b', unit: 1, num: '6B', title: 'Entire and Mixed Radicals: Index 3 and Higher', outcome: 'AN2',
    blurb: 'The Lesson 6A idea for cube roots and beyond: pull out the largest perfect cube (or 4th or 5th power), push a coefficient back inside, watch the sign — and, as an extension, radicals with variables.',
    questions: [
      { num: '1', section: 'Part A — Radicals With Index 3 and Higher', stem: 'Convert the following radicals to mixed radicals in simplest form.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { return mixPart(1, 3, pickR(r, 3, [2, 3], [2, 3, 4, 5, 6, 7, 9, 10], 135)); } },
        { id: '1b', level: 'BEG', make: function (r) { return mixPart(1, 3, pickR(r, 3, [4, 5], [2, 3, 5, 6, 7], 375)); } },
        { id: '1c', level: 'EMG', make: function (r) { return mixPart(1, 3, pickR(r, 3, [6, 7, 9, 10], [2, 3, 4, 5], 4000)); } },
        { id: '1d', level: 'PRG', make: function (r) { return mixPart(r.pick([2, 3, 4, 5]), 3, -pickR(r, 3, [2, 3, 4, 5], [2, 3, 5, 6], 192)); } },
        { id: '1e', level: 'PRG', make: function (r) {
          for (var i = 0; i < 100; i++) { var c = r.pick([[4, 9], [2, 9], [5, 9], [2, 7], [3, 7], [4, 7], [5, 7], [2, 3]]), f = r.pick([2, 3, 4, 5]), k = ex.norm(c[0] * f, c[1]); if (k[1] > 1) return mixPart(c, 3, pickR(r, 3, [f], [2, 3, 4], 250)); }
          return mixPart([4, 9], 3, 250);
        } },
        { id: '1f', level: 'EMG', make: function (r) { return mixPart(r.pick([2, 3, 4, 5]), 4, pickR(r, 4, [2, 3, 4], [2, 3, 5], 512)); } },
        { id: '1g', level: 'PRG', make: function (r) { return mixPart(1, 5, -pickR(r, 5, [2, 3], [3, 5, 6, 7, 10], 320)); } },
        { id: '1h', level: 'PRG', make: function (r) { return mixPart(-r.pick([2, 3, 4]), 3, pickR(r, 3, [5, 6, 7], [2, 3, 4, 5], 1029)); } }] },
      { num: '2', stem: 'Convert the following mixed radicals to entire radicals.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { return entirePart(r.pick([2, 3]), 4, r.pick([2, 3, 5, 6, 7])); } },
        { id: '2b', level: 'BEG', make: function (r) { return entirePart(r.pick([2, 3, 4, 5]), 3, r.pick([2, 3, 4, 5, 6, 7])); } },
        { id: '2c', level: 'EMG', make: function (r) { return entirePart(-r.pick([2, 3]), 4, r.pick([2, 3, 5, 6, 7])); } },
        { id: '2d', level: 'EMG', make: function (r) { return entirePart(-r.pick([3, 4, 5, 6]), 3, r.pick([2, 3, 5, 7])); } },
        { id: '2e', level: 'EMG', make: function (r) { return entirePart(r.pick([2, 3]), 5, r.pick([2, 3, 4, 5])); } },
        { id: '2f', level: 'PRG', make: function (r) { var q = r.pick([2, 3]), p = r.pick(q === 2 ? [1, 3, 5] : [1, 2, 4]); return entirePart([p, q], 3, pw(q, 3) * r.pick([2, 3, 4, 5])); } },
        { id: '2g', level: 'ADV', make: function (r) {
          for (var i = 0; i < 100; i++) { var q = r.pick([2, 3, 5]), p = r.pick([1, 2, 3].filter(function (x) { return ex.gcd(x, q) === 1; })), m = q * r.pick([q, 1]) * r.pick([2, 3]), A = ex.norm(pw(p, 4) * m, pw(q, 4)); if (A[1] > 1 && !(p === 1 && m < 6)) return entirePart([p, q], 4, m); }
          return entirePart([2, 5], 4, 50);
        } },
        { id: '2h', level: 'EMG', make: function (r) { return entirePart(-r.pick([2, 3, 4, 5]), 3, r.pick([6, 7, 10, 11, 13])); } }] },
      { num: '3', stem: '<b>(No calculator.)</b>', parts: [
        { id: '3', level: 'PRG', make: function (r) {
          var A, B, C, D;
          for (var i = 0; i < 200; i++) {
            A = { k: r.int(2, 7) }; A.v = A.k; B = { k: r.pick([2, 3, 4]), r: r.pick([2, 3, 4]) }; B.v = B.k * B.r;
            C = r.pick([[3, 3], [5, 3], [1, 5], [7, 3], [3, 5]]); C = { p: C[0], s: C[1], v: C[0] * C[1] / 2 }; D = { k: r.pick([2, 3, 4]), t: r.pick([2, 3]) }; D.v = D.k * D.t;
            if (A.v !== B.v && A.v !== D.v && B.v !== D.v) break;
          }
          var items = [{ id: 'a', tex: A.k + '\\sqrt[6]{1}', v: A.v, how: A.k + '(1)=' + A.v },
            { id: 'b', tex: '-' + B.k + '\\sqrt[3]{-' + pw(B.r, 3) + '}', v: B.v, how: '-' + B.k + '(-' + B.r + ')=' + B.v + '\\ \\ (\\text{since } ' + rt(3, '-' + pw(B.r, 3)) + '=-' + B.r + ')' },
            { id: 'c', tex: '\\frac{' + C.p + '}{2}\\sqrt[4]{' + pw(C.s, 4) + '}', v: C.v, how: '\\frac{' + C.p + '}{2}(' + C.s + ')=' + C.v },
            { id: 'd', tex: D.k + '\\sqrt{\\sqrt[3]{' + pw(D.t, 6) + '}}', v: D.v, how: D.k + '\\sqrt{' + D.t * D.t + '}=' + D.k + '(' + D.t + ')=' + D.v }];
          var byId = {}; items.forEach(function (x) { byId[x.id] = x; });
          var sorted = items.slice().sort(function (x, y) { return x.v - y.v; });
          return P.order(r, 'Arrange the radicals in order from least to greatest.', sorted, { why: function (x, y) { return t(byId[x].tex + '=' + byId[x].v) + ' and ' + t(byId[y].tex + '=' + byId[y].v) + '. Which is smaller?'; } },
            'Each one works out exactly:<br>' + items.map(function (x) { return t(x.tex + '=' + x.how); }).join('<br>') + '<br>Least to greatest: ' + sorted.map(function (x) { return t(x.tex); }).join(', ') + '.',
            ['Work out each radical exactly. ' + t('\\sqrt[3]{-64}=-4') + ' because ' + t('(-4)^{3}=-64') + '.', 'For the nested one, work from the inside out: the cube root first, then the square root.'], 'order exact radicals');
        } }] },
      { num: '4', stem: function (sh) { return '<b>(No calculator.)</b> Consider the radicals ' + sh.items.map(function (x) { return t(x.tex); }).join(', ') + '.'; },
        shared: function (r) {
          var best = null;
          for (var i = 0; i < 300; i++) {
            var its = [], used = {};
            while (its.length < 4) { var a = r.pick([2, 3, 4]), b = r.pick([2, 3, 5, 6, 7, 9, 10, 11]), N = a * a * a * b; if (!used[N] && !used['b' + b]) { used[N] = 1; used['b' + b] = 1; its.push({ a: a, b: b, N: N }); } }
            var byN = its.slice().sort(function (x, y) { return x.N - y.N; }), byB = its.slice().sort(function (x, y) { return x.b - y.b; });
            var gap = Math.min.apply(null, byN.slice(1).map(function (x, j) { return x.N - byN[j].N; }));
            if (gap >= 6 && byN.map(function (x) { return x.b; }).join() !== byB.map(function (x) { return x.b; }).join()) { best = its; break; }
          }
          best = best || [{ a: 3, b: 5, N: 135 }, { a: 2, b: 9, N: 72 }, { a: 4, b: 3, N: 192 }, { a: 2, b: 7, N: 56 }];
          return { items: best.map(function (x, j) { return { id: 'r' + j, tex: x.a + '\\sqrt[3]{' + x.b + '}', a: x.a, b: x.b, N: x.N }; }) };
        },
        parts: [
          { id: '4a', level: 'PRG', make: function (r) {
            return P.mc(r, 'Which method arranges radicals like these in order without a calculator?', [
              { html: 'Write each one as an entire cube root (cube the coefficient and multiply). With the same index, the larger radicand is the larger number.', right: true },
              { html: 'Compare the coefficients: the larger the number in front, the larger the radical.', why: 'The radicand matters too. For example ' + t('2\\sqrt[3]{9}=\\sqrt[3]{72}') + ' is larger than ' + t('3\\sqrt[3]{2}=\\sqrt[3]{54}') + '.' },
              { html: 'Compare the radicands: the larger the number under the root, the larger the radical.', why: 'The coefficient matters too. For example ' + t('4\\sqrt[3]{3}=\\sqrt[3]{192}') + ' is larger than ' + t('2\\sqrt[3]{9}=\\sqrt[3]{72}') + '.' },
              { html: 'Multiply each coefficient by its radicand and compare the products.', why: 'When the coefficient moves inside a cube root it has to be <b>cubed</b>: ' + t('2\\sqrt[3]{9}=\\sqrt[3]{2^{3}\\times 9}') + ', not ' + t('\\sqrt[3]{2\\times 9}') + '.' }],
              'All the radicals have index ' + t('3') + ', so write each as an entire cube root by cubing the coefficient. Then they are all ' + t('\\sqrt[3]{\\ \\ }') + ' of something, and the larger radicand gives the larger value.',
              ['What do you have to do to a coefficient to move it inside a cube root?'], 'how to order cube-root radicals');
          } },
          { id: '4b', level: 'PRG', make: function (r, sh) {
            var byId = {}; sh.items.forEach(function (x) { byId[x.id] = x; });
            var sorted = sh.items.slice().sort(function (x, y) { return x.N - y.N; });
            return P.order(r, 'Arrange the radicals in order from least to greatest.', sorted, { why: function (x, y) { return t(byId[x].tex + '=\\sqrt[3]{' + byId[x].N + '}') + ' and ' + t(byId[y].tex + '=\\sqrt[3]{' + byId[y].N + '}') + '. Compare the radicands.'; } },
              sh.items.map(function (x) { return t(x.tex + '=\\sqrt[3]{' + x.a + '^{3}\\times ' + x.b + '}=\\sqrt[3]{' + x.N + '}'); }).join('<br>') + '<br>' + t(sorted.map(function (x) { return x.N; }).join('<') ) + ', so the order is ' + sorted.map(function (x) { return t(x.tex); }).join(', ') + '.',
              ['Convert each to an entire cube root: cube the coefficient, then multiply by the radicand.'], 'order cube-root radicals');
          } }] },
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '5', level: 'PRG', make: function (r) {
          var R = pickR(r, 3, [2, 3, 4, 5, 6], [2, 3, 5, 6, 7], 648, 60, 1500), f = ex.nthFactor(R, 3), m = R / pw(f, 3), V = f * Math.cbrt(m);
          var cands = [{ k: pw(f, 3), m: m, why: t(F(pw(f, 3))) + ' comes out of the cube root as ' + t(rt(3, F(pw(f, 3))) + '=' + f) + '.' }];
          var g = ex.nthFactor(R, 2); if (g > 1 && g !== f) cands.push({ k: g, m: R / (g * g), why: t(F(g * g) + '=' + g + '^{2}') + ' is a perfect <b>square</b>, but this is a cube root: ' + t(rt(3, F(g * g)) + '\\neq ' + g) + '.' });
          cands.push({ k: f, m: R / f, why: 'A number in front of a cube root stands for its <b>cube</b> inside: ' + t(f + '\\sqrt[3]{' + F(R / f) + '}=\\sqrt[3]{' + F(pw(f, 3) * R / f) + '}') + ', not ' + t('\\sqrt[3]{' + F(R) + '}') + '.' });
          if (m !== f) cands.push({ k: m, m: f, why: 'Check: ' + t(m + '^{3}\\times ' + f + '=' + F(pw(m, 3) * f)) + ', not ' + t(F(R)) + '.' });
          cands = cands.filter(function (c, i) { return !ex.eq(c.k * Math.cbrt(c.m), V) && cands.findIndex(function (d) { return d.k === c.k && d.m === c.m; }) === i; });
          var dis = r.sample(cands, 3);
          var opts = [{ html: t(f + '\\sqrt[3]{' + m + '}'), right: true }].concat(dis.map(function (c) { return { html: t(F(c.k) + '\\sqrt[3]{' + F(c.m) + '}'), why: c.why }; }));
          return P.mc(r, t('\\sqrt[3]{' + F(R) + '}') + ' is equivalent to', opts,
            t(F(R) + '=' + F(pw(f, 3)) + '\\times ' + m) + ' with ' + t(F(pw(f, 3)) + '=' + f + '^{3}') + ', so ' + t('\\sqrt[3]{' + F(R) + '}=' + f + '\\sqrt[3]{' + m + '}') + '.<br>Check any option by cubing its coefficient and multiplying by its radicand — only ' + t(f + '^{3}\\times ' + m + '=' + F(R)) + ' works.',
            ['Find the largest perfect cube that divides ' + t(F(R)) + '.', 'Check an option: cube the coefficient and multiply by the radicand. Do you get ' + t(F(R)) + '?'], 'cube root MC ' + R);
        } }] },
      { num: '6', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'ADV', make: function (r) {
          var pat = r.pick([['e', 'o'], ['e', 'o'], ['o', 'e'], ['o', 'e'], ['o', 'o'], ['e', 'e']]);
          var st = pat.map(function (p) { var n = p === 'e' ? r.pick([4, 6]) : r.pick([3, 5]), a = r.int(2, 6), b = r.pick([2, 3, 5, 6, 7, 10]); return { n: n, even: p === 'e', tex: '-' + a + '\\sqrt[' + n + ']{' + b + '}=' + a + '\\sqrt[' + n + ']{-' + b + '}', b: b }; });
          var t1 = !st[0].even, t2 = !st[1].even;
          function whyS(i, said) { var s = st[i]; return 'Look at Statement ' + (i + 1) + ' again: the index is ' + s.n + ' (' + (s.even ? 'even' : 'odd') + '). ' + (s.even ? t('\\sqrt[' + s.n + ']{-' + s.b + '}') + ' is not a real number, so it can’t equal anything — the statement is false.' : 'With an odd index ' + t('\\sqrt[' + s.n + ']{-' + s.b + '}=-\\sqrt[' + s.n + ']{' + s.b + '}') + ', so the statement is true.'); }
          var truth = [[true, true], [false, false], [true, false], [false, true]];
          var labels = ['Both statements are true.', 'Both statements are false.', 'Statement 1 is true, Statement 2 is false.', 'Statement 1 is false, Statement 2 is true.'];
          var opts = truth.map(function (tv, i) { var right = tv[0] === t1 && tv[1] === t2; return { html: labels[i], right: right, why: right ? null : whyS(tv[0] !== t1 ? 0 : 1) }; });
          return P.mc(r, '<b>Statement 1:</b> ' + t(st[0].tex) + '<br><b>Statement 2:</b> ' + t(st[1].tex) + '<br>Which of the following is correct?', opts,
            st.map(function (s, i) { return '<b>Statement ' + (i + 1) + '</b> has an ' + (s.even ? '<b>even</b> index: ' + t('\\sqrt[' + s.n + ']{-' + s.b + '}') + ' is not a real number (no real number to an even power is negative), so it is <b>false</b>.' : '<b>odd</b> index: ' + t('\\sqrt[' + s.n + ']{-' + s.b + '}=-\\sqrt[' + s.n + ']{' + s.b + '}') + ', so the right side equals the left side — <b>true</b>.'); }).join('<br>'),
            ['A negative sign can move in or out of a root only when the index is <b>odd</b>.'], 'sign in/out of odd/even roots', true);
        } }] },
      { num: '7', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '7', level: 'ADV', make: function (r) {
          var cq = r.pick([[3, 9], [2, 6], [2, 9], [4, 6], [4, 9], [5, 9], [5, 6], [2, 3], [3, 7], [2, 7], [4, 7]]), c = cq[0], q = cq[1], b = r.pick([2, 3, 5, 6, 7, 9, 10, 11]);
          if (c === 3 && q === 9 && r.chance(0.3)) b = 7;
          var R = pw(c, 3) * b, a = ex.norm(c, q), x = a[0] / a[1] + b;
          return P.approx('The mixed radical ' + t('\\frac{1}{' + q + '}\\sqrt[3]{' + R + '}') + ' can be converted to a mixed radical in simplest form ' + t('a\\sqrt[3]{b}') + '. The value of ' + t('a+b') + ', to the nearest tenth, is ________.', x, 1, { nr: true, diag: function (v) {
            if (Math.abs(v - K.roundTo(1 / q + R, 1)) < 1e-9) return { code: 'unchanged', hint: 'Simplify first: ' + t(F(R)) + ' has a perfect cube factor, so ' + t('\\sqrt[3]{' + R + '}') + ' isn’t in simplest form.' };
            if (Math.abs(v - K.roundTo(c + b, 1)) < 1e-9) return { code: 'coef-lost', hint: 'You found ' + t('\\sqrt[3]{' + R + '}=' + c + '\\sqrt[3]{' + b + '}') + '. Now multiply by the ' + t('\\frac{1}{' + q + '}') + ' in front to get ' + t('a') + '.' };
            if (Math.abs(v - K.roundTo(pw(c, 3) / q + b, 1)) < 1e-9) return { code: 'coef-power', hint: t(pw(c, 3)) + ' comes out of the cube root as ' + t(c) + ', not ' + t(pw(c, 3)) + '.' };
            if (Math.abs(v - K.roundTo(q / c + b, 1)) < 1e-9) return { code: 'flip', hint: t('a=\\frac{1}{' + q + '}\\times ' + c) + ' — check which number goes on top.' };
            return null;
          } }, t(F(R) + '=' + pw(c, 3) + '\\times ' + b) + ', so ' + t('\\sqrt[3]{' + R + '}=' + c + '\\sqrt[3]{' + b + '}') + '.<br>' + t('\\frac{1}{' + q + '}\\times ' + c + '\\sqrt[3]{' + b + '}=' + ratTex(a) + '\\sqrt[3]{' + b + '}') + ', so ' + t('a=' + ratTex(a)) + ' and ' + t('b=' + b) + '.<br>' + t('a+b=' + ratTex(a) + '+' + b + '\\approx ' + K.roundTo(x, 1).toFixed(1)) + '.',
          ['Simplify ' + t('\\sqrt[3]{' + R + '}') + ' first, then multiply by ' + t('\\frac{1}{' + q + '}') + '.', t('a') + ' is a fraction. Change it to a decimal before adding.'], 'a+b for (1/' + q + ')cbrt(' + R + ')');
        } }] },
      { num: '8', section: 'Part B — Extension: Radicals With Variables', stem: 'Assume every variable represents a non-negative number. Express each as an <b>entire radical</b>.', parts: [
        { id: '8a', level: 'BEG', make: function (r) { var L = letters(r, 1); return varEntire(r.int(2, 9), {}, 2, 1, obj(L, [1])); } },
        { id: '8b', level: 'BEG', make: function (r) { var L = letters(r, 1); return varEntire(r.int(2, 9), {}, 2, 1, obj(L, [2])); } },
        { id: '8c', level: 'EMG', make: function (r) { var L = letters(r, 2); return varEntire(r.int(2, 7), {}, 2, r.pick([2, 3, 5, 6, 7]), obj(L, [1, r.pick([3, 5])])); } },
        { id: '8d', level: 'EMG', make: function (r) { var L = letters(r, 1); return varEntire(-r.int(2, 5), {}, 3, 1, obj(L, [r.pick([1, 2])])); } },
        { id: '8e', level: 'EMG', make: function (r) { var L = letters(r, 1); return varEntire(1, obj(L, [r.pick([1, 2])]), 2, 1, obj(L, [1])); } },
        { id: '8f', level: 'EMG', make: function (r) { var L = letters(r, 2); return varEntire(1, obj([L[0]], [1]), 2, r.pick([2, 3, 5, 6, 7]), obj([L[1]], [r.pick([1, 3])])); } },
        { id: '8g', level: 'PRG', make: function (r) { var L = letters(r, 2); return varEntire(r.int(2, 9), obj(L, [r.pick([1, 2])]), 2, 1, obj(L, [r.pick([1, 2]), 1])); } },
        { id: '8h', level: 'PRG', make: function (r) { var L = letters(r, 2); return varEntire(r.int(2, 7), obj(L, [r.int(1, 3), 1]), 2, r.pick([2, 3, 5]), obj(L, [r.pick([1, 3]), 1])); } },
        { id: '8i', level: 'PRG', make: function (r) { var L = letters(r, 2); return varEntire(r.int(2, 5), obj(L, [r.int(1, 3), 1]), 2, r.pick([2, 3, 5, 6, 7]), {}); } },
        { id: '8j', level: 'ADV', make: function (r) { var L = letters(r, 2); return varEntire(r.pick([2, 3]), obj(L, [1, 2]), 3, r.pick([2, 3, 4, 5]), obj(L, [1, 1])); } },
        { id: '8k', level: 'ADV', make: function (r) { var L = letters(r, 3); return varEntire(r.int(2, 5), obj(L, [r.int(4, 6), r.int(5, 7)]), 2, 1, obj([L[0], L[2]], [3, 1])); } },
        { id: '8l', level: 'ADV', make: function (r) { var L = letters(r, 2); return varEntire(r.pick([2, 3]), obj(L, [1, 2]), 4, r.pick([2, 3, 4, 5]), obj([L[0]], [3])); } }] },
      { num: '9', stem: 'Express each as a mixed radical in simplest form.', parts: [
        { id: '9a', level: 'BEG', make: function (r) { return varMixed(1, {}, 2, 1, obj(letters(r, 1), [r.pick([5, 7, 9])])); } },
        { id: '9b', level: 'BEG', make: function (r) { return varMixed(1, {}, 2, 1, obj(letters(r, 1), [r.pick([3, 5, 7])])); } },
        { id: '9c', level: 'BEG', make: function (r) { return varMixed(1, {}, 2, 1, obj(letters(r, 1), [r.pick([11, 13, 15, 17])])); } },
        { id: '9d', level: 'EMG', make: function (r) { return varMixed(1, {}, 3, 1, obj(letters(r, 1), [r.pick([4, 7, 10])])); } },
        { id: '9e', level: 'EMG', make: function (r) { return varMixed(1, {}, 3, 1, obj(letters(r, 1), [r.pick([5, 8, 11, 14])])); } },
        { id: '9f', level: 'PRG', make: function (r) { var p = varMixed(1, {}, 4, 1, obj(letters(r, 1), [r.pick([6, 9, 10, 11, 13, 14])])); p.hints.push('Index ' + t('4') + ': divide each exponent by ' + t('4') + '.'); return p; } }] },
      { num: '10', stem: 'Express each as a mixed radical in simplest form.', parts: [
        { id: '10a', level: 'EMG', make: function (r) { var L = letters(r, 1); return varMixed(1, {}, 2, pickR(r, 2, [2, 3, 4, 5], [2, 3, 5, 6, 7], 18), obj(L, [2])); } },
        { id: '10b', level: 'EMG', make: function (r) { var L = letters(r, 1); return varMixed(1, {}, 2, pw(r.int(2, 7), 2), obj(L, [r.pick([3, 5, 7])])); } },
        { id: '10c', level: 'PRG', make: function (r) { var L = letters(r, 2); return varMixed(1, {}, 2, pickR(r, 2, [2, 3], [2, 3, 5, 7], 45), obj(L, [r.pick([3, 5]), r.pick([2, 4, 6])])); } },
        { id: '10d', level: 'PRG', make: function (r) { var L = letters(r, 2); return varMixed(1, {}, 2, pickR(r, 2, [6, 10, 12], [2, 3], 432), obj(L, [r.pick([5, 7]), r.pick([7, 9])])); } },
        { id: '10e', level: 'PRG', make: function (r) { var L = letters(r, 2); return varMixed(r.pick([2, 3, 4]), {}, 2, pickR(r, 2, [2, 3], [2, 3, 5], 45), obj(L, [r.pick([4, 6]), r.pick([3, 5])])); } },
        { id: '10f', level: 'PRG', make: function (r) { var L = letters(r, 2); return varMixed(-r.int(2, 5), {}, 2, r.pick([13, 17, 19, 23, 29, 31]), obj(L, [r.pick([4, 6, 8]), r.pick([6, 8, 10])])); } },
        { id: '10g', level: 'ADV', make: function (r) { var L = letters(r, 2); return varMixed(r.int(2, 5), obj(L, [r.int(1, 3), r.int(1, 3)]), 2, pickR(r, 2, [2, 3], [2, 3, 5], 20), obj(L, [r.pick([5, 7]), r.pick([2, 4])])); } },
        { id: '10h', level: 'ADV', make: function (r) {
          var L = letters(r, 2), sq = r.pick([[8, 3, 4], [8, 1, 4], [6, 2, 3], [6, 1, 2], [10, 2, 5], [10, 3, 5], [4, 3, 2], [9, 2, 3]]);
          return varMixed([sq[1], sq[2]], obj([L[0]], [1]), 2, sq[0] * sq[0], obj(L, [r.pick([3, 5]), r.pick([6, 8])]));
        } },
        { id: '10i', level: 'ADV', make: function (r) { var L = letters(r, 2); return varMixed(r.int(2, 9), obj(L, [r.int(3, 5), r.int(8, 11)]), 2, pickR(r, 2, [3, 5, 10], [2, 3], 200), obj(L, [r.pick([5, 7]), r.pick([4, 6])])); } },
        { id: '10j', level: 'PRG', make: function (r) { var L = letters(r, 1); return varMixed(1, {}, 3, pickR(r, 3, [3, 4, 5, 6, 7], [2, 3, 4, 5], 1029), obj(L, [r.pick([7, 8, 10, 11])])); } },
        { id: '10k', level: 'ADV', make: function (r) { var L = letters(r, 1); return varMixed(r.pick([2, 3, 4]), {}, 3, pickR(r, 3, [4, 5, 6], [2, 3], 432), obj(L, [r.pick([13, 14, 16, 17])])); } },
        { id: '10l', level: 'ADV', make: function (r) { var L = letters(r, 1); return varMixed(1, {}, 4, pickR(r, 4, [2, 3], [2, 3, 5], 162), obj(L, [r.pick([9, 11, 13, 14])])); } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var ab = r.sample([2, 3, 5, 7, 11], 2), a = ab[0], b = ab[1], z = r.pick(['z', 'x', 'y']), p = a * b;
          return P.mc(r, t('\\sqrt{' + a + z + '}\\cdot\\sqrt{' + b + z + '}') + ' is equivalent to', [
            { html: t(z + '\\sqrt{' + p + '}'), right: true },
            { html: t('\\sqrt{' + p + z + '}'), why: 'Multiply the radicands completely: ' + t(a + z + '\\times ' + b + z + '=' + p + z + '^{2}') + ' — there are two factors of ' + t(z) + '.' },
            { html: t('\\sqrt{' + p * p + z + '^{2}}'), why: t(a + '\\times ' + b + '=' + p) + ', not ' + t(p * p) + '. (And ' + t('\\sqrt{' + p * p + z + '^{2}}=' + p + z) + ', which is a different number.)' },
            { html: t(p + '\\sqrt{' + z + '}'), why: 'That swaps the parts: ' + t(z + '^{2}') + ' is the perfect square that comes out, while ' + t(p) + ' isn’t a perfect square, so it stays inside.' }],
            t('\\sqrt{' + a + z + '}\\cdot\\sqrt{' + b + z + '}=\\sqrt{' + p + z + '^{2}}=\\sqrt{' + z + '^{2}}\\cdot\\sqrt{' + p + '}=' + z + '\\sqrt{' + p + '}') + '.', ['Multiply the two radicands into one square root first, then simplify.'], 'product of variable square roots');
        } }] }
    ],
    extra: [
      { num: '3', section: 'Extra practice A — Prime-factored radicands', stem: 'The radicand is already prime-factored. For a cube root, group the prime factors in threes: each complete group of three comes out as one factor.', parts: [
        { id: 'e3', level: 'PRG', make: function (r) {
          var ps, es, R, prompt;
          for (var i = 0; i < 200; i++) { ps = r.pick([[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7], [2, 3, 11]]); es = [r.pick([4, 5, 7]), r.pick([3, 4, 5]), r.pick([1, 2])]; R = ps.reduce(function (m, p, j) { return m * pw(p, es[j]); }, 1); if (R < 4e6 && R / pw(ex.nthFactor(R, 3), 3) <= 120) break; }
          if (r.chance(0.25)) { ps = [2, 3, 5]; es = [7, 4, 1]; R = 51840; }
          prompt = '\\sqrt[3]{' + ps.map(function (p, j) { return es[j] > 1 ? p + '^{' + es[j] + '}' : String(p); }).join('\\times ') + '}';
          var f = ex.nthFactor(R, 3), m = R / pw(f, 3);
          var p = mixPart(1, 3, R, { prompt: t(prompt), text: 'cube root of ' + prompt, hints: ['Divide each exponent by ' + t('3') + ': the quotient is the exponent that comes out, the remainder stays under the root.', 'Multiply the primes that come out together, and the primes left inside together.'] });
          p.solution = 'Group each prime in threes: ' + ps.map(function (q, j) { var Q = Math.floor(es[j] / 3), Rm = es[j] % 3; return Q ? (Rm ? t(vp(q, es[j]) + '=' + vp(q, 3 * Q) + '\\times ' + vp(q, Rm)) : t(vp(q, es[j])) + ' is a perfect cube') + ' (' + t(vp(q, Q)) + ' comes out' + (Rm ? ', ' + t(vp(q, Rm)) + ' stays' : '') + ')' : t(vp(q, es[j])) + ' stays inside'; }).join('; ') + '.<br>' +
            'Outside: ' + t(ps.filter(function (q, j) { return es[j] >= 3; }).map(function (q, j) { return vp(q, Math.floor(es[ps.indexOf(q)] / 3)); }).join('\\times ') + '=' + f) + '. Inside: ' + t(ps.filter(function (q, j) { return es[j] % 3; }).map(function (q) { return vp(q, es[ps.indexOf(q)] % 3); }).join('\\times ') + '=' + F(m)) + '.<br>' + t(prompt + '=' + mixTex(f, 3, m)) + '.';
          return p;
        } }] },
      { num: '6', section: 'Extra practice B — Index 3 and higher', stem: 'For a cube root you need the largest perfect <b>cube</b> factor, not the largest perfect square. Convert each to a mixed radical in simplest form.', parts: [
        { id: 'e6a', level: 'EMG', make: function (r) { return mixPart(1, 3, pickR(r, 3, [2, 3], [2, 3, 4, 5, 6, 7], 54, 16, 200)); } },
        { id: 'e6b', level: 'PRG', make: function (r) { return mixPart(1, 3, pickR(r, 3, [4, 5, 6, 7], [2, 3, 5, 6, 7], 1512, 300, 2500)); } },
        { id: 'e6c', level: 'EMG', make: function (r) { return mixPart(1, 3, -pickR(r, 3, [2, 3, 4], [2, 3, 5], 128)); } },
        { id: 'e6d', level: 'PRG', make: function (r) { return mixPart(1, 3, -pickR(r, 3, [8, 9, 10, 12], [2, 3, 4], 3456)); } }] },
      { num: '7', stem: 'Same idea at index ' + t('4') + ' and index ' + t('5') + ': group the prime factors into fours or fives.', parts: [
        { id: 'e7a', level: 'PRG', make: function (r) { return mixPart(1, 4, pickR(r, 4, [3, 4, 5, 6], [2, 3, 5], 2592, 0, 4000)); } },
        { id: 'e7b', level: 'ADV', make: function (r) { return mixPart(1, 4, pickR(r, 4, [2, 3, 4, 5], [8, 27], 6912, 0, 20000)); } },
        { id: 'e7c', level: 'ADV', make: function (r) { return mixPart(1, 5, pickR(r, 5, [2, 3], [4, 8, 9, 16, 27], 3888)); } },
        { id: 'e7d', level: 'PRG', make: function (r) { return mixPart(1, 5, -pickR(r, 5, [2, 3, 4], [2, 3], 2048)); } }] },
      { num: '8', stem: 'Convert to a mixed radical in simplest form. Watch the sign travelling out of an odd root.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) { return mixPart(-r.pick([2, 3, 4, 5]), 3, pickR(r, 3, [6, 8, 10, 12], [2, 3], 5184)); } },
        { id: 'e8b', level: 'ADV', make: function (r) { var s = r.pick([2, 3, 5]), p = r.pick([2, 3, 4].filter(function (x) { return ex.gcd(x, s) === 1; })); if (s === 5 && r.chance(0.4)) p = 3; return mixPart([p, s], 4, pickR(r, 4, [s], [2, 3], 1250)); } },
        { id: 'e8c', level: 'PRG', make: function (r) { return mixPart(r.pick([2, 3]), 5, -pickR(r, 5, [2, 4], [2, 3], 2048)); } },
        { id: 'e8d', level: 'ADV', make: function (r) { var s = r.pick([5, 7]), p = r.pick([2, 3, 4, 5, 6].filter(function (x) { return x !== s; })); return mixPart([p, s], 3, pickR(r, 3, [s], [2, 3, 6, 9, 12, 18], 6174)); } }] },
      { num: '9', stem: 'Convert each mixed radical to an entire radical. The coefficient is raised to the power of the <b>index</b> — and with an even index a negative coefficient has to stay outside.', parts: [
        { id: 'e9a', level: 'EMG', make: function (r) { return entirePart(r.int(2, 5), 3, r.pick([2, 3])); } },
        { id: 'e9b', level: 'EMG', make: function (r) { return entirePart(-r.int(3, 6), 3, r.pick([2, 3, 4])); } },
        { id: 'e9c', level: 'PRG', make: function (r) { var q = r.pick([2, 3]), p = q === 2 ? r.pick([3, 5]) : r.pick([2, 4]); return entirePart([p, q], 3, pw(q, 3) * r.pick([2, 3])); } },
        { id: 'e9d', level: 'EMG', make: function (r) { return entirePart(r.pick([2, 3]), 4, r.pick([2, 3, 5, 6, 7])); } },
        { id: 'e9e', level: 'PRG', make: function (r) { return entirePart(-r.pick([3, 4, 5]), 4, r.pick([2, 3])); } },
        { id: 'e9f', level: 'PRG', make: function (r) { return entirePart([1, 2], 5, 32 * r.pick([3, 5, 7])); } }] },
      { num: '10', stem: 'Evaluate each exactly, or decide that it is <b>not possible</b> in the real number system.', parts: [
        { id: 'e10a', level: 'BEG', outcome: 'AN1', make: function (r) { return evalPart(r, 3, -1, r.pick([2, 3, 4, 5, 6, 10])); } },
        { id: 'e10b', level: 'EMG', outcome: 'AN1', make: function (r) { return evalPart(r, 4, -1, r.pick([2, 3]), true); } },
        { id: 'e10c', level: 'EMG', outcome: 'AN1', make: function (r) { return evalPart(r, 4, 1, r.pick([2, 3]), false, true); } },
        { id: 'e10d', level: 'BEG', outcome: 'AN1', make: function (r) { return evalPart(r, 5, -1, r.pick([2, 3])); } }] },
      { num: '12', section: 'Extra practice C — Comparing radicals', stem: '<b>(No calculator.)</b> Every radical here has index ' + t('3') + ', so convert each to an entire cube root — the coefficient is now <b>cubed</b>, not squared — and compare the radicands.', parts: [
        { id: 'e12', level: 'ADV', make: function (r) {
          var N, it;
          for (var i = 0; i < 500; i++) {
            var b1 = r.pick([4, 5, 6, 7, 9, 10]), b3 = r.pick([2, 3]), n2 = r.int(30, 90), n4 = r.int(30, 90), n5 = r.int(30, 90);
            N = [8 * b1, n2, 27 * b3, n4, n5];
            var distinct = N.every(function (x, j) { return N.indexOf(x) === j; }), spread = Math.max.apply(null, N) - Math.min.apply(null, N);
            if (distinct && spread <= 28 && ex.nthFactor(n2, 3) === 1 && n4 % 8 && n5 % 27) { it = [b1, n2, b3, n4, n5]; break; }
          }
          if (!it) { it = [5, 50, 2, 56, 57]; N = [40, 50, 54, 56, 57]; }
          var items = [{ id: 'p', tex: '2\\sqrt[3]{' + it[0] + '}', N: N[0], how: '\\sqrt[3]{8\\times ' + it[0] + '}' },
            { id: 'q', tex: '\\sqrt[3]{' + it[1] + '}', N: N[1], how: '' },
            { id: 'r', tex: '3\\sqrt[3]{' + it[2] + '}', N: N[2], how: '\\sqrt[3]{27\\times ' + it[2] + '}' },
            { id: 's', tex: '\\frac{1}{2}\\sqrt[3]{' + F(8 * it[3]) + '}', N: N[3], how: '\\sqrt[3]{\\frac{1}{8}\\times ' + F(8 * it[3]) + '}' },
            { id: 'u', tex: '\\frac{1}{3}\\sqrt[3]{' + F(27 * it[4]) + '}', N: N[4], how: '\\sqrt[3]{\\frac{1}{27}\\times ' + F(27 * it[4]) + '}' }];
          var byId = {}; items.forEach(function (x) { byId[x.id] = x; });
          var sorted = items.slice().sort(function (x, y) { return x.N - y.N; });
          return P.order(r, 'Arrange from least to greatest.', sorted, { why: function (x, y) { return t(byId[x].tex + '=\\sqrt[3]{' + byId[x].N + '}') + ' and ' + t(byId[y].tex + '=\\sqrt[3]{' + byId[y].N + '}') + '. Compare the radicands.'; } },
            items.map(function (x) { return t(x.tex + (x.how ? '=' + x.how : '') + '=\\sqrt[3]{' + x.N + '}'); }).join('<br>') + '<br>' + t(sorted.map(function (x) { return x.N; }).join('<')) + ', so the order is ' + sorted.map(function (x) { return t(x.tex); }).join(', ') + '.',
            ['To move a coefficient inside a cube root, cube it: ' + t('\\frac{1}{2}=\\sqrt[3]{\\frac{1}{8}}') + '.', 'Once every radical is ' + t('\\sqrt[3]{\\ \\ }') + ' of a single number, the larger number gives the larger radical.'], 'order five cube-root radicals');
        } }] },
      { num: '13', section: 'Extra practice D — Error analysis', stem: function (sh) { return 'Each student made exactly one mistake.<br>(a) <b>Nadia</b> simplifies a cube root: ' + t('\\sqrt[3]{' + sh.R + '}=\\sqrt[3]{' + sh.s * sh.s + '\\times ' + sh.u + '}=' + sh.s + '\\sqrt[3]{' + sh.u + '}') + '<br>(c) <b>Priya</b> converts to an entire radical: ' + t('-' + sh.c + '\\sqrt[4]{' + sh.m + '}=\\sqrt[4]{-' + F(pw(sh.c, 4) * sh.m) + '}'); },
        shared: function (r) { var R = r.pick([72, 108, 48, 162, 200, 80, 96, 500]), s = ex.nthFactor(R, 2); return { R: R, s: s, u: R / (s * s), c: r.pick([2, 3, 4]), m: r.pick([2, 3, 5, 6, 7]) }; },
        parts: [
          { id: 'e13a1', sub: 'a(i)', level: 'PRG', make: function (r, sh) {
            return P.mc(r, 'What is Nadia’s error?', [
              { html: t(sh.s * sh.s) + ' is a perfect <b>square</b>, not a perfect cube, so ' + t('\\sqrt[3]{' + sh.s * sh.s + '}') + ' is not ' + t(sh.s) + '.', right: true },
              { html: 'There is no error.', why: 'Check by cubing: ' + t(sh.s + '^{3}\\times ' + sh.u + '=' + F(pw(sh.s, 3) * sh.u)) + ', not ' + t(sh.R) + '.' },
              { html: 'She should have written ' + t(sh.s * sh.s + '\\sqrt[3]{' + sh.u + '}') + '.', why: 'A factor comes out of a cube root only if it is a perfect cube, and then it comes out as its cube root.' },
              { html: 'She didn’t use the <b>largest</b> perfect square.', why: t(sh.s * sh.s) + ' is the largest perfect square factor — but for a cube root you need a perfect <b>cube</b>.' }],
              'For a cube root you need a perfect <b>cube</b> factor. ' + t(sh.s * sh.s + '=' + sh.s + '^{2}') + ' is a perfect square, and ' + t('\\sqrt[3]{' + sh.s * sh.s + '}\\neq ' + sh.s) + ' because ' + t(sh.s + '^{3}=' + F(pw(sh.s, 3))) + '.', ['Check her answer: cube the coefficient and multiply by the radicand.'], 'Nadia error ' + sh.R);
          } },
          { id: 'e13a2', sub: 'a(ii)', level: 'PRG', make: function (r, sh) { var p = mixPart(1, 3, sh.R); p.prompt = 'Give the correct simplest form of ' + t('\\sqrt[3]{' + sh.R + '}') + '.'; return p; } },
          { id: 'e13c1', sub: 'c(i)', level: 'PRG', make: function (r, sh) {
            var M = pw(sh.c, 4) * sh.m;
            return P.mc(r, 'What is Priya’s error?', [
              { html: 'The index is even, so the negative can’t go under the root: ' + t('\\sqrt[4]{-' + F(M) + '}') + ' isn’t a real number. The ' + t('-') + ' must stay outside.', right: true },
              { html: 'There is no error: a negative sign can always move inside a radical.', why: 'Only with an <b>odd</b> index. No real number to the 4th power is negative.' },
              { html: 'She should have multiplied ' + t(sh.c + '\\times ' + sh.m) + ' to get ' + t('\\sqrt[4]{-' + sh.c * sh.m + '}') + '.', why: 'Raising ' + t(sh.c) + ' to the 4th power is right — the problem is the negative sign under an even root.' },
              { html: 'She should have used ' + t('(-' + sh.c + ')^{4}=' + pw(sh.c, 4)) + ' to get ' + t('\\sqrt[4]{' + F(M) + '}') + '.', why: t('\\sqrt[4]{' + F(M) + '}') + ' is positive, but ' + t('-' + sh.c + '\\sqrt[4]{' + sh.m + '}') + ' is negative. The ' + t('-') + ' has to stay outside the root.' }],
              'With an even index, a negative coefficient stays outside: only ' + t(sh.c) + ' moves in. ' + t('-' + sh.c + '\\sqrt[4]{' + sh.m + '}=-\\sqrt[4]{' + pw(sh.c, 4) + '\\times ' + sh.m + '}=-\\sqrt[4]{' + F(M) + '}') + '.', ['Is ' + t('\\sqrt[4]{-' + F(M) + '}') + ' a real number?'], 'Priya error');
          } },
          { id: 'e13c2', sub: 'c(ii)', level: 'PRG', make: function (r, sh) { var p = entirePart(-sh.c, 4, sh.m); p.prompt = 'Give the correct entire radical for ' + t('-' + sh.c + '\\sqrt[4]{' + sh.m + '}') + '.'; return p; } }] },
      { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e14', level: 'ADV', make: function (r) {
          var f = r.pick([6, 6, 10, 12, 8]), m = r.pick([2, 3, 5].filter(function (x) { return f !== 10 || x !== 5; })), R = pw(f, 3) * m;
          var divs = [2, 3, 4, 5, 6].filter(function (a) { return a < f && f % a === 0; }), two = r.sample(divs, 2);
          var near = null;
          for (var i = 0; i < 200 && !near; i++) { var c = r.pick([2, 3, 4, 5, 7].filter(function (a) { return f % a; })), d = Math.round(R / pw(c, 3)) + r.pick([-1, 1]); if (d > 1 && ex.nthFactor(d, 3) === 1 && pw(c, 3) * d !== R) near = { c: c, d: d }; }
          var opts = [{ html: t(f + '\\sqrt[3]{' + m + '}'), right: true }].concat(two.map(function (a) { var inside = R / pw(a, 3); return { html: t(a + '\\sqrt[3]{' + F(inside) + '}'), why: 'This one is equal to ' + t('\\sqrt[3]{' + F(R) + '}') + ', but ' + t(F(inside) + '=' + pw(f / a, 3) + '\\times ' + m) + ' still contains the perfect cube ' + t(pw(f / a, 3)) + '. It isn’t in simplest form.' }; }))
            .concat([{ html: t(near.c + '\\sqrt[3]{' + near.d + '}'), why: 'Check: ' + t(near.c + '^{3}\\times ' + near.d + '=' + F(pw(near.c, 3) * near.d)) + ', not ' + t(F(R)) + '. This one isn’t even equal.' }]);
          return P.mc(r, 'Three of the four expressions below are equal to ' + t('\\sqrt[3]{' + F(R) + '}') + ', but only one of them is a mixed radical <b>in simplest form</b>. Which one?', opts,
            t(F(R) + '=' + pw(f, 3) + '\\times ' + m) + ' with ' + t(pw(f, 3) + '=' + f + '^{3}') + ', so in simplest form ' + t('\\sqrt[3]{' + F(R) + '}=' + f + '\\sqrt[3]{' + m + '}') + '. ' + two.map(function (a) { return t(a + '\\sqrt[3]{' + F(R / pw(a, 3)) + '}'); }).join(' and ') + ' are equal but still have a perfect cube under the root; ' + t(near.c + '\\sqrt[3]{' + near.d + '}=\\sqrt[3]{' + F(pw(near.c, 3) * near.d) + '}') + ' isn’t equal at all.',
            ['Simplest form: the number left under the cube root has no perfect cube factor (other than 1).'], 'simplest form of cbrt ' + R);
        } }] },
      { num: '15', section: 'Extra practice E — Radicals with variables', stem: 'Assume every variable represents a non-negative number. Express each as a mixed radical in simplest form. Divide each exponent by the index: the quotient comes out, the remainder stays under.', parts: [
        { id: 'e15a', level: 'PRG', make: function (r) { var L = letters(r, 2); return varMixed(1, {}, 2, pickR(r, 2, [6, 10, 12], [2, 3], 288), obj(L, [r.pick([7, 9, 11]), r.pick([4, 6, 8])])); } },
        { id: 'e15b', level: 'ADV', make: function (r) { var L = letters(r, 2); return varMixed(1, {}, 3, pickR(r, 3, [3, 4, 6], [2, 3], 432), obj(L, [r.pick([8, 11]), r.pick([4, 7])])); } },
        { id: 'e15c', level: 'ADV', make: function (r) { var L = letters(r, 2); return varMixed(-r.pick([2, 3]), {}, 2, pickR(r, 2, [5, 10], [3, 6, 7], 700), obj(L, [r.pick([3, 5]), r.pick([7, 9])])); } },
        { id: 'e15d', level: 'ADV', make: function (r) { var L = letters(r, 2); return varMixed(1, {}, 4, pickR(r, 4, [2, 3, 5], [2, 3], 1250), obj(L, [r.pick([9, 13]), 4])); } }] },
      { num: '16', stem: 'Assume every variable represents a non-negative number. Express each as an entire radical.', parts: [
        { id: 'e16a', level: 'PRG', make: function (r) { var L = letters(r, 1); return varEntire(r.int(2, 5), obj(L, [r.int(1, 3)]), 2, r.pick([2, 3, 5]), obj(L, [r.pick([1, 3])])); } },
        { id: 'e16b', level: 'PRG', make: function (r) { var L = letters(r, 2); return varEntire(r.int(2, 5), obj(L, [1, r.pick([2, 3])]), 2, r.pick([2, 3, 5, 7]), obj(L, [2, 1])); } },
        { id: 'e16c', level: 'ADV', make: function (r) { var L = letters(r, 3); return varEntire(r.pick([2, 3]), obj(L, [1, 2]), 3, r.pick([2, 3, 5]), obj([L[0], L[2]], [1, r.pick([2, 4])])); } },
        { id: 'e16d', level: 'ADV', make: function (r) { var L = letters(r, 2), q = r.pick([2, 3]), p = q === 2 ? r.pick([1, 3]) : r.pick([1, 2]); return varEntire([p, q], obj([L[0]], [r.pick([2, 3])]), 2, q * q * r.pick([2, 3, 5]), obj(L, [1, 2])); } }] },
      { num: '17', section: 'Extra practice F — Combining and stretching', stem: '<b>Like radicals</b> have the same index and the same radicand, and only then can their coefficients be added: ' + t('3\\sqrt[3]{2}+4\\sqrt[3]{2}=7\\sqrt[3]{2}') + ', just like ' + t('3x+4x=7x') + '. Simplify each term to a mixed radical first, then combine.', parts: [
        { id: 'e17', sub: 'd', level: 'ADV', make: function (r) {
          var m, s1, s2, a, b, R1, R2;
          for (var i = 0; i < 100; i++) { m = r.pick([2, 3, 4, 5]); var ss = r.sample([2, 3, 4], 2); s1 = ss[0]; s2 = ss[1]; a = r.pick([1, 2, 3]); b = r.pick([1, 2]); R1 = pw(s1, 3) * m; R2 = pw(s2, 3) * m; if (R1 <= 320 && R2 <= 320 && a * s1 + b * s2 > 1) break; }
          if (r.chance(0.25)) { m = 2; s1 = 3; s2 = 2; a = 2; b = 1; R1 = 54; R2 = 16; }
          var K2 = a * s1 + b * s2, q = (a > 1 ? a : '') + '\\sqrt[3]{' + R1 + '}+' + (b > 1 ? b : '') + '\\sqrt[3]{' + R2 + '}';
          var chk = K.radical({ k: K2, n: 3, m: m }, 'mixed', { diag: function (val, rr) {
            if (rr && rr.n === 3 && (rr.m === R1 + R2 || rr.m === a * R1 + b * R2)) return { code: 'added-radicands', hint: 'Radicands can’t be added: ' + t('\\sqrt[3]{' + R1 + '}+\\sqrt[3]{' + R2 + '}\\neq\\sqrt[3]{' + (R1 + R2) + '}') + '. Simplify each term first, then add the coefficients of the like radicals.' };
            if (a > 1 && ex.eq(val, (s1 + b * s2) * Math.cbrt(m))) return { code: 'coef-lost', hint: 'Don’t forget the ' + t(a) + ' in front of the first radical: ' + t(a + '\\times ' + s1 + '\\sqrt[3]{' + m + '}') + '.' };
            if (b > 1 && ex.eq(val, (a * s1 + s2) * Math.cbrt(m))) return { code: 'coef-lost', hint: 'Don’t forget the ' + t(b) + ' in front of the second radical.' };
            return null;
          } });
          var p = P.math(t(q), chk, K2 + '\\sqrt[3]{' + m + '}',
            t((a > 1 ? a : '') + '\\sqrt[3]{' + R1 + '}=' + (a > 1 ? a + '\\times ' : '') + s1 + '\\sqrt[3]{' + m + '}' + (a > 1 ? '=' + a * s1 + '\\sqrt[3]{' + m + '}' : '')) + ' (since ' + t(R1 + '=' + pw(s1, 3) + '\\times ' + m) + ')<br>' +
            t((b > 1 ? b : '') + '\\sqrt[3]{' + R2 + '}=' + (b > 1 ? b + '\\times ' : '') + s2 + '\\sqrt[3]{' + m + '}' + (b > 1 ? '=' + b * s2 + '\\sqrt[3]{' + m + '}' : '')) + ' (since ' + t(R2 + '=' + pw(s2, 3) + '\\times ' + m) + ')<br>' +
            'Now they are like radicals: ' + t(a * s1 + '\\sqrt[3]{' + m + '}+' + b * s2 + '\\sqrt[3]{' + m + '}=' + K2 + '\\sqrt[3]{' + m + '}') + '.',
            ['Simplify each cube root separately: find the largest perfect cube factor of ' + t(R1) + ' and of ' + t(R2) + '.', 'When both have the same radicand, add the coefficients and keep the radical.'], 'like cube roots ' + q, { keys: 'radical' });
          p.bad = ['\\sqrt[3]{' + (R1 + R2) + '}'];
          return p;
        } }] },
      { num: '20', stem: '<b>Stretch.</b> Run the process backwards.', parts: [
        { id: 'e20', sub: 'c', level: 'MAS', make: function (r) {
          var c = r.pick([2, 3, 4, 5, 6, 7]), ans = 2 * pw(c, 3);
          return P.nr('The smallest whole number ' + t('n') + ' for which ' + t('\\sqrt[3]{n}') + ', in simplest form, is a mixed radical with coefficient exactly ' + t(c) + ' is ________.', ans, function (v) {
            if (v === pw(c, 3)) return { code: 'whole-number', hint: t('\\sqrt[3]{' + pw(c, 3) + '}=' + c) + ' is a whole number — nothing is left under the root, so it isn’t a mixed radical.' };
            if (v === 2 * c * c) return { code: 'square-thinking', hint: 'That would work for a <b>square</b> root. For a cube root the coefficient ' + t(c) + ' comes from the perfect cube ' + t(c + '^{3}=' + pw(c, 3)) + '.' };
            if (v > ans && v % pw(c, 3) === 0 && ex.nthFactor(v, 3) === c) return { code: 'not-smallest', hint: t('\\sqrt[3]{' + F(v) + '}=' + c + '\\sqrt[3]{' + v / pw(c, 3) + '}') + ' works, but there is a smaller one. What is the smallest number you could leave under the root?' };
            if (v % pw(c, 3) === 0 && ex.nthFactor(v, 3) > c) return { code: 'not-simplest', hint: t('\\sqrt[3]{' + F(v) + '}') + ' simplifies to ' + t(mixTex(ex.nthFactor(v, 3), 3, v / pw(ex.nthFactor(v, 3), 3))) + ' — the coefficient is ' + t(ex.nthFactor(v, 3)) + ', not ' + t(c) + '.' };
            return null;
          }, 'The coefficient ' + t(c) + ' comes from the perfect cube ' + t(c + '^{3}=' + pw(c, 3)) + ', so ' + t('n=' + pw(c, 3) + 'k') + ' and ' + t('\\sqrt[3]{n}=' + c + '\\sqrt[3]{k}') + ', where ' + t('k') + ' has no perfect cube factor.<br>' + t('k=1') + ': ' + t('\\sqrt[3]{' + pw(c, 3) + '}=' + c) + ', a whole number — not a mixed radical.<br>' + t('k=2') + ': ' + t('\\sqrt[3]{' + ans + '}=' + c + '\\sqrt[3]{2}') + ' ✓, so ' + t('n=' + ans) + '.',
          ['Where does a coefficient of ' + t(c) + ' come from in a cube root?', 'Try ' + t(c + '^{3}\\times 1') + ', ' + t(c + '^{3}\\times 2') + ', … Which is the first one that leaves something under the root?'], 'smallest n, cbrt coefficient ' + c);
        } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  /* ⁿ√(sign·s^n), or −ⁿ√(s^n) when outerNeg: evaluate or "not possible" */
  function evalPart(r, n, sign, s, notReal, outerNeg) {
    var R = pw(s, n), q = (outerNeg ? '-' : '') + rt(n, (sign < 0 ? '-' : '') + F(R)), NP = 'Not possible in the real numbers';
    var val = notReal ? null : (outerNeg || sign < 0 ? -s : s), dv = R % n === 0 ? R / n : s * s;
    var opts;
    if (notReal) opts = [{ html: NP, right: true }, { html: t(-s), why: 'Check: ' + t('(-' + s + ')^{' + n + '}=' + F(R)) + ', which is positive. An even power is never negative.' },
      { html: t(s), why: t(s + '^{' + n + '}=' + F(R)) + ', not ' + t('-' + F(R)) + '.' }, { html: t(s) + ' and ' + t(-s), why: 'Both ' + t(s) + ' and ' + t(-s) + ' give ' + t('+' + F(R)) + ' when raised to the power ' + t(n) + '.' }];
    else if (outerNeg) opts = [{ html: t(-s), right: true }, { html: NP, why: 'The negative sign is <b>outside</b> the root. ' + t(rt(n, F(R)) + '=' + s) + ' exists; then take its opposite.' },
      { html: t(s), why: 'Don’t lose the negative sign in front of the root.' }, { html: t(-dv), why: t(rt(n, F(R))) + ' is the number whose ' + nth(n) + ' power is ' + t(F(R)) + ' — not ' + t(F(R)) + ' divided by ' + t(n) + '. Check: ' + t(dv + '^{' + n + '}\\neq ' + F(R)) + '.' }];
    else opts = [{ html: t(-s), right: true }, { html: t(s), why: 'Check: ' + t(s + '^{' + n + '}=' + F(R)) + ', not ' + t('-' + F(R)) + '.' },
      { html: NP, why: 'The index is <b>odd</b>, so a negative radicand is fine: ' + t('(-' + s + ')^{' + n + '}=-' + F(R)) + '.' }, { html: t(s) + ' and ' + t(-s), why: 'Only one real number gives ' + t('-' + F(R)) + ': ' + t(s + '^{' + n + '}') + ' is positive.' }];
    var sol = notReal ? '<b>Not possible.</b> The index ' + t(n) + ' is even and the radicand is negative: no real number raised to an even power is negative.'
      : outerNeg ? 'The negative sign is outside the root. ' + t(rt(n, F(R)) + '=' + s) + ' since ' + t(s + '^{' + n + '}=' + F(R)) + ', so ' + t(q + '=' + val) + '.'
      : 'The index is odd, so a negative radicand is fine: ' + t('(-' + s + ')^{' + n + '}=-' + F(R)) + ', so ' + t(q + '=' + val) + '.';
    return P.mc(r, t(q), opts, sol, ['Is the index odd or even? Is the negative sign inside or outside the root?'], 'evaluate ' + q);
  }
})(window);
