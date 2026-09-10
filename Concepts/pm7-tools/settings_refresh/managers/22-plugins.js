/* Plugins — add-ons that give the assistant new tools and connections. */
(function () {
  const ID = 'plugins';
  const KEY = 'tools-integrations';
  const PREF_DEFAULTS = { hookTimeout: '10 seconds', allowOverride: false, updateReview: 'Always ask me' };
  const plugins = () => PM51.s().plugins;
  const prefs = () => { const s = PM51.s(); if (!s.pluginsPrefs) s.pluginsPrefs = clone(PREF_DEFAULTS); return s.pluginsPrefs; };
  const byId = id => plugins().find(x => x.id === id);
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plugin';
  const uniqueId = base => { let id = base, n = 2; while (byId(id)) id = base + '-' + n++; return id; };
  const SOURCE_LABELS = { Bundled: 'Bundled with Puppet Master', Catalog: 'From the catalog', 'Local folder': 'From a folder on this computer' };
  const sourceLabel = s => SOURCE_LABELS[s] || s || 'Unknown';
  const installed = p => p.state !== 'Not installed';
  const metaFor = p => p.version === 'Bundled' ? 'Bundled with Puppet Master' : installed(p) ? `Version ${p.version} · ${sourceLabel(p.source)}` : sourceLabel(p.source);
  const stateFor = p => !installed(p) ? 'Not installed' : p.problem ? 'Needs attention' : p.enabled ? 'Ready' : 'Off';
  const actionRow = (...buttons) => `<div class="pm51-plugins-actions">${buttons.join('')}</div>`;
  const COMMANDS = [['scan', 'Scan'], ['install', 'Install'], ['update', 'Update'], ['enable', 'Enable'], ['disable', 'Disable'], ['reload', 'Reload'], ['remove', 'Remove'], ['validate', 'Validate'], ['review_changes', 'Review changes'], ['rollback', 'Roll back'], ['open_details', 'Details'], ['open_logs', 'Logs']];

  PM51.style(`
#panel-settings .pm51-plugins-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-plugins-actions:first-child { margin-top: 0; }
#panel-settings .pm51-plugins-table-wrap { overflow-x: auto; }
#panel-settings .pm51-plugins-table { width: 100%; border-collapse: collapse; font-size: 12px; }
#panel-settings .pm51-plugins-table th { text-align: left; font-size: 11px; font-weight: 650; color: var(--k3-text-3); padding: 6px 8px; border-bottom: 1px solid var(--k3-line); white-space: nowrap; }
#panel-settings .pm51-plugins-table td { padding: 7px 8px; border-top: 1px solid var(--k3-line); color: var(--k3-text-2); vertical-align: middle; }
#panel-settings .pm51-plugins-table tr:first-child td { border-top: 0; }
#panel-settings .pm51-plugins-table td:first-child { color: var(--k3-text-1); font-weight: 640; }
#panel-settings .pm51-plugins-table td.is-num, #panel-settings .pm51-plugins-table th.is-num { text-align: right; }
#panel-settings .pm51-plugins-cmds { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
#panel-settings .pm51-plugins-cmds .btn { min-height: 26px; padding: 0 9px; font-size: 11px; }
`);

  function render() {
    const list = plugins();
    const p = prefs();
    const items = list.map(x => ({
      title: x.name, meta: metaFor(x), note: x.problem || '', pill: PM51.pill(stateFor(x)), avatar: h(PM51.initials(x.name)),
      end: x.locked ? PM51.chip('Always on') : !installed(x) ? PM51.btn({ label: 'Install', small: true, icon: 'download', disabled: true, reason: 'Installing happens only in the real app.' }) : PM51.toggle(!!x.enabled, { action: 'pm51-plugins-toggle', data: { id: x.id }, label: `${x.name} enabled` }),
      action: 'pm51-plugins-open', data: { id: x.id }
    }));
    const table = `<div class="pm51-plugins-table-wrap"><table class="pm51-plugins-table"><thead><tr><th>Name</th><th>Version</th><th>Source</th><th>Status</th><th class="is-num">Hooks</th><th class="is-num">Tools</th></tr></thead><tbody>${list.map(x => `<tr><td>${h(x.name)}</td><td>${h(x.version === 'Bundled' ? 'With app' : installed(x) ? x.version : '—')}</td><td>${h(x.source)}</td><td>${PM51.pill(stateFor(x))}</td><td class="is-num">${x.hooks}</td><td class="is-num">${x.tools}</td></tr>`).join('')}</tbody></table></div>`;
    const body = [
      PM51.section({
        title: 'Plugins', help: 'Turn a plugin off to keep its tools away from the assistant. Open one to see what it adds.',
        action: { label: 'Add plugin', icon: 'plus', action: 'pm51-plugins-add' },
        body: items.length ? PM51.list(items) : PM51.empty('No plugins yet', 'Add one from the catalog or a folder on this computer.', { label: 'Add plugin', action: 'pm51-plugins-add', icon: 'plus' })
      }),
      PM51.advanced([
        PM51.section({ title: 'Hooks and tools', help: 'Hooks run at key moments, such as before a file is saved. Tools are things the assistant can call.', body: table }),
        PM51.rows([
          /* Wave S: hook time limit and built-in tool override are the canonical extensions.plugins.hook-timeout
             and tool-override rows, rendered inline above. */
          { label: 'Before updating a plugin', help: 'Updates can ask for new permissions. Reviewing them keeps you in control.', control: PM51.select(p.updateReview, ['Always ask me', 'Ask only when permissions change', 'Update automatically'], { action: 'pm51-plugins-review', label: 'Before updating a plugin' }) }
        ]),
        PM51.section({ title: 'How plugins are checked', body: PM51.kv([['Signature', 'Checked before install and before every update'], ['Publisher', 'Shown in the plugin details before you install'], ['Known problems list', 'Checked before install and update'], ['Previous version', 'Kept so you can roll back']]) + actionRow(PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-plugins-diagnostics' })) })
      ].join(''))
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset plugin settings', action: 'pm51-plugins-reset' }, { label: 'How plugins work', action: 'pm51-plugins-help' }] });
  }
  PM51.manager('plugins', { render });

  function openPlugin(id) {
    const p = byId(id); if (!p) return;
    const state = stateFor(p);
    const commands = `<div class="pm51-plugins-cmds">${COMMANDS.map(([cmd, label]) => pm7ConsumerButton('command', 'cmd.agent_plugin.' + cmd, label, { targetId: p.id })).join('')}</div>`;
    PM51.panel({
      title: p.name, subtitle: metaFor(p), pill: PM51.pill(state),
      body: (p.problem ? PM51.note(p.problem, 'attention') : '')
        + PM51.panelSection('What it adds', PM51.kv([['Tools', p.tools ? `${p.tools} ${p.tools === 1 ? 'tool' : 'tools'} the assistant can call` : 'No tools'], ['Hooks', p.hooks ? `${p.hooks} ${p.hooks === 1 ? 'hook that runs' : 'hooks that run'} at key moments` : 'No hooks']]))
        + PM51.panelSection('Use it', PM51.rows([{ label: 'Enabled', help: p.locked ? 'Bundled with Puppet Master and always on.' : !installed(p) ? 'Install the plugin first.' : 'Off keeps it installed but out of the way.', control: p.locked ? PM51.chip('Always on') : !installed(p) ? PM51.pill('Not installed') : PM51.toggle(!!p.enabled, { action: 'pm51-plugins-toggle', data: { id: p.id }, label: `${p.name} enabled` }) }]))
        + PM51.panelSection('Permissions', (p.permissions || []).length ? `<div class="pm51-chips">${p.permissions.map(x => PM51.chip(x)).join('')}</div>` : '<p class="pm51-ps-text">Asks for nothing extra.</p>', 'What the plugin may reach. Updates that ask for more are shown to you first.')
        + (p.problem ? PM51.panelSection('Fix it', PM51.rows([{ label: 'Plugin folder', help: p.problem, action: { label: 'Pick folder', icon: 'folder', action: 'pm51-plugins-pick-folder', data: { id: p.id } } }])) : '')
        + PM51.panelSection('Updates', PM51.rows([{ label: p.locked ? 'Updated together with Puppet Master' : installed(p) ? 'Up to date' : 'Not installed', help: p.locked ? 'Nothing to do here.' : installed(p) ? `You have version ${p.version}.` : '', action: p.locked || !installed(p) ? undefined : { label: 'Check for updates', icon: 'refresh', action: 'pm51-plugins-update', data: { id: p.id } } }]))
        + PM51.panelSection('Remove', actionRow(PM51.btn({ label: 'Remove plugin', small: true, danger: true, icon: 'trash', action: 'pm51-plugins-remove', data: { id: p.id }, disabled: !!p.locked, reason: 'Plugins bundled with Puppet Master cannot be removed.' })))
        + PM51.advanced(
          PM51.kv([['Manifest', p.source === 'Local folder' ? 'plugin.json in the plugin folder' : 'plugin.json from the package'], ['Identity', `${p.id} · ${p.version === 'Bundled' ? 'bundled build' : 'version ' + p.version}`], ['Containment', 'Runs in its own process with only the permissions above'], ['Evidence', 'Install receipt and last check kept in the plugin log']])
          + '<p class="pm51-ps-help" style="margin:10px 0 0">Plugin commands. They stay listed here but have no live handler in this preview.</p>' + commands,
          { label: 'Technical details' }),
      primaryLabel: 'Check plugin', onPrimary: () => { runCheck(p.id); }
    });
  }

  function runCheck(id) {
    const p = byId(id); if (!p) return;
    const broken = !!p.problem || !installed(p);
    PM51.check({
      title: `Check ${p.name}`, outcome: broken ? 'Needs attention · example data' : undefined, tone: broken ? 'attention' : undefined,
      steps: [
        { title: 'Files in place', desc: p.problem || (installed(p) ? 'Plugin folder and manifest found' : 'Not installed yet'), status: broken ? 'Missing' : 'Checked', tone: broken ? 'attention' : 'ready' },
        { title: 'Tools respond', desc: p.tools ? `${p.tools} tools answered a hello message` : 'No tools to check', status: 'Example', tone: 'info' },
        { title: 'Permissions match', desc: 'Nothing beyond what you approved', status: 'Example', tone: 'info' }
      ]
    });
  }

  PM51.on('plugins-open', el => openPlugin(ds(el, 'id')));
  PM51.on('plugins-toggle', el => {
    const p = byId(ds(el, 'id')); if (!p || p.locked || !installed(p)) return;
    p.enabled = !p.enabled; p.state = stateFor(p);
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', p.enabled); el.setAttribute('aria-checked', String(p.enabled)); }
    saveState(); PM51.refresh(ID, { swap: false });
  });
  PM51.on('plugins-check', el => runCheck(ds(el, 'id')));
  PM51.on('plugins-add', () => openDialog({
    title: 'Add plugin', subtitle: 'Plugins add tools and connections. You review what they ask for before they run.',
    body: formField('Where from', 'source', 'catalog', { type: 'select', full: true, choices: [{ value: 'catalog', label: 'From the catalog' }, { value: 'folder', label: 'From a folder on this computer' }] })
      + formField('Name or folder', 'ref', '', { placeholder: 'e.g. Calendar Connector, or a folder path', autofocus: true, full: true }),
    saveLabel: 'Add plugin',
    onSave: data => {
      const ref = String(data.ref || '').trim(); if (!ref) { PM51.toast('Name needed', 'Type a plugin name or folder first.', 'info'); return false; }
      const name = ref.includes('/') ? (ref.split('/').filter(Boolean).pop() || ref).replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ref;
      const id = uniqueId(slug(name));
      plugins().push({ id, name, version: '', source: data.source === 'folder' ? 'Local folder' : 'Catalog', state: 'Not installed', enabled: false, hooks: 0, tools: 0, permissions: [] });
      saveState(); PM51.refresh(ID, { swap: false });
      PM51.toast('Plugin added to your list', 'Example data only. Nothing was downloaded or installed in this preview.', 'info');
    }
  }));
  PM51.on('plugins-pick-folder', el => {
    const p = byId(ds(el, 'id')); if (!p) return;
    openDialog({
      title: `Where is ${p.name} now?`, subtitle: 'Paste the folder that holds the plugin.',
      body: formField('Folder', 'path', '', { placeholder: '/home/you/plugins/team-lint', autofocus: true, full: true }),
      saveLabel: 'Use this folder',
      onSave: data => {
        const path = String(data.path || '').trim(); if (!path) { PM51.toast('Folder needed', 'Paste the folder path first.', 'info'); return false; }
        p.problem = ''; p.folder = path; p.state = stateFor(p); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast('Folder updated', `${p.name} now points at ${path}.`);
      }
    });
  });
  PM51.on('plugins-update', el => {
    const p = byId(ds(el, 'id')); if (!p) return;
    PM51.check({ title: `Check for updates · ${p.name}`, steps: [
      { title: 'Catalog reached', desc: 'Looked up the newest version', status: 'Example', tone: 'info' },
      { title: 'Newest version', desc: `You have ${p.version}. No newer version in this preview.`, status: 'Up to date', tone: 'ready' }
    ] });
  });
  PM51.on('plugins-remove', el => {
    const p = byId(ds(el, 'id')); if (!p || p.locked) return;
    PM51.confirm(`Remove ${p.name}?`, 'Its tools and hooks stop being available. The previous version is kept for a while in case you change your mind.', 'Remove', () => {
      PM51.s().plugins = plugins().filter(x => x.id !== p.id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${p.name} removed`, 'It is no longer on your list.');
    }, true);
  });
  PM51.onChange('plugins-timeout', el => { prefs().hookTimeout = el.value; saveState(); });
  PM51.on('plugins-override', () => { prefs().allowOverride = !prefs().allowOverride; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onChange('plugins-review', el => { prefs().updateReview = el.value; saveState(); });
  PM51.on('plugins-diagnostics', () => PM51.check({ title: 'Plugin diagnostics', steps: [
    { title: 'Plugin folders readable', desc: 'Every listed plugin has a folder or package' },
    { title: 'Manifests parsed', desc: `${plugins().length} manifests read without errors`, status: 'Example', tone: 'info' },
    { title: 'Hooks within time limit', desc: `Every hook finished under ${prefs().hookTimeout}`, status: 'Example', tone: 'info' }
  ] }));
  PM51.on('plugins-reset', () => PM51.confirm('Reset plugin settings?', 'Your plugin list and the options under Advanced go back to their defaults.', 'Reset', () => {
    PM51.s().plugins = clone(DATA.plugins); PM51.s().pluginsPrefs = clone(PREF_DEFAULTS); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Plugins reset', 'Defaults are back.');
  }));
  PM51.on('plugins-help', () => PM51.panel({
    title: 'How plugins work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A plugin is a package that adds tools the assistant can call, or hooks that run at key moments. The GitHub plugin, for example, lets the assistant read and open pull requests.</p>')
      + PM51.panelSection('Staying safe', PM51.kv([['Permissions', 'Every plugin lists what it may reach. You see the list before it runs.'], ['Updates', 'An update that asks for more is shown to you before it is applied.'], ['Off switch', 'Turning a plugin off stops its tools and hooks right away.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Removing a plugin keeps the previous version for a while, so you can bring it back.</p>')
  }));
})();
