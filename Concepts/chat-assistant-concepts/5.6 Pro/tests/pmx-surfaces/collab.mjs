/* COLLAB surfaces for tests/pmx-verify.mjs (package COLLAB, DESIGN-SPEC 8.0-8.5: step 1 the configure sheet, step 2 the
   run card, step 3 the docked run view reached from the card; collab-view.mjs sweeps the view's tabs).
   wand.mjs opens each collaboration sheet in its default state (wand:crew, wand:crew-auto, wand:chat_room,
   wand:brainstorm, wand:review). These are the other states the blueprint draws, each reached through the sheet's
   own controls, never by writing state:
   - Crew with a job typed and Wonderer added, and with both specialists (beyond the common case, 6.3);
   - BrainStorm with both specialists (a common case, 6.3);
   - Crew after a helper was removed ("Removed Builder · Bring back");
   - Crew with five helpers (lead ruling: Crew 4 and 5 may scroll at 1280 after yielding) and with eight (the add
     control shows the limit instead; not a common case, so the no-scroll rule does not apply);
   - Crew with an offline model chosen (owner answer E-03): the row's blocking notice with Fix, data-failure on the
     row, and Start disabled with the same sentence; nothing was created;
   - Review started from its "Deep audit" team (owner answer E-37: Review gets "Start from a team");
   - the Crew sheet's Advanced page;
   - Crew Auto opened from the Crew sheet ("Crew Auto settings…"): the swap, with "Back to Crew";
   - Review set to one reviewer (Single Agent), and BrainStorm with Grill Me added (the question budget at 45).
   `canon` (A2-27a): the principle-10 names each state shows. */
const SPECIALISTS = ['Wonderer', 'Grill Me'];
const SHEET = '#pmOverlayRoot .pmx-sheet';
/* the wand's own rows (button.menu-item), never a card's "Run again with changes…" (which shares the action) */
const openSel = kind => kind === 'crew-auto' ? 'button.menu-item[data-action="collab-open-configure"][data-kind="crew"][data-auto="1"]'
  : `button.menu-item[data-action="collab-open-configure"][data-kind="${kind}"]:not([data-auto]):not([data-reconfigure])`;
async function openSheet(h, kind) {
  const ok = await h.wandDialog('work', openSel(kind));
  if (!ok) throw new Error('wand row not found: ' + openSel(kind));
  await h.page.mouse.move(4, 4);
}
async function click(h, sel) { if (!(await h.clickVisible(sel))) throw new Error('not found: ' + sel); await h.wait(250); await h.settle(); }
async function typeJob(h, text) {
  const f = await h.page.$(`${SHEET} textarea[data-collab-input="purpose"]`);
  if (!f) throw new Error('no job field');
  await f.click(); await h.page.keyboard.type(text, { delay: 2 }); await h.wait(200);
}
async function addHelpers(h, n) { for (let i = 0; i < n; i++) await click(h, `${SHEET} [data-action="collab-modal-add-participant"]`); await h.page.mouse.move(4, 4); }
async function pickChoice(h, field, value) {
  await click(h, `${SHEET} [data-action="collab-pick-choice"][data-field="${field}"]`);
  await click(h, `.overlay-menu [data-action="shared-choice-pick"][data-value="${value}"]`);
  await h.page.mouse.move(4, 4);
}
/* a specialist's shelf row: its opacity-0 checkbox (data-pmx-harness) is the real input behind the visible Add */
async function addSpecialist(h, key) {
  await h.ev(k => { const i = document.querySelector(`#pmOverlayRoot [data-collab-input="${k}"]`); if (i && !i.checked) i.click(); }, key);
  await h.wait(300); await h.settle();
}
/* the reduced-motion census's state change: a stepper step (opens no dropdown) */
const QUIET_STEP = async h => { await h.clickVisible(`${SHEET} [data-action="pmx-step"][data-delta="1"]`); };
function sheet(id, title, kind, then, extra = {}) {
  return Object.assign({
    id, title, kind: 'sheet', tags: ['app', 'collab'], common: true, canon: extra.canon || [], change: QUIET_STEP,
    async open(h) { await openSheet(h, kind); if (then) await then(h); await h.settle(); },
    async after(h) { await h.closeAll(); }
  }, extra);
}
/* ---- step 2: the run card (DESIGN-SPEC 7, 8.0 card bullets, 4.3). Each surface builds its state once (setup) and
   re-shows it per theme and layout (open): the thread is selected and the card scrolled to the middle of the
   transcript. Nothing writes state: the wand, the demos, the card's own controls and one sent message. ---- */
