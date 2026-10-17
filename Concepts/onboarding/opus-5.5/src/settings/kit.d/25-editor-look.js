/* O55 · the Editor look rows and the code editor (Plans/Settings_System.md SSYS-050, Plans/FinalGUISpec.md F3-639; the
   editor Customize proposal of 2026-10-14, which adds the rows in src/settings/proposed.d). The editor's appearance
   model reads the Project's code.editing.* rows as its Settings layer, and its Customize screen's "All editors" writes
   them, through the same transaction every row uses (commitSettingValues, saveState, refreshSettingRow, o55Notify),
   exactly as Terminal look does (24-terminal-look.js). This file only carries values; what each row's words mean to the
   editor is the editor's (home-redesign src/panels/kinds/09-editor-look.js, LINK).
     window.PM_EDITOR_SETTINGS = {
       ready()      -> true while a Project's Settings can be written (not no-project mode, not read-only)
       values()     -> { 'code.editing.<row>': value } for the rows a person changed
       set(writes)  -> { id: value | null }: one transaction; null puts the row back to its default. false when refused
       version()    -> a number that moves whenever Settings saved
       onChange(fn) -> fn() after a save that changed a code.editing.* row; returns an unsubscribe
     }
   Also:
     - Editor Colors offers Follow look and the shared catalog (F3-642, D30): the terminal's schemes, with the imported
       ones, which join when the row is drawn (the catalog lives in the terminal, which loads after Settings).
     - the Editor look group's owner line opens the editor's Customize screen for All editors (Open Customize). */
(function o55EditorLookModule() {
  const PREFIX = 'code.editing.';
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
    return out;
  }
  function notify() {
    let now = ''; try { now = JSON.stringify(values()); } catch (e) { now = String(Math.random()); }
    if (now === seen) return;
    seen = now;
    listeners.forEach(fn => { try { fn(); } catch (e) { /* a listener never blocks a save */ } });
  }
  /* every Settings change ends in saveState: the editor hears about the ones that touched its rows */
  const o55ElSave = saveState;
  saveState = function () { const r = o55ElSave.apply(this, arguments); ver++; notify(); return r; };

  // Customize owns the immediate selection and live editor paint. Its saved
  // Settings rows can follow one at a time after paint, instead of rebuilding a
  // whole quick set underneath the sheet before the preview's first frame.
  const pendingRows = new Set();
  let rowJob = 0, rowsNotBefore = 0;
  function projectSavedRow(id) {
    // set() has already persisted the transaction. Updating its displayed row
    // must not save the complete Settings model again for every changed field.
    const api = window.PM51;
    if (api && typeof api.refreshSavedRow === 'function') return api.refreshSavedRow(id);
    return refreshSettingRow(id);
  }
  function scheduleRows() {
    if (rowJob || !pendingRows.size) return;
    rowJob = window.requestIdleCallback
      ? window.requestIdleCallback(refreshRows, { timeout: 500 })
      : window.requestAnimationFrame(() => { rowJob = setTimeout(refreshRows, 0); });
  }
  function refreshRows() {
    rowJob = 0;
    // Main-thread idle can precede the GPU presenting a large editor repaint.
    // Give that first paint its own budget before rebuilding the covered rows.
    const wait = rowsNotBefore - performance.now();
    if (wait > 0) { rowJob = setTimeout(refreshRows, wait); return; }
    const id = pendingRows.values().next().value;
    if (!id) return;
    pendingRows.delete(id);
    try { if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) projectSavedRow(id); } catch (e) { /* the row is not drawn now */ }
    scheduleRows();
  }
  function refreshRow(id) {
    if (!document.querySelector('.pmed-cz:not([aria-hidden="true"])')) {
      pendingRows.delete(id);
      try { if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) projectSavedRow(id); } catch (e) { /* the row is not drawn now */ }
      return;
    }
    rowsNotBefore = performance.now() + 250;
    pendingRows.add(id);
    scheduleRows();
  }

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
      refreshRow(id);
      if (typeof o55Notify === 'function') o55Notify(id, put[id]);
    });
    return true;
  }

  /* ---------- Editor Colors: Follow look and the shared catalog ---------- */
  const catalog = () => { try { const A = window.PMT && window.PMT.Appearance; return A && typeof A.schemes === 'function' ? A.schemes() : []; } catch (e) { return []; } };
  const colors = (O55R['code.editing.color-scheme'] = Object.assign({}, O55R['code.editing.color-scheme'] || {}));
  colors.choices = ['Follow look'];
  colors.options = Object.assign({}, colors.options || {});
  PM51.moreChoices('code.editing.color-scheme', () => catalog().map(s => {
    colors.options[s.id] = s.name;
    /* the public catalog (PMT.Appearance.schemes) names it mode; a raw scheme names it appearance */
    return { value: s.id, label: s.name, meta: (s.mode || s.appearance) === 'light' ? 'Light' : 'Dark' };
  }));

  /* ---------- the Customize screen from Settings: the Editor look group's owner line ----------
     Settings' rows set one field at a time; the editor's Customize screen shows them all on a live preview. Its button
     opens over Settings on the last editor, in "All editors", the scope these rows hold. Keeping Settings underneath
     avoids an unrelated page handoff and returns the reader to the same row when the screen closes. */
  const look = PLACEMENT && PLACEMENT.sections && PLACEMENT.sections['editor-look'];
  if (look && !look.owner) look.owner = { text: 'See every look option on a live editor, with a preview, in the editor’s Customize screen.', buttons: [{ label: 'Open Customize', action: 'pm51-o55-editor-customize' }] };
  PM51.on('o55-editor-customize', () => {
    const C = window.PM_EDITOR_CUSTOMIZE;
    if (!C || typeof C.open !== 'function') { showToast('Not available', 'The editor is not loaded on this page.', 'warning', 3600); return; }
    try { C.open({ scope: 'app', from: 'settings', anchor: document.activeElement }); }
    catch (e) {
      showToast('Could not open Customize', 'The editor did not answer.', 'warning', 3600);
      /* the toast alone left a click that did nothing with no trace: say it in the console, and as a page error
         (reportError fires window 'error'), so page-error checks and films catch it */
      try { console.error('[pm-settings] Could not open Customize: ' + (e && e.message || e), e); } catch (_) {}
      try { if (typeof reportError === 'function') reportError(e); } catch (_) {}
    }
  });

  seen = (() => { try { return JSON.stringify(values()); } catch (e) { return ''; } })();
  window.PM_EDITOR_SETTINGS = Object.freeze({
    ready, values, set, version: () => ver,
    onChange: fn => { if (typeof fn !== 'function') return () => {}; listeners.add(fn); return () => { listeners.delete(fn); }; }
  });
})();
