// Check-side observation of the real closed-over board callback, not a reconstruction of its style writes.
// Normal mode forwards every RAF unchanged. Control mode parks only Usage's third prewarm step until still goes on.
export const installPrewarmProbe = ({ park = false } = {}) => {
 if (window.__stillPrewarm) return;
 const original = window.requestAnimationFrame;
 const jobs = new WeakMap(), claimed = new WeakSet();
 const state = window.__stillPrewarm = { label: '', runs: [], forced: [], errors: [], parked: null, parkNext: park, forceOnStill: false };
 const run = (fn, job, ts, forced = false) => {
  job.steps++;
  performance.mark(`pm-still:prewarm:${forced ? 'forced' : 'step'}:${job.id}:${job.steps}`);
  if (forced) state.forced.push({ id: job.id, stage: job.steps, at: performance.now() });
  try { fn(ts); } catch (e) { state.errors.push(String(e)); throw e; }
  if (!job.root.isConnected) { job.complete = true; job.finishedAt = performance.now(); }
 };
 window.requestAnimationFrame = function (fn) {
  if (typeof fn !== 'function' || fn.name !== 'step') return original.call(window, fn);
  const text = typeof fn === 'function' ? Function.prototype.toString.call(fn) : '';
  if (!text.includes('prewarmEl !== host') || !text.includes('requestAnimationFrame(step)')) return original.call(window, fn);
  let job = jobs.get(fn);
  if (!job) {
   const root = [...document.querySelectorAll('[data-pmu-prewarm]')].find((el) => !claimed.has(el));
   if (!root) return original.call(window, fn);
   claimed.add(root);
   job = { id: state.runs.length + 1, look: state.label, usage: !!root.closest('#pmuBoard'), root, steps: 0, complete: false, startedAt: performance.now() };
   jobs.set(fn, job); state.runs.push(job);
  }
  if (job.usage && state.parkNext && job.steps === 2) {
   state.parked = { id: job.id, stage: 3, fn, job }; state.parkNext = false;
   return 0; // This callback is invoked once by the control observer, never scheduled twice.
  }
  return original.call(window, (ts) => run(fn, job, ts));
 };
 const observer = new MutationObserver(() => {
  if (!state.forceOnStill || !document.documentElement.hasAttribute('data-pm-still')) return;
  state.forceOnStill = false;
  const p = state.parked; state.parked = null;
  if (!p) { state.errors.push('no parked prewarm callback at the still mark'); return; }
  run(p.fn, p.job, performance.now(), true);
 });
 observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-pm-still'] });
 state.snapshot = () => ({ runs: state.runs.map(({ root, ...x }) => ({ ...x, connected: root.isConnected })), forced: state.forced, errors: state.errors,
  parked: state.parked ? { id: state.parked.id, stage: state.parked.stage } : null });
 state.dispose = () => {
  observer.disconnect(); window.requestAnimationFrame = original;
  const p = state.parked; state.parked = null;
  if (p) original.call(window, p.fn); // Let the real finite sequence finish if a control was interrupted.
  delete window.__stillPrewarm;
 };
};

// Uses DOM attributes and the probe's counters only; it does not enumerate animations or resolve pending style.
export const prewarmSnapshot = () => window.__stillPrewarm?.snapshot() || null;

// Consume, never cancel, the once-per-board/look rehearsal. The source cache is set before its first RAF and is not
// reset by an idle interval or revisit. The counter assertion also exposes any repetition on a resting page.
export async function consumeUsagePrewarm(t, f, look) {
 // A visit renews the native scheduler's finite busy-retry round, even when the previous cell was Usage. The first
 // arrival may spend that round before its film/build is ready. A second ordinary visit can admit the still-unspent
 // rehearsal; no measured toggle has started and no cost is resampled. Real input keeps this setup visit awake.
 let completed = false, pointer = 0;
 const move = () => t.page.mouse.move(1914, 900 + (++pointer % 6) * 8);
 for (let attempt = 0; attempt < 2 && !completed; attempt++) {
  await move(); await f.evaluate(() => PM_PAGES.go('dashboard'));
  await f.waitForFunction(() => document.querySelector('#panel-dashboard')?.classList.contains('active') && !document.querySelector('#panel-usage')?.classList.contains('active'));
  await t.page.waitForTimeout(1500);
  await move(); await f.evaluate((label) => { window.__stillPrewarm.label = label; PM_PAGES.go('usage'); }, look);
  await f.waitForFunction(() => document.querySelector('#panel-usage')?.classList.contains('active'));
  const until = Date.now() + 45000;
  while (Date.now() < until) {
   const s = await f.evaluate(prewarmSnapshot);
   completed = s.runs.some((r) => r.usage && r.look === look && r.complete && r.steps === 6);
   if (completed) break;
   await move(); await t.page.waitForTimeout(750);
  }
  if (!completed) t.log(`${look} PREWARM setup visit ${attempt + 1} ended without a rehearsal: ${JSON.stringify(await f.evaluate(prewarmSnapshot))}`);
 }
 const snapshot = await f.evaluate(prewarmSnapshot);
 const runs = snapshot.runs.filter((r) => r.usage && r.look === look);
 t.log(`${look} PREWARM CONSUMED: ${JSON.stringify(snapshot)}`);
 await t.check(`${look}: Usage's once-per-look prewarm completes before measured toggle cells`, completed && runs.length === 1 && snapshot.errors.length === 0,
  JSON.stringify(runs));
 if (!completed || runs.length !== 1 || snapshot.errors.length) throw new Error(`${look}: prewarm isolation was not established; no toggle cells may be measured`);
 return snapshot;
}
