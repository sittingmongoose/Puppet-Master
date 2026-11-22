// PM7-FRAMECOST-SCROLL-START + PM7-FRAMECOST-HOME-NOSCROLL: the frame-cost scroll window started wherever the last
// window left the scroller and turned every 30 ticks of 40 px; Usage's 695 px board spent most ticks pinned near
// the end (94 vs 644 ms/s in one real run, ~/pm-scratch/pm7-perf/v/run-kit1-main-s0/run.log window 2 vs 3), and the
// Home window wheeled at 55% of .page.active over i.pmw-divider-line, where nothing scrolls
// (~/pm-scratch/pm7-perf/v/run-r3-basic-dark/run.log "moved: nothing scrolled"). The window must pick the view's
// main scroller, start at its top, turn at its bounds, and fail when nothing moved.
// node tools/frame-cost-scroll.selftest.mjs [frame-cost.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { pickScroller, scrollStep, scrollMovedOk, measureScroll } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../diagnostics/frame-cost.check.mjs');
assert.equal(typeof pickScroller, 'function', 'the scroll window needs the view main scroller pick; the base wheeled over the divider line');
assert.equal(typeof scrollStep, 'function', 'the scroll window needs bound-aware turning; the base turned every 30 ticks wherever it was');
// the main scroller is the largest scrollable range (Usage's board, 695 px), ties by area
const board = { i: 0, range: 695, h: 600, area: 600 * 1200, x: 600, y: 400, name: 'pmuScroll' };
const aside = { i: 1, range: 200, h: 300, area: 300 * 300, x: 100, y: 200, name: 'aside' };
assert.equal(pickScroller([aside, board]), board);
assert.equal(pickScroller([]), null);
assert.equal(pickScroller([{ i: 0, range: 0, h: 600, area: 100 }]), null, 'a non-scrollable view has no main scroller');
assert.equal(pickScroller([{ ...aside, range: 695, area: 900000 }, board]).i, 1, 'a tie takes the larger area');
assert.equal(scrollStep({ top: 0, max: 695, dir: -1 }), 1);
assert.equal(scrollStep({ top: 695, max: 695, dir: 1 }), -1);
assert.equal(scrollStep({ top: 694, max: 695, dir: 1 }), -1, 'turn before the end, not into it');
assert.equal(scrollStep({ top: 300, max: 695, dir: 1 }), 1);
assert.equal(scrollStep({ top: 300, max: 695, dir: -1 }), -1);
// the real shape: a 695 px board wheeled 40 px a tick from the top turns at its bounds and is never pinned for
// more than the one tick that reaches the end (the base spent most of a 30-tick leg pinned)
let top = 0, dir = 1, pinned = 0, legs = 0;
for (let tick = 0; tick < 120; tick++) {
	const next = Math.max(0, Math.min(695, top + dir * 40));
	if (next === top) pinned++;
	if (next !== top && dir !== scrollStep({ top: next, max: 695, dir })) legs++;
	top = next;
	dir = scrollStep({ top, max: 695, dir });
}
assert.ok(pinned <= 4, `the bound-aware walk is pinned ${pinned} ticks of 120, not most of them`);
assert.ok(legs >= 3, 'the walk turns at both bounds several times over 120 ticks');
console.log('PASS frame-cost scroll: the main scroller is the largest scrollable range, the walk starts at its top and turns at its bounds (pinned at most the tick that reaches the end), and a view with no scroller is named');

// PM7-FRAMECOST-HOME-NOSCROLL: the window fails when nothing moved — Home's wheel over i.pmw-divider-line scrolled
// no scroller at all ("moved: nothing scrolled"), and a view with no scrollable range cannot move either.
assert.equal(typeof scrollMovedOk, 'function', 'the scroll window needs a moved verdict; the base logged a wheel over a still page as a scroll number');
assert.equal(scrollMovedOk({ scroller: 'home-page', range: 400, travel: 0 }), false, 'a wheel that moved nothing fails the window');
assert.equal(scrollMovedOk({ scroller: null, range: 0, travel: 0 }), false, 'no main scroller in the view fails the window');
assert.equal(scrollMovedOk({ scroller: 'pmuScroll', range: 695, travel: 2780 }), true, 'a walk that travelled passes');
console.log('PASS frame-cost moved verdict: a wheel that moved nothing (Home over the divider line) or a view with no scroller fails the window; a travelled walk passes');

