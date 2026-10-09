/* Math 10C · Unit 1 · Lesson 4 — Classifying the Real Number System (AN2)
 * Assignment questions 1–21 (u1_L04.tex, Parts A–E) and the Lesson 4 Extra Practice (u1_EP04.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are
 * among the possible values) and changes the numbers or the wording. Levels: LIM BEG EMG PRG ADV MAS.
 * Set names follow the booklet: N, W, I, Q, \overline{Q}, R (plain capitals, no blackboard bold). */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'q-and-qbar': 'Checked both Q and Q̄', 'irr-as-rat': 'Called an irrational number rational', 'rat-as-irr': 'Called a rational number irrational',
    'missing-r': 'Left out R', 'missed-qbar': 'Left out Q̄', 'zero-natural': 'Put 0 in N', 'neg-whole': 'Put a negative number in W or N',
    'not-integer': 'Put a non-integer in I, W or N', 'missed-q': 'Forgot that integers are rational', nest: 'Missed a set the number is nested in',
    'not-innermost': 'Chose an outer region, not the innermost', 'not-real': 'Not a real number', variable: 'Used a letter', 'dots-exact': 'Used … instead of an exact number',
    'not-in-set': 'Number not in the required set', 'in-excluded-set': 'Number is in the excluded set', range: 'Number outside the given range',
    'estimate-off': 'Estimate not close enough', 'estimate-far': 'Estimate far off', 'sqrt-halved': 'Halved instead of taking the root', 'square-not-cube': 'Square root instead of cube root',
    'nested-one-root': 'Took only one of the two roots', 'rounded-early': 'Rounded too early', 'sum-own': 'Didn’t add own estimates', 'right-side': 'Right side wrong', 'took-root-not': 'Didn’t take the root',
    'sig-digits': 'More than one significant digit', 'place-value': 'Right digit, wrong place value', chop: 'Chopped instead of rounding', 'between-pair': 'Not two consecutive whole numbers',
    'between-wrong': 'Wrong pair of whole numbers', 'abs-negative': 'Gave a negative absolute value', 'abs-inside': 'Didn’t work inside the bars first', 'abs-each': 'Treated |a|−|b| as |a−b|',
    'abs-outer': 'Forgot the outer bars', 'abs-minus-out': 'Dropped the minus sign outside the bars', 'abs-cube': 'Didn’t take the cube root', 'abs-added': 'Added instead of subtracting',
    'mc-said-always': 'Said “always”', 'mc-said-sometimes': 'Said “sometimes”', 'mc-said-never': 'Said “never”',
    'as-irrational': 'Counted the irrational ones instead', 'cube-in': 'Put the coefficient inside the root', 'flip-99': 'Used 100 instead of 99 for the repeating block'
  });

  /* ---------- the number sets ---------- */
  var SETS = ['N', 'W', 'I', 'Q', 'Qb', 'R'];
  var SYM = { N: 'N', W: 'W', I: 'I', Q: 'Q', Qb: '\\overline{Q}', R: 'R' };
  var NAME = { N: 'natural numbers', W: 'whole numbers', I: 'integers', Q: 'rational numbers', Qb: 'irrational numbers', R: 'real numbers' };
  var NOUN = { N: 'natural number', W: 'whole number', I: 'integer', Q: 'rational number', Qb: 'irrational number', R: 'real number' };
  var ONE = { N: 'a natural number', W: 'a whole number', I: 'an integer', Q: 'a rational number', Qb: 'an irrational number', R: 'a real number' };
  var RANK = { N: 0, W: 1, I: 2, Q: 3, R: 5 };
  var SETS_OF = { nat: ['N', 'W', 'I', 'Q', 'R'], zero: ['W', 'I', 'Q', 'R'], negint: ['I', 'Q', 'R'], rat: ['Q', 'R'], irr: ['Qb', 'R'] };
  var SMALLEST = { nat: 'N', zero: 'W', negint: 'I', rat: 'Q', irr: 'Qb' };
  var COLS = SETS.map(function (x) { return { id: x, html: t(SYM[x]), label: NAME[x] }; });
  var COLS5 = COLS.filter(function (c) { return c.id !== 'R'; });
  function S(x) { return t(SYM[x]); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function sub(x, y) { if (x === y) return true; if (x === 'Qb') return y === 'R'; if (y === 'Qb') return false; return RANK[x] <= RANK[y]; }
  function bigToSmall(kind) { return ['R', 'Q', 'Qb', 'I', 'W', 'N'].filter(function (x) { return SETS_OF[kind].indexOf(x) >= 0; }); }
  function setsTex(arr) { return t(arr.map(function (x) { return SYM[x]; }).join(',\\ ')); }
  /* sample numbers used for examples and counterexamples */
  var CAND = [{ tex: '5', s: SETS_OF.nat }, { tex: '0', s: SETS_OF.zero }, { tex: '-3', s: SETS_OF.negint }, { tex: '\\frac{1}{2}', s: SETS_OF.rat }, { tex: '\\sqrt{2}', s: SETS_OF.irr }];
  function exIn(x, notY) { for (var i = 0; i < CAND.length; i++) { var c = CAND[i]; if (c.s.indexOf(x) >= 0 && (!notY || c.s.indexOf(notY) < 0)) return c.tex; } return null; }
  function exBoth(x, y) { for (var i = 0; i < CAND.length; i++) { var c = CAND[i]; if (c.s.indexOf(x) >= 0 && c.s.indexOf(y) >= 0) return c.tex; } return null; }
  function relation(x, y) { return sub(x, y) ? 'always' : exBoth(x, y) ? 'sometimes' : 'never'; }
  var PAIRS = []; SETS.forEach(function (x) { SETS.forEach(function (y) { if (x !== y) PAIRS.push([x, y]); }); });
  var TRUE_PAIRS = PAIRS.filter(function (p) { return sub(p[0], p[1]); });
  var REV_PAIRS = PAIRS.filter(function (p) { return sub(p[1], p[0]); });
  var DISJ_PAIRS = PAIRS.filter(function (p) { return relation(p[0], p[1]) === 'never'; });

  /* ---------- small helpers ---------- */
  function gen(r, make, okf, n) { var v; for (var i = 0; i < (n || 600); i++) { v = make(); if (okf(v)) return v; } return v; }
  function nonSq(n) { var q = Math.round(Math.sqrt(n)); return q * q !== n; }
  function nonCube(n) { var q = Math.round(Math.cbrt(n)); return q * q * q !== n; }
  function frac(v) { return v - Math.floor(v); }
  function fracOK(v, lo, hi) { var f = frac(v); return f < lo || f > hi; }
  function gcd(a, b) { return ex.gcd(a, b); }
  /* decimal string with thin spaces in groups of three, as in the booklet: 1.41421388 -> 1.414\,213\,88 */
  function fmtDec(s) {
    s = String(s); var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var parts = s.split('.'), ip = F(Number(parts[0])), dp = parts[1] || '';
    return (neg ? '-' : '') + ip + (parts.length > 1 ? '.' + dp.replace(/(\d{3})(?=\d)/g, '$1\\,') : '');
  }
  function d1(r, lo10, hi10) { var k = gen(r, function () { return r.int(lo10, hi10); }, function (k) { return k % 10 !== 0; }); return { v: k / 10, s: (k / 10).toFixed(1) }; }
  function nonRepDigits(r, n) {
    function periodic(d) { for (var p = 1; p <= Math.min(4, d.length - 3); p++) { var same = true; for (var i = p; i < d.length; i++) if (d[i] !== d[i - p]) { same = false; break; } if (same) return true; } return false; }
    return gen(r, function () { var d = ''; for (var i = 0; i < n; i++) d += r.int(0, 9); return d; }, function (d) { return !periodic(d) && d.charAt(n - 1) !== '0'; });
  }
  function blank() { return '<span style="display:inline-block;min-width:4.5em;border-bottom:1.5px solid currentColor">&nbsp;</span>'; }

  /* ---------- numbers to classify: { tex, kind, note, whyRat / whyIrr } ---------- */
  function item(tex, kind, note, extra) { var o = { tex: tex, kind: kind, note: note }; Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; }); return o; }
  function natInt(k) { return item(F(k), 'nat', t(F(k)) + ' is a counting number.'); }
  function sqrtPerfect(k) { return item('\\sqrt{' + k * k + '}', 'nat', t('\\sqrt{' + k * k + '}=' + k) + ', a counting number.', { whyRat: t('\\sqrt{' + k * k + '}=' + k) + ' because ' + t(k + '^{2}=' + k * k) + '. The square root of a perfect square is rational.' }); }
  function negInt(k) { return item('-' + k, 'negint', t('-' + k) + ' is a negative integer.'); }
  function negSqrt(k) { return item('-\\sqrt{' + k * k + '}', 'negint', t('-\\sqrt{' + k * k + '}=-' + k) + ', a negative integer.', { whyRat: t('-\\sqrt{' + k * k + '}=-' + k) + ': ' + t(k * k) + ' is a perfect square, so the root is rational.' }); }
  function cbrtNeg(k) { return item('\\sqrt[3]{-' + F(k * k * k) + '}', 'negint', t('\\sqrt[3]{-' + F(k * k * k) + '}=-' + k) + ' because ' + t('(-' + k + ')^{3}=-' + F(k * k * k)) + ' — a negative integer.', { whyRat: t('\\sqrt[3]{-' + F(k * k * k) + '}=-' + k) + ': ' + t(F(k * k * k)) + ' is a perfect cube, so the root is rational.' }); }
  function zeroItem(r, k) {
    var v = r.pick(['0', '0', '0', '\\frac{0}{' + k + '}', '\\sqrt{0}']);
    return item(v, 'zero', (v === '0' ? t('0') : t(v + '=0')) + ' is whole and an integer, but ' + S('N') + ' starts at ' + t('1') + '.', { whyRat: t(v === '0' ? '0=\\frac{0}{1}' : v + '=0') + ' is rational.' });
  }
  function fracItem(p, q, neg) {
    var tx = (neg ? '-' : '') + '\\frac{' + p + '}{' + q + '}', close = (p === 22 && q === 7) || (p === 355 && q === 113);
    return item(tx, 'rat', t(tx) + ' is a ratio of integers, but not an integer.', { neg: neg, whyRat: t(tx) + ' is a ratio of two integers, so it is rational by definition.' + (close ? ' (It is close to ' + t((neg ? '-' : '') + '\\pi') + ', but it is <b>not</b> equal to it.)' : '') });
  }
  function sqrtIrr(n) { return item('\\sqrt{' + n + '}', 'irr', t(n) + ' is not a perfect square, so ' + t('\\sqrt{' + n + '}') + ' never terminates or repeats.', { whyIrr: t(n) + ' is not a perfect square, so ' + t('\\sqrt{' + n + '}') + ' is irrational: its decimal never terminates and never repeats.' }); }
  function looksIrr(r) {
    var n = r.pick([2, 3, 5, 6, 7, 10, 11]), s = Math.sqrt(n).toFixed(6) + String(r.int(1, 9)) + String(r.int(1, 9)), tx = fmtDec(s);
    return item(tx, 'rat', 'The decimal ' + t(tx) + ' <b>stops</b>, so it is rational (it only looks like ' + t('\\sqrt{' + n + '}') + ').', { whyRat: 'Look closely: ' + t(tx) + ' <b>stops</b> after 8 decimal places. A terminating decimal is rational — it only looks like ' + t('\\sqrt{' + n + '}') + '.' });
  }
  function nonRepItem(r, neg) {
    var tx = (neg ? '-' : '') + fmtDec(r.int(1, 9) + '.' + nonRepDigits(r, 7)) + '\\ldots';
    return item(tx, 'irr', 'The “…” means ' + t(tx) + ' goes on forever with no repeating block.', { whyIrr: 'The “…” means the decimal never ends, and no block of digits repeats. Non-terminating <b>and</b> non-repeating means irrational.' });
  }
  function constItem(r, pool) {
    var c = r.pick(pool), NOTE = { e: 'e=2.718\\,281\\ldots', '\\pi': '\\pi=3.141\\,59\\ldots' }, base = /e/.test(c) && !/pi/.test(c) ? 'e' : '\\pi';
    return item(c, 'irr', t(NOTE[base]) + ' never terminates or repeats' + (c === base ? '.' : ', and neither does ' + t(c) + '.'), { whyIrr: t(NOTE[base]) + ' never terminates and never repeats, so it is irrational' + (c === base ? '.' : ' — and so is ' + t(c) + '.') });
  }
  function repItem(r) {
    var a = r.int(1, 9), b = r.int(0, 9), c = r.int(1, 9), d = (c + r.int(1, 8)) % 10, tx = a + '.' + b + '\\overline{' + c + d + '}';
    return item(tx, 'rat', 'The bar means the block ' + t(c + '' + d) + ' repeats forever, so ' + t(tx) + ' is rational.', { whyRat: 'The bar over ' + t(c + '' + d) + ' means that block repeats forever. A repeating decimal is rational — it can be written as a fraction.' });
  }
  function termItem(r) { var tx = r.int(2, 20) + '.' + r.int(1, 9); return item(tx, 'rat', t(tx) + ' terminates, so it is rational, but it isn’t an integer.', { whyRat: t(tx) + ' terminates, so it is rational: ' + t(tx + '=\\frac{' + tx.replace('.', '') + '}{10}') + '.' }); }
  function smallDec(r) { var tx = fmtDec('0.' + '0000'.slice(0, r.int(3, 4)) + r.int(1, 9)); return item(tx, 'rat', t(tx) + ' is tiny, but it terminates, so it is rational.', { whyRat: t(tx) + ' terminates, so it is rational (tiny, but a ratio of integers).' }); }
  function patternItem(r) {
    var a = r.int(1, 9), n = r.int(10, 60), tx = fmtDec(a + '.' + n + (n + 1) + (n + 2)) + '\\ldots';
    return item(tx, 'irr', t(tx) + ' follows a pattern (' + n + ', ' + (n + 1) + ', ' + (n + 2) + ', …) but no block repeats, so it is irrational.', { whyIrr: 'There is a pattern (' + n + ', ' + (n + 1) + ', ' + (n + 2) + ', …), but no block of digits <b>repeats</b> and it never ends. That makes it irrational.' });
  }
  function sqrtDecSq(r) {
    var k = gen(r, function () { return r.int(1, 19); }, function (k) { return k % 10 !== 0; }), sq = (k * k / 100).toFixed(2), rt = String(k / 10);
    return item('\\sqrt{' + sq + '}', 'rat', t('\\sqrt{' + sq + '}=' + rt) + ' because ' + t(rt + '^{2}=' + sq) + ' — a terminating decimal, not an integer.', { whyRat: t('\\sqrt{' + sq + '}=' + rt) + ' because ' + t(rt + '^{2}=' + sq) + '. That terminates, so it is rational.' });
  }

  /* hint for a wrong row in a "check every set" table */
  function memberWhy(it, got) {
    got = got || []; var has = function (x) { return got.indexOf(x) >= 0; }, want = SETS_OF[it.kind];
    if (has('Q') && has('Qb')) return { code: 'q-and-qbar', hint: t(it.tex) + ': a number can’t be in both ' + S('Q') + ' and ' + S('Qb') + ' — its decimal either terminates or repeats (rational), or it doesn’t (irrational).' };
    if (it.kind === 'irr' && (has('Q') || has('I') || has('W') || has('N'))) return { code: 'irr-as-rat', hint: it.whyIrr };
    if (it.kind !== 'irr' && has('Qb')) return { code: 'rat-as-irr', hint: it.whyRat || t(it.tex) + ' is rational.' };
    if (!has('R')) return { code: 'missing-r', hint: t(it.tex) + ': every number in this lesson is a real number, so ' + S('R') + ' always gets a check.' };
    if (it.kind === 'irr' && !has('Qb')) return { code: 'missed-qbar', hint: it.whyIrr + ' Which set holds the irrational numbers?' };
    if (it.kind === 'zero' && has('N')) return { code: 'zero-natural', hint: t(it.tex) + ': ' + S('N') + ' starts at ' + t('1') + ' — ' + t('0') + ' is whole, but not natural.' };
    if ((it.kind === 'negint' || it.neg) && (has('N') || has('W'))) return { code: 'neg-whole', hint: t(it.tex) + ' is negative. ' + S('W') + ' and ' + S('N') + ' contain no negative numbers.' };
    if (it.kind === 'rat' && (has('I') || has('W') || has('N'))) return { code: 'not-integer', hint: t(it.tex) + ' isn’t an integer (it falls between two integers), so it isn’t in ' + S('I') + ', ' + S('W') + ' or ' + S('N') + '.' };
    var miss = want.filter(function (x) { return !has(x); });
    if (miss.length && miss.indexOf('Q') >= 0) return { code: 'missed-q', hint: t(it.tex) + ': every integer is rational too (' + t('n=\\frac{n}{1}') + '), so ' + S('Q') + ' needs a check.' };
    if (miss.length) return { code: 'nest', hint: t(it.tex) + ': the sets are nested, so a number belongs to its smallest set <b>and every set around it</b>. Check them all.' };
    return null;
  }
  /* hint for a wrong row in an "innermost region" table */
  function regionWhy(it, g) {
    var w = SMALLEST[it.kind];
    if (g === 'Qb' && it.kind !== 'irr') return { code: 'rat-as-irr', hint: it.whyRat || t(it.tex) + ' is rational.' };
    if (g !== 'Qb' && it.kind === 'irr') return { code: 'irr-as-rat', hint: it.whyIrr };
    if (RANK[g] > RANK[w]) return { code: 'not-innermost', hint: t(it.tex) + ' does sit in ' + S(g) + ', but it also fits in a smaller region inside it. Choose the <b>innermost</b> region.' };
    if (g === 'N' && it.kind === 'zero') return { code: 'zero-natural', hint: t(it.tex) + ': ' + S('N') + ' starts at ' + t('1') + '.' };
    if ((g === 'N' || g === 'W') && it.kind === 'negint') return { code: 'neg-whole', hint: t(it.tex) + ' is negative, so it can’t be in ' + S('W') + ' or ' + S('N') + '.' };
    if (it.kind === 'rat') return { code: 'not-integer', hint: t(it.tex) + ' isn’t an integer, so it sits outside ' + S('I') + '.' };
    return null;
  }
  var MEMBER_HINTS = ['Simplify first. Is the number rational (it terminates or repeats) or irrational? Every number here is in ' + S('R') + '.', 'If it is rational: is it an integer? Is it ' + t('\\ge 0') + ' (then it is whole)? Is it ' + t('\\ge 1') + ' (then it is natural)?'];
  function memberSol(it) { return it.note + ' Sets (largest to smallest): ' + setsTex(bigToSmall(it.kind)) + '.'; }
  function memberPart(it, prompt) {
    var want = {}; want.x = SETS.filter(function (x) { return SETS_OF[it.kind].indexOf(x) >= 0; });
    return P.grid(prompt || 'Check every set that ' + t(it.tex) + ' belongs to.', [{ id: 'x', html: t(it.tex) }], COLS, want,
      { count: false, why: function (rid, got) { return memberWhy(it, got); } }, memberSol(it), MEMBER_HINTS, 'sets of ' + it.tex);
  }
  function memberTable(items, prompt, text) {
    var rows = [], want = {}, L = 'abcdefghijkl';
    items.forEach(function (it, i) { var id = L.charAt(i); rows.push({ id: id, html: t(it.tex) }); want[id] = SETS.filter(function (x) { return SETS_OF[it.kind].indexOf(x) >= 0; }); });
    var byId = {}; rows.forEach(function (rw, i) { byId[rw.id] = items[i]; });
    return P.grid(prompt, rows, COLS, want, { why: function (rid, got) { return memberWhy(byId[rid], got); } },
      items.map(function (it) { return t(it.tex) + ': ' + setsTex(bigToSmall(it.kind)) + ' — ' + it.note; }).join('<br>'), MEMBER_HINTS, text);
  }
  function regionTable(items, prompt, text, withDiagram) {
    var rows = [], want = {}, byId = {};
    items.forEach(function (it, i) { var id = 'r' + i; rows.push({ id: id, html: t(it.tex) }); want[id] = SMALLEST[it.kind]; byId[id] = it; });
    var p = P.grid((withDiagram ? vennSvg() : '') + prompt, rows, COLS5, want, { why: function (rid, g) { return regionWhy(byId[rid], g); } },
      items.map(function (it) { return t(it.tex) + ' → ' + S(SMALLEST[it.kind]) + '. ' + it.note; }).join('<br>'), ['Work from the outside in: rational or irrational? If rational, is it an integer? Whole (' + t('\\ge 0') + ')? Natural (' + t('\\ge 1') + ')?'], text);
    p.input.help = 'Choose the innermost region for each number.';
    return p;
  }

  /* ---------- pictures ---------- */
  function vennSvg() {
    return '<svg viewBox="0 0 304 184" width="100%" style="max-width:420px;display:block;margin:6px auto" role="img" aria-label="The real number system: rectangle R; on the left nested ellipses Q, I, W, N; on the right Q-bar">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="300" height="180" rx="3"/><line x1="222" y1="2" x2="222" y2="182"/>' +
      '<ellipse cx="107" cy="94" rx="98" ry="80"/><ellipse cx="107" cy="102" rx="78" ry="64"/><ellipse cx="107" cy="110" rx="58" ry="48"/><ellipse cx="107" cy="124" rx="34" ry="28"/></g>' +
      '<g fill="currentColor" font-size="15" font-style="italic" font-family="KaTeX_Math, Times New Roman, serif" text-anchor="middle"><text x="14" y="21">R</text><text x="107" y="31">Q</text><text x="107" y="55">I</text><text x="107" y="80">W</text><text x="107" y="129">N</text><text x="262" y="99">Q</text></g>' +
      '<line x1="255" y1="85" x2="269" y2="85" stroke="currentColor" stroke-width="1.3"/></svg>';
  }
  /* number line −8…8; inside = shade between −k and k, else shade outward; closed = solid dots */
  function numLine(k, inside, closed) {
    var X = function (v) { return 20 + (v + 8) * 20; }, col = 'var(--brand,#0f5f5a)', rr = 5, s = '';
    var desc = (closed ? 'solid dots' : 'open circles') + ' at −' + k + ' and ' + k + ', shaded ' + (inside ? 'between them' : 'outward in both directions');
    s += '<svg viewBox="0 0 360 48" width="100%" style="max-width:520px;display:block" role="img" aria-label="' + desc + '">';
    s += '<g stroke="currentColor" stroke-width="1.3"><line x1="4" y1="18" x2="350" y2="18"/>';
    for (var v = -8; v <= 8; v++) s += '<line x1="' + X(v) + '" y1="14" x2="' + X(v) + '" y2="22"/>';
    s += '</g><path d="M356 18 l-8 -4.5 v9 z" fill="currentColor"/>';
    s += '<g fill="currentColor" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">';
    for (v = -8; v <= 8; v++) if (v % 2 === 0 || Math.abs(v) === k) s += '<text x="' + X(v) + '" y="41">' + (v < 0 ? '−' + (-v) : v) + '</text>';
    s += '</g>';
    if (inside) s += '<line x1="' + (X(-k) + rr) + '" y1="18" x2="' + (X(k) - rr) + '" y2="18" style="stroke:' + col + '" stroke-width="4"/>';
    else s += '<line x1="12" y1="18" x2="' + (X(-k) - rr) + '" y2="18" style="stroke:' + col + '" stroke-width="4"/><line x1="' + (X(k) + rr) + '" y1="18" x2="346" y2="18" style="stroke:' + col + '" stroke-width="4"/>' +
      '<path d="M2 18 l11 -6.5 v13 z" style="fill:' + col + '"/><path d="M358 18 l-11 -6.5 v13 z" style="fill:' + col + '"/>';
    [-k, k].forEach(function (e) { s += closed ? '<circle cx="' + X(e) + '" cy="18" r="' + rr + '" style="fill:' + col + '"/>' : '<circle cx="' + X(e) + '" cy="18" r="' + rr + '" style="fill:var(--card,#fff);stroke:' + col + '" stroke-width="2.2"/>'; });
    return s + '</svg>';
  }

  /* ---------- reading a typed real number exactly ---------- */
  function swapPi(a) {
    if (!a || typeof a !== 'object') return a;
    if (a.t === 'pi') return { t: 'var', n: '#pi' };
    var o = {}; Object.keys(a).forEach(function (k) { o[k] = (k === 'a' || k === 'b' || k === 'n') ? swapPi(a[k]) : a[k]; }); return o;
  }
  function readReal(resp) {
    var a = K.read(resp); if (a.res) return a;
    var sh = ex.shape(a.ast), vars = Object.keys(sh.vars);
    if (vars.some(function (v) { return v !== 'e'; })) return { res: form('variable', 'Give a number — no letters other than ' + t('\\pi') + ' or ' + t('e') + '.') };
    if (sh.ell) return { res: form('dots-exact', 'A decimal ending in “…” could be anything. Give an exact number instead, like ' + t('-4') + ', ' + t('\\frac{3}{7}') + ', ' + t('\\sqrt{2}') + ' or ' + t('\\pi') + '.') };
    var b = swapPi(a.ast), v1 = ex.value(b, { '#pi': Math.PI, e: Math.E }), v2 = ex.value(b, { '#pi': 3.3, e: 2.9 });
    if (!isFinite(v1)) return { res: wrong('not-real', 'That doesn’t have a real value (for example, the square root of a negative number, or dividing by ' + t('0') + ').') };
    if ((vars.length || sh.pi) && Math.abs(v1 - v2) > 1e-9) return { v: v1, rational: false };
    var r = ex.rat(a.ast); if (r) return { v: r[0] / r[1], rational: true, p: r[0], q: r[1], dec: sh.decimals > 0 && !sh.rep };
    // only float round-off may separate v1 from p/q (a looser tolerance called √11237 or 1000+√2 rational)
    for (var q = 1; q <= 1000; q++) { var p = Math.round(v1 * q); if (Math.abs(v1 * q - p) < 1e-13 * q * Math.max(1, Math.abs(v1))) { var g = gcd(p, q) || 1; return { v: p / q, rational: true, p: p / g, q: q / g }; } }
    return { v: v1, rational: false };
  }
  function kindOf(o) { if (!o.rational) return 'irr'; if (o.q !== 1) return 'rat'; return o.p > 0 ? 'nat' : o.p === 0 ? 'zero' : 'negint'; }
  function describe(o) {
    var k = kindOf(o), tx = o.rational ? ex.texRat([o.p, o.q]) : null;
    return k === 'irr' ? 'Your number is irrational (in ' + S('Qb') + ').' : k === 'rat' ? (o.q > 100 ? 'Your number' : t(tx)) + ' is rational, but not an integer.' : k === 'nat' ? t(tx) + ' is a natural number (so it is also whole, an integer and rational).' :
      k === 'zero' ? 'Your number is ' + t('0') + ': whole, an integer and rational, but not natural.' : t(tx) + ' is a negative integer (so it is also rational).';
  }
  /* "find a number that…": cond = { inS, notS, between: [lo, hi], neg } */
  function findPart(prompt, cond, keyTex, good, bad, text) {
    var tip = { N: 'one of the counting numbers ' + t('1, 2, 3, \\ldots'), W: 'one of ' + t('0, 1, 2, 3, \\ldots'), I: 'one of ' + t('\\ldots, -2, -1, 0, 1, 2, \\ldots'), Q: 'a fraction, or a decimal that terminates or repeats', Qb: 'a decimal that never terminates or repeats', R: 'any number on the number line' };
    var notTip = { N: 'Every whole number except 0 is natural.', W: 'Whole numbers are 0, 1, 2, … — so think negative.', I: 'Think fraction or decimal that falls between two integers.', Q: 'You need a decimal that never terminates or repeats, e.g. the root of a non-perfect square.' };
    return { prompt: prompt, input: { type: 'math', keys: 'expr' }, key: keyTex, answer: cond.only ? t(keyTex) : '(answers vary) e.g. ' + t(keyTex), good: good, bad: bad, text: text,
      check: function (resp) {
        var o = readReal(resp); if (o.res) return o.res;
        var sets = SETS_OF[kindOf(o)];
        if (sets.indexOf(cond.inS) < 0) return wrong('not-in-set', describe(o) + ' You need ' + ONE[cond.inS] + ': ' + tip[cond.inS] + '.');
        if (cond.notS === 'Q' && o.rational && o.dec && o.q >= 100) return wrong('in-excluded-set', 'A decimal that stops is rational — even if it is a rounded value of an irrational number like ' + t('\\sqrt{2}') + '. Type the exact number instead (use the ' + t('\\sqrt{\\ }') + ' or ' + t('\\pi') + ' key).');
        if (cond.notS && sets.indexOf(cond.notS) >= 0) return wrong('in-excluded-set', describe(o) + ' So it <b>is</b> ' + ONE[cond.notS] + '. ' + (notTip[cond.notS] || ''));
        if (cond.between && !(o.v > cond.between[0] && o.v < cond.between[1])) return wrong('range', 'Your number is ' + ONE[cond.inS] + (cond.notS ? ' and not ' + ONE[cond.notS] : '') + ', but it isn’t between ' + t(cond.between[0]) + ' and ' + t(cond.between[1]) + '. Try the square root of a number between ' + t(cond.between[0] * cond.between[0]) + ' and ' + t(cond.between[1] * cond.between[1]) + '.');
        if (cond.neg && !(o.v < 0)) return wrong('sign', 'Right kind of number, but it also has to be negative.');
        return ok();
      },
      solution: cond.sol, hints: cond.hints };
  }

  /* ---------- always / sometimes / never ---------- */
  /* d = { ans, yes (example that works), no (counterexample), reason } */
  function asnPart(r, stmt, d, text) {
    var why = function (w) {
      if (w === 'always') return d.ans === 'sometimes' ? 'Not always. Counterexample: ' + d.no : 'Can you find even one example? ' + d.reason;
      if (w === 'never') return d.ans === 'sometimes' ? 'It can happen: ' + d.yes : d.reason;
      return d.ans === 'always' ? 'Look for a counterexample — there isn’t one. ' + d.reason : 'Look for an example that works — there isn’t one. ' + d.reason;
    };
    var opts = ['always', 'sometimes', 'never'].map(function (w) { return { html: '<b>' + w + '</b>', right: w === d.ans, why: w === d.ans ? null : why(w), code: 'said-' + w }; });
    var p = P.mc(r, stmt.replace('___', blank()), opts, d.ans === 'sometimes' ? '<b>Sometimes.</b> It works: ' + d.yes + '<br>It fails: ' + d.no : '<b>' + cap(d.ans) + '.</b> ' + d.reason,
      ['Try a few examples. If you can find one that works and one that fails, the answer is <i>sometimes</i>.'], text, true);
    p.input.columns = 3;
    return p;
  }
  function setASN(x, y) { // "a number in x is ___ in y"
    var ans = relation(x, y), yes = exBoth(x, y), no = exIn(x, y);
    return { ans: ans, yes: yes ? t(yes) + ' is ' + ONE[x] + ' and ' + ONE[y] + '.' : '', no: no ? t(no) + ' is ' + ONE[x] + ' but not ' + ONE[y] + '.' : '',
      reason: ans === 'always' ? S(x) + ' is nested inside ' + S(y) + ': every ' + NOUN[x] + ' is ' + ONE[y] + '.' : S(x) + ' and ' + S(y) + ' don’t overlap: no number is in both.' };
  }
  function asnD(ans, yes, no, reason) { return { ans: ans, yes: yes, no: no, reason: reason }; }
  function tfPart(r, stmt, truth, why, sol, text, hints) { return P.tf(r, stmt, truth, why, sol, hints || ['Picture the diagram:' + S('N') + ' inside ' + S('W') + ' inside ' + S('I') + ' inside ' + S('Q') + ', with ' + S('Qb') + ' beside ' + S('Q') + ', all inside ' + S('R') + '.'], text); }
  function subsetWhy(x, y, truth) { return truth ? 'Every ' + NOUN[x] + ' is also ' + ONE[y] + ': ' + S(x) + ' sits inside ' + S(y) + ' on the diagram.' : t(exIn(x, y)) + ' is ' + ONE[x] + ' but not ' + ONE[y] + '.'; }
  function nestedPart(r, x, y, symbols, text) {
    var truth = sub(x, y), st = symbols ? 'The set ' + S(x) + ' is nested within the set ' + S(y) + '.' : 'The set of ' + NAME[x] + ' is nested within the set of ' + NAME[y] + '.';
    var why = truth ? subsetWhy(x, y, true) : (sub(y, x) ? 'It’s the other way round: ' + S(y) + ' is nested within ' + S(x) + '. ' : '') + subsetWhy(x, y, false);
    return tfPart(r, st, truth, why, '<b>' + (truth ? 'True' : 'False') + '.</b> ' + why, text);
  }
  function allPart(r, x, y, text) { var truth = sub(x, y), why = subsetWhy(x, y, truth); return tfPart(r, 'All ' + NAME[x] + ' are ' + NAME[y] + '.', truth, why, '<b>' + (truth ? 'True' : 'False') + '.</b> ' + why, text); }
  function poolTF(r, pool, text, hints) { var s = r.pick(pool); return tfPart(r, s[0], s[1], s[2], '<b>' + (s[1] ? 'True' : 'False') + '.</b> ' + s[2], text || 'T/F: ' + s[0].replace(/\\\(|\\\)|<[^>]*>/g, ''), hints); }
  var ROOT_TF_HINTS = ['Test it with a number: which numbers squared give ' + t('16') + '? Which number cubed gives ' + t('-8') + '?', 'The symbol ' + t('\\sqrt{\\ }') + ' means the principal (positive) square root only.'];
  var ABS_TF_HINTS = ['Test the statement with a positive number, a negative number and ' + t('0') + '.', t('|x|') + ' is the distance of ' + t('x') + ' from ' + t('0') + ', so it is never negative.'];
  function pickPair(r, truth) { return r.pick(truth ? TRUE_PAIRS : r.chance(0.75) ? REV_PAIRS : DISJ_PAIRS); }

  /* ---------- estimating roots ---------- */
  function rootV(n, m) { return n === 2 ? Math.sqrt(m) : Math.cbrt(m); }
  function rootT(n, mt) { return n === 2 ? '\\sqrt{' + mt + '}' : '\\sqrt[3]{' + mt + '}'; }
  function cands(v) { var f = frac(v); return f < 0.35 ? [Math.floor(v)] : f > 0.65 ? [Math.ceil(v)] : [Math.floor(v), Math.ceil(v)]; }
  function coefT(c) { return c[1] === 1 ? (c[0] === 1 ? '' : String(c[0])) : '\\frac{' + c[0] + '}{' + c[1] + '}'; }
  function cv(c) { return c[0] / c[1]; }
  function nb(n, m, mt) { // "√40 is between √36 = 6 and √49 = 7"
    var L = Math.floor(rootV(n, m) + 1e-9), lo = Math.pow(L, n), hi = Math.pow(L + 1, n);
    return t(rootT(n, mt)) + ' is between ' + t(rootT(n, F(lo)) + '=' + L) + ' and ' + t(rootT(n, F(hi)) + '=' + (L + 1)) + '.';
  }
  function fx(v, dp) { return K.roundTo(v, dp).toFixed(dp); }
  function estNum(v) { var k = K.roundTo(v, 1); return k % 1 === 0 ? String(k) : k.toFixed(1); }
  /* terms: [{ s: ±1, c: [p,q], n: 2|3, m, mt }] */
  function termsTex(T) { return T.map(function (u, i) { return (u.s < 0 ? '-' : i ? '+' : '') + coefT(u.c) + rootT(u.n, u.mt); }).join(''); }
  function termsVal(T, f) { return T.reduce(function (acc, u) { return acc + u.s * cv(u.c) * f(u); }, 0); }
  function termsMentals(T) {
    var out = [0];
    T.forEach(function (u) { var cs = cands(rootV(u.n, u.m)), nx = []; out.forEach(function (o) { cs.forEach(function (c) { nx.push(o + u.s * cv(u.c) * c); }); }); out = nx; });
    return out;
  }
  function termsSteps(T, f, dp, rel) {
    return T.map(function (u, i) { var v = f(u), vs = dp == null ? String(v) : fx(v, dp); return (u.s < 0 ? '-' : i ? '+' : '') + (u.c[0] === 1 && u.c[1] === 1 ? vs : coefT(u.c) + '(' + vs + ')'); }).join('') + rel;
  }
  /* o = { tex, x, mentals, mentalKey, nb, mentalSol, calcSol, diagEst, diagCalc, text } */
  function estPart(o) {
    var tol = Math.max(0.65, 0.1 * Math.abs(o.x)), want = K.roundTo(o.x, 1), ks = estNum(o.mentalKey);
    var estC = function (resp) {
      var p = HW.parse.number(resp);
      if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your mental estimate first.' : 'Give your estimate as a single number.');
      var v = p.value;
      if (Math.abs(v - o.x) <= tol + 1e-9 || o.mentals.some(function (m) { return Math.abs(v - m) <= 0.06; })) return ok();
      var h = o.diagEst ? o.diagEst(v) : null; if (h) return wrong(h.code, h.hint);
      var near = Math.abs(v - o.x) <= 3 * tol;
      return wrong(near ? 'estimate-off' : 'estimate-far', (near ? 'Not close enough yet. ' : 'That’s a long way off. ') + o.nb);
    };
    var calcC = K.approx(o.x, 1, { diag: o.diagCalc });
    var reasonable = Math.abs(o.mentalKey - o.x) <= tol;
    return { prompt: t(o.tex), input: { type: 'fields', fields: [{ label: '(i) Mental estimate', before: t('\\approx') }, { label: '(ii) Calculator, nearest tenth', before: t('\\approx') }] },
      check: K.fields([estC, calcC], { labels: ['(i) Estimate', '(ii) Calculator'] }), key: [ks, want.toFixed(1)],
      answer: '(i) ' + t('\\approx ' + ks) + ' &nbsp; (ii) ' + t('\\approx ' + want.toFixed(1)),
      solution: '(i) ' + o.mentalSol + '<br>(ii) ' + o.calcSol + (reasonable ? '<br>The estimate was reasonable.' : ''),
      hints: [o.nb, 'Estimate each root with the nearest perfect ' + (/sqrt\[3\]/.test(o.tex) ? (/sqrt\{/.test(o.tex) ? 'square or cube' : 'cube') : 'square') + ' first, then do the arithmetic. For (ii), round only at the very end.'], text: o.text };
  }
  /* build an estimation part from a sum of root terms */
  function termsEst(T, text) {
    var x = termsVal(T, function (u) { return rootV(u.n, u.m); }), mk = termsVal(T, function (u) { return Math.round(rootV(u.n, u.m)); });
    var early = K.roundTo(termsVal(T, function (u) { return K.roundTo(rootV(u.n, u.m), 1); }), 1), hasCube = T.some(function (u) { return u.n === 3; });
    var sq = K.roundTo(termsVal(T, function (u) { return Math.sqrt(u.m); }), 1), want = K.roundTo(x, 1);
    var single = T.length === 1 && T[0].c[0] === 1 && T[0].c[1] === 1, u0 = T[0];
    return estPart({ tex: termsTex(T), x: x, mentals: termsMentals(T), mentalKey: single ? Math.round(x) : mk, text: text,
      nb: T.map(function (u) { return nb(u.n, u.m, u.mt); }).join(' '),
      mentalSol: T.map(function (u) { var e = Math.round(rootV(u.n, u.m)); return t(rootT(u.n, u.mt) + '\\approx ' + e) + ' (' + t(u.mt) + ' is near ' + t(F(Math.pow(e, u.n)) + '=' + e + '^{' + u.n + '}') + ')'; }).join(', ') +
        (single ? '' : ', so ' + t(termsSteps(T, function (u) { return Math.round(rootV(u.n, u.m)); }, null, '\\approx ' + estNum(mk)))),
      calcSol: single ? t(rootT(u0.n, u0.mt) + '=' + fx(x, 3) + '\\ldots\\approx ' + want.toFixed(1)) : t(termsSteps(T, function (u) { return rootV(u.n, u.m); }, 3, '\\approx ' + want.toFixed(1))),
      diagEst: function (v) {
        if (single && u0.n === 2 && Math.abs(v - u0.m / 2) < 0.6 && u0.m > 6) return { code: 'sqrt-halved', hint: 'A square root isn’t half the number. ' + nb(u0.n, u0.m, u0.mt) };
        if (single && u0.n === 3 && Math.abs(v - Math.sqrt(u0.m)) <= 0.65) return { code: 'square-not-cube', hint: 'That’s about the <b>square</b> root. This is a cube root: which number cubed is close to ' + t(u0.mt) + '?' };
        return null;
      },
      diagCalc: function (v) {
        if (hasCube && Math.abs(v - sq) < 1e-9 && sq !== want) return { code: 'square-not-cube', hint: 'It looks like you used a square root where there is a cube root. Use the ' + t('\\sqrt[3]{\\ }') + ' (or ' + t('\\sqrt[x]{\\ }') + ' with ' + t('x=3') + ') key.' };
        if (!single && Math.abs(v - early) < 1e-9 && early !== want) return { code: 'rounded-early', hint: 'Close — but you rounded the roots before combining them. Keep the full calculator values and round only at the end.' };
        return null;
      } });
  }
  function T1(n, m, mt, s, c) { return { s: s || 1, c: c || [1, 1], n: n, m: m, mt: mt == null ? F(m) : mt }; }

  /* ---------- one significant digit ---------- */
  function scaled(N, k) { if (!k) return String(N); var s = String(N); while (s.length < k + 1) s = '0' + s; return s.slice(0, s.length - k) + '.' + s.slice(s.length - k); }
  function pairsTex(str) {
    var parts = str.split('.'), ip = parts[0], dp = parts[1] || '', out = [];
    if (!dp) { while (ip.length > 2) { out.unshift(ip.slice(-2)); ip = ip.slice(0, -2); } out.unshift(ip); return out.join('\\,|\\,'); }
    if (dp.length % 2) dp += '0';
    for (var i = 0; i < dp.length; i += 2) out.push(dp.slice(i, i + 2));
    return '0.\\,' + out.join('\\,|\\,');
  }
  var PLACE = { 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones', '-1': 'tenths', '-2': 'hundredths', '-3': 'thousandths' };
  function sig1Info(x) { var e = Math.floor(Math.log10(x) + 1e-12), d = Math.round(x / Math.pow(10, e)); if (d === 10) { d = 1; e++; } return { d: d, e: e, v: e >= 0 ? d * Math.pow(10, e) : Number((d * Math.pow(10, e)).toFixed(-e)) }; }
  function sigOK(N, k) { var x = Math.sqrt(N / Math.pow(10, k)), e = Math.floor(Math.log10(x) + 1e-12), m = x / Math.pow(10, e); return fracOK(m, 0.46, 0.54) && m < 9.46; }
  function sigPart(N, k, text) {
    var str = scaled(N, k), tx = fmtDec(str), x = Math.sqrt(N / Math.pow(10, k)), si = sig1Info(x), want = si.v, ws = si.e >= 0 ? String(want) : want.toFixed(-si.e);
    var grp = 'Group the digits in pairs, starting at the decimal point: ' + t(pairsTex(str)) + '. Each pair gives one digit of the square root.';
    var chopV = Math.floor(x / Math.pow(10, si.e)) * Math.pow(10, si.e);
    return { prompt: t('\\sqrt{' + tx + '}'), input: { type: 'number' }, key: ws, answer: t(fmtDec(ws)), text: text || '1 s.f. sqrt ' + str,
      check: function (resp) {
        var p = HW.parse.number(resp);
        if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your estimate first.' : 'Enter a single number.');
        var v = p.value;
        if (Math.abs(v - want) <= 1e-9 * Math.max(1, want)) return ok();
        if (v > 0 && Math.abs(v - x) / x < 0.06 && Math.abs(sig1Info(v).v - want) <= 1e-9 * Math.max(1, want)) return form('sig-digits', 'Right size — now round it to <b>one</b> significant digit: keep only the first non-zero digit and replace the rest with zeros.');
        for (var j = -5; j <= 5; j++) if (j && Math.abs(v - want * Math.pow(10, j)) <= 1e-9 * Math.max(1, Math.abs(v))) return wrong('place-value', 'Right digit, wrong place value. ' + grp + ' So the first digit of the root is in the <b>' + PLACE[si.e] + '</b> place.');
        if (Math.abs(v - chopV) <= 1e-9 * Math.max(1, v) && chopV !== want) return wrong('chop', 'Round, don’t chop: look at the second digit of the square root. If it is 5 or more, the first digit rounds up.');
        return wrong('value', null);
      },
      solution: 'Pairs: ' + t(pairsTex(str)) + ', so the first digit of the root is in the ' + PLACE[si.e] + ' place. A calculator gives ' + t('\\sqrt{' + tx + '}\\approx ' + fmtDec(Number(x.toPrecision(4)).toString())) + ', which is ' + t(fmtDec(ws)) + ' to one significant digit.',
      hints: [grp, 'Estimate the square root of the first non-zero pair, then put that digit in the right place.'] };
  }

  /* ---------- absolute value numbers ---------- */
  function absPart(prompt, ans, diag, sol, text) { return P.number(t(prompt), ans, diag, sol, ['Work inside the bars first. Absolute value is a distance from ' + t('0') + ', so it is never negative.'], text); }

  HW.defineLesson({
    id: 'u1l4', unit: 1, num: '4', title: 'Classifying the Real Number System', outcome: 'AN2',
    blurb: 'Sorting every real number into N, W, I, Q and Q̄ — then estimating square and cube roots, ordering them, and the absolute value extension.',
    questions: [
      /* ================= Part A — The Real Number System ================= */
      { num: '1', section: 'Part A — The Real Number System', stem: 'The real number system as a Venn diagram: the rectangle is ' + S('R') + ', a vertical line separates the rationals from the irrationals, and nested ellipses hold ' + S('Q') + ', ' + S('I') + ', ' + S('W') + ' and ' + S('N') + '.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          var inward = r.chance(0.5), chain = ['N', 'W', 'I', 'Q', 'R'], items = chain.map(function (x) { return { id: x, tex: SYM[x] }; });
          if (inward) items.reverse();
          return P.order(r, 'Put the sets in order from the ' + (inward ? '<b>outermost</b> (largest) to the <b>innermost</b> (smallest)' : '<b>innermost</b> (smallest) ellipse to the <b>outermost</b> (largest) set') + '.', items,
            { first: inward ? 'outermost' : 'innermost', last: inward ? 'innermost' : 'outermost', why: function (a, b) { var big = inward ? b : a, small = inward ? a : b; return 'Every ' + NOUN[small] + ' is also ' + ONE[big] + ', so ' + S(small) + ' sits <b>inside</b> ' + S(big) + '.'; } },
            vennSvg() + 'From the inside out: ' + t('N\\subset W\\subset I\\subset Q\\subset R') + '. ' + S('W') + ' adds ' + t('0') + ' to ' + S('N') + ', ' + S('I') + ' adds the negatives, ' + S('Q') + ' adds the fractions, and ' + S('R') + ' adds the irrationals ' + S('Qb') + ', which sit beside ' + S('Q') + '.',
            ['Start with the counting numbers ' + t('1, 2, 3, \\ldots') + ' — which set is that?', 'Each set contains everything in the one before it, plus more.'], 'nesting order of N W I Q R');
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var its = r.shuffle([r.chance(0.5) ? natInt(r.int(2, 40)) : sqrtPerfect(r.int(2, 12)), zeroItem(r, r.int(2, 9)), negInt(r.int(2, 30)), r.chance(0.5) ? fracItem(r.int(1, 4), r.pick([5, 7, 9]), r.chance(0.5)) : termItem(r), r.chance(0.5) ? sqrtIrr(r.pick([2, 3, 5, 7, 10, 15, 20])) : constItem(r, ['\\pi', 'e'])]);
          return regionTable(its, 'In which region of the completed diagram does each number go? Choose the <b>innermost</b> region that contains it.', 'Venn regions', true);
        } }] },
      { num: '2', stem: 'For each number, check <b>all</b> the sets (' + t('N, W, I, Q, \\overline{Q}, R') + ') to which it belongs.', parts: [
        { id: '2a', level: 'LIM', make: function (r) { return memberPart(negInt(r.int(2, 15))); } },
        { id: '2b', level: 'BEG', make: function (r) { return memberPart(sqrtPerfect(r.int(2, 12))); } },
        { id: '2c', level: 'EMG', make: function (r) { return memberPart(looksIrr(r)); } },
        { id: '2d', level: 'BEG', make: function (r) { var q = r.int(2, 9), p = gen(r, function () { return r.int(q + 1, 4 * q); }, function (p) { return gcd(p, q) === 1; }); return memberPart(fracItem(p, q, true)); } },
        { id: '2e', level: 'BEG', make: function (r) { return memberPart(zeroItem(r, r.int(2, 9))); } },
        { id: '2f', level: 'BEG', make: function (r) { return memberPart(sqrtIrr(gen(r, function () { return r.int(2, 99); }, nonSq))); } },
        { id: '2g', level: 'BEG', make: function (r) { return memberPart(nonRepItem(r, true)); } },
        { id: '2h', level: 'BEG', make: function (r) { return memberPart(constItem(r, ['e', 'e', '\\pi', '\\pi', '2\\pi', '\\frac{\\pi}{2}', '-e'])); } }] },
      { num: '3', stem: 'Comparing a negative integer with a negative fraction.', parts: [
        { id: '3', level: 'EMG', make: function (r) {
          var n = r.int(2, 12), d = gen(r, function () { return r.int(2, 9); }, function (d) { return n % d !== 0 && gcd(n, d) === 1; }), f = '-\\frac{' + n + '}{' + d + '}';
          return P.mc(r, 'Which statement explains why ' + t('-' + n) + ' belongs to more number sets than ' + t(f) + '?', [
            { html: t('-' + n) + ' is an integer, so it is in ' + t('I, Q') + ' and ' + t('R') + '. ' + t(f) + ' is not an integer, so it is only in ' + t('Q') + ' and ' + t('R') + '.', right: true },
            { html: t(f) + ' is irrational, so it is only in ' + S('Qb') + ' and ' + t('R') + '.', why: t(f) + ' is a ratio of two integers — that makes it <b>rational</b>.' },
            { html: t('-' + n) + ' is a natural number, so it is in all of ' + t('N, W, I, Q, R') + '.', why: 'Natural and whole numbers are never negative.' },
            { html: 'Negative fractions are not real numbers, so ' + t(f) + ' is in fewer sets.', why: 'Every fraction of integers is a real number — it has a place on the number line.' }],
            t('-' + n) + ' is an integer, and every integer is also rational and real: ' + t('I, Q, R') + ' (three sets). ' + t(f + (Number.isInteger(n / d * 100) ? '=-' + (n / d) : '')) + ' is a ratio of integers but not a whole count, so it is only in ' + t('Q, R') + ' (two sets). The extra condition — being an integer — puts ' + t('-' + n) + ' in one more set.',
            ['List the sets for each number, then compare.'], 'why -' + n + ' in more sets than ' + f);
        } }] },
      { num: '4', stem: 'Check all the sets to which each number belongs.', parts: [
        { id: '4af', sub: 'a–f', level: 'BEG', make: function (r) {
          var q = r.int(2, 9), p = gen(r, function () { return r.int(1, q - 1); }, function (p) { return gcd(p, q) === 1; });
          return memberTable([fracItem(p, q, false), natInt(r.int(100000, 999999)), negInt(r.int(2, 12)), repItem(r), termItem(r), sqrtIrr(gen(r, function () { return r.int(11, 99); }, nonSq))], 'Check every set each number belongs to.', 'set table a–f');
        } },
        { id: '4gl', sub: 'g–l', level: 'PRG', make: function (r) {
          var pq = r.chance(0.5) ? r.pick([[22, 7], [355, 113]]) : r.pick([[19, 6], [25, 8], [17, 5], [29, 4], [23, 6]]);
          return memberTable([constItem(r, ['-\\pi', '-\\pi', '\\frac{\\pi}{2}', '2\\pi', '-e']), fracItem(pq[0], pq[1], true), negSqrt(r.int(2, 12)), smallDec(r), patternItem(r), sqrtDecSq(r)], 'Check every set each number belongs to.', 'set table g–l');
        } }] },
      { num: '5', stem: 'Find one number that satisfies each condition. (Use the keypad for fractions, roots and ' + t('\\pi') + '.)', parts: [
        { id: '5a', level: 'BEG', make: function (r) {
          var v = r.chance(0.6) ? 'W' : 'N', k = r.int(2, 9);
          return findPart('An integer, but not ' + ONE[v] + '.', { inS: 'I', notS: v, sol: v === 'W' ? 'Any negative integer, e.g. ' + t('-' + k) + ' — ' + S('W') + ' contains no negatives.' : 'Any negative integer, or ' + t('0') + ' (e.g. ' + t('-' + k) + '): ' + S('N') + ' starts at ' + t('1') + '.', hints: ['The integers are ' + t('\\ldots,-2,-1,0,1,2,\\ldots') + '. Which ones are not ' + NAME[v] + '?'] },
            '-' + k, ['-1', '-17'].concat(v === 'N' ? ['0'] : []), [String(k), '-\\frac{1}{2}'].concat(v === 'W' ? ['0'] : []), 'integer not ' + v);
        } },
        { id: '5b', level: 'BEG', make: function (r) {
          var v = r.chance(0.6) ? 'I' : 'W', q = r.int(3, 9), p = gen(r, function () { return r.int(1, q - 1); }, function (p) { return gcd(p, q) === 1; });
          return findPart('A rational number, but not ' + ONE[v] + '.', { inS: 'Q', notS: v, sol: 'Any ' + (v === 'W' ? 'negative number or ' : '') + 'fraction that isn’t ' + (v === 'I' ? 'an integer' : 'whole') + ', e.g. ' + t('\\frac{' + p + '}{' + q + '}') + '.', hints: ['A rational number is a ratio of integers ' + t('\\frac{a}{b}') + '. Pick one that doesn’t simplify to ' + (v === 'I' ? 'an integer' : 'a whole number') + '.'] },
            '\\frac{' + p + '}{' + q + '}', ['0.5', '-\\frac{7}{3}'].concat(v === 'W' ? ['-2'] : []), ['3', '\\sqrt{2}', '\\frac{8}{4}'], 'rational not ' + v);
        } },
        { id: '5c', level: 'BEG', make: function (r) {
          var a = r.int(2, 6), v = r.pick(['plain', 'plain', 'between', 'neg']);
          var cond = v === 'between' ? { inS: 'R', notS: 'Q', between: [a, a + 1] } : v === 'neg' ? { inS: 'R', notS: 'Q', neg: true } : { inS: 'R', notS: 'Q' };
          var key = v === 'between' ? '\\sqrt{' + (a * a + a) + '}' : v === 'neg' ? '-\\sqrt{2}' : '\\sqrt{2}';
          cond.sol = 'Any irrational number' + (v === 'between' ? ' between ' + t(a) + ' and ' + t(a + 1) + ', e.g. ' + t(key) + ' (' + t(a * a + a) + ' is between ' + t(a * a) + ' and ' + t((a + 1) * (a + 1)) + ', and it isn’t a perfect square).' : v === 'neg' ? ' that is negative, e.g. ' + t(key) + ' or ' + t('-\\pi') + '.' : ', e.g. ' + t('\\sqrt{2}') + ' or ' + t('\\pi') + '.');
          cond.hints = ['A real number that isn’t rational is irrational: its decimal never terminates or repeats.', 'Square roots of non-perfect squares are irrational.'];
          return findPart(v === 'between' ? 'A real number between ' + t(a) + ' and ' + t(a + 1) + ' that is not a rational number.' : v === 'neg' ? 'A negative real number that is not a rational number.' : 'A real number, but not a rational number.', cond, key,
            v === 'between' ? ['\\sqrt{' + (a * a + 1) + '}'] : v === 'neg' ? ['-\\pi'] : ['\\pi', '\\sqrt{3}', '1+\\sqrt{2}'], v === 'neg' ? ['\\sqrt{2}', '-\\sqrt{4}'] : ['\\sqrt{' + (a + 1) * (a + 1) + '}', '0.5'], 'real not rational (' + v + ')');
        } },
        { id: '5d', level: 'BEG', make: function (r) {
          return findPart(r.pick(['A whole number, but not a natural number.', 'A number that is in ' + S('W') + ' but not in ' + S('N') + '.']), { inS: 'W', notS: 'N', only: true, sol: t('0') + ' — the only whole number that is not a natural number.', hints: ['Compare ' + t('W=\\{0,1,2,3,\\ldots\\}') + ' with ' + t('N=\\{1,2,3,\\ldots\\}') + '.'] },
            '0', ['\\frac{0}{5}'], ['1', '-1', '\\frac{1}{2}'], 'whole not natural');
        } }] },
      { num: '6', stem: 'Complete each statement with <i>always</i>, <i>sometimes</i> or <i>never</i>.', parts: [
        { id: '6a', level: 'BEG', make: function (r) { var pr = r.pick([['W', 'N'], ['W', 'N'], ['I', 'W'], ['Q', 'I'], ['I', 'N'], ['R', 'Q']]); return asnPart(r, cap(ONE[pr[0]]) + ' is ___ ' + ONE[pr[1]] + '.', setASN(pr[0], pr[1]), 'ASN ' + pr[0] + ' is ' + pr[1]); } },
        { id: '6b', level: 'EMG', make: function (r) {
          var V = [['The quotient of two integers is ___ an integer.', asnD('sometimes', t('8\\div 2=4') + ' is an integer.', t('8\\div 3=\\frac{8}{3}') + ' is not.')],
            ['The quotient of two integers is ___ an integer.', asnD('sometimes', t('-12\\div 4=-3') + ' is an integer.', t('5\\div 2=2.5') + ' is not.')],
            ['The quotient of two natural numbers is ___ a natural number.', asnD('sometimes', t('12\\div 4=3') + ' is natural.', t('3\\div 4=0.75') + ' is not.')],
            ['The quotient of two non-zero rational numbers is ___ a rational number.', asnD('always', '', '', t('\\frac{a}{b}\\div\\frac{c}{d}=\\frac{ad}{bc}') + ', which is again a ratio of integers.')]];
          var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN ' + v[0]);
        } },
        { id: '6c', level: 'BEG', make: function (r) { var pr = r.pick([['W', 'Q'], ['W', 'Q'], ['N', 'I'], ['I', 'R'], ['N', 'Q'], ['I', 'Q'], ['Qb', 'R']]); return asnPart(r, cap(ONE[pr[0]]) + ' is ___ ' + ONE[pr[1]] + '.', setASN(pr[0], pr[1]), 'ASN ' + pr[0] + ' is ' + pr[1]); } },
        { id: '6d', level: 'EMG', make: function (r) {
          var V = [['The difference of two integers is ___ an integer.', asnD('always', '', '', 'Subtracting one integer from another always lands on an integer, e.g. ' + t('3-8=-5') + '.')],
            ['The sum of two integers is ___ an integer.', asnD('always', '', '', 'Adding integers always lands on an integer, e.g. ' + t('-7+4=-3') + '.')],
            ['The product of two integers is ___ an integer.', asnD('always', '', '', 'Multiplying integers always gives an integer, e.g. ' + t('(-3)(8)=-24') + '.')],
            ['The difference of two natural numbers is ___ a natural number.', asnD('sometimes', t('7-2=5') + ' is natural.', t('2-7=-5') + ' is not.')],
            ['The difference of two whole numbers is ___ a whole number.', asnD('sometimes', t('9-4=5') + ' is whole.', t('3-8=-5') + ' is not.')]];
          var v = r.pick(r.chance(0.4) ? V.slice(0, 1) : V); return asnPart(r, v[0], v[1], 'ASN ' + v[0]);
        } },
        { id: '6e', level: 'EMG', make: function (r) {
          var k = r.int(2, 9), n = gen(r, function () { return r.int(2, 30); }, nonSq);
          var V = [['The square root of a number is ___ in the set ' + S('Qb') + '.', asnD('sometimes', t('\\sqrt{' + n + '}') + ' is irrational.', t('\\sqrt{' + k * k + '}=' + k) + ' is rational.')],
            ['The square root of a natural number is ___ a natural number.', asnD('sometimes', t('\\sqrt{' + k * k + '}=' + k) + ' is natural.', t('\\sqrt{' + n + '}') + ' is irrational.')],
            ['The cube root of an integer is ___ an integer.', asnD('sometimes', t('\\sqrt[3]{-' + k * k * k + '}=-' + k) + ' is an integer.', t('\\sqrt[3]{' + (k * k * k + 1) + '}') + ' is not.')],
            ['The square root of a negative number is ___ a real number.', asnD('never', '', '', 'A real number times itself is never negative, so a negative number has no real square root.')]];
          var v = r.pick(r.chance(0.4) ? V.slice(0, 1) : V); return asnPart(r, v[0], v[1], 'ASN ' + v[0].replace(/\\\(|\\\)/g, ''));
        } },
        { id: '6f', level: 'EMG', make: function (r) {
          var x = r.pick(['W', 'W', 'N', 'I', 'Q', 'Qb']), d;
          if (x === 'W' || x === 'N') d = asnD('never', '', '', S(x) + ' holds ' + (x === 'W' ? t('0') + ' and the positive whole numbers' : 'the positive counting numbers') + ' only.');
          else d = asnD('sometimes', { I: t('-3') + ' is negative and an integer.', Q: t('-\\frac{1}{2}') + ' is negative and rational.', Qb: t('-\\sqrt{2}') + ' is negative and irrational.' }[x], { I: t('-\\frac{1}{2}') + ' is negative but not an integer.', Q: t('-\\sqrt{2}') + ' is negative but not rational.', Qb: t('-3') + ' is negative but not irrational.' }[x]);
          return asnPart(r, 'A negative number is ___ in the set ' + S(x) + '.', d, 'ASN negative in ' + x);
        } },
        { id: '6g', level: 'BEG', make: function (r) { var pr = r.pick([['N', 'R'], ['N', 'R'], ['W', 'Q'], ['Qb', 'R'], ['N', 'I'], ['I', 'W'], ['Qb', 'Q']]); return asnPart(r, 'A number in set ' + S(pr[0]) + ' is ___ a number in set ' + S(pr[1]) + '.', setASN(pr[0], pr[1]), 'ASN in ' + pr[0] + ' in ' + pr[1]); } }] },
      { num: '7', stem: 'Decide whether each statement is true or false.', parts: [
        { id: '7a', level: 'LIM', make: function (r) { var p = r.chance(0.65) ? r.pick([['N', 'I'], ['N', 'Q'], ['W', 'I'], ['N', 'W'], ['W', 'R']]) : pickPair(r, false); return allPart(r, p[0], p[1], 'all ' + p[0] + ' are ' + p[1]); } },
        { id: '7b', level: 'LIM', make: function (r) {
          return poolTF(r, [['Real numbers consist of rational numbers together with irrational numbers.', true, 'That is the definition: ' + t('R=\\{Q\\text{ and }\\overline{Q}\\}') + '.'],
            ['Every real number is either rational or irrational.', true, t('R=\\{Q\\text{ and }\\overline{Q}\\}') + ': each real number is in exactly one of ' + S('Q') + ' or ' + S('Qb') + '.'],
            ['Some real numbers are both rational and irrational.', false, 'A decimal either terminates/repeats (rational) or it doesn’t (irrational) — it can’t do both.'],
            ['Real numbers consist of integers together with irrational numbers.', false, 'That leaves out fractions like ' + t('\\frac{1}{2}') + '. Real numbers are the <b>rational</b> numbers together with the irrational numbers.']], 'definition of R');
        } },
        { id: '7c', level: 'LIM', make: function (r) { var p = r.chance(0.65) ? r.pick([['I', 'Q'], ['W', 'I'], ['N', 'W'], ['Q', 'R'], ['Qb', 'R']]) : pickPair(r, false); return nestedPart(r, p[0], p[1], false, 'nested ' + p[0] + ' in ' + p[1]); } },
        { id: '7d', level: 'LIM', make: function (r) { var p = r.chance(0.65) ? r.pick([['I', 'Q'], ['W', 'Q'], ['I', 'R'], ['N', 'Q']]) : pickPair(r, false); return allPart(r, p[0], p[1], 'all ' + p[0] + ' are ' + p[1]); } },
        { id: '7e', level: 'LIM', make: function (r) {
          return poolTF(r, [['All irrational numbers are real numbers.', true, S('Qb') + ' sits inside ' + S('R') + ': every irrational number has a place on the number line.'],
            ['No irrational number is an integer.', true, 'Every integer is rational (' + t('n=\\frac{n}{1}') + '), and ' + S('Q') + ' and ' + S('Qb') + ' don’t overlap.'],
            ['All real numbers are irrational numbers.', false, t('5') + ' is a real number, but it is rational.'],
            ['Some irrational numbers are rational numbers.', false, S('Q') + ' and ' + S('Qb') + ' don’t overlap: no number is both.']], 'irrationals statement');
        } },
        { id: '7f', level: 'BEG', make: function (r) { var p = r.chance(0.7) ? r.pick([['R', 'N'], ['R', 'Q'], ['Q', 'I'], ['I', 'W']]) : r.pick(TRUE_PAIRS); return nestedPart(r, p[0], p[1], true, 'nested ' + p[0] + ' in ' + p[1]); } },
        { id: '7g', level: 'BEG', make: function (r) { var p = r.chance(0.7) ? r.pick([['Q', 'W'], ['I', 'N'], ['W', 'N'], ['Q', 'Qb'], ['R', 'Qb']]) : r.pick(TRUE_PAIRS); return nestedPart(r, p[0], p[1], true, 'nested ' + p[0] + ' in ' + p[1]); } },
        { id: '7h', level: 'BEG', make: function (r) {
          return poolTF(r, [['There is exactly one number in set ' + S('W') + ' that is not also in set ' + S('N') + '.', true, 'That number is ' + t('0') + '.'],
            ['There are infinitely many numbers in set ' + S('W') + ' that are not in set ' + S('N') + '.', false, S('W') + ' and ' + S('N') + ' differ only by ' + t('0') + ' — exactly one number.'],
            ['There is exactly one number in set ' + S('I') + ' that is not also in set ' + S('W') + '.', false, 'Every negative integer ' + t('-1, -2, -3, \\ldots') + ' is in ' + S('I') + ' but not ' + S('W') + ' — infinitely many.'],
            ['There are infinitely many numbers in set ' + S('I') + ' that are not in set ' + S('W') + '.', true, 'Every negative integer ' + t('-1, -2, -3, \\ldots') + ' is in ' + S('I') + ' but not in ' + S('W') + '.']], 'counting W not N');
        } }] },
      { num: '8', stem: 'Decide whether each statement is true or false.', parts: [
        { id: '8a', level: 'BEG', make: function (r) {
          var k = r.int(2, 12);
          return poolTF(r, [['Every positive number has two square roots, but only one cube root.', true, 'A positive number has one positive and one negative square root (e.g. ' + t(k + '^{2}=(-' + k + ')^{2}=' + k * k) + '), but its cube root is unique.'],
            ['The number ' + t(k * k) + ' has two square roots, ' + t(k) + ' and ' + t('-' + k) + '.', true, t(k + '^{2}=' + k * k) + ' and ' + t('(-' + k + ')^{2}=' + k * k) + '. (The symbol ' + t('\\sqrt{' + k * k + '}') + ' means only the positive one, ' + t(k) + '.)'],
            [t('\\sqrt{' + k * k + '}=\\pm ' + k), false, 'The symbol ' + t('\\sqrt{\\ }') + ' means the <b>principal</b> (positive) square root only: ' + t('\\sqrt{' + k * k + '}=' + k) + '.'],
            ['Every positive number has exactly one square root.', false, 'It has two: ' + t(k) + ' and ' + t('-' + k) + ' are both square roots of ' + t(k * k) + '.']], 'square roots of positives', ROOT_TF_HINTS);
        } },
        { id: '8b', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), c = k * k * k;
          return poolTF(r, [['Every negative number has one cube root, but no square roots.', true, 'e.g. ' + t('-' + c) + ' has cube root ' + t('-' + k) + ', but no real number squares to a negative.'],
            [t('\\sqrt[3]{-' + c + '}=-' + k), true, t('(-' + k + ')^{3}=-' + c) + '. Cube roots of negative numbers are negative.'],
            [t('-' + c) + ' has no cube root.', false, t('(-' + k + ')^{3}=-' + c) + ', so ' + t('\\sqrt[3]{-' + c + '}=-' + k) + '.'],
            [t('\\sqrt{-' + k * k + '}=-' + k), false, t('(-' + k + ')^{2}=+' + k * k) + ', not ' + t('-' + k * k) + '. No real number squares to a negative, so ' + t('\\sqrt{-' + k * k + '}') + ' is not real.']], 'roots of negatives', ROOT_TF_HINTS);
        } }] },

      /* ================= Part B — Estimating Square Roots ================= */
      { num: '9', section: 'Part B — Estimating Square Roots', stem: 'Use whole-number estimates to show why each statement is true.', parts: [
        { id: '9a', level: 'EMG', make: function (r) {
          var c = r.int(5, 8), S2 = c * c, a = gen(r, function () { return r.int(Math.round(S2 * 0.3), Math.round(S2 * 0.5)); }, function (a) { return nonSq(a) && nonSq(S2 - a); }), b = S2 - a;
          return sumEstPart([a, b], c, true);
        } },
        { id: '9b', level: 'EMG', make: function (r) {
          var ns = gen(r, function () { return r.sample([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15], 3).sort(function (x, y) { return x - y; }); }, function (ns) { var T = ns[0] + ns[1] + ns[2]; return nonSq(T) && fracOK(Math.sqrt(T), 0.4, 0.6); });
          return sumEstPart(ns, null, false);
        } }] },
      { num: '10', stem: 'Decide whether each statement is true or false.',
        shared: function (r) { var b = r.int(2, 5), k = r.int(2, 4), a = b * k; if (a > 12) { b = 2; a = 2 * k; } return { a: a, b: b, A: a * a, B: b * b, k: k }; },
        parts: [
          { id: '10a', level: 'BEG', make: function (r, sh) { return opTF(r, sh, '+'); } },
          { id: '10b', level: 'BEG', make: function (r, sh) { return opTF(r, sh, '-'); } },
          { id: '10c', level: 'BEG', make: function (r, sh) { return opTF(r, sh, '\\times'); } },
          { id: '10d', level: 'BEG', make: function (r, sh) { return opTF(r, sh, '\\div'); } }] },
      { num: '11', stem: 'In each of the following: (i) estimate the value mentally; (ii) use a calculator to find the decimal approximation to the nearest tenth, and decide if the estimate was reasonable.', parts: [
        { id: '11a', level: 'BEG', make: function (r) { var n = gen(r, function () { return r.int(11, 99); }, function (n) { return nonSq(n) && fracOK(Math.sqrt(n), 0.42, 0.58); }); return termsEst([T1(2, n)], 'estimate sqrt ' + n); } },
        { id: '11b', level: 'BEG', make: function (r) { var m = gen(r, function () { return d1(r, 101, 999); }, function (m) { return fracOK(Math.sqrt(m.v), 0.42, 0.58); }); return termsEst([T1(2, m.v, m.s)], 'estimate sqrt ' + m.s); } },
        { id: '11c', level: 'EMG', make: function (r) {
          var o = gen(r, function () { return { a: r.int(3, 6), b: r.int(2, 4), p: r.int(10, 99), q: r.int(10, 99) }; }, function (o) {
            var x = o.a * Math.sqrt(o.p) - o.b * Math.sqrt(o.q), tol = Math.max(0.65, 0.1 * x);
            // the whole-number and half-step mental estimates must both be reasonable (as in the booklet's 5√40 − 2√90), so that a sensible estimate is never rejected
            var mk = o.a * Math.round(Math.sqrt(o.p)) - o.b * Math.round(Math.sqrt(o.q)), hk = o.a * Math.round(2 * Math.sqrt(o.p)) / 2 - o.b * Math.round(2 * Math.sqrt(o.q)) / 2;
            return nonSq(o.p) && nonSq(o.q) && o.p !== o.q && x > 3 && x < 40 && Math.abs(mk - x) <= tol && Math.abs(hk - x) <= tol;
          });
          return termsEst([T1(2, o.p, null, 1, [o.a, 1]), T1(2, o.q, null, -1, [o.b, 1])], 'estimate ' + o.a + 'sqrt' + o.p + '-' + o.b + 'sqrt' + o.q);
        } },
        { id: '11d', level: 'EMG', make: function (r) {
          var c1 = r.pick([[2, 3], [3, 4], [1, 2], [3, 5], [2, 5]]), c2 = r.pick([[1, 4], [1, 3], [1, 2], [1, 5]]), m1 = d1(r, 101, 400), m2 = gen(r, function () { return r.int(3, 15); }, nonSq);
          return termsEst([T1(2, m1.v, m1.s, 1, c1), T1(2, m2, null, 1, c2)], 'estimate fractional coefficients');
        } },
        { id: '11e', level: 'EMG', make: function (r) { var n = gen(r, function () { return r.int(101, 399); }, function (n) { return nonSq(n) && fracOK(Math.sqrt(n), 0.42, 0.58); }); return termsEst([T1(2, n)], 'estimate sqrt ' + n); } },
        { id: '11f', level: 'EMG', make: function (r) { var m = r.pick([5, 7, 8, 8, 10, 11, 14, 15]), n = m * m + r.pick([-2, -1, 1, 1, 2]); return nestedRootPart(n, m, 'sqrt sqrt ' + n); } },
        { id: '11g', level: 'PRG', make: function (r) {
          var a = gen(r, function () { return r.int(5, 50); }, nonSq), b = d1(r, 101, 600), Sx = Math.sqrt(a) + Math.sqrt(b.v), x = Math.sqrt(Sx);
          var mentals = []; cands(Math.sqrt(a)).forEach(function (ca) { cands(Math.sqrt(b.v)).forEach(function (cb) { cands(Math.sqrt(ca + cb)).forEach(function (co) { mentals.push(co); }); }); });
          var ea = Math.round(Math.sqrt(a)), eb = Math.round(Math.sqrt(b.v)), es = Math.round(Math.sqrt(ea + eb)), want = K.roundTo(x, 1);
          return estPart({ tex: '\\sqrt{\\sqrt{' + a + '}+\\sqrt{' + b.s + '}}', x: x, mentals: mentals, mentalKey: es, text: 'sqrt(sqrt a + sqrt b)',
            nb: nb(2, a, String(a)) + ' ' + nb(2, b.v, b.s) + ' Add those estimates, then estimate the square root of the sum.',
            mentalSol: t('\\sqrt{' + a + '}\\approx ' + ea) + ', ' + t('\\sqrt{' + b.s + '}\\approx ' + eb) + '; sum ' + t('\\approx ' + (ea + eb)) + ', so ' + t('\\sqrt{' + (ea + eb) + '}\\approx ' + es),
            calcSol: t(fx(Math.sqrt(a), 3) + '+' + fx(Math.sqrt(b.v), 3) + '=' + fx(Sx, 3)) + ', and ' + t('\\sqrt{' + fx(Sx, 3) + '}\\approx ' + want.toFixed(1)),
            diagEst: function (v) { return Math.abs(v - Sx) < 1 ? { code: 'nested-one-root', hint: 'That’s about ' + t('\\sqrt{' + a + '}+\\sqrt{' + b.s + '}') + '. Don’t forget the big square root over the whole sum.' } : null; },
            diagCalc: function (v) { return Math.abs(v - K.roundTo(Sx, 1)) < 1e-9 ? { code: 'nested-one-root', hint: 'That’s the sum inside. Take its square root too.' } : null; } });
        } },
        { id: '11h', level: 'EMG', make: function (r) { var k = r.pick([4, 5, 6, 7, 7, 8]), n = 100 * k * k + r.int(1, 9); return nestedRootPart(n, 10 * k, 'sqrt sqrt ' + n); } }] },
      { num: '12', stem: 'Estimate each square root to one significant digit.', parts: [
        { id: '12a', level: 'BEG', make: function (r) { return sigPart(gen(r, function () { return r.int(100, 999); }, function (N) { return nonSq(N) && sigOK(N, 0); }), 0); } },
        { id: '12b', level: 'BEG', make: function (r) { return sigPart(gen(r, function () { return r.int(1000, 9999); }, function (N) { return nonSq(N) && sigOK(N, 0); }), 0); } },
        { id: '12c', level: 'EMG', make: function (r) { return sigPart(gen(r, function () { return r.int(10000, 99999); }, function (N) { return nonSq(N) && sigOK(N, 0); }), 0); } },
        { id: '12d', level: 'EMG', make: function (r) { return sigPart(1000 * gen(r, function () { return r.int(101, 999); }, function (N) { return sigOK(1000 * N, 0) && N % 10 !== 0; }), 0); } },
        { id: '12e', level: 'EMG', make: function (r) { return sigPart(gen(r, function () { return r.int(101, 999); }, function (N) { return N % 10 !== 0 && sigOK(N, 3); }), 3); } },
        { id: '12f', level: 'EMG', make: function (r) { return sigPart(gen(r, function () { return r.int(101, 999); }, function (N) { return N % 10 !== 0 && sigOK(N, 4); }), 4); } },
        { id: '12g', level: 'EMG', make: function (r) { return sigPart(gen(r, function () { return r.int(101, 999); }, function (N) { return N % 10 !== 0 && sigOK(N, 5); }), 5); } },
        { id: '12h', level: 'EMG', make: function (r) { return sigPart(gen(r, function () { return r.int(1001, 9999); }, function (N) { return N % 10 !== 0 && sigOK(N, 7); }), 7); } }] },

      /* ================= Part C — Cube Roots and Ordering ================= */
      { num: '13', section: 'Part C — Cube Roots and Ordering', stem: 'In each of the following: (i) estimate the value mentally; (ii) use a calculator to find the decimal approximation to the nearest tenth, and decide if the estimate was reasonable.', parts: [
        { id: '13a', level: 'BEG', make: function (r) { var n = gen(r, function () { return r.int(10, 130); }, function (n) { return nonCube(n) && fracOK(Math.cbrt(n), 0.42, 0.58); }); return termsEst([T1(3, n)], 'estimate cbrt ' + n); } },
        { id: '13b', level: 'BEG', make: function (r) { var n = r.pick([2, 4, 4, 5, 6, 7]); return termsEst([T1(3, n)], 'estimate cbrt ' + n); } },
        { id: '13c', level: 'EMG', make: function (r) { return betweenPart(gen(r, function () { return r.int(126, 999); }, nonCube)); } },
        { id: '13d', level: 'EMG', make: function (r) {
          var c = r.int(5, 10), m = gen(r, function () { return d1(r, Math.round(c * c * c * 8), Math.round(c * c * c * 11.5)); }, function (m) { return fracOK(Math.cbrt(m.v), 0.42, 0.58) && Math.round(Math.cbrt(m.v)) === c; });
          return termsEst([T1(3, m.v, fmtDec(m.s))], 'estimate cbrt ' + m.s);
        } },
        { id: '13e', level: 'EMG', make: function (r) {
          var o = gen(r, function () { var Pc = r.pick([3, 4, 5]), Qc = r.pick([2, 3].filter(function (q) { return q < Pc; })), p = d1(r, Math.round(Pc * Pc * Pc * 9), Math.round(Pc * Pc * Pc * 11)), q = d1(r, Math.round(Qc * Qc * Qc * 9), Math.round(Qc * Qc * Qc * 12)); return { a: r.int(2, 4), b: r.int(2, 3), p: p, q: q }; },
            function (o) { var x = o.a * Math.cbrt(o.p.v) - o.b * Math.cbrt(o.q.v), mk = o.a * Math.round(Math.cbrt(o.p.v)) - o.b * Math.round(Math.cbrt(o.q.v)); return x > 1.5 && Math.abs(mk - x) <= Math.max(0.65, 0.1 * x); });
          return termsEst([T1(3, o.p.v, o.p.s, 1, [o.a, 1]), T1(3, o.q.v, o.q.s, -1, [o.b, 1])], 'estimate a cbrt p - b cbrt q');
        } },
        { id: '13f', level: 'EMG', make: function (r) {
          var o = gen(r, function () { return { c1: r.pick([[3, 5], [2, 3], [3, 4], [2, 5]]), p: r.int(20, 80), c2: r.pick([[1, 3], [1, 2], [1, 4]]), q: r.int(20, 130) }; },
            function (o) { return nonSq(o.p) && nonCube(o.q) && cv(o.c1) * Math.sqrt(o.p) - cv(o.c2) * Math.cbrt(o.q) > 0.6; });
          return termsEst([T1(2, o.p, null, 1, o.c1), T1(3, o.q, null, -1, o.c2)], 'estimate square root minus cube root');
        } },
        { id: '13g', level: 'PRG', make: function (r) {
          var a = r.int(2, 5), b = gen(r, function () { return r.int(8, 50); }, function (b) { var inner = a * Math.sqrt(b); return nonSq(b) && inner > 6 && inner < 45; }), inner = a * Math.sqrt(b), x = Math.cbrt(inner);
          var mentals = []; cands(Math.sqrt(b)).forEach(function (cb) { cands(Math.cbrt(a * cb)).forEach(function (co) { mentals.push(co); }); });
          var eb = Math.round(Math.sqrt(b)), want = K.roundTo(x, 1);
          return estPart({ tex: '\\sqrt[3]{' + a + '\\sqrt{' + b + '}}', x: x, mentals: mentals, mentalKey: Math.round(x), text: 'cbrt(a sqrt b)',
            nb: nb(2, b, String(b)) + ' Multiply by ' + t(a) + ', then find the perfect cubes on either side.',
            mentalSol: t(a + '\\sqrt{' + b + '}\\approx ' + a + '(' + eb + ')=' + a * eb) + ', and ' + t('\\sqrt[3]{' + a * eb + '}') + ' is between ' + t(Math.floor(Math.cbrt(a * eb) + 1e-9)) + ' and ' + t(Math.floor(Math.cbrt(a * eb) + 1e-9) + 1) + ', so about ' + t(Math.round(x)),
            calcSol: t(a + '(' + fx(Math.sqrt(b), 3) + ')=' + fx(inner, 2)) + ', and ' + t('\\sqrt[3]{' + fx(inner, 2) + '}\\approx ' + want.toFixed(1)),
            diagEst: function (v) { return Math.abs(v - inner) < 1.5 ? { code: 'nested-one-root', hint: 'That’s about ' + t(a + '\\sqrt{' + b + '}') + '. Now take the cube root of it.' } : null; },
            diagCalc: function (v) { if (Math.abs(v - K.roundTo(inner, 1)) < 1e-9) return { code: 'nested-one-root', hint: 'That’s ' + t(a + '\\sqrt{' + b + '}') + '. Take its cube root too.' }; if (Math.abs(v - K.roundTo(Math.sqrt(inner), 1)) < 1e-9) return { code: 'square-not-cube', hint: 'The outer root is a <b>cube</b> root, not a square root.' }; return null; } });
        } }] },
      { num: '14', stem: 'Order the numbers on a number line from ' + t('0') + ' to ' + t('30') + '.', parts: [
        { id: '14', level: 'EMG', make: function (r) { return orderRootsPart(r); } }] },

      /* ================= Part D — Multiple Choice and Numerical Response ================= */
      { num: '15', section: 'Part D — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '15', level: 'EMG', make: function (r) { return nestMC(r); } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '16', level: 'EMG', make: function (r) {
          var k = gen(r, function () { return r.int(2, 30); }, function (k) { return nonSq(k) && nonCube(k); });
          var F6 = [['-\\sqrt{' + k + '}', true], ['\\sqrt{-' + k + '}', false], ['-\\sqrt[3]{' + k + '}', true], ['\\sqrt[3]{-' + k + '}', true], ['-\\sqrt{-' + k + '}', false], ['-\\sqrt[3]{-' + k + '}', true]];
          var four = r.chance(0.4) ? F6.slice(0, 4) : r.sample(F6, 4), cnt = four.filter(function (f) { return !f[1]; }).length;
          var neg = four.filter(function (f) { return /-/.test(f[0]); }).length, negIn = four.filter(function (f) { return /\{-/.test(f[0]); }).length;
          var opts = [0, 1, 2, 3].map(function (n) { return { html: t(n), right: n === cnt, why: n === cnt ? null : n === neg ? 'A minus sign <b>outside</b> a root is fine: ' + t('-\\sqrt{' + k + '}') + ' is just the opposite of a real number.' : n === negIn ? 'A <b>cube</b> root of a negative number is real (e.g. ' + t('\\sqrt[3]{-8}=-2') + '). Only a <b>square</b> root of a negative fails.' : 'Check each one: only a square root of a negative number is not real.' }; });
          return P.mc(r, 'How many of the numbers ' + t(four.map(function (f) { return f[0]; }).join(',\\ ')) + ' do <b>not</b> belong to the real number system?', opts,
            four.map(function (f) { return t(f[0]) + ': ' + (f[1] ? 'real' : '<b>not real</b> (square root of a negative)'); }).join('<br>') + '<br>So ' + t(cnt) + ' of them ' + (cnt === 1 ? 'is' : 'are') + ' not real.',
            ['A square root of a negative number is not real. A cube root of a negative number is real (and negative).'], 'how many not real', true);
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var k = r.int(2, 9), pq = r.pick([[3, 4], [2, 5], [4, 7], [5, 6], [3, 5], [2, 3]]), kk = k * k;
          var pool = [['\\sqrt{' + kk + '}', true, t('\\sqrt{' + kk + '}=' + k + '=\\frac{' + k + '}{1}') + ' — yes.'], ['\\sqrt{' + fmtDec((kk / 10).toFixed(1).replace(/\.0$/, '')) + '}', false, t(fmtDec((kk / 10).toFixed(1))) + ' is not a perfect square, so its root is irrational — no.'],
            ['\\sqrt{' + (kk / 100).toFixed(2) + '}', true, t('\\sqrt{' + (kk / 100).toFixed(2) + '}=' + k / 10 + '=\\frac{' + k + '}{10}') + ' — yes.'], ['\\sqrt{\\frac{' + pq[0] * pq[0] + '}{' + pq[1] * pq[1] + '}}', true, t('\\sqrt{\\frac{' + pq[0] * pq[0] + '}{' + pq[1] * pq[1] + '}}=\\frac{' + pq[0] + '}{' + pq[1] + '}') + ' — yes.'],
            ['-\\sqrt{' + kk + '}', false, t('-\\sqrt{' + kk + '}=-' + k) + ' is negative, but ' + t('a, b\\in N') + ' gives only positive fractions — no.'], ['\\sqrt{' + kk * 10 + '}', false, t(kk * 10) + ' is not a perfect square, so its root is irrational — no.']];
          if (kk % 10 === 0) pool.splice(1, 1);
          var four = r.chance(0.4) ? pool.slice(0, 4) : gen(r, function () { return r.sample(pool, 4); }, function (f) { return f.some(function (x) { return x[1]; }); });
          four = four.slice().sort(function (a, b) { return pool.indexOf(a) - pool.indexOf(b); });
          var cnt = four.filter(function (f) { return f[1]; }).length;
          return P.mc(r, 'How many of the numbers ' + t(four.map(function (f) { return f[0]; }).join(',\\ ')) + ' can be expressed in the form ' + t('\\frac{a}{b}') + ', where ' + t('a, b\\in N') + '?',
            [1, 2, 3, 4].map(function (n) { return { html: t(n), right: n === cnt, why: n === cnt ? null : 'Check each number: ' + t('\\frac{a}{b}') + ' with ' + t('a, b\\in N') + ' means a <b>positive rational</b> number. Is the radicand a perfect square (decimals like ' + t('0.81=0.9^{2}') + ' count)? Is the number negative?' }; }),
            t('\\frac{a}{b}') + ' with ' + t('a, b\\in N') + ' means a positive rational number.<br>' + four.map(function (f) { return f[2]; }).join('<br>') + '<br>So ' + t(cnt) + ' of them.', ['Simplify each root. Which are positive and rational?'], 'how many positive rational', true);
        } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '18', level: 'BEG', make: function (r) {
          var o = gen(r, function () { return { a: r.int(2, 6), b: r.int(3, 30) }; }, function (o) { var x = o.a * Math.cbrt(o.b); return nonCube(o.b) && x < 9.9 && Math.abs(frac(x * 100) - 0.5) > 0.03; });
          var x = o.a * Math.cbrt(o.b), want = K.roundTo(x, 2), sq = K.roundTo(o.a * Math.sqrt(o.b), 2), inside = K.roundTo(Math.cbrt(o.a * o.b), 2), early = K.roundTo(o.a * K.roundTo(Math.cbrt(o.b), 2), 2);
          var p = P.approx('To the nearest hundredth, the value of ' + t(o.a + '\\sqrt[3]{' + o.b + '}') + ' is ________.', x, 2, { nr: true, diag: function (v) {
            if (Math.abs(v - sq) < 1e-9) return { code: 'square-not-cube', hint: 'That’s ' + t(o.a + '\\sqrt{' + o.b + '}') + '. This is a <b>cube</b> root.' };
            if (Math.abs(v - inside) < 1e-9) return { code: 'cube-in', hint: 'The ' + t(o.a) + ' is outside the root: find ' + t('\\sqrt[3]{' + o.b + '}') + ' first, then multiply by ' + t(o.a) + '.' };
            if (Math.abs(v - early) < 1e-9 && early !== want) return { code: 'rounded-early', hint: 'Close — you rounded ' + t('\\sqrt[3]{' + o.b + '}') + ' before multiplying. Keep the full value and round at the end.' };
            return null;
          } }, t('\\sqrt[3]{' + o.b + '}=' + fx(Math.cbrt(o.b), 4) + '\\ldots') + ' (between ' + t(Math.floor(Math.cbrt(o.b))) + ' and ' + t(Math.floor(Math.cbrt(o.b)) + 1) + '), so ' + t(o.a + '\\sqrt[3]{' + o.b + '}=' + fx(x, 4) + '\\ldots') + ', which rounds to ' + t(want.toFixed(2)) + '.',
          ['Find the cube root first, multiply, and round only at the end.', 'Numerical response: record all four characters, e.g. ' + t('8.90') + '.'], 'NR ' + o.a + 'cbrt' + o.b);
          var base = p.check; // a numerical response to the nearest hundredth shows both decimal places (8.90, not 8.9)
          p.check = function (resp) { var res = base(resp); if (res.v === 'correct' && (HW.parse.plain(resp).replace(/\s/g, '').split('.')[1] || '').length < 2) return form('places', 'Right value! To the nearest hundredth, a numerical-response answer shows <b>two</b> decimal places — record all four characters.'); return res; };
          p.bad = [K.roundTo(o.a * Math.sqrt(o.b), 2) < 10 ? sq.toFixed(2) : '9.99'];
          return p;
        } }] },

      /* ================= Part E — Extension: Absolute Value ================= */
      { num: '19', section: 'Part E — Extension: Absolute Value', stem: 'Evaluate each of the following.',
        shared: function (r) { var p = r.int(2, 9); return { p: p, q: p + r.int(3, 12), c: r.int(2, 6) }; },
        parts: [
          { id: '19a', level: 'LIM', make: function (r) { var k = r.int(2, 20); return absPart('|-' + k + '|', k, function (v) { return v === -k ? { code: 'abs-negative', hint: 'Absolute value is a distance from ' + t('0') + ', so it is never negative.' } : null; }, t('-' + k) + ' is ' + t(k) + ' units from ' + t('0') + ', so ' + t('|-' + k + '|=' + k) + '.', '|-' + k + '|'); } },
          { id: '19b', level: 'LIM', make: function (r) { var k = r.int(5, 30); return absPart('|' + k + '|', k, function (v) { return v === -k ? { code: 'abs-negative', hint: 'Absolute value never makes a number negative. ' + t(k) + ' is already positive.' } : null; }, t(k) + ' is already positive, so ' + t('|' + k + '|=' + k) + '.', '|' + k + '|'); } },
          { id: '19c', level: 'BEG', make: function (r, sh) { var p = sh.p, q = sh.q; return absPart('|' + p + '-' + q + '|', q - p, function (v) { if (v === p - q) return { code: 'abs-inside', hint: 'You worked out ' + t(p + '-' + q) + ' — now take its absolute value.' }; if (v === p + q) return { code: 'abs-added', hint: 'Inside the bars it is ' + t(p + '-' + q) + ': subtract.' }; return null; }, 'Inside the bars first: ' + t(p + '-' + q + '=-' + (q - p)) + '. Then ' + t('|-' + (q - p) + '|=' + (q - p)) + '.', '|' + p + '-' + q + '|'); } },
          { id: '19d', level: 'EMG', make: function (r, sh) { var p = sh.p, q = sh.q; return absPart('|' + p + '|-|' + q + '|', p - q, function (v) { if (v === q - p) return { code: 'abs-each', hint: 'Here the bars go around each number separately: ' + t('|' + p + '|=' + p) + ' and ' + t('|' + q + '|=' + q) + '. Then subtract — there are no bars around the answer.' }; return null; }, 'Each absolute value first: ' + t('|' + p + '|-|' + q + '|=' + p + '-' + q + '=-' + (q - p)) + '. There are no bars around the result, so it stays negative.', '|' + p + '|-|' + q + '|'); } },
          { id: '19e', level: 'EMG', make: function (r, sh) { var p = sh.p, q = sh.q; return absPart('\\big||' + p + '|-|' + q + '|\\big|', q - p, function (v) { if (v === p - q) return { code: 'abs-outer', hint: 'Don’t forget the outer bars: they make the result positive.' }; return null; }, t('|' + p + '|-|' + q + '|=' + p + '-' + q + '=-' + (q - p)) + ', then the outer bars: ' + t('|-' + (q - p) + '|=' + (q - p)) + '.', '||p|-|q||'); } },
          { id: '19f', level: 'EMG', make: function (r, sh) { var c = sh.c, c3 = c * c * c; return absPart('-|\\sqrt[3]{' + c3 + '}|', -c, function (v) { if (v === c) return { code: 'abs-minus-out', hint: 'The minus sign is <b>outside</b> the bars, so it stays: the answer is negative.' }; if (Math.abs(v) === c3) return { code: 'abs-cube', hint: 'Take the cube root first: which number cubed is ' + t(c3) + '?' }; return null; }, t('\\sqrt[3]{' + c3 + '}=' + c) + ' and ' + t('|' + c + '|=' + c) + ', so ' + t('-|\\sqrt[3]{' + c3 + '}|=-' + c) + '.', '-|cbrt ' + c3 + '|'); } },
          { id: '19g', level: 'BEG', make: function (r, sh) { var c = sh.c, c3 = c * c * c; return absPart('|-\\sqrt[3]{' + c3 + '}|', c, function (v) { if (v === -c) return { code: 'abs-negative', hint: 'The minus sign is <b>inside</b> the bars, and absolute value is never negative.' }; if (Math.abs(v) === c3) return { code: 'abs-cube', hint: 'Take the cube root first.' }; return null; }, t('-\\sqrt[3]{' + c3 + '}=-' + c) + ' and ' + t('|-' + c + '|=' + c) + '.', '|-cbrt ' + c3 + '|'); } },
          { id: '19h', level: 'EMG', make: function (r, sh) { var c = sh.c, c3 = c * c * c; return absPart('|\\sqrt[3]{-' + c3 + '}|', c, function (v) { if (v === -c) return { code: 'abs-negative', hint: t('\\sqrt[3]{-' + c3 + '}=-' + c) + ' — but then the bars make it positive.' }; if (Math.abs(v) === c3) return { code: 'abs-cube', hint: 'Take the cube root first.' }; return null; }, t('\\sqrt[3]{-' + c3 + '}=-' + c) + ' (cube roots keep the sign), and ' + t('|-' + c + '|=' + c) + '.', '|cbrt -' + c3 + '|'); } }] },
      { num: '20', stem: 'Decide whether each statement is true or false.', parts: [
        { id: '20a', level: 'BEG', make: function (r) {
          var k = r.int(2, 9);
          return poolTF(r, [[t('|x|=x') + ' if ' + t('x>0'), true, 'If ' + t('x') + ' is positive, its distance from ' + t('0') + ' is ' + t('x') + ' itself, e.g. ' + t('|' + k + '|=' + k) + '.'],
            [t('|x|=x') + ' if ' + t('x\\ge 0'), true, 'For ' + t('x>0') + ' the distance is ' + t('x') + ' itself, and ' + t('|0|=0') + '.'],
            [t('|x|=x') + ' if ' + t('x<0'), false, 'Try ' + t('x=-' + k) + ': ' + t('|-' + k + '|=' + k) + ', not ' + t('-' + k) + '.']], 'abs positive case', ABS_TF_HINTS);
        } },
        { id: '20b', level: 'PRG', make: function (r) {
          var k = r.int(2, 9);
          return poolTF(r, [[t('|x|=-x') + ' if ' + t('x<0'), true, 'If ' + t('x') + ' is negative, ' + t('-x') + ' is positive, and that is its distance from ' + t('0') + ': e.g. ' + t('|-' + k + '|=' + k + '=-(-' + k + ')') + '.'],
            [t('|x|=-x') + ' if ' + t('x>0'), false, 'Try ' + t('x=' + k) + ': ' + t('|' + k + '|=' + k) + ', but ' + t('-x=-' + k) + '.'],
            [t('|-x|=x') + ' for every real number ' + t('x'), false, 'Try ' + t('x=-' + k) + ': ' + t('|-(-' + k + ')|=|' + k + '|=' + k) + ', but ' + t('x=-' + k) + '.']], 'abs negative case', ABS_TF_HINTS);
        } }] },
      { num: '21', stem: 'Choose the graph that represents each absolute value inequality. The variables are defined on the set of real numbers.', parts: [
        { id: '21a', level: 'BEG', make: function (r) { return absGraphPart(r, true, r.int(2, 7), r.pick(['x', 'x', 'y', 'n'])); } },
        { id: '21b', level: 'EMG', make: function (r) { return absGraphPart(r, false, r.int(2, 7), r.pick(['a', 'a', 'x', 'm'])); } }] }
    ],
    extra: [
      /* ================= Extra practice A — Simplify first, then classify ================= */
      { num: '1', section: 'Extra practice A — Simplify first, then classify', stem: 'Each number is written in a form that hides what it really is. <b>Simplify it first</b>, then check every set it belongs to.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) { return memberPart(sqrtPerfect(r.int(2, 12))); } },
        { id: 'e1b', level: 'BEG', make: function (r) { return memberPart(cbrtNeg(r.int(2, 5))); } },
        { id: 'e1c', level: 'BEG', make: function (r) { var q = r.int(2, 9), k = r.int(2, 9), tx = '\\frac{' + k * q + '}{' + q + '}'; return memberPart(item(tx, 'nat', t(tx + '=' + k) + ', a counting number.', { whyRat: t(tx + '=' + k) + ' — a ratio of integers that simplifies to a natural number.' })); } },
        { id: 'e1d', level: 'BEG', make: function (r) { var ab = gen(r, function () { return r.int(10, 98); }, function (n) { return n % 11 !== 0 && gcd(n, 99) > 1; }), fr = ex.norm(ab, 99), tx = '0.\\overline{' + ab + '}'; return memberPart(item(tx, 'rat', t(tx + '=\\frac{' + ab + '}{99}=' + ex.texRat(fr)) + ', a ratio of integers — not an integer.', { whyRat: 'The block ' + t(ab) + ' repeats, so it is rational: ' + t(tx + '=' + ex.texRat(fr)) + '.' })); } },
        { id: 'e1e', level: 'EMG', make: function (r) { return memberPart(sqrtDecSq(r)); } },
        { id: 'e1f', level: 'BEG', make: function (r) { return memberPart(negSqrt(r.int(2, 9))); } }] },
      { num: '2', stem: 'Same instructions. These take one more step of simplifying.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { var k = r.int(2, 9), c = scaled(k * k * k, 3), tx = '\\sqrt[3]{' + c + '}'; return memberPart(item(tx, 'rat', t(tx + '=0.' + k) + ' because ' + t('0.' + k + '^{3}=' + c) + ' — it terminates, but it isn’t an integer.', { whyRat: t(tx + '=0.' + k) + ' because ' + t('0.' + k + '^{3}=' + c) + '. It terminates, so it is rational.' })); } },
        { id: 'e2b', level: 'EMG', make: function (r) { var b = r.pick([2, 3, 5, 6, 7]), k = r.int(2, 5), tx = '\\frac{\\sqrt{' + b * k * k + '}}{\\sqrt{' + b + '}}'; return memberPart(item(tx, 'nat', t(tx + '=\\sqrt{\\frac{' + b * k * k + '}{' + b + '}}=\\sqrt{' + k * k + '}=' + k) + ', a counting number.', { whyRat: t(tx + '=\\sqrt{' + k * k + '}=' + k) + '. Simplify before you decide!' })); } },
        { id: 'e2c', level: 'EMG', make: function (r) { var x = r.pick(['\\pi', '\\pi', '\\sqrt{' + r.pick([3, 5, 7]) + '}', '\\sqrt[3]{' + r.pick([2, 4, 9]) + '}']), tx = x + '-' + x; return memberPart(item(tx, 'zero', t(tx + '=0') + ': any number minus itself is ' + t('0') + ' — whole, but ' + S('N') + ' starts at ' + t('1') + '.', { whyRat: t(tx + '=0') + ', which is rational.' })); } },
        { id: 'e2d', level: 'EMG', make: function (r) { var pq = r.pick([[3, 4], [2, 3], [1, 2], [2, 5], [4, 5], [3, 5]]), tx = '\\sqrt[3]{-\\frac{' + pq[0] * pq[0] * pq[0] + '}{' + pq[1] * pq[1] * pq[1] + '}}'; return memberPart(item(tx, 'rat', t(tx + '=-\\frac{' + pq[0] + '}{' + pq[1] + '}') + ', a ratio of integers — not an integer.', { neg: true, whyRat: t(tx + '=-\\frac{' + pq[0] + '}{' + pq[1] + '}') + ', a ratio of integers, so it is rational.' })); } },
        { id: 'e2e', level: 'EMG', make: function (r) { var a = r.pick([2, 3, 5, 6, 7]), m = r.int(2, 5), tx = '\\sqrt{' + a + '}\\times\\sqrt{' + a * m * m + '}'; return memberPart(item(tx, 'nat', t(tx + '=\\sqrt{' + a * a * m * m + '}=' + a * m) + ', a counting number.', { whyRat: t(tx + '=\\sqrt{' + a * a * m * m + '}=' + a * m) + '. Simplify first!' })); } },
        { id: 'e2f', level: 'EMG', make: function (r) { var k = r.pick([2, 3, 5, 6, 7, 10]), tx = '\\sqrt{' + k + '}+\\sqrt{' + k + '}'; return memberPart(item(tx, 'irr', t(tx + '=2\\sqrt{' + k + '}=' + fx(2 * Math.sqrt(k), 6) + '\\ldots') + ' — ' + t(k) + ' isn’t a perfect square, so it never terminates or repeats.', { whyIrr: t(tx + '=2\\sqrt{' + k + '}') + ', and ' + t(k) + ' isn’t a perfect square, so it is irrational.' })); } }] },
      { num: '3', stem: 'A number belongs to several sets at once, but only one of them is the <b>smallest</b> set that still contains it. Simplify, then name that single set.', parts: [
        { id: 'e3a', level: 'LIM', make: function (r) { return strictPart(r, sqrtPerfect(r.int(5, 15))); } },
        { id: 'e3b', level: 'BEG', make: function (r) { return strictPart(r, cbrtNeg(r.pick([2, 3, 4, 5, 10]))); } },
        { id: 'e3c', level: 'BEG', make: function (r) { var d = r.int(1, 8), fr = ex.norm(d, 9), tx = '0.\\overline{' + d + '}'; return strictPart(r, item(tx, 'rat', t(tx + '=' + ex.texRat(fr)) + ', rational but not an integer.', { whyRat: 'A repeating decimal is rational: ' + t(tx + '=' + ex.texRat(fr)) + '.' })); } },
        { id: 'e3d', level: 'LIM', make: function (r) { return strictPart(r, sqrtIrr(gen(r, function () { return r.int(2, 30); }, nonSq))); } },
        { id: 'e3e', level: 'BEG', make: function (r) { var k = r.int(2, 9), tx = '\\sqrt{' + k * k + '}-' + k; return strictPart(r, item(tx, 'zero', t(tx + '=' + k + '-' + k + '=0') + ': whole, but not natural.', { whyRat: t(tx + '=0') + ', which is rational.' })); } },
        { id: 'e3f', level: 'BEG', make: function (r) { var k = r.int(1, 9), sq = (k * k / 100).toFixed(2), tx = '-\\sqrt{' + sq + '}'; return strictPart(r, item(tx, 'rat', t(tx + '=-0.' + k) + ', a terminating decimal that isn’t an integer.', { neg: true, whyRat: t(tx + '=-0.' + k) + ' terminates, so it is rational.' })); } }] },

      /* ================= Extra practice B — Nesting ================= */
      { num: '4', section: 'Extra practice B — Nesting: why the sets sit inside one another', stem: 'Every natural number is a rational number, but not every rational number is a natural number.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) {
          var n = r.int(3, 250);
          return P.mc(r, 'Which explanation shows that <b>every</b> number in ' + S('N') + ' is also in ' + S('Q') + '?', [
            { html: 'Any natural number ' + t('n') + ' can be written as ' + t('\\frac{n}{1}') + ': a ratio of integers with ' + t('b=1\\ne 0') + '. For example, ' + t(n + '=\\frac{' + n + '}{1}') + '.', right: true },
            { html: 'Any natural number ' + t('n') + ' can be written as ' + t('\\frac{0}{n}') + '.', why: t('\\frac{0}{n}=0') + ', not ' + t('n') + '.' },
            { html: 'Every natural number is a perfect square, and roots of perfect squares are rational.', why: t('7') + ' is natural but not a perfect square. Being rational is about ratios of integers.' },
            { html: 'Natural numbers and rational numbers are both positive.', why: 'Rational numbers can be negative (' + t('-\\frac{1}{2}') + '), and being positive doesn’t make a number a ratio of integers.' }],
            'Any natural number ' + t('n') + ' equals ' + t('\\frac{n}{1}') + '. Here ' + t('a=n') + ' and ' + t('b=1') + ' are integers and ' + t('b\\ne 0') + ', so ' + t('n') + ' fits ' + t('Q=\\left\\{\\frac{a}{b},\\ a,b\\in I,\\ b\\ne 0\\right\\}') + '. This works for every natural number, so ' + S('N') + ' sits inside ' + S('Q') + '.',
            ['Look at the definition ' + t('Q=\\left\\{\\frac{a}{b},\\ a,b\\in I,\\ b\\ne 0\\right\\}') + '. How could you write ' + t(n) + ' in that form?'], 'why N inside Q');
        } },
        { id: 'e4b', level: 'BEG', make: function (r) {
          var a = r.int(3, 9), q = r.int(3, 9), p = gen(r, function () { return r.int(1, q - 1); }, function (p) { return gcd(p, q) === 1; });
          var cN = function (resp) { var o = readReal(resp); if (o.res) return o.res; var k = kindOf(o); if (!o.rational) return wrong('not-in-set', 'That one is irrational. You need a <b>rational</b> number.'); if (!(o.v < 0)) return wrong('sign', describe(o) + ' This box needs a <b>negative</b> rational number.'); return ok(); };
          var cP = function (resp) { var o = readReal(resp); if (o.res) return o.res; var k = kindOf(o); if (!o.rational) return wrong('not-in-set', 'That one is irrational. You need a <b>rational</b> number.'); if (!(o.v > 0)) return wrong('sign', 'This box needs a <b>positive</b> rational number.'); if (k === 'nat') return wrong('in-excluded-set', describe(o) + ' This box needs one that is <b>not</b> an integer, e.g. a fraction.'); return ok(); };
          var p2 = P.fields('Give two rational numbers that are <b>not</b> natural numbers. (Use the fraction key for fractions.)', [{ label: 'Negative', wide: true, mode: 'math', keys: 'fraction' }, { label: 'Positive, not an integer', wide: true, mode: 'math', keys: 'fraction' }], [cN, cP], ['-' + (2 * a + 1) + '/2', p + '/' + q],
            '(answers vary) e.g. ' + t('-\\frac{' + (2 * a + 1) + '}{2}') + ' and ' + t('\\frac{' + p + '}{' + q + '}'),
            'A rational number only has to be a ratio of integers ' + t('\\frac{a}{b}') + '. Nothing makes it positive or a whole count, but ' + t('N=\\{1,2,3,\\ldots\\}') + ' holds only positive whole counts. Negative: e.g. ' + t('-\\frac{' + (2 * a + 1) + '}{2}=-' + (a + 0.5)) + '. Positive but not an integer: e.g. ' + t('\\frac{' + p + '}{' + q + '}') + '. So ' + S('N') + ' is nested inside ' + S('Q') + ', but is not equal to it.',
            ['Rational numbers can be negative, and they can be fractions.'], 'two rationals not natural');
          p2.good = [['-3', '0.75'], ['-0.5', '7/2']]; p2.bad = [['3', '0.75'], ['-3', '4']];
          return p2;
        } }] },
      { num: '5', stem: 'The word <i>nested</i> means one set sits entirely inside the next.', parts: [
        { id: 'e5a', level: 'LIM', make: function (r) {
          var down = r.chance(0.3), items = ['N', 'W', 'I', 'Q', 'R'].map(function (x) { return { id: x, tex: SYM[x] }; }); if (down) items.reverse();
          return P.order(r, 'Put the five sets of the nesting chain in order, ' + (down ? 'largest to smallest' : 'smallest to largest') + '.', items,
            { first: down ? 'largest' : 'smallest', last: down ? 'smallest' : 'largest', sep: down ? '⊃' : '⊂', why: function (a, b) { var big = down ? a : b, small = down ? b : a; return 'Is every ' + NOUN[big] + ' ' + ONE[small] + '? No — but every ' + NOUN[small] + ' is ' + ONE[big] + '. So ' + S(small) + ' is the smaller set.'; } },
            t('N\\subset W\\subset I\\subset Q\\subset R') + '. Each set holds everything in the one before it, plus more: ' + S('W') + ' adds ' + t('0') + ', ' + S('I') + ' adds the negatives, ' + S('Q') + ' adds the non-integer ratios, ' + S('R') + ' adds the irrationals.',
            ['Start with the counting numbers ' + t('1, 2, 3, \\ldots') + '.'], 'nesting chain');
        } },
        { id: 'e5b', level: 'EMG', make: function (r) {
          return P.mc(r, 'Where does ' + S('Qb') + ' belong relative to the chain ' + t('N\\subset W\\subset I\\subset Q\\subset R') + '?', [
            { html: 'Beside the chain, inside ' + S('R') + ' only: an irrational decimal neither terminates nor repeats, so ' + S('Qb') + ' shares no numbers with ' + S('Q') + ' (or anything inside it).', right: true },
            { html: 'Between ' + S('Q') + ' and ' + S('R') + ', because ' + S('Qb') + ' contains all of ' + S('Q') + '.', why: S('Qb') + ' contains <b>no</b> rational numbers. ' + t('\\frac{1}{2}') + ' is in ' + S('Q') + ' but not in ' + S('Qb') + '.' },
            { html: 'Between ' + S('I') + ' and ' + S('Q') + ', because every integer is irrational.', why: 'Every integer is rational: ' + t('n=\\frac{n}{1}') + '.' },
            { html: 'Inside ' + S('N') + ', because irrational numbers like ' + t('\\sqrt{2}') + ' are positive.', why: t('\\sqrt{2}=1.414\\ldots') + ' isn’t a counting number, and ' + t('-\\sqrt{2}') + ' is irrational too.' }],
            S('Qb') + ' sits inside ' + S('R') + ' but <b>beside</b> the chain. A rational decimal terminates or repeats; an irrational one does neither. No number does both, so ' + S('Qb') + ' shares no members with ' + S('Q') + ', or with ' + S('I') + ', ' + S('W') + ', ' + S('N') + ' inside it.',
            ['Can a number be rational and irrational at the same time?'], 'where Q-bar belongs');
        } },
        { id: 'e5c', level: 'BEG', make: function (r) {
          var k = r.int(4, 15), tx = '\\sqrt{' + k * k + '}';
          var opts = ['N', 'W', 'I', 'Q', 'R'].map(function (x) { return { html: S(x), right: x === 'N', why: x === 'N' ? null : t(tx + '=' + k) + ' is in ' + S(x) + ', but “strictest” means the <b>smallest</b> set in the chain that still contains it.' }; });
          var p = P.mc(r, t(tx) + ' belongs to five sets. In the strictest sense it belongs to just one. Which one?', opts,
            t(tx + '=' + k) + ' is in ' + t('R, Q, I, W, N') + '. “Strictest” means the smallest set in the nesting chain that still contains the number — naming it tells you the most. Strictest set: ' + S('N') + '.', ['Simplify, then find the smallest set it fits in.'], 'strictest set sqrt ' + k * k, true);
          p.input.columns = 5; return p;
        } }] },
      { num: '6', stem: 'The diagram shows the real number system. Simplify where you need to, then choose the <b>innermost</b> region each number belongs in.', parts: [
        { id: 'e6', level: 'EMG', make: function (r) {
          var k = r.int(2, 5), q = r.pick([3, 7, 8, 9]), p = gen(r, function () { return r.int(1, q - 1); }, function (p) { return gcd(p, q) === 1; }), d = r.int(2, 6), n = gen(r, function () { return r.int(2, 30); }, nonCube), m = r.int(2, 9);
          var its = [sqrtPerfect(r.int(5, 10)), item('-\\sqrt[3]{' + k * k * k + '}', 'negint', t('-\\sqrt[3]{' + k * k * k + '}=-' + k) + ', a negative integer.', { whyRat: t('-\\sqrt[3]{' + k * k * k + '}=-' + k) + ' — a perfect cube root is rational.' }), zeroItem(r, r.int(2, 9)),
            fracItem(p, q, false), constItem(r, ['-\\pi', '\\pi', '2\\pi', 'e']), item('\\sqrt{' + (d * d / 100).toFixed(2) + '}', 'rat', t('\\sqrt{' + (d * d / 100).toFixed(2) + '}=0.' + d) + ', rational but not an integer.', { whyRat: t('\\sqrt{' + (d * d / 100).toFixed(2) + '}=0.' + d) + ' because ' + t('0.' + d + '^{2}=' + (d * d / 100).toFixed(2)) + '. That is rational.' }),
            item('\\sqrt[3]{' + n + '}', 'irr', t(n) + ' is not a perfect cube, so ' + t('\\sqrt[3]{' + n + '}') + ' is irrational.', { whyIrr: t(n) + ' is not a perfect cube, so ' + t('\\sqrt[3]{' + n + '}') + ' never terminates or repeats.' }),
            item('\\frac{' + m * 3 + '}{3}', 'nat', t('\\frac{' + m * 3 + '}{3}=' + m) + ', a counting number.', { whyRat: t('\\frac{' + m * 3 + '}{3}=' + m) + ' — simplify first.' })];
          return regionTable(its, 'Choose the innermost region for each number.', 'Venn placement of 8 numbers', true);
        } }] },
      { num: '7', stem: 'For each description, decide whether <b>no number</b>, <b>exactly one number</b>, or <b>infinitely many numbers</b> fit it.', parts: [
        { id: 'e7a', level: 'BEG', make: function (r) { return countPart(r, r.pick([['In ' + S('W') + ' but not in ' + S('N') + '.', 'one', 'Only ' + t('0') + ': ' + t('W=\\{0,1,2,\\ldots\\}') + ' and ' + t('N=\\{1,2,3,\\ldots\\}') + ' differ only by ' + t('0') + '.'], ['In ' + S('I') + ', but neither positive nor negative.', 'one', 'Only ' + t('0') + '.']])); } },
        { id: 'e7b', level: 'BEG', make: function (r) { return countPart(r, r.pick([['In ' + S('I') + ' but not in ' + S('W') + '.', 'inf', 'Every negative integer, e.g. ' + t('-3') + ': ' + S('I') + ' adds the negatives to ' + S('W') + '.'], ['In ' + S('I') + ' but not in ' + S('N') + '.', 'inf', t('0') + ' and every negative integer, e.g. ' + t('-3') + '.']])); } },
        { id: 'e7c', level: 'BEG', make: function (r) { return countPart(r, r.pick([['In ' + S('Q') + ' but not in ' + S('I') + '.', 'inf', 'Any ratio of integers that isn’t a whole count, e.g. ' + t('\\frac{2}{5}') + '.'], ['In ' + S('R') + ' but not in ' + S('Q') + '.', 'inf', 'Every irrational number, e.g. ' + t('\\sqrt{2}') + ' or ' + t('\\pi') + '.']])); } },
        { id: 'e7d', level: 'EMG', make: function (r) { return countPart(r, r.pick([['In ' + S('I') + ' but not in ' + S('Q') + '.', 'none', 'Every integer ' + t('n') + ' is ' + t('\\frac{n}{1}') + ', so ' + S('I') + ' is nested inside ' + S('Q') + '.'], ['In ' + S('N') + ' but not in ' + S('W') + '.', 'none', S('N') + ' is nested inside ' + S('W') + ': every natural number is whole.']])); } },
        { id: 'e7e', level: 'EMG', make: function (r) { return countPart(r, r.pick([['In ' + S('R') + ' but in neither ' + S('Q') + ' nor ' + S('Qb') + '.', 'none', t('R=\\{Q\\text{ and }\\overline{Q}\\}') + ': every real number is one or the other.'], ['In both ' + S('Q') + ' and ' + S('Qb') + '.', 'none', 'A decimal can’t both terminate/repeat and not — the two sets don’t overlap.']])); } },
        { id: 'e7f', level: 'BEG', make: function (r) { return countPart(r, r.pick([['In ' + S('Qb') + ' but not in ' + S('R') + '.', 'none', S('Qb') + ' is nested inside ' + S('R') + ' — every irrational number is real.'], ['In both ' + S('Qb') + ' and ' + S('I') + '.', 'none', 'Every integer is rational, and no rational number is irrational.']])); } }] },

      /* ================= Extra practice C — Always, sometimes, never ================= */
      { num: '8', section: 'Extra practice C — Always, sometimes, or never', stem: 'Complete each statement with <i>always</i>, <i>sometimes</i> or <i>never</i>. (For “sometimes”, think of one example that works and one that doesn’t.)', parts: [
        { id: 'e8a', level: 'EMG', make: function (r) { var V = [['The sum of two integers is ___ a natural number.', asnD('sometimes', t('4+3=7') + ' is natural.', t('4+(-9)=-5') + ' is not.')], ['The product of two integers is ___ a natural number.', asnD('sometimes', t('3\\times 4=12') + ' is natural.', t('(-3)\\times 4=-12') + ' is not.')], ['The difference of two natural numbers is ___ a natural number.', asnD('sometimes', t('9-2=7') + ' is natural.', t('2-9=-7') + ' is not.')]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN ' + v[0]); } },
        { id: 'e8b', level: 'EMG', make: function (r) { var V = [['The quotient of two integers is ___ an integer.', asnD('sometimes', t('\\frac{-12}{4}=-3') + ' is an integer.', t('\\frac{4}{-12}=-\\frac{1}{3}') + ' is not.')], ['The quotient of two natural numbers is ___ a natural number.', asnD('sometimes', t('15\\div 5=3') + ' is natural.', t('5\\div 15=\\frac{1}{3}') + ' is not.')]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN ' + v[0]); } },
        { id: 'e8c', level: 'PRG', make: function (r) { var V = [['An irrational number times an irrational number is ___ irrational.', asnD('sometimes', t('\\sqrt{2}\\times\\sqrt{3}=\\sqrt{6}') + ' is irrational.', t('\\sqrt{2}\\times\\sqrt{2}=2') + ' is rational.')], ['An irrational number plus an irrational number is ___ irrational.', asnD('sometimes', t('\\sqrt{2}+\\sqrt{3}') + ' is irrational.', t('\\pi+(-\\pi)=0') + ' is rational.')], ['An irrational number divided by an irrational number is ___ irrational.', asnD('sometimes', t('\\sqrt{6}\\div\\sqrt{2}=\\sqrt{3}') + ' is irrational.', t('\\sqrt{5}\\div\\sqrt{5}=1') + ' is rational.')]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN ' + v[0]); } },
        { id: 'e8d', level: 'PRG', make: function (r) { var why = 'If a rational ' + t('q') + ' plus an irrational ' + t('x') + ' gave a rational ' + t('r') + ', then ' + t('x=r-q') + ' would be rational — impossible. e.g. ' + t('1+\\sqrt{2}=2.414\\ldots'); var V = [['The sum of a rational number and an irrational number is ___ irrational.', asnD('always', '', '', why)], ['The sum of a rational number and an irrational number is ___ rational.', asnD('never', '', '', why)], ['The difference of a rational number and an irrational number is ___ irrational.', asnD('always', '', '', 'If ' + t('q-x=r') + ' with ' + t('q, r') + ' rational, then ' + t('x=q-r') + ' would be rational — impossible. e.g. ' + t('3-\\sqrt{2}=1.585\\ldots'))]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN ' + v[0]); } },
        { id: 'e8e', level: 'EMG', make: function (r) { var V = [['A number whose decimal never terminates is ___ in the set ' + S('Qb') + '.', asnD('sometimes', t('\\pi=3.141\\,59\\ldots') + ' never terminates and is irrational.', t('0.\\overline{45}') + ' never terminates, but it repeats, so it is ' + t('\\frac{5}{11}\\in Q') + '.')], ['A number whose decimal terminates is ___ in the set ' + S('Qb') + '.', asnD('never', '', '', 'A terminating decimal is a fraction over a power of 10, e.g. ' + t('0.37=\\frac{37}{100}') + ' — always rational.')], ['A number whose decimal repeats is ___ in the set ' + S('Q') + '.', asnD('always', '', '', 'Every repeating decimal can be written as a fraction, e.g. ' + t('0.\\overline{45}=\\frac{45}{99}') + '.')]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN decimal'); } },
        { id: 'e8f', level: 'PRG', make: function (r) { var V = [['A rational number times an irrational number is ___ irrational.', asnD('sometimes', t('2\\times\\pi=2\\pi') + ' is irrational.', t('0\\times\\pi=0') + ' is rational. (' + t('0') + ' is the only rational that breaks it.)')], ['A non-zero rational number times an irrational number is ___ irrational.', asnD('always', '', '', 'If ' + t('q\\times x=r') + ' with ' + t('q\\ne 0') + ' and ' + t('r') + ' rational, then ' + t('x=\\frac{r}{q}') + ' would be rational — impossible.')]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN rational times irrational'); } },
        { id: 'e8g', level: 'BEG', make: function (r) { var pr = r.pick([['Qb', 'R'], ['Qb', 'R'], ['R', 'Qb'], ['Qb', 'I']]); return asnPart(r, 'A number in ' + S(pr[0]) + ' is ___ in the set ' + S(pr[1]) + '.', setASN(pr[0], pr[1]), 'ASN in ' + pr[0] + ' in ' + pr[1]); } },
        { id: 'e8h', level: 'BEG', make: function (r) { var V = [['The square root of a rational number is ___ rational.', asnD('sometimes', t('\\sqrt{\\frac{9}{16}}=\\frac{3}{4}') + ' is rational.', t('2') + ' is rational, but ' + t('\\sqrt{2}=1.414\\ldots') + ' is irrational.')], ['The cube root of a rational number is ___ rational.', asnD('sometimes', t('\\sqrt[3]{\\frac{8}{27}}=\\frac{2}{3}') + ' is rational.', t('\\sqrt[3]{2}') + ' is irrational.')], ['The square root of a perfect square is ___ rational.', asnD('always', '', '', 'If ' + t('n=k^{2}') + ' then ' + t('\\sqrt{n}=k') + ', an integer — rational.')]]; var v = r.pick(V); return asnPart(r, v[0], v[1], 'ASN roots of rationals'); } }] },

      /* ================= Extra practice D — Error analysis ================= */
      { num: '9', section: 'Extra practice D — Error analysis', stem: function (sh) { return 'A student writes: “' + t('\\sqrt{' + sh.k * sh.k + '}') + ' has a radical sign, so it is irrational. It goes in ' + S('Qb') + '.”'; },
        shared: function (r) { return { k: r.int(3, 12) }; }, // k ≥ 3: for k = 2 the "√n = n/2" distractor would be true (√4 = 2)
        parts: [
          { id: 'e9a', level: 'EMG', make: function (r, sh) {
            var k = sh.k, n = k * k;
            return P.mc(r, 'What is the mistake?', [
              { html: 'The radical sign decides nothing: ' + t(n + '=' + k + '^{2}') + ' is a perfect square, so ' + t('\\sqrt{' + n + '}=' + k) + ' is rational.', right: true },
              { html: 'There is no mistake: every number written with a radical sign is irrational.', why: 'Work it out: ' + t('\\sqrt{' + n + '}') + ' — which number squared is ' + t(n) + '?' },
              { html: t('\\sqrt{' + n + '}') + ' is irrational, but it also belongs in ' + S('Q') + '.', why: 'No number is in both ' + S('Q') + ' and ' + S('Qb') + '.' },
              { html: t('\\sqrt{' + n + '}=' + n / 2) + ', so it is rational.', why: 'A square root isn’t half: ' + t('(' + n / 2 + ')^{2}=' + n * n / 4) + '.' }],
              'What matters is whether ' + t(n) + ' is a perfect square. It is (' + t(k + '^{2}=' + n) + '), so ' + t('\\sqrt{' + n + '}=' + k) + ' is rational.', ['Evaluate ' + t('\\sqrt{' + n + '}') + ' first.'], 'radical sign error');
          } },
          { id: 'e9b', level: 'BEG', make: function (r, sh) { return memberPart(sqrtPerfect(sh.k), 'Check every set ' + t('\\sqrt{' + sh.k * sh.k + '}') + ' actually belongs to.'); } },
          { id: 'e9c', level: 'EMG', make: function (r) {
            return P.mc(r, 'Which rule reliably decides when ' + t('\\sqrt{n}') + ', ' + t('n\\in N') + ', is irrational?', [
              { html: t('\\sqrt{n}') + ' is irrational exactly when ' + t('n') + ' is <b>not a perfect square</b>.', right: true },
              { html: t('\\sqrt{n}') + ' is irrational exactly when ' + t('n') + ' is odd.', why: t('\\sqrt{9}=3') + ' is rational, and ' + t('\\sqrt{8}') + ' is irrational.' },
              { html: t('\\sqrt{n}') + ' is irrational exactly when ' + t('n') + ' is prime.', why: 'It is irrational for primes, but also for composites like ' + t('\\sqrt{6}') + ' — the rule has to cover every ' + t('n') + '.' },
              { html: t('\\sqrt{n}') + ' is irrational exactly when ' + t('n>100') + '.', why: t('\\sqrt{144}=12') + ' is rational, and ' + t('\\sqrt{5}') + ' is irrational.' }],
              t('\\sqrt{n}') + ' is rational exactly when ' + t('n') + ' is a perfect square (' + t('1, 4, 9, 16, 25, \\ldots') + '). For every other ' + t('n\\in N') + ', ' + t('\\sqrt{n}') + ' is irrational, e.g. ' + t('\\sqrt{15}') + ', ' + t('\\sqrt{17}') + '.', ['Test each rule on ' + t('\\sqrt{9}') + ', ' + t('\\sqrt{6}') + ' and ' + t('\\sqrt{144}') + '.'], 'rule for irrational roots');
          } }] },
      { num: '10', stem: 'A second student writes: “' + t('0') + ' is a natural number, because you can count to it.”', parts: [
        { id: 'e10a', level: 'BEG', make: function (r) {
          return P.mc(r, 'What is the mistake?', [
            { html: t('N=\\{1,2,3,\\ldots\\}') + ': the natural numbers are the counting numbers, and counting starts at ' + t('1') + '. So ' + t('0\\notin N') + '.', right: true },
            { html: 'There is no mistake: ' + t('N=\\{0,1,2,\\ldots\\}') + '.', why: 'That is the set ' + S('W') + ' of whole numbers. In this course ' + S('N') + ' starts at ' + t('1') + '.' },
            { html: t('0') + ' isn’t a real number, so it can’t be natural.', why: t('0') + ' is a real number — it is the middle of the number line.' },
            { html: t('0') + ' is negative, so it can’t be natural.', why: t('0') + ' is neither positive nor negative.' }],
            'In this course ' + t('N=\\{1,2,3,\\ldots\\}') + ' — counting starts at ' + t('1') + ', never at ' + t('0') + '. So ' + t('0\\notin N') + '. ' + S('W') + ' and ' + S('N') + ' differ only by ' + t('0') + '.', ['What is the first number in ' + S('N') + '?'], 'zero natural error');
        } },
        { id: 'e10b', level: 'BEG', make: function (r) { var it = zeroItem(r, r.int(2, 9)); return memberPart(it, 'Check every set ' + t(it.tex) + ' <b>does</b> belong to.'); } }] },
      { num: '11', stem: function (sh) { return 'A third student writes: “' + t('0.\\overline{' + sh.ab + '}') + ' is irrational, because its decimal goes on forever.”'; },
        shared: function (r) { return { ab: gen(r, function () { return r.int(10, 98); }, function (n) { return n % 11 !== 0 && gcd(n, 99) > 1; }) }; },
        parts: [
          { id: 'e11a', level: 'BEG', make: function (r, sh) {
            return P.mc(r, 'Which <b>two</b> conditions must a decimal meet before it is irrational?', [
              { html: 'It must be non-terminating <b>and</b> non-repeating.', right: true },
              { html: 'It must be non-terminating <b>or</b> non-repeating.', why: t('0.\\overline{' + sh.ab + '}') + ' is non-terminating, but it repeats — and it is rational. Both conditions are needed.' },
              { html: 'It must be non-terminating and have a bar over it.', why: 'A bar shows a block that <b>repeats</b> — that makes a decimal rational.' },
              { html: 'It must be non-terminating and greater than ' + t('1') + '.', why: 'Size has nothing to do with it: ' + t('\\frac{\\pi}{10}=0.314\\ldots') + ' is irrational.' }],
              'Going on forever is only half the test. An irrational decimal is (1) non-terminating <b>and</b> (2) non-repeating. ' + t('0.\\overline{' + sh.ab + '}') + ' never terminates, but the block ' + t(sh.ab) + ' repeats, so it fails (2): it is rational.', ['Think of ' + t('0.\\overline{3}=\\frac{1}{3}') + '. It goes on forever — is it irrational?'], 'two conditions for irrational');
          } },
          { id: 'e11b', level: 'PRG', make: function (r, sh) {
            var ab = sh.ab, fr = ex.norm(ab, 99);
            var p = P.fraction('Convert ' + t('0.\\overline{' + ab + '}') + ' to a fraction in lowest terms.', fr, { diag: function (v) { if (Math.abs(v - ab / 100) < 1e-9) return { code: 'flip-99', hint: t('\\frac{' + ab + '}{100}=0.' + ab) + ' stops. For a two-digit repeating block, use ' + t('100x-x=99x') + '.' }; return null; } },
              'Let ' + t('x=0.\\overline{' + ab + '}') + '. Then ' + t('100x=' + ab + '.\\overline{' + ab + '}') + ', so ' + t('100x-x=' + ab) + ', ' + t('99x=' + ab) + ' and ' + t('x=\\frac{' + ab + '}{99}=' + ex.texRat(fr)) + ' (divide the top and bottom by ' + t(gcd(ab, 99)) + '). A ratio of integers, so it is rational.',
              ['Let ' + t('x=0.\\overline{' + ab + '}') + ' and multiply by ' + t('100') + '. Subtract to get rid of the repeating part.'], 'repeating to fraction 0.(' + ab + ')');
            p.bad = ['\\frac{' + ab + '}{100}']; return p;
          } }] },

      /* ================= Extra practice E — Closure ================= */
      { num: '12', section: 'Extra practice E — Closure', stem: 'A set is <b>closed</b> under an operation if applying the operation to any two members always gives a result still in the set. One counterexample shows a set is not closed.', parts: [
        { id: 'e12a', level: 'PRG', make: function (r) {
          var a = r.int(2, 6), b = a + r.int(1, 6), c = r.int(2, 4), d = c + r.int(2, 6), ce = t(a + '-' + b + '=-' + (b - a));
          return P.mc(r, 'Is ' + S('N') + ' closed under subtraction? If not, what is the smallest set that <b>is</b> closed under subtraction?', [
            { html: 'No: ' + ce + ', which is not in ' + S('N') + '. Smallest closed set: ' + S('I') + '.', right: true },
            { html: 'No: ' + ce + ', which is not in ' + S('N') + '. Smallest closed set: ' + S('W') + '.', why: S('W') + ' isn’t closed under subtraction either: ' + t(c + '-' + d + '=-' + (d - c)) + '.' },
            { html: 'No: ' + ce + ', which is not in ' + S('N') + '. Smallest closed set: ' + S('Q') + '.', why: S('Q') + ' is closed under subtraction, but there is a smaller set that already works.' },
            { html: 'Yes: subtracting two natural numbers always gives a natural number.', why: 'Try ' + t(a + '-' + b) + '.' }],
            '<b>No.</b> Counterexample: ' + ce + ', and ' + t('-' + (b - a) + '\\notin N') + '. ' + S('W') + ' fails too (' + t(c + '-' + d + '=-' + (d - c)) + '), but the difference of two integers is always an integer. Smallest set closed under subtraction: ' + S('I') + '.', ['Try subtracting a bigger natural number from a smaller one.'], 'N closed under subtraction');
        } },
        { id: 'e12b', level: 'PRG', make: function (r) {
          var b = r.int(2, 7), a = gen(r, function () { return r.int(1, 15); }, function (a) { return a % b !== 0; }), fr = ex.norm(a, b), ce = t(a + '\\div ' + b + '=' + ex.texRat(fr));
          return P.mc(r, 'Is ' + S('I') + ' closed under division? If not, what is the smallest set that <b>is</b> closed under division by non-zero numbers?', [
            { html: 'No: ' + ce + ', which is not in ' + S('I') + '. Smallest closed set: ' + S('Q') + '.', right: true },
            { html: 'No: ' + ce + ', which is not in ' + S('I') + '. Smallest closed set: ' + S('R') + '.', why: S('R') + ' works, but ' + S('Q') + ' is smaller and already closed: ' + t('\\frac{a}{b}\\div\\frac{c}{d}=\\frac{ad}{bc}') + '.' },
            { html: 'No: ' + ce + ', which is not in ' + S('I') + '. Smallest closed set: ' + S('W') + '.', why: S('W') + ' isn’t closed under division either: ' + t('2\\div 5=\\frac{2}{5}') + '.' },
            { html: 'Yes: dividing integers always gives an integer.', why: 'Try ' + t(a + '\\div ' + b) + '.' }],
            '<b>No.</b> Counterexample: ' + ce + ', which is not an integer. Dividing ' + t('\\frac{a}{b}') + ' by a non-zero ' + t('\\frac{c}{d}') + ' gives ' + t('\\frac{ad}{bc}') + ', another ratio of integers. Smallest set closed under division by non-zero numbers: ' + S('Q') + '.', ['Try a division that doesn’t come out evenly.'], 'I closed under division');
        } }] },
      { num: '13', stem: 'Closed or not closed?', parts: [
        { id: 'e13a', level: 'BEG', make: function (r) { return closedPart(r, r.pick([['N', '+'], ['N', '×'], ['W', '+'], ['W', '×']])); } },
        { id: 'e13b', level: 'BEG', make: function (r) { return closedPart(r, r.pick([['W', '−'], ['N', '−']])); } },
        { id: 'e13c', level: 'BEG', make: function (r) { return closedPart(r, r.pick([['I', '×'], ['I', '+'], ['I', '−']])); } },
        { id: 'e13d', level: 'PRG', make: function (r) { return closedPart(r, r.pick([['Q', '÷'], ['R', '÷']])); } },
        { id: 'e13e', level: 'EMG', make: function (r) { return closedPart(r, r.pick([['R', '−'], ['R', '+'], ['R', '×'], ['Q', '−'], ['Q', '+'], ['Q', '×']])); } },
        { id: 'e13f', level: 'BEG', make: function (r) { return closedPart(r, r.pick([['W', '÷'], ['N', '÷'], ['I', '÷']])); } }] },
      { num: '14', stem: 'The irrationals behave worse than any other set here.', parts: [
        { id: 'e14a', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 5, 7]);
          return P.mc(r, 'Which example shows that ' + S('Qb') + ' is <b>not</b> closed under addition?', [
            { html: t(r.pick(['\\pi+(-\\pi)=0', '\\sqrt{' + k + '}+(-\\sqrt{' + k + '})=0', '(1+\\sqrt{' + k + '})+(1-\\sqrt{' + k + '})=2'])), right: true },
            { html: t('\\sqrt{2}+\\sqrt{3}=3.146\\ldots'), why: 'The answer is irrational, so this example stays inside ' + S('Qb') + '. A counterexample needs a <b>rational</b> answer.' },
            { html: t('\\pi+\\pi=2\\pi'), why: t('2\\pi') + ' is irrational, so this doesn’t break closure.' },
            { html: t('\\sqrt{' + k + '}+1'), why: t('1') + ' is rational. Closure is about adding two members of ' + S('Qb') + '.' }],
            '<b>Not closed.</b> Two irrational numbers can cancel: e.g. ' + t('\\pi+(-\\pi)=0') + ', and ' + t('0') + ' is rational.', ['Look for two irrational numbers whose sum is rational.'], 'Qbar not closed +');
        } },
        { id: 'e14b', level: 'PRG', make: function (r) {
          var k = r.pick([2, 3, 5, 7]);
          return P.mc(r, 'Which example shows that ' + S('Qb') + ' is <b>not</b> closed under multiplication?', [
            { html: t(r.pick(['\\sqrt{' + k + '}\\times\\sqrt{' + k + '}=' + k, '\\sqrt{2}\\times\\sqrt{8}=4', '\\sqrt{3}\\times\\sqrt{12}=6'])), right: true },
            { html: t('\\sqrt{2}\\times\\sqrt{3}=\\sqrt{6}'), why: t('\\sqrt{6}') + ' is irrational, so this stays inside ' + S('Qb') + '.' },
            { html: t('\\pi\\times\\pi=\\pi^{2}'), why: t('\\pi^{2}') + ' is irrational.' },
            { html: t('2\\times\\sqrt{' + k + '}=2\\sqrt{' + k + '}'), why: t('2') + ' is rational, so this isn’t two members of ' + S('Qb') + '.' }],
            '<b>Not closed.</b> e.g. ' + t('\\sqrt{2}\\times\\sqrt{2}=\\sqrt{4}=2') + ': both factors are irrational, but the product is rational.', ['Look for two irrational numbers whose product is rational.'], 'Qbar not closed ×');
        } },
        { id: 'e14c', level: 'EMG', make: function (r) {
          return P.mc(r, 'Why does ' + S('Qb') + ' fail where ' + S('Q') + ' succeeds?', [
            { html: S('Q') + ' is built from ratios of integers, and ' + t('+,-,\\times,\\div') + ' of two ratios is again a ratio. ' + S('Qb') + ' is defined only by what it is <b>not</b>, so two irrationals can cancel and land back in ' + S('Q') + '.', right: true },
            { html: 'Irrational numbers are too large to add or multiply.', why: t('\\sqrt{2}=1.414\\ldots') + ' isn’t large. Think about what defines each set.' },
            { html: S('Qb') + ' is not part of the real numbers.', why: S('Qb') + ' is nested inside ' + S('R') + '.' },
            { html: 'You can’t do arithmetic with irrational numbers.', why: 'You can: ' + t('\\sqrt{2}\\times\\sqrt{3}=\\sqrt{6}') + '. The problem is that the answer can leave the set.' }],
            S('Q') + ' is defined by a structure (ratios of integers) that survives every operation. ' + S('Qb') + ' is defined by what it lacks (no terminating or repeating decimal), so irrational parts can cancel: ' + t('\\sqrt{2}\\times\\sqrt{2}=2') + ', ' + t('\\pi+(-\\pi)=0') + '.', ['What does a rational number look like? What does an irrational number look like?'], 'why Qbar fails');
        } }] },

      /* ================= Extra practice F — Stretch, MC and NR ================= */
      { num: '15', section: 'Extra practice F — Stretch, multiple choice and numerical response', stem: '<b>Stretch.</b> Find a number for each description.', parts: [
        { id: 'e15a', level: 'BEG', make: function (r) { var q = r.int(3, 9), p = gen(r, function () { return r.int(1, 2 * q); }, function (p) { return gcd(p, q) === 1 && p % q !== 0; }); return findPart('In ' + S('Q') + ' but not in ' + S('I') + '.', { inS: 'Q', notS: 'I', sol: 'e.g. ' + t('\\frac{' + p + '}{' + q + '}') + ': it is a ratio of integers, but not a whole count, so it is not an integer.', hints: ['Think of a fraction that doesn’t simplify to an integer.'] }, '\\frac{' + p + '}{' + q + '}', ['0.75'], ['4', '\\sqrt{3}'], 'Q not I'); } },
        { id: 'e15b', level: 'BEG', make: function (r) { var k = r.int(2, 9); return findPart('In ' + S('I') + ' but not in ' + S('W') + '.', { inS: 'I', notS: 'W', sol: 'e.g. ' + t('-' + k) + ': it is negative, and ' + t('W=\\{0,1,2,\\ldots\\}') + ' contains no negatives.', hints: ['Which integers are not whole numbers?'] }, '-' + k, ['-1'], ['0', '3'], 'I not W'); } },
        { id: 'e15c', level: 'BEG', make: function (r) { var n = r.pick([2, 3, 5, 6, 7]); return findPart('In ' + S('R') + ' but not in ' + S('Q') + '.', { inS: 'R', notS: 'Q', sol: 'e.g. ' + t('\\sqrt{' + n + '}') + ': ' + t(n) + ' is not a perfect square, so ' + t('\\sqrt{' + n + '}') + ' never terminates or repeats and can’t be written as ' + t('\\frac{a}{b}') + '.', hints: ['Think of a square root of a number that isn’t a perfect square.'] }, '\\sqrt{' + n + '}', ['\\pi'], ['\\sqrt{9}', '0.\\overline{3}'], 'R not Q'); } },
        { id: 'e15e', level: 'EMG', make: function (r) {
          return P.mc(r, 'Why is there no number that is in ' + S('Q') + ' and in ' + S('Qb') + ' at the same time? (Base it on the definitions, not on examples.)', [
            { html: 'A number is in ' + S('Q') + ' when its decimal terminates or repeats, and in ' + S('Qb') + ' when it does neither. These are exact opposites, so no number can be in both. Together they make up ' + S('R') + '.', right: true },
            { html: 'Because ' + S('Qb') + ' is nested inside ' + S('Q') + '.', why: 'If ' + S('Qb') + ' were inside ' + S('Q') + ', every irrational number would also be rational — the opposite of what we want.' },
            { html: 'Because nobody has found an example yet.', why: 'The question asks for a reason from the definitions — and the definitions settle it for good.' },
            { html: 'Because ' + S('Q') + ' and ' + S('Qb') + ' together make up only part of ' + S('R') + '.', why: 'Together they make up <b>all</b> of ' + S('R') + ': ' + t('R=\\{Q\\text{ and }\\overline{Q}\\}') + '.' }],
            'By definition a number is in ' + S('Q') + ' when its decimal <b>terminates or repeats</b>, and in ' + S('Qb') + ' when it <b>neither terminates nor repeats</b>. A number has one decimal expansion, and it either does or doesn’t — so ' + S('Q') + ' and ' + S('Qb') + ' share no members. Together they make up all the real numbers: ' + t('R=\\{Q\\text{ and }\\overline{Q}\\}') + '.', ['Compare the two definitions word for word.'], 'Q and Qbar disjoint');
        } }] },
      { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e16', level: 'PRG', make: function (r) {
          var k = r.int(5, 9), c = r.int(2, 4), q = r.int(3, 9), b = r.pick([2, 3, 5]), m = r.int(2, 4), d = r.pick([3, 6]), h = r.pick([11, 13, 15, 17]), irr = gen(r, function () { return r.int(10, 40); }, nonSq);
          var ints = [['\\sqrt{' + k * k + '}', t('\\sqrt{' + k * k + '}=' + k)], ['\\sqrt[3]{-' + c * c * c + '}', t('\\sqrt[3]{-' + c * c * c + '}=-' + c)], ['\\frac{' + q * 7 + '}{7}', t('\\frac{' + q * 7 + '}{7}=' + q)], ['\\frac{\\sqrt{' + b * m * m + '}}{\\sqrt{' + b + '}}', t('\\frac{\\sqrt{' + b * m * m + '}}{\\sqrt{' + b + '}}=\\sqrt{' + m * m + '}=' + m)], ['-\\sqrt{' + (k + 1) * (k + 1) + '}', t('-\\sqrt{' + (k + 1) * (k + 1) + '}=-' + (k + 1))]];
          var non = [['0.\\overline{' + d + '}', t('0.\\overline{' + d + '}=' + ex.texRat(ex.norm(d, 9)))], ['\\sqrt{' + (h * h / 100).toFixed(2) + '}', t('\\sqrt{' + (h * h / 100).toFixed(2) + '}=' + (h / 10))], ['\\sqrt{' + irr + '}', t('\\sqrt{' + irr + '}') + ' is irrational']];
          var ni = r.pick([3, 4, 4, 4, 5]), list = r.shuffle(r.sample(ints, ni).concat(r.sample(non, 6 - ni)));
          return P.mc(r, 'How many of the numbers ' + t(list.map(function (x) { return x[0]; }).join(',\\quad ')) + ' belong to the set ' + S('I') + '?',
            [3, 4, 5, 6].map(function (n) { return { html: t(n), right: n === ni, why: n === ni ? null : n > ni ? 'One of the numbers you counted isn’t an integer — simplify each one carefully.' : 'You missed one: some of these simplify to integers. Simplify each one.' }; }),
            list.map(function (x) { return x[1] + (ints.indexOf(x) >= 0 ? ' — integer' : ' — not an integer'); }).join('<br>') + '<br>So ' + t(ni) + ' of the ' + t(6) + ' are in ' + S('I') + '.', ['Simplify each number first, then ask: is it an integer?'], 'how many in I', true);
        } }] },
      { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) { return falseStmtMC(r); } }] },
      { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e18', level: 'EMG', make: function (r) {
          var k = r.int(10, 15), c = r.int(2, 6), ab = gen(r, function () { return r.int(12, 98); }, function (n) { return n % 11 !== 0; }), j = r.int(1, 9), b = r.pick([2, 3, 5]), m = r.int(2, 5), h = r.int(11, 19);
          var rats = [['\\sqrt{' + k * k + '}', t('\\sqrt{' + k * k + '}=' + k)], ['-\\frac{8}{3}', t('-\\frac{8}{3}')], ['\\sqrt[3]{-' + c * c * c + '}', t('=-' + c)], ['0.\\overline{' + ab + '}', t('0.\\overline{' + ab + '}=\\frac{' + ab + '}{99}')], ['\\sqrt{' + (j * j / 100).toFixed(2) + '}', t('=' + j / 10)], ['0', t('0')], ['\\frac{\\sqrt{' + b * m * m + '}}{\\sqrt{' + b + '}}', t('=' + m)], ['-\\sqrt{' + (h * h / 100).toFixed(2) + '}', t('=-' + h / 10)]];
          var irrs = [['\\pi', ''], ['\\sqrt{20}', ''], ['2\\sqrt{5}', ''], ['\\sqrt[3]{9}', ''], ['\\sqrt{' + r.pick([7, 11, 13]) + '}', ''], ['-\\sqrt[3]{' + r.pick([4, 10, 25]) + '}', '']];
          var nr = r.pick([6, 7, 8, 8]), list = r.shuffle(r.sample(rats, nr).concat(r.sample(irrs, 12 - nr)));
          return P.nr('Of the twelve numbers ' + list.map(function (x) { return '<span class="nw">' + t(x[0]) + '</span>'; }).join(', ') + ', the number of them that belong to the set ' + S('Q') + ' is ________.', nr,
            function (v) { return v === 12 - nr ? { code: 'as-irrational', hint: 'That’s how many are <b>irrational</b>. Count the rational ones.' } : null; },
            'Rational: ' + list.filter(function (x) { return rats.indexOf(x) >= 0; }).map(function (x) { return t(x[0]); }).join(', ') + ' — ' + t(nr) + ' numbers.<br>Irrational: ' + list.filter(function (x) { return irrs.indexOf(x) >= 0; }).map(function (x) { return t(x[0]); }).join(', ') + ' — ' + t(12 - nr) + ' numbers. Check: ' + t(nr + '+' + (12 - nr) + '=12') + '.',
            ['Simplify each one: perfect squares and cubes give rational roots; repeating decimals and fractions are rational.'], 'count rational of 12');
        } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  function sumEstPart(ns, c, exact) {
    var tot = ns.reduce(function (a, b) { return a + b; }, 0), L = ns.map(function (n) { return '\\sqrt{' + n + '}'; }).join('+');
    var est = ns.map(function (n) { return Math.round(Math.sqrt(n)); }), sumE = est.reduce(function (a, b) { return a + b; }, 0), rhs = Math.round(Math.sqrt(tot));
    var fields = ns.map(function (n) { return { label: t('\\sqrt{' + n + '}\\approx') }; }).concat([{ label: t(L + '\\approx') }, { label: t('\\sqrt{' + tot + '}' + (exact ? '=' : '\\approx')) }]);
    var check = function (resp) {
      resp = resp || []; var vals = [];
      for (var i = 0; i < fields.length; i++) { var p = HW.parse.number(resp[i] == null ? '' : resp[i]); if (!p.ok) return form('empty', 'Fill in every box with a number (box ' + (i + 1) + ').'); vals.push(p.value); }
      for (i = 0; i < ns.length; i++) if (Math.abs(vals[i] - Math.sqrt(ns[i])) > 0.65) return wrong('estimate-off', nb(2, ns[i], String(ns[i])) + ' Which is it closer to?');
      var own = vals.slice(0, ns.length).reduce(function (a, b) { return a + b; }, 0);
      if (Math.abs(vals[ns.length] - own) > 0.051) return wrong('sum-own', 'Add your estimates: ' + t(vals.slice(0, ns.length).join('+') + '=' + K.roundTo(own, 2)) + '.');
      var v = vals[ns.length + 1];
      if (exact ? Math.abs(v - c) > 1e-9 : Math.abs(v - Math.sqrt(tot)) > 0.65) {
        if (Math.abs(v - tot) < 1e-9) return wrong('took-root-not', 'Take the square root of ' + t(tot) + ' — don’t just add the numbers.');
        if (Math.abs(v - own) < 0.051) return wrong('right-side', 'That’s the left side. Work out ' + t('\\sqrt{' + tot + '}') + ' on its own: add under the root first, then take the root.');
        return wrong('right-side', exact ? t(tot) + ' is a perfect square: which number times itself is ' + t(tot) + '?' : nb(2, tot, String(tot)));
      }
      return ok();
    };
    return { prompt: 'Show that ' + t(L + '\\ne\\sqrt{' + tot + '}') + '.', input: { type: 'fields', fields: fields }, check: check, key: est.map(String).concat([String(sumE), String(rhs)]),
      answer: t(L + '\\approx ' + est.join('+') + '=' + sumE) + ', but ' + t('\\sqrt{' + tot + '}' + (exact ? '=' : '\\approx ') + rhs) + '. ' + t(sumE + '\\ne ' + rhs) + '.',
      solution: ns.map(function (n, i) { return t('\\sqrt{' + n + '}\\approx ' + est[i]) + ' (' + t(n) + ' is near ' + t(est[i] * est[i]) + ')'; }).join(', ') + ', so the left side ' + t('\\approx ' + est.join('+') + '=' + sumE) + '.<br>But ' + t('\\sqrt{' + tot + '}' + (exact ? '=' : '\\approx ') + rhs) + (exact ? ' exactly' : ' (' + t(tot) + ' is near ' + t(rhs * rhs) + ')') + '.<br>' + t(sumE + '\\ne ' + rhs) + ': the sum of the square roots is not the square root of the sum.',
      hints: ['Estimate each square root with the nearest perfect square, e.g. ' + t('\\sqrt{11}\\approx 3') + ' because ' + t('11') + ' is near ' + t('9') + '.', 'For the right side, add the numbers under the root first: ' + t('\\sqrt{' + ns.join('+') + '}=\\sqrt{' + tot + '}') + '.'],
      text: 'estimate ' + ns.join('+') + ' vs ' + tot, good: [ns.map(function (n) { return Math.sqrt(n).toFixed(1); }).concat([K.roundTo(ns.reduce(function (a, n) { return a + Number(Math.sqrt(n).toFixed(1)); }, 0), 1).toFixed(1), exact ? String(c) : Math.sqrt(tot).toFixed(1)])],
      bad: [est.map(String).concat([String(sumE), String(sumE)])] };
  }
  function opTF(r, sh, op) {
    var a = sh.a, b = sh.b, A = sh.A, B = sh.B, js = { '+': [a + b, A + B], '-': [a - b, A - B], '\\times': [a * b, A * B], '\\div': [a / b, A / B] }[op], L = js[0], inner = js[1], R = Math.sqrt(inner), truth = Math.abs(L - R) < 1e-9;
    var lhs = '\\sqrt{' + A + '}' + op + '\\sqrt{' + B + '}', rhs = '\\sqrt{' + A + op + B + '}';
    var calc = t(lhs + '=' + a + op + b + '=' + L) + ', and ' + t(rhs + '=\\sqrt{' + inner + '}' + (truth ? '=' + R : '\\approx ' + fx(R, 2))) + '.';
    return P.tf(r, t(lhs + '=' + rhs), truth, calc + (truth ? ' They are equal.' : ' They are not equal.'), '<b>' + (truth ? 'True' : 'False') + '.</b> ' + calc + (op === '\\div' || op === '\\times' ? ' Multiplication and division pass through a square root; addition and subtraction do not.' : ' A square root does not distribute over ' + (op === '+' ? 'addition' : 'subtraction') + '.'),
      ['Work out each side separately and compare.'], 'sqrt ' + A + ' ' + op.replace('\\', '') + ' sqrt ' + B);
  }
  function nestedRootPart(n, m, text) { // √√n with √n ≈ m
    var inner = Math.sqrt(n), x = Math.sqrt(inner), want = K.roundTo(x, 1), est = Math.round(Math.sqrt(m));
    return estPart({ tex: '\\sqrt{\\sqrt{' + F(n) + '}}', x: x, mentals: cands(Math.sqrt(m)), mentalKey: est, text: text,
      nb: t('\\sqrt{' + F(n) + '}\\approx ' + m) + ' because ' + t(F(m * m) + '=' + m + '^{2}') + '. Now estimate ' + t('\\sqrt{' + m + '}') + ': ' + nb(2, m, String(m)),
      mentalSol: 'inner: ' + t('\\sqrt{' + F(n) + '}\\approx ' + m) + ' (near ' + t(F(m * m) + '=' + m + '^{2}') + '); outer: ' + t('\\sqrt{' + m + '}\\approx ' + est) + ' (near ' + t(est * est) + ')',
      calcSol: t('\\sqrt{' + F(n) + '}=' + fx(inner, 3)) + ', then ' + t('\\sqrt{' + fx(inner, 3) + '}\\approx ' + want.toFixed(1)),
      diagEst: function (v) { return Math.abs(v - inner) <= 1 ? { code: 'nested-one-root', hint: 'That’s about ' + t('\\sqrt{' + F(n) + '}') + '. There are <b>two</b> square roots: take the square root again.' } : null; },
      diagCalc: function (v) { return Math.abs(v - K.roundTo(inner, 1)) < 1e-9 ? { code: 'nested-one-root', hint: 'That’s ' + t('\\sqrt{' + F(n) + '}') + '. Take the square root of that answer too.' } : null; } });
  }
  function betweenPart(n) {
    var x = Math.cbrt(n), L = Math.floor(x), want = K.roundTo(x, 1), cubes = '1, 8, 27, 64, 125, 216, 343, 512, 729, 1\\,000';
    var calcC = K.approx(x, 1, { diag: function (v) { return Math.abs(v - K.roundTo(Math.sqrt(n), 1)) < 1e-9 ? { code: 'square-not-cube', hint: 'That’s the square root. Use the cube root key.' } : null; } });
    return { prompt: t('\\sqrt[3]{' + n + '}'), input: { type: 'fields', fields: [{ label: '(i) Between' }, { label: 'and' }, { label: '(ii) Calculator, nearest tenth', before: t('\\approx') }] }, key: [String(L), String(L + 1), want.toFixed(1)],
      answer: '(i) between ' + t(L) + ' and ' + t(L + 1) + ' &nbsp; (ii) ' + t('\\approx ' + want.toFixed(1)), text: 'cube root between ' + n, bad: [[String(L - 1), String(L), want.toFixed(1)]], good: [[String(L + 1), String(L), want.toFixed(1)]],
      check: function (resp) {
        resp = resp || []; var a = HW.parse.number(resp[0] || ''), b = HW.parse.number(resp[1] || '');
        if (!a.ok || !b.ok) return form('empty', '<b>(i)</b> Fill in two whole numbers: the cube root lies between them.');
        var lo = Math.min(a.value, b.value), hi = Math.max(a.value, b.value);
        if (lo % 1 || hi % 1 || hi - lo !== 1) return wrong('between-pair', '<b>(i)</b> Use two <b>consecutive</b> whole numbers, like ' + t('4') + ' and ' + t('5') + '.');
        if (lo !== L) return wrong('between-wrong', '<b>(i)</b> List the perfect cubes ' + t(cubes) + '. Which two is ' + t(n) + ' between?');
        var c = calcC(resp[2] == null ? '' : resp[2]); if (c.v !== 'correct') return { v: c.v, code: c.code, hint: '<b>(ii) Calculator:</b> ' + (c.hint || 'Check this one again.') };
        return ok();
      },
      solution: '(i) ' + t(F(L * L * L) + '=' + L + '^{3}') + ' and ' + t(F((L + 1) * (L + 1) * (L + 1)) + '=' + (L + 1) + '^{3}') + ', so ' + t('\\sqrt[3]{' + n + '}') + ' is between ' + t(L) + ' and ' + t(L + 1) + '.<br>(ii) ' + t('\\sqrt[3]{' + n + '}=' + fx(x, 3) + '\\ldots\\approx ' + want.toFixed(1)) + ' — reasonable.',
      hints: ['The perfect cubes are ' + t(cubes) + '.', 'Find the two cubes on either side of ' + t(n) + '.'] };
  }
  function orderRootsPart(r) {
    var o = gen(r, function () { return { n: r.int(20, 99), a: r.int(2, 6), b: r.int(5, 30), c: r.int(3, 9), d: r.int(2, 12) }; }, function (o) {
      if (![o.n, o.b, o.d].every(function (v) { return nonSq(v) && nonCube(v); }) || (o.a === o.c && o.b === o.d)) return false;
      var vs = [Math.sqrt(o.n), Math.cbrt(o.n), o.a * Math.sqrt(o.b), o.a * Math.cbrt(o.b), o.c * Math.sqrt(o.d), o.c * Math.cbrt(o.d)].sort(function (x, y) { return x - y; });
      if (vs[5] > 29.5) return false; for (var i = 1; i < 6; i++) if (vs[i] - vs[i - 1] < 0.5) return false; return true;
    }, 2000);
    var its = [['s1', '\\sqrt{' + o.n + '}', Math.sqrt(o.n)], ['c1', '\\sqrt[3]{' + o.n + '}', Math.cbrt(o.n)], ['s2', o.a + '\\sqrt{' + o.b + '}', o.a * Math.sqrt(o.b)], ['c2', o.a + '\\sqrt[3]{' + o.b + '}', o.a * Math.cbrt(o.b)], ['s3', o.c + '\\sqrt{' + o.d + '}', o.c * Math.sqrt(o.d)], ['c3', o.c + '\\sqrt[3]{' + o.d + '}', o.c * Math.cbrt(o.d)]]
      .sort(function (x, y) { return x[2] - y[2]; });
    var byId = {}; its.forEach(function (x) { byId[x[0]] = x; });
    return P.order(r, 'Order the numbers from least to greatest. (Every one lies between ' + t('0') + ' and ' + t('30') + '.)', its.map(function (x) { return { id: x[0], tex: x[1] }; }),
      { sep: '<', why: function (a, b) { var A = byId[a], B = byId[b]; if (a.slice(1) === b.slice(1)) return 'For a number bigger than ' + t('1') + ', the cube root is <b>smaller</b> than the square root. Compare ' + t(A[1]) + ' and ' + t(B[1]) + ' again.'; return t(A[1]) + ' and ' + t(B[1]) + ' are in the wrong order. Work out a decimal value for each.'; } },
      'Decimal values: ' + its.map(function (x) { return t(x[1] + '\\approx ' + fx(x[2], 2)); }).join(', ') + '.<br>Least to greatest: ' + t(its.map(function (x) { return x[1]; }).join('<')) + '.<br>Each cube root is smaller than the matching square root, because cubing grows faster than squaring.',
      ['Use your calculator to find a decimal value for each number.', 'For numbers bigger than 1, ' + t('\\sqrt[3]{n}<\\sqrt{n}') + '.'], 'order 6 roots');
  }
  function nestMC(r) {
    var ROM = ['i', 'ii', 'iii', 'iv'], PAT = { A: [0, 0, 0, 1], B: [0, 0, 1, 0], C: [1, 0, 0, 0], D: [0, 0, 0, 0] }, ans = r.pick(['A', 'A', 'B', 'C', 'D']);
    var FALSE = REV_PAIRS.concat([['Qb', 'Q'], ['Q', 'Qb'], ['Qb', 'I']]), used = {}, st = PAT[ans].map(function (tr) { var p = gen(r, function () { return r.pick(tr ? TRUE_PAIRS : FALSE); }, function (p) { return !used[p.join()]; }); used[p.join()] = 1; return p; });
    var expl = function (i) { var p = st[i], tr = sub(p[0], p[1]); return ROM[i] + ') ' + (tr ? '<b>True</b>: every ' + NOUN[p[0]] + ' is ' + ONE[p[1]] + '.' : '<b>False</b>: ' + t(exIn(p[0], p[1])) + ' is ' + ONE[p[0]] + ' but not ' + ONE[p[1]] + '.'); };
    var CLAIM = { A: [0, 1, 2], B: [0, 1, 3], C: [1, 2, 3], D: [0, 1, 2, 3] }, falseSet = [0, 1, 2, 3].filter(function (i) { return !PAT[ans][i]; });
    var opts = ['A', 'B', 'C', 'D'].map(function (k) {
      var cl = CLAIM[k], diff = [0, 1, 2, 3].filter(function (i) { return (cl.indexOf(i) >= 0) !== (falseSet.indexOf(i) >= 0); });
      return { html: k === 'D' ? 'all four statements are false' : cl.map(function (i) { return ROM[i] + ')'; }).join(', ').replace(/, ([^,]*)$/, ', and $1') + ' only', right: k === ans, why: k === ans ? null : 'Check statement ' + ROM[diff[0]] + ') again.' };
    });
    return P.mc(r, 'Consider the following statements.<br>' + st.map(function (p, i) { return ROM[i] + ') The set of ' + NAME[p[0]] + ' is nested within the set of ' + NAME[p[1]] + '.'; }).join('<br>') + '<br>Which of the statements are <b>false</b>?', opts,
      [0, 1, 2, 3].map(expl).join('<br>') + '<br>The false ones: ' + (falseSet.length ? falseSet.map(function (i) { return ROM[i] + ')'; }).join(', ') : 'none') + '.', ['Test each statement: is every number in the first set also in the second set?'], 'which nesting statements false', true);
  }
  function absGraphPart(r, inside, k, v) {
    var ops = inside ? ['<', '\\le'] : ['\\ge', '>'], op = (inside ? r.chance(0.7) : r.chance(0.7)) ? ops[0] : ops[1], closed = op === '\\le' || op === '\\ge', ineq = '|' + v + '|' + op + ' ' + k;
    var combos = [[true, false], [true, true], [false, false], [false, true]];
    var opts = combos.map(function (cmb) {
      var right = cmb[0] === inside && cmb[1] === closed, why = null;
      if (!right) why = cmb[0] !== inside ? t(ineq) + ' means every point ' + (inside ? '<b>within</b> ' + k + ' units of ' + t('0') + ' — between ' + t('-' + k) + ' and ' + t(k) : '<b>at least</b> ' + k + ' units from ' + t('0') + ' — outward from ' + t('-' + k) + ' and ' + t(k)) + '.' : (closed ? 'The sign ' + t(op) + ' includes the endpoints, so use solid dots.' : 'The sign ' + t(op) + ' does not include the endpoints, so use open circles.');
      return { html: numLine(k, cmb[0], cmb[1]), right: right, why: why };
    });
    var p = P.mc(r, 'Which graph represents ' + t(ineq + ',\\ ' + v + '\\in R') + '?', opts,
      'Every point ' + (inside ? '<b>within</b> ' + t(k) + ' units of ' : '<b>at least</b> ' + t(k) + ' units from ') + t('0') + (inside ? ': between ' + t('-' + k) + ' and ' + t(k) : ': outward from ' + t('-' + k) + ' and ' + t(k) + ' in both directions') + '. ' + (closed ? 'The ' + t(op) + ' includes the endpoints, so they get solid dots.' : 'The strict ' + t(op) + ' excludes the endpoints, so they get open circles.') + numLine(k, inside, closed),
      ['Read ' + t('|' + v + '|') + ' as “the distance of ' + t(v) + ' from ' + t('0') + '”.', 'Solid dot: endpoint included (' + t('\\le') + ' or ' + t('\\ge') + '). Open circle: not included (' + t('<') + ' or ' + t('>') + ').'], 'graph ' + ineq, true);
    return p;
  }
  function strictPart(r, it) {
    var opts = ['N', 'W', 'I', 'Q', 'Qb'].map(function (x) { var right = x === SMALLEST[it.kind], h = right ? null : regionWhy(it, x); return { html: S(x), right: right, why: h ? h.hint : null }; });
    var p = P.mc(r, t(it.tex), opts, it.note + ' Smallest set: ' + S(SMALLEST[it.kind]) + '.', ['Simplify first, then find the smallest set that still contains the number.'], 'strictest set ' + it.tex, true);
    p.input.columns = 5; return p;
  }
  function countPart(r, d) {
    var L = { none: 'no number', one: 'exactly one number', inf: 'infinitely many numbers' };
    var p = P.mc(r, d[0], ['none', 'one', 'inf'].map(function (k) { return { html: L[k], right: k === d[1], why: k === d[1] ? null : d[2] }; }), '<b>' + cap(L[d[1]]) + '.</b> ' + d[2], ['Picture the diagram. Is the region described empty? Does it hold one number, or a whole family?'], 'how many: ' + d[0].replace(/\\\(|\\\)/g, ''), true);
    p.input.columns = 3; return p;
  }
  var CLOSE = { '+': 'addition', '−': 'subtraction', '×': 'multiplication', '÷': 'division' };
  var CLOSE_EX = {
    'N+': [true, t('4+9=13') + '. Two counting numbers always add to a counting number.'], 'N×': [true, t('3\\times 4=12') + '. A product of counting numbers is a counting number.'],
    'W+': [true, t('0+7=7') + '. Two whole numbers always add to a whole number.'], 'W×': [true, t('0\\times 5=0') + ', ' + t('3\\times 6=18') + ' — always whole.'],
    'W−': [false, t('2-7=-5\\notin W') + '.'], 'N−': [false, t('3-5=-2\\notin N') + '.'], 'I×': [true, t('(-3)(8)=-24\\in I') + '. An integer times an integer is always an integer.'],
    'I+': [true, t('-7+4=-3\\in I') + '.'], 'I−': [true, t('3-8=-5\\in I') + '.'], 'Q÷': [false, t('5\\div 0') + ' is undefined — <b>only</b> because of zero. With ' + t('0') + ' excluded as a divisor, ' + t('\\frac{a}{b}\\div\\frac{c}{d}=\\frac{ad}{bc}') + ' is always rational.'],
    'R÷': [false, t('\\pi\\div 0') + ' is undefined — only because of zero. Dividing by any non-zero real number gives a real number.'], 'R−': [true, t('\\pi-5\\in R') + '. A real number minus a real number is always real.'],
    'R+': [true, 'Adding two points on the number line always gives a point on the number line.'], 'R×': [true, 'A product of two real numbers is always real.'],
    'Q−': [true, t('\\frac{a}{b}-\\frac{c}{d}=\\frac{ad-bc}{bd}') + ', again a ratio of integers.'], 'Q+': [true, t('\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+bc}{bd}') + ', again a ratio of integers.'],
    'Q×': [true, t('\\frac{a}{b}\\times\\frac{c}{d}=\\frac{ac}{bd}') + ', again a ratio of integers.'], 'W÷': [false, t('3\\div 2=1.5\\notin W') + ' (and ' + t('3\\div 0') + ' is undefined).'],
    'N÷': [false, t('3\\div 4=0.75\\notin N') + '.'], 'I÷': [false, t('3\\div 2=1.5\\notin I') + '.']
  };
  function closedPart(r, so) {
    var e = CLOSE_EX[so[0] + so[1]], closed = e[0];
    var p = P.mc(r, S(so[0]) + ' under ' + CLOSE[so[1]], [{ html: '<b>Closed</b>', right: closed, why: closed ? null : 'Look for a counterexample: ' + e[1] }, { html: '<b>Not closed</b>', right: !closed, why: closed ? 'Can you find a counterexample? There isn’t one: ' + e[1] : null }],
      '<b>' + (closed ? 'Closed' : 'Not closed') + '.</b> ' + e[1], ['Try a few pairs, including negatives, zero and pairs that don’t divide evenly.'], so[0] + ' closed under ' + CLOSE[so[1]], true);
    p.tries = 1; p.input.columns = 2; return p;
  }
  function falseStmtMC(r) {
    var ROM = ['i', 'ii', 'iii', 'iv'], PAT = { A: [0, 1, 0, 1], B: [1, 0, 1, 0], C: [1, 0, 1, 1], D: [1, 1, 1, 0] }, ans = r.pick(['A', 'B', 'B', 'C', 'D']), tr = PAT[ans];
    var CT = ['N+', 'N×', 'W+', 'W×', 'I+', 'I−', 'I×', 'Q+', 'Q−', 'Q×', 'R+', 'R−', 'R×'], CF = ['N−', 'N÷', 'W−', 'W÷', 'I÷'];
    var QBF = { '+': t('\\sqrt{2}+(-\\sqrt{2})=0') + ' is rational.', '×': t('\\sqrt{2}\\times\\sqrt{2}=2') + ' is rational.', '÷': t('\\sqrt{2}\\div\\sqrt{2}=1') + ' is rational.' };
    var s1 = r.pick(tr[0] ? TRUE_PAIRS : REV_PAIRS), s2 = gen(r, function () { return r.pick(tr[1] ? TRUE_PAIRS : REV_PAIRS); }, function (p) { return p.join() !== s1.join(); });
    var c3 = r.pick(tr[2] ? CT : CF), c4 = tr[3] ? gen(r, function () { return r.pick(CT); }, function (c) { return c !== c3; }) : (r.chance(0.6) ? 'Qb' + r.pick(['+', '×', '÷']) : gen(r, function () { return r.pick(CF); }, function (c) { return c !== c3; }));
    function closeTxt(c) { var s = c.slice(0, c.length - 1), op = c.slice(-1); return S(s) + ' is closed under ' + CLOSE[op] + '.'; }
    function closeExpl(c) { var s = c.slice(0, c.length - 1), op = c.slice(-1); if (s === 'Qb') return '<b>False</b>: ' + QBF[op]; var e = CLOSE_EX[c]; return (e[0] ? '<b>True</b>: ' : '<b>False</b>: ') + e[1]; }
    var stm = ['Every number in ' + S(s1[0]) + ' is also in ' + S(s1[1]) + '.', 'Every number in ' + S(s2[0]) + ' is also in ' + S(s2[1]) + '.', closeTxt(c3), closeTxt(c4)];
    var expl = [s1, s2].map(function (p) { return sub(p[0], p[1]) ? '<b>True</b>: ' + S(p[0]) + ' is nested inside ' + S(p[1]) + '.' : '<b>False</b>: ' + t(exIn(p[0], p[1])) + ' is in ' + S(p[0]) + ' but not in ' + S(p[1]) + '.'; }).concat([closeExpl(c3), closeExpl(c4)]);
    var CLAIM = { A: [0, 2], B: [1, 3], C: [1], D: [3] }, falseSet = [0, 1, 2, 3].filter(function (i) { return !tr[i]; });
    var opts = ['A', 'B', 'C', 'D'].map(function (k) { var cl = CLAIM[k], diff = [0, 1, 2, 3].filter(function (i) { return (cl.indexOf(i) >= 0) !== (falseSet.indexOf(i) >= 0); }); return { html: cl.map(function (i) { return ROM[i] + ')'; }).join(' and ') + ' only', right: k === ans, why: k === ans ? null : 'Check statement ' + ROM[diff[0]] + ') again.' }; });
    return P.mc(r, 'Consider these four statements.<br>' + stm.map(function (s, i) { return ROM[i] + ') ' + s; }).join('<br>') + '<br>Which are <b>false</b>?', opts,
      expl.map(function (e, i) { return ROM[i] + ') ' + e; }).join('<br>') + '<br>False: ' + falseSet.map(function (i) { return ROM[i] + ')'; }).join(' and ') + '.', ['Test each statement with an example, and look for a counterexample.'], 'which statements false (nesting + closure)', true);
  }
})(window);
