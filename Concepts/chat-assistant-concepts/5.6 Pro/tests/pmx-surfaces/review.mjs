/* REVIEW surfaces for tests/pmx-verify.mjs (package REVIEW, half A: DESIGN-SPEC 8.5 sheet and in-chat card;
   review-protocol.js sheetParts / cardParts). wand.mjs opens the Review sheet in its default state and collab.mjs
   covers Single Agent; review-view.mjs (REVIEW-B) covers the report. These are Review's own:
   - the sheet with five reviewers (a common case, 6.3), its Advanced page (Technical details names the command,
     IMPACT A1-53), and the re-run sheet ("Run another Review", "Last time: ...", "Run Another Review");
   - the card of the recorded example at every stage, through COLLAB's card frame composing PM56_REVIEW.cardParts
     on a real run: reading (sealed squares, never dispositions), comparing (the compact agreement grid), the result
     face (findings with severity glyph + word and agreement dots, the tick rule, Create To-Dos), after Create To-Dos,
     the Single Agent result (no agreement words or dots) and the receipt. The stages are reached through the
     protocol's own calls (submitPass, normalize, vote, finalize), the ones the demo's replay makes, deterministically
     and without its timer;
   - a reviewer that stops on a real run (A1-34), driven through COLLAB's participant calls (setOutcome timed_out,
     the card's own Retry / Continue with 2): one runs out of time while two still read (live face, no decision yet);
     every reviewer has stopped (the decision); Retry (the retrying face); the retried reviewer fails again (the
     decision comes back); Continue with 2 (the run goes on through the protocol: comparing notes over two);
   - the result card while its report is open beside the chat (7.12 pointer row);
   - the seeds whose Review needs you: the partial review (IMPACT A1-34: Retry) and the target that changed after
     the review started, each alone on the 'plain' thread through the ordinary collab-run transcript item.
   `canon` (A2-27a): the principle-10 names each state shows. */
const SHEET = '#pmOverlayRoot .pmx-sheet';
const S360 = n => ({ name: n, minCard: 360 });
async function click(h, sel) { if (!(await h.clickVisible(sel))) throw new Error('not found: ' + sel); await h.wait(250); await h.settle(); }
const QUIET_STEP = async h => { await h.clickVisible(`${SHEET} [data-action="pmx-step"][data-delta="1"]`); };

/* the recorded example admitted through its own sheet, then moved to `stage` by the protocol calls the demo's replay
   makes (the same recorded observations), without its timer */
