// A look picked in the onboarding window plays its reveal smoothly (FO-188, pm7-perf lane T, 2026-11-14).
//
// Jared's QA, 2026-11-13: "When changing themes, there is a horrible stutter and lurching. It is so bad, it messes up
// the transitions and you miss a lot." A look picked in the window's look menu plays one View Transition, a circular
// reveal of 760 ms (Retro 520 ms, stepped) from the row pressed (60-ui-core.js applyLook). The app beneath the window
// took part in it: the chat redrew itself for the new look, Home, the terminal and the editor applied it after layout,
// and the colour transitions the new look started in the app restyled about 1,165 elements in every frame. Alexis's
// PC (RTX 3080) on f05274e219: inside the reveals 33 tasks over 50 ms (worst 327 ms) and frame gaps up to 1,161 ms.
//
// Each change here is a real press (down, 90 ms, up) on a row of the window's look menu, timed against the change's own
// View Transition (document.startViewTransition, wrapped in the page before the presses): the press's click, the
// theme's write (html's setAttribute, wrapped by the check), ready, the reveal's first frame (the first animation frame
// after the circle starts: after 'o55:reveal' where the page holds the circle until its frames flow, else after ready)
// and finished. Per change that takes the transition:
//   held     the app beneath holds still until the reveal has ended, and its work for the look still runs after it:
//            a hook of the check added with PM56_HOST.onTheme (the chat's own theme hooks, app.js renderApp among them,
//            run in that list) and a callback of the check asked of PM_AFTER_LAYOUT at the theme's write (the queue Home,
//            the terminal, the editor and the rail use) each run after `finished`, and within 3 s of it. On
//            f05274e219 both ran before the reveal's first frame;
//   tasks    no long task (PerformanceObserver 'longtask', over --set task=50 ms) overlaps the reveal, from its first
//            frame to finished;
//   gaps     no gap between animation frames over --set gap=34 ms in that span.
// Logged per change: click -> first frame, its parts (the click's own task, the time to ready), the reveal's length,
// its frames, its long tasks and its longest gap; NieR's own path (into or out of NieR, no View Transition) is logged,
// not judged. Then one change each under the system's Reduced Motion, the app's own Reduce motion (html[data-motion]) and
// low-resource mode: no View Transition starts, the theme is written in the click's own task, and the chat's hooks and
// the after-layout callback run at once, as before (the hold is the reveal's only).
//
// --set seq=<a,b,...>   the picks, families and modes (default friendly,retro,glass,nier,basic,light,glass,dark,friendly,basic:
//                       all five looks and both modes, as lead tool lookchange.check.mjs made them)
// --set task=<ms>, --set gap=<ms>   the bars (defaults 50, 34)
// Both surfaces (--set sandbox=0 and 1). About 70 s a surface.
const SEQ = ['friendly', 'retro', 'glass', 'nier', 'basic', 'light', 'glass', 'dark', 'friendly', 'basic'];

