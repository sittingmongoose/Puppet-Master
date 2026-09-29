/* STORM surfaces for tests/pmx-verify.mjs (package STORM, DESIGN-SPEC 8.4; STORM-A: the sheet and the card).
   wand.mjs opens the BrainStorm sheet in its default state (wand:brainstorm) and collab.mjs adds both specialists and
   Grill Me. These are the other states the blueprint draws, each reached through the sheet's own controls:
   - a question typed and a must-have written (the must-haves field, the lock on the plate's stem);
   - two long rules typed (the field grows to three lines and scrolls past them, never a half-cut line);
   - the recorded example's sheet (the guided demo: its rules read-only, "This recording uses its own 2 rules.", and
     the lean diverge-converge plate beside the guide strip);
   - two helpers (the richest plate: chapters, named helpers behind screens, the branches merging to You);
   - six helpers (the plate yields to its strip; beyond the common case, 6.3).
   And the card through the phases of a recorded BrainStorm, stepped with the protocol's own validated ingress (the
   same calls brainstorm-demo-batch4.js makes on its 450 ms clock, one phase at a time so each density holds still):
   sealed notes (3 of 4 ideas in), the debate, the vote staged as positions (3 of 4 voted; and all 4 with the popular
   option ruled out), ready to write the plan (the accent decision, whose sentence says what the rule did), the result
   face with the kept dissent (constraint flow: a rule rules the popular option out), and the Wonderer's run at Write
   the plan while its ideas still need a decision (the warm row that prints why Write the plan waits). `cardSurfaces(prefix, extra)` is exported so a scratch run can wrap the same steps. */
const SHEET = '#pmOverlayRoot .pmx-sheet';
const CANON = ['BrainStorm', 'Wonderer', 'Grill Me'];
async function openSheet(h) {
  const ok = await h.wandDialog('work', '[data-action="collab-open-configure"][data-kind="brainstorm"]');
  if (!ok) throw new Error('wand row not found: BrainStorm');
  await h.page.mouse.move(4, 4);
}
async function click(h, sel) { if (!(await h.clickVisible(sel))) throw new Error('not found: ' + sel); await h.wait(250); await h.settle(); }
async function typeInto(h, sel, text) {
  const f = await h.page.$(sel); if (!f) throw new Error('no field ' + sel);
  await f.click(); await h.page.keyboard.type(text, { delay: 2 }); await h.wait(200);
}
const QUIET_STEP = async h => { await h.clickVisible(`${SHEET} [data-action="pmx-step"][data-delta="1"]`); };
function sheet(id, title, then, extra = {}) {
  return Object.assign({
    id, title, kind: 'sheet', tags: ['app', 'storm'], common: true, canon: CANON, change: QUIET_STEP,
    async open(h) { await openSheet(h); if (then) await then(h); await h.settle(); },
    async after(h) { await h.closeAll(); }
  }, extra);
}

