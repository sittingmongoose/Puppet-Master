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

// R18-4 (PM7PERF-WARMWATCH-BAR-IN-STEP), from the product's own functions: 16 steady watches at 8 ms, fourteen 30 ms
// admission intervals (the window 16 x 8 + 14 x 30: median 8, slow bar 40), then a GPU step whose d1 is 60 ms. That
// interval resets the count against the 40 ms bar and moves the median to 30, so the row logs slowMs 90; the queue rightly
// watches the step. Ordinary 30 ms steps follow (16 watched, then unwatched).
function inStepRows() {
 const code = part('  const median = () => {', '  const pending = () =>') +
  part('  const logStep = (st,', '  const tell = (st,') +
  part('  const WATCH_KEEP = 16, STEADY_MS = 25;', '  /* the watch after a GPU step');
 return new Function('performance', `
  const warmDeltas = [], warmLog = [];
  let warmLateAt = 0, watchClean = 0, watchResets = 0, watchUnseen = false, warmD1 = 0, warmD2 = 0;
  ${code}
  const gpu = (i, d1, d2, w) => {
   const st = { owner: 'gpu', name: 'step' + i, at: i * 400 };
   note(d1); note(d2);
   const fm = [d1, d2];
   if (watching()) { for (let j = 0; j < 7; j++) note(w); fm.push(w); watched(fm); }
   else st.unwatched = true;
   logStep(st, 0, fm, false, 'ran');
  };
  for (let i = 0; i < 30; i++) note(8);
  for (let i = 0; i < 16; i++) { note(8); note(8); gpu(i, 8, 8, 8); }
  for (let i = 0; i < 14; i++) note(30);
  const before = { counter: watchClean, median: median(), bar: lateMs() };
  gpu(16, 60, 30, 30);
  const after = { counter: watchClean, median: median(), bar: lateMs(), resets: watchResets };
  for (let i = 17; i < 42; i++) { note(30); note(30); gpu(i, 30, 30, 30); }
  return { before, after, rows: warmLog };
 `)({ now: () => 100 });
}

// R53-C4: the slow bar can dip under both logged endpoint bars and recover before the row is written.
// Prime 30 intervals at 30 ms, then 16 watches whose rows are frameMs [30, 30, 30]. The last watch, after its
// d1 and d2, notes four more 30 ms intervals and fifteen 8 ms intervals (240 ms, the rest of the 300 ms watch;
// the worst of them is 30). That row is counter 16, median 30, slowMs 90, steadyMs 45. Two 8 ms admission
// intervals leave the counter at 16 and drop the median to 8, so the bar the next d1 meets is 40. That d1 is
// 45 ms, so the queue resets and watches; d2 is 16 and the watch is fifteen 16 ms intervals. The row logs
// frameMs [45, 16, 16], slowMs 48, steadyMs 25. min(90, 48) is not a lower bound on the bar d1 met.
function dipRows() {
 const code = part('  const median = () => {', '  const pending = () =>') +
  part('  const logStep = (st,', '  const tell = (st,') +
  part('  const WATCH_KEEP = 16, STEADY_MS = 25;', '  /* the watch after a GPU step');
 return new Function('performance', `
  const warmDeltas = [], warmLog = [];
  let warmLateAt = 0, watchClean = 0, watchResets = 0, watchUnseen = false, warmD1 = 0, warmD2 = 0;
  ${code}
  const gpu = (i, d1, d2, watch) => {
   const st = { owner: 'gpu', name: i === 16 ? 'last' : 'step' + i, at: i * 400 };
   const r0 = watchResets;
   note(d1, 1); note(d2, 2);
   let watchWorst = 0;
   const needs = watching();
   if (needs) {
    for (const w of watch) { note(w); if (w > watchWorst) watchWorst = w; }
    const fm = [d1, d2, watchWorst];
    watched(fm);
    logStep(st, 0, fm, false, 'ran');
   } else {
    st.unwatched = true;
    logStep(st, 0, [d1, d2], false, 'ran');
   }
   return { needs, resets: watchResets - r0, counter: watchClean, median: median(), bar: lateMs() };
  };
  for (let i = 0; i < 30; i++) note(30);
  for (let i = 0; i < 15; i++) gpu(i, 30, 30, [30]);
  const sixteenth = gpu(15, 30, 30, [30, 30, 30, 30, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
  const row16 = warmLog.at(-1);
  note(8); note(8);
  const admitted = { counter: watchClean, median: median(), bar: lateMs() };
  const last = gpu(16, 45, 16, [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
  return { sixteenth, row16, admitted, last, rows: warmLog };
 `)({ now: () => 100 });
}

