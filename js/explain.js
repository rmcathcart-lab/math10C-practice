/* Lesson-example explainers: a step-by-step animation player with captions and an optional voice.
 *
 *   HW.defineExplainers(lessonId, [ explainer, … ])
 *   explainer = { id: 'ex1', num: '1', title, parts: [{ id, label }]?, setup(stage, side) -> render(step, ctx), steps: [step, …] }
 *   step      = { part?, say: 'HTML caption', speak?: 'words to read aloud (default: the caption as plain text)', … anything render needs }
 *
 * render(step, ctx) draws the whole state for that step (so Back works); elements with class "fresh" fade in.
 * The voice plays a recorded clip when one exists (see "recorded narration" below), otherwise the browser's built-in
 * speech (Web Speech API), which works on Chromebooks, iPads and desktop Chrome. When the voice is on, Play waits for each step to be read before moving on. */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  HW.explainers = HW.explainers || {};
  HW.defineExplainers = function (lessonId, list) { HW.explainers[lessonId] = list; list.forEach(function (x) { x.lesson = lessonId; }); return list; };

  /* ---------------- speech ---------------- */
  var Voice = HW.Voice = { supported: !!(root.speechSynthesis && root.SpeechSynthesisUtterance), voice: null };
  function pickVoice() {
    if (!Voice.supported) return null;
    var vs = root.speechSynthesis.getVoices() || [], en = vs.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var prefs = [/Natural/i, /Google (US|UK|Canadian|Australian)? ?English/i, /Samantha|Ava|Allison|Susan|Karen|Daniel|Moira/i, /Microsoft (Aria|Jenny|Guy|Zira|David)/i];
    var langs = [/en-CA/i, /en-US/i, /en-GB/i, /en/i];
    for (var i = 0; i < prefs.length; i++) for (var j = 0; j < langs.length; j++) {
      var hit = en.filter(function (v) { return prefs[i].test(v.name) && langs[j].test(v.lang); })[0]; if (hit) return hit;
    }
    return en.filter(function (v) { return v.default; })[0] || en[0] || vs[0] || null;
  }
  if (Voice.supported) { Voice.voice = pickVoice(); try { root.speechSynthesis.addEventListener('voiceschanged', function () { Voice.voice = pickVoice(); }); } catch (e) {} }
  /* turn a caption into words that read well aloud */
  HW.speakable = function (html) {
    var s = String(html || '')
      .replace(/<sup>2<\/sup>/g, ' squared').replace(/<sup>3<\/sup>/g, ' cubed').replace(/<sup>(\d+)<\/sup>/g, ' to the power $1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#8239;| | /g, ' ').replace(/&amp;/g, ' and ').replace(/&lt;/g, ' less than ').replace(/&gt;/g, ' greater than ')
      .replace(/(\d)[ ,](?=\d{3}\b)/g, '$1')
      .replace(/\b(part)\s+\((i{1,3}|iv|v|[a-h])\)/gi, '$1 $2').replace(/^\s*\(([a-h])\)\s*/, 'Part $1. ').replace(/\((i{1,3}|iv|v|[a-h])\)/g, ' part $1, ').replace(/\+/g, ' plus ').replace(/−/g, ' minus ')
      .replace(/²/g, ' squared').replace(/³/g, ' cubed')
      .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/≈/g, ' is about ').replace(/≠/g, ' is not equal to ').replace(/√\s*(\d+)/g, 'the square root of $1').replace(/√/g, 'the square root of ')
      .replace(/ = /g, ' equals ').replace(/=/g, ' equals ').replace(/</g, ' is less than ').replace(/>/g, ' is greater than ')
      .replace(/[✓✗✔✘→←•]/g, ' ').replace(/—|–/g, ', ').replace(/\s*\(\s*/g, ', ').replace(/\s*\)\s*/g, ', ')
      .replace(/\s+([.,:;!?])/g, '$1').replace(/,\s*,/g, ',').replace(/([.:;!?]),/g, '$1').replace(/\s+/g, ' ').trim();
    return s;
  };
  function speak(text, onEnd) {
    if (!Voice.supported) { if (onEnd) onEnd(); return; }
    var synth = root.speechSynthesis; synth.cancel();
    // short chunks: some browsers stop long utterances part-way
    var parts = String(text).replace(/([.!?])\s+/g, '$1\u0000').split('\u0000').filter(function (x) { return x.trim(); }), i = 0, token = {}, t0 = Date.now(), failed = false;
    var need = Math.max(1800, String(text).split(/\s+/).length * 330); // about how long reading it aloud takes
    Voice.token = token;
    (function next() {
      if (Voice.token !== token) return;
      if (i >= parts.length) {
        // if the browser refused to speak (or finished impossibly fast), keep a normal reading pace instead of rushing
        var spent = Date.now() - t0, short = failed || spent < need * 0.45;
        if (onEnd) { if (short) setTimeout(function () { if (Voice.token === token) onEnd(); }, Math.max(0, need - spent)); else onEnd(); }
        return;
      }
      var u = new root.SpeechSynthesisUtterance(parts[i++].trim());
      if (Voice.voice) { u.voice = Voice.voice; u.lang = Voice.voice.lang; } else u.lang = 'en-CA';
      u.rate = Voice.rate || 0.98; u.pitch = 1;
      var done = false, guard = setTimeout(function () { if (!done) { done = true; next(); } }, 2500 + u.text.length * 110);
      u.onend = function () { if (done) return; done = true; clearTimeout(guard); next(); };
      u.onerror = function () { failed = true; if (done) return; done = true; clearTimeout(guard); next(); };
      synth.speak(u);
    })();
  }
  /* ---------------- recorded narration ----------------
   * Clips live at audio/narration/<lesson>/<key>.m4a, where key = HW.narrationKey(words spoken).
   * js/narration.js (built by tools/narration.js) lists which keys exist, so an edited caption simply
   * falls back to the browser voice until it is re-recorded. */
  HW.narrationKey = function (text) { // FNV-1a, 32-bit, as 8 hex digits
    var h = 0x811c9dc5, s = String(text);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  };
  function clipFor(lesson, text) {
    var set = HW.narrationClips && HW.narrationClips[lesson], k = HW.narrationKey(text);
    return set && set[k] ? 'audio/narration/' + lesson + '/' + k + '.m4a' : null;
  }
  var audio = null;
  function playClip(url, text, onEnd) {
    var token = {}; Voice.token = token;
    if (!audio) { audio = new root.Audio(); audio.preload = 'auto'; }
    var fin = function (ok) {
      if (Voice.token !== token) return;
      audio.onended = audio.onerror = null;
      if (ok) { if (onEnd) onEnd(); } else speak(text, onEnd); // missing/blocked clip: use the browser voice
    };
    audio.onended = function () { fin(true); };
    audio.onerror = function () { fin(false); };
    audio.src = url;
    try { var p = audio.play(); if (p && p.catch) p.catch(function () { fin(false); }); } catch (e) { fin(false); }
  }
  function hush() {
    Voice.token = {};
    if (audio) { try { audio.onended = audio.onerror = null; audio.pause(); } catch (e) {} }
    if (Voice.supported) { try { root.speechSynthesis.cancel(); } catch (e) {} }
  }
  HW.hushExplainer = hush;
  function pref(k, v) { try { if (v === undefined) return root.localStorage.getItem('hw:' + k); root.localStorage.setItem('hw:' + k, v); } catch (e) { return null; } }

  /* ---------------- the player ---------------- */
  HW.explainerPlayer = function (host, x, opt) {
    opt = opt || {};
    var card = el('article', 'qcard xcard');
    card.appendChild(el('div', 'qsection', 'Lesson example'));
    var head = el('div', 'qhead'); head.innerHTML = '<h2>Example ' + x.num + '</h2>';
    card.appendChild(head);
    card.appendChild(el('div', 'xtitle', HW.tex(x.title)));
    var tabs = null;
    if (x.parts && x.parts.length > 1) { tabs = el('div', 'xtabs'); card.appendChild(tabs); }
    var board = el('div', 'xboard' + (x.wide ? ' wide' : '')), stage = el('div', 'xstage'), side = el('div', 'xside');
    board.appendChild(stage); if (!x.wide) board.appendChild(side); card.appendChild(board);
    var say = el('p', 'xsay'); say.setAttribute('aria-live', 'polite'); card.appendChild(say);
    var ctr = el('div', 'xcontrols');
    var back = el('button', 'btn xbtn', '◀'), play = el('button', 'btn btn-primary xbtn xplay', '▶ Play'), next = el('button', 'btn xbtn', '▶▶');
    back.type = play.type = next.type = 'button'; back.setAttribute('aria-label', 'Previous step'); next.setAttribute('aria-label', 'Next step');
    var hasClips = !!(HW.narrationClips && HW.narrationClips[x.lesson] && x.steps.some(function (s) { return clipFor(x.lesson, s.speak || HW.speakable(s.say)); }));
    var canTalk = Voice.supported || hasClips;
    var voiceOn = canTalk && pref('voice') !== 'off';
    var vbtn = el('button', 'btn xbtn xvoice'); vbtn.type = 'button';
    function drawVoice() { vbtn.innerHTML = voiceOn ? '🔊 Voice on' : '🔈 Voice off'; vbtn.setAttribute('aria-pressed', String(voiceOn)); }
    drawVoice();
    var prog = el('div', 'xprog', '<i></i>'), stepno = el('span', 'xstepno');
    [back, play, next].forEach(function (b) { ctr.appendChild(b); });
    if (canTalk) ctr.appendChild(vbtn);
    ctr.appendChild(prog); ctr.appendChild(stepno);
    card.appendChild(ctr);
    card.appendChild(el('div', 'w-help', 'Press <b>Play</b> to watch' + (canTalk ? ' and listen' : '') + ', or step through with ◀ and ▶▶. The words under the picture are what the narrator says.'));
    host.appendChild(card);

    var render = x.setup(stage, side, board), cur = 0, playing = false, timer = null, steps = x.steps, seen = {}, prefetched = {};
    if (tabs) x.parts.forEach(function (p) {
      var b = el('button', 'xtab', HW.tex(p.label)); b.type = 'button'; b.dataset.part = p.id;
      b.addEventListener('click', function () { var k = steps.findIndex(function (s) { return s.part === p.id; }); if (k >= 0) { stop(); show(k, true); } });
      tabs.appendChild(b);
    });
    function show(i, talk) {
      cur = Math.max(0, Math.min(steps.length - 1, i));
      var s = steps[cur];
      say.innerHTML = HW.tex(s.say);
      prog.firstChild.style.width = ((cur + 1) / steps.length * 100) + '%';
      stepno.textContent = 'Step ' + (cur + 1) + ' of ' + steps.length;
      back.disabled = cur === 0; next.disabled = cur === steps.length - 1;
      if (tabs) Array.prototype.forEach.call(tabs.children, function (b) { b.setAttribute('aria-current', String(b.dataset.part === s.part)); });
      try { render(s, { index: cur, steps: steps }); } catch (e) { if (root.console) console.error(e); }
      seen[cur] = 1; if (opt.onStep) opt.onStep(cur);
      if (cur === steps.length - 1 && opt.onDone) opt.onDone();
      if (talk && voiceOn) {
        var words = s.speak || HW.speakable(s.say), url = clipFor(x.lesson, words), after = playing ? function () { timer = setTimeout(advance, 650); } : null;
        if (url) playClip(url, words, after); else speak(words, after);
        var nx = steps[cur + 1], nurl = nx && clipFor(x.lesson, nx.speak || HW.speakable(nx.say));
        if (nurl && !prefetched[nurl]) { prefetched[nurl] = 1; try { var a = new root.Audio(); a.preload = 'auto'; a.src = nurl; } catch (e) {} }
      }
      else if (playing) { var words = HW.speakable(s.say).split(/\s+/).length; timer = setTimeout(advance, Math.max(2600, words * 300)); }
    }
    function advance() { if (!playing) return; if (cur >= steps.length - 1) { stop(); return; } show(cur + 1, true); }
    function stop() { playing = false; clearTimeout(timer); hush(); play.innerHTML = '▶ Play'; }
    function start() {
      playing = true; play.innerHTML = '❚❚ Pause';
      if (opt.onPlay) opt.onPlay();
      show(cur === steps.length - 1 ? 0 : cur, true);
    }
    play.addEventListener('click', function () { if (playing) stop(); else start(); });
    next.addEventListener('click', function () { var was = playing; clearTimeout(timer); hush(); if (!was) play.innerHTML = '▶ Play'; show(cur + 1, true); });
    back.addEventListener('click', function () { var was = playing; clearTimeout(timer); hush(); if (!was) play.innerHTML = '▶ Play'; show(cur - 1, true); });
    vbtn.addEventListener('click', function () { voiceOn = !voiceOn; pref('voice', voiceOn ? 'on' : 'off'); drawVoice(); if (!voiceOn) { hush(); if (playing) { clearTimeout(timer); timer = setTimeout(advance, 1800); } } else if (playing) { clearTimeout(timer); show(cur, true); } });
    function key(e) {
      if (!document.body.contains(card)) { document.removeEventListener('keydown', key); return; }
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); back.click(); }
    }
    document.addEventListener('keydown', key);
    var rt; function onResize() { if (!document.body.contains(card)) { root.removeEventListener('resize', onResize); return; } clearTimeout(rt); rt = setTimeout(function () { render(steps[cur], { index: cur, steps: steps, resize: true }); }, 150); }
    root.addEventListener('resize', onResize);
    show(0, false);
    return { stop: stop, card: card };
  };

  /* ---------------- drawing kits shared by explainers ---------------- */
  var X = HW.X = {};
  X.el = el;
  /* tiles that slide between rectangle arrangements (factor pairs) */
  X.tiles = function (stage) {
    var box = el('div', 'xtiles'), tiles = [], n = 0, label = el('div', 'xt-label'), dims = el('div', 'xt-dims'), badge = el('div', 'xbadge');
    stage.appendChild(box); stage.appendChild(label); stage.appendChild(dims); stage.appendChild(badge);
    return {
      show: function (count, rows, verdict) {
        if (count !== n) { tiles.forEach(function (t) { t.remove(); }); tiles = []; for (var i = 0; i < count; i++) { var t = el('div', 'xtile'); box.appendChild(t); tiles.push(t); } n = count; }
        var W = stage.clientWidth || 600, H = stage.clientHeight || 280, cols = Math.floor(count / rows), left = count - rows * cols;
        var gridRows = rows + (left ? 1 : 0), maxCols = Math.max(cols, left);
        var s = Math.min(32, (W - 32) / maxCols, (H - 92) / gridRows), gap = Math.max(1.5, s * .14), size = s - gap;
        var x0 = (W - (maxCols * s - gap)) / 2, y0 = 42 + (H - 92 - (gridRows * s - gap)) / 2;
        tiles.forEach(function (t, i) {
          var isLeft = i >= rows * cols, r = isLeft ? rows : Math.floor(i / cols), c = isLeft ? i - rows * cols : i % cols;
          t.style.width = t.style.height = size + 'px'; t.style.left = (x0 + c * s) + 'px'; t.style.top = (y0 + r * s + (isLeft ? gap * 2 : 0)) + 'px';
          t.classList.toggle('left', isLeft);
        });
        label.innerHTML = '<b>' + count + '</b> tiles';
        dims.textContent = left ? rows + ' rows of ' + cols + ', ' + left + ' left over' : rows + ' × ' + cols + ' = ' + count;
        badge.className = 'xbadge' + (verdict ? ' ' + verdict : '');
        badge.textContent = { yes: '✓ factor', no: '✗ not a factor', sq: '✓ square — stop', stop: 'stop' }[verdict] || '';
      }
    };
  };
  /* factors joined to their partners by arcs */
  X.rainbow = function (divs, found, opt) {
    opt = opt || {};
    var W = 320, base = 116, pad = 18, shown = {};
    found.forEach(function (p) { shown[p[0]] = 1; shown[p[1]] = 1; });
    var xs = function (v) { var i = divs.indexOf(v); return divs.length === 1 ? W / 2 : pad + i * (W - 2 * pad) / (divs.length - 1); };
    var out = '<svg class="xrainbow" viewBox="0 0 ' + W + ' 140" role="img" aria-label="Factors joined to their partners">';
    found.forEach(function (p) {
      if (p[0] === p[1]) { var cx = xs(p[0]); out += '<path class="arc sq" d="M ' + (cx - 9) + ' ' + (base - 16) + ' a 9 9 0 1 1 18 0" />'; return; }
      var a = xs(p[0]), b = xs(p[1]), r = (b - a) / 2;
      out += '<path class="arc" d="M ' + a + ' ' + (base - 16) + ' A ' + r + ' ' + Math.min(r, 90) + ' 0 0 1 ' + b + ' ' + (base - 16) + '" />';
    });
    divs.forEach(function (v) {
      if (!shown[v]) return;
      var cls = opt.mark && opt.mark[v] ? ' ' + opt.mark[v] : '';
      out += '<circle class="dot' + cls + '" cx="' + xs(v) + '" cy="' + (base - 16) + '" r="' + (cls ? 7 : 4) + '" /><text class="' + cls + '" x="' + xs(v) + '" y="' + (base + 8) + '" text-anchor="middle">' + v + '</text>';
    });
    return out + '</svg>';
  };
  X.divisors = function (n) { var d = []; for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  X.isPrime = function (n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  X.fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
})(window);
