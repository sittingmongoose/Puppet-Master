/* Context & Memory — memories, the working space of a run, standing instructions, finding memories, keeping and
   privacy, sources (settings audit, 2026-09-27).
   - Memories: the master switch "Remember things between chats" heads the list; the list's Show menu is the
     inventory's review view (unconfirmed first); an unconfirmed note can be confirmed where it is read.
   - Context space: the working space of one run is not a saved memory, so it has its own tab: a live gauge with the
     three thresholds marked on it and "Squeeze now", then when space runs low, the working notebook, and the split.
   - Instructions: the two rule documents are edited in an editor, not a one-line box; the rule-pack list the
     inventory's "Which rule packs to list" filters is drawn here.
   - Finding memories: "Try a question" honours the real settings (how many, by meaning or recency, pinned notes
     nobody confirmed), so the preview shows what the settings do.
   - Keeping & privacy: one answer to "how long is a memory kept" (the fade times) and one to "who else may read
     them" (helpers, then crews). The former per-store lifetimes and the hard-coded decay table were a second and a
     third answer and are gone.
   - Sources: "Chat history" is controlled by how much history is kept (Off is None).
   The Single Owners workspace lives on as a More options reference inside Sources. Per-run and per-Goal token caps
   moved to Permissions > Run limits. */
