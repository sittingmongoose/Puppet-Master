// Self-test for perf-stop-chip-beat's Animation speed row (PM7PERF-STOPCHIP-SPEED-NOOP).
// Fast is 0.6 and Slow (Settings' Cinematic) is 1.6 (settings/kit.d/17-look.js O55_SPEED).
// The unscaled loops are 2200 ms flowing and 3200 ms waiting (the check's header; send-stop.css).
// A page whose samples stay on those unscaled lengths must fail.
// Usage: node tools/stop-chip-speed.selftest.mjs [path to perf-stop-chip-beat.check.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const page = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-stop-chip-beat.check.mjs';
const mod = await import(page);

const BASE = { flowing: 2200, waiting: 3200 };
const FACTOR = { Fast: 0.6, Slow: 1.6 };

// The check used to record Fast and Measured and never read either loop's length against the factor.
// With no exported judge, that is a pass. The row's judge has to reject it.
function judge(R) {
	if (typeof mod.judgeSpeed !== 'function') return { ok: true, bad: [], note: 'no speed-duration row' };
	return mod.judgeSpeed(R);
}

function runPage(scaled) {
	const rows = [];
	const marks = [];
	let w = 0;
	const push = (flow, speed) => {
		const dur = BASE[flow] * (scaled ? FACTOR[speed] : 1);
		rows.push({ w, t: w, flow, g: { dur }, b: { dur } });
		w += 16;
	};
	for (const speed of ['Fast', 'Slow']) {
		marks.push({ name: `Animation speed ${speed}, waiting, mid-loop`, i: rows.length, kind: 'speed' });
		push('waiting', speed);
		push('waiting', speed);
		push('flowing', speed);
		push('flowing', speed);
	}
	return { rows, marks };
}

const noop = judge(runPage(false));
assert.equal(noop.ok, false, `a page where speed does nothing must fail ${JSON.stringify(noop)}`);
const scaled = judge(runPage(true));
assert.equal(scaled.ok, true, `Fast and Slow at their factors must pass ${JSON.stringify(scaled.bad)}`);
const one = runPage(true);
one.rows[one.rows.length - 1].b.dur = BASE.flowing;
const partial = judge(one);
assert.equal(partial.ok, false, `a backlight that stays at the unscaled flowing length under Slow must fail ${JSON.stringify(partial.bad)}`);
console.log('stop-chip-speed: 3 cases pass');
