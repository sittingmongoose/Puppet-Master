/* O55 · NieR Mode: the engine. A hidden theme painted over the Basic family, in light or dark following Light or dark
   (Light / Dark / Auto). It is not a ninth theme: the family the person chose stays in PM_THEME's themeState and in the
   Theme setting, and comes back exactly when NieR Mode is turned off. Off by default; every part is installed by
   default. The palette is styles.d/13-nier.css (generated from nier/nier-automata.json by tools/nier_palette.py); the
   parts (cursor, reboot, Pod, scenes, the chip manager ...) are other files that code against the contract below.

   Settings (Plans/settings_inventory.json): general.visual.nier-mode (toggle, default off),
   general.visual.nier-parts (multiselect of the 29 part labels, default all), general.visual.nier-background (select,
   default City Ruins).

   Attribute contract on <html> (nothing is written while NieR Mode is off, the look-layer rule):
     data-o55-nier="on"                   NieR Mode is painted (it appears and disappears in the same task as the
                                          repaint to basic-<mode>, so a rule on it never sees another family);
     data-o55-nier-parts="square cursor…" the installed parts' keys, space separated, in PARTS order; match one with
                                          html[data-o55-nier-parts~="cursor"]. Present (maybe empty) only while on.
     data-theme="basic-light|basic-dark"  always, while on (the paint hook below).
   data-o55-nier-scene is owned by the scenes part; this engine only reports background changes through onChange.
   Inline look tokens (Corner roundness, Border width, Spacing ...) still win over any stylesheet; NieR Mode itself
   decides Accent color and App font (their writes are skipped while it is on).

   window.PM_NIER (the API the parts code against):
     on()              -> true while NieR Mode is painted (false during a transition, until its repaint runs)
     parts()           -> installed part keys, in PARTS order (whether or not NieR Mode is on)
     has(key)          -> true only while on() AND that part is installed
     PARTS             -> [{ key, label, group }] in canonical order (groups: Look, Motion, Sound & voice, Pointer, World)
     keyFor(label)     -> key, or null;  labelFor(key) -> label, or null
     set(on)           -> commits general.visual.nier-mode through the real settings path; returns false if refused
     setParts(keys)    -> commits general.visual.nier-parts (labels, in PARTS order); unknown keys are ignored
     background()      -> the chosen background option label ("City Ruins", ..., "Follow the page")
     onChange(cb)      -> unsubscribe function; cb({ on, parts, background, mode, reason }) after every change:
                          reason 'on' | 'off' | 'parts' | 'background' | 'mode' (light/dark, only while on) | 'init'
                          (NieR Mode was already on when the Settings state loaded)
     setTransition(fn) -> registers async fn(repaint, { on, reason }) run when NieR Mode turns on or off; it must call
                          repaint() once (the theme changes inside it) and may animate before and after. The default
                          calls repaint() at once. A transition that throws or never calls repaint() still repaints
                          when it settles. Passing null restores the default. Returns the previous function.
     replay()          -> runs the registered transition around a repaint that changes nothing (the manager's "Play
                          reboot moment"); resolves when it is done
     notePick(family)  -> a family was picked somewhere while NieR Mode is on: shows "Your theme is saved. It shows
                          when NieR Mode is off." with a Turn off NieR Mode button (does nothing while off)
   The paint hook window.PM_THEME_PAINT_FAMILY(family) (tools/build.py patches every <html data-theme> writer to ask it)
   answers 'basic' while NieR Mode is painted and the family itself otherwise; PM_THEME_PAINT_LABEL() names the look
   ("NieR: Automata") for the title-bar theme menu. */
