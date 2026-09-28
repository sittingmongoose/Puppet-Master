/* Goals & Automation — defaults, templates, recovery, checks (settings audit, 2026-09-27; user review, 2026-09-27).
   - Settings only sets what Goals start with. A Goal is started, watched, paused and stopped in the assistant chat,
     and the Planning Wizard hands one over when a plan is ready; so nothing here starts a Goal. The Active Goals
     tab (running Goals, pause, stop, change route, finished Goals and their receipts) and a template's "Start Goal"
     are gone. What they carried that is a default stays: how the progress view is drawn (Defaults) and what a
     receipt means (Checks). Each tab opens with one line saying so, for someone who has never seen a Goal.
   - A template is a reusable starting point: a Goal started from it begins with its kind of job, persona, phases
     and checks. Templates are made, changed, copied, exported and deleted here.
   - A template is made step by step (name, kind of job, who does it, its phases, how carefully it checks), in the
     same guided window as the other set-up helpers; phases come from the phase library, in order, plus your own.
   - "Kind of job" belongs to a template and to a Goal, not to the project, so it is drawn and kept per template.
   - The manager no longer keeps its own copies of what other settings decide: saving progress, resuming, retries and
     "then" are the Recovery rows; evidence is the Checks and Testing rows; helpers and parallel work are Personas'
     rows; "ask before risky steps" is Permissions' row; the Goal model is Providers' row. Each shows here as one line
     with a way to change it where it lives.
   - A receipt is earned, not chosen: Checks says what each strength means; the receipt itself is shown on each
     finished Goal in the assistant chat. */