async function reviewRun(h, flow, stage) {
  await h.closeAll();
  await h.ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorTabs = []; c.state.activeEditor = null; c.state.editorRevealed = false; });
  await h.demo('review-demo-start', flow);
  await click(h, `${SHEET} [data-action="collab-modal-commit"]`);
  const id = await h.ev(([flow, stage]) => {
    const R = window.PM56_REVIEW, C = window.PM56_COLLAB, a = window.PM56_REVIEW_DEMOS.snapshot(), r = C.run(a.runId);
    const trim = { id: 'spaces', findingKey: 'trim-query', category: 'correctness', severity: 'minor', claim: 'Padded queries miss valid entries', evidenceRefs: ['source', 'tests'], proposedRemediation: 'Trim the query before matching', expectedOutcome: 'The query "  alpha  " returns entry a.' };
    const order = { id: 'order', findingKey: 'preserve-ranking', category: 'correctness', severity: 'minor', claim: 'Matching entries lose their supplied ranking', evidenceRefs: ['source', 'tests', 'criteria'], proposedRemediation: 'Preserve input order when filtering', expectedOutcome: 'An empty query retains [z, a] in the supplied order.' };
    const perf = { id: 'perf', findingKey: 'pre-index-search', category: 'performance', severity: 'suggestion', claim: 'Pre-indexing may help large lists', evidenceRefs: ['performance'], proposedRemediation: 'Measure list-search latency before adding an index', expectedOutcome: 'A representative benchmark establishes whether indexing is needed.' };
    const results = flow === 'single' ? [[trim]] : [[trim], [Object.assign({}, trim, { id: 'spacing-confirmed' }), perf], [order]];
    const hash = r.review.targetPack.targetHashes.primary, ep = r.stopEpoch;
    const ok = x => { if (x && x.ok === false) throw new Error('protocol step refused: ' + x.error); };
    const stop = /^(stop|partial|retrying|retry-failed|continued)$/.test(stage);
    const upto = stop ? 1 : { start: 0, reading: 1, comparing: 2, result: 3, todos: 3, receipt: 3, beside: 3 }[stage];
    /* a stop stage: the last reviewer runs out of time; the others finish, except in 'stop' where only the first has */
    const submitN = stop ? (stage === 'stop' ? 1 : r.participants.length - 1) : upto === 1 ? 1 : 99;
    if (stop) ok(C.setOutcome(r.id, r.participants[r.participants.length - 1].id, 'timed_out', { reason: 'No response within the pass time.' }));
    if (upto >= 1) r.review.passes.slice(0, submitN).forEach((p, i) => ok(R.submitPass(r.id, { attemptId: p.id, assignmentRevision: p.assignmentRevision, epoch: ep, targetHash: hash, findings: results[i % results.length] })));
    if (upto >= 2) ok(R.normalize(r.id));
    if (upto >= 3) {
      if (r.participants.length > 1) for (const f of r.review.findings) r.participants.forEach((p, i) => {
        let d = 'confirmed', why = 'The frozen source and fixture checks reproduce the mismatch.';
        if (f.findingKey === 'preserve-ranking' && i === 1) { d = 'uncertain'; why = 'Alphabetical ordering could be intentional; confirm that the supplied ranking is the required order.'; }
        if (f.findingKey === 'pre-index-search') { d = i === 1 ? 'rejected' : 'uncertain'; why = i === 1 ? 'An index is not justified by the supplied evidence.' : 'No representative latency measurements are in this target pack.'; }
        ok(R.vote(r.id, p.id, f.id, { epoch: ep, targetHash: hash, disposition: d, confidence: d === 'confirmed' ? 'high' : 'low', reason: why, evidenceRefs: f.evidenceRefs }));
      });
      ok(R.finalize(r.id, r.review.findings.map(f => ({ findingId: f.id, disposition: f.findingKey === 'pre-index-search' ? 'uncertain' : 'confirmed', reason: 'Recorded adjudication.' }))));
    }
    window.PM56_EXT.ctx().renderApp();
    return r.id;
  }, [flow, stage]);
  await h.settle();
  if (stage === 'todos') await click(h, `.transcript [data-action="collab-review-create-todos"][data-run="${id}"]`);
  /* the card's own decision buttons (A1-34) */
  if (stage === 'retrying' || stage === 'retry-failed') await click(h, `.transcript [data-action="review-retry"][data-run="${id}"]`);
  if (stage === 'retry-failed') { await h.ev(id => { const C = window.PM56_COLLAB, r = C.run(id); C.setOutcome(id, r.participants[r.participants.length - 1].id, 'timed_out', { reason: 'No response within the pass time.' }); window.PM56_EXT.ctx().renderApp(); }, id); await h.settle(); }
  if (stage === 'continued') await click(h, `.transcript [data-action="review-accept-partial"][data-run="${id}"]`);
  /* the receipt: Expand, then Collapse (G-19: open -> closed gives a finished run its receipt) */
  if (stage === 'receipt') for (let i = 0; i < 2; i++) { await h.ev(id => { const b = document.querySelector('.transcript [data-action="collab-toggle-expand"][data-run="' + id + '"]'); if (b) b.click(); }, id); await h.wait(200); }
  await h.page.mouse.move(4, 4); await h.settle();
  await h.ev(() => { const t = document.querySelector('.transcript'); if (t) { t.style.scrollBehavior = 'auto'; t.scrollTop = t.scrollHeight; } });
  return id;
}
/* one seed run alone on the 'plain' thread, through the ordinary collab-run transcript item */
async function showAlone(h, pick) {
  await h.closeAll();
  await h.ev(pick => {
    const c = window.PM56_EXT.ctx(), C = window.PM56_COLLAB;
    const run = C.runs().find(r => r.kind === 'review' && (pick === 'partial' ? r.status === 'blocked' : !!(r.review && r.review.staleTarget && !r.review.staleTarget.chosen)));
    if (!run) throw new Error('no seed Review for ' + pick);
    c.state.dialog = null; c.state.menu = null;
    const t = c.state.threads.find(x => x.id === 'plain');
    t.messages = [{ id: 'rva-u', type: 'text', role: 'user', body: 'Review the change before I merge it.' }, { id: 'rva-run:' + run.id, type: 'collab-run', role: 'assistant', runId: run.id }];
    if (c.state.selectedThread !== 'plain') c.switchThread('plain'); else c.renderApp();
    const tr = document.querySelector('.transcript'); if (tr) { tr.style.scrollBehavior = 'auto'; tr.scrollTop = 0; }
  }, pick);
  await h.settle();
}
/* the run is made once (setup); every theme and layout then shows its thread again (open) */
async function showRun(h, beside) {
  await h.closeAll();
  await h.ev(() => {
    const c = window.PM56_EXT.ctx(), s = window.__rvSurface; if (!s) return;
    c.state.dialog = null; c.state.menu = null; c.state.editorRevealed = false;
    if (c.state.selectedThread !== s.threadId) c.switchThread(s.threadId); else c.renderApp();
  });
  await h.settle();
  /* 7.12: the report opened from the card's own Open Panel, beside the chat */
  if (beside) { await h.ev(() => { const s = window.__rvSurface, b = document.querySelector('.transcript [data-action="review-open-report"][data-run="' + s.runId + '"]'); if (b) b.click(); }); await h.wait(450); await h.settle(); }
  await h.ev(() => { const t = document.querySelector('.transcript'); if (t) { t.style.scrollBehavior = 'auto'; t.scrollTop = t.scrollHeight; } });
}
function card(id, title, flow, stage, o = {}) {
  return {
    id, title, kind: 'chat', tags: ['app', 'review', 'card'], canon: o.canon || [S360('Review')],
    async setup(h) { if (o.seed) return; const runId = await reviewRun(h, flow, stage); await h.ev(runId => { window.__rvSurface = { runId, threadId: window.PM56_COLLAB.run(runId).threadId }; }, runId); },
    async open(h) { if (o.seed) await showAlone(h, o.seed); else await showRun(h, stage === 'beside'); },
    async after(h) { await h.closeAll(); }
  };
}
function sheet(id, title, then, extra = {}) {
  return Object.assign({
    id, title, kind: 'sheet', tags: ['app', 'review', 'sheet'], common: true, canon: extra.canon || ['Review'], change: QUIET_STEP,
    async open(h) { if (!(await h.wandDialog('work', '[data-action="collab-open-configure"][data-kind="review"]:not([data-auto])'))) throw new Error('no Review wand row'); await h.page.mouse.move(4, 4); if (then) await then(h); await h.settle(); },
    async after(h) { await h.closeAll(); }
  }, extra);
}

