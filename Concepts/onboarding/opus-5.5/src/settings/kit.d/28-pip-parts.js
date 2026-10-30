/* The Pip parts row's storage adapter (SSYS-056, S2; PM7 build, lane found, 2026-10-29). The parts registry
   (window.PM_PIP_PARTS, Concepts/glyph-system/opus-5.5/src/logo/pm-pip-parts.js) is a head module and cannot reach the
   Settings engine, so it reads and writes general.visual.pip-parts through this adapter, on the same transaction and
   refusal path as a Settings row (the 28-chat-port.js pattern). The value is the current Project's: a multiselect of
   the part ids (the inventory's options), stored per Project. Until the Settings data has that row, ready()
   is false and the registry keeps the choice in memory for the session. */
(function o55PipPartsStore() {
  const ID = 'general.visual.pip-parts';
  const listeners = new Set();
  const project = () => window.PM7_SETTINGS_TOME?.project()?.id || null;
  const ready = () => !!(project() && state?.settings && state.settingsProjectionReadOnly !== true && findSettingGlobal(ID));
  function read() {
    const f = findSettingGlobal(ID);
    const v = f ? settingValue(f.setting) : undefined;
    return Array.isArray(v) ? v.map(String) : undefined;
  }
  function write(ids) {
    if (!ready() || !Array.isArray(ids)) return false;
    if (JSON.stringify(read()) === JSON.stringify(ids) && state.changed?.[ID]) return true;
    if (!commitSettingValues({ [ID]: ids.map(String) })) return false;
    saveState();
    if (root.querySelector(`[id="setting-${cssEscape(ID)}"]`)) refreshSettingRow(ID);
    if (typeof o55Notify === 'function') o55Notify(ID, read());
    return true;
  }
  /* one notice per change of Project or value: after a save, and after a render (a Project switch reloads and renders) */
  let seen = '';
  function notify() {
    const now = JSON.stringify([project(), ready(), read()]);
    if (now === seen) return;
    seen = now;
    listeners.forEach(fn => { try { fn(); } catch (e) { /* a reader never blocks a Settings save */ } });
  }
  const saved = saveState;
  saveState = function () { const r = saved.apply(this, arguments); notify(); return r; };
  const rendered = renderApp;
  renderApp = function () { const r = rendered.apply(this, arguments); notify(); return r; };
  window.PM_PIP_PARTS_STORE = Object.freeze({
    ID, ready, project, read, write,
    onChange(fn) { if (typeof fn !== 'function') return () => {}; listeners.add(fn); return () => listeners.delete(fn); }
  });
  seen = JSON.stringify([project(), ready(), read()]);
})();