// R135-F7: the scroll window ran discovery, DOM marking, scrollTop = 0, the pointer move, ~70/s f.evaluate
// scrollTop polls, cleanup and t.check INSIDE traceWindow's active DevTools trace, perturbing the very main-thread
// costs it measures (frame-trace.mjs: "with nothing added to the page"). Only the wheel may run inside; setup
// before, cleanup and the moved verdict after. This drives the check's own measureScroll with a fake trace, CDP
// session and page, and reads the order of every call.
assert.equal(typeof measureScroll, 'function', 'the scroll window needs a trace-free plan: setup before, wheel-only inside, verdict after');
// R137-F3: the wheel loop's clock, injected into measureScroll. wait(ms) advances virtual time without
// sleeping, so every case runs the same ticks on a quiet or a loaded host (the real-time Date.now() + 300
// deadline left only ~3 ticks of margin for the first -40 and flaked under VM load). The epoch-scale start
// keeps red-on-base honest: a base revision that ignores the hooks runs its real Date.now/setTimeout loop
// against the same deadline instead of reading 0 ticks and falsely passing the N4 case.
function virtualClock() {
	let now = Date.now();
	return { now: () => now, wait: async (ms) => { now += ms; } };
}
{
	const clock = virtualClock();
	const RANGE = 695;
	const events = [];
	let phase = 'setup';
	const scroller = {
		id: 'pmuScroll', className: 'board', attrs: new Map(), listeners: [], __fcWatch: null,
		scrollTop: 300, scrollHeight: 600 + RANGE, clientHeight: 600,
		style: (() => { const m = new Map(); return { getPropertyValue: (p) => m.get(p) || '', setProperty: (p, v) => m.set(p, v), removeProperty: (p) => m.delete(p) }; })(),
		getBoundingClientRect: () => ({ left: 100, top: 50, width: 1200, height: 600 }),
		setAttribute(n, v) { this.attrs.set(n, v); },
		removeAttribute(n) { this.attrs.delete(n); },
		addEventListener(kind, fn) { this.listeners.push(fn); },
		removeEventListener(kind, fn) { this.listeners = this.listeners.filter((x) => x !== fn); },
	};
	const root = { querySelectorAll: () => [scroller] };
	const doc = {
		body: root,
		querySelector: (s) => {
			if (s === '.page.active') return root;
			if (s === '[data-fc-scroller]') return scroller.attrs.has('data-fc-scroller') ? scroller : null;
			const m = /^\[data-fc-cand="(\d+)"\]$/.exec(s);
			if (m) return scroller.attrs.get('data-fc-cand') === m[1] ? scroller : null;
			return null;
		},
		querySelectorAll: (s) => (s === '[data-fc-cand]' && scroller.attrs.has('data-fc-cand') ? [scroller] : []),
	};
	const bindingHandlers = [];
	const win = { __fcTop: (payload) => { for (const h of bindingHandlers) h({ name: '__fcTop', payload }); } };
	const cdp = {
		send: async (method) => { events.push([phase, 'cdp', method]); return {}; },
		on: (name, fn) => { if (name === 'Runtime.bindingCalled') bindingHandlers.push(fn); },
		off: (name, fn) => { const i = bindingHandlers.indexOf(fn); if (i >= 0) bindingHandlers.splice(i, 1); },
	};
	const f = {
		evaluate: async (fn, arg) => {
			events.push([phase, 'evaluate']);
			const saved = { document: globalThis.document, window: globalThis.window, getComputedStyle: globalThis.getComputedStyle };
			// rAF stays installed like a real page global: the settle promise's later frames call it after evaluate
			// returns; microtask-scheduled so the settle is deterministic, never a wall-clock race (R137-F3)
			Object.assign(globalThis, { document: doc, window: win, getComputedStyle: (x) => ({ overflowY: x === scroller ? 'auto' : 'visible' }), requestAnimationFrame: (cb) => queueMicrotask(cb) });
			try { return fn(arg); } finally { Object.assign(globalThis, saved); }
		},
	};
	const wheels = [];
	const checks = [];
	const t = {
		page: { mainFrame: () => f, context: () => ({ newCDPSession: async () => cdp }), mouse: {
			move: async (x, y) => { events.push([phase, 'move', x, y]); },
			wheel: async (x, dy) => {
				events.push([phase, 'wheel', dy]); wheels.push(dy);
				scroller.scrollTop = Math.max(0, Math.min(RANGE, scroller.scrollTop + dy));
				const saved = { window: globalThis.window };
				globalThis.window = win; // the page-side listener reads window.__fcTop, as in the browser
				try { for (const fn of scroller.listeners) fn(); } finally { Object.assign(globalThis, saved); }
			},
		} },
		check: async (name, ok, detail) => { events.push([phase, 'check', ok]); checks.push({ name, ok, detail }); },
	};
	const trace = async (cdp2, { during }) => {
		events.push([phase, 'trace:start']);
		assert.equal(scroller.scrollTop, 0, 'the scroller starts at its top before the trace opens');
		phase = 'inside';
		if (during) await during(clock.now() + 300);
		phase = 'after';
		events.push([phase, 'trace:end']);
		return { main: { cost: 1 } };
	};
	const { result, scrollMoved } = await measureScroll(cdp, f, t, { ms: 300, url: 'file://page', keep: null, label: 'basic-dark usage', trace, now: clock.now, wait: clock.wait });
	assert.deepEqual(result, { main: { cost: 1 } }, 'the trace result is kept');
	const before = events.slice(0, events.findIndex((e) => e[1] === 'trace:start'));
	const inside = events.filter((e) => e[0] === 'inside');
	const after = events.slice(events.findIndex((e) => e[1] === 'trace:end'));
	assert.ok(before.some((e) => e[1] === 'evaluate'), 'discovery runs before the trace');
	assert.ok(before.some((e) => e[1] === 'cdp' && e[2] === 'Runtime.addBinding'), 'the top push is armed before the trace');
	assert.ok(before.some((e) => e[1] === 'move'), 'the pointer aims at the scroller before the trace');
	assert.ok(inside.length > 0 && inside.every((e) => e[1] === 'wheel'), `only the wheel runs inside the trace, got ${JSON.stringify(inside.filter((e) => e[1] !== 'wheel'))}`);
	assert.ok(after.some((e) => e[1] === 'evaluate'), 'cleanup and the travel read run after the trace');
	assert.ok(after.some((e) => e[1] === 'check'), 'the moved verdict runs after the trace');
	assert.ok(wheels.includes(40) && wheels.includes(-40), 'the walk turns at the bounds from the pushed top');
	assert.equal(scrollMoved.scroller, 'pmuScroll');
	assert.equal(scrollMoved.range, RANGE);
	assert.ok(scrollMoved.travel > 0, 'the passive listener accumulated the travel');
	assert.equal(checks.length, 1);
	assert.equal(checks[0].ok, true);
	assert.equal(scroller.listeners.length, 0, 'the scroll listener is removed');
	assert.equal(scroller.attrs.size, 0, 'the marks are removed');
	assert.equal(bindingHandlers.length, 0, 'the binding handler is detached');
}
// a view with no scrollable range: no binding, no wheel, the window fails after an idle trace
{
	const events = [];
	const checks = [];
	const root = { querySelectorAll: () => [] };
	const doc = { body: root, querySelector: (s) => (s === '.page.active' ? root : null), querySelectorAll: () => [] };
	const cdp = { send: async (method) => { events.push(method); return {}; }, on: () => {}, off: () => {} };
	const f = { evaluate: async (fn, arg) => { const saved = { document: globalThis.document, getComputedStyle: globalThis.getComputedStyle }; Object.assign(globalThis, { document: doc, getComputedStyle: () => ({ overflowY: 'visible' }) }); try { return fn(arg); } finally { Object.assign(globalThis, saved); } } };
	const t = { page: { mouse: { move: async () => {}, wheel: async () => { events.push('wheel'); } } }, check: async (name, ok) => { checks.push(ok); } };
	const trace = async (cdp2, { during }) => { assert.equal(during, undefined, 'no scroller: no wheel loop'); return {}; };
	const { scrollMoved } = await measureScroll(cdp, f, t, { ms: 50, url: 'file://page', keep: null, label: 'basic-dark home', trace });
	assert.deepEqual(scrollMoved, { scroller: null, range: 0, travel: 0 });
	assert.deepEqual(checks, [false], 'a view that cannot scroll fails its window');
	assert.ok(!events.includes('Runtime.addBinding') && !events.includes('wheel'));
}

