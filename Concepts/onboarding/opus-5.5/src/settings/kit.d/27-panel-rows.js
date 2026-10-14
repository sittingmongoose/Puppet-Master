/* O55 · the panels' own Settings rows (Plans/Settings_System.md SSYS-050: Preview Tabs, Tab Sizing, Max Open Editor Tabs,
   Tabs Remembered Between Sessions, Starting Layout). The Home panels read these as values of their own (home-redesign
   src/panels/js/04-settings.js, SETTINGS_ROWS): a row a person changed here answers before the panels' earlier store,
   and a save that changes one tells the panels at once. This file only carries values, as 24-terminal-look.js and
   25-editor-look.js do.
     window.PM_PANEL_SETTINGS = { ready(), values() -> { id: value } of the rows a person changed, version(), onChange(fn) } */
(function o55PanelRowsModule() {
  const IDS = ['general.interaction.preview-tabs', 'general.interaction.tab-sizing', 'general.interaction.max-editor-tabs',
    'general.startup.max-persisted-tabs', 'general.startup.starting-layout'];
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
    IDS.forEach(id => { if (changed[id] && state.settings[id] !== undefined) out[id] = JSON.parse(JSON.stringify(state.settings[id])); });
    return out;
  }
  function notify() {
    let now = ''; try { now = JSON.stringify(values()); } catch (e) { now = String(Math.random()); }
    if (now === seen) return;
    seen = now;
    listeners.forEach(fn => { try { fn(); } catch (e) { /* a listener never blocks a save */ } });
  }
  const o55PrSave = saveState;
  saveState = function () { const r = o55PrSave.apply(this, arguments); ver++; notify(); return r; };
  seen = (() => { try { return JSON.stringify(values()); } catch (e) { return ''; } })();
  window.PM_PANEL_SETTINGS = Object.freeze({
    ready, values, version: () => ver,
    onChange: fn => { if (typeof fn !== 'function') return () => {}; listeners.add(fn); return () => { listeners.delete(fn); }; }
  });
})();
