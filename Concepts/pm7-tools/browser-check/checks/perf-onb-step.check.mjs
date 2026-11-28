// Pip's stage at rest draws in 0.1-pixel steps, and anything fast still draws every frame (ONB-STEP; Jared,
// 2026-11-27, decision 1 of the pm7-perf hand-over of 15 Nov, "Onboarding option 1"; share
// puppet-master/2026-11-11-pm7-performance/swarm/ONBSTEP-task.md).
//
// Before it, the onboarding stage (Stage.loop, js/58-rig.js) drew everything in every frame to move Pip about 0.011 px:
// 119 draws a second at rest at 120 Hz. Now the physics steps every frame and the stage draws once what it shows has
// moved PIP_DRAW_STEP_PX (0.1 device px) or an opacity 1 % (Stage.drawDue); a frame where only Pip's sleeping z's or
// NieR's target brackets (their breath and turning diamond) moved draws only them (render(true): a partial draw). Retro keeps its own stepped draw (10 or 20 a second) and Reduced Motion its still stage.
//
// Per look and screen, at rest (as perf-onb-rest.check.mjs gets there: a pointer journey wakes Pip past Welcome, then
// the cell must be at rest by its POSE gate; on Welcome Pip asleep; Pip's idle life held off from the screen's opening
// to the window's end, so its swings, judged below, are not read as drift), for --set ms (default 3000) ms the stage's render()
// calls are counted (full draws, and partial draws: render(true)) against the page's own frames. Judged:
//   rest     on a display of 90 Hz or more: full draws a second at most --set restMax (default 60) and at most
//            --set restShare (default 0.5) of the frames, outside Retro (Friendly's sway, the fastest, steps about 50
//            times a second; Basic's 5 to 20). On a slower display (the VM's 60 Hz) a second's draws cannot tell the
//            gate from a draw in every frame, so each cell is logged and the look is judged once on its cells' mean
//            share: at most --set slowShare (default 0.85) of the frames. Retro at most its own rate (Retro Dark 20,
//            Retro Light 10) plus a fifth and one. Red on main before the gate (a draw in every frame).
//   pose     in the same cells (idle life still held off), for --set poseMs (default 6000, two breaths) the head as the page
//            painted it against the head a full draw would paint at that tick (A147: the gate once compared continuous
//            head scales while the painter writes them to 0.01, and Basic Dark's breath showed half a second late,
//            0.85 device px off for 29 frames). After every stepped frame of the stage's own loop the written
//            transform of its head (gHead) is read, and the reference is rebuilt from the physics state with render()'s
//            own formula and rounding (headAt, NieR's bob, the floor and visible-crop clamps, the breath, R to 0.01),
//            never from the gate's poseKey; the head's box (pipBB) is put through both, and the largest corner gap in
//            device pixels is that frame's staleness. A cell fails when the head is more than --set poseMax (default
//            0.25: the 0.1 px step plus the corner sum of its parts, A147 measured 0.19 after the repair) device px
//            stale for more than --set poseRun (default 2) frames in a row. Retro (its own stepped draw) and a still
//            stage are logged, not judged.
// Then per look, on the last awake screen of --set screens, windows where the stage must draw every frame (each at most
// --set miss (default 2) frames without a full draw, outside Retro, which draws at its own rate and is only logged):
//   swing    Pip set swinging as its idle swing does (ps.thv += 0.5), 400 ms;
//   speech   a new long line typing (say(..., now)), 500 ms;
//   pointer  a pointermove in every frame across the stage, 500 ms (user input);
//   blink    a blink started (ps.nextBlink = now), 160 ms (a blink's length), only on a look whose face has a blink
//            (NieR's visor has none: logged, not judged).
// Logged per cell: frames a second, full and partial draws a second, skipped frames a second (the stage's own gate
// counters when it has them).
// --set looks= (default all ten; `dark` the five Dark looks) --set screens= (default welcome,where,ready)
// --set settle= (default 20000) --set viewSettle= (default 6000) --set ms= --set restMax= --set restShare= --set miss=
// --set poseMs= (0 leaves the pose rows out) --set poseMax= --set poseRun= --set motion=0 leaves out the every-frame windows. One surface per run (--set sandbox=1 for the sandbox).
import { muteSound } from '../helpers/quiet-page.mjs';
import { POSE, restVerdict } from './perf-onb-rest.check.mjs';

