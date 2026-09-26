/* Testing & Debug — how your work gets checked and how you debug it. */
(function () {
  const ID = 'testing';
  const KEY = 'testing-debug-capture';
  const TABS = [{ id: 'profiles', label: 'Profiles' }, { id: 'when', label: 'When to Test' }, { id: 'browser-native', label: 'Browser & Native' }, { id: 'debug', label: 'Debug' }, { id: 'history', label: 'History' }];
  const DEFAULTS = clone({ testProfiles: state.testProfiles || [], debugProfiles: state.debugProfiles || [] });
  const BROWSER_DEFAULTS = { useBuiltIn: true, screenshots: 'On failure', visual: true };
  const NATIVE_DEFAULTS = { checks: true, runtime: true };
  const TRIGGERS = ['After meaningful edits', 'Before completion', 'Manual or release Goal'];
  const RETRY_LABELS = [[0, 'Do not retry'], [1, 'Once'], [2, 'Twice'], [3, '3 times']];
  const THEN = ['Ask me', 'Stop', 'Continue'];
  const ADAPTERS = ['Detected native debugger', 'Browser devtools', 'Language-aware', 'Attach to a running process'];
  const WORKFLOWS = [['Settings navigation', 'Every domain, workspace, and short page section'], ['Manager controls', 'Add, edit, check, reorder, turn off, remove'], ['Menus, dialogs, and motion', 'Open and close continuity, focus, no flashes'], ['Responsive layouts', 'Desktop, compact, and mobile navigation']];
  const profiles = () => (state.testProfiles = state.testProfiles || []);
  const debugs = () => (state.debugProfiles = state.debugProfiles || []);
  const t = () => { const s = PM51.s(); if (!s.testing) s.testing = clone(DATA.testing); const x = s.testing; if (!x.runs) x.runs = []; if (!x.evidence) x.evidence = { keepDays: 90, screenshots: true, logs: true }; if (!x.triggers) x.triggers = { afterEdits: 'Fast feedback', beforeCompletion: 'Thorough verification', manual: 'Release candidate', retry: 1, then: 'Ask me' }; if (!x.browser) x.browser = clone(BROWSER_DEFAULTS); if (!x.native) x.native = clone(NATIVE_DEFAULTS); return x; };
  const profileById = id => profiles().find(x => x.id === id);
  const debugById = id => debugs().find(x => x.id === id);
  const selected = (kind, list) => list.find(x => x.id === PM51.sel(ID + '-' + kind)) || list.find(x => x.status === 'default') || list[0];
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'profile';
  const uniqueId = (list, base) => { let id = base, n = 2; while (list.some(x => x.id === id)) id = base + '-' + n++; return id; };
  const isDefault = p => p.status === 'default';
  const profilePill = p => PM51.pill('Ready') + (isDefault(p) ? ' ' + PM51.chip('Default') : '');
  const folderLabel = cwd => !cwd || cwd === '${projectRoot}' ? 'Project folder' : cwd;
  const actionRow = (...buttons) => `<div class="pm51-testing-actions">${buttons.join('')}</div>`;
  const readField = (wrap, name) => { const el = wrap.querySelector(`[data-field="${name}"]`); return el ? el.value.trim() : ''; };
  const profileChoices = () => profiles().map(p => p.name).concat(['None']);
  const withChoice = (choices, value) => choices.includes(value) || !value ? choices : [value].concat(choices);

  PM51.style(`
#panel-settings .pm51-testing-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-testing-actions:first-child { margin-top: 0; }
`);

  /* ---------- Profiles ------------------------------------------------------ */
  function renderProfiles() {
    const list = profiles();
    if (!list.length) return PM51.section({ title: 'Test profiles', help: 'A profile is a set of checks that run together.', body: PM51.empty('No test profiles yet', 'Make one to decide what gets checked and when.', { label: 'New test profile', action: 'pm51-testing-add-profile', icon: 'plus' }) });
    const p = selected('profiles', list);
    const body = PM51.rows([
      { label: 'What it checks', value: p.description || 'Not set' },
      { label: 'When it runs', value: p.trigger || 'Manual only' },
      { label: 'Browser checks', value: p.browser || 'None' },
      { label: 'Native checks', value: p.native || 'None' }
    ]) + PM51.section({
      title: 'Stages', help: 'They run in this order. A failing stage stops the run.',
      body: PM51.steps((p.stages || []).map((s, i) => ({ title: s, desc: i === 0 ? 'Runs first' : 'Runs after the previous stage' })))
    }) + PM51.advanced([
      PM51.kv([['Effective plan', (p.stages || []).join(' → ') || 'No stages'], ['Evidence kept', p.evidence || 'Failures and summary'], ['Profile', isDefault(p) ? 'Default for new work' : 'Used when chosen']]),
      PM51.rows([
        { label: 'Time limit', help: 'The run stops if it takes longer.', control: PM51.select(p.timeout || '20 minutes', ['10 minutes', '20 minutes', '45 minutes', '2 hours'], { action: 'pm51-testing-profile-field', data: { id: p.id, field: 'timeout' }, label: 'Time limit' }) },
        { label: 'Retries', help: 'How many times a failing stage is tried again.', control: PM51.select(String(p.retries == null ? 1 : p.retries), RETRY_LABELS.map(([v, l]) => [String(v), l]), { action: 'pm51-testing-profile-field', data: { id: p.id, field: 'retries' }, label: 'Retries' }) }
      ]),
      actionRow(PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-testing-diagnostics' }))
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterId: 'testing-profiles', rosterTitle: 'Test profiles', count: list.length,
      add: { action: 'pm51-testing-add-profile', label: 'New test profile' },
      filter: { placeholder: 'Filter profiles' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: isDefault(x) ? 'Default · ' + (x.trigger || 'Manual') : (x.trigger || 'Manual'), tone: 'ready', selected: x.id === p.id, data: { kind: 'profiles' } })),
      selectAction: 'pm51-testing-pick',
      detail: {
        title: p.name, subtitle: `${(p.stages || []).length} ${(p.stages || []).length === 1 ? 'stage' : 'stages'} · ${p.trigger || 'Manual only'}`, pill: profilePill(p),
        primary: { label: 'Run now', icon: 'play', action: 'pm51-testing-run', data: { id: p.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => editProfile(p.id) },
          { label: 'Duplicate', icon: 'copy', onClick: () => duplicateProfile(p.id) },
          { label: 'Make default', icon: 'pin', ariaDisabled: isDefault(p), meta: isDefault(p) ? 'Already default' : '', onClick: () => { profiles().forEach(x => { x.status = x.id === p.id ? 'default' : 'ready'; }); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Default profile', `${p.name} is now the default.`); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, ariaDisabled: isDefault(p), meta: isDefault(p) ? 'Default profile' : '', onClick: () => deleteProfile(p.id) }
        ], p.name),
        body
      }
    });
  }

  /* ---------- When to test -------------------------------------------------- */
  function renderWhen() {
    const tr = t().triggers;
    const choices = profileChoices();
    const sel = (value, key, label) => PM51.select(value || 'None', withChoice(choices, value), { action: 'pm51-testing-trigger', data: { key }, label });
    return [
      PM51.section({
        title: 'When tests run', help: 'Pick the profile for each moment. Choose None to skip that moment.',
        body: PM51.rows([
          { label: 'After meaningful edits', help: 'Quick checks while you work.', control: sel(tr.afterEdits, 'afterEdits', 'After meaningful edits') },
          { label: 'Before completion', help: 'The assistant must pass this before it says a job is done.', control: sel(tr.beforeCompletion, 'beforeCompletion', 'Before completion') },
          { label: 'Manual or release', help: 'When you ask for a full run, or a release Goal starts.', control: sel(tr.manual, 'manual', 'Manual or release') }
        ])
      }),
      PM51.section({
        title: 'If tests fail',
        body: PM51.rows([
          { label: 'Retry', help: 'Try a failing stage again before giving up.', control: PM51.select(String(tr.retry == null ? 1 : tr.retry), RETRY_LABELS.map(([v, l]) => [String(v), l]), { action: 'pm51-testing-trigger', data: { key: 'retry' }, label: 'Retry' }) },
          { label: 'Then', help: 'Ask me pauses and shows you the failure.', control: PM51.select(tr.then || 'Ask me', THEN, { action: 'pm51-testing-trigger', data: { key: 'then' }, label: 'Then' }) }
        ])
      }),
      PM51.advanced(PM51.section({ title: 'Verification gate details', body: PM51.kv([
        ['Before completion', `Blocks completion until ${tr.beforeCompletion && tr.beforeCompletion !== 'None' ? tr.beforeCompletion : 'no profile'} passes`],
        ['Before merge or delivery', 'Uses the same profile as Before completion'],
        ['Release', `Uses ${tr.manual && tr.manual !== 'None' ? tr.manual : 'no profile'}`],
        ['Flaky tests', 'A test that passes on retry is marked flaky and reported']
      ]) }))
    ].join('');
  }

  /* ---------- Browser & native ---------------------------------------------- */
  function renderBrowserNative() {
    const b = t().browser, n = t().native;
    return [
      PM51.section({
        title: 'Browser testing', help: 'For anything with a screen: web apps, docs, and this app.',
        body: PM51.rows([
          { label: 'Use built-in browser', help: 'Puppet Master drives its own browser to click through your app.', control: PM51.toggle(!!b.useBuiltIn, { action: 'pm51-testing-browser', data: { key: 'useBuiltIn' }, label: 'Use built-in browser' }) },
          { label: 'Screenshots', help: 'Pictures of the screen kept with each run.', control: PM51.select(b.screenshots || 'On failure', ['On failure', 'Always', 'Never'], { action: 'pm51-testing-browser-select', data: { key: 'screenshots' }, label: 'Screenshots' }) },
          { label: 'Visual and motion inspection', help: 'Checks appearance over time, not only the final screenshot.', control: PM51.toggle(!!b.visual, { action: 'pm51-testing-browser', data: { key: 'visual' }, label: 'Visual and motion inspection' }) },
          { label: 'Browser status', pill: PM51.pill('Ready'), help: 'Managed in Browser & SCM.', action: { label: 'Open Browser & SCM', icon: 'arrowRight', ghost: true, action: 'pm51-go', data: { domain: 'source', workspace: 'browser-scm' } } }
        ])
      }),
      PM51.section({
        title: 'Native app testing', help: 'For desktop apps and background services.',
        body: PM51.rows([
          { label: 'Native checks', help: 'Builds and launches the app to make sure it starts and shuts down cleanly.', control: PM51.toggle(!!n.checks, { action: 'pm51-testing-native', data: { key: 'checks' }, label: 'Native checks' }) },
          { label: 'Runtime and service tests', help: 'Checks the background service, its connections, and recovery.', control: PM51.toggle(!!n.runtime, { action: 'pm51-testing-native', data: { key: 'runtime' }, label: 'Runtime and service tests' }) },
          { label: 'Test tools', pill: PM51.pill('Ready'), help: 'Build tools and test runners on this computer.', action: { label: 'Check test tools', icon: 'test', action: 'pm51-testing-check-tools' } }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Browser workflow catalog', help: 'Ready-made click-through checks the browser can run.', body: PM51.list(WORKFLOWS.map(([title, meta]) => ({ title, meta, pill: PM51.pill('Ready'), avatar: icon('browser') }))) }),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Smoke command', 'pm test --native --smoke'], ['Desktop viewport', '1440 x 1000'], ['Narrow viewport', '900 x 900'], ['Mobile viewport', '390 x 844']]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Debug ----------------------------------------------------------- */
  function renderDebug() {
    const list = debugs();
    if (!list.length) return PM51.section({ title: 'Debug profiles', help: 'A debug profile says which program to start and how.', body: PM51.empty('No debug profiles yet', 'Make one to start debugging with a single click.', { label: 'New debug profile', action: 'pm51-testing-add-debug', icon: 'plus' }) });
    const d = selected('debug', list);
    const body = PM51.rows([
      { label: 'Debugger', value: d.adapter || 'Not set' },
      { label: 'Program', value: d.program || 'Not set' },
      { label: 'Environment', value: d.env || 'Project environment' }
    ]) + PM51.advanced([
      PM51.kv([['Arguments', d.args || 'None'], ['Working folder', folderLabel(d.cwd)], ['Status', PM51.plain(d.status || 'ready')]]),
      actionRow(PM51.btn({ label: 'Check launch', small: true, icon: 'test', action: 'pm51-testing-check-launch', data: { id: d.id } }))
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterId: 'testing-debug', rosterTitle: 'Debug profiles', count: list.length,
      add: { action: 'pm51-testing-add-debug', label: 'New debug profile' },
      filter: { placeholder: 'Filter debug profiles' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: x.adapter || '', tone: 'ready', selected: x.id === d.id, data: { kind: 'debug' } })),
      selectAction: 'pm51-testing-pick',
      detail: {
        title: d.name, subtitle: d.program || '', pill: PM51.pill('Ready'),
        primary: { label: 'Start debugging', icon: 'play', action: 'pm51-testing-start-debug', data: { id: d.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Edit', icon: 'edit', onClick: () => editDebug(d.id) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(d); copy.id = uniqueId(debugs(), d.id + '-copy'); copy.name = d.name + ' copy'; debugs().push(copy); PM51.setSel(ID + '-debug', copy.id); saveState(); PM51.refresh(ID, { swap: false }); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete ${d.name}?`, 'The debug profile is removed. Your program is not touched.', 'Delete', () => { state.debugProfiles = debugs().filter(x => x.id !== d.id); PM51.setSel(ID + '-debug', ''); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${d.name} deleted`, 'It is no longer on your list.'); }, true) }
        ], d.name),
        body
      }
    });
  }

  /* ---------- History ---------------------------------------------------------- */
  function renderHistory() {
    const runs = t().runs;
    const items = runs.map((r, i) => ({ title: r.profile, meta: `${r.time} · ${r.duration}`, pill: PM51.pill(r.result), avatar: icon('test'), action: 'pm51-testing-open-run', data: { index: i } }));
    return [
      PM51.section({
        title: 'Recent runs', help: 'Open a run to see what happened.',
        body: items.length ? PM51.list(items) : PM51.empty('No runs yet', 'Runs appear here after tests have run.')
      }),
      /* Wave S: the canonical evidence rows (planning.verification.evidence-*, branching.worktrees.evidence-*)
         render inline on this tab, so the kit keeps no duplicate keep-days / screenshots / logs rows. */
      PM51.advanced([
        PM51.section({ title: 'Policy', body: PM51.kv([['Secrets', 'Hidden before anything is saved'], ['Passing runs', 'Summary only'], ['Failing runs', 'Full output with secrets hidden'], ['Video', 'Only when a workflow needs motion review']]) }),
        actionRow(PM51.btn({ label: 'Export evidence', small: true, icon: 'download', action: 'pm51-testing-export' }), PM51.btn({ label: 'Clear history', small: true, icon: 'trash', action: 'pm51-testing-clear-history', disabled: !runs.length, reason: 'There are no runs to clear.' }))
      ].join(''))
    ].join('');
  }

  function render() {
    const tab = PM51.tab(ID, 'profiles');
    const body = tab === 'when' ? renderWhen() : tab === 'browser-native' ? renderBrowserNative() : tab === 'debug' ? renderDebug() : tab === 'history' ? renderHistory() : renderProfiles();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset testing defaults', action: 'pm51-testing-reset' }, { label: 'How testing works', action: 'pm51-testing-help' }] });
  }
  PM51.manager('testing', { render });

  /* ---------- profile behaviour ------------------------------------------------ */
  function editProfile(id) {
    const p = profileById(id); if (!p) return;
    PM51.panel({
      title: `Edit ${p.name}`, subtitle: 'Changes apply to the next run.',
      body: PM51.panelSection('Name and purpose', PM51.field('Name', PM51.input(p.name, { data: { field: 'name' } })) + PM51.field('What it checks', PM51.input(p.description || '', { data: { field: 'description' } })))
        + PM51.panelSection('When it runs', PM51.field('Moment', PM51.select(p.trigger, withChoice(TRIGGERS, p.trigger), { data: { field: 'trigger' }, label: 'Moment' })))
        + PM51.panelSection('Stages', PM51.field('Stages, one per line', `<textarea class="text-control" data-field="stages" rows="5">${h((p.stages || []).join('\n'))}</textarea>`, 'They run in this order.'))
        + PM51.panelSection('Checks', PM51.field('Browser checks', PM51.input(p.browser || '', { data: { field: 'browser' }, placeholder: 'e.g. Smoke only when GUI-related' })) + PM51.field('Native checks', PM51.input(p.native || '', { data: { field: 'native' }, placeholder: 'e.g. Build check' }))),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const name = readField(wrap, 'name'); if (name) p.name = name;
        p.description = readField(wrap, 'description'); p.trigger = readField(wrap, 'trigger') || p.trigger;
        p.stages = readField(wrap, 'stages').split('\n').map(x => x.trim()).filter(Boolean);
        p.browser = readField(wrap, 'browser'); p.native = readField(wrap, 'native');
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${p.name} was updated.`);
      }
    });
  }
  function duplicateProfile(id) {
    const p = profileById(id); if (!p) return;
    const copy = clone(p); copy.id = uniqueId(profiles(), p.id + '-copy'); copy.name = p.name + ' copy'; copy.status = 'ready';
    profiles().push(copy); PM51.setSel(ID + '-profiles', copy.id); saveState(); PM51.refresh(ID, { swap: false });
  }
  function deleteProfile(id) {
    const p = profileById(id); if (!p || isDefault(p)) return;
    PM51.confirm(`Delete ${p.name}?`, 'Moments that used this profile switch to None.', 'Delete', () => {
      state.testProfiles = profiles().filter(x => x.id !== id);
      const tr = t().triggers; ['afterEdits', 'beforeCompletion', 'manual'].forEach(k => { if (tr[k] === p.name) tr[k] = 'None'; });
      PM51.setSel(ID + '-profiles', ''); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${p.name} deleted`, 'It is no longer on your list.');
    }, true);
  }
  PM51.on('testing-pick', el => { PM51.setSel(ID + '-' + ds(el, 'kind'), ds(el, 'id')); state.resourceRosterOpen = false; PM51.refresh(ID, { swap: false }); });
  PM51.on('testing-run', el => {
    const p = profileById(ds(el, 'id')); if (!p) return;
    PM51.check({
      title: `Run ${p.name}`, subtitle: 'Example data only. Nothing ran in this preview.', outcome: 'Example run', tone: 'info',
      steps: (p.stages || []).map(s => ({ title: s, desc: 'Would run in this order', status: 'Example', tone: 'info' }))
    });
  });
  PM51.on('testing-add-profile', () => openDialog({
    title: 'New test profile', subtitle: 'A profile is a set of checks that run together.',
    body: formField('Name', 'name', '', { autofocus: true, placeholder: 'e.g. Nightly full run' }) + formField('When it runs', 'trigger', 'Manual or release Goal', { type: 'select', choices: TRIGGERS }) + formField('What it checks', 'description', '', { placeholder: 'A sentence about what this profile is for', full: true }),
    saveLabel: 'Create profile',
    onSave: form => {
      const name = String(form.name || '').trim(); if (!name) { PM51.toast('Name needed', 'Give the profile a name first.', 'info'); return false; }
      const id = uniqueId(profiles(), slug(name));
      profiles().push({ id, name, description: String(form.description || '').trim(), trigger: form.trigger, stages: ['Compile and type check', 'Targeted unit tests'], browser: 'Smoke only when GUI-related', native: 'Build check', evidence: 'Failures and summary', status: 'ready' });
      PM51.setSel(ID + '-profiles', id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Profile created', `${name} is on your list. Edit it to change the stages.`);
    }
  }));
  PM51.onChange('testing-profile-field', el => { const p = profileById(ds(el, 'id')); const field = ds(el, 'field'); if (!p || !['timeout', 'retries'].includes(field)) return; p[field] = field === 'retries' ? Number(el.value) : el.value; saveState(); });

  /* ---------- when / browser / native --------------------------------------- */
  PM51.onChange('testing-trigger', el => { const key = ds(el, 'key'); const tr = t().triggers; if (!(key in tr)) return; tr[key] = key === 'retry' ? Number(el.value) : el.value; saveState(); if (key !== 'retry' && key !== 'then') PM51.refresh(ID, { swap: false }); });
  PM51.on('testing-browser', el => { const key = ds(el, 'key'); const b = t().browser; if (!(key in BROWSER_DEFAULTS)) return; b[key] = !b[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onChange('testing-browser-select', el => { const key = ds(el, 'key'); if (key !== 'screenshots') return; t().browser.screenshots = el.value; saveState(); });
  PM51.on('testing-native', el => { const key = ds(el, 'key'); const n = t().native; if (!(key in NATIVE_DEFAULTS)) return; n[key] = !n[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('testing-check-tools', () => PM51.check({ title: 'Check test tools', steps: [
    { title: 'Test runner found', desc: 'The runner for each language in this project' },
    { title: 'Build tools found', desc: 'Compilers and package managers on this computer', status: 'Example', tone: 'info' },
    { title: 'Built-in browser ready', desc: 'Managed in Browser & SCM', status: 'Example', tone: 'info' }
  ] }));

  /* ---------- debug behaviour --------------------------------------------------- */
  function editDebug(id) {
    const d = debugById(id); if (!d) return;
    PM51.panel({
      title: `Edit ${d.name}`, subtitle: 'Changes apply the next time you start debugging.',
      body: PM51.panelSection('Name', PM51.field('Name', PM51.input(d.name, { data: { field: 'name' } })))
        + PM51.panelSection('What to run', PM51.field('Debugger', PM51.select(d.adapter, withChoice(ADAPTERS, d.adapter), { data: { field: 'adapter' }, label: 'Debugger' })) + PM51.field('Program', PM51.input(d.program || '', { data: { field: 'program' } }), 'What gets started.') + PM51.field('Arguments', PM51.input(d.args || '', { data: { field: 'args' }, placeholder: 'Optional' })))
        + PM51.panelSection('Where', PM51.field('Environment', PM51.input(d.env || '', { data: { field: 'env' } })) + PM51.field('Working folder', PM51.input(folderLabel(d.cwd), { data: { field: 'cwd' } }), 'Project folder means the top folder of this workspace.')),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const name = readField(wrap, 'name'); if (name) d.name = name;
        d.adapter = readField(wrap, 'adapter') || d.adapter; d.program = readField(wrap, 'program'); d.args = readField(wrap, 'args'); d.env = readField(wrap, 'env');
        const cwd = readField(wrap, 'cwd'); d.cwd = !cwd || cwd === 'Project folder' ? '${projectRoot}' : cwd;
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${d.name} was updated.`);
      }
    });
  }
  PM51.on('testing-start-debug', el => {
    const d = debugById(ds(el, 'id')); if (!d) return;
    PM51.check({
      title: `Start debugging · ${d.name}`, subtitle: 'Example data only. Nothing started in this preview.', outcome: 'Preview only', tone: 'info',
      steps: [
        { title: 'Build', desc: d.program || 'Program not set', status: 'Example', tone: 'info' },
        { title: 'Launch with the debugger', desc: d.adapter || 'Debugger not set', status: 'Example', tone: 'info' },
        { title: 'Stop at your breakpoints', desc: `In ${folderLabel(d.cwd).toLowerCase()} · ${d.env || 'project environment'}`, status: 'Example', tone: 'info' }
      ]
    });
  });
  PM51.on('testing-check-launch', el => {
    const d = debugById(ds(el, 'id')); if (!d) return;
    PM51.check({ title: `Check launch · ${d.name}`, steps: [
      { title: 'Debugger found', desc: d.adapter || 'Not set' },
      { title: 'Program exists', desc: d.program || 'Not set', status: 'Example', tone: 'info' },
      { title: 'Working folder exists', desc: folderLabel(d.cwd), status: 'Example', tone: 'info' }
    ] });
  });
  PM51.on('testing-add-debug', () => openDialog({
    title: 'New debug profile', subtitle: 'Say what to start and which debugger to use.',
    body: formField('Name', 'name', '', { autofocus: true, placeholder: 'e.g. Background service' }) + formField('Debugger', 'adapter', ADAPTERS[0], { type: 'select', choices: ADAPTERS }) + formField('Program', 'program', '', { placeholder: 'e.g. Current build target', full: true }),
    saveLabel: 'Create profile',
    onSave: form => {
      const name = String(form.name || '').trim(); if (!name) { PM51.toast('Name needed', 'Give the profile a name first.', 'info'); return false; }
      const id = uniqueId(debugs(), slug(name));
      debugs().push({ id, name, adapter: form.adapter, program: String(form.program || '').trim() || 'Current build target', args: '', env: 'Project environment', cwd: '${projectRoot}', status: 'ready' });
      PM51.setSel(ID + '-debug', id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Debug profile created', `${name} is ready to start.`);
    }
  }));

  /* ---------- history behaviour -------------------------------------------------- */
  PM51.on('testing-open-run', el => {
    const r = t().runs[Number(ds(el, 'index'))]; if (!r) return;
    const p = profiles().find(x => x.name === r.profile);
    const failed = /fail/i.test(r.result);
    PM51.panel({
      title: r.profile, subtitle: r.time, pill: PM51.pill(r.result),
      body: PM51.panelSection('Summary', PM51.kv([['Result', r.result], ['Took', r.duration], ['Stages', p ? `${p.stages.length}` : 'Unknown']]))
        + (p ? PM51.panelSection('Stages', PM51.steps(p.stages.map((s, i) => ({ title: s, status: failed && i === p.stages.length - 2 ? 'Failed' : 'Passed', tone: failed && i === p.stages.length - 2 ? 'blocked' : 'ready', done: !(failed && i === p.stages.length - 2) })))) : '')
        + PM51.panelSection('Evidence', PM51.kv([['Screenshots', t().evidence.screenshots ? (failed ? 'Kept for the failing stage' : 'None needed') : 'Off'], ['Logs', t().evidence.logs ? (failed ? 'Full output, secrets hidden' : 'Summary only') : 'Off']]))
        + PM51.note('Example data only. Real runs show their own stages and evidence here.', 'info')
    });
  });
  PM51.on('testing-export', () => PM51.panel({
    title: 'Export evidence', subtitle: 'A folder with the runs you choose, safe to share.',
    body: PM51.panelSection('What goes in', PM51.kv([['Runs', String(t().runs.length)], ['Includes', 'Summaries, logs with secrets hidden, screenshots'], ['Format', 'One folder per run']])) + PM51.note('Files are written only in the real app. Nothing was exported in this preview.', 'info')
  }));
  PM51.on('testing-clear-history', () => PM51.confirm('Clear run history?', 'Past runs and their evidence are removed from this list.', 'Clear', () => { t().runs = []; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('History cleared', 'The list is empty.'); }, true));

  /* ---------- shared ------------------------------------------------------------- */
  PM51.on('testing-diagnostics', () => PM51.check({ title: 'Testing diagnostics', steps: [
    { title: 'Profiles readable', desc: `${profiles().length} test profiles and ${debugs().length} debug profiles` },
    { title: 'Test runner found', desc: 'Looked up on this computer', status: 'Example', tone: 'info' },
    { title: 'Evidence folder writable', desc: 'Where screenshots and logs are kept', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('testing-reset', () => PM51.confirm('Reset testing defaults?', 'Profiles, moments, browser and native options, and evidence settings go back to their defaults.', 'Reset', () => {
    state.testProfiles = clone(DEFAULTS.testProfiles); state.debugProfiles = clone(DEFAULTS.debugProfiles); PM51.s().testing = clone(DATA.testing);
    ['profiles', 'debug'].forEach(k => PM51.setSel(ID + '-' + k, ''));
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Testing reset', 'Defaults are back.');
  }));
  PM51.on('testing-help', () => PM51.panel({
    title: 'How testing works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A test profile is a list of stages that run in order. Puppet Master picks a profile for each moment: quick checks while you work, a thorough run before a job counts as done, and a full run for releases.</p>')
      + PM51.panelSection('The tabs', PM51.kv([['Profiles', 'What each profile checks, and a Run now button.'], ['When to Test', 'Which profile runs at which moment, and what happens on failure.'], ['Browser & Native', 'Screen checks in the built-in browser, and app checks for desktop apps.'], ['Debug', 'One-click debugging for your program or a test.'], ['History', 'Past runs and the evidence kept from them.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Secrets are hidden before any log or screenshot is saved.</p>')
  }));
})();
