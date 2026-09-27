/* MCP Servers — outside tools and services the assistant can call.
   O55: the server list owns every per-server setting (on/off, single tools, how it connects, where it applies, its
   address or launch details, sign in again, sign out, logs), all in each server's panel; Import uses the real
   'importing servers from other apps' choice (the page kept its own 'Ask me first' switch beside it), and the time
   limit is the real setting (the page kept its own '30 seconds'). Connection defaults follow as a group.
   Setup is guided (PM51.wizard): pick a server from a catalog of common ones, or build your own; say how it
   connects (a program and its secret values, or a web address and how it signs in); test it; then choose its
   tools and what it may do. The same steps change how an existing server connects, and bringing servers over
   from other apps lets you pick which ones. Secret values go to the server's keychain and are never shown. */
(function () {
  const ID = 'mcp';
  const KEY = 'tools-integrations';
  const PREF_DEFAULTS = {};
  const S = { list: 'system.mcp.server-list', onoff: 'system.mcp.server-enabled', tool: 'system.mcp.tool-toggle', health: 'system.mcp.health-status', signout: 'system.mcp.sign-out', transport: 'system.mcp.transport', scope: 'system.mcp.server-scope', launch: 'system.mcp.launch-config', url: 'system.mcp.remote-url', headers: 'system.mcp.remote-headers', refresh: 'system.mcp.oauth-refresh', importing: 'system.mcp.import-external', timeout: 'system.mcp.timeout', debug: 'system.mcp.debug-surface' };
  const timeoutText = () => { const ms = Number(PM51.value(S.timeout)) || 30000; return ms >= 1000 ? `${+(ms / 1000).toFixed(1)} seconds` : `${ms} ms`; };
  const askFirst = () => PM51.value(S.importing) !== 'Off until reviewed';
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
  const launchText = m => { const e = engineById(m.id); if (isWeb(m)) return m.url || (e && e.url) || 'No address yet'; const cmd = m.command || (e ? [e.command].concat(e.args || []).filter(Boolean).join(' ') : ''); return cmd || 'No command yet'; };
  /* ---------- catalog: common servers, ready to set up ---------- */
  const CATALOG = [
    { id: 'github', name: 'GitHub', icon: 'branch', kind: 'program', what: 'Issues, pull requests and code on GitHub.', command: 'npx -y @modelcontextprotocol/server-github', secrets: [{ name: 'GITHUB_TOKEN', label: 'GitHub access token', site: 'github.com/settings/tokens' }], tools: ['search_issues', 'create_issue', 'list_pull_requests', 'get_file_contents', 'create_pull_request', 'add_issue_comment'], permissions: 'Ask for writes' },
    { id: 'filesystem', name: 'Files on this computer', icon: 'folder', kind: 'program', what: 'Read and write files in folders you allow.', command: 'npx -y @modelcontextprotocol/server-filesystem', folders: true, tools: ['read_file', 'write_file', 'list_directory', 'search_files', 'move_file'], permissions: 'Protected files only' },
    { id: 'linear', name: 'Linear', icon: 'list', kind: 'web', what: 'Issues and projects in Linear.', url: 'https://mcp.linear.app/sse', transport: 'sse', auth: 'browser', tools: ['list_issues', 'create_issue', 'update_issue', 'list_projects'] },
    { id: 'notion', name: 'Notion', icon: 'file', kind: 'web', what: 'Pages and databases in your Notion workspace.', url: 'https://mcp.notion.com/mcp', auth: 'browser', tools: ['search', 'fetch_page', 'create_page', 'update_page'] },
    { id: 'sentry', name: 'Sentry', icon: 'alert', kind: 'web', what: 'Errors and crashes your apps report.', url: 'https://mcp.sentry.dev/mcp', auth: 'browser', tools: ['list_issues', 'get_issue_details', 'resolve_issue'], permissions: 'Read only' },
    { id: 'figma', name: 'Figma', icon: 'image', kind: 'web', what: 'Designs, frames and exports from Figma.', url: 'https://mcp.figma.com/mcp', auth: 'browser', tools: ['get_file', 'get_node', 'export_images'], permissions: 'Read only' },
    { id: 'postgres', name: 'Postgres database', icon: 'database', kind: 'program', what: 'Look at tables and run read-only queries.', command: 'npx -y @modelcontextprotocol/server-postgres', secrets: [{ name: 'DATABASE_URL', label: 'Database address', site: 'your database host', placeholder: 'postgres://user@host/db' }], tools: ['query', 'list_tables', 'describe_table'], permissions: 'Read only' },
    { id: 'playwright', name: 'Web browser', icon: 'globe', kind: 'program', what: 'Open pages, click and take screenshots.', command: 'npx -y @playwright/mcp', tools: ['navigate', 'click', 'type', 'screenshot', 'snapshot'] },
    { id: 'memory', name: 'Knowledge graph', icon: 'memory', kind: 'program', what: 'A small memory of facts the assistant builds up.', command: 'npx -y @modelcontextprotocol/server-memory', tools: ['create_entities', 'search_nodes', 'read_graph'] },
    { id: 'fetch', name: 'Page fetcher', icon: 'download', kind: 'program', what: 'Reads a web page and turns it into text.', command: 'uvx mcp-server-fetch', tools: ['fetch'] },
    { id: 'custom', name: 'Something else', icon: 'plus', custom: true, what: 'Any other server: a program on this computer or a web address.' }
  ];
  const catalogItem = id => CATALOG.find(c => c.id === id);
  const onList = c => servers().some(m => m.name.toLowerCase().replace(/ mcp$/, '') === c.name.toLowerCase() || m.catalogId === c.id);
  const draftFrom = c => ({ pick: c.id, kind: c.custom ? 'program' : c.kind, name: c.custom ? '' : c.name, description: c.custom ? '' : c.what, command: c.command || '', url: c.url || '', transport: c.transport || (c.kind === 'web' ? 'http' : 'stdio'), auth: c.auth || 'browser', key: '', secrets: (c.secrets || []).map(s => Object.assign({ value: '' }, s)), folders: c.folders ? 'This project' : '', scope: 'Project only', tools: (c.tools || []).slice(), off: [], permissions: c.permissions || 'Ask for writes' });
  const draftOf = m => ({ pick: m.catalogId || 'custom', editing: m.id, kind: isWeb(m) ? 'web' : 'program', name: m.name, description: m.description, command: isWeb(m) ? '' : launchText(m), url: isWeb(m) ? launchText(m) : '', transport: m.wireTransport || (isWeb(m) ? 'http' : 'stdio'), auth: m.auth || 'browser', key: '', secrets: (m.secretNames || []).map(n => ({ name: n, label: n, value: '', saved: true })), folders: m.folders || '', scope: m.scope === 'PM managed' ? 'PM managed' : 'Project only', tools: (m.toolList || []).slice(), off: (m.disabledTools || []).slice(), permissions: PERMISSIONS.includes(m.permissions) ? m.permissions : 'Ask for writes' });
  const field = (label, control, help) => PM51.field(label, control, help);
  const txt = (cls, value, placeholder, extra = '') => `<input class="text-control ${cls}" value="${a(value || '')}" placeholder="${a(placeholder || '')}" autocomplete="off" spellcheck="false"${extra}/>`;
  function connectStep(d) {
    const kindPick = d.pick === 'custom' && !d.editing ? field('What kind of server', PM51.segmented(d.kind, [['program', 'A program on this computer'], ['web', 'A web address']], { action: 'pm51-mcp-kind', label: 'What kind of server' })) : '';
    const name = field('Name', txt('o55-mcp-name', d.name, 'e.g. Team wiki', ' data-autofocus'), 'How it appears in your list and in chat.');
    const scope = field('Where it can be used', PM51.select(d.scope, [['Project only', 'This project only'], ['PM managed', 'Every project']], { cls: 'o55-mcp-scope', label: 'Where it can be used' }));
    if (d.kind === 'web') {
      return `<div class="o55-setup-fields">${kindPick}${name}${field('Address', txt('o55-mcp-url o55-setup-mono', d.url, 'https://…'), 'The server\'s web address. The service\'s own docs list it.')}`
        + field('How it signs in', PM51.select(d.auth, [['browser', 'Sign in with my browser'], ['key', 'With an API key'], ['none', 'No sign-in']], { cls: 'o55-mcp-auth', label: 'How it signs in', action: 'pm51-mcp-auth' }), d.auth === 'browser' ? 'Puppet Master opens your browser once to sign in, then keeps the sign-in on your server.' : '')
        + (d.auth === 'key' ? field('API key', '<input class="text-control o55-mcp-key" type="password" autocomplete="off" spellcheck="false" placeholder="' + (d.editing ? 'Leave empty to keep the saved one' : 'Paste it here') + '"/>', 'Kept in your server\'s keychain and sent as the Authorization header. Never shown again.') : '')
        + field('How it talks', PM51.select(d.transport === 'sse' ? 'sse' : 'http', [['http', 'Streaming web requests (most services)'], ['sse', 'Server-sent events (older services)']], { cls: 'o55-mcp-transport', label: 'How it talks' }))
        + `${scope}</div>`;
    }
    const secrets = d.secrets.map((s, i) => field(s.label || s.name, `<input class="text-control o55-mcp-secret" data-i="${i}" type="password" autocomplete="off" spellcheck="false" placeholder="${a(s.saved ? 'Leave empty to keep the saved one' : (s.placeholder || 'Paste it here'))}"/>`, `${s.site ? `From ${s.site}. ` : ''}Kept in your server's keychain as ${s.name}; never shown again.`)).join('');
    return `<div class="o55-setup-fields">${kindPick}${name}${field('Program', txt('o55-mcp-command o55-setup-mono', d.command, 'e.g. npx -y some-mcp-server'), 'Puppet Master starts it when a chat needs it. The first run may download it.')}`
      + secrets
      + (d.pick === 'custom' ? field('Secret value (optional)', `<span class="pm51-commands-inline">${txt('o55-mcp-secret-name o55-setup-mono', (d.secrets[0] || {}).name || '', 'NAME')}<input class="text-control o55-mcp-secret-custom" type="password" autocomplete="off" placeholder="value"/></span>`, 'For a program that needs a token. It is passed as an environment value from the keychain.') : '')
      + (d.folders ? field('Folders it may use', PM51.select(d.folders, [['This project', 'This project only'], ['This project and Documents', 'This project and my Documents folder'], ['Anywhere I allow', 'Folders I approve one by one']], { cls: 'o55-mcp-folders', label: 'Folders it may use' })) : '')
      + `${scope}</div>`;
  }
  function collectConnect(wrap, d) {
    const v = sel => (wrap.querySelector(sel) || {}).value;
    if (v('.o55-mcp-name') != null) d.name = String(v('.o55-mcp-name')).trim();
    if (v('.o55-mcp-scope')) d.scope = v('.o55-mcp-scope');
    if (d.kind === 'web') { d.url = String(v('.o55-mcp-url') || '').trim(); d.auth = v('.o55-mcp-auth') || d.auth; d.transport = v('.o55-mcp-transport') || d.transport; const k = String(v('.o55-mcp-key') || '').trim(); if (k) d.key = '(saved)'; }
    else {
      d.command = String(v('.o55-mcp-command') || '').trim();
      wrap.querySelectorAll('.o55-mcp-secret').forEach(inp => { const s = d.secrets[Number(inp.dataset.i)]; if (s && inp.value.trim()) { s.saved = true; s.value = ''; } });
      const cn = String(v('.o55-mcp-secret-name') || '').trim(), cv = String(v('.o55-mcp-secret-custom') || '').trim();
      if (d.pick === 'custom' && cn) d.secrets = [{ name: cn.toUpperCase().replace(/[^A-Z0-9_]/g, '_'), label: cn, saved: !!cv || !!(d.secrets[0] || {}).saved }];
      if (v('.o55-mcp-folders')) d.folders = v('.o55-mcp-folders');
    }
  }
  function checkConnect(d) {
    if (!d.name) return 'Give the server a name.';
    if (!d.editing && servers().some(m => m.name.toLowerCase() === d.name.toLowerCase())) return `There is already a server called ${d.name}.`;
    if (d.kind === 'web') { if (!/^https?:\/\/\S+\.\S+/.test(d.url)) return 'Enter the full address, starting with https://.'; if (d.auth === 'key' && !d.key && !d.editing) return 'Paste the API key, or pick another way to sign in.'; return ''; }
    if (!d.command) return 'Enter the program to start.';
    const missing = d.secrets.find(s => !s.saved && s.label && d.pick !== 'custom'); if (missing) return `Paste the ${missing.label.toLowerCase()} first.`;
    return '';
  }
  function testStep(d) {
    const web = d.kind === 'web';
    const n = d.tools.length || 3;
    return PM51.steps([
      { title: web ? 'Address answers' : 'Program starts', desc: web ? d.url : d.command, status: 'Example', tone: 'info' },
      { title: web ? (d.auth === 'browser' ? 'Signed in through your browser' : d.auth === 'key' ? 'API key accepted' : 'No sign-in needed') : (d.secrets.length ? `Found ${d.secrets.map(s => s.name).join(', ')} in the keychain` : 'Nothing secret needed'), desc: web && d.auth === 'browser' ? 'Your browser opens once; the sign-in is kept on your server.' : 'Values are passed from the keychain, never written to settings.', status: 'Example', tone: 'info' },
      { title: 'Tools listed', desc: d.tools.length ? `${n} tools: ${d.tools.slice(0, 4).map(toolLabel).join(', ')}${d.tools.length > 4 ? '…' : ''}` : 'The server reports its tools when it connects.', status: 'Example', tone: 'info' }
    ]) + PM51.note('This preview does not start programs or open connections. In the app these checks run for real before the server is added.', 'info')
      + `<div class="pm51-mcp-actions">${PM51.btn({ label: 'Test again', icon: 'refresh', small: true, action: 'pm51-mcp-retest' })}</div>`;
  }
  function toolsStep(d) {
    const off = new Set(d.off);
    const tools = d.tools.length ? PM51.rows(d.tools.map(tl => ({ label: toolLabel(tl), control: PM51.toggle(!off.has(tl), { action: 'pm51-mcp-wtool', data: { tool: tl }, label: toolLabel(tl) }) }))) : PM51.note('Its tools appear once it connects. You can turn single tools off from the server later.', 'info');
    return PM51.panelSection('What it may do', PM51.select(d.permissions, [['Ask for writes', 'Ask me before anything changes'], ['Protected files only', 'Change files, except protected ones'], ['Read only', 'Only read, never change']], { cls: 'o55-mcp-perm', label: 'What it may do' }), 'You can change this any time from the server.', { icon: 'lock' })
      + PM51.panelSection('Tools', tools, d.tools.length ? 'Turn one off to keep the assistant from using it.' : '', { icon: 'sliders' });
  }
  function serverWizard(editId) {
    const m = editId ? byId(editId) : null;
    const steps = [];
    if (!m) steps.push({ label: 'Choose', title: 'What should the assistant be able to reach?', lead: 'Pick a service or program. Each one gives the assistant a few tools it can use in chat.', render: d => PM51.tiles(CATALOG.map(c => ({ title: c.name, text: c.what, meta: c.custom ? 'Program or web address' : c.kind === 'web' ? 'Web address · sign in' : 'Program on this computer', icon: c.icon, selected: d.pick === c.id, done: !c.custom && onList(c), doneReason: `${c.name} is already on your list.`, data: { pick: c.id } })), { action: 'pm51-mcp-pick' }), check: d => d.pick ? '' : 'Pick one to go on.' });
    steps.push({ label: 'Connect', icon: 'link', title: m ? 'How should it connect?' : 'How does it connect?', lead: m ? 'Saved secret values stay unless you paste new ones.' : 'Most of this is filled in for you. Add what only you know, like a key or an address.', render: connectStep, collect: collectConnect, check: checkConnect, recap: d => d.kind === 'web' ? 'Web address' : 'Runs a program' });
    steps.push({ label: 'Test', icon: 'test', title: 'Does it answer?', lead: 'A quick check that it starts, signs in and lists its tools.', render: testStep, recap: () => 'Checked' });
    steps.push({ label: 'Tools', icon: 'lock', title: 'What may it do?', lead: 'Keep it careful to start with. You can give it more room later.', render: toolsStep, collect: (wrap, d) => { const p = wrap.querySelector('.o55-mcp-perm'); if (p) d.permissions = p.value; } });
    PM51.wizard({
      title: m ? `${m.name}: how it connects` : 'Add an MCP server', subtitle: m ? 'Change the program or address, sign-in and tools.' : 'Give the assistant tools from another app or service.', eyebrow: 'MCP server', icon: 'plug',
      steps, draft: m ? draftOf(m) : { pick: null }, finishLabel: m ? 'Save' : 'Add server',
      onFinish: d => {
        const fields = { name: d.name, description: d.description || (d.kind === 'web' ? 'A web service you connected' : 'A program you added'), transport: d.kind === 'web' ? 'Web address' : 'Runs a program', wireTransport: d.transport, url: d.kind === 'web' ? d.url : '', command: d.kind === 'web' ? '' : d.command, auth: d.auth, secretNames: d.secrets.filter(s => s.saved).map(s => s.name), folders: d.folders, scope: d.scope, permissions: d.permissions, toolList: d.tools, disabledTools: d.off, tools: d.tools.length || (m ? m.tools : 0), catalogId: d.pick === 'custom' ? '' : d.pick };
        if (m) { Object.assign(m, fields); if (m.state !== 'Working') { m.state = 'Working'; delete m.remediation; m.primary = 'Configure'; } }
        else servers().push(Object.assign({ id: uniqueId(slug(d.name)), state: 'Working', primary: 'Configure', enabled: true }, fields));
        saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast(m ? 'Server saved' : `${d.name} added`, `${m ? '' : 'It is on and ready for new chats. '}Example only: nothing was started or connected in this preview.`, 'info');
      }
    });
  }

  PM51.style(`
#panel-settings .pm51-mcp-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-mcp-actions:first-child { margin-top: 0; }
#panel-settings .pm51-mcp-log { margin: 0; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.55; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
`);

  function render() {
    const list = servers();
    const items = list.map(m => ({
      title: m.name, pill: PM51.pill(stateFor(m)), meta: `${m.description} · ${scopeLabel(m.scope)}`, note: isOn(m) ? (m.remediation || '') : '',
      avatar: icon(isWeb(m) ? 'globe' : 'terminal'),
      end: PM51.btn({ label: primaryFor(m), small: true, icon: PRIMARY_ICONS[primaryFor(m)] || 'sliders', action: 'pm51-mcp-primary', data: { id: m.id } }),
      action: 'pm51-mcp-open', data: { id: m.id }
    }));
    const homes = [S.list, S.onoff, S.tool, S.health, S.signout, S.transport, S.scope, S.launch, S.url, S.headers, S.refresh];
    const wrap = html => homes.reduceRight((acc, id) => PM51.home(id, acc), html);
    const body = [
      PM51.section({
        title: 'Your servers', help: 'Each server gives the assistant a set of tools. Open one to choose which tools it may use and how it connects.',
        action: { label: 'Add server', icon: 'plus', action: 'pm51-mcp-add' },
        body: wrap(items.length ? PM51.list(items) : PM51.empty('No servers yet', 'Add one, or look for servers other apps already use.', { label: 'Add server', action: 'pm51-mcp-add', icon: 'plus' }))
      }),
      PM51.section({
        title: 'Servers from other apps', help: 'Claude Desktop, Cursor and VS Code keep their own server lists. Puppet Master can reuse them.',
        action: { label: 'Look for servers', icon: 'search', action: 'pm51-mcp-import' },
        body: PM51.bound.rows([S.importing])
      }),
      PM51.advanced(PM51.home(S.debug, PM51.section({ title: 'What each server ended up with', help: 'The program or address behind each server, after every setting is applied.', body: PM51.kv(list.map(m => [m.name, `${isWeb(m) ? 'Address' : 'Command'}: ${launchText(m)}`])) + actionRow(PM51.btn({ label: 'View all logs', small: true, icon: 'terminal', action: 'pm51-mcp-logs' }), PM51.btn({ label: 'Check all servers', small: true, icon: 'test', action: 'pm51-mcp-diagnostics' })) })), { label: 'More options' })
    ].join('');
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset the server list', action: 'pm51-mcp-reset' }, { label: 'How MCP servers work', action: 'pm51-mcp-help' }] });
  }
  PM51.manager('mcp', { render });
  PM51.watch(S.timeout, () => {});

  function openServer(id) {
    const m = byId(id); if (!m) return;
    const e = engineById(id) || {};
    const off = new Set(m.disabledTools || []);
    const tools = m.toolList || [];
    PM51.panel({
      title: m.name, eyebrow: isWeb(m) ? 'Web server' : 'Program on this computer', icon: isWeb(m) ? 'globe' : 'terminal', subtitle: m.description, status: stateFor(m),
      body: (isOn(m) && m.remediation ? PM51.note(m.remediation, 'attention') : '')
        + PM51.panelSection('How it connects', PM51.kv([
          ['Kind', isWeb(m) ? 'Connects to a web address' : 'Runs a program on this computer'],
          [isWeb(m) ? 'Address' : 'Command', launchText(m)],
          ['Where it applies', scopeLabel(m.scope)]
        ]) + actionRow(PM51.btn({ label: 'Change how it connects', small: true, icon: 'edit', action: 'pm51-mcp-edit', data: { id: m.id } })))
        + PM51.panelSection('Use it', PM51.rows([{ label: 'On', help: 'Off keeps the server on your list but the assistant will not call it.', control: PM51.toggle(isOn(m), { action: 'pm51-mcp-toggle', data: { id: m.id }, label: `${m.name} enabled` }) }]))
        + PM51.panelSection('Tools', tools.length
          ? PM51.rows(tools.map(t => ({ label: toolLabel(t), control: PM51.toggle(!off.has(t), { action: 'pm51-mcp-tool', data: { id: m.id, tool: t }, label: toolLabel(t) }) })))
          : `<p class="pm51-ps-text">${h(m.tools ? `${m.tools} tools. Connect the server to see the full list.` : 'No tools yet. They appear once the server connects.')}</p>`,
          tools.length ? `${m.tools} tools in total. Turn one off to keep the assistant from using it.` : '')
        + PM51.panelSection('Permissions', PM51.rows([{ label: 'What it may do', help: 'Ask for writes checks with you before anything changes.', control: PM51.select(PERMISSIONS.includes(m.permissions) ? m.permissions : 'Ask for writes', PERMISSIONS, { action: 'pm51-mcp-permissions', data: { id: m.id }, label: 'Permissions' }) }]))
        + (isWeb(m) ? PM51.panelSection('Sign-in', PM51.rows([{ label: 'Signed in through your browser', help: 'Sign in again when the server says it needs it. Sign out forgets the saved sign-in but keeps the server.' }]) + actionRow(PM51.btn({ label: 'Sign in again', small: true, icon: 'refresh', action: 'pm51-mcp-signin', data: { id: m.id } }), PM51.btn({ label: 'Sign out', small: true, icon: 'lock', action: 'pm51-mcp-signout', data: { id: m.id } })), '', { icon: 'user' }) : '')
        + PM51.advanced(
          PM51.kv([
            [isWeb(m) ? 'Address' : 'Launch command', launchText(m)],
            [isWeb(m) ? 'Headers' : 'Environment', ((isWeb(m) ? e.headers : e.env) || []).length ? (isWeb(m) ? e.headers : e.env).join(' · ') : 'None'],
            ['Sign-in', isWeb(m) ? 'Browser sign-in when the service asks' : 'Not needed'],
            ['Time limit', `${timeoutText()} (Connection defaults)`]
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
    if (action === 'Install') { PM51.panel({ title: `Install ${m.name}`, subtitle: launchText(m), icon: 'download', eyebrow: 'MCP server', body: PM51.panelSection('What happens', PM51.kv([['Runs', launchText(m)], ['Where', 'On your Puppet Master server'], ['Then', 'A quick check that it answers and lists its tools']])), primaryLabel: 'Install', onPrimary: () => { m.state = 'Working'; m.primary = 'Configure'; delete m.remediation; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${m.name} installed`, 'Example only: nothing was downloaded in this preview.', 'info'); } }); return; }
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
      PM51.s().mcps = servers().filter(x => x.id !== id); saveState(); closeOverlay(false); PM51.refresh(ID, { swap: false }); PM51.toast(`${m.name} removed`, 'It is no longer on your list.');
    }, true);
  }
  PM51.on('mcp-remove', el => removeServer(ds(el, 'id')));
  PM51.on('mcp-add', () => serverWizard());
  PM51.on('mcp-edit', el => serverWizard(ds(el, 'id')));
  PM51.on('mcp-pick', el => { const w = PM51.wizardOf(el); const c = catalogItem(ds(el, 'pick')); if (!w || !c) return; Object.assign(w.draft, draftFrom(c)); w.next(); });
  PM51.on('mcp-kind', el => { const w = PM51.wizardOf(el); if (!w) return; const body = el.closest('.pm51-panel-body'); collectConnect(el.closest('.drawer-wrap'), w.draft); w.draft.kind = el.dataset.value; if (w.draft.kind === 'web') w.draft.transport = 'http'; else w.draft.transport = 'stdio'; w.go(w.draft.editing ? 0 : 1); if (body) body.scrollTop = 0; });
  PM51.onChange('mcp-auth', el => { const w = PM51.wizardOf(el); if (!w) return; collectConnect(el.closest('.drawer-wrap'), w.draft); w.draft.auth = el.value; w.go(w.draft.editing ? 0 : 1); });
  PM51.on('mcp-retest', el => { const w = PM51.wizardOf(el); if (w) w.go(w.draft.editing ? 1 : 2); });
  PM51.on('mcp-wtool', el => { const w = PM51.wizardOf(el); if (!w) return; const tl = ds(el, 'tool'); const off = new Set(w.draft.off); off.has(tl) ? off.delete(tl) : off.add(tl); w.draft.off = [...off]; el.classList.toggle('on', !off.has(tl)); el.setAttribute('aria-checked', String(!off.has(tl))); });
  /* Servers other apps already use: pick the ones to bring over. They start switched off when the import choice says so. */
  const FOUND = [
    { app: 'Claude Desktop', name: 'Brave Search', kind: 'program', command: 'npx -y @modelcontextprotocol/server-brave-search', secret: 'BRAVE_API_KEY', tools: ['brave_web_search', 'brave_local_search'] },
    { app: 'Claude Desktop', name: 'GitHub', kind: 'program', command: 'npx -y @modelcontextprotocol/server-github', secret: 'GITHUB_TOKEN', tools: ['search_issues', 'create_issue'] },
    { app: 'VS Code', name: 'Postgres database', kind: 'program', command: 'npx -y @modelcontextprotocol/server-postgres', secret: 'DATABASE_URL', tools: ['query', 'list_tables'] },
    { app: 'Cursor', name: 'Sentry', kind: 'web', url: 'https://mcp.sentry.dev/mcp', tools: ['list_issues', 'get_issue_details'] }
  ];
  const foundOnList = f => servers().some(m => m.name.toLowerCase().replace(/ mcp$/, '') === f.name.toLowerCase());
  PM51.on('mcp-import', () => PM51.wizard({
    title: 'Bring servers from other apps', subtitle: 'Claude Desktop, Cursor and VS Code keep their own lists.', eyebrow: 'MCP servers', icon: 'download',
    draft: { pick: FOUND.filter(f => !foundOnList(f)).map(f => f.name) }, finishLabel: 'Bring them over',
    steps: [
      { label: 'Found', icon: 'search', title: 'Which ones should come over?', lead: 'These were found in other apps on this computer (example data). Pick the ones you want here too.', recap: d => `${d.pick.length} picked`, render: d => PM51.rows(FOUND.map(f => ({ label: f.name, help: `${f.app} · ${f.kind === 'web' ? f.url : f.command}${f.secret ? ` · uses ${f.secret}` : ''}${foundOnList(f) ? ' · already on your list' : ''}`, control: foundOnList(f) ? '<span class="pm51-row-value">On your list</span>' : PM51.toggle(d.pick.includes(f.name), { action: 'pm51-mcp-found', data: { name: f.name }, label: `Bring ${f.name}` }) }))), check: d => d.pick.length ? '' : 'Pick at least one server, or close this.' },
      { label: 'Start', icon: 'play', title: 'Should they start switched on?', render: d => PM51.bound.rows([S.importing]) + PM51.note(askFirst() ? `The ${d.pick.length} you picked are added switched on, with their secret values copied into your server's keychain.` : `The ${d.pick.length} you picked are added switched off until you look at each one.`, 'info') }
    ],
    onFinish: d => {
      FOUND.filter(f => d.pick.includes(f.name) && !foundOnList(f)).forEach(f => servers().push({ id: uniqueId(slug(f.name)), name: f.name, description: `Brought over from ${f.app}`, state: askFirst() ? 'Working' : 'Off', scope: 'Project only', transport: f.kind === 'web' ? 'Web address' : 'Runs a program', url: f.url || '', command: f.command || '', secretNames: f.secret ? [f.secret] : [], tools: f.tools.length, toolList: f.tools, permissions: 'Ask for writes', primary: 'Configure', enabled: askFirst() }));
      saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Servers brought over', 'Example only: nothing was read from other apps in this preview.', 'info');
    }
  }));
  PM51.on('mcp-found', el => { const w = PM51.wizardOf(el); if (!w) return; const n = ds(el, 'name'); w.draft.pick = w.draft.pick.includes(n) ? w.draft.pick.filter(x => x !== n) : [...w.draft.pick, n]; el.classList.toggle('on'); el.setAttribute('aria-checked', String(el.classList.contains('on'))); });
  PM51.on('mcp-signin', el => { const m = byId(ds(el, 'id')); if (!m) return; PM51.panel({
    title: `Sign in to ${m.name}`, subtitle: launchText(m), icon: 'key', eyebrow: 'MCP server',
    body: PM51.panelSection('How it works', PM51.steps([{ title: 'Your browser opens', desc: `The ${m.name} sign-in page, on your computer.`, status: 'Next', tone: 'info' }, { title: 'You approve access', desc: 'Only the access this server asks for.', status: 'Then', tone: 'info' }, { title: 'The sign-in is kept on your server', desc: 'It refreshes by itself. You can sign out here any time.', status: 'Done', tone: 'info' }])),
    primaryLabel: 'Open my browser', onPrimary: () => { m.state = 'Working'; delete m.remediation; m.primary = 'Configure'; saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Signed in', `Example only: no browser opened. ${m.name} is marked working in this preview.`, 'info'); }
  }); });
  PM51.on('mcp-signout', el => { const m = byId(ds(el, 'id')); if (!m) return; PM51.confirm(`Sign out of ${m.name}?`, 'Its saved sign-in is forgotten. The server stays on your list and asks you to sign in next time.', 'Sign out', () => PM51.toast('Signed out', `${m.name} will ask you to sign in next time.`)); });
  PM51.on('mcp-diagnostics', () => PM51.check({ title: 'Check all servers', steps: [
    { title: 'Server list readable', desc: `${servers().length} servers on your list` },
    { title: 'Programs on this computer', desc: 'Each local program is looked up', status: 'Example', tone: 'info' },
    { title: 'Web addresses reachable', desc: 'Each address is pinged', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('mcp-reset', () => PM51.confirm('Reset the server list?', 'Your server list goes back to its defaults. Other choices keep their values; use About on a row to reset one.', 'Reset', () => {
    PM51.s().mcps = clone(DATA.mcps); PM51.s().mcpPrefs = clone(PREF_DEFAULTS); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('MCP settings reset', 'Defaults are back.');
  }));
  PM51.on('mcp-help', () => PM51.panel({
    title: 'How MCP servers work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">MCP is a common way for the assistant to talk to outside tools. Each server offers a set of tools, such as reading issues from GitHub or files from this project.</p>')
      + PM51.panelSection('Two kinds', PM51.kv([['Runs a program', 'Puppet Master starts a small program on this computer and talks to it.'], ['Web address', 'Puppet Master connects to a service online, signing in when needed.']]))
      + PM51.panelSection('Staying in control', '<p class="pm51-ps-text">Every server has a permission level. Ask for writes means the assistant checks with you before anything changes. You can also turn off single tools.</p>')
  }));
})();
