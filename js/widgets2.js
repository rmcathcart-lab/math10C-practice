/* More answer widgets (Lessons 2 onward): keypad sets for the math input, ordering, tables of choices,
 * and several labelled boxes. Same interface as js/widgets.js: { node, value(), focus(), clear(), disable(on), onEnter(fn) }. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, W = HW.widgets;
  var coarse = function () { try { return root.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };

  /* ---------- keypad sets for W.math({ keys: 'radical' | 'fraction' | 'decimal' | 'expr' | 'var' }) ---------- */
  function d(n) { return { label: String(n), tex: String(n), plain: String(n) }; }
  var K = {
    del: { label: '⌫', fn: 'del', title: 'Delete' }, clear: { label: 'clear', fn: 'clear' },
    left: { label: '◀', fn: 'left', title: 'Move left' }, right: { label: '▶', fn: 'right', title: 'Move right (out of a box)' },
    enter: { label: 'Check ↵', fn: 'enter', wide: true },
    sqrt: { label: '√', tex: '\\sqrt{#0}', plain: 'sqrt(', title: 'Square root', fn2: 1 },
    cbrt: { label: '∛', tex: '\\sqrt[3]{#0}', plain: 'cbrt(', title: 'Cube root' },
    nrt: { label: '<sup>n</sup>√', tex: '\\sqrt[#?]{#0}', plain: '\\sqrt[]{}', title: 'Root with any index' },
    frac: { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' },
    pow: { label: 'x<sup>n</sup>', tex: '#@^{#?}', plain: '^', title: 'Exponent' },
    bar: { label: '<span style="text-decoration:overline">x</span>', tex: '\\overline{#0}', plain: '\\overline{}', title: 'Repeating bar: put it over the digits that repeat' },
    pi: { label: 'π', tex: '\\pi', plain: 'π' },
    neg: { label: '−', tex: '-', plain: '-' }, dot: { label: '.', tex: '.', plain: '.' }, times: { label: '×', tex: '\\times', plain: ' × ', title: 'Multiply' },
    x: { label: 'x', tex: 'x', plain: 'x' }, y: { label: 'y', tex: 'y', plain: 'y' }, a: { label: 'a', tex: 'a', plain: 'a' }, b: { label: 'b', tex: 'b', plain: 'b' },
    abs: { label: '|x|', tex: '\\left|#0\\right|', plain: '|', title: 'Absolute value' }
  };
  W.KEYSETS = {
    radical: [[d(7), d(8), d(9), K.sqrt, K.cbrt, K.del], [d(4), d(5), d(6), K.nrt, K.frac, K.clear], [d(1), d(2), d(3), K.neg, K.left, K.right], [d(0), K.dot, K.times, K.enter]],
    fraction: [[d(7), d(8), d(9), K.frac, K.del], [d(4), d(5), d(6), K.neg, K.clear], [d(1), d(2), d(3), K.left, K.right], [d(0), K.dot, K.enter]],
    decimal: [[d(7), d(8), d(9), K.bar, K.del], [d(4), d(5), d(6), K.neg, K.clear], [d(1), d(2), d(3), K.left, K.right], [d(0), K.dot, K.frac, K.enter]],
    expr: [[d(7), d(8), d(9), K.sqrt, K.nrt, K.del], [d(4), d(5), d(6), K.frac, K.pow, K.clear], [d(1), d(2), d(3), K.pi, K.left, K.right], [d(0), K.dot, K.neg, K.times, K.enter]],
    var: [[d(7), d(8), d(9), K.sqrt, K.cbrt, K.nrt, K.del], [d(4), d(5), d(6), K.x, K.y, K.pow, K.clear], [d(1), d(2), d(3), K.a, K.b, K.left, K.right], [d(0), K.neg, K.times, K.frac, K.enter]],
    abs: [[d(7), d(8), d(9), K.abs, K.del], [d(4), d(5), d(6), K.neg, K.clear], [d(1), d(2), d(3), K.left, K.right], [d(0), K.dot, K.frac, K.enter]]
  };
  W.KEYHELP = {
    radical: ['Use <b>√</b>, <b>∛</b> or <b><sup>n</sup>√</b> for roots. Type the number in front first, e.g. 3 then √ then 5 for ' + HW.k('3\\sqrt{5}') + '. Press <b>▶</b> to step out of the root.',
      'Type roots as <code>3sqrt(5)</code> or <code>2cbrt(4)</code>.'],
    fraction: ['Type the top number, then <b><sup>a</sup>⁄<sub>b</sub></b>, then the bottom number. Press <b>▶</b> to step out of the fraction.', 'Type a fraction as <code>3/4</code>.'],
    decimal: ['For a repeating decimal, type the digits that don’t repeat, then press <b><span style="text-decoration:overline">x</span></b> and type the repeating block, e.g. ' + HW.k('0.1\\overline{6}') + '.', 'For a repeating decimal, type <code>0.1\\overline{6}</code>.'],
    expr: ['Use the keypad for roots, fractions, exponents and π. Press <b>▶</b> to step out of a box.', 'Type roots as <code>sqrt(5)</code>, fractions as <code>3/4</code> and powers as <code>2^3</code>.'],
    var: ['Type the number in front, then the variables, then the root, e.g. 3, x, √, 2, x for ' + HW.k('3x\\sqrt{2x}') + '. Use <b>x<sup>n</sup></b> for exponents.', 'Type e.g. <code>3x sqrt(2x)</code> or <code>x^2 cbrt(3y)</code>.'],
    abs: ['Use <b>|x|</b> for absolute value bars.', 'Type absolute value bars with <code>|</code>.']
  };

  /* ---------- ordering: tap the items in order ---------- */
  W.order = function (opt) {
    var wrap = el('div', 'w-order'), seq = [], enter = null, byId = {};
    var head = el('div', 'ord-head', '<span>' + HW.esc(opt.first || 'least') + '</span><span class="ord-arrow">→</span><span>' + HW.esc(opt.last || 'greatest') + '</span>');
    var line = el('div', 'ord-line'), pool = el('div', 'ord-pool');
    wrap.appendChild(head); wrap.appendChild(line); wrap.appendChild(pool);
    var tools = el('div', 'ord-tools'), undo = el('button', 'btn btn-small btn-ghost', '↶ Undo'), reset = el('button', 'btn btn-small btn-ghost', 'Start over');
    undo.type = reset.type = 'button'; tools.appendChild(undo); tools.appendChild(reset); wrap.appendChild(tools);
    wrap.appendChild(el('div', 'w-help', 'Tap the items in order, starting with the ' + HW.esc(opt.first || 'least') + '. Tap a placed item to take it back.'));
    opt.items.forEach(function (it) { byId[it.id] = it; });
    function draw() {
      line.innerHTML = ''; pool.innerHTML = '';
      seq.forEach(function (id, i) {
        if (i) line.appendChild(el('span', 'ord-sep', opt.sep || ','));
        var b = el('button', 'ord-chip placed', HW.tex(byId[id].html)); b.type = 'button'; b.title = 'Take this one back';
        b.addEventListener('click', function () { if (wrap.classList.contains('off')) return; seq.splice(seq.indexOf(id), 1); draw(); });
        line.appendChild(b);
      });
      for (var k = seq.length; k < opt.items.length; k++) { if (k) line.appendChild(el('span', 'ord-sep', opt.sep || ',')); line.appendChild(el('span', 'ord-slot', String(k + 1))); }
      opt.items.forEach(function (it) {
        if (seq.indexOf(it.id) >= 0) return;
        var b = el('button', 'ord-chip', HW.tex(it.html)); b.type = 'button';
        b.addEventListener('click', function () { if (wrap.classList.contains('off')) return; seq.push(it.id); draw(); });
        pool.appendChild(b);
      });
      pool.classList.toggle('empty', seq.length === opt.items.length);
    }
    undo.addEventListener('click', function () { seq.pop(); draw(); });
    reset.addEventListener('click', function () { seq = []; draw(); });
    draw();
    return { node: wrap, value: function () { return seq.slice(); }, focus: function () {}, clear: function () { seq = []; draw(); },
      disable: function (on) { wrap.classList.toggle('off', !!on); undo.disabled = reset.disabled = !!on; }, onEnter: function (fn) { enter = fn; }, set: function (v) { seq = (v || []).slice(); draw(); } };
  };

  /* ---------- a table: one choice per row (multi: any number per row) ---------- */
  W.grid = function (opt) {
    var wrap = el('div', 'w-grid'), state = {}, enter = null, btns = [];
    var scroller = el('div', 'grid-scroll'), tb = el('table', 'grid-tbl');
    var h = '<thead><tr><th>' + (opt.rowHead ? HW.tex(opt.rowHead) : '') + '</th>' + opt.cols.map(function (c) { return '<th>' + HW.tex(c.html) + '</th>'; }).join('') + '</tr></thead>';
    tb.innerHTML = h;
    var body = el('tbody');
    opt.rows.forEach(function (r) {
      var tr = el('tr'); tr.appendChild(el('th', 'grid-rowh', HW.tex(r.html)));
      state[r.id] = opt.multi ? [] : null;
      opt.cols.forEach(function (c) {
        var td = el('td'), b = el('button', 'grid-btn' + (opt.multi ? ' multi' : ''), opt.multi ? '' : ''); b.type = 'button';
        b.setAttribute('aria-label', (r.label || r.id) + ': ' + (c.label || c.id)); b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          if (wrap.classList.contains('off')) return;
          if (opt.multi) { var a = state[r.id], i = a.indexOf(c.id); if (i >= 0) a.splice(i, 1); else a.push(c.id); }
          else state[r.id] = state[r.id] === c.id ? null : c.id;
          paint();
        });
        btns.push({ b: b, r: r.id, c: c.id }); td.appendChild(b); tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    tb.appendChild(body); scroller.appendChild(tb); wrap.appendChild(scroller);
    wrap.appendChild(el('div', 'w-help', opt.help || (opt.multi ? 'Tap every box that applies in each row. Tap again to clear it.' : 'Choose one in each row.')));
    function paint() { btns.forEach(function (x) { var on = opt.multi ? state[x.r].indexOf(x.c) >= 0 : state[x.r] === x.c; x.b.classList.toggle('on', on); x.b.setAttribute('aria-pressed', String(on)); x.b.innerHTML = on ? (opt.multi ? '✓' : '●') : ''; }); }
    return { node: wrap, value: function () { var o = {}; Object.keys(state).forEach(function (k) { o[k] = Array.isArray(state[k]) ? state[k].slice() : state[k]; }); return o; }, focus: function () {},
      clear: function () { Object.keys(state).forEach(function (k) { state[k] = opt.multi ? [] : null; }); paint(); },
      disable: function (on) { wrap.classList.toggle('off', !!on); btns.forEach(function (x) { x.b.disabled = !!on; }); }, onEnter: function (fn) { enter = fn; },
      set: function (v) { Object.keys(v || {}).forEach(function (k) { state[k] = Array.isArray(v[k]) ? v[k].slice() : v[k]; }); paint(); } };
  };

  /* ---------- several labelled boxes ---------- */
  W.fields = function (opt) {
    var wrap = el('div', 'w-fields'), enter = null, inputs = [];
    opt.fields.forEach(function (f, i) {
      var row = el('div', 'ans-row fld-row');
      if (f.label) row.appendChild(el('span', 'fld-label', HW.tex(f.label)));
      if (f.before) row.appendChild(el('span', 'ans-affix', HW.tex(f.before)));
      var inp = el('input', 'ans-input ' + (f.wide ? '' : 'ans-short')); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('inputmode', f.mode === 'text' ? 'text' : 'decimal'); if (f.placeholder) inp.placeholder = f.placeholder;
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (i + 1 < inputs.length && !inputs[i + 1].value) inputs[i + 1].focus(); else if (enter) enter(); } });
      row.appendChild(inp);
      if (f.after) row.appendChild(el('span', 'ans-affix', HW.tex(f.after)));
      inputs.push(inp); wrap.appendChild(row);
    });
    return { node: wrap, value: function () { return inputs.map(function (x) { return x.value.trim(); }); }, focus: function () { if (!coarse() && inputs[0]) inputs[0].focus({ preventScroll: true }); },
      clear: function () { inputs.forEach(function (x) { x.value = ''; }); }, disable: function (on) { wrap.classList.toggle('off', !!on); inputs.forEach(function (x) { x.disabled = !!on; }); },
      onEnter: function (fn) { enter = fn; }, set: function (v) { (v || []).forEach(function (x, i) { if (inputs[i]) inputs[i].value = x; }); } };
  };
})(window);
