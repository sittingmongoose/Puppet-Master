// PM7PERF-STILLPAGE-TOGGLE-TRACE-START (TB5 note): perf-still-page's "going still cost" row judged a fixed 1200 ms
// trace begun 400 ms before the nominal toggle. A still timer late under load (TB5 saw the mark after Tracing.end on
// 1-3 cells in each of four runs and in its old-code A/B) left the trace with no pm-still:on mark, so the row read
// restyled:null, unjudgeable. That window ends 800 ms after the nominal toggle; a toggle 900 ms late is outside it.
// The check now keeps the trace open until the page reports data-pm-still, then a settle for the recalc and its first
// frame. This runs that wait on a fake clock: the late toggle is outside the old fixed window and inside the wait.
// node tools/still-toggle-trace.selftest.mjs [perf-still-page.check.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
const m = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-still-page.check.mjs');
assert.equal(typeof m.waitStill, 'function', 'the check exports waitStill (the trace-open wait) for this self-test');

// a fake clock: the page goes still `flip` ms after the wait starts (the trace opened at after-400, so the old window
// ended at 1200 ms from it; the toggle at after+900 is 1300 ms in)
let clock = 0;
const now = () => clock;
const sleep = (ms) => { clock += ms; };
const stillAt = (flip) => async () => clock >= flip;

clock = 0;
const oldWindow = await m.waitStill(stillAt(1300), { waitMs: 1200, now, sleep });
assert.equal(oldWindow.saw, false, 'a toggle 900 ms after the nominal one is outside the old fixed 1200 ms window');

clock = 0;
const late = await m.waitStill(stillAt(1300), { waitMs: 9000, now, sleep });
assert.equal(late.saw, true, 'the trace held open for the still state contains the late toggle');
assert.equal(late.sawAfterMs, 1300, 'the wait returns as soon as the page reports still');
assert.equal(clock, 1600, 'and the trace stays open 300 ms more for the toggle\'s recalc and its first frame');

clock = 0;
const never = await m.waitStill(async () => false, { waitMs: 2000, now, sleep });
assert.equal(never.saw, false, 'a page that never reports still ends the wait at its cap');
assert.equal(clock, 2300, 'the cap plus the settle, so the caller can name the miss');

clock = 0;
const onTime = await m.waitStill(stillAt(0), { waitMs: 9000, now, sleep });
assert.equal(onTime.saw, true);
assert.equal(onTime.sawAfterMs, 0, 'an on-time toggle is seen at once');

// An invalid CLI value must fail before opening a page. Zero is a valid immediate check of the still state.
const viewportReached = new Error('viewport reached');
const runWithToggleWait = (toggleWait) => m.default({ args: { toggleWait }, viewport() { throw viewportReached; } });
for (const input of ['later', '-1', 'Infinity', '']) {
	await assert.rejects(runWithToggleWait(input), /toggleWait.*finite nonnegative/);
}
await assert.rejects(runWithToggleWait('0'), (err) => err === viewportReached);

// Reproduce the page-frame timeline from TB7 H4 even when the trace is still open at the idle deadline.
let still = false;
let pointerMove, onStillChange;
const window = { addEventListener(type, listener) { assert.equal(type, 'pointermove'); pointerMove = listener; } };
assert.equal(typeof m.installStillDeadline, 'function', 'the app frame must record the idle deadline independently of the trace');
runInNewContext(`(${m.installStillDeadline})()`, {
	window,
	document: { documentElement: { hasAttribute: () => still } },
	performance: { now },
	MutationObserver: class { constructor(callback) { onStillChange = callback; } observe() {} },
});
clock = 1000;
window.__armStillDeadline(6000);
pointerMove({ isTrusted: true });
clock = 7550; // The document is still now, but it missed the 7000 ms deadline.
still = true;
onStillChange();
assert.equal(window.__stillOnAt, 7550, 'the cost diagnostic keeps the observed toggle time');
assert.equal(window.__stillDeadline.still, false, 'a toggle during trace collection after the deadline cannot pass the idle row');

clock = 8000;
still = false;
window.__armStillDeadline(6000);
pointerMove({ isTrusted: true });
assert.equal(window.__stillOnAt, null, 'the next cell starts without a stale toggle time');
clock = 11000;
still = true;
onStillChange();
clock = 14550;
still = false;
onStillChange();
assert.equal(window.__stillDeadline.still, true, 'a later wake cannot erase a timely still state');

console.log('PASS the toggle trace is held open until the page reports still: a 900 ms-late toggle is outside the old 1200 ms window and inside the wait, the settle keeps the recalc and its frame, and a miss ends at its cap');
