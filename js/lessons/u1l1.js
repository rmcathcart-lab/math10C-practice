/* Math 10C · Unit 1 · Lesson 1 — Prime Building Blocks of Numbers (AN1)
 * Assignment questions 1–16 (u1_L01.tex) and the Lesson 1 Extra Practice (u1_EP01.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's number is one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var P = nt.primesBetween(2, 200);
  function primesIn(a, b) { return P.filter(function (p) { return p >= a && p <= b; }); }
  function plist(n) { return K.listTex(nt.divisors(n)); }
  function sqrtNote(n) { return '\\sqrt{' + F(n) + '}\\approx ' + (Math.round(Math.sqrt(n) * 10) / 10); }
  function primesToTest(n) { return primesIn(2, Math.floor(Math.sqrt(n))); }

  /* ---------- reusable part makers ---------- */
  function factorsPart(n) {
    return { prompt: t(F(n)), input: { type: 'list' }, check: K.factorList(n), key: nt.divisors(n),
      answer: t(plist(n)), text: 'factors of ' + n,
      solution: 'Work through the factor pairs in order: ' + t(K.pairsTex(n)) + '.<br>So the factors of ' + t(F(n)) + ' are ' + t(plist(n)) + ' (' + nt.divisors(n).length + ' factors).',
      hints: ['Start with ' + t('1\\times ' + F(n)) + ', then test ' + t('2') + ', ' + t('3') + ', ' + t('4') + ', … Each factor that works brings its partner with it.', 'Stop when the pairs start repeating (once you pass ' + t(sqrtNote(n)) + ').'] };
  }
  function countPart(n) {
    var c = nt.numDivisors(n), sq = Math.round(Math.sqrt(n)) ** 2 === n;
    return { prompt: t(F(n)), input: { type: 'number' }, key: String(c), answer: t(c), text: 'number of factors of ' + n,
      check: K.number(c, function (v) {
        if (v === c - 2) return { code: 'no-1n', hint: 'Close — did you count ' + t('1') + ' and ' + t(F(n)) + ' itself? Both are factors.' };
        if (v === c - 1) return { code: 'no-1orn', hint: 'Almost: one factor is missing. Remember ' + t('1') + ' and the number itself both count.' };
        if (!sq && v * 2 === c) return { code: 'pairs', hint: 'It looks like you counted factor <b>pairs</b>. Count every number in the pairs.' };
        if (sq && v === c + 1) return { code: 'square-twice', hint: t(F(n) + '=' + Math.sqrt(n) + '\\times ' + Math.sqrt(n)) + ': the same factor twice only counts once.' };
        return null;
      }),
      solution: 'Factor pairs: ' + t(K.pairsTex(n)) + '. The factors are ' + t(plist(n)) + ', so ' + t(F(n)) + ' has <b>' + c + '</b> factors.',
      hints: ['List the factor pairs of ' + t(F(n)) + ' first, then count every number you wrote.', 'Don’t forget ' + t('1') + ' and ' + t(F(n)) + ' itself.'] };
  }
  function classifyPart(n, strongHint) {
    var prime = nt.isPrime(n), sp = nt.smallestPrimeFactor(n), tests = primesToTest(n);
    return { prompt: t(F(n)), input: { type: 'classify', n: n }, key: prime ? { choice: 'prime' } : { choice: 'composite', a: String(sp), b: String(n / sp) },
      answer: prime ? 'Prime' : 'Composite: ' + t(F(n) + '=' + sp + '\\times ' + F(n / sp)), text: 'prime or composite: ' + n,
      check: function (resp) {
        if (!resp || !resp.choice) return form('nochoice', 'Choose <b>Prime</b> or <b>Composite</b>.');
        if (resp.choice === 'prime') {
          if (prime) return ok();
          return wrong('said-prime', t(F(n)) + ' has a factor other than ' + t('1') + ' and itself. Test the primes ' + t('2, 3, 5, 7, \\ldots') + ' in order' + (strongHint ? ' — try ' + t(sp) + '.' : '.'));
        }
        if (prime) return wrong('said-composite', 'Which factor pair did you find? Check it on your calculator. To be sure, test every prime up to ' + t(sqrtNote(n)) + ': ' + t(tests.join(', ')) + '. If none divides evenly, the number is prime.');
        var a = Number(String(resp.a).replace(/\s/g, '')), b = Number(String(resp.b).replace(/\s/g, ''));
        if (!resp.a || !resp.b || !isFinite(a) || !isFinite(b)) return form('noproof', 'Right — now prove it: fill in a factor pair for ' + t(F(n)) + '.');
        if (a === 1 || b === 1) return form('proof-1', 'Every number has the pair ' + t('1\\times ' + F(n)) + '. To show ' + t(F(n)) + ' is composite, find a pair where neither number is ' + t('1') + '.');
        if (a * b !== n) return wrong('proof-wrong', t(a + '\\times ' + b + '=' + F(a * b)) + ', not ' + t(F(n)) + '. Find two numbers (neither one 1) that multiply to ' + t(F(n)) + '.');
        return ok();
      },
      solution: prime ? 'Test the primes up to ' + t(sqrtNote(n)) + ': ' + t(tests.join(', ')) + '. None divides ' + t(F(n)) + ' evenly, so ' + t(F(n)) + ' is <b>prime</b>.'
        : t(F(n) + '\\div ' + sp + '=' + F(n / sp)) + ', so ' + t(F(n) + '=' + sp + '\\times ' + F(n / sp)) + '. It has more than two factors, so it is <b>composite</b>.',
      hints: ['A prime has exactly two factors. Test the primes up to ' + t(sqrtNote(n)) + '.', prime ? 'None of ' + t(tests.join(', ')) + ' divides it evenly.' : 'Try dividing by ' + t(sp) + '.'] };
  }
  function primeFactorsPart(n) {
    var want = nt.distinctPrimes(n);
    return { prompt: t(F(n)), input: { type: 'list' }, check: K.primeFactorList(n), key: want, answer: t(K.listTex(want)), text: 'prime factors of ' + n,
      solution: t(F(n) + '=' + K.fac(n)) + ', so the prime factors of ' + t(F(n)) + ' are ' + t(K.listTex(want)) + '.',
      hints: ['Divide ' + t(F(n)) + ' by the smallest prime that fits, then repeat with what is left.', 'Only list primes, and list each one once.'] };
  }
  function productPart(n, exp, how) {
    return { prompt: t(F(n)), input: { type: 'math', before: t(F(n) + '=') }, check: K.product(n, exp || 'either'), key: K.fac(n),
      answer: t(F(n) + '=' + K.fac(n)), text: (how || 'product of primes') + ': ' + n,
      solution: 'Divide by the smallest prime each time:' + K.ladderSolution(n) + t(F(n) + '=' + K.exp(n) + '=' + K.fac(n)),
      hints: ['Start with the smallest prime that divides ' + t(F(n)) + ' and keep dividing until you reach ' + t('1') + '.', 'Check: multiply your primes back together on your calculator — do you get ' + t(F(n)) + '?'] };
  }
  function ladderPart(n, exp) {
    var p = productPart(n, exp, 'division ladder');
    p.input = { type: 'ladder', n: n, exponent: exp === 'required' };
    p.check = (function (c) { return function (resp) { if (!resp || !resp.done) return form('unfinished', 'Finish the ladder first: keep dividing until the quotient is ' + t('1') + '.'); return c(resp.final); }; })(K.product(n, exp || 'either'));
    p.key = { done: true, final: K.fac(n) };
    p.hints = ['Read the primes down the left side of your ladder — those are the prime factors.', 'Check: multiply your primes back together — do you get ' + t(F(n)) + '?'];
    return p;
  }
  function treePart(n, exp) {
    var p = ladderPart(n, exp); p.text = 'factor tree: ' + n;
    p.input = { type: 'tree', n: n, exponent: exp === 'required' };
    p.check = (function (c) { return function (resp) { if (!resp || !resp.done) return form('unfinished', 'Finish the tree first: every branch must end in a circled prime.'); return c(resp.final); }; })(K.product(n, exp || 'either'));
    p.solution = 'One possible tree: split ' + t(F(n)) + ' into any factor pair and keep branching until every branch ends in a prime. The circled primes are ' + t(K.exp(n)) + ', so ' + t(F(n) + '=' + K.fac(n)) + '. (Any starting pair gives the same primes.)';
    p.hints = ['Collect every circled prime from the ends of the branches.', 'Check: multiply your primes back together — do you get ' + t(F(n)) + '?'];
    return p;
  }
  function nrPart(prompt, ans, diag, sol, hints, text) {
    return { prompt: prompt, input: { type: 'number', nr: true }, check: K.number(ans, diag, { nr: true }), key: String(ans), answer: t(ans), solution: sol, hints: hints, text: text };
  }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) {
    var m = K.mc(r, opts, keepOrder);
    return { prompt: prompt, input: { type: 'mc', options: m.options }, check: m.check, key: m.answerKey, answer: HW.tex(m.answerHtml), solution: sol, hints: hints, text: text, tries: 2 };
  }
  function prodOf(arr) { return arr.reduce(function (m, x) { return m * x; }, 1); }
  function pickDistinct(r, pool, k, lo, hi) { // k distinct from pool with product in [lo, hi]
    for (var tries = 0; tries < 400; tries++) { var s = r.sample(pool, k).sort(function (a, b) { return a - b; }), v = prodOf(s); if (v >= lo && v <= hi) return s; }
    return null;
  }

  HW.defineLesson({
    id: 'u1l1', unit: 1, num: '1', title: 'Prime Building Blocks of Numbers', outcome: 'AN1',
    blurb: 'Factors, primes and composites, then two organized ways to take a number apart — the division ladder and the factor tree.',
    questions: [
      { num: '1', section: 'Part A — Factors, Primes and Composites', stem: 'State the factors of the following.', parts: [
        { id: '1a', level: 'LIM', make: function (r) { return factorsPart(r.pick(primesIn(11, 47))); } },
        { id: '1b', level: 'BEG', make: function (r) { return factorsPart(2 * r.pick(primesIn(11, 47))); } },
        { id: '1c', level: 'BEG', make: function (r) { return factorsPart(r.pick([45, 63, 75, 99, 117])); } },
        { id: '1d', level: 'EMG', make: function (r) { return factorsPart(r.pick([48, 60, 72, 80, 84, 90, 96])); } }] },
      { num: '2', stem: 'In each case, determine the number of factors of the given whole number.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { return countPart(r.pick([4, 9, 25, 49])); } },
        { id: '2b', level: 'LIM', make: function (r) { return countPart(r.pick(primesIn(11, 31))); } },
        { id: '2c', level: 'BEG', make: function (r) { return countPart(r.pick(primesIn(23, 61))); } },
        { id: '2d', level: 'BEG', make: function (r) { return countPart(r.pick([15, 21, 33, 35, 39, 51, 55, 57, 65, 69, 77, 85, 87, 91, 95])); } },
        { id: '2e', level: 'EMG', make: function (r) { return countPart(r.pick([24, 30, 40, 42, 54, 56, 66, 70, 78, 88])); } }] },
      { num: '3', stem: function (sh) { return 'Here are five whole numbers like the ones in Question 2: ' + t(K.listTex(sh.nums)) + '. Select the numbers which are'; },
        shared: function (r) {
          var a = r.pick([4, 9, 25, 49]), b = r.pick(primesIn(11, 31)), c = r.pick(primesIn(37, 61)), d = r.pick([15, 21, 33, 35, 39, 51, 55, 57, 65, 77, 85, 91]), e = r.pick([24, 30, 40, 42, 54, 56, 66, 70, 78, 88]);
          return { nums: r.shuffle([a, b, c, d, e]) };
        },
        parts: [
          { id: '3a', level: 'BEG', make: function (r, sh) { return selectPart(sh.nums, true); } },
          { id: '3b', level: 'BEG', make: function (r, sh) { return selectPart(sh.nums, false); } }] },
      { num: '4', stem: 'Classify the following whole numbers as prime or composite.', parts: [
        { id: '4a', level: 'LIM', make: function (r) { return classifyPart(2 * r.int(15, 49)); } },
        { id: '4b', level: 'BEG', make: function (r) { return classifyPart(r.pick(primesIn(41, 97))); } },
        { id: '4c', level: 'LIM', make: function (r) { return classifyPart(r.pick([25, 35, 45, 55, 65, 75, 85, 95])); } },
        { id: '4d', level: 'BEG', make: function (r) { return classifyPart(r.pick([35, 39, 51, 55, 57, 65, 85, 95])); } },
        { id: '4e', level: 'BEG', make: function (r) { return classifyPart(r.pick(primesIn(53, 113))); } },
        { id: '4f', level: 'EMG', make: function (r) { return classifyPart(3 * r.pick([17, 19, 23, 29, 31, 37, 41, 43, 47])); } },
        { id: '4g', level: 'EMG', make: function (r) { return classifyPart(5 * r.pick([17, 19, 23, 29, 31, 37])); } },
        { id: '4h', level: 'PRG', make: function (r) { return classifyPart(r.pick([91, 119, 133, 143, 161, 187, 203, 209, 217, 221, 247, 253]), true); } }] },
      { num: '5', stem: 'Twin primes are consecutive odd numbers that are both prime (for example, ' + t('3') + ' and ' + t('5') + ').', parts: [
        { id: '5', level: 'PRG', make: function (r) { return twinPart(r); } }] },
      { num: '6', section: 'Part B — Prime Factors and Prime Factorization', stem: function (sh) { return 'Answer each part for the number ' + t(F(sh.n)) + '.'; },
        shared: function (r) { return { n: r.pick([12, 18, 20, 28, 44, 45, 50, 52, 63, 68, 75, 76, 92, 98, 99]) }; },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, sh) { var p = factorsPart(sh.n); p.prompt = 'State the factors of ' + t(F(sh.n)) + '.'; return p; } },
          { id: '6b', level: 'BEG', make: function (r, sh) { var p = primeFactorsPart(sh.n); p.prompt = 'State the prime factors of ' + t(F(sh.n)) + '.'; return p; } },
          { id: '6c', level: 'EMG', make: function (r, sh) { var p = productPart(sh.n); p.prompt = 'Express ' + t(F(sh.n)) + ' as a product of prime factors.'; return p; } }] },
      { num: '7', stem: 'State the prime factors of', parts: [
        { id: '7a', level: 'BEG', make: function (r) { return primeFactorsPart(2 * r.pick([11, 13, 17, 19, 23])); } },
        { id: '7b', level: 'BEG', make: function (r) { return primeFactorsPart(r.pick([24, 40, 54, 56, 88, 104])); } },
        { id: '7c', level: 'EMG', make: function (r) { return primeFactorsPart(r.pick([45, 63, 75, 99, 117, 147, 175])); } },
        { id: '7d', level: 'EMG', make: function (r) { return primeFactorsPart(r.pick([60, 84, 90, 126, 132, 140, 156, 198])); } }] },
      { num: '8', stem: 'Explain why the numbers ' + t('0') + ' and ' + t('1') + ' have no prime factors.', parts: [
        { id: '8a', level: 'PRG', make: function (r) {
          return mcPart(r, 'Which statement explains why ' + t('1') + ' has no prime factors?', [
            { html: 'The only factor of ' + t('1') + ' is ' + t('1') + ', and ' + t('1') + ' is not prime.', right: true },
            { html: t('1') + ' is prime, so its only prime factor is itself.', why: 'A prime has <b>exactly two</b> factors. ' + t('1') + ' has only one factor, so it isn’t prime.' },
            { html: t('1') + ' is odd, and prime factors must be even.', why: 'Most primes are odd (' + t('3, 5, 7, \\ldots') + '). Being odd has nothing to do with it.' },
            { html: t('1') + ' has too many factors to list.', why: 'Count them: ' + t('1') + ' has just one factor.' }],
            'A prime has exactly two factors. ' + t('1') + ' has only one factor (' + t('1') + ' itself), so it isn’t prime, and it has no other factors that could be prime.', ['How many factors does ' + t('1') + ' have? How many does a prime need?'], 'why 1 has no prime factors');
        } },
        { id: '8b', level: 'PRG', make: function (r) {
          return mcPart(r, 'Which statement explains why ' + t('0') + ' has no prime factorization?', [
            { html: 'Multiplying primes never gives ' + t('0') + ', so no product of primes equals ' + t('0') + '.', right: true },
            { html: t('0') + ' has no factors at all.', why: 'Actually every whole number divides into ' + t('0') + ' (for example ' + t('0=5\\times 0') + '), so ' + t('0') + ' has <b>infinitely many</b> factors.' },
            { html: t('0') + ' is prime, so it can’t be broken down.', why: 'A prime has exactly two factors. ' + t('0') + ' has infinitely many, so it isn’t prime.' },
            { html: t('0') + ' is smaller than every prime.', why: t('1') + ' is also smaller than every prime, so size alone can’t be the reason. Think about what you get when you multiply primes.' }],
            'Every prime is at least ' + t('2') + ', and a product of numbers that are at least ' + t('2') + ' can never be ' + t('0') + '. So ' + t('0') + ' can’t be written as a product of primes. (It actually has infinitely many factors: ' + t('0=5\\times 0=7\\times 0') + ', …)', ['What do you get when you multiply primes together? Can it ever be ' + t('0') + '?'], 'why 0 has no prime factorization');
        } }] },
      { num: '9', stem: 'Use a division ladder to determine the prime factorization of', parts: [
        { id: '9a', level: 'PRG', make: function (r) { return ladderPart(r.pick([4 * 3, 4 * 5]) * r.pick([7, 11, 13, 17, 19])); } },
        { id: '9b', level: 'PRG', make: function (r) { return ladderPart(r.pick([315, 495, 585, 525, 693, 735, 1155])); } },
        { id: '9c', level: 'ADV', make: function (r) { return ladderPart(prodOf(pickDistinct(r, [7, 11, 13, 17, 19, 23], 3, 1000, 5000))); } },
        { id: '9d', level: 'ADV', make: function (r) { return ladderPart(25 * prodOf(pickDistinct(r, [7, 11, 13, 17, 19], 2, 40, 360))); } }] },
      { num: '10', stem: 'Use a factor tree to determine the prime factorization of the following.', parts: [
        { id: '10a', level: 'PRG', make: function (r) { return treePart(r.pick([8 * 3, 8 * 5]) * r.pick([7, 11, 13, 17])); } },
        { id: '10b', level: 'PRG', make: function (r) { return treePart(25 * r.pick([11, 13, 17, 19, 23])); } },
        { id: '10c', level: 'ADV', make: function (r) { return treePart(prodOf(pickDistinct(r, [11, 13, 17, 19, 23], 3, 1500, 7000))); } },
        { id: '10d', level: 'ADV', make: function (r) { var q = r.pick([7, 11, 13]), p = r.pick([3, 7, 11, 13].filter(function (x) { return x !== q; })); return treePart(10 * p * q * q); } }] },
      { num: '11', stem: 'In each case, write the number as a product of prime factors.', parts: [
        { id: '11a', level: 'EMG', make: function (r) { return productPart(r.pick([175, 245, 147, 275, 363, 325, 117])); } },
        { id: '11b', level: 'PRG', make: function (r) { return productPart(r.pick([847, 1183, 1573, 605, 845, 1859])); } },
        { id: '11c', level: 'ADV', make: function (r) { return productPart(prodOf(pickDistinct(r, [3, 5, 7, 11, 13, 17, 19], 4, 1500, 9000))); } },
        { id: '11d', level: 'ADV', make: function (r) { return productPart(r.pick([5250, 8250, 9750, 3150, 4950, 5850])); } }] },
      { num: '12', section: 'Part C — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var ps = pickDistinct(r, [3, 5, 7, 11, 13, 17, 19], 4, 1000, 20000), n = prodOf(ps);
          var shown = r.sample(ps, 3), out = r.pick(primesIn(7, 23).filter(function (p) { return ps.indexOf(p) < 0; }));
          var opts = shown.concat([out]).sort(function (a, b) { return a - b; }).map(function (v) { return { html: t(v), right: v === out, why: v === out ? null : t(v) + ' does divide ' + t(F(n)) + ': ' + t(F(n) + '\\div ' + v + '=' + F(n / v)) + '. So it <i>is</i> a prime factor.' }; });
          return mcPart(r, 'Which of the following numbers is <b>not</b> a prime factor of ' + t(F(n)) + '?', opts,
            t(F(n) + '=' + K.fac(n)) + '. The prime factors are ' + t(K.listTex(ps)) + ', so ' + t(out) + ' is not one of them.', ['Divide ' + t(F(n)) + ' by each option. A prime factor divides it evenly.'], 'not a prime factor of ' + n, true);
        } }] },
      { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'ADV', make: function (r) {
          var ps = pickDistinct(r, [2, 3, 5, 7, 11, 13], 5, 1000, 20000), n = prodOf(ps), k = r.int(1, 3);
          var inList = r.sample(ps, 4 - k), notIn = r.sample(primesIn(2, 23).filter(function (p) { return ps.indexOf(p) < 0; }), k);
          var list = inList.concat(notIn).sort(function (a, b) { return a - b; });
          var opts = [4, 3, 2, 1].map(function (v) { return { html: t(v), right: v === k, why: v === 4 - k ? 'That’s how many <b>are</b> prime factors of ' + t(F(n)) + '. The question asks how many are <b>not</b>.' : null }; });
          return mcPart(r, 'How many of the numbers in the list ' + t(list.join(',\\ ')) + ' are <b>not</b> prime factors of ' + t(F(n)) + '?', opts,
            t(F(n) + '=' + K.fac(n)) + '. From the list, ' + t(notIn.sort(function (a, b) { return a - b; }).join(',\\ ')) + (k === 1 ? ' is' : ' are') + ' not prime factors, so the answer is ' + t(k) + '.', ['Write ' + t(F(n)) + ' as a product of primes first, then check each number in the list.'], 'how many not prime factors of ' + n, true);
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'ADV', make: function (r) {
          var ps = pickDistinct(r, [2, 3, 5, 7, 11, 13, 17, 19, 23], r.pick([5, 6]), 2000, 99999), n = prodOf(ps), s = nt.sum(ps);
          return nrPart('The sum of all the prime factors of ' + t(F(n)) + ' is ________.', s, function (v) {
            if (v === s + 1) return { code: 'plus1', hint: 'Did you include ' + t('1') + '? It isn’t prime.' };
            for (var i = 0; i < ps.length; i++) if (v === s - ps[i]) return { code: 'missing', hint: 'Your sum is one prime factor short. Make sure you broke ' + t(F(n)) + ' all the way down.' };
            return null;
          }, t(F(n) + '=' + K.fac(n)) + '. Sum: ' + t(ps.join('+') + '=' + s) + '.', ['Find the prime factorization of ' + t(F(n)) + ' first.', 'Add each different prime once.'], 'sum of prime factors of ' + n);
        } }] },
      { num: '15', stem: '<i>(Numerical Response)</i> There is only one set of <i>prime triplets</i>: three consecutive odd numbers which are all prime.', parts: [
        { id: '15', level: 'MAS', make: function (r) {
          var forms = [['abc', function (a, b, c) { return a * b * c; }], ['a+b+c', function (a, b, c) { return a + b + c; }], ['ab+c', function (a, b, c) { return a * b + c; }],
            ['a^{2}+b^{2}+c^{2}', function (a, b, c) { return a * a + b * b + c * c; }], ['bc-a', function (a, b, c) { return b * c - a; }], ['ac+b', function (a, b, c) { return a * c + b; }]];
          var fm = r.pick(forms), ans = fm[1](3, 5, 7);
          return nrPart('If the prime triplets are ' + t('a') + ', ' + t('b') + ' and ' + t('c') + ' (smallest first), then the value of ' + t(fm[0]) + ' is ________.', ans, function (v) {
            if (v === fm[1](5, 7, 9)) return { code: 'triple-579', hint: 'Check ' + t('9') + ': ' + t('9=3\\times 3') + ', so it isn’t prime.' };
            if (v === fm[1](1, 3, 5)) return { code: 'triple-135', hint: t('1') + ' isn’t prime (it has only one factor).' };
            if (v === fm[1](11, 13, 15) || v === fm[1](17, 19, 21) || v === fm[1](29, 31, 33)) return { code: 'triple-other', hint: 'Check the largest number in your triplet — is it really prime?' };
            return null;
          }, 'In any three consecutive odd numbers, one is a multiple of ' + t('3') + '. The only multiple of ' + t('3') + ' that is prime is ' + t('3') + ' itself, so the triplets are ' + t('3, 5, 7') + '. Then ' + t(fm[0] + '=' + ans) + '.',
          ['Try some: ' + t('3, 5, 7') + '? ' + t('5, 7, 9') + '? ' + t('11, 13, 15') + '? Check whether each number is prime.', 'In any three consecutive odd numbers, one is a multiple of ' + t('3') + '. When can that number be prime?'], 'prime triplets ' + fm[0]);
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'MAS', make: function (r) {
          var n, p, q, e;
          for (var i = 0; i < 200; i++) { q = r.pick([5, 7, 11, 13]); e = r.int(2, 4); p = r.pick([2, 3, 5, 7, 11, 13, 17, 19].filter(function (x) { return x !== q; })); n = p * Math.pow(q, e); if (n >= 1000 && n <= 30000) break; }
          var ans = p + q + e;
          return nrPart('The number ' + t(F(n)) + ' can be expressed as a product of prime factors in the form ' + t('p\\times q^{\\,r}') + '. The value of ' + t('p+q+r') + ' is ________.', ans, function (v) {
            if (v === p + q) return { code: 'no-r', hint: 'You found ' + t('p') + ' and ' + t('q') + '. Don’t forget to add the exponent ' + t('r') + '.' };
            if (v === p + Math.pow(q, e)) return { code: 'power', hint: t('r') + ' is the <b>exponent</b> — add the exponent itself, not ' + t('q^{r}') + '.' };
            if (v === q + p + 1 || v === q + p + e + 1) return { code: 'off', hint: 'Count the repeated prime again: how many times does it appear?' };
            return null;
          }, t(F(n) + '=' + K.fac(n)) + ', so ' + t('p=' + p + ',\\ q=' + q + ',\\ r=' + e) + ' and ' + t('p+q+r=' + ans) + '.',
          ['Write ' + t(F(n)) + ' as a product of primes first.', 'One prime appears several times: that is ' + t('q') + ', and the number of times is ' + t('r') + '.'], 'p×q^r for ' + n);
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — Prime factorization of larger numbers', stem: 'Use a <b>division ladder</b> to find the prime factorization of each number. Start at ' + t('2') + ' and work up through the primes. Write each answer in exponent form.', parts: [
        { id: 'e1a', level: 'ADV', make: function (r) { return ladderPart(r.pick([6468, 9075, 13860, 5544, 7020, 4860, 8820]), 'required'); } },
        { id: 'e1b', level: 'ADV', make: function (r) { return ladderPart(Math.pow(r.pick([11, 13, 17, 19, 23]), 3), 'required'); } }] },
      { num: '2', stem: 'Use a <b>factor tree</b> for each number. Choose a first factor pair you can see quickly — it does not have to involve a prime.', parts: [
        { id: 'e2a', level: 'ADV', make: function (r) { return treePart(r.pick([5184, 2592, 1728, 1296, 7776, 3888]), 'required'); } },
        { id: 'e2b', level: 'MAS', make: function (r) { var p = treePart(Math.pow(r.pick([23, 29]), 3), 'required'); p.hints.unshift('It isn’t even, and its digit sum is not a multiple of ' + t('3') + '. Try the larger primes.'); return p; } }] },
      { num: '3', stem: 'Express each number as a product of prime factors in exponent form.', parts: [
        { id: 'e3a', level: 'ADV', make: function (r) { return productPart(r.pick([10296, 23400, 29095, 15288, 20790, 17160]), 'required'); } },
        { id: 'e3b', level: 'ADV', make: function (r) { return productPart(r.pick([74088, 27000, 9261, 3375, 21952]), 'required'); } }] },
      { num: '4', stem: 'Two students draw factor trees for the same number and start with different factor pairs.', parts: [
        { id: 'e4', level: 'PRG', make: function (r) {
          var n = r.pick([1176, 1260, 2520, 1512]), d = nt.divisors(n).filter(function (x) { return x > 3 && x * x < n; }), a = d[0], b = d[d.length - 1];
          return mcPart(r, 'One tree for ' + t(F(n)) + ' starts with ' + t(a + '\\times ' + F(n / a)) + ', the other with ' + t(b + '\\times ' + F(n / b)) + '. What will they find?', [
            { html: 'The same primes, ' + t(K.fac(n)) + ': every composite number has exactly one prime factorization.', right: true },
            { html: 'Different primes, so only the tree that starts with the smallest factor is correct.', why: 'Try it: finish both trees. The starting pair changes the shape of the tree, not the primes at the ends.' },
            { html: 'The tree with the larger starting factor ends with more primes.', why: 'Both trees end with the same primes. The number of primes (counting repeats) is fixed for ' + t(F(n)) + '.' },
            { html: 'Different primes, but they multiply to the same number.', why: 'Every composite number has just one set of prime factors, so the primes themselves must match.' }],
            'Both trees end at ' + t(F(n) + '=' + K.fac(n)) + '. A number’s prime factorization is unique: whatever pair you start with, you keep splitting until only those primes are left.', ['Finish one of the trees in your head. Would the other tree be allowed to end with different primes?'], 'unique factorization ' + n);
        } }] },
      { num: '5', section: 'Extra practice B — Counting factors from the prime factorization', stem: 'Look for a connection between the exponents in the prime factorization and the number of factors.', parts: [
        { id: 'e5', level: 'ADV', make: function (r) {
          return mcPart(r, 'If a whole number has prime factorization ' + t('n=2^{a}\\times 3^{b}\\times 5^{c}') + ', how many factors does ' + t('n') + ' have?', [
            { html: t('(a+1)(b+1)(c+1)'), right: true },
            { html: t('a\\times b\\times c'), why: 'Test it on ' + t('12=2^{2}\\times 3^{1}') + ' (no 5s, so ' + t('c=0') + '): ' + t('12') + ' has six factors. Does your rule give 6?' },
            { html: t('a+b+c'), why: 'Test it on ' + t('12=2^{2}\\times 3') + ': ' + t('12') + ' has six factors (' + t('1,2,3,4,6,12') + '). Does ' + t('a+b+c') + ' give 6?' },
            { html: t('a+b+c+1'), why: 'Test it on ' + t('12=2^{2}\\times 3') + ': ' + t('12') + ' has six factors. Does your rule give 6?' }],
            'A factor of ' + t('n') + ' uses between ' + t('0') + ' and ' + t('a') + ' twos (' + t('a+1') + ' choices), between ' + t('0') + ' and ' + t('b') + ' threes (' + t('b+1') + ' choices) and between ' + t('0') + ' and ' + t('c') + ' fives (' + t('c+1') + ' choices). So there are ' + t('(a+1)(b+1)(c+1)') + ' factors.',
            ['Test each rule on a number you know, like ' + t('12=2^{2}\\times 3') + ', which has six factors.'], 'factor-count rule');
        } }] },
      { num: '6', stem: 'Use the rule ' + t('(a+1)(b+1)(c+1)\\ldots') + ' to state how many factors each number has. Find the prime factorization first; do not list the factors.', parts: [
        { id: 'e6a', level: 'ADV', make: function (r) { return ruleCount(r, r.pick([720, 1176, 1800, 1512, 2700, 3600])); } },
        { id: 'e6b', level: 'ADV', make: function (r) { return ruleCount(r, r.pick([9261, 16000, 3375, 21952, 10648])); } }] },
      { num: '7', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e7', level: 'ADV', make: function (r) {
          var es = [r.int(3, 6), r.int(2, 4), r.int(1, 2), 1], ans = es.reduce(function (m, e) { return m * (e + 1); }, 1);
          var tex = '2^{' + es[0] + '}\\times 3^{' + es[1] + '}\\times 5' + (es[2] > 1 ? '^{' + es[2] + '}' : '') + '\\times 7';
          return nrPart('The number of factors of ' + t(tex) + ' is ________. (Don’t multiply it out.)', ans, function (v) {
            if (v === es.reduce(function (m, e) { return m * e; }, 1)) return { code: 'no-plus1', hint: 'Each exponent gives one <b>more</b> choice than its value (you can also use zero of that prime). Use ' + t('(a+1)(b+1)\\ldots') + '.' };
            if (v === es.reduce(function (m, e) { return m + e + 1; }, 0)) return { code: 'added', hint: 'The choices for each prime are <b>multiplied</b>, not added.' };
            if (v === ans / 2) return { code: 'seven', hint: 'Don’t forget the ' + t('7') + ': it has exponent ' + t('1') + ', which gives ' + t('1+1=2') + ' choices.' };
            return null;
          }, t('(' + es.map(function (e) { return e + '+1'; }).join(')(') + ')=' + es.map(function (e) { return e + 1; }).join('\\times ') + '=' + ans), ['Add 1 to each exponent, then multiply.'], 'factor count from exponents');
        } }] },
      { num: '8', stem: 'A bigger number doesn’t always have more factors.', parts: [
        { id: 'e8', level: 'PRG', make: function (r) {
          var a = r.pick([256, 512, 1024]), b = r.pick([180, 360, 420, 210]), ca = nt.numDivisors(a), cb = nt.numDivisors(b);
          return mcPart(r, 'Which number has more factors: ' + t(F(a) + '=2^{' + Math.log2(a) + '}') + ' or ' + t(F(b) + '=' + K.fac(b)) + '?', [
            { html: t(F(b)) + ', with ' + t(cb) + ' factors', right: cb > ca, why: cb > ca ? null : 'Count again with the rule ' + t('(a+1)(b+1)\\ldots') + '.' },
            { html: t(F(a)) + ', with ' + t(ca) + ' factors', right: ca > cb, why: ca > cb ? null : 'Use the rule: ' + t('2^{' + Math.log2(a) + '}') + ' has only ' + t(Math.log2(a) + '+1=' + ca) + ' factors. Being bigger doesn’t give more factors.' },
            { html: 'They have the same number of factors', why: 'Work out both counts with ' + t('(a+1)(b+1)\\ldots') + '.' }],
            t(F(a)) + ': ' + t(Math.log2(a) + '+1=' + ca) + ' factors. ' + t(F(b)) + ': ' + t(nt.factor(b).map(function (pe) { return '(' + pe[1] + '+1)'; }).join('') + '=' + cb) + ' factors. Several small primes give many more choices than one prime with a big exponent.',
            ['Use the factor-count rule on each number.'], 'more factors ' + a + ' vs ' + b);
        } }] },
      { num: '9', section: 'Extra practice C — Working backwards from the factor count', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e9a', level: 'MAS', make: function (r) { return smallestWith(r.pick([6, 8, 10, 9])); } },
        { id: 'e9b', level: 'MAS', make: function (r) { return smallestWith(r.pick([12, 16, 18, 20])); } }] },
      { num: '10', stem: 'A number with exactly ' + t('3') + ' factors is unusual.', parts: [
        { id: 'e10', level: 'ADV', make: function (r) {
          var lim = r.pick([100, 150, 200]), want = [2, 3, 5, 7, 11, 13].map(function (p) { return p * p; }).filter(function (v) { return v < lim; });
          return { prompt: 'Find every whole number less than ' + t(lim) + ' that has exactly ' + t('3') + ' factors.', input: { type: 'list' }, key: want, answer: t(K.listTex(want)), text: 'numbers < ' + lim + ' with 3 factors',
            check: function (resp) {
              if (!resp || !resp.length) return form('empty', 'Add the numbers one at a time.');
              var bad = resp.filter(function (x) { return nt.numDivisors(x) !== 3 || x >= lim; });
              if (bad.length) { var b = bad[0]; return wrong('not3', b >= lim ? t(b) + ' isn’t less than ' + t(lim) + '.' : t(b) + ' has ' + nt.numDivisors(b) + ' factors (' + t(K.listTex(nt.divisors(b))) + '), not 3.'); }
              var miss = want.filter(function (x) { return resp.indexOf(x) < 0; });
              if (miss.length) return wrong('missing', 'You’re missing ' + miss.length + '. Every one of these numbers is the <b>square of a prime</b> — check them all up to ' + t(lim) + '.');
              return ok();
            },
            solution: 'A number with exactly 3 factors must be the square of a prime (' + t('3=2+1') + ', so the factorization is ' + t('p^{2}') + ' and the factors are ' + t('1, p, p^{2}') + '). Below ' + t(lim) + ': ' + t(K.listTex(want)) + '.',
            hints: ['Try ' + t('4') + ' (factors ' + t('1,2,4') + ') and ' + t('9') + ' (factors ' + t('1,3,9') + '). What do they have in common?', 'They are all squares of primes.'] };
        } }] },
      { num: '11', stem: 'Can a whole number have an odd number of factors?', parts: [
        { id: 'e11', level: 'ADV', make: function (r) {
          var lim = r.pick([20, 30, 50]), want = []; for (var i = 1; i * i <= lim; i++) want.push(i * i);
          return { prompt: 'List every whole number from ' + t('1') + ' to ' + t(lim) + ' that has an <b>odd</b> number of factors.', input: { type: 'list' }, key: want, answer: t(K.listTex(want)), text: 'odd factor count up to ' + lim,
            check: function (resp) {
              if (!resp || !resp.length) return form('empty', 'Add the numbers one at a time.');
              var bad = resp.filter(function (x) { return nt.numDivisors(x) % 2 === 0 || x > lim || x < 1; });
              if (bad.length) return wrong('even-count', t(bad[0]) + ' has ' + nt.numDivisors(bad[0]) + ' factors (' + t(K.listTex(nt.divisors(bad[0]))) + '), which is even.');
              var miss = want.filter(function (x) { return resp.indexOf(x) < 0; });
              if (miss.length) return wrong('missing', 'You’re missing ' + miss.length + '. Factors come in pairs — when could a pair be the same number twice?' + (miss.indexOf(1) >= 0 ? ' (Don’t forget ' + t('1') + '.)' : ''));
              return ok();
            },
            solution: 'Factors pair up, so the count is usually even. A pair can only use the same number twice when the number is a <b>perfect square</b> (' + t('16=4\\times 4') + '). So the numbers are the perfect squares: ' + t(K.listTex(want)) + '.',
            hints: ['Count the factors of ' + t('1') + ' to ' + t('10') + ' and look for a pattern.', 'Think about factor pairs like ' + t('4\\times 4') + '.'] };
        } }] },
      { num: '12', section: 'Extra practice D — Testing a number for primality', stem: 'Decide whether each number is prime or composite. You only need to test the primes up to its square root.', parts: [
        { id: 'e12a', level: 'ADV', make: function (r) { return classifyPart(r.pick([397, 409, 419, 431, 433, 439, 443])); } },
        { id: 'e12b', level: 'ADV', make: function (r) { return classifyPart(r.pick([551, 1147, 2209, 667, 899, 1763, 1517]), true); } }] },
      { num: '13', stem: 'Error analysis.', parts: [
        { id: 'e13', level: 'ADV', make: function (r) {
          var pq = r.pick([[23, 29], [29, 31], [31, 37], [23, 31]]), n = pq[0] * pq[1], before = primesIn(2, pq[0] - 1);
          return mcPart(r, 'Kai tested ' + t(F(n)) + ' by dividing it by ' + t(before.join(', ')) + '. None divided evenly, so he concluded that ' + t(F(n)) + ' is prime. What is his error?', [
            { html: 'He stopped too soon: he had to test every prime up to ' + t(sqrtNote(n)) + ', and ' + t(pq[0]) + ' divides it.', right: true },
            { html: 'He should have tested every whole number, not just the primes.', why: 'Testing primes is enough: if a composite number like ' + t('6') + ' divided it, so would its prime factors ' + t('2') + ' and ' + t('3') + '.' },
            { html: 'There is no error: ' + t(F(n)) + ' is prime.', why: 'Try dividing ' + t(F(n)) + ' by the next prime after ' + t(before[before.length - 1]) + '.' },
            { html: 'He should have stopped at ' + t('13') + ', because the primes after that are too big.', why: 'You have to test every prime up to the square root, ' + t(sqrtNote(n)) + '.' }],
            t(sqrtNote(n)) + ', so Kai had to test every prime up to ' + t(Math.floor(Math.sqrt(n))) + '. He missed ' + t(pq[0]) + ': ' + t(F(n) + '=' + pq[0] + '\\times ' + pq[1]) + ', so it is composite.', ['What is ' + t('\\sqrt{' + F(n) + '}') + '? Which primes did Kai skip?'], 'primality test error ' + n);
        } }] },
      { num: '14', section: 'Extra practice E — Error analysis', stem: function (sh) { return 'A student drew a factor tree for ' + t(F(sh.n)) + ' and wrote ' + t(F(sh.n) + '=2^{2}\\times 3\\times ' + F(sh.m)) + '. Every step is arithmetically correct, but the answer is wrong.'; },
        shared: function (r) { var m = r.pick([693, 1155, 1365, 819, 1001]); return { m: m, n: 12 * m }; },
        parts: [
          { id: 'e14a', level: 'PRG', make: function (r, sh) {
            return mcPart(r, 'What is the error?', [
              { html: t(F(sh.m)) + ' isn’t prime, so the tree isn’t finished.', right: true },
              { html: t('12') + ' should have been split into ' + t('2\\times 6') + ' instead of ' + t('4\\times 3') + '.', why: 'Any factor pair is allowed — every starting split ends at the same primes.' },
              { html: 'The answer should use ' + t('+') + ', not ' + t('\\times') + '.', why: 'A prime factorization is a <b>product</b> of primes.' },
              { html: t('2^{2}') + ' should be written as ' + t('4') + '.', why: t('4') + ' isn’t prime; ' + t('2^{2}') + ' is the right way to write it.' }],
              t(F(sh.m) + '=' + K.fac(sh.m)) + ' isn’t prime. The rule: keep branching until <b>every</b> branch ends in a prime.', ['Check each number at the end of the branches: is it prime?'], 'error analysis tree ' + sh.n);
          } },
          { id: 'e14b', level: 'ADV', make: function (r, sh) { var p = treePart(sh.n, 'required'); p.prompt = 'Finish the job: draw a factor tree for ' + t(F(sh.n)) + ' and write its prime factorization in exponent form.'; return p; } },
          { id: 'e14c', level: 'ADV', make: function (r, sh) { return ruleCount(r, sh.n); } }] },
      { num: '15', stem: 'Another student argues: “' + t('1') + ' divides into every number, so ' + t('1') + ' is a prime factor of every number. That makes ' + t('1') + ' prime.”', parts: [
        { id: 'e15', level: 'MAS', make: function (r) {
          return mcPart(r, 'If ' + t('1') + ' were counted as prime, what would go wrong with prime factorizations?', [
            { html: 'They would no longer be unique: ' + t('12=2^{2}\\times 3=1\\times 2^{2}\\times 3=1^{5}\\times 2^{2}\\times 3') + ', and so on forever.', right: true },
            { html: 'Nothing would change, because multiplying by ' + t('1') + ' changes nothing.', why: 'That’s exactly the problem: since multiplying by ' + t('1') + ' changes nothing, you could add as many 1s as you like — so a number would have endless different “prime factorizations”.' },
            { html: 'Every number would become prime.', why: 'Composite numbers would still have other factors. Think about what happens to the <i>uniqueness</i> of a factorization.' },
            { html: 'Factor trees would have to start with ' + t('1') + '.', why: 'Think about what happens to the uniqueness of a factorization if you could include ' + t('1') + ' any number of times.' }],
            'A prime has exactly two factors, and ' + t('1') + ' has only one. If ' + t('1') + ' counted as prime, ' + t('12') + ' could be written as ' + t('2^{2}\\times 3') + ', ' + t('1\\times 2^{2}\\times 3') + ', ' + t('1^{2}\\times 2^{2}\\times 3') + ', … — factorizations would no longer be unique.', ['Write ' + t('12') + ' as a product of primes, then try including some 1s.'], 'why 1 is not prime');
        } }] },
      { num: '16', section: 'Extra practice F — Stretch', stem: 'Recall that ' + t('n!') + ' means ' + t('n\\times(n-1)\\times\\cdots\\times 2\\times 1') + '.', parts: [
        { id: 'e16', level: 'MAS', make: function (r) {
          var m = r.pick([8, 9, 10, 12]), v = 1; for (var i = 2; i <= m; i++) v *= i;
          var p = productPart(v, 'required', m + '!'); p.prompt = 'Write ' + t(m + '!=' + F(v)) + ' as a product of primes in exponent form. (Tip: break each of ' + t('2, 3, \\ldots, ' + m) + ' into primes and collect them.)';
          p.input.before = t(m + '!='); p.solution = 'Break each factor into primes: ' + t([] .concat.apply([], (function () { var a = []; for (var j = 2; j <= m; j++) a.push(j === nt.primeList(j)[0] ? String(j) : '(' + nt.primeList(j).join('\\cdot ') + ')'); return a; })()).join('\\times ')) + '. Collect them: ' + t(m + '!=' + K.fac(v)) + '.';
          return p;
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e17', level: 'ADV', make: function (r) {
          var ps = null, n = 0;
          for (var i = 0; i < 300; i++) { ps = r.sample([3, 5, 7, 11, 13], 3).concat([r.pick([23, 29, 31, 37, 41, 43])]); n = prodOf(ps); if (n <= 99999 && n >= 10000) break; }
          var big = Math.max.apply(null, ps);
          return nrPart('The largest prime factor of ' + t(F(n)) + ' is ________.', big, function (v) {
            if (n % v === 0 && !nt.isPrime(v)) return { code: 'composite', hint: t(F(v)) + ' divides ' + t(F(n)) + ', but it isn’t prime. Break it down.' };
            if (n % v === 0 && nt.isPrime(v) && v < big) return { code: 'not-largest', hint: t(v) + ' is a prime factor, but not the largest one. Keep dividing.' };
            return null;
          }, 'Remove the small primes first: ' + t(F(n) + '=' + K.fac(n)) + '. The largest prime factor is ' + t(big) + '.', ['Divide out the small primes one at a time. What is left at the end?'], 'largest prime factor of ' + n);
        } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e18', level: 'ADV', make: function (r) {
          var cands = [[[2, 3], [3, 3]], [[2, 5], [3, 1]], [[2, 1], [3, 1], [5, 1], [7, 1]], [[2, 2], [3, 2], [5, 1]], [[2, 4], [3, 2]], [[2, 6], [3, 1]], [[2, 2], [3, 1], [5, 1], [7, 1]], [[2, 3], [3, 2], [5, 1]]];
          var pick, counts;
          for (var i = 0; i < 200; i++) { pick = r.sample(cands, 4); counts = pick.map(function (f) { return f.reduce(function (m, pe) { return m * (pe[1] + 1); }, 1); }); var mx = Math.max.apply(null, counts); if (counts.filter(function (c) { return c === mx; }).length === 1) break; }
          var max = Math.max.apply(null, counts);
          var opts = pick.map(function (f, j) { return { html: t(HW.texFactors(f)), right: counts[j] === max, why: counts[j] === max ? null : 'Count with the rule: ' + t(f.map(function (pe) { return '(' + pe[1] + '+1)'; }).join('') + '=' + counts[j]) + '. Is that the greatest?' }; });
          return mcPart(r, 'Which number has the <b>greatest</b> number of factors?', opts,
            pick.map(function (f, j) { return t(HW.texFactors(f)) + ': ' + t(counts[j]) + ' factors'; }).join('<br>'), ['Use ' + t('(a+1)(b+1)\\ldots') + ' on each option.'], 'greatest number of factors');
        } }] }
    ]
  });

  /* ---------- part makers that need the helpers above ---------- */
  function selectPart(nums, primes) {
    var want = nums.filter(function (x) { return nt.isPrime(x) === primes; });
    return { prompt: '<b>' + (primes ? 'prime' : 'composite') + '</b>', input: { type: 'select', options: nums }, key: want, answer: t(K.listTex(want)), text: (primes ? 'primes' : 'composites') + ' among ' + nums.join(','),
      check: K.selectSet(want, function (extra, missing) {
        if (extra.length) { var x = extra[0]; return primes ? { code: 'picked-composite', hint: t(x) + ' has more than two factors (' + t(K.listTex(nt.divisors(x))) + '), so it isn’t prime.' } : { code: 'picked-prime', hint: t(x) + ' has exactly two factors (' + t('1') + ' and ' + t(x) + '), so it is prime, not composite.' }; }
        return { code: 'missed', hint: 'You missed ' + (missing.length === 1 ? 'one' : missing.length) + '. Check the number of factors of each number again.' };
      }),
      solution: nums.map(function (x) { return t(x) + ': ' + nt.numDivisors(x) + ' factors (' + (nt.isPrime(x) ? 'prime' : 'composite') + ')'; }).join('<br>'),
      hints: ['A prime has exactly two factors; a composite has more than two.'] };
  }
  function twinPart(r) {
    var V = [
      { q: 'List the five other twin prime pairs less than ' + t('50') + '.', lo: 4, hi: 49, pairs: [[5, 7], [11, 13], [17, 19], [29, 31], [41, 43]], skip35: true },
      { q: 'List all the twin prime pairs between ' + t('50') + ' and ' + t('110') + '.', lo: 50, hi: 110, pairs: [[59, 61], [71, 73], [101, 103], [107, 109]] },
      { q: 'List all the twin prime pairs between ' + t('40') + ' and ' + t('80') + '.', lo: 40, hi: 80, pairs: [[41, 43], [59, 61], [71, 73]] },
      { q: 'List all the twin prime pairs between ' + t('100') + ' and ' + t('160') + '.', lo: 100, hi: 160, pairs: [[101, 103], [107, 109], [137, 139], [149, 151]] }];
    var v = r.pick(V), want = v.pairs, key = want.map(function (p) { return [String(p[0]), String(p[1])]; });
    return { prompt: v.q, input: { type: 'pairs', start: 1 }, key: key, answer: want.map(function (p) { return t(p[0] + '\\ \\&\\ ' + p[1]); }).join('; '), text: v.q.replace(/\\\(|\\\)/g, ''),
      check: function (resp) {
        if (!resp || !resp.length) return form('empty', 'Write your first pair in the boxes.');
        var got = [];
        for (var i = 0; i < resp.length; i++) {
          var a = Number(resp[i][0]), b = Number(resp[i][1]);
          if (resp[i][0] === '' || resp[i][1] === '' || !isFinite(a) || !isFinite(b)) return form('blank', 'Each pair needs two numbers.');
          if (a > b) { var tmp = a; a = b; b = tmp; }
          got.push([a, b]);
        }
        var keys = got.map(function (p) { return p[0] + ',' + p[1]; });
        for (i = 0; i < keys.length; i++) if (keys.indexOf(keys[i]) !== i) return form('dup', 'You listed ' + t('(' + keys[i] + ')') + ' twice.');
        for (i = 0; i < got.length; i++) {
          var p = got[i];
          if (v.skip35 && p[0] === 3 && p[1] === 5) return form('three-five', t('3') + ' and ' + t('5') + ' are the example — the question asks for the <b>other</b> pairs.');
          if (p[1] - p[0] !== 2) return wrong('not-consecutive', t(p[0]) + ' and ' + t(p[1]) + ' aren’t consecutive odd numbers. Twin primes differ by exactly ' + t('2') + '.');
          var np = [p[0], p[1]].filter(function (x) { return !nt.isPrime(x); })[0];
          if (np != null) return wrong('not-prime', t(np) + ' isn’t prime: ' + t(np + '=' + nt.smallestPrimeFactor(np) + '\\times ' + np / nt.smallestPrimeFactor(np)) + '.');
          if (p[0] < v.lo || p[1] > v.hi) return wrong('range', t(p[0]) + ' and ' + t(p[1]) + ' are twin primes, but they’re outside the range in the question.');
        }
        if (got.length < want.length) return wrong('missing', 'You have ' + got.length + ' of the ' + want.length + ' pairs. List every prime in the range, then look for primes that differ by ' + t('2') + '.');
        return ok();
      },
      solution: 'Primes in the range: ' + t(primesIn(v.lo, v.hi).join(', ')) + '. The ones that differ by 2: ' + want.map(function (p) { return t(p[0] + '\\ \\&\\ ' + p[1]); }).join(', ') + '.',
      hints: ['First list every prime in the range. Then look for two that differ by ' + t('2') + '.', 'Primes bigger than 5 end in 1, 3, 7 or 9 — check pairs ending in 1 & 3, 7 & 9 and 9 & 1.'] };
  }
  function ruleCount(r, n) {
    var c = nt.numDivisors(n), f = nt.factor(n), prodE = f.reduce(function (m, pe) { return m * pe[1]; }, 1);
    return { prompt: t(F(n)), input: { type: 'number' }, key: String(c), answer: t(c), text: 'factor count by rule: ' + n,
      check: K.number(c, function (v) {
        if (v === prodE) return { code: 'no-plus1', hint: 'Add ' + t('1') + ' to each exponent before multiplying (you can use a prime zero times, too).' };
        if (v === f.reduce(function (m, pe) { return m + pe[1] + 1; }, 0)) return { code: 'added', hint: 'Multiply the choices, don’t add them.' };
        return null;
      }),
      solution: t(F(n) + '=' + K.fac(n)) + ', so the number of factors is ' + t(f.map(function (pe) { return '(' + pe[1] + '+1)'; }).join('') + '=' + c) + '.',
      hints: ['Find the prime factorization of ' + t(F(n)) + ' first.', 'Add 1 to each exponent, then multiply.'] };
  }
  function smallestWith(k) {
    var best = 0; for (var n = 1; n < 100000; n++) if (nt.numDivisors(n) === k) { best = n; break; }
    return nrPart('The smallest whole number with exactly ' + t(k) + ' factors is ________.', best, function (v) {
      if (v > 0 && v % 1 === 0 && nt.numDivisors(v) === k) return { code: 'not-smallest', hint: t(F(v)) + ' does have ' + t(k) + ' factors, but there is a smaller one. Give the largest exponent to the smallest prime, and compare all the exponent patterns.' };
      return null;
    }, 'Write ' + t(k) + ' as a product of (exponent ' + t('+1') + ') values, build the smallest number for each pattern (largest exponent on the smallest prime), and compare. The smallest is ' + t(F(best) + '=' + K.fac(best)) + '.',
    ['Each way of writing ' + t(k) + ' as a product, like ' + t(k + '=' + k) + (k % 2 === 0 ? ' or ' + t(k + '=' + (k / 2) + '\\times 2') : '') + ', gives a pattern of exponents (each one less than a factor).', 'Put the biggest exponent on ' + t('2') + ', the next on ' + t('3') + ', and so on.'], 'smallest with ' + k + ' factors');
  }
})(window);