(function () {
  const ID = 'goals';
  const KEY = 'goals-crew-personas';
  const TABS = [
    { id: 'defaults', label: 'Defaults' },
    { id: 'templates', label: 'Templates' },
    { id: 'checkpoints', label: 'Recovery' },
    { id: 'verification', label: 'Checks' }
  ];
  /* one line under the tabs: where Goals really start, and what this tab changes */
  const LEAD = {
    defaults: 'Goals are started in the <b>assistant chat</b>, or by the <b>Planning Wizard</b> when a plan is ready. This page only sets what every new Goal starts with.',
    templates: 'A template is a ready-made starting point for a Goal: the kind of job, who does it, its phases and how carefully it checks. You pick one when you start a Goal in the assistant chat.',
    checkpoints: 'What a Goal does when something interrupts it or a check fails. Every new Goal follows these.',
    verification: 'What has to pass before a Goal is called done. Every new Goal follows these.'
  };
  const lead = tab => `<p class="o55-mgp-lead">${icon('info')}<span>${LEAD[tab]}</span></p>`;
  const S = {
    kind: 'planning.verification.goal-template', write: 'planning.verification.goal-write-mode', receipt: 'planning.verification.receipt-type',
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
  let seq = 0;
  const newId = p => p + '-' + Date.now().toString(36) + '-' + (++seq);

  const g = () => {
    const s = PM51.s().goals;
    if (!s.o55V2) {
      s.o55V2 = true;
      templates().forEach(t => { t.props = t.props || {}; if (!t.props[S.kind] && KIND_OF[t.id]) t.props[S.kind] = KIND_OF[t.id]; if (!t.quality) t.quality = QUALITY_OF[t.verification] || 'balanced'; });
      if (s.checkpoints) { delete s.checkpoints.afterPhase; delete s.checkpoints.askRisky; delete s.checkpoints.resume; delete s.checkpoints.retry; delete s.checkpoints.then; }
      if (s.defaults) { delete s.defaults.subagents; delete s.defaults.maxParallel; }
      if (s.verification) delete s.verification.evidence;
    }
    return s;
  };
  const templates = () => state.goalTemplates || (state.goalTemplates = []);
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
    if (!t) return lead('templates') + PM51.home(S.kind, PM51.empty('No templates yet', 'A template is a ready-made starting point for a Goal. Make one, then pick it when you start a Goal in the assistant chat.', { label: 'New template', icon: 'plus', action: 'pm51-goals-template-new' }));
    const body = PM51.rows([
      { label: 'What it does', cls: 'is-wrap', control: `<p class="pm51-goals-text">${h(t.description || '')}</p>` }
    ]) + PM51.scoped.rows([PM51.scoped.row(S.kind, kindOf(t), { scope: 'template', data: { id: t.id }, noChanged: true, help: 'What sort of job this is. A Goal started from this template begins with it.' })])
      + PM51.rows([
        { label: 'Persona', help: 'Who does the work.', value: t.persona },
        { label: 'Model route', help: 'Which AI service handles each step.', value: t.route },
        { label: 'Checks', help: 'How carefully it checks its own work.', value: qualityLabel(t.quality) }
      ]) + PM51.section({ title: 'Phases', help: 'The Goal moves through these in order.', body: PM51.steps((t.phases || []).map(p => ({ title: p, desc: PHASE_HELP[p] || 'A phase of your own.' }))) })
      + PM51.advanced([
        PM51.section({ title: 'Effective settings', help: 'What this template adds on top of the defaults.', body: PM51.kv([['Checkpoints', (t.checkpoints || []).join(' · ') || 'Defaults'], ['Helpers', t.subagents || 'Defaults'], ['Checks', qualityLabel(t.quality)], ['Evidence', t.evidence || 'Defaults']]) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Template id', t.id], ['Kind', kindOf(t) || 'none'], ['Phases', String((t.phases || []).length)]]) })
      ].join(''));
    return lead('templates') + PM51.listDetail({
      id: ID, rosterTitle: 'Templates', count: templates().length,
      add: { action: 'pm51-goals-template-new', label: 'New template' },
      items: templates().map(x => ({ id: x.id, title: x.name, meta: `${kindLabel(kindOf(x))} · ${(x.phases || []).length} phases`, avatar: icon((KINDS.find(k => k[0] === kindOf(x)) || [])[1] || 'rocket'), selected: x.id === t.id })),
      detail: {
        title: t.name, subtitle: `${(t.phases || []).length} phases · ${t.persona}`,
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-goals-template-edit', data: { id: t.id } },
        menu: anchor => menu(anchor, [
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(t); copy.id = newId('template'); copy.name = t.name + ' copy'; templates().push(copy); PM51.setSel(ID, copy.id); saveState(); refresh(); PM51.toast('Template duplicated', copy.name); } },
          { label: 'Export', icon: 'download', meta: 'Share it with another workspace', onClick: () => exportTemplate(t) },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${t.name}”?`, 'Goals already started from it are not affected.', 'Delete', () => { const i = templates().indexOf(t); if (i >= 0) templates().splice(i, 1); PM51.setSel(ID, (templates()[0] || {}).id); saveState(); refresh(); PM51.toast('Template deleted', t.name, 'warning'); }, true) }
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
      title: isNew ? 'New Goal template' : `Edit ${t.name}`, subtitle: 'A ready-made starting point for a Goal. Goals themselves are started in the assistant chat.', eyebrow: 'Goal template', icon: 'rocket',
      draft: { name: base.name, description: base.description, persona: base.persona, route: base.route, phases: (base.phases || []).slice(), quality: base.quality || 'balanced', kind: t ? kindOf(t) : '' },
      finishLabel: isNew ? 'Create template' : 'Save',
      steps: [
        { label: 'Name', icon: 'edit', title: 'What is the job called?', lead: 'A short name, and one line on what it does.', recap: d => d.name,
          render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-goals-w-name" value="${a(d.name)}" placeholder="For example: Release checklist" autocomplete="off"/>`)}${PM51.field('What it does', `<textarea class="form-textarea o55-goals-w-desc" rows="3" placeholder="For example: Update the changelog, bump the version and tag the release.">${h(d.description)}</textarea>`)}</div>`,
          collect: (w, d) => { d.name = String(w.querySelector('.o55-goals-w-name').value || '').trim(); d.description = String(w.querySelector('.o55-goals-w-desc').value || '').trim(); },
          check: d => !d.name ? 'Give the template a name.' : (isNew && templates().some(x => x.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a template called ${d.name}.` : '') },
        { label: 'Kind', icon: 'layers', title: 'What kind of job is it?', lead: 'It tells a Goal what "done" looks like. A Goal started from this template begins with it.',
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

  /* ---------- Defaults ------------------------------------------------- */
  function defaultsTab() {
    const d = g().defaults;
    const helpersOn = on(PM51.value(S.helpers)); const max = Number(PM51.value(S.parallel)) || 4;
    return lead('defaults') + PM51.section({
      title: 'New Goals start with', help: 'A template can change any of these for the Goals started from it.',
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
    return lead('checkpoints') + PM51.slot()
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
    return lead('verification') + PM51.section({
      title: 'Before a Goal is called done', help: 'The checks that run in the Verify phase.',
      body: PM51.bound.rows([S.quality])
        + PM51.rows([{ label: 'Run test profile', help: 'Profiles are set up in Testing & Debug.', control: PM51.select(v.profile, withCurrent(profiles, v.profile), { action: 'pm51-goals-verification', data: { key: 'profile' }, label: 'Test profile' }) }])
        + PM51.bound.rows([S.validation, S.independent, S.receipts])
        + PM51.home(S.receipt, PM51.rows([{ label: PM51.rowLabel(PM51.setting(S.receipt)), help: PM51.rowHelp(PM51.setting(S.receipt)), value: on(PM51.value(S.receipts)) ? null : 'None while receipts are off', muted: true, action: { label: 'What each means', icon: 'info', action: 'pm51-goals-receipts-help' } }]))
        + PM51.rows([{ label: 'Ask me to confirm', help: 'The Goal waits for you before it is marked complete.', control: PM51.toggle(!!v.confirm, { action: 'pm51-goals-verification-toggle', data: { key: 'confirm' }, label: 'Ask me to confirm' }) }])
        + PM51.bound.rows([S.reports])
        + PM51.rows([{ label: 'How long proof is kept', help: 'Retention and what is hidden in saved proof are set in Testing & Debug, History.', action: { label: 'Open', icon: 'arrowRight', action: 'pm51-goals-reveal', data: { setting: S.retention } } }])
    }) + PM51.slot();
  }

  function render() {
    let tab = PM51.tab(ID, 'defaults');
    /* a tab saved before the Active Goals tab was removed opens Defaults */
    if (!TABS.some(t => t.id === tab)) { tab = 'defaults'; PM51.setTab(ID, tab); }
    const body = tab === 'templates' ? templatesTab() : tab === 'checkpoints' ? checkpointsTab() : tab === 'verification' ? verificationTab() : defaultsTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset Goal defaults', action: 'pm51-goals-reset' }, { label: 'How Goals work', action: 'pm51-goals-help' }] });
  }
  PM51.manager('goals', { render });
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  PM51.scopedSetter('template', (id, value, el) => { const t = templates().find(x => x.id === ds(el, 'id')); if (!t) return ''; t.props = t.props || {}; t.props[id] = value; saveState(); refresh(); return t.name; });
  PM51.perValues(S.kind, () => templates().map(t => ({ name: t.name, value: kindOf(t) })));
  [S.quality, S.receipts].forEach(id => PM51.watch(id, () => refresh()));

  /* ---------- actions -------------------------------------------------- */
  /* menus here: blank icons fixed and room for each item's line (styles.d/63-memory-goals-personas.css) */
  function menu(anchor, items, title) { const pop = PM51.menu(anchor, items, title); if (pop) pop.classList.add('o55-mgp-menu'); return pop; }
  function exportTemplate(t) {
    PM51.panel({ title: 'Export template', subtitle: t.name, body: PM51.panelSection('What is included', PM51.kv([['Name', t.name], ['Kind of job', kindLabel(kindOf(t))], ['Phases', (t.phases || []).join(' · ')], ['Persona and route', `${t.persona} · ${t.route}`], ['Format', 'JSON · no secrets']])) + PM51.note('Saving a file needs the desktop app. Nothing is written in this preview.'), primaryLabel: 'Save file', onPrimary: () => PM51.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info') });
  }
  PM51.on('goals-template-new', () => templateWizard(null));
  PM51.on('goals-template-edit', el => { const t = templates().find(x => x.id === ds(el, 'id')); if (t) templateWizard(t); });
  PM51.on('goals-template-export', el => { const t = templates().find(x => x.id === ds(el, 'id')); if (t) exportTemplate(t); });
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
  /* what each receipt strength means; a Goal earns one from the checks it passed, nobody picks it */
  PM51.on('goals-receipts-help', () => PM51.panel({
    title: 'Receipt strength', eyebrow: 'Checks', icon: 'file',
    summary: 'A finished Goal earns a receipt from the checks it passed. It is shown on the Goal in the assistant chat, not chosen here.',
    body: PM51.panelSection('From strongest to weakest', PM51.kv(['strong', 'standard', 'lightweight', 'degraded', 'blocked'].map(k => [PM51.valueLabel(S.receipt, k), { strong: 'Proof anyone can re-run, and a reviewer who did not do the work signed it off.', standard: 'The usual tests passed and one review looked at it.', lightweight: 'Light checks only, as a small, low-risk job allows.', degraded: 'It finished, but a check could not run; what is missing is listed.', blocked: 'It stopped before it could be called done.' }[k]])))
      + PM51.note('Stricter checks under this tab make the stronger receipts reachable.', 'info')
  }));

  PM51.onChange('goals-default', el => { const d = g().defaults; d[ds(el, 'key')] = el.value; saveState(); });
  PM51.onChange('goals-verification', el => { g().verification[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('goals-verification-toggle', el => { const v = g().verification; const k = ds(el, 'key'); v[k] = !v[k]; saveState(); refresh(); });

  PM51.on('goals-reset', () => PM51.confirm('Reset Goal defaults?', 'The persona, crew, test profile and confirm step go back to their original values. Templates and the rows that live in other managers are kept.', 'Reset', () => {
    const s = PM51.s(); s.goals = Object.assign(clone(DATA.goals), { o55V2: true }); g(); saveState(); refresh(); PM51.toast('Goal defaults reset', 'Defaults are back.');
  }));
  PM51.on('goals-help', () => PM51.panel({
    title: 'How Goals work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A Goal is a job the assistant runs on its own, phase by phase, until it is checked and delivered.</p>')
      + PM51.panelSection('Where a Goal starts', PM51.kv([['Assistant chat', 'Ask for a Goal in a chat, pick a template if you like, and follow its progress there. Pause and stop it there too.'], ['Planning Wizard', 'When a plan is ready, the wizard can hand it over as a Goal.'], ['This page', 'Only what new Goals start with. Nothing here starts, pauses or stops a Goal.']]))
      + PM51.panelSection('You stay in charge', PM51.kv([['Saving progress', 'A Goal saves as it goes, so it can pause and pick up again (Recovery).'], ['Risky steps', 'Goals follow the approvals set in Permissions.'], ['Checks', 'Nothing is called done until the checks pass and, if you want, you confirm.'], ['Receipts', 'Each finished Goal gets a receipt saying what was checked.']]))
      + PM51.panelSection('Templates', '<p class="pm51-ps-text">A template says what kind of job it is, who does it, its phases, and how carefully it checks. Start from a built-in template or make your own with New template.</p>')
  }));
})();
