// R125 #1: the R2 lateness probe must measure the host's timer queue delay, not the page's own work. The check's
// recorder (INSTALL) is run against a stub page and a timer queue: the page registers its wheel/scroll listeners first
// (42-cards.js:1321-1323), its scroll listener does its board work before re-arming the 150 ms rest timer, and its
// wheelEnd spends 60 ms in the head fit before removing the marker (42-cards.js:1156-1175). With the probe armed in a
// window capture listener its deadline starts at the input's dispatch, it fires ahead of the page's timer, `late` is
// only the queue delay, and the 212 ms end that the old code accepted is the FAIL it is. With the old listener order
// the probe runs behind the page's timer, reads the fit as 60 ms of lateness (late 60, bound 212) and passes.
// node tools/usage-hover-pause-probe.selftest.mjs [usage-hover-pause.check.mjs with INSTALL exported]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const mod = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/usage-hover-pause.check.mjs');
assert.equal(typeof mod.INSTALL, 'function', 'the check exports INSTALL (the page recorder) for this self-test');
const { INSTALL, judge } = mod;

// a timer queue whose callbacks advance the same clock the page and the recorder read
let clock = 0, seq = 0, nextId = 0;
const timers = new Map();
const realSetTimeout = globalThis.setTimeout, realClearTimeout = globalThis.clearTimeout;
globalThis.setTimeout = (fn, ms) => { const t = { id: ++nextId, fn, due: clock + (Number(ms) || 0), seq: seq++ }; timers.set(t.id, t); return t.id; };
globalThis.clearTimeout = (id) => { timers.delete(id); };
globalThis.performance = { now: () => clock };
const runDue = () => {
	for (;;) {
		const next = [...timers.values()].filter((t) => t.due <= clock).sort((a, b) => a.due - b.due || a.seq - b.seq)[0];
		if (!next) {
			// nothing due at the current time: jump to the earliest timer, as the event loop would
			const soon = [...timers.values()].sort((a, b) => a.due - b.due || a.seq - b.seq)[0];
			if (!soon) return;
			clock = soon.due;
			continue;
		}
		timers.delete(next.id);
		clock = Math.max(clock, next.due);
		next.fn();
	}
};
runDue.last = () => clock;

// the page's stubs: one scroller inside the stage, no layout, a frame clock that does not run
const listeners = { window: { capture: {}, bubble: {} }, sc: [] };
const sc = {
	addEventListener(type, fn, opts) { listeners.sc.push({ type, fn, capture: !!(opts && opts.capture) }); },
	contains: () => true
};
const board = { children: [], querySelector: () => null, querySelectorAll: () => [], getAttribute: () => null };
const windowStub = {
	addEventListener(type, fn, opts) { const phase = opts && opts.capture ? listeners.window.capture : listeners.window.bubble; (phase[type] ||= []).push(fn); }
};
globalThis.window = windowStub;
globalThis.document = { getElementById: (id) => (id === 'pmuScroll' ? sc : id === 'pmuBoard' ? board : null), querySelector: () => null, querySelectorAll: () => [] };
let observeMutations;
globalThis.MutationObserver = function (callback) { observeMutations = callback; this.observe = () => {}; this.disconnect = () => {}; this.takeRecords = () => []; };
globalThis.requestAnimationFrame = () => 0;
const dispatch = (type) => {
	const e = { type, target: sc };
	for (const fn of listeners.window.capture[type] || []) fn(e);
	for (const l of listeners.sc) if (l.type === type) l.fn(e);
	for (const fn of listeners.window.bubble[type] || []) fn(e);
};

// the page's own wheel/scroll listeners, registered before the check installs its recorder
let productTimer = 0;
const ops = [], cls = [];
const wheelEnd = () => {
	clock += 60; // fitTools before the marker's removal (42-cards.js:1156-1175)
	ops.push({ t: clock, op: null });
	cls.push({ t: clock, card: 'c', on: true });
};
sc.addEventListener('wheel', () => {
	clock += 1; // pauseHover, then wheelHold
	if (productTimer) globalThis.clearTimeout(productTimer);
	productTimer = globalThis.setTimeout(wheelEnd, 150);
}, { passive: true });
sc.addEventListener('scroll', () => {
	clock += 2; // wheelBoard
	if (productTimer) globalThis.clearTimeout(productTimer);
	productTimer = globalThis.setTimeout(wheelEnd, 150);
}, { passive: true });

assert.equal(INSTALL(), true, 'INSTALL finds the scroller and the board');
const R = globalThis.window.__uhp;
R.on = true; R.wheels = []; R.scrolls = [];
dispatch('wheel');   // the burst's first tick
ops.push({ t: clock, op: 'wheel' }); // the marker's mutation is observed after the dispatch (MutationObserver microtask)
dispatch('scroll');  // its scroll, the last input
const scrollAt = clock;
runDue();

const frames = Array.from({ length: 16 }, (_, i) => {
	const t = i * 20;
	return { t, top: 0, card: 'c', lit: t > 213 ? ['c'] : [], near: [], tools: t > 213 ? 0.9 : 0, op: t <= 213 ? 'wheel' : null, highlights: 0 };
});
const rec = { wheels: R.wheels, scrolls: R.scrolls, ops, probe: R.probe, trans: [], cls, loaf: [], fadeMs: 140, frames };
const v = judge(rec, { rest: 'c', back: 400 });
const release = ops.find((x) => x.op !== 'wheel');

// the probe is armed at the capture phase, before the page's listener: its due is the input's dispatch + 150, its
// fired time is the queue's delay only, and it fires before the marker comes back
const summary = `probe due ${R.probe.due}, fired ${R.probe.fired}, release ${release.t}, late ${v.r2.late} ms, end ${v.r2.end} ms, back ${v.r2.back} ms in ${v.r2.backFrames} frames, R2 ${v.r2.ok ? 'PASSES' : 'fails'}`;
console.log(`DIAG ${summary}`);
assert.equal(R.probe.due, R.scrolls.at(-1) + 150, 'the probe deadline starts at the last input');
assert.equal(R.probe.fired, R.probe.due, `an idle queue fires the probe on its deadline (${summary})`);
assert.ok(R.probe.fired < release.t, `the probe fires before the page's return work (${R.probe.fired} < ${release.t})`);
assert.ok(release.t - scrollAt >= 200, `the page's fit puts the marker removal ${release.t - scrollAt} ms after the last input`);

// and the verdict reads the page's own 212 ms end as late: the 60 ms fit is not timer lateness
assert.equal(v.r2.end, release.t - Math.max(...R.wheels, ...R.scrolls), 'sanity: the end is measured from the last input');
assert.ok(v.r2.end >= 200, `the pause ended ${v.r2.end} ms after the last input`);
assert.ok(v.r2.late <= 2, `the host was not late (${v.r2.late} ms); the page's fit is not queue delay (${summary})`);
assert.equal(v.r2.ok, false, 'a page that returns 60 ms after its own rest is late, not excused by that work');

// The observer receives a single batch for two marker transitions with the same final DOM value.
board.getAttribute = () => 'wheel';
R.ops = [];
observeMutations([
	{ target: board, attributeName: 'data-op', oldValue: 'wheel' },
	{ target: board, attributeName: 'data-op', oldValue: null }
]);
assert.deepEqual(R.ops.map(({ op }) => op), [null, 'wheel'], 'a clear and re-arm within one task cannot hide the gap');

globalThis.setTimeout = realSetTimeout;
globalThis.clearTimeout = realClearTimeout;
console.log(`PASS the R2 probe is armed upstream of the page's listener: ${summary} (the old order read the 60 ms fit as lateness and passed it)`);
