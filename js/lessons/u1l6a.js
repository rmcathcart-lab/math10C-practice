/* Math 10C · Unit 1 · Lesson 6A — Entire and Mixed Radicals (AN2)
 * Assignment questions 1–16 (u1_L06A.tex) and the square-root items of the Lesson 6 Extra Practice (u1_EP06.tex:
 * Q1–5, 11, 13b, 13d, 17a–c, 18, 19, 20a–b). Index-3-and-higher items and radicals with variables belong to 6B.
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, F = HW.fmt, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'coef-forgot': 'Simplified the root but dropped the coefficient in front', 'coef-added': 'Added the outside numbers instead of multiplying',
    'frac-den': 'Forgot to divide by the coefficient’s denominator', 'frac-num': 'Forgot to multiply by the coefficient’s numerator',
    'neg-inside': 'Put a negative under a square root', 'whole-radicand': 'Left a fraction (or a root) in the radicand/denominator',
    'den-root': 'Didn’t take the square root of the denominator', 'den-dropped': 'Lost the denominator', 'den-square': 'Didn’t square the coefficient’s denominator',
    'no-root': 'Didn’t take the square root', 'wrong-base': 'Used the wrong given approximation', place: 'Place value off by a power of 10',
    'hyp-added': 'Added the squares when the hypotenuse was given', 'used-slant': 'Used the wrong side in the two-triangle figure', 'used-base': 'Used the wrong side in the two-triangle figure',
    doubled: 'Doubled the number instead of squaring it', 'no-halve': 'Didn’t halve the exponent when taking it out', 'add-radicands': 'Added/subtracted the radicands',
    'two-dims': 'Used only two of the three dimensions', 'no-half': 'Forgot the ½ in the triangle area formula', product: 'Multiplied a and b instead of adding',
    sum: 'Added p and q instead of multiplying', 'round-early': 'Rounded the approximation further', 'not-smallest': 'Works, but not the smallest', whole: 'Gave a perfect square (a whole-number root, not a mixed radical)',
    'no-square': 'Didn’t square the coefficient', louis: 'Gave the exact-value answer for Louis', asia: 'Rounded too early for Asia', 'area-decimal': 'Gave a decimal area',
    'mc-said-entire': 'Called a mixed radical entire', 'mc-said-mixed': 'Called an entire radical mixed'
  });

  /* ---------- small helpers ---------- */
  function R(c) { return typeof c === 'number' ? [c, 1] : c; }
  function rv(c) { c = R(c); return c[0] / c[1]; }
  function mulR(a, b) { a = R(a); b = R(b); return ex.norm(a[0] * b[0], a[1] * b[1]); }
  function isOne(c) { c = R(c); return c[0] === 1 && c[1] === 1; }
  function big(n) { return ex.nthFactor(n, 2); }                       // largest s with s² | n
  function sqFree(n) { return n > 1 && ex.simplest(n, 2); }
  function isSq(n) { var s = Math.round(Math.sqrt(n)); return s * s === n; }
  function near(x, y) { return ex.eq(x, y, 1e-7); }
  function gcd(a, b) { return ex.gcd(a, b); }
  function sq(n) { return '\\sqrt{' + F(n) + '}'; }
  function cTex(c) { c = R(c); if (c[1] === 1) return c[0] === 1 ? '' : c[0] === -1 ? '-' : String(c[0]); return (c[0] < 0 ? '-' : '') + '\\dfrac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  function kTex(c) { c = R(c); if (c[1] === 1) return String(c[0]); return (c[0] < 0 ? '-' : '') + '\\tfrac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  function ansTex(k, m) { k = R(k); if (m === 1) return ex.texRat(k); if (k[1] === 1) return (k[0] === 1 ? '' : k[0] === -1 ? '-' : k[0]) + sq(m); return (k[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(k[0]) + '}{' + k[1] + '}' + sq(m); }
  function plain(k, m) { k = R(k); var c = k[1] === 1 ? (k[0] === 1 ? '' : k[0] === -1 ? '-' : String(k[0])) : (k[0] < 0 ? '-' : '') + '(' + Math.abs(k[0]) + '/' + k[1] + ')'; return m === 1 ? ex.texRat(k).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2') : c + 'sqrt(' + m + ')'; }
  var SF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
  function pickWhere(r, gen, test, tries) { for (var i = 0; i < (tries || 400); i++) { var v = gen(); if (test(v)) return v; } return null; }
  function mathPart(prompt, check, key, answer, sol, hints, text, extra) {
    var p = { prompt: prompt, input: { type: 'math', keys: 'radical' }, check: check, key: key, answer: answer, solution: sol, hints: hints, text: text };
    if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }

  /* ---------- simple figures (inline SVG, math coordinates with y up) ---------- */
  function svgWrap(w, h, body, x0, y0) {
    x0 = x0 || 0; y0 = y0 || 0;
    return '<div style="margin:.5em 0 .2em"><svg viewBox="' + Math.floor(x0) + ' ' + Math.floor(y0) + ' ' + Math.ceil(w) + ' ' + Math.ceil(h) + '" width="100%" style="max-width:' + Math.ceil(w) + 'px;display:block" role="img" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" font-size="15" font-family="KaTeX_Main,\'Times New Roman\',serif">' + body + '</svg></div>';
  }
  function txt(x, y, s, it) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="currentColor" stroke="none" text-anchor="middle" dominant-baseline="central"' + (it ? ' font-style="italic"' : '') + '>' + s + '</text>'; }
  function fig(pts, o) {
    var names = Object.keys(pts), xs = names.map(function (n) { return pts[n][0]; }), ys = names.map(function (n) { return pts[n][1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var W = o.W || 230, H = o.H || 140, pad = 34, sc = Math.min(W / ((x1 - x0) || 1), H / ((y1 - y0) || 1));
    var w = (x1 - x0) * sc + 2 * pad, h = (y1 - y0) * sc + 2 * pad, Q = {};
    names.forEach(function (n) { Q[n] = [pad + (pts[n][0] - x0) * sc, pad + (y1 - pts[n][1]) * sc]; });
    var cx = names.reduce(function (s, n) { return s + Q[n][0]; }, 0) / names.length, cy = names.reduce(function (s, n) { return s + Q[n][1]; }, 0) / names.length, body = '';
    var bx0 = 0, by0 = 0, bx1 = w, by1 = h;
    function lab(x, y, str, it) { var hw = String(str).length * 4.2 + 2; bx0 = Math.min(bx0, x - hw); bx1 = Math.max(bx1, x + hw); by0 = Math.min(by0, y - 11); by1 = Math.max(by1, y + 11); return txt(x, y, str, it); }
    (o.edges || []).forEach(function (e) { body += '<line x1="' + Q[e[0]][0].toFixed(1) + '" y1="' + Q[e[0]][1].toFixed(1) + '" x2="' + Q[e[1]][0].toFixed(1) + '" y2="' + Q[e[1]][1].toFixed(1) + '"/>'; });
    (o.right || []).forEach(function (rr) {
      var V = Q[rr[0]], A = Q[rr[1]], B = Q[rr[2]];
      function u(Pp) { var dx = Pp[0] - V[0], dy = Pp[1] - V[1], L = Math.sqrt(dx * dx + dy * dy); return [dx / L * 10, dy / L * 10]; }
      var a = u(A), b = u(B);
      body += '<path stroke-width="1.2" d="M' + (V[0] + a[0]).toFixed(1) + ' ' + (V[1] + a[1]).toFixed(1) + ' L' + (V[0] + a[0] + b[0]).toFixed(1) + ' ' + (V[1] + a[1] + b[1]).toFixed(1) + ' L' + (V[0] + b[0]).toFixed(1) + ' ' + (V[1] + b[1]).toFixed(1) + '"/>';
    });
    (o.labels || []).forEach(function (lb) {
      var A = Q[lb[0]], B = Q[lb[1]], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L, ny = dx / L;
      if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
      var tw = String(lb[2]).replace(/&[a-z]+;/g, 'x').length * 7.6, off = 10 + Math.abs(nx) * tw / 2 + Math.abs(ny) * 6;
      body += lab(mx + nx * off, my + ny * off, lb[2], lb[3]);
    });
    (o.names || []).forEach(function (n) {
      var Pp = Q[n], dx = Pp[0] - cx, dy = Pp[1] - cy, L = Math.sqrt(dx * dx + dy * dy) || 1;
      body += lab(Pp[0] + dx / L * 15, Pp[1] + dy / L * 15, n, true);
    });
    return svgWrap(bx1 - bx0, by1 - by0, body, bx0, by0);
  }
  function rightTri(legV, legH, o) { // right angle at bottom-left: O=(0,0), H=(legH,0), V=(0,legV)
    o = o || {};
    return fig({ V: [0, legV], O: [0, 0], H: [legH, 0] }, { edges: [['V', 'O'], ['O', 'H'], ['H', 'V']], right: [['O', 'V', 'H']], labels: o.labels, W: o.W, H: o.H });
  }

  /* ---------- reusable part makers ---------- */
  /* c·√n -> simplest mixed radical. c: integer or [p,q]; o.disp: coefficient as shown; o.extraDiag(val) */
  function mixedSol(c, n, cd) {
    var s = big(n), m = n / (s * s), k = mulR(c, s);
    if (s === 1) return t(F(n) + '=' + K.fac(n)) + ': no prime factor appears twice, so no perfect square (other than ' + t('1') + ') divides ' + t(F(n)) + '.<br>' + t(cd + sq(n)) + ' <b>cannot be simplified</b> — it is already in simplest form.';
    var out = m === 1 ? t(F(n) + '=' + s + '^{2}') + ', so ' + t(sq(n) + '=' + s) + '.'
      : 'The largest perfect square that divides ' + t(F(n)) + ' is ' + t(F(s * s) + '=' + s + '^{2}') + ': ' + t(F(n) + '=' + F(s * s) + '\\times ' + m) + '.<br>' + t(sq(n) + '=\\sqrt{' + F(s * s) + '}\\times\\sqrt{' + m + '}=' + ansTex(s, m)) + '.';
    if (!isOne(c)) out += '<br>' + t(cd + '\\times ' + (m === 1 ? s : ansTex(s, m)) + '=' + ansTex(k, m)) + '.';
    return out;
  }
  function mixedDiag(c, n, cd, more) {
    c = R(c);
    var s = big(n), m = n / (s * s), rm = Math.sqrt(m), cv = rv(c);
    return function (val, r) {
      if (!isFinite(val)) return null;
      if (more) { var h = more(val, r); if (h) return h; }
      if (s === 1) return null;
      if (!isOne(c) && near(Math.abs(val), s * rm)) return { code: 'coef-forgot', hint: 'Good start: ' + t(sq(n) + '=' + ansTex(s, m)) + '. Now multiply by the ' + t(cd) + ' in front.' };
      if (c[1] === 1 && Math.abs(c[0]) > 1 && near(Math.abs(val), (Math.abs(c[0]) + s) * rm)) return { code: 'coef-added', hint: 'The ' + t(s) + ' that comes out of the root <b>multiplies</b> the ' + t(Math.abs(c[0])) + ' already in front — don’t add them.' };
      if (near(Math.abs(val), Math.abs(cv) * s * s * rm)) return { code: 'coef-power', hint: t(F(s * s)) + ' comes out of the root as its square root: ' + t('\\sqrt{' + F(s * s) + '}=' + s) + ', not ' + t(F(s * s)) + '.' };
      if (c[1] > 1 && near(Math.abs(val), Math.abs(c[0]) * s * rm)) return { code: 'frac-den', hint: 'Don’t forget the denominator: the coefficient is ' + t(cd.replace(/^-/, '')) + ', so divide by ' + t(c[1]) + ' as well.' };
      if (c[1] > 1 && Math.abs(c[0]) > 1 && near(Math.abs(val), s / c[1] * rm)) return { code: 'frac-num', hint: 'Multiply by the numerator ' + t(Math.abs(c[0])) + ' of the coefficient as well.' };
      return null;
    };
  }
  function mixedCheck(c, n, o) {
    o = o || {}; c = R(c);
    var s = big(n), m = n / (s * s), k = mulR(c, s), cd = o.disp != null ? o.disp : cTex(c);
    return K.radical({ k: k, n: 2, m: m }, 'mixed', { diag: mixedDiag(c, n, cd, o.more) });
  }
  function toMixed(c, n, o) {
    o = o || {}; c = R(c);
    var s = big(n), m = n / (s * s), k = mulR(c, s), cd = o.disp != null ? o.disp : cTex(c);
    var bad = [];
    if (s > 1 && m > 1) { bad.push(ansTex(mulR(c, s * s), m)); if (isOne(c)) bad.push(sq(n)); else bad.push(ansTex(s, m)); }
    return mathPart(o.prompt || t(cd + sq(n)), mixedCheck(c, n, o), ex.texRadical(k, 2, m), t(ansTex(k, m)), mixedSol(c, n, cd),
      s === 1 ? ['Look for a perfect square that divides ' + t(F(n)) + ' (try ' + t('4, 9, 25, 49, \\ldots') + '). Its prime factorization may help.', 'If no perfect square (other than 1) divides the radicand, the radical is already in simplest form — type it unchanged.']
        : ['Find the <b>largest</b> perfect square that divides ' + t(F(n)) + ' (' + t('4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, \\ldots') + ').', 'Write ' + t(sq(n) + '=\\sqrt{\\square}\\times\\sqrt{\\square}') + ', take the square root of the perfect square' + (isOne(c) ? '.' : ', then multiply by the ' + t(cd) + ' in front.')],
      'simplify ' + cd.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2') + '√' + n, { good: [plain(k, m)], bad: bad });
  }

  /* c·√m -> entire radical (a negative coefficient stays outside the root) */
  function entireCheck(c, m, o) {
    o = o || {}; c = R(c);
    var cv = rv(c), ca = [Math.abs(c[0]), c[1]], N = Math.round(cv * cv * m), neg = cv < 0, V = cv * Math.sqrt(m);
    var diag = function (val, r) {
      if (o.more) { var h = o.more(val, r); if (h) return h; }
      if (!isFinite(val)) return null;
      var av = Math.abs(val);
      if (c[1] > 1) {
        if (near(av, Math.sqrt(Math.abs(cv) * m))) return { code: 'no-power', hint: 'Square the coefficient before it goes inside: ' + t('\\left(\\tfrac{' + ca[0] + '}{' + ca[1] + '}\\right)^{2}=\\tfrac{' + ca[0] * ca[0] + '}{' + ca[1] * ca[1] + '}') + '.' };
        if (near(av, Math.sqrt(ca[0] * ca[0] * m)) || near(av, Math.sqrt(ca[0] * ca[0] * m / ca[1]))) return { code: 'den-square', hint: 'Square the whole coefficient, denominator too: ' + t('\\left(\\tfrac{' + ca[0] + '}{' + ca[1] + '}\\right)^{2}=\\tfrac{' + ca[0] * ca[0] + '}{' + ca[1] * ca[1] + '}') + '.' };
      }
      return null;
    };
    var base = K.radical({ k: ca, n: 2, m: m }, 'entire', { diag: diag });
    return function (resp) {
      var s = String(resp == null ? '' : resp);
      if (/\\sqrt\s*\{\s*-|sqrt\s*\(\s*-|√\s*-/.test(s)) return wrong('neg-inside', 'A negative number has no real square root, so the negative sign can’t go under the root. Leave it <b>outside</b>: ' + t('-a\\sqrt{b}=-\\sqrt{a^{2}b}') + '.');
      var a = K.read(resp); if (a.res) return a.res;
      var r = ex.radical(a.ast);
      if (ex.eq(a.val, V)) {
        if (r && r.n === 2 && Math.abs(r.k[0]) === 1 && r.k[1] === 1) return ok();
        if (o.notEntire) return o.notEntire;
        return form('not-entire', 'Right value, but an entire radical has nothing in front of the root' + (neg ? ' except the negative sign' : '') + '. Square the ' + t(kTex(ca)) + ' and multiply it into the radicand.');
      }
      if (neg && ex.eq(a.val, -V)) return wrong('sign', 'The coefficient is negative, so the answer is negative. Keep the negative sign <b>outside</b> the root: ' + t('-\\sqrt{\\square}') + '.');
      return base(resp);
    };
  }
  function entireSol(c, m, cd) {
    c = R(c);
    var cv = rv(c), ca = [Math.abs(c[0]), c[1]], N = Math.round(cv * cv * m), neg = cv < 0;
    var sqc = ca[1] === 1 ? ca[0] + '^{2}=' + ca[0] * ca[0] : '\\left(\\tfrac{' + ca[0] + '}{' + ca[1] + '}\\right)^{2}=\\tfrac{' + ca[0] * ca[0] + '}{' + ca[1] * ca[1] + '}';
    return (neg ? 'The negative sign stays outside the root. ' : '') + 'Square the coefficient: ' + t(sqc) + '. Multiply it into the radicand: ' + t((ca[1] === 1 ? ca[0] * ca[0] : '\\tfrac{' + ca[0] * ca[0] + '}{' + ca[1] * ca[1] + '}') + '\\times ' + F(m) + '=' + F(N)) + '.<br>' + t(cd + sq(m) + '=' + (neg ? '-' : '') + sq(N)) + '.';
  }
  function toEntire(c, m, o) {
    o = o || {}; c = R(c);
    var cv = rv(c), N = Math.round(cv * cv * m), neg = cv < 0, cd = o.disp != null ? o.disp : cTex(c), key = (neg ? '-' : '') + sq(N);
    var bad = [cd.replace(/\\dfrac/g, '\\frac') + sq(m)];
    if (c[1] === 1 && Math.abs(c[0]) > 1) bad.push((neg ? '-' : '') + sq(Math.abs(c[0]) * m));
    if (neg) bad.push(sq(N));
    return mathPart(o.prompt || t(cd + sq(m)), entireCheck(c, m, o), key, t(key), o.sol || entireSol(c, m, cd),
      ['To move a number inside a square root, <b>square</b> it first: ' + t('a\\sqrt{b}=\\sqrt{a^{2}}\\times\\sqrt{b}=\\sqrt{a^{2}b}') + '.', neg ? 'A negative coefficient stays outside: ' + t('-a\\sqrt{b}=-\\sqrt{a^{2}b}') + '.' : 'Then multiply the square by the number already under the root.'],
      'entire form of ' + cd.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2') + '√' + m, { bad: bad });
  }

  /* c·√(num/den) -> mixed radical with a whole-number radicand (den a perfect square) */
  function fracRootPart(c, num, den) {
    c = R(c);
    var a = big(num), m = num / (a * a), b = Math.round(Math.sqrt(den)), k = mulR(c, [a, b]), cd = cTex(c), cv = Math.abs(rv(c)), rm = Math.sqrt(m);
    var diag = function (val) {
      var av = Math.abs(val);
      if (near(av, cv * a / den * rm)) return { code: 'den-root', hint: 'Take the square root of the denominator too: ' + t('\\sqrt{' + den + '}=' + b) + '.' };
      if (b > 1 && near(av, cv * a * rm)) return { code: 'den-dropped', hint: 'What happened to the denominator? ' + t('\\sqrt{\\dfrac{' + num + '}{' + den + '}}=\\dfrac{\\sqrt{' + num + '}}{\\sqrt{' + den + '}}') + ' — the bottom stays as the square root of ' + t(den) + '.' };
      if (!isOne(c) && near(av, a / b * rm)) return { code: 'coef-forgot', hint: 'You simplified the root — now multiply by the ' + t(cd) + ' in front.' };
      if (a > 1 && near(av, cv * a * a / b * rm)) return { code: 'coef-power', hint: t(a * a) + ' comes out of the root as ' + t(a) + ', not ' + t(a * a) + '.' };
      if (near(av, cv * b / a * rm) && a !== b) return { code: 'flip', hint: 'Your fraction is upside down: the square root of the <b>numerator</b> goes on top.' };
      return null;
    };
    var base = K.radical({ k: k, n: 2, m: m }, 'mixed', { diag: diag });
    var check = function (resp) { var res = base(resp); if (res.v === 'form' && res.code === 'one-radical') return form('whole-radicand', 'Right value — now write it with a whole number under the root and no root in the denominator, like ' + t('\\frac{1}{3}\\sqrt{2}') + ': take the square root of the top and the bottom separately.'); return res; };
    var sol = t(cd + '\\sqrt{\\dfrac{' + num + '}{' + den + '}}=' + cd + '\\dfrac{\\sqrt{' + num + '}}{\\sqrt{' + den + '}}=' + cd + '\\dfrac{' + ansTex(a, m) + '}{' + b + '}=' + ansTex(k, m)) + '.' + (a > 1 ? '<br>(' + t(num + '=' + a * a + '\\times ' + m) + ', so ' + t(sq(num) + '=' + ansTex(a, m)) + '.)' : '');
    return mathPart(t(cd + '\\sqrt{\\dfrac{' + num + '}{' + den + '}}'), check, ex.texRadical(k, 2, m), t(ansTex(k, m)), sol,
      ['Split the root: ' + t('\\sqrt{\\dfrac{a}{b}}=\\dfrac{\\sqrt{a}}{\\sqrt{b}}') + '. The denominator is a perfect square.', a > 1 ? 'The numerator ' + t(num) + ' also has a perfect-square factor — take it out.' : 'The numerator has no perfect-square factor, so it stays under the root.'],
      'mixed radical of ' + (isOne(c) ? '' : rv(c)) + '√(' + num + '/' + den + ')', { good: [plain(k, m)], bad: [ansTex(mulR(c, [a, den]), m), '\\sqrt{\\frac{' + num + '}{' + den + '}}'] });
  }

  /* Q7: approximate using the given values √b and √(10b) */
  var GIVEN = [{ b: 7, g: [265, 837] }, { b: 3, g: [173, 548] }, { b: 5, g: [224, 707] }, { b: 2, g: [141, 447] }, { b: 6, g: [245, 775] }];
  function gTex(G) { return (G / 100).toFixed(2); }
  function decStr(p, q) { // p/q with q a power of 10 (or 1) -> LaTeX decimal
    while (q > 1 && p % 10 === 0) { p /= 10; q /= 10; }
    var d = String(q).length - 1, s = String(p);
    if (!d) return F(p);
    while (s.length <= d) s = '0' + s;
    return F(Number(s.slice(0, -d))) + '.' + s.slice(-d);
  }
  function approxPart(sh, sqN, sqD, which) {
    var b = sh.b, base = which ? 10 * b : b, G = sh.g[which], other = sh.g[1 - which];
    var pow10 = /^10*$/.test(String(sqD)), rad = pow10 ? decStr(sqN * sqN * base, sqD * sqD) : '\\dfrac{' + sqN * sqN * base + '}{' + sqD * sqD + '}';
    var ans = Number((G * sqN / (100 * sqD)).toFixed(8)), fTex = sqD === 1 ? String(sqN) : '\\tfrac{' + sqN + '}{' + sqD + '}', sqTex = sqD === 1 ? F(sqN * sqN) : '\\tfrac{' + sqN * sqN + '}{' + F(sqD * sqD) + '}';
    var diag = function (v) {
      if (Math.abs(v - ans) < 1e-9) return null;
      if (sqN !== sqD && near(v, G * sqN * sqN / (100 * sqD * sqD))) return { code: 'no-root', hint: 'Only the <b>square root</b> of the perfect-square factor comes out: ' + t('\\sqrt{' + sqTex + '}=' + fTex) + '.' };
      for (var e = -6; e <= 6; e++) if (near(v, other * Math.pow(10, e) / 100)) return { code: 'wrong-base', hint: 'Check which given value you need. Write the radicand as (a perfect square) ' + t('\\times ' + b) + ' or (a perfect square) ' + t('\\times ' + 10 * b) + ' — only one of them works.' };
      for (var j = -3; j <= 3; j++) if (j && near(v, ans * Math.pow(10, j))) return { code: 'place', hint: 'Right digits, wrong place value. Which perfect square did you split off, and what is its square root?' };
      return null;
    };
    var steps = sqD === 1 ? t('\\sqrt{' + rad + '}=\\sqrt{' + F(sqN * sqN) + '\\times ' + base + '}=' + sqN + '\\sqrt{' + base + '}\\approx ' + sqN + '(' + gTex(G) + ')=' + F(ans))
      : t('\\sqrt{' + rad + '}=' + (pow10 ? '\\sqrt{\\dfrac{' + base + '}{' + F(sqD * sqD) + '}}=' : '') + '\\dfrac{\\sqrt{' + base + '}}{' + F(sqD) + '}\\approx\\dfrac{' + gTex(G) + '}{' + F(sqD) + '}=' + ans);
    var base = K.number(ans, diag), dp = (String(ans).split('.')[1] || '').length;
    var check = function (resp) {
      var res = base(resp); if (res.v !== 'wrong') return res;
      var v = Number(String(resp).replace(/\s/g, ''));
      for (var d = 1; d < dp; d++) if (Math.abs(v - K.roundTo(ans, d)) < 1e-9) return form('round-early', 'Close — but don’t round. Give the full result of your calculation with the given value' + (dp ? ' (it has ' + dp + ' decimal places)' : '') + '.');
      return res;
    };
    return { prompt: t('\\sqrt{' + rad + '}'), input: { type: 'number' }, check: check, key: String(ans), answer: t(F(ans)), text: 'approximate √' + rad.replace(/\\,/g, '').replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2') + ' from √' + base,
      solution: steps + '.', hints: ['Write the radicand as a perfect square ' + t('\\times ' + b) + ' or a perfect square ' + t('\\times ' + 10 * b) + '.', 'The perfect square comes out as its square root; then use the given value.'] };
  }

  /* ordering by converting to entire radicals */
  var MIXED_POOL = (function () { var out = []; [2, 3, 4, 5, 6].forEach(function (c) { SF.forEach(function (m) { var v = c * c * m; if (v >= 40 && v <= 110) out.push({ c: c, m: m, v: v }); }); }); return out; })();
  function orderItems(r, lo, hi) {
    for (var tries = 0; tries < 500; tries++) {
      var mixed = r.sample(MIXED_POOL, 3), used = mixed.map(function (x) { return x.v; });
      var n = r.int(lo, hi), q = r.pick([2, 3]), N = r.int(lo, hi);
      if (isSq(n) || isSq(N) || n === N || used.indexOf(n) >= 0 || used.indexOf(N) >= 0) continue;
      if (used[0] === used[1] || used[1] === used[2] || used[0] === used[2]) continue;
      var items = mixed.map(function (x, i) { return { id: 'm' + i, tex: x.c + sq(x.m), v: x.v, conv: x.c + sq(x.m) + '=\\sqrt{' + x.c * x.c + '\\times ' + x.m + '}=' + sq(x.v) }; });
      items.push({ id: 'e', tex: sq(n), v: n, conv: sq(n) + '\\ \\text{(already entire)}' });
      items.push({ id: 'f', tex: '\\tfrac{1}{' + q + '}' + sq(q * q * N), v: N, conv: '\\tfrac{1}{' + q + '}' + sq(q * q * N) + '=\\sqrt{\\tfrac{1}{' + q * q + '}\\times ' + F(q * q * N) + '}=' + sq(N) });
      return items;
    }
    return null;
  }
  function orderPart(r, items, desc, lo) {
    var sorted = items.slice().sort(function (a, b) { return desc ? b.v - a.v : a.v - b.v; }), byId = {};
    items.forEach(function (x) { byId[x.id] = x; });
    var rel = desc ? '>' : '<';
    return P.order(r, desc ? 'Arrange from <b>greatest to least</b>.' : 'Arrange from <b>least to greatest</b>.', sorted, { first: desc ? 'greatest' : 'least', last: desc ? 'least' : 'greatest',
      why: function (a, b) { return t(byId[a].tex) + ' and ' + t(byId[b].tex) + ' are in the wrong order. Write each one as an entire radical, ' + t('a\\sqrt{b}=\\sqrt{a^{2}b}') + ', and compare the radicands.'; } },
      'Convert every radical to an entire radical:<br>' + items.map(function (x) { return t(x.conv); }).join('<br>') + '<br>Compare the radicands: ' + t(sorted.map(function (x) { return F(x.v); }).join(rel)) + ', so<br>' + t(sorted.map(function (x) { return x.tex; }).join('\\ ' + rel + '\\ ')) + '.',
      ['Convert every radical to an entire radical: ' + t('a\\sqrt{b}=\\sqrt{a^{2}b}') + '. For ' + t('\\tfrac{1}{q}\\sqrt{b}') + ', the ' + t('\\tfrac{1}{q}') + ' becomes ' + t('\\tfrac{1}{q^{2}}') + ' inside.', 'Then the bigger radicand gives the bigger radical.'], 'order radicals ' + (desc ? 'desc' : 'asc'));
  }

  /* Heron triangles: integer sides, area p√q (p ≥ 2, q > 1) */
  var HERON = (function () {
    var out = [];
    for (var a = 5; a <= 20; a++) for (var b = a; b <= 20; b++) for (var c = b; c <= 20; c++) {
      if ((a + b + c) % 2 || a + b <= c) continue;
      var s = (a + b + c) / 2, A2 = s * (s - a) * (s - b) * (s - c), p = big(A2), q = A2 / (p * p);
      if (q > 1 && p >= 2 && q <= 999 && A2 <= 12000 && a !== b && b !== c) out.push({ a: a, b: b, c: c, s: s, A2: A2, p: p, q: q });
    }
    return out;
  })();

  /* ---------- the lesson ---------- */
  HW.defineLesson({
    id: 'u1l6a', unit: 1, num: '6A', title: 'Entire and Mixed Radicals', outcome: 'AN2',
    blurb: 'Run the product rule backwards: pull the largest perfect square out in front of the root, move coefficients back in, compare radicals, and keep Pythagorean answers exact.',
    questions: [
      { num: '1', section: 'Part A — Entire and Mixed Radicals (Square Roots)', stem: 'State whether each radical is written as a mixed radical or an entire radical.', parts: [
        { id: '1a', level: 'LIM', make: function (r) { var n = pickWhere(r, function () { return r.int(20, 99); }, function (v) { return !isSq(v); }); return kindPart(r, sq(n), false, 'Nothing multiplies the root here.'); } },
        { id: '1b', level: 'LIM', make: function (r) { return kindPart(r, r.int(2, 9) + sq(r.pick([2, 3, 5, 6, 7, 10, 11])), true, 'There is a number <b>in front of</b> the root.'); } },
        { id: '1c', level: 'LIM', make: function (r) { var n = r.pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]); return kindPart(r, sq(n), false, 'Nothing multiplies the root. (It happens to equal ' + t(Math.sqrt(n)) + ', but as written it is an entire radical.)'); } },
        { id: '1d', level: 'LIM', make: function (r) { return kindPart(r, '0.' + r.int(2, 9) + sq(r.pick([2, 3, 5, 6, 7, 10, 11, 13])), true, 'A decimal coefficient is still a coefficient: something sits in front of the root.'); } }] },
      { num: '2', stem: 'Convert the following radicals to mixed radicals in simplest form.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { return toMixed(1, 4 * r.pick([3, 5, 6, 7])); } },
        { id: '2b', level: 'BEG', make: function (r) { return toMixed(1, r.pick([28, 44, 52, 45, 63, 50, 75])); } },
        { id: '2c', level: 'EMG', make: function (r) { return toMixed(1, 16 * r.pick([3, 5, 6, 7])); } },
        { id: '2d', level: 'EMG', make: function (r) { return toMixed(1, 9 * r.pick([11, 13, 17, 19, 23])); } },
        { id: '2e', level: 'EMG', make: function (r) { return toMixed(r.int(2, 5), 9 * r.pick([2, 3, 5, 7])); } },
        { id: '2f', level: 'EMG', make: function (r) { return toMixed(-r.int(2, 7), 16 * r.pick([2, 3, 5, 7])); } },
        { id: '2g', level: 'EMG', make: function (r) { return toMixed(r.int(2, 4), 25 * r.pick([2, 3, 5, 6, 7])); } },
        { id: '2h', level: 'PRG', make: function (r) { return toMixed(-r.int(2, 6), 36 * r.pick([2, 3, 5, 7])); } }] },
      { num: '3', stem: 'Convert the following radicals to mixed radicals in simplest form. <b>Some of them cannot be converted</b> — if a radical is already in simplest form, type it unchanged.',
        shared: function (r) { return { sf: r.pick([30, 42, 66, 70, 78, 102, 105, 110, 114, 130, 138]) }; },
        parts: [
          { id: '3a', level: 'EMG', make: function (r) { return toMixed(1, Math.pow(r.int(4, 6), 2) * r.pick([5, 6, 7, 10])); } },
          { id: '3b', level: 'EMG', make: function (r) { return toMixed(1, Math.pow(r.int(12, 15), 2) * r.pick([2, 3])); } },
          { id: '3c', level: 'PRG', make: function (r) { var f = fracCoef(r, [6, 8, 9, 10, 12]); return toMixed([-f.p, f.q], f.s * f.s * r.pick([2, 3, 5])); } },
          { id: '3d', level: 'PRG', make: function (r) { var s = r.int(6, 9); return toMixed([1, s], s * s * r.pick([2, 3, 5, 6, 7])); } },
          { id: '3e', level: 'EMG', make: function (r) { return toMixed(1, Math.pow(r.int(11, 13), 2) * r.pick([2, 3, 5, 6, 7])); } },
          { id: '3f', level: 'PRG', make: function (r) { return toMixed(r.int(2, 6), Math.pow(r.int(11, 13), 2) * r.pick([2, 3])); } },
          { id: '3g', level: 'EMG', make: function (r) { return toMixed(1, Math.pow(r.pick([20, 25, 30]), 2) * r.pick([2, 3, 5])); } },
          { id: '3h', level: 'EMG', make: function (r, sh) { return toMixed(1, sh.sf); } },
          { id: '3i', level: 'PRG', make: function (r) { var s = r.pick([8, 9, 10, 12]), p = r.pick([5, 7, 11].filter(function (x) { return x < s && gcd(x, s) === 1; })); return toMixed([-p, s], s * s * r.pick([2, 3, 5])); } },
          { id: '3j', level: 'EMG', make: function (r) { return toMixed(1, Math.pow(r.int(13, 17), 2) * r.pick([2, 3, 5])); } },
          { id: '3k', level: 'PRG', make: function (r) { return toMixed(r.int(2, 4), Math.pow(r.int(15, 18), 2) * r.pick([2, 3])); } },
          { id: '3l', level: 'PRG', make: function (r) { return toMixed(-r.int(2, 4), Math.pow(r.int(11, 13), 2) * r.pick([6, 7])); } },
          { id: '3m', level: 'PRG', make: function (r) { return toMixed(r.int(3, 6), Math.pow(r.pick([11, 13]), 2) * r.pick([2, 3, 5])); } },
          { id: '3n', level: 'PRG', make: function (r) { var s = r.pick([2, 3]), m = pickWhere(r, function () { return r.int(100, 250); }, function (v) { return sqFree(v) && nt.factor(v).some(function (pe) { return pe[0] > 20; }); }); return toMixed(1, s * s * m); } },
          { id: '3o', level: 'PRG', make: function (r) { var f = fracCoef(r, [10, 12, 14, 15]); return toMixed([f.p, f.q], f.s * f.s * r.pick([2, 3, 5, 7])); } },
          { id: '3p', level: 'PRG', make: function (r) { var ab = r.sample([5, 7, 11, 13, 17], 2); return toMixed([ab[0], ab[1]], ab[0] * ab[1]); } },
          { id: '3q', level: 'EMG', make: function (r, sh) {
            var n = sh.sf;
            return P.mc(r, 'Which statement explains why ' + t(sq(n)) + ' cannot be written as a mixed radical?', [
              { html: t(F(n) + '=' + K.fac(n)) + ' has no perfect-square factor other than ' + t('1') + ': no prime appears twice.', right: true },
              { html: t(F(n)) + ' is not a perfect square.', why: 'Neither is ' + t('72') + ', but ' + t('\\sqrt{72}=6\\sqrt{2}') + '. A radical converts when the radicand has a perfect-square <b>factor</b> — it doesn’t have to be a perfect square itself.' },
              { html: t(F(n)) + ' is ' + (n % 2 ? 'odd' : 'even') + ', so it can’t be split into a perfect square times something.', why: (n % 2 ? t('\\sqrt{45}=3\\sqrt{5}') : t('\\sqrt{12}=2\\sqrt{3}')) + ' — ' + (n % 2 ? 'odd' : 'even') + ' radicands can often be converted. Look for a perfect-square factor.' },
              { html: t(F(n)) + ' has too many factors to simplify.', why: 'The number of factors doesn’t matter. What matters is whether one of the factors is a perfect square (' + t('4, 9, 25, 49, \\ldots') + ').' }],
              t(F(n) + '=' + K.fac(n)) + '. To take a whole number out of a square root you need a perfect-square factor (a prime that appears twice). None of ' + t('4, 9, 25, 49, \\ldots') + ' divides ' + t(F(n)) + ', so ' + t(sq(n)) + ' is already in simplest form.',
              ['Write the prime factorization. Is any prime repeated?'], 'why √' + n + ' cannot be simplified');
          } }] },
      { num: '4', stem: 'Convert the following radicals to mixed radicals where the radicand is a whole number.', parts: [
        { id: '4a', level: 'EMG', make: function (r) { var d = pickWhere(r, function () { return [r.pick([2, 3, 5, 6, 7, 10, 11]), r.pick([4, 9, 16, 25, 36, 49, 64, 81])]; }, function (v) { return gcd(v[0], v[1]) === 1; }); return fracRootPart(1, d[0], d[1]); } },
        { id: '4b', level: 'EMG', make: function (r) { var d = pickWhere(r, function () { var den = r.pick([4, 9, 16]); return [r.int(den + 1, 2 * den + 4), den]; }, function (v) { return sqFree(v[0]) && gcd(v[0], v[1]) === 1; }); return fracRootPart(1, d[0], d[1]); } },
        { id: '4c', level: 'PRG', make: function (r) { var d = pickWhere(r, function () { return [r.int(2, 5), r.pick([3, 5, 7, 9]), r.pick([2, 3, 5])]; }, function (v) { return gcd(v[0] * v[0] * v[2], v[1]) === 1; }); return fracRootPart(1, d[0] * d[0] * d[2], d[1] * d[1]); } },
        { id: '4d', level: 'PRG', make: function (r) { var d = pickWhere(r, function () { return [r.pick([2, 3]), r.pick([2, 3, 5]), r.pick([2, 3, 5, 6, 7]), r.int(2, 3)]; }, function (v) { return v[0] !== v[1] && gcd(v[0] * v[0] * v[2], v[1]) === 1 && v[1] * v[3] * v[0] / v[1] !== 1; }); return fracRootPart(d[1] * d[3], d[0] * d[0] * d[2], d[1] * d[1]); } }] },
      { num: '5', stem: 'Convert the following to entire radical form.', parts: [
        { id: '5a', level: 'BEG', make: function (r) { return toEntire(r.int(2, 5), r.pick([2, 3, 5, 6, 7])); } },
        { id: '5b', level: 'BEG', make: function (r) { return toEntire(r.int(3, 5), r.pick([5, 6, 7, 10])); } },
        { id: '5c', level: 'EMG', make: function (r) { return toEntire(r.int(5, 7), r.pick([7, 10, 11, 13])); } },
        { id: '5d', level: 'BEG', make: function (r) { return toEntire(r.int(10, 12), r.pick([2, 3, 5])); } },
        { id: '5e', level: 'EMG', make: function (r) { return toEntire(r.int(2, 3), r.pick([16, 25, 36, 49])); } },
        { id: '5f', level: 'EMG', make: function (r) { return toEntire(-r.int(5, 8), r.pick([3, 5, 6, 7])); } },
        { id: '5g', level: 'EMG', make: function (r) { return toEntire(r.int(7, 9), r.pick([7, 10, 11])); } },
        { id: '5h', level: 'EMG', make: function (r) { return toEntire(-r.pick([8, 9, 11, 12]), r.pick([2, 3])); } }] },
      { num: '6', stem: 'Convert the following to entire radical form.', parts: [
        { id: '6a', level: 'PRG', make: function (r) { var s = r.int(3, 6), m = r.pick([2, 3, 5, 6, 7]); var p = toEntire([1, s], s * s * m); p.solution = 'Simplify first: ' + t(sq(s * s * m) + '=' + s + sq(m)) + ', so ' + t('\\tfrac{1}{' + s + '}\\times ' + s + sq(m) + '=' + sq(m)) + '.<br>(Or square the coefficient: ' + t('\\tfrac{1}{' + s * s + '}\\times ' + F(s * s * m) + '=' + m) + '.)'; return p; } },
        { id: '6b', level: 'EMG', make: function (r) {
          var n = r.int(12, 25);
          return toEntire(n, 1, { prompt: t(n), notEntire: form('not-entire', 'Right value, but write it as a square root: which number has a square root of ' + t(n) + '?'),
            more: function (val, rr) { if (rr && rr.n === 2 && rr.m === 2 * n) return { code: 'doubled', hint: t('\\sqrt{' + 2 * n + '}') + ' isn’t ' + t(n) + '. A whole number ' + t('n=\\sqrt{n^{2}}') + ': square it, don’t double it.' }; return null; },
            sol: 'Any whole number ' + t('n=\\sqrt{n^{2}}') + ': ' + t(n + '=\\sqrt{' + n + '^{2}}=' + sq(n * n)) + '.' });
        } },
        { id: '6c', level: 'PRG', make: function (r) { var q = r.pick([2, 3]), p = r.pick([3, 5, 7].filter(function (x) { return gcd(x, q) === 1; })), m = r.pick([2, 3, 5]); var pp = toEntire([p, q], q * q * m); pp.solution = 'Simplify first: ' + t(sq(q * q * m) + '=' + q + sq(m)) + ', so ' + t('\\tfrac{' + p + '}{' + q + '}\\times ' + q + sq(m) + '=' + p + sq(m)) + '.<br>Then ' + t(p + sq(m) + '=\\sqrt{' + p * p + '\\times ' + m + '}=' + sq(p * p * m)) + '.'; return pp; } },
        { id: '6d', level: 'EMG', make: function (r) { var ae = r.pick([[2, 2], [3, 2], [2, 3]]), c = Math.pow(ae[0], ae[1]), m = r.pick([5, 7, 11, 13]); var p = toEntire(c, m, { disp: ae[0] + '^{' + ae[1] + '}' }); p.solution = t(ae[0] + '^{' + ae[1] + '}=' + c) + ', so the radical is ' + t(c + sq(m)) + '.<br>' + t(c + sq(m) + '=\\sqrt{' + c * c + '\\times ' + m + '}=' + sq(c * c * m)) + '.'; return p; } }] },
      { num: '7', stem: function (sh) { return '<b>Do not use a calculator.</b> Given that ' + t('\\sqrt{' + sh.b + '}\\approx ' + gTex(sh.g[0])) + ' and ' + t('\\sqrt{' + 10 * sh.b + '}\\approx ' + gTex(sh.g[1])) + ', find the approximate value of each radical.'; },
        shared: function (r) { return r.pick(GIVEN); },
        parts: [
          { id: '7a', level: 'EMG', make: function (r, sh) { return approxPart(sh, 10, 1, 0); } },
          { id: '7b', level: 'EMG', make: function (r, sh) { return approxPart(sh, 10, 1, 1); } },
          { id: '7c', level: 'EMG', make: function (r, sh) { return r.chance(0.6) ? approxPart(sh, 100, 1, 1) : approxPart(sh, 100, 1, 0); } },
          { id: '7d', level: 'PRG', make: function (r, sh) { return approxPart(sh, 1, r.pick([10, 100]), 0); } },
          { id: '7e', level: 'PRG', make: function (r, sh) { return approxPart(sh, 1, r.pick([10, 100]), 1); } },
          { id: '7f', level: 'EMG', make: function (r, sh) { return approxPart(sh, r.int(2, 5), 1, 0); } },
          { id: '7g', level: 'PRG', make: function (r, sh) { return approxPart(sh, r.int(2, 4), 1, 1); } },
          { id: '7h', level: 'EMG', make: function (r, sh) { return approxPart(sh, 1, r.pick([2, 4, 5]), 0); } }] },
      { num: '8', stem: '<b>Do not use a calculator.</b>', parts: [
        { id: '8', level: 'PRG', make: function (r) { return orderPart(r, orderItems(r, 40, 110), true); } }] },
      { num: '9', section: 'Part B — Radicals and the Pythagorean Theorem',
        stem: function (sh) {
          return 'Students are finding the length of ' + t('PQ') + ' in ' + t('\\triangle PQR') + '. <b>Louis</b> rounds each side to the nearest hundredth and then calculates ' + t('PQ') + ' to the nearest hundredth. <b>Asia</b> uses the entire radical form of each side and rounds only her final answer to the nearest hundredth.'
            + fig({ Q: [0, 0], R: [Math.sqrt(sh.a), 0], P: [Math.sqrt(sh.a), Math.sqrt(sh.b)] }, { edges: [['Q', 'R'], ['R', 'P'], ['P', 'Q']], right: [['R', 'Q', 'P']], labels: [['Q', 'R', '√' + sh.a], ['R', 'P', '√' + sh.b]], names: ['Q', 'R', 'P'] });
        },
        shared: function (r) {
          var cand = pickWhere(r, function () { return [r.int(10, 99), r.int(10, 99)]; }, function (v) {
            var S = v[0] + v[1], s = big(S); if (isSq(v[0]) || isSq(v[1]) || v[0] === v[1] || s < 2 || S / (s * s) === 1) return false;
            var la = K.roundTo(Math.sqrt(v[0]), 2), lb = K.roundTo(Math.sqrt(v[1]), 2), Ls = la * la + lb * lb, L = K.roundTo(Math.sqrt(Ls), 2);
            return L !== K.roundTo(Math.sqrt(S), 2) && K.roundTo(Math.sqrt(K.roundTo(Ls, 2)), 2) === L;
          }, 800) || [51, 29];
          var a = cand[0], b = cand[1], S = a + b, la = K.roundTo(Math.sqrt(a), 2), lb = K.roundTo(Math.sqrt(b), 2), Ls = la * la + lb * lb;
          return { a: a, b: b, S: S, la: la, lb: lb, Ls: Ls, L: K.roundTo(Math.sqrt(Ls), 2), A: K.roundTo(Math.sqrt(S), 2), s: big(S), m: S / (big(S) * big(S)) };
        },
        parts: [
          { id: '9a', level: 'EMG', make: function (r, sh) {
            var L = sh.L.toFixed(2), A = sh.A.toFixed(2);
            return P.fields('Complete both students’ work.', [{ name: 'Louis', label: 'Louis: ' + t('PQ\\approx') }, { name: 'Asia ' + t('PQ^{2}'), label: 'Asia: ' + t('PQ^{2}=') }, { name: 'Asia', label: 'Asia: ' + t('PQ\\approx') }],
              [K.approx(sh.L, 2, { diag: function (v) { return Math.abs(v - sh.A) < 1e-9 ? { code: 'louis', hint: 'That’s the answer from the exact values. Louis starts from ' + t('\\sqrt{' + sh.a + '}\\approx ' + sh.la.toFixed(2)) + ' and ' + t('\\sqrt{' + sh.b + '}\\approx ' + sh.lb.toFixed(2)) + ' and squares those.' } : null; } }),
                K.number(sh.S, function (v) { return near(v, Math.sqrt(sh.a) + Math.sqrt(sh.b)) || v === sh.a * sh.a + sh.b * sh.b ? { code: 'value', hint: t('\\left(\\sqrt{' + sh.a + '}\\right)^{2}=' + sh.a) + ': squaring a square root gives back the radicand.' } : null; }),
                K.approx(Math.sqrt(sh.S), 2, { diag: function (v) { return Math.abs(v - sh.L) < 1e-9 ? { code: 'asia', hint: 'That’s Louis’s answer. Asia takes ' + t('\\sqrt{' + sh.S + '}') + ' directly and rounds only at the end.' } : null; } })],
              [L, String(sh.S), A], 'Louis ' + t(L) + ';  Asia ' + t('PQ^{2}=' + sh.S) + ', ' + t(A),
              '<b>Louis:</b> ' + t('PQ^{2}\\approx ' + sh.la.toFixed(2) + '^{2}+' + sh.lb.toFixed(2) + '^{2}\\approx ' + sh.Ls.toFixed(4)) + ', so ' + t('PQ\\approx ' + L) + '.<br><b>Asia:</b> ' + t('PQ^{2}=\\left(\\sqrt{' + sh.a + '}\\right)^{2}+\\left(\\sqrt{' + sh.b + '}\\right)^{2}=' + sh.a + '+' + sh.b + '=' + sh.S) + ', so ' + t('PQ=\\sqrt{' + sh.S + '}\\approx ' + A) + '.',
              ['Louis: square the rounded sides and add, then take the square root.', 'Asia: ' + t('\\left(\\sqrt{a}\\right)^{2}=a') + ', so ' + t('PQ^{2}') + ' is a whole number.'], 'Louis vs Asia PQ, legs √' + sh.a + ', √' + sh.b);
          } },
          { id: '9b', level: 'EMG', make: function (r, sh) {
            return P.mc(r, 'Which student’s answer is more accurate?', [
              { html: 'Asia’s: she worked with exact values and rounded only once, at the end.', right: true },
              { html: 'Louis’s: he showed more decimal work, so his answer is more precise.', why: 'More steps with rounded numbers add error, not accuracy. The exact value is ' + t('\\sqrt{' + sh.S + '}=' + Math.sqrt(sh.S).toFixed(4) + '\\ldots') + ' — whose answer matches it?' },
              { html: 'They are equally accurate: both answers are rounded to the nearest hundredth.', why: 'They don’t even agree! Compare both answers with the exact value ' + t('\\sqrt{' + sh.S + '}=' + Math.sqrt(sh.S).toFixed(4) + '\\ldots') + '.' },
              { html: 'Louis’s: rounding each side first keeps the numbers small, which avoids mistakes.', why: 'Rounding early throws away information, and that error is carried through every later step.' }],
              'The exact value is ' + t('PQ=\\sqrt{' + sh.S + '}=' + Math.sqrt(sh.S).toFixed(5) + '\\ldots\\approx ' + sh.A.toFixed(2)) + '. <b>Asia</b> is right: Louis rounded the sides at the very first step and carried that rounding error through the whole calculation, so his answer ' + t(sh.L.toFixed(2)) + ' is off. Asia rounded only once.',
              ['Which student rounded <b>before</b> the end?'], 'Louis vs Asia accuracy');
          } },
          { id: '9c', level: 'PRG', make: function (r, sh) { var p = toMixed(1, sh.S, { prompt: 'State the <b>exact</b> length of ' + t('PQ') + ' as a mixed radical.' }); p.solution = t('PQ^{2}=' + sh.a + '+' + sh.b + '=' + sh.S) + ', so ' + t('PQ=' + sq(sh.S)) + '.<br>' + mixedSol([1, 1], sh.S, ''); p.text = 'exact PQ = √' + sh.S; return p; } }] },
      { num: '10', stem: function (sh) {
          return 'Use ' + t('c^{2}=a^{2}+b^{2}') + ' in the triangle shown to calculate the length of ' + t('XY') + '.'
            + fig({ X: [0, 0], Y: [Math.sqrt(sh.N), 0], Z: [Math.sqrt(sh.N), sh.l] }, { edges: [['X', 'Y'], ['Y', 'Z'], ['Z', 'X']], right: [['Y', 'X', 'Z']], labels: [['X', 'Z', sh.h + ' cm'], ['Y', 'Z', sh.l + ' cm']], names: ['X', 'Y', 'Z'], H: 110 });
        },
        shared: function (r) {
          var v = pickWhere(r, function () { return [r.int(12, 30), r.int(4, 14)]; }, function (x) { var N = x[0] * x[0] - x[1] * x[1]; return x[1] < x[0] - 3 && !isSq(N) && big(N) >= 2 && x[1] * 3 >= x[0]; }) || [22, 8];
          var N = v[0] * v[0] - v[1] * v[1];
          return { h: v[0], l: v[1], N: N, s: big(N), m: N / (big(N) * big(N)) };
        },
        parts: [
          { id: '10a', sub: 'i', level: 'EMG', make: function (r, sh) {
            var p = toEntire(sh.s, sh.m, { prompt: 'Give ' + t('XY') + ' (in cm) as an <b>entire radical</b>.', more: hypDiag(sh), sol: hypSol(sh) });
            p.text = 'XY entire, hyp ' + sh.h + ' leg ' + sh.l; p.bad = [sq(sh.h * sh.h + sh.l * sh.l)];
            p.hints = [t('XZ') + ' is opposite the right angle at ' + t('Y') + ', so it is the hypotenuse: ' + t('XY^{2}=XZ^{2}-YZ^{2}') + '.', 'Then ' + t('XY=\\sqrt{XY^{2}}') + ' — that square root is the entire radical.']; return p;
          } },
          { id: '10b', sub: 'ii', level: 'PRG', make: function (r, sh) {
            var p = toMixed(1, sh.N, { prompt: 'Give ' + t('XY') + ' (in cm) as a <b>mixed radical</b> in simplest form.', more: hypDiag(sh) });
            p.solution = hypSol(sh) + '<br>' + mixedSol([1, 1], sh.N, ''); p.text = 'XY mixed, hyp ' + sh.h + ' leg ' + sh.l; return p;
          } },
          { id: '10c', sub: 'iii', level: 'BEG', make: function (r, sh) {
            return P.approx('Give ' + t('XY') + ' as a decimal, to the nearest hundredth of a centimetre.', Math.sqrt(sh.N), 2, { after: 'cm', diag: function (v) { return Math.abs(v - K.roundTo(Math.sqrt(sh.h * sh.h + sh.l * sh.l), 2)) < 1e-9 ? { code: 'hyp-added', hint: t('XZ') + ' is the hypotenuse (it is opposite the right angle at ' + t('Y') + '), so subtract: ' + t('XY^{2}=XZ^{2}-YZ^{2}') + '.' } : null; } },
              hypSol(sh) + '<br>' + t('XY=' + ansTex(sh.s, sh.m) + '=' + Math.sqrt(sh.N).toFixed(5) + '\\ldots\\approx ' + K.roundTo(Math.sqrt(sh.N), 2).toFixed(2)) + ' cm.', ['Find the exact value first, then use your calculator.'], 'XY decimal, hyp ' + sh.h + ' leg ' + sh.l);
          } }] },
      { num: '11', stem: 'Find the length of the missing side. Express the answer in simplest mixed radical form.', parts: [
        { id: '11a', level: 'PRG', make: function (r) {
          var v = pickWhere(r, function () { return r.sample([2, 3, 4, 5, 6, 7], 2); }, function (x) { var S = 4 * (x[0] * x[0] + x[1] * x[1]); return !isSq(S); }) || [3, 5];
          var a = 2 * Math.min(v[0], v[1]), b = 2 * Math.max(v[0], v[1]), S = a * a + b * b;
          var p = toMixed(1, S, { prompt: rightTri(a, b, { labels: [['V', 'O', String(a)], ['O', 'H', String(b)], ['H', 'V', 'x', true]] }), more: function (val) { return near(val, Math.sqrt(b * b - a * a)) ? { code: 'hyp-added', hint: t('x') + ' is the hypotenuse (opposite the right angle), so <b>add</b> the squares of the legs.' } : null; } });
          p.solution = t('x') + ' is the hypotenuse: ' + t('x^{2}=' + a + '^{2}+' + b + '^{2}=' + a * a + '+' + b * b + '=' + S) + '.<br>' + mixedSol([1, 1], S, ''); p.text = 'hypotenuse with legs ' + a + ', ' + b; return p;
        } },
        { id: '11b', level: 'PRG', make: function (r) {
          var v = pickWhere(r, function () { return r.sample([3, 5, 7, 9, 11, 13], 2); }, function (x) { return sqFree(x[0] * x[0] + x[1] * x[1]); }) || [7, 9];
          var a = Math.min(v[0], v[1]), b = Math.max(v[0], v[1]), S = a * a + b * b;
          var p = toMixed(1, S, { prompt: rightTri(a, b, { labels: [['V', 'O', String(a)], ['O', 'H', String(b)], ['H', 'V', 'x', true]] }), more: function (val) { return near(val, Math.sqrt(b * b - a * a)) ? { code: 'hyp-added', hint: t('x') + ' is the hypotenuse (opposite the right angle), so <b>add</b> the squares of the legs.' } : null; } });
          p.solution = t('x') + ' is the hypotenuse: ' + t('x^{2}=' + a + '^{2}+' + b + '^{2}=' + a * a + '+' + b * b + '=' + S) + '.<br>' + mixedSol([1, 1], S, ''); p.text = 'hypotenuse with legs ' + a + ', ' + b + ' (square-free)';
          p.hints = ['Square the legs and add. Then look for a perfect-square factor of ' + t('x^{2}') + '.', 'If there is no perfect-square factor, the entire radical is already in simplest form.']; return p;
        } },
        { id: '11c', level: 'ADV', make: function (r) {
          var T = r.pick([[6, 8, 10], [3, 4, 5], [5, 12, 13], [9, 12, 15], [8, 6, 10], [12, 5, 13]]), k = T[0] + T[1] + T[2] > 20 ? 1 : 2, b = T[0] * k, h = T[1] * k, c = T[2] * k;
          var H = pickWhere(r, function () { return r.int(h + 2, h + 9); }, function (x) { var N = x * x - h * h; return x !== c && !isSq(N) && big(N) >= 2; }) || (h + 4);
          var N = H * H - h * h, X = Math.sqrt(N);
          var pr = fig({ L: [0, 0], F: [b, 0], Rr: [b + X, 0], A: [b, h] }, { edges: [['L', 'Rr'], ['L', 'A'], ['A', 'Rr'], ['A', 'F']], right: [['F', 'A', 'L']], labels: [['L', 'A', String(c)], ['A', 'Rr', String(H)], ['L', 'F', String(b)], ['F', 'Rr', 'x', true]], H: 130 });
          var p = toMixed(1, N, { prompt: pr, more: function (val) {
            if (near(val, Math.sqrt(H * H - c * c))) return { code: 'used-slant', hint: 'The right triangle containing ' + t('x') + ' has legs ' + t('x') + ' and the <b>altitude</b> (the vertical line), not the slanted side ' + t(c) + '. Find the altitude first.' };
            if (near(val, Math.sqrt(H * H - b * b))) return { code: 'used-base', hint: 'Find the altitude (the vertical line) from the left triangle first: it is a leg of both right triangles.' };
            return null;
          } });
          p.solution = 'Left triangle (legs ' + t('h') + ' and ' + t(b) + ', hypotenuse ' + t(c) + '): ' + t('h^{2}=' + c + '^{2}-' + b + '^{2}=' + (c * c - b * b)) + ', so ' + t('h=' + h) + '.<br>Right triangle (legs ' + t(h) + ' and ' + t('x') + ', hypotenuse ' + t(H) + '): ' + t('x^{2}=' + H + '^{2}-' + h + '^{2}=' + N) + '.<br>' + mixedSol([1, 1], N, '');
          p.hints = ['The vertical line is a leg of <b>both</b> right triangles. Find its length from the left triangle first.', 'Then use it with the hypotenuse ' + t(H) + ' to find ' + t('x') + '.']; p.text = 'two triangles: ' + b + ',' + c + ' then hyp ' + H; return p;
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var v = pickWhere(r, function () { return [r.int(5, 30), r.int(30, 99)]; }, function (x) { var D = x[1] - x[0], s = big(D), m = D / (s * s); return !isSq(x[0]) && !isSq(x[1]) && !isSq(x[0] + x[1]) && s >= 2 && m > 1 && m !== s && D >= 18; }) || [11, 56];
          var a = v[0], c = v[1], D = c - a, s = big(D), m = D / (s * s);
          var cands = [{ html: t(sq(a + c)), v: Math.sqrt(a + c), why: t('JL') + ' is the hypotenuse (opposite the right angle at ' + t('K') + '), so subtract: ' + t('KL^{2}=JL^{2}-JK^{2}') + '.' },
            { html: t(m + sq(s)), v: m * Math.sqrt(s), why: 'Check by converting back: ' + t(m + sq(s) + '=\\sqrt{' + m * m * s + '}') + ', not ' + t(sq(D)) + '. The number outside is the square root of the perfect-square factor.' },
            { html: t(s * s + sq(m)), v: s * s * Math.sqrt(m), why: t(s * s) + ' comes out of the root as ' + t(s) + ', not ' + t(s * s) + '.' },
            { html: t((s + 1) + sq(m)), v: (s + 1) * Math.sqrt(m), why: 'Convert it back: ' + t((s + 1) + sq(m) + '=\\sqrt{' + (s + 1) * (s + 1) * m + '}') + ', not ' + t(sq(D)) + '.' }];
          var used = [s * Math.sqrt(m)], opts = [{ html: t(s + sq(m)), right: true }];
          cands.forEach(function (o) { if (opts.length < 4 && !used.some(function (u) { return near(u, o.v); })) { used.push(o.v); opts.push(o); } });
          var pr = 'The length of ' + t('KL') + ' can be represented by which of the following?' + fig({ K: [0, 0], L: [Math.sqrt(D), 0], J: [0, Math.sqrt(a)] }, { edges: [['K', 'L'], ['L', 'J'], ['J', 'K']], right: [['K', 'J', 'L']], labels: [['J', 'K', '√' + a], ['J', 'L', '√' + c]], names: ['J', 'K', 'L'], H: 120 });
          return P.mc(r, pr, opts, t('JL') + ' is the hypotenuse, so ' + t('KL^{2}=JL^{2}-JK^{2}=' + c + '-' + a + '=' + D) + '.<br>' + t('KL=' + sq(D) + '=\\sqrt{' + s * s + '\\times ' + m + '}=' + s + sq(m)) + '.', ['Which side is the hypotenuse? It is opposite the right angle.', t('\\left(\\sqrt{a}\\right)^{2}=a') + ', so the squares are easy.'], 'KL with JK=√' + a + ', JL=√' + c);
        } }] },
      { num: '13', stem: '<i>(Multiple Choice)</i> Without using a calculator, determine which of the following radicals is <b>not</b> equal to the others.', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var c = r.pick([6, 8, 10, 12]), m = r.pick([2, 3, 5]), divs = nt.divisors(c).filter(function (d) { return d > 1 && d < c; }), a = r.pick(divs);
          var odd = pickWhere(r, function () { return [r.int(2, 6), r.int(2, 5)]; }, function (x) { var p = x[0] * x[1]; return p !== c && Math.abs(p - c) <= 2 && x[1] !== a; }) || [3, 4];
          var oddV = odd[0] * odd[1];
          var opts = [{ html: t(c + sq(m)), right: false, why: 'This one is already ' + t(c + sq(m)) + '. Write the others in the same form and compare.' },
            { html: t(sq(c * c * m)), why: t(sq(c * c * m) + '=\\sqrt{' + c * c + '\\times ' + m + '}=' + c + sq(m)) + ' — it equals the others.' },
            { html: t((c / a) + sq(a * a * m)), why: t((c / a) + sq(a * a * m) + '=' + (c / a) + '\\times ' + a + sq(m) + '=' + c + sq(m)) + ' — it equals the others.' },
            { html: t(odd[0] + sq(odd[1] * odd[1] * m)), right: true }];
          return P.mc(r, 'Which radical is not equal to the others?', opts,
            'Write every option as a multiple of ' + t(sq(m)) + ':<br>' + t(c + sq(m)) + '; ' + t(sq(c * c * m) + '=' + c + sq(m)) + '; ' + t((c / a) + sq(a * a * m) + '=' + (c / a) + '\\times ' + a + sq(m) + '=' + c + sq(m)) + '; ' + t(odd[0] + sq(odd[1] * odd[1] * m) + '=' + odd[0] + '\\times ' + odd[1] + sq(m) + '=' + oddV + sq(m)) + '.<br>The odd one out is ' + t(odd[0] + sq(odd[1] * odd[1] * m)) + '.',
            ['Simplify each one to a mixed radical with ' + t(sq(m)) + '.'], 'not equal to ' + c + '√' + m);
        } }] },
      { num: '14', section: 'Part C — Applications (Numerical Response)',
        stem: function (sh) { return '<i>Use the following information.</i> A physics textbook gives the distance, ' + t('d') + ' kilometres, that a person can see to the horizon on a clear day as ' + t('d=\\sqrt{13h}') + ', where ' + t('h') + ' is the person’s eye-level height above the ground, in metres. Standing on the ground, Maya’s eye-level height is ' + t(sh.e) + ' m.'; },
        shared: function (r) { var o = r.pick([[10, 2], [10, 3], [10, 5], [10, 6], [10, 7], [10, 10], [10, 11], [5, 7], [5, 10], [5, 11]]), e = r.pick(['1.4', '1.5', '1.6', '1.7']); var h = o[0] * o[0] * o[1], H10 = h * 10 - Math.round(Number(e) * 10); return { s: o[0], j: o[1], h: h, e: e, H: F(Math.floor(H10 / 10)) + '.' + (H10 % 10) }; },
        parts: [
          { id: '14', level: 'PRG', make: function (r, sh) {
            var s = sh.s, b = 13 * sh.j, ans = s + b;
            return P.nr('The distance Maya can see to the horizon while standing on the roof of a building ' + t(sh.H) + ' m high can be written in simplest form as ' + t('a\\sqrt{b}') + '. The value of ' + t('a+b') + ' is ________.', ans, function (v) {
              if (v === s * b) return { code: 'product', hint: 'The question asks for ' + t('a+b') + ', not ' + t('ab') + '.' };
              if (v === s * s + b) return { code: 'coef-power', hint: t(s * s) + ' comes out of the root as ' + t(s) + '.' };
              var ds = nt.divisors(s).filter(function (x) { return x > 1 && x < s; });
              for (var i = 0; i < ds.length; i++) if (v === ds[i] + b * (s / ds[i]) * (s / ds[i])) return { code: 'not-simplest', hint: 'Your radical isn’t in simplest form yet — the radicand still has a perfect-square factor.' };
              return null;
            }, 'On the roof, Maya’s eye-level height is the building plus her own eye level: ' + t('h=' + sh.H + '+' + sh.e + '=' + F(sh.h)) + ' m.<br>' + t('d=\\sqrt{13\\times ' + F(sh.h) + '}=\\sqrt{' + F(13 * sh.h) + '}') + '. ' + t(F(13 * sh.h) + '=' + s * s + '\\times ' + b) + ', and ' + t(b + '=' + K.fac(b)) + ' has no square factor, so ' + t('d=' + s + sq(b)) + '.<br>' + t('a+b=' + s + '+' + b + '=' + ans) + '.',
            ['Her eye-level height on the roof is the building’s height <b>plus</b> ' + t(sh.e) + ' m.', 'Simplify ' + t('\\sqrt{13h}') + ': look for the largest perfect-square factor.'], 'horizon a+b, h=' + sh.h);
          } }] },
      { num: '15', stem: '<i>Use the following information.</i> Heron’s Formula gives the area of a triangle as ' + t('A=\\sqrt{s(s-a)(s-b)(s-c)}') + ', where ' + t('s=\\dfrac{a+b+c}{2}') + ' and ' + t('a, b, c') + ' are the lengths of the three sides.', parts: [
        { id: '15', level: 'PRG', make: function (r) {
          var T = r.chance(0.2) ? HERON.filter(function (x) { return x.a === 10 && x.b === 13 && x.c === 15; })[0] : r.pick(HERON), p = T.p, q = T.q;
          return P.nr('The area of a triangle whose sides measure ' + t(T.a) + ', ' + t(T.b) + ' and ' + t(T.c) + ' can be written in simplest form as ' + t('p\\sqrt{' + q + '}') + ', where ' + t('p\\in N') + '. The value of ' + t('p') + ' is ________.', p, function (v) {
            if (v === p * p) return { code: 'coef-power', hint: t(p * p) + ' comes out of the root as ' + t(p) + '.' };
            if (Math.abs(v - Math.sqrt(T.A2)) < 0.6) return { code: 'area-decimal', hint: 'That’s the area as a decimal. Write ' + t('A') + ' exactly as ' + t('p\\sqrt{' + q + '}') + ' and give ' + t('p') + '.' };
            return null;
          }, t('s=\\dfrac{' + T.a + '+' + T.b + '+' + T.c + '}{2}=' + T.s) + '; ' + t('s-a=' + (T.s - T.a) + ',\\ s-b=' + (T.s - T.b) + ',\\ s-c=' + (T.s - T.c)) + '.<br>' + t('A=\\sqrt{' + T.s + '\\times ' + (T.s - T.a) + '\\times ' + (T.s - T.b) + '\\times ' + (T.s - T.c) + '}=\\sqrt{' + F(T.A2) + '}') + '.<br>' + t(F(T.A2) + '=' + p * p + '\\times ' + q) + ', so ' + t('A=' + p + sq(q)) + ' and ' + t('p=' + p) + '.',
          ['Find ' + t('s') + ' first, then multiply the four numbers under the root.', 'Divide by ' + t(q) + ': what is left should be a perfect square.'], 'Heron p for ' + T.a + ',' + T.b + ',' + T.c);
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'MAS', make: function (r) {
          var a = r.pick([4, 5, 6, 7, 8, 9, 10, 12]), ans = 2 * a;
          var body = '<path d="M60 8 L112 60 L60 112 L8 60 Z"/><path d="M34 34 L86 34 L86 86 L34 86 Z"/>' + txt(60, 45, String(a));
          return P.nr('The smaller square shown has side length ' + t(a) + ' cm; its corners touch the midpoints of the larger square’s sides. The side length of the larger square can be written in simplest form as ' + t('p\\sqrt{q}') + ', where ' + t('p,q\\in N') + '. The value of ' + t('pq') + ' is ________.' + svgWrap(120, 120, body), ans, function (v) {
            if (v === a + 2) return { code: 'sum', hint: 'The question asks for the product ' + t('pq') + ', not the sum.' };
            if (v === 2 * a * a) return { code: 'no-root', hint: 'That’s ' + t('L^{2}') + '. Take the square root and write it as ' + t('p\\sqrt{q}') + '.' };
            if (v === a) return { code: 'value', hint: 'Look at the diagram: the side of the large square is the <b>diagonal</b> of the small square.' };
            return null;
          }, 'The small square’s corners sit at the midpoints of the large square’s sides, so the small square’s <b>diagonal</b> is the large square’s side ' + t('L') + '.<br>' + t('L^{2}=' + a + '^{2}+' + a + '^{2}=' + 2 * a * a) + ', so ' + t('L=' + sq(2 * a * a) + '=\\sqrt{' + a * a + '\\times 2}=' + a + '\\sqrt{2}') + '.<br>' + t('p=' + a + ',\\ q=2') + ', so ' + t('pq=' + ans) + '.',
          ['Draw the small square’s diagonal. How does it compare with the large square’s side?', 'Use the Pythagorean Theorem on half of the small square.'], 'inscribed square pq, side ' + a);
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Large radicands and both directions', stem: 'Convert each to a mixed radical in simplest form. These radicands are large, so write the prime factorization first, then pair the primes off.', parts: [
        { id: 'e1a', level: 'PRG', make: function (r) { return factorMixed(Math.pow(r.pick([12, 14, 18]), 2) * r.pick([3, 5, 7])); } },
        { id: 'e1b', level: 'EMG', make: function (r) { return factorMixed(Math.pow(r.pick([12, 15, 16]), 2) * r.pick([5, 6, 7])); } },
        { id: 'e1c', level: 'PRG', make: function (r) { return factorMixed(Math.pow(r.pick([20, 21, 30]), 2) * r.pick([2, 3, 5])); } },
        { id: 'e1d', level: 'PRG', make: function (r) { return factorMixed(Math.pow(r.pick([22, 26, 28, 34]), 2) * r.pick([3, 5, 6])); } }] },
      { num: '2', stem: 'Convert each to a mixed radical in simplest form. Simplify the radical first, then deal with the coefficient. One of these may turn out not to be a mixed radical at all.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { return toMixed(-r.int(2, 5), Math.pow(r.int(3, 6), 2) * r.pick([2, 3, 5])); } },
        { id: 'e2b', level: 'PRG', make: function (r) { var f = fracCoef(r, [16, 18, 20, 24]); return toMixed([f.p, f.q], f.s * f.s * r.pick([2, 3])); } },
        { id: 'e2c', level: 'PRG', make: function (r) {
          var N = r.pick([36, 48, 54, 66, 72, 78, 84]), q = r.pick(nt.divisors(N).filter(function (d) { return d >= 3 && d <= 12; })), p = r.pick([1, 5, 7, 11].filter(function (x) { return x < q && gcd(x, q) === 1; }));
          var pp = toMixed([-p, q], N * N); pp.solution += '<br>The result is a whole number, <b>not</b> a mixed radical: ' + t(F(N * N)) + ' is a perfect square, so nothing is left under the root.'; return pp;
        } },
        { id: 'e2d', level: 'PRG', make: function (r) { var f = fracCoef(r, [36, 40, 48, 60], 6); return toMixed([f.p, f.q], f.s * f.s * r.pick([2, 3])); } }] },
      { num: '3', stem: 'Here the radicand is already prime-factored: an even exponent comes straight out (halved), and an odd exponent leaves one factor behind. Write each as a mixed radical in simplest form.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) { return primePowPart(r, false); } },
        { id: 'e3b', level: 'PRG', make: function (r) { return primePowPart(r, true); } }] },
      { num: '4', stem: 'Convert each mixed radical to an entire radical.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) { return toEntire(r.int(5, 9), r.pick([6, 10, 11])); } },
        { id: 'e4b', level: 'EMG', make: function (r) { return toEntire(-r.int(6, 9), r.pick([2, 3, 5])); } },
        { id: 'e4c', level: 'PRG', make: function (r) { var q = r.pick([3, 4]), p = r.pick([1, 2, 3].filter(function (x) { return gcd(x, q) === 1 && x < q; })); return fracEntire([p, q], q * q * r.pick([2, 3, 5, 6, 7])); } },
        { id: 'e4d', level: 'PRG', make: function (r) { var q = r.pick([5, 6]), p = r.pick([1, 2, 3, 4].filter(function (x) { return gcd(x, q) === 1 && x < q; })); return fracEntire([p, q], q * q * r.pick([2, 3, 6, 7])); } },
        { id: 'e4e', level: 'PRG', make: function (r) { var q = r.pick([2, 3]), p = r.pick([5, 7]); return fracEntire([p, q], q * q * r.pick([2, 3, 5])); } },
        { id: 'e4f', level: 'PRG', make: function (r) { var d = r.pick([['0.4', [2, 5]], ['0.6', [3, 5]], ['0.2', [1, 5]], ['0.5', [1, 2]], ['1.5', [3, 2]], ['0.8', [4, 5]]]); return fracEntire(d[1], d[1][1] * d[1][1] * r.pick([2, 3, 5, 6]), d[0]); } }] },
      { num: '5', stem: function (sh) { return 'Three of these four radicals can be written as mixed radicals; one cannot. Simplify each one — if it cannot be simplified, type it unchanged.'; },
        shared: function (r) {
          var nums = [];
          while (nums.length < 3) { var n = Math.pow(r.int(13, 45), 2) * r.pick([2, 3, 5, 6, 7]); if (n >= 1000 && n <= 6500 && nums.indexOf(n) < 0) nums.push(n); }
          var sf = pickWhere(r, function () { return r.int(1000, 2500); }, function (v) { return sqFree(v) && nt.factor(v).length >= 3; }) || 1590;
          var pos = r.int(0, 3); nums.splice(pos, 0, sf);
          return { nums: nums, sf: sf };
        },
        parts: [
          { id: 'e5a', level: 'PRG', make: function (r, sh) { return factorMixed(sh.nums[0]); } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) { return factorMixed(sh.nums[1]); } },
          { id: 'e5c', level: 'PRG', make: function (r, sh) { return factorMixed(sh.nums[2]); } },
          { id: 'e5d', level: 'PRG', make: function (r, sh) { return factorMixed(sh.nums[3]); } },
          { id: 'e5e', level: 'EMG', make: function (r, sh) {
            var n = sh.sf;
            return P.mc(r, t(sq(n)) + ' cannot be simplified. Which statement about the prime factorization of ' + t(F(n)) + ' <b>explains why</b>?', [
              { html: 'Every prime appears only once, so there is no pair of equal primes (no perfect square) to take out.', right: true },
              { html: 'It contains a large prime factor.', why: 'A large prime doesn’t stop a radical from simplifying: ' + t('\\sqrt{2\\times 53^{2}}=53\\sqrt{2}') + '. What matters is whether any prime appears at least twice.' },
              { html: 'It has more than two prime factors.', why: t('720=2^{4}\\times 3^{2}\\times 5') + ' has many prime factors and still simplifies to ' + t('12\\sqrt{5}') + '. Look at whether any prime is repeated.' },
              { html: 'All of its exponents are even.', why: 'Then it would be a perfect square, and its root would be a whole number! Look at the exponents again.' }],
              t(F(n) + '=' + K.fac(n)) + '. Every prime appears exactly once, so no perfect square (other than 1) divides it: ' + t(sq(n)) + ' is already in simplest form.', ['Write the prime factorization of ' + t(F(n)) + '.'], 'square-free ' + n);
          } }] },
      { num: '6', section: 'Extra practice B — Comparing radicals', stem: '<b>No calculator.</b> Convert every radical to entire form first, then compare the radicands.', parts: [
        { id: 'e6', level: 'PRG', make: function (r) { return orderPart(r, orderItems(r, 40, 99), false); } }] },
      { num: '7', section: 'Extra practice C — Error analysis', stem: 'Each student made exactly one mistake.', parts: [
        { id: 'e7', level: 'EMG', make: function (r) {
          var s = r.int(3, 7), m = r.pick([2, 3, 5]), N = s * s * m;
          return P.mc(r, '<b>Owen</b> writes ' + t(sq(N) + '=\\sqrt{' + s * s + '\\times ' + m + '}=' + s + sq(m)) + ', then says “and ' + t(s + sq(m)) + ' simplifies further to ' + t(sq(s * m)) + '.” What is his error?', [
            { html: 'Moving ' + t(s) + ' under the root means <b>squaring</b> it: ' + t(s + sq(m) + '=' + sq(N)) + ', not ' + t(sq(s * m)) + '. And ' + t(s + sq(m)) + ' is already in simplest form.', right: true },
            { html: 'Nothing: ' + t(sq(s * m)) + ' is simpler because it has no coefficient.', why: 'Check with a calculator: ' + t(s + sq(m) + '\\approx ' + (s * Math.sqrt(m)).toFixed(2)) + ' but ' + t(sq(s * m) + '\\approx ' + Math.sqrt(s * m).toFixed(2)) + '. They aren’t equal.' },
            { html: 'His first step is wrong: ' + t(s * s) + ' is not the right perfect square to use.', why: t(s * s) + ' is the largest perfect square factor of ' + t(N) + ', so the first line is correct. Look at what he does next.' },
            { html: 'He should have added instead: ' + t(s + sq(m) + '=\\sqrt{' + s + '+' + m + '}') + '.', why: 'A coefficient <b>multiplies</b> the root, and moving it inside means squaring it.' }],
            'The first line is right: ' + t(sq(N) + '=' + s + sq(m)) + ', already in simplest form. The second step is wrong: to move ' + t(s) + ' back inside it must be squared, ' + t(s + sq(m) + '=\\sqrt{' + s * s + '\\times ' + m + '}=' + sq(N)) + '. (Check: ' + t(s + sq(m) + '\\approx ' + (s * Math.sqrt(m)).toFixed(2)) + ' but ' + t(sq(s * m) + '\\approx ' + Math.sqrt(s * m).toFixed(2)) + '.)',
            ['What happens to a coefficient when it moves under a square root?'], 'Owen error s=' + s);
        } }] },
      { num: '8', stem: function (sh) { return '<b>Quinn</b> writes ' + t(sq(sh.n) + '=\\sqrt{' + sh.t * sh.t + '\\times ' + F(sh.n / (sh.t * sh.t)) + '}=' + sh.t + sq(sh.n / (sh.t * sh.t))) + ' and stops there.'; },
        shared: function (r) { var o = r.pick([[6, 2], [6, 3], [10, 2], [10, 5], [12, 2], [12, 3], [12, 4], [12, 6], [15, 3], [15, 5], [20, 2], [20, 4]]), m = r.pick([2, 3, 5, 7]); return { s: o[0], t: o[1], m: m, n: o[0] * o[0] * m }; },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r, sh) {
            var rest = sh.n / (sh.t * sh.t), u = sh.s / sh.t;
            return P.mc(r, 'What is Quinn’s mistake?', [
              { html: 'He didn’t finish: ' + t(F(rest)) + ' still contains the perfect square ' + t(u * u) + ', so it must come out too.', right: true },
              { html: 'Using ' + t(sh.t * sh.t) + ' isn’t allowed; you may only split off the largest perfect square.', why: 'Any perfect-square factor is allowed — you just have to keep going until none are left under the root.' },
              { html: 'Nothing: ' + t(sh.t + sq(rest)) + ' is in simplest form.', why: t(F(rest) + '=' + u * u + '\\times ' + sh.m) + ' still has a perfect-square factor.' },
              { html: 'He should have divided ' + t(F(sh.n)) + ' by ' + t(sh.t) + ', not by ' + t(sh.t * sh.t) + '.', why: 'Dividing by ' + t(sh.t * sh.t) + ' is right: ' + t(sh.t) + ' outside the root stands for ' + t(sh.t * sh.t) + ' inside it.' }],
              t(F(rest) + '=' + u * u + '\\times ' + sh.m) + ' still holds a perfect square, so ' + t(sh.t + sq(rest)) + ' is not in simplest form: ' + t(sh.t + sq(rest) + '=' + sh.t + '\\times ' + u + sq(sh.m) + '=' + sh.s + sq(sh.m)) + '. (Taking the largest perfect square first: ' + t(sq(sh.n) + '=\\sqrt{' + sh.s * sh.s + '\\times ' + sh.m + '}=' + sh.s + sq(sh.m)) + '.)',
              ['Is there a perfect square hiding in ' + t(F(rest)) + '?'], 'Quinn error √' + sh.n);
          } },
          { id: 'e8b', level: 'EMG', make: function (r, sh) { var p = toMixed(1, sh.n); p.prompt = 'Give the correct simplest form of ' + t(sq(sh.n)) + '.'; return p; } }] },
      { num: '9', section: 'Extra practice D — Combining, applying, stretching',
        stem: '<b>Beyond the booklet: like radicals.</b> Two radicals are <b>like radicals</b> when they have the same index and the same radicand, and only then can their coefficients be added or subtracted: ' + t('3\\sqrt{5}+4\\sqrt{5}=7\\sqrt{5}') + ', exactly as ' + t('3x+4x=7x') + '. The radicals below look unlike, so simplify each term to a mixed radical first, then combine.', parts: [
          { id: 'e9a', level: 'PRG', make: function (r) { var m = r.pick([2, 3, 5, 6, 7]), ab = r.sample([2, 3, 4, 5], 2); return likePart([[1, ab[0]], [1, ab[1]]], m); } },
          { id: 'e9b', level: 'PRG', make: function (r) { var v = pickWhere(r, function () { return [r.int(2, 4), r.int(2, 3), r.int(2, 6)]; }, function (x) { var d = x[0] * x[1] - x[2]; return d >= 1 && d <= 4 && x[1] !== x[2]; }) || [3, 2, 5]; return likePart([[v[0], v[1]], [-1, v[2]]], r.pick([2, 3, 5])); } },
          { id: 'e9c', level: 'PRG', make: function (r) { var v = pickWhere(r, function () { return r.sample([2, 3, 4, 5], 3); }, function (x) { return x[0] + x[1] - x[2] >= 2; }) || [3, 4, 2]; return likePart([[1, v[0]], [1, v[1]], [-1, v[2]]], r.pick([2, 3, 5])); } }] },
      { num: '10', stem: function (sh) { return 'A rectangular box measures ' + t(sh.d[0] + '\\text{ cm}\\times ' + sh.d[1] + '\\text{ cm}\\times ' + sh.d[2] + '\\text{ cm}') + '. The longest straight rod that fits inside runs corner to corner, and its length ' + t('d') + ' satisfies ' + t('d^{2}=' + sh.d[0] + '^{2}+' + sh.d[1] + '^{2}+' + sh.d[2] + '^{2}') + '.'; },
        shared: function (r) { return boxDims(r); },
        parts: [
          { id: 'e10a', sub: 'i', level: 'EMG', make: function (r, sh) { var p = toEntire(sh.s, sh.m, { prompt: 'Give ' + t('d') + ' (in cm) as an <b>entire radical</b>.', more: boxDiag(sh), sol: boxSol(sh) }); p.text = 'box diagonal entire ' + sh.d.join('x');
            p.hints = ['Square all three dimensions and add them to get ' + t('d^{2}') + '.', 'Then ' + t('d=\\sqrt{d^{2}}') + ' — that square root is the entire radical.']; return p; } },
          { id: 'e10b', sub: 'ii', level: 'EMG', make: function (r, sh) { var p = toMixed(1, sh.S, { prompt: 'Give ' + t('d') + ' (in cm) as a <b>mixed radical</b> in simplest form.', more: boxDiag(sh) }); p.solution = boxSol(sh) + '<br>' + mixedSol([1, 1], sh.S, ''); p.text = 'box diagonal mixed ' + sh.d.join('x'); return p; } },
          { id: 'e10c', sub: 'iii', level: 'BEG', make: function (r, sh) { return P.approx('Give ' + t('d') + ' to the nearest hundredth of a centimetre.', Math.sqrt(sh.S), 2, { after: 'cm' }, boxSol(sh) + '<br>' + t('d=' + sq(sh.S) + '=' + Math.sqrt(sh.S).toFixed(5) + '\\ldots\\approx ' + K.roundTo(Math.sqrt(sh.S), 2).toFixed(2)) + ' cm.', ['Add the three squares, then take the square root on your calculator.'], 'box diagonal decimal ' + sh.d.join('x')); } }] },
      { num: '11', stem: function (sh) {
          var a = sh.a, H = a * Math.sqrt(3);
          return 'An equilateral triangle has side length ' + t(2 * a) + ' cm. Dropping a perpendicular from one vertex splits it into two right triangles.' + fig({ A: [0, 0], B: [2 * a, 0], C: [a, H], D: [a, 0] }, { edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D']], right: [['D', 'C', 'B']], labels: [['A', 'C', String(2 * a)], ['B', 'C', String(2 * a)], ['A', 'D', String(a)], ['D', 'B', String(a)]], H: 120 });
        },
        shared: function (r) { return { a: r.int(2, 10) }; },
        parts: [
          { id: 'e11a', level: 'PRG', make: function (r, sh) {
            var a = sh.a, p = toMixed(1, 3 * a * a, { prompt: 'Find the exact height as a mixed radical (in cm).', more: function (val) { return near(val, a * Math.sqrt(5)) ? { code: 'hyp-added', hint: 'The side ' + t(2 * a) + ' is the hypotenuse of each right triangle, so subtract: ' + t('h^{2}=' + 2 * a + '^{2}-' + a + '^{2}') + '.' } : null; } });
            p.solution = 'The perpendicular bisects the base, so each right triangle has hypotenuse ' + t(2 * a) + ' and base ' + t(a) + '.<br>' + t('h^{2}=' + 2 * a + '^{2}-' + a + '^{2}=' + 4 * a * a + '-' + a * a + '=' + 3 * a * a) + ', so ' + t('h=' + sq(3 * a * a) + '=' + ansTex(a, 3)) + ' cm.'; p.text = 'equilateral height side ' + 2 * a; return p;
          } },
          { id: 'e11b', level: 'ADV', make: function (r, sh) {
            var a = sh.a, p = toMixed(1, 3 * a * a * a * a, { prompt: 'Find the exact area as a mixed radical (in cm²).', more: function (val) {
              if (near(val, 2 * a * a * Math.sqrt(3))) return { code: 'no-half', hint: 'The area of a triangle is ' + t('A=\\tfrac{1}{2}bh') + ' — don’t forget the ' + t('\\tfrac{1}{2}') + '.' };
              if (near(val, a * a * Math.sqrt(5)) || near(val, 2 * a * a * Math.sqrt(5))) return { code: 'hyp-added', hint: 'Check the height: the side ' + t(2 * a) + ' is the hypotenuse, so ' + t('h^{2}=' + 2 * a + '^{2}-' + a + '^{2}') + '.' };
              return null;
            } });
            p.solution = 'Height: ' + t('h^{2}=' + 2 * a + '^{2}-' + a + '^{2}=' + 3 * a * a) + ', so ' + t('h=' + ansTex(a, 3)) + '.<br>' + t('A=\\tfrac{1}{2}bh=\\tfrac{1}{2}\\times ' + 2 * a + '\\times ' + ansTex(a, 3) + '=' + ansTex(a * a, 3)) + ' cm².'; p.text = 'equilateral area side ' + 2 * a;
            p.hints = ['Find the exact height first: the side is the hypotenuse of each right triangle.', 'Then use ' + t('A=\\tfrac{1}{2}bh') + ' with base ' + t(2 * a) + '.']; return p;
          } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e12', level: 'PRG', make: function (r) {
          var s = 0, m = 0, n = 0;
          for (var i = 0; i < 200; i++) { s = r.int(25, 57); m = r.pick([2, 3]); n = s * s * m; if (n >= 1500 && n <= 9999) break; }
          var ans = s + m;
          return P.nr('Written in simplest form, ' + t(sq(n) + '=a\\sqrt{b}') + ' where ' + t('a,b\\in N') + '. The value of ' + t('a+b') + ' is ________.', ans, function (v) {
            if (v === s * m) return { code: 'product', hint: 'The question asks for ' + t('a+b') + ', not ' + t('ab') + '.' };
            var ds = nt.divisors(s).filter(function (x) { return x > 1 && x < s; });
            for (var j = 0; j < ds.length; j++) if (v === ds[j] + m * (s / ds[j]) * (s / ds[j])) return { code: 'not-simplest', hint: 'Not simplest form yet: the radicand you got still has a perfect-square factor.' };
            return null;
          }, t(F(n) + '=' + K.fac(n) + '=' + F(s * s) + '\\times ' + m) + ', and ' + t(F(s * s) + '=' + s + '^{2}') + '.<br>' + t(sq(n) + '=' + s + sq(m)) + ', so ' + t('a=' + s + ',\\ b=' + m) + ' and ' + t('a+b=' + ans) + '.', ['Write the prime factorization and pair off the primes.'], 'a+b for √' + n);
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e13', level: 'PRG', make: function (r) {
          var sh = boxDims(r), ans = sh.s * sh.m;
          return P.nr('A box measures ' + t(sh.d[0] + '\\text{ cm}\\times ' + sh.d[1] + '\\text{ cm}\\times ' + sh.d[2] + '\\text{ cm}') + '. Its corner-to-corner diagonal ' + t('d') + ' (with ' + t('d^{2}=a^{2}+b^{2}+c^{2}') + ') is ' + t('p\\sqrt{q}') + ' in simplest form, where ' + t('p,q\\in N') + '. The value of ' + t('pq') + ' is ________.', ans, function (v) {
            if (v === sh.s + sh.m) return { code: 'sum', hint: 'The question asks for the product ' + t('pq') + ', not the sum.' };
            if (v === sh.S) return { code: 'no-root', hint: 'That’s ' + t('d^{2}') + '. Write ' + t('d=' + sq(sh.S)) + ' in simplest form first.' };
            return null;
          }, boxSol(sh) + '<br>' + mixedSol([1, 1], sh.S, '') + '<br>' + t('p=' + sh.s + ',\\ q=' + sh.m) + ', so ' + t('pq=' + ans) + '.', ['Add the three squares, then simplify the square root.'], 'box pq ' + sh.d.join('x'));
        } }] },
      { num: '14', stem: '<b>Stretch.</b> Run the whole process backwards.', parts: [
        { id: 'e14', level: 'ADV', make: function (r) {
          var c = r.pick([5, 6, 7, 8, 9, 10, 12, 15]), ans = 2 * c * c;
          return P.nr('The <b>smallest</b> whole number ' + t('n') + ' for which ' + t('\\sqrt{n}') + ', in simplest form, is a mixed radical with coefficient exactly ' + t(c) + ' is ________.', ans, function (v) {
            if (v === c * c) return { code: 'whole', hint: t('\\sqrt{' + c * c + '}=' + c) + ' is a whole number, not a mixed radical. Something must be left under the root.' };
            if (v === 2 * c) return { code: 'no-square', hint: 'A coefficient of ' + t(c) + ' comes from ' + t('\\sqrt{' + c * c + '}') + ', so ' + t('n') + ' must be a multiple of ' + t(c * c) + '.' };
            if (v > ans && v % (c * c) === 0 && sqFree(v / (c * c))) return { code: 'not-smallest', hint: t('\\sqrt{' + F(v) + '}=' + c + '\\sqrt{' + v / (c * c) + '}') + ' works, but there is a smaller one.' };
            if (v % (c * c) === 0 && !sqFree(v / (c * c))) return { code: 'value', hint: t('\\sqrt{' + F(v) + '}') + ' simplifies further, so its coefficient isn’t ' + t(c) + '.' };
            return null;
          }, 'A coefficient of ' + t(c) + ' comes from ' + t('\\sqrt{' + c * c + '}') + ', so ' + t('n=' + c * c + 'k') + ' and ' + t('\\sqrt{n}=' + c + '\\sqrt{k}') + ', where ' + t('k') + ' has no square factor.<br>' + t('k=1') + ': ' + t('\\sqrt{' + c * c + '}=' + c) + ', a whole number — not a mixed radical.<br>' + t('k=2') + ': ' + t('\\sqrt{' + ans + '}=' + c + '\\sqrt{2}') + ' ✓. So ' + t('n=' + ans) + '.',
          ['A coefficient of ' + t(c) + ' outside the root means ' + t(c * c) + ' inside.', 'What is the smallest number you can leave under the root so that it is still a mixed radical?'], 'smallest n with coefficient ' + c);
        } }] },
      { num: '15', stem: '<b>Stretch.</b> Recall ' + t('n!=n\\times(n-1)\\times\\cdots\\times 2\\times 1') + '.', parts: [
        { id: 'e15', level: 'ADV', make: function (r) {
          var n = r.pick([7, 8, 9, 10]), v = 1; for (var i = 2; i <= n; i++) v *= i;
          var f = nt.factor(v), out = 1, inn = 1; f.forEach(function (pe) { out *= Math.pow(pe[0], Math.floor(pe[1] / 2)); inn *= Math.pow(pe[0], pe[1] % 2); });
          var list = []; for (var j = 2; j <= n; j++) list.push(nt.isPrime(j) ? String(j) : K.fac(j));
          var p = mathPart('Simplify ' + t('\\sqrt{' + n + '!}') + '. Don’t multiply it out — factor each of ' + t('2, 3, \\ldots, ' + n) + ' into primes and count.', K.radical({ k: out, n: 2, m: inn }, 'mixed'), ex.texRadical(out, 2, inn), t(ansTex(out, inn)),
            'Factor each number: ' + t(list.join(',\\ ')) + '.<br>Count each prime: ' + t(n + '!=' + HW.texFactors(f)) + '.<br>Halve each exponent (an odd exponent leaves one factor under the root): ' + t('\\sqrt{' + n + '!}=' + HW.texFactors(f.map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; }).filter(function (pe) { return pe[1] > 0; })) + '\\sqrt{' + inn + '}=' + ansTex(out, inn)) + '.',
            ['Write ' + t(n + '!') + ' as a product of primes with exponents.', 'Each pair of equal primes comes out as one prime.'], '√' + n + '!', { good: [plain(out, inn)], bad: [sq(v)] });
          return p;
        } }] }
    ]
  });

  /* ---------- part makers that use the helpers above ---------- */
  function kindPart(r, tex, mixed, why) {
    var p = P.mc(r, t(tex), [{ html: 'Entire radical', right: !mixed, why: mixed ? why : null, code: 'said-entire' }, { html: 'Mixed radical', right: mixed, why: mixed ? null : why, code: 'said-mixed' }],
      mixed ? 'A number sits in front of the root (a coefficient), so ' + t(tex) + ' is a <b>mixed</b> radical.' : 'Nothing multiplies the root — the number sits alone under the root sign — so ' + t(tex) + ' is an <b>entire</b> radical.',
      ['Entire: the number is alone under the root, like ' + t('\\sqrt{31}') + '. Mixed: a coefficient sits in front, like ' + t('7\\sqrt{11}') + '.'], 'entire or mixed: ' + tex.replace(/\\sqrt\{([^}]*)\}/g, '√$1'), true);
    p.tries = 1; p.input.columns = 2;
    return p;
  }
  /* a proper fraction p/q with q | s (so the coefficient times s is a whole number ≥ 2) */
  function fracCoef(r, sPool, qMin) {
    for (var i = 0; i < 400; i++) {
      var s = r.pick(sPool), qs = nt.divisors(s).filter(function (d) { return d > 1 && d < s && d >= (qMin || 2) && d <= 12; });
      if (!qs.length) continue;
      var q = r.pick(qs), ps = []; for (var p = 1; p < q; p++) if (gcd(p, q) === 1) ps.push(p);
      var pp = r.pick(ps); if (pp * s / q >= 2) return { s: s, q: q, p: pp };
    }
    return { s: 8, q: 4, p: 3 };
  }
  function hypDiag(sh) { return function (val) { return near(Math.abs(val), Math.sqrt(sh.h * sh.h + sh.l * sh.l)) ? { code: 'hyp-added', hint: t('XZ') + ' is the hypotenuse (opposite the right angle at ' + t('Y') + '), so subtract: ' + t('XY^{2}=XZ^{2}-YZ^{2}') + '.' } : null; }; }
  function hypSol(sh) { return t('XZ=' + sh.h) + ' is the hypotenuse (opposite the right angle): ' + t('XY^{2}=' + sh.h + '^{2}-' + sh.l + '^{2}=' + sh.h * sh.h + '-' + sh.l * sh.l + '=' + sh.N) + ', so ' + t('XY=' + sq(sh.N)) + ' cm.'; }
  /* simplest mixed radical with a prime-factorization solution */
  function factorMixed(n) {
    var p = toMixed(1, n), f = nt.factor(n), s = big(n), m = n / (s * s);
    if (s > 1) {
      var outF = f.filter(function (pe) { return pe[1] >= 2; }).map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; }), inF = f.filter(function (pe) { return pe[1] % 2; }).map(function (pe) { return pe[0]; });
      p.solution = t(F(n) + '=' + K.fac(n)) + '. Each pair of equal primes comes out as one prime; an unpaired prime stays under the root.<br>' + t(sq(n) + '=' + HW.texFactors(outF) + '\\sqrt{' + (inF.length ? inF.join('\\times ') : '1') + '}=' + ansTex(s, m)) + '.';
    }
    p.hints = ['Write the prime factorization of ' + t(F(n)) + ' first (start dividing by 2, 3, 5, …).', 'Each <b>pair</b> of equal primes comes out of the root as one prime.'];
    return p;
  }
  /* √(p1^e1 × p2^e2 × p3^e3), radicand shown already factored */
  function primePowPart(r, withOne) {
    for (var i = 0; i < 400; i++) {
      var ps = r.sample([2, 3, 5, 7, 11], 3).sort(function (a, b) { return a - b; });
      var es = withOne ? [r.pick([3, 5]), 2, 1] : [r.pick([3, 5]), r.pick([2, 4]), r.pick([2, 4])];
      es = r.shuffle(es);
      if (withOne && es[ps.length - 1] !== 1 && r.chance(0.5)) continue;
      var f = ps.map(function (p, j) { return [p, es[j]]; }), out = 1, inn = 1, noHalve = 1;
      f.forEach(function (pe) { out *= Math.pow(pe[0], Math.floor(pe[1] / 2)); inn *= Math.pow(pe[0], pe[1] % 2); noHalve *= Math.pow(pe[0], pe[1] - pe[1] % 2); });
      if (out > 2000 || inn < 2) continue;
      var tex = '\\sqrt{' + HW.texFactors(f) + '}';
      return mathPart(t(tex), K.radical({ k: out, n: 2, m: inn }, 'mixed', { diag: function (val) { return near(val, noHalve * Math.sqrt(inn)) ? { code: 'no-halve', hint: 'An even exponent comes out <b>halved</b>: ' + t('\\sqrt{p^{4}}=p^{2}') + ', not ' + t('p^{4}') + '.' } : null; } }),
        ex.texRadical(out, 2, inn), t(ansTex(out, inn)),
        'Halve each even exponent; an odd exponent leaves one factor under the root:<br>' + t(tex + '=' + HW.texFactors(f.map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; }).filter(function (pe) { return pe[1] > 0; })) + '\\sqrt{' + f.filter(function (pe) { return pe[1] % 2; }).map(function (pe) { return pe[0]; }).join('\\times ') + '}=' + ansTex(out, inn)) + '.',
        ['Split each power into a square part and what is left, e.g. ' + t('2^{5}=2^{4}\\times 2') + '.', t('\\sqrt{p^{4}}=p^{2}') + ': the exponent is halved when it comes out.'], 'prime-power radicand ' + HW.texFactors(f), { good: [plain(out, inn)], bad: [ex.texRadical(noHalve, 2, inn)] });
    }
    return null;
  }
  /* fraction / decimal coefficient -> entire radical */
  function fracEntire(c, n, dispDec) {
    var cd = dispDec || cTex(c), N = Math.round(rv(c) * rv(c) * n), cv = rv(c);
    var p = toEntire(c, n, { disp: cd, more: dispDec ? function (val) { return near(Math.abs(val), Math.sqrt(100 * cv * cv * n)) ? { code: 'den-square', hint: 'Careful with the decimal: ' + t(dispDec + '^{2}=' + K.roundTo(cv * cv, 4)) + ', not ' + t(K.roundTo(100 * cv * cv, 4)) + '.' } : null; } : null });
    p.solution = (dispDec ? t(dispDec + '=\\tfrac{' + c[0] + '}{' + c[1] + '}') + '. ' : '') + 'Square the coefficient: ' + t('\\left(\\tfrac{' + c[0] + '}{' + c[1] + '}\\right)^{2}=\\tfrac{' + c[0] * c[0] + '}{' + c[1] * c[1] + '}') + '.<br>' + t('\\tfrac{' + c[0] * c[0] + '}{' + c[1] * c[1] + '}\\times ' + n + '=' + N) + ', so ' + t(cd + sq(n) + '=' + sq(N)) + '.';
    return p;
  }
  /* sum of like radicals: terms = [[coef, s]] meaning coef·√(s²m) */
  function likePart(terms, m) {
    var total = 0, shownT = [], naive = 0, steps = [];
    terms.forEach(function (tm, i) {
      var c = tm[0], s = tm[1], n = s * s * m, ac = Math.abs(c);
      total += c * s; naive += (c > 0 ? 1 : -1) * ac * ac * n;
      shownT.push((i ? (c > 0 ? '+' : '-') : (c < 0 ? '-' : '')) + (ac === 1 ? '' : ac) + sq(n));
      steps.push(t((ac === 1 ? '' : ac) + sq(n) + '=' + (ac === 1 ? '' : ac + '\\times ') + ansTex(s, m) + (ac === 1 ? '' : '=' + ansTex(ac * s, m))));
    });
    var q = shownT.join(''), key = ex.texRadical(total, 2, m);
    var check = K.radical({ k: total, n: 2, m: m }, 'mixed', { diag: function (val) {
      if (naive > 0 && near(val, Math.sqrt(naive))) return { code: 'add-radicands', hint: 'You can’t combine the radicands: ' + t(shownT.slice(0, 2).join('') + '\\ne\\sqrt{\\ldots}') + '. Simplify each radical first, then combine the coefficients of the like radicals.' };
      return null;
    } });
    return mathPart(t(q), check, key, t(ansTex(total, m)), 'Simplify each term:<br>' + steps.join('<br>') + '<br>Combine like radicals: ' + t(terms.map(function (tm, i) { var k = Math.abs(tm[0] * tm[1]); return (i ? (tm[0] > 0 ? '+' : '-') : '') + ansTex(k, m); }).join('') + '=' + ansTex(total, m)) + '.',
      ['Simplify each radical to a mixed radical. They should all end up with ' + t(sq(m)) + '.', 'Then add or subtract the coefficients, like ' + t('3x+4x=7x') + '.'], 'like radicals ' + q.replace(/\\sqrt\{([^}]*)\}/g, '√$1'), { good: [plain(total, m)], bad: [sq(Math.abs(naive))] });
  }
  /* box with dimensions 2x, 2y, 2z: d² = 4(x²+y²+z²) */
  function boxDims(r) {
    for (var i = 0; i < 400; i++) {
      var v = r.sample([1, 2, 3, 4, 5, 6, 7], 3).sort(function (a, b) { return a - b; }), S = 4 * (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      if (isSq(S) || v[0] === 1) continue;
      var s = big(S); return { d: v.map(function (x) { return 2 * x; }), S: S, s: s, m: S / (s * s) };
    }
    return { d: [6, 8, 12], S: 244, s: 2, m: 61 };
  }
  function boxDiag(sh) {
    return function (val) {
      var d = sh.d;
      for (var i = 0; i < 3; i++) { var a = d[i], b = d[(i + 1) % 3]; if (near(Math.abs(val), Math.sqrt(a * a + b * b))) return { code: 'two-dims', hint: 'Use all three dimensions: ' + t('d^{2}=' + d[0] + '^{2}+' + d[1] + '^{2}+' + d[2] + '^{2}') + '.' }; }
      return null;
    };
  }
  function boxSol(sh) { var d = sh.d; return t('d^{2}=' + d[0] + '^{2}+' + d[1] + '^{2}+' + d[2] + '^{2}=' + d[0] * d[0] + '+' + d[1] * d[1] + '+' + d[2] * d[2] + '=' + sh.S) + ', so ' + t('d=' + sq(sh.S)) + ' cm.'; }
})(window);
