/* ROOM surfaces for tests/pmx-verify.mjs (package ROOM-A, DESIGN-SPEC 8.3 and 7: the Chat Room sheet's parts and
   its in-chat card). wand.mjs already opens the default Chat Room sheet (wand:chat_room, four helpers, Moderator
   guides) and demo:room-discussion. These are the other states the blueprint draws:
   - the sheet with two helpers (the full table plate) and Take turns (the ring with one arrowhead);
   - the sheet with three helpers and One answer each (the compact plate, "One answer each is always one round");
   - the sheet a recorded example opens (prefilled, "Recorded example · no AI cost", the "Your move" preview);
   - the card at each moment of a recorded room: not started ("Your move · start the first round", Ask Everyone),
     a round in progress (the speaker's words streaming, up next, the previous turn), a round done (Next Round,
     Summarize Now), a mid-round send queued for the next round (owner answer E-18: the row above the composer with
     Edit and Send now, "1 message queued for the next round" in the card's meta, and a second message steered
     into the round with Send now: the next speaker's lane says it reads the note),
     and finished (the Moderator's summary, Promote to To-Do · Plan · Goal, "To-Do created").
   - the card of a room paused mid-round (who spoke, who was speaking, who hadn't: the room's own words).
   Live surfaces check the speaker's words after the transcript remounts (a resize and back): the lane must still
   show them (the words already spoken), never an empty quote. Card surfaces carry a stream() hook: live ones stream a
   1,500-word text into the speaker's lane, the others sit beside a 1,500-word assistant reply.
   The room is driven through its own protocol calls (PM56_ROOM.beginRound / request / submit / summarize / finish /
   promote: the same calls the recorded example's player makes), never by writing records, so every state is
   deterministic and nothing plays on by itself while the checks run. `canon` (A2-27a): the principle-10 names
   each state shows. */
