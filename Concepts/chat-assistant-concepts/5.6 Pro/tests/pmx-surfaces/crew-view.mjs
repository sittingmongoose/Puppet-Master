/* CREW-B surfaces for tests/pmx-verify.mjs (package CREW, half B: DESIGN-SPEC 8.1 run view, 8.2 try-it evaluation,
   4.3 C27 guide; crew-view.js, crew-demo-batch5.js). Every state is reached through the recorded examples
   (crew-demo-start delegation | auto) and the real actions: Start Crew in the sheet, the protocol's own claim /
   deliver / finalize (the calls the demo's clock makes, here without its timer so a live state holds still), Open
   Panel (crew-open-work), the view's tabs, a team row, the view's More.
   - the Crew work document (crew-work:{runId}) live and finished: plate, The result, The team, The plan with a
     part's "What was asked · What came back · How it was checked" open, As it happens, the locked copy open;
   - Conversation, Team, one helper's own messages, Cost, the view's More row;
   - a Crew that Crew Auto brought in ("started by Crew Auto: this job splits into 2 parts (rules v1)");
   - the Crew Auto example's guide in the dock after two tries (the verdict line, no card).
   `canon` (A2-27a): the principle-10 names each state shows. */
const SHEET = '#pmOverlayRoot .pmx-sheet';
const tag = t => ['app', 'crew', 'crew-view'].concat(t || []);
async function clickIn(h, sel) { const ok = await h.ev(s => { const b = document.querySelector(s); if (!b) return false; b.click(); return true; }, sel); if (!ok) throw new Error('not found: ' + sel); await h.wait(300); }
async function closeViews(h) { await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorTabs = []; c.state.activeEditor = null; c.state.editorRevealed = false; c.renderApp(); }); await h.closeAll(); }
/* the recorded run, admitted through its own sheet, then moved to `stage` by the protocol calls the demo makes */
async function recorded(h, stage) {
  await closeViews(h);
  await h.demo('crew-demo-start', 'delegation');
  await clickIn(h, `${SHEET} [data-action="collab-modal-commit"]:not([disabled])`);
  await h.wait(400);
  return h.ev(stage => {
    const W = window.PM56_CREW, C = window.PM56_COLLAB;
    const r = C.runs().filter(r => W.owns(r.id)).at(-1);
    const env = () => ({ epoch: r.stopEpoch, sourceHash: r.crew.input.sourceHash });
    const claim = id => W.claim(r.id, id, env()), deliver = id => W.deliver(r.id, id, W.payload(r.id, id));
    const steps = { live: [() => claim('normalize'), () => claim('quoting'), () => deliver('normalize')],
      done: [() => claim('normalize'), () => claim('quoting'), () => deliver('normalize'), () => deliver('quoting'), () => claim('export'), () => deliver('export'), () => W.finalize(r.id, env())] }[stage] || [];
    const bad = steps.map(f => f()).find(x => !x.ok); if (bad) throw new Error('protocol step refused: ' + bad.error);
    window.PM56_EXT.ctx().renderApp();
    return r.id;
  }, stage);
}
async function openDoc(h, id, then) {
  await h.action('crew-open-work', { run: id }); await h.wait(450);
  if (then) await then(h, id);
  await h.settle();
}
const DOC = '.crew-work-document';
const view = (id, title, stage, then, o = {}) => ({
  id, title, kind: 'view', tags: tag(o.tags), canon: o.canon || ['Crew'],
  async open(h) { const run = await recorded(h, stage); await openDoc(h, run, then); },
  async after(h) { await closeViews(h); }
});
const openDisc = (sel) => async h => { await h.ev(s => { document.querySelectorAll(s).forEach(d => { if (!d.open) d.open = true; }); }, sel); await h.wait(250); };
export default () => [
  view('crew-view:summary-live', 'Crew run view, live: plate with working marks, The team, The plan (1 checked, 1 working, 1 waiting), As it happens (8.1)', 'live'),
  view('crew-view:summary-done', 'Crew run view, finished: The result, The plan with a part opened, the locked copy opened (8.1, G-26)', 'done',
    openDisc(`${DOC} details[data-crew-disclosure="normalize"], ${DOC} details.crew-work-source`)),
  view('crew-view:conversation', 'Crew run view, Conversation tab: 9.5 verbs, the protocol told plainly (4.4 D3)', 'done',
    async h => { await clickIn(h, `${DOC} [data-action="collab-panel-tab"][data-tab="transcript"]`); }),
  view('crew-view:team', 'Crew run view, Team tab: Coordinator line, helpers with model and persona (4.4 D4, G-30)', 'done',
    async h => { await clickIn(h, `${DOC} [data-action="collab-panel-tab"][data-tab="participants"]`); }),
  view('crew-view:participant', 'One helper’s own messages, Back to everyone (4.4 D5)', 'done',
    async h => { await clickIn(h, `${DOC} [data-action="collab-panel-tab"][data-tab="participants"]`); await clickIn(h, `${DOC} .collab-participant`); }),
  view('crew-view:cost', 'Crew run view, Cost tab: recorded example, no AI cost, per helper (9.1)', 'done',
    async h => { await clickIn(h, `${DOC} [data-action="collab-panel-tab"][data-tab="usage"]`); }),
  /* the frame's More row (collab-view.js): the Crew adds Run another Crew (crew-run-again, G-26) to it */
  view('crew-view:more', 'Crew run view with its More row open: Run another Crew, Run again with changes…, Download transcript disabled with its reason (A1-38)', 'done',
    async h => { await clickIn(h, `${DOC} [data-action="collab-view-toggle"][data-part="more"]`); if (!(await h.ev(d => !!document.querySelector(d + ' [data-action="crew-run-again"]'), DOC))) throw new Error('Run another Crew missing from the More row'); }),
  { id: 'crew-view:auto', title: 'A Crew that Crew Auto brought in, finished: "started by Crew Auto: this job splits into 2 parts (rules v1)"', kind: 'view', tags: tag(['auto']), canon: ['Crew'],
    async open(h) {
      await closeViews(h);
      await h.demo('crew-demo-start', 'auto');
      await clickIn(h, `${SHEET} [data-action="collab-modal-commit"]:not([disabled])`); await h.wait(500);
      for (const c of ['simple', 'single', 'parallel']) { await h.action('crew-demo-evaluate', { case: c }); await h.wait(300); }
      const run = await h.ev(() => (window.PM56_CREW_DEMOS.snapshot() || {}).runId);
      if (!run) throw new Error('Crew Auto admitted nothing');
      await h.action('crew-demo-play'); await h.page.waitForFunction(id => window.PM56_COLLAB.run(id).status === 'completed', run, { timeout: 15000 });
      await openDoc(h, run);
    },
    async after(h) { await closeViews(h); } },
  { id: 'crew-view:guide-auto', title: 'Crew Auto try-it evaluation in the dock guide after two tries: the verdict, no card (8.2, CREW-04)', kind: 'chat', tags: tag(['auto', 'guide']), canon: ['Crew Auto'],
    layouts: ['pinned', 'closed', 'w391', 'w311'],
    async open(h) {
      await closeViews(h);
      await h.demo('crew-demo-start', 'auto');
      await clickIn(h, `${SHEET} [data-action="collab-modal-commit"]:not([disabled])`); await h.wait(500);
      for (const c of ['simple', 'single']) { await h.action('crew-demo-evaluate', { case: c }); await h.wait(300); }
      await h.settle();
    },
    async after(h) { await h.closeAll(); } }
];
