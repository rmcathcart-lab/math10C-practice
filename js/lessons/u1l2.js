/* Math 10C · Unit 1 · Lesson 2 — Prime Factorization at Work: GCF, LCM, and Perfect Powers (AN1)
 * Assignment questions 1–20 (u1_L02.tex) and the Lesson 2 Extra Practice (u1_EP02.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = K.P;

  /* ---------- number helpers ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var x = a % b; a = b; b = x; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function gcfA(a) { return a.reduce(gcd); }
  function lcmA(a) { return a.reduce(lcm); }
  function prodOf(a) { return a.reduce(function (m, x) { return m * x; }, 1); }
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function expOf(n, p) { var e = 0; while (n > 0 && n % p === 0) { n /= p; e++; } return e; }
  function fromExps(ps, es) { return ps.reduce(function (m, p, i) { return m * Math.pow(p, es[i]); }, 1); }
  function texE(ps, es) { return HW.texFactors(ps.map(function (p, i) { return [p, es[i]]; }).filter(function (pe) { return pe[1] > 0; })); }
  function plainFac(n) { return nt.factor(n).map(function (pe) { return pe[1] > 1 ? pe[0] + '^' + pe[1] : String(pe[0]); }).join(' × '); }
  function eqv(n) { var f = K.fac(n); return f === String(n) ? F(n) : f + '=' + F(n); }
  function find(r, gen, test, fallback) { for (var i = 0; i < 800; i++) { var v = gen(); if (test(v)) return v; } return fallback; }
  function noneDivides(a) { for (var i = 0; i < a.length; i++) for (var j = 0; j < a.length; j++) if (i !== j && a[j] % a[i] === 0) return false; return true; }
  function distinct(a) { return sortN(a).every(function (x, i, s) { return !i || s[i - 1] !== x; }); }
  function intRoot(n, k) { var r = Math.round(Math.pow(n, 1 / k)); for (var d = -1; d <= 1; d++) if (r + d >= 0 && Math.pow(r + d, k) === n) return r + d; return null; }
  function rad(n) { return nt.distinctPrimes(n).reduce(function (m, p) { return m * p; }, 1); }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function nlist(nums) { var s = nums.map(function (n) { return t(F(n)); }); return s.length === 1 ? s[0] : s.length === 2 ? s[0] + ' and ' + s[1] : s.slice(0, -1).join(', ') + ', and ' + s[s.length - 1]; }
  function facEq(n) { return nt.isPrime(n) ? t(F(n)) + ' (prime)' : t(F(n) + '=' + K.fac(n)); }
  function facLines(nums) { return nums.map(facEq).join(', '); }
  function hm(L) { return t(Math.floor(L / 60) + '\\text{ h}' + (L % 60 ? '\\ ' + (L % 60) + '\\text{ min}' : '')); }
  function normX(s) { return String(s == null ? '' : s).replace(/(\d)\s*[xX]\s*(?=\d)/g, '$1*'); }
  function ord(n) { var s = n % 100; return s >= 11 && s <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'; }
  function pw(k) { return k === 2 ? 'square' : 'cube'; }
  function rootTex(k, inner) { return (k === 2 ? '\\sqrt{' : '\\sqrt[3]{') + inner + '}'; }
  function fmtTime(min) { var h = Math.floor(min / 60) % 24, m = min % 60; return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' a.m.' : ' p.m.'); }
  function timeHtml(min) { return min % 1440 === 720 ? '12:00 noon' : fmtTime(min); }

  /* ---------- solutions ---------- */
  function gcfSol(nums) {
    var g = gcfA(nums), sh = nt.factor(g);
    return facLines(nums) + '.<br>Use only the primes in <b>every</b> factorization, each to its <b>lowest</b> power: ' + t(sh.map(function (pe) { return pe[1] > 1 ? pe[0] + '^{' + pe[1] + '}' : String(pe[0]); }).join(',\\ ')) + '.<br>GCF ' + t('=' + eqv(g)) + '.';
  }
  function lcmSol(nums) {
    var L = lcmA(nums), sh = nt.factor(L);
    return facLines(nums) + '.<br>Use <b>every</b> prime that appears, each to its <b>highest</b> power: ' + t(sh.map(function (pe) { return pe[1] > 1 ? pe[0] + '^{' + pe[1] + '}' : String(pe[0]); }).join(',\\ ')) + '.<br>LCM ' + t('=' + eqv(L)) + '.';
  }
  function gcfInspectSol(nums) {
    var s = sortN(nums), m = s[0], g = gcfA(nums), ds = nt.divisors(m).reverse(), shown = [];
    for (var i = 0; i < ds.length; i++) { shown.push(ds[i]); if (ds[i] === g) break; }
    return 'Try the factors of the smallest number, ' + t(F(m)) + ', largest first: ' + t(shown.map(F).join(',\\ ')) + '. The first one that also divides ' + nlist(s.slice(1)) + ' is ' + t(g) + '.<br>GCF ' + t('=' + g) + '. (Check with primes: ' + facLines(nums) + '.)';
  }
  function lcmInspectSol(nums) {
    var s = sortN(nums), M = s[s.length - 1], L = lcmA(nums), k = L / M, ms = [];
    if (k > 8) return lcmSol(nums);
    for (var i = 1; i <= k; i++) ms.push(M * i);
    return 'List the multiples of the largest number, ' + t(F(M)) + ': ' + t(ms.map(F).join(',\\ ')) + '. The first one that ' + nlist(s.slice(0, -1)) + (s.length > 2 ? ' all divide' : ' also divides') + ' into is ' + t(F(L)) + '.<br>LCM ' + t('=' + F(L)) + '.';
  }

  /* ---------- diagnoses for GCF / LCM answers ---------- */
  function gcfHigh(nums) { return nt.factor(gcfA(nums)).reduce(function (m, pe) { return m * Math.pow(pe[0], Math.max.apply(null, nums.map(function (n) { return expOf(n, pe[0]); }))); }, 1); }
  function lcmLow(nums) { return nt.factor(lcmA(nums)).reduce(function (m, pe) { return m * Math.pow(pe[0], Math.min.apply(null, nums.map(function (n) { return expOf(n, pe[0]); }).filter(function (e) { return e > 0; }))); }, 1); }
  function gcfDiag(nums) {
    var g = gcfA(nums), L = lcmA(nums), pr = prodOf(nums), hi = gcfHigh(nums), rep = nt.factor(g).some(function (pe) { return pe[1] > 1; });
    return function (v) {
      if (v === L && L !== g) return { code: 'gcf-lcm', hint: 'That’s the <b>least common multiple</b> — every number divides <b>into</b> it. The GCF goes the other way: it is the largest number that divides into every one of them, so it can’t be bigger than ' + t(F(Math.min.apply(null, nums))) + '.' };
      if (v === pr && pr !== g) return { code: 'gcf-product', hint: 'Multiplying the numbers gives a common <b>multiple</b>, not a common factor. The GCF has to divide into each number.' };
      if (!(v > 0) || v % 1) return null;
      var miss = nums.filter(function (n) { return n % v; });
      if (!miss.length) {
        if (v === 1) return { code: 'gcf-one', hint: 'The numbers do share a factor bigger than ' + t('1') + '. Compare their prime factorizations.' };
        return { code: 'gcf-not-greatest', hint: t(F(v)) + ' divides into every number, but it isn’t the <b>greatest</b> common factor. ' + (nt.isPrime(g / v) ? 'One shared prime factor is missing' : 'Some shared prime factors are missing') + ' — compare the prime factorizations again' + (rep ? ', and watch for a prime that is shared more than once' : '') + '.' };
      }
      if (v === hi && hi !== g) return { code: 'gcf-high-power', hint: 'Right primes, but the GCF takes each shared prime to its <b>lowest</b> power: ' + t(F(v)) + ' doesn’t divide into ' + t(F(miss[0])) + '.' };
      if (v % g === 0 && nt.isPrime(v / g)) {
        var q = v / g;
        if (g % q === 0) return { code: 'gcf-high-power', hint: 'Check the power of ' + t(q) + ': ' + t(F(v)) + ' doesn’t divide into ' + t(F(miss[0])) + '. The GCF takes each shared prime to its <b>lowest</b> power.' };
        return { code: 'gcf-extra-prime', hint: 'Your answer has a factor of ' + t(q) + ', but ' + t(q) + ' isn’t a factor of ' + t(F(miss[0])) + '. Only use primes that appear in <b>every</b> factorization.' };
      }
      return { code: 'gcf-not-common', hint: t(F(v)) + ' doesn’t divide evenly into ' + t(F(miss[0])) + ', so it isn’t a common factor.' };
    };
  }
  function lcmDiag(nums) {
    var g = gcfA(nums), L = lcmA(nums), pr = prodOf(nums), lo = lcmLow(nums), mx = Math.max.apply(null, nums);
    return function (v) {
      if (v === g && g !== L) return { code: 'lcm-gcf', hint: 'That’s the <b>greatest common factor</b>. The LCM is a common <b>multiple</b>: every number must divide into it, so it is at least as big as ' + t(F(mx)) + '.' };
      if (v === pr && pr !== L) return { code: 'lcm-product', hint: 'Multiplying the numbers gives <i>a</i> common multiple, but not the <b>least</b> one: the shared prime factors got counted more than once. Use each prime only once, at its highest power.' };
      if (!(v > 0) || v % 1) return null;
      var miss = nums.filter(function (n) { return v % n; });
      if (!miss.length) return { code: 'lcm-not-least', hint: t(F(v)) + ' is a common multiple, but not the <b>least</b> one. Use each prime only once, at its <b>highest</b> power.' };
      if (v === lo && lo !== L) return { code: 'lcm-low-power', hint: 'Right primes, but the LCM needs each prime to its <b>highest</b> power so that every number divides into it: ' + t(F(miss[0])) + ' doesn’t divide into ' + t(F(v)) + '.' };
      if (L % v === 0 && nt.isPrime(L / v)) {
        var q = L / v;
        if (v % q === 0) return { code: 'lcm-low-power', hint: 'Check the power of ' + t(q) + ': ' + t(F(miss[0])) + ' doesn’t divide into ' + t(F(v)) + '. The LCM takes each prime to its <b>highest</b> power.' };
        return { code: 'lcm-missing-prime', hint: 'A prime is missing: ' + t(F(miss[0])) + ' doesn’t divide into ' + t(F(v)) + '. Every prime that appears in <b>any</b> of the numbers belongs in the LCM.' };
      }
      return { code: 'lcm-not-multiple', hint: t(F(miss[0])) + ' doesn’t divide evenly into ' + t(F(v)) + ', so it isn’t a common multiple.' };
    };
  }

  /* ---------- small checkers (plain-text boxes) ---------- */
  function prodChk(n, exp) { // n as a product of primes, typed in a plain box ("2^3 * 3", "2x2x2x3" also fine)
    var c = K.product(n, exp || 'either');
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s);
      if (pn.ok && pn.value === n && !nt.isPrime(n)) return form('not-factored', 'Write ' + t(F(n)) + ' as a product of primes, like ' + t('2^{3}\\times 3') + '.');
      return c(s);
    };
  }
  function expChk(target, diag) { // a value in exponent form (product of prime powers)
    var c = K.product(target, 'required');
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s);
      if (pn.ok && pn.value === target && !nt.isPrime(target)) return form('as-number', 'Right value — now write it in <b>exponent form</b>, as a product of prime powers.');
      var p = HW.parse.product(s);
      if (p.ok && p.value !== target && diag && p.factors.every(function (pe) { return nt.isPrime(pe[0]); })) { var h = diag(p.value); if (h) return wrong(h.code, h.hint); }
      return c(s);
    };
  }
  function valChk(target, diag) { // a whole number, or any product equal to it
    return function (resp) {
      var s = normX(resp), pn = HW.parse.number(s), v = null;
      if (pn.ok) v = pn.value; else { var p = HW.parse.product(s); if (p.ok) v = p.value; else return form(pn.code === 'empty' ? 'empty' : 'notnumber', pn.code === 'empty' ? 'Type your answer first.' : 'Type a whole number (or a product such as ' + t('2^{2}\\times 3') + ').'); }
      if (v === target) return ok();
      var h = diag ? diag(v) : null;
      return h ? wrong(h.code, h.hint) : wrong('value', null);
    };
  }
  function isNo(s) { return /^(no|none|nope|not|neither|n\/a|n|-+|—|x)(\s.*|\.)?$/.test(s); }
  function isYes(s) { return /^(yes|y|yep)\b/.test(s); }
  /* the k-th root (or "none" when the number isn't a perfect k-th power) */
  function rootOrNone(root, k, nTex, diag) {
    var word = pw(k), vc = root != null ? valChk(root, diag) : null;
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase();
      if (!s) return form('empty', 'Type the ' + word + ' root, or <b>none</b> if it is not a perfect ' + word + '.');
      if (isNo(s)) return root == null ? ok() : wrong('said-not-perfect', 'Look at the exponents in the prime factorization: are they all ' + (k === 2 ? 'even' : 'multiples of ' + t('3')) + '? Then ' + t(nTex) + ' <b>is</b> a perfect ' + word + '.');
      if (isYes(s)) return root != null ? form('yes-root', 'Right, it is a perfect ' + word + ' — now type the ' + word + ' root itself.') : wrong('said-perfect', 'Check the exponents in the prime factorization: are they <b>all</b> ' + (k === 2 ? 'even' : 'multiples of ' + t('3')) + '?');
      if (root == null) {
        var s2 = normX(s), pn = HW.parse.number(s2), pp = HW.parse.product(s2);
        if (!pn.ok && !pp.ok) return form('notnumber', 'Type a number, or <b>none</b>.');
        var v = pn.ok ? pn.value : pp.value, big = Math.pow(v, k);
        return wrong('said-perfect', (v % 1 ? 'A decimal root means the number is <b>not</b> a perfect ' + word + '. ' : (big < 1e12 ? t(F(v) + '^{' + k + '}=' + F(big)) + ', not ' + t(nTex) + '. ' : '')) + 'Look at the exponents in the prime factorization: are they all ' + (k === 2 ? 'even' : 'multiples of ' + t('3')) + '? If not, there is no whole-number ' + word + ' root — type <b>none</b>.');
      }
      return vc(s);
    };
  }
  function yesNoChk(want, yesWhy, noWhy) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase();
      if (!s) return form('empty', 'Type <b>yes</b> or <b>no</b>.');
      var y = isYes(s) || /^(true|it does|holds)/.test(s), n = isNo(s) || /^(false)/.test(s);
      if (y === n) return form('yes-no', 'Type <b>yes</b> or <b>no</b>.');
      return y === want ? ok() : wrong(y ? 'said-yes' : 'said-no', y ? yesWhy : noWhy);
    };
  }
  function toolChk(want) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).toLowerCase();
      if (!s.trim()) return form('empty', 'Write <b>GCF</b> or <b>LCM</b>.');
      var g = /gcf|gcd|hcf|greatest|highest|common factor/.test(s), l = /lcm|least|lowest|common multiple/.test(s);
      if (g === l) return form('tool-unclear', 'Write <b>GCF</b> or <b>LCM</b>.');
      if ((g ? 'gcf' : 'lcm') === want) return ok();
      return wrong('wrong-tool', want === 'gcf' ? 'The pieces have to fit <b>into</b> both lengths with nothing left over — that’s a common <b>factor</b>, and you want the largest one.' : 'The times you want are <b>multiples</b> of both lap times — they come back together at a common <b>multiple</b>, and you want the first one.');
    };
  }
  /* a clock time: "8:12", "8:12 am", "13:30", "noon" */
  function parseTime(s) {
    s = String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
    if (/^(12 ?)?noon$|^12:00 ?noon$/.test(s)) return { h: 12, m: 0, ap: 'p' };
    var m = /^(\d{1,2}) ?[:.h] ?(\d{1,3}) ?(a\.? ?m\.?|p\.? ?m\.?|noon)?$/.exec(s) || /^(\d{1,2})() ?(a\.? ?m\.?|p\.? ?m\.?|o'?clock)$/.exec(s);
    if (!m) return null;
    return { h: Number(m[1]), m: Number(m[2] || 0), ap: m[3] ? (m[3][0] === 'a' ? 'a' : m[3][0] === 'p' || m[3] === 'noon' ? 'p' : null) : null };
  }
  function timeChk(E, start, add, wrongs) { // E = correct time (minutes after midnight); wrongs = [{add, code, hint}]
    return function (resp) {
      var raw = String(resp == null ? '' : resp).trim();
      if (!raw) return form('empty', 'Type the time, like ' + fmtTime(start) + '.');
      var pn = HW.parse.number(raw);
      if (pn.ok && pn.value === add) return form('time-duration', 'That’s how many minutes until it happens. Now add it to the start time (' + fmtTime(start) + ').');
      var p = parseTime(raw);
      if (!p || p.h > 23) return form('time-format', 'Write a clock time, like ' + fmtTime(start) + ' (hours, a colon, then minutes).');
      if (p.m >= 60) return form('time-minutes', 'There are only ' + t('60') + ' minutes in an hour — turn the extra minutes into hours (for example, ' + t('75\\text{ min}=1\\text{ h }15\\text{ min}') + ').');
      var T = (p.h % 12) * 60 + p.m;
      if (T === E % 720) {
        if (p.h > 12) return (p.h * 60 + p.m) % 1440 === E % 1440 ? ok() : wrong('time-ampm', 'Right clock time — but check a.m. or p.m.');
        if (p.ap && (p.ap === 'p') !== (E % 1440 >= 720)) return wrong('time-ampm', 'Right clock time — but check a.m. or p.m.');
        return ok();
      }
      for (var i = 0; i < wrongs.length; i++) if (wrongs[i].add !== add && T === (start + wrongs[i].add) % 720) return wrong(wrongs[i].code, wrongs[i].hint);
      return wrong('value', null);
    };
  }

  /* ---------- reusable part makers ---------- */
  function gcfPart(nums, inspect) {
    var g = gcfA(nums), L = lcmA(nums), pr = prodOf(nums);
    var p = P.number(nlist(nums), g, gcfDiag(nums), inspect ? gcfInspectSol(nums) : gcfSol(nums),
      inspect ? ['List the factors of the smallest number, ' + t(F(Math.min.apply(null, nums))) + ', starting with the largest.', 'The first one that divides evenly into every number is the GCF.']
        : ['Write each number as a product of primes first.', 'The GCF uses only the primes in <b>every</b> factorization, each to its <b>lowest</b> power.'],
      'GCF of ' + nums.join(', '), { before: t('\\text{GCF}=') });
    p.bad = [L, pr].filter(function (x) { return x !== g; }).map(String);
    return p;
  }
  function lcmPart(nums, inspect) {
    var g = gcfA(nums), L = lcmA(nums), pr = prodOf(nums);
    var p = P.number(nlist(nums), L, lcmDiag(nums), inspect ? lcmInspectSol(nums) : lcmSol(nums),
      inspect ? ['List the multiples of the largest number, ' + t(F(Math.max.apply(null, nums))) + '.', 'The first multiple that every other number divides into is the LCM.']
        : ['Write each number as a product of primes first.', 'The LCM uses <b>every</b> prime that appears, each to its <b>highest</b> power.'],
      'LCM of ' + nums.join(', '), { before: t('\\text{LCM}=') });
    p.bad = [g, pr].filter(function (x) { return x !== L; }).map(String);
    return p;
  }
  /* "Use prime factorization": a box for each factorization, then the GCF / LCM */
  function factFieldsPart(nums, kind) {
    var isG = kind === 'gcf', ans = isG ? gcfA(nums) : lcmA(nums), other = isG ? lcmA(nums) : gcfA(nums), lab = isG ? 'GCF' : 'LCM';
    var fields = nums.map(function (n) { return { name: t(F(n)), before: t(F(n) + '='), mode: 'text', wide: true, placeholder: 'e.g. 2^3 × 3' }; }).concat([{ name: lab, before: t('\\text{' + lab + '}=') }]);
    var checks = nums.map(function (n) { return prodChk(n, 'either'); }).concat([K.number(ans, isG ? gcfDiag(nums) : lcmDiag(nums))]);
    var keys = nums.map(plainFac).concat([String(ans)]);
    var p = P.fields(nlist(nums) + ' — write each number as a product of primes, then give the ' + lab + '.', fields, checks, keys,
      nums.map(function (n) { return t(F(n) + '=' + K.fac(n)); }).join('<br>') + '<br>' + lab + ' ' + t('=' + eqv(ans)),
      isG ? gcfSol(nums) : lcmSol(nums),
      ['Divide each number by the smallest prime that fits, again and again, until you reach ' + t('1') + '.', isG ? 'The GCF uses only the primes in <b>every</b> factorization, each to its <b>lowest</b> power.' : 'The LCM uses <b>every</b> prime that appears, each to its <b>highest</b> power.'],
      lab + ' by primes: ' + nums.join(', '));
    p.good = [nums.map(function (n) { return nt.primeList(n).join('x'); }).concat([String(ans)])];
    p.bad = [keys.slice(0, -1).concat([String(other)]), keys.slice(0, -1).concat([String(prodOf(nums))])].filter(function (b) { return b[b.length - 1] !== String(ans); });
    return p;
  }
  function productPart(n, exp) {
    return { prompt: t(F(n)), input: { type: 'math', before: t(F(n) + '=') }, check: K.product(n, exp || 'either'), key: K.fac(n),
      answer: t(F(n) + '=' + K.fac(n)), text: 'product of primes: ' + n,
      solution: 'Divide by the smallest prime each time:' + K.ladderSolution(n) + t(F(n) + '=' + K.exp(n) + '=' + K.fac(n)),
      hints: ['Start with the smallest prime that divides ' + t(F(n)) + ' and keep dividing until you reach ' + t('1') + '.', 'Check: multiply your primes back together on your calculator — do you get ' + t(F(n)) + '?'] };
  }
  /* perfect square / cube test: factorization box + root box ("none" if not perfect) */
  function powerTestPart(n, k) {
    var word = pw(k), root = intRoot(n, k), f = nt.factor(n), rt = rootTex(k, F(n)), test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    var bad = f.filter(function (pe) { return pe[1] % k; })[0];
    var diag = function (v) {
      if (v === n / k) return { code: 'divided-by-index', hint: 'A ' + word + ' root isn’t ' + (k === 2 ? 'half' : 'a third') + ' of the number. Split the prime factors into ' + (k === 2 ? 'two' : 'three') + ' identical groups and multiply one group.' };
      if (v === rad(n) && v !== root) return { code: 'each-prime-once', hint: 'You used each prime once. Divide each <b>exponent</b> by ' + t(k) + ' instead — a prime with a bigger exponent appears more than once in the root.' };
      if (k === 3 && v === intRoot(n, 2)) return { code: 'used-square-root', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by ' + t('3') + '.' };
      if (k === 2 && v === intRoot(n, 3)) return { code: 'used-cube-root', hint: 'That’s the <b>cube</b> root. For the square root, divide each exponent by ' + t('2') + '.' };
      if (v > 0 && v % 1 === 0 && Math.pow(v, k) < 1e12) return { code: 'root-value', hint: t(F(v) + '^{' + k + '}=' + F(Math.pow(v, k))) + ', not ' + t(F(n)) + '. Divide each exponent in the prime factorization by ' + t(k) + '.' };
      return null;
    };
    var fields = [{ name: 'Prime factorization', before: t(F(n) + '='), mode: 'text', wide: true, placeholder: 'e.g. 2^2 × 3^4' },
      { name: word === 'square' ? 'Square root' : 'Cube root', before: t(rt + '='), mode: 'text', placeholder: 'number, or none' }];
    var keys = [plainFac(n), root != null ? String(root) : 'none'];
    var sol = t(F(n) + '=' + K.fac(n)) + '.<br>' + (root != null
      ? 'Every exponent is ' + test + ', so the factors split into ' + (k === 2 ? 'two' : 'three') + ' identical groups: ' + t(F(n)) + ' <b>is</b> a perfect ' + word + '.<br>' + (k === 2 ? 'Halve' : 'Divide') + ' each exponent' + (k === 3 ? ' by ' + t('3') : '') + ': ' + t(rt + '=' + (function (rf) { return rf === String(root) ? '' : rf + '='; })(HW.texFactors(f.map(function (pe) { return [pe[0], pe[1] / k]; }))) + F(root)) + '. (Calculator: ' + t(rt + '=' + F(root)) + ' ✓)'
      : 'The exponent of ' + t(bad[0]) + ' is ' + t(bad[1]) + ', which is not ' + test + ', so the factors can’t split into ' + (k === 2 ? 'two' : 'three') + ' identical groups: ' + t(F(n)) + ' is <b>not</b> a perfect ' + word + '.<br>Calculator check: ' + t(rt + '\\approx ' + K.roundTo(Math.pow(n, 1 / k), 2).toFixed(2)) + ', not a whole number.');
    var p = P.fields('Is ' + t(F(n)) + ' a perfect ' + word + '? Write its prime factorization, then give ' + t(rt) + ' — or type <b>none</b> if it is not a perfect ' + word + '.', fields,
      [prodChk(n, 'either'), rootOrNone(root, k, F(n), diag)], keys,
      t(F(n) + '=' + K.fac(n)) + '<br>' + (root != null ? 'Perfect ' + word + ': ' + t(rt + '=' + F(root)) : 'Not a perfect ' + word + '.'), sol,
      ['Factor ' + t(F(n)) + ' into primes and look at the exponents.', 'A perfect ' + word + ' has every exponent ' + test + '. ' + (k === 2 ? 'Halve' : 'Divide') + ' each exponent' + (k === 3 ? ' by 3' : '') + ' to get the root.'],
      'perfect ' + word + '? ' + n);
    p.good = root != null ? [[nt.primeList(n).join('x'), String(root)], [plainFac(n), K.fac(root) === String(root) ? String(root) : plainFac(root)]] : [[plainFac(n), 'no'], [plainFac(n), 'not a perfect ' + word]];
    p.bad = root != null ? [[plainFac(n), 'no'], [plainFac(n), String(root + 1)], [plainFac(n), String(rad(n))]].filter(function (b) { return b[1] !== String(root); }) : [[plainFac(n), String(Math.round(Math.pow(n, 1 / k)))], [plainFac(n), 'yes']];
    return p;
  }
  /* exponent form + whole number in two boxes */
  function expNumPart(prompt, target, lab, diag, sol, hints, text) {
    var fields = [{ name: 'Exponent form', label: 'Exponent form', before: t('\\text{' + lab + '}='), mode: 'text', wide: true, placeholder: 'e.g. 2^2 × 3 × 5' },
      { name: 'Whole number', label: 'Whole number', before: t('\\text{' + lab + '}=') }];
    var p = P.fields(prompt, fields, [expChk(target, diag), K.number(target, diag)], [plainFac(target), String(target)], lab + ' ' + t('=' + eqv(target)), sol, hints, text);
    if (!nt.isPrime(target)) p.bad = [[String(target), String(target)]];
    return p;
  }
  /* smallest multiplier / divisor to reach a perfect k-th power */
  function multFor(n, k) { return nt.factor(n).reduce(function (m, pe) { return m * Math.pow(pe[0], (k - pe[1] % k) % k); }, 1); }
  function divFor(n, k) { return nt.factor(n).reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1] % k); }, 1); }
  function multPart(n, k, nTex) {
    var word = pw(k), m = multFor(n, k), N = n * m, rt = intRoot(N, k), test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    var mdiag = function (v) {
      if (!(v >= 1) || v % 1) return null;
      var w = n * v;
      if (intRoot(w, k) != null) return v === n ? { code: 'times-itself', hint: 'Multiplying by the number itself does give a perfect ' + word + ', but not with the <b>smallest</b> multiplier. Raise each exponent only as far as the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + '.' } : { code: 'not-smallest', hint: t(F(n) + '\\times ' + F(v)) + ' is a perfect ' + word + ', but a <b>smaller</b> multiplier works. Raise each exponent only as far as the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ' — nothing more.' };
      if (k === 2 && v === n && intRoot(w, 2) != null) return null;
      if (k === 3 && intRoot(w, 2) != null) return { code: 'made-square', hint: 'That makes a perfect <b>square</b>, but you need a perfect <b>cube</b>: every exponent must reach a multiple of ' + t('3') + '.' };
      if (k === 2 && intRoot(w, 3) != null) return { code: 'made-cube', hint: 'That makes a perfect <b>cube</b>, but you need a perfect <b>square</b>: every exponent must be even.' };
      if (m % v === 0) return { code: 'missed-prime', hint: 'Not quite: after multiplying by ' + t(F(v)) + ', some exponent is still not ' + test + '. Check every prime.' };
      return null;
    };
    var rdiag = function (v) {
      if (v === N / k) return { code: 'divided-by-index', hint: 'A ' + word + ' root isn’t ' + (k === 2 ? 'half' : 'a third') + ' of the number. Divide each exponent by ' + t(k) + '.' };
      if (v === rad(N) && v !== rt) return { code: 'each-prime-once', hint: 'Divide each <b>exponent</b> by ' + t(k) + ' — a prime with a bigger exponent appears more than once in the root.' };
      if (v === intRoot(n, k)) return { code: 'root-value', hint: 'That’s the root of the original number. Take the root of the <b>result</b> (after multiplying).' };
      return null;
    };
    var fN = nt.factor(n), fNN = nt.factor(N);
    var p = P.fields(nTex,
      [{ name: 'Multiplier', label: 'Multiply by' }, { name: (k === 2 ? 'Square' : 'Cube') + ' root', label: (k === 2 ? 'Square' : 'Cube') + ' root of the result', mode: 'text', placeholder: 'number or exponent form' }],
      [K.number(m, mdiag), valChk(rt, rdiag)], [String(m), String(rt)],
      'Multiply by ' + t(F(m)) + '; ' + t(rootTex(k, F(N)) + '=' + F(rt)),
      (nTex.indexOf('times') < 0 ? t(F(n) + '=' + K.fac(n)) + '. ' : '') + 'Raise each exponent to the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ': ' +
        fN.filter(function (pe) { return pe[1] % k; }).map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{' + (pe[1] + (k - pe[1] % k)) + '}'); }).join(', ') + '.<br>Multiply by ' + t(eqv(m)) + '. Result: ' + t(HW.texFactors(fNN) + (N < 1e9 ? '=' + F(N) : '')) + '.<br>' + (k === 2 ? 'Square' : 'Cube') + ' root: ' + t(HW.texFactors(fNN.map(function (pe) { return [pe[0], pe[1] / k]; })) + '=' + F(rt)) + '.',
      ['Look at the exponents in the prime factorization. Which ones are not ' + test + '?', 'Bring each of those up to the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ' — and no further.'],
      'multiply to perfect ' + word + ': ' + n);
    p.bad = [[String(n), String(rt)], [String(m * 2 === n ? m * 3 : m * 2), String(rt)]];
    return p;
  }
  function divPart(n, k) {
    var word = pw(k), d = divFor(n, k), N = n / d, rt = intRoot(N, k), test = k === 2 ? 'even' : 'a multiple of ' + t('3');
    var ddiag = function (v) {
      if (!(v >= 1) || v % 1) return null;
      if (n % v) return { code: 'not-divisor', hint: t(F(n) + '\\div ' + F(v)) + ' isn’t a whole number. Remove only prime factors that ' + t(F(n)) + ' actually has.' };
      var w = n / v;
      if (intRoot(w, k) != null) return { code: 'not-smallest', hint: t(F(n) + '\\div ' + F(v) + '=' + F(w)) + ' is a perfect ' + word + ', but you removed more than you had to. Lower each exponent only to the next ' + (k === 2 ? 'even number' : 'multiple of ' + t('3')) + ' below it.' };
      if (k === 3 && intRoot(w, 2) != null) return { code: 'made-square', hint: 'That leaves a perfect <b>square</b>, but you need a perfect <b>cube</b>.' };
      if (k === 2 && intRoot(w, 3) != null) return { code: 'made-cube', hint: 'That leaves a perfect <b>cube</b>, but you need a perfect <b>square</b>.' };
      return null;
    };
    var fN = nt.factor(n), fR = nt.factor(N);
    var p = P.fields('Find the smallest whole number ' + t(F(n)) + ' can be <b>divided</b> by to leave a perfect ' + word + ', and give the ' + word + ' root.',
      [{ name: 'Divisor', label: 'Divide by' }, { name: (k === 2 ? 'Square' : 'Cube') + ' root', label: (k === 2 ? 'Square' : 'Cube') + ' root', mode: 'text', placeholder: 'number' }],
      [K.number(d, ddiag), valChk(rt, null)], [String(d), String(rt)],
      'Divide by ' + t(F(d)) + '; ' + t(rootTex(k, F(N)) + '=' + F(rt)),
      t(F(n) + '=' + K.fac(n)) + '. Lower each exponent that isn’t ' + test + ' to the one just below it: ' + fN.filter(function (pe) { return pe[1] % k; }).map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{' + (pe[1] - pe[1] % k) + '}'); }).join(', ') + '.<br>Divide by ' + t(eqv(d)) + ': ' + t(F(n) + '\\div ' + F(d) + '=' + F(N) + '=' + HW.texFactors(fR)) + '.<br>' + (k === 2 ? 'Square' : 'Cube') + ' root: ' + t(HW.texFactors(fR.map(function (pe) { return [pe[0], pe[1] / k]; })) + '=' + F(rt)) + '.',
      ['Factor ' + t(F(n)) + ' and look for exponents that are not ' + test + '.', 'Remove just enough of each of those primes.'], 'divide to perfect ' + word + ': ' + n);
    p.bad = [[String(n), '1'], [String(d), String(N)]];
    return p;
  }
  /* pair a = g·x, b = g·y with gcd(x, y) = 1 */
  function gxPair(r, gs, xs, lo, hi, fallback) {
    return find(r, function () { var g = r.pick(gs), x = r.pick(xs), y = r.pick(xs); return [g * Math.min(x, y), g * Math.max(x, y), g]; },
      function (v) { return v[0] !== v[1] && gcd(v[0], v[1]) === v[2] && v[0] >= lo && v[1] <= hi && noneDivides([v[0], v[1]]); }, fallback);
  }
  function expGroup(r, ps, lo, hi, fallback) {
    if (r.chance(0.15)) return fallback;
    return find(r, function () { return [0, 1, 2].map(function () { return ps.map(function () { return r.int(lo, hi); }); }); }, function (es) {
      for (var j = 0; j < ps.length; j++) { var col = es.map(function (e) { return e[j]; }); if (Math.min.apply(null, col) === Math.max.apply(null, col)) return false; }
      return true;
    }, fallback);
  }

  HW.addCodes({
    'gcf-lcm': 'Gave the LCM instead of the GCF', 'gcf-product': 'Multiplied the numbers (GCF)', 'gcf-one': 'Said the GCF is 1', 'gcf-not-greatest': 'Common factor, but not the greatest',
    'gcf-high-power': 'GCF: used the highest power of a shared prime', 'gcf-extra-prime': 'GCF: included a prime not in every number', 'gcf-not-common': 'Not a common factor',
    'lcm-gcf': 'Gave the GCF instead of the LCM', 'lcm-product': 'Multiplied the numbers (LCM too big)', 'lcm-not-least': 'Common multiple, but not the least',
    'lcm-low-power': 'LCM: used a lower power of a prime', 'lcm-missing-prime': 'LCM: left out a prime', 'lcm-not-multiple': 'Not a common multiple',
    'not-factored': 'Didn’t write the prime factorization', 'as-number': 'Gave a number instead of exponent form', 'said-not-perfect': 'Said not a perfect square/cube (it is)',
    'said-perfect': 'Said it is a perfect square/cube (it isn’t)', 'yes-root': 'Said yes without giving the root', 'divided-by-index': 'Halved / divided by 3 instead of taking the root',
    'each-prime-once': 'Root: used each prime once (didn’t divide the exponents)', 'used-square-root': 'Gave the square root instead of the cube root', 'used-cube-root': 'Gave the cube root instead of the square root',
    'root-value': 'Wrong root', 'times-itself': 'Multiplied by the number itself (not smallest)', 'not-smallest': 'Works, but not the smallest', 'made-square': 'Made a square instead of a cube',
    'made-cube': 'Made a cube instead of a square', 'missed-prime': 'Missed a prime with the wrong exponent', 'not-divisor': 'Divisor doesn’t divide the number',
    'time-format': 'Time not readable', 'time-minutes': 'Minutes not converted to hours', 'time-duration': 'Gave minutes instead of a clock time', 'time-ampm': 'Wrong a.m./p.m.',
    'decimal-hours': 'Read decimal hours as minutes', 'gave-gcf': 'Used the GCF (should be LCM)', 'gave-lcm': 'Used the LCM (should be GCF)', 'round-up': 'Rounded up a count',
    'added-counts': 'Added the two counts', 'one-colour': 'Counted only one colour', 'area-by-side': 'Divided area by side length (not tile area)', 'added': 'Added instead of multiplied',
    'perimeter': 'Used the perimeter', 'halved': 'Halved instead of square root', 'area': 'Gave the area', 'two-sides': 'Used only two sides', 'side-only': 'Gave one side only',
    'divided-3': 'Divided by 3 instead of cube root', 'square-root': 'Used the square root instead of cube root', 'said-yes': 'Said yes (it’s no)', 'said-no': 'Said no (it’s yes)',
    'yes-no': 'Didn’t answer yes or no', 'wrong-tool': 'Chose GCF/LCM the wrong way round', 'tool-unclear': 'Didn’t name GCF or LCM', 'pair-gcf': 'Pair has the wrong GCF', 'pair-lcm': 'Pair has the wrong LCM',
    'known-exp': 'Used the known exponent for the unknown', 'no-divide': 'Forgot to divide in GCF×LCM=ab', 'multiplier': 'Gave the multiplier, not the number', 'lcm-over-gcf': 'Divided LCM by GCF',
    'swapped': 'Swapped the two answers', 'squared': 'Took two of each prime instead of one'
  });

  HW.defineLesson({
    id: 'u1l2', unit: 1, num: '2', title: 'Prime Factorization at Work: GCF, LCM, and Perfect Powers', outcome: 'AN1',
    blurb: 'Use prime factorizations to find the greatest common factor and least common multiple, and to test for perfect squares and perfect cubes.',
    questions: [
      { num: '1', section: 'Part A — Greatest Common Factor', stem: 'State the greatest common factor of each group.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([3, 4, 5, 6]), x = r.int(2, 8), y = r.int(2, 9); return [g * x, g * y, x, y]; },
            function (v) { return v[2] < v[3] && gcd(v[2], v[3]) === 1 && v[1] <= 48; }, [15, 24]).slice(0, 2), true);
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([8, 9, 10, 12, 14, 15, 16, 18]), x = r.int(2, 5), y = r.int(2, 5); return [g * x, g * y, x, y]; },
            function (v) { return v[2] < v[3] && gcd(v[2], v[3]) === 1 && v[1] <= 90; }, [24, 36]).slice(0, 2), true);
        } },
        { id: '1c', level: 'BEG', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([4, 5, 6, 7]), m = sortN(r.sample(range(2, 10), 3)); return m.map(function (x) { return g * x; }).concat([g]); },
            function (v) { return gcfA(v.slice(0, 3)) === v[3] && v[2] <= 70 && noneDivides(v.slice(0, 3)); }, [18, 24, 60]).slice(0, 3), true);
        } }] },
      { num: '2', stem: 'Use prime factorization to determine the greatest common factor of', parts: [
        { id: '2a', level: 'EMG', make: function (r) { return factFieldsPart(gxPair(r, [42, 30, 66, 70, 78], range(2, 9), 100, 400, [168, 210]).slice(0, 2), 'gcf'); } },
        { id: '2b', level: 'EMG', make: function (r) {
          var v = find(r, function () { var g = r.pick([27, 8, 16, 25, 49]), q = nt.distinctPrimes(g)[0], xs = r.sample([2, 3, 5, 7, 11, 13].filter(function (p) { return p !== q; }), 2); return sortN([g * xs[0], g * xs[1]]); },
            function (v) { return v[0] >= 100 && v[1] <= 400; }, [135, 189]);
          return factFieldsPart(v, 'gcf');
        } },
        { id: '2c', level: 'PRG', make: function (r) {
          var v = find(r, function () { var g = r.pick([44, 28, 52, 45, 63, 20, 68]), xs = r.sample([3, 5, 7, 11, 13].filter(function (p) { return g % p; }), 2); return sortN([g * xs[0], g * xs[1]]); },
            function (v) { return v[0] >= 100 && v[1] <= 500; }, [220, 308]);
          return factFieldsPart(v, 'gcf');
        } }] },
      { num: '3', stem: 'Use prime factorization to determine the greatest common factor of', parts: [
        { id: '3a', level: 'PRG', make: function (r) {
          return gcfPart(find(r, function () { var p = r.pick([13, 17, 19, 23]), qs = sortN(r.sample([13, 17, 19, 23, 29, 31].filter(function (x) { return x !== p; }), 2)); return [p * qs[0], p * qs[1]]; },
            function (v) { return v[0] >= 150 && v[1] <= 900; }, [391, 493]));
        } },
        { id: '3b', level: 'PRG', make: function (r) {
          return gcfPart(find(r, function () { var i = r.int(1, 3), j = r.int(1, 3), k = r.int(1, 3), l = r.int(1, 3), q = r.pick([5, 7]); return [Math.pow(2, i) * Math.pow(3, j), Math.pow(2, k) * Math.pow(3, l) * q * q, i, j, k, l]; },
            function (v) { return v[2] !== v[4] && v[3] !== v[5] && v[0] >= 100 && v[0] <= 999 && v[1] >= 100 && v[1] <= 999; }, [216, 588]).slice(0, 2));
        } },
        { id: '3c', level: 'PRG', make: function (r) { return gcfPart(gxPair(r, [225, 196, 441, 175, 245], range(2, 12), 600, 4000, [1350, 1575]).slice(0, 2)); } },
        { id: '3d', level: 'ADV', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([3, 7, 11]) * r.pick([31, 37, 41, 43, 47]), xs = sortN(r.sample([2, 3, 5], 2)); return [g * xs[0], g * xs[1]]; },
            function (v) { return v[0] >= 200 && v[1] <= 1500; }, [574, 861]));
        } },
        { id: '3e', level: 'EMG', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([11, 13, 17]), x = r.pick([3, 5, 7]), y = r.pick([6, 10, 14, 15, 21, 35]); return [g * x, g * y, x, y]; },
            function (v) { return gcd(v[2], v[3]) === 1 && v[1] <= 400 && v[0] !== v[1]; }, [91, 195]).slice(0, 2));
        } },
        { id: '3f', level: 'PRG', make: function (r) { return gcfPart(gxPair(r, [147, 75, 98, 245, 63, 99, 175], range(2, 9), 400, 2000, [735, 1176]).slice(0, 2)); } }] },
      { num: '4', stem: 'Determine the greatest common factor of', parts: [
        { id: '4a', level: 'PRG', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([12, 18, 20, 24, 15]), m = sortN(r.sample(range(2, 25), 3)); return m.map(function (x) { return g * x; }).concat(m); },
            function (v) { var m = v.slice(3); return gcfA(m) === 1 && (gcd(m[0], m[1]) > 1 || gcd(m[0], m[2]) > 1 || gcd(m[1], m[2]) > 1) && v[2] <= 400; }, [72, 108, 300]).slice(0, 3));
        } },
        { id: '4b', level: 'ADV', make: function (r) {
          return gcfPart(find(r, function () { var g = r.pick([14, 12, 15, 18, 10]), m = sortN(r.sample(range(2, 16), 4)); return m.map(function (x) { return g * x; }).concat(m); },
            function (v) { var m = v.slice(4), cp = 0; for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) if (gcd(m[i], m[j]) === 1) cp++; return gcfA(m) === 1 && cp <= 1 && v[3] <= 300; }, [84, 140, 168, 210]).slice(0, 4));
        } }] },
      { num: '5', section: 'Part B — Least Common Multiple', stem: 'State the least common multiple of', parts: [
        { id: '5a', level: 'LIM', make: function (r) { return lcmPart(find(r, function () { return sortN(r.sample(range(4, 12), 2)); }, function (v) { return gcd(v[0], v[1]) === 2 && noneDivides(v); }, [6, 8]), true); } },
        { id: '5b', level: 'BEG', make: function (r) { return lcmPart(find(r, function () { return sortN(r.sample(range(4, 15), 2)); }, function (v) { var g = gcd(v[0], v[1]); return (g === 2 || g === 3) && noneDivides(v) && lcm(v[0], v[1]) <= 60; }, [4, 10]), true); } },
        { id: '5c', level: 'BEG', make: function (r) { return lcmPart(find(r, function () { return sortN(r.sample(range(6, 24), 2)); }, function (v) { var g = gcd(v[0], v[1]); return (g === 4 || g === 6) && noneDivides(v) && lcm(v[0], v[1]) <= 72; }, [8, 12]), true); } },
        { id: '5d', level: 'EMG', make: function (r) { return lcmPart(find(r, function () { return sortN(r.sample(range(10, 50), 3)); }, function (v) { var L = lcmA(v); return noneDivides(v) && L >= 60 && L <= 400 && L * 20 <= prodOf(v); }, [20, 30, 45]), true); } }] },
      { num: '6', stem: 'Use prime factorization to determine the least common multiple of', parts: [
        { id: '6a', level: 'EMG', make: function (r) { return factFieldsPart(find(r, function () { return sortN(r.sample(range(10, 50), 2)); }, function (v) { var g = gcd(v[0], v[1]); return [3, 5, 7].indexOf(g) >= 0 && noneDivides(v) && lcm(v[0], v[1]) >= 60; }, [15, 40]), 'lcm'); } },
        { id: '6b', level: 'PRG', make: function (r) {
          return factFieldsPart(find(r, function () { return sortN(r.sample(range(20, 100), 2)); }, function (v) {
            var a = v[0], b = v[1], up = false, down = false;
            nt.distinctPrimes(a * b).forEach(function (p) { var ea = expOf(a, p), eb = expOf(b, p); if (ea > eb && eb >= 1) up = true; if (eb > ea && ea >= 1) down = true; });
            return up && down && noneDivides(v);
          }, [24, 90]), 'lcm');
        } },
        { id: '6c', level: 'EMG', make: function (r) {
          return factFieldsPart(find(r, function () { var ps = r.sample([2, 3, 5, 7, 11, 13], 4); return [ps[0] * ps[1], ps[1] * ps[2] * ps[3]]; }, function (v) { return v[0] >= 10 && v[0] <= 40 && v[1] >= 100 && v[1] <= 400; }, [14, 231]), 'lcm');
        } },
        { id: '6d', level: 'EMG', make: function (r) { var p = r.pick([7, 11, 13]), m = r.pick([2, 3, 5]); return factFieldsPart([m * p, p * p], 'lcm'); } },
        { id: '6e', level: 'EMG', make: function (r) {
          return lcmPart(find(r, function () { var s = r.pick([7, 11, 13, 17]), pq = sortN(r.sample([3, 5, 7, 11, 13].filter(function (x) { return x !== s; }), 2)); return [pq[0] * s, pq[1] * s]; }, function (v) { return v[0] >= 30 && v[1] <= 250; }, [65, 143]));
        } },
        { id: '6f', level: 'PRG', make: function (r) {
          return lcmPart(find(r, function () { var g = r.pick([45, 63, 30, 42, 35]), xs = sortN(r.sample([2, 3, 5, 7, 11], 2)); return [g * xs[0], g * xs[1]]; }, function (v) { return v[0] >= 50 && v[1] <= 400; }, [90, 315]));
        } },
        { id: '6g', level: 'PRG', make: function (r) { var pq = r.pick([[5, 7], [3, 5], [3, 7], [2, 7], [2, 5], [3, 11]]); return lcmPart([pq[0] * pq[0] * pq[1], pq[0] * pq[1] * pq[1]]); } },
        { id: '6h', level: 'EMG', make: function (r) { var p = r.pick([13, 17, 19, 23]), xy = r.pick([[3, 4], [2, 3], [4, 5], [3, 5], [2, 5]]); return lcmPart([xy[0] * p, xy[1] * p]); } },
        { id: '6i', level: 'PRG', make: function (r) {
          var g = r.pick([6, 6, 10]), pq = r.sample([3, 5, 7, 11, 13].filter(function (x) { return g % x; }), 2);
          return lcmPart([g * pq[0], 2 * g * pq[1]]);
        } }] },
      { num: '7', stem: 'Determine the least common multiple of', parts: [
        { id: '7a', level: 'EMG', make: function (r) { return lcmPart(find(r, function () { return sortN(r.sample(range(4, 40), 3)); }, function (v) { var L = lcmA(v); return noneDivides(v) && L >= 60 && L <= 360 && L * 10 <= prodOf(v); }, [8, 12, 30])); } },
        { id: '7b', level: 'PRG', make: function (r) { return lcmPart(r.chance(0.1) ? [15, 40, 84] : find(r, function () { return sortN(r.sample(range(10, 90), 3)); }, function (v) { var L = lcmA(v); return noneDivides(v) && L >= 300 && L <= 2600 && L * 5 <= prodOf(v); }, [15, 40, 84])); } },
        { id: '7c', level: 'PRG', make: function (r) { return lcmPart(find(r, function () { return sortN(r.sample([2, 3, 5, 7, 11, 13, 17, 19], 4)); }, function (v) { var p = prodOf(v); return p >= 1000 && p <= 20000 && v[3] >= 11; }, [5, 7, 11, 17])); } },
        { id: '7d', level: 'ADV', make: function (r) {
          return lcmPart(find(r, function () { var p = r.sample([2, 3, 5, 7, 11, 13], 4); return sortN([p[0] * p[0], p[1] * p[2], p[2] * p[3], p[3] * p[3]]); }, function (v) { var L = lcmA(v); return L >= 1000 && L <= 60000; }, [4, 15, 55, 121]));
        } }] },
      { num: '8', section: 'Part C — Perfect Squares and Perfect Cubes', stem: 'In each case use prime factorization to determine whether the number is a perfect square. If it is a perfect square, state its square root. (Verify with a calculator.)', parts: [
        { id: '8a', level: 'EMG', make: function (r) { var k = r.pick([18, 20, 28, 45, 50, 44, 52, 63]); return powerTestPart(k * k, 2); } },
        { id: '8b', level: 'PRG', make: function (r) { var k = r.pick([30, 42, 66, 70, 78]); return powerTestPart(k * k, 2); } },
        { id: '8c', level: 'PRG', make: function (r) { return powerTestPart(r.pick([686, 250, 375, 1029, 2662, 1715]), 2); } },
        { id: '8d', level: 'PRG', make: function (r) { return powerTestPart(r.pick([1050, 1470, 1350, 1575, 1176, 2450]), 2); } }] },
      { num: '9', stem: function (sh) { return 'Consider the number ' + t(F(sh.n)) + '.'; },
        shared: function (r) { var k = r.pick([45, 63, 50, 75, 98, 44, 52, 99, 28, 36]); return { k: k, n: k * k * k }; },
        parts: [
          { id: '9a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, k = sh.k, s = Math.round(Math.sqrt(n));
            return P.number('Use a calculator to find the cube root of ' + t(F(n)) + '.', k, function (v) {
              if (Math.abs(v - Math.sqrt(n)) < 1 || v === s) return { code: 'square-root', hint: 'That’s the <b>square</b> root. Use the cube root: ' + t('\\sqrt[3]{\\ }') + ' (on many calculators, ' + t('x^{1/3}') + ' or the ' + t('\\sqrt[x]{\\ }') + ' key with 3).' };
              if (v === n / 3) return { code: 'divided-3', hint: 'A cube root isn’t a third of the number. It is the number that, multiplied by itself three times, gives ' + t(F(n)) + '.' };
              return null;
            }, t('\\sqrt[3]{' + F(n) + '}=' + k) + '. Check: ' + t(k + '\\times ' + k + '\\times ' + k + '=' + F(n)) + '.', ['Use the cube-root key, not the square-root key.'], 'cube root of ' + n, { before: t('\\sqrt[3]{' + F(n) + '}=') });
          } },
          { id: '9b1', sub: 'b i', level: 'PRG', make: function (r, sh) { var p = productPart(sh.n, 'required'); p.prompt = 'Write ' + t(F(sh.n)) + ' as a product of primes in exponent form.'; return p; } },
          { id: '9b2', sub: 'b ii', level: 'PRG', make: function (r, sh) {
            var n = sh.n, k = sh.k, f = nt.factor(n), fk = HW.texFactors(nt.factor(k)), exps = f.map(function (pe) { return pe[1]; }), sum = nt.sum(exps), mx = Math.max.apply(null, exps);
            return P.mc(r, 'Which statement explains how the prime factorization ' + t(F(n) + '=' + K.fac(n)) + ' shows that ' + t(F(n)) + ' is a perfect cube, and confirms the cube root?', [
              { html: 'Every exponent (' + t(exps.join(',\\ ')) + ') is a multiple of ' + t('3') + ', so the primes split into three identical groups. One group is ' + t(fk + (fk === String(k) ? '' : '=' + k)) + ', the cube root.', right: true },
              { html: 'The exponents add up to ' + t(sum) + ', a multiple of ' + t('3') + ', so it is a perfect cube with cube root ' + t(k) + '.', why: 'Adding the exponents doesn’t test for a cube: ' + t('18=2\\times 3^{2}') + ' has exponents adding to ' + t('3') + ', but ' + t('18') + ' is not a perfect cube. <b>Each</b> exponent must be a multiple of ' + t('3') + '.' },
              { html: 'The largest exponent, ' + t(mx) + ', is a multiple of ' + t('3') + ', so it is a perfect cube with cube root ' + t(k) + '.', why: 'Every exponent must be a multiple of ' + t('3') + ', not just the largest: ' + t('24=2^{3}\\times 3') + ' is not a perfect cube.' },
              { html: 'Every exponent is a multiple of ' + t('3') + ', so the cube root is ' + t(F(n) + '\\div 3' + (n % 3 ? '\\approx ' + F(Math.round(n / 3 * 100) / 100) : '=' + F(n / 3))) + '.', why: 'Right test, wrong root: a cube root isn’t a third of the number. Divide each <b>exponent</b> by ' + t('3') + ' instead.' }],
              t(F(n) + '=' + K.fac(n)) + '. Every exponent is a multiple of ' + t('3') + ', so the factors group into three matching triples and ' + t(F(n)) + ' is a perfect cube. Dividing each exponent by ' + t('3') + ': ' + t('\\sqrt[3]{' + F(n) + '}=' + fk + (fk === String(k) ? '' : '=' + k)) + ', which matches the calculator. ✓',
              ['For a perfect cube, what must be true of <b>every</b> exponent?'], 'explain perfect cube ' + n);
          } }] },
      { num: '10', stem: 'In each case use prime factorization to determine whether the number is a perfect cube. If it is, state its cube root. (Verify with a calculator.)', parts: [
        { id: '10a', level: 'EMG', make: function (r) { return powerTestPart(r.pick([512, 729, 4096, 15625]), 3); } },
        { id: '10b', level: 'PRG', make: function (r) { return powerTestPart(r.pick([2197, 4913, 6859, 12167]), 3); } },
        { id: '10c', level: 'PRG', make: function (r) { return powerTestPart(r.pick([1024, 256, 625, 2401, 6561]), 3); } },
        { id: '10d', level: 'PRG', make: function (r) { return powerTestPart(r.pick([3025, 1225, 5929, 4225, 8281, 1089]), 3); } }] },
      { num: '11', stem: 'Explain how you could use prime factorization to determine whether a whole number is <i>both</i> a perfect square and a perfect cube.', parts: [
        { id: '11', level: 'ADV', make: function (r) {
          var ex = r.pick([[64, '2^{6}', 8, 4], [729, '3^{6}', 27, 9], [4096, '2^{12}', 64, 16], [15625, '5^{6}', 125, 25], [46656, '2^{6}\\times 3^{6}', 216, 36]]);
          return P.mc(r, 'Which method works?', [
            { html: 'Find the prime factorization. The number is both exactly when <b>every</b> exponent is a multiple of ' + t('6') + ' (a multiple of both ' + t('2') + ' and ' + t('3') + ').', right: true },
            { html: 'Find the prime factorization. The number is both when every exponent is even.', why: 'Even exponents only make a perfect <b>square</b>: ' + t('4=2^{2}') + ' is a square but not a cube.' },
            { html: 'Find the prime factorization. The number is both when every exponent is a multiple of ' + t('2') + ' <b>or</b> a multiple of ' + t('3') + '.', why: '“Or” isn’t enough: ' + t('108=2^{2}\\times 3^{3}') + ' has one of each, and it is neither a square nor a cube.' },
            { html: 'Find the prime factorization. The number is both when the exponents add up to a multiple of ' + t('6') + '.', why: t('486=2\\times 3^{5}') + ' has exponents adding to ' + t('6') + ', but it is neither a square nor a cube. Look at each exponent on its own.' }],
            'A perfect square needs every exponent to be a multiple of ' + t('2') + '; a perfect cube needs every exponent to be a multiple of ' + t('3') + '. Both at once means every exponent is a multiple of ' + t('6') + '. Example: ' + t(F(ex[0]) + '=' + ex[1]) + ', so ' + t('\\sqrt{' + F(ex[0]) + '}=' + ex[2]) + ' and ' + t('\\sqrt[3]{' + F(ex[0]) + '}=' + ex[3]) + '.',
            ['What must the exponents be for a square? For a cube? What number is a multiple of both?'], 'explain square and cube');
        } }] },
      { num: '12', section: 'Part D — Multiple Choice, Numerical Response, and Application', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var v = find(r, function () { var ps = sortN(r.sample([2, 3, 5, 7, 11, 13], 3)), xy = sortN(r.sample([2, 3, 4, 5, 7], 2)), g = prodOf(ps); return { ps: ps, g: g, a: g * xy[0], b: g * xy[1], xy: xy }; },
            function (v) { return gcd(v.xy[0], v.xy[1]) === 1 && v.a >= 300 && v.b <= 2000 && v.g >= 60; }, { ps: [3, 5, 11], g: 165, a: 495, b: 660, xy: [3, 4] });
          var ps = v.ps, subs = [ps[0], ps[1], ps[2], ps[0] * ps[1], ps[0] * ps[2], ps[1] * ps[2]], ds = r.sample(subs, 3);
          var opts = sortN(ds.concat([v.g])).map(function (d) { return { html: t(F(d)), right: d === v.g, why: d === v.g ? null : t(d) + ' is a common factor of ' + t(F(v.a)) + ' and ' + t(F(v.b)) + ', but not the <b>greatest</b> one — there is a shared prime factor you haven’t included. Compare the full prime factorizations.' }; });
          return P.mc(r, 'The greatest common factor of ' + t(F(v.a)) + ' and ' + t(F(v.b)) + ' is', opts,
            facLines([v.a, v.b]) + '. Shared primes at their lower powers: ' + t(ps.join(',\\ ')) + ', so the GCF is ' + t(ps.join('\\times ') + '=' + F(v.g)) + '. The other options are each only part of the full common factor.',
            ['Factor both numbers. The GCF uses <b>every</b> shared prime.'], 'MC GCF of ' + v.a + ', ' + v.b, true);
        } }] },
      { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'ADV', make: function (r) {
          var p = r.pick([7, 7, 3, 5, 11, 13]), g = 2 * p, falseAt = r.pick([-1, -1, 0, 1, 2, 3]);
          var S = [
            { tv: t('x') + ' and ' + t('y') + ' must both be even numbers.', tr: t(g) + ' is even, so every multiple of ' + t(g) + ' is even.',
              fv: 'At least one of ' + t('x') + ' and ' + t('y') + ' must be a multiple of ' + t('4') + '.', fr: 'Try ' + t('x=' + g) + ', ' + t('y=' + 3 * g) + ': their GCF is ' + t(g) + ', and neither is a multiple of ' + t('4') + '.' },
            { tv: 'The product ' + t('xy') + ' must be divisible by ' + t(F(g * g)) + '.', tr: t(g) + ' divides ' + t('x') + ' and ' + t(g) + ' divides ' + t('y') + ', so ' + t(g + '\\times ' + g + '=' + F(g * g)) + ' divides ' + t('xy') + '.',
              fv: 'The least common multiple of ' + t('x') + ' and ' + t('y') + ' must be ' + t(F(g * g)) + '.', fr: 'Try ' + t('x=' + g) + ', ' + t('y=' + 2 * g) + ': GCF ' + t(g) + ', but the LCM is ' + t(2 * g) + '.' },
            { tv: t('x') + ' and ' + t('y') + ' are both divisible by ' + t(p) + '.', tr: t(p) + ' divides ' + t(g) + ', and ' + t(g) + ' divides both numbers.',
              fv: t('x') + ' and ' + t('y') + ' are both divisible by ' + t(p * p) + '.', fr: 'Try ' + t('x=' + g) + ': it isn’t divisible by ' + t(p * p) + '.' },
            { tv: 'Neither ' + t('x') + ' nor ' + t('y') + ' can be a prime number.', tr: 'Both are multiples of ' + t(g) + ', so each has ' + t('2') + ' as a factor and is bigger than ' + t('2') + ': each is composite.',
              fv: 'One of the two numbers must be ' + t(g) + ' itself.', fr: 'Try ' + t('x=' + 2 * g) + ', ' + t('y=' + 3 * g) + ': their GCF is ' + t(g) + ', but neither number is ' + t(g) + '.' }];
          var L = ['A', 'B', 'C', 'D'];
          var opts = S.map(function (s, i) { var isF = i === falseAt; return { html: isF ? s.fv : s.tv, right: isF, why: isF ? null : 'Statement ' + L[i] + ' is true: ' + s.tr }; });
          opts.push({ html: 'None of the statements is false.', right: falseAt < 0, why: falseAt < 0 ? null : 'One of the statements is false. Test each one with examples such as ' + t('x=' + g) + ', ' + t('y=' + 2 * g) + ' or ' + t('y=' + 3 * g) + '.' });
          return P.mc(r, 'The greatest common factor of two whole numbers ' + t('x') + ' and ' + t('y') + ' is ' + t(g) + '. Which of the statements A, B, C, or D is false? Answer E if none of the statements is false.', opts,
            t(g + '=2\\times ' + p) + ', so ' + t('x') + ' and ' + t('y') + ' are both multiples of ' + t(g) + '.<br>' + S.map(function (s, i) { return L[i] + ': ' + (i === falseAt ? s.fv + ' ' + s.fr + ' <b>False.</b>' : s.tr + ' <b>True.</b>'); }).join('<br>') + '<br>' + (falseAt < 0 ? 'All four are true, so the answer is <b>E</b>.' : 'So the false statement is <b>' + L[falseAt] + '</b>.'),
            ['Both numbers are multiples of ' + t(g) + '. Test each statement with examples like ' + t('x=' + g) + ' and ' + t('y=' + 2 * g) + '.'], 'GCF statements, GCF ' + g, true);
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'PRG', make: function (r) {
          var nums = find(r, function () { return sortN(r.sample(range(12, 60), 3)); }, function (v) { var L = lcmA(v); return noneDivides(v) && L >= 1000 && L <= 9999 && prodOf(v) / L >= 8; }, [33, 40, 44]);
          var L = lcmA(nums), pr = prodOf(nums), base = K.number(L, lcmDiag(nums), { nr: true });
          var p = P.nr('The least common multiple of ' + nlist(nums) + ' is ________.', L, null, lcmSol(nums), ['Factor each number into primes.', 'Take every prime that appears, at its highest power.'], 'NR LCM of ' + nums.join(', '));
          p.check = function (resp) { var q = HW.parse.number(resp); if (q.ok && q.value === pr) return wrong('lcm-product', 'Multiplying the numbers gives <i>a</i> common multiple, but not the <b>least</b> one: shared prime factors got counted more than once.'); return base(resp); };
          p.bad = [String(pr), String(gcfA(nums))];
          return p;
        } }] },
      { num: '15', stem: '', parts: [
        { id: '15', level: 'ADV', make: function (r) {
          var ab = r.pick([[9, 12], [6, 8], [8, 12], [10, 15], [6, 10], [12, 18], [9, 15], [14, 21], [12, 16], [15, 20]]), a = ab[0], b = ab[1], L = lcm(a, b), g = gcd(a, b);
          var N = find(r, function () { return r.int(400, 999); }, function (n) { return n % L && Math.floor(n / L) >= 8 && Math.floor(n / L) <= 40; }, 725);
          if (a === 9 && b === 12 && r.chance(0.3)) N = 725;
          var ans = Math.floor(N / L);
          var p = P.number('A picture book has ' + t(N) + ' pages. Every ' + t(a) + ord(a) + ' page, starting with page ' + t(a) + ', has a red border, and every ' + t(b) + ord(b) + ' page, starting with page ' + t(b) + ', has a blue border. How many pages have both a red border and a blue border?', ans, function (v) {
            if (v === Math.floor(N / (a * b))) return { code: 'lcm-product', hint: 'Pages with both borders are common multiples of ' + t(a) + ' and ' + t(b) + '. The first one isn’t ' + t(a + '\\times ' + b) + ' — they share a factor of ' + t(g) + '. Find the <b>least</b> common multiple.' };
            if (v === Math.ceil(N / L)) return { code: 'round-up', hint: 'Check the last one: ' + t(L + '\\times ' + v + '=' + F(L * v)) + ', and the book only has ' + t(N) + ' pages.' };
            if (v === Math.floor(N / a) + Math.floor(N / b)) return { code: 'added-counts', hint: 'That counts pages with a red <b>or</b> a blue border. You want pages with <b>both</b>: common multiples of ' + t(a) + ' and ' + t(b) + '.' };
            if (v === Math.floor(N / a) || v === Math.floor(N / b)) return { code: 'one-colour', hint: 'That counts only one colour. A page with both borders is a multiple of ' + t(a) + ' <b>and</b> of ' + t(b) + '.' };
            if (v === Math.floor(N / g)) return { code: 'gave-gcf', hint: 'Pages with both borders are common <b>multiples</b> of ' + t(a) + ' and ' + t(b) + ', not multiples of their GCF.' };
            if (v % 1 && Math.abs(v - N / L) < 0.1) return { code: 'round-up', hint: 'Count whole pages: how many multiples of ' + t(L) + ' are there up to ' + t(N) + '?' };
            return null;
          }, 'A page has both borders exactly when its number is a common multiple of ' + t(a) + ' and ' + t(b) + '. ' + facLines([a, b]) + ', so ' + t('\\text{LCM}=' + eqv(L)) + '.<br>The two-colour pages are ' + t(L + ',\\ ' + 2 * L + ',\\ ' + 3 * L + ',\\ \\ldots') + '. Multiples of ' + t(L) + ' up to ' + t(N) + ': ' + t(L + '\\times ' + ans + '=' + F(L * ans) + '\\le ' + N) + ' but ' + t(L + '\\times ' + (ans + 1) + '=' + F(L * (ans + 1)) + '>' + N) + '.<br><b>' + ans + ' pages</b>.',
          ['Which page is the first one with both borders? (It is a common multiple of ' + t(a) + ' and ' + t(b) + '.)', 'Then count how many multiples of that number fit in ' + t(N) + ' pages.'], 'pages with both borders ' + a + ',' + b + ' of ' + N, { after: 'pages' });
          p.bad = [String(Math.floor(N / (a * b))), String(ans + 1)];
          return p;
        } }] },
      { num: '16', section: 'Part E — Problem Solving', stem: 'Use prime factorization to explain.', parts: [
        { id: '16a', level: 'PRG', make: function (r) {
          var names = r.pick([['Sam', 'Jada'], ['Sam', 'Jada'], ['Eli', 'Mira'], ['Owen', 'Priya']]), sq = r.pick([36, 49, 64, 81, 100, 121, 144, 196, 225]), non = r.pick([20, 18, 45, 50, 72, 98, 75, 48, 28, 63, 80, 12]);
          var firstSq = r.chance(0.5), nA = firstSq ? sq : non, nB = firstSq ? non : sq, A = names[0], B = names[1], sqN = firstSq ? A : B, nonN = firstSq ? B : A, k = Math.sqrt(sq);
          var odd = nt.factor(non).filter(function (pe) { return pe[1] % 2; })[0];
          var whyNon = t(non + '=' + K.fac(non)) + ': the exponent of ' + t(odd[0]) + ' is odd, so the tiles can’t pair up into a square. ' + nonN + ' can only make rectangles.';
          var whySq = t(sq + '=' + K.fac(sq)) + ': every exponent is even, so ' + sqN + ' can make a ' + t(k + '\\times ' + k) + ' square.';
          return P.mc(r, A + ' has ' + t(nA) + ' square tiles and ' + B + ' has ' + t(nB) + '. Who can arrange <b>all</b> of their tiles into one solid square?', [
            { html: 'Only ' + A, right: A === sqN, why: A === sqN ? null : whyNon },
            { html: 'Only ' + B, right: B === sqN, why: B === sqN ? null : whyNon },
            { html: 'Both of them', why: whyNon },
            { html: 'Neither of them', why: whySq }],
            'A solid square needs a perfect-square number of tiles: every exponent in the prime factorization must be even.<br>' + whySq + '<br>' + whyNon + '<br>So only <b>' + sqN + '</b> can.',
            ['Factor both numbers. Is every exponent even?'], 'who can make a square: ' + nA + ', ' + nB, true);
        } },
        { id: '16b', level: 'PRG', make: function (r) {
          var c = r.pick([64, 125, 216, 343, 512, 729, 1000]), nc = r.pick([72, 48, 96, 108, 144, 200, 128, 250, 36]), rowsN = r.shuffle([c, nc]);
          function why(n) { var f = nt.factor(n), b = f.filter(function (pe) { return pe[1] % 3; })[0]; return b ? t(F(n) + '=' + K.fac(n)) + ': the exponent of ' + t(b[0]) + ' isn’t a multiple of ' + t('3') + ', so it is not a perfect cube.' : t(F(n) + '=' + K.fac(n)) + ': every exponent is a multiple of ' + t('3') + ', so it makes a ' + t(intRoot(n, 3) + '\\times ' + intRoot(n, 3) + '\\times ' + intRoot(n, 3)) + ' cube.'; }
          var want = {}; rowsN.forEach(function (n, i) { want['r' + i] = n === c ? 'yes' : 'no'; });
          var p = P.grid('Can each number of sugar cubes be stacked into one solid cube?', rowsN.map(function (n, i) { return { id: 'r' + i, html: t(F(n)) + ' cubes', label: n + ' cubes' }; }),
            [{ id: 'yes', html: 'Yes', label: 'Yes' }, { id: 'no', html: 'No', label: 'No' }], want,
            { tries: 2, count: false, why: function (row) { return { code: 'row', hint: why(rowsN[Number(row.slice(1))]) }; } },
            'A solid cube needs a perfect-cube number of sugar cubes: every exponent in the prime factorization must be a multiple of ' + t('3') + '.<br>' + rowsN.map(why).join('<br>'),
            ['Factor each number. Is every exponent a multiple of ' + t('3') + '?'], 'cube stacking: ' + rowsN.join(', '));
          return p;
        } }] },
      { num: '17', stem: function (sh) { return 'A rectangular floor measures ' + t(sh.a) + ' cm by ' + t(sh.b) + ' cm. It will be covered with identical square tiles, with no tiles cut.'; },
        shared: function (r) { var v = gxPair(r, [36, 12, 15, 18, 20, 24, 30, 40, 45], range(2, 12), 100, 600, [252, 360, 36]); return { a: v[0], b: v[1], g: v[2] }; },
        parts: [
          { id: '17a', level: 'PRG', make: function (r, sh) {
            var p = P.number('What is the largest possible side length of a tile?', sh.g, gcfDiag([sh.a, sh.b]), 'The tile side must divide evenly into both ' + t(sh.a) + ' and ' + t(sh.b) + ', and be as large as possible: the GCF.<br>' + gcfSol([sh.a, sh.b]) + '<br><b>' + sh.g + ' cm</b>',
              ['The side length has to fit evenly into both measurements. Is that a common factor or a common multiple?', 'Find the GCF of ' + t(sh.a) + ' and ' + t(sh.b) + '.'], 'largest tile ' + sh.a + '×' + sh.b, { after: 'cm' });
            p.bad = [String(lcm(sh.a, sh.b))];
            return p;
          } },
          { id: '17b', level: 'ADV', make: function (r, sh) {
            var x = sh.a / sh.g, y = sh.b / sh.g, n = x * y;
            return P.number('How many of these tiles are needed?', n, function (v) {
              if (v === sh.a * sh.b / sh.g) return { code: 'area-by-side', hint: 'You divided the floor’s area by the tile’s <b>side length</b>. Divide by the tile’s <b>area</b> — or count tiles along each side and multiply.' };
              if (v === x + y) return { code: 'added', hint: 'You found the tiles along each side. The floor is a grid of tiles, so <b>multiply</b> them.' };
              if (v === 2 * (x + y)) return { code: 'perimeter', hint: 'That counts tiles around the edge only. The whole floor is covered: multiply the tiles along each side.' };
              return null;
            }, t(sh.a + '\\div ' + sh.g + '=' + x) + ' tiles along one side and ' + t(sh.b + '\\div ' + sh.g + '=' + y) + ' along the other, so ' + t(x + '\\times ' + y + '=' + n) + ' tiles. (Check: ' + t(n + '\\times ' + sh.g + '^{2}=' + F(n * sh.g * sh.g) + '=' + sh.a + '\\times ' + sh.b) + ' ✓)',
            ['How many tiles fit along each side of the floor?'], 'number of tiles ' + sh.a + '×' + sh.b, { after: 'tiles' });
          } }] },
      { num: '18', stem: '', parts: [
        { id: '18', level: 'PRG', make: function (r) {
          var ab = r.pick([[18, 24], [18, 24], [30, 45], [25, 40], [20, 35], [15, 25], [18, 30], [24, 36], [16, 20], [21, 28], [27, 36]]), a = ab[0], b = ab[1], L = lcm(a, b), g = gcd(a, b);
          var start = r.pick([360, 390, 420, 420, 435, 450, 480]), E = start + L;
          var dh = Math.floor(L / 60) * 60 + Math.round((L / 60 - Math.floor(L / 60)) * 100);
          var wrongs = [{ add: a * b, code: 'lcm-product', hint: t(a + '\\times ' + b) + ' minutes is <i>a</i> time they meet, but not the <b>first</b>. Find the <b>least</b> common multiple of ' + t(a) + ' and ' + t(b) + '.' },
            { add: g, code: 'gave-gcf', hint: 'Neither bus is back after only ' + t(g) + ' minutes. They meet at a common <b>multiple</b> of ' + t(a) + ' and ' + t(b) + '.' },
            { add: dh, code: 'decimal-hours', hint: t(L + '\\text{ min}=' + (L / 60).toFixed(2).replace(/0+$/, '') + '\\text{ h}') + ', but that decimal isn’t hours and minutes: ' + t(L + '\\text{ min}=' + Math.floor(L / 60) + '\\text{ h }' + (L % 60) + '\\text{ min}') + '.' }];
          var p = P.fields('Two city buses leave the same stop at ' + fmtTime(start) + ' Route A returns to the stop every ' + t(a) + ' minutes and Route B every ' + t(b) + ' minutes. When is the next time both buses are at the stop together?',
            [{ name: 'Time', label: 'Time', mode: 'text', placeholder: 'e.g. 9:45 a.m.' }], [timeChk(E, start, L, wrongs)], [fmtTime(E)], timeHtml(E),
            'Both buses are at the stop at the common multiples of ' + t(a) + ' and ' + t(b) + ' minutes; the first one is the LCM.<br>' + facLines([a, b]) + ', so ' + t('\\text{LCM}=' + eqv(L)) + ' minutes = ' + hm(L) + '.<br>' + fmtTime(start) + ' + ' + hm(L) + ' = <b>' + timeHtml(E) + '</b>',
            ['When are the two buses back together? Look for a common multiple of ' + t(a) + ' and ' + t(b) + '.', 'Find the LCM in minutes, then add it to ' + fmtTime(start)], 'buses ' + a + ', ' + b);
          p.bad = [[fmtTime(start + a * b)], [String(L)]];
          return p;
        } }] },
      { num: '19', stem: function (sh) { return 'A square garden has an area of ' + t(F(sh.n) + '\\text{ m}^{2}') + '.'; },
        shared: function (r) { var k = r.pick([42, 30, 66, 70, 78, 60, 84, 90]); return { k: k, n: k * k }; },
        parts: [
          { id: '19a', level: 'PRG', make: function (r, sh) {
            var n = sh.n, k = sh.k;
            var p = P.number('Use prime factorization to find the side length of the garden.', k, function (v) {
              if (v === n / 2) return { code: 'halved', hint: 'The side length is the <b>square root</b> of the area, not half of it.' };
              if (v === n / 4) return { code: 'perimeter', hint: 'Dividing by ' + t('4') + ' would work for a <b>perimeter</b>. For an area, take the <b>square root</b>.' };
              if (v === rad(n) && v !== k) return { code: 'each-prime-once', hint: 'You used each prime once. Halve each <b>exponent</b> in the prime factorization instead.' };
              return null;
            }, 'Side ' + t('=\\sqrt{' + F(n) + '}') + '. ' + t(F(n) + '=' + K.fac(n)) + ' (every exponent even), so ' + t('\\sqrt{' + F(n) + '}=' + HW.texFactors(nt.factor(k)) + '=' + k) + '. <b>' + k + ' m</b>',
            ['A square’s area is side × side, so the side is the square root of the area.', 'Factor ' + t(F(n)) + ' and halve each exponent.'], 'garden side ' + n, { after: 'm' });
            p.bad = [String(n / 2)];
            return p;
          } },
          { id: '19b', level: 'PRG', make: function (r, sh) {
            var k = sh.k;
            return P.number('How much fencing is needed to enclose it?', 4 * k, function (v) {
              if (v === sh.n) return { code: 'area', hint: 'That’s the area. Fencing goes around the <b>outside</b>: the perimeter.' };
              if (v === 2 * k) return { code: 'two-sides', hint: 'A square has <b>four</b> equal sides.' };
              if (v === k) return { code: 'side-only', hint: 'That’s one side. The fence goes all the way around.' };
              return null;
            }, 'Perimeter ' + t('=4\\times ' + k + '=' + 4 * k) + '. <b>' + 4 * k + ' m</b> of fencing.', ['Fencing goes around all four sides.'], 'fencing for ' + sh.n, { after: 'm' });
          } }] },
      { num: '20', stem: '', parts: [
        { id: '20', level: 'PRG', make: function (r) {
          var k = r.pick([14, 12, 15, 18, 21, 22, 20, 24]), n = k * k * k;
          var p = P.number('A cube-shaped storage box has a volume of ' + t(F(n) + '\\text{ cm}^{3}') + '. Use prime factorization to find the length of each edge.', k, function (v) {
            if (v === n / 3) return { code: 'divided-3', hint: 'The edge is the <b>cube root</b> of the volume, not a third of it.' };
            if (v === Math.round(Math.sqrt(n)) || Math.abs(v - Math.sqrt(n)) < 0.5) return { code: 'square-root', hint: 'That’s close to the <b>square</b> root. A cube’s volume is edge × edge × edge, so take the <b>cube</b> root.' };
            if (v === rad(n) && v !== k) return { code: 'each-prime-once', hint: 'Divide each <b>exponent</b> in the prime factorization by ' + t('3') + '.' };
            return null;
          }, 'Edge ' + t('=\\sqrt[3]{' + F(n) + '}') + '. ' + t(F(n) + '=' + K.fac(n)) + ' (every exponent a multiple of 3), so ' + t('\\sqrt[3]{' + F(n) + '}=' + HW.texFactors(nt.factor(k)) + '=' + k) + '. <b>' + k + ' cm</b>. Check: ' + t(k + '^{3}=' + F(n)) + ' ✓',
          ['Volume of a cube = edge × edge × edge.', 'Factor ' + t(F(n)) + ' and divide each exponent by ' + t('3') + '.'], 'cube edge ' + n, { after: 'cm' });
          p.bad = [String(Math.round(n / 3))];
          return p;
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — GCF and LCM straight from the exponents', stem: 'The GCF takes the <b>lower</b> exponent of each prime the numbers <i>all</i> share; a prime missing from even one factorization can’t appear in the GCF. Give each GCF in exponent form and as a whole number.', parts: [
        { id: 'e1a', level: 'PRG', make: function (r) { return expGroupGcf(r, [2, 3, 5], 1, 4, [[3, 2, 1], [2, 3, 2], [4, 1, 3]]); } },
        { id: 'e1b', level: 'PRG', make: function (r) { return expGroupGcf(r, r.pick([[2, 3, 7], [2, 5, 7], [3, 5, 7]]), 1, 3, [[2, 1, 2], [3, 2, 1], [1, 3, 3]]); } },
        { id: 'e1c', level: 'PRG', make: function (r) {
          var nums = find(r, function () { var g = r.pick([84, 60, 90, 126, 132, 36]), m = sortN(r.sample([2, 3, 5, 7], 3)); return m.map(function (x) { return g * x; }); }, function (v) { return v[2] <= 999 && nt.distinctPrimes(lcmA(v)).length > nt.distinctPrimes(gcfA(v)).length; }, [168, 252, 420]);
          var g = gcfA(nums);
          return expNumPart(nlist(nums) + ' (factor these yourself first)', g, 'GCF', gcfDiag(nums), gcfSol(nums), ['Factor each number into primes first.', 'A prime that is missing from even one number drops out of the GCF.'], 'GCF exponent form ' + nums.join(','));
        } }] },
      { num: '2', stem: 'The LCM is built the other way: take the <b>higher</b> exponent of each prime that appears in <i>any</i> of the factorizations. Give each LCM in exponent form.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) { return expGroupLcm(r, [2, 3, 5], 1, 4, [[3, 2, 1], [2, 3, 2], [4, 1, 3]]); } },
        { id: 'e2b', level: 'PRG', make: function (r) { return expGroupLcm(r, r.pick([[2, 3, 7], [2, 5, 7], [3, 5, 7]]), 1, 3, [[2, 1, 2], [3, 2, 1], [1, 3, 3]]); } },
        { id: 'e2c', level: 'PRG', make: function (r) {
          var nums = find(r, function () { var g = r.pick([84, 60, 90, 126, 132, 36]), m = sortN(r.sample([2, 3, 5, 7], 3)); return m.map(function (x) { return g * x; }); }, function (v) { return v[2] <= 999; }, [168, 252, 420]);
          var L = lcmA(nums);
          return lcmExpPart(t('\\text{LCM}') + ' of ' + nlist(nums), nums, L);
        } }] },
      { num: '3', stem: function (sh) { return 'Let ' + t('a=' + texE([2, 3, sh.p], [sh.i, sh.j, 1])) + ' and ' + t('b=' + texE([2, 3, sh.q], [sh.k, sh.l, 1])) + '. Work from the exponents — don’t multiply the numbers out until the last step.'; },
        shared: function (r) { var pq = r.sample([5, 7, 11], 2); return { i: r.int(3, 5), k: r.int(1, 2), j: r.int(1, 2), l: r.int(3, 5), p: pq[0], q: pq[1] }; },
        parts: [
          { id: 'e3a', level: 'PRG', make: function (r, sh) { var ab = abOf(sh), g = gcfA(ab); return expNumPart('Find the GCF of ' + t('a') + ' and ' + t('b') + '.', g, 'GCF', gcfDiag(ab), abSol(sh, 'gcf'), ['Use only the primes in <b>both</b> numbers, each at the <b>lower</b> exponent.'], 'GCF of a, b (exponents)'); } },
          { id: 'e3b', level: 'PRG', make: function (r, sh) { var ab = abOf(sh), L = lcmA(ab); return expNumPart('Find the LCM of ' + t('a') + ' and ' + t('b') + '.', L, 'LCM', lcmDiag(ab), abSol(sh, 'lcm'), ['Use every prime in <b>either</b> number, each at the <b>higher</b> exponent.'], 'LCM of a, b (exponents)'); } },
          { id: 'e3c', level: 'ADV', make: function (r, sh) {
            var p = sh.p, q = sh.q, other = [13, 17].filter(function (x) { return x !== p && x !== q; })[0];
            return P.mc(r, 'Why does the prime ' + t(p) + ' appear in the LCM but not in the GCF?', [
              { html: t(p) + ' divides ' + t('a') + ' but not ' + t('b') + ' (in ' + t('b') + ' its exponent is ' + t('0') + '). The GCF takes the <b>lower</b> exponent, ' + t('0') + ', so no ' + t(p) + '; the LCM takes the <b>higher</b> exponent, ' + t('1') + ', so it keeps one ' + t(p) + '.', right: true },
              { html: t(p) + ' is prime, and the GCF can only be built from composite numbers.', why: 'The GCF here, ' + t(K.fac(gcfA(abOf(sh)))) + ', is built from primes. Look at which number ' + t(p) + ' appears in.' },
              { html: 'The LCM is bigger than the GCF, so any prime can be put into the LCM.', why: 'Not any prime — ' + t(other) + ' isn’t in the LCM. The LCM uses exactly the primes that appear in at least one of the numbers.' },
              { html: t(p) + ' appears in both numbers, but the GCF only uses primes that have the same exponent in both.', why: 'Look again at ' + t('b=' + texE([2, 3, q], [sh.k, sh.l, 1])) + ': there is no factor of ' + t(p) + ' in ' + t('b') + ' at all.' }],
              'A factor of both numbers can’t use a prime that ' + t('b') + ' doesn’t have, so the GCF (lower exponent, ' + t('0') + ') has no ' + t(p) + '. A multiple of ' + t('a') + ' must contain ' + t('a') + '’s ' + t(p) + ', so the LCM (higher exponent, ' + t('1') + ') has one ' + t(p) + '.',
              ['What is the exponent of ' + t(p) + ' in ' + t('b') + '?'], 'why ' + p + ' in LCM not GCF');
          } }] },
      { num: '4', stem: 'Factor each group into primes, write the factorizations in exponent form, and then state both the GCF and the LCM.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) {
          return gcfLcmFields(find(r, function () { var g = r.pick([18, 12, 30, 20]), m = sortN(r.sample([3, 5, 7, 11, 13, 15], 3)); return m.map(function (x) { return g * x; }).concat(m); }, function (v) { return gcfA(v.slice(3)) === 1 && v[0] >= 100 && v[2] <= 400 && lcmA(v.slice(0, 3)) <= 99999; }, [126, 198, 270]).slice(0, 3));
        } },
        { id: 'e4b', level: 'PRG', make: function (r) {
          return gcfLcmFields(find(r, function () { var g = r.pick([120, 60, 72, 90]), m = sortN(r.sample([2, 3, 4, 5, 6], 3)); return m.map(function (x) { return g * x; }).concat(m); }, function (v) { return gcfA(v.slice(3)) === 1 && v[2] <= 999; }, [240, 360, 600]).slice(0, 3));
        } }] },
      { num: '5', stem: function (sh) { return 'Two numbers are ' + t('m=2^{' + sh.A + '}\\times 3^{\\,p}\\times 5^{\\,q}') + ' and ' + t('n=2^{\\,r}\\times 3^{' + sh.B + '}\\times 5^{' + sh.C + '}') + '. Their GCF is ' + t(texE([2, 3, 5], [sh.r, sh.B, sh.q])) + ' and their LCM is ' + t(texE([2, 3, 5], [sh.A, sh.p, sh.C])) + '.'; },
        shared: function (r) {
          return find(r, function () { var A = r.int(3, 5), B = r.int(1, 3), C = r.int(2, 4); return { A: A, r: r.int(1, A - 1), B: B, p: r.int(B + 1, 6), C: C, q: r.int(1, C - 1) }; },
            function (s) { return fromExps([2, 3, 5], [s.A, s.p, s.q]) <= 99999 && fromExps([2, 3, 5], [s.r, s.B, s.C]) <= 99999; }, { A: 4, r: 2, B: 2, p: 5, C: 3, q: 1 });
        },
        parts: [
          { id: 'e5a', level: 'ADV', make: function (r, sh) {
            var hint = function (letter, prime, known, viaGcf) { return function (v) { if (v === known) return { code: 'known-exp', hint: 'If ' + t(letter) + ' were ' + t(known) + ', the ' + (viaGcf ? 'GCF' : 'LCM') + ' would contain ' + t(prime + '^{' + known + '}') + '. The ' + (viaGcf ? 'GCF takes the <b>lower</b>' : 'LCM takes the <b>higher</b>') + ' of the two exponents on ' + t(prime) + '.' }; return null; }; };
            return P.fields('Find ' + t('p') + ', ' + t('q') + ', and ' + t('r') + '.', [{ name: 'p', before: t('p=') }, { name: 'q', before: t('q=') }, { name: 'r', before: t('r=') }],
              [K.number(sh.p, hint('p', 3, sh.B, false)), K.number(sh.q, hint('q', 5, sh.C, true)), K.number(sh.r, hint('r', 2, sh.A, true))], [String(sh.p), String(sh.q), String(sh.r)],
              t('p=' + sh.p + ',\\ q=' + sh.q + ',\\ r=' + sh.r),
              'Match the exponents prime by prime.<br>' + t('2') + ': the GCF has ' + t('2^{' + sh.r + '}') + ', the lower of ' + t(sh.A) + ' and ' + t('r') + '. Since ' + t(sh.A + '\\ne ' + sh.r) + ', ' + t('r=' + sh.r) + '.<br>' + t('3') + ': the LCM has ' + t('3^{' + sh.p + '}') + ', the higher of ' + t('p') + ' and ' + t(sh.B) + ', so ' + t('p=' + sh.p) + '.<br>' + t('5') + ': the GCF has ' + t('5^{' + sh.q + '}') + ', the lower of ' + t('q') + ' and ' + t(sh.C) + ', so ' + t('q=' + sh.q) + '.',
              ['For each prime, the GCF shows the lower exponent and the LCM the higher one.', 'If the known exponent doesn’t match the GCF’s, the unknown must be the GCF’s exponent.'], 'find p, q, r');
          } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) {
            var m = fromExps([2, 3, 5], [sh.A, sh.p, sh.q]), n = fromExps([2, 3, 5], [sh.r, sh.B, sh.C]);
            var sw = function (other) { return function (v) { return v === other ? { code: 'swapped', hint: 'That’s the other number. Check which one is ' + t('m') + ' and which is ' + t('n') + '.' } : null; }; };
            return P.fields('State ' + t('m') + ' and ' + t('n') + ' as whole numbers.', [{ name: 'm', before: t('m=') }, { name: 'n', before: t('n=') }], [K.number(m, sw(n)), K.number(n, sw(m))], [String(m), String(n)],
              t('m=' + F(m) + ',\\ n=' + F(n)), t('m=' + texE([2, 3, 5], [sh.A, sh.p, sh.q]) + '=' + F(m)) + '<br>' + t('n=' + texE([2, 3, 5], [sh.r, sh.B, sh.C]) + '=' + F(n)),
              ['Put your values of ' + t('p') + ', ' + t('q') + ', ' + t('r') + ' into the factorizations and multiply.'], 'm and n');
          } },
          { id: 'e5c', level: 'MAS', make: function (r, sh) {
            return P.mc(r, 'How did the GCF tell you ' + t('r') + ' before the LCM did?', [
              { html: 'The GCF’s exponent on ' + t('2') + ' is the <b>lower</b> of ' + t(sh.A) + ' and ' + t('r') + '; it is ' + t(sh.r) + ', not ' + t(sh.A) + ', so ' + t('r=' + sh.r) + '. The LCM’s exponent is the higher one, ' + t(sh.A) + ', which is true for any ' + t('r') + ' from ' + t('0') + ' to ' + t(sh.A) + ' — so the LCM can’t pin ' + t('r') + ' down.', right: true },
              { html: 'The GCF is always smaller than the LCM, so it always gives the smaller exponents like ' + t('r') + '.', why: 'Size isn’t the reason. Compare what the GCF and the LCM each tell you about the exponent on ' + t('2') + '.' },
              { html: 'The LCM’s exponent on ' + t('2') + ' is ' + t(sh.A) + ', so the LCM shows that ' + t('r=' + sh.A) + '.', why: 'If ' + t('r') + ' were ' + t(sh.A) + ', both numbers would contain ' + t('2^{' + sh.A + '}') + ' and so would the GCF. The LCM only says the <b>larger</b> exponent is ' + t(sh.A) + '.' },
              { html: t('r') + ' is in ' + t('n') + ', and the GCF always takes its exponents from ' + t('n') + '.', why: 'The GCF takes the lower exponent of each prime, from whichever number has it: for ' + t('5') + ' it comes from ' + t('m') + ' (' + t('5^{' + sh.q + '}') + ').' }],
              'For the prime ' + t('2') + ': GCF exponent = lower of ' + t(sh.A) + ' and ' + t('r') + ' = ' + t(sh.r) + '. Since ' + t(sh.A + '\\ne ' + sh.r) + ', it must be ' + t('r') + ': ' + t('r=' + sh.r) + '. The LCM exponent = higher of ' + t(sh.A) + ' and ' + t('r') + ' = ' + t(sh.A) + ' — true for every ' + t('r\\le ' + sh.A) + ', so it can’t decide ' + t('r') + '.',
              ['Which of the two, the GCF or the LCM, shows the <b>smaller</b> exponent on ' + t('2') + '?'], 'GCF pins r');
          } }] },
      { num: '6', section: 'Extra practice B — The identity GCF × LCM = ab', stem: 'For any two whole numbers ' + t('a') + ' and ' + t('b') + ', ' + t('\\text{GCF}(a,b)\\times\\text{LCM}(a,b)=a\\times b') + '. Test it.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var ab = find(r, function () { return sortN(r.sample(range(40, 120), 2)); }, function (v) { var g = gcd(v[0], v[1]); return g >= 4 && g <= 15 && noneDivides(v); }, [84, 90]), a = ab[0], b = ab[1], g = gcd(a, b), L = lcm(a, b);
          var p = P.fields(t('a=' + a) + ', ' + t('b=' + b) + ': find the GCF and the LCM, multiply them, and compare with ' + t('a\\times b') + '.',
            [{ name: 'GCF', before: t('\\text{GCF}=') }, { name: 'LCM', before: t('\\text{LCM}=') }, { name: 'GCF × LCM', before: t('\\text{GCF}\\times\\text{LCM}=') }, { name: 'a × b', before: t('a\\times b=') }],
            [K.number(g, gcfDiag(ab)), K.number(L, lcmDiag(ab)), K.number(g * L), K.number(a * b)], [String(g), String(L), String(g * L), String(a * b)],
            t('\\text{GCF}=' + g + ',\\ \\text{LCM}=' + F(L)) + '; both products are ' + t(F(a * b)) + '.',
            facLines(ab) + '.<br>' + t('\\text{GCF}=' + eqv(g)) + ', ' + t('\\text{LCM}=' + eqv(L)) + '.<br>' + t(g + '\\times ' + F(L) + '=' + F(g * L)) + ' and ' + t(a + '\\times ' + b + '=' + F(a * b)) + ': equal ✓',
            ['Factor both numbers first.'], 'test identity ' + a + ', ' + b);
          p.bad = [[String(L), String(g), String(g * L), String(a * b)]];
          return p;
        } },
        { id: 'e6b', level: 'ADV', make: function (r) {
          var sh = find(r, function () { var pq = r.sample([5, 7, 11], 2); return { i: r.int(3, 5), k: r.int(1, 2), j: r.int(1, 2), l: r.int(3, 5), p: pq[0], q: pq[1] }; }, function (s) { var ab = abOf(s); return ab[0] * ab[1] < 1e9; }, { i: 4, j: 2, p: 5, k: 2, l: 5, q: 7 });
          var ab = abOf(sh), g = gcfA(ab), L = lcmA(ab), P2 = ab[0] * ab[1];
          var p = P.fields(t('a=' + texE([2, 3, sh.p], [sh.i, sh.j, 1])) + ', ' + t('b=' + texE([2, 3, sh.q], [sh.k, sh.l, 1])) + ': find the GCF and the LCM as whole numbers, then write ' + t('\\text{GCF}\\times\\text{LCM}') + ' (which should equal ' + t('a\\times b') + ') in exponent form.',
            [{ name: 'GCF', before: t('\\text{GCF}=') }, { name: 'LCM', before: t('\\text{LCM}=') }, { name: 'GCF × LCM', before: t('\\text{GCF}\\times\\text{LCM}='), mode: 'text', wide: true, placeholder: 'exponent form' }],
            [K.number(g, gcfDiag(ab)), K.number(L, lcmDiag(ab)), expChk(P2, null)], [String(g), String(L), plainFac(P2)],
            t('\\text{GCF}=' + F(g) + ',\\ \\text{LCM}=' + F(L)) + '; ' + t('\\text{GCF}\\times\\text{LCM}=a\\times b=' + K.fac(P2)),
            abSol(sh, 'gcf') + '<br>' + abSol(sh, 'lcm') + '<br>' + t(F(g) + '\\times ' + F(L) + '=' + F(P2)) + ', and ' + t(F(ab[0]) + '\\times ' + F(ab[1]) + '=' + F(P2)) + ' ✓<br>In exponent form, add the exponents: ' + t(K.fac(P2)) + '.',
            ['GCF: lower exponents of shared primes. LCM: higher exponents of all primes.', 'When you multiply powers of the same prime, add the exponents.'], 'identity in exponent form');
          return p;
        } }] },
      { num: '7', stem: 'Use ' + t('\\text{GCF}\\times\\text{LCM}=a\\times b') + ' — listing multiples is not necessary.', parts: [
        { id: 'e7a', level: 'ADV', make: function (r) { return otherNumberPart(r, [12, 6, 8, 10, 14], gxPair(r, [12, 6, 8, 10, 14], range(2, 7), 12, 200, [36, 60, 12]), r.chance(0.6) ? 0 : 1); } },
        { id: 'e7b', level: 'PRG', make: function (r) {
          var v = gxPair(r, [12, 6, 8, 15, 18], range(2, 15), 30, 300, [48, 180, 12]), a = v[0], b = v[1], g = v[2], L = lcm(a, b);
          return P.number('The GCF of ' + t(a) + ' and ' + t(b) + ' is ' + t(g) + '. Find their LCM.', L, function (x) {
            if (x === a * b) return { code: 'no-divide', hint: 'That’s ' + t('a\\times b') + ' — which equals GCF × LCM. Divide by the GCF.' };
            if (x === a * b / (g * g)) return { code: 'value', hint: 'Divide ' + t('a\\times b') + ' by the GCF just once.' };
            return null;
          }, t(g + '\\times\\text{LCM}=' + a + '\\times ' + b + '=' + F(a * b)) + ', so ' + t('\\text{LCM}=' + F(a * b) + '\\div ' + g + '=' + F(L)) + '.', ['Multiply the two numbers, then divide by the GCF.'], 'LCM from identity ' + a + ', ' + b, { before: t('\\text{LCM}=') });
        } },
        { id: 'e7c', level: 'ADV', make: function (r) {
          var v = gxPair(r, [12, 6, 8, 10, 14], range(2, 9), 20, 200, [36, 84, 12]), g = v[2], Pd = v[0] * v[1], L = Pd / g;
          return P.number('Two numbers have a product of ' + t(F(Pd)) + ' and a GCF of ' + t(g) + '. Find their LCM.', L, function (x) {
            if (x === Pd * g) return { code: 'no-divide', hint: 'GCF × LCM = product, so the LCM is the product <b>divided</b> by the GCF.' };
            if (x === Pd / (g * g)) return { code: 'value', hint: 'Divide the product by the GCF only once.' };
            return null;
          }, t(g + '\\times\\text{LCM}=' + F(Pd)) + ', so ' + t('\\text{LCM}=' + F(Pd) + '\\div ' + g + '=' + F(L)) + '.', ['The product ' + t('a\\times b') + ' is given. Use GCF × LCM = ' + t('a\\times b') + '.'], 'LCM from product ' + Pd + ', GCF ' + g, { before: t('\\text{LCM}=') });
        } },
        { id: 'e7d', level: 'ADV', make: function (r) { return otherNumberPart(r, [15, 9, 10, 14, 21, 6], gxPair(r, [15, 9, 10, 14, 21, 6], range(2, 5), 10, 200, [30, 45, 15]), r.chance(0.6) ? 0 : 1); } }] },
      { num: '8', stem: 'Why must the identity be true? Pick any prime ' + t('p') + ' and suppose it appears ' + t('m') + ' times in ' + t('a') + ' and ' + t('n') + ' times in ' + t('b') + '.', parts: [
        { id: 'e8', level: 'MAS', make: function (r) {
          var ex = r.pick([[3, 1], [2, 5], [4, 2], [1, 3]]);
          return P.mc(r, 'Which explanation is correct?', [
            { html: 'The GCF gets ' + t('p') + ' the <b>smaller</b> of ' + t('m') + ' and ' + t('n') + ' times, the LCM the <b>larger</b> number of times. One of ' + t('m, n') + ' is the smaller and the other the larger, so together they hold ' + t('p') + ' exactly ' + t('m+n') + ' times — the same as ' + t('a\\times b') + '.', right: true },
            { html: 'The GCF gets ' + t('p') + ' ' + t('m') + ' times (from ' + t('a') + ') and the LCM gets it ' + t('n') + ' times (from ' + t('b') + '), so together ' + t('m+n') + ' times.', why: 'The GCF doesn’t simply take ' + t('a') + '’s exponent — it takes the <b>smaller</b> of ' + t('m') + ' and ' + t('n') + ', and the LCM the larger. Why does that still add to ' + t('m+n') + '?' },
            { html: 'The GCF and the LCM each contain ' + t('p') + ' exactly ' + t('m+n') + ' times.', why: 'Then GCF × LCM would contain ' + t('p') + ' ' + t('2(m+n)') + ' times — twice as many as ' + t('a\\times b') + '.' },
            { html: 'The GCF gets ' + t('p') + ' the smaller of ' + t('m') + ' and ' + t('n') + ' times, and the LCM gets it ' + t('m+n') + ' times.', why: 'The LCM only needs the <b>larger</b> exponent to be a multiple of both numbers.' }],
            'A factor of both numbers can use ' + t('p') + ' at most ' + t('\\min(m,n)') + ' times; a multiple of both needs ' + t('\\max(m,n)') + '. Since ' + t('\\min(m,n)+\\max(m,n)=m+n') + ', GCF × LCM contains ' + t('p') + ' exactly as often as ' + t('a\\times b') + '. Example: ' + t('m=' + ex[0] + ',\\ n=' + ex[1]) + ': GCF has ' + t('p^{' + Math.min(ex[0], ex[1]) + '}') + ', LCM has ' + t('p^{' + Math.max(ex[0], ex[1]) + '}') + ', and ' + t(Math.min(ex[0], ex[1]) + '+' + Math.max(ex[0], ex[1]) + '=' + (ex[0] + ex[1])) + '. This holds for every prime, so the two products are equal.',
            ['Try an example: ' + t('m=' + ex[0]) + ', ' + t('n=' + ex[1]) + '. How many times does ' + t('p') + ' appear in the GCF? In the LCM?'], 'why GCF×LCM=ab');
        } }] },
      { num: '9', stem: 'Two more consequences to think through.', parts: [
        { id: 'e9a', level: 'ADV', make: function (r) {
          var gl = r.pick([[8, 60], [6, 45], [12, 90], [10, 75], [16, 120], [4, 30], [8, 100], [12, 150]]), g = gl[0], L = gl[1];
          return P.mc(r, 'Ravi claims two whole numbers can have a GCF of ' + t(g) + ' and an LCM of ' + t(L) + '. Why is this impossible?', [
            { html: t(L + '\\div ' + g + '=' + (L / g)) + ', so ' + t(g) + ' doesn’t divide ' + t(L) + '. The GCF divides ' + t('a') + ', and ' + t('a') + ' divides the LCM, so the <b>GCF must always divide the LCM</b>.', right: true },
            { html: 'The GCF must be less than half of the LCM.', why: t(g) + ' already is less than half of ' + t(L) + ', so that can’t be what goes wrong. Does ' + t(g) + ' divide ' + t(L) + '?' },
            { html: 'The GCF and the LCM can’t have any common factor.', why: 'They can: ' + t('12') + ' and ' + t('18') + ' have GCF ' + t('6') + ' and LCM ' + t('36') + ', which share factors. Does ' + t(g) + ' divide ' + t(L) + '?' },
            { html: 'The LCM must be a perfect square.', why: t('4') + ' and ' + t('6') + ' have LCM ' + t('12') + ', which isn’t a perfect square.' }],
            'The GCF divides ' + t('a') + ' and ' + t('a') + ' divides the LCM, so the GCF must divide the LCM. ' + t(L + '\\div ' + g + '=' + (L / g)) + ' is not a whole number, so the pair is impossible. Rule broken: <b>the GCF is always a factor of the LCM</b>.',
            ['Does ' + t(g) + ' divide evenly into ' + t(L) + '?'], 'impossible GCF ' + g + ' LCM ' + L);
        } },
        { id: 'e9b', level: 'ADV', make: function (r) {
          var abc = find(r, function () { return sortN(r.sample(range(2, 20), 3)); }, function (v) { return gcfA(v) >= 2 && noneDivides(v) && gcfA(v) * lcmA(v) !== prodOf(v); }, [4, 6, 10]);
          var g = gcfA(abc), L = lcmA(abc), Pd = prodOf(abc);
          var p = P.fields('Does the identity extend to three numbers — is ' + t('\\text{GCF}(a,b,c)\\times\\text{LCM}(a,b,c)=abc') + '? Test it on ' + nlist(abc) + '.',
            [{ name: 'GCF × LCM', before: t('\\text{GCF}\\times\\text{LCM}=') }, { name: 'abc', before: t('a\\times b\\times c=') }, { name: 'Does it hold?', label: 'Does the identity hold for three numbers?', mode: 'text', placeholder: 'yes or no' }],
            [K.number(g * L, function (v) { return v === L ? { code: 'value', hint: 'Multiply the LCM by the GCF.' } : null; }), K.number(Pd), yesNoChk(false, 'Compare your two products: are they equal?', '')], [String(g * L), String(Pd), 'no'],
            t('\\text{GCF}\\times\\text{LCM}=' + F(g * L)) + ', ' + t('abc=' + F(Pd)) + '; <b>no</b>.',
            facLines(abc) + '.<br>' + t('\\text{GCF}=' + g + ',\\ \\text{LCM}=' + eqv(L)) + ', so ' + t('\\text{GCF}\\times\\text{LCM}=' + F(g * L)) + '.<br>' + t(abc.join('\\times ') + '=' + F(Pd)) + '.<br>' + t(F(g * L) + '\\ne ' + F(Pd)) + ', so <b>no</b> — the identity holds for two numbers only.',
            ['Find the GCF and the LCM of all three numbers, then compare the two products.'], 'identity for three numbers');
          p.bad = [[String(g * L), String(Pd), 'yes']];
          return p;
        } }] },
      { num: '10', section: 'Extra practice C — Perfect squares and cubes from the exponents', stem: 'A number is a perfect square exactly when every exponent in its prime factorization is even, and a perfect cube exactly when every exponent is a multiple of ' + t('3') + '. Decide: square, cube, both, or neither? Give each root that exists (exponent form is fine); type <b>none</b> for a root that isn’t a whole number.', parts: [
        { id: 'e10a', level: 'ADV', make: function (r) { return sqCubePart(r, function (es) { return es.every(function (e) { return e % 2 === 0; }) && es.some(function (e) { return e % 3; }); }, [2, 4, 6, 8], [6, 4]); } },
        { id: 'e10b', level: 'ADV', make: function (r) { return sqCubePart(r, function (es) { return es.every(function (e) { return e % 3 === 0; }) && es.some(function (e) { return e % 2; }); }, [3, 6, 9], [9, 3]); } },
        { id: 'e10c', level: 'MAS', make: function (r) { return sqCubePart(r, function (es) { return es.every(function (e) { return e % 6 === 0; }); }, [6, 12], [6, 12]); } },
        { id: 'e10d', level: 'ADV', make: function (r) { return sqCubePart(r, function (es) { return es.some(function (e) { return e % 2; }) && es.some(function (e) { return e % 3; }); }, [1, 2, 3, 4], [4, 3, 2], 3); } }] },
      { num: '11', stem: 'Find the <b>smallest whole number</b> each must be multiplied by to give a perfect square, and state the square root of the result. (Raise each odd exponent to the next even number — nothing more.)', parts: [
        { id: 'e11a', level: 'ADV', make: function (r) {
          var v = find(r, function () { var ps = r.pick([[2, 3, 7], [2, 3, 5], [2, 5, 7], [3, 5, 7]]), es = r.shuffle([r.pick([1, 3, 5]), r.pick([1, 3, 5]), r.pick([2, 4])]); return { ps: ps, es: es, n: fromExps(ps, es) }; }, function (v) { return v.n >= 1000 && v.n * multFor(v.n, 2) <= 5e6; }, { ps: [2, 3, 7], es: [3, 5, 2], n: 95256 });
          return multPart(v.n, 2, t(texE(v.ps, v.es)));
        } },
        { id: 'e11b', level: 'ADV', make: function (r) { var n = r.pick([540, 1350, 600, 1500, 2160]); return multPart(n, 2, t(F(n))); } },
        { id: 'e11c', level: 'ADV', make: function (r) { var n = r.pick([1176, 1512, 980, 1960, 2058, 392]); return multPart(n, 2, t(F(n))); } }] },
      { num: '12', stem: 'Now find the smallest whole number each must be multiplied by to give a perfect <b>cube</b>, and state the cube root of the result.', parts: [
        { id: 'e12a', level: 'ADV', make: function (r) {
          var v = find(r, function () { var ps = r.pick([[2, 3, 7], [2, 3, 5], [2, 5, 7]]), es = r.shuffle([3, r.pick([4, 5]), r.pick([1, 2])]); return { ps: ps, es: es, n: fromExps(ps, es) }; }, function (v) { return v.n * multFor(v.n, 3) <= 3e7; }, { ps: [2, 3, 7], es: [3, 5, 2], n: 95256 });
          return multPart(v.n, 3, t(texE(v.ps, v.es)));
        } },
        { id: 'e12b', level: 'ADV', make: function (r) { var n = r.pick([540, 1350, 600, 1500, 2160]); return multPart(n, 3, t(F(n))); } },
        { id: 'e12c', level: 'ADV', make: function (r) { var n = r.pick([2205, 1575, 2450, 980, 1100]); return multPart(n, 3, t(F(n))); } }] },
      { num: '13', stem: function (sh) { return 'Dividing works the same way — strip off just enough to leave the exponents where you need them. Use ' + t(F(sh.n)) + ' for parts (a) and (b).'; },
        shared: function (r) { var pq = r.pick([[2, 5], [2, 5], [2, 3], [3, 2], [2, 7], [5, 2], [3, 5]]); return { p: pq[0], q: pq[1], n: Math.pow(pq[0], 4) * Math.pow(pq[1], 3) }; },
        parts: [
          { id: 'e13a', level: 'ADV', make: function (r, sh) { return divPart(sh.n, 2); } },
          { id: 'e13b', level: 'ADV', make: function (r, sh) { return divPart(sh.n, 3); } },
          { id: 'e13c', level: 'MAS', make: function (r) {
            var n = r.pick([72, 108, 200, 48, 500, 98]), m = multFor(n, 6), s2 = multFor(n, 2), s3 = multFor(n, 3), N = n * m;
            return P.number('Find the smallest whole number ' + t(n) + ' must be <b>multiplied</b> by to give a number that is <i>both</i> a perfect square and a perfect cube.', m, function (v) {
              if (v === s2) return { code: 'made-square', hint: t(n + '\\times ' + v) + ' is a perfect square, but not a perfect cube. Both at once needs every exponent to be a multiple of ' + t('6') + '.' };
              if (v === s3) return { code: 'made-cube', hint: t(n + '\\times ' + v) + ' is a perfect cube, but not a perfect square. Both at once needs every exponent to be a multiple of ' + t('6') + '.' };
              if (v > 0 && v % 1 === 0 && intRoot(n * v, 6) != null) return { code: 'not-smallest', hint: 'That works, but it isn’t the smallest. Raise each exponent only to the next multiple of ' + t('6') + '.' };
              return null;
            }, t(n + '=' + K.fac(n)) + '. Square <b>and</b> cube means every exponent must be a multiple of ' + t('6') + '. ' + nt.factor(n).map(function (pe) { return t(pe[0] + '^{' + pe[1] + '}\\to ' + pe[0] + '^{6}') + ' needs ' + t(pe[0] + (6 - pe[1] > 1 ? '^{' + (6 - pe[1]) + '}' : '')); }).join('; ') + '.<br>Multiply by ' + t(eqv(m)) + ': ' + t(n + '\\times ' + F(m) + '=' + F(N) + '=' + K.fac(N)) + ' (square root ' + t(F(intRoot(N, 2))) + ', cube root ' + t(F(intRoot(N, 3))) + ').',
            ['For both a square and a cube, every exponent must be a multiple of what number?'], 'multiply to square and cube: ' + n, { before: t(n + '\\times') });
          } }] },
      { num: '14', section: 'Extra practice D — Which tool: GCF or LCM?', stem: function (sh) { return 'A rectangular sheet of veneer measures ' + t(sh.a) + ' cm by ' + t(sh.b) + ' cm. It is to be cut into identical square tiles with no material left over.'; },
        shared: function (r) { var v = gxPair(r, [36, 12, 18, 24, 30, 20], range(2, 12), 100, 400, [180, 252, 36]); return { a: v[0], b: v[1], g: v[2] }; },
        parts: [
          { id: 'e14a', level: 'PRG', make: function (r, sh) {
            return P.number('What is the largest possible side length of a tile?', sh.g, gcfDiag([sh.a, sh.b]), 'The side must divide both ' + t(sh.a) + ' and ' + t(sh.b) + ' evenly and be as large as possible: the GCF.<br>' + gcfSol([sh.a, sh.b]) + '<br><b>' + sh.g + ' cm</b>', ['The tile has to fit evenly into both sides.'], 'veneer tile ' + sh.a + '×' + sh.b, { after: 'cm' });
          } },
          { id: 'e14b', level: 'PRG', make: function (r, sh) {
            var x = sh.a / sh.g, y = sh.b / sh.g;
            return P.number('How many tiles does the sheet produce at that size?', x * y, function (v) {
              if (v === x + y) return { code: 'added', hint: 'Those are the tiles along each side. The tiles form a grid, so multiply.' };
              if (v === sh.a * sh.b / sh.g) return { code: 'area-by-side', hint: 'Divide the sheet’s area by the tile’s <b>area</b>, not its side length.' };
              return null;
            }, t(sh.a + '\\div ' + sh.g + '=' + x) + ' and ' + t(sh.b + '\\div ' + sh.g + '=' + y) + ', so ' + t(x + '\\times ' + y + '=' + x * y) + ' tiles. Check: ' + t(x * y + '\\times ' + sh.g + '^{2}=' + F(x * y * sh.g * sh.g) + '=' + sh.a + '\\times ' + sh.b) + ' ✓', ['How many tiles fit along each side?'], 'veneer tile count', { after: 'tiles' });
          } },
          { id: 'e14c', level: 'ADV', make: function (r, sh) {
            var L = lcm(sh.a, sh.b);
            return P.mc(r, 'Why does the GCF — and not the LCM — answer this question?', [
              { html: 'The tile side has to fit <b>into</b> both ' + t(sh.a) + ' and ' + t(sh.b) + ' with nothing left over, so it is a common <b>factor</b>; we want the largest one. The LCM (' + t(F(L)) + ' cm) is longer than the sheet itself.', right: true },
              { html: 'The GCF is always the bigger of the two, and we want the biggest tile.', why: 'The GCF is never bigger than the LCM. Here the LCM is ' + t(F(L)) + ' — would that tile fit on the sheet?' },
              { html: 'The LCM only works for times, never for lengths.', why: 'The LCM can describe lengths too (e.g. stacking blocks to equal heights). What matters is whether the tile fits <b>into</b> the sides or the sides fit into it.' },
              { html: 'Both would work; the GCF is just easier to calculate.', why: 'A tile ' + t(F(L)) + ' cm wide wouldn’t even fit on the sheet.' }],
              'The tile side must divide evenly into both sides: a common <b>factor</b>, and the largest one is the GCF. The LCM is a common <b>multiple</b> — at least as long as the longer side (' + t(F(L)) + ' cm here) — so it can’t be a tile that fits on the sheet.',
              ['Does the tile fit <b>into</b> the sides, or do the sides fit into it?'], 'why GCF for tiles');
          } }] },
      { num: '15', stem: function (sh) { return 'Three bus routes all leave the terminal together at ' + fmtTime(sh.start) + ' Route A departs every ' + t(sh.v[0]) + ' minutes, Route B every ' + t(sh.v[1]) + ' minutes, and Route C every ' + t(sh.v[2]) + ' minutes.'; },
        shared: function (r) { return { v: r.pick([[24, 36, 40], [20, 30, 45], [12, 18, 40], [15, 20, 36], [30, 40, 45], [18, 24, 40]]), start: r.pick([360, 360, 390, 420]) }; },
        parts: [
          { id: 'e15a', level: 'PRG', make: function (r, sh) {
            var v = sh.v, L = lcmA(v), E = sh.start + L, g = gcfA(v), pr = prodOf(v);
            var p = P.fields('At what time do all three next leave together?', [{ name: 'Time', label: 'Time', mode: 'text', placeholder: 'e.g. 9:45 a.m.' }],
              [timeChk(E, sh.start, L, [{ add: g, code: 'gave-gcf', hint: 'No bus leaves only ' + t(g) + ' minutes after the start. A shared departure is a common <b>multiple</b>.' }, { add: pr, code: 'lcm-product', hint: 'Multiplying the three intervals gives <i>a</i> common multiple, but not the first one. Find the LCM.' }])],
              [fmtTime(E)], timeHtml(E),
              'A shared departure is a common multiple of ' + nlist(v) + '; the first one is the LCM.<br>' + facLines(v) + ', so ' + t('\\text{LCM}=' + eqv(L)) + ' min = ' + hm(L) + '.<br>' + fmtTime(sh.start) + ' + ' + hm(L) + ' = <b>' + timeHtml(E) + '</b>',
              ['Find the LCM of the three intervals, in minutes.', 'Then add it to ' + fmtTime(sh.start)], 'three buses ' + v.join(','));
            p.bad = [[fmtTime(sh.start + g)]];
            return p;
          } },
          { id: 'e15b', level: 'PRG', make: function (r, sh) {
            var v = sh.v, L = lcmA(v);
            return P.fields('How many departures has each route made by that moment (not counting the one at ' + fmtTime(sh.start) + ')?', [{ name: 'Route A', before: 'A:' }, { name: 'Route B', before: 'B:' }, { name: 'Route C', before: 'C:' }],
              v.map(function (x) { return K.number(L / x, function (q) { return q === L / x + 1 ? { code: 'value', hint: 'Don’t count the departure at ' + fmtTime(sh.start) } : null; }); }), v.map(function (x) { return String(L / x); }),
              'A: ' + t(L / v[0]) + ', B: ' + t(L / v[1]) + ', C: ' + t(L / v[2]),
              v.map(function (x, i) { return 'ABC'[i] + ': ' + t(L + '\\div ' + x + '=' + L / x); }).join('<br>'), ['Divide the time until they meet again (the LCM) by each route’s interval.'], 'departures by LCM');
          } },
          { id: 'e15c', level: 'ADV', make: function (r, sh) {
            var v = sh.v, g = gcfA(v);
            return P.mc(r, 'Why does the LCM — and not the GCF — answer this question?', [
              { html: 'Each route leaves only at multiples of its own interval, so a time when all three leave is a common <b>multiple</b>; the first one is the LCM. The GCF (' + t(g) + ' min) is a common factor — no bus leaves ' + t(g) + ' minutes after the start.', right: true },
              { html: 'The LCM is always used for problems about time.', why: 'It isn’t about time: it’s about whether the answer is a <b>multiple</b> of the intervals or a <b>factor</b> of them.' },
              { html: 'The GCF would give the same time, but the LCM is easier.', why: 'The GCF is ' + t(g) + ' minutes — none of the buses leaves then.' },
              { html: 'We want the largest number that divides all three intervals.', why: 'That describes the GCF. The buses meet at a time that all three intervals divide <b>into</b>.' }],
              'Departures happen at multiples of each interval, so a shared departure is a common multiple, and the first one is the LCM. The GCF (' + t(g) + ' min) is a common factor — not a departure time at all.',
              ['Is the meeting time a multiple of the intervals, or a factor of them?'], 'why LCM for buses');
          } }] },
      { num: '16', stem: 'Decide which tool each situation calls for (write <b>GCF</b> or <b>LCM</b>), then answer.', parts: [
        { id: 'e16a', level: 'ADV', make: function (r) {
          var v = gxPair(r, [24, 18, 12, 30, 36], range(4, 11), 100, 400, [168, 216, 24]), a = v[0], b = v[1], g = v[2], n = a / g + b / g;
          var p = P.fields('Two rolls of ribbon, ' + t(a) + ' cm and ' + t(b) + ' cm, are cut into equal-length pieces that are as long as possible, with none wasted. How long is each piece, and how many pieces are there altogether?',
            [{ name: 'Tool', label: 'Tool', mode: 'text', placeholder: 'GCF or LCM' }, { name: 'Length', label: 'Each piece', after: 'cm' }, { name: 'Pieces', label: 'Pieces altogether' }],
            [toolChk('gcf'), K.number(g, gcfDiag([a, b])), K.number(n, function (x) { return x === (a / g) * (b / g) ? { code: 'added', hint: 'The pieces from the two rolls are separate, so <b>add</b> them.' } : null; })], ['GCF', String(g), String(n)],
            'GCF; ' + t(g) + ' cm; ' + t(n) + ' pieces',
            '<b>GCF</b>: the piece length must divide both roll lengths evenly, and be as long as possible.<br>' + gcfSol([a, b]) + '<br>' + t(a + '\\div ' + g + '=' + a / g) + ' and ' + t(b + '\\div ' + g + '=' + b / g) + ', so ' + t(a / g + '+' + b / g + '=' + n) + ' pieces.',
            ['Must each piece fit <b>into</b> the rolls, or the rolls into something?'], 'ribbon GCF ' + a + ', ' + b);
          p.bad = [['LCM', String(g), String(n)]];
          return p;
        } },
        { id: 'e16b', level: 'ADV', make: function (r) {
          var ab = find(r, function () { return sortN(r.sample(range(40, 100), 2)); }, function (v) { var L = lcm(v[0], v[1]); return gcd(v[0], v[1]) >= 6 && L <= 720 && L / v[1] >= 3 && noneDivides(v); }, [72, 90]), a = ab[0], b = ab[1], L = lcm(a, b);
          var p = P.fields('Two runners start together at the start line of a track. One laps in ' + t(a) + ' seconds, the other in ' + t(b) + ' seconds. When do they next cross the line together, and how many laps has each run by then?',
            [{ name: 'Tool', label: 'Tool', mode: 'text', placeholder: 'GCF or LCM' }, { name: 'Time', label: 'Together again after', after: 's' }, { name: 'Laps (faster)', label: 'Laps by the ' + a + '-second runner' }, { name: 'Laps (slower)', label: 'Laps by the ' + b + '-second runner' }],
            [toolChk('lcm'), K.number(L, lcmDiag([a, b])), K.number(L / a, function (x) { return x === L / b ? { code: 'swapped', hint: 'The faster runner (' + a + ' s per lap) runs <b>more</b> laps.' } : null; }), K.number(L / b, function (x) { return x === L / a ? { code: 'swapped', hint: 'The slower runner runs <b>fewer</b> laps.' } : null; })],
            ['LCM', String(L), String(L / a), String(L / b)], 'LCM; ' + t(L) + ' s; ' + t(L / a) + ' and ' + t(L / b) + ' laps',
            '<b>LCM</b>: they are at the line together at a common multiple of both lap times; we want the first one.<br>' + lcmSol([a, b]) + '<br>They meet after <b>' + L + ' s</b>' + (L % 60 === 0 ? ' ' + t('=' + L / 60 + '\\text{ min}') : '') + '.<br>Laps: ' + t(L + '\\div ' + a + '=' + L / a) + ' and ' + t(L + '\\div ' + b + '=' + L / b) + '.',
            ['Is the meeting time a multiple of the lap times, or a factor of them?'], 'runners LCM ' + a + ', ' + b);
          p.bad = [['GCF', String(L), String(L / a), String(L / b)]];
          return p;
        } }] },
      { num: '17', stem: function (sh) { return 'A teacher has ' + t(sh.v[0]) + ' pencils, ' + t(sh.v[1]) + ' erasers, and ' + t(sh.v[2]) + ' stickers to divide into identical supply bags with nothing left over.'; },
        shared: function (r) {
          var v = find(r, function () { var g = r.pick([42, 24, 30, 18, 36, 12]), m = sortN(r.sample([2, 3, 4, 5, 7], 3)); return m.map(function (x) { return g * x; }).concat(m); }, function (v) { return gcfA(v.slice(3)) === 1 && v[2] <= 300; }, [84, 126, 210, 2, 3, 5]);
          return { v: v.slice(0, 3), g: gcfA(v.slice(0, 3)), yes: r.chance(0.6) };
        },
        parts: [
          { id: 'e17a', level: 'PRG', make: function (r, sh) { return P.number('What is the greatest number of bags possible?', sh.g, gcfDiag(sh.v), 'Each total must split evenly into the bags, and we want the most bags: the GCF.<br>' + gcfSol(sh.v) + ' <b>' + sh.g + ' bags</b>', ['The number of bags must divide evenly into each total.'], 'bags GCF ' + sh.v.join(','), { after: 'bags' }); } },
          { id: 'e17b', level: 'PRG', make: function (r, sh) {
            var v = sh.v, g = sh.g;
            return P.fields('What goes into each bag?', [{ name: 'Pencils', after: 'pencils' }, { name: 'Erasers', after: 'erasers' }, { name: 'Stickers', after: 'stickers' }],
              v.map(function (x) { return K.number(x / g); }), v.map(function (x) { return String(x / g); }), t(v[0] / g) + ' pencils, ' + t(v[1] / g) + ' erasers, ' + t(v[2] / g) + ' stickers',
              v.map(function (x) { return t(x + '\\div ' + g + '=' + x / g); }).join('<br>'), ['Divide each total by the number of bags.'], 'bag contents');
          } },
          { id: 'e17c', level: 'ADV', make: function (r, sh) {
            var v = sh.v, g = sh.g, facs = nt.divisors(g).filter(function (d) { return d > 1 && d < g; });
            var noK = find(r, function () { return r.int(4, Math.max(v[0], 12)); }, function (k) { return v.some(function (x) { return x % k === 0; }) && v.some(function (x) { return x % k; }) && k < g + 20; }, null);
            var yes = sh.yes || noK == null, k = yes ? r.pick(facs) : noK, bad = v.filter(function (x) { return x % k; })[0];
            var opts = yes ? [
              { html: '<b>Yes</b> — ' + t(k) + ' is a factor of ' + t(g) + ', so it divides all three totals.', right: true },
              { html: '<b>No</b> — only the GCF, ' + t(g) + ', works.', why: 'The GCF is the <b>greatest</b> number of bags; smaller numbers can work too. Does ' + t(k) + ' divide ' + nlist(v) + '?' },
              { html: '<b>No</b> — ' + t(k) + ' doesn’t divide ' + t(v[0]) + '.', why: 'Check: ' + t(v[0] + '\\div ' + k + '=' + v[0] / k) + '.' },
              { html: '<b>Yes</b> — any number of bags smaller than ' + t(g) + ' works.', why: 'Not any number: ' + t(g - 1) + ' bags wouldn’t work. ' + t(k) + ' works because it is a <b>factor</b> of ' + t(g) + '.' }]
              : [
              { html: '<b>No</b> — ' + t(k) + ' doesn’t divide ' + t(bad) + ' evenly (' + t(bad + '\\div ' + k) + ' is not a whole number).', right: true },
              { html: '<b>Yes</b> — ' + t(k) + ' divides ' + t(v.filter(function (x) { return x % k === 0; })[0]) + '.', why: 'It has to divide <b>all three</b> totals. Try ' + t(bad + '\\div ' + k) + '.' },
              { html: (k < g ? '<b>Yes</b> — ' + t(k) + ' is less than ' + t(g) + ', so it works.' : '<b>Yes</b> — more bags just means fewer things in each.'), why: 'The number of bags has to be a factor of ' + t(g) + ' (it must divide every total). Is ' + t(k) + ' a factor of ' + t(g) + '?' },
              { html: '<b>No</b> — only the GCF, ' + t(g) + ', works.', why: 'Right answer, wrong reason: any factor of ' + t(g) + ' would work. The real problem is that ' + t(k) + ' doesn’t divide ' + t(bad) + '.' }];
            return P.mc(r, 'If she wanted ' + t(k) + ' bags instead, would that work?', opts,
              yes ? t(k) + ' is a factor of ' + t(g) + ', so it divides all three totals: ' + v.map(function (x) { return t(x + '\\div ' + k + '=' + x / k); }).join(', ') + '. Any factor of the GCF works; ' + t(g) + ' is just the largest.'
                : t(bad + '\\div ' + k + '\\approx ' + (Math.round(bad / k * 100) / 100)) + ' is not a whole number, so ' + t(k) + ' bags won’t work. The number of bags must be a factor of the GCF, ' + t(g) + '.',
              ['The number of bags must divide every total. Is ' + t(k) + ' a factor of ' + t(g) + '?'], k + ' bags?');
          } }] },
      { num: '18', section: 'Extra practice E — Find the error', stem: function (sh) { return 'Asked for the GCF of ' + t('a=' + texE(sh.ps, sh.ea)) + ' and ' + t('b=' + texE(sh.ps, sh.eb)) + ', a student wrote ' + t('\\text{GCF}=' + texE(sh.ps, sh.ea.map(function (e, i) { return Math.max(e, sh.eb[i]); })) + '=' + F(fromExps(sh.ps, sh.ea.map(function (e, i) { return Math.max(e, sh.eb[i]); })))) + '.'; },
        shared: function (r) {
          return find(r, function () { var ps = r.pick([[2, 3, 5], [2, 3, 5], [2, 3, 7]]); return { ps: ps, ea: [r.int(1, 4), r.int(1, 4), r.int(1, 2)], eb: [r.int(1, 4), r.int(1, 4), r.int(1, 2)] }; },
            function (s) { var d = s.ea.map(function (e, i) { return e - s.eb[i]; }); return d.every(function (x) { return x !== 0; }) && d.some(function (x) { return x > 0; }) && d.some(function (x) { return x < 0; }) && !s.ea.every(function (e, i) { return Math.max(e, s.eb[i]) === 2 * Math.min(e, s.eb[i]); }) && fromExps(s.ps, s.ea.map(function (e, i) { return Math.max(e, s.eb[i]); })) <= 999999; },
            { ps: [2, 3, 5], ea: [3, 2, 2], eb: [2, 4, 1] });
        },
        parts: [
          { id: 'e18a', level: 'ADV', make: function (r) {
            return P.mc(r, 'What is the mistake?', [
              { html: 'The student took the <b>higher</b> exponent of each prime; the GCF needs the <b>lower</b> exponent.', right: true },
              { html: 'The student should have <b>added</b> the exponents.', why: 'Adding exponents gives ' + t('a\\times b') + ', which is even bigger. A common factor can’t use more of a prime than either number has.' },
              { html: 'The student left out a prime that only one number has.', why: 'Every prime here is in both numbers. Look at which exponent was chosen for each prime.' },
              { html: 'There is no mistake.', why: 'Does the student’s answer divide into ' + t('a') + '? Compare the exponents.' }],
              'For a common factor, each prime can appear no more times than it does in <b>either</b> number, so the GCF takes the <b>lower</b> exponent. The student took the higher one.',
              ['Compare the student’s exponents with the ones in ' + t('a') + ' and ' + t('b') + '.'], 'GCF error: higher exponents');
          } },
          { id: 'e18b', level: 'PRG', make: function (r, sh) {
            var a = fromExps(sh.ps, sh.ea), b = fromExps(sh.ps, sh.eb), g = gcd(a, b);
            return expNumPart('Give the correct GCF.', g, 'GCF', gcfDiag([a, b]), 'Lower exponent of each prime: ' + sh.ps.map(function (p, i) { var e = Math.min(sh.ea[i], sh.eb[i]); return t(p + (e > 1 ? '^{' + e + '}' : '')) + ' (from ' + t(sh.ea[i] < sh.eb[i] ? 'a' : 'b') + ')'; }).join(', ') + '.<br>' + t('\\text{GCF}=' + eqv(g)) + '.', ['Take the <b>lower</b> exponent of each prime.'], 'correct GCF (error analysis)');
          } },
          { id: 'e18c', level: 'ADV', make: function (r, sh) {
            var a = fromExps(sh.ps, sh.ea), b = fromExps(sh.ps, sh.eb), L = lcm(a, b), g = gcd(a, b);
            return P.mc(r, 'The student’s answer, ' + t(F(L)) + ', isn’t meaningless. What is it for these two numbers?', [
              { html: 'The <b>LCM</b> of ' + t('a') + ' and ' + t('b') + '.', right: true },
              { html: 'The product ' + t('a\\times b') + '.', why: t('a\\times b') + ' would add the exponents: ' + t(K.fac(a * b)) + '.' },
              { html: 'The square of the GCF.', why: 'The GCF is ' + t(eqv(g)) + '; its square doubles those exponents.' },
              { html: 'Nothing special — it’s just wrong.', why: 'Taking the higher exponent of each prime is exactly the rule for something you know.' }],
              'Taking the higher exponent of each prime is the LCM rule, so ' + t(F(L)) + ' is the LCM. Check: ' + t(F(g) + '\\times ' + F(L) + '=' + F(g * L)) + ' and ' + t('a\\times b=' + F(a) + '\\times ' + F(b) + '=' + F(a * b)) + ' ✓',
              ['Which rule uses the higher exponent of each prime?'], 'what is the wrong GCF');
          } }] },
      { num: '19', stem: function (sh) { return 'Asked for the LCM of ' + t(sh.a) + ' and ' + t(sh.b) + ', a student wrote: “A multiple of both is just ' + t(sh.a + '\\times ' + sh.b + '=' + F(sh.a * sh.b)) + ', so the LCM is ' + t(F(sh.a * sh.b)) + '.”'; },
        shared: function (r) { var v = find(r, function () { return sortN(r.sample(range(10, 40), 2)); }, function (v) { var g = gcd(v[0], v[1]); return g >= 4 && g <= 12 && noneDivides(v); }, [18, 24]); return { a: v[0], b: v[1] }; },
        parts: [
          { id: 'e19a', level: 'ADV', make: function (r, sh) {
            var a = sh.a, b = sh.b, g = gcd(a, b), L = lcm(a, b);
            return P.mc(r, 'The student is right that ' + t(F(a * b)) + ' is a common multiple. Why is it not the <b>least</b> one?', [
              { html: t(a) + ' and ' + t(b) + ' share the factor ' + t(g) + '. The product contains it twice, but a common multiple only needs it once, so ' + t(F(a * b) + '\\div ' + g + '=' + L) + ' is still a multiple of both.', right: true },
              { html: 'The product of two numbers is never a common multiple.', why: 'It always is: ' + t(a + '\\times ' + b) + ' divides by both ' + t(a) + ' and ' + t(b) + '. The question is whether a smaller one exists.' },
              { html: 'The LCM must be smaller than both numbers.', why: 'That’s the GCF. Every common multiple is at least as big as the larger number.' },
              { html: t(F(a * b)) + ' isn’t divisible by ' + t(a) + '.', why: t(F(a * b) + '\\div ' + a + '=' + b) + ', so it is.' }],
              facLines([a, b]) + '. They share ' + t(g + (K.fac(g) === String(g) ? '' : '=' + K.fac(g))) + '. The product ' + t(a + '\\times ' + b) + ' contains that shared part twice; a common multiple needs it only once. So ' + t(F(a * b) + '\\div ' + g + '=' + L) + ' is a smaller common multiple.',
              ['Do ' + t(a) + ' and ' + t(b) + ' share a factor? How many times does the product contain it?'], 'why ab is not the LCM');
          } },
          { id: 'e19b', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, g = gcd(a, b), L = lcm(a, b);
            return P.fields('Repair the method using ' + t('\\text{GCF}\\times\\text{LCM}=a\\times b') + ': find the GCF, then the LCM.', [{ name: 'GCF', before: t('\\text{GCF}=') }, { name: 'LCM', before: t('\\text{LCM}=') }],
              [K.number(g, gcfDiag([a, b])), K.number(L, lcmDiag([a, b]))], [String(g), String(L)], t('\\text{GCF}=' + g + ',\\ \\text{LCM}=' + L),
              t('\\text{GCF}(' + a + ',' + b + ')=' + g) + '. ' + t('\\text{LCM}=\\dfrac{' + a + '\\times ' + b + '}{' + g + '}=\\dfrac{' + F(a * b) + '}{' + g + '}=' + L) + '. Check: ' + t(L + '\\div ' + a + '=' + L / a) + ', ' + t(L + '\\div ' + b + '=' + L / b) + ' ✓',
              ['Divide the product by the GCF.'], 'LCM via identity ' + a + ', ' + b);
          } },
          { id: 'e19c', level: 'MAS', make: function (r) {
            return P.mc(r, 'For which pairs of numbers does the student’s shortcut (LCM = ' + t('a\\times b') + ') actually give the right answer?', [
              { html: 'Exactly when the GCF is ' + t('1') + ' — the two numbers share no prime factor.', right: true },
              { html: 'Only when both numbers are prime.', why: 'That works, but it isn’t the only case: ' + t('8') + ' and ' + t('9') + ' aren’t prime, yet their LCM is ' + t('72=8\\times 9') + '.' },
              { html: 'When one number divides the other.', why: 'Try ' + t('4') + ' and ' + t('12') + ': ' + t('4\\times 12=48') + ', but the LCM is ' + t('12') + '.' },
              { html: 'When both numbers are even.', why: 'Two even numbers share the factor ' + t('2') + ', so the product is too big: ' + t('4\\times 6=24') + ' but the LCM is ' + t('12') + '.' }],
              t('\\text{LCM}=\\dfrac{a\\times b}{\\text{GCF}}') + ', which equals ' + t('a\\times b') + ' exactly when the GCF is ' + t('1') + ' — the numbers share no prime factor. Example: ' + t('8=2^{3}') + ' and ' + t('9=3^{2}') + ' give LCM ' + t('72=8\\times 9') + '.',
              ['Use ' + t('\\text{LCM}=\\dfrac{a\\times b}{\\text{GCF}}') + '. When is that the same as ' + t('a\\times b') + '?'], 'when LCM = ab');
          } }] },
      { num: '20', section: 'Extra practice F — Stretch', stem: 'Hint: write the two numbers as ' + t('gx') + ' and ' + t('gy') + ', where ' + t('g') + ' is the GCF. What must be true of ' + t('x') + ' and ' + t('y') + ', and what must ' + t('x\\times y') + ' equal?', parts: [
        { id: 'e20', level: 'MAS', make: function (r) {
          var gk = find(r, function () { return [r.pick([6, 6, 4, 10, 12, 5, 3]), r.pick([30, 42, 66, 70, 105])]; }, function (v) { return v[0] * v[1] <= 1000; }, [6, 30]), g = gk[0], k = gk[1], L = g * k;
          var want = nt.divisors(k).filter(function (u) { return u * u < k && gcd(u, k / u) === 1; }).map(function (u) { return [g * u, g * k / u]; });
          return { prompt: 'Find <b>all</b> pairs of whole numbers whose GCF is ' + t(g) + ' and whose LCM is ' + t(L) + '.', input: { type: 'pairs', start: 1 }, key: want.map(function (p) { return [String(p[0]), String(p[1])]; }),
            answer: want.map(function (p) { return t(p[0] + '\\ \\&\\ ' + p[1]); }).join('; '), text: 'all pairs GCF ' + g + ' LCM ' + L,
            check: function (resp) {
              if (!resp || !resp.length) return form('empty', 'Write your first pair in the boxes.');
              var got = [];
              for (var i = 0; i < resp.length; i++) {
                var a = Number(resp[i][0]), b = Number(resp[i][1]);
                if (resp[i][0] === '' || resp[i][1] === '' || !isFinite(a) || !isFinite(b) || a <= 0 || b <= 0 || a % 1 || b % 1) return form('blank', 'Each pair needs two whole numbers.');
                got.push(a < b ? [a, b] : [b, a]);
              }
              var keys = got.map(function (p) { return p[0] + ',' + p[1]; });
              for (i = 0; i < keys.length; i++) if (keys.indexOf(keys[i]) !== i) return form('dup', 'You listed ' + t('(' + keys[i] + ')') + ' twice.');
              for (i = 0; i < got.length; i++) {
                var p = got[i], pg = gcd(p[0], p[1]), pl = lcm(p[0], p[1]);
                if (pg !== g) return wrong('pair-gcf', 'The GCF of ' + t(p[0]) + ' and ' + t(p[1]) + ' is ' + t(pg) + ', not ' + t(g) + (pg > g ? ': ' + t('x') + ' and ' + t('y') + ' can’t share a factor.' : '.'));
                if (pl !== L) return wrong('pair-lcm', 'The LCM of ' + t(p[0]) + ' and ' + t(p[1]) + ' is ' + t(F(pl)) + ', not ' + t(L) + '.');
              }
              if (got.length < want.length) return wrong('missing', 'Every pair you have works — but there are ' + (want.length - got.length === 1 ? 'more' : 'more') + '. Write the numbers as ' + t(g + 'x') + ' and ' + t(g + 'y') + ': list every way to write ' + t('x\\times y=' + k) + ' with ' + t('x') + ' and ' + t('y') + ' sharing no factor.');
              return ok();
            },
            solution: 'Write the numbers as ' + t(g + 'x') + ' and ' + t(g + 'y') + '. Then ' + t('x') + ' and ' + t('y') + ' share no factor (otherwise the GCF would be bigger than ' + t(g) + '). Using the identity: ' + t(g + '\\times ' + L + '=' + g + 'x\\times ' + g + 'y') + ', so ' + t(F(g * L) + '=' + (g * g) + 'xy') + ' and ' + t('xy=' + k) + '.<br>' + t(k + '=' + K.fac(k)) + ' has the factor pairs ' + t(K.pairsTex(k)) + '; in each pair the two factors share no factor, so all of them work.<br>Multiply by ' + t(g) + ': ' + want.map(function (p) { return t(p[0] + '\\ \\&\\ ' + p[1]); }).join(', ') + '.',
            hints: ['Write the numbers as ' + t(g + 'x') + ' and ' + t(g + 'y') + '. Use GCF × LCM = product to find ' + t('x\\times y') + '.', 'List every factor pair of ' + t('x\\times y') + ' whose two numbers share no common factor.'],
            bad: [want.slice(1).map(function (p) { return [String(p[0]), String(p[1])]; }), [[String(g), String(L)], [String(2 * g), String(L)]]] };
        } }] },
      { num: '21', stem: function (sh) { return 'The smallest whole number divisible by every one of ' + t('1, 2, 3, \\ldots, ' + sh.N) + '.'; },
        shared: function (r) { return { N: r.pick([10, 10, 9, 12]) }; },
        parts: [
          { id: 'e21a', level: 'ADV', make: function (r, sh) {
            var nums = range(1, sh.N), L = lcmA(nums);
            return expNumPart('Give the number in exponent form and as a whole number.', L, 'LCM', lcmDiag(range(2, sh.N)),
              'Take the highest power of each prime up to ' + t(sh.N) + ': ' + nt.factor(L).map(function (pe) { return t(pe[0] + (pe[1] > 1 ? '^{' + pe[1] + '}' : '')) + (pe[1] > 1 ? ' (from ' + t(Math.pow(pe[0], pe[1])) + ')' : ''); }).join(', ') + '.<br>' + t(K.fac(L) + '=' + F(L)) + '.',
              ['This is the LCM of ' + t('1, 2, \\ldots, ' + sh.N) + '.', 'Use the highest power of each prime that is at most ' + t(sh.N) + '.'], 'LCM 1..' + sh.N);
          } },
          { id: 'e21b', level: 'ADV', make: function (r, sh) {
            var comp = range(4, sh.N).filter(function (x) { return !nt.isPrime(x); }), L = lcmA(range(1, sh.N)), pp = comp.filter(function (x) { return nt.factor(x).length === 1; }), hiPP = pp.filter(function (x) { return L % (x * nt.factor(x)[0][0]); });
            return P.mc(r, 'Why don’t you need to check ' + t(comp.join(', ')) + ' separately?', [
              { html: 'Each of them is built only from primes already in ' + t(K.fac(L)) + ', at powers no higher than the ones there, so each of them divides it automatically.', right: true },
              { html: 'Composite numbers never affect the LCM.', why: t(pp[pp.length - 1] + '=' + K.fac(pp[pp.length - 1])) + ' is composite, and it is the reason the LCM contains ' + t(K.fac(pp[pp.length - 1])) + '.' },
              { html: 'They are all even.', why: t(comp.filter(function (x) { return x % 2; })[0] || 9) + ' is odd. Think about their prime factors instead.' },
              { html: 'The LCM only needs each prime once.', why: 'The product of the primes, ' + t(nt.primesBetween(2, sh.N).join('\\times ') + '=' + F(prodOf(nt.primesBetween(2, sh.N)))) + ', isn’t divisible by ' + t(pp[pp.length - 1]) + '.' }],
              'The highest prime powers ' + hiPP.map(function (x) { return t(x + '=' + K.fac(x)); }).join(', ') + ' are exactly what the LCM is built from, and ' + comp.filter(function (x) { return hiPP.indexOf(x) < 0; }).map(function (x) { return t(x + '=' + K.fac(x)); }).join(', ') + ' use only the same primes at the same or smaller powers. So each divides ' + t(K.fac(L)) + ' automatically. (And ' + t('1') + ' divides everything.)',
              ['Write each of these numbers as a product of primes. Are those primes (and powers) already in the LCM?'], 'why not check composites');
          } },
          { id: 'e21c', level: 'ADV', make: function (r, sh) {
            var M = sh.N + 2, L1 = lcmA(range(1, sh.N)), L2 = lcmA(range(1, M)), added = range(sh.N + 1, M);
            return P.number('Extend the list to ' + t('1') + ' through ' + t(M) + '. What is the smallest whole number divisible by every one of them?', L2, function (v) {
              if (v === L1) return { code: 'lcm-missing-prime', hint: 'That’s the answer for ' + t('1') + ' to ' + t(sh.N) + '. Check whether ' + t(added.join(' or ')) + ' brings in a new prime or a higher power.' };
              if (v === L1 * prodOf(added)) return { code: 'lcm-not-least', hint: 'You multiplied by ' + t(added.join('\\times ')) + ', but some of that is already in the LCM. Only bring in what’s new.' };
              return null;
            }, 'New numbers: ' + added.map(facEq).join(', ') + '. ' + (L2 === L1 ? 'Nothing new is needed, so the LCM stays ' + t(F(L1)) + '.' : 'Bring in only what is new: ' + t('\\text{LCM}=' + K.fac(L2) + '=' + F(L2)) + '.'),
            ['Factor each new number. Does it add a new prime, or a higher power of an old one?'], 'LCM 1..' + M, { before: t('\\text{LCM}=') });
          } }] },
      { num: '22', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e22', level: 'PRG', make: function (r) {
          var i = r.int(4, 6), k = r.int(2, i - 1), l = r.int(4, 7), j = r.int(2, l - 1), pq = r.sample([5, 7, 11], 2), p = pq[0], q = pq[1];
          var A = texE([2, 3], [k, j]), B = texE([2, 3], [i, l]), C = HW.texFactors(sortN([2, 3, p, q]).map(function (x) { return [x, x === 2 ? k : x === 3 ? j : 1]; })), D = HW.texFactors(sortN([2, 3, p, q]).map(function (x) { return [x, x === 2 ? i + k : x === 3 ? j + l : 1]; }));
          return P.mc(r, 'The greatest common factor of ' + t(texE([2, 3, p], [i, j, 1])) + ' and ' + t(texE([2, 3, q], [k, l, 1])) + ' is', [
            { html: t(A), right: true },
            { html: t(B), why: 'Those are the <b>higher</b> exponents. The GCF takes the lower exponent of each shared prime.' },
            { html: t(C), why: t(p) + ' and ' + t(q) + ' each appear in only one number, so they can’t be in the GCF.' },
            { html: t(D), why: 'Adding exponents multiplies the two numbers together. The GCF uses the lower exponent of each shared prime.' }],
            'The GCF uses primes in <b>both</b> numbers, at the <b>lower</b> exponent. ' + t('2') + ': lower of ' + t(i) + ' and ' + t(k) + ' is ' + t(k) + '. ' + t('3') + ': lower of ' + t(j) + ' and ' + t(l) + ' is ' + t(j) + '. ' + t(p) + ' and ' + t(q) + ' are each in only one number, so they’re left out. GCF ' + t('=' + A + '=' + F(fromExps([2, 3], [k, j]))) + '.',
            ['Which primes are in <b>both</b> numbers? Which exponent does the GCF use?'], 'MC GCF exponent form');
        } }] },
      { num: '23', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e23', level: 'ADV', make: function (r) {
          var v = find(r, function () { var b = r.pick([2, 2, 3, 5]), pq = sortN(r.sample([3, 5, 7, 11, 13].filter(function (x) { return x !== b; }), 2)); return { b: b, p: pq[0], q: pq[1], n: b * b * b * pq[0] * pq[0] * pq[1] * pq[1] }; },
            function (v) { return v.n <= 99999 && v.p * v.q <= 999; }, { b: 2, p: 3, q: 7, n: 3528 });
          var n = v.n, m = v.p * v.q, N = n * m;
          return P.nr('The smallest whole number that ' + t(F(n)) + ' must be multiplied by to give a perfect cube is ________. (Record your answer as a three-digit number.)', m, function (x) {
            if (x === m * m) return { code: 'squared', hint: 'You need just <b>one</b> more of each prime with exponent ' + t('2') + ', to reach ' + t('3') + '.' };
            if (x === m * v.b) return { code: 'not-smallest', hint: t(v.b + '^{3}') + ' is already a cube — leave it alone.' };
            if (x > 0 && x % 1 === 0 && intRoot(n * x, 3) != null) return { code: 'not-smallest', hint: 'That makes a cube, but a smaller multiplier works. Raise each exponent only to the next multiple of ' + t('3') + '.' };
            if (x > 1 && m % x === 0) return { code: 'missed-prime', hint: 'Not quite: after multiplying by ' + t(x) + ', some exponent is still not a multiple of ' + t('3') + '. Check every prime.' };
            if (x > 0 && x % 1 === 0 && intRoot(n * x, 2) != null) return { code: 'made-square', hint: 'That makes a perfect <b>square</b>. For a cube, every exponent must be a multiple of ' + t('3') + '.' };
            return null;
          }, t(F(n) + '=' + K.fac(n)) + '. Raise each exponent to a multiple of ' + t('3') + ': ' + t(v.b + '^{3}') + ' is fine, ' + t(v.p + '^{2}\\to ' + v.p + '^{3}') + ' and ' + t(v.q + '^{2}\\to ' + v.q + '^{3}') + ' each need one more. Multiply by ' + t(v.p + '\\times ' + v.q + '=' + m) + ': ' + t(F(n) + '\\times ' + m + '=' + F(N) + '=' + intRoot(N, 3) + '^{3}') + '. Answer: ' + t((m < 100 ? '0' : '') + m),
          ['Factor ' + t(F(n)) + ' and look for exponents that aren’t multiples of ' + t('3') + '.'], 'NR cube multiplier ' + n);
        } }] }
    ]
  });

  /* ---------- part makers used by the extras ---------- */
  function expGroupGcf(r, ps, lo, hi, fallback) {
    var es = expGroup(r, ps, lo, hi, fallback), nums = es.map(function (e) { return fromExps(ps, e); }), g = gcfA(nums), ge = ps.map(function (p) { return expOf(g, p); });
    return expNumPart(es.map(function (e) { return t(texE(ps, e)); }).join(', '), g, 'GCF', gcfDiag(nums),
      'Primes in all three: ' + t(ps.join(',\\ ')) + '. Lowest exponents: ' + ps.map(function (p, i) { return t(p + '^{' + ge[i] + '}'); }).join(', ') + '.<br>' + t('\\text{GCF}=' + eqv(g)) + '.',
      ['For each prime, find the <b>lowest</b> exponent among the three numbers.'], 'GCF from exponents');
  }
  function expGroupLcm(r, ps, lo, hi, fallback) {
    var es = expGroup(r, ps, lo, hi, fallback), nums = es.map(function (e) { return fromExps(ps, e); }), L = lcmA(nums);
    return lcmExpPart(es.map(function (e) { return t(texE(ps, e)); }).join(', '), nums, L);
  }
  function lcmExpPart(prompt, nums, L) {
    var ex = HW.texFactors(nt.factor(L));
    return { prompt: prompt, input: { type: 'math', before: t('\\text{LCM}=') }, check: expChk(L, lcmDiag(nums)), key: K.fac(L), answer: t('\\text{LCM}=' + ex + '=' + F(L)), text: 'LCM exponent form',
      solution: (nums.every(function (n) { return n < 1000; }) ? facLines(nums) + '.<br>' : '') + 'Highest exponent of each prime that appears: ' + nt.factor(L).map(function (pe) { return t(pe[0] + (pe[1] > 1 ? '^{' + pe[1] + '}' : '')); }).join(', ') + '.<br>' + t('\\text{LCM}=' + ex + '=' + F(L)) + '.',
      hints: ['For each prime, find the <b>highest</b> exponent in any of the numbers.'], bad: [String(L), K.fac(gcfA(nums))] };
  }
  function abOf(s) { return [fromExps([2, 3, s.p], [s.i, s.j, 1]), fromExps([2, 3, s.q], [s.k, s.l, 1])]; }
  function abSol(s, kind) {
    var ab = abOf(s);
    if (kind === 'gcf') { var g = gcfA(ab); return 'GCF: shared primes are ' + t('2') + ' and ' + t('3') + ' only (' + t(s.p) + ' is only in ' + t('a') + ', ' + t(s.q) + ' only in ' + t('b') + '). Lower exponents: ' + t('2^{' + s.k + '},\\ 3^{' + s.j + '}') + '. ' + t('\\text{GCF}=' + eqv(g)) + '.'; }
    var L = lcmA(ab); return 'LCM: primes in either are ' + t('2, 3, ' + Math.min(s.p, s.q) + ', ' + Math.max(s.p, s.q)) + '. Higher exponents: ' + t('2^{' + s.i + '},\\ 3^{' + s.l + '}') + ', and one each of ' + t(s.p) + ' and ' + t(s.q) + '. ' + t('\\text{LCM}=' + eqv(L)) + '.';
  }
  function gcfLcmFields(nums) {
    var g = gcfA(nums), L = lcmA(nums);
    var fields = nums.map(function (n) { return { name: t(F(n)), before: t(F(n) + '='), mode: 'text', wide: true, placeholder: 'exponent form' }; }).concat([{ name: 'GCF', before: t('\\text{GCF}=') }, { name: 'LCM', before: t('\\text{LCM}=') }]);
    var p = P.fields(nlist(nums), fields, nums.map(function (n) { return prodChk(n, 'required'); }).concat([K.number(g, gcfDiag(nums)), K.number(L, lcmDiag(nums))]),
      nums.map(plainFac).concat([String(g), String(L)]), nums.map(function (n) { return t(F(n) + '=' + K.fac(n)); }).join('<br>') + '<br>GCF ' + t('=' + eqv(g)) + ', LCM ' + t('=' + eqv(L)),
      gcfSol(nums) + '<br>' + 'LCM: every prime, highest power: ' + t('\\text{LCM}=' + eqv(L)) + '.',
      ['Factor each number, in exponent form.', 'GCF: shared primes at their lowest powers. LCM: all primes at their highest powers.'], 'GCF & LCM of ' + nums.join(', '));
    p.bad = [nums.map(plainFac).concat([String(L), String(g)])];
    return p;
  }
  function otherNumberPart(r, gs, v, which) {
    var a = v[0], b = v[1], g = v[2], L = lcm(a, b), given = which ? b : a, ans = which ? a : b;
    return P.number('Two numbers have a GCF of ' + t(g) + ' and an LCM of ' + t(L) + '. One of the numbers is ' + t(given) + '. Find the other.', ans, function (x) {
      if (x === g * L) return { code: 'no-divide', hint: t(g + '\\times ' + L + '=' + F(g * L)) + ' is the product of the <b>two</b> numbers. Divide by the one you know.' };
      if (x === L / given) return { code: 'multiplier', hint: t(L + '\\div ' + given) + ' tells you what to multiply ' + t(given) + ' by to get the LCM, not the other number. Use GCF × LCM = ' + t('a\\times b') + '.' };
      if (x === L / g) return { code: 'lcm-over-gcf', hint: 'Use GCF × LCM = ' + t('a\\times b') + ': multiply the GCF and the LCM, then divide by ' + t(given) + '.' };
      return null;
    }, t(g + '\\times ' + L + '=' + given + '\\times b') + ', so ' + t(F(g * L) + '=' + given + 'b') + ' and ' + t('b=' + F(g * L) + '\\div ' + given + '=' + ans) + '. Check: GCF' + t('(' + Math.min(a, b) + ',' + Math.max(a, b) + ')=' + g) + ', LCM ' + t('=' + L) + ' ✓',
    ['GCF × LCM = the product of the two numbers.'], 'other number GCF ' + g + ' LCM ' + L);
  }
  function sqCubePart(r, cond, pool, fallback, nPrimes) {
    var v = find(r, function () { var ps = sortN(r.sample([2, 3, 5, 7], nPrimes || 2)), es = ps.map(function () { return r.pick(pool); }); return { ps: ps, es: es }; },
      function (v) { return cond(v.es) && fromExps(v.ps, v.es) < 1e15; }, { ps: fallback.length === 3 ? [2, 3, 5] : fallback[0] === 9 ? [2, 5] : [2, 3], es: fallback });
    var ps = v.ps, es = v.es, nTex = texE(ps, es), sq = es.every(function (e) { return e % 2 === 0; }), cu = es.every(function (e) { return e % 3 === 0; });
    var sr = sq ? fromExps(ps, es.map(function (e) { return e / 2; })) : null, cr = cu ? fromExps(ps, es.map(function (e) { return e / 3; })) : null;
    var srTex = sq ? texE(ps, es.map(function (e) { return e / 2; })) : null, crTex = cu ? texE(ps, es.map(function (e) { return e / 3; })) : null;
    var d2 = function (val) { return cr != null && val === cr ? { code: 'used-cube-root', hint: 'That’s the <b>cube</b> root. For the square root, divide each exponent by ' + t('2') + '.' } : null; };
    var d3 = function (val) { return sr != null && val === sr ? { code: 'used-square-root', hint: 'That’s the <b>square</b> root. For the cube root, divide each exponent by ' + t('3') + '.' } : null; };
    var label = sq && cu ? 'both' : sq ? 'perfect square only' : cu ? 'perfect cube only' : 'neither';
    var p = P.fields(t(nTex), [{ name: 'Square root', label: 'Square root', mode: 'text', wide: true, placeholder: 'exponent form, or none' }, { name: 'Cube root', label: 'Cube root', mode: 'text', wide: true, placeholder: 'exponent form, or none' }],
      [rootOrNone(sr, 2, nTex, d2), rootOrNone(cr, 3, nTex, d3)], [sq ? srTex.replace(/\^\{(\d+)\}/g, '^$1').replace(/\\times /g, ' × ') : 'none', cu ? crTex.replace(/\^\{(\d+)\}/g, '^$1').replace(/\\times /g, ' × ') : 'none'],
      '<b>' + label.charAt(0).toUpperCase() + label.slice(1) + '</b>' + (sq ? '; square root ' + t(srTex + (sr < 1e7 ? '=' + F(sr) : '')) : '') + (cu ? '; cube root ' + t(crTex + (cr < 1e7 ? '=' + F(cr) : '')) : ''),
      'Exponents: ' + t(es.join(',\\ ')) + '.<br>' + (sq ? 'All even ⇒ perfect square; square root ' + t(srTex + (sr < 1e7 ? '=' + F(sr) : '')) + '.' : 'Not all even (' + t(es.filter(function (e) { return e % 2; })[0]) + ' is odd) ⇒ not a square.') + '<br>' + (cu ? 'All multiples of ' + t('3') + ' ⇒ perfect cube; cube root ' + t(crTex + (cr < 1e7 ? '=' + F(cr) : '')) + '.' : 'Not all multiples of ' + t('3') + ' (' + t(es.filter(function (e) { return e % 3; })[0]) + ') ⇒ not a cube.') + '<br><b>' + label.charAt(0).toUpperCase() + label.slice(1) + '</b>.',
      ['Square: is every exponent even? Cube: is every exponent a multiple of ' + t('3') + '?', 'To take a root, divide each exponent by ' + t('2') + ' (square) or ' + t('3') + ' (cube).'], 'square/cube from exponents: ' + label);
    p.bad = [[sq ? 'none' : '2', cu ? 'none' : '2'], [sq ? String(sr + 1) : 'none', cu ? String(cr + 1) : 'none']].filter(function (b) { return !(b[0] === p.key[0] && b[1] === p.key[1]); });
    if (sq && sr < 1e9) p.good = [[String(sr), p.key[1]]];
    return p;
  }
})(window);
