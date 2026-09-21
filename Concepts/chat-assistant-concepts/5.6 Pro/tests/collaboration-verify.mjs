/* Additive Correction v4 (CONCEPT-003, QMAX-002/003): the BrainStorm base is
 * 20 and the Grill Me extension is 25, so the effective maximum is 45. The
 * retired 15 / +10 / 25 arithmetic was updated in place here rather than
 * appended, so no active assertion still asserts the old values.
 *
 * collaboration-verify.mjs — Collaborative Workflows, concept side.
 *
 * Crew, BrainStorm, Review and Chat Room are claimed to be ONE runtime with
 * four protocols, not four products. The claim worth testing is structural
 * (one run shape, one participant shape, one transcript card family) AND
 * behavioral (each protocol's own negative paths actually refuse). This
 * harness drives the real controls — the Wand menu, the configuration modal,
 * the transcript card, the full panel, the composer — and asserts the
 * resulting STATE, never the bundle text.
 *
 * A run's card is only in the DOM once its owning thread is selected — the
 * four seed runs live on four different threads (query / plan-deep /
 * subagents / plain) — so every card assertion below selects that run's
 * thread first, the same trap assistant-plan-verify.mjs and this wave's
 * todo-runtime-verify.mjs both document.
 *
 *   node tests/collaboration-verify.mjs            # against index.html
 *   node tests/collaboration-verify.mjs --json     # machine-readable
 */
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const TARGET = 'file://' + resolve(ROOT, 'index.html');
const JSON_OUT = process.argv.includes('--json');

const results = [];
const consoleErrors = [];
let page, browser;

function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  if (!JSON_OUT) console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}
const ev = (fn, arg) => page.evaluate(fn, arg);

