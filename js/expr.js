/* HW.ex — reads a typed answer (LaTeX from the math editor, or plain text) into an expression tree, and
 * evaluates it. Built for Unit 1 and beyond: integers, decimals, repeating decimals (0.1\overline{6}),
 * fractions, powers, roots of any index (\sqrt[3]{…}, √, ∛, sqrt(), cbrt()), π, absolute value and
 * single-letter variables.
 *
 *   ex.parse(s)        -> { ok:true, ast } | { ok:false, code }     codes: empty blank unreadable unbalanced adjacent
 *   ex.value(ast, env) -> Number (NaN if undefined, e.g. even root of a negative)
 *   ex.rat(ast)        -> [p, q] exact rational (no roots, no variables, no π) or null
 *   ex.radical(ast)    -> { k:[p,q], n, m } for k·ⁿ√m (m a whole number; n=1 & m=1 when there is no root) or null
 *   ex.shape(ast)      -> a few flags about how the answer was written (decimal, fraction, root count, …)
 *   ex.monoRadical(ast)-> { k:[p,q], vars:{x:e}, n, rad:{ m, vars:{x:e} } } for variable radicals, or null
 *   ex.texRadical(k, n, m), ex.texRat([p,q]), ex.nthFactor(m, n)
 */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var ex = HW.ex = {};

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function norm(p, q) { if (q === 0) return null; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  ex.gcd = gcd; ex.norm = norm;
  function safe(x) { return Number.isSafeInteger(x); }

  /* ---------------- tokenizer ---------------- */
  var SUPD = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  function tokenize(src) {
    var s = String(src == null ? '' : src), out = [], i = 0;
    s = s.replace(/(\d)\\,(?=\d{3}(?!\d))/g, '$1').replace(/(\d) (?=\d{3}(?!\d))/g, '$1').replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
    function peek(k) { return s.charAt(i + (k || 0)); }
    while (i < s.length) {
      var c = s.charAt(i);
      if (/\s/.test(c) || c === '~' || c === ' ' || c === ' ') { i++; continue; }
      if (c === '\\') {
        var m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); if (!m) return { err: 'unreadable' };
        var name = m[1]; i += m[0].length;
        if (/^[,;:! ]$/.test(name) || name === 'quad' || name === 'qquad' || name === 'displaystyle' || name === 'textstyle' || name === 'limits') continue;
        if (name === 'left' || name === 'right' || name === 'bigl' || name === 'bigr' || name === 'Bigl' || name === 'Bigr' || name === 'big' || name === 'Big') {
          if (peek() === '.') i++; else if (peek() === '\\' && /^\\[{}|]/.test(s.slice(i))) { var br = s.charAt(i + 1); i += 2; out.push(br === '|' ? { t: 'bar' } : { t: br === '{' ? '(' : ')' }); } else if (peek() === '\\' && /^\\vert/.test(s.slice(i))) { i += 5; out.push({ t: 'bar' }); }
          continue;
        }
        if (name === '{' || name === 'lbrace') { out.push({ t: '(' }); continue; }
        if (name === '}' || name === 'rbrace') { out.push({ t: ')' }); continue; }
        if (name === 'vert' || name === '|' || name === 'lvert' || name === 'rvert') { out.push({ t: 'bar' }); continue; }
        if (name === 'frac' || name === 'dfrac' || name === 'tfrac' || name === 'cfrac') {
          // TeX argument rules: each argument is a {group} or ONE character/command (MathLive writes 5/9 as \frac59)
          out.push({ t: 'frac' });
          for (var ai = 0; ai < 2; ai++) {
            while (/\s/.test(peek())) i++;
            if (!peek()) break; // missing argument: the parser reports it
            var arg;
            if (peek() === '{') { var dep = 0, j2 = i; for (; j2 < s.length; j2++) { if (s[j2] === '{' && s[j2 - 1] !== '\\') dep++; else if (s[j2] === '}' && s[j2 - 1] !== '\\') { dep--; if (!dep) break; } } if (j2 >= s.length) return { err: 'unbalanced' }; arg = s.slice(i + 1, j2); i = j2 + 1; if (!arg.trim()) return { err: 'blank' }; }
            else if (peek() === '\\') { var cm = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); arg = cm[0]; i += cm[0].length; }
            else { arg = peek(); i++; }
            var sub2 = tokenize(arg); if (sub2.err) return sub2;
            out.push({ t: '{' }); out = out.concat(sub2.toks); out.push({ t: '}' });
          }
          continue;
        }
        if (name === 'sqrt') {
          if (peek() === '[') { var depth = 0, j = i; for (; j < s.length; j++) { if (s[j] === '[') depth++; else if (s[j] === ']') { depth--; if (!depth) break; } } var idx = s.slice(i + 1, j); i = j + 1; var it = parse(idx); if (!it.ok) return { err: it.code === 'empty' ? 'blank' : it.code }; out.push({ t: 'root', idx: it.ast }); }
          else out.push({ t: 'root', idx: null });
          continue;
        }
        if (name === 'pi') { out.push({ t: 'pi' }); continue; }
        if (name === 'times' || name === 'cdot' || name === 'ast' || name === 'bullet') { out.push({ t: '*' }); continue; }
        if (name === 'div') { out.push({ t: '/' }); continue; }
        if (name === 'placeholder') { return { err: 'blank' }; }
        if (name === 'overline') { out.push({ t: 'over' }); continue; }
        if (name === 'ldots' || name === 'dots' || name === 'cdots') { out.push({ t: 'ell' }); continue; }
        if (name === 'mathrm' || name === 'text' || name === 'operatorname' || name === 'mathit' || name === 'mathbf' || name === 'textrm' || name === 'mathnormal') {
          // keep the content: \mathrm{pi} or \operatorname{sqrt}
          if (peek() === '{') { var e = s.indexOf('}', i); var inner = s.slice(i + 1, e); i = e + 1; var sub = tokenize(inner); if (sub.err) return sub; out = out.concat(sub); }
          continue;
        }
        if (name === 'exponentialE') { out.push({ t: 'var', n: 'e' }); continue; }
        if (name === 'degree' || name === 'circ') continue;
        if (name === 'lt' || name === 'gt' || name === 'le' || name === 'ge' || name === 'leq' || name === 'geq' || name === 'ne' || name === 'neq' || name === 'approx') { out.push({ t: 'rel', r: name }); continue; }
        return { err: 'unreadable', bad: '\\' + name };
      }
      if (c === '.' && s.slice(i, i + 3) === '...') { out.push({ t: 'ell' }); i += 3; continue; }
      if (/[0-9.]/.test(c) && (c !== '.' || /[0-9]/.test(peek(1)) || /\\overline|\(/.test(s.slice(i + 1, i + 10)) || (out.length && out[out.length - 1].t === 'num'))) {
        var mm = /^[0-9]*\.?[0-9]*/.exec(s.slice(i))[0]; i += mm.length;
        if (mm === '.') return { err: 'unreadable' };
        out.push({ t: 'num', s: mm });
        continue;
      }
      if (c === '…') { out.push({ t: 'ell' }); i++; continue; }
      if (SUPD[c]) { var sup = ''; while (SUPD[peek()]) { sup += SUPD[peek()]; i++; } out.push({ t: '^' }); out.push({ t: 'num', s: sup }); continue; }
      if (c === '{') { out.push({ t: '{' }); i++; continue; }
      if (c === '}') { out.push({ t: '}' }); i++; continue; }
      if (c === '(' || c === '[') { out.push({ t: '(' }); i++; continue; }
      if (c === ')' || c === ']') { out.push({ t: ')' }); i++; continue; }
      if (c === '+') { out.push({ t: '+' }); i++; continue; }
      if (c === '-' || c === '−' || c === '–' || c === '—') { out.push({ t: '-' }); i++; continue; }
      if (c === '*' || c === '×' || c === '·' || c === '⋅' || c === '∙' || c === '•') { out.push({ t: '*' }); i++; continue; }
      if (c === '/' || c === '÷') { out.push({ t: '/' }); i++; continue; }
      if (c === '^') { out.push({ t: '^' }); i++; continue; }
      if (c === '|') { out.push({ t: 'bar' }); i++; continue; }
      if (c === '√') { out.push({ t: 'root', idx: null }); i++; continue; }
      if (c === '∛') { out.push({ t: 'root', idx: { t: 'num', v: 3, s: '3' } }); i++; continue; }
      if (c === '∜') { out.push({ t: 'root', idx: { t: 'num', v: 4, s: '4' } }); i++; continue; }
      if (c === 'π') { out.push({ t: 'pi' }); i++; continue; }
      if (c === ',') { out.push({ t: ',' }); i++; continue; }
      if (c === '<' || c === '>' || c === '=' || c === '≤' || c === '≥' || c === '≈' || c === '≠') { out.push({ t: 'rel', r: c }); i++; continue; }
      if (/[a-zA-Z]/.test(c)) {
        var w = /^[a-zA-Z]+/.exec(s.slice(i))[0];
        if (/^sqrt/i.test(w)) { out.push({ t: 'root', idx: null }); i += 4; continue; }
        if (/^cbrt/i.test(w)) { out.push({ t: 'root', idx: { t: 'num', v: 3, s: '3' } }); i += 4; continue; }
        if (/^pi/i.test(w)) { out.push({ t: 'pi' }); i += 2; continue; }
        out.push({ t: 'var', n: c }); i++; continue;
      }
      return { err: 'unreadable', bad: c };
    }
    return { toks: out };
  }

  /* ---------------- parser ---------------- */
  function parse(src) {
    var tk = tokenize(src);
    if (tk.err) return { ok: false, code: tk.err, bad: tk.bad };
    var T = tk.toks, p = 0;
    if (!T.length) return { ok: false, code: 'empty' };
    if (T.some(function (x) { return x.t === 'rel'; })) return { ok: false, code: 'relation' };
    function pk() { return T[p]; }
    function eat(t) { if (T[p] && T[p].t === t) { p++; return true; } return false; }
    function fail(code) { var e = new Error(code); e.code = code; throw e; }
    function startsAtom(x) { return x && (x.t === 'num' || x.t === 'var' || x.t === 'pi' || x.t === '(' || x.t === '{' || x.t === 'frac' || x.t === 'root'); }
    function group() { // {…} or (…) or a single atom
      if (eat('{')) { if (eat('}')) fail('blank'); var e = expr(); if (!eat('}')) fail('unbalanced'); return e; }
      return atom();
    }
    function expr() {
      var a = term();
      while (pk() && (pk().t === '+' || pk().t === '-')) { var op = T[p++].t; var b = term(); a = { t: op === '+' ? 'add' : 'sub', a: a, b: b }; }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        var x = pk();
        if (x && (x.t === '*' || x.t === '/')) { p++; var b = unary(); a = x.t === '*' ? { t: 'mul', a: a, b: b } : { t: 'div', a: a, b: b }; continue; }
        if (startsAtom(x)) {
          if (x.t === 'num' && endsInNumber(a)) fail('adjacent');
          var c = power(); a = { t: 'mul', a: a, b: c, imp: true }; continue;
        }
        return a;
      }
    }
    function endsInNumber(a) { while (a && a.t === 'mul') a = a.b; return a && (a.t === 'num' || (a.t === 'pow' && a.a.t === 'num')); }
    function unary() {
      if (eat('-')) return { t: 'neg', a: unary() };
      if (eat('+')) return unary();
      return power();
    }
    function power() {
      var a = atom();
      if (eat('^')) { var b; if (pk() && pk().t === '{') b = group(); else if (pk() && pk().t === '-') { p++; b = { t: 'neg', a: atom() }; } else b = atom(); a = { t: 'pow', a: a, b: b }; }
      return a;
    }
    function atom() {
      var x = pk(); if (!x) fail('incomplete');
      if (x.t === 'num') {
        p++; var node = { t: 'num', s: x.s, v: Number(x.s), dec: /\./.test(x.s) };
        if (pk() && pk().t === 'over') { // repeating block
          p++; if (!eat('{')) fail('unreadable'); var digs = ''; while (pk() && pk().t === 'num') digs += T[p++].s; if (!eat('}')) fail('unreadable');
          if (!/^\d+$/.test(digs)) fail('unreadable');
          node.rep = digs; node.dec = true; node.v = repValue(x.s, digs);
        } else if (pk() && pk().t === 'ell') { p++; node.ell = true; }
        return node;
      }
      if (x.t === 'var') { p++; return { t: 'var', n: x.n }; }
      if (x.t === 'pi') { p++; return { t: 'pi' }; }
      if (x.t === '(' ) { p++; if (eat(')')) fail('blank'); var e = expr(); if (!eat(')')) fail('unbalanced'); return { t: 'paren', a: e }; }
      if (x.t === '{') { return group(); }
      if (x.t === 'frac') { p++; var n = group(), d = group(); return { t: 'div', a: n, b: d, frac: true }; }
      if (x.t === 'root') {
        p++; var arg;
        if (pk() && pk().t === '{') arg = group();
        else if (pk() && pk().t === '(') { p++; arg = expr(); if (!eat(')')) fail('unbalanced'); }
        else if (pk() && (pk().t === 'num' || pk().t === 'var' || pk().t === 'pi' || pk().t === 'root')) arg = atom();
        else if (pk() && pk().t === '-') { p++; arg = { t: 'neg', a: atom() }; }
        else fail('incomplete');
        return { t: 'root', n: x.idx || { t: 'num', v: 2, s: '2', implied: true }, a: arg };
      }
      if (x.t === 'bar') { p++; var e2 = expr(); if (!eat('bar')) fail('unbalanced'); return { t: 'abs', a: e2 }; }
      if (x.t === 'over') fail('unreadable');
      if (x.t === ',') fail('comma');
      if (x.t === ')' || x.t === '}') fail('unbalanced');
      fail('unreadable');
    }
    try {
      var ast = expr();
      if (p < T.length) { if (T[p].t === ',') return { ok: false, code: 'comma' }; return { ok: false, code: T[p].t === ')' || T[p].t === '}' ? 'unbalanced' : 'unreadable' }; }
      return { ok: true, ast: ast };
    } catch (e) { if (e.code) return { ok: false, code: e.code }; throw e; }
  }
  function repValue(fixed, rep) { // "2.1" + "6" -> 2.1666…
    var r = repRat(fixed, rep); return r[0] / r[1];
  }
  function repRat(fixed, rep) {
    var parts = fixed.split('.'), ip = parts[0] || '0', fp = parts[1] || '';
    var a = Number(ip + fp + rep) - Number(ip + fp), q = (Math.pow(10, rep.length) - 1) * Math.pow(10, fp.length);
    return norm(a, q);
  }
  ex.parse = parse;
  ex.repRat = repRat;

  /* ---------------- evaluation ---------------- */
  function value(a, env) {
    env = env || {};
    switch (a.t) {
      case 'num': return a.v;
      case 'var': return env[a.n] != null ? env[a.n] : NaN;
      case 'pi': return Math.PI;
      case 'paren': return value(a.a, env);
      case 'neg': return -value(a.a, env);
      case 'add': return value(a.a, env) + value(a.b, env);
      case 'sub': return value(a.a, env) - value(a.b, env);
      case 'mul': return value(a.a, env) * value(a.b, env);
      case 'div': return value(a.a, env) / value(a.b, env);
      case 'pow': var b = value(a.a, env), e = value(a.b, env); if (b < 0 && e % 1) { var r = ex.rat(a.b); if (r && r[1] % 2) return Math.pow(-Math.pow(-b, 1 / r[1]), r[0]); return NaN; } return Math.pow(b, e);
      case 'abs': return Math.abs(value(a.a, env));
      case 'root': var n = value(a.n, env), x = value(a.a, env); if (x < 0) return n % 2 === 1 ? -Math.pow(-x, 1 / n) : NaN; var v = Math.pow(x, 1 / n), rv = Math.round(v); return rv >= 1 && Math.abs(Math.pow(rv, n) - x) < 1e-9 * x ? rv : v;
    }
    return NaN;
  }
  ex.value = value;
  ex.eq = function (x, y, rel) { if (!isFinite(x) || !isFinite(y)) return false; var d = Math.abs(x - y); return d <= (rel || 1e-9) * Math.max(Math.abs(x), Math.abs(y)) || d < 1e-14; };

  /* exact rational, or null if the expression has a root, π or a variable */
  function rat(a) {
    switch (a.t) {
      case 'num':
        if (a.rep) return repRat(a.s, a.rep);
        if (a.dec) { var f = (a.s.split('.')[1] || '').length, q = Math.pow(10, f), pv = Math.round(Number(a.s) * q); return safe(pv) ? norm(pv, q) : null; }
        return safe(a.v) ? [a.v, 1] : null;
      case 'paren': return rat(a.a);
      case 'neg': var r = rat(a.a); return r && [-r[0], r[1]];
      case 'add': case 'sub': var x = rat(a.a), y = rat(a.b); if (!x || !y) return null; var s = a.t === 'add' ? 1 : -1; return chk(norm(x[0] * y[1] + s * y[0] * x[1], x[1] * y[1]));
      case 'mul': var m1 = rat(a.a), m2 = rat(a.b); if (!m1 || !m2) return null; return chk(norm(m1[0] * m2[0], m1[1] * m2[1]));
      case 'div': var d1 = rat(a.a), d2 = rat(a.b); if (!d1 || !d2 || d2[0] === 0) return null; return chk(norm(d1[0] * d2[1], d1[1] * d2[0]));
      case 'pow': var b = rat(a.a), e = rat(a.b); if (!b || !e || e[1] !== 1 || Math.abs(e[0]) > 60) return null; var k = e[0], pp = Math.pow(b[0], Math.abs(k)), qq = Math.pow(b[1], Math.abs(k)); if (!safe(pp) || !safe(qq)) return null; if (k < 0) { if (pp === 0) return null; return norm(qq, pp); } return [pp, qq];
      case 'abs': var ab = rat(a.a); return ab && [Math.abs(ab[0]), ab[1]];
    }
    return null;
  }
  function chk(r) { return r && safe(r[0]) && safe(r[1]) ? r : null; }
  ex.rat = rat;

  /* flatten a product/quotient into numerator and denominator factor lists (signs collected) */
  function flat(a, num, den, sign) {
    if (a.t === 'paren') return flat(a.a, num, den, sign);
    if (a.t === 'neg') return flat(a.a, num, den, -sign);
    if (a.t === 'mul') { sign = flat(a.a, num, den, sign); return flat(a.b, num, den, sign); }
    if (a.t === 'div') { sign = flat(a.a, num, den, sign); return flat(a.b, den, num, sign); }
    num.push(a); return sign;
  }
  function intRad(a) { var r = rat(a); return r && r[1] === 1 ? r[0] : null; }
  ex.factors = function (a) { var num = [], den = [], sign = flat(a, num, den, 1); return { num: num, den: den, sign: sign }; };
  /* a mixed number written as 3\frac{1}{2} (read by the parser as 3 × 1/2): returns its intended value, else null */
  ex.mixedValue = function (a) {
    var s = 1; while (a.t === 'neg' || a.t === 'paren') { if (a.t === 'neg') s = -s; a = a.a; }
    if (a.t === 'mul' && a.imp && a.a.t === 'neg' && a.a.a.t === 'num') { s = -s; a = { t: 'mul', imp: true, a: a.a.a, b: a.b }; }
    if (a.t !== 'mul' || !a.imp || a.a.t !== 'num' || a.a.dec || a.b.t !== 'div' || !a.b.frac) return null;
    var n = a.b.a, d = a.b.b; if (n.t !== 'num' || d.t !== 'num' || n.dec || d.dec || n.v >= d.v) return null;
    return s * (a.a.v + n.v / d.v);
  };
  /* k·ⁿ√m  (one root at most, in the numerator; m whole) */
  ex.radical = function (a) {
    var num = [], den = [], sign = flat(a, num, den, 1), k = [sign, 1], root = null;
    for (var i = 0; i < num.length; i++) {
      var f = num[i];
      if (f.t === 'root') { if (root) return null; var n = intRad(f.n), m = intRad(f.a); if (n == null || n < 2 || m == null) return null; if (m < 0) { if (n % 2 === 0) return null; m = -m; k[0] = -k[0]; } root = { n: n, m: m }; continue; }
      var r = rat(f); if (!r) return null; k = norm(k[0] * r[0], k[1] * r[1]); if (!k) return null;
    }
    for (var j = 0; j < den.length; j++) { if (den[j].t === 'root') return null; var d = rat(den[j]); if (!d || d[0] === 0) return null; k = norm(k[0] * d[1], k[1] * d[0]); }
    return root ? { k: k, n: root.n, m: root.m } : { k: k, n: 1, m: 1 };
  };
  /* largest a with aⁿ dividing m */
  ex.nthFactor = function (m, n) { var best = 1; for (var a = 2; Math.pow(a, n) <= m; a++) if (m % Math.pow(a, n) === 0) best = a; return best; };
  ex.simplest = function (m, n) { return ex.nthFactor(m, n) === 1; };

  /* how the answer was written */
  ex.shape = function (a) {
    var f = { muls: 0, roots: 0, decimals: 0, fracs: 0, divs: 0, vars: {}, pi: false, ops: 0, nums: 0, rep: false, ell: false, pow: 0, abs: 0, paren: 0 };
    (function walk(x) {
      if (!x) return;
      if (x.t === 'num') { f.nums++; if (x.dec) f.decimals++; if (x.rep) f.rep = true; if (x.ell) f.ell = true; }
      if (x.t === 'root') f.roots++;
      if (x.t === 'div') { f.divs++; if (x.frac) f.fracs++; }
      if (x.t === 'var') f.vars[x.n] = 1;
      if (x.t === 'pi') f.pi = true;
      if (x.t === 'pow') f.pow++;
      if (x.t === 'abs') f.abs++;
      if (x.t === 'paren') f.paren++;
      if (x.t === 'add' || x.t === 'sub') f.ops++;
      if (x.t === 'mul') f.muls++;
      ['a', 'b', 'n'].forEach(function (k) { if (x[k] && typeof x[k] === 'object') walk(x[k]); });
    })(a);
    f.bare = a.t === 'num' || (a.t === 'neg' && a.a.t === 'num');
    return f;
  };
  /* a fraction p/q written plainly (a, -a, a/b, -a/b, \frac{-a}{b}) -> [p, q] as written (not reduced); else null */
  ex.plainFraction = function (a) {
    var s = 1;
    while (a.t === 'neg' || a.t === 'paren') { if (a.t === 'neg') s = -s; a = a.a; }
    if (a.t === 'num' && !a.dec) return [s * a.v, 1];
    if (a.t === 'div') {
      var n = a.a, d = a.b;
      while (n.t === 'neg' || n.t === 'paren') { if (n.t === 'neg') s = -s; n = n.a; }
      while (d.t === 'neg' || d.t === 'paren') { if (d.t === 'neg') s = -s; d = d.a; }
      if (n.t === 'num' && d.t === 'num' && !n.dec && !d.dec) return [s * n.v, d.v];
    }
    return null;
  };

  /* ---- monomials and variable radicals (Lesson 6B extension) ---- */
  function mono(a) { // rational × product of variable powers (integer exponents ≥ 0)
    var num = [], den = [], sign = flat(a, num, den, 1), k = [sign, 1], v = {};
    function addF(f, s) {
      if (f.t === 'var') { v[f.n] = (v[f.n] || 0) + s; return true; }
      if (f.t === 'pow' && f.a.t === 'var') { var e = rat(f.b); if (!e || e[1] !== 1) return false; v[f.a.n] = (v[f.a.n] || 0) + s * e[0]; return true; }
      if (f.t === 'paren') { var m = mono(f.a); if (!m) return false; k = s > 0 ? norm(k[0] * m.k[0], k[1] * m.k[1]) : norm(k[0] * m.k[1], k[1] * m.k[0]); Object.keys(m.vars).forEach(function (x) { v[x] = (v[x] || 0) + s * m.vars[x]; }); return true; }
      var r = rat(f); if (!r) return false; k = s > 0 ? norm(k[0] * r[0], k[1] * r[1]) : norm(k[0] * r[1], k[1] * r[0]); return !!k;
    }
    for (var i = 0; i < num.length; i++) if (!addF(num[i], 1)) return null;
    for (var j = 0; j < den.length; j++) if (!addF(den[j], -1)) return null;
    Object.keys(v).forEach(function (x) { if (!v[x]) delete v[x]; });
    return { k: k, vars: v };
  }
  ex.mono = mono;
  /* outside monomial × ⁿ√(monomial) */
  ex.monoRadical = function (a) {
    var num = [], den = [], sign = flat(a, num, den, 1), root = null, rest = [];
    for (var i = 0; i < num.length; i++) { if (num[i].t === 'root') { if (root) return null; root = num[i]; } else rest.push(num[i]); }
    for (var j = 0; j < den.length; j++) if (den[j].t === 'root') return null;
    var outside = mono(rebuild(rest, den, sign));
    if (!outside) return null;
    if (!root) return { k: outside.k, vars: outside.vars, n: 1, rad: { m: 1, vars: {} } };
    var n = intRad(root.n); if (n == null || n < 2) return null;
    var inside = mono(root.a); if (!inside || inside.k[1] !== 1) return null;
    var m = inside.k[0], k = outside.k;
    if (m < 0) { if (n % 2 === 0) return null; m = -m; k = [-k[0], k[1]]; }
    return { k: k, vars: outside.vars, n: n, rad: { m: m, vars: inside.vars } };
  };
  function rebuild(num, den, sign) {
    var one = { t: 'num', v: 1, s: '1' }, a = num.reduce(function (acc, f) { return acc ? { t: 'mul', a: acc, b: f } : f; }, null) || one;
    den.forEach(function (d) { a = { t: 'div', a: a, b: d }; });
    return sign < 0 ? { t: 'neg', a: a } : a;
  }
  /* How a product/quotient of powers is written (exponent-law answers).
   * Returns { coef:[p,q]|null, vars:{x:[p,q]} (net exponents), flags:{...}, ok } where flags note things that are
   * not "simplest form": negExp, zeroExp, repeatVar, nested (power of a bracket/power), numPow (unevaluated number
   * power), coefSplit (numbers in both numerator and denominator), roots, ratExp (fractional exponents), complex. */
  ex.analyze = function (a) {
    var num = [], den = [], sign = flat(a, num, den, 1), coef = [sign, 1], vars = {}, seen = {}, f = { negExp: false, zeroExp: false, repeatVar: false, nested: false, numPow: false, coefSplit: false, roots: 0, ratExp: false, complex: false, numInNum: 0, numInDen: 0, varExpo: false }, pN = [1, 1], pD = [1, 1];
    function mulC(r, inv) { if (!coef) return; coef = inv ? norm(coef[0] * r[1], coef[1] * r[0]) : norm(coef[0] * r[0], coef[1] * r[1]); if (coef && (!safe(coef[0]) || !safe(coef[1]))) coef = null; }
    function addV(v, e, inv) { if (seen[v]) f.repeatVar = true; seen[v] = 1; var cur = vars[v] || [0, 1]; var s = inv ? -1 : 1; vars[v] = norm(cur[0] * e[1] + s * e[0] * cur[1], cur[1] * e[1]); }
    function one(x, inv) {
      if (x.t === 'paren') x = x.a;
      if (x.t === 'num') { var rr = rat(x) || [x.v, 1]; mulC(rr, inv); if (inv) { f.numInDen++; pD = norm(pD[0] * rr[0], pD[1] * rr[1]); } else { f.numInNum++; pN = norm(pN[0] * rr[0], pN[1] * rr[1]); } return; }
      if (x.t === 'var') { addV(x.n, [1, 1], inv); return; }
      if (x.t === 'pow') {
        var base = x.a; while (base.t === 'paren') base = base.a;
        var e = rat(x.b);
        if (!e) {
          var ee = x.b; while (ee.t === 'paren') ee = ee.a;
          var lead = ee; while (lead.t === 'add' || lead.t === 'sub' || lead.t === 'mul') lead = lead.a;
          if ((ee.t === 'neg' || lead.t === 'neg' || (lead.t === 'num' && lead.v < 0)) && (ee.t !== 'add' && ee.t !== 'sub' || ee.t === 'neg')) f.negExp = true;
          if (base.t === 'var') { f.varExpo = true; if (seen[base.n]) f.repeatVar = true; seen[base.n] = 1; return; } f.complex = true; return;
        }
        if (e[1] !== 1) f.ratExp = true;
        var en = x.b; while (en.t === 'paren') en = en.a; if (en.t === 'neg') en = en.a;
        if (en.t === 'num' && en.dec) f.decExp = true;
        if (en.t === 'div') { var pf = ex.plainFraction(en); if (pf && gcd(pf[0], pf[1]) > 1) f.unreducedExp = true; if (!pf) f.unreducedExp = true; }
        if (en.t === 'add' || en.t === 'sub' || en.t === 'mul') f.unreducedExp = true;
        if (e[0] === 0) f.zeroExp = true;
        if (e[0] < 0) f.negExp = true;
        if (base.t === 'var') { addV(base.n, e, inv); return; }
        if (base.t === 'num') { f.numPow = true; var r = rat(x); if (r) mulC(r, inv); else f.complex = true; if (inv) f.numInDen++; else f.numInNum++; return; }
        f.nested = true; return;
      }
      if (x.t === 'root') { f.roots++; return; }
      if (x.t === 'div' || x.t === 'mul' || x.t === 'neg') { var n2 = [], d2 = [], s2 = flat(x, n2, d2, 1); if (s2 < 0) mulC([-1, 1], false); n2.forEach(function (y) { one(y, inv); }); d2.forEach(function (y) { one(y, !inv); }); return; }
      f.complex = true;
    }
    num.forEach(function (x) { one(x, false); });
    den.forEach(function (x) { one(x, true); });
    if (f.numInNum > 1 || f.numInDen > 1 || (f.numInNum && f.numInDen && (pN[1] !== 1 || pD[1] !== 1 || gcd(pN[0], pD[0]) > 1))) f.coefSplit = true;
    return { coef: coef, vars: vars, flags: f };
  };

  /* numeric equivalence at a few positive sample points (for answers with variables) */
  ex.equiv = function (a, b, vars, n) {
    vars = vars || []; n = n || 5;
    for (var i = 0; i < n; i++) {
      var env = {}; vars.forEach(function (v, j) { env[v] = 0.37 + 1.13 * ((i * 7 + j * 3) % 11) / 5 + j * 0.21; });
      var x = value(a, env), y = value(b, env);
      if (!ex.eq(x, y, 1e-7)) return false;
    }
    return true;
  };

  /* ---- LaTeX output ---- */
  ex.texRat = function (r, opt) {
    if (!r) return '';
    if (r[1] === 1) return String(r[0]);
    return (r[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(r[0]) + '}{' + r[1] + '}';
  };
  ex.texRoot = function (n, inner) { return n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}'; };
  ex.texRadical = function (k, n, m) {
    if (typeof k === 'number') k = [k, 1];
    if (n === 1 || m === 1) return ex.texRat(norm(k[0] * (n === 1 ? m : 1), k[1]));
    var rt = ex.texRoot(n, HW.fmt ? HW.fmt(m) : m);
    if (k[1] === 1) return (k[0] === 1 ? '' : k[0] === -1 ? '-' : k[0]) + rt;
    return (k[0] < 0 ? '-' : '') + '\\frac{' + (Math.abs(k[0]) === 1 ? '' : Math.abs(k[0])) + rt + '}{' + k[1] + '}';
  };
  ex.texMono = function (k, vars) {
    var vs = Object.keys(vars || {}).sort().map(function (x) { return vars[x] === 1 ? x : x + '^{' + vars[x] + '}'; }).join('');
    if (typeof k === 'number') k = [k, 1];
    var c = k[1] === 1 ? (vs && Math.abs(k[0]) === 1 ? (k[0] < 0 ? '-' : '') : String(k[0])) : (k[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(k[0]) + '}{' + k[1] + '}';
    return c + vs;
  };
})(typeof window !== 'undefined' ? window : globalThis);
