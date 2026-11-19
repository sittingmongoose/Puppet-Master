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

const win = (name, paint, full, rest, extra = {}) => ({ name, scrolls: 48, whole: true, lost: [], paint, full, partial: 60, unknown: 0, restFrames: rest, ...extra });
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
console.log('PASS the two guards are warnings with their numbers, never failed rows (normal and Reduced Motion); the paint ratio still fails origin/main\'s equal arms; a partial window cannot be judged');
