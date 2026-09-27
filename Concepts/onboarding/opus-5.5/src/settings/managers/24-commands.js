/* Commands & Shortcuts — type / commands and press keys to do things faster.
   A user command is a prompt template (Plans/Commands_System.md §1.1, §3): the text it sends, with
   $ARGUMENTS / $1..$N placeholders, @path file includes and !`command` output. Persona, mode, model
   and permissions profile are optional overrides, never the definition.
   Shortcuts are one list in three groups: everywhere (the app's shortcuts, your commands' keys and the model
   variant key), in the message box (extensions.commands.text-editing-keys) and in the terminal
   (code.terminal.shortcuts). Every key uses the same capture button, and a clash is flagged across groups, so the
   Ctrl+K that searches settings and the Ctrl+K that deletes to the end of a line are caught. The list writes the
   inventory's map of changed keys; its search box, hints switch, reset and save/load are the inventory rows and
   actions, not second copies. On the Commands tab the scope, mode, model, persona and permissions rows are what
   they are: defaults for a new command, which the New command dialog starts from. */
(function () {
  const ID = 'commands';
  const KEY = 'commands-shortcuts';
  const TABS = [{ id: 'shortcuts', label: 'Shortcuts' }, { id: 'commands', label: 'Commands' }];
  const PREF_DEFAULTS = { layout: 'Auto-detect', palette: true };
  const SID = {
    list: 'extensions.commands.keyboard-shortcuts', hints: 'extensions.commands.shortcut-hints', search: 'extensions.commands.search-shortcuts', clash: 'extensions.commands.conflict-handling',
    text: 'extensions.commands.text-editing-keys', term: 'code.terminal.shortcuts', variant: 'extensions.commands.variant-cycling-key', reset: 'extensions.commands.reset-shortcuts',
    backup: 'extensions.commands.backup-shortcuts', custom: 'extensions.commands.custom-commands', scope: 'extensions.commands.command-scope', mode: 'extensions.commands.command-mode',
    model: 'extensions.commands.command-model', persona: 'extensions.commands.command-persona', perms: 'extensions.commands.command-permissions',
    builtinName: 'extensions.commands.override-builtin', git: 'extensions.commands.git-routing', confirm: 'command-confirm'
  };
  /* The terminal's own keys (the inventory stores only the ones you change, as "Name: keys"). */
  const TERMINAL_DEFAULTS = [['Search the terminal', 'Ctrl+Shift+F'], ['Next match', 'F3'], ['Previous match', 'Shift+F3'], ['Jump to the top', 'Ctrl+Home'], ['Jump to the bottom', 'Ctrl+End'], ['Bigger text', 'Ctrl+='], ['Smaller text', 'Ctrl+-'], ['Clear the terminal', 'Ctrl+Shift+K']];
  const BOX_LABELS = { 'Cursor back one char': 'Back one character', 'Cursor forward one char': 'Forward one character', 'Cursor back one word': 'Back one word', 'Cursor forward one word': 'Forward one word', 'Delete char under cursor': 'Delete the character under the cursor', 'Cancel popups / stop response': 'Close pop-ups or stop the reply' };
  const SHAPE_VERSION = 2;
  const NAME_RE = /^[a-z][a-z0-9_-]{0,48}[a-z0-9]$/;
  const RESERVED_NAMES = ['new', 'model', 'effort', 'mode', 'export', 'compact', 'stop', 'resume', 'rewind', 'revert', 'share', 'settings', 'doctor', 'help', 'web', 'skill', 'cancel', 'clear', 'worktree', 'plugins'];
  const MODE_OPTIONS = [
    { value: '', label: 'Inherit', meta: 'Chat mode' },
    { value: 'ask', label: 'Ask', meta: 'Read-only answers' },
    { value: 'plan', label: 'Plan', meta: 'Read-only planning' },
    { value: 'regular', label: 'Regular', meta: 'Normal approvals' },
    { value: 'yolo', label: 'No pauses', meta: 'No approvals' }
  ];
  const MODE_LABELS = { ask: 'Ask', plan: 'Plan', regular: 'Regular', yolo: 'No pauses' };
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
  /* ---------- every key in one index: clashes are checked across the three groups ---------- */
  const commitIf = (id, v) => { if (PM51.setting(id) && JSON.stringify(PM51.value(id)) !== JSON.stringify(v) && commitSettingValue(id, v)) { saveState(); return true; } return false; };
  const defaultOf = id => { const s = PM51.setting(id); return s ? clone(s.value) : undefined; };
  const textKeys = () => { const v = PM51.value(SID.text); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const termKeys = () => {
    const map = Object.fromEntries(TERMINAL_DEFAULTS); const v = PM51.value(SID.term);
    if (Array.isArray(v)) v.forEach(x => { const m = /^(.+?):\s*(.*)$/.exec(String(x)); if (m && m[1] in map) map[m[1]] = /^none$/i.test(m[2]) ? '' : m[2]; });
    return map;
  };
  function saveTerm(map) {
    const changed = TERMINAL_DEFAULTS.filter(([n, k]) => (map[n] || '') !== k).map(([n]) => `${n}: ${map[n] || 'None'}`);
    if (changed.length) commitIf(SID.term, changed); else if (JSON.stringify(PM51.value(SID.term)) !== JSON.stringify(defaultOf(SID.term))) { restoreSettingDefault(SID.term); saveState(); }
  }
  const variantKeys = () => { const v = String(PM51.value(SID.variant) || ''); return /^unbound$/i.test(v) ? '' : v; };
  const fixtureShortcut = id => ((DATA.commands && DATA.commands.shortcuts) || []).find(x => x.id === id);
  function allKeys() {
    const out = shortcuts().filter(s => s.keys).map(s => ({ id: s.id, group: 'app', name: s.name, keys: s.keys }));
    if (variantKeys()) out.push({ id: 'variant', group: 'app', name: 'Switch model variant', keys: variantKeys() });
    Object.entries(textKeys()).forEach(([n, k]) => { if (k) out.push({ id: 'box:' + n, group: 'box', name: BOX_LABELS[n] || n, keys: k }); });
    Object.entries(termKeys()).forEach(([n, k]) => { if (k) out.push({ id: 'term:' + n, group: 'term', name: n, keys: k }); });
    return out;
  }
  const WHERE = { box: ' (message box)', term: ' (terminal)', app: '' };
  /* app-wide keys clash with every group; the message box and the terminal never see each other's keys */
  const clashesFor = (id, group, keys) => !keys ? [] : allKeys().filter(o => o.id !== id && o.keys.toLowerCase() === String(keys).toLowerCase() && (o.group === group || o.group === 'app' || group === 'app')).map(o => o.name + (o.group === group ? '' : WHERE[o.group]));
  const conflictsFor = s => clashesFor(s.id, 'app', s.keys);
  /* A key target that is not one of the app's shortcuts: the variant key, a message-box key or a terminal key. */
  function keyTarget(id) {
    if (id === 'variant') return { name: 'Switch model variant', group: 'app', keys: variantKeys(), def: '', save: k => commitIf(SID.variant, k || 'unbound') };
    if (id.startsWith('box:')) { const n = id.slice(4); return { name: BOX_LABELS[n] || n, group: 'box', keys: textKeys()[n] || '', def: (defaultOf(SID.text) || {})[n] || '', save: k => commitIf(SID.text, Object.assign({}, textKeys(), { [n]: k || '' })) }; }
    if (id.startsWith('term:')) { const n = id.slice(5); return { name: n, group: 'term', keys: termKeys()[n] || '', def: Object.fromEntries(TERMINAL_DEFAULTS)[n] || '', save: k => { const m = termKeys(); m[n] = k || ''; saveTerm(m); } }; }
    return null;
  }
  /* the inventory keeps only the keys you changed */
  function syncStores() {
    const map = {}; shortcuts().forEach(s => { const d = fixtureShortcut(s.id); if (!d || d.keys !== s.keys) map[s.name] = s.keys || 'None'; });
    commitIf(SID.list, map);
    commitIf(SID.custom, custom().map(c => c.name));
  }
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
#panel-settings .pm51-commands-group { margin: 16px 0 2px; }
#panel-settings .pm51-commands-group:first-child { margin-top: 6px; }
#panel-settings .pm51-commands-group-title { font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--k3-text-3); }
#panel-settings .pm51-commands-group-help { margin-top: 2px; font-size: 11.5px; color: var(--k3-text-3); }
#panel-settings .pm51-commands-search .o55-bound-search { max-width: 380px; }
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
  const searchQuery = () => String(PM51.value(SID.search) || '').trim().toLowerCase();
  function keyRow({ id, name, keys, group, help, extra }) {
    const others = clashesFor(id, group, keys); const q = searchQuery();
    const search = (name + ' ' + (keys || '') + ' ' + (help || '')).toLowerCase();
    return {
      label: name, pill: others.length ? PM51.status(`Clashes with ${others.join(', ')}`, 'attention') : '',
      help: others.length ? 'Only one of them can win. Change one.' : help,
      control: keyButton({ id, name, keys }) + (extra || ''), cls: q && !search.includes(q) ? 'is-hidden' : '', data: { search, shortcut: id }
    };
  }
  const groupTitle = (title, help) => `<div class="pm51-commands-group"><div class="pm51-commands-group-title">${h(title)}</div>${help ? `<div class="pm51-commands-group-help">${h(help)}</div>` : ''}</div>`;
  const keyStatic = keys => `<span class="pm51-commands-keys is-static${keys ? '' : ' is-empty'}">${keys ? keysHtml(keys) : 'No shortcut'}</span>`;
  const actionRow = (...buttons) => `<div class="pm51-commands-actions">${buttons.join('')}</div>`;

  /* ---------- Shortcuts tab ------------------------------------------------ */
  function renderShortcuts() {
    const p = prefs();
    const app = shortcuts().map(s => {
      const cmd = s.command ? commandById(s.command) : null;
      return keyRow({ id: s.id, name: s.name, keys: s.keys, group: 'app', help: cmd ? `Runs ${cmd.name}${cmd.description ? ' · ' + cmd.description : ''}` : '', extra: s.command ? PM51.iconBtn({ action: 'pm51-commands-shortcut-remove', data: { id: s.id }, icon: 'trash', label: `Remove shortcut for ${s.name}` }) : '' });
    });
    app.push(keyRow({ id: 'variant', name: 'Switch model variant', keys: variantKeys(), group: 'app', help: 'Flips between a model\'s variants without opening the picker.' }));
    const box = Object.entries(textKeys()).map(([n, k]) => keyRow({ id: 'box:' + n, name: BOX_LABELS[n] || n, keys: k, group: 'box' }));
    const term = Object.entries(termKeys()).map(([n, k]) => keyRow({ id: 'term:' + n, name: n, keys: k, group: 'term' }));
    const clashes = allKeys().filter(k => clashesFor(k.id, k.group, k.keys).length).length;
    const free = custom().filter(c => !keysFor(c)).length;
    const list = groupTitle('Everywhere', 'Work anywhere in Puppet Master.') + PM51.rows(app)
      + PM51.home(SID.text, groupTitle('In the message box', 'For moving and deleting while you type.') + PM51.rows(box))
      + PM51.home(SID.term, groupTitle('In the terminal', 'Only while the terminal has focus.') + PM51.rows(term));
    return [
      PM51.section({
        title: 'Keyboard shortcuts', help: 'Click a shortcut to change it. Your own commands can have keys too.',
        action: { label: 'Add shortcut', icon: 'plus', action: 'pm51-commands-add-shortcut', data: { free: String(free) } },
        body: `<div class="pm51-commands-search">${PM51.bound.search(SID.search, { placeholder: 'Search shortcuts by name or keys' })}</div>`
          + (clashes ? PM51.note(`${clashes} shortcuts share keys with another. Change one of each pair so both work.`, 'attention') : '')
          + PM51.home(SID.list, PM51.home(SID.variant, list))
      }),
      PM51.section({
        title: 'Hints and clashes',
        body: PM51.bound.rows([SID.hints, SID.clash]) + PM51.rows([{ label: 'Cheat sheet', help: 'Every shortcut and command on one page.', action: { label: 'Open cheat sheet', icon: 'file', action: 'pm51-commands-sheet' } }])
      }),
      PM51.advanced([
        PM51.rows([
          { label: 'Keyboard layout', help: 'Auto-detect follows your system. Pick one if keys land in the wrong place.', control: PM51.select(p.layout, ['Auto-detect', 'US (QWERTY)', 'UK', 'German (QWERTZ)', 'French (AZERTY)'], { action: 'pm51-commands-layout', label: 'Keyboard layout' }) }
        ]),
        PM51.section({ title: 'Reserved shortcuts', help: 'These belong to the system and cannot be changed.', body: `<div class="pm51-commands-sheet">${PM51.kv(RESERVED_KEYS)}</div>` }),
        actionRow(PM51.bound.action(SID.reset, { label: 'Reset all shortcuts', icon: 'restore' }), PM51.bound.action(SID.backup, { label: 'Save or load shortcuts', icon: 'download' }))
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
      PM51.setting(SID.confirm) ? PM51.section({ title: 'Safety', body: PM51.bound.rows([SID.confirm]) }) : '',
      PM51.section({
        title: 'Your commands', help: 'Type the name in chat to send its text. Open one to see what it sends and how it runs.',
        action: { label: 'New command', icon: 'plus', action: 'pm51-commands-new' },
        body: PM51.home(SID.custom, items.length ? PM51.list(items, { cls: 'pm51-commands-list' }) : PM51.empty('No commands yet', 'Make one to send a prompt you use often with a few keystrokes.', { label: 'New command', action: 'pm51-commands-new', icon: 'plus' }))
      }),
      PM51.section({
        title: 'Built-in commands', help: 'These come with Puppet Master. Change their keys in the Shortcuts tab.',
        body: PM51.rows(builtRows)
      }),
      PM51.advanced([
        PM51.section({ title: 'Defaults for new commands', help: 'A new command starts with these. Each command can change them in its own panel.', body: PM51.bound.rows([SID.scope, SID.mode, SID.model, SID.persona, SID.perms]) }),
        PM51.section({ title: 'Built-in names', body: PM51.bound.rows([SID.builtinName, SID.git]) }),
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
    syncStores();
    const body = tab === 'commands' ? renderCommands() : renderShortcuts();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [{ label: 'Reset commands and shortcuts', action: 'pm51-commands-reset' }, { label: 'How commands work', action: 'pm51-commands-help' }] });
  }
  PM51.manager('commands', { render });
  PM51.owner(ID, id => { const e = PM51.placement.byId[id]; if (e && e.tab) PM51.setTab(ID, e.tab); });
  /* the search box is the inventory row: filter the rows in place so the box keeps focus */
  PM51.watch(SID.search, v => {
    const q = String(v || '').trim().toLowerCase();
    root.querySelectorAll(`[data-pm51-manager="${ID}"] .pm51-row[data-search]`).forEach(row => row.classList.toggle('is-hidden', !!q && !row.dataset.search.includes(q)));
  });
  [SID.hints, SID.clash, SID.text, SID.term, SID.variant, SID.builtinName].forEach(id => PM51.watch(id, () => PM51.refresh(ID, { swap: false })));
  /* model, persona and permissions defaults offer what you really have, not "Choose model..." */
  PM51.moreChoices(SID.model, () => readyProviders().flatMap(p => enabledModels(p).map(m => ({ value: m.id, label: m.name, meta: p.name }))));
  PM51.moreChoices(SID.persona, () => personas().map(p => ({ value: p.name, label: p.name, meta: personaGroup(p) })));
  PM51.moreChoices(SID.perms, () => profiles().map(p => ({ value: p.id, label: p.name, meta: p.scope || '' })));

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
  PM51.on('commands-rebind', el => {
    const target = ds(el, 'id') ? keyTarget(ds(el, 'id')) : null;
    if (target) {
      openDialog({
        title: `${target.keys ? 'Change' : 'Add'} shortcut for ${target.name}`, subtitle: target.group === 'box' ? 'Works while you type in the message box.' : target.group === 'term' ? 'Works while the terminal has focus.' : 'Press the keys you want to use.',
        body: captureField(target.keys, 'Hold Ctrl, Alt, or Shift with a key. Backspace clears it.') + (target.def && target.def !== target.keys ? `<p class="form-help"><button type="button" class="o55-textbtn" data-action="pm51-commands-use-default" data-keys="${a(target.def)}">Use the default (${h(target.def)})</button></p>` : ''),
        saveLabel: 'Use these keys', onOpen: bindCapture,
        onSave: form => {
          const keys = String(form.keys || '').trim(); target.save(keys); PM51.refresh(ID, { swap: false });
          const others = clashesFor(ds(el, 'id'), target.group, keys);
          if (others.length) PM51.toast('Saved, but it clashes', `${keys} is also used by ${others.join(', ')}. Change one of them.`, 'info');
          else PM51.toast('Shortcut saved', keys ? `${target.name} is now ${keys}.` : `${target.name} has no shortcut now.`);
        }
      });
      return;
    }
    const cmdId = ds(el, 'command');
    const cmd = cmdId ? commandById(cmdId) : null;
    if (cmdId && !cmd) return;
    const existing = cmd ? shortcutForCommand(cmd.id) : shortcutById(ds(el, 'id'));
    if (!cmd && !existing) return;
    const name = cmd ? cmd.name : existing.name;
    const back = ds(el, 'return') === 'sheet' && cmd ? cmd.id : '';
    openDialog({
      title: `${existing && existing.keys ? 'Change' : 'Add'} shortcut for ${name}`, subtitle: cmd ? 'Press the keys that should run this command.' : 'Press the keys you want to use.',
      body: captureField(existing ? existing.keys : '', 'Hold Ctrl, Alt, or Shift with a key. Backspace clears it.') + (() => { const d = existing && fixtureShortcut(existing.id); return d && d.keys && d.keys !== existing.keys ? `<p class="form-help"><button type="button" class="o55-textbtn" data-action="pm51-commands-use-default" data-keys="${a(d.keys)}">Use the default (${h(d.keys)})</button></p>` : ''; })(),
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
  /* Add a shortcut: any app action that has none yet, or one of your commands; then press the keys. */
  const APP_ACTIONS = [
    ['open-palette', 'Open the command palette', 'Run anything by name'], ['toggle-terminal', 'Show or hide the terminal', ''], ['focus-chat', 'Jump to the message box', ''],
    ['switch-project', 'Switch project', ''], ['stop-reply', 'Stop the reply', 'Stops the assistant mid-answer'], ['run-last', 'Run the last command again', ''],
    ['open-history', 'Open history', ''], ['toggle-files', 'Show or hide files', ''], ['new-goal-selection', 'New Goal from selected text', ''], ['open-usage', 'Open Usage', '']
  ];
  PM51.on('commands-add-shortcut', () => {
    const taken = new Set(shortcuts().map(s => s.id));
    const actionsFree = APP_ACTIONS.filter(([id]) => !taken.has(id));
    const cmdsFree = custom().filter(c => !keysFor(c));
    PM51.wizard({
      title: 'Add a shortcut', subtitle: 'Keys for an app action or one of your commands.', eyebrow: 'Shortcut', icon: 'key', size: 'default', finishLabel: 'Add shortcut',
      draft: { target: null, keys: '' },
      steps: [
        { label: 'What', title: 'What should the keys do?', render: d => PM51.panelSection('App actions', actionsFree.length ? PM51.tiles(actionsFree.map(([id, name, what]) => ({ title: name, text: what, icon: 'bolt', selected: d.target === id, data: { target: id } })), { action: 'pm51-commands-sc-pick' }) : PM51.note('Every app action already has keys.', 'info'))
            + PM51.panelSection('Your commands', cmdsFree.length ? PM51.tiles(cmdsFree.map(c => ({ title: c.name, text: c.description, icon: 'terminal', selected: d.target === 'cmd:' + c.id, data: { target: 'cmd:' + c.id } })), { action: 'pm51-commands-sc-pick' }) : PM51.note(custom().length ? 'Every command of yours already has keys.' : 'Make a command on the Commands tab to give it keys.', 'info')),
          check: d => d.target ? '' : 'Pick what the keys should do.' },
        { label: 'Keys', title: 'Press the keys you want to use.', render: d => captureField(d.keys, 'Hold Ctrl, Alt, or Shift with a key. Backspace clears it.') + '<p class="o55-wiz-lead o55-sc-clash" aria-live="polite"></p>',
          onShow: (wrap, d) => { bindCapture(wrap); const i = wrap.querySelector('.pm51-commands-capture'), out = wrap.querySelector('.o55-sc-clash'); const upd = () => { const c = i.value ? clashesFor(d.target, 'app', i.value) : []; out.textContent = c.length ? `${i.value} is already used by ${c.join(', ')}.` : i.value ? `${i.value} is free.` : ''; }; if (i) { i.addEventListener('keydown', () => requestAnimationFrame(upd)); upd(); } },
          collect: (wrap, d) => { const i = wrap.querySelector('.pm51-commands-capture'); if (i) d.keys = i.value.trim(); },
          check: d => { if (!d.keys) return 'Press the keys you want to use.'; const c = clashesFor(d.target, 'app', d.keys); return c.length ? `${d.keys} is already used by ${c.join(', ')}. Press other keys.` : ''; } }
      ],
      onFinish: d => {
        if (d.target.startsWith('cmd:')) { const cmd = commandById(d.target.slice(4)); if (!cmd) return; shortcuts().push({ id: d.target, name: cmd.name, keys: d.keys, command: cmd.id }); }
        else { const a2 = APP_ACTIONS.find(x => x[0] === d.target); shortcuts().push({ id: a2[0], name: a2[1], keys: d.keys }); }
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Shortcut added', `${d.keys} now works everywhere.`);
      }
    });
  });
  PM51.on('commands-sc-pick', el => { const w = PM51.wizardOf(el); if (!w) return; w.draft.target = ds(el, 'target'); w.next(); });
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
  PM51.on('commands-pref', el => { const key = ds(el, 'pref'); if (key !== 'palette') return; prefs()[key] = !prefs()[key]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('commands-use-default', el => { const input = el.closest('form, .dialog, .overlay, body').querySelector('.pm51-commands-capture'); if (input) { input.value = el.dataset.keys || ''; clearError(input); } });
  PM51.onChange('commands-layout', el => { prefs().layout = el.value; saveState(); });
  PM51.on('commands-reset-shortcuts', () => PM51.confirm('Reset all shortcuts?', 'Every shortcut goes back to its default keys: the app\'s, your commands\', the message box\'s, the terminal\'s and the model variant key. To reset one, open it and choose Use the default.', 'Reset', () => {
    data().shortcuts = clone(DATA.commands.shortcuts).filter(s => !s.command || commandById(s.command));
    [SID.text, SID.term, SID.variant].forEach(id => { if (PM51.setting(id)) restoreSettingDefault(id); });
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Shortcuts reset', 'Default keys are back.');
  }));
  /* Save or load shortcuts: one dialog for the inventory action's three choices. */
  PM51.on('commands-backup', () => openDialog({
    title: 'Save or load shortcuts', subtitle: 'A small file you can keep as a backup or move to another computer.',
    body: formField('What to do', 'how', 'Export', { type: 'select', full: true, choices: [{ value: 'Export', label: 'Save my shortcuts to a file' }, { value: 'Import (Replace)', label: 'Load a file and replace mine' }, { value: 'Import (Merge)', label: 'Load a file and add to mine' }] })
      + formField('File', 'file', '', { placeholder: 'shortcuts.json', full: true, help: 'Only needed when loading. Keys already on your list are kept when you add to them.' }),
    saveLabel: 'Continue',
    onSave: form => { const how = String(form.how || 'Export'); PM51.toast(how === 'Export' ? 'Save is preview only' : 'Load is preview only', how === 'Export' ? 'Nothing was written. In the app the file holds every key you changed, never secrets.' : 'Nothing was loaded. In the app the file is read and shown to you before anything changes.', 'info'); }
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
  /* A new command starts from the inventory's defaults for new commands. */
  const newDefaults = () => {
    const pick = (id, none) => { const v = PM51.value(id); return v == null || v === none ? '' : String(v); };
    return { scope: PM51.value(SID.scope) === 'Project' ? 'Project' : 'Global', mode: pick(SID.mode, 'inherit'), model: pick(SID.model, 'Inherit'), persona: pick(SID.persona, 'Inherit'), permissionsProfile: pick(SID.perms, 'Inherit') };
  };
  /* ---------- New command: start from an example, write it, choose how it runs, try it ---------- */
  const EXAMPLES = [
    { id: 'review', title: 'Review my changes', icon: 'branch', name: 'review-changes', description: 'Review what changed on this branch and list anything risky', template: 'Review the changes on this branch compared with main.\n!`git diff --stat main...HEAD`\n\nList anything risky first, then anything that could be simpler.', argumentsHint: '' },
    { id: 'tests', title: 'Write tests for a file', icon: 'test', name: 'write-tests', description: 'Add tests for one file', template: 'Write tests for @$1.\nCover the normal case, the edge cases and one failure.\nSay what each test checks.', argumentsHint: '<file>' },
    { id: 'explain', title: 'Explain a file', icon: 'file', name: 'explain', description: 'Explain a file in plain words', template: 'Explain @$1 in plain words: what it does, how it fits in, and anything surprising.', argumentsHint: '<file>' },
    { id: 'standup', title: 'Standup summary', icon: 'clock', name: 'standup', description: 'What changed since yesterday', template: 'Summarize what changed since yesterday, for a standup.\n!`git log --since=yesterday --oneline`', argumentsHint: '' },
    { id: 'lint', title: 'Fix lint errors', icon: 'check', name: 'fix-lint', description: 'Run the linter and fix what it finds', template: 'Run the linter and fix what it reports.\n!`npm run lint --silent`\nKeep each fix small, and say what you could not fix.', argumentsHint: '' },
    { id: 'blank', title: 'Start from scratch', icon: 'edit', name: '', description: '', template: '', argumentsHint: '' }
  ];
  function nameProblem(raw) {
    const builtInWords = builtIn().map(c => String(c.command || '').replace(/^\//, '').split(/\s+/)[0]).filter(Boolean);
    if (!raw) return 'Give it a name after /x-.';
    if (RESERVED_NAMES.includes(raw) || builtInWords.includes(raw)) return `/${raw} is a built-in command. Pick another name.`;
    if (!NAME_RE.test(raw)) return 'Use lowercase letters, numbers, - or _. Start with a letter and end with a letter or number.';
    if (commandById('x-' + raw)) return `You already have /x-${raw}.`;
    return '';
  }
  const wizOverride = (key, value) => { const f = OVERRIDE_FIELDS.find(x => x.key === key); return PM51.field(f.label, PM51.dropdown(value || '', f.options(value || ''), { label: f.label, cls: 'o55-cmd-ov', data: { key } }), f.help); };
  PM51.on('commands-new', () => {
    const nd = newDefaults();
    PM51.wizard({
      title: 'New command', subtitle: 'A piece of text you send often, ready to run by typing its name.', eyebrow: 'Your command', icon: 'terminal', finishLabel: 'Create command',
      draft: { example: null, name: '', description: '', template: '', argumentsHint: '', scope: nd.scope, overrides: { persona: nd.persona, mode: nd.mode, model: nd.model, permissionsProfile: nd.permissionsProfile }, keys: '', sample: 'example' },
      steps: [
        { label: 'Start', title: 'Start from an example, or from scratch.', render: d => PM51.tiles(EXAMPLES.map(x => ({ title: x.title, text: x.description || 'An empty command you write yourself.', meta: x.name ? `/x-${x.name}` : '', icon: x.icon, selected: d.example === x.id, data: { example: x.id } })), { action: 'pm51-commands-example' }), check: d => d.example ? '' : 'Pick one to go on.' },
        { label: 'Write', title: 'What it sends. Placeholders fill in when you run it.', render: d => `<div class="o55-setup-fields">`
            + PM51.field('Name', `<span class="pm51-commands-name"><span class="pm51-commands-adorn" aria-hidden="true">/x-</span><input class="text-control o55-cmd-name" value="${a(d.name)}" placeholder="tidy-docs" autocomplete="off" spellcheck="false" data-autofocus aria-label="Command name after /x-"/></span>`, 'Your commands start with /x- so they never clash with built-in ones.')
            + PM51.field('Description', `<input class="text-control o55-cmd-desc" value="${a(d.description)}" placeholder="One line that says what it does" autocomplete="off"/>`, 'Shown next to the name in chat and in the command palette.')
            + PM51.field('What it sends', `<textarea class="form-textarea pm51-commands-template o55-cmd-text" rows="7" spellcheck="false" placeholder="${a(TEMPLATE_PLACEHOLDER)}">${h(d.template)}</textarea><span class="pm51-field-help pm51-commands-ph" data-placeholders>${placeholderLine(d.template)}</span>`, '$ARGUMENTS is everything typed after the name. $1 $2 are single words. @path pastes a file. !`command` pastes what a command prints.')
            + PM51.field('Arguments hint', `<input class="text-control o55-cmd-args" value="${a(d.argumentsHint)}" placeholder="For example: <branch name>" autocomplete="off"/>`, 'Shown while you type the command.')
            + `</div>`,
          onShow: wrap => { const ta = wrap.querySelector('.o55-cmd-text'), line = wrap.querySelector('[data-placeholders]'); if (ta && line) ta.addEventListener('input', () => { line.innerHTML = placeholderLine(ta.value); }); },
          collect: (wrap, d) => { const v = s => (wrap.querySelector(s) || {}).value || ''; d.name = v('.o55-cmd-name').trim().replace(/^\//, '').replace(/^x-/, ''); d.description = v('.o55-cmd-desc').trim(); d.template = v('.o55-cmd-text').replace(/\r\n/g, '\n'); d.argumentsHint = v('.o55-cmd-args').trim(); },
          check: d => nameProblem(d.name) || (!d.description ? 'Say what it does in one line.' : '') },
        { label: 'How it runs', title: 'Where it is available, what it may ask for, and a shortcut if you want one.', render: d => `<div class="o55-setup-fields">`
            + PM51.field('Available in', PM51.dropdown(d.scope, [{ value: 'Project', label: 'This project', meta: '.puppet-master/commands/' }, { value: 'Global', label: 'Every project', meta: 'Your user folder' }], { cls: 'o55-cmd-scope', label: 'Available in' }), 'A project command wins when both have the same name.')
            + wizOverride('persona', d.overrides.persona) + wizOverride('mode', d.overrides.mode) + wizOverride('model', d.overrides.model) + wizOverride('permissionsProfile', d.overrides.permissionsProfile)
            + captureField(d.keys, 'Optional. Hold Ctrl, Alt, or Shift with a key. Backspace clears it.')
            + `</div>`,
          onShow: wrap => bindCapture(wrap),
          collect: (wrap, d) => { const sc = wrap.querySelector('.o55-cmd-scope'); if (sc) d.scope = sc.value === 'Global' ? 'Global' : 'Project'; wrap.querySelectorAll('.o55-cmd-ov').forEach(s => { d.overrides[s.dataset.key] = s.value || ''; }); const k = wrap.querySelector('.pm51-commands-capture'); if (k) d.keys = k.value.trim(); },
          check: d => { const c = d.keys ? clashesFor('cmd:x-' + d.name, 'app', d.keys) : []; return c.length ? `${d.keys} is already used by ${c.join(', ')}. Pick other keys or clear the box.` : ''; } },
        { label: 'Try it', title: 'What the chat would receive. Nothing runs.', render: d => PM51.field('What you type after the name', `<input class="text-control o55-cmd-sample" value="${a(d.sample)}" autocomplete="off"/>`) + `<pre class="pm51-code" data-resolved>${resolveTemplate(d.template || d.description, d.sample)}</pre><div class="pm51-commands-legend"><span><i></i>Filled from your input</span><span><i class="is-perm"></i>Needs permission when it runs</span></div>`
            + PM51.kv([['Name', '/x-' + d.name], ['Available in', scopeLabel(d.scope)], ['Shortcut', d.keys || 'None']]),
          onShow: (wrap, d) => { const i = wrap.querySelector('.o55-cmd-sample'), pre = wrap.querySelector('[data-resolved]'); if (i && pre) i.addEventListener('input', () => { d.sample = i.value; pre.innerHTML = resolveTemplate(d.template || d.description, i.value); }); } }
      ],
      onFinish: d => {
        const c = { id: 'x-' + d.name, name: '/x-' + d.name, description: d.description, template: d.template.trim() ? d.template : d.description, argumentsHint: d.argumentsHint, scope: d.scope, overrides: { persona: d.overrides.persona || null, mode: d.overrides.mode || null, model: d.overrides.model || null, permissionsProfile: d.overrides.permissionsProfile || null }, enabled: true, source: 'user' };
        custom().push(c); if (d.keys) shortcuts().push({ id: 'cmd:' + c.id, name: c.name, keys: d.keys, command: c.id });
        PM51.setTab(ID, 'commands'); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast('Command created', `Type ${c.name} in chat to run it${d.keys ? `, or press ${d.keys}` : ''}. It lives in ${pathFor(c)}.`);
      }
    });
  });
  PM51.on('commands-example', el => { const w = PM51.wizardOf(el); const x = EXAMPLES.find(e => e.id === ds(el, 'example')); if (!w || !x) return; Object.assign(w.draft, { example: x.id, name: x.name, description: x.description, template: x.template, argumentsHint: x.argumentsHint }); w.next(); });

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
    PM51.s().commands = clone(DATA.commands); migrateCommands(PM51.s().commands); PM51.s().commandsPrefs = clone(PREF_DEFAULTS);
    [SID.text, SID.term, SID.variant, SID.hints, SID.search].forEach(id => { if (PM51.setting(id)) restoreSettingDefault(id); }); saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Commands and shortcuts reset', 'Defaults are back.');
  }));
  PM51.on('commands-help', () => PM51.panel({
    title: 'How commands work', icon: 'terminal',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">A command is a piece of text you send often. Type its name in chat, and Puppet Master sends that text for you. Built-in commands come with Puppet Master. Your own commands start with /x- so they never clash.</p>')
      + PM51.panelSection('Placeholders', PM51.kv([['$ARGUMENTS', 'Everything you type after the name.'], ['$1, $2 …', 'The first word, the second word, and so on.'], ['@path', 'Pastes that file into the text. Needs read permission.'], ['!`command`', 'Pastes what that command prints. Needs command permission.']]))
      + PM51.panelSection('Overrides', '<p class="pm51-ps-text">A command can ask for a persona, a mode, a model, or a permissions profile. These are requests: the chat\'s own mode and your permissions still cap them, and you always see what was requested and what actually applies.</p>')
      + PM51.panelSection('Good to know', PM51.kv([['Dry run', 'Shows the exact text a command would send, with sample input, without running it.'], ['Shortcuts', 'Any of your commands can have keys. Add them in the Shortcuts tab or from the command itself.'], ['Files', 'Each command is a Markdown file in .puppet-master/commands/ (this project) or your user folder (every project).']]))
  }));
})();
