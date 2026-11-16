// Pip's speech bubble at rest: placed without laying the page out, and written only when it changes (pm7-perf lane W,
// step 2 of the stage's rest plan, share puppet-master/2026-11-11-pm7-performance/followups/W2-onboarding-rest.md).
//
// At rest the stage draws every frame and places the bubble beside Pip in each draw (placeBubble, js/58-rig.js). On
// stream F's head 611565a312 it read the bubble's size (offsetWidth/offsetHeight) in every draw, after the frame's
// writes to the stage, so the page was laid out inside the frame's script: one forced layout per drawn frame in every
// look but NieR (NieR's box does not move; its own read is lane W's step 4, perf-onb-rest). It also wrote the bubble's
// data-side with the value it already had in every draw.
//
// Per look and screen, at rest (the window open, a pointer journey that wakes Pip, then no input; Pip's line typed and
// its props settled), a DevTools trace of --set ms (default 3000) ms, then an observer of the check's own on the bubble
// with the stage's render() counted:
//   layouts  at most --set forced (default 0.1) forced layouts per drawn frame (a Layout inside a script task), every
//            look but NieR;
//   same     no attribute that placeBubble writes (data-side, style) written with the value it already held (--set same,
//            default 0 a second); placeTip's class write is logged (fixed on lane W's other branch);
// Logged: main ms/s, layouts/s, forced layouts and style recalcs/s, the stage's draws/s, the bubble's writes/s by name.
// --set looks= (default all ten; `dark` the five Dark looks) --set screens= (default where,ready) --set settle=
// --set viewSettle= --set ms= --set forced= --set same=. Both surfaces. About 5 minutes.
import { traceEvents, summarise } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

const ALL = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCRIPT = new Set(['FireAnimationFrame', 'FunctionCall', 'TimerFire', 'EventDispatch', 'RunMicrotasks', 'FireIdleCallback', 'v8.callFunction', 'V8.Execute']);

// Layouts and style recalcs run inside a script task (forced by a read after a write), on the page's main thread
/* (the page's renderer main thread: as summarise names it, or, with a frame-trace helper that does not, the renderer main
   thread that ran the most animation-frame callbacks: an older helper on this branch's base left it unnamed, and every
   forced layout read 0, NieR's two layouts a frame included) */
function mainThread(events, renderer) {
	if (renderer) return renderer;
	const names = new Map(), runs = new Map();
	for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') names.set(e.pid + ':' + e.tid, e.args && e.args.name);
	for (const e of events) { if (e.name !== 'FireAnimationFrame') continue; const k = e.pid + ':' + e.tid; if (names.get(k) === 'CrRendererMain') runs.set(k, (runs.get(k) || 0) + 1); }
	const best = [...runs].sort((a, b) => b[1] - a[1])[0];
	return best ? { pid: Number(best[0].split(':')[0]), tid: Number(best[0].split(':')[1]) } : null;
}

function forcedWork(events, renderer0) {
	const renderer = mainThread(events, renderer0);
	if (!renderer) return { layouts: 0, styles: 0, none: true };
	const evs = [], open = [];
	for (const e of events) {
		if (e.pid !== renderer.pid || e.tid !== renderer.tid || typeof e.name !== 'string') continue;
		if (e.ph === 'X') { const d = e.args && (e.args.data || e.args.beginData) || {}; evs.push({ name: e.name, ts: e.ts, end: e.ts + (e.dur || 0), fn: e.name === 'FunctionCall' ? `${d.functionName || '(anonymous)'}@${d.lineNumber ?? '?'}:${d.columnNumber ?? '?'}` : null, stack: e.name === 'Layout' ? (d.stackTrace || null) : null }); }
		else if (e.ph === 'B') open.push(e);
		else if (e.ph === 'E') { const b = open.pop(); if (b) evs.push({ name: b.name, ts: b.ts, end: e.ts }); }
	}
	evs.sort((a, b) => a.ts - b.ts || b.end - a.end);
	const stack = []; let layouts = 0, styles = 0; const where = new Map();
	for (const e of evs) {
		while (stack.length && stack[stack.length - 1].end <= e.ts) stack.pop();
		const inScript = stack.some((s) => SCRIPT.has(s.name));
		if (inScript && e.name === 'Layout') {
			layouts++;
			/* (named by the innermost script function around it, function@line:col of the built page, and its stack when the
			   trace carries one) */
			const fn = [...stack].reverse().find((s) => s.name === 'FunctionCall' && s.fn), st = e.stack && e.stack[0];
			const k = (fn ? fn.fn : '?') + (st ? ` [${st.functionName || '(anon)'}@${st.lineNumber}:${st.columnNumber}]` : '');
			where.set(k, (where.get(k) || 0) + 1);
		}
		if (inScript && e.name === 'UpdateLayoutTree') styles++;
		stack.push(e);
	}
	return { layouts, styles, where: [...where].sort((a, b) => b[1] - a[1]).slice(0, 5) };
}

// In the page: the bubble's writes (with the value they left) and the stage's draws
const ARM = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.bubble || typeof st.render !== 'function') return 'no stage (#pm-o55-onboarding .o55-stage with its __pipStage and bubble)';
	if (window.__onbb) { window.__onbb.mo.disconnect(); window.__onbb.unwrap(); }
	const W = window.__onbb = { st, recs: [], renders: 0, t0: performance.now() };
	W.mo = new MutationObserver((l) => { for (const r of l) if (r.type === 'attributes' && r.target === st.bubble) W.recs.push([r.attributeName, r.oldValue]); });
	W.mo.observe(st.bubble, { attributes: true, attributeOldValue: true });
	const own = Object.prototype.hasOwnProperty.call(st, 'render'), orig = st.render;
	st.render = function () { W.renders++; return orig.apply(this, arguments); };
	W.unwrap = () => { if (own) st.render = orig; else delete st.render; };
	return '';
};

