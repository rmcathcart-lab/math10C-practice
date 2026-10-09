// Every math answer key, rewritten the way the MathLive keyboard writes it (one-digit fraction parts without braces,
// e.g. \frac59, and \sqrt5), must still be accepted.  node tests/mathlive_form_test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error, Date: Date };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js'].concat(fs.readdirSync(path.join(root, 'js/lessons')).sort().map(function (f) { return 'js/lessons/' + f; }))
  .forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, n = 0, bad = 0, seen = {};
function compact(t){ return String(t).replace(/\\(d|t)?frac\{([0-9])\}\{([0-9])\}/g,'\\frac$2$3').replace(/\\(d|t)?frac\{([0-9])\}/g,'\\frac$2').replace(/\\sqrt\{([0-9])\}/g,'\\sqrt$1'); }
Object.keys(HW.lessons).forEach(function(l){var L=HW.lessons[l];L.items.forEach(function(it){for(var s=0;s<40;s++){var inst=HW.makeInstance(L,it,s*7919+13,s*104729+7);var t=inst.input.type, resp=null;
  if(t==='math'&&typeof inst.key==='string'){var c=compact(inst.key); if(c===inst.key) continue; resp=c;}
  else if(t==='fields'&&Array.isArray(inst.key)){var ch=false; resp=inst.key.map(function(k,i){var f=inst.input.fields[i]||{}; if(f.mode!=='math') return k; var c=compact(k); if(c!==k) ch=true; return c;}); if(!ch) continue;}
  else continue;
  n++; var r=inst.check(resp); if(r.v!=='correct'){bad++; var key=l+':'+it.id; if(!seen[key]){seen[key]=1; console.log('REJECTED',l,it.id,JSON.stringify(resp),'->',r.code);}}
}});});
console.log(n + ' compact keys tested, ' + bad + ' rejected'); process.exit(bad ? 1 : 0);
