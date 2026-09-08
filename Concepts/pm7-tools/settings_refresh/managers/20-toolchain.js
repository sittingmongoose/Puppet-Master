/* Toolchain — language servers, formatters, and the tools the assistant can use. */
(function () {
  const ID = 'toolchain';
  const KEY = 'tools-integrations';
  const TABS = [{ id: 'servers', label: 'Language Servers' }, { id: 'formatters', label: 'Formatters' }, { id: 'agent-tools', label: 'Agent Tools' }];
  const tc = () => state.toolchain;
  const DEFAULTS = clone({ lsps: state.toolchain.lsps, formatters: state.toolchain.formatters, agentTools: state.toolchain.agentTools });
  const SOURCE_LABELS = {
    'Auto-detected toolchain': 'Found with your installed toolchain', 'Workspace package': 'Installed in this project',
    'Managed tool': 'Installed by Puppet Master', 'Rust toolchain': 'Part of your Rust toolchain',
    'Project environment': 'Part of this project\'s environment', 'Added by you': 'Added by you'
  };
  const PERMISSION_LABELS = { 'FileSafe': 'Protected files only' };
  const PERMISSION_CHOICES = ['Ask for sensitive actions', 'Ask for writes', 'Protected files only', 'Always ask', 'Never ask'];
  const sourceLabel = s => SOURCE_LABELS[s] || s || 'Unknown';
  const permissionLabel = p => PERMISSION_LABELS[p] || p || 'Always ask';
  const isOn = x => x.enabled !== false;
  const byId = (kind, id) => (tc()[kind] || []).find(x => x.id === id);
  const selected = (kind, list) => list.find(x => x.id === PM51.sel(ID + '-' + kind)) || list[0];
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tool';
  const uniqueId = (kind, base) => { let id = base, n = 2; while (byId(kind, id)) id = base + '-' + n++; return id; };
  const pillFor = x => !isOn(x) ? PM51.pill('Off') : x.status === 'ready' ? PM51.pill('Ready') : x.status === 'attention' ? PM51.pill('Needs attention') : x.status === 'setup' ? PM51.pill('Not set up') : PM51.statusPill(x.status);
  const toneFor = x => !isOn(x) ? 'off' : x.status === 'ready' ? 'ready' : x.status === 'attention' ? 'attention' : 'neutral';
  const statusText = (x, runningWord) => !isOn(x) ? 'Off · not used in this project' : x.status === 'ready' ? runningWord : x.status === 'attention' ? 'Needs a restart' : 'Not checked yet';
  const actionRow = (...buttons) => `<div class="pm51-toolchain-actions">${buttons.join('')}</div>`;
  const managedIn = tool => tool.owner === 'GitHub plugin' ? { label: 'Managed in Plugins', workspace: 'plugins' } : tool.owner === 'Filesystem MCP' ? { label: 'Managed in MCP Servers', workspace: 'mcp' } : null;

  PM51.style(`
#panel-settings .pm51-toolchain-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-toolchain-log { margin: 0; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.55; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
#panel-settings .pm51-toolchain-sample { min-width: 0; }
#panel-settings .pm51-toolchain-sample pre { margin: 4px 0 0; padding: 9px 11px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.5; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
#panel-settings .pm51-toolchain-order { display: flex; flex-direction: column; }
#panel-settings .pm51-toolchain-order-row { display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 6px 0; border-top: 1px solid var(--k3-line); }
#panel-settings .pm51-toolchain-order-row:first-child { border-top: 0; }
#panel-settings .pm51-toolchain-order-n { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--k3-line); background: var(--k3-bg-2); font-size: 11px; font-weight: 700; color: var(--k3-text-2); flex: 0 0 auto; }
#panel-settings .pm51-toolchain-order-name { flex: 1 1 auto; min-width: 0; font-size: 12.5px; font-weight: 640; color: var(--k3-text-1); }
`);

  /* ---------- Language servers ------------------------------------------- */
  function renderServers() {
    const list = tc().lsps;
    if (!list.length) return PM51.section({ title: 'Language servers', help: 'Helpers that understand each language you write in.', body: PM51.empty('No language servers yet', 'Add one, or let Puppet Master find the tools already in this project.', { label: 'Add language server', action: 'pm51-toolchain-add-lsp', icon: 'plus' }) });
    const s = selected('lsps', list);
    const launch = [s.command].concat(s.args || []).filter(Boolean).join(' ');
    const body = PM51.rows([
      { label: 'Language', value: s.language },
      { label: 'Where it came from', value: sourceLabel(s.source) },
      { label: 'Used in this project', help: 'Turn off to stop using it here without removing it.', control: PM51.toggle(isOn(s), { action: 'pm51-toolchain-lsp-on', data: { id: s.id }, label: 'Used in this project' }) },
      { label: 'Status', value: statusText(s, 'Running'), action: { label: 'Check server', icon: 'test', action: 'pm51-toolchain-check-lsp', data: { id: s.id } } }
    ]) + PM51.advanced([
      PM51.kv([
        ['Launch command', launch || 'Not set'],
        ['Project markers', (s.rootMarkers || []).length ? s.rootMarkers.join(', ') : 'None'],
        ['Initialization options', s.initOptions || 'Defaults'],
        ['Applies to', s.scope === 'User' ? 'All your projects' : 'This project'],
        ['Last check', s.lastTest || 'Not checked yet']
      ]),
      actionRow(
        PM51.btn({ label: 'View logs', small: true, icon: 'terminal', action: 'pm51-toolchain-logs', data: { kind: 'lsps', id: s.id } }),
        PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'lsps', id: s.id } })
      )
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterId: 'toolchain-servers', rosterTitle: 'Language servers', count: list.length,
      add: { action: 'pm51-toolchain-add-lsp', label: 'Add language server' },
      filter: { placeholder: 'Filter language servers' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: x.language, tone: toneFor(x), selected: x.id === s.id, data: { kind: 'lsps' } })),
      selectAction: 'pm51-toolchain-pick',
      detail: {
        title: s.name, subtitle: `${s.language} · ${sourceLabel(s.source)}`, pill: pillFor(s),
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-toolchain-edit-lsp', data: { id: s.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Restart', icon: 'refresh', onClick: () => PM51.unavailable('Restart', 'Language servers only run inside the real app.') },
          { label: isOn(s) ? 'Turn off' : 'Turn on', icon: isOn(s) ? 'pause' : 'play', onClick: () => { s.enabled = !isOn(s); saveState(); PM51.refresh(ID, { swap: false }); } },
          { label: 'View logs', icon: 'terminal', onClick: () => openLogs('lsps', s.id) },
          { separator: true },
          { label: 'Remove', icon: 'trash', danger: true, onClick: () => removeItem('lsps', s.id, 'language server') }
        ], s.name),
        body
      }
    });
  }

  /* ---------- Formatters --------------------------------------------------- */
  const SAMPLES = {
    prettier: ['const user={name:"Ada",tags:["a","b"]}', 'const user = { name: "Ada", tags: ["a", "b"] };'],
    rustfmt: ['fn main(){println!("hi");}', 'fn main() {\n    println!("hi");\n}'],
    'ruff-format': ['def add(a,b):return a+b', 'def add(a, b):\n    return a + b']
  };
  function renderFormatters() {
    const list = tc().formatters;
    if (!list.length) return PM51.section({ title: 'Formatters', help: 'Tools that tidy your code so it always looks the same.', body: PM51.empty('No formatters yet', 'Add one, or let Puppet Master find the tools already in this project.', { label: 'Add formatter', action: 'pm51-toolchain-add-fmt', icon: 'plus' }) });
    const f = selected('formatters', list);
    const sample = SAMPLES[f.id] || ['a=1', 'a = 1'];
    const body = PM51.rows([
      { label: 'Languages', value: (f.languages || []).join(', ') || 'Not set' },
      { label: 'Where it came from', value: sourceLabel(f.source) },
      { label: 'Format on save', help: 'Tidies the file every time you save it.', control: PM51.toggle(!!f.onSave, { action: 'pm51-toolchain-fmt-flag', data: { id: f.id, flag: 'onSave' }, label: 'Format on save' }) },
      { label: 'Format on paste', help: 'Tidies text as soon as you paste it in.', control: PM51.toggle(!!f.onPaste, { action: 'pm51-toolchain-fmt-flag', data: { id: f.id, flag: 'onPaste' }, label: 'Format on paste' }) },
      { label: 'Only changed lines', help: 'Leaves untouched code exactly as it was.', control: PM51.toggle(!!f.changedLines, { action: 'pm51-toolchain-fmt-flag', data: { id: f.id, flag: 'changedLines' }, label: 'Only changed lines' }) },
      { label: 'Status', value: statusText(f, 'Ready to format'), action: { label: 'Check formatter', icon: 'test', action: 'pm51-toolchain-check-fmt', data: { id: f.id } } }
    ]) + PM51.advanced([
      PM51.kv([
        ['Program', [f.executable].concat(f.args || []).filter(Boolean).join(' ') || 'Not set'],
        ['Settings file', f.config || 'None'],
        ['Ignore file', f.ignore || 'None']
      ]),
      PM51.grid(2,
        `<div class="pm51-toolchain-sample"><div class="pm51-ps-title">Sample before</div><pre>${h(sample[0])}</pre></div>`,
        `<div class="pm51-toolchain-sample"><div class="pm51-ps-title">Sample after</div><pre>${h(sample[1])}</pre></div>`),
      actionRow(
        PM51.btn({ label: 'View logs', small: true, icon: 'terminal', action: 'pm51-toolchain-logs', data: { kind: 'formatters', id: f.id } }),
        PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'formatters', id: f.id } })
      )
    ].join(''));
    return PM51.listDetail({
      id: ID, rosterId: 'toolchain-formatters', rosterTitle: 'Formatters', count: list.length,
      add: { action: 'pm51-toolchain-add-fmt', label: 'Add formatter' },
      filter: { placeholder: 'Filter formatters' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: (x.languages || []).slice(0, 3).join(', ') + ((x.languages || []).length > 3 ? ` +${x.languages.length - 3}` : ''), tone: toneFor(x), selected: x.id === f.id, data: { kind: 'formatters' } })),
      selectAction: 'pm51-toolchain-pick',
      detail: {
        title: f.name, subtitle: `${(f.languages || []).length} ${(f.languages || []).length === 1 ? 'language' : 'languages'} · ${sourceLabel(f.source)}`, pill: pillFor(f),
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-toolchain-edit-fmt', data: { id: f.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: isOn(f) ? 'Turn off' : 'Turn on', icon: isOn(f) ? 'pause' : 'play', onClick: () => { f.enabled = !isOn(f); saveState(); PM51.refresh(ID, { swap: false }); } },
          { label: 'View logs', icon: 'terminal', onClick: () => openLogs('formatters', f.id) },
          { separator: true },
          { label: 'Remove', icon: 'trash', danger: true, onClick: () => removeItem('formatters', f.id, 'formatter') }
        ], f.name),
        body
      }
    });
  }

  /* ---------- Agent tools -------------------------------------------------- */
  function renderAgentTools() {
    const list = tc().agentTools.slice().sort((x, y) => (x.priority || 99) - (y.priority || 99));
    const rows = list.map(t => {
      const m = managedIn(t);
      return {
        label: t.name, pill: m ? PM51.chip(m.label) : '',
        help: `${permissionLabel(t.permission)} · ${m ? `Comes from the ${t.owner}.` : 'Built into Puppet Master.'}`,
        control: (m ? PM51.btn({ label: 'Open', small: true, ghost: true, icon: 'arrowRight', action: 'pm51-go', data: { domain: 'code', workspace: m.workspace } }) : '') + PM51.toggle(isOn(t), { action: 'pm51-toolchain-tool-on', data: { id: t.id }, label: t.name })
      };
    });
    const order = `<div class="pm51-toolchain-order">${list.map((t, i) => `<div class="pm51-toolchain-order-row"><span class="pm51-toolchain-order-n">${i + 1}</span><span class="pm51-toolchain-order-name">${h(t.name)}</span>${PM51.btn({ label: 'Move up', small: true, ghost: true, icon: 'up', action: 'pm51-toolchain-tool-up', data: { id: t.id }, disabled: i === 0, reason: 'Already first.' })}</div>`).join('')}</div>`;
    return PM51.section({
      title: 'Tools the assistant can use', help: 'Turn a tool off to keep the assistant from using it in this project.',
      body: PM51.rows(rows) + PM51.advanced([
        PM51.section({ title: 'Which tool goes first', help: 'When two tools can do the same job, the assistant tries the higher one first.', body: order }),
        PM51.section({ title: 'What each tool may do', help: 'Ask means the assistant stops and checks with you.', body: PM51.rows(list.map(t => ({ label: t.name, control: PM51.select(permissionLabel(t.permission), PERMISSION_CHOICES, { action: 'pm51-toolchain-tool-permission', data: { id: t.id }, label: `${t.name} permission` }) }))) }),
        PM51.section({ title: 'Technical details', body: PM51.kv(list.map(t => [t.name, `Provided by ${t.owner} · ${PM51.plain(t.status)}`])) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'agentTools' } }) + '</div>' })
      ].join(''))
    });
  }

  function render() {
    const tab = PM51.tab(ID, 'servers');
    const body = tab === 'formatters' ? renderFormatters() : tab === 'agent-tools' ? renderAgentTools() : renderServers();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Find tools in this project', action: 'pm51-toolchain-discover' },
      { label: 'Reset toolchain defaults', action: 'pm51-toolchain-reset' },
      { label: 'How the toolchain works', action: 'pm51-toolchain-help' }
    ] });
  }
  PM51.manager('toolchain', { render });

  /* ---------- shared behaviours ------------------------------------------ */
  function removeItem(kind, id, noun) {
    const item = byId(kind, id); if (!item) return;
    PM51.confirm(`Remove ${item.name}?`, `The ${noun} is taken off your list. Nothing is uninstalled from your computer.`, 'Remove', () => {
      tc()[kind] = tc()[kind].filter(x => x.id !== id);
      PM51.setSel(ID + '-' + kind, '');
      saveState(); PM51.refresh(ID, { swap: false });
      PM51.toast(`${item.name} removed`, 'It is no longer on your list.');
    }, true);
  }
  function openLogs(kind, id) {
    const item = byId(kind, id); if (!item) return;
    const lines = kind === 'lsps'
      ? [`10:42:01  Started ${item.command || item.name}`, `10:42:03  Found project markers: ${(item.rootMarkers || []).join(', ') || 'none'}`, item.status === 'attention' ? '10:47:19  Lost contact with the server. A restart is needed.' : '10:42:09  Ready. Indexed 1,204 files.']
      : [`10:40:12  ${item.executable || item.name} ready`, `10:40:12  Settings file: ${item.config || 'none'}`, '10:44:57  Formatted 3 files on save'];
    PM51.panel({
      title: `${item.name} logs`, subtitle: 'Example data only. Real logs appear here in the app.',
      body: PM51.panelSection('Recent lines', `<pre class="pm51-toolchain-log">${h(lines.join('\n'))}</pre>`) + PM51.note('Logs never include secrets. Anything sensitive is hidden before it is shown.', 'info')
    });
  }
  function readField(wrap, name) { const el = wrap.querySelector(`[data-field="${name}"]`); return el ? el.value.trim() : ''; }
  const splitWords = text => String(text || '').split(/\s+/).filter(Boolean);
  const splitList = text => String(text || '').split(/[,\s]+/).filter(Boolean);

  PM51.on('toolchain-pick', el => { PM51.setSel(ID + '-' + ds(el, 'kind'), ds(el, 'id')); state.resourceRosterOpen = false; PM51.refresh(ID, { swap: false }); });

  /* language servers */
  PM51.on('toolchain-lsp-on', el => { const s = byId('lsps', ds(el, 'id')); if (!s) return; s.enabled = !isOn(s); saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('toolchain-check-lsp', el => {
    const s = byId('lsps', ds(el, 'id')); if (!s) return;
    const restart = s.status === 'attention';
    PM51.check({
      title: `Check ${s.name}`,
      outcome: restart ? 'Needs a restart · example data' : undefined, tone: restart ? 'attention' : undefined,
      steps: [
        { title: 'Program found', desc: s.command || 'No command set' },
        { title: 'Server answers', desc: restart ? 'No reply. Restart it from the menu.' : 'Replied to a hello message', status: restart ? 'No reply' : 'Checked', tone: restart ? 'attention' : 'ready' },
        { title: 'Understands this project', desc: `Looks for ${(s.rootMarkers || []).join(', ') || 'project files'}`, status: 'Example', tone: 'info' }
      ]
    });
  });
  PM51.on('toolchain-add-lsp', () => {
    openDialog({
      title: 'Add language server', subtitle: 'Tell Puppet Master how to start it. You can change this later.',
      body: formField('Name', 'name', '', { autofocus: true, placeholder: 'e.g. gopls' }) + formField('Language', 'language', '', { placeholder: 'e.g. Go' }) + formField('Command to start it', 'command', '', { placeholder: 'e.g. gopls', help: 'The program name, plus any options after it.', full: true }),
      saveLabel: 'Add server',
      onSave: data => {
        const name = String(data.name || '').trim(); if (!name) { PM51.toast('Name needed', 'Give the server a name first.', 'info'); return false; }
        const words = splitWords(data.command);
        const id = uniqueId('lsps', slug(name));
        tc().lsps.push({ id, name, language: String(data.language || '').trim() || 'Not set', source: 'Added by you', command: words[0] || '', args: words.slice(1), rootMarkers: [], status: 'setup', scope: 'Project', lastTest: 'Not checked yet', enabled: true });
        PM51.setSel(ID + '-lsps', id); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast('Language server added', `${name} is on your list. Use Check server to see if it starts.`);
      }
    });
  });
  PM51.on('toolchain-edit-lsp', el => {
    const s = byId('lsps', ds(el, 'id')); if (!s) return;
    PM51.panel({
      title: `Edit ${s.name}`, subtitle: 'Changes apply the next time the server starts.',
      body: PM51.panelSection('Name and language', PM51.field('Name', PM51.input(s.name, { data: { field: 'name' } })) + PM51.field('Language', PM51.input(s.language, { data: { field: 'language' } })))
        + PM51.panelSection('How it starts', PM51.field('Command', PM51.input(s.command, { data: { field: 'command' }, placeholder: 'Program name' }), 'The program that runs the server.') + PM51.field('Options', PM51.input((s.args || []).join(' '), { data: { field: 'args' } }), 'Extra options passed to the command.') + PM51.field('Project markers', PM51.input((s.rootMarkers || []).join(', '), { data: { field: 'markers' } }), 'Files that tell the server where a project starts.')),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const name = readField(wrap, 'name'); if (name) s.name = name;
        s.language = readField(wrap, 'language') || s.language;
        s.command = readField(wrap, 'command'); s.args = splitWords(readField(wrap, 'args')); s.rootMarkers = splitList(readField(wrap, 'markers'));
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${s.name} was updated.`);
      }
    });
  });

  /* formatters */
  PM51.on('toolchain-fmt-flag', el => { const f = byId('formatters', ds(el, 'id')); const flag = ds(el, 'flag'); if (!f || !['onSave', 'onPaste', 'changedLines'].includes(flag)) return; f[flag] = !f[flag]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('toolchain-check-fmt', el => {
    const f = byId('formatters', ds(el, 'id')); if (!f) return;
    PM51.check({ title: `Check ${f.name}`, steps: [
      { title: 'Program found', desc: f.executable || 'No program set' },
      { title: 'Settings file read', desc: f.config && f.config !== 'None' ? f.config : 'Using built-in defaults' },
      { title: 'Formats a sample', desc: 'A small snippet is formatted and compared', status: 'Example', tone: 'info' }
    ] });
  });
  PM51.on('toolchain-add-fmt', () => {
    openDialog({
      title: 'Add formatter', subtitle: 'Tell Puppet Master which program tidies which languages.',
      body: formField('Name', 'name', '', { autofocus: true, placeholder: 'e.g. Black' }) + formField('Languages', 'languages', '', { placeholder: 'e.g. Python', help: 'Separate several with commas.' }) + formField('Program to run', 'executable', '', { placeholder: 'e.g. black -', full: true }),
      saveLabel: 'Add formatter',
      onSave: data => {
        const name = String(data.name || '').trim(); if (!name) { PM51.toast('Name needed', 'Give the formatter a name first.', 'info'); return false; }
        const words = splitWords(data.executable);
        const id = uniqueId('formatters', slug(name));
        tc().formatters.push({ id, name, languages: String(data.languages || '').split(',').map(x => x.trim()).filter(Boolean), source: 'Added by you', executable: words[0] || '', args: words.slice(1), config: 'None', ignore: 'None', onSave: true, onPaste: false, changedLines: false, status: 'setup', enabled: true });
        PM51.setSel(ID + '-formatters', id); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast('Formatter added', `${name} is on your list. Use Check formatter to try it.`);
      }
    });
  });
  PM51.on('toolchain-edit-fmt', el => {
    const f = byId('formatters', ds(el, 'id')); if (!f) return;
    PM51.panel({
      title: `Edit ${f.name}`, subtitle: 'Changes apply the next time a file is formatted.',
      body: PM51.panelSection('Name and languages', PM51.field('Name', PM51.input(f.name, { data: { field: 'name' } })) + PM51.field('Languages', PM51.input((f.languages || []).join(', '), { data: { field: 'languages' } }), 'Separate several with commas.'))
        + PM51.panelSection('How it runs', PM51.field('Program', PM51.input(f.executable, { data: { field: 'executable' } })) + PM51.field('Options', PM51.input((f.args || []).join(' '), { data: { field: 'args' } })) + PM51.field('Settings file', PM51.input(f.config === 'None' ? '' : f.config, { data: { field: 'config' }, placeholder: 'Optional' })) + PM51.field('Ignore file', PM51.input(f.ignore === 'None' ? '' : f.ignore, { data: { field: 'ignore' }, placeholder: 'Optional' }))),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const name = readField(wrap, 'name'); if (name) f.name = name;
        f.languages = readField(wrap, 'languages').split(',').map(x => x.trim()).filter(Boolean);
        f.executable = readField(wrap, 'executable'); f.args = splitWords(readField(wrap, 'args'));
        f.config = readField(wrap, 'config') || 'None'; f.ignore = readField(wrap, 'ignore') || 'None';
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${f.name} was updated.`);
      }
    });
  });

  /* agent tools */
  PM51.on('toolchain-tool-on', el => { const t = byId('agentTools', ds(el, 'id')); if (!t) return; t.enabled = !isOn(t); saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('toolchain-tool-up', el => {
    const list = tc().agentTools.slice().sort((x, y) => (x.priority || 99) - (y.priority || 99));
    const i = list.findIndex(t => t.id === ds(el, 'id')); if (i <= 0) return;
    [list[i - 1], list[i]] = [list[i], list[i - 1]];
    list.forEach((t, n) => { t.priority = n + 1; });
    saveState(); PM51.refresh(ID, { swap: false });
  });
  PM51.onChange('toolchain-tool-permission', el => { const t = byId('agentTools', ds(el, 'id')); if (!t) return; t.permission = el.value; saveState(); });

  /* shared */
  PM51.on('toolchain-logs', el => openLogs(ds(el, 'kind'), ds(el, 'id')));
  PM51.on('toolchain-diagnostics', el => {
    const kind = ds(el, 'kind');
    const title = kind === 'formatters' ? 'Formatter diagnostics' : kind === 'agentTools' ? 'Agent tool diagnostics' : 'Language server diagnostics';
    PM51.check({ title, steps: [
      { title: 'Settings readable', desc: 'Every entry on your list has a name and a way to start' },
      { title: 'Programs on this computer', desc: 'Each program is looked up on your computer', status: 'Example', tone: 'info' },
      { title: 'Project matches', desc: 'Tools are matched to the languages in this project', status: 'Example', tone: 'info' }
    ] });
  });
  PM51.on('toolchain-discover', () => PM51.check({
    title: 'Find tools in this project', subtitle: 'Example data only. In the app this looks at your project files.',
    steps: [
      { title: 'Project files read', desc: 'Cargo.toml, package.json, pyproject.toml' },
      { title: 'Language servers', desc: 'rust-analyzer, TypeScript, Pyright are already on your list', status: 'Example', tone: 'info' },
      { title: 'Formatters', desc: 'Prettier, rustfmt, Ruff Format are already on your list', status: 'Example', tone: 'info' },
      { title: 'New tools', desc: 'Nothing new to add in this preview', status: 'Example', tone: 'info' }
    ]
  }));
  PM51.on('toolchain-reset', () => PM51.confirm('Reset toolchain defaults?', 'Your language servers, formatters, and agent tools go back to how Puppet Master found them.', 'Reset', () => {
    tc().lsps = clone(DEFAULTS.lsps); tc().formatters = clone(DEFAULTS.formatters); tc().agentTools = clone(DEFAULTS.agentTools);
    ['lsps', 'formatters'].forEach(k => PM51.setSel(ID + '-' + k, ''));
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Toolchain reset', 'Defaults are back.');
  }));
  PM51.on('toolchain-help', () => PM51.panel({
    title: 'How the toolchain works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Puppet Master looks at the files in your project and picks helpers for each language. You can add your own, turn any of them off, or check that one is working.</p>')
      + PM51.panelSection('The three kinds', PM51.kv([['Language servers', 'Understand your code so the assistant can jump to definitions, spot errors, and rename safely.'], ['Formatters', 'Tidy code so it always looks the same, on save or on paste.'], ['Agent tools', 'Things the assistant can use on its own, like the built-in browser.']]))
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Removing a tool here only takes it off the list. Nothing is uninstalled from your computer.</p>')
  }));
})();
