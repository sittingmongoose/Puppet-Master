/* Goals & Schedules — what a new Goal may do, timed runs, and the proof a finished Goal leaves.

   Refine, seventh pass (2026-11-24). Jared, on the refined Settings: "There are still some artifacts from the old
   version of goals, that makes things in the settings for goals not make a lot of sense anymore. So that needs to be
   cleaned up." The page was still the Goal of September: templates with phases, a persona, a crew, a model and
   helpers per Goal, plan re-thinking, a Verify phase with its checks, and receipts that came in strengths.

   The Goal he ruled on 2026-11-12 (Plans/Decision_Log.md DL-477, DL-478; Plans/Goal_Runtime_System.md GRS-048 to
   GRS-054) is one sentence and a state:
   - a Goal is started in a chat (or handed over by the Planning Wizard) and runs on that chat's persona and model.
     It has no persona, crew, model or helpers of its own, no template, no phases and no checks ("The goal runs on
     the model the user had chosen, there shouldn't be checks or anything.");
   - the host keeps it going turn after turn, across a restart or a change of model, until the proof is in, and a
     pause, stop or cancel from the person always wins;
   - a finished Goal can leave a receipt: the outcome, what backs it up, and what is left. Nothing grades it.
   Plans/Settings_System.md gives the page exactly that: the defaults for keeping a Goal going and for
   interruptions, progress, what a new Goal may change, and the Goal's evidence with a read-only receipt.

   So the page is three tabs: Goals (what a new Goal may do, interruptions, watching progress, the progress view),
   Schedules (the rows for timed runs, which the page's old name called "Automation") and Proof (the receipt and what
   it keeps). What left it:
   - gone with the old Goal, never inventory rows or retired by DL-478: the Templates tab and its guided set-up
     (kind of job, phases, phase library), New Goals start with (persona, crew, model for Goal work, helpers),
     Changing the plan, Run test profile, Ask me to confirm, Receipt strength, Proof needed, the routing details and
     Reset Goal defaults (it reset only the rows that are gone);
   - still live in the Plans' inventory, and about checking planned work, not about a Goal: the checks, the repair
     loop and the stricter-proof rows. They are drawn in Planning › Planning & Interviews (o55/placement.d/31-goals.json),
     in the same groups, with the same options. */
