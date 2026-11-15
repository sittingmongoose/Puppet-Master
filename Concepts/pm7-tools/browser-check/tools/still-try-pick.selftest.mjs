// Self-test for perf-still-page's choice of the try its frame rows judge (stillPick with stillJudged, R51 F2, R53-C1,
// R54 F1): a try that meets every bound its VIEW judges ends the tries and is judged, whatever the earlier failing tries
// summed to; while none meets them, the quietest by the view's ranking is kept. Settings judges drawn, rendered and
// starts; Home only drawn; Usage none. Usage: node tools/still-try-pick.selftest.mjs [path to a perf-still-page.check.mjs]
// (a check from before stillJudged is run with its own caller's predicate, which required rendered frames on Home too)
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const page = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-still-page.check.mjs';
const mod = await import(page);
const { stillPick, stillJudged } = mod;
// e8f06b4999's caller: stillPick(x, r, (q) => drawn <= 15 && rendered <= 10 && (!judgeStarts || starts <= 60))
const given = (view) => (q) => q.drawn.perSec <= 15 && q.mainFrames.renderedPerSec <= 10 && (view === 'usage' || view === 'dashboard' || q.mainFrames.perSec <= 60);
const judged = (view) => (stillJudged ? stillJudged(view) : given(view));

const tr = (drawn, rendered, starts) => ({ drawn: { perSec: drawn }, mainFrames: { renderedPerSec: rendered, perSec: starts } });
const run = (view, traces) => { let x = null, n = 0; for (const r of traces) { n++; const p = stillPick(x, r, judged(view)); x = p.x; if (p.done) break; } return { x, n }; };
// what the check then asserts per view (perf-still-page's rows: Settings drawn, rendered, starts; Home drawn; Usage none)
const rowsPass = (view, q) => view === 'usage' ? true : view === 'dashboard' ? q.drawn.perSec <= 15 : q.drawn.perSec <= 15 && q.mainFrames.renderedPerSec <= 10 && q.mainFrames.perSec <= 60;
let cases = 0;
const ok = (cond, msg) => { cases++; assert.ok(cond, msg); };

// Settings. R51 F2: (1, 1, 80) then (2, 1, 40): the second meets every bound and is judged, not the first's smaller sum
const f2 = run('settings', [tr(1, 1, 80), tr(2, 1, 40), tr(0, 0, 90)]);
ok(f2.x.drawn.perSec === 2 && f2.x.mainFrames.perSec === 40 && f2.n === 2 && rowsPass('settings', f2.x), 'Settings: a passing second try is judged and ends the tries');
const third = run('settings', [tr(0, 0, 70), tr(1, 0, 65), tr(14, 9, 59)]);
ok(third.x.drawn.perSec === 14 && third.n === 3, 'Settings: a passing third try after two quieter failing ones');
ok(run('settings', [tr(3, 2, 20), tr(0, 0, 0)]).n === 1, 'Settings: the first try passing is judged at once');
const none = run('settings', [tr(20, 12, 70), tr(5, 11, 90), tr(4, 13, 61)]);
ok(none.x.drawn.perSec === 5 && none.x.mainFrames.perSec === 90 && none.n === 3 && !rowsPass('settings', none.x), 'Settings: none passing keeps the quietest by drawn plus rendered, and it still fails');
const tie = run('settings', [tr(5, 11, 90), tr(4, 12, 61), tr(6, 11, 120)]);
ok(tie.x.mainFrames.perSec === 61, 'Settings: equal sums: fewer starts');

// Home judges only what the compositor draws. R53-C1: (14, 20, 30), (16, 11, 30), (17, 11, 30): the first meets it
const c1 = run('dashboard', [tr(14, 20, 30), tr(16, 11, 30), tr(17, 11, 30)]);
ok(c1.x.drawn.perSec === 14 && c1.n === 1 && rowsPass('dashboard', c1.x), `Home: the first try meets Home's only frame row and is judged (kept drawn ${c1.x.drawn.perSec}, after ${c1.n} tries)`);
// R54 F1: (16, 0, 20), (10, 20, 30), (16, 0, 20): the second meets it
const f1 = run('dashboard', [tr(16, 0, 20), tr(10, 20, 30), tr(16, 0, 20)]);
ok(f1.x.drawn.perSec === 10 && f1.n === 2 && rowsPass('dashboard', f1.x), `Home: the second try meets Home's only frame row and is judged (kept drawn ${f1.x.drawn.perSec})`);
// Home with no try passing: the fewest drawn is kept (its row names the quietest), whatever its main frames
const homeNone = run('dashboard', [tr(18, 0, 5), tr(16, 40, 200), tr(20, 0, 0)]);
ok(homeNone.x.drawn.perSec === 16 && homeNone.n === 3 && !rowsPass('dashboard', homeNone.x), 'Home: none passing keeps the fewest drawn');
// a 200-starts try on Home meets its bound (starts are not judged there)
ok(run('dashboard', [tr(1, 1, 200), tr(0, 0, 10)]).n === 1, 'Home: starts are not judged');
console.log(`still-try-pick: ${cases} cases pass`);
