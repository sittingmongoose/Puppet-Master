/* COLLAB-VIEW surfaces for tests/pmx-verify.mjs (the docked run view, DESIGN-SPEC 4.4, 7.9, 8.0 view bullets).
   Each surface opens a run in the editor pane through the view's own entry point,
   window.PM56_COLLAB_VIEW.open(runId, {tab, participantId}), and moves between tabs with the view's own
   tab buttons (collab-panel-tab). Runs come from the four guided demos (recorded, protocol-owned) and from the
   seeds (legacy runs, whose Summary carries the G-15 records: the Crew plan, the Review findings and target
   line, the BrainStorm question budget, vote, ruled-out option and dissent, the Chat Room controls).
   `canon` (A2-27a): the principle-10 names each view shows. */
const VIEW = '.collab-view';
async function openRun(h, id, o = {}) {
  await h.closeAll();
  await h.ev(([id, o]) => window.PM56_COLLAB_VIEW.open(id, o), [id, o]);
  await h.wait(300); await h.settle();
}
async function demoRun(h, action, flow, drive = 4) {
  await h.closeAll();
  await h.demo(action, flow); await h.drive(drive, 1500);
  await h.closeAll();
  return h.ev(() => { const r = window.PM56_COLLAB.runs(); return r[r.length - 1].id; });
}
async function tab(h, t) { await h.clickVisible(`${VIEW} [data-action="collab-panel-tab"][data-tab="${t}"]`); await h.wait(250); await h.settle(); }
async function closeView(h) {
  await h.ev(() => { const c = window.PM56_EXT.ctx(); (c.state.editorTabs || []).filter(t => String(t).indexOf('collab-run:') === 0).forEach(t => c.closeEditor(t)); });
  await h.closeAll();
}
/* the reduced-motion census's state change: a tab change (the new pane materializes) */
const TAB_CHANGE = async h => { const t = await h.ev(v => { const a = document.querySelector(v + ' .pmx-tab[aria-selected="true"]'); return a && a.dataset.tab === 'usage' ? 'participants' : 'usage'; }, VIEW); await tab(h, t); };
/* streaming realism: a long helper message lands while the Conversation is open; it streams, then the view
   shows its full markdown (tab away and back, which also ends the stream) */
function streamInto(getId) {
  return async (h, md) => {
    const id = await getId(h);
    await h.ev(([id, md]) => {
      const r = window.PM56_COLLAB.run(id), p = r.participants[0];
      window.PM56_COLLAB_VIEW.open(id, { tab: 'transcript' });
      window.PM56_COLLAB.appendMessage(id, { senderKind: 'participant', senderId: p.id, senderName: p.name, messageType: 'response', body: md });
      window.PM56_EXT.ctx().renderApp();
    }, [id, md]);
    await h.wait(400);
    return { openView: async () => { await tab(h, 'participants'); await tab(h, 'transcript'); } };
  };
}
function view(id, title, open, extra = {}) {
  return Object.assign({ id, title, kind: 'view', tags: ['app', 'collab', 'collab-view'], canon: extra.canon || [], change: TAB_CHANGE,
    async open(h) { await open(h); await h.settle(); }, async after(h) { await closeView(h); } }, extra);
}
let crewRun = null;
async function crewDemo(h) { crewRun = await demoRun(h, 'crew-demo-start', 'delegation'); return crewRun; }