const SHEET = '#pmOverlayRoot .pmx-sheet';
const S360 = n => ({ name: n, minCard: 360 });
async function click(h, sel) { if (!(await h.clickVisible(sel))) throw new Error('not found: ' + sel); await h.wait(250); await h.settle(); }
async function openRoomSheet(h) {
  const ok = await h.wandDialog('work', '[data-action="collab-open-configure"][data-kind="chat_room"]');
  if (!ok) throw new Error('wand row not found: Chat Room');
  await h.page.mouse.move(4, 4);
}
async function removeHelpers(h, n) {
  for (let i = 0; i < n; i++) await click(h, `${SHEET} .collab-participant-editor .collab-participant-editor-row:last-child [data-action="collab-modal-remove-participant"]`);
  await h.page.mouse.move(4, 4);
}
async function pickPolicy(h, value) {
  await click(h, `${SHEET} [data-action="collab-pick-choice"][data-field="turnPolicy"]`);
  await click(h, `.overlay-menu [data-action="shared-choice-pick"][data-value="${value}"]`);
  await h.page.mouse.move(4, 4);
  await h.ev(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  await h.wait(200);
}
const QUIET_STEP = async h => { await h.clickVisible(`${SHEET} [data-action="pmx-step"][data-delta="1"]`); };
function sheet(id, title, then, extra = {}) {
  return Object.assign({
    id, title, kind: 'sheet', tags: ['app', 'room'], common: true, canon: ['Chat Room', 'Wonderer', 'Grill Me'], change: QUIET_STEP,
    async open(h) { await openRoomSheet(h); if (then) await then(h); await h.settle(); },
    async after(h) { await h.closeAll(); }
  }, extra);
}

/* ---- the recorded room, stepped through its protocol (in page) ---- */
function inPageRoom(step) {
  const R = window.PM56_ROOM, C = window.PM56_COLLAB, snap = window.PM56_ROOM_DEMOS && window.PM56_ROOM_DEMOS.snapshot();
  const id = snap && snap.runId;
  if (!id || !R.owns(id)) return { error: 'no recorded room' };
  const r = C.run(id);
  const reply = () => {
    const s = r.chatRoom, round = s.round; if (!round || round.complete) return false;
    const pid = round.participantIds.find(pid => !round.messages.some(mid => (r.messages.find(m => m.id === mid) || {}).senderId === pid));
    const x = R.request(id, pid); if (!x) return false;
    const slot = r.participants.findIndex(p => p.id === pid);
    return R.submit(id, Object.assign({}, x, { body: s.input.rounds[round.number - 1][slot] })).ok;
  };
  const begin = () => R.beginRound(id, R.envelope(id)).ok;
  if (step === 'begin') begin();
  if (step === 'reply') { if (!reply()) begin(); }
  if (step === 'round') { if (!r.chatRoom.round || r.chatRoom.round.complete) begin(); while (reply()); }
  if (step === 'pause') { if (!r.chatRoom.round || r.chatRoom.round.complete) begin(); reply(); const b = document.createElement('button'); b.dataset.action = 'collab-pause'; b.dataset.run = id; window.PM56_EXT._actions['collab-pause'](window.PM56_EXT.ctx(), b, new Event('click')); }
  if (step === 'finish') {
    for (let i = 0; i < 4 && r.chatRoom.roundsSoFar < 2; i++) { begin(); while (reply()); }
    R.summarize(id); R.finish(id);
    const x = r.chatRoom.summary && R.promotionRequest(id, r.chatRoom.summary.messageId, 'todo'); if (x) R.promote(x);
  }
  window.PM56_EXT.ctx().renderApp();
  return { id, status: r.status, rounds: r.chatRoom.roundsSoFar };
}
async function startRecordedRoom(h) {
  await h.closeAll();
  await h.action('room-demo-start', { flow: 'discussion' });
  await h.wait(700); await h.settle();
  if (!(await h.clickVisible(`${SHEET} [data-action="collab-modal-commit"]`))) throw new Error('recorded Chat Room sheet did not open');
  await h.wait(900); await h.settle();
}
async function step(h, name) { const r = await h.ev(inPageRoom, name); if (r && r.error) throw new Error(r.error); await h.wait(200); await h.settle(); return r; }
/* the surface's own change for the reduced-motion census: the next protocol event (a reply, or the next round) */
const NEXT_EVENT = async h => { const r = await h.ev(inPageRoom, 'reply'); if (r && r.error) throw new Error(r.error); };
/* the speaker's lane after a remount: its quote must hold words (review finding: a remounted lane showed "") */
const speakingWords = h => h.ev(() => [...document.querySelectorAll('.transcript .pmx-run[data-pmx-kind="chat_room"] q[data-room-stream]')].map(q => q.textContent.trim().split(/\s+/).filter(Boolean).length));
async function remountCheck(h) {
  const vp = h.page.viewportSize();
  await h.setSize(vp.width - 160, vp.height - 100); await h.settle();
  await h.setSize(vp.width, vp.height); await h.settle();
  const n = await speakingWords(h);
  if (!n.length) throw new Error('room card: no speaking lane after the remount');
  if (n.some(x => x === 0)) throw new Error('room card: the speaking lane is empty after the remount (' + n.join(',') + ' words)');
}
/* streaming realism. Live surfaces: the speaker's words are a 1,500-word text (a live helper's reply as it
   arrives) streamed into the lane at 10 ms a word; the lane stays one line and the card in budget. Other surfaces:
   a 1,500-word markdown reply from the assistant lands in the thread beside the card. */
const STREAM_LIVE = async (h, md) => {
  await h.ev(md => { const D = window.PM56_ROOM_DEMOS, s = D.snapshot(), r = window.PM56_COLLAB.run(s.runId), f = window.PM56_ROOM.facts(s.runId);
    if (!window.__roomSpeakOrig) window.__roomSpeakOrig = D.speaking;
    D.speaking = id => (id === r.id && f && f.speaker ? { pid: f.speaker.id, text: md, msPerWord: 10 } : null);
    window.PM56_EXT.ctx().renderApp(); }, md);
  await h.wait(1500);
};
const STREAM_BESIDE = async (h, md) => {
  await h.ev(md => { const c = window.PM56_EXT.ctx(); c.thread.messages.push({ id: c.uid('assistant'), role: 'assistant', type: 'text', body: md, time: new Date().toISOString() }); c.renderApp(); }, md);
  await h.wait(600);
};
function card(id, title, reach, extra = {}) {
  return Object.assign({
    id, title, kind: 'chat', tags: ['app', 'room', 'card'], canon: [S360('Chat Room'), S360('Open Panel'), { name: 'Message', minCard: 260 }],
    change: NEXT_EVENT, stream: STREAM_BESIDE,
    async open(h, where) {
      await startRecordedRoom(h);
      if (reach) await reach(h);
      /* the recorded example opens its own chat with the history closed; put the layout under test back */
      if (where && where.layout) await h.chatLayout(where.layout);
      if (extra.live) await remountCheck(h);
      await h.page.mouse.move(4, 4);
      await h.settle();
    },
    async after(h) { await h.ev(() => { if (window.__roomSpeakOrig) { window.PM56_ROOM_DEMOS.speaking = window.__roomSpeakOrig; window.__roomSpeakOrig = null; } }); await h.closeAll(); }
  }, extra);
}

export default () => [
  sheet('room:sheet-table-turns', 'Chat Room sheet with two helpers and Take turns: the full table plate (8.3)', async h => {
    await removeHelpers(h, 2); await pickPolicy(h, 'round_robin');
  }),
  sheet('room:sheet-once', 'Chat Room sheet with three helpers and One answer each: the compact plate, one round', async h => {
    await removeHelpers(h, 1); await pickPolicy(h, 'ask_everyone_once');
  }),
  {
    id: 'room:sheet-recorded', title: 'The Chat Room sheet a recorded example opens (prefilled, Recorded example · no AI cost)', kind: 'sheet', tags: ['app', 'room'],
    common: true, canon: ['Chat Room', 'Wonderer', 'Grill Me'], change: QUIET_STEP,
    /* the recorded example opens in a chat of its own, so its thread exists before the sheet: not a sheet effect */
    ledger: false,
    async open(h) { await h.closeAll(); await h.action('room-demo-start', { flow: 'discussion' }); await h.wait(700); await h.page.mouse.move(4, 4); await h.settle(); },
    async after(h) { await h.closeAll(); }
  },
  card('room:card-start', 'Recorded room, created: "Your move · start the first round" with Ask Everyone', null,
    { change: async h => { await h.ev(inPageRoom, 'begin'); } }),
  card('room:card-speaking', 'Recorded room, round 1 in progress: the speaker (words streaming), up next, the previous turn', async h => {
    await step(h, 'begin'); await step(h, 'reply');
  }, { live: true, stream: STREAM_LIVE }),
  card('room:card-round-done', 'Recorded room, round 1 done: Next Round (and Summarize Now in More until COLLAB draws the decision row)', async h => {
    await step(h, 'round');
  }, { change: async h => { await h.ev(inPageRoom, 'begin'); } }),
  card('room:card-queued', 'Recorded room, sends during a round (E-18): one queued for the next round above the composer, one steered in with Send now', async h => {
    await step(h, 'begin');
    const id = await h.ev(() => window.PM56_ROOM_DEMOS.snapshot().runId);
    await h.action('collab-message', { run: id }); await h.wait(250);
    for (const t of ['And the command palette?', 'What about people who never learn shortcuts?']) {
      await h.page.fill('[data-input="composer"]', t);
      await h.clickVisible('[data-action="send"]'); await h.wait(300);
    }
    if (!(await h.clickVisible('.pmx-room-queue [data-action="room-queue-send-now"]'))) throw new Error('no queued row');
    await h.wait(300); await h.settle();
  }, { live: true, stream: STREAM_LIVE, change: async h => { await h.ev(inPageRoom, 'reply'); } }),
  card('room:card-paused', 'Recorded room paused mid-round: who spoke, who was speaking when you paused, who hadn\u2019t spoken yet (7.6)', async h => {
    await step(h, 'begin'); await step(h, 'pause');
  }, { /* COLLAB's paused row keeps Resume and Open Panel below 360 px; Message leaves it there (pmx-act-extra) */
    canon: [S360('Chat Room'), S360('Open Panel'), S360('Message')],
    change: async h => { const id = await h.ev(() => window.PM56_ROOM_DEMOS.snapshot().runId); await h.action('collab-resume', { run: id }); } }),
  card('room:card-result', 'Recorded room, finished: the Moderator\'s summary, Promote to To-Do · Plan · Goal, To-Do created', async h => {
    await step(h, 'finish');
  }, { canon: [S360('Chat Room'), S360('Open Panel')], change: async h => { await h.ev(() => { window.PM56_EXT.ctx().renderApp(); }); } })
];
