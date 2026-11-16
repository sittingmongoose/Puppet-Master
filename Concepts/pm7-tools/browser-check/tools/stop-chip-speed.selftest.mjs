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
// NieR hides .ss-bl, so a real NieR sample has a glyph and no glow. The glyph still has to scale.
// A look that is not NieR and has no glow has not produced the backlight sample.
function nierPage(scaled) {
	const rows = [];
	const marks = [];
	let w = 0;
	const push = (flow, speed) => {
		const dur = BASE[flow] * (scaled ? FACTOR[speed] : 1);
		rows.push({ w, t: w, flow, nier: 'on', g: { dur } });
		w += 16;
	};
	for (const speed of ['Fast', 'Slow']) {
		marks.push({ name: `Animation speed ${speed}, waiting, mid-loop`, i: rows.length, kind: 'speed' });
		push('waiting', speed);
		push('flowing', speed);
	}
	return { rows, marks };
}
const nierOk = judge(nierPage(true));
assert.equal(nierOk.ok, true, `NieR's glyph at the factors must pass ${JSON.stringify(nierOk.bad)}`);
const nierNo = judge(nierPage(false));
assert.equal(nierNo.ok, false, `NieR's glyph left unscaled must fail ${JSON.stringify(nierNo)}`);
const bare = runPage(true);
for (const r of bare.rows) delete r.b;
const noGlow = judge(bare);
assert.equal(noGlow.ok, false, `a non-NieR page with no backlight sample must fail ${JSON.stringify(noGlow)}`);
// Fast can still show a glow that Slow's restyle drops. Slow's glyph is still judged.
const split = nierPage(true);
for (const r of split.rows) if (r.flow && /Fast/.test(split.marks[0].name) && r.w < split.marks[1].i * 16) r.b = { dur: r.g.dur };
const splitOk = judge(split);
assert.equal(splitOk.ok, true, `NieR Slow with no glow must still judge the glyph ${JSON.stringify(splitOk.bad)}`);
split.rows[split.rows.length - 1].g.dur = BASE.flowing;
const splitBad = judge(split);
assert.equal(splitBad.ok, false, `NieR Slow's glyph left unscaled must fail ${JSON.stringify(splitBad.bad)}`);
console.log('stop-chip-speed: 8 cases pass');
