// Pip's onboarding stage runs one loop a frame on every path that starts it (FO-252; R150 row L3; Jared, 2026-11-28:
// fixed before the PMConcept7 freeze; share puppet-master/2026-11-11-pm7-performance/swarm/FO252.md).
//
// Stage.loop (js/58-rig.js) is one requestAnimationFrame chain: it clears this.raf, then asks for the next frame. A
// build (first mount, a look switch) looks again at the window 0.9 s later (remeasureAt), and that measure() kicks.
// Before FO-252 the kick ran while this frame's raf was already cleared and before the loop asked for the next one, so
// it started a second chain beside the first: loop() ran twice a frame (1.98 per frame on the VM, R150) until the next
// park (a screen change's hold), and the second call of each frame stepped the stage with a near-zero dt.
//
// Per path, once it has settled past the 0.9 s look (--set settle, default 2500 ms), for --set ms (default 3000) ms every
// call of the stage's loop is recorded with the frame time its requestAnimationFrame callback was given, against the
// page's own frames. Two calls with the same frame time are two chains. Judged:
//   loop     no frame with more than one loop call, and at most --set perFrame (default 1.02) calls a frame over the
//            window. A stage whose loop runs (anything but a still stage at rest) must have run in at least half the
//            frames, else the reading could not show a second chain: could not judge. A still stage (Reduced Motion,
//            low-resource) that has parked is judged on its calls alone (none is one chain).
// Paths, in order, on one page: the first mount (on Welcome); a live look switch on Welcome for each of --set looks
// (default basic-dark,glass-dark,nier-dark); a screen change to Where; a look switch on Where; a screen change back to
// Welcome; the tab hidden (another tab brought to the front) for 1.5 s and shown, at rest and straight after a look
// switch (before its 0.9 s look); Reduced Motion turned on (Settings' data-motion) and a look switch under it; Reduced Motion turned off.
// --set looks= --set ms= --set settle= --set perFrame=. One surface per run (--set sandbox=1 for the sandbox).
// Red on 90286cf58f (every path after a build: 2 calls in each frame); green with FO-252.
import { muteSound } from '../helpers/quiet-page.mjs';

// In the page: the stage's loop calls and the page's frames for ms. Exported for tools/onb-step.selftest.mjs.
export const LOOPWATCH = (ms) => new Promise((res) => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || typeof st.loop !== 'function') { res({ err: 'no stage (#pm-o55-onboarding .o55-stage with its __pipStage and loop)' }); return; }
	const own = Object.prototype.hasOwnProperty.call(st, 'loop'), orig = st.loop;
	const per = new Map(), W = { calls: 0, frames: 0, dup: 0, maxPer: 0, still: typeof st.still === 'function' ? !!st.still() : !!st.reduced, live: typeof st.live === 'function' ? !!st.live() : null };
	let t0 = 0, done = false;
	/* (each requestAnimationFrame callback of one frame is given the same frame time: the stage's loop is asked for with
	   requestAnimationFrame(this.loop), which reads this.loop when it asks, so after the first frame every chain calls this) */
	st.loop = function (ts) {
		if (!done && t0 && ts >= t0) { W.calls++; const n = (per.get(ts) || 0) + 1; per.set(ts, n); if (n === 2) W.dup++; if (n > W.maxPer) W.maxPer = n; }
		return orig.apply(this, arguments);
	};
	const tick = (ts) => {
		if (done) return;
		if (!t0) t0 = ts + 1; /* (the frame after this one: a chain asked for before the wrap is counted from its next frame) */
		else if (ts >= t0) W.frames++;
		if (t0 && ts - t0 >= ms) {
			done = true;
			if (own) st.loop = orig; else delete st.loop;
			W.secs = (ts - t0) / 1000; W.raf = !!st.raf; W.parked = st.root ? st.root.hasAttribute('data-paused') : null;
			res(W); return;
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
});

// a path's reading against the rule (one loop call a frame): { ok, why }
export function loopVerdict(r, o = {}) {
	const lim = o.perFrame ?? 1.02;
	if (!r || r.err) return { ok: false, why: `no reading (${r && r.err || 'none'}): could not judge` };
	if (!(r.frames > 30)) return { ok: false, why: `${r.frames || 0} frames read: could not judge` };
	const of = r.calls / r.frames, head = `${r.calls} loop calls over ${r.frames} frames (${of.toFixed(2)} a frame), ${r.dup} frames with more than one (at most ${r.maxPer} in a frame)`;
	if (!r.still && of < .5) return { ok: false, why: `${head}: the loop ran in under half the frames of a moving stage, so a second chain could not show: could not judge` };
	const ok = r.dup === 0 && r.maxPer <= 1 && of <= lim;
	return { ok, why: `${head}; want one a frame (at most ${lim})${r.still ? ' (a still stage: its calls alone)' : ''}${ok ? '' : ': a second requestAnimationFrame chain runs the stage loop twice a frame (FO-252)'}` };
}

