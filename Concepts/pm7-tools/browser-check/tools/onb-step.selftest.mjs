// checks/perf-onb-step.check.mjs (ONB-STEP: Pip's resting drift drawn in 0.1 px steps, Jared 2026-11-27) on readings
// shaped as its WATCH returns them, its WATCH against a stub stage, and the product's gate pinned in its source.
//   node tools/onb-step.selftest.mjs [perf-onb-step.check.mjs] [58-rig.js] [perf-onb-loop.check.mjs]
// It also pins FO-252's row (checks/perf-onb-loop.check.mjs, one stage loop a frame) and the fix in 58-rig.js.
// Reverting the gate (the stage drawing in every frame at rest) fails the rest verdict; a gate that also skipped frames
// while Pip swings, talks, blinks or follows the pointer fails the motion verdict; a source without the gate fails the pin.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const m = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-onb-step.check.mjs');
const rigPath = process.argv[3] ? resolve(process.argv[3]) : join(here, '../../../onboarding/opus-5.5/src/js/58-rig.js');
for (const k of ['WATCH', 'POSEWATCH', 'ZWATCH', 'restStepVerdict', 'slowLookVerdict', 'motionVerdict', 'poseVerdict', 'zVerdict']) assert.equal(typeof m[k], 'function', `the check exports ${k}`);
const { restStepVerdict: rest, motionVerdict: motion } = m;

// at rest, 3 s at 120 Hz: main before the gate drew every frame; the gate draws a few to about 30 a second
assert.equal(rest({ full: 357, part: 0, frames: 357, secs: 3, fps: 0 }).ok, false, 'a draw in every frame at rest fails');
assert.match(rest({ full: 357, part: 0, frames: 357, secs: 3, fps: 0 }).why, /draws in every frame at rest/);
assert.equal(rest({ full: 36, part: 0, frames: 357, secs: 3, fps: 0 }).ok, true, rest({ full: 36, part: 0, frames: 357, secs: 3, fps: 0 }).why);
// a 238 Hz display (Alexis's PC) before the gate: 238 draws a second fails; the gate's 30 a second passes
assert.equal(rest({ full: 714, part: 0, frames: 714, secs: 3, fps: 0 }).ok, false);
assert.equal(rest({ full: 90, part: 0, frames: 714, secs: 3, fps: 0 }).ok, true);
// partial draws (Welcome's sleeping z's, NieR's brackets) are not full draws
assert.equal(rest({ full: 30, part: 320, frames: 357, secs: 3, fps: 0 }).ok, true);
// Friendly's sway steps about 50 times a second: passes; over the limit by rate or by share fails
assert.equal(rest({ full: 156, part: 0, frames: 357, secs: 3, fps: 0 }).ok, true, '52 a second at 120 Hz passes');
assert.equal(rest({ full: 195, part: 0, frames: 714, secs: 3, fps: 0 }).ok, false, '65 a second is over 60');
assert.equal(rest({ full: 165, part: 0, frames: 300, secs: 3, fps: 0 }).ok, false, '55 % of a 100 Hz display is over half');
// a display under 90 Hz: not judged per cell, the look on its mean share
const s60 = rest({ full: 180, part: 0, frames: 180, secs: 3, fps: 0 });
assert.equal(s60.ok, null); assert.equal(s60.slow, true); assert.equal(s60.share, 1);
assert.equal(m.slowLookVerdict([1, 1, .99]).ok, false, 'a draw in every frame of a 60 Hz display fails the look');
assert.equal(m.slowLookVerdict([.25, .95, .6]).ok, true, "the gate at 60 Hz (the VM's Glass Dark) passes");
assert.equal(m.slowLookVerdict([]).ok, false, 'no cell: could not judge');
// Retro keeps its own stepped rate: 20 a second passes, every frame fails
assert.equal(rest({ full: 60, part: 0, frames: 357, secs: 3, fps: 20 }).ok, true);
assert.equal(rest({ full: 357, part: 0, frames: 357, secs: 3, fps: 20 }).ok, false);
// no reading: could not judge, never a pass
assert.equal(rest(null).ok, false); assert.match(rest({ err: 'no stage' }).why, /could not judge/);
assert.equal(rest({ full: 0, part: 0, frames: 3, secs: .05, fps: 0 }).ok, false);