const CARD = id => `.transcript .pmx-run[data-run-id="${id}"]`;
async function wandStart(h, kind, job) {
  await openSheet(h, kind);
  if (job) await typeJob(h, job);
  await click(h, `${SHEET} [data-action="collab-modal-commit"]`);
  await h.wait(1300);
  const id = await h.ev(() => { const r = window.PM56_COLLAB.runs(); return r[r.length - 1].id; });
  await h.ev(id => { window.__pmxCollab = Object.assign(window.__pmxCollab || {}, { run: id, thread: window.PM56_EXT.ctx().state.selectedThread }); }, id);
  return id;
}
async function cardClick(h, action) {
  const id = await h.ev(() => window.__pmxCollab.run);
  if (!(await h.clickVisible(`${CARD(id)} [data-action="${action}"][data-run="${id}"]`))) throw new Error('card control not found: ' + action);
  await h.wait(250);
}
async function crewDemo(h) {
  await h.demo('crew-demo-start', 'delegation');
  await h.drive(3, 1800);
  await h.wait(1500);
  await h.ev(() => { const r = window.PM56_COLLAB.runs(); window.__pmxCollab = { run: r[r.length - 1].id, thread: window.PM56_EXT.ctx().state.selectedThread }; });
}
function chat(id, title, setup, extra = {}) {
  return Object.assign({
    /* 7.2: below 360 px the kind word hides (the mark stays) and the actions shorten, so a card's canon names are
       required only while every card is at least 360 wide (canon minCard) */
    id, title, kind: 'chat', tags: ['app', 'collab', 'chat'], canon: (extra.canon || []).map(n => ({ name: n, minCard: 360 })), setup,
    /* 10.4: card widths 417 (pinned), 591 (closed), 391 and 311, plus the 230 px S tier of a 1024 window */
    layouts: ['pinned', 'closed', 'w391', 'w311', 'pinned-1024x768'],
    async open(h) {
      await h.closeAll();
      const st = await h.ev(t => window.__pmxCollab || { thread: t }, extra.thread || null);
      if (extra.thread || st.thread) await h.selectThread(extra.thread || st.thread);
      const focus = extra.run || st.run;
      if (focus) await h.ev(sel => { const c = document.querySelector(sel); if (c) c.scrollIntoView({ block: 'center', behavior: 'instant' }); }, CARD(focus));
      await h.settle();
    },
    async after(h) { await h.closeAll(); }
  }, Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'canon')));
}
/* streaming realism (owner answer E-31, DL-137: live helper text, reusing the reply streaming). A helper of a live run
   says a 1,500-word markdown message (code, a table): its words stream into that helper's lane through
   PM56_PMX.stream while the check runs, so the lane stays one line and the card in budget mid-stream. The helper
   is the first one the card draws a lane for. */
