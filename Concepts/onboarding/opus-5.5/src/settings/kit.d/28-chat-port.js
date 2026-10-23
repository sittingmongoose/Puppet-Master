/* The hosted chat reads and writes admitted Settings through this adapter, using
   the same transaction and refusal path as a Settings row. It never saves a
   parallel chat preference store. The existing Settings concept is project-only:
   ELI5 All chats remains a disclosed session default, separate from this project's
   persisted override. Native global/project scope admission is still owed. */
(function o55ChatPortSettings() {
  const IDS = Object.freeze([
    'general.interaction.working-activity-style', 'general.interaction.sound-effects',
    'general.interaction.eli5-default', 'general.interaction.thought-stream',
    'general.interaction.thought-stream-lines',
    'general.interaction.chat-history-list', 'general.interaction.assistant-mode',
    'ai.models.thread-title-model'
  ]);
  const listeners = new Set();
  const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const project = () => window.PM7_SETTINGS_TOME?.project()?.id || null;
  const ready = () => !!(project() && state?.settings && state.settingsProjectionReadOnly !== true);
  let version = 0, seen = '';
  function values() {
    const out = {};
    IDS.forEach(id => { const f = findSettingGlobal(id); if (f) out[id] = copy(settingValue(f.setting)); });
    return out;
  }
  function changed() {
    const out = {};
    IDS.forEach(id => { out[id] = !!state?.changed?.[id]; });
    return out;
  }
  // Read one project's own override, never substitute the current project's
  // value for a chat belonging to another project.
  function eli5Project(id) {
    const key = 'general.interaction.eli5-default';
    if (!id) return { ok: false, reason: 'project_unknown' };
    if (id === project()) return state.settingsProjectionReadOnly === true
      ? { ok: false, reason: 'project_projection_unavailable' }
      : { ok: true, id, override: changed()[key] ? !!values()[key] : null };
    let snap;
    try { snap = window.PM7_SETTINGS_TOME?.projectSnapshot(id); } catch (e) { return { ok: false, reason: 'project_projection_unavailable' }; }
    if (!snap?.settings) return { ok: false, reason: 'project_projection_unavailable' };
    return { ok: true, id, override: snap.changed?.[key] ? !!snap.settings[key] : null };
  }
  function notify() {
    const now = JSON.stringify([project(), ready(), values(), changed()]);
    if (now === seen) return;
    seen = now; version++;
    listeners.forEach(fn => { try { fn(); } catch (e) { /* A renderer never blocks a Settings save. */ } });
  }
  function valid(id, value) {
    if (value === null) return true;
    if (id === 'general.interaction.sound-effects' || id === 'general.interaction.eli5-default') return typeof value === 'boolean';
    const choices = {
      'general.interaction.working-activity-style': ['Orbit', 'Step Rail Simple'],
      'general.interaction.thought-stream': ['Auto', 'Expanded'],
      'general.interaction.thought-stream-lines': ['4', '6', '8', '12', '16'],
      'general.interaction.chat-history-list': ['Flyout', 'Pinned'],
      'general.interaction.assistant-mode': ['Ask', 'Agent', 'Debug', 'Plan', 'Deep Plan']
    };
    if (choices[id]) return choices[id].includes(value);
    if (id === 'ai.models.thread-title-model') {
      if (value === 'Default' || value === 'None') return true;
      return models().some(m => m.id === value);
    }
    return false;
  }
  function set(writes) {
    if (!ready() || !writes || typeof writes !== 'object' || Array.isArray(writes)) return false;
    const entries = Object.entries(writes);
    if (entries.some(([id, value]) => !IDS.includes(id) || !findSettingGlobal(id) || !valid(id, value))) return false;
    const put = {}, back = [];
    entries.forEach(([id, value]) => {
      if (value === null) { if (state.changed?.[id]) back.push(id); }
      else if (JSON.stringify(values()[id]) !== JSON.stringify(value) || !state.changed?.[id]) put[id] = copy(value);
    });
    // Keep reset and ordinary writes separate, as the existing atomic writer does.
    if (back.length && Object.keys(put).length) return false;
    if (back.length > 1) return false;
    if (Object.keys(put).length && !commitSettingValues(put)) return false;
    if (back.length && !restoreSettingDefault(back[0])) return false;
    if (!Object.keys(put).length && !back.length) return true;
    saveState();
    Object.keys(put).concat(back).forEach(id => {
      if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) refreshSettingRow(id);
      if (typeof o55Notify === 'function') o55Notify(id, values()[id]);
    });
    return true;
  }
  function models() { try { return window.PM56_APP?.ctx()?.D?.models || []; } catch (e) { return []; } }
  PM51.moreChoices('ai.models.thread-title-model', () => models().map(m => ({
    value: m.id, label: m.name, meta: m.status === 'ready' ? (m.provider || '') : 'Not available now'
  })));
  const saved = saveState;
  saveState = function () { const result = saved.apply(this, arguments); notify(); return result; };
  window.PM_CHAT_SETTINGS = Object.freeze({
    ready, project, values, changed, eli5Project, set, version: () => version,
    onChange(fn) { if (typeof fn !== 'function') return () => {}; listeners.add(fn); return () => listeners.delete(fn); }
  });
  seen = JSON.stringify([project(), ready(), values(), changed()]);
})();
