/* Math 10C · Unit 1 · Lesson 3 — Rational Numbers, Irrational Numbers, and Decimal Patterns (AN2)
 * Assignment questions 1–12 (u1_L03.tex) and the Lesson 3 Extra Practice (u1_EP03.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's number is one
 * of the possible values) and changes the numbers. Repeating decimals keep short blocks (1–3 digits, leads of 0–2
 * digits) so they can be typed into a calculator, like the booklet's. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  /* ---------- number helpers ---------- */
  var gcd = ex.gcd, norm = ex.norm;
  function isSq(n) { var s = Math.round(Math.sqrt(n)); return s * s === n; }
  function nonSquares(a, b) { var o = []; for (var i = a; i <= b; i++) if (!isSq(i)) o.push(i); return o; }
  function coprimeTo(q, lo, hi) { var o = []; for (var i = lo; i <= hi; i++) if (gcd(i, q) === 1) o.push(i); return o; }
  function rTex(fr) { return ex.texRat(norm(fr[0], fr[1])); }                       // \frac{p}{q}
  function dTex(p, q) { var r = norm(p, q); if (r[1] === 1) return String(r[0]); return (r[0] < 0 ? '-' : '') + '\\dfrac{' + F(Math.abs(r[0])) + '}{' + F(r[1]) + '}'; }
  function split25(q) { var a = 0, b = 0; while (q % 2 === 0) { q /= 2; a++; } while (q % 5 === 0) { q /= 5; b++; } return { a: a, b: b, m: q }; }
  function period(m) { if (m === 1) return 0; var k = 1, x = 10 % m; while (x !== 1 && k < 200) { x = x * 10 % m; k++; } return k; }
  function terminates(p, q) { var r = norm(p, q); return split25(r[1]).m === 1; }
  function texFacs(n) { return n === 1 ? '1' : K.fac(n); }
  /* first n decimal places of an irrational x, chopped (not rounded), for "x = 3.141592…" */
  function cut(x, n) { var f = Math.pow(10, n); return (x < 0 ? '-' : '') + (Math.floor(Math.abs(x) * f) / f).toFixed(n); }
  function badDen(q) { return HW.nt.isPrime(q) ? t(q) + ' is a prime other than 2 and 5' : t(q + '=' + texFacs(q)) + ' has a prime factor other than 2 and 5'; }
  /* decimal digits of |p/q|: { ip, lead, block } (block '' when it terminates) */
  function decParts(p, q) {
    var r = norm(Math.abs(p), q), ip = Math.floor(r[0] / r[1]), rem = r[0] % r[1], digs = '', seen = {};
    while (rem && seen[rem] == null && digs.length < 80) { seen[rem] = digs.length; rem *= 10; digs += Math.floor(rem / r[1]); rem %= r[1]; }
    if (!rem) return { ip: ip, lead: digs, block: '' };
    return { ip: ip, lead: digs.slice(0, seen[rem]), block: digs.slice(seen[rem]) };
  }
  /* first n decimal places of |p/q| as a string like "0.58333333" */
  function digitsOf(p, q, n) {
    var r = norm(Math.abs(p), q), ip = Math.floor(r[0] / r[1]), rem = r[0] % r[1], s = '';
    for (var i = 0; i < n; i++) { rem *= 10; s += Math.floor(rem / r[1]); rem %= r[1]; }
    return ip + '.' + s;
  }
  /* repeating decimal I.lead(block) */
  function repTex(I, lead, block, neg) { return (neg ? '-' : '') + I + '.' + lead + (block ? '\\overline{' + block + '}' : ''); }
  function repVal(I, lead, block, neg) { var x = block ? ex.repRat(I + '.' + lead, block) : norm(Number(I + lead), Math.pow(10, lead.length)); return neg ? [-x[0], x[1]] : x; }
  function minPeriod(s) { for (var d = 1; d < s.length; d++) if (s.length % d === 0 && new Array(s.length / d + 1).join(s.slice(0, d)) === s) return d; return s.length; }
  function canonical(lead, block) {
    if (!block || /^0+$/.test(block) || /^9+$/.test(block)) return false;
    if (minPeriod(block) !== block.length) return false;
    return !lead || lead.charAt(lead.length - 1) !== block.charAt(block.length - 1);
  }
  function digitsStr(r, len) { var s = ''; for (var i = 0; i < len; i++) s += r.int(0, 9); return s; }
  function randBlock(r, len, lead, firstNonZero) {
    for (var i = 0; i < 300; i++) { var b = digitsStr(r, len); if (firstNonZero && b.charAt(0) === '0') continue; if (canonical(lead || '', b)) return b; }
    return len === 1 ? '3' : len === 2 ? '27' : '312';
  }
  /* "0.234\,234\,234\ldots" */
  function dotsTex(I, block, reps, neg) { var g = []; for (var i = 0; i < reps; i++) g.push(block); return (neg ? '-' : '') + I + '.' + g.join('\\,') + '\\ldots'; }
  /* a digit string with growing runs: stem + c^k0, stem + c^(k0+1), ... then the start of the next group */
  function growTex(I, stem, c, k0, spaced, tail) {
    var g = [];
    for (var k = k0; k < k0 + 3; k++) g.push(stem + new Array(k + 1).join(c));
    return I + '.' + g.join(spaced ? '\\,' : '') + (spaced ? '\\,' : '') + (tail == null ? stem : tail) + '\\ldots';
  }
  function randGrow(r) { // { stem, c, k0, tex }
    var c = String(r.int(1, 9)), stem;
    do { stem = String(r.int(1, 9)) + String(r.int(0, 9)); } while (stem.charAt(1) === c || stem.charAt(0) === c);
    return { stem: stem, c: c, k0: r.int(1, 2), tail: r.chance(0.5) ? stem : stem.charAt(0) };
  }
  /* the algebraic method for I.lead(block): c·x = n where c = 10^(L+B) − 10^L */
  function repInfo(I, lead, block, neg) {
    var L = lead.length, B = block.length, x = ex.repRat(I + '.' + lead, block);
    var hi = Math.pow(10, L + B), lo = Math.pow(10, L), c = hi - lo, n = Number(String(I) + lead + block) - Number(String(I) + lead);
    var g = gcd(n, c);
    return { I: I, lead: lead, block: block, neg: !!neg, L: L, B: B, ax: x, x: neg ? [-x[0], x[1]] : x, hi: hi, lo: lo, c: c, n: n, g: g,
      tex: repTex(I, lead, block, neg), absTex: repTex(I, lead, block, false) };
  }
  function shiftTex(R, k) { // k = 10^L (block just right of the point) or 10^(L+B) (block left of it); the block itself is unchanged
    return F(Number(String(R.I) + R.lead + (k === R.hi ? R.block : ''))) + '.\\overline{' + R.block + '}';
  }
  function algebraSol(R) {
    var s = (R.neg ? 'Work with ' + t('x=' + R.absTex) + ' and put the negative sign back at the end.<br>' : 'Let ' + t('x=' + R.absTex) + '.<br>');
    s += 'The block ' + t(R.block) + ' has ' + R.B + ' digit' + (R.B > 1 ? 's' : '') + (R.L ? ' and ' + R.L + ' digit' + (R.L > 1 ? 's' : '') + ' come' + (R.L > 1 ? '' : 's') + ' before it' : '') + '.<br>';
    s += t(F(R.hi) + 'x=' + shiftTex(R, R.hi)) + ' &nbsp;(block left of the point)<br>';
    s += (R.lo > 1 ? t(F(R.lo) + 'x=' + shiftTex(R, R.lo)) + ' &nbsp;(block just right of the point)<br>' : t('x=' + R.absTex) + '<br>');
    s += 'Subtract: ' + t(F(R.c) + 'x=' + F(R.n)) + ', so ' + t('x=\\frac{' + F(R.n) + '}{' + F(R.c) + '}' + (R.g > 1 ? '=' + rTex(R.ax) : '')) + (R.g > 1 ? ' (divide the top and bottom by ' + t(R.g) + ')' : '') + '.';
    if (R.neg) s += '<br>So ' + t(R.tex + '=' + rTex(R.x)) + '.';
    return s;
  }
  function calcString(R) { var s = String(R.I) + '.' + R.lead; while (s.length < 13) s += R.block; return (R.neg ? '-' : '') + s; }
  function isNinesZeros(c) { return /^9+0*$/.test(String(c)); }
  /* a typed mixed number like 2\frac{1}{6} parses as 2×(1/6); catch it before the fraction checker sees it */
  function mixedValue(resp) {
    var pr = ex.parse(resp); if (!pr.ok) return null;
    var a = pr.ast, sg = 1; while (a.t === 'neg' || a.t === 'paren') { if (a.t === 'neg') sg = -sg; a = a.a; }
    if (a.t !== 'mul' || !a.imp) return null;
    var w = a.a; if (w.t === 'neg') { sg = -sg; w = w.a; }
    if (w.t === 'num' && !w.dec && a.b.t === 'div' && a.b.frac && a.b.a.t === 'num' && a.b.b.t === 'num' && !a.b.a.dec && !a.b.b.dec) return sg * (w.v + a.b.a.v / a.b.b.v);
    return null;
  }
  function mixedGuard(check, fr) {
    var T = fr[0] / fr[1];
    return function (resp) {
      var mv = mixedValue(resp);
      if (mv != null && ex.eq(mv, T)) return form('mixed', 'Right value — now write it as an improper fraction, like ' + t('\\frac{13}{6}') + ', not a mixed number.');
      if (mv != null) return wrong('value', 'Check your answer — it doesn’t equal the decimal. (Write it as an improper fraction, like ' + t('\\frac{13}{6}') + '.)');
      return check(resp);
    };
  }

  /* ---------- reusable part makers ---------- */
  var COMBOS = [
    { id: 'NT', html: 'non-repeating, terminating' },
    { id: 'RN', html: 'repeating, non-terminating' },
    { id: 'NN', html: 'non-repeating, non-terminating' },
    { id: 'RT', html: 'repeating, terminating' }];
  /* Q1: kind 'NT' | 'RN' | 'NN'; why = { NT, RN, NN } hints for the two wrong possible combos */
  function patternPart(r, tex, kind, why, sol, text) {
    var opts = COMBOS.map(function (c) {
      return { html: c.html, right: c.id === kind, code: 'said-' + c.id, why: c.id === kind ? null : c.id === 'RT' ? 'That combination never happens: a decimal that stops can’t also repeat forever.' : why[c.id] };
    });
    var p = P.mc(r, t(tex), opts, sol, ['Find the decimal (divide, or use your calculator). Does it stop? If not, does one block of digits repeat?'], text, true);
    p.input.columns = 2;
    return p;
  }
  /* repeating decimal -> fraction (calculator method), with diagnoses for the usual slips */
  function repDiag(R) {
    var trunc = norm(Number(R.I + R.lead + R.block) * (R.neg ? -1 : 1), Math.pow(10, R.L + R.B));
    var whole = R.lead ? ex.repRat(R.I + '.', R.lead + R.block) : null;
    var noInt = R.I ? [R.ax[0] - R.I * R.ax[1], R.ax[1]] : null;
    return function (v) {
      if (ex.eq(Math.abs(v), Math.abs(trunc[0] / trunc[1])) && (v < 0) === R.neg) return { code: 'as-terminating', hint: 'That fraction is the <b>terminating</b> decimal ' + t(F(Math.abs(trunc[0] / trunc[1])).toString()) + '. The bar means the block keeps repeating forever. Type the repeats several times into your calculator, like ' + t(calcString(R)) + ', before converting.' };
      if (whole && ex.eq(Math.abs(v), whole[0] / whole[1])) return { code: 'bar-all', hint: 'Only the digits under the bar repeat: ' + t(R.absTex) + ' is ' + t(digitsOf(R.ax[0], R.ax[1], 8) + '\\ldots') + ', not ' + t(digitsOf(whole[0], whole[1], 8) + '\\ldots') + '.' };
      if (noInt && ex.eq(Math.abs(v), noInt[0] / noInt[1])) return { code: 'no-whole', hint: 'Don’t forget the whole-number part ' + t(R.I) + '.' };
      return null;
    };
  }
  function calcPart(R, text) {
    var p = P.fraction(t(R.tex), R.x, { diag: repDiag(R) },
      'Calculator: type ' + t(calcString(R)) + ' and use the decimal-to-fraction command (►Frac): ' + t(R.tex + '=' + rTex(R.x)) + '.<br>Check: ' + t(rTex(R.x)) + ' divides out to ' + t((R.neg ? '-' : '') + digitsOf(R.ax[0], R.ax[1], 8) + '\\ldots') + ' ✓<br><i>Or by algebra</i>' + (R.neg ? ' (on ' + t(R.absTex) + ', then put the sign back)' : '') + ': ' + t(F(R.hi) + 'x-' + (R.lo > 1 ? F(R.lo) : '') + 'x=' + F(R.c) + 'x=' + F(R.n)) + ', so ' + t('x=\\frac{' + F(R.n) + '}{' + F(R.c) + '}' + (R.g > 1 ? '=' + rTex(R.ax) : '')) + '.',
      ['Type the decimal into a calculator with the repeating block written out several times (e.g. ' + t(calcString(R)) + '), then convert it to a fraction. (If your calculator won’t convert it, use the algebraic method from the lesson.)', 'Give an improper fraction in lowest terms — not a mixed number or a decimal.'], text || 'repeating to fraction ' + R.tex);
    p.check = mixedGuard(p.check, R.x);
    p.good = [(R.x[0] < 0 ? '-' : '') + Math.abs(R.x[0]) + '/' + R.x[1]];
    var bad = [String(R.I + '.' + R.lead + R.block)];
    if (R.I) bad.push((R.neg ? '-' : '') + R.I + '\\frac{' + (R.ax[0] - R.I * R.ax[1]) + '}{' + R.ax[1] + '}');
    if (R.x[1] > 1) bad.push(rTex([R.x[1], R.x[0]]));
    p.bad = bad;
    return p;
  }
  /* algebraic method: three boxes "c x = n, so x = p/q" */
  function algebraPart(R, text) {
    var X = R.x, labels = ['After subtracting', 'Right side', 'Answer'];
    var fr = mixedGuard(K.fraction(X, { diag: repDiag(R) }), X);
    function num(s) { var a = K.read(s); if (a.res) return null; return ex.rat(a.ast); }
    var check = function (resp) {
      resp = resp || [];
      var filled = [0, 1, 2].filter(function (i) { return resp[i] != null && String(resp[i]).trim() !== ''; });
      if (!filled.length) return form('empty', 'Fill in the boxes: the equation you get after subtracting, then the fraction.');
      if (filled.length < 3) return form('incomplete', 'Fill in all three boxes (the number in front of ' + t('x') + ', the right side, and the fraction).');
      var cp = HW.parse.number(resp[0]);
      if (!cp.ok || cp.value <= 0 || cp.value % 1) return form('coef', '<b>' + labels[0] + ':</b> the first box is the whole number in front of ' + t('x') + ' after you subtract, e.g. ' + t('90') + '.');
      var c = cp.value, n = num(resp[1]);
      if (!n) return form('rhs', '<b>' + labels[1] + ':</b> type the number on the right side of the equation.');
      var eqPos = n[0] * X[1] === c * X[0] * n[1], eqAbs = R.neg && n[0] * X[1] === -c * X[0] * n[1];
      if (!isNinesZeros(c)) {
        if (c === R.hi || c === R.lo || /^10*$/.test(String(c))) return wrong('no-subtract', '<b>' + labels[0] + ':</b> subtract the two equations so the repeating tails cancel. The number in front of ' + t('x') + ' will look like ' + t('9') + ', ' + t('99') + ', ' + t('90') + ' or ' + t('990') + '.');
        return wrong('coef-form', '<b>' + labels[0] + ':</b> after subtracting, the number in front of ' + t('x') + ' is one power of ' + t('10') + ' minus another, like ' + t('99') + ' or ' + t('990') + '. Check which powers of 10 you used.');
      }
      if (!eqPos && !eqAbs) {
        if ((c * R.ax[0]) % R.ax[1] !== 0) return wrong('tails', '<b>' + labels[1] + ':</b> with that subtraction the repeating tails don’t line up, so they don’t cancel. Use one multiplier that moves the block left of the point and one that puts it just right of the point.');
        return wrong('rhs', '<b>' + labels[1] + ':</b> check your subtraction. Line up the two equations — the repeating tails cancel completely, leaving a whole number on the right.');
      }
      var res = fr(resp[2]);
      if (res.v !== 'correct') return { v: res.v, code: res.code, hint: '<b>' + labels[2] + ':</b> ' + (res.hint || 'Divide both sides by ' + t(F(c)) + ' and reduce.') };
      return ok();
    };
    var key = [String(R.c), String(R.neg ? -R.n : R.n), (X[0] < 0 ? '-' : '') + Math.abs(X[0]) + '/' + X[1]];
    var good = [[String(R.c), String(R.n), key[2]]];
    if (R.L === 0 && R.B <= 2) { var c2 = Math.pow(10, 2 * R.B) - 1; good.push([String(c2), String(c2 / R.c * R.n * (R.neg ? -1 : 1)), key[2]]); }
    var bad = [[String(R.c), String(R.n + 1), key[2]], [String(R.hi), String(R.n), key[2]], [key[0], key[1], (Math.abs(R.n)) + '/' + R.c + (R.neg ? '' : '0')]];
    if (R.g > 1) bad.push([key[0], key[1], (R.neg ? '-' : '') + R.n + '/' + R.c]);
    return { prompt: t(R.tex), input: { type: 'fields', fields: [
        { label: 'Subtract:', after: t('x'), name: labels[0] }, { before: t('='), name: labels[1], wide: true, mode: 'text' }, { label: 'So', before: t('x='), wide: true, name: labels[2], mode: 'text' }] },
      check: check, key: key, answer: t(F(R.c) + 'x=' + F(R.neg ? -R.n : R.n)) + ', so ' + t('x=' + rTex(X)), solution: algebraSol(R), good: good, bad: bad,
      hints: ['Write ' + t('x=' + R.tex) + '. Multiply by the power of 10 that moves the whole block left of the decimal point' + (R.L ? ', and by the power of 10 that puts the block just right of the point' : '') + '. Subtract.', 'Type the fraction as e.g. ' + t('11/15') + '. Reduce it to lowest terms.'],
      text: text || 'algebraic method ' + R.tex };
  }
  /* numerical response: 0.d(ef) -> a/b, value of b − a */
  function nrRepPart(r) {
    var d, blk, R;
    for (var i = 0; i < 500; i++) {
      d = String(r.int(1, 9)); blk = randBlock(r, 2, d);
      R = repInfo(0, d, blk);
      if (R.g > 1 && R.ax[1] - R.ax[0] > 0) break;
    }
    var a = R.ax[0], b = R.ax[1], ans = b - a;
    var wrongs = [];
    wrongs.push({ v: R.c - R.n, code: 'unreduced', hint: 'Reduce ' + t('\\frac{' + R.n + '}{' + R.c + '}') + ' to simplest form first, then subtract.' });
    var w1 = norm(Number(d + blk), 999); wrongs.push({ v: w1[1] - w1[0], code: 'bar-all', hint: 'Only ' + t(blk) + ' repeats — the ' + t(d) + ' appears once. ' + t(R.tex) + ' is ' + t(digitsOf(a, b, 7) + '\\ldots') + ', not ' + t('0.' + d + blk + d + blk + '\\ldots') + '.' });
    var w2 = norm(Number(d + blk), 990); wrongs.push({ v: w2[1] - w2[0], code: 'no-lead-subtract', hint: 'Check the subtraction: ' + t(F(R.hi) + 'x-' + R.lo + 'x') + ' gives ' + t(d + blk + '-' + d) + ' on the right side, not ' + t(d + blk) + '.' });
    wrongs.push({ v: a - b, code: 'a-b', hint: 'You found ' + t('a-b') + '. The question asks for ' + t('b-a') + '.' });
    return P.nr('When the repeating decimal ' + t(R.tex) + ' is converted to a rational number in simplest form ' + t('\\dfrac{a}{b}') + ', the value of ' + t('b-a') + ' is ________.', ans, function (v) {
      for (var j = 0; j < wrongs.length; j++) if (v === wrongs[j].v && wrongs[j].v !== ans) return { code: wrongs[j].code, hint: wrongs[j].hint };
      return null;
    }, algebraSol(R) + '<br>So ' + t('a=' + a) + ', ' + t('b=' + b) + ' and ' + t('b-a=' + b + '-' + a + '=' + ans) + '.',
    ['Convert ' + t(R.tex) + ' to a fraction (calculator or algebra), reduce it, then subtract.', 'One digit comes before the repeating block, so use ' + t('1000x') + ' and ' + t('10x') + '.'], 'b−a for ' + R.tex);
  }
  /* rational number strictly between lo and hi */
  function betweenPart(loTex, lo, hiTex, hi, text) {
    var key = null;
    for (var dp = 1; dp < 6 && key == null; dp++) { var f = Math.pow(10, dp), c = Math.floor(lo * f) + 1; if (c / f < hi) key = (c / f).toFixed(dp); }
    var check = function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var v = a.val, rt = ex.rat(a.ast);
      if (!rt && v > lo && v < hi && Math.abs(v * 1e6 - Math.round(v * 1e6)) < 1e-6) return form('as-decimal', 'That works out to ' + t(F(Math.round(v * 1e6) / 1e6)) + ', which is rational. Type it as a decimal or a fraction.');
      if (!rt) return wrong('irrational-answer', 'That number has a root or ' + t('\\pi') + ' in it. Give a rational number — a terminating decimal or a fraction.');
      if (v > lo && v < hi) return ok();
      if (Math.abs(v - lo) < 1e-3 || Math.abs(v - hi) < 1e-3) return wrong('endpoint', 'That’s (about) one of the two numbers themselves. Find one strictly <b>between</b> them.');
      return wrong('not-between', t(String(v).length > 10 ? v.toFixed(4) : v) + ' isn’t between them. Find a decimal for each number first.');
    };
    return { prompt: 'Give a rational number between ' + t(loTex) + ' and ' + t(hiTex) + '.', input: { type: 'math', keys: 'fraction' }, check: check, key: key,
      answer: t(key) + ' (any rational number strictly between them)', good: [String(((lo + hi) / 2).toFixed(6))], bad: [loTex, hiTex, '0'],
      solution: t(loTex + '=' + cut(lo, 7) + '\\ldots') + ' and ' + t(hiTex + '=' + cut(hi, 7) + '\\ldots') + '. A terminating decimal between them, such as ' + t(key) + ', is rational: ' + t(cut(lo, 5) + '\\ldots<' + key + '<' + cut(hi, 5) + '\\ldots') + '.',
      hints: ['Find a decimal for each number with your calculator.', 'Any terminating decimal between the two values is rational.'], text: text };
  }
  /* SVG number line 0..max with labelled points (plain-text labels) */
  function numberLine(pts, max) {
    var W = 520, pad = 18, sc = (W - 2 * pad) / max, s = '<svg viewBox="0 0 ' + W + ' 96" width="100%" style="max-width:520px" role="img" aria-label="number line">';
    s += '<line x1="' + pad + '" y1="62" x2="' + (W - 6) + '" y2="62" stroke="currentColor" stroke-width="1.5"/>';
    for (var i = 0; i <= max; i++) { var x = pad + i * sc; s += '<line x1="' + x + '" y1="57" x2="' + x + '" y2="67" stroke="currentColor"/><text x="' + x + '" y="82" font-size="11" text-anchor="middle" fill="currentColor">' + i + '</text>'; }
    pts.forEach(function (p, j) {
      var x = pad + p.v * sc, y = [40, 26, 12][j % 3];
      s += '<line x1="' + x + '" y1="' + (y + 3) + '" x2="' + x + '" y2="60" stroke="#c0392b" stroke-width="0.8"/><circle cx="' + x + '" cy="62" r="3.5" fill="#c0392b"/><text x="' + x + '" y="' + y + '" font-size="12" text-anchor="middle" fill="#c0392b">' + p.label + '</text>';
    });
    return s + '</svg>';
  }
  function mcTextFix(p, text) { p.text = text; return p; }

  /* ---------- Question 5 items (shared) ---------- */
  var SQ_DEC = [[4, 2], [9, 3], [16, 4], [25, 5], [36, 6], [49, 7], [64, 8], [81, 9]];       // 0.00kk = (0.0k)^2
  var MIXED_SQ = [[36, 25, 6, 5], [49, 36, 7, 6], [25, 16, 5, 4], [16, 9, 4, 3], [64, 49, 8, 7], [81, 64, 9, 8], [49, 25, 7, 5], [121, 100, 11, 10]]; // c²/b² between 1 and 2... as mixed numbers
  var QUAD = [[16, 625, 2, 5], [1, 16, 1, 2], [16, 81, 2, 3], [81, 256, 3, 4], [1, 81, 1, 3], [81, 625, 3, 5], [1, 625, 1, 5]];
  function q5Items(r) {
    var it = {};
    var d = r.pick([2, 4, 5, 6, 8]);
    it.a = { tex: '0.' + d, val: norm(d, 10), sol: t('0.' + d + '=\\frac{' + d + '}{10}' + (gcd(d, 10) > 1 ? '=' + rTex([d, 10]) : '')) + '. It terminates, so it is rational.', why: t('0.' + d) + ' terminates, so it is ' + t('\\frac{' + d + '}{10}') + ' — rational.', diag: null };
    var b = r.pick([3, 4, 5, 6, 7, 8, 9]);
    it.b = { tex: '\\sqrt{\\dfrac{1}{' + b * b + '}}', val: [1, b], sol: t('1^{2}=1') + ' and ' + t(b + '^{2}=' + b * b) + ', so ' + t('\\sqrt{\\frac{1}{' + b * b + '}}=\\frac{1}{' + b + '}') + '. Rational.', why: t('1') + ' and ' + t(b * b) + ' are both perfect squares, so the root is exactly ' + t('\\frac{1}{' + b + '}') + '.',
      diag: function (v) { if (ex.eq(v, 1 / (b * b))) return { code: 'no-root', hint: 'That’s the number under the root. Take the square root of the top and the bottom.' }; return null; } };
    var sq = r.pick(SQ_DEC), cTex = '0.00' + (sq[0] < 10 ? '0' : '') + sq[0];
    it.c = { tex: '\\sqrt{' + cTex + '}', val: norm(sq[1], 100), sol: t('0.0' + sq[1] + '\\times 0.0' + sq[1] + '=' + cTex) + ', so ' + t('\\sqrt{' + cTex + '}=0.0' + sq[1] + '=' + rTex([sq[1], 100])) + '. Rational.', why: t('0.0' + sq[1] + '^{2}=' + cTex) + ', so ' + t('\\sqrt{' + cTex + '}') + ' is exactly ' + t('0.0' + sq[1]) + '.',
      diag: function (v) { if (ex.eq(v, sq[1] / 10)) return { code: 'dec-place', hint: 'Check: ' + t('(0.' + sq[1] + ')^{2}=' + (sq[0] / 100)) + ', not ' + t(cTex) + '. Watch the decimal places.' }; if (ex.eq(v, sq[0] / 10000)) return { code: 'no-root', hint: 'That’s the number under the root. Take its square root.' }; return null; } };
    var dn = r.pick(nonSquares(51, 99));
    it.d = { tex: '-\\sqrt{' + dn + '}', val: null, sol: t(dn) + ' is not a perfect square (' + t(Math.floor(Math.sqrt(dn)) + '^{2}=' + Math.pow(Math.floor(Math.sqrt(dn)), 2)) + ', ' + t(Math.ceil(Math.sqrt(dn)) + '^{2}=' + Math.pow(Math.ceil(Math.sqrt(dn)), 2)) + '), so ' + t('-\\sqrt{' + dn + '}=-' + cut(Math.sqrt(dn), 6) + '\\ldots') + ' never stops or repeats. Irrational.', why: t(dn) + ' is not a perfect square, so its square root never stops and never repeats — irrational. (The negative sign doesn’t change that.)' };
    var e = r.int(1, 8);
    it.e = { tex: '-0.\\overline{' + e + '}', val: norm(-e, 9), sol: t('-0.\\overline{' + e + '}=-0.' + e + e + e + e + '\\ldots') + ' repeats, so it is rational: ' + t('-\\frac{' + e + '}{9}' + (gcd(e, 9) > 1 ? '=' + rTex([-e, 9]) : '')) + '.', why: 'The digit ' + t(e) + ' repeats forever, and every repeating decimal is a fraction — rational.',
      diag: function (v) { if (ex.eq(v, -e / 10)) return { code: 'as-terminating', hint: t('-\\frac{' + e + '}{10}=-0.' + e) + ' stops. The bar means the ' + t(e) + ' repeats forever: type ' + t('-0.' + e + e + e + e + e + e + e + e + e + e) + ' into your calculator and convert.' }; return null; } };
    var ms = r.pick(MIXED_SQ), mixTex = '1\\tfrac{' + (ms[0] - ms[1]) + '}{' + ms[1] + '}';
    it.f = { tex: '-\\sqrt{1\\dfrac{' + (ms[0] - ms[1]) + '}{' + ms[1] + '}}', val: [-ms[2], ms[3]], sol: t(mixTex + '=\\frac{' + ms[0] + '}{' + ms[1] + '}') + ', and ' + t('\\sqrt{\\frac{' + ms[0] + '}{' + ms[1] + '}}=\\frac{' + ms[2] + '}{' + ms[3] + '}') + ', so the number is ' + t('-\\frac{' + ms[2] + '}{' + ms[3] + '}') + '. Rational.', why: 'Change ' + t(mixTex) + ' to ' + t('\\frac{' + ms[0] + '}{' + ms[1] + '}') + ' first: both parts are perfect squares, so the root is exactly ' + t('\\frac{' + ms[2] + '}{' + ms[3] + '}') + '.',
      diag: function (v) { if (ex.eq(v, -ms[0] / ms[1])) return { code: 'no-root', hint: 'That’s the number under the root, as an improper fraction. Now take the square root of the top and the bottom.' }; return null; } };
    var gI = r.int(2, 9), gB = randBlock(r, 3, ''), gR = repInfo(gI, '', gB);
    it.g = { tex: dotsTex(gI, gB, 3), val: gR.x, R: gR, sol: 'The block ' + t(gB) + ' repeats, so it is rational. ' + t('1000x=' + F(gR.hi * gI + Number(gB)) + '.\\overline{' + gB + '}') + ', so ' + t('999x=' + F(gR.n)) + ' and ' + t('x=\\frac{' + F(gR.n) + '}{999}' + (gR.g > 1 ? '=' + rTex(gR.x) : '')) + '.', why: 'The block ' + t(gB) + ' copies itself forever. Every repeating decimal is a fraction — rational.',
      diag: function (v) { if (ex.eq(v, Number(gI + '.' + gB))) return { code: 'as-terminating', hint: 'That fraction equals the terminating decimal ' + t(gI + '.' + gB) + '. The block repeats forever — type ' + t(calcString(gR)) + ' into your calculator.' }; if (ex.eq(v, Number(gB) / 999)) return { code: 'no-whole', hint: 'Don’t forget the whole-number part ' + t(gI) + '.' }; return null; } };
    var gw = randGrow(r), hI = r.int(1, 9);
    it.h = { tex: growTex(hI, gw.stem, gw.c, gw.k0, true, gw.tail), val: null, sol: 'Between the copies of ' + t(gw.stem) + ' the run of ' + t(gw.c) + '’s keeps getting longer, so no fixed block ever repeats and the digits never stop. Irrational.', why: 'Look closely: the run of ' + t(gw.c) + '’s gets longer each time, so no single block repeats. Never stopping and never repeating means irrational.' };
    var qd = r.pick(QUAD);
    it.i = { tex: '\\sqrt{\\sqrt{\\dfrac{' + qd[0] + '}{' + qd[1] + '}}}', val: [qd[2], qd[3]], sol: 'Inside first: ' + t('\\sqrt{\\frac{' + qd[0] + '}{' + qd[1] + '}}=\\frac{' + qd[2] * qd[2] + '}{' + qd[3] * qd[3] + '}') + ', then ' + t('\\sqrt{\\frac{' + qd[2] * qd[2] + '}{' + qd[3] * qd[3] + '}}=\\frac{' + qd[2] + '}{' + qd[3] + '}') + '. Rational.', why: 'Work from the inside out: ' + t('\\sqrt{\\frac{' + qd[0] + '}{' + qd[1] + '}}=\\frac{' + qd[2] * qd[2] + '}{' + qd[3] * qd[3] + '}') + ', and that is a perfect square too.',
      diag: function (v) { if (ex.eq(v, qd[2] * qd[2] / (qd[3] * qd[3]))) return { code: 'one-root', hint: 'You took one square root. There are two — take the square root again.' }; if (ex.eq(v, qd[0] / qd[1])) return { code: 'no-root', hint: 'That’s the number under the roots. Take the square root twice.' }; return null; } };
    return it;
  }
  function q5FracPart(sh, id, level, hints) {
    var x = sh[id];
    var p = P.fraction('Write ' + t(x.tex) + ' as a fraction in simplest form.', x.val, { diag: x.diag || null }, x.sol,
      hints || ['Simplify the number first (take any square roots), then write it as a fraction.'], 'Q5 fraction ' + x.tex.replace(/\\[a-z]+/g, ''));
    p.input.before = t(x.tex + '=');
    p.check = mixedGuard(p.check, x.val);
    p.good = [(x.val[0] < 0 ? '-' : '') + Math.abs(x.val[0]) + '/' + x.val[1]];
    return p;
  }

  /* ---------- Extra practice 12 rows ---------- */
  function e12Rows(r, kinds) {
    var make = {
      sq: function () { var k = r.int(2, 12); return { tex: '\\sqrt{' + k * k + '}', rat: true, why: t(k * k + '=' + k + '^{2}') + ', so ' + t('\\sqrt{' + k * k + '}=' + k) + ' — rational.' }; },
      nsq: function () { var s = r.int(2, 4), f = r.pick([2, 3, 5, 6, 7]), n = s * s * f; return { tex: '\\sqrt{' + n + '}', rat: false, why: t('\\sqrt{' + n + '}=' + s + '\\sqrt{' + f + '}') + ': ' + t(n) + ' is not a perfect square, so it is irrational.' }; },
      pipi: function () { var k = r.pick([1, 2, 3]); return { tex: '\\dfrac{' + (k > 1 ? k : '') + '\\pi}{\\pi}', rat: true, why: 'Simplify first: the ' + t('\\pi') + '’s cancel, leaving ' + t(k) + ' — rational.' }; },
      prod: function () { var pr = r.pick([[2, 8], [3, 12], [2, 18], [5, 20], [3, 27], [2, 32]]); return { tex: '\\sqrt{' + pr[0] + '}\\times\\sqrt{' + pr[1] + '}', rat: true, why: t('\\sqrt{' + pr[0] + '}\\times\\sqrt{' + pr[1] + '}=\\sqrt{' + pr[0] * pr[1] + '}=' + Math.sqrt(pr[0] * pr[1])) + ' — rational, even though each factor is irrational.' }; },
      sqfr: function () { var ab = r.pick([[3, 5], [2, 7], [4, 9], [5, 6], [3, 8], [7, 10]]); return { tex: '\\sqrt{\\dfrac{' + ab[0] * ab[0] + '}{' + ab[1] * ab[1] + '}}', rat: true, why: 'Top and bottom are perfect squares: the root is ' + t('\\frac{' + ab[0] + '}{' + ab[1] + '}') + ' — rational.' }; },
      negdec: function () { var k = r.pick([2, 3, 4, 5, 6, 7, 8, 9]); return { tex: '-\\sqrt{' + (k * k / 100) + '}', rat: true, why: t('0.' + k + '^{2}=' + (k * k / 100)) + ', so the number is ' + t('-0.' + k) + ' — rational.' }; },
      rep: function () { var bl = randBlock(r, 2, ''), fr = norm(Number(bl), 99); return { tex: '0.\\overline{' + bl + '}', rat: true, why: 'It repeats: ' + t('0.\\overline{' + bl + '}=' + rTex(fr)) + ' — rational.' }; },
      pihalf: function () { var v = r.pick(['\\dfrac{\\pi}{2}', '\\dfrac{\\pi}{3}', '2\\pi', '\\pi+1']); return { tex: v, rat: false, why: 'Halving, doubling or adding to ' + t('\\pi') + ' can’t make its digits stop or repeat — irrational.' }; },
      grow: function () { var g = r.chance(0.5) ? { tex: growTex(0, '1', '2', 1, false, '1'), c: '2' } : { tex: growTex(0, '1', '0', 1, false, '1'), c: '0' }; return { tex: g.tex, rat: false, why: 'The runs of ' + t(g.c) + '’s keep growing, so no fixed block ever repeats — irrational.' }; },
      sum: function () { var n = r.pick([2, 3, 5, 7]); return { tex: '\\sqrt{' + n + '}+\\sqrt{' + n + '}', rat: false, why: t('\\sqrt{' + n + '}+\\sqrt{' + n + '}=2\\sqrt{' + n + '}') + ', which is irrational.' }; }
    };
    return kinds.map(function (k, i) { var o = make[k](); o.id = 'r' + i; return o; });
  }
  /* plain-text label for the teacher log: \dfrac{\pi}{2} -> π/2, 0.\overline{07} -> 0.(07) repeating, \sqrt{\dfrac{9}{25}} -> √(9/25) */
  function plainTex(s) {
    s = s.replace(/\\pi/g, 'π').replace(/\\times/g, '×').replace(/\\ldots/g, '…').replace(/\\,/g, '').replace(/\\overline\{(\d+)\}/g, '($1) repeating');
    s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2');
    return s.replace(/\\sqrt\{([^{}]*)\}/g, function (m, a) { return /^[\d.]+$/.test(a) ? '√' + a : '√(' + a + ')'; });
  }
  function ratGrid(r, rows, text) {
    var shown = r.shuffle(rows), want = {};
    rows.forEach(function (x) { want[x.id] = x.rat ? 'Q' : 'I'; });
    var byId = {}; rows.forEach(function (x) { byId[x.id] = x; });
    var p = P.grid('Classify each number as rational or irrational.', shown.map(function (x) { return { id: x.id, html: t(x.tex), label: plainTex(x.tex) }; }),
      [{ id: 'Q', html: 'Rational', label: 'Rational' }, { id: 'I', html: 'Irrational', label: 'Irrational' }], want,
      { why: function (rowId) { return { code: byId[rowId].rat ? 'said-irrational' : 'said-rational', hint: 'Look again at ' + t(byId[rowId].tex) + '. ' + (byId[rowId].rat ? 'Simplify it first.' : 'Can it be written as a ratio of integers?') }; } },
      rows.map(function (x) { return t(x.tex) + ': ' + x.why; }).join('<br>'), ['Simplify each number first, then decide: a ratio of integers (or a decimal that stops or repeats) is rational.'], text);
    return p;
  }

  HW.addCodes({
    'mc-said-NT': 'Said non-repeating & terminating', 'mc-said-RN': 'Said repeating & non-terminating', 'mc-said-NN': 'Said non-repeating & non-terminating', 'mc-said-RT': 'Said repeating & terminating (impossible)',
    'as-terminating': 'Treated a repeating decimal as terminating', 'bar-all': 'Repeated the digits before the bar too', 'no-whole': 'Lost the whole-number part',
    'no-root': 'Forgot to take the square root', 'one-root': 'Took only one of two roots', 'dec-place': 'Decimal-place slip in a root',
    'coef-inside': 'Read k√m as √(k·m)', 'no-subtract': 'Didn’t subtract the equations', 'coef-form': 'Wrong multipliers (algebraic method)', tails: 'Repeating tails don’t cancel', rhs: 'Subtraction error (algebraic method)',
    unreduced: 'Didn’t reduce before b − a', 'not-reduced': 'Applied the denominator test before reducing', 'den-test': 'Misread the denominator test', swap: 'Swapped nines and zeros', 'no-zeros': 'Left out the zeros for the lead', close: 'Treated 0.(9) as less than 1', 'real-value': 'Ignored the bar placement', screen: 'Confused screen size with block length', 'no-lead-subtract': 'Forgot to subtract the lead', 'a-b': 'Found a − b', 'said-irrational': 'Called a rational number irrational', 'said-rational': 'Called an irrational number rational',
    mixed: 'Wrote a mixed number', 'irrational-answer': 'Gave an irrational number', endpoint: 'Gave an endpoint', 'not-between': 'Number not between', 'not-multiple': 'Numerator doesn’t cancel the bad prime',
    'sum-lead': 'Added a and b instead of taking the larger', 'max-block': 'Gave the maximum block length, not the actual', 'n-not-n-1': 'Counted n remainders instead of n − 1'
  });

  HW.defineLesson({
    id: 'u1l3', unit: 1, num: '3', title: 'Rational Numbers, Irrational Numbers, and Decimal Patterns', outcome: 'AN2',
    blurb: 'Decimals that stop, repeat, or wander forever — sorting rational from irrational numbers, ordering irrational numbers, and turning repeating decimals back into fractions.',
    questions: [
      { num: '1', section: 'Part A — Decimal patterns: rational or irrational?', stem: 'State whether the decimal equivalent of the number is <b>repeating</b> or <b>non-repeating</b>, and whether it is <b>terminating</b> or <b>non-terminating</b>.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          var q = r.pick([4, 8, 5, 20, 25, 16, 40]), p = r.pick(coprimeTo(q, 1, q - 1));
          return patternPart(r, '\\dfrac{' + p + '}{' + q + '}', 'NT', { RN: 'Divide ' + t(p + '\\div ' + q) + ': it stops. A decimal that stops is terminating.', NN: 'Divide ' + t(p + '\\div ' + q) + ' — the decimal stops, so it terminates.' },
            t('\\frac{' + p + '}{' + q + '}=' + K.decTex([p, q])) + '; ' + t(q + '=' + texFacs(q)) + ' has only 2s and 5s, so it stops. <b>Non-repeating, terminating.</b>', 'pattern of ' + p + '/' + q);
        } },
        { id: '1b', level: 'LIM', make: function (r) {
          var bl = randBlock(r, r.pick([3, 3, 2]), '', true), tex = dotsTex(0, bl, bl.length === 2 ? 4 : 3);
          return patternPart(r, tex, 'RN', { NT: 'The “…” means it keeps going, so it doesn’t terminate.', NN: 'Look at the digits: the block ' + t(bl) + ' copies itself again and again. That’s repeating.' },
            'The block ' + t(bl) + ' copies itself forever: ' + t(tex + '=0.\\overline{' + bl + '}') + '. <b>Repeating, non-terminating.</b>', 'pattern of 0.' + bl + '…');
        } },
        { id: '1c', level: 'BEG', make: function (r) {
          var q = r.pick([11, 3, 7, 9]), p = r.pick(coprimeTo(q, 1, q - 1));
          return patternPart(r, '-\\dfrac{' + p + '}{' + q + '}', 'RN', { NT: 'Divide ' + t(p + '\\div ' + q) + ' on your calculator: it never stops. (' + t(q) + ' is not built from 2s and 5s.)', NN: 'Divide it out: ' + t(K.decTex([-p, q])) + '. A block repeats. (The negative sign doesn’t change the pattern.)' },
            t('-\\frac{' + p + '}{' + q + '}=' + K.decTex([-p, q])) + '; ' + badDen(q) + ', so the decimal never stops but repeats. <b>Repeating, non-terminating.</b>', 'pattern of -' + p + '/' + q);
        } },
        { id: '1d', level: 'EMG', make: function (r) {
          var b = r.pick([3, 6, 9, 12, 7]), a = r.pick(coprimeTo(b, 1, b - 1));
          return patternPart(r, '\\sqrt{\\dfrac{' + a * a + '}{' + b * b + '}}', 'RN', { NN: 'Both ' + t(a * a) + ' and ' + t(b * b) + ' are perfect squares, so the root simplifies to the fraction ' + t('\\frac{' + a + '}{' + b + '}') + '. What does its decimal do?', NT: 'Simplify the root to ' + t('\\frac{' + a + '}{' + b + '}') + ', then divide. Does it stop?' },
            t('\\sqrt{\\frac{' + a * a + '}{' + b * b + '}}=\\frac{' + a + '}{' + b + '}=' + K.decTex([a, b])) + '; ' + badDen(b) + '. <b>Repeating, non-terminating.</b>', 'pattern of sqrt(' + a * a + '/' + b * b + ')');
        } },
        { id: '1e', level: 'BEG', make: function (r) {
          var n = r.pick(nonSquares(11, 99));
          return patternPart(r, '-\\sqrt{' + n + '}', 'NN', { NT: t('-\\sqrt{' + n + '}=-' + cut(Math.sqrt(n), 8) + '\\ldots') + ' — the calculator only shows the first digits. ' + t(n) + ' isn’t a perfect square, so the digits never stop.', RN: 'No block of digits repeats: ' + t(n) + ' isn’t a perfect square, so ' + t('\\sqrt{' + n + '}') + ' is irrational.' },
            t(n) + ' is not a perfect square, so ' + t('-\\sqrt{' + n + '}=-' + cut(Math.sqrt(n), 6) + '\\ldots') + ' is irrational. <b>Non-repeating, non-terminating.</b>', 'pattern of -sqrt' + n);
        } },
        { id: '1f', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]), v = k * k / 100, rt = k / 10;
          return patternPart(r, '\\sqrt{' + v + '}', 'NT', { NN: 'Check: ' + t(rt + '\\times ' + rt + '=' + v) + '. So ' + t('\\sqrt{' + v + '}') + ' is exactly ' + t(rt) + ' — not every square root is irrational.', RN: 'Check: ' + t(rt + '^{2}=' + v) + ', so ' + t('\\sqrt{' + v + '}=' + rt) + '. Does that repeat?' },
            t(rt + '^{2}=' + v) + ', so ' + t('\\sqrt{' + v + '}=' + rt) + '. <b>Non-repeating, terminating.</b>', 'pattern of sqrt' + v);
        } },
        { id: '1g', level: 'BEG', make: function (r) {
          var q = r.pick([8, 4, 5, 16, 20, 25]), p = r.pick(coprimeTo(q, 1, q - 1)), w = r.int(1, 9), imp = w * q + p;
          return patternPart(r, '-' + w + '\\dfrac{' + p + '}{' + q + '}', 'NT', { RN: t(w + '\\frac{' + p + '}{' + q + '}=' + K.decTex([imp, q])) + ' stops. A decimal that stops is terminating and doesn’t repeat.', NN: 'Divide ' + t(p + '\\div ' + q) + ' — it stops, so it terminates.' },
            t('-' + w + '\\frac{' + p + '}{' + q + '}=' + K.decTex([-imp, q])) + '; ' + t(q + '=' + texFacs(q)) + ' has only 2s and 5s. <b>Non-repeating, terminating.</b>', 'pattern of -' + w + ' ' + p + '/' + q);
        } },
        { id: '1h', level: 'LIM', make: function (r) {
          var v = r.pick([['\\pi', Math.PI], ['\\pi', Math.PI], ['2\\pi', 2 * Math.PI], ['\\dfrac{\\pi}{2}', Math.PI / 2], ['-\\pi', -Math.PI]]);
          return patternPart(r, v[0], 'NN', { NT: 'Your calculator rounds ' + t('\\pi') + ' to fit the screen. Its digits really go on forever.', RN: t('\\pi') + '’s digits never settle into a repeating block. (' + t('\\frac{22}{7}=3.\\overline{142857}') + ' repeats, but it’s only an approximation of ' + t('\\pi') + '.)' },
            t(v[0] + '=' + cut(v[1], 6) + '\\ldots') + ': the digits of ' + t('\\pi') + ' never stop and never repeat, and doubling, halving or negating can’t change that. <b>Non-repeating, non-terminating.</b>', 'pattern of ' + v[0]);
        } }] },
      { num: '2', stem: 'Classify the statement as <b>true</b> or <b>false</b>.', parts: [
        { id: '2a', level: 'LIM', make: function (r) {
          var d = r.pick(['0.375', '0.48', '2.125', '0.06', '1.75']), fr = norm(Math.round(Number(d) * 1000), 1000);
          return P.tf(r, r.pick(['Every terminating decimal can be expressed as a fraction.', 'Any decimal that stops, such as ' + t(d) + ', can be written as a fraction.']), true,
            'Try it: ' + t(d + '=' + rTex(fr)) + '. A terminating decimal is a whole number of tenths, hundredths, thousandths, …',
            '<b>True.</b> A terminating decimal is a whole number of tenths, hundredths, thousandths, …, so it is a fraction: e.g. ' + t(d + '=' + rTex(fr)) + '.', [], 'T/F terminating → fraction');
        } },
        { id: '2b', level: 'BEG', make: function (r) {
          var bl = randBlock(r, 2, ''), fr = norm(Number(bl), 99);
          return P.tf(r, r.pick(['A decimal that repeats forever can never be written as a fraction.', 'A repeating decimal such as ' + t('0.\\overline{' + bl + '}') + ' cannot be written as a fraction.']), false,
            'Check on your calculator: ' + t('0.\\overline{' + bl + '}=' + rTex(fr)) + '. Every repeating decimal can be turned into a fraction.',
            '<b>False.</b> Every repeating decimal converts to a fraction, e.g. ' + t('0.\\overline{' + bl + '}=\\frac{' + Number(bl) + '}{99}' + (fr[1] !== 99 ? '=' + rTex(fr) : '')) + '.', [], 'T/F repeating → not fraction');
        } },
        { id: '2c', level: 'BEG', make: function (r) {
          var ex1 = r.pick([[1, 3], [2, 3], [1, 6], [5, 11], [4, 9]]);
          return P.tf(r, r.pick(['The only decimals that can be written as fractions are ones that terminate.', 'If a decimal can be written as a fraction, then it must terminate.']), false,
            'Think of ' + t(rTex(ex1) + '=' + K.decTex(ex1)) + ': it’s a fraction, but its decimal doesn’t terminate.',
            '<b>False.</b> Repeating decimals are fractions too: ' + t(rTex(ex1) + '=' + K.decTex(ex1)) + '.', [], 'T/F only terminating are fractions');
        } },
        { id: '2d', level: 'BEG', make: function (r) {
          return P.tf(r, r.pick(['Every rational number is either a terminating decimal or a repeating decimal.', 'When a fraction is written as a decimal, the decimal either terminates or repeats.']), true,
            'Divide any fraction, e.g. ' + t('\\frac{3}{8}=0.375') + ' or ' + t('\\frac{5}{6}=0.8\\overline{3}') + '. In long division the remainders either reach 0 (it stops) or come back (it repeats).',
            '<b>True.</b> When you divide, the remainder either becomes ' + t('0') + ' (the decimal terminates) or a remainder comes back (the decimal repeats). Rational numbers are exactly the decimals that terminate or repeat.', [], 'T/F rational = terminating or repeating');
        } },
        { id: '2e', level: 'LIM', make: function (r) {
          return P.tf(r, r.pick(['A single decimal number can be both repeating and non-repeating at the same time.', 'Some decimals are both repeating and non-repeating.']), false,
            '“Non-repeating” means “not repeating”. A decimal either has a block that repeats forever or it doesn’t — it can’t be both.',
            '<b>False.</b> A decimal is one or the other: either a block repeats forever or it doesn’t.', [], 'T/F both repeating and non-repeating');
        } },
        { id: '2f', level: 'LIM', make: function (r) {
          return P.tf(r, r.pick(['The number ' + t('\\pi') + ' is irrational.', 'The number ' + t('\\pi') + ' is irrational, even though ' + t('\\frac{22}{7}') + ' and ' + t('3.14') + ' are close to it.']), true,
            t('\\frac{22}{7}=3.\\overline{142857}') + ' and ' + t('3.14') + ' are only approximations. ' + t('\\pi=3.14159265\\ldots') + ' never stops and never repeats.',
            '<b>True.</b> ' + t('\\pi=3.14159265\\ldots') + ' never terminates and never repeats. ' + t('\\frac{22}{7}') + ' and ' + t('3.14') + ' are rational approximations, not ' + t('\\pi') + ' itself.', [], 'T/F pi irrational');
        } }] },
      { num: '3', stem: 'Is the number rational or irrational? Choose the answer with the correct reason.', parts: [
        { id: '3a', level: 'BEG', make: function (r) {
          var q = r.pick([4, 8, 5, 2, 20]), p = r.pick(coprimeTo(q, q + 1, 3 * q)), dec = K.decTex([-p, q]);
          return P.mc(r, t('-\\dfrac{' + p + '}{' + q + '}'), [
            { html: '<b>Rational</b> — it is a ratio of two integers (it equals the terminating decimal ' + t(dec) + ').', right: true },
            { html: '<b>Irrational</b> — a negative number can’t be rational.', why: 'Rational numbers can be negative: ' + t('-' + p + '\\div ' + q) + ' is still a ratio of integers.' },
            { html: '<b>Irrational</b> — it isn’t a whole number.', why: 'Rational doesn’t mean whole: any ratio of two integers is rational.' },
            { html: '<b>Rational</b> — because it is negative.', why: 'Right classification, wrong reason: being negative has nothing to do with it. What makes it rational?' }],
            t('-\\frac{' + p + '}{' + q + '}') + ' is already a ratio of integers, and ' + t(q + '=' + texFacs(q)) + ', so it is also the terminating decimal ' + t(dec) + '. <b>Rational.</b>', ['Rational means it can be written as a ratio of two integers.'], 'rational? -' + p + '/' + q);
        } },
        { id: '3b', level: 'BEG', make: function (r) {
          var bl = randBlock(r, 3, ''), fr = norm(Number(bl), 999), nd = bl.split('').filter(function (c, j, a) { return a.indexOf(c) === j; }).length;
          return P.mc(r, t('0.\\overline{' + bl + '}'), [
            { html: '<b>Rational</b> — the block ' + t(bl) + ' repeats forever, and every repeating decimal can be written as a fraction.', right: true },
            { html: '<b>Irrational</b> — the decimal never ends.', why: 'Never ending isn’t enough. Irrational decimals never end <b>and never repeat</b>. This one repeats.' },
            { html: '<b>Irrational</b> — it can’t be shown exactly on a calculator.', why: 'Lots of fractions, like ' + t('\\frac{1}{3}') + ', don’t fit on a calculator screen. What matters is whether a block repeats.' },
            { html: '<b>Rational</b> — it uses only ' + ['', 'one digit', 'two different digits', 'three different digits'][nd] + '.', why: 'Right classification, wrong reason: the number of different digits doesn’t matter. What matters is that the block repeats.' }],
            'The block ' + t(bl) + ' repeats forever, and every repeating decimal is a fraction: ' + t('0.\\overline{' + bl + '}=\\frac{' + Number(bl) + '}{999}' + (fr[1] !== 999 ? '=' + rTex(fr) : '')) + '. <b>Rational.</b>', ['Does a fixed block of digits repeat? Repeating decimals can always be written as fractions.'], 'rational? 0.(' + bl + ')');
        } },
        { id: '3c', level: 'EMG', make: function (r) {
          var k = r.int(11, 20), n = k * k;
          return P.mc(r, t('\\sqrt{' + n + '}'), [
            { html: '<b>Rational</b> — ' + t(n + '=' + k + '^{2}') + ', so ' + t('\\sqrt{' + n + '}=' + k) + ', an integer.', right: true },
            { html: '<b>Irrational</b> — square roots are always irrational.', why: 'Only square roots of numbers that aren’t perfect squares are irrational. Try ' + t(k + '\\times ' + k) + '.' },
            { html: '<b>Irrational</b> — ' + t(n) + ' is not a perfect square.', why: 'Check on your calculator: ' + t('\\sqrt{' + n + '}') + ' comes out exactly. What is ' + t(k + '^{2}') + '?' },
            { html: '<b>Rational</b> — because ' + t(n) + ' is ' + (n % 2 ? 'odd' : 'even') + '.', why: 'Right classification, wrong reason: odd or even doesn’t matter (' + t('\\sqrt{' + (n % 2 ? 3 : 2) + '}') + ' is irrational). Is ' + t(n) + ' a perfect square?' }],
            t(n + '=' + k + '^{2}') + ', so ' + t('\\sqrt{' + n + '}=' + k) + ', a whole number. <b>Rational.</b>', ['Is ' + t(n) + ' a perfect square?'], 'rational? sqrt' + n);
        } },
        { id: '3d', level: 'PRG', make: function (r) {
          var g = randGrow(r), tex = growTex(0, g.stem, g.c, g.k0 + 1, true, g.stem.charAt(0));
          return P.mc(r, t(tex), [
            { html: '<b>Irrational</b> — the run of ' + t(g.c) + '’s keeps growing, so no fixed block ever repeats, and the decimal never ends.', right: true },
            { html: '<b>Rational</b> — the digits follow a pattern.', why: 'A pattern isn’t the same as a repeating block. Is there one fixed block that copies itself forever?' },
            { html: '<b>Rational</b> — the digits ' + t(g.stem.split('').join(',\\ ') + ',\\ ' + g.c) + ' keep repeating.', why: 'Look at the groups: each one has one more ' + t(g.c) + ' than the last, so they are never the same block twice.' },
            { html: '<b>Irrational</b> — it has too many digits to write as a fraction.', why: 'Right classification, wrong reason: ' + t('0.\\overline{3}') + ' has infinitely many digits and is ' + t('\\frac{1}{3}') + '. The reason is that no block repeats.' }],
            'Each group has one more ' + t(g.c) + ' than the one before, so no fixed block repeats, and the digits never stop. <b>Irrational.</b>', ['Compare the groups of digits. Are they the same block every time?'], 'rational? growing pattern');
        } }] },
      { num: '4', section: 'Part B — Ordering and calculator conversions', stem: 'Place the irrational numbers in order on a number line, from least to greatest. (' + t('3\\sqrt{8}') + ' means ' + t('3\\times\\sqrt{8}') + '.)', parts: [
        { id: '4', level: 'PRG', make: function (r) {
          var it, vals;
          for (var g = 0; g < 500; g++) {
            var a = r.int(1, 9), b = r.pick(nonSquares(3, 12)), c = r.pick(nonSquares(13, 35)), d = r.pick(nonSquares(40, 99));
            var ks = r.sample([2, 3, 4], 2), e = [ks[0], 0], f = [ks[1], 0];
            [e, f].forEach(function (km) { var opts = nonSquares(5, 60).filter(function (m) { var v = km[0] * Math.sqrt(m); return v > 9.5 && v < 15 && !isSq(m); }); km[1] = r.pick(opts); });
            it = [{ id: 'a', tex: '\\sqrt{0.' + a + '}', v: Math.sqrt(a / 10), mis: Math.sqrt(a / 10), plain: '√0.' + a },
              { id: 'b', tex: '\\sqrt{' + b + '}', v: Math.sqrt(b), mis: Math.sqrt(b), plain: '√' + b },
              { id: 'c', tex: '\\sqrt{' + c + '}', v: Math.sqrt(c), mis: Math.sqrt(c), plain: '√' + c },
              { id: 'd', tex: '\\sqrt{' + d + '}', v: Math.sqrt(d), mis: Math.sqrt(d), plain: '√' + d },
              { id: 'e', tex: e[0] + '\\sqrt{' + e[1] + '}', v: e[0] * Math.sqrt(e[1]), mis: Math.sqrt(e[0] * e[1]), plain: e[0] + '√' + e[1], km: e },
              { id: 'f', tex: f[0] + '\\sqrt{' + f[1] + '}', v: f[0] * Math.sqrt(f[1]), mis: Math.sqrt(f[0] * f[1]), plain: f[0] + '√' + f[1], km: f }];
            vals = it.map(function (x) { return x.v; }).sort(function (x, y) { return x - y; });
            var okGap = true; for (var j = 1; j < vals.length; j++) if (vals[j] - vals[j - 1] < 0.4) okGap = false;
            if (okGap) break;
          }
          var sorted = it.slice().sort(function (x, y) { return x.v - y.v; }), byId = {}; it.forEach(function (x) { byId[x.id] = x; });
          var mis = it.slice().sort(function (x, y) { return x.mis - y.mis; }).map(function (x) { return x.id; }), ids = sorted.map(function (x) { return x.id; });
          var p = P.order(r, 'Order: ' + it.map(function (x) { return t(x.tex); }).join(', &nbsp;'), sorted.map(function (x) { return { id: x.id, tex: x.tex }; }), {
            why: function (x, y) {
              var A = byId[x], B = byId[y], km = A.km || B.km;
              if (km) return t(A.tex) + ' and ' + t(B.tex) + ' are in the wrong order. Remember ' + t(km[0] + '\\sqrt{' + km[1] + '}') + ' means ' + t(km[0] + '\\times\\sqrt{' + km[1] + '}') + ': find ' + t('\\sqrt{' + km[1] + '}') + ' first, then multiply by ' + t(km[0]) + '.';
              return t(A.tex) + ' and ' + t(B.tex) + ' are in the wrong order. Find a decimal for each on your calculator and compare.';
            } },
            'Approximate each value: ' + sorted.map(function (x) { return t(x.tex + (x.km ? '=' + x.km[0] + '(' + cut(Math.sqrt(x.km[1]), 3) + '\\ldots)' : '') + '\\approx ' + x.v.toFixed(3)); }).join(', ') + '.<br>' +
            numberLine(sorted.map(function (x) { return { v: x.v, label: x.plain }; }), 15) + '<br>' + t(sorted.map(function (x) { return x.tex; }).join('<')),
            ['Use your calculator to find a decimal for each number, then sort the decimals.', 'For ' + t('k\\sqrt{m}') + ', find ' + t('\\sqrt{m}') + ' and multiply by ' + t('k') + '.'], 'order ' + it.map(function (x) { return x.plain; }).join(', '));
          var base = p.check;
          if (mis.join() !== ids.join()) {
            p.check = function (resp) {
              if (resp && resp.length === ids.length && resp.join() === mis.join()) return wrong('coef-inside', 'It looks like you treated ' + t(byId.e.tex) + ' as ' + t('\\sqrt{' + byId.e.km[0] * byId.e.km[1] + '}') + '. ' + t(byId.e.tex) + ' means ' + t(byId.e.km[0] + '\\times\\sqrt{' + byId.e.km[1] + '}') + ' — find the root first, then multiply.');
              return base(resp);
            };
            p.bad = [mis];
          }
          return p;
        } }] },
      { num: '5', stem: 'Identify each number as rational or irrational. Use a calculator to convert the rational numbers to fractions in simplest form.',
        shared: function (r) { return q5Items(r); },
        parts: [
          { id: '5', sub: 'a–i', level: 'EMG', make: function (r, sh) {
            var keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], want = {};
            keys.forEach(function (k) { want[k] = sh[k].val ? 'Q' : 'I'; });
            var rows = r.shuffle(keys).map(function (k) { return { id: k, html: t(sh[k].tex), label: '(' + k + ')' }; });
            return P.grid('Identify each number as <b>rational</b> or <b>irrational</b>.', rows, [{ id: 'Q', html: 'Rational', label: 'Rational' }, { id: 'I', html: 'Irrational', label: 'Irrational' }], want,
              { why: function (k) { return { code: sh[k].val ? 'said-irrational' : 'said-rational', hint: 'Look again at ' + t(sh[k].tex) + '. ' + sh[k].why }; } },
              keys.map(function (k) { return t(sh[k].tex) + ': <b>' + (sh[k].val ? 'rational' : 'irrational') + '</b>.'; }).join('<br>'),
              ['Simplify each number first (take the roots). A number that stops or repeats, or is a ratio of integers, is rational.'], 'Q5 rational/irrational grid');
          } },
          { id: '5a', sub: 'a', level: 'BEG', make: function (r, sh) { return q5FracPart(sh, 'a', 'BEG'); } },
          { id: '5b', sub: 'b', level: 'EMG', make: function (r, sh) { return q5FracPart(sh, 'b', 'EMG'); } },
          { id: '5c', sub: 'c', level: 'EMG', make: function (r, sh) { return q5FracPart(sh, 'c', 'EMG'); } },
          { id: '5e', sub: 'e', level: 'EMG', make: function (r, sh) { return q5FracPart(sh, 'e', 'EMG', ['Type the repeating decimal into your calculator with many repeats, then convert it to a fraction.']); } },
          { id: '5f', sub: 'f', level: 'PRG', make: function (r, sh) { return q5FracPart(sh, 'f', 'PRG', ['Change the mixed number to an improper fraction first, then take the square root of the top and the bottom.']); } },
          { id: '5g', sub: 'g', level: 'PRG', make: function (r, sh) { return q5FracPart(sh, 'g', 'PRG', ['Type the decimal with the block repeated several times (e.g. ' + t(calcString(sh.g.R)) + ') and convert it to a fraction.']); } },
          { id: '5i', sub: 'i', level: 'ADV', make: function (r, sh) { return q5FracPart(sh, 'i', 'ADV', ['Work from the inside out: take the inner square root first.']); } }] },
      { num: '6', stem: 'Use a calculator to convert the repeating decimal to an improper fraction in simplest form.', parts: [
        { id: '6a', level: 'BEG', make: function (r) { return calcPart(repInfo(0, '', String(r.int(1, 8)))); } },
        { id: '6b', level: 'EMG', make: function (r) { return calcPart(repInfo(0, '', randBlock(r, 2, '', true))); } },
        { id: '6c', level: 'EMG', make: function (r) { var l = String(r.int(1, 8)); return calcPart(repInfo(r.int(1, 5), l, randBlock(r, 1, l))); } },
        { id: '6d', level: 'PRG', make: function (r) { return calcPart(repInfo(0, '', randBlock(r, 3, '', true))); } },
        { id: '6e', level: 'ADV', make: function (r) { var l = String(r.int(0, 9)) + String(r.int(1, 9)); return calcPart(repInfo(r.int(1, 9), l, randBlock(r, 2, l), true)); } }] },
      { num: '7', stem: '<i>(Extension)</i> Use the algebraic procedure to convert the repeating decimal to a fraction in simplest form. Fill in the equation you get after subtracting, then the answer.', parts: [
        { id: '7a', level: 'EMG', make: function (r) { return algebraPart(repInfo(0, '', String(r.int(1, 8)))); } },
        { id: '7b', level: 'EMG', make: function (r) { return algebraPart(repInfo(0, '', randBlock(r, 2, '', true))); } },
        { id: '7c', level: 'PRG', make: function (r) { var l = String(r.int(1, 9)); return algebraPart(repInfo(0, l, randBlock(r, 1, l))); } }] },
      { num: '8', stem: '<i>(Extension)</i> Use the algebraic procedure to convert the repeating decimal to an improper fraction in simplest form. Fill in the equation you get after subtracting, then the answer.', parts: [
        { id: '8a', level: 'ADV', make: function (r) { var b = r.chance(0.5) ? '0' + r.int(1, 8) : randBlock(r, 2, '0', true); return algebraPart(repInfo(r.int(1, 9), '0', b)); } },
        { id: '8b', level: 'ADV', make: function (r) { return algebraPart(repInfo(r.int(1, 9), '', randBlock(r, 3, '', true), true)); } },
        { id: '8c', level: 'ADV', make: function (r) { var l = String(r.int(1, 9)) + String(r.int(1, 9)); return algebraPart(repInfo(r.int(1, 9), l, randBlock(r, 1, l))); } }] },
      { num: '9', section: 'Part C — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var q = r.pick([12, 6, 15, 18, 22, 24, 30, 36, 44, 45, 60]), p = r.pick(coprimeTo(q, 1, q - 1)), dec = K.decTex([p, q]), m = split25(q).m;
          return P.mc(r, 'The decimal number representing ' + t('\\dfrac{' + p + '}{' + q + '}') + ' is', [
            { html: 'terminating and repeating', why: 'That combination can’t happen: a decimal that stops can’t also repeat forever.' },
            { html: 'terminating and non-repeating', why: 'Divide ' + t(p + '\\div ' + q) + ' — does it stop? ' + t(q + '=' + texFacs(q)) + ' has the prime ' + t(nt0(m)) + ', which isn’t 2 or 5.' },
            { html: 'non-terminating and repeating', right: true },
            { html: 'non-terminating and non-repeating', why: t('\\frac{' + p + '}{' + q + '}') + ' is a fraction, so it is rational — its decimal must repeat. Look at the digits: ' + t(digitsOf(p, q, 8) + '\\ldots') + '.' }],
            t(q + '=' + texFacs(q)) + '. The prime ' + t(nt0(m)) + ' is not 2 or 5, so the decimal never ends — but ' + t('\\frac{' + p + '}{' + q + '}') + ' is rational, so it repeats: ' + t('\\frac{' + p + '}{' + q + '}=' + dec) + '.', ['Factor the denominator. Then remember: every fraction is rational, so its decimal terminates or repeats.'], 'MC pattern of ' + p + '/' + q, true);
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var decs = ['0.045', '0.4', '0.9', '0.016', '1.6', '0.08', '0.5', '2.5', '0.009', '0.12', '0.18'];
          var ir = r.pick(decs), right = r.chance(0.8) ? { html: t('\\sqrt{' + ir + '}'), right: true } : { html: t(growTex(0, '1', '0', 1, false, '1')), right: true };
          var k = r.int(11, 19), sqd = r.pick([[0.49, 0.7], [1.44, 1.2], [0.0036, 0.06], [0.81, 0.9], [2.25, 1.5]]), p9 = r.pick([[7, 9], [5, 9], [4, 11], [3, 7], [5, 7]]), td = r.pick(['2.71', '3.14', '1.41', '1.73']), bl = randBlock(r, 2, '');
          var pool = [
            { html: t('\\sqrt{' + k * k + '}'), why: t(k * k + '=' + k + '^{2}') + ', so ' + t('\\sqrt{' + k * k + '}=' + k) + ' — rational.' },
            { html: t('\\dfrac{' + p9[0] + '}{' + p9[1] + '}'), why: 'It’s already a ratio of integers (its decimal ' + t(K.decTex(p9)) + ' repeats) — rational.' },
            { html: t(td), why: t(td) + ' terminates, so it is ' + t('\\frac{' + Math.round(Number(td) * 100) + '}{100}') + ' — rational. (It may be close to an irrational number, but it isn’t one.)' },
            { html: t('\\sqrt{' + sqd[0] + '}'), why: t(sqd[1] + '^{2}=' + sqd[0]) + ', so ' + t('\\sqrt{' + sqd[0] + '}=' + sqd[1]) + ' — rational.' },
            { html: t('\\dfrac{22}{7}'), why: t('\\frac{22}{7}') + ' is a ratio of integers — rational. It is only an approximation of ' + t('\\pi') + '.' },
            { html: t('0.\\overline{' + bl + '}'), why: 'It repeats, so it is the fraction ' + t(rTex(norm(Number(bl), 99))) + ' — rational.' }];
          var opts = r.sample(pool, 3).concat([right]);
          return P.mc(r, 'Which of the following is an irrational number?', opts,
            (right.html.indexOf('sqrt') >= 0 ? t(ir + '=' + rTex(norm(Math.round(Number(ir) * 1000), 1000))) + ', which is not a ratio of two perfect squares, so ' + t('\\sqrt{' + ir + '}=' + cut(Math.sqrt(Number(ir)), 6) + '\\ldots') + ' never stops or repeats: <b>irrational</b>.' : 'The runs of zeros keep growing, so no block repeats: <b>irrational</b>.') + ' The others are all rational: each one terminates, repeats, or simplifies to a ratio of integers.',
            ['Simplify each option. Which one can’t be written as a ratio of integers?'], 'MC which is irrational');
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'ADV', make: function (r) {
          var I = r.int(1, 9);
          return P.mc(r, t(I + '.\\overline{9}') + ' is equal to', [
            { html: t('\\dfrac{' + (10 * I + 9) + '}{10}'), why: t('\\frac{' + (10 * I + 9) + '}{10}=' + I + '.9') + ' stops after one 9. The bar means the 9s go on forever.' },
            { html: t('\\dfrac{' + (100 * I + 99) + '}{100}'), why: t('\\frac{' + (100 * I + 99) + '}{100}=' + I + '.99') + ' stops after two 9s. Try the algebraic method: ' + t('10x-x') + '.' },
            { html: t(I + '.9'), why: t(I + '.9') + ' is a terminating decimal. The bar means the 9s never stop.' },
            { html: t(I + 1), right: true }],
            'Let ' + t('x=' + I + '.999\\ldots') + '. Then ' + t('10x=' + (10 * I + 9) + '.999\\ldots') + '. Subtract: ' + t('9x=' + (9 * I + 9)) + ', so ' + t('x=' + (I + 1)) + ' exactly. The other options all stop after a few 9s.', ['Use the algebraic method: ' + t('x=' + I + '.\\overline{9}') + ', ' + t('10x=?') + ', subtract.'], 'MC ' + I + '.(9)', true);
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'ADV', make: function (r) { return nrRepPart(r); } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — The denominator test', stem: 'A fraction <b>in lowest terms</b> terminates exactly when its denominator is built from 2s and 5s alone. <b>Reduce first</b>, factor the new denominator, then predict. Don’t divide yet.', parts: [
        { id: 'e1', level: 'PRG', make: function (r) {
          var specs = [
            { p: r.pick([7, 3, 9, 11]), q: r.pick([40, 16, 25]) },
            (function () { var b = r.pick([[5, 8], [3, 8], [7, 20], [1, 4]]), k = r.pick([3, 7, 9]); return { p: b[0] * k, q: b[1] * k }; })(),
            { p: r.pick([13, 7, 11, 17]), q: r.pick([60, 12, 30]) },
            (function () { var b = r.pick([[3, 5], [2, 5], [1, 2], [3, 4]]), k = r.pick([14, 7, 21, 6]); return { p: b[0] * k, q: b[1] * k }; })(),
            { p: r.pick([9, 5, 3, 11]), q: r.pick([56, 28, 14]) },
            (function () { var b = r.pick([[2, 15], [1, 6], [5, 12], [4, 15]]), k = r.pick([11, 7, 13]); return { p: b[0] * k, q: b[1] * k }; })()];
          var rows = [], want = {}, sols = [];
          specs.forEach(function (s, i) {
            var rd = norm(s.p, s.q), term = split25(rd[1]).m === 1, id = 'r' + i;
            rows.push({ id: id, html: t('\\dfrac{' + s.p + '}{' + s.q + '}'), label: s.p + '/' + s.q, s: s, rd: rd, term: term });
            want[id] = term ? 'T' : 'R';
          });
          var byId = {}; rows.forEach(function (x) { byId[x.id] = x; });
          var shown = r.shuffle(rows);
          return P.grid('Predict whether each fraction terminates or repeats.', shown.map(function (x) { return { id: x.id, html: x.html, label: x.label }; }), [{ id: 'T', html: 'Terminates', label: 'Terminates' }, { id: 'R', html: 'Repeats', label: 'Repeats' }], want,
            { why: function (id) { var x = byId[id], red = x.rd[1] !== x.s.q; return { code: red ? 'not-reduced' : 'den-test', hint: red ? 'Reduce ' + t('\\frac{' + x.s.p + '}{' + x.s.q + '}') + ' first — the test is about the <b>reduced</b> denominator.' : 'Factor the denominator of ' + t('\\frac{' + x.s.p + '}{' + x.s.q + '}') + ': is it only 2s and 5s?' }; } },
            rows.map(function (x) { return t('\\frac{' + x.s.p + '}{' + x.s.q + '}' + (x.rd[1] !== x.s.q ? '=' + rTex(x.rd) : '')) + ': ' + t(x.rd[1] + '=' + texFacs(x.rd[1])) + ' → <b>' + (x.term ? 'terminates' : 'repeats') + '</b>'; }).join('<br>'),
            ['Reduce each fraction, then factor the new denominator. Only 2s and 5s → terminates.'], 'denominator test');
        } }] },
      { num: '2', stem: 'Confirm by dividing. Write the decimal exactly, with the bar over the repeating block <b>only</b>.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { var b = r.pick([[5, 8], [3, 8], [7, 16], [9, 20], [3, 40]]), k = r.pick([3, 7, 9]); return decPart(b[0] * k, b[1] * k); } },
        { id: 'e2b', level: 'PRG', make: function (r) { var q = r.pick([60, 12, 30, 15]); return decPart(r.pick(coprimeTo(q, 1, q - 1)), q); } },
        { id: 'e2c', level: 'ADV', make: function (r) { var q = r.pick([56, 28, 14, 35]); return decPart(r.pick(coprimeTo(q, 1, q - 1)), q); } },
        { id: 'e2d', level: 'PRG', make: function (r) { var b = r.pick([[2, 15], [1, 6], [5, 12], [4, 15], [1, 12]]), k = r.pick([11, 7, 13]); return decPart(b[0] * k, b[1] * k); } }] },
      { num: '3', stem: 'This denominator contains a prime other than 2 or 5, so <i>most</i> numerators give a repeating decimal. Find a whole-number numerator ' + t('k') + ' (between ' + t('0') + ' and the denominator) that makes the fraction <b>terminate</b>.', parts: [
        { id: 'e3a', level: 'PRG', make: function (r) { return kPart(r.pick([90, 18, 36, 180])); } },
        { id: 'e3b', level: 'PRG', make: function (r) { return kPart(r.pick([70, 14, 28, 35, 140])); } },
        { id: 'e3c', level: 'PRG', make: function (r) { return kPart(r.pick([24, 12, 48, 15, 30])); } },
        { id: 'e3d', level: 'PRG', make: function (r) { return kPart(r.pick([45, 72, 225])); } }] },
      { num: '4', stem: 'In Question 3 the numerator always had to be a multiple of something.', parts: [
        { id: 'e4', level: 'ADV', make: function (r) {
          var d = r.pick([60, 140, 90, 120, 66, 84]), s = split25(d), m = s.m, tw = d / m;
          return P.mc(r, 'For the denominator ' + t(d + '=' + texFacs(d)) + ', which numerators ' + t('k') + ' make ' + t('\\dfrac{k}{' + d + '}') + ' terminate?', [
            { html: 'Multiples of ' + t(m) + ' — the part of ' + t(d) + ' left after removing every 2 and 5 — because then all of ' + t(m) + ' cancels when you reduce.', right: true },
            { html: 'Multiples of ' + t(tw) + ', so the 2s and 5s cancel.', why: 'The 2s and 5s were never the problem. Try ' + t('k=' + tw) + ': ' + t('\\frac{' + tw + '}{' + d + '}=' + rTex([tw, d])) + ' — does that terminate?' },
            { html: 'Any factor of ' + t(d) + '.', why: 'Try ' + t('k=2') + ': ' + t('\\frac{2}{' + d + '}=' + rTex([2, d])) + '. The reduced denominator still has a prime other than 2 or 5.' },
            { html: 'Only multiples of 10.', why: 'Try ' + t('k=10') + ': ' + t('\\frac{10}{' + d + '}=' + rTex([10, d])) + '. Which primes are left in the denominator?' }],
            'Write ' + t(d + '=' + tw + '\\times ' + m) + ', where ' + t(m) + ' has no 2s or 5s. Reducing ' + t('\\frac{k}{' + d + '}') + ' only cancels factors that ' + t('k') + ' shares with ' + t(d) + '. If ' + t('k') + ' is a multiple of ' + t(m) + ', all of ' + t(m) + ' cancels and only 2s and 5s are left, so it terminates. Otherwise some prime of ' + t(m) + ' survives and it repeats.',
            ['Which primes in the denominator cause a repeating decimal? What must happen to them?'], 'rule for terminating k/' + d);
        } }] },
      { num: '5', section: 'Extra practice B — How long is the repeating block?', stem: 'When you long-divide by ' + t('n') + ', the only possible remainders are ' + t('1, 2, \\ldots, n-1') + '. As soon as a remainder repeats, the digits repeat — so the block is <b>at most</b> ' + t('n-1') + ' digits long. State the maximum, then divide and record the actual length of the block.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) { return blockLenPart(r.pick([[1, 9], [2, 9], [4, 9], [1, 3], [2, 3]])); } },
        { id: 'e5b', level: 'EMG', make: function (r) { return blockLenPart(r.pick([[1, 11], [3, 11], [5, 11], [1, 33]])); } },
        { id: 'e5c', level: 'PRG', make: function (r) { return blockLenPart(r.pick([[1, 7], [2, 7], [3, 7], [5, 7]])); } },
        { id: 'e5d', level: 'PRG', make: function (r) { return blockLenPart(r.pick([[1, 13], [2, 13], [5, 13], [1, 27], [1, 37], [1, 41]])); } }] },
      { num: '6', stem: 'Write the fraction as a repeating decimal, using ' + t('\\dfrac{1}{7}=0.\\overline{142857}') + ' as a starting point.',
        shared: function (r) { var ks = r.shuffle([2, 3, 4, 5, 6]), abc = ks.slice(0, 3).sort(); return abc.concat([ks[3]]); },
        parts: [
        { id: 'e6a', level: 'EMG', make: function (r, sh) { return sevenPart(sh[0]); } },
        { id: 'e6b', level: 'EMG', make: function (r, sh) { return sevenPart(sh[1]); } },
        { id: 'e6c', level: 'EMG', make: function (r, sh) { return sevenPart(sh[2]); } },
        { id: 'e6d', level: 'ADV', make: function (r, sh) {
          var k = sh[3], p = sevenPart(k);
          p.prompt = 'Every block for sevenths uses the same six digits ' + t('1,4,2,8,5,7') + ' in the same cyclic order — only the starting digit moves. Use the pattern to write ' + t('\\dfrac{' + k + '}{7}') + ' without dividing.';
          p.solution = t('\\frac{' + k + '}{7}') + ' is a little more than ' + t(Math.floor(k / 7 * 10) / 10) + ', so start the cycle ' + t('142857') + ' at the ' + t(String(Math.floor(k / 7 * 10))) + ': ' + t('\\frac{' + k + '}{7}=' + K.decTex([k, 7])) + '.';
          p.hints = ['Estimate first: ' + t('\\frac{' + k + '}{7}\\approx ' + (k / 7).toFixed(1)) + '. Which digit of ' + t('142857') + ' should the cycle start at?'];
          return p;
        } }] },
      { num: '7', stem: function (sh) { return 'When the reduced denominator has <b>both</b> kinds of prime factor, the decimal has a non-repeating lead followed by a repeating block. Split the denominator as ' + t('d=(2^{a}5^{b})\\times m') + '. The lead is the <b>larger</b> of ' + t('a') + ' and ' + t('b') + ', and the block comes from ' + t('m') + '. The fractions: ' + sh.map(function (f) { return t('\\dfrac{' + f[0] + '}{' + f[1] + '}'); }).join(', ') + '.'; },
        shared: function (r) {
          var qs = [r.pick([12, 75]), r.pick([30, 6, 15]), r.pick([22, 55]), r.pick([56, 28, 35])];
          return qs.map(function (q) { return [r.pick(coprimeTo(q, 1, q - 1)), q]; });
        },
        parts: [
          { id: 'e7a', level: 'PRG', make: function (r, sh) { return leadPart(sh[0]); } },
          { id: 'e7b', level: 'PRG', make: function (r, sh) { return leadPart(sh[1]); } },
          { id: 'e7c', level: 'PRG', make: function (r, sh) { return leadPart(sh[2]); } },
          { id: 'e7d', level: 'ADV', make: function (r, sh) { return leadPart(sh[3]); } },
          { id: 'e7e', level: 'ADV', make: function (r, sh) { var p = decPart(sh[3][0], sh[3][1]); p.prompt = 'Now divide and write ' + t('\\dfrac{' + sh[3][0] + '}{' + sh[3][1] + '}') + ' as a decimal with the bar in the right place.'; return p; } }] },
      { num: '8', section: 'Extra practice C — Turning a repeating decimal back into a fraction', stem: 'Use the algebraic method: let ' + t('x') + ' be the decimal, multiply by the power of 10 that shifts the block left of the point, subtract, and solve. Give the answer in lowest terms.', parts: [
        { id: 'e8a', level: 'EMG', make: function (r) { return algebraPart(repInfo(0, '', String(r.int(1, 8)))); } },
        { id: 'e8b', level: 'PRG', make: function (r) { var b; do { b = randBlock(r, 2, '', true); } while (gcd(Number(b), 99) === 1); return algebraPart(repInfo(0, '', b)); } },
        { id: 'e8c', level: 'PRG', make: function (r) { var b; do { b = randBlock(r, 3, '', true); } while (gcd(Number(b), 999) < 9); return algebraPart(repInfo(0, '', b)); } }] },
      { num: '9', stem: 'These have a <b>non-repeating lead</b> after the decimal point, so you need two multiples of ' + t('x') + ': one with the block left of the point and one with the block just right of it. Subtract those two.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) { var l = String(r.int(1, 9)) + String(r.int(1, 9)); return algebraPart(repInfo(0, l, randBlock(r, 1, l))); } },
        { id: 'e9b', level: 'ADV', make: function (r) { var l = String(r.int(1, 9)); return algebraPart(repInfo(0, l, randBlock(r, 2, l, true))); } },
        { id: 'e9c', level: 'ADV', make: function (r) { var l = String(r.int(1, 9)); return algebraPart(repInfo(r.int(1, 5), l, randBlock(r, 2, l, true))); } }] },
      { num: '10', stem: 'Same method, watching the sign and the whole-number part. Give the answer as an improper fraction in lowest terms.', parts: [
        { id: 'e10a', level: 'ADV', make: function (r) { var l = String(r.int(1, 9)); return algebraPart(repInfo(r.int(1, 9), l, randBlock(r, 1, l), true)); } },
        { id: 'e10b', level: 'ADV', make: function (r) { return algebraPart(repInfo(r.int(1, 9), '', randBlock(r, 3, '', true))); } }] },
      { num: '11', stem: 'In Question 9 every subtraction left ' + t('990x') + ' or ' + t('900x') + ' on the left side.', parts: [
        { id: 'e11a', level: 'ADV', make: function (r) {
          return P.mc(r, 'A decimal has ' + t('p') + ' non-repeating digits after the point, then a repeating block of ' + t('q') + ' digits. What is the number in front of ' + t('x') + ' after subtracting?', [
            { html: t('10^{p+q}-10^{p}') + ': ' + t('q') + ' nines followed by ' + t('p') + ' zeros', right: true },
            { html: t('p') + ' nines followed by ' + t('q') + ' zeros', why: 'Test it on ' + t('0.16\\overline{3}') + ' (' + t('p=2') + ', ' + t('q=1') + '): the subtraction gave ' + t('900x') + '. How many nines and zeros is that?' },
            { html: t('10^{p+q}-1') + ': ' + t('p+q') + ' nines', why: 'That works only when there is no lead (' + t('p=0') + '). For ' + t('0.4\\overline{27}') + ' you got ' + t('990x') + ', not ' + t('999x') + '.' },
            { html: t('10^{q}-10^{p}'), why: 'Test it on ' + t('0.4\\overline{27}') + ' (' + t('p=1') + ', ' + t('q=2') + '): ' + t('10^{2}-10^{1}=90') + ', but the subtraction gave ' + t('990x') + '.' }],
            t('10^{p+q}x') + ' moves the block left of the point and ' + t('10^{p}x') + ' puts it just right of the point, so their tails cancel. ' + t('10^{p+q}-10^{p}=10^{p}(10^{q}-1)') + ': ' + t('10^{q}-1') + ' is ' + t('q') + ' nines (one per block digit) and ' + t('10^{p}') + ' adds ' + t('p') + ' zeros (one per lead digit). Check: ' + t('p=1,\\ q=2') + ' gives ' + t('990') + '; ' + t('p=2,\\ q=1') + ' gives ' + t('900') + '.',
            ['Test each rule on ' + t('0.4\\overline{27}') + ' (which gave ' + t('990x') + ') and ' + t('0.16\\overline{3}') + ' (which gave ' + t('900x') + ').'], 'multiplier rule');
        } },
        { id: 'e11b', level: 'ADV', make: function (r) {
          var L = r.int(1, 3), B = r.int(1, 3), lead = digitsStr(r, L), R = repInfo(0, lead, randBlock(r, B, lead, true));
          return P.number('Without doing the subtraction: for ' + t('x=' + R.tex) + ', what number is in front of ' + t('x') + ' after subtracting?', R.c, function (v) {
            var rev = Math.pow(10, L + B) - Math.pow(10, B); if (v === rev && rev !== R.c) return { code: 'swap', hint: 'Nines for the <b>repeating</b> digits (' + B + ') and zeros for the <b>non-repeating</b> digits (' + L + ').' };
            if (v === Math.pow(10, L + B) - 1) return { code: 'no-zeros', hint: 'There are non-repeating digits before the block, so the answer ends in zeros — one per lead digit.' };
            return null;
          }, 'The lead has ' + L + ' digit' + (L > 1 ? 's' : '') + ' and the block has ' + B + ', so the number is ' + B + ' nine' + (B > 1 ? 's' : '') + ' followed by ' + L + ' zero' + (L > 1 ? 's' : '') + ': ' + t(F(R.hi) + '-' + F(R.lo) + '=' + F(R.c)) + '.', ['One nine for each repeating digit, then one zero for each non-repeating digit.'], 'multiplier for ' + R.tex);
        } }] },
      { num: '12', section: 'Extra practice D — Rational or irrational?', stem: 'Several of these are traps — <b>simplify first</b>, then decide.', parts: [
        { id: 'e12a', level: 'PRG', make: function (r) { return ratGrid(r, e12Rows(r, ['sq', 'nsq', 'pipi', 'prod', 'sqfr']), 'traps grid 1'); } },
        { id: 'e12b', level: 'PRG', make: function (r) { return ratGrid(r, e12Rows(r, ['negdec', 'rep', 'pihalf', 'grow', 'sum']), 'traps grid 2'); } }] },
      { num: '13', stem: 'Decide whether the statement is <i>always</i>, <i>sometimes</i> or <i>never</i> true.', parts: [
        { id: 'e13a', level: 'ADV', make: function (r) {
          var n = r.pick([2, 3, 5, 7]);
          return P.mc(r, 'The <b>sum</b> of two irrational numbers is irrational.', [
            { html: 'Always', why: 'Try ' + t('\\sqrt{' + n + '}+(-\\sqrt{' + n + '})') + '.' }, { html: 'Sometimes', right: true }, { html: 'Never', why: 'Try ' + t('\\sqrt{' + n + '}+\\sqrt{' + n + '}') + '.' }],
            '<b>Sometimes.</b> Holds: ' + t('\\sqrt{' + n + '}+\\sqrt{' + n + '}=2\\sqrt{' + n + '}') + ' (irrational). Fails: ' + t('\\sqrt{' + n + '}+(-\\sqrt{' + n + '})=0') + ' (rational).', ['Look for one example where it works and one where it doesn’t.'], 'sum of irrationals', true);
        } },
        { id: 'e13b', level: 'ADV', make: function (r) {
          var n = r.pick([2, 3, 5, 7]), m = r.pick([2, 3, 5, 6, 7].filter(function (x) { return x !== n; })), s = r.pick([[2, 7], [3, 6], [5, 11], [2, 14], [3, 13]]);
          return P.mc(r, 'Which pair of irrational numbers has a <b>rational</b> sum?', [
            { html: t('\\sqrt{' + n + '}') + ' and ' + t('-\\sqrt{' + n + '}'), right: true },
            { html: t('\\sqrt{' + n + '}') + ' and ' + t('\\sqrt{' + n + '}'), why: t('\\sqrt{' + n + '}+\\sqrt{' + n + '}=2\\sqrt{' + n + '}') + ', which is irrational.' },
            { html: t('\\sqrt{' + s[0] + '}') + ' and ' + t('\\sqrt{' + s[1] + '}'), why: 'Careful: ' + t('\\sqrt{' + s[0] + '}+\\sqrt{' + s[1] + '}\\neq\\sqrt{' + (s[0] + s[1]) + '}') + '. Check on your calculator: ' + t('\\sqrt{' + s[0] + '}+\\sqrt{' + s[1] + '}\\approx ' + (Math.sqrt(s[0]) + Math.sqrt(s[1])).toFixed(4)) + '.' },
            { html: t('\\pi') + ' and ' + t('\\sqrt{' + m + '}'), why: t('\\pi+\\sqrt{' + m + '}=' + cut(Math.PI + Math.sqrt(m), 4) + '\\ldots') + ' — nothing cancels.' }],
            t('\\sqrt{' + n + '}+(-\\sqrt{' + n + '})=0') + ', which is rational. (Roots don’t add like that: ' + t('\\sqrt{a}+\\sqrt{b}\\neq\\sqrt{a+b}') + '.)', ['Look for a pair where the irrational parts cancel.'], 'example rational sum');
        } },
        { id: 'e13c', level: 'ADV', make: function (r) {
          var n = r.pick([2, 3, 5]);
          return P.mc(r, 'The <b>product</b> of two irrational numbers is irrational.', [
            { html: 'Always', why: 'Try ' + t('\\sqrt{' + n + '}\\times\\sqrt{' + n + '}') + '.' }, { html: 'Sometimes', right: true }, { html: 'Never', why: 'Try ' + t('\\sqrt{2}\\times\\sqrt{3}') + '.' }],
            '<b>Sometimes.</b> Holds: ' + t('\\sqrt{2}\\times\\sqrt{3}=\\sqrt{6}') + ' (irrational). Fails: ' + t('\\sqrt{' + n + '}\\times\\sqrt{' + n + '}=' + n) + ' (rational).', ['Look for one example where it works and one where it doesn’t.'], 'product of irrationals', true);
        } },
        { id: 'e13d', level: 'ADV', make: function (r) {
          var pr = r.pick([[2, 8], [3, 12], [2, 18], [5, 20], [3, 27]]), q = r.pick([[2, 3], [2, 5], [3, 5], [3, 7]]), s = r.pick([[2, 7], [3, 6], [5, 11]]);
          return P.mc(r, 'Which pair of irrational numbers has a <b>rational</b> product?', [
            { html: t('\\sqrt{' + pr[0] + '}') + ' and ' + t('\\sqrt{' + pr[1] + '}'), right: true },
            { html: t('\\sqrt{' + q[0] + '}') + ' and ' + t('\\sqrt{' + q[1] + '}'), why: t('\\sqrt{' + q[0] + '}\\times\\sqrt{' + q[1] + '}=\\sqrt{' + q[0] * q[1] + '}') + ', and ' + t(q[0] * q[1]) + ' is not a perfect square.' },
            { html: t('\\sqrt{' + s[0] + '}') + ' and ' + t('\\sqrt{' + s[1] + '}'), why: t('\\sqrt{' + s[0] + '}\\times\\sqrt{' + s[1] + '}=\\sqrt{' + s[0] * s[1] + '}') + '. (Their <i>sum</i> under one root would be ' + t(s[0] + s[1]) + ', but that’s not how products work.)' },
            { html: t('\\pi') + ' and ' + t('\\sqrt{' + pr[0] + '}'), why: 'Nothing cancels the ' + t('\\pi') + '.' }],
            t('\\sqrt{' + pr[0] + '}\\times\\sqrt{' + pr[1] + '}=\\sqrt{' + pr[0] * pr[1] + '}=' + Math.sqrt(pr[0] * pr[1])) + ', which is rational.', ['Multiply under one root: ' + t('\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}') + '. When is that a whole number?'], 'example rational product');
        } }] },
      { num: '14', stem: 'The sum of a rational number and an irrational number is <i>always</i> irrational.', parts: [
        { id: 'e14', level: 'MAS', make: function (r) {
          return P.mc(r, 'Suppose ' + t('r') + ' is rational, ' + t('s') + ' is irrational, and ' + t('r+s') + ' came out rational. Which argument shows this can’t happen?', [
            { html: 'Then ' + t('s=(r+s)-r') + ' would be a difference of two rational numbers, which is rational — but ' + t('s') + ' is irrational. Contradiction.', right: true },
            { html: 'Try an example: ' + t('1+\\sqrt{2}=2.414\\ldots') + ' is irrational, so it can never happen.', why: 'One example can’t show something is <b>always</b> true. You need an argument that works for every ' + t('r') + ' and ' + t('s') + '.' },
            { html: 'Adding a rational number can’t change the decimal digits of ' + t('s') + '.', why: 'Adding does change digits (' + t('\\sqrt{2}+0.3') + '). The proof uses ' + t('s=(r+s)-r') + '.' },
            { html: 'Irrational numbers are bigger than rational numbers, so the sum stays irrational.', why: 'Size has nothing to do with it: ' + t('\\sqrt{2}<5') + '.' }],
            'If ' + t('r+s=t') + ' were rational, then ' + t('s=t-r') + '. A difference of rationals is rational: ' + t('\\frac{a}{b}-\\frac{c}{d}=\\frac{ad-bc}{bd}') + '. So ' + t('s') + ' would be rational — but it isn’t. So ' + t('r+s') + ' must be irrational.', ['Use the hint ' + t('s=(r+s)-r') + '. What kind of number is a difference of two rationals?'], 'proof rational + irrational');
        } }] },
      { num: '15', stem: 'Between any two different numbers there is always a rational number.', parts: [
        { id: 'e15a', level: 'PRG', make: function (r) { var n = r.pick(nonSquares(5, 30).filter(function (x) { return !isSq(x + 1); })); return betweenPart('\\sqrt{' + n + '}', Math.sqrt(n), '\\sqrt{' + (n + 1) + '}', Math.sqrt(n + 1), 'rational between √' + n + ' and √' + (n + 1)); } },
        { id: 'e15b', level: 'ADV', make: function (r) { var v = r.pick([['\\pi', Math.PI, '\\sqrt{10}', Math.sqrt(10)], ['2\\pi', 2 * Math.PI, '\\sqrt{40}', Math.sqrt(40)], ['\\sqrt{2.4}', Math.sqrt(2.4), '\\dfrac{\\pi}{2}', Math.PI / 2]]); return betweenPart(v[0], v[1], v[2], v[3], 'rational between ' + v[0] + ' and ' + v[2]); } }] },
      { num: '16', section: 'Extra practice E — Error analysis and challenge', stem: function (sh) { return 'Amira divides ' + t(sh[0] + '\\div ' + sh[1]) + ' on her calculator and the display reads ' + t((sh[0] / sh[1]).toFixed(10)) + '. She writes: “The digits never repeat on the screen, so ' + t('\\frac{' + sh[0] + '}{' + sh[1] + '}') + ' is irrational.”'; },
        shared: function (r) { var n = r.pick([17, 19, 23]); return [r.pick(coprimeTo(n, 2, n - 1)), n]; },
        parts: [
          { id: 'e16a', level: 'PRG', make: function (r, sh) {
            return P.mc(r, 'What is wrong with her reasoning?', [
              { html: t('\\frac{' + sh[0] + '}{' + sh[1] + '}') + ' is a ratio of two integers, so it is rational whatever the screen shows — the repeating block is just longer than the display.', right: true },
              { html: 'Nothing: if no repeat shows in ten digits, the number is irrational.', why: 'A calculator shows only about ten digits. A fraction’s block can be longer than that.' },
              { html: 'She should round to ' + t((sh[0] / sh[1]).toFixed(2)) + ', which terminates, so it’s rational.', why: 'Rounding gives a different number. The reason it’s rational is that it is a fraction.' },
              { html: 'Her calculator is broken: every fraction repeats within ten digits.', why: 'Blocks can be long: ' + t('\\frac{1}{' + sh[1] + '}') + '’s block is ' + period(sh[1]) + ' digits.' }],
              t('\\frac{' + sh[0] + '}{' + sh[1] + '}') + ' is a ratio of two integers with a non-zero denominator — that is the definition of rational. The screen shows only the first ten decimal places; its block is ' + t(period(sh[1])) + ' digits long, so the repeat never appears on screen: ' + t('\\frac{' + sh[0] + '}{' + sh[1] + '}=' + K.decTex(sh)) + '.', ['What is the definition of a rational number? Is ' + t('\\frac{' + sh[0] + '}{' + sh[1] + '}') + ' one?'], 'Amira error');
          } },
          { id: 'e16b', level: 'ADV', make: function (r, sh) {
            var n = sh[1];
            return P.number('When you divide by ' + t(n) + ', how many different non-zero remainders are possible? (That is the longest the repeating block can be.)', n - 1, function (v) {
              if (v === n) return { code: 'n-not-n-1', hint: 'The remainder is always less than ' + t(n) + ', and it is never ' + t('0') + ' here (' + t(n) + ' has no factor 2 or 5). So the possible remainders are ' + t('1') + ' to ' + t(n - 1) + '.' };
              if (v === 10) return { code: 'screen', hint: 'That’s the screen size, not a property of the fraction. Think about the possible remainders.' };
              return null;
            }, 'The remainders can only be ' + t('1, 2, \\ldots, ' + (n - 1)) + ' (never ' + t('0') + ', because ' + t(n) + ' has no factor 2 or 5). So within ' + t(n - 1) + ' steps a remainder must come back, and the digits repeat from there. For ' + t('\\frac{' + sh[0] + '}{' + n + '}') + ' the block really is ' + t(period(n)) + ' digits — too long for a ten-digit screen.', ['A remainder is always smaller than the number you divide by.'], 'max block for /' + n);
          } }] },
      { num: '17', stem: function (sh) { var pr = decParts(sh[0], sh[1]); return 'Devon divides and gets ' + t('\\frac{' + sh[0] + '}{' + sh[1] + '}=' + digitsOf(sh[0], sh[1], pr.lead.length + 3) + '\\ldots') + ', then writes the answer as ' + t('0.\\overline{' + pr.lead + pr.block + '}') + '.'; },
        shared: function (r) { return r.pick([[7, 12], [5, 12], [1, 6], [5, 6], [11, 30], [7, 15], [13, 15], [1, 12], [11, 12]]); },
        parts: [
          { id: 'e17a', level: 'PRG', make: function (r, sh) {
            var pr = decParts(sh[0], sh[1]), devon = pr.lead + pr.block, s = ''; while (s.length < 8) s += devon; s = '0.' + s.slice(0, 8);
            var real = digitsOf(sh[0], sh[1], 8);
            return { prompt: 'Write the first eight decimal places of the number Devon’s notation ' + t('0.\\overline{' + devon + '}') + ' actually means.', input: { type: 'number' }, key: s, answer: t(s), text: 'Devon notation ' + devon,
              check: K.number(Number(s), function (v) { if (Math.abs(v - Number(real)) < 1e-9) return { code: 'real-value', hint: 'That’s ' + t('\\frac{' + sh[0] + '}{' + sh[1] + '}') + ' itself. Devon’s bar is over ' + t(devon) + ', so the <b>whole</b> block ' + t(devon) + ' repeats.' }; return null; }),
              solution: 'The bar says the whole block ' + t(devon) + ' repeats: ' + t('0.\\overline{' + devon + '}=' + s + '\\ldots') + ' — a different number from ' + t('\\frac{' + sh[0] + '}{' + sh[1] + '}=' + real + '\\ldots') + '.', hints: ['Write the block ' + t(devon) + ' again and again after the decimal point.'], bad: [real] };
          } },
          { id: 'e17b', level: 'PRG', make: function (r, sh) {
            var p = decPart(sh[0], sh[1]); p.prompt = 'Write ' + t('\\dfrac{' + sh[0] + '}{' + sh[1] + '}') + ' with the bar in the correct place.';
            p.solution += ' Rule: the bar goes over the repeating block only — the digits before it appear once and never return.';
            return p;
          } }] },
      { num: '18', stem: 'Show that ' + t('0.\\overline{9}=1') + ' exactly — not just “very close to 1”.', parts: [
        { id: 'e18a', level: 'ADV', make: function (r) {
          var v = r.pick([['0', ''], ['0', ''], ['1', ''], ['2', ''], ['0', '4'], ['0', '2']]), R = repInfo(Number(v[0]), v[1], '9'), val = R.ax[0] / R.ax[1];
          return P.number('Run the algebraic method on ' + t('x=' + R.tex) + '. What exact value of ' + t('x') + ' do you get?', val, function (w) {
            if (w < val && w > val - 0.2) return { code: 'close', hint: 'Follow the algebra exactly: ' + t(F(R.hi) + 'x-' + (R.lo > 1 ? R.lo : '') + 'x') + ' — the 9s cancel completely. What is ' + t('x') + '?' };
            return null;
          }, algebraSol(R) + ' So ' + t(R.tex + '=' + val) + ' exactly.', ['Let ' + t('x=' + R.tex) + ', multiply by ' + t(R.hi) + ', subtract and solve.'], 'algebra on ' + R.tex);
        } },
        { id: 'e18b', level: 'ADV', make: function (r) {
          var f = r.pick([[3, '3'], [9, '1']]);
          return P.mc(r, 'Start with ' + t('\\frac{1}{' + f[0] + '}=0.\\overline{' + f[1] + '}') + ' and multiply both sides by ' + t(f[0]) + '. What does that show?', [
            { html: t('1=0.\\overline{9}') + ', exactly.', right: true },
            { html: t('1\\approx 0.\\overline{9}') + ', but they are not exactly equal.', why: t('\\frac{1}{' + f[0] + '}=0.\\overline{' + f[1] + '}') + ' is exact, so multiplying both sides by ' + t(f[0]) + ' gives an exact equation.' },
            { html: t('0.\\overline{9}=0.9') + '.', why: t(f[0] + '\\times 0.' + f[1] + f[1] + f[1] + '\\ldots=0.999\\ldots') + ': every digit becomes a 9, forever.' },
            { html: 'Nothing — you can’t multiply a repeating decimal.', why: 'Multiply digit by digit: ' + t(f[0] + '\\times 0.' + f[1] + f[1] + f[1] + '\\ldots=0.999\\ldots') + '.' }],
            t(f[0] + '\\times\\frac{1}{' + f[0] + '}=1') + ' and ' + t(f[0] + '\\times 0.' + f[1] + f[1] + f[1] + '\\ldots=0.999\\ldots') + ', so ' + t('1=0.\\overline{9}') + '.', ['What is ' + t(f[0] + '\\times\\frac{1}{' + f[0] + '}') + '? What is ' + t(f[0] + '\\times 0.' + f[1] + f[1] + f[1] + '\\ldots') + '?'], '1/3 argument');
        } },
        { id: 'e18c', level: 'MAS', make: function (r) {
          return P.mc(r, 'If ' + t('0.\\overline{9}') + ' were <b>less</b> than ' + t('1') + ', some number would fit strictly between them. Why can’t any number fit?', [
            { html: 'The gap ' + t('1-0.\\overline{9}') + ' is smaller than ' + t('0.1') + ', ' + t('0.01') + ', ' + t('0.001') + ', … — smaller than every positive number — so the gap is ' + t('0') + '.', right: true },
            { html: 'Because ' + t('0.\\overline{9}') + ' rounds to ' + t('1') + '.', why: 'Rounding changes a number. The claim is that they are <i>exactly</i> equal.' },
            { html: 'Because the gap is ' + t('0.\\overline{0}1') + ', which is too small to matter.', why: t('0.\\overline{0}1') + ' isn’t a number: the 0s go on forever, so the 1 never arrives.' },
            { html: 'Because there are no numbers between any two decimals.', why: 'Between ' + t('0.9') + ' and ' + t('1') + ' there is ' + t('0.95') + '. Why doesn’t that happen here?' }],
            'For every decimal place, ' + t('0.\\overline{9}') + ' is within ' + t('0.1') + ', ' + t('0.01') + ', ' + t('0.001') + ', … of ' + t('1') + '. A positive gap would have to be smaller than all of these, which is impossible, so the gap is ' + t('0') + ': ' + t('0.\\overline{9}') + ' and ' + t('1') + ' are two names for the same number.', ['How far is ' + t('0.9999') + ' from ' + t('1') + '? ' + t('0.999999') + '?'], 'nothing between 0.(9) and 1');
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'ADV', make: function (r) {
          var pool = [3, 6, 9, 11, 22, 33, 27, 37, 7, 13, 14, 21, 12, 15], pick, lens;
          for (var i = 0; i < 300; i++) { pick = r.sample(pool, 4); lens = pick.map(function (q) { return decParts(1, q).block.length; }); var mx = Math.max.apply(null, lens); if (lens.filter(function (x) { return x === mx; }).length === 1 && Math.max.apply(null, pick) !== pick[lens.indexOf(mx)]) break; pick = null; }
          if (!pick) { pick = [6, 11, 13, 22]; lens = pick.map(function (q) { return decParts(1, q).block.length; }); }
          var max = Math.max.apply(null, lens);
          var opts = pick.map(function (q, j) { return { html: t('\\dfrac{1}{' + q + '}'), right: lens[j] === max, why: lens[j] === max ? null : t('\\frac{1}{' + q + '}=' + K.decTex([1, q])) + ': a ' + lens[j] + '-digit block.' + (q > pick[lens.indexOf(max)] ? ' A bigger denominator doesn’t always mean a longer block.' : ' Is that the longest? Check the others.') }; });
          return P.mc(r, 'Which fraction has the <b>longest</b> repeating block?', opts,
            pick.map(function (q, j) { return t('\\frac{1}{' + q + '}=' + K.decTex([1, q])) + ': ' + lens[j] + '-digit block'; }).join('<br>'), ['Divide each one and count the digits under the bar.'], 'longest block');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'ADV', make: function (r) { return nrRepPart(r); } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  function nt0(m) { return HW.nt.distinctPrimes(m).join(', '); }
  function decPart(p, q) {
    var rd = norm(p, q), red = rd[1] !== q, s = split25(rd[1]);
    var p0 = P.repeating(t('\\dfrac{' + p + '}{' + q + '}'), rd, {},
      (red ? t('\\frac{' + p + '}{' + q + '}=' + rTex(rd)) + '. ' : '') + t(rd[0] + '\\div ' + rd[1] + '=' + (s.m === 1 ? K.decTex(rd) : digitsOf(rd[0], rd[1], Math.min(12, (decParts(rd[0], rd[1]).lead.length + decParts(rd[0], rd[1]).block.length) * 2 + 1)) + '\\ldots')) + (s.m === 1 ? ' — the remainder reaches 0, so it stops.' : ' — the block ' + t(decParts(rd[0], rd[1]).block) + ' repeats.') + ' So ' + t('\\frac{' + p + '}{' + q + '}=' + K.decTex(rd)) + '.',
      ['Reduce first, then divide (long division or calculator).', 'Put the bar over the repeating block only — the digits before it are written once.'], 'decimal of ' + p + '/' + q);
    if (s.m !== 1) { var pr = decParts(rd[0], rd[1]); p0.bad = ['0.' + pr.lead + pr.block, '0.\\overline{' + pr.lead + pr.block + '}']; if (!pr.lead) p0.bad = ['0.' + pr.block]; }
    return p0;
  }
  function kPart(d) {
    var s = split25(d), m = s.m;
    return { prompt: t('\\dfrac{k}{' + d + '}'), input: { type: 'number', before: t('k=') }, key: String(m), answer: 'any multiple of ' + t(m) + ' less than ' + t(d) + ', e.g. ' + t('k=' + m), text: 'terminating k/' + d,
      check: function (resp) {
        var pn = HW.parse.number(resp);
        if (!pn.ok) return form(pn.code === 'empty' ? 'empty' : 'notnumber', 'Enter one whole number for ' + t('k') + '.');
        var k = pn.value;
        if (k % 1 || k <= 0 || k >= d) return form('range', t('k') + ' must be a whole number between ' + t('0') + ' and ' + t(d) + '.');
        var rd = norm(k, d);
        if (split25(rd[1]).m === 1) return ok();
        return wrong('not-multiple', t('\\frac{' + k + '}{' + d + '}=' + rTex(rd)) + ', and ' + t(rd[1] + '=' + texFacs(rd[1])) + ' still has a prime other than 2 or 5. Which factor of ' + t(d) + ' has to cancel?');
      },
      solution: t(d + '=' + texFacs(d)) + '. The part with no 2s or 5s is ' + t(m) + ', so ' + t('k') + ' must be a multiple of ' + t(m) + ' to cancel it. For example ' + t('\\frac{' + m + '}{' + d + '}=' + rTex([m, d]) + '=' + K.decTex([m, d])) + ' ✓ (any multiple of ' + t(m) + ' works).',
      hints: ['Factor ' + t(d) + '. Which prime factor makes the decimal repeat? Choose ' + t('k') + ' so that it cancels.'], good: [String(2 * m < d ? 2 * m : m)], bad: ['1', String(d / m), String(m === 3 ? 1 : 3)] };
  }
  function blockLenPart(f) {
    var n = f[1], len = decParts(f[0], n).block.length;
    var max = { name: 'Maximum', label: 'Maximum:', after: 'digits' }, act = { name: 'Actual', label: 'Actual block:', after: 'digits' };
    var cm = K.number(n - 1, function (v) { if (v === n) return { code: 'n-not-n-1', hint: 'The remainders can only be ' + t('1') + ' to ' + t(n - 1) + ' — there are ' + t(n - 1) + ' of them.' }; return null; });
    var ca = K.number(len, function (v) { if (v === n - 1 && len !== n - 1) return { code: 'max-block', hint: 'That’s the maximum. Now divide and count the digits that actually repeat.' }; return null; });
    return P.fields(t('\\dfrac{' + f[0] + '}{' + n + '}'), [max, act], [cm, ca], [String(n - 1), String(len)], 'Maximum ' + t(n - 1) + ', actual ' + t(len) + ' (' + t('\\frac{' + f[0] + '}{' + n + '}=' + K.decTex(f)) + ')',
      'Maximum: ' + t(n + '-1=' + (n - 1)) + '. Dividing: ' + t('\\frac{' + f[0] + '}{' + n + '}=' + K.decTex(f)) + ', so the block is ' + t(len) + ' digit' + (len > 1 ? 's' : '') + ' long' + (len === n - 1 ? ' — it reaches the maximum.' : '.'),
      ['The maximum is one less than the denominator.', 'Divide on your calculator and count the digits in the block that repeats.'], 'block length ' + f[0] + '/' + n);
  }
  function sevenPart(k) {
    var p = P.repeating(t('\\dfrac{' + k + '}{7}'), [k, 7], {}, t('\\frac{' + k + '}{7}=' + k + '\\times 0.142857\\,142857\\ldots=' + digitsOf(k, 7, 12) + '\\ldots') + ', so ' + t('\\frac{' + k + '}{7}=' + K.decTex([k, 7])) + '.',
      ['Multiply ' + t('0.142857\\,142857\\ldots') + ' by ' + t(k) + ', or divide ' + t(k + '\\div 7') + '.', 'The block has six digits; put the bar over all six.'], k + '/7 from 1/7');
    p.bad = ['0.' + decParts(k, 7).block, '0.\\overline{' + String(142857 * k).slice(0, 6) + '}'];
    if (p.bad[1] === '0.\\overline{' + decParts(k, 7).block + '}') p.bad.pop();
    return p;
  }
  function leadPart(f) {
    var rd = norm(f[0], f[1]), s = split25(rd[1]), lead = Math.max(s.a, s.b), blk = period(s.m);
    var cl = K.number(lead, function (v) { if (v === s.a + s.b && s.a && s.b && v !== lead) return { code: 'sum-lead', hint: 'The lead is the <b>larger</b> of ' + t('a') + ' and ' + t('b') + ', not their sum.' }; return null; });
    var cb = K.number(blk, function (v) { if (v === s.m - 1 && blk !== s.m - 1) return { code: 'max-block', hint: 'That’s the most it could be. The block of ' + t('\\frac{1}{' + s.m + '}') + ' is shorter — divide and count.' }; return null; });
    return P.fields(t('\\dfrac{' + f[0] + '}{' + f[1] + '}'), [{ name: 'Lead', label: 'Lead:', after: 'digits' }, { name: 'Block', label: 'Block:', after: 'digits' }], [cl, cb], [String(lead), String(blk)],
      'lead ' + t(lead) + ', block ' + t(blk) + ' (' + t('\\frac{' + f[0] + '}{' + f[1] + '}=' + K.decTex(rd)) + ')',
      t(rd[1] + '=' + texFacs(rd[1])) + ': ' + t('a=' + s.a + ',\\ b=' + s.b + ',\\ m=' + s.m) + '. Lead ' + t('=\\max(a,b)=' + lead) + '; ' + t('\\frac{1}{' + s.m + '}=' + K.decTex([1, s.m])) + ' gives a ' + blk + '-digit block. Check: ' + t('\\frac{' + f[0] + '}{' + f[1] + '}=' + K.decTex(rd)) + '.',
      ['Factor the denominator into ' + t('2^{a}5^{b}\\times m') + '.', 'The lead is the larger of ' + t('a') + ' and ' + t('b') + '; the block has the same length as the block of ' + t('\\frac{1}{m}') + '.'], 'lead/block of ' + f[0] + '/' + f[1]);
  }
})(window);
