// checks/perf-onb-step.check.mjs (ONB-STEP: Pip's resting drift drawn in 0.1 px steps, Jared 2026-11-27) on readings
// shaped as its WATCH returns them, its WATCH against a stub stage, and the product's gate pinned in its source.
//   node tools/onb-step.selftest.mjs [perf-onb-step.check.mjs] [58-rig.js]
// Reverting the gate (the stage drawing in every frame at rest) fails the rest verdict; a gate that also skipped frames
// while Pip swings, talks, blinks or follows the pointer fails the motion verdict; a source without the gate fails the pin.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const m = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-onb-step.check.mjs');
const rigPath = process.argv[3] ? resolve(process.argv[3]) : join(here, '../../../onboarding/opus-5.5/src/js/58-rig.js');
for (const k of ['WATCH', 'restStepVerdict', 'slowLookVerdict', 'motionVerdict']) assert.equal(typeof m[k], 'function', `the check exports ${k}`);
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
assert.match(src, /const PIP_DRAW_SWING_PXS = 30, PIP_DRAW_FAST_PXS = 12, PIP_DRAW_FAST_HOLD = \.5;/, 'a swing is drawn whole: from 30 px a second until under 12 for half a second');
assert.match(due, /if \(pxs >= PIP_DRAW_SWING_PXS\) this\.swingOn = true;/, 'a swing starts the every-frame draw');
assert.match(due, /if \(this\.swingOn\) return 'full';/, 'drawDue draws every frame through a swing');
console.log('onb-step selftest: ok');
