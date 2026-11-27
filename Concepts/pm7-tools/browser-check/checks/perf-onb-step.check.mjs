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
// Then per look, on the last awake screen of --set screens, windows where the stage must draw every frame (each at most
// --set miss (default 2) frames without a full draw, outside Retro, which draws at its own rate and is only logged):
//   swing    Pip set swinging as its idle swing does (ps.thv += 0.5), 400 ms;
//   speech   a new long line typing (say(..., now)), 500 ms;
//   pointer  a pointermove in every frame across the stage, 500 ms (user input);
//   blink    a blink started (ps.nextBlink = now), 150 ms.
// Logged per cell: frames a second, full and partial draws a second, skipped frames a second (the stage's own gate
// counters when it has them).
// --set looks= (default all ten; `dark` the five Dark looks) --set screens= (default welcome,where,ready)
// --set settle= (default 20000) --set viewSettle= (default 6000) --set ms= --set restMax= --set restShare= --set miss=
// --set motion=0 leaves out the every-frame windows. One surface per run (--set sandbox=1 for the sandbox).
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
	const ms = Number(t.args.ms || 3000), o = { restMax: Number(t.args.restMax ?? 60), restShare: Number(t.args.restShare ?? .5), slowShare: Number(t.args.slowShare ?? .85), miss: Number(t.args.miss ?? 2) };
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
			await holdLife(false);
			t.log(`${cell}: at rest: ${line(r)}`);
			const v = restStepVerdict(r, o);
			if (v.slow) { slow.push(v.share); t.log(`${cell}: ${v.why}`); }
			else await t.check(`${cell}: at rest the stage draws in 0.1 px steps, not in every frame`, v.ok, v.why);
			if (want === 'awake') lastAwake = screen;
		}
		if (slow.length) { const v = slowLookVerdict(slow, o); await t.check(`${look}: at rest the stage draws in 0.1 px steps (a display under 90 Hz: the look's mean)`, v.ok, v.why); }
		if (String(t.args.motion ?? '1') === '0' || !lastAwake) continue;
		for (const [kind, wms] of [['swing', 400], ['speech', 500], ['pointer', 500], ['blink', 150]]) {
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