const O55_NIER_IDS = ['general.visual.nier-mode', 'general.visual.nier-parts', 'general.visual.nier-background'];
const O55_NIER_PARTS = Object.freeze([
  ['Look', 'Square hairlines', 'square'], ['Look', 'Menu cursor', 'cursor'], ['Look', 'YoRHa headers', 'headers'],
  ['Look', 'Parchment ground', 'ground'], ['Look', 'Target brackets', 'brackets'], ['Look', 'Diamond loaders', 'diamonds'],
  ['Motion', 'Reboot moment', 'reboot'], ['Motion', 'Slice open', 'slice'], ['Motion', 'Text decode', 'decode'],
  ['Motion', 'Page wipe', 'wipe'], ['Motion', 'Drifting particles', 'particles'], ['Motion', 'Scan sweep', 'sweep'],
  ['Motion', 'Alert glitch', 'glitch'],
  ['Sound & voice', 'Menu sounds', 'sounds'], ['Sound & voice', 'Pod voice', 'voice'], ['Sound & voice', 'Pod companion', 'pod'],
  ['Pointer', 'Square pointer', 'pointer'],
  ['World', 'Boot sequence', 'boot'], ['World', 'Unit readouts', 'readouts'], ['World', 'Block progress', 'blocks'],
  ['World', 'Ink charts', 'charts'], ['World', 'Map ticks', 'ticks'], ['World', 'Machine glyphs', 'glyphs'],
  ['World', 'Intel tooltips', 'intel'], ['World', 'Square icon strokes', 'icons'], ['World', 'Pod 042 in Chat', 'pod042'],
  ['World', 'Quest banners', 'quests'], ['World', 'Ink empty states', 'empty'], ['World', 'Save signal', 'save']
].map(([group, label, key]) => Object.freeze({ key, label, group })));
const o55NierByLabel = new Map(O55_NIER_PARTS.map(p => [p.label, p.key]));
const o55NierByKey = new Map(O55_NIER_PARTS.map(p => [p.key, p.label]));
const O55_NIER_LABEL = 'NieR: Automata';

/* ---------- state ---------------------------------------------------------------------------------------------- */
/* What the setting asks for, and what is painted. They differ only while a transition runs (or before the Settings
   state has loaded): the hook and the attributes follow the painted state, never the raw setting, so a save that
   repaints the theme on its own (PM7_SETTINGS_TOME.applyPaint) cannot paint NieR Mode before the transition's cover. */
let o55NierPainted = null; /* null until the Settings state is readable */
function o55NierValue(id) { try { return state && state.settings ? PM51.value(id) : undefined; } catch (e) { return undefined; } }
function o55NierWanted() { return o55On(o55NierValue('general.visual.nier-mode')); }
function o55NierIsPainted() {
  if (o55NierPainted === null) {
    let ready = false; try { ready = !!(state && state.settings && typeof PM51.value === 'function'); } catch (e) { ready = false; }
    if (!ready) return false;
    o55NierPainted = o55NierWanted();
    o55NierWriteAttrs();
    if (o55NierPainted) window.queueMicrotask(() => o55NierEmit('init'));
  }
  return o55NierPainted;
}
function o55NierParts() {
  const v = o55NierValue('general.visual.nier-parts');
  const have = new Set((Array.isArray(v) ? v : []).map(String));
  return O55_NIER_PARTS.filter(p => have.has(p.label)).map(p => p.key);
}
function o55NierBackground() { const v = o55NierValue('general.visual.nier-background'); return v == null || v === '' ? 'City Ruins' : String(v); }
const o55NierMode = () => (/-light$/.test(document.documentElement.getAttribute('data-theme') || '') ? 'light' : 'dark');

function o55NierWriteAttrs() {
  const html = document.documentElement;
  if (o55NierPainted) {
    if (html.getAttribute('data-o55-nier') !== 'on') html.setAttribute('data-o55-nier', 'on');
    const parts = o55NierParts().join(' ');
    if (html.getAttribute('data-o55-nier-parts') !== parts) html.setAttribute('data-o55-nier-parts', parts);
  } else {
    html.removeAttribute('data-o55-nier'); html.removeAttribute('data-o55-nier-parts');
  }
}

/* ---------- the paint hook (tools/build.py routes every data-theme writer through it) ---------------------------- */
window.PM_THEME_PAINT_FAMILY = family => (o55NierIsPainted() ? 'basic' : family);
window.PM_THEME_PAINT_LABEL = () => (o55NierIsPainted() ? O55_NIER_LABEL : '');

