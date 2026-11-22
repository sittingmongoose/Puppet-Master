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
{
	const RANGE = 695;
	const events = [];
	let phase = 'setup';
	const scroller = {
		id: 'pmuScroll', className: 'board', attrs: new Map(), listeners: [], __fcWatch: null,
		scrollTop: 300, scrollHeight: 600 + RANGE, clientHeight: 600,
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
			Object.assign(globalThis, { document: doc, window: win, getComputedStyle: (x) => ({ overflowY: x === scroller ? 'auto' : 'visible' }) });
			try { return fn(arg); } finally { Object.assign(globalThis, saved); }
		},
	};
	const wheels = [];
	const checks = [];
	const t = {
		page: { mouse: {
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
		if (during) await during(Date.now() + 300);
		phase = 'after';
		events.push([phase, 'trace:end']);
		return { main: { cost: 1 } };
	};
	const { result, scrollMoved } = await measureScroll(cdp, f, t, { ms: 300, url: 'file://page', keep: null, label: 'basic-dark usage', trace });
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
console.log('PASS frame-cost trace hygiene: discovery, marking, scrollTop=0 and the pointer aim run before the trace, only the wheel runs inside (turning from the passive listener\'s pushed top), and cleanup plus the moved verdict run after; a view with no scroller fails its window');
