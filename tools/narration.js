#!/usr/bin/env node
/* Recorded narration for the lesson-example explainers.
 *
 *   node tools/narration.js export <folder>   write <folder>/lines.json (+ script.txt) — every line the narrator says,
 *                                             with the clip file name each one should be saved as
 *   node tools/narration.js index             scan audio/narration/<lesson>/*.m4a and rewrite js/narration.js
 *   node tools/narration.js status            how many lines have a recorded clip, per lesson
 *
 * A clip's name is HW.narrationKey(the words spoken), so changing a caption orphans its old clip and that step
 * falls back to the browser voice until it is recorded again (re-running the Mac script only records new lines). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global;
require(path.join(ROOT, 'js/explain.js'));
const exDir = path.join(ROOT, 'js/explainers');
fs.readdirSync(exDir).filter(f => f.endsWith('.js')).sort().forEach(f => require(path.join(exDir, f)));
const HW = global.HW;

function lines() {
  const out = [], seen = new Set();
  Object.keys(HW.explainers).sort().forEach(lesson => HW.explainers[lesson].forEach(x => x.steps.forEach((s, i) => {
    const text = s.speak || HW.speakable(s.say), key = HW.narrationKey(text), file = lesson + '/' + key + '.m4a';
    if (seen.has(file)) return; seen.add(file);
    out.push({ lesson, example: x.num, step: i + 1, file, text });
  })));
  return out;
}
function have() {
  const base = path.join(ROOT, 'audio/narration'), got = {};
  if (!fs.existsSync(base)) return got;
  fs.readdirSync(base).forEach(lesson => {
    const d = path.join(base, lesson); if (!fs.statSync(d).isDirectory()) return;
    fs.readdirSync(d).forEach(f => { const m = /^([0-9a-f]{8})\.m4a$/.exec(f); if (m && fs.statSync(path.join(d, f)).size > 0) (got[lesson] = got[lesson] || {})[m[1]] = 1; });
  });
  return got;
}
const cmd = process.argv[2];
if (cmd === 'export') {
  const dir = process.argv[3]; if (!dir) throw new Error('usage: export <folder>');
  fs.mkdirSync(dir, { recursive: true });
  const L = lines();
  fs.writeFileSync(path.join(dir, 'lines.json'), JSON.stringify(L, null, 1));
  fs.writeFileSync(path.join(dir, 'script.txt'), L.map(l => `[${l.lesson} · Example ${l.example} · step ${l.step}]  ${l.file}\n${l.text}\n`).join('\n'));
  console.log(`${L.length} lines → ${dir}`);
} else if (cmd === 'index') {
  const got = have(), wanted = new Set(lines().map(l => l.file));
  const keep = {}; let n = 0, orphan = 0;
  Object.keys(got).sort().forEach(lesson => Object.keys(got[lesson]).sort().forEach(k => {
    if (wanted.has(lesson + '/' + k + '.m4a')) { (keep[lesson] = keep[lesson] || {})[k] = 1; n++; } else orphan++;
  }));
  fs.writeFileSync(path.join(ROOT, 'js/narration.js'),
    '/* Recorded narration clips that exist (built by tools/narration.js index — do not edit by hand). */\n' +
    'window.HW = window.HW || {};\nwindow.HW.narrationClips = ' + JSON.stringify(keep) + ';\n');
  console.log(`js/narration.js: ${n} clips` + (orphan ? `, ${orphan} unused clip(s) ignored` : ''));
} else if (cmd === 'status') {
  const got = have(), by = {};
  lines().forEach(l => { const b = by[l.lesson] = by[l.lesson] || [0, 0]; b[1]++; if (got[l.lesson] && got[l.lesson][l.file.slice(l.lesson.length + 1, -4)]) b[0]++; });
  Object.keys(by).forEach(k => console.log(`${k}: ${by[k][0]}/${by[k][1]} recorded`));
} else console.log('usage: node tools/narration.js export <folder> | index | status');
