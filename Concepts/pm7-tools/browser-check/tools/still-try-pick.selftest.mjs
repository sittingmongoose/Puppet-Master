// Self-test for perf-still-page's choice of the try its frame rows judge (stillPick, R51 F2): a try that meets every
// judged bound ends the tries and is judged, whatever the earlier failing tries summed to; while none meets them, the
// quietest is kept. Usage: node tools/still-try-pick.selftest.mjs [path to a perf-still-page.check.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const page = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-still-page.check.mjs';
const { stillPick } = await import(page);

const tr = (drawn, rendered, starts) => ({ drawn: { perSec: drawn }, mainFrames: { renderedPerSec: rendered, perSec: starts } });
// the check's default bounds: drawn 15, rendered 10, starts 60 (judged on Settings and the other non-live views)
const meets = (q) => q.drawn.perSec <= 15 && q.mainFrames.renderedPerSec <= 10 && q.mainFrames.perSec <= 60;
const run = (traces, m = meets) => { let x = null, n = 0; for (const r of traces) { n++; const p = stillPick(x, r, m); x = p.x; if (p.done) break; } return { x, n }; };

// R51 F2: (1, 1, 80) then (2, 1, 40): the second meets every bound and is judged, not the first's smaller sum
const f2 = run([tr(1, 1, 80), tr(2, 1, 40), tr(0, 0, 90)]);
assert.deepEqual([f2.x.drawn.perSec, f2.x.mainFrames.perSec, f2.n], [2, 40, 2], 'a passing second try is judged and ends the tries');
assert.ok(meets(f2.x));
// a passing third try after two failing quieter ones
const third = run([tr(0, 0, 70), tr(1, 0, 65), tr(14, 9, 59)]);
assert.deepEqual([third.x.drawn.perSec, third.n], [14, 3]);
// the first try passing: judged at once
assert.equal(run([tr(3, 2, 20), tr(0, 0, 0)]).n, 1);
// none passing: the quietest by drawn plus rendered, then by starts (the failure names the quietest of the three)
const none = run([tr(20, 12, 70), tr(5, 11, 90), tr(4, 13, 61)]);
assert.deepEqual([none.x.drawn.perSec, none.x.mainFrames.renderedPerSec, none.x.mainFrames.perSec, none.n], [5, 11, 90, 3]);
const tie = run([tr(5, 11, 90), tr(4, 12, 61), tr(6, 11, 120)]);
assert.equal(tie.x.mainFrames.perSec, 61, 'equal sums: fewer starts');
assert.ok(!meets(none.x) && !meets(tie.x), 'with no passing try the kept one still fails its row');
// a view whose starts are not judged (Home's dashboard, Usage): a try over 60 starts meets the bounds it has
const noStarts = (q) => q.drawn.perSec <= 15 && q.mainFrames.renderedPerSec <= 10;
assert.equal(run([tr(1, 1, 200), tr(0, 0, 10)], noStarts).n, 1);
console.log('still-try-pick: 7 cases pass');