export default () => [
  view('collab-view:crew-summary', 'Crew run view, Summary: the job, the team, the latest messages, the way into the Crew’s own page (recorded example)',
    async h => { await openRun(h, await crewDemo(h), { tab: 'overview' }); }, { canon: ['Crew'], stream: streamInto(async h => crewRun || crewDemo(h)) }),
  view('collab-view:crew-conversation', 'Crew run view, Conversation: full markdown, "Showing everyone"',
    async h => { await openRun(h, await crewDemo(h), { tab: 'transcript' }); }, { canon: ['Crew'] }),
  view('collab-view:crew-team', 'Crew run view, Team: core team rows (collab-participant)',
    async h => { await openRun(h, await crewDemo(h), { tab: 'participants' }); }, { canon: ['Crew'] }),
  view('collab-view:crew-cost', 'Crew run view, Cost: what it cost, your limit, who used what',
    async h => { await openRun(h, await crewDemo(h), { tab: 'usage' }); }, { canon: ['Crew'] }),
  view('collab-view:crew-participant', 'Crew run view, one helper’s own view (D5): state, model, Message disabled with its reason, own messages',
    async h => { const id = await crewDemo(h); const pid = await h.ev(id => window.PM56_COLLAB.run(id).participants[1].id, id); await openRun(h, id, { participantId: pid }); }, { canon: ['Crew'] }),
  view('collab-view:crew-more', 'Crew run view, the More row open with Technical details (G-12: real buttons, Download transcript disabled with its reason)',
    async h => { await openRun(h, await crewDemo(h), { tab: 'overview' }); await h.clickVisible(`${VIEW} [data-action="collab-view-toggle"][data-part="more"]`); await h.wait(200);
      await h.clickVisible(`${VIEW} [data-action="collab-view-toggle"][data-part="tech"]`); await h.wait(200); }, { canon: ['Crew'] }),
  view('collab-view:review-report', 'Review run view (Multi-Pass, recorded), Report tab: generic summary and the plate',
    async h => { await openRun(h, await demoRun(h, 'review-demo-start', 'multi'), { tab: 'overview' }); }, { canon: ['Review', 'Multi-Pass'] }),
  view('collab-view:brainstorm-conversation', 'BrainStorm run view (recorded), Conversation: protocol messages as people say them (G-33)',
    async h => { await openRun(h, await demoRun(h, 'brainstorm-demo-start', 'synthesis'), { tab: 'transcript' }); }, { canon: ['BrainStorm'] }),
  view('collab-view:room-discussion', 'Chat Room run view (recorded), Discussion',
    async h => { await openRun(h, await demoRun(h, 'room-demo-start', 'discussion', 2), { tab: 'transcript' }); }, { canon: ['Chat Room'] }),
  view('collab-view:seed-crew', 'Seed Crew (legacy) Summary: the plan with Done when, proof and Mark as done…; a helper that needs you',
    async h => { await openRun(h, 'crew-query-perf', { tab: 'overview' }); }, { canon: ['Crew'] }),
  view('collab-view:seed-review', 'Seed Review (legacy) Report: target line, findings with real ticks, Set aside, read-only note',
    async h => { await openRun(h, 'review-orchestrator-boundary', { tab: 'overview' }); }, { canon: ['Review', 'Multi-Pass'] }),
  view('collab-view:seed-review-team', 'Seed Review (legacy) Reviewers tab',
    async h => { await openRun(h, 'review-orchestrator-boundary', { tab: 'participants' }); }, { canon: ['Review'] }),
  view('collab-view:seed-brainstorm', 'Seed BrainStorm (legacy) How they decided: question budget and Grill Me, the vote, ruled out, dissent, Wonderer’s ideas, Write the plan',
    async h => { await openRun(h, 'brainstorm-provider-failover', { tab: 'overview' }); }, { canon: ['BrainStorm', 'Grill Me', 'Wonderer'] }),
  view('collab-view:seed-brainstorm-team', 'Seed BrainStorm (legacy) Team: core team and the Specialists group (G-30)',
    async h => { await openRun(h, 'brainstorm-provider-failover', { tab: 'participants' }); }, { canon: ['BrainStorm', 'Wonderer'] }),
  view('collab-view:seed-room', 'Seed Chat Room (legacy) Discussion: Next Round, Summarize Now, Promote to To-Do · Plan · Goal',
    async h => { await openRun(h, 'chatroom-onboarding', { tab: 'transcript' }); }, { canon: ['Chat Room'] })
];
