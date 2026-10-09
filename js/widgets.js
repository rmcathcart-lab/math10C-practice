/* Answer widgets. Every widget returns { node, value(), focus(), clear(), disable(on), onEnter(fn) }.
 * value() is what the question's check() receives. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, W = HW.widgets = {};
  var coarse = function () { try { return root.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };

  function keypad(rows, press) {
    var kp = el('div', 'kp');
    rows.forEach(function (row) {
      var r = el('div', 'kprow');
      row.forEach(function (k) {
        var b = el('button', 'kpk' + (k.fn ? ' kpfn' : '') + (k.wide ? ' kpwide' : ''), k.label); b.type = 'button';
        if (k.title) b.title = k.title;
        b.addEventListener('pointerdown', function (e) { e.preventDefault(); press(k); });
        b.addEventListener('click', function (e) { e.preventDefault(); });
        b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(k); } });
        r.appendChild(b);
      });
      kp.appendChild(r);
    });
    return kp;
  }
  W.keypad = keypad;

  function textInsert(inp, text) {
    var st = inp.selectionStart == null ? inp.value.length : inp.selectionStart, en = inp.selectionEnd == null ? st : inp.selectionEnd;
    inp.value = inp.value.slice(0, st) + text + inp.value.slice(en);
    var pos = st + text.length; try { inp.setSelectionRange(pos, pos); } catch (e) {}
    inp.dispatchEvent(new Event('input'));
  }
  function textBack(inp) {
    var st = inp.selectionStart == null ? inp.value.length : inp.selectionStart, en = inp.selectionEnd == null ? st : inp.selectionEnd;
    if (en > st) inp.value = inp.value.slice(0, st) + inp.value.slice(en);
    else if (st > 0) { inp.value = inp.value.slice(0, st - 1) + inp.value.slice(st); st--; }
    try { inp.setSelectionRange(st, st); } catch (e) {}
    inp.dispatchEvent(new Event('input'));
  }
  function plainInput(ph, mode) {
    var inp = el('input', 'ans-input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
    inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocorrect', 'off'); inp.placeholder = ph || '';
    inp.setAttribute('inputmode', mode || 'decimal');
    return inp;
  }

  /* ---- a single number ---- */
  W.number = function (opt) {
    opt = opt || {};
    var wrap = el('div', 'w-number'), row = el('div', 'ans-row'), enter = null;
    if (opt.before) row.appendChild(el('span', 'ans-affix', HW.tex(opt.before)));
    var inp = plainInput(opt.placeholder || 'Your answer'); row.appendChild(inp);
    if (opt.after) row.appendChild(el('span', 'ans-affix', HW.tex(opt.after)));
    wrap.appendChild(row);
    if (opt.nr) wrap.appendChild(el('div', 'nr-note', 'Numerical response: up to 4 characters, written from the left.'));
    var kp = keypad([[{ label: '7', v: '7' }, { label: '8', v: '8' }, { label: '9', v: '9' }, { label: '⌫', fn: 'del', title: 'Delete' }],
      [{ label: '4', v: '4' }, { label: '5', v: '5' }, { label: '6', v: '6' }, { label: '−', v: '-' }],
      [{ label: '1', v: '1' }, { label: '2', v: '2' }, { label: '3', v: '3' }, { label: '.', v: '.' }],
      [{ label: '0', v: '0', wide: true }, { label: 'clear', fn: 'clear' }, { label: 'Check ↵', fn: 'enter' }]],
      function (k) { if (k.fn === 'del') textBack(inp); else if (k.fn === 'clear') { inp.value = ''; } else if (k.fn === 'enter') { if (enter) enter(); } else textInsert(inp, k.v); if (!coarse()) inp.focus(); });
    kp.classList.add('kp-small'); wrap.appendChild(kp);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (enter) enter(); } });
    return { node: wrap, value: function () { return inp.value; }, focus: function () { if (!coarse()) inp.focus({ preventScroll: true }); },
      clear: function () { inp.value = ''; }, disable: function (on) { inp.disabled = on; wrap.classList.toggle('off', !!on); },
      onEnter: function (fn) { enter = fn; }, set: function (v) { inp.value = v; } };
  };

  /* ---- a list of whole numbers, entered as chips ---- */
  W.list = function (opt) {
    opt = opt || {};
    var wrap = el('div', 'w-list'), box = el('div', 'chipbox'), chips = el('div', 'chips'), enter = null, items = [];
    var inp = plainInput(opt.placeholder || 'Type a number, then press Enter or comma', 'numeric'); inp.classList.add('chip-input');
    box.appendChild(chips); box.appendChild(inp); wrap.appendChild(box);
    var hint = el('div', 'w-help', opt.help || 'Add each number with <b>Enter</b> or a comma. Tap a number to remove it.'); wrap.appendChild(hint);
    function draw() {
      chips.innerHTML = '';
      items.forEach(function (v, i) {
        var c = el('button', 'chip', HW.esc(v) + '<span class="chip-x" aria-hidden="true">×</span>'); c.type = 'button'; c.title = 'Remove ' + v;
        c.addEventListener('click', function () { items.splice(i, 1); draw(); inp.focus(); });
        chips.appendChild(c);
      });
      box.classList.toggle('has', items.length > 0);
    }
    function commit() {
      var t = inp.value.trim(); if (!t) return true;
      var p = HW.parse.numberList(t);
      if (!p.ok) { box.classList.add('shake'); setTimeout(function () { box.classList.remove('shake'); }, 400); return false; }
      p.values.forEach(function (v) { items.push(v); }); inp.value = ''; draw(); return true;
    }
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (inp.value.trim()) commit(); else if (enter) enter(); }
      else if (e.key === ',' || e.key === ' ' || e.key === ';') { e.preventDefault(); commit(); }
      else if (e.key === 'Backspace' && !inp.value && items.length) { items.pop(); draw(); }
    });
    inp.addEventListener('input', function () { if (/[,;\s]/.test(inp.value)) { var keep = /[,;\s]$/.test(inp.value); commit(); if (!keep) {} } });
    box.addEventListener('click', function (e) { if (e.target === box || e.target === chips) inp.focus(); });
    var kp = keypad([[{ label: '7', v: '7' }, { label: '8', v: '8' }, { label: '9', v: '9' }, { label: '⌫', fn: 'del' }],
      [{ label: '4', v: '4' }, { label: '5', v: '5' }, { label: '6', v: '6' }, { label: 'add ,', fn: 'add', title: 'Add this number to the list' }],
      [{ label: '1', v: '1' }, { label: '2', v: '2' }, { label: '3', v: '3' }, { label: 'clear', fn: 'clear' }],
      [{ label: '0', v: '0', wide: true }, { label: 'Check ↵', fn: 'enter', wide: true }]],
      function (k) {
        if (k.fn === 'del') { if (inp.value) textBack(inp); else if (items.length) { items.pop(); draw(); } }
        else if (k.fn === 'add') commit();
        else if (k.fn === 'clear') { items = []; inp.value = ''; draw(); }
        else if (k.fn === 'enter') { commit(); if (enter) enter(); }
        else textInsert(inp, k.v);
        if (!coarse()) inp.focus();
      });
    kp.classList.add('kp-small'); wrap.appendChild(kp);
    return { node: wrap, value: function () { commit(); return items.slice(); }, focus: function () { if (!coarse()) inp.focus({ preventScroll: true }); },
      clear: function () { items = []; inp.value = ''; draw(); }, disable: function (on) { inp.disabled = on; wrap.classList.toggle('off', !!on); },
      onEnter: function (fn) { enter = fn; }, set: function (arr) { items = (arr || []).slice(); draw(); }, mark: function (bad) { // highlight wrong chips
        Array.prototype.forEach.call(chips.children, function (c, i) { c.classList.toggle('bad', bad.indexOf(items[i]) >= 0); }); } };
  };

  /* ---- a math expression (products of powers etc.). Uses MathLive when it has loaded, otherwise a text box with a live preview ---- */
  function mathReady() { return !!(root.customElements && root.customElements.get('math-field')); }
  W.mathReady = mathReady;
  function plainToLatex(t) {
    var s = HW.parse.plain(t);
    s = s.replace(/\^\(?(\d+)\)?/g, '^{$1}').replace(/\*/g, '\\times ');
    return s;
  }
  W.math = function (opt) {
    opt = opt || {};
    var wrap = el('div', 'w-math'), enter = null, api = {};
    if (mathReady()) {
      var mf = document.createElement('math-field'); mf.className = 'mf';
      mf.setAttribute('math-virtual-keyboard-policy', 'manual');
      try { mf.menuItems = []; } catch (e) {}
      try { mf.smartSuperscript = false; } catch (e) {}
      try { mf.inlineShortcuts = Object.assign({}, mf.inlineShortcuts || {}, { '*': '\\times' }); } catch (e) {}
      function noPhoneKb() { try { var sink = mf.shadowRoot && mf.shadowRoot.querySelector('[part="keyboard-sink"]'); if (sink) sink.setAttribute('inputmode', coarse() ? 'none' : 'text'); } catch (e) {} }
      mf.addEventListener('focusin', noPhoneKb); mf.addEventListener('pointerdown', noPhoneKb);
      mf.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (enter) enter(); } });
      mf.addEventListener('mount', function () { if (api.wantFocus) api.focus(); noPhoneKb(); });
      var row = el('div', 'ans-row'); if (opt.before) row.appendChild(el('span', 'ans-affix', HW.tex(opt.before)));
      row.appendChild(mf); wrap.appendChild(row);
      api.value = function () { return mf.value; };
      api.focus = function () { api.wantFocus = true; try { if (!coarse()) mf.focus({ preventScroll: true }); } catch (e) {} };
      api.clear = function () { mf.value = ''; };
      api.set = function (v) { try { mf.value = /\\/.test(v) ? v : plainToLatex(v); } catch (e) {} };
      api.disable = function (on) { try { mf.readOnly = !!on; } catch (e) {} wrap.classList.toggle('off', !!on); };
      api.press = function (k) {
        try {
          if (k.fn === 'del') mf.executeCommand('deleteBackward');
          else if (k.fn === 'clear') mf.value = '';
          else if (k.fn === 'left') mf.executeCommand('moveToPreviousChar');
          else if (k.fn === 'right') mf.executeCommand('moveToNextChar');
          else mf.executeCommand(['insert', k.tex, { focus: true, feedback: false, mode: 'math', format: 'latex' }]);
        } catch (e) {}
        if (!coarse()) try { mf.focus(); } catch (e) {}
      };
      api.kind = 'mathlive';
    } else {
      var inp = plainInput(opt.placeholder || ({ radical: 'e.g. 3sqrt(5)', fraction: 'e.g. 3/4', decimal: 'e.g. 0.1\\overline{6}', expr: 'Your answer', var: 'e.g. 3x sqrt(2x)', abs: 'Your answer' })[opt.keys] || 'e.g. 2^3 × 3 × 11', 'text'); inp.classList.add('ans-wide');
      var prev = el('div', 'preview muted', 'Your answer will appear here as math.');
      var row2 = el('div', 'ans-row'); if (opt.before) row2.appendChild(el('span', 'ans-affix', HW.tex(opt.before)));
      row2.appendChild(inp); wrap.appendChild(row2); wrap.appendChild(prev);
      function upd() { var v = inp.value.trim(); prev.className = 'preview' + (v ? '' : ' muted'); prev.innerHTML = v ? '<span class="eyebrow">Reads as</span> ' + HW.k(plainToLatex(v)) : 'Your answer will appear here as math.'; }
      inp.addEventListener('input', upd);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (enter) enter(); } });
      api.value = function () { return inp.value; };
      api.focus = function () { if (!coarse()) inp.focus({ preventScroll: true }); };
      api.clear = function () { inp.value = ''; upd(); };
      api.set = function (v) { inp.value = v; upd(); };
      api.disable = function (on) { inp.disabled = on; wrap.classList.toggle('off', !!on); };
      api.press = function (k) {
        if (k.fn === 'del') textBack(inp);
        else if (k.fn === 'clear') { inp.value = ''; upd(); }
        else if (k.fn === 'left' || k.fn === 'right') { var p = (inp.selectionStart || 0) + (k.fn === 'left' ? -1 : 1); p = Math.max(0, Math.min(inp.value.length, p)); try { inp.setSelectionRange(p, p); } catch (e) {} }
        else textInsert(inp, k.plain);
        if (!coarse()) inp.focus();
      };
      api.kind = 'text';
    }
    var keys = (typeof opt.keys === 'string' && opt.keys !== 'product' ? W.KEYSETS[opt.keys] : typeof opt.keys === 'object' ? opt.keys : null) || [
      [{ label: '7', tex: '7', plain: '7' }, { label: '8', tex: '8', plain: '8' }, { label: '9', tex: '9', plain: '9' }, { label: '×', tex: '\\times', plain: ' × ', title: 'Multiply' }, { label: '⌫', fn: 'del' }],
      [{ label: '4', tex: '4', plain: '4' }, { label: '5', tex: '5', plain: '5' }, { label: '6', tex: '6', plain: '6' }, { label: 'x<sup>n</sup>', tex: '#@^{#?}', plain: '^', title: 'Exponent' }, { label: 'clear', fn: 'clear' }],
      [{ label: '1', tex: '1', plain: '1' }, { label: '2', tex: '2', plain: '2' }, { label: '3', tex: '3', plain: '3' }, { label: '◀', fn: 'left', title: 'Move left' }, { label: '▶', fn: 'right', title: 'Move right (out of an exponent)' }],
      [{ label: '0', tex: '0', plain: '0', wide: true }, { label: 'Check ↵', fn: 'enter', wide: true }]];
    W.KEYSETS = W.KEYSETS || {}; if (!W.KEYSETS.product) W.KEYSETS.product = keys;
    api.node = wrap; api.onEnter = function (fn) { enter = fn; };
    if (opt.keypad === false) return api; // a box inside W.fields, which draws one shared keypad
    var kp = keypad(keys, function (k) { if (k.fn === 'enter') { if (enter) enter(); return; } api.press(k); });
    kp.classList.add('kp-small'); wrap.appendChild(kp);
    var help = typeof opt.keys === 'string' && W.KEYHELP[opt.keys] ? W.KEYHELP[opt.keys][api.kind === 'mathlive' ? 0 : 1] : null;
    wrap.appendChild(el('div', 'w-help', help || (api.kind === 'mathlive'
      ? 'Use <b>×</b> between factors and <b>x<sup>n</sup></b> for an exponent (or type <b>^</b>). Press <b>▶</b> to step out of an exponent.'
      : 'Type <b>^</b> for an exponent and <b>*</b> or <b>×</b> between factors, e.g. <code>2^3 × 3 × 11</code>.')));
    api.node = wrap; api.onEnter = function (fn) { enter = fn; };
    return api;
  };

  /* ---- multiple choice (A–D) ---- */
  W.mc = function (opt) {
    var wrap = el('div', 'w-mc'), chosen = null, enter = null, btns = [];
    opt.options.forEach(function (o) {
      var b = el('button', 'mc-opt', '<span class="mc-key">' + o.key + '</span><span class="mc-text">' + HW.tex(o.html) + '</span>'); b.type = 'button';
      b.addEventListener('click', function () { if (wrap.classList.contains('off')) return; chosen = o.key; btns.forEach(function (x) { x.classList.toggle('on', x === b); }); });
      b.addEventListener('dblclick', function () { if (enter) enter(); });
      btns.push(b); wrap.appendChild(b);
    });
    if (opt.columns) wrap.classList.add('cols-' + opt.columns);
    return { node: wrap, value: function () { return chosen; }, focus: function () {}, clear: function () { chosen = null; btns.forEach(function (x) { x.classList.remove('on'); }); },
      disable: function (on) { wrap.classList.toggle('off', !!on); btns.forEach(function (b) { b.disabled = !!on; }); }, onEnter: function (fn) { enter = fn; },
      mark: function (key) { btns.forEach(function (b, i) { b.classList.toggle('bad', opt.options[i].key === key); }); } };
  };

  /* ---- choose several from a set of chips ---- */
  W.select = function (opt) {
    var wrap = el('div', 'w-select'), set = {}, enter = null, btns = [];
    var row = el('div', 'sel-row');
    opt.options.forEach(function (o) {
      var v = typeof o === 'object' ? o.value : o, label = typeof o === 'object' ? HW.tex(o.html) : HW.k(String(o));
      var b = el('button', 'sel-chip', label); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { if (wrap.classList.contains('off')) return; set[v] = !set[v]; b.classList.toggle('on', !!set[v]); b.setAttribute('aria-pressed', String(!!set[v])); });
      btns.push({ b: b, v: v }); row.appendChild(b);
    });
    wrap.appendChild(row);
    if (opt.help !== false) wrap.appendChild(el('div', 'w-help', opt.help || 'Tap every one that fits. Tap again to unselect.'));
    return { node: wrap, value: function () { return btns.filter(function (x) { return set[x.v]; }).map(function (x) { return x.v; }); }, focus: function () {},
      clear: function () { set = {}; btns.forEach(function (x) { x.b.classList.remove('on'); }); }, disable: function (on) { wrap.classList.toggle('off', !!on); },
      onEnter: function (fn) { enter = fn; } };
  };

  /* ---- prime or composite? A composite answer must be backed by a factor pair ---- */
  W.classify = function (opt) {
    var wrap = el('div', 'w-classify'), choice = null, enter = null;
    var row = el('div', 'cls-row');
    var bp = el('button', 'cls-btn', '<b>Prime</b><span>exactly two factors</span>'), bc = el('button', 'cls-btn', '<b>Composite</b><span>more than two factors</span>');
    bp.type = bc.type = 'button'; row.appendChild(bp); row.appendChild(bc); wrap.appendChild(row);
    var proof = el('div', 'cls-proof hidden');
    proof.innerHTML = '<div class="cls-proof-label">Prove it: show a factor pair (neither one can be 1).</div>';
    var pr = el('div', 'ans-row'), a = plainInput('', 'numeric'), b = plainInput('', 'numeric');
    a.classList.add('ans-short'); b.classList.add('ans-short');
    pr.appendChild(el('span', 'ans-affix', HW.k(HW.fmt(opt.n)) + '&nbsp;' + HW.k('=')));
    pr.appendChild(a); pr.appendChild(el('span', 'ans-affix', HW.k('\\times'))); pr.appendChild(b);
    proof.appendChild(pr); wrap.appendChild(proof);
    function pick(c) { if (wrap.classList.contains('off')) return; choice = c; bp.classList.toggle('on', c === 'prime'); bc.classList.toggle('on', c === 'composite'); proof.classList.toggle('hidden', c !== 'composite'); if (c === 'composite' && !coarse()) a.focus(); }
    bp.addEventListener('click', function () { pick('prime'); }); bc.addEventListener('click', function () { pick('composite'); });
    [a, b].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (x === a && !b.value) b.focus(); else if (enter) enter(); } }); });
    return { node: wrap, value: function () { return { choice: choice, a: a.value.trim(), b: b.value.trim() }; }, focus: function () {},
      clear: function () { choice = null; a.value = b.value = ''; bp.classList.remove('on'); bc.classList.remove('on'); proof.classList.add('hidden'); },
      disable: function (on) { wrap.classList.toggle('off', !!on); a.disabled = b.disabled = !!on; }, onEnter: function (fn) { enter = fn; } };
  };

  /* ---- a list of pairs ( __ , __ ) ---- */
  W.pairs = function (opt) {
    opt = opt || {};
    var wrap = el('div', 'w-pairs'), list = el('div', 'pair-list'), enter = null, rows = [];
    function addRow(v) {
      var r = el('div', 'pair-row'), a = plainInput('', 'numeric'), b = plainInput('', 'numeric');
      a.classList.add('ans-short'); b.classList.add('ans-short');
      r.appendChild(el('span', 'pair-paren', '(')); r.appendChild(a); r.appendChild(el('span', 'pair-paren', ',')); r.appendChild(b); r.appendChild(el('span', 'pair-paren', ')'));
      var x = el('button', 'pair-x', '×'); x.type = 'button'; x.title = 'Remove this pair';
      x.addEventListener('click', function () { var i = rows.indexOf(o); if (i >= 0 && rows.length > 1) { rows.splice(i, 1); r.remove(); } else { a.value = b.value = ''; } });
      r.appendChild(x);
      var o = { r: r, a: a, b: b }; rows.push(o); list.appendChild(r);
      [a, b].forEach(function (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (inp === a) b.focus(); else if (rows[rows.length - 1] === o && a.value && b.value) { addRow(); rows[rows.length - 1].a.focus(); } else if (enter) enter(); } }); });
      if (v) { a.value = v[0]; b.value = v[1]; }
      return o;
    }
    wrap.appendChild(list);
    var more = el('button', 'btn btn-ghost btn-small', '+ Add another pair'); more.type = 'button';
    more.addEventListener('click', function () { addRow().a.focus(); });
    wrap.appendChild(more);
    for (var i = 0; i < (opt.start || 1); i++) addRow();
    wrap.appendChild(el('div', 'w-help', 'Write each pair smaller number first. Press Enter to move along.'));
    return { node: wrap, value: function () { return rows.map(function (o) { return [o.a.value.trim(), o.b.value.trim()]; }).filter(function (p) { return p[0] !== '' || p[1] !== ''; }); },
      focus: function () { if (!coarse()) rows[0].a.focus({ preventScroll: true }); }, clear: function () { rows.forEach(function (o) { o.r.remove(); }); rows = []; addRow(); },
      disable: function (on) { wrap.classList.toggle('off', !!on); rows.forEach(function (o) { o.a.disabled = o.b.disabled = !!on; }); more.disabled = !!on; }, onEnter: function (fn) { enter = fn; } };
  };
})(window);