const ALL = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

// In the page: count the stage's draws (full and partial) and the page's frames for ms, with an action at the start of
// the window (kind: 'rest' | 'swing' | 'speech' | 'pointer' | 'blink'). Exported for tools/onb-step.selftest.mjs.
export const WATCH = ([kind, ms]) => new Promise((res) => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || typeof st.render !== 'function') { res({ err: 'no stage (#pm-o55-onboarding .o55-stage with its __pipStage)' }); return; }
	const own = Object.prototype.hasOwnProperty.call(st, 'render'), orig = st.render;
	const W = { full: 0, part: 0, frames: 0, kind };
	const g0 = st.gate ? { ...st.gate } : null;
	st.render = function (part) { if (part) W.part++; else W.full++; return orig.apply(this, arguments); };
	const box = st.root.getBoundingClientRect();
	let i = 0, t0 = 0, done = false;
	const tick = (ts) => {
		if (done) return;
		if (!t0) {
			t0 = ts;
			if (kind === 'swing' && st.ps) st.ps.thv += .5;
			else if (kind === 'speech') st.say('A longer line now, one that takes two or three lines in the box so that it types for a while.', null, true);
			else if (kind === 'blink' && st.ps) st.ps.nextBlink = st.t - .001;
		} else W.frames++;
		if (kind === 'pointer') { i++; document.dispatchEvent(new PointerEvent('pointermove', { clientX: box.left + box.width * (.2 + .6 * ((i * 7) % 60) / 60), clientY: box.top + box.height * (.3 + .002 * i), bubbles: true })); }
		if (ts - t0 >= ms) {
			done = true;
			if (own) st.render = orig; else delete st.render;
			W.secs = (ts - t0) / 1000;
			if (g0 && st.gate) W.gate = { full: st.gate.full - g0.full, part: st.gate.part - g0.part, skip: st.gate.skip - g0.skip };
			W.fps = typeof st.frameRate === 'function' ? st.frameRate() : 0;
			W.step = window.O55 && O55.pipStage && O55.pipStage.drawStepPx;
			W.k = st.map ? st.map.k : null; W.dpr = window.devicePixelRatio;
			res(W); return;
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
});

