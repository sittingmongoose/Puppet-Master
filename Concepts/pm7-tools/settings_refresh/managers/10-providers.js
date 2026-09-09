/* Providers & Accounts — one roster of AI services, one honest next step each. */
(function () {
  const ID = 'providers';
  const KEY = 'providers-accounts-models';
  const all = () => state.providers;
  const current = () => all().find(p => p.id === state.selectedProvider) || all()[0];
  const byId = id => all().find(p => p.id === id) || current();
  const routes = () => (state.freeRoutes || []).filter(r => r.id !== 'free-community');
  const routeById = id => routes().find(r => r.id === id) || routes()[0];
  const ROUTE_NAMES = { 'free-openrouter': 'OpenRouter free', 'free-github-models': 'GitHub Models', 'free-cerebras': 'Cerebras', 'free-groq': 'Groq', 'free-hf': 'Hugging Face' };
  const routeName = r => ROUTE_NAMES[r.id] || r.name;
  const HOW = { 'claude-code': 'Command-line tool', 'openai-codex': 'ChatGPT sign-in', antigravity: 'Google sign-in', 'gemini-direct': 'API key', 'cursor-cli': 'Command-line tool', 'github-copilot': 'GitHub sign-in', opencode: 'Server', 'kimi-coding': 'Coding plan', 'minimax-coding': 'Coding plan', 'zai-coding': 'Coding plan', 'qwen-coding': 'Coding plan', 'free-models': 'Free routes', 'local-endpoint': 'Network address' };
  const KIND_HOW = { CLI: 'Command-line tool', Account: 'Sign in', API: 'API key', Server: 'Server', URL: 'Network address', 'Grouped routes': 'Free routes' };
  const how = p => HOW[p.id] || KIND_HOW[p.kind] || p.kind || 'Service';
  const EXHAUSTION = [['Try next eligible account, then fallback route', 'Next account, then fallback'], ['Use fallback route', 'Fallback route'], ['Try the next free route', 'Next free route'], ['Stop and ask me', 'Stop and ask me']];
  const BOUNDARIES = ['Use included plans only', 'Allow metered usage', 'Ask each time'];
  const PLAN_TEXT = { Included: 'Included in your plan', Metered: 'Pay per use', Plan: 'Included in the coding plan', Free: 'Free route', Unknown: 'Plan unknown until sign-in', Unavailable: 'Unavailable' };

  PM51.style(`
    #panel-settings .pm51-providers-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    #panel-settings .pm51-providers-inline { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    #panel-settings #provider-roster .resource-row-meta, #panel-settings #provider-roster .resource-row-name { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
  `);

  /* ---------- derived state ---------------------------------------------- */
  function plain(p) {
    if (p.status === 'disabled') return 'Off';
    if (p.status === 'not-installed') return 'Not installed';
    if (p.status === 'active') return 'Ready';
    if (p.status === 'attention') return p.signedIn ? 'Needs attention' : 'Needs sign-in';
    if (p.status === 'setup') return 'Not set up';
    if (p.status === 'checking') return 'Checking';
    return PM51.plain(p.status);
  }
  const tone = p => PM51.tone(plain(p));
  const enabledModels = p => (p.models || []).filter(m => m.enabled);
  const activeAccounts = p => (p.accounts || []).filter(x => x.active);
  const defaultAccount = p => (p.accounts || []).find(x => x.id === p.defaultAccount) || activeAccounts(p)[0];
  const routeStatus = r => r.status === 'active' ? 'Ready' : r.status === 'attention' ? 'Needs attention' : 'Off';
  const routesOn = () => routes().filter(r => r.enabled).length;
  const planText = m => PLAN_TEXT[m.plan] || m.plan || '';
  const countText = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const example = (title, message) => PM51.toast(title, message || 'Example data only. Nothing was installed, sent, or changed outside this preview.', 'info');

  function statusLabelFor(p) {
    const base = plain(p);
    if (p.id === 'free-models') return `${base} · ${routesOn()} of ${routes().length} routes on`;
    const n = activeAccounts(p).length;
    if (base === 'Ready' && n) return `${base} · ${countText(n, 'account')}`;
    if (base === 'Needs attention' && p.id === 'github-copilot') return `${base} · no active seat`;
    return base;
  }
  function syncFree() {
    const p = all().find(x => x.id === 'free-models'); if (!p) return;
    p.statusLabel = statusLabelFor(p);
  }
  function recompute(p) {
    if (p.id === 'free-models') { syncFree(); return; }
    const r = p.readiness || (p.readiness = { installed: !!p.installed, signedIn: !!p.signedIn, accountChosen: false, modelsReady: false });
    const active = activeAccounts(p);
    p.signedIn = active.length > 0;
    r.signedIn = p.signedIn;
    if (p.signedIn && !active.some(x => x.id === p.defaultAccount)) { p.defaultAccount = active[0].id; }
    if (!p.signedIn) p.defaultAccount = '';
    (p.accounts || []).forEach(x => { x.default = x.id === p.defaultAccount; });
    r.accountChosen = p.kind === 'URL' ? true : p.signedIn;
    r.modelsReady = p.signedIn && enabledModels(p).length > 0 && !active.every(x => /seat/i.test(x.health || ''));
    if (p.status !== 'disabled') {
      if (!r.installed) { p.status = p.kind === 'CLI' ? 'not-installed' : 'setup'; p.nextAction = p.kind === 'CLI' ? 'install' : p.kind === 'Server' ? 'attach' : p.nextAction; }
      else if (!p.signedIn) { p.status = (p.accounts || []).length ? 'attention' : 'setup'; p.nextAction = p.kind === 'URL' ? 'address' : (p.signIn.length === 1 && p.signIn[0][0] === 'apikey') ? 'apikey' : 'signin'; }
      else if (!r.modelsReady) { p.status = 'attention'; p.nextAction = 'addaccount'; }
      else { p.status = 'active'; p.nextAction = 'addaccount'; }
    }
    p.statusLabel = statusLabelFor(p);
  }

  /* ---------- pieces ------------------------------------------------------ */
  function primaryFor(p) {
    const data = { provider: p.id };
    if (p.status === 'disabled') return { label: 'Turn on', icon: 'refresh', action: 'pm51-providers-turn-on', data };
    switch (p.nextAction) {
      case 'install': return { label: 'Install', icon: 'download', action: 'pm51-providers-install', data };
      case 'signin': return { label: 'Sign In', icon: 'user', action: 'pm51-providers-signin', data };
      case 'apikey': return { label: 'Enter API Key', icon: 'key', action: 'pm51-providers-apikey', data };
      case 'attach': return { label: 'Set up server', icon: 'network', action: 'pm51-providers-signin', data };
      case 'address': return { label: 'Enter address', icon: 'link', action: 'pm51-providers-address', data };
      case 'routes': return { label: 'Choose routes', icon: 'route', action: 'pm51-providers-routes', data };
      default: return { label: 'Add account', icon: 'plus', action: 'pm51-providers-add-account', data };
    }
  }

  function stats() {
    const ready = all().filter(p => plain(p) === 'Ready').length;
    const attention = all().filter(p => /^Needs/.test(plain(p))).length;
    const notSet = all().filter(p => ['Not set up', 'Not installed'].includes(plain(p))).length;
    return PM51.stats([
      { label: 'Ready', value: ready, tone: 'ready', help: 'Signed in with models available' },
      { label: 'Needs attention', value: attention, tone: attention ? 'attention' : undefined, help: 'A sign-in or seat to sort out' },
      { label: 'Not set up', value: notSet, help: 'Available whenever you want them' }
    ]);
  }

  function setupSection(p) {
    const r = p.readiness || {};
    const cli = p.kind === 'CLI', server = p.kind === 'Server', free = p.id === 'free-models', url = p.kind === 'URL';
    const next = p.status === 'disabled' ? null : !r.installed ? 'install' : !r.signedIn ? 'signin' : !r.accountChosen ? 'account' : !r.modelsReady ? 'models' : null;
    const primary = primaryFor(p);
    const action = key => next === key ? Object.assign({}, primary, { primary: false }) : undefined;
    const acc = defaultAccount(p);
    const signInWays = (p.signIn || []).map(s => s[1]);
    const installDesc = cli ? (r.installed ? `Version ${p.version} is installed on your server.` : 'Puppet Master installs it on your server, only from the official provider.')
      : server ? (r.installed ? 'A server is reachable.' : 'Use a managed server, or attach to one you already run.')
      : 'No install needed.';
    const signInDesc = free ? 'Each free route uses its own sign-in.'
      : url ? (r.signedIn ? `Reaches ${p.address || 'the endpoint'}.` : 'Enter the address of the endpoint on your network.')
      : r.signedIn ? `Signed in${acc ? ' as ' + acc.identity : ''}.`
      : signInWays.length > 1 ? `${signInWays.slice(0, -1).join(', ')} or ${signInWays.slice(-1)[0]}.` : `${signInWays[0] || 'Sign in'}.`;
    const accountDesc = free ? 'No account needed for the group.' : url ? 'No account needed.'
      : r.accountChosen && acc ? `${acc.nickname} is used first.${activeAccounts(p).length > 1 ? ' Others are tried when it runs out.' : ''}`
      : 'Pick which account to use first. You can add more later.';
    const modelsDesc = r.modelsReady ? `${countText(enabledModels(p).length, 'model')} ready.`
      : p.id === 'github-copilot' ? 'This GitHub account has no Copilot seat, so no models can run.'
      : url ? 'Puppet Master asks the endpoint which models it serves.'
      : 'Appears automatically after sign-in.';
    return PM51.section({
      title: 'Set up', help: 'Readiness is four separate things. Each one is checked on its own.',
      body: PM51.steps([
        { title: 'Install', desc: installDesc, done: !!r.installed || (!cli && !server), action: action('install') },
        { title: 'Sign in', desc: signInDesc, done: !!r.signedIn, action: action('signin') },
        { title: 'Account chosen', desc: accountDesc, done: !!r.accountChosen, action: action('account') },
        { title: 'Models available', desc: modelsDesc, done: !!r.modelsReady, action: action('models') }
      ])
    });
  }

  function accountsSection(p) {
    if (p.id === 'free-models') return '';
    const data = { provider: p.id };
    const items = (p.accounts || []).map(acc => ({
      title: acc.nickname, pill: acc.default ? PM51.pill('Default', 'info') : '',
      meta: `${acc.identity} · ${acc.method}${acc.usage ? ' · ' + acc.usage : ''}`,
      note: acc.health && acc.health !== 'Healthy' ? acc.health : '',
      avatar: h(PM51.initials(acc.nickname)), end: icon('chevron'),
      action: 'pm51-providers-account', data: { provider: p.id, account: acc.id }
    }));
    const extra = p.id === 'github-copilot' ? PM51.rows([{ label: 'Copilot plan', help: 'Separate from your GitHub code service sign-in.', control: PM51.select(p.entitlement || 'Individual', ['Individual', 'Organization', 'Enterprise'], { action: 'pm51-providers-entitlement', data, label: 'Copilot plan' }) }]) : '';
    const body = (items.length ? PM51.list(items) : PM51.note(p.kind === 'URL' ? 'This endpoint works without an account.' : p.readiness.installed ? 'No accounts yet. Sign in to add the first one.' : 'Accounts appear here after you install and sign in.')) + extra;
    return PM51.section({ title: 'Accounts', help: items.length > 1 ? 'The first account is used until it runs out, then the next.' : undefined, action: { label: 'Add account', icon: 'plus', small: true, action: 'pm51-providers-add-account', data }, body });
  }

  function modelWait(m) {
    const t = String(m.health || '');
    if (/seat/i.test(t)) return 'Needs a seat';
    if (/sign/i.test(t)) return 'After sign-in';
    return 'After setup';
  }
  function modelsSection(p) {
    if (p.id === 'free-models') return '';
    const models = p.models || [];
    const data = { provider: p.id };
    if (!models.length) return PM51.section({ title: 'Models', body: PM51.note(p.readiness.installed ? 'Models appear here after you sign in.' : 'Models appear here after you install and sign in.') });
    const ready = !!p.readiness.modelsReady && p.status !== 'disabled';
    const rows = [];
    if (ready) rows.push({ label: 'Default model', help: 'Used unless a Goal or ability chooses another.', control: enabledModels(p).length ? PM51.select(p.routing.defaultModel, enabledModels(p).map(m => [m.id, m.name]), { action: 'pm51-providers-default-model', data, label: 'Default model' }) : '<span class="pm51-row-value is-muted">Turn on a model first</span>' });
    models.forEach(m => rows.push({
      label: m.name, help: `${planText(m)}${m.context && m.context !== 'N/A' && m.context !== 'Unknown' ? ' · ' + m.context + ' context' : ''}`,
      control: ready ? PM51.toggle(!!m.enabled, { action: 'pm51-providers-model', data: { provider: p.id, model: m.id }, label: m.name }) : `<span class="pm51-row-value is-muted">${h(modelWait(m))}</span>`
    }));
    return PM51.section({ title: 'Models', help: ready ? undefined : (p.signedIn ? 'Last known list. It refreshes once the service is ready.' : 'Last known list. It refreshes after you sign in.'), body: PM51.rows(rows) });
  }

  function routesSection() {
    const items = routes().map(r => ({
      title: routeName(r), pill: PM51.pill(routeStatus(r)),
      meta: r.enabled ? `${r.models.length ? r.models.join(', ') : 'No models yet'} · ${r.limit}` : `Off · ${r.limit}`,
      note: r.status === 'attention' ? r.signIn : '',
      end: PM51.toggle(!!r.enabled, { action: 'pm51-providers-route-toggle', data: { route: r.id }, label: routeName(r) }),
      action: 'pm51-providers-route', data: { route: r.id }
    }));
    return PM51.section({ title: 'Free routes', help: 'Free and free-limited services, tried in this order. Limits can change without notice.', body: PM51.list(items) });
  }

  function connectionSection(p) {
    const r = p.readiness || {};
    const url = p.kind === 'URL';
    const can = p.status !== 'disabled' && r.installed && (r.signedIn || (url && p.address));
    const label = p.status === 'disabled' ? 'Off'
      : p.status === 'active' ? 'Working'
      : r.signedIn ? 'Signed in'
      : url && p.address ? 'Address saved'
      : p.lastCheck || 'Not checked';
    const checked = p.status === 'disabled' ? '' : (p.status === 'active' || r.signedIn) ? `Checked ${p.lastCheck}. ` : url && p.address ? 'Not checked yet. ' : '';
    return PM51.section({
      title: 'Connection',
      body: PM51.rows([{ label, help: `${checked}Connects automatically once installed and signed in.`, action: { label: 'Check connection', icon: 'test', action: 'pm51-providers-check', data: { provider: p.id }, disabled: !can, reason: p.status === 'disabled' ? 'Turn the service on first.' : !r.installed ? 'Install it first.' : url ? 'Enter the address first.' : 'Sign in first.' } }])
    });
  }

  function advancedSection(p) {
    const data = { provider: p.id };
    const routing = p.routing || (p.routing = { defaultModel: '', accountOrder: [], exhaustion: 'Use fallback route', paidOverage: false });
    const rows = [
      { label: 'When an account runs out', help: 'What to try next when the current account reaches its limit.', control: PM51.select(routing.exhaustion, EXHAUSTION.some(x => x[0] === routing.exhaustion) ? EXHAUSTION : [[routing.exhaustion, routing.exhaustion], ...EXHAUSTION], { action: 'pm51-providers-exhaustion', data, label: 'When an account runs out' }) },
      { label: 'Allow paid overage', help: 'Keep going on pay-per-use pricing after included usage ends.', control: PM51.toggle(!!routing.paidOverage, { action: 'pm51-providers-overage', data, label: 'Allow paid overage' }) },
      { label: 'Usage boundary', help: 'How far this service may go before it asks you.', control: PM51.select(routing.usageBoundary || BOUNDARIES[0], BOUNDARIES, { action: 'pm51-providers-boundary', data, label: 'Usage boundary' }) }
    ];
    if (p.regions) rows.push({ label: 'Region', help: 'Choose the region your plan was bought in.', control: PM51.select(p.region || p.regions[0], p.regions, { action: 'pm51-providers-region', data, label: 'Region' }) });
    (p.advancedFields || []).forEach((label, i) => rows.push({ label, control: PM51.input((p.advancedValues || {})[i] || '', { action: 'pm51-providers-adv-field', data: { provider: p.id, index: i }, placeholder: 'Optional', label }) }));
    const install = PM51.kv([
      ['Version', p.version || 'Not installed'],
      ['Source', p.installSource || 'Not applicable'],
      ['Where', p.kind === 'CLI' ? 'Your server' : p.kind === 'Server' ? (p.installSource || 'Server') : 'No files on your computer'],
      ['Last check', p.lastCheck || 'Not checked']
    ]);
    const ways = (p.signIn || []).length ? PM51.kv((p.signIn || []).map(s => [s[1], SIGNIN_HELP[s[0]] || 'Opens the provider sign-in.'])) : PM51.note('No sign-in needed.');
    const notes = (p.diagnostics || []).length ? PM51.kv(p.diagnostics.map((d, i) => [`Note ${i + 1}`, d])) : PM51.note('Nothing to report.');
    return PM51.advanced([
      PM51.rows(rows),
      PM51.section({ title: 'Installation details', body: install }),
      PM51.section({ title: 'Sign-in method details', body: ways + (p.help ? PM51.note(p.help) : '') }),
      PM51.section({ title: 'Diagnostic notes', body: notes }),
      PM51.section({ title: 'Technical details', body: PM51.kv([['Service id', p.id], ['Kind', p.kind], ['Readiness', `installed ${yn(p.readiness.installed)} · signed in ${yn(p.readiness.signedIn)} · account chosen ${yn(p.readiness.accountChosen)} · models ready ${yn(p.readiness.modelsReady)}`], ['Commands', 'Provider commands are not registered in this preview']]) + '<div class="pm51-providers-inline">' + PM51.btn({ label: 'Refresh model list', icon: 'refresh', small: true, action: 'pm51-providers-refresh-models', data }) + PM51.btn({ label: 'Export redacted report', icon: 'download', small: true, action: 'pm51-providers-export', data }) + PM51.btn({ label: 'Run diagnostics', icon: 'test', small: true, action: 'pm51-providers-diagnostics', data }) + '</div>' })
    ].join(''));
  }
  const yn = v => v ? 'yes' : 'no';
  const SIGNIN_HELP = {
    'signin-claude': 'Browser sign-in with your Claude subscription.', 'signin-console': 'Browser sign-in to the Console for API access.', 'signin-sso': 'Your company sign-in page.', 'import-auth': 'Reuses a sign-in already on your server.',
    'signin-chatgpt': 'Browser sign-in with your ChatGPT account.', apikey: 'Paste a key from the provider website.', 'signin-google': 'Browser sign-in with Google.', 'signin-browser': 'Browser sign-in.', 'signin-github': 'Browser sign-in with GitHub.',
    'managed-server': 'Puppet Master runs the server for you.', 'attach-server': 'Point at a server you already run.', address: 'An address on your network.'
  };

  function detailFor(p) {
    return {
      title: p.name, pill: PM51.pill(plain(p)), subtitle: `${p.connect}${p.product && !p.connect.toLowerCase().includes(p.product.toLowerCase()) ? ' · ' + p.product : ''}`,
      primary: primaryFor(p), menu: anchor => menuFor(p, anchor),
      body: [setupSection(p), accountsSection(p), p.id === 'free-models' ? routesSection() : modelsSection(p), connectionSection(p), advancedSection(p)].join('')
    };
  }

  function render() {
    if (!current()) return PM51.page({ id: ID, key: KEY, body: PM51.empty('No AI services yet', 'Add a service to get started.', { label: 'Add a service', action: 'pm51-providers-add', icon: 'plus' }) });
    const p = current();
    const body = stats() + PM51.listDetail({
      id: ID, rosterId: 'provider-roster', rosterTitle: 'AI services', count: all().length,
      add: { action: 'pm51-providers-add', label: 'Add a service' }, filter: { placeholder: 'Filter services' },
      selectAction: 'select-provider',
      items: all().map(x => ({ id: x.id, title: x.name, meta: `${how(x)} · ${plain(x)}`, tone: tone(x), selected: x.id === p.id, data: { provider: x.id } })),
      detail: detailFor(p)
    });
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset all services to defaults', action: 'pm51-providers-reset' }, { label: 'How AI services work', action: 'pm51-providers-help' }, { label: 'Run diagnostics', action: 'pm51-providers-diagnostics' }] });
  }

  PM51.manager('providers', { render });
  /* The engine's select-provider handler swaps .resource-detail from a fresh renderProviders() call. */
  renderProviders = function () { return render(); };

  /* ---------- menus & panels ---------------------------------------------- */
  function menuFor(p, anchor) {
    const off = p.status === 'disabled';
    PM51.menu(anchor, [
      { label: 'Set default model', icon: 'brain', onClick: () => defaultModelPanel(p), ariaDisabled: !enabledModels(p).length, meta: enabledModels(p).length ? '' : 'No models yet' },
      { label: off ? 'Turn on' : 'Turn off', icon: off ? 'play' : 'pause', onClick: () => off ? turnOn(p) : turnOff(p) },
      { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${p.name}?`, 'Puppet Master forgets its accounts and models. You can add it again later.', 'Remove', () => { state.providers = all().filter(x => x.id !== p.id); state.selectedProvider = all()[0]?.id || null; save(); PM51.toast('Service removed', `${p.name} is gone from this list.`); }, true) },
      { separator: true },
      { label: 'Technical details', icon: 'info', onClick: () => techPanel(p) }
    ], p.name);
  }
  function turnOff(p) {
    PM51.confirm(`Turn off ${p.name}?`, 'Nothing new is sent to it. Accounts and sign-ins are kept.', 'Turn off', () => { p.prevStatus = p.status; p.status = 'disabled'; p.statusLabel = statusLabelFor(p); save(); PM51.toast(`${p.name} is off`, 'Turn it on again from its menu.'); });
  }
  function turnOn(p) { p.status = p.prevStatus || 'setup'; delete p.prevStatus; recompute(p); save(); PM51.toast(`${p.name} is on`, statusLabelFor(p)); }
  function defaultModelPanel(p) {
    const models = enabledModels(p);
    PM51.panel({
      title: 'Default model', subtitle: `${p.name} uses this unless a Goal or ability chooses another.`,
      body: PM51.panelSection('Model', PM51.field('Default model', PM51.select(p.routing.defaultModel, models.map(m => [m.id, m.name]), { label: 'Default model' }))),
      primaryLabel: 'Save', onPrimary: wrap => { const sel = wrap.querySelector('select'); if (sel) p.routing.defaultModel = sel.value; save(); }
    });
  }
  function techPanel(p) {
    PM51.panel({
      title: 'Technical details', subtitle: p.name,
      body: PM51.panelSection('Identity', PM51.kv([['Service id', p.id], ['Kind', p.kind], ['Version', p.version || 'Not installed'], ['Install source', p.installSource || 'Not applicable'], ['Default account', p.defaultAccount || 'None'], ['Default model', p.routing?.defaultModel || 'None']]))
        + PM51.panelSection('Readiness', PM51.kv([['Installed', yn(p.readiness.installed)], ['Signed in', yn(p.readiness.signedIn)], ['Account chosen', yn(p.readiness.accountChosen)], ['Models ready', yn(p.readiness.modelsReady)], ['Last check', p.lastCheck || 'Not checked']]))
        + PM51.panelSection('Sign-in methods', (p.signIn || []).length ? PM51.kv(p.signIn.map(s => [s[0], s[1]])) : PM51.note('None.'))
    });
  }

  function browserPanel(p, title, service) {
    PM51.panel({
      title, subtitle: `${p.name} · browser sign-in`,
      body: PM51.panelSection('What happens', PM51.steps([
        { title: `A browser window opens to ${service}`, desc: 'Sign in there as usual.' },
        { title: 'Approve Puppet Master', desc: 'You choose what it may use.' },
        { title: 'Come back here', desc: 'The account appears under Accounts.' }
      ])) + PM51.note('Your password never passes through Puppet Master.'),
      primaryLabel: 'Open browser sign-in', onPrimary: () => example('Sign-in requested', `Example data only. No browser was opened for ${service} in this preview.`)
    });
  }
  function signInPanel(p, key, label) {
    switch (key) {
      case 'apikey': return apiKeyPanel(p);
      case 'address': return addressPanel(p);
      case 'signin-sso': return PM51.panel({
        title: label, subtitle: `${p.name} · company sign-in`,
        body: PM51.panelSection('Company sign-in', PM51.field('Sign-in address', PM51.input('', { placeholder: 'https://sso.example.com', label: 'Sign-in address' }), 'Ask your IT team if you are not sure.')) + PM51.panelSection('What happens', PM51.steps([{ title: 'Your company sign-in page opens', desc: 'In a browser window.' }, { title: 'Come back here', desc: 'The account appears under Accounts.' }])),
        primaryLabel: 'Continue', onPrimary: () => example('Sign-in requested', 'Example data only. No browser was opened in this preview.')
      });
      case 'import-auth': return PM51.panel({
        title: label, subtitle: `If you already signed in to ${p.name.replace(/ CLI$/, '')} on your server, Puppet Master can reuse that sign-in.`,
        body: PM51.panelSection('What is imported', PM51.kv([['Sign-in', 'The existing session on your server'], ['Password', 'Never read or copied'], ['Where it is stored', 'The credential store on your server']])) + PM51.note('Puppet Master checks the sign-in still works before using it.'),
        primaryLabel: 'Import sign-in', onPrimary: () => example('Import requested', 'Example data only. No sign-in was imported in this preview.')
      });
      case 'managed-server': return PM51.panel({
        title: label, subtitle: `${p.name} · Puppet Master runs the server for you`,
        body: PM51.panelSection('What happens', PM51.steps([{ title: 'Start the server on your server', desc: 'Managed and updated by Puppet Master.' }, { title: 'Sign in to the server', desc: 'The server has its own sign-in; model credentials are separate.' }, { title: 'Models appear here', desc: 'Once the server is ready.' }])),
        primaryLabel: 'Start managed server', onPrimary: () => example('Server requested', 'Example data only. No server was started in this preview.')
      });
      case 'attach-server': return PM51.panel({
        title: label, subtitle: `${p.name} · a server you already run`,
        body: PM51.panelSection('Server', PM51.field('Server address', PM51.input(p.serverAddress || '', { placeholder: 'http://192.168.1.20:4096', label: 'Server address' })) + PM51.field('Server sign-in', PM51.input('', { placeholder: 'Token or password', type: 'password', label: 'Server sign-in' }), 'Stored in the credential store on your server.')),
        primaryLabel: 'Attach', onPrimary: wrap => { const v = wrap.querySelector('input')?.value.trim(); if (!v) { PM51.toast('Enter the server address first', 'Puppet Master needs to know where the server is.', 'info'); return false; } p.serverAddress = v; saveState(); example('Attach requested', 'Address saved. Example data only. No connection was made in this preview.'); }
      });
      case 'signin-chatgpt': return browserPanel(p, label, 'ChatGPT');
      case 'signin-google': return browserPanel(p, label, 'Google');
      case 'signin-github': return browserPanel(p, label, 'GitHub');
      case 'signin-console': return browserPanel(p, label, 'the Console');
      case 'signin-claude': return browserPanel(p, label, 'Claude');
      default: return browserPanel(p, label, p.name);
    }
  }
  function signInFlow(p, anchor, title) {
    const ways = p.signIn || [];
    if (!ways.length) { PM51.unavailable('Sign in', `${p.name} has no sign-in of its own.`); return; }
    if (ways.length === 1) { signInPanel(p, ways[0][0], ways[0][1]); return; }
    PM51.menu(anchor, ways.map(([key, label]) => ({ label, icon: key === 'apikey' ? 'key' : key === 'import-auth' ? 'download' : key.includes('server') ? 'network' : 'user', onClick: () => signInPanel(p, key, label) })), title || `Sign in to ${p.name}`);
  }
  function apiKeyPanel(p) {
    const body = PM51.panelSection('API key', PM51.field('API key', PM51.input('', { placeholder: 'Paste your key', type: 'password', label: 'API key', cls: 'pm51-providers-key' }), 'Copy it from the provider website. It is stored in the credential store on your server, never in settings files.')
      + (p.regions ? PM51.field('Region', PM51.select(p.region || p.regions[0], p.regions, { label: 'Region', cls: 'pm51-providers-region' }), 'Choose the region your plan was bought in.') : '')
      + (p.advancedFields || []).map((label, i) => PM51.field(label, PM51.input((p.advancedValues || {})[i] || '', { placeholder: 'Optional', label, cls: 'pm51-providers-adv', data: { index: i } }))).join(''))
      + PM51.note('Puppet Master checks the key with one small request before it is used.');
    PM51.panel({
      title: 'Enter API Key', subtitle: p.name, body,
      primaryLabel: 'Save key', onPrimary: wrap => {
        const key = wrap.querySelector('.pm51-providers-key')?.value.trim();
        if (!key) { PM51.toast('Paste a key first', 'The key comes from the provider website.', 'info'); return false; }
        const region = wrap.querySelector('.pm51-providers-region'); if (region) p.region = region.value;
        wrap.querySelectorAll('.pm51-providers-adv').forEach(inp => { p.advancedValues = p.advancedValues || {}; p.advancedValues[inp.dataset.index] = inp.value; });
        saveState();
        example('Key received', 'Example data only. No key was stored in this preview.');
      }
    });
  }
  function addressPanel(p) {
    PM51.panel({
      title: 'Enter address', subtitle: `${p.name} · an address on your network`,
      body: PM51.panelSection('Endpoint', PM51.field('Address', PM51.input(p.address || '', { placeholder: 'http://192.168.1.20:11434', label: 'Address', cls: 'pm51-providers-address' }), 'Works without an outside account when the endpoint is already running.')) + PM51.note('Choose Check connection afterwards to see whether it answers.'),
      primaryLabel: 'Save address', onPrimary: wrap => {
        const v = wrap.querySelector('.pm51-providers-address')?.value.trim();
        if (!v) { PM51.toast('Enter an address first', 'For example http://192.168.1.20:11434', 'info'); return false; }
        p.address = v; p.connect = v; p.lastCheck = 'Not checked'; save(); PM51.toast('Address saved', 'Check the connection to see whether it answers.');
      }
    });
  }
  function routePanel(r) {
    const order = r.priority ? `Tried ${['first', 'second', 'third', 'fourth', 'fifth'][r.priority - 1] || '#' + r.priority}` : 'Not in the order (off)';
    PM51.panel({
      title: routeName(r), pill: PM51.pill(routeStatus(r)), subtitle: r.terms,
      body: PM51.panelSection('Details', PM51.kv([['Sign-in', r.signIn], ['Models', r.models.length ? r.models.join(', ') : 'None yet'], ['Limit', r.limit], ['Order', order]]))
        + PM51.panelSection('Connection', '<div>' + PM51.btn({ label: 'Check route', icon: 'test', small: true, action: 'pm51-providers-route-check', data: { route: r.id }, disabled: !r.enabled, reason: 'Turn the route on first.' }) + '</div>', 'One small request through this route.'),
      primaryLabel: r.enabled ? 'Turn off' : 'Turn on', onPrimary: () => toggleRoute(r)
    });
  }
  function toggleRoute(r) {
    r.enabled = !r.enabled;
    if (r.enabled) { r.status = r.status === 'disabled' ? (r.models.length ? 'active' : 'attention') : r.status; if (!r.priority) r.priority = Math.max(0, ...routes().map(x => x.priority || 0)) + 1; if (r.status === 'attention' && !r.models.length) r.signIn = 'Sign in to finish setup'; }
    else r.status = 'disabled';
    syncFree(); save();
  }
  function accountPanel(p, acc) {
    const order = p.routing.accountOrder || (p.routing.accountOrder = []);
    const idx = order.indexOf(acc.id);
    const data = { provider: p.id, account: acc.id };
    const body = PM51.panelSection('Nickname', PM51.field('Shown in Puppet Master', PM51.input(acc.nickname, { placeholder: 'Nickname', label: 'Nickname', cls: 'pm51-providers-nick' }), 'The service still sees your real account.'))
      + PM51.panelSection('Details', PM51.kv([['Signed in as', acc.identity], ['Method', acc.method], ['Usage', acc.usage || 'Unknown'], ['Health', acc.health || 'Unknown']]))
      + PM51.panelSection('Actions', '<div class="pm51-providers-actions">'
        + PM51.btn({ label: 'Make default', icon: 'pin', small: true, action: 'pm51-providers-account-default', data, disabled: !!acc.default || !acc.active, reason: acc.default ? 'Already the default.' : 'Sign in again first.' })
        + PM51.btn({ label: 'Move up', icon: 'up', small: true, action: 'pm51-providers-account-move', data: Object.assign({ dir: -1 }, data), disabled: idx <= 0, reason: 'Already first.' })
        + PM51.btn({ label: 'Move down', icon: 'down', small: true, action: 'pm51-providers-account-move', data: Object.assign({ dir: 1 }, data), disabled: idx < 0 || idx >= order.length - 1, reason: 'Already last.' })
        + PM51.btn({ label: acc.active ? 'Sign out' : 'Sign in again', icon: acc.active ? 'lock' : 'user', small: true, action: acc.active ? 'pm51-providers-account-signout' : 'pm51-providers-add-account', data })
        + PM51.btn({ label: 'Remove', icon: 'trash', small: true, danger: true, action: 'pm51-providers-account-remove', data })
        + '</div>', 'Order decides which account is tried first.');
    PM51.panel({
      title: acc.nickname, pill: acc.default ? PM51.pill('Default', 'info') : (acc.active ? '' : PM51.pill('Needs sign-in')), subtitle: `${p.name} · ${acc.identity}`, body,
      primaryLabel: 'Save', onPrimary: wrap => { const input = wrap.querySelector('.pm51-providers-nick'); if (input && input.value.trim()) acc.nickname = input.value.trim(); save(); }
    });
  }
  function checkPanel(p) {
    const acc = defaultAccount(p);
    const url = p.kind === 'URL';
    PM51.check({
      title: `Check ${p.name}`,
      steps: [
        { title: 'Installed', desc: p.kind === 'CLI' ? `Version ${p.version} found on your server` : url ? `Address ${p.address || 'saved'}` : 'Nothing to install' },
        { title: 'Signed in', desc: url ? 'No account needed' : acc ? `As ${acc.identity}` : 'Sign-in present', status: url || acc ? 'Checked' : 'Example', tone: url || acc ? 'ready' : 'info' },
        { title: 'Models listed', desc: enabledModels(p).length ? `${countText(enabledModels(p).length, 'model')} available` : 'The service is asked which models it serves', status: 'Example', tone: 'info' },
        { title: 'One small request', desc: 'A tiny request to make sure answers come back', status: 'Example', tone: 'info' }
      ]
    });
  }

  /* ---------- actions ---------------------------------------------------- */
  const prov = el => byId(ds(el, 'provider'));
  PM51.on('providers-add', () => openDialog({
    title: 'Add a service', subtitle: 'Choose how the new service connects. You can sign in afterwards.',
    body: PM51.form([
      { label: 'Service name', name: 'name', placeholder: 'e.g. My OpenAI-compatible server', autofocus: true, full: true },
      { label: 'How it connects', name: 'kind', type: 'select', choices: ['API key', 'Sign in', 'Address on your network', 'Command-line tool'] },
      { label: 'Address', name: 'address', placeholder: 'Only for services on your network' }
    ]),
    saveLabel: 'Add service',
    onSave: data => {
      const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the service a name', 'Something you will recognise in the list.', 'info'); return false; }
      const kind = data.kind === 'Address on your network' ? 'URL' : data.kind === 'Command-line tool' ? 'CLI' : data.kind === 'Sign in' ? 'Account' : 'API';
      const id = uid('service', name);
      const p = { id, name, kind, connect: kind === 'URL' ? (data.address || 'An address on your network') : kind === 'CLI' ? 'Installs on your server' : kind === 'Account' ? 'Sign in' : 'API key', status: kind === 'CLI' ? 'not-installed' : 'setup', statusLabel: kind === 'CLI' ? 'Not installed' : 'Not set up', installed: kind !== 'CLI', signedIn: false, version: '', installSource: kind === 'CLI' ? 'Official provider installer' : 'No install needed', defaultAccount: '', product: '', nextAction: kind === 'CLI' ? 'install' : kind === 'URL' ? 'address' : kind === 'Account' ? 'signin' : 'apikey', signIn: kind === 'URL' ? [['address', 'Enter address']] : kind === 'Account' ? [['signin-browser', 'Sign in in browser']] : [['apikey', 'Enter API Key']], readiness: { installed: kind !== 'CLI', signedIn: false, accountChosen: kind === 'URL', modelsReady: false }, lastCheck: kind === 'CLI' ? 'Install first' : 'Not checked', accounts: [], models: [], routing: { defaultModel: '', accountOrder: [], exhaustion: 'Use fallback route', paidOverage: false }, diagnostics: [], address: kind === 'URL' ? (data.address || '') : undefined };
      state.providers.push(p); state.selectedProvider = id; save(); PM51.toast('Service added', `${name} is ready to set up.`);
    }
  }));
  PM51.on('providers-install', el => {
    const p = prov(el); const server = (PM51.s().serverProject?.servers || []).find(s => s.default)?.name || 'your server';
    PM51.panel({
      title: `Install ${p.name}`, subtitle: `Puppet Master installs it on ${server}, only from the official provider.`,
      body: PM51.panelSection('What happens', PM51.steps([
        { title: 'Download from the official provider', desc: 'Never from a third-party mirror.' },
        { title: `Install on ${server}`, desc: 'Takes about a minute. You can keep working.' },
        { title: 'Check the version', desc: 'Then you come back here to sign in.' }
      ])) + PM51.note('Nothing installs until you choose Install.'),
      primaryLabel: 'Install', onPrimary: () => example('Install requested', `Example data only. ${p.name} was not installed in this preview.`)
    });
  });
  PM51.on('providers-signin', el => signInFlow(prov(el), el));
  PM51.on('providers-add-account', el => { closeOverlay(false); signInFlow(prov(el), el, `Add an account to ${prov(el).name}`); });
  PM51.on('providers-apikey', el => apiKeyPanel(prov(el)));
  PM51.on('providers-address', el => addressPanel(prov(el)));
  PM51.on('providers-turn-on', el => turnOn(prov(el)));
  PM51.on('providers-check', el => checkPanel(prov(el)));
  PM51.on('providers-routes', () => PM51.panel({
    title: 'Free routes', subtitle: 'Turn routes on or off. They are tried in this order.',
    body: PM51.panelSection('Routes', PM51.rows(routes().map(r => ({ label: routeName(r), help: r.limit, pill: PM51.pill(routeStatus(r)), control: PM51.toggle(!!r.enabled, { action: 'pm51-providers-route-toggle', data: { route: r.id, quiet: 1 }, label: routeName(r) }) })))),
    primaryLabel: 'Done', onPrimary: () => save()
  }));
  PM51.on('providers-route', el => routePanel(routeById(ds(el, 'route'))));
  PM51.on('providers-route-toggle', el => {
    const r = routeById(ds(el, 'route')); r.enabled = !r.enabled;
    if (r.enabled) { if (r.status === 'disabled') r.status = r.models.length ? 'active' : 'attention'; if (!r.priority) r.priority = Math.max(0, ...routes().map(x => x.priority || 0)) + 1; if (!r.models.length) r.signIn = 'Sign in to finish setup'; }
    else r.status = 'disabled';
    syncFree(); el.classList.toggle('on', r.enabled); el.setAttribute('aria-checked', r.enabled ? 'true' : 'false');
    if (ds(el, 'quiet')) saveState(); else save();
  });
  PM51.on('providers-route-check', el => { const r = routeById(ds(el, 'route')); PM51.check({ title: `Check ${routeName(r)}`, steps: [{ title: 'Sign-in present', desc: r.signIn }, { title: 'Models listed', desc: r.models.join(', ') || 'None yet', status: 'Example', tone: 'info' }, { title: 'One small request', desc: `Within the limit: ${r.limit}`, status: 'Example', tone: 'info' }] }); });
  PM51.on('providers-account', el => { const p = prov(el); const acc = (p.accounts || []).find(x => x.id === ds(el, 'account')); if (acc) accountPanel(p, acc); });
  PM51.on('providers-account-default', el => { const p = prov(el); const acc = p.accounts.find(x => x.id === ds(el, 'account')); if (!acc) return; p.defaultAccount = acc.id; p.accounts.forEach(x => { x.default = x.id === acc.id; }); const order = p.routing.accountOrder; const i = order.indexOf(acc.id); if (i > 0) { order.splice(i, 1); order.unshift(acc.id); } closeOverlay(false); recompute(p); save(); PM51.toast('Default account changed', `${acc.nickname} is used first.`); });
  PM51.on('providers-account-move', el => { const p = prov(el); const order = p.routing.accountOrder; const i = order.indexOf(ds(el, 'account')); const to = i + Number(ds(el, 'dir')); if (i < 0 || to < 0 || to >= order.length) return; const [x] = order.splice(i, 1); order.splice(to, 0, x); closeOverlay(false); save(); });
  PM51.on('providers-account-signout', el => { const p = prov(el); const acc = p.accounts.find(x => x.id === ds(el, 'account')); if (!acc) return; closeOverlay(false); PM51.confirm(`Sign out of ${acc.nickname}?`, 'Puppet Master stops using this account until you sign in again.', 'Sign out', () => { acc.active = false; acc.health = 'Signed out'; acc.usage = 'Sign in again to use it'; recompute(p); save(); PM51.toast('Signed out', `${acc.nickname} is no longer used.`); }); });
  PM51.on('providers-account-remove', el => { const p = prov(el); const acc = p.accounts.find(x => x.id === ds(el, 'account')); if (!acc) return; closeOverlay(false); PM51.confirm(`Remove ${acc.nickname}?`, 'Puppet Master forgets this account. You can sign in again later.', 'Remove', () => { p.accounts = p.accounts.filter(x => x.id !== acc.id); p.routing.accountOrder = p.routing.accountOrder.filter(x => x !== acc.id); recompute(p); save(); PM51.toast('Account removed', `${acc.nickname} was removed from ${p.name}.`); }, true); });
  PM51.onChange('providers-default-model', el => { const p = prov(el); p.routing.defaultModel = el.value; saveState(); const m = p.models.find(x => x.id === el.value); PM51.toast('Default model changed', m ? `${p.name} now uses ${m.name} by default.` : ''); });
  PM51.on('providers-model', el => { const p = prov(el); const m = p.models.find(x => x.id === ds(el, 'model')); if (!m) return; m.enabled = !m.enabled; if (!m.enabled && p.routing.defaultModel === m.id) p.routing.defaultModel = enabledModels(p)[0]?.id || ''; if (m.enabled && !p.routing.defaultModel) p.routing.defaultModel = m.id; recompute(p); save(); });
  PM51.onChange('providers-entitlement', el => { prov(el).entitlement = el.value; saveState(); });
  PM51.onChange('providers-exhaustion', el => { prov(el).routing.exhaustion = el.value; saveState(); });
  PM51.on('providers-overage', el => { const p = prov(el); p.routing.paidOverage = !p.routing.paidOverage; save(); });
  PM51.onChange('providers-boundary', el => { prov(el).routing.usageBoundary = el.value; saveState(); });
  PM51.onChange('providers-region', el => { prov(el).region = el.value; saveState(); });
  PM51.onInput('providers-adv-field', el => { const p = prov(el); p.advancedValues = p.advancedValues || {}; p.advancedValues[ds(el, 'index')] = el.value; saveState(); });
  PM51.on('providers-refresh-models', el => example('Model list refresh requested', `Example data only. ${prov(el).name} was not contacted in this preview.`));
  PM51.on('providers-export', el => PM51.panel({
    title: 'Export redacted report', subtitle: prov(el).name,
    body: PM51.panelSection('What is included', PM51.kv([['Readiness', 'Install, sign-in, account, and model state'], ['Diagnostic notes', 'As shown under Advanced'], ['Keys and passwords', 'Never included'], ['Account names', 'Replaced with placeholders']])),
    primaryLabel: 'Save report', onPrimary: () => example('Report ready', 'Example data only. No file was written in this preview.')
  }));
  PM51.on('providers-diagnostics', el => {
    const p = ds(el, 'provider') ? byId(ds(el, 'provider')) : null;
    PM51.check({ title: p ? `${p.name} diagnostics` : 'AI services diagnostics', steps: p ? [
      { title: 'Settings readable', desc: 'Accounts, models, and routing resolved' },
      { title: 'Credential store reachable', desc: 'On your server', status: 'Example', tone: 'info' },
      { title: 'Service answers', desc: 'One small request', status: 'Example', tone: 'info' }
    ] : [
      { title: 'Services listed', desc: `${countText(all().length, 'service')} in this workspace` },
      { title: 'Ready services', desc: `${all().filter(x => plain(x) === 'Ready').length} signed in with models available` },
      { title: 'Free routes', desc: `${routesOn()} of ${routes().length} on` },
      { title: 'Credential store reachable', desc: 'On your server', status: 'Example', tone: 'info' }
    ] });
  });
  PM51.on('providers-reset', () => PM51.confirm('Reset all services to defaults?', 'Accounts, model choices, and routes go back to the example defaults.', 'Reset', () => {
    state.providers = clone(D.providers); state.freeRoutes = clone(D.freeRoutes); state.selectedProvider = state.providers[0]?.id || null; save(); PM51.toast('Services reset', 'Defaults are back.');
  }, true));
  PM51.on('providers-help', () => PM51.panel({
    title: 'How AI services work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Each service is the company or program that does the thinking. Install it if it needs installing, sign in, pick an account, and its models appear.</p>')
      + PM51.panelSection('Readiness', PM51.kv([['Install', 'Only command-line tools install, and only from the official provider after you choose Install.'], ['Sign in', 'Browser sign-in, an API key, or an address on your network.'], ['Account chosen', 'The first account is used until it runs out, then the next.'], ['Models available', 'The list comes from the service once you are signed in.']]))
      + PM51.panelSection('Free routes', '<p class="pm51-ps-text">Free Models groups free and free-limited services. Limits can change without notice, so they are tried in order and skipped when exhausted.</p>')
  }));
})();
