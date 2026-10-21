/* STORM-B surfaces for tests/pmx-verify.mjs (DESIGN-SPEC 8.4 run view, G-26 evidence and Wonderer workspace).
   Each state is reached through the recorded examples' own controls (Start on the sheet, Play, Open Panel, the view's
   tabs), never by writing state:
   - storm:view-synthesis   How they decided, ready to write the plan (options, dissent, votes, debate, sources);
   - storm:view-constraint  the rule-beats-vote example: a ruled-out option with its backers kept as dissent;
   - storm:view-done        after Write the plan: "Plan ready", Open Plan (the one Plan is plans.js's);
   - storm:view-team / storm:view-conversation / storm:view-participant  the common tabs as BrainStorm renders them;
   - storm:evidence         the evidence document (G-26), "Source used in this BrainStorm · recorded example";
   DL-218 (2026-10-16) and the steer of 2026-10-20: the Wonderer runs alongside and the team decides its leads;
   Grill Me is a switch, so the Coordinator questions you before anyone drafts (steps in _wonderer.mjs):
   - storm:wonderer         Wonderer's leads (G-26): three passes, every lead with the team's decision, its reason and
                            who recorded it, and one lead you sent with Check it back from research;
   - storm:wonderer-held    Wonderer's leads while the first pass is held until every blind proposal is in (paused);
   - storm:wonderer-chat    one Wonderer card per pass in the chat, What we agreed confirmed, the guide at Write the plan;
   - storm:view-wonderer-wait  the run view while the last pass is out: Write the plan waits with its reason, the
                            Wonderer's section beside it (paused so it holds still; never "Ready" over a dead primary);
   - storm:wonderer-guide   Grill Me before anyone drafts: the guide while the grilling round is open (the Ask Card
                            itself is questions.js's, checked by questions-verify and wonderer-grill-verify);
   - storm:guide-failed     a rejected recorded step: the guide's failed sentence + Replay beside the card's failed face.
                            A rejected step cannot be reached through the controls, so this one surface makes the
                            protocol's normalize refuse (page-side stub, restored in after()).
   `canon` (A2-27a): the principle-10 names each state shows. */
import { wondererRun, toWrite, pauseWhen, leave as leaveRun, QUIET_CHANGE } from './_wonderer.mjs';
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
  { id: 'storm:wonderer', title: 'Wonderer’s leads (G-26, DL-218): three passes, each lead with the team’s decision and reason, one lead you checked', kind: 'view', tags: ['app', 'storm', 'view', 'wonderer'], canon: ['Wonderer', 'BrainStorm'],
    async open(h) {
      const run = await wondererRun(h);
      await toWrite(h, { checkLead: true });
      await h.action('b13-open', { run }); await h.wait(300);
      await h.settle();
    },
    change: QUIET_CHANGE, async after(h) { await leaveRun(h); } },
  { id: 'storm:wonderer-held', title: 'Wonderer’s leads held until every blind proposal is in (the run paused while the helpers draft alone)', kind: 'view', tags: ['app', 'storm', 'view', 'wonderer'], canon: ['Wonderer', 'BrainStorm'],
    async open(h) {
      await wondererRun(h);
      const run = await pauseWhen(h, r => r.wonderer.passes[0] && r.wonderer.passes[0].status === 'held' && r.brainstorm.phase === 'blind_proposals');
      await h.action('b13-open', { run }); await h.wait(300);
      await h.settle();
    },
    change: QUIET_CHANGE, async after(h) { await leaveRun(h); } },
  { id: 'storm:wonderer-chat', title: 'The Wonderer in the chat: one card per pass, What we agreed confirmed, the guide at Write the plan', kind: 'chat', tags: ['app', 'storm', 'chat', 'wonderer'], canon: ['Wonderer'], roots: '.b13-entry, .b13-guide, .wg-card, .wg-agreed',
    async open(h) { await wondererRun(h); await toWrite(h); await h.settle(); },
    change: QUIET_CHANGE, async after(h) { await leaveRun(h); } },
  { id: 'storm:view-wonderer-wait', title: 'BrainStorm run view while the Wonderer’s last pass is out: Write the plan waits, with its reason (paused)', kind: 'view', tags: ['app', 'storm', 'view', 'wonderer'], canon: ['BrainStorm', 'Wonderer'],
    async open(h) {
      await wondererRun(h);
      const run = await pauseWhen(h, r => r.brainstorm.phase === 'synthesis' && r.wonderer.passes[2] && r.wonderer.passes[2].status === 'exploring');
      await openView(h, run);
    },
    change: QUIET_CHANGE, async after(h) { await leaveRun(h); } },
  { id: 'storm:wonderer-guide', title: 'Grill Me before anyone drafts: the guide while the Coordinator’s grilling round is open', kind: 'chat', tags: ['app', 'storm', 'chat', 'wonderer'], canon: ['Wonderer', 'Grill Me'], roots: '.b13-guide',
    async open(h) { await wondererRun(h, { confirm: false }); await h.ev(() => window.PM56_CLOCK.setScale(1)); await h.settle(); },
    change: QUIET_CHANGE, async after(h) { await leaveRun(h); } },
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