const STREAM_HELPER = async (h, md) => {
  const ok = await h.ev(md => {
    const r = window.__pmxCollab && window.__pmxCollab.run, run = r && window.PM56_COLLAB.run(r);
    const lane = run && document.querySelector(`.transcript .pmx-run[data-run-id="${run.id}"] .pmx-lane[data-participant]`);
    const p = lane && run.participants.find(x => x.id === lane.dataset.participant);
    if (!p) return false;
    window.PM56_COLLAB.appendMessage(run.id, { senderKind: 'participant', senderId: p.id, senderName: p.role, messageType: 'message', body: md });
    window.PM56_EXT.ctx().renderApp();
    return true;
  }, md);
  if (!ok) throw new Error('streaming: no helper lane on the live card');
  await h.wait(600);
  const n = await h.ev(() => document.querySelectorAll('.transcript .pmx-lane-l2[data-pm-keep] q[data-collab-stream]').length);
  if (!n && !(await h.ev(() => window.PM56_PMX.reduced()))) throw new Error('streaming: the helper\u2019s words did not stream into its lane');
};
const CARD_SURFACES = [
  chat('collab:card-waiting', 'A Crew started from the wand with no recording: born waiting, "Watch a recorded example" (7.7, D-6)', async h => {
    await wandStart(h, 'crew', 'Export the collection to CSV without losing quotes or order.');
  }, { canon: ['Crew', 'Open Panel'] }),
  chat('collab:card-more', 'The waiting card with its More row open: Cancel Crew…, Change setup…, Download transcript (disabled, reason printed), Technical details', async h => {
    await wandStart(h, 'crew', 'Export the collection to CSV.');
    await cardClick(h, 'collab-toggle-more');
  }, { canon: ['Crew'] }),
  chat('collab:card-cancel-ask', 'Cancel confirmed in place: "Cancel this Crew? Everything so far is kept." [Cancel Crew] [Keep going]', async h => {
    await wandStart(h, 'crew', 'Export the collection to CSV.');
    await cardClick(h, 'collab-toggle-more'); await cardClick(h, 'collab-cancel-ask');
  }, { canon: ['Crew'] }),
  chat('collab:card-cancelled', 'A cancelled card: "Cancelled · everything so far is kept", Run again with changes…', async h => {
    await wandStart(h, 'review', '');
    await cardClick(h, 'collab-toggle-more'); await cardClick(h, 'collab-cancel-ask'); await cardClick(h, 'collab-cancel');
  }, { canon: ['Review'] }),
  chat('collab:card-stack', 'Five runs in one long chat (F.9): older live runs collapsed (needs-you rows survive), the newest live, the dock', async () => {}, { thread: 'recovery-collaboration', run: 'run-87', canon: ['Chat Room'] }),
  chat('collab:card-attention', 'A Crew that needs you, opened: the warm decision row in the sentence’s place, Details, Cancel Crew…', async h => {
    await h.selectThread('recovery-collaboration');
    await h.clickVisible(`${CARD('crew-query-perf')} [data-action="collab-toggle-expand"][data-run="crew-query-perf"]`); await h.wait(300);
    await h.ev(() => { window.__pmxCollab = { run: 'crew-query-perf', thread: 'recovery-collaboration' }; });
  }, { thread: 'recovery-collaboration', run: 'crew-query-perf', canon: ['Crew', 'Open Panel'], stream: STREAM_HELPER }),
  chat('collab:card-review-live', 'A live Multi-Pass Review (three reviewers on their own) above a Review receipt', async () => {}, { thread: 'subagents', run: 'review-orchestrator-boundary', canon: ['Review', 'Open Panel', 'Message'] }),
  chat('collab:card-brainstorm-live', 'A live BrainStorm at its vote (a helper\u2019s words stream into its lane: owner answer E-31)', async h => {
    await h.ev(() => { window.__pmxCollab = { run: 'brainstorm-provider-failover', thread: 'plan-deep' }; });
  }, { thread: 'plan-deep', run: 'brainstorm-provider-failover', canon: ['BrainStorm', 'Open Panel', 'Message'], stream: STREAM_HELPER }),
  chat('collab:card-result', 'A recorded Crew just finished: the result face (headline, figures, the CSV, who did what), Open Panel and Download', async h => { await crewDemo(h); }, { canon: ['Crew', 'Open Panel'] }),
  chat('collab:card-receipt', 'A finished Crew condensed to its 44 px receipt (the card\u2019s own chevron: auto -> open -> closed, G-19) with the recorded play-ring', async h => {
    await crewDemo(h);
    await cardClick(h, 'collab-toggle-expand'); await cardClick(h, 'collab-toggle-expand'); await h.wait(400);
  }),
  chat('collab:card-paused', 'A paused Chat Room: "Paused · nothing is lost", Resume; no loop runs on it (5.6: motion never implies work that is not happening)', async h => {
    await h.selectThread('crew');
    await h.ev(() => { window.__pmxCollab = { run: 'chatroom-onboarding', thread: 'crew' }; });
    await cardClick(h, 'collab-toggle-more'); await cardClick(h, 'collab-pause'); await cardClick(h, 'collab-toggle-more');
  }, { canon: ['Chat Room'], async open(h) {
    await h.closeAll(); await h.selectThread('crew');
    await h.ev(sel => { const c = document.querySelector(sel); if (c) c.scrollIntoView({ block: 'center', behavior: 'instant' }); }, CARD('chatroom-onboarding'));
    await h.settle();
    /* the loop census counts live cards by their density; a paused card is live-shaped but must run none */
    const loops = await h.ev(sel => { const c = document.querySelector(sel); return c ? document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity && c.contains(a.effect.target)).map(a => String(a.effect.target.className && a.effect.target.className.baseVal !== undefined ? a.effect.target.className.baseVal : a.effect.target.className)) : ['no card']; }, CARD('chatroom-onboarding'));
    if (loops.length) throw new Error('the paused card keeps ' + loops.length + ' infinite animation(s): ' + loops.join(', '));
  } })
];
/* ---- step 3: the docked run view reached the way a person reaches it (4.4, 7.9, M8, G-14): the card's Open Panel, its
   Details, a waiting card. collab-view.mjs sweeps every tab through the view's own entry point; these prove the card's
   controls land there (the editor pane, never a centred dialog) and that the card beside an open view keeps one control
   set (7.12: the follow-ons the view draws leave the card, which points at the view). ---- */
