#!/usr/bin/env node
// A chain's next run under PMConcept7's onboarding window (pm7-perf lane C3, finding 1 of the R1 review of 8fc3ff34ce).
// While the window is open the chat rests (app.js, PM56_HOST.onRest), and a chained run's successor delay counts only
// the time the window is NOT open: what was left of it at the opening is what is left at the close. The review found
// that a visit shorter than the delay was not counted at all (arm 1200 ms, open at +200, close at +800: the successor
// started at +1200 instead of +1800).
//
// No browser: the code is taken from app.js as it stands (the rest hook, from `function workResting(){` up to
// `function workTick(){`, and the whole `function onRecComplete(rec){...}`) and run on a fake clock with a timer queue
// that fires in order. Every case arms a successor of `delay` ms at t = 0, then opens and closes the window as listed,
// and expects the successor to start once `delay` ms of time outside the window have gone by.
// Run: node tests/rest-sequence-verify.mjs   (exit 1 on any failure)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const APP = fileURLToPath(new URL('../app.js', import.meta.url));
const src = readFileSync(APP, 'utf8');

function slice(from, to) {
	const i = src.indexOf(from), j = src.indexOf(to, i + 1);
	if (i < 0 || j < 0 || src.indexOf(from, i + 1) >= 0) throw new Error(`app.js: cannot find exactly one "${from}" followed by "${to}"`);
	return src.slice(i, j);
}
function fn(head) {
	const i = src.indexOf(head);
	if (i < 0 || src.indexOf(head, i + 1) >= 0) throw new Error(`app.js: cannot find exactly one "${head}"`);
	let depth = 0, k = src.indexOf('{', i);
	for (; k < src.length; k++) { const c = src[k]; if (c === '{') depth++; else if (c === '}' && --depth === 0) break; }
	return src.slice(i, k + 1);
}
const restHook = slice('function workResting(){', 'function workTick(){');
const onRecComplete = fn('function onRecComplete(rec){');

// One chat, on a fake clock. at(ms, fn) queues work for the timer queue at that time; run(until) plays it in order.
function chat() {
	let clock = 0, seq = 0, resting = false;
	const timers = new Map(), events = [], started = [], hooks = [];
	const at = (ms, f) => events.push({ ms, f, n: seq++ });
	const setTimeout = (f, ms) => { const id = ++seq; timers.set(id, { at: clock + Math.max(0, ms | 0), f, n: seq }); return id; };
	const clearTimeout = (id) => { timers.delete(id); };
	const HOST = { resting: () => resting, onRest: (f) => hooks.push(f) };
	const setRest = (on) => { if (on === resting) return; resting = on; hooks.forEach((f) => f(on)); };
	const D = { workRuns: { first: { next: { run: 'second', delayMs: 0 } }, second: {} } };
	const body = `let seqTimer=null, workTimer=null, followMoved=false;\n${restHook}\n${onRecComplete}\nreturn { onRecComplete };`;
	const make = new Function('HOSTED', 'HOST', 'performance', 'setTimeout', 'clearTimeout', 'clearInterval', 'cancelGlide', 'runningRecs', 'armWorkTimer', 'kickFollow', 'workCompleteHooks', 'D', 'followIfSticky', 'heldNextRuns', 'startWorkingRec', body);
	const app = make(true, HOST, { now: () => clock }, setTimeout, clearTimeout, () => {}, () => {}, () => [], () => {}, () => {}, [], D, () => {}, {}, (id) => started.push({ id, at: clock }));
	return {
		at, setRest, started,
		arm(delay) { D.workRuns.first.next.delayMs = delay; app.onRecComplete({ runId: 'first', id: 'first' }); },
		run(until) {
			for (;;) {
				let next = null;
				for (const [id, x] of timers) if (!next || x.at < next.x.at || (x.at === next.x.at && x.n < next.x.n)) next = { id, x };
				const ev = events.filter((e) => e.ms <= until).sort((a, b) => a.ms - b.ms || a.n - b.n)[0];
				if (ev && (!next || ev.ms <= next.x.at)) { events.splice(events.indexOf(ev), 1); clock = ev.ms; ev.f(); continue; }
				if (next && next.x.at <= until) { timers.delete(next.id); clock = next.x.at; next.x.f(); continue; }
				clock = until; return;
			}
		}
	};
}

// [name, delay, visits [[open, close], ...], window open already when the delay is armed]
const CASES = [
	['no window', 1200, []],
	['a visit shorter than the delay (the review\'s trigger)', 1200, [[200, 800]]],
	['a visit longer than the delay', 1200, [[200, 3000]]],
	['two short visits', 1200, [[200, 400], [600, 700]]],
	['a visit that ends exactly when the delay was due', 1200, [[200, 1200]]],
	['a short visit then a long one', 1400, [[100, 300], [500, 5000]]],
	['armed under the window, which closes before the delay was due', 1200, [[-100, 500]]],
	['armed under the window, which closes after the delay was due', 1200, [[-100, 2000]]]
];
let failed = 0;
for (const [name, delay, visits] of CASES) {
	const c = chat();
	const pre = visits.filter(([o]) => o < 0);
	if (pre.length) c.setRest(true);
	for (const [o, x] of visits) { if (o >= 0) c.at(o, () => c.setRest(true)); c.at(x, () => c.setRest(false)); }
	c.arm(delay);
	c.run(20000);
	// when `delay` ms outside the window have gone by, counted from 0
	let out = 0, t = 0, want = null;
	const spans = visits.map(([o, x]) => [Math.max(0, o), x]).sort((a, b) => a[0] - b[0]);
	for (const [o, x] of spans) { if (o - t >= delay - out) break; out += o - t; t = x; }
	want = t + (delay - out);
	const got = c.started.length === 1 ? c.started[0].at : null;
	const pass = got === want;
	if (!pass) failed++;
	console.log(`${pass ? 'PASS' : 'FAIL'} ${name}: delay ${delay} ms, window ${JSON.stringify(visits)}: successor at ${got == null ? `none (${c.started.length} starts)` : `+${got} ms`}, expected +${want} ms`);
}
console.log(`${CASES.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