(function () {
  const ID = 'goals';
  const KEY = 'goals-crew-personas';
  const NAME = 'Goals & Schedules', CHAPTER = 'Memory & Goals';
  const TABS = [
    { id: 'defaults', label: 'Goals' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'proof', label: 'Proof' }
  ];
  /* one line under the tabs, for someone who has never seen a Goal */
  const LEAD = {
    defaults: 'A Goal is one sentence the assistant keeps working toward, turn after turn, until it is done or you stop it. You start one in the <b>assistant chat</b>, and it uses that chat\'s persona and model. This page sets what every new Goal starts with.',
    schedules: 'A message can be set to send later, and a plan can be set to build at a time or inside a time window. You set the time in the <b>assistant chat</b>; these rows say what happens around it.',
    proof: 'A Goal is done when the proof is in, not when the assistant says so. A finished Goal can leave a receipt of that proof. Nothing here grades or checks a Goal.'
  };
  const lead = tab => `<p class="o55-mgp-lead">${icon('info')}<span>${LEAD[tab]}</span></p>`;
  const S = {
    write: 'planning.verification.goal-write-mode', receipts: 'planning.verification.completion-receipts',
    risky: 'safety.approvals.boundary-enforcement', retention: 'planning.verification.evidence-retention-days'
  };
  const on = v => v === true || v === 'on' || v === 'true';
  const refresh = () => PM51.refresh(ID, { swap: false });
  const go = id => { if (PM51.revealSetting) PM51.revealSetting(id); };

  /* the page's and the chapter's names, wherever Settings reads them (Jared, 2026-11-24, on "Rename the two
     Automation titles?": "A, rename them."), and the line under the name when Explain is on */
  D.domains.forEach(d => { if (d.workspaces.some(w => w.id === ID)) d.label = CHAPTER; d.workspaces.forEach(w => { if (w.id === ID) w.label = NAME; }); });
  if (typeof INTROS === 'object' && INTROS) INTROS[ID] = 'What a new Goal may do, what happens when one is interrupted, timed runs, and the proof a finished Goal leaves.';

  /* a tab saved under the old page (Templates, Recovery, Checks) opens the tab that holds what is left of it */
  const OLD_TAB = { templates: 'defaults', checkpoints: 'defaults', verification: 'proof' };

  /* ---------- Goals ---------------------------------------------------- */
  function goalsTab() {
    const risky = on(PM51.value(S.risky));
    return lead('defaults') + PM51.section({
      title: 'What a new Goal may do', help: 'Every new Goal starts with these. You can change one Goal in its chat.',
      body: PM51.bound.rows([S.write])
        + PM51.rows([{ label: 'Extra approval for risky steps', help: 'Deleting files, sending changes or paid access. Goals follow the same rule as everything else, set in Permissions.', value: risky ? 'On' : 'Off', action: { label: 'Change', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.risky } } }])
    })
      + PM51.slot()
      + PM51.advanced(PM51.section({
        title: 'What saved progress holds', help: 'What a Goal can pick up from after a stop.',
        body: PM51.kv([['Saved', 'The Goal\'s sentence, its to-do list, open changes and the next step'], ['Open processes', 'Recorded, never assumed to survive'], ['Secrets', 'Referenced, never stored with the progress'], ['Repeated failures', 'The Goal pauses instead of looping']])
      }));
  }
  /* ---------- Schedules ------------------------------------------------ */
  function schedulesTab() { return lead('schedules') + PM51.slot(); }
  /* ---------- Proof ---------------------------------------------------- */
  function proofTab() {
    const writes = on(PM51.value(S.receipts));
    return lead('proof') + PM51.section({
      title: 'The receipt', help: 'Shown on the finished Goal in the assistant chat.',
      body: PM51.bound.rows([S.receipts])
        + PM51.rows([{ label: 'How long proof is kept', help: 'How long, and what is hidden in saved proof, are set in Testing & Debug, History.', action: { label: 'Open', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.retention } } }])
    })
      + PM51.section({
        title: 'What a receipt holds', help: writes ? 'An example. A receipt is read only: it says what happened, it does not grade it.' : 'An example. No receipt is written while the switch above is off.',
        cls: 'rf-goal-receipt' + (writes ? '' : ' is-off'),
        body: PM51.kv([['Goal', 'Get the sign-in tests passing again'], ['Outcome', 'Finished'], ['Backed by', '3 test runs, 2 changed files, 1 screenshot'], ['Left over', 'Nothing']])
      })
      + PM51.slot();
  }
  function render() {
    let tab = PM51.tab(ID, 'defaults');
    if (!TABS.some(t => t.id === tab)) { tab = OLD_TAB[tab] || 'defaults'; PM51.setTab(ID, tab); }
    const body = tab === 'schedules' ? schedulesTab() : tab === 'proof' ? proofTab() : goalsTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'How Goals work', action: 'pm51-goals-help' }] });
  }
  PM51.manager('goals', { render });
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, OLD_TAB[e.tab] || e.tab); });
  [S.receipts, S.risky].forEach(id => PM51.watch(id, () => refresh()));

  /* ---------- actions -------------------------------------------------- */
  PM51.on('goals-reveal', el => go(ds(el, 'setting')));
  PM51.on('goals-help', () => PM51.panel({
    title: 'How Goals work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A Goal is one sentence the assistant keeps working toward on its own, turn after turn, until it is done or you stop it.</p>')
      + PM51.panelSection('Where a Goal starts', PM51.kv([['Assistant chat', 'Ask for a Goal in a chat. It uses that chat\'s persona and model, and you follow it there.'], ['Planning Wizard', 'When a plan is ready, the wizard can hand it over as a Goal.'], ['This page', 'Only what new Goals start with. Nothing here starts, pauses or stops a Goal.']]))
      + PM51.panelSection('You stay in charge', PM51.kv([['Pause, stop or cancel', 'In the chat, at any time. Nothing starts the Goal again until you do.'], ['Changing it', 'Edit the Goal\'s sentence in the chat. The assistant can suggest a change; it cannot make one.'], ['Saving progress', 'A Goal saves as it goes, so it can stop and pick up again.'], ['Risky steps', 'Goals follow the approvals set in Permissions.']]))
      + PM51.panelSection('When it is done', PM51.kv([['Proof', 'A Goal finishes when the proof is in, not when the assistant says it is finished.'], ['Receipt', 'A finished Goal can leave a receipt: what it did, what backs that up, and what is left.']]))
      + PM51.panelSection('What a Goal is not', '<p class="pm51-ps-text">A Goal has no template, phases, crew or checks of its own. A plan, a crew or a review can start a Goal, and that Goal stands alone.</p>')
  }));
})();
