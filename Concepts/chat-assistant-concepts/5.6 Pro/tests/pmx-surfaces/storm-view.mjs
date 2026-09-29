/* STORM-B surfaces for tests/pmx-verify.mjs (DESIGN-SPEC 8.4 run view, G-26 evidence and Wonderer workspace).
   Each state is reached through the recorded examples' own controls (Start on the sheet, Play, Open Panel, the view's
   tabs), never by writing state:
   - storm:view-synthesis   How they decided, ready to write the plan (options, dissent, votes, debate, sources);
   - storm:view-constraint  the rule-beats-vote example: a ruled-out option with its backers kept as dissent;
   - storm:view-done        after Write the plan: "Plan ready", Open Plan (the one Plan is plans.js's);
   - storm:view-team / storm:view-conversation / storm:view-participant  the common tabs as BrainStorm renders them;
   - storm:evidence         the evidence document (G-26), "Source used in this BrainStorm · recorded example";
   - storm:wonderer         Wonderer's ideas (G-26) with the core round played and one idea checked;
   - storm:wonderer-chat    the Wonderer receipt in the transcript (ledger grammar) and the guide at its first step;
   - storm:view-wonderer-wait  the run view while Wonderer's ideas still need a decision ("Decide on Wonderer's 3 ideas
                            first", [Open Wonderer's ideas]; never "Ready" over a dead primary);
   - storm:wonderer-guide   the Wonderer guide after one idea is decided ("2 ideas left. Decide on each: ...");
   - storm:guide-failed     a rejected recorded step: the guide's failed sentence + Replay beside the card's failed face.
                            A rejected step cannot be reached through the controls, so this one surface makes the
                            protocol's normalize refuse (page-side stub, restored in after()).
   `canon` (A2-27a): the principle-10 names each state shows. */
