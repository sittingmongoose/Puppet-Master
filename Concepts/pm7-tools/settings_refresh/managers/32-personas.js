/* Personas & Crews — personas, crews, defaults. */
(function () {
  const ID = 'personas';
  const KEY = 'goals-crew-personas';
  const CREW_SEL = 'personas-crews';
  const TABS = [
    { id: 'personas', label: 'Personas' },
    { id: 'crews', label: 'Crews' },
    { id: 'defaults', label: 'Defaults' }
  ];
  let seq = 0;
  const newId = p => p + '-' + Date.now().toString(36) + '-' + (++seq);

  const ps = () => PM51.s().personas;
  const personas = () => state.personas || (state.personas = []);
  const crews = () => state.crews || (state.crews = []);
  const names = () => personas().map(p => p.name);
  const routes = () => [...new Set([...personas().map(p => p.route), ...(state.goalTemplates || []).map(t => t.route)].filter(Boolean))];
  const withCurrent = (list, v) => !v || list.includes(v) ? list : [v, ...list];
  const personaName = v => {
    const list = personas(); const key = String(v || '').toLowerCase();
    const exact = list.find(p => p.name === v); if (exact) return exact.name;
    const near = list.find(p => p.name.toLowerCase().startsWith(key)) || list.find(p => key.length >= 4 && p.name.toLowerCase().startsWith(key.slice(0, 4)));
    return near ? near.name : v;
  };
  const selectedPersona = () => personas().find(p => p.id === PM51.sel(ID)) || personas()[0];
  const selectedCrew = () => crews().find(c => c.id === PM51.sel(CREW_SEL)) || crews()[0];
  const groupPill = p => p.locked ? PM51.pill('Core · locked', 'info') : PM51.pill(p.group || 'Custom', p.group === 'Custom' ? 'ready' : 'info');
  const refresh = () => PM51.refresh(ID, { swap: false });
  const chips = list => `<span class="pm51-chips">${(list || []).map(t => PM51.chip(t)).join('')}</span>`;
  const plainHandoff = v => String(v || '').replace(/task receipts?/i, 'task summary').replace(/test receipts?/i, 'test results').replace(/receipts?/i, 'summary');

  PM51.style(`
#panel-settings .pm51-personas-text { margin: 0; width: 100%; font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-personas-prompt { margin: 0; width: 100%; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-personas-try { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#panel-settings .pm51-personas-try .text-control { flex: 1 1 240px; width: auto; max-width: 100%; }
#panel-settings .pm51-personas-try .select-control { flex: 1 1 200px; }
`);

  /* ---------- Personas ------------------------------------------------- */
  function personasTab() {
    const p = selectedPersona();
    if (!p) return PM51.empty('No personas yet', 'A persona gives the assistant a role, a tone, and a set of tools.', { label: 'New persona', icon: 'plus', action: 'pm51-personas-new' });
    const others = personas().filter(o => o.id !== p.id);
    const body = PM51.rows([
      { label: 'What it is for', cls: 'is-wrap', control: `<p class="pm51-personas-text">${h(p.description || '')}</p>` },
      { label: 'Tone', value: p.tone },
      { label: 'Model route', help: 'Which AI service it prefers.', value: p.route },
      { label: 'Tools', help: 'What it may use while working.', control: chips(p.tools) },
      { label: 'Instructions', help: 'The standing instructions it works from.', cls: 'is-wrap', control: `<p class="pm51-personas-prompt">${h(p.prompt || '')}</p>` }
    ]) + PM51.advanced([
      PM51.section({ title: 'Try this persona', help: 'See how it would approach a question. This preview cannot run a model.', body: `<div class="pm51-personas-try">${PM51.input('', { action: 'pm51-noop', placeholder: 'Ask something this persona would handle', label: 'Question', cls: 'pm51-personas-question' })}${PM51.btn({ label: 'Try', icon: 'play', action: 'pm51-personas-try', data: { id: p.id } })}</div>` }),
      others.length ? PM51.section({ title: 'Compare with', body: `<div class="pm51-personas-try">${PM51.select(others[0].id, others.map(o => [o.id, o.name]), { action: 'pm51-noop', label: 'Compare with', cls: 'pm51-personas-compare-pick' })}${PM51.btn({ label: 'Compare', icon: 'eye', action: 'pm51-personas-compare', data: { id: p.id } })}</div>` }) : '',
      PM51.section({ title: 'Validate all personas', help: 'Checks routes, tools, crew membership, and instructions for every persona.', action: { label: 'Validate all', small: true, icon: 'test', action: 'pm51-personas-validate' } }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Persona id', p.id], ['Group', p.group], ['Locked', p.locked ? 'Yes · built in' : 'No'], ['Crews', (p.crews || []).join(' · ') || 'None']]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-personas-diagnostics' }) + '</div>' })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Personas', count: personas().length,
      add: { action: 'pm51-personas-add', label: 'New persona or import' },
      filter: { placeholder: 'Filter personas', value: (PM51.s().filters || {})[ID] || '' },
      items: personas().map(x => ({ id: x.id, title: x.name, meta: `${x.locked ? 'Core' : x.group} · ${x.route}`, selected: x.id === p.id })),
      detail: {
        title: p.name, pill: groupPill(p), subtitle: (p.crews || []).length ? `In ${p.crews.join(', ')}` : 'Not in a crew',
        primary: p.locked ? { label: 'Duplicate', icon: 'copy', action: 'pm51-personas-duplicate', data: { id: p.id } } : { label: 'Edit', icon: 'edit', action: 'pm51-personas-edit', data: { id: p.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Duplicate', icon: 'copy', onClick: () => duplicate(p) },
          { label: 'Add to crew', icon: 'users', onClick: () => addToCrew(p) },
          { label: 'Export', icon: 'download', onClick: () => exportPersona(p) },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, ariaDisabled: p.locked || p.group === 'Bundled', meta: p.locked ? 'Built in' : p.group === 'Bundled' ? 'Bundled' : '', onClick: () => remove(p) }
        ], p.name),
        body
      }
    });
  }
  function editPersona(p) {
    const isNew = !p;
    const v = p || { name: '', description: '', tone: '', route: routes()[0] || '', tools: [], prompt: '' };
    openDialog({
      title: isNew ? 'New persona' : 'Edit persona', subtitle: isNew ? 'A role the assistant can play.' : v.name, wide: true,
      body: formField('Name', 'name', v.name, { autofocus: true, placeholder: 'For example: Release Manager' })
        + formField('Model route', 'route', v.route, { type: 'select', choices: withCurrent(routes(), v.route) })
        + formField('What it is for', 'description', v.description, { full: true })
        + formField('Tone', 'tone', v.tone, { placeholder: 'For example: calm, precise' })
        + formField('Tools', 'tools', (v.tools || []).join(', '), { help: 'Separated by commas.' })
        + formField('Instructions', 'prompt', v.prompt, { type: 'textarea', full: true, help: 'Standing instructions it works from.' }),
      saveLabel: isNew ? 'Create persona' : 'Save changes',
      onSave: data => {
        const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the persona a name', 'A short name helps you pick it later.', 'warning'); return false; }
        const tools = String(data.tools || '').split(',').map(s => s.trim()).filter(Boolean);
        if (isNew) { const rec = { id: newId('persona'), name, group: 'Custom', locked: false, description: String(data.description || ''), tone: String(data.tone || ''), route: data.route, tools, prompt: String(data.prompt || ''), crews: [] }; personas().push(rec); PM51.setSel(ID, rec.id); }
        else Object.assign(p, { name, description: String(data.description || ''), tone: String(data.tone || ''), route: data.route, tools, prompt: String(data.prompt || '') });
        saveState(); refresh(); PM51.toast(isNew ? 'Persona created' : 'Persona saved', name);
      }
    });
  }
  function duplicate(p) {
    const copy = clone(p); copy.id = newId('persona'); copy.name = p.name + ' copy'; copy.group = 'Custom'; copy.locked = false; copy.crews = [];
    personas().push(copy); PM51.setSel(ID, copy.id); saveState(); refresh(); PM51.toast('Persona duplicated', `${copy.name} is yours to edit.`);
  }
  function addToCrew(p) {
    const options = crews().filter(c => !(c.members || []).includes(p.name));
    if (!options.length) { PM51.toast('Already in every crew', `${p.name} is a member of every crew.`, 'info'); return; }
    PM51.panel({
      title: 'Add to crew', subtitle: p.name,
      body: PM51.panelSection('Crew', PM51.field('Add to', PM51.select(options[0].id, options.map(c => [c.id, `${c.name} · ${(c.members || []).length} members`]), { label: 'Crew' }))),
      primaryLabel: 'Add', onPrimary: wrap => { const sel = wrap.querySelector('select'); const c = crews().find(x => x.id === (sel || {}).value); if (!c) return; c.members = [...(c.members || []), p.name]; p.crews = [...new Set([...(p.crews || []), c.name])]; saveState(); refresh(); PM51.toast('Added to crew', `${p.name} joined ${c.name}.`); }
    });
  }
  function exportPersona(p) {
    PM51.panel({ title: 'Export persona', subtitle: p.name, body: PM51.panelSection('What is included', PM51.kv([['Name', p.name], ['Route', p.route], ['Tools', (p.tools || []).join(' · ') || 'None'], ['Instructions', `${(p.prompt || '').length} characters`], ['Format', 'JSON · no secrets']])) + PM51.note('Saving a file needs the desktop app. Nothing is written in this preview.'), primaryLabel: 'Save file', onPrimary: () => PM51.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info') });
  }
  function remove(p) {
    PM51.confirm(`Delete “${p.name}”?`, 'It is removed from every crew. Goals already using it keep their copy.', 'Delete', () => {
      const i = personas().indexOf(p); if (i >= 0) personas().splice(i, 1);
      for (const c of crews()) { c.members = (c.members || []).filter(m => m !== p.name); if (c.lead === p.name) c.lead = c.members[0] || ''; }
      PM51.setSel(ID, (personas()[0] || {}).id); saveState(); refresh(); PM51.toast('Persona deleted', p.name, 'warning');
    }, true);
  }
  function validation() {
    const list = personas(); const all = new Set(names()); const problems = [];
    const steps = [
      { title: 'Model routes', desc: list.every(p => p.route) ? 'Every persona names a route' : 'Some personas have no route', tone: list.every(p => p.route) ? 'ready' : 'attention', status: list.every(p => p.route) ? 'Passed' : 'Needs attention' },
      { title: 'Tools', desc: list.every(p => (p.tools || []).length) ? 'Every persona lists at least one tool' : 'Some personas list no tools', tone: list.every(p => (p.tools || []).length) ? 'ready' : 'attention', status: list.every(p => (p.tools || []).length) ? 'Passed' : 'Needs attention' }
    ];
    for (const c of crews()) for (const m of c.members || []) if (!all.has(m)) problems.push(`${m} (in ${c.name})`);
    steps.push({ title: 'Crew membership', desc: problems.length ? `Missing: ${problems.join(', ')}` : 'Every crew member exists', tone: problems.length ? 'attention' : 'ready', status: problems.length ? 'Needs attention' : 'Passed' });
    const placeholders = list.filter(p => /\{\{|\$\{/.test(p.prompt || ''));
    steps.push({ title: 'Instructions', desc: placeholders.length ? `Unfilled placeholders in ${placeholders.map(p => p.name).join(', ')}` : 'No unfilled placeholders or secrets', tone: placeholders.length ? 'attention' : 'ready', status: placeholders.length ? 'Needs attention' : 'Passed' });
    return steps;
  }

  /* ---------- Crews ---------------------------------------------------- */
  function crewsTab() {
    const c = selectedCrew();
    if (!c) return PM51.empty('No crews yet', 'A crew is a team of personas that work together.', { label: 'New crew', icon: 'plus', action: 'pm51-personas-crew-new' });
    const body = PM51.rows([
      { label: 'Lead', help: 'Coordinates the others and reports back.', value: c.lead },
      { label: 'Members', control: chips(c.members) },
      { label: 'Model route', value: c.route },
      { label: 'How work is handed off', help: 'What each member passes to the next.', value: plainHandoff(c.handoff) },
      { label: 'Work at the same time', help: 'How many members may be busy at once.', value: `Up to ${c.concurrency}` }
    ]) + PM51.advanced([
      PM51.section({ title: 'Handoff details', body: PM51.kv([['Task summary', 'What was asked, what was done, what was checked, and what is left'], ['Context passed on', 'Only what the next member needs'], ['Disagreements', 'The lead decides and records why'], ['Failed handoff', 'Returns to the lead instead of stalling']]) })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Crews', count: crews().length, selectAction: 'pm51-personas-select-crew',
      add: { action: 'pm51-personas-crew-new', label: 'New crew' },
      items: crews().map(x => ({ id: x.id, title: x.name, meta: `${(x.members || []).length} members`, avatar: icon('users'), selected: x.id === c.id })),
      detail: {
        title: c.name, subtitle: `${(c.members || []).length} members · led by ${c.lead} · ${c.route}`,
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-personas-crew-edit', data: { id: c.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Add member', icon: 'plus', onClick: () => addMember(c) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(c); copy.id = newId('crew'); copy.name = c.name + ' copy'; crews().push(copy); PM51.setSel(CREW_SEL, copy.id); saveState(); refresh(); PM51.toast('Crew duplicated', copy.name); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${c.name}”?`, 'The personas in it are kept.', 'Delete', () => { const i = crews().indexOf(c); if (i >= 0) crews().splice(i, 1); for (const p of personas()) p.crews = (p.crews || []).filter(n => n !== c.name); PM51.setSel(CREW_SEL, (crews()[0] || {}).id); saveState(); refresh(); PM51.toast('Crew deleted', c.name, 'warning'); }, true) }
        ], c.name),
        body
      }
    });
  }
  function editCrew(c) {
    const isNew = !c;
    const v = c || { name: '', lead: names()[0] || '', members: [], route: 'Per persona', handoff: 'Structured task summary', concurrency: 3 };
    openDialog({
      title: isNew ? 'New crew' : 'Edit crew', subtitle: isNew ? 'A team of personas that work together.' : v.name,
      body: formField('Name', 'name', v.name, { full: true, autofocus: true, placeholder: 'For example: Docs Crew' })
        + formField('Lead', 'lead', v.lead, { type: 'select', choices: withCurrent(names(), v.lead) })
        + formField('Work at the same time', 'concurrency', String(v.concurrency), { type: 'select', choices: ['1', '2', '3', '4', '6'] })
        + formField('Members', 'members', (v.members || []).join(', '), { full: true, help: 'Persona names, separated by commas. The lead is added automatically.' })
        + formField('Model route', 'route', v.route, { type: 'select', choices: withCurrent(['Per persona', ...routes()], v.route) })
        + formField('How work is handed off', 'handoff', v.handoff, { placeholder: 'For example: Structured task receipt' }),
      saveLabel: isNew ? 'Create crew' : 'Save changes',
      onSave: data => {
        const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the crew a name', 'A short name helps you pick it later.', 'warning'); return false; }
        const members = [...new Set([data.lead, ...String(data.members || '').split(',').map(s => s.trim()).filter(Boolean)])];
        const rec = isNew ? { id: newId('crew') } : c;
        Object.assign(rec, { name, lead: data.lead, members, route: data.route, handoff: String(data.handoff || '') || 'Structured task summary', concurrency: Number(data.concurrency) || 3 });
        if (isNew) { crews().push(rec); PM51.setSel(CREW_SEL, rec.id); }
        for (const p of personas()) { const inCrew = members.includes(p.name); p.crews = (p.crews || []).filter(n => n !== rec.name && n !== (c || {}).name); if (inCrew) p.crews.push(rec.name); }
        saveState(); refresh(); PM51.toast(isNew ? 'Crew created' : 'Crew saved', name);
      }
    });
  }
  function addMember(c) {
    const options = personas().filter(p => !(c.members || []).includes(p.name));
    if (!options.length) { PM51.toast('Everyone is already in', `${c.name} already includes every persona.`, 'info'); return; }
    PM51.panel({
      title: 'Add member', subtitle: c.name,
      body: PM51.panelSection('Persona', PM51.field('Add', PM51.select(options[0].id, options.map(p => [p.id, `${p.name} · ${p.route}`]), { label: 'Persona' }))),
      primaryLabel: 'Add', onPrimary: wrap => { const sel = wrap.querySelector('select'); const p = personas().find(x => x.id === (sel || {}).value); if (!p) return; c.members = [...(c.members || []), p.name]; p.crews = [...new Set([...(p.crews || []), c.name])]; saveState(); refresh(); PM51.toast('Member added', `${p.name} joined ${c.name}.`); }
    });
  }

  /* ---------- Defaults ------------------------------------------------- */
  function defaultsTab() {
    const s = ps(); const d = s.defaults;
    const row = (key, label, help) => ({ label, help, control: PM51.select(personaName(d[key]), withCurrent(names(), personaName(d[key])), { action: 'pm51-personas-default', data: { key }, label: `Default persona for ${label.toLowerCase()}` }) });
    return [
      PM51.section({
        title: 'Default persona for', help: 'Which persona answers first. Threads, templates, and crews can override this.',
        body: PM51.rows([row('chat', 'Chat', 'Ordinary conversation.'), row('goals', 'Goals', 'Jobs the assistant runs on its own.'), row('planning', 'Planning', 'Turning ideas into plans.'), row('audits', 'Audits', 'Checking finished work.')])
      }),
      PM51.section({
        title: 'Inheritance',
        body: PM51.rows([
          { label: 'Personas follow the provider default model', help: 'When on, a persona uses whatever model its route currently points at.', control: PM51.toggle(!!s.followProvider, { action: 'pm51-personas-inherit', data: { key: 'followProvider' }, label: 'Personas follow the provider default model' }) },
          { label: 'Personas inherit tools', help: 'When on, a persona can use any tool your permissions allow, not only the ones it lists.', control: PM51.toggle(!!s.inheritTools, { action: 'pm51-personas-inherit', data: { key: 'inheritTools' }, label: 'Personas inherit tools' }) }
        ])
      })
    ].join('');
  }

  function render() {
    const tab = PM51.tab(ID, 'personas');
    const body = tab === 'crews' ? crewsTab() : tab === 'defaults' ? defaultsTab() : personasTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset persona defaults', action: 'pm51-personas-reset' }, { label: 'How personas work', action: 'pm51-personas-help' }] });
  }
  PM51.manager('personas', { render });

  /* ---------- actions -------------------------------------------------- */
  PM51.on('personas-add', el => PM51.menu(el, [
    { label: 'New persona', icon: 'plus', onClick: () => editPersona(null) },
    { label: 'Import', icon: 'upload', meta: 'From a file', onClick: () => PM51.panel({ title: 'Import persona', subtitle: 'Bring in a persona exported from another workspace.', body: PM51.panelSection('File', PM51.field('Persona file', '<input class="text-control" type="file" aria-label="Persona file"/>', 'A .json file exported from Puppet Master.')) + PM51.note('Reading files needs the desktop app. Nothing is imported in this preview.'), primaryLabel: 'Import', onPrimary: () => PM51.toast('Nothing imported', 'Example data only. Importing needs the desktop app.', 'info') }) }
  ], 'Add'));
  PM51.on('personas-new', () => editPersona(null));
  PM51.on('personas-edit', el => { const p = personas().find(x => x.id === ds(el, 'id')); if (p) editPersona(p); });
  PM51.on('personas-duplicate', el => { const p = personas().find(x => x.id === ds(el, 'id')); if (p) duplicate(p); });
  PM51.on('personas-try', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p) return;
    const q = ((el.closest('.pm51-personas-try') || {}).querySelector ? el.closest('.pm51-personas-try').querySelector('input') : null);
    const question = q && q.value.trim();
    if (!question) { PM51.toast('Type a question first', `Then see how ${p.name} would approach it.`, 'info'); return; }
    PM51.panel({
      title: `Try ${p.name}`, subtitle: 'This preview cannot run a model. Here is what would shape the reply.',
      body: PM51.panelSection('Your question', `<div class="pm51-example">${h(question)}</div>`)
        + PM51.panelSection('How it would approach it', PM51.kv([['Tone', p.tone], ['Model route', p.route], ['Tools it may use', (p.tools || []).join(' · ') || 'None'], ['Standing instructions', p.prompt]]))
        + PM51.note('In the app, the reply appears here without starting a real task.')
    });
  });
  PM51.on('personas-compare', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p) return;
    const pick = el.closest('.pm51-personas-try')?.querySelector('select');
    const o = personas().find(x => x.id === (pick || {}).value); if (!o) return;
    const pair = (label, av, bv) => PM51.kv([[p.name, av || '—'], [o.name, bv || '—']]);
    PM51.panel({
      title: `${p.name} and ${o.name}`, subtitle: 'Side by side.',
      body: PM51.panelSection('What each is for', pair('for', p.description, o.description)) + PM51.panelSection('Tone', pair('tone', p.tone, o.tone)) + PM51.panelSection('Model route', pair('route', p.route, o.route)) + PM51.panelSection('Tools', pair('tools', (p.tools || []).join(' · '), (o.tools || []).join(' · ')))
    });
  });
  PM51.on('personas-validate', () => { const steps = validation(); const bad = steps.filter(s => s.tone !== 'ready').length; PM51.check({ title: 'Validate all personas', subtitle: `${personas().length} personas and ${crews().length} crews checked against each other.`, steps, outcome: bad ? `${bad} to look at` : 'All good', tone: bad ? 'attention' : 'ready' }); });
  PM51.on('personas-diagnostics', () => PM51.check({ title: 'Persona diagnostics', steps: [
    { title: 'Persona library readable', desc: `${personas().length} personas · ${personas().filter(p => p.locked).length} built in` },
    { title: 'Crews consistent', desc: 'Every member exists in the library' },
    { title: 'Routes resolve', desc: 'Checked through Providers & Accounts', status: 'Example', tone: 'info' }
  ] }));

  PM51.on('personas-select-crew', el => { PM51.setSel(CREW_SEL, ds(el, 'id')); state.resourceRosterOpen = false; refresh(); });
  PM51.on('personas-crew-new', () => editCrew(null));
  PM51.on('personas-crew-edit', el => { const c = crews().find(x => x.id === ds(el, 'id')); if (c) editCrew(c); });

  PM51.onChange('personas-default', el => { ps().defaults[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('personas-inherit', el => { const s = ps(); const k = ds(el, 'key'); s[k] = !s[k]; saveState(); refresh(); });

  PM51.on('personas-reset', () => PM51.confirm('Reset persona defaults?', 'Default personas and inheritance go back to their original values. Your personas and crews are kept.', 'Reset', () => {
    PM51.s().personas = clone(DATA.personas); saveState(); refresh(); PM51.toast('Persona defaults reset', 'Defaults are back.');
  }));
  PM51.on('personas-help', () => PM51.panel({
    title: 'How personas work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A persona is a role the assistant plays: a purpose, a tone, a preferred model route, and the tools it may use. Crews are teams of personas with a lead.</p>')
      + PM51.panelSection('Built in, bundled, custom', PM51.kv([['Core', 'Always available and locked. Duplicate one to make your own version.'], ['Bundled', 'Specialists that ship with Puppet Master. Editable.'], ['Custom', 'Yours. Edit, export, or delete them freely.']]))
      + PM51.panelSection('Defaults', '<p class="pm51-ps-text">Chat, Goals, planning, and audits each start with a default persona. Templates and crews can pick a different one.</p>')
  }));
})();
