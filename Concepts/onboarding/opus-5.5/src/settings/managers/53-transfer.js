/* Settings Transfer — copy settings from another workspace, or save them to a file. */
(function () {
  const ID = 'settings-transfer';
  const KEY = 'settings-transfer';
  /* The ten canonical selectors, each mapped to the engine's transfer categories (exact setting IDs live there). */
  const CATS = [
    ['Appearance & workspace', ['Appearance & input']],
    ['Assistant chat', ['Appearance & input']],
    ['Providers, accounts, models & routing', ['AI providers & accounts', 'Model routing']],
    ['Planning & Goals', ['Goals & personas']],
    ['Orchestrator & automation', ['Goals & personas']],
    ['Tools & integrations', ['Source control', 'Project & sync']],
    ['Testing, browser & devices', ['Testing profiles']],
    ['Permissions & security', ['Permissions']],
    ['Memory, retention & history', ['Context & memory behavior']],
    ['Notifications, usage & budgets', ['Notifications & sounds']]
  ];
  const h = PM51.h, a = PM51.a;
  let prepared = null; /* engine preview object; never stored in state (contains Sets) */

  PM51.style(`
#panel-settings .pm51-transfer-flow .pm51-steps + .pm51-transfer-chips { padding: 2px 0 12px 38px; }
#panel-settings .pm51-transfer-flow .pm51-transfer-chips + .pm51-steps .pm51-step:first-child { border-top: 1px solid var(--k3-line); }
#panel-settings .pm51-transfer-chips { display: flex; flex-wrap: wrap; gap: 6px; }
#panel-settings .pm51-transfer-chip { display: inline-flex; align-items: center; gap: 5px; min-height: 26px; padding: 0 10px; border: 1px solid var(--k3-line); border-radius: 99px; background: var(--k3-bg-2); color: var(--k3-text-2); font: inherit; font-size: 11.5px; cursor: pointer; }
#panel-settings .pm51-transfer-chip svg { width: 12px; height: 12px; }
#panel-settings .pm51-transfer-chip:hover { color: var(--k3-text-1); border-color: var(--k3-line-strong); }
#panel-settings .pm51-transfer-chip.is-on { color: var(--k3-accent); border-color: rgba(var(--accent-primary-rgb), .45); background: var(--k3-accent-soft); }
#panel-settings .pm51-transfer-chips-note { flex-basis: 100%; font-size: 11px; color: var(--k3-text-3); margin-top: 2px; }
#panel-settings .pm51-transfer-change { font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; color: var(--k3-text-3); overflow-wrap: anywhere; }
`);

  const tr = () => { const s = PM51.s(); if (!s.transfer) s.transfer = { source: '', sourceLabel: '', cats: CATS.map(c => c[0]), previewed: false, previewCount: 0 }; return s.transfer; };
  const history = () => { if (!Array.isArray(state.settingsTransferHistory)) state.settingsTransferHistory = []; return state.settingsTransferHistory; };
  const refresh = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const engineCats = () => [...new Set(tr().cats.flatMap(name => (CATS.find(c => c[0] === name) || [null, []])[1]))];
  const invalidate = () => { tr().previewed = false; tr().previewCount = 0; prepared = null; };
  const friendly = reason => {
    const r = String(reason || '');
    if (/differ|configured to keep/i.test(r)) return 'Nothing to copy: the chosen categories already match this workspace.';
    if (/at least one/i.test(r)) return 'Choose at least one category first.';
    if (/no readable|different readable/i.test(r)) return 'That project has no readable settings on this device.';
    if (/destination project/i.test(r)) return 'Open a workspace first, then copy settings into it.';
    return r.replace(/canonical\s*/gi, '').replace(/Settings owner/g, 'settings service');
  };
  const previewValue = v => { try { return transferPreviewValue(v); } catch (_e) { return typeof v === 'string' ? v : JSON.stringify(v); } };

  /* Example source projects: the shell's other workspaces get a readable settings snapshot with real setting IDs and valid values, so preview and copy use the engine's exact-ID path. Never seeded when a live settings service is attached. */
  function ensureExampleSources() {
    if (window.PM_SETTINGS_REGISTRY) return;
    if (typeof TRANSFER_CATEGORY_SETTING_IDS === 'undefined') return;
    window.PM_SETTINGS_PROJECT_SNAPSHOTS = window.PM_SETTINGS_PROJECT_SNAPSHOTS || {};
    const snaps = window.PM_SETTINGS_PROJECT_SNAPSHOTS;
    if (snaps.harbor && snaps.loom) return;
    const rows = new Map(Object.values(window.PM12_REFERENCE?.byCat || {}).flatMap(c => c.settings || []).map(r => [r.id, r]));
    const currentValue = id => { const f = findSettingGlobal(id); if (f) return settingValue(f.setting); return state.settings[id] !== undefined ? state.settings[id] : rows.get(id)?.default; };
    const altered = (id, step) => {
      const row = rows.get(id); if (!row) return undefined; const cur = currentValue(id);
      if (row.type === 'toggle') return !cur;
      if ((row.type === 'select' || row.type === 'radio') && Array.isArray(row.options) && row.options.length > 1) { const i = Math.max(0, row.options.indexOf(cur)); return row.options[(i + step) % row.options.length]; }
      if (row.type === 'number' && typeof cur === 'number') return cur + step;
      return undefined;
    };
    const usable = id => { const r = rows.get(id); return r && !r.credential_ref_only && (typeof TRANSFER_CREDENTIAL_IDS === 'undefined' || !TRANSFER_CREDENTIAL_IDS.has(id)) && ['toggle', 'select', 'radio', 'number'].includes(r.type); };
    const pick = (cat, n, offset) => (TRANSFER_CATEGORY_SETTING_IDS[cat] || []).filter(usable).slice(offset, offset + n);
    const build = (label, offset, step) => {
      const settings = {};
      for (const cat of Object.keys(TRANSFER_CATEGORY_SETTING_IDS)) for (const id of pick(cat, cat === 'Appearance & input' ? 3 : 2, offset)) { const v = altered(id, step); if (v !== undefined) settings[id] = v; }
      return { label, settings, example: true };
    };
    if (!snaps.harbor) snaps.harbor = build('harbor', 0, 1);
    if (!snaps.loom) snaps.loom = build('loom', 3, 2);
  }

  function chips() {
    const T = tr();
    return `<div class="pm51-transfer-chips">${CATS.map(([name]) => { const on = T.cats.includes(name); return `<button type="button" class="pm51-transfer-chip${on ? ' is-on' : ''}" data-action="pm51-transfer-cat" data-cat="${a(name)}" aria-pressed="${on ? 'true' : 'false'}">${on ? icon('check') : ''}<span>${h(name)}</span></button>`; }).join('')}<span class="pm51-transfer-chips-note">${T.cats.length === CATS.length ? 'Everything is selected.' : `${T.cats.length} of ${CATS.length} selected.`} Passwords, keys, and device pairings are never copied.</span></div>`;
  }

  function render() {
    ensureExampleSources();
    const T = tr();
    const canPreview = !!T.source && T.cats.length > 0;
    const stepsA = PM51.steps([
      { title: 'Choose source project', desc: T.source ? `Copying from ${T.sourceLabel || T.source}` : 'None chosen', done: !!T.source, action: { label: T.source ? 'Change project' : 'Choose project', icon: 'folder', action: 'pm51-transfer-source' } },
      { title: 'Pick categories', desc: 'Only the kinds of settings you tick are copied.', done: T.cats.length > 0, action: { label: T.cats.length === CATS.length ? 'Clear all' : 'Select all', action: 'pm51-transfer-all' } }
    ]);
    const stepsB = PM51.steps([
      { title: 'Preview changes', desc: T.previewed ? `${T.previewCount} setting${T.previewCount === 1 ? '' : 's'} would change.` : 'See exactly what would change before anything is copied.', done: T.previewed, action: { label: T.previewed ? 'Preview again' : 'Preview', icon: 'eye', action: 'pm51-transfer-preview', disabled: !canPreview, reason: !T.source ? 'Choose a source project first.' : 'Pick at least one category.' } },
      { title: 'Copy settings', desc: 'A restore point is created first. Afterwards the two projects are independent.', action: { label: 'Copy settings', primary: true, icon: 'copy', action: 'pm51-transfer-copy', disabled: !T.previewed, reason: 'Preview the changes first.' } }
    ]).replace('<span class="pm51-step-n">1</span>', '<span class="pm51-step-n">3</span>').replace('<span class="pm51-step-n">2</span>', '<span class="pm51-step-n">4</span>');
    const copy = PM51.section({ title: 'Copy Settings From Another Project', help: 'Bring over the setup you already like. Your workspace keeps its own accounts and secrets.', cls: 'pm51-transfer-flow', body: stepsA + chips() + stepsB });
    const file = PM51.section({ title: 'Save or load a file', body: PM51.rows([
      { label: 'Export settings', help: 'Saves your settings to a file. Secrets are never included.', action: { label: 'Export…', icon: 'download', action: 'pm51-transfer-export' } },
      { label: 'Import settings from a file', help: 'You see what would change before anything is applied.', action: { label: 'Import…', icon: 'upload', action: 'pm51-transfer-import' } }
    ]) });
    const H = history();
    const hist = PM51.section({ title: 'History', body: H.length ? PM51.list(H.map((x, i) => ({
      title: x.action, meta: `${x.time} · ${x.categories != null ? x.categories + ' categor' + (x.categories === 1 ? 'y' : 'ies') + ' · ' : ''}${String(x.result || '').replace(/concept fixture/gi, 'example data').replace(/Detached snapshot · /i, '')}`, avatar: icon(/export/i.test(x.action) ? 'download' : /import/i.test(x.action) ? 'upload' : 'copy'),
      end: x.rollback_available ? PM51.btn({ label: 'Roll back', small: true, icon: 'restore', action: 'pm51-transfer-rollback', data: { index: i } }) : ''
    }))) : PM51.empty('No transfers yet.', 'Copies, exports, and imports show up here.') });
    const snap = state.settingsSourceSnapshot;
    const advanced = PM51.advanced([
      PM51.section({ title: 'What is never copied', body: PM51.kv([['Credentials', 'Passwords, API keys, and sign-in sessions stay with their own workspace.'], ['Device pairings', 'Each device pairs with a server on its own.'], ['Server identity', 'Which server is home is decided per workspace.'], ['Account choices', 'Which account a provider uses is kept as it is here.']]) }),
      PM51.section({ title: 'Import from an older version', help: 'Files from earlier versions are converted first, and you see the result before it is applied.', body: PM51.rows([{ label: 'Older settings file', action: { label: 'Convert and preview…', icon: 'upload', action: 'pm51-transfer-migrate' } }]) }),
      PM51.section({ title: 'Receipts', body: PM51.kv(snap ? [['Last copy from', snap.source_project_id], ['Settings copied', String((snap.copied_setting_ids || []).length)], ['Receipt', snap.receipt_id || 'Not supplied'], ['Restore point', snap.rollback_ref || 'None'], ['Copied at', snap.copied_at ? new Date(snap.copied_at).toLocaleString() : '—']] : [['Last copy', 'No copy receipt yet'], ['Restore point', 'None']]) }),
      PM51.section({ title: 'Technical details', body: PM51.kv(CATS.map(([name, cats]) => [name, cats.join(' · ')])) })
    ].join(''));
    return PM51.page({ id: ID, key: KEY, body: copy + file + hist + advanced, quiet: [
      { label: 'Reset transfer choices', action: 'pm51-transfer-reset' },
      { label: 'How settings transfer works', action: 'pm51-transfer-help' }
    ] });
  }
  PM51.manager('settingsTransfer', { render });

  /* ---------- flows --------------------------------------------------------- */
  function chooseSource() {
    ensureExampleSources();
    const sources = settingsCopySources();
    const T = tr();
    if (!sources.length) { PM51.panel({ title: 'Choose project', body: PM51.empty('No other projects with readable settings', 'Open another workspace on this device at least once, then come back here.') }); return; }
    openDialog({ title: 'Choose source project', subtitle: 'Settings are read from that project. It is not changed.', body: PM51.form([{ label: 'Project', name: 'source', value: T.source && sources.some(s => s.value === T.source) ? T.source : sources[0].value, type: 'select', choices: sources, full: true, help: window.PM_SETTINGS_REGISTRY ? '' : 'These projects carry example settings in this preview.' }]), saveLabel: 'Use this project', onSave: data => {
      const pick = sources.find(s => s.value === String(data.source)); if (!pick) return false;
      if (pick.value !== T.source) invalidate();
      T.source = pick.value; T.sourceLabel = pick.label; refresh();
    } });
  }
  function preview() {
    const T = tr(); if (!T.source || !T.cats.length) return;
    const p = prepareDetachedSettingsCopy(T.source, engineCats(), { conflicts: 'Preview every changed value', rollback: true });
    if (!p.ok) { invalidate(); refresh(); PM51.toast('Nothing to preview', friendly(p.reason), 'warning'); return; }
    prepared = p;
    const byCat = {}; p.changes.forEach(c => { const key = (CATS.find(x => x[1].includes(c.category)) || [c.category])[0]; (byCat[key] = byCat[key] || []).push(c); });
    const body = PM51.panelSection('Summary', PM51.kv([['From', T.sourceLabel || T.source], ['Into', projectDisplayName()], ['Settings that would change', String(p.changes.length)], ['Restore point', 'Created before copying']]))
      + Object.entries(byCat).map(([cat, list]) => PM51.panelSection(cat, PM51.list(list.map(c => ({ title: c.label, meta: `${previewValue(c.destinationValue)}  →  ${previewValue(c.sourceValue)}`, pill: PM51.pill(c.decision === 'Use source' ? 'Will change' : 'Kept', c.decision === 'Use source' ? 'info' : 'off') }))))).join('')
      + PM51.note('Passwords, keys, sign-in sessions, and device pairings are never part of a copy.', 'info');
    PM51.panel({ title: 'Preview changes', subtitle: `${p.changes.length} setting${p.changes.length === 1 ? '' : 's'} differ between the two projects.`, pill: PM51.pill('Preview', 'info'), body, primaryLabel: 'Looks good', onPrimary: () => { T.previewed = true; T.previewCount = p.changes.length; refresh(); } });
  }
  function copyNow() {
    const T = tr(); if (!T.previewed || !T.source) return;
    PM51.confirm(`Copy settings from ${T.sourceLabel || T.source}?`, `${T.previewCount} setting${T.previewCount === 1 ? '' : 's'} change in ${projectDisplayName()}. A restore point is saved first, and you can roll back from History.`, 'Copy settings', () => {
      const applied = applyDetachedSettingsCopy(T.source, engineCats(), { conflicts: 'Preview every changed value', rollback: true });
      if (!applied.ok) { PM51.toast('Settings were not copied', friendly(applied.reason), 'error'); return; }
      history().unshift({ time: `Today · ${nowLabel()}`, action: `Copied from ${T.sourceLabel || T.source}`, source_project_id: T.source, categories: T.cats.length, result: `${applied.count} setting${applied.count === 1 ? '' : 's'} copied`, receipt_id: applied.receiptId, rollback_ref: applied.rollbackRef, rollback_available: !!applied.rollbackRef, fixture_mode: applied.fixtureMode });
      invalidate(); saveState(); PM51.refreshAll();
      PM51.toast(`${applied.count} setting${applied.count === 1 ? '' : 's'} copied`, 'A restore point was saved. Use Roll back in History to undo.');
    });
  }

  /* ---------- actions ------------------------------------------------------ */
  PM51.on('transfer-source', chooseSource);
  PM51.on('transfer-cat', el => { const T = tr(), name = ds(el, 'cat'); if (!CATS.some(c => c[0] === name)) return; T.cats = T.cats.includes(name) ? T.cats.filter(c => c !== name) : CATS.map(c => c[0]).filter(c => c === name || T.cats.includes(c)); invalidate(); refresh(); });
  PM51.on('transfer-all', () => { const T = tr(); T.cats = T.cats.length === CATS.length ? [] : CATS.map(c => c[0]); invalidate(); refresh(); });
  PM51.on('transfer-preview', preview);
  PM51.on('transfer-copy', copyNow);
  PM51.on('transfer-rollback', el => {
    const i = Number(ds(el, 'index')), item = history()[i]; if (!item) return;
    PM51.confirm('Roll back this copy?', `Settings go back to how they were before “${item.action}”.`, 'Roll back', () => {
      const r = rollbackDetachedSettingsCopy(i);
      if (!r.ok) { PM51.toast('Could not roll back', friendly(r.reason), 'error'); return; }
      item.rollback_available = false; item.result = `${item.result} · rolled back ${nowLabel()}`;
      invalidate(); saveState(); PM51.refreshAll(); PM51.toast('Settings restored', 'Everything is back to how it was before the copy.');
    });
  });
  PM51.on('transfer-export', () => openDialog({ title: 'Export settings', subtitle: 'Secrets are never included. The file is safe to share.', body: PM51.form([
    { label: 'Format', name: 'format', value: 'Settings file (no secrets)', type: 'select', choices: ['Settings file (no secrets)', 'Encrypted archive'], full: true },
    { label: 'Include my notes and labels', name: 'notes', value: true, type: 'checkbox', full: true }
  ]), saveLabel: 'Export', onSave: data => { history().unshift({ time: `Today · ${nowLabel()}`, action: 'Exported project settings', categories: CATS.length, result: `${data.format} · example data`, rollback_available: false }); refresh(); PM51.toast('Export prepared', 'Example data only. No file was written in this preview.', 'info'); } }));
  PM51.on('transfer-import', () => openDialog({ title: 'Import settings from a file', subtitle: 'You see every change before it is applied. A restore point is created first.', body: PM51.form([
    { label: 'Settings file', name: 'file', value: '', type: 'file', full: true },
    { label: 'If a setting differs', name: 'conflict', value: 'Show me each one', type: 'select', choices: ['Show me each one', 'Keep mine', 'Use the file'] }
  ]), saveLabel: 'Check file', onSave: data => { PM51.toast('Import preview', `Example data only. ${data.file || 'The file'} would be checked and previewed before anything changes.`, 'info'); } }));
  PM51.on('transfer-migrate', () => openDialog({ title: 'Import from an older version', subtitle: 'The file is converted to the current format first. Nothing is applied until you approve the preview.', body: PM51.form([{ label: 'Older settings file', name: 'file', value: '', type: 'file', full: true }]), saveLabel: 'Convert and preview', onSave: data => { PM51.toast('Conversion preview', `Example data only. ${data.file || 'The file'} would be converted and shown as a preview.`, 'info'); } }));
  PM51.on('transfer-reset', () => { const s = PM51.s(); s.transfer = { source: '', sourceLabel: '', cats: CATS.map(c => c[0]), previewed: false, previewCount: 0 }; prepared = null; refresh(); PM51.toast('Transfer choices reset', 'Source cleared and every category selected again.'); });
  PM51.on('transfer-help', () => PM51.panel({
    title: 'How settings transfer works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Copy the settings you like from another project into this one. You pick the kinds of settings, preview the exact changes, then copy. A restore point is saved first so you can undo.</p>')
      + PM51.panelSection('After copying', '<p class="pm51-ps-text">The two projects are independent. Changing one later does not change the other.</p>')
      + PM51.panelSection('Never copied', PM51.kv([['Secrets', 'Passwords, API keys, and sign-in sessions.'], ['Device pairings', 'Each device pairs on its own.'], ['Server choice', 'Where a workspace lives is decided per workspace.']]))
  }));
})();
