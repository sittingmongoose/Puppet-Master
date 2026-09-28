/* REVIEW-B surfaces for tests/pmx-verify.mjs (package REVIEW, DESIGN-SPEC 8.5 run view, G-13, G-26). Every state is
   reached through the recorded example (review-demo-start single | multi) and the real actions, never by writing
   state: Start Review in the sheet, the guide's Play, then the report's own controls.
   - the report (review:{runId}) for Multi-Pass (findings with Why / Proof / Suggested fix / You'll know it's fixed
     when, How they agreed, Still disagrees) and for Single Agent;
   - Plain text (the export, byte for byte), the evidence document (G-26), the report before it is ready (sealed
     notes, never dispositions), after Create To-Dos, and the Conversation, Team, Cost tabs and one reviewer's view. */
const CANON = ['Review', 'Multi-Pass Review'];
const tag = t => ['app', 'review', 'view'].concat(t || []);
const runId = h => h.ev(() => (window.PM56_REVIEW_DEMOS.snapshot() || {}).runId || null);
async function clickIn(h, sel) { const ok = await h.ev(s => { const b = document.querySelector(s); if (!b) return false; b.click(); return true; }, sel); if (!ok) throw new Error('not found: ' + sel); await h.wait(300); }
async function closeViews(h) { await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorTabs = []; c.state.activeEditor = null; c.state.editorRevealed = false; c.renderApp(); }); await h.closeAll(); }
async function started(h, flow) {
  await closeViews(h);
  await h.demo('review-demo-start', flow);
  await clickIn(h, '#pmOverlayRoot [data-action="collab-modal-commit"]:not([disabled])');
  await h.wait(500);
}
async function finished(h, flow) {
  await started(h, flow);
  await clickIn(h, '[data-action="review-demo-play"]');
  await h.page.waitForFunction(() => { const s = window.PM56_REVIEW_DEMOS.snapshot(); return s && window.PM56_COLLAB.run(s.runId).status === 'completed'; }, null, { timeout: 15000 });
  await h.wait(400);
}
async function report(h, then) {
  const id = await runId(h);
  await h.action('review-open-report', { run: id }); await h.wait(450);
  if (then) await then(h, id);
  await h.settle();
}
const view = (id, title, flow, then, o = {}) => ({
  id, title, kind: 'view', tags: tag(o.tags), canon: o.canon || CANON,
  async open(h) { await finished(h, flow); await report(h, then); },
  async after(h) { await closeViews(h); }
});
export default () => [
  view('review-view:report-multi', 'Review report, Multi-Pass: What they found, How they agreed, Still disagrees (8.5)', 'multi'),
  view('review-view:report-single', 'Review report, Single Agent: "Single pass", no agreement words or dots (8.5)', 'single', null, { canon: ['Review', 'Single Agent'] }),
  view('review-view:plain', 'Review report as Plain text: the export, byte for byte (8.5)', 'multi', async h => { await clickIn(h, '.review-document [data-action="review-report-view"][data-view="markdown"]'); }),
  view('review-view:evidence', 'Review evidence document: the exact version every reviewer read, line gutter (G-26)', 'multi', async h => { await clickIn(h, '.review-document [data-action="review-open-evidence"][data-evidence="source"]'); }, { canon: ['Review'] }),
  view('review-view:todos', 'Review report after Create To-Dos: "To-Do created" in place, Open To-Dos (8.5, G-13)', 'multi', async h => { await clickIn(h, '.review-document [data-action="collab-review-create-todos"]:not([disabled])'); await h.action('review-open-report', { run: await runId(h) }); await h.wait(300); }),
  view('review-view:team', 'Review run view, Team tab: reviewers with model and persona (4.4 D4)', 'multi', async h => { await clickIn(h, '.review-document [data-action="collab-panel-tab"][data-tab="participants"]'); }),
  view('review-view:conversation', 'Review run view, Conversation tab (4.4 D3)', 'multi', async h => { await clickIn(h, '.review-document [data-action="collab-panel-tab"][data-tab="transcript"]'); }),
  view('review-view:cost', 'Review run view, Cost tab (recorded example: no AI cost)', 'multi', async h => { await clickIn(h, '.review-document [data-action="collab-panel-tab"][data-tab="usage"]'); }),
  view('review-view:participant', 'One reviewer’s own messages (4.4 D5)', 'multi', async h => { await clickIn(h, '.review-document [data-action="collab-panel-tab"][data-tab="participants"]'); await clickIn(h, '.review-document [data-action="collab-open-participant"]'); }),
  { id: 'review-view:reading', title: 'Review run view before the report: reviewers reading on their own, sealed notes (REV-05)', kind: 'view', tags: tag(), canon: CANON,
    async open(h) { await started(h, 'multi'); const id = await runId(h); await h.action('collab-open-panel', { run: id }); await h.wait(450); await h.settle(); },
    async after(h) { await closeViews(h); } }
];
