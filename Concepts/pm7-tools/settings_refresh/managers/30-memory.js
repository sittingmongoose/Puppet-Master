/* Context & Memory — memories, retrieval, retention & privacy, sources.
   The former Single Owners workspace lives on as an Advanced reference inside Sources. */
(function () {
  const ID = 'context-memory';
  const KEY = 'memory-context-instructions';
  const TABS = [
    { id: 'memories', label: 'Memories' },
    { id: 'retrieval', label: 'Retrieval' },
    { id: 'retention', label: 'Retention & Privacy' },
    { id: 'sources', label: 'Sources' }
  ];
  const STORE_LABEL = { Project: 'Project', User: 'You', Thread: 'This thread' };
  const STORE_CHOICES = [{ value: 'Project', label: 'Project' }, { value: 'User', label: 'You' }, { value: 'Thread', label: 'This thread' }];
  const TYPES = ['Rule', 'Decision', 'Preference'];
  const STOP = new Set(['the', 'and', 'for', 'are', 'what', 'which', 'this', 'that', 'with', 'from', 'about', 'how', 'should', 'does', 'have', 'our', 'your', 'when', 'where', 'into', 'rules', 'rule']);
  const SOURCE_HELP = {
    'Project files': 'Files in this workspace, read when a question needs them.',
    'Plans': 'Named plans and their acceptance criteria.',
    'Chat history': 'Earlier threads in this workspace.',
    'Tool output': 'What tests, terminals, and the browser reported.',
    'Manager records': 'Settings and status from other managers, such as connected services.'
  };
  const CANDIDATES = [
    { id: 'm4', title: 'Temporary build path', meta: 'This thread · 8 minutes ago', why: 'A scratch path from tool output that stops being true when the build folder moves.' },
    { id: 'cand-port', title: 'Dev server on port 5174', meta: 'This thread · 2 days ago', why: 'Only mattered for one debugging session.' },
    { id: 'cand-names', title: 'Draft names for the tab motion study', meta: 'This thread · 5 days ago', why: 'The final names now live in the plan.' },
    { id: 'cand-worktree', title: 'Old worktree location', meta: 'This thread · 2 weeks ago', why: 'That worktree was removed.' }
  ];
  const RETENTION = {
    project: ['Until the project is removed', '1 year', '90 days'],
    you: ['Until you forget them', '1 year', '90 days'],
    thread: ['After 90 quiet days', 'After 30 quiet days', 'When the thread closes']
  };
  let seq = 0;
  const newId = () => 'memory-' + Date.now().toString(36) + '-' + (++seq);

  function mem() {
    const m = PM51.s().memory;
    if (!m.retrieval) m.retrieval = { preferPinned: true, max: 5, disagree: 'Ask me' };
    if (!m.retention) m.retention = { project: RETENTION.project[0], you: RETENTION.you[0], thread: RETENTION.thread[0] };
    if (!m.privacy) m.privacy = { shareWithCrews: true, protect: { pinned: true, rules: true, decisions: true, preferences: false } };
    if (!m.candidates) m.candidates = clone(CANDIDATES);
    if (!m.forgotten) m.forgotten = [];
    if (m.query == null) m.query = '';
    return m;
  }
  const memories = () => state.memories || (state.memories = []);
  const selected = () => memories().find(x => x.id === PM51.sel(ID)) || memories()[0];
  const storeLabel = s => STORE_LABEL[s] || s;
  const typeTone = t => t === 'Working context' ? 'neutral' : 'info';
  const refresh = () => PM51.refresh(ID, { swap: false });

  PM51.style(`
#panel-settings .pm51-memory-text { margin: 0; width: 100%; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-size: 12.5px; line-height: 1.55; color: var(--k3-text-2); }
#panel-settings .pm51-memory-try { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#panel-settings .pm51-memory-try .text-control { flex: 1 1 260px; width: auto; max-width: 100%; }
#panel-settings .pm51-memory-rank { font-size: 11px; font-weight: 720; }
#panel-settings .pm51-memory-pair { display: flex; gap: 6px; }
`);

  /* ---------- Memories ------------------------------------------------- */
  function conflictsFor(x) {
    const others = memories().filter(o => o.id !== x.id && o.type === x.type && o.store === x.store && o.title.split(' ')[0] === x.title.split(' ')[0]);
    return others;
  }
  function memoriesTab() {
    const m = mem(); const all = memories(); const cur = selected();
    const stats = PM51.stats([
      { label: 'Memories', value: all.length, help: `${all.filter(x => x.store === 'Project').length} project · ${all.filter(x => x.store === 'User').length} about you · ${all.filter(x => x.store === 'Thread').length} this thread` },
      { label: 'Pinned', value: all.filter(x => x.pinned).length, help: 'Always considered first' },
      { label: 'Context in use', value: `${m.contextInUse} %`, help: 'Of what the assistant can hold at once' }
    ]);
    if (!cur) return stats + PM51.empty('No memories yet', 'Add a memory to give the assistant something to keep in mind.', { label: 'Add memory', action: 'pm51-memory-add', icon: 'plus' });
    const conflicts = conflictsFor(cur);
    const body = PM51.rows([
      { label: 'Store', help: 'Where this memory lives and who can see it.', value: storeLabel(cur.store) },
      { label: 'Source', help: 'How the assistant learned it.', value: cur.source },
      { label: 'Updated', value: cur.updated },
      { label: 'Confidence', help: 'Explicit means you said it. Observed means the assistant noticed it.', value: cur.confidence },
      { label: 'Text', cls: 'is-wrap', control: `<p class="pm51-memory-text">${h(cur.text || '')}</p>` }
    ]) + PM51.advanced([
      PM51.section({ title: 'Conflicts with', help: 'Other memories that could contradict this one.', body: conflicts.length ? PM51.list(conflicts.map(o => ({ title: o.title, meta: `${storeLabel(o.store)} · ${o.type} · ${o.updated}`, action: 'pm51-memory-open', data: { id: o.id } }))) : PM51.note('No conflicts found. Newer explicit memories win when two disagree.') }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Memory id', cur.id], ['Store key', cur.store.toLowerCase()], ['Pinned', cur.pinned ? 'Yes' : 'No'], ['Type', cur.type]]) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-memory-diagnostics' }) + '</div>' })
    ].join(''));
    return stats + PM51.listDetail({
      id: ID, rosterTitle: 'Memories', count: all.length,
      add: { action: 'pm51-memory-add', label: 'Add memory' },
      filter: { placeholder: 'Filter memories', value: (PM51.s().filters || {})[ID] || '' },
      items: all.map(x => ({ id: x.id, title: x.title, meta: [storeLabel(x.store), x.type, x.pinned ? 'Pinned' : ''].filter(Boolean).join(' · '), tone: x.pinned ? 'ready' : undefined, selected: x.id === cur.id, avatar: icon(x.store === 'Thread' ? 'clock' : x.pinned ? 'pin' : 'memory') })),
      detail: {
        title: cur.title, subtitle: `${storeLabel(cur.store)} · ${cur.source}`,
        pill: PM51.pill(cur.type, typeTone(cur.type)) + (cur.pinned ? ' ' + PM51.pill('Pinned', 'ready') : ''),
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-memory-edit', data: { id: cur.id } },
        menu: anchor => memoryMenu(anchor, cur),
        body
      }
    });
  }
  function memoryMenu(anchor, x) {
    PM51.menu(anchor, [
      { label: x.pinned ? 'Unpin' : 'Pin', icon: 'pin', onClick: () => { x.pinned = !x.pinned; saveState(); refresh(); } },
      { label: 'Move to store', icon: 'archive', onClick: () => moveStore(x) },
      { label: 'View source', icon: 'file', onClick: () => viewSource(x) },
      { separator: true },
      { label: 'Forget', icon: 'history', meta: 'Recoverable for 30 days', onClick: () => forget(x) },
      { label: 'Delete', icon: 'trash', danger: true, onClick: () => remove(x) }
    ], x.title);
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
        } else Object.assign(x, { title, text: String(data.text || ''), store: data.store, type: data.type, updated: 'Now' });
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
    PM51.confirm(`Forget “${x.title}”?`, 'The assistant stops using it. It stays under Retention & Privacy for 30 days in case you change your mind.', 'Forget', () => {
      const m = mem(); const i = memories().indexOf(x); if (i >= 0) memories().splice(i, 1); m.forgotten.push(x);
      m.candidates = m.candidates.filter(c => c.id !== x.id);
      PM51.setSel(ID, (memories()[0] || {}).id); saveState(); refresh(); PM51.toast('Memory forgotten', `${x.title} can be restored for 30 days.`, 'info');
    });
  }
  function remove(x) {
    PM51.confirm(`Delete “${x.title}”?`, 'This removes the memory for good. Forget instead if you might want it back.', 'Delete', () => {
      const i = memories().indexOf(x); if (i >= 0) memories().splice(i, 1);
      mem().candidates = mem().candidates.filter(c => c.id !== x.id);
      PM51.setSel(ID, (memories()[0] || {}).id); saveState(); refresh(); PM51.toast('Memory deleted', x.title, 'warning');
    }, true);
  }

  /* ---------- Retrieval ------------------------------------------------ */
  function search(q) {
    const r = mem().retrieval;
    const words = String(q || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
    const out = [];
    for (const x of memories()) {
      const hay = (x.title + ' ' + x.text).toLowerCase();
      const hit = words.filter(w => hay.includes(w));
      if (hit.length) out.push({ x, score: hit.length * 2 + (x.pinned && r.preferPinned ? 1 : 0), reason: `matches “${hit.slice(0, 2).join('”, “')}”` });
      else if (x.pinned && r.preferPinned) out.push({ x, score: 1, reason: 'pinned, so always considered' });
    }
    return out.sort((p, q2) => q2.score - p.score).slice(0, Number(r.max) || 5).map(o => ({ id: o.x.id, title: o.x.title, store: o.x.store, type: o.x.type, reason: o.reason }));
  }
  function retrievalTab() {
    const m = mem(); const r = m.retrieval; const results = m.results;
    const tryBody = `<div class="pm51-memory-try">${PM51.input(m.query, { action: 'pm51-memory-query', placeholder: 'For example: what are the rules for installing provider tools?', label: 'Question' })}${PM51.btn({ label: 'Search memories', icon: 'search', primary: true, action: 'pm51-memory-search' })}</div>`
      + (results ? (results.length
        ? PM51.list(results.map((x, i) => ({ title: x.title, meta: `${storeLabel(x.store)} · ${x.type} · ${x.reason}`, avatar: `<span class="pm51-memory-rank">${i + 1}</span>`, action: 'pm51-memory-open', data: { id: x.id }, end: icon('chevron') })))
        : PM51.note('No memory matches those words. The assistant would answer from the conversation alone.'))
        : '');
    return [
      PM51.section({ title: 'Try a question', help: 'See which memories the assistant would bring into its reply.', body: tryBody }),
      PM51.section({
        title: 'How memories are chosen',
        body: PM51.rows([
          { label: 'Prefer pinned memories', help: 'Pinned memories are considered before anything else.', control: PM51.toggle(!!r.preferPinned, { action: 'pm51-memory-retrieval-toggle', data: { key: 'preferPinned' }, label: 'Prefer pinned memories' }) },
          { label: 'Memories per reply', help: 'The most the assistant brings into one reply.', control: PM51.select(String(r.max), ['3', '5', '8', '12'], { action: 'pm51-memory-retrieval-select', data: { key: 'max' }, label: 'Memories per reply' }) },
          { label: 'When memories disagree', help: 'What happens when two memories point different ways.', control: PM51.select(r.disagree, ['Ask me', 'Newest wins', 'Show both'], { action: 'pm51-memory-retrieval-select', data: { key: 'disagree' }, label: 'When memories disagree' }) }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Ranking details', body: PM51.kv([['Order', 'Pinned · explicit instructions · confirmed decisions · observed context'], ['Freshness', 'Newer memories of the same kind outrank older ones'], ['Thread memories', 'Only used in the thread that created them'], ['Word matching', 'Title and text, ignoring common words']]) }),
        PM51.section({ title: 'Exclusions', body: PM51.kv([['Never retrieved', 'Secrets, credentials, and raw tool paths'], ['Large sources', 'Summarised with a pointer to the original'], ['Forgotten memories', 'Never retrieved, even while recoverable']]) }),
        PM51.section({ title: 'Conflicts', help: 'Memories that could contradict each other.', action: { label: 'Review conflicts', small: true, icon: 'eye', action: 'pm51-memory-conflicts' } })
      ].join(''))
    ].join('');
  }

  /* ---------- Retention & Privacy -------------------------------------- */
  function protectedSummary() {
    const p = mem().privacy.protect;
    const parts = [p.pinned ? 'Pinned' : '', p.rules ? 'Rules' : '', p.decisions ? 'Decisions' : '', p.preferences ? 'Preferences' : ''].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'None';
  }
  function retentionTab() {
    const m = mem(); const rt = m.retention; const n = m.candidates.length;
    return [
      PM51.section({
        title: 'Keep memories for', help: 'How long each kind of memory stays before the assistant lets it go.',
        body: PM51.rows([
          { label: 'Project', help: 'Rules and decisions about this workspace.', control: PM51.select(rt.project, RETENTION.project, { action: 'pm51-memory-retention', data: { key: 'project' }, label: 'Keep project memories for' }) },
          { label: 'You', help: 'Preferences that follow you between projects.', control: PM51.select(rt.you, RETENTION.you, { action: 'pm51-memory-retention', data: { key: 'you' }, label: 'Keep memories about you for' }) },
          { label: 'This thread', help: 'Working context from one conversation.', control: PM51.select(rt.thread, RETENTION.thread, { action: 'pm51-memory-retention', data: { key: 'thread' }, label: 'Keep thread memories for' }) }
        ])
      }),
      PM51.section({
        title: 'Privacy',
        body: PM51.rows([
          { label: 'Share project memories with crews', help: 'Crew members see project rules and decisions. Memories about you stay private.', control: PM51.toggle(!!m.privacy.shareWithCrews, { action: 'pm51-memory-share', label: 'Share project memories with crews' }) },
          { label: 'Protected memories', help: 'Never forgotten automatically.', value: protectedSummary(), action: { label: 'Manage', action: 'pm51-memory-protected' } }
        ])
      }),
      PM51.section({
        title: 'Forget', help: 'Old working context the assistant probably does not need any more.',
        body: PM51.rows([
          { label: 'Candidates to forget', value: n ? `${n} candidate${n === 1 ? '' : 's'}` : 'Nothing to review', muted: !n, action: n ? { label: 'Review', action: 'pm51-memory-candidates', icon: 'eye' } : null },
          m.forgotten.length ? { label: 'Recently forgotten', help: 'Kept for 30 days in case you change your mind.', value: `${m.forgotten.length}`, action: { label: 'Restore', action: 'pm51-memory-restore', icon: 'restore' } } : null
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'Decay rules', body: PM51.kv([['Observed context', 'Reviewed after 30 quiet days, then suggested for forgetting'], ['Confirmed decisions', 'Never decay; they can only be replaced by a newer decision'], ['Explicit preferences', 'Re-confirmed once a year'], ['Forgotten memories', 'Removed for good after 30 days']]) }),
        PM51.section({ title: 'Export and delete', body: PM51.rows([
          { label: 'Export memories', help: 'A plain file of every memory, without secrets.', action: { label: 'Export', action: 'pm51-memory-export', icon: 'download' } },
          { label: 'Delete all memories', help: 'Removes every memory in this workspace. Cannot be undone.', action: { label: 'Delete all', action: 'pm51-memory-delete-all', icon: 'trash', danger: true } }
        ]) })
      ].join(''))
    ].join('');
  }

  /* ---------- Sources -------------------------------------------------- */
  function sourcesTab() {
    const m = mem();
    return [
      PM51.section({
        title: 'What can feed context', help: 'Turn off anything the assistant should not read on its own.',
        body: PM51.rows(m.sources.map(([label, on], i) => ({ label, help: SOURCE_HELP[label] || '', control: PM51.toggle(!!on, { action: 'pm51-memory-source', data: { index: i }, label }) })))
      }),
      PM51.advanced([
        PM51.section({ title: 'Single owners', help: 'Each shared resource is managed in exactly one place. These links take you there.', body: PM51.rows((m.owners || []).map(([resource, manager, domain, workspace]) => ({ label: resource, value: manager, action: { label: 'Open', action: 'pm51-go', data: { domain, workspace }, icon: 'arrowRight' } }))) }),
        PM51.section({ title: 'Coverage', help: 'Confirms that every source above has an owner feeding it.', action: { label: 'Check coverage', small: true, icon: 'test', action: 'pm51-memory-coverage' }, body: PM51.kv([['Sources on', `${m.sources.filter(s => s[1]).length} of ${m.sources.length}`], ['Owners linked', String((m.owners || []).length)], ['Last check', 'Not run in this preview']]) }),
        PM51.section({ title: 'Source inclusion policy', body: PM51.kv([['Included automatically', 'Current thread, project instructions, active Goal'], ['Fetched on demand', 'Earlier threads, files, memories, manager records'], ['Always excluded', 'Credential values, secret files, unrelated personal data'], ['Large sources', 'Summarised with a pointer and a token budget']]) })
      ].join(''))
    ].join('');
  }

  function render() {
    const tab = PM51.tab(ID, 'memories');
    const body = tab === 'retrieval' ? retrievalTab() : tab === 'retention' ? retentionTab() : tab === 'sources' ? sourcesTab() : memoriesTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset memory settings', action: 'pm51-memory-reset' }, { label: 'How memory works', action: 'pm51-memory-help' }] });
  }
  PM51.manager('memory', { render });

  /* ---------- actions -------------------------------------------------- */
  PM51.on('memory-add', () => editMemory(null));
  PM51.on('memory-edit', el => { const x = memories().find(o => o.id === ds(el, 'id')); if (x) editMemory(x); });
  PM51.on('memory-open', el => { closeOverlay(); PM51.setSel(ID, ds(el, 'id')); PM51.setTab(ID, 'memories'); PM51.refresh(ID); });
  PM51.on('memory-diagnostics', () => PM51.check({ title: 'Memory diagnostics', steps: [
    { title: 'Memory stores readable', desc: `${memories().length} memories across the project, you, and this thread` },
    { title: 'Retrieval index', desc: 'Rebuilt whenever a memory changes', status: 'Example', tone: 'info' },
    { title: 'Retention timers', desc: 'Thread memories expire by the retention setting', status: 'Example', tone: 'info' }
  ] }));

  PM51.onInput('memory-query', el => { mem().query = el.value; });
  PM51.on('memory-search', el => {
    const m = mem(); const input = el.closest('.pm51-memory-try')?.querySelector('input'); if (input) m.query = input.value;
    if (!String(m.query || '').trim()) { PM51.toast('Type a question first', 'Then search to see which memories would be used.', 'info'); return; }
    m.results = search(m.query); saveState(); refresh();
  });
  PM51.on('memory-retrieval-toggle', el => { const r = mem().retrieval; const k = ds(el, 'key'); r[k] = !r[k]; if (mem().results) mem().results = search(mem().query); saveState(); refresh(); });
  PM51.onChange('memory-retrieval-select', el => { const r = mem().retrieval; const k = ds(el, 'key'); r[k] = k === 'max' ? Number(el.value) : el.value; if (mem().results) mem().results = search(mem().query); saveState(); });
  PM51.on('memory-conflicts', () => {
    const pairs = [];
    for (const x of memories()) for (const o of conflictsFor(x)) if (x.id < o.id) pairs.push([x, o]);
    PM51.panel({
      title: 'Review conflicts', subtitle: 'Memories that could contradict each other.',
      body: (pairs.length ? PM51.panelSection('Possible conflicts', PM51.list(pairs.map(([x, o]) => ({ title: `${x.title} · ${o.title}`, meta: `${storeLabel(x.store)} · ${x.type}`, action: 'pm51-memory-open', data: { id: x.id } })))) : PM51.panelSection('Possible conflicts', PM51.note('No conflicts right now.')))
        + PM51.panelSection('When two disagree', PM51.kv([['Explicit instruction', 'Wins over anything inferred'], ['Confirmed decision', 'Wins over an older decision'], ['Observed context', 'Never overrides a rule'], ['Still unclear', mem().retrieval.disagree === 'Ask me' ? 'The assistant asks you' : mem().retrieval.disagree === 'Newest wins' ? 'The newer memory wins' : 'Both are shown']]))
    });
  });

  PM51.onChange('memory-retention', el => { mem().retention[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('memory-share', () => { const p = mem().privacy; p.shareWithCrews = !p.shareWithCrews; saveState(); refresh(); });
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
      if (PM51.sel(ID) === c.id) PM51.setSel(ID, (memories()[0] || {}).id);
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
  PM51.on('memory-coverage', () => { const m = mem(); PM51.check({ title: 'Coverage check', steps: m.sources.map(([label, on]) => ({ title: label, desc: on ? (SOURCE_HELP[label] || '') : 'Turned off, so not checked', status: on ? 'Checked' : 'Off', tone: on ? 'ready' : 'off' })).concat([{ title: 'Owners linked', desc: `${(m.owners || []).length} shared resources point at their managers`, status: 'Checked', tone: 'ready' }]) }); });

  PM51.on('memory-reset', () => PM51.confirm('Reset memory settings?', 'Retrieval, retention, privacy, and source choices go back to their defaults. Your memories are kept.', 'Reset', () => {
    const m = mem(); m.retrieval = { preferPinned: true, max: 5, disagree: 'Ask me' }; m.retention = { project: RETENTION.project[0], you: RETENTION.you[0], thread: RETENTION.thread[0] }; m.privacy = { shareWithCrews: true, protect: { pinned: true, rules: true, decisions: true, preferences: false } };
    m.sources = clone(DATA.memory.sources); m.results = null; m.query = ''; saveState(); refresh(); PM51.toast('Memory settings reset', 'Defaults are back. Your memories were not touched.');
  }));
  PM51.on('memory-help', () => PM51.panel({
    title: 'How memory works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">The assistant keeps short notes about this workspace and about you. Before it answers, it looks for notes that fit the question and reads them first.</p>')
      + PM51.panelSection('Three stores', PM51.kv([['Project', 'Rules and decisions about this workspace. Shared with crews if you allow it.'], ['You', 'Your preferences. They follow you between projects and stay private.'], ['This thread', 'Working context from one conversation. It expires on its own.']]))
      + PM51.panelSection('You stay in control', '<p class="pm51-ps-text">Pin what matters, edit anything, and forget what no longer applies. Forgotten memories can be restored for 30 days.</p>')
  }));
})();