const HOST = '#pm-o55-onboarding .o55-stage';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,nier-dark').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 3000), settle = Number(t.args.settle ?? 2500), o = { perFrame: Number(t.args.perFrame ?? 1.02) };
	await t.viewport(1920, 1080);
	await muteSound(t.page);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome&pm-warm=0' });
	const open = await f.waitForFunction((h) => !!document.querySelector(h)?.__pipStage?.gHead && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', HOST, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding stage is mounted', open, open ? 'welcome' : `no ${HOST} with a drawn Pip after 60 s: could not judge`);
	if (!open) return;
	const stageId = () => f.evaluate((h) => document.querySelector(h).__pipStage.id, HOST);
	const id0 = await stageId();
	const theme = () => f.evaluate(() => document.documentElement.getAttribute('data-theme') + (document.documentElement.getAttribute('data-o55-nier') === 'on' ? ' (NieR)' : ''));
	const apply = async (look) => {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		return f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
	};
	const go = (id) => f.evaluate((s) => { try { window.O55.ui.go(s, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, id);
	const judge = async (path) => {
		await t.page.waitForTimeout(settle);
		const r = await f.evaluate(LOOPWATCH, ms);
		const v = loopVerdict(r, o);
		t.log(`${path}: ${v.why}; stage ${r && r.still ? 'still' : 'moving'}, live ${r && r.live}, theme ${await theme()}`);
		await t.check(`${path}: the stage loop runs once a frame`, v.ok, v.why);
		return r;
	};
	let cur = null;
	await judge('first mount (Welcome)');
	for (const look of looks) {
		const ok = await apply(look);
		await t.check(`${look}: the look is applied on Welcome`, ok, await theme());
		if (!ok) continue;
		cur = look;
		await judge(`look switch on Welcome to ${look}`);
	}
	const other = (l) => looks.find((x) => x !== l) || (l === 'basic-dark' ? 'glass-dark' : 'basic-dark');
	let at = await go('where');
	await t.check('the screen changes to Where', at === 'where', String(at));
	if (at === 'where') {
		await judge('screen change to Where');
		const l = other(cur); if (await apply(l)) { cur = l; await judge(`look switch on Where to ${l}`); } else await t.check(`${l}: the look is applied on Where`, false, await theme());
	}
	at = await go('welcome');
	await t.check('the screen changes back to Welcome', at === 'welcome', String(at));
	if (at === 'welcome') await judge('screen change back to Welcome');
	/* the tab hidden and shown: at rest, and straight after a look switch, before the build's 0.9 s look, so the loop's first
	   frame back takes that look (a real hidden tab, another tab in front; where Chrome does not hide the page so within
	   300 ms, as in a headless browser, the document is made to read hidden and a visibilitychange is sent) */
	const page = t.window || t.page;
	const hidden = async (path, before) => {
		const second = await page.context().newPage();
		let how = 'another tab in front', parked = false, made = false;
		try {
			if (before) await before();
			const t0 = Date.now();
			await second.bringToFront();
			if (!await f.waitForFunction(() => document.hidden, null, { timeout: 300 }).then(() => true, () => false)) {
				how = 'the document made to read hidden (Chrome did not hide the page behind another tab within 300 ms)'; made = true;
				await f.evaluate(() => { const d = document; Object.defineProperty(d, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(d, 'visibilityState', { configurable: true, get: () => 'hidden' }); d.dispatchEvent(new Event('visibilitychange')); });
			}
			const hiddenAfter = Date.now() - t0;
			await t.page.waitForTimeout(1500);
			parked = await f.evaluate((h) => document.querySelector(h).hasAttribute('data-paused'), HOST);
			t.log(`${path}: ${how}, hidden ${hiddenAfter} ms after the ${before ? 'look switch' : 'start'}; the stage parked: ${parked}`);
			await t.check(`${path}: the tab hidden, the stage parks`, parked, `${how}; data-paused ${parked}`);
		} finally {
			await page.bringToFront();
			if (made) await f.evaluate(() => { const d = document; delete d.hidden; delete d.visibilityState; d.dispatchEvent(new Event('visibilitychange')); });
			await second.close().catch(() => {});
		}
		await judge(`${path}, shown again`);
	};
	await hidden('tab hidden 1.5 s at rest');
	{
		const l = other(cur), [fam, mode] = l.split('-');
		/* (the look is asked for and the tab hidden at once; whether it was applied is read once the tab shows again) */
		await hidden(`look switch to ${l}, tab hidden 1.5 s at once`, () => f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]));
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 5000 }).then(() => true, () => false);
		await t.check(`${l}: the look switch made before the tab was hidden is applied`, ok, await theme());
		if (ok) cur = l;
	}
	/* Reduced Motion (Settings' switch: data-motion on the root, which the stage follows live), a look switch under it,
	   then off again */
	{
		const was = await f.evaluate(() => { const r = document.documentElement, v = r.getAttribute('data-motion'); r.setAttribute('data-motion', 'reduced'); return v; });
		try {
			const reduced = await f.waitForFunction((h) => document.querySelector(h).__pipStage.reduced, HOST, { timeout: 3000 }).then(() => true, () => false);
			await t.check('Reduced Motion on: the stage follows it', reduced, String(reduced));
			await judge('Reduced Motion on');
			const l = other(cur); if (await apply(l)) { cur = l; await judge(`look switch to ${l} under Reduced Motion`); }
		} finally {
			await f.evaluate((v) => { const r = document.documentElement; if (v == null) r.removeAttribute('data-motion'); else r.setAttribute('data-motion', v); }, was);
		}
		await judge('Reduced Motion off again');
	}
	await t.check('one stage throughout (no remount hid a second chain)', (await stageId()) === id0, `${id0} -> ${await stageId()}`);
}
