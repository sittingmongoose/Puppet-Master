// helpers/usage-scroll-verdict.mjs (checks/perf-usage-scroll's verdict) on constructed windows.
// node tools/usage-scroll-verdict.selftest.mjs [usage-scroll-verdict.mjs]
// R67-T1: the two guards (frames never presented as built at most 1.5x the control's + 4 a second; at rest no more than 5
// rendered main frames a second over the control's) are diagnostics, as the check's header and the README say: a breach is
// a logged WARNING with its numbers, never a failed row. The judged rows are "could judge" and the paint ratio (logged, not
// judged, under Reduced Motion); the layer row is judged in the check itself.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const given = process.argv[2];
const { usageScrollVerdict } = await import(given ? pathToFileURL(resolve(given)).href : '../helpers/usage-scroll-verdict.mjs');

const travel = { hit: 'button', onPane: true, ticks: 48, turn: 12, positions: [0, 480, 0, 480, 0] };
const win = (name, paint, full, rest, extra = {}) => ({ name, scrolls: 48, travel, whole: true, renderer: 1234, lost: [], paint, full, partial: 60, unknown: 0, restFrames: rest, ...extra });
// a composited board on a busy shared host: paint clearly lower, but drops and rest noise past both guards
const busy = [win('as built', 100, 30, 20), win('control', 150, 5, 2), win('control', 160, 5, 2), win('as built', 110, 30, 20)];
const v = usageScrollVerdict(busy, { ratio: 0.85 });
assert.deepEqual(v.rows.map((r) => r.ok), [true, true], `only "could judge" and the paint ratio are judged rows, both passing: ${JSON.stringify(v.rows.map((r) => [r.name, r.ok]))}`);
assert.equal(v.warnings.length, 2, `both guard breaches are warnings: ${JSON.stringify(v.warnings)}`);
assert.ok(v.warnings.every((w) => /^WARNING /.test(w)), 'each warning says WARNING first');
assert.ok(/never presented: as built 30\.0\/s, control 5\.0\/s/.test(v.warnings.join(' ')), 'the drop warning carries its numbers');
assert.ok(/as built 20\.0, control 2\.0 rendered main frames/.test(v.warnings.join(' ')), 'the rest warning carries its numbers');

// within both guards: no warning at all
const calm = usageScrollVerdict([win('as built', 100, 2, 2), win('control', 150, 8, 2), win('control', 160, 9, 3), win('as built', 110, 1, 2)], { ratio: 0.85 });
assert.equal(calm.warnings.length, 0, 'no warning inside the guards');

// Reduced Motion: the paint ratio is logged, not judged; the guards stay warnings
const rmv = usageScrollVerdict(busy, { ratio: 0.85, rm: true });
assert.deepEqual(rmv.rows.map((r) => r.ok), [true], 'under Reduced Motion only "could judge" is a judged row here');
assert.equal(rmv.warnings.length, 2, 'and the guards are still warnings');
assert.ok(rmv.logs.some((l) => /Reduced Motion/.test(l)), 'the paint ratio is logged');

// origin/main's scroll on both arms: the paint row fails, so the check stays red there
const main = usageScrollVerdict([win('as built', 156, 13, 3), win('control', 160, 14, 4), win('control', 158, 13, 4), win('as built', 158, 14, 3)], { ratio: 0.85 });
assert.equal(main.rows.find((r) => /paint/.test(r.name)).ok, false, 'equal paint on both arms fails the ratio');

// a window that did not scroll or stayed partial: could not judge, and nothing else is judged
const partialWin = usageScrollVerdict([win('as built', 100, 2, 2, { whole: false, lost: ['trace lost data'] }), ...busy.slice(1)], { ratio: 0.85 });
assert.deepEqual(partialWin.rows.map((r) => r.ok), [false], 'a partial window fails "could judge" and stops there');

// PM7PERF-NO-RENDERER-READS-ZERO (R124 O-1): a trace that names no renderer main thread reads paint 0. One such
// as-built window halves the mean (0 and 200 against a control's 200), so the old "whole" test passed the 0.85 bound at
// 0.50 without measuring the as-built scroll. The window is now could not judge and the ratio is not judged at all.
const blind = [win('as built', 0, 0, 0, { renderer: null }), win('control', 200, 2, 2), win('control', 200, 2, 2), win('as built', 200, 2, 2)];
const blindOld = blind.every((w) => w.scrolls > 0 && w.whole);
assert.equal(blindOld, true, 'the old judged test alone still passes the renderer-less window: that is the false PASS this case pins');
assert.ok(0.5 <= 0.85, 'and its 0.50 ratio passed the bound');
const blindV = usageScrollVerdict(blind, { ratio: 0.85 });
assert.deepEqual(blindV.rows.map((r) => r.ok), [false], `a renderer-less window stops the verdict at "could not judge", never the ratio: ${JSON.stringify(blindV.rows)}`);
assert.ok(/could not judge: no renderer thread/.test(blindV.rows[0].detail), `the row says which window and why: ${blindV.rows[0].detail}`);
assert.equal(blindV.rows.some((r) => /paint/.test(r.name)), false, 'and no paint row is judged from unmeasured windows');

for (const bad of [
	{ ...travel, positions: [0, 36, 0, 36, 0] },
	{ ...travel, positions: [0, 480, 0, 250, 0] },
	{ ...travel, positions: [15, 495, 15, 495, 15] },
	{ ...travel, positions: [0, 480, 0, 480] },
	{ ...travel, onPane: false, hit: '#overlay' },
]) {
	const wrong = usageScrollVerdict([win('as built', 40, 2, 2, { travel: bad }), ...busy.slice(1)]);
	assert.deepEqual(wrong.rows.map((r) => r.ok), [false], 'renderer-wide scroll events cannot certify inadequate pane travel or a pointer miss');
}
const rounded = { onPane: true, hit: 'button', ticks: 25, turn: 12, positions: [0, 479, 0, 39] };
assert.equal(usageScrollVerdict(busy.map((w) => ({ ...w, travel: rounded }))).rows[0].ok, true, 'one CSS pixel of rounding and a partial leg are accepted');
console.log('PASS the two guards are warnings with their numbers, never failed rows (normal and Reduced Motion); the paint ratio still fails origin/main\'s equal arms; a partial window cannot be judged, and a renderer-less window is could not judge instead of halving the ratio');
