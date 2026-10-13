/* O55 · the Terminal look rows and the terminal (Plans/Settings_System.md SSYS-051, Plans/FinalGUISpec.md F3-642).
   The terminal's appearance model reads the Project's code.terminal.* rows as its Settings layer, and its Customize
   screen's "All terminals" writes them, through the same transaction every row uses (commitSettingValues, saveState,
   refreshSettingRow, o55Notify, as PM_NIER does). This file only carries values; what each row's words mean to the
   terminal is the terminal's (home-redesign src/terminal/js/42-appearance.js, LINK).
     window.PM_TERMINAL_SETTINGS = {
       ready()      -> true while a Project's Settings can be written (not no-project mode, not read-only)
       values()     -> { 'code.terminal.<row>': value } for the rows a person changed, and '<id>#custom' for the text
                       typed under an earlier Custom choice (Terminal Colors, Terminal Font)
       set(writes)  -> { id: value | null }: one transaction; null puts the row back to its default. false when refused
       version()    -> a number that moves whenever Settings saved
       onChange(fn) -> fn() after a save that changed a code.terminal.* row; returns an unsubscribe
     }
   Also:
     - Terminal Colors and Terminal Font offer their canon choices (SSYS-051: Follow look or a catalog scheme; F3-644:
       Follow look, the seven built-in faces and System monospace). A value stored from the earlier lists still shows as
       the current choice, and still means what it said (42-appearance.js reads it).
     - Import a Color Scheme imports into the terminal's catalog and makes it Terminal Colors (UCC-201's
       cmd.terminal.appearance.import_scheme), instead of the generic example panel. */
(function o55TerminalLookModule() {
  const PREFIX = 'code.terminal.';
  const CUSTOM_ROWS = ['code.terminal.theme', 'code.terminal.font-family'];
  const listeners = new Set();
  let ver = 0, seen = '';
  const ready = () => {
    try { return !!(state && state.settings && window.PM7_SETTINGS_TOME && window.PM7_SETTINGS_TOME.project() && state.settingsProjectionReadOnly !== true); }
    catch (e) { return false; }
  };
  function values() {
    const out = {};
    if (!state || !state.settings) return out;
    const changed = state.changed || {};
    Object.keys(state.settings).forEach(id => { if (id.indexOf(PREFIX) === 0 && changed[id]) out[id] = JSON.parse(JSON.stringify(state.settings[id])); });
    const typed = (state.pm51 && state.pm51.o55Custom) || {};
    CUSTOM_ROWS.forEach(id => { if (typed[id]) out[id + '#custom'] = String(typed[id]); });
    return out;
  }
  function notify() {
    let now = ''; try { now = JSON.stringify(values()); } catch (e) { now = String(Math.random()); }
    if (now === seen) return;
    seen = now;
    listeners.forEach(fn => { try { fn(); } catch (e) { /* a listener never blocks a save */ } });
  }
  /* every Settings change ends in saveState: the terminal hears about the ones that touched its rows */
  const o55TlSave = saveState;
  saveState = function () { const r = o55TlSave.apply(this, arguments); ver++; notify(); return r; };

  function set(writes) {
    if (!ready() || !writes || typeof writes !== 'object') return false;
    const put = {}, back = [];
    Object.keys(writes).forEach(id => {
      if (id.indexOf(PREFIX) !== 0 || !findSettingGlobal(id)) return;
      const v = writes[id];
      if (v === null || v === undefined) { if ((state.changed || {})[id]) back.push(id); }
      else put[id] = v;
    });
    if (Object.keys(put).length && !commitSettingValues(put)) return false;
    for (const id of back) if (!restoreSettingDefault(id)) return false;
    if (!Object.keys(put).length && !back.length) return true;
    saveState();
    Object.keys(put).concat(back).forEach(id => {
      try { if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) refreshSettingRow(id); } catch (e) { /* the row is not drawn now */ }
      if (typeof o55Notify === 'function') o55Notify(id, put[id]);
    });
    return true;
  }

  /* ---------- the canon choices of Terminal Colors and Terminal Font ---------- */
  const FACES = [['Follow look', 'Follow look'], ['jetbrains-mono', 'JetBrains Mono'], ['atkinson', 'Atkinson Hyperlegible Mono'], ['vt323', 'VT323'],
    ['departure', 'Departure Mono'], ['sixtyfour', 'Sixtyfour'], ['sixtyfour-raster', 'Sixtyfour Raster'], ['system', 'System monospace']];
  const catalog = () => { try { const A = window.PMT && window.PMT.Appearance; return A && typeof A.schemes === 'function' ? A.schemes() : []; } catch (e) { return []; } };
  const rowOf = id => (O55R[id] = Object.assign({}, O55R[id] || {}));
  const colors = rowOf('code.terminal.theme');
  colors.choices = ['Follow look'];
  colors.options = Object.assign({}, colors.options || {});
  /* the catalog lives in the terminal, which loads after Settings: its schemes join when the row is drawn */
  PM51.moreChoices('code.terminal.theme', () => catalog().map(s => {
    colors.options[s.id] = s.name;
    return { value: s.id, label: s.name, meta: s.mode === 'light' ? 'Light' : 'Dark' };
  }));
  const font = rowOf('code.terminal.font-family');
  font.choices = FACES.map(f => f[0]);
  font.options = Object.assign({}, font.options || {}, Object.fromEntries(FACES));

  /* ---------- Import a Color Scheme ---------- */
  const imp = rowOf('code.terminal.import-scheme');
  imp.pm51 = 'o55-terminal-import';
  imp.actionLabel = imp.actionLabel || 'Import…';
  PM51.on('o55-terminal-import', () => {
    const A = window.PMT && window.PMT.Appearance;
    if (!A || typeof A.importFile !== 'function') { showToast('Import is not available', 'The terminal is not loaded on this page.', 'warning', 3600); return; }
    A.importFile({ onDone: r => {
      if (!r || !r.ok) { showToast('Could not import that scheme', (r && r.error) || 'The file is not a colour scheme.', 'error', 5200); return; }
      if (set({ 'code.terminal.theme': r.id })) showToast('Saved', `Terminal colors: ${r.name}.`, 'success', 2600);
      else showToast('Imported', `${r.name} is in the terminal's schemes. Settings could not be changed here.`, 'warning', 4200);
    } });
  });

  seen = (() => { try { return JSON.stringify(values()); } catch (e) { return ''; } })();
  window.PM_TERMINAL_SETTINGS = Object.freeze({
    ready, values, set, version: () => ver,
    onChange: fn => { if (typeof fn !== 'function') return () => {}; listeners.add(fn); return () => { listeners.delete(fn); }; }
  });
})();
