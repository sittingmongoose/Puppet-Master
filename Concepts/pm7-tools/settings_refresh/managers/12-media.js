/* Media & Output — seven fixed media abilities: which service makes what, and where it goes. */
(function () {
  const ID = 'media';
  const KEY = 'media-routes';
  const all = () => state.mediaRoutes;
  const current = () => all().find(r => r.id === PM51.sel(ID, 'image-generation')) || all()[0];
  const byId = id => all().find(r => r.id === id) || current();
  const SHORT = { 'image-generation': 'Make pictures', 'image-understanding': 'Look at pictures', transcription: 'Turn speech into text', 'text-to-speech': 'Read text aloud', 'audio-generation': 'Make sounds and music', 'video-generation': 'Make short videos', 'artifact-output': 'Make documents and files' };
  const WHAT = { 'image-generation': 'Makes pictures from a description.', 'image-understanding': 'Looks at pictures and screenshots and describes what is in them.', transcription: 'Turns recordings and speech into text.', 'text-to-speech': 'Reads text aloud in a chosen voice.', 'audio-generation': 'Makes sound effects and music from a description.', 'video-generation': 'Makes short video clips from a description.', 'artifact-output': 'Makes documents, spreadsheets, and slide decks.' };
  const CAP = { 'image-generation': 'image-generation', 'image-understanding': 'vision' };
  const LAST_CHECK = { 'image-generation': '1 h ago', 'image-understanding': '2 h ago', 'text-to-speech': 'yesterday', 'artifact-output': '3 h ago' };
  const NAME_MAP = { 'OpenAI Codex': 'Codex', 'Google Antigravity': 'Antigravity CLI' };
  const providerName = n => NAME_MAP[n] || n;
  const FOLDERS = ['Project artifacts/images', 'Project artifacts/audio', 'Project artifacts/video', 'Project artifacts/exports', 'Downloads folder', 'Ask each time'];
  const KEEP = ['Project policy', '7 days', '30 days', '90 days', 'Forever'];
  const OPTIONS = {
    format: { 'image-generation': ['PNG', 'JPEG', 'WebP'], transcription: ['Text + timestamps', 'Plain text', 'Subtitles (SRT)'], 'text-to-speech': ['WAV', 'MP3', 'OGG'], 'audio-generation': ['WAV', 'MP3', 'OGG'], 'video-generation': ['MP4', 'WebM'] },
    quality: { 'image-generation': ['Standard', 'High', 'Best'], 'video-generation': ['720p', '1080p', '4K'] },
    detail: ['Adaptive', 'Low', 'High'], ocr: ['Only when needed', 'Always', 'Never'], retention: ['Project policy', 'Delete after use', 'Keep 30 days'],
    language: ['Auto-detect', 'English', 'Spanish', 'German', 'French', 'Japanese'], speakers: ['Detect when supported', 'Single speaker', 'Off'],
    voice: ['Neutral', 'Warm', 'Bright', 'Calm'], duration: ['Ask', 'Up to 30 s', 'Up to 2 min', 'Up to 10 min'],
    metadata: [['Preserve prompt receipt', 'Keep the prompt with the file'], ['Strip everything', 'Keep nothing extra']], overwrite: ['Never without approval', 'Ask each time', 'Always']
  };
  const LABELS = { format: 'Format', formats: 'Formats', quality: 'Quality', detail: 'Detail level', ocr: 'Read text in pictures', retention: 'Keep for', language: 'Language', speakers: 'Speakers', voice: 'Voice', duration: 'Length', metadata: 'Extra details in the file', overwrite: 'Overwriting files' };
  const OUTPUT_KEYS = ['format', 'formats', 'quality', 'detail'];
  const ADV_KEYS = ['voice', 'language', 'duration', 'speakers', 'ocr', 'retention', 'metadata', 'overwrite'];
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };

  PM51.style(`
    #panel-settings .pm51-media-inline { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    #panel-settings .pm51-media-order .pm51-row-control .icon-btn { width: 28px; height: 28px; }
  `);

  const unset = r => !r.primary || r.primary.provider === 'Not configured';
  const plain = r => r.status === 'disabled' ? 'Off' : r.status === 'ready' && !unset(r) ? 'Ready' : 'Not set up';
  const tone = r => PM51.tone(plain(r));
  const endpointText = e => !e || e.provider === 'Not configured' ? 'Nothing yet' : e.provider === 'Built-in' ? `Built-in ${e.model}` : `${providerName(e.provider)} · ${e.model}`;
  const accountText = e => !e || e.provider === 'Not configured' ? 'Choose a service to begin.' : e.provider === 'Built-in' || !e.account || e.account === 'None' || e.account === 'No account' ? 'No account needed' : e.account;
  const lastCheck = r => r.lastCheck || (plain(r) === 'Ready' ? `Passed ${LAST_CHECK[r.id] || '2 h ago'}` : 'Not checked');
  const optionsFor = (r, key) => { const o = OPTIONS[key]; return Array.isArray(o) ? o : (o && o[r.id]) || null; };
  const optLabel = (key, v) => { const o = OPTIONS[key]; if (Array.isArray(o)) { const pair = o.find(x => Array.isArray(x) && x[0] === v); return pair ? pair[1] : v; } return v; };
  function outputText(r) {
    const o = r.output || {}; const parts = [];
    if (o.format) parts.push(o.format); if (o.formats) parts.push(o.formats);
    if (o.quality) parts.push(`${o.quality} quality`); if (o.detail) parts.push(`${o.detail} detail`);
    return parts.join(' · ') || 'Default';
  }
  function fallbackText(r) {
    const on = (r.fallbacks || []).filter(f => f.enabled !== false);
    if (!on.length) return 'Nothing. The ability stops and tells you.';
    return on.map(endpointText).join(', then ');
  }
  function serviceOptions(r) {
    const list = state.providers.filter(p => p.installed && p.signedIn && p.status !== 'disabled' && (p.models || []).some(m => m.enabled)).map(p => ({ id: p.id, label: p.name, models: p.models.filter(m => m.enabled).map(m => ({ id: m.id, name: m.name, fit: !CAP[r.id] || (m.caps || []).includes(CAP[r.id]) })), accounts: (p.accounts || []).filter(a => a.active).map(a => ({ id: a.id, name: a.nickname })) }));
    if (r.id === 'artifact-output') list.push({ id: 'tool', label: 'Built-in renderer', models: [{ id: 'tool', name: 'Artifact renderer', fit: true }], accounts: [] });
    return list;
  }
  const modelField = (svc, want) => PM51.field('Model', PM51.select(want, svc.models.map(m => [m.name, m.fit ? m.name : `${m.name} (may not support this)`]), { label: 'Model', cls: 'pm51-media-model' }), svc.id === 'tool' ? 'Built in. Nothing is sent to an AI service.' : 'Only models you have turned on appear here.');
  const accountField = (svc, want) => svc.accounts.length ? PM51.field('Account', PM51.select(want, svc.accounts.map(a => [a.name, a.name]), { label: 'Account', cls: 'pm51-media-account' }), 'The account whose usage this ability spends.') : PM51.note('No account needed.');

  function changeServicePanel(r) {
    const services = serviceOptions(r);
    if (!services.length) { PM51.unavailable('Change service', 'Sign in to an AI service under Providers & Accounts first.'); return; }
    const curName = r.primary?.provider === 'Built-in' ? 'Built-in renderer' : providerName(r.primary?.provider);
    const cur = services.find(s => s.label === curName) || services.find(s => s.models.some(m => m.fit)) || services[0];
    const body = PM51.panelSection('Service', PM51.field('Service', PM51.select(cur.id, services.map(s => [s.id, s.label]), { action: 'pm51-media-svc', data: { route: r.id }, label: 'Service', cls: 'pm51-media-svc' }), 'Only services that are signed in appear here. Set more up under Providers & Accounts.'))
      + PM51.panelSection('Model', `<div class="pm51-media-model-slot">${modelField(cur, r.primary?.model)}</div>`)
      + PM51.panelSection('Account', `<div class="pm51-media-account-slot">${accountField(cur, r.primary?.account)}</div>`);
    PM51.panel({
      title: unset(r) ? 'Choose service' : 'Change service', subtitle: `${r.name} · ${SHORT[r.id] || ''}`, body,
      primaryLabel: 'Use this service', onPrimary: wrap => {
        const svcId = wrap.querySelector('.pm51-media-svc')?.value; const svc = services.find(s => s.id === svcId) || services[0];
        const model = wrap.querySelector('.pm51-media-model')?.value || svc.models[0]?.name || '';
        const account = wrap.querySelector('.pm51-media-account')?.value || '';
        const fit = svc.models.find(m => m.name === model)?.fit !== false;
        r.primary = svc.id === 'tool' ? { provider: 'Built-in', model, account: 'No account' } : { provider: svc.label, model, account: account || 'Default account' };
        if (r.status !== 'disabled') r.status = 'ready';
        r.lastCheck = 'Not checked since the change';
        save();
        if (fit) PM51.toast('Service changed', `${r.name} now uses ${endpointText(r.primary)}.`);
        else PM51.toast('Service changed', `${model} may not support ${SHORT[r.id].toLowerCase()}. Check the route to be sure.`, 'info');
      }
    });
  }
  PM51.onChange('media-svc', el => {
    const r = byId(ds(el, 'route')); const body = el.closest('.pm51-panel-body'); if (!body) return;
    const svc = serviceOptions(r).find(s => s.id === el.value); if (!svc) return;
    const m = body.querySelector('.pm51-media-model-slot'); if (m) m.innerHTML = modelField(svc, (svc.models.find(x => x.fit) || svc.models[0])?.name);
    const a = body.querySelector('.pm51-media-account-slot'); if (a) a.innerHTML = accountField(svc, svc.accounts[0]?.name);
  });

  function fallbackBody(r) {
    const fb = r.fallbacks || (r.fallbacks = []);
    const rows = fb.map((f, i) => ({
      label: endpointText(f), help: accountText(f),
      control: PM51.iconBtn({ icon: 'up', label: 'Move up', action: 'pm51-media-fb-move', data: { route: r.id, index: i, dir: -1 } }) + PM51.iconBtn({ icon: 'down', label: 'Move down', action: 'pm51-media-fb-move', data: { route: r.id, index: i, dir: 1 } }) + PM51.iconBtn({ icon: 'trash', label: 'Remove', action: 'pm51-media-fb-remove', data: { route: r.id, index: i } }) + PM51.toggle(f.enabled !== false, { action: 'pm51-media-fb-toggle', data: { route: r.id, index: i }, label: endpointText(f) })
    }));
    const options = [['', 'Choose a service…'], ...serviceOptions(r).flatMap(s => s.models.map(m => [`${s.id}::${m.name}`, `${s.label} · ${m.name}`]))];
    return PM51.panelSection('Tried in this order', rows.length ? PM51.rows(rows, { cls: 'pm51-media-order' }) : PM51.note('No fallbacks yet. If the main service fails, this ability stops and tells you.'), 'Each one is only used when the one above it fails.')
      + PM51.panelSection('Add another', PM51.field('Service and model', PM51.select('', options, { action: 'pm51-media-fb-add', data: { route: r.id }, label: 'Add a fallback' })));
  }
  const repaint = (el, r) => { const body = el.closest('.pm51-panel-body'); if (body) body.innerHTML = fallbackBody(r); saveState(); };
  PM51.on('media-fb-move', el => { const r = byId(ds(el, 'route')); const i = Number(ds(el, 'index')), to = i + Number(ds(el, 'dir')); if (to < 0 || to >= r.fallbacks.length) return; const [x] = r.fallbacks.splice(i, 1); r.fallbacks.splice(to, 0, x); repaint(el, r); });
  PM51.on('media-fb-remove', el => { const r = byId(ds(el, 'route')); r.fallbacks.splice(Number(ds(el, 'index')), 1); repaint(el, r); });
  PM51.on('media-fb-toggle', el => { const r = byId(ds(el, 'route')); const f = r.fallbacks[Number(ds(el, 'index'))]; if (!f) return; f.enabled = f.enabled === false; repaint(el, r); });
  PM51.onChange('media-fb-add', el => {
    const r = byId(ds(el, 'route')); if (!el.value) return;
    const [svcId, model] = el.value.split('::'); const svc = serviceOptions(r).find(s => s.id === svcId); if (!svc) return;
    r.fallbacks.push(svc.id === 'tool' ? { provider: 'Built-in', model, account: 'No account', enabled: true } : { provider: svc.label, model, account: svc.accounts[0]?.name || 'Default account', enabled: true });
    repaint(el, r);
  });

  function outputPanel(r) {
    const o = r.output || (r.output = {});
    const fields = OUTPUT_KEYS.filter(k => o[k] != null).map(k => {
      const opts = optionsFor(r, k);
      return PM51.field(LABELS[k] || humanize(k), opts ? PM51.select(o[k], opts.includes(o[k]) ? opts : [o[k], ...opts], { label: LABELS[k], cls: 'pm51-media-out', data: { key: k } }) : PM51.input(o[k], { label: LABELS[k], cls: 'pm51-media-out', data: { key: k } }), k === 'formats' ? 'Separate formats with commas.' : undefined);
    }).join('');
    PM51.panel({
      title: 'Output', subtitle: `${r.name} · how results are made`, body: PM51.panelSection('Result', fields || PM51.note('This ability has no output options.')),
      primaryLabel: 'Save', onPrimary: wrap => { wrap.querySelectorAll('.pm51-media-out').forEach(inp => { o[inp.dataset.key] = inp.value; }); save(); }
    });
  }
  function saveToPanel(r) {
    const o = r.output || (r.output = {});
    const cur = o.destination || '';
    PM51.panel({
      title: 'Save to', subtitle: `${r.name} · where results are kept`,
      body: PM51.panelSection('Folder', PM51.field('Folder', PM51.select(FOLDERS.includes(cur) ? cur : (cur ? '__custom' : 'Ask each time'), [...FOLDERS.map(f => [f, f]), ['__custom', 'Another folder…']], { label: 'Folder', cls: 'pm51-media-folder' }), 'Project folders stay with the project and are included in backups.')
        + PM51.field('Another folder', PM51.input(FOLDERS.includes(cur) ? '' : cur, { placeholder: 'e.g. Shared/Marketing/images', label: 'Another folder', cls: 'pm51-media-folder-custom' }), 'Used when Another folder is chosen above.')),
      primaryLabel: 'Save', onPrimary: wrap => { const sel = wrap.querySelector('.pm51-media-folder')?.value; const custom = wrap.querySelector('.pm51-media-folder-custom')?.value.trim(); o.destination = sel === '__custom' ? (custom || o.destination || 'Ask each time') : sel; save(); }
    });
  }

  function advancedSection(r) {
    const o = r.output || (r.output = {});
    const data = k => ({ route: r.id, key: k });
    const optionRows = ADV_KEYS.filter(k => o[k] != null).map(k => {
      const opts = optionsFor(r, k) || [];
      const values = opts.map(x => Array.isArray(x) ? x[0] : x);
      const list = values.includes(o[k]) ? opts : [[o[k], optLabel(k, o[k])], ...opts];
      return { label: LABELS[k] || humanize(k), control: PM51.select(o[k], list, { action: 'pm51-media-option', data: data(k), label: LABELS[k] || humanize(k) }) };
    });
    const storage = PM51.rows([
      { label: 'Folder', value: o.destination || 'Not saved (shown in chat only)', action: { label: 'Change', icon: 'folder', action: 'pm51-media-saveto', data: { route: r.id } } },
      ...optionRows.filter(x => ['Extra details in the file', 'Overwriting files', 'Keep for'].includes(x.label))
    ]);
    const options = optionRows.filter(x => !['Extra details in the file', 'Overwriting files', 'Keep for'].includes(x.label));
    return PM51.advanced([
      PM51.section({ title: 'Output storage details', body: storage }),
      options.length ? PM51.section({ title: 'Options', body: PM51.rows(options) }) : '',
      PM51.section({ title: 'Exact endpoint', help: 'Read-only. What this ability actually uses right now.', body: PM51.kv([['Service', unset(r) ? 'Not chosen' : providerName(r.primary.provider)], ['Model', unset(r) ? 'Not chosen' : r.primary.model], ['Account', accountText(r.primary)], ['Fallbacks', fallbackText(r)], ['Last check', lastCheck(r)]]) + '<div class="pm51-media-inline">' + PM51.btn({ label: 'Run diagnostics', icon: 'test', small: true, action: 'pm51-media-diagnostics', data: { route: r.id } }) + '</div>' })
    ].join(''));
  }
  PM51.onChange('media-option', el => { const r = byId(ds(el, 'route')); r.output[ds(el, 'key')] = el.value; save(); });

  function detailFor(r) {
    const off = r.status === 'disabled';
    const data = { route: r.id };
    const rows = [
      { label: 'What it does', value: WHAT[r.id] || '' },
      { label: 'Uses', help: accountText(r.primary), value: off ? 'Off' : endpointText(r.primary) },
      { label: 'If that fails, use', value: fallbackText(r), action: { label: 'Edit', icon: 'edit', action: 'pm51-media-fallbacks', data } },
      { label: 'Output', value: outputText(r), action: { label: 'Change', icon: 'sliders', action: 'pm51-media-output', data } },
      { label: 'Save to', value: r.output?.destination || 'Not saved (shown in chat only)', action: { label: 'Change', icon: 'folder', action: 'pm51-media-saveto', data } },
      { label: 'Last check', help: off ? 'Turn the ability on to check it.' : 'One small request through the main service.', value: lastCheck(r), action: { label: 'Check route', icon: 'test', action: 'pm51-media-check', data, disabled: off || unset(r), reason: off ? 'Turn the ability on first.' : 'Choose a service first.' } }
    ];
    return {
      title: r.name, pill: PM51.pill(plain(r)), subtitle: SHORT[r.id] || '',
      primary: off ? { label: 'Turn on', icon: 'play', action: 'pm51-media-turn-on', data } : { label: unset(r) ? 'Choose service' : 'Change service', icon: 'route', action: 'pm51-media-change', data },
      menu: anchor => PM51.menu(anchor, [
        { label: off ? 'Turn on' : 'Turn off', icon: off ? 'play' : 'pause', onClick: () => off ? turnOn(r) : turnOff(r) },
        { label: 'Reset to default', icon: 'restore', onClick: () => PM51.confirm(`Reset ${r.name}?`, 'The service, fallbacks, and output settings go back to the example defaults.', 'Reset', () => { resetRoute(r); PM51.toast(`${r.name} reset`, 'Defaults are back.'); }) }
      ], r.name),
      body: PM51.section({ title: 'Route', body: PM51.rows(rows) }) + advancedSection(r)
    };
  }
  function turnOff(r) { r.prevStatus = r.status; r.status = 'disabled'; save(); PM51.toast(`${r.name} is off`, 'The assistant will say it cannot do this until you turn it back on.'); }
  function turnOn(r) { r.status = r.prevStatus || (unset(r) ? 'setup' : 'ready'); delete r.prevStatus; save(); }
  function resetRoute(r) { const d = (D.mediaRoutes || []).find(x => x.id === r.id); if (!d) return; const i = all().indexOf(r); all()[i] = clone(d); save(); }

  function render() {
    const r = current();
    const body = PM51.listDetail({
      id: ID, rosterTitle: 'Media abilities', count: all().length,
      items: all().map(x => ({ id: x.id, title: x.name, meta: SHORT[x.id] || '', tone: tone(x), avatar: icon(x.icon || 'image'), selected: x.id === r.id })),
      detail: detailFor(r)
    });
    return PM51.page({ id: ID, key: KEY, body, quiet: [{ label: 'Reset all media abilities to defaults', action: 'pm51-media-reset' }, { label: 'How media abilities work', action: 'pm51-media-help' }, { label: 'Run diagnostics', action: 'pm51-media-diagnostics' }] });
  }
  PM51.manager('mediaRoutes', { render });

  const route = el => byId(ds(el, 'route'));
  PM51.on('media-change', el => changeServicePanel(route(el)));
  PM51.on('media-fallbacks', el => fallbackPanel(route(el)));
  function fallbackPanel(r) { PM51.panel({ title: 'If that fails, use', subtitle: `${r.name} · after the main service fails`, body: fallbackBody(r), primaryLabel: 'Done', onPrimary: () => save() }); }
  PM51.on('media-output', el => outputPanel(route(el)));
  PM51.on('media-saveto', el => saveToPanel(route(el)));
  PM51.on('media-turn-on', el => turnOn(route(el)));
  PM51.on('media-check', el => { const r = route(el); PM51.check({ title: `Check ${r.name}`, steps: [
    { title: 'Service signed in', desc: `${endpointText(r.primary)} · ${accountText(r.primary)}` },
    { title: 'Model supports this', desc: CAP[r.id] ? `Needs ${CAP[r.id] === 'vision' ? 'picture understanding' : 'picture making'}` : 'Asked of the service', status: 'Example', tone: 'info' },
    { title: 'One small request', desc: r.id === 'artifact-output' ? 'Make a one-page test document' : `A tiny ${SHORT[r.id].toLowerCase().replace(/^make |^look at |^turn |^read /, '')} test`, status: 'Example', tone: 'info' },
    { title: 'Saved where expected', desc: r.output?.destination || 'Shown in chat only', status: 'Example', tone: 'info' }
  ] }); });
  PM51.on('media-diagnostics', el => { const r = ds(el, 'route') ? byId(ds(el, 'route')) : null; PM51.check({ title: r ? `${r.name} diagnostics` : 'Media abilities diagnostics', steps: r ? [
    { title: 'Settings readable', desc: 'Service, fallbacks, and output resolved' },
    { title: 'Main service reachable', desc: endpointText(r.primary), status: 'Example', tone: 'info' },
    { title: 'Folder writable', desc: r.output?.destination || 'No folder needed', status: 'Example', tone: 'info' }
  ] : [
    { title: 'Abilities listed', desc: `${all().length} abilities` },
    { title: 'Ready abilities', desc: `${all().filter(x => plain(x) === 'Ready').length} with a working service` },
    { title: 'Folders writable', desc: 'Project artifacts folders', status: 'Example', tone: 'info' }
  ] }); });
  PM51.on('media-reset', () => PM51.confirm('Reset all media abilities?', 'Every ability goes back to its example service, fallbacks, and output settings.', 'Reset', () => { state.mediaRoutes = clone(D.mediaRoutes); save(); PM51.toast('Media abilities reset', 'Defaults are back.'); }, true));
  PM51.on('media-help', () => PM51.panel({
    title: 'How media abilities work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Each ability is one kind of thing the assistant can make or look at. You choose which service does it, how the result is made, and where it is saved.</p>')
      + PM51.panelSection('The seven abilities', PM51.kv(all().map(x => [x.name, WHAT[x.id] || ''])))
      + PM51.panelSection('Where results go', '<p class="pm51-ps-text">Results saved into project folders stay with the project and are included in backups. Results that are only shown in chat are not kept.</p>')
  }));
})();
