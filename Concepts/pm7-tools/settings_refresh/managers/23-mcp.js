/* MCP Servers — outside tools and services the assistant can call. */
(function () {
  const ID = 'mcp';
  const KEY = 'tools-integrations';
  const PREF_DEFAULTS = { askFirst: true, timeout: '30 seconds', lazyTools: true };
  const servers = () => PM51.s().mcps;
  const prefs = () => { const s = PM51.s(); if (!s.mcpPrefs) s.mcpPrefs = clone(PREF_DEFAULTS); return s.mcpPrefs; };
  const byId = id => servers().find(x => x.id === id);
  const engineById = id => ((state.toolchain && state.toolchain.mcps) || []).find(x => x.id === id);
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'server';
  const uniqueId = base => { let id = base, n = 2; while (byId(id)) id = base + '-' + n++; return id; };
  const SCOPE_LABELS = { 'PM managed': 'Managed by Puppet Master', 'Project only': 'This project only', External: 'Outside service' };
  const scopeLabel = s => SCOPE_LABELS[s] || s || 'This project only';
  const PERMISSIONS = ['Ask for writes', 'Protected files only', 'Read only'];
  const isWeb = m => /web/i.test(m.transport || '');
  const isOn = m => m.enabled !== false;
  const stateFor = m => !isOn(m) ? 'Off' : m.state;
  const primaryFor = m => !isOn(m) ? 'Turn on' : m.primary || 'Configure';
  const PRIMARY_ICONS = { Configure: 'sliders', 'Set up': 'sliders', Reconnect: 'refresh', Repair: 'refresh', Install: 'download', Disable: 'pause', Remove: 'trash', 'View logs': 'terminal', 'Turn on': 'play' };
  const toolLabel = t => humanize(String(t || '').replace(/_/g, ' ')).replace(/\b(\w)(\w*)/g, (m, f, r) => f + r.toLowerCase()).replace(/^\w/, c => c.toUpperCase());
  const actionRow = (...buttons) => `<div class="pm51-mcp-actions">${buttons.join('')}</div>`;
  const launchText = m => { const e = engineById(m.id); if (isWeb(m)) return m.url || (e && e.url) || 'No address yet'; const cmd = e ? [e.command].concat(e.args || []).filter(Boolean).join(' ') : m.command || ''; return cmd || 'No command yet'; };

  PM51.style(`
#panel-settings .pm51-mcp-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-mcp-actions:first-child { margin-top: 0; }
#panel-settings .pm51-mcp-log { margin: 0; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.55; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
`);

  function render() {
    const list = servers();
    const p = prefs();
    const items = list.map(m => ({
      title: m.name, pill: PM51.pill(stateFor(m)), meta: `${m.description} · ${scopeLabel(m.scope)}`, note: isOn(m) ? (m.remediation || '') : '',
      avatar: icon(isWeb(m) ? 'network' : 'terminal'),
      end: PM51.btn({ label: primaryFor(m), small: true, icon: PRIMARY_ICONS[primaryFor(m)] || 'sliders', action: 'pm51-mcp-primary', data: { id: m.id } }),
      action: 'pm51-mcp-open', data: { id: m.id }
    }));
    const body = [
      PM51.section({
        title: 'Servers', help: 'Each server gives the assistant a set of tools. Open one to choose which tools it may use.',
        action: { label: 'Add server', icon: 'plus', action: 'pm51-mcp-add' },
        body: items.length ? PM51.list(items) : PM51.empty('No servers yet', 'Add one, or look for servers other apps already use.', { label: 'Add server', action: 'pm51-mcp-add', icon: 'plus' })
      }),
      PM51.section({
        title: 'Import', help: 'Claude Desktop, Cursor, and VS Code keep their own server lists. Puppet Master can reuse them.',
        body: PM51.rows([
          { label: 'Import from other apps', help: 'Looks for servers set up in Claude Desktop, Cursor, and VS Code.', action: { label: 'Look for servers', icon: 'search', action: 'pm51-mcp-import' } },
          { label: 'Ask me first', help: 'Shows what was found before adding anything.', control: PM51.toggle(!!p.askFirst, { action: 'pm51-mcp-pref', data: { pref: 'askFirst' }, label: 'Ask me first' }) }
        ])
      }),
      PM51.advanced([
        PM51.section({ title: 'How each server starts', help: 'The program or address behind each server.', body: PM51.kv(list.map(m => [m.name, `${isWeb(m) ? 'Address' : 'Command'}: ${launchText(m)}`])) }),
        PM51.rows([
          { label: 'Connection time limit', help: 'How long to wait for a server before giving up.', control: PM51.select(p.timeout, ['10 seconds', '30 seconds', '1 minute', '2 minutes'], { action: 'pm51-mcp-timeout', label: 'Connection time limit' }) },
          { label: 'Load tools only when needed', help: 'Keeps the assistant\'s tool list short. A server\'s tools load the first time they are useful.', control: PM51.toggle(!!p.lazyTools, { action: 'pm51-mcp-pref', data: { pref: 'lazyTools' }, label: 'Load tools only when needed' }) }
        ]),
        PM51.section({ title: 'Technical details', body: PM51.kv([['Sign-in for web servers', 'Handled in your browser when a server asks for it'], ['Secrets', 'Kept in the credential store, never in settings files'], ['Logs', 'Kept per server with secrets hidden']]) + actionRow(PM51.btn({ label: 'View logs', small: true, icon: 'terminal', action: 'pm51-mcp-logs' }), PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-mcp-diagnostics' })) })
      ].join(''))
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset MCP settings', action: 'pm51-mcp-reset' }, { label: 'How MCP servers work', action: 'pm51-mcp-help' }] });
  }
  PM51.manager('mcp', { render });

  function openServer(id) {
    const m = byId(id); if (!m) return;
    const e = engineById(id) || {};
    const off = new Set(m.disabledTools || []);
    const tools = m.toolList || [];
    PM51.panel({
      title: m.name, subtitle: m.description, pill: PM51.pill(stateFor(m)),
      body: (isOn(m) && m.remediation ? PM51.note(m.remediation, 'attention') : '')
        + PM51.panelSection('How it connects', PM51.kv([
          ['Kind', isWeb(m) ? 'Connects to a web address' : 'Runs a program on this computer'],
          [isWeb(m) ? 'Address' : 'Command', launchText(m)],
          ['Where it applies', scopeLabel(m.scope)]
        ]))
        + PM51.panelSection('Use it', PM51.rows([{ label: 'Enabled', help: 'Off keeps the server on your list but the assistant will not call it.', control: PM51.toggle(isOn(m), { action: 'pm51-mcp-toggle', data: { id: m.id }, label: `${m.name} enabled` }) }]))
        + PM51.panelSection('Tools', tools.length
          ? PM51.rows(tools.map(t => ({ label: toolLabel(t), control: PM51.toggle(!off.has(t), { action: 'pm51-mcp-tool', data: { id: m.id, tool: t }, label: toolLabel(t) }) })))
          : `<p class="pm51-ps-text">${h(m.tools ? `${m.tools} tools. Connect the server to see the full list.` : 'No tools yet. They appear once the server connects.')}</p>`,
          tools.length ? `${m.tools} tools in total. Turn one off to keep the assistant from using it.` : '')
        + PM51.panelSection('Permissions', PM51.rows([{ label: 'What it may do', help: 'Ask for writes checks with you before anything changes.', control: PM51.select(PERMISSIONS.includes(m.permissions) ? m.permissions : 'Ask for writes', PERMISSIONS, { action: 'pm51-mcp-permissions', data: { id: m.id }, label: 'Permissions' }) }]))
        + PM51.advanced(
          PM51.kv([
            [isWeb(m) ? 'Address' : 'Launch command', launchText(m)],
            [isWeb(m) ? 'Headers' : 'Environment', ((isWeb(m) ? e.headers : e.env) || []).length ? (isWeb(m) ? e.headers : e.env).join(' · ') : 'None'],
            ['Sign-in', isWeb(m) ? 'Browser sign-in when the service asks' : 'Not needed'],
            ['Time limit', prefs().timeout]
          ]) + actionRow(
            PM51.btn({ label: 'View logs', small: true, icon: 'terminal', action: 'pm51-mcp-logs', data: { id: m.id } }),
            PM51.btn({ label: 'Remove server', small: true, danger: true, icon: 'trash', action: 'pm51-mcp-remove', data: { id: m.id } })
          ), { label: 'Advanced' }),
      primaryLabel: 'Check connection', onPrimary: () => { runCheck(m.id); }
    });
  }

  function runCheck(id) {
    const m = byId(id); if (!m) return;
    const broken = isOn(m) && m.state !== 'Working';
    PM51.check({
      title: `Check ${m.name}`, outcome: broken ? `${m.state} · example data` : undefined, tone: broken ? 'attention' : undefined,
      steps: [
        { title: isWeb(m) ? 'Address reachable' : 'Program starts', desc: launchText(m), status: broken ? 'No answer' : 'Checked', tone: broken ? 'attention' : 'ready' },
        { title: 'Sign-in accepted', desc: isWeb(m) ? (broken ? 'Could not check without an answer' : 'Current sign-in accepted') : 'Not needed for a local program', status: broken ? 'Not checked' : 'Checked', tone: broken ? 'attention' : 'ready' },
        { title: 'Tools listed', desc: m.tools ? `${m.tools} tools reported` : 'No tools reported yet', status: 'Example', tone: 'info' }
      ]
    });
  }

  function openLogs(id) {
    const m = byId(id);
    const lines = m
      ? (isOn(m) && m.state !== 'Working'
        ? [`11:02:14  Connecting to ${launchText(m)}`, '11:02:44  No answer after 30 seconds', '11:02:44  Giving up. Check the address or sign in again.']
        : [`10:58:01  ${isWeb(m) ? 'Connected to' : 'Started'} ${launchText(m)}`, `10:58:02  ${m.tools} tools listed`, '10:58:02  Ready'])
      : servers().map(x => `10:58:0${servers().indexOf(x) + 1}  ${x.name}: ${stateFor(x)}`);
    PM51.panel({
      title: m ? `${m.name} logs` : 'MCP logs', subtitle: 'Example data only. Real logs appear here in the app.',
      body: PM51.panelSection('Recent lines', `<pre class="pm51-mcp-log">${h(lines.join('\n'))}</pre>`) + PM51.note('Logs never include secrets. Anything sensitive is hidden before it is shown.', 'info')
    });
  }

  PM51.on('mcp-open', el => openServer(ds(el, 'id')));
  PM51.on('mcp-primary', el => {
    const m = byId(ds(el, 'id')); if (!m) return;
    const action = primaryFor(m);
    if (action === 'Turn on') { m.enabled = true; saveState(); PM51.refresh(ID, { swap: false }); return; }
    if (action === 'Disable') { m.enabled = false; saveState(); PM51.refresh(ID, { swap: false }); return; }
    if (action === 'Reconnect' || action === 'Repair') { runCheck(m.id); return; }
    if (action === 'Remove') { removeServer(m.id); return; }
    if (action === 'View logs') { openLogs(m.id); return; }
    if (action === 'Install') { PM51.unavailable('Install', 'Installing a server program happens only in the real app.'); return; }
    openServer(m.id);
  });
  PM51.on('mcp-toggle', el => {
    const m = byId(ds(el, 'id')); if (!m) return;
    m.enabled = !isOn(m);
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', m.enabled); el.setAttribute('aria-checked', String(m.enabled)); }
    saveState(); PM51.refresh(ID, { swap: false });
  });
  PM51.on('mcp-tool', el => {
    const m = byId(ds(el, 'id')); const tool = ds(el, 'tool'); if (!m || !tool) return;
    const off = new Set(m.disabledTools || []);
    if (off.has(tool)) off.delete(tool); else off.add(tool);
    m.disabledTools = [...off];
    el.classList.toggle('on', !off.has(tool)); el.setAttribute('aria-checked', String(!off.has(tool)));
    saveState();
  });
  PM51.onChange('mcp-permissions', el => { const m = byId(ds(el, 'id')); if (!m) return; m.permissions = el.value; saveState(); });
  PM51.on('mcp-check', el => runCheck(ds(el, 'id')));
  PM51.on('mcp-logs', el => openLogs(ds(el, 'id')));
  function removeServer(id) {
    const m = byId(id); if (!m) return;
    PM51.confirm(`Remove ${m.name}?`, 'The assistant loses its tools. Nothing is uninstalled from your computer.', 'Remove', () => {
      PM51.s().mcps = servers().filter(x => x.id !== id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${m.name} removed`, 'It is no longer on your list.');
    }, true);
  }
  PM51.on('mcp-remove', el => removeServer(ds(el, 'id')));
  PM51.on('mcp-add', () => openDialog({
    title: 'Add server', subtitle: 'A server can be a program on this computer or a service at a web address.',
    body: formField('Kind', 'kind', 'program', { type: 'select', full: true, choices: [{ value: 'program', label: 'Run a program on this computer' }, { value: 'web', label: 'Connect to a web address' }] })
      + formField('Name', 'name', '', { placeholder: 'e.g. Notion', autofocus: true })
      + formField('Program or address', 'target', '', { placeholder: 'e.g. npx notion-mcp, or https://…' }),
    saveLabel: 'Add server',
    onSave: data => {
      const name = String(data.name || '').trim(); if (!name) { PM51.toast('Name needed', 'Give the server a name first.', 'info'); return false; }
      const web = data.kind === 'web'; const target = String(data.target || '').trim();
      const id = uniqueId(slug(name));
      servers().push({ id, name, description: 'Added by you', state: 'Not set up', scope: 'Project only', transport: web ? 'Web address' : 'Runs a program', tools: 0, permissions: 'Read only', primary: 'Set up', toolList: [], url: web ? target : '', command: web ? '' : target, enabled: true });
      saveState(); PM51.refresh(ID, { swap: false });
      PM51.toast('Server added to your list', 'Example data only. Nothing was started or connected in this preview.', 'info');
    }
  }));
  PM51.on('mcp-import', () => PM51.check({
    title: 'Look for servers in other apps', subtitle: 'Example data only. Nothing was imported in this preview.',
    outcome: 'Found 3 · example data', tone: 'info',
    steps: [
      { title: 'Claude Desktop', desc: 'Settings file found · 2 servers', status: 'Found 2', tone: 'ready' },
      { title: 'Cursor', desc: 'No server list on this computer', status: 'None', tone: 'off' },
      { title: 'VS Code', desc: 'Settings file found · 1 server', status: 'Found 1', tone: 'ready' },
      { title: 'Next step', desc: prefs().askFirst ? 'You would pick which ones to add' : 'They would be added to your list', status: 'Example', tone: 'info' }
    ]
  }));
  PM51.on('mcp-pref', el => { const key = ds(el, 'pref'); if (!(key in PREF_DEFAULTS)) return; prefs()[key] = !prefs()[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onChange('mcp-timeout', el => { prefs().timeout = el.value; saveState(); });
  PM51.on('mcp-diagnostics', () => PM51.check({ title: 'MCP diagnostics', steps: [
    { title: 'Server list readable', desc: `${servers().length} servers on your list` },
    { title: 'Programs on this computer', desc: 'Each local program is looked up', status: 'Example', tone: 'info' },
    { title: 'Web addresses reachable', desc: 'Each address is pinged', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('mcp-reset', () => PM51.confirm('Reset MCP settings?', 'Your server list and the options under Advanced go back to their defaults.', 'Reset', () => {
    PM51.s().mcps = clone(DATA.mcps); PM51.s().mcpPrefs = clone(PREF_DEFAULTS); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('MCP settings reset', 'Defaults are back.');
  }));
  PM51.on('mcp-help', () => PM51.panel({
    title: 'How MCP servers work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">MCP is a common way for the assistant to talk to outside tools. Each server offers a set of tools, such as reading issues from GitHub or files from this project.</p>')
      + PM51.panelSection('Two kinds', PM51.kv([['Runs a program', 'Puppet Master starts a small program on this computer and talks to it.'], ['Web address', 'Puppet Master connects to a service online, signing in when needed.']]))
      + PM51.panelSection('Staying in control', '<p class="pm51-ps-text">Every server has a permission level. Ask for writes means the assistant checks with you before anything changes. You can also turn off single tools.</p>')
  }));
})();
