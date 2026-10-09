/* Question-writing kit: shared checkers with common-error diagnoses, used by every lesson file.
 * A checker returns { v: 'correct' | 'wrong' | 'form', code, hint }.
 *   wrong  = a real mistake (uses one of the student's tries; the hint helps them fix it)
 *   form   = right idea, wrong format or something missing (no try used, just a nudge)
 * Lessons register with HW.defineLesson({...}); see js/lessons/u1l1.js. */
(function (root) {
  'use strict';
  var HW = root.HW, nt = HW.nt, F = HW.fmt;
  var K = HW.kit = {};
  K.t = function (s) { return '\\(' + s + '\\)'; };
  function t(s) { return '\\(' + s + '\\)'; }
  function ok() { return { v: 'correct' }; }
  function wrong(code, hint) { return { v: 'wrong', code: code, hint: hint }; }
  function form(code, hint) { return { v: 'form', code: code, hint: hint }; }
  K.ok = ok; K.wrong = wrong; K.form = form;
  K.listTex = function (arr) { return arr.map(function (x) { return F(x); }).join(',\\ '); };
  function uniq(a) { var s = {}, out = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; out.push(x); } }); return out; }
  function dupOf(a) { var s = {}; for (var i = 0; i < a.length; i++) { if (s[a[i]]) return a[i]; s[a[i]] = 1; } return null; }
  K.pairsTex = function (n) { var d = nt.divisors(n), out = []; for (var i = 0; i < d.length && d[i] * d[i] <= n; i++) out.push(F(d[i]) + '\\times ' + F(n / d[i])); return out.join(',\\quad '); };

  /* ---- a list of every factor of n ---- */
  K.factorList = function (n) {
    var want = nt.divisors(n);
    return function (resp) {
      if (!resp || !resp.length) return form('empty', 'Add the factors one at a time (press Enter or comma after each).');
      var d = dupOf(resp); if (d != null) return form('duplicate', 'You listed ' + t(F(d)) + ' more than once. Each factor only needs to be listed once.');
      var bad = resp.filter(function (x) { return x <= 0 || n % x; });
      if (bad.length) return wrong('nonfactor', t(F(bad[0])) + ' isn’t a factor of ' + t(F(n)) + ': ' + t(F(n) + '\\div ' + F(bad[0])) + ' is not a whole number.' + (bad.length > 1 ? ' (Check ' + t(F(bad[1])) + ' too.)' : ''));
      var missing = want.filter(function (x) { return resp.indexOf(x) < 0; });
      if (!missing.length) return ok();
      if (missing.indexOf(1) >= 0 || missing.indexOf(n) >= 0) return wrong('missing-1n', 'Every whole number has ' + t('1') + ' and itself as factors — make sure both are in your list.');
      for (var i = 0; i < resp.length; i++) { var p = n / resp[i]; if (missing.indexOf(p) >= 0) return wrong('missing-partner', 'You listed ' + t(F(resp[i])) + '. Factors come in pairs: what does ' + t(F(resp[i])) + ' multiply with to make ' + t(F(n)) + '?'); }
      return wrong('missing', 'You have ' + resp.length + ' of the ' + want.length + ' factors. Work through the pairs in order — ' + t('1\\times ' + F(n)) + ', ' + t('2\\times ?') + ', ' + t('3\\times ?') + ', … — until the pairs meet.');
    };
  };
  /* ---- the distinct prime factors of n ---- */
  K.primeFactorList = function (n) {
    var want = nt.distinctPrimes(n);
    return function (resp) {
      if (!resp || !resp.length) return form('empty', 'Add the prime factors one at a time (press Enter or comma after each).');
      if (resp.indexOf(1) >= 0) return wrong('one', t('1') + ' isn’t prime (it has only one factor), so it is never a prime factor.');
      var d = dupOf(resp); if (d != null) return form('repeat', 'List each prime factor <b>once</b>: ' + t(F(d)) + ' appears more than once in your list. (Repeats belong in the product of primes, not in this list.)');
      var comp = resp.filter(function (x) { return !nt.isPrime(x); });
      var nonf = resp.filter(function (x) { return n % x; });
      if (nonf.length) return wrong('nonfactor', t(F(nonf[0])) + ' isn’t a factor of ' + t(F(n)) + ' at all: ' + t(F(n) + '\\div ' + F(nonf[0])) + ' is not a whole number.');
      if (comp.length) return wrong('composite', t(F(comp[0])) + ' is a factor of ' + t(F(n)) + ', but it isn’t prime — it has more than two factors. Keep only the prime factors.');
      var missing = want.filter(function (x) { return resp.indexOf(x) < 0; });
      if (missing.length) return wrong('missing', 'You’re missing ' + (missing.length === 1 ? 'a prime factor' : missing.length + ' prime factors') + '. Divide ' + t(F(n)) + ' by the primes you found until nothing is left but primes.');
      return ok();
    };
  };
  /* ---- n as a product of primes. exp: 'either' (repeats may be written out) or 'required' (exponent form) ---- */
  K.product = function (n, exp) {
    var fac = nt.factor(n);
    return function (resp) {
      if (HW.parse.hasBlank(resp)) return form('blank', 'There is still an empty box in your answer — fill it in or delete it.');
      var p = HW.parse.product(resp);
      if (!p.ok) {
        if (p.code === 'empty') return form('empty', 'Write ' + t(F(n)) + ' as primes multiplied together, like ' + t('2^{3}\\times 3\\times 5') + '.');
        if (p.code === 'plus') return form('plus', 'A product of primes uses multiplication only: put ' + t('\\times') + ' between the factors, not ' + t('+') + ' or ' + t('-') + '.');
        if (p.code === 'comma') return form('comma', 'Multiply the primes together with ' + t('\\times') + ' instead of listing them with commas.');
        if (p.code === 'divide') return form('divide', 'A product of primes uses ' + t('\\times') + ' only — no division.');
        if (p.code === 'equals') return form('equals', 'Write just one product, e.g. ' + t(F(n) + '=2\\times 3\\times\\ldots') + '.');
        return form('unreadable', 'I can’t read that as a product. Use whole numbers, ' + t('\\times') + ' between factors and ' + t('^') + ' for exponents.');
      }
      if (p.lead != null && p.lead !== n) return wrong('lead', 'Your answer starts with ' + t(F(p.lead)) + ' but the number is ' + t(F(n)) + '.');
      var fs = p.factors.filter(function (pe) { return !(pe[0] === 1); });
      if (fs.length < p.factors.length) { if (p.value === n) return form('one', 'Leave ' + t('1') + ' out: it isn’t prime, and multiplying by ' + t('1') + ' changes nothing.'); }
      if (!fs.length) return wrong('nothing', 'Write ' + t(F(n)) + ' as primes multiplied together.');
      var comp = fs.filter(function (pe) { return !nt.isPrime(pe[0]); });
      var val = fs.reduce(function (m, pe) { return m * Math.pow(pe[0], pe[1]); }, 1);
      if (val === n && comp.length) return wrong('composite', 'Your factors multiply to ' + t(F(n)) + ', but ' + t(F(comp[0][0])) + ' isn’t prime. Break it down further until every factor is prime.');
      if (fs.length === 1 && fs[0][1] === 1 && fs[0][0] === n && !nt.isPrime(n)) return wrong('self', t(F(n)) + ' isn’t prime, so it has to be broken into smaller prime factors.');
      if (val !== n) {
        if (!comp.length && n % val === 0) return wrong('missing', 'Your primes multiply to ' + t(F(val)) + ', not ' + t(F(n)) + '. ' + t(F(n) + '\\div ' + F(val) + '=' + F(n / val)) + ', so something is missing.');
        if (!comp.length && val % n === 0) return wrong('extra', 'Your primes multiply to ' + t(F(val)) + ', which is too big — check your exponents and repeated factors.');
        return wrong('value', 'Your factors multiply to ' + t(F(val)) + ', not ' + t(F(n)) + '. Check each division.');
      }
      if (exp === 'required') {
        var seen = {}, repeatsWritten = false, split = false;
        fs.forEach(function (pe) { if (seen[pe[0]]) { if (pe[1] === 1 && seen[pe[0]] === 1) repeatsWritten = true; else split = true; } seen[pe[0]] = (seen[pe[0]] || 0) + 1; });
        if (repeatsWritten && !split) return form('exp-form', 'Right primes! Now write it in <b>exponent form</b>: a repeated prime gets an exponent, e.g. ' + t('2\\times 2\\times 2=2^{3}') + '.');
        if (repeatsWritten || split) return form('exp-combine', 'Right value — now combine each prime into one power, e.g. ' + t('2^{2}\\times 2=2^{3}') + '.');
      }
      return ok();
    };
  };
  /* ---- one number. diag(value) can return a specific hint for a known wrong value ---- */
  K.number = function (ans, diag, opt) {
    opt = opt || {};
    return function (resp) {
      var p = HW.parse.number(resp);
      if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your answer first.' : 'Enter a single number' + (opt.nr ? ' (numerical response: digits only).' : '.'));
      if (opt.nr && String(resp).replace(/\s/g, '').length > 4) return form('nr-long', 'Numerical response answers fit in 4 boxes (digits and a decimal point only).');
      if (Math.abs(p.value - ans) < 1e-9) return ok();
      var h = diag ? diag(p.value) : null;
      if (h) return wrong(h.code || 'diag', h.hint || h);
      return wrong('value', null);
    };
  };
  /* ---- pick from a set ---- */
  K.selectSet = function (want, diag) {
    return function (resp) {
      if (!resp || !resp.length) return form('empty', 'Tap at least one number.');
      var extra = resp.filter(function (x) { return want.indexOf(x) < 0; }), missing = want.filter(function (x) { return resp.indexOf(x) < 0; });
      if (!extra.length && !missing.length) return ok();
      var h = diag ? diag(extra, missing) : null;
      return wrong(h ? h.code : 'set', h ? h.hint : null);
    };
  };
  /* ---- multiple choice: opts = [{html, right, why}] (why = hint for that wrong choice) -> { options, check, answerKey } after shuffling ---- */
  K.mc = function (r, opts, keepOrder) {
    var order = keepOrder ? opts.slice() : r.shuffle(opts), keys = ['A', 'B', 'C', 'D', 'E'];
    var options = order.map(function (o, i) { return { key: keys[i], html: o.html, right: !!o.right, why: o.why, code: o.code || ('opt' + opts.indexOf(o)) }; });
    var right = options.filter(function (o) { return o.right; })[0];
    return {
      options: options, answerKey: right.key, answerHtml: right.key + '. ' + right.html,
      check: function (resp) {
        if (!resp) return form('empty', 'Choose an answer.');
        if (resp === right.key) return ok();
        var o = options.filter(function (x) { return x.key === resp; })[0];
        return wrong('mc-' + (o ? o.code : 'x'), o && o.why ? o.why : null);
      }
    };
  };
  /* LaTeX product of primes in exponent form */
  K.fac = function (n) { return HW.texFactors(nt.factor(n)); };
  K.exp = function (n) { return HW.texExpanded(n); };
  K.ladderSolution = function (n) {
    var rows = [], cur = n;
    while (cur > 1) { var p = nt.smallestPrimeFactor(cur); rows.push(p + ' & ' + F(cur) + '\\\\'); cur /= p; }
    rows.push(' & 1');
    return '\\[\\begin{array}{r|l}' + rows.join('') + '\\end{array}\\]';
  };

  /* ---------------- lesson registry ---------------- */
  HW.lessons = HW.lessons || {};
  HW.defineLesson = function (def) {
    var items = [];
    function walk(sections, extra) {
      var sec = null;
      (sections || []).forEach(function (q) {
        if (q.section) sec = q.section; q.sectionLabel = sec;
        q.parts.forEach(function (p, i) {
          items.push({ id: p.id, q: q, p: p, extra: !!extra, level: p.level, outcome: p.outcome || q.outcome || def.outcome,
            label: (extra ? 'Extra ' : '') + q.num + (q.parts.length > 1 ? '(' + (p.sub || String.fromCharCode(97 + i)) + ')' : '') });
        });
      });
    }
    walk(def.questions, false); walk(def.extra, true);
    def.items = items; def.byId = {}; items.forEach(function (it) { def.byId[it.id] = it; });
    def.required = items.filter(function (it) { return !it.extra; });
    def.extras = items.filter(function (it) { return it.extra; });
    HW.lessons[def.id] = def;
    return def;
  };
  /* Build one question instance from its seeds. shared params come from the question seed so parts stay consistent. */
  HW.makeInstance = function (lesson, item, seed, qseed) {
    var q = item.q, shared = null;
    if (q.shared) shared = q.shared(HW.rng((qseed >>> 0) ^ HW.hashStr(lesson.id + ':' + q.num)));
    var inst = item.p.make(HW.rng((seed >>> 0) ^ HW.hashStr(lesson.id + ':' + item.id)), shared);
    inst.stem = typeof q.stem === 'function' ? q.stem(shared) : q.stem;
    inst.tries = inst.tries || 3;
    inst.hints = inst.hints || [];
    return inst;
  };
})(window);