// the painted head against a full draw (A147): the 0.1 px step's own staleness passes; a breath held 0.85 px late for
// 13 frames (392dc3c7, Basic Dark Welcome on the VM) fails; one or two frames over the limit pass; no reading never passes
{
	const pose = m.poseVerdict, gaps = (n, over, run) => Array.from({ length: n }, (_, i) => (i >= 100 && i < 100 + run ? over : .09));
	const reading = (g) => ({ frames: g.length, gaps: g, maxPx: Math.max(...g), worst: { t: 1, written: 'a', ref: 'b' } });
	assert.equal(pose(reading(gaps(360, .1, 0))).ok, true, 'the step itself');
	assert.equal(pose(reading(gaps(360, .85, 13))).ok, false, 'a breath drawn late');
	assert.match(pose(reading(gaps(360, .85, 13))).why, /longest run 13 frames/);
	assert.equal(pose(reading(gaps(360, .4, 2))).ok, true, 'two frames over the limit');
	assert.equal(pose(reading(gaps(360, .4, 3))).ok, false, 'three frames over the limit');
	assert.equal(pose({ err: 'no stage' }).ok, false); assert.equal(pose({ frames: 5, gaps: [0, 0, 0, 0, 0], maxPx: 0 }).ok, false, 'too few frames: could not judge');
	assert.equal(pose({ skip: "Retro's own stepped draw (20/s)" }).skip, true);
}
// a sleeping z's written opacity against a full draw's (A150): a z off only in the frame it appears passes; one step too
// opaque for 3 frames in a row (c5292b0416, Basic Dark Welcome at 320x640 on Jared's PC) fails; no z read never passes
{
	const z = m.zVerdict, rd = (longest, stale = 7) => ({ frames: 1250, glyphs: 9, glyphFrames: 2780, stale, longest, worst: { t: 1, written: .26, want: .25 } });
	assert.equal(z(rd(1)).ok, true, 'off only in the frame a z appears');
	assert.equal(z(rd(2, 12)).ok, true, 'two frames');
	assert.equal(z(rd(2, 535)).ok, false, "c5292b0416 at 120 Hz: runs of two, but 535 readings off for 9 z's");
	assert.match(z(rd(2, 535)).why, /535 readings off .*want at most 2 a z, 18/);
	assert.equal(z(rd(3, 507)).ok, false, 'three frames one step too opaque');
	assert.match(z(rd(3, 507)).why, /a z drawn late .*written 0\.26, full draw 0\.25/);
	assert.equal(z({ err: 'no stage' }).ok, false); assert.equal(z({ frames: 400, glyphs: 0 }).ok, false, 'no z read: could not judge');
	assert.equal(z({ skip: 'NieR has no sleeping z' }).skip, true);
	const chk = readFileSync(process.argv[2] ? resolve(process.argv[2]) : join(here, '../checks/perf-onb-step.check.mjs'), 'utf8');
	const zw = chk.slice(chk.indexOf('export const ZWATCH'), chk.indexOf('export function zVerdict'));
	assert.ok(zw.length > 200, 'ZWATCH found');
	assert.doesNotMatch(zw, /zMoved|\.dr\b|drawDue|poseKey|drawn/, "the glyph reference does not read the gate's record");
	assert.match(zw, /p\.e\.getAttribute\('opacity'\)/, 'the written opacity is read from the page');
	assert.match(zw, /R\(Math\.max\(0, 1 - \(p\.life \/ p\.max\) \*\* 2\)\)/, "the reference is render()'s fade, rounded by the page's R");
	assert.match(chk, /String\(t\.args\.zSize \|\| '320x640'\)/, 'read in a small window by default');
}
// the reference is the painter's own formula and rounding, never the gate's key (a check that compares poseKey with drawn
// inherits the gate's blind spot: A147 finding 2)
{
	const chk = readFileSync(process.argv[2] ? resolve(process.argv[2]) : join(here, '../checks/perf-onb-step.check.mjs'), 'utf8');
	const pw = chk.slice(chk.indexOf('export const POSEWATCH'), chk.indexOf('export const ZWATCH'));
	assert.ok(pw.length > 200, 'POSEWATCH found');
	assert.doesNotMatch(pw, /poseKey|drawn|drawDue/, 'the pose reference does not read the gate');
	assert.match(pw, /scale\(\$\{R\(sx\)\} \$\{R\(sy\)\}\)/, 'the reference writes the head scales rounded, as render() does');
	assert.match(pw, /st\.gHead\.getAttribute\('transform'\)/, 'the written transform is read from the page');
}

