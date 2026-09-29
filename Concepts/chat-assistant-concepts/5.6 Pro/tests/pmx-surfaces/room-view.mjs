/* ROOM-B surfaces (DESIGN-SPEC 8.3 room document, 8.0 IMPACT A1-50, 7.9) for tests/pmx-verify.mjs. Every state is
   reached through the recorded example (room-demo-start discussion | plan) and the real actions, never by writing
   run state. The room document is the `room:{runId}` editor tab that Open Panel opens (the hijack stays):
   - live: a helper speaking (the recorded clock held mid-turn with PM56_ROOM_DEMOS.freeze), their words streaming,
     Next Round disabled with its printed reason;
   - E-18: two messages sent mid-round through the composer; one delivered with Send now (steering, "Sent during the
     round"), one still queued ("Queued for the next round", words only in the document);
   - your move after round 1: Next Round (2 of 2) and Summarize Now;
   - finished: the summary pinned on top with Promote to To-Do · Plan · Goal (Goal disabled with its reason), the
     "Promoted to To-Do · Open" receipt, the script in two rounds;
   - the Plan flow finished and promoted to a Plan;
   - the Team tab (Moderator first) and one speaker's own messages (the participant view, Back to everyone);
   - the seed room (chatroom-onboarding) through the legacy adapter, as COLLAB's run view will show it. */
