/* Plugins — add-ons that give the assistant new tools and connections.
   O55: the list owns its rows (Show menu, Add, each plugin's switch, remove); each line says what the plugin adds
   (tools and hooks), so the separate table that listed every plugin a second time is gone. Below the list: new
   plugins and updates, then limits and safety. The hook time limit is the real setting everywhere (the page kept its
   own "10 seconds" that disagreed with the setting's 5000 ms).
   Adding one is guided (PM51.wizard): find it in the catalog or pick a folder, review what it adds and what it may
   reach, set it up (sign in, keys kept in the keychain, its own choices), then install it on or off. A listed
   plugin that is not installed yet installs through the same review, and each plugin's settings can be changed
   later from its panel. */
(function () {
  const ID = 'plugins';
  const KEY = 'tools-integrations';
  const PREF_DEFAULTS = { updateReview: 'Always ask me' };
  const S = { list: 'extensions.plugins.packages', onoff: 'extensions.plugins.plugin-on-off', show: 'extensions.plugins.registry-view', catalog: 'extensions.plugins.add-from-catalog', local: 'extensions.plugins.add-local', remove: 'extensions.plugins.remove', autoNew: 'extensions.plugins.auto-enable-new', timeout: 'extensions.plugins.hook-timeout' };
  const timeoutText = () => { const ms = Number(PM51.value(S.timeout)) || 5000; return ms >= 1000 ? `${+(ms / 1000).toFixed(1)} seconds` : `${ms} ms`; };
  const plugins = () => PM51.s().plugins;
  const prefs = () => { const s = PM51.s(); if (!s.pluginsPrefs) s.pluginsPrefs = clone(PREF_DEFAULTS); return s.pluginsPrefs; };
  const byId = id => plugins().find(x => x.id === id);
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plugin';
  const uniqueId = base => { let id = base, n = 2; while (byId(id)) id = base + '-' + n++; return id; };
  const SOURCE_LABELS = { Bundled: 'Bundled with Puppet Master', Catalog: 'From the catalog', 'Local folder': 'From a folder on this computer' };
  const sourceLabel = s => SOURCE_LABELS[s] || s || 'Unknown';
  const installed = p => p.state !== 'Not installed';
  const adds = p => [p.tools ? `${p.tools} ${p.tools === 1 ? 'tool' : 'tools'}` : '', p.hooks ? `${p.hooks} ${p.hooks === 1 ? 'hook' : 'hooks'}` : ''].filter(Boolean).join(', ');
  const metaFor = p => [p.version === 'Bundled' ? 'Bundled with Puppet Master' : installed(p) ? `Version ${p.version} · ${sourceLabel(p.source)}` : sourceLabel(p.source), adds(p) ? `Adds ${adds(p)}` : ''].filter(Boolean).join(' · ');
  /* a plugin you just added stays in view whatever Show says, so it does not vanish the moment it is installed */
  const shown = list => { const v = PM51.value(S.show) || 'Active only'; return list.filter(x => x.justAdded || (v === 'All' ? true : v === 'Hide disabled' ? (x.enabled || x.locked) : (x.enabled || x.locked || !installed(x) || x.problem))); };
  const stateFor = p => !installed(p) ? 'Not installed' : p.problem ? 'Needs attention' : p.enabled ? 'Ready' : 'Off';
  const actionRow = (...buttons) => `<div class="pm51-plugins-actions">${buttons.join('')}</div>`;
  /* ---------- catalog ---------- */
  const CATALOG = [
    { id: 'calendar', name: 'Calendar Connector', icon: 'clock', publisher: 'Puppet Master Labs', version: '1.2.0', what: 'Reads your calendar and books meetings.', tools: 4, hooks: 1, permissions: ['Calendar events'], setup: [{ kind: 'signin', key: 'account', label: 'Calendar', options: ['Google Calendar', 'Outlook Calendar'] }] },
    { id: 'gmail', name: 'Gmail Connector', icon: 'external', publisher: 'Puppet Master Labs', version: '0.9.1', what: 'Reads mail, drafts replies and sends with your approval.', tools: 6, hooks: 2, permissions: ['Email read', 'Drafts', 'Send with approval'], setup: [{ kind: 'signin', key: 'account', label: 'Google account', options: ['Google'] }] },
    { id: 'jira', name: 'Jira', icon: 'list', publisher: 'Community', version: '2.3.1', what: 'Issues, sprints and boards in Jira.', tools: 9, hooks: 0, permissions: ['Issues', 'Comments'], setup: [{ kind: 'text', key: 'site', label: 'Jira site', placeholder: 'yourteam.atlassian.net' }, { kind: 'secret', key: 'token', label: 'API token', site: 'id.atlassian.com' }] },
    { id: 'confluence', name: 'Confluence', icon: 'file', publisher: 'Community', version: '1.4.0', what: 'Searches and updates your team\'s pages.', tools: 5, hooks: 0, permissions: ['Pages', 'Comments'], setup: [{ kind: 'text', key: 'site', label: 'Confluence site', placeholder: 'yourteam.atlassian.net/wiki' }, { kind: 'secret', key: 'token', label: 'API token', site: 'id.atlassian.com' }] },
    { id: 'docker', name: 'Docker Helper', icon: 'archive', publisher: 'Puppet Master Labs', version: '1.0.4', what: 'Builds, starts and inspects containers.', tools: 7, hooks: 1, permissions: ['Run containers', 'Read logs'], setup: [{ kind: 'select', key: 'host', label: 'Docker runs on', options: ['This server', 'Another Docker host'] }] },
    { id: 'vercel', name: 'Vercel Deploys', icon: 'rocket', publisher: 'Community', version: '0.6.2', what: 'Starts preview deploys and reads their status.', tools: 5, hooks: 1, permissions: ['Deployments', 'Project settings (read)'], setup: [{ kind: 'secret', key: 'token', label: 'Vercel token', site: 'vercel.com/account/tokens' }] },
    { id: 'stripe', name: 'Stripe', icon: 'database', publisher: 'Community', version: '1.1.0', what: 'Looks up customers and payments; writes only test data.', tools: 8, hooks: 0, permissions: ['Payments (read)', 'Test mode writes'], setup: [{ kind: 'secret', key: 'key', label: 'Restricted API key', site: 'dashboard.stripe.com/apikeys' }, { kind: 'select', key: 'mode', label: 'Which data', options: ['Test mode only', 'Live data, read only'] }] },
    { id: 'datadog', name: 'Datadog', icon: 'gauge', publisher: 'Community', version: '0.8.3', what: 'Reads dashboards, monitors and logs.', tools: 6, hooks: 0, permissions: ['Monitors (read)', 'Logs (read)'], setup: [{ kind: 'select', key: 'site', label: 'Datadog region', options: ['US1 (datadoghq.com)', 'EU (datadoghq.eu)', 'US3', 'US5'] }, { kind: 'secret', key: 'api', label: 'API key', site: 'app.datadoghq.com' }, { kind: 'secret', key: 'app', label: 'Application key', site: 'app.datadoghq.com' }] },
    { id: 'folder', name: 'From a folder', icon: 'folder', local: true, what: 'A plugin you or your team wrote, on this computer.' }
  ];
  const catalogItem = id => CATALOG.find(c => c.id === id);
  const onList = c => plugins().some(p => (p.id === c.id || p.name === c.name) && installed(p));
  const configText = (p, f) => { const v = (p.config || {})[f.key]; return f.kind === 'secret' ? (v ? 'Saved in the keychain' : 'Not set') : f.kind === 'signin' ? (v ? `Signed in · ${v}` : 'Not signed in') : (v || 'Not set'); };

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
#panel-settings .o55-plg-search { margin: 0 0 10px; }
#panel-settings .o55-plg-search .text-control { width: 100%; box-sizing: border-box; }
`);

  function render() {
    const list = plugins();
    const p = prefs();
    const visible = shown(list);
    const items = visible.map(x => ({
      title: x.name, meta: metaFor(x), note: x.problem || '', pill: PM51.pill(stateFor(x)), avatar: h(PM51.initials(x.name)),
      end: x.locked ? PM51.chip('Always on') : !installed(x) ? PM51.btn({ label: 'Install', small: true, icon: 'download', action: 'pm51-plugins-install', data: { id: x.id } }) : PM51.toggle(!!x.enabled, { action: 'pm51-plugins-toggle', data: { id: x.id }, label: `${x.name} on or off` }),
      action: 'pm51-plugins-open', data: { id: x.id }
    }));
    const add = PM51.home(S.catalog, PM51.home(S.local, PM51.btn({ label: 'Add plugin', icon: 'plus', action: 'pm51-plugins-add' }), 'span'), 'span');
    const toolbar = `<div class="o55-toolbar">${PM51.bound.select(S.show, { prefix: 'Show', width: 150 })}<span class="o55-toolbar-spacer"></span><span class="o55-quiet-line">${list.length - visible.length ? `${list.length - visible.length} hidden by Show` : `${list.length} ${list.length === 1 ? 'plugin' : 'plugins'}`}</span></div>`;
    const listBody = items.length ? PM51.list(items) : list.length ? '<div class="o55-skills-none">Nothing to show. Try Show: All.</div>' : PM51.empty('No plugins yet', 'Add one from the catalog or a folder on this computer.', { label: 'Add plugin', action: 'pm51-plugins-add', icon: 'plus' });
    const body = [
      `<div class="pm51-skills-list">${PM51.section({ title: 'Your plugins', help: 'Turn a plugin off to keep its tools away from the assistant. Open one to see what it adds.', action: add, body: PM51.home(S.list, PM51.home(S.onoff, PM51.home(S.remove, toolbar + listBody))) })}</div>`,
      PM51.section({ title: 'New plugins and updates', help: 'New plugins and updates can bring new tools, so you decide when they start.', body: PM51.bound.rows([S.autoNew]) + PM51.rows([
        { label: 'Before updating a plugin', help: 'Updates can ask for new permissions. Reviewing them keeps you in control.', control: PM51.select(p.updateReview, ['Always ask me', 'Ask only when permissions change', 'Update automatically'], { action: 'pm51-plugins-review', label: 'Before updating a plugin' }) }
      ]) }),
      PM51.advanced(PM51.section({ title: 'How plugins are checked', body: PM51.kv([['Signature', 'Checked before install and before every update'], ['Publisher', 'Shown in the plugin details before you install'], ['Known problems list', 'Checked before install and update'], ['Previous version', 'Kept so you can roll back'], ['Time limit', `${timeoutText()} for each step, set under Limits and safety`]]) + actionRow(PM51.btn({ label: 'Check all plugins', small: true, icon: 'test', action: 'pm51-plugins-diagnostics' })) }), { label: 'More options' })
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset the plugin list', action: 'pm51-plugins-reset' }, { label: 'How plugins work', action: 'pm51-plugins-help' }] });
  }
  PM51.manager('plugins', { render });
  [S.show, S.timeout].forEach(id => PM51.watch(id, () => PM51.refresh(ID, { swap: false })));

  function openPlugin(id) {
    const p = byId(id); if (!p) return;
    const state = stateFor(p);
    const setup = (catalogItem(p.id) || {}).setup || p.setup || [];
    PM51.panel({
      title: p.name, eyebrow: 'Plugin', icon: 'brackets', subtitle: metaFor(p), status: state,
      body: (p.problem ? PM51.note(p.problem, 'attention') : '')
        + PM51.panelSection('What it adds', PM51.kv([['Tools', p.tools ? `${p.tools} ${p.tools === 1 ? 'tool' : 'tools'} the assistant can call` : 'No tools'], ['Hooks', p.hooks ? `${p.hooks} ${p.hooks === 1 ? 'hook that runs' : 'hooks that run'} at key moments` : 'No hooks']]))
        + PM51.panelSection('Use it', PM51.rows([{ label: 'On', help: p.locked ? 'Bundled with Puppet Master and always on.' : !installed(p) ? 'Install the plugin first.' : 'Off keeps it installed but out of the way.', control: p.locked ? PM51.chip('Always on') : !installed(p) ? PM51.pill('Not installed') : PM51.toggle(!!p.enabled, { action: 'pm51-plugins-toggle', data: { id: p.id }, label: `${p.name} enabled` }) }]))
        + PM51.panelSection('Permissions', (p.permissions || []).length ? `<div class="pm51-chips">${p.permissions.map(x => PM51.chip(x)).join('')}</div>` : '<p class="pm51-ps-text">Asks for nothing extra.</p>', 'What the plugin may reach. Updates that ask for more are shown to you first.')
        + (setup.length ? PM51.panelSection('Settings', PM51.kv(setup.map(f => [f.label, configText(p, f)])) + actionRow(PM51.btn({ label: 'Change settings', small: true, icon: 'edit', action: 'pm51-plugins-configure', data: { id: p.id } })), 'Keys are kept in the keychain and never shown.', { icon: 'sliders' }) : '')
        + (p.problem ? PM51.panelSection('Fix it', PM51.rows([{ label: 'Plugin folder', help: p.problem, action: { label: 'Pick folder', icon: 'folder', action: 'pm51-plugins-pick-folder', data: { id: p.id } } }])) : '')
        + PM51.panelSection('Updates', PM51.rows([{ label: p.locked ? 'Updated together with Puppet Master' : installed(p) ? 'Up to date' : 'Not installed', help: p.locked ? 'Nothing to do here.' : installed(p) ? `You have version ${p.version}.` : '', action: p.locked || !installed(p) ? undefined : { label: 'Check for updates', icon: 'refresh', action: 'pm51-plugins-update', data: { id: p.id } } }]))
        + PM51.panelSection('Remove', actionRow(PM51.btn({ label: 'Remove plugin', small: true, danger: true, icon: 'trash', action: 'pm51-plugins-remove', data: { id: p.id }, disabled: !!p.locked, reason: 'Plugins bundled with Puppet Master cannot be removed. Turn it off instead.' })))
        + PM51.advanced(
          PM51.kv([['Manifest', p.source === 'Local folder' ? 'plugin.json in the plugin folder' : 'plugin.json from the package'], ['Identity', `${p.id} · ${p.version === 'Bundled' ? 'bundled build' : 'version ' + p.version}`], ['Containment', 'Runs in its own process with only the permissions above'], ['Evidence', 'Install receipt and last check kept in the plugin log']])
          + '',
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
    p.enabled = !p.enabled; p.state = stateFor(p); delete p.justAdded;
    const map = PM51.value(S.onoff); const next = Object.assign({}, map && typeof map === 'object' && !Array.isArray(map) ? map : {}, { [p.id]: p.enabled ? 'on' : 'off' });
    commitSettingValue(S.onoff, next);
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', p.enabled); el.setAttribute('aria-checked', String(p.enabled)); }
    saveState(); PM51.toast(p.enabled ? `${p.name} is on` : `${p.name} is off`, p.enabled ? 'Its tools are available again.' : 'Its tools and hooks stop right away.', 'success');
    if (!el.closest('.pm51-panel')) PM51.refresh(ID, { swap: false });
  });
  PM51.on('plugins-check', el => runCheck(ds(el, 'id')));
  /* ---------- guided add: find, review, set up, install ---------- */
  const draftFrom = c => ({ pick: c.id, local: !!c.local, name: c.local ? '' : c.name, publisher: c.publisher || 'You', version: c.version || '0.1.0', what: c.what, tools: c.tools || 0, hooks: c.hooks || 0, permissions: (c.permissions || []).slice(), setup: (c.setup || []).map(f => Object.assign({}, f)), config: {}, folder: '', turnOn: PM51.value(S.autoNew) === true || PM51.value(S.autoNew) === 'on' });
  function setupFields(d, editing) {
    if (!d.setup.length) return PM51.note('Nothing to set up. It works as soon as it is installed.', 'info');
    return `<div class="o55-setup-fields">${d.setup.map((f, i) => {
      const v = d.config[f.key];
      if (f.kind === 'signin') return PM51.field(f.label, `<span class="pm51-commands-inline">${f.options && f.options.length > 1 ? PM51.select(v || f.options[0], f.options, { cls: 'o55-plg-field', data: { key: f.key }, label: f.label }) : ''}${PM51.btn({ label: v ? 'Signed in' : 'Sign in with my browser', icon: v ? 'check' : 'external', small: true, action: 'pm51-plugins-signin', data: { key: f.key } })}</span>`, v ? `Signed in to ${v}.` : 'Your browser opens once; the sign-in is kept on your server.');
      if (f.kind === 'secret') return PM51.field(f.label, `<input class="text-control o55-plg-secret" data-key="${a(f.key)}" type="password" autocomplete="off" spellcheck="false" placeholder="${a(v || editing ? 'Leave empty to keep the saved one' : 'Paste it here')}"/>`, `${f.site ? `From ${f.site}. ` : ''}Kept in your server's keychain; never shown again.`);
      if (f.kind === 'select') return PM51.field(f.label, PM51.select(v || f.options[0], f.options, { cls: 'o55-plg-field', data: { key: f.key }, label: f.label }));
      return PM51.field(f.label, `<input class="text-control o55-plg-field" data-key="${a(f.key)}" value="${a(v || '')}" placeholder="${a(f.placeholder || '')}" autocomplete="off" spellcheck="false"${i === 0 ? ' data-autofocus' : ''}/>`);
    }).join('')}</div>`;
  }
  function collectSetup(wrap, d) {
    wrap.querySelectorAll('.o55-plg-field').forEach(el => { const k = el.dataset.key; if (k) d.config[k] = String(el.value || '').trim(); });
    wrap.querySelectorAll('.o55-plg-secret').forEach(el => { if (el.value.trim()) d.config[el.dataset.key] = '(saved)'; });
    const on = wrap.querySelector('.o55-plg-on'); if (on) d.turnOn = on.classList.contains('on');
  }
  const checkSetup = d => { const miss = d.setup.find(f => (f.kind === 'secret' || f.kind === 'text') && !d.config[f.key]); if (miss) return `${miss.kind === 'secret' ? 'Paste' : 'Enter'} the ${miss.label.toLowerCase()} first.`; const si = d.setup.find(f => f.kind === 'signin' && !String(d.config[f.key] || '').startsWith('Signed')); return si && !d.signedIn ? `Sign in to ${si.label.toLowerCase()} first.` : ''; };
  function reviewStep(d) {
    const folder = d.local ? PM51.field('Plugin folder', `<span class="pm51-commands-inline"><input class="text-control o55-plg-folder o55-setup-mono" value="${a(d.folder)}" placeholder="/home/you/plugins/team-lint" autocomplete="off" spellcheck="false" data-autofocus/>${PM51.btn({ label: 'Read it', icon: 'search', small: true, action: 'pm51-plugins-read-folder' })}</span>`, 'The folder that holds plugin.json.') : '';
    if (d.local && !d.name) return `<div class="o55-setup-fields">${folder}</div>`;
    return (folder ? `<div class="o55-setup-fields">${folder}</div>` : '')
      + PM51.panelSection('What it adds', PM51.kv([['Tools', d.tools ? `${d.tools} the assistant can call` : 'None'], ['Hooks', d.hooks ? `${d.hooks} that run at key moments` : 'None'], ['From', `${d.publisher} · version ${d.version}`]]), d.what, { icon: 'brackets' })
      + PM51.panelSection('What it may reach', d.permissions.length ? PM51.rows(d.permissions.map(x => ({ label: x, control: `<span class="pm51-row-value">${icon('check')}</span>` }))) : '<p class="pm51-ps-text">Nothing beyond its own folder.</p>', 'It never gets more than this. An update that asks for more is shown to you first.', { icon: 'lock' })
      + PM51.panelSection('Safety checks', PM51.steps([{ title: 'Signature', desc: d.local ? 'A local folder is not signed; you are trusting its author.' : `Signed by ${d.publisher}`, status: d.local ? 'Unsigned' : 'Example', tone: d.local ? 'attention' : 'info' }, { title: 'Known problems list', desc: 'Nothing reported for this version', status: 'Example', tone: 'info' }]), '', { icon: 'shield' });
  }
  function pluginWizard(pick, { install } = {}) {
    const existing = install ? byId(install) : null;
    const steps = [];
    if (!pick && !existing) steps.push({ label: 'Find', title: 'What should the assistant be able to use?', lead: 'Plugins bundle tools and connections. Search, or pick one below.', render: d => `<div class="o55-plg-search">${PM51.input('', { placeholder: 'Search plugins', type: 'search', cls: 'o55-plg-q', label: 'Search plugins' })}</div>` + PM51.tiles(CATALOG.map(c => ({ title: c.name, text: c.what, meta: c.local ? 'Unsigned · your own' : `${c.publisher} · ${c.tools} tools`, icon: c.icon, selected: d.pick === c.id, done: !c.local && onList(c), doneReason: `${c.name} is already installed.`, data: { pick: c.id } })), { action: 'pm51-plugins-pick' }), check: d => d.pick ? '' : 'Pick a plugin to go on.', onShow: wrap => { const q = wrap.querySelector('.o55-plg-q'); if (q) q.addEventListener('input', () => { const s = q.value.trim().toLowerCase(); wrap.querySelectorAll('.o55g-card').forEach(t => { t.hidden = !!s && !t.textContent.toLowerCase().includes(s); }); }); } });
    steps.push({ label: 'Review', icon: 'shield', title: 'Is this what you expect?', lead: 'What it adds, and everything it may reach. It never gets more without asking you.', recap: d => d.name ? `${d.publisher || 'You'} · ${d.version}` : '', render: reviewStep, collect: (wrap, d) => { const f = wrap.querySelector('.o55-plg-folder'); if (f) d.folder = f.value.trim(); }, check: d => d.local && !d.name ? 'Pick the folder and read it first.' : '' });
    steps.push({ label: 'Set up', icon: 'sliders', title: 'A few details so it can work', lead: 'Anything it needs from you. Keys go to your server\'s keychain and are never shown again.', render: d => setupFields(d) + PM51.rows([{ label: 'Turn it on after installing', help: 'Off installs it but keeps its tools away until you switch it on.', control: `<span class="o55-plg-on-wrap">${PM51.toggle(d.turnOn, { action: 'pm51-plugins-wtoggle', label: 'Turn it on after installing', cls: 'o55-plg-on' }).replace('class="toggle pm51-toggle', 'class="toggle pm51-toggle o55-plg-on')}</span>` }]), collect: collectSetup, check: checkSetup });
    const c = pick ? catalogItem(pick) : existing ? (catalogItem(existing.id) || { id: existing.id, name: existing.name, what: 'Listed but not installed yet.', publisher: sourceLabel(existing.source), version: existing.version || '1.0.0', tools: existing.tools, hooks: existing.hooks, permissions: existing.permissions, setup: [] }) : null;
    PM51.wizard({
      title: existing ? `Install ${existing.name}` : 'Add a plugin', subtitle: 'Plugins give the assistant new tools and connections. You review what they may reach first.', eyebrow: 'Plugin', icon: 'brackets',
      steps, draft: c ? draftFrom(c) : { pick: null }, finishLabel: 'Install',
      onFinish: d => {
        const fields = { name: d.name, version: d.version, source: d.local ? 'Local folder' : 'Catalog', state: '', enabled: d.turnOn, hooks: d.hooks, tools: d.tools, permissions: d.permissions, config: d.config, folder: d.folder || undefined };
        let p = existing || plugins().find(x => x.id === d.pick);
        if (p) Object.assign(p, fields); else { p = Object.assign({ id: uniqueId(slug(d.name)) }, fields); plugins().push(p); }
        p.problem = ''; p.state = stateFor(p); p.justAdded = true;
        const map = PM51.value(S.onoff); commitSettingValue(S.onoff, Object.assign({}, map && typeof map === 'object' && !Array.isArray(map) ? map : {}, { [p.id]: p.enabled ? 'on' : 'off' }));
        saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast(`${p.name} installed`, `${p.enabled ? 'It is on. ' : 'It is installed and off. '}Example only: nothing was downloaded in this preview.`, 'info');
      }
    });
  }
  PM51.on('plugins-add', () => pluginWizard(null));
  PM51.on('plugins-install', el => pluginWizard(null, { install: ds(el, 'id') }));
  PM51.on('plugins-pick', el => { const w = PM51.wizardOf(el); const c = catalogItem(ds(el, 'pick')); if (!w || !c) return; Object.assign(w.draft, draftFrom(c)); w.next(); });
  PM51.on('plugins-read-folder', el => {
    const w = PM51.wizardOf(el); if (!w) return; const f = el.closest('.drawer-wrap').querySelector('.o55-plg-folder'); const path = String(f && f.value || '').trim();
    if (!path) { PM51.toast('Folder needed', 'Paste the folder that holds plugin.json.', 'info'); return; }
    const base = path.split(/[\\/]/).filter(Boolean).pop() || 'my-plugin';
    Object.assign(w.draft, { folder: path, name: base.replace(/[-_]+/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()), publisher: 'You', version: '0.1.0', what: 'Read from plugin.json in the folder (example).', tools: 2, hooks: 1, permissions: ['Read project files'] });
    w.go(w.draft.pick ? (catalogItem(w.draft.pick) ? 1 : 0) : 0);
  });
  PM51.on('plugins-signin', el => { const w = PM51.wizardOf(el); if (!w) return; const wrap = el.closest('.drawer-wrap'); collectSetup(wrap, w.draft); const key = ds(el, 'key'); const f = w.draft.setup.find(x => x.key === key); const which = (wrap.querySelector(`.o55-plg-field[data-key="${key}"]`) || {}).value || (f && f.options && f.options[0]) || 'your account'; w.draft.config[key] = which; w.draft.signedIn = true; PM51.toast('Signed in', `Example only: no browser opened. ${which} is marked signed in.`, 'info'); w.go(w.draft.editing ? 0 : (el.closest('.drawer-wrap').querySelectorAll('.pm51-hero-rail li').length - 1)); });
  PM51.on('plugins-wtoggle', el => { el.classList.toggle('on'); el.setAttribute('aria-checked', String(el.classList.contains('on'))); });
  /* change a plugin's own settings later */
  PM51.on('plugins-configure', el => {
    const p = byId(ds(el, 'id')); if (!p) return; const c = catalogItem(p.id); const setup = (c && c.setup) || [];
    PM51.wizard({ title: `${p.name} settings`, subtitle: 'Saved keys stay unless you paste new ones.', eyebrow: 'Plugin', icon: 'brackets', finishLabel: 'Save',
      draft: { editing: true, setup: setup.map(f => Object.assign({}, f)), config: Object.assign({}, p.config || {}), signedIn: true },
      steps: [{ label: 'Settings', icon: 'sliders', title: `How should ${p.name} work?`, render: d => setupFields(d, true), collect: collectSetup }],
      onFinish: d => { p.config = d.config; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Settings saved', `${p.name} uses them from its next run.`); } });
  });
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
      PM51.s().plugins = plugins().filter(x => x.id !== p.id); saveState(); closeOverlay(false); PM51.refresh(ID, { swap: false }); PM51.toast(`${p.name} removed`, 'It is no longer on your list.');
    }, true);
  });
  PM51.onChange('plugins-review', el => { prefs().updateReview = el.value; saveState(); });
  PM51.on('plugins-diagnostics', () => PM51.check({ title: 'Check all plugins', steps: [
    { title: 'Plugin folders readable', desc: 'Every listed plugin has a folder or package' },
    { title: 'Manifests parsed', desc: `${plugins().length} manifests read without errors`, status: 'Example', tone: 'info' },
    { title: 'Hooks within the time limit', desc: `Every hook finished within ${timeoutText()}`, status: 'Example', tone: 'info' }
  ] }));
  PM51.on('plugins-reset', () => PM51.confirm('Reset the plugin list?', 'Your plugin list and the update choice go back to their defaults. Other choices keep their values; use About on a row to reset one.', 'Reset', () => {
    PM51.s().plugins = clone(DATA.plugins); PM51.s().pluginsPrefs = clone(PREF_DEFAULTS); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Plugins reset', 'Defaults are back.');
  }));
  PM51.on('plugins-help', () => PM51.panel({
    title: 'How plugins work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A plugin is a package that adds tools the assistant can call, or hooks that run at key moments. The GitHub plugin, for example, lets the assistant read and open pull requests.</p>')
      + PM51.panelSection('Staying safe', PM51.kv([['Permissions', 'Every plugin lists what it may reach. You see the list before it runs.'], ['Updates', 'An update that asks for more is shown to you before it is applied.'], ['Off switch', 'Turning a plugin off stops its tools and hooks right away.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Removing a plugin keeps the previous version for a while, so you can bring it back.</p>')
  }));
})();
