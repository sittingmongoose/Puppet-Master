// The replay of perf-warm-watch (helpers/warm-watch-replay.mjs) on hand-written PM_WARM.log rows: no browser.
// Lane C3, the R1 review of c42fb43fbe / f16653eede: the queue's note() sets its count of steady watches back to zero on
// an interval over the slow bar during an ADMISSION attempt, and admission attempts are not logged, so the replay still
// believed 16 steady watches stood and called the next, rightly watched, GPU step "needless" (a false failure under host
// load). The product's row now says so (watchReset: true, src/js/11-motion-start.js, PM_WARM's logStep) and the replay
// honours it. Each case is a log at 120 Hz (steady bar 25 ms, slow bar 40 ms) and what the replay must find.
// Run: node warm-watch-replay.selftest.mjs   (exit 1 on any failure)
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { replayWatch } from '../helpers/warm-watch-replay.mjs';

const HZ = 120;
let n = 0;
const step = (fm, more = {}) => { const i = n++; return { t: 400 * i, owner: 'glass', name: `step${i}`, frameMs: fm, outcome: 'ran', ...more }; };
const watched = (k) => Array.from({ length: k }, () => step([8, 8, 8]));
const log = (...parts) => { const rows = parts.flat(); n = 0; return rows; };

// Keep the cadence fixture tied to the product: execute its own median/note/watch/log functions.
const product = readFileSync(new URL('../../../onboarding/opus-5.5/src/js/11-motion-start.js', import.meta.url), 'utf8');
const part = (a, b) => {
 const start = product.indexOf(a), end = product.indexOf(b, start);
 assert.ok(start >= 0 && end > start, 'product extraction boundaries exist');
 return product.slice(start, end);
};
function adaptiveRows() {
 const code = part('  const median = () => {', '  const pending = () =>') +
  part('  const logStep = (st,', '  const tell = (st,') +
  part('  const WATCH_KEEP = 16, STEADY_MS = 25;', '  /* the watch after a GPU step');
 return new Function('performance', `
  const warmDeltas = [], warmLog = [];
  let warmLateAt = 0, watchClean = 0, watchResets = 0, watchUnseen = false, warmD1 = 0, warmD2 = 0;
  ${code}
  for (let i = 0; i < 30; i++) note(30);
  for (let i = 0; i < 17; i++) {
   note(30); note(30); // admission on a loaded 120Hz host
   const st = { owner: 'gpu', name: 'step' + i, at: i * 400 };
   note(30); note(30);
   const fm = [30, 30];
   if (watching()) { for (let j = 0; j < 8; j++) note(30); fm.push(30); watched(fm); }
   else st.unwatched = true;
   logStep(st, 0, fm, false, 'ran');
  }
  return { counter: watchClean, median: median(), rows: warmLog };
 `)({ now: () => 100 });
}

const CASES = [
 ['product cadence 30ms with display sampled later at 120Hz: 16 watches then correctly unwatched', () => {
  const p = adaptiveRows();
  assert.equal(p.counter, 16); assert.equal(p.median, 30); assert.equal(p.rows.at(-1).watched, false);
  console.log(`product counter ${p.counter}, median ${p.median}, last ${JSON.stringify(p.rows.at(-1))}`);
  return p.rows;
 }, { needless: 0, early: 0 }],
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