const READ = () => {
	const W = window.__onbb; if (!W) return null;
	for (const r of W.mo.takeRecords()) if (r.type === 'attributes' && r.target === W.st.bubble) W.recs.push([r.attributeName, r.oldValue]);
	W.mo.disconnect(); W.unwrap(); delete window.__onbb;
	const secs = (performance.now() - W.t0) / 1000, b = W.st.bubble, writes = {}, same = {}, next = new Map();
	for (let i = W.recs.length - 1; i >= 0; i--) {
		const [a, old] = W.recs[i], after = next.has(a) ? next.get(a) : b.getAttribute(a);
		next.set(a, old); writes[a] = (writes[a] || 0) + 1; if (after === old) same[a] = (same[a] || 0) + 1;
	}
	return { secs, renders: W.renders, writes, same, on: b.classList.contains('on') };
};

const SETTLED = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st) return false;
	if (st.bubble && st.bubble.classList.contains('typing')) return false;
	for (const p of st.props.values()) if (p.state === 'out' || !p.settled) return false;
	return true;
};

export default async function (t) {
	const lookArg = String(t.args.looks || 'all');
	const looks = lookArg === 'all' ? ALL : lookArg === 'dark' ? ALL.filter((l) => l.endsWith('-dark')) : lookArg.split(',').filter(Boolean);
	const screens = String(t.args.screens || 'where,ready').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 3000), forcedMax = Number(t.args.forced ?? 0.1), sameMax = Number(t.args.same ?? 0);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const cdp = await t.page.context().newCDPSession(t.page);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screens[0] + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, open ? screens[0] : 'no #pm-o55-onboarding .o55-win after 60 s: could not judge');
	if (!open) return;
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 20000));
	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${look}: the look is applied in the window`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme') + ', NieR ' + document.documentElement.getAttribute('data-o55-nier')));
		if (!ok) continue;
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		for (const screen of screens) {
			const at = await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, screen);
			if (at !== screen) { await t.check(`${look} ${screen}: the screen opened`, false, String(at)); continue; }
			// a real arrival wakes Pip (Welcome puts it to sleep until one), then the pointer rests off the window
			await t.page.waitForTimeout(1200);
			for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
			await t.page.mouse.move(W - 6, Math.round(H / 2));
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			const settled = await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).then(() => true, () => false);
			if (!settled) t.log(`${look} ${screen}: NOTE Pip's line or a prop had not settled; measured as it was`);
			const cell = `${look} ${screen}`;
			let x = null, fw = null, err = '';
			try { const ev = await traceEvents(cdp, { ms }); x = summarise(ev, { url: f.url() }); fw = forcedWork(ev, x.renderer); } catch (e) { err = String(e && e.message || e); }
			const armed = await f.evaluate(ARM);
			if (armed) { await t.check(`${cell}: the bubble could be watched`, false, armed + ': could not judge'); continue; }
			await t.page.waitForTimeout(ms);
			const r = await f.evaluate(READ);
			if (!r || !(r.secs > 1) || !(r.renders > 0)) { await t.check(`${cell}: the stage drew while watched`, false, 'no draws: could not judge'); continue; }
			const per = (n) => (n / r.secs).toFixed(1), list = (m) => Object.entries(m).map(([k, v]) => `${k} ${per(v)}`).join(', ') || 'none';
			const draws = r.renders / r.secs;
			if (x) t.log(`${cell}: main ${Math.round(x.cost.main)} ms/s, layouts ${x.layoutPerSec}/s, forced layouts ${(fw.layouts / x.secs).toFixed(1)}/s, forced style ${(fw.styles / x.secs).toFixed(1)}/s, main frames ${x.mainFrames.perSec}/s; the stage drew ${draws.toFixed(1)}/s; the bubble (${r.on ? 'shown' : 'not shown'}) written a second: ${list(r.writes)}; same value: ${list(r.same)}`);
			/* (judged: what placeBubble writes, its side and its style; its class is written by placeTip, whose same-value write
			   is lane W's other branch's to fix (perf/onb-stage-rest-20261115 ab0516bfda), so it is logged here) */
			const sameN = ['data-side', 'style'].reduce((a, k) => a + (r.same[k] || 0), 0) / r.secs;
			await t.check(`${cell}: placeBubble writes no attribute of the bubble with the value it already held (data-side, style; at most ${sameMax} a second)`, sameN <= sameMax, `${sameN.toFixed(1)} a second (all same-value writes: ${list(r.same)})`);
			if (fam === 'nier') continue;
			if (!x) { await t.check(`${cell}: forced layouts could be read`, false, `trace failed: ${err}: could not judge`); continue; }
			if (fw.none) { await t.check(`${cell}: the page's main thread was found in the trace`, false, 'no renderer main thread with animation-frame callbacks: could not judge'); continue; }
			const k = fw.layouts / x.secs / draws;
			if (fw.where && fw.where.length) t.log(`${cell}: forced layouts by function: ${fw.where.map(([w, n]) => `${w} ${(n / x.secs).toFixed(1)}/s`).join(' | ')}`);
			await t.check(`${cell}: at most ${forcedMax} forced layouts per drawn frame`, k <= forcedMax, `${(fw.layouts / x.secs).toFixed(1)} forced layouts/s at ${draws.toFixed(1)} draws/s (${k.toFixed(2)} a draw); all layouts ${x.layoutPerSec}/s`);
		}
	}
	await cdp.detach().catch(() => {});
}