// In the page: the head as painted against the head a full draw would paint, after every stepped frame of the stage's
// loop, for ms. Exported for tools/onb-step.selftest.mjs.
export const POSEWATCH = (ms) => new Promise((res) => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.ps || !st.gHead || typeof st.loop !== 'function') { res({ err: 'no stage with a head (#pm-o55-onboarding .o55-stage __pipStage, gHead)' }); return; }
	if ((typeof st.frameRate === 'function' && st.frameRate()) || st.reduced) { res({ skip: st.reduced ? 'a still stage (Reduced Motion)' : `Retro's own stepped draw (${st.frameRate()}/s)` }); return; }
	const PH = window.O55 && O55.pipStage && O55.pipStage.h, R = PH && PH.R;
	if (typeof R !== 'function') { res({ err: 'no O55.pipStage.h.R (the painter\'s rounding)' }); return; }
	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	const mat = (str) => { g.setAttribute('transform', str || ''); const c = g.transform.baseVal.consolidate(); return c ? c.matrix : new DOMMatrix(); };
	// render()'s head transform for the stage's state now (58-rig.js render: H, ang, the breath, the clamps)
	const reference = () => {
		const ps = st.ps, Lay = st.L, F = st.fam || {};
		let H = st.headAt(ps.C.x, ps.C.y, ps.th, ps.dy), ang = ps.th * .9 + ps.tilt;
		if (F.bob && !st.reduced) { H = [H[0], H[1] + Math.sin(st.t * 1.35) * F.bob * Lay.s / 2.6]; ang += Math.sin(st.t * .9) * .025; }
		const headH = 28 * Lay.s; if (H[1] + headH > Lay.ground - 2) H = [H[0], Lay.ground - 2 - headH];
		const reach = typeof st.pipReach === 'function' ? st.pipReach(ang) : null; if (reach && st.vis && H[1] + reach[3] > st.vis.y1) H = [H[0], st.vis.y1 - reach[3]];
		const br = st.reduced || !(PH.part && PH.part('idle-life')) ? 0 : (F.breathe || 0) * Math.sin(st.t * (st.sleepZ ? 1.5 : 2.2));
		const sx = ps.sx * (1 - br * .4), sy = ps.sy * (1 + br), s = Lay.s;
		return `translate(${R(H[0])} ${R(H[1])}) rotate(${R(ang * 57.3)}) scale(${s}) translate(-32 -31.5) translate(32 59.5) scale(${R(sx)} ${R(sy)}) translate(-32 -59.5)`;
	};
	const bb = st.pipBB && st.pipBB.h ? st.pipBB.h : [8, 29, 48, 31];
	const corners = [[bb[0], bb[1]], [bb[0] + bb[2], bb[1]], [bb[0], bb[1] + bb[3]], [bb[0] + bb[2], bb[1] + bb[3]]];
	const W = { frames: 0, gaps: [], maxPx: 0, k: st.map ? st.map.k : null, dpr: window.devicePixelRatio || 1, worst: null };
	const own = Object.prototype.hasOwnProperty.call(st, 'loop'), orig = st.loop;
	let lastT = st.t, t0 = performance.now(), done = false;
	const finish = () => { if (done) return; done = true; if (own) st.loop = orig; else delete st.loop; W.secs = (performance.now() - t0) / 1000; res(W); };
	st.loop = function () {
		const out = orig.apply(this, arguments);
		if (!done && st.t !== lastT) {
			lastT = st.t;
			const written = st.gHead.getAttribute('transform'), ref = reference(), a = mat(written), b = mat(ref);
			let gap = 0;
			for (const [x, y] of corners) { const p = new DOMPoint(x, y), u = p.matrixTransform(a), v = p.matrixTransform(b); gap = Math.max(gap, Math.hypot(u.x - v.x, u.y - v.y)); }
			const px = gap * (st.map ? st.map.k : 1) * W.dpr;
			W.frames++; W.gaps.push(Math.round(px * 1000) / 1000);
			if (px > W.maxPx) { W.maxPx = px; W.worst = { t: Math.round(st.t * 1000) / 1000, written, ref }; }
		}
		if (performance.now() - t0 >= ms) finish();
		return out;
	};
	setTimeout(finish, ms + 2000);
});

// a pose reading against the rule (at most poseMax device px stale for at most poseRun frames in a row): { ok, why }
export function poseVerdict(r, o = {}) {
	const max = o.poseMax ?? .25, run = o.poseRun ?? 2;
	if (!r || r.err) return { ok: false, why: `no reading (${r && r.err || 'none'}): could not judge` };
	if (r.skip) return { ok: true, skip: true, why: `${r.skip}: logged, not judged` };
	if (!(r.frames > 30)) return { ok: false, why: `${r ? r.frames : 0} stepped frames read: could not judge` };
	let longest = 0, cur = 0, over = 0;
	for (const g of r.gaps) { if (g > max) { cur++; over++; longest = Math.max(longest, cur); } else cur = 0; }
	const sorted = r.gaps.slice().sort((a, b) => a - b), p99 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .99))];
	const ok = longest <= run;
	return { ok, longest, why: `the painted head at most ${r.maxPx.toFixed(2)} device px from a full draw (p99 ${p99.toFixed(2)}); ${over} of ${r.frames} frames over ${max} px, the longest run ${longest} frames (want at most ${run})${ok ? '' : `: a pose drawn late (worst at t ${r.worst && r.worst.t}: written ${r.worst && r.worst.written} | full draw ${r.worst && r.worst.ref})`}` };
}

