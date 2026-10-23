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
    lines: 'general.interaction.thought-stream-lines',
    history: 'general.interaction.chat-history-list', mode: 'general.interaction.assistant-mode',
    title: 'ai.models.thread-title-model'
  });
  const E5 = window.PM56_ELI5, F = window.PM56_FEATURES, S = window.PM56_SOUND;
  const setProject = E5?.setProject?.bind(E5);
  const titleToChat = value => value === 'Default' ? 'default' : value === 'None' ? 'none' : 'model:' + value;
  const titleToSettings = value => value === 'default' ? 'Default' : value === 'none' ? 'None' : value?.startsWith('model:') ? value.slice(6) : null;
  // Lines shown while thinking: Settings stores the choice as text ("8"), the chat as a number; thought-stream.js owns
  // the choices and the fallback, and without it there is no thinking to size.
  const lines = () => window.PM56_THOUGHT?.lines || null;
  const linesToChat = value => { const L = lines(), n = Number(value); return L.choices.includes(n) ? n : L.fallback; };
  let projecting = false, paintPending = false, applied = {}, appState = null, last = null;
  const ctx = () => A.ctx();
  const features = () => F?.state?.();
  function projectId(c) { return E5?.project?.(c.thread) || c.thread?.projectId || c.thread?.project_id || 'concept:default-project'; }
  function bindUnscopedThreads(c) {
    const pid = B.project();
    if (!pid) return;
    // The ordinary fixture/new-thread path has no project field. Bind it once
    // to the host project; preserve every explicit project and demo identity.
    (c.state.threads || []).forEach(t => {
      if (!t.projectId && !t.project_id) t.projectId = pid;
    });
  }
  function projection(c) { return B.eli5Project(projectId(c)); }
  let copySheet = null, copyType = null;
  function paintPreferenceCopy(c) {
    const type = c.state.dialog?.type;
    if (type !== 'eli5-style' && type !== 'af-settings') { copySheet = null; copyType = null; return; }
    const sheet = document.querySelector('#pmOverlayRoot .pmx-sheet[data-k^="dlg:' + type + ':"]');
    if (!sheet) return;
    const opening = sheet !== copySheet || type !== copyType;
    copySheet = sheet; copyType = type;
    let matched = 0;
    const example = !!c.thread?.eli5Example;
    const kept = !example && projection(c).ok;
    const replacements = new Map([
      ['Explain Terms Everywhere', 'Session-only in this concept'],
      ['All chats is the Explain Terms Everywhere setting.', kept
        ? "All chats lasts until reload. This project's default is kept in Settings."
        : 'All chats and this example project last until reload.'],
      ['Demo: resets when you reload.', kept
        ? 'Project default is kept. All chats and this chat reset on reload.'
        : 'These example choices reset on reload.']
    ]);
    // This is hosted copy projection only. Preserve controls, focus, keys and
    // the standalone renderer; change only its now-inaccurate text nodes.
    const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const replacement = replacements.get(n.nodeValue);
      if (replacement) { n.nodeValue = replacement; matched++; }
    }
    const text = sheet.textContent || '';
    const projected = type === 'af-settings' ? text.includes('Session-only in this concept')
      : kept ? text.includes('All chats lasts until reload.') && text.includes('Project default is kept.')
        : text.includes('All chats and this example project last until reload.') && text.includes('These example choices reset on reload.');
    if (opening && !matched && !projected) {
      console.warn('[chat56 Settings] Hosted ELI5 copy hooks did not match; check session/project persistence wording.');
    }
    sheet.querySelectorAll('[data-hover-tip], [data-pm-hover-detail]').forEach(el => {
      for (const attr of ['data-hover-tip', 'data-pm-hover-detail']) {
        const text = el.getAttribute(attr);
        if (text?.includes('This is the Explain Terms Everywhere setting.')) {
          el.setAttribute(attr, text.replace('This is the Explain Terms Everywhere setting.',
            'This All chats choice resets when you reload the concept.'));
        }
      }
    });
  }
  function snapshot() {
    const c = ctx(), f = features();
    return {
      thought: c.state.capabilities.thought === 'Expanded' ? 'Expanded' : 'Auto',
      lines: lines() ? lines().current() : null,
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
    const c = ctx(), f = features(), values = B.values();
    if (!c?.state) return;
    bindUnscopedThreads(c);
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
      if (lines() && diff(I.lines)) {
        const value = linesToChat(values[I.lines]);
        if (c.state.capabilities.thoughtLines !== value) { c.state.capabilities.thoughtLines = value; dirty = true; }
      }
      if (f?.title && diff(I.title)) {
        const value = titleToChat(values[I.title] || 'Default');
        if (f.title.policy !== value) { f.title.policy = value; dirty = true; }
      }
      // The existing Settings adapter is project-only. Preserve the separate
      // session-only All chats layer; an unchanged project row means inherit.
      const pid = projectId(c), own = projection(c);
      const resolved = E5?.resolve?.(c.thread?.id);
      if (!c.thread?.eli5Example && own.ok && setProject && resolved?.ok && resolved.projectDefault !== own.override) {
        setProject(pid, own.override); dirty = true;
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
    if (now.thread !== before.thread) { applySettings(false); return; }
    const sheet = c.state.dialog?.type;
    // These are the actual preference sheets. Recipe/family demo changes never
    // write a product preference, including a working take chosen for a demo.
    if (sheet === 'af-settings') {
      if (now.thought !== before.thought && !saveOne(I.thought, now.thought)) {
        c.state.capabilities.thought = before.thought; repaint();
      }
      if (now.lines !== before.lines && now.lines != null && !saveOne(I.lines, String(now.lines))) {
        c.state.capabilities.thoughtLines = before.lines; repaint();
      }
      if (now.title !== before.title) {
        const value = titleToSettings(now.title);
        if (value === null || !saveOne(I.title, value)) { features().title.policy = before.title; repaint(); }
      }
    }
    if (sheet === 'eli5-style' && now.thread === before.thread && now.project !== before.project) {
      if (c.thread?.eli5Example) { last = now; return; }
      if (projectId(c) !== B.project() || !saveOne(I.eli5, now.project)) {
        setProject?.(projectId(c), before.project);
        if (projectId(c) !== B.project()) c.toast('Open this chat’s project', 'Change its default from that project’s Settings.');
        repaint();
      }
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
  E.chainAction('set-thought-lines', (c, button) => {
    if (saveOne(I.lines, button.dataset.value)) { c.closeMenu(); c.renderApp(); }
    return true;
  });
  let newThreadPending = false;
  E.chainAction('new-thread', () => { newThreadPending = true; return false; });
  E.slot('afterRender', (c, info) => {
    paintPreferenceCopy(c);
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
