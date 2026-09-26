/* Web & Research — six fixed web abilities, one service each, honest checks. */
(function () {
  const ID = 'web';
  const KEY = 'web-routes';
  const all = () => state.webRoutes;
  const current = () => all().find(r => r.id === PM51.sel(ID, 'search')) || all()[0];
  const byId = id => all().find(r => r.id === id) || current();
  const SHORT = { search: 'Find current information', fetch: 'Read one page or file', crawl: 'Read many pages of a site', browser: 'Use a real browser', map: 'Outline a site or codebase', extract: 'Turn pages into data' };
  const WHAT = { search: 'Looks up current information and finds sources you can cite.', fetch: 'Reads one page or document you point it at.', crawl: 'Reads many pages of one site, within limits you set.', browser: 'Opens a real browser and clicks around, the way a person would.', map: 'Builds an outline of a website or a codebase.', extract: 'Turns pages and documents into checked, structured data.' };
  const TOOL_MODEL = { search: 'Search adapter', fetch: 'HTTP Fetch', crawl: 'Crawl adapter', browser: 'Built-in browser', map: 'Map builder', extract: 'Extractor' };
  const LAST_CHECK = { search: '2 h ago', fetch: '2 h ago', browser: 'yesterday', map: '3 h ago', extract: '2 h ago' };
  const NAME_MAP = { 'OpenAI Codex': 'Codex', 'Google Antigravity': 'Antigravity CLI' };
  const providerName = n => NAME_MAP[n] || n;
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const example = (title, message) => PM51.toast(title, message || 'Example data only. Nothing was sent or changed outside this preview.', 'info');

  PM51.style(`
    #panel-settings .pm51-web-inline { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    #panel-settings .pm51-web-order .pm51-row-control .icon-btn { width: 28px; height: 28px; }
  `);

  const plain = r => r.status === 'disabled' ? 'Off' : r.status === 'ready' ? 'Ready' : 'Not set up';
  const tone = r => PM51.tone(plain(r));
  const endpointText = e => !e ? 'Nothing yet' : e.type === 'tool' || e.provider === 'Built-in' ? `Built-in ${e.model}` : `${providerName(e.provider)} · ${e.model}`;
  const accountText = e => !e || e.type === 'tool' || e.provider === 'Built-in' ? 'No account needed' : (e.account || 'Default account');
  const lastCheck = r => r.lastCheck || (r.status === 'ready' ? `Passed ${LAST_CHECK[r.id] || '2 h ago'}` : 'Not checked');
  const seconds = s => s >= 60 ? `${Math.round(s / 60)} min` : `${s} s`;

  function limitsText(r) {
    const p = r.policy || {}; const parts = [];
    if (p.maxSources) parts.push(`Up to ${p.maxSources} sources`);
    if (p.maxSize) parts.push(`Up to ${p.maxSize}`);
    if (p.maxPages) parts.push(`Up to ${p.maxPages} pages, ${p.maxDepth} levels deep`);
    if (p.maxNodes) parts.push(`Up to ${p.maxNodes} items`);
    if (p.retries != null) parts.push(`${p.retries} ${p.retries === 1 ? 'retry' : 'retries'}`);
    if (p.timeout) parts.push(`${seconds(p.timeout)} time limit`);
    return parts.join(' · ') || 'No limits set';
  }
  function privacyText(r) {
    const p = r.policy || {}; const parts = [];
    if (p.privacy) parts.push(p.privacy === 'Standard' ? 'Only the query is sent' : p.privacy);
    if (p.robots) parts.push(p.robots === 'Respect' ? 'Follows site rules' : 'Ignores site rules on sites you own');
    if (p.credentials) parts.push('Your passwords are never shared');
    if (p.pii) parts.push('Personal details hidden in logs');
    if (p.citations) parts.push(p.citations === 'Required' ? 'Sources always cited' : p.citations === 'Preserve source offsets' ? 'Keeps where each fact came from' : `Citations ${String(p.citations).toLowerCase()}`);
    if (p.cache) parts.push(p.cache === 'Off' ? 'Nothing cached' : `Pages cached for ${p.cache}`);
    return parts.join(' · ') || 'Standard';
  }
  function fallbackText(r) {
    const on = (r.fallbacks || []).filter(f => f.enabled !== false);
    if (!on.length) return 'Nothing. The ability stops and tells you.';
    return on.map(endpointText).join(', then ');
  }

  function serviceOptions(r) {
    const list = state.providers.filter(p => p.installed && p.signedIn && p.status !== 'disabled' && (p.models || []).some(m => m.enabled)).map(p => ({ id: p.id, label: p.name, models: p.models.filter(m => m.enabled).map(m => ({ id: m.id, name: m.name })), accounts: (p.accounts || []).filter(a => a.active).map(a => ({ id: a.id, name: a.nickname })) }));
    list.push({ id: 'tool', label: 'Built-in tool', models: [{ id: 'tool', name: TOOL_MODEL[r.id] || 'Built-in adapter' }], accounts: [] });
    return list;
  }
  const modelField = (svc, want) => PM51.field('Model', PM51.select(want, svc.models.map(m => [m.name, m.name]), { label: 'Model', cls: 'pm51-web-model' }), svc.id === 'tool' ? 'A built-in tool. Nothing is sent to an AI service.' : 'Only models you have turned on appear here.');
  const accountField = (svc, want) => svc.accounts.length ? PM51.field('Account', PM51.select(want, svc.accounts.map(a => [a.name, a.name]), { label: 'Account', cls: 'pm51-web-account' }), 'The account whose usage this ability spends.') : PM51.note(svc.id === 'tool' ? 'No account needed.' : 'No account needed for this service.');

  function changeServicePanel(r) {
    const services = serviceOptions(r);
    const curName = r.primary?.type === 'tool' || r.primary?.provider === 'Built-in' ? 'Built-in tool' : providerName(r.primary?.provider);
    const cur = services.find(s => s.label === curName) || services[0];
    const body = PM51.panelSection('Service', PM51.field('Service', PM51.select(cur.id, services.map(s => [s.id, s.label]), { action: 'pm51-web-svc', data: { route: r.id }, label: 'Service', cls: 'pm51-web-svc' }), 'Only services that are signed in appear here. Set more up under Providers & Accounts.'))
      + PM51.panelSection('Model', `<div class="pm51-web-model-slot">${modelField(cur, r.primary?.model)}</div>`)
      + PM51.panelSection('Account', `<div class="pm51-web-account-slot">${accountField(cur, r.primary?.account)}</div>`);
    PM51.panel({
      title: 'Change service', subtitle: `${r.name} · ${SHORT[r.id] || r.description}`, body,
      primaryLabel: 'Use this service', onPrimary: wrap => {
        const svcId = wrap.querySelector('.pm51-web-svc')?.value; const svc = services.find(s => s.id === svcId) || services[0];
        const model = wrap.querySelector('.pm51-web-model')?.value || svc.models[0]?.name || '';
        const account = wrap.querySelector('.pm51-web-account')?.value || '';
        r.primary = svc.id === 'tool' ? { type: 'tool', provider: 'Built-in', model, account: 'No account', mode: 'Deterministic tool' } : { type: 'model', provider: svc.label, model, account: account || 'Default account', mode: r.primary?.mode || 'Model' };
        if (r.status !== 'disabled') r.status = 'ready';
        r.lastCheck = 'Not checked since the change';
        save(); PM51.toast('Service changed', `${r.name} now uses ${endpointText(r.primary)}.`);
      }
    });
  }
  PM51.onChange('web-svc', el => {
    const r = byId(ds(el, 'route')); const body = el.closest('.pm51-panel-body'); if (!body) return;
    const svc = serviceOptions(r).find(s => s.id === el.value); if (!svc) return;
    const m = body.querySelector('.pm51-web-model-slot'); if (m) m.innerHTML = modelField(svc, svc.models[0]?.name);
    const a = body.querySelector('.pm51-web-account-slot'); if (a) a.innerHTML = accountField(svc, svc.accounts[0]?.name);
  });

  function fallbackBody(r) {
    const fb = r.fallbacks || (r.fallbacks = []);
    const rows = fb.map((f, i) => ({
      label: endpointText(f), help: accountText(f),
      control: PM51.iconBtn({ icon: 'up', label: 'Move up', action: 'pm51-web-fb-move', data: { route: r.id, index: i, dir: -1 } }) + PM51.iconBtn({ icon: 'down', label: 'Move down', action: 'pm51-web-fb-move', data: { route: r.id, index: i, dir: 1 } }) + PM51.iconBtn({ icon: 'trash', label: 'Remove', action: 'pm51-web-fb-remove', data: { route: r.id, index: i } }) + PM51.toggle(f.enabled !== false, { action: 'pm51-web-fb-toggle', data: { route: r.id, index: i }, label: endpointText(f) })
    }));
    const options = [['', 'Choose a service…'], ...serviceOptions(r).flatMap(s => s.models.map(m => [`${s.id}::${m.name}`, `${s.label} · ${m.name}`]))];
    return PM51.panelSection('Tried in this order', rows.length ? PM51.rows(rows, { cls: 'pm51-web-order' }) : PM51.note('No fallbacks yet. If the main service fails, this ability stops and tells you.'), 'Each one is only used when the one above it fails.')
      + PM51.panelSection('Add another', PM51.field('Service and model', PM51.select('', options, { action: 'pm51-web-fb-add', data: { route: r.id }, label: 'Add a fallback' })));
  }
  function fallbackPanel(r) {
    PM51.panel({ title: 'If that fails, use', subtitle: `${r.name} · after the main service fails`, body: fallbackBody(r), primaryLabel: 'Done', onPrimary: () => save() });
  }
  const repaint = (el, r) => { const body = el.closest('.pm51-panel-body'); if (body) body.innerHTML = fallbackBody(r); saveState(); };
  PM51.on('web-fb-move', el => { const r = byId(ds(el, 'route')); const i = Number(ds(el, 'index')), to = i + Number(ds(el, 'dir')); if (to < 0 || to >= r.fallbacks.length) return; const [x] = r.fallbacks.splice(i, 1); r.fallbacks.splice(to, 0, x); repaint(el, r); });
  PM51.on('web-fb-remove', el => { const r = byId(ds(el, 'route')); r.fallbacks.splice(Number(ds(el, 'index')), 1); repaint(el, r); });
  PM51.on('web-fb-toggle', el => { const r = byId(ds(el, 'route')); const f = r.fallbacks[Number(ds(el, 'index'))]; if (!f) return; f.enabled = f.enabled === false; repaint(el, r); });
  PM51.onChange('web-fb-add', el => {
    const r = byId(ds(el, 'route')); if (!el.value) return;
    const [svcId, model] = el.value.split('::'); const svc = serviceOptions(r).find(s => s.id === svcId); if (!svc) return;
    r.fallbacks.push(svc.id === 'tool' ? { type: 'tool', provider: 'Built-in', model, account: 'No account', enabled: true } : { type: 'model', provider: svc.label, model, account: svc.accounts[0]?.name || 'Default account', enabled: true });
    repaint(el, r);
  });

  /* ---------- advanced ---------------------------------------------------- */
  const POLICY_ROWS = {
    costGuard: { label: 'Cost guard', help: 'Whether this ability may spend pay-per-use pricing.', options: ['Prefer included usage', 'Allow metered usage', 'Ask before metered usage'] },
    timeout: { label: 'Time limit', help: 'Seconds before the ability gives up.', number: true },
    maxSources: { label: 'Most sources per search', number: true },
    citations: { label: 'Citations', options: ['Required', 'Preferred', 'Off', 'Preserve source offsets'] },
    privacy: { label: 'Privacy level', options: ['Standard', 'Strict'] },
    maxSize: { label: 'Largest page or file', options: ['5 MB', '20 MB', '50 MB'] },
    robots: { label: 'Site rules', help: 'Whether to obey a site’s crawling rules.', options: ['Respect', 'Ignore on sites you own'] },
    certificates: { label: 'Certificates', help: 'Strict is safest. Relax only for devices on your own network.', options: ['Strict', 'Allow self-signed on your network'] },
    cache: { label: 'Keep pages for', options: ['Off', '5 minutes', '15 minutes', '1 hour'] },
    maxPages: { label: 'Most pages per crawl', number: true },
    maxDepth: { label: 'How many levels deep', number: true },
    concurrency: { label: 'Pages at the same time', number: true },
    profile: { label: 'Browser profile', options: ['Isolated project profile', 'Shared profile'] },
    downloads: { label: 'Downloads', options: ['Ask', 'Allow', 'Block'] },
    screenshots: { label: 'Screenshots', options: ['On failure', 'Always', 'Never'] },
    credentials: { label: 'Saved passwords', value: true },
    output: { label: 'Output shape', options: ['Structured JSON', 'Markdown outline'] },
    maxNodes: { label: 'Most items in a map', number: true },
    deduplicate: { label: 'Skip duplicate pages', toggle: true },
    includeMetadata: { label: 'Include page details', toggle: true },
    validation: { label: 'Checking', options: ['Strict schema', 'Lenient'] },
    retries: { label: 'Retries', number: true },
    pii: { label: 'Personal details', options: ['Redact in logs', 'Keep in logs'] }
  };
  function advancedSection(r) {
    const p = r.policy || (r.policy = {});
    const rows = Object.keys(p).map(key => {
      const def = POLICY_ROWS[key] || { label: humanize(key) }; const data = { route: r.id, key };
      let control;
      if (def.toggle) control = PM51.toggle(!!p[key], { action: 'pm51-web-policy-toggle', data, label: def.label });
      else if (def.number) control = PM51.input(p[key], { type: 'number', action: 'pm51-web-policy-input', data, label: def.label });
      else if (def.options) control = PM51.select(p[key], def.options.includes(p[key]) ? def.options : [p[key], ...def.options], { action: 'pm51-web-policy', data, label: def.label });
      else return { label: def.label, help: def.help, value: String(p[key]) };
      return { label: def.label, help: def.help, control };
    });
    const effective = PM51.kv([['Ability', r.name], ['Main service', endpointText(r.primary)], ['Account', accountText(r.primary)], ['Fallbacks', fallbackText(r)], ...Object.entries(p).map(([k, v]) => [(POLICY_ROWS[k] || { label: humanize(k) }).label, String(v)])]);
    return PM51.advanced([
      PM51.rows(rows),
      PM51.section({ title: 'Effective configuration', help: 'Read-only. What this ability actually uses right now.', body: effective + '<div class="pm51-web-inline">' + PM51.btn({ label: 'Run diagnostics', icon: 'test', small: true, action: 'pm51-web-diagnostics', data: { route: r.id } }) + '</div>' })
    ].join(''));
  }
  PM51.onChange('web-policy', el => { const r = byId(ds(el, 'route')); r.policy[ds(el, 'key')] = el.value; save(); });
  PM51.on('web-policy-toggle', el => { const r = byId(ds(el, 'route')); r.policy[ds(el, 'key')] = !r.policy[ds(el, 'key')]; save(); });
  PM51.onInput('web-policy-input', el => { const r = byId(ds(el, 'route')); const n = Number(el.value); if (!Number.isFinite(n)) return; r.policy[ds(el, 'key')] = n; saveState(); const v = root.querySelector(`[data-row="web-limits"] .pm51-row-value`); if (v) v.textContent = limitsText(r); });

  /* ---------- detail ------------------------------------------------------ */
  function detailFor(r) {
    const off = r.status === 'disabled';
    const data = { route: r.id };
    const rows = [
      { label: 'What it does', value: WHAT[r.id] || r.description },
      { label: 'Uses', help: accountText(r.primary), value: off ? 'Off' : endpointText(r.primary) },
      { label: 'If that fails, use', value: fallbackText(r), action: { label: 'Edit', icon: 'edit', action: 'pm51-web-fallbacks', data } },
      { id: 'web-limits', label: 'Limits', value: limitsText(r) },
      { label: 'Privacy', value: privacyText(r) },
      { label: 'Last check', help: off ? 'Turn the ability on to check it.' : 'One small request through the main service.', value: lastCheck(r), action: { label: 'Check route', icon: 'test', action: 'pm51-web-check', data, disabled: off || r.status !== 'ready', reason: off ? 'Turn the ability on first.' : 'Choose a service first.' } }
    ];
    return {
      title: r.name, pill: PM51.pill(plain(r)), subtitle: SHORT[r.id] || r.description,
      primary: off ? { label: 'Turn on', icon: 'play', action: 'pm51-web-turn-on', data } : { label: r.primary?.provider === 'Not configured' ? 'Choose service' : 'Change service', icon: 'route', action: 'pm51-web-change', data },
      menu: anchor => PM51.menu(anchor, [
        { label: off ? 'Turn on' : 'Turn off', icon: off ? 'play' : 'pause', onClick: () => off ? turnOn(r) : turnOff(r) },
        { label: 'Reset to default', icon: 'restore', onClick: () => PM51.confirm(`Reset ${r.name}?`, 'The service, fallbacks, and limits go back to the example defaults.', 'Reset', () => { resetRoute(r); PM51.toast(`${r.name} reset`, 'Defaults are back.'); }) }
      ], r.name),
      body: PM51.section({ title: 'Route', body: PM51.rows(rows) }) + advancedSection(r)
    };
  }
  function turnOff(r) { r.prevStatus = r.status; r.status = 'disabled'; save(); PM51.toast(`${r.name} is off`, 'The assistant will say it cannot do this until you turn it back on.'); }
  function turnOn(r) { r.status = r.prevStatus || (r.primary?.provider === 'Not configured' ? 'setup' : 'ready'); delete r.prevStatus; save(); }
  function resetRoute(r) { const d = (D.webRoutes || []).find(x => x.id === r.id); if (!d) return; const i = all().indexOf(r); all()[i] = clone(d); save(); }

  function render() {
    const r = current();
    const body = PM51.listDetail({
      id: ID, rosterTitle: 'Web abilities', count: all().length,
      items: all().map(x => ({ id: x.id, title: x.name, meta: SHORT[x.id] || x.description, tone: tone(x), avatar: icon(x.icon || 'search'), selected: x.id === r.id })),
      detail: detailFor(r)
    });
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset all web abilities to defaults', action: 'pm51-web-reset' }, { label: 'How web abilities work', action: 'pm51-web-help' }, { label: 'Run diagnostics', action: 'pm51-web-diagnostics' }] });
  }
  PM51.manager('webRoutes', { render });

  /* ---------- actions ---------------------------------------------------- */
  const route = el => byId(ds(el, 'route'));
  PM51.on('web-change', el => changeServicePanel(route(el)));
  PM51.on('web-fallbacks', el => fallbackPanel(route(el)));
  PM51.on('web-turn-on', el => turnOn(route(el)));
  PM51.on('web-check', el => { const r = route(el); PM51.check({ title: `Check ${r.name}`, steps: [
    { title: 'Service signed in', desc: `${endpointText(r.primary)} · ${accountText(r.primary)}` },
    { title: 'Model available', desc: r.primary?.model || 'Built-in', status: r.primary?.type === 'tool' ? 'Checked' : 'Example', tone: r.primary?.type === 'tool' ? 'ready' : 'info' },
    { title: 'One small request', desc: r.id === 'search' ? 'Search for one phrase and read the first result' : r.id === 'browser' ? 'Open one page in the built-in browser' : 'Read one small page', status: 'Example', tone: 'info' },
    { title: 'Fallback ready', desc: fallbackText(r), status: 'Example', tone: 'info' }
  ] }); });
  PM51.on('web-diagnostics', el => { const r = ds(el, 'route') ? byId(ds(el, 'route')) : null; PM51.check({ title: r ? `${r.name} diagnostics` : 'Web abilities diagnostics', steps: r ? [
    { title: 'Settings readable', desc: 'Service, fallbacks, and limits resolved' },
    { title: 'Main service reachable', desc: endpointText(r.primary), status: 'Example', tone: 'info' },
    { title: 'Limits applied', desc: limitsText(r) }
  ] : [
    { title: 'Abilities listed', desc: `${all().length} abilities` },
    { title: 'Ready abilities', desc: `${all().filter(x => x.status === 'ready').length} with a working service` },
    { title: 'Services reachable', desc: 'Checked through Providers & Accounts', status: 'Example', tone: 'info' }
  ] }); });
  PM51.on('web-reset', () => PM51.confirm('Reset all web abilities?', 'Every ability goes back to its example service, fallbacks, and limits.', 'Reset', () => { state.webRoutes = clone(D.webRoutes); save(); PM51.toast('Web abilities reset', 'Defaults are back.'); }, true));
  PM51.on('web-help', () => PM51.panel({
    title: 'How web abilities work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Each ability is one job the assistant can do on the web. You choose which service does it, and what to try if that service fails.</p>')
      + PM51.panelSection('The six abilities', PM51.kv(all().map(x => [x.name, WHAT[x.id] || x.description])))
      + PM51.panelSection('Built-in tools', '<p class="pm51-ps-text">Some abilities can run with a built-in tool and no AI service at all. Those never spend an account.</p>')
  }));
})();
