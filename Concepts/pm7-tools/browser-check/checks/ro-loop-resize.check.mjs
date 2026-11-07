// FO-94: 'ResizeObserver loop completed with undelivered notifications' over window resizes of the onboarding page.
// The route is the 45-resize walk FO88-N1 was measured on (opus-recheck-b7d Part 2): the page in a frame the check
// resizes as a window would be (normal) or in T3's sandbox iframe, onboarding open on c-ready, and in Basic Light, Retro
// Dark and NieR Light (--set looks=) the frame walked through 15 sizes either side of the onboarding's narrow (808 px)
// and short (568 px) boundaries, 1.2 s at each (--set dwell=). Browser-check's console capture never sees these errors
// (Chrome reports them as an ErrorEvent), so an init script counts them in the app's frame during the walks, and wraps
// ResizeObserver to name what was left undelivered each time: every observed target whose size differs from the size
// last delivered for it, with the function that made its observer (targets inside content the browser skips are named,
// not measured). Fails above --set limit, default 0. Every error on dd6580cd11 and 0adb197992 was glass.js's afterLayout
// probe (#lg-post) observed afresh from its mutation observer inside another observer's delivery, in a frame whose
// first round had not delivered the document root; glass.js now keeps the root observed. Normal surface: dd6580cd11
// 8-20, 0adb197992 0-16, fixed 0; T3's sandbox shows none on any of them.
// --set attribute=0 only counts (no box is read after an error). --set probe=1 also logs each error frame's
// deliveries, the observations started inside them and the callback that ran before each, and per frame whether the
// document root was delivered (the probe reads boxes around every callback, so it changes timing; diagnosis only).
//   browser-check run Concepts/pm7-tools/browser-check/checks/ro-loop-resize.check.mjs --set page=<build>
const LOOKS = ['basic-light', 'retro-dark', 'nier-light'];
const WALK = [[740, 768], [1920, 1080], [1280, 500], [1920, 1080], [860, 900], [806, 900], [810, 900], [1024, 768], [1280, 560], [1280, 570], [740, 500], [1280, 500], [740, 768], [1024, 768], [1920, 1080]];
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// Runs before any page script, in every frame.
function wrapResizeObserver() {
	const Native = window.ResizeObserver;
	if (!Native || window.__roLoop) return;
	const L = window.__roLoop = { on: false, probe: false, errors: [], observers: [], frame: [] };
	// The deliveries of the current frame, for --set probe=1: which observer ran, its entries' depths, and whether its
	// callback changed the hosted chat's column (read around the callback, so only in the probe).
	const tick = () => { L.frame = []; L.inLoop = []; requestAnimationFrame(tick); };
	// Observations started inside a frame's delivery loop (from a callback, or a microtask after one): a fresh one at
	// or above the depth already delivered is what the browser skips. Logged with the callback that ran before it.
	// ...and, per frame that delivered anything, whether the document root (depth 2) was among the targets delivered,
	// whether the title bar's fold ran in a delivery, and whether the frame ended in an error.
	L.frames = { rootErr: 0, rootOk: 0, noRootErr: 0, noRootOk: 0 };
	const done = new MessageChannel(); done.port1.onmessage = () => {
		L.looping = false;
		if (!L.on) return;
		const root = L.frame.some((r) => r.d[0] <= 2), err = !!L.frameErr;
		L.frames[(root ? 'root' : 'noRoot') + (err ? 'Err' : 'Ok')]++;
		const tally = L.frameWho || (L.frameWho = {});
		const key = root ? 'root by ' + L.frame.filter((r) => r.d[0] <= 2).map((r) => r.who.slice(0, 30)).join('+') : 'no root: ' + [...new Set(L.frame.map((r) => r.who.slice(0, 26)))].slice(0, 4).join(' | ');
		tally[key] = (tally[key] || 0) + 1;
		L.frameErr = false;
	};
	requestAnimationFrame(tick);
	const sizes = () => { const m = new Map(); for (const r of L.observers) for (const el of r.last.keys()) if (el.isConnected && !m.has(el) && (!el.checkVisibility || el.checkVisibility({ contentVisibilityAuto: true }))) { const c = el.getBoundingClientRect(); m.set(el, [Math.round(c.width), Math.round(c.height)]); } return m; };
	const depth = (n) => { let d = 0; for (; n; n = n.parentNode || n.host) d++; return d; };
	const name = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));
	const creator = (stack) => { const lines = String(stack || '').split('\n').slice(2).map((s) => s.trim()); const fn = lines.map((s) => (s.match(/^at (?:new )?([\w$.<>]+) \(/) || [])[1]).filter(Boolean); return fn.slice(0, 3).join(' < ') || (lines[0] || '').slice(0, 80); };
	class Wrapped extends Native {
		constructor(cb) {
			const rec = { who: creator(new Error().stack), last: new Map() };
			super((entries, obs) => {
				for (const e of entries) { const b = e.borderBoxSize && e.borderBoxSize[0]; rec.last.set(e.target, b ? [b.inlineSize, b.blockSize] : [e.contentRect.width, e.contentRect.height]); }
				if (!L.probe) return cb.call(obs, entries, obs);
				if (!L.looping) { L.looping = true; done.port2.postMessage(0); }
				L.lastCb = rec.who;
				const ds = entries.map((e) => depth(e.target)), before = sizes();
				try { return cb.call(obs, entries, obs); } finally {
					const after = sizes(), changed = [];
					for (const [el, a] of after) { const b = before.get(el); if (!b || b[0] !== a[0] || b[1] !== a[1]) changed.push(`${name(el).slice(0, 28)}@${depth(el)} ${b ? b.join('x') : '-'}->${a.join('x')}`); }
					L.frame.push({ who: rec.who.slice(0, 50), n: entries.length, d: [Math.min(...ds), Math.max(...ds)], els: entries.slice(0, 3).map((e) => name(e.target).slice(0, 30)), changed: changed.slice(0, 8) });
				}
			});
			rec.self = this; L.observers.push(rec);
		}
		observe(target, opts) {
			const rec = L.observers.find((r) => r.self === this); if (rec && !rec.last.has(target)) rec.last.set(target, null);
			if (L.probe && L.looping) L.inLoop.push({ observer: rec && rec.who.slice(0, 40), el: name(target).slice(0, 30), depth: depth(target), after: (L.lastCb || '').slice(0, 50), caller: creator(new Error().stack).slice(0, 80) });
			return super.observe(target, opts);
		}
		unobserve(target) { const rec = L.observers.find((r) => r.self === this); if (rec) rec.last.delete(target); return super.unobserve(target); }
		disconnect() { const rec = L.observers.find((r) => r.self === this); if (rec) rec.last.clear(); return super.disconnect(); }
	}
	window.ResizeObserver = Wrapped;
	addEventListener('error', (ev) => {
		if (!/ResizeObserver loop/.test(ev.message || '')) return;
		if (!L.on) return;
		L.frameErr = true;
		if (L.countOnly) { L.errors.push({ t: Math.round(performance.now()), w: innerWidth, und: [] }); return; }
		const und = [];
		for (const r of L.observers) for (const [el, last] of r.last) {
			if (!el.isConnected) continue;
			// Inside content the browser skips (content-visibility), reading a box would force its layout and could
			// cause the next error: name the target without measuring it.
			if (el.checkVisibility && !el.checkVisibility({ contentVisibilityAuto: true })) { if (last && (last[0] || last[1])) und.push({ who: r.who, el: name(el), depth: depth(el), last: last.map(Math.round), now: 'skipped' }); continue; }
			const rc = el.getBoundingClientRect(), now = [Math.round(rc.width), Math.round(rc.height)];
			const was = last || [0, 0]; /* never delivered: ResizeObserver's own starting size is 0x0 */
			if (Math.abs(now[0] - was[0]) > 0.5 || Math.abs(now[1] - was[1]) > 0.5) und.push({ who: r.who, el: name(el), depth: depth(el), last: was.map(Math.round), now });
		}
		L.errors.push({ t: Math.round(performance.now()), w: innerWidth, und, rounds: L.probe ? L.frame.slice() : undefined, inLoop: L.probe ? (L.inLoop || []).slice() : undefined });
	});
}