// in the page, once: the probes
const ARM = () => {
	if (window.__plc) return true;
	const S = window.__plc = { on: false, ts: [], lt: [], click: 0, write: 0, vt: null, hook: [], after: [], askAfter: false };
	const tick = (now) => { if (S.on) S.ts.push(now); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) S.lt.push([e.startTime, e.duration]); }).observe({ entryTypes: ['longtask'] }); } catch (_) { /* none */ }
	document.addEventListener('click', (e) => { if (S.on && !S.click) S.click = e.timeStamp; }, true);
	// the theme's write, timed where it is written (an observer of the check's own runs after the page's, the chat's
	// redraw among them); the after-layout callback is asked from an observer, as the app's own observers ask theirs
	const html = document.documentElement, setAttr = html.setAttribute;
	html.setAttribute = function (n, v) { if (n === 'data-theme' && S.on && !S.write) S.write = performance.now(); return setAttr.call(this, n, v); };
	new MutationObserver(() => {
		if (!S.on || S.askAfter) return;
		if (typeof window.PM_AFTER_LAYOUT === 'function') { S.askAfter = true; window.PM_AFTER_LAYOUT(() => { S.after.push(performance.now()); }); }
	}).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
	if (window.PM56_HOST && window.PM56_HOST.onTheme) window.PM56_HOST.onTheme(() => { if (S.on) S.hook.push(performance.now()); });
	const svt = document.startViewTransition && document.startViewTransition.bind(document);
	if (svt) document.startViewTransition = function (cb) {
		const vt = svt(cb), rec = { start: performance.now(), ready: 0, readyFirst: 0, play: 0, first: 0, end: 0 };
		if (S.on && !S.vt) S.vt = rec;
		vt.ready.then(() => { rec.ready = performance.now(); requestAnimationFrame((ts) => { rec.readyFirst = ts; }); }).catch(() => { rec.skipped = true; });
		vt.finished.finally(() => { rec.end = performance.now(); });
		return vt;
	};
	// the circle's real start: a page that holds the circle until its frames flow (FO-188 (c)) says when it plays it
	window.addEventListener('o55:reveal', () => { const v = S.vt; if (S.on && v && !v.play) { v.play = performance.now(); requestAnimationFrame((ts) => { v.first = ts; }); } });
	return !!(window.PM56_HOST && window.PM56_HOST.onTheme);
};
const START = () => { const S = window.__plc; Object.assign(S, { ts: [], lt: [], click: 0, write: 0, vt: null, hook: [], after: [], askAfter: false, on: true }); };
const READ = () => {
	const S = window.__plc, c = S.click || S.ts[0] || 0, v = S.vt;
	if (v && !v.first) v.first = v.readyFirst;   // no 'o55:reveal': the circle started at ready
	const a = v && v.first ? v.first : c, z = v && v.end ? v.end : c + 2500;
	const ts = S.ts.filter((x) => x >= a - 0.5 && x <= z + 0.5), d = ts.slice(1).map((x, i) => x - ts[i]);
	const rel = (e) => [Math.round(e[0] - c), Math.round(e[1])];
	const inWin = S.lt.filter((e) => e[0] < z && e[0] + e[1] > a);
	S.on = false;
	return {
		vt: v ? { start: Math.round(v.start - c), ready: Math.round(v.ready - c), play: v.play ? Math.round(v.play - c) : null, first: v.first ? Math.round(v.first - c) : null, end: v.end ? Math.round(v.end - c) : null, skipped: !!v.skipped } : null,
		write: S.write ? Math.round(S.write - c) : null,
		hook: S.hook.map((x) => Math.round(x - c)), after: S.after.map((x) => Math.round(x - c)), askAfter: S.askAfter,
		frames: d.length, maxGap: Math.round(Math.max(0, ...d)), gaps: d.map((g, i) => [Math.round(ts[i] - c), Math.round(g)]),
		ltIn: inWin.map(rel), ltAll: S.lt.filter((e) => e[0] + e[1] >= c - 50).map(rel),
		theme: document.documentElement.getAttribute('data-theme')
	};
};