const DOC = '.bs-document';
async function startRecording(h, flow) {
  await h.closeAll();
  await h.demo('brainstorm-demo-start', flow);
  if (!(await h.clickVisible('#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('no Start on the BrainStorm sheet');
  await h.wait(500);
  await h.action('brainstorm-demo-play');
  await h.page.waitForFunction(() => { const s = window.PM56_BRAINSTORM_DEMOS.snapshot(); const r = s && window.PM56_COLLAB.run(s.runId); return !!(r && r.brainstorm.phase === 'synthesis'); }, null, { timeout: 30000 });
  return h.ev(() => window.PM56_BRAINSTORM_DEMOS.snapshot().runId);
}
async function openView(h, run) { await h.action('brainstorm-open-results', { run }); await h.wait(300); await h.settle(); }
async function tab(h, name) { if (!(await h.clickVisible(`${DOC} [data-action="collab-panel-tab"][data-tab="${name}"]`))) throw new Error('no tab ' + name); await h.wait(250); await h.settle(); }
const leave = async h => { await h.ev(() => { const c = window.PM56_EXT.ctx(); for (const t of [...(c.state.editorTabs || [])]) c.closeEditor(t.id || t); c.state.editorRevealed = false; c.renderApp(); }); await h.closeAll(); };
function view(id, title, then, extra = {}) {
  return Object.assign({ id, title, kind: 'view', tags: ['app', 'storm', 'view'], canon: extra.canon || ['BrainStorm'],
    async open(h) { const run = await startRecording(h, extra.flow || 'synthesis'); await openView(h, run); if (then) await then(h, run); await h.settle(); },
    async after(h) { await leave(h); } }, extra);
}
async function wondererRun(h) {
  await h.closeAll();
  await h.action('b13-start', { flow: 'leads' }); await h.wait(900);
  if (!(await h.clickVisible('#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('no Start on the BrainStorm sheet');
  await h.wait(500);
}
export default () => [
  view('storm:view-synthesis', 'BrainStorm run view, How they decided: ready to write the plan (8.4)', null),
  view('storm:view-constraint', 'BrainStorm run view: a rule beats the vote, the ruled-out option and its backers kept', null, { flow: 'constraint' }),
  view('storm:view-done', 'BrainStorm run view after Write the plan: Plan ready, Open Plan', async (h, run) => {
    await h.action('collab-brainstorm-synthesize', { run }); await h.wait(400); await openView(h, run);
  }),
  view('storm:view-team', 'BrainStorm run view, Team tab (core team, then specialists)', async h => { await tab(h, 'participants'); }),
  view('storm:view-conversation', 'BrainStorm run view, Conversation tab (protocol messages as people say them, G-33)', async h => { await tab(h, 'transcript'); }),
  view('storm:view-participant', 'BrainStorm run view, one helper’s own messages (D5)', async h => {
    await tab(h, 'participants');
    if (!(await h.clickVisible(`${DOC} .collab-participant`))) throw new Error('no team row'); await h.wait(250);
  }),
  view('storm:evidence', 'BrainStorm evidence document (G-26)', async h => {
    await tab(h, 'overview');
    await h.ev(() => { const d = document.querySelector('.bs-document details[data-bs-section="evidence"]'); if (d) d.open = true; }); await h.wait(150);
    if (!(await h.clickVisible(`${DOC} [data-action="brainstorm-open-evidence"]`))) throw new Error('no source link'); await h.wait(300);
  }),
  { id: 'storm:wonderer', title: 'Wonderer’s ideas (G-26): the core round played, one idea checked', kind: 'view', tags: ['app', 'storm', 'view', 'wonderer'], canon: ['Wonderer', 'BrainStorm'],
    async open(h) {
      await wondererRun(h);
      await h.clickVisible('[data-action="b13-open"]'); await h.wait(300);
      await h.clickVisible('[data-action="b13-core"]');
      await h.clickVisible('[data-action="b13-research"][data-lead="fence"]');
      await h.page.waitForFunction(() => { const r = window.PM56_BATCH13.currentRun(); return r && r.wonderer.leads[0].state === 'researched' && r.wonderer.corePlayback.status === 'completed'; }, null, { timeout: 20000 });
      await h.settle();
    },
    async after(h) { await leave(h); } },
  { id: 'storm:wonderer-chat', title: 'The Wonderer receipt in the chat (ledger grammar, G-26)', kind: 'chat', tags: ['app', 'storm', 'chat', 'wonderer'], canon: ['Wonderer'], roots: '.b13-entry, .b13-guide',
    async open(h) { await wondererRun(h); await h.settle(); },
    async after(h) { await leave(h); } },
  { id: 'storm:view-wonderer-wait', title: 'BrainStorm run view while Wonderer’s ideas wait for a decision', kind: 'view', tags: ['app', 'storm', 'view', 'wonderer'], canon: ['BrainStorm', 'Wonderer'],
    async open(h) {
      await wondererRun(h);
      await h.clickVisible('[data-action="b13-open"]'); await h.wait(300);
      await h.clickVisible('[data-action="b13-core"]');
      await h.page.waitForFunction(() => { const r = window.PM56_BATCH13.currentRun(); return r && r.wonderer.corePlayback.status === 'completed'; }, null, { timeout: 20000 });
      const run = await h.ev(() => window.PM56_BATCH13.currentRun().id);
      await openView(h, run);
    },
    async after(h) { await leave(h); } },
  { id: 'storm:wonderer-guide', title: 'The Wonderer guide mid-way (one idea decided, two left)', kind: 'chat', tags: ['app', 'storm', 'chat', 'wonderer'], canon: ['Wonderer'], roots: '.b13-guide',
    async open(h) {
      await wondererRun(h);
      await h.clickVisible('[data-action="b13-open"]'); await h.wait(300);
      await h.ev(() => { const t = document.querySelector('[data-lead-id="fallback"] textarea'); t.value = 'I choose a reversible rollout.'; t.dispatchEvent(new Event('input', { bubbles: true })); });
      await h.clickVisible('[data-action="b13-decide"][data-lead="fallback"][data-kind="user_decided"]'); await h.wait(300);
      await h.settle();
    },
    async after(h) { await leave(h); } },
  { id: 'storm:guide-failed', title: 'A rejected recorded step: the failed card and the guide’s Replay', kind: 'chat', tags: ['app', 'storm', 'chat'], canon: ['BrainStorm'], roots: '.bs-demo-guide',
    async open(h) {
      await h.closeAll();
      await h.demo('brainstorm-demo-start', 'synthesis');
      if (!(await h.clickVisible('#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('no Start on the BrainStorm sheet');
      await h.wait(500);
      await h.ev(() => { const B = window.PM56_BRAINSTORM; window.__stormNorm = B.normalize; B.normalize = () => ({ ok: false, error: 'recorded_step_rejected' }); });
      await h.action('brainstorm-demo-play');
      await h.page.waitForFunction(() => { const s = window.PM56_BRAINSTORM_DEMOS.snapshot(); const r = s && window.PM56_COLLAB.run(s.runId); return !!(r && r.status === 'failed'); }, null, { timeout: 20000 });
      await h.settle();
    },
    async after(h) { await h.ev(() => { if (window.__stormNorm) { window.PM56_BRAINSTORM.normalize = window.__stormNorm; delete window.__stormNorm; } }); await leave(h); } }
];
