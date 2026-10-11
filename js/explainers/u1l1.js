/* Unit 1 · Lesson 1 — explainers for the lesson's five worked examples (u1_L01.tex, Examples 1–5).
 * Each step's caption is what the narrator says; render() draws the full picture for that step. */
(function (root) {
  'use strict';
  var HW = root.HW, X = HW.X, el = X.el, F = X.fmt;

  /* ---------- helpers ---------- */
  function pairSteps(n, part, opt) { // tile steps that find every factor pair of n
    opt = opt || {};
    var out = [], found = [[1, n]];
    out.push({ part: part, n: n, rows: 1, found: found.slice(), verdict: '',
      say: opt.first || ('Start with <b>' + n + '</b> tiles in one long row. That rectangle is <b>1 × ' + n + '</b>, so 1 and ' + n + ' are always factors.') });
    for (var d = 2; ; d++) {
      if (d * d > n) {
        out.push({ part: part, n: n, rows: found[found.length - 1][0], found: found.slice(), verdict: 'stop',
          say: 'Next would be ' + d + ', but ' + d + ' × ' + d + ' = ' + d * d + ' is already bigger than ' + n + '. Any partner for ' + d + ' would have to be smaller than ' + d + ', and we have already tried all of those. <b>Stop.</b>' });
        break;
      }
      var cols = Math.floor(n / d), left = n - d * cols;
      if (!left) {
        found.push([d, cols]);
        if (d === cols) { out.push({ part: part, n: n, rows: d, found: found.slice(), verdict: 'sq', say: '<b>' + d + ' rows of ' + d + '</b> makes a square. The partner of ' + d + ' is ' + d + ' itself, so the pairs have met in the middle. <b>Stop</b>, and write ' + d + ' only once.' }); break; }
        out.push({ part: part, n: n, rows: d, found: found.slice(), verdict: 'yes', say: 'Try <b>' + d + ' rows</b>: ' + d + ' rows of ' + cols + ' with nothing left over. So <b>' + n + ' = ' + d + ' × ' + cols + '</b>, and both ' + d + ' and ' + cols + ' are factors.' });
      } else {
        out.push({ part: part, n: n, rows: d, found: found.slice(), verdict: 'no', say: 'Try <b>' + d + ' rows</b>: ' + d + ' rows of ' + cols + ' leaves <span class="xno">' + left + ' left over</span>. ' + n + ' ÷ ' + d + ' isn’t a whole number, so ' + d + ' is <b>not</b> a factor.' });
      }
    }
    return { steps: out, found: found };
  }
  function drawPairs(side, n, found, final, mark) {
    var ds = X.divisors(n);
    side.innerHTML = '<div class="xpanel-h">Factor pairs found</div><div class="xpairs">' + found.map(function (p) { return '<span class="xpair' + (p[0] === p[1] ? ' sq' : '') + '">' + p[0] + ' × ' + p[1] + '</span>'; }).join('') + '</div>' +
      '<div class="xpanel-h">Factors in order</div>' + X.rainbow(ds, found, { mark: mark }) + (final ? '<div class="xcount"><b>' + ds.length + '</b> factors: ' + ds.join(', ') + '</div>' : '');
  }
  /* factor tree: nodes [{id, v, parent}] revealed up to `upto`; primes in `circled` get a ring */
  function tree(nodes, upto, circled, hi) {
    var shown = nodes.filter(function (nd) { return upto.indexOf(nd.id) >= 0; }), kids = {}, pos = {};
    shown.forEach(function (nd) { if (nd.parent) (kids[nd.parent] = kids[nd.parent] || []).push(nd); });
    var leaves = 0;
    (function place(nd, depth) { var ch = kids[nd.id] || []; if (!ch.length) { pos[nd.id] = { x: leaves++, y: depth }; return; } ch.forEach(function (c) { place(c, depth + 1); }); pos[nd.id] = { x: (pos[ch[0].id].x + pos[ch[ch.length - 1].id].x) / 2, y: depth }; })(shown[0], 0);
    var W = 440, maxY = Math.max.apply(null, shown.map(function (nd) { return pos[nd.id].y; })), H = 70 + maxY * 70, cw = Math.min(90, (W - 60) / Math.max(1, leaves - 1));
    var x0 = W / 2 - (leaves - 1) * cw / 2, X0 = function (id) { return x0 + pos[id].x * cw; }, Y0 = function (id) { return 30 + pos[id].y * 70; };
    var out = '<svg class="xtree" viewBox="0 0 ' + W + ' ' + Math.max(H, 120) + '" role="img" aria-label="Factor tree">';
    shown.forEach(function (nd) { if (nd.parent) out += '<line class="' + (hi && hi.indexOf(nd.id) >= 0 ? 'fresh' : '') + '" x1="' + X0(nd.parent) + '" y1="' + (Y0(nd.parent) + 13) + '" x2="' + X0(nd.id) + '" y2="' + (Y0(nd.id) - 15) + '" />'; });
    shown.forEach(function (nd) {
      var isC = circled.indexOf(nd.id) >= 0, fresh = hi && hi.indexOf(nd.id) >= 0;
      out += '<g class="tn' + (isC ? ' prime' : '') + (fresh ? ' fresh' : '') + '"><circle cx="' + X0(nd.id) + '" cy="' + Y0(nd.id) + '" r="' + (String(nd.v).length > 3 ? 27 : 19) + '" /><text x="' + X0(nd.id) + '" y="' + (Y0(nd.id) + 6) + '" text-anchor="middle">' + F(nd.v) + '</text></g>';
    });
    return out + '</svg>';
  }

  /* ================= Example 1 — listing factors, and counting them ================= */
  var e1a = pairSteps(16, 'a1'), e1b = pairSteps(40, 'a2'), B = [4, 12, 1, 11, 28];
  var ex1steps = [{ part: 'a1', n: 16, rows: 1, found: [], verdict: '', intro: true,
    say: 'A <b>factor</b> of a number divides into it evenly. Here is a way to see it: if a pile of tiles can be arranged into a rectangle with nothing left over, the rows and the columns are a <b>factor pair</b>.' }]
    .concat(e1a.steps, [{ part: 'a1', n: 16, rows: 4, found: e1a.found, verdict: 'stop', final: true, say: 'Now read the factors from the pairs, smallest to largest: <b>1, 2, 4, 8, 16</b>. That is <b>5 factors</b>, an odd number, because the square pair 4 × 4 only gives one factor.' }],
      e1b.steps, [{ part: 'a2', n: 40, rows: 5, found: e1b.found, verdict: 'stop', final: true, say: 'The factors of 40, in order: <b>1, 2, 4, 5, 8, 10, 20, 40</b>. Four pairs give <b>8 factors</b>. Working through the pairs in order is what makes sure none are missed.' }],
      [{ part: 'b', b: -1, say: 'Part (b) asks only <b>how many</b> factors each number has. Same method: find the pairs, then count every different number in them.' }],
      B.map(function (n, i) { return { part: 'b', b: i, say: {
        4: '<b>4 = 1 × 4 = 2 × 2.</b> The factors are 1, 2 and 4, so <b>3 factors</b>. The pair 2 × 2 uses the same number twice, and it is counted once.',
        12: '<b>12 = 1 × 12 = 2 × 6 = 3 × 4.</b> Three pairs, six different numbers: 1, 2, 3, 4, 6, 12. That is <b>6 factors</b>.',
        1: '<b>1 = 1 × 1</b>, and that is the only pair. The number 1 has just <b>1 factor</b>.',
        11: '<b>11 = 1 × 11</b> only. 2 and 3 leave tiles left over, and 4 × 4 is already past 11. So 11 has exactly <b>2 factors</b>.',
        28: '<b>28 = 1 × 28 = 2 × 14 = 4 × 7.</b> 3, 5 and 6 don’t divide evenly. The factors are 1, 2, 4, 7, 14, 28: <b>6 factors</b>.' }[n] }; }),
      [{ part: 'b', b: 5, say: 'Look at the counts. <b>11</b> has exactly two factors, which makes it <b>prime</b>. <b>1</b> has only one factor. And the squares, 4 and 1, have an odd number of factors. Primes are what the next part of the lesson is about.' }]);
  var EX1 = {
    id: 'ex1', num: '1', title: 'Listing factors, and counting them',
    parts: [{ id: 'a1', label: '(a)(i) Factors of 16' }, { id: 'a2', label: '(a)(ii) Factors of 40' }, { id: 'b', label: '(b) Counting factors' }],
    steps: ex1steps,
    setup: function (stage, side, board) {
      var T = X.tiles(stage), cards = el('div', 'xcards');
      return function (s) {
        var isB = s.part === 'b';
        board.classList.toggle('wide', isB);
        if (isB) {
          stage.innerHTML = ''; T = null; stage.appendChild(cards); side.innerHTML = '';
          cards.innerHTML = B.map(function (n, i) {
            var ds = X.divisors(n), pairs = ds.filter(function (d) { return d * d <= n; }).map(function (d) { return d + '×' + n / d; });
            var cls = 'xmini' + (s.b >= i || s.b === 5 ? ' seen' : '') + (s.b === i ? ' on' : '');
            return '<div class="' + cls + '"><div class="n">' + n + '</div><div class="pl">' + pairs.join(', ') + '</div><div class="fc"><b>' + ds.length + '</b> factor' + (ds.length === 1 ? '' : 's') + '</div><div class="tag">' + (n === 11 ? 'prime' : Math.sqrt(n) % 1 === 0 ? 'square: odd count' : '') + '</div></div>';
          }).join('');
          return;
        }
        if (!T || !stage.contains(stage.querySelector('.xtiles'))) { stage.innerHTML = ''; T = X.tiles(stage); }
        T.show(s.n, s.rows, s.verdict);
        drawPairs(side, s.n, s.found, s.final);
      };
    }
  };

  /* ================= Example 2 — prime or composite? ================= */
  var TEST = [2, 3, 5, 7, 11, 13];
  var why = {
    2: function (n) { return n % 2 ? n + ' is odd, so <b>2</b> doesn’t divide it.' : n + ' is even, so <b>2</b> divides it.'; },
    3: function (n) { var ds = String(n).split('').map(Number), s = ds.reduce(function (a, b) { return a + b; }, 0); return 'Digit sum ' + ds.join(' + ') + ' = ' + s + (s % 3 ? ', not a multiple of 3, so <b>3</b> doesn’t divide it.' : ', a multiple of 3, so <b>3</b> divides it: ' + n + ' = 3 × ' + n / 3 + '.'); },
    5: function (n) { return n % 5 ? n + ' doesn’t end in 0 or 5, so <b>5</b> doesn’t divide it.' : n + ' ends in ' + n % 10 + ', so <b>5</b> divides it.'; },
    7: function (n) { var q = Math.floor(n / 7), r = n - 7 * q; return r ? '7 × ' + q + ' = ' + 7 * q + ', which leaves ' + r + ' over, so <b>7</b> doesn’t divide it.' : '7 × ' + q + ' = ' + n + ', so <b>7</b> divides it.'; }
  };
  function primeSteps(n, part, extra) {
    var root2 = Math.sqrt(n), lim = TEST.filter(function (p) { return p <= root2; }), out = [], tested = [];
    out.push({ part: part, n: n, tested: [], say: '<b>' + n + '</b>: √' + n + ' ≈ ' + root2.toFixed(1) + ', so we only need to test the primes up to ' + root2.toFixed(1) + ': <b>' + lim.join(', ') + '</b>.' + (extra || '') });
    for (var i = 0; i < lim.length; i++) {
      var p = lim[i], ok = n % p === 0; tested = tested.concat([[p, ok]]);
      if (ok) { out.push({ part: part, n: n, tested: tested.slice(), verdict: 'composite', say: why[p](n) + ' Since ' + n + ' = ' + p + ' × ' + n / p + ', it has more than two factors: <b>composite</b>. One factor pair is all the proof you need, so stop testing.' }); return out; }
      out.push({ part: part, n: n, tested: tested.slice(), say: why[p](n) });
    }
    out.push({ part: part, n: n, tested: tested.slice(), verdict: 'prime', say: 'None of ' + lim.join(', ') + ' divides ' + n + ', and the next prime is past √' + n + '. So ' + n + ' has only the factors 1 and ' + n + ': <b>prime</b>.' });
    return out;
  }
  var e2 = [{ part: '51', n: 0, tested: [], say: 'A <b>prime</b> has exactly two factors, 1 and itself. A <b>composite</b> number has more. To decide, divide by the primes 2, 3, 5, 7 and so on, but only as far as the <b>square root</b> of the number.' }]
    .concat(primeSteps(51, '51'), primeSteps(59, '59', ' Why stop there? If 59 had a factor bigger than 7.7, its partner would be smaller than 7.7, and we are testing all of those anyway.'),
      primeSteps(63, '63'), primeSteps(91, '91', ' 91 looks prime, but watch.'), primeSteps(97, '97'),
      [{ part: '97', n: 97, tested: [[2, false], [3, false], [5, false], [7, false]], verdict: 'prime', summary: true, say: 'Results: 51, 63 and 91 are <b>composite</b>. 59 and 97 are <b>prime</b>. 91 is a classic trap: it is odd, and doesn’t pass the tests for 3 or 5, but 7 × 13 = 91.' }]);
  var EX2 = {
    id: 'ex2', num: '2', title: 'Prime or composite?',
    parts: [51, 59, 63, 91, 97].map(function (n) { return { id: String(n), label: '(' + 'abcde'['51 59 63 91 97'.split(' ').indexOf(String(n))] + ') ' + n }; }),
    steps: e2,
    setup: function (stage, side) {
      return function (s, ctx) {
        // results so far (side)
        var done = {}; ctx.steps.slice(0, ctx.index + 1).forEach(function (st) { if (st.verdict) done[st.n] = st.verdict; });
        side.innerHTML = '<div class="xpanel-h">Results</div><div class="xresults">' + [51, 59, 63, 91, 97].map(function (n) {
          var v = done[n]; return '<div class="xres' + (v ? ' ' + v : '') + (n === s.n ? ' on' : '') + '"><b>' + n + '</b><span>' + (v === 'prime' ? 'prime' : v === 'composite' ? 'composite: ' + n + ' = ' + X.divisors(n)[1] + ' × ' + n / X.divisors(n)[1] : '…') + '</span></div>';
        }).join('') + '</div>';
        if (!s.n) { stage.innerHTML = '<div class="xbig"><div class="xdefs"><div><b>Prime</b><span>exactly two factors</span><em>2, 3, 5, 7, 11, 13, …</em></div><div><b>Composite</b><span>more than two factors</span><em>4, 6, 8, 9, 10, 12, …</em></div></div></div>'; return; }
        var r2 = Math.sqrt(s.n), tmap = {}; s.tested.forEach(function (t) { tmap[t[0]] = t[1] ? 'yes' : 'no'; });
        var chips = TEST.map(function (p) { var past = p > r2; return '<span class="xchip' + (past ? ' past' : '') + (tmap[p] ? ' ' + tmap[p] : '') + '">' + p + '</span>' + (!past && TEST[TEST.indexOf(p) + 1] > r2 ? '<span class="xroot">√' + s.n + ' ≈ ' + r2.toFixed(1) + '</span>' : ''); }).join('');
        var last = s.tested[s.tested.length - 1];
        stage.innerHTML = '<div class="xbig"><div class="xnum">' + s.n + '</div><div class="xchips">' + chips + '</div>' +
          '<div class="xwork">' + (last ? s.n + ' ÷ ' + last[0] + ' = ' + (last[1] ? s.n / last[0] + ' ✓' : (s.n / last[0]).toFixed(2).replace(/0+$/, '') + '…  ✗') : 'Test primes in order, up to the square root') + '</div>' +
          (s.verdict ? '<div class="xstamp ' + s.verdict + ' fresh">' + s.verdict + '</div>' : '') + '</div>';
      };
    }
  };

  /* ================= Example 3 — factors, prime factors, and a product of primes ================= */
  var e3a = pairSteps(44, 'a', { first: '<b>(a)</b> Factors of 44: start with 44 tiles in one row, <b>1 × 44</b>.' });
  var F44 = [1, 2, 4, 11, 22, 44], classes = { 1: 'neither', 2: 'prime', 4: 'comp', 11: 'prime', 22: 'comp', 44: 'comp' };
  var e3b = [
    { k: 0, say: '<b>(b)</b> The prime factors are the factors that are <b>themselves prime</b>. Check each factor of 44 in turn. <b>1</b> has only one factor, so it is not prime.' },
    { k: 1, say: '<b>2</b> has exactly two factors, 1 and 2. Prime.' },
    { k: 2, say: '<b>4</b> = 2 × 2, so it has more than two factors. Not prime.' },
    { k: 3, say: '<b>11</b> has only 1 and 11. Prime.' },
    { k: 5, say: '<b>22</b> = 2 × 11 and <b>44</b> = 4 × 11 are composite. So the prime factors of 44 are just <b>2 and 11</b>.' }
  ].map(function (o) { return { part: 'b', k: o.k, say: o.say }; });
  var T44 = [{ id: 'r', v: 44 }, { id: 'a', v: 4, parent: 'r' }, { id: 'b', v: 11, parent: 'r' }, { id: 'c', v: 2, parent: 'a' }, { id: 'd', v: 2, parent: 'a' }];
  var e3c = [
    { part: 'c', up: ['r'], circ: [], hi: ['r'], say: '<b>(c)</b> To write 44 as a <b>product of primes</b>, break it down until every piece is prime.' },
    { part: 'c', up: ['r', 'a', 'b'], circ: ['b'], hi: ['a', 'b'], say: 'Use a factor pair from part (a): <b>44 = 4 × 11</b>. 11 is prime, so circle it.' },
    { part: 'c', up: ['r', 'a', 'b', 'c', 'd'], circ: ['b', 'c', 'd'], hi: ['c', 'd'], say: '4 is not prime, so break it again: <b>4 = 2 × 2</b>. Every branch now ends in a prime.' },
    { part: 'c', up: ['r', 'a', 'b', 'c', 'd'], circ: ['b', 'c', 'd'], result: true, say: 'Multiply the circled primes: <b>44 = 2 × 2 × 11</b>. With an exponent for the repeated 2: <b>44 = 2² × 11</b>. Check: 4 × 11 = 44.' }
  ];
  var EX3 = {
    id: 'ex3', num: '3', title: 'Factors, prime factors, and a product of primes',
    parts: [{ id: 'a', label: '(a) Factors of 44' }, { id: 'b', label: '(b) Prime factors' }, { id: 'c', label: '(c) Product of primes' }],
    steps: e3a.steps.concat([{ part: 'a', n: 44, rows: 4, found: e3a.found, verdict: 'stop', final: true, say: 'The factors of 44 are <b>1, 2, 4, 11, 22, 44</b>.' }], e3b, e3c),
    setup: function (stage, side, board) {
      var T = null;
      return function (s) {
        board.classList.toggle('wide', false);
        if (s.part === 'a') {
          if (!T || !stage.querySelector('.xtiles')) { stage.innerHTML = ''; T = X.tiles(stage); }
          T.show(s.n, s.rows, s.verdict); drawPairs(side, s.n, s.found, s.final); return;
        }
        T = null;
        if (s.part === 'b') {
          var mark = {}; F44.forEach(function (v, i) { if (i <= s.k || s.k === 5) mark[v] = classes[v]; });
          stage.innerHTML = '<div class="xbig"><div class="xfacs">' + F44.map(function (v, i) { var c = mark[v]; return '<span class="xfac ' + (c || '') + (i === s.k ? ' on' : '') + '">' + v + '<em>' + (c === 'prime' ? 'prime' : c === 'comp' ? 'composite' : c === 'neither' ? 'neither' : '') + '</em></span>'; }).join('') + '</div></div>';
          var pf = F44.filter(function (v) { return mark[v] === 'prime'; });
          side.innerHTML = '<div class="xpanel-h">Prime factors of 44</div><div class="xpairs">' + (pf.length ? pf.map(function (v) { return '<span class="xpair">' + v + '</span>'; }).join('') : '<span class="xmuted">none yet</span>') + '</div>';
          return;
        }
        stage.innerHTML = '<div class="xtreebox">' + tree(T44, s.up, s.circ, s.hi) + '</div>';
        side.innerHTML = '<div class="xpanel-h">Circled primes</div><div class="xpairs">' + (s.circ.length ? s.circ.map(function (id) { return '<span class="xpair">' + T44.filter(function (n) { return n.id === id; })[0].v + '</span>'; }).join('') : '<span class="xmuted">none yet</span>') + '</div>' +
          (s.result ? '<div class="xresult">44 = 2 × 2 × 11<br><b>44 = 2² × 11</b></div>' : '');
      };
    }
  };

  /* ================= Example 4 — the division ladder ================= */
  var L = [[2, 3432], [2, 1716], [2, 858], [3, 429], [11, 143], [13, 13]];
  var e4 = [
    { rows: 0, tests: [], say: 'A <b>division ladder</b>: divide by the <b>smallest prime that fits</b>, write the answer underneath, and repeat until you reach 1. Start with <b>3432</b>.' },
    { rows: 1, tests: [['2', '3432 is even ✓']], say: '3432 is even, so divide by <b>2</b>: 3432 ÷ 2 = <b>1716</b>.' },
    { rows: 2, tests: [['2', '1716 is even ✓']], say: '1716 is still even. Divide by <b>2</b> again: 1716 ÷ 2 = <b>858</b>.' },
    { rows: 3, tests: [['2', '858 is even ✓']], say: '858 is even too: 858 ÷ 2 = <b>429</b>.' },
    { rows: 4, tests: [['2', '429 is odd ✗'], ['3', '4 + 2 + 9 = 15 ✓']], say: '429 is odd, so 2 no longer fits. Next prime, <b>3</b>: the digit sum 4 + 2 + 9 = 15 is a multiple of 3, so it fits. 429 ÷ 3 = <b>143</b>.' },
    { rows: 5, tests: [['3', '1 + 4 + 3 = 8 ✗'], ['5', 'doesn’t end in 0 or 5 ✗'], ['7', '7 × 20 = 140, 3 left ✗'], ['11', '11 × 13 = 143 ✓']], say: '143: not 3, since the digit sum is 8. Not 5. Not 7, since 7 × 20 = 140 leaves 3. Try <b>11</b>: 11 × 13 = 143, so 143 ÷ 11 = <b>13</b>.' },
    { rows: 6, tests: [['13', '13 is prime ✓']], say: '13 is prime, so the last step divides by <b>13</b> itself: 13 ÷ 13 = <b>1</b>. We reached 1, so the ladder is finished.' },
    { rows: 6, tests: [], read: true, say: 'The prime factors are the divisors down the left side: <b>2 × 2 × 2 × 3 × 11 × 13</b>. With exponents: <b>3432 = 2³ × 3 × 11 × 13</b>.' },
    { rows: 6, tests: [], read: true, check: true, say: 'Check by multiplying back: 8 × 3 = 24, 11 × 13 = 143, and 24 × 143 = 3432. ✓' }
  ];
  var EX4 = {
    id: 'ex4', num: '4', title: 'The division ladder on a larger number',
    steps: e4,
    setup: function (stage, side) {
      return function (s, ctx) {
        var rows = '';
        for (var i = 0; i < L.length; i++) {
          if (i < s.rows) rows += '<div class="lrow' + (i === s.rows - 1 && !s.read ? ' fresh' : '') + (s.read ? ' read' : '') + '"><span class="ld">' + L[i][0] + '</span><span class="lq">' + F(L[i][1]) + '</span></div>';
          else if (i === s.rows) { rows += '<div class="lrow cur"><span class="ld">?</span><span class="lq">' + F(L[i][1]) + '</span></div>'; break; }
        }
        if (s.rows === L.length) rows += '<div class="lrow' + (s.read ? '' : ' fresh') + '"><span class="ld"></span><span class="lq">1</span></div>';
        stage.innerHTML = '<div class="xladder">' + rows + '</div>';
        side.innerHTML = '<div class="xpanel-h">' + (s.read ? 'Prime factorization' : 'Which prime fits?') + '</div>' + (s.read
          ? '<div class="xresult">3432 = 2 × 2 × 2 × 3 × 11 × 13<br><b>3432 = 2³ × 3 × 11 × 13</b>' + (s.check ? '<div class="xcheck">8 × 3 × 11 × 13 = 24 × 143 = 3432 ✓</div>' : '') + '</div>'
          : (s.tests.length ? '<div class="xtests">' + s.tests.map(function (t) { return '<div class="xtest ' + (/✓/.test(t[1]) ? 'yes' : 'no') + '"><b>' + t[0] + '</b><span>' + t[1] + '</span></div>'; }).join('') + '</div>' : '<div class="xtip">Quick tests: <b>2</b> if even · <b>3</b> if the digit sum is a multiple of 3 · <b>5</b> if it ends in 0 or 5 · otherwise just divide.</div>'));
      };
    }
  };

  /* ================= Example 5 — the factor tree ================= */
  var T5 = [{ id: 'r', v: 7650 }, { id: 'a', v: 75, parent: 'r' }, { id: 'b', v: 102, parent: 'r' }, { id: 'a1', v: 3, parent: 'a' }, { id: 'a2', v: 25, parent: 'a' },
    { id: 'a21', v: 5, parent: 'a2' }, { id: 'a22', v: 5, parent: 'a2' }, { id: 'b1', v: 2, parent: 'b' }, { id: 'b2', v: 51, parent: 'b' }, { id: 'b21', v: 3, parent: 'b2' }, { id: 'b22', v: 17, parent: 'b2' }];
  var e5 = [
    { up: ['r'], circ: [], hi: ['r'], say: 'A <b>factor tree</b>: split the number into <b>any</b> factor pair, keep splitting the parts that aren’t prime, and circle each prime you reach. Start with <b>7650</b>.' },
    { up: ['r', 'a', 'b'], circ: [], hi: ['a', 'b'], say: 'Pick a split you can see. 7650 ends in 50, and 75 × 100 = 7500, plus 75 × 2 = 150, makes 7650. So <b>7650 = 75 × 102</b>.' },
    { up: ['r', 'a', 'b', 'a1', 'a2'], circ: ['a1'], hi: ['a1', 'a2'], say: '75 ends in 5, and 7 + 5 = 12 is a multiple of 3. Split it as <b>75 = 3 × 25</b>. 3 is prime: circle it.' },
    { up: ['r', 'a', 'b', 'a1', 'a2', 'a21', 'a22'], circ: ['a1', 'a21', 'a22'], hi: ['a21', 'a22'], say: '<b>25 = 5 × 5</b>. Both are prime, so circle them. The left side of the tree is finished.' },
    { up: ['r', 'a', 'b', 'a1', 'a2', 'a21', 'a22', 'b1', 'b2'], circ: ['a1', 'a21', 'a22', 'b1'], hi: ['b1', 'b2'], say: '102 is even: <b>102 = 2 × 51</b>. Circle the 2.' },
    { up: T5.map(function (n) { return n.id; }), circ: ['a1', 'a21', 'a22', 'b1', 'b21', 'b22'], hi: ['b21', 'b22'], say: '51 looks prime, but 5 + 1 = 6 is a multiple of 3: <b>51 = 3 × 17</b>. 17 is prime. Every branch now ends in a circled prime.' },
    { up: T5.map(function (n) { return n.id; }), circ: ['a1', 'a21', 'a22', 'b1', 'b21', 'b22'], result: 1, say: 'Collect the circled primes, smallest first: <b>2 × 3 × 3 × 5 × 5 × 17</b>. Using exponents: <b>7650 = 2 × 3² × 5² × 17</b>.' },
    { up: T5.map(function (n) { return n.id; }), circ: ['a1', 'a21', 'a22', 'b1', 'b21', 'b22'], result: 2, say: 'Check: 2 × 9 × 25 × 17 = 18 × 425 = 7650. ✓ Starting with a different pair, like 10 × 765, gives a different-looking tree but the <b>same primes</b>. Every number has only one prime factorization.' }
  ];
  var EX5 = {
    id: 'ex5', num: '5', title: 'The factor tree on a larger number',
    steps: e5,
    setup: function (stage, side) {
      return function (s) {
        stage.innerHTML = '<div class="xtreebox">' + tree(T5, s.up, s.circ, s.hi) + '</div>';
        var primes = s.circ.map(function (id) { return T5.filter(function (n) { return n.id === id; })[0].v; });
        side.innerHTML = '<div class="xpanel-h">Circled primes</div><div class="xpairs">' + (primes.length ? primes.map(function (v) { return '<span class="xpair">' + v + '</span>'; }).join('') : '<span class="xmuted">none yet</span>') + '</div>' +
          (s.result ? '<div class="xresult">7650 = 2 × 3 × 3 × 5 × 5 × 17<br><b>7650 = 2 × 3² × 5² × 17</b>' + (s.result === 2 ? '<div class="xcheck">2 × 9 × 25 × 17 = 7650 ✓</div>' : '') + '</div>' : '');
      };
    }
  };

  HW.defineExplainers('u1l1', [EX1, EX2, EX3, EX4, EX5]);
})(window);
