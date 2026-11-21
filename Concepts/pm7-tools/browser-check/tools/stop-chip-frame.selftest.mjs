// Self-test for perf-stop-chip-beat's every-frame row (PM7PERF-STOPCHIP-FRAME-GUARD).
// A glyph-scale step past its bound inside the sampling window must fail the row.
// A step before the first change is outside that window and is not counted.
// Usage: node tools/stop-chip-frame.selftest.mjs [path to perf-stop-chip-beat.check.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const page = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-stop-chip-beat.check.mjs';
const { everyFrame } = await import(page);

const GAP = 8.4;
const DUR = 3200;
function loop(id, place, v) {
	return { id, dur: DUR, delay: 0, s: 0, c: place * DUR, rate: 1, place, state: 'running', v };
}
// Nine samples, 8.4 ms apart. Place advances by one ordinary frame. `bad` is the index whose glyph
// scale steps by 0.1 and stays there, so exactly one comparison fails. Timing does not jump.
function frames(bad, markAt) {
	const rows = [];
	for (let i = 0; i < 9; i++) {
		const w = 1000 + i * GAP;
		const place = 1 + (i * GAP) / DUR;
		const v = i >= bad ? 1.1 : 1;
		rows.push({ t: w, w, flow: 'waiting', win: false, th: 'basic-dark', ease: 'ease', g: loop(1, place, v), b: loop(2, place, 1) });
	}
	return { rows, marks: [{ name: 'word while waiting, early in the loop', i: markAt, kind: 'word' }] };
}

const inside = everyFrame(frames(4, 1));
assert.ok(inside.worst > 1, `an in-window glyph-scale failure must fail the row (worst ${inside.worst})`);
assert.equal(inside.valueFails, 1, `the in-window failure must be counted (got ${inside.valueFails})`);
const outside = everyFrame(frames(2, 6));
assert.ok(outside.worst <= 1 && (outside.valueFails || 0) === 0, `a scale step before the first change is outside the window (worst ${outside.worst}, count ${outside.valueFails})`);
// R64 A2: a visual fault while already flowing cannot contribute to its own allowance.
for (const layer of ['g', 'b']) {
	const R = frames(Infinity, 1);
	for (const row of R.rows) row.flow = 'flowing';
	R.baseline = R.rows.map((row, i) => ({
		...row, g: { ...row.g, v: 1 - 0.008 * i }, b: { ...row.b, v: 1 - 0.008 * i },
	}));
	for (const [i, row] of R.rows.entries()) row[layer].v = 1 - 0.008 * i;
	const steady = everyFrame(R);
	assert.ok(steady.worst <= 1 && steady.valueFails === 0, 'the quiet ordinary step is accepted');
	for (const row of R.rows.slice(4)) row[layer].v -= 0.1;
	const step = everyFrame(R);
	assert.equal(step.valueFails, 1, `the flowing ${layer} step past the quiet bound must be counted`);
	assert.ok(step.worst > 1, 'the step cannot calibrate its own bound');
}
console.log('stop-chip-frame: 6 cases pass');
