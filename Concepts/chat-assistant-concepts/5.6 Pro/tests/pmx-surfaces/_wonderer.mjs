/* Shared steps for the BrainStorm Wonderer surfaces (storm.mjs, storm-view.mjs), DL-218 and the steer of 2026-10-20.
   The recorded 'leads' example (lens-wonderer-batch13.js) runs on its own clock: Grill Me questions you first, the
   Wonderer's first pass runs during intake and is held until every blind proposal is in, the Coordinator records each
   lead's decision as it arrives, a second pass queues behind the debate, and a last pass at the vote makes Write the
   plan wait. Nothing here writes run state: the surfaces answer the rounds, press Confirm, press Check it or Pause, and
   wait for the recording. PM56_CLOCK runs the recording faster while a surface opens (it is the clock the film tool
   slows), and is put back to 1 before the lint looks. */
export const RUN = () => window.PM56_BATCH13 && window.PM56_BATCH13.currentRun();
/* the Ask Card re-renders as rounds open and close, so a handle can go stale between finding and clicking it */
async function tryClick(h, sel) { try { return await h.clickVisible(sel); } catch (_) { return false; } }
export async function fast(h, k) { await h.ev(k => window.PM56_CLOCK && window.PM56_CLOCK.setScale(k), k); }
export async function until(h, fn, arg, ms = 60000) { await h.page.waitForFunction(fn, arg, { timeout: ms }); }
/* answer every grilling round with its recommended answers, then Confirm What we agreed */
export async function grill(h, ms = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await tryClick(h, '.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await h.wait(400); return; }
    if (await tryClick(h, '.qs-grill [data-action="qs-accept-round"]')) { await h.wait(900); continue; }
    await h.wait(300);
  }
  throw new Error('Grill Me never reached What we agreed');
}
/* start the recorded BrainStorm with the Wonderer and Grill Me; confirm: answer and Confirm (default), or stop at the
   first open round */
export async function wondererRun(h, { confirm = true, scale = 6 } = {}) {
  await h.closeAll();
  await fast(h, scale);
  await h.action('b13-start', { flow: 'leads' }); await h.wait(700);
  if (!(await h.clickVisible('#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('no Start on the BrainStorm sheet');
  await h.wait(500);
  if (confirm) await grill(h);
  else await until(h, () => !!document.querySelector('.qs-grill [data-action="qs-accept-round"]'), null, 20000);
  return h.ev(() => window.PM56_BATCH13.currentRun().id);
}
/* the run to its end: the last pass decided and back from research, Write the plan ready; checkLead: press Check it on
   that lead at the vote, from the guide */
export async function toWrite(h, { checkLead = false } = {}) {
  if (checkLead) {
    /* the guide offers Check it for a moment at the vote; real time there, so the offer is still up when it is pressed */
    await until(h, () => { const r = window.PM56_BATCH13.currentRun(); return !!r && r.brainstorm.phase === 'vote'; }, null, 90000);
    await fast(h, 1);
    await until(h, () => !!document.querySelector('.b13-guide [data-action="wg-check-it"]'), null, 20000);
    if (!(await tryClick(h, '.b13-guide [data-action="wg-check-it"]'))) throw new Error('no Check it in the guide');
    await until(h, () => window.PM56_BATCH13.currentRun().wonderer.leads.some(l => l.checkedByUser), null, 5000);
    await fast(h, 6);
  }
  await until(h, () => { const r = window.PM56_BATCH13.currentRun(); return !!r && r.wonderer.corePlayback.status === 'completed' && window.PM56_WONDERER.gateState(r).ok; }, null, 90000);
  if (checkLead) await until(h, () => { const r = window.PM56_BATCH13.currentRun(); return r.wonderer.leads.some(l => l.checkedByUser && l.research && /supported/.test(l.research.status)); }, null, 30000);
  await fast(h, 1);
}
/* pause the run once fn(run) holds, so a passing state holds still for the lint */
export async function pauseWhen(h, fn) {
  await until(h, src => { const r = window.PM56_BATCH13.currentRun(); return !!r && (0, eval)('(' + src + ')')(r); }, fn.toString(), 90000);
  const run = await h.ev(() => window.PM56_BATCH13.currentRun().id);
  await h.action('collab-pause', { run }); await h.wait(300);
  await fast(h, 1);
  return run;
}
export async function leave(h) {
  await fast(h, 1);
  await h.ev(() => { const c = window.PM56_EXT.ctx(); for (const t of [...(c.state.editorTabs || [])]) c.closeEditor(t.id || t); c.state.editorRevealed = false; c.renderApp(); });
  await h.closeAll();
}
/* the reduced-motion census's state change: one re-render of what is on screen (the default would replay the whole
   recording, clicks and hovers included, while the census watches) */
export const QUIET_CHANGE = async h => { await h.ev(() => window.PM56_EXT.ctx().renderApp()); };
