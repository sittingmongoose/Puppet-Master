/* Backup & Restore — protect your work so it can be recovered if something goes wrong. */
(function () {
  const ID = 'backup';
  const KEY = 'project-backup';
  const TABS = [{ id: 'backup', label: 'Backup' }, { id: 'destinations', label: 'Destinations' }, { id: 'restore', label: 'Restore' }, { id: 'history', label: 'History' }];
  const RESTORE_WHAT = ['Whole workspace', 'Some files', 'Whole server'];
  const RESTORE_WHERE = ['In place', 'As a new workspace'];
  const h = PM51.h, a = PM51.a;

  PM51.style(`
#panel-settings .pm51-backup-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-backup-step-select { min-width: 330px; }
#panel-settings .pm51-backup-tree { list-style: none; margin: 0; padding: 0; font-size: 12px; color: var(--k3-text-2); }
#panel-settings .pm51-backup-tree li { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-top: 1px solid var(--k3-line); }
#panel-settings .pm51-backup-tree li:first-child { border-top: 0; }
#panel-settings .pm51-backup-tree svg { width: 14px; height: 14px; color: var(--k3-text-3); }
#panel-settings .pm51-backup-tree span:last-child { margin-left: auto; color: var(--k3-text-3); font-size: 11px; }
`);

  const bk = () => PM51.s().backup;
  const eng = () => { if (!state.backup || !state.backup.schedules) state.backup = clone(D.backupState); return state.backup; };
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const rs = () => {
    const s = PM51.s();
    if (!s.backupRestore) s.backupRestore = { what: 'Whole workspace', whichId: '', where: 'In place' };
    const R = s.backupRestore;
    if (!R.whichId && Number.isInteger(R.which)) { // migrate a saved offset only if its record has a stable owner identity
      R.whichId = snapId(eng().history[R.which]) || 'unavailable:legacy-index:' + R.which;
      delete R.which;
    }
    if (!R.whichId) R.whichId = snapId(latest());
    return R;
  };
  /* Resolve the chosen recovery point after any list refresh. `gone` keeps the vanished selection visible as
     unavailable instead of falling back to latest; an empty selection just means "no backups yet". */
  const chosenSnapshot = () => {
    const R = rs(), E = eng();
    if (!E.history.length) return { rec: null, gone: false };
    if (!R.whichId) { R.whichId = snapId(E.history[0]); return R.whichId ? { rec: E.history[0], gone: false } : { rec: null, gone: true }; }
    const rec = bySnapId(R.whichId);
    return rec ? { rec, gone: false } : { rec: null, gone: true };
  };
  const notListedNote = 'The selected backup is no longer in the list.';
  const destById = id => bk().destinations.find(d => d.id === id);
  const defaultDest = () => bk().destinations.find(d => d.default) || bk().destinations[0];
  const latest = () => eng().history[0];
  /* Recovery points require an owner-issued stable ID or receipt. Presentation fields can repeat or change,
     so an unidentified or duplicate entry is unavailable for snapshot-specific actions. */
  const snapId = x => (x && (x.snapshot_id || x.receipt || x.backup_id)) || '';
  const bySnapId = id => { const rows = id ? eng().history.filter(x => snapId(x) === id) : []; return rows.length === 1 ? rows[0] : null; };
  const kitStatus = () => { const k = bk().recoveryKit; return !k.saved ? 'Not saved' : k.tested ? 'Saved · Tested' : 'Saved · Not tested'; };

  /* ---------- Backup ------------------------------------------------------ */
  function renderBackup() {
    const B = bk(), E = eng(), last = latest();
    const protect = PM51.section({
      title: 'Protect your work', help: 'Backups run on their own. You can also start one now.',
      action: { label: 'Back Up Now', icon: 'archive', primary: true, action: 'pm51-backup-now' },
      body: PM51.rows([
        { label: 'Automatic backups', help: 'Runs on the schedule below.', control: PM51.toggle(!!B.automatic, { action: 'pm51-backup-auto', label: 'Automatic backups' }) },
        { label: 'Last backup', value: last ? `${last.time} · ${last.destination}` : 'Never', pill: last ? PM51.pill(last.result) : PM51.pill('Not set up') },
        { label: 'Restore…', help: 'Bring back files, the whole workspace, or the whole server.', action: { label: 'Restore…', icon: 'restore', action: 'pm51-backup-tab', data: { tab: 'restore' } } }
      ])
    });
    const scope = PM51.section({ title: 'What’s protected', body: PM51.rows([
      { label: 'Puppet Master project data', help: 'Settings, history, Goals, and chats. Always included.', pill: PM51.pill('Locked', 'info'), value: 'Always on' },
      { label: 'Project files', help: 'The files in your workspace folder.', control: PM51.toggle(!!B.protected.files, { action: 'pm51-backup-scope', data: { key: 'files' }, label: 'Project files' }) },
      { label: 'Version history (Git and Jujutsu)', help: 'Commits, branches, and change history.', control: PM51.toggle(!!B.protected.history, { action: 'pm51-backup-scope', data: { key: 'history' }, label: 'Version history' }) }
    ]) });
    const schedule = PM51.section({
      title: 'Schedule', action: { label: 'Add schedule', icon: 'plus', small: true, action: 'pm51-backup-schedule', data: { id: '' } },
      body: E.schedules.length ? PM51.rows(E.schedules.map(s => ({ label: s.name, help: `${s.when} · ${s.destination}`, pill: PM51.pill(s.enabled ? 'On' : 'Off'), action: { label: 'Edit', action: 'pm51-backup-schedule', data: { id: s.id } } }))) : PM51.empty('No schedules', 'Add a schedule so backups run on their own.')
    });
    const kit = PM51.section({
      title: 'Recovery Kit', help: 'Separate from your account. You need it if this server is lost.',
      action: { label: 'Save Recovery Kit', icon: 'key', action: 'pm51-backup-kit-save' },
      body: PM51.rows([{ label: 'Status', value: kitStatus(), pill: PM51.pill(B.recoveryKit.tested ? 'Tested' : B.recoveryKit.saved ? 'Not tested' : 'Not set up'), action: { label: 'Test Recovery Kit', icon: 'test', action: 'pm51-backup-kit-test', disabled: !B.recoveryKit.saved, reason: 'Save the Recovery Kit first.' } }])
        + PM51.note('Save, copy, print, and test go through a protected handoff: the kit is shown only to you, once, and Puppet Master keeps no copy of it.', 'info')
    });
    const daily = E.schedules.find(s => /daily/i.test(s.name)), weekly = E.schedules.find(s => /weekly/i.test(s.name));
    const advanced = PM51.advanced([
      PM51.section({ title: 'Keep backups for', body: PM51.rows([
        { label: 'Daily backups', control: PM51.select(daily ? daily.retention : '30 daily', ['7 daily', '14 daily', '30 daily', '60 daily'], { action: 'pm51-backup-retention', data: { id: daily ? daily.id : '' }, label: 'Daily backups to keep' }) },
        { label: 'Weekly backups', control: PM51.select(weekly ? weekly.retention : '12 weekly', ['4 weekly', '8 weekly', '12 weekly', '26 weekly'], { action: 'pm51-backup-retention', data: { id: weekly ? weekly.id : '' }, label: 'Weekly backups to keep' }) },
        { label: 'Cleanup review', help: 'Old backups are listed before they are removed.', action: { label: 'Review', icon: 'eye', action: 'pm51-backup-cleanup' } }
      ]) }),
      PM51.section({ title: 'Recovery key', help: 'The key inside your Recovery Kit. Keep it somewhere safe and offline.', body: PM51.rows([
        { label: 'Copy Recovery Key', help: 'Shown only to you, once, through the protected handoff. Never placed on the clipboard here.', action: { label: 'Copy Recovery Key', icon: 'copy', action: 'pm51-backup-key-copy', disabled: !B.recoveryKit.saved, reason: 'Save the Recovery Kit first.' } },
        { label: 'Rotate key slot', help: 'A new key slot is added and checked, then the old one is removed. Same encryption, same backups, kit keeps working.', action: { label: 'Rotate key slot', icon: 'key', action: 'pm51-backup-key-rotate', disabled: !B.recoveryKit.saved, reason: 'Save the Recovery Kit first.' } },
        { label: 'Suspected compromise', help: 'Not a rotation: the backups move to a new encryption domain and are re-encrypted. Older backups stay exposed if the key was taken.', action: { label: 'Re-encrypt…', icon: 'restore', action: 'pm51-backup-key-reencrypt', disabled: !latest(), reason: 'There is no backup to re-encrypt yet.' } }
      ]) + PM51.kv([['Last rotation', B.recoveryKit.rotatedAt || 'Never'], ['Re-encrypted', B.recoveryKit.reencryptedAt || 'Never']]) }),
      PM51.section({ title: 'Full server backup', help: 'Everything on the server, not just this workspace.', body: PM51.kv([['Included', 'Server settings, every workspace, histories, and receipts'], ['Left out', 'Caches, running processes, and secret bytes (references only)']]) + `<div class="pm51-backup-actions" style="margin-top:10px">${PM51.btn({ label: 'Back up whole server', small: true, icon: 'archive', action: 'pm51-backup-server' })}${PM51.btn({ label: 'Verify latest backup', small: true, icon: 'test', action: 'pm51-backup-verify' })}</div>` }),
      PM51.section({ title: 'Bandwidth', body: PM51.rows([{ label: 'Upload speed limit', help: 'Slows backups so they do not crowd out other traffic.', control: PM51.select(B.bandwidth || 'Night schedule · 40 MB/s', ['No limit', 'Night schedule · 40 MB/s', '10 MB/s all day'], { action: 'pm51-backup-bandwidth', label: 'Upload speed limit' }) }]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Encryption', 'Each backup is encrypted before it leaves the server; the key lives in your Recovery Kit'], ['Last receipt', last ? `${last.receipt} · ${last.time}` : 'None'], ['Destination', defaultDest() ? defaultDest().name : 'None']]) + `<div style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-backup-diagnostics' })}</div>` })
    ].join(''));
    return protect + scope + schedule + kit + advanced;
  }

  /* ---------- Destinations ----------------------------------------------- */
  function renderDestinations() {
    const B = bk();
    if (!B.destinations.length) return PM51.section({ title: 'Destinations', body: PM51.empty('No destinations yet', 'Add somewhere for backups to go.', { label: 'Add destination', action: 'pm51-backup-dest-add' }) });
    const first = defaultDest();
    const d = destById(PM51.sel(ID, first.id)) || first;
    const items = B.destinations.map(x => ({ id: x.id, title: x.name, meta: `${x.type} · ${x.state}`, tone: PM51.tone(x.state), selected: x.id === d.id }));
    const needsSignIn = d.state === 'Needs sign-in';
    const body = PM51.section({ title: 'Details', body: PM51.rows([
      { label: 'Type', value: d.type },
      { label: 'Account', value: d.account },
      { label: 'Folder', value: d.path },
      { label: 'Encryption', value: d.encryption, pill: PM51.pill('Ready') },
      { label: 'Used by', value: d.usedBy },
      { label: 'Connection', value: d.lastCheck === 'Not checked' ? 'Not checked yet' : `Checked ${d.lastCheck}`, action: { label: 'Test destination', icon: 'test', action: 'pm51-backup-dest-test', data: { id: d.id } } }
    ]) });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Technical details', body: PM51.kv(d.family === 'Storage bucket' ? [['Bucket', d.path], ['Region', d.region || 'Automatic'], ['Endpoint', d.endpoint || 'Provider default']] : [['Location', d.path], ['Share type', d.type]]) }),
      PM51.section({ title: 'Locking and quota', body: PM51.kv([['Locking', 'One backup at a time per destination'], ['Object lock', d.family === 'Storage bucket' ? 'Off' : 'Not available for this type'], ['Quota', d.quota || 'No limit set']]) })
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterTitle: 'Destinations', count: B.destinations.length,
      add: { action: 'pm51-backup-dest-add', label: 'Add destination' },
      items,
      detail: {
        title: d.name, subtitle: `${d.type}${d.default ? ' · Default' : ''}`, pill: PM51.pill(d.state),
        primary: needsSignIn ? { label: 'Sign In', icon: 'key', action: 'pm51-backup-dest-signin', data: { id: d.id } } : { label: 'Edit', icon: 'edit', action: 'pm51-backup-dest-edit', data: { id: d.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Make default', icon: 'check', disabled: !!d.default, meta: d.default ? 'Already default' : '', onClick: () => { B.destinations.forEach(x => { x.default = x.id === d.id; }); refresh(); } },
          { label: 'Edit', icon: 'edit', onClick: () => destDialog(d) },
          { separator: true },
          { label: 'Remove', icon: 'trash', danger: true, disabled: !!d.default, meta: d.default ? 'Default destination' : '', onClick: () => PM51.confirm(`Remove ${d.name}?`, 'Backups already stored there are not deleted. Schedules using it need a new destination.', 'Remove', () => { B.destinations = B.destinations.filter(x => x.id !== d.id); PM51.setSel(ID, defaultDest() ? defaultDest().id : ''); refresh(); }, true) }
        ], d.name),
        body: body + advanced
      }
    });
  }

  /* ---------- Restore ------------------------------------------------------ */
  function renderRestore() {
    const R = rs(), E = eng();
    const picked = chosenSnapshot();
    const chosen = picked.rec, gone = picked.gone;
    const which = E.history.filter(x => snapId(x) && bySnapId(snapId(x))).map(x => [snapId(x), `${x.time} · ${x.type} · ${x.size}`]);
    if (gone) which.unshift([R.whichId, 'Selected backup no longer listed']);
    const steps = PM51.section({ title: 'Restore', help: 'Nothing changes until you confirm at the end.', body: PM51.steps([
      { title: 'What', desc: R.what === 'Some files' ? 'Pick files and folders from the backup.' : R.what === 'Whole server' ? 'Everything on the server, from a full server backup.' : 'Settings, history, Goals, chats, and files for this workspace.', action: PM51.segmented(R.what, RESTORE_WHAT, { action: 'pm51-backup-restore-what', label: 'What to restore' }) },
      { title: 'Which backup', desc: chosen ? `${chosen.destination} · ${chosen.result}` : gone ? notListedNote : 'No backups yet.', action: which.length ? PM51.select(R.whichId, which, { action: 'pm51-backup-restore-which', label: 'Which backup', cls: 'pm51-backup-step-select' }) : '' },
      { title: 'Where', desc: R.where === 'In place' ? 'Replaces the current workspace. A safety copy is made first.' : 'Keeps the current workspace and creates a new one beside it.', action: PM51.segmented(R.where, RESTORE_WHERE, { action: 'pm51-backup-restore-where', label: 'Where to restore' }) },
      { title: 'Review', desc: chosen ? `${R.what} from ${chosen.time}, ${R.where.toLowerCase()}.` : gone ? `${notListedNote} Choose another backup to restore.` : 'Nothing to restore yet.', action: { label: 'Start restore', primary: true, icon: 'restore', action: 'pm51-backup-restore-start', disabled: !chosen, reason: gone ? 'The selected backup is no longer listed. Choose another backup.' : 'There is no backup to restore from yet.' } }
    ]) });
    const advanced = PM51.advanced([
      PM51.section({ title: 'Browse without restoring', help: 'Look inside a backup and pull out single files.', body: PM51.rows([{ label: chosen ? `${chosen.type} backup · ${chosen.time}` : gone ? 'Selected backup no longer listed' : 'No backup', action: { label: 'Browse', icon: 'folder', action: 'pm51-backup-browse', disabled: !chosen, reason: gone ? 'The selected backup is no longer listed.' : 'No backup to browse yet.' } }]) }),
      PM51.section({ title: 'Compatibility', body: PM51.kv([['Backup made by', 'Puppet Master 0.8.0'], ['This version', state.updates ? state.updates.currentVersion : '0.8.0-dev'], ['Result', 'Compatible · no conversion needed']]) }),
      PM51.section({ title: 'Verify recovery point', help: 'Checks that the chosen backup can really be read back.', body: `<div>${PM51.btn({ label: 'Verify recovery point', small: true, icon: 'test', action: 'pm51-backup-verify-selected', disabled: !chosen, reason: gone ? 'The selected backup is no longer listed.' : 'No backup to verify yet.' })}</div>` })
    ].join(''));
    return steps + advanced;
  }

  /* ---------- History ------------------------------------------------------ */
  function renderHistory() {
    const E = eng();
    const list = E.history.length ? PM51.list(E.history.map(x => ({
      title: `${x.type} backup`, meta: `${x.time} · ${x.destination} · ${x.size}`, pill: PM51.pill(x.result), avatar: icon('archive'), end: icon('chevron'),
      action: 'pm51-backup-history-item', data: { id: snapId(x) }
    }))) : PM51.empty('No backups yet', 'Backups show up here once the first one runs.');
    const section = PM51.section({ title: 'Backups', help: 'Every backup that ran, newest first.', body: list });
    const advanced = PM51.advanced(PM51.section({ title: 'Export', body: PM51.rows([{ label: 'Export backup history', help: 'A list of backups, results, and sizes. No backup data is included.', action: { label: 'Export…', icon: 'download', action: 'pm51-backup-history-export' } }]) }));
    return section + advanced;
  }

  function render() {
    const tab = PM51.tab(ID, 'backup');
    const body = tab === 'destinations' ? renderDestinations() : tab === 'restore' ? renderRestore() : tab === 'history' ? renderHistory() : renderBackup();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Reset backup defaults', action: 'pm51-backup-reset' },
      { label: 'How backups work', action: 'pm51-backup-help' },
      { label: 'Open Readiness & Doctor', action: 'pm51-go', data: { domain: 'system', workspace: 'doctor' } }
    ] });
  }
  PM51.manager('backup', { render });

  /* ---------- dialogs & panels ---------------------------------------------- */
  function schedulePanel(id) {
    const E = eng(), s = E.schedules.find(x => x.id === id) || null;
    const dests = bk().destinations.map(d => d.name);
    PM51.panel({
      title: s ? s.name : 'Add schedule', subtitle: s ? `${s.when} · ${s.destination}` : 'When and where backups run on their own.',
      body: PM51.panelSection('Schedule', PM51.field('Name', PM51.input(s ? s.name : 'Nightly backup', { action: 'pm51-noop', label: 'Name', cls: 'pm51-backup-f-name' }))
        + PM51.field('Kind', PM51.select(s && /full/i.test(s.name) ? 'Full' : 'Incremental', ['Incremental', 'Full'], { action: 'pm51-noop', label: 'Kind', cls: 'pm51-backup-f-kind' }), 'Incremental saves only what changed. Full saves everything.')
        + PM51.field('When', PM51.input(s ? s.when : '2:00 AM', { action: 'pm51-noop', label: 'When', cls: 'pm51-backup-f-when' }), 'For example 2:00 AM or Sunday · 3:00 AM.')
        + PM51.field('Destination', PM51.select(s ? s.destination : dests[0], dests, { action: 'pm51-noop', label: 'Destination', cls: 'pm51-backup-f-dest' }))
        + PM51.field('Keep', PM51.input(s ? s.retention : '30 daily', { action: 'pm51-noop', label: 'Keep', cls: 'pm51-backup-f-keep' }), 'How many of these backups to keep.'))
        + PM51.panelSection('Enabled', PM51.rows([{ label: 'Run this schedule', control: PM51.toggle(s ? !!s.enabled : true, { action: 'pm51-backup-panel-toggle', label: 'Run this schedule' }) }])),
      primaryLabel: 'Save', onPrimary: wrap => {
        const val = cls => { const el = wrap.querySelector('.' + cls); return el ? el.value : ''; };
        const name = String(val('pm51-backup-f-name') || '').trim(); if (!name) { PM51.toast('Name the schedule', 'Give it a short name like Nightly backup.', 'warning'); return false; }
        const enabled = wrap.querySelector('.pm51-toggle')?.classList.contains('on');
        const next = { name, when: String(val('pm51-backup-f-when') || '2:00 AM'), destination: String(val('pm51-backup-f-dest') || dests[0] || ''), retention: String(val('pm51-backup-f-keep') || '30 daily'), enabled: !!enabled };
        if (s) Object.assign(s, next); else E.schedules.push(Object.assign({ id: uid('backup-schedule', name) }, next));
        refresh();
      },
      secondaryLabel: s ? 'Delete' : '', onSecondary: s ? () => { PM51.confirm(`Delete ${s.name}?`, 'Backups it already made are kept.', 'Delete', () => { E.schedules = E.schedules.filter(x => x.id !== s.id); refresh(); }, true); return true; } : null
    });
  }
  function destDialog(d) {
    const B = bk(), families = B.destinationFamilies;
    const familyNames = families.map(f => f[0]);
    const allServices = families.flatMap(f => f[1]);
    openDialog({
      title: d ? `Edit ${d.name}` : 'Add destination', subtitle: d ? 'Change where backups go.' : 'First pick the kind of place, then the service.',
      body: PM51.form([
        { label: 'Kind', name: 'family', value: d ? d.family : familyNames[0], type: 'select', choices: familyNames, full: true },
        { label: 'Service', name: 'type', value: d ? d.type : families[0][1][0], type: 'select', choices: allServices, full: true },
        { label: 'Name', name: 'name', value: d ? d.name : '', placeholder: 'Office NAS', autofocus: !d },
        { label: 'Account or address', name: 'account', value: d ? d.account : '', placeholder: 'you@example.com or nas.local' },
        { label: 'Folder or bucket', name: 'path', value: d ? d.path : 'Backups/Puppet-Master', full: true }
      ]),
      saveLabel: d ? 'Save' : 'Add destination',
      onOpen: overlay => {
        const fam = overlay.querySelector('select[name="family"]'), svc = overlay.querySelector('select[name="type"]');
        if (!fam || !svc) return;
        const sync = () => { const list = (families.find(f => f[0] === fam.value) || families[0])[1]; const cur = svc.value; svc.innerHTML = list.map(s => `<option value="${a(s)}">${h(s)}</option>`).join(''); svc.value = list.includes(cur) ? cur : list[0]; };
        fam.addEventListener('change', sync); sync();
      },
      onSave: data => {
        const name = String(data.name || '').trim(); if (!name) { PM51.toast('Name the destination', 'A short name like Office NAS.', 'warning'); return false; }
        const cloud = data.family === 'Cloud account';
        const next = { name, type: String(data.type), family: String(data.family), account: String(data.account || '').trim() || (cloud ? 'Not signed in yet' : 'Local network'), path: String(data.path || '').trim() || '/' };
        if (d) Object.assign(d, next); else { const id = uid('backup-destination', name); B.destinations.push(Object.assign({ id, state: cloud ? 'Needs sign-in' : 'Ready', encryption: 'Encrypted · key ready', usedBy: 'Nothing yet', lastCheck: 'Not checked', default: false }, next)); PM51.setSel(ID, id); }
        refresh();
      }
    });
  }
  function historyPanel(id) {
    const x = bySnapId(id);
    if (!x) { PM51.toast('Backup not available', 'That backup is no longer in the list.', 'warning'); return; }
    PM51.panel({ title: `${x.type} backup`, subtitle: x.time, pill: PM51.pill(x.result), body: PM51.panelSection('Backup', PM51.kv([['When', x.time], ['Type', x.type], ['Destination', x.destination], ['Size', x.size], ['Result', x.result], ['Receipt', x.receipt || '—']])) + PM51.panelSection('Actions', `<div class="pm51-backup-actions">${PM51.btn({ label: 'Restore from this backup', small: true, icon: 'restore', action: 'pm51-backup-restore-from', data: { id: snapId(x) } })}${PM51.btn({ label: 'Verify', small: true, icon: 'test', action: 'pm51-backup-verify-selected', data: { id: snapId(x) } })}</div>`) });
  }
  /* ---------- protected handoff -------------------------------------------- */
  /* Recovery Key/Kit custody (BRS-012/BRS-017, F3-528): Save, Copy, Print, Test, Rotate, and Re-encrypt run through
     one protected, human-only, no-store handoff. The person confirms a current step-up on the initiating Client,
     then only an adopted owner-shaped result changes state — reusing window.O55.ownerResults when present. No timer
     confers completion: default host-unavailable stays pending with retry. No key or kit material exists in the DOM,
     the clipboard, storage, events, or logs here — not even as an example. */
  const ownerSeam = () => ((typeof window !== 'undefined' && window.O55 && O55.ownerResults) || null);
  let activeHandoff = null;
  function handoff(title, subtitle, steps, opts, onDone) {
    if (typeof opts === 'function') { onDone = opts; opts = {}; }
    opts = opts || {};
    if (activeHandoff && activeHandoff.wrap && activeHandoff.wrap.isConnected === false) activeHandoff = null;
    if (activeHandoff && !activeHandoff.settled) return;
    const O = ownerSeam();
    const project = window.PM7_SETTINGS_TOME && PM7_SETTINGS_TOME.project();
    const subject = O && O.protectedContext && O.protectedContext(project && project.id);
    const req = O && subject ? O.begin(opts.operation || 'cmd.backup.recovery_key.export', subject) : null;
    const H = activeHandoff = { req, opts, onDone, stepUp: false, settled: false, wrap: null };
    const wrap = H.wrap = PM51.panel({
      title, subtitle, pill: PM51.status('Protected handoff', 'info'),
      body: PM51.panelSection('What happens', PM51.steps(steps.map(s => ({ title: s.title, desc: s.desc, status: 'Waiting', tone: 'info' }))))
        + PM51.panelSection('Confirm', `<div class="pm51-backup-actions">${PM51.btn({ label: "Confirm it's you", small: true, icon: 'key', action: 'pm51-backup-handoff-stepup' })}${PM51.btn({ label: 'Check again', small: true, icon: 'test', action: 'pm51-backup-handoff-retry' })}</div>`)
        + `<div class="pm51-handoff-note" data-key="handoff-note">${PM51.note('The key or kit is shown only to you, once, on this device. Nothing is saved or switched on until the protected handoff answers.', 'info')}</div>`,
      primaryLabel: 'Done', onPrimary: () => { H.settled = true; activeHandoff = null; return true; }
    });
    H.markAll = (status, tone) => { wrap.querySelectorAll('.pm51-step-end .pm51-status').forEach(el => { el.outerHTML = PM51.status(status, tone || 'ready'); }); };
    H.note = (text, tone) => { const n = wrap.querySelector('[data-key="handoff-note"]'); if (n) n.innerHTML = PM51.note(text, tone || 'info'); };
    H.hero = (text, tone) => { const hs = wrap.querySelector('.pm51-hero-status .pm51-status'); if (hs) hs.outerHTML = PM51.status(text, tone || 'info'); };
  }
  function attemptHandoff() {
    const H = activeHandoff;
    if (!H || H.settled || (H.wrap && H.wrap.isConnected === false)) return;
    const O = ownerSeam();
    if (!H.stepUp) { H.note("Confirm it's you first. The handoff runs only for you, on this device.", 'info'); return; }
    if (!O || !H.req) { H.hero('Waiting for the protected handoff', 'info'); H.note('The protected handoff is not available in this preview, so nothing is saved or switched on yet. Try again when a host is available.', 'info'); return; }
    const project = window.PM7_SETTINGS_TOME && PM7_SETTINGS_TOME.project();
    const current = O.protectedContext && O.protectedContext(project && project.id);
    if (!current || ['project', 'server', 'client', 'recovery_set_id', 'recovery_generation'].some(k => current[k] !== H.req[k])) {
      H.note('The backup or device changed. Close this handoff and open it again.', 'attention'); return;
    }
    const res = O.take(H.req.id);
    if (res && H.opts.check && !H.opts.check(res.postcondition || {})) { H.note('The protected owner has not supplied the required completion evidence.', 'attention'); return; }
    const v = O.adopt(H.req, res, {});
    if (!v.ok) {
      if (v.reason === 'host_unavailable' || v.reason === 'pending_no_result' || v.reason === 'fixture_not_injected') {
        H.hero('Waiting for the protected handoff', 'info');
        H.note('The protected handoff is not available in this preview, so nothing is saved or switched on yet. Try again when a host is available.', 'info');
        return;
      }
      H.hero('Handoff did not finish', 'attention');
      H.markAll('Not completed', 'attention');
      H.note('The handoff did not finish. Nothing was saved, tested, rotated, or re-encrypted. You can try again.', 'attention');
      H.settled = true; activeHandoff = null;
      H.onDone && H.onDone(false);
      refresh();
      return;
    }
    const pc = (res && res.postcondition) || {};
    const check = H.opts.check;
    if (check && !check(pc)) {
      H.hero('Handoff proof missing', 'attention');
      H.markAll('Not completed', 'attention');
      H.note('The handoff answer was missing its proof. Nothing was saved, tested, rotated, or re-encrypted.', 'attention');
      H.settled = true; activeHandoff = null;
      H.onDone && H.onDone(false);
      refresh();
      return;
    }
    H.hero('Handoff finished', 'ready');
    H.markAll('Checked', 'ready');
    H.settled = true; activeHandoff = null;
    H.onDone && H.onDone(true);
    refresh();
  }
  PM51.on('backup-handoff-stepup', () => { const H = activeHandoff; if (!H || H.settled) return; H.stepUp = true; H.note("Identity confirmation requested. Waiting for the protected owner to verify it…", 'info'); attemptHandoff(); });
  PM51.on('backup-handoff-retry', () => { attemptHandoff(); });
  const today = () => new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  function checkKit() {
    const l = latest();
    if (!l) { PM51.toast('Recovery Kit not tested', 'No backup to test against yet. Run a backup first.', 'warning'); return; }
    handoff('Test Recovery Kit', 'Proves the saved kit can open a backup. The kit itself stays in your hands.', [
      { title: 'Kit file readable', desc: 'Saved copy found' },
      { title: 'Key opens the latest backup', desc: `${l.time} · ${l.size}` },
      { title: 'Trial restore in a scratch folder', desc: 'A few files are read back and compared' }
    ], { operation: 'cmd.backup.recovery_key.test', check: (pc) => pc.unlock === 'verified' && pc.scratch === 'verified' }, (ok) => {
      if (ok) { bk().recoveryKit.tested = true; PM51.toast('Recovery Kit tested', 'The saved kit opened the latest backup.', 'success'); }
      else PM51.toast('Recovery Kit not tested', 'The kit did not open this backup. Make sure it is the kit you saved here.', 'warning');
    });
  }

  /* ---------- actions -------------------------------------------------------- */
  PM51.on('backup-tab', el => { PM51.setTab(ID, ds(el, 'tab')); PM51.refresh(ID); });
  PM51.on('backup-now', () => {
    const dests = bk().destinations.filter(d => d.state === 'Ready').map(d => d.name);
    if (!dests.length) { PM51.toast('No destination is ready', 'Add a destination or sign in to one first.', 'warning'); return; }
    openDialog({ title: 'Back up now', subtitle: 'Runs in the background. You can keep working.', body: PM51.form([{ label: 'Destination', name: 'dest', value: (defaultDest() || {}).name || dests[0], type: 'select', choices: dests, full: true }, { label: 'Kind', name: 'kind', value: 'Incremental', type: 'select', choices: ['Incremental', 'Full'] }]), saveLabel: 'Start backup', onSave: data => { PM51.toast('Backup preview', `Example data only. A ${String(data.kind).toLowerCase()} backup would go to ${data.dest} now.`, 'info'); } });
  });
  PM51.on('backup-auto', () => { bk().automatic = !bk().automatic; refresh(); });
  PM51.on('backup-scope', el => { const key = ds(el, 'key'); bk().protected[key] = !bk().protected[key]; refresh(); });
  PM51.on('backup-schedule', el => schedulePanel(ds(el, 'id')));
  PM51.on('backup-panel-toggle', el => { el.classList.toggle('on'); el.setAttribute('aria-checked', el.classList.contains('on') ? 'true' : 'false'); });
  PM51.on('backup-kit-save', () => openDialog({ title: 'Save Recovery Kit', subtitle: 'The kit holds the key that unlocks your backups. Keep it away from this server.', body: PM51.form([
    { label: 'Save to', name: 'where', value: 'Download a file', type: 'select', choices: ['Download a file', 'Print it', 'USB drive'], full: true },
    { label: 'Passphrase for the kit', name: 'pass', value: '', type: 'password', help: 'Optional. Protects the kit if someone finds it.' }
  ]), saveLabel: 'Continue', onSave: (data) => {
    const where = String(data.where || 'Download a file');
    handoff('Save Recovery Kit', `The kit is shown once, for you to keep (${where.toLowerCase()}).`, [
      { title: "Confirm it's you", desc: 'This device checks it is you first' },
      { title: `Kit shown once · ${where}`, desc: 'Save or print it now, away from this server' },
      { title: 'Nothing kept', desc: 'No copy of the kit stays in Puppet Master' }
    ], { operation: where === 'Print it' ? 'cmd.backup.recovery_key.print' : 'cmd.backup.recovery_key.export', check: (pc) => pc.delivery === 'verified' && pc.savedAck === true }, (ok) => {
      if (!ok) return;
      bk().recoveryKit.saved = true; bk().recoveryKit.tested = false;
      PM51.toast('Recovery Kit saved', 'Protected handoff finished. Test the kit when you have it.', 'info');
    });
  } }));
  PM51.on('backup-kit-test', checkKit);
  PM51.onChange('backup-retention', el => { const s = eng().schedules.find(x => x.id === ds(el, 'id')); if (s) { s.retention = el.value; saveState(); } });
  PM51.on('backup-cleanup', () => PM51.panel({ title: 'Cleanup review', subtitle: 'Backups past their keep-for time. Nothing is removed until you choose.', body: PM51.panelSection('Ready to remove', PM51.list([
    { title: 'Daily backups older than 30 days', meta: '3 backups · 410 MB', avatar: icon('trash'), end: PM51.btn({ label: 'Remove', small: true, danger: true, action: 'pm51-backup-cleanup-remove', data: { what: 'daily' } }) },
    { title: 'Weekly backups older than 12 weeks', meta: '1 backup · 2.1 GB', avatar: icon('trash'), end: PM51.btn({ label: 'Remove', small: true, danger: true, action: 'pm51-backup-cleanup-remove', data: { what: 'weekly' } }) }
  ])) + PM51.note('The latest verified backup is always kept, no matter how old it is.', 'info') }));
  PM51.on('backup-cleanup-remove', el => PM51.confirm('Remove old backups?', 'They are gone for good once removed. Newer backups are kept.', 'Remove', () => { closeOverlay(); PM51.toast('Cleanup preview', `Example data only. Old ${ds(el, 'what')} backups would be removed now.`, 'info'); }, true));
  PM51.on('backup-key-copy', () => PM51.confirm('Copy the recovery key?', 'Anyone with this key can read your backups. The key is shown only to you, once, in a protected handoff; Puppet Master never keeps a copy and never writes it to the clipboard.', 'Continue', () => handoff('Copy Recovery Key', 'The key is handed to you once, to paste somewhere safe yourself.', [
    { title: "Confirm it's you", desc: 'This device checks it is you first' },
    { title: 'Key handed to you', desc: 'Paste it where you keep it, then clear what you pasted there' },
    { title: 'Nothing kept', desc: 'No copy of the key stays in Puppet Master' }
  ], { operation: 'cmd.backup.recovery_key.copy', check: (pc) => pc.delivery === 'verified' }, (ok) => { if (ok) PM51.toast('Key handed off', 'Nothing was stored or copied by this preview.', 'info'); }), true));
  PM51.on('backup-key-rotate', () => PM51.confirm('Rotate the recovery key slot?', 'A new key slot is added and checked, then the old one is removed. This is a rotation: your Recovery Kit keeps unlocking the same backups and nothing is re-encrypted.', 'Rotate key', () => handoff('Rotate key slot', 'Same encryption domain, a new key slot.', [
    { title: 'New key slot added', desc: 'Your Recovery Kit opens it' },
    { title: 'New slot verified', desc: 'A canary read-back opens the latest backup with the new slot' },
    { title: 'Old slot removed', desc: 'The previous key stops opening backups' }
  ], { operation: 'cmd.backup.recovery_key.rotate', check: (pc) => pc.newSlot === 'verified' && pc.oldRemoved === true && pc.order === 'new-before-old' }, (ok) => { if (ok) { bk().recoveryKit.rotatedAt = today(); PM51.toast('Key slot rotated', 'New slot verified and old slot removed.', 'success'); } }), true));
  PM51.on('backup-key-reencrypt', () => PM51.confirm('Key may be compromised?', 'This is not a rotation. The backups move to a brand-new encryption domain and are re-encrypted with a new key. Backups made before this stay exposed if the old key was taken.', 'Re-encrypt', () => handoff('New domain and re-encryption', 'For a suspected compromise. Older backups stay exposed if the key was taken.', [
    { title: 'New encryption domain created', desc: 'A fresh key that shares nothing with the old one' },
    { title: 'Backups re-encrypted', desc: latest() ? `Each finished backup is re-encrypted and evidenced, from ${latest().time} onward` : 'Nothing to re-encrypt yet' },
    { title: 'Old domain retired', desc: 'The old key opens nothing from now on' }
  ], { operation: 'cmd.backup.recovery_key.reencrypt', check: (pc) => pc.newDomain === true && pc.reencrypted === true }, (ok) => { if (ok) { bk().recoveryKit.reencryptedAt = today(); PM51.toast('Re-encryption finished', 'Your backups now use the new encryption domain.', 'success'); } }), true));
  PM51.on('backup-server', () => PM51.confirm('Back up the whole server?', 'Every workspace and the server settings are included. It runs in the background.', 'Back up whole server', () => PM51.toast('Full server backup preview', 'Example data only. A full server backup would start now.', 'info')));
  PM51.on('backup-verify', () => { const last = latest(); PM51.check({ title: 'Verify latest backup', steps: [
    { title: 'Backup found', desc: last ? `${last.time} · ${last.destination}` : 'None', tone: last ? 'ready' : 'attention', status: last ? 'Checked' : 'Missing' },
    { title: 'Contents match the manifest', desc: last ? last.size : '—' },
    { title: 'Can be read back', desc: 'A few files restored to a scratch folder and compared' }
  ] }); });
  /* Snapshot-specific verify (BRS-019): verifies exactly the chosen recovery point by identity. The
     'Verify latest backup' action above stays the only deliberately latest-targeted verify. */
  function verifySnapshot(rec) {
    PM51.check({ title: `Verify backup · ${rec.time}`, steps: [
      { title: 'Backup found', desc: [rec.time, rec.destination, rec.receipt].filter(Boolean).join(' · '), tone: 'ready', status: 'Checked' },
      { title: 'Contents match the manifest', desc: rec.size },
      { title: 'Can be read back', desc: 'A few files restored to a scratch folder and compared' }
    ] });
  }
  PM51.on('backup-verify-selected', el => {
    const id = ds(el, 'id') || rs().whichId;
    const rec = id ? bySnapId(id) : null;
    if (!rec) { PM51.toast('Selected backup not available', `${notListedNote} Pick another recovery point to verify.`, 'warning'); return; }
    verifySnapshot(rec);
  });
  PM51.onChange('backup-bandwidth', el => { bk().bandwidth = el.value; saveState(); });
  PM51.on('backup-diagnostics', () => PM51.check({ title: 'Backup & Restore diagnostics', steps: [
    { title: 'Automatic backups', desc: bk().automatic ? 'On' : 'Off', tone: bk().automatic ? 'ready' : 'attention', status: bk().automatic ? 'Checked' : 'Off' },
    { title: 'Default destination reachable', desc: (defaultDest() || {}).name || 'None' },
    { title: 'Recovery Kit', desc: kitStatus(), tone: bk().recoveryKit.tested ? 'ready' : 'attention', status: bk().recoveryKit.tested ? 'Checked' : 'Not tested' },
    { title: 'Latest backup verified', desc: latest() ? `${latest().time} · ${latest().result}` : 'None' }
  ] }));
  PM51.on('backup-dest-add', () => destDialog(null));
  PM51.on('backup-dest-edit', el => { const d = destById(ds(el, 'id')); if (d) destDialog(d); });
  PM51.on('backup-dest-signin', el => { const d = destById(ds(el, 'id')); if (!d) return; PM51.panel({ title: `Sign in to ${d.name}`, subtitle: 'Backups to a cloud account need your permission first.', pill: PM51.pill('Needs sign-in'), body: PM51.panelSection('Steps', PM51.steps([{ title: 'Open the sign-in page', desc: `${d.type} · ${d.account}` }, { title: 'Allow Puppet Master to use one folder', desc: d.path }, { title: 'Come back here', desc: 'The destination becomes Ready' }])) + PM51.note('Puppet Master only sees the folder you allow. Your other files stay private.', 'info'), primaryLabel: 'Open sign-in', onPrimary: () => PM51.toast('Sign-in preview', `Example data only. The real app opens ${d.type} sign-in in your browser.`, 'info') }); });
  PM51.on('backup-dest-test', el => { const d = destById(ds(el, 'id')); if (!d) return; PM51.check({ title: `Test destination · ${d.name}`, steps: [
    { title: 'Reachable', desc: d.account },
    { title: 'Signed in', desc: d.state === 'Needs sign-in' ? 'Sign in first' : 'Yes', tone: d.state === 'Needs sign-in' ? 'attention' : 'ready', status: d.state === 'Needs sign-in' ? 'Needs sign-in' : 'Checked' },
    { title: 'Can write and read back', desc: d.path },
    { title: 'Free space', desc: 'Enough for the next full backup' }
  ] }); });
  PM51.onChange('backup-restore-which', el => { rs().whichId = el.value; refresh(); });
  PM51.on('backup-restore-what', el => { rs().what = ds(el, 'value'); refresh(); });
  PM51.on('backup-restore-where', el => { rs().where = ds(el, 'value'); refresh(); });
  PM51.on('backup-restore-from', el => { const id = ds(el, 'id'); if (id) rs().whichId = id; PM51.setTab(ID, 'restore'); closeOverlay(); PM51.refresh(ID); });
  PM51.on('backup-restore-start', () => {
    const R = rs(), picked = chosenSnapshot();
    if (picked.gone) { PM51.toast('Selected backup not available', `${notListedNote} Choose another backup to restore.`, 'warning'); return; }
    const chosen = picked.rec; if (!chosen) return;
    const selectedId = snapId(chosen);
    PM51.confirm('Start restore?', `${R.what} from ${chosen.time}, ${R.where.toLowerCase()}. A safety copy of the current state is made first, the backup is verified before anything is switched over, and you can go back afterwards.`, 'Start restore', () => {
      const current = bySnapId(selectedId);
      if (!current) { PM51.toast('Selected backup not available', `${notListedNote} Review the recovery point again.`, 'warning'); return; }
      PM51.panel({ title: 'Restore', subtitle: 'Concept preview. Nothing was restored.', pill: PM51.pill('Preview', 'info'), body: PM51.panelSection('What would happen', PM51.steps([
        { title: 'Safety copy of the current state', desc: 'So you can go back', status: 'Example', tone: 'info' },
        { title: 'Verify the backup', desc: `${current.type} · ${current.time}`, status: 'Example', tone: 'info' },
        { title: `Restore ${R.what.toLowerCase()}`, desc: R.where === 'In place' ? 'Into this workspace' : 'Into a new workspace beside this one', status: 'Example', tone: 'info' },
        { title: 'Check and switch over', desc: 'Only after everything reads back correctly', status: 'Example', tone: 'info' }
      ])) + PM51.note('This is a concept preview. Nothing was restored or changed.', 'info') });
    }, true);
  });
  PM51.on('backup-browse', () => {
    const picked = chosenSnapshot();
    if (picked.gone) { PM51.toast('Selected backup not available', `${notListedNote} Pick another backup to browse.`, 'warning'); return; }
    const chosen = picked.rec; if (!chosen) return;
    PM51.panel({ title: 'Browse backup', subtitle: `${chosen.type} · ${chosen.time} · ${chosen.size}`, body: PM51.panelSection('Contents', `<ul class="pm51-backup-tree">${[['folder', 'Puppet Master project data', '38 MB'], ['folder', 'Project files', '96 MB'], ['folder', 'Version history', '41 MB'], ['file', 'settings.json', '18 KB'], ['file', 'history.db', '7 MB']].map(([ic, name, size]) => `<li>${icon(ic)}<span>${h(name)}</span><span>${h(size)}</span></li>`).join('')}</ul>`) + PM51.note('Pick a file to pull it out on its own. Example data only in this preview.', 'info') });
  });
  PM51.on('backup-history-item', el => historyPanel(ds(el, 'id')));
  PM51.on('backup-history-export', () => PM51.toast('Export prepared', 'Example data only. A list of backups and results would be saved.', 'info'));
  PM51.on('backup-reset', () => PM51.confirm('Reset backup defaults?', 'Automatic backups turn on, everything is protected again, and the default schedule is restored. Destinations and history are kept.', 'Reset', () => { const B = bk(); B.automatic = true; B.protected = { pmData: true, files: true, history: true }; B.bandwidth = 'Night schedule · 40 MB/s'; eng().schedules = clone(D.backupState.schedules); refresh(); PM51.toast('Backup defaults restored'); }));
  PM51.on('backup-help', () => PM51.panel({
    title: 'How backups work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Puppet Master saves a copy of your workspace to a destination you choose, on a schedule. Every backup is encrypted before it leaves the server.</p>')
      + PM51.panelSection('Recovery Kit', '<p class="pm51-ps-text">The kit holds the key that unlocks your backups. It is separate from your account so you can recover even if this server is lost. Save it somewhere safe and test it once.</p>')
      + PM51.panelSection('Restoring', '<p class="pm51-ps-text">You can bring back single files, a whole workspace, or the whole server. A safety copy is made first and the backup is verified before anything is switched over.</p>')
  }));
})();
