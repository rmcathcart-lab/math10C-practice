/* Math 10C · Unit 1 · Lesson 5 — Roots of Real Numbers (AN2; AN1 for square/cube roots of perfect squares/cubes)
 * Assignment questions 1–13 (u1_L05.tex) and the Lesson 5 Extra Practice (u1_EP05.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. "Evaluate, where possible" parts that involve a negative sign are
 * multiple choice with a "not possible (not a real number)" option, so the format never gives the answer away.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'no-coef': 'Forgot to multiply by the coefficient', 'added-coef': 'Added the coefficient instead of multiplying',
    'divided-index': 'Divided by the index instead of taking the root', 'no-root': 'Didn’t take the root',
    'top-only': 'Took the root of the numerator only', 'bottom-only': 'Took the root of the denominator only',
    'wrong-index': 'Used the wrong index (wrong root key)', 'coef-inside': 'Put the coefficient inside the radical',
    'added': 'Added radicands instead of multiplying', 'subtracted': 'Subtracted radicands instead of dividing',
    'multiplied': 'Multiplied radicands in a quotient', 'root-first': 'Mixed a root and a radicand (e.g. √6 × 3 = √18)',
    'inner-roots': 'Skipped the inner roots of a nested radical', 'cancel': 'Cancelled radicands incorrectly',
    'multiply-out': 'Radicand not multiplied out', 'mixed-rad': 'Mixed radical instead of one radical', 'index-2': 'Not written as a square root',
    'two-radicals': 'Not written as a product of two radicals', trivial: 'Used 1 as a factor',
    'mc-np': 'Said “not possible” for a real root', 'mc-pm': 'Gave ± for a principal root', 'mc-neg-root': 'Said √(negative) is negative',
    'mc-pos-root': 'Gave a positive root of a negative radicand', 'mc-flip': 'Fraction upside down', 'mc-index': 'Used the wrong index',
    'kept-sign': 'Said √(x²) = x for negative x', 'squared-only': 'Squared but didn’t take the root', halfway: 'Rounded the estimate the wrong way',
    'bracket': 'Wrong consecutive integers', 'swapped-bounds': 'Smaller and larger swapped', 'power-not-root': 'Gave the perfect power instead of its root',
    'odd-index': 'Chose an odd index (that root is real)', positive: 'Radicand not negative', 'no-radical': 'Not a radical',
    'as-radical': 'Gave the value instead of the radical', related: 'A different radical with the same value',
    'added-index': 'Added the indices instead of multiplying', 'np-root': 'Kept √(negative)', 'count': 'Miscounted', 'swapped-ir': 'Swapped index and radicand',
    'coef-index': 'Took the coefficient as the index', 'coef-radicand': 'Included the coefficient in the radicand', 'no-index': 'Didn’t know the hidden index is 2', 'mixed-num': 'Mixed number instead of an improper fraction'
  });

  /* ---------- small helpers ---------- */
  var NTH = { 2: 'square', 3: 'cube', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh' };
  function nth(n) { return NTH[n] || n + 'th'; }
  function perfName(n) { return n === 2 ? 'perfect square' : n === 3 ? 'perfect cube' : 'perfect ' + nth(n) + ' power'; }
  function factorPhrase(n) { return n === 2 ? 'multiplied by itself' : 'used as a factor ' + n + ' times'; }
  function nroot(x, n) { return x < 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n); }
  function ipow(b, n) { return Math.round(Math.pow(b, n)); }
  function nrm(p, q) { return ex.norm(p, q == null ? 1 : q); }
  function R(x) { return typeof x === 'number' ? [x, 1] : x; }
  function rTex(fr) { return ex.texRat(R(fr)); }
  function rt(n, inner) { return ex.texRoot(n, inner); }
  function same(v, x) { return isFinite(v) && isFinite(x) && Math.abs(v - x) < 1e-9 * Math.max(1, Math.abs(x)); }
  function near(v, x) { return isFinite(v) && isFinite(x) && Math.abs(v - x) <= 0.006 + 1e-3 * Math.abs(x); }
  function isPerfect(m, n) { return ipow(Math.round(nroot(m, n)), n) === m; }
  function nonPerfect(r, lo, hi, n, avoid) { for (var i = 0; i < 400; i++) { var m = r.int(lo, hi); if (!isPerfect(m, n) && (!avoid || !avoid(m))) return m; } return lo; }
  function gcd(a, b) { return ex.gcd(a, b); }
  function dots(x) { var tr = Math.trunc(x * 1e5) / 1e5; return tr.toFixed(5) + '\\ldots'; }
  /* value of w\frac{p}{q} read as a mixed number (null if the response isn't one) */
  function mixedVal(ast) {
    if (!ast || ast.t !== 'mul' || !ast.imp) return null;
    var w = ast.a, f = ast.b, sg = 1;
    if (w && w.t === 'neg') { sg = -1; w = w.a; }
    if (!w || w.t !== 'num' || w.dec || !f || f.t !== 'div' || !f.frac || !f.a || !f.b || f.a.t !== 'num' || f.b.t !== 'num' || f.a.dec || f.b.dec || f.a.v >= f.b.v) return null;
    return sg * (w.v + f.a.v / f.b.v);
  }
  function decStr(x, dp) { return x.toFixed(dp).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); }
  /* radicand: integer, fraction (\dfrac) or decimal (dp places) */
  function radTex(num, den, dp) {
    if (dp) return (num < 0 ? '-' : '') + (Math.abs(num) / den).toFixed(dp);
    if (den === 1) return F(num);
    return (num < 0 ? '-' : '') + '\\dfrac{' + F(Math.abs(num)) + '}{' + F(den) + '}';
  }
  function valTex(fr, dec) { fr = R(fr); if (dec && fr[1] !== 1) return decStr(fr[0] / fr[1], 6); return rTex(fr); }
  function coefTex(k) { if (k[0] === k[1]) return ''; if (k[0] === -k[1]) return '-'; return rTex(k); }
  function powTex(fr, n, dec) { fr = R(fr); var s = valTex(fr, dec); return (fr[1] === 1 || dec ? (fr[0] < 0 ? '(' + s + ')' : s) : '\\left(' + s + '\\right)') + '^{' + n + '}'; }
  function pm(fr) { return '\\pm ' + rTex([Math.abs(R(fr)[0]), R(fr)[1]]); }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return P.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function tf(r, prompt, truth, why, sol, hints, text) { return P.tf(r, prompt, truth, why, sol, hints, text); }
  var NPH = '<b>Not possible</b> (not a real number)';
  var XKEY = 'the ' + t('\\sqrt[x]{\\ }') + ' key (' + '<b>2nd</b> then <b>^</b> on the TI-30XIIS)';

  /* ---------- one radical k·ⁿ√(num/den), possibly with a minus sign in front ---------- */
  function rootSpec(s) {
    var n = s.n, num = s.num, den = s.den || 1, k = s.k ? nrm(R(s.k)[0], R(s.k)[1]) : [1, 1], sg = s.neg ? -1 : 1;
    var o = { n: n, num: num, den: den, k: k, neg: !!s.neg, dp: s.dp || 0 };
    o.a = Math.round(nroot(Math.abs(num), n)); o.b = Math.round(nroot(den, n));
    o.rad = radTex(num, den, s.dp); o.absRad = radTex(Math.abs(num), den, s.dp);
    o.radical = rt(n, o.rad);
    o.expr = (s.neg ? '-' : '') + coefTex(k) + o.radical;
    o.np = num < 0 && n % 2 === 0;
    o.root = nrm(o.a, o.b);
    if (!o.np) { o.inner = nrm(num < 0 ? -o.a : o.a, o.b); o.val = nrm(sg * k[0] * o.inner[0], k[1] * o.inner[1]); }
    o.plain = (s.neg ? '-' : '') + (k[0] === k[1] ? '' : k[0] === -k[1] ? '-' : k[0] + (k[1] !== 1 ? '/' + k[1] : '')) + (n === 2 ? '' : n) + '√(' + (s.dp ? (num / den).toFixed(s.dp) : num + (den !== 1 ? '/' + den : '')) + ')';
    return o;
  }
  function rootSolution(o) {
    if (o.np) return 'The index ' + t(o.n) + ' is <b>even</b> and the radicand is negative. No real number ' + factorPhrase(o.n) + ' gives a negative result, so ' + t(o.expr) + ' is <b>not possible</b> (not a real number).';
    var s = o.num < 0 ? 'The index ' + t(o.n) + ' is odd, so a negative radicand is allowed. ' : '';
    s += t(powTex(o.inner, o.n, o.dp) + '=' + o.rad) + ', so ' + t(o.radical + '=' + valTex(o.inner, o.dp)) + '.';
    if (o.k[0] !== o.k[1] || o.neg) {
      var it = valTex(o.inner, o.dp), pin = o.inner[0] < 0 ? '(' + it + ')' : it, vt = valTex(o.val, o.dp);
      var mid = (o.neg || o.k[0] === -o.k[1]) ? '-' + pin : coefTex(o.k) + '\\times ' + pin;
      s += ' Then ' + t(o.expr + (mid === vt ? '' : '=' + mid) + '=' + vt) + '.';
    }
    return s;
  }
  function signWhy(o) {
    if (o.num < 0 && (o.neg || o.k[0] < 0)) return 'Two negatives here: the radical itself is negative (odd index, negative radicand), and the ' + (o.neg ? 'minus sign' : 'coefficient') + ' in front is negative too.';
    if (o.num < 0) return 'Check: ' + t(powTex(o.root, o.n, o.dp) + '=' + o.absRad) + ', not ' + t(o.rad) + '. Which number, used as a factor ' + o.n + ' times, gives a <b>negative</b> result?';
    if (o.neg || o.k[0] < 0) return 'The minus sign is <b>outside</b> the radical. Find ' + t(o.radical) + ' first, then apply the minus sign.';
    return 'The radical sign means the <b>principal</b> (positive) root, so the answer is positive.';
  }
  function rootHints(o, calc) {
    var h = ['Ask yourself: what number, ' + factorPhrase(o.n) + ', gives ' + t(o.rad) + '?'];
    if (calc) h.push('On your calculator: enter the index ' + t(o.n) + ', then ' + XKEY + ', then the radicand.');
    else if (o.den > 1 && !o.dp) h.push('Take the root of the numerator and the root of the denominator separately.');
    else if (o.k[0] !== o.k[1]) h.push('Take the root first, then multiply by the number in front.');
    else if (o.num < 0) h.push('An odd index allows a negative radicand; an even index does not.');
    return h;
  }
  /* typed answer (number box for integers, fraction box otherwise) */
  function rootTyped(s) {
    var o = rootSpec(s), V = o.val, Vx = V[0] / V[1], kx = o.k[0] / o.k[1], sg = o.neg ? -1 : 1, radX = o.num / o.den, innerX = o.inner[0] / o.inner[1];
    function diag(v) {
      if (Vx !== 0 && same(v, -Vx)) return { code: 'sign', hint: signWhy(o) };
      if (kx !== 1 && same(v, sg * innerX)) return { code: 'no-coef', hint: 'You found ' + t(o.radical + '=' + valTex(o.inner, o.dp)) + '. Now multiply by the coefficient ' + t(coefTex(o.k)) + ' in front.' };
      if (kx !== 1 && Number.isInteger(kx) && (same(v, kx + innerX) || same(v, kx - innerX))) return { code: 'added-coef', hint: 'A number written in front of a radical <b>multiplies</b> it: ' + t(coefTex(o.k) + o.radical) + ' means ' + t(coefTex(o.k) + '\\times ' + o.radical) + '.' };
      for (var idx = 2; idx <= 3; idx++) {
        if (idx === o.n || (radX < 0 && idx % 2 === 0)) continue;
        if (near(v, sg * kx * nroot(radX, idx))) return { code: 'wrong-index', hint: 'That’s the ' + nth(idx) + ' root' + (s.calc ? ' — check which root key you used' : '') + '. The index here is ' + t(o.n) + ': find the number that, ' + factorPhrase(o.n) + ', gives ' + t(o.rad) + '.' };
      }
      if (same(v, sg * kx * radX / o.n)) return { code: 'divided-index', hint: 'Taking a root isn’t dividing by the index. ' + t(o.radical) + ' is the number that, ' + factorPhrase(o.n) + ', gives ' + t(o.rad) + '.' };
      if (same(v, sg * kx * radX) && Math.abs(radX) !== 1) return { code: 'no-root', hint: 'You still need to take the ' + nth(o.n) + ' root of ' + t(o.rad) + '.' };
      if (o.den > 1 && !o.dp && same(v, sg * kx * (o.num < 0 ? -o.a : o.a) / o.den)) return { code: 'top-only', hint: 'You took the root of the numerator only. Take the ' + nth(o.n) + ' root of the denominator ' + t(F(o.den)) + ' too.' };
      if (o.den > 1 && !o.dp && same(v, sg * kx * o.num / o.b)) return { code: 'bottom-only', hint: 'You took the root of the denominator only. Take the ' + nth(o.n) + ' root of the numerator ' + t(F(Math.abs(o.num))) + ' too.' };
      return null;
    }
    var sol = rootSolution(o), hints = rootHints(o, s.calc), text = (s.calc ? 'calculator: ' : 'evaluate ') + o.plain, part;
    if (V[1] === 1 && !s.fraction) {
      part = P.number(t(o.expr), Vx, diag, sol, hints, text);
      part.answer = t(valTex(V)); part.bad = Vx !== 0 ? [String(-Vx)] : [];
    } else {
      part = P.fraction(t(o.expr), V, { diag: function (v) { return diag(v); } }, sol, hints, text);
      if (Math.abs(V[0]) > V[1] && V[1] > 1) {
        // a mixed number such as 3\frac{1}{2} is read as 3 × ½: catch it before it is marked wrong
        var chk0 = part.check;
        part.check = function (resp) {
          var a = K.read(resp), mv = a.res ? null : mixedVal(a.ast);
          if (mv != null && same(mv, Vx)) return form('mixed-num', 'Right value as a mixed number — but give it as an improper fraction ' + t('\\frac{a}{b}') + ' (here a mixed number would be read as a product).');
          return chk0(resp);
        };
      }
      part.good = [V[1] === 1 ? String(V[0]) : V[0] + '/' + V[1]];
      part.bad = [rTex([-V[0], V[1]])];
      if (V[0] !== 0 && Math.abs(V[0]) !== V[1]) part.bad.push(rTex(nrm(V[1], V[0])));
    }
    return part;
  }
  /* multiple choice with "not possible": right value + three diagnosed distractors */
  function rootMC(r, s) {
    var o = rootSpec(s), opts = [], seen = {}, absRoot = o.root;
    function add(html, right, why, code) { if (seen[html] || opts.length >= 4) return; seen[html] = 1; opts.push({ html: html, right: right, why: why, code: code }); }
    if (o.np) {
      add(NPH, true);
      add(t(rTex([-absRoot[0], absRoot[1]])), false, 'Check: ' + t(powTex([-absRoot[0], absRoot[1]], o.n) + '=' + o.absRad) + ' — positive, because an even number of negative factors multiplies to a positive. No real number raised to the power ' + o.n + ' is negative.', 'neg-root');
      add(t(rTex(absRoot)), false, 'Check: ' + t(powTex(absRoot, o.n) + '=' + o.absRad) + ', not ' + t(o.rad) + '. Can any real number, ' + factorPhrase(o.n) + ', give a negative result?', 'pos-root');
      add(t(pm(absRoot)), false, 'Both ' + t(rTex(absRoot)) + ' and ' + t(rTex([-absRoot[0], absRoot[1]])) + ' give ' + t(o.absRad) + ' (positive) when ' + factorPhrase(o.n) + '. Neither one gives ' + t(o.rad) + '.', 'pm');
    } else {
      var V = o.val;
      add(t(valTex(V)), true);
      var C = {
        sign: function () { if (V[0]) add(t(valTex([-V[0], V[1]])), false, signWhy(o), 'sign'); },
        np: function () {
          add(NPH, false, o.num < 0 ? 'The index ' + t(o.n) + ' is <b>odd</b>, so a negative radicand is allowed: an odd power of a negative number is negative. Only an <b>even</b> index needs a non-negative radicand.'
            : (o.neg || o.k[0] < 0) ? 'The radicand ' + t(o.rad) + ' is positive, so the root exists. The minus sign in front only makes the answer negative.'
              : 'The radicand ' + t(o.rad) + ' is positive, so the root exists: look for a number that, ' + factorPhrase(o.n) + ', gives ' + t(o.rad) + '.', 'np');
        },
        pm: function () {
          if (!V[0]) return;
          add(t(pm(V)), false, o.n % 2 === 0 ? 'The radical sign means only the <b>principal</b> (positive) root, so ' + t(o.radical) + ' stands for one number, not two.' + (o.neg || o.k[0] < 0 ? ' The minus sign in front then makes it negative.' : '')
            : 'An odd power keeps the sign: ' + t(powTex(absRoot, o.n) + '=' + o.absRad) + ' but ' + t(powTex([-absRoot[0], absRoot[1]], o.n) + '=-' + o.absRad) + '. So there is only one real ' + nth(o.n) + ' root.', 'pm');
        },
        coef: function () { if (o.k[0] !== o.k[1]) add(t(valTex(nrm((o.neg ? -1 : 1) * o.inner[0], o.inner[1]))), false, 'That’s ' + t(o.radical) + ' on its own. Now multiply it by the coefficient ' + t(coefTex(o.k)) + ' in front.', 'coef'); },
        flip: function () { if (o.den > 1 && V[0]) add(t(valTex(nrm(V[1], V[0]))), false, 'Upside down: the root of the numerator stays on top and the root of the denominator stays on the bottom.', 'flip'); }
      };
      (s.order || ['sign', 'np', 'pm', 'coef', 'flip']).forEach(function (c) { C[c](); });
      ['sign', 'np', 'pm', 'coef', 'flip'].forEach(function (c) { C[c](); });
    }
    var p = mcPart(r, t(o.expr), opts, rootSolution(o), rootHints(o, s.calc), (s.calc ? 'calculator: ' : 'evaluate ') + o.plain);
    p.input.columns = 2;
    return p;
  }

  /* ---------- rounded values ---------- */
  function altDiag(dp, alts) {
    return function (v) {
      for (var i = 0; i < alts.length; i++) { var a = alts[i]; if (isFinite(a.x) && Math.abs(v - K.roundTo(a.x, dp)) < 1e-9) return { code: a.code, hint: a.hint }; }
      return null;
    };
  }
  function approxPart(expr, x, dp, alts, sol, hints, text, opt) {
    opt = opt || {};
    var p = P.approx(t(expr), x, dp, { diag: altDiag(dp, alts), nr: opt.nr }, sol, hints, text);
    p.bad = alts.filter(function (a) { return isFinite(a.x) && Math.abs(K.roundTo(a.x, dp) - K.roundTo(x, dp)) > 1e-9; }).map(function (a) { return K.roundTo(a.x, dp).toFixed(dp); });
    return p;
  }
  function idxHint(used, n, calc) { return 'That’s the ' + nth(used) + ' root. The index here is ' + t(n) + (calc ? ': enter ' + t(n) + ', then ' + XKEY + ', then the radicand.' : '.'); }

  /* ---------- one radical √x (Q9) ---------- */
  function strip(a) { while (a && a.t === 'paren') a = a.a; return a; }
  function singleRad(m, diag) {
    var T = Math.sqrt(m);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var ast = strip(a.ast), sh = ex.shape(a.ast);
      if (ex.eq(a.val, T)) {
        if (ast.t === 'root') {
          var n = ex.rat(ast.n);
          if (!n || n[0] !== 2 || n[1] !== 1) return form('index-2', 'Right value — but write it as a <b>square</b> root, ' + t('\\sqrt{x}') + '.');
          var inner = strip(ast.a);
          if (inner.t === 'num' && !inner.dec) return ok();
          return form('multiply-out', 'Right idea — now work out the radicand, so there is a single whole number under the root: ' + t('\\sqrt{x}') + '.');
        }
        var q = ex.rat(a.ast); if (q && q[1] === 1) return ok();
        var rd = ex.radical(a.ast);
        if (rd && rd.n === 2 && (rd.k[0] !== 1 || rd.k[1] !== 1)) return form('mixed-rad', 'Right value, but the question asks for one radical ' + t('\\sqrt{x}') + ' with nothing in front. Move ' + t(rTex(rd.k)) + ' back inside: it becomes ' + t(rTex([rd.k[0] * rd.k[0], rd.k[1] * rd.k[1]])) + ' under the root.');
        return form('one-radical', 'Right value — now write it as one radical, ' + t('\\sqrt{x}') + '.');
      }
      if (sh.decimals && !sh.roots && Math.abs(a.val - T) < 0.01 * T) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> answer as a radical ' + t('\\sqrt{x}') + '.');
      if (!isFinite(a.val)) return wrong('undefined', null);
      var M = a.val > 0 && Math.abs(a.val * a.val - Math.round(a.val * a.val)) < 1e-6 ? Math.round(a.val * a.val) : null;
      var h = diag ? diag(M, a.val) : null;
      if (h) return wrong(h.code, h.hint);
      return wrong('value', null);
    };
  }
  function singlePart(prompt, m, diag, sol, hints, text, bad, good) {
    var p = P.math(t(prompt), singleRad(m, diag), '\\sqrt{' + m + '}', sol, hints, text, { keys: 'radical' });
    p.good = ['sqrt(' + m + ')'].concat(good || []); p.bad = bad || [];
    return p;
  }
  function productDiag(a, b) {
    return function (M) {
      if (M === a + b) return { code: 'added', hint: 'The product rule multiplies the radicands: ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '. Don’t add them.' };
      var sa = Math.round(Math.sqrt(a)), sb = Math.round(Math.sqrt(b));
      if ((sb * sb === b && M === a * sb) || (sa * sa === a && M === b * sa)) return { code: 'root-first', hint: 'You mixed a root with a radicand. ' + (sb * sb === b ? t('\\sqrt{' + b + '}=' + sb) : t('\\sqrt{' + a + '}=' + sa)) + ', so to put it back under the radical you need ' + t(sb * sb === b ? b : a) + ', not ' + t(sb * sb === b ? sb : sa) + '. Multiply the radicands as they are.' };
      return null;
    };
  }

  /* ---------- a product of two radicals (Q10) ---------- */
  function twoRadicals(nv) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var fs = [];
      (function flat(x) { x = strip(x); if (x.t === 'mul') { flat(x.a); flat(x.b); } else fs.push(x); })(a.ast);
      var roots = fs.filter(function (f) { return f.t === 'root'; });
      if (roots.length === 2 && fs.length === 2) {
        var ri = roots.map(function (f) { var n = ex.rat(f.n), m = ex.rat(f.a); return n && m && n[1] === 1 && m[1] === 1 ? { n: n[0], m: m[0] } : null; });
        if (ri[0] && ri[1] && ri[0].n === 2 && ri[1].n === 2) {
          var x = ri[0].m, y = ri[1].m;
          if (x * y === nv) { if (x === 1 || y === 1) return form('trivial', 'True, but too easy: use two factors of ' + t(nv) + ' that are both bigger than ' + t('1') + '.'); return ok(); }
          if (x + y === nv) return wrong('added', t(x + '+' + y + '=' + nv) + ', but the radicands have to <b>multiply</b> to ' + t(nv) + ': ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '.');
          return wrong('value', t('\\sqrt{' + x + '}\\times\\sqrt{' + y + '}=\\sqrt{' + (x * y) + '}') + ', not ' + t('\\sqrt{' + nv + '}') + '. Find two numbers that multiply to ' + t(nv) + '.');
        }
      }
      if (ex.eq(a.val, Math.sqrt(nv))) return form('two-radicals', 'Right value — now write it as a product of <b>two</b> square roots, ' + t('\\sqrt{a}\\times\\sqrt{b}') + '.');
      return wrong('value', null);
    };
  }
  function twoPart(nv, p, q) {
    var key = '\\sqrt{' + p + '}\\sqrt{' + q + '}';
    var pt = P.math(t('\\sqrt{' + nv + '}'), twoRadicals(nv), key,
      t(nv + '=' + p + '\\times ' + q) + ', so ' + t('\\sqrt{' + nv + '}=\\sqrt{' + p + '\\times ' + q + '}=' + key) + '.' + (p === q ? ' (This one is also ' + t(p) + ', since ' + t('\\sqrt{' + p + '}\\times\\sqrt{' + p + '}=' + p) + '.)' : ''),
      ['Write ' + t(nv) + ' as a product of two whole numbers (not using ' + t('1') + ').', 'Then use ' + t('\\sqrt{ab}=\\sqrt{a}\\times\\sqrt{b}') + '.'], 'product of two radicals: √' + nv, { keys: 'radical' });
    pt.good = ['\\sqrt{' + q + '}\\times\\sqrt{' + p + '}', 'sqrt(' + p + ')*sqrt(' + q + ')'];
    pt.bad = ['\\sqrt{1}\\sqrt{' + nv + '}', '\\sqrt{' + nv + '}', String(p) + '\\sqrt{' + q + '}'];
    return pt;
  }

  /* ---------- several-statement multiple choice (Q11, Extra 20) ---------- */
  function statementsMC(r, intro, st, combos, otherLabel, text) {
    // st: [{label, html, truth, reason}], combos: [[labels…]] for A–C, D = "some other combination"/listed
    var truthSet = st.filter(function (s) { return s.truth; }).map(function (s) { return s.label; }).join(',');
    var opts = combos.map(function (c) {
      var right = c.join(',') === truthSet, why = null;
      if (!right) for (var i = 0; i < st.length; i++) { var s = st[i], inC = c.indexOf(s.label) >= 0; if (inC !== s.truth) { why = 'Look again at statement ' + s.label + '. ' + s.reason; break; } }
      return { html: c.join(', ').replace(/, ([^,]+)$/, ' and $1') + ' only', right: right, why: why };
    });
    if (otherLabel) {
      var anyRight = opts.some(function (o) { return o.right; });
      opts.push({ html: otherLabel, right: !anyRight, why: anyRight ? 'One of the listed combinations matches exactly. Decide true or false for each statement separately.' : null });
    }
    var prompt = intro + '<br>' + st.map(function (s) { return '<b>' + s.label + (/\)$/.test(s.label) ? '' : '.') + '</b> ' + s.html; }).join('<br>') + '<br>Which of the statements above are <b>true</b>?';
    var sol = st.map(function (s) { return '<b>' + s.label + (/\)$/.test(s.label) ? '' : '.') + '</b> ' + s.reason + ' <b>' + (s.truth ? 'True' : 'False') + '.</b>'; }).join('<br>');
    return mcPart(r, prompt, opts, sol, ['Decide true or false for each statement on its own, then find the matching choice.'], text, true);
  }

  /* ---------- ordering ---------- */
  function orderPart(r, prompt, items, sol, text) {
    return P.order(r, prompt, items, {
      why: function (x, y) {
        var X = items.filter(function (i) { return i.id === x; })[0], Y = items.filter(function (i) { return i.id === y; })[0];
        return t(X.tex) + ' and ' + t(Y.tex) + ' are in the wrong order. Simplify both first: ' + t(X.tex + (X.exact ? '=' : '\\approx ') + X.vt) + ' and ' + t(Y.tex + (Y.exact ? '=' : '\\approx ') + Y.vt) + '.';
      }
    }, sol, ['Simplify each radical you can. Bracket the others between two integers.', 'Place the negatives first.'], text);
  }

  HW.defineLesson({
    id: 'u1l5', unit: 1, num: '5', title: 'Roots of Real Numbers', outcome: 'AN2',
    blurb: 'Square roots, cube roots and roots of any index — when a root is (and isn’t) a real number, radical vocabulary, and the product and quotient rules.',
    questions: [
      { num: '1', section: 'Part A — Evaluating Radicals', stem: 'Mentally evaluate, where possible, using the real number system.', parts: [
        { id: '1a', level: 'LIM', outcome: 'AN1', make: function (r) { var s = r.int(11, 15); return rootTyped({ n: 2, num: s * s }); } },
        { id: '1b', level: 'BEG', make: function (r) { var s = r.int(3, 6); return rootTyped({ n: 4, num: ipow(s, 4) }); } },
        { id: '1c', level: 'BEG', outcome: 'AN1', make: function (r) { var s = r.int(2, 6), k = r.int(2, 6); return rootTyped({ n: 3, num: s * s * s, k: k }); } },
        { id: '1d', level: 'BEG', make: function (r) { var s = r.int(3, 7); return rootTyped({ n: 5, num: ipow(s, 5) }); } },
        { id: '1e', level: 'BEG', make: function (r) { var ab = r.pick([[3, 7], [2, 5], [4, 9], [5, 8], [3, 10], [2, 9], [5, 6], [7, 10], [4, 11], [6, 7]]); return rootTyped({ n: 2, num: ab[0] * ab[0], den: ab[1] * ab[1], fraction: true }); } },
        { id: '1f', level: 'EMG', make: function (r) { var b = r.int(2, 5); return rootTyped({ n: 4, num: 1, den: ipow(b, 4), fraction: true }); } },
        { id: '1g', level: 'EMG', make: function (r) { var b = r.int(3, 9), k = r.chance(0.4) ? b : r.pick([2, 3, 4, 6, 8, 10, 12].filter(function (x) { return x !== b; })); return rootTyped({ n: 2, num: 1, den: b * b, k: k, fraction: true }); } },
        { id: '1h', level: 'BEG', outcome: 'AN1', make: function (r) { var s = r.int(2, 12); return rootMC(r, { n: 2, num: s * s, neg: true }); } },
        { id: '1i', level: 'EMG', make: function (r) { var s = r.int(2, 9); return rootMC(r, { n: 2, num: -s * s }); } },
        { id: '1j', level: 'EMG', make: function (r) { var c = r.pick([[5, 2], [5, 3], [7, 2], [3, 4], [3, 5]]); return rootMC(r, { n: c[0], num: -ipow(c[1], c[0]) }); } },
        { id: '1k', level: 'EMG', outcome: 'AN1', make: function (r) { var s = r.int(2, 5), k = r.int(2, 6); return rootMC(r, { n: 3, num: -s * s * s, k: k, order: ['sign', 'np', 'coef'] }); } },
        { id: '1l', level: 'PRG', make: function (r) { var c = r.pick([[4, 3], [4, 2], [4, 5], [6, 2], [4, 4]]); return rootMC(r, { n: c[0], num: -1, den: ipow(c[1], c[0]) }); } },
        { id: '1m', level: 'BEG', outcome: 'AN1', make: function (r) { var s = r.int(11, 15), k = r.int(2, 9); return rootTyped({ n: 2, num: s * s, k: k }); } },
        { id: '1n', level: 'EMG', make: function (r) { var s = r.pick([2, 3]), k = r.pick([2, 3, 4, 5, 6].filter(function (x) { return x !== s || r.chance(0.6); })); return rootTyped({ n: 5, num: ipow(s, 5), k: [1, k], fraction: true }); } },
        { id: '1o', level: 'PRG', make: function (r) { var c = r.pick([[9, 1], [7, 1], [5, 1], [11, 1], [5, 2], [3, 3]]); return rootMC(r, { n: c[0], num: -ipow(c[1], c[0]), neg: true }); } },
        { id: '1p', level: 'PRG', make: function (r) { var ab = r.pick([[3, 4], [2, 3], [2, 5], [1, 4], [3, 5], [4, 5], [5, 6]]); return rootMC(r, { n: 3, num: -ipow(ab[0], 3), den: ipow(ab[1], 3), order: ['sign', 'np', 'flip'] }); } }] },
      { num: '2', stem: 'State whether each statement is true or false.',
        shared: function (r) { var s = r.int(4, 12); return { s: s, n: s * s }; },
        parts: [
          { id: '2a', level: 'BEG', outcome: 'AN1', make: function (r, sh) {
            return tf(r, 'The square roots of ' + t(sh.n) + ' are ' + t('\\pm ' + sh.s) + '.', true, 'Check: ' + t(sh.s + '^{2}=' + sh.n) + ' and ' + t('(-' + sh.s + ')^{2}=' + sh.n) + '. Both are square roots of ' + t(sh.n) + '.',
              t(sh.s + '^{2}=' + sh.n) + ' and ' + t('(-' + sh.s + ')^{2}=' + sh.n) + ', so ' + t(sh.n) + ' has two square roots, ' + t('\\pm ' + sh.s) + '. <b>True.</b>', ['Square each of ' + t(sh.s) + ' and ' + t(-sh.s) + '.'], 'square roots of ' + sh.n + ' are ±' + sh.s);
          } },
          { id: '2b', level: 'EMG', outcome: 'AN1', make: function (r, sh) {
            return tf(r, t('\\sqrt{' + sh.n + '}=\\pm ' + sh.s), false, 'The symbol ' + t('\\sqrt{\\ }') + ' means the <b>principal</b> (positive) square root only — one number, not two.',
              t('\\sqrt{\\ }') + ' always means the principal (positive) root, so ' + t('\\sqrt{' + sh.n + '}=' + sh.s) + ' only. <b>False.</b>', ['Is ' + t('\\sqrt{' + sh.n + '}') + ' one number or two?'], '√' + sh.n + ' = ±' + sh.s);
          } },
          { id: '2c', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return tf(r, 'If ' + t('x^{2}=' + sh.n + ',\\ x\\in R') + ', then ' + t('x=\\pm ' + sh.s) + '.', true, 'This is an <b>equation</b>: any real number whose square is ' + t(sh.n) + ' is a solution, and ' + t('(-' + sh.s + ')^{2}=' + sh.n) + ' too.',
              'Solving the equation ' + t('x^{2}=' + sh.n) + ' asks for <i>every</i> number whose square is ' + t(sh.n) + ': ' + t(sh.s + '^{2}=' + sh.n) + ' and ' + t('(-' + sh.s + ')^{2}=' + sh.n) + '. So ' + t('x=\\pm ' + sh.s) + '. <b>True.</b> (Only the symbol ' + t('\\sqrt{\\ }') + ' is restricted to the positive root.)',
              ['Try ' + t('x=-' + sh.s) + ' in the equation.'], 'x²=' + sh.n + ' → ±' + sh.s);
          } }] },
      { num: '3', stem: 'Use a calculator to evaluate.',
        shared: function (r) { return { s4: r.int(12, 16) }; },
        parts: [
          { id: '3a', level: 'BEG', make: function (r) { return rootTyped({ n: 4, num: ipow(r.int(7, 13), 4), calc: true }); } },
          { id: '3b', level: 'BEG', make: function (r) { return rootTyped({ n: 5, num: -ipow(r.int(3, 6), 5), calc: true }); } },
          { id: '3c', level: 'EMG', make: function (r, sh) { return rootTyped({ n: 4, num: ipow(sh.s4, 4), neg: true, calc: true }); } },
          { id: '3d', level: 'BEG', outcome: 'AN1', make: function (r) { return rootTyped({ n: 3, num: ipow(r.int(9, 14), 3), neg: true, calc: true }); } },
          { id: '3e', level: 'BEG', outcome: 'AN1', make: function (r) { return rootTyped({ n: 3, num: -ipow(r.int(12, 19), 3), calc: true }); } },
          { id: '3f', level: 'EMG', make: function (r) { var s = r.int(4, 8), m = r.chance(0.5) ? 1 : r.int(2, 3); return rootTyped({ n: 4, num: 1, den: ipow(s, 4), k: -m * s, calc: true }); } },
          { id: '3g', level: 'PRG', make: function (r) {
            var c = r.pick([[2, 5], [2, 10], [2, 15], [5, 2], [5, 4], [5, 6], [4, 5], [4, 10], [3, 10]]); // [tenths of the root, coefficient]
            return rootTyped({ n: 6, num: ipow(c[0], 6), den: 1000000, dp: 6, k: c[1], calc: true });
          } },
          { id: '3h', level: 'PRG', make: function (r, sh) { var p = rootMC(r, { n: 4, num: -ipow(sh.s4, 4), calc: true }); p.solution += ' (The calculator shows an error.)'; return p; } },
          { id: '3i', level: 'PRG', make: function (r) {
            var ab = r.pick([[3, 5], [2, 3], [2, 5], [3, 4], [3, 7], [4, 5]]), m = r.chance(0.5) ? 1 : 2;
            return rootTyped({ n: 4, num: ipow(ab[0], 4), den: ipow(ab[1], 4), k: [m * ab[1], ab[0]], calc: true });
          } }] },
      { num: '4', stem: 'Evaluate to the nearest hundredth.', parts: [
        { id: '4a', level: 'BEG', make: function (r) {
          var n = nonPerfect(r, 11, 99, 2), x = Math.sqrt(n);
          return approxPart('\\sqrt{' + n + '}', x, 2, [{ x: n / 2, code: 'divided-index', hint: 'A square root isn’t half the number: ' + t('\\sqrt{' + n + '}') + ' is the number that multiplies by itself to give ' + t(n) + '.' }],
            t('\\sqrt{' + n + '}=' + dots(x) + '\\approx ' + x.toFixed(2)) + '.', ['Use the ' + t('\\sqrt{\\ }') + ' key, then round to two decimal places.'], 'nearest hundredth √' + n);
        } },
        { id: '4b', level: 'EMG', make: function (r) {
          var n = r.pick([6, 7, 8, 8, 9]), m = nonPerfect(r, 20, 99, n), x = nroot(m, n), e = rt(n, m);
          return approxPart(e, x, 2, [{ x: Math.sqrt(m), code: 'wrong-index', hint: idxHint(2, n, true) }, { x: Math.cbrt(m), code: 'wrong-index', hint: idxHint(3, n, true) }, { x: m / n, code: 'divided-index', hint: 'Taking a root isn’t dividing by the index. Use ' + XKEY + '.' }, { x: Math.pow(m, n), code: 'wrong-index', hint: 'That’s a power, not a root. Enter the index first, then ' + XKEY + ', then the radicand.' }],
            t(e + '=' + dots(x) + '\\approx ' + x.toFixed(2)) + '. (Enter ' + t(n) + ', then the ' + t('\\sqrt[x]{\\ }') + ' key, then ' + t(m) + '.)', ['Enter the index ' + t(n) + ' first, then ' + XKEY + ', then ' + t(m) + '.'], 'nearest hundredth ' + n + '√' + m);
        } },
        { id: '4c', level: 'PRG', make: function (r) {
          var c = r.pick([[4, 3], [3, 2], [5, 4], [2, 3], [3, 4], [5, 2]]), n = r.pick([5, 7, 7]), m = nonPerfect(r, 200, 900, n), k = c[0] / c[1];
          var x = k * nroot(m, n), e = '-' + rTex(c) + rt(n, '-' + m);
          return approxPart(e, x, 2, [
            { x: nroot(k * m, n), code: 'coef-inside', hint: 'The coefficient multiplies the root — it doesn’t go under the radical. Find ' + t(rt(n, '-' + m)) + ' first, then multiply by ' + t('-' + rTex(c)) + '.' },
            { x: -nroot(-m, n), code: 'no-coef', hint: 'Don’t forget to multiply by the coefficient ' + t('-' + rTex(c)) + '.' },
            { x: k * nroot(m, 3), code: 'wrong-index', hint: idxHint(3, n, true) },
            { x: (1 / k) * nroot(m, n), code: 'flip', hint: 'Check the coefficient: it is ' + t(rTex(c)) + ', not ' + t(rTex([c[1], c[0]])) + '.' }],
            t(rt(n, '-' + m) + '=' + dots(nroot(-m, n))) + ' (odd index, so it is negative). Then ' + t('-' + rTex(c) + '\\times(' + dots(nroot(-m, n)) + ')=' + dots(x) + '\\approx ' + x.toFixed(2)) + '.',
            ['Find the root first (odd index: a negative radicand gives a negative root), then multiply by the coefficient.', 'Two negatives multiply to a positive.'], 'nearest hundredth ' + e);
        } }] },
      { num: '5', stem: 'Evaluate to the nearest tenth.', parts: [
        { id: '5a', level: 'EMG', make: function (r) {
          var m = nonPerfect(r, 20, 200, 5), x = nroot(-m, 5), e = rt(5, '-' + m);
          return approxPart(e, x, 1, [{ x: nroot(-m, 3), code: 'wrong-index', hint: idxHint(3, 5, true) }, { x: -m / 5, code: 'divided-index', hint: 'Taking a root isn’t dividing by the index. Use ' + XKEY + '.' }],
            'The index is odd, so the root is negative: ' + t(e + '=' + dots(x) + '\\approx ' + x.toFixed(1)) + '.', ['Enter ' + t('5') + ', then ' + XKEY + ', then ' + t('(-)' + m) + '.', 'An odd root of a negative number is negative.'], 'nearest tenth ' + e);
        } },
        { id: '5b', level: 'PRG', make: function (r) {
          var k = r.int(2, 6), m = nonPerfect(r, 100, 900, 4), x = -k * nroot(m, 4), e = '-' + k + rt(4, m);
          return approxPart(e, x, 1, [{ x: -k * Math.sqrt(m), code: 'wrong-index', hint: idxHint(2, 4, true) }, { x: -nroot(k * m, 4), code: 'coef-inside', hint: 'The ' + t(-k) + ' multiplies the root — it doesn’t go under the radical.' }, { x: -nroot(m, 4), code: 'no-coef', hint: 'Don’t forget to multiply by ' + t(-k) + '.' }],
            t(rt(4, m) + '=' + dots(nroot(m, 4))) + ', so ' + t(e + '=-' + k + '\\times ' + dots(nroot(m, 4)) + '=' + dots(x) + '\\approx ' + x.toFixed(1)) + '.', ['Find ' + t(rt(4, m)) + ' first, then multiply by ' + t(-k) + '.'], 'nearest tenth ' + e);
        } },
        { id: '5c', level: 'PRG', make: function (r) {
          var c = r.pick([[2, 3], [3, 4], [3, 2], [4, 5], [5, 3]]), m = nonPerfect(r, 20, 200, 3), k = c[0] / c[1], x = k * nroot(-m, 3), e = rTex(c) + rt(3, '-' + m);
          return approxPart(e, x, 1, [{ x: nroot(-k * m, 3), code: 'coef-inside', hint: 'The coefficient multiplies the root — it doesn’t go under the radical.' }, { x: nroot(-m, 3), code: 'no-coef', hint: 'Don’t forget to multiply by ' + t(rTex(c)) + '.' }, { x: nroot(-m, 3) / k, code: 'flip', hint: 'Multiply by ' + t(rTex(c)) + ' — don’t divide by it.' }],
            t(rt(3, '-' + m) + '=' + dots(nroot(-m, 3))) + ', so ' + t(e + '=' + rTex(c) + '\\times(' + dots(nroot(-m, 3)) + ')=' + dots(x) + '\\approx ' + x.toFixed(1)) + '.' + (Math.abs(K.roundTo(x, 1) - Math.round(x)) < 1e-9 ? ' (Keep the zero: the nearest tenth is ' + t(x.toFixed(1)) + '.)' : ''),
            ['Find the cube root first (negative, since the index is odd), then multiply by ' + t(rTex(c)) + '.'], 'nearest tenth ' + e);
        } }] },
      { num: '6', section: 'Part B — Radical Vocabulary', stem: 'Identify the index and the radicand.', parts: [
        { id: '6a', level: 'LIM', make: function (r) { var n = r.pick([3, 5, 7, 9]), m = nonPerfect(r, 10, 99, n); return vocabPart(n, m, 1); } },
        { id: '6b', level: 'BEG', make: function (r) { var n = r.pick([4, 6, 8]), m = r.pick([16, 25, 36, 49, 81, 100].filter(function (v) { return !isPerfect(v, n); })); return vocabPart(n, m, 1); } },
        { id: '6c', level: 'EMG', make: function (r) { return vocabPart(2, nonPerfect(r, 11, 47, 2), r.int(2, 9)); } }] },
      { num: '7', stem: 'The meaning of the index.', parts: [
        { id: '7', level: 'PRG', make: function (r) {
          var n = r.pick([4, 5, 6, 6, 7]), m = nonPerfect(r, 20, 99, n), e = rt(n, m), dv = Math.round(m / n * 100) / 100;
          return mcPart(r, 'Which statement explains the meaning of the index ' + t(n) + ' in the radical ' + t(e) + '?', [
            { html: t(e) + ' must be used as a <b>factor</b> ' + n + ' times to give ' + t(m) + ': ' + t('\\left(' + e + '\\right)^{' + n + '}=' + m) + '.', right: true },
            { html: 'Divide ' + t(m) + ' by ' + t(n) + ': ' + t(e + '=' + m + '\\div ' + n) + '.', why: 'Test it: ' + t(m + '\\div ' + n + (Number.isInteger(m / n) ? '=' : '\\approx ') + dv) + ', and ' + t(dv + '^{' + n + '}') + ' is far more than ' + t(m) + '. The index counts equal <b>factors</b>, not equal parts.' },
            { html: 'Multiply ' + t(m) + ' by itself ' + n + ' times.', why: 'That would be the power ' + t(m + '^{' + n + '}') + ' — a root goes the other way: it finds the number whose ' + nth(n) + ' power is ' + t(m) + '.' },
            { html: 'The radical means ' + t(n + '\\times\\sqrt{' + m + '}') + '.', why: 'A number that multiplies a radical sits <b>in front</b> of it (a coefficient, like the 7 in ' + t('7\\sqrt{23}') + '). The index sits in the notch of the radical sign.' }],
            'The index ' + t(n) + ' tells us that ' + t(e) + ' is used as a factor ' + n + ' times to produce ' + t(m) + ': ' + t('\\left(' + e + '\\right)^{' + n + '}=' + m) + '.', ['Think of ' + t('\\sqrt[3]{8}=2') + ': ' + t('2\\times 2\\times 2=8') + '. What does the 3 count?'], 'meaning of index ' + n);
        } }] },
      { num: '8', section: 'Part C — Products and Quotients of Radicals', stem: 'Determine whether each statement is true or false.', parts: [
        { id: '8a', level: 'EMG', make: function (r) {
          var ab = r.pick([[7, 8], [3, 5], [6, 7], [2, 11], [5, 6], [3, 10], [7, 5]]), p = ab[0] * ab[1];
          return tf(r, t('\\sqrt{' + p + '}=\\sqrt{' + ab[0] + '}\\sqrt{' + ab[1] + '}'), true, 'The product rule: ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '. What is ' + t(ab[0] + '\\times ' + ab[1]) + '?',
            t('\\sqrt{' + ab[0] + '}\\sqrt{' + ab[1] + '}=\\sqrt{' + ab[0] + '\\times ' + ab[1] + '}=\\sqrt{' + p + '}') + '. <b>True.</b>', ['Use ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '.'], '√' + p + ' = √' + ab[0] + '√' + ab[1]);
        } },
        { id: '8b', level: 'EMG', make: function (r) {
          var a = r.int(3, 10), b = r.int(2, a - 1), A = a * a, B = b * b, d = A - B;
          return tf(r, t('\\sqrt{' + A + '-' + B + '}=\\sqrt{' + A + '}-\\sqrt{' + B + '}'), false, 'Test it: ' + t('\\sqrt{' + A + '-' + B + '}=\\sqrt{' + d + '}' + (isPerfect(d, 2) ? '=' + Math.sqrt(d) : '\\approx ' + Math.sqrt(d).toFixed(2))) + ', but ' + t('\\sqrt{' + A + '}-\\sqrt{' + B + '}=' + a + '-' + b + '=' + (a - b)) + '.',
            t('\\sqrt{' + A + '-' + B + '}=\\sqrt{' + d + '}' + (isPerfect(d, 2) ? '=' + Math.sqrt(d) : '\\approx ' + Math.sqrt(d).toFixed(2))) + ', but ' + t(a + '-' + b + '=' + (a - b)) + '. A root of a difference is <b>not</b> the difference of the roots. <b>False.</b>', ['Work out each side separately.'], '√(' + A + '−' + B + ') = √' + A + '−√' + B);
        } },
        { id: '8c', level: 'EMG', make: function (r) {
          var k = r.int(2, 7), b = r.pick([5, 6, 10, 11, 13, 15].filter(function (x) { return x !== k; })), a = k * b;
          return tf(r, t('\\sqrt{' + k + '}=\\dfrac{\\sqrt{' + a + '}}{\\sqrt{' + b + '}}'), true, 'The quotient rule: ' + t('\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}') + '. What is ' + t(a + '\\div ' + b) + '?',
            t('\\dfrac{\\sqrt{' + a + '}}{\\sqrt{' + b + '}}=\\sqrt{\\dfrac{' + a + '}{' + b + '}}=\\sqrt{' + k + '}') + '. <b>True.</b>', ['Use ' + t('\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}') + '.'], '√' + k + ' = √' + a + '/√' + b);
        } },
        { id: '8d', level: 'PRG', make: function (r) {
          var bc = r.pick([[9, 4], [4, 9], [16, 4], [9, 16], [25, 4], [4, 25], [16, 9]]), b = bc[0], c = bc[1], a = b * c;
          return tf(r, t('\\dfrac{\\sqrt{' + a + '}}{\\sqrt{' + b + '}}=\\sqrt{' + b + '}'), false, 'Divide the radicands: ' + t('\\dfrac{\\sqrt{' + a + '}}{\\sqrt{' + b + '}}=\\sqrt{\\dfrac{' + a + '}{' + b + '}}') + '. Is that ' + t('\\sqrt{' + b + '}') + '?',
            t('\\dfrac{\\sqrt{' + a + '}}{\\sqrt{' + b + '}}=\\sqrt{\\dfrac{' + a + '}{' + b + '}}=\\sqrt{' + c + '}=' + Math.sqrt(c)) + ', not ' + t('\\sqrt{' + b + '}=' + Math.sqrt(b)) + '. <b>False.</b>', ['Use the quotient rule, or evaluate both sides: both radicands are perfect squares.'], '√' + a + '/√' + b + ' = √' + b);
        } },
        { id: '8e', level: 'PRG', make: function (r) {
          var a = r.pick([2, 3, 5, 6, 7, 10]);
          return tf(r, t('\\sqrt{' + a + '}+\\sqrt{' + a + '}=\\sqrt{' + (2 * a) + '}'), false, 'Test with decimals: ' + t('\\sqrt{' + a + '}+\\sqrt{' + a + '}\\approx ' + (2 * Math.sqrt(a)).toFixed(2)) + ', but ' + t('\\sqrt{' + 2 * a + '}\\approx ' + Math.sqrt(2 * a).toFixed(2)) + '. The rules work for × and ÷, not for +.',
            t('\\sqrt{' + a + '}+\\sqrt{' + a + '}=2\\sqrt{' + a + '}\\approx ' + (2 * Math.sqrt(a)).toFixed(2)) + ', but ' + t('\\sqrt{' + 2 * a + '}\\approx ' + Math.sqrt(2 * a).toFixed(2)) + '. A sum of roots is not the root of the sum. <b>False.</b>', ['Use a calculator to compare both sides.'], '√' + a + '+√' + a + ' = √' + 2 * a);
        } },
        { id: '8f', level: 'EMG', make: function (r) {
          var a = r.pick([2, 3, 5, 6, 7, 10, 11]);
          return tf(r, t('\\sqrt{' + a + '}\\times\\sqrt{' + a + '}=\\sqrt{' + (a * a) + '}'), true, 'The product rule: ' + t('\\sqrt{' + a + '}\\times\\sqrt{' + a + '}=\\sqrt{' + a + '\\times ' + a + '}') + '.',
            t('\\sqrt{' + a + '}\\times\\sqrt{' + a + '}=\\sqrt{' + a + '\\times ' + a + '}=\\sqrt{' + a * a + '}') + ' (which is ' + t(a) + '). <b>True.</b>', ['Use ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '.'], '√' + a + '×√' + a + ' = √' + a * a);
        } },
        { id: '8g', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 4, 5]), j = r.pick([9, 4, 16, 5, 6, 7].filter(function (x) { return x !== k; })), m = k * j;
          return tf(r, t('\\sqrt{\\dfrac{1}{' + k + '}\\times ' + m + '}=\\sqrt{' + j + '}'), true, 'Work out the radicand first: ' + t('\\dfrac{1}{' + k + '}\\times ' + m) + ' is just ' + t(m + '\\div ' + k) + '.',
            t('\\dfrac{1}{' + k + '}\\times ' + m + '=' + j) + ', so both sides are ' + t('\\sqrt{' + j + '}') + '. <b>True.</b>', ['Simplify what is under the radical first.'], '√(1/' + k + '×' + m + ') = √' + j);
        } },
        { id: '8h', level: 'ADV', make: function (r) {
          var k = r.pick([2, 3, 4]), j = r.pick([9, 4, 16, 5, 6, 7].filter(function (x) { return x !== k; })), m = k * j, q = nrm(m, k * k);
          return tf(r, t('\\dfrac{1}{' + k + '}\\sqrt{' + m + '}=\\sqrt{' + j + '}'), false, 'Here the ' + t('\\dfrac{1}{' + k + '}') + ' is <b>outside</b> the radical. Compare with decimals: ' + t('\\dfrac{1}{' + k + '}\\sqrt{' + m + '}\\approx ' + (Math.sqrt(m) / k).toFixed(2)) + ' and ' + t('\\sqrt{' + j + '}\\approx ' + Math.sqrt(j).toFixed(2)) + '.',
            'The ' + t('\\dfrac{1}{' + k + '}') + ' is outside the radical. To move it inside it must be squared: ' + t('\\dfrac{1}{' + k + '}\\sqrt{' + m + '}=\\sqrt{\\dfrac{' + m + '}{' + k * k + '}}=\\sqrt{' + rTex(q) + '}\\approx ' + (Math.sqrt(m) / k).toFixed(2)) + ', but ' + t('\\sqrt{' + j + '}\\approx ' + Math.sqrt(j).toFixed(2)) + '. <b>False.</b>',
            ['Is the fraction inside or outside the radical this time? Compare with part (g).'], '1/' + k + '√' + m + ' = √' + j);
        } }] },
      { num: '9', stem: 'Write as a single radical in the form ' + t('\\sqrt{x}') + '.', parts: [
        { id: '9a', level: 'BEG', make: function (r) { var a = r.pick([2, 3, 5, 6, 7, 10, 11]), b = r.pick([4, 9, 16, 25]); return prodPart(a, b); } },
        { id: '9b', level: 'BEG', make: function (r) { var c = r.pick([2, 3, 5]), j = r.pick([3, 5, 7].filter(function (x) { return x !== c; })); return prodPart(c * j, c); } },
        { id: '9c', level: 'BEG', make: function (r) { var s = r.pick([4, 9, 16, 25]), p = r.pick([2, 3, 5, 7, 11, 13]); return prodPart(s, p); } },
        { id: '9d', level: 'BEG', make: function (r) { var a = r.pick([8, 12, 18, 20, 24, 27]), b = r.pick([4, 9].filter(function (x) { return !isPerfect(a * x, 2); })); return prodPart(a, b); } },
        { id: '9e', level: 'EMG', make: function (r) { var b = r.pick([2, 3, 5, 6, 7]), s = r.int(2, 4); return quotPart(b * s * s, b); } },
        { id: '9f', level: 'EMG', make: function (r) { var p = r.pick([3, 5, 6, 7, 10, 11]); return quotPart(p * p, p); } },
        { id: '9g', level: 'PRG', make: function (r) {
          var c, a, b, m;
          for (var i = 0; i < 200; i++) { c = r.pick([2, 3, 5]); b = c * r.pick([2, 3, 5, 7]); a = r.pick([6, 7, 10, 11, 13, 14, 15].filter(function (x) { return x % c; })); m = a * b / c; if (!isPerfect(m, 2) && m <= 200 && b !== c) break; }
          var e = '\\dfrac{\\sqrt{' + a + '}\\sqrt{' + b + '}}{\\sqrt{' + c + '}}';
          return singlePart(e, m, function (M) {
            if (M === a * b * c) return { code: 'multiplied', hint: 'The ' + t('\\sqrt{' + c + '}') + ' is in the denominator: <b>divide</b> by ' + t(c) + ', don’t multiply.' };
            if (M === a * b) return { code: 'multiplied', hint: 'You multiplied the top. Now divide by the radicand in the denominator, ' + t(c) + '.' };
            return null;
          }, t(e + '=\\sqrt{\\dfrac{' + a + '\\times ' + b + '}{' + c + '}}=\\sqrt{\\dfrac{' + a * b + '}{' + c + '}}=\\sqrt{' + m + '}') + '.', ['Multiply the radicands on top, then divide by the radicand on the bottom — all under one radical.'], 'single radical √' + a + '√' + b + '/√' + c, ['\\sqrt{' + a * b + '}', '\\sqrt{' + a * b * c + '}']);
        } },
        { id: '9h', level: 'ADV', make: function (r) {
          var qq = r.pick([[2, 4], [2, 3], [3, 2], [3, 3], [5, 2], [2, 5], [6, 2], [7, 2]]), k = qq[0], q = qq[1], p = q * k, P2 = p * p, Q2 = q * q;
          var e = '\\dfrac{\\sqrt{\\sqrt{' + P2 + '}}}{\\sqrt{\\sqrt{' + Q2 + '}}}';
          return singlePart(e, k, function (M, v) {
            if (same(v, k)) return { code: 'inner-roots', hint: 'Work from the inside out: ' + t('\\sqrt{' + P2 + '}=' + p) + ' and ' + t('\\sqrt{' + Q2 + '}=' + q) + ' first. Then use the quotient rule on what is left.' };
            if (M === p * q) return { code: 'multiplied', hint: 'This is a quotient: divide the radicands.' };
            return null;
          }, 'Inside first: ' + t('\\sqrt{' + P2 + '}=' + p) + ' and ' + t('\\sqrt{' + Q2 + '}=' + q) + '. So ' + t(e + '=\\dfrac{\\sqrt{' + p + '}}{\\sqrt{' + q + '}}=\\sqrt{\\dfrac{' + p + '}{' + q + '}}=\\sqrt{' + k + '}') + '.',
          ['Work from the inside out: evaluate the inner square roots first.', 'Then use ' + t('\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}') + '.'], 'single radical nested ' + P2 + '/' + Q2, [String(k), '\\sqrt{' + k * k + '}']);
        } }] },
      { num: '10', stem: 'Express as a product of two radicals.', parts: [
        { id: '10a', level: 'EMG', make: function (r) { var pq = r.pick([[7, 11], [3, 13], [7, 13], [5, 13], [3, 23], [7, 17]]); return twoPart(pq[0] * pq[1], pq[0], pq[1]); } },
        { id: '10b', level: 'EMG', make: function (r) { var pq = r.pick([[3, 17], [3, 19], [5, 11], [3, 29], [5, 17], [2, 23]]); return twoPart(pq[0] * pq[1], pq[0], pq[1]); } },
        { id: '10c', level: 'EMG', make: function (r) { var pq = r.pick([[5, 19], [7, 19], [5, 23], [11, 13], [3, 31], [2, 37]]); return twoPart(pq[0] * pq[1], pq[0], pq[1]); } },
        { id: '10d', level: 'PRG', make: function (r) { var p = r.pick([11, 13, 7, 17, 19]); return twoPart(p * p, p, p); } }] },
      { num: '11', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'ADV', make: function (r) {
          var c = r.int(2, 5), d = r.int(2, 5), e = r.int(4, 9), f = r.int(2, 4), c3 = c * c * c, d4 = ipow(d, 4), e3 = e * e * e, f4 = ipow(f, 4);
          var iT = r.chance(0.35), ivT = r.chance(0.35);
          var st = [
            iT ? { label: 'I', html: 'The cube root of ' + t(-c3) + ' is ' + t(-c) + '.', truth: true, reason: t('(-' + c + ')^{3}=-' + c3) + '.' }
              : { label: 'I', html: 'The cube roots of ' + t(-c3) + ' are ' + t('\\pm ' + c) + '.', truth: false, reason: t('(-' + c + ')^{3}=-' + c3) + ' but ' + t(c + '^{3}=' + c3) + ', so ' + t(-c3) + ' has only one cube root, ' + t(-c) + '.' },
            { label: 'II', html: 'The fourth roots of ' + t(F(d4)) + ' are ' + t('\\pm ' + d) + '.', truth: true, reason: t(d + '^{4}=' + F(d4)) + ' and ' + t('(-' + d + ')^{4}=' + F(d4)) + ', so both are fourth roots.' },
            { label: 'III', html: t('-\\sqrt[3]{' + e3 + '}=\\sqrt[3]{-' + e3 + '}'), truth: true, reason: t('-\\sqrt[3]{' + e3 + '}=-' + e) + ' and ' + t('\\sqrt[3]{-' + e3 + '}=-' + e) + ' (odd index), so they match.' },
            ivT ? { label: 'IV', html: t('-\\sqrt[4]{' + f4 + '}=-' + f), truth: true, reason: t('\\sqrt[4]{' + f4 + '}=' + f) + ', and the minus sign is outside, so ' + t('-\\sqrt[4]{' + f4 + '}=-' + f) + '.' }
              : { label: 'IV', html: t('-\\sqrt[4]{' + f4 + '}=\\sqrt[4]{-' + f4 + '}'), truth: false, reason: t('-\\sqrt[4]{' + f4 + '}=-' + f) + ', but ' + t('\\sqrt[4]{-' + f4 + '}') + ' is not possible (even index, negative radicand).' }];
          return statementsMC(r, 'Consider the following statements.', st, [['II', 'III'], ['I', 'II', 'III'], ['I', 'II', 'III', 'IV']], 'some other combination of I, II, III and IV', 'which root statements are true');
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var m = nonPerfect(r, 11, 47, 2);
          return mcPart(r, 'In the radical ' + t('\\sqrt{' + m + '}') + ',', [
            { html: 'the index is ' + t('2') + ' and the radicand is ' + t('\\sqrt{' + m + '}'), why: 'The radicand is the number <b>under</b> the radical sign, not the whole radical.' },
            { html: 'the index is ' + t('1') + ' and the radicand is ' + t('1'), why: 'When no index is written it is understood to be ' + t('2') + ' (a square root). And the radicand is the number under the radical sign.' },
            { html: 'the index is ' + t(m) + ' and the radicand is ' + t('1'), why: t(m) + ' sits under the radical sign, so it is the radicand. The index goes in the notch.' },
            { html: 'the index is ' + t('2') + ' and the radicand is ' + t(m), right: true }],
            'No index is written, so by convention the index is ' + t('2') + '. The radicand is the number under the radical sign, ' + t(m) + '.', ['Which number is under the radical sign? What index does a plain ' + t('\\sqrt{\\ }') + ' have?'], 'index/radicand of √' + m);
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'ADV', make: function (r) {
          var fr = r.pick([[5, 6], [2, 3], [3, 4], [4, 5], [7, 8], [3, 5], [5, 7]]), c = r.pick([2, 3, 3, 4]), idx = r.pick([[5, 4], [5, 4], [3, 4], [5, 6]]), f = fr[0] / fr[1];
          var A = nroot(-f, idx[0]), B = nroot(f, idx[1]), x = A + c * B;
          var e = rt(idx[0], '-\\dfrac{' + fr[0] + '}{' + fr[1] + '}') + '+' + c + rt(idx[1], '\\dfrac{' + fr[0] + '}{' + fr[1] + '}');
          var p = approxPart(e, x, 2, [
            { x: -A + c * B, code: 'sign', hint: 'The first radical has an odd index and a negative radicand, so it is <b>negative</b>.' },
            { x: A + nroot(c * f, idx[1]), code: 'coef-inside', hint: 'The ' + t(c) + ' multiplies the second radical — it doesn’t go under the radical.' },
            { x: A + B, code: 'no-coef', hint: 'Don’t forget to multiply the second radical by ' + t(c) + '.' },
            { x: nroot(-f, 3) + c * Math.sqrt(f), code: 'wrong-index', hint: 'Check the indices: ' + t(idx[0]) + ' for the first radical and ' + t(idx[1]) + ' for the second.' }],
            t('\\tfrac{' + fr[0] + '}{' + fr[1] + '}\\approx ' + decStr(f, 5)) + '. Index ' + idx[0] + ' is odd, so the first radical is negative: ' + t(rt(idx[0], '-\\tfrac{' + fr[0] + '}{' + fr[1] + '}') + '=' + dots(A)) + '.<br>' + t(c + rt(idx[1], '\\tfrac{' + fr[0] + '}{' + fr[1] + '}') + '=' + c + '\\times ' + dots(B) + '=' + dots(c * B)) + '.<br>Sum: ' + t(dots(x) + '\\approx ' + x.toFixed(2)) + '.',
            ['Evaluate each radical separately with ' + XKEY + ' (use brackets around the fraction), then add.', 'Odd index + negative radicand = negative root.'], 'NR ' + e, { nr: true });
          p.prompt = 'To the nearest hundredth, the value of ' + t(e) + ' is ________.';
          return p;
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Exact values without a calculator', stem: 'Evaluate exactly. Take the root of the numerator and the root of the denominator separately; leave each answer as a fraction in lowest terms.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) { var ab = r.pick([[3, 4], [2, 5], [1, 4], [4, 5], [2, 3], [5, 6]]); return rootTyped({ n: 3, num: ipow(ab[0], 3), den: ipow(ab[1], 3), fraction: true }); } },
        { id: 'e1b', level: 'EMG', make: function (r) { var ab = r.pick([[2, 3], [3, 5], [1, 3], [2, 5], [3, 4], [4, 5]]); return rootTyped({ n: 4, num: ipow(ab[0], 4), den: ipow(ab[1], 4), fraction: true }); } },
        { id: 'e1c', level: 'PRG', make: function (r) { var ab = r.pick([[2, 3], [1, 2], [1, 3], [3, 2], [3, 4]]); return rootTyped({ n: 5, num: -ipow(ab[0], 5), den: ipow(ab[1], 5), fraction: true }); } },
        { id: 'e1d', level: 'EMG', make: function (r) { var ab = r.pick([[5, 2], [4, 3], [7, 2], [5, 3], [6, 5]]); return rootTyped({ n: 3, num: ipow(ab[0], 3), den: ipow(ab[1], 3), fraction: true }); } }] },
      { num: '2', stem: 'Evaluate exactly. Rewrite each decimal as a fraction over a power of ten first — the number of decimal places in the answer is the number of places in the radicand divided by the index.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) { return decimalRoot(4, r.pick([1, 2, 3]), 1); } },
        { id: 'e2b', level: 'PRG', make: function (r) { return decimalRoot(3, r.pick([2, 3, 4, 5]), 1); } },
        { id: 'e2c', level: 'PRG', make: function (r) { return decimalRoot(2, r.pick([3, 4, 6, 7, 8, 9]), 2); } },
        { id: 'e2d', level: 'PRG', make: function (r) { return decimalRoot(3, -r.pick([2, 3, 4, 5, 6, 7, 8, 9]), 1); } }] },
      { num: '3', stem: 'Evaluate exactly. A coefficient in front of the radical multiplies the root <i>after</i> the root has been taken.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) { return rootTyped({ n: 6, num: ipow(r.pick([2, 3]), 6) }); } },
        { id: 'e3b', level: 'PRG', make: function (r) { var s = r.pick([2, 3, 4]), k = r.pick([2, 3]); return rootTyped({ n: 5, num: -ipow(s, 5), k: -k }); } },
        { id: 'e3c', level: 'PRG', make: function (r) { var n = r.pick([6, 7, 8]), k = r.pick([2, 2, 4]); return rootTyped({ n: n, num: ipow(2, n), k: [1, k], fraction: true }); } },
        { id: 'e3d', level: 'EMG', make: function (r) { var c = r.pick([[6, 2], [6, 3], [5, 2], [5, 3]]); return rootTyped({ n: c[0], num: 1, den: ipow(c[1], c[0]), fraction: true }); } }] },
      { num: '4', stem: 'Evaluate exactly. The radicand is already written as a power — work out the power <i>first</i>, then take the root.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) { return powRoot(2, r.int(2, 12), false); } },
        { id: 'e4b', level: 'PRG', make: function (r) { return powRoot(3, r.int(2, 9), false); } },
        { id: 'e4c', level: 'PRG', make: function (r) { return powRoot(4, r.int(2, 5), false); } },
        { id: 'e4d', level: 'ADV', make: function (r) { return powRoot(2, r.int(2, 12), true); } }] },
      { num: '5', section: 'Extra practice B — Possible or not possible', stem: 'Give the exact value, or choose <b>not possible</b> if the radical is not a real number. Remember: if the index is even, the radicand must be non-negative.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) { var c = r.pick([[4, 2], [4, 3], [6, 2]]); return rootMC(r, { n: c[0], num: -ipow(c[1], c[0]) }); } },
        { id: 'e5b', level: 'EMG', outcome: 'AN1', make: function (r) { var s = r.int(4, 9); return rootMC(r, { n: 3, num: -s * s * s }); } },
        { id: 'e5c', level: 'EMG', make: function (r) { var c = r.pick([[6, 2], [6, 3], [4, 4], [8, 2]]); return rootMC(r, { n: c[0], num: -ipow(c[1], c[0]) }); } },
        { id: 'e5d', level: 'EMG', make: function (r) { var c = r.pick([[5, 3], [5, 2], [5, 4], [7, 2]]); return rootMC(r, { n: c[0], num: -ipow(c[1], c[0]) }); } },
        { id: 'e5e', level: 'BEG', outcome: 'AN1', make: function (r) { var s = r.int(4, 12); return rootMC(r, { n: 2, num: s * s, neg: true }); } },
        { id: 'e5f', level: 'EMG', make: function (r) { var s = r.int(4, 12); return rootMC(r, { n: 2, num: -s * s }); } },
        { id: 'e5g', level: 'EMG', make: function (r) { var c = r.pick([[8, 2], [6, 2], [10, 2], [6, 3], [4, 4]]); return rootMC(r, { n: c[0], num: ipow(c[1], c[0]) }); } },
        { id: 'e5h', level: 'PRG', make: function (r) { var b = r.pick([10, 10, 4, 5, 6]); return rootMC(r, { n: 3, num: -1, den: b * b * b, order: ['sign', 'np', 'flip'] }); } }] },
      { num: '6', stem: 'Each pair looks almost the same, but the minus sign has moved. Evaluate both expressions, then decide whether they are equal.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var c = r.pick([[4, 3], [4, 2], [4, 5], [6, 2]]), n = c[0], s = c[1], M = ipow(s, n), A = '-' + rt(n, M), B = rt(n, '-' + M);
          return pairMC(r, A, B, [
            { html: t(A + '=-' + s) + '; ' + t(B) + ' is not possible. <b>Not equal.</b>', right: true },
            { html: 'Both equal ' + t(-s) + '. <b>Equal.</b>', why: 'The index ' + t(n) + ' is even, so a negative radicand has no real root: ' + t('(-' + s + ')^{' + n + '}=+' + M) + '.' },
            { html: 'Both are not possible.', why: 'In ' + t(A) + ' the radicand ' + t(M) + ' is positive, so the root exists; the minus sign outside just makes it negative.' },
            { html: t(A + '=' + s) + '; ' + t(B + '=-' + s) + '. <b>Not equal.</b>', why: 'The minus sign in ' + t(A) + ' makes that value negative.' }],
            t(rt(n, M) + '=' + s) + ', so ' + t(A + '=-' + s) + '. In ' + t(B) + ' the index is even and the radicand is negative, so it is <b>not possible</b>. <b>Not equal:</b> outside the radical the minus sign negates a root that exists; inside, it makes an even-index radicand negative.', 'pair ' + A + ' vs ' + B);
        } },
        { id: 'e6b', level: 'ADV', make: function (r) {
          var s = r.int(2, 9), A = '\\sqrt{(-' + s + ')^{2}}', B = '\\left(\\sqrt{-' + s + '}\\right)^{2}';
          return pairMC(r, A, B, [
            { html: t(A + '=' + s) + '; ' + t(B) + ' is not possible. <b>Not equal.</b>', right: true },
            { html: 'Both equal ' + t(s) + '. <b>Equal.</b>', why: 'In ' + t(B) + ' you must take ' + t('\\sqrt{-' + s + '}') + ' first — and that isn’t a real number, so there is nothing to square.' },
            { html: 'Both equal ' + t(-s) + '. <b>Equal.</b>', why: 'In ' + t(A) + ' the square comes first: ' + t('(-' + s + ')^{2}=' + s * s) + ', and ' + t('\\sqrt{' + s * s + '}') + ' is positive.' },
            { html: t(A + '=-' + s) + '; ' + t(B + '=' + s) + '. <b>Not equal.</b>', why: 'Work inside out. ' + t('(-' + s + ')^{2}=' + s * s) + ' — what is its principal square root? And can you take ' + t('\\sqrt{-' + s + '}') + '?' }],
            t(A + '=\\sqrt{' + s * s + '}=' + s) + '. In ' + t(B) + ', ' + t('\\sqrt{-' + s + '}') + ' is <b>not possible</b> (even index, negative radicand), so there is nothing to square. <b>Not equal:</b> squaring first removes the negative; taking the root first never gets started.', 'pair ' + A + ' vs ' + B);
        } },
        { id: 'e6c', level: 'PRG', make: function (r) {
          var c = r.pick([[3, 3], [3, 2], [3, 4], [5, 2], [3, 5]]), n = c[0], s = c[1], M = ipow(s, n), A = '-' + rt(n, M), B = rt(n, '-' + M);
          return pairMC(r, A, B, [
            { html: 'Both equal ' + t(-s) + '. <b>Equal.</b>', right: true },
            { html: t(A + '=-' + s) + '; ' + t(B) + ' is not possible. <b>Not equal.</b>', why: 'The index ' + t(n) + ' is <b>odd</b>, so a negative radicand is allowed: ' + t('(-' + s + ')^{' + n + '}=-' + M) + '.' },
            { html: t(A + '=-' + s) + '; ' + t(B + '=' + s) + '. <b>Not equal.</b>', why: 'Check: ' + t(s + '^{' + n + '}=' + M) + ', not ' + t(-M) + '. An odd power keeps the sign.' },
            { html: 'Both are not possible.', why: 'Only an <b>even</b> index needs a non-negative radicand. Here the index is ' + t(n) + '.' }],
            t(rt(n, M) + '=' + s) + ', so ' + t(A + '=-' + s) + '. ' + t('(-' + s + ')^{' + n + '}=-' + M) + ', so ' + t(B + '=-' + s) + '. <b>Equal:</b> with an odd index the minus sign may move in or out freely, because an odd power keeps the sign of its base.', 'pair ' + A + ' vs ' + B);
        } }] },
      { num: '7', stem: function (sh) { return 'Consider the radical ' + t('\\sqrt[n]{-' + sh.M + '}') + ', where ' + t('n\\in N') + '.'; },
        shared: function (r) { var b = r.chance(0.7) ? 2 : 3; return { b: b, M: ipow(b, 6) }; },
        parts: [
          { id: 'e7a', level: 'PRG', make: function (r, sh) {
            var b = sh.b, M = sh.M, rows = [2, 3, 4, 5, 6, 7].map(function (n) { return { id: 'n' + n, html: t('n=' + n) }; });
            var cols = [{ id: 'c3', html: t(-b * b * b) }, { id: 'c2', html: t(-b * b) }, { id: 'c1', html: t(-b) }, { id: 'irr', html: 'irrational' }, { id: 'np', html: 'not possible' }];
            var want = { n2: 'np', n3: 'c2', n4: 'np', n5: 'irr', n6: 'np', n7: 'irr' }, colTex = { c3: -b * b * b, c2: -b * b, c1: -b };
            var p = P.grid('For each index, choose the value of ' + t('\\sqrt[n]{-' + M + '}') + ': an exact integer, <i>irrational</i> (it exists but isn’t an integer), or <i>not possible</i>.', rows, cols, want, {
              rowHead: t('n'),
              why: function (row, got) {
                var n = Number(row.slice(1));
                if (n % 2 === 0) return { code: 'row', hint: 'Look at ' + t('n=' + n) + ': the index is even' + (colTex[got] != null ? ' and ' + t('(' + colTex[got] + ')^{' + n + '}=+' + F(ipow(colTex[got], n))) + ', not ' + t(-M) : '') + '. No real number raised to an even power is negative.' };
                if (colTex[got] != null) return { code: 'row', hint: 'Look at ' + t('n=' + n) + ': check ' + t('(' + colTex[got] + ')^{' + n + '}=' + F(ipow(colTex[got], n))) + '. Is that ' + t(-M) + '?' };
                if (n === 3) return { code: 'row', hint: 'Look at ' + t('n=3') + ': the index is odd, so the root exists. Is ' + t(-M) + ' a perfect cube?' };
                var lo = Math.floor(nroot(-M, n));
                return { code: 'row', hint: 'Look at ' + t('n=' + n) + ': the index is odd, so the root exists. Bracket it: ' + t(powTex(lo, n) + '=' + F(ipow(lo, n))) + ' and ' + t(powTex(lo + 1, n) + '=' + F(ipow(lo + 1, n))) + '. Is it an integer?' };
              }
            }, 'Even ' + t('n') + ' (2, 4, 6): <b>not possible</b>, since no real number raised to an even power is negative. ' + t('n=3') + ': ' + t('(' + (-b * b) + ')^{3}=-' + M) + ', so the root is ' + t(-b * b) + '. ' + t('n=5') + ' and ' + t('n=7') + ': the roots exist (odd index) but ' + t(-M) + ' is not a perfect fifth or seventh power, so they are <b>irrational</b> (' + t('\\approx ' + nroot(-M, 5).toFixed(2)) + ' and ' + t('\\approx ' + nroot(-M, 7).toFixed(2)) + ').',
            ['Even index and negative radicand: not possible.', 'Odd index: the root exists. Is it an exact integer?'], 'table ⁿ√-' + M);
            return p;
          } },
          { id: 'e7b', level: 'PRG', make: function (r, sh) {
            return mcPart(r, 'Which statement explains the pattern in the table, using only the index?', [
              { html: 'Even index: not possible, because an even power of any real number is never negative. Odd index: a real negative root, because an odd power of a negative number is negative.', right: true },
              { html: 'The root exists only when ' + t(sh.M) + ' is a perfect power of the index.', why: 'For ' + t('n=5') + ' and ' + t('n=7') + ' the root exists even though it isn’t an integer. And for ' + t('n=6') + ', ' + t(sh.M) + ' <i>is</i> a perfect sixth power, yet the root is not possible.' },
              { html: 'Small indices give real roots and large indices don’t.', why: 'Compare ' + t('n=2') + ' (not possible) with ' + t('n=7') + ' (real).' },
              { html: 'Even index: the root is positive. Odd index: the root is negative.', why: 'With a negative radicand an even index gives no real root at all — not a positive one.' }],
              'Only the parity of the index matters. An even power of a real number is never negative, so an even root of a negative number is not real. An odd power keeps the sign, so an odd root of a negative number is a real negative number.', ['Look down the table: which rows are “not possible”? What do their indices have in common?'], 'pattern even/odd index');
          } },
          { id: 'e7c', level: 'PRG', make: function (r, sh) {
            var M = sh.M, b = sh.b;
            return mcPart(r, 'A classmate says “' + t(-M) + ' has no roots at all.” Which is the best correction?', [
              { html: t(-M) + ' has one real root for every <b>odd</b> index, e.g. ' + t('\\sqrt[3]{-' + M + '}=' + (-b * b)) + '; it has no roots of <b>even</b> index.', right: true },
              { html: 'The classmate is right: negative numbers have no roots.', why: 'Check the table: ' + t('(' + (-b * b) + ')^{3}=-' + M) + ', so ' + t('\\sqrt[3]{-' + M + '}') + ' exists.' },
              { html: t(-M) + ' has roots of every index, because ' + t('(-' + b + ')^{6}=-' + M) + '.', why: t('(-' + b + ')^{6}=+' + M) + ': an even power of a negative number is positive.' },
              { html: t(-M) + ' only has a cube root; every other root is not possible.', why: 'The fifth and seventh roots exist too — they just aren’t integers.' }],
              'Every odd index gives a real root (e.g. ' + t('\\sqrt[3]{-' + M + '}=' + (-b * b)) + ', and irrational fifth and seventh roots); only the even-index roots are not possible.', ['Use your table: which rows had a real answer?'], 'correct “no roots”');
          } },
          { id: 'e7d', level: 'EMG', make: function (r, sh) {
            return P.nr('For how many of the six values of ' + t('n') + ' (2 to 7) is ' + t('\\sqrt[n]{-' + sh.M + '}') + ' an <b>integer</b>?', 1, function (v) {
              if (v === 2) return { code: 'count', hint: 'Check ' + t('n=6') + ': ' + t('(-' + sh.b + ')^{6}=+' + sh.M) + ', so that one is not possible.' };
              if (v === 3) return { code: 'count', hint: 'The roots for ' + t('n=5') + ' and ' + t('n=7') + ' exist, but they are irrational, not integers.' };
              if (v === 0) return { code: 'count', hint: 'Look at ' + t('n=3') + ': ' + t('(' + (-sh.b * sh.b) + ')^{3}=-' + sh.M) + '.' };
              return null;
            }, 'Only ' + t('n=3') + ' gives an integer, ' + t(-sh.b * sh.b) + '. The roots for ' + t('n=5, 7') + ' are irrational and the even ones are not possible. Answer: ' + t('1') + '.', ['Use your table from part (a).'], 'how many integer roots');
          } }] },
      { num: '8', section: 'Extra practice C — Estimating irrational roots', stem: 'Each root is irrational. <b>Without a calculator</b>, state the two consecutive integers it lies between.', parts: [
        { id: 'e8a', level: 'EMG', make: function (r) { return bracketPart(2, nonPerfect(r, 20, 99, 2)); } },
        { id: 'e8b', level: 'PRG', make: function (r) { return bracketPart(3, nonPerfect(r, 30, 200, 3)); } },
        { id: 'e8c', level: 'PRG', make: function (r) { return bracketPart(4, nonPerfect(r, 20, 600, 4, function (v) { return v < 17; })); } },
        { id: 'e8d', level: 'ADV', make: function (r) { return bracketPart(3, -nonPerfect(r, 10, 120, 3, function (v) { return v < 9; })); } }] },
      { num: '9', stem: 'Refine each estimate to <b>one decimal place</b>, still without a calculator. Test the halfway value first: raise it to the power of the index and compare with the radicand.', parts: [
        { id: 'e9a', level: 'ADV', make: function (r) { return refinePart(2, nonPerfect(r, 20, 99, 2)); } },
        { id: 'e9b', level: 'ADV', make: function (r) { return refinePart(3, nonPerfect(r, 30, 150, 3)); } },
        { id: 'e9c', level: 'ADV', make: function (r) { return refinePart(2, nonPerfect(r, 30, 60, 2)); } },
        { id: 'e9d', level: 'MAS', make: function (r) { return refinePart(3, -nonPerfect(r, 10, 100, 3, function (v) { return v < 9; })); } }] },
      { num: '10', stem: function (sh) { return 'Ivy claims that ' + t('\\sqrt[3]{' + sh.A + '}>\\sqrt{' + sh.B + '}') + ' “because ' + t(sh.A) + ' is bigger than ' + t(sh.B) + '.”'; },
        shared: function (r) { var k = r.pick([3, 4, 4]); return { k: k, A: nonPerfect(r, k * k * k + 1, ipow(k + 1, 3) - 1, 3), B: nonPerfect(r, (k - 1) * (k - 1) + 1, k * k - 1, 2) }; },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) {
            var k = sh.k, A = sh.A, B = sh.B;
            return mcPart(r, 'Bracket each root between consecutive integers. Is her <b>conclusion</b> correct?', [
              { html: 'Yes: ' + t(k + '<\\sqrt[3]{' + A + '}<' + (k + 1)) + ' and ' + t((k - 1) + '<\\sqrt{' + B + '}<' + k) + ', so ' + t('\\sqrt[3]{' + A + '}>\\sqrt{' + B + '}') + '.', right: true },
              { html: 'No: square roots are always bigger than cube roots.', why: 'Bracket them: ' + t(k + '^{3}=' + k * k * k) + ' and ' + t((k + 1) + '^{3}=' + ipow(k + 1, 3)) + ', while ' + t((k - 1) + '^{2}=' + (k - 1) * (k - 1)) + ' and ' + t(k + '^{2}=' + k * k) + '.' },
              { html: 'Yes, because ' + t(A + '>' + B) + ', and a larger radicand always gives a larger root.', why: 'Her conclusion is right, but that is her (faulty) reasoning — see part (b). Show it by bracketing: use perfect cubes for ' + t('\\sqrt[3]{' + A + '}') + ' and perfect squares for ' + t('\\sqrt{' + B + '}') + '.' },
              { html: 'You can’t tell without a calculator.', why: 'Bracketing is enough: find the perfect cubes around ' + t(A) + ' and the perfect squares around ' + t(B) + '.' }],
              t(k + '^{3}=' + k * k * k + '<' + A + '<' + ipow(k + 1, 3) + '=' + (k + 1) + '^{3}') + ', so ' + t(k + '<\\sqrt[3]{' + A + '}<' + (k + 1)) + '. ' + t((k - 1) + '^{2}=' + (k - 1) * (k - 1) + '<' + B + '<' + k * k + '=' + k + '^{2}') + ', so ' + t((k - 1) + '<\\sqrt{' + B + '}<' + k) + '. So her conclusion is correct — but not for her reason.',
              ['Use perfect cubes for the cube root and perfect squares for the square root.'], 'Ivy bracket ∛' + A + ' vs √' + B);
          } },
          { id: 'e10b', level: 'ADV', make: function (r) {
            var c = r.pick([[3, 4], [3, 5], [4, 5], [4, 6], [4, 7], [5, 6], [5, 9]]), a = c[0], b = c[1], A = a * a * a, B = b * b;
            return mcPart(r, 'Her <b>reasoning</b> is wrong. Which pair is a counterexample: different indices, where the larger radicand gives the smaller value?', [
              { html: t('\\sqrt[3]{' + A + '}') + ' and ' + t('\\sqrt{' + B + '}'), right: true },
              { html: t('\\sqrt{' + B + '}') + ' and ' + t('\\sqrt{' + (a * a) + '}'), why: 'Same index: then the larger radicand really does give the larger value. A counterexample needs different indices.' },
              { html: t('\\sqrt[3]{' + ipow(a + 2, 3) + '}') + ' and ' + t('\\sqrt{' + (a * a) + '}'), why: t('\\sqrt[3]{' + ipow(a + 2, 3) + '}=' + (a + 2)) + ' and ' + t('\\sqrt{' + a * a + '}=' + a) + ': the larger radicand gives the larger value here, so it agrees with Ivy.' },
              { html: t('\\sqrt[3]{8}') + ' and ' + t('\\sqrt{' + B + '}'), why: t('8<' + B) + ' and ' + t('2<' + b) + ': the smaller radicand gives the smaller value, so it agrees with Ivy.' }],
              t('\\sqrt[3]{' + A + '}=' + a) + ' and ' + t('\\sqrt{' + B + '}=' + b) + '. The radicand ' + t(A) + ' is larger than ' + t(B) + ', yet ' + t(a + '<' + b) + '. So a larger radicand does not guarantee a larger value.', ['Evaluate each radical in the pair. Which radicand is larger? Which value is larger?'], 'counterexample ∛' + A + ', √' + B);
          } },
          { id: 'e10c', level: 'MAS', make: function (r) {
            return mcPart(r, 'Why may radicands only be compared directly when the two indices match?', [
              { html: 'The index says how many equal factors the radicand is split into. Different indices undo different powers, so a bigger radicand can still give a smaller root. With the same index, the larger radicand always gives the larger root.', right: true },
              { html: 'Because cube roots are always smaller than square roots.', why: 'Not always: ' + t('\\sqrt[3]{1000}=10') + ' is bigger than ' + t('\\sqrt{4}=2') + '.' },
              { html: 'Because radicands with different indices are never comparable at all.', why: 'They can be compared — by evaluating or bracketing each root, just not by looking at the radicands alone.' },
              { html: 'Because a larger index always gives a larger root.', why: 'For radicands bigger than 1 it is the opposite: ' + t('\\sqrt{64}=8') + ' but ' + t('\\sqrt[3]{64}=4') + '.' }],
              'For radicands greater than 1, a larger index pulls the value down more (' + t('\\sqrt{64}=8') + ', ' + t('\\sqrt[3]{64}=4') + ', ' + t('\\sqrt[6]{64}=2') + '). When the indices match, the same “undoing” happens to both, and then the larger radicand gives the larger root.', ['Compare ' + t('\\sqrt{64}') + ' and ' + t('\\sqrt[3]{64}') + '.'], 'why indices must match');
          } }] },
      { num: '11', section: 'Extra practice D — Ordering roots', stem: 'Arrange from <b>least to greatest</b> without a calculator.', parts: [
        { id: 'e11', level: 'PRG', make: function (r) {
          var k = r.pick([3, 3, 4, 5]), m = r.int(2, k - 1), c = r.int(1, 3), pq = r.sample(range(k * k + 1, (k + 1) * (k + 1) - 1), 2).sort(function (x, y) { return x - y; });
          for (var g = 0; g < 50 && pq[1] - pq[0] < 3; g++) pq = r.sample(range(k * k + 1, (k + 1) * (k + 1) - 1), 2).sort(function (x, y) { return x - y; });
          var items = [
            { id: 'neg', tex: rt(3, -c * c * c), vt: String(-c), exact: true },
            { id: 'four', tex: rt(4, ipow(m, 4)), vt: String(m), exact: true },
            { id: 'cube', tex: rt(3, k * k * k), vt: String(k), exact: true },
            { id: 'p', tex: '\\sqrt{' + pq[0] + '}', vt: Math.sqrt(pq[0]).toFixed(1) },
            { id: 'q', tex: '\\sqrt{' + pq[1] + '}', vt: Math.sqrt(pq[1]).toFixed(1) }];
          return orderPart(r, 'Order these roots. Each one is an integer or lies between two integers you can name.', items,
            t(rt(3, -c * c * c) + '=' + (-c)) + ', ' + t(rt(4, ipow(m, 4)) + '=' + m) + ', ' + t(rt(3, k * k * k) + '=' + k) + '. ' + t(k * k + '<' + pq[0] + '<' + pq[1] + '<' + (k + 1) * (k + 1)) + ', so ' + t('\\sqrt{' + pq[0] + '}') + ' and ' + t('\\sqrt{' + pq[1] + '}') + ' are both between ' + t(k) + ' and ' + t(k + 1) + ' (same index, so the smaller radicand is smaller).<br>' + t(items.map(function (x) { return x.tex; }).join('<')), 'order 5 roots');
        } }] },
      { num: '12', stem: 'Arrange from <b>least to greatest</b> without a calculator. Simplify every radical first, and be careful with the negatives.', parts: [
        { id: 'e12', level: 'ADV', make: function (r) {
          var a = r.pick([3, 4, 5]), b = r.pick([2, 3, 4].filter(function (x) { return x !== a; })), de = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 2), d = de[0], e = de[1], g = r.pick([2, 2, 3]);
          var rr = nonPerfect(r, g * g + 1, (g + 1) * (g + 1) - 1, 2);
          var items = [
            { id: 'a', tex: rt(3, -a * a * a), v: -a, vt: String(-a), exact: true },
            { id: 'b', tex: '-' + rt(4, ipow(b, 4)), v: -b, vt: String(-b), exact: true },
            { id: 'd', tex: '\\sqrt{' + (d * d / 100).toFixed(2) + '}', v: d / 10, vt: (d / 10).toFixed(1), exact: true },
            { id: 'e', tex: rt(3, (e * e * e / 1000).toFixed(3)), v: e / 10, vt: (e / 10).toFixed(1), exact: true },
            { id: 'g', tex: rt(6, ipow(g, 6)), v: g, vt: String(g), exact: true },
            { id: 'r', tex: '\\sqrt{' + rr + '}', v: Math.sqrt(rr), vt: Math.sqrt(rr).toFixed(1) }].sort(function (x, y) { return x.v - y.v; });
          return orderPart(r, 'Order these six roots.', items,
            items.map(function (x) { return t(x.tex + (x.exact ? '=' : '\\approx ') + x.vt); }).join(', ') + '.<br>' + t(items.map(function (x) { return x.tex; }).join('<')), 'order 6 roots');
        } }] },
      { num: '13', section: 'Extra practice E — Error analysis', stem: function (sh) { return 'A student writes: “' + t('\\sqrt{-' + sh.c * sh.c + '}=-' + sh.c) + ', because ' + t('(-' + sh.c + ')\\times(-' + sh.c + ')') + ' has a negative in it, so it must give ' + t(-sh.c * sh.c) + '.”'; },
        shared: function (r) { return { c: r.int(3, 9) }; },
        parts: [
          { id: 'e13a', level: 'BEG', make: function (r, sh) {
            var c = sh.c;
            return P.number('Evaluate ' + t('(-' + c + ')^{2}') + '.', c * c, function (v) { if (v === -c * c) return { code: 'sign', hint: 'A negative times a negative is <b>positive</b>.' }; if (v === -2 * c || v === 2 * c) return { code: 'diag', hint: 'Squaring means multiplying by itself: ' + t('(-' + c + ')\\times(-' + c + ')') + '.' }; return null; },
              t('(-' + c + ')^{2}=(-' + c + ')\\times(-' + c + ')=' + c * c) + ', not ' + t(-c * c) + '. A negative times a negative is positive, so <b>no</b> real number squares to a negative number — that is the student’s mistake.', ['Multiply ' + t('(-' + c + ')\\times(-' + c + ')') + '.'], '(-' + c + ')²');
          } },
          { id: 'e13b', level: 'EMG', make: function (r, sh) { var p = rootMC(r, { n: 2, num: -sh.c * sh.c }); p.prompt = 'What is the correct answer for ' + t('\\sqrt{-' + sh.c * sh.c + '}') + '?'; return p; } },
          { id: 'e13c', level: 'PRG', make: function (r, sh) {
            var c = sh.c, C = c * c;
            var chk = function (resp) {
              var a = K.read(resp); if (a.res) return a.res;
              var sh2 = ex.shape(a.ast), s = strip(a.ast);
              if (ex.eq(a.val, -c)) {
                if (!sh2.roots) return form('as-radical', 'That’s the value. Write the <b>radical</b> itself — it looks almost the same as ' + t('\\sqrt{-' + C + '}') + '.');
                var in1 = s.t === 'neg' ? strip(s.a) : null;
                if (in1 && in1.t === 'root') { var n = ex.rat(in1.n), m = ex.rat(in1.a); if (n && m && n[0] === 2 && n[1] === 1 && m[0] === C && m[1] === 1) return ok(); }
                return form('related', 'That does equal ' + t(-c) + ', but find the radical that looks almost the same as ' + t('\\sqrt{-' + C + '}') + ' — move the minus sign.');
              }
              if (ex.eq(a.val, c)) return wrong('sign', 'That’s ' + t('\\sqrt{' + C + '}=' + c) + '. Where does the minus sign go?');
              if (!isFinite(a.val)) return wrong('np-root', t('\\sqrt{-' + C + '}') + ' isn’t a real number. Move the minus sign <b>outside</b> the radical.');
              return wrong('value', null);
            };
            var p = P.math('The student’s answer of ' + t(-c) + ' <i>is</i> the correct value of a closely related radical. Write that radical.', chk, '-\\sqrt{' + C + '}',
              t('-\\sqrt{' + C + '}=-' + c) + ', since ' + t('\\sqrt{' + C + '}=' + c) + '. The minus sign belongs <b>outside</b> the radical, not inside it.', ['Keep the same numbers, but move the minus sign.'], 'related radical -√' + C, { keys: 'radical' });
            p.good = ['-sqrt(' + C + ')']; p.bad = ['\\sqrt{-' + C + '}', '-' + c, '\\sqrt{' + C + '}', '-\\sqrt[3]{' + c * c * c + '}'];
            return p;
          } }] },
      { num: '14', stem: function (sh) { return 'A second student writes: “' + t('\\sqrt[3]{-' + sh.s * sh.s * sh.s + '}') + ' is not possible, because you can never take the root of a negative number.”'; },
        shared: function (r) { return { s: r.int(2, 6) }; },
        parts: [
          { id: 'e14a', level: 'EMG', outcome: 'AN1', make: function (r, sh) { var s = sh.s, p = rootMC(r, { n: 3, num: -s * s * s, order: ['np', 'sign', 'pm'] }); p.prompt = 'Evaluate ' + t('\\sqrt[3]{-' + s * s * s + '}') + '.'; p.solution += ' Check: ' + t('(-' + s + ')^{3}=(-' + s + ')(-' + s + ')(-' + s + ')=' + s * s + '\\times(-' + s + ')=-' + s * s * s) + ' ✓'; return p; } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) {
            var s = sh.s;
            return mcPart(r, 'Which rule should the student have used?', [
              { html: 'Only an <b>even</b> index needs a non-negative radicand. The index here is ' + t('3') + ' (odd), so the root of a negative number is real.', right: true },
              { html: 'No root of a negative number is ever real.', why: 'Test it: ' + t('(-' + s + ')^{3}=-' + s * s * s) + ', so ' + t('\\sqrt[3]{-' + s * s * s + '}') + ' is real.' },
              { html: 'A cube root of a negative number is real only when the radicand is a perfect cube.', why: t('\\sqrt[3]{-30}\\approx -3.1') + ' is real too: every odd root of a negative number is real, perfect cube or not.' },
              { html: 'Every index allows a negative radicand.', why: 'Not an even index: ' + t('(-2)^{4}=+16') + ', so no real number has a fourth power of ' + t('-16') + '.' }],
              'The restriction applies only when the index is <b>even</b>. With an odd index, any real radicand is allowed, because an odd power of a negative number is negative.', ['What is special about odd powers of negative numbers?'], 'rule: even index only');
          } },
          { id: 'e14c', level: 'PRG', make: function (r, sh) {
            var s = sh.s, key = '\\sqrt[4]{-' + ipow(s, 3) + '}';
            var chk = function (resp) {
              var a = K.read(resp); if (a.res) return a.res;
              var roots = [];
              (function walk(x) { if (!x || typeof x !== 'object') return; if (x.t === 'root') roots.push(x); ['a', 'b'].forEach(function (k) { if (x[k]) walk(x[k]); }); })(a.ast);
              if (!roots.length) return form('no-radical', 'Write a radical with a negative radicand, like ' + t('\\sqrt[n]{-x}') + '.');
              var info = roots.map(function (x) { var n = ex.rat(x.n), m = ex.rat(x.a); return { n: n && n[1] === 1 ? n[0] : null, neg: m ? m[0] < 0 : null }; });
              if (info.some(function (i) { return i.n != null && i.n % 2 === 0 && i.neg; })) return ok();
              var odd = info.filter(function (i) { return i.n != null && i.n % 2 === 1 && i.neg; })[0];
              if (odd) return wrong('odd-index', 'That one is real: the index ' + t(odd.n) + ' is odd, and an odd power of a negative number is negative. Choose an index that makes it impossible.');
              if (info.some(function (i) { return i.neg === false; })) return wrong('positive', 'The radicand must be <b>negative</b>.');
              return wrong('value', null);
            };
            var p = P.math('Write one radical with a <b>negative</b> radicand that really <i>is</i> not possible.', chk, key,
              'For example ' + t(key) + ' (or ' + t('\\sqrt{-' + ipow(s, 3) + '}') + ', ' + t('\\sqrt[6]{-' + ipow(s, 3) + '}') + '). The index is even, and no real number raised to an even power gives a negative result.', ['Which kind of index makes a negative radicand impossible?'], 'write an impossible radical', { keys: 'radical' });
            p.good = ['\\sqrt{-5}', '\\sqrt[6]{-1}', 'sqrt(-9)']; p.bad = ['\\sqrt[3]{-8}', '\\sqrt[4]{16}', '\\sqrt[5]{-1}'];
            return p;
          } }] },
      { num: '15', section: 'Extra practice F — Reasoning', stem: 'Counting roots.', parts: [
        { id: 'e15a', level: 'PRG', make: function (r) {
          var s = r.int(2, 6);
          return mcPart(r, 'Why does a positive number have <b>two</b> square roots but only <b>one</b> cube root?', [
            { html: 'Squaring makes every number positive: ' + t(s + '^{2}=(-' + s + ')^{2}=' + s * s) + '. Cubing keeps the sign: ' + t(s + '^{3}=' + s * s * s) + ' but ' + t('(-' + s + ')^{3}=-' + s * s * s) + '.', right: true },
            { html: 'Because the square root sign gives ' + t('\\pm') + ' and the cube root sign does not.', why: 'The radical sign ' + t('\\sqrt{\\ }') + ' gives only the principal root. The two square roots come from the fact that ' + t(s) + ' and ' + t(-s) + ' have the same square.' },
            { html: 'Because cube roots are only defined for positive numbers.', why: 'Cube roots of negative numbers exist: ' + t('\\sqrt[3]{-' + s * s * s + '}=-' + s) + '.' },
            { html: 'Because 3 is bigger than 2.', why: 'Compare fourth roots: ' + t('4>2') + ', yet ' + t(ipow(s, 4)) + ' has two real fourth roots. What matters is whether the index is even or odd.' }],
            'Multiplying a number by itself twice always gives a positive result, so two different numbers (' + t(s) + ' and ' + t(-s) + ') share the same square ' + t(s * s) + '. Multiplying three times keeps the sign, so only ' + t(s) + ' cubes to ' + t(s * s * s) + '.', ['Square and cube both ' + t(s) + ' and ' + t(-s) + '.'], 'two square roots, one cube root');
        } },
        { id: 'e15b', level: 'PRG', make: function (r) {
          var s = r.int(5, 12), n = s * s;
          return mcPart(r, t(n) + ' has two square roots, yet ' + t('\\sqrt{' + n + '}=' + s) + ' only. Why?', [
            { html: t('\\sqrt{\\ }') + ' is defined to mean the <b>principal</b> (positive) square root, because a symbol must name exactly one value. The other root is written ' + t('-\\sqrt{' + n + '}') + '.', right: true },
            { html: 'Because ' + t(-s) + ' is not really a square root of ' + t(n) + '.', why: 'It is: ' + t('(-' + s + ')^{2}=' + n) + '.' },
            { html: 'Because negative numbers can’t be written under a radical.', why: 'That isn’t the reason — ' + t('\\sqrt[3]{-8}') + ' is fine. The question is what the symbol ' + t('\\sqrt{\\ }') + ' itself stands for.' },
            { html: 'It is a convention that only applies on calculators.', why: 'It is the mathematical definition of the symbol, used everywhere: ' + t('\\sqrt{' + n + '}') + ' stands for one number.' }],
            t('\\sqrt{\\ }') + ' means the principal (positive) square root, so ' + t('\\sqrt{' + n + '}=' + s) + '. A symbol used in calculations must stand for one value; the other root is ' + t('-\\sqrt{' + n + '}=-' + s) + ', and together they are ' + t('\\pm\\sqrt{' + n + '}') + '.', ['How would you calculate with a symbol that meant two numbers at once?'], 'principal root');
        } },
        { id: 'e15c', level: 'EMG', make: function (r) {
          var d = r.int(2, 4), D = ipow(d, 4);
          return P.number('How many real <b>fourth</b> roots does ' + t(D) + ' have?', 2, function (v) { if (v === 1) return { code: 'count', hint: 'Try ' + t('(-' + d + ')^{4}') + '.' }; if (v === 4) return { code: 'count', hint: 'Only real numbers count. Which real numbers have a fourth power of ' + t(D) + '?' }; return null; },
            t(d + '^{4}=' + D) + ' and ' + t('(-' + d + ')^{4}=' + D) + ', so ' + t(D) + ' has <b>two</b> real fourth roots, ' + t('\\pm ' + d) + '.', ['Test ' + t(d) + ' and ' + t(-d) + '.'], 'number of 4th roots of ' + D);
        } },
        { id: 'e15d', level: 'EMG', make: function (r) {
          var e = r.int(2, 3), E = ipow(e, 5);
          return P.number('How many real <b>fifth</b> roots does ' + t(E) + ' have?', 1, function (v) { if (v === 2) return { code: 'count', hint: 'Check ' + t('(-' + e + ')^{5}') + ': an odd power keeps the negative sign.' }; return null; },
            t(e + '^{5}=' + E) + ' but ' + t('(-' + e + ')^{5}=-' + E) + ', so ' + t(E) + ' has just <b>one</b> real fifth root, ' + t(e) + '.', ['Test ' + t(e) + ' and ' + t(-e) + '.'], 'number of 5th roots of ' + E);
        } },
        { id: 'e15e', level: 'ADV', make: function (r) {
          return mcPart(r, 'Which general rule is correct for a <b>positive</b> number?', [
            { html: 'It has <b>two</b> real roots of any even index and <b>one</b> real root of any odd index.', right: true },
            { html: 'It has two real roots of every index.', why: 'Try an odd index: ' + t('2^{5}=32') + ' but ' + t('(-2)^{5}=-32') + ', so ' + t('32') + ' has only one real fifth root.' },
            { html: 'It has one real root of every index.', why: 'Try an even index: ' + t('3^{4}=81') + ' and ' + t('(-3)^{4}=81') + '.' },
            { html: 'It has one real root of any even index and two of any odd index.', why: 'It’s the other way round: even powers lose the sign, so two numbers share each even power.' }],
            'Even index: the even power hides the sign, so ' + t('\\pm') + ' both work — two real roots. Odd index: the sign survives, so only the positive number works — one real root. (A negative number has no real roots of even index and one of odd index.)', ['Use your answers to the last two parts.'], 'rule for number of roots');
        } }] },
      { num: '16', stem: 'The identity ' + t('\\sqrt{x^{2}}=|x|') + '.', parts: [
        { id: 'e16a', level: 'PRG', make: function (r) {
          var a = r.int(3, 9), fr = r.pick([[3, 4], [2, 3], [5, 6], [2, 5], [4, 7]]);
          var xs = [[a, 1], [0, 1], [-a, 1], [-fr[0], fr[1]]];
          var fields = xs.map(function (x) { var xt = rTex(x); return { name: t('x=' + xt), label: t('x=' + xt), before: t('\\sqrt{(' + xt + ')^{2}}='), mode: x[1] > 1 ? 'text' : undefined }; });
          var checkers = xs.map(function (x) {
            var X = x[0] / x[1];
            return K.value(Math.abs(X), { only: 'fraction', diag: function (v) {
              if (X < 0 && same(v, X)) return { code: 'kept-sign', hint: 'Squaring removed the sign: ' + t('(' + rTex(x) + ')^{2}=' + rTex([x[0] * x[0], x[1] * x[1]])) + '. The principal square root of that is positive.' };
              if (X !== 0 && same(v, X * X)) return { code: 'squared-only', hint: 'That’s ' + t('x^{2}') + '. Now take its square root.' };
              return null;
            } });
          });
          var keys = xs.map(function (x) { return x[1] === 1 ? String(Math.abs(x[0])) : Math.abs(x[0]) + '/' + x[1]; });
          var p = P.fields('Complete the table: evaluate ' + t('\\sqrt{x^{2}}') + ' for each value of ' + t('x') + '.', fields, checkers, keys, xs.map(function (x) { return t('\\sqrt{(' + rTex(x) + ')^{2}}=' + rTex([Math.abs(x[0]), x[1]])); }).join('<br>'),
            xs.map(function (x) { return t('x=' + rTex(x)) + ': ' + t('x^{2}=' + rTex([x[0] * x[0], x[1] * x[1]])) + ', ' + t('\\sqrt{x^{2}}=' + rTex([Math.abs(x[0]), x[1]])); }).join('<br>') + '<br>In every row ' + t('\\sqrt{x^{2}}') + ' is the size of ' + t('x') + ' without its sign: ' + t('|x|') + '.',
            ['Square first, then take the principal (positive) square root.'], 'table √(x²)');
          p.bad = [keys.slice(0, 2).concat(['-' + a, keys[3]])];
          return p;
        } },
        { id: 'e16b', level: 'ADV', make: function (r) {
          return mcPart(r, 'Why is ' + t('\\sqrt{x^{2}}=|x|') + ' rather than ' + t('\\sqrt{x^{2}}=x') + '?', [
            { html: 'Squaring destroys the sign (' + t('(-5)^{2}=5^{2}=25') + '), and the principal square root always gives back the non-negative number. So the result is the size of ' + t('x') + ': ' + t('|x|') + '.', right: true },
            { html: 'Because ' + t('x') + ' is always positive.', why: t('x') + ' can be any real number, e.g. ' + t('x=-5') + '. Try it in ' + t('\\sqrt{x^{2}}') + '.' },
            { html: 'Because the square root of a negative number is not possible.', why: 'Here the radicand is ' + t('x^{2}') + ', which is never negative. The issue is what the root gives back.' },
            { html: 'They mean the same thing; ' + t('|x|') + ' is just another way to write ' + t('x') + '.', why: 'For ' + t('x=-5') + ': ' + t('|x|=5') + ' but ' + t('x=-5') + '.' }],
            'Squaring makes ' + t('x') + ' and ' + t('-x') + ' give the same result, e.g. ' + t('(-5)^{2}=5^{2}=25') + '. The principal square root then always hands back the non-negative number, ' + t('5') + '. So the output is ' + t('|x|') + '; ' + t('\\sqrt{x^{2}}=x') + ' already fails at ' + t('x=-5') + '.', ['Try ' + t('x=-5') + '.'], 'why √(x²)=|x|');
        } },
        { id: 'e16c', level: 'PRG', make: function (r) {
          return mcPart(r, 'For which real values of ' + t('x') + ' is ' + t('\\sqrt{x^{2}}=x') + ' actually true?', [
            { html: t('x\\ge 0'), right: true },
            { html: t('x>0'), why: 'Check ' + t('x=0') + ': ' + t('\\sqrt{0^{2}}=0') + '. It works there too.' },
            { html: 'all real ' + t('x'), why: 'Check ' + t('x=-5') + ': ' + t('\\sqrt{(-5)^{2}}=5\\ne -5') + '.' },
            { html: t('x\\le 0'), why: 'Check ' + t('x=-5') + ': ' + t('\\sqrt{(-5)^{2}}=5') + ', not ' + t('-5') + '.' }],
            t('\\sqrt{x^{2}}=|x|') + ', and ' + t('|x|=x') + ' exactly when ' + t('x\\ge 0') + '.', ['When does ' + t('|x|=x') + '?'], 'when √(x²)=x');
        } },
        { id: 'e16d', level: 'ADV', make: function (r) {
          var s = r.int(2, 6);
          return tf(r, t('\\sqrt[3]{x^{3}}=x') + ' for <b>every</b> real number ' + t('x') + '.', true, 'Test ' + t('x=-' + s) + ': ' + t('(-' + s + ')^{3}=-' + s * s * s) + ' and ' + t('\\sqrt[3]{-' + s * s * s + '}=-' + s) + '. An odd power keeps the sign, so nothing is lost.',
            'True. With ' + t('x=-' + s) + ': ' + t('x^{3}=-' + s * s * s) + ' and ' + t('\\sqrt[3]{-' + s * s * s + '}=-' + s + '=x') + '. An odd power keeps the sign and the odd root restores the original number exactly — unlike squaring, which throws the sign away.', ['Test a negative value of ' + t('x') + '.'], '∛(x³)=x always');
        } }] },
      { num: '17', stem: '<b>Stretch.</b> Solve each equation over the real numbers.', parts: [
        { id: 'e17a', level: 'PRG', make: function (r) { return eqMC(r, 3, -1, r.int(2, 6)); } },
        { id: 'e17b', level: 'PRG', make: function (r) { return eqMC(r, 4, 1, r.int(2, 5)); } },
        { id: 'e17c', level: 'PRG', make: function (r) { return eqMC(r, 4, -1, r.int(2, 5)); } },
        { id: 'e17d', level: 'PRG', make: function (r) { return eqMC(r, 5, 1, r.int(2, 3)); } },
        { id: 'e17e', level: 'MAS', make: function (r) {
          return mcPart(r, 'How many real solutions does ' + t('x^{n}=k') + ' have?', [
            { html: 'Even ' + t('n') + ': two if ' + t('k>0') + ', one if ' + t('k=0') + ', none if ' + t('k<0') + '. Odd ' + t('n') + ': exactly one for every real ' + t('k') + '.', right: true },
            { html: 'Always two, ' + t('x=\\pm\\sqrt[n]{k}') + '.', why: 'Check ' + t('x^{3}=-125') + ': only ' + t('-5') + ' works, and ' + t('x^{4}=-81') + ' has no solution.' },
            { html: 'Even ' + t('n') + ': exactly one. Odd ' + t('n') + ': two if ' + t('k>0') + '.', why: 'Swap it around: ' + t('x^{4}=81') + ' has two solutions (' + t('\\pm 3') + ') and ' + t('x^{5}=32') + ' has one.' },
            { html: 'Odd ' + t('n') + ': none if ' + t('k<0') + '.', why: t('x^{3}=-125') + ' has the solution ' + t('-5') + ': odd powers can be negative.' }],
            'Even powers erase the sign, so two bases land on each positive value and none on a negative value. Odd powers keep the sign, so exactly one base gives each real value.', ['Look back at the four equations you just solved.'], 'number of solutions of xⁿ=k');
        } }] },
      { num: '18', stem: '<b>Stretch — nested radicals.</b> Work from the inside out.', parts: [
        { id: 'e18a', level: 'PRG', make: function (r) { var s = r.int(2, 5); return nestPart(2, 2, ipow(s, 4), s); } },
        { id: 'e18b', level: 'PRG', make: function (r) { var s = r.pick([2, 3]); return nestPart(3, 2, ipow(s, 6), s); } },
        { id: 'e18c', level: 'PRG', make: function (r) { var s = r.pick([2, 3]); return nestPart(2, 3, ipow(s, 6), s); } },
        { id: 'e18d', level: 'MAS', make: function (r) {
          var mn = r.pick([[2, 3], [2, 3], [3, 2], [2, 2], [3, 3], [2, 4]]), outer = mn[0], inner = mn[1], N = outer * inner, e = rt(outer, rt(inner, 'x'));
          var p = P.math('Rewrite ' + t(e) + ' as a <b>single</b> radical (assume ' + t('x\\ge 0') + ').', K.varRadical(rt(N, 'x'), 'entire', { diag: function (rr) {
            if (rr && rr.n === outer + inner && rr.rad.vars.x === 1 && !Object.keys(rr.vars).length) return { code: 'added-index', hint: 'Multiply the indices, don’t add them: the number is used as a factor ' + outer + ' times to make ' + t(rt(inner, 'x')) + ', and that ' + inner + ' times to make ' + t('x') + '.' };
            return null;
          } }), rt(N, 'x'), t(e + '=' + rt(N, 'x')) + '. Rule: an ' + t('m') + 'th root inside an ' + t('n') + 'th root is one root of index ' + t('m\\times n') + ': ' + t('\\sqrt[n]{\\sqrt[m]{x}}=\\sqrt[mn]{x}') + '. Check: ' + t('\\sqrt{\\sqrt{81}}=\\sqrt[4]{81}=3') + '.',
            ['How many times must the answer be used as a factor to get back to ' + t('x') + '?', 'Try it with numbers: ' + t('\\sqrt{\\sqrt{81}}=\\sqrt{9}=3') + ', and ' + t('3^{4}=81') + '.'], 'single radical ' + outer + '√' + inner + '√x', { keys: 'var' });
          p.bad = [rt(N, 'x^{2}'), rt(N + 1, 'x')].concat(outer + inner !== N ? [rt(outer + inner, 'x')] : []);
          return p;
        } }] },
      { num: '19', section: 'Extra practice G — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'PRG', make: function (r) {
          var f1 = r.pick([[2, 3], [1, 2], [3, 4], [2, 5]]), f2 = r.pick([[2, 3], [1, 2], [1, 3], [3, 5]]), e = r.pick([2, 3]);
          var A = rt(3, '-\\dfrac{' + ipow(f1[0], 3) + '}{' + ipow(f1[1], 3) + '}'), B = rt(4, '-\\dfrac{' + ipow(f2[0], 4) + '}{' + ipow(f2[1], 4) + '}'), C = '-' + rt(4, '\\dfrac{' + ipow(f2[0], 4) + '}{' + ipow(f2[1], 4) + '}'), D = rt(5, '-\\dfrac{1}{' + ipow(e, 5) + '}');
          return mcPart(r, 'Which of the following is <b>not possible</b> in the real number system?', [
            { html: t(A), why: 'Index 3 is odd: ' + t(A + '=-' + rTex(f1)) + ', since ' + t('\\left(-' + rTex(f1) + '\\right)^{3}=-' + rTex([ipow(f1[0], 3), ipow(f1[1], 3)])) + '.' },
            { html: t(B), right: true },
            { html: t(C), why: 'The radicand is positive; the minus sign is outside: ' + t(C + '=-' + rTex(f2)) + '.' },
            { html: t(D), why: 'Index 5 is odd: ' + t(D + '=-\\frac{1}{' + e + '}') + '.' }],
            t(A + '=-' + rTex(f1)) + ' (odd index). ' + t(B) + ': even index, negative radicand — <b>not possible</b>. ' + t(C + '=-' + rTex(f2)) + ' (minus sign outside). ' + t(D + '=-\\frac{1}{' + e + '}') + ' (odd index).', ['Look for an even index with a negative radicand.'], 'which is not possible');
        } }] },
      { num: '20', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e20', level: 'ADV', make: function (r) {
          var s = r.int(3, 9), u = r.pick([2, 3]), w = r.pick([1, 1, 2]), iT = r.chance(0.3), iiiT = r.chance(0.3), U = ipow(u, 6), W5 = ipow(w, 5);
          var st = [
            iT ? { label: 'i)', html: t('\\sqrt{(-' + s + ')^{2}}=' + s), truth: true, reason: t('\\sqrt{(-' + s + ')^{2}}=\\sqrt{' + s * s + '}=' + s) + '.' }
              : { label: 'i)', html: t('\\sqrt{(-' + s + ')^{2}}=-' + s), truth: false, reason: t('\\sqrt{(-' + s + ')^{2}}=\\sqrt{' + s * s + '}=' + s + '\\ne -' + s) + '.' },
            { label: 'ii)', html: t('\\sqrt[3]{(-' + s + ')^{3}}=-' + s), truth: true, reason: t('(-' + s + ')^{3}=-' + s * s * s) + ' and ' + t('\\sqrt[3]{-' + s * s * s + '}=-' + s) + '.' },
            iiiT ? { label: 'iii)', html: t('-\\sqrt[6]{' + U + '}=-' + u), truth: true, reason: t('\\sqrt[6]{' + U + '}=' + u) + ', and the minus sign is outside.' }
              : { label: 'iii)', html: t('-\\sqrt[6]{' + U + '}=\\sqrt[6]{-' + U + '}'), truth: false, reason: t('-\\sqrt[6]{' + U + '}=-' + u) + ', but ' + t('\\sqrt[6]{-' + U + '}') + ' is not possible.' },
            { label: 'iv)', html: t('\\sqrt[5]{-' + W5 + '}=-' + w), truth: true, reason: t('(-' + w + ')^{5}=-' + W5) + '.' }];
          var p = statementsMC(r, 'Consider these four statements.', st, [['ii)', 'iv)'], ['i)', 'ii)', 'iv)'], ['ii)', 'iii)', 'iv)']], 'all four', 'which root statements are true (extra)');
          return p;
        } }] },
      { num: '21', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e21', level: 'ADV', make: function (r) {
          var a, b, c, ans;
          for (var i = 0; i < 200; i++) { a = r.int(11, 16); b = r.int(8, 13); c = r.int(5, 12); ans = a - b + c; if (ans >= 1 && ans <= 99) break; }
          var A = ipow(a, 4), B = b * b * b, e = rt(4, F(A)) + '+' + rt(3, '-' + F(B)) + '+\\sqrt{(-' + c + ')^{2}}';
          var p = P.nr('The value of ' + t(e) + ' is ________. (Record your answer as a three-digit number.)', ans, function (v) {
            if (v === a - b - c) return { code: 'kept-sign', hint: t('\\sqrt{(-' + c + ')^{2}}=\\sqrt{' + c * c + '}') + ' — the principal square root is positive.' };
            if (v === a + b + c) return { code: 'sign', hint: 'The cube root of a negative number is negative.' };
            return null;
          }, t(a + '^{4}=' + F(A)) + ', so ' + t(rt(4, F(A)) + '=' + a) + '. ' + t('(-' + b + ')^{3}=-' + F(B)) + ', so ' + t(rt(3, '-' + F(B)) + '=-' + b) + '. ' + t('\\sqrt{(-' + c + ')^{2}}=\\sqrt{' + c * c + '}=' + c) + '.<br>' + t(a + '+(-' + b + ')+' + c + '=' + ans) + ', recorded as ' + t(('00' + ans).slice(-3)) + '.',
          ['Evaluate each radical separately.', 'Watch the signs: odd root of a negative, and the square root of a square.'], 'NR sum of roots');
          p.key = ('00' + ans).slice(-3); p.answer = t(p.key); p.good = [String(ans)];
          return p;
        } }] }
    ]
  });

  /* ---------- part makers used above (function declarations are hoisted) ---------- */
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function vocabPart(n, m, k) {
    var e = (k > 1 ? k : '') + rt(n, m), idxCheck = function (resp) {
      if (String(resp == null ? '' : resp).trim() === '' && n === 2) return form('no-index', 'Every radical has an index. When none is written, which index is understood?');
      return K.number(n, function (v) {
        if (v === m) return { code: 'swapped-ir', hint: 'The index is the small number in the notch of the radical sign; the radicand is under the bar.' };
        if (k > 1 && v === k) return { code: 'coef-index', hint: t(k) + ' is a coefficient — it multiplies the radical. The index sits in the notch' + (n === 2 ? ' (here nothing is written there).' : '.') };
        if (n === 2 && (v === 1 || v === 0)) return { code: 'no-index', hint: 'A plain ' + t('\\sqrt{\\ }') + ' is a square root. What index does a square root have?' };
        return null;
      })(resp);
    };
    var radCheck = K.number(m, function (v) {
      if (v === n) return { code: 'swapped-ir', hint: 'The radicand is the number <b>under</b> the radical sign.' };
      if (k > 1 && v === k * m) return { code: 'coef-radicand', hint: 'The ' + t(k) + ' is outside the radical, so it isn’t part of the radicand.' };
      return null;
    });
    return P.fields(t(e), [{ name: 'Index', label: 'Index' }, { name: 'Radicand', label: 'Radicand' }], [idxCheck, radCheck], [String(n), String(m)], 'index ' + t(n) + ', radicand ' + t(m),
      (n === 2 ? 'No index is written, so the index is ' + t('2') + '. ' : 'Index ' + t('=' + n) + ' (the number in the notch). ') + (k > 1 ? 'The ' + t(k) + ' in front is a coefficient, not part of the radical. ' : '') + 'Radicand ' + t('=' + m) + ' (the number under the radical sign).',
      ['The index sits in the notch of the radical sign; the radicand sits under the bar.'], 'index & radicand of ' + (k > 1 ? k : '') + n + '√' + m);
  }
  function prodPart(a, b) {
    var m = a * b, e = '\\sqrt{' + a + '}\\times\\sqrt{' + b + '}';
    return singlePart(e, m, productDiag(a, b), t(e + '=\\sqrt{' + a + '\\times ' + b + '}=\\sqrt{' + m + '}') + '.', ['Use the product rule: ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '.'], 'single radical √' + a + '×√' + b,
      ['\\sqrt{' + (a + b) + '}']);
  }
  function quotPart(a, b) {
    var m = a / b, e = '\\dfrac{\\sqrt{' + a + '}}{\\sqrt{' + b + '}}', sm = Math.round(Math.sqrt(m));
    return singlePart(e, m, function (M, v) {
      if (same(v, m)) return { code: 'no-root', hint: t(a + '\\div ' + b + '=' + m) + ' is the radicand. Keep the square root: the answer is a radical.' };
      if (M === a * b) return { code: 'multiplied', hint: 'This is a quotient: <b>divide</b> the radicands, ' + t('\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}') + '.' };
      if (M === a - b) return { code: 'subtracted', hint: 'Divide the radicands — don’t subtract them.' };
      if (same(v, 1)) return { code: 'cancel', hint: 'You can’t cancel like that. Use ' + t('\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}') + '.' };
      return null;
    }, t(e + '=\\sqrt{\\dfrac{' + a + '}{' + b + '}}=\\sqrt{' + m + '}') + (sm * sm === m ? ' (which equals ' + t(sm) + ')' : '') + '.', ['Use the quotient rule: ' + t('\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}') + '.'], 'single radical √' + a + '/√' + b,
    ['\\sqrt{' + a * b + '}', '\\sqrt{' + (a - b) + '}', String(m)], sm * sm === m ? [String(sm)] : []);
  }
  function decimalRoot(n, k, dpAns) {
    // root = k / 10^dpAns (k may be negative); radicand = k^n / 10^(n*dpAns)
    var den = Math.pow(10, n * dpAns), num = ipow(k, n), x = k / Math.pow(10, dpAns), radDp = n * dpAns, radStr = (num < 0 ? '-' : '') + (Math.abs(num) / den).toFixed(radDp);
    var e = rt(n, radStr), ans = x.toFixed(dpAns);
    var chk = K.value(x, { only: 'fraction', diag: function (v) {
      if (same(v, x * 10) || same(v, x / 10)) return { code: 'places', hint: 'Check the decimal places: the radicand has ' + radDp + ' decimal places, and ' + radDp + ' ÷ ' + n + ' = ' + dpAns + ', so the answer has ' + dpAns + (dpAns === 1 ? ' decimal place.' : ' decimal places.') + ' Check by raising your answer to the power ' + n + '.' };
      if (same(v, -x)) return { code: 'sign', hint: n % 2 ? 'An odd root of a negative number is negative.' : 'The principal root is positive.' };
      return null;
    } });
    var p = P.math(t(e), chk, ans, t(e + '=' + rt(n, (num < 0 ? '-' : '') + '\\dfrac{' + F(Math.abs(num)) + '}{' + F(den) + '}')) + '. ' + t(powTex(Math.abs(k), n) + '=' + F(Math.abs(num))) + ' and ' + t(powTex(Math.pow(10, dpAns), n) + '=' + F(den)) + ', so the root is ' + t((k < 0 ? '-' : '') + '\\dfrac{' + Math.abs(k) + '}{' + Math.pow(10, dpAns) + '}=' + ans) + ' (' + radDp + ' places ÷ ' + n + ' = ' + dpAns + ' place' + (dpAns > 1 ? 's' : '') + ').',
      ['Write the decimal as a fraction over a power of ten, then take the root of the top and the bottom.', 'Check: raise your answer to the power ' + n + '.'], n + '√' + radStr, { keys: 'fraction' });
    p.good = [ans.replace(/^(-?)0\./, '$1.')]; p.bad = [(x * 10).toFixed(Math.max(0, dpAns - 1)), (x / 10).toFixed(dpAns + 1)];
    return p;
  }
  function powRoot(n, s, outerNeg) {
    // ⁿ√((−s)ⁿ), optionally with a minus sign in front
    var inner = '(-' + s + ')^{' + n + '}', e = (outerNeg ? '-' : '') + rt(n, inner), P2 = ipow(-s, n), root = n % 2 ? -s : s, ans = outerNeg ? -root : root;
    return P.number(t(e), ans, function (v) {
      if (v === -ans) {
        if (n % 2 === 0 && !outerNeg) return { code: 'kept-sign', hint: 'Work out the power first: ' + t(inner + '=' + P2) + ' (positive, because the power is even). The principal root of a positive number is positive.' };
        if (n % 2 === 0) return { code: 'sign', hint: 'Inside: ' + t(inner + '=' + P2) + ' and ' + t(rt(n, P2) + '=' + s) + '. Then apply the minus sign in front.' };
        return { code: 'sign', hint: t(inner + '=' + P2) + ' (an odd power keeps the sign). Its ' + nth(n) + ' root is negative too.' };
      }
      if (v === P2 || v === -P2) return { code: 'no-root', hint: 'That’s the power. Now take the ' + nth(n) + ' root.' };
      return null;
    }, t(inner + '=' + P2) + (n % 2 ? ' (odd power: the sign is kept)' : ' (even power: the sign is gone)') + ', so ' + t(rt(n, inner) + '=' + rt(n, P2) + '=' + root) + '.' + (outerNeg ? ' The minus sign in front then gives ' + t(e + '=' + ans) + '.' : ''),
    ['Evaluate the power inside the radical first.', 'An even power is never negative; an odd power keeps the sign.'], (outerNeg ? '-' : '') + n + '√((-' + s + ')^' + n + ')');
  }
  function pairMC(r, A, B, opts, sol, text) { return mcPart(r, 'Evaluate ' + t(A) + ' and ' + t(B) + '. Are they equal?', opts, sol, ['Evaluate each one separately. Where is the minus sign — inside or outside the radical?'], text); }
  function bracketPart(n, m) {
    var x = nroot(m, n), lo = Math.floor(x), hi = lo + 1, e = rt(n, m);
    function side(isLo) {
      var want = isLo ? lo : hi;
      return K.number(want, function (v) {
        if (!Number.isInteger(v)) return { code: 'bracket', hint: 'Give a whole number (an integer).' };
        if (v === ipow(want, n)) return { code: 'power-not-root', hint: t(ipow(want, n)) + ' is the ' + perfName(n) + '. Give the integer it comes from: the root, not the power.' };
        if (isLo && v === hi) return { code: 'swapped-bounds', hint: 'That’s the larger integer. The first box is the smaller one' + (m < 0 ? ' — for negatives, that is the one further from zero.' : '.') };
        if (!isLo && v === lo) return { code: 'swapped-bounds', hint: 'That’s the smaller integer. The second box is the larger one' + (m < 0 ? ' — for negatives, that is the one closer to zero.' : '.') };
        var vp = ipow(v, n);
        if (isLo) return vp > m ? { code: 'bracket', hint: 'Check: ' + t(powTex(v, n) + '=' + vp) + ', which is more than ' + t(m) + '.' } : { code: 'bracket', hint: 'Get closer: ' + t(powTex(v + 1, n) + '=' + ipow(v + 1, n)) + ' is still less than ' + t(m) + '.' };
        return vp < m ? { code: 'bracket', hint: 'Check: ' + t(powTex(v, n) + '=' + vp) + ', which is less than ' + t(m) + '.' } : { code: 'bracket', hint: 'Get closer: ' + t(powTex(v - 1, n) + '=' + ipow(v - 1, n)) + ' is still more than ' + t(m) + '.' };
      });
    }
    return P.fields(t(e), [{ name: 'Smaller integer', label: 'Smaller integer', after: t('<' + e) }, { name: 'Larger integer', label: 'Larger integer', before: t(e + '<') }], [side(true), side(false)], [String(lo), String(hi)], t(lo + '<' + e + '<' + hi),
      t(powTex(lo, n) + '=' + ipow(lo, n)) + ' and ' + t(powTex(hi, n) + '=' + ipow(hi, n)) + ', and ' + t(ipow(lo, n) + '<' + m + '<' + ipow(hi, n)) + ', so ' + t(lo + '<' + e + '<' + hi) + '.',
      ['List the ' + perfName(n) + 's' + (m < 0 ? ' of negative integers' : '') + ' near ' + t(m) + '.', 'Which two consecutive integers have ' + nth(n) + ' powers on either side of ' + t(m) + '?'], 'bracket ' + n + '√' + m);
  }
  function refinePart(n, m) {
    var x = nroot(m, n), want = K.roundTo(x, 1), e = rt(n, m), base = Math.floor(x * 10), mid = (base + 0.5) / 10, midP = Math.pow(mid, n);
    var midStr = decStr(midP, 2 * n), lo = Math.floor(x), hi = lo + 1, a1 = base / 10, a2 = (base + 1) / 10;
    var test = t(powTex(Number(mid.toFixed(2)), n, true) + '=' + midStr + (midP > m ? '>' : '<') + m);
    var p = P.approx(t(e), x, 1, { diag: function (v) {
      if (Math.abs(v - (want + 0.1)) < 1e-9 || Math.abs(v - (want - 0.1)) < 1e-9) return { code: 'halfway', hint: 'Close — test the halfway value ' + t(mid.toFixed(2)) + ': ' + test + '. Which way does that tell you to round?' };
      if (v < lo || v > hi) return { code: 'bracket', hint: 'Bracket it first: ' + t(lo + '<' + e + '<' + hi) + ', since ' + t(powTex(lo, n) + '=' + ipow(lo, n)) + ' and ' + t(powTex(hi, n) + '=' + ipow(hi, n)) + '.' };
      return null;
    } }, 'Between ' + t(lo) + ' and ' + t(hi) + '. Halfway test: ' + test + ', so ' + t(e) + (midP > m ? ' is less than ' : ' is more than ') + t(mid.toFixed(2)) + '. Check: ' + t(powTex(a1, n, true) + '=' + decStr(Math.pow(a1, n), n)) + ' and ' + t(powTex(a2, n, true) + '=' + decStr(Math.pow(a2, n), n)) + '. So ' + t(e + '\\approx ' + want.toFixed(1)) + '.',
    ['Bracket the root between two integers, then try tenths.', 'Raise the halfway value between two tenths to the power ' + n + ' and compare with ' + t(m) + '.'], 'estimate ' + n + '√' + m + ' to 1 dp');
    p.bad = [(want + (midP > m ? 0.1 : -0.1)).toFixed(1)];
    return p;
  }
  function eqMC(r, n, sign, s) {
    var k = sign * ipow(s, n), opts;
    var NO = 'no real solution';
    if (sign < 0 && n % 2 === 0) opts = [{ html: NO, right: true }, { html: t('x=' + -s), why: t('(-' + s + ')^{' + n + '}=+' + ipow(s, n)) + ': an even power is never negative.' }, { html: t('x=\\pm ' + s), why: 'Both ' + t(s) + ' and ' + t(-s) + ' give ' + t('+' + ipow(s, n)) + '.' }, { html: t('x=' + s), why: t(s + '^{' + n + '}=' + ipow(s, n)) + ', not ' + t(k) + '.' }];
    else if (n % 2 === 0) opts = [{ html: t('x=\\pm ' + s), right: true }, { html: t('x=' + s), why: 'There is another one: try ' + t('(-' + s + ')^{' + n + '}') + '.' }, { html: t('x=' + -s), why: 'Try ' + t(s + '^{' + n + '}') + ' as well.' }, { html: NO, why: t(s + '^{' + n + '}=' + ipow(s, n)) + ', so there is a solution.' }];
    else opts = [{ html: t('x=' + (sign * s)), right: true }, { html: t('x=\\pm ' + s), why: 'An odd power keeps the sign: ' + t(powTex(-sign * s, n) + '=' + (-k)) + ', not ' + t(k) + '.' }, { html: t('x=' + (-sign * s)), why: t(powTex(-sign * s, n) + '=' + (-k)) + '. Check the sign.' }, { html: NO, why: 'An odd power can be ' + (sign < 0 ? 'negative' : 'any real number') + ': try ' + t(powTex(sign * s, n)) + '.' }];
    var sol = (sign < 0 && n % 2 === 0) ? 'An even power of a real number is never negative, so ' + t('x^{' + n + '}=' + k) + ' has <b>no real solution</b>.'
      : n % 2 === 0 ? t(s + '^{' + n + '}=' + k) + ' and ' + t('(-' + s + ')^{' + n + '}=' + k) + ', so ' + t('x=\\pm ' + s) + ' (two solutions).'
        : t(powTex(sign * s, n) + '=' + k) + ' (odd power: the sign is kept), so ' + t('x=' + sign * s) + ' (one solution).';
    return mcPart(r, 'Solve ' + t('x^{' + n + '}=' + k) + '.', opts, sol, ['Test positive and negative values. Is the exponent even or odd?'], 'solve x^' + n + '=' + k);
  }
  function nestPart(outer, inner, M, s) {
    var e = rt(outer, rt(inner, M)), mid = Math.round(nroot(M, inner));
    return P.number(t(e), s, function (v) {
      if (v === mid) return { code: 'inner-roots', hint: 'You did the inside: ' + t(rt(inner, M) + '=' + mid) + '. Now take the ' + nth(outer) + ' root of ' + t(mid) + '.' };
      if (isPerfect(M, outer) && v === Math.round(nroot(M, outer))) return { code: 'inner-roots', hint: 'Work from the <b>inside</b> out: start with ' + t(rt(inner, M)) + '.' };
      return null;
    }, 'Inside first: ' + t(rt(inner, M) + '=' + mid) + '. Then ' + t(rt(outer, mid) + '=' + s) + ' (since ' + t(s + '^{' + outer + '}=' + mid) + ').', ['Work from the inside out.'], 'nested ' + outer + '√' + inner + '√' + M);
  }
})(window);
