/* Math 10C · Unit 2 · Lesson 2 — Simplifying Expressions with Several Exponent Laws (AN3)
 * Assignment questions 1–13 (u2_L02.tex) and the whole Lesson 2 Extra Practice (u2_EP02.tex, Q1–20).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS.
 * Local checkers (not in kitx): powChk (a single power ±bᵑ, for "write in a simpler form and evaluate"),
 * vexpChk (a single power with an algebraic exponent — K.expo accepts uncombined powers there) and polyChk (a short
 * sum such as a²+2ab+b², fully expanded). */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'add-coef': 'Added the coefficients instead of multiplying', 'mult-exp': 'Multiplied exponents instead of adding (product law)',
    'div-exp': 'Divided exponents instead of subtracting (quotient law)', 'add-exp': 'Added exponents when dividing', 'sub-coef': 'Subtracted the coefficients instead of dividing',
    'coef-flip': 'Coefficient fraction upside down', 'hidden-one': 'Forgot a hidden exponent of 1', 'zero-as-zero': 'Treated a zero exponent (x⁰) as 0',
    'kept-exp': 'Kept the exponent instead of adding', 'not-raised': 'Didn’t raise the coefficient to the power', 'coef-times-n': 'Multiplied the coefficient by the exponent',
    'add-power': 'Added the outside exponent instead of multiplying', 'top-only': 'Applied the outside exponent to only part of the bracket', 'decimal-place': 'Decimal point in the wrong place',
    'leftover-var': 'Kept a variable that cancels (x ÷ x = 1)', 'neg-base': 'Sign of a negative base / outside minus', collect: 'Exponent not simplified (like terms)', base: 'Not written as a power of the given base',
    'minus-dist': 'Didn’t subtract the whole exponent', 'exp-dist': 'Didn’t multiply every term of the exponent', 'cancel-term': 'Cancelled a term of a sum', 'lost-one': 'Lost the 1 from xⁿ ÷ xⁿ',
    expand: 'Brackets not multiplied out', 'lost-2ab': 'Lost the middle term 2ab', 'not-zero': 'Gave 0 when a non-zero value was asked', pair: 'Pair doesn’t make the statement true',
    'nr-sign': 'Sign of a coefficient lost', 'nr-coef': 'Coefficient not raised to the power', 'nr-noa': 'Left the coefficient out of the sum'
  });

  /* ---------- rationals and monomials ---------- */
  function R(c) { return typeof c === 'number' ? [c, 1] : c; }
  function mulR(a, b) { a = R(a); b = R(b); return ex.norm(a[0] * b[0], a[1] * b[1]); }
  function divR(a, b) { a = R(a); b = R(b); return ex.norm(a[0] * b[1], a[1] * b[0]); }
  function powR(a, n) { a = R(a); return ex.norm(Math.pow(a[0], n), Math.pow(a[1], n)); }
  function dec(x) { return Number(Number(x).toFixed(10)); }
  function uniq(v, i, arr) { return arr.indexOf(v) === i; }
  function pw(l, e) { return e === 1 ? l : l + '^{' + e + '}'; }
  function pc(c) { c = R(c); var s = c[1] === 1 ? String(c[0]) : (c[0] < 0 ? '-' : '') + '\\tfrac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; return c[0] < 0 ? '(' + s + ')' : s; }
  function cTex(c, decm) { c = R(c); if (decm) return String(dec(c[0] / c[1])); if (c[1] === 1) return String(c[0]); return (c[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(c[0]) + '}{' + c[1] + '}'; }
  /* answer TeX: k × letters; negative exponents go under the bar. k: number (may be a decimal) or [p,q]; vs: [[letter, exp], …] */
  function mt(k, vs) {
    var num = vs.filter(function (v) { return v[1] > 0; }).map(function (v) { return pw(v[0], v[1]); }).join('');
    var den = vs.filter(function (v) { return v[1] < 0; }).map(function (v) { return pw(v[0], -v[1]); }).join('');
    var p, q; if (Array.isArray(k)) { var rr = ex.norm(k[0], k[1]); p = rr[0]; q = rr[1]; } else { p = k; q = 1; }
    var sg = p < 0 ? '-' : '', ap = Math.abs(p);
    if (!den) { if (q === 1) return sg + (ap === 1 && num ? '' : String(ap)) + num; return sg + '\\frac{' + ap + '}{' + q + '}' + num; }
    return sg + '\\frac{' + (ap === 1 && num ? '' : String(ap)) + num + '}{' + (q === 1 ? '' : q) + den + '}';
  }
  function M(k, v) { k = R(k); return { k: ex.norm(k[0], k[1]), v: v || {} }; }
  function mMul() { var out = M(1, {}); Array.prototype.forEach.call(arguments, function (a) { out.k = mulR(out.k, a.k); Object.keys(a.v).forEach(function (l) { out.v[l] = (out.v[l] || 0) + a.v[l]; }); }); return out; }
  function mDiv(a, b) { var v = {}; Object.keys(a.v).forEach(function (l) { v[l] = (v[l] || 0) + a.v[l]; }); Object.keys(b.v).forEach(function (l) { v[l] = (v[l] || 0) - b.v[l]; }); return { k: divR(a.k, b.k), v: v }; }
  function mPow(a, n) { var v = {}; Object.keys(a.v).forEach(function (l) { v[l] = a.v[l] * n; }); return { k: powR(a.k, n), v: v }; }
  function mK(a, k) { k = R(k); return { k: ex.norm(k[0], k[1]), v: a.v }; }
  function mV(a, v) { return { k: a.k, v: v }; }
  function mTex(a, ls, decm) { ls = ls || Object.keys(a.v).sort(); return mt(decm ? dec(a.k[0] / a.k[1]) : a.k, ls.filter(function (l) { return a.v[l]; }).map(function (l) { return [l, a.v[l]]; })); }
  /* a factor as printed in a question (keeps x^0, writes 1·x as x) */
  function fTex(a, ls, decm) {
    var vs = ls.filter(function (l) { return a.v[l] != null; }).map(function (l) { return pw(l, a.v[l]); }).join(''), k = a.k;
    if (k[1] === 1 && vs && Math.abs(k[0]) === 1) return (k[0] < 0 ? '-' : '') + vs;
    return cTex(k, decm) + vs;
  }
  function wrap(s, frac) { return frac ? '\\left(' + s + '\\right)' : '(' + s + ')'; }

  /* ---------- typed-answer helpers ---------- */
  function varsOf(ast) { var acc = {}; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(ast); return Object.keys(acc); }
  function same(ast, tex) {
    var p = ex.parse(tex); if (!p.ok) return false;
    var vs = varsOf(ast).concat(varsOf(p.ast)).filter(uniq);
    return vs.length ? ex.equiv(ast, p.ast, vs, 6) : ex.eq(ex.value(ast), ex.value(p.ast));
  }
  function sameTex(a, b) { var p = ex.parse(a); return p.ok && same(p.ast, b); }
  function strip(x) { while (x && x.t === 'paren') x = x.a; return x; }
  function w(tex, code, hint) { return { tex: tex, code: code, hint: hint }; }
  /* K.expo answer with lesson-specific wrong answers (each one also goes into the test's bad list) */
  function xp(prompt, target, wrongs, sol, hints, text, opt) {
    opt = opt || {};
    var ws = (wrongs || []).filter(function (x) { return x && !sameTex(x.tex, target); });
    var o = {}; Object.keys(opt).forEach(function (k) { o[k] = opt[k]; });
    o.diag = function (an, ast) { for (var i = 0; i < ws.length; i++) if (same(ast, ws[i].tex)) return { code: ws[i].code, hint: ws[i].hint }; return opt.diag ? opt.diag(an, ast) : null; };
    var p = P.expo(prompt, target, o, sol, hints, text);
    p.bad = ws.map(function (x) { return x.tex; }).concat(opt.bad || []);
    if (opt.good) p.good = opt.good;
    return p;
  }

  /* ---- a single power ±bⁿ (simpler form before evaluating) ---- */
  function bTex(b) { return b % 1 ? '(' + b + ')' : String(b); }
  function powTex(b, s, n) { return (s < 0 ? '-' : '') + (n === 1 ? String(b) : bTex(b) + '^{' + n + '}'); }
  function powChk(b, s, n, o) {
    o = o || {};
    var V = dec(s * Math.pow(b, n));
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var node = a.ast; while (node.t === 'neg' || node.t === 'paren') node = node.a;
      var B = null, N = null;
      if (node.t === 'pow') { var bb = node.a, bs = 1; while (bb.t === 'neg' || bb.t === 'paren') { if (bb.t === 'neg') bs = -bs; bb = bb.a; } var er = ex.rat(node.b); if (bb.t === 'num' && er && er[1] === 1) { B = bs * bb.v; N = er[0]; } }
      else if (node.t === 'num') { B = node.v; N = 1; }
      if (ex.eq(a.val, V)) {
        if (B == null) return form('single-power', 'Right value — now write it as a <b>single power</b> of ' + t(String(b)) + ' (one base, one exponent).');
        if (!ex.eq(Math.abs(B), b)) return form('base', 'That’s the right value, but this box wants the <b>simpler form</b>: a single power of ' + t(String(b)) + '. The value goes in the next box.');
        return ok();
      }
      if (!isFinite(a.val)) return wrong('value', null);
      if (ex.eq(a.val, -V)) return wrong('neg-base', o.sign || 'Check the sign.');
      if (B != null && ex.eq(Math.abs(B), b)) { var h = o.exp ? o.exp(N) : null; if (h) return wrong(h.code || 'exp', h.hint); return wrong('exp', 'Right base — check the exponent. Product law: add. Quotient law: subtract. Power of a power: multiply.'); }
      return wrong('value', null);
    };
  }
  /* "write in a simpler form and evaluate": two boxes */
  function evalPart(prompt, b, s, n, o) {
    var V = dec(s * Math.pow(b, n)), pt = powTex(b, s, n);
    var fields = [{ name: 'Simpler form', label: 'Simpler form', mode: 'math', keys: 'expr', wide: true }, { name: 'Value', label: 'Value' }];
    var vd = function (v) { if (ex.eq(v, -V)) return { code: 'neg-base', hint: o.sign || 'Check the sign.' }; return o.vdiag ? o.vdiag(v) : null; };
    var p = P.fields(prompt, fields, [powChk(b, s, n, o), K.number(V, vd)], [pt, String(V)], n === 1 ? t(bTex(b) + '^{1}=' + F(V)) : t(pt + '=' + F(V)), o.sol, o.hints, o.text);
    p.bad = [[pt, String(-V)], [powTex(b, -s, n), String(V)]].concat(n === 1 ? [] : [[String(V), String(V)]]);
    p.good = [[(s < 0 ? '-' : '') + '(' + bTex(b) + '^{' + n + '})', F(V, true)]];
    return p;
  }

  /* ---- a single power with an algebraic exponent, e.g. a^{4x+3y} ---- */
  function linTex(lin, ls) {
    var parts = []; ls.forEach(function (l) { var c = lin[l] || 0; if (c) parts.push((c === 1 ? '' : c === -1 ? '-' : c) + l); });
    if (lin.c) parts.push(String(lin.c));
    return parts.length ? parts.join('+').replace(/\+-/g, '-') : '0';
  }
  function linOf(node, ls) {
    var z = {}; ls.forEach(function (l) { z[l] = 0; });
    var c0 = ex.value(node, z); if (!isFinite(c0)) return null;
    var out = { c: c0 }, pt = {}, pred = c0;
    for (var i = 0; i < ls.length; i++) { var e = {}; ls.forEach(function (l) { e[l] = 0; }); e[ls[i]] = 1; var v = ex.value(node, e); if (!isFinite(v)) return null; out[ls[i]] = v - c0; pt[ls[i]] = 1.7 + 0.9 * i; pred += out[ls[i]] * pt[ls[i]]; }
    if (!ex.eq(ex.value(node, pt), pred)) return null;
    return out;
  }
  function linEq(a, b, ls) { return ex.eq(a.c, b.c || 0) && ls.every(function (l) { return ex.eq(a[l] || 0, b[l] || 0); }); }
  function tidyExp(node) {
    node = strip(node); var terms = [];
    (function split(x) { if (x.t === 'add' || x.t === 'sub') { split(x.a); split(x.b); } else terms.push(x); })(node);
    var seen = {}, consts = 0;
    for (var i = 0; i < terms.length; i++) {
      var x = terms[i]; while (x.t === 'neg') x = x.a;
      if (x.t === 'num') { consts++; continue; }
      if (x.t === 'var') { if (seen[x.n]) return false; seen[x.n] = 1; continue; }
      if (x.t === 'mul' && x.a.t === 'num' && x.b.t === 'var') { if (seen[x.b.n]) return false; seen[x.b.n] = 1; continue; }
      return false;
    }
    return consts <= 1;
  }
  function vexpChk(base, lin, ls, wrongs) {
    var tp = ex.parse(base + '^{' + linTex(lin, ls) + '}').ast;
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var vs = varsOf(a.ast).concat([base], ls).filter(uniq), node = strip(a.ast);
      var isPow = node.t === 'pow' && strip(node.a).t === 'var' && strip(node.a).n === base;
      if (ex.equiv(a.ast, tp, vs, 6)) {
        if (!isPow) return form('combine', 'Right value — now write it as a <b>single power</b> of ' + t(base) + ': one base with one exponent.');
        if (!tidyExp(node.b)) return form('collect', 'Right — now simplify the exponent: remove any brackets and collect like terms (the ' + ls.map(function (l) { return t(l); }).join(' and ') + ' terms, then the numbers).');
        return ok();
      }
      if (isPow) {
        var lf = linOf(node.b, ls);
        if (lf) for (var i = 0; i < wrongs.length; i++) if (linEq(lf, wrongs[i].lin, ls)) return wrong(wrongs[i].code, wrongs[i].hint);
        return wrong('exp', 'Right base — now check the exponent. Product law: add the exponents. Quotient law: subtract the <b>whole</b> bottom exponent. Power of a power: multiply <b>every</b> term of the exponent.');
      }
      if (node.t === 'pow' && strip(node.a).t === 'var') return wrong('base', 'The base stays ' + t(base) + ' — only the exponent changes.');
      return wrong('value', null);
    };
  }
  function vexpPart(prompt, base, lin, ls, wrongs, sol, hints, text) {
    var key = base + '^{' + linTex(lin, ls) + '}';
    var ws = wrongs.filter(function (x) { return !linEq(x.lin, lin, ls); });
    var p = P.math(prompt, vexpChk(base, lin, ls, ws), key, sol, hints, text, { keys: 'expo', vars: [base].concat(ls).sort() });
    p.bad = ws.map(function (x) { return base + '^{' + linTex(x.lin, ls) + '}'; });
    p.good = [base + '^(' + linTex(lin, ls) + ')'];
    return p;
  }
  function L(c, o) { var out = { c: c }; Object.keys(o || {}).forEach(function (k) { out[k] = o[k]; }); return out; }

  /* ---- a short sum (a²+2ab+b², a²+1), fully expanded ---- */
  function sumTerms(node) { node = strip(node); var n = 0; (function s(x) { if (x.t === 'add' || x.t === 'sub') { s(x.a); s(x.b); } else n++; })(node); return n; }
  function termList(node) { node = strip(node); var out = []; (function s(x) { if (x.t === 'add' || x.t === 'sub') { s(x.a); s(x.b); } else out.push(x); })(node); return out; }
  function sumInside(ast) {
    var found = false;
    (function walk(x) {
      if (!x || typeof x !== 'object' || found) return;
      if (x.t === 'mul' || x.t === 'div' || x.t === 'pow' || x.t === 'neg') ['a', 'b'].forEach(function (k) { var y = strip(x[k]); if (y && (y.t === 'add' || y.t === 'sub')) found = true; });
      ['a', 'b', 'n'].forEach(function (k) { if (x[k] && typeof x[k] === 'object') walk(x[k]); });
    })(ast);
    return found;
  }
  function polyChk(target, wrongs, msg) {
    var want = sumTerms(ex.parse(target).ast);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      if (same(a.ast, target)) {
        if (sumInside(a.ast)) return form('expand', msg || 'Right value — now multiply out the brackets.');
        if (sumTerms(a.ast) > want) return form('collect', 'Right value — now collect the like terms.');
        var bad = termList(a.ast).some(function (x) { var f = ex.analyze(x).flags; return f.repeatVar || f.nested || f.numPow || f.coefSplit || f.negExp || f.zeroExp; });
        if (bad) return form('simplify', 'Right value — now simplify each term (combine powers of the same base, work out number powers).');
        return ok();
      }
      for (var i = 0; i < (wrongs || []).length; i++) if (same(a.ast, wrongs[i].tex)) return wrong(wrongs[i].code, wrongs[i].hint);
      return wrong('value', null);
    };
  }

  /* ---------- common hints ---------- */
  var HP = 'Product law: multiply the coefficients, then <b>add</b> the exponents of each base.';
  var HQ = 'Quotient law: divide the coefficients, then <b>subtract</b> the exponents of each base (top minus bottom).';
  var HW_ = 'Power law: the outside exponent goes to <b>every</b> factor inside the bracket — the coefficient too — and multiplies each exponent.';
  var HS = 'Sign first: a negative base to an <b>even</b> power is positive, to an <b>odd</b> power negative. A minus sign <b>outside</b> a bracket is not raised to the power.';
  var HO = 'Work in order: brackets (power law) first, then multiply/divide the coefficients, then add/subtract the exponents one base at a time.';
  var PAIRS = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['c', 'd'], ['u', 'v'], ['f', 'g'], ['x', 'z'], ['h', 'k'], ['t', 'y'], ['b', 'c'], ['a', 'c'], ['e', 'f']];
  var ONE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  /* ---------- product of monomials (Q1, Q3, Q4) ---------- */
  function mprod(fs, ls, style, o) {
    o = o || {};
    var decm = !!o.decimal, res = mMul.apply(null, fs), target = mTex(res, ls, decm);
    var shown = fs.map(function (f) { var s = fTex(f, ls, decm); return style === 'paren' ? wrap(s, f.k[1] > 1) : s; }).join(style === 'paren' || style === 'juxt' ? '' : style === 'cdot' ? '\\cdot ' : '\\times ');
    var allOne = fs.every(function (f) { return f.k[1] === 1 && Math.abs(f.k[0]) === 1; });
    var steps = [];
    if (!allOne) steps.push('Multiply the coefficients: ' + t(fs.map(function (f) { return decm ? cTex(f.k, true) : pc(f.k); }).join('\\times ') + '=' + cTex(res.k, decm)) + '.');
    var hidden = [];
    ls.forEach(function (l) {
      var es = fs.filter(function (f) { return f.v[l] != null; }).map(function (f) { return f.v[l]; });
      if (es.indexOf(1) >= 0) hidden.push(l);
      if (es.length > 1) steps.push('Add the exponents of ' + t(l) + ': ' + t(l + '^{' + es.join('+') + '}=' + pw(l, res.v[l])) + (res.v[l] === 0 ? t('=1') : '') + '.');
    });
    if (hidden.length) steps.push('(A letter with no exponent, like ' + t(hidden[0]) + ', means ' + t(hidden[0] + '^{1}') + '.)');
    if (o.zero) steps.unshift(t(o.zero + '^{0}=1') + ', so that factor changes nothing.');
    var sol = steps.join('<br>') + '<br>So ' + t(shown + '=' + target) + '.';
    var ws = [];
    var ints = fs.every(function (f) { return f.k[1] === 1; });
    if (!allOne && ints && fs.length >= 2 && !decm) { var sk = fs.reduce(function (s, f) { return s + f.k[0]; }, 0); if (sk !== res.k[0]) ws.push(w(mTex(mK(res, sk), ls), 'add-coef', 'Coefficients are <b>multiplied</b>, not added: ' + t(fs.map(function (f) { return pc(f.k); }).join('\\times ') + '=' + cTex(res.k)) + '.')); }
    var mv = {}, multi = false; ls.forEach(function (l) { var es = fs.filter(function (f) { return f.v[l] != null; }).map(function (f) { return f.v[l]; }); if (es.length > 1) multi = true; mv[l] = es.length > 1 ? es.reduce(function (m, e) { return m * e; }, 1) : (es[0] || 0); });
    if (multi) ws.push(w(mTex(mV(res, mv), ls, decm), 'mult-exp', 'Product law: when powers of the same base are multiplied, <b>add</b> the exponents — don’t multiply them.'));
    if (hidden.length) { var hv = {}; ls.forEach(function (l) { hv[l] = fs.reduce(function (s, f) { return s + (f.v[l] != null && f.v[l] !== 1 ? f.v[l] : 0); }, 0); }); ws.push(w(mTex(mV(res, hv), ls, decm), 'hidden-one', 'Check the exponents: ' + t(hidden[0]) + ' on its own is ' + t(hidden[0] + '^{1}') + ', so it adds ' + t('1') + ' to the exponent.')); }
    if (res.k[0] !== 0) ws.push(w(mTex(mK(res, [-res.k[0], res.k[1]]), ls, decm), 'sign', 'Check the sign: count the negative coefficients. An even number of negatives gives a positive product; an odd number gives a negative.'));
    (o.wrongs || []).forEach(function (x) { ws.push(x); });
    var p = xp(o.prompt || t(shown), target, ws, sol, [HP, o.hint || 'Write each factor out if you’re unsure: ' + t('x^{2}\\cdot x^{3}=(x\\cdot x)(x\\cdot x\\cdot x)=x^{5}') + '.'], o.text || ('simplify ' + shown), { vars: ls });
    p.shown = shown; p.res = res;
    return p;
  }
  /* quotient of two monomials (Q2, Q3, Q4) */
  function mquot(top, bot, ls, style, o) {
    o = o || {};
    var res = mDiv(top, bot), target = mTex(res, ls), tt = fTex(top, ls), bt = fTex(bot, ls);
    var shown = style === 'frac' ? '\\dfrac{' + tt + '}{' + bt + '}' : style === 'paren' ? wrap(tt) + '\\div ' + wrap(bt) : tt + '\\div ' + bt;
    var steps = [], kk = divR(top.k, bot.k);
    if (!(bot.k[0] === 1 && bot.k[1] === 1)) steps.push('Divide the coefficients: ' + t('\\frac{' + top.k[0] + '}{' + bot.k[0] + '}=' + cTex(kk)) + (kk[1] > 1 ? ' (reduce the fraction)' : '') + '.');
    var cancel = [];
    ls.forEach(function (l) { var a = top.v[l] || 0, b = bot.v[l] || 0; if (!b) return; steps.push('Subtract the exponents of ' + t(l) + ': ' + t(l + '^{' + a + '-' + b + '}=' + (a - b === 0 ? l + '^{0}=1' : pw(l, a - b))) + '.'); if (a === b) cancel.push(l); });
    var sol = steps.join('<br>') + '<br>So ' + t(shown + '=' + target) + '.';
    var ws = [];
    if (kk[1] === 1 && top.k[0] - bot.k[0] !== kk[0] && bot.k[0] !== 1) ws.push(w(mTex(mK(res, top.k[0] - bot.k[0]), ls), 'sub-coef', 'Divide the coefficients — ' + t(top.k[0] + '\\div ' + pc(bot.k[0]) + '=' + kk[0]) + ' — don’t subtract them.'));
    if (kk[1] > 1 || Math.abs(kk[0]) > 1) ws.push(w(mTex(mK(res, [kk[1] * (kk[0] < 0 ? -1 : 1), Math.abs(kk[0])]), ls), 'coef-flip', 'Your coefficient is upside down: it’s ' + t(top.k[0] + '\\div ' + pc(bot.k[0])) + ', top divided by bottom.'));
    var dv = {}, av = {}, anyDiv = false;
    ls.forEach(function (l) { var a = top.v[l] || 0, b = bot.v[l] || 0; dv[l] = b && a > b && a % b === 0 && a / b !== a - b ? (anyDiv = true, a / b) : a - b; av[l] = a + b; });
    if (anyDiv) ws.push(w(mTex(mV(res, dv), ls), 'div-exp', 'Quotient law: <b>subtract</b> the exponents — don’t divide them.'));
    ws.push(w(mTex(mV(res, av), ls), 'add-exp', 'When you divide powers of the same base, <b>subtract</b> the exponents (top minus bottom). Adding is for multiplying.'));
    if (cancel.length) { var lv = {}; ls.forEach(function (l) { lv[l] = res.v[l] || (cancel.indexOf(l) >= 0 ? 1 : 0); }); ws.push(w(mTex(mV(res, lv), ls), 'leftover-var', t(cancel[0] + '\\div ' + cancel[0] + '=' + cancel[0] + '^{1-1}=' + cancel[0] + '^{0}=1') + ', so ' + t(cancel[0]) + ' cancels completely.')); }
    if (kk[0] === 1 && kk[1] === 1) ws.push(w('0', 'zero-as-zero', t(top.k[0] + '\\div ' + bot.k[0] + '=1') + ', not ' + t('0') + '.'));
    ws.push(w(mTex(mK(res, [-kk[0], kk[1]]), ls), 'sign', 'Check the sign: a negative divided by a positive is negative; a negative divided by a negative is positive.'));
    var p = xp(t(shown), target, ws, sol, [HQ, 'Cancel common factors: ' + t('\\frac{x^{5}}{x^{2}}=\\frac{x\\cdot x\\cdot x\\cdot x\\cdot x}{x\\cdot x}=x^{3}') + '.'], o.text || ('simplify ' + shown), { vars: ls });
    p.shown = shown;
    return p;
  }
  /* (c·vars)^n */
  function powWrongs(inner, n, ls, extra, post) {
    var res = mPow(inner, n), ws = [], av = {}, P2 = post || function (m) { return m; };
    function W2(m, code, hint) { return w(mTex(P2(m), ls), code, hint); }
    Object.keys(inner.v).forEach(function (l) { av[l] = inner.v[l] + n; });
    ws.push(W2(mV(res, av), 'add-power', 'Power of a power: <b>multiply</b> the exponents, ' + t('(x^{a})^{n}=x^{an}') + '. Don’t add them.'));
    if (Math.abs(inner.k[0]) > 1 || inner.k[1] > 1) {
      ws.push(W2(mK(res, inner.k), 'not-raised', 'The coefficient is inside the bracket, so it gets the power too: ' + t(pc(inner.k) + '^{' + n + '}=' + cTex(res.k)) + '.'));
      if (inner.k[1] === 1) ws.push(W2(mK(res, inner.k[0] * n), 'coef-times-n', t(pc(inner.k) + '^{' + n + '}') + ' means ' + t(pc(inner.k)) + ' multiplied by itself ' + n + ' times — not ' + t(pc(inner.k) + '\\times ' + n) + '.'));
    }
    ws.push(W2(mK(res, [-res.k[0], res.k[1]]), 'neg-base', HS));
    return ws.concat(extra || []);
  }

  /* ---------- negative-base helpers ---------- */
  function sgnPow(n) { return n % 2 ? -1 : 1; }
  function parity(n) { return n % 2 ? 'odd' : 'even'; }

  HW.defineLesson({
    id: 'u2l2', unit: 2, num: '2', title: 'Simplifying Expressions with Several Exponent Laws', outcome: 'AN3',
    blurb: 'Chains of the product, quotient and power laws with coefficients (fractions and decimals too), negative bases, and variable exponents.',
    questions: [
      { num: '1', section: 'Part A — Product and quotient laws with coefficients', stem: 'Simplify the following.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var l = r.pick(ONE), m = r.int(2, 9), n = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return x !== m; })); return mprod([M(r.int(2, 9), { [l]: m }), M(r.int(2, 9), { [l]: n })], [l], 'times'); } },
        { id: '1b', level: 'BEG', make: function (r) { var l = r.pick(ONE); return mprod([M(r.int(2, 9), { [l]: r.int(5, 12) }), M(r.int(2, 9), { [l]: r.int(5, 12) })], [l], 'paren'); } },
        { id: '1c', level: 'BEG', make: function (r) {
          var l = r.pick(ONE), e = r.int(3, 8), a = r.int(2, 9), b = r.int(2, 9);
          return mprod([M(a, { [l]: e }), M(b, { [l]: e })], [l], 'cdot', { wrongs: [w(mt(a * b, [[l, e]]), 'kept-exp', 'The exponents are the same, but they still add: ' + t(l + '^{' + e + '}\\cdot ' + l + '^{' + e + '}=' + l + '^{' + e + '+' + e + '}') + '.')] });
        } },
        { id: '1d', level: 'BEG', make: function (r) { var l = r.pick(ONE); return mprod([M(-r.int(2, 9), { [l]: r.int(3, 9) }), M(r.int(11, 15), { [l]: r.int(3, 9) })], [l], 'paren'); } },
        { id: '1e', level: 'EMG', make: function (r) { var l = r.pick(ONE), k = r.pick([2, 3, 4, 5]), j = r.pick([2, 3]); return mprod([M([-1, k], { [l]: r.int(3, 8) }), M(-k * j, { [l]: r.int(3, 8) })], [l], 'paren', { hint: 'Multiply the fraction by the whole number: ' + t('\\frac{1}{' + k + '}\\times ' + (k * j) + '=' + j) + '. Two negatives make a positive.' }); } },
        { id: '1f', level: 'EMG', make: function (r) {
          var l = r.pick(ONE), A = r.int(2, 9), B = r.int(2, 9), m = r.int(2, 7), n = r.int(2, 7);
          var res = M([A * B, 100], { [l]: m + n });
          return mprod([M([A, 10], { [l]: m }), M([B, 10], { [l]: n })], [l], 'times', { decimal: true, hint: 'Multiply the decimals as whole numbers (' + t(A + '\\times ' + B + '=' + (A * B)) + '), then count the decimal places: two in the question, so two in the answer.',
            wrongs: [w(mTex(mK(res, [A * B, 10]), [l], true), 'decimal-place', 'Check the decimal point: ' + t('0.' + A + '\\times 0.' + B) + ' has two decimal places in total, so the product is ' + t(String(dec(A * B / 100))) + '.'), w(mTex(mK(res, [A + B, 10]), [l], true), 'add-coef', 'Coefficients are <b>multiplied</b>, not added: ' + t('0.' + A + '\\times 0.' + B + '=' + dec(A * B / 100)) + '.')] });
        } }] },
      { num: '2', stem: 'Simplify.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { var l = r.pick(ONE), d = r.int(2, 9), m = r.int(5, 12), n = r.int(2, m - 2); return mquot(M(d * r.int(2, 9), { [l]: m }), M(d, { [l]: n }), [l], 'div'); } },
        { id: '2b', level: 'BEG', make: function (r) { var l = r.pick(ONE), d = r.int(6, 9), m = r.int(8, 15), n = r.int(3, m - 2); return mquot(M(d * r.int(6, 9), { [l]: m }), M(d, { [l]: n }), [l], 'paren'); } },
        { id: '2c', level: 'BEG', make: function (r) { var l = r.pick(ONE), d = r.int(2, 9), m = r.int(6, 12), n = r.int(2, m - 2); return mquot(M(d * r.int(2, 6), { [l]: m }), M(d, { [l]: n }), [l], 'frac'); } },
        { id: '2d', level: 'EMG', make: function (r) { var l = r.pick(ONE), d = r.int(3, 9), m = r.int(20, 45), n = r.int(5, 12); return mquot(M(-d * r.int(4, 9), { [l]: m }), M(d, { [l]: n }), [l], 'frac'); } },
        { id: '2e', level: 'EMG', make: function (r) { var l = r.pick(ONE), d = r.int(3, 8), m = r.int(8, 15), n = r.int(2, m - 3); return mquot(M(-d * r.int(2, 6), { [l]: m }), M(-d, { [l]: n }), [l], 'paren'); } },
        { id: '2f', level: 'BEG', make: function (r) { var l = r.pick(ONE), c = r.pick([12, 15, 18, 20, 24, 36]), m = r.int(6, 12), n = r.int(2, m - 2); return mquot(M(c, { [l]: m }), M(c, { [l]: n }), [l], 'frac'); } }] },
      { num: '3', stem: 'Write in simplest form.', parts: [
        { id: '3a', level: 'BEG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1]; return mprod([M(r.int(2, 9), { [x]: r.int(2, 6), [y]: r.int(2, 9) }), M(r.int(2, 9), { [x]: r.int(2, 6), [y]: r.int(2, 9) })], ls, 'paren'); } },
        { id: '3b', level: 'EMG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1];
          var p = mprod([M(1, { [x]: r.int(3, 9) }), M(1, { [y]: 0 }), M(1, { [x]: r.int(2, 6) }), M(1, { [y]: r.int(2, 8) })], ls, 'juxt', { zero: y, wrongs: [w('0', 'zero-as-zero', t(y + '^{0}=1') + ', not ' + t('0') + ' — anything (except ' + t('0') + ') to the power zero is ' + t('1') + '.')] });
          return p;
        } },
        { id: '3c', level: 'BEG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1], B = r.int(2, 6), p = r.int(4, 9), q = r.int(5, 12); return mquot(M(B * r.int(2, 6), { [x]: p, [y]: q }), M(B, { [x]: r.int(2, p - 1), [y]: r.int(2, q - 2) }), ls, 'frac'); } },
        { id: '3d', level: 'BEG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1], p = r.int(3, 8), q = r.int(5, 12); return mquot(M(r.int(2, 9), { [x]: p, [y]: q }), M(1, { [x]: p - 1, [y]: r.int(2, q - 2) }), ls, 'frac'); } },
        { id: '3e', level: 'EMG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1], A = r.int(2, 6), k = r.int(2, 4), p = r.int(8, 14), q = r.int(3, 7); return mquot(M(A, { [x]: p, [y]: q }), M(A * k, { [x]: r.int(2, p - 2), [y]: 1 }), ls, 'frac'); } },
        { id: '3f', level: 'EMG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1]; return mprod([M(r.int(3, 9), { [x]: r.int(2, 6), [y]: 1 }), M(1, { [x]: 1, [y]: r.int(2, 5) }), M(-r.int(2, 5), { [x]: r.int(2, 5), [y]: r.int(2, 7) })], ls, 'paren'); } }] },
      { num: '4', stem: 'Simplify.', parts: [
        { id: '4a', level: 'EMG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], fr = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [2, 7], [3, 7], [4, 7], [5, 7]]), g = r.int(2, 7), p = r.int(6, 12), q = r.int(5, 10);
          return mquot(M(g * fr[0], { [x]: p, [y]: q }), M(g * fr[1], { [x]: r.int(2, p - 2), [y]: r.int(2, q - 2) }), ls, 'frac');
        } },
        { id: '4b', level: 'EMG', make: function (r) { var l = r.pick(ONE); return mprod([M(r.int(2, 6), { [l]: r.int(2, 6) }), M(r.int(2, 6), { [l]: r.int(4, 9) }), M(-r.int(2, 4), { [l]: 1 })], [l], 'paren'); } },
        { id: '4c', level: 'EMG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1]; return mprod([M(-r.int(2, 6), { [x]: 1, [y]: 1 }), M(1, { [x]: r.int(2, 4), [y]: r.int(2, 6) }), M(-r.int(2, 6), { [x]: 1, [y]: 1 })], ls, 'paren'); } },
        { id: '4d', level: 'EMG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1], B = r.int(2, 6), m = r.int(5, 10); return mquot(M(-B * r.int(2, 5), { [x]: m, [y]: 1 }), M(B, { [x]: r.int(2, m - 2), [y]: 1 }), ls, 'paren'); } },
        { id: '4e', level: 'EMG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1], B = r.int(2, 6), m = r.int(6, 12), n = r.int(5, 10); return mquot(M(-B * r.int(2, 5), { [x]: m, [y]: n }), M(-B, { [x]: r.int(2, m - 2), [y]: r.int(2, n - 2) }), ls, 'paren'); } },
        { id: '4f', level: 'EMG', make: function (r) { var ls = r.pick(PAIRS), x = ls[0], y = ls[1], A = r.int(2, 6), k = r.int(2, 4), m = r.int(4, 9), n = r.int(6, 12); return mquot(M(A, { [x]: m, [y]: n }), M(-A * k, { [x]: 1, [y]: r.int(2, n - 2) }), ls, 'paren'); } }] },
      { num: '5', section: 'Part B — Powers, chains of laws and negative bases', stem: 'Write in simplest form.',
        shared: function (r) { return { ls: r.pick(PAIRS), p: r.int(2, 5), q: r.int(2, 6) }; },
        parts: [
          { id: '5a', level: 'EMG', make: function (r, sh) {
            var n = r.pick([2, 4]), inner = M(-1, { [sh.ls[0]]: sh.p, [sh.ls[1]]: sh.q }), res = mPow(inner, n), sh_ = t(wrap(fTex(inner, sh.ls)) + '^{' + n + '}');
            return xp(sh_, mTex(res, sh.ls), powWrongs(inner, n, sh.ls), 'The power is <b>even</b>, so the negative becomes positive: ' + t('(-1)^{' + n + '}=1') + '.<br>Multiply each exponent by ' + t(n) + ': ' + t(pw(sh.ls[0], sh.p + '\\times ' + n) + ',\\ ' + pw(sh.ls[1], sh.q + '\\times ' + n)) + '.<br>Answer: ' + t(mTex(res, sh.ls)) + '.', [HW_, HS], 'even power of a negative product');
          } },
          { id: '5b', level: 'EMG', make: function (r, sh) {
            var n = r.pick([3, 5]), inner = M(-1, { [sh.ls[0]]: sh.p, [sh.ls[1]]: sh.q }), res = mPow(inner, n), sh_ = t(wrap(fTex(inner, sh.ls)) + '^{' + n + '}');
            return xp(sh_, mTex(res, sh.ls), powWrongs(inner, n, sh.ls), 'The power is <b>odd</b>, so the answer stays negative: ' + t('(-1)^{' + n + '}=-1') + '.<br>Multiply each exponent by ' + t(n) + ': ' + t(pw(sh.ls[0], sh.p + '\\times ' + n) + ',\\ ' + pw(sh.ls[1], sh.q + '\\times ' + n)) + '.<br>Answer: ' + t(mTex(res, sh.ls)) + '.', [HW_, HS], 'odd power of a negative product');
          } },
          { id: '5c', level: 'BEG', make: function (r) {
            var ls = r.pick(PAIRS), x = ls[1], y = ls[0], p = r.int(2, 7), q = r.int(2, 6), n = r.int(2, 4), tgt = mt(1, [[x, p * n], [y, -q * n]]);
            return xp(t('\\left(\\dfrac{' + pw(x, p) + '}{' + pw(y, q) + '}\\right)^{' + n + '}'), tgt,
              [w(mt(1, [[x, p + n], [y, -(q + n)]]), 'add-power', 'Power of a power: <b>multiply</b> the exponents — ' + t('(' + pw(x, p) + ')^{' + n + '}=' + pw(x, p * n)) + '.'), w(mt(1, [[x, p * n], [y, -q]]), 'top-only', 'The outside power goes to the denominator too: ' + t('(' + pw(y, q) + ')^{' + n + '}=' + pw(y, q * n)) + '.'), w(mt(1, [[x, p], [y, -q * n]]), 'top-only', 'The outside power goes to the numerator too: ' + t('(' + pw(x, p) + ')^{' + n + '}=' + pw(x, p * n)) + '.')],
              'Power of a quotient: raise the top and the bottom to the power ' + t(n) + '.<br>' + t(pw(x, p + '\\times ' + n) + '=' + pw(x, p * n)) + ' and ' + t(pw(y, q + '\\times ' + n) + '=' + pw(y, q * n)) + ', so the answer is ' + t(tgt) + '.', [HW_], 'power of a quotient');
          } },
          { id: '5d', level: 'EMG', make: function (r) {
            var l = r.pick(ONE), a = r.int(4, 9), b = r.int(2, 5), c = r.int(2, 6), d = r.int(1, 4); while (a + b - c - d < 2) { c = r.int(2, 4); d = r.int(1, 2); }
            var e = a + b - c - d, sh_ = '\\dfrac{' + pw(l, a) + '\\times ' + pw(l, b) + '}{' + pw(l, c) + '\\times ' + pw(l, d) + '}';
            return xp(t(sh_), pw(l, e), [w(pw(l, a + b - c + d), 'minus-dist', 'Both powers in the denominator are divided out: subtract ' + t(c) + ' <b>and</b> ' + t(d) + '.'), w(pw(l, a + b + c + d), 'add-exp', 'Dividing means <b>subtracting</b> the bottom exponents.'), a * b - c * d > 0 ? w(pw(l, a * b - c * d), 'mult-exp', 'Product law: <b>add</b> the exponents on the top (' + t(a + '+' + b) + ') and on the bottom (' + t(c + '+' + d) + ').') : null],
              'Top: ' + t(pw(l, a + '+' + b) + '=' + pw(l, a + b)) + '. Bottom: ' + t(pw(l, c + '+' + d) + '=' + pw(l, c + d)) + '.<br>Divide: ' + t(pw(l, (a + b) + '-' + (c + d)) + '=' + pw(l, e)) + '.', [HP, HQ], 'product then quotient, one base');
          } }] },
      { num: '6', stem: 'Simplify the following.', parts: [
        { id: '6a', level: 'EMG', make: function (r) {
          var ls = r.pick(PAIRS), A = r.pick([2, 3]), n = r.int(3, 5), q = r.int(2, 5), inner = M(A, { [ls[0]]: 1, [ls[1]]: q }), res = mPow(inner, n);
          return xp(t(wrap(fTex(inner, ls)) + '^{' + n + '}'), mTex(res, ls), powWrongs(inner, n, ls),
            'Power of a product: every factor gets the power ' + t(n) + '.<br>' + t(A + '^{' + n + '}=' + res.k[0]) + ', ' + t(ls[0] + '^{1\\times ' + n + '}=' + pw(ls[0], n)) + ', ' + t(ls[1] + '^{' + q + '\\times ' + n + '}=' + pw(ls[1], q * n)) + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HW_], 'power of a product');
        } },
        { id: '6b', level: 'EMG', make: function (r) {
          var ls = r.pick(PAIRS), A = r.int(2, 5), n = A <= 3 ? r.pick([2, 4]) : 2, p = r.int(2, 6), q = r.int(2, 5), inner = M(-A, { [ls[0]]: p, [ls[1]]: q }), res = mPow(inner, n);
          return xp(t(wrap(fTex(inner, ls)) + '^{' + n + '}'), mTex(res, ls), powWrongs(inner, n, ls),
            t('(' + (-A) + ')^{' + n + '}=' + res.k[0]) + ' (even power, so positive).<br>' + t(pw(ls[0], p + '\\times ' + n) + '=' + pw(ls[0], p * n)) + ', ' + t(pw(ls[1], q + '\\times ' + n) + '=' + pw(ls[1], q * n)) + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HW_, HS], 'even power of a negative coefficient');
        } },
        { id: '6c', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), A = r.pick([2, 3]), n = A === 2 ? 4 : r.pick([2, 4]), inner = M(-A, { [ls[0]]: r.int(2, 5), [ls[1]]: r.int(2, 5) }), other = M(1, { [ls[0]]: r.int(2, 4), [ls[1]]: r.int(1, 4) });
          var pr = mPow(inner, n), res = mMul(pr, other), shown = wrap(fTex(inner, ls)) + '^{' + n + '}' + wrap(fTex(other, ls));
          var mv = {}; ls.forEach(function (l) { mv[l] = pr.v[l] * other.v[l]; });
          return xp(t(shown), mTex(res, ls), powWrongs(inner, n, ls, [w(mTex(mV(res, mv), ls), 'mult-exp', 'After the power law, the product law <b>adds</b> exponents: ' + t(pw(ls[0], pr.v[ls[0]]) + '\\cdot ' + pw(ls[0], other.v[ls[0]]) + '=' + pw(ls[0], res.v[ls[0]])) + '.')], function (m) { return mMul(m, other); }),
            'Power law first: ' + t(wrap(fTex(inner, ls)) + '^{' + n + '}=' + mTex(pr, ls)) + ' (even power, so positive).<br>Then the product law with ' + t(fTex(other, ls)) + ': ' + ls.map(function (l) { return t(l + '^{' + pr.v[l] + '+' + other.v[l] + '}=' + pw(l, res.v[l])); }).join(', ') + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HO, HW_], 'power then product');
        } },
        { id: '6d', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), A = r.pick([2, 3]), inner = M(-A, { [ls[0]]: r.int(2, 5), [ls[1]]: r.int(2, 5) }), other = M(r.int(2, 6), { [ls[0]]: 1, [ls[1]]: r.int(2, 7) });
          var pr = mPow(inner, 3), res = mMul(pr, other), shown = wrap(fTex(inner, ls)) + '^{3}' + wrap(fTex(other, ls));
          return xp(t(shown), mTex(res, ls), [w(mTex(mMul(mK(pr, -pr.k[0]), other), ls), 'neg-base', 'The power ' + t('3') + ' is odd, so ' + t('(' + (-A) + ')^{3}=' + (-A * A * A)) + ' stays negative.'), w(mTex(mMul(mK(pr, -A), other), ls), 'not-raised', 'Cube the coefficient too: ' + t('(' + (-A) + ')^{3}=' + (-A * A * A)) + '.'), w(mTex(mMul(mK(pr, -A * 3), other), ls), 'coef-times-n', t('(' + (-A) + ')^{3}') + ' is ' + t('(' + (-A) + ')(' + (-A) + ')(' + (-A) + ')') + ', not ' + t('(' + (-A) + ')\\times 3') + '.'), w(mTex(mV(res, { [ls[0]]: pr.v[ls[0]], [ls[1]]: res.v[ls[1]] }), ls), 'hidden-one', t(ls[0]) + ' on its own is ' + t(ls[0] + '^{1}') + ', so add ' + t('1') + ' to that exponent.')],
            'Power law first: ' + t(wrap(fTex(inner, ls)) + '^{3}=' + mTex(pr, ls)) + ' (odd power, so negative).<br>Then multiply by ' + t(fTex(other, ls)) + ': ' + t(pc(pr.k) + '\\times ' + other.k[0] + '=' + res.k[0]) + ', ' + ls.map(function (l) { return t(l + '^{' + pr.v[l] + '+' + other.v[l] + '}=' + pw(l, res.v[l])); }).join(', ') + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HO, HS], 'odd power then product');
        } },
        { id: '6e', level: 'PRG', make: function (r) {
          var ls = r.pick([['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r'], ['m', 'n', 'k']]), A = r.pick([2, 3]), n = A === 2 ? r.pick([3, 4]) : 3;
          var first = M(1, { [ls[0]]: r.int(2, 4), [ls[1]]: r.int(2, 5), [ls[2]]: r.int(2, 6) }), inner = M(A, { [ls[0]]: 1, [ls[1]]: 1, [ls[2]]: r.int(2, 4) });
          var pr = mPow(inner, n), res = mMul(first, pr), shown = wrap(fTex(first, ls)) + wrap(fTex(inner, ls)) + '^{' + n + '}';
          var nv = {}; ls.forEach(function (l) { nv[l] = first.v[l] + inner.v[l]; });
          return xp(t(shown), mTex(res, ls), [w(mTex(mMul(first, mK(pr, A)), ls), 'not-raised', 'The ' + t(A) + ' is inside the bracket, so it is raised to the power too: ' + t(A + '^{' + n + '}=' + pr.k[0]) + '.'), w(mTex(mMul(first, mK(pr, A * n)), ls), 'coef-times-n', t(A + '^{' + n + '}') + ' means ' + t(A) + ' multiplied by itself ' + n + ' times, not ' + t(A + '\\times ' + n) + '.'), w(mTex(mV(res, nv), ls), 'top-only', 'Apply the power ' + t(n) + ' to the bracket <b>before</b> multiplying: every exponent inside gets multiplied by ' + t(n) + '.')],
            'Power law first: ' + t(wrap(fTex(inner, ls)) + '^{' + n + '}=' + mTex(pr, ls)) + '.<br>Then multiply by ' + t(fTex(first, ls)) + ': ' + ls.map(function (l) { return t(l + '^{' + first.v[l] + '+' + pr.v[l] + '}=' + pw(l, res.v[l])); }).join(', ') + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HO, HW_], 'product with a power of a product');
        } }] },
      { num: '7', stem: 'Write each expression in simplest form without brackets.', parts: [
        { id: '7a', level: 'PRG', make: function (r) {
          var l = r.pick(ONE), kk = r.pick([2, 3]), A = r.int(2, 5), n = kk === 3 ? 2 : r.pick([2, 3]), p = r.int(2, 6), q = r.int(2, 6), rr = r.int(1, p + q - 2), e = p + q - rr;
          var shown = '\\left(\\dfrac{' + A + pw(l, p) + '\\times ' + pw(l, q) + '}{' + (A * kk) + pw(l, rr) + '}\\right)^{' + n + '}', tgt = mt([1, Math.pow(kk, n)], [[l, e * n]]);
          return xp(t(shown), tgt, [w(mt([1, kk], [[l, e * n]]), 'not-raised', 'Raise the coefficient to the power too: ' + t('\\left(\\frac{1}{' + kk + '}\\right)^{' + n + '}=\\frac{1}{' + Math.pow(kk, n) + '}') + '.'), w(mt([1, Math.pow(kk, n)], [[l, e + n]]), 'add-power', 'Power of a power: <b>multiply</b> ' + t(e) + ' by ' + t(n) + '.'), w(mt(Math.pow(kk, n), [[l, e * n]]), 'coef-flip', t('\\frac{' + A + '}{' + (A * kk) + '}=\\frac{1}{' + kk + '}') + ' — the smaller number is on top.')],
            'Inside the bracket first: ' + t('\\frac{' + A + pw(l, p) + '\\times ' + pw(l, q) + '}{' + (A * kk) + pw(l, rr) + '}=\\frac{' + A + pw(l, p + q) + '}{' + (A * kk) + pw(l, rr) + '}=\\frac{1}{' + kk + '}' + pw(l, e)) + '.<br>Now the outer power: ' + t('\\left(\\frac{1}{' + kk + '}\\right)^{' + n + '}=\\frac{1}{' + Math.pow(kk, n) + '}') + ' and ' + t(l + '^{' + e + '\\times ' + n + '}=' + pw(l, e * n)) + '.<br>Answer: ' + t(tgt) + '.', [HO, 'Simplify inside the bracket first; the coefficient becomes a fraction. Then raise the fraction and the power to the outside exponent.'], 'quotient inside a power');
        } },
        { id: '7b', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], g = r.int(2, 6), B = r.pick([2, 3]), C = r.pick([4, 6, 8, 12].filter(function (c) { return (g * c) % B === 0; })), A = g * C / B;
          var p = r.int(2, 6), q = r.int(1, 4), rp = r.int(2, 5), s = r.int(2, 6), u = r.int(1, q + s - 1), ex_ = p + rp - 1, ey = q + s - u;
          var shown = '\\left(\\dfrac{-' + A + pw(x, p) + pw(y, q) + '\\cdot ' + B + pw(x, rp) + pw(y, s) + '}{' + C + x + pw(y, u) + '}\\right)^{2}', tgt = mt(g * g, [[x, 2 * ex_], [y, 2 * ey]]);
          return xp(t(shown), tgt, [w(mt(-g * g, [[x, 2 * ex_], [y, 2 * ey]]), 'neg-base', 'The whole bracket is squared, so ' + t('(-' + g + ')^{2}=' + g * g) + ' is positive.'), w(mt(g, [[x, 2 * ex_], [y, 2 * ey]]), 'not-raised', 'Square the coefficient too: ' + t('(-' + g + ')^{2}=' + g * g) + '.'), w(mt(g * g, [[x, ex_], [y, ey]]), 'top-only', 'The outside square doubles every exponent: ' + t('(' + pw(x, ex_) + ')^{2}=' + pw(x, 2 * ex_)) + '.')],
            'Inside, numerator: ' + t('-' + A + '\\times ' + B + '=-' + (A * B)) + ', ' + t(x + '^{' + p + '+' + rp + '}=' + pw(x, p + rp)) + ', ' + t(y + '^{' + q + '+' + s + '}=' + pw(y, q + s)) + '.<br>Divide by ' + t(C + x + pw(y, u)) + ': ' + t('-' + (A * B) + '\\div ' + C + '=-' + g) + ', ' + t(x + '^{' + (p + rp) + '-1}=' + pw(x, ex_)) + ', ' + t(y + '^{' + (q + s) + '-' + u + '}=' + pw(y, ey)) + ', giving ' + t('-' + g + pw(x, ex_) + pw(y, ey)) + '.<br>Square: ' + t('(-' + g + ')^{2}=' + g * g) + ', exponents doubled.<br>Answer: ' + t(tgt) + '.', [HO, 'Simplify inside the bracket first, then square every factor (an even power makes the negative positive).'], 'chain inside a square');
        } },
        { id: '7c', level: 'ADV', make: function (r) {
          var l = r.pick(['k', 'm', 'x', 't']), A = r.int(2, 5), p = r.int(2, 5), q = r.int(2, 4), E = r.pick([4, 6]), s = r.int(1, 3), u = r.int(2, 4);
          while (E + s - u < 1) u = r.int(2, 3);
          var e1 = p + q - 1, e2 = E + s - u, tot = 2 * e1 + e2;
          var shown = '\\left(\\dfrac{-' + A + pw(l, p) + '\\cdot ' + pw(l, q) + '}{' + l + '}\\right)^{2}\\left(\\dfrac{(-' + l + ')^{' + E + '}\\cdot ' + pw(l, s) + '}{' + A + pw(l, u) + '}\\right)';
          return xp(t(shown), mt(A, [[l, tot]]), [w(mt(-A, [[l, tot]]), 'neg-base', 'Both negatives disappear: ' + t('(-' + A + ')^{2}') + ' and ' + t('(-' + l + ')^{' + E + '}') + ' are even powers.'), w(mt(-1, [[l, tot]]), 'not-raised', 'Square the coefficient in the first bracket: ' + t('(-' + A + ')^{2}=' + A * A) + '.'), w(mt(A, [[l, e1 + e2]]), 'top-only', 'The square on the first bracket doubles its exponent: ' + t('(' + pw(l, e1) + ')^{2}=' + pw(l, 2 * e1)) + '.'), w(mt(A * A * A, [[l, tot]]), 'coef-flip', 'The ' + t(A) + ' in the second bracket is in the <b>denominator</b>: ' + t(A * A + '\\times\\frac{1}{' + A + '}=' + A) + '.')],
            'First bracket: ' + t('\\frac{-' + A + pw(l, p + q) + '}{' + l + '}=-' + A + pw(l, e1)) + ', squared: ' + t('(-' + A + ')^{2}' + pw(l, e1 + '\\times 2') + '=' + (A * A) + pw(l, 2 * e1)) + '.<br>Second bracket: ' + t('(-' + l + ')^{' + E + '}=' + pw(l, E)) + ' (even power), so ' + t('\\frac{' + pw(l, E) + '\\cdot ' + pw(l, s) + '}{' + A + pw(l, u) + '}=\\frac{' + pw(l, E + s) + '}{' + A + pw(l, u) + '}=\\frac{1}{' + A + '}' + pw(l, e2)) + '.<br>Multiply: ' + t((A * A) + pw(l, 2 * e1) + '\\times\\frac{1}{' + A + '}' + pw(l, e2) + '=' + mt(A, [[l, tot]])) + '.', [HO, 'Simplify each bracket on its own first. ' + t('(-' + l + ')^{' + E + '}') + ' has an even exponent, so it is positive.'], 'two brackets with negative bases');
        } }] },
      { num: '8', stem: 'Write in a simpler form (a single power) and evaluate.', parts: [
        { id: '8a', level: 'BEG', make: function (r) {
          var b = r.pick([2, 3, 5]), k = b === 5 ? r.int(3, 5) : b === 3 ? r.int(4, 7) : r.int(6, 10), n = r.int(2, 4), m = k + n - 1;
          return evalPart(t('\\dfrac{' + b + '^{' + m + '}\\times ' + b + '}{' + b + '^{' + n + '}}'), b, 1, k, { exp: function (N) { if (N === m - n) return { code: 'hidden-one', hint: 'The ' + t(b) + ' on its own is ' + t(b + '^{1}') + ' — it adds ' + t('1') + ' to the exponent.' }; if (N === m + 1 + n) return { code: 'add-exp', hint: 'Dividing by ' + t(b + '^{' + n + '}') + ' <b>subtracts</b> ' + t(n) + '.' }; return null; },
            sol: t(b + '^{' + m + '+1-' + n + '}=' + b + '^{' + k + '}=' + F(Math.pow(b, k))), hints: ['Remember ' + t(b + '=' + b + '^{1}') + '. Add the exponents on top, then subtract the bottom one.'], text: 'evaluate b^m·b/b^n' });
        } },
        { id: '8b', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3]), m = b === 2 ? r.int(3, 6) : r.int(2, 4), V = Math.pow(b, 2 * m);
          return evalPart(t('(-' + b + '^{' + m + '})^{2}'), b, 1, 2 * m, { sign: t('-' + b + '^{' + m + '}=-' + Math.pow(b, m)) + ' is negative, but the whole bracket is <b>squared</b>, and a negative squared is positive.', exp: function (N) { return N === m + 2 ? { code: 'add-power', hint: 'Power of a power: <b>multiply</b> the exponents, ' + t(m + '\\times 2') + '.' } : null; },
            sol: t('-' + b + '^{' + m + '}=-(' + b + '^{' + m + '})=-' + Math.pow(b, m)) + '.<br>Squared: ' + t('(-' + Math.pow(b, m) + ')^{2}=' + F(V)) + ', which is ' + t(b + '^{' + (2 * m) + '}') + '.', hints: ['Work out what is inside the bracket first. Is the result of squaring positive or negative?'], text: '(-b^m)^2' });
        } },
        { id: '8c', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3]), d = b === 3 ? r.int(2, 5) : r.int(3, 7), k = b === 3 ? (d <= 3 ? r.pick([2, 3]) : 2) : 2, n = r.int(2, 5), m = n + d;
          return evalPart(t('\\left(\\dfrac{' + b + '^{' + m + '}}{' + b + '^{' + n + '}}\\right)^{' + k + '}'), b, 1, d * k, { exp: function (N) { if (N === d + k) return { code: 'add-power', hint: 'Power of a power: <b>multiply</b> ' + t(d) + ' by ' + t(k) + '.' }; if (N === m * k - n) return { code: 'top-only', hint: 'The outside power applies to the whole quotient — simplify inside first: ' + t(b + '^{' + m + '-' + n + '}=' + b + '^{' + d + '}') + '.' }; return null; },
            sol: 'Inside: ' + t(b + '^{' + m + '-' + n + '}=' + b + '^{' + d + '}') + '.<br>Outer power: ' + t('(' + b + '^{' + d + '})^{' + k + '}=' + b + '^{' + (d * k) + '}=' + F(Math.pow(b, d * k))) + '.', hints: ['Simplify inside the bracket first, then multiply the exponents.'], text: '(b^m/b^n)^k' });
        } },
        { id: '8d', level: 'BEG', make: function (r) {
          var b = r.pick([0.6, 0.4, 0.5, 0.3, 0.2, 0.7, 0.8, 0.9, 1.5, 1.2]), k = r.chance(0.7) ? 1 : 2, q = r.int(3, 6), s = r.int(2, 4), p = q + s + k, V = dec(Math.pow(b, k));
          return evalPart(t('\\dfrac{(' + b + ')^{' + p + '}}{(' + b + ')^{' + q + '}\\times (' + b + ')^{' + s + '}}'), b, 1, k, { exp: function (N) { return N === p - q + s ? { code: 'minus-dist', hint: 'Both powers on the bottom are divided out: subtract ' + t(q) + ' <b>and</b> ' + t(s) + '.' } : null; },
            sol: t('(' + b + ')^{' + p + '-' + q + '-' + s + '}=(' + b + ')^{' + k + '}=' + V) + '.', hints: ['Add the exponents on the bottom first, then subtract from the top exponent. No calculator needed!'], text: 'decimal base quotient' });
        } },
        { id: '8e', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3, 4]), tot = b === 4 ? r.int(6, 8) : b === 3 ? r.int(6, 9) : r.int(9, 14), m = r.int(3, tot - 2), n = tot - m;
          return evalPart(t('-' + b + '^{' + m + '}\\times ' + b + '^{' + n + '}'), b, -1, tot, { sign: 'The base is ' + t(b) + ', not ' + t('-' + b) + ': ' + t('-' + b + '^{' + m + '}') + ' means ' + t('-(' + b + '^{' + m + '})') + '. The minus sign stays in front.',
            sol: 'The base is ' + t(b) + '; the minus sign sits outside: ' + t('-(' + b + '^{' + m + '+' + n + '})=-' + b + '^{' + tot + '}=' + F(-Math.pow(b, tot))) + '.', hints: [t('-' + b + '^{' + m + '}') + ' is the negative of ' + t(b + '^{' + m + '}') + ' — the exponent belongs only to ' + t(b) + '.'], text: '-b^m × b^n' });
        } },
        { id: '8f', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3, 4]), tot = b === 4 ? r.int(6, 8) : b === 3 ? r.int(5, 9) : r.int(9, 13), m = r.int(3, tot - 2), n = tot - m, s = sgnPow(tot);
          return evalPart(t('(-' + b + ')^{' + m + '}\\times (-' + b + ')^{' + n + '}'), b, s, tot, { sign: 'The base is ' + t('(-' + b + ')') + ' and the total exponent is ' + t(tot) + ', which is ' + parity(tot) + ' — so the answer is ' + (s > 0 ? 'positive' : 'negative') + '.',
            sol: 'The base is ' + t('(-' + b + ')') + ': ' + t('(-' + b + ')^{' + m + '+' + n + '}=(-' + b + ')^{' + tot + '}') + '. The exponent is ' + parity(tot) + ', so ' + t('(-' + b + ')^{' + tot + '}=' + powTex(b, s, tot) + '=' + F(s * Math.pow(b, tot))) + '.', hints: ['Same base ' + t('(-' + b + ')') + ': add the exponents, then decide the sign from whether the exponent is even or odd.'], text: '(-b)^m × (-b)^n' });
        } },
        { id: '8g', level: 'PRG', make: function (r) {
          var b, d; if (r.chance(0.5)) { b = r.pick([3, 4, 5, 6, 7, 9]); d = 2; } else { b = r.pick([2, 3]); d = b === 2 ? r.int(3, 6) : 3; }
          var n = r.pick([4, 6, 8]), m = n + d;
          return evalPart(t('-' + b + '^{' + m + '}\\div (-' + b + ')^{' + n + '}'), b, -1, d, { sign: t('(-' + b + ')^{' + n + '}') + ' is positive (even power), but ' + t('-' + b + '^{' + m + '}') + ' is negative — the minus sign is not part of the base. Negative ÷ positive is negative.',
            sol: t('-' + b + '^{' + m + '}=-(' + b + '^{' + m + '})') + ' and ' + t('(-' + b + ')^{' + n + '}=' + b + '^{' + n + '}') + ' (even).<br>' + t('\\frac{-' + b + '^{' + m + '}}{' + b + '^{' + n + '}}=-' + b + '^{' + m + '-' + n + '}=-' + b + '^{' + d + '}=' + F(-Math.pow(b, d))) + '.', hints: ['Decide the sign of the top and the sign of the bottom separately first.'], text: '-b^m ÷ (-b)^n' });
        } },
        { id: '8h', level: 'EMG', make: function (r) {
          var b, d; if (r.chance(0.5)) { b = r.pick([3, 4, 5, 6, 7, 9]); d = 2; } else { b = r.pick([2, 3]); d = b === 2 ? r.int(3, 6) : 3; }
          var n = r.int(4, 8), m = n + d;
          return evalPart(t('\\dfrac{-' + b + '^{' + m + '}}{-' + b + '^{' + n + '}}'), b, 1, d, { sign: 'Top and bottom are both negative, and a negative divided by a negative is positive.',
            sol: t('\\frac{-(' + b + '^{' + m + '})}{-(' + b + '^{' + n + '})}') + ': the negatives cancel.<br>' + t(b + '^{' + m + '-' + n + '}=' + b + '^{' + d + '}=' + F(Math.pow(b, d))) + '.', hints: ['Here the bases are ' + t(b) + ' — the minus signs sit in front. How do the two minus signs combine?'], text: '-b^m / -b^n' });
        } }] },
      { num: '9', stem: 'Write each expression in simplest form without brackets.', parts: [
        { id: '9a', level: 'EMG', make: function (r) {
          var l = r.pick(ONE), n = r.int(3, 8), d = r.int(3, 9), m = n + d, s = sgnPow(d), tgt = (s < 0 ? '-' : '') + pw(l, d);
          return xp(t('(-' + l + ')^{' + m + '}\\div (-' + l + ')^{' + n + '}'), tgt, [w((s < 0 ? '' : '-') + pw(l, d), 'neg-base', 'Same base ' + t('(-' + l + ')') + ': ' + t('(-' + l + ')^{' + m + '-' + n + '}=(-' + l + ')^{' + d + '}') + '. The exponent ' + t(d) + ' is ' + parity(d) + ', so the answer is ' + (s < 0 ? 'negative' : 'positive') + '.'), m % n === 0 ? w((s < 0 ? '-' : '') + pw(l, m / n), 'div-exp', 'Quotient law: <b>subtract</b> the exponents, ' + t(m + '-' + n) + '.') : null],
            'Same base ' + t('(-' + l + ')') + ': ' + t('(-' + l + ')^{' + m + '-' + n + '}=(-' + l + ')^{' + d + '}') + '.<br>The exponent is ' + parity(d) + ', so ' + t('(-' + l + ')^{' + d + '}=' + tgt) + '.', [HQ, HS], '(-x)^m ÷ (-x)^n');
        } },
        { id: '9b', level: 'EMG', make: function (r) {
          var l = r.pick(ONE), n = r.pick([4, 6, 8]), d = r.pick([3, 5, 7]), m = n + d, tgt = '-' + pw(l, d);
          return xp(t('(-' + l + ')^{' + m + '}\\div (-' + l + ')^{' + n + '}'), tgt, [w(pw(l, d), 'neg-base', t('(-' + l + ')^{' + d + '}') + ' has an <b>odd</b> exponent, so it is negative: ' + t('(-' + l + ')^{' + d + '}=-' + pw(l, d)) + '.')],
            'Same base ' + t('(-' + l + ')') + ': ' + t('(-' + l + ')^{' + m + '-' + n + '}=(-' + l + ')^{' + d + '}') + '.<br>Odd exponent, so negative: ' + t(tgt) + '.', [HQ, HS], '(-a)^m ÷ (-a)^n, odd result');
        } },
        { id: '9c', level: 'EMG', make: function (r) {
          var l = r.pick(ONE), n = r.pick([2, 4, 6]), d = r.int(3, 9), m = n + d, tgt = '-' + pw(l, d);
          return xp(t('-' + pw(l, m) + '\\div (-' + l + ')^{' + n + '}'), tgt, [w(pw(l, d), 'neg-base', t('(-' + l + ')^{' + n + '}=' + pw(l, n)) + ' is positive (even power), but ' + t('-' + pw(l, m)) + ' is negative — the minus sign is outside. Negative ÷ positive is negative.'), m % n === 0 ? w('-' + pw(l, m / n), 'div-exp', 'Quotient law: <b>subtract</b> the exponents.') : null],
            t('-' + pw(l, m) + '=-(' + pw(l, m) + ')') + ' and ' + t('(-' + l + ')^{' + n + '}=' + pw(l, n)) + ' (even).<br>' + t('\\frac{-' + pw(l, m) + '}{' + pw(l, n) + '}=-' + l + '^{' + m + '-' + n + '}=' + tgt) + '.', [HQ, HS], '-p^m ÷ (-p)^n');
        } },
        { id: '9d', level: 'EMG', make: function (r) {
          var l = r.pick(ONE), n = r.pick([3, 5]), d = r.int(2, 6), m = n + d, tgt = '-' + pw(l, d);
          return xp(t(pw(l, m) + '\\div (-' + l + ')^{' + n + '}'), tgt, [w(pw(l, d), 'neg-base', t('(-' + l + ')^{' + n + '}') + ' has an odd exponent, so it is negative: ' + t('-' + pw(l, n)) + '. Positive ÷ negative is negative.')],
            t('(-' + l + ')^{' + n + '}=-' + pw(l, n)) + ' (odd).<br>' + t('\\frac{' + pw(l, m) + '}{-' + pw(l, n) + '}=-' + l + '^{' + m + '-' + n + '}=' + tgt) + '.', [HQ, HS], 'c^m ÷ (-c)^n');
        } },
        { id: '9e', level: 'PRG', make: function (r) {
          var l = r.pick(ONE), n = r.pick([2, 4, 6]), d = r.pick([1, 1, 3]), m = n + d, tgt = pw(l, d);
          return xp(t('-(-' + l + ')^{' + m + '}\\div (-' + l + ')^{' + n + '}'), tgt, [w('-' + pw(l, d), 'neg-base', 'Two negatives on top: ' + t('(-' + l + ')^{' + m + '}=-' + pw(l, m)) + ' (odd), and the minus in front makes it ' + t('+' + pw(l, m)) + '. The bottom ' + t('(-' + l + ')^{' + n + '}') + ' is positive.')],
            t('(-' + l + ')^{' + m + '}=-' + pw(l, m)) + ' (odd), so ' + t('-(-' + l + ')^{' + m + '}=' + pw(l, m)) + '. ' + t('(-' + l + ')^{' + n + '}=' + pw(l, n)) + ' (even).<br>' + t('\\frac{' + pw(l, m) + '}{' + pw(l, n) + '}=' + l + '^{' + m + '-' + n + '}=' + tgt) + '.', [HS, 'Find the sign of the top (two negatives) and of the bottom separately, then divide.'], '-(-t)^m ÷ (-t)^n');
        } },
        { id: '9f', level: 'PRG', make: function (r) {
          var l = r.pick(ONE), n = r.int(3, 6), d = r.pick([1, 1, 2]), m = n + d, tgt = '-' + pw(l, d);
          return xp(t('-(-' + pw(l, m) + ')\\div (-(' + pw(l, n) + '))'), tgt, [w(pw(l, d), 'neg-base', 'Top: ' + t('-(-' + pw(l, m) + ')=' + pw(l, m)) + ' is positive. Bottom: ' + t('-(' + pw(l, n) + ')') + ' is negative. Positive ÷ negative is negative.')],
            t('-(-' + pw(l, m) + ')=' + pw(l, m)) + ' and ' + t('-(' + pw(l, n) + ')=-' + pw(l, n)) + '.<br>' + t('\\frac{' + pw(l, m) + '}{-' + pw(l, n) + '}=-' + l + '^{' + m + '-' + n + '}=' + tgt) + '.', [HS, 'Count the minus signs on top and on the bottom (no exponent touches them here).'], '-(-s^m) ÷ (-(s^n))');
        } }] },
      { num: '10', section: 'Part C — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var c, d; do { c = r.pick([2, 3, 4, 5]); d = r.pick([3, 5, 7]); } while (ex.gcd(c, d) > 1);
          var p = r.int(2, 4), q = r.int(2, 4); while (2 * p * q === 2 * p + q) q = r.int(2, 4);
          var e = 2 * p + q, k = [-c * c, d];
          var shown = '\\dfrac{1}{' + (d * d) + '}(' + c + 'x^{' + p + '})^{2}(-' + d + 'yx^{' + q + '})';
          var opts = [{ html: t(mt([c * c, d], [['x', e], ['y', 1]])), why: 'Check the sign: ' + t(c * c + '\\times(-' + d + ')') + ' is negative.' },
            { html: t(mt([-c, d], [['x', e], ['y', 1]])), why: 'Square the coefficient inside the bracket: ' + t('(' + c + 'x^{' + p + '})^{2}=' + (c * c) + 'x^{' + 2 * p + '}') + '.' },
            { html: t(mt(k, [['x', e], ['y', 1]])), right: true },
            { html: t(mt(k, [['x', 2 * p * q], ['y', 1]])), why: 'When you multiply ' + t('x^{' + 2 * p + '}\\cdot x^{' + q + '}') + ', <b>add</b> the exponents — don’t multiply them.' }];
          return P.mc(r, 'The simplified form of ' + t(shown) + ' is', opts,
            'Power law first: ' + t('(' + c + 'x^{' + p + '})^{2}=' + (c * c) + 'x^{' + 2 * p + '}') + '.<br>Product law: ' + t((c * c) + 'x^{' + 2 * p + '}\\times(-' + d + 'yx^{' + q + '})=-' + (c * c * d) + 'x^{' + e + '}y') + '.<br>Then ' + t('\\frac{1}{' + (d * d) + '}\\times(-' + (c * c * d) + ')=-\\frac{' + (c * c * d) + '}{' + (d * d) + '}=' + cTex(k)) + ', so the answer is ' + t(mt(k, [['x', e], ['y', 1]])) + '.', [HO], 'MC multi-law with a fraction', true);
        } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var A, B, a, C, p, q, rr, s, u, v, b, c, ans;
          for (var i = 0; i < 400; i++) {
            A = r.pick([2, 3]); B = r.pick([2, 3]); a = -r.pick([2, 3, 4, 6]); if ((A * A * B * B * B) % -a) continue; C = A * A * B * B * B / -a; if (C < 4) continue;
            p = r.int(2, 4); q = r.int(1, 3); rr = r.int(1, 3); s = r.int(1, 2); b = r.int(1, 5); c = r.int(1, 5); u = 2 * p + 3 * rr - b; v = 2 * q + 3 * s - c;
            if (u < 2 || v < 1) continue; ans = a + b + c; if (ans >= 1) break;
          }
          var shown = '(-' + A + 'm^{' + p + '}' + pw('n', q) + ')^{2}(-' + B + pw('m', rr) + pw('n', s) + ')^{3}\\left(\\dfrac{1}{' + C + 'm^{' + u + '}' + pw('n', v) + '}\\right)';
          return P.nr('The expression ' + t(shown) + ' can be simplified to the form ' + t('am^{b}n^{c}') + ', where ' + t('a') + ', ' + t('b') + ', ' + t('c') + ' are integers. The value of ' + t('a+b+c') + ' is ________.', ans, function (x) {
            if (x === -a + b + c) return { code: 'nr-sign', hint: 'Check the sign of ' + t('a') + ': ' + t('(-' + B + ')^{3}') + ' is an <b>odd</b> power, so it stays negative.' };
            if (x === b + c) return { code: 'nr-noa', hint: 'Don’t forget to add ' + t('a') + ' (the coefficient, including its sign).' };
            return null;
          }, 'Power law: ' + t('(-' + A + 'm^{' + p + '}' + pw('n', q) + ')^{2}=' + (A * A) + 'm^{' + 2 * p + '}n^{' + 2 * q + '}') + ' (even) and ' + t('(-' + B + pw('m', rr) + pw('n', s) + ')^{3}=-' + (B * B * B) + 'm^{' + 3 * rr + '}n^{' + 3 * s + '}') + ' (odd).<br>Product: ' + t('-' + (A * A * B * B * B) + 'm^{' + (2 * p + 3 * rr) + '}n^{' + (2 * q + 3 * s) + '}') + '.<br>Divide by ' + t(C + 'm^{' + u + '}' + pw('n', v)) + ': ' + t(mt(a, [['m', b], ['n', c]])) + '.<br>' + t('a=' + a + ',\\ b=' + b + ',\\ c=' + c) + ', so ' + t('a+b+c=' + ans) + '.', [HO, 'Find ' + t('a') + ' with its sign: count the negatives after the powers are applied.'], 'NR a+b+c');
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var n = r.pick([2, 3]), pq = r.sample([2, 3, 5], 2), m1 = r.int(2, 3), m2 = r.int(2, 3), e1 = r.int(3, 4), e2 = r.int(2, 3), k = r.pick([2, 3]), km = r.pick([2, 3]), kn = r.int(1, 4);
          var lhs = Math.pow(pq[0], m1) * Math.pow(pq[1], m2), rhs = Math.pow(pq[0] * pq[1], m1 + m2);
          var opts = [{ html: t('(a+b)^{' + n + '}=a^{' + n + '}+b^{' + n + '}'), why: 'Try ' + t('a=2,\\ b=3') + ': ' + t('(2+3)^{' + n + '}=' + Math.pow(5, n)) + ' but ' + t('2^{' + n + '}+3^{' + n + '}=' + (Math.pow(2, n) + Math.pow(3, n))) + '. Exponents don’t distribute over a sum.' },
            { html: t(pq[0] + '^{' + m1 + '}\\cdot ' + pq[1] + '^{' + m2 + '}=' + (pq[0] * pq[1]) + '^{' + (m1 + m2) + '}'), why: 'The bases are different, so the product law doesn’t apply: the left side is ' + t(F(lhs)) + ', the right side ' + t(F(rhs)) + '.' },
            { html: t('a^{' + e1 + '}+a^{' + e2 + '}=a^{' + (e1 + e2) + '}'), why: 'Adding powers is not multiplying them. Try ' + t('a=2') + ': ' + t(Math.pow(2, e1) + '+' + Math.pow(2, e2) + '=' + (Math.pow(2, e1) + Math.pow(2, e2))) + ', but ' + t('2^{' + (e1 + e2) + '}=' + Math.pow(2, e1 + e2)) + '.' },
            { html: t('(' + k + 'a)^{' + km + '}\\cdot ' + pw('a', kn) + '=' + Math.pow(k, km) + 'a^{' + (km + kn) + '}'), right: true }];
          return P.mc(r, 'Which statement is true for <b>all</b> nonzero values of the variables?', opts,
            t('(' + k + 'a)^{' + km + '}=' + Math.pow(k, km) + 'a^{' + km + '}') + ' (power of a product), then ' + t(Math.pow(k, km) + 'a^{' + km + '}\\cdot ' + pw('a', kn) + '=' + Math.pow(k, km) + 'a^{' + (km + kn) + '}') + ' (product law). The other three are common traps: exponents don’t distribute over ' + t('+') + ', the product law needs the same base, and adding powers is not multiplying them.', ['Test each statement with small numbers, like ' + t('a=2') + ' and ' + t('b=3') + '.'], 'which is an exponent law');
        } }] },
      { num: '13', section: 'Part D — Extension: variable exponents', stem: '<i>(Extension)</i> Simplify each expression to a single power.', parts: [
        { id: '13a', level: 'EMG', make: function (r) {
          var set = r.pick([['a', ['x', 'y']], ['b', ['m', 'n']], ['k', ['x', 'y']], ['c', ['p', 'q']]]), base = set[0], ls = set[1], x = ls[0], y = ls[1];
          var p = r.int(1, 3), q = r.int(1, 4), s = r.int(2, 4), u = r.int(1, 3), lin = L(0, { [x]: p + s, [y]: q + u }), e1 = linTex(L(0, { [x]: p, [y]: q }), ls), e2 = linTex(L(0, { [x]: s, [y]: u }), ls);
          return vexpPart(t(base + '^{' + e1 + '}\\cdot ' + base + '^{' + e2 + '}'), base, lin, ls, [{ lin: L(0, { [x]: p - s, [y]: q - u }), code: 'add-exp', hint: 'You are <b>multiplying</b> powers, so <b>add</b> the exponents.' }],
            'Product law — add the exponents: ' + t('(' + e1 + ')+(' + e2 + ')=' + linTex(lin, ls)) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, ls) + '}') + '.', ['Product law: same base, so add the exponents — even when they are expressions. Collect the ' + t(x) + ' terms and the ' + t(y) + ' terms.'], 'variable exponents: product');
        } },
        { id: '13b', level: 'EMG', make: function (r) {
          var set = r.pick([['m', 'x'], ['a', 'n'], ['b', 'k'], ['p', 'x']]), base = set[0], v = set[1], A = r.int(7, 15), B = r.int(2, 6), lin = L(A - B, { [v]: 1 });
          return vexpPart(t('\\dfrac{' + base + '^{' + v + '+' + A + '}}{' + base + '^{' + B + '}}'), base, lin, [v], [{ lin: L(A + B, { [v]: 1 }), code: 'add-exp', hint: 'Dividing: <b>subtract</b> the bottom exponent.' }, { lin: L(A, { [v]: 1 - B }), code: 'minus-dist', hint: 'Subtract ' + t(B) + ' from the number part only: ' + t('(' + v + '+' + A + ')-' + B + '=' + v + '+' + (A - B)) + '.' }],
            'Quotient law — subtract: ' + t('(' + v + '+' + A + ')-' + B + '=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HQ], 'variable exponents: quotient');
        } },
        { id: '13c', level: 'PRG', make: function (r) {
          var set = r.pick([['a', 'm'], ['x', 'n'], ['b', 'k'], ['y', 't']]), base = set[0], v = set[1], p = r.int(3, 6), q = r.int(2, 7), rr = r.int(1, p - 1), s = r.int(1, 5), lin = L(q + s, { [v]: p - rr });
          var e1 = linTex(L(q, { [v]: p }), [v]), e2 = linTex(L(-s, { [v]: rr }), [v]);
          return vexpPart(t('\\dfrac{' + base + '^{' + e1 + '}}{' + base + '^{' + e2 + '}}'), base, lin, [v], [{ lin: L(q - s, { [v]: p - rr }), code: 'minus-dist', hint: 'Subtract the <b>whole</b> exponent: ' + t('-(' + e2 + ')=' + linTex(L(s, { [v]: -rr }), [v])) + ' — the minus changes the sign of both terms.' }, { lin: L(q - s, { [v]: p + rr }), code: 'add-exp', hint: 'Dividing: <b>subtract</b> the bottom exponent.' }],
            'Quotient law — subtract the whole bottom exponent: ' + t('(' + e1 + ')-(' + e2 + ')=' + e1 + '-' + (rr === 1 ? '' : rr) + v + '+' + s + '=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HQ, 'Put the bottom exponent in brackets before subtracting: ' + t('(' + e1 + ')-(' + e2 + ')') + '.'], 'variable exponents: quotient with a binomial');
        } },
        { id: '13d', level: 'PRG', make: function (r) {
          var set = r.pick([['x', 'y'], ['a', 'n'], ['m', 'k'], ['b', 't']]), base = set[0], v = set[1], p, q, s, u, a, b, lin;
          do { p = r.int(2, 4); q = r.int(3, 9); s = r.int(1, 3); u = r.int(1, 3); a = r.int(1, 3); b = r.int(2, 8); } while (p + s - a < 1 || q + u - b < 1);
          lin = L(q + u - b, { [v]: p + s - a });
          var e1 = linTex(L(q, { [v]: p }), [v]), e2 = linTex(L(u, { [v]: s }), [v]), e3 = linTex(L(b, { [v]: a }), [v]), top = linTex(L(q + u, { [v]: p + s }), [v]);
          return vexpPart(t('\\dfrac{' + base + '^{' + e1 + '}\\cdot ' + base + '^{' + e2 + '}}{' + base + '^{' + e3 + '}}'), base, lin, [v], [{ lin: L(q + u + b, { [v]: p + s - a }), code: 'minus-dist', hint: 'Subtract the <b>whole</b> bottom exponent: ' + t('-(' + e3 + ')=' + linTex(L(-b, { [v]: -a }), [v])) + '.' }, { lin: L(q + u + b, { [v]: p + s + a }), code: 'add-exp', hint: 'The bottom power is <b>divided</b> out: subtract its exponent.' }],
            'Top, product law: ' + t('(' + e1 + ')+(' + e2 + ')=' + top) + '.<br>Quotient law: ' + t('(' + top + ')-(' + e3 + ')=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HP, HQ], 'variable exponents: product and quotient');
        } }] }
    ],
    extra: EXTRA()
  });

  /* ================= Extra practice (u2_EP02.tex) ================= */
  function EXTRA() {
    return [
      { num: '1', section: 'Extra practice A — Three and four laws in one chain', stem: 'Each expression needs the power, product and quotient laws. Work the coefficients first, then one base at a time. Give every answer with positive exponents.', parts: [
        { id: 'e1a', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], A, B, C, p, q, s, u, v;
          for (var i = 0; i < 200; i++) { A = r.int(2, 5); B = r.pick([2, 3]); var N = A * A * B, ds = []; for (var d = 2; d <= N / 2; d++) if (N % d === 0) ds.push(d); C = r.pick(ds); p = r.int(2, 4); q = r.int(1, 3); s = r.int(2, 5); u = r.int(1, 2 * p); v = r.int(1, 2 * q + s - 1); if (2 * p + 1 - u >= 1 && 2 * q + s - v >= 1) break; }
          var f1 = M(A, { [x]: p, [y]: q }), f2 = M(B, { [x]: 1, [y]: s }), bot = M(C, { [x]: u, [y]: v }), top = mMul(mPow(f1, 2), f2), res = mDiv(top, bot);
          var shown = '\\dfrac{' + wrap(fTex(f1, ls)) + '^{2}' + wrap(fTex(f2, ls)) + '}{' + fTex(bot, ls) + '}';
          return xp(t(shown), mTex(res, ls), [w(mTex(mDiv(mMul(mK(mPow(f1, 2), A), f2), bot), ls), 'not-raised', 'Square the coefficient too: ' + t(A + '^{2}=' + A * A) + '.'), w(mTex(mDiv(mMul(mV(mPow(f1, 2), { [x]: p + 2, [y]: q + 2 }), f2), bot), ls), 'add-power', 'Power of a power: <b>multiply</b> each exponent by ' + t('2') + '.')],
            'Power law: ' + t(wrap(fTex(f1, ls)) + '^{2}=' + mTex(mPow(f1, 2), ls)) + '.<br>Product law on top: ' + t(mTex(mPow(f1, 2), ls) + '\\cdot ' + fTex(f2, ls) + '=' + mTex(top, ls)) + '.<br>Quotient law: ' + t('\\frac{' + mTex(top, ls) + '}{' + fTex(bot, ls) + '}=' + mTex(res, ls)) + '.', [HO], 'EP chain: power, product, quotient');
        } },
        { id: 'e1b', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], f1 = M(r.pick([2, 3]), { [x]: r.int(2, 3), [y]: r.int(1, 2) }), f2 = M(r.int(2, 4), { [x]: r.int(1, 2), [y]: r.int(2, 4) }), n1 = 3, n2 = 2;
          var a1 = mPow(f1, n1), a2 = mPow(f2, n2), res = mMul(a1, a2), shown = wrap(fTex(f1, ls)) + '^{' + n1 + '}' + wrap(fTex(f2, ls)) + '^{' + n2 + '}';
          return xp(t(shown), mTex(res, ls), [w(mTex(mMul(mK(a1, f1.k[0]), mK(a2, f2.k[0])), ls), 'not-raised', 'Each coefficient is raised to its bracket’s power: ' + t(f1.k[0] + '^{3}=' + a1.k[0]) + ' and ' + t(f2.k[0] + '^{2}=' + a2.k[0]) + '.'), w(mTex(mMul(mK(a1, f1.k[0] * 3), mK(a2, f2.k[0] * 2)), ls), 'coef-times-n', t(f1.k[0] + '^{3}') + ' means ' + t(f1.k[0] + '\\times ' + f1.k[0] + '\\times ' + f1.k[0]) + ', not ' + t(f1.k[0] + '\\times 3') + '.')],
            'Power law on each bracket: ' + t(wrap(fTex(f1, ls)) + '^{3}=' + mTex(a1, ls)) + ' and ' + t(wrap(fTex(f2, ls)) + '^{2}=' + mTex(a2, ls)) + '.<br>Product law: ' + t(a1.k[0] + '\\times ' + a2.k[0] + '=' + res.k[0]) + ', ' + ls.map(function (l) { return t(l + '^{' + a1.v[l] + '+' + a2.v[l] + '}=' + pw(l, res.v[l])); }).join(', ') + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HO], 'EP two powers multiplied');
        } },
        { id: 'e1c', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], A = r.pick([2, 3]), C = A === 2 ? r.pick([2, 4]) : r.pick([3, 9]), p = r.int(2, 4), q = r.int(2, 4), f = M(-A, { [x]: p, [y]: q }), bot = M(C, { [x]: r.int(2, 3 * p - 1), [y]: r.int(2, 3 * q - 1) });
          var pr = mPow(f, 3), res = mDiv(pr, bot), shown = '\\dfrac{' + wrap(fTex(f, ls)) + '^{3}}{' + fTex(bot, ls) + '}';
          return xp(t(shown), mTex(res, ls), [w(mTex(mDiv(mK(pr, -pr.k[0]), bot), ls), 'neg-base', 'The power ' + t('3') + ' is odd, so ' + t('(-' + A + ')^{3}=-' + A * A * A) + ' stays negative.'), w(mTex(mDiv(mK(pr, -A), bot), ls), 'not-raised', 'Cube the coefficient: ' + t('(-' + A + ')^{3}=-' + A * A * A) + '.')],
            'Power law: ' + t(wrap(fTex(f, ls)) + '^{3}=' + mTex(pr, ls)) + ' (odd power, so negative).<br>Quotient law: ' + t('\\frac{' + mTex(pr, ls) + '}{' + fTex(bot, ls) + '}=' + mTex(res, ls)) + '.', [HO, HS], 'EP odd power over a monomial');
        } },
        { id: 'e1d', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], A = r.pick([2, 3, 5]), B = r.pick([2, 3]), N = A * A * B * B * B, k = r.pick([2, 3, 4, 6].filter(function (d) { return N % d === 0 && N / d >= 4; }));
          var f1 = M(A, { [x]: r.int(3, 4), [y]: 1 }), f2 = M(B, { [x]: 1, [y]: r.int(2, 3) }), top = mMul(mPow(f1, 2), mPow(f2, 3)), bot = M(N / k, { [x]: r.int(3, top.v[x] - 1), [y]: r.int(2, top.v[y] - 1) }), res = mDiv(top, bot);
          var shown = '\\dfrac{' + wrap(fTex(f1, ls)) + '^{2}' + wrap(fTex(f2, ls)) + '^{3}}{' + fTex(bot, ls) + '}';
          return xp(t(shown), mTex(res, ls), [w(mTex(mDiv(mMul(mK(mPow(f1, 2), A), mK(mPow(f2, 3), B)), bot), ls), 'not-raised', 'Raise each coefficient to its power: ' + t(A + '^{2}=' + A * A) + ', ' + t(B + '^{3}=' + B * B * B) + '.')],
            'Power law: ' + t(wrap(fTex(f1, ls)) + '^{2}=' + mTex(mPow(f1, 2), ls)) + ' and ' + t(wrap(fTex(f2, ls)) + '^{3}=' + mTex(mPow(f2, 3), ls)) + '.<br>Product on top: ' + t(mTex(top, ls)) + '.<br>Quotient law: ' + t('\\frac{' + mTex(top, ls) + '}{' + fTex(bot, ls) + '}=' + mTex(res, ls)) + '.', [HO], 'EP two powers over a monomial');
        } },
        { id: 'e1e', level: 'PRG', make: function (r) {
          var ls = r.pick([['u', 'v'], ['x', 'y'], ['a', 'b'], ['m', 'n']]), x = ls[0], y = ls[1], k = r.pick([2, 3]), B = r.int(2, 4), p = r.int(4, 7), q = r.int(2, 4), rr = r.int(1, p - 2), s = r.int(1, q - 1);
          var inner = mDiv(M(k * B, { [x]: p, [y]: q }), M(B, { [x]: rr, [y]: s })), c3 = mPow(inner, 3), extra = M(1, { [x]: 2, [y]: 2 }), res = mMul(c3, extra);
          var shown = '\\left(\\dfrac{' + (k * B) + pw(x, p) + pw(y, q) + '}{' + B + pw(x, rr) + pw(y, s) + '}\\right)^{3}(' + x + y + ')^{2}';
          return xp(t(shown), mTex(res, ls), [w(mTex(mMul(mK(c3, k), extra), ls), 'not-raised', 'Cube the coefficient: ' + t(k + '^{3}=' + k * k * k) + '.'), w(mTex(mMul(c3, M(1, { [x]: 1, [y]: 1 })), ls), 'top-only', t('(' + x + y + ')^{2}=' + x + '^{2}' + y + '^{2}') + ' — the square goes to both letters.')],
            'Inside first: ' + t('\\frac{' + (k * B) + '}{' + B + '}=' + k) + ', ' + t(x + '^{' + p + '-' + rr + '}=' + pw(x, inner.v[x])) + ', ' + t(y + '^{' + q + '-' + s + '}=' + pw(y, inner.v[y])) + ', giving ' + t(mTex(inner, ls)) + '.<br>Power law: ' + t(wrap(mTex(inner, ls)) + '^{3}=' + mTex(c3, ls)) + ' and ' + t('(' + x + y + ')^{2}=' + x + '^{2}' + y + '^{2}') + '.<br>Product law: ' + t(mTex(res, ls)) + '.', [HO], 'EP quotient cubed times a square');
        } },
        { id: 'e1f', level: 'PRG', make: function (r) {
          var ls = r.pick([['c', 'd'], ['x', 'y'], ['a', 'b'], ['p', 'q']]), x = ls[0], y = ls[1], cs = r.pick([[2, 4, 4, 2], [3, 4, 9, 2]]), A = cs[0], n1 = cs[1], B = cs[2], n2 = cs[3];
          var f1, f2, ex3, top, bot, res;
          for (var i = 0; i < 200; i++) { f1 = M(A, { [x]: r.int(2, 4), [y]: r.int(1, 2) }); f2 = M(B, { [x]: r.int(1, 3), [y]: 1 }); ex3 = M(1, { [x]: r.int(2, 4), [y]: 1 }); top = mPow(f1, n1); bot = mMul(mPow(f2, n2), ex3); res = mDiv(top, bot); if (res.v[x] >= 1 && res.v[y] >= 1) break; }
          var shown = '\\dfrac{' + wrap(fTex(f1, ls)) + '^{' + n1 + '}}{' + wrap(fTex(f2, ls)) + '^{' + n2 + '}\\cdot ' + fTex(ex3, ls) + '}';
          return xp(t(shown), mTex(res, ls), [w(mTex(mDiv(top, mPow(f2, n2)), ls), 'top-only', 'Don’t forget the extra ' + t(fTex(ex3, ls)) + ' in the denominator.')],
            'Power law: ' + t(wrap(fTex(f1, ls)) + '^{' + n1 + '}=' + mTex(top, ls)) + ' and ' + t(wrap(fTex(f2, ls)) + '^{' + n2 + '}=' + mTex(mPow(f2, n2), ls)) + '.<br>Bottom, product law: ' + t(mTex(mPow(f2, n2), ls) + '\\cdot ' + fTex(ex3, ls) + '=' + mTex(bot, ls)) + '.<br>Quotient law: the coefficients cancel (' + t(top.k[0] + '\\div ' + bot.k[0] + '=1') + '), so the answer is ' + t(mTex(res, ls)) + '.', [HO], 'EP coefficients cancel');
        } }] },
      { num: '2', stem: 'Here the outer exponent sits on a <b>whole quotient</b>. Keep fractions exact.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], k = r.pick([2, 3]), B = r.int(2, 5), n = k === 3 ? r.pick([2, 3]) : 3, p = r.int(3, 6), q = r.int(2, 4), inner = mDiv(M(k * B, { [x]: p, [y]: q }), M(B, { [x]: r.int(1, p - 1), [y]: r.int(1, q - 1) })), res = mPow(inner, n);
          var B2 = mDiv(M(k * B, { [x]: p, [y]: q }), inner);
          var shown = '\\left(\\dfrac{' + fTex(M(k * B, { [x]: p, [y]: q }), ls) + '}{' + fTex(B2, ls) + '}\\right)^{' + n + '}';
          return xp(t(shown), mTex(res, ls), powWrongs(inner, n, ls).filter(function (x2) { return x2.code !== 'neg-base'; }),
            'Inside first: ' + t('\\frac{' + fTex(M(k * B, { [x]: p, [y]: q }), ls) + '}{' + fTex(B2, ls) + '}=' + mTex(inner, ls)) + '.<br>Power law: ' + t(wrap(mTex(inner, ls)) + '^{' + n + '}=' + mTex(res, ls)) + '.', [HO], 'EP quotient to a power');
        } },
        { id: 'e2b', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], k = r.pick([2, 3]), n = k === 2 ? r.pick([2, 4]) : 2, p = r.int(3, 6), q = r.int(3, 6), top = M(-k, { [x]: p, [y]: q }), bot = M(1, { [x]: r.int(1, p - 1), [y]: r.int(1, q - 1) }), inner = mDiv(top, bot), res = mPow(inner, n);
          return xp(t('\\left(\\dfrac{' + fTex(top, ls) + '}{' + fTex(bot, ls) + '}\\right)^{' + n + '}'), mTex(res, ls), powWrongs(inner, n, ls),
            'Inside first: ' + t(mTex(inner, ls)) + '.<br>Power law: ' + t('(-' + k + ')^{' + n + '}=' + res.k[0]) + ' (even power, so positive), and each exponent is multiplied by ' + t(n) + '.<br>Answer: ' + t(mTex(res, ls)) + '.', [HO, HS], 'EP negative quotient to an even power');
        } },
        { id: 'e2c', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], k = r.pick([2, 3]), A = r.int(2, 5), p = r.int(2, 5), q = r.int(3, 6), rr = r.int(1, p - 1), s = r.int(1, q - 1), e = r.int(1, 3);
          var top = M(A, { [x]: p, [y]: q }), bot = M(A * k, { [x]: rr, [y]: s }), inner = mDiv(top, bot), sq = mPow(inner, 2), mult = M(k * k, { [x]: e }), res = mMul(sq, mult);
          var shown = '\\left(\\dfrac{' + fTex(top, ls) + '}{' + fTex(bot, ls) + '}\\right)^{2}\\cdot ' + fTex(mult, ls);
          return xp(t(shown), mTex(res, ls), [w(mTex(mMul(mK(sq, inner.k), mult), ls), 'not-raised', 'Square the fraction too: ' + t('\\left(\\frac{1}{' + k + '}\\right)^{2}=\\frac{1}{' + k * k + '}') + '.'), w(mTex(mMul(mK(sq, [k * k, 1]), mult), ls), 'coef-flip', t('\\frac{' + A + '}{' + A * k + '}=\\frac{1}{' + k + '}') + ' — the larger number is on the bottom.')],
            'Inside first: ' + t('\\frac{' + A + '}{' + A * k + '}=\\frac{1}{' + k + '}') + ', giving ' + t(mTex(inner, ls)) + '.<br>Square: ' + t(mTex(sq, ls)) + '.<br>Times ' + t(fTex(mult, ls)) + ': ' + t('\\frac{1}{' + k * k + '}\\times ' + k * k + '=1') + ', so the answer is ' + t(mTex(res, ls)) + '.', [HO], 'EP squared fraction times a monomial');
        } },
        { id: 'e2d', level: 'PRG', make: function (r) {
          var ls = r.pick([['r', 's'], ['x', 'y'], ['a', 'b'], ['m', 'n']]), x = ls[0], y = ls[1], fr = r.pick([[2, 3], [3, 4], [2, 5], [3, 5]]), A, B, C;
          for (var i = 0; i < 100; i++) { A = r.int(2, 6); B = r.int(2, 6); var N = A * B; if (N % fr[0]) continue; C = N / fr[0] * fr[1]; if (C <= 40) break; }
          var f1 = M(A, { [x]: r.int(2, 5), [y]: r.int(1, 3) }), f2 = M(B, { [x]: 1, [y]: r.int(3, 6) }), topm = mMul(f1, f2), bot = M(C, { [x]: r.int(1, topm.v[x] - 1), [y]: r.int(1, topm.v[y] - 1) }), inner = mDiv(topm, bot), res = mPow(inner, 2);
          var shown = '\\left(\\dfrac{' + fTex(f1, ls) + '\\cdot ' + fTex(f2, ls) + '}{' + fTex(bot, ls) + '}\\right)^{2}';
          return xp(t(shown), mTex(res, ls), powWrongs(inner, 2, ls).filter(function (x2) { return x2.code !== 'neg-base'; }),
            'Inside, top: ' + t(fTex(f1, ls) + '\\cdot ' + fTex(f2, ls) + '=' + mTex(topm, ls)) + '.<br>Divide by ' + t(fTex(bot, ls)) + ': ' + t('\\frac{' + N + '}{' + C + '}=' + cTex(inner.k)) + ', giving ' + t(mTex(inner, ls)) + '.<br>Square: ' + t('\\left(' + cTex(inner.k) + '\\right)^{2}=' + cTex(res.k)) + ', exponents doubled: ' + t(mTex(res, ls)) + '.', [HO, 'Reduce the fraction inside before squaring.'], 'EP fraction coefficient squared');
        } },
        { id: 'e2e', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], c = r.pick([[2, 4], [2, 2], [3, 9]]), A = c[0], C = c[1], f = M(A, { [x]: r.int(2, 3), [y]: 1 }), cube = mPow(f, 3), bot = M(C, { [x]: r.int(1, cube.v[x] - 1), [y]: r.int(1, 2) }), inner = mDiv(cube, bot), res = mPow(inner, 2);
          if (!inner.v[y] || inner.v[y] < 1) { bot = M(C, { [x]: bot.v[x], [y]: 1 }); inner = mDiv(cube, bot); res = mPow(inner, 2); }
          var shown = '\\left(\\dfrac{' + wrap(fTex(f, ls)) + '^{3}}{' + fTex(bot, ls) + '}\\right)^{2}';
          return xp(t(shown), mTex(res, ls), powWrongs(inner, 2, ls).filter(function (x2) { return x2.code !== 'neg-base'; }).concat([w(mTex(mPow(mDiv(mK(cube, A), bot), 2), ls), 'not-raised', 'Cube the ' + t(A) + ' inside first: ' + t(A + '^{3}=' + A * A * A) + '.')]),
            'Inside, top: ' + t(wrap(fTex(f, ls)) + '^{3}=' + mTex(cube, ls)) + '.<br>Divide by ' + t(fTex(bot, ls)) + ': ' + t(mTex(inner, ls)) + '.<br>Square: ' + t(mTex(res, ls)) + '.', [HO], 'EP power inside a power');
        } },
        { id: 'e2f', level: 'ADV', make: function (r) {
          var l = r.pick(['k', 'm', 'x', 't']), g = r.pick([2, 3]), A = 2 * g, B = 2, p = r.int(4, 7), q = r.int(1, 3), s = r.int(1, 3);
          var inner = M(-g, { [l]: p - q }), c3 = mPow(inner, 3), second = M([1, g * g], { [l]: 2 * s }), res = mMul(c3, second);
          var shown = '\\left(\\dfrac{-' + A + pw(l, p) + '}{' + B + pw(l, q) + '}\\right)^{3}\\left(\\dfrac{' + pw(l, s) + '}{' + g + '}\\right)^{2}';
          return xp(t(shown), mTex(res, [l]), [w(mTex(mK(res, [-res.k[0], 1]), [l]), 'neg-base', t('(-' + g + ')^{3}=-' + g * g * g) + ': an odd power keeps the negative.'), w(mTex(mMul(c3, M([1, g], { [l]: 2 * s })), [l]), 'top-only', 'The square goes to the ' + t(g) + ' on the bottom too: ' + t(g + '^{2}=' + g * g) + '.')],
            'First bracket: ' + t('\\frac{-' + A + pw(l, p) + '}{' + B + pw(l, q) + '}=-' + g + pw(l, p - q)) + '; cubed: ' + t(mTex(c3, [l])) + ' (odd power, so negative).<br>Second bracket: ' + t('\\frac{' + pw(l, 2 * s) + '}{' + g * g + '}') + '.<br>Multiply: ' + t('-' + g * g * g + '\\times\\frac{1}{' + g * g + '}=-' + g) + ', ' + t(l + '^{' + c3.v[l] + '+' + 2 * s + '}=' + pw(l, res.v[l])) + '.<br>Answer: ' + t(mTex(res, [l])) + '.', [HO, HS], 'EP two powered quotients');
        } }] },
      { num: '3', stem: 'Simplify to a single power first, then evaluate. Don’t reach for a calculator until the exponents are gone.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) {
          var b, k, p, q, c, d, rr;
          for (var i = 0; i < 300; i++) { b = r.pick([2, 3]); k = b === 2 ? r.int(3, 7) : r.int(2, 4); p = r.int(2, 3); q = r.int(2, 4); c = r.int(2, 6); d = r.int(2, 3); rr = k + c * d - p * q; if (rr >= 1 && rr <= 8) break; }
          if (!(rr >= 1 && rr <= 8)) { b = 2; k = 5; p = 3; q = 4; c = 6; d = 2; rr = 5; }
          return evalPart(t('\\dfrac{(' + b + '^{' + p + '})^{' + q + '}\\times ' + pw(String(b), rr) + '}{(' + b + '^{' + c + '})^{' + d + '}}'), b, 1, k, { exp: function (N) { return N === p + q + rr - c - d ? { code: 'add-power', hint: 'Power of a power: <b>multiply</b> the exponents, ' + t('(' + b + '^{' + p + '})^{' + q + '}=' + b + '^{' + p * q + '}') + '.' } : null; },
            sol: t('(' + b + '^{' + p + '})^{' + q + '}=' + b + '^{' + p * q + '}') + ' and ' + t('(' + b + '^{' + c + '})^{' + d + '}=' + b + '^{' + c * d + '}') + '.<br>' + t(b + '^{' + p * q + '+' + rr + '-' + c * d + '}=' + b + '^{' + k + '}=' + F(Math.pow(b, k))) + '.', hints: [HO], text: 'EP evaluate power chain' });
        } },
        { id: 'e3b', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3]), d = b === 3 ? r.int(2, 3) : r.int(3, 5), m = d + r.int(2, 5), n = m - d, s = r.int(1, 2 * d - 1), tot = 2 * d - s;
          return evalPart(t('\\left(\\dfrac{' + b + '^{' + m + '}}{' + b + '^{' + n + '}}\\right)^{2}\\div ' + pw(String(b), s)), b, 1, tot, { exp: function (N) { return N === d + 2 - s ? { code: 'add-power', hint: 'Power of a power: <b>multiply</b> ' + t(d) + ' by ' + t('2') + '.' } : null; },
            sol: 'Inside: ' + t(b + '^{' + m + '-' + n + '}=' + b + '^{' + d + '}') + '. Squared: ' + t(b + '^{' + 2 * d + '}') + '.<br>' + t(b + '^{' + 2 * d + '-' + s + '}=' + b + '^{' + tot + '}=' + F(Math.pow(b, tot))) + '.', hints: ['Inside the bracket first, then the square, then the division.'], text: 'EP evaluate quotient squared' });
        } },
        { id: 'e3c', level: 'PRG', make: function (r) {
          var b = r.pick([2, 3, 5]), d = b === 5 ? 2 : b === 3 ? r.int(2, 3) : r.int(3, 5), e = r.pick([4, 6]), o = r.pick([5, 7]); var m = d + o - e;
          if (m < 1) { o = 7; m = d + o - e; }
          return evalPart(t('\\dfrac{(-' + b + ')^{' + e + '}\\times ' + pw(String(b), m) + '}{(-' + b + ')^{' + o + '}}'), b, -1, d, { sign: 'The top is positive (' + t('(-' + b + ')^{' + e + '}') + ' is an even power) but the bottom ' + t('(-' + b + ')^{' + o + '}') + ' is negative (odd power).',
            sol: t('(-' + b + ')^{' + e + '}=' + b + '^{' + e + '}') + ' (even), ' + t('(-' + b + ')^{' + o + '}=-' + b + '^{' + o + '}') + ' (odd).<br>' + t('\\frac{' + b + '^{' + e + '}\\times ' + pw(String(b), m) + '}{-' + b + '^{' + o + '}}=-' + b + '^{' + e + '+' + m + '-' + o + '}=-' + b + '^{' + d + '}=' + F(-Math.pow(b, d))) + '.', hints: [HS], text: 'EP evaluate with negative bases' });
        } },
        { id: 'e3d', level: 'EMG', make: function (r) {
          var p = 2, q = 3, a = r.pick([2, 3]), n = r.pick([2, 3]), c = r.int(1, a * n - 1), d = r.int(1, n - 1), V = Math.pow(p, a * n - c) * Math.pow(q, n - d);
          var shown = '\\dfrac{(2^{' + a + '}\\times 3)^{' + n + '}}{' + pw('2', c) + '\\times ' + pw('3', d) + '}';
          var p_ = P.number(t(shown) + ' — simplify, then give the value.', V, function (v) { if (v === Math.pow(2, a + n - c) * Math.pow(3, n - d)) return { code: 'add-power', hint: 'Power of a power: ' + t('(2^{' + a + '})^{' + n + '}=2^{' + a * n + '}') + ' — multiply the exponents.' }; if (v === Math.pow(2, a * n - c) * Math.pow(3, 1 - d) || v === Math.pow(2, a * n - c)) return { code: 'top-only', hint: 'The ' + t('3') + ' inside the bracket is raised to the power ' + t(n) + ' too.' }; return null; },
            'Power law: ' + t('(2^{' + a + '}\\times 3)^{' + n + '}=2^{' + a * n + '}\\times 3^{' + n + '}') + '.<br>One base at a time: ' + t('2^{' + a * n + '-' + c + '}\\times 3^{' + n + '-' + d + '}=' + pw('2', a * n - c) + '\\times ' + pw('3', n - d) + '=' + F(V)) + '.', ['The power law gives every factor in the bracket the power ' + t(n) + '. Then work with the 2s and the 3s separately.'], 'EP two bases evaluate');
          return p_;
        } },
        { id: 'e3e', level: 'EMG', make: function (r) {
          var b = r.pick([6, 4, 5, 10]), m = r.int(4, 7), n = m - 2, s = (b === 10 || r.chance(0.3)) ? r.pick([1, 2]) : 2, tot = 4 - s;
          return evalPart(t('\\left(\\dfrac{' + b + '^{' + m + '}}{' + b + '^{' + n + '}}\\right)^{2}\\div ' + pw(String(b), s)), b, 1, tot, {
            sol: 'Inside: ' + t(b + '^{' + m + '-' + n + '}=' + b + '^{2}') + '. Squared: ' + t(b + '^{4}') + '.<br>' + t(b + '^{4-' + s + '}=' + pw(String(b), tot) + '=' + F(Math.pow(b, tot))) + '.', hints: ['Inside the bracket first, then the square, then the division.'], text: 'EP evaluate quotient squared (2)' });
        } },
        { id: 'e3f', level: 'EMG', make: function (r) {
          var b = r.pick([2, 3, 4]), d = b === 2 ? r.int(1, 2) : 1, k = b === 2 ? 3 : r.pick([2, 3]), m = r.int(4, 6), n = r.int(2, 3), s = m + n - d;
          return evalPart(t('-\\left(\\dfrac{' + b + '^{' + m + '}\\times ' + b + '^{' + n + '}}{' + b + '^{' + s + '}}\\right)^{' + k + '}'), b, -1, d * k, { sign: 'The minus sign sits <b>outside</b> the bracket, so it is not raised to the power — the answer is negative.',
            sol: 'Inside: ' + t(b + '^{' + m + '+' + n + '-' + s + '}=' + pw(String(b), d)) + '.<br>' + t('(' + pw(String(b), d) + ')^{' + k + '}=' + b + '^{' + d * k + '}=' + F(Math.pow(b, d * k))) + '. The minus sits outside: ' + t(F(-Math.pow(b, d * k))) + '.', hints: ['Simplify inside the bracket, apply the power, and only then attach the outside minus sign.'], text: 'EP evaluate with outside minus' });
        } }] },
      { num: '4', section: 'Extra practice B — Which order? Brackets first, or distribute first?',
        stem: function (sh) { return 'Consider ' + t(sh.shown) + '. Both routes below are legal, and both must give the same answer.'; },
        shared: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], k = r.pick([2, 3]), B = r.int(2, 4), n = k === 3 ? 2 : r.pick([2, 3]), p = r.int(3, 6), q = r.int(2, 4), rr = r.int(1, p - 1), s = r.int(1, q - 1);
          var top = M(k * B, { [x]: p, [y]: q }), bot = M(B, { [x]: rr, [y]: s });
          return { ls: ls, n: n, top: top, bot: bot, inner: mDiv(top, bot), shown: '\\left(\\dfrac{' + fTex(top, ls) + '}{' + fTex(bot, ls) + '}\\right)^{' + n + '}' };
        },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, sh) {
            var res = mPow(sh.inner, sh.n), fields = [{ name: 'Inside the bracket', label: 'Inside the bracket', mode: 'math', keys: 'expo', vars: sh.ls, wide: true }, { name: 'Answer', label: 'Answer', mode: 'math', keys: 'expo', vars: sh.ls, wide: true }];
            var p = P.fields('<b>Simplify inside the bracket first</b>, then apply the outer exponent.', fields, [K.expo(mTex(sh.inner, sh.ls)), K.expo(mTex(res, sh.ls))], [mTex(sh.inner, sh.ls), mTex(res, sh.ls)], 'Inside: ' + t(mTex(sh.inner, sh.ls)) + '<br>Answer: ' + t(mTex(res, sh.ls)),
              'Inside: ' + t('\\frac{' + fTex(sh.top, sh.ls) + '}{' + fTex(sh.bot, sh.ls) + '}=' + mTex(sh.inner, sh.ls)) + '.<br>Power law: ' + t(wrap(mTex(sh.inner, sh.ls)) + '^{' + sh.n + '}=' + mTex(res, sh.ls)) + '.', [HQ, HW_], 'route 1: inside first');
            p.bad = [[mTex(sh.inner, sh.ls), mTex(mK(res, sh.inner.k), sh.ls)]];
            return p;
          } },
          { id: 'e4b', level: 'EMG', make: function (r, sh) {
            var res = mPow(sh.inner, sh.n), tn = mPow(sh.top, sh.n), bn = mPow(sh.bot, sh.n), ws = ['Numerator', 'Denominator', 'Answer'];
            var fields = ws.map(function (nm) { return { name: nm, label: nm + (nm === 'Answer' ? '' : ' to the power ' + sh.n), mode: 'math', keys: 'expo', vars: sh.ls, wide: true }; });
            var p = P.fields('<b>Distribute the outer exponent first</b> — raise the numerator and the denominator to the power ' + t(sh.n) + ' — then simplify the quotient.', fields, [K.expo(mTex(tn, sh.ls)), K.expo(mTex(bn, sh.ls)), K.expo(mTex(res, sh.ls))], [mTex(tn, sh.ls), mTex(bn, sh.ls), mTex(res, sh.ls)],
              'Numerator: ' + t(mTex(tn, sh.ls)) + '<br>Denominator: ' + t(mTex(bn, sh.ls)) + '<br>Answer: ' + t(mTex(res, sh.ls)),
              t(wrap(fTex(sh.top, sh.ls)) + '^{' + sh.n + '}=' + mTex(tn, sh.ls)) + ' and ' + t(wrap(fTex(sh.bot, sh.ls)) + '^{' + sh.n + '}=' + mTex(bn, sh.ls)) + '.<br>Quotient law: ' + t('\\frac{' + mTex(tn, sh.ls) + '}{' + mTex(bn, sh.ls) + '}=' + mTex(res, sh.ls)) + ' — the same as the first route.', [HW_, HQ], 'route 2: distribute first');
            p.bad = [[mTex(mK(tn, sh.top.k), sh.ls), mTex(bn, sh.ls), mTex(res, sh.ls)]];
            return p;
          } },
          { id: 'e4c', level: 'EMG', make: function (r, sh) {
            var big = mPow(sh.top, sh.n).k[0], bb = mPow(sh.bot, sh.n).k[0];
            return P.mc(r, 'Both routes give ' + t(mTex(mPow(sh.inner, sh.n), sh.ls)) + '. Which route was less work, and why?', [
              { html: 'Inside first: it reduces the coefficient and the exponents <b>before</b> the power, so the power is applied to the smallest numbers.', right: true },
              { html: 'Distributing first: raising everything to the power first makes the numbers easier to cancel.', why: 'Compare: distributing first gives ' + t(F(big)) + ' and ' + t(F(bb)) + ', which you then have to divide. Inside first, you only raise ' + t(sh.inner.k[0]) + ' to the power.' },
              { html: 'Neither — they give the same answer, so they are the same amount of work.', why: 'Same answer doesn’t mean same work. Count the size of the numbers you handled in each route.' },
              { html: 'Inside first, because the power law can’t be used on a fraction.', why: 'It can — the second route used the power of a quotient law on exactly this fraction. The difference is only the amount of work.' }],
              'Inside first shrinks ' + t('\\frac{' + sh.top.k[0] + '}{' + sh.bot.k[0] + '}') + ' to ' + t(sh.inner.k[0]) + ' and lowers the exponents before applying the power. Distributing first pushes the numbers up to ' + t(F(big)) + ' and ' + t(F(bb)) + ', and they then have to be brought back down.', ['Look at the size of the numbers in each route.'], 'which route is less work');
          } }] },
      { num: '5', stem: function (sh) { return 'For each expression, decide which route is shorter, then simplify: (a) ' + t(sh.a) + ', (b) ' + t(sh.b) + ', (c) ' + t(sh.c) + '.'; },
        shared: function (r) {
          var la = r.pick(PAIRS), k = r.int(2, 4), B = r.int(2, 5), p = r.int(5, 8), q = r.int(2, 4), rr = r.int(2, p - 2), s = r.int(1, q - 1);
          var aTop = M(k * B, { [la[0]]: p, [la[1]]: q }), aBot = M(B, { [la[0]]: rr, [la[1]]: s });
          var lb = r.pick(PAIRS), cb = r.pick([[3, 9], [2, 4]]), f1 = M(cb[0], { [lb[0]]: r.int(2, 3), [lb[1]]: r.int(3, 4) }), f2 = M(cb[1], { [lb[0]]: 0, [lb[1]]: 0 });
          f2.v[lb[0]] = r.int(2, 2 * f1.v[lb[0]] - 1); f2.v[lb[1]] = r.int(2, 2 * f1.v[lb[1]] - 1);
          var lc = r.pick(ONE), g = r.int(2, 4), C = r.pick([2, 4]), A = g * C, cA = r.pick([2, 3].filter(function (d) { return A % d === 0; })), cB = A / cA, m1 = r.int(2, 4), m2 = r.int(3, 5), m3 = r.int(2, m1 + m2 - 1);
          return { la: la, aTop: aTop, aBot: aBot, a: '\\left(\\dfrac{' + fTex(aTop, la) + '}{' + fTex(aBot, la) + '}\\right)^{2}',
            lb: lb, f1: f1, f2: f2, b: '\\dfrac{' + wrap(fTex(f1, lb)) + '^{4}}{' + wrap(fTex(f2, lb)) + '^{2}}',
            lc: lc, cA: cA, cB: cB, C: C, m1: m1, m2: m2, m3: m3, g: g, c: '\\left(\\dfrac{' + cA + pw(lc, m1) + '\\cdot ' + cB + pw(lc, m2) + '}{' + C + pw(lc, m3) + '}\\right)^{3}' };
        },
        parts: [
          { id: 'e5a', level: 'PRG', make: function (r, sh) { var inner = mDiv(sh.aTop, sh.aBot), res = mPow(inner, 2); return xp('Simplify (a) ' + t(sh.a) + '.', mTex(res, sh.la), powWrongs(inner, 2, sh.la).filter(function (x) { return x.code !== 'neg-base'; }), 'Inside first is shorter (one bracket, and the coefficients divide evenly).<br>Inside: ' + t(mTex(inner, sh.la)) + '. Squared: ' + t(mTex(res, sh.la)) + '.', [HO], 'EP route (a)'); } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) {
            var t1 = mPow(sh.f1, 4), t2 = mPow(sh.f2, 2), res = mDiv(t1, t2);
            return xp('Simplify (b) ' + t(sh.b) + '.', mTex(res, sh.lb), [w(mTex(mDiv(mK(t1, sh.f1.k[0]), mK(t2, sh.f2.k[0])), sh.lb), 'not-raised', 'Raise each coefficient to its own power: ' + t(sh.f1.k[0] + '^{4}=' + t1.k[0]) + ' and ' + t(sh.f2.k[0] + '^{2}=' + t2.k[0]) + '.')],
              'No single bracket here: the top and bottom are separate brackets with different powers, so distribute first.<br>' + t(wrap(fTex(sh.f1, sh.lb)) + '^{4}=' + mTex(t1, sh.lb)) + ', ' + t(wrap(fTex(sh.f2, sh.lb)) + '^{2}=' + mTex(t2, sh.lb)) + '.<br>Quotient law: ' + t(mTex(res, sh.lb)) + '.', [HO], 'EP route (b)');
          } },
          { id: 'e5c', level: 'PRG', make: function (r, sh) {
            var l = sh.lc, e = sh.m1 + sh.m2 - sh.m3, res = M(sh.g * sh.g * sh.g, { [l]: 3 * e });
            return xp('Simplify (c) ' + t(sh.c) + '.', mTex(res, [l]), powWrongs(M(sh.g, { [l]: e }), 3, [l]).filter(function (x) { return x.code !== 'neg-base'; }),
              'Inside first is shorter: the top collapses to ' + t(sh.cA * sh.cB + pw(l, sh.m1 + sh.m2)) + ', which divides evenly by ' + t(sh.C + pw(l, sh.m3)) + '.<br>Inside: ' + t(mTex(M(sh.g, { [l]: e }), [l])) + '. Cubed: ' + t(mTex(res, [l])) + '.', [HO], 'EP route (c)');
          } },
          { id: 'e5d', level: 'EMG', make: function (r, sh) {
            return P.mc(r, 'For (b) ' + t(sh.b) + ', which route is shorter, and why?', [
              { html: 'Distribute first: the top and bottom are separate brackets with different outside powers, so there is no single bracket to simplify inside.', right: true },
              { html: 'Inside first: divide ' + t(sh.f1.k[0]) + ' by ' + t(sh.f2.k[0]) + ' inside the bracket, then apply the powers.', why: 'The ' + t(sh.f1.k[0]) + ' and the ' + t(sh.f2.k[0]) + ' are in <b>different</b> brackets with different powers (4 and 2), so you can’t divide them before the powers are applied.' },
              { html: 'Either way: cancel the outside exponents 4 and 2 to 2 and 1 first.', why: 'Outside exponents can’t be cancelled like a fraction — they belong to different brackets.' },
              { html: 'Inside first, because the power law only works on one term at a time.', why: 'The power law works on a whole product — that is what distributing does.' }],
              'In (b) the numerator and denominator are <b>separate</b> brackets with different outside exponents, so there is no single “inside” to simplify. Distribute each power first, then use the quotient law.', ['Is there one bracket around the whole expression?'], 'which route for two brackets');
          } }] },
      { num: '6', stem: function (sh) { return 'Simplify ' + t(sh.shown) + ' both ways.'; },
        shared: function (r) {
          var ls = r.pick(PAIRS), fr = r.pick([[2, 3], [3, 4], [2, 5], [3, 5]]), g = r.int(2, 3), p = r.int(3, 6), q = r.int(2, 3), rr = r.int(1, p - 1), s = r.int(1, q - 1);
          var top = M(g * fr[0], { [ls[0]]: p, [ls[1]]: q }), bot = M(g * fr[1], { [ls[0]]: rr, [ls[1]]: s });
          return { ls: ls, top: top, bot: bot, inner: mDiv(top, bot), shown: '\\left(\\dfrac{' + fTex(top, ls) + '}{' + fTex(bot, ls) + '}\\right)^{2}' };
        },
        parts: [
          { id: 'e6a', level: 'PRG', make: function (r, sh) {
            var res = mPow(sh.inner, 2), fields = [{ name: 'Inside the bracket', label: 'Inside the bracket', mode: 'math', keys: 'expo', vars: sh.ls, wide: true }, { name: 'Answer', label: 'Answer', mode: 'math', keys: 'expo', vars: sh.ls, wide: true }];
            var p = P.fields('<b>Inside the brackets first.</b>', fields, [K.expo(mTex(sh.inner, sh.ls)), K.expo(mTex(res, sh.ls))], [mTex(sh.inner, sh.ls), mTex(res, sh.ls)], 'Inside: ' + t(mTex(sh.inner, sh.ls)) + '<br>Answer: ' + t(mTex(res, sh.ls)),
              'Inside: ' + t('\\frac{' + sh.top.k[0] + '}{' + sh.bot.k[0] + '}=' + cTex(sh.inner.k)) + ', giving ' + t(mTex(sh.inner, sh.ls)) + '.<br>Square: ' + t('\\left(' + cTex(sh.inner.k) + '\\right)^{2}=' + cTex(mPow(sh.inner, 2).k)) + ': ' + t(mTex(res, sh.ls)) + '.', [HQ, HW_], 'EP6 inside first');
            p.bad = [[mTex(sh.inner, sh.ls), mTex(mK(res, sh.inner.k), sh.ls)]];
            return p;
          } },
          { id: 'e6b', level: 'PRG', make: function (r, sh) {
            var res = mPow(sh.inner, 2), tn = mPow(sh.top, 2), bn = mPow(sh.bot, 2);
            var fields = ['Numerator squared', 'Denominator squared', 'Answer'].map(function (nm) { return { name: nm, label: nm, mode: 'math', keys: 'expo', vars: sh.ls, wide: true }; });
            var p = P.fields('<b>Distribute the outer exponent first</b>, then simplify.', fields, [K.expo(mTex(tn, sh.ls)), K.expo(mTex(bn, sh.ls)), K.expo(mTex(res, sh.ls))], [mTex(tn, sh.ls), mTex(bn, sh.ls), mTex(res, sh.ls)],
              'Numerator: ' + t(mTex(tn, sh.ls)) + '<br>Denominator: ' + t(mTex(bn, sh.ls)) + '<br>Answer: ' + t(mTex(res, sh.ls)),
              t(wrap(fTex(sh.top, sh.ls)) + '^{2}=' + mTex(tn, sh.ls)) + ', ' + t(wrap(fTex(sh.bot, sh.ls)) + '^{2}=' + mTex(bn, sh.ls)) + '.<br>' + t('\\frac{' + tn.k[0] + '}{' + bn.k[0] + '}=' + cTex(res.k)) + ', then subtract exponents: ' + t(mTex(res, sh.ls)) + ' — the same as (a).', [HW_, HQ], 'EP6 distribute first');
            p.bad = [[mTex(tn, sh.ls), mTex(bn, sh.ls), mTex(mK(res, [tn.k[0], bn.k[0] * 2]), sh.ls)]];
            return p;
          } },
          { id: 'e6c', level: 'EMG', make: function (r, sh) {
            var fr = cTex(sh.inner.k), big = mPow(sh.top, 2).k[0], bb = mPow(sh.bot, 2).k[0];
            return P.mc(r, 'This time the inside route produces a fraction ' + t(fr) + ' straight away. Does that make it the worse route?', [
              { html: 'No — ' + t(fr) + ' is just ' + t('\\frac{' + sh.top.k[0] + '}{' + sh.bot.k[0] + '}') + ' reduced; the answer has a fraction either way, and squaring ' + t(fr) + ' is easier than reducing ' + t('\\frac{' + big + '}{' + bb + '}') + ' later.', right: true },
              { html: 'Yes — fractions should be avoided, so distributing first is better here.', why: 'Distributing first gives ' + t('\\frac{' + big + '}{' + bb + '}') + ', which still reduces to a fraction. The fraction is in the answer whichever route you take.' },
              { html: 'Yes — the inside route gives a different answer when a fraction appears.', why: 'Both routes always give the same answer. Check: ' + t('\\left(' + fr + '\\right)^{2}=\\frac{' + big + '}{' + bb + '}') + ' reduced.' },
              { html: 'No — because the fraction disappears when you square it.', why: 'Squaring ' + t(fr) + ' gives ' + t(cTex(mPow(sh.inner, 2).k)) + ' — still a fraction.' }],
              t(fr) + ' is ' + t('\\frac{' + sh.top.k[0] + '}{' + sh.bot.k[0] + '}') + ' in lowest terms, so the answer has a fraction coefficient whichever route you take. Squaring ' + t(fr) + ' uses smaller numbers than reducing ' + t('\\frac{' + big + '}{' + bb + '}') + ', so the inside route is still the shorter one.', ['Does the other route avoid the fraction?'], 'fraction inside');
          } }] },
      { num: '7', section: 'Extra practice C — Where the negative sign sits',
        stem: function (sh) { return 'These six are the same quotient six ways: the negative sign moves inside or outside the bracket, and the outer exponent is even (' + t(sh.E) + ') or odd (' + t(sh.O) + '). Simplify inside the bracket first.'; },
        shared: function (r) { var l = r.pick(['x', 'a', 'm', 'y', 'p']), k = r.pick([2, 3]), B = r.int(2, 4), q = r.int(1, 3), d = r.int(2, 4); return { l: l, k: k, B: B, q: q, d: d, E: 2, O: 3, A: k * B }; },
        parts: [['e7a', 1, 1, 'E', 'EMG'], ['e7b', -1, 0, 'E', 'EMG'], ['e7c', 1, 1, 'O', 'EMG'], ['e7d', -1, 0, 'O', 'EMG'], ['e7e', -1, 1, 'E', 'PRG'], ['e7f', -1, 1, 'O', 'PRG']].map(function (cfg) {
          return { id: cfg[0], level: cfg[4], make: function (r, sh) {
            var out = cfg[1], innerNeg = cfg[2], n = sh[cfg[3]], l = sh.l, frac = '\\dfrac{' + (innerNeg ? '-' : '') + sh.A + pw(l, sh.q + sh.d) + '}{' + sh.B + pw(l, sh.q) + '}';
            var shown = (out < 0 ? '-' : '') + '\\left(' + frac + '\\right)^{' + n + '}', innerK = innerNeg ? -sh.k : sh.k, sgn = out * (innerNeg && n % 2 ? -1 : 1), V = sgn * Math.pow(sh.k, n), tgt = mt(V, [[l, sh.d * n]]);
            var why = innerNeg ? (n % 2 ? 'The power ' + t(n) + ' is odd, so ' + t('(-' + sh.k + ')^{' + n + '}') + ' stays negative' : 'The power ' + t(n) + ' is even, so ' + t('(-' + sh.k + ')^{' + n + '}') + ' is positive') : 'Inside the bracket everything is positive';
            why += out < 0 ? '; then the minus sign outside makes the result ' + (sgn < 0 ? 'negative' : 'positive') + '.' : '.';
            return xp(t(shown), tgt, [w(mt(-V, [[l, sh.d * n]]), 'neg-base', why), w(mt(V / Math.abs(V) * sh.k, [[l, sh.d * n]]), 'not-raised', 'Raise the coefficient ' + t(sh.k) + ' to the power ' + t(n) + ' too.'), w(mt(V, [[l, sh.d + n]]), 'add-power', 'Power of a power: <b>multiply</b> the exponents.')],
              'Inside: ' + t('\\frac{' + (innerNeg ? '-' : '') + sh.A + pw(l, sh.q + sh.d) + '}{' + sh.B + pw(l, sh.q) + '}=' + mt(innerK, [[l, sh.d]])) + '.<br>' + t('(' + mt(innerK, [[l, sh.d]]) + ')^{' + n + '}=' + mt(Math.pow(innerK, n), [[l, sh.d * n]])) + (out < 0 ? ', then the outside minus: ' + t(tgt) : '') + '.<br>' + why, [HS, 'Simplify inside first. Then ask: is the negative inside the bracket (it gets the power) or outside (it doesn’t)?'], 'sign position ' + cfg[0]);
          } };
        }) },
      { num: '8', stem: 'Now the same idea inside a chain. Watch the sign at every step.', parts: [
        { id: 'e8a', level: 'PRG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], A = r.int(2, 5), p = r.int(2, 4), top = M(A, { [x]: p, [y]: 1 }), bot = M(-A, { [x]: 1, [y]: 1 });
          var tn = mPow(top, 2), bn = mPow(bot, 2), res = mDiv(mK(tn, -tn.k[0]), bn);
          return xp(t('\\dfrac{-' + wrap(fTex(top, ls)) + '^{2}}{' + wrap(fTex(bot, ls)) + '^{2}}'), mTex(res, ls), [w(mTex(mK(res, 1), ls), 'neg-base', 'Top: the minus is <b>outside</b> the bracket, so ' + t('-' + wrap(fTex(top, ls)) + '^{2}') + ' is negative. Bottom: ' + t(wrap(fTex(bot, ls)) + '^{2}') + ' is positive (even power).')],
            'Top: ' + t('-' + wrap(fTex(top, ls)) + '^{2}=-' + mTex(tn, ls)) + '. Bottom: ' + t(wrap(fTex(bot, ls)) + '^{2}=' + mTex(bn, ls)) + ' (even).<br>' + t('\\frac{-' + mTex(tn, ls) + '}{' + mTex(bn, ls) + '}=' + mTex(res, ls)) + '.', [HS], 'EP outside minus over even power', { vars: ls });
        } },
        { id: 'e8b', level: 'PRG', make: function (r) {
          var l = r.pick(ONE), AB = r.pick([[4, 2], [6, 3], [6, 2], [9, 3]]), p = r.int(3, 5), q = r.int(1, p - 1), top = M(-AB[0], { [l]: p }), bot = M(AB[1], { [l]: q });
          var tn = mPow(top, 3), bn = mPow(bot, 3), res = mDiv(tn, mK(bn, -bn.k[0]));
          return xp(t('\\dfrac{' + wrap(fTex(top, [l])) + '^{3}}{-' + wrap(fTex(bot, [l])) + '^{3}}'), mTex(res, [l]), [w(mTex(mK(res, -res.k[0]), [l]), 'neg-base', 'Top: ' + t('(-' + AB[0] + ')^{3}') + ' is negative (odd power). Bottom: the outside minus makes it negative. Negative ÷ negative is positive.')],
            'Top: ' + t(wrap(fTex(top, [l])) + '^{3}=' + mTex(tn, [l])) + ' (odd). Bottom: ' + t('-' + wrap(fTex(bot, [l])) + '^{3}=-' + mTex(bn, [l])) + '.<br>The negatives cancel: ' + t(mTex(res, [l])) + '.', [HS], 'EP odd powers with signs');
        } },
        { id: 'e8c', level: 'PRG', make: function (r) {
          var l = r.pick(ONE), k = r.pick([2, 3]), p = r.int(3, 6), q = r.int(1, p - 1), inner = M(-k, { [l]: p - q }), c3 = mPow(inner, 3), res = mK(c3, -c3.k[0]);
          return xp(t('-\\left(\\dfrac{-' + k + pw(l, p) + '}{' + pw(l, q) + '}\\right)^{3}'), mTex(res, [l]), [w(mTex(c3, [l]), 'neg-base', 'Inside: ' + t(mTex(inner, [l]))+ '; cubed it stays negative, and then the outside minus makes it positive.')],
            'Inside: ' + t(mTex(inner, [l])) + '. Cubed: ' + t(mTex(c3, [l])) + ' (odd).<br>Outside minus: ' + t('-(' + mTex(c3, [l]) + ')=' + mTex(res, [l])) + '.', [HS], 'EP minus outside an odd power');
        } },
        { id: 'e8d', level: 'EMG', make: function (r) {
          var ls = r.pick(PAIRS), x = ls[0], y = ls[1], k = r.pick([2, 3]), n = k === 2 ? 4 : r.pick([2, 4]), p = r.int(2, 3), q = r.int(2, 4), tgt = mt(Math.pow(k, n), [[x, p * n], [y, -q * n]]);
          return xp(t('\\left(-\\dfrac{' + k + pw(x, p) + '}{' + pw(y, q) + '}\\right)^{' + n + '}'), tgt, [w(mt(-Math.pow(k, n), [[x, p * n], [y, -q * n]]), 'neg-base', 'The minus is <b>inside</b> the bracket and the power is even, so the answer is positive.'), w(mt(Math.pow(k, n), [[x, p * n], [y, -q]]), 'top-only', 'The power goes to the denominator too.'), w(mt(k, [[x, p * n], [y, -q * n]]), 'not-raised', 'Raise ' + t(k) + ' to the power too: ' + t(k + '^{' + n + '}=' + Math.pow(k, n)) + '.')],
            'The minus is inside and the power is even, so the result is positive.<br>' + t(k + '^{' + n + '}=' + Math.pow(k, n)) + ', ' + t(x + '^{' + p + '\\times ' + n + '}=' + pw(x, p * n)) + ', ' + t(y + '^{' + q + '\\times ' + n + '}=' + pw(y, q * n)) + '.<br>Answer: ' + t(tgt) + '.', [HW_, HS], 'EP negative fraction to an even power');
        } }] },
      { num: '9', stem: function (sh) { return 'In a long chain you can settle the <b>sign</b> before you touch a single exponent. Consider ' + t(sh.shown) + '.'; },
        shared: function (r) {
          var cs = r.pick([[2, 5, 3, 4], [2, 3, 3, 2], [2, 5, 2, 2], [3, 3, 2, 3]]), A = cs[0], o1 = cs[1], B = cs[2], C = cs[3], p = r.int(2, 4), q = r.int(2, 4), rr = r.int(1, 2), outMinus = r.chance(0.7);
          while (p * o1 - rr * 3 < 1) p++;
          var shown = '\\dfrac{(-' + A + pw('a', p) + ')^{' + o1 + '}(-' + B + pw('b', q) + ')^{2}}{' + (outMinus ? '-' : '') + '(' + C + pw('a', rr) + 'b)^{3}}';
          var res = M([Math.pow(A, o1) * B * B * (outMinus ? 1 : -1), C * C * C], { a: p * o1 - 3 * rr, b: 2 * q - 3 });
          return { A: A, o1: o1, B: B, C: C, p: p, q: q, rr: rr, outMinus: outMinus, shown: shown, res: res, pos: outMinus };
        },
        parts: [
          { id: 'e9a', level: 'EMG', make: function (r, sh) {
            var b1 = t('(-' + sh.A + pw('a', sh.p) + ')^{' + sh.o1 + '}') + ' is negative (odd power)', b2 = t('(-' + sh.B + pw('b', sh.q) + ')^{2}') + ' is positive (even power)', b3 = sh.outMinus ? 'the bottom is negative (the minus sign sits outside its bracket)' : 'the bottom is positive (no negative anywhere in it)';
            var opts = sh.pos ? [
              { html: '<b>Positive</b>: ' + b1 + ', ' + b2 + ', and ' + b3 + '. Negative ÷ negative is positive.', right: true },
              { html: '<b>Negative</b>: there are three minus signs, an odd number.', why: 'Count the negatives <b>after</b> the powers are applied: ' + t('(-' + sh.B + pw('b', sh.q) + ')^{2}') + ' is positive, so its minus sign doesn’t count.' },
              { html: '<b>Negative</b>: the top has a negative raised to an odd power.', why: 'The top is negative — but so is the bottom, and negative ÷ negative is positive.' },
              { html: '<b>Positive</b>: even powers make everything positive.', why: 'Right answer, wrong reason: only the bracket with the even power becomes positive. The odd power keeps its negative, and the outside minus adds another.' }] : [
              { html: '<b>Negative</b>: ' + b1 + ', ' + b2 + ', and ' + b3 + '. Negative ÷ positive is negative.', right: true },
              { html: '<b>Positive</b>: there are two minus signs, an even number.', why: 'Count the negatives <b>after</b> the powers are applied: ' + t('(-' + sh.B + pw('b', sh.q) + ')^{2}') + ' is positive, so its minus sign doesn’t count.' },
              { html: '<b>Positive</b>: even powers make everything positive.', why: 'Only the bracket with the even power becomes positive; the odd power keeps its negative.' },
              { html: '<b>Positive</b>: the bottom is raised to an odd power, which cancels the negative on top.', why: 'The bottom bracket has no negative inside it, so it is positive whatever the power.' }];
            return P.mc(r, 'Without simplifying, is the answer positive or negative?', opts,
              b1.charAt(0).toUpperCase() + b1.slice(1) + '; ' + b2 + '; ' + b3 + '.<br>' + (sh.pos ? 'Negative ÷ negative is <b>positive</b>.' : 'Negative ÷ positive is <b>negative</b>.'), [HS], 'predict the sign');
          } },
          { id: 'e9b', level: 'ADV', make: function (r, sh) {
            var res = sh.res, tgt = mTex(res, ['a', 'b']), topK = -Math.pow(sh.A, sh.o1) * sh.B * sh.B, botK = (sh.outMinus ? -1 : 1) * sh.C * sh.C * sh.C;
            return xp('Simplify ' + t(sh.shown) + ' completely.', tgt, [w(mTex(mK(res, [-res.k[0], res.k[1]]), ['a', 'b']), 'neg-base', 'Check the sign: ' + (sh.pos ? 'one negative on top and one underneath gives a positive answer.' : 'the top is negative and the bottom positive.'))],
              'Top: ' + t('(-' + sh.A + pw('a', sh.p) + ')^{' + sh.o1 + '}=-' + Math.pow(sh.A, sh.o1) + pw('a', sh.p * sh.o1)) + ' and ' + t('(-' + sh.B + pw('b', sh.q) + ')^{2}=' + sh.B * sh.B + pw('b', 2 * sh.q)) + ', so ' + t(topK + pw('a', sh.p * sh.o1) + pw('b', 2 * sh.q)) + '.<br>Bottom: ' + t(botK + pw('a', 3 * sh.rr) + 'b^{3}') + '.<br>' + t('\\frac{' + topK + '}{' + botK + '}=' + cTex(res.k)) + ', ' + t('a^{' + sh.p * sh.o1 + '-' + 3 * sh.rr + '}=' + pw('a', res.v.a)) + ', ' + t('b^{' + 2 * sh.q + '-3}=' + pw('b', res.v.b)) + '.<br>Answer: ' + t(tgt) + '.', [HO, HS], 'EP long chain with signs');
          } },
          { id: 'e9c', level: 'EMG', make: function (r) {
            return P.mc(r, 'Which rule did you use to predict the sign?', [
              { html: 'Count the negative factors after each power is applied (an even power removes a negative, an odd power keeps it, a minus outside a bracket counts once): an even count gives a positive answer, an odd count a negative one.', right: true },
              { html: 'Count every minus sign you can see: an even count gives a positive answer.', why: 'A minus sign inside a bracket with an even power disappears, so it must not be counted.' },
              { html: 'If the largest exponent is odd, the answer is negative.', why: 'Each bracket matters, not just the largest exponent.' },
              { html: 'Minus signs in the denominator don’t affect the sign of the answer.', why: 'They do: a negative divided by a negative is positive.' }],
              'After the powers are applied, an even power has removed its bracket’s negative, an odd power has kept it, and each minus sign outside a bracket is one more negative factor. An even number of negative factors gives a positive answer; an odd number, a negative one.', [HS], 'sign-counting rule');
          } }] },
      { num: '10', section: 'Extra practice D — Symbolic exponents in a chain', stem: 'Simplify each to a single power with the simplest possible exponent.', parts: [
        { id: 'e10a', level: 'PRG', make: function (r) {
          var base = r.pick(['x', 'a', 'y']), v = r.pick(['n', 'k']), c = r.int(1, 4), k = r.int(2, 4), j = r.int(1, k - 1), lin = L(k * c, { [v]: k - j });
          return vexpPart(t('\\dfrac{(' + base + '^{' + v + '+' + c + '})^{' + k + '}}{' + base + '^{' + (j === 1 ? '' : j) + v + '}}'), base, lin, [v], [{ lin: L(c, { [v]: k - j }), code: 'exp-dist', hint: 'Power of a power: multiply <b>every</b> term of the exponent by ' + t(k) + ': ' + t(k + '(' + v + '+' + c + ')=' + k + v + '+' + k * c) + '.' }, { lin: L(c + k, { [v]: 1 - j }), code: 'add-power', hint: 'Power of a power: <b>multiply</b> the exponent by ' + t(k) + ', don’t add ' + t(k) + '.' }],
            'Power law: ' + t('(' + base + '^{' + v + '+' + c + '})^{' + k + '}=' + base + '^{' + k + v + '+' + k * c + '}') + '.<br>Quotient law: ' + t('(' + k + v + '+' + k * c + ')-' + (j === 1 ? '' : j) + v + '=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HW_, HQ], 'symbolic: power then quotient');
        } },
        { id: 'e10b', level: 'PRG', make: function (r) {
          var base = r.pick(['a', 'b', 'x']), v = r.pick(['k', 'n', 't']), al = r.int(2, 3), be = r.int(1, 3), m = 2, ga = r.int(1, m * al - 1), de = r.int(2, 5), lin = L(m * be + de, { [v]: m * al - ga });
          var e1 = linTex(L(be, { [v]: al }), [v]), e2 = linTex(L(-de, { [v]: ga }), [v]);
          return vexpPart(t('\\dfrac{(' + base + '^{' + e1 + '})^{2}}{' + base + '^{' + e2 + '}}'), base, lin, [v], [{ lin: L(m * be - de, { [v]: m * al - ga }), code: 'minus-dist', hint: 'Subtract the <b>whole</b> bottom exponent: ' + t('-(' + e2 + ')=' + linTex(L(de, { [v]: -ga }), [v])) + '.' }, { lin: L(be + de, { [v]: m * al - ga }), code: 'exp-dist', hint: 'Multiply <b>both</b> terms of the exponent by ' + t('2') + '.' }],
            'Power law: ' + t('2(' + e1 + ')=' + linTex(L(m * be, { [v]: m * al }), [v])) + '.<br>Quotient law: ' + t('(' + linTex(L(m * be, { [v]: m * al }), [v]) + ')-(' + e2 + ')=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HW_, HQ], 'symbolic: subtract a binomial');
        } },
        { id: 'e10c', level: 'PRG', make: function (r) {
          var base = r.pick(['y', 'p', 'z']), v = r.pick(['m', 'n']), c = r.int(2, 4), d = r.int(2, 6), lin = L(2 * c + d, { [v]: 1 });
          return vexpPart(t('(' + base + '^{' + v + '+' + c + '})^{2}\\cdot ' + base + '^{' + d + '-' + v + '}'), base, lin, [v], [{ lin: L(c + d, { [v]: 1 }), code: 'exp-dist', hint: 'Multiply <b>both</b> terms of ' + t(v + '+' + c) + ' by ' + t('2') + '.' }, { lin: L(2 * c + d, { [v]: 3 }), code: 'minus-dist', hint: 'Careful with ' + t(d + '-' + v) + ': it adds ' + t('-' + v) + ', not ' + t('+' + v) + '.' }],
            'Power law: ' + t('(' + base + '^{' + v + '+' + c + '})^{2}=' + base + '^{2' + v + '+' + 2 * c + '}') + '.<br>Product law: ' + t('(2' + v + '+' + 2 * c + ')+(' + d + '-' + v + ')=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HW_, HP], 'symbolic: power then product');
        } },
        { id: 'e10d', level: 'ADV', make: function (r) {
          var base = r.pick(['b', 'x', 'c']), v = r.pick(['t', 'n']), m = r.pick([2, 3, 4]), a = r.int(Math.floor(m / 2) + 1, m + 1), g = r.int(1, 2), f = m * g + r.int(1, 3);
          var lin = L(f - m * g, { [v]: 2 * a - m }), e1 = (a === 1 ? '' : a) + v, bot = v + '+' + g, top = linTex(L(f, { [v]: 2 * a }), [v]), botE = linTex(L(m * g, { [v]: m }), [v]);
          return vexpPart(t('\\dfrac{(' + base + '^{' + e1 + '})^{2}\\cdot ' + base + '^{' + f + '}}{(' + base + '^{' + bot + '})^{' + m + '}}'), base, lin, [v], [{ lin: L(f - g, { [v]: 2 * a - m }), code: 'exp-dist', hint: 'Multiply <b>both</b> terms of ' + t(bot) + ' by ' + t(m) + ': ' + t(m + '(' + bot + ')=' + botE) + '.' }, { lin: L(f - g - m, { [v]: 2 * a - 1 }), code: 'add-power', hint: 'Power of a power: <b>multiply</b> the exponent ' + t(bot) + ' by ' + t(m) + ' — don’t add ' + t(m) + '.' }, { lin: L(f - m * g, { [v]: a + 2 - m }), code: 'add-power', hint: 'Power of a power: ' + t('(' + base + '^{' + e1 + '})^{2}=' + base + '^{' + (2 * a) + v + '}') + ' — multiply.' }],
            'Top: ' + t('(' + base + '^{' + e1 + '})^{2}\\cdot ' + base + '^{' + f + '}=' + base + '^{' + top + '}') + '.<br>Bottom: ' + t('(' + base + '^{' + bot + '})^{' + m + '}=' + base + '^{' + botE + '}') + '.<br>Subtract: ' + t('(' + top + ')-(' + botE + ')=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HW_, HQ], 'symbolic: two powers and a product');
        } },
        { id: 'e10e', level: 'PRG', make: function (r) {
          var base = r.pick(['c', 'a', 'z']), v = r.pick(['w', 'n', 'k']), p = r.int(2, 4), q = r.int(1, 4), rr = r.int(1, p - 1), s = r.int(1, 3), n = r.pick([2, 3]), inner = L(q + s, { [v]: p - rr }), lin = L(n * (q + s), { [v]: n * (p - rr) });
          var e1 = linTex(L(q, { [v]: p }), [v]), e2 = linTex(L(-s, { [v]: rr }), [v]);
          return vexpPart(t('\\left(\\dfrac{' + base + '^{' + e1 + '}}{' + base + '^{' + e2 + '}}\\right)^{' + n + '}'), base, lin, [v], [{ lin: L(n * (q - s), { [v]: n * (p - rr) }), code: 'minus-dist', hint: 'Subtract the <b>whole</b> bottom exponent: ' + t('-(' + e2 + ')=' + linTex(L(s, { [v]: -rr }), [v])) + '.' }, { lin: L(q + s, { [v]: n * (p - rr) }), code: 'exp-dist', hint: 'Multiply <b>both</b> terms of the exponent by ' + t(n) + '.' }],
            'Inside: ' + t('(' + e1 + ')-(' + e2 + ')=' + linTex(inner, [v])) + '.<br>Power law: ' + t(n + '(' + linTex(inner, [v]) + ')=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HQ, HW_], 'symbolic: quotient to a power');
        } },
        { id: 'e10f', level: 'ADV', make: function (r) {
          var base = r.pick(['p', 'q', 'x']), v = r.pick(['n', 'k']), m, c, j, h, k;
          do { m = r.pick([3, 4]); c = r.int(1, 2); j = r.int(1, 2); h = r.int(1, 3); k = m - 2 * j + h; } while (k < 1 || h >= m * c + 3);
          var lin = L(0, { [v]: k }), topE = linTex(L(m * c, { [v]: m }), [v]), e3 = (m * c) + '-' + (h === 1 ? '' : h) + v, botE = linTex(L(m * c, { [v]: 2 * j - h }), [v]);
          return vexpPart(t('\\dfrac{(' + base + '^{' + v + '+' + c + '})^{' + m + '}}{(' + base + '^{2})^{' + (j === 1 ? '' : j) + v + '}\\cdot ' + base + '^{' + e3 + '}}'), base, lin, [v], [{ lin: L(0, { [v]: m - 2 * j - h }), code: 'minus-dist', hint: 'Add the bottom exponents first, ' + t(2 * j + v + '+(' + e3 + ')=' + botE) + ', then subtract that whole total from the top.' }, { lin: L(-2, { [v]: m - j + h }), code: 'add-power', hint: 'Power of a power: ' + t('(' + base + '^{2})^{' + (j === 1 ? '' : j) + v + '}=' + base + '^{' + (2 * j) + v + '}') + ' — multiply the exponents.' }, { lin: L(c - m * c, { [v]: m - 2 * j + h }), code: 'exp-dist', hint: 'Multiply <b>both</b> terms of ' + t(v + '+' + c) + ' by ' + t(m) + '.' }],
            'Top: ' + t('(' + base + '^{' + v + '+' + c + '})^{' + m + '}=' + base + '^{' + topE + '}') + '.<br>Bottom: ' + t('(' + base + '^{2})^{' + (j === 1 ? '' : j) + v + '}=' + base + '^{' + (2 * j) + v + '}') + ', and ' + t((2 * j) + v + '+(' + e3 + ')=' + botE) + '.<br>Subtract: ' + t('(' + topE + ')-(' + botE + ')=' + linTex(lin, [v])) + '.<br>Answer: ' + t(base + '^{' + linTex(lin, [v]) + '}') + '.', [HW_, HP, HQ], 'symbolic: everything at once');
        } }] },
      { num: '11', stem: 'Each pair <i>looks</i> different. Simplify both to a single power and decide whether they are equal for <b>every</b> whole number ' + t('n') + ' (assume ' + t('x\\neq 0') + ').', parts: [
        { id: 'e11a', level: 'EMG', make: function (r) { var k = r.int(3, 5); return P.tf(r, t('\\dfrac{(x^{n})^{' + k + '}}{x^{n}}') + ' and ' + t('(x^{n})^{' + (k - 1) + '}') + ' are equal for every ' + t('n') + '.', true, 'Simplify both: the left is ' + t('x^{' + k + 'n-n}=x^{' + (k - 1) + 'n}') + ', and so is the right.', 'Left: ' + t('x^{' + k + 'n-n}=x^{' + (k - 1) + 'n}') + '. Right: ' + t('x^{' + (k - 1) + 'n}') + '. <b>Equal</b> for every ' + t('n') + '.', ['Simplify each side to one power of ' + t('x') + '.'], 'identity check a'); } },
        { id: 'e11b', level: 'EMG', make: function (r) { var j = r.int(1, 3), m = r.pick([2, 3]); return P.tf(r, t('(x^{n+' + j + '})^{' + m + '}') + ' and ' + t('x^{' + m + 'n}\\cdot x^{' + m * j + '}') + ' are equal for every ' + t('n') + '.', true, 'Simplify both: ' + t(m + '(n+' + j + ')=' + m + 'n+' + m * j) + ', and ' + t('x^{' + m + 'n}\\cdot x^{' + m * j + '}=x^{' + m + 'n+' + m * j + '}') + '.', 'Left: ' + t('x^{' + m + 'n+' + m * j + '}') + '. Right: ' + t('x^{' + m + 'n+' + m * j + '}') + '. <b>Equal</b>.', ['Multiply every term of the exponent on the left.'], 'identity check b'); } },
        { id: 'e11c', level: 'EMG', make: function (r) { var k = r.int(3, 5); return P.tf(r, t('\\dfrac{x^{' + k + 'n}}{x^{n}}') + ' and ' + t('x^{' + k + '}') + ' are equal for every ' + t('n') + '.', false, 'The left side is ' + t('x^{' + k + 'n-n}=x^{' + (k - 1) + 'n}') + '. Try ' + t('n=1') + ': ' + t('x^{' + (k - 1) + '}') + ' against ' + t('x^{' + k + '}') + '.', 'Left: ' + t('x^{' + (k - 1) + 'n}') + '; right: ' + t('x^{' + k + '}') + '. They match only if ' + t((k - 1) + 'n=' + k) + ', which has no whole-number solution. <b>Not equal</b>: e.g. ' + t('n=1') + ' gives ' + t('x^{' + (k - 1) + '}') + ' against ' + t('x^{' + k + '}') + '.', ['Subtract the exponents on the left — the ' + t('n') + ' doesn’t disappear.'], 'identity check c'); } },
        { id: 'e11d', level: 'BEG', make: function (r) { var a = r.int(2, 5); return P.tf(r, t('(x^{' + a + '})^{n}') + ' and ' + t('(x^{n})^{' + a + '}') + ' are equal for every ' + t('n') + '.', true, 'Both are ' + t('x^{' + a + 'n}') + ': the power law multiplies the exponents, and ' + t(a + '\\cdot n=n\\cdot ' + a) + '.', 'Both sides are ' + t('x^{' + a + 'n}') + '. <b>Equal</b> for every ' + t('n') + '.', ['Power of a power: multiply the exponents.'], 'identity check d'); } },
        { id: 'e11e', level: 'EMG', make: function (r) { var k = r.pick([2, 3]), lhs = k === 2 ? 'x^{n}\\cdot x^{n}' : 'x^{n}\\cdot x^{n}\\cdot x^{n}', nb = k === 2 ? 3 : 2; return P.tf(r, t(lhs) + ' and ' + t('x^{n^{' + k + '}}') + ' are equal for every ' + t('n') + '.', false, 'The left is ' + t('x^{' + k + 'n}') + ' (add the exponents). Try ' + t('n=' + nb) + ': ' + t('x^{' + k * nb + '}') + ' against ' + t('x^{' + Math.pow(nb, k) + '}') + '.', 'Left: ' + t('x^{' + k + 'n}') + '; right: ' + t('x^{n^{' + k + '}}') + '. ' + t('n=' + nb) + ' gives ' + t('x^{' + k * nb + '}') + ' against ' + t('x^{' + Math.pow(nb, k) + '}') + ': <b>not equal</b>.', ['Multiplying powers adds the exponents — it doesn’t multiply them.'], 'identity check e'); } },
        { id: 'e11f', level: 'EMG', make: function (r) { var m = r.pick([2, 3]), a = r.pick([2, 3]); return P.tf(r, t('\\left(\\dfrac{x^{' + a + 'n}}{x^{' + (a - 1 === 1 ? '' : a - 1) + 'n}}\\right)^{' + m + '}') + ' and ' + t('(x^{n})^{' + m + '}') + ' are equal for every ' + t('n') + '.', true, 'Inside: ' + t('x^{' + a + 'n-' + (a - 1 === 1 ? '' : a - 1) + 'n}=x^{n}') + ', so the left is ' + t('(x^{n})^{' + m + '}') + ' — the same as the right.', 'Inside: ' + t('x^{n}') + '. Left: ' + t('x^{' + m + 'n}') + '. Right: ' + t('x^{' + m + 'n}') + '. <b>Equal</b>.', ['Simplify inside the bracket first.'], 'identity check f'); } }] },
      { num: '12', section: 'Extra practice E — Find the error in a chain',
        stem: function (sh) { return 'Asked to expand ' + t('(' + sh.a + '+' + sh.b + ')^{2}') + ', a student wrote ' + t('(' + sh.a + '+' + sh.b + ')^{2}=' + sh.a + '^{2}+' + sh.b + '^{2}') + '.'; },
        shared: function (r) { var ls = r.pick([['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q']]), u = r.int(2, 6), v = r.int(2, 7); if (u === v) v = u + 1; return { a: ls[0], b: ls[1], u: u, v: v }; },
        parts: [
          { id: 'e12a', level: 'BEG', make: function (r, sh) {
            var L_ = (sh.u + sh.v) * (sh.u + sh.v), R_ = sh.u * sh.u + sh.v * sh.v;
            return P.fields('Substitute ' + t(sh.a + '=' + sh.u) + ' and ' + t(sh.b + '=' + sh.v) + ' into both sides to show the statement is false.', [{ name: 'Left side', label: 'Left side', before: t('(' + sh.a + '+' + sh.b + ')^{2}=') }, { name: 'Right side', label: 'Right side', before: t(sh.a + '^{2}+' + sh.b + '^{2}=') }],
              [K.number(L_, function (v) { return v === R_ ? { code: 'value', hint: 'Add first, then square: ' + t('(' + sh.u + '+' + sh.v + ')^{2}=' + (sh.u + sh.v) + '^{2}') + '.' } : v === 2 * (sh.u + sh.v) ? { code: 'value', hint: 'Squaring means multiplying by itself, not doubling.' } : null; }), K.number(R_, function (v) { return v === L_ ? { code: 'value', hint: 'Square each number separately, then add.' } : null; })], [String(L_), String(R_)],
              t('(' + sh.u + '+' + sh.v + ')^{2}=' + L_) + ', ' + t(sh.u + '^{2}+' + sh.v + '^{2}=' + R_), 'Left: ' + t('(' + sh.u + '+' + sh.v + ')^{2}=' + (sh.u + sh.v) + '^{2}=' + L_) + '. Right: ' + t(sh.u * sh.u + '+' + sh.v * sh.v + '=' + R_) + '.<br>' + t(L_ + '\\neq ' + R_) + ', so the statement is <b>false</b>.', ['Work out the bracket first on the left side.'], 'counterexample (a+b)^2');
          } },
          { id: 'e12b', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b, full = a + '^{2}+2' + a + b + '+' + b + '^{2}';
            var p = P.fields('Expand ' + t('(' + a + '+' + b + ')^{2}=(' + a + '+' + b + ')(' + a + '+' + b + ')') + ' correctly, and state the term the student lost.', [{ name: 'Expansion', label: 'Expansion', before: t('(' + a + '+' + b + ')^{2}='), mode: 'math', keys: 'expo', vars: [a, b], wide: true }, { name: 'Lost term', label: 'Lost term', mode: 'math', keys: 'expo', vars: [a, b] }],
              [polyChk(full, [w(a + '^{2}+' + b + '^{2}', 'lost-2ab', 'That’s the student’s mistake. Multiply out ' + t('(' + a + '+' + b + ')(' + a + '+' + b + ')') + ': four products, two of them are ' + t(a + b) + '.'), w(a + '^{2}+' + a + b + '+' + b + '^{2}', 'lost-2ab', 'There are <b>two</b> ' + t(a + b) + ' terms: ' + t(a + '\\cdot ' + b) + ' and ' + t(b + '\\cdot ' + a) + '.')]), K.expo('2' + a + b, { diag: function (an, ast) { return same(ast, a + b) ? { code: 'lost-2ab', hint: 'There are two ' + t(a + b) + ' terms, so the lost term is ' + t('2' + a + b) + '.' } : null; } })],
              [full, '2' + a + b], t('(' + a + '+' + b + ')^{2}=' + full) + '; the lost term is ' + t('2' + a + b),
              t('(' + a + '+' + b + ')(' + a + '+' + b + ')=' + a + '^{2}+' + a + b + '+' + b + a + '+' + b + '^{2}=' + full) + '.<br>The student lost the middle term ' + t('2' + a + b) + '. (Check with ' + t(a + '=' + sh.u + ',\\ ' + b + '=' + sh.v) + ': ' + t(sh.u * sh.u + '+' + 2 * sh.u * sh.v + '+' + sh.v * sh.v + '=' + (sh.u + sh.v) * (sh.u + sh.v)) + ' ✓)', ['Write the square as ' + t('(' + a + '+' + b + ')(' + a + '+' + b + ')') + ' and multiply each term in the first bracket by each term in the second.'], 'expand (a+b)^2');
            p.bad = [[a + '^{2}+' + b + '^{2}', '2' + a + b], [full, a + b]];
            p.good = [[a + '^2+2' + b + a + '+' + b + '^2', '2' + b + a]];
            return p;
          } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b, q = (a === 'n' || b === 'n') ? 'k' : 'n';
            return P.mc(r, 'Which law did the student think they were using, and what does that law actually require?', [
              { html: 'The power of a product, ' + t('(' + a + b + ')^{' + q + '}=' + a + '^{' + q + '}' + b + '^{' + q + '}') + ' — it needs the bracket to hold <b>factors</b> (multiplied), but ' + t(a + '+' + b) + ' is a sum.', right: true },
              { html: 'The product law, ' + t('x^{m}x^{n}=x^{m+n}') + ' — it needs the same base.', why: 'The product law multiplies two powers of the same base; nothing is being multiplied here. The student “distributed” the exponent over the bracket.' },
              { html: 'The power of a power, ' + t('(x^{m})^{n}=x^{mn}') + ' — it needs a single power inside.', why: 'There is no power inside the bracket. The student gave the exponent to each thing inside — that is the power of a <b>product</b>.' },
              { html: 'The quotient law — it needs a fraction.', why: 'Nothing is divided here.' }],
              'The student used the power of a product, ' + t('(' + a + b + ')^{' + q + '}=' + a + '^{' + q + '}' + b + '^{' + q + '}') + '. That law needs the bracket to hold <b>factors</b> multiplied together. ' + t(a + '+' + b) + ' is a sum of terms, and no exponent law distributes over a sum.', ['What is the operation between ' + t(a) + ' and ' + t(b) + ' inside the bracket?'], 'which law was misused');
          } }] },
      { num: '13', stem: function (sh) { return 'Asked to simplify ' + t('\\dfrac{a^{' + sh.m + '}+a^{' + sh.n + '}}{a^{' + sh.n + '}}') + ', a student crossed out the ' + t('a^{' + sh.n + '}') + ' in the denominator against the ' + t('a^{' + sh.n + '}') + ' in the numerator and wrote ' + t('a^{' + sh.m + '}') + '.'; },
        shared: function (r) { var n = r.int(2, 4), m = n + r.int(1, 3); return { m: m, n: n, a0: r.pick([2, 2, 3]) }; },
        parts: [
          { id: 'e13a', level: 'BEG', make: function (r, sh) {
            var a0 = sh.a0, orig = (Math.pow(a0, sh.m) + Math.pow(a0, sh.n)) / Math.pow(a0, sh.n), stu = Math.pow(a0, sh.m);
            return P.fields('Substitute ' + t('a=' + a0) + ' into the original expression and into the student’s answer.', [{ name: 'Original', label: 'Original expression', before: t('=') }, { name: 'Student', label: 'Student’s answer', before: t('a^{' + sh.m + '}=') }],
              [K.number(orig, function (v) { return v === stu ? { code: 'cancel-term', hint: 'Work it out without cancelling: add the top first, then divide.' } : null; }), K.number(stu)], [String(orig), String(stu)], 'Original ' + t('=' + orig) + ', student’s answer ' + t('=' + F(stu)),
              'Original: ' + t('\\frac{' + a0 + '^{' + sh.m + '}+' + a0 + '^{' + sh.n + '}}{' + a0 + '^{' + sh.n + '}}=\\frac{' + Math.pow(a0, sh.m) + '+' + Math.pow(a0, sh.n) + '}{' + Math.pow(a0, sh.n) + '}=\\frac{' + (Math.pow(a0, sh.m) + Math.pow(a0, sh.n)) + '}{' + Math.pow(a0, sh.n) + '}=' + orig) + '.<br>Student: ' + t(a0 + '^{' + sh.m + '}=' + F(stu)) + '.<br>' + t(orig + '\\neq ' + F(stu)) + ', so the cancelling was illegal: ' + t('a^{' + sh.n + '}') + ' is a <b>term</b> of the numerator, not a factor of it.', ['Add the two numbers on top before dividing.'], 'test the illegal cancel');
          } },
          { id: 'e13b', level: 'EMG', make: function (r, sh) {
            var d = sh.m - sh.n, tgt = pw('a', d) + '+1';
            var p = P.math('Simplify ' + t('\\dfrac{a^{' + sh.m + '}+a^{' + sh.n + '}}{a^{' + sh.n + '}}') + ' correctly by splitting it into two fractions.', polyChk(tgt, [w(pw('a', d), 'lost-one', t('\\frac{a^{' + sh.n + '}}{a^{' + sh.n + '}}=1') + ' — that term doesn’t vanish, it becomes ' + t('1') + '.'), w('a^{' + sh.m + '}', 'cancel-term', 'That’s the student’s answer. Split it first: ' + t('\\frac{a^{' + sh.m + '}}{a^{' + sh.n + '}}+\\frac{a^{' + sh.n + '}}{a^{' + sh.n + '}}') + '.'), w(pw('a', d) + '+0', 'lost-one', t('\\frac{a^{' + sh.n + '}}{a^{' + sh.n + '}}=1') + ', not ' + t('0') + '.')], 'Right value — now split the fraction and simplify each part.'), tgt,
              t('\\frac{a^{' + sh.m + '}+a^{' + sh.n + '}}{a^{' + sh.n + '}}=\\frac{a^{' + sh.m + '}}{a^{' + sh.n + '}}+\\frac{a^{' + sh.n + '}}{a^{' + sh.n + '}}=a^{' + sh.m + '-' + sh.n + '}+1=' + tgt) + '.<br>Check with ' + t('a=2') + ': ' + t(Math.pow(2, d) + '+1=' + (Math.pow(2, d) + 1)) + ' ✓', ['Split: ' + t('\\frac{A+B}{C}=\\frac{A}{C}+\\frac{B}{C}') + '. Then use the quotient law on each part.'], 'split the fraction', { keys: 'expo', vars: ['a'] });
            p.bad = ['a^{' + sh.m + '}', pw('a', d)]; p.good = ['1+' + pw('a', d)];
            return p;
          } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            return P.mc(r, 'Complete the rule: “In a quotient you may cancel a common ______ of the <i>whole</i> numerator, never a single ______ of a sum.”', [
              { html: '<b>factor</b> … <b>term</b>', right: true },
              { html: '<b>term</b> … <b>factor</b>', why: 'It’s the other way round: you may cancel something that <b>multiplies</b> the whole numerator (a factor), not something <b>added</b> to it (a term).' },
              { html: '<b>power</b> … <b>base</b>', why: 'The issue is whether the thing is multiplied (a factor) or added (a term).' },
              { html: '<b>exponent</b> … <b>coefficient</b>', why: 'The issue is whether the thing is multiplied (a factor) or added (a term).' }],
              'You may cancel a common <b>factor</b> of the whole numerator, never a single <b>term</b> of a sum. ' + t('a^{' + sh.n + '}') + ' was only one term of ' + t('a^{' + sh.m + '}+a^{' + sh.n + '}') + '.', ['Factors are multiplied; terms are added.'], 'factor vs term', true);
          } }] },
      { num: '14', stem: 'Three slips that only show up once several laws are in play. For each, name the mistake and give the correct simplification.',
        shared: function (r) { var k = r.pick([2, 3]), B = r.int(2, 4), p = r.int(4, 7), q = r.int(2, p - 2); var o = { k: k, B: B, A: k * B, p: p, q: q, n1: k === 3 ? 2 : r.pick([2, 3]), bc: r.int(2, 5), bd: r.int(2, 4), bp: r.int(5, 9), bq: r.int(2, 5), cp: r.int(3, 6), cq: r.int(2, 5), cn: r.pick([2, 3]) };
          if (o.cq === 2 && o.cn === 2) o.cq = 3; // 2+2 = 2×2 would make the “add the exponents” distractor true
          return o; },
        parts: [
          { id: 'e14a1', sub: 'a i', level: 'PRG', make: function (r, sh) {
            var x = 'x', wrongS = t('\\left(\\dfrac{' + sh.A + 'x^{' + sh.p + '}}{' + sh.B + 'x^{' + sh.q + '}}\\right)^{' + sh.n1 + '}=\\dfrac{' + sh.A + 'x^{' + sh.p * sh.n1 + '}}{' + sh.B + 'x^{' + sh.q * sh.n1 + '}}=' + sh.k + 'x^{' + (sh.p - sh.q) * sh.n1 + '}');
            return P.mc(r, 'What is the mistake in ' + wrongS + '?', [
              { html: 'The outer power reached the powers of ' + t(x) + ' but not the coefficients ' + t(sh.A) + ' and ' + t(sh.B) + '.', right: true },
              { html: 'The exponents should have been added to ' + t(sh.n1) + ', not multiplied by it.', why: 'Power of a power multiplies: ' + t('(x^{' + sh.p + '})^{' + sh.n1 + '}=x^{' + sh.p * sh.n1 + '}') + ' is right.' },
              { html: t(sh.A + '\\div ' + sh.B) + ' was worked out wrongly.', why: t(sh.A + '\\div ' + sh.B + '=' + sh.k) + ' is correct — the problem is that it should have been raised to the power.' },
              { html: 'When dividing, the exponents ' + t(sh.p * sh.n1) + ' and ' + t(sh.q * sh.n1) + ' should be added.', why: 'Dividing subtracts the exponents — that step was right.' }],
              'The power law raises <b>every</b> factor inside the bracket, coefficients included. The student skipped the coefficients.', [HW_], 'find the slip a');
          } },
          { id: 'e14a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            var res = M(Math.pow(sh.k, sh.n1), { x: (sh.p - sh.q) * sh.n1 });
            return xp('Give the correct simplification of ' + t('\\left(\\dfrac{' + sh.A + 'x^{' + sh.p + '}}{' + sh.B + 'x^{' + sh.q + '}}\\right)^{' + sh.n1 + '}') + '.', mTex(res, ['x']), [w(mTex(mK(res, sh.k), ['x']), 'not-raised', 'That’s the student’s answer — the coefficient must be raised to the power too: ' + t(sh.k + '^{' + sh.n1 + '}=' + Math.pow(sh.k, sh.n1)) + '.')],
              'Inside: ' + t(sh.A + '\\div ' + sh.B + '=' + sh.k) + ', ' + t('x^{' + sh.p + '-' + sh.q + '}=x^{' + (sh.p - sh.q) + '}') + '.<br>' + t('(' + sh.k + 'x^{' + (sh.p - sh.q) + '})^{' + sh.n1 + '}=' + mTex(res, ['x'])) + '.', [HW_], 'fix the slip a');
          } },
          { id: 'e14b1', sub: 'b i', level: 'EMG', make: function (r, sh) {
            var c = sh.bc, D = sh.bd, A = D * c, wv = A - D === c ? A + D : A - D, wrongS = t('\\dfrac{' + A + 'm^{' + sh.bp + '}n^{' + sh.bq + '}}{' + D + 'm^{' + sh.bp + '}n}=' + c + 'm^{0}n^{' + (sh.bq - 1) + '}=0');
            return P.mc(r, 'What is the mistake in ' + wrongS + '?', [
              { html: t('m^{0}') + ' was read as ' + t('0') + '. In fact ' + t('m^{0}=1') + ' (for ' + t('m\\neq 0') + ').', right: true },
              { html: 'The ' + t('n') + ' on the bottom has no exponent, so nothing should be subtracted from ' + t('n^{' + sh.bq + '}') + '.', why: t('n') + ' means ' + t('n^{1}') + ', so ' + t('n^{' + sh.bq + '-1}=n^{' + (sh.bq - 1) + '}') + ' is right.' },
              { html: t(A + '\\div ' + D) + ' should be ' + t(wv) + '.', why: 'Coefficients are divided: ' + t(A + '\\div ' + D + '=' + c) + ' is right.' },
              { html: t('m^{' + sh.bp + '-' + sh.bp + '}') + ' should be ' + t('m^{1}') + '.', why: t(sh.bp + '-' + sh.bp + '=0') + ', so it is ' + t('m^{0}') + ' — the problem is what ' + t('m^{0}') + ' equals.' }],
              t('m^{0}=1') + ', not ' + t('0') + '. Anything (except zero) to the power zero is ' + t('1') + ', so the ' + t('m') + ' factor simply disappears.', ['What is ' + t('m^{0}') + '?'], 'find the slip b');
          } },
          { id: 'e14b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
            var c = sh.bc, D = sh.bd, tgt = mt(c, [['n', sh.bq - 1]]);
            return xp('Give the correct simplification of ' + t('\\dfrac{' + (c * D) + 'm^{' + sh.bp + '}n^{' + sh.bq + '}}{' + D + 'm^{' + sh.bp + '}n}') + '.', tgt, [w('0', 'zero-as-zero', t('m^{0}=1') + ', not ' + t('0') + '.'), w(mt(c, [['m', 1], ['n', sh.bq - 1]]), 'leftover-var', t('m^{' + sh.bp + '}\\div m^{' + sh.bp + '}=m^{0}=1') + ' — the ' + t('m') + ' cancels completely.')],
              t((c * D) + '\\div ' + D + '=' + c) + ', ' + t('m^{' + sh.bp + '-' + sh.bp + '}=m^{0}=1') + ', ' + t('n^{' + sh.bq + '-1}=' + pw('n', sh.bq - 1)) + '.<br>Answer: ' + t(tgt) + '.', [HQ], 'fix the slip b', { vars: ['m', 'n'] });
          } },
          { id: 'e14c1', sub: 'c i', level: 'EMG', make: function (r, sh) {
            var wrongS = t('\\left(\\dfrac{a^{' + sh.cp + '}}{b^{' + sh.cq + '}}\\right)^{' + sh.cn + '}=\\dfrac{a^{' + sh.cp + '}}{b^{' + sh.cq * sh.cn + '}}');
            return P.mc(r, 'What is the mistake in ' + wrongS + '?', [
              { html: 'The outer exponent reached the denominator but not the numerator.', right: true },
              { html: 'The exponent of ' + t('b') + ' should be ' + t(sh.cq + '+' + sh.cn) + '.', why: 'Power of a power multiplies: ' + t('(b^{' + sh.cq + '})^{' + sh.cn + '}=b^{' + sh.cq * sh.cn + '}') + ' is right.' },
              { html: 'A power of a quotient can’t be simplified.', why: 'It can: ' + t('\\left(\\frac{a}{b}\\right)^{n}=\\frac{a^{n}}{b^{n}}') + '.' },
              { html: 'The answer should have a negative exponent.', why: 'No negatives are involved; the issue is the numerator.' }],
              'The power of a quotient raises <b>both</b> the numerator and the denominator: ' + t('\\left(\\frac{a^{' + sh.cp + '}}{b^{' + sh.cq + '}}\\right)^{' + sh.cn + '}=\\frac{a^{' + sh.cp * sh.cn + '}}{b^{' + sh.cq * sh.cn + '}}') + '.', [HW_], 'find the slip c');
          } },
          { id: 'e14c2', sub: 'c ii', level: 'BEG', make: function (r, sh) {
            var tgt = mt(1, [['a', sh.cp * sh.cn], ['b', -sh.cq * sh.cn]]);
            return xp('Give the correct simplification of ' + t('\\left(\\dfrac{a^{' + sh.cp + '}}{b^{' + sh.cq + '}}\\right)^{' + sh.cn + '}') + '.', tgt, [w(mt(1, [['a', sh.cp], ['b', -sh.cq * sh.cn]]), 'top-only', 'That’s the student’s answer — raise the numerator too: ' + t('(a^{' + sh.cp + '})^{' + sh.cn + '}=a^{' + sh.cp * sh.cn + '}') + '.'), w(mt(1, [['a', sh.cp + sh.cn], ['b', -(sh.cq + sh.cn)]]), 'add-power', 'Power of a power: <b>multiply</b> the exponents.')],
              t('a^{' + sh.cp + '\\times ' + sh.cn + '}=a^{' + sh.cp * sh.cn + '}') + ' and ' + t('b^{' + sh.cq + '\\times ' + sh.cn + '}=b^{' + sh.cq * sh.cn + '}') + '.<br>Answer: ' + t(tgt) + '.', [HW_], 'fix the slip c');
          } }] },
      { num: '15', section: 'Extra practice F — Which laws distribute, and which do not?', stem: 'Decide whether each statement is <b>always true</b> (assume no denominator is zero).', parts: [
        { id: 'e15a', level: 'LIM', make: function (r) { var n = r.int(2, 5); return P.tf(r, t('(ab)^{' + n + '}=a^{' + n + '}b^{' + n + '}') + ' is always true.', true, 'Power of a product: ' + t('(ab)^{' + n + '}') + ' is ' + n + ' copies of ' + t('ab') + ', which regroup into ' + t('a^{' + n + '}b^{' + n + '}') + '.', '<b>Always true</b> (power of a product): ' + n + ' copies of ' + t('ab') + ' regroup into ' + n + ' copies of ' + t('a') + ' times ' + n + ' copies of ' + t('b') + '.', ['Write out the copies of ' + t('ab') + '.'], 'distributes over a product'); } },
        { id: 'e15b', level: 'EMG', make: function (r) { var n = r.pick([2, 3]); return P.tf(r, t('(a+b)^{' + n + '}=a^{' + n + '}+b^{' + n + '}') + ' is always true.', false, 'Try ' + t('a=1,\\ b=1') + ': ' + t('(1+1)^{' + n + '}=' + Math.pow(2, n)) + ', but ' + t('1^{' + n + '}+1^{' + n + '}=2') + '.', '<b>Not always true.</b> ' + t('a=1,\\ b=1') + ': left ' + t(Math.pow(2, n)) + ', right ' + t('2') + '. Exponents don’t distribute over a sum.', ['Try ' + t('a=1') + ' and ' + t('b=1') + '.'], 'not over a sum'); } },
        { id: 'e15c', level: 'LIM', make: function (r) { var n = r.int(2, 5); return P.tf(r, t('\\left(\\dfrac{a}{b}\\right)^{' + n + '}=\\dfrac{a^{' + n + '}}{b^{' + n + '}}') + ' is always true.', true, 'Power of a quotient: ' + n + ' copies of ' + t('\\frac{a}{b}') + ' multiply to ' + t('\\frac{a^{' + n + '}}{b^{' + n + '}}') + '.', '<b>Always true</b> (power of a quotient, ' + t('b\\neq 0') + ').', ['Multiply ' + t('\\frac{a}{b}') + ' by itself.'], 'distributes over a quotient'); } },
        { id: 'e15d', level: 'EMG', make: function (r) { var n = r.pick([2, 3]); return P.tf(r, t('\\left(\\dfrac{a}{b}\\right)^{' + n + '}=\\dfrac{a^{' + n + '}}{b}') + ' is always true.', false, 'The denominator wasn’t raised to the power. Try ' + t('a=2,\\ b=3') + ': ' + t('\\frac{' + Math.pow(2, n) + '}{' + Math.pow(3, n) + '}\\neq\\frac{' + Math.pow(2, n) + '}{3}') + '.', '<b>Not always true</b> — the denominator must be raised too. ' + t('a=2,\\ b=3') + ': ' + t('\\frac{' + Math.pow(2, n) + '}{' + Math.pow(3, n) + '}\\neq\\frac{' + Math.pow(2, n) + '}{3}') + '.', ['Does the power reach the denominator?'], 'denominator not raised'); } },
        { id: 'e15e', level: 'EMG', make: function (r) { var u = r.int(4, 7), v = r.int(1, u - 1); return P.tf(r, t('(a-b)^{2}=a^{2}-b^{2}') + ' is always true.', false, 'Try ' + t('a=' + u + ',\\ b=' + v) + ': ' + t('(' + u + '-' + v + ')^{2}=' + (u - v) * (u - v)) + ', but ' + t(u * u + '-' + v * v + '=' + (u * u - v * v)) + '.', '<b>Not always true.</b> ' + t('a=' + u + ',\\ b=' + v) + ': ' + t((u - v) * (u - v) + '\\neq ' + (u * u - v * v)) + '. Exponents don’t distribute over a difference.', ['Try some numbers.'], 'not over a difference'); } },
        { id: 'e15f', level: 'BEG', make: function (r) { var k = r.pick([2, 3, 4, 5]); return P.tf(r, t('(' + k + 'ab)^{2}=' + k * k + 'a^{2}b^{2}') + ' is always true.', true, t(k) + ', ' + t('a') + ' and ' + t('b') + ' are all factors, so each one is squared: ' + t(k + '^{2}a^{2}b^{2}=' + k * k + 'a^{2}b^{2}') + '.', '<b>Always true</b>: every factor is squared, ' + t(k + '^{2}=' + k * k) + '.', ['Square each factor in the bracket.'], 'coefficient squared'); } },
        { id: 'e15g', level: 'EMG', make: function (r) {
          return P.mc(r, 'Every “always true” statement above has one feature in common, and every false one breaks it. Which is it — and is ' + t('(ab)^{n}=a^{n}b^{n}') + ' always true?', [
            { html: 'The bracket holds only <b>factors</b> (multiplied or divided) and every factor gets the exponent — so yes, ' + t('(ab)^{n}=a^{n}b^{n}') + ' is always true.', right: true },
            { html: 'They all use the exponent ' + t('2') + ' or ' + t('3') + ' — so ' + t('(ab)^{n}=a^{n}b^{n}') + ' is only true for small ' + t('n') + '.', why: 'The exponent isn’t the issue; the power of a product works for every whole number ' + t('n') + '.' },
            { html: 'They contain no fractions — so ' + t('(ab)^{n}=a^{n}b^{n}') + ' is always true.', why: t('\\left(\\frac{a}{b}\\right)^{3}=\\frac{a^{3}}{b^{3}}') + ' has a fraction and is always true. Look at what is <b>inside</b> the bracket.' },
            { html: 'They are true only for positive ' + t('a') + ' and ' + t('b') + ' — so ' + t('(ab)^{n}=a^{n}b^{n}') + ' is not always true.', why: 'Signs don’t matter here: ' + t('(ab)^{n}') + ' is ' + t('n') + ' copies of ' + t('ab') + ' for any values.' }],
            'True statements have only <b>factors</b> in the bracket and give the exponent to every one of them. (b) and (e) hold <b>terms</b> (added or subtracted); (d) didn’t give the exponent to ' + t('b') + '. So ' + t('(ab)^{n}=a^{n}b^{n}') + ' is always true: ' + t('n') + ' copies of ' + t('ab') + ' regroup into ' + t('a^{n}b^{n}') + '.', ['Compare what is inside the brackets of the true and the false statements.'], 'what distributes');
        } }] },
      { num: '16', stem: 'Question 15 settled that ' + t('(a+b)^{n}=a^{n}+b^{n}') + ' is not a law. But is it <i>ever</i> true?', parts: [
        { id: 'e16a', level: 'EMG', make: function (r) {
          var p = P.math('Expand ' + t('(a+b)^{2}') + ' and subtract ' + t('a^{2}+b^{2}') + '. What is left?', polyChk('2ab', [w('0', 'lost-2ab', t('(a+b)^{2}') + ' is not ' + t('a^{2}+b^{2}') + ': expand it as ' + t('(a+b)(a+b)') + '.'), w('ab', 'lost-2ab', 'There are two ' + t('ab') + ' terms in ' + t('(a+b)^{2}') + '.')]), '2ab',
            t('(a+b)^{2}-(a^{2}+b^{2})=a^{2}+2ab+b^{2}-a^{2}-b^{2}=2ab') + '. For the statement to hold this must be ' + t('0') + ', so ' + t('a=0') + ' or ' + t('b=0') + '.', ['Expand ' + t('(a+b)(a+b)') + ' first.'], '(a+b)^2 - (a^2+b^2)', { keys: 'expo', vars: ['a', 'b'] });
          p.bad = ['0', 'ab']; return p;
        } },
        { id: 'e16b', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 4, 5, 6, 7, -3, -5]);
          return P.number('For ' + t('n=2') + ' the statement ' + t('(a+b)^{2}=a^{2}+b^{2}') + ' needs ' + t('2ab=0') + '. If ' + t('b=' + k) + ', what value of ' + t('a') + ' makes it true?', 0, function (v) { if (v === -k) return { code: 'pair', hint: 'Check: ' + t('2ab=2(' + v + ')(' + k + ')\\neq 0') + '. A product is zero only when one factor is zero.' }; return { code: 'pair', hint: 'Check ' + t('2ab') + ' with your value: is it ' + t('0') + '?' }; },
            t('2a(' + k + ')=0') + ' only when ' + t('a=0') + '. Check: ' + t('(0+' + pc(k) + ')^{2}=' + k * k) + ' and ' + t('0^{2}+' + pc(k) + '^{2}=' + k * k) + ' ✓. If ' + t('a') + ' and ' + t('b') + ' were both non-zero, the two sides would differ by ' + t('2ab\\neq 0') + '.', ['A product is zero only when one of its factors is zero.'], 'when (a+b)^2 = a^2+b^2');
        } },
        { id: 'e16c', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 4, 5, 6]);
          return P.number('For ' + t('n=3') + ': ' + t('(a+b)^{3}-(a^{3}+b^{3})=3ab(a+b)') + '. This time both ' + t('a') + ' and ' + t('b') + ' can be non-zero. If ' + t('a=' + k) + ', find a <b>non-zero</b> ' + t('b') + ' with ' + t('(a+b)^{3}=a^{3}+b^{3}') + '.', -k, function (v) { if (v === 0) return { code: 'not-zero', hint: t('b=0') + ' works, but the question asks for a <b>non-zero</b> ' + t('b') + '. Which other factor of ' + t('3ab(a+b)') + ' can be zero?' }; if (v === k) return { code: 'pair', hint: 'Check: ' + t('(' + k + '+' + k + ')^{3}=' + 8 * k * k * k) + ' but ' + t(k + '^{3}+' + k + '^{3}=' + 2 * k * k * k) + '. Make ' + t('a+b=0') + '.' }; return { code: 'pair', hint: 'Which factor of ' + t('3ab(a+b)') + ' can be zero when ' + t('a') + ' and ' + t('b') + ' are both non-zero?' }; },
            t('3ab(a+b)=0') + ' when ' + t('a=0') + ', ' + t('b=0') + ' or ' + t('a+b=0') + '. With ' + t('a=' + k) + ' and ' + t('b\\neq 0') + ', we need ' + t('b=-' + k) + '.<br>Check: ' + t('(' + k + '+(-' + k + '))^{3}=0') + ' and ' + t(k + '^{3}+(-' + k + ')^{3}=' + k * k * k + '-' + k * k * k + '=0') + ' ✓', ['Look at the factor ' + t('(a+b)') + '.'], 'when (a+b)^3 = a^3+b^3');
        } },
        { id: 'e16d', level: 'EMG', make: function (r) {
          return P.mc(r, 'What happens when ' + t('n=1') + '?', [
            { html: t('(a+b)^{1}=a+b=a^{1}+b^{1}') + ' for every ' + t('a') + ' and ' + t('b') + ' — a first power changes nothing, so there is nothing to distribute.', right: true },
            { html: 'It is false for ' + t('n=1') + ' too, e.g. ' + t('a=b=1') + '.', why: 'Check: ' + t('(1+1)^{1}=2') + ' and ' + t('1^{1}+1^{1}=2') + '.' },
            { html: 'It is true only when ' + t('a') + ' or ' + t('b') + ' is ' + t('0') + ', as for ' + t('n=2') + '.', why: 'With ' + t('n=1') + ' both sides are just ' + t('a+b') + ' — always equal.' },
            { html: 'It is true only when ' + t('a=-b') + ', as for ' + t('n=3') + '.', why: 'With ' + t('n=1') + ' both sides are just ' + t('a+b') + ' — always equal.' }],
            'With ' + t('n=1') + ' the statement reads ' + t('a+b=a+b') + ', true for every ' + t('a') + ' and ' + t('b') + '. A first power changes nothing, so it isn’t really an exception to anything.', ['Write out ' + t('(a+b)^{1}') + ' and ' + t('a^{1}+b^{1}') + '.'], 'n = 1 case');
        } }] },
      { num: '17', section: 'Extra practice G — Stretch',
        stem: function (sh) { return 'An expression that collapses all the way to ' + t('1') + ': ' + t(sh.shown + '=1') + '.'; },
        shared: function (r) {
          var cs = r.pick([[2, 3], [2, 5], [3, 2], [2, 2]]), A = cs[0], B = cs[1], p = r.int(2, 3), q = r.int(2, 4), num = mMul(mPow(M(A, { x: p, y: q }), 3), mPow(M(B, { x: 1, y: 1 }), 2));
          var C = r.pick([5, 3, 2, 4]), m = r.int(2, 5);
          return { A: A, B: B, p: p, q: q, num: num, C: C, m: m, shown: '\\dfrac{(' + A + pw('x', p) + pw('y', q) + ')^{3}(' + B + 'xy)^{2}}{' + mTex(num, ['x', 'y']) + '}' };
        },
        parts: [
          { id: 'e17a', level: 'PRG', make: function (r, sh) {
            var res = sh.num;
            return xp('Show the numerator before you cancel: simplify ' + t('(' + sh.A + pw('x', sh.p) + pw('y', sh.q) + ')^{3}(' + sh.B + 'xy)^{2}') + '.', mTex(res, ['x', 'y']), [w(mTex(mK(res, sh.A * sh.B), ['x', 'y']), 'not-raised', 'Raise each coefficient to its power: ' + t(sh.A + '^{3}=' + sh.A * sh.A * sh.A) + ' and ' + t(sh.B + '^{2}=' + sh.B * sh.B) + '.'), w(mTex(mV(res, { x: sh.p * 3 + 1, y: sh.q * 3 + 1 }), ['x', 'y']), 'hidden-one', t('(xy)^{2}=x^{2}y^{2}') + ' — the square doubles the hidden exponent ' + t('1') + '.')],
              'Power law: ' + t('(' + sh.A + pw('x', sh.p) + pw('y', sh.q) + ')^{3}=' + sh.A * sh.A * sh.A + 'x^{' + 3 * sh.p + '}y^{' + 3 * sh.q + '}') + ' and ' + t('(' + sh.B + 'xy)^{2}=' + sh.B * sh.B + 'x^{2}y^{2}') + '.<br>Product law: ' + t(mTex(res, ['x', 'y'])) + '.<br>That equals the denominator, so the quotient is ' + t('x^{0}y^{0}=1') + '.', [HW_, HP], 'numerator before cancelling');
          } },
          { id: 'e17b', level: 'EMG', make: function (r) {
            return P.mc(r, 'What are the restrictions on ' + t('x') + ' and ' + t('y') + ', and which exponent law makes them necessary?', [
              { html: t('x\\neq 0') + ' and ' + t('y\\neq 0') + ': cancelling gives ' + t('x^{0}') + ' and ' + t('y^{0}') + ', and ' + t('a^{0}=1') + ' holds only for ' + t('a\\neq 0') + ' (also, the denominator can’t be ' + t('0') + ').', right: true },
              { html: t('x\\neq 1') + ' and ' + t('y\\neq 1') + ', because of the quotient law.', why: 'Try ' + t('x=1,\\ y=1') + ': both top and bottom are ' + t('72') + ' — no problem. The trouble is dividing by ' + t('0') + '.' },
              { html: 'No restrictions: the answer is ' + t('1') + ' for every ' + t('x') + ' and ' + t('y') + '.', why: 'Try ' + t('x=0') + ': you get ' + t('\\frac{0}{0}') + ', which is undefined.' },
              { html: t('x>0') + ' and ' + t('y>0') + ', because the power law needs positive bases.', why: 'Negative values are fine (e.g. ' + t('x=-1') + '). Only ' + t('0') + ' causes trouble.' }],
              t('x\\neq 0') + ' and ' + t('y\\neq 0') + '. Cancelling is the quotient law, ' + t('x^{8-8}=x^{0}') + ', and the zero exponent law ' + t('a^{0}=1') + ' only holds for ' + t('a\\neq 0') + ' (and we can’t divide by ' + t('0') + ').', ['What happens to the denominator when ' + t('x=0') + '?'], 'restrictions');
          } },
          { id: 'e17c', level: 'EMG', make: function (r, sh) {
            var C = sh.C, m = sh.m, tgt = mt(C * C, [['m', 2 * m], ['n', 2]]);
            var chk = function (resp) {
              var a = K.read(resp); if (a.res) return a.res;
              if (same(a.ast, tgt)) return ok();
              if (same(a.ast, mt(C, [['m', 2 * m], ['n', 2]]))) return wrong('not-raised', 'Square the ' + t(C) + ' too: ' + t(C + '^{2}=' + C * C) + '.');
              if (same(a.ast, mt(C * C, [['m', m + 2], ['n', 2]]))) return wrong('add-power', 'Power of a power: ' + t('(m^{' + m + '})^{2}=m^{' + 2 * m + '}') + '.');
              if (same(a.ast, mt(C * C, [['m', 2 * m], ['n', 1]]))) return wrong('hidden-one', t('n^{2}') + ': the square doubles the hidden exponent ' + t('1') + '.');
              if (same(a.ast, mt(2 * C, [['m', 2 * m], ['n', 2]]))) return wrong('coef-times-n', t(C + '^{2}=' + C * C) + ', not ' + t(C + '\\times 2') + '.');
              return wrong('value', 'For the quotient to be ' + t('1') + ', the denominator must equal the numerator. Work out ' + t('(' + C + 'm^{' + m + '}n)^{2}') + ' first.');
            };
            var p = P.math('Build your own expression equal to ' + t('1') + ' whose numerator is ' + t('(' + C + 'm^{' + m + '}n)^{2}') + ': type a denominator that works.', chk, tgt,
              t('(' + C + 'm^{' + m + '}n)^{2}=' + tgt) + ', so any denominator equal to ' + t(tgt) + ' works, e.g. ' + t('\\dfrac{(' + C + 'm^{' + m + '}n)^{2}}{' + tgt + '}=1') + ' (with ' + t('m,n\\neq 0') + ').', ['The denominator has to equal the numerator.'], 'build an expression equal to 1', { keys: 'expo', vars: ['m', 'n'], before: t('\\dfrac{(' + C + 'm^{' + m + '}n)^{2}}{\\square}=1,\\quad \\square=') });
            p.bad = [mt(C, [['m', 2 * m], ['n', 2]]), mt(C * C, [['m', m + 2], ['n', 2]]), mt(C * C, [['m', 2 * m], ['n', 1]])].filter(function (x) { return !sameTex(x, tgt); });
            p.good = [C + 'm^{' + (m + 1) + '}n\\cdot ' + C + 'm^{' + (m - 1) + '}n'];
            return p;
          } }] },
      { num: '18', stem: function (sh) { return 'Simplify ' + t(sh.shown) + '.'; },
        shared: function (r) {
          var opts = [[4, 8, 2], [4, 2, 8], [4, 4, 4], [2, 2, 2], [3, 3, 3]], c = r.pick(opts), A = c[0], B = c[1], C = c[2], p = r.int(2, 4), rr = r.int(1, 2 * p - 1), u = 2 * p - rr, q = r.int(1, 3), s = r.int(1, 2 * q), tt = r.int(1, 3);
          while (2 * q - s + tt < 1) tt++;
          var shown = '\\dfrac{(' + A + pw('a', p) + pw('b', q) + ')^{2}}{' + B + pw('a', rr) + pw('b', s) + '}\\cdot\\dfrac{' + pw('b', tt) + '}{' + C + pw('a', u) + '}';
          return { A: A, B: B, C: C, p: p, q: q, rr: rr, s: s, tt: tt, u: u, be: 2 * q - s + tt, shown: shown };
        },
        parts: [
          { id: 'e18a', level: 'PRG', make: function (r, sh) {
            var tgt = pw('b', sh.be);
            return xp('Simplify completely.', tgt, [w(mt(1, [['a', 1], ['b', sh.be]]), 'leftover-var', 'Track the exponent of ' + t('a') + ': ' + t(2 * sh.p + '-' + sh.rr + '-' + sh.u + '=0') + ', so ' + t('a^{0}=1') + '.')],
              'Power law: ' + t('(' + sh.A + pw('a', sh.p) + pw('b', sh.q) + ')^{2}=' + sh.A * sh.A + 'a^{' + 2 * sh.p + '}b^{' + 2 * sh.q + '}') + '.<br>Coefficients: ' + t('\\frac{' + sh.A * sh.A + '}{' + sh.B + '\\times ' + sh.C + '}=1') + '.<br>' + t('a^{' + 2 * sh.p + '-' + sh.rr + '-' + sh.u + '}=a^{0}=1') + ', ' + t('b^{' + 2 * sh.q + '-' + sh.s + '+' + sh.tt + '}=' + tgt) + '.<br>Answer: ' + t(tgt) + '.', [HO], 'EP18 simplify', { vars: ['a', 'b'] });
          } },
          { id: 'e18b', level: 'LIM', make: function (r) {
            return P.mc(r, 'One of the two variables has vanished. Which one, and what does that say about the value of the expression?', [
              { html: t('a') + ' — the value depends only on ' + t('b') + '; changing ' + t('a') + ' (to any non-zero number) doesn’t change it.', right: true },
              { html: t('b') + ' — the expression is a constant.', why: 'Look at your answer to (a): which letter is still there?' },
              { html: t('a') + ' — so the expression equals ' + t('0') + ' whenever ' + t('a') + ' is used.', why: 'A vanished variable means ' + t('a^{0}=1') + ', not ' + t('0') + '.' },
              { html: 'Neither — both variables remain.', why: 'Check the exponent of ' + t('a') + ': it comes to ' + t('0') + '.' }],
              'The exponent of ' + t('a') + ' is ' + t('0') + ', so ' + t('a') + ' has vanished: the value depends only on ' + t('b') + ', for any non-zero ' + t('a') + '.', ['Which letter is missing from your answer to (a)?'], 'which variable vanished');
          } },
          { id: 'e18c', level: 'EMG', make: function (r, sh) {
            var fields = [{ name: 'Top', label: 'Exponent of ' + t('a') + ' on top (after the power law)' }, { name: 'Bottom', label: 'Total exponent of ' + t('a') + ' underneath' }];
            var p = P.fields('Predict it by tracking the exponent of ' + t('a') + ' alone.', fields, [K.number(2 * sh.p, function (v) { return v === sh.p ? { code: 'top-only', hint: 'The square doubles the exponent: ' + t('(a^{' + sh.p + '})^{2}=a^{' + 2 * sh.p + '}') + '.' } : v === sh.p + 2 ? { code: 'add-power', hint: 'Power of a power: multiply.' } : null; }), K.number(sh.rr + sh.u, function (v) { return v === sh.rr || v === sh.u ? { code: 'minus-dist', hint: 'There are two powers of ' + t('a') + ' underneath: ' + t(pw('a', sh.rr)) + ' and ' + t(pw('a', sh.u)) + '. Add them.' } : null; })],
              [String(2 * sh.p), String(sh.rr + sh.u)], 'Top ' + t('a^{' + 2 * sh.p + '}') + ', underneath ' + t('a^{' + sh.rr + '+' + sh.u + '}=a^{' + (sh.rr + sh.u) + '}'),
              'Top: ' + t('(a^{' + sh.p + '})^{2}=a^{' + 2 * sh.p + '}') + '. Underneath: ' + t(pw('a', sh.rr)) + ' and ' + t(pw('a', sh.u)) + ', total ' + t(sh.rr + sh.u) + '.<br>' + t('a^{' + 2 * sh.p + '-' + (sh.rr + sh.u) + '}=a^{0}=1') + ', so ' + t('a') + ' was always going to drop out.', ['Follow only the letter ' + t('a') + ' through the power law and the product law.'], 'track one exponent');
            return p;
          } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var c = r.pick([[2, 4], [3, 9]]), A = c[0], B = c[1], p = r.int(2, 4), q = r.int(2, 3), rr = r.int(1, 3), u = r.int(1, 3);
          while (4 * p - 2 * rr - u < 1) u = 1;
          var ex_ = 4 * p - 2 * rr - u, ey = 4 * q - 2, right = mt(1, [['x', ex_], ['y', ey]]);
          var shown = '\\dfrac{(-' + A + pw('x', p) + pw('y', q) + ')^{4}}{(' + B + pw('x', rr) + 'y)^{2}\\cdot ' + pw('x', u) + '}';
          return P.mc(r, 'The simplified form of ' + t(shown) + ' is', [
            { html: t(right), right: true },
            { html: t('-' + right), why: 'The power ' + t('4') + ' is even, so ' + t('(-' + A + ')^{4}=' + Math.pow(A, 4)) + ' is positive.' },
            { html: t(mt(1, [['x', ex_ + u], ['y', ey]])), why: 'Don’t forget the extra ' + t(pw('x', u)) + ' in the denominator.' },
            { html: t(mt([1, B], [['x', ex_], ['y', ey]])), why: 'The coefficients cancel exactly: ' + t('(-' + A + ')^{4}=' + Math.pow(A, 4)) + ' and ' + t(B + '^{2}=' + B * B) + '.' }],
            'Numerator: ' + t('(-' + A + pw('x', p) + pw('y', q) + ')^{4}=' + Math.pow(A, 4) + 'x^{' + 4 * p + '}y^{' + 4 * q + '}') + ' (even power, positive).<br>Denominator: ' + t('(' + B + pw('x', rr) + 'y)^{2}\\cdot ' + pw('x', u) + '=' + B * B + 'x^{' + (2 * rr + u) + '}y^{2}') + '.<br>Quotient: ' + t(Math.pow(A, 4) + '\\div ' + B * B + '=1') + ', ' + t('x^{' + 4 * p + '-' + (2 * rr + u) + '}=' + pw('x', ex_)) + ', ' + t('y^{' + 4 * q + '-2}=' + pw('y', ey)) + ': ' + t(right) + '.', [HO, HS], 'EP MC chain');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'PRG', make: function (r) {
          var A = r.pick([2, 3]), B = r.pick([2, 3]), k = A * B, p = r.int(3, 5), q = r.int(1, 3), s = r.int(1, 3), u = r.int(2, 4), rr = r.int(1, 3), v = 1;
          while (p + s - u < 1) u--;
          var ea = p + s - u, eb = q + rr - v, ans = k * k + 2 * ea + 2 * eb;
          var shown = '\\left(\\dfrac{' + A + pw('a', p) + pw('b', q) + '\\cdot ' + B + pw('a', s) + pw('b', rr) + '}{' + pw('a', u) + 'b}\\right)^{2}';
          return P.nr('The expression ' + t(shown) + ' simplifies to the form ' + t('ka^{m}b^{n}') + ', where ' + t('k') + ', ' + t('m') + ' and ' + t('n') + ' are whole numbers. The value of ' + t('k+m+n') + ' is ________.', ans, function (x) {
            if (x === k + 2 * ea + 2 * eb) return { code: 'nr-coef', hint: 'Square the coefficient too: ' + t(k + '^{2}=' + k * k) + '.' };
            if (x === k * k + ea + eb) return { code: 'top-only', hint: 'The square doubles every exponent inside the bracket.' };
            return null;
          }, 'Inside, top: ' + t(A + pw('a', p) + pw('b', q) + '\\cdot ' + B + pw('a', s) + pw('b', rr) + '=' + k + 'a^{' + (p + s) + '}b^{' + (q + rr) + '}') + '.<br>Divide by ' + t(pw('a', u) + 'b') + ': ' + t(k + pw('a', ea) + pw('b', eb)) + '.<br>Square: ' + t(k * k + 'a^{' + 2 * ea + '}b^{' + 2 * eb + '}') + ', so ' + t('k+m+n=' + k * k + '+' + 2 * ea + '+' + 2 * eb + '=' + ans) + '.', [HO], 'EP NR k+m+n');
        } }] }
    ];
  }
})(window);
