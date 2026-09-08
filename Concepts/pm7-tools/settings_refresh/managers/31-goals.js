/* Goals & Automation — templates, active Goals, defaults, checkpoints & recovery, verification. */
(function () {
  const ID = 'goals';
  const KEY = 'goals-crew-personas';
  const TABS = [
    { id: 'templates', label: 'Templates' },
    { id: 'active', label: 'Active Goals' },
    { id: 'defaults', label: 'Defaults' },
    { id: 'checkpoints', label: 'Checkpoints & Recovery' },
    { id: 'verification', label: 'Verification' }
  ];
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
  const RETRY = [['0', 'Do not retry'], ['1', 'Once'], ['2', 'Twice'], ['3', 'Three times']];
  let seq = 0;
  const newId = p => p + '-' + Date.now().toString(36) + '-' + (++seq);

  const g = () => PM51.s().goals;
  const templates = () => state.goalTemplates || (state.goalTemplates = []);
  const goals = () => state.activeGoals || (state.activeGoals = []);
  const personaNames = () => (state.personas || []).map(p => p.name);
  const crewNames = () => (state.crews || []).map(c => c.name);
  const routes = () => [...new Set([...templates().map(t => t.route), ...(state.personas || []).map(p => p.route), g().defaults.route].filter(Boolean))];
  const withCurrent = (list, v) => list.includes(v) ? list : [v, ...list];
  const selectedTemplate = () => templates().find(t => t.id === PM51.sel(ID)) || templates()[0];
  const refresh = () => PM51.refresh(ID, { swap: false });
  const crewName = v => (state.crews || []).find(c => c.name.toLowerCase() === String(v || '').toLowerCase())?.name || v;

  PM51.style(`
#panel-settings .pm51-goals-text { margin: 0; width: 100%; font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-goals-bar { display: inline-block; width: 110px; height: 6px; border-radius: 99px; background: var(--k3-bg-2); border: 1px solid var(--k3-line); overflow: hidden; vertical-align: middle; }
#panel-settings .pm51-goals-bar i { display: block; height: 100%; border-radius: 99px; background: rgba(var(--accent-primary-rgb), .85); }
#panel-settings .pm51-goals-pct { min-width: 34px; text-align: right; font-size: 11.5px; color: var(--k3-text-3); }
`);

  /* ---------- Templates ------------------------------------------------ */
  function templatesTab() {
    const t = selectedTemplate();
    if (!t) return PM51.empty('No templates yet', 'A template describes a job the assistant can run on its own.', { label: 'New template', icon: 'plus', action: 'pm51-goals-template-new' });
    const body = PM51.rows([
      { label: 'What it does', cls: 'is-wrap', control: `<p class="pm51-goals-text">${h(t.description || '')}</p>` },
      { label: 'Persona', help: 'Who does the work.', value: t.persona },
      { label: 'Model route', help: 'Which AI service handles each step.', value: t.route }
    ]) + PM51.section({ title: 'Phases', help: 'The Goal moves through these in order.', body: PM51.steps((t.phases || []).map(p => ({ title: p, desc: PHASE_HELP[p] || '' }))) })
      + PM51.advanced([
        PM51.section({ title: 'Effective settings', help: 'What this template adds on top of the defaults.', body: PM51.kv([['Checkpoints', (t.checkpoints || []).join(' · ') || 'Defaults'], ['Helpers', t.subagents || 'Defaults'], ['Verification', t.verification || 'Defaults'], ['Evidence', t.evidence || 'Defaults']]) }),
        PM51.section({ title: 'Export', help: 'Share this template with another workspace.', action: { label: 'Export', small: true, icon: 'download', action: 'pm51-goals-template-export', data: { id: t.id } } }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Template id', t.id], ['Phases', String((t.phases || []).length)]]) })
      ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Templates', count: templates().length,
      add: { action: 'pm51-goals-template-new', label: 'New template' },
      items: templates().map(x => ({ id: x.id, title: x.name, meta: `${(x.phases || []).length} phases · ${x.persona}`, avatar: icon('rocket'), selected: x.id === t.id })),
      detail: {
        title: t.name, pill: PM51.pill('Ready'), subtitle: `${(t.phases || []).length} phases · ${t.verification || 'Standard'} verification`,
        primary: { label: 'Start Goal', icon: 'play', action: 'pm51-goals-start', data: { id: t.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => editTemplate(t) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(t); copy.id = newId('template'); copy.name = t.name + ' copy'; templates().push(copy); PM51.setSel(ID, copy.id); saveState(); refresh(); PM51.toast('Template duplicated', copy.name); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${t.name}”?`, 'Goals already started from it keep running.', 'Delete', () => { const i = templates().indexOf(t); if (i >= 0) templates().splice(i, 1); PM51.setSel(ID, (templates()[0] || {}).id); saveState(); refresh(); PM51.toast('Template deleted', t.name, 'warning'); }, true) }
        ], t.name),
        body
      }
    });
  }
  function editTemplate(t) {
    const isNew = !t;
    const v = t || { name: '', description: '', persona: g().defaults.persona, route: g().defaults.route, phases: ['Understand', 'Plan', 'Build', 'Verify', 'Deliver'] };
    openDialog({
      title: isNew ? 'New template' : 'Edit template', subtitle: isNew ? 'Describe a job the assistant can run on its own.' : v.name,
      body: formField('Name', 'name', v.name, { full: true, autofocus: true, placeholder: 'For example: Release checklist' })
        + formField('What it does', 'description', v.description, { type: 'textarea', full: true })
        + formField('Persona', 'persona', v.persona, { type: 'select', choices: withCurrent(personaNames(), v.persona) })
        + formField('Model route', 'route', v.route, { type: 'select', choices: withCurrent(routes(), v.route) })
        + formField('Phases', 'phases', (v.phases || []).join(', '), { full: true, help: 'In order, separated by commas.' }),
      saveLabel: isNew ? 'Create template' : 'Save changes',
      onSave: data => {
        const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the template a name', 'A short name helps you pick it later.', 'warning'); return false; }
        const phases = String(data.phases || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!phases.length) { PM51.toast('Add at least one phase', 'For example: Plan, Build, Verify.', 'warning'); return false; }
        if (isNew) { const rec = { id: newId('template'), name, description: String(data.description || ''), persona: data.persona, route: data.route, phases, checkpoints: ['Before irreversible operations'], subagents: 'Automatic by workload', verification: 'Thorough', evidence: 'Retain compact receipt' }; templates().push(rec); PM51.setSel(ID, rec.id); }
        else Object.assign(t, { name, description: String(data.description || ''), persona: data.persona, route: data.route, phases });
        saveState(); refresh(); PM51.toast(isNew ? 'Template created' : 'Template saved', name);
      }
    });
  }

  /* ---------- Active Goals --------------------------------------------- */
  function activeTab() {
    const list = goals();
    if (!list.length) return PM51.empty('No Goals running.', 'Start one from a template when you have a job the assistant can do on its own.', { label: 'Choose a template', icon: 'rocket', action: 'pm51-tab', data: { manager: ID, tab: 'templates' } });
    return PM51.section({
      title: 'Running now', help: 'Select a Goal to change its route or stop it.',
      body: PM51.list(list.map(x => ({
        title: x.name, pill: PM51.pill(x.state, x.state === 'Running' ? 'ready' : 'attention'),
        meta: `Phase ${x.phase} · ${x.persona} · ${x.route}${x.checkpoint && x.checkpoint !== 'None' ? ' · ' + x.checkpoint : ''}`,
        action: 'pm51-goals-open', data: { id: x.id },
        end: `<span class="pm51-goals-bar" aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, Number(x.progress) || 0))}%"></i></span><span class="pm51-goals-pct">${Number(x.progress) || 0}%</span>`
          + PM51.btn({ label: x.state === 'Running' ? 'Pause' : 'Resume', small: true, icon: x.state === 'Running' ? 'pause' : 'play', action: 'pm51-goals-toggle', data: { id: x.id } })
      })))
    });
  }
  function openGoal(x) {
    PM51.panel({
      title: x.name, pill: PM51.pill(x.state, x.state === 'Running' ? 'ready' : 'attention'),
      body: PM51.panelSection('Where it is', PM51.kv([['Phase', x.phase], ['Progress', `${x.progress}%`], ['Persona', x.persona], ['Model route', x.route], ['Checkpoint', x.checkpoint || 'None'], ['Updated', x.updated]]))
        + PM51.panelSection('Change future route', PM51.field('Route for the remaining phases', PM51.select(x.route, withCurrent(routes(), x.route), { label: 'Future route' }), 'The current phase finishes on its present route.'))
        + PM51.panelSection('Stop', '<p class="pm51-ps-help">Stopping keeps the work done so far and the last checkpoint.</p>' + PM51.btn({ label: 'Stop Goal', icon: 'close', danger: true, small: true, action: 'pm51-goals-stop', data: { id: x.id } })),
      primaryLabel: 'Save route', onPrimary: wrap => { const sel = wrap.querySelector('select'); if (sel && sel.value !== x.route) { x.route = sel.value; x.updated = 'Now'; saveState(); refresh(); PM51.toast('Route changed', `${x.name} continues on ${x.route} after this phase.`); } }
    });
  }

  /* ---------- Defaults ------------------------------------------------- */
  function defaultsTab() {
    const d = g().defaults;
    return [
      PM51.section({
        title: 'New Goals start with', help: 'Templates can override any of these.',
        body: PM51.rows([
          { label: 'Model route', help: 'Which AI service handles the work.', control: PM51.select(d.route, withCurrent(routes(), d.route), { action: 'pm51-goals-default', data: { key: 'route' }, label: 'Default model route' }) },
          { label: 'Persona', help: 'Who does the work.', control: PM51.select(d.persona, withCurrent(personaNames(), d.persona), { action: 'pm51-goals-default', data: { key: 'persona' }, label: 'Default persona' }) },
          { label: 'Crew', help: 'The team the persona can call on.', control: PM51.select(crewName(d.crew), withCurrent(crewNames(), crewName(d.crew)), { action: 'pm51-goals-default', data: { key: 'crew' }, label: 'Default crew' }) },
          { label: 'Allow helpers', help: 'Let the Goal hand bounded tasks to other personas.', control: PM51.toggle(!!d.subagents, { action: 'pm51-goals-default-toggle', data: { key: 'subagents' }, label: 'Allow helpers' }) },
          { label: 'Work in parallel', help: 'How many helpers may run at the same time.', control: PM51.select(String(d.maxParallel), ['1', '2', '3', '4', '6'], { action: 'pm51-goals-default', data: { key: 'maxParallel' }, label: 'Max parallel helpers' }) }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Routing details', body: PM51.kv([['Order of precedence', 'Template · persona · this page · provider default'], ['If a route is unavailable', 'The named fallback route is used and noted in the Goal summary'], ['Where routes are defined', 'Providers & Accounts']]) }),
        PM51.section({ title: 'Helper policy', body: PM51.kv([['When helpers are used', 'Large or multi-part work, or when the template asks'], ['What helpers receive', 'A bounded task and only the context it needs'], ['What comes back', 'A short task summary the Goal checks before continuing']]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Checkpoints & Recovery ----------------------------------- */
  function checkpointsTab() {
    const c = g().checkpoints;
    return [
      PM51.section({
        title: 'Checkpoints', help: 'A checkpoint saves the Goal so it can pick up where it left off.',
        body: PM51.rows([
          { label: 'Save a checkpoint after each phase', control: PM51.toggle(!!c.afterPhase, { action: 'pm51-goals-checkpoint-toggle', data: { key: 'afterPhase' }, label: 'Save a checkpoint after each phase' }) },
          { label: 'Ask before risky steps', help: 'Deleting files, sending changes, or paid access.', control: PM51.toggle(!!c.askRisky, { action: 'pm51-goals-checkpoint-toggle', data: { key: 'askRisky' }, label: 'Ask before risky steps' }) }
        ])
      }),
      PM51.section({
        title: 'If something interrupts', help: 'A lost connection, a closed laptop, or a service that stops answering.',
        body: PM51.rows([
          { label: 'Resume automatically', help: 'Continue from the last checkpoint when things are back.', control: PM51.toggle(!!c.resume, { action: 'pm51-goals-checkpoint-toggle', data: { key: 'resume' }, label: 'Resume automatically' }) },
          { label: 'Retry a failed step', control: PM51.select(String(c.retry), RETRY, { action: 'pm51-goals-checkpoint', data: { key: 'retry' }, label: 'Retry a failed step' }) },
          { label: 'Then', help: 'What happens if it still fails.', control: PM51.segmented(c.then, ['Ask me', 'Stop'], { action: 'pm51-goals-then', label: 'After retries' }) }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Phase library', help: 'Phases a template can use.', body: PM51.steps(Object.keys(PHASE_HELP).slice(0, 5).map(p => ({ title: p, desc: PHASE_HELP[p] }))) }),
        PM51.section({ title: 'Recovery details', body: PM51.kv([['What a checkpoint holds', 'Phase, to-do list, helpers, open changes, and the next step'], ['Open processes', 'Recorded, never assumed to survive'], ['Secrets', 'Referenced, never stored in the checkpoint'], ['Repeated failures', 'The Goal pauses instead of looping']]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Verification --------------------------------------------- */
  function verificationTab() {
    const v = g().verification;
    const profiles = (state.testProfiles || []).map(p => p.name);
    return [
      PM51.section({
        title: 'Before a Goal is called done', help: 'These checks run in the Verify phase.',
        body: PM51.rows([
          { label: 'Run test profile', help: 'Profiles are defined in Testing & Debug.', control: PM51.select(v.profile, withCurrent(profiles, v.profile), { action: 'pm51-goals-verification', data: { key: 'profile' }, label: 'Test profile' }) },
          { label: 'Require evidence', help: 'Keep test results and screenshots with the Goal.', control: PM51.toggle(!!v.evidence, { action: 'pm51-goals-verification-toggle', data: { key: 'evidence' }, label: 'Require evidence' }) },
          { label: 'Ask me to confirm', help: 'The Goal waits for you before it is marked complete.', control: PM51.toggle(!!v.confirm, { action: 'pm51-goals-verification-toggle', data: { key: 'confirm' }, label: 'Ask me to confirm' }) }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Evidence format', body: PM51.kv([['Plan and decisions', 'Compact structured summary'], ['Tests', 'Summary plus failing detail'], ['Screenshots', 'Only when the work is visual, or when you ask'], ['Files', 'Expected paths and content checks'], ['Secrets', 'Redacted before anything is kept'], ['Retention', 'Follows the project history policy']]) })
      ].join(''))
    ].join('');
  }

  function render() {
    const tab = PM51.tab(ID, 'templates');
    const body = tab === 'active' ? activeTab() : tab === 'defaults' ? defaultsTab() : tab === 'checkpoints' ? checkpointsTab() : tab === 'verification' ? verificationTab() : templatesTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset Goal defaults', action: 'pm51-goals-reset' }, { label: 'How Goals work', action: 'pm51-goals-help' }] });
  }
  PM51.manager('goals', { render });

  /* ---------- actions -------------------------------------------------- */
  PM51.on('goals-template-new', () => editTemplate(null));
  PM51.on('goals-template-export', el => {
    const t = templates().find(x => x.id === ds(el, 'id')); if (!t) return;
    PM51.panel({ title: 'Export template', subtitle: t.name, body: PM51.panelSection('What is included', PM51.kv([['Name', t.name], ['Phases', (t.phases || []).join(' · ')], ['Persona and route', `${t.persona} · ${t.route}`], ['Format', 'JSON · no secrets']])) + PM51.note('Saving a file needs the desktop app. Nothing is written in this preview.'), primaryLabel: 'Save file', onPrimary: () => PM51.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info') });
  });
  PM51.on('goals-start', el => {
    const t = templates().find(x => x.id === ds(el, 'id')); if (!t) return;
    PM51.panel({
      title: 'Start a Goal', subtitle: `From the ${t.name} template.`,
      body: PM51.panelSection('Goal', PM51.field('Name', PM51.input(t.name, { label: 'Goal name', cls: 'pm51-goals-name' }))
        + PM51.field('Persona', PM51.select(t.persona, withCurrent(personaNames(), t.persona), { label: 'Persona', cls: 'pm51-goals-persona' }))
        + PM51.field('Model route', PM51.select(t.route, withCurrent(routes(), t.route), { label: 'Model route', cls: 'pm51-goals-route' })))
        + PM51.panelSection('What happens next', PM51.steps((t.phases || []).map(p => ({ title: p, desc: PHASE_HELP[p] || '' })))),
      primaryLabel: 'Start Goal', onPrimary: wrap => {
        const name = (wrap.querySelector('.pm51-goals-name') || {}).value || t.name;
        const persona = (wrap.querySelector('.pm51-goals-persona') || {}).value || t.persona;
        const route = (wrap.querySelector('.pm51-goals-route') || {}).value || t.route;
        goals().unshift({ id: newId('goal'), name: String(name).trim() || t.name, state: 'Running', phase: (t.phases || ['Understand'])[0], progress: 0, route, persona, checkpoint: 'None', updated: 'Now' });
        PM51.setTab(ID, 'active'); saveState(); PM51.refresh(ID);
        PM51.toast('Goal added to Active Goals', 'Example data only. In the app, the first phase starts now.', 'info');
      }
    });
  });
  PM51.on('goals-open', el => { const x = goals().find(o => o.id === ds(el, 'id')); if (x) openGoal(x); });
  PM51.on('goals-toggle', el => {
    const x = goals().find(o => o.id === ds(el, 'id')); if (!x) return;
    if (x.state === 'Running') { x.state = 'Paused'; x.checkpoint = 'Saved when paused'; } else { x.state = 'Running'; x.checkpoint = 'None'; }
    x.updated = 'Now'; saveState(); refresh(); PM51.toast(x.state === 'Running' ? 'Goal resumed' : 'Goal paused', x.name);
  });
  PM51.on('goals-stop', el => {
    const x = goals().find(o => o.id === ds(el, 'id')); if (!x) return;
    PM51.confirm(`Stop “${x.name}”?`, 'Work done so far is kept, along with the last checkpoint. The Goal will not continue.', 'Stop Goal', () => { const i = goals().indexOf(x); if (i >= 0) goals().splice(i, 1); saveState(); refresh(); PM51.toast('Goal stopped', x.name, 'warning'); }, true);
  });

  PM51.onChange('goals-default', el => { const d = g().defaults; const k = ds(el, 'key'); d[k] = k === 'maxParallel' ? Number(el.value) : el.value; saveState(); });
  PM51.on('goals-default-toggle', el => { const d = g().defaults; const k = ds(el, 'key'); d[k] = !d[k]; saveState(); refresh(); });
  PM51.on('goals-checkpoint-toggle', el => { const c = g().checkpoints; const k = ds(el, 'key'); c[k] = !c[k]; saveState(); refresh(); });
  PM51.onChange('goals-checkpoint', el => { const c = g().checkpoints; const k = ds(el, 'key'); c[k] = k === 'retry' ? Number(el.value) : el.value; saveState(); });
  PM51.on('goals-then', el => { g().checkpoints.then = ds(el, 'value'); saveState(); refresh(); });
  PM51.onChange('goals-verification', el => { g().verification[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('goals-verification-toggle', el => { const v = g().verification; const k = ds(el, 'key'); v[k] = !v[k]; saveState(); refresh(); });

  PM51.on('goals-reset', () => PM51.confirm('Reset Goal defaults?', 'Defaults, checkpoints, recovery, and verification go back to their original values. Templates and running Goals are kept.', 'Reset', () => {
    const s = PM51.s(); s.goals = clone(DATA.goals); saveState(); refresh(); PM51.toast('Goal defaults reset', 'Defaults are back.');
  }));
  PM51.on('goals-help', () => PM51.panel({
    title: 'How Goals work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A Goal is a job the assistant runs on its own, phase by phase, until it is verified and delivered. You pick a template, and the Goal takes it from there.</p>')
      + PM51.panelSection('You stay in charge', PM51.kv([['Checkpoints', 'Progress is saved so a Goal can pause and resume.'], ['Risky steps', 'The Goal asks before deleting, sending, or paying for anything.'], ['Verification', 'Nothing is called done until the checks pass and, if you want, you confirm.']]))
      + PM51.panelSection('Templates', '<p class="pm51-ps-text">Templates describe the phases, the persona, and the model route. Start from one of the built-in templates or make your own.</p>')
  }));
})();
