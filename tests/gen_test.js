// Runs every question generator many times: the built-in answer key must be graded correct, the
// instance must render (prompt, solution, answer), and a few typical wrong answers must not be graded correct.
// node tests/gen_test.js [runs]
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
var only = process.argv[3] || null;
var lessonFiles = fs.readdirSync(path.join(root, 'js/lessons')).filter(function (f) { return /\.js$/.test(f); }).sort().map(function (f) { return 'js/lessons/' + f; });
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js'].concat(lessonFiles).forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, RUNS = Number(process.argv[2] || 400), errors = 0, total = 0, seenNums = {};
Object.keys(HW.lessons).forEach(function (lid) {
  if (only && lid !== only) return;
  var L0 = HW.lessons[lid]; if (!L0.items.length) { errors++; console.log(lid, 'has no items'); }
  var L = HW.lessons[lid];
  L.items.forEach(function (it) {
    var prompts = {};
    for (var i = 0; i < RUNS; i++) {
      total++;
      try {
        var inst = HW.makeInstance(L, it, i * 7919 + 13, i * 104729 + 7);
        if (!inst.prompt || !inst.solution || !inst.answer) throw new Error('missing prompt/solution/answer');
        ['prompt', 'solution', 'answer', 'stem'].forEach(function (k) { var h = HW.tex(inst[k]); if (/katex-error/.test(h)) throw new Error('KaTeX error in ' + k + ': ' + inst[k]); });
        (inst.hints || []).forEach(function (h) { if (/katex-error/.test(HW.tex(h))) throw new Error('KaTeX error in hint: ' + h); });
        var res = inst.check(inst.key);
        if (res.v !== 'correct') throw new Error('key not accepted: ' + JSON.stringify(inst.key) + ' -> ' + JSON.stringify(res));
        prompts[inst.prompt + '|' + inst.stem] = 1;
        // wrong answers
        var t = inst.input.type, bad = null;
        if (t === 'number') bad = String(Number(inst.key) + 1);
        else if (t === 'list') bad = inst.key.slice(0, -1).length ? inst.key.slice(0, -1) : [999];
        else if (t === 'math') bad = '2\\times 3';
        else if (t === 'ladder' || t === 'tree') bad = { done: true, final: '2\\times 3' };
        else if (t === 'mc') bad = inst.input.options.filter(function (o) { return o.key !== inst.key; })[0].key;
        else if (t === 'classify') bad = { choice: inst.key.choice === 'prime' ? 'composite' : 'prime', a: '3', b: '5' };
        else if (t === 'select') bad = [];
        else if (t === 'pairs') bad = inst.key.slice(1);
        else if (t === 'order') bad = inst.key.slice().reverse();
        else if (t === 'grid') bad = {};
        else if (t === 'fields') bad = inst.key.map(function () { return '987654'; });
        var bads = (bad != null ? [bad] : []).concat(inst.bad || []);
        bads.forEach(function (b) { var rb = inst.check(b); if (rb.v === 'correct') throw new Error('wrong answer accepted: ' + JSON.stringify(b)); if (rb.hint && /katex-error/.test(HW.tex(rb.hint))) throw new Error('KaTeX error in diagnosis hint ' + rb.hint); });
        (inst.good || []).forEach(function (g) { var rg = inst.check(g); if (rg.v !== 'correct') throw new Error('alternative answer not accepted: ' + JSON.stringify(g) + ' -> ' + JSON.stringify(rg)); });
        if (['number', 'list', 'math', 'mc', 'select', 'classify', 'pairs', 'ladder', 'tree', 'order', 'grid', 'fields'].indexOf(t) < 0) throw new Error('unknown input type ' + t);
        if (t === 'mc' && inst.input.options.filter(function (o) { return o.right; }).length !== 1) throw new Error('mc needs exactly one right option');
      } catch (e) { errors++; if (errors < 30) console.log(lid, it.id, 'run', i, e.message); }
    }
    seenNums[lid + ':' + it.id] = Object.keys(prompts).length;
  });
});
console.log('variety (distinct prompts per item):', JSON.stringify(seenNums));
console.log(total + ' instances, ' + errors + ' errors');
process.exit(errors ? 1 : 0);