const CANON = ['Chat Room'];
const tag = t => ['app', 'room', 'view'].concat(t || []);
const runId = h => h.ev(() => (window.PM56_ROOM_DEMOS.snapshot() || {}).runId || null);
const until = (h, fn, arg) => h.page.waitForFunction(fn, arg, { timeout: 30000 });
async function start(h, flow) {
  await closeViews(h);
  await h.demo('room-demo-start', flow);
  await h.drive(1, 700);                                   /* Start Chat Room (the sheet's primary) */
  const id = await runId(h);
  if (!id) throw new Error('the recorded room did not start');
  await h.action('collab-open-panel', { run: id }); await h.wait(300);
  return id;
}
const step = async h => { await h.action('room-demo-step'); await h.wait(250); };
const roundDone = (h, id) => until(h, id => { const r = window.PM56_COLLAB.run(id); return !r.chatRoom.round || r.chatRoom.round.complete; }, id);
async function closeViews(h) { await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorTabs = []; c.state.activeEditor = null; c.state.editorRevealed = false; c.renderApp(); }); await h.closeAll(); }
async function speaking(h) {
  const id = await start(h, 'discussion');
  await step(h);                                           /* Ask Everyone */
  await until(h, id => window.PM56_COLLAB.run(id).chatRoom.round.messages.length === 1, id);
  await h.ev(id => window.PM56_ROOM_DEMOS.freeze(id), id); await h.wait(1500); await h.settle();
}
async function queued(h) {
  const id = await start(h, 'discussion');
  await step(h);                                           /* Ask Everyone */
  await until(h, id => window.PM56_COLLAB.run(id).chatRoom.round.messages.length === 1, id);
  await h.ev(id => window.PM56_ROOM_DEMOS.freeze(id), id);
  for (const text of ['Would the command palette count as a visible route?', 'Also check how the shortcut reads for screen magnifier users.']) {
    await h.action('collab-message', { run: id }); await h.wait(200);
    await h.page.fill('[data-input="composer"]', text);
    await h.ev(() => { const b = [...document.querySelectorAll('[data-action="send"]')].find(b => b.offsetParent && !b.disabled); if (b) b.click(); }); await h.wait(300);
  }
  await h.ev(() => { const b = document.querySelector('.pmx-room-queue [data-action="room-queue-send-now"]:not([disabled])'); if (b) b.click(); }); await h.wait(300);
  await h.action('collab-open-panel', { run: id }); await h.wait(300); await h.settle();
}
async function yourMove(h) { const id = await start(h, 'discussion'); await step(h); await roundDone(h, id); await h.wait(300); await h.settle(); }
async function finished(h, flow) {
  const id = await start(h, flow);
  for (let i = 0; i < 8; i++) {
    const done = await h.ev(id => window.PM56_COLLAB.run(id).chatRoom.promotions.length > 0, id);
    if (done) break;
    await step(h); await roundDone(h, id); await h.wait(250);
  }
  await h.ev(() => { const e = document.querySelector('.editor-body'); if (e) e.scrollTop = 0; });
  await h.wait(300); await h.settle();
  return id;
}
/* the reduced-motion census's state change: a tab switch inside the room document (Team, or back to Discussion) */
async function TAB(h) {
  await h.ev(() => { const on = document.querySelector('.room-document .pmx-tab.active'), want = on && on.dataset.tab === 'participants' ? 'transcript' : 'participants';
    const b = document.querySelector('.room-document [data-action="collab-panel-tab"][data-tab="' + want + '"]'); if (b) b.click(); });
}
function view(id, title, open, extra = {}) {
  return Object.assign({ id, title, kind: 'view', tags: tag(extra.tags), canon: CANON, open, change: TAB, async after(h) { await closeViews(h); } }, extra);
}
export default () => [
  view('room-view:speaking', 'Room document, round 1: a helper speaking, their words streaming; Next Round disabled with its reason', speaking, { canon: [...CANON, 'Moderator'] }),
  view('room-view:queued', 'Room document mid-round (E-18): one message steered in with Send now, one queued for the next round (words only)', queued, { canon: [...CANON, 'Moderator'] }),
  view('room-view:your-move', 'Room document after round 1: Next Round (2 of 2), Summarize Now, Message', yourMove, { canon: [...CANON, 'Summarize Now'],
    /* streaming realism: a helper's 1,500-word markdown reply (code, a table) lands in the script */
    async stream(h, md) {
      await h.ev(md => { const s = window.PM56_ROOM_DEMOS.snapshot(), r = window.PM56_COLLAB.run(s.runId), p = r.participants[0];
        window.PM56_COLLAB.appendMessage(r.id, { senderKind: 'participant', senderId: p.id, senderName: p.role, messageType: 'response', body: md }); window.PM56_EXT.ctx().renderApp(); }, md);
      return { openView: async () => { const id = await runId(h); await h.action('collab-open-panel', { run: id }); await h.wait(300); await h.settle(); } };
    } }),
  view('room-view:finished', 'Room document finished: the summary pinned, Promote to, "Promoted to To-Do · Open", the script in two rounds', h => finished(h, 'discussion'), { canon: [...CANON, 'Promote to'] }),
  view('room-view:plan-finished', 'Room document, the Plan flow: one round, summed up, promoted to a Plan', h => finished(h, 'plan'), { canon: [...CANON, 'Promote to'] }),
  view('room-view:team', 'Room document, Team tab: the common Team of the shared frame (3 helpers, a Moderator calls on them)', async h => {
    const id = await finished(h, 'plan');
    await h.ev(id => { const b = document.querySelector('.room-document [data-action="collab-panel-tab"][data-tab="participants"][data-run="' + id + '"]'); if (b) b.click(); }, id);
    await h.wait(300); await h.settle();
  }),
  view('room-view:participant', 'Room document, one speaker: Design’s own messages and Back to everyone (7.9)', async h => {
    const id = await finished(h, 'discussion');
    await h.ev(id => { const b = [...document.querySelectorAll('.room-document .pmx-rv-who[data-run="' + id + '"]')].find(x => x.textContent.trim() === 'Design'); if (b) b.click(); }, id);
    await h.wait(300); await h.settle();
  }),
  view('room-view:legacy', 'The seed room (chatroom-onboarding) drawn from the legacy adapter: Next Round (3 of 5), Summarize Now, Promote to To-Do · Plan · Goal', async h => {
    await closeViews(h);
    await h.ev(() => { const c = window.PM56_EXT.ctx(); c.switchThread('crew'); c.state.editorRevealed = true; c.openEditor('room:chatroom-onboarding'); c.renderApp(); });
    await h.wait(400); await h.settle();
  }, { common: false })
];