// a motion window draws every frame (at most two frames without a full draw)
assert.equal(motion({ full: 48, part: 0, frames: 48, fps: 0 }).ok, true);
assert.equal(motion({ full: 46, part: 0, frames: 48, fps: 0 }).ok, true);
assert.equal(motion({ full: 30, part: 0, frames: 48, fps: 0 }).ok, false, 'a gate that steps a swing fails');
assert.equal(motion({ full: 0, part: 48, frames: 48, fps: 0 }).ok, false, 'partial draws are not full draws');
assert.equal(motion({ full: 8, part: 0, frames: 48, fps: 20 }).ok, true, 'Retro is logged at its own rate');
assert.equal(motion(null).ok, false);

// WATCH against a stub stage: render() and render(true) counted apart, the window's action applied, the stage's own
// render restored after
{
	const frames = [];
	globalThis.requestAnimationFrame = (fn) => { frames.push(fn); return frames.length; };
	const draws = [];
	const st = {
		root: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 560 }) },
		ps: { thv: 0, nextBlink: 99 }, t: 10, gate: { full: 0, part: 0, skip: 0 }, map: { k: 1.1 },
		render(part) { draws.push(!!part); }, frameRate: () => 0, say() { this.said = true; }
	};
	const proto = st.render;
	globalThis.document = { querySelector: () => ({ __pipStage: st }), dispatchEvent() {} };
	globalThis.window = { devicePixelRatio: 1, O55: { pipStage: { drawStepPx: .1 } } }; globalThis.O55 = globalThis.window.O55;
	const p = m.WATCH(['swing', 100]);
	let ts = 1000;
	// each frame: the page's frame callback, then the stage drawing one frame in three in full and the rest in part
	for (let i = 0; i < 20 && frames.length; i++) { const fn = frames.shift(); fn(ts); st.render(i % 3 !== 0); ts += 1000 / 120; }
	const r = await p;
	assert.equal(st.ps.thv, .5, 'swing kicks Pip as its idle swing does');
	assert.equal(r.full + r.part, r.frames, `every draw counted (one a frame) (${r.full} + ${r.part} over ${r.frames} frames)`);
	assert.ok(r.full > 0 && r.part > 0, 'full and partial draws counted apart');
	assert.equal(st.render, proto, "the stage's render is restored");
	delete globalThis.requestAnimationFrame; delete globalThis.document; delete globalThis.window; delete globalThis.O55;
}