// a rest reading against the rule: { ok, why }
export function restStepVerdict(r, o = {}) {
	const max = o.restMax ?? 60, share = o.restShare ?? .5;
	if (!r || r.err || !(r.secs > .5) || !(r.frames > 10)) return { ok: false, why: `no reading (${r && r.err || 'too short'}): could not judge` };
	const fullPs = r.full / r.secs, of = r.full / r.frames;
	if (r.fps) {
		const lim = r.fps * 1.2 + 1;
		return { ok: fullPs <= lim, why: `Retro at its own rate: ${fullPs.toFixed(1)} draws/s, want at most ${lim.toFixed(0)} (${r.fps}/s)` };
	}
	if (r.frames / r.secs < 90) return { ok: null, slow: true, share: of, why: `${fullPs.toFixed(1)} full draws/s over ${(r.frames / r.secs).toFixed(1)} frames/s (${(of * 100).toFixed(0)} % of frames): a display under 90 Hz, judged on the look's mean share` };
	const ok = fullPs <= max && of <= share;
	return { ok, why: `${fullPs.toFixed(1)} full draws/s over ${(r.frames / r.secs).toFixed(1)} frames/s (${(of * 100).toFixed(0)} % of frames; want at most ${max}/s and ${(share * 100).toFixed(0)} %)${ok ? '' : ': the stage draws in every frame at rest'}` };
}

// a look's cells on a display under 90 Hz: their mean share of frames drawn in full, at most slowShare
export function slowLookVerdict(shares, o = {}) {
	const lim = o.slowShare ?? .85;
	if (!shares.length) return { ok: false, why: 'no cell read: could not judge' };
	const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
	return { ok: mean <= lim, why: `mean ${(mean * 100).toFixed(0)} % of frames drawn in full over ${shares.length} cells (want at most ${(lim * 100).toFixed(0)} %)${mean <= lim ? '' : ': the stage draws in every frame at rest'}` };
}

// a motion window against the rule (a full draw in every frame, at most miss frames without): { ok, why }
export function motionVerdict(r, o = {}) {
	const miss = o.miss ?? 2;
	if (!r || r.err || !(r.frames > 5)) return { ok: false, why: `no reading (${r && r.err || 'too few frames'}): could not judge` };
	if (r.fps) return { ok: true, why: `Retro draws at its own rate (${r.fps}/s): ${r.full} draws over ${r.frames} frames, logged` };
	const lost = r.frames - r.full;
	return { ok: lost <= miss, why: `${r.full} full draws over ${r.frames} frames (${lost} frames without one; want at most ${miss})` };
}

const line = (r) => r && !r.err ? `${(r.frames / r.secs).toFixed(1)} frames/s, ${(r.full / r.secs).toFixed(1)} full draws/s, ${(r.part / r.secs).toFixed(1)} partial draws/s${r.gate ? `, skipped ${(r.gate.skip / r.secs).toFixed(1)}/s` : ' (no gate counters: a stage without the step gate)'}, step ${r.step ?? 'none'} px, map ${r.k == null ? '?' : r.k.toFixed(3)} px/unit, dpr ${r.dpr}` : String(r && r.err);

async function restWait(f, want, ms) {
	const end = Date.now() + ms; let v = null;
	for (;;) {
		const r = await f.evaluate(POSE).catch(() => null); v = restVerdict(r, want);
		if (v.ok || Date.now() >= end) return v;
		await new Promise((res) => setTimeout(res, 250));
	}
}

