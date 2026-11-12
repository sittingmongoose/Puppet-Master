// The replay of perf-warm-watch (helpers/warm-watch-replay.mjs) on hand-written PM_WARM.log rows: no browser.
// Lane C3, the R1 review of c42fb43fbe / f16653eede: the queue's note() sets its count of steady watches back to zero on
// an interval over the slow bar during an ADMISSION attempt, and admission attempts are not logged, so the replay still
// believed 16 steady watches stood and called the next, rightly watched, GPU step "needless" (a false failure under host
// load). The product's row now says so (watchReset: true, src/js/11-motion-start.js, PM_WARM's logStep) and the replay
// honours it. Each case is a log at 120 Hz (steady bar 25 ms, slow bar 40 ms) and what the replay must find.
// Run: node warm-watch-replay.selftest.mjs   (exit 1 on any failure)
import { replayWatch } from '../helpers/warm-watch-replay.mjs';

const HZ = 120;
let n = 0;
const step = (fm, more = {}) => { const i = n++; return { t: 400 * i, owner: 'glass', name: `step${i}`, frameMs: fm, outcome: 'ran', ...more }; };
const watched = (k) => Array.from({ length: k }, () => step([8, 8, 8]));
const log = (...parts) => { const rows = parts.flat(); n = 0; return rows; };

const CASES = [
	// the review's trigger: 16 clean watched GPU steps, then an admission attempt with a 60 ms frame (not a row: the
	// next row carries watchReset), then a clean watched GPU step, which the queue rightly watched
	['the review\'s trigger: an admission frame over the slow bar between the 16th and the 17th watched step',
		() => log(watched(16), step([8, 8, 8], { watchReset: true })), { needless: 0, early: 0 }],
	// controls: what the replay must still catch
	['control: the same 17 steps with no reset between them (the 17th watch was not needed)',
		() => log(watched(17)), { needless: 1, early: 0 }],
	['an unseen reset noted on a skipped row (no frameMs) just before the next watched step',
		() => log(watched(16), { t: 6390, owner: 'usage', name: 'gone', frameMs: null, outcome: 'skipped', watchReset: true }, step([8, 8, 8])), { needless: 0, early: 0 }],
	['control: a step logged watched: false right after an unseen reset (the watch was dropped while it was needed)',
		() => log(watched(16), step([8, 8], { watchReset: true, watched: false })), { needless: 0, early: 1 }],
	['after the reset 16 steady watches again, then one judged by its two intervals, then one watched needlessly',
		() => log(watched(16), step([8, 8, 8], { watchReset: true }), watched(15), step([8, 8], { watched: false }), step([8, 8, 8])), { needless: 1, early: 0 }],
	['control: after the reset only 15 steady watches, then one judged by its two intervals (dropped one step early)',
		() => log(watched(16), step([8, 8, 8], { watchReset: true }), watched(14), step([8, 8], { watched: false })), { needless: 0, early: 1 }]
];

let failed = 0;
for (const [name, make, want] of CASES) {
	const r = replayWatch(make(), HZ);
	const pass = r.needless.length === want.needless && r.early.length === want.early;
	if (!pass) failed++;
	console.log(`${pass ? 'PASS' : 'FAIL'} ${name}: needless ${r.needless.length} (want ${want.needless}), early ${r.early.length} (want ${want.early})${pass ? '' : ` ${JSON.stringify({ needless: r.needless, early: r.early })}`}`);
}
console.log(`${CASES.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
