/* History & Artifacts — what happened in this workspace and the files it produced. */
(function () {
  const ID = 'project-history';
  const KEY = 'project-history-artifacts';
  const TABS = [{ id: 'timeline', label: 'Timeline' }, { id: 'sessions', label: 'Sessions' }, { id: 'artifacts', label: 'Artifacts' }, { id: 'cleanup', label: 'Cleanup' }];
  const KEEP_OPTIONS = ['Keep indefinitely', '1 year', '90 days', '30 days', '7 days'];
  const KEEP_ROWS = [['conversations', 'Conversations', 'Chats and their replies.'], ['goalReceipts', 'Goal receipts', 'What each Goal did and why.'], ['logs', 'Logs', 'Terminal and tool output.'], ['testEvidence', 'Test evidence', 'Recordings and results from checks.'], ['temporaryArtifacts', 'Temporary artifacts', 'Scratch files the assistant made along the way.']];
  const TYPE_ICON = { Tests: 'test', Goals: 'rocket', Settings: 'settings', Backups: 'archive', Sessions: 'history', Artifacts: 'file' };
  const h = PM51.h;

  PM51.style(`
#panel-settings .pm51-history-filter { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
#panel-settings .pm51-history-filter .text-control { width: 200px; }
#panel-settings .pm51-history-filter .pm51-dd-trigger { min-width: 130px; }
#panel-settings .pm51-history-actions { display: flex; flex-wrap: wrap; gap: 8px; }
`);

  const hs = () => PM51.s().history;
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
    const rows = H.timeline.filter(t => (F.type === 'All' || t.type === F.type) && (!q || `${t.event} ${t.device} ${t.time}`.toLowerCase().includes(q)));
    const controls = `<div class="pm51-history-filter">${PM51.input(F.q, { action: 'pm51-history-search', placeholder: 'Search activity', label: 'Search activity' })}${PM51.select(F.type, types, { action: 'pm51-history-type', label: 'Type' })}</div>`;
    const list = rows.length ? PM51.list(rows.map((t, i) => ({
      title: t.event, meta: `${t.time} · ${t.device}`, avatar: icon(TYPE_ICON[t.type] || 'clock'),
      end: PM51.chip(t.type) + icon('chevron'), action: 'pm51-history-event', data: { index: H.timeline.indexOf(t) }
    }))) : PM51.empty('Nothing matches', 'Try another word or choose a different type.');
    const activity = PM51.section({ title: 'Recent activity', help: 'What happened in this workspace, newest first.', action: controls, body: list });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Export and import', body: PM51.rows([
        { label: 'Export history', help: 'Sessions, events, and artifact details as a file. Secrets are left out.', action: { label: 'Export…', icon: 'download', action: 'pm51-history-export' } },
        { label: 'Import a history archive', help: 'Bring history from another workspace or an older backup.', action: { label: 'Import…', icon: 'upload', action: 'pm51-history-import' } }
      ]) }),
      PM51.section({ title: 'Receipts', help: 'Each Goal leaves a receipt saying what it did.', body: PM51.kv([['Goal receipts kept', ph().retention.goalReceipts], ['Receipts in this workspace', String(ph().sessions.reduce((n, s) => n + Math.max(1, Math.round((s.artifacts || 0) / 4)), 0))], ['Latest receipt', H.timeline[0] ? `${H.timeline[0].time} · ${H.timeline[0].event}` : 'None']]) }),
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
      { label: 'Goal receipts', value: `Kept ${String(P.retention.goalReceipts).toLowerCase() === 'keep indefinitely' ? 'indefinitely' : 'for ' + P.retention.goalReceipts}` }
    ]) });
    const advanced = PM51.advanced(PM51.section({ title: 'Technical details', body: PM51.kv([['Session', s.title], ['State', s.state], ['Resumes', 'Goals, chats, and unsaved editors saved with this session']]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-history-diagnostics' })}</div>` }));
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
    const keep = PM51.section({ title: 'Keep for', help: 'Older items are removed automatically. Nothing is removed without a review first.', body: PM51.rows(KEEP_ROWS.map(([key, label, help]) => ({ label, help, control: PM51.select(R[key] || KEEP_OPTIONS[0], KEEP_OPTIONS.includes(R[key]) ? KEEP_OPTIONS : [R[key], ...KEEP_OPTIONS], { action: 'pm51-history-keep', data: { key }, label }) }))) });
    const review = PM51.section({ title: 'Cleanup review', body: PM51.rows([{ label: n ? `${n} items ready` : 'Nothing to clean up', help: n ? 'Review what would be removed before anything happens.' : 'Cleanup candidates appear here as items age.', pill: n ? PM51.pill('Needs attention') : PM51.pill('Ready'), action: n ? { label: 'Review', icon: 'eye', action: 'pm51-history-cleanup-review' } : null }]) });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Storage use', body: PM51.kv([['Sessions and chats', '38 MB'], ['Artifacts', '48.4 MB'], ['Recordings', '1.8 GB'], ['Temporary files', '214 MB']]) }),
      PM51.section({ title: 'Holds', help: 'Things cleanup never touches.', body: PM51.kv([['Active Goal artifacts', 'Protected while the Goal runs'], ['Pinned items', 'Kept until you unpin them'], ['Latest backup receipts', 'Kept with the backup']]) }),
      PM51.section({ title: 'Quarantine', help: 'Removed items wait here for 7 days before they are gone for good.', body: (PM51.s().historyQuarantine || []).length ? PM51.kv(PM51.s().historyQuarantine.map(q => [q.title, `${q.meta} · restore until ${q.until}`])) : PM51.empty('Quarantine is empty', 'Items you remove during cleanup wait here for 7 days.') })
    ].join(''));
    return keep + review + advanced;
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
      body: PM51.panelSection('Event', PM51.kv([['When', t.time], ['Device', t.device], ['Type', t.type]])) + (related ? PM51.panelSection('Related', PM51.btn(Object.assign({ small: true, icon: 'arrowRight' }, related))) : '')
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
    { title: 'Keep-for rules valid', desc: KEEP_ROWS.map(r => P.retention[r[0]]).join(' · ') }
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
  PM51.on('history-reset', () => PM51.confirm('Reset keep-for defaults?', 'Conversations are kept indefinitely, Goal receipts for a year, logs 30 days, test evidence 90 days, and temporary artifacts 7 days.', 'Reset', () => { ph().retention = { conversations: 'Keep indefinitely', goalReceipts: '1 year', logs: '30 days', testEvidence: '90 days', temporaryArtifacts: '7 days' }; refresh(); PM51.toast('Keep-for defaults restored'); }));
  PM51.on('history-help', () => PM51.panel({
    title: 'How history works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Everything that happens in this workspace is recorded: chats, Goals, tests, backups, and settings changes. Files the assistant makes are kept as artifacts.</p>')
      + PM51.panelSection('Sessions', '<p class="pm51-ps-text">A session groups your Goals, chats, and open editors on one device. Resume it on another device to pick up where you left off.</p>')
      + PM51.panelSection('Cleanup', '<p class="pm51-ps-text">Keep-for rules decide how long each kind of item stays. Old items are listed for review first, then wait in quarantine for 7 days before they are removed.</p>')
  }));
})();
