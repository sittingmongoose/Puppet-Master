/* Settings Transfer — copy settings from another workspace, load them from a file, or save them to one.
   All three are one guided set-up (PM51.wizard) in the onboarding's voice: what to do, from or to where, which kinds
   of settings, a preview of exactly what changes and what is skipped, whose value wins where they differ, and a recap.
   What stays as it was before the wizard (the engine's rules, kept on purpose):
   - Copies go through the engine's exact-ID path: prepareDetachedSettingsCopy for the preview, then
     applyDetachedSettingsCopy with a restore point; History rolls a copy back with rollbackDetachedSettingsCopy.
   - Nothing is copied that was not previewed: the preview step prepares the copy, and Finish prepares it again.
   - Passwords, keys, sign-ins and device pairings are never copied (the engine drops credential ids).
   - Two categories that copy the same settings are picked together, so turning one off never copies it through its twin.
   A settings file is read into the same detached-copy path (a file snapshot in this preview), so a load previews,
   keeps a restore point and rolls back like a copy. "Keep what I changed here" keeps every setting you changed
   yourself in this project; the restore point still holds everything, so rolling back is exact. */
(function () {
  const ID = 'settings-transfer';
  const KEY = 'settings-transfer';
  /* The ten canonical selectors, each mapped to the engine's transfer categories (exact setting IDs live there). */
  const CATS = [
    ['Appearance & workspace', ['Appearance & input'], 'image'],
    ['Assistant chat', ['Appearance & input'], 'spark'],
    ['Providers, accounts, models & routing', ['AI providers & accounts', 'Model routing'], 'brain'],
    ['Planning & Goals', ['Goals & personas'], 'map'],
    ['Orchestrator & automation', ['Goals & personas'], 'rocket'],
    ['Tools & integrations', ['Source control', 'Project & sync'], 'plug'],
    ['Testing, browser & devices', ['Testing profiles'], 'test'],
    ['Permissions & security', ['Permissions'], 'shield'],
    ['Memory, retention & history', ['Context & memory behavior'], 'memory'],
    ['Notifications, usage & budgets', ['Notifications & sounds'], 'bell']
  ];
  const MODES = {
    copy: { title: 'Copy from another project', text: 'Bring over the setup you already like. That project is only read.', icon: 'copy', finish: 'Copy settings', eyebrow: 'Copy settings' },
    load: { title: 'Load from a file', text: 'A settings file saved earlier, here or on another computer.', icon: 'upload', finish: 'Load settings', eyebrow: 'Load settings' },
    save: { title: 'Save to a file', text: 'Keep a copy of this project’s settings, or share it.', icon: 'download', finish: 'Save file', eyebrow: 'Save settings' }
  };
  /* example settings files in this preview; each reads as a snapshot with real setting ids */
  const FILES = [
    { id: 'file:tastebook-settings', name: 'tastebook-settings.pmsettings', text: 'Saved from tastebook two days ago', icon: 'file', offset: 1, step: 1 },
    { id: 'file:studio-defaults', name: 'studio-defaults.pmsettings', text: 'From an older version (0.7); converted first', icon: 'archive', offset: 4, step: 2 }
  ];
  const h = PM51.h, a = PM51.a;

  const tr = () => { const s = PM51.s(); if (!s.transfer) s.transfer = { source: '', sourceLabel: '', cats: CATS.map(c => c[0]), previewed: false, previewCount: 0 }; return s.transfer; };
  const history = () => { if (!Array.isArray(state.settingsTransferHistory)) state.settingsTransferHistory = []; return state.settingsTransferHistory; };
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const engineCatsOf = cats => [...new Set(cats.flatMap(name => (CATS.find(c => c[0] === name) || [null, []])[1]))];
  const invalidate = () => { tr().previewed = false; tr().previewCount = 0; };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  const friendly = reason => {
    const r = String(reason || '');
    if (/differ|configured to keep/i.test(r)) return 'Nothing to copy: the chosen kinds of settings already match this project.';
    if (/at least one/i.test(r)) return 'Choose at least one kind of settings first.';
    if (/no readable|different readable/i.test(r)) return 'That project has no readable settings on this device.';
    if (/destination project/i.test(r)) return 'Open a workspace first, then copy settings into it.';
    return r.replace(/canonical\s*/gi, '').replace(/Settings owner/g, 'settings service');
  };
  const previewValue = v => { try { return transferPreviewValue(v); } catch (_e) { return typeof v === 'string' ? v : JSON.stringify(v); } };
  const rowLabel = id => { const f = findSettingGlobal(id); return f ? PM51.rowLabel(f.setting) : id; };
  const credentialIn = engineCats => [...new Set(engineCats.flatMap(c => (typeof TRANSFER_CATEGORY_SETTING_IDS === 'undefined' ? [] : TRANSFER_CATEGORY_SETTING_IDS[c] || [])))].filter(id => typeof TRANSFER_CREDENTIAL_IDS !== 'undefined' && TRANSFER_CREDENTIAL_IDS.has(id));

  /* Example source projects and files: a readable settings snapshot with real setting IDs and valid values, so preview
     and copy use the engine's exact-ID path. Never seeded when a live settings service is attached. */
  function exampleSnapshot(label, offset, step) {
    const rows = new Map(Object.values(window.PM12_REFERENCE?.byCat || {}).flatMap(c => c.settings || []).map(r => [r.id, r]));
    const currentValue = id => { const f = findSettingGlobal(id); if (f) return settingValue(f.setting); return state.settings[id] !== undefined ? state.settings[id] : rows.get(id)?.default; };
    const altered = id => {
      const row = rows.get(id); if (!row) return undefined; const cur = currentValue(id);
      if (row.type === 'toggle') return !cur;
      if ((row.type === 'select' || row.type === 'radio') && Array.isArray(row.options) && row.options.length > 1) { const i = Math.max(0, row.options.indexOf(cur)); return row.options[(i + step) % row.options.length]; }
      if (row.type === 'number' && typeof cur === 'number') return cur + step;
      return undefined;
    };
    const usable = id => { const r = rows.get(id); return r && !r.credential_ref_only && (typeof TRANSFER_CREDENTIAL_IDS === 'undefined' || !TRANSFER_CREDENTIAL_IDS.has(id)) && ['toggle', 'select', 'radio', 'number'].includes(r.type); };
    const pick = (cat, n) => (TRANSFER_CATEGORY_SETTING_IDS[cat] || []).filter(usable).slice(offset, offset + n);
    const settings = {};
    for (const cat of Object.keys(TRANSFER_CATEGORY_SETTING_IDS)) for (const id of pick(cat, cat === 'Appearance & input' ? 3 : 2)) { const v = altered(id); if (v !== undefined) settings[id] = v; }
    return { label, settings, example: true };
  }
  function ensureExampleSources() {
    if (window.PM_SETTINGS_REGISTRY) return;
    if (typeof TRANSFER_CATEGORY_SETTING_IDS === 'undefined') return;
    window.PM_SETTINGS_PROJECT_SNAPSHOTS = window.PM_SETTINGS_PROJECT_SNAPSHOTS || {};
    const snaps = window.PM_SETTINGS_PROJECT_SNAPSHOTS;
    if (!snaps.harbor) snaps.harbor = exampleSnapshot('harbor', 0, 1);
    if (!snaps.loom) snaps.loom = exampleSnapshot('loom', 3, 2);
  }
  /* a file is read into a snapshot the engine can preview and copy from (this preview's stand-in for parsing it) */
  function readFile(file) {
    if (window.PM_SETTINGS_REGISTRY || typeof TRANSFER_CATEGORY_SETTING_IDS === 'undefined') return '';
    window.PM_SETTINGS_PROJECT_SNAPSHOTS = window.PM_SETTINGS_PROJECT_SNAPSHOTS || {};
    const snaps = window.PM_SETTINGS_PROJECT_SNAPSHOTS;
    if (!snaps[file.id]) snaps[file.id] = exampleSnapshot(file.name, file.offset, file.step);
    return file.id;
  }
  const projects = () => { ensureExampleSources(); return settingsCopySources().filter(s => !String(s.value).startsWith('file:')); };

  /* Two categories that copy the same settings (the engine groups them together) turn on and off together. */
  const twinsOf = name => { const mine = (CATS.find(c => c[0] === name) || [, []])[1].join('|'); return CATS.filter(c => c[1].join('|') === mine).map(c => c[0]); };
  const toggleCat = (cats, name) => { const group = twinsOf(name); return cats.includes(name) ? cats.filter(c => !group.includes(c)) : CATS.map(c => c[0]).filter(c => group.includes(c) || cats.includes(c)); };
  function twinNote() {
    const seen = new Set(), pairs = [];
    CATS.forEach(([, cats]) => { const k = cats.join('|'); const same = CATS.filter(c => c[1].join('|') === k).map(c => c[0]); if (same.length > 1 && !seen.has(k)) { seen.add(k); pairs.push(same.join(' and ')); } });
    return pairs.length ? `${pairs.join('; ')} copy the same settings, so they are picked together.` : '';
  }

  function render() {
    ensureExampleSources();
    const T = tr(), H = history(), last = H[0];
    const start = PM51.section({ title: 'Copy, save or load settings', help: 'Each one shows exactly what changes before anything happens. Passwords, keys and sign-ins never move.', cls: 'o55-xfer-start',
      body: PM51.rows([
        { label: 'Copy from another project', help: T.sourceLabel ? `Last time from ${T.sourceLabel}. That project is only read.` : 'Bring over the setup you already like. That project is only read.', action: { label: 'Start', icon: 'copy', action: 'pm51-transfer-start', data: { mode: 'copy' } } }
      ]) });
    const file = PM51.section({ title: 'Save or load a file', body: PM51.rows([
      { label: 'Save settings to a file', help: 'Passwords, keys and sign-ins are never included.', control: PM51.bound.action('system.advanced.export-settings', { label: 'Save to a file…', icon: 'download' }) },
      { label: 'Load settings from a file', help: 'You see every change before anything is applied. Older files are converted first.', control: PM51.bound.action('system.advanced.import-settings', { label: 'Load a file…', icon: 'upload' }) }
    ]) });
    const hist = PM51.section({ title: 'History', help: last ? 'A copy or load can be rolled back while its restore point is kept.' : '', body: H.length ? PM51.list(H.map((x, i) => ({
      title: x.action, meta: `${x.time} · ${x.categories != null ? plural(x.categories, 'kind') + ' of settings · ' : ''}${String(x.result || '').replace(/concept fixture/gi, 'example data').replace(/Detached snapshot · /i, '')}`, avatar: icon(/save|export/i.test(x.action) ? 'download' : /load|import/i.test(x.action) ? 'upload' : 'copy'),
      end: (x.rollback_available ? PM51.btn({ label: 'Roll back', small: true, icon: 'restore', action: 'pm51-transfer-rollback', data: { index: i } }) : '')
        + PM51.iconBtn({ icon: 'more', label: `More for ${x.action}`, callback: el => PM51.menu(el, [
          { label: 'Details', icon: 'info', onClick: () => historyPanel(i) },
          { separator: true },
          { label: 'Remove from history', icon: 'trash', danger: true, meta: x.rollback_available ? 'Its restore point goes too' : '', onClick: () => PM51.confirm(`Remove “${x.action}” from history?`, x.rollback_available ? 'Its restore point is deleted, so it can no longer be rolled back. Your settings stay as they are now.' : 'Only the entry is removed. Your settings stay as they are now.', 'Remove', () => { if (x.rollback_ref && state.settingsTransferRollbacks) delete state.settingsTransferRollbacks[x.rollback_ref]; history().splice(i, 1); refresh(); }, true) }
        ], x.action) })
    }))) : PM51.empty('No transfers yet.', 'Copies, saved files and loaded files show up here.') });
    const snap = state.settingsSourceSnapshot;
    const advanced = PM51.advanced([
      PM51.section({ title: 'What is never copied', body: PM51.kv([['Credentials', 'Passwords, API keys, and sign-in sessions stay with their own workspace.'], ['Device pairings', 'Each device pairs with a server on its own.'], ['Server identity', 'Which server is home is decided per workspace.'], ['Account choices', 'Which account a provider uses is kept as it is here.']]) }),
      PM51.section({ title: 'Receipts', body: PM51.kv(snap ? [['Last copy from', snap.source_project_id], ['Settings copied', String((snap.copied_setting_ids || []).length)], ['Receipt', snap.receipt_id || 'Not supplied'], ['Restore point', snap.rollback_ref || 'None'], ['Copied at', snap.copied_at ? new Date(snap.copied_at).toLocaleString() : '—']] : [['Last copy', 'No copy receipt yet'], ['Restore point', 'None']]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv(CATS.map(([name, cats]) => [name, cats.join(' · ')])) })
    ].join(''));
    return PM51.page({ id: ID, key: KEY, body: start + file + hist + advanced, quiet: [
      { label: 'Reset transfer choices', action: 'pm51-transfer-reset' },
      { label: 'How settings transfer works', action: 'pm51-transfer-help' }
    ] });
  }
  PM51.manager('settingsTransfer', { render });

  function historyPanel(i) {
    const x = history()[i]; if (!x) return;
    PM51.panel({ title: x.action, subtitle: x.time, icon: 'history', body: PM51.panelSection('What happened', PM51.kv([['Kinds of settings', x.categories != null ? String(x.categories) : '—'], ['Result', String(x.result || '').replace(/concept fixture/gi, 'example data')], ['Receipt', x.receipt_id || 'None'], ['Restore point', x.rollback_available ? 'Kept · roll back from History' : 'None']])) + (x.kept && x.kept.length ? PM51.panelSection('Kept as they were', PM51.kv(x.kept.map(id => [rowLabel(id), 'Your value stayed']))) : '') });
  }

  /* ---------- the guided transfer --------------------------------------------------------------------------------- */
  const sourceId = d => d.mode === 'load' ? d.fileId : d.source;
  const sourceLabel = d => d.mode === 'load' ? (FILES.find(f => f.id === d.fileId) || {}).name || d.fileName || 'the file' : d.sourceLabel || d.source;
  function prepare(d) {
    d.prepared = null; d.prepError = '';
    if (!sourceId(d) || !d.cats.length) { d.prepError = !d.cats.length ? 'Choose at least one kind of settings first.' : 'Choose where the settings come from first.'; return null; }
    const p = prepareDetachedSettingsCopy(sourceId(d), engineCatsOf(d.cats), { conflicts: 'Preview every changed value', rollback: true });
    if (!p.ok) { d.prepError = friendly(p.reason); return null; }
    d.prepared = p; return p;
  }
  const catOf = c => (CATS.find(x => x[1].includes(c.category)) || [c.category])[0];
  const mineChanged = id => !!(state.changed && state.changed[id]);
  function keptIds(d) {
    const p = d.prepared; if (!p) return [];
    if (d.conflict === 'mine') return p.changes.filter(c => mineChanged(c.id)).map(c => c.id);
    if (d.conflict === 'each') return (d.keep || []).filter(id => p.changes.some(c => c.id === id));
    return [];
  }
  function whereStep(d) {
    if (d.mode === 'copy') {
      const list = projects();
      return (list.length ? PM51.tiles(list.map(s => ({ title: s.label, text: 'Its settings are read, never changed.', icon: 'folder', selected: d.source === s.value, data: { source: s.value, label: s.label } })), { action: 'pm51-transfer-w-source' }) : PM51.note('No other projects with readable settings on this device. Open another workspace once, then come back.', 'attention'))
        + PM51.panelSection('Copied into', PM51.kv([['This project', projectDisplayName()]]), 'A restore point is saved here first.', { icon: 'arrowRight' });
    }
    if (d.mode === 'load') {
      return PM51.tiles(FILES.map(f => ({ title: f.name, text: f.text, icon: f.icon, meta: 'Example file', selected: d.fileId === f.id, data: { file: f.id } })), { action: 'pm51-transfer-w-file' })
        + `<div class="o55-setup-fields">${PM51.field('Or choose a file on this computer', '<input class="text-control o55-tw-file" type="file" accept=".pmsettings,.json,.yaml,.toml"/>', 'Files from older versions are converted first. This preview reads it as example settings.')}</div>`
        + PM51.panelSection('Loaded into', PM51.kv([['This project', projectDisplayName()]]), 'A restore point is saved here first.', { icon: 'arrowRight' });
    }
    return `<div class="o55-setup-fields">${PM51.field('File name', `<input class="text-control o55-tw-name o55-setup-mono" value="${a(d.saveName)}" autocomplete="off" spellcheck="false"/>`)}${PM51.field('Save it in', PM51.select(d.saveWhere, [['Downloads', 'Downloads'], ['Documents', 'Documents'], ['Project', 'This project’s folder']], { cls: 'o55-tw-where', label: 'Save it in' }))}</div>`
      + PM51.rows([{ label: 'Protect the file with a password', help: 'Someone opening it needs the password. Secrets are still never in it.', control: PM51.toggle(!!d.protect, { action: 'pm51-transfer-w-flag', data: { key: 'protect' }, label: 'Protect the file with a password' }) }]);
  }
  function catsStep(d) {
    const all = d.cats.length === CATS.length;
    return `<div class="pm51-perm-actions o55-xfer-all">${PM51.btn({ label: all ? 'Clear all' : 'Select all', small: true, icon: all ? 'minus' : 'check', action: 'pm51-transfer-w-all' })}<span class="o55-quiet-line">${d.cats.length === CATS.length ? 'Everything is selected.' : `${d.cats.length} of ${CATS.length} selected.`}</span></div>`
      + PM51.tiles(CATS.map(([name, , ic]) => ({ title: name, icon: ic, selected: d.cats.includes(name), data: { cat: name } })), { action: 'pm51-transfer-w-cat', multi: true, cls: 'o55-xfer-cats' })
      + PM51.note(`Passwords, keys, sign-ins and device pairings are never included. ${twinNote()}`, 'info');
  }
  function previewStep(d) {
    if (d.mode === 'save') {
      const ec = engineCatsOf(d.cats), creds = credentialIn(ec);
      const rows = d.cats.map(name => { const ids = [...new Set(engineCatsOf([name]).flatMap(c => TRANSFER_CATEGORY_SETTING_IDS[c] || []))].filter(id => !creds.includes(id)); return [name, plural(ids.length, 'setting')]; });
      const total = [...new Set(ec.flatMap(c => TRANSFER_CATEGORY_SETTING_IDS[c] || []))].filter(id => !creds.includes(id)).length;
      return PM51.panelSection(`In the file: ${plural(total, 'setting')}`, PM51.kv(rows), 'Every value as it is in this project now.', { icon: 'file' })
        + PM51.panelSection('Left out', PM51.kv([['Passwords, keys and sign-ins', creds.length ? `${plural(creds.length, 'setting')}: ${creds.slice(0, 4).map(rowLabel).join(', ')}${creds.length > 4 ? '…' : ''}` : 'None in these kinds'], ['Kinds you did not pick', String(CATS.length - d.cats.length)], ['Device pairings and server choice', 'Never saved']]), '', { icon: 'lock' });
    }
    const p = prepare(d);
    if (!p) return PM51.note(d.prepError || 'Nothing to preview.', 'attention');
    const byCat = {}; p.changes.forEach(c => { (byCat[catOf(c)] = byCat[catOf(c)] || []).push(c); });
    const snap = window.PM7_SETTINGS_TOME.projectSnapshot(sourceId(d)) || { settings: {} };
    const creds = credentialIn(engineCatsOf(d.cats));
    const sameCount = Object.keys(snap.settings || {}).filter(id => p.selection.ids.has(id) && !creds.includes(id)).length - p.changes.length;
    return PM51.note(`${plural(p.changes.length, 'setting')} would change in ${projectDisplayName()}. Nothing has changed yet.`, 'info')
      + Object.entries(byCat).map(([cat, list]) => PM51.panelSection(cat, PM51.kv(list.map(c => [c.label, `${previewValue(c.destinationValue)}  →  ${previewValue(c.sourceValue)}`])), '', { icon: (CATS.find(x => x[0] === cat) || [, , 'sliders'])[2] })).join('')
      + PM51.panelSection('Skipped', PM51.kv([['Passwords, keys and sign-ins', creds.length ? `Never copied (${plural(creds.length, 'setting')})` : 'Never copied'], ['Already the same', plural(Math.max(0, sameCount), 'setting')], ['Kinds you did not pick', String(CATS.length - d.cats.length)], ['Device pairings and server choice', 'Never copied']]), '', { icon: 'lock' });
  }
  function conflictStep(d) {
    const p = d.prepared; if (!p) return PM51.note(d.prepError || 'Go back and preview first.', 'attention');
    const mineN = p.changes.filter(c => mineChanged(c.id)).length;
    const tiles = PM51.tiles([
      { title: 'Use theirs', text: `Every one of the ${plural(p.changes.length, 'difference')} takes the value from ${sourceLabel(d)}.`, icon: 'download', key: 'theirs' },
      { title: 'Keep what I changed here', text: mineN ? `${plural(mineN, 'setting')} you changed yourself stay as they are; the rest take their value.` : 'You have not changed any of these here, so this is the same as Use theirs.', icon: 'lock', key: 'mine' },
      { title: 'Choose each one', text: 'Pick for every setting that differs.', icon: 'list', key: 'each' }
    ].map(t => ({ title: t.title, text: t.text, icon: t.icon, selected: d.conflict === t.key, data: { conflict: t.key } })), { action: 'pm51-transfer-w-conflict' });
    const each = d.conflict === 'each' ? PM51.panelSection('For each setting', PM51.rows(p.changes.map(c => ({ label: c.label, help: `Here: ${previewValue(c.destinationValue)} · Theirs: ${previewValue(c.sourceValue)}`, control: PM51.segmented((d.keep || []).includes(c.id) ? 'mine' : 'theirs', [['mine', 'Keep mine'], ['theirs', 'Use theirs']], { action: 'pm51-transfer-w-each', data: { id: c.id }, label: c.label }) }))), '', { icon: 'list' }) : '';
    return tiles + each;
  }
  function recapStep(d) {
    if (d.mode === 'save') return PM51.panelSection(d.saveName, PM51.kv([['Saved in', d.saveWhere === 'Project' ? 'This project’s folder' : d.saveWhere], ['Kinds of settings', d.cats.length === CATS.length ? 'All of them' : d.cats.join(', ')], ['Password', d.protect ? 'Asked for when the file is opened' : 'None'], ['Never in it', 'Passwords, keys, sign-ins and device pairings']]), '', { icon: 'download' });
    const p = d.prepared, kept = keptIds(d), n = p ? p.changes.length - kept.length : 0;
    return PM51.panelSection(`${sourceLabel(d)} → ${projectDisplayName()}`, PM51.kv([['Kinds of settings', d.cats.length === CATS.length ? 'All of them' : d.cats.join(', ')], ['Will change', plural(n, 'setting')], ['Stay as they are', kept.length ? `${plural(kept.length, 'setting')}: ${kept.slice(0, 3).map(rowLabel).join(', ')}${kept.length > 3 ? '…' : ''}` : 'None'], ['Never copied', 'Passwords, keys, sign-ins and device pairings'], ['Afterwards', 'The two are independent; changing one never changes the other']]), '', { icon: MODES[d.mode].icon })
      + PM51.note('A restore point is saved first. Roll back any time from History.', 'info');
  }
  function skipFor(pred) {
    return (wrap, d, api) => { const here = api.step(), back = d._last != null && d._last > here; d._last = here; if (pred(d)) window.setTimeout(() => { if (api.step() === here) { d._last = here; api.go(back ? here - 1 : here + 1); } }, 0); };
  }
  const trackStep = (wrap, d, api) => { d._last = api.step(); };
  function transferWizard(mode) {
    ensureExampleSources();
    const T = tr(), proj = projectDisplayName();
    const draft = { mode: mode || null, source: T.source && projects().some(s => s.value === T.source) ? T.source : '', sourceLabel: T.sourceLabel, fileId: '', fileName: '', cats: T.cats.length ? T.cats.slice() : CATS.map(c => c[0]), conflict: 'theirs', keep: [], saveName: `${String(proj || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'}-settings.pmsettings`, saveWhere: 'Downloads', protect: false };
    const steps = [];
    if (!mode) steps.push({ label: 'Task', icon: 'layers', title: 'What would you like to do?', lead: 'You see every change before anything happens.', render: d => PM51.tiles(Object.entries(MODES).map(([k, m]) => ({ title: m.title, text: m.text, icon: m.icon, selected: d.mode === k, data: { mode: k } })), { action: 'pm51-transfer-w-mode' }), check: d => d.mode ? '' : 'Pick one to go on.', onShow: trackStep });
    steps.push({ label: 'Where', icon: 'folder', title: d => d.mode === 'copy' ? 'Which project should the settings come from?' : d.mode === 'load' ? 'Which settings file?' : 'Where should the file go?', lead: d => d.mode === 'save' ? 'The file holds settings only: no files, history, chats or secrets.' : 'Settings come into this project. Nothing is changed where they come from.',
      render: whereStep, onShow: trackStep,
      collect: (w, d) => {
        const n = w.querySelector('.o55-tw-name'), wh = w.querySelector('.o55-tw-where'), f = w.querySelector('.o55-tw-file');
        if (n) d.saveName = String(n.value || '').trim(); if (wh) d.saveWhere = wh.value;
        if (f && f.files && f.files[0]) { d.fileName = f.files[0].name; d.fileId = readFile({ id: 'file:' + d.fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: d.fileName, offset: 2, step: 1 }); }
      },
      check: d => d.mode === 'copy' ? (d.source ? '' : 'Pick the project to copy from.') : d.mode === 'load' ? (d.fileId ? '' : 'Pick a file.') : (!d.saveName ? 'Give the file a name.' : /[\\/:*?"<>|]/.test(d.saveName) ? 'File names cannot contain \\ / : * ? " < > |' : ''),
      recap: d => d.mode === 'save' ? d.saveName : sourceLabel(d) });
    steps.push({ label: 'What', icon: 'sliders', title: d => d.mode === 'save' ? 'Which kinds of settings go in the file?' : 'Which kinds of settings should come over?', lead: 'Only the kinds you pick are touched. The rest stay exactly as they are.', render: catsStep, onShow: trackStep,
      check: d => d.cats.length ? '' : 'Pick at least one kind of settings.', recap: d => d.cats.length === CATS.length ? 'Everything' : `${d.cats.length} of ${CATS.length}` });
    steps.push({ label: 'Preview', icon: 'eye', title: d => d.mode === 'save' ? 'This is what the file will hold' : 'This is what would change', lead: d => d.mode === 'save' ? 'Values as they are in this project now.' : 'Each line shows the value here, then the value it would take.', render: previewStep, onShow: trackStep,
      check: d => d.mode === 'save' ? '' : (d.prepared ? '' : (d.prepError || 'Nothing to preview.')), recap: d => d.mode === 'save' ? 'Checked' : d.prepared ? plural(d.prepared.changes.length, 'change') : '' });
    steps.push({ label: 'Differences', icon: 'layers', title: 'Where a setting is different here, which one wins?', lead: 'You can roll everything back afterwards either way.', render: conflictStep, onShow: skipFor(d => d.mode === 'save'),
      check: d => d.mode === 'save' ? '' : !d.prepared ? 'Go back and preview first.' : (d.prepared.changes.length - keptIds(d).length) > 0 ? '' : 'Every difference keeps your value, so nothing would change. Use theirs for at least one.',
      recap: d => d.mode === 'save' ? '' : d.conflict === 'mine' ? 'Keep my changes' : d.conflict === 'each' ? `${plural(keptIds(d).length, 'kept')}` : 'Use theirs' });
    steps.push({ label: 'Recap', icon: 'check', title: d => d.mode === 'save' ? `Save ${d.saveName}?` : d.mode === 'load' ? `Load settings from ${sourceLabel(d)}?` : `Copy settings from ${sourceLabel(d)}?`, lead: d => d.mode === 'save' ? 'Nothing in this project changes.' : 'Check it over, then go ahead.', render: recapStep, onShow: trackStep });
    PM51.wizard({
      title: mode ? MODES[mode].title : 'Move settings', subtitle: 'Copy, load or save settings. Passwords, keys and sign-ins never move.', eyebrow: mode ? MODES[mode].eyebrow : 'Settings transfer', icon: mode ? MODES[mode].icon : 'upload',
      steps, draft, finishLabel: mode ? MODES[mode].finish : 'Finish',
      onFinish: d => finish(d)
    });
  }
  function finish(d) {
    const T = tr();
    if (d.mode === 'save') {
      history().unshift({ time: `Today · ${nowLabel()}`, action: `Saved settings to ${d.saveName}`, categories: d.cats.length, result: `${d.saveWhere === 'Project' ? 'This project’s folder' : d.saveWhere}${d.protect ? ' · password-protected' : ''} · example data`, rollback_available: false });
      T.cats = d.cats.slice(); refresh();
      PM51.toast('Settings file saved', 'Example only: no file was written in this preview.', 'info');
      return true;
    }
    if (!prepare(d)) { PM51.toast('Settings were not copied', d.prepError, 'error'); return false; }
    const kept = keptIds(d);
    const applied = applyDetachedSettingsCopy(sourceId(d), engineCatsOf(d.cats), { conflicts: 'Preview every changed value', rollback: true });
    if (!applied.ok) { PM51.toast('Settings were not copied', friendly(applied.reason), 'error'); return false; }
    /* "keep mine": the restore point holds every prior value, so the kept ones go back to it */
    const prior = applied.fixtureMode && applied.rollbackRef ? (state.settingsTransferRollbacks || {})[applied.rollbackRef] : null;
    const reverted = [];
    if (prior && kept.length) {
      kept.forEach(id => {
        if (prior.settings[id] === undefined) delete state.settings[id]; else state.settings[id] = clone(prior.settings[id]);
        if (prior.changed[id] === undefined) delete state.changed[id]; else state.changed[id] = prior.changed[id];
        reverted.push(id);
      });
      if (state.settingsSourceSnapshot) state.settingsSourceSnapshot.copied_setting_ids = (state.settingsSourceSnapshot.copied_setting_ids || []).filter(id => !reverted.includes(id));
      try { window.PM7_SETTINGS_TOME.applyPaint(state); } catch (_e) { /* paint only */ }
    }
    const count = applied.count - reverted.length;
    history().unshift({ time: `Today · ${nowLabel()}`, action: d.mode === 'load' ? `Loaded from ${sourceLabel(d)}` : `Copied from ${sourceLabel(d)}`, source_project_id: sourceId(d), categories: d.cats.length, result: `${plural(count, 'setting')} ${d.mode === 'load' ? 'loaded' : 'copied'}${reverted.length ? ` · ${reverted.length} kept as they were` : ''}`, kept: reverted, receipt_id: applied.receiptId, rollback_ref: applied.rollbackRef, rollback_available: !!applied.rollbackRef, fixture_mode: applied.fixtureMode });
    if (d.mode === 'copy') { T.source = d.source; T.sourceLabel = d.sourceLabel; }
    T.cats = d.cats.slice(); T.previewed = false; T.previewCount = 0;
    saveState(); PM51.refreshAll();
    PM51.toast(`${plural(count, 'setting')} ${d.mode === 'load' ? 'loaded' : 'copied'}`, 'A restore point was saved. Use Roll back in History to undo.');
    return true;
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('transfer-start', el => transferWizard(ds(el, 'mode') || null));
  PM51.on('transfer-export', () => transferWizard('save'));
  PM51.on('transfer-import', () => transferWizard('load'));
  PM51.on('transfer-migrate', () => transferWizard('load'));
  PM51.on('transfer-source', () => transferWizard('copy'));
  PM51.on('transfer-w-mode', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.mode = ds(el, 'mode'); w.draft.prepared = null; w.next(); });
  PM51.on('transfer-w-source', el => { const w = PM51.wizardOf(el); if (!w) return; if (w.draft.source !== ds(el, 'source')) { w.draft.prepared = null; w.draft.keep = []; } w.draft.source = ds(el, 'source'); w.draft.sourceLabel = ds(el, 'label'); w.next(); });
  PM51.on('transfer-w-file', el => { const w = PM51.wizardOf(el); if (!w) return; const f = FILES.find(x => x.id === ds(el, 'file')); if (!f) return; w.draft.fileId = readFile(f); w.draft.fileName = f.name; w.draft.prepared = null; w.draft.keep = []; if (!w.draft.fileId) { PM51.toast('Loading files needs the settings service', 'The attached settings service reads files itself.', 'info'); return; } w.next(); });
  PM51.on('transfer-w-cat', el => {
    const w = PM51.wizardOf(el); if (!w) return; const name = ds(el, 'cat'); if (!CATS.some(c => c[0] === name)) return;
    w.draft.cats = toggleCat(w.draft.cats, name); w.draft.prepared = null; w.draft.keep = [];
    const body = el.closest('.o55g-main'); if (body) body.querySelectorAll('.o55g-card[data-cat]').forEach(c => { const on = w.draft.cats.includes(c.dataset.cat); c.classList.toggle('is-on', on); c.setAttribute('aria-checked', String(on)); });
    const note = body && body.querySelector('.o55-xfer-all .o55-quiet-line'); if (note) note.textContent = w.draft.cats.length === CATS.length ? 'Everything is selected.' : `${w.draft.cats.length} of ${CATS.length} selected.`;
  });
  PM51.on('transfer-w-all', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.cats = w.draft.cats.length === CATS.length ? [] : CATS.map(c => c[0]); w.draft.prepared = null; w.draft.keep = []; w.go(w.step()); });
  PM51.on('transfer-w-conflict', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.conflict = ds(el, 'conflict'); if (w.draft.conflict === 'each') { const at = w.step(); window.setTimeout(() => { if (w.step() === at) w.go(at); }, 0); } else w.next(); });
  PM51.on('transfer-w-each', el => {
    const w = PM51.wizardOf(el); if (!w) return; const id = ds(el, 'id'), v = ds(el, 'value'); const keep = new Set(w.draft.keep || []); v === 'mine' ? keep.add(id) : keep.delete(id); w.draft.keep = [...keep];
    el.closest('.pm51-seg')?.querySelectorAll('button').forEach(b => { const on = b.dataset.value === v; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  });
  PM51.on('transfer-w-flag', el => { const w = PM51.wizardOf(el); if (!w) return; const k = ds(el, 'key'); w.draft[k] = !w.draft[k]; el.classList.toggle('on', !!w.draft[k]); el.setAttribute('aria-checked', String(!!w.draft[k])); });
  PM51.on('transfer-rollback', el => {
    const i = Number(ds(el, 'index')), item = history()[i]; if (!item) return;
    PM51.confirm('Roll back this change?', `Settings go back to how they were before “${item.action}”.`, 'Roll back', () => {
      const r = rollbackDetachedSettingsCopy(i);
      if (!r.ok) { PM51.toast('Could not roll back', friendly(r.reason), 'error'); return; }
      item.rollback_available = false; item.result = `${item.result} · rolled back ${nowLabel()}`;
      invalidate(); saveState(); PM51.refreshAll(); PM51.toast('Settings restored', 'Everything is back to how it was before.');
    });
  });
  PM51.on('transfer-reset', () => { const s = PM51.s(); s.transfer = { source: '', sourceLabel: '', cats: CATS.map(c => c[0]), previewed: false, previewCount: 0 }; refresh(); PM51.toast('Transfer choices reset', 'Source cleared and every kind of settings selected again.'); });
  PM51.on('transfer-help', () => PM51.panel({
    title: 'How settings transfer works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Copy the settings you like from another project, load them from a file, or save them to one. You pick the kinds of settings, see exactly what would change and what is skipped, choose whose value wins where they differ, then go ahead. A restore point is saved first so you can undo.</p>')
      + PM51.panelSection('After copying', '<p class="pm51-ps-text">The two projects are independent. Changing one later does not change the other.</p>')
      + PM51.panelSection('Never copied', PM51.kv([['Secrets', 'Passwords, API keys, and sign-in sessions.'], ['Device pairings', 'Each device pairs on its own.'], ['Server choice', 'Where a workspace lives is decided per workspace.']]))
  }));
})();
