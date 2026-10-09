/* Step-by-step answer builders: the division ladder and the factor tree.
 * Each checks every step as the student goes (the method is what the lesson teaches) and reports
 * mistakes through opt.onStep({ ok, code, hint }). When the structure is finished, a final
 * "write it as a product of primes" box appears; value() returns { done, final, steps }. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, nt = HW.nt, W = HW.widgets;
  var coarse = function () { try { return root.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };
  function numIn(cls) { var i = el('input', 'ans-input ' + (cls || 'ans-short')); i.type = 'text'; i.setAttribute('inputmode', 'numeric'); i.autocomplete = 'off'; return i; }
  function readInt(s) { s = String(s || '').replace(/[\s, ]/g, ''); return /^\d+$/.test(s) ? Number(s) : null; }
  function f(n) { return HW.k(HW.fmt(n)); }

  /* ================= division ladder ================= */
  W.ladder = function (opt) {
    var n = opt.n, wrap = el('div', 'w-ladder'), steps = [], cur = n, enter = null, finalW = null, errs = 0, stepErrs = 0, done = false;
    var table = el('div', 'ladder'); wrap.appendChild(table);
    var finalBox = el('div', 'ladder-final hidden'); wrap.appendChild(finalBox);
    var helpBtn = el('button', 'btn btn-ghost btn-small hidden', 'Show me this step'); helpBtn.type = 'button';
    function row(div, num, cls) { var r = el('div', 'lrow ' + (cls || '')); var d = el('div', 'ldiv'), q = el('div', 'lnum'); if (div != null) d.innerHTML = typeof div === 'string' ? div : f(div); if (num != null) q.innerHTML = typeof num === 'string' ? num : f(num); r.appendChild(d); r.appendChild(q); return r; }
    var active = null;
    function draw() {
      table.innerHTML = '';
      table.appendChild(row(null, n, 'lstart'));
      steps.forEach(function (s, i) { var r = table.lastChild; r.querySelector('.ldiv').innerHTML = f(s.d); table.appendChild(row(null, s.q, s.q === 1 ? 'lend' : '')); });
      if (!done) {
        var last = table.lastChild, dIn = numIn('ans-tiny'), qIn = numIn('ans-short');
        dIn.placeholder = 'prime'; dIn.setAttribute('aria-label', 'Prime divisor of ' + cur);
        last.querySelector('.ldiv').appendChild(dIn);
        var nr = el('div', 'lrow lnext'); var nd = el('div', 'ldiv'), nq = el('div', 'lnum'); qIn.placeholder = cur + ' ÷ ?'; qIn.setAttribute('aria-label', 'Quotient');
        nq.appendChild(qIn); nr.appendChild(nd); nr.appendChild(nq); table.appendChild(nr);
        var go = el('button', 'btn btn-small lgo', 'Next step ↵'); go.type = 'button'; nd.appendChild(go);
        go.addEventListener('click', submit);
        dIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (!qIn.value) qIn.focus(); else submit(); } });
        qIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
        active = { d: dIn, q: qIn };
        nd.appendChild(helpBtn);
        if (!coarse()) setTimeout(function () { try { dIn.focus({ preventScroll: true }); } catch (e) {} }, 30);
      } else active = null;
    }
    function report(ok, code, hint) { if (!ok) { errs++; stepErrs++; helpBtn.classList.toggle('hidden', errs < 2); } if (opt.onStep) opt.onStep({ ok: ok, code: code, hint: hint }); }
    function submit() {
      if (!active || wrap.classList.contains('off')) return;
      var d = readInt(active.d.value), q = readInt(active.q.value);
      if (d == null) { if (opt.onStep) opt.onStep({ ok: false, form: true, code: 'ladder-nodiv', hint: 'Write the prime you are dividing by in the box on the left.' }); active.d.focus(); return; }
      if (d === 1) return report(false, 'ladder-one', 'Dividing by \\(1\\) doesn’t break \\(' + HW.fmt(cur) + '\\) down. The ladder only uses primes.');
      if (!nt.isPrime(d)) return report(false, 'ladder-notprime', '\\(' + d + '\\) isn’t prime (it has more than two factors). Every divisor on a ladder must be a prime.');
      if (cur % d) return report(false, 'ladder-nodivide', '\\(' + d + '\\) doesn’t divide \\(' + HW.fmt(cur) + '\\) evenly: \\(' + HW.fmt(cur) + '\\div ' + d + '\\) isn’t a whole number.');
      var sp = nt.smallestPrimeFactor(cur);
      if (d !== sp && opt.smallestFirst !== false) return report(false, 'ladder-notsmallest', 'A <b>smaller</b> prime than \\(' + d + '\\) also divides \\(' + HW.fmt(cur) + '\\). The ladder divides by the smallest prime that fits first: test \\(2\\), then \\(3\\), then \\(5\\), …');
      if (q == null) { if (opt.onStep) opt.onStep({ ok: false, form: true, code: 'ladder-noquot', hint: 'Now write \\(' + HW.fmt(cur) + '\\div ' + d + '\\) in the box on the right.' }); active.q.focus(); return; }
      if (q !== cur / d) return report(false, 'ladder-quotient', 'Check the division: \\(' + HW.fmt(cur) + '\\div ' + d + '\\) is not \\(' + HW.fmt(q) + '\\).');
      steps.push({ d: d, q: q }); cur = q; errs = 0; helpBtn.classList.add('hidden');
      if (cur === 1) finish();
      draw(); if (opt.onStep) opt.onStep({ ok: true });
    }
    helpBtn.addEventListener('click', function () { var d = nt.smallestPrimeFactor(cur); steps.push({ d: d, q: cur / d, shown: true }); cur = cur / d; errs = 0; helpBtn.classList.add('hidden'); if (opt.onStep) opt.onStep({ ok: false, code: 'ladder-shown', shown: true, hint: 'Step filled in: \\(' + HW.fmt(cur * d) + '\\div ' + d + '=' + HW.fmt(cur) + '\\).' }); if (cur === 1) finish(); draw(); });
    function finish() {
      done = true;
      finalBox.classList.remove('hidden'); finalBox.innerHTML = '';
      finalBox.appendChild(el('div', 'final-label', HW.tex('The quotient reached \\(1\\). Now write \\(' + HW.fmt(n) + '\\) as a product of primes' + (opt.exponent === false ? '' : ' in exponent form') + ':')));
      finalW = W.math({ before: '\\(' + HW.fmt(n) + '=\\)' }); finalW.onEnter(function () { if (enter) enter(); });
      finalBox.appendChild(finalW.node); setTimeout(function () { finalW.focus(); }, 40);
      if (opt.onComplete) opt.onComplete();
    }
    draw();
    return { node: wrap, value: function () { return { done: done, final: finalW ? finalW.value() : '', steps: steps.slice(), stepErrors: stepErrs }; },
      focus: function () { if (finalW) finalW.focus(); }, clear: function () { if (finalW) finalW.clear(); }, structured: true,
      ready: function () { return done; }, disable: function (on) { wrap.classList.toggle('off', !!on); if (finalW) finalW.disable(on); },
      onEnter: function (fn) { enter = fn; } };
  };

  /* ================= factor tree ================= */
  W.tree = function (opt) {
    var n = opt.n, wrap = el('div', 'w-tree'), enter = null, finalW = null, done = false, stepErrs = 0, errsHere = {};
    var rootNode = { v: n, kids: null, circled: false, id: 'r' }, idc = 0;
    var canvas = el('div', 'tree-scroll'), finalBox = el('div', 'ladder-final hidden');
    wrap.appendChild(el('div', 'w-help tree-help', 'Click a number to work on it: <b>split</b> a composite number into a factor pair, or <b>circle</b> a prime. Keep going until every branch ends in a circled prime.'));
    wrap.appendChild(canvas); wrap.appendChild(finalBox);
    var openId = null;
    function leaves(t, out) { out = out || []; if (!t.kids) out.push(t); else t.kids.forEach(function (k) { leaves(k, out); }); return out; }
    function report(ok, code, hint, form) { if (!ok && !form) stepErrs++; if (opt.onStep) opt.onStep({ ok: ok, code: code, hint: hint, form: form }); }
    function draw() {
      canvas.innerHTML = '';
      var tree = el('div', 'tree'); tree.appendChild(nodeEl(rootNode)); canvas.appendChild(tree);
    }
    function nodeEl(t) {
      var li = el('div', 'tn' + (t.kids ? ' has-kids' : ''));
      var lab = el('button', 'tlabel' + (t.circled ? ' circled' : '') + (!t.kids && !t.circled ? ' open' : ''), f(t.v)); lab.type = 'button'; lab.dataset.v = t.v;
      if (!t.kids && !t.circled) { lab.title = 'Work on ' + t.v; lab.addEventListener('click', function () { openId = openId === t.id ? null : t.id; draw(); }); }
      else lab.disabled = true;
      li.appendChild(lab);
      if (openId === t.id && !t.kids && !t.circled) li.appendChild(menuEl(t));
      if (t.kids) { var kids = el('div', 'tkids'); t.kids.forEach(function (k) { kids.appendChild(nodeEl(k)); }); li.appendChild(kids); }
      return li;
    }
    function menuEl(t) {
      var m = el('div', 'tmenu');
      var row = el('div', 'tsplit'), a = numIn('ans-tiny'), b = numIn('ans-tiny'), ok = el('button', 'btn btn-small', 'Split'); ok.type = 'button';
      row.appendChild(el('span', '', f(t.v) + ' ' + HW.k('='))); row.appendChild(a); row.appendChild(el('span', '', HW.k('\\times'))); row.appendChild(b); row.appendChild(ok);
      var circ = el('button', 'btn btn-ghost btn-small tcircle', '◯ It’s prime — circle it'); circ.type = 'button';
      m.appendChild(row); m.appendChild(circ);
      function split() {
        var x = readInt(a.value), y = readInt(b.value);
        if (x == null || y == null) return report(false, 'tree-blank', 'Fill in both numbers of the factor pair.', true);
        if (nt.isPrime(t.v)) { bump(t); return report(false, 'tree-splitprime', '\\(' + t.v + '\\) is prime: its only factor pair is \\(1\\times ' + t.v + '\\). Circle it instead of splitting it.'); }
        if (x === 1 || y === 1) { bump(t); return report(false, 'tree-one', 'A pair with \\(1\\) doesn’t break \\(' + HW.fmt(t.v) + '\\) down. Choose two factors that are both bigger than \\(1\\).'); }
        if (x * y !== t.v) { bump(t); return report(false, 'tree-product', '\\(' + x + '\\times ' + y + '=' + HW.fmt(x * y) + '\\), not \\(' + HW.fmt(t.v) + '\\). Find two numbers that multiply to \\(' + HW.fmt(t.v) + '\\).'); }
        t.kids = [{ v: x, kids: null, circled: false, id: 'n' + (++idc) }, { v: y, kids: null, circled: false, id: 'n' + (++idc) }];
        openId = null; draw(); report(true); check();
      }
      ok.addEventListener('click', split);
      a.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (!b.value) b.focus(); else split(); } });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); split(); } });
      circ.addEventListener('click', function () {
        if (!nt.isPrime(t.v)) { bump(t); return report(false, 'tree-circlecomposite', '\\(' + HW.fmt(t.v) + '\\) isn’t prime — it has more than two factors, so this branch has to keep going.'); }
        t.circled = true; openId = null; draw(); report(true); check();
      });
      if (!coarse()) setTimeout(function () { try { a.focus({ preventScroll: true }); } catch (e) {} }, 30);
      if ((errsHere[t.id] || 0) >= 2) {
        var show = el('button', 'btn btn-ghost btn-small', 'Show me this step'); show.type = 'button';
        show.addEventListener('click', function () {
          if (nt.isPrime(t.v)) t.circled = true;
          else { var p = nt.smallestPrimeFactor(t.v); t.kids = [{ v: p, kids: null, circled: false, id: 'n' + (++idc) }, { v: t.v / p, kids: null, circled: false, id: 'n' + (++idc) }]; }
          openId = null; draw(); report(false, 'tree-shown', 'Step filled in for \\(' + HW.fmt(t.v) + '\\).'); check();
        });
        m.appendChild(show);
      }
      return m;
    }
    function bump(t) { errsHere[t.id] = (errsHere[t.id] || 0) + 1; setTimeout(draw, 0); }
    function check() {
      if (done) return;
      var ls = leaves(rootNode);
      if (ls.every(function (l) { return l.circled; })) {
        done = true;
        finalBox.classList.remove('hidden'); finalBox.innerHTML = '';
        finalBox.appendChild(el('div', 'final-label', HW.tex('Every branch ends in a prime. Now write \\(' + HW.fmt(n) + '\\) as a product of primes' + (opt.exponent === false ? '' : ' in exponent form') + ':')));
        finalW = W.math({ before: '\\(' + HW.fmt(n) + '=\\)' }); finalW.onEnter(function () { if (enter) enter(); });
        finalBox.appendChild(finalW.node); setTimeout(function () { finalW.focus(); }, 40);
        if (opt.onComplete) opt.onComplete();
      }
    }
    if (opt.start) { rootNode.kids = opt.start.map(function (v) { return { v: v, kids: null, circled: false, id: 'n' + (++idc) }; }); }
    draw();
    return { node: wrap, value: function () { return { done: done, final: finalW ? finalW.value() : '', leaves: leaves(rootNode).map(function (l) { return l.v; }), stepErrors: stepErrs }; },
      focus: function () { if (finalW) finalW.focus(); }, clear: function () { if (finalW) finalW.clear(); }, structured: true,
      ready: function () { return done; }, disable: function (on) { wrap.classList.toggle('off', !!on); if (finalW) finalW.disable(on); },
      onEnter: function (fn) { enter = fn; } };
  };
})(window);