// the product's gate, pinned in its source: the named 0.1 px step with Jared's decision, the loop asking drawDue and
// returning without a draw when nothing moved a step, and the partial draw
const src = readFileSync(rigPath, 'utf8');
assert.match(src, /const PIP_DRAW_STEP_PX = PIP\.drawStepPx = 0\.1;/, 'PIP_DRAW_STEP_PX is 0.1 px');
assert.match(src, /Jared,\s+2026-11-27, decision 1/, "the step names Jared's decision");
const loop = src.slice(src.indexOf('    loop() {'), src.indexOf('    poseKey() {'));
assert.ok(loop.length > 100, 'Stage.loop found');
assert.match(loop, /due = this\.drawDue\(\)/, 'the loop asks drawDue');
assert.match(loop, /if \(!due\) \{ g\.skip\+\+; return; \}/, 'the loop skips the draw when nothing moved a step');
assert.match(loop, /if \(due === 'part'\) \{ g\.part\+\+; this\.render\(true\); return; \}/, 'the partial draw');
assert.match(loop, /if \(!fps && !this\.reduced && !this\.dirty\)/, "Retro's stepped draw, a still stage and a change kicked in are left alone");
const due = src.slice(src.indexOf('    drawDue() {'), src.indexOf('    render(part) {'));
for (const [re, what] of [[/this\.typeT \|\| this\.tipW/, 'speech and a note being written'], [/this\.faceOut \|\| this\.faceT0 != null/, 'a face changing'], [/t > ps\.nextBlink/, 'a blink due'], [/p\.kind !== 'z'/, 'a particle that is not a z'], [/PIP_DRAW_STEP_PX \/ \(this\.map\.k \* dpr\)/, 'the step in device pixels']])
	assert.match(due, re, `drawDue draws every frame for ${what}`);