async function run(t, mode) {
	// T76 (tool batch 5; astra-review-g6 K1): run after another check in one session, this inherited its viewport (740 px
	// after back-focus-ring) and openSideBySide, which needs 1920, threw; it sets its own window first
	await t.viewport(1920, 1080);
	await t.page.context().addInitScript(wrapResizeObserver);
	let f, size;
	if (mode === 'normal') {
		await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
		const href = await t.root.evaluate(() => location.href);
		[f] = await t.openSideBySide([{ url: href, width: 1920, height: 1080, label: 'FO-94 normal: the page in a frame resized as a window would be' }]);
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = document.getElementById('__bc_side_0'); i.style.width = w + 'px'; i.style.height = h + 'px'; }, [w, h]);
	} else {
		f = await t.app.open({ sandbox: true, onboarding: true, query: 'o55=screen=welcome' });
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = [...document.querySelectorAll('iframe')].find((x) => x.hasAttribute('sandbox')); i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.flex = 'none'; }, [w, h]);
	}
	await f.waitForFunction(() => !!window.O55 && !!O55.S && !!O55.S.root, null, { timeout: 60000 });
	const wrapped = await f.evaluate(([probe, countOnly]) => { if (window.__roLoop) { window.__roLoop.probe = probe; window.__roLoop.countOnly = countOnly; } return !!window.__roLoop; }, [!!+t.args.probe, t.args.attribute !== undefined && !+t.args.attribute]);
	await t.check(`${mode}: ResizeObserver wrapped before the page's scripts`, wrapped);
	if (!wrapped) return;
	const dwell = +t.args.dwell || 1200;
	let resizes = 0, current = null;
	const to = async (w, h) => { const key = w + 'x' + h; if (current !== key) resizes++; current = key; await size(w, h); };
	for (const look of t.args.looks ? String(t.args.looks).split(',') : LOOKS) {
		await size(1920, 1080); current = '1920x1080';
		await f.waitForTimeout(500);
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), look.split('-'));
		await f.waitForTimeout(900);
		await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'c-ready' }));
		await f.waitForTimeout(2500);
		// Count during the walk only, as FO88-N1 was measured
		await f.evaluate(() => { window.__roLoop.on = true; });
		for (const [w, h] of WALK) {
			await t.mark(`${look} -> ${w}x${h}`);
			await to(w, h);
			await f.waitForTimeout(dwell);
		}
		await f.evaluate(() => { window.__roLoop.on = false; });
	}
	const L = await f.evaluate(() => window.__roLoop.errors);
	const frames = await f.evaluate(() => ({ ...window.__roLoop.frames, who: Object.entries(window.__roLoop.frameWho || {}).sort((a, b) => b[1] - a[1]).slice(0, 10) }));
	// Who was left undelivered, counted once per error
	const by = {};
	for (const e of L) for (const k of new Set(e.und.map((u) => `${u.who} :: ${u.el}`))) by[k] = (by[k] || 0) + 1;
	const limit = t.args.limit === undefined ? 0 : +t.args.limit;
	// With --set probe=1: the observations started inside each error frame's delivery loop, and the callback before each
	const inLoop = {};
	for (const e of L) for (const k of new Set((e.inLoop || []).map((o) => `${o.el}@${o.depth} by ${o.observer} after ${o.after}`))) inLoop[k] = (inLoop[k] || 0) + 1;
	const out = { mode, resizes, errors: L.length, limit, undelivered: Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 20),
		inLoop: Object.entries(inLoop).sort((a, b) => b[1] - a[1]).slice(0, 12), frames, first: L.slice(0, 3) };
	t.log(JSON.stringify(out));
	await t.check(`${mode}: ResizeObserver loop errors over ${resizes} resizes at or below ${limit}`, L.length <= limit, JSON.stringify(out));
}

export const tests = {
	'ro loop on resize normal': on('normal', run),
	'ro loop on resize sandbox': on('sandbox', run)
};