// R58 T3-1, from the product: 16 steady watches at 8 ms, then a light chain's last step. The queue asks whether to
// watch after d1 only (8 ms: no) and notes d2 afterwards (unwatched(), 60 ms over the 40 ms bar), so the row is
// frameMs [8, 60], watched false, resetAt 2: the correct queue's record. The reset is for the steps that follow.
function lightLastRows() {
 const code = part('  const median = () => {', '  const pending = () =>') +
  part('  const logStep = (st,', '  const tell = (st,') +
  part('  const WATCH_KEEP = 16, STEADY_MS = 25;', '  /* the watch after a GPU step');
 return new Function('performance', `
  const warmDeltas = [], warmLog = [];
  let warmLateAt = 0, watchClean = 0, watchResets = 0, watchUnseen = false, warmD1 = 0, warmD2 = 0;
  ${code}
  const gpu = (i) => {
   const st = { owner: 'glass', name: 'step' + i, at: i * 400 };
   note(8, 1); note(8, 2);
   const fm = [8, 8];
   if (watching()) { for (let j = 0; j < 7; j++) note(8); fm.push(8); watched(fm); }
   else st.unwatched = true;
   logStep(st, 0, fm, false, 'ran');
  };
  for (let i = 0; i < 30; i++) note(8);
  for (let i = 0; i < 16; i++) { note(8); note(8); gpu(i); }
  note(8); note(8);
  const st = { owner: 'glass', name: 'light-last', at: 16 * 400, unwatched: true };
  note(8, 1);
  const needs = watching();
  note(60, 2);
  logStep(st, 0, [8, 60], false, 'ran');
  return { needs, counter: watchClean, rows: warmLog };
 `)({ now: () => 100 });
}
// R60-T3-C1 (PM7PERF-WARMWATCH-WATCH-RESET-LOST), from the product: 15 steady watches at 8 ms; fourteen 30 ms admission
// intervals and an admitted 8/8 pair leave the median at 8 and the slow bar at 40. The next step's d1 and d2 are 8 ms
// and its watch is [41, 30 x 9]: the 41 ms interval is over the 40 ms bar of that moment and resets the count, then
// the median rises to 30, so watched() counts the step against a 45 ms steady bar: the count is 1. The row records
// resetAt 0 (neither d1 nor d2 reset) and bars 40/25/40/25, steadyMs 45, slowMs 90: nothing in it names the reset.
function watchResetRows() {
 const code = part('  const median = () => {', '  const pending = () =>') +
  part('  const logStep = (st,', '  const tell = (st,') +
  part('  const WATCH_KEEP = 16, STEADY_MS = 25;', '  /* the watch after a GPU step');
 return new Function('performance', `
  const warmDeltas = [], warmLog = [];
  let warmLateAt = 0, watchClean = 0, watchResets = 0, watchUnseen = false, warmD1 = 0, warmD2 = 0;
  ${code}
  const gpu = (i, d1, d2, watch) => {
   const st = { owner: 'glass', name: 'step' + i, at: i * 400 };
   const r0 = watchResets;
   note(d1, 1); note(d2, 2);
   let watchWorst = 0;
   const needs = watching();
   if (needs) {
    for (const w of watch) { note(w); if (w > watchWorst) watchWorst = w; }
    const fm = [d1, d2, watchWorst];
    watched(fm);
    logStep(st, 0, fm, false, 'ran');
   } else {
    st.unwatched = true;
    logStep(st, 0, [d1, d2], false, 'ran');
   }
   return { needs, resets: watchResets - r0, counter: watchClean, median: median(), bar: lateMs() };
  };
  for (let i = 0; i < 30; i++) note(8);
  for (let i = 0; i < 15; i++) { note(8); note(8); gpu(i, 8, 8, [8, 8, 8, 8, 8, 8, 8]); }
  for (let i = 0; i < 14; i++) note(30);
  note(8); note(8);
  const before = { counter: watchClean, median: median(), bar: lateMs() };
  const hit = gpu(15, 8, 8, [41, 30, 30, 30, 30, 30, 30, 30, 30, 30]);
  const hitRow = warmLog.at(-1);
  note(30); note(30);
  const next = gpu(16, 30, 30, [30, 30, 30, 30, 30, 30, 30]);
  return { before, hit, hitRow, next, rows: warmLog };
 `)({ now: () => 100 });
}
// R62-C1, from the product: the slow bar can dip to its 40 ms floor INSIDE a watch and recover before the row is
// written, so no bar the row logs bounds it. 15 steady watches at 8 ms (36 watch intervals each); admission
// intervals [30 x 4, 8 x 14, 30 x 12] leave the count at 15, the median at 30 and the bar at 90. The next step's d1
// and d2 are 30 ms; its watch is [8, 8, 41, 30 x 7]: the two 8 ms intervals pull the median to 8 (bar 40), the 41 ms
// interval resets the count, the 30 ms ones bring the median back to 30. The row logs slow1 90, slow2 90, slowMs 90.
function watchDipRows() {
 const code = part('  const median = () => {', '  const pending = () =>') +
  part('  const logStep = (st,', '  const tell = (st,') +
  part('  const WATCH_KEEP = 16, STEADY_MS = 25;', '  /* the watch after a GPU step');
 return new Function('performance', `
  const warmDeltas = [], warmLog = [];
  let warmLateAt = 0, watchClean = 0, watchResets = 0, watchUnseen = false, warmD1 = 0, warmD2 = 0;
  ${code}
  const gpu = (i, d1, d2, watch) => {
   const st = { owner: 'glass', name: 'step' + i, at: i * 400 };
   const r0 = watchResets;
   note(d1, 1); note(d2, 2);
   let watchWorst = 0;
   const needs = watching();
   if (needs) {
    for (const w of watch) { note(w); if (w > watchWorst) watchWorst = w; }
    const fm = [d1, d2, watchWorst];
    watched(fm);
    logStep(st, 0, fm, false, 'ran');
   } else {
    st.unwatched = true;
    logStep(st, 0, [d1, d2], false, 'ran');
   }
   return { needs, resets: watchResets - r0, counter: watchClean, median: median(), bar: lateMs() };
  };
  const rep = (v, k) => Array.from({ length: k }, () => v);
  for (let i = 0; i < 30; i++) note(8);
  for (let i = 0; i < 15; i++) gpu(i, 8, 8, rep(8, 36));
  for (const d of [...rep(30, 4), ...rep(8, 14), ...rep(30, 12)]) note(d);
  const before = { counter: watchClean, median: median(), bar: lateMs() };
  const hit = gpu(15, 30, 30, [8, 8, 41, ...rep(30, 7)]);
  const hitRow = warmLog.at(-1);
  const next = gpu(16, 30, 30, rep(30, 8));
  return { before, hit, hitRow, next, rows: warmLog };
 `)({ now: () => 100 });
}
// hand-written rows that carry the per-interval fields (120 Hz, median 8: slow bar 40, steady bar 25)
const X = { steadyMs: 25, slowMs: 40, slow1: 40, steady1: 25, slow2: 40, steady2: 25, resetAt: 0 };
const exact = (k) => watched(k).map((r) => ({ ...r, ...X }));
const Y = { steadyMs: 45, slowMs: 90, slow1: 90, steady1: 45, slow2: 90, steady2: 45, resetAt: 0 };

