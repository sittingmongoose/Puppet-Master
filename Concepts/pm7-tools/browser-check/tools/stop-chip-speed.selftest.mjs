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
// R65 A1 (PM7PERF-STOPCHIP-SPEED-STALE-BACKLIGHT): each pace's TERMINAL sample still has the glyph but the
// backlight has disappeared. The judge used to remember the earlier scaled backlight and pass the row; the
// terminal sample is what the speed has settled on, and a look that is not NieR must show both loops there.
function staleBacklightPage() {
	const rows = [];
	const marks = [];
	for (const [name, factor] of [['Fast', FACTOR.Fast], ['Slow', FACTOR.Slow]]) {
		marks.push({ name: `Animation speed ${name}`, kind: 'speed', i: rows.length });
		for (const [flow, base] of [['waiting', BASE.waiting], ['flowing', BASE.flowing]]) {
			const dur = base * factor;
			rows.push({ flow, g: { dur }, b: { dur } });
			rows.push({ flow, g: { dur } });
		}
	}
	return { rows, marks };
}
const stale = judge(staleBacklightPage());
assert.equal(stale.ok, false, `a backlight that disappears in each pace's terminal sample must fail ${JSON.stringify(stale)}`);
const staleMissing = stale.bad.filter((x) => x.missing && x.layer === 'backlight').map((x) => `${x.speed}/${x.flow}`).sort();
assert.deepEqual(staleMissing, ['Fast/flowing', 'Fast/waiting', 'Slow/flowing', 'Slow/waiting'], `every pace's terminal sample reads as backlight missing: ${JSON.stringify(stale.bad)}`);
// The real page, NieR Dark (Alexis, 2026-11-16, the batch's first browser run): the Fast window still catches a glow
// at its start, and NieR's restyle then drops it, so each pace's terminal sample is a NieR sample with a glyph and
// no backlight. That is the look's normal state, not a loop the run lost: the row must pass.
function nierGlowThenGone() {
	const rows = [];
	const marks = [];
	let w = 0;
	for (const speed of ['Fast', 'Slow']) {
		marks.push({ name: `Animation speed ${speed}, waiting, mid-loop`, i: rows.length, kind: 'speed' });
		for (const flow of ['waiting', 'flowing']) {
			const dur = BASE[flow] * FACTOR[speed];
			if (speed === 'Fast') { rows.push({ w, t: w, flow, nier: 'on', g: { dur }, b: { dur } }); w += 16; }
			rows.push({ w, t: w, flow, nier: 'on', g: { dur } }); w += 16;
		}
	}
	return { rows, marks };
}
const nierGone = judge(nierGlowThenGone());
assert.equal(nierGone.ok, true, `NieR dropping its glow inside the Fast window must pass ${JSON.stringify(nierGone.bad)}`);
// and the same samples on a page that is not NieR still fail: only NieR may lose the backlight
const notNierGone = nierGlowThenGone();
for (const r of notNierGone.rows) delete r.nier;
assert.equal(judge(notNierGone).ok, false, 'the same disappearing backlight outside NieR must fail');
// R74 C2: terminal loss of both loops must fail every speed/cadence, even with a good earlier sample.
const bothGone = staleBacklightPage();
for (let i = 1; i < bothGone.rows.length; i += 2) delete bothGone.rows[i].g;
const noLoops = judge(bothGone);
assert.equal(noLoops.ok, false, 'earlier durations cannot replace missing terminal loops');
assert.deepEqual(noLoops.bad.filter((x) => x.missing && x.layer === 'glyph').map((x) => `${x.speed}/${x.flow}`).sort(),
	['Fast/flowing', 'Fast/waiting', 'Slow/flowing', 'Slow/waiting'], 'all four terminal glyphs are missing');
// R74/R75 C3: Fast briefly has a glow while waiting. Its flowing pace never shows one.
const waitingGlow = nierGlowThenGone();
waitingGlow.rows.splice(2, 1);
waitingGlow.marks[1].i--;
assert.equal(judge(waitingGlow).ok, true, 'a waiting glow does not require a flowing glow in NieR');
waitingGlow.rows[0].b.dur = BASE.waiting;
assert.equal(judge(waitingGlow).ok, true, 'a transient unscaled glow does not replace a glyph-only NieR terminal sample');
waitingGlow.rows[1].b = { dur: BASE.waiting };
const visibleGlow = judge(waitingGlow);
assert.deepEqual(visibleGlow.bad, [{ speed: 'Fast', flow: 'waiting', layer: 'backlight', dur: 3200, want: 1920 }],
	'a glow still present at the end of its pace must scale in NieR too');
// R62 A2: keep an ineligible pre-application sample, then judge the first later frame.
const judgePrompt = mod.judgeSpeedPrompt || judge;
function promptPage() {
	const R = runPage(true);
	for (const m of R.marks) {
		m.appliedFrame = R.rows[m.i].t;
		R.rows[m.i].g.dur = R.rows[m.i].b.dur = BASE.waiting;
	}
	return R;
}
const prompt = promptPage();
assert.equal(judgePrompt(prompt).ok, true, 'the first frame after the save has the new factor');
const delayed = promptPage();
delayed.rows.splice(1, 0, { t: 8, flow: 'waiting', g: { dur: BASE.waiting }, b: { dur: BASE.waiting } });
delayed.marks[1].i++;
assert.equal(judge(delayed).ok, true, 'the same delayed adoption eventually settles');
assert.equal(judgePrompt(delayed).ok, false, 'the first eligible frame cannot borrow the later scaled durations');
const noFrame = promptPage();
noFrame.marks[0].appliedFrame = noFrame.rows[noFrame.marks[1].i].t;
assert.equal(judgePrompt(noFrame).ok, false, 'a sample beyond the next speed change cannot stand in');
const missingFirst = promptPage();
delete missingFirst.rows[1].g;
assert.equal(judgePrompt(missingFirst).ok, false, 'missing glyph in the first eligible frame fails');
console.log('stop-chip-speed: 19 cases pass');