// R136-N4 RED: Settings' scroller is scroll-behavior:smooth (PMConcept7.html #settings-document). A bare
// el.scrollTop = 0 starts an async reset animation that runs INSIDE the trace: the watch (last: 0) credits the
// animation to travel, so scrollMovedOk passes even when the wheel moved nothing. The reset must jump instantly
// (inline scroll-behavior:auto, restored after), settle at 0 for two frames before the watch starts, and a wheel
// that moved nothing must fail. The fake scroller animates any smooth scrollTop write 300 px per wheel tick;
// the wheel itself moves nothing (mis-aimed pointer / blocked container).
{
	const clock = virtualClock();
	const events = [];
	let phase = 'setup';
	const styleMap = new Map();
	const RANGE = 1800;
	const scroller = {
		id: 'settings-document', className: 'document-scroll', attrs: new Map(), listeners: [], __fcWatch: null,
		_top: 1800, anim: null, scrollHeight: 600 + RANGE, clientHeight: 600,
		get scrollTop() { return this._top; },
		set scrollTop(v) {
			const behavior = styleMap.get('scroll-behavior') || 'smooth'; // the stylesheet's smooth behavior
			if (behavior === 'smooth' && v !== this._top) this.anim = { target: v };
			else { this._top = v; this.anim = null; }
		},
		style: {
			getPropertyValue: (p) => styleMap.get(p) || '',
			setProperty: (p, v) => { styleMap.set(p, v); events.push([phase, 'style', p, v]); },
			removeProperty: (p) => { styleMap.delete(p); },
		},
		getBoundingClientRect: () => ({ left: 100, top: 50, width: 1200, height: 600 }),
		setAttribute(n, v) { this.attrs.set(n, v); },
		removeAttribute(n) { this.attrs.delete(n); },
		addEventListener(kind, fn) { this.listeners.push(fn); },
		removeEventListener(kind, fn) { this.listeners = this.listeners.filter((x) => x !== fn); },
	};
	const root = { querySelectorAll: () => [scroller] };
	const doc = {
		body: root,
		querySelector: (s) => {
			if (s === '.page.active') return root;
			if (s === '[data-fc-scroller]') return scroller.attrs.has('data-fc-scroller') ? scroller : null;
			const m = /^\[data-fc-cand="(\d+)"\]$/.exec(s);
			if (m) return scroller.attrs.get('data-fc-cand') === m[1] ? scroller : null;
			return null;
		},
		querySelectorAll: (s) => (s === '[data-fc-cand]' && scroller.attrs.has('data-fc-cand') ? [scroller] : []),
	};
	const win = {};
	const cdp = { send: async (method) => { events.push([phase, 'cdp', method]); return {}; }, on: () => {}, off: () => {} };
	const f = {
		evaluate: async (fn, arg) => {
			events.push([phase, 'evaluate']);
			const saved = { document: globalThis.document, window: globalThis.window, getComputedStyle: globalThis.getComputedStyle };
			Object.assign(globalThis, { document: doc, window: win, getComputedStyle: (x) => ({ overflowY: x === scroller ? 'auto' : 'visible' }), requestAnimationFrame: (cb) => queueMicrotask(cb) });
			try { return fn(arg); } finally { Object.assign(globalThis, saved); }
		},
	};
	const checks = [];
	const t = {
		page: {
			mainFrame: () => f, context: () => ({ newCDPSession: async () => cdp }),
			mouse: {
				move: async () => {},
				wheel: async (x, dy) => {
					events.push([phase, 'wheel', dy]);
					// the wheel moves NOTHING; only a pending smooth reset animates
					if (scroller.anim) {
						scroller._top = Math.max(scroller.anim.target, scroller._top - 300);
						if (scroller._top === scroller.anim.target) scroller.anim = null;
						const saved = { window: globalThis.window };
						globalThis.window = win;
						try { for (const fn of scroller.listeners) fn(); } finally { Object.assign(globalThis, saved); }
					}
				},
			},
		},
		check: async (name, ok, detail) => { checks.push({ name, ok, detail }); },
	};
	const trace = async (cdp2, { during }) => { phase = 'inside'; if (during) await during(clock.now() + 300); phase = 'after'; return {}; };
	const { scrollMoved } = await measureScroll(cdp, f, t, { ms: 300, url: 'file://page', keep: null, label: 'basic-dark settings', trace, now: clock.now, wait: clock.wait });
	assert.equal(checks.length, 1);
	assert.equal(checks[0].ok, false, 'a wheel that moved nothing fails the window even when a smooth reset animates inside the trace');
	assert.equal(scrollMoved.travel, 0, 'the reset animation is not travel');
	assert.equal(scrollMoved.scroller, 'settings-document');
	assert.equal(scrollMoved.range, RANGE);
	assert.equal(scroller.listeners.length, 0, 'the scroll listener is removed');
	assert.ok(!styleMap.has('scroll-behavior'), 'the inline scroll-behavior is restored after the window');
	assert.ok(events.some((e) => e[0] === 'setup' && e[1] === 'style' && e[2] === 'scroll-behavior' && e[3] === 'auto'), 'the reset jumps instantly before the trace');
	assert.equal(scroller.scrollTop, 0, 'the scroller settled at its top');
}

