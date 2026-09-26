/* Providers & Accounts — the AI services this project can use, the accounts behind each one, and the choices that
   decide which model does which job. Four tabs, each answering one question:
   - Services: what is connected, what needs a step, and each service's accounts. Grouped the way onboarding groups
     them: plans you pay for monthly, pay-as-you-go API accounts, and free or self-run options. A pay-as-you-go API is
     its own service next to its plan ("Claude plan, not the Anthropic API"), never a sign-in method inside it.
   - Models: the everyday model, a model for each job, presets and fine-tuning.
   - Limits & switching: what happens when an account or a service runs out.
   - Usage & budgets: spending limits, warnings, and what the Usage page shows.
   Settings that describe one account (nickname, jobs it may do, who is billed, its key, its Google Cloud project,
   when it switches) are drawn inside that account, and the ones that describe one service inside that service; the
   old flat "Accounts & sign-in" and "API keys & credentials" lists are gone. Keys are entered only in a service's own
   key dialog and are never shown or stored in settings.
   Everything the rest of the concept reads (acc.default, p.defaultAccount, routing.defaultModel, the catalog's
   enabled union) is still derived by recompute()/derive(), so Commands, Web, Media and Back Seat Driver keep working. */
(function () {
  const ID = 'providers';
  const KEY = 'providers-accounts-models';
  const TABS = [{ id: 'services', label: 'Services' }, { id: 'models', label: 'Models' }, { id: 'limits', label: 'Limits & switching' }, { id: 'usage', label: 'Usage & budgets' }];
  const GROUPS = [
    { id: 'plan', label: 'Subscriptions and plans', help: 'A monthly plan you already pay for' },
    { id: 'use', label: 'Pay as you go', help: 'Billed by what you use' },
    { id: 'own', label: 'Free and your own', help: 'Free routes, and models you run yourself' }
  ];
  const all = () => state.providers;
  const current = () => all().find(p => p.id === state.selectedProvider) || all()[0];
  const byId = id => all().find(p => p.id === id) || current();
  const find = id => all().find(p => p.id === id);
  const routes = () => (state.freeRoutes || []).filter(r => r.id !== 'free-community');
  const routeById = id => routes().find(r => r.id === id) || routes()[0];
  const ROUTE_NAMES = { 'free-openrouter': 'OpenRouter free models', 'free-github-models': 'GitHub Models', 'free-cerebras': 'Cerebras free tier', 'free-groq': 'Groq free tier', 'free-hf': 'Hugging Face' };
  const routeName = r => ROUTE_NAMES[r.id] || r.name;
  const RUNS_OUT = {
    'next-account': ['Try my next account', 'Then another service, if that is allowed under Limits & switching.'],
    'next-service': ['Move to another service', 'The next service in your try order takes over.'],
    'next-route': ['Try the next free route', 'Free routes are tried in the order shown below.'],
    ask: ['Stop and ask me', 'Work pauses until you choose what to do.'],
    overage: ['Keep going, billed by use', 'Pay-per-use pricing after the plan\'s included usage ends.']
  };
  const PLAN_TEXT = { Included: 'Included in your plan', Metered: 'Pay per use', Plan: 'Included in the coding plan', Free: 'Free route', Unknown: 'Plan unknown until sign-in', Unavailable: 'Unavailable' };
  const WINDOW_KEYS = ['fiveHour', 'weekly', 'monthly'];
  const WINDOW_LABELS = { fiveHour: '5-hour window', weekly: 'Weekly window', monthly: 'Monthly window' };
  const EMPTY_ROUTING = () => ({ defaultModel: '', accountOrder: [], exhaustion: 'next-service' });
  const ACC = 'providers-account', SVC = 'providers-service';
  /* Settings that belong to one account (drawn in each account) and where the service-specific ones live. */
  const ACCOUNT_IDS = ['ai.accounts.account-name', 'ai.accounts.account-enabled', 'ai.accounts.account-roles', 'ai.accounts.billing-entity', 'ai.accounts.claude-login-method', 'ai.accounts.codex-auth-family', 'ai.accounts.gcp-project-id', 'ai.accounts.account-priority', 'ai.accounts.account-threshold-override', 'ai.accounts.switch-mode-override', 'ai.accounts.cooldown-policy', 'ai.accounts.retry-budget', 'ai.accounts.quota-profile', 'ai.accounts.auth-family', 'ai.accounts.credential-storage', 'ai.accounts.auth-surface', 'ai.accounts.set-preferred-account'];
  const OWNER = {
    'ai.accounts.claude-login-method': 'claude-code', 'system.advanced.cli-path-claude': 'claude-code',
    'ai.accounts.codex-auth-family': 'openai-codex', 'ai.accounts.openai-api-key': 'openai-codex',
    'ai.accounts.anthropic-api-key': 'anthropic-api', 'ai.accounts.gemini-api-key': 'gemini-direct', 'ai.accounts.gcp-project-id': 'vertex',
    'ai.accounts.cursor-api-key': 'cursor-cli', 'system.advanced.cli-path-cursor': 'cursor-cli', 'ai.accounts.minimax-api-key': 'minimax-coding',
    'ai.usage.free-models-auto-apply': 'free-models'
  };

  PM51.style(`
    #panel-settings #provider-roster .resource-row-meta, #panel-settings #provider-roster .resource-row-name { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
    #panel-settings .pm51-providers-acc { container-type: inline-size; }
    #panel-settings .pm51-providers-acc .pm51-acc-head { flex-wrap: wrap; row-gap: 6px; }
    #panel-settings .pm51-providers-acc .pm51-acc-copy { flex: 1 1 240px; }
    #panel-settings .pm51-providers-acc .pm51-acc-end { margin-left: auto; }
    #panel-settings .pm51-providers-acc .pm51-acc-usage { display: inline-flex; align-items: center; min-height: 18px; font-size: 11px; color: var(--k3-text-3); }
    #panel-settings .pm51-providers-acc .pm51-acc-meters { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); max-width: none; align-items: end; }
    #panel-settings .pm51-providers-acc .pm51-meter-value { white-space: normal; overflow: visible; text-overflow: clip; }
    #panel-settings .pm51-providers-order { display: inline-flex; align-items: center; gap: 2px; }
    #panel-settings .pm51-providers-acc .pm51-acc-end .pm51-btn.small { white-space: nowrap; }
    #panel-settings .pm51-providers-acc-actions { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 0 2px; border-top: 1px solid var(--k3-line); margin-top: 6px; }
    @container (max-width: 560px) { #panel-settings .pm51-providers-acc .pm51-acc-item.is-open .pm51-acc-inner { padding-left: 0; } }
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
  const modelName = (p, id) => ((p.models || []).find(m => m.id === id) || {}).name || id || '';
  const inUse = acc => !!acc.active && acc.enabled !== false;
  const activeAccounts = p => (p.accounts || []).filter(inUse);
  const usage = acc => (acc && acc.usage && typeof acc.usage === 'object') ? acc.usage : { text: typeof (acc || {}).usage === 'string' ? acc.usage : '', windows: {} };
  const windowsOf = p => (p.windows && typeof p.windows === 'object' && !Array.isArray(p.windows)) ? p.windows : {};
  const windowKeys = p => { const w = windowsOf(p); return WINDOW_KEYS.filter(k => w[k] != null).concat(Object.keys(w).filter(k => !WINDOW_KEYS.includes(k))); };
  const windowLabel = (p, k) => { const v = windowsOf(p)[k]; return typeof v === 'string' && v ? v : (WINDOW_LABELS[k] || PM51.plain(k)); };
  const accModels = acc => Array.isArray(acc.models) ? acc.models : [];
  const accModel = (acc, id) => accModels(acc).find(m => m.id === id);
  const accModelOn = (acc, id) => { const m = accModel(acc, id); return !!(m && m.enabled); };
  const accEnabled = (p, acc) => (p.models || []).filter(m => accModelOn(acc, m.id));
  const seatless = acc => /seat/i.test(String(acc.health || ''));
  const limitHit = acc => /limit/i.test(String(acc.health || '')) || Object.values(usage(acc).windows || {}).some(w => w && typeof w === 'object' && Number(w.pct) >= 100);
  const routingOf = p => { if (!p.routing || typeof p.routing !== 'object') p.routing = EMPTY_ROUTING(); if (!Array.isArray(p.routing.accountOrder)) p.routing.accountOrder = []; return p.routing; };
  const orderOf = p => routingOf(p).accountOrder;
  const orderedAccounts = p => { const accs = p.accounts || []; const order = orderOf(p); return order.map(id => accs.find(x => x.id === id)).filter(Boolean).concat(accs.filter(x => !order.includes(x.id))); };
  /* The account tried first: the highest-priority account that is signed in and in use. */
  const usedFirst = p => orderedAccounts(p).find(inUse);
  const defaultAccount = usedFirst;
  const routeStatus = r => r.status === 'active' ? 'Ready' : r.status === 'attention' ? 'Needs attention' : 'Off';
  const routesOn = () => routes().filter(r => r.enabled).length;
  const planText = m => PLAN_TEXT[m.plan] || m.plan || '';
  const countText = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const ordinal = n => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][n - 1] || `#${n}`;
  const accKey = (p, acc) => `acc-${p.id}-${acc.id}`;
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const example = (title, message) => PM51.toast(title, message || 'Example data only. Nothing was installed, sent, or changed outside this preview.', 'info');
  const muted = text => `<span class="pm51-row-value is-muted">${h(text)}</span>`;
  const keyWays = p => (p.signIn || []).filter(s => s[0] === 'apikey');
  const keyOnly = p => (p.signIn || []).length > 0 && (p.signIn || []).every(s => s[0] === 'apikey');
  /* An account that signs in with a key (a plan credential or a pay-as-you-go key), not a browser sign-in. */
  const isKeyAccount = (p, acc) => p.keyOnlyFor ? PM51.scopedValue(acc, 'ai.accounts.codex-auth-family') === p.keyOnlyFor : (keyOnly(p) || /key|credential/i.test(String(acc.method || '')));
  const accKeySetting = (p, acc) => p.key && isKeyAccount(p, acc) ? p.key : '';
  const opencodeOn = () => PM51.value('ai.accounts.opencode-enable') === true || PM51.value('ai.accounts.opencode-enable') === 'on';

  function statusLabelFor(p) {
    const base = plain(p);
    if (p.id === 'free-models') return base === 'Off' ? base : `${base} · ${routesOn()} of ${routes().length} routes on`;
    const n = activeAccounts(p).length;
    if (base === 'Ready' && n) return `${base} · ${countText(n, 'account')}`;
    if (base === 'Needs attention' && p.id === 'github-copilot') return 'Needs a Copilot seat';
    return base;
  }
  function syncFree() {
    const p = find('free-models'); if (!p) return;
    p.statusLabel = statusLabelFor(p);
  }
  /* Pure derivations: account order, "used first", default account, default model, the catalog's enabled union over
     signed-in accounts that are in use, and readiness. Never touches p.status (recompute does). */
  function derive(p) {
    if (p.id === 'free-models') { syncFree(); return; }
    const r = p.readiness || (p.readiness = { installed: !!p.installed, signedIn: !!p.signedIn, accountChosen: false, modelsReady: false });
    const routing = routingOf(p);
    const accs = p.accounts || [];
    const ids = accs.map(x => x.id);
    routing.accountOrder = routing.accountOrder.filter((id, i, arr) => ids.includes(id) && arr.indexOf(id) === i);
    ids.forEach(id => { if (!routing.accountOrder.includes(id)) routing.accountOrder.push(id); });
    const active = activeAccounts(p);
    const first = usedFirst(p);
    accs.forEach(x => { x.default = !!first && x.id === first.id; });
    p.defaultAccount = first ? first.id : '';
    if (accs.length) (p.models || []).forEach(m => { m.enabled = active.some(x => accModelOn(x, m.id)); });
    const firstDefault = first && first.defaultModel && accModelOn(first, first.defaultModel) ? first.defaultModel : '';
    routing.defaultModel = firstDefault || (enabledModels(p)[0] || {}).id || '';
    p.signedIn = accs.some(x => x.active);
    r.signedIn = p.signedIn;
    r.accountChosen = p.kind === 'URL' ? true : active.length > 0;
    r.modelsReady = accs.length ? active.some(x => !seatless(x) && accEnabled(p, x).length > 0) : (p.signedIn && enabledModels(p).length > 0);
  }
  function recompute(p) {
    if (p.id === 'free-models') { syncFree(); return; }
    derive(p);
    const r = p.readiness;
    if (p.id === 'opencode' && !opencodeOn()) { if (p.status !== 'disabled') p.prevStatus = p.status; p.status = 'disabled'; }
    if (p.status !== 'disabled') {
      if (!r.installed) { p.status = p.kind === 'CLI' ? 'not-installed' : 'setup'; p.nextAction = p.kind === 'CLI' ? 'install' : p.kind === 'Server' ? 'attach' : p.nextAction; }
      else if (!p.signedIn) { p.status = (p.accounts || []).length ? 'attention' : 'setup'; p.nextAction = p.kind === 'URL' ? 'address' : keyOnly(p) ? 'apikey' : 'signin'; }
      else if (!r.accountChosen || !r.modelsReady) { p.status = 'attention'; p.nextAction = 'addaccount'; }
      else { p.status = 'active'; p.nextAction = 'addaccount'; }
    }
    p.statusLabel = statusLabelFor(p);
  }

  /* ---------- persisted-state migration ------------------------------------ */
  /* Older saved states carry string usage, provider-level model choices, the old three routing controls and only 13
     services. Strings become { text, windows: {} } (usage numbers are never invented), accounts without their own model
     list get a copy of the provider catalog, the old "When an account runs out" / "Allow paid overage" / "Usage
     boundary" become one "When it runs out" choice, services the fixture has and the saved list lacks are added in
     fixture order, and the fixture's names and groups replace the old ones. Runs at load and inside ensureStateShape. */
  const OLD_EXHAUSTION = { 'Try next eligible account, then fallback route': 'next-account', 'Use fallback route': 'next-service', 'Try the next free route': 'next-route', 'Stop and ask me': 'ask' };
  const DESCRIBE = ['name', 'product', 'connect', 'bill', 'vendor', 'pair', 'pairNote', 'key', 'keyOnlyFor', 'app', 'gcp', 'overage', 'regions', 'help'];
  function migrateAccount(p, acc) {
    if (!acc || typeof acc !== 'object') return;
    if (!acc.usage || typeof acc.usage !== 'object' || Array.isArray(acc.usage)) acc.usage = { text: typeof acc.usage === 'string' ? acc.usage : '', windows: {} };
    if (typeof acc.usage.text !== 'string') acc.usage.text = acc.usage.text == null ? '' : String(acc.usage.text);
    if (!acc.usage.windows || typeof acc.usage.windows !== 'object' || Array.isArray(acc.usage.windows)) acc.usage.windows = {};
    if (!Array.isArray(acc.models)) acc.models = (p.models || []).map(m => ({ id: m.id, enabled: !!m.enabled }));
    if (typeof acc.defaultModel !== 'string') { const want = (p.routing || {}).defaultModel; acc.defaultModel = accModelOn(acc, want) ? want : ((acc.models.find(m => m.enabled) || {}).id || ''); }
    if (!acc.props || typeof acc.props !== 'object' || Array.isArray(acc.props)) acc.props = {};
    if (p.regions && !p.regions.includes(acc.region)) acc.region = p.regions[0];
  }
  function migrateProvider(p) {
    if (!p || typeof p !== 'object') return;
    const fx = ((D && D.providers) || []).find(x => x.id === p.id);
    if (fx) {
      DESCRIBE.forEach(k => { if (fx[k] === undefined) delete p[k]; else p[k] = clone(fx[k]); });
      if (fx.kind !== p.kind) { p.kind = fx.kind; p.signIn = clone(fx.signIn); p.installed = fx.installed; p.readiness = Object.assign({}, p.readiness || {}, { installed: fx.readiness.installed }); p.installSource = fx.installSource; p.version = fx.version; if (p.status === 'not-installed') p.status = fx.status; }
      else if (JSON.stringify(fx.signIn) !== JSON.stringify(p.signIn)) p.signIn = clone(fx.signIn);
    }
    const routing = routingOf(p);
    if (OLD_EXHAUSTION[routing.exhaustion]) routing.exhaustion = OLD_EXHAUSTION[routing.exhaustion];
    if (routing.paidOverage) routing.exhaustion = 'overage';
    delete routing.paidOverage; delete routing.usageBoundary; delete p.advancedFields; delete p.advancedValues;
    if (!RUNS_OUT[routing.exhaustion]) routing.exhaustion = p.id === 'free-models' ? 'next-route' : 'next-service';
    if (!p.props || typeof p.props !== 'object' || Array.isArray(p.props)) p.props = {};
    if (!p.windows || typeof p.windows !== 'object' || Array.isArray(p.windows)) p.windows = fx && fx.windows && typeof fx.windows === 'object' ? clone(fx.windows) : {};
    (p.accounts || []).forEach(acc => migrateAccount(p, acc));
    derive(p);
  }
  function migrate() {
    if (!Array.isArray(state.providers)) return;
    const fixture = (D && D.providers) || [];
    const have = new Set(state.providers.map(p => p.id));
    fixture.forEach(fx => { if (!have.has(fx.id)) state.providers.push(clone(fx)); });
    const order = fixture.map(p => p.id);
    state.providers.sort((x, y) => (order.includes(x.id) ? order.indexOf(x.id) : 1e3) - (order.includes(y.id) ? order.indexOf(y.id) : 1e3));
    state.providers.forEach(migrateProvider);
    const oc = find('opencode'); if (oc) recompute(oc);
  }
  const pm51ProvidersEnsureStateShape = ensureStateShape;
  ensureStateShape = function () { const r = pm51ProvidersEnsureStateShape.apply(this, arguments); try { migrate(); } catch (e) { /* never block boot on a fixture shape */ } return r; };
  migrate();
  /* The Settings Home "AI Providers" line counts the real list, not a fixed "7 ready". */
  window.O55ProviderSummary = () => {
    const ready = all().filter(p => plain(p) === 'Ready').length, attention = all().filter(p => /^Needs/.test(plain(p))).length;
    return `${ready} ready${attention ? ` · ${attention} need${attention === 1 ? 's' : ''} attention` : ''}`;
  };

  /* ---------- pieces ------------------------------------------------------ */
  function primaryFor(p) {
    const data = { provider: p.id };
    if (p.status === 'disabled') return { label: 'Turn on', icon: 'play', action: 'pm51-providers-turn-on', data };
    switch (p.nextAction) {
      case 'install': return { label: 'Install', icon: 'download', action: 'pm51-providers-install', data };
      case 'signin': return { label: 'Sign In', icon: 'user', action: 'pm51-providers-signin', data };
      case 'apikey': return { label: 'Enter API Key', icon: 'key', action: 'pm51-providers-apikey', data };
      case 'attach': return { label: 'Set up server', icon: 'server', action: 'pm51-providers-signin', data };
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
  /* One line of whole-list actions under the summary: each is a real inventory action, drawn where it is used. */
  function toolbar() {
    return `<div class="o55-toolbar o55-providers-tools">${PM51.bound.action('ai.usage.provider-health', { label: 'Check every service', icon: 'test' })}${PM51.bound.action('ai.usage.refresh-models', { label: 'Refresh model lists', icon: 'refresh' })}${PM51.bound.action('system.advanced.binary-rescan', { label: 'Find installed apps again', icon: 'search' })}</div>`;
  }

  /* Readiness is four separate truths. When all four hold it is one calm line; otherwise the steps, with the next one
     carrying the only action. */
  function readiness(p) {
    const r = p.readiness || {};
    const cli = p.kind === 'CLI', server = p.kind === 'Server', free = p.id === 'free-models', url = p.kind === 'URL';
    const off = p.status === 'disabled';
    const acc = defaultAccount(p), active = activeAccounts(p);
    const can = !off && r.installed && (r.signedIn || (url && p.address));
    const check = PM51.btn({ label: 'Check connection', icon: 'test', small: true, action: 'pm51-providers-check', data: { provider: p.id }, disabled: !can, reason: off ? 'Turn the service on first.' : !r.installed ? (cli ? 'Install it first.' : 'Set it up first.') : url ? 'Enter the address first.' : 'Sign in first.' });
    if (free) {
      return PM51.section({ title: 'Status', help: `${routesOn()} of ${routes().length} free routes are on. Checked ${p.lastCheck || 'not yet'}.`, action: check });
    }
    const allDone = !off && r.installed && r.signedIn && r.accountChosen && r.modelsReady;
    if (allDone) {
      const chips = [
        cli ? `Installed ${p.version || ''}`.trim() : server ? 'Server reachable' : 'Nothing to install',
        url ? `Reaches ${p.address || 'the endpoint'}` : `Signed in${acc ? ' as ' + acc.identity : ''}`,
        url ? 'No account needed' : `${countText(active.length, 'account')} in use`,
        `${countText(enabledModels(p).length, 'model')} ready`
      ];
      return `<div class="o55-ready-strip" role="list">${chips.map(c => `<span class="o55-ready-chip" role="listitem">${icon('check')}<span>${h(c)}</span></span>`).join('')}<span class="o55-ready-end"><span class="o55-ready-when">Checked ${h(p.lastCheck || 'not yet')}</span>${check}</span></div>`;
    }
    const next = off ? null : !r.installed ? 'install' : !r.signedIn ? 'signin' : !r.accountChosen ? 'account' : !r.modelsReady ? 'models' : null;
    const signInWays = (p.signIn || []).map(s => s[1]);
    const installDesc = cli ? (r.installed ? `Version ${p.version} is installed on your server.` : 'Puppet Master installs it on your server, only from the official provider, and only when you choose Install.')
      : server ? (r.installed ? 'A server is reachable.' : 'Let Puppet Master run one, or use a server you already run.')
      : 'Nothing to install.';
    const signInDesc = url ? (r.signedIn ? `Reaches ${p.address || 'the endpoint'}.` : 'Enter the address of the model server on your network.')
      : r.signedIn ? `Signed in${acc ? ' as ' + acc.identity : ''}.`
      : keyOnly(p) ? 'Paste a key from the provider\'s website. It is kept in your server\'s keychain.'
      : signInWays.length > 1 ? `${signInWays.slice(0, -1).join(', ')}, or ${signInWays.slice(-1)[0].toLowerCase()}.` : `${signInWays[0] || 'Sign in'}.`;
    const accountDesc = url ? 'No account needed.'
      : r.accountChosen && acc ? `${acc.nickname} is used first.${active.length > 1 ? ' The others take over when it runs out.' : ''}`
      : (p.accounts || []).length ? 'Turn on an account below, or sign in to one again.'
      : 'Appears once you sign in. You can add more accounts later.';
    const modelsDesc = r.modelsReady ? `${countText(enabledModels(p).length, 'model')} ready.`
      : p.id === 'github-copilot' ? 'This GitHub account has no Copilot seat, so no models can run.'
      : r.signedIn && (p.models || []).length ? 'Turn on at least one model in an account below.'
      : url ? 'Puppet Master asks the server which models it has.'
      : 'Appear by themselves after you sign in.';
    const steps = [
      cli || server ? { title: cli ? 'Install' : 'Server', desc: installDesc, done: !!r.installed, status: next === 'install' ? 'Next' : '', tone: 'info' } : null,
      { title: url ? 'Address' : keyOnly(p) ? 'API key' : 'Sign in', desc: signInDesc, done: !!r.signedIn, status: next === 'signin' ? 'Next' : '', tone: 'info' },
      url ? null : { title: 'Account in use', desc: accountDesc, done: !!r.accountChosen, status: next === 'account' ? 'Next' : '', tone: 'info' },
      { title: 'Models', desc: modelsDesc, done: !!r.modelsReady, status: next === 'models' ? 'Next' : '', tone: 'info' }
    ].filter(Boolean);
    return PM51.section({
      title: off ? 'This service is off' : 'Getting it ready', help: off ? 'Nothing is sent to it. Its accounts and choices are kept.' : `${steps.length === 4 ? 'Four' : 'Three'} separate checks. Each one turns green by itself; the button at the top does the next step.`, action: off || !can ? undefined : check,
      body: off ? '' : PM51.steps(steps.map(s => s.done ? Object.assign({}, s, { status: '', tone: undefined }) : s))
    });
  }

  /* "Claude plan, not the Anthropic API": the billing sibling, one click away. */
  function pairLine(p) {
    if (!p.pairNote) return '';
    const sib = p.pair && find(p.pair);
    const go = sib ? `<button type="button" class="o55-textbtn" data-action="pm51-providers-open" data-provider="${a(sib.id)}"><span>${h(sib.bill === 'use' ? 'Paying by use instead? ' : 'Have the plan instead? ')}${h(sib.name)}</span>${icon('arrowRight')}</button>` : '';
    return `<div class="o55-pair">${icon('info')}<span class="o55-pair-text">${h(p.pairNote)}</span>${go}</div>`;
  }

  /* ---------- accounts ------------------------------------------------------ */
  function accStatus(acc) {
    if (!acc.active) return ['Needs sign-in', 'attention'];
    if (acc.enabled === false) return ['Not in use', 'off'];
    if (seatless(acc)) return ['Needs a seat', 'attention'];
    if (limitHit(acc)) return ['Limit reached', 'blocked'];
    const health = String(acc.health || '').trim();
    if (health && !/^(healthy|ready|ok)$/i.test(health)) return [health, 'attention'];
    return ['Ready', 'ready'];
  }
  function accNote(acc, label) {
    const health = String(acc.health || '').trim();
    if (!health || /^(healthy|ready|ok)$/i.test(health) || health.toLowerCase() === String(label).toLowerCase()) return '';
    return health;
  }
  function metersFor(p, acc) {
    const keys = windowKeys(p), w = usage(acc).windows || {};
    const present = keys.filter(k => w[k] && typeof w[k] === 'object' && w[k].pct != null);
    if (present.length) return present.map(k => PM51.meter({ label: windowLabel(p, k), pct: w[k].pct, reset: w[k].reset || '' })).join('');
    const text = usage(acc).text || (keys.length ? 'Usage not reported yet' : 'Usage appears after sign-in');
    return `<span class="pm51-acc-usage">${h(text)}</span>`;
  }
  function moveBtn(p, acc, dir, disabled, reason) {
    const label = dir < 0 ? 'Move up' : 'Move down';
    return `<button type="button" class="icon-btn pm51-icon-btn" data-action="pm51-providers-account-move" data-provider="${a(p.id)}" data-account="${a(acc.id)}" data-dir="${dir}" aria-label="${a(label)}" data-pm-hover-label="${a(label)}"${disabled ? ` aria-disabled="true" data-disabled-reason="${a(reason)}" data-pm-hover-detail="${a(reason)}"` : ''}>${icon(dir < 0 ? 'up' : 'down')}</button>`;
  }
  function priorityControls(p, acc, i, n) {
    if (n < 2) return '';
    return `<span class="pm51-providers-order">${moveBtn(p, acc, -1, i === 0, 'Already first')}${moveBtn(p, acc, 1, i === n - 1, 'Already last')}</span>`;
  }
  const accountReady = (p, acc) => p.status !== 'disabled' && !!(p.readiness || {}).installed && inUse(acc) && !seatless(acc);
  function modelWaitFor(p, acc) {
    if (p.status === 'disabled') return 'Turn the service on first';
    if (!(p.readiness || {}).installed) return p.kind === 'CLI' ? 'After install' : 'After setup';
    if (!acc.active) return 'After sign-in';
    if (acc.enabled === false) return 'Turn the account on first';
    if (seatless(acc)) return 'Needs a seat';
    return 'After setup';
  }
  function modelsBody(p, acc) {
    const catalog = p.models || [];
    const data = { provider: p.id, account: acc.id };
    if (!catalog.length) return PM51.note((p.readiness || {}).installed ? 'Models appear here after sign-in.' : 'Models appear here after you install and sign in.');
    if (!accountReady(p, acc)) return `<div class="pm51-row-value is-muted o55-acc-wait">${h(modelWaitFor(p, acc))}</div>`;
    const on = accEnabled(p, acc);
    const rows = [{ label: 'Default model', help: 'Used unless a job or a Goal picks another.', control: on.length ? PM51.dropdown(acc.defaultModel, on.map(m => [m.id, m.name]), { action: 'pm51-providers-account-model-default', data, label: 'Default model' }) : muted('Turn on a model first') }];
    catalog.forEach(m => {
      const am = accModel(acc, m.id);
      rows.push({
        label: m.name, help: `${planText(m)}${m.context && m.context !== 'N/A' && m.context !== 'Unknown' ? ' · ' + m.context + ' context' : ''}`,
        control: am ? PM51.toggle(!!am.enabled, { action: 'pm51-providers-account-model', data: { provider: p.id, account: acc.id, model: m.id }, label: m.name }) : muted('Not on this account')
      });
    });
    return PM51.rows(rows);
  }
  const group = (title, body, help) => body ? `<div class="o55-acc-group"><div class="o55-acc-group-head"><h4>${h(title)}</h4>${help ? `<p>${h(help)}</p>` : ''}</div>${body}</div>` : '';
  /* The key line: the only place a service's key is changed, and the home of its inventory row. */
  function keyLine(p, acc) {
    const id = accKeySetting(p, acc);
    return `<div class="setting-row o55-row o55-scoped o55-keyrow"${id ? ` data-setting-id="${a(id)}"` : ''}>
      <div class="setting-copy"><div class="setting-label">API key</div><div class="setting-description">Kept in your server's keychain. Never shown again.</div></div>
      <div class="setting-control"><span class="o55-key is-saved"><span class="o55-key-state">${icon('lock')}<span>Saved</span></span><button type="button" class="btn small" data-action="pm51-providers-apikey" data-provider="${a(p.id)}" data-account="${a(acc.id)}">${icon('refresh')}<span>Replace key</span></button></span></div>
      ${id ? `<button type="button" class="icon-btn details-btn o55-about" data-action="setting-details" data-setting="${a(id)}" aria-label="About the API key">${icon('help')}</button>` : '<span></span>'}
    </div>`;
  }
  function plainRow(label, help, control, cls) {
    return `<div class="setting-row o55-row o55-scoped${cls ? ' ' + cls : ''}"><div class="setting-copy"><div class="setting-label">${h(label)}</div>${help ? `<div class="setting-description">${h(help)}</div>` : ''}</div><div class="setting-control">${control}</div><span></span></div>`;
  }
  function accountBody(p, acc) {
    const data = { provider: p.id, account: acc.id };
    const v = id => PM51.scopedValue(acc, id);
    const opt = { scope: ACC, data };
    const key = isKeyAccount(p, acc);
    const about = [
      PM51.scoped.row('ai.accounts.account-name', acc.nickname, Object.assign({}, opt, { label: 'Nickname', help: 'Only the name shown in Puppet Master.', noChanged: true })),
      PM51.scoped.row('ai.accounts.account-enabled', acc.enabled !== false, Object.assign({}, opt, { label: 'Use this account', help: 'Off keeps it signed in and saved, but work skips it.' })),
      p.id === 'claude-code' ? PM51.scoped.row('ai.accounts.claude-login-method', v('ai.accounts.claude-login-method'), Object.assign({}, opt, { label: 'How it signs in', help: 'Choosing another way opens that sign-in.' })) : '',
      p.id === 'openai-codex' ? PM51.scoped.row('ai.accounts.codex-auth-family', v('ai.accounts.codex-auth-family'), Object.assign({}, opt, { label: 'Kind of account', help: 'Set when the account was added. Add another account for the other kind.', control: `<span class="o55-readout">${PM51.status(PM51.valueLabel('ai.accounts.codex-auth-family', v('ai.accounts.codex-auth-family')), 'info')}</span>` })) : '',
      p.regions ? plainRow('Region', 'Where this plan was bought.', PM51.dropdown(acc.region || p.regions[0], p.regions, { action: 'pm51-providers-account-region', data, label: 'Region' })) : '',
      p.gcp ? PM51.scoped.row('ai.accounts.gcp-project-id', v('ai.accounts.gcp-project-id'), Object.assign({}, opt, { label: 'Google Cloud project', help: 'The project that is billed and whose quota applies.' })) : '',
      key ? keyLine(p, acc) : '',
      PM51.scoped.row('ai.accounts.account-roles', v('ai.accounts.account-roles'), Object.assign({}, opt, { label: 'Jobs it may do', help: 'None picked means any job. Keep a costly account off routine work.' })),
      PM51.scoped.row('ai.accounts.billing-entity', v('ai.accounts.billing-entity'), Object.assign({}, opt, { label: 'Who is billed', help: 'Costs on the Usage page are grouped by this.' }))
    ];
    const low = PM51.scoped.fields([
      PM51.scoped.field('ai.accounts.account-threshold-override', v('ai.accounts.account-threshold-override'), Object.assign({}, opt, { label: 'Switch when this much is left' })),
      PM51.scoped.field('ai.accounts.switch-mode-override', v('ai.accounts.switch-mode-override'), Object.assign({}, opt, { label: 'Sharing work with other accounts' })),
      PM51.scoped.field('ai.accounts.cooldown-policy', v('ai.accounts.cooldown-policy'), Object.assign({}, opt, { label: 'Rest after a rate limit' })),
      PM51.scoped.field('ai.accounts.retry-budget', v('ai.accounts.retry-budget'), Object.assign({}, opt, { label: 'Retries before it rests' }))
    ]);
    const tech = PM51.scoped.fields([
      PM51.scoped.field('ai.accounts.auth-family', v('ai.accounts.auth-family'), Object.assign({}, opt, { label: 'Account type' })),
      PM51.scoped.field('ai.accounts.quota-profile', v('ai.accounts.quota-profile'), Object.assign({}, opt, { label: 'Quota profile' })),
      key ? PM51.scoped.field('ai.accounts.credential-storage', v('ai.accounts.credential-storage'), Object.assign({}, opt, { label: 'Where the key is kept' })) : '',
      key ? PM51.scoped.field('ai.accounts.auth-surface', v('ai.accounts.auth-surface'), Object.assign({}, opt, { label: 'How the key is sent' })) : ''
    ]);
    const actions = '<div class="pm51-providers-acc-actions">'
      + (inUse(acc) ? `<span class="o55-bound" data-setting-id="ai.accounts.set-preferred-account">${PM51.btn({ label: 'Use for the next run', icon: 'pin', small: true, action: 'pm51-providers-account-next', data })}</span>` : '')
      + PM51.btn({ label: acc.active ? 'Sign out' : 'Sign in again', icon: acc.active ? 'lock' : 'user', small: true, action: acc.active ? 'pm51-providers-account-signout' : 'pm51-providers-account-signin', data })
      + PM51.btn({ label: 'Remove', icon: 'trash', small: true, danger: true, action: 'pm51-providers-account-remove', data })
      + '</div>';
    return group('Models on this account', modelsBody(p, acc))
      + group('This account', PM51.scoped.rows(about))
      + group('When it runs low', low, 'Only for this account. The shared rules are under Limits & switching.')
      + group('For experts', tech)
      + actions;
  }
  function accountItem(p, acc, i, n) {
    const [label, toneName] = accStatus(acc);
    const first = usedFirst(p);
    return {
      id: accKey(p, acc), badge: PM51.order(i + 1),
      title: acc.nickname, tag: first && first.id === acc.id ? PM51.tag('Used first') : '',
      meta: `${acc.identity} · ${acc.method}${acc.region && p.regions ? ' · ' + acc.region : ''}`,
      note: accNote(acc, label),
      status: PM51.status(label, toneName),
      meters: metersFor(p, acc),
      controls: priorityControls(p, acc, i, n),
      body: accountBody(p, acc),
      data: { account: acc.id }
    };
  }
  function accountsSection(p) {
    if (p.id === 'free-models' || p.kind === 'URL') return '';
    const data = { provider: p.id };
    const accs = orderedAccounts(p);
    const items = accs.map((acc, i) => accountItem(p, acc, i, accs.length));
    if (!items.length && p.kind === 'Server') return '';
    /* The service's key row lives on its key: in the key account, else on "add a key" (a plan that also takes a
       key), else on the empty note under the header's Enter API Key. */
    const needKeyHome = !!p.key && !accs.some(acc => accKeySetting(p, acc));
    const keyButton = needKeyHome && items.length && keyWays(p).length
      ? `<div class="o55-empty-key" data-setting-id="${a(p.key)}">${PM51.btn({ label: keyWays(p)[0][1], icon: 'key', small: true, action: 'pm51-providers-apikey', data })}<span class="o55-empty-key-text">A separate account with its own bill. The key is kept in your server's keychain and never shown again.</span></div>` : '';
    const note = PM51.note(p.readiness.installed ? (keyOnly(p) ? 'No accounts yet. Enter API Key at the top adds the first one.' : 'No accounts yet. Signing in adds the first one.') : 'Accounts appear here after you install and sign in.');
    const body = items.length ? PM51.home('ai.accounts.account-priority', PM51.accordion(items, { cls: 'pm51-providers-acc' })) + keyButton : (needKeyHome ? PM51.home(p.key, note) : note);
    const help = items.length > 1 ? 'Tried from the top. When the first runs out, the next one takes over. Use the arrows to change the order.' : items.length === 1 ? 'Add another account to keep working when this one runs out.' : undefined;
    return PM51.section({ title: 'Accounts', help, action: items.length && p.signIn && p.signIn.length ? { label: 'Add account', icon: 'plus', small: true, action: 'pm51-providers-add-account', data } : undefined, body });
  }

  /* ---------- this service -------------------------------------------------- */
  function runsOutChoices(p) {
    if (p.id === 'free-models') return ['next-route', 'ask'];
    return ['next-account', 'next-service', 'ask'].concat(p.overage ? ['overage'] : []);
  }
  function serviceSection(p) {
    const data = { provider: p.id };
    const routing = routingOf(p);
    const choices = runsOutChoices(p);
    const cur = choices.includes(routing.exhaustion) ? routing.exhaustion : choices[0];
    const auto = PM51.value('ai.accounts.multi-account-switching');
    const rows = [
      p.id === 'opencode' ? PM51.bound.row('ai.accounts.opencode-enable', { label: 'Use OpenCode', help: 'Off hides its servers and models.' })
        : PM51.scoped.row('ai.models.provider-enabled', p.status !== 'disabled', { scope: SVC, data, label: 'Use this service', help: 'Off sends it nothing new. Accounts and choices are kept.' }),
      p.id === 'github-copilot' ? plainRow('Copilot plan', 'Separate from the GitHub account you use for your code.', PM51.dropdown(p.entitlement || 'Individual', ['Individual', 'Organization', 'Enterprise'], { action: 'pm51-providers-entitlement', data, label: 'Copilot plan' })) : '',
      plainRow('When it runs out', (RUNS_OUT[cur] || [])[1] + (auto === false && cur === 'next-account' ? ' Automatic switching is off, so work stops and asks.' : ''), PM51.dropdown(cur, choices.map(c => ({ value: c, label: RUNS_OUT[c][0], meta: RUNS_OUT[c][1] })), { action: 'pm51-providers-exhaustion', data, label: 'When it runs out' })),
      p.id === 'free-models' ? PM51.bound.row('ai.usage.free-models-auto-apply', { label: 'Add newly free models by themselves', help: 'The list follows the community free-coding-models list.' }) : ''
    ];
    return PM51.section({ title: 'This service', body: PM51.scoped.rows(rows) });
  }

  function routesSection() {
    const items = routes().map(r => ({
      title: routeName(r), pill: PM51.status(routeStatus(r)),
      meta: r.enabled ? `${r.models.length ? r.models.join(', ') : 'No models yet'} · ${r.limit}` : `Off · ${r.limit}`,
      note: r.status === 'attention' ? r.signIn : '',
      end: PM51.toggle(!!r.enabled, { action: 'pm51-providers-route-toggle', data: { route: r.id }, label: routeName(r) }),
      action: 'pm51-providers-route', data: { route: r.id }
    }));
    return PM51.section({ title: 'Free routes', help: 'Each route signs in with its own service. Limits can change without notice, so they are tried in this order.', body: PM51.list(items) });
  }

  /* OpenCode on your computer: the server itself. Its sign-in is the server's; model plans (Go, Zen) are separate. */
  function serverSection(p) {
    const controls = PM51.home('ai.accounts.opencode-server-actions', `<div class="o55-inline-actions">${[['Reconnect', 'refresh', 'reconnect'], ['Restart', 'refresh', 'restart'], ['Refresh model list', 'layers', 'discovery'], ['Stop managing it', 'minus', 'detach']].map(([label, ic, what]) => PM51.btn({ label, icon: ic, small: true, action: 'pm51-providers-opencode-control', data: { what } })).join('')}</div>`, 'div', 'o55-home-inline');
    return PM51.section({
      title: 'Server', help: 'The OpenCode server has its own sign-in. Model plans such as OpenCode Go and Zen are separate services.',
      action: PM51.bound.action('ai.accounts.opencode-add-server', { label: 'Add a server', icon: 'plus' }),
      body: PM51.bound.rows(['ai.accounts.opencode-endpoint', 'ai.accounts.opencode-server-auth', 'ai.accounts.opencode-disable-cc-skills']) + plainRow('Server controls', 'Restart works only for a server Puppet Master runs.', controls, 'is-wide')
    });
  }

  function advancedSection(p) {
    const data = { provider: p.id };
    const methods = authModes(p);
    const rows = [
      methods.length > 2 ? PM51.scoped.row('ai.accounts.auth-mode', PM51.scopedValue(p, 'ai.accounts.auth-mode'), { scope: SVC, data, label: 'Preferred way to sign in', help: `Only the ways ${p.name} supports.`, choices: methods }) : '',
      p.app ? PM51.bound.row(p.app) : '',
      p.id === 'opencode' ? PM51.bound.row('ai.accounts.opencode-discovery-ttl') : '',
      p.id === 'opencode' ? PM51.bound.row('ai.accounts.opencode-cli-path') : ''
    ].filter(Boolean);
    const about = PM51.kv([
      ['Made by', p.vendor || '—'],
      ['Billed as', p.bill === 'plan' ? (p.product || 'A monthly plan') : p.bill === 'use' ? 'Pay as you go' : p.product || 'Free or your own'],
      ['Installed', p.kind === 'CLI' ? (p.version ? `Version ${p.version} · ${p.installSource}` : 'Not installed') : p.kind === 'Server' ? (p.installSource || 'Server') : 'Nothing to install'],
      ['Ways to sign in', (p.signIn || []).length ? p.signIn.map(s => s[1]).join(' · ') : 'No sign-in needed'],
      ['Usage windows', windowKeys(p).length ? windowKeys(p).map(k => windowLabel(p, k)).join(', ') : 'None reported'],
      ['Last check', p.lastCheck || 'Not checked']
    ]);
    const notes = (p.diagnostics || []).length ? PM51.kv(p.diagnostics.map((d, i) => [`Note ${i + 1}`, d])) : '';
    const tech = PM51.kv([
      ['Service id', p.id], ['Connects by', p.kind],
      ['Readiness', `installed ${yn(p.readiness.installed)} · signed in ${yn(p.readiness.signedIn)} · account in use ${yn(p.readiness.accountChosen)} · models ready ${yn(p.readiness.modelsReady)}`],
      ['Default model', routingOf(p).defaultModel ? modelName(p, routingOf(p).defaultModel) : 'None'],
      ['Account order', orderOf(p).length ? orderOf(p).join(' → ') : 'None']
    ]);
    return PM51.advanced([
      rows.length ? PM51.scoped.rows(rows) : '',
      PM51.section({ title: 'About this service', body: about + (notes ? notes : '') }),
      PM51.section({ title: 'Technical details', body: tech + '<div class="o55-inline-actions">' + PM51.btn({ label: 'Refresh model list', icon: 'refresh', small: true, action: 'pm51-providers-refresh-models', data }) + PM51.btn({ label: 'Export a report without keys', icon: 'download', small: true, action: 'pm51-providers-export', data }) + '</div>' })
    ].join(''));
  }
  const yn = v => v ? 'yes' : 'no';
  const SIGNIN_HELP = {
    'signin-claude': 'Browser sign-in with your Claude plan.', 'signin-sso': 'Your company sign-in page.', 'import-auth': 'Reuses a sign-in already on your server.',
    'signin-chatgpt': 'Browser sign-in with your ChatGPT plan.', apikey: 'Paste a key from the provider website.', 'signin-google': 'Browser sign-in with Google.', 'signin-browser': 'Browser sign-in.', 'signin-github': 'Browser sign-in with GitHub.',
    'signin-xai': 'Browser sign-in with your xAI account.', 'signin-meta': 'Browser sign-in with your Meta account.',
    'managed-server': 'Puppet Master runs the server for you.', 'attach-server': 'Point at a server you already run.', address: 'An address on your network.'
  };
  /* The inventory's sign-in methods a service actually has, for "Preferred way to sign in". */
  function authModes(p) {
    const keys = (p.signIn || []).map(s => s[0]);
    const out = ['provider-default'];
    if (keys.includes('apikey')) out.push('api-key');
    if (keys.some(k => /^signin-/.test(k))) out.push('oauth');
    if (keys.includes('import-auth')) out.push('session');
    return out;
  }

  function detailFor(p) {
    const special = p.id === 'free-models' ? routesSection() : p.id === 'opencode' ? serverSection(p) : '';
    return {
      title: p.name, pill: PM51.status(plain(p)), subtitle: [p.product, p.connect].filter(Boolean).join(' · '),
      primary: p.status === 'active' && p.nextAction === 'addaccount' ? null : primaryFor(p), menu: anchor => menuFor(p, anchor),
      body: [readiness(p), pairLine(p), accountsSection(p), special, serviceSection(p), advancedSection(p)].join('')
    };
  }

  function servicesTab() {
    if (!current()) return PM51.empty('No AI services yet', 'Add a service to get started.', { label: 'Add a service', action: 'pm51-providers-add', icon: 'plus' });
    const p = current();
    const split = PM51.listDetail({
      id: ID, rosterId: 'provider-roster', rosterTitle: 'AI services', count: all().length,
      add: { action: 'pm51-providers-add', label: 'Add a service' }, filter: { placeholder: 'Filter services' },
      selectAction: 'select-provider', groups: GROUPS,
      items: all().map(x => ({ id: x.id, title: x.name, meta: statusLabelFor(x), tone: tone(x), selected: x.id === p.id, group: x.bill || 'own', data: { provider: x.id } })),
      detail: detailFor(p)
    }).replace('<aside class="resource-roster pm51-roster"', '<aside data-setting-id="ai.accounts.provider-connections" class="resource-roster pm51-roster"');
    return stats() + toolbar() + split;
  }

  function render() {
    const tab = PM51.tab(ID, 'services');
    const body = tab === 'services' ? servicesTab() : `<p class="o55-quiet-line">${h(TAB_LEADS[tab] || '')}</p>`;
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'How AI services work', action: 'pm51-providers-help' }, { label: 'Check every service', action: 'pm51-providers-diagnostics' }, { label: 'Reset services to the example defaults', action: 'pm51-providers-reset' }] });
  }
  const TAB_LEADS = {
    models: 'Which model answers by default, and which one does each kind of job. Each account also has its own default model, under Services.',
    limits: 'What happens when an account or a service runs out. Each account can also have its own switch point, inside the account under Services.',
    usage: 'How much you are willing to spend, when to warn you, and what the Usage page shows.'
  };

  PM51.manager('providers', { render });
  /* The engine's select-provider handler swaps .resource-detail from a fresh renderProviders() call. */
  renderProviders = function () { return render(); };

  /* ---------- where rows live, for search and Details ------------------------ */
  PM51.owner(ID, id => {
    PM51.setTab(ID, (PM51.placement.byId[id] || {}).tab || PM51.tab(ID, 'services'));
    if (OWNER[id]) { state.selectedProvider = OWNER[id]; return; }
    if (id.startsWith('ai.accounts.opencode-')) { state.selectedProvider = 'opencode'; return; }
    if (ACCOUNT_IDS.includes(id) && !(current().accounts || []).length) state.selectedProvider = (all().find(p => (p.accounts || []).length) || current()).id;
  });
  const everyAccount = fn => () => all().flatMap(p => orderedAccounts(p).map((acc, i) => ({ name: `${p.name} · ${acc.nickname}`, value: fn(p, acc, i) })));
  ACCOUNT_IDS.filter(id => id !== 'ai.accounts.set-preferred-account').forEach(id => PM51.perValues(id, everyAccount((p, acc, i) =>
    id === 'ai.accounts.account-name' ? acc.nickname : id === 'ai.accounts.account-enabled' ? acc.enabled !== false : id === 'ai.accounts.account-priority' ? i + 1 : PM51.scopedValue(acc, id))));
  /* Model pickers offer the models on your signed-in accounts, after the inventory's examples. */
  const MODEL_PICKERS = ['ai.models.default-model', 'ai.models.overseer-model', 'ai.models.worker-model', 'ai.models.gui-worker-model', 'ai.models.high-effort-worker-model', 'ai.models.auditor-model', 'ai.models.goal-worker-model', 'ai.models.goal-verifier-model', 'ai.models.subagent-model', 'ai.models.teach-model', 'ai.models.thread-title-model'];
  const readyModels = () => all().filter(p => p.status === 'active').flatMap(p => enabledModels(p).map(m => ({ value: `${p.id}/${m.id}`, label: `${m.name} · ${p.name}`, meta: p.id === 'free-models' ? 'A free route' : `On your ${p.name} ${p.bill === 'use' ? 'account' : 'plan'}` })));
  MODEL_PICKERS.forEach(id => PM51.moreChoices(id, readyModels));
  PM51.perValues('ai.models.provider-enabled', () => all().filter(p => p.status !== 'setup' && p.status !== 'not-installed').map(p => ({ name: p.name, value: p.status !== 'disabled' })));
  PM51.perValues('ai.accounts.auth-mode', () => all().filter(p => authModes(p).length > 2).map(p => ({ name: p.name, value: PM51.scopedValue(p, 'ai.accounts.auth-mode') })));

  PM51.scopedSetter(ACC, (id, value, el) => {
    const [p, acc] = acct(el); if (!acc) return '';
    if (id === 'ai.accounts.account-name') {
      const v = String(value || '').trim(); if (!v) return acc.nickname;
      acc.nickname = v; saveState();
      const t = el.closest('.pm51-acc-item')?.querySelector('.pm51-acc-title'); if (t && t.firstChild && t.firstChild.nodeType === 3) t.firstChild.nodeValue = v;
      return v;
    }
    if (id === 'ai.accounts.account-enabled') { acc.enabled = !!value; recompute(p); save(); return acc.nickname; }
    acc.props[id] = value; saveState();
    if (id === 'ai.accounts.claude-login-method') {
      const way = { sso: 'signin-sso', claudeai: 'signin-claude', email: 'signin-claude', console: 'signin-console' }[value];
      window.setTimeout(() => signInPanel(p, way, `Sign in ${acc.nickname} again`), 260);
    }
    return acc.nickname;
  });
  PM51.scopedSetter(SVC, (id, value, el) => {
    const p = prov(el);
    if (id === 'ai.models.provider-enabled') { if (value) turnOn(p, true); else turnOff(p, true); return p.name; }
    p.props[id] = value; saveState(); return p.name;
  });
  /* OpenCode's own switch is an inventory row; the service's state follows it. */
  PM51.watch('ai.accounts.opencode-enable', () => { const p = find('opencode'); if (!p) return; if (opencodeOn()) { p.status = p.prevStatus && p.prevStatus !== 'disabled' ? p.prevStatus : 'setup'; delete p.prevStatus; } recompute(p); save(); });
  PM51.watch('ai.accounts.multi-account-switching', () => PM51.refresh(ID, { swap: false }));

  /* ---------- menus & panels ---------------------------------------------- */
  function menuFor(p, anchor) {
    PM51.menu(anchor, [
      { label: 'Add account', icon: 'plus', onClick: () => signInFlow(p, anchor, `Add an account to ${p.name}`), ariaDisabled: p.id === 'free-models' || p.kind === 'URL' || !(p.signIn || []).length, meta: p.id === 'free-models' || p.kind === 'URL' ? 'No account needed' : !(p.signIn || []).length ? 'No sign-in of its own' : '' },
      { label: 'Check connection', icon: 'test', onClick: () => checkPanel(p) },
      { separator: true },
      { label: 'Remove from this list', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${p.name}?`, 'Puppet Master forgets its accounts and models. It comes back with Reset services.', 'Remove', () => { state.providers = all().filter(x => x.id !== p.id); state.selectedProvider = all()[0]?.id || null; save(); PM51.toast('Service removed', `${p.name} is gone from this list.`); }, true) }
    ], p.name);
  }
  function turnOff(p, quiet) { p.prevStatus = p.status; p.status = 'disabled'; p.statusLabel = statusLabelFor(p); save(); if (!quiet) PM51.toast(`${p.name} is off`, 'Nothing new is sent to it. Accounts and sign-ins are kept.'); }
  function turnOn(p, quiet) {
    if (p.id === 'opencode') { if (commitSettingValue('ai.accounts.opencode-enable', true)) { saveState(); o55Notify('ai.accounts.opencode-enable', true); } return; }
    p.status = p.prevStatus && p.prevStatus !== 'disabled' ? p.prevStatus : 'setup'; delete p.prevStatus; recompute(p); save(); if (!quiet) PM51.toast(`${p.name} is on`, statusLabelFor(p));
  }

  function browserPanel(p, title, service) {
    PM51.panel({
      title, subtitle: `${p.name} · browser sign-in`, icon: 'user',
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
        title: label, subtitle: `${p.name} · company sign-in`, icon: 'users',
        body: PM51.panelSection('Company sign-in', PM51.field('Sign-in address', PM51.input('', { placeholder: 'https://sso.example.com', label: 'Sign-in address' }), 'Ask your IT team if you are not sure.')) + PM51.panelSection('What happens', PM51.steps([{ title: 'Your company sign-in page opens', desc: 'In a browser window.' }, { title: 'Come back here', desc: 'The account appears under Accounts.' }])),
        primaryLabel: 'Continue', onPrimary: () => example('Sign-in requested', 'Example data only. No browser was opened in this preview.')
      });
      case 'import-auth': return PM51.panel({
        title: label, subtitle: `If you already signed in to ${p.name} on your server, Puppet Master can reuse that sign-in.`, icon: 'download',
        body: PM51.panelSection('What is used', PM51.kv([['Sign-in', 'The existing session on your server'], ['Password', 'Never read or copied'], ['Where it stays', 'Where the service keeps it on your server']])) + PM51.note('Puppet Master checks the sign-in still works before using it.'),
        primaryLabel: 'Use this sign-in', onPrimary: () => example('Sign-in requested', 'Example data only. Nothing was read in this preview.')
      });
      case 'managed-server': return PM51.panel({
        title: label, subtitle: `${p.name} · Puppet Master runs the server for you`, icon: 'server',
        body: PM51.panelSection('What happens', PM51.steps([{ title: 'Start OpenCode on your server', desc: 'Kept running and updated by Puppet Master.' }, { title: 'Sign in to the server', desc: 'The server has its own sign-in; model plans are separate.' }, { title: 'Models appear here', desc: 'Once the server is ready.' }])),
        primaryLabel: 'Start the server', onPrimary: () => example('Server requested', 'Example data only. No server was started in this preview.')
      });
      case 'attach-server': return PM51.panel({
        title: label, subtitle: `${p.name} · a server you already run`, icon: 'server',
        body: PM51.panelSection('Server', PM51.field('Server address', PM51.input(PM51.value('ai.accounts.opencode-endpoint') || '', { placeholder: 'http://192.168.1.20:4096', label: 'Server address', cls: 'o55-oc-addr' })) + PM51.field('Server password', PM51.input('', { placeholder: 'Only if the server asks for one', type: 'password', label: 'Server password' }), 'Kept in your server\'s keychain. Never shown again.')),
        primaryLabel: 'Connect', onPrimary: wrap => { const v = wrap.querySelector('.o55-oc-addr')?.value.trim(); if (!v) { PM51.toast('Enter the server address first', 'Puppet Master needs to know where the server is.', 'info'); return false; } if (commitSettingValue('ai.accounts.opencode-endpoint', v)) { saveState(); refreshSettingRow('ai.accounts.opencode-endpoint'); } example('Connect requested', 'Address saved. Example data only. No connection was made in this preview.'); }
      });
      case 'signin-chatgpt': return browserPanel(p, label, 'ChatGPT');
      case 'signin-google': return browserPanel(p, label, 'Google');
      case 'signin-github': return browserPanel(p, label, 'GitHub');
      case 'signin-xai': return browserPanel(p, label, 'xAI');
      case 'signin-meta': return browserPanel(p, label, 'Meta');
      case 'signin-console': return browserPanel(p, label, 'the Anthropic Console');
      case 'signin-claude': return browserPanel(p, label, 'Claude');
      default: return browserPanel(p, label, p.name);
    }
  }
  function signInFlow(p, anchor, title) {
    const ways = p.signIn || [];
    if (!ways.length) { PM51.unavailable('Sign in', `${p.name} has no sign-in of its own.`); return; }
    if (ways.length === 1) { signInPanel(p, ways[0][0], ways[0][1]); return; }
    PM51.menu(anchor, ways.map(([key, label]) => ({ label, meta: SIGNIN_HELP[key] || '', icon: key === 'apikey' ? 'key' : key === 'import-auth' ? 'download' : key.includes('server') ? 'server' : 'user', onClick: () => signInPanel(p, key, label) })), title || `Sign in to ${p.name}`);
  }
  /* The one place a key is typed. Only a flag that a key exists is kept; the key itself never reaches settings. */
  function apiKeyPanel(p, acc) {
    const where = { 'anthropic-api': 'the Anthropic Console', 'gemini-direct': 'Google AI Studio', vertex: 'the Google Cloud console', 'xai-api': 'the xAI console', 'meta-api': 'Meta\'s developer site', 'cursor-cli': 'your Cursor dashboard', 'openai-codex': 'the OpenAI platform' }[p.id] || `${p.name}'s website`;
    const body = PM51.panelSection(acc ? `A new key for ${acc.nickname}` : 'API key', PM51.field('API key', PM51.input('', { placeholder: 'Paste your key', type: 'password', label: 'API key', cls: 'pm51-providers-key' }), `Copy it from ${where}. It is kept in your server's keychain, never in settings files, and never shown again.`)
      + (p.regions && !acc ? PM51.field('Region', PM51.select(p.regions[0], p.regions, { label: 'Region', cls: 'pm51-providers-region' }), 'Where your plan was bought.') : '')
      + (p.gcp && !acc ? PM51.field('Google Cloud project', PM51.input('', { placeholder: 'e.g. my-project-123', label: 'Google Cloud project', cls: 'pm51-providers-gcp' }), p.id === 'vertex' ? 'Vertex AI bills this project.' : 'Only for paid tiers.') : ''))
      + PM51.note('Puppet Master checks the key with one small request before it is used.');
    PM51.panel({
      title: acc ? 'Replace API key' : 'Enter API Key', subtitle: p.name, icon: 'key', body,
      primaryLabel: 'Save key', onPrimary: wrap => {
        const key = wrap.querySelector('.pm51-providers-key')?.value.trim();
        if (!key) { PM51.toast('Paste a key first', `The key comes from ${where}.`, 'info'); return false; }
        if (p.key) { const keys = PM51.s().o55Keys = PM51.s().o55Keys || {}; keys[p.key] = true; }
        saveState();
        example('Key received', 'Example data only. No key was stored or sent in this preview.');
      }
    });
  }
  function addressPanel(p) {
    PM51.panel({
      title: 'Enter address', subtitle: `${p.name} · an address on your network`, icon: 'link',
      body: PM51.panelSection('Model server', PM51.field('Address', PM51.input(p.address || '', { placeholder: 'http://192.168.1.20:11434', label: 'Address', cls: 'pm51-providers-address' }), 'For example Ollama or LM Studio. Works without an outside account when the server is already running.')) + PM51.note('Choose Check connection afterwards to see whether it answers.'),
      primaryLabel: 'Save address', onPrimary: wrap => {
        const v = wrap.querySelector('.pm51-providers-address')?.value.trim();
        if (!v) { PM51.toast('Enter an address first', 'For example http://192.168.1.20:11434', 'info'); return false; }
        p.address = v; p.connect = v; p.lastCheck = 'Not checked'; p.signedIn = true; p.readiness.signedIn = true; recompute(p); save(); PM51.toast('Address saved', 'Check the connection to see whether it answers.');
      }
    });
  }
  function routePanel(r) {
    const order = r.priority ? `Tried ${ordinal(r.priority)}` : 'Not in the order (off)';
    PM51.panel({
      title: routeName(r), status: { label: routeStatus(r), tone: PM51.tone(routeStatus(r)) }, subtitle: r.terms, icon: 'route',
      facts: [{ label: 'Order', value: order }, { label: 'Limit', value: r.limit }, { label: 'Models', value: r.models.length }],
      body: PM51.panelSection('Details', PM51.kv([['Sign-in', r.signIn], ['Models', r.models.length ? r.models.join(', ') : 'None yet']]))
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
  function checkPanel(p) {
    const acc = defaultAccount(p);
    const url = p.kind === 'URL';
    PM51.check({
      title: `Check ${p.name}`,
      steps: [
        { title: 'Installed', desc: p.kind === 'CLI' ? `Version ${p.version} found on your server` : url ? `Address ${p.address || 'saved'}` : 'Nothing to install' },
        { title: 'Signed in', desc: url ? 'No account needed' : acc ? `As ${acc.identity}` : 'Sign-in present', status: url || acc ? 'Checked' : 'Example', tone: url || acc ? 'ready' : 'info' },
        { title: 'Models listed', desc: enabledModels(p).length ? `${countText(enabledModels(p).length, 'model')} available` : 'The service is asked which models it has', status: 'Example', tone: 'info' },
        { title: 'One small request', desc: 'A tiny request to make sure answers come back', status: 'Example', tone: 'info' }
      ]
    });
  }

  /* ---------- actions ---------------------------------------------------- */
  const prov = el => byId(ds(el, 'provider'));
  const acct = el => { const p = prov(el); const acc = (p.accounts || []).find(x => x.id === ds(el, 'account')); return [p, acc]; };
  PM51.on('providers-open', el => { const id = ds(el, 'provider'); if (!find(id)) return; state.selectedProvider = id; PM51.swapDetail(ID, id); });
  PM51.on('providers-add', () => openDialog({
    title: 'Add a service', subtitle: 'For a service that is not in the list, such as a server that speaks the OpenAI format.',
    body: PM51.form([
      { label: 'Service name', name: 'name', placeholder: 'e.g. My model server', autofocus: true, full: true },
      { label: 'How it connects', name: 'kind', type: 'select', choices: ['API key', 'Sign in', 'Address on your network', 'Command-line tool'] },
      { label: 'Address', name: 'address', placeholder: 'Only for services on your network' }
    ]),
    saveLabel: 'Add service',
    onSave: data => {
      const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the service a name', 'Something you will recognise in the list.', 'info'); return false; }
      const kind = data.kind === 'Address on your network' ? 'URL' : data.kind === 'Command-line tool' ? 'CLI' : data.kind === 'Sign in' ? 'Account' : 'API';
      const id = uid('service', name);
      const p = { id, name, kind, bill: kind === 'API' ? 'use' : 'own', connect: kind === 'URL' ? (data.address || 'An address on your network') : kind === 'CLI' ? 'Installs on your server' : kind === 'Account' ? 'Sign in' : 'API key', status: kind === 'CLI' ? 'not-installed' : 'setup', statusLabel: kind === 'CLI' ? 'Not installed' : 'Not set up', installed: kind !== 'CLI', signedIn: false, version: '', installSource: kind === 'CLI' ? 'Official provider installer' : 'No install needed', defaultAccount: '', product: 'Added by you', nextAction: kind === 'CLI' ? 'install' : kind === 'URL' ? 'address' : kind === 'Account' ? 'signin' : 'apikey', signIn: kind === 'URL' ? [['address', 'Enter address']] : kind === 'Account' ? [['signin-browser', 'Sign in in the browser']] : [['apikey', 'Enter API Key']], readiness: { installed: kind !== 'CLI', signedIn: false, accountChosen: kind === 'URL', modelsReady: false }, lastCheck: kind === 'CLI' ? 'Install first' : 'Not checked', accounts: [], models: [], windows: {}, routing: EMPTY_ROUTING(), diagnostics: [], props: {}, address: kind === 'URL' ? (data.address || '') : undefined };
      state.providers.push(p); state.selectedProvider = id; save(); PM51.toast('Service added', `${name} is ready to set up.`);
    }
  }));
  PM51.on('providers-install', el => {
    const p = prov(el); const server = (PM51.s().serverProject?.servers || []).find(s => s.default)?.name || 'your server';
    PM51.panel({
      title: `Install ${p.name}`, subtitle: `Puppet Master installs it on ${server}, only from ${p.vendor || 'the provider'}'s official installer.`, icon: 'download',
      body: PM51.panelSection('What happens', PM51.steps([
        { title: 'Download from the official provider', desc: 'Never from a third-party mirror.' },
        { title: `Install on ${server}`, desc: 'Takes about a minute. You can keep working.' },
        { title: 'Check the version', desc: 'Then you sign in here.' }
      ])) + PM51.note('Nothing installs until you choose Install.'),
      primaryLabel: 'Install', onPrimary: () => example('Install requested', `Example data only. ${p.name} was not installed in this preview.`)
    });
  });
  PM51.on('providers-signin', el => signInFlow(prov(el), el));
  PM51.on('providers-add-account', el => { closeOverlay(false); signInFlow(prov(el), el, `Add an account to ${prov(el).name}`); });
  PM51.on('providers-apikey', el => { const [p, acc] = acct(el); apiKeyPanel(p, acc); });
  PM51.on('providers-address', el => addressPanel(prov(el)));
  PM51.on('providers-turn-on', el => turnOn(prov(el)));
  PM51.on('providers-check', el => checkPanel(prov(el)));
  PM51.on('providers-routes', () => PM51.panel({
    title: 'Free routes', subtitle: 'Turn routes on or off. They are tried in this order.', icon: 'route',
    body: PM51.panelSection('Routes', PM51.rows(routes().map(r => ({ label: routeName(r), help: r.limit, pill: PM51.status(routeStatus(r)), control: PM51.toggle(!!r.enabled, { action: 'pm51-providers-route-toggle', data: { route: r.id, quiet: 1 }, label: routeName(r) }) })))),
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
  PM51.on('providers-opencode-control', el => {
    const what = ds(el, 'what');
    if (what === 'detach') { PM51.confirm('Stop managing this server?', 'Puppet Master stops starting, restarting and updating it. The server keeps running, and you can attach to it again.', 'Stop managing', () => example('Detach requested')); return; }
    example({ reconnect: 'Reconnect requested', restart: 'Restart requested', discovery: 'Model list refresh requested' }[what] || 'Requested');
  });
  PM51.on('providers-opencode-add', () => {
    const p = find('opencode'); if (!p) return;
    PM51.panel({
      title: 'Add an OpenCode server', subtitle: 'OpenCode on your computer', icon: 'server',
      body: PM51.panelSection('Choose one', PM51.list(p.signIn.map(([way, label]) => ({ title: label, meta: SIGNIN_HELP[way], action: 'pm51-providers-oc-way', data: { way, label }, end: icon('arrowRight') })))),
    });
  });
  PM51.on('providers-oc-way', el => { const p = find('opencode'); if (!p) return; closeOverlay(false); window.setTimeout(() => signInPanel(p, ds(el, 'way'), ds(el, 'label')), 220); });

  /* Priority is edited in place: the accordion re-renders through PM51.refresh and stays open. */
  PM51.on('providers-account-move', el => {
    const [p, acc] = acct(el); if (!acc) return;
    const order = orderOf(p); const i = order.indexOf(acc.id); const to = i + Number(ds(el, 'dir'));
    if (i < 0 || to < 0 || to >= order.length) return;
    order.splice(i, 1); order.splice(to, 0, acc.id);
    recompute(p); save();
    PM51.toast('Order changed', `${acc.nickname} is now ${ordinal(to + 1)} in the order.`);
  });
  PM51.on('providers-account-next', el => {
    const [p, acc] = acct(el); if (!acc) return;
    PM51.s().o55NextAccount = { provider: p.id, account: acc.id }; saveState();
    PM51.toast('Next run uses this account', `${acc.nickname} (${p.name}) is used for the next run, then the usual order returns.`);
  });
  PM51.on('providers-account-signin', el => { const [p, acc] = acct(el); signInFlow(p, el, acc ? `Sign in again · ${acc.nickname}` : undefined); });
  PM51.on('providers-account-signout', el => {
    const [p, acc] = acct(el); if (!acc) return;
    PM51.confirm(`Sign out of ${acc.nickname}?`, 'Puppet Master stops using this account until you sign in again. Its place in the order is kept.', 'Sign out', () => {
      acc.active = false; acc.health = 'Signed out'; acc.usage = { text: 'Sign in again to use it', windows: {} };
      recompute(p); save(); PM51.toast('Signed out', `${acc.nickname} is no longer used.`);
    });
  });
  PM51.on('providers-account-remove', el => {
    const [p, acc] = acct(el); if (!acc) return;
    PM51.confirm(`Remove ${acc.nickname}?`, 'Puppet Master forgets this account. You can sign in again later.', 'Remove', () => {
      p.accounts = p.accounts.filter(x => x.id !== acc.id); routingOf(p).accountOrder = orderOf(p).filter(x => x !== acc.id);
      const open = PM51.s().open; if (open) delete open[accKey(p, acc)];
      recompute(p); save(); PM51.toast('Account removed', `${acc.nickname} was removed from ${p.name}.`);
    }, true);
  });
  PM51.onChange('providers-account-model-default', el => {
    const [p, acc] = acct(el); if (!acc) return;
    if (!accModelOn(acc, el.value)) { PM51.toast('Turn that model on first', 'Only models that are on for this account can be its default.', 'info'); return; }
    acc.defaultModel = el.value; recompute(p); save();
    PM51.toast('Default model changed', `${acc.nickname} now uses ${modelName(p, el.value)} by default.`);
  });
  PM51.on('providers-account-model', el => {
    const [p, acc] = acct(el); if (!acc) return;
    const m = accModel(acc, ds(el, 'model')); if (!m) return;
    m.enabled = !m.enabled;
    if (!m.enabled && acc.defaultModel === m.id) acc.defaultModel = (accEnabled(p, acc)[0] || {}).id || '';
    if (m.enabled && !acc.defaultModel) acc.defaultModel = m.id;
    recompute(p); save();
  });
  PM51.onChange('providers-account-region', el => { const [p, acc] = acct(el); if (!acc) return; acc.region = el.value; saveState(); PM51.toast('Saved', `${acc.nickname}: ${el.value}.`); });
  PM51.onChange('providers-entitlement', el => { prov(el).entitlement = el.value; saveState(); PM51.toast('Saved', `Copilot plan: ${el.value}.`); });
  PM51.onChange('providers-exhaustion', el => { const p = prov(el); routingOf(p).exhaustion = el.value; save(); PM51.toast('Saved', `When ${p.name} runs out: ${(RUNS_OUT[el.value] || [el.value])[0]}.`); });
  PM51.on('providers-refresh-models', el => example('Model list refresh requested', `Example data only. ${prov(el).name} was not contacted in this preview.`));
  PM51.on('providers-refresh-all', () => example('Model lists refresh requested', 'Example data only. No service was contacted in this preview.'));
  PM51.on('providers-rescan', () => example('Looking for installed apps', 'Example data only. Nothing on your server was searched in this preview.'));
  PM51.on('providers-export', el => PM51.panel({
    title: 'Export a report without keys', subtitle: prov(el).name, icon: 'download',
    body: PM51.panelSection('What is included', PM51.kv([['Readiness', 'Install, sign-in, account, and model state'], ['Diagnostic notes', 'As shown under More options'], ['Keys and passwords', 'Never included'], ['Account names', 'Replaced with placeholders']])),
    primaryLabel: 'Save report', onPrimary: () => example('Report ready', 'Example data only. No file was written in this preview.')
  }));
  PM51.on('providers-diagnostics', el => {
    const p = ds(el, 'provider') ? byId(ds(el, 'provider')) : null;
    PM51.check({ title: p ? `${p.name} diagnostics` : 'Check every service', steps: p ? [
      { title: 'Settings readable', desc: 'Accounts, models, and routing resolved' },
      { title: 'Keychain reachable', desc: 'On your server', status: 'Example', tone: 'info' },
      { title: 'Service answers', desc: 'One small request', status: 'Example', tone: 'info' }
    ] : [
      { title: 'Services listed', desc: `${countText(all().length, 'service')} in this project` },
      { title: 'Ready services', desc: `${all().filter(x => plain(x) === 'Ready').length} signed in with models available` },
      { title: 'Need a step', desc: `${all().filter(x => /^Needs/.test(plain(x))).length} need a sign-in or a seat` },
      { title: 'Free routes', desc: `${routesOn()} of ${routes().length} on` },
      { title: 'Keychain reachable', desc: 'On your server', status: 'Example', tone: 'info' }
    ] });
  });
  PM51.on('providers-reset', () => PM51.confirm('Reset services to the example defaults?', 'Accounts, model choices, and routes go back to the example defaults. Settings on the other tabs are kept.', 'Reset', () => {
    state.providers = clone(D.providers); state.freeRoutes = clone(D.freeRoutes); state.selectedProvider = state.providers[0]?.id || null; migrate(); save(); PM51.toast('Services reset', 'The example defaults are back.');
  }, true));
  PM51.on('providers-help', () => PM51.panel({
    title: 'How AI services work', icon: 'info',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A service is the company or program that does the thinking. Install it if it needs installing, sign in or paste a key, and its models appear.</p>')
      + PM51.panelSection('Plans and pay as you go', '<p class="pm51-ps-text">A monthly plan (Claude, ChatGPT, Antigravity, Grok Build, Muse Code and the coding plans) and the same company\'s pay-as-you-go API (Anthropic API, Gemini API, xAI API, Meta Model API) are separate services with separate bills. Add the ones you pay for.</p>')
      + PM51.panelSection('Getting it ready', PM51.kv([['Install', 'Only services that run on your server install, and only from the official provider after you choose Install.'], ['Sign in', 'A browser sign-in, an API key, or an address on your network.'], ['Account in use', 'Accounts are tried in the order you set. When the first runs out, the next takes over.'], ['Models', 'The list comes from the service once you are signed in. You choose which ones each account may use.']]))
      + PM51.panelSection('Free Models', '<p class="pm51-ps-text">Free Models groups free and free-limited services. It keeps no keys of its own: each route signs in with its own service. Limits can change without notice, so routes are tried in order and skipped when they run out.</p>')
  }));
})();
