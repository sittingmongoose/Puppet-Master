/* Media & Output — seven fixed media abilities: which service does each one, its defaults, and where results go.
   Two tabs:
   - Abilities: the page's two switches (hand back files, make media) above the list. Each ability draws its own switch,
     the service and backups it uses, and its defaults. Where the inventory has a row for a choice (picture size,
     voice, video length, the picture service, the vision backup...) the ability draws that row; the manager no longer
     keeps a second copy with other values (image quality, voice, retention and per-ability folders used to disagree).
   - Pictures & files: what the assistant may take in, the results folder and how long results are kept.
   Whether an ability can run follows the page switches: making media needs "Let the assistant make media", handing
   anything back needs "Hand back files and media", and looking at pictures or recordings needs "Accept pictures and
   files". Each ability says which one is off instead of claiming to be ready. */
(function () {
  const ID = 'media';
  const KEY = 'media-routes';
  const TABS = [{ id: 'abilities', label: 'Abilities' }, { id: 'files', label: 'Pictures & files' }];
  const all = () => state.mediaRoutes;
  const current = () => all().find(r => r.id === PM51.sel(ID, 'image-generation')) || all()[0];
  const byId = id => all().find(r => r.id === id) || current();
  const SHORT = { 'image-generation': 'Make pictures', 'image-understanding': 'Look at pictures', transcription: 'Turn speech into text', 'text-to-speech': 'Read text aloud', 'audio-generation': 'Make sounds and music', 'video-generation': 'Make short videos', 'artifact-output': 'Make documents and files' };
  const WHAT = { 'image-generation': 'Makes pictures from a description.', 'image-understanding': 'Looks at pictures and screenshots and describes what is in them.', transcription: 'Turns recordings and speech into text.', 'text-to-speech': 'Reads text aloud in a chosen voice.', 'audio-generation': 'Makes sound effects and music from a description.', 'video-generation': 'Makes short video clips from a description.', 'artifact-output': 'Makes documents, spreadsheets, and slide decks.' };
  const CAP = { 'image-generation': 'image-generation', 'image-understanding': 'vision' };
  const LAST_CHECK = { 'image-generation': '1 h ago', 'image-understanding': '2 h ago', 'text-to-speech': 'yesterday', 'artifact-output': '3 h ago' };
  const MAKES = ['image-generation', 'text-to-speech', 'audio-generation', 'video-generation'];
  const HANDS_BACK = [...MAKES, 'artifact-output'];
  const TAKES_IN = ['image-understanding', 'transcription'];
  const S = {
    output: 'media.io.media-output', master: 'media.capabilities.master', input: 'media.io.media-input', kinds: 'media.capabilities.enabled-types',
    provider: 'media.image.provider', model: 'media.image.model', vision: 'media.io.vision-bridge', visionBackup: 'media.io.vision-fallback-model',
    folder: 'media.io.artifacts-location'
  };
  /* The inventory rows each ability draws; search and Details land on the ability that owns them. */
  const SWITCH = { 'image-understanding': S.vision, 'text-to-speech': 'media.capabilities.tts', 'audio-generation': 'media.capabilities.music', 'video-generation': 'media.capabilities.video' };
  const DEFAULTS = {
    'image-generation': ['media.capabilities.aspect-ratio', 'media.capabilities.image-size', 'media.capabilities.image-quality', 'media.capabilities.image-count', 'media.capabilities.image-format'],
    transcription: ['media.io.voice-input'],
    'text-to-speech': ['media.capabilities.tts-voice'],
    'audio-generation': ['media.capabilities.music-bpm'],
    'video-generation': ['media.capabilities.video-duration', 'media.capabilities.video-resolution']
  };
  const MORE = { 'image-generation': ['media.capabilities.response-format', 'media.capabilities.seed', 'media.capabilities.prompt-optimizer'] };
  const OWNS = Object.assign({ [S.provider]: 'image-generation', [S.model]: 'image-generation', [S.visionBackup]: 'image-understanding' },
    ...Object.entries(SWITCH).map(([k, id]) => ({ [id]: k })),
    ...Object.entries(DEFAULTS).concat(Object.entries(MORE)).map(([k, ids]) => Object.fromEntries(ids.map(id => [id, k]))));
  /* The picture service is one inventory choice; each option needs a signed-in service (and, for two of them, an
     OpenAI API key account rather than a ChatGPT plan). */
  const PICTURE = {
    'OpenAI/Codex subscription': { short: 'Included in your plan',  svc: 'openai-codex', label: 'ChatGPT / Codex plan', meta: 'Uses the pictures included in your ChatGPT plan', kind: 'chatgpt', model: 'GPT Image' },
    'OpenAI gpt-image-2': { short: 'Paid per picture',  svc: 'openai-codex', label: 'GPT Image 2 with an OpenAI API key', meta: 'Paid per picture', kind: 'api_key', model: 'GPT Image 2' },
    'OpenAI Responses image_generation': { short: 'Paid per picture',  svc: 'openai-codex', label: 'Pictures inside OpenAI replies', meta: 'An API key account; the picture comes back in the reply', kind: 'api_key', model: 'Picture tool' },
    'MiniMax Image-01': { short: 'MiniMax Coding Plan',  svc: 'minimax-coding', label: 'MiniMax Image-01', meta: 'Through your MiniMax Coding Plan', model: 'Image-01' },
    'Gemini Direct': { short: 'Paid per picture',  svc: 'gemini-direct', label: 'Gemini API', meta: 'Gemini picture models, paid per picture', model: 'Gemini image model' },
    'Antigravity gemini-3.1-flash-image': { short: 'Your Google plan',  svc: 'antigravity', label: 'Google Antigravity', meta: 'Gemini 3.1 Flash Image through your Google plan', model: 'Gemini 3.1 Flash Image' }
  };
  /* The manager's own choices, only where the inventory has no row. Voice, picture format and quality, video quality,
     retention and folders are inventory rows now and were removed here. */
  const OWN = {
    detail: { label: 'How closely to look', options: [['Adaptive', 'Adjust to the picture'], ['Low', 'Quick look (cheaper)'], ['High', 'Every detail and small text']] },
    ocr: { label: 'Read text in pictures', options: [['Only when needed', 'Only when needed'], ['Always', 'Always'], ['Never', 'Never']] },
    format: {
      label: 'File type',
      by: { transcription: [['Text + timestamps', 'Text with times'], ['Plain text', 'Plain text'], ['Subtitles (SRT)', 'Subtitles (SRT)']], 'text-to-speech': [['WAV', 'WAV (best quality)'], ['MP3', 'MP3 (smaller)'], ['OGG', 'OGG (smallest)']], 'audio-generation': [['WAV', 'WAV (best quality)'], ['MP3', 'MP3 (smaller)'], ['OGG', 'OGG (smallest)']], 'video-generation': [['MP4', 'MP4 (plays everywhere)'], ['WebM', 'WebM (smaller)']] }
    },
    language: { label: 'Language', options: ['Auto-detect', 'English', 'Spanish', 'German', 'French', 'Japanese'].map(x => [x, x === 'Auto-detect' ? 'Work it out' : x]) },
    speakers: { label: 'Speakers', options: [['Detect when supported', 'Tell speakers apart when possible'], ['Single speaker', 'Treat as one speaker'], ['Off', 'Do not label speakers']] },
    duration: { label: 'Longest clip', options: [['Ask', 'Ask each time'], ['Up to 30 s', 'Up to 30 seconds'], ['Up to 2 min', 'Up to 2 minutes'], ['Up to 10 min', 'Up to 10 minutes']] },
    metadata: { label: 'Extra details in the file', options: [['Preserve prompt receipt', 'Keep the prompt with the file'], ['Strip everything', 'Keep nothing extra']] },
    overwrite: { label: 'When a file already exists', options: [['Never without approval', 'Ask me first'], ['Always', 'Replace it']] }
  };
  const OWN_KEYS = { 'image-understanding': ['detail', 'ocr'], transcription: ['format', 'language', 'speakers'], 'text-to-speech': ['format'], 'audio-generation': ['format', 'duration'], 'video-generation': ['format'], 'artifact-output': ['overwrite'] };
  const OWN_MORE = { 'image-generation': ['metadata'] };
  const FILE_TYPES = [['PDF', 'PDF'], ['DOCX', 'Word'], ['PPTX', 'PowerPoint'], ['XLSX', 'Excel'], ['CSV', 'CSV'], ['HTML', 'Web page'], ['MD', 'Markdown']];
  const SUBFOLDER = { 'image-generation': 'images', 'text-to-speech': 'audio', 'audio-generation': 'audio', 'video-generation': 'video', 'artifact-output': 'exports' };
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const commit = (id, v) => { if (commitSettingValue(id, v)) { saveState(); o55Notify(id, v); return true; } return false; };
  const on = id => { const v = PM51.value(id); return !!v && v !== 'off'; };

  PM51.style(`
    #panel-settings .pm51-media-order .pm51-row-control .icon-btn { width: 28px; height: 28px; }
    #panel-settings .o55-media-switches { margin-bottom: 14px; }
    #panel-settings .o55-media-path { font-family: var(--k3-mono, ui-monospace, monospace); font-size: 12px; overflow-wrap: anywhere; }
  `);

  /* ---------- migration: one copy of each choice ----------------------------------------------------------------- */
  const OLD_FOLDER = { 'Project artifacts/images': 'images', 'Project artifacts/audio': 'audio', 'Project artifacts/video': 'video', 'Project artifacts/exports': 'exports' };
  function migrate() {
    if (!Array.isArray(state.mediaRoutes) || PM51.s().o55MediaV2) return;
    const defaultModels = PM51.value(S.model) !== 'Per-task override';
    state.mediaRoutes.forEach(r => {
      const o = r.output || (r.output = {});
      if (r.id === 'image-generation') { delete o.format; delete o.quality; }
      if (r.id === 'video-generation') delete o.quality;
      if (r.id === 'text-to-speech') delete o.voice;
      delete o.retention;
      if (o.overwrite === 'Ask each time') o.overwrite = 'Never without approval';
      if (o.destination != null) o.destination = OLD_FOLDER[o.destination] || (o.destination === 'Ask each time' ? '@ask' : o.destination);
      if (typeof o.formats === 'string') o.formats = o.formats.split(/\s*,\s*/).filter(Boolean);
      /* "The service's default model" is the inventory's project-wide mode; routes keep a model only when it is on */
      if (defaultModels && r.primary && r.primary.provider !== 'Built-in') r.primary.model = '';
      if (r.status === 'disabled' && (SWITCH[r.id] || r.id === 'image-generation')) r.status = r.prevStatus || 'ready';
    });
    PM51.s().o55MediaV2 = true; saveState();
  }

  /* ---------- reading the state ---------------------------------------------------------------------------------- */
  const svcLabel = n => PM51.serviceName(n);
  const pictureChoice = () => PICTURE[PM51.value(S.provider)] || null;
  const serviceOf = id => (state.providers || []).find(p => p.id === id);
  const primaryOf = r => {
    if (r.id !== 'image-generation') return r.primary;
    const pc = pictureChoice(); if (!pc) return { provider: 'Not configured', model: '', account: 'None' };
    return { provider: pc.label, model: r.primary && r.primary.picture === PM51.value(S.provider) ? r.primary.model : '', account: r.primary && r.primary.account, picture: true };
  };
  const unset = r => { const p = primaryOf(r); return !p || p.provider === 'Not configured'; };
  const abilityOn = r => SWITCH[r.id] ? on(SWITCH[r.id]) : r.id === 'image-generation' ? (PM51.value(S.kinds) || []).includes('image') : r.status !== 'disabled';
  /* the page switch that keeps an ability from running, if any */
  function blockedBy(r) {
    if (TAKES_IN.includes(r.id) && !on(S.input)) return { id: S.input, text: 'Accepting pictures and files is off under Pictures & files.' };
    if (HANDS_BACK.includes(r.id) && !on(S.output)) return { id: S.output, text: 'Handing back files and media is off, so answers are text only.' };
    if (MAKES.includes(r.id) && !on(S.master)) return { id: S.master, text: 'Making media is off for the whole project.' };
    return null;
  }
  const plain = r => blockedBy(r) || !abilityOn(r) ? 'Off' : !unset(r) && r.status !== 'setup' ? 'Ready' : 'Not set up';
  const tone = r => PM51.tone(plain(r));
  const modelText = e => e.model || 'default model';
  const endpointText = e => !e || e.provider === 'Not configured' ? 'Nothing yet' : e.provider === 'Built-in' ? `Built-in ${e.model}` : e.picture ? `${e.provider} · ${modelText(e)}` : `${svcLabel(e.provider)} · ${modelText(e)}`;
  const accountText = e => !e || e.provider === 'Not configured' ? 'Choose a service to begin.' : e.provider === 'Built-in' || !e.account || e.account === 'None' || e.account === 'No account' ? 'No account needed.' : `Account: ${e.account}.`;
  const lastCheck = r => r.lastCheck || (plain(r) === 'Ready' ? `Passed ${LAST_CHECK[r.id] || '2 h ago'}` : 'Not checked');
  const folderRoot = () => String(PM51.value(S.folder) || '').replace(/^\$\{PROJECT_ROOT\}\/?/, '').replace(/\/+$/, '');
  function saveText(r) {
    const d = (r.output || {}).destination;
    if (d === '@ask') return 'Ask me each time';
    if (d === '@chat' || d == null) return 'Only shown in the chat';
    return `${folderRoot()}/${d}`;
  }
  const keepText = () => { const v = PM51.value('media.io.artifact-retention'); return v === 'Unlimited' ? 'Kept until you delete them.' : `Kept for ${PM51.valueLabel('media.io.artifact-retention', v)}.`; };
  function fallbackText(r) {
    if (r.id === 'image-understanding' && PM51.value(S.visionBackup) === 'auto') return 'The best model available at the time';
    const list = (r.fallbacks || []).filter(f => f.enabled !== false);
    if (!list.length) return 'Nothing. The ability stops and tells you.';
    return list.map(endpointText).join(', then ');
  }

  /* ---------- services ------------------------------------------------------------------------------------------ */
  function serviceOptions(r) {
    const list = (state.providers || []).filter(p => p.installed && p.signedIn && p.status !== 'disabled' && (p.models || []).some(m => m.enabled)).map(p => ({ id: p.id, label: p.name, models: p.models.filter(m => m.enabled).map(m => ({ id: m.id, name: m.name, fit: !CAP[r.id] || (m.caps || []).includes(CAP[r.id]) })), accounts: (p.accounts || []).filter(x => x.active).map(x => ({ id: x.id, name: x.nickname })) }));
    if (r.id === 'artifact-output') list.push({ id: 'tool', label: 'Built-in renderer', models: [{ id: 'tool', name: 'Artifact renderer', fit: true }], accounts: [] });
    return list;
  }
  /* Why a picture service cannot be chosen yet, or '' when it can. */
  function pictureBlock(pc) {
    const p = serviceOf(pc.svc); if (!p) return 'Not available in this preview.';
    if (!p.signedIn) return `Sign in to ${p.name} under AI Services first.`;
    if (pc.kind) {
      const fits = (p.accounts || []).some(x => ((x.props || {})['ai.accounts.codex-auth-family'] || 'chatgpt') === pc.kind);
      if (!fits) return pc.kind === 'api_key' ? `Add a ${p.name} account that signs in with an API key first.` : `Add a ${p.name} account that signs in with ChatGPT first.`;
    }
    return '';
  }
  const DEFAULT_MODEL = '';
  const modelChoices = (svc, fit) => [{ value: DEFAULT_MODEL, label: 'The service\'s default model', meta: 'Recommended' }, ...svc.models.map(m => ({ value: m.name, label: m.name, meta: fit && !m.fit ? 'May not support this' : '' }))];
  const modelField = (svc, want, fit = true) => PM51.field('Model', PM51.select(want || DEFAULT_MODEL, modelChoices(svc, fit), { label: 'Model', cls: 'pm51-media-model' }), svc.id === 'tool' ? 'Built in. Nothing is sent to an AI service.' : 'Only models you have turned on appear here.');
  const accountField = (svc, want) => svc.accounts.length > 1 ? PM51.field('Account', PM51.select(want, svc.accounts.map(x => [x.name, x.name]), { label: 'Account', cls: 'pm51-media-account' }), 'The account whose usage this ability spends.') : svc.accounts.length ? PM51.note(`Uses ${svc.accounts[0].name}.`) : PM51.note('No account needed.');
  /* "The service's default model" everywhere is the inventory's Service default; picking a model anywhere is the override. */
  function syncModelMode() {
    const any = all().some(x => x.primary && x.primary.provider !== 'Built-in' && x.primary.model);
    commit(S.model, any ? 'Per-task override' : 'Service default');
  }

  function picturePanel(r) {
    const cur = PM51.value(S.provider);
    const first = Object.keys(PICTURE).find(k => !pictureBlock(PICTURE[k]));
    const want = PICTURE[cur] ? cur : first || 'None';
    const opts = [{ value: 'None', label: 'No service', meta: 'Pictures are not made' }, ...Object.entries(PICTURE).map(([v, pc]) => { const why = pictureBlock(pc); return { value: v, label: pc.label, meta: why ? (/API key/.test(why) ? 'Needs an API key' : 'Needs sign-in') : pc.short, disabled: !!why, reason: why }; })];
    const models = k => { const pc = PICTURE[k]; if (!pc) return ''; return PM51.field('Model', PM51.select(r.primary && r.primary.picture === k ? r.primary.model : DEFAULT_MODEL, [{ value: DEFAULT_MODEL, label: 'The service\'s default model', meta: 'Recommended' }, { value: pc.model, label: pc.model }], { label: 'Model', cls: 'pm51-media-model' })); };
    PM51.panel({
      title: PICTURE[cur] ? 'Change the picture service' : 'Choose the picture service', subtitle: 'Image Generation · make pictures', icon: 'image',
      body: PM51.panelSection('Service', PM51.field('Service that makes pictures', PM51.select(want, opts, { action: 'pm51-media-picture', label: 'Service that makes pictures', cls: 'pm51-media-svc' }), 'Greyed out services need a sign-in first. Set them up under AI Services.'))
        + PM51.panelSection('Model', `<div class="pm51-media-model-slot">${models(want)}</div>`),
      primaryLabel: 'Use this service', onPrimary: wrap => {
        const v = wrap.querySelector('.pm51-media-svc')?.value || 'None';
        if (v !== 'None' && pictureBlock(PICTURE[v])) { PM51.toast('Not available yet', pictureBlock(PICTURE[v]), 'info'); return false; }
        const model = v === 'None' ? '' : wrap.querySelector('.pm51-media-model')?.value || '';
        const p = PICTURE[v] ? serviceOf(PICTURE[v].svc) : null;
        r.primary = v === 'None' ? { provider: 'Not configured', model: '', account: 'None' } : { provider: PICTURE[v].label, picture: v, model, account: ((p && p.accounts) || []).find(x => x.active)?.nickname || '' };
        r.lastCheck = 'Not checked since the change';
        commit(S.provider, v); syncModelMode(); save();
        PM51.toast('Picture service saved', v === 'None' ? 'Pictures are not made until you choose a service.' : `Image Generation now uses ${PICTURE[v].label}.`);
      }
    });
  }
  PM51.onChange('media-picture', el => {
    const body = el.closest('.pm51-panel-body'); const slot = body && body.querySelector('.pm51-media-model-slot'); if (!slot) return;
    const pc = PICTURE[el.value];
    slot.innerHTML = pc ? PM51.field('Model', PM51.select(DEFAULT_MODEL, [{ value: DEFAULT_MODEL, label: 'The service\'s default model', meta: 'Recommended' }, { value: pc.model, label: pc.model }], { label: 'Model', cls: 'pm51-media-model' })) : PM51.note('Pictures are not made until you choose a service.');
  });

  function changeServicePanel(r) {
    if (r.id === 'image-generation') { picturePanel(r); return; }
    const services = serviceOptions(r);
    if (!services.length) { PM51.unavailable('Change service', 'Sign in to an AI service under AI Services first.'); return; }
    const curName = r.primary?.provider === 'Built-in' ? 'Built-in renderer' : svcLabel(r.primary?.provider);
    const cur = services.find(s => s.label === curName) || services.find(s => s.models.some(m => m.fit)) || services[0];
    const svcOpts = services.map(s => ({ value: s.id, label: s.label, meta: CAP[r.id] && !s.models.some(m => m.fit) ? 'No model here can do this' : '' }));
    const body = PM51.panelSection('Service', PM51.field('Service', PM51.select(cur.id, svcOpts, { action: 'pm51-media-svc', data: { route: r.id }, label: 'Service', cls: 'pm51-media-svc' }), 'Only services you are signed in to appear here. Set more up under AI Services.'))
      + PM51.panelSection('Model', `<div class="pm51-media-model-slot">${modelField(cur, cur.label === curName ? r.primary?.model : '', !!CAP[r.id])}</div>`)
      + PM51.panelSection('Account', `<div class="pm51-media-account-slot">${accountField(cur, r.primary?.account)}</div>`);
    PM51.panel({
      title: unset(r) ? 'Choose service' : 'Change service', subtitle: `${r.name} · ${SHORT[r.id] || ''}`, body,
      primaryLabel: 'Use this service', onPrimary: wrap => {
        const svcId = wrap.querySelector('.pm51-media-svc')?.value; const svc = services.find(s => s.id === svcId) || services[0];
        const model = wrap.querySelector('.pm51-media-model')?.value || '';
        const account = wrap.querySelector('.pm51-media-account')?.value || svc.accounts[0]?.name || '';
        const fit = !model || svc.models.find(m => m.name === model)?.fit !== false;
        r.primary = svc.id === 'tool' ? { provider: 'Built-in', model: 'Artifact renderer', account: 'No account' } : { provider: svc.label, model, account };
        if (r.status === 'setup') r.status = 'ready';
        r.lastCheck = 'Not checked since the change';
        if (svc.id !== 'tool') syncModelMode();
        save();
        if (fit) PM51.toast('Service changed', `${r.name} now uses ${endpointText(r.primary)}.`);
        else PM51.toast('Service changed', `${model} may not be able to ${SHORT[r.id].toLowerCase()}. Run a check to be sure.`, 'info');
      }
    });
  }
  PM51.onChange('media-svc', el => {
    const r = byId(ds(el, 'route')); const body = el.closest('.pm51-panel-body'); if (!body) return;
    const svc = serviceOptions(r).find(s => s.id === el.value); if (!svc) return;
    const m = body.querySelector('.pm51-media-model-slot'); if (m) m.innerHTML = modelField(svc, '', !!CAP[r.id]);
    const x = body.querySelector('.pm51-media-account-slot'); if (x) x.innerHTML = accountField(svc, svc.accounts[0]?.name);
  });

  /* ---------- backups ------------------------------------------------------------------------------------------- */
  function fallbackBody(r) {
    const fb = r.fallbacks || (r.fallbacks = []);
    const auto = r.id === 'image-understanding' && PM51.value(S.visionBackup) === 'auto';
    const mode = r.id === 'image-understanding' ? PM51.panelSection('Which backup', PM51.segmented(auto ? 'auto' : 'choose a specific model', [['auto', 'The best one available'], ['choose a specific model', 'Models I pick']], { action: 'pm51-media-vision-mode', data: { route: r.id }, label: 'Which backup' }), 'Used when the main model cannot look at a picture.') : '';
    if (auto) return mode + PM51.note('Puppet Master picks a signed-in model that can see pictures, starting with the one you use most.');
    const rows = fb.map((f, i) => ({
      label: endpointText(f), help: accountText(f),
      control: PM51.iconBtn({ icon: 'up', label: 'Move up', action: 'pm51-media-fb-move', data: { route: r.id, index: i, dir: -1 }, disabled: i === 0, reason: 'Already first.' }) + PM51.iconBtn({ icon: 'down', label: 'Move down', action: 'pm51-media-fb-move', data: { route: r.id, index: i, dir: 1 }, disabled: i === fb.length - 1, reason: 'Already last.' }) + PM51.iconBtn({ icon: 'trash', label: 'Remove', action: 'pm51-media-fb-remove', data: { route: r.id, index: i } }) + PM51.toggle(f.enabled !== false, { action: 'pm51-media-fb-toggle', data: { route: r.id, index: i }, label: `Use ${endpointText(f)}` })
    }));
    const options = [{ value: '', label: 'Choose a service…' }, ...serviceOptions(r).flatMap(s => s.models.map(m => ({ value: `${s.id}::${m.name}`, label: `${s.label} · ${m.name}`, meta: CAP[r.id] && !m.fit ? 'May not support this' : '', group: s.label })))];
    return mode + PM51.panelSection('Tried in this order', rows.length ? PM51.rows(rows, { cls: 'pm51-media-order' }) : PM51.note('No backups yet. If the main service fails, this ability stops and tells you.'), 'Each one is only used when the one above it fails.')
      + PM51.panelSection('Add another', PM51.field('Service and model', PM51.select('', options, { action: 'pm51-media-fb-add', data: { route: r.id }, label: 'Add a backup' })));
  }
  const repaint = (el, r) => { const body = el.closest('.pm51-panel-body'); if (body) body.innerHTML = fallbackBody(r); saveState(); };
  PM51.on('media-fb-move', el => { const r = byId(ds(el, 'route')); const i = Number(ds(el, 'index')), to = i + Number(ds(el, 'dir')); if (to < 0 || to >= r.fallbacks.length) return; const [x] = r.fallbacks.splice(i, 1); r.fallbacks.splice(to, 0, x); repaint(el, r); });
  PM51.on('media-fb-remove', el => { const r = byId(ds(el, 'route')); r.fallbacks.splice(Number(ds(el, 'index')), 1); repaint(el, r); });
  PM51.on('media-fb-toggle', el => { const r = byId(ds(el, 'route')); const f = r.fallbacks[Number(ds(el, 'index'))]; if (!f) return; f.enabled = f.enabled === false; repaint(el, r); });
  PM51.onChange('media-fb-add', el => {
    const r = byId(ds(el, 'route')); if (!el.value) return;
    const [svcId, model] = el.value.split('::'); const svc = serviceOptions(r).find(s => s.id === svcId); if (!svc) return;
    r.fallbacks.push(svc.id === 'tool' ? { provider: 'Built-in', model, account: 'No account', enabled: true } : { provider: svc.label, model, account: svc.accounts[0]?.name || '', enabled: true });
    repaint(el, r);
  });
  PM51.on('media-vision-mode', el => { const r = byId(ds(el, 'route')); commit(S.visionBackup, el.dataset.value); repaint(el, r); });
  function fallbackPanel(r) { PM51.panel({ title: 'If that fails, use', subtitle: `${r.name} · after the main service fails`, body: fallbackBody(r), primaryLabel: 'Done', onPrimary: () => save() }); }

  /* ---------- where results go ---------------------------------------------------------------------------------- */
  function saveToPanel(r) {
    const o = r.output || (r.output = {});
    const cur = o.destination == null ? '@chat' : o.destination;
    const where = cur === '@ask' || cur === '@chat' ? cur : 'folder';
    PM51.panel({
      title: 'Save to', subtitle: `${r.name} · where results are kept`, icon: 'folder',
      body: PM51.panelSection('Where', `<div class="pm51-media-where">${PM51.segmented(where, [['folder', 'A folder'], ['@ask', 'Ask each time'], ['@chat', 'Chat only']], { action: 'pm51-media-where', label: 'Where results go' })}</div>`)
        + `<div class="pm51-media-folder-part"${where === 'folder' ? '' : ' hidden'}>${PM51.panelSection('Folder', PM51.field('Folder name', PM51.input(where === 'folder' ? cur : SUBFOLDER[r.id] || 'results', { label: 'Folder name', cls: 'pm51-media-folder', placeholder: SUBFOLDER[r.id] || 'results' }), `Inside the results folder, ${folderRoot()}. Change that folder under Pictures & files.`))}</div>`,
      primaryLabel: 'Save', onPrimary: wrap => {
        const w = wrap.querySelector('.pm51-media-where button.active')?.dataset.value || where;
        const name = (wrap.querySelector('.pm51-media-folder')?.value || '').trim().replace(/^\/+|\/+$/g, '').replace(/\.\.+/g, '');
        o.destination = w === 'folder' ? (name || SUBFOLDER[r.id] || 'results') : w; save();
      }
    });
  }
  PM51.on('media-where', el => {
    el.parentElement.querySelectorAll('button').forEach(b => { const x = b === el; b.classList.toggle('active', x); b.setAttribute('aria-pressed', String(x)); });
    const part = el.closest('.pm51-panel-body')?.querySelector('.pm51-media-folder-part'); if (part) part.hidden = el.dataset.value !== 'folder';
  });

  /* ---------- one ability --------------------------------------------------------------------------------------- */
  const orow = ({ label, help, control, home, wide }) => `<div class="setting-row o55-row o55-scoped${wide ? ' is-wide' : ''}"${home ? ` data-setting-id="${a(home)}"` : ''}><div class="setting-copy"><div class="setting-label">${h(label)}</div>${help ? `<div class="setting-description">${h(help)}</div>` : ''}</div><div class="setting-control">${control}</div><span></span></div>`;
  const valueWith = (text, btn) => `<span class="pm51-row-value">${h(text)}</span>${btn ? PM51.btn(Object.assign({ small: true }, btn)) : ''}`;
  function ownRow(r, key) {
    const def = OWN[key]; const o = r.output || {}; const v = o[key];
    const opts = (def.by ? def.by[r.id] : def.options) || [];
    const list = opts.some(x => x[0] === v) ? opts : [[v, String(v)], ...opts];
    return orow({ label: def.label, control: PM51.select(v, list, { action: 'pm51-media-own', data: { route: r.id, key }, label: def.label }) });
  }
  function fileTypesRow(r) {
    const cur = (r.output || {}).formats || [];
    return orow({ label: 'File types it may make', wide: true, control: `<div class="chip-select o55-chips" role="group" aria-label="File types it may make">${FILE_TYPES.map(([v, l]) => { const x = cur.includes(v); return `<button type="button" class="${x ? 'active' : ''}" aria-pressed="${x}" data-action="pm51-media-filetype" data-route="${a(r.id)}" data-value="${a(v)}">${x ? icon('check') : ''}<span>${h(l)}</span></button>`; }).join('')}</div>` });
  }
  function switchRow(r) {
    if (SWITCH[r.id]) return PM51.bound.rows([SWITCH[r.id]]);
    if (r.id === 'image-generation') return PM51.scoped.rows([orow({ label: 'Make pictures', help: 'Off means pictures are never made, even when you ask.', home: S.kinds, control: PM51.toggle(abilityOn(r), { action: 'pm51-media-kind', data: { kind: 'image' }, label: 'Make pictures' }) })]);
    return PM51.scoped.rows([orow({ label: r.id === 'transcription' ? 'Turn speech into text' : 'Make documents and files', help: r.id === 'transcription' ? 'Recordings you share become text you can search.' : 'Documents, spreadsheets and slides you ask for.', control: PM51.toggle(abilityOn(r), { action: 'pm51-media-status', data: { route: r.id }, label: SHORT[r.id] }) })]);
  }
  function detailFor(r) {
    const data = { route: r.id };
    const block = blockedBy(r);
    const off = !!block || !abilityOn(r);
    const p = primaryOf(r);
    const uses = orow({
      label: 'Uses', help: accountText(p), home: r.id === 'image-generation' ? S.provider : null,
      control: valueWith(endpointText(p), { label: unset(r) ? 'Choose' : 'Change', icon: 'route', action: 'pm51-media-change', data })
    });
    const backup = orow({ label: 'If that fails, use', help: fallbackText(r), home: r.id === 'image-understanding' ? S.visionBackup : null, control: PM51.btn({ label: 'Edit', icon: 'edit', small: true, action: 'pm51-media-fallbacks', data }) });
    const check = orow({ label: 'Last check', help: off ? 'Turn the ability on to check it.' : 'One small request through the main service.', control: valueWith(lastCheck(r), { label: 'Check', icon: 'test', action: 'pm51-media-check', data, disabled: off || unset(r), reason: off ? 'Turn the ability on first.' : 'Choose a service first.' }) });
    const saveRow = SUBFOLDER[r.id] ? orow({ label: 'Saves to', help: keepText(), home: S.folder, control: `<span class="pm51-row-value o55-media-path">${h(saveText(r))}</span>${PM51.btn({ label: 'Change', icon: 'folder', small: true, action: 'pm51-media-saveto', data })}` }) : '';
    const defaults = (DEFAULTS[r.id] || []).length ? PM51.bound.rows(DEFAULTS[r.id]) : '';
    const own = (OWN_KEYS[r.id] || []).filter(k => (r.output || {})[k] != null).map(k => ownRow(r, k));
    if (r.id === 'artifact-output') own.unshift(fileTypesRow(r));
    const more = (MORE[r.id] || []).length || (OWN_MORE[r.id] || []).some(k => (r.output || {})[k] != null)
      ? PM51.advanced((MORE[r.id] ? PM51.bound.rows(MORE[r.id]) : '') + PM51.scoped.rows((OWN_MORE[r.id] || []).filter(k => (r.output || {})[k] != null).map(k => ownRow(r, k))))
      : '';
    const results = defaults + (own.length ? PM51.scoped.rows(own) : '') + (saveRow ? PM51.scoped.rows([saveRow]) : '');
    return {
      title: r.name, pill: PM51.pill(plain(r)), subtitle: SHORT[r.id] || '',
      primary: { label: unset(r) ? 'Choose service' : 'Change service', icon: 'route', action: 'pm51-media-change', data },
      menu: anchor => PM51.menu(anchor, [
        { label: 'Reset to the example', icon: 'restore', onClick: () => PM51.confirm(`Reset ${r.name}?`, 'Its service, backups and file choices go back to the example. Shared defaults such as picture size or voice are kept.', 'Reset', () => { resetRoute(r); PM51.toast(`${r.name} reset`, 'The example is back.'); }) }
      ], r.name),
      body: (block ? `<div class="o55-media-block">${PM51.note(block.text, 'info')}</div>` : '')
        + PM51.section({ title: 'Who does it', help: WHAT[r.id] || '', body: switchRow(r) + PM51.scoped.rows([uses, backup, check]) })
        + (results ? PM51.section({ title: r.id === 'image-understanding' ? 'How it looks' : r.id === 'transcription' ? 'Results' : 'Defaults', body: results }) : '')
        + more
    };
  }
  function resetRoute(r) {
    const d = (D.mediaRoutes || []).find(x => x.id === r.id); if (!d) return;
    const i = all().indexOf(r); const was = PM51.s().o55MediaV2; all()[i] = clone(d);
    PM51.s().o55MediaV2 = false; migrate(); PM51.s().o55MediaV2 = was || true; save();
  }
  PM51.onChange('media-own', el => { const r = byId(ds(el, 'route')); (r.output || (r.output = {}))[ds(el, 'key')] = el.value; saveState(); PM51.toast('Saved', `${r.name}: ${el.options[el.selectedIndex]?.textContent || el.value}.`, 'success'); });
  PM51.on('media-filetype', el => {
    const r = byId(ds(el, 'route')); const o = r.output || (r.output = {}); const cur = new Set(o.formats || []); const v = ds(el, 'value');
    if (cur.has(v) && cur.size === 1) { PM51.toast('Keep at least one', 'Turn the ability off instead if it should not make files.', 'info'); return; }
    cur.has(v) ? cur.delete(v) : cur.add(v); o.formats = FILE_TYPES.map(x => x[0]).filter(x => cur.has(x)); save();
  });
  PM51.on('media-kind', el => {
    const kinds = (PM51.value(S.kinds) || []).slice(); const k = ds(el, 'kind'); const i = kinds.indexOf(k);
    i >= 0 ? kinds.splice(i, 1) : kinds.push(k); commit(S.kinds, kinds); save();
  });
  PM51.on('media-status', el => { const r = byId(ds(el, 'route')); if (r.status === 'disabled') { r.status = r.prevStatus || (unset(r) ? 'setup' : 'ready'); delete r.prevStatus; } else { r.prevStatus = r.status; r.status = 'disabled'; } save(); });

  /* Video is switched on twice in the inventory (its own switch and the "video" kind); the two follow each other. */
  PM51.watch('media.capabilities.video', v => { const kinds = (PM51.value(S.kinds) || []).slice(); const has = kinds.includes('video'); if (!!v !== has) commit(S.kinds, v ? kinds.concat('video') : kinds.filter(x => x !== 'video')); });
  PM51.watch(S.kinds, v => { const has = Array.isArray(v) && v.includes('video'); if (has !== on('media.capabilities.video')) commit('media.capabilities.video', has); });

  /* ---------- page ---------------------------------------------------------------------------------------------- */
  const OTHER_KINDS = ['screenshot', 'diagram', 'recording'];
  PM51.scopedSetter('media-kinds', (id, v) => { const kinds = PM51.value(S.kinds) || []; commit(S.kinds, kinds.filter(k => !OTHER_KINDS.includes(k)).concat(OTHER_KINDS.filter(k => (v || []).includes(k)))); return ''; });
  function switches() {
    const kinds = (PM51.value(S.kinds) || []).filter(k => OTHER_KINDS.includes(k));
    const other = on(S.output) ? PM51.scoped.rows([PM51.scoped.row(S.kinds, kinds, { scope: 'media-kinds', choices: OTHER_KINDS, noChanged: true, label: 'Tools may also hand back', help: 'Screenshots, diagrams and screen recordings that tools make. Pictures and videos are switched on in their abilities below.' })]) : '';
    return `<div class="o55-media-switches">${PM51.section({ title: 'For the whole project', body: PM51.bound.rows([S.output]) + other + PM51.bound.rows([S.master]) })}</div>`;
  }
  function abilitiesTab() {
    const r = current();
    return switches() + PM51.listDetail({
      id: ID, rosterTitle: 'Media abilities', count: all().length,
      items: all().map(x => ({ id: x.id, title: x.name, meta: SHORT[x.id] || '', tone: tone(x), avatar: icon(x.icon || 'image'), selected: x.id === r.id })),
      detail: detailFor(r)
    });
  }
  function render() {
    migrate();
    const tab = PM51.tab(ID, 'abilities');
    const body = tab === 'abilities' ? abilitiesTab() : '<p class="o55-quiet-line">What the assistant may take in, where results are saved and how long they are kept.</p>';
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'How media abilities work', action: 'pm51-media-help' }, { label: 'Check every ability', action: 'pm51-media-diagnostics' }, { label: 'Reset abilities to the example', action: 'pm51-media-reset' }] });
  }
  PM51.manager('mediaRoutes', { render });
  PM51.owner(ID, id => {
    const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab);
    if (OWNS[id]) { PM51.setTab(ID, 'abilities'); PM51.setSel(ID, OWNS[id]); }
  });
  [S.output, S.master, S.input, S.kinds, S.provider, S.visionBackup, S.folder, 'media.io.artifact-retention', ...Object.values(SWITCH)].forEach(id => PM51.watch(id, () => PM51.refresh(ID, { swap: false })));

  /* ---------- actions ------------------------------------------------------------------------------------------- */
  const route = el => byId(ds(el, 'route'));
  PM51.on('media-change', el => changeServicePanel(route(el)));
  PM51.on('media-fallbacks', el => fallbackPanel(route(el)));
  PM51.on('media-saveto', el => saveToPanel(route(el)));
  PM51.on('media-check', el => { const r = route(el); const p = primaryOf(r); PM51.check({ title: `Check ${r.name}`, steps: [
    { title: 'Service signed in', desc: `${endpointText(p)} · ${accountText(p)}` },
    { title: 'Model can do this', desc: CAP[r.id] ? `Needs ${CAP[r.id] === 'vision' ? 'to see pictures' : 'to make pictures'}` : 'Asked of the service', status: 'Example', tone: 'info' },
    { title: 'One small request', desc: r.id === 'artifact-output' ? 'Make a one-page test document' : `A tiny ${SHORT[r.id].toLowerCase().replace(/^make |^look at |^turn |^read /, '')} test`, status: 'Example', tone: 'info' },
    SUBFOLDER[r.id] ? { title: 'Saved where expected', desc: saveText(r), status: 'Example', tone: 'info' } : null
  ].filter(Boolean) }); });
  PM51.on('media-diagnostics', () => PM51.check({ title: 'Check every media ability', steps: all().map(x => ({ title: x.name, desc: plain(x) === 'Ready' ? endpointText(primaryOf(x)) : (blockedBy(x) || {}).text || (abilityOn(x) ? 'Choose a service first.' : 'Switched off.'), status: plain(x) === 'Ready' ? 'Example' : plain(x), tone: plain(x) === 'Ready' ? 'info' : tone(x) })) }));
  PM51.on('media-reset', () => PM51.confirm('Reset every media ability?', 'Each ability goes back to its example service, backups and file choices. Shared defaults such as picture size, voice and the results folder are kept.', 'Reset', () => { state.mediaRoutes = clone(D.mediaRoutes); PM51.s().o55MediaV2 = false; migrate(); save(); PM51.toast('Media abilities reset', 'The example is back.'); }, true));
  PM51.on('media-help', () => PM51.panel({
    title: 'How media abilities work', icon: 'image',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Each ability is one kind of thing the assistant can make or look at. You choose which service does it, what it makes by default, and where results are saved.</p>')
      + PM51.panelSection('Three switches decide what can run', PM51.kv([['Hand back files and media', 'Off means every answer is text only.'], ['Let the assistant make media', 'Pictures, video, speech and music. Off by default.'], ['Accept pictures and files', 'Off means the assistant cannot look at pictures or recordings you share.']]))
      + PM51.panelSection('The seven abilities', PM51.kv(all().map(x => [x.name, WHAT[x.id] || ''])))
      + PM51.panelSection('Where results go', `<p class="pm51-ps-text">Results are saved in a folder inside your project (${h(folderRoot())}), so they stay with the project and are included in backups. Results shown only in the chat are not kept.</p>`)
  }));
})();
