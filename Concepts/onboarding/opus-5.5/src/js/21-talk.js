/* O55.talk — how the app talks to me: Plain English (ELI5) or Expert, the Settings row general.interaction.mode
   ("How the app talks to me", 60-app-input rows). Jared 2026-10-30: "There was supposed to be an eli5 setting in the
   onboarding flow (like the theme changer or sound) that toggles between technical tips and easier to understand ones.
   It should default to eli5 versions."

   One state for the wizard, the Guided Tour and the app. It is the current Project's setting when that can be read,
   written back through the Settings owner exactly as the sound is (15-sound.js setMuted); otherwise this page's own
   choice, kept for Resume in O55.store (which keeps it in memory for the visit where the page has no storage, such as
   T3's sandboxed preview). A fresh start with nothing chosen is Plain English. When the window hands over to the app
   (O55.finish) the choice is written to the Project as general.interaction.mode.

   Only the ? tips and the help sections have two versions (FinalGUISpec 7.4.0); a screen's own words stay single
   (DL-126). A tip's `text` is the Plain English version and `expert` the technical one (its real names: repository,
   token, SSH); a help section's copy key has a sibling ending in Expert. */
(function () {
  'use strict';
  const O55 = window.O55;
  const ID = 'general.interaction.mode', KEY = 'talk', MODES = ['ELI5', 'Expert'];
  const tome = () => (window.PM7_SETTINGS_TOME && typeof window.PM7_SETTINGS_TOME.project === 'function' && typeof window.PM7_SETTINGS_TOME.projectSnapshot === 'function') ? window.PM7_SETTINGS_TOME : null;
  /* the current Project's value when its settings can be read; null when there is no Project or it cannot be read */
  function projectMode() {
    const t = tome(); if (!t) return null;
    try {
      const p = t.project(); if (!p || !p.id) return null;
      const snap = t.projectSnapshot(p.id);
      if (!snap || typeof snap.then === 'function') return null;
      const v = (snap.settings || {})[ID];
      return MODES.includes(v) ? v : null;
    } catch (_) { return null; }
  }
  function saved() { let v = null; try { v = O55.store.get(KEY, null); } catch (_) {} return MODES.includes(v) ? v : null; }
  const read = () => projectMode() || saved() || 'ELI5';
  let mode = null;
  /* the Project's row is written only where it can be read back (as the sound's binding): never a guess */
  function writeProject(m) {
    const kimi = window.PM12_KIMI;
    if (!kimi || typeof kimi.setSettingFromHost !== 'function') return false;
    const t = tome(); let p = null;
    try { p = t && t.project(); } catch (_) {}
    if (!p || !p.id) return false;
    try { const snap = t.projectSnapshot(p.id); if (!snap || typeof snap.then === 'function') return false; } catch (_) { return false; }
    try { return kimi.setSettingFromHost(ID, m, false, false) === true; } catch (_) { return false; }
  }
  const glyph = (m) => (m === 'ELI5' ? (O55.util.nx('comment', 18, 'control') || '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>')
    : (O55.util.nx('terminal', 18, 'control') || '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17l6-5-6-5M12 19h8"/></svg>'));
  const label = (m) => O55.t('chrome.talk.' + (m === 'ELI5' ? 'eli5' : 'expert'));
  const hint = (m) => O55.t('chrome.talk.' + (m === 'ELI5' ? 'toExpert' : 'toEli5'));
  function sync() {
    const m = TK.mode();
    document.documentElement.setAttribute('data-o55-talk', m === 'ELI5' ? 'eli5' : 'expert');
    document.querySelectorAll('button.o55-talk').forEach((b) => {
      const name = label(m), aria = O55.t('chrome.talk.aria', { mode: name });
      b.setAttribute('aria-label', aria); b.setAttribute('title', aria + '\n' + hint(m)); b.setAttribute('data-mode', m);
      const g = b.querySelector('.o55-talkglyph'), w = b.querySelector('.o55-talkname');
      if (g && g.getAttribute('data-mode') !== m) { g.setAttribute('data-mode', m); g.innerHTML = glyph(m); }
      if (w && w.textContent !== name) w.textContent = name;
    });
  }
  function announce(source) {
    sync();
    window.dispatchEvent(new CustomEvent('o55:talk', { detail: { mode: TK.mode(), source } }));
  }
  const TK = O55.talk = {
    ID, MODES,
    mode() { if (!mode) mode = read(); return mode; },
    eli5() { return TK.mode() === 'ELI5'; },
    /* read again (a Project chosen or loaded meanwhile); announces only a change */
    refresh() { const m = read(); if (m !== mode) { mode = m; announce('refresh'); } else sync(); return mode; },
    set(m, source) {
      if (!MODES.includes(m) || m === TK.mode()) return false;
      mode = m;
      try { O55.store.set(KEY, m); } catch (_) {}
      writeProject(m);
      announce(source || 'ui');
      return true;
    },
    toggle(source) { return TK.set(TK.eli5() ? 'Expert' : 'ELI5', source); },
    /* the window hands over to the app: the choice becomes the Project's general.interaction.mode */
    carry() { return writeProject(TK.mode()); },
    /* a copy key's Expert sibling (keyExpert) in Expert mode, where it exists; otherwise the key itself */
    t(key, vars) { if (!TK.eli5()) { const x = O55.tx(key + 'Expert'); if (typeof x === 'string') return O55.t(key + 'Expert', vars); } return O55.t(key, vars); },
    /* the bar's button: the mode's own mark and name (the name folds away where the bar is narrow) */
    buttonHtml(cls, attr) {
      const m = TK.mode(), name = label(m), aria = O55.t('chrome.talk.aria', { mode: name });
      return `<button type="button" class="${cls || ''} o55-talk" ${attr || 'data-o55-do'}="talk" data-mode="${m}" data-pm-hover-exempt="true" aria-label="${O55.util.esc(aria)}" title="${O55.util.esc(aria + '\n' + hint(m))}">`
        + `<span class="o55-talkglyph" data-mode="${m}" aria-hidden="true">${glyph(m)}</span><span class="o55-talkname">${O55.util.esc(name)}</span></button>`;
    },
    sync
  };
})();
