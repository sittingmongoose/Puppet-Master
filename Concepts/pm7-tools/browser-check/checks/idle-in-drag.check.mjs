// SW-17 (F3-3 remainder): no idle job runs inside a held drag. PLAN's performance rule: "no idle job runs inside a drag".
// Basic Dark at 1390: a Home panel divider held for 3 s right after boot, then the Usage page's edge held for 3 s right
// after a look change (both moments with idle work queued: Usage's warm build, its prewarm, the look covers' paint and
// warm, the hover census). requestIdleCallback and setTimeout are wrapped before the page loads, each request keeping
// its caller's stack; a callback counts as inside the drag when a drag class is on the body as it fires.
// Asserted: no idle callback from Usage's board (40-board.js: warm slices, late bodies, prewarm), the look covers
// (12-theme-transition.js) or the hover census (pm-hover-tags-js.js) fires inside a drag, nor any callback admitted by
// PM_BUSY.idle (11-motion-start.js), not even one that would only park itself; and once the drag ends the parked work
// runs (nothing waits forever). Usage's own drag bookkeeping (opSync) is the drag itself and is only listed.
//   browser-check run Concepts/pm7-tools/browser-check/checks/idle-in-drag.check.mjs --set page=<build> [--set sandbox=1]

const HOLD_MS = 3000;

// installed before the page's own scripts, in every frame (the sandbox's too)
const RECORDER = () => {
	if (window.__pmIdleRec) return;
	const R = window.__pmIdleRec = { fired: [] };
	const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
	const inDrag = () => { const b = document.body; return !!b && DRAG.some((c) => b.classList.contains(c)); };
	const ric = window.requestIdleCallback, st = window.setTimeout;
	const stackOf = () => { const n = Error.stackTraceLimit; Error.stackTraceLimit = 14; const s = new Error().stack || ''; Error.stackTraceLimit = n; return s; };
	const note = (kind, stack, t0, drag) => { if (drag || R.fired.length < 20000) R.fired.push({ kind, stack, at: t0, ms: performance.now() - t0, drag }); };
	if (ric) window.requestIdleCallback = function (fn, o) {
		const stack = stackOf();
		return ric.call(window, function (dl) { const t0 = performance.now(), drag = inDrag(); try { return fn(dl); } finally { note('idle', stack, t0, drag); } }, o);
	};
	window.setTimeout = function (fn, ms, ...a) {
		if (typeof fn !== 'function') return st.call(window, fn, ms, ...a);
		const stack = stackOf();
		return st.call(window, function () { const t0 = performance.now(), drag = inDrag(); try { return fn.apply(this, a); } finally { if (drag) note('timeout', stack, t0, drag); } }, ms);
	};
};

// whose request a stack is, by its function names (the built page keeps them)
const OWNERS = [
	['Usage board (40-board.js)', /\bat (?:buildSliced|lateNext|prewarmSoon|prewarm|idleStill)\b|\bat next\b[^]*\bat slice\b/],
	['look covers (12-theme-transition.js)', /\bat (?:whenIdle|paintSoon)\b/],
	['hover census (pm-hover-tags-js.js)', /\bat (?:censusSchedule|censusFrame)\b/],
	['PM_BUSY.idle (11-motion-start.js)', /\bat (?:idleWhenStill|job\.ask|Object\.idleWhenStill|window\.PM_BUSY\.idle)\b|PM_BUSY\.idle/]
];
const DRAG_ITSELF = /\bat (?:opSync|opFlags|setOpFlags)\b/;
const ownerOf = (stack) => { if (DRAG_ITSELF.test(stack)) return 'drag bookkeeping'; const o = OWNERS.find(([, re]) => re.test(stack)); return o ? o[0] : null; };
const top = (stack) => stack.split('\n').slice(2, 5).map((l) => l.trim().replace(/^at /, '').replace(/\s*\(.*$/, '')).join(' < ');

async function holdDrag(t, f, sel, label) {
	const box = await f.evaluate((s) => {
		const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none'; };
		const e = s.split('|').map((q) => [...document.querySelectorAll(q)].find(vis)).find(Boolean);
		if (!e) return null;
		const r = e.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, id: e.id || e.className };
	}, sel);
	if (!(await t.check(`${label}: a divider to hold`, !!box, sel))) return null;
	const axisX = box.h >= box.w;   // a tall bar moves sideways
	const at = (d) => (axisX ? [box.x + d, box.y] : [box.x, box.y + d]);
	await f.evaluate(() => { window.__pmIdleRec.fired = []; });
	await t.page.mouse.move(...at(0)); await t.page.waitForTimeout(120);
	await t.page.mouse.down();
	for (let i = 1; i <= 8; i++) { await t.page.mouse.move(...at(-i * 4)); await t.page.waitForTimeout(16); }
	const began = await f.evaluate(() => performance.now());
	const dragOn = await f.evaluate(() => !!(window.PM_BUSY && PM_BUSY.drag && PM_BUSY.drag()) || document.body.classList.contains('pm-resizing'));
	await t.check(`${label}: the drag class is on while held`, dragOn, 'body classes ' + (await f.evaluate(() => document.body.className)));
	// held: the hand rests on the bar, with the small moves a held hand makes
	for (let k = 0; k < HOLD_MS / 100; k++) { await t.page.mouse.move(...at(-32 + (k % 2 ? 1 : -1))); await t.page.waitForTimeout(100); }
	const ended = await f.evaluate(() => performance.now());
	await t.page.mouse.up();
	return { began, ended };
}

