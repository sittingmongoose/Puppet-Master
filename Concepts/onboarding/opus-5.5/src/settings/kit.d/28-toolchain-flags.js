/* O55 · a formatter's Format on Save, Format on Paste and Only Changed Lines last past a reload. The Toolchain manager
   (managers/20-toolchain.js) keeps them in state.toolchain.formatters, but the concept's saved projection (the tome's
   save) carries only Settings rows and page places, so all three went back to their example values on every reload, in
   every look (the editor settings audit of 2026-10-14). In concept fixture mode, the mode where the projection itself
   lives in this browser, the flags are kept beside it, per Project, and put back after every load. With a Settings
   owner attached they are the owner's to keep and this does nothing. */
(function o55ToolchainFlagsModule() {
  const FLAGS = ['onSave', 'onPaste', 'changedLines'];
  const PREFIX = 'pm7.settings.toolchain-flags.v1:';
  const keyOf = () => {
    try {
      if (window.PM_SETTINGS_REGISTRY || state.settingsProjectionReadOnly === true) return null;
      const p = window.PM7_SETTINGS_TOME && window.PM7_SETTINGS_TOME.project();
      return p && p.id ? PREFIX + encodeURIComponent(p.id) : null;
    } catch (e) { return null; }
  };
  const formatters = () => (state && state.toolchain && Array.isArray(state.toolchain.formatters) ? state.toolchain.formatters : []);
  let last = '';
  function keep() {
    const k = keyOf(); if (!k) return;
    const out = {};
    formatters().forEach(f => { if (f && f.id) { const o = {}; FLAGS.forEach(n => { o[n] = !!f[n]; }); out[f.id] = o; } });
    const raw = JSON.stringify(out);
    if (raw === last) return;
    last = raw;
    try { (window.PM7_SETTINGS_STORE || localStorage).setItem(k, raw); } catch (e) { /* storage full or blocked: the flags last this session */ }
  }
  function restore() {
    const k = keyOf(); if (!k) return false;
    let kept = null;
    try { kept = JSON.parse((window.PM7_SETTINGS_STORE || localStorage).getItem(k) || 'null'); } catch (e) { kept = null; }
    if (!kept || typeof kept !== 'object') { last = ''; return false; }
    let changed = false;
    formatters().forEach(f => {
      const o = f && kept[f.id]; if (!o) return;
      FLAGS.forEach(n => { if (typeof o[n] === 'boolean' && !!f[n] !== o[n]) { f[n] = o[n]; changed = true; } });
    });
    last = JSON.stringify(kept);
    return changed;
  }
  const o55TfSave = saveState;
  saveState = function () { const r = o55TfSave.apply(this, arguments); keep(); return r; };
  const o55TfEnsure = ensureStateShape;
  ensureStateShape = function () { const r = o55TfEnsure.apply(this, arguments); restore(); return r; };
  /* the first load ran before this file; put the flags back once the managers have read their example values */
  queueMicrotask(() => {
    if (!restore()) return;
    try { if (root.querySelector('[data-continuous-workspace-body="toolchain"]')) PM51.refresh('toolchain', { swap: false }); } catch (e) { /* not drawn yet */ }
  });
})();
