/* More checkers and part builders for Lessons 2 onward (needs js/expr.js and js/kit.js).
 * Every checker returns { v: 'correct' | 'wrong' | 'form', code, hint } like the ones in kit.js.
 *
 *   K.read(resp)                       parse a typed answer; returns { ast } or a 'form' result
 *   K.value(target, opt)               any exact expression equal to target (opt.only: 'integer' | 'fraction' | 'decimal')
 *   K.fraction([p,q], opt)             a fraction in lowest terms (or an integer when q = 1)
 *   K.radical({k,n,m}, mode, opt)      k·ⁿ√m; mode 'mixed' (simplest mixed radical), 'entire', or 'any'
 *   K.varRadical(latex, mode, opt)     the same with variables (Lesson 6B extension)
 *   K.repeating([p,q], opt)            a decimal, with a bar over the repeating block when it repeats
 *   K.approx(x, dp, opt)               a value rounded to dp decimal places
 *   K.order(ids, opt)                  an ordering (ids in the right order)
 *   K.grid(want, opt)                  a table: want = { rowId: colId } (single) or { rowId: [colIds] } (multi)
 *   K.fields([checkers], opt)          several boxes, each with its own checker
 *   K.P                                part builders: mc, tf, nr, number, math, radical, fraction, approx, order, grid, fields
 */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, F = HW.fmt, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  var READ = {
    empty: 'Type your answer first.',
    blank: 'There is still an empty box in your answer — fill it in or delete it.',
    unbalanced: 'Check your brackets: one of them isn’t closed.',
    adjacent: 'Two numbers are sitting side by side. Put ' + t('\\times') + ' between numbers that are multiplied.',
    relation: 'Just give the value — no ' + t('=') + ', ' + t('<') + ' or ' + t('>') + ' needed.',
    comma: 'Give a single answer (no commas).',
    incomplete: 'Your answer looks unfinished — something is missing after an operation or a root.',
    unreadable: 'I can’t read that answer. Use the keypad buttons for roots, fractions and exponents.'
  };
  K.read = function (resp) {
    var p = ex.parse(resp);
    if (!p.ok) return { res: form(p.code === 'empty' ? 'empty' : 'unreadable-' + p.code, READ[p.code] || READ.unreadable) };
    return { ast: p.ast, val: ex.value(p.ast) };
  };
  function R(r) { return typeof r === 'number' ? [r, 1] : r; }
  function rootName(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth' : n === 5 ? 'fifth' : n + 'th'; }
  function powName(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th power'; }
  K.rootName = rootName;
  function rv(r) { r = R(r); return r[0] / r[1]; }
  K.ratTex = function (r) { return ex.texRat(R(r)); };

  /* ---- any expression equal to target. opt.only: 'integer' | 'fraction' | 'decimal'; opt.diag(val, ast) -> {code, hint} ---- */
  function mixedCheck(ast, T) {
    var mv = ex.mixedValue(ast); if (mv == null) return null;
    if (ex.eq(mv, T)) return form('mixed-num', 'Right value! Write it as an improper fraction (for example ' + t('2\\tfrac{1}{3}=\\frac{7}{3}') + '), not a mixed number.');
    return wrong('value', null);
  }
  K.value = function (target, opt) {
    opt = opt || {};
    var T = typeof target === 'number' ? target : rv(target);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var mx = mixedCheck(a.ast, T); if (mx) return mx;
      var sh = ex.shape(a.ast);
      if (ex.eq(a.val, T)) {
        if (opt.only && (sh.roots || sh.pow || sh.ops || sh.muls || sh.abs || sh.pi || (sh.divs && opt.only !== 'fraction'))) return form('simplify', 'That has the right value, but simplify it all the way to a single ' + (opt.only === 'fraction' ? 'fraction' : 'number') + '.');
        if (opt.only === 'fraction') { var pf = ex.plainFraction(a.ast); if (pf && ex.gcd(pf[0], pf[1]) > 1) return form('lowest', 'Right value — now write the fraction in lowest terms.'); }
        return ok();
      }
      if (!isFinite(a.val)) return wrong('undefined', null);
      var h = opt.diag ? opt.diag(a.val, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      if (ex.eq(a.val, -T) && T !== 0) return wrong('sign', 'Check the sign of your answer.');
      return wrong('value', null);
    };
  };

  /* ---- a fraction in lowest terms ---- */
  K.fraction = function (target, opt) {
    opt = opt || {}; target = ex.norm(R(target)[0], R(target)[1]);
    var T = rv(target);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var mx = mixedCheck(a.ast, T); if (mx) return mx;
      var sh = ex.shape(a.ast), pf = ex.plainFraction(a.ast);
      if (ex.eq(a.val, T)) {
        if (sh.decimals && !pf) {
          if (opt.decimalOk && !sh.rep) return ok();
          return form('decimal', 'Right value — now write it as a fraction ' + t('\\frac{a}{b}') + ' instead of a decimal.');
        }
        if (!pf) return form('simplify', 'That has the right value, but write it as a single fraction ' + t('\\frac{a}{b}') + '.');
        if (ex.gcd(pf[0], pf[1]) > 1) return form('lowest', 'Right value — now reduce the fraction to lowest terms (divide the top and bottom by ' + t(ex.gcd(pf[0], pf[1])) + ').');
        return ok();
      }
      var h = opt.diag ? opt.diag(a.val, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      if (T !== 0 && ex.eq(a.val, 1 / T)) return wrong('flip', 'Your fraction is upside down — check which number goes on top.');
      if (T !== 0 && ex.eq(a.val, -T)) return wrong('sign', 'Check the sign of your answer.');
      if (sh.decimals && Math.abs(a.val - T) < 0.01) return form('decimal-rounded', 'That decimal is close but not exact. Give the exact answer as a fraction.');
      return wrong('value', null);
    };
  };

  /* ---- radicals: k·ⁿ√m ---- */
  function radVal(s) { return rv(s.k) * (s.n === 1 ? 1 : Math.pow(s.m, 1 / s.n)); }
  K.radVal = radVal;
  K.radTex = function (s) { return ex.texRadical(R(s.k), s.n, s.m); };
  K.radical = function (spec, mode, opt) {
    opt = opt || {}; mode = mode || 'mixed';
    var s = { k: R(spec.k), n: spec.n, m: spec.m }, V = radVal(s), n = s.n, M = Math.round(Math.pow(Math.abs(rv(s.k)), n) * s.m); // entire radicand
    var kAbs = Math.abs(rv(s.k));
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sh = ex.shape(a.ast), r = ex.radical(a.ast);
      if (sh.decimals && !sh.roots) {
        if (Math.abs(a.val - V) < 0.05 * Math.max(1, Math.abs(V))) return form('decimal', 'That’s a decimal approximation. Give the <b>exact</b> answer as a radical (use the ' + t('\\sqrt{\\ }') + ' key).');
        return wrong('value', null);
      }
      if (ex.eq(a.val, V)) {
        if (!r) return form('one-radical', 'Right value — now simplify it into a single ' + (mode === 'entire' ? 'entire radical ' + t(ex.texRoot(n, 'a')) : 'mixed radical ' + t('a' + ex.texRoot(n, 'b'))) + '.');
        if (r.n !== 1 && r.n !== n && mode !== 'any') return form('index', 'Right value, but keep the index ' + t(n) + ' (write it as a ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th') + ' root).');
        if (mode === 'mixed') {
          var fz = ex.factors(a.ast), cn = fz.num.filter(function (x) { return x.t !== 'root'; }), cd = fz.den;
          var cnv = cn.length === 1 ? ex.rat(cn[0]) : null, cdv = cd.length === 1 ? ex.rat(cd[0]) : null;
          if (cn.length > 1 || cd.length > 1 || (cnv && cdv && cnv[1] === 1 && cdv[1] === 1 && ex.gcd(cnv[0], cdv[0]) > 1) || (cn.length === 1 && !cnv) || (cd.length === 1 && !cdv))
            return form('simplify', 'Right value — now simplify the numbers in front of the radical into a single coefficient' + (cd.length ? ' (reduce the fraction)' : '') + '.');
          if (r.n !== 1 && !ex.simplest(r.m, r.n)) { var f = ex.nthFactor(r.m, r.n); return form('not-simplest', 'Right value, but not in simplest form yet: ' + t(F(r.m)) + ' still has the factor ' + t(Math.pow(f, r.n) + (r.n === 2 ? '=' + f + '^{2}' : '=' + f + '^{' + r.n + '}')) + '. Take ' + t(f) + ' out of the radical too.'); }
          if (r.n === 1 && s.n !== 1 && s.m !== 1) return form('one-radical', 'Write it as a mixed radical.');
          return ok();
        }
        if (mode === 'entire') {
          if (Math.abs(r.k[0]) !== 1 || r.k[1] !== 1) return form('not-entire', 'Right value, but an entire radical has nothing in front of the root. Move ' + t(ex.texRat(r.k)) + ' inside: it becomes ' + t(ex.texRat([Math.pow(Math.abs(r.k[0]), n), Math.pow(r.k[1], n)])) + ' under the ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th') + ' root.');
          return ok();
        }
        return ok();
      }
      var h = opt.diag ? opt.diag(a.val, r, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      if (r && r.n === n) {
        var rk = rv(r.k);
        if (ex.eq(a.val, -V)) return wrong('sign', 'Check the sign of your answer.');
        if (mode !== 'entire' && s.k[1] === 1 && Math.abs(rk) === Math.pow(kAbs, n) && r.m === s.m && kAbs > 1)
          return wrong('coef-power', 'You took out the right factor, but ' + t(F(Math.pow(kAbs, n))) + ' comes out of the radical as its ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th') + ' root: ' + t(ex.texRoot(n, F(Math.pow(kAbs, n))) + '=' + kAbs) + '.');
        if (mode !== 'entire' && Number.isInteger(rk) && Math.abs(rk) > 1 && Math.abs(rk) * r.m === M)
          return wrong('divided', 'Check: ' + t(Math.abs(rk) + '\\times ' + F(r.m) + '=' + F(M)) + ', but a number outside the radical stands for its ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th power') + ' inside. ' + t(Math.abs(rk) + ex.texRoot(n, F(r.m)) + '=' + ex.texRoot(n, F(Math.round(Math.pow(Math.abs(rk), n) * r.m))))+ '. Look for a perfect ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th power') + ' factor of ' + t(F(M)) + '.');
        if (mode === 'entire' && Math.abs(rk) === 1 && r.m === Math.round(kAbs * s.m) && kAbs > 1)
          return wrong('no-power', 'Before ' + t(kAbs) + ' moves inside the radical it has to be ' + (n === 2 ? 'squared' : n === 3 ? 'cubed' : 'raised to the power ' + n) + ': ' + t(kAbs + '=' + ex.texRoot(n, F(Math.pow(kAbs, n)))) + '.');
        if (mode === 'entire' && Math.abs(rk) === 1 && r.m === Math.round(Math.pow(kAbs, n) + s.m))
          return wrong('added', 'Multiply ' + t(F(Math.pow(kAbs, n))) + ' by ' + t(F(s.m)) + ' — don’t add them.');
        if (Math.abs(rk) === 1 && r.m === M && mode === 'mixed') return wrong('unchanged', null);
      }
      if (r && r.n !== n && r.n !== 1) return wrong('index', 'Check the index: this is a ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th') + ' root.');
      return wrong('value', null);
    };
  };

  /* ---- radicals with variables (assume variables are positive). target = LaTeX of the answer ---- */
  K.varRadical = function (targetTex, mode, opt) {
    opt = opt || {}; mode = mode || 'mixed';
    var tp = ex.parse(targetTex); if (!tp.ok) throw new Error('bad target ' + targetTex);
    var tr = ex.monoRadical(tp.ast), vars = Object.keys(ex.shape(tp.ast).vars);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sv = Object.keys(ex.shape(a.ast).vars);
      var extra = sv.filter(function (v) { return vars.indexOf(v) < 0; });
      if (extra.length) return wrong('var', 'Your answer has a variable ' + t(extra[0]) + ' that isn’t in the question.');
      var r = ex.monoRadical(a.ast);
      if (ex.equiv(a.ast, tp.ast, vars)) {
        if (!r) return form('one-radical', 'Right value — now write it as a single ' + (mode === 'entire' ? 'entire radical' : 'mixed radical') + '.');
        if (mode === 'mixed') {
          var big = Object.keys(r.rad.vars).filter(function (v) { return r.rad.vars[v] >= r.n; });
          if (r.n > 1 && !ex.simplest(r.rad.m, r.n)) return form('not-simplest', 'Right value, but ' + t(r.rad.m) + ' under the radical still has a perfect ' + powName(r.n) + ' factor. Take it out.');
          if (big.length) return form('not-simplest-var', 'Right value, but ' + t(big[0] + '^{' + r.rad.vars[big[0]] + '}') + ' under the radical still contains ' + t(big[0] + '^{' + r.n + '}') + '. Take it out of the radical.');
          return ok();
        }
        if (mode === 'entire') { if (Math.abs(r.k[0]) !== 1 || r.k[1] !== 1 || Object.keys(r.vars).length) return form('not-entire', 'Right value, but move everything inside the radical (raise each factor to the power ' + t(r.n) + ' first).'); return ok(); }
        return ok();
      }
      var h = opt.diag ? opt.diag(r, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      if (r && tr && r.n === tr.n && mode === 'mixed') {
        var outV = Object.keys(r.vars), want = tr.vars;
        for (var i = 0; i < outV.length; i++) if (want[outV[i]] && r.vars[outV[i]] > want[outV[i]]) return wrong('var-exp', 'When ' + t(outV[i] + '^{' + (want[outV[i]] * tr.n) + '}') + ' comes out of a ' + rootName(tr.n) + ' root it becomes ' + t(outV[i] + (want[outV[i]] > 1 ? '^{' + want[outV[i]] + '}' : '')) + ' — divide the exponent by ' + t(tr.n) + '.');
      }
      return wrong('value', null);
    };
  };

  /* ---- a decimal (bar over the repeating block) ---- */
  K.repeating = function (target, opt) {
    opt = opt || {}; target = ex.norm(R(target)[0], R(target)[1]);
    var T = rv(target), q = target[1]; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5;
    var repeats = q !== 1;
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sh = ex.shape(a.ast), r = ex.rat(a.ast);
      if (!sh.bare) {
        if (ex.eq(a.val, T)) return form('as-decimal', 'Right value — write it as a decimal.');
        return wrong('value', null);
      }
      if (r && r[0] === target[0] && r[1] === target[1]) return ok();
      if (repeats && sh.ell && Math.abs(a.val - T) < 1e-3) return form('dots', 'Right digits! Instead of “…”, show the repeating block with a bar over it (use the ' + t('\\overline{x}') + ' key).');
      if (repeats && !sh.rep && Math.abs(a.val - T) < 1e-3) return wrong('no-bar', 'This decimal never ends — it repeats. Find the block of digits that repeats and put a bar over it (use the ' + t('\\overline{x}') + ' key).');
      if (repeats && sh.rep && Math.abs(a.val - T) < 0.01) return wrong('bar-block', 'Close — check which digits repeat. The bar goes over exactly the block that repeats, starting where the repeating begins.');
      var h = opt.diag ? opt.diag(a.val, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      return wrong('value', null);
    };
  };
  /* LaTeX of a fraction as a decimal with the repeating block barred */
  K.decTex = function (fr) {
    fr = ex.norm(R(fr)[0], R(fr)[1]);
    var neg = fr[0] < 0, p = Math.abs(fr[0]), q = fr[1], ip = Math.floor(p / q), rem = p % q, digs = '', seen = {};
    while (rem && seen[rem] == null && digs.length < 60) { seen[rem] = digs.length; rem *= 10; digs += Math.floor(rem / q); rem %= q; }
    var out = String(ip);
    if (digs) { out += '.'; if (rem) { var st = seen[rem]; out += digs.slice(0, st) + '\\overline{' + digs.slice(st) + '}'; } else out += digs; }
    return (neg ? '-' : '') + out;
  };

  /* ---- rounded value ---- */
  K.roundTo = function (x, dp) { var f = Math.pow(10, dp); return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f; };
  K.approx = function (x, dp, opt) {
    opt = opt || {};
    var want = K.roundTo(x, dp), place = dp === 0 ? 'whole number' : dp === 1 ? 'tenth' : dp === 2 ? 'hundredth' : dp === 3 ? 'thousandth' : dp + ' decimal places';
    var trunc = Math.trunc(x * Math.pow(10, dp)) / Math.pow(10, dp);
    return function (resp) {
      var raw = String(resp == null ? '' : resp);
      var p = HW.parse.number(raw);
      if (!p.ok) { var a = K.read(raw); if (a.res) return a.res; return form('decimal', 'Give your answer as a decimal, rounded to the nearest ' + place + '.'); }
      var v = p.value, s = HW.parse.plain(raw).replace(/\s/g, ''), dec = (s.split('.')[1] || '').length;
      if (opt.nr && s.length > 4) return form('nr-long', 'Numerical response answers fit in 4 boxes (digits and a decimal point only).');
      if (Math.abs(v - want) < 1e-9) return ok();
      if (dec > dp && Math.abs(K.roundTo(v, dp) - want) < 1e-9) return form('round', 'Right — now round it to the nearest ' + place + '.');
      if (dec < dp && Math.abs(v - K.roundTo(x, dec)) < 1e-9) return form('places', 'Round to the nearest ' + place + ' (' + dp + ' decimal place' + (dp === 1 ? '' : 's') + ').');
      if (Math.abs(v - trunc) < 1e-9 && trunc !== want) return wrong('truncate', 'Round, don’t chop: look at the next digit. If it is 5 or more, round up.');
      var h = opt.diag ? opt.diag(v) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      if (Math.abs(v + want) < 1e-9 && want !== 0) return wrong('sign', 'Check the sign.');
      return wrong('value', null);
    };
  };

  /* ---- ordering. ids = correct order; opt.val(id) numeric value, opt.tex(id) LaTeX label, opt.why(a, b) hint for a pair in the wrong order ---- */
  K.order = function (ids, opt) {
    opt = opt || {};
    return function (resp) {
      if (!resp || resp.length < ids.length) return form('incomplete', 'Tap every item to place it in order (' + (resp ? resp.length : 0) + ' of ' + ids.length + ' placed).');
      for (var i = 0; i < ids.length; i++) if (resp[i] !== ids[i]) break;
      if (i === ids.length) return ok();
      // find the first adjacent pair in the wrong order
      for (var j = 0; j + 1 < resp.length; j++) {
        var x = resp[j], y = resp[j + 1];
        if (ids.indexOf(x) > ids.indexOf(y)) {
          var h = opt.why ? opt.why(x, y) : null;
          return wrong('order', h || (opt.tex ? t(opt.tex(x)) + ' and ' + t(opt.tex(y)) + ' are in the wrong order. Compare those two again.' : 'Two neighbours are in the wrong order.'));
        }
      }
      return wrong('order', null);
    };
  };

  /* ---- a table of choices ---- */
  K.grid = function (want, opt) {
    opt = opt || {};
    return function (resp) {
      resp = resp || {};
      var rows = Object.keys(want), missing = rows.filter(function (r) { var g = resp[r]; return g == null || (Array.isArray(g) && !g.length && want[r].length); });
      if (missing.length === rows.length) return form('empty', 'Fill in the table first.');
      if (missing.length && !opt.allowBlank) return form('incomplete', 'Finish every row (' + (rows.length - missing.length) + ' of ' + rows.length + ' done).');
      var bad = [];
      rows.forEach(function (r) {
        var g = resp[r], w = want[r];
        if (Array.isArray(w)) { g = (g || []).slice().sort(); var ws = w.slice().sort(); if (g.join('|') !== ws.join('|')) bad.push(r); }
        else if (g !== w) bad.push(r);
      });
      if (!bad.length) return ok();
      var h = opt.why ? opt.why(bad[0], resp[bad[0]], want[bad[0]]) : null;
      return wrong(h && h.code ? h.code : 'row', (h && h.hint ? h.hint : h) || (bad.length === 1 ? 'One row isn’t right yet.' : bad.length + ' rows aren’t right yet.') + (opt.count === false ? '' : ' (' + (rows.length - bad.length) + ' of ' + rows.length + ' correct.)'));
    };
  };

  /* ---- several boxes ---- */
  K.fields = function (checkers, opt) {
    opt = opt || {};
    return function (resp) {
      resp = resp || [];
      for (var i = 0; i < checkers.length; i++) {
        var r = checkers[i](resp[i] == null ? '' : resp[i]);
        if (r.v !== 'correct') { var lab = opt.labels ? opt.labels[i] : 'Box ' + (i + 1); return { v: r.v, code: r.code, hint: (lab ? '<b>' + lab + ':</b> ' : '') + (r.hint || 'Check this one again.') }; }
      }
      return ok();
    };
  };

  /* ---- exponent-law answers: an expression equal to targetTex, in simplest form.
   * opt.positive (default true): no negative or zero exponents.  opt.evaluate (default true): number powers worked out.
   * opt.form: null | 'power' (no radicals) | 'radical' (no fractional exponents) | 'single-power' (one power, e.g. 4096^{1/6}).
   * opt.diag(analysis, ast) -> {code, hint} for lesson-specific mistakes. Variables are assumed positive. ---- */
  function expoVars(ast, acc) { (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(ast); return acc; }
  function baseVarsOf(ast) { var acc = {}; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; if (x.t === 'pow') { w(x.a); return; } ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(ast); return acc; }
  K.expo = function (targetTex, opt) {
    opt = opt || {};
    var tp = ex.parse(targetTex); if (!tp.ok) throw new Error('bad target ' + targetTex + ' (' + tp.code + ')');
    var tvars = Object.keys(expoVars(tp.ast, {})), ta = ex.analyze(tp.ast), positive = opt.positive !== false, evaluate = opt.evaluate !== false;
    var tval = tvars.length ? null : ex.value(tp.ast);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var sv = Object.keys(expoVars(a.ast, {})), all = tvars.concat(sv.filter(function (v) { return tvars.indexOf(v) < 0; }));
      var same = tvars.length || sv.length ? ex.equiv(a.ast, tp.ast, all, 6) : ex.eq(a.val, tval);
      var an = ex.analyze(a.ast), f = an.flags;
      if (same) {
        var extra = sv.filter(function (v) { return tvars.indexOf(v) < 0; }), bv = baseVarsOf(a.ast);
        if (extra.length && extra.every(function (v) { return !bv[v]; })) return form('combine', 'Right value — now combine the powers of the same base into one power and simplify its exponent.');
        if (extra.length) return form('zero-exp', 'Right value — but ' + t(extra[0]) + ' cancels out completely (' + t(extra[0] + '^{0}=1') + '), so leave it out.');
        if (opt.form === 'radical') { if (f.ratExp || /\^\{?\s*\\frac|\^\{?-?\d+\/\d+/.test(String(resp))) return form('not-radical', 'Right value — now write it in <b>radical form</b> (use the root key; no fractional exponents).'); return ok(); }
        if (opt.form === 'single-power') { var top = a.ast; while (top.t === 'paren') top = top.a; if (top.t !== 'pow') return form('single-power', 'Right value — but write it as a <b>single power</b> (one base with one exponent), as the question asks.'); }
        if ((opt.form === 'power' || opt.form === 'single-power') && f.roots) return form('not-power', 'Right value — now write it with a rational exponent instead of a radical.');
        if (opt.form === 'single-power') return ok();
        if (positive && f.negExp) return form('neg-exp', 'Right value — now write it with <b>positive exponents</b> only: move each power with a negative exponent to the other side of the fraction bar.');
        if (positive && f.zeroExp) return form('zero-exp', 'Right value — but anything to the power ' + t('0') + ' is ' + t('1') + ', so simplify that part.');
        if (f.nested) return form('brackets', 'Right value — now remove the brackets: apply the outside exponent to every factor inside.');
        if (f.repeatVar) return form('combine', 'Right value — now combine the powers of the same base into one power.');
        if (evaluate && f.numPow && opt.form !== 'single-power') return form('evaluate', 'Right value — now work out the number powers, e.g. ' + t('2^{3}=8') + '.');
        if (f.decExp || f.unreducedExp) return form('exp-form', 'Right value — now simplify each exponent to a single number or fraction in lowest terms.');
        if (!opt.form && f.roots && !ta.flags.roots) return form('not-power', 'Right value — write it with exponents instead of a radical.');
        if (f.coefSplit) return form('coef', 'Right value — now simplify the numbers into a single coefficient (reduce any fraction).');
        if (f.complex && !opt.anyForm) return form('simplify', 'That has the right value, but simplify it further.');
        return ok();
      }
      if (!isFinite(a.val) && !sv.length) return wrong('undefined', null);
      var h = opt.diag ? opt.diag(an, a.ast) : null;
      if (h) return wrong(h.code || 'diag', h.hint);
      // compare coefficient and exponents with the target
      if (an.coef && ta.coef && !f.complex && !ta.flags.complex && !f.roots && !ta.flags.roots) {
        var tv = ta.vars, sv2 = an.vars, keys = Object.keys(tv).concat(Object.keys(sv2)).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
        var bad = keys.filter(function (v) { var x = tv[v] || [0, 1], y = sv2[v] || [0, 1]; return x[0] * y[1] !== y[0] * x[1]; });
        var coefOk = an.coef[0] * ta.coef[1] === ta.coef[0] * an.coef[1], coefNeg = an.coef[0] * ta.coef[1] === -ta.coef[0] * an.coef[1];
        if (!bad.length && coefNeg) return wrong('sign', (keys.length ? 'Your variables are right — check' : 'Check') + ' the <b>sign</b>. A negative base to an even power is positive; to an odd power it stays negative.');
        if (!bad.length && !coefOk && keys.length) return wrong('coef', 'Your variable part is right — check the <b>number</b> in front. Coefficients multiply or divide (they don’t add), and a coefficient inside brackets is raised to the outside power too.');
        if (bad.length) {
          var v = bad[0], x = tv[v] || [0, 1], y = sv2[v] || [0, 1];
          if (x[0] * y[1] === -y[0] * x[1]) return wrong('flip-exp', 'Check ' + t(v) + ': it’s on the wrong side of the fraction bar (or its exponent has the wrong sign).');
          return wrong('exp', (coefOk ? 'The coefficient is right, but check' : 'Check') + ' the exponent on ' + t(v) + '. Product law: add exponents. Quotient law: subtract. Power of a power: multiply.');
        }
      }
      return wrong('value', null);
    };
  };

  /* ---- scientific notation: a × 10^n with 1 ≤ |a| < 10 equal to value (opt.sig: significant digits required) ---- */
  K.sciParts = function (x) { if (x === 0) return { a: 0, n: 0 }; var n = Math.floor(Math.log10(Math.abs(x)) + 1e-12), a = x / Math.pow(10, n); if (Math.abs(a) >= 10 - 1e-12) { a /= 10; n++; } return { a: Number(a.toPrecision(12)), n: n }; };
  K.sciTex = function (x, sig) { var p = K.sciParts(x), a = sig ? Number(p.a.toPrecision(sig)).toFixed(Math.max(0, sig - 1)) : String(p.a); if (sig && Math.abs(Number(a)) >= 10) { p = K.sciParts(Number(a) * Math.pow(10, p.n)); a = Number(p.a).toFixed(Math.max(0, sig - 1)); } return a + '\\times 10^{' + p.n + '}'; };
  K.sci = function (x, opt) {
    opt = opt || {};
    var want = opt.sig ? Number(Number(x).toPrecision(opt.sig)) : x;
    return function (resp) {
      if (/\d(\.\d+)?\s*[eE]\s*[-+−]?\d/.test(String(resp || ''))) return form('e-notation', 'That looks like calculator E-notation. Write it as ' + t('a\\times 10^{n}') + ' using the ×10ⁿ key.');
      if (/\d\s*[xX]\s*10/.test(String(resp || ''))) return form('x-times', 'Use the ' + t('\\times') + ' key (or *) for “times”, not the letter x.');
      var a = K.read(resp); if (a.res) return a.res;
      var top = a.ast, sgn = 1; while (top.t === 'neg' || top.t === 'paren') { if (top.t === 'neg') sgn = -sgn; top = top.a; }
      var coefNode = null, pw = null;
      if (top.t === 'mul' && top.b.t === 'pow' && top.b.a.t === 'num' && top.b.a.v === 10) { coefNode = top.a; pw = top.b; }
      else if (top.t === 'pow' && top.a.t === 'num' && top.a.v === 10) { coefNode = { t: 'num', v: 1, s: '1' }; pw = top; }
      var close = opt.sig ? Math.abs(a.val - want) <= 1e-9 * Math.abs(want) || Number(a.val.toPrecision(opt.sig)) === want : (x === 0 ? a.val === 0 : Math.abs(a.val - x) <= 1e-9 * Math.abs(x));
      if (!close) {
        if (pw && Math.abs(Math.abs(a.val) - Math.abs(want)) <= 1e-9 * Math.abs(want)) return wrong('sign', 'Check the sign.');
        if (pw) { var r = a.val / want, lg = Math.log10(Math.abs(r)); if (Math.abs(lg - Math.round(lg)) < 1e-9 && Math.round(lg) !== 0) return wrong('power-off', 'The digits are right, but the power of ' + t('10') + ' is off by ' + t(Math.abs(Math.round(lg))) + '. Count how many places the decimal point moves, and in which direction.'); }
        if (opt.diag) { var h = opt.diag(a.val, a.ast); if (h) return wrong(h.code || 'diag', h.hint); }
        if (opt.sig && ex.eq(a.val, x, 1e-6)) return form('sig', 'Right value — now round the coefficient to ' + opt.sig + ' significant digits.');
        return wrong('value', null);
      }
      if (!pw) return form('not-sci', 'Right value — now write it in <b>scientific notation</b>: ' + t('a\\times 10^{n}') + ' with ' + t('1\\le a<10') + '.');
      var c = Math.abs(ex.value(coefNode));
      if (!(c >= 1 && c < 10)) return form('coef-range', 'Right value, but in scientific notation the number in front must be at least ' + t('1') + ' and less than ' + t('10') + '. Move the decimal point and adjust the power of ' + t('10') + '.');
      if (opt.sig && coefNode.t === 'num') { var digs = coefNode.s.replace('.', '').replace(/^0+/, ''); if (digs.length > opt.sig) return form('sig', 'Round the coefficient to ' + opt.sig + ' significant digits.'); }
      return ok();
    };
  };

  /* labels for the error codes above (teacher dashboard → Questions). Lessons add their own with HW.addCodes({...}) */
  HW.CODES = HW.CODES || {};
  HW.addCodes = function (o) { Object.keys(o).forEach(function (k) { HW.CODES[k] = o[k]; }); };
  HW.addCodes({
    'mixed-num': 'Wrote a mixed number', sign: 'Wrong sign', flip: 'Fraction upside down', lowest: 'Not in lowest terms', decimal: 'Gave a decimal instead of exact form', 'decimal-rounded': 'Rounded decimal instead of exact fraction',
    simplify: 'Right value, not simplified', 'one-radical': 'Not written as one radical', 'not-simplest': 'Radical not in simplest form', 'not-simplest-var': 'Variable left under the radical',
    'not-entire': 'Left a coefficient outside (entire radical)', index: 'Wrong index', 'coef-power': 'Left the perfect square/cube outside instead of its root',
    divided: 'Divided out a factor instead of taking its root', 'no-power': 'Didn’t square/cube the coefficient before moving it in', unchanged: 'Didn’t simplify',
    'var-exp': 'Didn’t divide the variable exponent by the index', var: 'Stray variable', 'as-decimal': 'Not written as a decimal', dots: 'Used … instead of a bar',
    'no-bar': 'Didn’t show the repeating block', 'bar-block': 'Bar over the wrong digits', round: 'Not rounded', places: 'Rounded to the wrong place', truncate: 'Chopped instead of rounding',
    order: 'Two items in the wrong order', incomplete: 'Unfinished', row: 'A row of the table wrong', undefined: 'Undefined value',
    'mc-said-true': 'Said true (it’s false)', 'mc-said-false': 'Said false (it’s true)',
    'neg-exp': 'Left a negative exponent', 'zero-exp': 'Left a zero exponent / cancelled variable', brackets: 'Left brackets (power not distributed)', combine: 'Didn’t combine powers of the same base',
    evaluate: 'Didn’t evaluate a number power', coef: 'Wrong coefficient', exp: 'Wrong exponent', 'flip-exp': 'Variable on the wrong side of the fraction bar', 'not-radical': 'Not in radical form',
    'not-power': 'Not written as a power', 'exp-form': 'Exponent not simplified', 'x-times': 'Typed x for times', 'e-notation': 'Used calculator E-notation', 'single-power': 'Not a single power', 'power-off': 'Power of 10 off', 'not-sci': 'Not in scientific notation', 'coef-range': 'Coefficient not between 1 and 10', sig: 'Wrong number of significant digits'
  });

  /* ---------------- part builders ---------------- */
  var P = K.P = {};
  P.mc = function (r, prompt, opts, sol, hints, text, keepOrder) {
    var m = K.mc(r, opts, keepOrder);
    return { prompt: prompt, input: { type: 'mc', options: m.options }, check: m.check, key: m.answerKey, answer: HW.tex(m.answerHtml), solution: sol, hints: hints || [], text: text, tries: 2 };
  };
  /* true/false: truth = true|false; why = hint shown for the wrong choice */
  P.tf = function (r, prompt, truth, why, sol, hints, text) {
    var p = P.mc(r, prompt, [{ html: '<b>True</b>', right: !!truth, why: truth ? null : why, code: 'said-true' }, { html: '<b>False</b>', right: !truth, why: truth ? why : null, code: 'said-false' }], sol, hints, text, true);
    p.tries = 1; p.input.columns = 2;
    return p;
  };
  P.nr = function (prompt, ans, diag, sol, hints, text) {
    return { prompt: prompt, input: { type: 'number', nr: true }, check: K.number(ans, diag, { nr: true }), key: String(ans), answer: t(ans), solution: sol, hints: hints || [], text: text };
  };
  P.number = function (prompt, ans, diag, sol, hints, text, inp) {
    return { prompt: prompt, input: Object.assign({ type: 'number' }, inp || {}), check: K.number(ans, diag), key: String(ans), answer: t(F(ans)), solution: sol, hints: hints || [], text: text };
  };
  P.approx = function (prompt, x, dp, opt, sol, hints, text) {
    opt = opt || {};
    var want = K.roundTo(x, dp);
    return { prompt: prompt, input: { type: 'number', nr: !!opt.nr, before: opt.before, after: opt.after }, check: K.approx(x, dp, opt), key: want.toFixed(dp), answer: t(want.toFixed(dp)), solution: sol, hints: hints || [], text: text };
  };
  P.math = function (prompt, check, keyTex, sol, hints, text, inp) {
    return { prompt: prompt, input: Object.assign({ type: 'math', keys: 'expr' }, inp || {}), check: check, key: keyTex, answer: t(keyTex), solution: sol, hints: hints || [], text: text };
  };
  P.radical = function (prompt, spec, mode, sol, hints, text, opt) {
    opt = opt || {};
    var key = K.radTex(spec);
    if (mode === 'entire') { var EM = String(Math.round(Math.pow(Math.abs(rv(spec.k)), spec.n) * spec.m)); key = rv(spec.k) >= 0 ? ex.texRoot(spec.n, EM) : spec.n % 2 ? ex.texRoot(spec.n, '-' + EM) : '-' + ex.texRoot(spec.n, EM); }
    return P.math(prompt, K.radical(spec, mode, opt), key, sol, hints, text, { keys: 'radical', before: opt.before });
  };
  /* exponent-law answer. vars: the letters the student may need (keypad keys) */
  P.expo = function (prompt, targetTex, opt, sol, hints, text) {
    opt = opt || {}; var vs = Object.keys(expoVars(ex.parse(targetTex).ast, {})).concat(opt.vars || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort();
    return P.math(prompt, K.expo(targetTex, opt), targetTex, sol, hints, text, { keys: 'expo', vars: vs, pi: /\\pi/.test(targetTex) || !!opt.pi, before: opt.before });
  };
  P.sci = function (prompt, x, opt, sol, hints, text) {
    opt = opt || {};
    return P.math(prompt, K.sci(x, opt), K.sciTex(x, opt.sig), sol, hints, text, { keys: 'sci', before: opt.before });
  };
  P.fraction = function (prompt, fr, opt, sol, hints, text) {
    opt = opt || {}; fr = ex.norm(R(fr)[0], R(fr)[1]);
    return P.math(prompt, K.fraction(fr, opt), ex.texRat(fr), sol, hints, text, { keys: 'fraction', before: opt.before });
  };
  P.repeating = function (prompt, fr, opt, sol, hints, text) {
    opt = opt || {};
    return P.math(prompt, K.repeating(fr, opt), K.decTex(fr), sol, hints, text, { keys: 'decimal', before: opt.before });
  };
  /* items: [{id, tex}] already in the CORRECT order; shown shuffled */
  P.order = function (r, prompt, items, opt, sol, hints, text) {
    opt = opt || {};
    var ids = items.map(function (x) { return x.id; }), byId = {}; items.forEach(function (x) { byId[x.id] = x; });
    var shown = r.shuffle(items); for (var g = 0; g < 10 && shown.map(function (x) { return x.id; }).join() === ids.join(); g++) shown = r.shuffle(items);
    return { prompt: prompt, input: { type: 'order', items: shown.map(function (x) { return { id: x.id, html: x.html || t(x.tex) }; }), first: opt.first || 'least', last: opt.last || 'greatest' },
      check: K.order(ids, { tex: function (id) { return byId[id].tex; }, why: opt.why }), key: ids, answer: items.map(function (x) { return x.html || t(x.tex); }).join(' ' + (opt.sep || '<span class="ord-sep">,</span>') + ' '),
      solution: sol, hints: hints || [], text: text };
  };
  /* rows: [{id, html}], cols: [{id, html}], want: {rowId: colId | [colIds]} */
  P.grid = function (prompt, rows, cols, want, opt, sol, hints, text) {
    opt = opt || {};
    var multi = Array.isArray(want[rows[0].id]);
    var colH = {}; cols.forEach(function (c) { colH[c.id] = c.html; });
    return { prompt: prompt, input: { type: 'grid', rows: rows, cols: cols, multi: multi, rowHead: opt.rowHead, colHead: opt.colHead },
      check: K.grid(want, opt), key: want,
      answer: rows.map(function (r) { var w = want[r.id]; return r.html + ': ' + (multi ? (w.length ? w.map(function (c) { return colH[c]; }).join(', ') : '—') : colH[w]); }).join('<br>'),
      solution: sol, hints: hints || [], text: text, tries: opt.tries || 3 };
  };
  P.fields = function (prompt, fields, checkers, keys, answer, sol, hints, text) {
    return { prompt: prompt, input: { type: 'fields', fields: fields }, check: K.fields(checkers, { labels: fields.map(function (f) { return f.name || f.label; }) }), key: keys, answer: answer, solution: sol, hints: hints || [], text: text };
  };
})(window);