export default async function (t) {
	const lookArg = String(t.args.looks || 'all');
	const looks = lookArg === 'all' ? ALL : lookArg === 'dark' ? ALL.filter((l) => l.endsWith('-dark')) : lookArg.split(',').filter(Boolean);
	const screens = String(t.args.screens || 'welcome,where,ready').split(',').filter(Boolean);
	const poseMs = Number(t.args.poseMs || 6000);
	const ms = Number(t.args.ms || 3000), o = { poseMax: Number(t.args.poseMax ?? .25), poseRun: Number(t.args.poseRun ?? 2), restMax: Number(t.args.restMax ?? 60), restShare: Number(t.args.restShare ?? .5), slowShare: Number(t.args.slowShare ?? .85), miss: Number(t.args.miss ?? 2) };
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screens[0] + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, open ? screens[0] : 'no #pm-o55-onboarding .o55-win after 60 s: could not judge');
	if (!open) return;
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 20000));
	const journey = async () => {
		await t.page.waitForTimeout(1200);
		for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
		await t.page.mouse.move(W - 6, Math.round(H / 2));
	};
	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${look}: the look is applied in the window`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme') + ', NieR ' + document.documentElement.getAttribute('data-o55-nier')));
		if (!ok) continue;
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		let lastAwake = null; const slow = [];
		for (const screen of screens) {
			const at = await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, screen);
			if (at !== screen) { await t.check(`${look} ${screen}: the screen opened`, false, String(at)); continue; }
			const want = screen === 'welcome' ? 'asleep' : 'awake';
			/* Pip's idle life (a swing or wiggle every 7 to 13 s, drawn in every frame as a swing is: Glass's, damped least,
			   takes about 8 s to slow under 12 px/s) is held off from the screen's opening to the window's end, so the row
			   reads the drift alone; the swing window below judges swings */
			const holdLife = (on) => f.evaluate((h) => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; st.idleNext = h ? st.t + 600 : st.t + 7 + Math.random() * 6; }, on);
			await holdLife(true);
			if (want === 'awake') await journey();
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			const cell = `${look} ${screen}`;
			const pre = await restWait(f, want, 10000);
			t.log(`${cell}: before the window: ${pre.why}`);
			if (!pre.ok) { await t.check(`${cell}: Pip ${want} and at rest before the window`, false, `${pre.why}: could not judge`); continue; }
			const r = await f.evaluate(WATCH, ['rest', ms]);
			const pr = poseMs > 0 ? await f.evaluate(POSEWATCH, poseMs) : null;
			await holdLife(false);
			if (pr) {
				const pv = poseVerdict(pr, o);
				t.log(`${cell}: pose: ${pv.why}`);
				if (!pv.skip) await t.check(`${cell}: the painted head is never more than ${o.poseMax} px from a full draw for more than ${o.poseRun} frames`, pv.ok, pv.why);
			}
			t.log(`${cell}: at rest: ${line(r)}`);
			const v = restStepVerdict(r, o);
			if (v.slow) { slow.push(v.share); t.log(`${cell}: ${v.why}`); }
			else await t.check(`${cell}: at rest the stage draws in 0.1 px steps, not in every frame`, v.ok, v.why);
			if (want === 'awake') lastAwake = screen;
		}
		if (slow.length) { const v = slowLookVerdict(slow, o); await t.check(`${look}: at rest the stage draws in 0.1 px steps (a display under 90 Hz: the look's mean)`, v.ok, v.why); }
		if (String(t.args.motion ?? '1') === '0' || !lastAwake) continue;
		const blinks = await f.evaluate(() => !!document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.blinkEl);
		if (!blinks) t.log(`${look} ${lastAwake} blink: no blink on this face (NieR's visor): not judged`);
		for (const [kind, wms] of [['swing', 400], ['speech', 500], ['pointer', 500], ['blink', 160]].filter(([k]) => k !== 'blink' || blinks)) {
			await t.page.mouse.move(W - 6, Math.round(H / 2));
			const pre = await restWait(f, 'awake', 8000);
			if (!pre.ok) { await t.check(`${look} ${lastAwake} ${kind}: Pip at rest before the window`, false, `${pre.why}: could not judge`); continue; }
			const r = await f.evaluate(WATCH, [kind, wms]);
			t.log(`${look} ${lastAwake} ${kind}: ${line(r)}`);
			const v = motionVerdict(r, o);
			await t.check(`${look} ${lastAwake} ${kind}: the stage draws every frame while it moves`, v.ok, v.why);
			await t.page.waitForTimeout(kind === 'speech' ? 4000 : 2500);
		}
	}
}