async function judge(t, f, label, win) {
	const rec = await f.evaluate(([a, b]) => window.__pmIdleRec.fired.filter((c) => c.at >= a && c.at <= b + 50), [win.began, win.ended]);
	const inside = rec.filter((c) => c.drag);
	const byOwner = {};
	for (const c of inside) { const o = ownerOf(c.stack) || 'other'; (byOwner[o] = byOwner[o] || []).push(c); }
	const listed = Object.entries(byOwner).map(([o, cs]) => `${o}: ${cs.filter((c) => c.kind === 'idle').length} idle, ${cs.filter((c) => c.kind === 'timeout').length} timer, ${cs.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms (${[...new Set(cs.map((c) => top(c.stack)))].slice(0, 3).join(' | ')})`).join('; ');
	t.log(`${label}: ${inside.length} callbacks inside the ${Math.round(win.ended - win.began)} ms hold. ${listed || 'none'}`);
	for (const [o] of OWNERS) {
		const idle = (byOwner[o] || []).filter((c) => c.kind === 'idle');
		await t.check(`${label}: no idle callback from ${o} inside the drag`, idle.length === 0, idle.length ? `${idle.length} callbacks, ${idle.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms; first requested at ${top(idle[0].stack)}` : '0');
	}
	// a timer from those callers may fire in a drag (a delay that ends there), but it starts nothing there
	const timers = OWNERS.flatMap(([o]) => (byOwner[o] || []).filter((c) => c.kind === 'timeout' && c.ms > 2));
	await t.check(`${label}: no timer of those callers does work inside the drag`, timers.length === 0, timers.map((c) => `${c.ms.toFixed(1)} ms at ${top(c.stack)}`).join('; ') || '0');
}

export const tests = {
	async 'idle work waits out a held drag (SW-17)'(t) {
		await t.page.addInitScript(RECORDER);
		await t.viewport(1390, 900);
		const f = await t.app.open({ settleMs: 200 });
		await t.app.resetLayout();
		await t.check('recorder installed in the app frame', await f.evaluate(() => !!window.__pmIdleRec), '');
		await t.app.look('basic-dark');
		// Home, right after boot and a look change: a panel divider (row, else column)
		await f.evaluate(() => { const b = document.querySelector('.page-tab[data-page="home"]:not(.active)'); if (b) b.click(); });
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		const home = await holdDrag(t, f, '.pmw-divider[data-dir="row"]|.pmw-divider[data-dir="col"]', 'Home');
		if (home) await judge(t, f, 'Home', home);
		// Usage, right after a look change and back (the covers repaint, the board's prewarm and hold start a fresh round)
		await f.evaluate(() => { const b = document.querySelector('.page-tab[data-page="usage"]'); if (b) b.click(); else PM_PAGES.go('usage'); });
		await t.until('Usage shown', () => !!document.querySelector('.page-tab[data-page="usage"].active') || !!(window.PM_PAGES && PM_PAGES.current === 'usage'), null, { timeout: 15000 });
		await t.page.waitForTimeout(1500);
		await t.app.look('basic-light');
		await t.app.look('basic-dark');
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		const usage = await holdDrag(t, f, '#leftPanelResizer|#chatResizer', 'Usage');
		if (usage) {
			await judge(t, f, 'Usage', usage);
			// after the release the parked work goes on: some idle work of those callers runs within 6 s
			const after = await f.evaluate(() => performance.now());
			await t.page.waitForTimeout(6000);
			const ran = await f.evaluate((a) => window.__pmIdleRec.fired.filter((c) => c.at > a && c.kind === 'idle' && !c.drag).map((c) => c.stack), after);
			const ours = ran.filter((s) => OWNERS.some(([, re]) => re.test(s)));
			await t.check('after the release, parked idle work runs again', ours.length > 0, `${ours.length} of ${ran.length} idle callbacks in 6 s are those callers'`);
		}
	}
};
