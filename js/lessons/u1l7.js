/* Math 10C · Unit 1 · Lesson 7 — Cumulative Number Sense Check-Up (AN1 + AN2)
 * Assignment questions 1–8 (u1_L07.tex: Part A multiple choice, Part B numerical response, Part C written response)
 * and the Lesson 7 Extra Practice (u1_EP07.tex, Parts A–E). Every part is a generator: it keeps the structure and
 * difficulty of the booklet question (the booklet's numbers are one of the possible values) and changes the numbers.
 * Default outcome AN2; parts about factors, GCF/LCM and perfect squares/cubes are tagged AN1. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, ex = HW.ex, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'sets-nonreal': 'Put a non-real number in a set', 'sets-real': 'Called a real number non-real', 'sets-both': 'Ticked both rational and irrational',
    'sets-irr': 'Missed that a number is irrational', 'sets-rat': 'Called a rational number irrational', 'sets-R': 'Left out R',
    'sets-irr-int': 'Put an irrational number in N, W or I', 'sets-zero-N': 'Called 0 a natural number', 'sets-neg': 'Put a negative number in N or W',
    'sets-frac': 'Put a non-integer in N, W or I', 'sets-Q': 'Left out Q', 'sets-nat': 'Missed W or I for a natural number', 'sets-zero': 'Missed W or I for 0',
    'sets-negint': 'Missed I for a negative integer', added: 'Added instead of multiplying',
    'squared-not-cubed': 'Squared instead of cubed', 'no-radicand': 'Forgot to multiply by the radicand', 'cube-itself': 'Used the perfect cube instead of its cube root',
    'mult-ab': 'Multiplied a and b instead of adding', 'partial': 'Didn’t take out the largest perfect power', 'unsimplified': 'Didn’t simplify the radical at all',
    'gcf-lcm': 'Mixed up GCF and LCM', 'gcf-high': 'Used the higher power for the GCF', 'lcm-missing': 'Left a prime out of the LCM', 'lcm-product': 'Multiplied the numbers instead of finding the LCM',
    'fc-product': 'Multiplied the exponents (no +1)', 'fc-sum': 'Added instead of multiplying', 'k-square': 'Made a perfect square instead of a cube', 'k-cube': 'Made a perfect cube instead of a square',
    'k-all': 'Multiplied by every prime', 'k-extra': 'Used the extra factors instead of the missing ones', 'root-of-k': 'Gave pk instead of its root', 'neg-inside': 'Put the negative under an even root',
    'game-pos': 'Scored a negative card as natural/whole', 'game-noQ': 'Forgot that integers are rational', 'game-I': 'Scored only the integer category', 'game-W': 'Scored a negative card as whole',
    'game-tot': 'A card scored in the wrong categories', 'count-radicals': 'Counted every radical as irrational', 'count-plus': 'Counted a rational number as irrational',
    'count-minus': 'Missed an irrational number', 'halved-exp': 'Halved the number instead of the exponents', 'decimal-cut': 'Converted the decimal as if it ended',
    'nine-tenths': 'Treated the repeating 9 as a single digit', 'lcm-sum': 'Added the GCF and LCM', 'leftover-1': 'Leftover radicand of 1', 'leftover-4': 'Leftover radicand is a perfect square',
    'skipped': 'Skipped the next allowed value', 'term-test': 'Wrong terminate/repeat prediction', 'sort-rat': 'Missed a rational number', 'sort-irr': 'Missed an irrational number', 'sort-nr': 'Missed a non-real number',
    'err-decoy': 'Picked a step that was actually fine', 'err-missed': 'Missed one of the errors', 'inside-first': 'Didn’t simplify inside the root first', 'not-smallest': 'Correct kind, but not the smallest', 'pair-gcf': 'A pair with the wrong GCF', 'pair-lcm': 'A pair with the wrong LCM', 'pair-missing': 'Missed a pair'
  });

  /* ---------- number helpers ---------- */
  function prodOf(a) { return a.reduce(function (m, x) { return m * x; }, 1); }
  function isPow(v, n) { if (v < 0) return false; var c = Math.round(Math.pow(v, 1 / n)); for (var d = Math.max(0, c - 1); d <= c + 1; d++) if (Math.pow(d, n) === v) return true; return false; }
  function nonSquares(a, b) { var o = []; for (var i = a; i <= b; i++) if (!isPow(i, 2)) o.push(i); return o; }
  function fVal(f) { return f.reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1]); }, 1); }
  function fTex(f) { var g = f.filter(function (pe) { return pe[1] > 0; }); return g.length ? HW.texFactors(g) : '1'; }
  function nDiv(f) { return f.reduce(function (m, pe) { return m * (pe[1] + 1); }, 1); }
  function fSort(f) { return f.slice().sort(function (a, b) { return a[0] - b[0]; }); }
  function fExps(f) { return f.map(function (pe) { return pe[1]; }); }
  function mixedOf(f, n) { return { k: prodOf(f.map(function (pe) { return Math.pow(pe[0], Math.floor(pe[1] / n)); })), m: prodOf(f.map(function (pe) { return Math.pow(pe[0], pe[1] % n); })) }; }
  function rad(k, n, m) { return ex.texRadical([k, 1], n, m); }
  function rt(n, inner) { return ex.texRoot(n, inner); }
  function fracTex(p, q) { return ex.texRat(ex.norm(p, q)); }
  function terminates(q) { q = Math.abs(q); while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; }
  function denEq(q) { return q === 1 || nt.distinctPrimes(q).length === 1 && nt.factor(q)[0][1] === 1 ? String(q) : q + '=' + K.fac(q); } /* "15=3\times 5", but just "3" for a prime */
  function d3(x) { return K.roundTo(x, 3).toFixed(3); }
  function rootWord(n) { return n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth' : n + 'th'; }
  function coprimeIn(r, lo, hi, q) { var c = []; for (var i = lo; i <= hi; i++) if (ex.gcd(i, q) === 1) c.push(i); return r.pick(c); }
  function roman(i) { return ['I', 'II', 'III'][i - 1]; }
  function gcdF(f, g) { return fSort(f.filter(function (pe) { return g.some(function (q) { return q[0] === pe[0]; }); }).map(function (pe) { var q = g.filter(function (x) { return x[0] === pe[0]; })[0]; return [pe[0], Math.min(pe[1], q[1])]; })); }
  function lcmF(f, g) { var o = {}; f.concat(g).forEach(function (pe) { o[pe[0]] = Math.max(o[pe[0]] || 0, pe[1]); }); return fSort(Object.keys(o).map(function (p) { return [Number(p), o[p]]; })); }
  function sharedHighF(f, g) { return fSort(f.filter(function (pe) { return g.some(function (q) { return q[0] === pe[0]; }); }).map(function (pe) { var q = g.filter(function (x) { return x[0] === pe[0]; })[0]; return [pe[0], Math.max(pe[1], q[1])]; })); }

  /* ---------- real-number sets (grid with one row per number) ---------- */
  var SET_COLS = [{ id: 'N', html: t('N'), label: 'N' }, { id: 'W', html: t('W'), label: 'W' }, { id: 'I', html: t('I'), label: 'I' }, { id: 'Q', html: t('Q'), label: 'Q' }, { id: 'Qb', html: t('\\overline{Q}'), label: 'Q-bar' }, { id: 'R', html: t('R'), label: 'R' }];
  var GAME_COLS = SET_COLS.slice(0, 5).concat([{ id: 'NR', html: 'Non-real', label: 'Non-real' }]);
  var SETS = { nat: ['N', 'W', 'I', 'Q'], zero: ['W', 'I', 'Q'], negint: ['I', 'Q'], frac: ['Q'], irr: ['Qb'], nonreal: [] };
  var SET_TEX = { N: 'N', W: 'W', I: 'I', Q: 'Q', Qb: '\\overline{Q}', R: 'R' };
  function setsOf(cls, game) { var s = SETS[cls].slice(); if (game) { if (cls === 'nonreal') s = ['NR']; } else if (cls !== 'nonreal') s.push('R'); return s; }
  function setList(s) { if (!s.length) return 'none (not a real number)'; if (s[0] === 'NR') return 'non-real'; return t(s.map(function (x) { return SET_TEX[x]; }).join(',\\ ')); }
  function setHint(c, got, game) {
    got = got || []; var has = function (x) { return got.indexOf(x) >= 0; }, X = t(c.tex), why = c.note ? ' (' + t(c.note) + ')' : '';
    if (c.cls === 'nonreal') {
      if (game && got.length === 1 && has('NR')) return null;
      if (!game && !got.length) return null;
      return { code: 'sets-nonreal', hint: X + ' is an even root of a negative number. No real number raised to an even power is negative, so it is <b>not a real number</b>' + (game ? ' — it only scores as non-real.' : ' and belongs to none of these sets: leave its row empty.') };
    }
    if (has('NR')) return { code: 'sets-real', hint: X + ' is a real number' + why + '. Only an even root of a negative number is non-real.' };
    if (has('Q') && has('Qb')) return { code: 'sets-both', hint: 'A number is rational <b>or</b> irrational, never both. Decide which one ' + X + ' is.' };
    if (c.cls === 'irr' && !has('Qb')) return { code: 'sets-irr', hint: X + ' is irrational' + why + ': its decimal never ends and never repeats.' };
    if (c.cls !== 'irr' && has('Qb')) return { code: 'sets-rat', hint: X + ' is rational' + why + ': it can be written as a fraction of integers.' };
    if (!game && !has('R')) return { code: 'sets-R', hint: 'Every real number — rational or irrational — also belongs to ' + t('R') + '.' };
    if (c.cls === 'irr' && (has('N') || has('W') || has('I'))) return { code: 'sets-irr-int', hint: 'An irrational number isn’t in ' + t('N') + ', ' + t('W') + ' or ' + t('I') + ' — those all hold only integers.' };
    if (c.cls === 'zero' && has('N')) return { code: 'sets-zero-N', hint: t('0') + ' is a whole number, but the natural numbers start at ' + t('1') + '.' };
    if (c.cls === 'negint' && (has('N') || has('W'))) return { code: 'sets-neg', hint: X + why + ' is negative. Natural and whole numbers are never negative.' };
    if (c.cls === 'frac' && (has('N') || has('W') || has('I'))) return { code: 'sets-frac', hint: X + why + ' is not an integer, so it isn’t in ' + t('N') + ', ' + t('W') + ' or ' + t('I') + '.' };
    if (c.cls !== 'irr' && !has('Q')) return { code: 'sets-Q', hint: X + why + ' can be written as a fraction of integers' + (c.cls !== 'frac' ? ' (every integer can: ' + t('n=\\frac{n}{1}') + ')' : '') + ', so it is rational.' };
    if (c.cls === 'nat' && !(has('N') && has('W') && has('I'))) return { code: 'sets-nat', hint: X + why + ' is a natural (counting) number, so it is also a whole number and an integer.' };
    if (c.cls === 'zero' && !(has('W') && has('I'))) return { code: 'sets-zero', hint: t('0') + ' is a whole number and an integer.' };
    if (c.cls === 'negint' && !has('I')) return { code: 'sets-negint', hint: X + why + ' is a negative integer.' };
    return null;
  }
  var SET_HINTS = ['Simplify each number first. Then work up the chain ' + t('N\\subset W\\subset I\\subset Q\\subset R') + '; an irrational number is in ' + t('\\overline{Q}') + ' and ' + t('R') + ' only.'];
  /* items: [{id, tex, cls, note}] */
  function setsPart(prompt, items, game, text, extraSol) {
    var want = {}, by = {};
    items.forEach(function (c) { want[c.id] = setsOf(c.cls, game); by[c.id] = c; });
    var rows = items.map(function (c) { return { id: c.id, html: t(c.tex), label: c.label || c.id }; });
    var sol = items.map(function (c) { return t(c.tex) + (c.note ? ': ' + t(c.note) : '') + ' → ' + setList(want[c.id]); }).join('<br>') + (extraSol || '');
    return P.grid(prompt, rows, game ? GAME_COLS : SET_COLS, want, { why: function (id, got) { return setHint(by[id], got, game); }, rowHead: game ? 'Card' : 'Number' }, sol, SET_HINTS, text);
  }

  /* ---------- other reusable checkers / part makers ---------- */
  /* a product of primes in exponent form, with diagnoses for known wrong values [{v, code, hint}] */
  function prodChk(n, alts) {
    var base = K.product(n, 'required');
    return function (resp) {
      var p = HW.parse.product(resp);
      if (p.ok && p.value !== n) for (var i = 0; i < (alts || []).length; i++) if (p.value === alts[i].v) return wrong(alts[i].code, alts[i].hint);
      return base(resp);
    };
  }
  /* an exact integer answer typed in the math box; anything not written as a single number gets a nudge */
  function intChk(v, diag) {
    var base = K.value(v, { only: 'integer', diag: diag });
    return function (resp) { var res = base(resp); if (res.v !== 'correct') return res; var a = K.read(resp); if (a.ast && !ex.shape(a.ast).bare) return form('simplify', 'That has the right value, but simplify it all the way to a single number.'); return res; };
  }
  function numChk(n, alts) { return K.number(n, function (v) { for (var i = 0; i < (alts || []).length; i++) if (v === alts[i].v && v !== n) return { code: alts[i].code, hint: alts[i].hint }; return null; }); }
  function countAlts(f) {
    var e = fExps(f);
    return [{ v: prodOf(e), code: 'fc-product', hint: 'Add ' + t('1') + ' to each exponent before multiplying — a factor can use a prime zero times, too.' },
      { v: e.reduce(function (s, x) { return s + x + 1; }, 0), code: 'fc-sum', hint: 'The choices for each prime are <b>multiplied</b>, not added.' }];
  }
  function countSol(name, f) { return t(name + '=' + fTex(f)) + ': ' + t(f.map(function (pe) { return '(' + pe[1] + '+1)'; }).join('') + '=' + f.map(function (pe) { return pe[1] + 1; }).join('\\times ') + '=' + nDiv(f)) + ' factors.'; }
  /* is f a perfect square / cube? MC with the justification in each option */
  function sqCubePart(r, name, f) {
    var e = fExps(f), sq = e.every(function (x) { return x % 2 === 0; }), cu = e.every(function (x) { return x % 3 === 0; });
    var odd = e.filter(function (x) { return x % 2; })[0], non3 = e.filter(function (x) { return x % 3; })[0];
    var expList = t(e.join(',\\ '));
    function why(claimSq, claimCu) {
      if (claimSq && !sq) return 'The exponent ' + t(odd) + ' is odd, so ' + t(name) + ' is <b>not</b> a perfect square.';
      if (claimCu && !cu) return 'The exponent ' + t(non3) + ' is not a multiple of ' + t('3') + ', so ' + t(name) + ' is <b>not</b> a perfect cube.';
      if (!claimSq && sq) return 'Look again: every exponent (' + expList + ') is even, so ' + t(name) + ' <b>is</b> a perfect square.';
      return 'Look again: every exponent (' + expList + ') is a multiple of ' + t('3') + ', so ' + t(name) + ' <b>is</b> a perfect cube.';
    }
    var opts = [[true, false, 'A perfect square but not a perfect cube: every exponent is even, but not every exponent is a multiple of ' + t('3') + '.'],
      [false, true, 'A perfect cube but not a perfect square: every exponent is a multiple of ' + t('3') + ', but not every exponent is even.'],
      [true, true, 'Both: every exponent is even <i>and</i> a multiple of ' + t('3') + '.'],
      [false, false, 'Neither: some exponent is odd, and some exponent is not a multiple of ' + t('3') + '.']].map(function (o) {
        var right = o[0] === sq && o[1] === cu; return { html: o[2], right: right, why: right ? null : why(o[0], o[1]) };
      });
    return P.mc(r, 'Is ' + t(name) + ' a perfect square? Is it a perfect cube? Decide from the exponents only.', opts,
      'The exponents of ' + t(name + '=' + fTex(f)) + ' are ' + expList + '.<br><b>Square:</b> every exponent must be even — ' + (sq ? 'they all are, so it <b>is</b> a perfect square.' : t(odd) + ' is odd, so it is <b>not</b> a perfect square.') +
      '<br><b>Cube:</b> every exponent must be a multiple of ' + t('3') + ' — ' + (cu ? 'they all are, so it <b>is</b> a perfect cube.' : t(non3) + ' is not, so it is <b>not</b> a perfect cube.'),
      ['A perfect square has every exponent even; a perfect cube has every exponent a multiple of ' + t('3') + '.'], 'square/cube from exponents: ' + fTex(f), true);
  }
  /* k for which pk is a perfect n-th power, and the root */
  function powerUp(f, n) {
    var kf = f.map(function (pe) { return [pe[0], (n - pe[1] % n) % n]; }), up = f.map(function (pe) { return [pe[0], pe[1] + (n - pe[1] % n) % n]; });
    return { kf: kf, k: fVal(kf), up: up, root: fVal(up.map(function (pe) { return [pe[0], pe[1] / n]; })), rootF: up.map(function (pe) { return [pe[0], pe[1] / n]; }) };
  }
  function kAlts(f, n) {
    var other = powerUp(f, n === 2 ? 3 : 2).k, all = prodOf(f.map(function (pe) { return pe[0]; })), extra = fVal(f.map(function (pe) { return [pe[0], pe[1] % n]; }));
    return [{ v: other, code: n === 2 ? 'k-cube' : 'k-square', hint: 'That ' + t('k') + ' makes a perfect ' + (n === 2 ? 'cube' : 'square') + '. A perfect ' + rootWord(n) + ' needs every exponent ' + (n === 2 ? 'even' : 'a multiple of ' + t('3')) + '.' },
      { v: all, code: 'k-all', hint: 'You don’t need one more of <b>every</b> prime — only of the primes whose exponents aren’t ' + (n === 2 ? 'even' : 'multiples of ' + t('3')) + ' yet' + (n === 3 ? ' (and some need two more)' : '') + '.' },
      { v: extra, code: 'k-extra', hint: 'Those are the factors that are left <i>over</i>. ' + t('k') + ' must supply what each exponent is <i>missing</i> to reach the next ' + (n === 2 ? 'even number' : 'multiple of ' + t('3')) + '.' }];
  }
  function powerSol(name, f, n) {
    var u = powerUp(f, n), need = f.filter(function (pe) { return pe[1] % n; });
    return 'A perfect ' + rootWord(n) + ' needs every exponent ' + (n === 2 ? 'even' : 'a multiple of ' + t('3')) + '. In ' + t(name + '=' + fTex(f)) + ', ' +
      need.map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{' + (pe[1] + (n - pe[1] % n) % n) + '}'); }).join(', ') + '.<br>' +
      t('k=' + fTex(u.kf) + (u.kf.filter(function (pe) { return pe[1]; }).length > 1 || u.kf.some(function (pe) { return pe[1] > 1; }) ? '=' + F(u.k) : '')) + ', so ' + t(name + 'k=' + fTex(u.up)) + ' and ' + t(rt(n, name + 'k') + '=' + fTex(u.rootF) + '=' + F(u.root)) + '.';
  }

  /* ---------- Q3 ---------- */
  function q3Part(r) {
    var k, m, N, dv, swaps, i;
    for (i = 0; i < 500; i++) {
      m = r.pick([2, 3, 5, 6, 7]); k = r.int(12, 70); N = k * k * m;
      dv = nt.divisors(k).filter(function (d) { return d > 1 && d < k; });
      swaps = nt.distinctPrimes(k).filter(function (p) { return p !== m; });
      if (N >= 1000 && N <= 9999 && dv.length >= 2 && swaps.length && dv.some(function (d) { return !isPow(d * m, 2); })) break;
    }
    var pat = r.pick([[2, 3], [2, 3], [2, 3], [3], [1, 2, 3], [1, 3], [1, 2], [2]]);
    var good = r.shuffle(dv).map(function (d) { return { c: k / d, rr: d * d * m }; }), full = { c: k, rr: m };
    good = r.chance(0.4) ? [full].concat(good) : good.concat([full]);
    var bd = r.pick(dv), bd2 = r.pick(dv.filter(function (d) { return !isPow(d * m, 2); }));
    var bads = r.shuffle([{ c: k, rr: r.pick(swaps) }, { c: bd * bd, rr: (k / bd) * (k / bd) * m }, { c: k / bd2, rr: bd2 * m }]);
    var gi = 0, bi = 0;
    var st = [1, 2, 3].map(function (j) { var right = pat.indexOf(j) >= 0, f = right ? good[gi++] : bads[bi++]; return { j: j, c: f.c, rr: f.rr, back: f.c * f.c * f.rr, right: right, tex: rad(f.c, 2, f.rr) }; });
    var sets = [[3], [2, 3], [1, 2, 3]], labels = ['only Student III', 'only Students II and III', 'all three students', 'some other combination of students not given above'];
    var patKey = pat.join(','), rightIdx = sets.map(function (s) { return s.join(','); }).indexOf(patKey); if (rightIdx < 0) rightIdx = 3;
    var opts = labels.map(function (lab, oi) {
      if (oi === rightIdx) return { html: lab, right: true };
      if (oi === 3) return { html: lab, why: 'One of the listed combinations is right. Check each student: square the number in front and multiply it back under the root. Which ones give ' + t(F(N)) + '?' };
      var s = sets[oi], bad = st.filter(function (x) { return (s.indexOf(x.j) >= 0) !== x.right; })[0];
      return { html: lab, why: 'Check Student ' + roman(bad.j) + ' again: square the number in front of the root and multiply it back under the root. Do you get ' + t(F(N)) + '?' };
    });
    var sol = t(F(N) + '=' + K.fac(N)) + '. The largest perfect square factor is ' + t(F(k * k) + '=' + k + '^{2}') + ', so ' + t('\\sqrt{' + F(N) + '}=' + rad(k, 2, m)) + '.<br>' +
      st.map(function (x) { return 'Student ' + roman(x.j) + ': ' + t(x.tex + '=\\sqrt{' + x.c + '^{2}\\times ' + F(x.rr) + '}=\\sqrt{' + F(x.back) + '}') + ' — ' + (x.right ? '<b>correct</b>' + (x.rr !== m ? ' (equal, though not in simplest form)' : ' (simplest form)') : '<b>incorrect</b>'); }).join('<br>') +
      '<br>So the answer is “' + labels[rightIdx] + '”.';
    var p = P.mc(r, 'Three students were asked to write the radical ' + t('\\sqrt{' + F(N) + '}') + ' in another form. The answers given were<br>' + st.map(function (x) { return 'Student ' + roman(x.j) + ': ' + t(x.tex); }).join(', &nbsp; ') + '.<br>A correct answer was given by', opts, sol,
      ['A mixed radical ' + t('a\\sqrt{b}') + ' equals ' + t('\\sqrt{a^{2}\\times b}') + '. Move each coefficient back inside and compare with ' + t(F(N)) + '.', 'An answer can be correct without being in simplest form.'], 'three students sqrt(' + N + ')', true);
    return p;
  }

  /* ---------- Q8 card game ---------- */
  function gameShared(r) {
    var pts, tot, i;
    for (i = 0; i < 500; i++) {
      pts = r.chance(0.25) ? { N: 5, W: 6, I: 8, Q: 4, Qb: 12, NR: 2 } : { N: r.int(3, 7), W: r.int(4, 8), I: r.int(6, 10), Q: r.int(2, 6), Qb: r.int(9, 14), NR: r.int(1, 4) };
      var vals = [pts.N, pts.W, pts.I, pts.Q, pts.Qb, pts.NR];
      if (vals.some(function (v, j) { return vals.indexOf(v) !== j; })) continue;
      tot = [pts.Q + pts.Qb + pts.W + pts.I + pts.Q, pts.I + pts.Q + pts.Q + pts.Qb, pts.I + pts.Q + pts.NR + pts.N + pts.W + pts.I + pts.Q];
      if (tot[0] !== tot[1] && tot[1] !== tot[2] && tot[0] !== tot[2]) break;
    }
    function pt(cls) { return setsOf(cls, true).reduce(function (s, x) { return s + pts[x]; }, 0); }
    var q = r.int(3, 9), p = coprimeIn(r, 1, q - 1, q), nA = r.pick(nonSquares(10, 60)), nB = r.pick(nonSquares(2, 30).filter(function (x) { return x !== nA; }));
    var neg = r.int(2, 20), bq = r.int(3, 10), bp = coprimeIn(r, 1, bq - 1, bq), kC = r.int(4, 12);
    var A = [{ id: 'a1', tex: '\\frac{' + p + '}{' + q + '}', cls: 'frac', note: null },
      { id: 'a2', tex: '\\sqrt{' + nA + '}', cls: 'irr', note: nA + '\\text{ is not a perfect square}', alts: [{ d: pts.Q - pts.Qb, hint: t('\\sqrt{' + nA + '}') + ' is irrational: ' + t(nA) + ' is not a perfect square.' }] },
      { id: 'a3', tex: '0', cls: 'zero', note: null, alts: [{ d: pts.N, hint: t('0') + ' is whole, but not natural (the natural numbers start at ' + t('1') + ').' }] }];
    var B = [{ id: 'b1', tex: '-' + neg, cls: 'negint', note: null, alts: [{ d: pts.N + pts.W, hint: t('-' + neg) + ' is negative, so it is neither natural nor whole.' }, { d: -pts.Q, hint: 'Don’t forget that every integer is rational, too.' }] },
      { id: 'b2', tex: '\\sqrt{\\frac{' + bp * bp + '}{' + bq * bq + '}}', cls: 'frac', note: '\\sqrt{\\frac{' + bp * bp + '}{' + bq * bq + '}}=\\frac{' + bp + '}{' + bq + '}', alts: [{ d: pts.Qb - pts.Q, hint: t('\\sqrt{\\frac{' + bp * bp + '}{' + bq * bq + '}}=\\frac{' + bp + '}{' + bq + '}') + ', which is rational.' }] },
      { id: 'b3', tex: '\\sqrt{' + nB + '}', cls: 'irr', note: nB + '\\text{ is not a perfect square}', alts: [{ d: pts.Q - pts.Qb, hint: t('\\sqrt{' + nB + '}') + ' is irrational: ' + t(nB) + ' is not a perfect square.' }] }];
    var C = [{ id: 'c1', tex: '-\\sqrt{' + kC * kC + '}', cls: 'negint', note: '-\\sqrt{' + kC * kC + '}=-' + kC, alts: [{ d: pts.NR - pts.I - pts.Q, hint: t('-\\sqrt{' + kC * kC + '}=-' + kC) + ': the negative sign is <i>outside</i> the root, so it is a real number.' }] },
      { id: 'c2', tex: '\\sqrt{-' + kC * kC + '}', cls: 'nonreal', note: null, alts: [{ d: pts.I + pts.Q - pts.NR, hint: t('\\sqrt{-' + kC * kC + '}') + ' is not ' + t('-' + kC) + ': ' + t('(-' + kC + ')^{2}=' + kC * kC) + '. No real number squared is negative, so it is non-real.' }, { d: -pts.NR, hint: 'The non-real card still scores ' + t(pts.NR) + ' points.' }] },
      { id: 'c3', tex: String(kC * kC), cls: 'nat', note: null, alts: [{ d: -pts.Q, hint: 'Don’t forget that every integer is rational, too.' }] }];
    [A, B, C].forEach(function (h) { h.forEach(function (c) { c.pts = pt(c.cls); }); });
    var ex1 = r.int(2, 30);
    return { pts: pts, hands: [r.shuffle(A), r.shuffle(B), r.shuffle(C)], tot: tot, neg: r.int(2, 20), ex1: ex1, pt: pt };
  }
  function gameStem(sh) {
    var p = sh.pts;
    return 'A group of students invented a card game based on the real number system. There are ' + t('50') + ' cards in the deck, each showing a number, and a card earns points for <b>every</b> category it belongs to:<br>' +
      'Natural ' + t('(N)\\ ' + p.N) + ' · Whole ' + t('(W)\\ ' + p.W) + ' · Integer ' + t('(I)\\ ' + p.I) + ' · Rational ' + t('(Q)\\ ' + p.Q) + ' · Irrational ' + t('(\\overline{Q})\\ ' + p.Qb) + ' · Non-real ' + t(p.NR) +
      '<br>For example, a card showing ' + t(sh.ex1) + ' earns ' + t(p.N + '+' + p.W + '+' + p.I + '+' + p.Q + '=' + (p.N + p.W + p.I + p.Q)) + ' points, because ' + t(sh.ex1) + ' is natural, whole, an integer <i>and</i> rational. Each student is dealt three cards; the most points wins.';
  }
  function handTex(h) { return h.map(function (c) { return t(c.tex); }).join(', \\ '); }
  function handSol(h) { return h.map(function (c) { return t(c.tex) + (c.note && c.cls !== 'irr' ? ' ' + t('(' + c.note.replace(/^.*=/, '=') + ')') : '') + ': ' + setList(setsOf(c.cls, true)) + ' → ' + t(c.pts); }).join('<br>') + '<br>Total: ' + t(h.map(function (c) { return c.pts; }).join('+') + '=' + h.reduce(function (s, c) { return s + c.pts; }, 0)); }
  function totalChk(h) {
    var tot = h.reduce(function (s, c) { return s + c.pts; }, 0);
    return K.number(tot, function (v) {
      for (var i = 0; i < h.length; i++) for (var j = 0; j < (h[i].alts || []).length; j++) if (tot + h[i].alts[j].d === v) return { code: 'game-tot', hint: h[i].alts[j].hint };
      return null;
    });
  }

  /* ---------- Extra 7: rational / irrational / not real ---------- */
  function e7Items(r) {
    var s = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]), sq = s * s, b = r.int(2, 5), a = coprimeIn(r, 1, b - 1, b);
    var nn = r.pick([8, 12, 18, 20, 24, 27, 28, 40, 44, 45, 48, 50, 52, 54, 60, 63, 72]), mf = mixedOf(nt.factor(nn), 2);
    var d1 = r.int(0, 9), d2 = r.pick([1, 2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x !== d1; })), repFr = ex.norm(10 * d1 + d2 - d1, 90);
    var ev = r.pick([['\\sqrt[4]{-16}', 4, 16], ['\\sqrt[4]{-81}', 4, 81], ['\\sqrt[6]{-64}', 6, 64], ['\\sqrt{-25}', 2, 25], ['\\sqrt[4]{-10}', 4, 10]]);
    var k = r.int(3, 9), m = r.pick([2, 3, 5]), pv = r.pick([['\\frac{\\pi}{\\pi}', '1'], ['\\frac{3\\pi}{\\pi}', '3'], ['\\frac{2\\pi}{4\\pi}', '\\frac{1}{2}']]);
    var ip = r.int(1, 3), dd = r.int(1, 9), pat = ip + '.0' + dd + '00' + dd + '000' + dd + '\\ldots';
    return [
      { id: 'sd', tex: '\\sqrt{' + (s < 10 ? '0.' + (sq < 10 ? '0' : '') + sq : String(sq / 100)) + '}', col: 'rat', why: 'since ' + t(String(s / 10) + '^{2}=' + (sq / 100)) + ', it equals ' + t(String(s / 10)) + ', which terminates.' },
      { id: 'cf', tex: '\\sqrt[3]{-\\frac{' + a * a * a + '}{' + b * b * b + '}}', col: 'rat', why: 'it equals ' + t('-\\frac{' + a + '}{' + b + '}') + ', since ' + t('\\left(-\\frac{' + a + '}{' + b + '}\\right)^{3}=-\\frac{' + a * a * a + '}{' + b * b * b + '}') + '. An odd root of a negative is fine.' },
      { id: 'sn', tex: '\\sqrt{' + nn + '}', col: 'irr', why: t(nn) + ' is not a perfect square' + (mf.k > 1 ? ' (' + t('\\sqrt{' + nn + '}=' + rad(mf.k, 2, mf.m)) + ')' : '') + ', so the decimal never ends and never repeats.' },
      { id: 'rp', tex: '0.' + d1 + '\\overline{' + d2 + '}', col: 'rat', why: 'it repeats, so it is a fraction: ' + t('0.' + d1 + '\\overline{' + d2 + '}=' + ex.texRat(repFr)) + '.' },
      { id: 'ev', tex: ev[0], col: 'nr', why: 'the index ' + t(ev[1]) + ' is even and the radicand is negative. No real number to an even power is negative.' },
      { id: 'qq', tex: '\\frac{\\sqrt{' + k * k * m + '}}{\\sqrt{' + m + '}}', col: 'rat', why: t('\\frac{\\sqrt{' + k * k * m + '}}{\\sqrt{' + m + '}}=\\sqrt{' + k * k + '}=' + k) + '.' },
      { id: 'pi', tex: pv[0], col: 'rat', why: t('\\pi') + ' is irrational, but the quotient is ' + t(pv[1]) + '.' },
      { id: 'pt', tex: pat, col: 'irr', why: 'the runs of zeros keep getting longer, so the decimal never ends and never repeats.' }];
  }

  /* ---------- Extra 9(c): negative coefficient into an even-index radical ---------- */
  function negEntireChk(k, m) {
    var M = Math.pow(k, 4) * m, V = -k * Math.pow(m, 0.25);
    return function (resp) {
      var a = K.read(resp); if (a.res) return a.res;
      var rr = ex.radical(a.ast), sh = ex.shape(a.ast);
      if (sh.decimals && !sh.roots) return Math.abs(a.val - V) < 0.05 * Math.abs(V) ? form('decimal', 'That’s a decimal approximation. Give the exact entire radical.') : wrong('value', null);
      if (isNaN(a.val) && /-/.test(String(resp))) return wrong('neg-inside', 'An even root of a negative number is not a real number. Only the ' + t(k) + ' moves inside; the negative sign has to stay <b>outside</b> the radical.');
      if (ex.eq(a.val, V)) {
        if (rr && rr.n === 4 && rr.k[0] === -1 && rr.k[1] === 1) return ok();
        if (rr && rr.n === 4) return form('not-entire', 'Right value, but an entire radical has nothing in front of the root except the sign. Move ' + t(k) + ' inside as ' + t(k + '^{4}=' + Math.pow(k, 4)) + '.');
        return form('one-radical', 'Right value — now write it as ' + t('-\\sqrt[4]{\\ }') + ' with a single number inside.');
      }
      if (ex.eq(a.val, -V)) return wrong('sign', 'The number is negative, so keep the ' + t('-') + ' sign in front of the radical.');
      if (rr && rr.n === 4 && Math.abs(rr.k[0]) === 1 && rr.k[1] === 1) {
        if (rr.m === k * m) return wrong('no-power', 'Before ' + t(k) + ' moves inside a fourth root it has to be raised to the fourth power: ' + t(k + '=\\sqrt[4]{' + Math.pow(k, 4) + '}') + '.');
        if (rr.m === k * k * m) return wrong('no-power', 'This is a <b>fourth</b> root: raise ' + t(k) + ' to the power ' + t('4') + ', not ' + t('2') + '.');
        if (rr.m === Math.pow(k, 4) + m) return wrong('added', 'Multiply ' + t(Math.pow(k, 4)) + ' by ' + t(m) + ' — don’t add them.');
      }
      return wrong('value', null);
    };
  }

  /* ---------- Extra 11: magnified number line (SVG) ---------- */
  function lineSVG(pts) {
    var x0 = 2.9, x1 = 3.4, L = 30, R = 490;
    function X(v) { return (L + (v - x0) / (x1 - x0) * (R - L)).toFixed(1); }
    var s = '<svg viewBox="0 0 520 86" width="100%" style="max-width:520px" role="img" aria-label="number line from 2.9 to 3.4">';
    s += '<line x1="18" y1="56" x2="506" y2="56" stroke="currentColor" stroke-width="1.5"/><path d="M506 56 l-8 -4 v8 z" fill="currentColor"/>';
    for (var i = 0; i <= 10; i++) { var v = x0 + i * 0.05, xx = X(v), major = i % 2 === 0; s += '<line x1="' + xx + '" y1="' + (major ? 50 : 53) + '" x2="' + xx + '" y2="' + (major ? 62 : 59) + '" stroke="currentColor" stroke-width="1"/>'; if (major) s += '<text x="' + xx + '" y="78" font-size="13" text-anchor="middle" fill="currentColor">' + v.toFixed(1) + '</text>'; }
    pts.slice().sort(function (a, b) { return a.v - b.v; }).forEach(function (p, j) { var xx = X(p.v); s += '<circle cx="' + xx + '" cy="56" r="4.5" fill="currentColor"/><text x="' + xx + '" y="' + (j % 2 ? 22 : 40) + '" font-size="14" text-anchor="middle" fill="currentColor">' + p.lab + '</text>'; });
    return s + '</svg>';
  }
  function e11Shared(r) {
    var F3 = [{ tex: '\\frac{13}{4}', v: 13 / 4, lab: '13/4' }, { tex: '\\frac{16}{5}', v: 16 / 5, lab: '16/5' }, { tex: '\\frac{25}{8}', v: 25 / 8, lab: '25/8' }, { tex: '\\frac{29}{9}', v: 29 / 9, lab: '29/9' }, { tex: '\\frac{23}{7}', v: 23 / 7, lab: '23/7' }];
    var fr, c, n, p, z, d, k, m, i;
    function gaps(a, g) { a = a.slice().sort(function (x, y) { return x - y; }); for (var j = 1; j < a.length; j++) if (a[j] - a[j - 1] < g) return false; return true; }
    for (i = 0; i < 500; i++) {
      fr = r.pick(F3); c = r.pick([28, 29, 30, 31, 32, 33, 34, 35]); n = r.pick([5, 6, 7]); p = r.pick([7, 8]); z = r.pick([-2, -3]); d = r.int(1, 8); k = r.pick([5, 6, 7]); m = r.pick([2, 3, 5]);
      if (gaps([fr.v, Math.cbrt(c), Math.sqrt(10)], 0.03) && gaps([-Math.sqrt(n), -p / 3, z], 0.02)) break;
    }
    var items = [
      { id: 'f', tex: fr.tex, v: fr.v, lab: fr.lab, irr: false, note: fr.tex + '=' + fr.v },
      { id: 'sn', tex: '-\\sqrt{' + n + '}', v: -Math.sqrt(n), irr: true },
      { id: 'rp', tex: '2.\\overline{' + d + '}', v: 2 + d / 9, irr: false },
      { id: 'cb', tex: '\\sqrt[3]{' + c + '}', v: Math.cbrt(c), lab: '∛' + c, irr: true },
      { id: 'z', tex: String(z), v: z, irr: false },
      { id: 'q', tex: '\\frac{\\sqrt{' + k * k * m + '}}{\\sqrt{' + m + '}}', v: k, irr: false },
      { id: 's10', tex: '\\sqrt{10}', v: Math.sqrt(10), lab: '√10', irr: true },
      { id: 'nf', tex: '-\\frac{' + p + '}{3}', v: -p / 3, irr: false }];
    return { items: items, k: k, m: m, c: c, n: n, three: [items[0], items[3], items[6]] };
  }
  function e11Stem(sh) { return 'Consider the eight numbers ' + sh.items.map(function (x) { return t(x.tex); }).join(', \\ ') + '.'; }

  /* ---------- Extra 20(b): twelve numbers ---------- */
  function e20Items(r) {
    var o = [], j, m;
    function add(tex, irr, why) { o.push({ tex: tex, irr: irr, why: why, root: /sqrt/.test(tex) }); }
    j = r.int(5, 9); m = r.pick([2, 3]);
    if (r.chance(0.65)) add('\\sqrt{' + j * j * m + '}', true, '=' + rad(j, 2, m)); else { j = r.int(11, 15); add('\\sqrt{' + j * j + '}', false, '=' + j); }
    j = r.int(2, 5);
    if (r.chance(0.7)) add('\\sqrt[3]{-' + j * j * j + '}', false, '=-' + j); else add('\\sqrt[3]{-' + (j * j * j + r.pick([1, 2, 3])) + '}', true, '\\text{ (not a perfect cube)}');
    var ab = r.pick([12, 18, 27, 36, 45, 54, 63, 72, 81]); add('0.\\overline{' + ab + '}', false, '=' + ex.texRat(ex.norm(ab, 99)));
    j = r.int(5, 12); m = r.pick([2, 3, 5]);
    if (r.chance(0.7)) add('\\frac{\\sqrt{' + j * j * m + '}}{\\sqrt{' + m + '}}', false, '=\\sqrt{' + j * j + '}=' + j); else { var mp = r.pick([2, 3, 5].filter(function (x) { return x !== m; })); add('\\frac{\\sqrt{' + j * j * m * mp + '}}{\\sqrt{' + m + '}}', true, '=\\sqrt{' + j * j * mp + '}=' + rad(j, 2, mp)); }
    j = r.int(2, 5);
    if (r.chance(0.7)) add('\\sqrt[4]{' + Math.pow(j, 4) + '}', false, '=' + j); else add('\\sqrt[4]{' + 2 * Math.pow(j, 4) + '}', true, '=' + rad(j, 4, 2));
    j = r.int(2, 4); var c6 = r.int(2, 5);
    if (r.chance(0.7)) add(c6 + '\\sqrt{' + j * j + '}', false, '=' + c6 * j); else add(c6 + '\\sqrt{' + (j * j + r.pick([-1, 1, 2])) + '}', true, '\\text{ (radicand not a perfect square)}');
    var pc = r.int(1, 3); add('\\pi ' + r.pick(['+', '-']) + ' ' + pc, true, '\\text{ (}\\pi\\text{ is irrational)}');
    var a = r.int(3, 9);
    if (r.chance(0.7)) add('\\sqrt{\\frac{' + a * a + '}{100}}', false, '=\\frac{' + a + '}{10}' + (a % 2 && a % 5 ? '' : '=' + ex.texRat(ex.norm(a, 10)))); else add('\\sqrt{\\frac{' + (a * a + 1) + '}{100}}', true, '=\\frac{\\sqrt{' + (a * a + 1) + '}}{10}');
    j = r.pick([20, 25, 30, 40, 50, 60, 100]);
    if (r.chance(0.7)) add('\\sqrt[3]{' + j + '}', true, '\\text{ (not a perfect cube)}'); else { j = r.int(3, 5); add('\\sqrt[3]{' + j * j * j + '}', false, '=' + j); }
    add(r.pick(['\\frac{22}{7}', '\\frac{355}{113}', '\\frac{333}{106}']), false, '\\text{ (a fraction — only an approximation of }\\pi\\text{)}');
    var s = r.pick([11, 12, 13, 14]);
    if (r.chance(0.7)) add('\\sqrt{' + (s * s / 100) + '}', false, '=' + s / 10); else add('\\sqrt{' + String(Number((s * s / 100 + 0.01).toFixed(2))) + '}', true, '\\text{ (not a perfect square)}');
    var i0 = r.int(1, 3), da = r.int(1, 9), db = r.pick([2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x !== da; }));
    add(i0 + '.' + da + db + da + da + db + da + da + da + db + '\\ldots', true, '\\text{ (the pattern never repeats)}');
    return o;
  }

  HW.defineLesson({
    id: 'u1l7', unit: 1, num: '7', title: 'Cumulative Number Sense Check-Up', outcome: 'AN2',
    blurb: 'One pass through the whole unit, diploma-exam style: radical vocabulary and forms, entire and mixed radicals, perfect powers, and the real number system.',
    questions: [
      { num: '1', section: 'Part A — Multiple Choice', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'BEG', make: function (r) {
          var a, n, b, i;
          for (i = 0; i < 100; i++) { a = r.int(2, 9); n = r.int(3, 7); b = r.pick([r.int(11, 99) * 100, r.int(101, 999) * 10, r.int(1001, 9999)]); if (a !== n && !isPow(b, n)) break; }
          var what = r.pick([['height of a building', 'metres'], ['length of a bridge', 'metres'], ['depth of a lake', 'metres'], ['mass of a sculpture', 'kilograms']]), X = a + rt(n, F(b));
          return P.mc(r, 'The ' + what[0] + ' is ' + t(X) + ' ' + what[1] + '. In the number ' + t(X) + ', the index and radicand are respectively', [
            { html: t(n) + ' and ' + t(F(b)), right: true },
            { html: t(a) + ' and ' + t(F(b)), why: t(a) + ' is the <b>coefficient</b> (the number multiplied in front). The index is the small number tucked into the crook of the radical sign.' },
            { html: t(n) + ' and ' + t(a), why: 'The radicand is the number <b>under</b> the radical sign, not the coefficient in front of it.' },
            { html: t(F(b)) + ' and ' + t(n), why: 'Right numbers, wrong order: the question asks for the index <b>first</b>, then the radicand.' }],
            'In ' + t(X) + ', the small ' + t(n) + ' in the crook of the radical sign is the <b>index</b>, ' + t(F(b)) + ' under the sign is the <b>radicand</b>, and ' + t(a) + ' in front is the coefficient (neither). So the answer is ' + t(n) + ' and ' + t(F(b)) + '.',
            ['Label the three parts of ' + t(X) + ': coefficient, index, radicand.'], 'index & radicand of ' + a + ' root' + n + '(' + b + ')');
        } }] },
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'PRG', make: function (r) {
          var ms = [2, 3, 5, 6, 7], k1 = r.int(3, 9), m1 = r.pick(ms), k2 = r.int(2, 6), m2 = r.pick(ms), k3 = r.int(3, 9), m3 = r.pick(ms);
          var S = r.shuffle([{ kind: 'mult', tex: F(k1 * m1) + '=' + rad(k1, 2, m1) }, { kind: 'tr', tex: '\\sqrt{' + F(k2 * k2 * m2) + '}=' + rad(k2, 2, m2) }, { kind: 'sq', tex: rad(k3, 2, m3) + '=' + F(k3 * k3 * m3) }]);
          var pos = {}; S.forEach(function (s, i) { pos[s.kind] = i + 1; });
          function lab(a) { a = a.slice().sort(); return a.length === 1 ? a[0] + ' only' : a[0] + ' and ' + a[1] + ' only'; }
          var whyM = 'Check Statement ' + pos.mult + ' on your calculator: ' + t(rad(k1, 2, m1) + '\\approx ' + (k1 * Math.sqrt(m1)).toFixed(2)) + ', not ' + t(F(k1 * m1)) + '. ' + t(rad(k1, 2, m1)) + ' means ' + t(k1 + '\\times\\sqrt{' + m1 + '}') + ', not ' + t(k1 + '\\times ' + m1) + '.';
          var whyS = 'Check Statement ' + pos.sq + ' on your calculator: ' + t(rad(k3, 2, m3) + '\\approx ' + (k3 * Math.sqrt(m3)).toFixed(2)) + '. Squaring the coefficient is how you move it <i>inside</i> the root: ' + t(rad(k3, 2, m3) + '=\\sqrt{' + k3 * k3 * m3 + '}') + ', not ' + t(F(k3 * k3 * m3)) + '.';
          var opts = [{ s: [pos.mult], why: whyM }, { s: [pos.tr], right: true }, { s: [pos.tr, pos.mult], why: whyM }, { s: [pos.tr, pos.sq], why: whyS }];
          opts.sort(function (x, y) { return x.s.length - y.s.length || Math.min.apply(null, x.s) - Math.min.apply(null, y.s) || Math.max.apply(null, x.s) - Math.max.apply(null, y.s); });
          return P.mc(r, 'Three statements are given below.<br>' + S.map(function (s, i) { return 'Statement ' + (i + 1) + ': ' + t(s.tex); }).join(' &nbsp; ') + '<br>Which of the statements above is/are true?',
            opts.map(function (o) { return { html: lab(o.s), right: !!o.right, why: o.why }; }),
            S.map(function (s, i) {
              var head = 'Statement ' + (i + 1) + ': ';
              if (s.kind === 'mult') return head + t(rad(k1, 2, m1) + '\\approx ' + k1 + '(' + Math.sqrt(m1).toFixed(3) + ')=' + (k1 * Math.sqrt(m1)).toFixed(1)) + ', not ' + t(F(k1 * m1)) + ' — <b>false</b>.';
              if (s.kind === 'tr') return head + t('\\sqrt{' + F(k2 * k2 * m2) + '}=\\sqrt{' + k2 * k2 + '\\times ' + m2 + '}=' + rad(k2, 2, m2)) + ' — <b>true</b>.';
              return head + t(rad(k3, 2, m3) + '\\approx ' + (k3 * Math.sqrt(m3)).toFixed(2)) + ', not ' + t(F(k3 * k3 * m3)) + ' (it equals ' + t('\\sqrt{' + k3 * k3 * m3 + '}') + ') — <b>false</b>.';
            }).join('<br>') + '<br>Only Statement ' + pos.tr + ' is true.',
            ['Estimate each side with a calculator, or simplify the radical side exactly.', t('a\\sqrt{b}') + ' means ' + t('a\\times\\sqrt{b}') + ', and it equals ' + t('\\sqrt{a^{2}b}') + '.'], 'which radical statements are true', true);
        } }] },
      { num: '3', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '3', level: 'ADV', make: function (r) { return q3Part(r); } }] },
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '4', level: 'PRG', make: function (r) {
          var k = r.int(3, 12), m = r.pick([2, 3, 5, 6, 7]), A = k * k * m, r0 = r.int(3, 9);
          return P.mc(r, 'The area of a circle of radius ' + t('r') + ' is given by the formula ' + t('A=\\pi r^{2}') + '. A circle of radius ' + t(r0) + ' cm has an area of ' + t(r0 * r0 + '\\pi') + ' cm' + t('^{2}') + '. If a circle has an area of ' + t(A + '\\pi') + ' cm' + t('^{2}') + ', then the exact length of its radius in cm is', [
            { html: t(rad(k, 2, m)), right: true },
            { html: t(A), why: 'You found ' + t('r^{2}=' + A) + '. One more step: the radius is the square root, ' + t('r=\\sqrt{' + A + '}') + '.' },
            { html: t(rad(2 * k, 2, m)), why: 'That’s twice the radius (the diameter). Check: ' + t('\\left(' + rad(2 * k, 2, m) + '\\right)^{2}=' + 4 * A) + ', not ' + t(A) + '.' },
            { html: t(rad(k * k, 2, m)), why: 'A perfect square factor comes out of the root as its <b>square root</b>: ' + t('\\sqrt{' + k * k + '}=' + k) + ', not ' + t(k * k) + '.' }],
            'Put ' + t('A=' + A + '\\pi') + ' into ' + t('A=\\pi r^{2}') + ': ' + t('\\pi r^{2}=' + A + '\\pi') + ', so ' + t('r^{2}=' + A) + ' and<br>' + t('r=\\sqrt{' + A + '}=\\sqrt{' + k * k + '\\times ' + m + '}=' + rad(k, 2, m)) + ' cm.<br>(Check the given case: ' + t('r=' + r0) + ' gives ' + t('A=\\pi(' + r0 + '^{2})=' + r0 * r0 + '\\pi') + '.)',
            ['Substitute the area into ' + t('A=\\pi r^{2}') + ' and solve for ' + t('r') + '.', 'Simplify ' + t('\\sqrt{' + A + '}') + ' using its largest perfect square factor.'], 'circle radius from area ' + A + 'π');
        } }] },
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '5', level: 'ADV', make: function (r) {
          var c, b, e, x, y, s, m2, f, z, i;
          for (i = 0; i < 500; i++) {
            c = r.pick([2, 3]); b = r.pick([2, 3, 5, 6, 7]); e = r.pick(c === 3 ? [2, 5, 6, 7] : [3, 5, 6, 7]); x = Math.pow(c, 6) * b; y = e * c * c * c; s = ex.nthFactor(y, 2); m2 = y / (s * s); f = r.int(2, 40); z = f * s;
            if (m2 > 1 && s > 1 && z !== x && Math.abs(z - y) >= 2) break;
          }
          var a = c * c, V = { x: x, y: y, z: z }, right = ['x', 'y', 'z'].sort(function (p, q) { return V[p] - V[q]; });
          var perms = [['x', 'y', 'z'], ['x', 'z', 'y'], ['y', 'x', 'z'], ['y', 'z', 'x'], ['z', 'x', 'y'], ['z', 'y', 'x']].filter(function (pp) { return pp.join() !== right.join(); });
          var opts = [right].concat(r.sample(perms, 3)).map(function (pp, j) {
            var bad = null; for (var q = 0; q < 2 && !bad; q++) if (V[pp[q]] > V[pp[q + 1]]) bad = [pp[q], pp[q + 1]];
            return { html: t(pp.join('<')), right: j === 0, why: bad ? 'Your choice says ' + t(bad[0] + '<' + bad[1]) + '. Find both values exactly and compare them again.' : null };
          });
          var cx = Math.pow(c, 3);
          return P.mc(r, 'Consider the following three equations.<div class="numlist">' + '<span>' + t(a + '\\sqrt[3]{' + b + '}=\\sqrt[3]{x}') + '</span><span>' + t(e + '\\sqrt{x}=y\\sqrt{' + b + '}') + '</span><span>' + t(f + '\\sqrt{y}=z\\sqrt{' + m2 + '}') + '</span></div>Which of the statements below is correct?', opts,
            '<b>Find ' + t('x') + ':</b> cube both sides of ' + t(a + '\\sqrt[3]{' + b + '}=\\sqrt[3]{x}') + ': ' + t('x=' + a + '^{3}\\times ' + b + '=' + Math.pow(a, 3) + '\\times ' + b + '=' + F(x)) + '.<br>' +
            '<b>Find ' + t('y') + ':</b> ' + t(F(x) + '=' + cx * cx + '\\times ' + b + '=' + cx + '^{2}\\times ' + b) + ', so ' + t('\\sqrt{' + F(x) + '}=' + rad(cx, 2, b)) + '. Then ' + t(e + '(' + rad(cx, 2, b) + ')=' + rad(e * cx, 2, b) + '=y\\sqrt{' + b + '}') + ', so ' + t('y=' + y) + '.<br>' +
            '<b>Find ' + t('z') + ':</b> ' + t(y + '=' + s * s + '\\times ' + m2) + ', so ' + t('\\sqrt{' + y + '}=' + rad(s, 2, m2)) + '. Then ' + t(f + '(' + rad(s, 2, m2) + ')=' + rad(f * s, 2, m2) + '=z\\sqrt{' + m2 + '}') + ', so ' + t('z=' + z) + '.<br>' +
            'Ordering ' + t('x=' + F(x) + ',\\ y=' + y + ',\\ z=' + z) + ': ' + t(right.map(function (p) { return F(V[p]); }).join('<')) + ', so ' + t(right.join('<')) + '.',
            ['Solve the equations in order: cube both sides of the first to find ' + t('x') + ', then use ' + t('x') + ' in the second and ' + t('y') + ' in the third.', 'Write ' + t('\\sqrt{x}') + ' and ' + t('\\sqrt{y}') + ' as mixed radicals so the radicands match.'], 'radical chain x,y,z');
        } }] },
      { num: '6', section: 'Part B — Numerical Response', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '6', level: 'PRG', make: function (r) {
          var a, m, v, i;
          for (i = 0; i < 300; i++) { a = r.int(3, 9); m = r.pick([2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]); v = a * a * a * m; if (v >= 100 && v <= 9999) break; }
          return P.nr('When ' + t(rad(a, 3, m)) + ' is written as an entire radical, the value of the radicand is ________.', v, function (u) {
            if (u === a * m) return { code: 'no-power', hint: 'Before ' + t(a) + ' moves inside a cube root it has to be <b>cubed</b>: ' + t(a + '=\\sqrt[3]{' + a * a * a + '}') + '.' };
            if (u === a * a * m) return { code: 'squared-not-cubed', hint: 'This is a <b>cube</b> root, so cube the coefficient: ' + t(a + '^{3}=' + a * a * a) + ', not ' + t(a + '^{2}') + '.' };
            if (u === a * a * a + m) return { code: 'added', hint: 'Multiply ' + t(a * a * a) + ' by ' + t(m) + ' — don’t add them.' };
            if (u === a * a * a) return { code: 'no-radicand', hint: 'That’s ' + t(a + '^{3}') + '. Now multiply it by the radicand ' + t(m) + '.' };
            return null;
          }, 'To move a coefficient inside a radical of index ' + t('3') + ', cube it and multiply by the radicand:<br>' + t(rad(a, 3, m) + '=\\sqrt[3]{' + a + '^{3}\\times ' + m + '}=\\sqrt[3]{' + a * a * a + '\\times ' + m + '}=\\sqrt[3]{' + F(v) + '}') + '.<br>Radicand ' + t('=' + F(v)) + '.',
          ['A number in front of a cube root equals the cube root of its <b>cube</b>.'], 'entire radicand of ' + a + 'cbrt' + m);
        } }] },
      { num: '7', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '7', level: 'ADV', make: function (r) {
          var s, b, V, i;
          for (i = 0; i < 300; i++) { s = r.int(2, 6); b = r.int(2, 40); V = s * s * s * b; if (ex.simplest(b, 3) && V >= 100 && V <= 9999 && ex.nthFactor(V, 3) === s) break; }
          var ans = s + b, divs = nt.divisors(s).filter(function (d) { return d > 1 && d < s; });
          return P.nr('The volume of a cube of edge length ' + t('x') + ' cm is given by the formula ' + t('V=x^{3}') + '. A storage cube has a volume of ' + t(F(V)) + ' cm' + t('^{3}') + '. A student determined that the exact length of each edge of the cube could be written in the form ' + t('a\\sqrt[3]{b}') + ', where ' + t('a') + ' and ' + t('b') + ' are whole numbers (in simplest form). The value of ' + t('a+b') + ' is ________.', ans, function (u) {
            if (u === s * s * s + b) return { code: 'cube-itself', hint: 'The perfect cube ' + t(s * s * s) + ' comes out of the cube root as ' + t('\\sqrt[3]{' + s * s * s + '}=' + s) + '.' };
            if (u === s * b) return { code: 'mult-ab', hint: 'The question asks for ' + t('a+b') + ' — add them.' };
            if (u === 1 + V) return { code: 'unsimplified', hint: t('\\sqrt[3]{' + F(V) + '}') + ' can be simplified: look for a perfect cube factor of ' + t(F(V)) + '.' };
            for (var j = 0; j < divs.length; j++) if (u === divs[j] + Math.pow(s / divs[j], 3) * b) return { code: 'partial', hint: 'Not finished: ' + t(rad(divs[j], 3, Math.pow(s / divs[j], 3) * b)) + ' still has a perfect cube under the root. Use the <b>largest</b> perfect cube factor.' };
            return null;
          }, 'The edge is ' + t('x=\\sqrt[3]{' + F(V) + '}') + ' cm. Take out the largest perfect cube: ' + t(F(V) + '=' + s * s * s + '\\times ' + b + '=' + s + '^{3}\\times ' + b) + ', so<br>' + t('\\sqrt[3]{' + F(V) + '}=' + rad(s, 3, b)) + '.<br>' + t(b) + ' has no cube factor left, so ' + t('a=' + s) + ', ' + t('b=' + b) + ' and ' + t('a+b=' + ans) + '.',
          ['The edge is ' + t('\\sqrt[3]{' + F(V) + '}') + '. Find the largest perfect cube that divides ' + t(F(V)) + ' (try ' + t('8, 27, 64, 125, 216') + ').'], 'cube edge a cbrt b, V=' + V);
        } }] },
      { num: '8', section: 'Part C — Written Response', shared: gameShared, stem: gameStem, parts: [
        { id: '8a', level: 'EMG', make: function (r, sh) {
          var p = sh.pts, n = sh.neg, ans = p.I + p.Q;
          return P.number('A student selects a card that has the number ' + t('-' + n) + ' on it. How many points are awarded for this card?', ans, function (v) {
            if (v === p.N + p.W + p.I + p.Q) return { code: 'game-pos', hint: t('-' + n) + ' is negative, so it is neither a natural number nor a whole number.' };
            if (v === p.W + p.I + p.Q) return { code: 'game-W', hint: 'Whole numbers are ' + t('0, 1, 2, \\ldots') + ' — no negatives.' };
            if (v === p.I) return { code: 'game-noQ', hint: t('-' + n) + ' is an integer, but it is also rational: ' + t('-' + n + '=\\frac{-' + n + '}{1}') + '.' };
            if (v === p.Q) return { code: 'game-I', hint: t('-' + n) + ' is rational, and it is also an integer.' };
            return null;
          }, t('-' + n) + ' is negative, so it is neither natural nor whole. It <b>is</b> an integer, and ' + t('-' + n + '=\\frac{-' + n + '}{1}') + ' makes it rational as well.<br>Points: ' + t(p.I + '+' + p.Q + '=' + ans) + '.',
          ['List every category ' + t('-' + n) + ' belongs to, then add those points.'], 'card game: points for -' + n);
        } },
        { id: '8b', level: 'PRG', make: function (r, sh) { return setsPart('Student ' + t('A') + ' is dealt ' + handTex(sh.hands[0]) + '. Tick every category each card belongs to.', sh.hands[0], true, 'card game: classify hand A'); } },
        { id: '8c', level: 'PRG', make: function (r, sh) { return setsPart('Student ' + t('B') + ' is dealt ' + handTex(sh.hands[1]) + '. Tick every category each card belongs to.', sh.hands[1], true, 'card game: classify hand B'); } },
        { id: '8d', level: 'ADV', make: function (r, sh) { return setsPart('Student ' + t('C') + ' is dealt ' + handTex(sh.hands[2]) + '. Tick every category each card belongs to.', sh.hands[2], true, 'card game: classify hand C'); } },
        { id: '8e', level: 'PRG', make: function (r, sh) {
          var tots = sh.hands.map(function (h) { return h.reduce(function (s, c) { return s + c.pts; }, 0); });
          return P.fields('Determine the point total for each student.<br>' + ['A', 'B', 'C'].map(function (L, i) { return 'Student ' + t(L) + ': ' + handTex(sh.hands[i]); }).join('<br>'),
            ['A', 'B', 'C'].map(function (L) { return { label: 'Student ' + t(L) + ':', after: 'points', name: 'Student ' + L }; }), sh.hands.map(totalChk), tots.map(String),
            ['A', 'B', 'C'].map(function (L, i) { return 'Student ' + t(L) + ': ' + t(tots[i]); }).join(', '),
            ['A', 'B', 'C'].map(function (L, i) { return '<b>Student ' + t(L) + '</b><br>' + handSol(sh.hands[i]); }).join('<br>'),
            ['Score each card separately: add the points for every category it belongs to.', 'Simplify each card first, e.g. ' + t('-\\sqrt{81}=-9') + '.'], 'card game: totals');
        } },
        { id: '8f', level: 'PRG', make: function (r, sh) {
          var tots = sh.hands.map(function (h) { return h.reduce(function (s, c) { return s + c.pts; }, 0); }), best = Math.max.apply(null, tots);
          return P.mc(r, 'Which student wins?', ['A', 'B', 'C'].map(function (L, i) { return { html: 'Student ' + t(L), right: tots[i] === best, why: tots[i] === best ? null : 'Student ' + t(L) + ' scores ' + t(tots[i]) + ' points. Compare all three totals again.' }; }),
            'Totals: ' + ['A', 'B', 'C'].map(function (L, i) { return t(L + '=' + tots[i]); }).join(', ') + '. The highest total is ' + t(best) + ', so <b>Student ' + t(['A', 'B', 'C'][tots.indexOf(best)]) + ' wins</b>.',
            ['Use your three totals from the previous part.'], 'card game: winner', true);
        } }] }
    ],
    extra: [
      /* ===== Part A — Factorization and number theory ===== */
      { num: '1', section: 'Extra practice A — Factorization and number theory',
        shared: function (r) {
          var mf = [[2, 6], [3, r.pick([2, 4])], [5, r.pick([2, 4])]], q = r.pick([7, 11]), nf = [[2, r.pick([1, 3, 5])], [3, r.pick([2, 4])], [q, 1]];
          return { mf: mf, nf: nf, m: fVal(mf), n: fVal(nf) };
        },
        stem: function (sh) { return 'Let ' + t('m=' + fTex(sh.mf)) + ' and ' + t('n=' + fTex(sh.nf)) + '. Answer every part <b>from the exponents</b> — don’t multiply out unless a part asks you to.'; },
        parts: [
          { id: 'e1a', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.fields('How many factors does ' + t('m') + ' have? How many does ' + t('n') + ' have?', [{ label: 'Factors of ' + t('m') + ':', name: 'm' }, { label: 'Factors of ' + t('n') + ':', name: 'n' }],
              [numChk(nDiv(sh.mf), countAlts(sh.mf)), numChk(nDiv(sh.nf), countAlts(sh.nf))], [String(nDiv(sh.mf)), String(nDiv(sh.nf))], t('m') + ': ' + t(nDiv(sh.mf)) + ', &nbsp; ' + t('n') + ': ' + t(nDiv(sh.nf)),
              'Add ' + t('1') + ' to each exponent and multiply (a factor uses each prime from ' + t('0') + ' times up to its exponent).<br>' + countSol('m', sh.mf) + '<br>' + countSol('n', sh.nf), ['Use ' + t('(a+1)(b+1)(c+1)') + ' with the exponents.'], 'factor counts of m, n');
          } },
          { id: 'e1b', level: 'PRG', outcome: 'AN1', make: function (r, sh) { return sqCubePart(r, 'm', sh.mf); } },
          { id: 'e1c', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            var gf = gcdF(sh.mf, sh.nf), g = fVal(gf), l = fVal(lcmF(sh.mf, sh.nf)), hi = fVal(sharedHighF(sh.mf, sh.nf));
            var alts = [{ v: l, code: 'gcf-lcm', hint: 'That’s the LCM. The GCF uses only the primes <b>both</b> numbers share, each to the <b>lower</b> power.' }, { v: hi, code: 'gcf-high', hint: 'Right primes, but the GCF takes the <b>lower</b> power of each shared prime.' }].filter(function (a) { return a.v !== g; });
            return P.fields('Determine the GCF of ' + t('m') + ' and ' + t('n') + ' in exponent form <i>and</i> as a single number.', [{ label: 'Exponent form:', mode: 'text', wide: true, name: 'Exponent form', placeholder: 'e.g. 2^3 × 3' }, { label: 'Single number:', name: 'Single number' }],
              [prodChk(g, alts), numChk(g, alts)], [fTex(gf), String(g)], t('\\text{GCF}=' + fTex(gf) + '=' + F(g)),
              'The shared primes are ' + t(gf.map(function (pe) { return pe[0]; }).join('\\text{ and }')) + '; take the lower power of each:<br>' + t('\\text{GCF}=' + fTex(gf) + '=' + gf.map(function (pe) { return F(Math.pow(pe[0], pe[1])); }).join('\\times ') + '=' + F(g)) + '.',
              ['Use only the primes in <b>both</b> numbers, each to the lower power.'], 'GCF of m, n');
          } },
          { id: 'e1d', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            var lf = lcmF(sh.mf, sh.nf), l = fVal(lf), g = fVal(gcdF(sh.mf, sh.nf)), hi = fVal(sharedHighF(sh.mf, sh.nf));
            var alts = [{ v: g, code: 'gcf-lcm', hint: 'That’s the GCF. The LCM uses <b>every</b> prime in either number, each to the <b>higher</b> power.' }, { v: hi, code: 'lcm-missing', hint: 'The LCM needs every prime that appears in <b>either</b> number — including the ones only one of them has.' }, { v: sh.m * sh.n, code: 'lcm-product', hint: t('m\\times n') + ' is a common multiple, but not the <b>least</b> one: use each prime once, to its higher power.' }].filter(function (a) { return a.v !== l; });
            return P.fields('Determine the LCM of ' + t('m') + ' and ' + t('n') + ' in exponent form <i>and</i> as a single number.', [{ label: 'Exponent form:', mode: 'text', wide: true, name: 'Exponent form', placeholder: 'e.g. 2^3 × 3' }, { label: 'Single number:', name: 'Single number', wide: true }],
              [prodChk(l, alts), numChk(l, alts)], [fTex(lf), String(l)], t('\\text{LCM}=' + fTex(lf) + '=' + F(l)),
              'Every prime in either number, higher power of each:<br>' + t('\\text{LCM}=' + fTex(lf) + '=' + F(l)) + '.',
              ['Use every prime that appears in either number, each to the higher power.'], 'LCM of m, n');
          } },
          { id: 'e1e', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            var v = fVal(sh.mf.map(function (pe) { return [pe[0], pe[1] / 2]; }));
            return P.math('Is ' + t('\\sqrt{m}') + ' rational? If it is, give its exact value; if it is not, write it in simplest mixed radical form.', intChk(v, function (u) { if (Math.abs(u * 2 - sh.m) < 1e-9) return { code: 'halved-exp', hint: 'A square root halves the <b>exponents</b>, not the number itself.' }; return null; }), String(v),
              'Every exponent of ' + t('m') + ' is even, so ' + t('\\sqrt{m}') + ' is <b>rational</b>. Halve each exponent:<br>' + t('\\sqrt{m}=' + fTex(sh.mf.map(function (pe) { return [pe[0], pe[1] / 2]; })) + '=' + F(v)) + '.<br>Check: ' + t(F(v) + '^{2}=' + F(sh.m)) + '.',
              ['Look at the exponents of ' + t('m') + '. If they are all even, halve each one.'], 'sqrt(m) exact', { keys: 'radical' });
          } },
          { id: 'e1f', level: 'PRG', make: function (r, sh) {
            var mx = mixedOf(sh.nf, 2);
            return P.radical('Is ' + t('\\sqrt{n}') + ' rational? Write it in simplest form.', { k: mx.k, n: 2, m: mx.m }, 'mixed',
              'The exponents ' + sh.nf.filter(function (pe) { return pe[1] % 2; }).map(function (pe) { return t(pe[1]); }).join(' and ') + ' are odd, so ' + t('\\sqrt{n}') + ' is <b>not rational</b>. Take out the largest even power of each prime:<br>' +
              t('n=' + fTex(sh.nf.map(function (pe) { return [pe[0], pe[1] - pe[1] % 2]; })) + '\\times(' + fTex(sh.nf.map(function (pe) { return [pe[0], pe[1] % 2]; })) + ')') + '<br>' + t('\\sqrt{n}=' + fTex(sh.nf.map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; })) + '\\sqrt{' + fTex(sh.nf.map(function (pe) { return [pe[0], pe[1] % 2]; })) + '}=' + rad(mx.k, 2, mx.m)) + '.',
              ['Split each prime power into an even power (comes out, exponent halved) and what is left over (stays under the root).'], 'sqrt(n) simplest');
          } },
          { id: 'e1g', level: 'ADV', make: function (r, sh) {
            var mx = mixedOf(sh.mf, 3);
            return P.radical('Is ' + t('\\sqrt[3]{m}') + ' rational? Write it in simplest mixed radical form.', { k: mx.k, n: 3, m: mx.m }, 'mixed',
              'The exponents ' + sh.mf.filter(function (pe) { return pe[1] % 3; }).map(function (pe) { return t(pe[1]); }).join(' and ') + ' are not multiples of ' + t('3') + ', so ' + t('\\sqrt[3]{m}') + ' is <b>not rational</b>. Take out the largest multiple-of-3 power of each prime:<br>' +
              t('m=' + fTex(sh.mf.map(function (pe) { return [pe[0], pe[1] - pe[1] % 3]; })) + '\\times(' + fTex(sh.mf.map(function (pe) { return [pe[0], pe[1] % 3]; })) + ')') + '<br>' +
              t('\\sqrt[3]{m}=' + fTex(sh.mf.map(function (pe) { return [pe[0], Math.floor(pe[1] / 3)]; })) + '\\sqrt[3]{' + fTex(sh.mf.map(function (pe) { return [pe[0], pe[1] % 3]; })) + '}=' + rad(mx.k, 3, mx.m)) + '.',
              ['For a cube root, each prime comes out once for every ' + t('3') + ' copies (divide the exponent by ' + t('3') + ').'], 'cbrt(m) simplest');
          } },
          { id: 'e1h', level: 'PRG', make: function (r, sh) {
            var s = fVal(sh.mf.map(function (pe) { return [pe[0], pe[1] / 2]; })), a = mixedOf(sh.nf, 2), b = mixedOf(sh.mf, 3);
            return setsPart('Classify each number: tick every set it belongs to.', [{ id: 'sm', tex: '\\sqrt{m}', cls: 'nat', note: '\\sqrt{m}=' + F(s) }, { id: 'sn', tex: '\\sqrt{n}', cls: 'irr', note: '\\sqrt{n}=' + rad(a.k, 2, a.m) }, { id: 'cm', tex: '\\sqrt[3]{m}', cls: 'irr', note: '\\sqrt[3]{m}=' + rad(b.k, 3, b.m) }], false, 'classify sqrt m, sqrt n, cbrt m');
          } }] },
      { num: '2',
        shared: function (r) {
          var pf, p, i;
          for (i = 0; i < 300; i++) { var P2 = r.pick([3, 5]), P3 = r.pick([7, 3, 5].filter(function (x) { return x !== P2; })); pf = fSort([[2, r.pick([5, 1, 7])], [P2, r.pick([2, 4])], [P3, 3]]); p = fVal(pf); if (p >= 1000 && p <= 999999) break; }
          return { pf: pf, p: p };
        },
        stem: function (sh) { return 'Let ' + t('p=' + fTex(sh.pf)) + '.'; },
        parts: [
          { id: 'e2a', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.fields('Write ' + t('p') + ' as a single number, and state how many factors it has.', [{ label: t('p='), name: 'p', wide: true }, { label: 'Number of factors:', name: 'Factors' }], [K.number(sh.p), numChk(nDiv(sh.pf), countAlts(sh.pf))], [String(sh.p), String(nDiv(sh.pf))],
              t('p=' + F(sh.p)) + ', ' + t(nDiv(sh.pf)) + ' factors', t('p=' + sh.pf.map(function (pe) { return F(Math.pow(pe[0], pe[1])); }).join('\\times ') + '=' + F(sh.p)) + '<br>' + countSol('p', sh.pf),
              ['Evaluate each prime power, then multiply.', 'Number of factors: add 1 to each exponent and multiply.'], 'p as number, factor count');
          } },
          { id: 'e2b', level: 'ADV', outcome: 'AN1', make: function (r, sh) {
            var u = powerUp(sh.pf, 2);
            return P.fields('Find the <b>smallest</b> natural number ' + t('k') + ' for which ' + t('pk') + ' is a perfect square, and state ' + t('\\sqrt{pk}') + '.', [{ label: t('k='), name: 'k' }, { label: t('\\sqrt{pk}='), name: '√(pk)', wide: true }],
              [numChk(u.k, kAlts(sh.pf, 2)), numChk(u.root, [{ v: sh.p * u.k, code: 'root-of-k', hint: 'That’s ' + t('pk') + ' itself. Now take its square root (halve each exponent).' }])], [String(u.k), String(u.root)], t('k=' + u.k) + ', ' + t('\\sqrt{pk}=' + F(u.root)),
              powerSol('p', sh.pf, 2), ['Which exponents of ' + t('p') + ' are odd? Each needs one more copy of its prime.'], 'k for perfect square');
          } },
          { id: 'e2c', level: 'ADV', outcome: 'AN1', make: function (r, sh) {
            var u = powerUp(sh.pf, 3);
            return P.fields('Find the <b>smallest</b> natural number ' + t('k') + ' for which ' + t('pk') + ' is a perfect cube, and state ' + t('\\sqrt[3]{pk}') + '.', [{ label: t('k='), name: 'k' }, { label: t('\\sqrt[3]{pk}='), name: '∛(pk)', wide: true }],
              [numChk(u.k, kAlts(sh.pf, 3)), numChk(u.root, [{ v: sh.p * u.k, code: 'root-of-k', hint: 'That’s ' + t('pk') + ' itself. Now take its cube root (divide each exponent by 3).' }])], [String(u.k), String(u.root)], t('k=' + u.k) + ', ' + t('\\sqrt[3]{pk}=' + F(u.root)),
              powerSol('p', sh.pf, 3), ['Raise each exponent of ' + t('p') + ' to the next multiple of ' + t('3') + '. What does ' + t('k') + ' have to supply?'], 'k for perfect cube');
          } },
          { id: 'e2d', level: 'PRG', make: function (r, sh) {
            var mx = mixedOf(sh.pf, 2);
            return P.radical('Write ' + t('\\sqrt{p}') + ' in simplest mixed radical form.', { k: mx.k, n: 2, m: mx.m }, 'mixed',
              'Take the largest even power of each prime out:<br>' + t('p=' + fTex(sh.pf.map(function (pe) { return [pe[0], pe[1] - pe[1] % 2]; })) + '\\times(' + fTex(sh.pf.map(function (pe) { return [pe[0], pe[1] % 2]; })) + ')') + '<br>' +
              t('\\sqrt{p}=' + fTex(sh.pf.map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; })) + '\\sqrt{' + fTex(sh.pf.map(function (pe) { return [pe[0], pe[1] % 2]; })) + '}=' + rad(mx.k, 2, mx.m)),
              ['Halve the even part of each exponent; the primes with an odd exponent leave one copy under the root.'], 'sqrt(p) simplest');
          } },
          { id: 'e2e', level: 'PRG', make: function (r, sh) { var mx = mixedOf(sh.pf, 2); return setsPart('List every set ' + t('\\sqrt{p}') + ' belongs to.', [{ id: 'sp', tex: '\\sqrt{p}', cls: 'irr', note: '\\sqrt{p}=' + rad(mx.k, 2, mx.m) }], false, 'classify sqrt p'); } },
          { id: 'e2f', level: 'ADV', outcome: 'AN1', make: function (r, sh) {
            var a = powerUp(sh.pf, 2), b = powerUp(sh.pf, 3);
            return P.mc(r, 'How can both values of ' + t('k') + ' be read straight off the exponents of ' + t('p') + ', without guessing or a calculator?', [
              { html: 'A square needs every exponent even and a cube needs every exponent a multiple of ' + t('3') + ', so ' + t('k') + ' supplies only what each exponent is <i>missing</i>. Anything more makes ' + t('k') + ' bigger.', right: true },
              { html: t('k') + ' is the product of all the primes in ' + t('p') + ', each used once.', why: 'That would also change exponents that are already fine. For a square here you only need ' + t('k=' + a.k) + '.' },
              { html: t('k') + ' is the smallest prime that does not divide ' + t('p') + '.', why: 'A new prime arrives with exponent ' + t('1') + ', which is neither even nor a multiple of ' + t('3') + ' — it makes things worse.' },
              { html: 'Try ' + t('k=2, 3, 4, \\ldots') + ' on a calculator until the root is a whole number.', why: 'That works eventually, but it is guessing. The exponents tell you ' + t('k') + ' directly.' }],
              'A perfect square needs every exponent even; a perfect cube needs every exponent a multiple of ' + t('3') + '. So ' + t('k') + ' only has to supply what each exponent of ' + t('p=' + fTex(sh.pf)) + ' is missing: for a square ' + t('k=' + fTex(a.kf) + '=' + a.k) + ', for a cube ' + t('k=' + fTex(b.kf) + '=' + b.k) + '. The roots follow by dividing each new exponent by ' + t('2') + ' or ' + t('3') + '.',
              ['What does a perfect square need its exponents to be? A perfect cube?'], 'explain k from exponents');
          } }] },
      { num: '3',
        shared: function (r) {
          var af, bf, a, b, i;
          for (i = 0; i < 300; i++) {
            var x1 = r.int(1, 3), x2 = r.int(1, 3), z1 = r.int(1, 2), z2 = r.int(1, 2), y2 = r.pick([2, 3]);
            if (x1 === x2 || z1 === z2) continue;
            af = [[2, x1], [3, 1], [5, z1]]; bf = [[2, x2], [3, y2], [5, z2]]; a = fVal(af); b = fVal(bf);
            if (a <= 6000 && b <= 6000) break;
          }
          return { af: af, bf: bf, a: a, b: b, gf: gcdF(af, bf), lf: lcmF(af, bf), g: fVal(gcdF(af, bf)), l: fVal(lcmF(af, bf)) };
        },
        stem: function (sh) { return 'Let ' + t('a=' + fTex(sh.af)) + ' and ' + t('b=' + fTex(sh.bf)) + '.'; },
        parts: [
          { id: 'e3a', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.fields('Determine ' + t('\\text{GCF}(a,b)') + ' and ' + t('\\text{LCM}(a,b)') + ' in exponent form.', [{ label: 'GCF:', mode: 'text', wide: true, name: 'GCF', placeholder: 'e.g. 2^3 × 3' }, { label: 'LCM:', mode: 'text', wide: true, name: 'LCM', placeholder: 'e.g. 2^3 × 3' }],
              [prodChk(sh.g, [{ v: sh.l, code: 'gcf-lcm', hint: 'That’s the LCM. The GCF takes the <b>lower</b> power of each shared prime.' }]), prodChk(sh.l, [{ v: sh.g, code: 'gcf-lcm', hint: 'That’s the GCF. The LCM takes the <b>higher</b> power of each prime.' }, { v: sh.a * sh.b, code: 'lcm-product', hint: t('ab') + ' is a common multiple, but not the least one.' }])],
              [fTex(sh.gf), fTex(sh.lf)], t('\\text{GCF}=' + fTex(sh.gf) + '\\ (=' + F(sh.g) + ')') + ', ' + t('\\text{LCM}=' + fTex(sh.lf) + '\\ (=' + F(sh.l) + ')'),
              'Shared primes ' + t('2, 3, 5') + ' — lower power of each: ' + t('\\text{GCF}(a,b)=' + fTex(sh.gf) + '=' + F(sh.g)) + '.<br>Higher power of each: ' + t('\\text{LCM}(a,b)=' + fTex(sh.lf) + '=' + F(sh.l)) + '.',
              ['GCF: lower power of each shared prime. LCM: higher power of every prime.'], 'GCF, LCM exponent form');
          } },
          { id: 'e3b', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.number('Verify that ' + t('\\text{GCF}(a,b)\\times\\text{LCM}(a,b)=ab') + ' by evaluating both sides. Both sides equal', sh.a * sh.b, function (v) { if (v === sh.g + sh.l) return { code: 'lcm-sum', hint: 'Multiply the GCF and the LCM — don’t add them.' }; return null; },
              t('a=' + fTex(sh.af) + '=' + F(sh.a)) + ', ' + t('b=' + fTex(sh.bf) + '=' + F(sh.b)) + '.<br>Left: ' + t(F(sh.g) + '\\times ' + F(sh.l) + '=' + F(sh.g * sh.l)) + '<br>Right: ' + t(F(sh.a) + '\\times ' + F(sh.b) + '=' + F(sh.a * sh.b)) + ' ✓',
              ['Evaluate ' + t('a') + ', ' + t('b') + ', the GCF and the LCM as numbers first.'], 'GCF×LCM = ab', { after: '' });
          } },
          { id: 'e3c', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            var red = ex.norm(sh.a, sh.b);
            return P.fraction('Reduce ' + t('\\dfrac{a}{b}') + ' to lowest terms.', [sh.a, sh.b], {},
              t('\\frac{a}{b}=\\frac{' + fTex(sh.af) + '}{' + fTex(sh.bf) + '}=\\frac{' + F(sh.a) + '}{' + F(sh.b) + '}') + '. Divide the top and bottom by the GCF ' + t(F(sh.g)) + ':<br>' + t('\\frac{' + F(sh.a) + '\\div ' + sh.g + '}{' + F(sh.b) + '\\div ' + sh.g + '}=' + ex.texRat(red)),
              ['Cancel the shared prime factors — or divide the top and bottom by the GCF.'], 'reduce a/b');
          } },
          { id: 'e3d', level: 'BEG', outcome: 'AN1', make: function (r, sh) {
            return P.mc(r, 'To reduce ' + t('\\frac{a}{b}') + ' to lowest terms in one step, which number from your work above do you divide the top and bottom by?', [
              { html: 'The GCF, ' + t(F(sh.g)), right: true },
              { html: 'The LCM, ' + t(F(sh.l)), why: 'The LCM is a <b>multiple</b> of ' + t('a') + ' and ' + t('b') + ' — it doesn’t divide into them.' },
              { html: 'The product ' + t('ab=' + F(sh.a * sh.b)), why: t('ab') + ' is bigger than both numbers, so it can’t divide into them.' },
              { html: 'The smallest shared prime, ' + t('2'), why: 'Dividing by ' + t('2') + ' is a start, but it doesn’t finish the job in one step. Which number contains <i>every</i> shared factor?' }],
              'Dividing the top and bottom by the <b>GCF</b> (' + t(F(sh.g)) + ') removes every shared factor at once: ' + t('\\frac{' + F(sh.a) + '}{' + F(sh.b) + '}=' + ex.texRat(ex.norm(sh.a, sh.b))) + '.', ['Which number is the biggest one that divides both ' + t('a') + ' and ' + t('b') + '?'], 'reduce using GCF');
          } },
          { id: 'e3e', level: 'PRG', make: function (r, sh) {
            var red = ex.norm(sh.a, sh.b);
            return P.mc(r, 'Factor the <b>reduced</b> denominator of ' + t('\\frac{a}{b}') + ' and use it to predict: does the decimal terminate or repeat?', [
              { html: 'Repeats: the reduced denominator has a prime factor other than ' + t('2') + ' and ' + t('5') + '.', right: true },
              { html: 'Terminates: the original denominator ' + t('b') + ' contains 2s and 5s.', why: 'Use the <b>reduced</b> denominator, and look for primes <b>other</b> than 2 and 5: any other prime makes the decimal repeat.' },
              { html: 'Terminates: both ' + t('a') + ' and ' + t('b') + ' contain only the primes ' + t('2, 3, 5') + '.', why: 'The ' + t('3') + ' is the problem: only 2s and 5s in the reduced denominator give a terminating decimal.' },
              { html: 'Repeats: the numerator is ' + (red[0] > red[1] ? 'larger' : 'smaller') + ' than the denominator.', why: 'The size of the numerator doesn’t matter — only the primes in the reduced denominator.' }],
              'Reduced: ' + t('\\frac{a}{b}=' + ex.texRat(red)) + '. Denominator ' + t(denEq(red[1])) + ' contains ' + t('3') + ', which is neither ' + t('2') + ' nor ' + t('5') + ', so the decimal <b>repeats</b>.',
              ['A fraction in lowest terms terminates exactly when its denominator has no prime factors other than ' + t('2') + ' and ' + t('5') + '.'], 'predict a/b decimal');
          } },
          { id: 'e3f', level: 'PRG', make: function (r, sh) {
            var red = ex.norm(sh.a, sh.b);
            return P.repeating('Write ' + t('\\frac{a}{b}') + ' as a decimal (use bar notation).', red, {}, t(ex.texRat(red) + '=' + red[0] + '\\div ' + red[1] + '=' + K.decTex(red)) + ' — it repeats, as predicted ✓', ['Divide the reduced numerator by the reduced denominator and watch for the repeating block.'], 'decimal of a/b');
          } },
          { id: 'e3g', level: 'PRG', make: function (r, sh) {
            var red = ex.norm(sh.a, sh.b);
            return setsPart('List every set ' + t('\\frac{a}{b}') + ' belongs to. (The strictest set is the smallest one in the chain ' + t('N\\subset W\\subset I\\subset Q\\subset R') + '.)', [{ id: 'ab', tex: '\\frac{a}{b}', cls: 'frac', note: '\\frac{a}{b}=' + ex.texRat(red) }], false, 'classify a/b', '<br>The strictest set is ' + t('Q') + ': ' + t(ex.texRat(red)) + ' is a ratio of integers, but not an integer.');
          } }] },
      { num: '4',
        shared: function (r) { var ps = r.sample([2, 3, 5, 7], 3).sort(function (a, b) { return a - b; }), es = r.shuffle([1, 3, 2]), f = ps.map(function (p, i) { return [p, es[i]]; }); return { f: f, N: fVal(f) }; },
        stem: function (sh) { return 'Let ' + t('N=' + F(sh.N)) + '.'; },
        parts: [
          { id: 'e4a', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.fields('Find the prime factorization of ' + t('N') + ' in exponent form, and state how many factors ' + t('N') + ' has.', [{ label: t('N='), mode: 'text', wide: true, name: 'Factorization', placeholder: 'e.g. 2^3 × 3' }, { label: 'Number of factors:', name: 'Factors' }],
              [K.product(sh.N, 'required'), numChk(nDiv(sh.f), countAlts(sh.f))], [fTex(sh.f), String(nDiv(sh.f))], t('N=' + fTex(sh.f)) + ', ' + t(nDiv(sh.f)) + ' factors',
              'Divide by the smallest prime each time:' + K.ladderSolution(sh.N) + t(F(sh.N) + '=' + fTex(sh.f)) + '<br>' + countSol('N', sh.f),
              ['Start dividing by ' + t('2') + ', then ' + t('3') + ', ' + t('5') + ', ' + t('7') + ', …', 'Number of factors: add 1 to each exponent and multiply.'], 'factor N, count');
          } },
          { id: 'e4b', level: 'PRG', outcome: 'AN1', make: function (r, sh) { return sqCubePart(r, 'N', sh.f); } },
          { id: 'e4c', level: 'PRG', make: function (r, sh) {
            var mx = mixedOf(sh.f, 2);
            return P.radical('Write ' + t('\\sqrt{N}') + ' in simplest mixed radical form.', { k: mx.k, n: 2, m: mx.m }, 'mixed',
              t('N=' + fTex(sh.f.map(function (pe) { return [pe[0], pe[1] - pe[1] % 2]; })) + '\\times(' + fTex(sh.f.map(function (pe) { return [pe[0], pe[1] % 2]; })) + ')') + '<br>' + t('\\sqrt{N}=' + fTex(sh.f.map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; })) + '\\sqrt{' + fTex(sh.f.map(function (pe) { return [pe[0], pe[1] % 2]; })) + '}=' + rad(mx.k, 2, mx.m)),
              ['Use the prime factorization: each pair of equal primes comes out as one.'], 'sqrt(N) simplest');
          } },
          { id: 'e4d', level: 'PRG', make: function (r, sh) { var mx = mixedOf(sh.f, 2); return setsPart('Classify ' + t('\\sqrt{N}') + ': tick every set it belongs to.', [{ id: 'sN', tex: '\\sqrt{N}', cls: 'irr', note: '\\sqrt{N}=' + rad(mx.k, 2, mx.m) }], false, 'classify sqrt N'); } },
          { id: 'e4e', level: 'ADV', outcome: 'AN1', make: function (r, sh) {
            var u = powerUp(sh.f, 2);
            return P.fields('Find the smallest natural number ' + t('k') + ' for which ' + t('kN') + ' is a perfect square, and state ' + t('\\sqrt{kN}') + '.', [{ label: t('k='), name: 'k' }, { label: t('\\sqrt{kN}='), name: '√(kN)' }],
              [numChk(u.k, kAlts(sh.f, 2)), numChk(u.root, [{ v: sh.N * u.k, code: 'root-of-k', hint: 'That’s ' + t('kN') + ' itself. Now take its square root.' }])], [String(u.k), String(u.root)], t('k=' + u.k) + ', ' + t('\\sqrt{kN}=' + u.root),
              powerSol('N', sh.f, 2), ['Which exponents of ' + t('N') + ' are odd?'], 'k for kN square');
          } },
          { id: 'e4f', level: 'MAS', make: function (r, sh) {
            var mx = mixedOf(sh.f, 2);
            return P.mc(r, 'What does the radicand left under the root in ' + t('\\sqrt{N}=' + rad(mx.k, 2, mx.m)) + ' tell you about ' + t('k') + '?', [
              { html: 'They are the same number: the leftover radicand ' + t(mx.m) + ' is the product of the primes with odd exponents — exactly what ' + t('k') + ' must supply.', right: true },
              { html: t('k') + ' is the coefficient ' + t(mx.k) + ', because that is what came out of the root.', why: 'Multiplying ' + t('N') + ' by ' + t(mx.k) + ' adds even more copies of primes that were already paired. Which primes were <i>not</i> paired?' },
              { html: t('k') + ' is the square of the radicand, ' + t(mx.m * mx.m) + '.', why: 'That makes a perfect square, but not the <b>smallest</b>: ' + t('\\sqrt{' + mx.m + 'N}') + ' already works.' },
              { html: 'There is no connection; ' + t('k') + ' has to be found by trial.', why: 'Check: ' + t('\\sqrt{' + mx.m + '}\\times ' + rad(mx.k, 2, mx.m) + '=' + mx.k + '\\times ' + mx.m) + ' — a whole number.' }],
              'They are the same number. The radicand ' + t(denEq(mx.m)) + ' is the product of the primes whose exponents were odd — the ones that couldn’t come out in pairs. Multiplying ' + t('N') + ' by those primes makes every exponent even, so ' + t('k=' + mx.m) + '.<br>Check: ' + t('\\sqrt{' + mx.m + 'N}=\\sqrt{' + mx.m + '}\\times ' + rad(mx.k, 2, mx.m) + '=' + mx.k + '\\times ' + mx.m + '=' + mx.k * mx.m) + '.',
              ['Compare your ' + t('k') + ' with the number under the root in ' + t('\\sqrt{N}') + '.'], 'leftover radicand = k');
          } }] },
      /* ===== Part B — Decimals and classification ===== */
      { num: '5', section: 'Extra practice B — Decimals and classification',
        shared: function (r) {
          var q1 = r.pick([20, 25, 40, 8, 16, 50, 80]), p1 = coprimeIn(r, 1, q1 - 1, q1), g1 = r.pick([18, 12, 14, 15, 21, 24, 6, 9]);
          var q2 = r.pick([55, 12, 15, 22, 44, 30, 6, 18, 45]), p2 = coprimeIn(r, 1, q2 - 1, q2), g2 = r.pick([7, 11, 13, 6, 14]);
          var k3 = r.int(3, 9), d3_ = r.pick([174, 138, 186, 222, 246, 258, 114]);
          var q4 = r.pick([11, 9, 33, 3]), p4 = coprimeIn(r, q4 + 1, 3 * q4 - 1, q4), g4 = r.pick([91, 77, 143, 119, 133]);
          var fr = [{ id: 'a', n: p1 * g1, d: q1 * g1, red: [p1, q1], g: g1 }, { id: 'b', n: p2 * g2, d: q2 * g2, red: [p2, q2], g: g2 }, { id: 'c', n: k3 * d3_, d: d3_, red: [k3, 1], g: d3_ }, { id: 'd', n: p4 * g4, d: q4 * g4, red: [p4, q4], g: g4 }];
          fr.forEach(function (f) { f.tex = '\\frac{' + F(f.n) + '}{' + F(f.d) + '}'; f.term = terminates(f.red[1]); });
          return { fr: fr };
        },
        stem: 'Take each fraction through the whole chain: reduce it, factor the <b>reduced</b> denominator, predict terminating or repeating, write the decimal, and classify it.',
        parts: [0, 1, 2, 3].map(function (i) {
          return { id: 'e5' + 'abcd'[i], level: i === 1 || i === 3 ? 'PRG' : 'EMG', outcome: 'AN1', make: function (r, sh) {
            var f = sh.fr[i];
            return P.fraction('Reduce ' + t(f.tex) + ' to lowest terms.', [f.n, f.d], {},
              t(F(f.n) + '=' + K.fac(f.n)) + ', ' + t(F(f.d) + '=' + K.fac(f.d)) + '. The GCF is ' + t(F(f.g)) + ':<br>' + t(f.tex + '=\\frac{' + F(f.n) + '\\div ' + F(f.g) + '}{' + F(f.d) + '\\div ' + F(f.g) + '}=' + ex.texRat(f.red)),
              ['Find the GCF of the numerator and denominator (prime factorizations help), then divide both by it.'], 'reduce ' + f.n + '/' + f.d);
          } };
        }).concat([
          { id: 'e5e', level: 'PRG', make: function (r, sh) {
            var want = {}, by = {}; sh.fr.forEach(function (f) { want[f.id] = f.term ? 'T' : 'R'; by[f.id] = f; });
            return P.grid('Using the factored <b>reduced</b> denominators, predict whether each decimal terminates or repeats.', sh.fr.map(function (f) { return { id: f.id, html: t(f.tex), label: f.n + '/' + f.d }; }), [{ id: 'T', html: 'Terminates', label: 'Terminates' }, { id: 'R', html: 'Repeats', label: 'Repeats' }], want,
              { why: function (id) { var f = by[id]; return { code: 'term-test', hint: 'Reduce first: ' + t(f.tex + '=' + ex.texRat(f.red)) + '. The reduced denominator ' + t(denEq(f.red[1])) + (f.red[1] === 1 ? ' has no prime factors at all.' : f.term ? ' has only 2s and 5s.' : ' has a prime other than ' + t('2') + ' and ' + t('5') + '.') }; } },
              sh.fr.map(function (f) { return t(f.tex + '=' + ex.texRat(f.red)) + ': denominator ' + t(denEq(f.red[1])) + ' → <b>' + (f.term ? 'terminates' : 'repeats') + '</b>'; }).join('<br>'),
              ['A reduced fraction terminates exactly when its denominator has no prime factors other than ' + t('2') + ' and ' + t('5') + '.'], 'predict terminate/repeat');
          } }]).concat([0, 1, 2, 3].map(function (i) {
            return { id: 'e5' + 'fghi'[i], level: i === 1 ? 'PRG' : 'EMG', make: function (r, sh) {
              var f = sh.fr[i];
              return P.repeating('Write ' + t(f.tex) + ' as a decimal (use bar notation if it repeats).', f.red, {}, t(f.tex + '=' + ex.texRat(f.red) + (f.red[1] === 1 ? '' : '=' + K.decTex(f.red))) + (f.term ? ' (terminates)' : ' (repeats)'),
                ['Use the reduced fraction: divide its numerator by its denominator.'], 'decimal of ' + f.n + '/' + f.d);
            } };
          })).concat([
            { id: 'e5j', level: 'PRG', make: function (r, sh) {
              return setsPart('List every set each number belongs to.', sh.fr.map(function (f) { return { id: f.id, tex: f.tex, cls: f.red[1] === 1 ? 'nat' : 'frac', note: f.tex + '=' + ex.texRat(f.red) }; }), false, 'classify four fractions');
            } }]) },
      { num: '6',
        shared: function (r) {
          var AB = []; for (var v = 10; v <= 98; v++) if (Math.floor(v / 10) !== v % 10 && ex.gcd(v, 99) > 1) AB.push(v);
          var ab = r.pick(AB), ip = r.int(1, 3), d1 = r.int(0, 9), d2 = r.pick([1, 2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x !== d1; }));
          var ABC = []; for (v = 100; v <= 998; v++) { var s = String(v); if (!(s[0] === s[1] && s[1] === s[2]) && ex.gcd(v, 999) > 1) ABC.push(v); }
          var abc = r.pick(ABC), n9 = r.pick([0, 0, 1, 2, 3]);
          var bN = (100 * ip + 10 * d1 + d2) - (10 * ip + d1);
          var ds = [{ id: 'a', tex: '0.\\overline{' + ab + '}', red: ex.norm(ab, 99), raw: [ab, 99], how: 'x=0.\\overline{' + ab + '},\\quad 100x=' + ab + '.\\overline{' + ab + '},\\quad 99x=' + ab },
            { id: 'b', tex: ip + '.' + d1 + '\\overline{' + d2 + '}', red: ex.norm(bN, 90), raw: [bN, 90], how: '100x=' + ip + d1 + d2 + '.\\overline{' + d2 + '},\\quad 10x=' + ip + d1 + '.\\overline{' + d2 + '},\\quad 90x=' + bN },
            { id: 'c', tex: '0.\\overline{' + abc + '}', red: ex.norm(abc, 999), raw: [abc, 999], how: '1000x=' + abc + '.\\overline{' + abc + '},\\quad 999x=' + abc },
            { id: 'd', tex: n9 + '.\\overline{9}', red: [n9 + 1, 1], raw: [9 * n9 + 9, 9], how: '10x=' + (10 * n9 + 9) + '.\\overline{9},\\quad 9x=' + (9 * n9 + 9) }];
          return { ds: ds, n9: n9 };
        },
        stem: 'Run the chain <b>backwards</b>: convert each decimal to a fraction in lowest terms, factor the denominator to confirm that the decimal <i>had</i> to repeat, and classify the number.',
        parts: [0, 1, 2, 3].map(function (i) {
          return { id: 'e6' + 'abcd'[i], level: i === 3 ? 'ADV' : 'PRG', make: function (r, sh) {
            var d = sh.ds[i];
            return P.fraction('Convert ' + t(d.tex) + ' to a fraction in lowest terms.', d.red, { diag: function (v) {
              if (i === 0 && Math.abs(v - d.raw[0] / 100) < 1e-9) return { code: 'decimal-cut', hint: 'That’s ' + t('0.' + d.raw[0]) + ', which ends. The digits repeat forever: let ' + t('x=' + d.tex) + ' and subtract ' + t('100x-x') + '.' };
              if (i === 2 && Math.abs(v - d.raw[0] / 1000) < 1e-9) return { code: 'decimal-cut', hint: 'That’s ' + t('0.' + d.raw[0]) + ', which ends. The block repeats forever: use ' + t('1000x-x') + '.' };
              if (i === 3 && Math.abs(v - (sh.n9 + 0.9)) < 1e-9) return { code: 'nine-tenths', hint: 'That’s ' + t(sh.n9 + '.9') + ' exactly. With the 9 repeating forever, let ' + t('x=' + d.tex) + ' and work out ' + t('10x-x') + '.' };
              return null;
            } }, 'Let ' + t('x=' + d.tex) + ': ' + t(d.how) + '<br>' + t('x=\\frac{' + d.raw[0] + '}{' + d.raw[1] + '}' + (d.red[0] === d.raw[0] && d.red[1] === d.raw[1] ? '' : '=' + ex.texRat(d.red))) + '.<br>' + (d.red[1] === 1 ? 'The denominator is ' + t('1') + ' — nothing forces a repeat.' : 'Denominator ' + t(denEq(d.red[1])) + ': it has a prime other than 2 and 5, so the decimal had to repeat ✓'),
            ['Let ' + t('x') + ' be the decimal. Multiply by a power of 10 that lines up the repeating blocks, then subtract.'], 'repeating decimal ' + d.tex + ' to fraction');
          } };
        }).concat([
          { id: 'e6e', level: 'PRG', make: function (r, sh) { return setsPart('List every set each number belongs to.', sh.ds.map(function (d) { return { id: d.id, tex: d.tex, cls: d.red[1] === 1 ? 'nat' : 'frac', note: d.tex + '=' + ex.texRat(d.red) }; }), false, 'classify four repeating decimals'); } },
          { id: 'e6f', level: 'MAS', make: function (r, sh) {
            var n = sh.n9, X = n + '.\\overline{9}';
            return P.mc(r, 'Part (d) breaks the pattern of the other three. What happens to the denominator test for ' + t(X) + '?', [
              { html: 'Before reducing, the denominator is ' + t('9=3^{2}') + ', but the test uses the <b>reduced</b> fraction: ' + t('\\frac{' + (9 * n + 9) + '}{9}=\\frac{' + (n + 1) + '}{1}') + '. Denominator ' + t('1') + ' has no primes, so it terminates — ' + t(X) + ' and ' + t(n + 1) + ' are the same number.', right: true },
              { html: 'The test fails here: ' + t('9=3^{2}') + ', so ' + t(X) + ' must repeat and can’t equal ' + t(n + 1) + '.', why: 'Apply the test to the <b>reduced</b> fraction. ' + t('10x-x') + ' gives ' + t('9x=' + (9 * n + 9)) + ', so ' + t('x=' + (n + 1)) + ' exactly.' },
              { html: t(X) + ' is slightly less than ' + t(n + 1) + ', so it is irrational.', why: 'It repeats, so it is rational. And ' + t('x=' + X) + ' gives ' + t('9x=' + (9 * n + 9)) + ', so ' + t('x=' + (n + 1)) + ' exactly — there is no gap.' },
              { html: 'The test only works for decimals with more than one repeating digit.', why: 'The test works for every fraction — as long as you reduce it first.' }],
              'Let ' + t('x=' + X) + ': ' + t('10x-x=' + (10 * n + 9) + '.\\overline{9}-' + X + '=' + (9 * n + 9)) + ', so ' + t('x=\\frac{' + (9 * n + 9) + '}{9}=' + (n + 1)) + '. Before reducing, the denominator ' + t('9') + ' looks as if it forces a repeat, but the test must be applied to the reduced fraction, whose denominator ' + t('1') + ' has no prime factors at all. ' + t(X) + ' and ' + t(n + 1) + ' are two ways of writing the same number, which belongs to ' + t('R,\\ Q,\\ I,\\ W,\\ N') + '.',
              ['What fraction did you get for ' + t(X) + '? Reduce it all the way.'], 'why 0.999… = 1');
          } }]) },
      { num: '7', stem: 'Simplify each number first, then sort it as <b>rational</b>, <b>irrational</b>, or <b>not possible in the real number system</b>.', parts: [
        { id: 'e7', level: 'ADV', make: function (r) {
          var items = r.shuffle(e7Items(r)), want = {}, by = {}; items.forEach(function (x) { want[x.id] = x.col; by[x.id] = x; });
          var names = { rat: 'rational', irr: 'irrational', nr: 'not real' };
          return P.grid('Sort the eight numbers.', items.map(function (x) { return { id: x.id, html: t(x.tex), label: x.id }; }), [{ id: 'rat', html: 'Rational', label: 'Rational' }, { id: 'irr', html: 'Irrational', label: 'Irrational' }, { id: 'nr', html: 'Not real', label: 'Not real' }], want,
            { why: function (id) { var x = by[id]; return { code: 'sort-' + x.col, hint: 'Look again at ' + t(x.tex) + ': ' + x.why }; } },
            items.map(function (x) { return t(x.tex) + ': ' + x.why + ' → <b>' + names[x.col] + '</b>'; }).join('<br>'),
            ['Simplify each one first. A radical is rational only when its radicand is a perfect power for its index; an even root of a negative is not real.'], 'sort rational/irrational/not real');
        } }] },
      /* ===== Part C — Radicals ===== */
      { num: '8', section: 'Extra practice C — Radicals',
        shared: function (r) {
          return { a: { k: r.int(10, 16), m: r.pick([2, 3, 5]) }, b: { k: r.int(4, 7), m: r.pick([2, 3, 5]) }, c: { k: r.pick([2, 3]), m: r.pick([2, 3, 5, 6, 7]) },
            d: { d: r.pick([2, 3, 5]), k: r.int(6, 13) }, e: { d: r.pick([2, 3, 4]), k: r.int(2, 5) }, f: { k: r.int(2, 5) } };
        },
        stem: 'Simplify each radical completely.',
        parts: [
          { id: 'e8a', level: 'PRG', make: function (r, sh) {
            var k = sh.a.k, m = sh.a.m, N = k * k * m;
            return P.radical(t('\\sqrt{' + F(N) + '}'), { k: k, n: 2, m: m }, 'mixed', 'The largest square factor of ' + t(F(N)) + ' is ' + t(k * k + '=' + k + '^{2}') + ':<br>' + t('\\sqrt{' + F(N) + '}=\\sqrt{' + k * k + '\\times ' + m + '}=\\sqrt{' + k * k + '}\\times\\sqrt{' + m + '}=' + rad(k, 2, m)),
              ['Look for the <b>largest</b> perfect square that divides ' + t(F(N)) + '.'], 'simplify sqrt ' + N);
          } },
          { id: 'e8b', level: 'PRG', make: function (r, sh) {
            var k = sh.b.k, m = sh.b.m, N = k * k * k * m;
            return P.radical(t('\\sqrt[3]{-' + F(N) + '}'), { k: -k, n: 3, m: m }, 'mixed', 'The largest cube factor of ' + t(F(N)) + ' is ' + t(k * k * k + '=' + k + '^{3}') + ':<br>' + t('\\sqrt[3]{-' + F(N) + '}=\\sqrt[3]{-' + k * k * k + '\\times ' + m + '}=' + rad(-k, 3, m)) + ' (an odd root of a negative is negative).',
              ['Look for the largest perfect cube that divides ' + t(F(N)) + ' (' + t('8, 27, 64, 125, 216, 343') + ').', 'A cube root of a negative number is negative.'], 'simplify cbrt -' + N);
          } },
          { id: 'e8c', level: 'ADV', make: function (r, sh) {
            var k = sh.c.k, m = sh.c.m, N = Math.pow(k, 4) * m;
            return P.radical(t('\\sqrt[4]{' + F(N) + '}'), { k: k, n: 4, m: m }, 'mixed', 'The largest fourth-power factor of ' + t(F(N)) + ' is ' + t(Math.pow(k, 4) + '=' + k + '^{4}') + ':<br>' + t('\\sqrt[4]{' + F(N) + '}=\\sqrt[4]{' + Math.pow(k, 4) + '\\times ' + m + '}=' + rad(k, 4, m)),
              ['Fourth powers: ' + t('16, 81, 256, 625') + '. Which one divides ' + t(F(N)) + '?'], 'simplify 4th root ' + N);
          } },
          { id: 'e8d', level: 'EMG', make: function (r, sh) {
            var d = sh.d.d, k = sh.d.k;
            return P.math(t('\\sqrt{\\dfrac{' + d * k * k + '}{' + d + '}}'), intChk(k, function (v) { if (Math.abs(v - k * Math.sqrt(d) / d) < 1e-9) return { code: 'inside-first', hint: 'Simplify inside the root first: ' + t('\\frac{' + d * k * k + '}{' + d + '}=' + k * k) + '.' }; return null; }), String(k),
              'Simplify inside first: ' + t('\\frac{' + d * k * k + '}{' + d + '}=' + k * k) + ', so ' + t('\\sqrt{' + k * k + '}=' + k) + '.', ['Do the division under the root first.'], 'sqrt(' + d * k * k + '/' + d + ')', { keys: 'radical' });
          } },
          { id: 'e8e', level: 'PRG', make: function (r, sh) {
            var d = sh.e.d, k = sh.e.k;
            return P.math(t('\\sqrt[3]{\\dfrac{-' + d * k * k * k + '}{' + d + '}}'), intChk(-k), String(-k),
              'Simplify inside first: ' + t('\\frac{-' + d * k * k * k + '}{' + d + '}=-' + k * k * k) + ', so ' + t('\\sqrt[3]{-' + k * k * k + '}=-' + k) + ', since ' + t('(-' + k + ')^{3}=-' + k * k * k) + '.', ['Do the division under the root first. A cube root of a negative is negative.'], 'cbrt(-' + d * k * k * k + '/' + d + ')', { keys: 'radical' });
          } },
          { id: 'e8f', level: 'PRG', make: function (r, sh) {
            var k = sh.f.k, K4 = Math.pow(k, 4);
            return P.mc(r, t('\\sqrt[4]{-' + K4 + '}'), [
              { html: 'Not possible in the real number system', right: true },
              { html: t('-' + k), why: 'Check: ' + t('(-' + k + ')^{4}=' + K4) + ', not ' + t('-' + K4) + '. An even power is never negative.' },
              { html: t(k), why: 'Check: ' + t(k + '^{4}=' + K4) + ', not ' + t('-' + K4) + '.' },
              { html: t('-' + k) + ' and ' + t(k), why: 'Both give ' + t('+' + K4) + ' when raised to the fourth power.' }],
              'The index ' + t('4') + ' is even and the radicand ' + t('-' + K4) + ' is negative. No real number raised to the fourth power is negative, so ' + t('\\sqrt[4]{-' + K4 + '}') + ' is <b>not possible</b> in the real number system.',
              ['What real number, raised to the fourth power, gives a negative?'], 'even root of negative');
          } },
          { id: 'e8g', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, c = sh.c, d = sh.d, e = sh.e, f = sh.f;
            return setsPart('Now state whether each result is rational, and tick every set it belongs to (leave a row empty if the number is not real).', [
              { id: 'a', tex: '\\sqrt{' + F(a.k * a.k * a.m) + '}', cls: 'irr', note: '=' + rad(a.k, 2, a.m) },
              { id: 'b', tex: '\\sqrt[3]{-' + F(b.k * b.k * b.k * b.m) + '}', cls: 'irr', note: '=' + rad(-b.k, 3, b.m) },
              { id: 'c', tex: '\\sqrt[4]{' + F(Math.pow(c.k, 4) * c.m) + '}', cls: 'irr', note: '=' + rad(c.k, 4, c.m) },
              { id: 'd', tex: '\\sqrt{\\frac{' + d.d * d.k * d.k + '}{' + d.d + '}}', cls: 'nat', note: '=' + d.k },
              { id: 'e', tex: '\\sqrt[3]{\\frac{-' + e.d * Math.pow(e.k, 3) + '}{' + e.d + '}}', cls: 'negint', note: '=-' + e.k },
              { id: 'f', tex: '\\sqrt[4]{-' + Math.pow(f.k, 4) + '}', cls: 'nonreal', note: null }], false, 'classify six radicals');
          } }] },
      { num: '9', stem: 'Conversions and comparisons. Keep every answer exact.', parts: [
        { id: 'e9a', level: 'PRG', make: function (r) { var k = r.int(3, 9), m = r.pick([2, 3, 5, 6, 7]); return P.radical('Write ' + t(rad(k, 2, m)) + ' as an entire radical.', { k: k, n: 2, m: m }, 'entire', 'Square the coefficient and multiply it in:<br>' + t(rad(k, 2, m) + '=\\sqrt{' + k + '^{2}\\times ' + m + '}=\\sqrt{' + k * k + '\\times ' + m + '}=\\sqrt{' + k * k * m + '}'), ['A number in front of a square root equals the square root of its square.'], 'entire radical ' + k + 'sqrt' + m); } },
        { id: 'e9b', level: 'PRG', make: function (r) { var k = r.int(2, 5), m = r.pick([2, 3, 4, 5, 6, 7, 9, 10]); return P.radical('Write ' + t(rad(k, 3, m)) + ' as an entire radical.', { k: k, n: 3, m: m }, 'entire', 'Cube the coefficient and multiply it in:<br>' + t(rad(k, 3, m) + '=\\sqrt[3]{' + k + '^{3}\\times ' + m + '}=\\sqrt[3]{' + k * k * k + '\\times ' + m + '}=\\sqrt[3]{' + k * k * k * m + '}'), ['A number in front of a cube root equals the cube root of its <b>cube</b>.'], 'entire radical ' + k + 'cbrt' + m); } },
        { id: 'e9c', level: 'ADV', make: function (r) {
          var k = r.pick([2, 3]), m = r.pick([2, 3, 5]), M = Math.pow(k, 4) * m;
          var pp = P.math('Write ' + t(rad(-k, 4, m)) + ' as an entire radical.', negEntireChk(k, m), '-\\sqrt[4]{' + M + '}',
            t(rad(-k, 4, m) + '=-\\sqrt[4]{' + k + '^{4}\\times ' + m + '}=-\\sqrt[4]{' + Math.pow(k, 4) + '\\times ' + m + '}=-\\sqrt[4]{' + M + '}') + '.<br>Only the ' + t(k) + ' moves inside; the negative sign stays outside.',
            ['Move only the ' + t(k) + ' inside (as ' + t(k + '^{4}') + '). What happens to the negative sign?'], 'entire radical -' + k + ' 4th root ' + m, { keys: 'radical' });
          pp.bad = ['\\sqrt[4]{-' + M + '}', '\\sqrt[4]{' + M + '}', '-' + k + '\\sqrt[4]{' + m + '}', '-\\sqrt[4]{' + k * m + '}']; pp.good = ['-\\sqrt[4]{' + M + '}'];
          return pp;
        } },
        { id: 'e9d', level: 'ADV', make: function (r) {
          var k = r.pick([2, 3]);
          return P.mc(r, 'When you write ' + t(rad(-k, 4, r.pick([2, 3, 5]))) + ' as an entire radical, where does the negative sign have to stay, and why?', [
            { html: '<b>Outside</b>: the index ' + t('4') + ' is even, and an even root of a negative number is not a real number.', right: true },
            { html: '<b>Inside</b>: the whole coefficient ' + t('-' + k) + ' moves in as ' + t('(-' + k + ')^{4}') + '.', why: t('(-' + k + ')^{4}=' + Math.pow(k, 4)) + ' is positive, so the sign would be lost — the value would change from negative to positive.' },
            { html: '<b>Inside</b>: ' + t('\\sqrt[4]{-a}') + ' is the same as ' + t('-\\sqrt[4]{a}') + '.', why: 'That is true for an <b>odd</b> index (like ' + t('\\sqrt[3]{-8}=-\\sqrt[3]{8}') + '), but ' + t('\\sqrt[4]{-a}') + ' isn’t a real number.' },
            { html: 'It disappears, because a fourth power is always positive.', why: 'The original number is negative, so the entire radical must be negative too.' }],
            'Only the ' + t(k) + ' moves inside as ' + t(k + '^{4}') + '. The sign stays <b>outside</b>: the index is even, and a negative radicand under an even index is not possible in the real number system.', ['Is the original number positive or negative? Can ' + t('\\sqrt[4]{\\text{negative}}') + ' be real?'], 'where the negative sign goes');
        } },
        { id: 'e9e', level: 'PRG', make: function (r) {
          var a, b, c, d, i;
          for (i = 0; i < 400; i++) { a = r.int(2, 7); c = r.int(2, 7); b = r.pick([2, 3, 5, 6, 7, 10, 11]); d = r.pick([2, 3, 5, 6, 7, 10, 11]); var A = a * a * b, C = c * c * d; if (a !== c && b !== d && A !== C && Math.abs(A - C) <= 20) break; }
          var A2 = a * a * b, C2 = c * c * d, X = rad(a, 2, b), Y = rad(c, 2, d), big = A2 > C2 ? X : Y;
          return P.mc(r, 'Which is larger, ' + t(X) + ' or ' + t(Y) + '? Decide <i>without</i> a calculator.', [
            { html: t(X), right: A2 > C2, why: A2 > C2 ? null : 'Write both as entire radicals: ' + t(X + '=\\sqrt{' + A2 + '}') + '. Compare it with ' + t(Y) + ' written the same way.' },
            { html: t(Y), right: C2 > A2, why: C2 > A2 ? null : 'Write both as entire radicals: ' + t(Y + '=\\sqrt{' + C2 + '}') + '. Compare it with ' + t(X) + ' written the same way.' },
            { html: 'They are equal', why: 'Write both as entire radicals and compare the radicands.' }],
            t(X + '=\\sqrt{' + a * a + '\\times ' + b + '}=\\sqrt{' + A2 + '}') + '<br>' + t(Y + '=\\sqrt{' + c * c + '\\times ' + d + '}=\\sqrt{' + C2 + '}') + '<br>' + t(Math.max(A2, C2) + '>' + Math.min(A2, C2)) + ', so ' + t(big) + ' is larger.',
            ['Turn both into entire radicals, then compare the radicands.'], 'compare ' + X + ' vs ' + Y, true);
        } },
        { id: 'e9f', level: 'ADV', make: function (r) {
          var a, b, c, i;
          for (i = 0; i < 400; i++) { a = r.pick([2, 3]); b = r.int(3, 12); var A = a * a * a * b; c = A + r.pick([-3, -2, -1, 1, 2, 3]); if (ex.simplest(b, 3) && !isPow(c, 3) && c > 0) break; }
          var A3 = a * a * a * b, X = rad(a, 3, b), Y = '\\sqrt[3]{' + c + '}', big = A3 > c ? X : Y;
          return P.mc(r, 'Which is larger, ' + t(X) + ' or ' + t(Y) + '? No calculator.', [
            { html: t(X), right: A3 > c, why: A3 > c ? null : 'Move the coefficient inside: ' + t(X + '=\\sqrt[3]{' + a + '^{3}\\times ' + b + '}') + '. What is that radicand?' },
            { html: t(Y), right: c > A3, why: c > A3 ? null : 'Move the coefficient inside: ' + t(X + '=\\sqrt[3]{' + a + '^{3}\\times ' + b + '}') + '. What is that radicand?' },
            { html: 'They are equal', why: 'Move the coefficient inside (cube it) and compare the radicands exactly.' }],
            t(X + '=\\sqrt[3]{' + a + '^{3}\\times ' + b + '}=\\sqrt[3]{' + a * a * a + '\\times ' + b + '}=\\sqrt[3]{' + A3 + '}') + '. ' + t(Math.max(A3, c) + '>' + Math.min(A3, c)) + ', so ' + t(big) + ' is larger.',
            ['Write ' + t(X) + ' as an entire radical (cube the coefficient).'], 'compare cube roots', true);
        } },
        { id: 'e9g', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), K4 = Math.pow(k, 4), X = '\\sqrt{\\sqrt{' + K4 + '}}';
          return P.mc(r, 'Is ' + t(X) + ' rational? Simplify it and name the <b>strictest</b> set it belongs to.', [
            { html: t(k) + ', strictest set ' + t('N'), right: true },
            { html: t(k) + ', strictest set ' + t('W'), why: t(k) + ' is a counting number, so it is in ' + t('N') + ', which sits inside ' + t('W') + '. The strictest set is the smallest one.' },
            { html: t(k * k) + ', strictest set ' + t('N'), why: t('\\sqrt{' + K4 + '}=' + k * k) + ' is only the first step — take the square root again.' },
            { html: t(k) + ', strictest set ' + t('Q'), why: t(k) + ' is rational, but it also fits a smaller set. Which is the smallest set containing ' + t(k) + '?' }],
            'Work from the inside out: ' + t('\\sqrt{' + K4 + '}=' + k * k) + ', then ' + t('\\sqrt{' + k * k + '}=' + k) + '. <b>Rational</b>. ' + t(k) + ' is a natural number, so the strictest set is ' + t('N') + '.', ['Simplify the inside root first.'], 'sqrt sqrt ' + K4);
        } }] },
      { num: '10',
        shared: function (r) {
          var k = r.int(3, 9), m = r.pick([2, 3, 5, 6, 7]), j, n, i;
          for (i = 0; i < 200; i++) { j = r.int(2, 7); n = r.pick([2, 3, 5, 6]); if (j * j * j * n >= 100) break; }
          return { k: k, m: m, A: k * k * m, j: j, n: n, V: j * j * j * n };
        },
        stem: function (sh) { return 'A square has area ' + t(F(sh.A)) + ' cm' + t('^{2}') + ' and a cube has volume ' + t(F(sh.V)) + ' cm' + t('^{3}') + '.'; },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) { return P.radical('Find the exact side length of the square in simplest mixed radical form.', { k: sh.k, n: 2, m: sh.m }, 'mixed', t('s^{2}=' + sh.A) + ', so ' + t('s=\\sqrt{' + sh.A + '}=\\sqrt{' + sh.k * sh.k + '\\times ' + sh.m + '}=' + rad(sh.k, 2, sh.m)) + ' cm.', ['The side of a square is the square root of its area.'], 'square side from area ' + sh.A); } },
          { id: 'e10b', level: 'PRG', make: function (r, sh) { return P.radical('Find the exact edge length of the cube in simplest mixed radical form.', { k: sh.j, n: 3, m: sh.n }, 'mixed', t('e^{3}=' + F(sh.V)) + ', so ' + t('e=\\sqrt[3]{' + F(sh.V) + '}') + '. ' + t(F(sh.V) + '=' + sh.j * sh.j * sh.j + '\\times ' + sh.n + '=' + sh.j + '^{3}\\times ' + sh.n) + ', so ' + t('e=' + rad(sh.j, 3, sh.n)) + ' cm.', ['The edge of a cube is the cube root of its volume.'], 'cube edge from volume ' + sh.V); } },
          { id: 'e10c', level: 'PRG', make: function (r, sh) { return setsPart('Classify both lengths: tick every set each belongs to.', [{ id: 's', tex: rad(sh.k, 2, sh.m), cls: 'irr', note: sh.m + '\\text{ is not a perfect square}' }, { id: 'e', tex: rad(sh.j, 3, sh.n), cls: 'irr', note: sh.n + '\\text{ is not a perfect cube}' }], false, 'classify side and edge'); } },
          { id: 'e10d', level: 'PRG', make: function (r, sh) { return P.radical('Find the exact perimeter of the square.', { k: 4 * sh.k, n: 2, m: sh.m }, 'mixed', t('P=4\\times ' + rad(sh.k, 2, sh.m) + '=' + rad(4 * sh.k, 2, sh.m)) + ' cm — still irrational.', ['Perimeter of a square = 4 × side.'], 'perimeter ' + 4 * sh.k + 'sqrt' + sh.m); } },
          { id: 'e10e', level: 'MAS', make: function (r, sh) {
            return P.mc(r, 'Is a rational multiple of an irrational number ever rational?', [
              { html: 'Never, unless the rational number is ' + t('0') + ': if ' + t('q\\neq 0') + ' and ' + t('qx') + ' were rational, then ' + t('x=\\frac{qx}{q}') + ' would be rational too.', right: true },
              { html: 'Always: multiplying by a rational number keeps the answer rational.', why: 'Your perimeter ' + t(rad(4 * sh.k, 2, sh.m)) + ' is a rational multiple (' + t('4') + ') of an irrational number — and it is irrational.' },
              { html: 'Sometimes: when the rational number is a perfect square, like ' + t('4') + '.', why: t('4\\times ' + rad(sh.k, 2, sh.m) + '=' + rad(4 * sh.k, 2, sh.m)) + ' is still irrational.' },
              { html: 'Never, not even when the rational number is ' + t('0') + '.', why: t('0\\times\\sqrt{' + sh.m + '}=0') + ', which is rational.' }],
              t('P=' + rad(4 * sh.k, 2, sh.m)) + ' is irrational. In general, if ' + t('q\\neq 0') + ' is rational and ' + t('qx') + ' were rational, then ' + t('x=\\frac{qx}{q}') + ' would be a ratio of rationals, so ' + t('x') + ' would be rational. Only ' + t('0\\times x=0') + ' escapes.',
              ['Suppose ' + t('qx') + ' were rational. Divide by ' + t('q') + ' — what would that say about ' + t('x') + '?'], 'rational multiple of irrational');
          } }] },
      { num: '11', shared: e11Shared, stem: e11Stem, parts: [
        { id: 'e11a', level: 'PRG', make: function (r, sh) {
          return P.fields('Write each number as a decimal correct to three decimal places.', sh.items.map(function (x) { return { label: t(x.tex + '\\approx'), name: x.id }; }),
            sh.items.map(function (x) { var base = K.approx(x.v, 3); return function (resp) { var p = HW.parse.number(resp); if (p.ok && Math.abs(p.value - x.v) < 1e-12) return ok(); return base(resp); }; }),
            sh.items.map(function (x) { return d3(x.v); }), sh.items.map(function (x) { return t(x.tex + '\\approx ' + d3(x.v)); }).join(', '),
            sh.items.map(function (x) { return t(x.tex + '\\approx ' + d3(x.v)); }).join('<br>') + '<br>(' + t(sh.items[5].tex + '=\\sqrt{' + sh.k * sh.k + '}=' + sh.k) + ' exactly.)',
            ['Use your calculator. For a repeating decimal, write out four digits and round.'], 'eight decimals to 3 dp');
        } },
        { id: 'e11b', level: 'PRG', make: function (r, sh) {
          var srt = sh.items.slice().sort(function (a, b) { return a.v - b.v; });
          return P.order(r, 'List all eight numbers in order from <b>least to greatest</b>. (This is the order you would plot them on a number line.)', srt.map(function (x) { return { id: x.id, tex: x.tex }; }), { sep: '<' },
            'Least to greatest: ' + t(srt.map(function (x) { return x.tex; }).join('\\ <\\ ')) + '<br>(' + srt.map(function (x) { return t(d3(x.v)); }).join(', ') + ')', ['Use your three-decimal values from the previous part.'], 'order eight numbers');
        } },
        { id: 'e11c', level: 'ADV', make: function (r, sh) {
          var th = sh.three, vals = th.map(function (x) { return x.v; });
          var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]], others = r.sample(perms.slice(1), 3);
          var opts = [perms[0]].concat(others).map(function (pp, j) {
            var pts = pp.map(function (src, dst) { return { v: vals[dst], lab: th[src].lab }; }), misplaced = pp.map(function (src, dst) { return src !== dst ? th[src] : null; }).filter(Boolean)[0];
            return { html: lineSVG(pts), right: j === 0, why: j === 0 ? null : 'Look at where ' + t(misplaced.tex) + ' is placed. Use its three-decimal value from part (a).' };
          });
          return P.mc(r, 'Three of the numbers land between ' + t('3') + ' and ' + t('3.3') + ', too close to separate on an ordinary number line. Which magnified number line shows them correctly?', opts,
            th.slice().sort(function (a, b) { return a.v - b.v; }).map(function (x) { return t(x.tex + '\\approx ' + d3(x.v)); }).join(', ') + '.<br>' + lineSVG(th.map(function (x) { return { v: x.v, lab: x.lab }; })),
            ['Compare the three decimals from part (a), to the hundredths.'], 'magnified number line');
        } },
        { id: 'e11d', level: 'PRG', make: function (r, sh) {
          var opts = r.shuffle(sh.items).map(function (x) { return x.tex; }), want = sh.items.filter(function (x) { return x.irr; }).map(function (x) { return x.tex; });
          var by = {}; sh.items.forEach(function (x) { by[x.tex] = x; });
          return { prompt: 'Which of the eight numbers are in ' + t('\\overline{Q}') + ' (irrational)? Decide without a calculator.', input: { type: 'select', options: opts }, key: want, answer: t(want.join(',\\ ')), text: 'which are irrational',
            check: K.selectSet(want, function (extra, missing) {
              if (extra.length) { var x = by[extra[0]]; return { code: 'sets-rat', hint: t(x.tex) + ' is rational: ' + (x.id === 'q' ? t(x.tex + '=\\sqrt{' + sh.k * sh.k + '}=' + sh.k) : x.id === 'rp' ? 'it repeats.' : x.id === 'f' || x.id === 'nf' ? 'it is a fraction of integers.' : 'it is an integer.') }; }
              return { code: 'sets-irr', hint: 'You missed ' + (missing.length === 1 ? 'one' : missing.length) + '. A root is irrational when its radicand is not a perfect power for its index.' };
            }),
            solution: t('-\\sqrt{' + sh.n + '}') + ', ' + t('\\sqrt[3]{' + sh.c + '}') + ' and ' + t('\\sqrt{10}') + ': ' + t(sh.n) + ' and ' + t('10') + ' are not perfect squares, and ' + t(sh.c) + ' is not a perfect cube (' + t('27<' + sh.c + '<64') + '), so those roots never terminate or repeat. The other five are rational: two fractions, a repeating decimal, an integer, and ' + t(sh.items[5].tex + '=' + sh.k) + '.',
            hints: ['Look for roots whose radicand is not a perfect power for the index.'] };
        } }] },
      /* ===== Part D — Reasoning and error analysis ===== */
      { num: '12', section: 'Extra practice D — Reasoning and error analysis', stem: 'State whether each claim is <b>true</b> or <b>false</b>.', parts: [
        { id: 'e12a', level: 'PRG', make: function (r) { var ab = r.pick([45, 27, 18, 36, 81, 12, 63]); return P.tf(r, 'Every non-terminating decimal is irrational.', false, 'Counterexample: ' + t('0.\\overline{' + ab + '}=' + ex.texRat(ex.norm(ab, 99))) + ' never terminates, but it repeats, so it is rational.', '<b>False.</b> ' + t('0.\\overline{' + ab + '}=' + ex.texRat(ex.norm(ab, 99))) + ' never terminates, but it repeats, so it is rational. An irrational decimal must be non-terminating <i>and</i> non-repeating.', ['Can a decimal go on forever and still be a fraction?'], 'TF non-terminating → irrational'); } },
        { id: 'e12b', level: 'ADV', make: function (r) { var k = r.pick([12, 18, 20, 24, 28, 45]), mx = mixedOf(nt.factor(k), 2); return P.tf(r, 'For a natural number ' + t('n') + ', ' + t('\\sqrt{n}') + ' is irrational unless ' + t('n') + ' is a perfect square.', true, 'Try to find a counterexample. If ' + t('n') + ' isn’t a perfect square, some prime has an odd exponent and is left under the root.', '<b>True.</b> Taking ' + t('\\sqrt{n}') + ' halves every exponent in the prime factorization of ' + t('n') + '. The halves are all whole numbers exactly when every exponent is even — when ' + t('n') + ' is a perfect square. Otherwise a prime is left under the root. E.g. ' + t('\\sqrt{36}=6') + ', but ' + t('\\sqrt{' + k + '}=' + rad(mx.k, 2, mx.m)) + '.', ['Think about the exponents in the prime factorization of ' + t('n') + '.'], 'TF sqrt n irrational unless square'); } },
        { id: 'e12c', level: 'PRG', make: function (r) { var a = r.pick([2, 4, 6]), b = r.pick([2, 4]), v = Math.pow(2, a) * Math.pow(3, b); return P.tf(r, 'If every exponent in a natural number’s prime factorization is even, its square root is a natural number.', true, 'Test an example: ' + t('\\sqrt{2^{' + a + '}\\times 3^{' + b + '}}=' + fTex([[2, a / 2], [3, b / 2]])) + ', a natural number.', '<b>True.</b> Halving each even exponent gives whole-number exponents, and a product of primes to whole-number powers is a natural number. E.g. ' + t('\\sqrt{2^{' + a + '}\\times 3^{' + b + '}}=' + fTex([[2, a / 2], [3, b / 2]]) + '=' + Math.sqrt(v)) + '.', ['Halve each exponent. What kind of number do you get?'], 'TF even exponents → natural root'); } },
        { id: 'e12d', level: 'PRG', make: function (r) { var a = r.pick([2, 3, 5]), j = r.pick([2, 3]); return P.tf(r, 'The product of two irrational numbers is irrational.', false, 'Counterexample: ' + t('\\sqrt{' + a + '}\\times\\sqrt{' + a * j * j + '}=\\sqrt{' + a * a * j * j + '}=' + a * j) + ', which is rational.', '<b>False.</b> ' + t('\\sqrt{' + a + '}\\times\\sqrt{' + a + '}=' + a) + ' and ' + t('\\sqrt{' + a + '}\\times\\sqrt{' + a * j * j + '}=' + a * j) + ' are both rational.', ['Try multiplying ' + t('\\sqrt{2}') + ' by itself.'], 'TF irrational × irrational'); } },
        { id: 'e12e', level: 'PRG', make: function (r) { var k = r.int(2, 5); return P.tf(r, 'A radical with an odd index always represents a real number.', true, 'Odd powers of negatives are negative: ' + t('\\sqrt[3]{-' + k * k * k + '}=-' + k) + ', since ' + t('(-' + k + ')^{3}=-' + k * k * k) + '.', '<b>True.</b> An odd power of a negative number is negative, so every real radicand — positive, zero or negative — has a real odd-index root. E.g. ' + t('\\sqrt[3]{-' + k * k * k + '}=-' + k) + '. Only an <i>even</i> index over a negative radicand is not real.', ['Try a cube root of a negative number.'], 'TF odd index always real'); } },
        { id: 'e12f', level: 'PRG', make: function (r) { var k = r.int(4, 12); return P.tf(r, 'An entire radical is always irrational.', false, 'Counterexample: ' + t('\\sqrt{' + k * k + '}') + ' is an entire radical, but it equals ' + t(k) + '.', '<b>False.</b> ' + t('\\sqrt{' + k * k + '}') + ' is an entire radical, but ' + t('\\sqrt{' + k * k + '}=' + k) + ' is rational.', ['Is ' + t('\\sqrt{49}') + ' an entire radical? Is it irrational?'], 'TF entire radical irrational'); } },
        { id: 'e12g', level: 'ADV', outcome: 'AN1', make: function (r) { var pr = r.pick([[9, 20], [8, 15], [7, 12], [10, 21], [4, 25]]); return P.tf(r, 'If ' + t('\\text{GCF}(a,b)=1') + ', then ' + t('\\text{LCM}(a,b)=ab') + '.', true, 'Use ' + t('\\text{GCF}\\times\\text{LCM}=ab') + ': with a GCF of ' + t('1') + ', the LCM must be ' + t('ab') + '. E.g. ' + t('\\text{LCM}(' + pr[0] + ',' + pr[1] + ')=' + pr[0] * pr[1]) + '.', '<b>True.</b> ' + t('\\text{GCF}(a,b)\\times\\text{LCM}(a,b)=ab') + ' always holds, so a GCF of ' + t('1') + ' gives ' + t('\\text{LCM}(a,b)=ab') + '. E.g. ' + t('\\text{GCF}(' + pr[0] + ',' + pr[1] + ')=1') + ' and ' + t('\\text{LCM}(' + pr[0] + ',' + pr[1] + ')=' + pr[0] * pr[1] + '=' + pr[0] + '\\times ' + pr[1]) + '.', ['Test it with two numbers that share no factor, like ' + t('9') + ' and ' + t('20') + '.'], 'TF GCF 1 → LCM ab'); } },
        { id: 'e12h', level: 'ADV', make: function (r) { var c = r.pick([3, 6, 7, 9, 11]), y = r.pick([2, 4, 5, 8, 10]), x = coprimeIn(r, 1, y - 1, y); return P.tf(r, 'If a fraction’s denominator contains a prime other than ' + t('2') + ' or ' + t('5') + ', its decimal repeats.', false, 'Counterexample: ' + t('\\frac{' + c * x + '}{' + c * y + '}') + ' has a denominator containing ' + t(nt.factor(c).filter(function (pe) { return pe[0] !== 2 && pe[0] !== 5; })[0][0]) + ', but it reduces to ' + t('\\frac{' + x + '}{' + y + '}=' + K.decTex([x, y])) + ', which terminates.', '<b>False</b> as written — the test applies only to the <b>reduced</b> fraction. ' + t('\\frac{' + c * x + '}{' + c * y + '}=\\frac{' + x + '}{' + y + '}=' + K.decTex([x, y])) + ' terminates.', ['What if the fraction isn’t in lowest terms?'], 'TF denominator test unreduced'); } }] },
      { num: '13',
        shared: function (r) {
          var k, s, m, i;
          for (i = 0; i < 300; i++) { k = r.pick([4, 6, 8, 9, 10, 12]); m = r.pick([2, 3, 5, 6, 7]); var ss = nt.divisors(k).filter(function (d) { return d > 1 && d < k; }); s = r.pick(ss); if (k * k * m <= 1500) break; }
          return { k: k, s: s, m: m, N: k * k * m };
        },
        stem: function (sh) { var rest = sh.N / (sh.s * sh.s); return 'A student was asked to simplify ' + t('\\sqrt{' + F(sh.N) + '}') + ' and classify the result. Here is the entire submission:\\[\\sqrt{' + F(sh.N) + '}=\\sqrt{' + sh.s * sh.s + '\\times ' + rest + '}=\\sqrt{' + sh.s * sh.s + '}\\times\\sqrt{' + rest + '}=' + rad(sh.s, 2, rest) + '\\]“Because it still has a radical sign, it is irrational, so it belongs to ' + t('\\overline{Q}') + ' and that is the only set it is in.”'; },
        parts: [
          { id: 'e13a', level: 'ADV', make: function (r, sh) {
            var rest = sh.N / (sh.s * sh.s), T = function (s) { return HW.tex(s); };
            var all = [{ value: 'e1', html: T(t(rad(sh.s, 2, rest)) + ' isn’t finished: ' + t(rest) + ' still has a perfect-square factor.'), err: true },
              { value: 'e2', html: T('A radical sign doesn’t make a number irrational (e.g. ' + t('\\sqrt{9}=3') + ').'), err: true },
              { value: 'e3', html: T('An irrational number also belongs to ' + t('R') + ', so ' + t('\\overline{Q}') + ' is not the only set.'), err: true },
              { value: 'd1', html: T(t('\\sqrt{' + sh.s * sh.s + '\\times ' + rest + '}') + ' can’t be split into ' + t('\\sqrt{' + sh.s * sh.s + '}\\times\\sqrt{' + rest + '}') + '.'), why: 'That step is fine: ' + t('\\sqrt{ab}=\\sqrt{a}\\times\\sqrt{b}') + ' for positive numbers.' },
              { value: 'd2', html: T(t('\\sqrt{' + sh.s * sh.s + '}') + ' should be ' + t(sh.s * sh.s) + ', not ' + t(sh.s) + '.'), why: t(sh.s + '^{2}=' + sh.s * sh.s) + ', so ' + t('\\sqrt{' + sh.s * sh.s + '}=' + sh.s) + ' is right.' },
              { value: 'd3', html: T('The answer should be a decimal, not a radical.'), why: 'An exact answer is expected — a radical is fine. The problem is that this radical isn’t simplified all the way.' }];
            var opts = r.shuffle(all), byV = {}; all.forEach(function (o) { byV[o.value] = o; });
            var want = ['e1', 'e2', 'e3'];
            return { prompt: 'There are <b>three</b> separate errors. Tap each one.', input: { type: 'select', options: opts.map(function (o) { return { value: o.value, html: o.html }; }) }, key: want, answer: [all[0], all[1], all[2]].map(function (o) { return o.html; }).join('<br>'), text: 'three errors in sqrt ' + sh.N,
              check: K.selectSet(want, function (extra, missing) { if (extra.length) return { code: 'err-decoy', hint: byV[extra[0]].why }; return { code: 'err-missed', hint: 'You found ' + (3 - missing.length) + ' of the 3 errors. Check the simplification, the reason given, <i>and</i> the list of sets.' }; }),
              solution: '1. ' + t(rad(sh.s, 2, rest)) + ' is not finished: ' + t(rest + '=' + (sh.k / sh.s) * (sh.k / sh.s) + '\\times ' + sh.m) + ' still holds a perfect square.<br>2. A radical sign does not make a number irrational (' + t('\\sqrt{9}=3') + '); what matters is whether the radicand is a perfect square.<br>3. Every irrational number is also real, so ' + t('\\overline{Q}') + ' is never the only set — ' + t('R') + ' is missing.',
              hints: ['Check three things: is the radical simplified, is the reason right, and is the list of sets complete?'] };
          } },
          { id: 'e13b', level: 'PRG', make: function (r, sh) {
            var rest = sh.N / (sh.s * sh.s);
            return P.radical('Give the correct simplest mixed radical form of ' + t('\\sqrt{' + F(sh.N) + '}') + '.', { k: sh.k, n: 2, m: sh.m }, 'mixed', 'Use the <b>largest</b> perfect square factor of ' + t(F(sh.N) + '=' + K.fac(sh.N)) + ', which is ' + t(sh.k * sh.k) + ':<br>' + t('\\sqrt{' + F(sh.N) + '}=\\sqrt{' + sh.k * sh.k + '\\times ' + sh.m + '}=\\sqrt{' + sh.k * sh.k + '}\\times\\sqrt{' + sh.m + '}=' + rad(sh.k, 2, sh.m)),
              ['Find the <b>largest</b> perfect square factor so the job ends in one step.'], 'correct sqrt ' + sh.N);
          } },
          { id: 'e13c', level: 'PRG', make: function (r, sh) { return setsPart('List every set the simplified number really belongs to.', [{ id: 'x', tex: rad(sh.k, 2, sh.m), cls: 'irr', note: sh.m + '\\text{ is not a perfect square}' }], false, 'classify ' + sh.k + 'sqrt' + sh.m); } },
          { id: 'e13d', level: 'ADV', make: function (r, sh) {
            return P.mc(r, 'Which is a reliable test for deciding whether ' + t('\\sqrt{n}') + ' (for a natural number ' + t('n') + ') is irrational?', [
              { html: t('\\sqrt{n}') + ' is rational exactly when ' + t('n') + ' is a perfect square — every exponent in its prime factorization is even.', right: true },
              { html: 'If the answer still has a radical sign, it is irrational.', why: t('\\sqrt{9}') + ' has a radical sign but equals ' + t('3') + '. You have to check the radicand.' },
              { html: 'If ' + t('n') + ' is even, ' + t('\\sqrt{n}') + ' is irrational.', why: t('\\sqrt{16}=4') + ', and ' + t('16') + ' is even.' },
              { html: 'If the calculator shows many decimal places, it is irrational.', why: 'A calculator shows only about ten digits — it can’t tell you whether they repeat forever. (' + t('\\frac{1}{7}') + ' also fills the screen.)' }],
              t('\\sqrt{n}') + ' is rational exactly when ' + t('n') + ' is a perfect square. Here ' + t(F(sh.N) + '=' + K.fac(sh.N)) + ' has an odd exponent, so ' + t('\\sqrt{' + F(sh.N) + '}=' + rad(sh.k, 2, sh.m)) + ' is irrational and belongs to ' + t('R,\\ \\overline{Q}') + '.',
              ['Think about prime factorizations and exponents.'], 'reliable irrational test');
          } }] },
      { num: '14',
        shared: function (r) { var x1 = r.int(2, 4), x2 = r.int(1, x1 - 1), y1 = r.int(1, 2), y2 = r.int(y1 + 1, 3), af = [[2, x1], [5, y1]], bf = [[2, x2], [5, y2]]; return { af: af, bf: bf, a: fVal(af), b: fVal(bf), g: fVal([[2, x2], [5, y1]]), l: fVal([[2, x1], [5, y2]]), gf: [[2, x2], [5, y1]], lf: [[2, x1], [5, y2]] }; },
        stem: function (sh) { return 'A second student is given ' + t('a=' + fTex(sh.af)) + ' and ' + t('b=' + fTex(sh.bf)) + ' and writes:<br>“' + t('\\text{GCF}(a,b)=' + fTex(sh.lf) + '=' + F(sh.l)) + ' and ' + t('\\text{LCM}(a,b)=' + fTex(sh.gf) + '=' + F(sh.g)) + '. So ' + t('\\frac{a}{b}=\\frac{' + sh.a + '}{' + sh.b + '}') + ', and since the denominator ' + t(sh.b + '=' + fTex(sh.bf)) + ' contains a ' + t('2') + ' and a ' + t('5') + ', the decimal repeats.”'; },
        parts: [
          { id: 'e14a', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.fields('The GCF and LCM have been swapped. State the correct values.', [{ label: t('\\text{GCF}(a,b)='), name: 'GCF' }, { label: t('\\text{LCM}(a,b)='), name: 'LCM' }],
              [numChk(sh.g, [{ v: sh.l, code: 'gcf-lcm', hint: 'That’s the LCM again. The GCF takes the <b>lower</b> exponent of each shared prime.' }]), numChk(sh.l, [{ v: sh.g, code: 'gcf-lcm', hint: 'That’s the GCF. The LCM takes the <b>higher</b> exponent of every prime.' }])], [String(sh.g), String(sh.l)],
              t('\\text{GCF}=' + F(sh.g)) + ', ' + t('\\text{LCM}=' + F(sh.l)),
              t('\\text{GCF}(a,b)=' + fTex(sh.gf) + '=' + F(sh.g)) + ' (lower exponent of each shared prime)<br>' + t('\\text{LCM}(a,b)=' + fTex(sh.lf) + '=' + F(sh.l)) + ' (higher exponent of every prime)', ['GCF: lower exponents. LCM: higher exponents.'], 'swapped GCF/LCM');
          } },
          { id: 'e14b', level: 'ADV', make: function (r, sh) {
            return P.mc(r, 'The denominator test has been misremembered <i>and</i> misapplied. Which statement gives the correct rule and the step the student skipped?', [
              { html: 'A fraction <b>terminates</b> when its <b>reduced</b> denominator has no prime factors other than ' + t('2') + ' and ' + t('5') + '. The student skipped reducing ' + t('\\frac{' + sh.a + '}{' + sh.b + '}') + ' first.', right: true },
              { html: 'A fraction <b>repeats</b> when its denominator contains a ' + t('2') + ' or a ' + t('5') + '. The student skipped dividing.', why: 'It’s the other way round: 2s and 5s are exactly what <i>allow</i> a decimal to terminate (e.g. ' + t('\\frac{1}{4}=0.25') + ').' },
              { html: 'A fraction terminates only when its denominator is a power of ' + t('10') + '. The student skipped multiplying by ' + t('10') + '.', why: t('\\frac{1}{4}=0.25') + ' terminates, and ' + t('4') + ' isn’t a power of 10. Any denominator made of 2s and 5s works.' },
              { html: 'A fraction terminates when the numerator and denominator are both even. The student skipped checking the numerator.', why: 'The numerator doesn’t decide it — only the primes in the <b>reduced</b> denominator.' }],
              '<b>Rule:</b> a fraction terminates when its <i>reduced</i> denominator has no prime factors other than ' + t('2') + ' and ' + t('5') + '; any other prime makes it repeat. Containing a 2 and a 5 is exactly what allows it to terminate.<br><b>Skipped step:</b> reducing ' + t('\\frac{' + sh.a + '}{' + sh.b + '}') + ' to lowest terms first.',
              ['Which primes in a denominator make a decimal terminate?'], 'denominator test rule');
          } },
          { id: 'e14c', level: 'PRG', make: function (r, sh) {
            var red = ex.norm(sh.a, sh.b);
            return P.repeating('Give the correct decimal for ' + t('\\frac{a}{b}') + '.', red, {}, t('a=' + sh.a) + ', ' + t('b=' + sh.b) + '. ' + t('\\frac{a}{b}=\\frac{' + sh.a + '}{' + sh.b + '}=' + ex.texRat(red)) + '. Denominator ' + t(denEq(red[1])) + ' — only 2s and 5s, so it terminates: ' + t(ex.texRat(red) + '=' + K.decTex(red)) + '.',
              ['Reduce the fraction first, then divide.'], 'decimal of a/b (terminates)');
          } },
          { id: 'e14d', level: 'PRG', make: function (r, sh) { var red = ex.norm(sh.a, sh.b); return setsPart('List every set ' + t('\\frac{a}{b}') + ' belongs to.', [{ id: 'ab', tex: '\\frac{a}{b}', cls: 'frac', note: '\\frac{a}{b}=' + K.decTex(red) }], false, 'classify a/b'); } }] },
      { num: '15', stem: 'Statement 12(b) is worth arguing properly. Let ' + t('n') + ' be a natural number.',
        shared: function (r) {
          var f, n, i;
          for (i = 0; i < 300; i++) { var ps = r.sample([2, 3, 5, 7], 3).sort(function (a, b) { return a - b; }), es = r.shuffle([r.pick([2, 4]), r.pick([2, 4]), r.pick([3, 1, 5])]); f = ps.map(function (p, j) { return [p, es[j]]; }); n = fVal(f); if (n <= 200000 && n >= 500) break; }
          return { f: f, n: n };
        },
        parts: [
          { id: 'e15a', level: 'MAS', make: function (r, sh) {
            return P.mc(r, 'Using prime factorizations and exponents, why is ' + t('\\sqrt{n}') + ' a natural number exactly when every exponent in ' + t('n') + ' is even — and why can ' + t('\\sqrt{n}') + ' never be a fraction like ' + t('\\frac{7}{2}') + '?', [
              { html: 'Squaring doubles every exponent, so ' + t('\\sqrt{n}') + ' is natural exactly when every exponent of ' + t('n') + ' is even. And if ' + t('\\sqrt{n}=\\frac{c}{d}') + ' in lowest terms with ' + t('d>1') + ', then ' + t('nd^{2}=c^{2}') + ': a prime of ' + t('d') + ' would divide ' + t('c') + ' — impossible.', right: true },
              { html: 'Taking a square root halves the exponents, so ' + t('\\sqrt{n}') + ' always has whole-number exponents and is always natural.', why: 'Halving an odd exponent doesn’t give a whole number. Try ' + t('n=12=2^{2}\\times 3') + '.' },
              { html: t('\\sqrt{n}') + ' can be a fraction like ' + t('\\frac{7}{2}') + ': for example ' + t('\\sqrt{\\frac{49}{4}}=\\frac{7}{2}') + '.', why: t('\\frac{49}{4}') + ' isn’t a natural number. The claim is about ' + t('\\sqrt{n}') + ' for a <b>natural</b> number ' + t('n') + '.' },
              { html: 'A calculator shows ' + t('\\sqrt{n}') + ' either as a whole number or with many decimals, so it can’t be a fraction.', why: 'A calculator display is not a proof — ' + t('\\frac{1}{3}') + ' also shows many decimals.' }],
              'Write ' + t('n=p_{1}^{e_{1}}\\times p_{2}^{e_{2}}\\times\\cdots') + '. Squaring a natural number doubles every exponent, so a natural ' + t('s') + ' with ' + t('s^{2}=n') + ' must be ' + t('p_{1}^{e_{1}/2}\\times p_{2}^{e_{2}/2}\\times\\cdots') + ' — possible only if every ' + t('e_{i}') + ' is even.<br>A non-whole fraction can’t work either: if ' + t('\\sqrt{n}=\\frac{c}{d}') + ' in lowest terms with ' + t('d>1') + ', then ' + t('nd^{2}=c^{2}') + '. Any prime in ' + t('d') + ' divides ' + t('c^{2}') + ', hence ' + t('c') + ' — but ' + t('c') + ' and ' + t('d') + ' share no primes. So ' + t('\\sqrt{n}') + ' is either natural or irrational.',
              ['What does squaring do to the exponents in a prime factorization?'], 'why sqrt n natural or irrational');
          } },
          { id: 'e15b', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            var opts = sh.f.map(function (pe) { var odd = pe[1] % 2 === 1; return { html: 'The power ' + t(pe[0] + '^{' + pe[1] + '}'), right: odd, why: odd ? null : 'The exponent ' + t(pe[1]) + ' is even, so ' + t(pe[0] + '^{' + pe[1] + '}') + ' comes out of the root completely.' }; });
            opts.push({ html: 'None — ' + t('n') + ' is a perfect square.', why: 'Check each exponent: is every one of them even?' });
            var odd = sh.f.filter(function (pe) { return pe[1] % 2; })[0];
            return P.mc(r, 'Test your reasoning on ' + t('n=' + fTex(sh.f)) + '. Which power spoils it (keeps ' + t('\\sqrt{n}') + ' from being natural)?', opts,
              'Exponents ' + t(fExps(sh.f).join(',\\ ')) + ': the exponent ' + t(odd[1]) + ' on the prime ' + t(odd[0]) + ' is odd, so ' + t('n') + ' is not a perfect square.', ['Which exponent is odd?'], 'which exponent spoils', true);
          } },
          { id: 'e15c', level: 'PRG', make: function (r, sh) {
            var mx = mixedOf(sh.f, 2);
            return P.radical('Write ' + t('\\sqrt{n}') + ' in simplest mixed radical form, where ' + t('n=' + fTex(sh.f)) + '.', { k: mx.k, n: 2, m: mx.m }, 'mixed',
              t('n=' + fTex(sh.f.map(function (pe) { return [pe[0], pe[1] - pe[1] % 2]; })) + '\\times ' + mx.m) + '<br>' + t('\\sqrt{n}=' + fTex(sh.f.map(function (pe) { return [pe[0], Math.floor(pe[1] / 2)]; })) + '\\sqrt{' + mx.m + '}=' + rad(mx.k, 2, mx.m)) + '<br>(' + t('n=' + F(sh.n)) + ', and ' + t(mx.k + '^{2}\\times ' + mx.m + '=' + F(sh.n)) + ' ✓)',
              ['Halve each even exponent; one copy of the prime with the odd exponent stays under the root.'], 'sqrt n simplest (one odd exponent)');
          } },
          { id: 'e15d', level: 'PRG', make: function (r, sh) { var mx = mixedOf(sh.f, 2); return setsPart('Classify ' + t('\\sqrt{n}') + ': tick every set it belongs to.', [{ id: 'x', tex: '\\sqrt{n}', cls: 'irr', note: '\\sqrt{n}=' + rad(mx.k, 2, mx.m) }], false, 'classify sqrt n'); } }] },
      /* ===== Part E — Challenge ===== */
      { num: '16', section: 'Extra practice E — Challenge',
        shared: function (r) { return { c: r.int(6, 15) }; },
        stem: function (sh) { return 'A natural number ' + t('n') + ' is chosen so that ' + t('\\sqrt{n}') + ', written in simplest mixed radical form, has coefficient exactly ' + t(sh.c) + '.'; },
        parts: [
          { id: 'e16a', level: 'ADV', make: function (r, sh) {
            var c = sh.c, c2 = c * c;
            return P.number('Find the <b>smallest</b> such ' + t('n') + '.', 2 * c2, function (v) {
              if (v === c2) return { code: 'leftover-1', hint: 'Then ' + t('\\sqrt{' + c2 + '}=' + c) + ' — there is no radical left. The leftover radicand has to be greater than ' + t('1') + '.' };
              if (v === 4 * c2) return { code: 'leftover-4', hint: t('\\sqrt{' + F(4 * c2) + '}=' + 2 * c) + ': the leftover ' + t('4') + ' is a perfect square, so more comes out.' };
              if (v % c2 === 0 && v > 2 * c2) return { code: 'not-smallest', hint: 'That works, but it isn’t the smallest. What is the smallest leftover radicand that has no perfect-square factor?' };
              return null;
            }, t('\\sqrt{n}=' + c + '\\sqrt{r}') + ' means ' + t('n=' + c + '^{2}\\times r=' + c2 + 'r') + ', where the leftover ' + t('r>1') + ' has no perfect-square factor. The smallest such ' + t('r') + ' is ' + t('2') + ':<br>' + t('n=' + c2 + '\\times 2=' + 2 * c2) + ', and ' + t('\\sqrt{' + 2 * c2 + '}=' + rad(c, 2, 2)) + '.',
            ['If ' + t('\\sqrt{n}=' + c + '\\sqrt{r}') + ', then ' + t('n=' + c + '^{2}\\times r') + '. What is the smallest allowed ' + t('r') + '?'], 'smallest n with coefficient ' + c);
          } },
          { id: 'e16b', level: 'PRG', make: function (r, sh) { var c = sh.c; return P.radical('Write ' + t('\\sqrt{n}') + ' in simplest mixed radical form for your answer to part (a).', { k: c, n: 2, m: 2 }, 'mixed', t('\\sqrt{' + 2 * c * c + '}=\\sqrt{' + c * c + '\\times 2}=' + rad(c, 2, 2)), ['The coefficient must be ' + t(c) + '.'], 'sqrt ' + 2 * c * c); } },
          { id: 'e16c', level: 'ADV', make: function (r, sh) {
            var c = sh.c, c2 = c * c;
            return P.mc(r, 'A classmate suggests ' + t('n=' + c2 + '\\times 4=' + F(4 * c2)) + '. Why does that fail?', [
              { html: t('\\sqrt{' + F(4 * c2) + '}=' + c + '\\times 2=' + 2 * c) + ': the leftover ' + t('4') + ' is a perfect square. The leftover radicand must be greater than ' + t('1') + ' with no perfect-square factor.', right: true },
              { html: 'It doesn’t fail: ' + t('\\sqrt{' + F(4 * c2) + '}=' + c + '\\sqrt{4}') + ', which has coefficient ' + t(c) + '.', why: t(c + '\\sqrt{4}') + ' isn’t in simplest form — ' + t('\\sqrt{4}=2') + ' comes out too.' },
              { html: 'It fails because the leftover radicand must be a prime number.', why: 'Not quite: ' + t(c + '\\sqrt{6}') + ' is in simplest form, and ' + t('6') + ' isn’t prime. The leftover just can’t have a perfect-square factor.' },
              { html: 'It fails because ' + t('n') + ' must be less than ' + t(F(3 * c2)) + '.', why: 'There’s no size limit. Simplify ' + t('\\sqrt{' + F(4 * c2) + '}') + ' and look at the coefficient.' }],
              t('\\sqrt{' + F(4 * c2) + '}=\\sqrt{' + c2 + '\\times 4}=' + c + '\\times 2=' + 2 * c) + '. The leftover ' + t('4') + ' is itself a perfect square, so more comes out: ' + t(F(4 * c2) + '=' + 2 * c + '^{2}') + '.<br><b>Condition:</b> the leftover radicand must be greater than ' + t('1') + ' and have no perfect-square factor other than ' + t('1') + '.',
              ['Simplify ' + t('\\sqrt{' + F(4 * c2) + '}') + ' completely.'], 'why 4c^2 fails');
          } },
          { id: 'e16d', level: 'ADV', make: function (r, sh) {
            var c2 = sh.c * sh.c;
            return P.fields('Find the next <b>two</b> values of ' + t('n') + ' after your answer to (a), in increasing order.', [{ label: 'Next:', name: 'Next' }, { label: 'After that:', name: 'After that' }],
              [numChk(3 * c2, [{ v: 4 * c2, code: 'leftover-4', hint: 'That’s the classmate’s ' + t(F(4 * c2)) + ' — the leftover ' + t('4') + ' is a perfect square.' }]), numChk(5 * c2, [{ v: 4 * c2, code: 'leftover-4', hint: t(F(4 * c2)) + ' is ruled out by part (c). Skip the leftover ' + t('4') + '.' }, { v: 6 * c2, code: 'skipped', hint: 'Close — but there is an allowed leftover radicand between ' + t('3') + ' and ' + t('6') + '.' }])],
              [String(3 * c2), String(5 * c2)], t(F(3 * c2)) + ' and ' + t(F(5 * c2)),
              'The next allowed leftover radicands after ' + t('2') + ' are ' + t('3') + ' and ' + t('5') + ' (' + t('4') + ' is ruled out):<br>' + t('n=' + c2 + '\\times 3=' + F(3 * c2)) + ', ' + t('\\sqrt{' + F(3 * c2) + '}=' + rad(sh.c, 2, 3)) + '<br>' + t('n=' + c2 + '\\times 5=' + F(5 * c2)) + ', ' + t('\\sqrt{' + F(5 * c2) + '}=' + rad(sh.c, 2, 5)),
              ['List the allowed leftover radicands in order: ' + t('2, 3, ?, \\ldots') + '.'], 'next two n');
          } },
          { id: 'e16e', level: 'PRG', make: function (r, sh) { var c = sh.c; return setsPart('Is ' + t('\\sqrt{n}') + ' rational for your answer in (a)? Tick every set it belongs to.', [{ id: 'x', tex: '\\sqrt{' + F(2 * c * c) + '}', cls: 'irr', note: '=' + rad(c, 2, 2) }], false, 'classify sqrt 2c^2'); } }] },
      { num: '17',
        shared: function (r) {
          var G = r.pick([12, 6, 10, 14, 15, 18, 20]), R = r.pick([15, 6, 10, 12, 18, 20]), L = G * R, pairs = [];
          for (var m = 1; m * m < R; m++) if (R % m === 0 && ex.gcd(m, R / m) === 1) pairs.push([G * m, G * R / m]);
          return { G: G, R: R, L: L, pairs: pairs };
        },
        stem: function (sh) { return 'Two natural numbers ' + t('a') + ' and ' + t('b') + ' with ' + t('a<b') + ' satisfy ' + t('\\text{GCF}(a,b)=' + sh.G) + ' and ' + t('\\text{LCM}(a,b)=' + sh.L) + '.'; },
        parts: [
          { id: 'e17a', level: 'PRG', outcome: 'AN1', make: function (r, sh) {
            return P.number('Use ' + t('\\text{GCF}\\times\\text{LCM}=ab') + ' to find ' + t('ab') + '.', sh.G * sh.L, function (v) { if (v === sh.G + sh.L) return { code: 'lcm-sum', hint: 'Multiply the GCF and LCM — don’t add them.' }; if (v === sh.L / sh.G) return { code: 'gcf-lcm', hint: 'Multiply, don’t divide.' }; return null; },
              t('ab=\\text{GCF}\\times\\text{LCM}=' + sh.G + '\\times ' + sh.L + '=' + F(sh.G * sh.L)) + '.', ['Multiply the GCF by the LCM.'], 'ab from GCF, LCM');
          } },
          { id: 'e17b', level: 'MAS', outcome: 'AN1', make: function (r, sh) {
            var G = sh.G, L = sh.L, key = sh.pairs.map(function (p) { return [String(p[0]), String(p[1])]; });
            return { prompt: 'Write ' + t('a=' + G + 'm') + ' and ' + t('b=' + G + 'n') + '. Find <b>every</b> possible pair ' + t('(a,b)') + '.', input: { type: 'pairs', start: 1 }, key: key, answer: sh.pairs.map(function (p) { return t('(' + p[0] + ',\\ ' + p[1] + ')'); }).join(', '), text: 'all pairs with GCF ' + G + ', LCM ' + L,
              check: function (resp) {
                if (!resp || !resp.length) return form('empty', 'Write your first pair in the boxes.');
                var got = [];
                for (var i = 0; i < resp.length; i++) {
                  var a = Number(resp[i][0]), b = Number(resp[i][1]);
                  if (resp[i][0] === '' || resp[i][1] === '' || !isFinite(a) || !isFinite(b) || a <= 0 || b <= 0) return form('blank', 'Each pair needs two natural numbers.');
                  if (a > b) { var tmp = a; a = b; b = tmp; }
                  got.push([a, b]);
                }
                var ks = got.map(function (p) { return p[0] + ',' + p[1]; });
                for (i = 0; i < ks.length; i++) if (ks.indexOf(ks[i]) !== i) return form('dup', 'You listed ' + t('(' + ks[i] + ')') + ' twice.');
                for (i = 0; i < got.length; i++) {
                  var g = ex.gcd(got[i][0], got[i][1]), l = got[i][0] * got[i][1] / g;
                  if (g !== G) return wrong('pair-gcf', t('\\text{GCF}(' + got[i][0] + ',' + got[i][1] + ')=' + g) + ', not ' + t(G) + '. ' + (got[i][0] % G === 0 && got[i][1] % G === 0 ? 'If ' + t('m') + ' and ' + t('n') + ' share a factor, the GCF grows above ' + t(G) + '.' : 'Both numbers must be multiples of ' + t(G) + '.'));
                  if (l !== L) return wrong('pair-lcm', t('\\text{LCM}(' + got[i][0] + ',' + got[i][1] + ')=' + F(l)) + ', not ' + t(L) + '. The product must be ' + t('ab=' + F(G * L)) + '.');
                }
                if (got.length < sh.pairs.length) return wrong('pair-missing', 'You have ' + got.length + ' of the ' + sh.pairs.length + ' pairs. ' + t('mn=' + sh.R) + ': list every factor pair of ' + t(sh.R) + ' whose numbers share no common factor.');
                return ok();
              },
              solution: t('(' + G + 'm)(' + G + 'n)=' + F(G * L)) + ', so ' + t(G * G + 'mn=' + F(G * L)) + ' and ' + t('mn=' + sh.R) + '.<br>' + t('m') + ' and ' + t('n') + ' must share no common factor (a shared factor would push the GCF above ' + t(G) + '), and ' + t('m<n') + '.<br>Pairs: ' + sh.pairs.map(function (p) { return t('(m,n)=(' + p[0] / G + ',' + p[1] / G + ')') + ' → ' + t('(' + p[0] + ',\\ ' + p[1] + ')'); }).join('; ') + '.',
              hints: ['Find ' + t('mn') + ' from ' + t('ab') + '. Then list the factor pairs of ' + t('mn') + ' that share no common factor.'] };
          } },
          { id: 'e17c', level: 'PRG', make: function (r, sh) {
            var p = sh.pairs[0], red = ex.norm(p[0], p[1]);
            return P.repeating('For the pair ' + t('(' + p[0] + ',\\ ' + p[1] + ')') + ', write ' + t('\\frac{a}{b}') + ' as a decimal (reduce first; use bar notation if it repeats).', red, {}, t('\\frac{' + p[0] + '}{' + p[1] + '}=' + ex.texRat(red)) + '. Denominator ' + t(denEq(red[1])) + (terminates(red[1]) ? ' — only 2s and 5s, so it terminates: ' : ' — it has a prime other than 2 and 5, so it repeats: ') + t(K.decTex(red)) + '.',
              ['Reduce, then check the primes in the denominator before you divide.'], 'decimal ' + p[0] + '/' + p[1]);
          } },
          { id: 'e17d', level: 'PRG', make: function (r, sh) {
            var p = sh.pairs[1], red = ex.norm(p[0], p[1]);
            return P.repeating('For the pair ' + t('(' + p[0] + ',\\ ' + p[1] + ')') + ', write ' + t('\\frac{a}{b}') + ' as a decimal (reduce first; use bar notation if it repeats).', red, {}, t('\\frac{' + p[0] + '}{' + p[1] + '}=' + ex.texRat(red)) + '. Denominator ' + t(denEq(red[1])) + (terminates(red[1]) ? ' — only 2s and 5s, so it terminates: ' : ' — it has a prime other than 2 and 5, so it repeats: ') + t(K.decTex(red)) + '.',
              ['Reduce, then check the primes in the denominator before you divide.'], 'decimal ' + p[0] + '/' + p[1]);
          } },
          { id: 'e17e', level: 'PRG', make: function (r, sh) { return setsPart('List every set each quotient belongs to.', sh.pairs.map(function (p, i) { return { id: 'q' + i, tex: '\\frac{' + p[0] + '}{' + p[1] + '}', cls: 'frac', note: '=' + ex.texRat(ex.norm(p[0], p[1])) }; }), false, 'classify quotients'); } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'ADV', outcome: 'AN1', make: function (r) {
          var T = r.pick([[15, 4, 2], [21, 6, 2], [27, 8, 2], [35, 6, 4]]), Fc = T[0], A = T[1], B = T[2];
          function v(a, b) { return Math.pow(2, a) * Math.pow(3, b); }
          function ft(a, b) { return '2^{' + a + '}\\times 3^{' + b + '}'; }
          var opts = [{ e: [A, B], right: true }, { e: [B, A], why: 'Both ' + t(ft(A, B)) + ' and ' + t(ft(B, A)) + ' have ' + t(Fc) + ' factors — but which is smaller? Put the larger exponent on the smaller prime.' },
            { e: [A - 2, B], why: t(F(v(A - 2, B)) + '=' + ft(A - 2, B)) + ' has ' + t('(' + (A - 1) + ')(' + (B + 1) + ')=' + (A - 1) * (B + 1)) + ' factors, not ' + t(Fc) + '.' },
            { e: [A, B + 2], why: t(F(v(A, B + 2)) + '=' + ft(A, B + 2)) + ' has ' + t('(' + (A + 1) + ')(' + (B + 3) + ')=' + (A + 1) * (B + 3)) + ' factors, not ' + t(Fc) + '.' }];
          opts.sort(function (x, y) { return v(x.e[0], x.e[1]) - v(y.e[0], y.e[1]); });
          return P.mc(r, 'A number ' + t('k=2^{a}\\times 3^{b}') + ' is a perfect square and has exactly ' + t(Fc) + ' factors. The smallest possible value of ' + t('k') + ' is', opts.map(function (o) { return { html: t(F(v(o.e[0], o.e[1]))), right: !!o.right, why: o.why }; }),
            t(Fc) + ' factors: ' + t('(a+1)(b+1)=' + Fc) + ', so ' + t('(a,b)') + ' is ' + t('(' + A + ',' + B + ')') + ', ' + t('(' + B + ',' + A + ')') + ', ' + t('(' + (Fc - 1) + ',0)') + ' or ' + t('(0,' + (Fc - 1) + ')') + ' — all even, so all are perfect squares.<br>' +
            t(ft(A, B) + '=' + F(v(A, B))) + ', ' + t(ft(B, A) + '=' + F(v(B, A))) + ', and ' + t('2^{' + (Fc - 1) + '}') + ' is far bigger. The smallest is ' + t(F(v(A, B))) + '.',
            ['Use ' + t('(a+1)(b+1)') + ' = number of factors. Which exponent pairs give ' + t(Fc) + '?'], 'smallest square with ' + Fc + ' factors', true);
        } }] },
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'ADV', make: function (r) {
          var k, m, V, i;
          for (i = 0; i < 200; i++) { k = r.pick([6, 10, 15]); m = r.pick([2, 3, 5, 7]); V = k * k * k * m; if (V <= 9999) break; }
          var dv = nt.divisors(k).filter(function (d) { return d > 1 && d < k; }), d1 = dv[0], d2 = dv[dv.length - 1];
          function part(d) { var rest = Math.pow(k / d, 3) * m; return { html: t(rad(-d, 3, rest)), why: 'Same value, but not simplest: ' + t(F(rest) + '=' + Math.pow(k / d, 3) + '\\times ' + m) + ' still holds the perfect cube ' + t(Math.pow(k / d, 3)) + '.' }; }
          return P.mc(r, 'Written in simplest mixed radical form, ' + t('\\sqrt[3]{-' + F(V) + '}') + ' is', [{ html: t(rad(-k, 3, m)), right: true }, part(d1), part(d2),
            { html: 'not possible in the real number system', why: 'An <b>odd</b> index allows a negative radicand: ' + t('(-' + k + ')^{3}=-' + F(k * k * k)) + '.' }],
            t(F(V) + '=' + K.fac(V) + '=' + k * k * k + '\\times ' + m) + ', so ' + t('\\sqrt[3]{-' + F(V) + '}=-\\sqrt[3]{' + k * k * k + '\\times ' + m + '}=' + rad(-k, 3, m)) + '.<br>' + t(rad(-d1, 3, Math.pow(k / d1, 3) * m)) + ' and ' + t(rad(-d2, 3, Math.pow(k / d2, 3) * m)) + ' have the same value but still contain perfect cubes. An odd index allows a negative radicand.',
            ['Find the <b>largest</b> perfect cube factor of ' + t(F(V)) + '.'], 'cbrt -' + V + ' simplest');
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20a', level: 'ADV', outcome: 'AN1', make: function (r) {
          var ps = r.pick([[2, 3, 7], [2, 3, 5], [2, 5, 7]]), f = ps.map(function (p) { return [p, r.pick([1, 2, 4, 5])]; }), u = powerUp(f, 3);
          return P.nr('For ' + t('x=' + fTex(f)) + ', the smallest natural number ' + t('k') + ' such that ' + t('kx') + ' is a perfect cube is ________.', u.k, function (v) { for (var i = 0, al = kAlts(f, 3); i < al.length; i++) if (v === al[i].v) return { code: al[i].code, hint: al[i].hint }; return null; },
            'Raise each exponent to a multiple of ' + t('3') + ': ' + f.map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{' + (pe[1] + (3 - pe[1] % 3) % 3) + '}') + ' (' + ((3 - pe[1] % 3) % 3 === 1 ? 'one ' : 'two ') + t(pe[0]) + ')'; }).join(', ') + '.<br>' + t('k=' + fTex(u.kf) + '=' + u.k) + '.',
            ['A perfect cube has every exponent a multiple of ' + t('3') + '. How many more of each prime are needed?'], 'k for kx cube');
        } },
        { id: 'e20b', level: 'ADV', make: function (r) {
          var items = r.shuffle(e20Items(r)), cnt = items.filter(function (x) { return x.irr; }).length, roots = items.filter(function (x) { return x.root; }).length;
          return P.nr('The number of the twelve numbers below that are irrational is ________.<div class="numlist">' + items.map(function (x) { return '<span>' + t('\\displaystyle ' + x.tex) + '</span>'; }).join('') + '</div>', cnt, function (v) {
            if (v === roots && roots !== cnt) return { code: 'count-radicals', hint: 'A radical sign doesn’t make a number irrational. Simplify each root first — some are whole numbers or fractions.' };
            if (v === cnt + 1) return { code: 'count-plus', hint: 'One too many. A fraction like ' + t('\\frac{22}{7}') + ' and a repeating decimal are rational.' };
            if (v === cnt - 1) return { code: 'count-minus', hint: 'One too few. A decimal with a pattern that never repeats, and ' + t('\\pi') + ' plus or minus a number, are irrational.' };
            return null;
          }, '<b>Irrational:</b> ' + items.filter(function (x) { return x.irr; }).map(function (x) { return t(x.tex + x.why); }).join(', ') + '<br><b>Rational:</b> ' + items.filter(function (x) { return !x.irr; }).map(function (x) { return t(x.tex + x.why); }).join(', ') + '<br>So ' + t(cnt) + ' are irrational.',
          ['Simplify each number. Roots of perfect powers, fractions and repeating decimals are rational.'], 'count irrationals among 12');
        } }] }
    ]
  });
})(window);