(function () {
  const ID = 'context-memory';
  const KEY = 'memory-context-instructions';
  const TABS = [
    { id: 'memories', label: 'Memories' },
    { id: 'context', label: 'Context space' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'retrieval', label: 'Finding memories' },
    { id: 'retention', label: 'Keeping & privacy' },
    { id: 'sources', label: 'Sources' }
  ];
  const S = {
    on: 'memory.retention.enabled', show: 'memory.retention.gist-review-filter',
    meter: 'general.interaction.context-usage', squeeze: 'memory.limits.manual-compact', auto: 'memory.limits.auto-compress',
    start: 'memory.limits.pressure-start-threshold', hard: 'memory.limits.pressure-aggressive-threshold', low: 'memory.limits.low-context-warning',
    buckets: 'memory.limits.budget-buckets', immune: 'memory.limits.compaction-immune-pct',
    appRules: 'memory.assembly.app-rules', projectRules: 'memory.assembly.project-rules', packing: 'memory.assembly.instruction-budget-mode', reuse: 'memory.assembly.dry-method-guard',
    packs: 'memory.assembly.rule-pack-display',
    maxMem: 'memory.assembly.max-injected-memories', memBudget: 'memory.assembly.memory-capsule-budget',
    mode: 'memory.retention.retrieval-mode', strategy: 'memory.retention.retrieval-strategy', balance: 'memory.retention.retrieval-balance',
    pinnedUnconfirmed: 'memory.retention.pinned-unverified-injection',
    helpers: 'memory.retention.subagent-access', history: 'memory.retention.history-retention'
  };
  const STORE_LABEL = { Project: 'Project', User: 'You', Thread: 'This thread' };
  const STORE_CHOICES = [{ value: 'Project', label: 'Project' }, { value: 'User', label: 'You' }, { value: 'Thread', label: 'This thread' }];
  const TYPES = ['Rule', 'Decision', 'Preference'];
  const STOP = new Set(['the', 'and', 'for', 'are', 'what', 'which', 'this', 'that', 'with', 'from', 'about', 'how', 'should', 'does', 'have', 'our', 'your', 'when', 'where', 'into', 'rules', 'rule']);
  /* "meaning" in this preview: a few words that stand for each other */
  const NEAR = { install: ['setup', 'cli', 'clis'], setup: ['install'], tools: ['cli', 'clis'], animation: ['motion'], animations: ['motion'], motion: ['animation', 'animations'], build: ['compile', 'path'], ui: ['interface', 'motion'], order: ['authority'], priority: ['authority', 'order'], test: ['tests', 'pnpm'], tests: ['test', 'pnpm'], commit: ['commits', 'messages'] };
  const SOURCE_HELP = {
    'Project files': 'Files in this workspace, read when a question needs them.',
    'Plans': 'Named plans and their acceptance criteria.',
    'Chat history': 'Earlier chats in this workspace.',
    'Tool output': 'What tests, terminals, and the browser reported.',
    'Manager records': 'Settings and status from other managers, such as connected services.'
  };
  const CANDIDATES = [
    { id: 'm4', title: 'Temporary build path', meta: 'This thread · 8 minutes ago', why: 'A scratch path from tool output that stops being true when the build folder moves.' },
    { id: 'cand-port', title: 'Dev server on port 5174', meta: 'This thread · 2 days ago', why: 'Only mattered for one debugging session.' },
    { id: 'cand-names', title: 'Draft names for the tab motion study', meta: 'This thread · 5 days ago', why: 'The final names now live in the plan.' },
    { id: 'cand-worktree', title: 'Old worktree location', meta: 'This thread · 2 weeks ago', why: 'That worktree was removed.' }
  ];
  /* notes the assistant noticed on its own, so the review view has something to review */
  const NOTICED = [
    { id: 'm6', title: 'Tests run with pnpm test', store: 'Project', type: 'Decision', source: 'Tool output', updated: 'Yesterday', confidence: 'Observed', pinned: false, text: 'The test suite runs with pnpm test from the project root; the watch mode is pnpm test --watch.' },
    { id: 'm7', title: 'Short commit messages', store: 'User', type: 'Preference', source: 'Conversation', updated: '4 days ago', confidence: 'Observed', pinned: false, text: 'You usually shorten commit messages to one line under 60 characters.' }
  ];
  const SHOW = {
    Unverified: x => x.confidence === 'Observed',
    Verified: x => x.confidence !== 'Observed',
    Pinned: x => !!x.pinned,
    All: () => true
  };
  const PARTS = [
    ['immune', 'Protected', 'Rules, the Goal and pinned memories. Never squeezed.'],
    ['history', 'Earlier conversation', 'What was said before this turn.'],
    ['current_turn', 'This reply', 'Room for the reply being written.'],
    ['tool_results', 'Tool results', 'What tests, terminals and the browser returned.'],
    ['contingency', 'Spare', 'Kept free for surprises.']
  ];
  const PACKS = [
    { id: 'app', name: 'Rules for every project', from: 'Your settings, started from AGENTS.md', state: () => 'Loaded' },
    { id: 'project', name: 'Rules for this project', from: '.puppet-master/project-rules.md', state: () => String(PM51.value(S.projectRules) || '').trim() ? 'Loaded' : 'Empty' },
    { id: 'agents', name: 'AGENTS.md', from: 'The project folder', state: () => 'Loaded' },
    { id: 'persona', name: 'Persona rules', from: 'The persona answering, from Personas & Crews', state: () => 'Loaded' },
    { id: 'reuse', name: 'Reuse-first guard', from: 'Built in', state: () => on(PM51.value(S.reuse)) ? 'Loaded' : 'Switched off' },
    { id: 'style', name: 'Team style guide', from: 'docs/STYLE.md', state: () => 'Switched off' },
    { id: 'lint', name: 'Old lint rules', from: 'tools/lint-rules.md', state: () => 'Could not load', why: 'The file was moved or deleted.' }
  ];
  const APP_RULES_SEED = 'Seeded from AGENTS.md on first run';
  let seq = 0;
  const newId = () => 'memory-' + Date.now().toString(36) + '-' + (++seq);
  const on = v => v === true || v === 'on' || v === 'true';
  const num = (id, d) => { const n = Number(PM51.value(id)); return Number.isFinite(n) ? n : d; };

  function mem() {
    const m = PM51.s().memory;
    if (!m.retrieval) m.retrieval = { preferPinned: true, disagree: 'Ask me' };
    delete m.retrieval.max; delete m.retention;
    if (!m.privacy) m.privacy = { shareWithCrews: true, protect: { pinned: true, rules: true, decisions: true, preferences: false } };
    if (!m.candidates) m.candidates = clone(CANDIDATES);
    if (!m.forgotten) m.forgotten = [];
    if (m.query == null) m.query = '';
    if (!m.o55V2) { m.o55V2 = true; const list = memories(); NOTICED.forEach(x => { if (!list.some(y => y.id === x.id)) list.push(clone(x)); }); }
    if (!m.tidy) m.tidy = {};
    return m;
  }
  const memories = () => state.memories || (state.memories = []);
  const memoryOn = () => on(PM51.value(S.on));
  const storeLabel = s => STORE_LABEL[s] || s;
  const refresh = () => PM51.refresh(ID, { swap: false });
  const showValue = () => { const v = String(PM51.value(S.show) || 'All'); return SHOW[v] ? v : 'All'; };
  const shownList = () => memories().filter(SHOW[showValue()]);
  const selected = () => { const list = shownList(); return list.find(x => x.id === PM51.sel(ID)) || list[0]; };

  PM51.style(`
#panel-settings .pm51-memory-text { margin: 0; width: 100%; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-memory-try { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#panel-settings .pm51-memory-try .text-control { flex: 1 1 260px; width: auto; max-width: 100%; }
#panel-settings .pm51-memory-rank { font-size: 11px; font-weight: 720; }
#panel-settings .pm51-memory-pair { display: flex; gap: 6px; }
#panel-settings .o55-mem-gauge { display: grid; gap: 12px; }
#panel-settings .o55-mem-gauge-top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
#panel-settings .o55-mem-gauge-value { font-size: 28px; font-weight: 760; letter-spacing: -0.02em; color: var(--k3-text-1); font-variant-numeric: tabular-nums; }
#panel-settings .o55-mem-gauge-label { font-size: 12.5px; color: var(--k3-text-3); }
#panel-settings .o55-mem-bar { position: relative; height: 12px; border-radius: 6px; background: var(--k3-bg-2); box-shadow: inset 0 0 0 1px var(--k3-line); overflow: visible; }
#panel-settings .o55-mem-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; background: var(--k3-accent); transition: width 700ms var(--k3-ease-out, ease), background-color 300ms ease; }
#panel-settings .o55-mem-fill.is-trim { background: var(--k3-amber); }
#panel-settings .o55-mem-fill.is-hard { background: var(--k3-red, #e5484d); }
#panel-settings .o55-mem-tick { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-left: -1px; border-radius: 1px; background: var(--k3-text-3); opacity: .7; }
#panel-settings .o55-mem-legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--k3-text-3); }
#panel-settings .o55-mem-legend b { color: var(--k3-text-2); font-weight: 650; font-variant-numeric: tabular-nums; }
#panel-settings .o55-mem-gauge-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
#panel-settings .o55-mem-doc { display: grid; gap: 4px; min-width: 0; }
#panel-settings .o55-mem-doc-preview { font-family: var(--k3-mono, ui-monospace, monospace); font-size: 11.5px; color: var(--k3-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
#panel-settings .o55-mem-doc-preview.is-empty { font-family: inherit; color: var(--k3-text-3); }
#panel-settings .o55-mem-editor { width: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); color: var(--k3-text-1); font: 12.5px/1.6 var(--k3-mono, ui-monospace, monospace); resize: vertical; }
#panel-settings .o55-mem-split-bar { display: flex; height: 14px; border-radius: 7px; overflow: hidden; background: var(--k3-bg-2); box-shadow: inset 0 0 0 1px var(--k3-line); }
#panel-settings .o55-mem-split-bar span { height: 100%; transition: width 260ms ease; }
#panel-settings .o55-mem-split-bar span + span { box-shadow: inset 1px 0 0 var(--k3-bg-1); }
#panel-settings .o55-mem-split-row { display: grid; grid-template-columns: 12px minmax(0, 1fr) 92px; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--k3-line); }
#panel-settings .o55-mem-split-row:last-child { border-bottom: 0; }
#panel-settings .o55-mem-split-row i { width: 12px; height: 12px; border-radius: 3px; }
#panel-settings .o55-mem-split-row .o55-num .text-control { width: 64px; }
#panel-settings .o55-mem-split-total { margin: 10px 0 0; font-size: 12.5px; font-weight: 650; color: var(--k3-text-2); }
#panel-settings .o55-mem-split-total.is-off { color: var(--k3-amber); }
@media (prefers-reduced-motion: reduce) { #panel-settings .o55-mem-fill, #panel-settings .o55-mem-split-bar span { transition: none; } }
`);
  const SPLIT_COLORS = ['var(--k3-accent)', 'color-mix(in srgb, var(--k3-accent) 55%, var(--k3-bg-1))', 'var(--k3-green, #30a46c)', 'var(--k3-amber)', 'color-mix(in srgb, var(--k3-text-3) 55%, var(--k3-bg-1))'];

  /* ---------- Memories ------------------------------------------------- */
  function conflictsFor(x) {
    return memories().filter(o => o.id !== x.id && o.type === x.type && o.store === x.store && o.title.split(' ')[0] === x.title.split(' ')[0]);
  }
  function memoriesTab() {
    mem(); const all = memories(); const list = shownList(); const cur = selected(); const onNow = memoryOn();
    const unconfirmed = all.filter(SHOW.Unverified).length;
    const head = PM51.section({
      title: 'Your memories', help: 'Short notes the assistant keeps about this project and about you, read before it answers.',
      body: PM51.bound.rows([S.on]) + (onNow ? '' : PM51.note('Memory is off: every chat starts with a clean slate. The notes below are kept until you delete them.', 'info'))
    });
    const stats = PM51.stats([
      { label: 'Memories', value: all.length, help: `${all.filter(x => x.store === 'Project').length} project · ${all.filter(x => x.store === 'User').length} about you · ${all.filter(x => x.store === 'Thread').length} this thread` },
      { label: 'Pinned', value: all.filter(x => x.pinned).length, help: 'Always considered first' },
      { label: 'Unconfirmed', value: unconfirmed, help: 'Noticed by the assistant; nobody has checked them yet', tone: unconfirmed ? 'attention' : undefined }
    ]);
    const hidden = all.length - list.length;
    const toolbar = `<div class="o55-toolbar o55-mem-toolbar">${PM51.bound.select(S.show, { prefix: 'Show', width: 170 })}<span class="o55-toolbar-spacer"></span><span class="o55-quiet-line">${hidden ? `${list.length} of ${all.length} shown` : `${all.length} ${all.length === 1 ? 'memory' : 'memories'}`}</span>${hidden ? PM51.btn({ label: 'Show all', small: true, ghost: true, action: 'pm51-memory-show-all' }) : ''}</div>`;
    if (!all.length) return head + stats + PM51.empty('No memories yet', 'Add a memory to give the assistant something to keep in mind.', { label: 'Add memory', action: 'pm51-memory-add', icon: 'plus' });
    if (!cur) return head + stats + toolbar + PM51.empty(showValue() === 'Unverified' ? 'Nothing waiting to be confirmed' : 'Nothing to show', showValue() === 'Unverified' ? 'Every note the assistant noticed has been checked.' : 'No memory matches this view.', { label: 'Show all memories', action: 'pm51-memory-show-all', icon: 'eye' });
    const conflicts = conflictsFor(cur);
    const noticed = cur.confidence === 'Observed';
    const body = (noticed ? PM51.note('The assistant noticed this on its own. Confirm it if it is right, or edit or forget it.', 'info') : '') + PM51.rows([
      { label: 'Store', help: 'Where this memory lives and who can see it.', value: storeLabel(cur.store) },
      { label: 'Source', help: 'How the assistant learned it.', value: cur.source },
      { label: 'Updated', value: cur.updated },
      { label: 'Confidence', help: 'Explicit means you said it. Confirmed means you checked it. Observed means the assistant noticed it.', value: cur.confidence },
      { label: 'Text', cls: 'is-wrap', control: `<p class="pm51-memory-text">${h(cur.text || '')}</p>` }
    ]) + PM51.advanced([
      PM51.section({ title: 'Conflicts with', help: 'Other memories that could contradict this one.', body: conflicts.length ? PM51.list(conflicts.map(o => ({ title: o.title, meta: `${storeLabel(o.store)} · ${o.type} · ${o.updated}`, action: 'pm51-memory-open', data: { id: o.id } }))) : PM51.note('No conflicts found. Newer explicit memories win when two disagree.') }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Memory id', cur.id], ['Store key', cur.store.toLowerCase()], ['Pinned', cur.pinned ? 'Yes' : 'No'], ['Type', cur.type]]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-memory-diagnostics' }) + '</div>' })
    ].join(''));
    return head + stats + toolbar + PM51.listDetail({
      id: ID, rosterTitle: 'Memories', count: list.length,
      add: { action: 'pm51-memory-add', label: 'Add memory' },
      filter: { placeholder: 'Filter memories', value: (PM51.s().filters || {})[ID] || '' },
      items: list.map(x => ({ id: x.id, title: x.title, meta: [storeLabel(x.store), x.type, x.confidence === 'Observed' ? 'Unconfirmed' : '', x.pinned ? 'Pinned' : ''].filter(Boolean).join(' · '), selected: x.id === cur.id, avatar: icon(x.store === 'Thread' ? 'clock' : x.pinned ? 'pin' : 'memory') })),
      detail: {
        title: cur.title, subtitle: `${storeLabel(cur.store)} · ${cur.source}`,
        pill: PM51.tag(cur.type) + (cur.pinned ? ' ' + PM51.tag('Pinned') : ''),
        primary: noticed ? { label: 'Confirm', icon: 'check', action: 'pm51-memory-confirm', data: { id: cur.id } } : { label: 'Edit', icon: 'edit', action: 'pm51-memory-edit', data: { id: cur.id } },
        menu: anchor => memoryMenu(anchor, cur),
        body
      }
    });
  }
  function memoryMenu(anchor, x) {
    PM51.menu(anchor, [
      x.confidence === 'Observed' ? { label: 'Edit', icon: 'edit', onClick: () => editMemory(x) } : null,
      { label: x.pinned ? 'Unpin' : 'Pin', icon: 'pin', onClick: () => { x.pinned = !x.pinned; saveState(); refresh(); } },
      { label: 'Move to store', icon: 'archive', onClick: () => moveStore(x) },
      { label: 'View source', icon: 'file', onClick: () => viewSource(x) },
      { separator: true },
      { label: 'Forget', icon: 'history', meta: 'Recoverable for 30 days', onClick: () => forget(x) },
      { label: 'Delete', icon: 'trash', danger: true, onClick: () => remove(x) }
    ].filter(Boolean), x.title);
  }
  function editMemory(x) {
    const isNew = !x;
    const v = x || { title: '', text: '', store: 'Project', type: 'Rule' };
    openDialog({
      title: isNew ? 'Add memory' : 'Edit memory', subtitle: isNew ? 'Something the assistant should keep in mind.' : v.title,
      body: formField('Title', 'title', v.title, { full: true, autofocus: true, placeholder: 'A short name for this memory' })
        + formField('Text', 'text', v.text, { type: 'textarea', full: true, help: 'Write it the way you would tell a colleague.' })
        + formField('Store', 'store', v.store, { type: 'select', choices: STORE_CHOICES, help: 'Project memories stay with this workspace. Memories about you follow you everywhere.' })
        + formField('Type', 'type', TYPES.includes(v.type) ? v.type : 'Rule', { type: 'select', choices: TYPES, help: 'Rules are always followed. Decisions record a choice. Preferences shape style.' }),
      saveLabel: isNew ? 'Add memory' : 'Save changes',
      onSave: data => {
        const title = String(data.title || '').trim();
        if (!title) { PM51.toast('Give the memory a title', 'A short name helps you find it later.', 'warning'); return false; }
        if (isNew) {
          const rec = { id: newId(), title, text: String(data.text || ''), store: data.store, type: data.type, source: 'You added it', updated: 'Now', confidence: 'Explicit', pinned: false };
          memories().unshift(rec); PM51.setSel(ID, rec.id);
          if (!SHOW[showValue()](rec)) { commitSettingValue(S.show, 'All'); o55Notify(S.show, 'All'); }
        } else Object.assign(x, { title, text: String(data.text || ''), store: data.store, type: data.type, updated: 'Now', confidence: x.confidence === 'Observed' ? 'Confirmed' : x.confidence });
        saveState(); refresh(); PM51.toast(isNew ? 'Memory added' : 'Memory saved', title);
      }
    });
  }
  function moveStore(x) {
    PM51.panel({
      title: 'Move to store', subtitle: x.title,
      body: PM51.panelSection('Store', PM51.field('Keep this memory in', PM51.select(x.store, STORE_CHOICES.map(c => [c.value, c.label]), { label: 'Store' }), 'Project memories stay with this workspace. Memories about you follow you everywhere. Thread memories expire with the conversation.')),
      primaryLabel: 'Move', onPrimary: wrap => { const sel = wrap.querySelector('select'); if (sel) x.store = sel.value; x.updated = 'Now'; saveState(); refresh(); PM51.toast('Memory moved', `${x.title} is now a ${storeLabel(x.store).toLowerCase()} memory.`); }
    });
  }
  function viewSource(x) {
    PM51.panel({
      title: `Where “${x.title}” came from`,
      body: PM51.panelSection('Source', PM51.kv([['Learned from', x.source], ['Store', storeLabel(x.store)], ['Type', x.type], ['Confidence', x.confidence], ['Updated', x.updated]]))
        + PM51.panelSection('Memory text', `<div class="pm51-example">${h(x.text || '')}</div>`)
        + PM51.panelSection('What this means', `<p class="pm51-ps-text">${h(x.confidence === 'Explicit' ? 'You stated this directly, so the assistant treats it as a firm instruction.' : x.confidence === 'Confirmed' ? 'This was recorded from a decision you confirmed.' : 'The assistant noticed this on its own. It may re-check it before relying on it.')}</p>`)
    });
  }
  function forget(x) {
    PM51.confirm(`Forget “${x.title}”?`, 'The assistant stops using it. It stays under Keeping & privacy for 30 days in case you change your mind.', 'Forget', () => {
      const m = mem(); const i = memories().indexOf(x); if (i >= 0) memories().splice(i, 1); m.forgotten.push(x);
      m.candidates = m.candidates.filter(c => c.id !== x.id);
      PM51.setSel(ID, (shownList()[0] || {}).id); saveState(); refresh(); PM51.toast('Memory forgotten', `${x.title} can be restored for 30 days.`, 'info');
    });
  }
  function remove(x) {
    PM51.confirm(`Delete “${x.title}”?`, 'This removes the memory for good. Forget instead if you might want it back.', 'Delete', () => {
      const i = memories().indexOf(x); if (i >= 0) memories().splice(i, 1);
      mem().candidates = mem().candidates.filter(c => c.id !== x.id);
      PM51.setSel(ID, (shownList()[0] || {}).id); saveState(); refresh(); PM51.toast('Memory deleted', x.title, 'warning');
    }, true);
  }

  /* ---------- Context space -------------------------------------------- */
  function gaugeHtml() {
    const m = mem(); const v = Math.max(0, Math.min(100, Number(m.contextInUse) || 0));
    const start = num(S.start, 70), hard = num(S.hard, 85), low = num(S.low, 15), warnAt = 100 - low;
    const cls = v >= hard ? ' is-hard' : v >= start ? ' is-trim' : '';
    const said = v >= hard ? 'Old context is being squeezed firmly.' : v >= start ? 'Gentle trimming has started.' : 'Plenty of room.';
    return `<div class="o55-mem-gauge">
      <div class="o55-mem-gauge-top"><span class="o55-mem-gauge-value">${v}%</span><span class="o55-mem-gauge-label">of the working space in use in the open chat. ${h(said)}</span></div>
      <div class="o55-mem-bar" role="img" aria-label="${a(`${v}% in use. Trimming starts at ${start}%, trims hard at ${hard}%, warns when ${low}% is left.`)}"><span class="o55-mem-fill${cls}" style="width:${v}%"></span>${[start, hard, warnAt].filter((x, i, all) => all.indexOf(x) === i).map(x => `<span class="o55-mem-tick" style="left:${Math.max(0, Math.min(100, x))}%"></span>`).join('')}</div>
      <ul class="o55-mem-legend"><li>Trimming starts at <b>${start}%</b></li><li>Trims hard at <b>${hard}%</b></li><li>Warns when <b>${low}%</b> is left</li></ul>
      <div class="o55-mem-gauge-actions">${PM51.home(S.squeeze, PM51.btn({ label: 'Squeeze now', icon: 'bolt', small: true, action: 'pm51-memory-squeeze', disabled: v < 5, reason: 'There is nothing old enough to squeeze yet.' }), 'span')}<span class="o55-quiet-line">Summarizes the older part of the open chat right away.</span></div>
    </div>`;
  }
  function contextTab() {
    return PM51.section({ title: 'Context in use', help: 'How full the assistant\'s working space is right now. When it fills, older parts are summarized so the run can go on.', body: gaugeHtml() + PM51.bound.rows([S.meter]) })
      + PM51.slot();
  }

  /* ---------- Instructions --------------------------------------------- */
  const docText = id => { const v = String(PM51.value(id) || ''); return id === S.appRules && v === APP_RULES_SEED ? '' : v; };
  function docRow(id) {
    const s = PM51.setting(id); if (!s) return '';
    const text = docText(id).trim(); const row = PM51.rowMeta(id) || {};
    const first = text.split('\n').find(l => l.trim()) || '';
    const lines = text ? text.split('\n').filter(l => l.trim()).length : 0;
    return PM51.home(id, PM51.rows([{ label: PM51.rowLabel(s), help: PM51.rowHelp(s), control: `<span class="o55-mem-doc"><span class="o55-mem-doc-preview${text ? '' : ' is-empty'}">${h(text ? `${first}${lines > 1 ? ` · ${lines} lines` : ''}` : (row.placeholder || 'Nothing yet'))}</span></span>`, action: { label: text ? 'Edit' : 'Write', icon: 'edit', action: 'pm51-memory-rules', data: { setting: id } } }]), 'div');
  }
  function instructionsTab() {
    const mode = String(PM51.value(S.packs) || 'active');
    const packs = PACKS.map(p => Object.assign({}, p, { now: p.state() })).filter(p => mode === 'all' ? true : mode === 'active' ? p.now === 'Loaded' : p.now !== 'Switched off');
    const tone = st => st === 'Loaded' ? 'ready' : st === 'Could not load' ? 'attention' : 'neutral';
    return PM51.section({ title: 'Standing instructions', help: 'Rules every run reads, in every project and in this one.', body: docRow(S.appRules) + docRow(S.projectRules) + PM51.bound.rows([S.packing, S.reuse]) })
      + PM51.slot()
      + PM51.section({
        title: 'Rule packs', help: 'Every set of standing rules, where it comes from, and whether it loaded.',
        body: `<div class="o55-toolbar o55-mem-toolbar">${PM51.bound.select(S.packs, { prefix: 'Show', width: 190 })}<span class="o55-toolbar-spacer"></span><span class="o55-quiet-line">${packs.length} of ${PACKS.length}</span></div>`
          + (packs.length ? PM51.rows(packs.map(p => ({ label: p.name, help: p.why ? `${p.from}. ${p.why}` : p.from, control: PM51.status(p.now, tone(p.now)), action: p.id === 'app' || p.id === 'project' ? { label: 'Open', icon: 'edit', action: 'pm51-memory-rules', data: { setting: p.id === 'app' ? S.appRules : S.projectRules } } : p.id === 'persona' ? { label: 'Personas', icon: 'arrowRight', action: 'pm51-go', data: { domain: 'memory', workspace: 'personas' } } : null }))) : PM51.note('No rule pack matches this view.', 'info'))
      });
  }

  /* ---------- Finding memories ----------------------------------------- */
  const AGE = s => { const t = String(s || '').toLowerCase(); if (t === 'now' || t === 'today') return 0; if (t === 'yesterday') return 1440; const m = /(\d+)\s*(minute|hour|day|week|month|year)/.exec(t); if (!m) return 99999; return Number(m[1]) * { minute: 1, hour: 60, day: 1440, week: 10080, month: 43200, year: 525600 }[m[2]]; };
  function search(q) {
    const r = mem().retrieval;
    if (!memoryOn()) return [];
    const max = Math.max(1, Math.round(num(S.maxMem, 5)));
    const strategy = String(PM51.value(S.strategy) || 'hybrid');
    const meaning = strategy === 'recency' ? 0 : Math.max(0, Math.min(1, num(S.balance, 0.5)));
    const pinnedUnconfirmed = on(PM51.value(S.pinnedUnconfirmed));
    const words = String(q || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
    const out = [];
    for (const x of memories()) {
      const unconfirmed = x.confidence === 'Observed';
      if (x.pinned && unconfirmed && !pinnedUnconfirmed) continue;
      const hay = (x.title + ' ' + x.text).toLowerCase();
      const exact = words.filter(w => hay.includes(w));
      const near = meaning >= 0.35 ? words.filter(w => !hay.includes(w) && (NEAR[w] || []).some(n => hay.includes(n))) : [];
      const pinned = x.pinned && r.preferPinned;
      let score = exact.length * (2 - meaning) + near.length * (1 + meaning) + (pinned ? 1 : 0) - (unconfirmed ? 0.5 : 0);
      if (strategy !== 'semantic') score += Math.max(0, 1.5 - AGE(x.updated) / 20160) * (strategy === 'recency' ? 3 : 1);
      const reason = exact.length ? `matches “${exact.slice(0, 2).join('”, “')}”` : near.length ? `close in meaning to “${near[0]}”` : pinned ? 'pinned, so always considered' : '';
      if (reason || (strategy === 'recency' && words.length === 0)) out.push({ x, score, reason: reason + (unconfirmed ? ' · unconfirmed' : '') });
    }
    return out.sort((p, q2) => q2.score - p.score).slice(0, max).map(o => ({ id: o.x.id, title: o.x.title, store: o.x.store, type: o.x.type, reason: o.reason }));
  }
  function rankingNow() {
    const strategy = String(PM51.value(S.strategy) || 'hybrid'), mode = String(PM51.value(S.mode) || 'automatic');
    const pct = Math.round(num(S.balance, 0.5) * 100);
    return PM51.kv([
      ['Brought in', PM51.valueLabel(S.mode, mode)],
      ['Matched by', strategy === 'recency' ? 'Most recent first' : strategy === 'semantic' ? `Meaning (${pct}% meaning, ${100 - pct}% exact words)` : `Meaning and recency (${pct}% meaning)`],
      ['At most', `${Math.round(num(S.maxMem, 5))} memories, ${Math.round(num(S.memBudget, 350))} tokens per reply`],
      ['Pinned', mem().retrieval.preferPinned ? 'Considered before anything else' : 'Ranked like any other memory'],
      ['Pinned but unconfirmed', on(PM51.value(S.pinnedUnconfirmed)) ? 'Used' : 'Left out until confirmed'],
      ['Thread memories', 'Only used in the thread that created them']
    ]);
  }
  function retrievalTab() {
    const m = mem(); const r = m.retrieval; const results = m.results;
    const manual = String(PM51.value(S.mode) || '') === 'manual';
    const tryBody = `<div class="pm51-memory-try">${PM51.input(m.query, { action: 'pm51-memory-query', placeholder: 'For example: what are the rules for installing provider tools?', label: 'Question' })}${PM51.btn({ label: 'Search memories', icon: 'search', primary: true, action: 'pm51-memory-search' })}</div>`
      + (results ? (results.length
        ? (manual ? PM51.note('Memories are brought in only when you ask, so in a chat these would wait for you.', 'info') : '') + PM51.list(results.map((x, i) => ({ title: x.title, meta: `${storeLabel(x.store)} · ${x.type} · ${x.reason}`, avatar: `<span class="pm51-memory-rank">${i + 1}</span>`, action: 'pm51-memory-open', data: { id: x.id }, end: icon('chevron') })))
        : PM51.note(memoryOn() ? 'No memory fits that question. The assistant would answer from the conversation alone.' : 'Memory is off, so nothing would be brought in.'))
        : '');
    return (memoryOn() ? '' : PM51.note('Memory is off, so none of this is used until you turn it on under Memories.', 'info'))
      + PM51.section({ title: 'Try a question', help: 'See which memories the assistant would bring into its reply, with the settings below.', body: tryBody })
      + PM51.slot()
      + PM51.section({
        title: 'Pinned and conflicting memories',
        body: PM51.rows([
          { label: 'Prefer pinned memories', help: 'Pinned memories are considered before anything else.', control: PM51.toggle(!!r.preferPinned, { action: 'pm51-memory-retrieval-toggle', data: { key: 'preferPinned' }, label: 'Prefer pinned memories' }) },
          { label: 'When memories disagree', help: 'What happens when two memories point different ways.', control: PM51.select(r.disagree, ['Ask me', 'Newest wins', 'Show both'], { action: 'pm51-memory-retrieval-select', data: { key: 'disagree' }, label: 'When memories disagree' }) },
          { label: 'Memories that could disagree', help: 'Pairs of the same kind that might contradict each other.', action: { label: 'Review', icon: 'eye', action: 'pm51-memory-conflicts' } }
        ])
      })
      + PM51.advanced([
        PM51.section({ title: 'How ranking works now', help: 'Written from your settings above.', body: rankingNow() }),
        PM51.section({ title: 'Never used', body: PM51.kv([['Secrets', 'Credentials, keys and secret files'], ['Large sources', 'Summarized, with a pointer to the original'], ['Forgotten memories', 'Never, even while they can still be restored']]) })
      ].join(''));
  }

  /* ---------- Keeping & privacy ---------------------------------------- */
  function protectedSummary() {
    const p = mem().privacy.protect;
    const parts = [p.pinned ? 'Pinned' : '', p.rules ? 'Rules' : '', p.decisions ? 'Decisions' : '', p.preferences ? 'Preferences' : ''].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'None';
  }
  function retentionTab() {
    const m = mem(); const n = m.candidates.length;
    return PM51.slot()
      + PM51.section({
        title: 'Who else can read memories', help: 'Helpers are short-lived agents a run starts for one task. Crews are the named teams in Personas & Crews.',
        body: PM51.bound.rows([S.helpers]) + PM51.rows([
          { label: 'Crews can read project memories', help: 'Crew members see project rules and decisions. Memories about you stay private.', control: PM51.toggle(!!m.privacy.shareWithCrews, { action: 'pm51-memory-share', label: 'Crews can read project memories' }) },
          { label: 'What helpers start with', help: 'Whether a helper starts from a clean state is set in Personas & Crews.', action: { label: 'Open', icon: 'arrowRight', action: 'pm51-memory-isolation' } }
        ])
      })
      + PM51.section({
        title: 'Forget', help: 'Old working context the assistant probably does not need any more.',
        body: PM51.rows([
          { label: 'Candidates to forget', value: n ? `${n} candidate${n === 1 ? '' : 's'}` : 'Nothing to review', muted: !n, action: n ? { label: 'Review', action: 'pm51-memory-candidates', icon: 'eye' } : null },
          m.forgotten.length ? { label: 'Recently forgotten', help: 'Kept for 30 days in case you change your mind.', value: `${m.forgotten.length}`, action: { label: 'Restore', action: 'pm51-memory-restore', icon: 'restore' } } : null,
          { label: 'Protected memories', help: 'Never forgotten automatically, whatever the fade times say.', value: protectedSummary(), action: { label: 'Change', action: 'pm51-memory-protected' } }
        ])
      })
      + PM51.advanced(PM51.section({ title: 'Export and delete', body: PM51.rows([
        { label: 'Export memories', help: 'A plain file of every memory, without secrets.', action: { label: 'Export', action: 'pm51-memory-export', icon: 'download' } },
        { label: 'Delete all memories', help: 'Removes every memory in this workspace. Cannot be undone.', action: { label: 'Delete all', action: 'pm51-memory-delete-all', icon: 'trash', danger: true } }
      ]) }));
  }

  /* ---------- Sources -------------------------------------------------- */
  function sourcesTab() {
    const m = mem();
    const rows = m.sources.map(([label, onNow], i) => label === 'Chat history'
      ? { label, help: 'Earlier chats in this workspace. Off keeps each chat on its own.', control: PM51.bound.select(S.history, { label: 'Chat history', width: 160, choices: String(PM51.value(S.history)) === 'custom' ? ['none', 'recent', 'full', 'custom'] : ['none', 'recent', 'full'] }) }
      : { label, help: SOURCE_HELP[label] || '', control: PM51.toggle(!!onNow, { action: 'pm51-memory-source', data: { index: i }, label }) });
    return PM51.section({ title: 'What can feed context', help: 'Turn off anything the assistant should not read on its own.', body: PM51.rows(rows) })
      + PM51.advanced([
        PM51.section({ title: 'Single owners', help: 'Each shared resource is managed in exactly one place. These links take you there.', body: PM51.rows((m.owners || []).map(([resource, manager, domain, workspace]) => ({ label: resource, value: manager, action: { label: 'Open', action: 'pm51-go', data: { domain, workspace }, icon: 'arrowRight' } }))) }),
        PM51.section({ title: 'Coverage', help: 'Confirms that every source above has an owner feeding it.', action: { label: 'Check coverage', small: true, icon: 'test', action: 'pm51-memory-coverage' }, body: PM51.kv([['Sources on', `${m.sources.filter(s => s[1]).length} of ${m.sources.length}`], ['Owners linked', String((m.owners || []).length)], ['Last check', m.coverage || 'Not run yet']]) }),
        PM51.section({ title: 'What is included when', body: PM51.kv([['Always', 'This chat, the project\'s rules, the active Goal'], ['When a question needs it', 'Earlier chats, files, memories, manager records'], ['Never', 'Credential values, secret files, unrelated personal data'], ['Large sources', 'Summarized, with a pointer and a size limit']]) })
      ].join(''));
  }

  function render() {
    const tab = PM51.tab(ID, 'memories');
    const body = tab === 'context' ? contextTab() : tab === 'instructions' ? instructionsTab() : tab === 'retrieval' ? retrievalTab() : tab === 'retention' ? retentionTab() : tab === 'sources' ? sourcesTab() : memoriesTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset memory settings', action: 'pm51-memory-reset' }, { label: 'How memory works', action: 'pm51-memory-help' }] });
  }
  PM51.manager('memory', { render });
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  [S.on, S.show, S.start, S.hard, S.low, S.packs, S.reuse, S.appRules, S.projectRules, S.strategy, S.balance, S.mode, S.maxMem, S.memBudget, S.pinnedUnconfirmed].forEach(id => PM51.watch(id, () => { if (mem().results) mem().results = search(mem().query); refresh(); }));
  PM51.watch(S.history, v => { const s = mem().sources.find(x => x[0] === 'Chat history'); if (s) s[1] = String(v) !== 'none'; saveState(); refresh(); });
  [S.start, S.hard].forEach(id => PM51.watch(id, () => { if (num(S.start, 70) >= num(S.hard, 85)) PM51.toast('Check the two thresholds', `Trimming should start below ${num(S.hard, 85)}%, where it trims hard.`, 'info'); }));
  /* the protected share is one number: the row and the split keep each other in step */
  PM51.watch(S.immune, v => {
    const b = PM51.value(S.buckets); if (!b || typeof b !== 'object') return;
    const n = Number(v); if (!Number.isFinite(n)) return;
    const next = Object.assign({}, b); const diff = n - Number(next.immune || 0); next.immune = n; if ('history' in next) next.history = Math.max(0, Number(next.history || 0) - diff);
    if (commitSettingValue(S.buckets, next)) { saveState(); refreshSettingRow(S.buckets); }
  });

  /* ---------- actions -------------------------------------------------- */
  PM51.on('memory-add', () => editMemory(null));
  PM51.on('memory-edit', el => { const x = memories().find(o => o.id === ds(el, 'id')); if (x) editMemory(x); });
  PM51.on('memory-confirm', el => { const x = memories().find(o => o.id === ds(el, 'id')); if (!x) return; x.confidence = 'Confirmed'; x.updated = 'Now'; saveState(); if (!SHOW[showValue()](x)) PM51.setSel(ID, (shownList()[0] || {}).id); refresh(); PM51.toast('Memory confirmed', `${x.title} is now used like any other confirmed note.`); });
  PM51.on('memory-show-all', () => { if (commitSettingValue(S.show, 'All')) { saveState(); o55Notify(S.show, 'All'); } refresh(); });
  PM51.on('memory-open', el => { closeOverlay(); const id = ds(el, 'id'); const x = memories().find(o => o.id === id); if (x && !SHOW[showValue()](x) && commitSettingValue(S.show, 'All')) saveState(); PM51.setSel(ID, id); PM51.setTab(ID, 'memories'); PM51.refresh(ID); });
  PM51.on('memory-diagnostics', () => PM51.check({ title: 'Memory diagnostics', steps: [
    { title: 'Memory stores readable', desc: `${memories().length} memories across the project, you, and this thread` },
    { title: 'Search index', desc: 'Rebuilt whenever a memory changes', status: 'Example', tone: 'info' },
    { title: 'Fade timers', desc: 'Unused notes fade by the times under Keeping & privacy', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('memory-squeeze', () => {
    const m = mem(); const before = Number(m.contextInUse) || 0; if (before < 5) return;
    m.contextInUse = Math.max(8, Math.round(before * 0.55)); saveState();
    const fill = root.querySelector('[data-pm51-manager="context-memory"] .o55-mem-fill');
    if (fill) { fill.style.width = m.contextInUse + '%'; window.setTimeout(refresh, motionReduced() ? 0 : 720); } else refresh();
    PM51.toast('Squeezed', `The open chat went from ${before}% to ${m.contextInUse}%. Older turns are now a short summary.`);
  });

  PM51.onInput('memory-query', el => { mem().query = el.value; });
  PM51.on('memory-search', el => {
    const m = mem(); const input = el.closest('.pm51-memory-try')?.querySelector('input'); if (input) m.query = input.value;
    if (!String(m.query || '').trim()) { PM51.toast('Type a question first', 'Then search to see which memories would be used.', 'info'); return; }
    m.results = search(m.query); saveState(); refresh();
  });
  PM51.on('memory-retrieval-toggle', el => { const r = mem().retrieval; const k = ds(el, 'key'); r[k] = !r[k]; if (mem().results) mem().results = search(mem().query); saveState(); refresh(); });
  PM51.onChange('memory-retrieval-select', el => { const r = mem().retrieval; r[ds(el, 'key')] = el.value; if (mem().results) mem().results = search(mem().query); saveState(); });
  PM51.on('memory-conflicts', () => {
    const pairs = [];
    for (const x of memories()) for (const o of conflictsFor(x)) if (x.id < o.id) pairs.push([x, o]);
    const d = mem().retrieval.disagree;
    PM51.panel({
      title: 'Memories that could disagree', subtitle: 'Pairs of the same kind that might contradict each other.',
      body: PM51.panelSection('Pairs', pairs.length ? PM51.list(pairs.map(([x, o]) => ({ title: `${x.title} · ${o.title}`, meta: `${storeLabel(x.store)} · ${x.type}`, action: 'pm51-memory-open', data: { id: x.id } }))) : PM51.note('No pairs right now.'))
        + PM51.panelSection('When two disagree', PM51.kv([['Explicit instruction', 'Wins over anything noticed'], ['Confirmed decision', 'Wins over an older decision'], ['Unconfirmed note', 'Never overrides a rule'], ['Still unclear', d === 'Ask me' ? 'The assistant asks you' : d === 'Newest wins' ? 'The newer memory wins' : 'Both are shown']]))
    });
  });

  /* the rule documents: a real editor, never a one-line box */
  PM51.on('memory-rules', el => {
    const id = ds(el, 'setting'); const s = PM51.setting(id); if (!s) return;
    const project = id === S.projectRules; const row = PM51.rowMeta(id) || {};
    PM51.panel({
      title: PM51.rowLabel(s), eyebrow: 'Standing instructions', icon: 'file', size: 'wide',
      summary: project ? 'Saved with the code in .puppet-master/project-rules.md, so everyone on the project gets the same rules.' : 'Every run reads these, in every project. The first version came from your AGENTS.md.',
      body: `<textarea class="o55-mem-editor" spellcheck="false" aria-label="${a(PM51.rowLabel(s))}" placeholder="${a(project ? 'For example:\n- Run pnpm test before saying something is done.\n- Never edit files under vendor/.' : row.placeholder || '')}" data-autofocus>${h(docText(id))}</textarea>`
        + PM51.note('Write plain sentences or a list. Keep it short: every run reads all of it.', 'info'),
      primaryLabel: 'Save', onPrimary: w => {
        const v = w.querySelector('.o55-mem-editor').value.replace(/\r\n/g, '\n');
        if (!commitSettingValue(id, v)) return false;
        saveState(); o55Notify(id, v); PM51.toast('Rules saved', project ? 'Written to .puppet-master/project-rules.md (example only).' : 'Every new run reads them.');
      }
    });
  });

  /* how the working space is split: five shares that add up to 100 */
  PM51.on('memory-split', () => {
    const cur = PM51.value(S.buckets); const base = cur && typeof cur === 'object' ? cur : {};
    const vals = PARTS.map(([k]) => Number(base[k]) || 0);
    const bar = () => `<div class="o55-mem-split-bar" aria-hidden="true">${vals.map((v, i) => `<span style="width:${Math.max(0, v)}%;background:${SPLIT_COLORS[i]}"></span>`).join('')}</div>`;
    const total = () => vals.reduce((x, y) => x + y, 0);
    const totalLine = () => { const t = total(); return `<p class="o55-mem-split-total${t === 100 ? '' : ' is-off'}" aria-live="polite">${t === 100 ? 'Adds up to 100%.' : `Adds up to ${t}%. Make it 100%.`}</p>`; };
    const wrap = PM51.panel({
      title: 'How the space is split', eyebrow: 'Context space', icon: 'layers',
      summary: 'Shares of the working space for each kind of content. Protected is the same number as "Never squeeze this share".',
      body: PM51.panelSection('Shares', `<div class="o55-mem-split-preview">${bar()}</div><div class="o55-mem-split-rows">${PARTS.map(([k, label, help], i) => `<div class="o55-mem-split-row"><i style="background:${SPLIT_COLORS[i]}"></i><div><div class="pm51-row-label">${h(label)}</div><div class="pm51-row-help">${h(help)}</div></div><label class="o55-num"><input class="text-control o55-mem-split-in" type="number" min="0" max="100" step="1" value="${vals[i]}" data-i="${i}" aria-label="${a(label + ' share')}"><span class="o55-unit">%</span></label></div>`).join('')}</div><div class="o55-mem-split-sum">${totalLine()}</div>`),
      primaryLabel: 'Save', onPrimary: w => {
        if (total() !== 100) { PM51.toast('Not 100% yet', `The shares add up to ${total()}%.`, 'info'); return false; }
        const next = Object.assign({}, base); PARTS.forEach(([k], i) => { next[k] = vals[i]; });
        if (!commitSettingValue(S.buckets, next)) return false;
        commitSettingValue(S.immune, vals[0]); saveState(); refreshSettingRow(S.buckets); refreshSettingRow(S.immune);
        PM51.toast('Split saved', `${vals[0]}% is protected from squeezing.`);
      }
    });
    wrap.addEventListener('input', e => {
      const t = e.target; if (!t.classList || !t.classList.contains('o55-mem-split-in')) return;
      vals[Number(t.dataset.i)] = Math.max(0, Math.min(100, Math.round(Number(t.value) || 0)));
      wrap.querySelector('.o55-mem-split-preview').innerHTML = bar(); wrap.querySelector('.o55-mem-split-sum').innerHTML = totalLine();
    });
  });

  /* tidy up: the real chores, each with its own button */
  const CHORES = [
    ['index', 'Rebuild the search index', 'Makes "Try a question" and chat lookups fast and current again.', 'refresh', () => `Index rebuilt for ${memories().length} memories.`],
    ['merge', 'Merge duplicates', 'Two notes that say the same thing become one.', 'layers', () => 'No duplicates found.'],
    ['recheck', 'Re-check unconfirmed notes', 'The assistant looks again at notes nobody has confirmed.', 'test', () => `${memories().filter(SHOW.Unverified).length} unconfirmed notes checked; none changed.`],
    ['compress', 'Compress old months', 'Old working context becomes a short summary per month.', 'archive', () => '2 months compressed.'],
    ['prune', 'Prune faded notes', 'Notes past their fade time go to Recently forgotten, where they can still be restored.', 'trash', () => 'Nothing had faded yet.']
  ];
  const tidyBody = () => { const t = mem().tidy; const n = mem().candidates.length; return PM51.panelSection('Chores', PM51.rows(CHORES.map(([k, label, help, ic]) => ({ label, help: t[k] ? `${help} Last run ${t[k]}.` : help, action: { label: t[k] ? 'Run again' : 'Run', icon: ic, action: 'pm51-memory-chore', data: { chore: k } } })).concat([{ label: 'Review candidates to forget', help: n ? `${n} waiting for you to keep or forget.` : 'Nothing waiting.', action: n ? { label: 'Review', icon: 'eye', action: 'pm51-memory-candidates' } : null }]))) + PM51.note('Example only: these chores change nothing outside this preview.', 'info'); };
  PM51.on('memory-tidy', () => {
    const wrap = PM51.panel({ title: 'Tidy up memories', eyebrow: 'Keeping & privacy', icon: 'wand', summary: 'Keep memory quick and accurate. None of these delete a note for good.', body: tidyBody() });
    wrap._pm51Rerender = () => { const b = wrap.querySelector('.pm51-panel-body'); if (b) b.innerHTML = tidyBody(); };
  });
  PM51.on('memory-chore', el => {
    const c = CHORES.find(x => x[0] === ds(el, 'chore')); if (!c) return;
    mem().tidy[c[0]] = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); saveState();
    const wrap = el.closest('.pm51-drawer-wrap'); if (wrap && wrap._pm51Rerender) wrap._pm51Rerender();
    PM51.toast(c[1], c[4](), 'success');
  });

  PM51.on('memory-share', () => { const p = mem().privacy; p.shareWithCrews = !p.shareWithCrews; saveState(); refresh(); });
  PM51.on('memory-isolation', () => { if (PM51.revealSetting) PM51.revealSetting('branching.subagents.child-state-isolation'); });
  PM51.on('memory-protected', () => {
    const p = mem().privacy.protect;
    const rows = [['pinned', 'Pinned memories', 'Anything you pinned.'], ['rules', 'Rules', 'Instructions the assistant must follow.'], ['decisions', 'Decisions', 'Choices you confirmed.'], ['preferences', 'Preferences', 'How you like things done.']];
    PM51.panel({
      title: 'Protected memories', subtitle: 'Protected memories are never forgotten automatically.',
      body: PM51.panelSection('Protect', PM51.rows(rows.map(([key, label, help]) => ({ label, help, control: PM51.toggle(!!p[key], { action: 'pm51-memory-protect', data: { key }, label }) })))),
      primaryLabel: 'Done', onPrimary: () => refresh()
    });
  });
  PM51.on('memory-protect', el => { const p = mem().privacy.protect; const k = ds(el, 'key'); p[k] = !p[k]; el.classList.toggle('on', p[k]); el.setAttribute('aria-checked', p[k] ? 'true' : 'false'); saveState(); });
  PM51.on('memory-candidates', () => {
    const body = () => { const c = mem().candidates; return c.length
      ? PM51.panelSection('Review each one', PM51.list(c.map(x => ({ title: x.title, meta: `${x.meta} · ${x.why}`, end: `<span class="pm51-memory-pair">${PM51.btn({ label: 'Keep', small: true, action: 'pm51-memory-candidate', data: { id: x.id, keep: '1' } })}${PM51.btn({ label: 'Forget', small: true, action: 'pm51-memory-candidate', data: { id: x.id, keep: '0' } })}</span>` }))))
      : PM51.panelSection('Review each one', PM51.note('Nothing left to review.')); };
    const wrap = PM51.panel({ title: 'Candidates to forget', subtitle: 'Keep anything that still matters. Forgotten items stay recoverable for 30 days.', body: body(), primaryLabel: 'Done', onPrimary: () => refresh() });
    wrap._pm51Rerender = () => { const b = wrap.querySelector('.pm51-panel-body'); if (b) b.innerHTML = body(); };
  });
  PM51.on('memory-candidate', el => {
    const m = mem(); const id = ds(el, 'id'); const keep = ds(el, 'keep') === '1';
    const i = m.candidates.findIndex(c => c.id === id); if (i < 0) return;
    const [c] = m.candidates.splice(i, 1);
    if (!keep) {
      const j = memories().findIndex(x => x.id === c.id);
      if (j >= 0) m.forgotten.push(memories().splice(j, 1)[0]);
      else m.forgotten.push({ id: c.id, title: c.title, store: 'Thread', type: 'Working context', text: c.why, source: 'Tool output', updated: 'Now', confidence: 'Observed', pinned: false });
      if (PM51.sel(ID) === c.id) PM51.setSel(ID, (shownList()[0] || {}).id);
    }
    saveState();
    const wrap = el.closest('.pm51-drawer-wrap'); if (wrap && wrap._pm51Rerender) wrap._pm51Rerender();
    refresh();
  });
  PM51.on('memory-restore', () => {
    const body = () => { const f = mem().forgotten; return f.length
      ? PM51.panelSection('Recently forgotten', PM51.list(f.map(x => ({ title: x.title, meta: `${storeLabel(x.store)} · ${x.type}`, end: PM51.btn({ label: 'Restore', small: true, icon: 'restore', action: 'pm51-memory-unforget', data: { id: x.id } }) }))))
      : PM51.panelSection('Recently forgotten', PM51.note('Nothing to restore.')); };
    const wrap = PM51.panel({ title: 'Recently forgotten', subtitle: 'Restored memories go back to their store unchanged.', body: body(), primaryLabel: 'Done', onPrimary: () => refresh() });
    wrap._pm51Rerender = () => { const b = wrap.querySelector('.pm51-panel-body'); if (b) b.innerHTML = body(); };
  });
  PM51.on('memory-unforget', el => {
    const m = mem(); const i = m.forgotten.findIndex(x => x.id === ds(el, 'id')); if (i < 0) return;
    const [x] = m.forgotten.splice(i, 1); x.updated = 'Now'; memories().unshift(x); saveState();
    const wrap = el.closest('.pm51-drawer-wrap'); if (wrap && wrap._pm51Rerender) wrap._pm51Rerender();
    refresh(); PM51.toast('Memory restored', x.title);
  });
  PM51.on('memory-export', () => PM51.panel({
    title: 'Export memories', subtitle: 'A plain file you can read, keep, or bring into another workspace.',
    body: PM51.panelSection('What is included', PM51.kv([['Memories', String(memories().length)], ['Stores', 'Project and you (thread memories are left out)'], ['Format', 'Plain text or JSON · no secrets']])) + PM51.note('Saving a file needs the desktop app. Nothing is written in this preview.'),
    primaryLabel: 'Save file', onPrimary: () => PM51.toast('Nothing saved', 'Example data only. Saving a file needs the desktop app.', 'info')
  }));
  PM51.on('memory-delete-all', () => PM51.confirm('Delete all memories?', 'Every memory in this workspace is removed, including pinned rules. This cannot be undone.', 'Delete all', () => {
    state.memories = []; const m = mem(); m.candidates = []; m.forgotten = []; m.results = null; PM51.setSel(ID, ''); saveState(); refresh(); PM51.toast('All memories deleted', 'The assistant starts fresh in this workspace.', 'warning');
  }, true));

  PM51.on('memory-source', el => { const s = mem().sources[Number(ds(el, 'index'))]; if (s) s[1] = !s[1]; saveState(); refresh(); });
  PM51.on('memory-coverage', () => { const m = mem(); m.coverage = `${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} today`; saveState(); PM51.check({ title: 'Coverage check', steps: m.sources.map(([label, onNow]) => ({ title: label, desc: onNow ? (SOURCE_HELP[label] || '') : 'Turned off, so not checked', status: onNow ? 'Checked' : 'Off', tone: onNow ? 'ready' : 'off' })).concat([{ title: 'Owners linked', desc: `${(m.owners || []).length} shared resources point at their managers`, status: 'Checked', tone: 'ready' }]) }); refresh(); });

  PM51.on('memory-reset', () => PM51.confirm('Reset memory settings?', 'Pinned and conflicting memories, privacy and source choices go back to their defaults. Your memories are kept.', 'Reset', () => {
    const m = mem(); m.retrieval = { preferPinned: true, disagree: 'Ask me' }; m.privacy = { shareWithCrews: true, protect: { pinned: true, rules: true, decisions: true, preferences: false } };
    m.sources = clone(DATA.memory.sources); m.results = null; m.query = ''; saveState(); refresh(); PM51.toast('Memory settings reset', 'Defaults are back. Your memories were not touched.');
  }));
  PM51.on('memory-help', () => PM51.panel({
    title: 'How memory works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">The assistant keeps short notes about this workspace and about you. Before it answers, it looks for notes that fit the question and reads them first.</p>')
      + PM51.panelSection('Three stores', PM51.kv([['Project', 'Rules and decisions about this workspace. Crews can read them if you allow it.'], ['You', 'Your preferences. They follow you between projects and stay private.'], ['This thread', 'Working context from one conversation. It fades on its own.']]))
      + PM51.panelSection('Memory and context space', '<p class="pm51-ps-text">Memories are kept between chats. The context space is the room one run has to work in; when it fills, older parts of the chat are summarized.</p>')
      + PM51.panelSection('You stay in control', '<p class="pm51-ps-text">Confirm what the assistant noticed, pin what matters, edit anything, and forget what no longer applies. Forgotten memories can be restored for 30 days.</p>')
  }));
})();
