/* Commands & Shortcuts — type / commands and press keys to do things faster.
   A user command is a prompt template (Plans/Commands_System.md §1.1, §3): the text it sends, with
   $ARGUMENTS / $1..$N placeholders, @path file includes and !`command` output. Persona, mode, model
   and permissions profile are optional overrides, never the definition. */
(function () {
  const ID = 'commands';
  const KEY = 'commands-shortcuts';
  const TABS = [{ id: 'shortcuts', label: 'Shortcuts' }, { id: 'commands', label: 'Commands' }];
  const PREF_DEFAULTS = { hints: true, layout: 'Auto-detect', palette: true, filter: '' };
  const SHAPE_VERSION = 2;
  const NAME_RE = /^[a-z][a-z0-9_-]{0,48}[a-z0-9]$/;
  const RESERVED_NAMES = ['new', 'model', 'effort', 'mode', 'export', 'compact', 'stop', 'resume', 'rewind', 'revert', 'share', 'settings', 'doctor', 'help', 'web', 'skill', 'cancel', 'clear', 'worktree', 'plugins'];
  const MODE_OPTIONS = [
    { value: '', label: 'Inherit', meta: 'Chat mode' },
    { value: 'ask', label: 'Ask', meta: 'Read-only answers' },
    { value: 'plan', label: 'Plan', meta: 'Read-only planning' },
    { value: 'regular', label: 'Regular', meta: 'Normal approvals' },
    { value: 'yolo', label: 'YOLO', meta: 'No approvals' }
  ];
  const MODE_LABELS = { ask: 'Ask', plan: 'Plan', regular: 'Regular', yolo: 'YOLO' };
  const OLD_MODES = { plan: 'plan', regular: 'regular', 'ask first': 'ask', ask: 'ask', yolo: 'yolo' };
  const OVERRIDE_KEYS = ['persona', 'mode', 'model', 'permissionsProfile'];
  const SCOPE_LABELS = { Project: 'This project', Global: 'Every project' };
  const RESERVED_KEYS = [['Ctrl+C', 'Copy'], ['Ctrl+V', 'Paste'], ['Ctrl+X', 'Cut'], ['Ctrl+Z', 'Undo'], ['Ctrl+Q', 'Quit Puppet Master'], ['F11', 'Full screen']];
  const TOKEN_RE = /\$ARGUMENTS\b|\$(\d+)|(?<![\w@])@([A-Za-z0-9_~.][A-Za-z0-9_./~-]*)|!`([^`\n]*)`/g;
  const TEMPLATE_PLACEHOLDER = 'Write what the chat should receive. For example:\n\nReview the changes in $1 and list anything risky.\n@CHANGELOG.md\n!`git status --short`';

  /* ---------- state + migration ------------------------------------------ */
  const fixtures = () => (DATA.commands && DATA.commands.custom) || [];
  const fixtureById = id => fixtures().find(f => f.id === id);
  const mapOldMode = v => { const k = String(v || '').trim().toLowerCase(); return OLD_MODES[k] || null; };
  const mapOldModel = v => {
    const s = String(v || '').trim(); if (!s || /^default model$/i.test(s)) return null;
    const hit = (state.providers || []).flatMap(p => p.models || []).find(m => m.id === s || m.name === s);
    return hit ? hit.id : s;
  };
  function normalizeCommand(cmd) {
    if (!cmd || typeof cmd !== 'object') return false;
    const fx = fixtureById(cmd.id);
    let changed = false;
    if (!cmd.overrides || typeof cmd.overrides !== 'object') {
      cmd.overrides = { persona: cmd.persona ? String(cmd.persona) : null, mode: mapOldMode(cmd.mode), model: mapOldModel(cmd.model), permissionsProfile: cmd.permissionsProfile || null };
      delete cmd.persona; delete cmd.mode; delete cmd.model; changed = true;
    }
    for (const k of OVERRIDE_KEYS) if (cmd.overrides[k] === undefined || cmd.overrides[k] === '') { cmd.overrides[k] = null; changed = true; }
    if (typeof cmd.template !== 'string') { cmd.template = fx && typeof fx.template === 'string' ? fx.template : String(cmd.description || ''); changed = true; }
    if (typeof cmd.argumentsHint !== 'string') { cmd.argumentsHint = fx && typeof fx.argumentsHint === 'string' ? fx.argumentsHint : ''; changed = true; }
    if (cmd.scope !== 'Global' && cmd.scope !== 'Project') { cmd.scope = 'Project'; changed = true; }
    if (!cmd.source) { cmd.source = (fx && fx.source) || 'user'; changed = true; }
    if (typeof cmd.enabled !== 'boolean') { cmd.enabled = true; changed = true; }
    if (!cmd.name) { cmd.name = '/' + cmd.id; changed = true; }
    if (cmd.description == null) { cmd.description = ''; changed = true; }
    return changed;
  }
  function migrateCommands(c) {
    if (!c || typeof c !== 'object') return;
    if (!Array.isArray(c.custom)) c.custom = [];
    if (!Array.isArray(c.shortcuts)) c.shortcuts = [];
    c.custom.forEach(normalizeCommand);
    c.shortcuts.forEach(s => { if (s && typeof s.id === 'string' && s.id.startsWith('cmd:') && !s.command) s.command = s.id.slice(4); });
    if (!(c.version >= SHAPE_VERSION)) {
      /* One-time upgrade of a pass-1 state: command shortcuts from the fixture join the list once. */
      ((DATA.commands && DATA.commands.shortcuts) || []).filter(s => s.command).forEach(s => { if (!c.shortcuts.some(x => x.id === s.id) && c.custom.some(x => x.id === s.command)) c.shortcuts.push(clone(s)); });
      c.version = SHAPE_VERSION;
    }
  }
  const data = () => { const s = PM51.s(); if (!s.commands) s.commands = clone(DATA.commands); migrateCommands(s.commands); return s.commands; };
  const prefs = () => { const s = PM51.s(); if (!s.commandsPrefs) s.commandsPrefs = clone(PREF_DEFAULTS); return s.commandsPrefs; };
  migrateCommands(PM51.s().commands);
  const pm51CommandsPrevEnsure = ensureStateShape;
  ensureStateShape = function () { pm51CommandsPrevEnsure(); if (state.pm51 && state.pm51.commands) migrateCommands(state.pm51.commands); };

  /* ---------- lookups ------------------------------------------------------ */
  const shortcuts = () => data().shortcuts;
  const custom = () => data().custom;
  const builtIn = () => (state.toolchain && state.toolchain.commands) || [];
  const shortcutById = id => shortcuts().find(x => x.id === id);
  const commandById = id => custom().find(x => x.id === id);
  const shortcutForCommand = id => shortcuts().find(x => x.command === id);
  const keysFor = c => { const s = shortcutForCommand(c.id); return s && s.keys ? s.keys : ''; };
  const scopeLabel = s => SCOPE_LABELS[s] || s;
  const pathFor = c => c.scope === 'Global' ? `~/.config/puppet-master/commands/${c.id}.md` : `.puppet-master/commands/${c.id}.md`;
  const conflictsFor = s => s.keys ? shortcuts().filter(o => o.id !== s.id && o.keys && o.keys.toLowerCase() === s.keys.toLowerCase()).map(o => o.name) : [];
  const personas = () => state.personas || [];
  const personaGroup = p => p.locked ? 'Core' : (p.group || 'Custom');
  const profiles = () => state.permissionProfiles || [];
  const profileById = id => profiles().find(p => p.id === id);
  const enabledModels = p => (p.models || []).filter(m => m.enabled);
  const providerReady = p => p.id !== 'free-models' && p.status !== 'disabled' && (p.readiness ? !!p.readiness.modelsReady : (!!p.installed && !!p.signedIn)) && enabledModels(p).length > 0;
  const readyProviders = () => (state.providers || []).filter(providerReady);
  const modelById = id => { for (const p of readyProviders()) { const m = enabledModels(p).find(x => x.id === id); if (m) return { id: m.id, name: m.name, provider: p.name }; } return null; };
  const modelName = id => { const m = (state.providers || []).flatMap(p => p.models || []).find(x => x.id === id); return m ? m.name : String(id); };
  const overrideCount = c => OVERRIDE_KEYS.filter(k => c.overrides && c.overrides[k]).length;
  const overrideSummary = c => {
    const ov = c.overrides || {}; const parts = [scopeLabel(c.scope)];
    if (ov.persona) parts.push(ov.persona);
    if (ov.mode) parts.push(MODE_LABELS[ov.mode] || ov.mode);
    if (ov.model) parts.push(modelName(ov.model));
    if (ov.permissionsProfile) { const p = profileById(ov.permissionsProfile); parts.push(p ? p.name : String(ov.permissionsProfile)); }
    return parts.join(' · ');
  };
  const notAvailable = name => `${name} (not available)`;
  const personaOptions = current => {
    const opts = [{ value: '', label: 'Inherit', meta: 'Chat persona' }];
    ['Core', 'Bundled', 'Custom'].forEach(g => personas().filter(p => personaGroup(p) === g).forEach(p => opts.push({ value: p.name, label: p.name, group: g })));
    if (current && !personas().some(p => p.name === current)) opts.push({ value: current, label: notAvailable(current), group: 'Not available' });
    return opts;
  };
  const modeOptions = current => { const opts = MODE_OPTIONS.map(o => Object.assign({}, o)); if (current && !MODE_LABELS[current]) opts.push({ value: current, label: notAvailable(current), group: 'Not available' }); return opts; };
  const modelOptions = current => {
    const opts = [{ value: '', label: 'Inherit', meta: 'Chat model' }]; let found = false;
    readyProviders().forEach(p => enabledModels(p).forEach(m => { if (m.id === current) found = true; opts.push({ value: m.id, label: m.name, group: p.name }); }));
    if (current && !found) opts.push({ value: current, label: notAvailable(modelName(current)), group: 'Not available' });
    return opts;
  };
  const profileOptions = current => {
    const opts = [{ value: '', label: 'Inherit', meta: 'Your profile' }].concat(profiles().map(p => ({ value: p.id, label: p.name, meta: p.scope || '' })));
    if (current && !profileById(current)) opts.push({ value: current, label: notAvailable(current), group: 'Not available' });
    return opts;
  };
  const OVERRIDE_FIELDS = [
    { key: 'persona', label: 'Persona', options: personaOptions, help: 'The character the assistant plays while this command runs.' },
    { key: 'mode', label: 'Mode', options: modeOptions, help: 'Capped by the chat\'s own mode.' },
    { key: 'model', label: 'Model', options: modelOptions, help: 'Only models that are ready right now are listed.' },
    { key: 'permissionsProfile', label: 'Permissions profile', options: profileOptions, help: 'Cannot grant more than your profile allows.' }
  ];

  /* ---------- template helpers --------------------------------------------- */
  const scanTemplate = template => {
    const found = { args: false, positional: [], files: [], shells: [], labels: [] };
    for (const m of String(template || '').matchAll(TOKEN_RE)) {
      if (m[0] === '$ARGUMENTS') { if (!found.args) found.labels.push('$ARGUMENTS'); found.args = true; }
      else if (m[1]) { const n = Number(m[1]); if (!found.positional.includes(n)) { found.positional.push(n); found.labels.push('$' + n); } }
      else if (m[2]) { found.files.push(m[2]); found.labels.push('@' + m[2]); }
      else if (m[3] != null) { found.shells.push(m[3]); found.labels.push('!`' + (m[3].length > 28 ? m[3].slice(0, 26) + '…' : m[3]) + '`'); }
    }
    return found;
  };
  const placeholderLine = template => {
    const f = scanTemplate(template);
    if (!f.labels.length) return '<span>Placeholders found: none yet. The text is sent exactly as written.</span>';
    return `<span>Placeholders found: </span>${f.labels.map(l => `<code>${h(l)}</code>`).join('<span class="pm51-commands-ph-sep">·</span>')}`;
  };
  const mark = (text, kind) => `<mark class="pm51-commands-sub${text ? '' : ' is-empty'}" data-kind="${a(kind)}">${text ? h(text) : ''}</mark>`;
  const resolveTemplate = (template, sample) => {
    const text = String(template || ''); const clean = String(sample || '').trim(); const words = clean ? clean.split(/\s+/) : [];
    let out = '', last = 0;
    for (const m of text.matchAll(TOKEN_RE)) {
      out += h(text.slice(last, m.index)); last = m.index + m[0].length;
      if (m[0] === '$ARGUMENTS') out += mark(clean, 'args');
      else if (m[1]) out += mark(words[Number(m[1]) - 1] || '', 'arg');
      else if (m[2]) out += mark(`[contents of ${m[2]} — needs read permission]`, 'file');
      else out += mark(`[output of ${m[3]} — needs command permission]`, 'shell');
    }
    return out + h(text.slice(last));
  };
  const helpBlock = (text, name) => `<div class="form-help" data-help="${a(name || '')}" data-help-default="${a(text)}">${h(text)}</div>`;

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
#panel-settings .pm51-commands-tag svg { width: 11px; height: 11px; margin-right: 2px; vertical-align: -2px; }
#panel-settings .pm51-commands-sheet .pm51-kv-row > span:first-child { display: flex; align-items: center; }
#panel-settings .pm51-commands-capture { font-weight: 650; letter-spacing: .02em; }
#panel-settings .pm51-commands-list .pm51-item-copy { display: flex; flex-direction: column; }
#panel-settings .pm51-commands-list .pm51-item-note { order: 1; color: var(--k3-text-2); }
#panel-settings .pm51-commands-list .pm51-item-meta { order: 2; }
#panel-settings .pm51-commands-list .pm51-item-end > .icon { color: var(--k3-text-3); }
#panel-settings .pm51-commands-list .pm51-item-end > .icon svg { width: 16px; height: 16px; }
#panel-settings .pm51-commands-form .form-field .form-input, #panel-settings .pm51-commands-form .form-field .form-textarea { font-size: 12.5px; }
#panel-settings .pm51-commands-form .pm51-dialog-group { grid-column: 1 / -1; }
#panel-settings .pm51-commands-form .form-field > .form-help { margin-top: -1px; }
#panel-settings .dialog:has(.pm51-commands-form) > .dialog-form { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
#panel-settings .dialog:has(.pm51-commands-form) .dialog-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; }
#panel-settings .pm51-commands-name { display: flex; align-items: stretch; }
#panel-settings .pm51-commands-adorn { display: inline-flex; align-items: center; padding: 0 10px; border: 1px solid var(--k3-line); border-right: 0; border-radius: 8px 0 0 8px; background: var(--k3-bg-2); color: var(--k3-text-3); font-family: var(--mono-font, ui-monospace, monospace); font-size: 12px; user-select: none; }
#panel-settings .pm51-commands-name .form-input { border-radius: 0 8px 8px 0; font-family: var(--mono-font, ui-monospace, monospace); }
#panel-settings textarea.pm51-commands-template, #panel-settings .pm51-commands-template { font-family: var(--mono-font, ui-monospace, monospace); font-size: 12px; line-height: 1.55; min-height: 132px; tab-size: 2; white-space: pre-wrap; }
#panel-settings .form-help.is-error, #panel-settings .pm51-field-help.is-error { color: var(--k3-red); }
#panel-settings .form-input[aria-invalid="true"], #panel-settings .form-textarea[aria-invalid="true"] { border-color: var(--k3-red); }
#panel-settings .pm51-commands-ph { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; color: var(--k3-text-2); }
#panel-settings .pm51-commands-ph code { font-family: var(--mono-font, ui-monospace, monospace); font-size: 10.5px; padding: 0 5px; border: 1px solid var(--k3-line); border-radius: 4px; background: var(--k3-bg-2); color: var(--k3-text-1); }
#panel-settings .pm51-commands-ph-sep { color: var(--k3-text-3); }
#panel-settings .pm51-commands-ph.pm51-field-help { display: flex; }
#panel-settings .pm51-dialog-group { border: 1px solid var(--k3-line); border-radius: 10px; background: var(--k3-bg-2); }
#panel-settings .pm51-dialog-group > summary { display: flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 12px; cursor: pointer; list-style: none; font-size: 12px; font-weight: 650; color: var(--k3-text-2); }
#panel-settings .pm51-dialog-group > summary::-webkit-details-marker { display: none; }
#panel-settings .pm51-dialog-group > summary .icon svg { width: 14px; height: 14px; color: var(--k3-text-3); transition: transform 200ms var(--k3-ease-out); }
#panel-settings .pm51-dialog-group[open] > summary .icon svg { transform: rotate(90deg); }
#panel-settings .pm51-dialog-group > summary small { font-weight: 500; color: var(--k3-text-3); margin-left: 2px; }
#panel-settings .pm51-dialog-group > summary:hover { color: var(--k3-text-1); }
#panel-settings .pm51-dialog-group-body { padding: 2px 12px 12px; border-top: 1px solid var(--k3-line); }
#panel-settings .pm51-dialog-group-body > .form-help:first-child { margin: 8px 0 2px; }
#panel-settings .pm51-dialog-group-body > .form-field + .form-field { margin-top: 12px; }
#panel-settings .pm51-commands-overrides .pm51-field + .pm51-field { margin-top: 12px; }
#panel-settings pre.pm51-code { margin: 0; padding: 12px 14px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-1); font-family: var(--mono-font, ui-monospace, monospace); font-size: 12px; line-height: 1.6; color: var(--k3-text-1); white-space: pre-wrap; overflow-wrap: anywhere; max-height: 380px; overflow: auto; }
#panel-settings .pm51-code mark.pm51-commands-sub { padding: 0 3px; border-radius: 4px; color: inherit; background: rgba(var(--accent-primary-rgb), .18); box-shadow: inset 0 0 0 1px rgba(var(--accent-primary-rgb), .35); }
#panel-settings .pm51-code mark.pm51-commands-sub[data-kind="file"], #panel-settings .pm51-code mark.pm51-commands-sub[data-kind="shell"] { background: var(--k3-amber-soft); box-shadow: inset 0 0 0 1px rgba(247,189,99,.35); }
#panel-settings .pm51-code mark.pm51-commands-sub.is-empty { display: inline-block; min-width: 1.4ch; min-height: 1em; vertical-align: text-bottom; border: 1px dashed rgba(var(--accent-primary-rgb), .6); box-shadow: none; background: transparent; }
#panel-settings .pm51-commands-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px; font-size: 11px; color: var(--k3-text-3); }
#panel-settings .pm51-commands-legend i { display: inline-block; width: 12px; height: 12px; margin-right: 5px; border-radius: 3px; vertical-align: -2px; background: rgba(var(--accent-primary-rgb), .18); box-shadow: inset 0 0 0 1px rgba(var(--accent-primary-rgb), .35); }
#panel-settings .pm51-commands-legend i.is-perm { background: var(--k3-amber-soft); box-shadow: inset 0 0 0 1px rgba(247,189,99,.35); }
#panel-settings .pm51-commands-shortcut { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
#panel-settings .pm51-commands-inline { display: flex; align-items: center; gap: 6px; }
html[data-theme^="retro"] #panel-settings :is(.pm51-commands-adorn, .pm51-commands-name .form-input, .pm51-dialog-group, pre.pm51-code, .pm51-commands-keys, .pm51-commands-ph code) { border-radius: 0 !important; }
html[data-motion="reduced"] #panel-settings .pm51-dialog-group > summary .icon svg { transition: none; }
`);

  /* ---------- keys ----------------------------------------------------------- */
  const keysHtml = keys => String(keys || '').split('+').map(k => k.trim()).filter(Boolean).map(k => PM51.kbd(k)).join('<span>+</span>');
  const keyButton = s => `<button type="button" class="pm51-commands-keys${s.keys ? '' : ' is-empty'}" data-action="pm51-commands-rebind" data-id="${a(s.id)}" aria-label="Change shortcut for ${a(s.name)}" data-pm-hover-label="Change shortcut">${s.keys ? keysHtml(s.keys) : 'Not set'}</button>`;
  const keyStatic = keys => `<span class="pm51-commands-keys is-static${keys ? '' : ' is-empty'}">${keys ? keysHtml(keys) : 'No shortcut'}</span>`;
  const actionRow = (...buttons) => `<div class="pm51-commands-actions">${buttons.join('')}</div>`;

  /* ---------- Shortcuts tab ------------------------------------------------ */
  function renderShortcuts() {
    const p = prefs();
    const q = String(p.filter || '').trim().toLowerCase();
    const list = shortcuts();
    const rows = list.map(s => {
      const others = conflictsFor(s);
      const cmd = s.command ? commandById(s.command) : null;
      const searchText = (s.name + ' ' + (s.keys || '') + (cmd ? ' ' + cmd.description : '')).toLowerCase();
      const hidden = q && !searchText.includes(q);
      const help = others.length ? 'Two actions share these keys, so only one can win. Change one of them.' : (cmd ? `Runs ${cmd.name}${cmd.description ? ' · ' + cmd.description : ''}` : '');
      return {
        label: s.name, pill: others.length ? PM51.status(`Conflicts with ${others.join(', ')}`, 'attention') : '',
        help, control: keyButton(s) + (s.command ? PM51.iconBtn({ action: 'pm51-commands-shortcut-remove', data: { id: s.id }, icon: 'trash', label: `Remove shortcut for ${s.name}` }) : ''),
        cls: hidden ? 'is-hidden' : '', data: { search: searchText, shortcut: s.id }
      };
    });
    const conflictCount = list.filter(s => conflictsFor(s).length).length;
    const free = custom().filter(c => !keysFor(c)).length;
    return [
      PM51.section({
        title: 'Keyboard shortcuts', help: 'Click a shortcut to change it. Your own commands can have keys too.',
        action: { label: 'Add shortcut', icon: 'plus', action: 'pm51-commands-add-shortcut', data: { free: String(free) } },
        body: `<div class="pm51-commands-search">${PM51.input(p.filter || '', { action: 'pm51-commands-filter', placeholder: 'Search shortcuts', type: 'search', label: 'Search shortcuts' })}</div>`
          + (conflictCount ? PM51.note(`${conflictCount} shortcuts share the same keys. Change one of each pair so both work.`, 'attention') : '')
          + (rows.length ? PM51.rows(rows) : PM51.empty('No shortcuts yet', 'Shortcuts appear here once actions have keys.'))
      }),
      PM51.section({
        title: 'Hints',
        body: PM51.rows([
          { label: 'Show shortcut hints', help: 'Shows the keys next to menu items and buttons.', control: PM51.toggle(!!p.hints, { action: 'pm51-commands-pref', data: { pref: 'hints' }, label: 'Show shortcut hints' }) },
          { label: 'Cheat sheet', help: 'Every shortcut and command on one page.', action: { label: 'Open cheat sheet', icon: 'file', action: 'pm51-commands-sheet' } }
        ])
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Keyboard layout', help: 'Auto-detect follows your system. Pick one if keys land in the wrong place.', control: PM51.select(p.layout, ['Auto-detect', 'US (QWERTY)', 'UK', 'German (QWERTZ)', 'French (AZERTY)'], { action: 'pm51-commands-layout', label: 'Keyboard layout' }) }
        ]),
        PM51.section({ title: 'Reserved shortcuts', help: 'These belong to the system and cannot be changed.', body: `<div class="pm51-commands-sheet">${PM51.kv(RESERVED_KEYS)}</div>` }),
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
      title: c.name, meta: overrideSummary(c), note: c.description || 'No description yet.', avatar: icon('terminal'),
      end: keyStatic(keysFor(c)) + PM51.toggle(!!c.enabled, { action: 'pm51-commands-toggle', data: { id: c.id }, label: `${c.name} enabled` }) + icon('chevron'),
      action: 'pm51-commands-open', data: { id: c.id }
    }));
    const builtRows = builtIn().map(c => {
      const bound = shortcutById(c.id);
      return { label: c.command, help: c.name, pill: `<span class="pm51-tag pm51-commands-tag">${icon('lock')} Built in</span>`, control: keyStatic(bound ? bound.keys : c.shortcut) };
    });
    return [
      PM51.section({
        title: 'Your commands', help: 'Type the name in chat to send its text. Open one to see what it sends and how it runs.',
        action: { label: 'New command', icon: 'plus', action: 'pm51-commands-new' },
        body: items.length ? PM51.list(items, { cls: 'pm51-commands-list' }) : PM51.empty('No commands yet', 'Make one to send a prompt you use often with a few keystrokes.', { label: 'New command', action: 'pm51-commands-new', icon: 'plus' })
      }),
      PM51.section({
        title: 'Built-in commands', help: 'These come with Puppet Master. Change their keys in the Shortcuts tab.',
        body: PM51.rows(builtRows)
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Show your commands in the command palette', help: 'The palette opens with Ctrl+K and lists everything you can run.', control: PM51.toggle(!!p.palette, { action: 'pm51-commands-pref', data: { pref: 'palette' }, label: 'Show your commands in the command palette' }) }
        ]),
        PM51.section({
          title: 'Where command files live', help: 'Each command is a small Markdown file. You can edit it by hand too.',
          body: `<div class="pm51-commands-sheet">${PM51.kv([
            ['This project', '<project>/.puppet-master/commands/<name>.md'],
            ['Every project', '~/.config/puppet-master/commands/<name>.md'],
            ['Same name in both', 'The project one wins.'],
            ['Inside the file', 'A short header (description, overrides) and the text it sends.']
          ])}</div>`
        }),
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
  const captureField = (value, help) => `<label class="form-field full"><span class="form-label">Shortcut keys</span><input class="form-input pm51-commands-capture" name="keys" value="${a(value || '')}" readonly data-autofocus placeholder="Press keys" aria-describedby="pm51-commands-capture-help"/><div class="form-help" id="pm51-commands-capture-help" data-help="keys" data-help-default="${a(help)}">${h(help)}</div></label>`;
  /* The engine's dialog autofocus query matches the head's close button first; every dialog here
     puts focus on the field it is about (kit request: honour [data-autofocus] before the close button). */
  function focusFirst(overlay, selector) {
    const t = overlay.querySelector(selector || '[data-autofocus]'); if (!t) return;
    try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
  }
  function bindCapture(overlay) {
    const input = overlay.querySelector('.pm51-commands-capture'); if (!input) return;
    focusFirst(overlay, '.pm51-commands-capture');
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter') return;
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Backspace' || e.key === 'Delete') { input.value = ''; return; }
      const k = keyName(e); if (!k) return;
      const parts = []; if (e.ctrlKey) parts.push('Ctrl'); if (e.altKey) parts.push('Alt'); if (e.shiftKey) parts.push('Shift'); if (e.metaKey) parts.push('Meta'); parts.push(k);
      input.value = parts.join('+');
      clearError(input);
    });
  }
  function reportKeys(s) {
    const others = conflictsFor(s);
    if (others.length) PM51.toast('Shortcut saved, but it clashes', `${s.keys} is also used by ${others.join(', ')}. Change one of them.`, 'info');
    else PM51.toast('Shortcut saved', s.keys ? `${s.name} is now ${s.keys}.` : `${s.name} has no shortcut now.`);
  }
  PM51.onInput('commands-filter', el => {
    prefs().filter = el.value;
    const q = el.value.trim().toLowerCase();
    const section = el.closest('.pm51-section'); if (!section) return;
    section.querySelectorAll('.pm51-row[data-search]').forEach(row => row.classList.toggle('is-hidden', !!q && !row.dataset.search.includes(q)));
  });
  PM51.on('commands-rebind', el => {
    const cmdId = ds(el, 'command');
    const cmd = cmdId ? commandById(cmdId) : null;
    if (cmdId && !cmd) return;
    const existing = cmd ? shortcutForCommand(cmd.id) : shortcutById(ds(el, 'id'));
    if (!cmd && !existing) return;
    const name = cmd ? cmd.name : existing.name;
    const back = ds(el, 'return') === 'sheet' && cmd ? cmd.id : '';
    openDialog({
      title: `${existing && existing.keys ? 'Change' : 'Add'} shortcut for ${name}`, subtitle: cmd ? 'Press the keys that should run this command.' : 'Press the keys you want to use.',
      body: captureField(existing ? existing.keys : '', 'Hold Ctrl, Alt, or Shift with a key. Backspace clears it.'),
      saveLabel: 'Use these keys',
      onOpen: bindCapture,
      onSave: form => {
        const keys = String(form.keys || '').trim();
        let s = existing;
        if (cmd) {
          if (!keys) {
            if (s) { data().shortcuts = shortcuts().filter(x => x.id !== s.id); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Shortcut removed', `${cmd.name} has no keys now.`); }
            if (back) openCommand(back);
            return;
          }
          if (!s) { s = { id: 'cmd:' + cmd.id, name: cmd.name, keys: '', command: cmd.id }; shortcuts().push(s); }
        }
        s.keys = keys;
        saveState(); PM51.refresh(ID, { swap: false });
        reportKeys(s);
        if (back) openCommand(back);
      }
    });
  });
  PM51.on('commands-add-shortcut', () => {
    if (!custom().length) { PM51.toast('Make a command first', 'Shortcuts for your own commands appear here once you have one. Use New command on the Commands tab.', 'info'); return; }
    const free = custom().filter(c => !keysFor(c));
    if (!free.length) { PM51.toast('Every command has a shortcut', 'Click a shortcut to change it, or remove one to free it up.', 'info'); return; }
    openDialog({
      title: 'Add shortcut', subtitle: 'Press keys to run one of your commands.',
      body: `<div class="form-field full"><span class="form-label">Command</span>${PM51.dropdown(free[0].id, free.map(c => ({ value: c.id, label: c.name, meta: c.description })), { name: 'command', label: 'Command' })}${helpBlock('Only commands without keys are listed.', 'command')}</div>`
        + captureField('', 'Hold Ctrl, Alt, or Shift with a key.'),
      saveLabel: 'Add shortcut',
      onOpen: bindCapture,
      onSave: (form, formEl) => {
        const cmd = commandById(String(form.command || ''));
        const keys = String(form.keys || '').trim();
        if (!cmd) return fail(formEl, 'command', 'Pick one of your commands.');
        if (!keys) return fail(formEl, 'keys', 'Press the keys you want to use.');
        let s = shortcutForCommand(cmd.id);
        if (!s) { s = { id: 'cmd:' + cmd.id, name: cmd.name, keys: '', command: cmd.id }; shortcuts().push(s); }
        s.keys = keys;
        saveState(); PM51.refresh(ID, { swap: false });
        reportKeys(s);
      }
    });
  });
  PM51.on('commands-shortcut-remove', el => {
    const s = shortcutById(ds(el, 'id')); if (!s) return;
    data().shortcuts = shortcuts().filter(x => x.id !== s.id); saveState(); PM51.refresh(ID, { swap: false });
    PM51.toast('Shortcut removed', `${s.name} still works from chat and the palette.`);
  });
  PM51.on('commands-sheet', () => {
    const groups = [
      ['Shortcuts', shortcuts().filter(s => s.keys && !s.command).map(s => [s.keys, s.name])],
      ['Built-in commands', builtIn().map(c => [c.command, c.name])],
      ['Your commands', custom().map(c => [c.name, (keysFor(c) ? keysFor(c) + ' · ' : 'No shortcut · ') + (c.description || 'No description yet')])]
    ];
    PM51.panel({
      title: 'Cheat sheet', subtitle: 'Every shortcut and command in one place.', icon: 'key',
      body: groups.filter(g => g[1].length).map(g => PM51.panelSection(g[0], `<div class="pm51-commands-sheet">${PM51.kv(g[1])}</div>`)).join('')
    });
  });
  PM51.on('commands-pref', el => { const key = ds(el, 'pref'); if (!(key in PREF_DEFAULTS)) return; prefs()[key] = !prefs()[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.onChange('commands-layout', el => { prefs().layout = el.value; saveState(); });
  PM51.on('commands-reset-shortcuts', () => PM51.confirm('Reset all shortcuts?', 'Every shortcut goes back to its default keys, including the ones on your own commands.', 'Reset', () => {
    data().shortcuts = clone(DATA.commands.shortcuts).filter(s => !s.command || commandById(s.command)); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Shortcuts reset', 'Default keys are back.');
  }));
  PM51.on('commands-export', el => {
    const what = ds(el, 'what') === 'commands' ? 'commands' : 'shortcuts';
    const count = what === 'commands' ? custom().length : shortcuts().length;
    PM51.panel({
      title: what === 'commands' ? 'Export commands' : 'Export shortcuts', subtitle: 'A small file you can share or keep as a backup.', icon: 'download',
      body: PM51.panelSection('What goes in the file', PM51.kv([[what === 'commands' ? 'Commands' : 'Shortcuts', String(count)], ['Format', what === 'commands' ? 'Markdown files with a short header' : 'JSON'], ['Secrets', 'None. Only names and settings.']])) + PM51.note('Files are saved only in the real app. Nothing was written in this preview.', 'info')
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

  /* ---------- dialog validation helpers ----------------------------------- */
  function clearError(field) {
    if (!field) return;
    field.removeAttribute('aria-invalid');
    const box = field.closest('.form-field'); const help = box && box.querySelector('[data-help]');
    if (help && help.classList.contains('is-error')) { help.classList.remove('is-error'); help.textContent = help.dataset.helpDefault || ''; }
  }
  function fail(formEl, name, message) {
    const field = formEl && formEl.querySelector(`[name="${name}"]`);
    const box = field && field.closest('.form-field');
    const help = (box && box.querySelector(`[data-help="${name}"]`)) || (box && box.querySelector('[data-help]'));
    if (help) { help.textContent = message; help.classList.add('is-error'); }
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      const target = field.classList.contains('pm51-dd-native') ? box.querySelector('.pm51-dd-trigger') : field;
      if (target) { try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); } }
    }
    if (!help) PM51.toast('Check the form', message, 'info');
    return false;
  }
  const overrideField = (key, value, opts) => {
    const f = OVERRIDE_FIELDS.find(x => x.key === key);
    return `<div class="form-field full"><span class="form-label">${h(f.label)}</span>${PM51.dropdown(value || '', f.options(value || ''), Object.assign({ label: f.label, name: key }, opts || {}))}${helpBlock(f.help, key)}</div>`;
  };

  /* ---------- New command dialog ------------------------------------------- */
  PM51.on('commands-new', () => openDialog({
    title: 'New command', subtitle: 'A piece of text you send often, ready to run by typing its name.', wide: true,
    body: `<div class="pm51-commands-form form-grid">`
      + `<label class="form-field"><span class="form-label">Name</span><span class="pm51-commands-name"><span class="pm51-commands-adorn" aria-hidden="true">/x-</span><input class="form-input" name="name" placeholder="tidy-docs" data-autofocus autocomplete="off" spellcheck="false" aria-label="Command name after /x-"/></span>${helpBlock('Lowercase letters, numbers, - and _. Built-in names such as help are taken.', 'name')}</label>`
      + `<label class="form-field"><span class="form-label">Description</span><input class="form-input" name="description" placeholder="One line that says what it does" autocomplete="off"/>${helpBlock('Shown next to the name in chat and in the command palette.', 'description')}</label>`
      + `<label class="form-field full"><span class="form-label">What it sends</span><textarea class="form-textarea pm51-commands-template" name="template" rows="5" spellcheck="false" placeholder="${a(TEMPLATE_PLACEHOLDER)}"></textarea><div class="form-help pm51-commands-ph" data-placeholders>${placeholderLine('')}</div>${helpBlock('$ARGUMENTS is everything typed after the name. $1 $2 are single words. @path pastes a file. !`command` pastes what a command prints. Leave it empty to send the description as written.', 'template')}</label>`
      + `<label class="form-field"><span class="form-label">Arguments hint</span><input class="form-input" name="argumentsHint" placeholder="For example: <branch name>" autocomplete="off"/>${helpBlock('Shown while you type the command, so you remember what to pass.', 'argumentsHint')}</label>`
      + `<div class="form-field"><span class="form-label">Where it is available</span>${PM51.dropdown('Project', [{ value: 'Project', label: 'This project', meta: '.puppet-master/commands/' }, { value: 'Global', label: 'Every project', meta: 'Your user folder' }], { name: 'scope', label: 'Where it is available' })}${helpBlock('This project: .puppet-master/commands/. Every project: your user folder. The project one wins when both have the same name.', 'scope')}</div>`
      + `<details class="pm51-dialog-group"><summary>${icon('chevron')}<span>Overrides</span><small>(optional)</small></summary><div class="pm51-dialog-group-body"><p class="form-help">Leave these on Inherit and the command runs exactly like a message you typed yourself.</p>`
      + overrideField('persona', '') + overrideField('mode', '') + overrideField('model', '') + overrideField('permissionsProfile', '')
      + `</div></details></div>`,
    saveLabel: 'Create command',
    onOpen: overlay => {
      focusFirst(overlay);
      const ta = overlay.querySelector('textarea[name="template"]'); const line = overlay.querySelector('[data-placeholders]');
      if (ta && line) ta.addEventListener('input', () => { line.innerHTML = placeholderLine(ta.value); });
      overlay.querySelectorAll('input[name], textarea[name]').forEach(el => el.addEventListener('input', () => clearError(el)));
    },
    onSave: (form, formEl) => {
      let raw = String(form.name || '').trim();
      raw = raw.replace(/^\//, '').replace(/^x-/, '');
      const description = String(form.description || '').trim();
      const builtInWords = builtIn().map(c => String(c.command || '').replace(/^\//, '').split(/\s+/)[0]).filter(Boolean);
      if (!raw) return fail(formEl, 'name', 'Give it a name after /x-.');
      if (RESERVED_NAMES.includes(raw) || builtInWords.includes(raw)) return fail(formEl, 'name', `/${raw} is a built-in command. Pick another name.`);
      if (!NAME_RE.test(raw)) return fail(formEl, 'name', 'Use lowercase letters, numbers, - or _. Start with a letter and end with a letter or number.');
      if (commandById('x-' + raw)) return fail(formEl, 'name', `You already have /x-${raw}.`);
      if (!description) return fail(formEl, 'description', 'Say what it does in one line.');
      const template = String(form.template || '').replace(/\r\n/g, '\n');
      const c = {
        id: 'x-' + raw, name: '/x-' + raw, description, template: template.trim() ? template : description,
        argumentsHint: String(form.argumentsHint || '').trim(), scope: form.scope === 'Global' ? 'Global' : 'Project',
        overrides: { persona: form.persona || null, mode: form.mode || null, model: form.model || null, permissionsProfile: form.permissionsProfile || null },
        enabled: true, source: 'user'
      };
      custom().push(c); PM51.setTab(ID, 'commands');
      saveState(); PM51.refresh(ID, { swap: false });
      PM51.toast('Command created', `Type ${c.name} in chat to run it. It lives in ${pathFor(c)}.`);
    }
  }));

  /* ---------- command hero sheet ------------------------------------------- */
  let sheet = null;
  function sheetFor(id) { return sheet && sheet.isConnected && sheet.dataset.command === id ? sheet : null; }
  function syncSheet(c) {
    const w = sheetFor(c.id); if (!w) return;
    const dd = w.querySelectorAll('.pm51-hero-facts dd');
    if (dd[0]) dd[0].textContent = scopeLabel(c.scope);
    if (dd[1]) dd[1].textContent = keysFor(c) || 'None';
    if (dd[2]) dd[2].textContent = overrideCount(c) ? `${overrideCount(c)} set` : 'None';
    const st = w.querySelector('.pm51-hero-status'); if (st) st.innerHTML = PM51.status(c.enabled ? 'On' : 'Off', c.enabled ? 'ready' : 'off');
    const sub = w.querySelector('.pm51-panel-sub'); if (sub) sub.textContent = c.description || 'No description yet.';
    const path = w.querySelector('[data-scope-path]'); if (path) path.textContent = `Stored as ${pathFor(c)}.`;
    const ph = w.querySelector('[data-placeholders]'); if (ph) ph.innerHTML = placeholderLine(c.template);
  }
  function openCommand(id) {
    const c = commandById(id); if (!c) return;
    const keys = keysFor(c); const n = overrideCount(c);
    const summary = `Type ${c.name} in chat or pick it from the command palette.${keys ? ` Press ${keys} to run it anywhere.` : ''}`;
    sheet = PM51.panel({
      title: c.name, subtitle: c.description || 'No description yet.', icon: 'terminal', eyebrow: 'Your command', size: 'wide', summary,
      status: { label: c.enabled ? 'On' : 'Off', tone: c.enabled ? 'ready' : 'off' },
      facts: [{ label: 'Available in', value: scopeLabel(c.scope) }, { label: 'Shortcut', value: keys || 'None' }, { label: 'Overrides', value: n ? `${n} set` : 'None' }],
      body: PM51.panelSection('What it sends',
        `<label class="pm51-field"><span class="pm51-field-label">Text</span><textarea class="form-textarea pm51-commands-template" data-action="pm51-commands-template" data-id="${a(c.id)}" rows="7" spellcheck="false" aria-label="What it sends" placeholder="${a(TEMPLATE_PLACEHOLDER)}">${h(c.template || '')}</textarea><span class="pm51-field-help pm51-commands-ph" data-placeholders>${placeholderLine(c.template)}</span></label>`
        + PM51.field('Arguments hint', PM51.input(c.argumentsHint || '', { action: 'pm51-commands-args', data: { id: c.id }, placeholder: 'For example: <branch name>' }), 'Shown while you type the command, so you remember what to pass.'),
        '$ARGUMENTS is everything typed after the name. $1 $2 are single words. @path pastes a file. !`command` pastes what a command prints.', { icon: 'code' })
        + PM51.panelSection('Description', PM51.field('One line', PM51.input(c.description || '', { action: 'pm51-commands-desc', data: { id: c.id }, placeholder: 'What this command does' }), 'Shown next to the name in chat and in the command palette.'), '', { icon: 'edit' })
        + PM51.panelSection('Where it is available',
          PM51.field('Scope', PM51.dropdown(c.scope, [{ value: 'Project', label: 'This project', meta: '.puppet-master/commands/' }, { value: 'Global', label: 'Every project', meta: 'Your user folder' }], { action: 'pm51-commands-field', data: { id: c.id, field: 'scope' }, label: 'Where it is available' }))
          + `<p class="pm51-ps-help" data-scope-path>Stored as ${h(pathFor(c))}.</p>`,
          'A project command wins when both have the same name.', { icon: 'folder' })
        + PM51.panelSection('Overrides',
          `<div class="pm51-commands-overrides">${OVERRIDE_FIELDS.map(f => PM51.field(f.label, PM51.dropdown(c.overrides[f.key] || '', f.options(c.overrides[f.key] || ''), { action: 'pm51-commands-override', data: { id: c.id, key: f.key }, label: f.label }), f.help)).join('')}</div>`,
          'Leave these on Inherit and the command runs exactly like a message you typed yourself.', { icon: 'sliders' })
        + PM51.panelSection('Shortcut',
          `<div class="pm51-commands-shortcut">${keyStatic(keys)}${PM51.btn({ label: keys ? 'Change shortcut' : 'Add shortcut', small: true, icon: 'key', action: 'pm51-commands-rebind', data: { command: c.id, return: 'sheet' } })}</div>`,
          'Runs the command from anywhere in Puppet Master. Backspace in the box clears it.', { icon: 'key' })
        + PM51.panelSection('Use it', PM51.rows([{ label: 'Enabled', help: 'Off hides it from chat and the command palette. The file stays where it is.', control: PM51.toggle(!!c.enabled, { action: 'pm51-commands-toggle', data: { id: c.id }, label: `${c.name} enabled` }) }]), '', { icon: 'check' })
        + PM51.panelSection('Remove', actionRow(PM51.btn({ label: 'Delete command', small: true, danger: true, icon: 'trash', action: 'pm51-commands-delete', data: { id: c.id } })), 'Deletes the file and its shortcut. You can make it again later.', { icon: 'trash' }),
      primaryLabel: 'Preview (dry run)', onPrimary: () => { dryRun(c.id); }
    });
    if (sheet) sheet.dataset.command = c.id;
  }

  /* ---------- dry run ----------------------------------------------------------- */
  const requested = (value, effective, note) => `Requested ${value} · effective ${effective}${note ? ` (${note})` : ''}`;
  function runPlan(c) {
    const ov = c.overrides || {};
    const personaOk = !!ov.persona && personas().some(p => p.name === ov.persona);
    const model = ov.model ? modelById(ov.model) : null;
    const profile = ov.permissionsProfile ? profileById(ov.permissionsProfile) : null;
    return {
      persona: ov.persona ? { fact: `${ov.persona} · requested`, line: personaOk ? requested(ov.persona, ov.persona) : requested(ov.persona, 'the chat\'s persona', `${ov.persona} is not available`) } : { fact: 'Inherits the chat\'s', line: 'Not set · the chat\'s persona is used' },
      mode: ov.mode ? { fact: `${MODE_LABELS[ov.mode] || ov.mode} · requested`, line: requested(MODE_LABELS[ov.mode] || ov.mode, MODE_LABELS[ov.mode] || ov.mode, 'or stricter, if the chat is stricter') } : { fact: 'Inherits the chat\'s', line: 'Not set · the chat\'s mode is used' },
      model: ov.model ? { fact: `${modelName(ov.model)} · requested`, line: model ? requested(model.name, `${model.name} from ${model.provider}`) : requested(modelName(ov.model), 'the chat\'s model', `${modelName(ov.model)} is not available`) } : { fact: 'Inherits the chat\'s', line: 'Not set · the chat\'s model is used' },
      permissions: ov.permissionsProfile ? (profile ? requested(profile.name, profile.name, 'never more than your own profile allows') : requested(String(ov.permissionsProfile), 'your profile', 'that profile is not available')) : 'Not set · your own profile applies'
    };
  }
  function dryRun(id) {
    const c = commandById(id); if (!c) return;
    const sample = 'example';
    const found = scanTemplate(c.template);
    const plan = runPlan(c);
    const w = PM51.panel({
      title: `Dry run · ${c.name}`, subtitle: c.description || '', icon: 'play', eyebrow: 'Preview', size: 'wide',
      status: { label: 'Preview · nothing runs', tone: 'info' },
      summary: 'This is the text the chat would receive. Files and commands are not read in this preview; when it really runs they need permission.',
      facts: [{ label: 'Persona', value: plan.persona.fact }, { label: 'Mode', value: plan.mode.fact }, { label: 'Model', value: plan.model.fact }],
      body: PM51.panelSection('Sample input', PM51.field('What you type after the name', PM51.input(sample, { action: 'pm51-commands-sample', data: { id: c.id }, placeholder: 'For example: v2.1 release', label: 'Sample input' }), found.args || found.positional.length ? `Fills ${found.labels.filter(l => l.startsWith('$')).join(' and ')} below.` : 'This command has no placeholders, so the input is not used.'), '', { icon: 'edit' })
        + PM51.panelSection('Resolved prompt', `<pre class="pm51-code" data-resolved>${resolveTemplate(c.template, sample)}</pre><div class="pm51-commands-legend"><span><i></i>Filled from your input</span><span><i class="is-perm"></i>Needs permission when it runs</span></div>`
          + (found.labels.length ? '' : PM51.note('No placeholders here, so the text is sent exactly as written.', 'info')), '', { icon: 'code' })
        + PM51.panelSection('How it will run', PM51.kv([['Persona', plan.persona.line], ['Mode', plan.mode.line], ['Model', plan.model.line], ['Permissions', plan.permissions], ['Available in', `${scopeLabel(c.scope)} · ${pathFor(c)}`]]), 'Requested is what the command asks for. Effective is what happens after the chat\'s own limits apply.', { icon: 'sliders' }),
      secondaryLabel: 'Back to command', onSecondary: () => { openCommand(c.id); }
    });
    if (w) w.dataset.dryRun = c.id;
  }
  PM51.onInput('commands-sample', el => {
    const c = commandById(ds(el, 'id')); if (!c) return;
    const w = el.closest('.drawer-wrap'); const pre = w && w.querySelector('[data-resolved]'); if (!pre) return;
    pre.innerHTML = resolveTemplate(c.template, el.value);
  });

  /* ---------- command behaviour ------------------------------------------- */
  PM51.on('commands-open', el => openCommand(ds(el, 'id')));
  PM51.on('commands-toggle', el => {
    const c = commandById(ds(el, 'id')); if (!c) return;
    c.enabled = !c.enabled;
    if (el.classList.contains('pm51-toggle')) { el.classList.toggle('on', c.enabled); el.setAttribute('aria-checked', String(c.enabled)); }
    saveState(); PM51.refresh(ID, { swap: false }); syncSheet(c);
  });
  PM51.onChange('commands-field', el => {
    const c = commandById(ds(el, 'id')); const field = ds(el, 'field'); if (!c || field !== 'scope') return;
    c.scope = el.value === 'Global' ? 'Global' : 'Project'; saveState(); PM51.refresh(ID, { swap: false }); syncSheet(c);
  });
  PM51.onChange('commands-override', el => {
    const c = commandById(ds(el, 'id')); const key = ds(el, 'key'); if (!c || !OVERRIDE_KEYS.includes(key)) return;
    c.overrides[key] = el.value || null; saveState(); PM51.refresh(ID, { swap: false }); syncSheet(c);
  });
  PM51.onInput('commands-template', el => { const c = commandById(ds(el, 'id')); if (!c) return; c.template = el.value; saveState(); const ph = el.closest('.pm51-field') && el.closest('.pm51-field').querySelector('[data-placeholders]'); if (ph) ph.innerHTML = placeholderLine(c.template); });
  PM51.onInput('commands-args', el => { const c = commandById(ds(el, 'id')); if (!c) return; c.argumentsHint = el.value; saveState(); });
  PM51.onInput('commands-desc', el => { const c = commandById(ds(el, 'id')); if (!c) return; c.description = el.value; saveState(); const w = sheetFor(c.id); const sub = w && w.querySelector('.pm51-panel-sub'); if (sub) sub.textContent = c.description || 'No description yet.'; });
  PM51.on('commands-delete', el => {
    const c = commandById(ds(el, 'id')); if (!c) return;
    PM51.confirm(`Delete ${c.name}?`, `The command and its shortcut are removed from chat and the palette. ${pathFor(c)} is deleted. You can make it again later.`, 'Delete', () => {
      data().custom = custom().filter(x => x.id !== c.id); data().shortcuts = shortcuts().filter(s => s.command !== c.id);
      saveState(); PM51.refresh(ID, { swap: false }); PM51.toast(`${c.name} deleted`, 'It is no longer on your list.');
    }, true);
  });
  PM51.on('commands-reset', () => PM51.confirm('Reset commands and shortcuts?', 'Your commands, shortcuts, and hint settings go back to their defaults.', 'Reset', () => {
    PM51.s().commands = clone(DATA.commands); migrateCommands(PM51.s().commands); PM51.s().commandsPrefs = clone(PREF_DEFAULTS); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Commands and shortcuts reset', 'Defaults are back.');
  }));
  PM51.on('commands-help', () => PM51.panel({
    title: 'How commands work', icon: 'terminal',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A command is a piece of text you send often. Type its name in chat, and Puppet Master sends that text for you. Built-in commands come with Puppet Master. Your own commands start with /x- so they never clash.</p>')
      + PM51.panelSection('Placeholders', PM51.kv([['$ARGUMENTS', 'Everything you type after the name.'], ['$1, $2 …', 'The first word, the second word, and so on.'], ['@path', 'Pastes that file into the text. Needs read permission.'], ['!`command`', 'Pastes what that command prints. Needs command permission.']]))
      + PM51.panelSection('Overrides', '<p class="pm51-ps-text">A command can ask for a persona, a mode, a model, or a permissions profile. These are requests: the chat\'s own mode and your permissions still cap them, and you always see what was requested and what actually applies.</p>')
      + PM51.panelSection('Good to know', PM51.kv([['Dry run', 'Shows the exact text a command would send, with sample input, without running it.'], ['Shortcuts', 'Any of your commands can have keys. Add them in the Shortcuts tab or from the command itself.'], ['Files', 'Each command is a Markdown file in .puppet-master/commands/ (this project) or your user folder (every project).']]))
  }));
})();