/* ---------- change events -------------------------------------------------------------------------------------- */
const o55NierListeners = new Set();
let o55NierLast = null;
function o55NierSnapshot() {
  const on = !!o55NierIsPainted();
  return { on, parts: o55NierParts(), background: o55NierBackground(), mode: on ? o55NierMode() : null };
}
function o55NierEmit(forced) {
  const snap = o55NierSnapshot(), last = o55NierLast;
  let reason = forced || null;
  if (!reason && last) {
    if (snap.on !== last.on) reason = snap.on ? 'on' : 'off';
    else if (snap.parts.join(' ') !== last.parts.join(' ')) reason = 'parts';
    else if (snap.background !== last.background) reason = 'background';
    else if (snap.mode !== last.mode) reason = 'mode';
  }
  o55NierLast = snap;
  if (!reason || (!last && !forced)) return;
  o55NierListeners.forEach(cb => { try { cb(Object.assign({ reason }, snap, { parts: snap.parts.slice() })); } catch (e) { /* a listener never blocks the look */ } });
}

/* ---------- turning it on and off ------------------------------------------------------------------------------ */
const o55NierDefaultTransition = repaint => repaint();
let o55NierTransition = o55NierDefaultTransition;
let o55NierChain = Promise.resolve();
/* The chosen family comes back from PM_THEME's themeState; the hook decides what is painted. */
function o55NierRepaintTheme() {
  const T = window.PM_THEME;
  if (T && typeof T.setFamily === 'function' && typeof T.getFamily === 'function') T.setFamily(T.getFamily(), { persist: false, dispatch: false });
  else document.documentElement.setAttribute('data-theme', window.PM_THEME_PAINT_FAMILY(String(document.documentElement.getAttribute('data-theme') || 'basic-dark').split('-')[0]) + '-' + o55NierMode());
}
function o55NierPaint(want) {
  o55NierPainted = want;
  o55NierWriteAttrs();
  o55NierRepaintTheme();
  /* the look layer: NieR Mode decides Accent color and App font, and the rows that follow the painted family */
  o55LookKey = ''; o55ApplyLook();
  O55_NIER_OWNS.forEach(id => { if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) refreshSettingRow(id); });
  if (typeof o55SyncDependents === 'function') o55SyncDependents('general.visual.theme');
}
function o55NierRun(reason) {
  const step = async () => {
    const want = o55NierWanted();
    if (want === o55NierIsPainted()) { o55NierWriteAttrs(); o55NierEmit(); return; }
    let done = false;
    const repaint = () => { if (done) return; done = true; o55NierPaint(want); };
    try { await o55NierTransition(repaint, { on: want, reason: reason || (want ? 'on' : 'off') }); }
    catch (e) { /* the transition is decoration; the repaint is not */ }
    finally { repaint(); o55NierEmit(); }
  };
  o55NierChain = o55NierChain.then(step, step);
  return o55NierChain;
}
/* Called from o55ApplyLook (17-look.js) on every look pass: a changed switch runs the transition; changed parts,
   background or mode only rewrite the attributes and report. */
function o55NierApply() {
  if (o55NierIsPainted() !== o55NierWanted()) { o55NierRun(); return; }
  o55NierWriteAttrs(); o55NierEmit();
}

/* ---------- precedence: Accent color and App font ---------------------------------------------------------------- */
/* While NieR Mode is on it decides these two; their rows keep the person's choice (for when it is off) and say so. */
const O55_NIER_OWNS = ['general.visual.accent-color', 'general.visual.app-font'];
const o55NierControl = renderControl;
renderControl = function (setting, value) {
  const html = o55NierControl.apply(this, arguments);
  if (!setting || !O55_NIER_OWNS.includes(setting.id) || !o55NierIsPainted()) return html;
  return `<div class="o55-nier-own"><span class="o55-inherit"><span class="o55-auto">${icon('spark')}<span>NieR Mode decides this while it is on</span></span></span>${html}</div>`;
};
/* Rows that depend on the theme family (High contrast for Basic, the Glass rows, Retro textures) follow the family
   being painted, so while NieR Mode is on they read Basic; their stored values are never touched. kit.d/40-bound.js
   asks PM51.whenValue for a `when` condition's value. */
