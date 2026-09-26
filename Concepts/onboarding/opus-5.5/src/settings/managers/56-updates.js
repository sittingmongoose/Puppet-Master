/* App Updates — keep Puppet Master current, and go back if you need to. */
(function () {
  const ID = 'updates';
  const KEY = 'updates';
  const h = PM51.h;

  PM51.style(`
#panel-settings .pm51-updates-actions { display: flex; flex-wrap: wrap; gap: 8px; }
`);

  const up = () => { if (!state.updates) state.updates = { automatic: true, channel: 'Stable', source: 'GitHub Releases', checkInterval: 'On open and hourly', currentVersion: '0.8.0-dev', availableVersion: '0.8.1', lastCheck: '7 minutes ago', history: [] }; return state.updates; };
  const ux = () => PM51.s().updates;
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const hasUpdate = () => { const U = up(); return !!U.availableVersion && U.availableVersion !== U.currentVersion; };
  const servers = () => (PM51.s().serverProject && PM51.s().serverProject.servers) || [];

  function render() {
    const U = up(), X = ux();
    const app = PM51.section({
      title: 'Puppet Master', help: hasUpdate() ? `${U.availableVersion} is ready to install.` : 'You are on the latest version.',
      action: { label: 'Check now', icon: 'refresh', action: 'pm51-updates-check', data: { 'command-id': 'cmd.update.app.check' } },
      body: PM51.rows([
        { label: 'Automatically keep Puppet Master up to date', help: 'Downloads in the background and installs when nothing is running.', control: PM51.toggle(!!U.automatic, { action: 'pm51-updates-auto', data: { 'command-id': 'cmd.update.app.automatic.set_enabled' }, label: 'Automatically keep Puppet Master up to date' }) },
        { label: 'Installed version', value: U.currentVersion, pill: hasUpdate() ? '' : PM51.pill('Current') },
        hasUpdate() ? { label: 'Available', value: U.availableVersion, pill: PM51.pill('Update ready'), action: { label: 'Install & restart', primary: true, icon: 'download', action: 'pm51-updates-install' } } : { label: 'Available', value: 'Nothing new', pill: PM51.pill('Current') },
        { label: 'Last check', value: U.lastCheck },
        { label: 'Applies to', help: 'Every server and computer running Puppet Master for this workspace.', value: (X.appliesTo || []).join(' · ') }
      ])
    });
    const catalogs = PM51.section({
      title: 'Content and catalogs', help: 'Lists the app downloads on its own, like the models each service offers.',
      action: { label: 'Refresh catalogs', icon: 'refresh', small: true, action: 'pm51-updates-catalogs' },
      body: PM51.rows((X.catalogs || []).map(([name, status]) => ({ label: name, value: status, pill: PM51.pill(status.split(' · ')[0]) })))
    });
    const history = PM51.section({
      title: 'History',
      body: U.history.length ? PM51.list(U.history.map((x, i) => ({
        title: x.version, meta: `Installed ${x.installed} · ${x.notes || ''}`.replace(/ · $/, ''), pill: PM51.pill(x.result === 'Current' ? 'Current' : x.result === 'Available for rollback' ? 'Can roll back' : x.result, x.result === 'Current' ? 'ready' : 'off'), avatar: icon('download'),
        end: (x.result === 'Available for rollback' ? PM51.btn({ label: 'Roll back', small: true, icon: 'restore', action: 'pm51-updates-rollback', data: { index: i, 'command-id': 'cmd.update.app.rollback' } }) : '') + PM51.iconBtn({ icon: 'chevron', label: `Details for ${x.version}`, action: 'pm51-updates-details', data: { index: i, 'ui-action-id': 'ui.update.app.open_details' } })
      }))) : PM51.empty('No updates yet', 'Installed versions show up here.')
    });
    const advanced = PM51.advanced([
      PM51.section({ title: 'How updates arrive', body: PM51.rows([
        { label: 'Source', value: U.source },
        { label: 'Restart', help: 'When an update needs a restart.', control: PM51.select(U.restartPolicy || 'Wait until idle', ['Wait until idle', 'Ask me first', 'Right away'], { action: 'pm51-updates-restart', label: 'Restart policy' }) },
        { label: 'Skip versions with known problems', help: 'Waits for the fixed release instead.', control: PM51.toggle(U.skipKnownBad !== false, { action: 'pm51-updates-skipbad', label: 'Skip versions with known problems' }) }
      ]) }),
      PM51.section({ title: 'Versions per server', body: PM51.kv(servers().length ? servers().map(s => [s.name, `${s.version}${s.updateReady ? ' · update ready' : ''}`]) : [['This computer', U.currentVersion]]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Signed releases', 'Every download is checked against the publisher signature before it is installed'], ['Restore point', 'Made before each install so you can roll back'], ['Migrations', 'Database and settings are converted during install']]) + `<div class="pm51-updates-actions" style="margin-top:10px">${PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-updates-diagnostics' })}${pm7ConsumerButton('local', 'ui.update.app.open_logs', 'Update logs')}${pm7ConsumerButton('local', 'ui.update.app.open_release_notes', 'Release notes')}${pm7ConsumerButton('local', 'ui.update.content.open_details', 'Content update details')}</div>` })
    ].join(''));
    return PM51.page({ id: ID, key: KEY, body: app + catalogs + history + advanced, quiet: [
      { label: 'Reset update settings', action: 'pm51-updates-reset' },
      { label: 'How updates work', action: 'pm51-updates-help' },
      { label: 'Open Readiness & Doctor', action: 'pm51-go', data: { domain: 'system', workspace: 'doctor' } }
    ] });
  }
  PM51.manager('updates', { render });

  function detailsPanel(index) {
    const U = up(), x = U.history[index]; if (!x) return;
    PM51.panel({
      title: `Puppet Master ${x.version}`, subtitle: `Installed ${x.installed}`, pill: PM51.pill(x.result === 'Current' ? 'Current' : x.result === 'Available for rollback' ? 'Can roll back' : x.result, x.result === 'Current' ? 'ready' : 'off'),
      body: PM51.panelSection('What changed', `<p class="pm51-ps-text">${h(x.notes || 'No notes for this version.')}</p>`)
        + PM51.panelSection('Details', PM51.kv([['Version', x.version], ['Installed', x.installed], ['Source', U.source], ['Signature', 'Verified'], ['Restore point', x.result === 'Current' ? 'Kept until the next install' : 'Available']])),
      primaryLabel: x.result === 'Available for rollback' ? `Roll back to ${x.version}` : '', onPrimary: x.result === 'Available for rollback' ? () => { rollback(index); return true; } : null
    });
  }
  function rollback(index) {
    const U = up(), x = U.history[index]; if (!x) return;
    PM51.confirm(`Roll back to ${x.version}?`, `Puppet Master goes back to ${x.version}. Your work and settings are kept; a restore point of today’s version is made first, and the app restarts.`, 'Roll back', () => PM51.toast('Rollback preview', `Example data only. Puppet Master would restart on ${x.version}.`, 'info'), true);
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('updates-check', () => {
    const U = up(); U.lastCheck = 'Just now'; refresh();
    PM51.check({ title: 'Check for updates', outcome: hasUpdate() ? `${U.availableVersion} available · example data` : 'Up to date · example data', steps: [
      { title: 'Release list read', desc: `${U.source} · ${U.channel}` },
      { title: 'Compared with the installed version', desc: `${U.currentVersion} installed${hasUpdate() ? `, ${U.availableVersion} available` : ''}` },
      { title: 'Signature checked', desc: hasUpdate() ? U.availableVersion : 'Nothing new to check' }
    ] });
  });
  PM51.on('updates-auto', () => { const U = up(); U.automatic = !U.automatic; refresh(); });
  PM51.on('updates-install', () => {
    const U = up(); if (!hasUpdate()) return;
    openDialog({ title: `Install ${U.availableVersion}?`, subtitle: 'Takes about a minute. Running work pauses and resumes after the restart.', body: PM51.steps([
      { title: 'Download and verify', desc: `${U.source} · signature checked` },
      { title: 'Make a restore point', desc: `${U.currentVersion} is kept so you can roll back` },
      { title: 'Install and restart', desc: `Applies to ${(ux().appliesTo || []).join(' and ')}` }
    ]), saveLabel: 'Install & restart', onSave: () => {
      PM51.panel({ title: `Install ${U.availableVersion}`, subtitle: 'Concept preview. Nothing was installed.', pill: PM51.pill('Preview', 'info'), body: PM51.panelSection('What would happen', PM51.steps([
        { title: 'Download and verify', desc: U.source, status: 'Example', tone: 'info' },
        { title: 'Restore point', desc: U.currentVersion, status: 'Example', tone: 'info' },
        { title: 'Install and restart', desc: (ux().appliesTo || []).join(' · '), status: 'Example', tone: 'info' },
        { title: 'Resume work', desc: 'Goals and chats pick up where they were', status: 'Example', tone: 'info' }
      ])) + PM51.note('This is a concept preview. Nothing was installed or restarted.', 'info') });
    } });
  });
  PM51.on('updates-catalogs', () => {
    const X = ux(); PM51.check({ title: 'Refresh catalogs', outcome: 'Current · example data', steps: (X.catalogs || []).map(([name, status]) => ({ title: name, desc: status })) });
  });
  PM51.on('updates-rollback', el => rollback(Number(ds(el, 'index'))));
  PM51.on('updates-details', el => detailsPanel(Number(ds(el, 'index'))));
  PM51.onChange('updates-channel', el => { up().channel = el.value; saveState(); });
  PM51.onChange('updates-interval', el => { up().checkInterval = el.value; saveState(); });
  PM51.onChange('updates-restart', el => { up().restartPolicy = el.value; saveState(); });
  PM51.on('updates-skipbad', () => { const U = up(); U.skipKnownBad = U.skipKnownBad === false; refresh(); });
  PM51.on('updates-diagnostics', () => { const U = up(); PM51.check({ title: 'App Updates diagnostics', steps: [
    { title: 'Update source reachable', desc: U.source },
    { title: 'Installed version known on every server', desc: servers().map(s => `${s.name} ${s.version}`).join(' · ') || U.currentVersion },
    { title: 'Restore point available', desc: U.history.find(x => x.result === 'Available for rollback') ? `Roll back to ${U.history.find(x => x.result === 'Available for rollback').version}` : 'None yet' },
    { title: 'Automatic updates', desc: U.automatic ? 'On' : 'Off', tone: U.automatic ? 'ready' : 'attention', status: U.automatic ? 'Checked' : 'Off' }
  ] }); });
  PM51.on('updates-reset', () => PM51.confirm('Reset update settings?', 'Automatic updates turn on, the Stable channel is used, and checks run on open and hourly.', 'Reset', () => { const U = up(); U.automatic = true; U.channel = 'Stable'; U.checkInterval = 'On open and hourly'; U.restartPolicy = 'Wait until idle'; U.skipKnownBad = true; refresh(); PM51.toast('Update settings restored'); }));
  PM51.on('updates-help', () => PM51.panel({
    title: 'How updates work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Puppet Master checks for new versions on its own, downloads them in the background, and installs when nothing is running. Every download is verified before it is used.</p>')
      + PM51.panelSection('Going back', '<p class="pm51-ps-text">A restore point is made before each install. If a version gives you trouble, roll back from History and you are on the previous version in about a minute.</p>')
      + PM51.panelSection('Servers', '<p class="pm51-ps-text">Updates apply to every server and computer that runs Puppet Master for this workspace, so they always match.</p>')
  }));
})();