/* ---- the card: start the recorded example from its guided demo, then step the protocol ---- */
async function startRecorded(h, flow) {
  await h.closeAll();
  await h.demo('brainstorm-demo-start', flow);
  await h.ev(() => { const b = [...document.querySelectorAll('#pmOverlayRoot .primary-button')].filter(x => !x.disabled).at(-1); if (b) b.click(); });
  await h.wait(700);
  const ok = await h.ev(flow => {
    const C = window.PM56_COLLAB, c = window.PM56_EXT.ctx();
    const r = C.runsForThread(c.state.selectedThread).find(r => r.brainstorm && r.brainstorm.protocolVersion);
    if (!r) return false;
    window.__stormRun = r.id; window.__stormRec = window.PM56_BRAINSTORM_DEMOS.expected(r, flow);
    return true;
  }, flow);
  if (!ok) throw new Error('the recorded BrainStorm did not start');
}
/* each step is one set of validated protocol calls, run in the page */
const STEPS = {
  blind: n => { const B = window.PM56_BRAINSTORM, r = window.PM56_COLLAB.run(window.__stormRun), a = r.brainstorm.attempts, x = { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash };
    for (let i = 0; i < n; i++) if (a[i].status !== 'completed') B.submitProposal(r.id, { ...x, attemptId: a[i].id, assignmentRevision: a[i].assignmentRevision, proposal: JSON.parse(JSON.stringify(window.__stormRec.proposals[i])) }); },
  normalize: () => { const B = window.PM56_BRAINSTORM, r = window.PM56_COLLAB.run(window.__stormRun); B.normalize(r.id, { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash }); },
  debate: () => { const B = window.PM56_BRAINSTORM, r = window.PM56_COLLAB.run(window.__stormRun), a = r.brainstorm.attempts, x = { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash };
    for (let round = r.brainstorm.debates.length + 1; round <= r.config.debateRounds; round++) B.debate(r.id, { ...x, round, messages: [
      { participantId: a[0].participantId, body: round === 1 ? 'Separate input handling from query work, but preserve result order and request identity.' : 'Measure startup and transfer costs before choosing a default cutoff.', evidenceRefs: ['query', 'latency'] },
      { participantId: a[1].participantId, body: 'A simple local path remains the rollback. No latency benefit has been demonstrated yet.', evidenceRefs: ['requirements', 'capabilities'] }] }); },
  evidence: () => { const B = window.PM56_BRAINSTORM, r = window.PM56_COLLAB.run(window.__stormRun);
    B.recordEvidence(r.id, { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash, checks: r.brainstorm.proposals.map(q => ({ proposalId: q.id, evidenceRefs: q.evidenceRefs, summary: q.facts.networkRequired ? 'Network dependency conflicts with the offline constraint.' : 'Local query behavior is consistent with the frozen requirement; speed remains unmeasured.' })) }); },
  vote: idx => { const B = window.PM56_BRAINSTORM, r = window.PM56_COLLAB.run(window.__stormRun), a = r.brainstorm.attempts, x = { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash };
    idx.forEach(i => B.vote(r.id, a[i].participantId, { ...x, ...JSON.parse(JSON.stringify(window.__stormRec.votes[i])) })); },
  decide: () => { const B = window.PM56_BRAINSTORM, r = window.PM56_COLLAB.run(window.__stormRun);
    B.decide(r.id, { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash, selectedProposalId: 'worker', reason: 'Choose the snapshot worker, keep the simple local fallback, and measure before claiming a speedup.', steps: window.__stormRec.steps }); },
  write: () => { const c = window.PM56_EXT.ctx(), b = document.createElement('button'); b.dataset.run = window.__stormRun; window.PM56_EXT._actions['collab-brainstorm-synthesize'](c, b, new Event('click'));
    if (c.state.activeEditor && c.closeEditor) c.closeEditor(c.state.activeEditor); c.state.editorRevealed = false; }
};
async function step(h, name, arg) { await h.ev(([src, arg]) => { (0, eval)('(' + src + ')')(arg); window.PM56_EXT.ctx().renderApp(); }, [STEPS[name].toString(), arg]); await h.wait(500); }
async function showCard(h) { await h.ev(() => { const el = document.querySelector('.transcript .collab-kind-brainstorm'); if (el) el.scrollIntoView({ block: 'center' }); }); await h.wait(300); }
const UPTO = async (h, last) => {
  const order = [['blind', 4], ['normalize'], ['debate'], ['evidence'], ['vote', [0, 1, 2, 3]], ['decide'], ['write']];
  for (const [name, arg] of order) { await step(h, name, arg); if (name === last) break; }
};
const PHASES = [
  ['blind', 'the blind round: 3 of 4 ideas in, as sealed notes', 'synthesis', h => step(h, 'blind', 3)],
  ['debate', 'the debate: the current speaker quoted, the previous turn folded', 'synthesis', h => UPTO(h, 'debate')],
  ['vote', 'the vote staged as positions: 3 of 4 voted, one deciding in the aisle', 'synthesis', async h => { await UPTO(h, 'evidence'); await step(h, 'vote', [1, 2, 3]); }],
  ['vote-ruled', 'every helper has voted and the popular option is ruled out (struck, "ruled out · 3 for"; no aisle)', 'constraint', h => UPTO(h, 'vote')],
  ['ready', 'ready to write the plan (the accent decision; a rule ruled the popular option out)', 'constraint', h => UPTO(h, 'decide')],
  ['result', 'the one-Plan result face with the kept dissent (the Plan card is born beneath it)', 'constraint', h => UPTO(h, 'write')]
];
/* the Wonderer's run (b13 "leads"): the core round is played, so the card stands at Write the plan while Wonderer's
   ideas still need a decision */