async function surface(t, sandbox) {
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox });
	await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.svg); }, null, { timeout: 60000 });
	await f.waitForTimeout(5000);
	const hooked = await f.evaluate(ARM);
	const tag = sandbox ? 'sandbox' : 'normal';
	await t.check(`${tag}: the chat's theme hooks can be heard (PM56_HOST.onTheme)`, hooked);
	const btn = f.locator('#pm-o55-onboarding .o55-lookslot .o55-lookbtn');
	const quiet = () => f.waitForFunction(() => !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy())
		&& !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !window.O55.S.vt, null, { timeout: 30000 }).catch(() => {});
	const press = async (loc) => {
		const b = await loc.boundingBox(); if (!b) throw new Error('no box to press');
		await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await t.page.waitForTimeout(120);
		await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
	};
	const menuOpen = async () => { if (!(await f.locator('#pm-o55-onboarding .o55-lookmenu').count())) { await quiet(); await press(btn); await f.waitForSelector('#pm-o55-onboarding .o55-lookmenu', { timeout: 5000 }); await f.waitForTimeout(400); } };
	const pick = async (arg) => {
		const mode = arg === 'light' || arg === 'dark';
		const th = await f.evaluate(() => window.O55.theme());
		if ((!mode && th.chosen === arg) || (mode && th.mode === arg)) return null;
		await menuOpen();
		const row = f.locator(`#pm-o55-onboarding .o55-lookmenu [data-o55-do="${mode ? 'lookMode' : 'lookFamily'}"][data-arg="${arg}"]`);
		await quiet(); await f.waitForTimeout(300);
		await f.evaluate(START);
		await press(row);
		await f.waitForTimeout(250); await quiet();
		await f.waitForTimeout(3200);   // the held work's 3 s after the reveal
		return { arg, from: th.chosen + '-' + th.mode, ...(await f.evaluate(READ)) };
	};
	const seq = t.args.seq ? String(t.args.seq).split(',') : SEQ;
	const TASK = +(t.args.task || 50), GAP = +(t.args.gap || 34);
	const rows = [];
	for (const arg of seq) { const r = await pick(arg); if (r) { rows.push(r); await f.waitForTimeout(800); } }
	for (const r of rows) {
		const name = `${tag}: ${r.from} -> ${r.arg}`;
		const v = r.vt;
		t.log(`${name}: ${v ? `click->first ${v.first} ms (click task ${(r.ltAll.find((e) => e[0] <= 20) || [0, 0])[1]} ms, ready at ${v.ready}, circle played at ${v.play == null ? 'ready' : v.play}), reveal ${v.end - v.first} ms, ${r.frames} frames, longest gap ${r.maxGap} ms, long tasks in it ${JSON.stringify(r.ltIn)}` : 'no View Transition (NieR\'s own path)'}; theme written at ${r.write}, chat hook at ${JSON.stringify(r.hook)}, after-layout at ${JSON.stringify(r.after)}; all long tasks ${JSON.stringify(r.ltAll.slice(0, 10))}`);
		if (!v) continue;
		if (!v.first || !v.end) { await t.check(`${name}: the reveal played (ready, first frame, finished)`, false, JSON.stringify(v)); continue; }
		const hookOk = r.hook.length > 0 && r.hook.every((x) => x >= v.end) && r.hook[0] <= v.end + 3000;
		await t.check(`${name}: held: the chat's theme hooks run after the reveal, not during it`, hookOk, `reveal ends ${v.end} ms; hooks at ${JSON.stringify(r.hook)}`);
		const afterOk = r.askAfter && r.after.length > 0 && r.after.every((x) => x >= v.end) && r.after[0] <= v.end + 3000;
		await t.check(`${name}: held: an after-layout callback asked at the theme's write runs after the reveal`, afterOk, `theme written ${r.write} ms, reveal ends ${v.end} ms; ran at ${JSON.stringify(r.after)}`);
		const over = r.ltIn.filter((e) => e[1] > TASK);
		await t.check(`${name}: no task over ${TASK} ms in the reveal`, over.length === 0, `reveal ${v.first}-${v.end} ms; long tasks ${JSON.stringify(r.ltIn)}`);
		const gaps = r.gaps.filter((g) => g[1] > GAP);
		await t.check(`${name}: no frame gap over ${GAP} ms in the reveal`, gaps.length === 0, `${gaps.length} of ${r.frames}: ${JSON.stringify(gaps.slice(0, 8))}`);
	}
	await t.check(`${tag}: at least six changes took the View Transition`, rows.filter((r) => r.vt).length >= 6, `${rows.filter((r) => r.vt).length} of ${rows.length}`);
	// Reduced Motion (the system's, and the app's own switch, html[data-motion="reduced"]) and low-resource mode: unchanged
	// (no reveal, no hold): each a change of its own
	const instant = async (label, on, off) => {
		await on(); await f.waitForTimeout(600);
		const rm = await pick((await f.evaluate(() => window.O55.theme().chosen)) === 'retro' ? 'friendly' : 'retro');
		await off(); await f.waitForTimeout(600);
		if (!rm) return;
		t.log(`${tag}: ${label} ${rm.from} -> ${rm.arg}: view transition ${JSON.stringify(rm.vt)}, written ${rm.write} ms, hooks ${JSON.stringify(rm.hook)}, after-layout ${JSON.stringify(rm.after)}`);
		await t.check(`${tag}: ${label}: no View Transition, the theme written at the click`, !rm.vt && rm.write != null && rm.write < 1000, `vt ${JSON.stringify(rm.vt)}, written ${rm.write} ms`);
		await t.check(`${tag}: ${label}: the chat's hooks and the after-layout callback run at once`, rm.hook.length > 0 && rm.hook[0] - rm.write < 1000 && rm.after.length > 0 && rm.after[0] - rm.write < 1000, `written ${rm.write}, hooks ${JSON.stringify(rm.hook)}, after-layout ${JSON.stringify(rm.after)}`);
	};
	await instant('Reduced Motion', () => t.emulate({ reducedMotion: 'reduce' }), () => t.emulate({ reducedMotion: 'no-preference' }));
	await instant('in-app Reduce motion', () => f.evaluate(() => { const h = document.documentElement; h.__plcMotion = h.getAttribute('data-motion'); h.setAttribute('data-motion', 'reduced'); }),
		() => f.evaluate(() => { const h = document.documentElement, was = h.__plcMotion; if (was == null) h.removeAttribute('data-motion'); else h.setAttribute('data-motion', was); }));
	await instant('low-resource mode', () => f.evaluate(() => window.O55.motion.setLowResource(true, 'scenario')), () => f.evaluate(() => window.O55.motion.setLowResource(false, null)));
	await t.emulate({ reducedMotion: 'no-preference' });
}

export default async function (t) {
	for (const s of t.app.surfaces()) await surface(t, s === 'sandbox');
}
