/* Personas & Crews — personas, crews, group work, helpers, defaults (settings audit, 2026-09-27).
   - A persona's own settings (how it answers, its model and cost, its tools and instructions) are edited inside
     that persona: they were drawn once under the list, where changing "Creativity" changed every persona at once.
     Core personas are locked and read; duplicate one to change it.
   - The library follows Plans/Personas.md §6 (kit.d/70-personas.js): nine protected core personas, then the
     bundled specialists, then your own. Bundled ones can be hidden from pickers.
   - New personas and crews are made in the guided window. Crew members and the lead are picked, never typed.
   - Crews, Group work (BrainStorm, Review, Chat Room) and Helpers are separate tabs; Review came from Goals.
   - Defaults: the chat default is the inventory row (real personas to pick); the Goals default lives in Goals;
     planning helpers and reviewers are shown with a way to change them where they live; the own "inheritance"
     switches repeated the per-persona model and permission rows and are gone. */
(function () {
  const ID = 'personas';
  const KEY = 'goals-crew-personas';
  const CREW_SEL = 'personas-crews';
  const TABS = [
    { id: 'personas', label: 'Personas' },
    { id: 'crews', label: 'Crews' },
    { id: 'workflows', label: 'Group work' },
    { id: 'helpers', label: 'Helpers' },
    { id: 'defaults', label: 'Defaults' }
  ];
  const L = 'personas.library.', U = 'personas.tuning.', T = 'personas.tools.';
  const S = {
    name: L + 'persona-name', desc: L + 'persona-description', pid: L + 'persona-id', aliases: L + 'persona-aliases', tags: L + 'persona-tags',
    manager: L + 'persona-manager', core: L + 'core-personas', hidden: L + 'disabled-bundled', chatDefault: L + 'default-persona', active: L + 'active-persona', lock: L + 'lock-persona', ask: L + 'ask-by-name',
    style: U + 'response-style', format: U + 'output-format', mode: U + 'default-mode', verbosity: U + 'verbosity', talk: U + 'talkativeness',
    platform: U + 'default-platform', model: U + 'default-model', variant: U + 'default-variant', effort: U + 'reasoning-effort', budget: U + 'cost-budget', temp: U + 'temperature', topp: U + 'top-p',
    prompt: T + 'system-prompt', perms: T + 'permission-profile', posture: T + 'tool-posture', prefer: T + 'preferred-tools', avoid: T + 'discouraged-tools', guidance: T + 'tool-guidance', skills: T + 'default-skills', plugins: T + 'disabled-plugins',
    crews: 'branching.crew.crew-enabled', crewSize: 'branching.crew.crew-participant-count', crewMembers: 'branching.crew.crew-members', crewLead: 'branching.crew.crew-coordinator', crewAtOnce: 'branching.crew.crew-parallelism',
    reviewRoster: 'planning.verification.review-roster', planner: 'planning.interview.builder-persona-mode'
  };
  const GROUPS = [
    { title: 'How it answers', help: 'Style and length of its replies.', ids: [S.style, S.format, S.mode], more: [S.verbosity, S.talk] },
    { title: 'Model and cost', help: 'Which AI it prefers and how much it may spend.', ids: [S.platform, S.model, S.variant, S.effort, S.budget], more: [S.temp, S.topp] },
    { title: 'Tools and instructions', help: 'What it works from and which tools it reaches for.', ids: [S.perms, S.posture, S.prefer, S.avoid, S.skills, S.plugins], more: [S.guidance] }
  ];
  const SCOPED = [S.name, S.desc, S.pid, S.aliases, S.tags, S.prompt].concat(...GROUPS.map(g => g.ids.concat(g.more)));
  const TOOLS = ['Files', 'Terminal', 'Browser', 'Web search', 'Testing', 'Source control', 'Documents', 'Images', 'Profiler', 'Repository read', 'Planning tools'];
  const HANDOFFS = [['Structured task summary', 'Task summary', 'What was asked, done, checked and left'], ['Test results', 'Test results', 'Results of the checks run'], ['Screens and findings', 'Screens and findings', 'Screenshots with notes'], ['Full notes', 'Full notes', 'Everything the member wrote down']];
  const RESERVED = new Set(O55_CORE_PERSONAS.map(p => p.id));
  const PAIRS = [['branching.crew.brainstorm-roster', 'branching.crew.brainstorm-core-participants'], ['branching.crew.chat-room-roster', 'branching.crew.chat-room-participant-count'], [S.crewMembers, S.crewSize]];
  let seq = 0;
  const newId = p => p + '-' + Date.now().toString(36) + '-' + (++seq);
  const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'persona';

  const ps = () => { const s = PM51.s().personas; if (!s.show) s.show = 'all'; delete s.followProvider; delete s.inheritTools; return s; };
  const personas = () => state.personas || (state.personas = []);
  const crews = () => state.crews || (state.crews = []);
  const names = () => personas().map(p => p.name);
  const routes = () => [...new Set([...personas().map(p => p.route), ...(state.goalTemplates || []).map(t => t.route)].filter(Boolean))];
  const withCurrent = (list, v) => !v || list.includes(v) ? list : [v, ...list];
  const hiddenIds = () => { const v = PM51.value(S.hidden); return Array.isArray(v) ? v.map(String) : []; };
  const isHidden = p => p.group === 'Bundled' && hiddenIds().includes(p.id);
  const kindOf = p => p.locked ? 'core' : p.group === 'Bundled' ? 'bundled' : 'custom';
  const SHOW = { all: 'All personas', core: 'Core', bundled: 'Bundled', custom: 'Yours', hidden: 'Hidden' };
  const shown = () => { const v = ps().show; return personas().filter(p => v === 'all' ? !isHidden(p) : v === 'hidden' ? isHidden(p) : kindOf(p) === v); };
  const selectedPersona = () => shown().find(p => p.id === PM51.sel(ID)) || shown()[0];
  const selectedCrew = () => crews().find(c => c.id === PM51.sel(CREW_SEL)) || crews()[0];
  const refresh = () => PM51.refresh(ID, { swap: false });
  const chips = list => `<span class="pm51-chips">${(list || []).map(t => PM51.chip(t)).join('')}</span>`;
  const handoffLabel = v => (HANDOFFS.find(x => x[0] === v || x[1] === v) || [v, String(v || '').replace(/receipts?/i, 'summary')])[1];
  const on = v => v === true || v === 'on' || v === 'true';
  /* a persona's value: the record's own fields for name, what it's for and instructions, else its props */
  const MIRROR = { [S.name]: 'name', [S.desc]: 'description', [S.prompt]: 'prompt' };
  const pval = (p, id) => MIRROR[id] ? (p[MIRROR[id]] || '') : id === S.pid ? p.id : id === S.prefer ? ((p.props && p.props[id]) || p.tools || []) : PM51.scopedValue(p, id);
  const renameEverywhere = (from, to) => {
    if (!from || from === to) return;
    crews().forEach(c => { c.members = (c.members || []).map(m => m === from ? to : m); if (c.lead === from) c.lead = to; });
    (state.goalTemplates || []).forEach(t => { if (t.persona === from) t.persona = to; });
    (state.activeGoals || []).forEach(g => { if (g.persona === from) g.persona = to; });
    const gd = (PM51.s().goals || {}).defaults; if (gd && gd.persona === from) gd.persona = to;
  };

  PM51.style(`
#panel-settings .pm51-personas-text { margin: 0; width: 100%; font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-personas-prompt { margin: 0; width: 100%; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); white-space: pre-wrap; }
#panel-settings .pm51-personas-try { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#panel-settings .pm51-personas-try .text-control { flex: 1 1 240px; width: auto; max-width: 100%; }
#panel-settings .pm51-personas-try .pm51-dd { flex: 1 1 200px; } #panel-settings .pm51-personas-try .pm51-dd-trigger { width: 100%; max-width: none; }
#panel-settings .o55-tab-lead { margin: 0 0 14px; font-size: 13px; line-height: 1.5; color: var(--k3-text-3); max-width: 70ch; }
#panel-settings .o55-persona-editor { width: 100%; min-height: 240px; box-sizing: border-box; padding: 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); color: var(--k3-text-1); font: 12.5px/1.6 var(--k3-mono, ui-monospace, monospace); resize: vertical; }
#panel-settings .pm51-detail-content .pm51-section + .pm51-section { margin-top: 12px; }
`);

  /* ---------- Personas ------------------------------------------------- */
  const srow = (p, id, opts) => PM51.scoped.row(id, pval(p, id), Object.assign({ scope: 'persona', data: { id: p.id }, noChanged: true }, opts || {}));
  const valueRow = (p, id, action, wrap) => { const s = PM51.setting(id); if (!s) return ''; const v = pval(p, id); const text = Array.isArray(v) ? (v.length ? v.join(', ') : 'None') : (String(v || '').trim() || 'Not set'); return PM51.home(id, PM51.rows([wrap ? { label: PM51.rowLabel(s), help: PM51.rowHelp(s), cls: 'is-wrap', control: `<p class="pm51-personas-text">${h(text)}</p>`, action } : { label: PM51.rowLabel(s), help: PM51.rowHelp(s), value: text, action }])); };
  const lockedGroup = (p, ids) => ids.reduce((html, id) => PM51.home(id, html), PM51.kv(ids.map(id => { const s = PM51.setting(id); return s ? [PM51.rowLabel(s), id === S.pid ? p.id : PM51.valueText(s, pval(p, id))] : null; })));
  function promptRow(p) {
    const text = String(p.prompt || '').trim();
    return PM51.home(S.prompt, PM51.rows([{ label: 'Instructions', help: 'The standing instructions it works from.', cls: 'is-wrap', control: `<p class="pm51-personas-prompt">${h(text || 'None yet.')}</p>` }]) + (p.locked ? '' : `<div class="pm51-mcp-actions">${PM51.btn({ label: text ? 'Edit instructions' : 'Write instructions', icon: 'edit', small: true, action: 'pm51-personas-prompt', data: { id: p.id } })}</div>`));
  }
  function personaBody(p) {
    const locked = p.locked;
    const about = locked
      ? lockedGroup(p, [S.name, S.desc, S.aliases, S.tags, S.pid])
      : valueRow(p, S.name, { label: 'Change', icon: 'edit', action: 'pm51-personas-about', data: { id: p.id } }) + valueRow(p, S.desc, { label: 'Change', icon: 'edit', action: 'pm51-personas-about', data: { id: p.id } }, true)
        + valueRow(p, S.aliases, { label: 'Change', icon: 'edit', action: 'pm51-personas-aliases', data: { id: p.id } }) + PM51.scoped.rows([srow(p, S.tags)])
        + PM51.advanced(valueRow(p, S.pid), { label: 'More options' });
    const intro = locked ? PM51.note(`${p.name} is a built-in core persona, so it is locked. Duplicate it to make a version you can change.`, 'info')
      : p.group === 'Bundled' ? PM51.note('Bundled with Puppet Master. Your changes stay in this project.', 'info') : '';
    const groups = GROUPS.map(g => PM51.section({
      title: g.title, help: g.help,
      body: locked ? lockedGroup(p, g.ids.concat(g.more)) + (g.title === 'Tools and instructions' ? promptRow(p) : '')
        : (g.title === 'Tools and instructions' ? promptRow(p) : '') + PM51.scoped.rows(g.ids.map(id => srow(p, id))) + PM51.advanced(PM51.scoped.rows(g.more.map(id => srow(p, id))), { label: 'More options' })
    })).join('');
    const others = personas().filter(o => o.id !== p.id);
    return intro + PM51.section({ title: 'About', help: 'Its name, what it is for, and other names it answers to.', body: about }) + groups
      + PM51.advanced([
        PM51.section({ title: 'Try this persona', help: 'See how it would approach a question. This preview cannot run a model.', body: `<div class="pm51-personas-try">${PM51.input('', { action: 'pm51-noop', placeholder: 'Ask something this persona would handle', label: 'Question', cls: 'pm51-personas-question' })}${PM51.btn({ label: 'Try', icon: 'play', action: 'pm51-personas-try', data: { id: p.id } })}</div>` }),
        others.length ? PM51.section({ title: 'Compare with', body: `<div class="pm51-personas-try">${PM51.select(others[0].id, others.map(o => [o.id, o.name]), { action: 'pm51-noop', label: 'Compare with', cls: 'pm51-personas-compare-pick' })}${PM51.btn({ label: 'Compare', icon: 'eye', action: 'pm51-personas-compare', data: { id: p.id } })}</div>` }) : '',
        PM51.section({ title: 'Check every persona', help: 'Routes, tools, crew membership and instructions, for all of them.', action: { label: 'Check all', small: true, icon: 'test', action: 'pm51-personas-validate' } })
      ].join(''), { label: 'Try and check' });
  }
  function personasTab() {
    const list = personas(); const view = shown(); const p = selectedPersona();
    const cores = list.filter(x => x.locked).length, hid = hiddenIds().length;
    const toolbar = PM51.home(S.hidden, `<div class="o55-toolbar o55-personas-toolbar"><span class="o55-bound-prefix">Show</span>${PM51.dropdown(ps().show, Object.entries(SHOW).map(([v, l]) => ({ value: v, label: l, meta: v === 'hidden' ? `${hid} hidden` : v === 'core' ? `${cores} locked` : '' })), { action: 'pm51-personas-show', label: 'Show', width: 170 })}<span class="o55-toolbar-spacer"></span>${PM51.home(S.core, `<span class="o55-quiet-line">${cores} core personas are built in and locked${hid ? ` · ${hid} hidden from pickers` : ''}</span>`, 'span')}</div>`);
    if (!p) return toolbar + SCOPED.reduce((html, id) => PM51.home(id, html), '') + PM51.home(S.manager, '') + PM51.empty(ps().show === 'hidden' ? 'Nothing hidden' : 'No personas here', ps().show === 'hidden' ? 'Bundled personas you hide from pickers are listed here.' : 'Make one with New persona.', { label: 'Show all personas', action: 'pm51-personas-show-all', icon: 'eye' });
    return toolbar + PM51.home(S.manager, PM51.listDetail({
      id: ID, rosterTitle: 'Personas', count: view.length,
      add: { action: 'pm51-personas-add', label: 'New persona or import' },
      filter: { placeholder: 'Filter personas', value: (PM51.s().filters || {})[ID] || '' },
      items: view.map(x => ({ id: x.id, title: x.name, meta: [x.locked ? 'Core · locked' : x.group === 'Bundled' ? 'Bundled' : 'Yours', x.chat === false ? 'helper only' : '', isHidden(x) ? 'hidden' : ''].filter(Boolean).join(' · '), avatar: icon(x.locked ? 'lock' : x.group === 'Bundled' ? 'users' : 'user'), selected: x.id === p.id })),
      detail: {
        title: p.name, subtitle: [p.locked ? 'Core persona' : p.group === 'Bundled' ? 'Bundled persona' : 'Your persona', (p.crews || []).length ? `In ${p.crews.join(', ')}` : 'Not in a crew'].join(' · '),
        primary: p.locked ? { label: 'Duplicate to edit', icon: 'copy', action: 'pm51-personas-duplicate', data: { id: p.id } } : { label: 'Try it', icon: 'play', action: 'pm51-personas-try-open', data: { id: p.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Duplicate', icon: 'copy', onClick: () => duplicate(p) },
          { label: 'Add to crew', icon: 'users', onClick: () => addToCrew(p) },
          p.group === 'Bundled' ? { label: isHidden(p) ? 'Show in pickers' : 'Hide from pickers', icon: 'eye', onClick: () => toggleHidden(p) } : null,
          { label: 'Export', icon: 'download', onClick: () => exportPersona(p) },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, ariaDisabled: p.locked || p.group === 'Bundled', meta: p.locked ? 'Built in' : p.group === 'Bundled' ? 'Bundled: hide it instead' : '', onClick: () => remove(p) }
        ].filter(Boolean), p.name),
        body: personaBody(p)
      }
    }));
  }
  function toggleHidden(p) {
    const cur = hiddenIds(); const next = cur.includes(p.id) ? cur.filter(x => x !== p.id) : [...cur, p.id];
    if (commitSettingValue(S.hidden, next)) { saveState(); o55Notify(S.hidden, next); }
    PM51.toast(next.includes(p.id) ? 'Hidden from pickers' : 'Back in pickers', next.includes(p.id) ? `${p.name} no longer shows in persona pickers. Find it under Show: Hidden.` : `${p.name} shows in persona pickers again.`);
    refresh();
  }
  function personaWizard() {
    const cards = () => [{ title: 'Blank', text: 'Start from nothing and set it up yourself.', icon: 'plus', value: '' }].concat(personas().map(x => ({ title: x.name, text: x.description, icon: x.locked ? 'lock' : 'user', value: x.id })));
    PM51.wizard({
      title: 'New persona', subtitle: 'A persona is a role the assistant plays: a purpose, a way of answering, a model and tools.', eyebrow: 'Persona', icon: 'user',
      draft: { base: null, name: '', description: '', style: 'balanced', model: 'inherit' }, finishLabel: 'Create persona',
      steps: [
        { label: 'Start', title: 'Where should it start from?', lead: 'Copy a persona that is close to what you want, or start blank.', render: d => PM51.tiles(cards().map(c => ({ title: c.title, text: c.text, icon: c.icon, selected: d.base === c.value, data: { base: c.value } })), { action: 'pm51-personas-w-base' }), check: d => d.base == null ? 'Pick where to start.' : '' },
        { label: 'Name', icon: 'edit', title: 'What is it called, and what is it for?', lead: 'The name shows in pickers. One line on its purpose helps you and automatic picking.', recap: d => d.name,
          render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-pw-name" value="${a(d.name)}" placeholder="For example: Release Manager" autocomplete="off"/>`)}${PM51.field('What it is for', `<input class="text-control o55-pw-desc" value="${a(d.description)}" placeholder="For example: Prepares releases and writes the notes." autocomplete="off"/>`)}</div>`,
          collect: (w, d) => { d.name = String(w.querySelector('.o55-pw-name').value || '').trim(); d.description = String(w.querySelector('.o55-pw-desc').value || '').trim(); },
          check: d => { if (!d.name) return 'Give it a name.'; if (RESERVED.has(slug(d.name)) || O55_CORE_PERSONAS.some(c => c.name.toLowerCase() === d.name.toLowerCase())) return `${d.name} is kept for a built-in persona. Pick another name.`; if (names().some(n => n.toLowerCase() === d.name.toLowerCase())) return `There is already a persona called ${d.name}.`; return ''; } },
        { label: 'Answers', icon: 'sliders', title: 'How should it answer?', lead: 'You can fine-tune length, format and chatter afterwards.', render: d => PM51.tiles(['concise', 'balanced', 'detailed'].map((v, i) => ({ title: PM51.valueLabel(S.style, v), text: ['Gets to the point in a few lines.', 'Enough detail to follow, no more.', 'Explains its reasoning and the options.'][i], icon: ['bolt', 'sliders', 'list'][i], selected: d.style === v, data: { style: v } })), { action: 'pm51-personas-w-style' }) },
        { label: 'Model', icon: 'brain', title: 'Which model should it prefer?', lead: 'Same as the project is usually right. Pick one when this persona needs something special.', recap: d => PM51.valueLabel(S.model, d.model),
          render: d => PM51.field('Preferred model', PM51.dropdown(d.model, [{ value: 'inherit', label: 'Same as the project' }].concat(PM51.readyModels ? PM51.readyModels() : []), { cls: 'o55-pw-model', label: 'Preferred model' }), 'Only models on your connected accounts are offered.'),
          collect: (w, d) => { const m = w.querySelector('.o55-pw-model'); if (m) d.model = m.value; } }
      ],
      onFinish: d => {
        const base = personas().find(x => x.id === d.base);
        const rec = Object.assign(base ? clone(base) : { tone: '', route: routes()[0] || 'Balanced route', tools: ['Standard tools'], prompt: '' }, { id: newId('persona'), name: d.name, description: d.description || (base ? base.description : ''), group: 'Custom', locked: false, crews: [], chat: true });
        rec.props = Object.assign({}, (base && base.props) || {}, { [S.style]: d.style, [S.model]: d.model });
        personas().push(rec); ps().show = 'all'; PM51.setSel(ID, rec.id); PM51.setTab(ID, 'personas'); saveState(); refresh();
        const where = String(PM51.value('personas.library.custom-scope') || 'project') === 'global' ? 'all your projects' : 'this project';
        PM51.toast('Persona created', `${d.name} is saved for ${where}. Fine-tune it below.`);
      }
    });
  }
  function duplicate(p) {
    const copy = clone(p); copy.id = newId('persona'); copy.name = p.name + ' copy'; copy.group = 'Custom'; copy.locked = false; copy.crews = []; copy.chat = true;
    personas().push(copy); ps().show = 'all'; PM51.setSel(ID, copy.id); saveState(); refresh(); PM51.toast('Persona duplicated', `${copy.name} is yours to change.`);
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
    PM51.panel({ title: 'Export persona', subtitle: p.name, body: PM51.panelSection('What is included', PM51.kv([['Name', p.name], ['Route', p.route], ['Tools', (pval(p, S.prefer) || []).join(' · ') || 'None'], ['Instructions', `${(p.prompt || '').length} characters`], ['Format', 'PERSONA.md · no secrets']])) + PM51.note('Saving a file needs the desktop app. Nothing is written in this preview.'), primaryLabel: 'Save file', onPrimary: () => PM51.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info') });
  }
  function remove(p) {
    PM51.confirm(`Delete “${p.name}”?`, 'It is removed from every crew. Goals already using it keep their copy.', 'Delete', () => {
      const i = personas().indexOf(p); if (i >= 0) personas().splice(i, 1);
      for (const c of crews()) { c.members = (c.members || []).filter(m => m !== p.name); if (c.lead === p.name) c.lead = c.members[0] || ''; }
      PM51.setSel(ID, (shown()[0] || {}).id); saveState(); refresh(); PM51.toast('Persona deleted', p.name, 'warning');
    }, true);
  }
  function validation() {
    const list = personas(); const all = new Set(names()); const problems = [];
    const steps = [
      { title: 'Model routes', desc: list.every(p => p.route) ? 'Every persona names a route' : 'Some personas have no route', tone: list.every(p => p.route) ? 'ready' : 'attention', status: list.every(p => p.route) ? 'Passed' : 'Needs attention' },
      { title: 'Tools', desc: list.every(p => (pval(p, S.prefer) || []).length) ? 'Every persona lists at least one tool' : 'Some personas list no tools', tone: list.every(p => (pval(p, S.prefer) || []).length) ? 'ready' : 'attention', status: list.every(p => (pval(p, S.prefer) || []).length) ? 'Passed' : 'Needs attention' }
    ];
    for (const c of crews()) for (const m of c.members || []) if (!all.has(m)) problems.push(`${m} (in ${c.name})`);
    steps.push({ title: 'Crew membership', desc: problems.length ? `Missing: ${problems.join(', ')}` : 'Every crew member exists', tone: problems.length ? 'attention' : 'ready', status: problems.length ? 'Needs attention' : 'Passed' });
    const placeholders = list.filter(p => /\{\{|\$\{/.test(p.prompt || ''));
    steps.push({ title: 'Instructions', desc: placeholders.length ? `Unfilled placeholders in ${placeholders.map(p => p.name).join(', ')}` : 'No unfilled placeholders or secrets', tone: placeholders.length ? 'attention' : 'ready', status: placeholders.length ? 'Needs attention' : 'Passed' });
    return steps;
  }

  /* ---------- Crews ---------------------------------------------------- */
  function crewsTab() {
    const enabled = on(PM51.value(S.crews));
    const head = PM51.section({ title: 'Crews', help: 'Teams of personas that work on one Goal together.', body: PM51.bound.rows([S.crews]) + (enabled ? '' : PM51.note('Crews are off. You can still set them up; nothing uses them until you turn this on.', 'info')) });
    const c = selectedCrew();
    if (!c) return head + PM51.empty('No crews yet', 'A crew is a team of personas that work together.', { label: 'New crew', icon: 'plus', action: 'pm51-personas-crew-new' }) + PM51.slot();
    const body = PM51.rows([
      { label: 'Lead', help: 'Coordinates the others and reports back.', value: c.lead || 'Nobody; each works alone' },
      { label: 'Members', control: chips(c.members) },
      { label: 'Model route', value: c.route },
      { label: 'What members hand on', help: 'What each member passes to the next.', value: handoffLabel(c.handoff) },
      { label: 'Members working at once', help: 'How many may be busy at the same time.', value: `Up to ${c.concurrency}` }
    ]) + PM51.advanced(PM51.section({ title: 'How handoffs work', body: PM51.kv([['Task summary', 'What was asked, what was done, what was checked, and what is left'], ['Context passed on', 'Only what the next member needs'], ['Disagreements', 'The lead decides and records why'], ['Failed handoff', 'Returns to the lead instead of stalling']]) }));
    return head + PM51.listDetail({
      id: ID, rosterTitle: 'Crews', count: crews().length, selectAction: 'pm51-personas-select-crew',
      add: { action: 'pm51-personas-crew-new', label: 'New crew' },
      items: crews().map(x => ({ id: x.id, title: x.name, meta: `${(x.members || []).length} members · led by ${x.lead || 'nobody'}`, avatar: icon('users'), selected: x.id === c.id })),
      detail: {
        title: c.name, subtitle: `${(c.members || []).length} members · ${c.route}`,
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-personas-crew-edit', data: { id: c.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Add member', icon: 'plus', onClick: () => addMember(c) },
          { label: 'Duplicate', icon: 'copy', onClick: () => { const copy = clone(c); copy.id = newId('crew'); copy.name = c.name + ' copy'; crews().push(copy); PM51.setSel(CREW_SEL, copy.id); saveState(); refresh(); PM51.toast('Crew duplicated', copy.name); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${c.name}”?`, 'The personas in it are kept.', 'Delete', () => { const i = crews().indexOf(c); if (i >= 0) crews().splice(i, 1); for (const p of personas()) p.crews = (p.crews || []).filter(n => n !== c.name); PM51.setSel(CREW_SEL, (crews()[0] || {}).id); saveState(); refresh(); PM51.toast('Crew deleted', c.name, 'warning'); }, true) }
        ], c.name),
        body
      }
    }) + PM51.slot();
  }
  function crewWizard(c) {
    const isNew = !c;
    const seedMembers = (() => { const v = PM51.value(S.crewMembers); return Array.isArray(v) && v.length ? v.filter(n => names().includes(n)) : []; })();
    const seedLead = String(PM51.value(S.crewLead) || 'Parent assistant');
    const draft = c ? { name: c.name, members: (c.members || []).slice(), lead: c.lead || '', handoff: HANDOFFS.some(x => x[0] === c.handoff) ? c.handoff : HANDOFFS[0][0], atOnce: c.concurrency || 3, route: c.route }
      : { name: '', members: seedMembers, lead: seedLead === 'None' ? '' : (seedMembers[0] || ''), handoff: HANDOFFS[0][0], atOnce: Number(PM51.value(S.crewAtOnce)) || 3, route: 'Per persona' };
    PM51.wizard({
      title: isNew ? 'New crew' : `Edit ${c.name}`, subtitle: 'A crew is a team of personas that work on one Goal together, with a lead.', eyebrow: 'Crew', icon: 'users',
      draft, finishLabel: isNew ? 'Create crew' : 'Save',
      steps: [
        { label: 'Name', icon: 'edit', title: 'What is the crew called?', lead: isNew ? 'Members and the lead start from "New crews start with".' : '', recap: d => d.name,
          render: d => `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-cw-name" value="${a(d.name)}" placeholder="For example: Docs Crew" autocomplete="off"/>`)}</div>`,
          collect: (w, d) => { d.name = String(w.querySelector('.o55-cw-name').value || '').trim(); },
          check: d => !d.name ? 'Give the crew a name.' : (crews().some(x => x !== c && x.name.toLowerCase() === d.name.toLowerCase()) ? `There is already a crew called ${d.name}.` : '') },
        { label: 'Members', icon: 'users', title: 'Who is in it?', lead: 'Pick two or more. Helper-only personas can join too.', recap: d => `${d.members.length} members`,
          render: d => PM51.tiles(personas().filter(p => !isHidden(p)).map(p => ({ title: p.name, text: p.description, icon: p.locked ? 'lock' : 'user', selected: d.members.includes(p.name), data: { name: p.name } })), { action: 'pm51-personas-w-member', multi: true }),
          check: d => d.members.length < 2 ? 'Pick at least two members.' : '' },
        { label: 'Lead', icon: 'star', title: 'Who leads it?', lead: 'The lead hands out the work and reports back.', recap: d => d.lead || 'Nobody',
          render: d => PM51.tiles(d.members.map(n => ({ title: n, text: (personas().find(p => p.name === n) || {}).description || '', icon: 'star', selected: d.lead === n, data: { name: n } })).concat([{ title: 'Nobody', text: 'Each member works alone; the assistant you talk to collects the results.', icon: 'users', selected: !d.lead, data: { name: '' } }]), { action: 'pm51-personas-w-lead' }) },
        { label: 'Teamwork', icon: 'sliders', title: 'How should they work together?', lead: 'What each member passes on, and how many work at once.',
          render: d => `<div class="o55-setup-fields">${PM51.field('What members hand on', PM51.dropdown(d.handoff, HANDOFFS.map(([v, l, m]) => ({ value: v, label: l, meta: m })), { cls: 'o55-cw-handoff', label: 'What members hand on' }))}${PM51.field('Members working at once', `<input class="text-control o55-cw-atonce" type="number" min="1" max="8" step="1" value="${a(d.atOnce)}"/>`, 'The server may allow fewer.')}${PM51.field('Model route', PM51.dropdown(d.route, withCurrent(['Per persona', ...routes()], d.route).map(v => ({ value: v, label: v })), { cls: 'o55-cw-route', label: 'Model route' }), 'Per persona lets each member use its own.')}</div>`,
          collect: (w, d) => { const hf = w.querySelector('.o55-cw-handoff'), n = w.querySelector('.o55-cw-atonce'), r = w.querySelector('.o55-cw-route'); if (hf) d.handoff = hf.value; if (n) d.atOnce = Math.max(1, Math.min(8, Math.round(Number(n.value) || 1))); if (r) d.route = r.value; } }
      ],
      onFinish: d => {
        const rec = isNew ? { id: newId('crew') } : c; const old = c ? c.name : '';
        Object.assign(rec, { name: d.name, lead: d.lead, members: d.members.slice(), route: d.route, handoff: d.handoff, concurrency: d.atOnce });
        if (isNew) crews().push(rec);
        for (const p of personas()) { p.crews = (p.crews || []).filter(n => n !== rec.name && n !== old); if (rec.members.includes(p.name)) p.crews.push(rec.name); }
        PM51.setSel(CREW_SEL, rec.id); PM51.setTab(ID, 'crews'); saveState(); refresh();
        PM51.toast(isNew ? 'Crew created' : 'Crew saved', `${d.name}: ${d.members.length} members${d.lead ? `, led by ${d.lead}` : ''}.`);
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

  /* ---------- Group work, Helpers -------------------------------------- */
  const workflowsTab = () => '<p class="o55-tab-lead">Ways for several personas to work on one question: BrainStorm to explore ideas, Review to check finished work, Chat Room to talk it through with you. A lineup picks who takes part; when it is empty, Puppet Master picks.</p>' + PM51.slot();
  const helpersTab = () => '<p class="o55-tab-lead">Helpers are short-lived agents a persona hands one bounded task to, like finding files or running tests. They report back and stop.</p>' + PM51.slot();

  /* ---------- Defaults ------------------------------------------------- */
  function defaultsTab() {
    const active = personas().find(p => p.id === String(PM51.value(S.active))) || personas().find(p => p.id === 'assistant');
    const roster = PM51.value(S.reviewRoster);
    return PM51.slot()
      + PM51.section({
        title: 'Planning and review', help: 'These pick personas too; each is set where it is used.',
        body: PM51.rows([
          { label: 'Planning helpers', help: 'Who asks the questions and drafts the plan, in the Planning chapter.', value: PM51.valueLabel(S.planner, PM51.value(S.planner)), action: { label: 'Change', icon: 'arrowRight', action: 'pm51-personas-reveal', data: { setting: S.planner } } },
          { label: 'Reviewers', help: 'Who checks finished work, under Group work.', value: Array.isArray(roster) && roster.length ? roster.join(', ') : 'Puppet Master picks', action: { label: 'Change', icon: 'arrowRight', action: 'pm51-personas-reveal', data: { setting: S.reviewRoster } } },
          { label: 'Goals', help: 'New Goals start with the persona set in Goals & Automation.', value: ((PM51.s().goals || {}).defaults || {}).persona || 'Assistant', action: { label: 'Change', icon: 'arrowRight', action: 'pm51-go', data: { domain: 'memory', workspace: 'goals' } } }
        ])
      })
      + PM51.section({
        title: 'In a chat', help: 'The persona of the open chat, and how to switch.',
        body: PM51.home(S.active, PM51.rows([{ label: "This chat's persona", help: 'Change it from the persona chip in chat.', value: active ? active.name : 'Assistant' }]))
          + PM51.bound.rows([S.lock])
          + PM51.home(S.ask, PM51.rows([{ label: 'Switch by asking', help: 'Say "let the researcher handle this" in chat, and that persona takes over.', value: 'Always on' }]))
      });
  }

  function render() {
    const tab = PM51.tab(ID, 'personas');
    const body = tab === 'crews' ? crewsTab() : tab === 'workflows' ? workflowsTab() : tab === 'helpers' ? helpersTab() : tab === 'defaults' ? defaultsTab() : personasTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset persona defaults', action: 'pm51-personas-reset' }, { label: 'How personas work', action: 'pm51-personas-help' }] });
  }
  PM51.manager('personas', { render });
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); if (SCOPED.includes(id) && !selectedPersona()) ps().show = 'all'; });
  PM51.scopedSetter('persona', (id, value, el) => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p) return '';
    if (p.locked) { PM51.toast('Locked', `${p.name} is built in. Duplicate it to change it.`, 'info'); return p.name; }
    p.props = p.props || {}; p.props[id] = value;
    if (id === S.prefer) p.tools = Array.isArray(value) ? value.slice() : p.tools;
    saveState(); return p.name;
  });
  SCOPED.forEach(id => PM51.perValues(id, () => personas().map(p => ({ name: p.name, value: pval(p, id) }))));
  const chatPersonas = () => personas().filter(p => p.chat !== false && !isHidden(p)).map(p => ({ value: p.id, label: p.name, meta: p.locked ? 'Core' : p.group === 'Bundled' ? 'Bundled' : 'Yours' }));
  PM51.moreChoices(S.chatDefault, chatPersonas);
  PM51.moreChoices(S.active, chatPersonas);
  PM51.moreChoices(S.hidden, () => personas().filter(p => p.group === 'Bundled').map(p => ({ value: p.id, label: p.name })));
  PM51.moreChoices(S.model, () => (PM51.readyModels ? PM51.readyModels() : []));
  PM51.moreChoices(S.platform, () => (state.providers || []).filter(p => p.status === 'active').map(p => ({ value: p.id, label: p.name })));
  PM51.moreChoices(S.perms, () => (state.permissionProfiles || []).map(p => ({ value: p.id, label: p.name })));
  [S.prefer, S.avoid].forEach(id => PM51.moreChoices(id, () => TOOLS.map(t => ({ value: t, label: t }))));
  PM51.moreChoices(S.skills, () => ((PM51.s().skills) || []).map(k => ({ value: k.name, label: k.name })));
  PM51.moreChoices(S.plugins, () => ((PM51.s().plugins) || []).map(k => ({ value: k.name, label: k.name })));
  ['branching.crew.brainstorm-roster', 'branching.crew.chat-room-roster', S.crewMembers, 'branching.crew.crew-auto-roster', S.reviewRoster].forEach(id => PM51.listChoices(id, () => personas().filter(p => !isHidden(p)).map(p => p.name)));
  ['branching.subagents.required-subagents', 'branching.subagents.disabled-subagents'].forEach(id => PM51.listChoices(id, () => personas().filter(p => p.helper !== false && !isHidden(p)).map(p => p.name)));
  /* a lineup sets the size: a lineup of 5 with a size of 3 cannot happen */
  PAIRS.forEach(([roster, size]) => PM51.watch(roster, v => { if (Array.isArray(v) && v.length && commitSettingValue(size, v.length)) { saveState(); refreshSettingRow(size); } }));
  PM51.watch('branching.subagents.delegation-depth', v => { const max = Number(PM51.value('branching.subagents.max-nesting-depth')) || 4; if (Number(v) > max) { commitSettingValue('branching.subagents.delegation-depth', max); saveState(); refreshSettingRow('branching.subagents.delegation-depth'); PM51.toast('Kept within the hard stop', `Helpers can go ${max} levels deep at most (Limits for all agents).`, 'info'); } });
  [S.hidden, S.crews].forEach(id => PM51.watch(id, () => refresh()));

  /* ---------- actions -------------------------------------------------- */
  PM51.on('personas-add', el => PM51.menu(el, [
    { label: 'New persona', icon: 'plus', meta: 'Step by step', onClick: () => personaWizard() },
    { label: 'Import', icon: 'upload', meta: 'From a PERSONA.md file', onClick: () => PM51.panel({ title: 'Import persona', subtitle: 'Bring in a persona exported from another workspace.', body: PM51.panelSection('File', PM51.field('Persona file', '<input class="text-control" type="file" aria-label="Persona file"/>', 'A PERSONA.md file exported from Puppet Master.')) + PM51.note('Reading a file needs the desktop app. Nothing is read in this preview.'), primaryLabel: 'Import', onPrimary: () => PM51.toast('Nothing imported', 'Example data only. Importing a file needs the desktop app.', 'info') }) }
  ], 'Add'));
  PM51.on('personas-new', () => personaWizard());
  PM51.on('personas-manage', () => { ps().show = 'all'; PM51.setTab(ID, 'personas'); PM51.go('memory', ID); PM51.toast('This is the persona list', 'Pick a persona to change it, or add one with the plus button.', 'info'); });
  PM51.on('personas-show', el => { ps().show = el.value || ds(el, 'value') || 'all'; saveState(); refresh(); });
  PM51.onChange('personas-show', el => { ps().show = el.value || 'all'; saveState(); refresh(); });
  PM51.on('personas-show-all', () => { ps().show = 'all'; saveState(); refresh(); });
  PM51.on('personas-w-base', el => { const w = PM51.wizardOf(el); if (!w) return; const id = ds(el, 'base') || ''; w.draft.base = id; const b = personas().find(x => x.id === id); if (b) { w.draft.name = w.draft.name || `${b.name} copy`; w.draft.description = w.draft.description || b.description || ''; w.draft.style = PM51.scopedValue(b, S.style) || 'balanced'; } w.next(); });
  PM51.on('personas-w-style', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.style = ds(el, 'style'); });
  PM51.on('personas-w-member', el => { const w = PM51.wizardOf(el); if (!w) return; const n = ds(el, 'name'); const m = w.draft.members; const i = m.indexOf(n); if (i >= 0) m.splice(i, 1); else m.push(n); el.classList.toggle('is-on', i < 0); el.setAttribute('aria-checked', String(i < 0)); if (w.draft.lead && !m.includes(w.draft.lead)) w.draft.lead = m[0] || ''; if (!w.draft.lead && m.length === 1) w.draft.lead = m[0]; });
  PM51.on('personas-w-lead', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.lead = ds(el, 'name') || ''; w.next(); });
  PM51.on('personas-about', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p || p.locked) return;
    PM51.panel({
      title: 'Name and purpose', subtitle: p.name, icon: 'user',
      body: `<div class="o55-setup-fields">${PM51.field('Name', `<input class="text-control o55-pa-name" value="${a(p.name)}" autocomplete="off" data-autofocus/>`, 'Crews, templates and Goals that use it follow the new name.')}${PM51.field('What it is for', `<input class="text-control o55-pa-desc" value="${a(p.description || '')}" autocomplete="off"/>`)}</div>`,
      primaryLabel: 'Save', onPrimary: w => {
        const name = String(w.querySelector('.o55-pa-name').value || '').trim(), desc = String(w.querySelector('.o55-pa-desc').value || '').trim();
        if (!name) { PM51.toast('Give it a name', 'A persona needs a name.', 'info'); return false; }
        if (name !== p.name && (names().some(n => n.toLowerCase() === name.toLowerCase()) || RESERVED.has(slug(name)))) { PM51.toast('Pick another name', `${name} is already taken.`, 'info'); return false; }
        const old = p.name; p.name = name; p.description = desc; renameEverywhere(old, name);
        (p.crews || []).forEach(() => {}); saveState(); refresh(); PM51.toast('Saved', old === name ? name : `${old} is now ${name}.`);
      }
    });
  });
  PM51.on('personas-aliases', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p || p.locked) return;
    const cur = pval(p, S.aliases);
    PM51.panel({
      title: 'Other names it answers to', subtitle: p.name, icon: 'user', summary: 'So "ask the prof" reaches your teacher persona.',
      body: PM51.field('Names', `<input class="text-control o55-pa-alias" value="${a((Array.isArray(cur) ? cur : []).join(', '))}" placeholder="For example: prof, the teacher" autocomplete="off" data-autofocus/>`, 'Separate them with commas.'),
      primaryLabel: 'Save', onPrimary: w => { const list = String(w.querySelector('.o55-pa-alias').value || '').split(',').map(x => x.trim()).filter(Boolean); p.props = p.props || {}; p.props[S.aliases] = [...new Set(list)]; saveState(); refresh(); PM51.toast('Saved', list.length ? `${p.name} also answers to ${list.join(', ')}.` : `${p.name} answers only to its name.`); }
    });
  });
  PM51.on('personas-prompt', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p || p.locked) return;
    PM51.panel({
      title: 'Instructions', subtitle: p.name, icon: 'file', size: 'wide', summary: 'What this persona reads before every task. Plain sentences are fine.',
      body: `<textarea class="o55-persona-editor" spellcheck="false" aria-label="Instructions for ${a(p.name)}" data-autofocus>${h(p.prompt || '')}</textarea>`,
      primaryLabel: 'Save', onPrimary: w => { p.prompt = w.querySelector('.o55-persona-editor').value.replace(/\r\n/g, '\n'); saveState(); refresh(); PM51.toast('Instructions saved', p.name); }
    });
  });
  PM51.on('personas-reveal', el => { if (PM51.revealSetting) PM51.revealSetting(ds(el, 'setting')); });
  PM51.on('personas-duplicate', el => { const p = personas().find(x => x.id === ds(el, 'id')); if (p) duplicate(p); });
  const tryPanel = (p, question) => PM51.panel({
    title: `Try ${p.name}`, subtitle: 'This preview cannot run a model. Here is what would shape the reply.',
    body: (question ? PM51.panelSection('Your question', `<div class="pm51-example">${h(question)}</div>`) : '')
      + PM51.panelSection('How it would approach it', PM51.kv([['Answer style', PM51.valueLabel(S.style, pval(p, S.style))], ['Preferred model', PM51.valueLabel(S.model, pval(p, S.model))], ['Tools it prefers', (pval(p, S.prefer) || []).join(' · ') || 'None'], ['Instructions', p.prompt || 'None']]))
      + PM51.note('In the app, the reply appears here without starting a real task.')
  });
  PM51.on('personas-try-open', el => { const p = personas().find(x => x.id === ds(el, 'id')); if (p) tryPanel(p, ''); });
  PM51.on('personas-try', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p) return;
    const q = el.closest('.pm51-personas-try')?.querySelector('input'); const question = q && q.value.trim();
    if (!question) { PM51.toast('Type a question first', `Then see how ${p.name} would approach it.`, 'info'); return; }
    tryPanel(p, question);
  });
  PM51.on('personas-compare', el => {
    const p = personas().find(x => x.id === ds(el, 'id')); if (!p) return;
    const pick = el.closest('.pm51-personas-try')?.querySelector('select');
    const o = personas().find(x => x.id === (pick || {}).value); if (!o) return;
    const pair = (av, bv) => PM51.kv([[p.name, av || '—'], [o.name, bv || '—']]);
    PM51.panel({
      title: `${p.name} and ${o.name}`, subtitle: 'Side by side.',
      body: PM51.panelSection('What each is for', pair(p.description, o.description)) + PM51.panelSection('Answer style', pair(PM51.valueLabel(S.style, pval(p, S.style)), PM51.valueLabel(S.style, pval(o, S.style)))) + PM51.panelSection('Model route', pair(p.route, o.route)) + PM51.panelSection('Tools', pair((pval(p, S.prefer) || []).join(' · '), (pval(o, S.prefer) || []).join(' · ')))
    });
  });
  PM51.on('personas-validate', () => { const steps = validation(); const bad = steps.filter(s => s.tone !== 'ready').length; PM51.check({ title: 'Check every persona', subtitle: `${personas().length} personas and ${crews().length} crews checked against each other.`, steps, outcome: bad ? `${bad} to look at` : 'All good', tone: bad ? 'attention' : 'ready' }); });

  PM51.on('personas-select-crew', el => { PM51.setSel(CREW_SEL, ds(el, 'id')); state.resourceRosterOpen = false; refresh(); });
  PM51.on('personas-crew-new', () => crewWizard(null));
  PM51.on('personas-crew-edit', el => { const c = crews().find(x => x.id === ds(el, 'id')); if (c) crewWizard(c); });

  PM51.on('personas-reset', () => PM51.confirm('Reset persona defaults?', 'Who answers by default, how personas are picked and where new ones are saved go back to their defaults. Your personas and crews are kept.', 'Reset', () => {
    ['personas.library.selection-mode', S.chatDefault, 'personas.library.custom-scope', 'personas.tools.support-badges', S.lock, S.hidden].forEach(id => { if (restoreSettingDefault(id)) o55Notify(id, PM51.value(id)); });
    PM51.s().personas = Object.assign(clone(DATA.personas), { show: 'all' }); saveState(); refresh(); PM51.toast('Persona defaults reset', 'Defaults are back.');
  }));
  PM51.on('personas-help', () => PM51.panel({
    title: 'How personas work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A persona is a role the assistant plays: a purpose, a way of answering, a preferred model, and the tools it reaches for. Crews are teams of personas with a lead.</p>')
      + PM51.panelSection('Core, bundled, yours', PM51.kv([['Core', 'Nine built-in personas, always there and locked. Duplicate one to make your own version.'], ['Bundled', 'Specialists that ship with Puppet Master. Change them, or hide them from pickers.'], ['Yours', 'Made by you. Change, export or delete them freely.']]))
      + PM51.panelSection('Working together', PM51.kv([['Crews', 'A team with a lead, for one Goal.'], ['Group work', 'BrainStorm, Review and Chat Room.'], ['Helpers', 'Short-lived agents for one bounded task.']]))
  }));
})();
