# Math 10C Practice

Homework practice for every Math 10C lesson, built from the course booklets. Every question is a generator: it keeps the idea and difficulty of the booklet question and changes the numbers, so each student gets their own version (the same on every device) and a fresh one whenever they need it.

- **Students:** `index.html`. Sign in with the class code (or the class link/QR code), pick your name, make a 4-digit PIN.
- **Teacher:** `teacher/` (the Practice Ledger). Needs the teacher key from the Apps Script project.

## How a question works

- Answers are checked as soon as the student presses **Check**.
- A recognised mistake (a missing factor pair, calling 161 prime, dividing by a non-prime on a ladder, …) gets a hint aimed at that mistake. A formatting slip (commas instead of ×, a repeated prime, a blank box) gets a nudge that doesn't use a try.
- After 3 wrong tries (2 for multiple choice) the answer and worked solution are shown, and the student finishes the question with a new version.
- Leaving the tab or window while a question is open gives that question new numbers and is logged for the teacher.
- Division ladders and factor trees are built step by step, and every step is checked.
- The on-screen calculator follows the TI-30XIIS layout and order of operations.

## Files

| Path | What it is |
|---|---|
| `js/core.js` | Seeded random numbers, number theory, answer parsing, KaTeX helpers |
| `js/kit.js` | Shared checkers with error diagnoses, and the lesson registry |
| `js/lessons/u1l*.js`, `u2l*.js` | Units 1 and 2: every assignment question plus the extra practice |
| `js/expr.js` | Reads typed answers (LaTeX or plain text): roots of any index, fractions, repeating decimals, π, variables |
| `js/kitx.js` | Checkers for radicals (mixed/entire), fractions, repeating decimals, rounding, ordering, tables; part builders `K.P.*` |
| `js/widgets.js`, `js/widgets2.js`, `js/steps.js` | Answer inputs: number, list (chips), math (MathLive, with keypads for radicals, fractions, repeating decimals, variables), multiple choice, select, prime/composite with a proof, pairs, ordering, tables, labelled boxes, division ladder, factor tree |
| `js/calc.js` | The TI-30XIIS-style calculator |
| `js/app.js`, `js/ledger.js` | The student app, and syncing to the teacher's ledger |
| `js/catalog.js` | Units and lessons (a lesson is open once its lesson file exists) |
| `teacher/` | The teacher dashboard |
| `backend/Code.gs` | Google Apps Script backend (paste into the Apps Script project) |
| `tests/` | `node tests/gen_test.js [runs] [lessonId]` (every generator), `node tests/kitx_test.js` (the shared checkers), `node tests/calc_test.js`, `tests/e2e.py` (Playwright, against `backend/mock_server.js`) |

## Adding a lesson

1. Write `js/lessons/u1l2.js` with `HW.defineLesson({ id: 'u1l2', … questions: […], extra: […] })` (see `u1l1.js`). Each part has an `id`, a `level` (LIM BEG EMG PRG ADV MAS) and a `make(rng, shared)` that returns `{ prompt, input, check, key, answer, solution, hints }`.
2. Add a `<script>` tag for it in `index.html` and `teacher/index.html`.
3. Run `node tests/gen_test.js 300 u1l2` (one lesson at a time is quicker).

## Backend

`backend/Code.gs` runs as an Apps Script web app (Execute as: me · Who has access: Anyone) and writes to the "Math 10C Practice Ledger" spreadsheet: Roster, Attempts, Events, Progress, Days. Run `setup()` once; the teacher key is in Project Settings → Script properties. Put the web-app URL in `js/config.js`. After changing `Code.gs`, deploy a **new version of the same deployment** so the URL stays the same.