async function clickSel(sel) {
  const el = await page.$(sel);
  if (!el) return false;
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await el.click({ force: true, timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(140);
  return true;
}
async function selectThread(id) {
  await clickSel(`[data-action="select-thread"][data-id="${id}"]`);
  await page.waitForTimeout(250);
}
/* app.js's Escape handler closes ONE overlay layer per press (menu first,
   then dialog) — state.menu and state.dialog are independent and can both be
   open at once (renderOverlays() renders both). Two presses reliably clears
   both, so every open-a-menu / open-a-dialog helper starts from a known-empty
   overlay state instead of accumulating a lingering Wand menu behind a
   dialog, which both breaks the next open-menu toggle AND visually overlaps
   later clicks at their real screen coordinates. */
async function escapeAll() {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(130);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(130);
}
async function openWand() {
  await escapeAll();
  await clickSel('[data-action="open-menu"][data-menu="wand"][data-menu-anchor="wand"]');
  await page.waitForTimeout(220);
}
/* Opens a kind's configuration modal the way the Wand menu offers it, and
   asserts the menu itself is gone once the dialog is up. An earlier build
   left the Wand menu open behind the new dialog (confirmed with a screenshot
   and elementFromPoint(): a real click on the dialog's own Commit/Start
   button landed on the Wand menu's "Crew…" row underneath it instead,
   because `collab-open-configure` never called ctx.closeMenu(), unlike
   `collab-crew-auto-toggle` which did). collaboration.js now calls
   ctx.closeMenu() from collab-open-configure too — see the positive
   assertion right after this helper's first use below. */
async function openConfigureFromWand(kind) {
  await openWand();
  let rowFound = await clickSel(`[data-action="collab-open-configure"][data-kind="${kind}"]`);
  if (!rowFound) {
    /* Wand rows live under collapsible groups; expand Workflows once and retry. */
    await clickSel('[data-action="polish-wand-group"][data-group="work"]');
    await page.waitForTimeout(200);
    rowFound = await clickSel(`[data-action="collab-open-configure"][data-kind="${kind}"]`);
  }
  await page.waitForTimeout(200);
  const dialogOpen = await ev(() => !!document.querySelector('.collab-configure'));
  const menuGone = await ev(() => !document.querySelector('[data-overlay="root-menu"]'));
  return { rowFound, dialogOpen, menuGone };
}
async function openPanel(runId) {
  await escapeAll();
  const ok = await clickSel(`[data-action="collab-open-panel"][data-run="${runId}"]`);
  await page.waitForTimeout(220);
  return ok;
}
async function closeDialog() {
  await escapeAll();
}
const getRun = id => ev(id => window.PM56_COLLAB.run(id), id);
const runsLen = () => ev(() => window.PM56_COLLAB.runs().length);

async function main() {
  browser = await chromium.launch({
    executablePath: process.env.PW_EXE || undefined,
    args: ['--no-sandbox', '--disable-gpu']
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  await page.goto(TARGET, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1200);

  check('collaboration.js registered PM56_COLLAB', (await ev(() => typeof window.PM56_COLLAB)) === 'object');
  const kinds = await ev(() => window.PM56_COLLAB.kinds);
  check('exactly four collaborative workflow kinds, closed', JSON.stringify(kinds) === JSON.stringify(['crew', 'brainstorm', 'review', 'chat_room']), JSON.stringify(kinds));

  /* ---- 1. ONE run shape, ONE participant shape, ONE transcript renderer — structural ---- */
  const shape = await ev(() => {
    const runs = window.PM56_COLLAB.runs();
    const runShapes = [...new Set(runs.map(r => Object.keys(r).sort().join(',')))];
    const parts = [];
    runs.forEach(r => r.participants.forEach(p => parts.push(Object.keys(p).sort().join(','))));
    const partShapes = [...new Set(parts)];
    return { total: runs.length, kinds: [...new Set(runs.map(r => r.kind))].sort(), runShapes: runShapes.length, partShapes: partShapes.length, sampleRunShape: runShapes[0], samplePartShape: partShapes[0] };
  });
  check('all four kinds are present in the seeded runs', JSON.stringify(shape.kinds) === JSON.stringify(['brainstorm', 'chat_room', 'crew', 'review']), JSON.stringify(shape.kinds));
  check('every run — regardless of kind — passes the SAME shape predicate (one CollaborativeRun record shape)',
    shape.runShapes === 1, `${shape.runShapes} distinct shapes across ${shape.total} runs`);
  check('every participant — regardless of kind — passes the SAME shape predicate (one Participant record shape)',
    shape.partShapes === 1, `${shape.partShapes} distinct shapes`);

  /* ---- run/thread map for the four seeds, and the shared-renderer + card/panel/participant sweep ---- */
  const SEED = [
    { id: 'crew-query-perf', kind: 'crew', thread: 'query' },
    { id: 'brainstorm-provider-failover', kind: 'brainstorm', thread: 'plan-deep' },
    { id: 'review-orchestrator-boundary', kind: 'review', thread: 'subagents' },
    /* chatroom-onboarding deliberately seeds on the 'crew' thread, not
       'plain' — collaboration.js's own source comment explains why: 'plain'
       is the concept's proof that an ordinary text-only thread renders zero
       cards (tests/audit.mjs asserts it), so seeding a run there would break
       that other invariant. */
    { id: 'chatroom-onboarding', kind: 'chat_room', thread: 'crew' }
  ];
  for (const s of SEED) {
    await selectThread(s.thread);
    const cardShape = await ev(id => {
      const c = document.querySelector(`.collab-card[data-run-id="${id}"]`);
      if (!c) return null;
      return {
        hasHead: !!c.querySelector(':scope > .collab-card-head'),
        hasBadge: !!c.querySelector('.collab-kind-badge'),
        hasTitle: !!c.querySelector('.collab-card-title'),
        hasStatus: !!c.querySelector('.collab-status'),
        hasMeta: !!c.querySelector('.collab-card-meta'),
        hasFoot: !!c.querySelector(':scope > .collab-card-foot')
      };
    }, s.id);
    check(`${s.kind}: the shared transcript card renders on its own thread with the common card structure`,
      cardShape && Object.values(cardShape).every(Boolean), JSON.stringify(cardShape));

    /* card expands inline, then pops out to a full panel showing the SAME run */
    await clickSel(`[data-action="collab-toggle-expand"][data-run="${s.id}"]`);
    const expanded = await ev(id => {
      const b = document.querySelector(`.collab-card[data-run-id="${id}"] .collab-card-body`);
      return !!(b && b.offsetParent !== null);
    }, s.id);
    check(`${s.kind}: Expand reveals the inline card body (participants, kind detail, usage)`, expanded);

    const opened = await openPanel(s.id);
    const panelRun = await ev(id => {
      const p = document.querySelector('.collab-panel');
      if (!p) return null;
      const run = window.PM56_COLLAB.run(id);
      return { titleMatches: p.querySelector('.drawer-head strong') && p.querySelector('.drawer-head strong').textContent === run.title, hasTranscriptTab: !!p.querySelector('[data-action="collab-panel-tab"][data-tab="transcript"]') };
    }, s.id);
    check(`${s.kind}: Open Panel pops the SAME run out to the full shared panel shell`, opened && panelRun && panelRun.titleMatches && panelRun.hasTranscriptTab, JSON.stringify(panelRun));

    /* Message targets the ordinary composer — chrome visibly names the destination */
    const destBefore = await ev(() => (window.PM56_RUNTIME.composer || {}).destination);
    await clickSel(`[data-action="collab-message"][data-run="${s.id}"]`);
    await page.waitForTimeout(200);
    const destAfter = await ev(id => ({ dest: (window.PM56_RUNTIME.composer || {}).destination, run: window.PM56_COLLAB.run(id) }), s.id);
    check(`${s.kind}: Message sets the composer destination to this run (destinationKind === kind)`,
      !destBefore && destAfter.dest && destAfter.dest.destinationKind === s.kind && destAfter.dest.refId === s.id,
      JSON.stringify(destAfter.dest));
    const ribbon = await ev(() => {
      const r = document.querySelector('.cs-ribbon');
      return r ? { visible: r.offsetParent !== null, text: r.textContent } : null;
    });
    check(`${s.kind}: the composer chrome visibly changes and names the destination`,
      ribbon && ribbon.visible && ribbon.text.includes(destAfter.run.title.split(' · ').pop() || destAfter.run.title),
      JSON.stringify(ribbon));
    await clickSel('.cs-ribbon-close[data-action="clear-destination"]');
    await page.waitForTimeout(150);
  }

  /* clicking a participant opens THAT participant's transcript: one with real
     output (crew's first member) and one with none yet (a truthful empty
     transcript, never a fabricated summary) */
  await selectThread('query');
  await openPanel('crew-query-perf');
  await clickSel('.collab-panel [data-action="collab-panel-tab"][data-tab="participants"]');
  const crewRun = await getRun('crew-query-perf');
  const firstPid = crewRun.participants[0].id;
  await clickSel(`.collab-panel [data-action="collab-open-participant"][data-participant="${firstPid}"]`);
  const pView1 = await ev(id => {
    const v = document.querySelector('.collab-participant-view');
    return v ? { heading: v.querySelector('h3').textContent, msgCount: v.querySelectorAll('.collab-msg').length, empty: !!v.querySelector('.collab-empty') } : null;
  }, firstPid);
  check('clicking a participant with real output opens their own transcript (not empty, not a fabricated summary)',
    pView1 && pView1.heading === crewRun.participants[0].role && pView1.msgCount > 0 && !pView1.empty, JSON.stringify(pView1));

  await selectThread('plan-deep');
  await openPanel('brainstorm-provider-failover');
  await clickSel('.collab-panel [data-action="collab-panel-tab"][data-tab="participants"]');
  const bsRunForP = await getRun('brainstorm-provider-failover');
  const emptyPid = bsRunForP.participants[2].id; /* Implementation — submitted no message of its own in the seed */
  /* a normal (non-substituted) participant on this same, still-open panel
     renders no effective-route chrome — checked here, before anything closes
     this panel, rather than after (a dialog read has to happen before its
     own close, not after — the earlier version of this check read null for
     exactly that reason). */
  const normalRoute = await ev(() => {
    const row = document.querySelector('.collab-panel .collab-participant');
    return row ? !row.querySelector('.collab-route-eff') : null;
  });
  await clickSel(`.collab-panel [data-action="collab-open-participant"][data-participant="${emptyPid}"]`);
  const pView2 = await ev(() => {
    const v = document.querySelector('.collab-participant-view');
    return v ? { msgCount: v.querySelectorAll('.collab-msg').length, hasEmptyNote: !!v.querySelector('.collab-empty') } : null;
  });
  check('a participant with no output yet opens a truthful EMPTY transcript, never a fabricated one',
    pView2 && pView2.msgCount === 0 && pView2.hasEmptyNote, JSON.stringify(pView2));
  await closeDialog();

  /* ================= 2. each kind opens its OWN configuration modal, prefilled from defaults ================= */
  const KIND_DEFAULT_CHECKS = {
    crew: d => d.rows.length === 3 && d.config.coordinator === 'parent_assistant' && d.config.assignmentStrategy === 'manager_directed' && d.config.parallelism === 3,
    brainstorm: d => d.rows.length === 4 && d.config.questionLimit === 20 && d.config.grillExtension === 25 && d.config.debateRounds === 2 && d.grillMe === false,
    review: d => d.rows.length === 3 && d.config.strategy === 'multi_pass',
    chat_room: d => d.rows.length === 4 && d.config.turnPolicy === 'moderated' && d.config.maxRounds === 5
  };
  for (const kind of kinds) {
    const opened = await openConfigureFromWand(kind);
    const draft = await ev(() => window.PM56_COLLAB.draft());
    check(`${kind}: opens its own configuration modal every invocation`, opened.rowFound && opened.dialogOpen, JSON.stringify(opened));
    check(`${kind}: opening it from the Wand menu closes the Wand menu (no stray menu left open/overlapping behind the dialog)`, opened.menuGone, String(opened.menuGone));
    check(`${kind}: the modal is populated from Settings defaults (RTC.definitions.${kind})`,
      draft && draft.kind === kind && KIND_DEFAULT_CHECKS[kind](draft), JSON.stringify(draft && { rows: draft.rows.length, config: draft.config, grillMe: draft.grillMe }));
    await clickSel('[data-action="collab-modal-cancel"]');
    await page.waitForTimeout(160);
    const afterCancel = await ev(() => ({ draft: window.PM56_COLLAB.draft(), dialogGone: !document.querySelector('.collab-configure') }));
    check(`${kind}: cancelling the modal starts nothing (no draft retained, no dialog left open)`, afterCancel.draft === null && afterCancel.dialogGone, JSON.stringify(afterCancel));
  }

  /* ================= 3. requested vs effective — drive a real substitution through the modal ================= */
  const openedCrew = await openConfigureFromWand('crew');
  check('the crew configure modal opened for the substitution drive-through', openedCrew.rowFound && openedCrew.dialogOpen);
  const runsBeforeSub = await runsLen();
  const firstRowPick = '.collab-participant-editor .collab-participant-editor-row:first-child [data-action="collab-pick-model"]';
  await clickSel(firstRowPick);
  await page.waitForTimeout(250);
  await clickSel('.overlay-menu.model-menu [data-action="set-model"][data-value="kimi-k3-turbo"]');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const draftAfterSelect = await ev(() => window.PM56_COLLAB.draft().rows[0].requestedModelId);
  check('selecting a demo-unavailable model updates the draft state immediately', draftAfterSelect === 'kimi-k3-turbo', draftAfterSelect);
  const effLineImmediately = await ev(() => !!document.querySelector('.collab-participant-editor-row:first-child .collab-route-eff'));
  await clickSel('[data-action="collab-modal-commit"]');
  await page.waitForTimeout(250);
  const newCrew = await ev(n => window.PM56_COLLAB.runs()[n], runsBeforeSub);
  check('committing the modal creates exactly one new run (Crew Auto aside)', (await runsLen()) === runsBeforeSub + 1, String(await runsLen()));
  check('the committed participant records BOTH requested and effective identity, with a substitution reason (never a silent substitution)',
    newCrew && newCrew.participants[0].requestedModelId === 'kimi-k3-turbo' &&
    newCrew.participants[0].effectiveModelId && newCrew.participants[0].effectiveModelId !== 'kimi-k3-turbo' &&
    !!newCrew.participants[0].substitutionReason,
    JSON.stringify({ requested: newCrew && newCrew.participants[0].requestedModelId, effective: newCrew && newCrew.participants[0].effectiveModelId, reason: newCrew && newCrew.participants[0].substitutionReason }));
  await selectThread(newCrew.threadId);
  await openPanel(newCrew.id);
  await clickSel('.collab-panel [data-action="collab-panel-tab"][data-tab="participants"]');
  const effRenderedAfterCommit = await ev(() => {
    const row = document.querySelector('.collab-panel .collab-participant');
    const eff = row ? row.querySelector('.collab-route-eff') : null;
    return eff ? eff.textContent : null;
  });
  check('the committed run\'s panel renders the requested/effective disclosure for the substituted participant',
    !!effRenderedAfterCommit && /effective|no substitute/i.test(effRenderedAfterCommit), effRenderedAfterCommit);
  check('a normal (non-substituted) participant renders no effective-route chrome — disclosure is not noise',
    normalRoute === true, String(normalRoute));
  check('the Configure modal repaints the requested/effective note immediately on selecting an unavailable model (no separate action needed to force a re-render)',
    effLineImmediately === true, String(effLineImmediately));
  await closeDialog();

  /* ================= 7. Review: 1–8 default 3, repeated models, one frozen pack, never auto-repairs ================= */
  await selectThread('subagents');
  const reviewSeed = await getRun('review-orchestrator-boundary');
  check('Multi-Pass Review reuses the same model on two reviewer slots without collapsing their identity',
    reviewSeed.participants[0].requestedModelId === 'opus5' && reviewSeed.participants[2].requestedModelId === 'opus5' &&
    reviewSeed.participants[0].id !== reviewSeed.participants[2].id,
    JSON.stringify(reviewSeed.participants.map(p => ({ id: p.id, model: p.requestedModelId }))));

  const openedReview1 = await openConfigureFromWand('review');
  check('the review configure modal opened for the reviewer-count bounds drive-through', openedReview1.rowFound && openedReview1.dialogOpen);
  const reviewDraft0 = await ev(() => window.PM56_COLLAB.draft());
  check('Multi-Pass Review defaults to exactly 3 reviewers', reviewDraft0.rows.length === 3, String(reviewDraft0.rows.length));
  for (let i = 0; i < 5; i++) await clickSel('[data-action="collab-modal-add-participant"]');
  const at8 = await ev(() => ({ n: window.PM56_COLLAB.draft().rows.length, disabled: document.querySelector('[data-action="collab-modal-commit"]').disabled, warn: !!document.querySelector('.collab-limit-warn') }));
  check('Review accepts up to 8 reviewers with Commit still enabled', at8.n === 8 && !at8.disabled && !at8.warn, JSON.stringify(at8));
  await clickSel('[data-action="collab-modal-add-participant"]');
  const at9 = await ev(() => ({ n: window.PM56_COLLAB.draft().rows.length, disabled: document.querySelector('[data-action="collab-modal-commit"]').disabled, warn: !!document.querySelector('.collab-limit-warn') }));
  check('a 9th reviewer goes out of range: Commit disables and the modal discloses it', at9.n === 9 && at9.disabled && at9.warn, JSON.stringify(at9));
  await clickSel('[data-action="collab-modal-cancel"]');
  await page.waitForTimeout(160);

  await selectThread('subagents');
  await openPanel('review-orchestrator-boundary');
  const reviewPanelChecks = await ev(() => {
    const p = document.querySelector('.collab-panel');
    const targetTxt = p.querySelector('.collab-targetpack') ? p.querySelector('.collab-targetpack').textContent : '';
    const excluded = p.querySelector('.collab-finding.collab-excluded');
    const readonlyNote = p.querySelector('.collab-readonly-note') ? p.querySelector('.collab-readonly-note').textContent : '';
    const actions = Array.from(p.querySelectorAll('[data-action]')).map(el => el.getAttribute('data-action'));
    return { targetTxt, excludedTxt: excluded ? excluded.textContent : null, readonlyNote, hasRepairAction: actions.some(a => /repair/i.test(a)) };
  });
  const run = await getRun('review-orchestrator-boundary');
  const pack = run.review.targetPack.targetHashes.primary;
  check('the panel names the single frozen target pack hash all initial passes shared',
    reviewPanelChecks.targetTxt.includes(pack), reviewPanelChecks.targetTxt);
  check('a finding produced against a DIFFERENT target hash is excluded from corroboration, not silently merged',
    reviewPanelChecks.excludedTxt && reviewPanelChecks.excludedTxt.includes('different frozen pack') &&
    run.review.excludedFindings[0].targetHash !== pack,
    reviewPanelChecks.excludedTxt);
  const corroborated = run.review.findings.find(f => (f.originatingReviewerIds || []).length >= 2);
  check('at least one finding is corroborated by more than one reviewer under that same frozen pack',
    !!corroborated, corroborated && corroborated.id);
  check('Review states it is read-only and never auto-repairs, and no control anywhere on the run exposes a repair action',
    /never auto-repairs/.test(reviewPanelChecks.readonlyNote) && !reviewPanelChecks.hasRepairAction,
    JSON.stringify(reviewPanelChecks));
  await closeDialog();
  const openedReview2 = await openConfigureFromWand('review');
  check('the review configure modal reopened for the auto-repair lock check', openedReview2.rowFound && openedReview2.dialogOpen);
  const autoRepairInModal = await ev(() => {
    const rows = Array.from(document.querySelectorAll('.collab-checkbox-row'));
    const row = rows.find(r => /auto-repair/i.test(r.textContent));
    const cb = row ? row.querySelector('input[type="checkbox"]') : null;
    return { found: !!row, disabled: cb ? cb.disabled : null, text: row ? row.textContent.trim() : '' };
  });
  check('assistant.multi_agent.review.auto_repair is locked off and not a reachable escape hatch in the configure modal',
    autoRepairInModal.found && autoRepairInModal.disabled && /permanently off/i.test(autoRepairInModal.text), JSON.stringify(autoRepairInModal));
  await clickSel('[data-action="collab-modal-cancel"]');
  await page.waitForTimeout(160);

  /* ================= 8/9. BrainStorm: question arithmetic, shared bank, dissent, one Plan output ================= */
  const openedBrainstorm = await openConfigureFromWand('brainstorm');
  check('the brainstorm configure modal opened for the question-arithmetic drive-through', openedBrainstorm.rowFound && openedBrainstorm.dialogOpen);
  const qmaxBefore = await ev(() => (document.querySelector('.collab-qmax') || {}).textContent || '');
  check('BrainStorm modal states the base arithmetic before Grill Me', qmaxBefore.trim() === 'Maximum questions: 20', qmaxBefore);
  await clickSel('[data-collab-input="grillMe"]');
  await page.waitForTimeout(150);
  const grillStateAfterCheck = await ev(() => window.PM56_COLLAB.draft().grillMe);
  const qmaxImmediatelyAfterCheck = await ev(() => (document.querySelector('.collab-qmax') || {}).textContent || '');
  check('checking Grill Me updates the draft state immediately', grillStateAfterCheck === true, String(grillStateAfterCheck));
  check('the Configure modal repaints "Maximum questions" immediately when Grill Me is checked: 20 + Grill Me 25 = 45 (no separate action needed to force a re-render)',
    qmaxImmediatelyAfterCheck.trim() === 'Maximum questions: 45 (20 + Grill Me 25)', qmaxImmediatelyAfterCheck);
  await clickSel('[data-action="collab-modal-add-participant"]');
  const qmaxAfterFurtherInteraction = await ev(() => (document.querySelector('.collab-qmax') || {}).textContent || '');
  check('the arithmetic stays correct after further interaction with the modal',
    qmaxAfterFurtherInteraction.trim() === 'Maximum questions: 45 (20 + Grill Me 25)', qmaxAfterFurtherInteraction);
  await clickSel('[data-action="collab-modal-cancel"]');
  await page.waitForTimeout(160);

  await selectThread('plan-deep');
  await openPanel('brainstorm-provider-failover');
  const bsBefore = await getRun('brainstorm-provider-failover');
  check('the question bank is ONE object on the run, not duplicated per participant (shared budget, not per-agent)',
    bsBefore.participants.every(p => !('questionLimit' in p) && !('grillExtension' in p) && !('baselineLimit' in p)),
    JSON.stringify(Object.keys(bsBefore.participants[0])));
  const qmaxRun0 = await ev(() => (document.querySelector('.collab-qmax') || {}).textContent || '');
  check('the live run panel shows the base maximum before Grill Me', qmaxRun0.trim() === 'Maximum questions: 20', qmaxRun0);
  await clickSel('[data-action="collab-brainstorm-toggle-grill"]');
  await page.waitForTimeout(200);
  const qmaxRun1 = await ev(() => (document.querySelector('.collab-qmax') || {}).textContent || '');
  const askedCount = bsBefore.brainstorm.questionBank.askedIds.length;
  check('the registered toggle action (unlike the raw modal checkbox) DOES repaint immediately: 20 + Grill Me 25 = 45, without resetting the already-asked count',
    qmaxRun1.trim() === 'Maximum questions: 45 (20 + Grill Me 25)', qmaxRun1);
  const bsAfterGrill = await getRun('brainstorm-provider-failover');
  check('the already-asked questions are preserved when the ceiling is raised (shared, monotonic budget)',
    bsAfterGrill.brainstorm.questionBank.askedIds.length === askedCount, `${bsAfterGrill.brainstorm.questionBank.askedIds.length} vs ${askedCount}`);

  const preSynth = await ev(() => {
    const hc = document.querySelector('.collab-hardconflict');
    const dis = document.querySelector('.collab-dissent');
    return { hardConflict: hc ? hc.textContent : null, dissent: dis ? dis.textContent : null };
  });
  check('the disqualified alternative stays visible regardless of vote count (hard constraint section)',
    preSynth.hardConflict && /Disqualified regardless of vote count/.test(preSynth.hardConflict), preSynth.hardConflict);
  check('material dissent is preserved and rendered, not smoothed over', preSynth.dissent && preSynth.dissent.length > 0, preSynth.dissent);

  await clickSel('[data-action="collab-brainstorm-synthesize"][data-run="brainstorm-provider-failover"]');
  await page.waitForTimeout(200);
  const afterSynth1 = await getRun('brainstorm-provider-failover');
  check('Synthesize produces exactly one synthesis, preserving the dissent count from the protocol',
    afterSynth1.brainstorm.phase === 'synthesis' && !!afterSynth1.brainstorm.synthesis &&
    afterSynth1.brainstorm.synthesis.dissentPreserved === (afterSynth1.brainstorm.dissent || []).length &&
    (afterSynth1.brainstorm.dissent || []).length > 0,
    JSON.stringify({ phase: afterSynth1.brainstorm.phase, dissentPreserved: afterSynth1.brainstorm.synthesis && afterSynth1.brainstorm.synthesis.dissentPreserved }));
  check('the synthesis honestly discloses that no Plan document exists yet (command not registered) rather than overclaiming one landed',
    /not yet registered/.test(afterSynth1.brainstorm.synthesis.disclosure) && /no Plan document was created/.test(afterSynth1.brainstorm.synthesis.disclosure),
    afterSynth1.brainstorm.synthesis.disclosure);
  const synthMsgCount1 = afterSynth1.messages.filter(m => m.messageType === 'response' && m.senderKind === 'coordinator').length;

  await clickSel('[data-action="collab-brainstorm-synthesize"][data-run="brainstorm-provider-failover"]');
  await page.waitForTimeout(200);
  const afterSynth2 = await getRun('brainstorm-provider-failover');
  const synthMsgCount2 = afterSynth2.messages.filter(m => m.messageType === 'response' && m.senderKind === 'coordinator').length;
  check('synthesizing again is idempotent — exactly ONE synthesis/Plan handoff record ever, never duplicated',
    synthMsgCount2 === synthMsgCount1 && afterSynth2.brainstorm.synthesis.summary === afterSynth1.brainstorm.synthesis.summary,
    `${synthMsgCount1} -> ${synthMsgCount2} coordinator response messages`);
  await closeDialog();

  /* ================= 10. Crew Auto: cannot start without committed config; cannot widen authority ================= */
  const runsBeforeAuto = await runsLen();
  await openWand();
  const autoCheckedBefore = await ev(() => {
    const cb = document.querySelector('.collab-auto-row input[type="checkbox"]');
    return { checked: cb ? cb.checked : null, autoConfigured: !!window.PM56_COLLAB.definitions().crew.autoConfigured };
  });
  check('Crew Auto starts unchecked and unconfigured', autoCheckedBefore.checked === false && !autoCheckedBefore.autoConfigured, JSON.stringify(autoCheckedBefore));

  await clickSel('[data-action="collab-crew-auto-toggle"]');
  await page.waitForTimeout(200);
  const afterFirstToggle = await ev(() => ({
    modalOpen: !!document.querySelector('.collab-configure'),
    isAutoMode: !!(window.PM56_COLLAB.draft() && window.PM56_COLLAB.draft().autoMode),
    autoEnabled: !!window.PM56_COLLAB.definitions().crew.autoEnabled
  }));
  check('checking Crew Auto before it is configured OPENS the configuration modal rather than enabling anything directly',
    afterFirstToggle.modalOpen && afterFirstToggle.isAutoMode && !afterFirstToggle.autoEnabled, JSON.stringify(afterFirstToggle));
  const menuClosedForAutoRoute = await ev(() => !document.querySelector('[data-overlay="root-menu"]'));
  check('unlike the four Wand-menu configure rows above, the Crew Auto route DOES close the Wand menu behind it (collab-crew-auto-toggle calls ctx.closeMenu()) — confirms the fix exists, just not applied to the other four rows',
    menuClosedForAutoRoute, String(menuClosedForAutoRoute));

  await clickSel('[data-action="collab-modal-cancel"]');
  await page.waitForTimeout(160);
  const afterCancelAuto = await ev(() => ({ autoConfigured: !!window.PM56_COLLAB.definitions().crew.autoConfigured, runs: window.PM56_COLLAB.runs().length }));
  check('cancelling the Crew Auto modal leaves it unconfigured and starts nothing',
    !afterCancelAuto.autoConfigured && afterCancelAuto.runs === runsBeforeAuto, JSON.stringify(afterCancelAuto));

  await openWand();
  await clickSel('[data-action="collab-crew-auto-toggle"]');
  await page.waitForTimeout(200);
  await clickSel('[data-action="collab-crew-auto-refuse-demo"]');
  await page.waitForTimeout(250);
  const afterRefuseDemo = await ev(() => ({
    text: document.body.innerText.includes('Crew Auto refused'),
    runs: window.PM56_COLLAB.runs().length
  }));
  check('the "widen authority" demo control is durably refused (recorded, not a toast alone) and starts nothing',
    afterRefuseDemo.text && afterRefuseDemo.runs === runsBeforeAuto, JSON.stringify(afterRefuseDemo));

  await clickSel('[data-action="collab-modal-commit"]');
  await page.waitForTimeout(250);
  const afterAutoCommit = await ev(() => ({
    autoConfigured: !!window.PM56_COLLAB.definitions().crew.autoConfigured,
    autoEnabled: !!window.PM56_COLLAB.definitions().crew.autoEnabled,
    runs: window.PM56_COLLAB.runs().length
  }));
  check('committing Crew Auto configuration records it as configured and enabled, but STILL starts no run by itself',
    afterAutoCommit.autoConfigured && afterAutoCommit.autoEnabled && afterAutoCommit.runs === runsBeforeAuto,
    JSON.stringify(afterAutoCommit));

  await openWand();
  const autoCheckedAfter = await ev(() => {
    const cb = document.querySelector('.collab-auto-row input[type="checkbox"]');
    return cb ? cb.checked : null;
  });
  check('Crew Auto now shows checked in the Multi-Agent menu, reflecting the committed configuration', autoCheckedAfter === true, String(autoCheckedAfter));
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);

  /* ================= 11. Chat Room: ordinary discussion promotes nothing; explicit promotion does ================= */
  await selectThread('crew');
  await openPanel('chatroom-onboarding');
  const roomBefore = await getRun('chatroom-onboarding');
  const promosBefore = roomBefore.chatRoom.promotions.length;
  const todosBeforeRoom = await ev(() => window.PM56_TODOS ? window.PM56_TODOS.get('crew') : null);
  check('the room starts with nothing promoted, and its thread has no To-Do list of its own',
    promosBefore === 0 && todosBeforeRoom === null, JSON.stringify({ promosBefore, todosBeforeRoom }));

  await clickSel('[data-action="collab-room-next-round"][data-run="chatroom-onboarding"]');
  await page.waitForTimeout(200);
  const roomAfterRound = await getRun('chatroom-onboarding');
  const todosAfterRoom = await ev(() => window.PM56_TODOS ? window.PM56_TODOS.get('crew') : null);
  check('an ordinary round of discussion creates no promotion, no To-Do list, no Plan, no Goal by itself',
    roomAfterRound.chatRoom.promotions.length === promosBefore && roomAfterRound.chatRoom.roundsSoFar === roomBefore.chatRoom.roundsSoFar + 1 && todosAfterRoom === null,
    JSON.stringify({ promotions: roomAfterRound.chatRoom.promotions.length, rounds: roomAfterRound.chatRoom.roundsSoFar, todos: todosAfterRoom }));

  const promoted = await clickSel('.collab-panel [data-action="collab-room-promote"][data-target="todo"]');
  await page.waitForTimeout(200);
  const roomAfterPromote = await getRun('chatroom-onboarding');
  check('an EXPLICIT promotion is the only thing that adds a promotion record, with lineage to the source message',
    promoted && roomAfterPromote.chatRoom.promotions.length === promosBefore + 1 &&
    roomAfterPromote.chatRoom.promotions[0].target === 'todo' && !!roomAfterPromote.chatRoom.promotions[0].sourceMessageId,
    JSON.stringify(roomAfterPromote.chatRoom.promotions));
  const promoteReceipt = await ev(() => document.body.innerText.includes('Promoted to To-Do'));
  check('the explicit promotion is recorded as a durable, visible receipt in the transcript', promoteReceipt);

  /* ---- console clean ---- */
  check('no console errors during the whole run', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));

  await browser.close();

  const pass = results.filter(r => r.pass).length;
  const summary = { suite: 'collaboration-verify', total: results.length, pass, fail: results.length - pass, results };
  writeFileSync(resolve(ROOT, 'reports/collaboration-verify.json'), JSON.stringify(summary, null, 2));
  if (JSON_OUT) console.log(JSON.stringify(summary, null, 2));
  else console.log(`\n${pass}/${results.length} passed.`);
  process.exit(summary.fail === 0 ? 0 : 1);
}

main().catch(async e => {
  console.error('HARNESS ERROR', e);
  if (browser) await browser.close();
  process.exit(2);
});