// R136-N5: under --set sandbox=1 the app is an opaque-origin OOPIF. Runtime.addBinding on the PAGE session
// never injects __fcTop into the frame: liveTop stayed 0, the wheel pinned at the bottom bound for most of the
// trace, and travel still passed. The binding must live on the frame's own CDP session (Tracing stays on the
// page session); if that session cannot be opened, the window must say could-not-judge, never pass.
function sandboxWorld({ sessionFails = false, sharedTarget = false } = {}) {
	const RANGE = 695;
	const clock = virtualClock();
	const events = [];
	const state = { phase: 'setup' };
	const styleMap = new Map();
	const scroller = {
		id: 'pmuScroll', className: 'board', attrs: new Map(), listeners: [], __fcWatch: null,
		scrollTop: 300, scrollHeight: 600 + RANGE, clientHeight: 600,
		style: { getPropertyValue: (p) => styleMap.get(p) || '', setProperty: (p, v) => styleMap.set(p, v), removeProperty: (p) => styleMap.delete(p) },
		getBoundingClientRect: () => ({ left: 100, top: 50, width: 1200, height: 600 }),
		setAttribute(n, v) { this.attrs.set(n, v); },
		removeAttribute(n) { this.attrs.delete(n); },
		addEventListener(kind, fn) { this.listeners.push(fn); },
		removeEventListener(kind, fn) { this.listeners = this.listeners.filter((x) => x !== fn); },
	};
	const root = { querySelectorAll: () => [scroller] };
	const doc = {
		body: root,
		querySelector: (s) => {
			if (s === '.page.active') return root;
			if (s === '[data-fc-scroller]') return scroller.attrs.has('data-fc-scroller') ? scroller : null;
			const m = /^\[data-fc-cand="(\d+)"\]$/.exec(s);
			if (m) return scroller.attrs.get('data-fc-cand') === m[1] ? scroller : null;
			return null;
		},
		querySelectorAll: (s) => (s === '[data-fc-cand]' && scroller.attrs.has('data-fc-cand') ? [scroller] : []),
	};
	const frameHandlers = [];
	const win = {}; // the frame's window: __fcTop exists only if the binding was added on the session owning the frame's target (frame session for an OOPIF, page session for a shared-target frame)
	const frameCdp = {
		send: async (method) => {
			events.push([state.phase, 'frameCdp', method]);
			if (method === 'Runtime.addBinding') win.__fcTop = (payload) => { for (const h of frameHandlers) h({ name: '__fcTop', payload }); };
			if (method === 'Runtime.removeBinding') delete win.__fcTop;
			return {};
		},
		on: (name, fn) => { if (name === 'Runtime.bindingCalled') frameHandlers.push(fn); },
		off: (name, fn) => { const i = frameHandlers.indexOf(fn); if (i >= 0) frameHandlers.splice(i, 1); },
		detach: async () => { events.push([state.phase, 'frameCdp', 'detach']); },
	};
	const pageHandlers = [];
	const cdp = {
		send: async (method) => {
			events.push([state.phase, 'cdp', method]);
			// R137-F2: a shared-target frame is part of the page's CDP target, so the page session's binding reaches it
			if (sharedTarget && method === 'Runtime.addBinding') win.__fcTop = (payload) => { for (const h of pageHandlers) h({ name: '__fcTop', payload }); };
			if (sharedTarget && method === 'Runtime.removeBinding') delete win.__fcTop;
			return {};
		},
		on: (name, fn) => { if (name === 'Runtime.bindingCalled') pageHandlers.push(fn); },
		off: (name, fn) => { const i = pageHandlers.indexOf(fn); if (i >= 0) pageHandlers.splice(i, 1); },
	};
	const mainF = {};
	const f = {
		evaluate: async (fn, arg) => {
			events.push([state.phase, 'evaluate']);
			const saved = { document: globalThis.document, window: globalThis.window, getComputedStyle: globalThis.getComputedStyle };
			Object.assign(globalThis, { document: doc, window: win, getComputedStyle: (x) => ({ overflowY: x === scroller ? 'auto' : 'visible' }), requestAnimationFrame: (cb) => queueMicrotask(cb) });
			try { return fn(arg); } finally { Object.assign(globalThis, saved); }
		},
	};
	const wheels = [], checks = [];
	const t = {
		page: {
			mainFrame: () => mainF,
			context: () => ({ newCDPSession: async (target) => {
				events.push([state.phase, 'session', target === f ? 'frame' : 'page']);
				if (target === f && sessionFails) throw new Error('no frame session');
				if (target === f && sharedTarget) throw new Error("This frame does not have a separate CDP session, it is a part of the parent frame's session");
				return target === f ? frameCdp : cdp;
			} }),
			mouse: {
				move: async () => {},
				wheel: async (x, dy) => {
					events.push([state.phase, 'wheel', dy]); wheels.push(dy);
					scroller.scrollTop = Math.max(0, Math.min(RANGE, scroller.scrollTop + dy));
					const saved = { window: globalThis.window };
					globalThis.window = win;
					try { for (const fn of scroller.listeners) fn(); } finally { Object.assign(globalThis, saved); }
				},
			},
		},
		check: async (name, ok, detail) => { checks.push({ name, ok, detail }); },
	};
	return { RANGE, events, state, styleMap, scroller, win, frameCdp, cdp, f, t, wheels, checks, frameHandlers, pageHandlers, clock };
}
// R136-N5 RED: the sandbox walk turns at its bounds from the frame-pushed top; the binding lives on the frame
// session, Tracing on the page session, and the frame session is detached after.
{
	const w = sandboxWorld();
	const trace = async (cdp2, { during }) => {
		assert.equal(cdp2, w.cdp, 'Tracing stays on the page session');
		w.events.push([w.state.phase, 'trace:start']);
		assert.equal(w.scroller.scrollTop, 0, 'the scroller starts at its top');
		w.state.phase = 'inside';
		if (during) await during(w.clock.now() + 300);
		w.state.phase = 'after';
		w.events.push([w.state.phase, 'trace:end']);
		return { main: { cost: 1 } };
	};
	const { scrollMoved } = await measureScroll(w.cdp, w.f, w.t, { ms: 300, url: 'file://page', keep: null, label: 'basic-dark usage sandbox', trace, now: w.clock.now, wait: w.clock.wait });
	assert.ok(w.wheels.includes(40) && w.wheels.includes(-40), 'the sandbox walk turns at the bounds from the frame-pushed top');
	assert.ok(w.events.some((e) => e[1] === 'frameCdp' && e[2] === 'Runtime.addBinding'), 'the binding is installed on the frame session');
	assert.ok(!w.events.some((e) => e[1] === 'cdp' && e[2] === 'Runtime.addBinding'), 'never on the page session');
	assert.ok(w.events.some((e) => e[1] === 'frameCdp' && e[2] === 'detach'), 'the frame session is detached after');
	assert.equal(w.frameHandlers.length, 0, 'the binding handler is detached');
	assert.equal(w.scroller.listeners.length, 0);
	assert.equal(w.scroller.attrs.size, 0);
	assert.equal(w.checks.length, 1);
	assert.equal(w.checks[0].ok, true);
	assert.ok(scrollMoved.travel > 0);
}
// R136-N5 RED: no frame session -> the window says could-not-judge, never a silent pass with a pinned wheel.
{
	const w = sandboxWorld({ sessionFails: true });
	const trace = async (cdp2, { during }) => { assert.equal(during, undefined, 'no honest turning: no wheel loop'); return {}; };
	const { scrollMoved } = await measureScroll(w.cdp, w.f, w.t, { ms: 50, url: 'file://page', keep: null, label: 'basic-dark usage sandbox', trace });
	assert.equal(w.checks.length, 1);
	assert.equal(w.checks[0].ok, false, 'a sandbox window without a frame session must not pass');
	assert.ok(/could not judge/.test(w.checks[0].detail), 'the failure is named could-not-judge');
	assert.equal(w.wheels.length, 0);
	assert.equal(scrollMoved.travel, 0);
	assert.ok(!w.events.some((e) => e[2] === 'Runtime.addBinding'), 'no binding without a frame session');
}
// R137-F2 RED: an in-process child iframe (--record's framed viewport __bc_viewport, or any shared-target
// sandbox) has no session of its own: Playwright's newCDPSession(f) throws "This frame does not have a
// separate CDP session, it is a part of the parent frame's session". The frame IS part of the page's CDP
// target, so the binding rides the page session cdp (the kit convention: sound-prime, cold-bell,
// activity-bar-focus-film); the window measures, never could-not-judge, and cdp is never detached.
{
	const w = sandboxWorld({ sharedTarget: true });
	const trace = async (cdp2, { during }) => {
		assert.equal(cdp2, w.cdp, 'Tracing stays on the page session');
		w.state.phase = 'inside';
		if (during) await during(w.clock.now() + 300);
		w.state.phase = 'after';
		return { main: { cost: 1 } };
	};
	const { scrollMoved } = await measureScroll(w.cdp, w.f, w.t, { ms: 300, url: 'file://page', keep: null, label: 'basic-dark usage framed', trace, now: w.clock.now, wait: w.clock.wait });
	assert.ok(w.wheels.includes(40) && w.wheels.includes(-40), 'the shared-target walk turns at the bounds from the pushed top');
	assert.ok(w.events.some((e) => e[1] === 'cdp' && e[2] === 'Runtime.addBinding'), 'the binding rides the page session the frame shares');
	assert.ok(!w.events.some((e) => e[1] === 'frameCdp'), 'no separate frame session is opened or detached');
	assert.equal(w.checks.length, 1);
	assert.equal(w.checks[0].ok, true, 'a shared-target frame measures its window, not could-not-judge');
	assert.ok(!/could not judge/.test(w.checks[0].detail));
	assert.ok(scrollMoved.travel > 0);
	assert.equal(w.pageHandlers.length, 0, 'the binding handler is detached from the page session');
	assert.equal(w.scroller.listeners.length, 0);
	assert.equal(w.scroller.attrs.size, 0);
	assert.ok(!w.styleMap.has('scroll-behavior'), 'the inline scroll-behavior is restored');
}
// R136-C1 RED: a throwing trace still tears down the listener, marks and binding (no leak into the next look).
{
	const w = sandboxWorld();
	const trace = async () => { throw new Error('trace failed'); };
	await assert.rejects(measureScroll(w.cdp, w.f, w.t, { ms: 50, url: 'file://page', keep: null, label: 'basic-dark usage', trace }), /trace failed/);
	assert.equal(w.scroller.listeners.length, 0, 'the scroll listener is removed even when the trace throws');
	assert.equal(w.scroller.attrs.size, 0, 'the marks are removed even when the trace throws');
	assert.equal(w.frameHandlers.length, 0, 'the binding handler is detached even when the trace throws');
	assert.ok(!w.styleMap.has('scroll-behavior'), 'the inline scroll-behavior is restored even when the trace throws');
	assert.ok(w.events.some((e) => e[1] === 'frameCdp' && e[2] === 'detach'), 'the frame session is detached even when the trace throws');
}
console.log('PASS frame-cost trace hygiene (deterministic virtual clock, R137-F3): discovery, marking, scrollTop=0 and the pointer aim run before the trace, only the wheel runs inside (turning from the passive listener\'s pushed top), and cleanup plus the moved verdict run after; a view with no scroller fails its window; a smooth-behavior scroller resets instantly and settles before the watch starts; the sandbox binding lives on the frame session (or the window says could-not-judge), a shared-target in-process frame measures on the page session it is part of (never could-not-judge, never detached), and a throwing trace still tears everything down');
