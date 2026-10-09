/* Math 10C · Unit 2 · Lesson 5A — Rational Exponents and Radicals (AN3)
 * Assignment questions 1–19 (u2_L05A.tex) and the Lesson 5 Extra Practice items about evaluating rational-exponent
 * powers, converting between powers and radicals, negative bases and applications (u2_EP05.tex: 1–14, 19, 20, 21(c),
 * 22, 24). The EP05 items that simplify with the exponent laws (15–18, 21(a)(b), 23) belong to Lesson 5B.
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'neg-exp-sign': 'Read a negative exponent as a negative answer', 'no-recip': 'Forgot the reciprocal (negative exponent)',
    'times-exp': 'Multiplied the base by the exponent', swap: 'Swapped the root index and the power', 'root-only': 'Took the root but not the power',
    'no-root': 'Forgot the root (used the numerator only)', 'square-root': 'Used a square root for every denominator', 'dec-root': 'Wrong root of a decimal',
    'term-root': 'Took the root of each term separately', 'no-brackets': 'Calculator: exponent not in brackets', 'neg-brackets': 'Calculator: negative base not in brackets',
    entire: 'Not written as an entire radical', 'root-first': 'Not written root-first', 'coef-inside': 'Moved the coefficient under the radical',
    'coef-outside': 'Left the bracketed coefficient outside the radical', 'coef-not-powered': 'Didn’t raise the coefficient to the power', 'coef-times': 'Multiplied the coefficient by the exponent',
    'coef-flipped': 'Moved the coefficient to the denominator too', 'minus-inside': 'Moved the minus sign inside the root', 'same-base': 'Used the number itself as the base',
    exponent: 'Used a different exponent', 'six-faces': 'Forgot the cube has 6 faces', 'not-squared': 'Didn’t square the edge for the area', 'four-sides': 'Forgot the 4 sides',
    'no-pi': 'Left out π', 'one-solution': 'Found only one solution', 'same-power': 'Raised both sides to the same power instead of the reciprocal',
    'said-none': 'Said “no meaning” for a defined power', 'missed-none': 'Gave a value for an undefined power', 'not-power': 'Not written as a power', 'reversed': 'Ordered least to greatest',
    'calc-sign': 'One calculation’s sign wrong', base: 'Raised the coefficient with the base', misread: 'Mixed up the two values', 'picked-defined': 'Picked a power that has meaning', missed: 'Missed one', 'all-faces': 'Gave all six faces instead of one'
  });

  /* ---------- exact arithmetic ---------- */
  function iroot(v, n) { // exact integer nth root of v (negative allowed for odd n), else null
    if (v < 0) { if (n % 2 === 0) return null; var q = iroot(-v, n); return q == null ? null : -q; }
    var c0 = Math.round(Math.pow(v, 1 / n));
    for (var c = Math.max(0, c0 - 1); c <= c0 + 1; c++) if (Math.pow(c, n) === v) return c;
    return null;
  }
  function ratRoot(fr, n) { var a = iroot(fr[0], n), b = iroot(fr[1], n); return a == null || b == null ? null : [a, b]; }
  function ratPow(fr, k) { var pp = Math.pow(fr[0], Math.abs(k)), qq = Math.pow(fr[1], Math.abs(k)); return k < 0 ? ex.norm(qq, pp) : ex.norm(pp, qq); }
  function rv(fr) { return fr[0] / fr[1]; }
  function rpow(b, m, n) { // real value of b^(m/n); NaN when it has no real value
    var g = ex.gcd(m, n) || 1; m /= g; n /= g; if (n < 0) { m = -m; n = -n; }
    if (b < 0) { if (n % 2 === 0) return NaN; return Math.pow(-Math.pow(-b, 1 / n), m); }
    return Math.pow(b, m / n);
  }
  function near(a, b) { return isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b)); }

  /* ---------- LaTeX ---------- */
  function ratTex(fr) { return fr[1] === 1 ? F(fr[0]) : (fr[0] < 0 ? '-' : '') + '\\frac{' + F(Math.abs(fr[0])) + '}{' + F(fr[1]) + '}'; }
  function numTex(fr, dec) { return dec ? K.decTex(fr) : ratTex(fr); }
  function baseTex(fr, dec) { var s = numTex(fr, dec); return fr[0] < 0 || dec || fr[1] !== 1 ? '\\left(' + s + '\\right)' : s; }
  function expTex(m, n) { var g = ex.gcd(m, n) || 1; m /= g; n /= g; if (n < 0) { m = -m; n = -n; } return n === 1 ? String(m) : (m < 0 ? '-' : '') + Math.abs(m) + '/' + n; }
  function rootTex(n, inner) { return ex.texRoot(n, inner); }
  function rootName(n) { return K.rootName(n); }
  function nth(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th'; }
  function powName(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th power'; }
  function dedupe(arr) { return arr.filter(function (x, i) { return i === 0 || x !== arr[i - 1]; }); }
  function decStr(x) { return String(K.roundTo(x, 2).toFixed(2)); }
  function numOr(x) { var r = Math.round(x); return Math.abs(r - x) < 1e-9 ? F(r) : (Math.round(x * 10000) / 10000).toString(); }
  function sgn(x) { return x < 0 ? -1 : 1; }

  /* ---------- evaluate b^(m/n) exactly (b a rational, possibly negative or a decimal) ----------
   * o: { base:[p,q], m, n, outer (±1), dec (show decimals), btex (base TeX in the prompt), etex (exponent TeX in the prompt),
   *      prompt (whole expression TeX), sbtex (base TeX in the solution), pre (first solution line), extra (more diagnoses),
   *      ask (prompt wrapper), text } */
  function EV(o) {
    o.outer = o.outer || 1;
    var n = o.n, m = o.m, rt = ratRoot(o.base, n);
    if (!rt) throw new Error('no exact root: ' + o.base + ' index ' + n);
    var core = ratPow(rt, m), val = o.outer < 0 ? [-core[0], core[1]] : core;
    var bt = o.btex || baseTex(o.base, o.dec), et = o.etex || expTex(m, n);
    var expr = o.prompt || ((o.outer < 0 ? '-' : '') + bt + '^{' + et + '}');
    var cands = evalCands(o, rt, rv(val)).concat(o.extra || []);
    var check = K.fraction(val, { decimalOk: !!o.dec, diag: function (v) {
      for (var i = 0; i < cands.length; i++) if (near(v, cands[i].v)) return { code: cands[i].code, hint: cands[i].hint };
      return null;
    } });
    var keyTex = o.dec ? K.decTex(val) : ex.texRat(val);
    var hints = ['The denominator ' + t(n) + ' is the index of the root and the numerator ' + t(Math.abs(m)) + ' is the power. Take the root first to keep the numbers small.'];
    if (m < 0) hints.push('A negative exponent means <b>reciprocal</b>: ' + t('a^{-k}=\\frac{1}{a^{k}}') + '. It doesn’t make the answer negative.');
    else if (o.base[0] < 0) hints.push('An odd root of a negative number is negative, e.g. ' + t('\\sqrt[3]{-8}=-2') + '.');
    else if (o.outer < 0) hints.push('The minus sign in front isn’t part of the base: work out the power, then take the opposite.');
    var p = P.math(o.ask ? o.ask(expr) : t(expr), check, keyTex, evalSol(o, rt, core, val), hints, o.text || 'evaluate ' + expr.replace(/\\left|\\right/g, ''), { keys: o.dec ? 'decimal' : 'fraction' });
    p.answer = t(numTex(val, o.dec));
    p.expr = expr;
    p.good = [val[1] === 1 ? String(val[0]) : val[0] + '/' + val[1]];
    if (o.dec) p.good.push(K.decTex(val));
    p.bad = cands.map(function (c) { return String(c.v); });
    return p;
  }
  function evalSol(o, rt, core, val) {
    var n = o.n, k = Math.abs(o.m), dec = o.dec;
    var B = o.sbtex || o.btex || baseTex(o.base, dec), E = expTex(o.m, n);
    var inner = numTex(o.base, dec), rad = rootTex(n, inner);
    var radk = k === 1 ? rad : '\\left(' + rad + '\\right)^{' + k + '}';
    var Rk = k === 1 ? numTex(rt, dec) : baseTex(rt, dec) + '^{' + k + '}';
    var PK = numTex(ratPow(rt, k), dec);
    var chain = [B + '^{' + E + '}'];
    if (o.m > 0) chain.push(radk, Rk, PK);
    else chain.push('\\frac{1}{' + radk + '}', '\\frac{1}{' + Rk + '}', '\\frac{1}{' + PK + '}', numTex(core, dec));
    chain = dedupe(chain);
    var lines = [];
    if (o.pre) lines.push(o.pre);
    lines.push('The denominator ' + t(n) + ' is the index: take the ' + rootName(n) + ' root' + (k > 1 ? ', then raise it to the power ' + t(k) : '') + (o.m < 0 ? '. The negative exponent means reciprocal.' : '.')
      + (o.base[0] < 0 ? ' The index ' + t(n) + ' is odd, so the root of the negative base exists' + (k > 1 ? (k % 2 ? ' (and an odd power keeps it negative)' : ' (and the even power makes it positive)') : '') + '.' : ''));
    lines.push(t(chain.join('=')));
    if (o.outer < 0) lines.push('The minus sign in front is applied last: ' + t('-\\left(' + numTex(core, dec) + '\\right)=' + numTex(val, dec)) + '.');
    return lines.join('<br>');
  }
  function evalCands(o, rt, T) {
    var b = rv(o.base), m = o.m, n = o.n, k = Math.abs(m), s = o.outer || 1, out = [];
    var B = o.sbtex || o.btex || baseTex(o.base, o.dec), inner = numTex(o.base, o.dec);
    function add(v, code, hint) { if (isFinite(v) && !near(v, T) && !out.some(function (c) { return near(c.v, v); })) out.push({ v: v, code: code, hint: hint }); }
    if (s < 0) add(-T, 'sign', 'Check the minus sign in front: it isn’t part of the base. Work out the power first, then take the opposite.');
    if (m < 0) add(-s * rpow(b, k, n), 'neg-exp-sign', 'A negative exponent means <b>reciprocal</b>, not a negative answer: ' + t('a^{-k}=\\frac{1}{a^{k}}') + '.');
    if (m < 0) add(s * rpow(b, k, n), 'no-recip', 'You found ' + t(B + '^{' + expTex(k, n) + '}') + '. The exponent is negative, so take the <b>reciprocal</b>' + (o.base[1] !== 1 ? ' (flip the fraction)' : '') + '.');
    if (b < 0 && s > 0) add(-T, 'sign', k % 2 === 0 ? 'The ' + rootName(n) + ' root of a negative number is negative, but the even power ' + t(k) + ' makes the result positive.' : 'The ' + rootName(n) + ' root of ' + t(inner) + ' is negative, and an odd power keeps it negative.');
    if (k > 1) add(s * rpow(b, sgn(m) * n, k), 'swap', 'It looks like the root and the power are swapped. The <b>denominator</b> ' + t(n) + ' is the index of the root; the <b>numerator</b> ' + t(k) + ' is the power.');
    if (k > 1) add(s * rpow(b, sgn(m), n), 'root-only', 'You took the ' + rootName(n) + ' root. Now raise it to the power ' + t(k) + ' — that’s what the numerator says.');
    add(s * Math.pow(b, m), 'no-root', 'Don’t forget the root: the denominator ' + t(n) + ' means take the ' + rootName(n) + ' root.');
    if (n !== 2) add(s * rpow(b, m, 2), 'square-root', 'The denominator is ' + t(n) + ', so this is a <b>' + rootName(n) + '</b> root, not a square root.');
    add(s * b * m / n, 'times-exp', 'The exponent isn’t a multiplier: ' + t(B + '^{' + expTex(m, n) + '}') + ' doesn’t mean ' + t(B + '\\times ' + (m < 0 ? '\\left(' + expTex(m, n) + '\\right)' : expTex(m, n))) + '. Denominator = index of the root, numerator = power.');
    if (o.dec) { var w = rv(rt) / 10; add(s * Math.pow(w, m), 'dec-root', 'Check your ' + rootName(n) + ' root of ' + t(inner) + ': raise it to the power ' + t(n) + ' and see whether you get ' + t(inner) + ' back. Count the decimal places.'); }
    return out;
  }

  /* ---------- calculator value of b^(m/n), rounded ---------- */
  function AP(o) {
    o.outer = o.outer || 1;
    var b = o.b, m = o.m, n = o.n, s = o.outer, x = s * rpow(b, m, n), k = Math.abs(m);
    var bt = b < 0 || b % 1 ? '\\left(' + b + '\\right)' : String(b), et = expTex(m, n), expr = o.prompt || ((s < 0 ? '-' : '') + bt + '^{' + et + '}');
    var key = '(' + (b < 0 ? '(−)' + (-b) : b) + ')^(' + (m < 0 ? '(−)' + k : k) + '/' + n + ')';
    var cands = [];
    function add(v, code, hint) { if (isFinite(v) && K.roundTo(v, 2) !== K.roundTo(x, 2) && !cands.some(function (c) { return K.roundTo(c.v, 2) === K.roundTo(v, 2); })) cands.push({ v: v, code: code, hint: hint }); }
    if (s < 0) add(-x, 'sign', 'Check the minus sign in front: it isn’t part of the base, so it changes the sign of the final answer.');
    if (b < 0) add(-s * Math.pow(-b, m / n), 'neg-brackets', 'Put the negative base in brackets and use the ' + t('(-)') + ' key: <code>' + key + '</code>. Without brackets the calculator works out ' + t('-\\left(' + (-b) + '^{' + et + '}\\right)') + '.');
    add(s * Math.pow(b, m) / n, 'no-brackets', 'Put the exponent in brackets: <code>' + key + '</code>. Without them the calculator works out ' + t(bt + '^{' + m + '}\\div ' + n) + '.');
    if (m < 0) add(s * rpow(b, k, n), 'no-recip', 'The exponent is negative — keep the minus sign in the exponent (the answer should be the reciprocal of ' + t(bt + '^{' + expTex(k, n) + '}') + ').');
    if (k > 1) add(s * rpow(b, sgn(m) * n, k), 'swap', 'Check the exponent: it is ' + t(et) + ' — the denominator ' + t(n) + ' is the root, the numerator ' + t(k) + ' the power.');
    add(s * b * m / n, 'times-exp', 'The exponent isn’t a multiplier. Use the ' + t('\\wedge') + ' key: <code>' + key + '</code>.');
    var sol = 'Type <code>' + (s < 0 ? '(−)' : '') + key + '</code>' + (b < 0 ? ' (negative base in brackets, with the ' + t('(-)') + ' key)' : '') + '.<br>' + t(expr + '\\approx ' + decStr(x))
      + (b < 0 ? '<br>The index ' + t(n) + ' is odd, so the root exists' + (k % 2 ? ' and an odd power keeps it negative.' : ', and the even numerator ' + t(k) + ' makes the power positive.') : '')
      + (s < 0 ? (b < 0 ? ' Then' : '<br>') + ' the minus sign in front makes the answer negative.' : '');
    var p = P.approx(t(expr), x, 2, { diag: function (v) { for (var i = 0; i < cands.length; i++) if (Math.abs(v - K.roundTo(cands[i].v, 2)) < 1e-9 || Math.abs(v - cands[i].v) < 0.006) return { code: cands[i].code, hint: cands[i].hint }; return null; } }, sol,
      ['Put the whole exponent in brackets: <code>' + key + '</code>.', 'Round to the nearest hundredth at the very end.'], 'calculator ' + expr.replace(/\\left|\\right/g, ''));
    p.bad = cands.map(function (c) { return decStr(c.v); });
    return p;
  }
  function roundSafe(x, dp) { var f = x * Math.pow(10, dp), fr = f - Math.floor(f); return Math.abs(fr - 0.5) > 0.01 && fr > 0.005 && fr < 0.995; }
  function apOk(o) { return roundSafe((o.outer || 1) * rpow(o.b, o.m, o.n), 2); }

  /* ---------- reading the structure of a typed answer ---------- */
  function strip(x) { while (x && x.t === 'paren') x = x.a; return x; }
  function kids(x) { return ['a', 'b', 'n'].filter(function (k) { return x[k] && typeof x[k] === 'object'; }).map(function (k) { return x[k]; }); }
  function varsOf(ast) { var acc = {}; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; kids(x).forEach(w); })(ast); return Object.keys(acc); }
  function hasDiv(x) { if (!x || typeof x !== 'object') return false; if (x.t === 'div' || (x.t === 'num' && x.dec)) return true; return kids(x).some(hasDiv); }
  function hasNum(x) { x = strip(x); if (!x) return false; if (x.t === 'num') return true; if (x.t === 'mul' || x.t === 'neg') return kids(x).some(hasNum); return false; }
  function shapeOf(ast) {
    var f = { roots: 0, ratExp: false, negExp: false, powOfRoot: false, unexpanded: false, idx: [] };
    (function w(x, inRoot) {
      if (!x || typeof x !== 'object') return;
      if (x.t === 'root') { f.roots++; var ir = ex.rat(x.n); f.idx.push(ir && ir[1] === 1 ? ir[0] : null); }
      if (x.t === 'pow') {
        if (hasDiv(x.b)) f.ratExp = true;
        var e = strip(x.b), er = ex.rat(x.b);
        if (e.t === 'neg' || (er && er[0] < 0)) f.negExp = true;
        var bs = strip(x.a);
        if (bs.t === 'root') f.powOfRoot = true;
        if (inRoot && (bs.t === 'num' || (bs.t === 'mul' && hasNum(bs)))) f.unexpanded = true;
      }
      kids(x).forEach(function (c) { w(c, inRoot || x.t === 'root'); });
    })(ast, false);
    return f;
  }
  function sampleEnv(vars, i, neg) {
    var env = {}; vars.forEach(function (v, j) { var s = 0.37 + 1.13 * ((i * 7 + j * 3) % 11) / 5 + j * 0.21; env[v] = neg && neg.indexOf(v) >= 0 ? -s : s; }); return env;
  }
  function equivAt(a, b, vars, neg) {
    for (var i = 0; i < 5; i++) { var env = sampleEnv(vars, i, neg); if (!near(ex.value(a, env), ex.value(b, env))) return false; }
    return true;
  }
  function nanAt(a, vars, neg) { for (var i = 0; i < 3; i++) if (isFinite(ex.value(a, sampleEnv(vars, i, neg)))) return false; return true; }

  /* ---------- converting: an answer equal to target, in radical form or as a power ----------
   * opt: form 'radical' | 'power'; entire (one root, power inside); rootFirst ((ⁿ√a)^m); expand (number powers worked out
   * under the root); index (required index); single (one base, one exponent: give a TeX example); needRat (a rational
   * exponent must appear); neg (letters that are negative); cands [[tex, code, hint]]; nanHint */
  function convCheck(target, opt) {
    opt = opt || {};
    var tp = ex.parse(target); if (!tp.ok) throw new Error('bad target ' + target);
    var tv = varsOf(tp.ast), cands = (opt.cands || []).map(function (c) { var q = ex.parse(c[0]); if (!q.ok) throw new Error('bad cand ' + c[0]); return { ast: q.ast, code: c[1], hint: c[2] }; });
    var T = tv.length ? null : ex.value(tp.ast);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sv = varsOf(a.ast), extra = sv.filter(function (v) { return tv.indexOf(v) < 0; });
      if (extra.length) return wrong('var', 'Your answer has a letter ' + t(extra[0]) + ' that isn’t in the question.');
      var f = shapeOf(a.ast);
      if (equivAt(a.ast, tp.ast, tv, opt.neg)) {
        if (opt.form === 'radical') {
          if (f.ratExp) return form('not-radical', 'Right value — now write it in <b>radical form</b> (use the root key; no fractional exponents).');
          if (!f.roots) return form('not-radical', 'Right value — but write it with a radical sign, as the question asks.');
          if (opt.index && f.idx.some(function (i) { return i !== opt.index; })) return form('index', 'Right value, but use a ' + rootName(opt.index) + ' root (index ' + t(opt.index) + '), as the exponent says.');
          if (f.negExp) return form('neg-exp', 'Right value — now write it without a negative exponent: a negative exponent puts the radical in the <b>denominator</b>.');
          if (opt.entire && f.powOfRoot) return form('entire', 'Right value — now write it as an <b>entire radical</b>, with the power inside the root: ' + t('\\left(\\sqrt[n]{a}\\right)^{m}=\\sqrt[n]{a^{m}}') + '.');
          if (opt.rootFirst && !f.powOfRoot) return form('root-first', 'Right value — the question asks for the root taken <b>first</b>: write it as ' + t('\\left(\\sqrt[n]{a}\\right)^{m}') + '.');
          if (opt.expand && f.unexpanded) return form('evaluate', 'Right value — now work out the number power under the root, e.g. ' + t('(2a)^{5}=32a^{5}') + '.');
          return ok();
        }
        if (opt.form === 'power') {
          if (f.roots) return form('not-power', 'Right value — now write it as a <b>power</b> with a rational exponent (no radical sign).');
          if (opt.single && strip(a.ast).t !== 'pow') return form('single-power', 'Right value — now write it as a <b>single power</b> ' + t(opt.single) + ' (one base, one exponent).');
          if (opt.needRat && !f.ratExp) return form('not-power', 'Right value — but write it with a <b>rational exponent</b>, as the question asks.');
          return ok();
        }
        return ok();
      }
      for (var i = 0; i < cands.length; i++) if (equivAt(a.ast, cands[i].ast, tv, opt.neg)) return wrong(cands[i].code, cands[i].hint);
      if (tv.length && nanAt(a.ast, tv, opt.neg)) return wrong('undefined', opt.nanHint || 'Your expression has no real value here (an even root of a negative number). Check where the minus sign goes.');
      if (T != null && isFinite(a.val) && !f.roots && !f.ratExp && Math.abs(a.val - T) < 0.01 * Math.abs(T)) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> form the question asks for.');
      return wrong('value', null);
    };
  }
  function convPart(promptHtml, target, opt, sol, hints, text, extraVars) {
    var vs = varsOf(ex.parse(target).ast).concat(extraVars || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort();
    var p = P.math(promptHtml, convCheck(target, opt), target, sol, hints, text, { keys: 'expo', vars: vs.length ? vs : ['x'], before: opt.before });
    p.bad = (opt.cands || []).map(function (c) { return c[0]; });
    return p;
  }
  /* x^(m/n) as radicals: style 'entire' ⁿ√(x^m) or 'rootFirst' (ⁿ√x)^m; coefficient c outside */
  function radOf(v, m, n, style, c) {
    var k = Math.abs(m), entire = rootTex(n, k === 1 ? v : v + '^{' + k + '}'), rf = k === 1 ? rootTex(n, v) : '\\left(' + rootTex(n, v) + '\\right)^{' + k + '}';
    var r = style === 'rootFirst' ? rf : entire, cc = c && c !== 1 ? String(c) : '';
    return m < 0 ? '\\frac{' + (cc || '1') + '}{' + r + '}' : cc + r;
  }
  function radCands(v, m, n, style, c) { // the classic slips for x^(m/n) -> radical
    var k = Math.abs(m), s = sgn(m), out = [];
    if (k > 1) out.push([radOf(v, s * n, k, style, c), 'swap', 'The <b>denominator</b> ' + t(n) + ' is the index of the root and the <b>numerator</b> ' + t(k) + ' is the power — you have them the other way round.']);
    if (m < 0) out.push(['-' + radOf(v, k, n, style, c), 'neg-exp-sign', 'A negative exponent doesn’t make the expression negative — it means <b>reciprocal</b>: the radical goes in the denominator.']);
    if (m < 0) out.push([radOf(v, k, n, style, c), 'no-recip', 'The exponent is negative, so the radical belongs in the <b>denominator</b>: ' + t('x^{-a}=\\frac{1}{x^{a}}') + '.']);
    if (k > 1) out.push([radOf(v, s, n, style, c), 'root-only', 'You have the root, but the numerator ' + t(k) + ' is a power that still has to appear.']);
    out.push([(c && c !== 1 ? c : '') + v + '^{' + m + '}', 'no-root', 'The denominator ' + t(n) + ' means a ' + rootName(n) + ' root — your answer has no root.']);
    if (n !== 2) out.push([radOf(v, m, 2, style, c), 'square-root', 'The denominator is ' + t(n) + ', so use a <b>' + rootName(n) + '</b> root (index ' + t(n) + '), not a square root.']);
    return out;
  }
  function radSol(promptTex, v, m, n, ans) {
    var k = Math.abs(m);
    return 'Denominator ' + t(n) + ' → index of the root; numerator ' + t(k) + ' → the power' + (m < 0 ? '; the negative sign → reciprocal (the radical goes in the denominator)' : '') + '.<br>' + t(promptTex + '=' + ans);
  }
  var convHints = ['The denominator of the exponent is the index of the root; the numerator is the power: ' + t('x^{m/n}=\\sqrt[n]{x^{m}}=\\left(\\sqrt[n]{x}\\right)^{m}') + '.',
    'A negative exponent puts the power in the denominator: ' + t('x^{-m/n}=\\frac{1}{\\sqrt[n]{x^{m}}}') + '.'];
  /* radical -> power z^(m/n) */
  function toPowPart(v, m, n, radTexStr, sol, text, more) {
    var tgt = v + '^{' + expTex(m, n) + '}', k = Math.abs(m), s = sgn(m), cands = (more || []).slice();
    if (k > 1 || n > 1) cands.push([v + '^{' + expTex(s * n, k) + '}', 'swap', 'The <b>index</b> of the root becomes the <b>denominator</b> of the exponent, and the power inside becomes the numerator.']);
    cands.push([v + '^{' + expTex(-m, n) + '}', m < 0 ? 'no-recip' : 'flip-exp', m < 0 ? 'The radical is in the <b>denominator</b>, so the exponent is <b>negative</b>.' : 'Check the sign of the exponent: the radical is in the numerator, so the exponent is positive.']);
    if (n !== 1) cands.push([v + '^{' + m * n + '}', 'times-exp', 'A root divides the exponent: the index ' + t(n) + ' goes in the <b>denominator</b>, ' + t(v + '^{' + expTex(m, n) + '}') + '.']);
    var p = convPart(t(radTexStr), tgt, { form: 'power', single: v + '^{n}', cands: cands }, sol || 'Index ' + t(n) + ' → denominator; power ' + t(k) + ' → numerator' + (m < 0 ? '; in the denominator → negative exponent' : '') + '.<br>' + t(radTexStr + '=' + tgt), convHints, text || 'radical to power ' + radTexStr);
    p.good = [v + '^(' + (m < 0 ? '-' : '') + k + '/' + n + ')'];
    return p;
  }

  /* ---------- write a number as a power with a given exponent ---------- */
  function asPowerPart(V, e, B, sol, hints, text, words) { // V (rational [p,q]) = B^(e) ; e = [p,q]
    var eTex = e[1] === 1 ? String(e[0]) : (e[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(e[0]) + '}{' + e[1] + '}', Vv = rv(V), Bt = baseTex(B), keyTex = Bt + '^{' + expTex(e[0], e[1]) + '}';
    var check = function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (varsOf(a.ast).length) return wrong('var', 'Use numbers only.');
      var top = strip(a.ast), veq = near(a.val, Vv);
      if (top.t === 'neg' && strip(top.a).t === 'pow' && veq) return form('brackets', 'Right value, but a minus sign in front isn’t part of the base: ' + t('-a^{n}') + ' means ' + t('-\\left(a^{n}\\right)') + '. Put the negative base in brackets: ' + t('\\left(-a\\right)^{' + eTex + '}') + '.');
      if (top.t !== 'pow') { if (veq) return form('single-power', 'Right value — now write it as a <b>power</b> with exponent ' + t(eTex) + ', like ' + t('b^{' + eTex + '}') + '.'); return wrong('value', 'Write it as one power: a base with the exponent ' + t(eTex) + '.'); }
      var er = ex.rat(top.b);
      if (!er || er[0] * e[1] !== e[0] * er[1]) { if (veq) return form('exponent', 'Right value, but use the exponent the question gives: ' + t(eTex) + '.'); return wrong('exponent', 'Use the exponent the question gives: ' + t(eTex) + '.'); }
      if (veq) return ok();
      var bv = ex.value(top.a);
      if (near(bv, Vv)) return wrong('same-base', t(baseTex(V) + '^{' + eTex + '}') + ' isn’t ' + t(ratTex(V)) + '. Which base, raised to the exponent ' + t(eTex) + ', <i>gives</i> ' + t(ratTex(V)) + '? Undo the exponent: raise ' + t(ratTex(V)) + ' to the reciprocal power.');
      if (near(a.val, 1 / Vv)) return wrong('flip', 'Your power equals ' + t(ratTex(ex.norm(V[1], V[0]))) + ', the reciprocal. With a negative exponent the base must be the <b>reciprocal</b> of what you’d use for a positive one.');
      if (near(a.val, -Vv)) return wrong('sign', 'Your power equals ' + t(ratTex([-V[0], V[1]])) + '. Check the sign of the base.');
      if (!isFinite(a.val)) return wrong('undefined', 'Your power has no real value — an even root of a negative number.');
      return wrong('value', 'Check: your power works out to about ' + t(numOr(a.val)) + ', not ' + t(ratTex(V)) + '.');
    };
    var p = P.math(words || ('Write ' + t(ratTex(V)) + ' as a power with an exponent of ' + t(eTex) + '.'), check, keyTex, sol, hints, text, { keys: 'expo', vars: [] });
    p.input.vars = ['x']; p.input.keys = 'expo';
    p.bad = [ratTex(V) + '^{' + expTex(e[0], e[1]) + '}', ex.texRat(ex.norm(V[1], V[0]))];
    return p;
  }

  /* ---------- an expression that uses V with a rational exponent and equals target ---------- */
  function usesPowOf(ast, V) {
    var found = false;
    (function w(x) { if (!x || typeof x !== 'object' || found) return; if (x.t === 'pow' && hasDiv(x.b) && near(ex.value(strip(x.a)), V)) found = true; kids(x).forEach(w); })(ast);
    return found;
  }
  function powOfCheck(V, target, cands, later) {
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (varsOf(a.ast).length) return wrong('var', 'Use numbers only.');
      if (near(a.val, target)) {
        if (!usesPowOf(a.ast, V)) return form('not-power', 'Right value — but the question asks for an expression using a <b>power of ' + t(F(V)) + '</b> with a rational exponent' + (later ? ' (you calculate it in part (c))' : '') + '.');
        return ok();
      }
      for (var i = 0; i < cands.length; i++) if (near(a.val, cands[i].v)) return wrong(cands[i].code, cands[i].hint);
      return wrong('value', null);
    };
  }

  /* ---------- one box: a value, or "none" ---------- */
  function noneOr(spec) { // spec: { defined, check (when defined), noneWhy (said none but defined), valWhy (gave a value but undefined) }
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      var isNone = /^(none|no|nomeaning|no meaning|undefined|dne|no real value|\\text\{none\})$/i.test(s.replace(/\s+/g, ' ')) || /^\\text\{\s*none\s*\}$/.test(s);
      if (!s) return form('empty', 'Type your answer first, or press <b>none</b>.');
      if (spec.defined) { if (isNone) return wrong('said-none', spec.noneWhy); return spec.check(s); }
      if (isNone) return ok();
      return wrong('missed-none', spec.valWhy);
    };
  }
  function meaningPart(o) { // o: an EV spec, or { undef: true, expr, why, valWhy } for a power with no real value
    if (o.undef) {
      var p0 = P.fields(t(o.expr), [{ name: 'Value', before: t('='), mode: 'math', keys: 'fraction', none: true }], [noneOr({ defined: false, valWhy: o.valWhy })], ['none'], '<b>no meaning</b> (no real value)', o.why,
        ['Look at the index (the denominator). Can you take an even root of a negative number?'], 'no meaning? ' + o.expr);
      p0.bad = [['4'], ['-4'], ['0']];
      return p0;
    }
    var e = EV(o);
    var p = P.fields(e.prompt, [{ name: 'Value', before: t('='), mode: 'math', keys: 'fraction', none: true }], [noneOr({ defined: true, check: e.check, noneWhy: o.noneWhy })], [e.key], e.answer, e.solution, e.hints, e.text);
    p.bad = [['none']].concat(e.bad.slice(0, 3).map(function (b) { return [b]; }));
    p.good = e.good.map(function (g) { return [g]; });
    return p;
  }

  /* ---------- multiple choice ---------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return P.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------- generators ---------- */
  function coprimePairs(lo, hi) { var out = []; for (var a = lo; a <= hi; a++) for (var b = lo; b <= hi; b++) if (a !== b && ex.gcd(a, b) === 1) out.push([a, b]); return out; }
  function pickWhere(r, gen, okf, tries) { for (var i = 0; i < (tries || 300); i++) { var v = gen(); if (okf(v)) return v; } return null; }
  function coprimeMN(r, mList, nList) { return pickWhere(r, function () { return [r.pick(mList), r.pick(nList)]; }, function (v) { return ex.gcd(v[0], v[1]) === 1 && v[0] !== v[1]; }); }

  /* ---------- power -> radical part makers ---------- */
  function genRad(v, m, n, style, opt) { // v^(m/n) -> radical; style: how the answer is displayed ('entire' or 'rootFirst')
    opt = opt || {};
    var pr = v + '^{' + expTex(m, n) + '}', tgt = radOf(v, m, n, style);
    return convPart(t(pr), tgt, { form: 'radical', index: n, entire: opt.entire, rootFirst: opt.rootFirst, cands: radCands(v, m, n, style) }, radSol(pr, v, m, n, tgt), convHints, 'power to radical ' + pr);
  }
  function coefRad(v, c, m, n, opt) { // c·v^(m/n): the coefficient stays outside
    opt = opt || {};
    var pr = c + v + '^{' + expTex(m, n) + '}', tgt = radOf(v, m, n, 'entire', c), k = Math.abs(m);
    var inside = 'The exponent belongs to ' + t(v) + ' only — the ' + t(c) + ' isn’t under the power, so it stays <b>outside</b> the radical.';
    var cands = [[rootTex(n, c + v + (k === 1 ? '' : '^{' + k + '}')), 'coef-inside', inside], [rootTex(n, Math.pow(c, k) + v + (k === 1 ? '' : '^{' + k + '}')), 'coef-inside', inside]];
    if (m < 0) cands.unshift(['\\frac{1}{' + c + radOf(v, k, n, 'entire') + '}', 'coef-flipped', 'Only ' + t(v) + ' has the negative exponent, so only its radical moves to the denominator. The ' + t(c) + ' stays on top: ' + t(tgt) + '.']);
    return convPart(t(pr), tgt, { form: 'radical', index: n, entire: opt.entire, cands: cands.concat(radCands(v, m, n, 'entire', c)) },
      'The exponent applies to ' + t(v) + ' only; the coefficient ' + t(c) + ' stays where it is' + (m < 0 ? ' (on top)' : '') + '.<br>' + t(pr + '=' + tgt), convHints.concat(['Ask: what is the base of the power? Here it is just ' + t(v) + '.']), 'power to radical ' + pr);
  }
  function bracketRad(v, c, m, n, opt) { // (c·v)^(m/n): the coefficient goes under the root and is raised to the power
    opt = opt || {};
    var k = Math.abs(m), ck = Math.pow(c, k), pr = '\\left(' + c + v + '\\right)^{' + expTex(m, n) + '}';
    var inner = F(ck) + v + (k === 1 ? '' : '^{' + k + '}'), body = opt.rootFirst ? (k === 1 ? rootTex(n, c + v) : '\\left(' + rootTex(n, c + v) + '\\right)^{' + k + '}') : rootTex(n, inner);
    var tgt = m < 0 ? '\\frac{1}{' + body + '}' : body;
    function wrapM(s) { return m < 0 ? '\\frac{1}{' + s + '}' : s; }
    var cands = [[wrapM(c + radOf(v, k, n, 'entire')), 'coef-outside', 'Here the base is ' + t('(' + c + v + ')') + ': the ' + t(c) + ' is inside the brackets, so it goes under the root ' + (k > 1 ? 'and is raised to the power ' + t(k) + ' too.' : 'too.')]];
    if (k > 1) cands.push([wrapM(rootTex(n, c + v + '^{' + k + '}')), 'coef-not-powered', 'The power ' + t(k) + ' applies to the ' + t(c) + ' as well: ' + t('(' + c + v + ')^{' + k + '}=' + F(ck) + v + '^{' + k + '}') + '.']);
    if (k > 1 && c * k !== ck) cands.push([wrapM(rootTex(n, c * k + v + '^{' + k + '}')), 'coef-times', t(c + '^{' + k + '}') + ' means ' + t(c) + ' multiplied by itself ' + k + ' times — not ' + t(c + '\\times ' + k) + '.']);
    if (m < 0) cands.push([body, 'no-recip', 'The exponent is negative, so the radical goes in the <b>denominator</b>.'], ['-' + body, 'neg-exp-sign', 'A negative exponent means reciprocal, not a negative value.']);
    if (k > 1) cands.push([wrapM(rootTex(k, Math.pow(c, n) + v + '^{' + n + '}')), 'swap', 'The <b>denominator</b> ' + t(n) + ' is the index of the root; the <b>numerator</b> ' + t(k) + ' is the power.']);
    var sol = opt.rootFirst ? 'The base is the whole bracket ' + t('(' + c + v + ')') + ', so the ' + t(c) + ' goes under the root with ' + t(v) + '. Take the ' + rootName(n) + ' root first, then the power ' + t(k) + (m < 0 ? '; the negative exponent puts it in the denominator' : '') + '.<br>' + t(pr + '=' + tgt)
      : 'The base is the whole bracket ' + t('(' + c + v + ')') + ', so the ' + t(c) + ' goes under the root too' + (k > 1 ? ' and is raised to the power ' + t(k) + ': ' + t('(' + c + v + ')^{' + k + '}=' + F(ck) + v + '^{' + k + '}') : '') + '.<br>' + t(pr + '=' + (k > 1 ? wrapM(rootTex(n, '(' + c + v + ')^{' + k + '}')) + '=' : '') + tgt);
    return convPart(t(pr), tgt, { form: 'radical', index: n, expand: !opt.rootFirst, rootFirst: opt.rootFirst, entire: opt.entire, cands: cands }, sol,
      convHints.concat(['Everything inside the brackets is the base — the number too.']), 'power to radical ' + pr);
  }

  /* ---------- Question 9 / Extra 14: negative bases with a letter ---------- */
  function q9(r) {
    var used = {};
    function mn(nList, mList) { var v = pickWhere(r, function () { return [r.pick(mList), r.pick(nList)]; }, function (x) { return ex.gcd(x[0], x[1]) === 1 && x[0] !== x[1] && !used[x.join('/')]; }); used[v.join('/')] = 1; return v; }
    var a = mn([3, 5, 7], [1, 2, 4, 5, 7]), b = mn([4, 6, 8], [1, 3, 5, 7]), c = mn([3, 5, 7], [1, 2, 3, 4]), d = mn([2, 4, 6], [1, 3, 5, 7]);
    var items = r.shuffle([
      { tex: '(-x)^{' + a[0] + '/' + a[1] + '}', n: a[1], def: true, minus: false },
      { tex: '(-x)^{' + b[0] + '/' + b[1] + '}', n: b[1], def: false, minus: false },
      { tex: '-(-x)^{' + c[0] + '/' + c[1] + '}', n: c[1], def: true, minus: true },
      { tex: '-(-x)^{' + d[0] + '/' + d[1] + '}', n: d[1], def: false, minus: true }]);
    var L = ['a', 'b', 'c', 'd'];
    items.forEach(function (it, i) { it.id = L[i]; });
    var want = items.filter(function (it) { return !it.def; }).map(function (it) { return it.id; });
    var byId = {}; items.forEach(function (it) { byId[it.id] = it; });
    return { prompt: 'Select the two that have no meaning.', input: { type: 'select', options: items.map(function (it) { return { value: it.id, html: '(' + it.id + ')&nbsp;' + t(it.tex) }; }) },
      check: K.selectSet(want, function (extra, missing) {
        if (extra.length) { var e = byId[extra[0]]; return { code: 'picked-defined', hint: '(' + e.id + ') has index ' + t(e.n) + ', which is <b>odd</b>. An odd root of a negative number exists, so ' + t(e.tex) + ' has meaning' + (e.minus ? ' (the minus sign in front just changes its sign)' : '') + '.' }; }
        return { code: 'missed', hint: 'There are two. Look at the <b>denominator</b> of each exponent: an even index on the negative base ' + t('-x') + ' has no real value.' };
      }),
      key: want, answer: want.map(function (id) { return '(' + id + ') ' + t(byId[id].tex); }).join(' and '),
      solution: 'Since ' + t('x>0') + ', the base ' + t('-x') + ' is negative. The <b>denominator</b> is the index of the root:<br>' + items.map(function (it) { return '(' + it.id + ') ' + t(it.tex) + ': index ' + t(it.n) + ' is ' + (it.def ? 'odd → <b>has meaning</b>' : 'even → <b>no meaning</b>'); }).join('<br>'),
      hints: ['The denominator of the exponent is the index of the root. Can you take an even root of a negative number?'], text: 'which have no meaning: ' + items.map(function (it) { return it.tex; }).join(', ') };
  }
  function e14(r) {
    var rows = [];
    var n1 = r.pick([[3, 8], [1, 4], [5, 6], [3, 2], [5, 4]]); rows.push({ tex: '(-x)^{' + n1[0] + '/' + n1[1] + '}', want: 'none', why: 'The index ' + t(n1[1]) + ' is even and the base ' + t('-x') + ' is negative: no meaning.' });
    var n2 = r.pick([[8, 3], [2, 5], [4, 3], [6, 7], [5, 3], [7, 5]]), pos = n2[0] % 2 === 0;
    rows.push({ tex: '(-x)^{' + n2[0] + '/' + n2[1] + '}', want: pos ? 'pos' : 'neg', why: 'The index ' + t(n2[1]) + ' is odd, so the root of ' + t('-x') + ' exists and is negative; the ' + (pos ? 'even' : 'odd') + ' power ' + t(n2[0]) + ' makes it ' + (pos ? '<b>positive</b>.' : 'stay <b>negative</b>.') });
    var n3 = r.pick([4, 2, 6]); rows.push({ tex: '-(-x)^{1/' + n3 + '}', want: 'none', why: t('(-x)^{1/' + n3 + '}') + ' is an even root of a negative number, so it has no meaning — the minus sign in front can’t fix that.' });
    var n4 = r.pick([2, 3, 4, 5]); rows.push({ tex: '-x^{1/' + n4 + '}', want: 'neg', why: 'The exponent belongs to ' + t('x') + ' only: ' + t('-x^{1/' + n4 + '}=-' + rootTex(n4, 'x')) + ', which has meaning and is <b>negative</b>.' });
    var r5 = r.pick([['(-x^{2})^{1/2}', 'none', t('-x^{2}') + ' is negative and the index ' + t('2') + ' is even: no meaning.'], ['(-x^{2})^{1/4}', 'none', t('-x^{2}') + ' is negative and the index ' + t('4') + ' is even: no meaning.'],
      ['(-x^{3})^{1/3}', 'neg', t('-x^{3}') + ' is negative and the index ' + t('3') + ' is odd: ' + t('(-x^{3})^{1/3}=-x') + ', <b>negative</b>.'], ['(-x^{2})^{1/3}', 'neg', t('-x^{2}') + ' is negative and the index ' + t('3') + ' is odd, so the cube root exists and is <b>negative</b>.']]);
    rows.push({ tex: r5[0], want: r5[1], why: r5[2] });
    var L = ['a', 'b', 'c', 'd', 'e'], want = {}, cols = [{ id: 'none', html: 'No meaning' }, { id: 'pos', html: 'Positive' }, { id: 'neg', html: 'Negative' }];
    rows.forEach(function (x, i) { x.id = L[i]; want[x.id] = x.want; });
    var byId = {}; rows.forEach(function (x) { byId[x.id] = x; });
    return P.grid('For each expression, choose <b>no meaning</b>, or say whether its value is positive or negative.', rows.map(function (x) { return { id: x.id, html: '(' + x.id + ') ' + t(x.tex) }; }), cols, want,
      { why: function (id) { var x = byId[id]; return { code: 'row', hint: 'Check (' + id + ') ' + t(x.tex) + ': ' + (x.want === 'none' ? 'what is the index, and is the number under that root negative?' : 'it does have meaning. Work out the sign step by step — the root of the base, then the power, then any minus sign in front.') }; } },
      rows.map(function (x) { return '(' + x.id + ') ' + t(x.tex) + ': ' + x.why; }).join('<br>'),
      ['First look at the index (denominator): an even root of a negative number has no meaning.', 'If it has meaning, decide the sign: a minus sign outside, or an odd power of a negative, makes it negative.'], 'meaning/sign of powers of −x');
  }

  /* ---------- solving x^(a/b) = v (Extra 22) ---------- */
  function solvePart(a, b, c) { // x^(a/b) = c^a, so x = c^b (a may be -1)
    var x = Math.pow(c, b), v = ratPow([c, 1], a), vt = ratTex(v), e1 = expTex(a, b), rec = expTex(b, a);
    var cands = [
      { v: rpow(rv(v), a, b), code: 'same-power', hint: 'Raising both sides to ' + t(e1) + ' again doesn’t undo it. Raise both sides to the <b>reciprocal</b> exponent ' + t(rec) + '.' },
      { v: rpow(rv(v), 1, Math.abs(a)), code: 'root-only', hint: 'That undoes only part of the exponent. Raise both sides to ' + t(rec) + ': ' + t('\\left(x^{' + e1 + '}\\right)^{' + rec + '}=x^{1}') + '.' },
      { v: 1 / x, code: 'flip', hint: 'Check by substituting your answer: does it give ' + t(vt) + '? Watch the sign of the exponent.' },
      { v: rv(v) * b / a, code: 'times-exp', hint: 'The exponent isn’t a multiplier: undo it with the reciprocal power ' + t(rec) + ', not by dividing.' }].filter(function (q) { return isFinite(q.v) && !near(q.v, x); });
    var step = a > 0 ? '\\left(' + rootTex(a, vt) + '\\right)^{' + b + '}=' + c + '^{' + b + '}=' + F(x) : '\\left(' + vt + '\\right)^{-' + b + '}=' + c + '^{' + b + '}=' + F(x);
    var chk = a > 0 ? '\\left(' + rootTex(b, F(x)) + '\\right)^{' + a + '}=' + c + '^{' + a + '}=' + vt : '\\frac{1}{' + rootTex(b, F(x)) + '}=' + vt;
    var p = P.math(t('x^{' + e1 + '}=' + vt), K.fraction([x, 1], { diag: function (val) { for (var i = 0; i < cands.length; i++) if (near(val, cands[i].v)) return { code: cands[i].code, hint: cands[i].hint }; return null; } }), String(x),
      'Raise both sides to the reciprocal power ' + t(rec) + ': ' + t('\\left(x^{' + e1 + '}\\right)^{' + rec + '}=x') + ', so ' + t('x=' + baseTex(v) + '^{' + rec + '}') + '.<br>' + t(step) + '<br>Check: ' + t(F(x) + '^{' + e1 + '}=' + chk) + ' ✓',
      ['Raise both sides to the reciprocal of ' + t(e1) + ', which is ' + t(rec) + '.', 'Check your answer by substituting it back.'], 'solve x^' + e1 + '=' + vt, { keys: 'fraction', before: t('x=') });
    p.bad = cands.map(function (q) { return String(q.v); });
    return p;
  }
  function solveTwo(a, b, c) { // x^(a/b) = c^a with a even, b odd: x = ±c^b
    var x = Math.pow(c, b), val = Math.pow(c, a), e1 = a + '/' + b, rec = b + '/' + a;
    var check = function (resp) {
      resp = resp || [];
      var s = [String(resp[0] == null ? '' : resp[0]).trim(), String(resp[1] == null ? '' : resp[1]).trim()];
      if (!s[0] && !s[1]) return form('empty', 'Type your solutions first.');
      var vals = s.map(function (q) { if (!q) return null; var pr = HW.parse.number(q); return pr.ok ? pr.value : NaN; });
      if (vals.some(function (q) { return q !== null && isNaN(q); })) return form('notnumber', 'Enter a single number in each box.');
      for (var i = 0; i < 2; i++) {
        var q = vals[i]; if (q === null || q === x || q === -x) continue;
        if (near(q, Math.pow(val, a / b))) return wrong('same-power', 'Raising both sides to ' + t(e1) + ' again doesn’t undo it. Raise both sides to the <b>reciprocal</b> ' + t(rec) + '.');
        if (near(Math.abs(q), c)) return wrong('root-only', t(c) + ' is the ' + rootName(b) + ' root of ' + t('x') + '. Raise it to the power ' + t(b) + ' to find ' + t('x') + '.');
        return wrong('value', 'Check by substituting: ' + t('(' + q + ')^{' + e1 + '}') + ' isn’t ' + t(val) + '.');
      }
      if (vals[0] !== null && vals[0] === vals[1]) return wrong('one-solution', 'You have the same answer twice. There is a second solution: the numerator ' + t(a) + ' is even and the index ' + t(b) + ' is odd — could a <b>negative</b> ' + t('x') + ' work too?');
      if (vals[0] === null || vals[1] === null) return wrong('one-solution', 'That’s one solution — there’s another. The numerator ' + t(a) + ' is even and the index ' + t(b) + ' is odd: could a <b>negative</b> ' + t('x') + ' work too?');
      return ok();
    };
    return { prompt: t('x^{' + e1 + '}=' + val) + ' — this one has more solutions than you might expect. Find them all.', input: { type: 'fields', fields: [{ name: 'Solution 1', label: t('x='), mode: 'number' }, { name: 'Solution 2', label: 'or ' + t('x='), mode: 'number' }] },
      check: check, key: [String(x), String(-x)], answer: t('x=' + F(x)) + ' or ' + t('x=-' + F(x)),
      solution: 'Raise both sides to the reciprocal ' + t(rec) + ': ' + t('x=' + val + '^{' + rec + '}=\\left(\\sqrt{' + val + '}\\right)^{' + b + '}=' + c + '^{' + b + '}=' + F(x)) + '.<br>The index ' + t(b) + ' is odd, so try ' + t('-' + F(x)) + ' too: ' + t('(-' + F(x) + ')^{' + e1 + '}=\\left(' + rootTex(b, '-' + F(x)) + '\\right)^{' + a + '}=(-' + c + ')^{' + a + '}=' + val) + ' ✓<br>So ' + t('x=' + F(x)) + ' or ' + t('x=-' + F(x)) + '.',
      hints: ['Raise both sides to the reciprocal power ' + t(rec) + '.', 'The numerator ' + t(a) + ' is even: a negative number raised to an even power is positive.'], text: 'solve x^' + e1 + '=' + val + ' (two solutions)',
      good: [[String(-x), String(x)]], bad: [[String(x), String(x)], [String(x), ''], [String(Math.pow(val, a / b)), String(-x)]] };
  }
  function misRead(c, n, m) { // a^(m/n) vs the mis-read sqrt(a^m)
    var B = Math.pow(c, n), good = Math.pow(c, m), mis = Math.pow(c, n * m / 2), BT = F(B), e = expTex(m, n), Bm = Math.pow(B, m), sq = '\\sqrt{' + BT + '^{' + m + '}}';
    var p = P.fields('Evaluate ' + t(BT + '^{' + e + '}') + ' correctly, then evaluate the mis-read version ' + t(sq) + ', and say what the mis-read version is really the value of.',
      [{ name: 'Correct value', label: t(BT + '^{' + e + '}='), mode: 'number' }, { name: 'Mis-read value', label: t(sq + '='), mode: 'number' }, { name: 'Exponent', label: t(sq + '=' + BT + '^{\\,?}') + ', where ' + t('?='), mode: 'math', keys: 'fraction' }],
      [K.number(good, function (v) { return v === mis ? { code: 'square-root', hint: 'That’s the mis-read value. The denominator ' + t(n) + ' calls for a <b>' + rootName(n) + '</b> root, not a square root.' } : v === Bm ? { code: 'no-root', hint: 'Don’t forget the ' + rootName(n) + ' root (the denominator).' } : null; }),
        K.number(mis, function (v) { return v === good ? { code: 'misread', hint: 'That’s the correct value of ' + t(BT + '^{' + e + '}') + '. Now work out ' + t(sq) + ' exactly as written — a <b>square</b> root.' } : null; }),
        K.value([m, 2], { diag: function (v) { return near(v, m / n) ? { code: 'exponent', hint: 'That’s the exponent in the question. A square root has index ' + t('2') + ', so ' + t(sq + '=' + BT + '^{' + m + '/2}') + '.' } : near(v, 2 / m) ? { code: 'swap', hint: 'Power → numerator, index → denominator: ' + t('\\sqrt{a^{' + m + '}}=a^{' + m + '/2}') + '.' } : null; } })],
      [String(good), String(mis), m % 2 === 0 ? String(m / 2) : m + '/2'], t(BT + '^{' + e + '}=' + F(good)) + '; ' + t(sq + '=' + F(mis)) + ', which is really ' + t(BT + '^{' + m + '/2}'),
      'Denominator ' + t(n) + ': a ' + rootName(n) + ' root. ' + t(BT + '^{' + e + '}=\\left(' + rootTex(n, BT) + '\\right)^{' + m + '}=' + c + '^{' + m + '}=' + F(good)) + '.<br>Mis-read: ' + t(sq + '=\\sqrt{' + F(Bm) + '}=' + F(mis)) + '.<br>The mis-read version is really ' + t(BT + '^{' + m + '/2}') + ' — the right power under the wrong (square) root.',
      ['The denominator of the exponent is the index of the root.', 'A square root has index ' + t('2') + ': ' + t('\\sqrt{a^{m}}=a^{m/2}') + '.'], 'mis-read ' + B + '^(' + m + '/' + n + ')');
    p.bad = [[String(mis), String(mis), String(m) + '/' + n], [String(good), String(good), m + '/2']];
    return p;
  }
  function rootFirstPart(c, n, m) { // value by root first + the number power-first would need
    var B = Math.pow(c, n), BT = F(B), v = Math.pow(c, m), Bm = Math.pow(B, m), pr = BT + '^{' + m + '/' + n + '}';
    var p = P.fields(t(pr), [{ name: 'Value', label: 'root first: ' + t(pr + '='), mode: 'number' }, { name: 'Power first', label: 'power first you’d need the ' + rootName(n) + ' root of', mode: 'number', wide: true }],
      [K.number(v, function (x) { return x === Math.pow(c, n * m) ? { code: 'no-root', hint: 'Take the ' + rootName(n) + ' root first: ' + t(rootTex(n, BT) + '=' + c) + '.' } : x === Math.pow(m, c) ? { code: 'swap', hint: 'It’s ' + t(c + '^{' + m + '}') + ' (' + t(c) + ' to the power ' + t(m) + ').' } : null; }),
        K.number(Bm, function (x) { return x === B * m ? { code: 'times-exp', hint: t(BT + '^{' + m + '}') + ' means ' + t(BT) + ' multiplied by itself ' + m + ' times, not ' + t(BT + '\\times ' + m) + '.' } : x === v ? { code: 'misread', hint: 'That’s the value. Here give the number under the root if you raised ' + t(BT) + ' to the power ' + t(m) + ' <b>first</b>: ' + t(BT + '^{' + m + '}') + '.' } : null; })],
      [String(v), String(Bm)], t(pr + '=' + F(v)) + '; power first: ' + t(rootTex(n, BT + '^{' + m + '}') + '=' + rootTex(n, F(Bm))),
      'Root first: ' + t(pr + '=\\left(' + rootTex(n, BT) + '\\right)^{' + m + '}=' + c + '^{' + m + '}=' + F(v)) + '.<br>Power first: ' + t(rootTex(n, BT + '^{' + m + '}') + '=' + rootTex(n, F(Bm))) + ' — a much bigger number to take a root of.',
      ['Root first: what is ' + t(rootTex(n, BT)) + '?', 'Power first: work out ' + t(BT + '^{' + m + '}') + ' (a calculator is fine for that).'], 'root first ' + pr);
    p.bad = [[String(Bm), String(v)], [String(v), String(B * m)]];
    return p;
  }
  function bothWays(c, n, m) { // entire radical, root-first radical, value
    var B = Math.pow(c, n), BT = String(B), v = Math.pow(c, m), Bm = Math.pow(B, m), pr = F(B) + '^{' + m + '/' + n + '}', ent = rootTex(n, BT + '^{' + m + '}'), rf = '\\left(' + rootTex(n, BT) + '\\right)^{' + m + '}';
    var sw = 'Denominator ' + t(n) + ' → index of the root; numerator ' + t(m) + ' → the power.';
    var p = P.fields(t(pr), [{ name: 'Entire radical', label: 'entire radical', before: t('='), mode: 'math', keys: 'expo', vars: [] }, { name: 'Using radicals', label: 'root first', before: t('='), mode: 'math', keys: 'expo', vars: [] }, { name: 'Value', label: 'value', before: t('='), mode: 'number' }],
      [convCheck(ent, { form: 'radical', index: n, entire: true, cands: [[rootTex(m, BT + '^{' + n + '}'), 'swap', sw]] }), convCheck(rf, { form: 'radical', index: n, rootFirst: true, cands: [['\\left(' + rootTex(m, BT) + '\\right)^{' + n + '}', 'swap', sw]] }),
        K.number(v, function (x) { return x === Math.pow(c, n * m) || x === Bm ? { code: 'no-root', hint: 'Take the root: ' + t(rootTex(n, BT) + '=' + c) + '.' } : null; })],
      [ent, rf, String(v)], t(pr + '=' + ent + '=' + rf + '=' + F(v)),
      'Entire radical: ' + t(pr + '=' + ent + '=' + rootTex(n, F(Bm))) + '.<br>Using radicals: ' + t(pr + '=' + rf + '=' + c + '^{' + m + '}=' + F(v)) + '.<br>Only the <b>root-first</b> form can be finished by hand; the entire radical needs the ' + rootName(n) + ' root of ' + t(F(Bm)) + '.',
      convHints.slice(0, 1), 'both radical forms of ' + B + '^' + m + '/' + n);
    p.bad = [[rf, ent, String(v)], [ent, rf, String(v + 1)]];
    return p;
  }

  var EXTRA = [
    { num: '1', section: 'Extra practice A — The denominator is the index', stem: 'In ' + t('a^{m/n}') + ' the <b>denominator ' + t('n') + ' is the index of the root</b> and the numerator ' + t('m') + ' is the power. Evaluate each exactly.', parts: [
      { id: 'e1a', level: 'EMG', make: function (r) { var cm = r.pick([[4, 2], [2, 2], [3, 2], [5, 2], [2, 4], [10, 2]]); return EV({ base: [Math.pow(cm[0], 3), 1], m: cm[1], n: 3 }); } },
      { id: 'e1b', level: 'EMG', make: function (r) { var cm = r.pick([[2, 3], [2, 2], [2, 4], [3, 3]]); return EV({ base: [Math.pow(cm[0], 5), 1], m: cm[1], n: 5 }); } },
      { id: 'e1c', level: 'EMG', make: function (r) { var cm = r.pick([[2, 5], [2, 3], [3, 3], [2, 7], [3, 5]]); return EV({ base: [Math.pow(cm[0], 4), 1], m: cm[1], n: 4 }); } },
      { id: 'e1d', level: 'EMG', make: function (r) { var cm = r.pick([[3, 2], [3, 3], [2, 6], [3, 4]]); return EV({ base: [Math.pow(cm[0], 5), 1], m: cm[1], n: 5 }); } },
      { id: 'e1e', level: 'EMG', make: function (r) { var c = r.pick([2, 3, 10]); return EV({ base: [Math.pow(c, 6), 1], m: 1, n: 6 }); } }] },
    { num: '2', stem: 'A very common slip is to read <i>every</i> fractional exponent as a square root — to read ' + t('a^{m/n}') + ' as ' + t('\\sqrt{a^{m}}') + ' no matter what the denominator says.', parts: [
      { id: 'e2a', level: 'EMG', make: function (r) { return misRead(r.int(2, 5), 3, 2); } },
      { id: 'e2b', level: 'EMG', make: function (r) { return misRead(r.pick([2, 3]), 4, 3); } },
      { id: 'e2c', level: 'PRG', make: function (r) { var v = r.pick([[5, 4, 3], [2, 6, 5], [3, 4, 5]]); return misRead(v[0], v[1], v[2]); } }] },
    { num: '3', stem: function (sh) { return 'Evaluate ' + t(F(sh.B) + '^{' + sh.m + '/' + sh.n + '}') + ' <b>twice</b>, showing every step both times.'; },
      shared: function (r) { var v = r.pick([[2, 6, 5], [3, 3, 4], [2, 5, 4], [2, 4, 3], [3, 4, 3], [5, 3, 4]]); return { c: v[0], n: v[1], m: v[2], B: Math.pow(v[0], v[1]) }; },
      parts: [
        { id: 'e3a', level: 'EMG', make: function (r, sh) { return EV({ base: [sh.B, 1], m: sh.m, n: sh.n, prompt: '\\left(' + rootTex(sh.n, F(sh.B)) + '\\right)^{' + sh.m + '}', ask: function (e) { return 'Root first: ' + t(e); } }); } },
        { id: 'e3b', level: 'BEG', make: function (r, sh) {
          var Bm = Math.pow(sh.B, sh.m), v = Math.pow(sh.c, sh.m), BT = F(sh.B);
          var p = P.fields('Power first: ' + t(rootTex(sh.n, BT + '^{' + sh.m + '}')) + '. Work out ' + t(BT + '^{' + sh.m + '}') + ' (a calculator is fine for this step), then take the ' + rootName(sh.n) + ' root.',
            [{ name: 'Power', label: t(BT + '^{' + sh.m + '}='), mode: 'number', wide: true }, { name: 'Root', label: t(rootTex(sh.n, BT + '^{' + sh.m + '}') + '='), mode: 'number' }],
            [K.number(Bm, function (x) { return x === sh.B * sh.m ? { code: 'times-exp', hint: t(BT + '^{' + sh.m + '}') + ' means ' + t(BT) + ' multiplied by itself ' + sh.m + ' times, not ' + t(BT + '\\times ' + sh.m) + '.' } : null; }),
              K.number(v, function (x) { return near(x, Math.sqrt(Bm)) ? { code: 'square-root', hint: 'Use the ' + rootName(sh.n) + ' root (index ' + t(sh.n) + '), not the square root.' } : null; })],
            [String(Bm), String(v)], t(BT + '^{' + sh.m + '}=' + F(Bm)) + '; ' + t(rootTex(sh.n, F(Bm)) + '=' + F(v)),
            t(BT + '^{' + sh.m + '}=' + F(Bm)) + ', and ' + t(rootTex(sh.n, F(Bm)) + '=' + F(v)) + '.<br>Check: ' + t(F(v) + '^{' + sh.n + '}=\\left(' + sh.c + '^{' + sh.m + '}\\right)^{' + sh.n + '}=' + sh.c + '^{' + sh.m * sh.n + '}=' + F(Bm)) + ' ✓',
            ['Calculator: <code>' + sh.B + '^' + sh.m + '</code>, then use the ' + t('\\sqrt[x]{\\ }') + ' key with ' + t('x=' + sh.n) + '.'], 'power first ' + sh.B + '^' + sh.m + '/' + sh.n);
          p.bad = [[String(Bm), String(v + 1)], [String(sh.B * sh.m), String(v)]];
          return p;
        } },
        { id: 'e3c', level: 'EMG', make: function (r, sh) {
          var v = Math.pow(sh.c, sh.m), Bm = Math.pow(sh.B, sh.m), BT = F(sh.B);
          return mc(r, 'Both routes give ' + t(F(v)) + '. Which route would you use by hand, and why?', [
            { html: '<b>Root first</b>: ' + t(rootTex(sh.n, BT) + '=' + sh.c) + ' and ' + t(sh.c + '^{' + sh.m + '}') + ' keep every number small.', right: true },
            { html: '<b>Power first</b>: it’s the order the expression is written in.', why: 'Both orders are allowed — but power first means taking the ' + rootName(sh.n) + ' root of ' + t(F(Bm)) + ', which you can’t reasonably do by hand.' },
            { html: '<b>Power first</b>: bigger numbers give a more accurate answer.', why: 'Both routes are exact. The question is which one you can finish without a calculator.' },
            { html: 'Neither — it can only be done with a calculator.', why: 'Root first works by hand: ' + t(rootTex(sh.n, BT) + '=' + sh.c) + ', then ' + t(sh.c + '^{' + sh.m + '}=' + F(v)) + '.' }],
            '<b>Root first.</b> It keeps every number small: ' + t(rootTex(sh.n, BT) + '=' + sh.c) + ' and ' + t(sh.c + '^{' + sh.m + '}=' + F(v)) + '. Power first means taking the ' + rootName(sh.n) + ' root of ' + t(F(Bm)) + '.', ['Compare the sizes of the numbers in the two routes.'], 'root first vs power first');
        } }] },
    { num: '4', stem: 'Evaluate each power by taking the <b>root first</b>. Then write down the number you would have had to take a root of if you had done the <i>power</i> first.', parts: [
      { id: 'e4a', level: 'EMG', make: function (r) { return rootFirstPart(2, 2, r.pick([5, 7])); } },
      { id: 'e4b', level: 'EMG', make: function (r) { var v = r.pick([[2, 4], [2, 5], [3, 4], [3, 5]]); return rootFirstPart(v[0], 3, v[1]); } },
      { id: 'e4c', level: 'EMG', make: function (r) { return rootFirstPart(3, 2, r.pick([5, 7])); } },
      { id: 'e4d', level: 'EMG', make: function (r) { return rootFirstPart(5, 2, r.pick([3, 5])); } }] },
    { num: '5', section: 'Extra practice B — Negative rational exponents', stem: 'A negative exponent still means “take the reciprocal”, and the denominator still gives the index. Determine the exact value of each.', parts: [
      { id: 'e5a', level: 'PRG', make: function (r) { var cm = r.pick([[2, 3], [3, 3], [2, 1], [3, 1], [2, 5]]); return EV({ base: [Math.pow(cm[0], 4), 1], m: -cm[1], n: 4 }); } },
      { id: 'e5b', level: 'PRG', make: function (r) { var c = r.int(2, 5); return EV({ base: [c * c * c, 1], m: -2, n: 3 }); } },
      { id: 'e5c', level: 'PRG', make: function (r) { var cm = r.pick([[2, 4], [2, 2], [2, 3], [3, 2]]); return EV({ base: [Math.pow(cm[0], 5), 1], m: -cm[1], n: 5 }); } },
      { id: 'e5d', level: 'PRG', make: function (r) { var v = r.pick([[10000, 4, 3], [1000, 3, 2], [100, 2, 3], [10000, 4, 1]]); return EV({ base: [v[0], 1], m: -v[2], n: v[1] }); } },
      { id: 'e5e', level: 'PRG', make: function (r) { var cm = r.pick([[2, 5], [2, 1], [3, 1]]); return EV({ base: [Math.pow(cm[0], 6), 1], m: -cm[1], n: 6 }); } }] },
    { num: '6', stem: 'With a fractional base, flip the fraction first — then the exponent is positive. Express each answer as a fraction in lowest terms (or a whole number).', parts: [
      { id: 'e6a', level: 'PRG', make: function (r) { var ab = r.pick(coprimePairs(2, 5)); return EV({ base: [Math.pow(ab[0], 3), Math.pow(ab[1], 3)], m: -2, n: 3 }); } },
      { id: 'e6b', level: 'PRG', make: function (r) { var ab = r.pick([[2, 3], [3, 2], [1, 2], [2, 5], [1, 3]]); return EV({ base: [Math.pow(ab[0], 4), Math.pow(ab[1], 4)], m: -3, n: 4 }); } },
      { id: 'e6c', level: 'PRG', make: function (r) { var ab = r.pick([[5, 2], [2, 5], [3, 2], [2, 3], [4, 3]]); return EV({ base: [Math.pow(ab[0], 3), Math.pow(ab[1], 3)], m: -4, n: 3 }); } },
      { id: 'e6d', level: 'EMG', make: function (r) { var cm = r.pick([[2, 3], [2, 2], [3, 2], [2, 4]]); return EV({ base: [1, Math.pow(cm[0], 5)], m: -cm[1], n: 5 }); } },
      { id: 'e6e', level: 'EMG', make: function (r) { var ab = r.pick(coprimePairs(2, 12)); return EV({ base: [ab[0] * ab[0], ab[1] * ab[1]], m: -1, n: 2 }); } }] },
    { num: '7', stem: 'Now the minus signs are in different places. Decide what each one is attached to before you evaluate.', parts: [
      { id: 'e7a', level: 'PRG', make: function (r) { var cm = r.pick([[2, 5], [2, 4], [3, 4], [2, 2], [3, 2]]); return EV({ base: [1, Math.pow(cm[0], 3)], m: -cm[1], n: 3 }); } },
      { id: 'e7b', level: 'EMG', make: function (r) { var c = r.int(4, 12); return EV({ base: [c * c, 1], m: -1, n: 2, outer: -1, prompt: '-\\left(' + c * c + '^{-1/2}\\right)' }); } },
      { id: 'e7c', level: 'PRG', make: function (r) { var c = r.int(2, 5); return EV({ base: [-c * c * c, 1], m: -2, n: 3 }); } },
      { id: 'e7d', level: 'PRG', make: function (r) { var ab = r.pick(coprimePairs(2, 5)); return EV({ base: [-Math.pow(ab[0], 3), Math.pow(ab[1], 3)], m: -1, n: 3 }); } },
      { id: 'e7e', level: 'PRG', make: function (r) { var cm = r.pick([[2, 3], [2, 1], [3, 1], [3, 3]]); return EV({ base: [-Math.pow(cm[0], 5), 1], m: -cm[1], n: 5, outer: -1 }); } }] },
    { num: '8', section: 'Extra practice C — Converting both ways', stem: 'Write each power as an <b>entire radical</b> — one radical sign with everything underneath it, in the form ' + t('\\sqrt[n]{a^{m}}') + '.', parts: [
      { id: 'e8a', level: 'EMG', make: function (r) { var mn = r.pick([[4, 7], [2, 3], [3, 5], [5, 7], [3, 4], [5, 6]]); return genRad('x', mn[0], mn[1], 'entire', { entire: true }); } },
      { id: 'e8b', level: 'EMG', make: function (r) { return genRad('y', r.pick([3, 5, 7, 9]), 2, 'entire', { entire: true }); } },
      { id: 'e8c', level: 'PRG', make: function (r) { var mn = r.pick([[7, 4], [5, 3], [5, 4], [7, 3], [3, 2]]); return genRad('m', -mn[0], mn[1], 'entire', { entire: true }); } },
      { id: 'e8d', level: 'PRG', make: function (r) { var mn = r.pick([[5, 3], [4, 3], [3, 2], [7, 4], [2, 5]]); return coefRad('a', r.int(2, 7), mn[0], mn[1], { entire: true }); } },
      { id: 'e8e', level: 'PRG', make: function (r) { var v = r.pick([[2, 5, 3], [3, 4, 3], [2, 3, 2], [2, 4, 5], [5, 2, 3]]); return bracketRad('a', v[0], v[1], v[2], { entire: true }); } },
      { id: 'e8f', level: 'PRG', make: function (r) { var v = r.pick([[5, 3, 2], [3, 3, 2], [2, 5, 2], [7, 3, 2]]); return bracketRad('c', v[0], v[1], v[2], { entire: true }); } }] },
    { num: '9', stem: 'Write an equivalent expression <b>using radicals</b> — the root taken first, in the form ' + t('\\left(\\sqrt[n]{a}\\right)^{m}') + '.', parts: [
      { id: 'e9a', level: 'EMG', make: function (r) { var mn = r.pick([[5, 8], [3, 4], [5, 6], [3, 8], [7, 8]]); return genRad('x', mn[0], mn[1], 'rootFirst', { rootFirst: true }); } },
      { id: 'e9b', level: 'EMG', make: function (r) { return genRad('h', r.pick([4, 5, 7, 8]), 3, 'rootFirst', { rootFirst: true }); } },
      { id: 'e9c', level: 'PRG', make: function (r) { var mn = r.pick([[4, 9], [2, 5], [3, 7], [5, 9], [2, 3]]); return genRad('k', -mn[0], mn[1], 'rootFirst', { rootFirst: true }); } },
      { id: 'e9d', level: 'EMG', make: function (r) { var mn = r.pick([[3, 5], [2, 3], [3, 4], [2, 5], [4, 5]]); return genRad(String(r.pick([2, 3, 5, 6, 7, 10, 11])), mn[0], mn[1], 'rootFirst', { rootFirst: true }); } },
      { id: 'e9e', level: 'PRG', make: function (r) { var mn = r.pick([[5, 6], [2, 3], [3, 4], [4, 5]]); return bracketRad('b', r.pick([2, 3, 5]), -mn[0], mn[1], { rootFirst: true }); } }] },
    { num: '10', stem: 'Write each power <b>both</b> ways — as an entire radical, and using radicals (root first) — then evaluate it.', parts: [
      { id: 'e10a', level: 'EMG', make: function (r) { var cm = r.pick([[2, 3], [2, 2], [2, 4], [3, 2], [3, 3]]); return bothWays(cm[0], 5, cm[1]); } },
      { id: 'e10b', level: 'EMG', make: function (r) { return bothWays(r.int(11, 15), 2, 3); } }] },
    { num: '11', stem: 'Run the conversion the other way. Write each radical as a power in the form ' + t('x^{n}') + ', where ' + t('n\\in Q') + '.', parts: [
      { id: 'e11a', level: 'EMG', make: function (r) { var mn = r.pick([[5, 8], [3, 8], [5, 6], [2, 7], [3, 5]]); return toPowPart('x', mn[0], mn[1], rootTex(mn[1], 'x^{' + mn[0] + '}')); } },
      { id: 'e11b', level: 'EMG', make: function (r) { var mn = r.pick([[11, 3], [7, 3], [5, 3], [7, 4], [9, 4]]); return toPowPart('x', mn[0], mn[1], rootTex(mn[1], 'x^{' + mn[0] + '}')); } },
      { id: 'e11c', level: 'PRG', make: function (r) { var mn = r.pick([[9, 4], [7, 3], [5, 2], [7, 4], [11, 6]]); return toPowPart('x', -mn[0], mn[1], '\\dfrac{1}{' + rootTex(mn[1], 'x^{' + mn[0] + '}') + '}'); } },
      { id: 'e11d', level: 'PRG', make: function (r) { var mn = r.pick([[7, 5], [3, 4], [5, 3], [2, 3], [4, 5]]), rad = '\\left(' + rootTex(mn[1], 'x') + '\\right)^{-' + mn[0] + '}';
        return toPowPart('x', -mn[0], mn[1], rad, 'The root is the power ' + t('\\frac{1}{' + mn[1] + '}') + '; then multiply the exponents (power of a power):<br>' + t(rad + '=\\left(x^{1/' + mn[1] + '}\\right)^{-' + mn[0] + '}=x^{-' + mn[0] + '/' + mn[1] + '}'), null,
          [['x^{' + mn[0] + '/' + mn[1] + '}', 'no-recip', 'The outside exponent is <b>negative</b>, so the result has a negative exponent.']]); } },
      { id: 'e11e', level: 'PRG', make: function (r) { var pn = r.pick([[1, 3], [1, 2], [1, 4], [1, 5], [2, 3]]), p = pn[0], n = pn[1], top = p * n - 1, xt = p === 1 ? 'x' : 'x^{' + p + '}', rad = '\\dfrac{' + xt + '}{' + rootTex(n, 'x') + '}';
        return toPowPart('x', top, n, rad, 'Write both as powers, then subtract the exponents (quotient law):<br>' + t(rad + '=\\frac{x^{' + p + '}}{x^{1/' + n + '}}=x^{' + p + '-\\frac{1}{' + n + '}}=x^{' + top + '/' + n + '}'), 'radical to power ' + rad,
          [['x^{' + (p * n + 1) + '/' + n + '}', 'exp', 'Dividing powers with the same base: <b>subtract</b> the exponents, don’t add them.'], ['x^{' + p * n + '}', 'times-exp', 'The ' + rootName(n) + ' root of ' + t('x') + ' is ' + t('x^{1/' + n + '}') + '. Divide: subtract the exponents.']]); } }] },
    { num: '12', section: 'Extra practice D — When the base is negative', stem: 'An <b>even index over a negative radicand has no meaning</b> as a real number; an odd index is fine with a negative base. Evaluate each exactly, or press <b>none</b> if it has no meaning.', parts: [
      { id: 'e12a', level: 'EMG', make: function (r) { var c = r.int(3, 12), N = c * c; return meaningPart({ undef: true, expr: '(-' + N + ')^{1/2}', why: 'Base ' + t('-' + N) + ', index ' + t('2') + ' (even): no real number squares to a negative, so ' + t('(-' + N + ')^{1/2}') + ' has <b>no meaning</b>.', valWhy: 'Check: ' + t(c + '^{2}=' + N) + ' and ' + t('(-' + c + ')^{2}=' + N) + ' — neither gives ' + t('-' + N) + '. An even root of a negative number has no real value.' }); } },
      { id: 'e12b', level: 'EMG', make: function (r) { var c = r.int(3, 12); return meaningPart({ base: [c * c, 1], m: 1, n: 2, outer: -1, noneWhy: 'Without brackets the exponent belongs to ' + t(c * c) + ' only: ' + t('-' + c * c + '^{1/2}=-\\sqrt{' + c * c + '}') + ', which has a value.' }); } },
      { id: 'e12c', level: 'PRG', make: function (r) { var cm = r.pick([[3, 4], [2, 4], [2, 2], [4, 2], [5, 2]]); return meaningPart({ base: [-Math.pow(cm[0], 3), 1], m: cm[1], n: 3, noneWhy: 'The index ' + t('3') + ' is <b>odd</b>, so the cube root of a negative number exists.' }); } },
      { id: 'e12d', level: 'EMG', make: function (r) { var v = r.pick([[27, 3, 4], [8, 1, 4], [64, 3, 2], [125, 1, 2], [32, 3, 4], [81, 1, 2]]), ex1 = '(-' + v[0] + ')^{' + v[1] + '/' + v[2] + '}'; return meaningPart({ undef: true, expr: ex1, why: 'The index ' + t(v[2]) + ' is even and the base ' + t('-' + v[0]) + ' is negative: <b>no meaning</b>.', valWhy: 'Look at the index: ' + t(v[2]) + ' is <b>even</b>, and no real number raised to an even power is negative.' }); } },
      { id: 'e12e', level: 'PRG', make: function (r) { var cm = r.pick([[3, 3], [2, 3], [2, 2], [3, 2], [2, 4]]); return meaningPart({ base: [-Math.pow(cm[0], 5), 1], m: cm[1], n: 5, noneWhy: 'The index ' + t('5') + ' is <b>odd</b>, so the fifth root of a negative number exists.' }); } }] },
    { num: '13', stem: 'Now state the rule behind question 12.', parts: [
      { id: 'e13a', level: 'EMG', make: function (r) {
        var c = r.pick([2, 3, 5, 10]), C = F(c * c * c);
        return mc(r, 'Why does ' + t('(-' + C + ')^{1/3}') + ' have meaning, but ' + t('(-' + C + ')^{1/2}') + ' does not?', [
          { html: 'Index ' + t('3') + ' is odd and ' + t('(-' + c + ')^{3}=-' + C) + ', so ' + t('(-' + C + ')^{1/3}=-' + c) + '. Index ' + t('2') + ' is even, and no real number squared is negative.', right: true },
          { html: 'Both have meaning: ' + t('(-' + C + ')^{1/2}=-\\sqrt{' + C + '}') + '.', why: 'Check by squaring: ' + t('\\left(-\\sqrt{' + C + '}\\right)^{2}=+' + C) + ', not ' + t('-' + C) + '.' },
          { html: t(C) + ' is a perfect cube but not a perfect square.', why: 'Try ' + t('(-100)^{1/2}') + ': ' + t('100') + ' is a perfect square, but it still has no meaning. The index decides, not the number.' },
          { html: 'Neither has meaning: a negative base can’t have a fractional exponent.', why: t('(-' + c + ')^{3}=-' + C) + ', so the cube root of ' + t('-' + C) + ' does exist.' }],
          'The index of ' + t('(-' + C + ')^{1/3}') + ' is ' + t('3') + '. Every real number has one real cube root, and ' + t('(-' + c + ')^{3}=-' + C) + ', so ' + t('(-' + C + ')^{1/3}=-' + c) + '.<br>The index of ' + t('(-' + C + ')^{1/2}') + ' is ' + t('2') + '. A real number squared is never negative, so ' + t('-' + C) + ' has no real square root: <b>no meaning</b>.', ['Is the index even or odd?'], 'why odd/even root of -' + c * c * c);
      } },
      { id: 'e13b', level: 'EMG', make: function (r) {
        var c = r.pick([2, 3]), C = c * c * c;
        return mc(r, t('(-' + C + ')^{2/3}') + ' and ' + t('(-' + C + ')^{4/3}') + ' are positive, while ' + t('(-' + C + ')^{1/3}') + ' and ' + t('(-' + C + ')^{5/3}') + ' are negative. What decides the sign?', [
          { html: 'The <b>numerator</b>: the cube root is ' + t('-' + c) + ' each time; an even power of it is positive and an odd power is negative.', right: true },
          { html: 'The <b>denominator</b>: an index of ' + t('3') + ' makes the answer negative.', why: 'All four have the same denominator ' + t('3') + ', yet two are positive. Something else decides.' },
          { html: 'The <b>size</b> of the exponent: exponents greater than ' + t('1') + ' give positive answers.', why: t('\\frac{5}{3}>1') + ' but ' + t('(-' + C + ')^{5/3}') + ' is negative, and ' + t('\\frac{2}{3}<1') + ' but ' + t('(-' + C + ')^{2/3}') + ' is positive.' },
          { html: 'A negative base always gives a negative answer; the positive ones are calculator errors.', why: t('(-' + C + ')^{2/3}=(-' + c + ')^{2}=' + c * c) + ', which is exactly positive.' }],
          'The index ' + t('3') + ' is odd, so ' + t(rootTex(3, '-' + C) + '=-' + c) + ' each time; the <b>numerator</b> then raises ' + t('-' + c) + ' to a power.<br>' + t('(-' + c + ')^{2}=' + c * c) + ', ' + t('(-' + c + ')^{4}=' + Math.pow(c, 4)) + ': even numerator, <b>positive</b>.<br>' + t('(-' + c + ')^{1}=-' + c) + ', ' + t('(-' + c + ')^{5}=-' + Math.pow(c, 5)) + ': odd numerator, <b>negative</b>.', ['Work out each one root first. What is different between the positive and negative ones?'], 'what decides the sign of (-' + C + ')^(m/3)');
      } },
      { id: 'e13c', level: 'PRG', make: function (r) {
        return mc(r, 'Complete the rule: for ' + t('a>0') + ' and ' + t('\\frac{m}{n}') + ' in lowest terms, ' + t('(-a)^{m/n}') + ' has meaning exactly when …', [
          { html: t('n') + ' is odd', right: true },
          { html: t('m') + ' is odd', why: 'Try ' + t('(-16)^{1/2}') + ': ' + t('m=1') + ' is odd, but there is no real value.' },
          { html: t('m') + ' is even', why: 'Try ' + t('(-8)^{1/3}=-2') + ': ' + t('m=1') + ' is odd, and it still has meaning.' },
          { html: t('n') + ' is even', why: 'Try ' + t('(-16)^{1/2}') + ': ' + t('n=2') + ' is even, and no real number squares to ' + t('-16') + '.' }],
          'The denominator ' + t('n') + ' is the index. An odd root of a negative number is real (e.g. ' + t('\\sqrt[3]{-8}=-2') + '); an even root of a negative number is not. The numerator only raises that root to a power, so it can’t change whether the expression has meaning. So: ' + t('n') + ' is <b>odd</b>.', ['Test each choice on ' + t('(-8)^{1/3}') + ' and ' + t('(-16)^{1/2}') + '.'], 'rule for (-a)^(m/n)');
      } }] },
    { num: '14', stem: 'Assume ' + t('x') + ' represents a positive integer.', parts: [
      { id: 'e14', level: 'PRG', make: function (r) { return e14(r); } }] },
    { num: '19', section: 'Extra practice E — Find the error', stem: function (sh) { return 'Asked to evaluate ' + t(sh.B + '^{2/3}') + ', a student wrote ' + t(sh.B + '^{2/3}=\\sqrt{' + sh.B + '^{3}}=\\sqrt{' + F(sh.B3) + '}\\approx ' + sh.apx) + '.'; },
      shared: function (r) { var c = r.pick([2, 3, 3, 5]), B = c * c * c, B3 = B * B * B; return { c: c, B: B, B3: B3, apx: (Math.round(Math.sqrt(B3) * 10) / 10).toFixed(1) }; },
      parts: [
        { id: 'e19a', level: 'EMG', make: function (r, sh) {
          return mc(r, 'What did the student swap?', [
            { html: 'The index and the power: the numerator ' + t('2') + ' was used as the index and the denominator ' + t('3') + ' as the power.', right: true },
            { html: 'The base and the exponent.', why: 'The base ' + t(sh.B) + ' is still the base. Look at where the ' + t('2') + ' and the ' + t('3') + ' ended up.' },
            { html: 'Nothing — the student just rounded too early.', why: 'The exact value is a whole number (' + t(sh.c * sh.c) + '), so ' + t('\\approx ' + sh.apx) + ' should be a warning sign.' },
            { html: 'The square root should have been taken before the cubing.', why: 'Root first or power first gives the same result. The real problem is <i>which</i> root and <i>which</i> power.' }],
            'The student used the <b>numerator</b> ' + t('2') + ' as the index and the <b>denominator</b> ' + t('3') + ' as the power — the index and the power were swapped. In ' + t('a^{m/n}') + ', the denominator is the index.', ['In ' + t('a^{m/n}') + ', which number is the index of the root?'], 'error: swapped index/power ' + sh.B + '^(2/3)');
        } },
        { id: 'e19b', level: 'EMG', make: function (r, sh) { return EV({ base: [sh.B, 1], m: 2, n: 3, ask: function (e) { return 'Give the correct value of ' + t(e) + ', using the route that keeps the numbers smallest.'; } }); } },
        { id: 'e19c', level: 'EMG', make: function (r, sh) {
          var tg = sh.B + '^{3/2}';
          var p = convPart('The student’s expression isn’t nonsense — write ' + t('\\sqrt{' + sh.B + '^{3}}') + ' as a power with a rational exponent.', tg, { form: 'power', single: 'a^{n}', needRat: true, cands: [[sh.B + '^{2/3}', 'swap', 'The square root has index ' + t('2') + ', which becomes the <b>denominator</b>; the power ' + t('3') + ' becomes the numerator.'], [sh.B + '^{6}', 'times-exp', 'A root divides the exponent: index ' + t('2') + ' → denominator.']] },
            'Index ' + t('2') + ' → denominator, power ' + t('3') + ' → numerator: ' + t('\\sqrt{' + sh.B + '^{3}}=' + tg) + ' (' + t('\\approx ' + sh.apx) + ' — not a whole number, a warning sign that the first reading was wrong).', convHints.slice(0, 1), 'sqrt(' + sh.B + '^3) as a power');
          p.good = [sh.B + '^(3/2)', sh.B + '^{1.5}'];
          return p;
        } }] },
    { num: '20', stem: function (sh) { return 'A second student wrote ' + t('(-' + sh.N + ')^{1/2}=-' + sh.c) + ', reasoning that “the square root of ' + t(sh.N) + ' is ' + t(sh.c) + ', and the base was negative, so the answer is negative.”'; },
      shared: function (r) { var c = r.int(4, 9); return { c: c, N: c * c }; },
      parts: [
        { id: 'e20a', level: 'PRG', make: function (r, sh) {
          var N = sh.N, c = sh.c;
          return mc(r, 'Consider these statements:<br>I.&nbsp; ' + t('(-' + c + ')^{2}=' + N) + ', not ' + t('-' + N) + ', so ' + t('-' + c) + ' is not a square root of ' + t('-' + N) + '.<br>II.&nbsp; The index is ' + t('2') + ' (even) and the base is negative, so ' + t('(-' + N + ')^{1/2}') + ' has no real value at all.<br>III.&nbsp; A square root is never negative, so the answer should be ' + t(c) + '.<br>Which are correct reasons the answer ' + t('-' + c) + ' is wrong?', [
            { html: 'I and II only', right: true },
            { html: 'I only', why: 'Statement II is also true: an even root of a negative number has no real value.' },
            { html: 'II only', why: 'Statement I is also true: check by squaring, ' + t('(-' + c + ')^{2}=+' + N) + '.' },
            { html: 'I, II and III', why: 'Statement III is false: ' + t(c + '^{2}=' + N) + ' too, not ' + t('-' + N) + '. There is <b>no</b> real answer, positive or negative.' }],
            '<b>I</b> is true: ' + t('(-' + c + ')^{2}=' + N) + ', not ' + t('-' + N) + '.<br><b>II</b> is true: the index ' + t('2') + ' is even and the base is negative; no real number squares to a negative, so ' + t('(-' + N + ')^{1/2}') + ' has <b>no meaning</b>.<br><b>III</b> is false: ' + t(c) + ' doesn’t work either, since ' + t(c + '^{2}=' + N) + '.', ['Check each statement by squaring.'], 'two reasons (-' + N + ')^(1/2) ≠ -' + c, true);
        } },
        { id: 'e20b', level: 'EMG', make: function (r, sh) {
          var N = sh.N, c = sh.c;
          return mc(r, 'Change only the brackets in ' + t('(-' + N + ')^{1/2}') + ' so that ' + t('-' + c) + ' <b>is</b> the correct answer.', [
            { html: t('-' + N + '^{1/2}'), right: true },
            { html: t('-(-' + N + ')^{1/2}'), why: 'That still contains ' + t('(-' + N + ')^{1/2}') + ', which has no meaning.' },
            { html: t('(-' + N + '^{1})^{1/2}'), why: 'The base inside the brackets is still ' + t('-' + N) + ' — an even root of a negative number.' },
            { html: 'No change is needed: ' + t('(-' + N + ')^{1/2}=-' + c) + '.', why: 'Square ' + t('-' + c) + ': you get ' + t(N) + ', not ' + t('-' + N) + '.' }],
            'Remove the brackets: ' + t('-' + N + '^{1/2}=-\\sqrt{' + N + '}=-' + c) + '. Now the exponent applies to ' + t(N) + ' only, and the minus sign is applied afterwards.', ['Without brackets, which number does the exponent belong to?'], 'brackets so that = -' + c);
        } },
        { id: 'e20c', level: 'PRG', make: function (r, sh) {
          var N = sh.N;
          return mc(r, 'Keeping the base ' + t('-' + N) + ', is there any rational exponent that gives a real value?', [
            { html: 'Yes — any exponent whose denominator (the index) is odd, e.g. ' + t('(-' + N + ')^{1/3}=' + rootTex(3, '-' + N)) + '.', right: true },
            { html: 'No — a negative base never has a real value with a fractional exponent.', why: 'Try ' + t('(-8)^{1/3}') + ': ' + t('(-2)^{3}=-8') + ', so it equals ' + t('-2') + '. An odd index works.' },
            { html: 'Yes — ' + t('(-' + N + ')^{1/4}') + ', because ' + t(N) + ' is a perfect square.', why: 'The index ' + t('4') + ' is even: no real number to the 4th power is negative.' },
            { html: 'Yes — ' + t('(-' + N + ')^{2/4}') + ', because squaring first makes it positive.', why: 'Reduce the exponent first: ' + t('\\frac{2}{4}=\\frac{1}{2}') + ', so it is the same as ' + t('(-' + N + ')^{1/2}') + ' — no meaning.' }],
            '<b>Yes</b> — any exponent whose denominator is odd, e.g. ' + t('(-' + N + ')^{1/3}=' + rootTex(3, '-' + N) + '\\approx ' + (-Math.cbrt(N)).toFixed(2)) + '. It is the index, not the base, that decides.', ['For a negative base, which part of the exponent matters: the numerator or the denominator?'], 'exponent giving a real value for -' + N);
        } }] },
    { num: '21', stem: 'One more line containing an error.', parts: [
      { id: 'e21c', sub: 'c', level: 'EMG', make: function (r) {
        var v = r.pick([[8, 2, 3], [27, 2, 3], [16, 3, 4], [32, 2, 5], [64, 2, 3]]), p = Math.pow(iroot(v[0], v[2]), v[1]);
        var e = EV({ base: [v[0], 1], m: -v[1], n: v[2], ask: function (x) { return 'A student wrote ' + t(x + '=-' + p) + '. Write the correct value of ' + t(x) + '.'; } });
        e.solution = 'The mistake: a negative exponent means <b>reciprocal</b>, not a negative answer.<br>' + e.solution;
        return e;
      } }] },
    { num: '22', section: 'Extra practice F — Stretch', stem: 'A rational exponent can be undone by raising both sides to its <i>reciprocal</i>. Solve for ' + t('x') + ', and check each answer by substituting it back.', parts: [
      { id: 'e22a', level: 'ADV', make: function (r) { return solvePart(3, 2, r.int(2, 5)); } },
      { id: 'e22b', level: 'MAS', make: function (r) { var v = r.pick([[2, 3, 5], [2, 3, 2], [2, 3, 3], [2, 3, 4], [2, 3, 6], [4, 3, 2], [2, 5, 2]]); return solveTwo(v[0], v[1], v[2]); } },
      { id: 'e22c', level: 'ADV', make: function (r) { var v = r.pick([[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3]]); return solvePart(-1, v[0], v[1]); } },
      { id: 'e22d', level: 'ADV', make: function (r) { var v = r.pick([[5, 3, 2], [3, 5, 2], [5, 2, 2], [3, 4, 3], [5, 3, 3]]); return solvePart(v[0], v[1], v[2]); } }] },
    { num: '24', stem: 'Two exam-style items.', parts: [
      { id: 'e24a', level: 'EMG', make: function (r) {
        var pq = r.pick(coprimePairs(2, 5)), p = pq[0], q = pq[1], P3 = p * p * p, Q3 = q * q * q, bt = '\\left(\\frac{' + P3 + '}{' + Q3 + '}\\right)^{-2/3}';
        return mc(r, '<i>(Multiple Choice)</i> ' + t(bt) + ' is equal to', [
          { html: t('\\frac{' + q * q + '}{' + p * p + '}'), right: true },
          { html: t('\\frac{' + p * p + '}{' + q * q + '}'), why: 'The exponent is negative: flip the base first.' },
          { html: t('-\\frac{' + q * q + '}{' + p * p + '}'), why: 'A negative exponent means reciprocal, not a negative answer.' },
          { html: 'has no meaning', why: 'The base is positive, so every root of it exists.' }],
          'Flip the base to clear the negative exponent: ' + t(bt + '=\\left(\\frac{' + Q3 + '}{' + P3 + '}\\right)^{2/3}=\\left(\\frac{' + rootTex(3, Q3) + '}{' + rootTex(3, P3) + '}\\right)^{2}=\\left(\\frac{' + q + '}{' + p + '}\\right)^{2}=\\frac{' + q * q + '}{' + p * p + '}') + '. Positive and defined.', ['Negative exponent → flip the fraction. Denominator 3 → cube root.'], 'MC ' + bt);
      } },
      { id: 'e24b', level: 'PRG', make: function (r) {
        var pool = [['16^{3/4}', 8, '\\left(\\sqrt[4]{16}\\right)^{3}=2^{3}'], ['64^{2/3}', 16, '\\left(\\sqrt[3]{64}\\right)^{2}=4^{2}'], ['81^{1/2}', 9, '\\sqrt{81}'], ['27^{2/3}', 9, '\\left(\\sqrt[3]{27}\\right)^{2}=3^{2}'], ['32^{3/5}', 8, '\\left(\\sqrt[5]{32}\\right)^{3}=2^{3}'],
          ['125^{2/3}', 25, '\\left(\\sqrt[3]{125}\\right)^{2}=5^{2}'], ['8^{4/3}', 16, '\\left(\\sqrt[3]{8}\\right)^{4}=2^{4}'], ['49^{1/2}', 7, '\\sqrt{49}'], ['16^{5/4}', 32, '\\left(\\sqrt[4]{16}\\right)^{5}=2^{5}'], ['81^{3/4}', 27, '\\left(\\sqrt[4]{81}\\right)^{3}=3^{3}'], ['4^{5/2}', 32, '\\left(\\sqrt{4}\\right)^{5}=2^{5}']];
        var tri = pickWhere(r, function () { return r.sample(pool, 3); }, function (s) { var v = s[0][1] + s[1][1] - s[2][1]; return v > 0 && v < 1000 && s[0][1] + s[1][1] + s[2][1] !== v; }) || [pool[0], pool[1], pool[2]];
        var ans = tri[0][1] + tri[1][1] - tri[2][1], e1 = tri[0][0] + '+' + tri[1][0] + '-' + tri[2][0];
        return P.nr('<i>(Numerical Response)</i> The value of ' + t(e1) + ' is ________.', ans, function (v) {
          if (v === tri[0][1] + tri[1][1] + tri[2][1]) return { code: 'sign', hint: 'The last term is <b>subtracted</b>.' };
          return null;
        }, tri.map(function (x) { return t(x[0] + '=' + x[2] + '=' + x[1]); }).join('<br>') + '<br>' + t(tri[0][1] + '+' + tri[1][1] + '-' + tri[2][1] + '=' + ans) + '.', ['Evaluate each power root first, then add and subtract.'], 'NR ' + e1);
      } }] }
  ];

  HW.defineLesson({
    id: 'u2l5a', unit: 2, num: '5A', title: 'Rational Exponents and Radicals', outcome: 'AN3',
    blurb: 'What a fractional exponent means, evaluating powers like 27^(2/3) by hand and with a calculator, converting both ways between powers and radicals, and solving problems.',
    questions: [
      { num: '1', section: 'Part A — Evaluating Rational-Exponent Powers', stem: 'Evaluate without the use of a calculator.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var c = r.int(2, 12); return EV({ base: [c * c, 1], m: 1, n: 2 }); } },
        { id: '1b', level: 'BEG', make: function (r) { var c = r.pick([11, 12, 13, 15, 20, 30, 40, 50, 60, 70, 80, 90]); return EV({ base: [c * c, 1], m: 1, n: 2 }); } },
        { id: '1c', level: 'BEG', make: function (r) { var c = r.int(4, 10); return EV({ base: [c * c * c, 1], m: 1, n: 3 }); } },
        { id: '1d', level: 'EMG', make: function (r) { var c = r.int(2, 5); return EV({ base: [c * c, 1], m: 3, n: 2 }); } },
        { id: '1e', level: 'EMG', make: function (r) { var c = r.int(6, 10); return EV({ base: [c * c, 1], m: 3, n: 2 }); } },
        { id: '1f', level: 'EMG', make: function (r) { var c = r.pick([2, 3, 5, 10]); return EV({ base: [Math.pow(c, 4), 1], m: 3, n: 4 }); } },
        { id: '1g', level: 'EMG', make: function (r) { var cm = r.pick([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3]]); return EV({ base: [Math.pow(cm[0], 5), 1], m: cm[1], n: 5 }); } },
        { id: '1h', level: 'EMG', make: function (r) { var d = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]); return EV({ base: ex.norm(d * d, 100), m: 1, n: 2, dec: true, etex: '0.5', pre: 'An exponent of ' + t('0.5') + ' is ' + t('\\frac{1}{2}') + ': a square root.' }); } }] },
      { num: '2', stem: 'Determine the exact value without using a calculator.', parts: [
        { id: '2a', level: 'EMG', make: function (r) { var c = r.int(2, 12); return EV({ base: [c * c, 1], m: -1, n: 2 }); } },
        { id: '2b', level: 'PRG', make: function (r) { var cm = r.pick([[2, 3], [2, 5], [3, 3], [3, 5], [4, 3], [5, 3]]); return EV({ base: [cm[0] * cm[0], 1], m: -cm[1], n: 2 }); } },
        { id: '2c', level: 'PRG', make: function (r) { var c = r.int(2, 5); return EV({ base: [c * c * c, 1], m: -2, n: 3 }); } },
        { id: '2d', level: 'PRG', make: function (r) { var v = r.pick([[100, 2, 3], [10000, 4, 3], [1000, 3, 2], [10000, 2, 3]]); return EV({ base: [v[0], 1], m: -v[2], n: v[1] }); } },
        { id: '2e', level: 'PRG', make: function (r) { var cm = r.pick([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3]]); return EV({ base: [Math.pow(cm[0], 5), 1], m: -cm[1], n: 5 }); } },
        { id: '2f', level: 'PRG', make: function (r) { var cm = r.pick([[3, 2], [4, 2], [5, 2], [6, 2], [10, 2], [2, 4]]); return EV({ base: [Math.pow(cm[0], 3), 1], m: -cm[1], n: 3 }); } },
        { id: '2g', level: 'PRG', make: function (r) {
          var cb = r.pick([[13, 12], [5, 4], [17, 15], [10, 8], [25, 24], [13, 5], [10, 6], [17, 8]]), d = cb[0] * cb[0] - cb[1] * cb[1];
          return EV({ base: [d, 1], m: -1, n: 2, btex: '\\left(' + cb[0] + '^{2}-' + cb[1] + '^{2}\\right)', sbtex: String(d), pre: 'Work out the brackets first: ' + t(cb[0] + '^{2}-' + cb[1] + '^{2}=' + cb[0] * cb[0] + '-' + cb[1] * cb[1] + '=' + d) + '.',
            extra: [{ v: 1 / (cb[0] - cb[1]), code: 'term-root', hint: 'You can’t take the root of each term separately: ' + t('\\sqrt{' + cb[0] + '^{2}-' + cb[1] + '^{2}}\\ne ' + cb[0] + '-' + cb[1]) + '. Work out the brackets first.' }] });
        } },
        { id: '2h', level: 'PRG', make: function (r) { return EV({ base: r.pick([[1, 4], [1, 25], [1, 100]]), m: r.pick([-1, -3]), n: 2, dec: true }); } }] },
      { num: '3', stem: 'Determine the exact value without using a calculator.', parts: [
        { id: '3a', level: 'EMG', make: function (r) { var c = r.int(2, 12); return EV({ base: [1, c * c], m: 1, n: 2 }); } },
        { id: '3b', level: 'EMG', make: function (r) { var c = r.int(2, 12); return EV({ base: [1, c * c], m: -1, n: 2 }); } },
        { id: '3c', level: 'PRG', make: function (r) { var cm = r.pick([[2, 2], [2, 4], [3, 2], [3, 4], [4, 2], [5, 2]]); return EV({ base: [1, Math.pow(cm[0], 3)], m: cm[1], n: 3 }); } },
        { id: '3d', level: 'PRG', make: function (r) { var ab = r.pick(coprimePairs(2, 7)); return EV({ base: [ab[0] * ab[0], ab[1] * ab[1]], m: -3, n: 2 }); } },
        { id: '3e', level: 'PRG', make: function (r) { var ab = r.pick([[3, 2], [2, 3], [5, 2], [2, 5], [5, 3], [3, 5]]); return EV({ base: [Math.pow(ab[0], 4), Math.pow(ab[1], 4)], m: -3, n: 4 }); } }] },
      { num: '4', stem: 'Determine the exact value without using a calculator.', parts: [
        { id: '4a', level: 'EMG', make: function (r) { var c = r.int(2, 6); return EV({ base: [-c * c * c, 1], m: 1, n: 3 }); } },
        { id: '4b', level: 'PRG', make: function (r) { var cm = r.pick([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [2, 4], [3, 4]]); return EV({ base: [-Math.pow(cm[0], 3), 1], m: cm[1], n: 3 }); } },
        { id: '4c', level: 'PRG', make: function (r) { var c = r.int(2, 12); return EV({ base: [c * c, 1], m: -1, n: 2, outer: -1 }); } },
        { id: '4d', level: 'PRG', make: function (r) { var v = r.pick([[3, 3, 5], [2, 3, 5], [2, 1, 5], [3, 1, 5], [2, 1, 3], [3, 1, 3]]); return EV({ base: [-Math.pow(v[0], v[2]), 1], m: -v[1], n: v[2], outer: -1 }); } },
        { id: '4e', level: 'PRG', make: function (r) { var d = r.int(1, 5); return EV({ base: ex.norm(-d * d * d, 1000), m: 2, n: 3, dec: true }); } }] },
      { num: '5', stem: 'Use a calculator to evaluate the following to the nearest hundredth.', parts: [
        { id: '5a', level: 'BEG', make: function (r) { return AP(pickWhere(r, function () { var mn = r.pick([[2, 3], [2, 3], [3, 4], [2, 5]]); return { b: r.pick([2, 3, 5, 6, 7, 10, 11, 12]), m: mn[0], n: mn[1] }; }, apOk) || { b: 5, m: 2, n: 3 }); } },
        { id: '5b', level: 'BEG', make: function (r) { return AP(pickWhere(r, function () { return { b: r.pick([3, 6, 7, 9, 11, 12]), m: r.int(2, 4), n: 5 }; }, apOk) || { b: 9, m: 3, n: 5 }); } },
        { id: '5c', level: 'EMG', make: function (r) { return AP(pickWhere(r, function () { return { b: -r.pick([2, 3, 4, 5, 6, 7, 9, 10]), m: r.pick([2, 4]), n: 3 }; }, apOk) || { b: -6, m: 4, n: 3 }); } },
        { id: '5d', level: 'BEG', make: function (r) { return AP(pickWhere(r, function () { return { b: r.pick([2, 3, 5, 6, 7, 8, 10, 12]), m: -1, n: r.pick([3, 4, 5]) }; }, function (o) { return iroot(o.b, o.n) == null && apOk(o); }) || { b: 8, m: -1, n: 5 }); } },
        { id: '5e', level: 'EMG', make: function (r) { return AP(pickWhere(r, function () { return { b: -r.int(2, 9) / 10, m: r.pick([2, 4]), n: 5, outer: -1 }; }, apOk) || { b: -0.5, m: 4, n: 5, outer: -1 }); } }] },
      { num: '6', stem: 'Explain your reasoning.', parts: [
        { id: '6a', level: 'EMG', make: function (r) {
          var c = r.pick([2, 3, 5]), b = Math.pow(c, 4), s = c * c, B = F(b);
          return mc(r, 'Which explanation uses the exponent laws correctly to show that ' + t(B + '^{1/2}=' + s) + ' and ' + t(B + '^{1/4}=' + c) + '?', [
            { html: t(B + '^{1/2}\\cdot ' + B + '^{1/2}=' + B + '^{1}=' + B) + ', so ' + t(B + '^{1/2}') + ' is the number that multiplies by itself to give ' + t(B) + ', which is ' + t(s) + '. Then ' + t(B + '^{1/4}=\\left(' + B + '^{1/2}\\right)^{1/2}=' + s + '^{1/2}=' + c) + '.', right: true },
            { html: t(B + '^{1/2}') + ' means ' + t(B + '\\div 2') + ', and ' + t(B + '^{1/4}') + ' means ' + t(B + '\\div 4') + '.', why: 'Check: ' + t(B + '\\div 2=' + F(b / 2)) + ', not ' + t(s) + '. A fractional exponent isn’t division — by the product law ' + t(B + '^{1/2}\\cdot ' + B + '^{1/2}=' + B + '^{1}') + ', so it is a square root.' },
            { html: 'Since ' + t('\\frac{1}{4}') + ' is half of ' + t('\\frac{1}{2}') + ', ' + t(B + '^{1/4}') + ' is half of ' + t(B + '^{1/2}') + '.', why: 'Halving the exponent doesn’t halve the value. By the power-of-a-power law, ' + t(B + '^{1/4}=\\left(' + B + '^{1/2}\\right)^{1/2}') + ': it is the <b>square root</b> of ' + t(s) + '.' + (c === 2 ? ' (For ' + t('16') + ' the numbers happen to match — try it with ' + t('81') + '.)' : '') },
            { html: 'A fractional exponent works like a negative one: ' + t(B + '^{1/2}=\\frac{1}{' + B + '^{2}}') + '.', why: 'A negative exponent gives a reciprocal; a fractional exponent gives a root. ' + t('\\frac{1}{' + B + '^{2}}') + ' is a tiny number, not ' + t(s) + '.' }],
            'Product law: ' + t(B + '^{1/2}\\cdot ' + B + '^{1/2}=' + B + '^{\\frac12+\\frac12}=' + B + '^{1}=' + B) + ', so ' + t(B + '^{1/2}') + ' is the number that, multiplied by itself, gives ' + t(B) + ': ' + t(B + '^{1/2}=' + s) + '.<br>Power of a power: ' + t(B + '^{1/4}=\\left(' + B + '^{1/2}\\right)^{1/2}=' + s + '^{1/2}=' + c) + '. Check: ' + t(c + '^{4}=' + B) + ' ✓',
            ['What does ' + t(B + '^{1/2}\\cdot ' + B + '^{1/2}') + ' equal by the product law?'], 'why ' + b + '^(1/2) and ' + b + '^(1/4)');
        } },
        { id: '6b', level: 'EMG', make: function (r) {
          var ev = r.pick([[16, 4, 2], [81, 4, 3], [16, 2, 4], [36, 2, 6], [64, 6, 2]]), od = r.pick([[8, 3, 2], [27, 3, 3], [125, 3, 5], [32, 5, 2]]);
          var E = '(-' + ev[0] + ')^{1/' + ev[1] + '}', O = '(-' + od[0] + ')^{1/' + od[1] + '}';
          return mc(r, 'Why does ' + t(E) + ' have no real value, while ' + t(O) + ' does?', [
            { html: 'No real number raised to the power ' + t(ev[1]) + ' (even) is negative, so nothing works for ' + t(E) + '. But ' + t('(-' + od[2] + ')^{' + od[1] + '}=-' + od[0]) + ', so ' + t(O + '=-' + od[2]) + '.', right: true },
            { html: 'A negative base never has a real root; ' + t(O) + ' only works because ' + t(od[0]) + ' is a perfect ' + (od[1] === 3 ? 'cube' : 'fifth power') + '.', why: t(ev[0]) + ' is a perfect power too (' + t(ev[0] + '=' + ev[2] + '^{' + ev[1] + '}') + '). What matters is whether the <b>index</b> is even or odd.' },
            { html: t(E + '=-' + ev[2]) + ' and ' + t(O + '=-' + od[2]) + ', so both have real values.', why: 'Check: ' + t('(-' + ev[2] + ')^{' + ev[1] + '}=' + ev[0]) + ', not ' + t('-' + ev[0]) + '. An even power is never negative.' },
            { html: 'The calculator gives an error for ' + t(E) + ' because ' + t(ev[0]) + ' is bigger than ' + t(od[0]) + '.', why: 'Size has nothing to do with it: ' + t('(-4)^{1/2}') + ' has no real value either, while ' + t('(-1000)^{1/3}=-10') + '. Look at the index.' }],
            t(E) + ' would be a number whose ' + powName(ev[1]) + ' is ' + t('-' + ev[0]) + '. Any real number raised to an even power is ' + t('\\ge 0') + ', so no real number works.<br>' + t(O) + ' needs a number whose ' + powName(od[1]) + ' is ' + t('-' + od[0]) + ': ' + t('(-' + od[2] + ')^{' + od[1] + '}=-' + od[0]) + ', so ' + t(O + '=-' + od[2]) + '. An odd index allows a negative base.',
            ['Try to find a number whose ' + powName(ev[1]) + ' is ' + t('-' + ev[0]) + '. Then one whose ' + powName(od[1]) + ' is ' + t('-' + od[0]) + '.'], 'why ' + E + ' undefined, ' + O + ' defined');
        } }] },
      { num: '7', stem: function (sh) {
          var rt = rootTex(sh.n, sh.B);
          return '<i>(Identify and correct the error)</i> Priya evaluated ' + t(sh.tex) + ' as shown.\\[\\begin{array}{rl}\\text{Line 1:}&' + sh.tex + '=-\\left(' + sh.B + '^{' + sh.m + '/' + sh.n + '}\\right)\\\\\\text{Line 2:}&\\phantom{' + sh.tex + '}=-\\left(' + rt + '\\right)^{' + sh.m + '}\\\\\\text{Line 3:}&\\phantom{' + sh.tex + '}=-' + sh.p + '\\end{array}\\]';
        },
        shared: function (r) { var v = r.pick([[8, 2, 3], [27, 2, 3], [16, 3, 4], [32, 2, 5], [25, 3, 2], [64, 2, 3]]), c = iroot(v[0], v[2]); return { B: v[0], m: v[1], n: v[2], c: c, tex: v[0] + '^{-' + v[1] + '/' + v[2] + '}', p: Math.pow(c, v[1]) }; },
        parts: [
          { id: '7a', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Which line has the error, and what is the mistake?', [
              { html: '<b>Line 1:</b> a negative exponent means <b>reciprocal</b>, not a negative value.', right: true },
              { html: '<b>Line 2:</b> the power should be taken before the root.', why: 'Root first or power first give the same result — line 2 correctly follows from line 1. Look at what happened to the negative exponent.' },
              { html: '<b>Line 3:</b> ' + t('\\left(' + rootTex(sh.n, sh.B) + '\\right)^{' + sh.m + '}') + ' is not ' + t(sh.p) + '.', why: t(rootTex(sh.n, sh.B) + '=' + sh.c) + ' and ' + t(sh.c + '^{' + sh.m + '}=' + sh.p) + ', so that arithmetic is fine.' },
              { html: 'There is no error.', why: 'Check: ' + t(sh.B + '^{-' + sh.m + '/' + sh.n + '}\\cdot ' + sh.B + '^{' + sh.m + '/' + sh.n + '}') + ' should be ' + t(sh.B + '^{0}=1') + ', but ' + t('(-' + sh.p + ')(' + sh.p + ')=-' + sh.p * sh.p) + '.' }],
              '<b>Line 1.</b> A negative exponent means take the <b>reciprocal</b>: ' + t(sh.tex + '=\\frac{1}{' + sh.B + '^{' + sh.m + '/' + sh.n + '}}') + ', not ' + t('-\\left(' + sh.B + '^{' + sh.m + '/' + sh.n + '}\\right)') + '.', ['What does a negative exponent mean: ' + t('a^{-k}=\\,?') ], 'Priya error line, ' + sh.tex, true);
          } },
          { id: '7b', level: 'PRG', make: function (r, sh) { return EV({ base: [sh.B, 1], m: -sh.m, n: sh.n, ask: function (e) { return 'Write a correct solution: what is the exact value of ' + t(e) + '?'; } }); } }] },
      { num: '8', section: 'Part B — Converting Between Powers and Radicals', stem: 'Write an equivalent expression using radicals.', parts: [
        { id: '8a', level: 'BEG', make: function (r) { return genRad('p', 1, r.pick([3, 4, 5, 6, 7, 8, 9]), 'rootFirst'); } },
        { id: '8b', level: 'BEG', make: function (r) { return genRad('q', 1, r.pick([3, 4, 5, 6, 7]), 'rootFirst'); } },
        { id: '8c', level: 'BEG', make: function (r) { return genRad('r', 1, r.pick([5, 6, 7, 8, 9]), 'rootFirst'); } },
        { id: '8d', level: 'EMG', make: function (r) { return genRad('s', -1, r.pick([2, 3, 4, 5, 6]), 'rootFirst'); } },
        { id: '8e', level: 'EMG', make: function (r) { return genRad('t', -1, r.pick([3, 5, 7, 8, 9]), 'rootFirst'); } },
        { id: '8f', level: 'EMG', make: function (r) { var mn = r.pick([[5, 6], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 7], [5, 8]]); return genRad('u', mn[0], mn[1], 'rootFirst'); } },
        { id: '8g', level: 'EMG', make: function (r) { var mn = r.pick([[7, 4], [5, 2], [5, 3], [7, 3], [9, 4], [7, 5], [7, 6], [4, 3]]); return genRad('v', mn[0], mn[1], 'rootFirst'); } },
        { id: '8h', level: 'PRG', make: function (r) {
          var L = r.pick([['w', 'n', 'k'], ['x', 'a', 'b'], ['y', 'm', 'n'], ['z', 'p', 'q']]), v = L[0], a = L[1], b = L[2];
          var pr = v + '^{' + a + '/' + b + '}', tgt = '\\left(\\sqrt[' + b + ']{' + v + '}\\right)^{' + a + '}';
          return convPart(t(pr), tgt, { form: 'radical', cands: [['\\left(\\sqrt[' + a + ']{' + v + '}\\right)^{' + b + '}', 'swap', 'The <b>denominator</b> ' + t(b) + ' is the index of the root and the <b>numerator</b> ' + t(a) + ' is the power — you have them the other way round.'],
            ['\\sqrt[' + b + ']{' + v + '}', 'root-only', 'You have the root; the numerator ' + t(a) + ' is still needed as a power.'], [v + '^{' + a + '}', 'no-root', 'The denominator ' + t(b) + ' means a root with index ' + t(b) + '.']] },
            'The same rule with letters: denominator ' + t(b) + ' → index, numerator ' + t(a) + ' → power.<br>' + t(pr + '=' + tgt) + ' (or ' + t('\\sqrt[' + b + ']{' + v + '^{' + a + '}}') + ').', convHints.slice(0, 1), 'power to radical ' + pr);
        } }] },
      { num: '9', stem: 'Assuming ' + t('x') + ' represents a positive integer, state which <b>two</b> of the following expressions have no meaning.', parts: [
        { id: '9', level: 'EMG', make: function (r) { return q9(r); } }] },
      { num: '10', stem: 'Write each power in radical form.', parts: [
        { id: '10a', level: 'EMG', make: function (r) { var mn = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7]]); return genRad('p', mn[0], mn[1], 'entire'); } },
        { id: '10b', level: 'EMG', make: function (r) { return genRad('q', r.pick([3, 5, 7, 9]), 2, 'entire'); } },
        { id: '10c', level: 'BEG', make: function (r) { return genRad('r', 1, r.pick([4, 5, 6, 7, 8]), 'entire'); } },
        { id: '10d', level: 'PRG', make: function (r) { var mn = r.pick([[3, 4], [2, 3], [3, 5], [2, 5], [5, 6], [4, 7]]); return genRad('s', -mn[0], mn[1], 'entire'); } },
        { id: '10e', level: 'EMG', make: function (r) { return genRad('t', -1, r.pick([3, 4, 5, 6, 7]), 'entire'); } },
        { id: '10f', level: 'PRG', make: function (r) { var mn = r.pick([[4, 5], [2, 3], [3, 4], [2, 5], [5, 7], [3, 2]]); return coefRad('u', r.int(2, 7), mn[0], mn[1]); } },
        { id: '10g', level: 'PRG', make: function (r) { var v = r.pick([[3, 4, 5], [2, 4, 5], [2, 2, 3], [3, 2, 3], [5, 2, 3], [2, 3, 4], [3, 3, 2], [5, 4, 5]]); return bracketRad('u', v[0], v[1], v[2]); } },
        { id: '10h', level: 'PRG', make: function (r) {
          var mn = r.pick([[3, 2], [5, 2], [3, 4], [1, 2], [5, 4]]), m = mn[0], n = mn[1], pr = '-w^{' + expTex(m, n) + '}', tgt = '-' + radOf('w', m, n, 'entire');
          var cands = radCands('w', m, n, 'entire').map(function (c) { return ['-' + c[0], c[1], c[2]]; }).concat([[radOf('w', m, n, 'entire'), 'sign', 'Keep the minus sign: ' + t(pr) + ' means ' + t('-\\left(w^{' + expTex(m, n) + '}\\right)') + ', a negative value.']]);
          return convPart(t(pr), tgt, { form: 'radical', index: n, cands: cands, nanHint: t(pr) + ' means ' + t('-\\left(w^{' + expTex(m, n) + '}\\right)') + ': the exponent belongs to ' + t('w') + ' only, so the minus sign stays <b>outside</b> the radical.' },
            'The exponent belongs to ' + t('w') + ' only; the minus sign is applied afterwards.<br>' + t(pr + '=' + tgt), convHints.slice(0, 1).concat(['Is the minus sign part of the base? Without brackets, it isn’t.']), 'power to radical ' + pr);
        } },
        { id: '10i', level: 'PRG', make: function (r) {
          var mn = r.pick([[3, 2], [5, 2], [1, 2], [3, 4], [1, 4]]), m = mn[0], n = mn[1], pr = '(-w)^{' + expTex(m, n) + '}', tgt = rootTex(n, m === 1 ? '-w' : '(-w)^{' + m + '}');
          var cands = [['(-w)^{' + m + '}', 'no-root', 'The denominator ' + t(n) + ' means a ' + rootName(n) + ' root — your answer has no root.']];
          if (m > 1) cands.push([rootTex(m, '(-w)^{' + n + '}'), 'swap', 'The <b>denominator</b> ' + t(n) + ' is the index of the root and the <b>numerator</b> ' + t(m) + ' is the power.']);
          if (m > 1) cands.push([rootTex(n, '-w'), 'root-only', 'You have the root; the numerator ' + t(m) + ' is still needed as a power.']);
          return convPart(t(pr) + ', where ' + t('w<0'), tgt, { form: 'radical', index: n, neg: ['w'], cands: cands, nanHint: 'Here ' + t('w<0') + ', so ' + t('-w') + ' is <b>positive</b> and the power has a real value. Keep ' + t('(-w)') + ' together as the base under the root.' },
            'Since ' + t('w<0') + ', the base ' + t('-w') + ' is positive, so the power has a real value. The whole bracket ' + t('(-w)') + ' is the base.<br>' + t(pr + '=' + tgt), convHints.slice(0, 1).concat(['The base is the whole bracket ' + t('(-w)') + ' — keep it together under the root.']), 'power to radical ' + pr + ' (w<0)');
        } },
        { id: '10j', level: 'PRG', make: function (r) { var mn = r.pick([[1, 3], [1, 2], [1, 4], [1, 5], [2, 3], [2, 5]]); return coefRad('v', r.int(2, 9), -mn[0], mn[1]); } }] },
      { num: '11', stem: 'Write each radical as a power in the form ' + t('z^{n}') + ', where ' + t('n\\in Q') + '.', parts: [
        { id: '11a', level: 'EMG', make: function (r) { var mn = r.pick([[5, 6], [2, 3], [3, 4], [4, 5], [5, 8], [3, 5]]); return toPowPart('z', mn[0], mn[1], rootTex(mn[1], 'z^{' + mn[0] + '}')); } },
        { id: '11b', level: 'EMG', make: function (r) { var mn = r.pick([[3, 7], [2, 7], [4, 7], [2, 9], [4, 9], [3, 8]]); return toPowPart('z', mn[0], mn[1], rootTex(mn[1], 'z^{' + mn[0] + '}')); } },
        { id: '11c', level: 'EMG', make: function (r) { var m = r.pick([5, 7, 9, 11, 13]); return toPowPart('z', m, 2, '\\sqrt{z^{' + m + '}}'); } },
        { id: '11d', level: 'EMG', make: function (r) { var n = r.pick([3, 4, 5, 6, 7]); return toPowPart('z', -1, n, '\\dfrac{1}{' + rootTex(n, 'z') + '}'); } },
        { id: '11e', level: 'PRG', make: function (r) { var mn = r.pick([[4, 5], [2, 3], [3, 4], [2, 5], [3, 5], [5, 6]]); return toPowPart('z', -mn[0], mn[1], '\\dfrac{1}{' + rootTex(mn[1], 'z^{' + mn[0] + '}') + '}'); } }] },
      { num: '12', stem: 'In each case, write the given number as a power with the given exponent.', parts: [
        { id: '12a', level: 'EMG', make: function (r) { var v = r.int(3, 12), B = v * v; return asPowerPart([v, 1], [1, 2], [B, 1], 'A square root undoes squaring: ' + t(v + '^{2}=' + B) + ', so ' + t(B + '^{1/2}=\\sqrt{' + B + '}=' + v) + '.<br>' + t(v + '=' + B + '^{1/2}'), ['Which number has a square root of ' + t(v) + '?'], v + ' as a power with exponent 1/2'); } },
        { id: '12b', level: 'PRG', make: function (r) { var v = r.int(2, 5), B = Math.pow(v, 4); return asPowerPart([v, 1], [1, 4], [B, 1], t(v + '^{4}=' + B) + ', so ' + t(B + '^{1/4}=' + rootTex(4, B) + '=' + v) + '.<br>' + t(v + '=' + B + '^{1/4}'), ['Which number has a fourth root of ' + t(v) + '? Raise ' + t(v) + ' to the power ' + t(4) + '.'], v + ' as a power with exponent 1/4'); } },
        { id: '12c', level: 'PRG', make: function (r) { var v = r.int(2, 6), B = -v * v * v; return asPowerPart([-v, 1], [1, 3], [B, 1], 'An odd root of a negative number is negative: ' + t('(-' + v + ')^{3}=' + B) + ', so ' + t('(' + B + ')^{1/3}=' + rootTex(3, B) + '=-' + v) + '.<br>' + t('-' + v + '=(' + B + ')^{1/3}'), ['Cube ' + t('-' + v) + '. Keep the negative base in brackets.'], '-' + v + ' as a power with exponent 1/3'); } },
        { id: '12d', level: 'ADV', make: function (r) { var v = r.int(3, 10), B = v * v; return asPowerPart([1, v], [-1, 2], [B, 1], 'We need ' + t('b^{-1/2}=\\frac{1}{' + v + '}') + ', i.e. ' + t('\\frac{1}{\\sqrt{b}}=\\frac{1}{' + v + '}') + ', so ' + t('\\sqrt{b}=' + v) + ' and ' + t('b=' + B) + '.<br>' + t('\\frac{1}{' + v + '}=' + B + '^{-1/2}') + ' (check: ' + t('\\frac{1}{\\sqrt{' + B + '}}=\\frac{1}{' + v + '}') + ' ✓)', ['A negative exponent means reciprocal: ' + t('b^{-1/2}=\\frac{1}{\\sqrt{b}}') + '. What must ' + t('\\sqrt{b}') + ' be?'], '1/' + v + ' as a power with exponent -1/2'); } },
        { id: '12e', level: 'ADV', make: function (r) { var v = r.pick([2, 3, 4, 5, 8, 10]), B = v * v * v; return asPowerPart([v, 1], [-1, 3], [1, B], 'We need ' + t('b^{-1/3}=' + v) + ', i.e. ' + t('b^{1/3}=\\frac{1}{' + v + '}') + ', so ' + t('b=\\frac{1}{' + F(B) + '}') + '.<br>' + t(v + '=\\left(\\frac{1}{' + F(B) + '}\\right)^{-1/3}') + ' (check: ' + t('\\left(\\frac{1}{' + F(B) + '}\\right)^{-1/3}=' + F(B) + '^{1/3}=' + v) + ' ✓)', ['The negative exponent flips the base. Which fraction, flipped and cube-rooted, gives ' + t(v) + '?'], v + ' as a power with exponent -1/3'); } },
        { id: '12f', level: 'ADV', make: function (r) { var a = r.pick([[2, 3, 4], [3, 3, 4], [10, 3, 4], [2, 2, 3], [5, 2, 3], [10, 2, 3], [3, 2, 5]]), c = a[0], m = a[1], n = a[2], V = Math.pow(c, m), B = Math.pow(c, n);
          return asPowerPart([V, 1], [m, n], [B, 1], 'We need ' + t('b^{' + m + '/' + n + '}=' + F(V)) + ', i.e. ' + t('\\left(' + rootTex(n, 'b') + '\\right)^{' + m + '}=' + F(V)) + '. Since ' + t(c + '^{' + m + '}=' + F(V)) + ', ' + t(rootTex(n, 'b') + '=' + c) + ', so ' + t('b=' + c + '^{' + n + '}=' + F(B)) + '.<br>' + t(F(V) + '=' + F(B) + '^{' + m + '/' + n + '}') + ' (check: ' + t('\\left(' + rootTex(n, F(B)) + '\\right)^{' + m + '}=' + c + '^{' + m + '}=' + F(V)) + ' ✓)',
            ['First find the number whose ' + nth(m) + ' is ' + t(F(V)) + ' — that is the ' + rootName(n) + ' root of the base.'], F(V).replace(/\\,/g, ' ') + ' as a power with exponent ' + m + '/' + n); } }] },
      { num: '13', section: 'Part C — Solving Problems with Rational Exponents', stem: function (sh) { return 'A cube has a volume of ' + t(F(sh.V) + '\\text{ cm}^{3}') + '.'; },
        shared: function (r) { var s = r.pick([4, 5, 6, 7, 8, 8, 9, 10, 11, 12]); return { s: s, V: s * s * s }; },
        parts: [
          { id: '13a', level: 'EMG', make: function (r, sh) {
            var V = sh.V, VT = F(V);
            var p = P.math('Write a power that represents the edge length of the cube.', powOfCheck(V, sh.s, [
              { v: Math.sqrt(V), code: 'square-root', hint: 'The volume of a cube is ' + t('(\\text{edge})^{3}') + ', so the edge is the <b>cube</b> root: use the exponent ' + t('\\frac{1}{3}') + '.' },
              { v: V / 3, code: 'times-exp', hint: 'Dividing by 3 doesn’t undo cubing. The edge is the cube root of the volume.' },
              { v: Math.pow(V, 3), code: 'no-root', hint: 'That cubes the volume. The edge is the cube <b>root</b> of the volume.' }], true), VT + '^{1/3}',
              t('V=(\\text{edge})^{3}') + ', so the edge is the cube root of the volume: ' + t('\\text{edge}=' + VT + '^{1/3}') + ' cm.', ['Volume of a cube = ' + t('(\\text{edge})^{3}') + '. Which exponent undoes cubing?'], 'cube edge power, V=' + V, { keys: 'expo', vars: [], before: t('\\text{edge}=') });
            p.good = [V + '^(1/3)']; p.bad = [String(sh.s), V + '^{1/2}'];
            return p;
          } },
          { id: '13b', level: 'PRG', make: function (r, sh) {
            var V = sh.V, VT = F(V), SA = 6 * sh.s * sh.s;
            var p = P.math('Write a power that represents the surface area of the cube.', powOfCheck(V, SA, [
              { v: sh.s * sh.s, code: 'six-faces', hint: 'That’s the area of <b>one</b> face. A cube has ' + t('6') + ' faces.' },
              { v: 6 * sh.s, code: 'not-squared', hint: 'Each face is a square with area ' + t('(\\text{edge})^{2}') + ': square the edge before multiplying by ' + t('6') + '.' },
              { v: 4 * sh.s * sh.s, code: 'six-faces', hint: 'Count the faces of a cube: there are ' + t('6') + '.' },
              { v: 6 * Math.pow(V, 1.5), code: 'swap', hint: 'Each face has area ' + t('\\left(' + VT + '^{1/3}\\right)^{2}=' + VT + '^{2/3}') + ' — check your exponent.' }], true), '6\\left(' + VT + '^{1/3}\\right)^{2}',
              'Six square faces, each of area ' + t('(\\text{edge})^{2}') + ':<br>' + t('\\text{SA}=6\\left(' + VT + '^{1/3}\\right)^{2}=6\\cdot ' + VT + '^{2/3}') + ' cm².', ['A cube has 6 square faces. Write the edge as a power first, then square it.'], 'cube SA power, V=' + V, { keys: 'expo', vars: [], before: t('\\text{SA}=') });
            p.good = ['6*' + V + '^(2/3)', '6(' + V + '^(1/3))^2']; p.bad = [String(SA), V + '^{2/3}', '6\\cdot ' + V + '^{1/3}'];
            return p;
          } },
          { id: '13c', level: 'PRG', make: function (r, sh) {
            var s = sh.s, V = sh.V, VT = F(V), SA = 6 * s * s;
            var p = P.fields('Calculate the exact edge length and surface area of the cube.', [{ name: 'Edge', label: 'edge', before: t('='), after: 'cm' }, { name: 'Surface area', label: 'surface area', before: t('='), after: t('\\text{cm}^{2}') }],
              [K.number(s, function (v) { return near(v, Math.sqrt(V)) || near(v, K.roundTo(Math.sqrt(V), 2)) ? { code: 'square-root', hint: 'Use the <b>cube</b> root: ' + t(VT + '^{1/3}=' + rootTex(3, VT)) + '.' } : v === V / 3 ? { code: 'times-exp', hint: 'The cube root isn’t dividing by 3. Which number cubed gives ' + t(VT) + '?' } : null; }),
                K.number(SA, function (v) { return v === s * s ? { code: 'six-faces', hint: 'That’s one face. A cube has ' + t('6') + ' faces.' } : v === 6 * s ? { code: 'not-squared', hint: 'Each face has area ' + t('(\\text{edge})^{2}') + '.' } : v === 4 * s * s ? { code: 'six-faces', hint: 'A cube has ' + t('6') + ' faces, not 4.' } : null; })],
              [String(s), String(SA)], 'edge ' + t(s + '\\text{ cm}') + ', surface area ' + t(F(SA) + '\\text{ cm}^{2}'),
              t('\\text{edge}=' + VT + '^{1/3}=' + rootTex(3, VT) + '=' + s) + ' cm exactly (' + t(s + '^{3}=' + VT) + ').<br>' + t(VT + '^{2/3}=' + s + '^{2}=' + s * s) + ', so ' + t('\\text{SA}=6(' + s * s + ')=' + F(SA)) + ' cm².',
              ['Which whole number cubed gives ' + t(VT) + '?', 'Surface area = ' + t('6\\times(\\text{edge})^{2}') + '.'], 'cube edge and SA, V=' + V);
            p.bad = [[String(s), String(s * s)], [String(s + 1), String(SA)]];
            return p;
          } }] },
      { num: '14', stem: function (sh) { return 'A cube has a volume of ' + t(sh.L + '\\text{ cm}^{3}') + '.'; },
        shared: function (r) { return { L: r.pick(['W', 'W', 'V', 'k', 'Q']) }; },
        parts: [
          { id: '14a', level: 'EMG', make: function (r, sh) {
            var L = sh.L, pw = L + '^{1/3}', rd = rootTex(3, L);
            var p = P.fields('Write a power <b>and</b> a radical that represent the edge length of the cube.', [{ name: 'Power', label: 'power: edge', before: t('='), mode: 'math', keys: 'expo', vars: [L] }, { name: 'Radical', label: 'radical: edge', before: t('='), mode: 'math', keys: 'expo', vars: [L] }],
              [convCheck(pw, { form: 'power', single: L + '^{n}', needRat: true, cands: [[L + '^{1/2}', 'square-root', 'Volume = ' + t('(\\text{edge})^{3}') + ', so the edge is a <b>cube</b> root: exponent ' + t('\\frac{1}{3}') + '.'], ['\\frac{' + L + '}{3}', 'times-exp', 'Dividing by 3 doesn’t undo cubing — use the exponent ' + t('\\frac{1}{3}') + '.'], [L + '^{3}', 'no-root', 'That cubes the volume. The edge is the cube <b>root</b>.']] }),
                convCheck(rd, { form: 'radical', index: 3, cands: [['\\sqrt{' + L + '}', 'square-root', 'Use a <b>cube</b> root (index 3): ' + t(rootTex(3, L)) + '.'], ['\\frac{' + L + '}{3}', 'times-exp', 'The cube root isn’t dividing by 3.']] })],
              [pw, rd], 'edge ' + t('=' + pw + '=' + rd), t('V=(\\text{edge})^{3}') + ', so ' + t('\\text{edge}=' + pw + '=' + rd) + '.', ['Volume = ' + t('(\\text{edge})^{3}') + '. Which exponent undoes cubing?'], 'edge of cube volume ' + L);
            p.bad = [[L + '^{1/2}', rd], [pw, '\\sqrt{' + L + '}']];
            return p;
          } },
          { id: '14b', level: 'PRG', make: function (r, sh) {
            var L = sh.L, pw = L + '^{2/3}', rd = '\\left(' + rootTex(3, L) + '\\right)^{2}';
            var c1 = [[L + '^{3/2}', 'swap', 'Edge ' + t('=' + L + '^{1/3}') + '; one face is the edge <b>squared</b>: ' + t('\\left(' + L + '^{1/3}\\right)^{2}') + '. Multiply the exponents.'], ['6' + L + '^{2/3}', 'all-faces', 'That’s all six faces. The question asks for the area of <b>one</b> face.'], [L + '^{1/3}', 'not-squared', 'That’s the edge. A face is a square: square the edge.'], [L + '^{2}', 'no-root', 'The edge is ' + t(L + '^{1/3}') + ', not ' + t(L) + '. Square the edge.']];
            var c2 = [[rootTex(2, L + '^{3}'), 'swap', 'Edge ' + t('=' + rootTex(3, L)) + '; square it: ' + t('\\left(' + rootTex(3, L) + '\\right)^{2}') + '.'], ['6\\left(' + rootTex(3, L) + '\\right)^{2}', 'all-faces', 'That’s all six faces — the question asks for one face.'], [rootTex(3, L), 'not-squared', 'That’s the edge. Square it for the area of a face.']];
            var p = P.fields('Write a power <b>and</b> a radical that represent the area of one face of the cube.', [{ name: 'Power', label: 'power: area', before: t('='), mode: 'math', keys: 'expo', vars: [L] }, { name: 'Radical', label: 'radical: area', before: t('='), mode: 'math', keys: 'expo', vars: [L] }],
              [convCheck(pw, { form: 'power', single: L + '^{n}', needRat: true, cands: c1 }), convCheck(rd, { form: 'radical', index: 3, cands: c2 })],
              [pw, rd], 'area ' + t('=' + pw + '=' + rd + '=' + rootTex(3, L + '^{2}')), 'One face is a square with side ' + t(L + '^{1/3}') + ':<br>' + t('\\text{area}=\\left(' + L + '^{1/3}\\right)^{2}=' + pw + '=' + rd) + ' (or ' + t(rootTex(3, L + '^{2}')) + ').',
              ['A face is a square whose side is the edge. Square the edge from part (a).'], 'face area of cube volume ' + L);
            p.bad = [[L + '^{3/2}', rd], [pw, rootTex(3, L)]];
            return p;
          } }] },
      { num: '15', stem: 'The volume of a sphere is ' + t('V=\\frac{4}{3}\\pi r^{3}') + ', so its radius is ' + t('r=\\left(\\frac{3V}{4\\pi}\\right)^{1/3}') + '.', parts: [
        { id: '15a', level: 'EMG', make: function (r) {
          return mc(r, 'Which is the radius formula written in radical form?', [
            { html: t('r=\\sqrt[3]{\\frac{3V}{4\\pi}}'), right: true },
            { html: t('r=\\sqrt{\\frac{3V}{4\\pi}}'), why: 'The exponent is ' + t('\\frac{1}{3}') + ', so the index of the root is ' + t('3') + ', not ' + t('2') + '.' },
            { html: t('r=\\frac{\\sqrt[3]{3V}}{4\\pi}'), why: 'The exponent applies to the whole fraction (it’s in brackets), so the root covers the top <b>and</b> the bottom.' },
            { html: t('r=\\left(\\frac{3V}{4\\pi}\\right)^{3}'), why: 'An exponent of ' + t('\\frac{1}{3}') + ' is a cube <b>root</b>, not a cube.' }],
            'The denominator ' + t('3') + ' is the index, and the exponent applies to the whole bracket: ' + t('r=\\left(\\frac{3V}{4\\pi}\\right)^{1/3}=\\sqrt[3]{\\frac{3V}{4\\pi}}') + '.', ['Exponent ' + t('\\frac{1}{3}') + ' → which root? What does the bracket tell you?'], 'sphere radius in radical form', false);
        } },
        { id: '15b', level: 'PRG', make: function (r) {
          var rr = r.pick([3, 3, 6, 9, 12]), k = 4 * rr * rr * rr / 3, q = 3 * k / 4;
          var p = P.math('A ball bearing has a volume of ' + t(F(k) + '\\pi\\text{ mm}^{3}') + '. Find its exact radius (in mm).', K.fraction([rr, 1], { diag: function (v) {
            if (near(v, q)) return { code: 'no-root', hint: 'You found ' + t('\\frac{3V}{4\\pi}=' + F(q)) + '. Now take its cube root (the exponent ' + t('\\frac{1}{3}') + ').' };
            if (Math.abs(v - Math.sqrt(q)) < 0.01) return { code: 'square-root', hint: 'The exponent ' + t('\\frac{1}{3}') + ' means a <b>cube</b> root.' };
            if (near(v, Math.cbrt(3 * k / (4 * Math.PI))) || near(v, K.roundTo(Math.cbrt(3 * k / (4 * Math.PI)), 2))) return { code: 'no-pi', hint: 'The volume is ' + t(F(k) + '\\pi') + ' — include the ' + t('\\pi') + '. It cancels with the ' + t('\\pi') + ' in the denominator.' };
            return null;
          } }), String(rr), t('r=\\left(\\frac{3(' + F(k) + '\\pi)}{4\\pi}\\right)^{1/3}=\\left(\\frac{' + F(3 * k) + '}{4}\\right)^{1/3}=' + F(q) + '^{1/3}=' + rr) + ' mm, since ' + t(rr + '^{3}=' + F(q)) + '.',
          ['Substitute ' + t('V=' + F(k) + '\\pi') + '. The ' + t('\\pi') + ' cancels.', 'Which whole number cubed gives ' + t(F(q)) + '?'], 'sphere radius, V=' + k + 'π', { keys: 'fraction', before: t('r=') });
          p.answer = t(rr + '\\text{ mm}'); p.bad = [String(q), String(Math.sqrt(q))];
          return p;
        } },
        { id: '15c', level: 'EMG', make: function (r) {
          var V = pickWhere(r, function () { return 500 * r.int(2, 18); }, function (v) { return roundSafe(Math.cbrt(3 * v / (4 * Math.PI)), 1); }) || 4000, x = Math.cbrt(3 * V / (4 * Math.PI));
          var cands = [{ v: Math.cbrt(3 * V / 4), code: 'no-pi', hint: 'Don’t forget the ' + t('\\pi') + ' in the denominator: ' + t('\\frac{3V}{4\\pi}') + '.' }, { v: Math.sqrt(3 * V / (4 * Math.PI)), code: 'square-root', hint: 'The exponent is ' + t('\\frac{1}{3}') + ': a <b>cube</b> root.' },
            { v: 3 * V / (4 * Math.PI), code: 'no-root', hint: 'You found ' + t('\\frac{3V}{4\\pi}') + '. Now take the cube root.' }, { v: Math.cbrt(4 * Math.PI * V / 3), code: 'flip', hint: 'The formula is ' + t('\\left(\\frac{3V}{4\\pi}\\right)^{1/3}') + ': ' + t('3V') + ' on top, ' + t('4\\pi') + ' on the bottom.' }];
          var p = P.approx('A weather balloon holds ' + t(F(V) + '\\text{ m}^{3}') + ' of gas. Find its radius to the nearest tenth of a metre.', x, 1, { after: 'm', diag: function (v) { for (var i = 0; i < cands.length; i++) if (Math.abs(v - K.roundTo(cands[i].v, 1)) < 1e-9) return { code: cands[i].code, hint: cands[i].hint }; return null; } },
            t('r=\\left(\\frac{3(' + F(V) + ')}{4\\pi}\\right)^{1/3}=\\left(' + (3 * V / (4 * Math.PI)).toFixed(2) + '\\ldots\\right)^{1/3}\\approx ' + K.roundTo(x, 1).toFixed(1)) + ' m',
            ['Substitute ' + t('V=' + F(V)) + ' and evaluate ' + t('\\left(\\frac{3V}{4\\pi}\\right)^{1/3}') + '. Put the exponent in brackets: <code>^(1/3)</code>.'], 'balloon radius, V=' + V);
          p.bad = cands.map(function (c) { return K.roundTo(c.v, 1).toFixed(1); }).filter(function (b) { return b !== K.roundTo(x, 1).toFixed(1); });
          return p;
        } }] },
      { num: '16', stem: function (sh) { return 'A bacteria culture starts with ' + t(sh.P0) + ' cells and doubles every ' + t(sh.d) + ' hours, so the number of cells after ' + t('t') + ' hours is ' + t('P=' + sh.P0 + '(2)^{t/' + sh.d + '}') + '.'; },
        shared: function (r) {
          return pickWhere(r, function () { var d = r.pick([3, 3, 4, 5]), P0 = r.pick([200, 300, 400, 500, 500, 800]), t1 = r.pick(d === 3 ? [1, 2] : d === 4 ? [1, 3] : [2, 3]), k = r.pick([3, 5]); return { d: d, P0: P0, t1: t1, k: k, t2: k * d / 2 }; },
            function (s) { return roundSafe(s.P0 * Math.pow(2, s.t1 / s.d), 0) && roundSafe(s.P0 * Math.pow(2, s.k / 2), 0); }) || { d: 3, P0: 500, t1: 2, k: 3, t2: 4.5 };
        },
        parts: [
          { id: '16a', level: 'PRG', make: function (r, sh) {
            var e = sh.t1 + '/' + sh.d, two = Math.pow(2, sh.t1), pw = sh.P0 + '(2)^{' + e + '}', rd = sh.P0 + rootTex(sh.d, two);
            var p = P.fields('Write the number of cells after ' + t(sh.t1) + ' hour' + (sh.t1 > 1 ? 's' : '') + ' using a rational exponent, and then in radical form.', [{ name: 'Rational exponent', label: 'rational exponent: ' + t('P'), before: t('='), mode: 'math', keys: 'expo', vars: [] }, { name: 'Radical form', label: 'radical form: ' + t('P'), before: t('='), mode: 'math', keys: 'expo', vars: [] }],
              [convCheck(pw, { form: 'power', needRat: true, cands: [[sh.P0 + '(2)^{' + sh.d + '/' + sh.t1 + '}', 'swap', 'Substitute ' + t('t=' + sh.t1) + ' into ' + t('\\frac{t}{' + sh.d + '}') + ': the exponent is ' + t('\\frac{' + sh.t1 + '}{' + sh.d + '}') + '.'], ['(' + 2 * sh.P0 + ')^{' + e + '}', 'base', 'Only the ' + t('2') + ' is raised to the power; the ' + t(sh.P0) + ' multiplies afterwards.']] }),
                convCheck(rd, { form: 'radical', index: sh.d, cands: [[sh.P0 + rootTex(sh.d, '2'), 'root-only', 'The numerator ' + t(sh.t1) + ' is a power: ' + t('2^{' + e + '}=' + rootTex(sh.d, '2^{' + sh.t1 + '}')) + '.'], [rootTex(sh.d, sh.P0 + '\\cdot ' + two), 'coef-inside', 'Only the ' + t('2') + ' goes under the root; ' + t(sh.P0) + ' stays outside.']] })],
              [pw, rd], t('P=' + pw + '=' + rd), t('P=' + sh.P0 + '(2)^{' + sh.t1 + '/' + sh.d + '}') + '. Denominator ' + t(sh.d) + ' → index, numerator ' + t(sh.t1) + ' → power:<br>' + t(sh.P0 + '(2)^{' + e + '}=' + (sh.t1 > 1 ? sh.P0 + rootTex(sh.d, '2^{' + sh.t1 + '}') + '=' : '') + rd),
              ['Substitute ' + t('t=' + sh.t1) + ' into the exponent ' + t('\\frac{t}{' + sh.d + '}') + '.', 'Only the ' + t('2') + ' is raised to the power.'], 'bacteria power and radical, t=' + sh.t1);
            p.bad = [[sh.P0 + '(2)^{' + sh.d + '/' + sh.t1 + '}', rd], [pw, String(Math.round(sh.P0 * Math.pow(2, sh.t1 / sh.d)))]];
            return p;
          } },
          { id: '16b', level: 'EMG', make: function (r, sh) {
            var x = sh.P0 * Math.pow(2, sh.t1 / sh.d), e = sh.t1 + '/' + sh.d;
            var cands = [{ v: sh.P0 * Math.pow(2, sh.t1) / sh.d, code: 'no-brackets', hint: 'Put the exponent in brackets: <code>2^(' + e + ')</code>.' }, { v: Math.pow(2 * sh.P0, sh.t1 / sh.d), code: 'base', hint: 'Only the ' + t('2') + ' is raised to the power: work out ' + t('2^{' + e + '}') + ', then multiply by ' + t(sh.P0) + '.' }, { v: sh.P0 * 2 * sh.t1 / sh.d, code: 'times-exp', hint: 'The exponent isn’t a multiplier: use the ' + t('\\wedge') + ' key for ' + t('2^{' + e + '}') + '.' }];
            var p = P.approx('Evaluate your answer to (a) to the nearest whole number of cells.', x, 0, { after: 'cells', diag: function (v) { for (var i = 0; i < cands.length; i++) if (Math.abs(v - Math.round(cands[i].v)) < 1e-9) return { code: cands[i].code, hint: cands[i].hint }; return null; } },
              t(sh.P0 + '(2)^{' + e + '}\\approx ' + sh.P0 + '(' + Math.pow(2, sh.t1 / sh.d).toFixed(4) + ')\\approx ' + F(Math.round(x))) + ' cells', ['Type <code>' + sh.P0 + '×2^(' + e + ')</code> — exponent in brackets.'], 'bacteria value, t=' + sh.t1);
            p.answer = t(F(Math.round(x))); p.bad = cands.map(function (c) { return String(Math.round(c.v)); }).filter(function (b) { return b !== String(Math.round(x)); });
            return p;
          } },
          { id: '16c', level: 'EMG', make: function (r, sh) {
            var x = sh.P0 * Math.pow(2, sh.k / 2), e = sh.k + '/2';
            var cands = [{ v: sh.P0 * Math.pow(2, sh.t2), code: 'no-root', hint: 'Use the formula: the exponent is ' + t('\\frac{t}{' + sh.d + '}=\\frac{' + sh.t2 + '}{' + sh.d + '}') + ', not ' + t(sh.t2) + '.' }, { v: sh.P0 * Math.pow(2, sh.d / sh.t2), code: 'swap', hint: 'The exponent is ' + t('\\frac{t}{' + sh.d + '}') + ' with ' + t('t=' + sh.t2) + ' on top.' }, { v: sh.P0 * 2 * sh.t2 / sh.d, code: 'times-exp', hint: 'The exponent isn’t a multiplier: raise ' + t('2') + ' to the power ' + t('\\frac{' + sh.t2 + '}{' + sh.d + '}') + '.' }, { v: Math.pow(2 * sh.P0, sh.k / 2), code: 'base', hint: 'Only the ' + t('2') + ' is raised to the power.' }];
            var p = P.approx('How many cells are there after ' + t(sh.t2) + ' hours, to the nearest whole number?', x, 0, { after: 'cells', diag: function (v) { for (var i = 0; i < cands.length; i++) if (Math.abs(v - Math.round(cands[i].v)) < 1e-9) return { code: cands[i].code, hint: cands[i].hint }; return null; } },
              t('\\frac{' + sh.t2 + '}{' + sh.d + '}=\\frac{' + sh.k + '}{2}') + ', so ' + t('P=' + sh.P0 + '(2)^{' + e + '}=' + sh.P0 + '\\sqrt{2^{' + sh.k + '}}\\approx ' + F(Math.round(x))) + ' cells.', ['Substitute ' + t('t=' + sh.t2) + ' and simplify the exponent ' + t('\\frac{' + sh.t2 + '}{' + sh.d + '}') + ' first.'], 'bacteria after ' + sh.t2 + ' h');
            p.answer = t(F(Math.round(x))); p.bad = cands.map(function (c) { return String(Math.round(c.v)); }).filter(function (b) { return b !== String(Math.round(x)); });
            return p;
          } }] },
      { num: '17', stem: 'A square garden has an area of ' + t('A\\text{ m}^{2}') + '.', parts: [
        { id: '17a', level: 'EMG', make: function (r) {
          var p = P.fields('Write the side length as a power and as a radical.', [{ name: 'Power', label: 'power: side', before: t('='), mode: 'math', keys: 'expo', vars: ['A'] }, { name: 'Radical', label: 'radical: side', before: t('='), mode: 'math', keys: 'expo', vars: ['A'] }],
            [convCheck('A^{1/2}', { form: 'power', single: 'A^{n}', needRat: true, cands: [['\\frac{A}{2}', 'times-exp', 'Halving isn’t a square root. Area = ' + t('(\\text{side})^{2}') + ', so the side is ' + t('A^{1/2}') + '.'], ['\\frac{A}{4}', 'four-sides', 'Dividing by 4 gives a quarter of the area, not the side. The side is the square root of the area.'], ['A^{2}', 'no-root', 'Area = ' + t('(\\text{side})^{2}') + ', so undo squaring with the exponent ' + t('\\frac{1}{2}') + '.']] }),
              convCheck('\\sqrt{A}', { form: 'radical', index: 2, cands: [['\\frac{A}{2}', 'times-exp', 'Use a square root: ' + t('\\sqrt{A}') + '.']] })],
            ['A^{1/2}', '\\sqrt{A}'], 'side ' + t('=A^{1/2}=\\sqrt{A}'), 'Area ' + t('=(\\text{side})^{2}') + ', so ' + t('\\text{side}=A^{1/2}=\\sqrt{A}') + '.', ['Which exponent undoes squaring?'], 'square side from area A');
          p.bad = [['A/2', '\\sqrt{A}'], ['A^{1/2}', 'A^{1/2}']];
          return p;
        } },
        { id: '17b', level: 'EMG', make: function (r) {
          var A = pickWhere(r, function () { return r.int(20, 150); }, function (a) { return iroot(a, 2) == null && roundSafe(4 * Math.sqrt(a), 1); }) || 50, x = 4 * Math.sqrt(A);
          var cands = [{ v: Math.sqrt(A), code: 'four-sides', hint: 'That’s one side. The fencing goes around all ' + t('4') + ' sides.' }, { v: 2 * Math.sqrt(A), code: 'four-sides', hint: 'A square has ' + t('4') + ' sides: perimeter ' + t('=4\\times\\text{side}') + '.' }, { v: Math.sqrt(4 * A), code: 'four-sides', hint: 'Find the side first (' + t('\\sqrt{' + A + '}') + '), then multiply by ' + t('4') + '.' }, { v: A / 4, code: 'times-exp', hint: 'The side is ' + t('\\sqrt{' + A + '}') + ', not a quarter of the area.' }];
          var p = P.approx('The area is ' + t(A + '\\text{ m}^{2}') + '. How much fencing goes all the way around? Answer to the nearest tenth of a metre.', x, 1, { after: 'm', diag: function (v) { for (var i = 0; i < cands.length; i++) if (Math.abs(v - K.roundTo(cands[i].v, 1)) < 1e-9) return { code: cands[i].code, hint: cands[i].hint }; return null; } },
            'Side ' + t('=' + A + '^{1/2}=\\sqrt{' + A + '}') + '. Perimeter ' + t('=4\\cdot ' + A + '^{1/2}=4\\sqrt{' + A + '}\\approx ' + K.roundTo(x, 1).toFixed(1)) + ' m.', ['Find the side length first, then the perimeter of the square.'], 'fencing for area ' + A);
          p.bad = cands.map(function (c) { return K.roundTo(c.v, 1).toFixed(1); }).filter(function (b) { return b !== K.roundTo(x, 1).toFixed(1); });
          return p;
        } },
        { id: '17c', level: 'EMG', make: function (r) {
          var k = r.pick([4, 4, 9, 16, 25, 100]), s = Math.sqrt(k);
          return mc(r, 'The area is made ' + t(k) + ' times as large. What happens to the side length?', [
            { html: t('(' + k + 'A)^{1/2}=' + k + '^{1/2}A^{1/2}=' + s + 'A^{1/2}') + ': the side is multiplied by ' + t(s) + '.', right: true },
            { html: t('(' + k + 'A)^{1/2}=' + k + 'A^{1/2}') + ': the side is multiplied by ' + t(k) + '.', why: 'Power of a product: the exponent ' + t('\\frac{1}{2}') + ' applies to the ' + t(k) + ' too, so ' + t(k + '^{1/2}=' + s) + '.' },
            { html: t('(' + k + 'A)^{1/2}=' + k + '^{1/2}+A^{1/2}') + ': the side increases by ' + t(s) + '.', why: 'The exponent distributes over a <b>product</b> as a product: ' + t('(ab)^{1/2}=a^{1/2}b^{1/2}') + ', not a sum.' },
            { html: t('(' + k + 'A)^{1/2}=' + k * k + 'A^{1/2}') + ': the side is multiplied by ' + t(k * k) + '.', why: 'An exponent of ' + t('\\frac{1}{2}') + ' takes a square root of the ' + t(k) + '; it doesn’t square it.' }],
            'New side ' + t('=(' + k + 'A)^{1/2}=' + k + '^{1/2}A^{1/2}=' + s + 'A^{1/2}') + ' (power of a product). The side is multiplied by ' + t(s) + '.', ['Apply the exponent ' + t('\\frac{1}{2}') + ' to each factor of ' + t(k + 'A') + '.'], 'area ×' + k + ' → side', false);
        } }] },
      { num: '18', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '18a', level: 'EMG', make: function (r) {
          var ab = r.pick([[4, 9], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [4, 7], [6, 7], [5, 8], [7, 8], [5, 9], [7, 9]]); if (r.chance(0.3)) ab = [ab[1], ab[0]];
          var a = ab[0], b = ab[1], A = a * a, B = b * b, w = ex.norm(B, 2 * A);
          return mc(r, t('\\left(\\frac{' + A + '}{' + B + '}\\right)^{-0.5}') + ' is equal to', [
            { html: t('\\frac{' + b + '}{' + a + '}'), right: true },
            { html: t('\\frac{' + a + '}{' + b + '}'), why: 'The exponent is <b>negative</b>: flip the fraction first.' },
            { html: t('-\\frac{' + a + '}{' + b + '}'), why: 'A negative exponent means reciprocal, not a negative answer.' },
            { html: t(ex.texRat(w)), why: t('0.5') + ' isn’t a multiplier: an exponent of ' + t('0.5=\\frac{1}{2}') + ' means a square root.' }],
            t('\\left(\\frac{' + A + '}{' + B + '}\\right)^{-0.5}=\\left(\\frac{' + B + '}{' + A + '}\\right)^{1/2}=\\frac{\\sqrt{' + B + '}}{\\sqrt{' + A + '}}=\\frac{' + b + '}{' + a + '}'), ['Negative exponent → flip the fraction. ' + t('0.5=\\frac{1}{2}') + ' → square root.'], '(' + A + '/' + B + ')^-0.5');
        } },
        { id: '18b', level: 'PRG', make: function (r) {
          var v = r.pick([[3, 4, 3], [2, 4, 3], [5, 2, 3], [4, 2, 3], [2, 2, 5], [2, 4, 5], [3, 3, 3], [2, 3, 3]]), c = v[0], m = v[1], n = v[2], C = Math.pow(c, n), val = (m % 2 ? -1 : 1) * Math.pow(c, m);
          var bt = '\\left(-\\frac{1}{' + C + '}\\right)^{-' + m + '/' + n + '}';
          return mc(r, t(bt) + ' is equal to', [
            { html: t(val), right: true },
            { html: t(-val), why: m % 2 ? 'The ' + rootName(n) + ' root of ' + t('-\\frac{1}{' + C + '}') + ' is ' + t('-\\frac{1}{' + c + '}') + ', and the odd power ' + t(m) + ' keeps it negative.' : 'The ' + rootName(n) + ' root of ' + t('-\\frac{1}{' + C + '}') + ' is negative, but the even power ' + t(m) + ' makes it positive.' },
            { html: t((val < 0 ? '-' : '') + '\\frac{1}{' + Math.abs(val) + '}'), why: 'The exponent is negative: take the reciprocal, which flips ' + t('\\frac{1}{' + Math.pow(c, m) + '}') + ' to ' + t(Math.pow(c, m)) + '.' },
            { html: 'has no meaning', why: 'The index is ' + t(n) + ', which is <b>odd</b>, so the root of a negative number exists.' }],
            t('\\left(-\\frac{1}{' + C + '}\\right)^{1/' + n + '}=-\\frac{1}{' + c + '}') + ', so ' + t('\\left(-\\frac{1}{' + C + '}\\right)^{' + m + '/' + n + '}=\\left(-\\frac{1}{' + c + '}\\right)^{' + m + '}=' + (val < 0 ? '-' : '') + '\\frac{1}{' + Math.abs(val) + '}') + '.<br>Reciprocal: ' + t(bt + '=' + val) + '.', ['The index ' + t(n) + ' is odd, so the root exists. Then decide the sign and take the reciprocal.'], 'MC ' + bt, true);
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i> Evaluate the following and arrange the answers from greatest to least.', parts: [
        { id: '19', level: 'PRG', make: function (r) {
          var b = r.pick([2, 3, 4, 4, 5]), B = b * b * b;
          var calc = [{ tex: '-\\left(' + B + '^{-2/3}\\right)', v: -1 / (b * b), vt: '-\\frac{1}{' + b * b + '}', how: '-\\frac{1}{\\left(\\sqrt[3]{' + B + '}\\right)^{2}}=-\\frac{1}{' + b * b + '}', err: 1 / (b * b) },
            { tex: '\\left(\\frac{1}{' + B + '}\\right)^{1/3}', v: 1 / b, vt: '\\frac{1}{' + b + '}', how: '\\frac{1}{\\sqrt[3]{' + B + '}}=\\frac{1}{' + b + '}', err: -1 / b },
            { tex: '(-' + B + ')^{2/3}', v: b * b, vt: String(b * b), how: '\\left(\\sqrt[3]{-' + B + '}\\right)^{2}=(-' + b + ')^{2}=' + b * b, err: -b * b },
            { tex: '\\left(-\\frac{1}{' + B + '}\\right)^{-1/3}', v: -b, vt: '-' + b, how: '\\frac{1}{\\sqrt[3]{-\\frac{1}{' + B + '}}}=\\frac{1}{-\\frac{1}{' + b + '}}=-' + b, err: b }];
          calc = r.shuffle(calc); calc.forEach(function (c, i) { c.no = i + 1; });
          function code(vals) { return calc.map(function (c, i) { return { no: c.no, v: vals[i] }; }).sort(function (x, y) { return y.v - x.v; }).map(function (x) { return x.no; }).join(''); }
          var vals = calc.map(function (c) { return c.v; }), ans = code(vals), rev = ans.split('').reverse().join('');
          var errs = calc.map(function (c, i) { var vv = vals.slice(); vv[i] = c.err; return { code: code(vv), no: c.no }; });
          return P.nr('Calculation 1: ' + t(calc[0].tex) + '&emsp; Calculation 2: ' + t(calc[1].tex) + '<br>Calculation 3: ' + t(calc[2].tex) + '&emsp; Calculation 4: ' + t(calc[3].tex) + '<br>Write the calculation numbers from the greatest answer to the smallest: ________.', Number(ans), function (v) {
            var s = String(v);
            if (s === rev) return { code: 'reversed', hint: 'That’s least to greatest. Start with the <b>greatest</b> answer.' };
            for (var i = 0; i < errs.length; i++) if (s === errs[i].code && s !== ans) return { code: 'calc-sign', hint: 'Check the <b>sign</b> of Calculation ' + errs[i].no + '.' };
            return null;
          }, calc.map(function (c) { return 'Calc ' + c.no + ': ' + t(c.tex + '=' + c.how); }).join('<br>') + '<br>Greatest to least: ' + t(calc.slice().sort(function (x, y) { return y.v - x.v; }).map(function (c) { return c.vt; }).join('>')) + ', so record <b>' + ans + '</b>.',
          ['Evaluate each one exactly first. Watch the signs: which are negative?'], 'order four rational-exponent powers, base ' + B);
        } }] }
    ],
    extra: EXTRA
  });
})(window);
