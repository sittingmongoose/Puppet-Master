/* History & Artifacts — what happened in this workspace and the files it produced (settings audit, 2026-09-27).
   - The timeline's own filters and the inventory's view rows are one filter bar: which projects, approved only,
     include archived. "Compare two versions" opens from an item.
   - Keep-for: the manager kept its own copies for conversations, Goal receipts, logs and test evidence, offering
     values the owner rows reject (7 days of logs, where the minimum is 30). The owner rows are the controls now,
     with their minimums; test evidence is Testing's; only temporary files keep an own keep-for.
   - "Quarantine" (removed items waiting 7 days) is called Recently removed, so it no longer shares a word with the
     holds and quarantined-values inspector. */
(function () {
  const ID = 'project-history';
  const KEY = 'project-history-artifacts';
  const TABS = [{ id: 'timeline', label: 'Timeline' }, { id: 'sessions', label: 'Sessions' }, { id: 'artifacts', label: 'Artifacts' }, { id: 'cleanup', label: 'Cleanup' }];
  const KEEP_OPTIONS = ['Keep indefinitely', '1 year', '90 days', '30 days', '7 days'];
  const V = { scope: 'general.interaction.history-scope', approved: 'general.interaction.history-approved-only', archived: 'general.interaction.history-archived', exportRow: 'general.interaction.history-export', compare: 'general.interaction.history-compare', lineage: 'general.interaction.thread-lineage', runs: 'system.advanced.runtime-history-days', holds: 'system.advanced.inspect-holds-quarantine', evidence: 'branching.worktrees.evidence-retention-days' };
  const on = v => v === true || v === 'on' || v === 'true';
  const EXTRA = [
    { event: 'Settings change proposed: raise the run budget', time: 'Today · 09:12', device: 'Laptop', type: 'Settings', approved: false },
    { event: 'Prototype session archived', time: 'Last week', device: 'Desktop', type: 'Sessions', archived: true },
    { event: 'recipe-api: tests passed on main', time: 'Yesterday · 17:40', device: 'Home server', type: 'Tests', project: 'recipe-api' }
  ];
  const KEEP_ROWS = [['temporaryArtifacts', 'Temporary artifacts', 'Scratch files the assistant made along the way.']];
  const TYPE_ICON = { Tests: 'test', Goals: 'rocket', Settings: 'settings', Backups: 'archive', Sessions: 'history', Artifacts: 'file' };
  const h = PM51.h;

  PM51.style(`
#panel-settings .pm51-history-filter { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
#panel-settings .pm51-history-filter .text-control { width: 200px; }
#panel-settings .pm51-history-filter .pm51-dd-trigger { min-width: 130px; }
#panel-settings .pm51-history-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .o55-history-view { margin: 10px 0 12px; gap: 14px; }
#panel-settings .o55-history-chip { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--k3-text-2); cursor: pointer; }
`);

  const hs = () => { const x = PM51.s().history; if (!x.o55V2) { x.o55V2 = true; EXTRA.forEach(e => { if (!x.timeline.some(t => t.event === e.event)) x.timeline.push(clone(e)); }); } return x; };
  const ph = () => { if (!state.projectHistory) state.projectHistory = { sessions: [], artifacts: [] }; const P = state.projectHistory; if (!P.retention) P.retention = clone((state.backup && state.backup.retention) || { conversations: 'Keep indefinitely', goalReceipts: '1 year', logs: '30 days', testEvidence: '90 days', temporaryArtifacts: '7 days' }); return P; };
  const filter = () => { const s = PM51.s(); if (!s.historyFilter) s.historyFilter = { q: '', type: 'All' }; return s.historyFilter; };
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const sessionTone = st => st === 'Active' ? 'ready' : st === 'Paused' ? 'attention' : st === 'Archived' ? 'off' : 'neutral';
  const cleanupGroups = () => { const s = PM51.s(); if (!s.historyCleanup) s.historyCleanup = [
    { id: 'temp', title: 'Temporary artifacts', meta: '214 MB · 12 items', count: 12 },
    { id: 'recordings', title: 'Expired visual recordings', meta: '1.8 GB · 4 items', count: 4 },
    { id: 'stale', title: 'Stale sessions', meta: '2 sessions, untouched for 60 days', count: 2 }
  ]; return s.historyCleanup; };
  const cleanupCount = () => cleanupGroups().reduce((n, g) => n + g.count, 0);

  /* ---------- Timeline ---------------------------------------------------- */
  function renderTimeline() {
    const H = hs(), F = filter();
    const types = ['All', ...new Set(H.timeline.map(t => t.type))];
    const q = F.q.toLowerCase();
    const all = String(PM51.value(V.scope)) === 'All projects', approvedOnly = on(PM51.value(V.approved)), withArchived = on(PM51.value(V.archived));
    const rows = H.timeline.filter(t => (all || !t.project) && (!approvedOnly || t.approved !== false) && (withArchived || !t.archived) && (F.type === 'All' || t.type === F.type) && (!q || `${t.event} ${t.device} ${t.time}`.toLowerCase().includes(q)));
    const chip = (id, label) => `<label class="o55-history-chip">${PM51.bound.toggle(id, { label })}<span>${h(label)}</span></label>`;
    const controls = `<div class="pm51-history-filter">${PM51.input(F.q, { action: 'pm51-history-search', placeholder: 'Search activity', label: 'Search activity' })}${PM51.select(F.type, types, { action: 'pm51-history-type', label: 'Type' })}</div><div class="pm51-history-filter o55-history-view">${PM51.bound.select(V.scope, { prefix: 'Show', width: 150 })}${chip(V.approved, 'Approved only')}${chip(V.archived, 'Include archived')}</div>`;
    const list = rows.length ? PM51.list(rows.map((t, i) => ({
      title: t.event, meta: [t.time, t.device, t.project ? `in ${t.project}` : '', t.approved === false ? 'waiting for approval' : '', t.archived ? 'archived' : ''].filter(Boolean).join(' · '), avatar: icon(TYPE_ICON[t.type] || 'clock'),
      end: PM51.chip(t.type) + icon('chevron'), action: 'pm51-history-event', data: { index: H.timeline.indexOf(t) }
    }))) : PM51.empty('Nothing matches', 'Try another word or choose a different type.');
    const activity = PM51.section({ title: 'Recent activity', help: 'What happened, newest first. Open an item to compare it with an earlier version.', body: controls + list });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Export and import', body: PM51.rows([
        { label: 'Export history', help: 'Sessions, events, and artifact details as a file. Secrets are left out.', action: PM51.bound.action(V.exportRow, { label: 'Export…', icon: 'download' }) },
        { label: 'Import a history archive', help: 'Bring history from another workspace or an older backup.', action: { label: 'Import…', icon: 'upload', action: 'pm51-history-import' } }
      ]) }),
      PM51.section({ title: 'Receipts', help: 'Each Goal leaves a receipt saying what it did.', body: PM51.kv([['Goal receipts kept', `${PM51.value(V.runs) || 365} days (Cleanup tab)`], ['Receipts in this workspace', String(ph().sessions.reduce((n, s) => n + Math.max(1, Math.round((s.artifacts || 0) / 4)), 0))], ['Latest receipt', H.timeline[0] ? `${H.timeline[0].time} · ${H.timeline[0].event}` : 'None']]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Events recorded', String(H.timeline.length)], ['Storage', 'Workspace database on the home server'], ['Devices reporting', [...new Set(H.timeline.map(t => t.device))].join(' · ')]]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-history-diagnostics' })}</div>` })
    ].join(''));
    return activity + advanced;
  }

  /* ---------- Sessions ---------------------------------------------------- */
  function renderSessions() {
    const P = ph();
    if (!P.sessions.length) return PM51.section({ title: 'Sessions', body: PM51.empty('No sessions yet', 'A session starts the first time you open this workspace on a device.', { label: 'New session', action: 'pm51-history-session-new' }) });
    const selId = PM51.sel(ID, P.sessions[0].id);
    const s = P.sessions.find(x => x.id === selId) || P.sessions[0];
    const items = P.sessions.map(x => ({ id: x.id, title: x.title, meta: `${x.device} · ${x.updated}`, tone: sessionTone(x.state), selected: x.id === s.id }));
    const body = PM51.section({ title: 'Details', body: PM51.rows([
      { label: 'Device', value: s.device },
      { label: 'Updated', value: s.updated },
      { label: 'Artifacts', value: String(s.artifacts || 0), action: { label: 'See artifacts', action: 'pm51-history-tab-artifacts', icon: 'arrowRight' } },
      { label: 'Goal receipts', value: `Kept for ${PM51.value(V.runs) || 365} days` }
    ]) });
    const advanced = PM51.advanced(PM51.section({ title: 'Technical details', body: PM51.bound.rows([V.lineage]) + PM51.kv([['Session', s.title], ['State', s.state], ['Resumes', 'Goals, chats, and unsaved editors saved with this session']]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-history-diagnostics' })}</div>` }));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Sessions', count: P.sessions.length,
      add: { action: 'pm51-history-session-new', label: 'New session' },
      items,
      detail: {
        title: s.title, subtitle: `${s.device} · ${s.updated}`, pill: PM51.pill(s.state, sessionTone(s.state)),
        primary: { label: s.state === 'Active' ? 'Open' : 'Resume', icon: 'play', action: 'pm51-history-session-resume', data: { id: s.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Rename', icon: 'edit', onClick: () => renameSession(s) },
          { label: 'Archive', icon: 'archive', disabled: s.state === 'Archived', onClick: () => { s.state = 'Archived'; refresh(); } },
          { separator: true },
          { label: 'Delete', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Delete “${s.title}”?`, 'The session and its saved state are removed. Artifacts it produced stay under Artifacts.', 'Delete', () => { P.sessions = P.sessions.filter(x => x.id !== s.id); PM51.setSel(ID, P.sessions[0] ? P.sessions[0].id : ''); refresh(); }, true) }
        ], s.title),
        body: body + advanced
      }
    });
  }

  /* ---------- Artifacts --------------------------------------------------- */
  function renderArtifacts() {
    const P = ph();
    const list = P.artifacts.length ? PM51.list(P.artifacts.map(a => ({
      title: a.name, meta: `${a.type} · ${a.size}`, avatar: icon(a.type === 'Video' ? 'video' : a.type === 'Archive' ? 'archive' : 'file'),
      end: `<span class="pm51-row-value is-muted">Keep ${String(a.retention).toLowerCase() === 'keep' ? 'indefinitely' : 'for ' + a.retention}</span>${icon('chevron')}`,
      action: 'pm51-history-artifact', data: { id: a.id }
    }))) : PM51.empty('No artifacts yet', 'Files the assistant produces show up here.');
    const section = PM51.section({ title: 'Artifacts', help: 'Files this workspace produced. Open, download, or decide how long to keep them.', body: list });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Storage locations', action: { label: 'Add location', icon: 'plus', small: true, action: 'pm51-history-location-add' }, body: PM51.kv([['Project artifacts', '${projectRoot}/Artifacts'], ['Recordings', 'Home server · workspace media folder'], ['Temporary files', '/mnt/data · cleared on cleanup'], ...(PM51.s().historyLocations || []).map(l => [l.name, l.path])]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Artifacts', String(P.artifacts.length)], ['Total size', P.artifacts.map(a => a.size).join(' + ') || '0']]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-history-diagnostics' })}</div>` })
    ].join(''));
    return section + advanced;
  }

  /* ---------- Cleanup ----------------------------------------------------- */
  function renderCleanup() {
    const P = ph(), R = P.retention, n = cleanupCount();
    const ev = PM51.setting(V.evidence);
    const files = PM51.section({ title: 'Files and evidence', help: 'Older items are listed for review before anything is removed.', body: PM51.rows([
      ...KEEP_ROWS.map(([key, label, help]) => ({ label, help, control: PM51.select(R[key] || '7 days', KEEP_OPTIONS.includes(R[key]) ? KEEP_OPTIONS : [R[key], ...KEEP_OPTIONS], { action: 'pm51-history-keep', data: { key }, label: `Keep ${label.toLowerCase()} for` }) })),
      { label: 'Test evidence', help: 'Kept with the rest of the saved proof, set in Testing & Debug.', value: ev ? PM51.valueText(ev, PM51.value(V.evidence)) : 'Set in Testing & Debug', action: { label: 'Change', icon: 'arrowRight', action: 'pm51-history-reveal', data: { setting: V.evidence } } }
    ]) });
    const review = PM51.section({ title: 'Cleanup review', body: PM51.rows([{ label: n ? `${n} items ready` : 'Nothing to clean up', help: n ? 'Review what would be removed before anything happens.' : 'Cleanup candidates appear here as items age.', pill: n ? PM51.status('Needs a look', 'attention') : '', action: n ? { label: 'Review', icon: 'eye', action: 'pm51-history-cleanup-review' } : null }]) });
    const removed = PM51.s().historyQuarantine || [];
    const advanced = PM51.advanced([
      PM51.section({ title: 'Storage use', body: PM51.kv([['Sessions and chats', '38 MB'], ['Artifacts', '48.4 MB'], ['Recordings', '1.8 GB'], ['Temporary files', '214 MB']]) }),
      PM51.section({ title: 'Holds', help: 'Things cleanup never touches.', body: PM51.kv([['Active Goal artifacts', 'Protected while the Goal runs'], ['Pinned items', 'Kept until you unpin them'], ['Latest backup receipts', 'Kept with the backup']]) + PM51.bound.rows([V.holds]) }),
      PM51.section({ title: 'Recently removed', help: 'Items you deleted wait here for 7 days before they are gone for good.', body: removed.length ? PM51.kv(removed.map(q => [q.title, `${q.meta} · restore until ${q.until}`])) : PM51.note('Nothing removed recently.', 'info') })
    ].join(''));
    return PM51.slot() + files + review + advanced;
  }

  function render() {
    const tab = PM51.tab(ID, 'timeline');
    const body = tab === 'sessions' ? renderSessions() : tab === 'artifacts' ? renderArtifacts() : tab === 'cleanup' ? renderCleanup() : renderTimeline();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Reset keep-for defaults', action: 'pm51-history-reset' },
      { label: 'How history works', action: 'pm51-history-help' }
    ] });
  }
  PM51.manager('projectHistory', { render });
  PM51.revealHistoryObject = function (kind, id) {
    const P = ph();
    if (kind === 'history-session') {
      if (!P.sessions.some(row => row.id === id)) return false;
      PM51.setTab(ID, 'sessions'); PM51.setSel(ID, id);
      navigate('projects', ID); PM51.refresh(ID, { swap: false });
      const reveal = () => {
        const row = [...root.querySelectorAll('#panel-settings [data-id]')].find(node => node.dataset.id === id);
        if (!row) return false;
        row.scrollIntoView({ block: 'center' }); row.setAttribute('data-search-exact-target', id); return true;
      };
      if (!reveal()) requestAnimationFrame(reveal);
      return true;
    }
    if (kind === 'artifact') {
      if (!P.artifacts.some(row => row.id === id)) return false;
      PM51.setTab(ID, 'artifacts'); navigate('projects', ID); PM51.refresh(ID, { swap: false });
      artifactPanel(id); return true;
    }
    return false;
  };

  /* ---------- panels & dialogs -------------------------------------------- */
  function renameSession(s) {
    openDialog({ title: 'Rename session', body: PM51.form([{ label: 'Name', name: 'title', value: s.title, autofocus: true }]), saveLabel: 'Save', onSave: data => { const t = String(data.title || '').trim(); if (!t) return false; s.title = t; refresh(); } });
  }
  function artifactPanel(id) {
    const P = ph(), a = P.artifacts.find(x => x.id === id); if (!a) return;
    const keepValue = String(a.retention).toLowerCase() === 'keep' ? 'Keep indefinitely' : a.retention;
    PM51.panel({
      title: a.name, subtitle: `${a.type} · ${a.size}`, pill: PM51.pill('Ready'),
      body: PM51.panelSection('Artifact', PM51.kv([['Type', a.type], ['Size', a.size], ['Made by', a.owner || 'This workspace'], ['Keep for', keepValue]]))
        + PM51.panelSection('Keep for', PM51.field('Keep for', PM51.select(keepValue, KEEP_OPTIONS.includes(keepValue) ? KEEP_OPTIONS : [keepValue, ...KEEP_OPTIONS], { action: 'pm51-history-artifact-keep', data: { id }, label: 'Keep for' }), 'Applies to this artifact only.'))
        + PM51.panelSection('Actions', `<div class="pm51-history-actions">${PM51.btn({ label: 'Open', small: true, icon: 'external', action: 'pm51-history-artifact-open', data: { id } })}${PM51.btn({ label: 'Download', small: true, icon: 'download', action: 'pm51-history-artifact-download', data: { id } })}${PM51.btn({ label: 'Delete', small: true, danger: true, icon: 'trash', action: 'pm51-history-artifact-delete', data: { id } })}</div>`),
      primaryLabel: 'Done', onPrimary: () => refresh()
    });
  }
  function eventPanel(index) {
    const t = hs().timeline[index]; if (!t) return;
    const related = t.type === 'Goals' ? { label: 'Open Sessions', action: 'pm51-history-tab-sessions' } : t.type === 'Backups' ? { label: 'Open Backup & Restore', action: 'pm51-go', data: { domain: 'system', workspace: 'backup' } } : t.type === 'Settings' ? { label: 'Open Settings Transfer', action: 'pm51-go', data: { domain: 'system', workspace: 'settings-transfer' } } : t.type === 'Tests' ? { label: 'Open Testing & Debug', action: 'pm51-go', data: { domain: 'code', workspace: 'testing' } } : null;
    PM51.panel({
      title: t.event, subtitle: `${t.time} · ${t.device}`, pill: PM51.chip(t.type),
      body: PM51.panelSection('Event', PM51.kv([['When', t.time], ['Device', t.device], ['Type', t.type], t.project ? ['Project', t.project] : null, t.approved === false ? ['Approval', 'Waiting for you'] : null])) + (related ? PM51.panelSection('Related', PM51.btn(Object.assign({ small: true, icon: 'arrowRight' }, related))) : '')
        + PM51.panelSection('Compare', `<div class="pm51-history-actions">${PM51.btn({ label: 'Compare with an earlier version', small: true, icon: 'layers', action: 'pm51-history-compare', data: { index } })}</div>`)
    });
  }
  function cleanupPanel() {
    const groups = cleanupGroups();
    const body = groups.length ? PM51.panelSection('Ready to remove', PM51.list(groups.map(g => ({
      title: g.title, meta: g.meta, avatar: icon('trash'),
      end: PM51.btn({ label: 'Keep', small: true, action: 'pm51-history-cleanup-keep', data: { id: g.id } }) + PM51.btn({ label: 'Delete', small: true, danger: true, action: 'pm51-history-cleanup-delete', data: { id: g.id } })
    })))) + PM51.note('Deleted items wait in quarantine for 7 days. You can bring them back until then.', 'info') : PM51.empty('Nothing to clean up', 'Come back when items have aged past their keep-for time.');
    PM51.panel({ title: 'Cleanup review', subtitle: `${cleanupCount()} items ready. Nothing is removed until you choose Delete.`, body });
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.onInput('history-search', el => {
    filter().q = el.value; saveState();
    const q = el.value.toLowerCase(); const list = el.closest('.pm51-section')?.querySelector('.pm51-list'); if (!list) return;
    list.querySelectorAll('.pm51-item').forEach(row => { row.hidden = !!q && !row.textContent.toLowerCase().includes(q); });
  });
  PM51.onChange('history-type', el => { filter().type = el.value; refresh(); });
  PM51.on('history-event', el => eventPanel(Number(ds(el, 'index'))));
  PM51.on('history-tab-sessions', () => { PM51.setTab(ID, 'sessions'); closeOverlay(); PM51.refresh(ID); });
  PM51.on('history-tab-artifacts', () => { PM51.setTab(ID, 'artifacts'); PM51.refresh(ID); });
  PM51.on('history-export', () => openDialog({ title: 'Export history', subtitle: 'Sessions, events, and artifact details. Passwords and keys are never included.', body: PM51.form([
    { label: 'Format', name: 'format', value: 'JSON + Markdown', type: 'select', choices: ['JSON + Markdown', 'JSON', 'Markdown', 'Encrypted archive'] },
    { label: 'Include artifact files', name: 'files', value: false, type: 'checkbox', full: true, help: 'Off keeps the export small; only artifact details are listed.' }
  ]), saveLabel: 'Export', onSave: data => { PM51.toast('Export prepared', `Example data only. A ${data.format} file would be saved in the real app.`, 'info'); } }));
  PM51.on('history-import', () => openDialog({ title: 'Import a history archive', subtitle: 'You see what would change before anything is added.', body: PM51.form([
    { label: 'Archive', name: 'file', value: '', type: 'file', full: true },
    { label: 'If a session already exists', name: 'conflict', value: 'Keep both', type: 'select', choices: ['Keep both', 'Merge matching sessions', 'Skip it'] }
  ]), saveLabel: 'Preview import', onSave: data => { PM51.toast('Import preview', `Example data only. ${data.file || 'The archive'} would be checked before anything is added.`, 'info'); } }));
  PM51.on('history-diagnostics', () => { const P = ph(); PM51.check({ title: 'History & Artifacts diagnostics', steps: [
    { title: 'History database readable', desc: `${hs().timeline.length} events` },
    { title: 'Sessions consistent', desc: `${P.sessions.length} sessions` },
    { title: 'Artifact files present', desc: `${P.artifacts.length} artifacts` },
    { title: 'Keep-for rules valid', desc: `Temporary files ${P.retention.temporaryArtifacts || '7 days'} · run records ${PM51.value(V.runs) || 365} days` }
  ] }); });
  PM51.on('history-session-new', () => {
    const P = ph(); const devices = (PM51.s().serverProject?.devices || []).map(d => d.name);
    openDialog({ title: 'New session', subtitle: 'A session keeps your Goals, chats, and open editors together.', body: PM51.form([
      { label: 'Name', name: 'title', value: 'New session', autofocus: true },
      { label: 'Device', name: 'device', value: devices[0] || 'This device', type: 'select', choices: devices.length ? devices : ['This device'] }
    ]), saveLabel: 'Create session', onSave: data => { const t = String(data.title || '').trim(); if (!t) return false; const id = uid('session', t); P.sessions.unshift({ id, title: t, device: String(data.device), updated: 'Now', state: 'Active', artifacts: 0 }); PM51.setSel(ID, id); refresh(); } });
  });
  PM51.on('history-session-resume', el => { const P = ph(), s = P.sessions.find(x => x.id === ds(el, 'id')); if (!s) return; s.state = 'Active'; s.updated = 'Now'; refresh(); PM51.toast(`Resumed “${s.title}”`, 'Example data only. The real app reopens its Goals, chats, and editors.', 'info'); });
  PM51.on('history-artifact', el => artifactPanel(ds(el, 'id')));
  PM51.onChange('history-artifact-keep', el => { const a = ph().artifacts.find(x => x.id === ds(el, 'id')); if (a) { a.retention = el.value === 'Keep indefinitely' ? 'Keep' : el.value; saveState(); } });
  PM51.on('history-artifact-open', el => { const a = ph().artifacts.find(x => x.id === ds(el, 'id')); if (a) PM51.toast('Opens in the workspace', `Example data only. ${a.name} would open in its viewer.`, 'info'); });
  PM51.on('history-artifact-download', el => { const a = ph().artifacts.find(x => x.id === ds(el, 'id')); if (a) PM51.toast('Download prepared', `Example data only. ${a.name} (${a.size}) would be saved to your Downloads folder.`, 'info'); });
  PM51.on('history-artifact-delete', el => { const P = ph(), a = P.artifacts.find(x => x.id === ds(el, 'id')); if (!a) return; PM51.confirm(`Delete ${a.name}?`, 'It waits in quarantine for 7 days, then it is gone for good.', 'Delete', () => { P.artifacts = P.artifacts.filter(x => x.id !== a.id); const s = PM51.s(); s.historyQuarantine = s.historyQuarantine || []; s.historyQuarantine.unshift({ title: a.name, meta: a.size, until: 'in 7 days' }); closeOverlay(); refresh(); }, true); });
  PM51.on('history-location-add', () => openDialog({ title: 'Add storage location', subtitle: 'Where new artifacts of a kind should be stored.', body: PM51.form([
    { label: 'Name', name: 'name', value: '', placeholder: 'Large recordings', autofocus: true },
    { label: 'Folder', name: 'path', value: '', placeholder: '/mnt/media/puppet-master' }
  ]), saveLabel: 'Add location', onSave: data => { const name = String(data.name || '').trim(), path = String(data.path || '').trim(); if (!name || !path) { PM51.toast('Name and folder are needed', 'Fill in both to continue.', 'warning'); return false; } const s = PM51.s(); s.historyLocations = s.historyLocations || []; s.historyLocations.push({ name, path }); refresh(); } }));
  PM51.onChange('history-keep', el => { ph().retention[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('history-cleanup-review', cleanupPanel);
  PM51.on('history-cleanup-keep', el => { const s = PM51.s(); s.historyCleanup = cleanupGroups().filter(g => g.id !== ds(el, 'id')); saveState(); closeOverlay(); refresh(); PM51.toast('Kept', 'Those items stay until the next review.', 'info'); });
  PM51.on('history-cleanup-delete', el => { const g = cleanupGroups().find(x => x.id === ds(el, 'id')); if (!g) return; PM51.confirm(`Delete ${g.title.toLowerCase()}?`, `${g.meta}. They wait in quarantine for 7 days first.`, 'Delete', () => { const s = PM51.s(); s.historyCleanup = cleanupGroups().filter(x => x.id !== g.id); s.historyQuarantine = s.historyQuarantine || []; s.historyQuarantine.unshift({ title: g.title, meta: g.meta, until: 'in 7 days' }); closeOverlay(); refresh(); }, true); });
  PM51.on('history-reveal', el => { if (PM51.revealSetting) PM51.revealSetting(ds(el, 'setting')); });
  PM51.on('history-compare', el => {
    const H = hs(); const i = el && el.dataset && el.dataset.index != null ? Number(el.dataset.index) : -1; const t = H.timeline[i];
    const same = t ? H.timeline.filter((x, j) => j !== i && x.type === t.type) : [];
    const pick = t ? same : H.timeline;
    PM51.panel({
      title: 'Compare two versions', eyebrow: 'History', icon: 'layers', summary: t ? `${t.event}, against an earlier item of the same kind.` : 'Pick two items from the timeline.',
      body: pick.length ? PM51.panelSection(t ? 'Compare with' : 'Items', PM51.list(pick.slice(0, 6).map(x => ({ title: x.event, meta: `${x.time} · ${x.device}`, end: PM51.btn({ label: 'Compare', small: true, action: 'pm51-history-compare-go', data: { a: t ? t.event : x.event, b: x.event } }) })))) : PM51.note('Nothing earlier of this kind to compare with.', 'info')
    });
  });
  PM51.on('history-compare-go', el => PM51.panel({ title: 'Side by side', eyebrow: 'History', icon: 'layers', body: PM51.panelSection('Items', PM51.kv([['This one', ds(el, 'a')], ['Earlier', ds(el, 'b')]])) + PM51.panelSection('What changed (example)', PM51.kv([['Settings touched', '2'], ['Files changed', '5'], ['Checks', 'Both passed']])) + PM51.note('Example data only. In the app the two versions open side by side.', 'info') }));
  [V.scope, V.approved, V.archived, V.evidence, V.runs].forEach(id => PM51.watch(id, () => refresh()));
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  PM51.on('history-reset', () => PM51.confirm('Reset keep-for defaults?', 'Temporary files go back to 7 days. Chats, run records, logs and test evidence are set by their own rows and are not changed here.', 'Reset', () => { ph().retention = { conversations: 'Keep indefinitely', goalReceipts: '1 year', logs: '30 days', testEvidence: '90 days', temporaryArtifacts: '7 days' }; refresh(); PM51.toast('Keep-for defaults restored'); }));
  PM51.on('history-help', () => PM51.panel({
    title: 'How history works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Everything that happens in this workspace is recorded: chats, Goals, tests, backups, and settings changes. Files the assistant makes are kept as artifacts.</p>')
      + PM51.panelSection('Sessions', '<p class="pm51-ps-text">A session groups your Goals, chats, and open editors on one device. Resume it on another device to pick up where you left off.</p>')
      + PM51.panelSection('Cleanup', '<p class="pm51-ps-text">Each kind of item has one keep-for rule. Old items are listed for review first, then wait under Recently removed for 7 days before they are gone.</p>')
  }));
})();