PM51.whenValue = id => (id === 'general.visual.theme' && o55NierIsPainted() ? (o55NierMode() === 'light' ? 'Basic Light' : 'Basic Dark') : PM51.value(id));

/* ---------- a family picked while NieR Mode is on ---------------------------------------------------------------- */
let o55NierNote = null;
function o55NierNoteEnd() { const n = o55NierNote; o55NierNote = null; if (n) { window.clearTimeout(n.timer); n.bar.remove(); } }
function o55NierNotePick(family) {
  if (!o55NierIsPainted()) return;
  o55NierNoteEnd();
  const bar = document.createElement('div');
  bar.className = 'o55-preview-bar o55-nier-note'; bar.setAttribute('role', 'status');
  bar.innerHTML = `<span class="o55-preview-text">Your theme is saved. It shows when NieR Mode is off.</span><button type="button" class="o55-nier-note-off" data-o55-nier-note="off">Turn off NieR Mode</button><button type="button" data-o55-nier-note="close">OK</button>`;
  document.body.appendChild(bar);
  o55NierNote = { bar, family, timer: window.setTimeout(o55NierNoteEnd, 9000) };
}
document.addEventListener('click', e => {
  const b = e.target && e.target.closest ? e.target.closest('[data-o55-nier-note]') : null; if (!b) return;
  const off = b.dataset.o55NierNote === 'off';
  o55NierNoteEnd();
  if (off) o55NierSet(false);
});
/* Every family pick that is saved goes through commitSettingValue (the Settings row, the title-bar menu through
   setSettingFromHost, the tour's look menu); a pick that changes the saved family while NieR Mode is on is noted. */
const o55NierCommit = commitSettingValue;
commitSettingValue = function (id, value) {
  const fam = v => String(v || '').trim().split(/\s+/)[0].toLowerCase();
  const before = id === 'general.visual.theme' && state && state.settings ? fam(PM51.value(id)) : null;
  const ok = o55NierCommit.apply(this, arguments);
  if (ok && before != null && fam(value) && fam(value) !== before) o55NierNotePick(fam(value));
  return ok;
};

/* ---------- the API ---------------------------------------------------------------------------------------------- */
function o55NierCommitRow(id, value) {
  const found = findSettingGlobal(id); if (!found) return false;
  if (!commitSettingValue(id, value)) return false;
  saveState(); refreshSettingRow(id);
  if (typeof o55Notify === 'function') o55Notify(id, value);
  return true;
}
function o55NierSet(on) { return o55NierCommitRow('general.visual.nier-mode', !!on); }
window.PM_NIER = Object.freeze({
  PARTS: O55_NIER_PARTS,
  on: () => !!o55NierIsPainted(),
  parts: () => o55NierParts(),
  has: key => !!o55NierIsPainted() && o55NierParts().includes(key),
  keyFor: label => o55NierByLabel.get(String(label)) || null,
  labelFor: key => o55NierByKey.get(String(key)) || null,
  set: on => o55NierSet(on),
  setParts: keys => {
    const want = new Set((Array.isArray(keys) ? keys : []).map(String));
    return o55NierCommitRow('general.visual.nier-parts', O55_NIER_PARTS.filter(p => want.has(p.key)).map(p => p.label));
  },
  background: () => o55NierBackground(),
  onChange: cb => { if (typeof cb !== 'function') return () => {}; o55NierListeners.add(cb); return () => { o55NierListeners.delete(cb); }; },
  setTransition: fn => { const prev = o55NierTransition === o55NierDefaultTransition ? null : o55NierTransition; o55NierTransition = typeof fn === 'function' ? fn : o55NierDefaultTransition; return prev; },
  replay: () => {
    const step = async () => {
      let done = false; const on = !!o55NierIsPainted();
      const repaint = () => { if (!done) { done = true; o55NierRepaintTheme(); } };
      try { await o55NierTransition(repaint, { on, reason: 'replay' }); } catch (e) { /* decoration only */ } finally { repaint(); }
    };
    o55NierChain = o55NierChain.then(step, step);
    return o55NierChain;
  },
  notePick: family => o55NierNotePick(family)
});
