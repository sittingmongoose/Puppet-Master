/* Commands & Shortcuts — type / commands and press keys to do things faster. */
(function () {
  const ID = 'commands';
  const KEY = 'commands-shortcuts';
  const TABS = [{ id: 'shortcuts', label: 'Shortcuts' }, { id: 'commands', label: 'Commands' }];
  const PREF_DEFAULTS = { hints: true, layout: 'Auto-detect', palette: true, filter: '' };
  const data = () => { const s = PM51.s(); if (!s.commands) s.commands = clone(DATA.commands); if (!s.commands.custom) s.commands.custom = []; if (!s.commands.shortcuts) s.commands.shortcuts = []; return s.commands; };
  const prefs = () => { const s = PM51.s(); if (!s.commandsPrefs) s.commandsPrefs = clone(PREF_DEFAULTS); return s.commandsPrefs; };
  const shortcuts = () => data().shortcuts;
  const custom = () => data().custom;
  const builtIn = () => (state.toolchain && state.toolchain.commands) || [];
  const shortcutById = id => shortcuts().find(x => x.id === id);
  const commandById = id => custom().find(x => x.id === id);
  const SCOPE_LABELS = { Project: 'This project', Global: 'Every project' };
  const scopeLabel = s => SCOPE_LABELS[s] || s;
  const MODES = ['Regular', 'Plan', 'Ask first'];
  const RESERVED = [['Ctrl+C', 'Copy'], ['Ctrl+V', 'Paste'], ['Ctrl+X', 'Cut'], ['Ctrl+Z', 'Undo'], ['Ctrl+Q', 'Quit Puppet Master'], ['F11', 'Full screen']];
  const actionRow = (...buttons) => `<div class="pm51-commands-actions">${buttons.join('')}</div>`;
  const keysHtml = keys => String(keys || '').split('+').map(k => k.trim()).filter(Boolean).map(k => `<kbd>${h(k)}</kbd>`).join('<span>+</span>');
  const keyButton = s => `<button type="button" class="pm51-commands-keys${s.keys ? '' : ' is-empty'}" data-action="pm51-commands-rebind" data-id="${a(s.id)}" aria-label="Change shortcut for ${a(s.name)}" data-pm-hover-label="Change shortcut">${s.keys ? keysHtml(s.keys) : 'Not set'}</button>`;
  const keyStatic = keys => `<span class="pm51-commands-keys is-static${keys ? '' : ' is-empty'}">${keys ? keysHtml(keys) : 'No shortcut'}</span>`;
  const conflictsFor = s => s.keys ? shortcuts().filter(o => o.id !== s.id && o.keys && o.keys.toLowerCase() === s.keys.toLowerCase()).map(o => o.name) : [];
  const personaChoices = () => { const names = (state.personas || []).map(p => p.name).filter(Boolean); return names.length ? names : ['Puppet Master']; };
  const modelChoices = () => { const models = (state.providers || []).filter(p => p.installed && p.signedIn && p.id !== 'free-models').flatMap(p => (p.models || []).filter(m => m.enabled).map(m => m.name)); return ['Default model'].concat(models); };
  const withChoice = (choices, value) => choices.includes(value) || !value ? choices : [value].concat(choices);

  PM51.style(`
#panel-settings .pm51-commands-search { margin: 8px 0 2px; }
#panel-settings .pm51-commands-search .text-control { width: 100%; max-width: 360px; }
#panel-settings .pm51-commands-keys { display: inline-flex; align-items: center; gap: 4px; min-height: 28px; padding: 0 8px; border: 1px solid var(--k3-line); border-radius: 7px; background: var(--k3-bg-2); color: var(--k3-text-2); font: inherit; font-size: 11.5px; cursor: pointer; white-space: nowrap; }
#panel-settings button.pm51-commands-keys:hover { color: var(--k3-text-1); border-color: var(--k3-line-strong); }
#panel-settings .pm51-commands-keys.is-static { cursor: default; }
#panel-settings .pm51-commands-keys kbd { font-family: inherit; font-size: 11px; font-weight: 650; line-height: 1.5; padding: 0 6px; border: 1px solid var(--k3-line); border-bottom-width: 2px; border-radius: 5px; background: var(--k3-surface-2); color: var(--k3-text-1); }
#panel-settings .pm51-commands-keys span { color: var(--k3-text-3); }
#panel-settings .pm51-commands-keys.is-empty { color: var(--k3-text-3); }
#panel-settings .pm51-row.is-hidden { display: none; }
#panel-settings .pm51-commands-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
#panel-settings .pm51-commands-actions:first-child { margin-top: 0; }
#panel-settings .pm51-commands-chip svg { width: 11px; height: 11px; margin-right: 4px; }
#panel-settings .pm51-commands-sheet .pm51-kv-row > span:first-child { display: flex; align-items: center; }
#panel-settings .pm51-commands-capture { font-weight: 650; letter-spacing: .02em; }
`);

  /* ---------- Shortcuts tab ------------------------------------------------ */
  function renderShortcuts() {
    const p = prefs();
    const q = String(p.filter || '').trim().toLowerCase();
    const list = shortcuts();
    const rows = list.map(s => {
      const others = conflictsFor(s);
      const hidden = q && !(s.name + ' ' + (s.keys || '')).toLowerCase().includes(q);
      return {
        label: s.name, pill: others.length ? PM51.pill(`Conflicts with ${others.join(', ')}`, 'attention') : '',
        help: others.length ? 'Two actions share these keys, so only one can win. Change one of them.' : '',
        control: keyButton(s), cls: hidden ? 'is-hidden' : '', data: { search: (s.name + ' ' + (s.keys || '')).toLowerCase() }
      };
    });
    const conflictCount = list.filter(s => conflictsFor(s).length).length;
    return [
      PM51.section({
        title: 'Keyboard shortcuts', help: 'Click a shortcut to change it.',
        body: `<div class="pm51-commands-search">${PM51.input(p.filter || '', { action: 'pm51-commands-filter', placeholder: 'Search shortcuts', type: 'search', label: 'Search shortcuts' })}</div>`
          + (conflictCount ? PM51.note(`${conflictCount} shortcuts share the same keys. Change one of each pair so both work.`, 'attention') : '')
          + (rows.length ? PM51.rows(rows) : PM51.empty('No shortcuts yet', 'Shortcuts appear here once actions have keys.'))
      }),
      PM51.section({
        title: 'Hints',
        body: PM51.rows([
          { label: 'Show shortcut hints', help: 'Shows the keys next to menu items and buttons.', control: PM51.toggle(!!p.hints, { action: 'pm51-commands-pref', data: { pref: 'hints' }, label: 'Show shortcut hints' }) },
          { label: 'Cheat sheet', help: 'Every shortcut on one page.', action: { label: 'Open cheat sheet', icon: 'file', action: 'pm51-commands-sheet' } }
        ])
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Keyboard layout', help: 'Auto-detect follows your system. Pick one if keys land in the wrong place.', control: PM51.select(p.layout, ['Auto-detect', 'US (QWERTY)', 'UK', 'German (QWERTZ)', 'French (AZERTY)'], { action: 'pm51-commands-layout', label: 'Keyboard layout' }) }
        ]),
        PM51.section({ title: 'Reserved shortcuts', help: 'These belong to the system and cannot be changed.', body: `<div class="pm51-commands-sheet">${PM51.kv(RESERVED)}</div>` }),
        actionRow(
          PM51.btn({ label: 'Reset all shortcuts', small: true, icon: 'restore', action: 'pm51-commands-reset-shortcuts' }),
          PM51.btn({ label: 'Export', small: true, icon: 'download', action: 'pm51-commands-export', data: { what: 'shortcuts' } }),
          PM51.btn({ label: 'Import', small: true, icon: 'upload', action: 'pm51-commands-import', data: { what: 'shortcuts' } })
        )
      ].join(''))
    ].join('');
  }

  /* ---------- Commands tab -------------------------------------------------- */
  function renderCommands() {
    const p = prefs();
    const items = custom().map(c => ({
      title: c.name, meta: c.description, pill: PM51.chip(scopeLabel(c.scope)), avatar: icon('terminal'),
      end: PM51.toggle(!!c.enabled, { action: 'pm51-commands-toggle', data: { id: c.id }, label: `${c.name} enabled` }),
      action: 'pm51-commands-open', data: { id: c.id }
    }));
    const builtRows = builtIn().map(c => ({
      label: c.command, help: c.name, pill: `<span class="pm51-chip pm51-commands-chip">${icon('lock')}Built in</span>`,
      control: keyStatic(c.shortcut)
    }));
    return [
      PM51.section({
        title: 'Your commands', help: 'Type the name in chat to run one. Open a command to change how it runs.',
        action: { label: 'New command', icon: 'plus', action: 'pm51-commands-new' },
        body: items.length ? PM51.list(items) : PM51.empty('No commands yet', 'Make one to run a favourite job with a few keystrokes.', { label: 'New command', action: 'pm51-commands-new', icon: 'plus' })
      }),
      PM51.section({
        title: 'Built-in commands', help: 'These come with Puppet Master. Change their keys in the Shortcuts tab.',
        body: PM51.rows(builtRows)
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Show your commands in the command palette', help: 'The palette opens with Ctrl+K and lists everything you can run.', control: PM51.toggle(!!p.palette, { action: 'pm51-commands-pref', data: { pref: 'palette' }, label: 'Show your commands in the command palette' }) }
        ]),
        actionRow(
          PM51.btn({ label: 'Export commands', small: true, icon: 'download', action: 'pm51-commands-export', data: { what: 'commands' } }),
          PM51.btn({ label: 'Import commands', small: true, icon: 'upload', action: 'pm51-commands-import', data: { what: 'commands' } })
        )
      ].join(''))
    ].join('');
  }

  function render() {
    const tab = PM51.tab(ID, 'shortcuts');
    const body = tab === 'commands' ? renderCommands() : renderShortcuts();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset commands and shortcuts', action: 'pm51-commands-reset' }, { label: 'How commands work', action: 'pm51-commands-help' }] });
  }
  PM51.manager('commands', { render });

  /* ---------- shortcuts behaviour ------------------------------------------ */
  const keyName = e => {
    if (['Control', 'Shift', 'Alt', 'Meta', 'OS'].includes(e.key)) return '';
    if (e.key === ' ') return 'Space';
    if (/^Arrow/.test(e.key)) return e.key.slice(5);
    if (e.key.length === 1) return e.key.toUpperCase();
    return e.key;
  };
  PM51.onInput('commands-filter', el => {
    prefs().filter = el.value;
    const q = el.value.trim().toLowerCase();
    const section = el.closest('.pm51-section'); if (!section) return;
    section.querySelectorAll('.pm51-row[data-search]').forEach(row => row.classList.toggle('is-hidden', !!q && !row.dataset.search.includes(q)));
  });
  PM51.on('commands-rebind', el => {
    const s = shortcutById(ds(el, 'id')); if (!s) return;
    openDialog({
      title: `Change shortcut for ${s.name}`, subtitle: 'Press the keys you want to use.',
      body: `<label class="form-field full"><span class="form-label">New shortcut</span><input class="form-input pm51-commands-capture" name="keys" value="${a(s.keys || '')}" readonly data-autofocus placeholder="Press keys"/><div class="form-help">Hold Ctrl, Alt, or Shift with a key. Backspace clears it.</div></label>`,
      saveLabel: 'Use these keys',
      onOpen: overlay => {
        const input = overlay.querySelector('.pm51-commands-capture'); if (!input) return;
        input.addEventListener('keydown', e => {
          if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter') return;
          e.preventDefault(); e.stopPropagation();
          if (e.key === 'Backspace' || e.key === 'Delete') { input.value = ''; return; }
          const k = keyName(e); if (!k) return;
          const parts = []; if (e.ctrlKey) parts.push('Ctrl'); if (e.altKey) parts.push('Alt'); if (e.shiftKey) parts.push('Shift'); if (e.metaKey) parts.push('Meta'); parts.push(k);
          input.value = parts.join('+');
        });
      },
      onSave: form => {
        s.keys = String(form.keys || '').trim();
        saveState(); PM51.refresh(ID, { swap: false });
        const others = conflictsFor(s);
        if (others.length) PM51.toast('Shortcut saved, but it clashes', `${s.keys} is also used by ${others.join(', ')}. Change one of them.`, 'info');
        else PM51.toast('Shortcut saved', s.keys ? `${s.name} is now ${s.keys}.` : `${s.name} has no shortcut now.`);
      }
    });
  });
  PM51.on('commands-sheet', () => {
    const groups = [['Shortcuts', shortcuts().filter(s => s.keys).map(s => [s.keys, s.name])], ['Built-in commands', builtIn().map(c => [c.command, c.name])], ['Your commands', custom().map(c => [c.name, c.description])]];
    PM51.panel({
      title: 'Cheat sheet', subtitle: 'Every shortcut and command in one place.',
      body: groups.filter(g => g[1].length).map(g => PM51.panelSection(g[0], `<div class="pm51-commands-sheet">${PM51.kv(g[1])}</div>`)).join('')
    });
  });
  PM51.on('commands-pref', el => { const key = ds(el, 'pref'); if (!(key in PREF_DEFAULTS)) return; prefs()[key] = !prefs()[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onChange('commands-layout', el => { prefs().layout = el.value; saveState(); });
  PM51.on('commands-reset-shortcuts', () => PM51.confirm('Reset all shortcuts?', 'Every shortcut goes back to its default keys.', 'Reset', () => {
    data().shortcuts = clone(DATA.commands.shortcuts); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Shortcuts reset', 'Default keys are back.');
  }));
  PM51.on('commands-export', el => {
    const what = ds(el, 'what') === 'commands' ? 'commands' : 'shortcuts';
    const count = what === 'commands' ? custom().length : shortcuts().length;
    PM51.panel({
      title: what === 'commands' ? 'Export commands' : 'Export shortcuts', subtitle: 'A small file you can share or keep as a backup.',
      body: PM51.panelSection('What goes in the file', PM51.kv([[what === 'commands' ? 'Commands' : 'Shortcuts', String(count)], ['Format', 'JSON'], ['Secrets', 'None. Only names and settings.']])) + PM51.note('Files are saved only in the real app. Nothing was written in this preview.', 'info')
    });
  });
  PM51.on('commands-import', el => {
    const what = ds(el, 'what') === 'commands' ? 'commands' : 'shortcuts';
    openDialog({
      title: what === 'commands' ? 'Import commands' : 'Import shortcuts', subtitle: 'Pick a file exported from Puppet Master.',
      body: formField('File', 'file', '', { placeholder: what === 'commands' ? 'commands.json' : 'shortcuts.json', autofocus: true, full: true, help: 'Anything already on your list is kept unless the file changes it.' }),
      saveLabel: 'Import',
      onSave: () => { PM51.toast('Import is preview only', 'Nothing was imported. In the app the file is read and shown to you before anything changes.', 'info'); }
    });
  });

  /* ---------- commands behaviour ------------------------------------------- */
  function openCommand(id) {
    const c = commandById(id); if (!c) return;
    PM51.panel({
      title: c.name, subtitle: c.description || 'No description yet.', pill: PM51.pill(c.enabled ? 'Ready' : 'Off'),
      body: PM51.panelSection('What it does', PM51.field('Description', PM51.input(c.description || '', { action: 'pm51-commands-desc', data: { id: c.id }, placeholder: 'What this command does' })))
        + PM51.panelSection('How it runs',
          PM51.field('Where it is available', PM51.select(c.scope, [['Project', 'This project'], ['Global', 'Every project']], { action: 'pm51-commands-field', data: { id: c.id, field: 'scope' }, label: 'Where it is available' }))
          + PM51.field('Persona', PM51.select(c.persona, withChoice(personaChoices(), c.persona), { action: 'pm51-commands-field', data: { id: c.id, field: 'persona' }, label: 'Persona' }), 'The character the assistant plays while running it.')
          + PM51.field('Mode', PM51.select(c.mode, withChoice(MODES, c.mode), { action: 'pm51-commands-field', data: { id: c.id, field: 'mode' }, label: 'Mode' }), 'Plan writes a plan first. Ask first checks with you before changing anything.')
          + PM51.field('Model', PM51.select(c.model, withChoice(modelChoices(), c.model), { action: 'pm51-commands-field', data: { id: c.id, field: 'model' }, label: 'Model' })))
        + PM51.panelSection('Use it', PM51.rows([{ label: 'Enabled', help: 'Off hides it from chat and the command palette.', control: PM51.toggle(!!c.enabled, { action: 'pm51-commands-toggle', data: { id: c.id }, label: `${c.name} enabled` }) }]))
        + PM51.panelSection('Remove', actionRow(PM51.btn({ label: 'Delete command', small: true, danger: true, icon: 'trash', action: 'pm51-commands-delete', data: { id: c.id } }))),
      primaryLabel: 'Preview (dry run)', onPrimary: () => { dryRun(c.id); }
    });
  }
  function dryRun(id) {
    const c = commandById(id); if (!c) return;
    PM51.check({
      title: `Dry run · ${c.name}`, subtitle: 'Shows what would happen. Nothing runs.', outcome: 'Dry run · example data', tone: 'info',
      steps: [
        { title: 'Command recognised', desc: `${c.name} · available in ${scopeLabel(c.scope).toLowerCase()}` },
        { title: 'Persona chosen', desc: c.persona || 'Default persona' },
        { title: 'Mode and model', desc: `${c.mode || 'Regular'} · ${c.model || 'Default model'}` },
        { title: 'Would do', desc: c.description || 'No description yet', status: 'Example', tone: 'info' }
      ]
    });
  }
  PM51.on('commands-open', el => openCommand(ds(el, 'id')));
  PM51.on('commands-toggle', el => {
    const c = commandById(ds(el, 'id')); if (!c) return;
    c.enabled = !c.enabled;
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', c.enabled); el.setAttribute('aria-checked', String(c.enabled)); }
    saveState(); PM51.refresh(ID, { swap: false });
  });
  PM51.onChange('commands-field', el => { const c = commandById(ds(el, 'id')); const field = ds(el, 'field'); if (!c || !['scope', 'persona', 'mode', 'model'].includes(field)) return; c[field] = el.value; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onInput('commands-desc', el => { const c = commandById(ds(el, 'id')); if (!c) return; c.description = el.value; saveState(); });
  PM51.on('commands-delete', el => {
    const c = commandById(ds(el, 'id')); if (!c) return;
    PM51.confirm(`Delete ${c.name}?`, 'The command is removed from chat and the palette. You can make it again later.', 'Delete', () => {
      data().custom = custom().filter(x => x.id !== c.id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${c.name} deleted`, 'It is no longer on your list.');
    }, true);
  });
  PM51.on('commands-new', () => openDialog({
    title: 'New command', subtitle: 'Your commands start with /x- so they never clash with built-in ones.',
    body: formField('Name', 'name', '/x-', { autofocus: true, placeholder: '/x-tidy-docs' })
      + formField('Where it is available', 'scope', 'Project', { type: 'select', choices: [{ value: 'Project', label: 'This project' }, { value: 'Global', label: 'Every project' }] })
      + formField('Description', 'description', '', { placeholder: 'What this command does', full: true })
      + formField('Persona', 'persona', personaChoices()[0], { type: 'select', choices: personaChoices() })
      + formField('Mode', 'mode', 'Regular', { type: 'select', choices: MODES })
      + formField('Model', 'model', 'Default model', { type: 'select', choices: modelChoices(), full: true }),
    saveLabel: 'Create command',
    onSave: form => {
      let name = String(form.name || '').trim().toLowerCase().replace(/\s+/g, '-');
      if (!name.startsWith('/')) name = '/' + name;
      if (!name.startsWith('/x-')) name = '/x-' + name.replace(/^\/x?-?/, '');
      if (name === '/x-') { PM51.toast('Name needed', 'Give the command a name after /x-.', 'info'); return false; }
      if (commandById(name.slice(1))) { PM51.toast('Already taken', `${name} is on your list already.`, 'info'); return false; }
      custom().push({ id: name.slice(1), name, description: String(form.description || '').trim(), scope: form.scope === 'Global' ? 'Global' : 'Project', persona: form.persona, mode: form.mode, model: form.model, enabled: true });
      saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Command created', `Type ${name} in chat to run it.`);
    }
  }));
  PM51.on('commands-reset', () => PM51.confirm('Reset commands and shortcuts?', 'Your commands, shortcuts, and hint settings go back to their defaults.', 'Reset', () => {
    PM51.s().commands = clone(DATA.commands); PM51.s().commandsPrefs = clone(PREF_DEFAULTS); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Commands and shortcuts reset', 'Defaults are back.');
  }));
  PM51.on('commands-help', () => PM51.panel({
    title: 'How commands work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Type a / command in chat to run a job in one go. Built-in commands come with Puppet Master. Your own commands start with /x- and can pick a persona, a mode, and a model.</p>')
      + PM51.panelSection('Shortcuts', '<p class="pm51-ps-text">Most actions also have keys. Click a shortcut to change it. If two actions share the same keys, one of them will not work, so Puppet Master warns you.</p>')
      + PM51.panelSection('Good to know', PM51.kv([['Dry run', 'Shows what a command would do without running it.'], ['Cheat sheet', 'Every shortcut on one page, from the Hints section.']]))
  }));
})();
