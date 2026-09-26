/* Web & Research — what the assistant can do on the web, who does it, and within which limits. Four tabs:
   - Abilities: six jobs (search, fetch, crawl, browser, map, extract). Each has two parts that used to be mixed up:
     the web services that find and read pages (tried in order; the inventory's capability matrix), and the AI model
     that decides what to look for and writes the answer (with its own fallbacks). An ability's limits are the
     inventory rows (results per search, pages per crawl...) drawn inside it; the manager no longer keeps a second,
     different copy of them.
   - Search services: Exa, Tavily, Firecrawl, Brave, Jina, DuckDuckGo, Site Reader and your AI model's own search, each
     with its switch, status, key and its own settings, and the order they are tried when an ability has no order.
   - Limits & saving: spending caps and how long results are kept.
   - Network: working offline, proxies and certificates.
   Keys are typed only in a service's key dialog and never shown or stored in settings. */
(function () {
  const ID = 'web';
  const KEY = 'web-routes';
  const TABS = [{ id: 'abilities', label: 'Abilities' }, { id: 'services', label: 'Search services' }, { id: 'limits', label: 'Limits & saving' }, { id: 'network', label: 'Network' }];
  const all = () => state.webRoutes;
  const current = () => all().find(r => r.id === PM51.sel(ID, 'search')) || all()[0];
  const byId = id => all().find(r => r.id === id) || current();
  const SHORT = { search: 'Find current information', fetch: 'Read one page or file', crawl: 'Read many pages of a site', browser: 'Use a real browser', map: 'Outline a site or codebase', extract: 'Turn pages into data' };
  const WHAT = { search: 'Looks up current information and finds sources you can cite.', fetch: 'Reads one page or document you point it at.', crawl: 'Reads many pages of one site, within limits you set.', browser: 'Opens a real browser and clicks around, the way a person would.', map: 'Builds an outline of a website or a codebase.', extract: 'Turns pages and documents into checked, structured data.' };
  const TOOL_MODEL = { search: 'Search adapter', fetch: 'HTTP Fetch', crawl: 'Crawl adapter', browser: 'Built-in browser', map: 'Map builder', extract: 'Extractor' };
  const LAST_CHECK = { search: '2 h ago', fetch: '2 h ago', browser: 'yesterday', map: '3 h ago', extract: '2 h ago' };
  /* Each ability's limits are these inventory rows, drawn inside the ability. */
  const LIMITS = {
    search: ['web.fetch.search-max-results', 'web.fetch.research-max-sources', 'web.fetch.research-auto-read-pages'],
    fetch: ['web.fetch.pdf-mode', 'web.fetch.request-timeout'],
    crawl: ['web.fetch.crawl-max-pages', 'web.fetch.crawl-max-depth'],
    map: ['web.fetch.map-max-pages', 'web.fetch.map-max-depth'],
    extract: [], browser: []
  };
  /* Manager-own choices that the inventory has no row for; the ones it has (sources, pages, depth, map size, fetch time
     and cache, browser profile, certificates) were removed here because they duplicated those rows with other values. */
  const DUPLICATES = { search: ['maxSources'], fetch: ['timeout', 'cache', 'certificates'], crawl: ['maxPages', 'maxDepth'], map: ['maxNodes'], browser: ['profile'], extract: [] };
  const MATRIX = 'web.providers.capability-matrix';
  const SERVICES = [
    { name: 'Exa', enable: 'web.providers.exa-enable', what: 'Strong at search and deep research.', keyed: true, site: 'exa.ai' },
    { name: 'Tavily', enable: 'web.providers.tavily-enable', what: 'Searches, reads and extracts pages.', keyed: true, site: 'tavily.com', rows: ['web.providers.tavily-fetch-mode'] },
    { name: 'Firecrawl', enable: 'web.providers.firecrawl-enable', what: 'Reads difficult, script-heavy sites. A key, or your own server.', keySetting: 'web.providers.firecrawl-api-key', site: 'firecrawl.dev', rows: ['web.providers.firecrawl-url', 'web.fetch.firecrawl-proxy-mode', 'web.fetch.provider-cache'] },
    { name: 'Brave', label: 'Brave Search', enable: 'web.providers.brave-enable', what: 'An independent search index.', keyed: true, site: 'brave.com/search/api' },
    { name: 'Jina', label: 'Jina Reader', enable: 'web.providers.jina-enable', what: 'Reads pages other services cannot.', keyed: true, site: 'jina.ai' },
    { name: 'DuckDuckGo', enable: 'web.providers.duckduckgo-enable', what: 'Free, basic backup search. No key.' },
    { name: 'Site Reader', what: 'Puppet Master\'s own page reader. Built in, no key.', builtIn: true },
    { name: 'model-native', label: 'Your AI model\'s own web search', enable: 'web.providers.model-native-enable', what: 'Uses your AI model account. No extra key. Tried last.' },
    { name: 'PM-composed search+read', label: 'Puppet Master\'s own search and read', what: 'Searches with the services above, then reads the results itself.', builtIn: true, chainOnly: true }
  ];
  const svc = name => SERVICES.find(s => s.name === name) || { name, label: name, what: '' };
  const svcLabel = name => svc(name).label || name;
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const example = (title, message) => PM51.toast(title, message || 'Example data only. Nothing was sent or changed outside this preview.', 'info');

  PM51.style(`
    #panel-settings .pm51-web-order .pm51-row-control .icon-btn { width: 28px; height: 28px; }
    #panel-settings .o55-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
    #panel-settings .o55-chain-step { display: inline-flex; align-items: center; gap: 6px; min-height: 26px; padding: 0 9px; border: 1px solid var(--k3-line); border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--k3-text-1); background: var(--k3-bg-1); }
    #panel-settings .o55-chain-step i { width: 7px; height: 7px; border-radius: 50%; background: var(--k3-text-3); }
    #panel-settings .o55-chain-step.tone-ready i { background: var(--k3-green); }
    #panel-settings .o55-chain-step.tone-attention i { background: var(--k3-amber); }
    #panel-settings .o55-chain-step.tone-off { color: var(--k3-text-3); text-decoration: line-through; }
    #panel-settings .o55-chain > svg, #panel-settings .o55-chain > .icon { width: 12px; height: 12px; color: var(--k3-text-3); }
  `);

  /* ---------- state -------------------------------------------------------- */
  const searchOn = () => PM51.value('web.providers.web-search-enable') !== false;
  const plain = r => (r.id === 'search' && !searchOn()) || r.status === 'disabled' ? 'Off' : r.status === 'ready' ? 'Ready' : 'Not set up';
  const tone = r => PM51.tone(plain(r));
  const endpointText = e => !e ? 'Nothing yet' : e.type === 'tool' || e.provider === 'Built-in' ? `Built-in ${e.model}` : `${PM51.serviceName(e.provider)} · ${e.model}`;
  const accountText = e => !e || e.type === 'tool' || e.provider === 'Built-in' ? 'No account needed' : (e.account || 'Default account');
  const lastCheck = r => r.lastCheck || (r.status === 'ready' ? `Passed ${LAST_CHECK[r.id] || '2 h ago'}` : 'Not checked');
  const seconds = s => s >= 60 ? `${Math.round(s / 60)} min` : `${s} s`;
  const keys = () => (PM51.s().o55WebKeys = PM51.s().o55WebKeys || {});
  const hasKey = s => s.keySetting ? !!(PM51.s().o55Keys || {})[s.keySetting] || (PM51.value('web.providers.provider-status') || {})[s.name] === 'connected' : !!keys()[s.name] || (s.keyed && (PM51.value('web.providers.provider-status') || {})[s.name] === 'connected');
  function svcState(s) {
    if (s.enable && PM51.value(s.enable) === false) return ['Off', 'off'];
    if (s.builtIn) return ['Built in', 'ready'];
    const raw = (PM51.value('web.providers.provider-status') || {})[s.name];
    if ((s.keyed || s.keySetting) && !hasKey(s)) return ['Needs a key', 'attention'];
    if (raw === 'needs_auth' && !hasKey(s)) return ['Needs a key', 'attention'];
    if (raw === 'failed' || raw === 'error') return ['Failed recently', 'blocked'];
    return ['Ready', 'ready'];
  }
  function chainOf(ability) {
    const m = PM51.value(MATRIX) || {}; const raw = m[ability];
    return typeof raw === 'string' && raw.trim() ? raw.split(/\s*(?:→|->|,)\s*/).filter(Boolean) : [];
  }
  function saveChain(ability, list) {
    const m = Object.assign({}, PM51.value(MATRIX) || {}); m[ability] = list.join(' → ');
    if (commitSettingValue(MATRIX, m)) { saveState(); o55Notify(MATRIX, m); }
  }
  const chainHtml = names => names.length ? `<span class="o55-chain">${names.map((n, i) => { const [label, t] = svcState(svc(n)); return `${i ? icon('arrowRight') : ''}<span class="o55-chain-step tone-${a(t)}" title="${a(label)}"><i></i>${h(svcLabel(n))}</span>`; }).join('')}</span>` : '<span class="pm51-row-value is-muted">None yet</span>';
  function fallbackText(r) {
    const on = (r.fallbacks || []).filter(f => f.enabled !== false);
    if (!on.length) return 'Nothing. The ability stops and tells you.';
    return on.map(endpointText).join(', then ');
  }
  /* Saved states carry the duplicated limits in each ability's own choices; drop them so the inventory rows rule. */
  function migrate() {
    const strip = list => (list || []).forEach(r => { (DUPLICATES[r.id] || []).forEach(k => { if (r.policy) delete r.policy[k]; }); });
    strip(state.webRoutes); strip(D.webRoutes);
  }
  const webEnsure = ensureStateShape;
  ensureStateShape = function () { const r = webEnsure.apply(this, arguments); try { migrate(); } catch (e) { /* never block boot */ } return r; };
  migrate();

  /* ---------- the AI model part of an ability ------------------------------ */
  function serviceOptions(r) {
    const list = state.providers.filter(p => p.installed && p.signedIn && p.status !== 'disabled' && (p.models || []).some(m => m.enabled)).map(p => ({ id: p.id, label: p.name, models: p.models.filter(m => m.enabled).map(m => ({ id: m.id, name: m.name })), accounts: (p.accounts || []).filter(x => x.active).map(x => ({ id: x.id, name: x.nickname })) }));
    list.push({ id: 'tool', label: 'Built-in tool (no AI model)', models: [{ id: 'tool', name: TOOL_MODEL[r.id] || 'Built-in adapter' }], accounts: [] });
    return list;
  }
  const modelField = (s, want) => PM51.field('Model', PM51.select(want, s.models.map(m => [m.name, m.name]), { label: 'Model', cls: 'pm51-web-model' }), s.id === 'tool' ? 'A built-in tool. Nothing is sent to an AI service.' : 'Only models you have turned on appear here.');
  const accountField = (s, want) => s.accounts.length ? PM51.field('Account', PM51.select(want, s.accounts.map(x => [x.name, x.name]), { label: 'Account', cls: 'pm51-web-account' }), 'The account whose usage this ability spends.') : PM51.note(s.id === 'tool' ? 'No account needed.' : 'No account needed for this service.');
  function changeModelPanel(r) {
    const services = serviceOptions(r);
    const curName = r.primary?.type === 'tool' || r.primary?.provider === 'Built-in' ? services[services.length - 1].label : PM51.serviceName(r.primary?.provider);
    const cur = services.find(s => s.label === curName) || services[0];
    const body = PM51.panelSection('AI service', PM51.field('Service', PM51.select(cur.id, services.map(s => [s.id, s.label]), { action: 'pm51-web-svc', data: { route: r.id }, label: 'Service', cls: 'pm51-web-svc' }), 'Only services that are signed in appear here. Set more up under Providers & Accounts.'))
      + PM51.panelSection('Model', `<div class="pm51-web-model-slot">${modelField(cur, r.primary?.model)}</div>`)
      + PM51.panelSection('Account', `<div class="pm51-web-account-slot">${accountField(cur, r.primary?.account)}</div>`);
    PM51.panel({
      title: 'AI model for this ability', subtitle: `${r.name} · decides what to look for and writes the answer`, icon: 'brain', body,
      primaryLabel: 'Use this model', onPrimary: wrap => {
        const svcId = wrap.querySelector('.pm51-web-svc')?.value; const s = services.find(x => x.id === svcId) || services[0];
        const model = wrap.querySelector('.pm51-web-model')?.value || s.models[0]?.name || '';
        const account = wrap.querySelector('.pm51-web-account')?.value || '';
        r.primary = s.id === 'tool' ? { type: 'tool', provider: 'Built-in', model, account: 'No account', mode: 'Deterministic tool' } : { type: 'model', provider: s.label, model, account: account || 'Default account', mode: r.primary?.mode || 'Model' };
        if (r.status !== 'disabled') r.status = 'ready';
        r.lastCheck = 'Not checked since the change';
        save(); PM51.toast('Model changed', `${r.name} now uses ${endpointText(r.primary)}.`);
      }
    });
  }
  PM51.onChange('web-svc', el => {
    const r = byId(ds(el, 'route')); const body = el.closest('.pm51-panel-body'); if (!body) return;
    const s = serviceOptions(r).find(x => x.id === el.value); if (!s) return;
    const m = body.querySelector('.pm51-web-model-slot'); if (m) m.innerHTML = modelField(s, s.models[0]?.name);
    const x = body.querySelector('.pm51-web-account-slot'); if (x) x.innerHTML = accountField(s, s.accounts[0]?.name);
  });
  function fallbackBody(r) {
    const fb = r.fallbacks || (r.fallbacks = []);
    const rows = fb.map((f, i) => ({
      label: endpointText(f), help: accountText(f),
      control: PM51.iconBtn({ icon: 'up', label: 'Move up', action: 'pm51-web-fb-move', data: { route: r.id, index: i, dir: -1 } }) + PM51.iconBtn({ icon: 'down', label: 'Move down', action: 'pm51-web-fb-move', data: { route: r.id, index: i, dir: 1 } }) + PM51.iconBtn({ icon: 'trash', label: 'Remove', action: 'pm51-web-fb-remove', data: { route: r.id, index: i } }) + PM51.toggle(f.enabled !== false, { action: 'pm51-web-fb-toggle', data: { route: r.id, index: i }, label: endpointText(f) })
    }));
    const options = [['', 'Choose a model…'], ...serviceOptions(r).flatMap(s => s.models.map(m => [`${s.id}::${m.name}`, `${s.label} · ${m.name}`]))];
    return PM51.panelSection('Tried in this order', rows.length ? PM51.rows(rows, { cls: 'pm51-web-order' }) : PM51.note('No backups yet. If the model fails, this ability stops and tells you.'), 'Each one is only used when the one above it fails.')
      + PM51.panelSection('Add another', PM51.field('Service and model', PM51.select('', options, { action: 'pm51-web-fb-add', data: { route: r.id }, label: 'Add a backup model' })));
  }
  const fallbackPanel = r => PM51.panel({ title: 'If the model fails', subtitle: `${r.name} · backup AI models`, icon: 'brain', body: fallbackBody(r), primaryLabel: 'Done', onPrimary: () => save() });
  const repaint = (el, r) => { const body = el.closest('.pm51-panel-body'); if (body) body.innerHTML = fallbackBody(r); saveState(); };
  PM51.on('web-fb-move', el => { const r = byId(ds(el, 'route')); const i = Number(ds(el, 'index')), to = i + Number(ds(el, 'dir')); if (to < 0 || to >= r.fallbacks.length) return; const [x] = r.fallbacks.splice(i, 1); r.fallbacks.splice(to, 0, x); repaint(el, r); });
  PM51.on('web-fb-remove', el => { const r = byId(ds(el, 'route')); r.fallbacks.splice(Number(ds(el, 'index')), 1); repaint(el, r); });
  PM51.on('web-fb-toggle', el => { const r = byId(ds(el, 'route')); const f = r.fallbacks[Number(ds(el, 'index'))]; if (!f) return; f.enabled = f.enabled === false; repaint(el, r); });
  PM51.onChange('web-fb-add', el => {
    const r = byId(ds(el, 'route')); if (!el.value) return;
    const [svcId, model] = el.value.split('::'); const s = serviceOptions(r).find(x => x.id === svcId); if (!s) return;
    r.fallbacks.push(s.id === 'tool' ? { type: 'tool', provider: 'Built-in', model, account: 'No account', enabled: true } : { type: 'model', provider: s.label, model, account: s.accounts[0]?.name || 'Default account', enabled: true });
    repaint(el, r);
  });

  /* ---------- the web-services part of an ability ---------------------------- */
  function chainPanel(ability, title) {
    let list = chainOf(ability).slice();
    const draw = wrap => {
      const body = wrap.querySelector('.o55-chain-edit'); if (!body) return;
      const left = SERVICES.filter(s => !list.includes(s.name) && (!s.chainOnly || ability === 'research'));
      body.innerHTML = (list.length ? PM51.rows(list.map((n, i) => ({ label: svcLabel(n), help: svcState(svc(n))[0], control: PM51.iconBtn({ icon: 'up', label: 'Move up', callback: () => { if (i) { list.splice(i - 1, 0, list.splice(i, 1)[0]); draw(wrap); } } }) + PM51.iconBtn({ icon: 'down', label: 'Move down', callback: () => { if (i < list.length - 1) { list.splice(i + 1, 0, list.splice(i, 1)[0]); draw(wrap); } } }) + PM51.iconBtn({ icon: 'trash', label: 'Remove', callback: () => { list.splice(i, 1); draw(wrap); } }) })), { cls: 'pm51-web-order' }) : PM51.note('No services. The ability uses only its AI model.'))
        + (left.length ? `<div class="o55-inline-actions">${left.map(s => PM51.btn({ label: svcLabel(s.name), icon: 'plus', small: true, callback: () => { list.push(s.name); draw(wrap); } })).join('')}</div>` : '');
    };
    const wrap = PM51.panel({
      title, subtitle: 'Tried from the top. The next one is used when one fails or has no answer.', icon: 'route',
      body: PM51.panelSection('Services, in order', '<div class="o55-chain-edit"></div>'),
      primaryLabel: 'Save order', onPrimary: () => { saveChain(ability, list); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${title}: ${list.map(svcLabel).join(', then ') || 'none'}.`); }
    });
    if (wrap) draw(wrap);
  }
  PM51.on('web-chain', el => chainPanel(ds(el, 'ability'), ds(el, 'title') || 'Web services'));

  /* ---------- ability detail ----------------------------------------------- */
  const POLICY_ROWS = {
    costGuard: { label: 'Paid usage', help: 'Whether this ability may spend pay-per-use pricing.', options: ['Prefer included usage', 'Allow metered usage', 'Ask before metered usage'] },
    timeout: { label: 'Time limit for the whole job', help: 'Seconds before the ability gives up.', number: true },
    citations: { label: 'Sources', options: [['Required', 'Always cite them'], ['Preferred', 'Cite them when possible'], ['Off', 'Do not cite'], ['Preserve source offsets', 'Keep where each fact came from']] },
    privacy: { label: 'What is sent', options: [['Standard', 'Only the question'], ['Strict', 'Only the question, nothing about the project']] },
    maxSize: { label: 'Largest page or file', options: ['5 MB', '20 MB', '50 MB'] },
    robots: { label: 'Site rules', help: 'Whether to obey a site\'s crawling rules.', options: [['Respect', 'Follow them'], ['Ignore on sites you own', 'Ignore them on sites you own']] },
    concurrency: { label: 'Pages at the same time', number: true },
    downloads: { label: 'Downloads', options: [['Ask', 'Ask me first'], ['Allow', 'Allow'], ['Block', 'Block']] },
    screenshots: { label: 'Screenshots', options: [['On failure', 'When something fails'], ['Always', 'Always'], ['Never', 'Never']] },
    credentials: { label: 'Saved passwords', value: true },
    output: { label: 'Result format', options: [['Structured JSON', 'Data (JSON)'], ['Markdown outline', 'An outline (Markdown)']] },
    deduplicate: { label: 'Skip duplicate pages', toggle: true },
    includeMetadata: { label: 'Include page details', toggle: true },
    validation: { label: 'Checking the result', options: [['Strict schema', 'Must match exactly'], ['Lenient', 'Best effort']] },
    retries: { label: 'Retries', number: true },
    pii: { label: 'Personal details in logs', options: [['Redact in logs', 'Hide them'], ['Keep in logs', 'Keep them']] }
  };
  function policyRows(r) {
    const p = r.policy || (r.policy = {});
    return Object.keys(p).filter(k => POLICY_ROWS[k]).map(key => {
      const def = POLICY_ROWS[key]; const data = { route: r.id, key };
      let control;
      if (def.toggle) control = PM51.toggle(!!p[key], { action: 'pm51-web-policy-toggle', data, label: def.label });
      else if (def.number) control = PM51.input(p[key], { type: 'number', action: 'pm51-web-policy-input', data, label: def.label });
      else if (def.options) { const opts = def.options.map(o => Array.isArray(o) ? o : [o, o]); if (!opts.some(o => o[0] === p[key])) opts.unshift([p[key], p[key]]); control = PM51.select(p[key], opts, { action: 'pm51-web-policy', data, label: def.label }); }
      else return { label: def.label, help: def.help, value: p[key] === 'Never expose' ? 'Never shared' : String(p[key]) };
      return { label: def.label, help: def.help, control };
    });
  }
  PM51.onChange('web-policy', el => { const r = byId(ds(el, 'route')); r.policy[ds(el, 'key')] = el.value; saveState(); PM51.toast('Saved', `${r.name}: ${el.options[el.selectedIndex]?.textContent || el.value}.`); });
  PM51.on('web-policy-toggle', el => { const r = byId(ds(el, 'route')); r.policy[ds(el, 'key')] = !r.policy[ds(el, 'key')]; save(); });
  PM51.onInput('web-policy-input', el => { const r = byId(ds(el, 'route')); const n = Number(el.value); if (!Number.isFinite(n)) return; r.policy[ds(el, 'key')] = n; saveState(); });

  /* One row look everywhere in the detail: the kit's setting row, stacked when its value is a whole chain. */
  const orow = ({ label, help, control, wide, home }) => `<div class="setting-row o55-row o55-scoped${wide ? ' is-wide' : ''}"${home ? ` data-setting-id="${a(home)}"` : ''}><div class="setting-copy"><div class="setting-label">${h(label)}</div>${help ? `<div class="setting-description">${h(help)}</div>` : ''}</div><div class="setting-control">${control}</div><span></span></div>`;
  const valueWith = (text, btn) => `<span class="pm51-row-value">${h(text)}</span>${btn ? PM51.btn(Object.assign({ small: true }, btn)) : ''}`;
  function detailFor(r) {
    const off = plain(r) === 'Off';
    const data = { route: r.id };
    const chain = r.id === 'browser' ? null : chainOf(r.id);
    const chainControl = (names, ability, title) => `${chainHtml(names)}${PM51.btn({ label: 'Change', icon: 'edit', small: true, action: 'pm51-web-chain', data: { ability, title } })}`;
    const who = [
      chain ? orow({ label: 'Web services', help: 'Find and read the pages. Tried in this order.', control: chainControl(chain, r.id, `${r.name}: web services`), wide: true, home: MATRIX }) : '',
      r.id === 'search' ? orow({ label: 'For deep research', help: 'When a question needs several sources.', control: chainControl(chainOf('research'), 'research', 'Deep research: web services'), wide: true }) : '',
      orow({ label: 'AI model', help: `Decides what to look for and writes the answer. ${accountText(r.primary)}.`, control: valueWith(off ? 'Off' : endpointText(r.primary), { label: 'Change', icon: 'edit', action: 'pm51-web-change', data }) }),
      orow({ label: 'If the model fails', help: fallbackText(r), control: PM51.btn({ label: 'Edit', icon: 'edit', small: true, action: 'pm51-web-fallbacks', data }) }),
      orow({ label: 'Last check', help: off ? 'Turn the ability on to check it.' : 'One small request, start to finish.', control: valueWith(lastCheck(r), { label: 'Check', icon: 'test', action: 'pm51-web-check', data, disabled: off || r.status !== 'ready', reason: off ? 'Turn the ability on first.' : 'Choose a model first.' }) })
    ];
    const limits = LIMITS[r.id] || [];
    const browserProfile = r.id === 'browser' ? PM51.scoped.rows([orow({ label: 'Browser profile', help: `${PM51.valueLabel('web.fetch.browser-session-profile', PM51.value('web.fetch.browser-session-profile'))}. Set with the other browser choices.`, control: PM51.btn({ label: 'Open Browser & SCM', icon: 'arrowRight', small: true, action: 'pm51-web-browser-settings' }) })]) : '';
    const pol = policyRows(r);
    return {
      title: r.name, pill: PM51.pill(plain(r)), subtitle: SHORT[r.id] || r.description,
      primary: off ? { label: 'Turn on', icon: 'play', action: 'pm51-web-turn-on', data } : null,
      menu: anchor => PM51.menu(anchor, [
        { label: off ? 'Turn on' : 'Turn off', icon: off ? 'play' : 'pause', onClick: () => off ? turnOn(r) : turnOff(r) },
        { label: 'Reset to the example', icon: 'restore', onClick: () => PM51.confirm(`Reset ${r.name}?`, 'The AI model, backups and choices go back to the example defaults. Web services and limits are kept.', 'Reset', () => { resetRoute(r); PM51.toast(`${r.name} reset`, 'Defaults are back.'); }) }
      ], r.name),
      body: PM51.section({ title: 'Who does it', help: WHAT[r.id] || r.description, body: (r.id === 'search' ? PM51.bound.rows(['web.providers.web-search-enable']) : '') + PM51.scoped.rows(who) })
        + (limits.length ? PM51.section({ title: 'Limits', help: 'Shared with every job that uses this ability.', body: PM51.bound.rows(limits) }) : browserProfile ? PM51.section({ title: 'Browser', body: browserProfile }) : '')
        + (pol.length ? PM51.advanced(PM51.rows(pol)) : '')
    };
  }
  function turnOff(r) {
    if (r.id === 'search') { if (commitSettingValue('web.providers.web-search-enable', false)) { saveState(); o55Notify('web.providers.web-search-enable', false); } save(); return; }
    r.prevStatus = r.status; r.status = 'disabled'; save(); PM51.toast(`${r.name} is off`, 'The assistant will say it cannot do this until you turn it back on.');
  }
  function turnOn(r) {
    if (r.id === 'search' && !searchOn()) { if (commitSettingValue('web.providers.web-search-enable', true)) { saveState(); o55Notify('web.providers.web-search-enable', true); } }
    if (r.status === 'disabled') { r.status = r.prevStatus || (r.primary?.provider === 'Not configured' ? 'setup' : 'ready'); delete r.prevStatus; }
    save();
  }
  function resetRoute(r) { const d = (D.webRoutes || []).find(x => x.id === r.id); if (!d) return; const i = all().indexOf(r); all()[i] = clone(d); save(); }
  PM51.watch('web.providers.web-search-enable', () => PM51.refresh(ID, { swap: false }));

  /* ---------- search services ------------------------------------------------ */
  function serviceItem(s) {
    const [label, t] = svcState(s);
    const usedBy = Object.keys(PM51.value(MATRIX) || {}).filter(k => chainOf(k).includes(s.name)).map(k => k === 'research' ? 'deep research' : (all().find(r => r.id === k) || { name: k }).name.toLowerCase());
    const keyRow = s.keySetting ? PM51.bound.rows([s.keySetting])
      : s.keyed ? `<div class="setting-list o55-bound-rows"><div class="setting-row o55-row o55-scoped o55-keyrow"><div class="setting-copy"><div class="setting-label">API key</div><div class="setting-description">From ${h(s.site || s.name)}. Kept in your server's keychain, never shown again.</div></div><div class="setting-control"><span class="o55-key${hasKey(s) ? ' is-saved' : ''}">${hasKey(s) ? `<span class="o55-key-state">${icon('lock')}<span>Saved</span></span>` : ''}<button type="button" class="btn small" data-action="pm51-web-key" data-service="${a(s.name)}">${icon(hasKey(s) ? 'refresh' : 'key')}<span>${hasKey(s) ? 'Replace key' : 'Add key'}</span></button></span></div><span></span></div></div>` : '';
    const rows = (s.rows || []).length ? PM51.bound.rows(s.rows) : '';
    const failure = PM51.value('web.providers.health-disclosure') !== false && t !== 'ready' && t !== 'off' ? PM51.note(label === 'Needs a key' ? `Last check: ${svcLabel(s.name)} answered that it needs a key.` : `Last check: ${label}.`, 'attention') : '';
    return {
      id: `web-svc-${s.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
      title: svcLabel(s.name), meta: `${s.what}${usedBy.length ? ' Used for ' + usedBy.join(', ') + '.' : ''}`,
      status: PM51.status(label, t),
      controls: s.enable ? PM51.bound.toggle(s.enable, { label: `Use ${svcLabel(s.name)}` }) : '',
      body: failure + keyRow + rows + (!keyRow && !rows ? PM51.note(s.builtIn ? 'Nothing to set up.' : 'Nothing else to set.') : '')
    };
  }
  function servicesTab() {
    const list = SERVICES.filter(s => !s.chainOnly);
    return PM51.section({
      title: 'Search services', help: 'Switch a service on, add its key, and choose how it works. Each ability picks its own order under Abilities.',
      action: PM51.bound.action('web.providers.web-api-keys', { label: 'Service keys', icon: 'key' }),
      body: PM51.home('web.providers.provider-status', PM51.accordion(list.map(serviceItem), { cls: 'o55-web-services' }))
    }) + PM51.section({ title: 'When an ability has no order of its own', body: PM51.bound.rows(['web.providers.provider-order', 'web.providers.health-disclosure']) });
  }
  function keyPanel(name) {
    const s = svc(name);
    if (s.keySetting) { const f = findSettingGlobal(s.keySetting); if (f) { o55KeyPanel(f); return; } }
    const saved = hasKey(s);
    PM51.panel({
      title: `${svcLabel(name)} key`, subtitle: `From ${s.site || name}`, icon: 'key', status: saved ? { label: 'Saved securely', tone: 'ready' } : { label: 'Not set', tone: 'off' },
      body: PM51.panelSection(saved ? 'Replace the key' : 'Add the key', PM51.field('Key', '<input class="text-control o55-keyinput" type="password" autocomplete="off" spellcheck="false" placeholder="Paste it here" aria-label="Key"/>', 'Kept in the secure keychain on your server. It is never shown again, never copied into settings files, and never exported.')),
      primaryLabel: saved ? 'Replace key' : 'Save key', onPrimary: w => {
        const v = w.querySelector('.o55-keyinput')?.value.trim(); if (!v) { PM51.toast('Paste the key first', `You get it from ${s.site || name}.`, 'info'); return false; }
        keys()[name] = true; save(); PM51.toast('Key saved', 'Example only: nothing was stored or sent in this preview.', 'info');
      }
    });
  }
  PM51.on('web-key', el => keyPanel(ds(el, 'service')));
  PM51.on('web-keys', () => PM51.panel({
    title: 'Service keys', subtitle: 'Add, replace or remove the keys web services use.', icon: 'key',
    body: PM51.panelSection('Services', PM51.rows(SERVICES.filter(s => s.keyed || s.keySetting).map(s => ({ label: svcLabel(s.name), help: hasKey(s) ? 'Saved securely' : 'No key yet', control: PM51.btn({ label: hasKey(s) ? 'Replace' : 'Add key', icon: 'key', small: true, callback: () => { closeOverlay(false); window.setTimeout(() => keyPanel(s.name), 220); } }) + (hasKey(s) && !s.keySetting ? PM51.btn({ label: 'Remove', icon: 'trash', small: true, danger: true, callback: () => PM51.confirm(`Remove the ${svcLabel(s.name)} key?`, 'The service stops working until you add a key again.', 'Remove', () => { delete keys()[s.name]; closeOverlay(false); save(); }, true) }) : '') }))))
      + PM51.note('Remove a key straight away if it may have leaked.')
  }));
  PM51.on('web-browser-settings', () => PM51.revealSetting('web.fetch.browser-session-profile'));
  ['web.providers.exa-enable', 'web.providers.tavily-enable', 'web.providers.firecrawl-enable', 'web.providers.brave-enable', 'web.providers.jina-enable', 'web.providers.duckduckgo-enable', 'web.providers.model-native-enable', 'web.providers.health-disclosure', 'web.providers.provider-order'].forEach(id => PM51.watch(id, () => PM51.refresh(ID, { swap: false })));

  /* ---------- page ------------------------------------------------------------ */
  function abilitiesTab() {
    const r = current();
    return PM51.listDetail({
      id: ID, rosterTitle: 'Web abilities', count: all().length,
      items: all().map(x => ({ id: x.id, title: x.name, meta: SHORT[x.id] || x.description, tone: tone(x), avatar: icon(x.icon || 'search'), selected: x.id === r.id })),
      detail: detailFor(r)
    });
  }
  const LEADS = { limits: 'How much a web job may spend before it asks, and how long results are kept.', network: 'For computers that must work offline or reach the internet through a proxy.' };
  function render() {
    const tab = PM51.tab(ID, 'abilities');
    const body = tab === 'abilities' ? abilitiesTab() : tab === 'services' ? servicesTab() : `<p class="o55-quiet-line">${h(LEADS[tab] || '')}</p>`;
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'How web abilities work', action: 'pm51-web-help' }, { label: 'Check every ability', action: 'pm51-web-diagnostics' }, { label: 'Reset abilities to the example', action: 'pm51-web-reset' }] });
  }
  PM51.manager('webRoutes', { render });
  PM51.owner(ID, id => {
    const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab);
    const owner = Object.keys(LIMITS).find(k => LIMITS[k].includes(id)); if (owner) PM51.setSel(ID, owner);
    if (id === 'web.providers.web-search-enable' || id === MATRIX) PM51.setSel(ID, 'search');
  });

  /* ---------- actions ---------------------------------------------------- */
  const route = el => byId(ds(el, 'route'));
  PM51.on('web-change', el => changeModelPanel(route(el)));
  PM51.on('web-fallbacks', el => fallbackPanel(route(el)));
  PM51.on('web-turn-on', el => turnOn(route(el)));
  PM51.on('web-check', el => { const r = route(el); const chain = r.id === 'browser' ? [] : chainOf(r.id); PM51.check({ title: `Check ${r.name}`, steps: [
    chain.length ? { title: 'Web service answers', desc: svcLabel(chain[0]), status: 'Example', tone: 'info' } : null,
    { title: 'AI model available', desc: `${endpointText(r.primary)} · ${accountText(r.primary)}`, status: r.primary?.type === 'tool' ? 'Checked' : 'Example', tone: r.primary?.type === 'tool' ? 'ready' : 'info' },
    { title: 'One small request', desc: r.id === 'search' ? 'Search for one phrase and read the first result' : r.id === 'browser' ? 'Open one page in the built-in browser' : 'Read one small page', status: 'Example', tone: 'info' }
  ].filter(Boolean) }); });
  PM51.on('web-diagnostics', () => PM51.check({ title: 'Check every ability', steps: [
    { title: 'Abilities listed', desc: `${all().length} abilities` },
    { title: 'Ready abilities', desc: `${all().filter(x => plain(x) === 'Ready').length} with a working model` },
    { title: 'Search services', desc: `${SERVICES.filter(s => !s.chainOnly && svcState(s)[1] === 'ready').length} ready, ${SERVICES.filter(s => svcState(s)[0] === 'Needs a key').length} need a key` },
    { title: 'Services reachable', desc: 'One small request each', status: 'Example', tone: 'info' }
  ] }));
  PM51.on('web-reset', () => PM51.confirm('Reset web abilities to the example?', 'Every ability goes back to its example AI model, backups and choices. Web services, keys and limits are kept.', 'Reset', () => { state.webRoutes = clone(D.webRoutes); migrate(); save(); PM51.toast('Web abilities reset', 'Defaults are back.'); }, true));
  PM51.on('web-help', () => PM51.panel({
    title: 'How web abilities work', icon: 'info',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Each ability is one job the assistant can do on the web. Web services find and read the pages; an AI model decides what to look for and writes the answer.</p>')
      + PM51.panelSection('The six abilities', PM51.kv(all().map(x => [x.name, WHAT[x.id] || x.description])))
      + PM51.panelSection('Keys', '<p class="pm51-ps-text">Services that need a key say so. Keys are typed only in the service\'s key dialog, kept in your server\'s keychain, and never shown again.</p>')
  }));
})();