const VIEW = '.collab-view';
async function closeRunViews(h) {
  await h.ev(() => { const c = window.PM56_EXT.ctx(); (c.state.editorTabs || []).filter(t => String(t).indexOf('collab-run:') === 0).forEach(t => c.closeEditor(t)); });
}
async function fromCard(h, thread, id, action, attrs) {
  await h.selectThread(thread);
  const card = CARD(id);
  if (await h.ev(s => (document.querySelector(s) || {}).dataset?.density === 'collapsed', card)) { await h.clickVisible(`${card} [data-action="collab-toggle-expand"]`); await h.wait(300); }
  const sel = `${card} [data-action="${action || 'collab-open-panel'}"][data-run="${id}"]${attrs || ''}`;
  if (!(await h.clickVisible(sel))) throw new Error('card control not found: ' + sel);
  await h.wait(300);
  if (!(await h.ev(id => String(window.PM56_EXT.ctx().state.activeEditor || '').split(':').slice(1).join(':') === id && !window.PM56_EXT.ctx().state.dialog, id))) throw new Error('the card did not open the docked run view: ' + id);
}
const VIEW_TAB_CHANGE = async h => {
  const t = await h.ev(v => { const a = document.querySelector(v + ' .pmx-tab[aria-selected="true"]'); return a && a.dataset.tab === 'usage' ? 'participants' : 'usage'; }, VIEW);
  await h.clickVisible(`${VIEW} [data-action="collab-panel-tab"][data-tab="${t}"]`); await h.wait(250);
};
function viewFromCard(id, title, setup, reach, extra = {}) {
  return Object.assign({
    id, title, kind: 'view', tags: ['app', 'collab', 'collab-view'], canon: extra.canon || [], setup, change: VIEW_TAB_CHANGE,
    async open(h) { await h.closeAll(); await closeRunViews(h); await reach(h); await h.settle(); },
    async after(h) { await closeRunViews(h); await h.closeAll(); }
  }, Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'canon')));
}
const VIEW_SURFACES = [
  viewFromCard('collab:view-from-card', 'Open Panel on the live BrainStorm card: the docked view on "How they decided" (question budget, votes, the ruled-out option, dissent, Write the plan), M8', null,
    async h => { await fromCard(h, 'plan-deep', 'brainstorm-provider-failover'); }, { canon: ['BrainStorm', 'Grill Me'] }),
  viewFromCard('collab:view-room-from-card', 'Open Panel on the Chat Room card: the Discussion (Next Round, Summarize Now, Promote to To-Do · Plan · Goal)', null,
    async h => { await fromCard(h, 'crew', 'chatroom-onboarding'); }, { canon: ['Chat Room'] }),
  viewFromCard('collab:view-details', 'Details on a Crew that needs you: the helper’s own view in the docked run view (Message that helper, its own messages)', null,
    async h => { await fromCard(h, 'recovery-collaboration', 'crew-query-perf', 'collab-open-participant'); }, { canon: ['Crew'] }),
  viewFromCard('collab:view-waiting', 'A Crew started from the wand with no recording, opened from its waiting card: "Waiting to start", set up by you, nothing spent', async h => {
    await wandStart(h, 'crew', 'Export the collection to CSV without losing quotes or order.');
  }, async h => { const st = await h.ev(() => window.__pmxCollab); await fromCard(h, st.thread, st.run); }, { canon: ['Crew'] }),
  chat('collab:card-beside-view', 'The live BrainStorm card beside its open run view: Write the plan and One more debate round move to the view, the card says "Deciding in the panel beside the chat" (7.12)', async h => {
    await fromCard(h, 'plan-deep', 'brainstorm-provider-failover');
  }, { thread: 'plan-deep', run: 'brainstorm-provider-failover', canon: ['BrainStorm'] })
];
export default () => [
  ...CARD_SURFACES,
  ...VIEW_SURFACES,
  sheet('collab:crew-filled', 'Crew sheet with a job and Wonderer added (8.0, 8.1; a common case, 6.3)', 'crew', async h => {
    await typeJob(h, 'Export the collection to CSV without losing quotes or order. Add tests.');
    await addSpecialist(h, 'wonderer');
  }, { canon: ['Crew', ...SPECIALISTS] }),
  sheet('collab:crew-both-specialists', 'Crew sheet with both specialists (beyond the common case: the side column may scroll at 1280)', 'crew', async h => {
    await addSpecialist(h, 'wonderer'); await addSpecialist(h, 'grillMe');
  }, { canon: ['Crew', ...SPECIALISTS], common: false }),
  sheet('collab:brainstorm-specialists', 'BrainStorm with both specialists (a common case, 6.3)', 'brainstorm', async h => {
    await addSpecialist(h, 'wonderer'); await addSpecialist(h, 'grillMe');
  }, { canon: ['BrainStorm', ...SPECIALISTS] }),
  sheet('collab:crew-removed', 'Crew sheet after a helper was removed: "Removed Builder · Bring back"', 'crew', async h => {
    await click(h, `${SHEET} .collab-participant-editor-row:nth-child(2) [data-action="collab-modal-remove-participant"]`);
  }, { canon: ['Crew'] }),
  sheet('collab:crew-five', 'Crew sheet with five helpers (may scroll at 1280 after yielding)', 'crew', async h => { await addHelpers(h, 2); },
    { canon: ['Crew'], rosterScrollAfterYield: ['1280x800'] }),
  sheet('collab:crew-eight', 'Crew sheet at the limit: eight helpers, the add control names the limit', 'crew', async h => { await addHelpers(h, 5); },
    { canon: ['Crew'], common: false }),
  sheet('collab:crew-refused', 'Crew sheet with an offline model (E-03): the row notice with Fix, data-failure, Start disabled with the sentence', 'crew', async h => {
    await typeJob(h, 'Export the collection to CSV.');
    await click(h, `${SHEET} .collab-participant-editor .collab-participant-editor-row:first-child [data-action="collab-pick-model"]`);
    await h.ev(() => { const o = document.querySelector('.overlay-menu.model-menu [data-action="set-model"][data-value="kimi-k3-turbo"]'); if (o) o.click(); });
    await h.page.keyboard.press('Escape'); await h.wait(250);
    await h.page.mouse.move(4, 4);
  }, { canon: ['Crew'] }),
  sheet('collab:crew-advanced', 'Crew sheet, the Advanced page (shared rows and Technical details)', 'crew', async h => {
    await click(h, `${SHEET} [data-action="pmx-advanced"][data-value="1"]`); await h.page.mouse.move(4, 4);
  }, { canon: [] }),
  sheet('collab:crew-auto-swap', 'Crew Auto opened from the Crew sheet (the swap, "Back to Crew")', 'crew', async h => {
    await click(h, `${SHEET} [data-action="collab-open-configure"][data-auto="1"]`); await h.page.mouse.move(4, 4);
  }, { canon: ['Crew Auto'], ledger: false }),
  /* 1280 x 800: the short-window reflow keeps the Crew Auto promise and its Settings… (E-02, G-27) under the roster */
  sheet('collab:crew-auto-swap-1280', 'Crew Auto opened from the Crew sheet in a 1280 x 800 window (the promise and Settings… survive the short-window reflow)', 'crew', null,
    { canon: ['Crew Auto'], ledger: false, sizes: [[1440, 900]], async open(h) {
      await h.setSize(1280, 800); await openSheet(h, 'crew');
      await click(h, `${SHEET} [data-action="collab-open-configure"][data-auto="1"]`); await h.page.mouse.move(4, 4); await h.settle();
      if (!(await h.ev(() => !!(window.PM56_COLLAB.draft() && window.PM56_COLLAB.draft().autoMode)))) throw new Error('Settings… did not open the Crew Auto sheet at 1280 x 800');
    } }),
  /* the preview tray (R-02): pmx-verify skips [data-pmx-preview], so this surface checks that the approved frame's
     head, sentence and track are whole inside the 82 px tray, at 1280 x 800 and 1024 x 768 */
  ...['crew', 'chat_room', 'brainstorm', 'review'].map(kind => sheet('collab:preview-tray-' + kind, 'The ' + kind + ' sheet\u2019s "In your chat" preview is whole inside its tray at 1280 x 800 and 1024 x 768', kind, null,
    /* the no-scroll rule is wand.mjs's (these surfaces check the tray); the page ends at 1280 x 800, where the Chat Room
       roster with its Moderator scrolls after the full yield: the lead's ruling (the Crew 4/5 rule), applied here too */
    { canon: [], ledger: false, common: false, sizes: [[1440, 900]], rosterScrollAfterYield: kind === 'chat_room' ? ['1280x800'] : [], async open(h) {
      for (const [w, hh] of [[1024, 768], [1280, 800]]) {
        await h.setSize(w, hh); await openSheet(h, kind); await h.settle(); await h.wait(300);
        const cut = await h.ev(() => {
          const tray = document.querySelector('#pmOverlayRoot .pmx-preview-tray'); if (!tray) return ['no tray'];
          const t = tray.getBoundingClientRect(), out = [];
          tray.querySelectorAll('.pmx-run-head, .pmx-sentence, .pmx-track').forEach(e => { const r = e.getBoundingClientRect(); if (r.height && (r.top < t.top - 0.5 || r.bottom > t.bottom + 0.5 || r.right > t.right + 0.5)) out.push(e.className + ' ' + Math.round(r.top - t.top) + '..' + Math.round(r.bottom - t.top) + ' of ' + Math.round(t.height)); });
          return out;
        });
        if (cut.length) throw new Error(w + 'x' + hh + ' preview cut: ' + cut.join('; '));
        if (w === 1024) await h.closeAll();
      }
    } })),
  /* G-26: the evidence sheet, reached the way a person reaches it (the seed Crew's card -> Open Panel -> Mark as done…) */
  sheet('collab:evidence', 'The evidence sheet (G-26): "Mark this part as done?", Mark as done disabled with its reason until there is text', 'crew', null,
    { canon: [], ledger: false,
      change: async h => { const f = await h.page.$('#pmOverlayRoot [data-collab-evidence-input]'); if (f) { await f.click(); await h.page.keyboard.type('x'); } },
      async open(h) {
        await h.closeAll(); await closeRunViews(h);
        await fromCard(h, 'recovery-collaboration', 'crew-query-perf');
        await click(h, '.collab-view [data-action="collab-crew-complete"]'); await h.page.mouse.move(4, 4); await h.settle();
        if (!(await h.ev(() => !!document.querySelector('#pmOverlayRoot .pmx-sheet.collab-evidence-dialog')))) throw new Error('Mark as done… did not open the evidence sheet');
      },
      async after(h) { await h.closeAll(); await closeRunViews(h); } }),
  sheet('collab:review-single', 'Review with one reviewer (Single Agent)', 'review', async h => {
    for (let i = 0; i < 2; i++) await click(h, `${SHEET} .pmx-collab-count [data-action="pmx-step"][data-delta="-1"]`);
    await h.page.mouse.move(4, 4);
  }, { canon: ['Review', 'Single Agent'] }),
  sheet('collab:review-deep', 'Review from the "Deep audit" team: five reviewers, one a Critical Advisor (E-37)', 'review', async h => {
    await pickChoice(h, 'recipe', 'deep');
  }, { canon: ['Review', 'Multi-Pass Review'], rosterScrollAfterYield: ['1280x800'] }),
  sheet('collab:brainstorm-grill', 'BrainStorm with Grill Me added: the question budget reads 45', 'brainstorm', async h => {
    await addSpecialist(h, 'grillMe');
  }, { canon: ['BrainStorm', 'Grill Me'] })
];