const CASES = [
 ['R18-4 from the product: a d1 over the 40 ms bar resets the count inside the step that then logs a 90 ms bar', () => {
  const p = inStepRows();
  assert.deepEqual([p.before.counter, p.before.median, p.before.bar], [16, 8, 40], 'before the step: 16 watches, median 8, bar 40');
  assert.equal(p.rows[16].watched, undefined, 'the queue watched the 60 ms step');
  assert.deepEqual([p.rows[16].frameMs, p.rows[16].slowMs], [[60, 30, 30], 90], 'and its row logs the later 90 ms bar');
  assert.equal(p.rows.at(-1).watched, false, '16 steady 30 ms watches later the watch is dropped');
  console.log(`product before ${JSON.stringify(p.before)}, after the 60 ms step ${JSON.stringify(p.after)}, row ${JSON.stringify(p.rows[16])}`);
  return p.rows;
 }, { needless: 0, early: 0 }],
	// control for it: the bar moved inside the step but every interval stayed under both bars, the count stood at 16, and
	// the step was watched: needless, and still caught
	['control: a bar that moved from 40 to 90 inside a watched step whose intervals met neither (the watch was not needed)',
		() => log(watched(16).map((r) => ({ ...r, steadyMs: 25, slowMs: 40 })), step([30, 30, 30], { steadyMs: 45, slowMs: 90 })), { needless: 1, early: 0 }],
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
		() => log(watched(16), step([8, 8, 8], { watchReset: true }), watched(14), step([8, 8], { watched: false })), { needless: 0, early: 1 }],
	['R53-C4 from the product: a slow bar that dips to 40 between the logged 90 and 48 makes the 45 ms d1 reset the count, so the watch was required', () => {
		const p = dipRows();
		assert.deepEqual([p.row16.frameMs, p.row16.slowMs, p.row16.steadyMs], [[30, 30, 30], 90, 45], 'the 16th watch logs the endpoint bars 90 and 45');
		assert.deepEqual([p.sixteenth.counter, p.sixteenth.median], [16, 30], 'and the count stands at 16 on a median of 30');
		assert.deepEqual([p.admitted.counter, p.admitted.median, p.admitted.bar], [16, 8, 40], 'two 8 ms admission intervals leave the count at 16 and the real bar at 40');
		assert.equal(p.last.needs, true, '45 ms is over that 40 ms bar, so the queue watches');
		assert.equal(p.last.resets, 1);
		assert.equal(p.rows.at(-1).watched, undefined, 'the step was watched');
		assert.deepEqual([p.rows.at(-1).frameMs, p.rows.at(-1).slowMs, p.rows.at(-1).steadyMs], [[45, 16, 16], 48, 25]);
		assert.equal(p.rows.at(-1).resetAt, 1, 'd1 is the interval that reset the count');
		assert.deepEqual([p.rows.at(-1).slow1, p.rows.at(-1).steady1, p.rows.at(-1).slow2, p.rows.at(-1).steady2], [40, 25, 40, 25], 'the bars d1 and d2 were judged against, under both endpoint bars');
		console.log(`product admitted ${JSON.stringify(p.admitted)}, last ${JSON.stringify(p.last)}, row ${JSON.stringify(p.rows.at(-1))}`);
		return p.rows;
	}, { needless: 0, early: 0 }],
	// an old log has no slow1/steady1/slow2/steady2/resetAt. The 60 ms d1 is over the previous row's 40 ms bar and
	// under this row's 90, so only the bracket keeps it from being called needless.
	['old log: a bar that rose from 40 to 90 inside a step, with no per-interval fields, is still judged by the bracket',
		() => {
			const rows = log(watched(16).map((r) => ({ ...r, steadyMs: 25, slowMs: 40 })), step([60, 30, 30], { steadyMs: 45, slowMs: 90 }));
			if (rows.some((r) => r.slow1 != null || r.resetAt != null)) throw new Error('this case is an old log');
			return rows;
		}, { needless: 0, early: 0 }],
	['R58 T3-1 from the product: a light chain\'s last step is asked after d1 only, so its slow d2 on an unwatched row is not a dropped watch', () => {
		const p = lightLastRows();
		assert.equal(p.needs, false, 'after an 8 ms d1 and 16 steady watches the queue does not watch');
		assert.deepEqual([p.rows.at(-1).frameMs, p.rows.at(-1).watched, p.rows.at(-1).resetAt, p.rows.at(-1).slow2], [[8, 60], false, 2, 40], 'the row: d2 over its 40 ms bar, unwatched, reset at interval 2');
		assert.equal(p.counter, 0, 'and the count is back to zero for the steps that follow');
		console.log(`product row ${JSON.stringify(p.rows.at(-1))}`);
		return p.rows;
	}, { needless: 0, early: 0 }],
	['control: the step after that d2 reset is logged unwatched (the reset made the watch needed again)', () => {
		const p = lightLastRows();
		return [...p.rows, { t: 99999, owner: 'glass', name: 'after', frameMs: [8, 8], outcome: 'ran', ...X, watched: false }];
	}, { needless: 0, early: 1 }],
	['control: an unwatched step whose d1 reset the count (either kind of step is watched after that)',
		() => log(exact(16), step([60, 8], { ...X, resetAt: 1, watched: false })), { needless: 0, early: 1 }],
	['R58 T3-2: a reset flag its own bar contradicts (resetAt 1 on a 10 ms interval, bar 40) does not excuse a watch after 16 steady ones',
		() => log(exact(16), step([10, 8, 8], { ...X, resetAt: 1 })), { needless: 1, early: 0 }],
	['control: the same flag on an interval that did reach its bar (39 ms, within the 1 ms rounding) is a reset',
		() => log(exact(16), step([39, 8, 8], { ...X, resetAt: 1 })), { needless: 0, early: 0 }],
	['R60-T3-C1 from the product: a watch interval over the slow bar of its moment reset the count, so the next watch was required', () => {
		const p = watchResetRows();
		assert.deepEqual([p.before.counter, p.before.median, p.before.bar], [15, 8, 40], 'before the step: 15 watches, median 8, bar 40');
		assert.deepEqual([p.hit.needs, p.hit.resets, p.hit.counter], [true, 1, 1], 'the 41 ms watch interval resets the count; the step then counts as the first steady watch');
		assert.deepEqual([p.hitRow.frameMs, p.hitRow.resetAt, p.hitRow.slow1, p.hitRow.slow2, p.hitRow.steadyMs, p.hitRow.slowMs], [[8, 8, 41], 0, 40, 40, 45, 90], 'and its row names no reset');
		assert.equal(p.next.needs, true, 'the next step is watched: the count is 2, not 16');
		console.log(`product hit ${JSON.stringify(p.hit)}, row ${JSON.stringify(p.hitRow)}, next ${JSON.stringify(p.next)}`);
		return p.rows;
	}, { needless: 0, early: 0 }],
	['R62-C1 from the product: the slow bar dips to its 40 ms floor inside the watch and recovers; no logged bar shows it', () => {
		const p = watchDipRows();
		assert.deepEqual([p.before.counter, p.before.median, p.before.bar], [15, 30, 90], 'before the step: 15 watches, median 30, bar 90');
		assert.deepEqual([p.hit.needs, p.hit.resets, p.hit.counter], [true, 1, 1], 'the 41 ms watch interval met a 40 ms bar and reset the count');
		assert.deepEqual([p.hitRow.frameMs, p.hitRow.resetAt, p.hitRow.slow1, p.hitRow.slow2, p.hitRow.steadyMs, p.hitRow.slowMs], [[30, 30, 41], 0, 90, 90, 45, 90], 'and every bar the row logs is 90');
		assert.deepEqual([p.next.needs, p.next.counter], [true, 2], 'the next step is watched: the count is 2');
		console.log(`product hit ${JSON.stringify(p.hit)}, row ${JSON.stringify(p.hitRow)}`);
		return p.rows;
	}, { needless: 0, early: 0 }],
	['control: 17 steady watches on rows that carry the fields (the 17th was not needed)',
		() => log(exact(17)), { needless: 1, early: 0 }],
	['control: a watch whose worst frame stays under every slow bar the row knows keeps the count (15 + [8, 8, 30] under bars 40, then one more is needless)',
		() => log(exact(15), step([8, 8, 30], { ...X, steadyMs: 45, slowMs: 90 }), step([30, 30, 30], { steadyMs: 45, slowMs: 90, slow1: 90, steady1: 45, slow2: 90, steady2: 45, resetAt: 0 })), { needless: 1, early: 0 }],
	// R59 C1 (PM7PERF-WARMWATCH-BARS-TRUSTED): the product's slow bar is max(40, 3 x median), so a row
	// logging slow1 1 is impossible metadata. Believed, its resetAt 1 reads the on-time 8 ms d1 as a reset
	// and excuses the 17th watch after 16 steady ones; the row must fall to the bracket path, as a row
	// without the fields does, and the watch reads as needless.
	['R59 C1: a row logging an impossible slow bar (slow1 1, under the 40 ms floor) cannot excuse a needless watch',
		() => log(exact(16), step([8, 8, 8], { ...X, slow1: 1, resetAt: 1 })), { needless: 1, early: 0 }],
	// control: the floors themselves are legitimate product bars (median 8 at 120 Hz). Bars exactly 40 / 25
	// stay an exact row: d1 40 meets its bar without exceeding it, resetAt 0, so the 17th watch after 16
	// steady ones is needless. The bracket path would not say so (40 is not under slowLo - 1).
	['control: bars exactly at the floors (40 / 25) are still an exact row (d1 40, resetAt 0, the 17th watch needless)',
		() => log(exact(16), step([40, 8, 8], { ...X })), { needless: 1, early: 0 }],
	// the steady floor holds the same way: the steady bar is max(25, 1.5 x median), so steady1 1 is
	// impossible and the row is not exact. Bracketed, its 40 ms d1 clears the count: no needless watch.
	['R59 C1: a row logging an impossible steady bar (steady1 1, under the 25 ms floor) is not exact either',
		() => log(exact(16), step([40, 8, 8], { ...X, steady1: 1 })), { needless: 0, early: 0 }],
	// R74 C1 (PM7PERF-WARMWATCH-ABOVE-FLOOR-BARS): 50 is above the 40 ms floor, so the floor rule trusts the
	// claimed slow1 50 / resetAt 1 and excuses the 17th watch. But the product computes both bars from one shared
	// median (note(): slow = max(40, 3m), steady = max(25, 1.5m)): slow1 50 implies m 16.7 and steady1 25, not 45.
	// The pair no median can produce is impossible metadata; the row must fall to the bracket path against its own
	// 90 ms bar, where the 60 ms d1 resets nothing and the 17th watch is needless.
	['R74 C1: an above-floor but impossible bar pair (slow1 50 with steady1 45) cannot excuse a needless watch',
		() => log(Array.from({ length: 16 }, () => step([30, 30, 30], { ...Y })), step([60, 30, 30], { ...Y, slow1: 50, resetAt: 1 })), { needless: 1, early: 0 }],
	// R74's own control: the same final row restored to slow1 90 / resetAt 0 is one needless watch
	['R74 C1 control: the same row with slow1 90 and resetAt 0 is a needless watch',
		() => log(Array.from({ length: 16 }, () => step([30, 30, 30], { ...Y })), step([60, 30, 30], { ...Y })), { needless: 1, early: 0 }],
	// a valid non-floor pair keeps its exact reset: slow1 50 with steady1 25 is m 16.7, and the 60 ms d1 is over 50
	['R74 C1 control: a valid above-floor pair (slow1 50, steady1 25) keeps its real reset',
		() => log(Array.from({ length: 16 }, () => step([30, 30, 30], { ...Y })), step([60, 30, 30], { ...Y, slow1: 50, steady1: 25, resetAt: 1 })), { needless: 0, early: 0 }]
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