export default () => [
  sheet('review:sheet-five', 'Review sheet with five reviewers (a common case, 6.3: the plate yields first)', async h => {
    for (let i = 0; i < 2; i++) await click(h, `${SHEET} [data-action="collab-modal-add-participant"]`);
    await h.page.mouse.move(4, 4);
  }, { canon: ['Review', 'Multi-Pass Review'], rosterScrollAfterYield: ['1280x800'] }),
  sheet('review:sheet-advanced', 'Review sheet, the Advanced page (Technical details names cmd.collaboration.start)', async h => {
    await click(h, `${SHEET} [data-action="pmx-advanced"][data-value="1"]`); await h.page.mouse.move(4, 4);
  }, { canon: [], common: false }),
  /* the finished run is made once (setup), so the effects ledger's opens never count a run of their own */
  /* KNOWN (COLLAB request (i) in REVIEW-A-NOTES): the re-run restores the target through collaboration.js
     targetChoiceOf, which maps the recorded pack (targetKind 'diff', filterEntries.js) to "The last answer", so the
     trigger and the read-back say "the last answer". Shown as it is, not masked: the read-back is what Start would do. */
  Object.assign(sheet('review:sheet-rerun', 'Run another Review: "Last time: ..." in the lead, primary "Run Another Review" (8.5, MOD-15; known: target shows "The last answer", COLLAB request (i))', null, { canon: ['Review'] }), {
    async setup(h) { const runId = await reviewRun(h, 'multi', 'result'); await h.ev(runId => { window.__rvSurface = { runId, threadId: window.PM56_COLLAB.run(runId).threadId }; }, runId); await h.closeAll(); },
    async open(h) {
      await h.closeAll();
      const id = await h.ev(() => window.__rvSurface.runId);
      await h.action('collab-review-run-again', { run: id }); await h.wait(400);
      await h.page.mouse.move(4, 4); await h.settle();
    }
  }),
  card('review:card-reading', 'Review card while the reviewers read alone: sealed squares, never dispositions (8.5 Reading)', 'multi', 'reading', { canon: [S360('Review'), 'Multi-Pass Review'] }),
  card('review:card-comparing', 'Review card while comparing notes: the compact agreement grid (8.5 Comparing)', 'multi', 'comparing'),
  card('review:card-result', 'Review result face: findings with severity and agreement, the tick rule, Create To-Dos (8.5 Finished)', 'multi', 'result', { canon: [S360('Review'), 'Send Findings To Agent'] }),
  card('review:card-todos', 'Review result after Create To-Dos: "To-Do created · Open" in place, "Nothing was fixed." (8.5)', 'multi', 'todos'),
  card('review:card-single', 'Single Agent result: "Single pass", no agreement words or dots (8.5)', 'single', 'result'),
  card('review:card-stopped-live', 'One reviewer ran out of time while the others read: its lane says so, the live face stays, no decision yet (A1-34)', 'multi', 'stop', { canon: [S360('Review')] }),
  card('review:card-partial', 'Every reviewer has stopped and one ran out of time: Retry · Continue with 2 · Cancel (A1-34)', 'multi', 'partial', { canon: [S360('Review'), 'Retry'] }),
  card('review:card-retrying', 'After Retry: the retried reviewer is queued to try again (A1-34)', 'multi', 'retrying', { canon: [S360('Review')] }),
  card('review:card-retry-failed', 'The retried reviewer ran out of time again: the decision comes back (A1-34)', 'multi', 'retry-failed', { canon: [S360('Review'), 'Retry'] }),
  card('review:card-continued', 'Continue with 2: the run goes on with the two who finished, comparing their notes (A1-34)', 'multi', 'continued', { canon: [S360('Review')] }),
  card('review:card-beside-report', 'Result card while its report is open beside the chat: the 7.12 pointer, chevron and More on one row', 'multi', 'beside', { canon: [] }),
  card('review:card-receipt', 'Review receipt: "Review · 2 to fix, 1 idea · time · Open Panel" (8.5, G-19)', 'multi', 'receipt', { canon: [] }),
  card('review:seed-partial', 'Partial review needs you: "Only 2 of 3 reviewers finished" with Retry (IMPACT A1-34)', null, null, { seed: 'partial', canon: [S360('Review'), 'Retry'] }),
  card('review:seed-stale', 'The target changed after the review started: Review the new version / Finish on the old snapshot (8.5)', null, null, { seed: 'stale' })
];
