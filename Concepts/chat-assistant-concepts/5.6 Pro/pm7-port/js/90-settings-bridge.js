/* Hosted-only preference projection. Settings owns the stored rows; this bridge
   uses the public app handle and feature APIs, and never saves pm56-prefs. */
(function chat56SettingsBridge() {
  'use strict';
  if (!window.PM56_HOST) return;
  const A = window.PM56_APP, E = window.PM56_EXT, B = window.PM_CHAT_SETTINGS;
  if (!A || !E || !B) { console.error('[chat56 Settings] Required public bridge is unavailable.'); return; }
  const I = Object.freeze({
    work: 'general.interaction.working-activity-style', sound: 'general.interaction.sound-effects',
    eli5: 'general.interaction.eli5-default', thought: 'general.interaction.thought-stream',
    history: 'general.interaction.chat-history-list', mode: 'general.interaction.assistant-mode',
    title: 'ai.models.thread-title-model'
  });
  const E5 = window.PM56_ELI5, F = window.PM56_FEATURES, S = window.PM56_SOUND;
  const setProject = E5?.setProject?.bind(E5);
  const titleToChat = value => value === 'Default' ? 'default' : value === 'None' ? 'none' : 'model:' + value;
  const titleToSettings = value => value === 'default' ? 'Default' : value === 'none' ? 'None' : value?.startsWith('model:') ? value.slice(6) : null;
  let projecting = false, paintPending = false, applied = {}, appState = null, last = null;
  const ctx = () => A.ctx();
  const features = () => F?.state?.();
  function projectId(c) { return E5?.project?.(c.thread) || c.thread?.projectId || c.thread?.project_id || 'concept:default-project'; }
  function snapshot() {
    const c = ctx(), f = features();
    return {
      thought: c.state.capabilities.thought === 'Expanded' ? 'Expanded' : 'Auto',
      title: f?.title?.policy,
      project: E5?.resolve?.(c.thread?.id)?.projectDefault ?? null,
      thread: c.thread?.id,
      sound: S ? !S.muted : null
    };
  }
  function repaint() {
    if (paintPending) return;
    paintPending = true;
    queueMicrotask(() => { paintPending = false; A.render(); });
  }
  function applySettings(force) {
    if (projecting) return;
    const c = ctx(), f = features(), values = B.values(), changed = B.changed();
    if (!c?.state) return;
    force = force || appState !== c.state;
    appState = c.state;
    const diff = key => force || values[key] !== applied[key];
    projecting = true;
    let dirty = false;
    try {
      if (diff(I.work)) {
        const take = values[I.work] === 'Step Rail Simple' ? 8 : 1;
        if (c.state.variants[2] !== take) { c.state.variants[2] = take; dirty = true; }
      }
      if (S && diff(I.sound) && typeof values[I.sound] === 'boolean' && S.muted === values[I.sound]) {
        S.setMuted(!values[I.sound]); dirty = true;
      }
      if (diff(I.thought)) {
        const value = values[I.thought] === 'Expanded' ? 'Expanded' : 'Auto';
        if (c.state.capabilities.thought !== value) { c.state.capabilities.thought = value; dirty = true; }
      }
      if (f?.title && diff(I.title)) {
        const value = titleToChat(values[I.title] || 'Default');
        if (f.title.policy !== value) { f.title.policy = value; dirty = true; }
      }
      // The existing Settings adapter is project-only. Preserve the separate
      // session-only All chats layer; an unchanged project row means inherit.
      const pid = projectId(c), want = changed[I.eli5] ? !!values[I.eli5] : null;
      const resolved = E5?.resolve?.(c.thread?.id);
      if (setProject && resolved?.ok && resolved.projectDefault !== want) {
        setProject(pid, want); dirty = true;
      }
      applied = { ...values };
      last = snapshot();
    } finally { projecting = false; }
    if (dirty) repaint();
  }
  function saveOne(id, value) { return B.set({ [id]: value }); }
  function observeChat() {
    if (projecting) return;
    if (appState !== ctx().state) { applySettings(true); return; }
    const c = ctx(), now = snapshot(), before = last;
    if (!before) { last = now; return; }
    const sheet = c.state.dialog?.type;
    // These are the actual preference sheets. Recipe/family demo changes never
    // write a product preference, including a working take chosen for a demo.
    if (sheet === 'af-settings') {
      if (now.thought !== before.thought && !saveOne(I.thought, now.thought)) {
        c.state.capabilities.thought = before.thought; repaint();
      }
      if (now.title !== before.title) {
        const value = titleToSettings(now.title);
        if (value === null || !saveOne(I.title, value)) { features().title.policy = before.title; repaint(); }
      }
    }
    if (sheet === 'eli5-style' && now.thread === before.thread && now.project !== before.project) {
      if (!saveOne(I.eli5, now.project)) { setProject?.(projectId(c), before.project); repaint(); }
    }
    last = snapshot();
  }
  E.chainAction('chat-sound-toggle', c => {
    // A refused Settings transaction leaves both the speaker and audio alone.
    if (S && saveOne(I.sound, S.muted)) c.renderApp();
    return true;
  });
  E.chainAction('set-thought-cap', (c, button) => {
    if (saveOne(I.thought, button.dataset.value)) { c.closeMenu(); c.renderApp(); }
    return true;
  });
  let newThreadPending = false;
  E.chainAction('new-thread', () => { newThreadPending = true; return false; });
  E.slot('afterRender', (c, info) => {
    if (info?.phase !== 'app') return '';
    if (newThreadPending) {
      newThreadPending = false;
      if (!c.thread?.messages?.length) {
        const mode = B.values()[I.mode];
        if (['Ask', 'Agent', 'Debug', 'Plan', 'Deep Plan'].includes(mode) && c.state.mode !== mode) {
          c.state.mode = mode; repaint();
        }
      }
    }
    observeChat();
    return '';
  });
  B.onChange(() => applySettings(false));
  // Export through the shared public port object without replacing demo/surfaces.
  const P = window.PM56_PORT = window.PM56_PORT || {};
  P.settings = Object.freeze({
    ids: I, sync: () => applySettings(true),
    set(id, value) { if (!Object.values(I).includes(id)) return false; return saveOne(id, value); },
    snapshot: () => ({ values: B.values(), changed: B.changed(), chat: snapshot(), scope: 'project_concept', allChatsPersistence: 'session_only' })
  });
  applySettings(true);
})();
