/* Settings managers, rethought (Fable 5.2): the chapter "Code & tools", the editor, the terminal and what the assistant
   can pick up. (Testing, debugging, the browser, containers and publishing are in code-work.js.)
   Today this is five managers: Editor & Terminal (one page of 133 rows), Toolchain (three tabs), Skills, Plugins,
   MCP Servers and Commands & Shortcuts (two tabs). A newcomer cannot tell a skill from a plugin from an MCP server:
   the three pages describe themselves with the same words, and GitHub is on all three. Here:
   - the chapter's first page says what each of the three is, in one sentence, with the person's own counts, and what
     each "GitHub" is; it lists everything in the chapter that needs the person, each with one button;
   - every list is the things the person has. Each row says On or Off in words beside its switch, and opens a page of
     that one thing: what it is for, where it came from, whether it is on, what it may do, its own choices, and its
     actions as ordinary buttons with the one that removes it last;
   - a model, a permission or a "keep for" choice that one command, skill or connection may differ in is worded as an
     exception and links to the page that owns the choice;
   - how the editor and the terminal look is under Look & feel; this chapter holds how they behave.
   Lists are read from the engine's state (st.pm51.skills, .plugins, .mcps, .commands and st.toolchain). Buttons call
   PMConcept7's own actions. Four things PMConcept7 offers only inside a "More actions" menu or a panel that exists
   while its manager is drawn (restart, turn off or remove a language tool; the dry run of a command) are ordinary
   buttons here; what each does differently is said in that page's `changes`. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const DOC = W.document;

  /* ------------------------------------------------------------------ small helpers */
  const val = (id) => SMX.val(id);
  const word = (id, v) => { try { return String(kit().valueLabel(id, v === undefined ? val(id) : v)); } catch (e) { return String(v === undefined ? val(id) : v); } };
  const count = d.plural;
  const and = (list) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`);
  const lower = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
  /* "4 are on", "none is on", "both are on", "it is on": how many of a list are in a state, in words that fit every count */
  const share = (n, total, state) => (n === 0 ? (total === 1 ? `it is not ${state}` : `none is ${state}`) : n === total ? (total === 1 ? `it is ${state}` : `${total === 2 ? 'both' : 'all'} are ${state}`) : `${n} ${n === 1 ? 'is' : 'are'} ${state}`);
  const enc = encodeURIComponent;
  const toggle = (onNow, o) => { try { return kit().toggle(onNow, o); } catch (e) { return ''; } };
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const field = (label, control, help) => { try { return kit().field(label, control, help); } catch (e) { return control; } };
  const bound = (kind, id, o) => { try { return kit().bound[kind](id, o || {}); } catch (e) { return ''; } };
  const facts = (pairs) => ui.facts(pairs.filter(Boolean));
  const initials = (name) => String(name || '?').replace(/^\//, '').split(/[\s/_-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const quiet = (html) => `<p class="smx-quiet-line">${html}</p>`;
  const btnRow = (...b) => `<div class="smx-btn-row">${b.filter(Boolean).join('')}</div>`;
  const switchLine = (label, control) => `<span class="smx-cd-switch"><span>${h(label)}</span>${control}</span>`;
  const covered = (ids, html) => `<div data-smx-covers="${h(ids.join(' '))}">${html}</div>`;
  const fold = (key, label, help, body) => `<details class="smx-fold smx-fold-more" data-smx-fold="${h(key)}"${SMX.local.openMore[key] ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">${h(label)}</span><span class="smx-fold-help">${h(help)}</span></summary><div class="smx-fold-body">${body}</div></details>`;
  const uncover = (page, ids) => { if (page && page.covers) for (const id of ids) delete page.covers[id]; };
  /* change the engine's demo state, the way a manager's own menu items do */
  const write = (fn) => { const st = eng().getState(); fn(st); eng().setState(st); SMX.fresh(); SMX.soon(30); };
  /* A page of one thing whose thing has gone (PMConcept7's own Remove took it off the list) goes back to its list. */
  const stillThere = (ctx, thing, back) => {
    const k = 'cd:seen:' + ctx.route;
    if (thing) { SMX.local.flags[k] = true; return true; }
    if (SMX.local.flags[k]) { SMX.local.flags[k] = false; W.setTimeout(() => { if (SMX.route === ctx.route) SMX.go(back, { replace: true }); }, 0); }
    return false;
  };
  const gone = (what, back, label) => [{ key: 'gone', html: ui.card({ title: `This ${what} is no longer on your list`, body: ui.btn({ label, go: back }) }) }];
  /* When one of PMConcept7's own guided flows makes a thing while the chapter's first page is showing, the page goes to
     that kind's list, where the new thing is. Only then: arriving at the first page after a thing was made somewhere else
     is not a reason to be sent on, and on arrival the page's blocks are not drawn yet, which is how the two are told apart. */
  const track = (key, ids, to) => {
    const k = 'cd:ids:' + key, prev = SMX.local.flags[k]; SMX.local.flags[k] = ids.join('|');
    if (prev === undefined || !to) return;
    if (!DOC.querySelector('#smx-root .smx-page[data-smx-route="code"] .smx-blocks > [data-smx-block]')) return;
    const old = new Set(String(prev).split('|')); const fresh = ids.filter((id) => !old.has(id));
    if (fresh.length === 1) W.setTimeout(() => { if (SMX.route === 'code') SMX.go(to); }, 0);
  };

  /* ------------------------------------------------------------------ PMConcept7's rows, in this chapter's words
     A row keeps its id, value and control. An MCP server is a "connection" on these pages and a language server is a
     "tool that understands code", so the rows that said "server" say that too (X1 R-33: four things were all called
     servers). Help lines that named a mechanism name the effect. */
  if (SMX.reword) SMX.reword({
    'system.mcp.oauth-autodetect': { help: 'Turn off only for connections that use a plain key instead of signing in.' },
    'system.mcp.timeout': { label: 'Wait for a connection this long', help: 'How long to wait for a connection to start or answer before giving up. 30000 ms is half a minute.' },
    'system.mcp.show-availability': { label: 'Show connection status around the app', help: 'A small connected or disconnected mark wherever a connection’s tools appear.' },
    'system.mcp.catalog-cache-ttl': { label: 'Refresh each connection’s tool list every', help: 'It also refreshes when you change a connection or ask for it. 3600 seconds is an hour.' },
    'system.mcp.import-external': { label: 'When other apps have connections' },
    'code.editing.lsp-enabled': { label: 'Use the tools that understand code', help: 'They mark mistakes, explain what you point at, complete what you type and jump to where something is defined. Off turns them all off.' },
    'code.editing.lsp-auto-restart': { label: 'Restart one if it stops' },
    'code.editing.lsp-subagent-bias': { label: 'Prefer a helper that knows the language', help: 'When a helper agent is picked to fix code, lean toward one that knows that language.' },
    'code.editing.lsp-max-memory': { label: 'Memory each of them may use', help: 'The most memory one language tool may use before it is reined in.' },
    'code.editing.lsp-max-cpu': { help: 'The longest one request to a language tool may take before it is cancelled.' },
    'code.editing.lsp-change-debounce': { help: 'How long after you stop typing before your edits are sent to the language tools.' },
    'code.editing.lsp-root-override': { help: 'Only if the language tools guess the project folder wrong.' },
    'extensions.plugins.hook-timeout': { help: 'A plugin that takes longer is stopped. Raise it only for a plugin you trust. 5000 ms is 5 seconds.' },
    'extensions.skills.context-budget-percent': { help: 'At most this share of what the model can keep in mind at once. Skills that do not fit are left out of that request.' },
    'extensions.commands.command-scope': { label: 'Where a new command is available' },
    'extensions.commands.command-mode': { help: 'How much a command may do before it stops to ask. The chat’s own mode still caps it.' },
    'extensions.commands.command-model': { help: 'Same as the chat means the model that chat is using. Pick one only if your commands should always use it.' },
    'extensions.commands.command-persona': { help: 'Same as the chat means whoever is answering in that chat.' },
    'extensions.commands.command-permissions': { help: 'My usual permissions means what you chose under Safety & permissions. A command can never have more than that.' },
    'extensions.commands.command-palette-visibility': { label: 'Show your commands in the command palette', help: 'The palette opens with Ctrl+K and lists everything you can run.' },
    /* these have no row of their own here (they are a list, a switch on a thing, a button): the words are for search */
    'system.mcp.server-list': { label: 'Your connections' }, 'system.mcp.server-enabled': { label: 'A connection, on or off' }, 'system.mcp.tool-toggle': { label: 'Single tools of a connection, on or off' },
    'system.mcp.health-status': { label: 'A connection’s logs' }, 'system.mcp.sign-out': { label: 'Sign out of a connection' }, 'system.mcp.oauth-refresh': { label: 'Sign in to a connection again' },
    'system.mcp.transport': { label: 'How a connection connects' }, 'system.mcp.server-scope': { label: 'Where a connection can be used' }, 'system.mcp.launch-config': { label: 'How a connection’s program starts' },
    'system.mcp.remote-url': { label: 'The address of a connection on the web' }, 'system.mcp.remote-headers': { label: 'Extra headers for a connection on the web' }, 'system.mcp.debug-surface': { label: 'What each connection ended up with' },
    'code.editing.lsp-server-catalog': { label: 'Tools that understand your code (language servers)' }, 'code.editing.lsp-custom-servers': { label: 'Add a language server' }, 'code.editing.lsp-restart': { label: 'Restart the tools that understand code' },
    'code.editing.lsp-host-attachment': { label: 'The folder a language tool reads' }, 'code.editing.formatter-catalog': { label: 'Tools that tidy your code (formatters)' }, 'code.editing.formatter-custom': { label: 'Add a formatter' },
    'extensions.plugins.packages': { label: 'Your plugins' },
    'general.interaction.preview-tabs': { help: 'One click opens a file in a preview tab, shown in italics, that your next click replaces. A double click, an edit or dragging the tab keeps it.' }
  });

  /* ================================================================== readers */
  const skillsOf = (st) => ((st.pm51 || {}).skills) || [];
  const pluginsOf = (st) => ((st.pm51 || {}).plugins) || [];
  const connsOf = (st) => ((st.pm51 || {}).mcps) || [];
  const cmdData = (st) => ((st.pm51 || {}).commands) || {};
  const cmdsOf = (st) => cmdData(st).custom || [];
  const keysOf = (st) => cmdData(st).shortcuts || [];
  const tc = (st) => st.toolchain || {};
  const lspsOf = (st) => tc(st).lsps || [];
  const fmtsOf = (st) => tc(st).formatters || [];
  const toolsOf = (st) => (tc(st).agentTools || []).slice().sort((x, y) => (x.priority || 99) - (y.priority || 99));
  const builtinsOf = (st) => tc(st).commands || [];
  const R = { skill: (id) => `code/skills/${enc(id)}`, plugin: (id) => `code/plugins/${enc(id)}`, conn: (id) => `code/connections/${enc(id)}`, cmd: (id) => `code/commands/${enc(id)}`, lsp: (id) => `code/languages/understands/${enc(id)}`, fmt: (id) => `code/languages/tidies/${enc(id)}` };

  /* ---- skills ---- */
  const SK = { search: 'extensions.skills.search', show: 'extensions.skills.registry-view', sort: 'extensions.skills.sort', rescan: 'extensions.skills.rescan', validate: 'extensions.skills.validate', perms: 'extensions.skills.permissions', pattern: 'extensions.skills.pattern-permissions', badges: 'extensions.skills.info-badges', auto: 'extensions.skills.auto-invocation', autoNew: 'extensions.skills.auto-enable-new' };
  const ORIGIN = { 'Bundled with PM': 'Came with Puppet Master', 'Installed from catalog': 'From the catalog', 'Installed from GitHub': 'Shared by someone on GitHub', 'Imported from disk': 'From a folder on this computer', 'Written by you': 'Written by you' };
  const originOf = (s) => ORIGIN[s.origin] || s.origin || 'Unknown';
  const skBundled = (s) => /bundled/i.test(s.origin || '');
  const skReadOnly = (s) => skBundled(s) || /catalog/i.test(s.origin || '');
  const reqLabel = (r) => String(r || '').replace(/\s*\(.*?\)\s*/g, '').trim();
  const reqMissing = (r) => /\(not connected\)|\(missing\)|\(not installed\)/i.test(String(r || ''));
  const mayText = (s) => String(s.permissions || 'Nothing extra').replace(/\s*\(waiting for you\)\s*/i, '');
  const RUN = [['', 'Follows the main rule'], ['allow', 'Runs when it fits'], ['ask', 'Asks me first'], ['deny', 'Never runs']];
  const runMap = () => { const m = val(SK.perms); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; };
  const runOf = (s) => runMap()[s.name] || '';
  const runText = (s) => (RUN.find((r) => r[0] === runOf(s)) || RUN[0])[1];
  const mainSkillRule = () => { const m = val('safety.rules.per-tool-permissions'); const v = m && typeof m === 'object' ? String(m.skill || '') : ''; return { allow: 'skills run when they fit', ask: 'a skill asks you first', deny: 'skills never run', block: 'skills never run' }[v] || 'skills follow your safety rules'; };
  const skBadges = () => { const b = val(SK.badges); return Array.isArray(b) ? b : []; };
  const skStatus = (s) => {
    if (!s.enabled) return ['Off', 'off'];
    if (!skBadges().includes('Readiness')) return ['On', 'ready'];
    return s.state === 'Needs permission' ? ['Waiting for your OK', 'attention'] : s.state === 'Needs setup' ? ['Needs setting up', 'attention'] : s.state === 'Has problems' ? ['Has a problem', 'blocked'] : s.updateAvailable ? ['On · update ready', 'info'] : ['On', 'ready'];
  };
  const skNote = (s) => {
    if (s.state === 'Needs setup') { const miss = (s.requirements || []).filter(reqMissing).map(reqLabel); return miss.length ? `Needs ${and(miss).toLowerCase()} before it can run.` : 'Something it needs is not set up yet.'; }
    if (s.state === 'Needs permission') return `Asks to ${lower(mayText(s))}.`;
    if (s.updateAvailable) return `Version ${s.updateAvailable} is available.`;
    return '';
  };
  /* PMConcept7's own rule for "Show", so the same choice means the same here: what it leaves out is folded, not hidden */
  const skShown = (s) => { const v = String(val(SK.show) || 'Active only'); return !!s.justAdded || v === 'All' || (v === 'Hide disabled' ? !!s.enabled : (!!s.enabled || s.state !== 'Ready')); };
  const skSorted = (list) => { const sort = String(val(SK.sort) || 'Name'); const key = (s) => (sort === 'Source' ? `${s.origin} ${s.name}` : sort === 'Permission' ? `${runText(s)} ${s.name}` : s.name); return list.slice().sort((x, y) => key(x).localeCompare(key(y))); };
  const skThing = (s) => {
    const [text, tone] = skStatus(s); const b = skBadges();
    return { initials: initials(s.name), name: s.name, tag: s.justAdded ? 'Just added' : '', sub: s.description || 'No description yet.', sub2: [b.includes('Source') ? `${originOf(s)} · version ${s.version}` : `Version ${s.version}`, b.includes('Persona references') && s.personas ? `Used by ${s.personas}` : '', runOf(s) ? runText(s) : '', skNote(s)].filter(Boolean).join(' · '),
      status: { text, tone }, side: toggle(!!s.enabled, { action: 'pm51-skills-toggle', data: { id: s.id }, label: `${s.name} on or off` }), go: R.skill(s.id) };
  };

  /* ---- plugins ---- */
  const PL = { show: 'extensions.plugins.registry-view', autoNew: 'extensions.plugins.auto-enable-new', timeout: 'extensions.plugins.hook-timeout' };
  const plInstalled = (p) => p.state !== 'Not installed';
  const plOn = (p) => !!p.locked || (plInstalled(p) && !!p.enabled);
  const plAdds = (p) => and([p.tools ? count(p.tools, 'tool') : '', p.hooks ? count(p.hooks, 'automatic step') : ''].filter(Boolean));
  const plSource = (p) => (p.source === 'Bundled' || p.version === 'Bundled' ? 'Came with Puppet Master' : `${p.source === 'Local folder' ? 'From a folder on this computer' : p.source === 'Catalog' ? 'From the catalog' : (p.source || 'Unknown')}${plInstalled(p) && p.version ? ` · version ${p.version}` : ''}`);
  const plStatus = (p) => (!plInstalled(p) ? ['Not installed', 'off'] : p.locked ? ['Always on', 'ready'] : !p.enabled ? ['Off', 'off'] : p.problem ? ['Needs you', 'attention'] : ['On', 'ready']);
  const plShown = (p) => { const v = String(val(PL.show) || 'Active only'); return !!p.justAdded || v === 'All' || !!p.enabled || !!p.locked || (v !== 'Hide disabled' && (!plInstalled(p) || !!p.problem)); };
  const plThing = (p) => {
    const [text, tone] = plStatus(p);
    return { initials: initials(p.name), name: p.name, tag: p.justAdded ? 'Just added' : '', sub: plAdds(p) ? `Adds ${plAdds(p)}` : 'Adds no tools', sub2: [plSource(p), p.problem || ''].filter(Boolean).join(' · '), status: { text, tone },
      side: p.locked ? '' : !plInstalled(p) ? ui.btn({ label: 'Install', icon: 'download', action: 'pm51-plugins-install', data: { id: p.id } }) : toggle(!!p.enabled, { action: 'pm51-plugins-toggle', data: { id: p.id }, label: `${p.name} on or off` }), go: R.plugin(p.id) };
  };

  /* ---- connections (MCP servers) ---- */
  const cnOn = (m) => m.enabled !== false;
  const cnWeb = (m) => /web/i.test(m.transport || '');
  const cnStatus = (m) => (!cnOn(m) ? ['Off', 'off'] : m.state === 'Working' ? ['Working', 'ready'] : [m.state || 'Not working', 'blocked']);
  const CN_SCOPE = { 'PM managed': 'Every project', 'Project only': 'This project', External: 'Set up outside Puppet Master' };
  const cnScope = (m) => CN_SCOPE[m.scope] || m.scope || 'This project';
  const cnEngine = (st, id) => (tc(st).mcps || []).find((x) => x.id === id) || null;
  const cnLaunch = (st, m) => { const e = cnEngine(st, m.id); if (cnWeb(m)) return m.url || (e && e.url) || 'No address yet'; return m.command || (e ? [e.command].concat(e.args || []).filter(Boolean).join(' ') : '') || 'No program yet'; };
  const toolLabel = (t) => { const s = String(t || '').replace(/_/g, ' ').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
  const CN_MAY = [['Ask for writes', 'Ask me before anything changes'], ['Protected files only', 'Change things, except protected files'], ['Read only', 'Only read, never change']];
  const cnMay = (m) => (CN_MAY.some((x) => x[0] === m.permissions) ? m.permissions : 'Ask for writes');
  const cnThing = (st, m) => {
    const [text, tone] = cnStatus(m);
    return { icon: cnWeb(m) ? 'globe' : 'terminal', name: m.name, sub: m.description || '', sub2: [cnWeb(m) ? 'A service on the web' : 'A program on this computer', cnScope(m), m.tools ? count(m.tools, 'tool') : 'No tools yet', cnOn(m) && m.remediation ? m.remediation : ''].filter(Boolean).join(' · '), status: { text, tone },
      side: toggle(cnOn(m), { action: 'pm51-mcp-toggle', data: { id: m.id }, label: `${m.name} on or off` }), go: R.conn(m.id) };
  };

  /* ---- language tools ---- */
  const tOn = (x) => x.enabled !== false;
  const SOURCE = { 'Auto-detected toolchain': 'Found on this computer, with its language', 'Workspace package': 'Installed inside this project', 'Managed tool': 'Installed by Puppet Master', 'Rust toolchain': 'Part of your Rust tools', 'Project environment': 'Part of this project’s own set-up', 'Added by you': 'A program you pointed to', 'Found on this computer': 'Found on this computer' };
  const sourceOf = (x) => SOURCE[x.source] || x.source || 'Unknown';
  /* the six tools PMConcept7 starts with name no files; they handle the files of their languages */
  const FILES = { Rust: ['*.rs'], 'TypeScript / JavaScript': ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs'], TypeScript: ['*.ts', '*.tsx'], JavaScript: ['*.js', '*.jsx', '*.mjs'], Python: ['*.py', '*.pyi'], JSON: ['*.json'], CSS: ['*.css', '*.scss'], Markdown: ['*.md'] };
  const langsOf = (kind, x) => (kind === 'lsp' ? [x.language].filter(Boolean) : (x.languages || []));
  const filesOf = (kind, x) => ((x.files && x.files.length) ? x.files : [...new Set(langsOf(kind, x).flatMap((n) => FILES[n] || []))]);
  const lspStatus = (x) => (!tOn(x) ? ['Off', 'off'] : x.status === 'ready' ? ['Running', 'ready'] : x.status === 'attention' ? ['Needs a restart', 'attention'] : ['Not checked yet', 'info']);
  const fmtStatus = (x) => (!tOn(x) ? ['Off', 'off'] : x.status === 'ready' ? ['Ready', 'ready'] : x.status === 'attention' ? ['Needs attention', 'attention'] : ['Not checked yet', 'info']);
  const fmtWhen = (f) => (f.onSave ? 'when you save' : 'only when you ask');

  /* ---- shortcuts and commands ----
     PMConcept7 keeps three small tables inside its Commands manager and exports none of them: the plain names of six
     message-box keys, the terminal's own keys (only the ones a person changes are stored), and the keys that belong to
     the system. They are repeated here so the list can be drawn without that manager. */
  const KY = { search: 'extensions.commands.search-shortcuts', text: 'extensions.commands.text-editing-keys', term: 'code.terminal.shortcuts', variant: 'extensions.commands.variant-cycling-key', hints: 'extensions.commands.shortcut-hints', clash: 'extensions.commands.conflict-handling', layout: 'extensions.commands.keyboard-layout', reset: 'extensions.commands.reset-shortcuts', backup: 'extensions.commands.backup-shortcuts', palette: 'extensions.commands.command-palette-visibility', confirm: 'command-confirm' };
  const BOX_NAMES = { 'Cursor back one char': 'Back one character', 'Cursor forward one char': 'Forward one character', 'Cursor back one word': 'Back one word', 'Cursor forward one word': 'Forward one word', 'Delete char under cursor': 'Delete the character under the cursor', 'Cancel popups / stop response': 'Close pop-ups or stop the reply' };
  const TERM_KEYS = [['Search the terminal', 'Ctrl+Shift+F'], ['Next match', 'F3'], ['Previous match', 'Shift+F3'], ['Jump to the top', 'Ctrl+Home'], ['Jump to the bottom', 'Ctrl+End'], ['Bigger text', 'Ctrl+='], ['Smaller text', 'Ctrl+-'], ['Clear the terminal', 'Ctrl+Shift+K']];
  const RESERVED = [['Ctrl+C', 'Copy'], ['Ctrl+V', 'Paste'], ['Ctrl+X', 'Cut'], ['Ctrl+Z', 'Undo'], ['Ctrl+Q', 'Quit Puppet Master'], ['F11', 'Full screen']];
  const boxKeys = () => { const v = val(KY.text); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const termKeys = () => { const map = Object.fromEntries(TERM_KEYS); const v = val(KY.term); if (Array.isArray(v)) v.forEach((x) => { const m = /^(.+?):\s*(.*)$/.exec(String(x)); if (m && m[1] in map) map[m[1]] = /^none$/i.test(m[2]) ? '' : m[2]; }); return map; };
  const variantKeys = () => { const v = String(val(KY.variant) || ''); return /^unbound$/i.test(v) ? '' : v; };
  const KEY_GROUPS = { app: ['Everywhere in Puppet Master', ''], box: ['While you type a message', ' (while typing a message)'], term: ['In the terminal', ' (in the terminal)'] };
  const allKeys = (st) => [
    ...keysOf(st).map((s) => ({ id: s.id, group: 'app', name: s.name, keys: s.keys || '', command: s.command || '' })),
    { id: 'variant', group: 'app', name: 'Switch model variant', keys: variantKeys(), help: 'Flips between a model’s variants without opening the picker.' },
    ...Object.entries(boxKeys()).map(([n, k]) => ({ id: 'box:' + n, group: 'box', name: BOX_NAMES[n] || n, keys: k || '' })),
    ...Object.entries(termKeys()).map(([n, k]) => ({ id: 'term:' + n, group: 'term', name: n, keys: k || '' }))
  ];
  /* a key that works everywhere clashes with every group; the message box and the terminal never see each other's keys */
  const sees = (a, b) => a.group === b.group || a.group === 'app' || b.group === 'app';
  const sameKeys = (a, b) => !!a.keys && !!b.keys && String(a.keys).toLowerCase() === String(b.keys).toLowerCase();
  const clashesOf = (all, x) => all.filter((o) => o.id !== x.id && sees(o, x) && sameKeys(o, x));
  const clashPairs = (st) => { const all = allKeys(st), out = []; all.forEach((a, i) => all.slice(i + 1).forEach((b) => { if (sees(a, b) && sameKeys(a, b)) out.push([a, b]); })); return out; };
  const keysHtml = (keys) => String(keys || '').split('+').map((k) => k.trim()).filter(Boolean).map((k) => { try { return kit().kbd(k); } catch (e) { return h(k); } }).join('<span>+</span>');
  const keyShown = (keys) => `<span class="pm51-commands-keys is-static${keys ? '' : ' is-empty'}">${keys ? keysHtml(keys) : 'No keys'}</span>`;
  const keyButton = (x) => `<button type="button" class="pm51-commands-keys${x.keys ? '' : ' is-empty'}" data-action="pm51-commands-rebind" data-id="${h(x.id)}" aria-label="Change the keys for ${h(x.name)}" data-pm-hover-label="Change the keys">${x.keys ? keysHtml(x.keys) : 'Set keys'}</button>`;
  const cmdKeys = (st, c) => { const s = keysOf(st).find((x) => x.command === c.id); return s && s.keys ? s.keys : ''; };
  const MODES = { ask: 'Ask', plan: 'Plan', regular: 'Regular', yolo: 'No pauses' };
  const MODE_HELP = { ask: 'Read-only answers', plan: 'Read-only planning', regular: 'Normal approvals', yolo: 'No approvals' };
  const CMD_SCOPE = { Project: 'This project', Global: 'Every project' };
  const cmdPath = (c) => (c.scope === 'Global' ? `~/.config/puppet-master/commands/${c.id}.md` : `.puppet-master/commands/${c.id}.md`);
  const readyProviders = (st) => (st.providers || []).filter((p) => p.id !== 'free-models' && p.status !== 'disabled' && (p.readiness ? !!p.readiness.modelsReady : (!!p.installed && !!p.signedIn)) && (p.models || []).some((m) => m.enabled));
  const modelName = (st, id) => { const m = (st.providers || []).flatMap((p) => p.models || []).find((x) => x.id === id); return m ? m.name : String(id); };
  const profileName = (st, id) => { const p = (st.permissionProfiles || []).find((x) => x.id === id); return p ? p.name : String(id); };
  /* what a command asks for that is not there any more: [key, in words, the name it asks for] */
  const staleOf = (st, c) => {
    const ov = c.overrides || {}; const out = [];
    if (ov.persona && !(st.personas || []).some((p) => p.name === ov.persona)) out.push(['persona', 'persona', ov.persona]);
    if (ov.mode && !MODES[ov.mode]) out.push(['mode', 'mode', ov.mode]);
    if (ov.model && !readyProviders(st).some((p) => (p.models || []).some((m) => m.enabled && m.id === ov.model))) out.push(['model', 'model', modelName(st, ov.model)]);
    if (ov.permissionsProfile && !(st.permissionProfiles || []).some((p) => p.id === ov.permissionsProfile)) out.push(['permissionsProfile', 'permissions profile', ov.permissionsProfile]);
    return out;
  };
  /* how a command runs, in a few words for its row; what it asks for and is not there is said as that, never as if it worked */
  const cmdRuns = (st, c) => {
    const ov = c.overrides || {}; const lost = {}; for (const [key, what, name] of staleOf(st, c)) lost[key] = `${what} “${name}” is not there`;
    return [ov.persona ? (lost.persona || `answered by ${ov.persona}`) : '', ov.mode ? (lost.mode || `${MODES[ov.mode] || ov.mode} mode`) : '', ov.model ? (lost.model || modelName(st, ov.model)) : '', ov.permissionsProfile ? (lost.permissionsProfile || `${profileName(st, ov.permissionsProfile)} permissions`) : ''].filter(Boolean);
  };

  /* ================================================================== what needs you, for this chapter and for Settings Home */
  const needs = (st) => {
    const out = [];
    for (const s of skillsOf(st)) {
      if (s.enabled && s.state === 'Needs permission') out.push({ kind: 'skills', id: s.id, home: true, title: `The skill “${s.name}” is waiting for your OK`, detail: `It asks to ${lower(mayText(s))}, and does nothing until you allow it.`, ownTitle: `It asks to ${lower(mayText(s))}`, ownDetail: 'It does nothing until you allow it.', fix: { label: 'Allow it…', action: 'pm51-skills-allow', data: { id: s.id } }, also: { label: 'Open', go: R.skill(s.id) } });
      else if (s.enabled && s.state === 'Needs setup') out.push({ kind: 'skills', id: s.id, title: `The skill “${s.name}” cannot run yet`, detail: skNote(s), ownTitle: 'It cannot run yet', fix: { label: 'See what it needs', go: R.skill(s.id), anchor: 'reqs' } });
      else if (s.enabled && s.state === 'Has problems') out.push({ kind: 'skills', id: s.id, tone: 'blocked', title: `The skill “${s.name}” has a problem`, detail: 'Check what it needs, or read its instructions, to see what is wrong.', ownTitle: 'Something is wrong with it', fix: { label: 'Check what it needs', action: 'pm51-skills-check', data: { id: s.id } }, also: { label: 'Open', go: R.skill(s.id) } });
      if (s.enabled && s.updateAvailable) out.push({ kind: 'skills', id: s.id, tone: 'info', title: `The skill “${s.name}” has an update`, detail: `Version ${s.updateAvailable} is ready. You have ${s.version}.`, fix: { label: 'See what changes', action: 'pm51-skills-update', data: { id: s.id } } });
    }
    for (const p of pluginsOf(st)) if (plOn(p) && p.problem) { const parts = String(p.problem).split(/(?<=\.)\s+/); out.push({ kind: 'plugins', id: p.id, home: true, title: `The plugin “${p.name}” has stopped working`, detail: p.problem, ownTitle: parts[0].replace(/\.$/, ''), ownDetail: parts.slice(1).join(' ') || 'Its tools are not there for the assistant until this is put right.', fix: { label: 'Pick its folder', action: 'pm51-plugins-pick-folder', data: { id: p.id } }, also: { label: 'Open', go: R.plugin(p.id) } }); }
    for (const m of connsOf(st)) if (cnOn(m) && m.state !== 'Working') out.push({ kind: 'connections', id: m.id, home: true, tone: 'blocked', title: `The connection “${m.name}” is not working`, detail: [m.state, m.remediation].filter(Boolean).map((x) => String(x).replace(/\.$/, '')).join('. ') + '.', ownTitle: String(m.state || 'It does not answer').replace(/\.$/, ''), ownDetail: m.remediation || 'Check the connection to see what is wrong.', fix: cnWeb(m) ? { label: 'Sign in again', action: 'pm51-mcp-signin', data: { id: m.id } } : { label: 'Check it', action: 'pm51-mcp-check', data: { id: m.id } }, also: { label: 'Open', go: R.conn(m.id) } });
    for (const x of lspsOf(st)) if (tOn(x) && x.status === 'attention') out.push({ kind: 'languages', id: x.id, home: true, title: `${x.name} has stopped answering`, detail: `Mistakes in ${x.language || 'its language'} are not marked until it restarts.`, ownTitle: 'It needs a restart', fix: { label: 'Restart it', do: 'code-lang-restart', data: { id: x.id } }, also: { label: 'Open', go: R.lsp(x.id) } });
    /* one line for each command on a list; the command's own page takes the parts, each with its own way out */
    for (const c of cmdsOf(st)) {
      if (!c.enabled) continue;   /* like every other kind: a thing that is switched off needs nothing */
      const parts = staleOf(st, c).map(([key, what, name]) => ({ kind: 'commands', id: c.id, title: `${c.name} asks for a ${what} that is not there`, detail: `It names “${name}”. Until you choose another, the chat’s own ${what} is used.`, ownTitle: `It asks for a ${what} that is not there`, fix: { label: `Use the chat’s ${what}`, do: 'code-cmd-clear', data: { id: c.id, key } }, also: { label: 'Open', go: R.cmd(c.id), anchor: 'who' } }));
      if (parts.length === 1) out.push(parts[0]);
      else if (parts.length) { const stale = staleOf(st, c); out.push({ kind: 'commands', id: c.id, parts, title: `${c.name} asks for ${and(stale.map((x) => `a ${x[1]}`))} that are not there`, detail: `It names ${and(stale.map((x) => `“${x[2]}”`))}. Until you choose others, the chat’s own are used.`, fix: { label: 'Choose others', go: R.cmd(c.id), anchor: 'who' } }); }
    }
    for (const [a, b] of clashPairs(st)) out.push({ kind: 'shortcuts', tone: 'info', title: `“${a.name}” and “${b.name}”${a.group === b.group ? '' : KEY_GROUPS[b.group][1]} both use ${a.keys}`, detail: 'Only one of them can work. Give one of them other keys.', fix: { label: `Change “${b.name}”`, action: 'pm51-commands-rebind', data: { id: b.id } } });
    const rank = { blocked: 0, attention: 1, info: 2 };
    return out.map((n, i) => [rank[n.tone || 'attention'], i, n]).sort((x, y) => x[0] - y[0] || x[1] - y[1]).map((x) => x[2]);
  };
  const needsFor = (st, kind, id) => needs(st).filter((n) => n.kind === kind && (id === undefined || n.id === id));
  /* on a thing's own page a need is said in that page's words, with no way "to" the page; a note that only informs stays in its card */
  const own = (list) => list.flatMap((n) => n.parts || [n]).filter((n) => n.tone !== 'info').map((n) => Object.assign({}, n, { title: n.ownTitle || n.title, detail: n.ownDetail || n.detail, also: null }));
  (SMX.needSources = SMX.needSources || []).push((st) => needs(st).filter((n) => n.home));

  /* GitHub is a plugin, a connection and a set of tools at once (and a code service, and an AI provider's sign-in).
     Wherever one of them appears, this says which is which. `self` is the one the reader is looking at. */
  const githubs = (st) => ({ pl: pluginsOf(st).find((p) => /^github$/i.test(p.id) || /^github$/i.test(p.name)) || null, cn: connsOf(st).find((m) => /github/i.test(m.name) || m.catalogId === 'github') || null, tool: toolsOf(st).find((t) => /github/i.test(t.name)) || null });
  const githubLine = (st, self) => {
    const g = githubs(st); const n = [g.pl, g.cn, g.tool].filter(Boolean).length; if (n < 2) return '';
    const bits = [
      g.pl ? `the plugin ${self === 'plugin' ? ui.b(g.pl.name) : ui.word(g.pl.name, { go: R.plugin(g.pl.id) })} is a bundle of tools that came with Puppet Master` : '',
      g.cn ? `the connection ${self === 'conn' ? ui.b(g.cn.name) : ui.word(g.cn.name, { go: R.conn(g.cn.id) })} is the live link to github.com` : '',
      g.tool ? `${self === 'tool' ? ui.b(g.tool.name) : ui.word(g.tool.name, { go: 'code/agent-tools' })} is the switch that lets this project use those tools` : ''
    ].filter(Boolean);
    return `<p class="smx-cd-also">GitHub is in this chapter ${n === 3 ? 'three times, as three' : 'twice, as two'} different things: ${bits.join('; ')}. The GitHub account that keeps your code online is one more, under ${ui.word('Source control', { go: 'source' })}.</p>`;
  };

  /* ================================================================== Code & tools: the chapter's first page, with Editor & files */
  const AUTOSAVE = 'code.editing.autosave';
  const savesWord = () => { const v = String(val(AUTOSAVE) || ''); return /^off$/i.test(v) ? 'are saved only when you save them' : /focus/i.test(v) ? 'save by themselves when you click away' : 'save by themselves'; };
  const kindTile = (o) => `<button type="button" class="smx-cd-kind" data-smx-go="${h(o.go)}"><span class="smx-cd-kind-head"><span class="smx-cd-kind-icon">${SMX.icon(o.icon)}</span><span class="smx-cd-kind-name">${h(o.name)}</span><span class="smx-cd-kind-go">${SMX.icon('go')}</span></span><span class="smx-cd-kind-is">${h(o.is)}</span><span class="smx-cd-kind-text">${h(o.text)}</span><span class="smx-cd-kind-count"><span class="smx-cd-kind-n">${h(o.count[0])}</span>${o.count[1] ? ui.status(o.count[1], o.count[2]) : ''}</span></button>`;
  /* where each kind of need is put right, for the line that stands in for the needs the first page leaves out */
  const KIND_PAGE = { skills: ['code/skills', 'Skills'], plugins: ['code/plugins', 'Plugins'], connections: ['code/connections', 'Tool connections'], languages: ['code/languages', 'Language help'], commands: ['code/commands', 'Your commands'] };
  SMX.extend('code', {
    cls: 'smx-cd',
    purpose: 'The editor and terminal you work in, and what the assistant can pick up to do a job: skills, plugins and connections to other apps.',
    keywords: ['editor', 'autosave', 'save', 'tabs', 'file tree', 'files', 'indent', 'diff', 'search index', 'skill', 'plugin', 'mcp', 'connection', 'tools', 'extension', 'add-on'],
    lead: (ctx) => {
      const st = ctx.st; const sk = skillsOf(st), pl = pluginsOf(st), cn = connsOf(st), lsp = lspsOf(st), fmt = fmtsOf(st);
      track('skills', sk.map((x) => x.id), 'code/skills'); track('plugins', pl.map((x) => x.id), 'code/plugins'); track('conns', cn.map((x) => x.id), 'code/connections'); track('cmds', cmdsOf(st).map((x) => x.id), 'code/commands');
      const all = needs(st); const pairs = all.filter((n) => n.kind === 'shortcuts').length;
      const nd = all.filter((n) => n.kind !== 'shortcuts').concat(pairs ? [{ tone: 'info', title: `${count(pairs, 'pair')} of shortcuts share the same keys`, detail: 'Only one of each pair can work.', fix: { label: 'Sort them out', go: 'code/shortcuts' } }] : []);
      const bad = (kind) => all.filter((n) => n.kind === kind && n.tone !== 'info').length;
      const tile = (kind, n, one, fine, on, ok) => (n ? [`${count(n, one)} · ${fine}`, bad(kind) ? `${bad(kind)} need${bad(kind) === 1 ? 's' : ''} you` : on ? ok : 'All off', bad(kind) ? 'attention' : on ? 'ready' : 'off'] : [`No ${one}s yet`, '', '']);
      const skOn = sk.filter((s) => s.enabled).length, plOnN = pl.filter(plOn).length, cnOk = cn.filter((m) => cnOn(m) && m.state === 'Working').length;
      const some = (n, one, tail) => (n ? `${count(n, one)}${tail || ''}` : `no ${one}s${tail || ''}`);
      const nothing = !sk.length && !pl.length && !cn.length; const langN = lsp.length + fmt.length;
      /* The first page keeps to the most pressing few, so that the three kinds stay in sight; the rest are named with where they are. */
      const urgent = nd.filter((n) => n.tone !== 'info'); const top = urgent.length > 6 ? urgent.slice(0, 5) : urgent; const rest = urgent.slice(top.length);
      let needsHtml = ui.needs(top);
      if (rest.length) {
        const by = {}; rest.forEach((n) => { by[n.kind] = (by[n.kind] || 0) + 1; });
        needsHtml = needsHtml.replace(`>${top.length} things need you<`, `>${urgent.length} things need you<`).replace(/<\/section>\s*$/, `<p class="smx-cd-more-needs">And ${rest.length} more${Object.keys(by).length === 1 ? `, in ${ui.word(KIND_PAGE[Object.keys(by)[0]][1], { go: KIND_PAGE[Object.keys(by)[0]][0] })}` : `: ${and(Object.keys(by).map((k) => `${by[k]} in ${ui.word(KIND_PAGE[k][1], { go: KIND_PAGE[k][0] })}`))}`}.</p></section>`);
      }
      return [
        { key: 'summary', html: ui.summary({ icon: 'code', tone: urgent.length ? 'attention' : 'ready', lines: [
          `${nothing ? 'The assistant has nothing extra to pick up yet:' : 'The assistant can pick up'} ${ui.word(some(sk.length, 'skill'), { go: 'code/skills' })}, ${ui.word(some(pl.length, 'plugin'), { go: 'code/plugins' })} and ${ui.word(some(cn.length, 'connection', ' to other apps'), { go: 'code/connections' })}.`,
          langN ? `Your files ${ui.word(savesWord(), { go: 'code', reveal: AUTOSAVE })}, and ${ui.word(count(langN, 'language tool'), { go: 'code/languages' })} ${lsp.length && fmt.length ? 'check and tidy' : lsp.length ? (langN === 1 ? 'checks' : 'check') : (langN === 1 ? 'tidies' : 'tidy')} the code as it is written.`
            : `Your files ${ui.word(savesWord(), { go: 'code', reveal: AUTOSAVE })}. ${ui.word('No language tools', { go: 'code/languages' })} check or tidy the code yet.`
        ] }) },
        { key: 'needs', html: needsHtml },
        { key: 'kinds', html: `<section class="smx-cd-kinds" aria-label="What the assistant can pick up"><h3 class="smx-kicker">What the assistant can pick up: three kinds, easy to mix up</h3><div class="smx-cd-kind-grid">${[
          kindTile({ go: 'code/skills', icon: 'wand', name: 'Skills', is: 'Know-how the assistant reads.', text: 'A skill is a short set of written instructions for one kind of job, such as writing release notes. It adds no new tools.', count: tile('skills', sk.length, 'skill', `${skOn} on`, skOn, 'Ready') }),
          kindTile({ go: 'code/plugins', icon: 'puzzle', name: 'Plugins', is: 'A bundle someone else made.', text: 'A plugin adds tools the assistant can use. One plugin can bring skills, commands and connections with it.', count: tile('plugins', pl.length, 'plugin', `${plOnN} on`, plOnN, 'Ready') }),
          kindTile({ go: 'code/connections', icon: 'plug', name: 'Tool connections', is: 'A live link to another app or service.', text: 'A connection lets the assistant read and change things there while it works, such as issues on GitHub. The technical name is an MCP server.', count: tile('connections', cn.length, 'connection', `${cnOk} working`, cnOk, 'Working') })
        ].join('')}</div>${githubLine(st, '')}</section>` },
        { key: 'tasks', html: ui.tasks([
          { icon: 'wand', title: 'Teach the assistant a skill', sub: 'Write it yourself, or bring one in', action: 'pm51-skills-add' },
          { icon: 'puzzle', title: 'Add a plugin', sub: 'You see what it may reach before it is installed', action: 'pm51-plugins-add' },
          { icon: 'plug', title: 'Connect another app', sub: 'GitHub, Linear, Notion, a database and more', action: 'pm51-mcp-add' },
          { icon: 'bolt', title: 'Make a command of your own', sub: 'A message you send often, under a short name', action: 'pm51-commands-new' }
        ], { title: 'What do you want to do?' }) },
        { key: 'later', html: nd.some((n) => n.tone === 'info') ? ui.card({ title: 'When you have a moment', help: 'Nothing here stops any work.', body: ui.rows(nd.filter((n) => n.tone === 'info').map((n) => ({ label: n.title, help: n.detail, control: ui.btn(n.fix) }))) }) : '' },
        { key: 'editor', html: `<div class="smx-cd-part"><h3 class="smx-kicker">The editor and your files</h3>${quiet(`How the editor looks (its colours, font and guides) is under ${ui.link({ label: 'Look & feel › Editor look', go: 'look/editor' })}.`)}</div>` }
      ];
    },
    sections: [
      { key: 'saving', title: 'Saving, and the list of files', help: 'When your work is saved, and what the file list shows.', ids: [AUTOSAVE, 'general.interaction.hide-ignored-files', 'general.interaction.expand-current-file'] },
      { key: 'search', title: 'Search in this project', help: 'An index of the project’s files, so that search and autocomplete answer at once.', ids: ['web.index.enable', 'web.index.mode', 'web.index.exclusion-patterns', 'web.index.rebuild'] }
    ],
    more: [
      { key: 'tabs', title: 'Tabs', help: 'How a file opens in a tab, how many stay open now, and how many come back next time.', ids: ['general.interaction.preview-tabs', 'general.interaction.tab-sizing', 'general.interaction.max-editor-tabs', 'general.startup.max-persisted-tabs'] },
      { key: 'tree', title: 'Folders, and dragging files', help: 'What the file list remembers, and what a drag does.', ids: ['general.interaction.persist-tree-state', 'general.interaction.drop-action', 'general.interaction.drop-conflict'] },
      { key: 'writing', title: 'Marked problems, comparing changes and indentation', help: 'Which problems are marked in the code, how two versions are shown side by side, and what a level of indentation is made of.', ids: ['code.editing.diagnostics-visibility', 'code.editing.diff-layout', 'code.editing.goto-highlight-ms', 'code.editing.tab-size', 'code.editing.insert-spaces', 'code.editing.detect-indentation'] },
      S('editor-big-files', { title: 'Very big files and folders', help: 'Limits that keep the app fast.' }),
      S('editor-search-index-more', { title: 'More about the search index', help: 'Big files, linked folders, projects kept on another computer, and disk space.' })
    ],
    moreLabel: 'Tabs, folders, indentation and big files', moreHelp: 'Less common choices',
    expert: [{ key: 'encoding', title: 'Text encoding', help: 'How letters are stored in a new file. UTF-8 is right for almost everything.', ids: ['code.editing.default-encoding'] }],
    changes: [
      { was: 'Skills, Plugins and MCP Servers describe themselves in the same words: “Reusable know-how the assistant can pick up for specific jobs”, “Add-ons that give the assistant new tools and connections”, “Connect outside tools and services the assistant can call”. GitHub is a plugin (21 tools), an MCP server (21 tools) and a Toolchain “agent tool”, and no page says which is which.', now: 'The chapter opens on the three kinds side by side, one sentence each, with your own counts, and one line that says what each GitHub is. The same line is on each of those GitHub pages.' },
      { was: 'A skill waiting for permission, a plugin whose folder moved, a server that cannot be reached and a language server that stopped are each reported only inside their own manager (four managers, eight tabs).', now: 'Everything in this chapter that needs you is listed here, each with the one button that deals with it; the four that stop something are on Settings Home too. What can wait (an update, shortcuts that share keys) is a separate short card, “When you have a moment”.' },
      { was: 'Editor & Terminal is one page of 133 rows about 8,000 px tall. Saving, tabs, the file tree and indentation share one scroll with 47 rows of terminal effects (scanlines, screen curvature, bezel material).', now: 'Editor & files is 7 rows here (saving, the file list, search) with 21 more folded under five headings and one under For experts. The terminal has its own page. How both look is under Look & feel, and this page links there once.' },
      { was: '“Most editor tabs open at once” (25) and “Tabs reopened next time” (50) sit in “Saving & tabs” with help texts that overlap, and “Project search index” sits between the terminal sections under an id that starts with web.', now: 'The two tab limits are one group, “Tabs”, whose line says which is now and which is next time. The index is “Search in this project”, next to saving.' },
      { was: 'Every “Choose” button beside a folder field opens a dialog that reads “The native Slint picker binds this field to the selected project-scoped path.”', now: 'Not changed here: the dialog is PMConcept7’s own. Listed as a defect in the build report.' }
    ]
  });

  /* ================================================================== Terminal */
  const TM = { shell: 'code.terminal.shell', cwd: 'code.terminal.cwd', restore: 'code.terminal.layout-restore', paste: 'code.terminal.paste-protection', keep: 'code.terminal.transcript-retention' };
  SMX.extend('code/terminal', {
    cls: 'smx-cd',
    purpose: 'A terminal is a window where commands are typed, by you or by the assistant. This page is about how it behaves.',
    blurb: () => `${/default/i.test(String(val(TM.shell))) ? 'Runs your computer’s usual shell' : `Runs ${word(TM.shell)}`} · terminals ${/restore/i.test(String(val(TM.restore))) ? 'come back as you left them' : 'start fresh each time'}`,
    keywords: ['shell', 'bash', 'zsh', 'powershell', 'fish', 'paste', 'scrollback', 'copy', 'terminal history', 'startup command'],
    lead: () => {
      const shell = /default/i.test(String(val(TM.shell))) ? 'your computer’s usual shell' : word(TM.shell);
      const cwd = String(val(TM.cwd) || ''); const where = !cwd || /^project root$/i.test(cwd) ? 'the project folder' : cwd;
      const back = /restore/i.test(String(val(TM.restore))) ? 'come back as you left them' : 'start fresh';
      const paste = val(TM.paste) !== false && val(TM.paste) !== 'off' ? 'is shown to you before it runs' : 'runs at once';
      return [
        { key: 'summary', html: ui.summary({ icon: 'terminal', tone: 'ready', lines: [
          `New terminals run ${ui.word(shell, { go: 'code/terminal', reveal: TM.shell })} and start in ${ui.word(where, { go: 'code/terminal', reveal: TM.cwd })}.`,
          `When a project reopens, its terminals ${ui.word(back, { go: 'code/terminal', reveal: TM.restore })}. Text of several lines that you paste ${ui.word(paste, { go: 'code/terminal', reveal: TM.paste })}.`
        ] }) },
        { key: 'look', html: quiet(`How the terminal looks (its colours, font, background and effects) is under ${ui.link({ label: 'Look & feel › Terminal look', go: 'look/terminal' })}.`) }
      ];
    },
    sections: [
      { key: 'open', title: 'When a project reopens, or a terminal closes', ids: [TM.restore, 'code.terminal.kill-confirm'] },
      { key: 'copy', title: 'Copy and paste', help: 'What copying and pasting do in the terminal.', ids: [TM.paste, 'code.terminal.copy-on-select', 'code.terminal.right-click-paste', 'code.terminal.copy-behavior'] }
    ],
    more: [
      { key: 'shell', title: 'Which shell runs, and where it starts', help: 'The shell is the program that reads what is typed in a terminal.', ids: [TM.shell, 'code.terminal.allowed-profiles', TM.cwd, 'code.terminal.startup-command'] },
      { key: 'output', title: 'Output and history', help: 'Finding your way in long output, and how much of it is kept. Every other “keep for” choice is under Backups & history › How long things are kept.', ids: ['code.terminal.readability-signals', 'code.terminal.sticky-header', 'code.terminal.scrollback-limit', TM.keep] },
      { key: 'speed', title: 'Speed and sharpness', ids: ['code.terminal.performance-mode', 'code.terminal.font-rendering'] }
    ],
    moreLabel: 'The shell, output and history', moreHelp: 'Less common choices',
    expert: [{ key: 'trouble', title: 'Troubleshooting', help: 'For when a terminal misbehaves.', ids: ['code.terminal.shell-integration', 'code.terminal.diagnostics-logging'] }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'The terminal’s own keys', go: 'code/shortcuts' }, { label: 'Commands the assistant must never run', go: 'safety/protected' }]) }],
    changes: [
      { was: 'On Editor & Terminal the section “Terminal” holds 52 rows under the line “Which shell runs, where it starts, and how panes come back”. 47 of them are about how the terminal looks; “Terminal look” holds 4.', now: 'This page holds the 18 rows about how the terminal behaves, 6 of them before a fold, and opens on two sentences that say what is set. The look rows are on Look & feel › Terminal look, and this page links there once.' },
      { was: '“Shells this project may use” is under “More options” with the help “The Shell above must be one of these”, a fold away from the “Shell” row it limits.', now: 'The two rows are next to each other, so “the Shell above” is the row above.' },
      { was: '“Keep terminal output for” shows “Keep Saved Scrollback”, which is not a length of time and is not one of its own five choices (Session Only, 24 Hours, 7 Days, 30 Days, Forever).', now: 'Not changed here: the value is PMConcept7’s. The row sits with the other output rows, and its group points to the one page for “keep for” choices. Listed as a defect in the build report.' }
    ]
  });

  /* ================================================================== Language help */
  const LG = { on: 'code.editing.lsp-enabled', tidy: 'code.editing.formatters-enabled', attach: 'code.editing.lsp-host-attachment', restart: 'code.editing.lsp-restart' };
  const runSetting = (id) => ({ action: 'run-setting-action', data: { setting: id } });
  /* PMConcept7's Restart (a menu item) shows a note and leaves the tool as it was; here it comes back, as it would in the app */
  SMX.act('code-lang-restart', (el) => {
    const id = el.getAttribute('data-id'); let name = '';
    write((st) => { const x = lspsOf(st).find((y) => y.id === id); if (!x) return; name = x.name; if (x.status === 'attention') { x.status = 'ready'; x.lastTest = 'Passed'; } });
    if (name) SMX.toast(`${name} restarted`, 'It is answering again. Example only: language tools run in the real app.', 'info');
  });
  SMX.act('code-fmt-on', (el) => { const id = el.getAttribute('data-id'); write((st) => { const f = fmtsOf(st).find((y) => y.id === id); if (f) f.enabled = !tOn(f); }); });
  SMX.act('code-lang-remove', (el) => {
    const kind = el.getAttribute('data-kind') === 'fmt' ? 'formatters' : 'lsps', id = el.getAttribute('data-id');
    const x = (tc(eng().getState())[kind] || []).find((y) => y.id === id); if (!x) return;
    kit().confirm(`Remove ${x.name}?`, `The ${kind === 'lsps' ? 'language server' : 'formatter'} is taken off your list. Nothing is uninstalled from your computer.`, 'Remove', () => {
      write((st) => { st.toolchain[kind] = (st.toolchain[kind] || []).filter((y) => y.id !== id); });
      SMX.toast(`${x.name} removed`, 'It is no longer on your list.'); SMX.go('code/languages', { replace: true });
    }, true);
  });
  const lspThing = (x) => { const [text, tone] = lspStatus(x); return { icon: 'code', name: x.name, tag: x.language || '', sub: `Understands ${x.language || 'its language'}`, sub2: sourceOf(x), status: { text, tone }, go: R.lsp(x.id) }; };
  const fmtThing = (x) => { const [text, tone] = fmtStatus(x); const langs = x.languages || []; return { icon: 'sparkle', name: x.name, tag: langs.length > 2 ? count(langs.length, 'language') : langs.join(', '), sub: `Tidies ${and(langs) || 'its files'} ${fmtWhen(x)}`, sub2: sourceOf(x), status: { text, tone }, go: R.fmt(x.id) }; };
  const LANG_FILTER_FROM = 8;   /* the two lists together hold more than this many tools before a filter box is worth its place */
  SMX.act('code-lang-filter', () => { SMX.soon(10); });
  SMX.extend('code/languages', {
    cls: 'smx-cd',
    purpose: 'Tools that know the programming languages in your project. One kind understands the code: it marks mistakes and completes what is typed. The other tidies it, so every file looks the same.',
    blurb: (ctx) => { const a = lspsOf(ctx.st).length, b = fmtsOf(ctx.st).length; if (!a && !b) return 'Tools that check your code and tidy it'; return `${a ? `${count(a, 'tool')} ${a === 1 ? 'understands' : 'understand'} your code` : 'No tool understands your code yet'} · ${b ? `${b} ${b === 1 ? 'tidies' : 'tidy'} it` : 'nothing tidies it yet'}`; },
    status: (ctx) => { const n = needsFor(ctx.st, 'languages').length; return n ? { text: `${n} need${n === 1 ? 's' : ''} a restart`, tone: 'attention' } : lspsOf(ctx.st).length + fmtsOf(ctx.st).length ? { text: 'Running', tone: 'ready' } : { text: 'None yet', tone: 'off' }; },
    keywords: ['lsp', 'language server', 'formatter', 'prettier', 'rustfmt', 'rust-analyzer', 'pyright', 'autocomplete', 'format on save', 'tidy', 'errors', 'squiggles'],
    lead: (ctx) => {
      const st = ctx.st; const lsp = lspsOf(st), fmt = fmtsOf(st); const nd = needsFor(st, 'languages');
      const a = lsp.filter(tOn), b = fmt.filter(tOn); const langs = [...new Set(a.map((x) => x.language).filter(Boolean))];
      const offA = val(LG.on) === false || val(LG.on) === 'off', offB = val(LG.tidy) === false || val(LG.tidy) === 'off';
      /* PMConcept7 has a filter box over each of its two lists. Here one box narrows both, and it appears once the lists
         are long enough to need it; what is typed lives in the box itself. */
      const box = SMX.host && SMX.host() ? SMX.host().querySelector('[data-smx-input="code-lang-filter"]') : null;
      const q = lsp.length + fmt.length > LANG_FILTER_FROM && box ? String(box.value || '').trim().toLowerCase() : '';
      const hit = (x) => !q || [x.name, x.language, (x.languages || []).join(' '), sourceOf(x)].some((v) => String(v || '').toLowerCase().includes(q));
      const noMatch = (icon) => ({ icon, title: `Nothing here matches “${q}”`, text: 'Try fewer letters, or the name of a language.' });
      return [
        { key: 'summary', html: ui.summary({ icon: 'brackets', tone: nd.length ? 'attention' : 'ready', lines: [
          !lsp.length && !fmt.length ? 'No language tools yet. Puppet Master can look at your project and offer the ones it needs.'
            : `${a.length ? `${ui.b(count(a.length, 'tool'))} ${a.length === 1 ? 'understands' : 'understand'} your code as it is written${langs.length ? ` (${h(and(langs))})` : ''}` : `${ui.b('No tool')} understands your code yet`}, and ${b.length ? `${ui.b(count(b.length, 'tool'))} ${b.length === 1 ? 'tidies' : 'tidy'} it` : 'nothing tidies it yet'}.`,
          offA && offB ? `Both kinds are ${ui.word('switched off for every language', { go: 'code/languages', reveal: LG.on })}.` : offA ? `Understanding code is ${ui.word('switched off for every language', { go: 'code/languages', reveal: LG.on })}.` : offB ? `Tidying is ${ui.word('switched off for every language', { go: 'code/languages', reveal: LG.tidy })}.` : !lsp.length && !fmt.length ? 'Once there are some, the assistant uses them too: it sees the marked mistakes, and what it writes is tidied the same way.' : 'The assistant uses the same tools you do: it sees the marked mistakes, and what it writes is tidied the same way.'
        ], side: ui.btn({ label: 'Find what this project needs', icon: 'search', action: 'pm51-toolchain-discover' }) }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'filter', html: lsp.length + fmt.length > LANG_FILTER_FROM ? `<label class="smx-filter"><span class="icon" aria-hidden="true">${SMX.icon('search')}</span><input type="search" data-smx-input="code-lang-filter" data-smx-key="code-lang-filter" placeholder="Filter language tools by name or language" aria-label="Filter language tools by name or language" autocomplete="off" spellcheck="false"></label>` : '' },
        { key: 'lsps', html: covered(['code.editing.lsp-server-catalog', 'code.editing.lsp-custom-servers'], ui.things({ title: 'They understand your code', help: 'One for each language. It marks mistakes, completes what is typed and finds where things are defined. The technical name is a language server.', add: { label: 'Add a language server', action: 'pm51-toolchain-add-lsp' }, items: lsp.filter(hit).map(lspThing), empty: q ? noMatch('search') : { icon: 'code', title: 'None yet', text: 'Add one, or let Puppet Master find the tools this project needs.', fix: { label: 'Find what this project needs', action: 'pm51-toolchain-discover' } } })) },
        { key: 'fmts', html: covered(['code.editing.formatter-catalog', 'code.editing.formatter-custom'], ui.things({ title: 'They tidy your code', help: 'They fix spacing, line breaks and quotes, so that every file looks the same. The technical name is a formatter.', add: { label: 'Add a formatter', action: 'pm51-toolchain-add-fmt' }, items: fmt.filter(hit).map(fmtThing), empty: q ? noMatch('search') : { icon: 'sparkle', title: 'None yet', text: 'Add one, or let Puppet Master find the tools this project needs.' } })) }
      ];
    },
    sections: [{ key: 'all', title: 'For all of them', help: 'One switch for each kind, and what happens by itself.', ids: [LG.on, LG.tidy, 'general.interaction.language-detection', 'code.editing.lsp-auto-restart'] }],
    more: [{ key: 'helpers', title: 'When a helper agent fixes code', help: 'Helper agents are extra workers the assistant can start. They are set up under Memory & helpers.', ids: ['code.editing.lsp-subagent-bias'] }],
    moreLabel: 'Helpers and languages', moreHelp: 'One less common choice',
    expert: [S('toolchain-lsp-tools', { title: 'Waiting times and limits', help: 'How long the tools that understand code may take, and how much of this computer they may use.' })],
    tail: () => [{ key: 'links', html: covered([LG.restart], ui.links([
      Object.assign({ label: 'Restart every tool that understands code' }, runSetting(LG.restart)),
      { label: 'Check the tools that understand code', action: 'pm51-toolchain-diagnostics', data: { kind: 'lsps' } },
      { label: 'Check the tools that tidy code', action: 'pm51-toolchain-diagnostics', data: { kind: 'formatters' } },
      { label: 'Holding work back while the code shows problems', go: 'planning/proof', reveal: 'planning.verification.lsp-gate' },
      { label: 'How language tools work', action: 'pm51-toolchain-help' },
      { label: 'Put the example language tools back', action: 'pm51-toolchain-reset' }
    ])) }],
    covers: { 'code.editing.lsp-server-catalog': 'The list “They understand your code” on this page.', 'code.editing.lsp-custom-servers': 'The button “Add a language server” on that list.', [LG.restart]: 'The link “Restart every tool that understands code” at the foot of this page, and “Restart it” on each tool’s own page.', [LG.attach]: '“Folder it reads” on each tool’s own page.', 'code.editing.formatter-catalog': 'The list “They tidy your code” on this page.', 'code.editing.formatter-custom': 'The button “Add a formatter” on that list.' },
    changes: [
      { was: 'Toolchain is three tabs. “Language Servers” and “Formatters” are each a list of three beside the full detail of the first one, and the choices for all of them (“Language help”, “Code health gate”, “Timing and limits”) are drawn inside that detail pane, as if they belonged to rust-analyzer.', now: 'One page lists both kinds. Each tool opens a page of its own, and the four choices that apply to all of them sit under the lists.' },
      { was: 'Pyright reads “Needs attention” in the list and “Needs a restart” in its details. The way to restart it is an item in a “More actions” menu, and that item only shows the note “Restarting Pyright” and leaves it as it was: nothing in PMConcept7 makes it run again.', now: 'One word, “Needs a restart”, in the list, on its page and under “Needs you”, each with a “Restart it” button. Here the button brings it back to “Running”, which is what the app is meant to do; the concept shows that intended behaviour.' },
      { was: '“Server” means three things in Settings: a language server here, a computer under “Server & Project Location”, and an MCP server. This tab says “Add language server”, “Check server”, “Restart a server if it stops” and “Memory each server may use”.', now: 'The lists are “They understand your code” and “They tidy your code”, with the technical names (language server, formatter) given once each. Four rows are reworded to match. PMConcept7’s own add and edit flows still say “language server”.' },
      { was: 'A tool’s menu (“More actions”: Restart, Restart all language servers, Turn off, View logs, Remove) exists only while the manager is drawn.', now: 'They are ordinary buttons on the tool’s own page, “Remove it” last. “Restart all” is a link at the foot of this page and opens PMConcept7’s own five-step restart.' },
      { was: '“Check code health before work moves on” and its five options are on the Language Servers tab, though they decide when a Goal may move on.', now: 'They are under Planning & goals › Checking the work; this page links there.' }
    ]
  });

  /* ---- one tool that understands code (a language server) -------------------------------------------------------- */
  const lspOf = (ctx) => lspsOf(ctx.st).find((x) => x.id === (ctx.params || {}).id) || null;
  const envNames = (x) => (Array.isArray(x.env) ? x.env : []).map((e) => String(e).split('=')[0]);
  SMX.page({
    id: 'code/languages/understands/:id', chapter: 'code', cls: 'smx-cd', parent: 'code/languages',
    title: (ctx) => { const x = lspOf(ctx); return x ? x.name : 'Language tool'; },
    nav: (ctx) => { const x = lspOf(ctx); return x ? x.name : 'Language tool'; },
    purpose: (ctx) => { const x = lspOf(ctx); return x ? `A tool that understands ${x.language || 'one language'}: it marks mistakes, completes what is typed and finds where things are defined. The technical name is a language server.` : ''; },
    legacy: [['code', 'toolchain', 'servers', 'toolchain']],
    headSide: (ctx) => { const x = lspOf(ctx); return x ? ui.btn({ label: 'Check it', icon: 'test', action: 'pm51-toolchain-check-lsp', data: { id: x.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, x = lspOf(ctx);
      if (!stillThere(ctx, x, 'code/languages')) return gone('language tool', 'code/languages', 'Back to Language help');
      const tone = lspStatus(x)[1]; const attach = String(val(LG.attach) || 'Auto');
      const reads = tOn(x) && x.status === 'ready' ? (attach !== 'Auto' ? attach : 'The project folder') : 'Nothing while it is stopped';
      return [
        { key: 'summary', html: ui.summary({ icon: 'code', tone, lines: [
          `${ui.b(x.name)} ${!tOn(x) ? 'is switched off for this project. It stays on your list.' : x.status === 'ready' ? 'is running.' : x.status === 'attention' ? 'has stopped answering and needs a restart.' : 'has not been checked yet.'}`,
          `${h(sourceOf(x))}.${x.lastTest ? ` Last check: ${h(lower(x.lastTest))}.` : ''}`
        ], side: switchLine('Use it in this project', toggle(tOn(x), { action: 'pm51-toolchain-lsp-on', data: { id: x.id }, label: `Use ${x.name} in this project` })) }) },
        { key: 'needs', html: ui.needs(own(needsFor(st, 'languages', x.id))) },
        { key: 'about', html: ui.card({ title: 'What it works on', body: ui.rows([
          { label: 'Language', value: x.language || 'Not set' },
          { label: 'Files it handles', help: 'A star stands for any name: *.rs is every file that ends in .rs.', value: filesOf('lsp', x).join(', ') || 'Not set' },
          { label: 'Program', help: sourceOf(x), value: x.command || 'Not set' },
          { label: 'Folder it reads', help: 'The folder this tool treats as the project.', value: reads, covers: LG.attach },
          { label: 'Available in', value: x.scope === 'User' ? 'Every project' : 'This project' }
        ]) }) },
        { key: 'actions', html: btnRow(
          ui.btn({ label: 'Change it…', icon: 'edit', action: 'pm51-toolchain-edit-lsp', data: { id: x.id } }),
          tOn(x) && x.status === 'attention' ? '' : ui.btn({ label: 'Restart it', icon: 'refresh', do: 'code-lang-restart', data: { id: x.id } }),
          ui.btn({ label: 'See its logs', icon: 'terminal', action: 'pm51-toolchain-logs', data: { kind: 'lsps', id: x.id } }),
          ui.btn({ label: 'Remove it…', icon: 'trash', danger: true, do: 'code-lang-remove', data: { kind: 'lsp', id: x.id } })
        ) }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => !!lspOf(ctx), html: (ctx) => { const x = lspOf(ctx); if (!x) return ''; return ui.card({ title: 'How it starts', body: facts([['Starts with', [x.command].concat(x.args || []).filter(Boolean).join(' ') || 'Not set'], ['Extra values it is given', envNames(x).join(', ') || 'None'], ['Files that mark where a project starts', (x.rootMarkers || []).join(', ') || 'None'], ['Startup options', x.initOptions || 'Its own defaults'], ['Its id', x.id]]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Run a full check', icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'lsps', id: x.id } })}</div>` }); } }],
    expertLabel: 'How it starts', expertHelp: 'Start arguments, project markers and a full check',
    changes: [
      { was: 'A language server’s details share the tab with the list and with the settings for all of them. “Used in this project” is one of five rows, and Restart, Turn off, View logs and Remove are in a “More actions” menu.', now: 'It has a page: one sentence says whether it runs, the switch for this project is beside it, then what it works on and its four actions as buttons, “Remove it” last.' },
      { was: 'Remove, in that menu, asks “Remove …? The language server is taken off your list. Nothing is uninstalled from your computer.”', now: 'The same question, in the same words, from the button on this page.' }
    ]
  });

  /* ---- one tool that tidies code (a formatter) -------------------------------------------------------------------- */
  const fmtOf = (ctx) => fmtsOf(ctx.st).find((x) => x.id === (ctx.params || {}).id) || null;
  const SAMPLES = { prettier: ['const user={name:"Ada",tags:["a","b"]}', 'const user = { name: "Ada", tags: ["a", "b"] };'], rustfmt: ['fn main(){println!("hi");}', 'fn main() {\n    println!("hi");\n}'], 'ruff-format': ['def add(a,b):return a+b', 'def add(a, b):\n    return a + b'], black: ['def add(a,b):return a+b', 'def add(a, b):\n    return a + b'], gofmt: ['func main(){fmt.Println("hi")}', 'func main() {\n\tfmt.Println("hi")\n}'] };
  SMX.page({
    id: 'code/languages/tidies/:id', chapter: 'code', cls: 'smx-cd', parent: 'code/languages',
    title: (ctx) => { const x = fmtOf(ctx); return x ? x.name : 'Language tool'; },
    nav: (ctx) => { const x = fmtOf(ctx); return x ? x.name : 'Language tool'; },
    purpose: (ctx) => { const x = fmtOf(ctx); return x ? `A tool that tidies ${and(x.languages || []) || 'code'}: it fixes spacing, line breaks and quotes without changing what the code does. The technical name is a formatter.` : ''; },
    legacy: [['code', 'toolchain', 'formatters', 'toolchain']],
    headSide: (ctx) => { const x = fmtOf(ctx); return x ? ui.btn({ label: 'Check it', icon: 'test', action: 'pm51-toolchain-check-fmt', data: { id: x.id } }) : ''; },
    lead: (ctx) => {
      const x = fmtOf(ctx);
      if (!stillThere(ctx, x, 'code/languages')) return gone('language tool', 'code/languages', 'Back to Language help');
      const tone = fmtStatus(x)[1]; const sample = SAMPLES[x.id] || SAMPLES[x.tool] || ['a=1', 'a = 1'];
      const flag = (name, label, help) => ({ label, help, control: toggle(!!x[name], { action: 'pm51-toolchain-fmt-flag', data: { id: x.id, flag: name }, label }) });
      return [
        { key: 'summary', html: ui.summary({ icon: 'sparkle', tone, lines: [
          `${ui.b(x.name)} ${!tOn(x) ? 'is switched off for this project. It stays on your list.' : x.status === 'ready' ? `is ready, and tidies a file ${fmtWhen(x)}.` : x.status === 'attention' ? 'needs attention.' : 'has not been checked yet.'}`,
          `${h(sourceOf(x))}.`
        ], side: `<span data-smx-do="code-fmt-on" data-id="${h(x.id)}">${switchLine('Use it in this project', toggle(tOn(x), { action: 'pm51-noop', label: `Use ${x.name} in this project` }))}</span>` }) },
        { key: 'when', html: ui.card({ title: 'When it tidies', body: ui.rows([
          flag('onSave', 'Every time I save', 'Off means it only tidies when you ask.'),
          flag('onPaste', 'When I paste', 'Tidies text as soon as it is pasted in.'),
          flag('changedLines', 'Only the lines I changed', 'Leaves untouched code exactly as it was.')
        ]) }) },
        { key: 'about', html: ui.card({ title: 'What it works on', body: ui.rows([
          { label: (x.languages || []).length === 1 ? 'Language' : 'Languages', value: (x.languages || []).join(', ') || 'Not set' },
          { label: 'Files it tidies', help: 'A star stands for any name: *.rs is every file that ends in .rs.', value: filesOf('fmt', x).join(', ') || 'Not set' },
          { label: 'Program', help: sourceOf(x), value: x.executable || 'Not set' },
          { label: 'Available in', value: x.scope === 'User' ? 'Every project' : 'This project' }
        ]) }) },
        { key: 'sample', html: ui.card({ title: 'What tidying does', help: 'A small example. The code does the same before and after; only its shape changes.', body: `<div class="smx-cd-sample"><div><div class="smx-cd-sample-label">Before</div><pre>${h(sample[0])}</pre></div><div><div class="smx-cd-sample-label">After</div><pre>${h(sample[1])}</pre></div></div>` }) },
        { key: 'actions', html: btnRow(
          ui.btn({ label: 'Change it…', icon: 'edit', action: 'pm51-toolchain-edit-fmt', data: { id: x.id } }),
          ui.btn({ label: 'See its logs', icon: 'terminal', action: 'pm51-toolchain-logs', data: { kind: 'formatters', id: x.id } }),
          ui.btn({ label: 'Remove it…', icon: 'trash', danger: true, do: 'code-lang-remove', data: { kind: 'fmt', id: x.id } })
        ) }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => !!fmtOf(ctx), html: (ctx) => { const x = fmtOf(ctx); if (!x) return ''; return ui.card({ title: 'How it runs', body: facts([['Runs as', [x.executable].concat(x.args || []).filter(Boolean).join(' ') || 'Not set'], ['Extra values it is given', envNames(x).join(', ') || 'None'], ['Its settings file', x.config && x.config !== 'None' ? x.config : 'None'], ['Files it leaves alone are listed in', x.ignore && x.ignore !== 'None' ? x.ignore : 'Nothing'], ['Its id', x.id]]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Run a full check', icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'formatters', id: x.id } })}</div>` }); } }],
    expertLabel: 'How it runs', expertHelp: 'Arguments, its settings file and a full check',
    changes: [
      { was: 'A formatter’s three switches read “Format on save”, “Format on paste” and “Only changed lines”; turning the formatter itself off, its logs and Remove are in a “More actions” menu, and the before-and-after sample is under “More options”.', now: 'It has a page. The switch for this project is at the top, “When it tidies” holds the three switches in everyday words, the sample is shown as “What tidying does”, and its actions are buttons, “Remove it” last.' }
    ]
  });

  /* ================================================================== Skills */
  const rulesCard = () => {
    const rules = Object.entries(runMap()).filter(([k]) => k.includes('*'));
    return covered([SK.perms, SK.pattern], ui.card({ title: 'One answer for a group of skills', help: 'For every skill whose name matches a pattern, such as doc-* for names that start with doc-. A skill’s own answer, on its page, beats a group’s.', side: bound('action', SK.pattern, { label: rules.length ? 'Change the groups' : 'Add a group', icon: rules.length ? 'edit' : 'plus' }),
      body: (rules.length ? ui.rows(rules.map(([pattern, v]) => ({ label: pattern, help: `Skills whose name matches ${pattern}`, value: (RUN.find((r) => r[0] === v) || [v, v])[1] }))) : quiet('No groups yet. Each skill follows the main rule unless you choose on its own page.'))
        + `<p class="smx-quiet-line smx-pad">The main rule is that ${h(mainSkillRule())}. It is the row “Use skills” under ${ui.link({ label: 'Safety & permissions › Rules for each action', go: 'safety/rules', reveal: 'safety.rules.per-tool-permissions' })}.</p>` }));
  };
  SMX.extend('code/skills', {
    cls: 'smx-cd',
    purpose: 'A skill is know-how the assistant reads: a short set of written instructions for one kind of job, such as writing release notes. It adds no new tools.',
    blurb: (ctx) => { const l = skillsOf(ctx.st); return l.length ? `${count(l.length, 'skill')} · ${l.filter((s) => s.enabled).length} on` : 'Know-how the assistant reads'; },
    status: (ctx) => { const n = needsFor(ctx.st, 'skills').filter((x) => x.tone !== 'info').length; return n ? { text: `${n} need${n === 1 ? 's' : ''} you`, tone: 'attention' } : skillsOf(ctx.st).length ? { text: 'Ready', tone: 'ready' } : { text: 'None yet', tone: 'off' }; },
    keywords: ['skill', 'skills', 'instructions', 'know-how', 'skill.md', 'catalog', 'release notes', 'add skill'],
    lead: (ctx) => {
      const st = ctx.st; const all = skillsOf(st); track('skills', all.map((x) => x.id));
      const q = String(val(SK.search) || '').trim().toLowerCase();
      const hit = (s) => !q || [s.name, s.description, originOf(s), s.origin, skStatus(s)[0], s.permissions].join(' ').toLowerCase().includes(q);
      const main = skSorted(all.filter(skShown).filter(hit)), rest = skSorted(all.filter((s) => !skShown(s)).filter(hit));
      if (q && rest.length && !main.length) SMX.local.openMore['code/skills:off'] = true;
      const onN = all.filter((s) => s.enabled).length; const auto = val(SK.auto) !== false && val(SK.auto) !== 'off'; const newOn = val(SK.autoNew) === true || val(SK.autoNew) === 'on';
      const nd = needsFor(st, 'skills');
      const empty = !all.length ? { icon: 'wand', title: 'No skills yet', text: 'Add one from the catalog, or write your own. The steps guide you.', fix: { label: 'Add a skill', action: 'pm51-skills-add' } }
        : q ? { icon: 'search', title: `No skill here matches “${q}”`, text: rest.length ? 'There is a match among the ones that are switched off, below.' : 'Try fewer letters.' }
          : { icon: 'wand', title: 'Every skill is switched off', text: 'They are listed below.' };
      return [
        { key: 'summary', html: ui.summary({ icon: 'wand', tone: nd.some((n) => n.tone !== 'info') ? 'attention' : 'ready', lines: [
          all.length && !onN ? `You have ${ui.b(count(all.length, 'skill'))}; ${share(onN, all.length, 'on')}, so the assistant uses ${all.length === 1 ? 'no skill' : 'none of them'} yet.` : all.length ? `You have ${ui.b(count(all.length, 'skill'))}; ${share(onN, all.length, 'on')}. ${auto ? `The assistant ${ui.word('picks one up by itself', { go: 'code/skills', reveal: SK.auto })} when it fits the job.` : `The assistant uses one ${ui.word('only when you ask for it', { go: 'code/skills', reveal: SK.auto })}.`}` : 'You have no skills yet. A skill teaches the assistant how you want one kind of job done.',
          `A new skill ${ui.word(newOn ? 'is switched on as soon as it is added' : 'arrives switched off until you have looked at it', { go: 'code/skills', reveal: SK.autoNew })}. A skill never gets more than it asked for when you added it.`
        ] }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'tools', fixed: true, sig: JSON.stringify([val(SK.show), val(SK.sort), all.length > 0]), html: all.length ? `<div class="smx-cd-toolbar">${bound('search', SK.search, { placeholder: 'Search your skills' })}${bound('select', SK.show, { prefix: 'Show', width: 150 })}${bound('select', SK.sort, { prefix: 'Sort', width: 140 })}</div>` : '' },
        { key: 'list', html: covered(['extensions.skills.your-skills', 'extensions.skills.skill-on-off'], ui.things({ title: 'Your skills', help: 'Each one says whether it is on. Open one to see what it does, what it needs and what it may do.', add: { label: 'Add a skill', action: 'pm51-skills-add' }, items: main.map(skThing), empty })) },
        { key: 'off', html: rest.length ? fold('code/skills:off', `${count(rest.length, 'skill')} switched off`, 'Left out of the list above by “Show”', ui.things({ items: rest.map(skThing) })) : '' }
      ];
    },
    sections: [
      S('skills-use', { title: 'How skills are used' }),
      { key: 'rules', html: () => rulesCard() },
      S('skills-new', { title: 'New skills' })
    ],
    more: [S('skills-share', { title: 'Other AI tools on this computer', help: 'Let other AI coding tools read the same skills.' }), S('skills-more', { title: 'Room for skills, and what the list shows', help: 'How much of each request the list of skills may take, and which details each row of the list carries.' })],
    moreLabel: 'Sharing, room and what the list shows', moreHelp: 'Less common choices',
    tail: () => [{ key: 'links', html: covered([SK.rescan, SK.validate], ui.links([{ label: 'Look for skills again', action: 'pm51-skills-rescan' }, { label: 'Check every skill', action: 'pm51-skills-diagnostics' }, { label: 'How skills work', action: 'pm51-skills-help' }, { label: 'Put the example skills back', action: 'pm51-skills-reset' }])) }],
    covers: { 'extensions.skills.your-skills': 'The list “Your skills” on this page; each skill opens on its own page.', 'extensions.skills.skill-on-off': 'The switch on each skill’s row and on its own page.', [SK.search]: 'The search box above the list.', [SK.show]: '“Show”, above the list.', [SK.sort]: '“Sort”, above the list.', [SK.rescan]: 'The link “Look for skills again” at the foot of this page.', [SK.validate]: 'The link “Check every skill” at the foot of this page.', 'extensions.skills.preview': '“Read its instructions” on each skill’s own page.', [SK.perms]: '“When it may run” on each skill’s own page, and the card “One answer for a group of skills”.', [SK.pattern]: 'The button on the card “One answer for a group of skills”.' },
    changes: [
      { was: 'The list is filtered by default (“Show: Active only”), and a skill added switched off is drawn with a “Ready” mark beside a switch that is off; only the note that flashes up says “It is off until you switch it on.” (Checked on PMConcept7: “API Docs Writer” from the catalog.)', now: 'Each skill says “On” or “Off” in words beside its switch, and one just added is marked “Just added”. “Show” keeps its three choices, but what it leaves out is folded under the list with a count (“1 skill switched off”) and never disappears.' },
      { was: 'A skill opens in a side panel over the list: What it does, Use it, What it needs, What it may do, Updates, Remove.', now: 'A skill has a page of its own with the same six things, the switch at the top and “Remove this skill” last.' },
      { was: '“When it may run” offers “Follows the default” without saying what the default is or where it is set, and “Rules for groups of skills” does not say either.', now: 'Both say what the main rule is today (“a skill asks you first”) and link to Safety & permissions › Rules for each action, where it is set. A skill’s own answer reads as an exception to it.' },
      { was: 'Rescan and Check all are in the list’s toolbar; “Reset the skill list” and “How skills work” are at the foot.', now: 'The four are quiet links at the foot of the page. The toolbar keeps what filters the list: search, Show and Sort.' },
      { was: 'A skill with an update reads “Warning” in the list.', now: 'It reads “On · update ready”, and the update is listed under “Needs you” with the button “See what changes”.' }
    ]
  });

  /* ---- one skill -------------------------------------------------------------------------------------------------- */
  const skillOf = (ctx) => skillsOf(ctx.st).find((s) => s.id === (ctx.params || {}).id) || null;
  const slug = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'skill';
  SMX.page({
    id: 'code/skills/:id', chapter: 'code', cls: 'smx-cd', parent: 'code/skills',
    title: (ctx) => { const s = skillOf(ctx); return s ? s.name : 'Skill'; },
    nav: (ctx) => { const s = skillOf(ctx); return s ? s.name : 'Skill'; },
    purpose: (ctx) => { const s = skillOf(ctx); return s ? `A skill: ${lower(s.description || 'written instructions for one kind of job.')}` : ''; },
    legacy: [['code', 'skills']],
    lead: (ctx) => {
      const st = ctx.st, s = skillOf(ctx);
      if (!stillThere(ctx, s, 'code/skills')) return gone('skill', 'code/skills', 'Back to Skills');
      const tone = skStatus(s)[1]; const reqs = s.requirements || []; const waiting = s.state === 'Needs permission';
      const where = skBundled(s) ? 'Inside Puppet Master' : s.where === 'Global' ? 'Your own skills folder, for every project' : 'This project (.puppet-master/skills)';
      return [
        { key: 'summary', html: ui.summary({ icon: 'wand', tone, lines: [
          `${ui.b(s.name)} ${!s.enabled ? 'is switched off. It stays on your list, and the assistant does not use it.' : waiting ? 'is on, but waiting for your OK before it does anything.' : s.state === 'Needs setup' ? 'is on, but cannot run until what it needs is set up.' : s.state === 'Has problems' ? 'is on, but something is wrong with it.' : 'is on. The assistant uses it when a job fits.'}`,
          `${h(originOf(s))} · version ${h(s.version)}${s.personas ? ` · used by ${h(s.personas)}` : ''}.`
        ], side: switchLine('Use this skill', toggle(!!s.enabled, { action: 'pm51-skills-toggle', data: { id: s.id }, label: `${s.name} on or off` })) }) },
        { key: 'needs', html: ui.needs(own(needsFor(st, 'skills', s.id))) },
        { key: 'does', html: ui.card({ title: 'What it does', side: skReadOnly(s) ? ui.btn({ label: 'Read its instructions', icon: 'file', action: 'pm51-skills-preview', data: { id: s.id } }) : ui.btn({ label: 'Edit its instructions', icon: 'edit', action: 'pm51-skills-edit', data: { id: s.id } }), body: `<p class="smx-cd-text">${h(s.description || 'No description yet.')}</p>` }) },
        { key: 'runs', html: ui.card({ title: 'When it runs', body: ui.rows([{ label: 'When it may run', help: runOf(s) ? 'This skill has its own answer. “Follows the main rule” puts it back.' : `Follows the main rule: ${mainSkillRule()}.`, control: select(runOf(s), RUN.map(([value, label]) => ({ value, label })), { action: 'pm51-skills-run', data: { id: s.id }, label: `When ${s.name} may run` }) + ui.btn({ label: 'The main rule', go: 'safety/rules', reveal: 'safety.rules.per-tool-permissions', ghost: true }) }]) }) },
        { key: 'reqs', html: ui.card({ anchor: 'reqs', title: 'What it needs', help: reqs.length ? 'It cannot run without these.' : '', side: ui.btn({ label: 'Check what it needs', icon: 'test', action: 'pm51-skills-check', data: { id: s.id } }), body: reqs.length ? ui.rows(reqs.map((r) => ({ label: reqLabel(r), status: reqMissing(r) ? ui.status('Not connected yet', 'attention') : ui.status('Ready', 'ready'), control: reqMissing(r) ? ui.btn({ label: /github/i.test(r) ? 'Connect GitHub' : 'Set up version history', icon: 'branch', go: 'source' }) : '' }))) : quiet('Nothing extra. It works by itself.') }) },
        { key: 'may', html: ui.card({ title: 'What it may do', help: 'A skill never gets more than this. Removing the skill takes it back.', body: ui.rows([{ label: mayText(s), help: waiting ? 'The skill is waiting for your OK.' : 'Granted when the skill was added.', status: waiting ? ui.status('Waiting for you', 'attention') : '', control: waiting && !s.enabled ? ui.btn({ label: 'Allow it…', icon: 'check', action: 'pm51-skills-allow', data: { id: s.id } }) : '' }]) + `<p class="smx-quiet-line smx-pad">What the assistant may do without asking, with or without a skill, is under ${ui.link({ label: 'Safety & permissions › When it asks you', go: 'safety/asking' })}.</p>` }) },
        { key: 'version', html: ui.card({ title: 'Its version, and where it is kept', body: ui.rows([
          { label: s.updateAvailable ? `Version ${s.updateAvailable} is available` : 'Up to date', help: `You have version ${s.version}.`, control: s.updateAvailable ? ui.btn({ label: 'See what changes', icon: 'download', action: 'pm51-skills-update', data: { id: s.id } }) : '' },
          { label: 'Kept in', value: where }
        ]) }) },
        { key: 'actions', html: btnRow(ui.btn({ label: 'Remove this skill…', icon: 'trash', danger: true, action: 'pm51-skills-remove', data: { id: s.id }, disabled: skBundled(s), reason: 'It came with Puppet Master, so it can be switched off but not removed.' })) }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => !!skillOf(ctx), html: (ctx) => { const s = skillOf(ctx); if (!s) return ''; return ui.card({ title: 'Technical details', body: facts([['Its file', skBundled(s) ? 'Part of Puppet Master' : `${slug(s.name)}/SKILL.md`], ['Its id', s.id], ['Where it came from, as stored', s.origin || '—'], ['Its state, as stored', s.state || '—']]) }); } }],
    changes: [
      { was: 'A skill’s on/off switch is the first row of the second group in a side panel, under “Use it”, and “Remove skill” is a group of its own at the bottom.', now: 'One sentence says whether the skill is on and whether anything stops it; the switch is beside that sentence. What it needs, what it may do and its version follow, and “Remove this skill” is the last button. A skill that came with Puppet Master says why it cannot be removed.' },
      { was: 'A missing requirement shows a button “Set up version control” that closes the panel and opens Source Control.', now: 'The row that is “Not connected yet” carries the button, and it opens the Source control chapter of this redesign.' }
    ]
  });

  /* ================================================================== Plugins */
  const reviewOf = (st) => ((((st.pm51 || {}).pluginsPrefs) || {}).updateReview) || 'Always ask me';
  const REVIEW_WORDS = { 'Always ask me': 'always asks you', 'Ask only when permissions change': 'asks you only when the plugin wants to reach more', 'Update automatically': 'goes ahead by itself' };
  SMX.extend('code/plugins', {
    cls: 'smx-cd',
    purpose: 'A plugin is a bundle someone else made. It adds tools the assistant can use, and can bring skills, commands and connections with it.',
    blurb: (ctx) => { const l = pluginsOf(ctx.st); return l.length ? `${count(l.length, 'plugin')} · ${l.filter(plOn).length} on` : 'Bundles someone else made, with tools for the assistant'; },
    status: (ctx) => { const n = needsFor(ctx.st, 'plugins').length; return n ? { text: `${n} need${n === 1 ? 's' : ''} you`, tone: 'attention' } : pluginsOf(ctx.st).length ? { text: 'Ready', tone: 'ready' } : { text: 'None yet', tone: 'off' }; },
    keywords: ['plugin', 'plugins', 'extension', 'add-on', 'catalog', 'install', 'hook', 'jira', 'gmail', 'calendar'],
    lead: (ctx) => {
      const st = ctx.st; const all = pluginsOf(st); track('plugins', all.map((x) => x.id));
      const main = all.filter(plShown), rest = all.filter((p) => !plShown(p)); const onN = all.filter(plOn).length, offN = all.length - onN;
      const newOn = val(PL.autoNew) === true || val(PL.autoNew) === 'on'; const nd = needsFor(st, 'plugins');
      return [
        { key: 'summary', html: ui.summary({ icon: 'puzzle', tone: nd.length ? 'attention' : 'ready', lines: [
          all.length ? `You have ${ui.b(count(all.length, 'plugin'))}; ${share(onN, all.length, 'on')}${offN && onN ? ` and ${offN} ${offN === 1 ? 'is' : 'are'} switched off` : ''}.` : 'You have no plugins yet. A plugin gives the assistant new tools in one step.',
          `A new plugin ${ui.word(newOn ? 'is switched on as soon as it is installed' : 'arrives switched off', { go: 'code/plugins', reveal: PL.autoNew })}, and before an update Puppet Master ${ui.word(REVIEW_WORDS[reviewOf(st)] || 'asks you', { go: 'code/plugins', anchor: 'new' })}.`
        ] }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'tools', fixed: true, sig: JSON.stringify([val(PL.show), all.length > 0]), html: all.length ? `<div class="smx-cd-toolbar">${bound('select', PL.show, { prefix: 'Show', width: 150 })}</div>` : '' },
        { key: 'list', html: covered(['extensions.plugins.packages', 'extensions.plugins.plugin-on-off', 'extensions.plugins.add-from-catalog', 'extensions.plugins.add-local'], ui.things({ title: 'Your plugins', help: 'Each one says whether it is on. Open one to see what it adds and what it may reach.', add: { label: 'Add a plugin', action: 'pm51-plugins-add' }, items: main.map(plThing), empty: all.length ? { icon: 'puzzle', title: 'Every plugin is switched off', text: 'They are listed below.' } : { icon: 'puzzle', title: 'No plugins yet', text: 'Add one from the catalog, or from a folder on this computer.', fix: { label: 'Add a plugin', action: 'pm51-plugins-add' } } })) },
        { key: 'off', html: rest.length ? fold('code/plugins:off', `${count(rest.length, 'plugin')} switched off`, 'Left out of the list above by “Show”. Still installed.', ui.things({ items: rest.map(plThing) })) : '' },
        { key: 'github', html: githubs(st).pl ? githubLine(st, '') : '' }
      ];
    },
    sections: [
      { key: 'new', html: (ctx) => covered([PL.autoNew], ui.card({ title: 'New plugins and updates', help: 'A new plugin or an update can bring new tools, so you decide when they start.', body: ui.settings([PL.autoNew]) + ui.rows([{ label: 'Before updating a plugin', help: 'An update can ask to reach more than before. Seeing it first keeps you in control.', control: select(reviewOf(ctx.st), ['Always ask me', 'Ask only when permissions change', 'Update automatically'], { action: 'pm51-plugins-review', label: 'Before updating a plugin' }) }]) })) },
      S('plugins-limits', { title: 'Limits and safety' })
    ],
    more: [{ key: 'checked', count: 0, html: () => ui.card({ title: 'How plugins are checked', help: 'Before a plugin is installed, and before every update.', side: ui.btn({ label: 'Check every plugin', icon: 'test', action: 'pm51-plugins-diagnostics' }), body: facts([['Who signed it', 'Checked before it is installed and before every update'], ['Who published it', 'Shown to you before you install'], ['Known problems', 'Looked up before it is installed and before every update'], ['The version before', 'Kept, so that an update can be undone']]) }) }],
    moreLabel: 'How plugins are checked', moreHelp: 'Signature, publisher, known problems and going back',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How plugins work', action: 'pm51-plugins-help' }, { label: 'Put the example plugins back', action: 'pm51-plugins-reset' }]) }],
    covers: { 'extensions.plugins.packages': 'The list “Your plugins” on this page; each plugin opens on its own page.', 'extensions.plugins.plugin-on-off': 'The switch on each plugin’s row and on its own page.', [PL.show]: '“Show”, above the list.', 'extensions.plugins.add-from-catalog': 'The button “Add a plugin”: its first step is the catalog.', 'extensions.plugins.add-local': 'The button “Add a plugin”: its first step offers “From a folder”.', 'extensions.plugins.remove': '“Remove this plugin” on each plugin’s own page.', [PL.autoNew]: 'The first row of “New plugins and updates” on this page.' },
    changes: [
      { was: 'Two of the four plugins cannot be seen: the list starts on “Show: Active only” and says “2 hidden by Show”. Those two (Calendar Connector, Gmail Connector) are installed and switched off, so in “Add plugin” their tiles read “Already on your list”, are disabled, and answer “Calendar Connector is already installed.” A newcomer can neither find them nor add them. (Checked on PMConcept7.)', now: 'Every plugin you have is on the page. The ones “Show” leaves out are folded under the list as “2 plugins switched off”, each with the word “Off” and its switch, so the plugin the catalog says you have is one click away.' },
      { was: 'A plugin opens in a side panel: What it adds, Use it, Permissions, Settings, Updates, Remove, Technical details, with “Check plugin” as the panel’s main button.', now: 'A plugin has a page of its own: one sentence that says whether it is on, the switch beside it, what it adds, what it may reach, its own settings, and “Remove this plugin” last.' },
      { was: 'The time limit is shown twice: as the row “Time limit for each plugin step” (5000 ms) and again as the text “Time limit: 5 seconds for each step, set under Limits and safety” in “How plugins are checked”.', now: 'Once, as the row. Its help line says that 5000 ms is 5 seconds.' },
      { was: '“Hook” is used without a word of explanation (“Adds 1 hook”).', now: 'A hook is “an automatic step”: the plugin’s page says it is a step the plugin runs by itself at set moments, and gives the technical name once.' }
    ]
  });

  /* ---- one plugin ------------------------------------------------------------------------------------------------- */
  const pluginOf = (ctx) => pluginsOf(ctx.st).find((p) => p.id === (ctx.params || {}).id) || null;
  const cap1 = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  SMX.page({
    id: 'code/plugins/:id', chapter: 'code', cls: 'smx-cd', parent: 'code/plugins',
    title: (ctx) => { const p = pluginOf(ctx); return p ? p.name : 'Plugin'; },
    nav: (ctx) => { const p = pluginOf(ctx); return p ? p.name : 'Plugin'; },
    purpose: (ctx) => { const p = pluginOf(ctx); return p ? `A plugin: a bundle that ${plAdds(p) ? `adds ${plAdds(p)}` : 'adds no tools yet'}.` : ''; },
    legacy: [['code', 'plugins']],
    headSide: (ctx) => { const p = pluginOf(ctx); return p ? ui.btn({ label: 'Check this plugin', icon: 'test', action: 'pm51-plugins-check', data: { id: p.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, p = pluginOf(ctx);
      if (!stillThere(ctx, p, 'code/plugins')) return gone('plugin', 'code/plugins', 'Back to Plugins');
      const tone = plStatus(p)[1]; const inst = plInstalled(p); const cfg = Object.entries(p.config || {}).filter(([, v]) => v != null && v !== '');
      const isGithub = githubs(st).pl && githubs(st).pl.id === p.id;
      return [
        { key: 'summary', html: ui.summary({ icon: 'puzzle', tone, lines: [
          `${ui.b(p.name)} ${!inst ? 'is on your list but not installed yet.' : p.locked ? 'is always on. It came with Puppet Master, so it cannot be switched off or removed.' : !p.enabled ? 'is switched off. It stays installed, and its tools are kept away from the assistant.' : p.problem ? 'is on, but has stopped working.' : 'is on. Its tools are there for the assistant to use.'}`,
          `${h(plSource(p))}.`
        ], side: p.locked ? '' : !inst ? ui.btn({ label: 'Install it', icon: 'download', primary: true, small: false, action: 'pm51-plugins-install', data: { id: p.id } }) : switchLine('Use this plugin', toggle(!!p.enabled, { action: 'pm51-plugins-toggle', data: { id: p.id }, label: `${p.name} on or off` })) }) },
        { key: 'needs', html: ui.needs(own(needsFor(st, 'plugins', p.id))) },
        { key: 'github', html: isGithub ? githubLine(st, 'plugin') : '' },
        { key: 'adds', html: ui.card({ title: 'What it adds', body: ui.rows([
          { label: 'Tools', help: 'Things the assistant can do with this plugin.', value: p.tools ? `${p.tools} the assistant can use` : 'None' },
          { label: 'Automatic steps', help: 'Steps the plugin runs by itself at set moments, such as before a change is saved. The technical name is a hook.', value: p.hooks ? `${p.hooks} that ${p.hooks === 1 ? 'runs' : 'run'} by ${p.hooks === 1 ? 'itself' : 'themselves'}` : 'None' }
        ]) }) },
        { key: 'may', html: ui.card({ title: 'What it may reach', help: 'It never gets more than this. An update that asks for more is shown to you first.', body: ((p.permissions || []).length ? ui.rows(p.permissions.map((x) => ({ label: x, status: ui.status('Allowed', 'ready') }))) : quiet('Nothing beyond its own folder.')) + `<p class="smx-quiet-line smx-pad">What the assistant may do with any tool without asking is under ${ui.link({ label: 'Safety & permissions › When it asks you', go: 'safety/asking' })}.</p>` }) },
        { key: 'own', html: inst && !p.locked ? ui.card({ title: 'Its own settings', help: 'A plugin can have a sign-in, keys or choices of its own. Keys are kept in the keychain and never shown.', side: ui.btn({ label: 'See its settings', icon: 'sliders', action: 'pm51-plugins-configure', data: { id: p.id } }), body: cfg.length ? facts(cfg.map(([k, v]) => [cap1(k), v === '(saved)' ? 'Saved in the keychain' : String(v)])) : quiet('Nothing has been set for it.') }) : '' },
        { key: 'updates', html: ui.card({ title: 'Updates', body: ui.rows([{ label: p.locked ? 'Updated together with Puppet Master' : inst ? 'Up to date' : 'Not installed', help: p.locked ? 'Nothing to do here.' : inst ? `You have version ${p.version}.` : '', control: p.locked || !inst ? '' : ui.btn({ label: 'Check for updates', icon: 'refresh', action: 'pm51-plugins-update', data: { id: p.id } }) }]) + `<p class="smx-quiet-line smx-pad">Whether an update asks you first is set for every plugin under ${ui.link({ label: 'Plugins › New plugins and updates', go: 'code/plugins', anchor: 'new' })}.</p>` }) },
        { key: 'actions', html: btnRow(ui.btn({ label: 'Remove this plugin…', icon: 'trash', danger: true, action: 'pm51-plugins-remove', data: { id: p.id }, disabled: !!p.locked, reason: 'It came with Puppet Master, so it cannot be removed.' })) }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => !!pluginOf(ctx), html: (ctx) => { const p = pluginOf(ctx); if (!p) return ''; return ui.card({ title: 'Technical details', body: facts([['Its description file', p.source === 'Local folder' ? 'plugin.json in the plugin’s folder' : 'plugin.json from the package'], p.folder ? ['Its folder', p.folder] : null, ['Identity', `${p.id} · ${p.version === 'Bundled' ? 'bundled build' : 'version ' + p.version}`], ['How it is kept apart', 'It runs in its own process, with only what it may reach above'], ['Records', 'The install receipt and the last check are kept in the plugin log']]) }); } }],
    changes: [
      { was: 'In a plugin’s panel the on/off switch is the second group, “Check plugin” is the panel’s main button, and “Remove plugin” is greyed out for the GitHub plugin.', now: 'The sentence at the top says whether the plugin is on, the switch is beside it, “Check this plugin” is beside the title, and “Remove this plugin” is the last button. The GitHub plugin says it is always on, and why.' },
      { was: 'The GitHub plugin’s panel does not mention that an MCP server and a Toolchain tool are also called GitHub.', now: 'One line on its page says what each of the three GitHubs is and links to the other two.' }
    ]
  });

  /* ================================================================== Tool connections (MCP) */
  const CN = { importing: 'system.mcp.import-external', debug: 'system.mcp.debug-surface' };
  /* the opening sentence of Tool connections, for every mix of working, not working and switched off */
  const cnLine = (n, ok, bad, off) => {
    if (n === 1) return `${ui.b('Your one connection')} ${ok ? 'is working' : bad ? 'is not working' : 'is switched off'}`;
    if (ok === n) return `${ui.b(`${n === 2 ? 'Both' : `All ${n}`} of your connections`)} are working`;
    if (off === n) return `${ui.b(`${n === 2 ? 'Both' : `All ${n}`} of your connections`)} are switched off`;
    if (ok === 0) return `${ui.b(`None of your ${n} connections`)} is working: ${[bad ? `${bad} ${bad === 1 ? 'has' : 'have'} a problem` : '', off ? `${off} ${off === 1 ? 'is' : 'are'} switched off` : ''].filter(Boolean).join(' and ')}`;
    return `${ui.b(`${ok} of your ${n} connections`)} ${ok === 1 ? 'is' : 'are'} working${bad ? `; ${bad} ${bad === 1 ? 'is' : 'are'} not` : ''}${off ? `; ${off} ${off === 1 ? 'is' : 'are'} switched off` : ''}`;
  };
  SMX.extend('code/connections', {
    cls: 'smx-cd',
    purpose: 'A connection is a live link to another app or service, such as GitHub or Linear. While it works, the assistant can read and change things there. The technical name is an MCP server.',
    blurb: (ctx) => { const l = connsOf(ctx.st); return l.length ? `${count(l.length, 'connection')} · ${l.filter((m) => cnOn(m) && m.state === 'Working').length} working` : 'Live links to other apps and services'; },
    status: (ctx) => { const n = needsFor(ctx.st, 'connections').length; return n ? { text: `${n} not working`, tone: 'blocked' } : connsOf(ctx.st).length ? { text: 'Working', tone: 'ready' } : { text: 'None yet', tone: 'off' }; },
    keywords: ['mcp', 'mcp server', 'connection', 'connector', 'tools', 'github', 'linear', 'notion', 'sentry', 'figma', 'postgres', 'database', 'claude desktop', 'cursor', 'vs code'],
    lead: (ctx) => {
      const st = ctx.st; const all = connsOf(st); track('conns', all.map((x) => x.id));
      const ok = all.filter((m) => cnOn(m) && m.state === 'Working').length, off = all.filter((m) => !cnOn(m)).length, bad = all.length - ok - off; const nd = needsFor(st, 'connections');
      return [
        { key: 'summary', html: ui.summary({ icon: 'plug', tone: bad ? 'attention' : 'ready', lines: [
          all.length ? `${cnLine(all.length, ok, bad, off)}.` : 'You have no connections yet. A connection lets the assistant work with another app, such as GitHub or Linear.',
          'Each connection brings its own tools. You choose which of them the assistant may use, and how careful it must be.'
        ] }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'list', html: covered(['system.mcp.server-list', 'system.mcp.server-enabled'], ui.things({ title: 'Your connections', help: 'Each one says whether it is working. Open one to choose its tools and how it connects.', add: { label: 'Add a connection', action: 'pm51-mcp-add' }, items: all.map((m) => cnThing(st, m)), empty: { icon: 'plug', title: 'No connections yet', text: 'Add one, or bring over the ones another app on this computer already has.', fix: { label: 'Add a connection', action: 'pm51-mcp-add' } } })) },
        { key: 'github', html: githubs(st).cn ? githubLine(st, '') : '' }
      ];
    },
    sections: [
      { key: 'others', html: () => covered([CN.importing], ui.card({ title: 'Connections other apps already have', help: 'Claude Desktop, Cursor and VS Code keep lists of their own. Puppet Master can bring those over, so that you do not set them up twice.', side: ui.btn({ label: 'Look for them', icon: 'search', action: 'pm51-mcp-import' }), body: ui.settings([CN.importing]) })) },
      S('mcp-defaults', { title: 'For every connection', help: 'How each one connects, unless it says otherwise.' })
    ],
    more: [S('mcp-more', { title: 'Tool lists and secrets', help: 'How often tool lists are refreshed, and adding secrets only at the moment of a request.' })],
    expert: [{ key: 'final', count: 0, html: (ctx) => covered([CN.debug], ui.card({ title: 'What each connection ended up with', help: 'The program or the address behind each one, after every setting is applied.', side: ui.btn({ label: 'See every log', icon: 'terminal', action: 'pm51-mcp-logs' }), body: connsOf(ctx.st).length ? facts(connsOf(ctx.st).map((m) => [m.name, `${cnWeb(m) ? 'Address' : 'Starts with'}: ${cnLaunch(ctx.st, m)}`])) : quiet('Nothing to show until there is a connection.') })) }],
    expertLabel: 'For experts', expertHelp: 'What each connection really runs, and every log',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Check every connection', action: 'pm51-mcp-diagnostics' }, { label: 'How connections work', action: 'pm51-mcp-help' }, { label: 'Put the example connections back', action: 'pm51-mcp-reset' }]) }],
    covers: { 'system.mcp.server-list': 'The list “Your connections” on this page; each one opens on its own page.', 'system.mcp.server-enabled': 'The switch on each connection’s row and on its own page.', 'system.mcp.tool-toggle': 'The switches under “Its tools” on each connection’s own page.', 'system.mcp.health-status': '“See its logs” on each connection’s own page, and “See every log” under For experts.', 'system.mcp.sign-out': '“Sign out” on the page of a connection to a web service.', 'system.mcp.transport': '“How it connects” on each connection’s own page.', 'system.mcp.server-scope': '“Where it can be used” on each connection’s own page.', 'system.mcp.launch-config': '“Change how it connects” on each connection’s own page.', 'system.mcp.remote-url': '“Change how it connects” on the page of a connection to a web service.', 'system.mcp.remote-headers': '“Change how it connects” on the page of a connection to a web service.', 'system.mcp.oauth-refresh': '“Sign in again” on the page of a connection to a web service.', [CN.importing]: 'The card “Connections other apps already have” on this page.', [CN.debug]: 'The card “What each connection ended up with”, under For experts.' },
    changes: [
      { was: 'The page is called “MCP Servers” and every row says “server”, the word Settings also uses for a computer (“Server & Project Location”) and for a language server. Its opening line, “Connect outside tools and services the assistant can call”, reads like the Plugins page’s.', now: 'A thing here is a “connection”: a live link to another app or service. “MCP” is beside the name in the navigation and in the first sentence, once. Five rows that said “server” say “connection”. PMConcept7’s own guided steps still say “MCP server”.' },
      { was: 'Each row of the list has a button whose word changes with the state (Configure, Reconnect, Turn on), and a connection can only be switched off inside its side panel.', now: 'Each row says “Working”, “Off” or what is wrong, in words, with its switch beside it. A connection that is not working is listed under “Needs you” with the button that deals with it (“Sign in again”).' },
      { was: 'A connection opens in a side panel; “Remove server” and “View logs” are under a fold named “Advanced”, next to a copy of the waiting time (“Time limit: 30 seconds (Connection defaults)”).', now: 'A connection has a page of its own. Its logs and “Remove this connection” are ordinary buttons, Remove last. The waiting time is shown once, on this page, as the row for every connection.' },
      { was: '“Servers from other apps” is a second section with one button and one choice.', now: 'The same button and choice, as “Connections other apps already have”, with a line that says why you would want it.' }
    ]
  });

  /* ---- one connection --------------------------------------------------------------------------------------------- */
  const connOf = (ctx) => connsOf(ctx.st).find((m) => m.id === (ctx.params || {}).id) || null;
  const CN_MAY_HELP = { 'Ask for writes': 'It reads freely, and checks with you before it changes anything there.', 'Protected files only': 'It may change things, but never the files you protected.', 'Read only': 'It can look, and never changes anything there.' };
  SMX.page({
    id: 'code/connections/:id', chapter: 'code', cls: 'smx-cd', parent: 'code/connections',
    title: (ctx) => { const m = connOf(ctx); return m ? m.name : 'Connection'; },
    nav: (ctx) => { const m = connOf(ctx); return m ? m.name : 'Connection'; },
    purpose: (ctx) => { const m = connOf(ctx); return m ? `A connection: ${lower(String(m.description || 'a live link to another app or service').replace(/\.$/, ''))}.` : ''; },
    legacy: [['code', 'mcp']],
    headSide: (ctx) => { const m = connOf(ctx); return m ? ui.btn({ label: 'Check the connection', icon: 'test', action: 'pm51-mcp-check', data: { id: m.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, m = connOf(ctx);
      if (!stillThere(ctx, m, 'code/connections')) return gone('connection', 'code/connections', 'Back to Tool connections');
      const tone = cnStatus(m)[1]; const web = cnWeb(m); const tools = m.toolList || []; const off = new Set(m.disabledTools || []); const data = { id: m.id };
      const isGithub = githubs(st).cn && githubs(st).cn.id === m.id;
      return [
        { key: 'summary', html: ui.summary({ icon: web ? 'globe' : 'terminal', tone, lines: [
          `${ui.b(m.name)} ${!cnOn(m) ? 'is switched off. It stays on your list, and the assistant does not use it.' : m.state === 'Working' ? 'is working.' : `is not working: ${h(lower(String(m.state || 'no answer').replace(/\.$/, '')))}.`}`,
          `${web ? 'It connects to a service on the web' : 'It runs a small program on this computer'}. ${h(cnScope(m))}.`
        ], side: switchLine('Use this connection', toggle(cnOn(m), { action: 'pm51-mcp-toggle', data, label: `${m.name} on or off` })) }) },
        { key: 'needs', html: ui.needs(own(needsFor(st, 'connections', m.id))) },
        { key: 'github', html: isGithub ? githubLine(st, 'conn') : '' },
        { key: 'connects', html: ui.card({ title: 'How it connects', side: ui.btn({ label: 'Change how it connects', icon: 'edit', action: 'pm51-mcp-edit', data }), body: ui.rows([
          { label: 'Kind', value: web ? 'A service on the web, at an address' : 'A program Puppet Master starts on this computer' },
          { label: 'Where it can be used', value: cnScope(m) },
          web ? { label: 'Sign-in', help: 'Sign in again when the service says it needs it. Signing out forgets the saved sign-in and keeps the connection.', control: (cnOn(m) && m.state !== 'Working' ? '' : ui.btn({ label: 'Sign in again', icon: 'refresh', action: 'pm51-mcp-signin', data })) + ui.btn({ label: 'Sign out', icon: 'lock', action: 'pm51-mcp-signout', data }) } : null
        ]) }) },
        { key: 'may', html: ui.card({ title: 'How careful the assistant is with it', help: 'An exception to your own rules, for this one connection.', body: ui.rows([{ label: 'What it may do', help: CN_MAY_HELP[cnMay(m)], control: select(cnMay(m), CN_MAY.map(([value, label]) => ({ value, label })), { action: 'pm51-mcp-permissions', data, label: `What ${m.name} may do` }) + ui.btn({ label: 'Your own rules', go: 'safety/asking', ghost: true }) }]) }) },
        { key: 'tools', html: ui.card({ title: 'Its tools', help: tools.length ? `${m.tools || tools.length} in total. Turn one off to keep the assistant from using it.` : '', body: tools.length ? ui.rows(tools.map((t) => ({ label: toolLabel(t), control: toggle(!off.has(t), { action: 'pm51-mcp-tool', data: { id: m.id, tool: t }, label: toolLabel(t) }) }))) + ((m.tools || 0) > tools.length ? `<p class="smx-quiet-line smx-pad">${(m.tools || 0) - tools.length} more are listed once it has connected.</p>` : '') : quiet(m.tools ? `${m.tools} tools. They are listed once it has connected.` : 'No tools yet. They appear once it connects.') }) },
        { key: 'actions', html: btnRow(ui.btn({ label: 'See its logs', icon: 'terminal', action: 'pm51-mcp-logs', data }), ui.btn({ label: 'Remove this connection…', icon: 'trash', danger: true, action: 'pm51-mcp-remove', data })) }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => !!connOf(ctx), html: (ctx) => { const m = connOf(ctx); if (!m) return ''; const e = cnEngine(ctx.st, m.id) || {}; const web = cnWeb(m); const extra = (web ? e.headers : e.env) || []; return ui.card({ title: 'Technical details', body: facts([[web ? 'Address' : 'Starts with', cnLaunch(ctx.st, m)], [web ? 'Sent with each request' : 'Extra values it is given', extra.length ? extra.join(' · ') : 'None'], ['Sign-in', web ? 'Through your browser, when the service asks' : 'Not needed'], ['Waiting time', 'The same for every connection; set on the Tool connections page'], ['Its id', m.id]]) }); } }],
    changes: [
      { was: 'A server’s panel starts with “How it connects” and puts the on/off switch in the second group. “What it may do” reads “Ask for writes”, “Protected files only” or “Read only”.', now: 'One sentence says whether the connection works, with the switch beside it. The three choices say what happens (“Ask me before anything changes”), are worded as an exception to your own rules, and link to Safety & permissions.' },
      { was: '“View logs” and “Remove server” are under “Advanced”, and “Check connection” is the panel’s main button.', now: '“Check the connection” is beside the title; “See its logs” and “Remove this connection” are buttons at the foot, Remove last.' }
    ]
  });

  /* ================================================================== Tools the assistant uses (PMConcept7: Toolchain › Agent Tools) */
  const TOOL_MAY = [['Ask for sensitive actions', 'Ask me before anything sensitive'], ['Ask for writes', 'Ask me before anything changes'], ['Protected files only', 'Change things, except protected files'], ['Always ask', 'Ask me every time'], ['Never ask', 'Never ask me']];
  const toolMay = (t) => (t.permission === 'FileSafe' ? 'Protected files only' : (t.permission || 'Always ask'));
  const toolFrom = (st, t) => {
    if (/plugin$/i.test(t.owner || '')) { const p = pluginsOf(st).find((x) => `${x.name} plugin`.toLowerCase() === String(t.owner).toLowerCase()); return { text: `The tools the ${t.owner} brings`, label: 'Open the plugin', go: p ? R.plugin(p.id) : 'code/plugins' }; }
    const m = connsOf(st).find((x) => x.name === t.owner); if (m) return { text: `The tools the connection “${m.name}” brings`, label: 'Open the connection', go: R.conn(m.id) };
    return { text: /puppet master/i.test(t.owner || '') ? 'Built into Puppet Master' : `Provided by ${t.owner || 'Puppet Master'}`, label: /browser/i.test(t.name) ? 'The browser’s settings' : '', go: /browser/i.test(t.name) ? 'code/browser' : '' };
  };
  SMX.extend('code/agent-tools', {
    cls: 'smx-cd',
    title: 'Tools the assistant uses', nav: 'Tools the assistant uses',
    purpose: 'The sets of tools the assistant can reach for in this project: where each comes from, whether it is on, which is tried first, and how careful the assistant must be with it.',
    blurb: (ctx) => toolsOf(ctx.st).map((t) => t.name).join(' · ') || 'Sets of tools the assistant can reach for in this project',
    status: (ctx) => { const l = toolsOf(ctx.st), n = l.filter(tOn).length; return !l.length ? { text: 'None yet', tone: 'off' } : { text: n === l.length ? 'All on' : n ? `${n} of ${l.length} on` : 'All off', tone: n ? 'ready' : 'off' }; },
    keywords: ['agent tools', 'browser tool', 'github tools', 'filesystem', 'tool order', 'built-in tools', 'which tool first'],
    lead: (ctx) => {
      const st = ctx.st; const list = toolsOf(st); const onN = list.filter(tOn).length;
      const builtN = list.filter((t) => /puppet master/i.test(t.owner || '')).length, lent = list.length - builtN; const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
      const fromLine = builtN && lent ? `${NUM[builtN] || builtN} ${builtN === 1 ? 'is' : 'are'} built into Puppet Master; the ${lent === 1 ? 'other comes' : 'others come'} from a plugin or a connection, and ${lent === 1 ? 'is' : 'are'} set up there.`
        : builtN ? `${builtN === 1 ? 'It is' : 'They are'} built into Puppet Master.` : `${lent === 1 ? 'It comes' : 'They come'} from a plugin or a connection, and ${lent === 1 ? 'is' : 'are'} set up there.`;
      const reach = list.length === 1 ? 'one set of tools' : onN === list.length ? `${list.length === 2 ? 'both' : `all ${list.length}`} sets of tools` : onN === 0 ? `none of the ${list.length} sets of tools` : `${onN} of the ${list.length} sets of tools`;
      const row = (t, i) => {
        const from = toolFrom(st, t); const next = list[i + 1];
        return `<div class="smx-thing smx-route"><span class="smx-route-n">${i + 1}</span><span class="smx-thing-avatar">${SMX.icon(/browser/i.test(t.name) ? 'browser' : /plugin$/i.test(t.owner || '') ? 'puzzle' : from.go.indexOf('code/connections') === 0 ? 'plug' : 'sliders')}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(t.name)}</span><span class="smx-thing-sub">${h(from.text)}</span></span><span class="smx-thing-end">${ui.status(tOn(t) ? 'On' : 'Off', tOn(t) ? 'ready' : 'off')}${from.go ? ui.btn({ label: from.label, go: from.go, ghost: true }) : ''}${list.length > 1 ? `<span class="smx-order">${ui.btn({ icon: 'up', label2: `Try ${t.name} earlier`, action: 'pm51-toolchain-tool-up', data: { id: t.id }, ghost: true, disabled: i === 0, reason: 'It is already first.' })}${ui.btn({ icon: 'down', label2: `Try ${t.name} later`, action: 'pm51-toolchain-tool-up', data: { id: next ? next.id : '' }, ghost: true, disabled: !next, reason: 'It is already last.' })}</span>` : ''}${toggle(tOn(t), { action: 'pm51-toolchain-tool-on', data: { id: t.id }, label: `Let the assistant use ${t.name} in this project` })}</span></div>`;
      };
      return [
        { key: 'summary', html: ui.summary({ icon: 'sliders', tone: 'ready', lines: [
          !list.length ? 'No sets of tools are listed for this project yet.' : list.length === 1 && !onN ? `The one set of tools in this project is ${ui.b('switched off')}.` : `The assistant can reach for ${ui.b(reach)} in this project.`,
          list.length ? `${fromLine} This page decides whether this project uses ${list.length === 1 ? 'it, and' : 'each one, in which order, and'} with how much care.` : 'A set appears here when a plugin or a connection brings one.'
        ] }) },
        { key: 'list', html: ui.card({ title: list.length === 1 ? 'The set of tools in this project' : 'In the order they are tried', help: list.length > 1 ? 'When two sets can do the same job, the assistant tries the higher one first. Switch one off to keep it out of this project.' : list.length ? 'Switch it off to keep it out of this project.' : '', body: list.length ? `<div class="smx-things">${list.map(row).join('')}</div>` : quiet(`Nothing to put in order yet. ${ui.link({ label: 'Add a plugin', go: 'code/plugins' })} or ${ui.link({ label: 'add a connection', go: 'code/connections' })} to give the assistant more tools.`) }) },
        { key: 'care', html: !list.length ? '' : ui.card({ title: list.length === 1 ? 'How careful the assistant is with it' : 'How careful the assistant is with each', help: 'An exception to your own rules, for one set of tools. “Ask” means the assistant stops and checks with you.', side: ui.btn({ label: 'Your own rules', go: 'safety/rules', ghost: true }), body: ui.rows(list.map((t) => ({ label: t.name, control: select(toolMay(t), TOOL_MAY.map(([value, label]) => ({ value, label })), { action: 'pm51-toolchain-tool-permission', data: { id: t.id }, label: `How careful with ${t.name}` }) }))) }) },
        { key: 'github', html: githubs(st).tool ? githubLine(st, 'tool') : '' }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => toolsOf(ctx.st).length > 0, html: (ctx) => { const list = toolsOf(ctx.st); let plain = (s) => String(s || ''); try { plain = kit().plain; } catch (e) { /* the stored word then */ } return ui.card({ title: 'Technical details', side: ui.btn({ label: 'Run a check', icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'agentTools' } }), body: facts(list.map((t) => [t.name, `Provided by ${t.owner} · ${plain(t.status)}`])) }); } }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How language tools and tool sets work', action: 'pm51-toolchain-help' }, { label: 'Put the example tools back', action: 'pm51-toolchain-reset' }]) }],
    changes: [
      { was: 'The tab is “Agent Tools”, inside Toolchain, and lists “Built-in Browser”, “GitHub Tools” and “Filesystem Tools”. Two of the three are not built in: one comes from the GitHub plugin and one from the Filesystem MCP server, each behind a button that only says “Open”.', now: 'The page is “Tools the assistant uses”. Each row says where its tools come from in words, and its button names where it leads: “Open the plugin”, “Open the connection”, “The browser’s settings”.' },
      { was: 'The order and the permission of each tool are under “More options”; the order has only a “Move up” button.', now: 'The order is the list itself, numbered, with “Try earlier” and “Try later” on each row; a disabled arrow says why. “How careful the assistant is with each” is its own card, worded as an exception to your own rules, with a link to Safety & permissions › Rules for each action.' },
      { was: 'The five permission choices read “Ask for sensitive actions”, “Ask for writes”, “Protected files only”, “Always ask”, “Never ask”.', now: 'The same five, as what happens: “Ask me before anything changes”, “Change things, except protected files”, and so on.' }
    ]
  });

  /* ================================================================== Keyboard shortcuts */
  const keyRow = (st, all, x) => {
    const others = clashesOf(all, x); const cmd = x.command ? cmdsOf(st).find((c) => c.id === x.command) : null;
    return { label: x.name, status: others.length ? ui.status('Shares its keys', 'attention') : '', help: others.length ? `The same keys as ${and(others.map((o) => `“${o.name}”${o.group === x.group ? '' : KEY_GROUPS[o.group][1]}`))}. Only one of them can work.` : cmd ? `Runs your command ${cmd.name}${cmd.description ? ': ' + lower(cmd.description) : ''}` : (x.help || ''),
      control: keyButton(x) + (x.command ? ui.btn({ icon: 'trash', label2: `Take the keys away from ${x.name}`, action: 'pm51-commands-shortcut-remove', data: { id: x.id }, ghost: true }) : '') };
  };
  const shortcutsPage = SMX.extend('code/shortcuts', {
    cls: 'smx-cd',
    purpose: 'Keys you press together to do something at once, such as Ctrl+N for a new chat. Click the keys on a row to change them.',
    blurb: (ctx) => { const set = allKeys(ctx.st).filter((x) => x.keys); const places = [['app', 'everywhere'], ['box', 'while you type a message'], ['term', 'in the terminal']].filter((p) => set.some((x) => x.group === p[0])).map((p) => p[1]); return set.length ? `${count(set.length, 'shortcut')}: ${and(places)}` : 'No shortcut has keys yet'; },
    status: (ctx) => { const p = clashPairs(ctx.st).length; return p ? { text: `${count(p, 'pair')} share keys`, tone: 'attention' } : { text: 'No keys used twice', tone: 'ready' }; },
    keywords: ['shortcut', 'keybinding', 'hotkey', 'keys', 'cheat sheet', 'keyboard layout', 'rebind', 'ctrl'],
    lead: (ctx) => {
      const st = ctx.st; const all = allKeys(st); const q = String(val(KY.search) || '').trim().toLowerCase();
      const hit = (x) => !q || `${x.name} ${x.keys}`.toLowerCase().includes(q);
      const of = (g) => all.filter((x) => x.group === g); const shown = (g) => of(g).filter(hit);
      const set = all.filter((x) => x.keys); const pairs = clashPairs(st).length;
      const inGroup = (g) => set.filter((x) => x.group === g).length; const works = (k) => (k === 0 ? 'none work' : k === 1 ? '1 works' : `${k} work`);
      const group = (g, o) => ui.card(Object.assign({ title: KEY_GROUPS[g][0], body: shown(g).length ? ui.rows(shown(g).map((x) => keyRow(st, all, x))) : quiet(q ? `Nothing here matches “${h(q)}”.` : 'No keys here yet.') }, o || {}));
      if (q && (shown('box').length || shown('term').length)) SMX.local.openMore['code/shortcuts:others'] = true;
      return [
        { key: 'summary', html: ui.summary({ icon: 'key', tone: pairs ? 'attention' : 'ready', lines: [
          set.length ? `${ui.b(count(set.length, 'shortcut'))}: ${works(inGroup('app'))} everywhere, ${inGroup('box') || 'none'} while you type a message and ${inGroup('term') || 'none'} in the terminal.` : 'No shortcut has keys yet. Click “Set keys” on a row to give it some.',
          !set.length ? '' : pairs ? `${ui.b(count(pairs, 'pair'))} ${pairs === 1 ? 'shares' : 'share'} the same keys, so one of each pair does not work.` : 'No two of them share the same keys.'
        ], side: ui.btn({ label: 'Open the cheat sheet', icon: 'file', action: 'pm51-commands-sheet' }) }) },
        { key: 'needs', html: ui.needs(needsFor(st, 'shortcuts')) },
        { key: 'tools', fixed: true, sig: 'search', html: `<div class="smx-cd-toolbar">${bound('search', KY.search, { placeholder: 'Search shortcuts by name or keys' })}</div>` },
        { key: 'app', html: covered(['extensions.commands.keyboard-shortcuts', KY.variant], group('app', { help: 'These work wherever you are in Puppet Master. Your own commands can have keys too.', side: ui.btn({ label: 'Add a shortcut', icon: 'plus', action: 'pm51-commands-add-shortcut' }) })) },
        { key: 'others', html: covered([KY.text, KY.term], fold('code/shortcuts:others', 'While you type a message, and in the terminal', `${count(of('box').length + of('term').length, 'more shortcut')}`, group('box', { help: 'For moving and deleting while you type.' }) + group('term', { help: 'Only while a terminal has the focus.' }))) }
      ];
    },
    sections: [{ key: 'hints', title: 'Hints, and keys used twice', ids: [KY.hints, KY.clash] }],
    more: [
      { key: 'layout', title: 'Keyboard layout', help: 'Auto-detect follows your computer. Pick one if keys land in the wrong place.', ids: [KY.layout] },
      { key: 'reserved', count: 0, html: () => ui.card({ title: 'Keys you cannot change', help: 'These belong to your computer or to the app itself.', body: facts(RESERVED) }) },
      { key: 'all', count: 0, html: () => covered([KY.reset, KY.backup], ui.card({ title: 'All shortcuts at once', help: 'Put every shortcut back to the keys it came with, or keep them in a file you can load on another computer.', body: btnRow(bound('action', KY.backup, { label: 'Save or load shortcuts', icon: 'download' }), bound('action', KY.reset, { label: 'Reset all shortcuts…', icon: 'restore' })) })) }
    ],
    moreLabel: 'Keyboard layout, keys you cannot change, and all at once', moreHelp: 'Less common choices',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Your commands', go: 'code/commands' }, { label: 'How commands and shortcuts work', action: 'pm51-commands-help' }, { label: 'Put the example commands and shortcuts back', action: 'pm51-commands-reset' }]) }],
    covers: { 'extensions.commands.keyboard-shortcuts': 'The list “Everywhere in Puppet Master” on this page.', [KY.search]: 'The search box above the lists.', [KY.text]: 'The list “While you type a message”, folded under the first list.', [KY.term]: 'The list “In the terminal”, folded under the first list.', [KY.variant]: '“Switch model variant”, the last row of the first list.', [KY.reset]: 'The button “Reset all shortcuts”, under More options.', [KY.backup]: 'The button “Save or load shortcuts”, under More options.' },
    changes: [
      { was: 'The Shortcuts tab is one scroll of 35 rows about 2,470 px tall: 14 that work everywhere, 13 for the message box and 8 for the terminal, all open, under a line that says “4 shortcuts share keys with another”.', now: 'The page opens on how many shortcuts there are and where they work. Each pair that shares keys is listed under “Needs you” with a button that opens the change for one of them. The 14 that work everywhere are the list; the 21 for the message box and the terminal are folded under it, and open by themselves when a search finds something in them.' },
      { was: 'A row that clashes says “Clashes with Copy as context — Only one of them can win. Change one.”', now: 'It says “Shares its keys” and names the other, with where that one works when it is a different place (“while typing a message”).' },
      { was: '“Show shortcut hints”, “When two actions share keys” and the cheat sheet are a section under the list; the keyboard layout, the reserved keys and the two buttons for all shortcuts are under “More options”.', now: 'The cheat sheet is the button beside the opening sentence. The two choices are one short group; the rest is folded, with “Reset all shortcuts” last.' },
      { was: '“Show your commands in the command palette” is drawn on the Commands tab but belongs, in PMConcept7’s own list of settings, to the shortcut keys.', now: 'It is on Your commands, with the commands it is about.' }
    ]
  });
  uncover(shortcutsPage, [KY.hints, KY.clash, KY.layout, KY.palette]);

  /* ================================================================== Your commands */
  const CMD_DEFAULTS = ['extensions.commands.command-scope', 'extensions.commands.command-mode', 'extensions.commands.command-model', 'extensions.commands.command-persona', 'extensions.commands.command-permissions'];
  const CMD_NAMES = ['extensions.commands.override-builtin', 'extensions.commands.git-routing'];
  const cmdThing = (st, c) => {
    const keys = cmdKeys(st, c); const bad = staleOf(st, c).length;
    return { icon: 'bolt', name: c.name, sub: c.description || 'No description yet.', sub2: [CMD_SCOPE[c.scope] || c.scope, ...cmdRuns(st, c), keys ? `keys ${keys}` : 'no keys'].join(' · '), status: !c.enabled ? { text: 'Off', tone: 'off' } : bad ? { text: 'Needs you', tone: 'attention' } : { text: 'On', tone: 'ready' },
      side: toggle(!!c.enabled, { action: 'pm51-commands-toggle', data: { id: c.id }, label: `${c.name} on or off` }), go: R.cmd(c.id) };
  };
  const paletteOn = () => { const v = val(KY.palette); return v !== false && v !== 'off'; };
  const commandsPage = SMX.extend('code/commands', {
    cls: 'smx-cd',
    icon: 'bolt',
    purpose: 'A command is a message you send often, saved under a short name. Type the name in chat, such as /x-release-notes, and Puppet Master sends the text for you.',
    blurb: (ctx) => { const a = cmdsOf(ctx.st).length, b = builtinsOf(ctx.st).length; return [a ? `${count(a, 'command')} of your own` : 'No commands of your own yet', b ? `${b} that ${b === 1 ? 'comes' : 'come'} with Puppet Master` : ''].filter(Boolean).join(' · '); },
    status: (ctx) => { const n = needsFor(ctx.st, 'commands').length; return n ? { text: `${n} need${n === 1 ? 's' : ''} you`, tone: 'attention' } : null; },
    keywords: ['slash command', 'command', 'custom command', 'prompt', 'template', '/goal', 'palette', 'dry run', 'export commands'],
    lead: (ctx) => {
      const st = ctx.st; const all = cmdsOf(st), built = builtinsOf(st); track('cmds', all.map((x) => x.id));
      const offN = all.filter((c) => !c.enabled).length; const nd = needsFor(st, 'commands');
      return [
        { key: 'summary', html: ui.summary({ icon: 'bolt', tone: nd.length ? 'attention' : 'ready', lines: [
          all.length ? `You have ${ui.b(count(all.length, 'command'))} of your own${offN ? `; ${share(offN, all.length, 'switched off')}` : ''}. ${paletteOn() ? `Type a name in chat, pick it from the ${ui.word('command palette', { go: 'code/commands', reveal: KY.palette })}, or press its keys.` : `Type a name in chat, or press its keys. They are ${ui.word('hidden from the command palette', { go: 'code/commands', reveal: KY.palette })}.`}` : 'You have no commands of your own yet. A command saves you from typing the same request again and again.',
          built.length ? `${count(built.length, 'more command')} ${built.length === 1 ? 'comes' : 'come'} with Puppet Master, such as ${h(and(built.slice(0, 2).map((c) => c.command)))}. Your own start with /x-, so the two never clash.` : ''
        ] }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'list', html: covered(['extensions.commands.custom-commands'], ui.things({ title: 'Your commands', help: 'Open one to see what it sends and how it runs.', add: { label: 'New command', action: 'pm51-commands-new' }, items: all.map((c) => cmdThing(st, c)), empty: { icon: 'bolt', title: 'No commands yet', text: 'Make one to send a message you use often with a few keystrokes. You can start from an example.', fix: { label: 'New command', action: 'pm51-commands-new' } } })) },
        { key: 'built', html: built.length ? ui.card({ title: 'Commands that come with Puppet Master', help: 'They cannot be changed, but their keys can.', side: ui.btn({ label: 'Change their keys', go: 'code/shortcuts', ghost: true }), body: ui.rows(built.map((c) => { const s = keysOf(st).find((x) => x.id === c.id); return { label: c.command, help: c.name, control: keyShown(s ? s.keys : c.shortcut) }; })) }) : '' }
      ];
    },
    sections: [{ key: 'running', html: () => covered([KY.palette, KY.confirm], ui.card({ title: 'Running a command', body: ui.settings([KY.confirm, KY.palette]) + `<p class="smx-quiet-line smx-pad">What always needs your OK, whoever asks, is under ${ui.link({ label: 'Safety & permissions › When it asks you', go: 'safety/asking' })}.</p>` })) }],
    more: [
      { key: 'new', title: 'What a new command starts with', help: 'Each command can change these on its own page. Left alone, a command runs exactly like a message you typed yourself.', ids: CMD_DEFAULTS },
      { key: 'files', count: 0, html: () => ui.card({ title: 'Take your commands to another computer', help: 'A small file with your commands in it. It holds names and text, never passwords or keys.', body: btnRow(ui.btn({ label: 'Save commands to a file', icon: 'download', action: 'pm51-commands-export', data: { what: 'commands' } }), ui.btn({ label: 'Load commands from a file', icon: 'upload', action: 'pm51-commands-import', data: { what: 'commands' } })) }) }
    ],
    moreLabel: 'New commands, and moving them', moreHelp: 'What a new command starts with; saving and loading',
    expert: [
      { key: 'names', title: 'Built-in names', help: 'Whether a command of yours may take the name of one that comes with Puppet Master.', ids: CMD_NAMES },
      { key: 'where', count: 0, html: () => ui.card({ title: 'Where command files are kept', help: 'Each command is a small text file. It can be edited by hand too.', body: facts([['For this project', '<project>/.puppet-master/commands/<name>.md'], ['For every project', '~/.config/puppet-master/commands/<name>.md'], ['The same name in both', 'The one kept with the project wins.'], ['Inside the file', 'A short header (the description and what it asks for) and the text it sends.']]) }) }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Keyboard shortcuts', go: 'code/shortcuts' }, { label: 'How commands work', action: 'pm51-commands-help' }, { label: 'Put the example commands and shortcuts back', action: 'pm51-commands-reset' }]) }],
    covers: { 'extensions.commands.custom-commands': 'The list “Your commands” on this page; each command opens on its own page.', [KY.palette]: 'The second row of “Running a command” on this page.' },
    changes: [
      { was: '/x-quick-audit asks for a persona called “Repository Auditor”, and there is no such persona. The list shows “Every project · Repository Auditor” like any other command. Only the dropdown inside its panel says “Repository Auditor (not available)”, and only the dry run says that the chat’s own persona is used instead. (Checked on PMConcept7.)', now: 'The command is marked “Needs you” in the list and named under “Needs you” with a button that puts it right in one press, “Use the chat’s persona”. Its own page offers the same button, and the dropdown to choose another.' },
      { was: 'A command opens in a wide side panel with eight groups, and “Preview (dry run)” is the panel’s main button.', now: 'A command has a page of its own: what it sends, where it is available, who answers and what it may do, its keys, and “Delete this command” last. “Preview what it sends” opens PMConcept7’s own dry run.' },
      { was: 'Under “More options”, “Defaults for new commands” holds “Model”, “Persona” and “Permissions” rows whose help reads as if they changed one command (“Make a specific command always use a particular AI model…”).', now: 'The group is “What a new command starts with”, and each row’s help says what the default means. The same four choices on a command’s own page are worded as exceptions for that command and link to the page that owns each choice (Personas, the everyday model, your permissions).' },
      { was: 'The Commands tab opens on a section called “Safety” that holds one switch, above the list.', now: 'The list comes first. The switch is in “Running a command”, with the command palette switch and a link to the page that owns what needs your OK.' },
      'Words: your own commands start with /x-, so the page’s opening sentence uses /x-release-notes as its example, not /release-notes.'
    ]
  });
  uncover(commandsPage, CMD_DEFAULTS.concat(CMD_NAMES));

  /* ---- one command ------------------------------------------------------------------------------------------------ */
  const cmdOf = (ctx) => cmdsOf(ctx.st).find((c) => c.id === (ctx.params || {}).id) || null;
  const gone2 = (cur, what) => ({ value: cur, label: `${what} (not there any more)`, group: 'Not available' });
  const personaOpts = (st, cur) => {
    const list = st.personas || []; const kind = (p) => (p.locked ? 'Built in' : p.group === 'Bundled' ? 'Specialists' : 'Yours');
    const opts = [{ value: '', label: 'Same as the chat' }];
    for (const g of ['Built in', 'Specialists', 'Yours']) list.filter((p) => kind(p) === g).forEach((p) => opts.push({ value: p.name, label: p.name, group: g }));
    if (cur && !list.some((p) => p.name === cur)) opts.push(gone2(cur, cur));
    return opts;
  };
  const modeOpts = (cur) => [{ value: '', label: 'Same as the chat' }].concat(Object.entries(MODES).map(([value, label]) => ({ value, label, meta: MODE_HELP[value] })), cur && !MODES[cur] ? [gone2(cur, cur)] : []);
  const modelOpts = (st, cur) => {
    const opts = [{ value: '', label: 'Same as the chat' }]; let found = false;
    readyProviders(st).forEach((p) => (p.models || []).filter((m) => m.enabled).forEach((m) => { if (m.id === cur) found = true; opts.push({ value: m.id, label: m.name, group: p.name }); }));
    if (cur && !found) opts.push({ value: cur, label: `${modelName(st, cur)} (not ready now)`, group: 'Not available' });
    return opts;
  };
  const profileOpts = (st, cur) => { const list = st.permissionProfiles || []; return [{ value: '', label: 'My usual permissions' }].concat(list.map((p) => ({ value: p.id, label: p.name })), cur && !list.some((p) => p.id === cur) ? [gone2(cur, cur)] : []); };
  SMX.act('code-cmd-clear', (el) => {
    const id = el.getAttribute('data-id'), key = el.getAttribute('data-key'); let name = '';
    write((st) => { const c = cmdsOf(st).find((x) => x.id === id); if (c && c.overrides) { c.overrides[key] = null; name = c.name; } });
    if (name) SMX.toast('Saved', `${name} now uses the chat’s own.`);
  });
  /* The dry run is the main button of PMConcept7's own command panel and has no action name: open that panel and press it. */
  SMX.act('code-cmd-preview', (el) => {
    const id = el.getAttribute('data-id'); try { eng().dispatchAction('pm51-commands-open', { id }); } catch (e) { return; }
    let n = 0; const press = () => { const b = [...DOC.querySelectorAll('.drawer-wrap .btn.primary')].find((x) => /dry run/i.test(x.textContent || '')); if (b) b.click(); else if (++n < 40) W.setTimeout(press, 50); };
    W.setTimeout(press, 30);
  });
  SMX.page({
    id: 'code/commands/:id', chapter: 'code', cls: 'smx-cd', parent: 'code/commands',
    title: (ctx) => { const c = cmdOf(ctx); return c ? c.name : 'Command'; },
    nav: (ctx) => { const c = cmdOf(ctx); return c ? c.name : 'Command'; },
    purpose: (ctx) => { const c = cmdOf(ctx); return c ? `A command of yours: ${lower(String(c.description || 'a message you send often').replace(/\.$/, ''))}.` : ''; },
    legacy: [['code', 'commands', 'commands', 'commands']],
    headSide: (ctx) => { const c = cmdOf(ctx); return c ? ui.btn({ label: 'Preview what it sends', icon: 'play', do: 'code-cmd-preview', data: { id: c.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, c = cmdOf(ctx);
      if (!stillThere(ctx, c, 'code/commands')) return gone('command', 'code/commands', 'Back to Your commands');
      const sc = keysOf(st).find((x) => x.command === c.id); const keys = sc && sc.keys ? sc.keys : ''; const ov = c.overrides || {}; const data = { id: c.id };
      const ovRow = (key, label, help, opts, link) => ({ label, help, control: select(ov[key] || '', opts, { action: 'pm51-commands-override', data: { id: c.id, key }, label: `${label} for ${c.name}` }) + ui.btn(Object.assign({ ghost: true }, link)) });
      let args = '', desc = ''; try { args = kit().input(c.argumentsHint || '', { action: 'pm51-commands-args', data, placeholder: 'For example: <branch name>', label: 'What to type after the name' }); desc = kit().input(c.description || '', { action: 'pm51-commands-desc', data, placeholder: 'What this command does', label: 'What it is for' }); } catch (e) { args = ''; desc = ''; }
      return [
        { key: 'summary', html: ui.summary({ icon: 'bolt', tone: !c.enabled ? 'off' : staleOf(st, c).length ? 'attention' : 'ready', lines: [
          c.enabled ? (paletteOn() ? `${ui.b(c.name)} is on. Type it in chat${keys ? `, pick it from the command palette, or press ${ui.b(keys)}` : ' or pick it from the command palette'}.` : `${ui.b(c.name)} is on. Type it in chat${keys ? ` or press ${ui.b(keys)}` : ''}. Your commands are ${ui.word('hidden from the command palette', { go: 'code/commands', reveal: KY.palette })}.`) : `${ui.b(c.name)} is switched off. It is hidden from chat and the command palette, and its file stays where it is.`,
          `Available in ${h(lower(CMD_SCOPE[c.scope] || c.scope))}.`
        ], side: switchLine('Use this command', toggle(!!c.enabled, { action: 'pm51-commands-toggle', data, label: `${c.name} on or off` })) }) },
        { key: 'needs', html: ui.needs(own(needsFor(st, 'commands', c.id))) },
        { key: 'sends', fixed: true, sig: c.id, html: ui.card({ title: 'What it sends', help: 'The text the chat receives when you run it. $ARGUMENTS stands for everything typed after the name; $1 and $2 for single words. @path pastes a file, and !`command` pastes what a command prints.', body:
          field('The text', `<textarea class="form-textarea pm51-commands-template" data-action="pm51-commands-template" data-id="${h(c.id)}" rows="7" spellcheck="false" aria-label="What ${h(c.name)} sends">${h(c.template || '')}</textarea>`)
          + field('What to type after the name', args, 'A reminder shown while you type the command.')
          + field('What it is for', desc, 'One line, shown next to the name in chat and in the command palette.') }) },
        { key: 'where', html: ui.card({ title: 'Where it is available', body: ui.rows([{ label: 'Available in', help: 'When both places have a command of the same name, the one kept with the project wins.', control: select(c.scope, [{ value: 'Project', label: 'This project', meta: 'Kept with the project' }, { value: 'Global', label: 'Every project', meta: 'Kept in your own folder' }], { action: 'pm51-commands-field', data: { id: c.id, field: 'scope' }, label: `Where ${c.name} is available` }) }]) }) },
        { key: 'who', html: ui.card({ anchor: 'who', title: 'Who answers, and what it may do', help: 'Left on “Same as the chat”, the command runs exactly like a message you typed yourself. Each choice here is an exception for this one command. It is a request: the chat’s own mode and your permissions still cap it.', body: ui.rows([
          ovRow('persona', 'Persona', 'The character the assistant plays while this command runs.', personaOpts(st, ov.persona), { label: 'Personas', go: 'memory/personas' }),
          ovRow('mode', 'How freely it may act', 'It can be more careful than the chat, never less.', modeOpts(ov.mode), { label: 'When it asks you', go: 'safety/asking' }),
          ovRow('model', 'Model', 'Only models that are ready right now are listed.', modelOpts(st, ov.model), { label: 'The everyday model', go: 'ai/models' }),
          ovRow('permissionsProfile', 'Permissions', 'It cannot have more than your own permissions allow.', profileOpts(st, ov.permissionsProfile), { label: 'Your permissions', go: 'safety' })
        ]) }) },
        { key: 'keys', html: ui.card({ title: 'Its keys', help: 'Keys that run this command from anywhere in Puppet Master.', body: ui.rows([{ label: keys ? 'Runs when you press' : 'No keys yet', control: keyShown(keys) + ui.btn({ label: keys ? 'Change its keys' : 'Give it keys', icon: 'key', action: 'pm51-commands-rebind', data: { command: c.id } }) + (sc ? ui.btn({ label: 'Take its keys away', action: 'pm51-commands-shortcut-remove', data: { id: sc.id }, ghost: true }) : '') }]) }) },
        { key: 'actions', html: btnRow(ui.btn({ label: 'Delete this command…', icon: 'trash', danger: true, action: 'pm51-commands-delete', data })) }
      ];
    },
    expert: [{ key: 'tech', count: 0, when: (ctx) => !!cmdOf(ctx), html: (ctx) => { const c = cmdOf(ctx); if (!c) return ''; return ui.card({ title: 'Technical details', body: facts([['Its file', cmdPath(c)], ['Its id', c.id], ['Made by', c.source === 'user' ? 'You' : String(c.source || 'You')]]) }); } }],
    changes: [
      { was: 'A command’s panel lists “Overrides”: Persona, Mode, Model and “Permissions profile”, each on “Inherit”, with the note “Leave these on Inherit and the command runs exactly like a message you typed yourself.”', now: 'The card is “Who answers, and what it may do”. “Inherit” reads “Same as the chat”, each row is worded as an exception for this command, and each has a link to the page that owns the choice: Personas, When it asks you, the everyday model, your permissions.' },
      { was: 'A choice that names something that no longer exists reads “(not available)” inside the dropdown and nowhere else.', now: 'The page says so at the top, under “Needs you”, with a button that puts the command back on the chat’s own.' },
      { was: '“Preview (dry run)” is the panel’s main button; from the dry run, “Back to command” returns to the panel.', now: '“Preview what it sends” is beside the title and opens the same dry run. Its “Back to command” still opens PMConcept7’s panel, because that button is PMConcept7’s; closing it returns here.' }
    ]
  });

  /* ================================================================== search, and the review strip's list of pages */
  (SMX.thingSources = SMX.thingSources || []).push((st) => [
    ...skillsOf(st).map((s) => ({ title: s.name, sub: 'Code & tools › Skills · a skill', route: R.skill(s.id) })),
    ...pluginsOf(st).map((p) => ({ title: p.name, sub: 'Code & tools › Plugins · a plugin', route: R.plugin(p.id) })),
    ...connsOf(st).map((m) => ({ title: m.name, sub: 'Code & tools › Tool connections · a connection', route: R.conn(m.id) })),
    ...cmdsOf(st).map((c) => ({ title: c.name, sub: 'Code & tools › Your commands · a command', route: R.cmd(c.id) })),
    ...lspsOf(st).map((x) => ({ title: x.name, sub: `Code & tools › Language help · understands ${x.language || 'code'}`, route: R.lsp(x.id) })),
    ...fmtsOf(st).map((x) => ({ title: x.name, sub: 'Code & tools › Language help · tidies code', route: R.fmt(x.id) })),
    ...toolsOf(st).map((t) => ({ title: t.name, sub: 'Code & tools › Tools the assistant uses', route: 'code/agent-tools' }))
  ]);
  (SMX.jumps = SMX.jumps || []).push(
    { group: 'Code & tools', route: 'code/skills/pr-reviewer', title: 'A skill: PR Reviewer' },
    { group: 'Code & tools', route: 'code/plugins/github', title: 'A plugin: GitHub' },
    { group: 'Code & tools', route: 'code/connections/linear-mcp', title: 'A connection: Linear MCP' },
    { group: 'Code & tools', route: 'code/commands/x-quick-audit', title: 'A command: /x-quick-audit' },
    { group: 'Code & tools', route: 'code/languages/understands/pyright', title: 'A language tool: Pyright' }
  );
})(window);