async function wondererAtWrite(h) {
  await h.closeAll();
  await h.action('b13-start', { flow: 'leads' }); await h.wait(900);
  if (!(await h.clickVisible('#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('the Wonderer sheet did not start');
  await h.wait(700);
  await h.ev(() => { const C = window.PM56_COLLAB, c = window.PM56_EXT.ctx(); const r = C.runsForThread(c.state.selectedThread).filter(r => r.wonderer).at(-1); window.PM56_WONDERER.playCore(r); });
  await h.page.waitForFunction(() => { const C = window.PM56_COLLAB, c = window.PM56_EXT.ctx(); const r = C.runsForThread(c.state.selectedThread).filter(r => r.wonderer).at(-1); return r && r.brainstorm.phase === 'synthesis'; }, null, { timeout: 30000 });
  await h.ev(() => { const c = window.PM56_EXT.ctx(); for (const t of [...(c.state.editorTabs || [])]) c.closeEditor(t.id || t); c.state.editorRevealed = false; c.renderApp(); });
  await h.wait(500);
}
export function cardSurfaces(prefix = 'storm', extra = {}) {
  return PHASES.map(([name, title, flow, go]) => Object.assign({
    id: prefix + ':card-' + name, title: 'BrainStorm card, ' + title + ' (8.4, 7.1)', kind: 'chat', tags: ['app', 'storm', 'chat'], canon: [{ name: 'BrainStorm', minCard: 360 }],
    async open(h) { if (extra.setup) await extra.setup(h); await startRecorded(h, flow); await go(h); await h.settle(); await showCard(h); },
    async after(h) { await h.closeAll(); }
  }, extra.surface || {})).concat([Object.assign({
    id: prefix + ':card-wonderer-open', title: 'BrainStorm card with Wonderer: decide on Wonderer’s ideas first, then write the plan (8.4, b13 convergence)', kind: 'chat', tags: ['app', 'storm', 'chat'], canon: [{ name: 'BrainStorm', minCard: 360 }, 'Wonderer'],
    async open(h) { if (extra.setup) await extra.setup(h); await wondererAtWrite(h); await h.settle(); await showCard(h); },
    async after(h) { await h.closeAll(); }
  }, extra.surface || {})]);
}
export default () => [
  sheet('storm:sheet-must', 'BrainStorm sheet with a question and a must-have (8.4; the plate locks the stem)', async h => {
    await typeInto(h, `${SHEET} textarea[data-collab-input="purpose"]`, 'How should search stay fast without uploading anything?');
    await typeInto(h, `${SHEET} textarea[data-collab-input="mustHaves"]`, 'Nothing leaves this device');
    await h.page.mouse.move(4, 4);
  }),
  sheet('storm:sheet-must-two', 'BrainStorm sheet with two long rules typed (the must-haves field grows, then scrolls; no half-cut line)', async h => {
    await typeInto(h, `${SHEET} textarea[data-collab-input="mustHaves"]`, 'Search must work without sending collection contents to a server.');
    await h.page.keyboard.press('Enter');
    await h.page.keyboard.type('Search must preserve the supplied result ranking.', { delay: 2 });
    await h.wait(200); await h.page.mouse.move(4, 4);
  }),
  Object.assign(sheet('storm:sheet-recorded', 'BrainStorm sheet of the recorded example (the guided demo: its own rules read-only, the lean plate beside the guide strip)'), {
    /* the guided demo opens its own chat before the sheet (a thread and its first message, by design), so the effects
       ledger, whose baseline is taken before open(), would count the demo's own chat: opted out as crew:recorded-sheet is */
    ledger: false,
    /* not a 6.3 common case (the crew:recorded-sheet ruling): the guide strip takes 35 px from both columns. It fits
       without scrolling at 1440 x 900 in every theme; at 1280 x 800 in retro the roster and the side column (COLLAB's
       two-line "This recorded example uses its own team." shelf notes) overflowed before this step too (STORM-A-NOTES) */
    common: false,
    async open(h) { await h.closeAll(); await h.demo('brainstorm-demo-start', 'constraint'); await h.wait(600); await h.page.mouse.move(4, 4); await h.settle(); },
    async after(h) { await h.closeAll(); await h.action('brainstorm-demo-close'); }
  }),
  sheet('storm:sheet-two', 'BrainStorm sheet with two helpers (the full plate)', async h => {
    for (let i = 0; i < 2; i++) await click(h, `${SHEET} .collab-participant-editor-row:last-child [data-action="collab-modal-remove-participant"]`);
    await h.page.mouse.move(4, 4);
  }),
  sheet('storm:sheet-six', 'BrainStorm sheet with six helpers (the plate yields to its strip; beyond the common case)', async h => {
    for (let i = 0; i < 2; i++) await click(h, `${SHEET} [data-action="collab-modal-add-participant"]`);
    await h.page.mouse.move(4, 4);
  }, { common: false }),
  ...cardSurfaces('storm')
];
