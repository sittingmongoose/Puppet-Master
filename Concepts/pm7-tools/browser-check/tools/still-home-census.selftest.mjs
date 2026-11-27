// PM7PERF-STILL-PENDING-AGE: the 23 s Home census receipt must carry playState/pending/currentTime so a queued
// animation is told apart from an older loop. Real record: sol-max-15's instrumented runtime on Alexis,
// /mnt/Cursor/PuppetMaster-Evidence/tests/sol-max-15/kit-still-home-pending-0-head/no-hook-pending-frames.json
// (SHA-256 bcdde55ad3ace5f98c7324c7ffc18a4b1862634a9349e487ceb2d422a53eaf2a): at elapsed 22780.6 ms, still true,
// five animations queued with pending true, current time 0 and null start (ab-breathe on nx nx-r-status nx-a-seq
// nx-z1 nx-t-working; nx-chart-0L/1L/2L on nx-p nx-p0/p1/p2 nx-pc; orbit-pulse on orbit-node-pip). The base receipt
// kept only the start (null), so the row could not classify them and counted them as running loops.
// node tools/still-home-census.selftest.mjs [perf-still-page.check.mjs to test instead]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';

const file = process.argv[2] ? resolve(process.argv[2]) : new URL('../checks/perf-still-page.check.mjs', import.meta.url).pathname;
const source = readFileSync(file, 'utf8');
const { stillHomeDue } = await import(pathToFileURL(file).href);

// the five queued animations of the real record, plus one older loop (started before the still mark) and one young
// loop (started after it, less than lookAgain before the census)
const NOW = 22780.6, STILL_AT = 20000;
const anim = (name, cls, { start = null, pending = false, current = 0, playState = 'running' } = {}) => {
	const el = { tagName: 'I', className: cls, getAttribute: () => null, classList: { contains: () => false }, getRootNode: () => context.document, getAnimations: () => [] };
	return { animationName: name, playState, pending, currentTime: current, startTime: start, effect: { target: el, pseudoElement: null, getTiming: () => ({ iterations: Infinity }) } };
};
const queuedReal = [
	anim('ab-breathe', 'nx nx-r-status nx-a-seq nx-z1 nx-t-working', { pending: true }),
	anim('nx-chart-0L', 'nx-p nx-p0 nx-pc', { pending: true }),
	anim('nx-chart-1L', 'nx-p nx-p1 nx-pc', { pending: true }),
	anim('nx-chart-2L', 'nx-p nx-p2 nx-pc', { pending: true }),
	anim('orbit-pulse', 'orbit-node-pip', { pending: true })
];
const older = anim('ab-breathe', 'nx nx-r-status', { start: 4000, current: NOW - 4000 });
const young = anim('orbit-pulse', 'orbit-node-pip', { start: 21500, current: NOW - 21500 });
const stuck = anim('stuck-loop', 'nx nx-r-status', { pending: true });
const starting = anim('starting-loop', 'nx', { pending: true });
const pausing = anim('pausing-loop', 'nx', { pending: true });
const animations = [...queuedReal, older, young, stuck, starting, pausing];
let frame = 0;
const context = vm.createContext({
	window: { PM_STILL: {} },
	document: { documentElement: { hasAttribute: () => true }, querySelectorAll: () => [], getAnimations: () => animations },
	performance: { now: () => NOW },
	requestAnimationFrame: (cb) => queueMicrotask(() => {
		cb(++frame);
		// the five real queued animations leave pending within two frames; the constructed stuck one does not
		if (frame === 2) {
			for (const a of queuedReal) { a.pending = false; a.startTime = NOW - 16; a.currentTime = 16; }
			// The running start and the requested pause are visible even while pending is still true.
			starting.startTime = NOW;
			pausing.playState = 'paused';
		}
	})
});
const start = source.indexOf('const CENSUS ='), end = source.indexOf('// The try the frame rows judge', start);
assert.ok(start >= 0 && end > start, 'CENSUS found in the check');
await vm.runInContext(source.slice(start, end) + '\nwindow.__census = CENSUS();', context);
const census = await context.window.__census;

// 1. the receipt carries the queued state and a four-frame persistence recheck: red on base (runAt kept only
// what/start/held/finite and had no pending recheck)
assert.equal(census.runAt.length, 10);
for (const r of census.runAt.slice(0, 5)) {
	assert.equal(r.pending, true, `the receipt must carry pending (${r.what})`);
	assert.equal(r.currentTime, 0, `the receipt must carry currentTime (${r.what})`);
	assert.equal(r.state, 'running', `the receipt must carry playState (${r.what})`);
	assert.equal(r.start, null);
	assert.equal(r.pendingAfterFrames, 4, 'the queued state is rechecked after four frames');
	assert.equal(r.stillPending, false, 'the real queued animations left pending during the recheck');
}

// The recheck must use the current browser state even when the pending flag has not cleared.
assert.deepEqual(Array.from(census.runAt.slice(8), (r) => r.stillPending), [false, false],
	'a resolved startTime or a new pause ends the running, null-start pending state');

// 2. the row separates the resolved cases from the older loop, the young one and the permanently pending loop
assert.equal(typeof stillHomeDue, 'function', 'the 23 s row needs the queued/due/young split (base counted the queued five as running loops)');
const split = stillHomeDue(census.runAt, { stillAt: census.stillAt ?? STILL_AT, now: census.now, lookAgain: 5000 });
assert.equal(split.queued.length, 7, 'the seven animations that leave the queued shape during the recheck are logged, not judged');
assert.equal(split.due.length, 2, 'the older loop and the animation still pending after four frames are due');
assert.equal(split.due[0].start, 4000);
assert.equal(split.due[1].what, 'stuck-loop on i.nx.nx-r-status');
assert.equal(split.due[1].stillPending, true);
assert.equal(split.young.length, 1, 'the loop that began after the still mark stays logged');
// with only the queued five the row passes (due empty), the receipt still names them
const onlyQueued = stillHomeDue(census.runAt.slice(0, 5), { stillAt: STILL_AT, now: NOW, lookAgain: 5000 });
assert.equal(onlyQueued.due.length, 0);
assert.equal(onlyQueued.queued.length, 5);

// 3. the old strictness stays: an unclassified null start (not pending) is still due, and a pending animation whose
// current time has advanced is not the queued shape
const unknown = stillHomeDue([{ what: 'x', start: null, pending: false, currentTime: 0, state: 'running' }], { stillAt: STILL_AT, now: NOW, lookAgain: 5000 });
assert.equal(unknown.due.length, 1, 'a null start without pending stays judged');
const advanced = stillHomeDue([{ what: 'x', start: null, pending: true, currentTime: 1200, state: 'running' }], { stillAt: STILL_AT, now: NOW, lookAgain: 5000 });
assert.equal(advanced.queued.length, 0, 'pending with an advanced current time is not the queued shape');
assert.equal(advanced.due.length, 1);
console.log('PASS the census receipt carries playState/pending/currentTime and a four-frame persistence recheck: the five real queued animations are logged not judged, the older and permanently pending loops are due, the young loop is logged, and an unclassified null start still fails');
