/* Goals & Automation — templates, active Goals, defaults, recovery, checks (settings audit, 2026-09-27).
   - A template is made step by step (name, kind of job, who does it, its phases, how carefully it checks), in the
     same guided window as the other set-up helpers; phases come from the phase library, in order, plus your own.
   - "Kind of job" belongs to a template and to a Goal, not to the project, so it is drawn and kept per template.
   - The manager no longer keeps its own copies of what other settings decide: saving progress, resuming, retries and
     "then" are the Recovery rows; evidence is the Checks and Testing rows; helpers and parallel work are Personas'
     rows; "ask before risky steps" is Permissions' row; the Goal model is Providers' row. Each shows here as one line
     with a way to change it where it lives.
   - A receipt is earned, not chosen: it is shown on each finished Goal. */
(function () {
  const ID = 'goals';
  const KEY = 'goals-crew-personas';
  const TABS = [
    { id: 'templates', label: 'Templates' },
    { id: 'active', label: 'Active Goals' },
    { id: 'defaults', label: 'Defaults' },
    { id: 'checkpoints', label: 'Recovery' },
    { id: 'verification', label: 'Checks' }
  ];
  const S = {
    kind: 'planning.verification.goal-template', write: 'planning.verification.goal-write-mode', receipt: 'planning.verification.receipt-type',
    graph: 'general.interaction.run-graph-mode', density: 'general.interaction.graph-density', layout: 'general.interaction.progress-widget-layout',
    quality: 'planning.verification.quality-preference', validation: 'planning.verification.validation-pass', independent: 'planning.verification.independent-review',
    receipts: 'planning.verification.completion-receipts', reports: 'planning.verification.report-visibility',
    model: 'ai.models.goal-worker-model', helpers: 'branching.subagents.enable-subagents', parallel: 'branching.subagents.max-parallel',
    risky: 'safety.approvals.boundary-enforcement', retention: 'planning.verification.evidence-retention-days'
  };
  const PHASE_HELP = {
    Understand: 'Read the request, the plan, and the constraints.',
    Plan: 'Break the work into steps with owners and checks.',
    Build: 'Do the work, handing bounded tasks to helpers when useful.',
    Verify: 'Run the tests and reviews the template asks for.',
    Deliver: 'Package clean files and report honestly.',
    Inventory: 'List what exists before judging it.',
    Audit: 'Compare the implementation with what was promised.',
    Repair: 'Fix what the audit found.',
    'Re-audit': 'Check the repairs with fresh eyes.',
    Certify: 'Record what was verified and how.',
    Frame: 'Agree on the question and what a good answer looks like.',
    Research: 'Gather current, primary sources.',
    Compare: 'Weigh the options against each other.',
    Decide: 'Record the decision and why.'
  };
  const KINDS = [
    ['feature_build', 'rocket', 'Something new, planned, built and tested.'],
    ['bug_fix', 'alert', 'Find the cause, fix it, prove it stays fixed.'],
    ['test_until_pass', 'test', 'Keep fixing until the tests pass.'],
    ['refactor', 'wand', 'Tidy code without changing what it does.'],
    ['migration', 'route', 'Move to a new version, library or layout.'],
    ['audit_and_repair', 'shield', 'Compare with what was promised and fix the gaps.'],
    ['repo_research', 'search', 'Read the code and answer a question about it.'],
    ['doc_update', 'file', 'Bring the docs in line with the code.'],
    ['ledger_to_plan_transfer', 'list', 'Turn a list of findings into a plan.'],
    ['governance_seal', 'lock', 'Check and seal records so they cannot drift.']
  ];
  const KIND_OF = { implementation: 'feature_build', audit: 'audit_and_repair', research: 'repo_research' };
  const QUALITY = [
    ['fast', 'gauge', 'Faster', 'Light checks. Good for small, low-risk jobs.'],
    ['balanced', 'sliders', 'Balanced', 'The usual tests and one review.'],
    ['thorough', 'shield', 'More thorough', 'Every check, an independent review, and proof kept.']
  ];
  const QUALITY_OF = { Thorough: 'thorough', Standard: 'balanced', Fast: 'fast', Balanced: 'balanced' };
  const FINISHED = [
    { id: 'f1', name: 'Fix the login redirect loop', finished: 'Yesterday', receipt: 'standard', persona: 'Puppet Master', checks: 'Tests passed · reviewed by Repository Auditor · 2 screenshots kept' },
    { id: 'f2', name: 'Refresh the CLI docs', finished: '3 days ago', receipt: 'degraded', persona: 'Puppet Master', checks: 'Docs built · the link check could not run, so it is marked not fully checked' }
  ];
  let seq = 0;
  const newId = p => p + '-' + Date.now().toString(36) + '-' + (++seq);

  const g = () => {
    const s = PM51.s().goals;
    if (!s.o55V2) {
      s.o55V2 = true;
      templates().forEach(t => { t.props = t.props || {}; if (!t.props[S.kind] && KIND_OF[t.id]) t.props[S.kind] = KIND_OF[t.id]; if (!t.quality) t.quality = QUALITY_OF[t.verification] || 'balanced'; });
      if (!s.finished) s.finished = clone(FINISHED);
      if (s.checkpoints) { delete s.checkpoints.afterPhase; delete s.checkpoints.askRisky; delete s.checkpoints.resume; delete s.checkpoints.retry; delete s.checkpoints.then; }
      if (s.defaults) { delete s.defaults.subagents; delete s.defaults.maxParallel; }
      if (s.verification) delete s.verification.evidence;
    }
    if (!s.finished) s.finished = [];
    return s;
  };
  const templates = () => state.goalTemplates || (state.goalTemplates = []);
  const goals = () => state.activeGoals || (state.activeGoals = []);
  const personaNames = () => (state.personas || []).map(p => p.name);
  const crewNames = () => (state.crews || []).map(c => c.name);
  const routes = () => [...new Set([...templates().map(t => t.route), ...(state.personas || []).map(p => p.route), g().defaults.route].filter(Boolean))];
  const withCurrent = (list, v) => list.includes(v) ? list : [v, ...list];
  const selectedTemplate = () => templates().find(t => t.id === PM51.sel(ID)) || templates()[0];
  const refresh = () => PM51.refresh(ID, { swap: false });
  const crewName = v => (state.crews || []).find(c => c.name.toLowerCase() === String(v || '').toLowerCase())?.name || v;
  const kindOf = t => PM51.scopedValue(t, S.kind) || '';
  const kindLabel = v => v ? PM51.valueLabel(S.kind, v) : 'Not set';
  const qualityLabel = v => (QUALITY.find(q => q[0] === v) || [])[2] || 'Balanced';
  const on = v => v === true || v === 'on' || v === 'true';
  const go = id => { if (PM51.revealSetting) PM51.revealSetting(id); };

  PM51.style(`
#panel-settings .pm51-goals-text { margin: 0; width: 100%; font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-goals-bar { display: inline-block; width: 110px; height: 6px; border-radius: 3px; background: var(--k3-bg-2); border: 1px solid var(--k3-line); overflow: hidden; vertical-align: middle; }
#panel-settings .pm51-goals-bar i { display: block; height: 100%; border-radius: 3px; background: rgba(var(--accent-primary-rgb), .85); }
#panel-settings .pm51-goals-pct { min-width: 34px; text-align: right; font-size: 11.5px; color: var(--k3-text-3); }
#panel-settings .o55-goals-phases { display: grid; gap: 8px; }
#panel-settings .o55-goals-phase { display: grid; grid-template-columns: 26px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 9px 10px 9px 12px; border: 1px solid var(--g-line, var(--k3-line)); border-radius: var(--g-card-r, 10px); background: var(--g-card-bg, var(--k3-bg-1)); }
#panel-settings .o55-goals-phase-n { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 700; color: var(--g-accent, var(--k3-accent)); background: color-mix(in srgb, var(--g-accent, var(--k3-accent)) 14%, transparent); }
#panel-settings .o55-goals-phase-name { font-size: 14px; font-weight: 650; color: var(--text-primary, var(--k3-text-1)); }
#panel-settings .o55-goals-phase-help { font-size: 12.5px; color: var(--text-secondary, var(--k3-text-3)); }
#panel-settings .o55-goals-phase-tools { display: flex; gap: 2px; }
#panel-settings .o55-goals-library { display: flex; flex-wrap: wrap; gap: 6px; }
#panel-settings .o55-goals-custom { display: flex; gap: 8px; align-items: center; }
#panel-settings .o55-goals-custom .text-control { flex: 1 1 auto; }
html[data-theme^="retro"] #panel-settings .o55-goals-phase-n { border-radius: 0; }
`);

  /* ---------- Templates ------------------------------------------------ */
  function templatesTab() {
    g();
    const t = selectedTemplate();
    if (!t) return PM51.home(S.kind, PM51.empty('No templates yet', 'A template describes a job the assistant can run on its own.', { label: 'New template', icon: 'plus', action: 'pm51-goals-template-new' }));
    const body = PM51.rows([
      { label: 'What it does', cls: 'is-wrap', control: `<p class="pm51-goals-text">${h(t.description || '')}</p>` }
    ]) + PM51.scoped.rows([PM51.scoped.row(S.kind, kindOf(t), { scope: 'template', data: { id: t.id }, noChanged: true, help: 'What sort of job this template runs. A Goal started from it begins with this.' })])
      + PM51.rows([
        { label: 'Persona', help: 'Who does the work.', value: t.persona },
        { label: 'Model route', help: 'Which AI service handles each step.', value: t.route },
        { label: 'Checks', help: 'How carefully it checks its own work.', value: qualityLabel(t.quality) }
      ]) + PM51.section({ title: 'Phases', help: 'The Goal moves through these in order.', body: PM51.steps((t.phases || []).map(p => ({ title: p, desc: PHASE_HELP[p] || 'A phase of your own.' }))) })
      + PM51.advanced([
        PM51.section({ title: 'Effective settings', help: 'What this template adds on top of the defaults.', body: PM51.kv([['Checkpoints', (t.checkpoints || []).join(' · ') || 'Defaults'], ['Helpers', t.subagents || 'Defaults'], ['Checks', qualityLabel(t.quality)], ['Evidence', t.evidence || 'Defaults']]) }),
        PM51.section({ title: 'Export', help: 'Share this template with another workspace.', action: { label: 'Export', small: true, icon: 'download', action: 'pm51-goals-template-export', data: { id: t.id } } }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Template id', t.id], ['Kind', kindOf(t) || 'none'], ['Phases', String((t.phases || []).length)]]) })
      ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Templates', count: templates().length,
      add: { action: 'pm51-goals-template-new', label: 'New template' },
      items: templates().map(x => ({ id: x.id, title: x.name, meta: `${kindLabel(kindOf(x))} · ${(x.phases || []).length} phases`, avatar: icon((KINDS.find(k => k[0] === kindOf(x)) || [])[1] || 'rocket'), selected: x.id === t.id })),
      detail: {
        title: t.name, subtitle: `${(t.phases || []).length} phases · ${t.persona}`,
        primary: { label: 'Start Goal', icon: 'play', action: 'pm51-goals-start', data: { id: t.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => templateWizard(t) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(t); copy.id = newId('template'); copy.name = t.name + ' copy'; templates().push(copy); PM51.setSel(ID, copy.id); saveState(); refresh(); PM51.toast('Template duplicated', copy.name); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${t.name}”?`, 'Goals already started from it keep running.', 'Delete', () => { const i = templates().indexOf(t); if (i >= 0) templates().splice(i, 1); PM51.setSel(ID, (templates()[0] || {}).id); saveState(); refresh(); PM51.toast('Template deleted', t.name, 'warning'); }, true) }
        ], t.name),
        body
      }
    });
  }
  /* phases: the chosen ones in order, the library to add from, and one of your own */
  function phasesHtml(d) {
    const n = d.phases.length;
    const list = n ? d.phases.map((p, i) => `<div class="o55-goals-phase"><span class="o55-goals-phase-n">${i + 1}</span><span><span class="o55-goals-phase-name">${h(p)}</span><br><span class="o55-goals-phase-help">${h(PHASE_HELP[p] || 'A phase of your own.')}</span></span><span class="o55-goals-phase-tools">${PM51.iconBtn({ icon: 'up', label: `Move ${p} earlier`, action: 'pm51-goals-ph-move', data: { i, d: -1 }, disabled: i === 0, reason: 'Already first.' })}${PM51.iconBtn({ icon: 'down', label: `Move ${p} later`, action: 'pm51-goals-ph-move', data: { i, d: 1 }, disabled: i === n - 1, reason: 'Already last.' })}${PM51.iconBtn({ icon: 'trash', label: `Remove ${p}`, action: 'pm51-goals-ph-remove', data: { i } })}</span></div>`).join('') : PM51.note('No phases yet. Add some from the library below.', 'info');
    const free = Object.keys(PHASE_HELP).filter(p => !d.phases.includes(p));
    return `<div class="o55-goals-phases">${list}</div>`
      + PM51.panelSection('Add from the library', free.length ? `<div class="o55-goals-library chip-select">${free.map(p => `<button type="button" data-action="pm51-goals-ph-add" data-phase="${a(p)}" title="${a(PHASE_HELP[p])}"><span>${h(p)}</span></button>`).join('')}</div>` : PM51.note('Every library phase is in use.', 'info'))
      + PM51.panelSection('Or add your own', `<div class="o55-goals-custom"><input class="text-control o55-goals-ph-own" placeholder="For example: Release notes" autocomplete="off" aria-label="Your own phase"/>${PM51.btn({ label: 'Add', icon: 'plus', small: true, action: 'pm51-goals-ph-own' })}</div>`);
  }
  const phaseHost = el => { const w = el.closest('.drawer-wrap'); return w && w._o55Wizard ? { w, api: w._o55Wizard } : null; };
  const repaintPhases = w => { const box = w.querySelector('.o55-goals-phase-step'); if (box) box.innerHTML = phasesHtml(w._o55Wizard.draft); };
  function templateWizard(t) {
    const isNew = !t;
    const base = t || { name: '', description: '', persona: g().defaults.persona, route: (templates()[0] || {}).route || g().defaults.route, phases: ['Understand', 'Plan', 'Build', 'Verify', 'Deliver'], quality: String(PM51.value(S.quality) || 'balanced') };
    PM51.wizard({
      title: isNew ? 'New Goal template' : `Edit ${t.name}`, subtitle: 'A template is a job the assistant can run on its own, phase by phase.', eyebrow: 'Goal template', icon: 'rocket',
      draft: { name: base.name, description: base.description, persona: base.persona, route: base.route, phases: (base.phases || []).slice(), quality: base.quality || 'balanced', kind: t ? kindOf(t) : '' },
      finishLabel: isNew ? 'Create template' : 'Save',
      steps: [
        { label: 'Name', icon: 'edit', title: 'What is the job called?', lead: 'A short name, and one line on what it does.', recap: d => d.name,
          render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-goals-w-name" value="${a(d.name)}" placeholder="For example: Release checklist" autocomplete="off"/>`)}${PM51.field('What it does', `<textarea class="form-textarea o55-goals-w-desc" rows="3" placeholder="For example: Update the changelog, bump the version and tag the release.">${h(d.description)}</textarea>`)}</div>`,
          collect: (w, d) => { d.name = String(w.querySelector('.o55-goals-w-name').value || '').trim(); d.description = String(w.querySelector('.o55-goals-w-desc').value || '').trim(); },
          check: d => !d.name ? 'Give the template a name.' : (isNew && templates().some(x => x.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a template called ${d.name}.` : '') },
        { label: 'Kind', icon: 'layers', title: 'What kind of job is it?', lead: 'It tells a Goal what "done" looks like. You can change it for one Goal when you start it.',
          render: d => PM51.tiles(KINDS.map(([v, ic, text]) => ({ title: PM51.valueLabel(S.kind, v), text, icon: ic, selected: d.kind === v, data: { kind: v } })), { action: 'pm51-goals-w-kind' }),
          check: d => d.kind ? '' : 'Pick the kind of job.' },
        { label: 'Who', icon: 'user', title: 'Who should do it?', lead: 'The persona does the work; the route decides which AI service answers each step.', recap: d => d.persona,
          render: d => `<div class="o55-setup-fields">${PM51.field('Persona', PM51.dropdown(d.persona, withCurrent(personaNames(), d.persona).map(v => ({ value: v, label: v })), { cls: 'o55-goals-w-persona', label: 'Persona' }), 'Personas are set up in Personas & Crews.')}${PM51.field('Model route', PM51.dropdown(d.route, withCurrent(routes(), d.route).map(v => ({ value: v, label: v })), { cls: 'o55-goals-w-route', label: 'Model route' }), 'Routes come from your AI accounts.')}</div>`,
          collect: (w, d) => { const p = w.querySelector('.o55-goals-w-persona'), r = w.querySelector('.o55-goals-w-route'); if (p) d.persona = p.value; if (r) d.route = r.value; } },
        { label: 'Phases', icon: 'list', title: 'Which phases, in what order?', lead: 'A Goal moves through these one after another.', recap: d => `${d.phases.length} phase${d.phases.length === 1 ? '' : 's'}`,
          render: d => `<div class="o55-goals-phase-step">${phasesHtml(d)}</div>`,
          check: d => d.phases.length ? '' : 'Add at least one phase.' },
        { label: 'Checks', icon: 'shield', title: 'How carefully should it check its work?', lead: 'The details live under Checks; this picks the starting point.',
          render: d => PM51.tiles(QUALITY.map(([v, ic, title, text]) => ({ title, text, icon: ic, selected: d.quality === v, data: { quality: v } })), { action: 'pm51-goals-w-quality' }) }
      ],
      onFinish: d => {
        const fields = { name: d.name, description: d.description, persona: d.persona, route: d.route, phases: d.phases.slice(), quality: d.quality };
        let rec = t;
        if (isNew) { rec = Object.assign({ id: newId('template'), checkpoints: ['Before irreversible operations'], subagents: 'Automatic by workload', evidence: 'Retain compact receipt', props: {} }, fields); templates().push(rec); }
        else Object.assign(t, fields);
        rec.props = rec.props || {}; rec.props[S.kind] = d.kind;
        PM51.setSel(ID, rec.id); PM51.setTab(ID, 'templates'); saveState(); refresh();
        PM51.toast(isNew ? 'Template created' : 'Template saved', `${d.name}: ${d.phases.length} phases, ${qualityLabel(d.quality).toLowerCase()} checks.`);
      }
    });
  }

  /* ---------- Active Goals --------------------------------------------- */
  function activeTab() {
    const list = goals(); const done = g().finished;
    const toolbar = `<div class="o55-toolbar o55-goals-toolbar">${PM51.bound.select(S.graph, { prefix: 'Graph shows', width: 150 })}${PM51.bound.select(S.density, { prefix: 'Detail', width: 190 })}<span class="o55-toolbar-spacer"></span>${PM51.home(S.layout, `<button type="button" class="btn small" data-action="open-structured-setting" data-setting="${a(S.layout)}">${icon('layers')}<span>Arrange progress view</span></button>`, 'span')}</div>`;
    const running = list.length ? PM51.section({
      title: 'Running now', help: 'Select a Goal to change its route or stop it.',
      body: toolbar + PM51.list(list.map(x => ({
        title: x.name, pill: PM51.status(x.state, x.state === 'Running' ? 'ready' : 'attention'),
        meta: `Phase ${x.phase} · ${x.persona} · ${x.route}${x.checkpoint && x.checkpoint !== 'None' ? ' · ' + x.checkpoint : ''}`,
        action: 'pm51-goals-open', data: { id: x.id },
        end: `<span class="pm51-goals-bar" aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, Number(x.progress) || 0))}%"></i></span><span class="pm51-goals-pct">${Number(x.progress) || 0}%</span>`
          + PM51.btn({ label: x.state === 'Running' ? 'Pause' : 'Resume', small: true, icon: x.state === 'Running' ? 'pause' : 'play', action: 'pm51-goals-toggle', data: { id: x.id } })
      })))
    }) : PM51.section({ title: 'Running now', body: toolbar + PM51.empty('No Goals running.', 'Start one from a template when you have a job the assistant can do on its own.', { label: 'Choose a template', icon: 'rocket', action: 'pm51-tab', data: { manager: ID, tab: 'templates' } }) });
    const finished = PM51.home(S.receipt, PM51.section({
      title: 'Finished recently', help: 'Each finished Goal earns a receipt from the checks it passed. It is shown here, not chosen.',
      body: done.length ? PM51.list(done.map(f => ({ title: f.name, pill: PM51.status(PM51.valueLabel(S.receipt, f.receipt), f.receipt === 'degraded' || f.receipt === 'blocked' ? 'attention' : 'ready'), meta: `${f.finished} · ${f.checks}`, action: 'pm51-goals-receipt', data: { id: f.id }, end: icon('chevron') }))) : PM51.note('Nothing has finished yet.', 'info')
    }));
    return running + finished;
  }
  function openGoal(x) {
    PM51.panel({
      title: x.name, status: { label: x.state, tone: x.state === 'Running' ? 'ready' : 'attention' },
      body: PM51.panelSection('Where it is', PM51.kv([['Phase', x.phase], ['Progress', `${x.progress}%`], ['Kind of job', kindLabel(x.kind)], ['Persona', x.persona], ['Model route', x.route], ['Checkpoint', x.checkpoint || 'None'], ['Receipt', 'Earned when it finishes'], ['Updated', x.updated]]))
        + PM51.panelSection('Change future route', PM51.field('Route for the remaining phases', PM51.select(x.route, withCurrent(routes(), x.route), { label: 'Future route' }), 'The current phase finishes on its present route.'))
        + PM51.panelSection('Stop', '<p class="pm51-ps-help">Stopping keeps the work done so far and the last checkpoint.</p>' + PM51.btn({ label: 'Stop Goal', icon: 'close', danger: true, small: true, action: 'pm51-goals-stop', data: { id: x.id } })),
      primaryLabel: 'Save route', onPrimary: wrap => { const sel = wrap.querySelector('select'); if (sel && sel.value !== x.route) { x.route = sel.value; x.updated = 'Now'; saveState(); refresh(); PM51.toast('Route changed', `${x.name} continues on ${x.route} after this phase.`); } }
    });
  }

  /* ---------- Defaults ------------------------------------------------- */
  function defaultsTab() {
    const d = g().defaults;
    const helpersOn = on(PM51.value(S.helpers)); const max = Number(PM51.value(S.parallel)) || 4;
    return PM51.section({
      title: 'New Goals start with', help: 'Templates can change any of these.',
      body: PM51.rows([
        { label: 'Persona', help: 'Who does the work.', control: PM51.select(d.persona, withCurrent(personaNames(), d.persona), { action: 'pm51-goals-default', data: { key: 'persona' }, label: 'Default persona' }) },
        { label: 'Crew', help: 'The team the persona can call on.', control: PM51.select(crewName(d.crew), withCurrent(crewNames(), crewName(d.crew)), { action: 'pm51-goals-default', data: { key: 'crew' }, label: 'Default crew' }) },
        { label: 'Model for Goal work', help: 'Set in AI Providers, for every Goal.', value: PM51.valueLabel(S.model, PM51.value(S.model)), action: { label: 'Change', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.model } } },
        { label: 'Helpers', help: 'Set in Personas & Crews.', value: helpersOn ? `On, up to ${max} at once` : 'Off', action: { label: 'Change', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.helpers } } }
      ]) + PM51.bound.rows([S.write])
    })
      + PM51.slot()
      + PM51.advanced(PM51.section({ title: 'Routing details', body: PM51.kv([['Order of precedence', 'Template · persona · this page · provider default'], ['If a route is unavailable', 'The named fallback route is used and noted in the Goal summary'], ['Where routes are defined', 'AI Providers']]) }));
  }

  /* ---------- Recovery ------------------------------------------------- */
  function checkpointsTab() {
    const risky = on(PM51.value(S.risky));
    return PM51.slot()
      + PM51.section({
        title: 'Risky steps', help: 'Deleting files, sending changes, or paid access.',
        body: PM51.rows([{ label: 'Extra approval for risky steps', help: 'Goals follow the same rule as everything else, set in Permissions.', value: risky ? 'On' : 'Off', action: { label: 'Change', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.risky } } }])
      })
      + PM51.advanced([
        PM51.section({ title: 'Phase library', help: 'Phases a template can use.', body: PM51.steps(Object.keys(PHASE_HELP).map(p => ({ title: p, desc: PHASE_HELP[p] }))) }),
        PM51.section({ title: 'What a checkpoint holds', body: PM51.kv([['Saved', 'Phase, to-do list, helpers, open changes, and the next step'], ['Open processes', 'Recorded, never assumed to survive'], ['Secrets', 'Referenced, never stored in the checkpoint'], ['Repeated failures', 'The Goal pauses instead of looping']]) })
      ].join(''));
  }

  /* ---------- Checks --------------------------------------------------- */
  function verificationTab() {
    const v = g().verification;
    const profiles = (state.testProfiles || []).map(p => p.name);
    return PM51.section({
      title: 'Before a Goal is called done', help: 'The checks that run in the Verify phase.',
      body: PM51.bound.rows([S.quality])
        + PM51.rows([{ label: 'Run test profile', help: 'Profiles are set up in Testing & Debug.', control: PM51.select(v.profile, withCurrent(profiles, v.profile), { action: 'pm51-goals-verification', data: { key: 'profile' }, label: 'Test profile' }) }])
        + PM51.bound.rows([S.validation, S.independent, S.receipts])
        + PM51.rows([{ label: 'Ask me to confirm', help: 'The Goal waits for you before it is marked complete.', control: PM51.toggle(!!v.confirm, { action: 'pm51-goals-verification-toggle', data: { key: 'confirm' }, label: 'Ask me to confirm' }) }])
        + PM51.bound.rows([S.reports])
        + PM51.rows([{ label: 'How long proof is kept', help: 'Retention and what is hidden in saved proof are set in Testing & Debug, History.', action: { label: 'Open', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.retention } } }])
    }) + PM51.slot();
  }

  function render() {
    const tab = PM51.tab(ID, 'templates');
    const body = tab === 'active' ? activeTab() : tab === 'defaults' ? defaultsTab() : tab === 'checkpoints' ? checkpointsTab() : tab === 'verification' ? verificationTab() : templatesTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset Goal defaults', action: 'pm51-goals-reset' }, { label: 'How Goals work', action: 'pm51-goals-help' }] });
  }
  PM51.manager('goals', { render });
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  PM51.scopedSetter('template', (id, value, el) => { const t = templates().find(x => x.id === ds(el, 'id')); if (!t) return ''; t.props = t.props || {}; t.props[id] = value; saveState(); refresh(); return t.name; });
  PM51.perValues(S.kind, () => templates().map(t => ({ name: t.name, value: kindOf(t) })).concat(goals().filter(x => x.kind).map(x => ({ name: x.name, value: x.kind }))));
  PM51.perValues(S.receipt, () => g().finished.map(f => ({ name: f.name, value: f.receipt })));
  [S.quality, S.graph, S.density].forEach(id => PM51.watch(id, () => refresh()));

  /* ---------- actions -------------------------------------------------- */
  PM51.on('goals-template-new', () => templateWizard(null));
  PM51.on('goals-w-kind', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.kind = ds(el, 'kind'); w.next(); });
  PM51.on('goals-w-quality', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.quality = ds(el, 'quality'); });
  PM51.on('goals-ph-move', el => { const hst = phaseHost(el); if (!hst) return; const p = hst.api.draft.phases; const i = Number(ds(el, 'i')), j = i + Number(ds(el, 'd')); if (j < 0 || j >= p.length) return; [p[i], p[j]] = [p[j], p[i]]; repaintPhases(hst.w); });
  PM51.on('goals-ph-remove', el => { const hst = phaseHost(el); if (!hst) return; hst.api.draft.phases.splice(Number(ds(el, 'i')), 1); repaintPhases(hst.w); });
  PM51.on('goals-ph-add', el => { const hst = phaseHost(el); if (!hst) return; const p = ds(el, 'phase'); if (!hst.api.draft.phases.includes(p)) hst.api.draft.phases.push(p); repaintPhases(hst.w); });
  PM51.on('goals-ph-own', el => {
    const hst = phaseHost(el); if (!hst) return; const inp = hst.w.querySelector('.o55-goals-ph-own'); const v = String(inp && inp.value || '').trim().replace(/\s+/g, ' ');
    if (!v) { PM51.toast('Name the phase', 'For example: Release notes.', 'info'); return; }
    if (hst.api.draft.phases.some(p => p.toLowerCase() === v.toLowerCase())) { PM51.toast('Already there', `${v} is already a phase.`, 'info'); return; }
    hst.api.draft.phases.push(v.charAt(0).toUpperCase() + v.slice(1)); repaintPhases(hst.w);
  });
  PM51.on('goals-reveal', el => go(ds(el, 'setting')));
  PM51.on('goals-template-export', el => {
    const t = templates().find(x => x.id === ds(el, 'id')); if (!t) return;
    PM51.panel({ title: 'Export template', subtitle: t.name, body: PM51.panelSection('What is included', PM51.kv([['Name', t.name], ['Kind of job', kindLabel(kindOf(t))], ['Phases', (t.phases || []).join(' · ')], ['Persona and route', `${t.persona} · ${t.route}`], ['Format', 'JSON · no secrets']])) + PM51.note('Saving a file needs the desktop app. Nothing is written in this preview.'), primaryLabel: 'Save file', onPrimary: () => PM51.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info') });
  });
  PM51.on('goals-start', el => {
    const t = templates().find(x => x.id === ds(el, 'id')); if (!t) return;
    const kinds = KINDS.map(k => ({ value: k[0], label: PM51.valueLabel(S.kind, k[0]), meta: k[2] }));
    PM51.panel({
      title: 'Start a Goal', subtitle: `From the ${t.name} template.`, icon: 'rocket',
      body: PM51.panelSection('Goal', PM51.field('Name', PM51.input(t.name, { label: 'Goal name', cls: 'pm51-goals-name' }))
        + PM51.field('Kind of job', PM51.dropdown(kindOf(t) || 'feature_build', kinds, { label: 'Kind of job', cls: 'pm51-goals-kind' }), 'From the template; change it for this Goal only.')
        + PM51.field('Persona', PM51.select(t.persona, withCurrent(personaNames(), t.persona), { label: 'Persona', cls: 'pm51-goals-persona' }))
        + PM51.field('Model route', PM51.select(t.route, withCurrent(routes(), t.route), { label: 'Model route', cls: 'pm51-goals-route' })))
        + PM51.panelSection('What happens next', PM51.steps((t.phases || []).map(p => ({ title: p, desc: PHASE_HELP[p] || 'A phase of your own.' })))),
      primaryLabel: 'Start Goal', onPrimary: wrap => {
        const val = sel => (wrap.querySelector(sel) || {}).value;
        const name = val('.pm51-goals-name') || t.name;
        goals().unshift({ id: newId('goal'), name: String(name).trim() || t.name, state: 'Running', phase: (t.phases || ['Understand'])[0], progress: 0, route: val('.pm51-goals-route') || t.route, persona: val('.pm51-goals-persona') || t.persona, kind: val('.pm51-goals-kind') || kindOf(t), checkpoint: 'None', updated: 'Now' });
        PM51.setTab(ID, 'active'); saveState(); PM51.refresh(ID);
        PM51.toast('Goal added to Active Goals', 'Example data only. In the app, the first phase starts now.', 'info');
      }
    });
  });
  PM51.on('goals-open', el => { const x = goals().find(o => o.id === ds(el, 'id')); if (x) openGoal(x); });
  PM51.on('goals-receipt', el => {
    const f = g().finished.find(o => o.id === ds(el, 'id')); if (!f) return;
    const weak = f.receipt === 'degraded' || f.receipt === 'blocked';
    PM51.panel({
      title: f.name, eyebrow: 'Receipt', icon: 'file', status: { label: PM51.valueLabel(S.receipt, f.receipt), tone: weak ? 'attention' : 'ready' },
      summary: weak ? 'It finished, but not every check could run. What is missing is listed below.' : 'Every check this Goal asked for passed.',
      body: PM51.panelSection('Receipt earned', PM51.kv([['Strength', PM51.valueLabel(S.receipt, f.receipt)], ['Finished', f.finished], ['Persona', f.persona], ['Checks', f.checks]]), 'Set by the checks a Goal passed; not a choice.')
    });
  });
  PM51.on('goals-toggle', el => {
    const x = goals().find(o => o.id === ds(el, 'id')); if (!x) return;
    if (x.state === 'Running') { x.state = 'Paused'; x.checkpoint = 'Saved when paused'; } else { x.state = 'Running'; x.checkpoint = 'None'; }
    x.updated = 'Now'; saveState(); refresh(); PM51.toast(x.state === 'Running' ? 'Goal resumed' : 'Goal paused', x.name);
  });
  PM51.on('goals-stop', el => {
    const x = goals().find(o => o.id === ds(el, 'id')); if (!x) return;
    PM51.confirm(`Stop “${x.name}”?`, 'Work done so far is kept, along with the last checkpoint. The Goal will not continue.', 'Stop Goal', () => { const i = goals().indexOf(x); if (i >= 0) goals().splice(i, 1); saveState(); refresh(); PM51.toast('Goal stopped', x.name, 'warning'); }, true);
  });

  PM51.onChange('goals-default', el => { const d = g().defaults; d[ds(el, 'key')] = el.value; saveState(); });
  PM51.onChange('goals-verification', el => { g().verification[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('goals-verification-toggle', el => { const v = g().verification; const k = ds(el, 'key'); v[k] = !v[k]; saveState(); refresh(); });

  PM51.on('goals-reset', () => PM51.confirm('Reset Goal defaults?', 'The persona, crew, test profile and confirm step go back to their original values. Templates, running Goals and the rows that live in other managers are kept.', 'Reset', () => {
    const s = PM51.s(); const keep = { finished: (s.goals || {}).finished, o55V2: true }; s.goals = Object.assign(clone(DATA.goals), keep); g(); saveState(); refresh(); PM51.toast('Goal defaults reset', 'Defaults are back.');
  }));
  PM51.on('goals-help', () => PM51.panel({
    title: 'How Goals work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A Goal is a job the assistant runs on its own, phase by phase, until it is checked and delivered. You pick a template, and the Goal takes it from there.</p>')
      + PM51.panelSection('You stay in charge', PM51.kv([['Saving progress', 'A Goal saves as it goes, so it can pause and pick up again (Recovery).'], ['Risky steps', 'Goals follow the approvals set in Permissions.'], ['Checks', 'Nothing is called done until the checks pass and, if you want, you confirm.'], ['Receipts', 'Each finished Goal gets a receipt saying what was checked.']]))
      + PM51.panelSection('Templates', '<p class="pm51-ps-text">A template says what kind of job it is, who does it, its phases, and how carefully it checks. Start from a built-in template or make your own with New template.</p>')
  }));
})();