assert.match(src.slice(src.indexOf('    poseKey() {'), src.indexOf('    zMoved(')), /d\.push\(R\(ps\.sx \* \(1 - br \* \.4\)\), R\(ps\.sy \* \(1 \+ br\)\)\);/, 'the draw key holds the head scales as the painter writes them (A147)');
assert.match(src, /    render\(part\) \{[\s\S]*scale\(\$\{R\(sx\)\} \$\{R\(sy\)\}\)/, 'render() still writes the head scales rounded (the key matches what is painted)');
{
	const zm = src.slice(src.indexOf('    zMoved(p, step) {'), src.indexOf('    drawDue() {'));
	assert.match(zm, /R\(Math\.max\(0, 1 - \(p\.life \/ p\.max\) \*\* 2\)\) !== q\[3\]/, "a z's opacity is compared as the painter writes it (A150)");
	assert.match(src, /p\.dr = \[p\.x, p\.y, p\.r, R\(Math\.max\(0, op\)\)\];/, 'renderFx keeps the opacity it wrote, rounded');
}
assert.match(src, /const PIP_DRAW_SWING_PXS = 30, PIP_DRAW_FAST_PXS = 12, PIP_DRAW_FAST_HOLD = \.5;/, 'a swing is drawn whole: from 30 px a second until under 12 for half a second');
assert.match(due, /if \(pxs >= PIP_DRAW_SWING_PXS\) this\.swingOn = true;/, 'a swing starts the every-frame draw');
assert.match(due, /if \(this\.swingOn\) return 'full';/, 'drawDue draws every frame through a swing');
// FO-252 (R150 L3): one stage loop a frame. perf-onb-loop.check.mjs's verdict on readings shaped as its LOOPWATCH returns
// them, its LOOPWATCH against a stub stage with one chain and with two, and the fix pinned in the product's source.
{
	const lp = await import(process.argv[4] ? pathToFileURL(resolve(process.argv[4])).href : '../checks/perf-onb-loop.check.mjs');
	for (const k of ['LOOPWATCH', 'loopVerdict']) assert.equal(typeof lp[k], 'function', `perf-onb-loop exports ${k}`);
	const v = lp.loopVerdict;
	// 90286cf58f on the VM after a look switch on Welcome: 2 a frame (3 and 4 after more switches); the fix: 1
	assert.equal(v({ calls: 362, frames: 181, dup: 181, maxPer: 2, still: false }).ok, false, 'two chains fail');
	assert.match(v({ calls: 362, frames: 181, dup: 181, maxPer: 2, still: false }).why, /second requestAnimationFrame chain/);
	assert.equal(v({ calls: 724, frames: 181, dup: 181, maxPer: 4, still: false }).ok, false, 'four chains fail');
	assert.equal(v({ calls: 181, frames: 181, dup: 0, maxPer: 1, still: false }).ok, true, 'one chain passes');
	assert.equal(v({ calls: 180, frames: 181, dup: 0, maxPer: 1, still: false }).ok, true, 'the first frame after the wrap missed passes');
	// one doubled frame is a second chain however few: the rule is per frame, not a mean
	assert.equal(v({ calls: 182, frames: 181, dup: 1, maxPer: 2, still: false }).ok, false, 'one frame with two calls fails');
	assert.equal(v({ calls: 200, frames: 181, dup: 0, maxPer: 1, still: false }).ok, false, 'more calls than frames fails');
	// a still stage that parked: no calls is one chain; a moving stage that did not loop could not show a second chain
	assert.equal(v({ calls: 0, frames: 181, dup: 0, maxPer: 0, still: true }).ok, true, 'a parked still stage passes');
	assert.equal(v({ calls: 40, frames: 181, dup: 0, maxPer: 1, still: false }).ok, false, 'a moving stage looping in under half the frames: could not judge');
	assert.match(v({ calls: 40, frames: 181, dup: 0, maxPer: 1, still: false }).why, /could not judge/);
	assert.equal(v(null).ok, false); assert.equal(v({ err: 'no stage' }).ok, false); assert.equal(v({ calls: 3, frames: 3, dup: 0, maxPer: 1 }).ok, false, 'too few frames');
	// LOOPWATCH against a stub stage: the page's frames run their callbacks with one frame time each, the stage's loop
	// asks for the next frame with requestAnimationFrame(this.loop) as Stage.loop does; with chains=2 two chains run
	for (const chains of [1, 2]) {
		let queue = [];
		globalThis.requestAnimationFrame = (fn) => { queue.push(fn); return queue.length; };
		const st = { root: { hasAttribute: () => false }, raf: 1, still: () => false, live: () => true };
		st.loop = function () { this.raf = requestAnimationFrame(this.loop); }.bind(st);
		const bound = st.loop;
		globalThis.document = { querySelector: () => ({ __pipStage: st }) };
		for (let c = 0; c < chains; c++) requestAnimationFrame(st.loop);
		const p = lp.LOOPWATCH(100);
		let ts = 1000;
		for (let i = 0; i < 40 && queue.length; i++) { const q = queue; queue = []; q.forEach((fn) => fn(ts)); ts += 1000 / 60; }
		const r = await p;
		assert.equal(st.loop, bound, "the stage's own loop is restored");
		assert.ok(r.frames >= 5, `frames read (${r.frames})`);
		if (chains === 1) { assert.equal(r.dup, 0); assert.equal(r.maxPer, 1); assert.ok(r.calls >= r.frames - 1 && r.calls <= r.frames, `one a frame (${r.calls} over ${r.frames})`); }
		else { assert.equal(r.maxPer, 2, 'two chains: two calls in a frame'); assert.ok(r.dup >= r.frames - 1, `every frame doubled (${r.dup} of ${r.frames})`); }
		delete globalThis.requestAnimationFrame; delete globalThis.document;
	}
	// the fix in the source: a kick inside the loop only marks the stage dirty, the 0.9 s look is taken inside it, and the
	// loop's own request replaces any other before it asks for the next frame
	const kick = src.slice(src.indexOf('    kick() {'), src.indexOf('    park() {'));
	assert.match(kick, /if \(this\.raf \|\| this\.dead \|\| this\.inLoop\) return;/, 'kick starts no chain from inside the loop (FO-252)');
	assert.match(loop, /if \(this\.remeasureAt && tn > this\.remeasureAt\) \{ this\.remeasureAt = 0; this\.inLoop = true; try \{ this\.measure\(\); \} finally \{ this\.inLoop = false; \} \}/, "the build's 0.9 s look is taken with the loop marked (FO-252)");
	assert.match(loop, /if \(this\.raf\) cancelAnimationFrame\(this\.raf\);\n\s*this\.raf = requestAnimationFrame\(this\.loop\);/, "the loop's own request replaces any other (FO-252)");
}
console.log('onb-step selftest: ok');
