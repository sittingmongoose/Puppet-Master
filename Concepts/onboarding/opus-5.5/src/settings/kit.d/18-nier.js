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
     set(on, opts?)    -> commits general.visual.nier-mode through the real settings path; returns false if refused;
                          opts.sound === false keeps the transition quiet (the caller plays its own sound)
     setParts(keys)    -> commits general.visual.nier-parts (labels, in PARTS order); unknown keys are ignored
     background()      -> the chosen background option label ("City Ruins", ..., "Follow the page")
     setBackground(l)  -> commits general.visual.nier-background (one of BACKGROUNDS); BACKGROUNDS -> the eight labels
     wanted()          -> what is asked for: the preview's switch, else the setting (on() lags it during a transition)
     onChange(cb)      -> unsubscribe function; cb({ on, parts, background, mode, reason, changed }) after every
                          change: reason 'on' | 'off' | 'parts' | 'background' | 'mode' (light/dark, only while on) |
                          'init'; changes made together are reported once, reason the first and `changed` all of them
                          (NieR Mode was already on when the Settings state loaded; only listeners registered while
                          the Settings script runs hear it, so read on() when you start). 'on' and 'off' fire right
                          after the repaint, inside the transition and under its cover, so a part can swap its own
                          scene there; the transition's promise settles after.
     setTransition(fn) -> registers async fn(repaint, info) run when NieR Mode turns on or off; it must call repaint()
                          once (the theme changes inside it, and onChange reports 'on' / 'off' at once, still under the
                          cover) and may animate before and after. info: { on, dir: 'on' | 'off', reason, within?,
                          sound?, from?, lines?, onReveal? }. within: an element the moment plays inside (the onboarding
                          window, which holds the app beneath still); sound: false when the caller plays its own; from,
                          lines and onReveal come from preview(patch, opts) (see there). The default calls repaint() at
                          once. A transition that throws or never calls repaint() still repaints when it settles.
                          Passing null restores the default. Returns the previous function.
     replay()          -> runs the registered transition around a repaint that changes nothing (the manager's "Play
                          reboot moment"); resolves when it is done
     notePick(family)  -> a family was picked somewhere while NieR Mode is on: shows "Your theme is saved. It shows
                          when NieR Mode is off." with a Turn off NieR Mode button (does nothing while off)

   The paint hook window.PM_THEME_PAINT_FAMILY(family) (tools/build.py patches every <html data-theme> writer to ask it)
   answers 'basic' while NieR Mode is painted and the family itself otherwise; PM_THEME_PAINT_LABEL() names the look
   ("NieR: Automata") for the title-bar theme menu.

   The onboarding preview (Plans/Settings_System.md 4.4: the three NieR rows take the same atomic acceptance,
   non-persistent preview and scope as the theme pair). Before a Project is saved the onboarding's look is a preview:
     ready()           -> true once the Settings state can be read (before that every reader answers the defaults)
     preview(patch, opts?) -> patch { on?, parts?: keys, background?: label } merged over the stored values and painted
                          exactly as if stored (same attributes, same transition); writes nothing to Settings. null
                          clears it and repaints from the stored values. opts: within (the element every transition
                          plays inside while this preview lasts; null for none), sound (false: this change's transition
                          is quiet), instant (true: this change repaints at once, as a resumed onboarding does), and for
                          a switch's moment inside the window (kit.d/19-nier-parts.js, hero H1): from (the control, or a
                          function returning it, the cover grows from and folds back into), lines ([{ text, stamp }]
                          for the check list; the cover words its own when absent) and onReveal(phase) ('reveal' as the
                          window shows again, 'gone' when the cover has left). Returns a promise that settles at 'gone'
                          (after the repaint). A Project switch keeps it (every reader asks the preview first), which is
                          how the look survives Creating.
     previewing()      -> a copy of the preview { on?, parts?, background? } (loose: true once lingering), or null
     commitPreview()   -> writes the preview's values that differ from the CURRENT Project's through the real settings
                          path in one batch, then clears the preview with no repaint; returns true, or false (the
                          preview stays, nothing is written)
     linger()          -> the onboarding closed without finishing: the preview stays painted, as its theme preview
                          does, until Settings next writes a value or loads another Project; then the stored values return
     store(kind)       -> { kind, on(), set(on), parts(), setParts(keys), background(), setBackground(label),
                          BACKGROUNDS, onChange(cb) }; kind 'live' commits through Settings, kind 'preview' previews
                          (the Plug-in Chips editor reads and writes through one of these); on() is the request
   A live write while a preview is shown moves the preview too, so what is painted is always the latest request; a live
   write to the parts or the background while a preview lingers saves what is painted (the preview's other rows with
   it), so NieR Mode never turns off under an edit made on what was shown; a write to the switch itself drops it.

   o55NierCopy(key, fallback, vars) reads the build's copy (src/copy.d/55-nier-chips.json, merged into
   window.O55_COPY) when it is there, so every NieR Settings word lives in copy; the literal is only the fallback for a
   page without the onboarding layer. */
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
/* general.visual.nier-background's options, in canon order (Plans/settings_inventory.json) */
const O55_NIER_BACKGROUNDS = Object.freeze(['Parchment', 'City Ruins', 'The Bunker', 'Desert', 'Forest Castle', 'Amusement Park', 'Flooded City', 'Follow the page']);
/* copy: read when it is used (the copy table loads after the Settings scripts) */
function o55NierCopy(key, fallback, vars) {
  let node = window.O55_COPY || (window.O55 && window.O55.copy) || null;
  for (const part of String(key).split('.')) { if (node == null) break; node = node[part]; }
  let text = typeof node === 'string' ? node : String(fallback == null ? '' : fallback);
  if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k])));
  return text;
}

/* ---------- state ---------------------------------------------------------------------------------------------- */
/* What the setting asks for, and what is painted. They differ only while a transition runs (or before the Settings
   state has loaded): the hook and the attributes follow the painted state, never the raw setting, so a save that
   repaints the theme on its own (PM7_SETTINGS_TOME.applyPaint) cannot paint NieR Mode before the transition's cover.
   The onboarding preview (o55NierPv) is asked before the stored values by every reader below, so a Project switch, a
   Settings render or a look pass all keep painting it. */
let o55NierPainted = null; /* null until the Settings state is readable */
let o55NierPv = null;          /* { on?, parts?: keys, background?: label } while the onboarding previews, else null */
let o55NierPvLoose = false;    /* the onboarding closed unfinished: the preview lingers until Settings writes or reloads */
let o55NierPvProject = '';     /* the Project that was loaded when the preview began to linger */
let o55NierPvWithin = null;    /* the element this preview's transitions play inside (the onboarding window) */
let o55NierNextRun = null;     /* options for the transition the next commit starts (set(on, { sound: false })) */
function o55NierValue(id) { try { return state && state.settings ? PM51.value(id) : undefined; } catch (e) { return undefined; } }
function o55NierReady() { try { return !!(state && state.settings && typeof PM51.value === 'function'); } catch (e) { return false; } }
function o55NierStoredOn() { return o55On(o55NierValue('general.visual.nier-mode')); }
function o55NierWanted() { return o55NierPv && typeof o55NierPv.on === 'boolean' ? o55NierPv.on : o55NierStoredOn(); }
function o55NierIsPainted() {
  if (o55NierPainted === null) {
    if (!o55NierReady()) return false;
    o55NierPainted = o55NierWanted();
    o55NierWriteAttrs();
    if (o55NierPainted) { o55NierPaintStored(); window.queueMicrotask(() => o55NierEmit('init')); }
  }
  return o55NierPainted;
}
/* The app opens in Basic Dark (the head's boot paint), and the Settings engine paints the stored theme only once the
   page has loaded (DOMContentLoaded, then a timeout: about 3 s into a heavy open). Under NieR Mode that left a person
   on Light in NieR Dark for those seconds: the boot log tore away onto the dark app, which then flipped to parchment
   (film finding TM-07). So when NieR Mode is on as the Settings state loads, the stored theme is painted at once,
   before the boot log's first frame. PM_THEME's own boot (wireTheme, a DOMContentLoaded listener) then adopts Basic
   Dark: its write to <html> is held back for that one call (o55NierHoldBootDark), and a listener on window, which runs
   after every one on document in the same task, gives PM_THEME the stored family and mode. Letting the write through
   and painting Light back there showed no frame either, but it restyled the whole page twice inside the open (about
   130 to 420 ms). The engine's later pass then finds nothing to change. The four families keep the engine's own
   timing. */
let o55NierStoredPaintArmed = false;
function o55NierPaintStored() {
  const T = window.PM7_SETTINGS_TOME;
  if (!T || typeof T.applyPaint !== 'function') return;
  try { T.applyPaint(state); } catch (e) { return; /* the engine paints it on its own schedule */ }
  if (o55NierStoredPaintArmed || document.readyState !== 'loading') return;
  o55NierStoredPaintArmed = true;
  let held = null;
  /* registered while the Settings script runs, so it is called before PM_THEME's boot listener (a later script) */
  document.addEventListener('DOMContentLoaded', () => { held = o55NierHoldBootDark(); }, { once: true });
  window.addEventListener('DOMContentLoaded', () => {
    if (held && held.release()) o55NierSyncThemeState();
    if (o55NierPainted && !o55NierPv) { try { T.applyPaint(state); } catch (e) { /* as above */ } }
  }, { once: true });
}
/* While the stored look is painted and is not Basic Dark, the first write of data-theme="basic-dark" to <html> (the
   boot adoption) is dropped; a write of anything else, or a second one, goes through. An own property on the element
   shadows Element.prototype.setAttribute for this one task, and release() removes it. */
function o55NierHoldBootDark() {
  const html = document.documentElement, native = Element.prototype.setAttribute;
  if (html.getAttribute('data-theme') === 'basic-dark' || Object.prototype.hasOwnProperty.call(html, 'setAttribute')) return null;
  let swallowed = false;
  const release = () => { if (html.setAttribute === shim) delete html.setAttribute; return swallowed; };
  function shim(name, value) {
    if (!swallowed && name === 'data-theme' && String(value) === 'basic-dark') { swallowed = true; release(); return undefined; }
    return native.call(this, name, value);
  }
  try { Object.defineProperty(html, 'setAttribute', { value: shim, configurable: true, writable: true }); } catch (e) { return null; }
  return { release };
}
/* PM_THEME's themeState after the held adoption says basic / dark; give it the family and mode Settings stores (the
   applyPaint reading) in one write that keeps the painted value (a same-value write restyles nothing): set(slug) takes
   family and scheme together, and Auto, which a slug cannot say, follows with the same scheme. Two separate writes
   (setFamily, setMode) would paint a family with the old mode for a moment wherever the hook answers the family. */
function o55NierSyncThemeState() {
  const P = window.PM_THEME, T = window.PM7_SETTINGS_TOME;
  if (!P || typeof P.set !== 'function' || typeof P.setMode !== 'function') return;
  let project = null; try { project = T && typeof T.project === 'function' ? T.project() : null; } catch (e) { project = null; }
  const settings = (state && state.settings) || {};
  const slug = project ? String(settings['general.visual.theme'] || 'Basic Dark').trim().toLowerCase().replace(/\s+/g, '-') : 'basic-dark';
  const family = slug.split('-')[0] || 'basic', explicit = slug.split('-')[1] || 'dark';
  let mode = project ? String(settings['general.visual.theme-mode'] || explicit).toLowerCase() : 'dark';
  if (!['light', 'dark', 'auto'].includes(mode)) mode = explicit;
  const scheme = mode === 'auto' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
  const quiet = { persist: false, dispatch: false };
  try {
    if (P.getFamily() !== family || P.getMode() !== mode) P.set(family + '-' + scheme, quiet);
    if (mode === 'auto') P.setMode('auto', quiet);
  } catch (e) { /* applyPaint below repaints from the stored values */ }
}
const o55NierKeys = keys => { const want = new Set((Array.isArray(keys) ? keys : []).map(String)); return O55_NIER_PARTS.filter(p => want.has(p.key)).map(p => p.key); };
function o55NierStoredParts() {
  const v = o55NierValue('general.visual.nier-parts');
  const have = new Set((Array.isArray(v) ? v : []).map(String));
  return O55_NIER_PARTS.filter(p => have.has(p.label)).map(p => p.key);
}
function o55NierParts() { return o55NierPv && Array.isArray(o55NierPv.parts) ? o55NierPv.parts.slice() : o55NierStoredParts(); }
function o55NierStoredBackground() { const v = o55NierValue('general.visual.nier-background'); return v == null || v === '' ? 'City Ruins' : String(v); }
function o55NierBackground() { return o55NierPv && o55NierPv.background ? o55NierPv.background : o55NierStoredBackground(); }
const o55NierMode = () => (/-light$/.test(document.documentElement.getAttribute('data-theme') || '') ? 'light' : 'dark');
const o55NierLabels = keys => O55_NIER_PARTS.filter(p => keys.includes(p.key)).map(p => p.label);
function o55NierProjectId() { try { const p = window.PM7_SETTINGS_TOME && window.PM7_SETTINGS_TOME.project(); return p && p.id ? String(p.id) : ''; } catch (e) { return ''; } }
/* the element a preview's transition plays inside: only while that preview is shown and its element is on screen */
function o55NierWithin() { const w = o55NierPvWithin; return o55NierPv && !o55NierPvLoose && w && w.isConnected && w.getClientRects().length ? w : null; }

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
  const changed = [];
  if (last) {
    if (snap.on !== last.on) changed.push(snap.on ? 'on' : 'off');
    if (snap.parts.join(' ') !== last.parts.join(' ')) changed.push('parts');
    if (snap.background !== last.background) changed.push('background');
    if (snap.mode !== last.mode && snap.on === last.on) changed.push('mode');
  }
  const reason = forced || changed[0] || null;
  o55NierLast = snap;
  if (!reason || (!last && !forced)) return;
  o55NierListeners.forEach(cb => { try { cb(Object.assign({ reason, changed: forced ? [forced] : changed.slice() }, snap, { parts: snap.parts.slice() })); } catch (e) { /* a listener never blocks the look */ } });
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
/* opts: within (the element the transition plays inside), sound (false: the caller plays its own), and the in-window
   moment's from, lines and onReveal (preview opts) */
function o55NierRun(reason, opts) {
  const o = opts || o55NierNextRun || {};
  if (!opts) o55NierNextRun = null;
  const step = async () => {
    const want = o55NierWanted();
    if (want === o55NierIsPainted()) { o55NierWriteAttrs(); o55NierEmit(); return; }
    let done = false;
    /* the latest request is painted, so a change asked for while this transition plays is never undone by it; the
       parts hear 'on' / 'off' at once, so they install (or leave) under the transition's cover */
    const repaint = () => { if (done) return; done = true; o55NierPaint(o55NierWanted()); o55NierEmit(); };
    const info = { on: want, dir: want ? 'on' : 'off', reason: reason || (want ? 'on' : 'off') };
    const within = o.within || o55NierWithin();
    if (within) info.within = within;
    if (o.sound === false) info.sound = false;
    if (o.from) info.from = o.from;
    if (Array.isArray(o.lines) && o.lines.length) info.lines = o.lines.slice();
    if (typeof o.onReveal === 'function') info.onReveal = o.onReveal;
    try { await o55NierTransition(repaint, info); }
    catch (e) { /* the transition is decoration; the repaint is not */ }
    finally { repaint(); o55NierEmit(); }
    if (o55NierWanted() !== o55NierPainted) o55NierRun();
  };
  o55NierChain = o55NierChain.then(step, step);
  return o55NierChain;
}
/* a change that must show in this frame (a resumed onboarding): no transition */
function o55NierPaintNow() {
  if (!o55NierReady()) return;
  if (o55NierWanted() !== o55NierIsPainted()) o55NierPaint(o55NierWanted()); else o55NierWriteAttrs();
  o55NierEmit();
}
/* Called from o55ApplyLook (17-look.js) on every look pass: a changed switch runs the transition; changed parts,
   background or mode only rewrite the attributes and report. */
function o55NierApply() {
  /* a lingering preview ends when another Project is loaded, as the theme it was shown with does */
  if (o55NierPvLoose && o55NierProjectId() !== o55NierPvProject) o55NierPreviewDrop();
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
  /* the onboarding window saves nothing until the end and says so itself (the look screen's own note) */
  if (!o55NierIsPainted() || !o55NierWanted() || document.documentElement.hasAttribute('data-o55-open')) return;
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
   setSettingFromHost, the tour's look menu); a pick that changes the saved family while NieR Mode is on is noted.
   Every write also tells the preview: a lingering one ends (Settings has written, as the theme it was shown with
   ends), and a shown one follows a write to a NieR row, so the latest request is what is painted. */
const o55NierCommit = commitSettingValue;
commitSettingValue = function (id, value) {
  const fam = v => String(v || '').trim().split(/\s+/)[0].toLowerCase();
  const before = id === 'general.visual.theme' && state && state.settings ? fam(PM51.value(id)) : null;
  const ok = o55NierCommit.apply(this, arguments);
  if (ok) o55NierFollowWrite(id, value);
  if (ok && before != null && fam(value) && fam(value) !== before) o55NierNotePick(fam(value));
  return ok;
};
function o55NierPreviewDrop() { o55NierPv = null; o55NierPvLoose = false; o55NierPvWithin = null; o55NierPvProject = ''; }
function o55NierFollowWrite(id, value) {
  if (!o55NierPv) return;
  /* a parts or background edit adopts the lingering preview; a switch written on its own keeps the drop (the person
     turned NieR Mode on or off: that is what is saved) */
  if (o55NierPvLoose && (id === 'general.visual.nier-parts' || id === 'general.visual.nier-background')) { o55NierAdopt(id); return; }
  if (o55NierPvLoose) { o55NierPreviewDrop(); o55NierRun(); return; }
  if (id === 'general.visual.nier-mode') o55NierPv.on = o55On(value);
  else if (id === 'general.visual.nier-parts') o55NierPv.parts = o55NierKeys((Array.isArray(value) ? value : []).map(l => o55NierByLabel.get(String(l))));
  else if (id === 'general.visual.nier-background') o55NierPv.background = String(value);
}

/* A live edit of a NieR row while the onboarding's preview lingers (the title-bar Adjust NieR look, its toggle) was made
   on what is painted, and the live store shows the preview: so the edit saves what is painted. The row just written
   is kept; the preview's other rows that differ from the stored ones are written with it in one batch, then the
   preview goes and nothing repaints (what is painted is what is stored). Never a list derived from the preview saved
   while its switch is dropped. */
function o55NierAdopt(id) {
  const pv = o55NierPv; o55NierPreviewDrop();
  const writes = {};
  if (id !== 'general.visual.nier-mode' && typeof pv.on === 'boolean' && pv.on !== o55NierStoredOn()) writes['general.visual.nier-mode'] = pv.on;
  if (id !== 'general.visual.nier-parts' && Array.isArray(pv.parts) && pv.parts.join(' ') !== o55NierStoredParts().join(' ')) writes['general.visual.nier-parts'] = o55NierLabels(pv.parts);
  if (id !== 'general.visual.nier-background' && pv.background && pv.background !== o55NierStoredBackground()) writes['general.visual.nier-background'] = pv.background;
  const ids = Object.keys(writes);
  if (ids.length && commitSettingValues(writes)) {
    saveState();
    ids.forEach(w => { if (root.querySelector(`[id="setting-${cssEscape(w)}"]`)) refreshSettingRow(w); if (typeof o55Notify === 'function') o55Notify(w, writes[w]); });
  }
  /* a switch that now differs from the paint runs its transition; otherwise the attributes follow and listeners hear */
  if (o55NierWanted() !== o55NierIsPainted()) o55NierRun(); else { o55NierWriteAttrs(); o55NierEmit(); }
}

/* ---------- the onboarding preview ------------------------------------------------------------------------------ */
function o55NierPreview(patch, opts) {
  const o = opts || {};
  const within = o.within !== undefined ? o.within : o55NierWithin();
  if (patch == null) {
    if (!o55NierPv) return Promise.resolve(true);
    o55NierPreviewDrop();
  } else {
    const pv = Object.assign({}, o55NierPv || {});
    if (typeof patch.on === 'boolean') pv.on = patch.on;
    if (Array.isArray(patch.parts)) pv.parts = o55NierKeys(patch.parts);
    if (patch.background != null && O55_NIER_BACKGROUNDS.includes(String(patch.background))) pv.background = String(patch.background);
    o55NierPv = pv; o55NierPvLoose = false; o55NierPvProject = '';
    if (o.within !== undefined) o55NierPvWithin = o.within || null;
  }
  if (!o55NierReady()) return Promise.resolve(true); /* the first look pass paints it */
  if (o.instant) { o55NierPaintNow(); return Promise.resolve(true); }
  /* parts and background show at once; a changed switch runs the transition */
  o55NierWriteAttrs(); o55NierEmit();
  if (o55NierWanted() === o55NierIsPainted()) return Promise.resolve(true);
  return o55NierRun(undefined, { within, sound: o.sound, from: o.from, lines: o.lines, onReveal: o.onReveal }).then(() => true);
}
function o55NierPreviewing() {
  if (!o55NierPv) return null;
  const c = Object.assign({}, o55NierPv);
  if (Array.isArray(c.parts)) c.parts = c.parts.slice();
  if (o55NierPvLoose) c.loose = true;
  return c;
}
/* The look is saved with the new Project: the rows that differ from that Project's are written in one batch through
   the real settings path (commitSettingValues: atomic with a Settings owner), then the preview goes. What is painted
   already equals what is now stored, so nothing repaints. */
function o55NierCommitPreview() {
  const pv = o55NierPv; if (!pv) return true;
  if (!o55NierReady()) return false;
  const writes = {};
  if (typeof pv.on === 'boolean' && pv.on !== o55NierStoredOn()) writes['general.visual.nier-mode'] = pv.on;
  if (Array.isArray(pv.parts) && pv.parts.join(' ') !== o55NierStoredParts().join(' ')) writes['general.visual.nier-parts'] = o55NierLabels(pv.parts);
  if (pv.background && pv.background !== o55NierStoredBackground()) writes['general.visual.nier-background'] = pv.background;
  const ids = Object.keys(writes);
  if (ids.length) {
    if (!commitSettingValues(writes)) return false;
    saveState();
    ids.forEach(id => { refreshSettingRow(id); if (typeof o55Notify === 'function') o55Notify(id, writes[id]); });
  }
  o55NierPreviewDrop();
  /* the look pass runs only if a stored value changed (its key holds them); the attributes follow either way */
  o55ApplyLook();
  return true;
}
function o55NierLinger() {
  if (!o55NierPv) return false;
  o55NierPvLoose = true; o55NierPvWithin = null; o55NierPvProject = o55NierProjectId();
  return true;
}

/* ---------- the API ---------------------------------------------------------------------------------------------- */
function o55NierCommitRow(id, value) {
  const found = findSettingGlobal(id); if (!found) return false;
  if (!commitSettingValue(id, value)) return false;
  saveState(); refreshSettingRow(id);
  if (typeof o55Notify === 'function') o55Notify(id, value);
  return true;
}
function o55NierSet(on, opts) {
  o55NierNextRun = opts && opts.sound === false ? { sound: false } : null;
  const ok = o55NierCommitRow('general.visual.nier-mode', !!on);
  if (!ok) o55NierNextRun = null;
  return ok;
}
const o55NierSetParts = keys => o55NierCommitRow('general.visual.nier-parts', o55NierLabels(o55NierKeys(keys)));
const o55NierSetBackground = label => (O55_NIER_BACKGROUNDS.includes(String(label)) ? o55NierCommitRow('general.visual.nier-background', String(label)) : false);
const o55NierOnChange = cb => { if (typeof cb !== 'function') return () => {}; o55NierListeners.add(cb); return () => { o55NierListeners.delete(cb); }; };
/* A store: what the Plug-in Chips editor reads and writes. 'live' commits each change through Settings; 'preview'
   changes only the onboarding preview. Both read the request (the preview first), not the painted state. */
const o55NierStores = {};
function o55NierStore(kind) {
  const k = kind === 'preview' ? 'preview' : 'live', pv = k === 'preview';
  if (o55NierStores[k]) return o55NierStores[k];
  return (o55NierStores[k] = Object.freeze({
    kind: k,
    on: () => o55NierWanted(),
    set: on => (pv ? (o55NierPreview({ on: !!on }), true) : o55NierSet(on)),
    parts: () => o55NierParts(),
    setParts: keys => (pv ? (o55NierPreview({ parts: Array.isArray(keys) ? keys : [] }), true) : o55NierSetParts(keys)),
    background: () => o55NierBackground(),
    setBackground: label => (pv ? O55_NIER_BACKGROUNDS.includes(String(label)) && (o55NierPreview({ background: label }), true) : o55NierSetBackground(label)),
    BACKGROUNDS: O55_NIER_BACKGROUNDS,
    onChange: cb => o55NierOnChange(cb)
  }));
}
window.PM_NIER = Object.freeze({
  PARTS: O55_NIER_PARTS,
  BACKGROUNDS: O55_NIER_BACKGROUNDS,
  ready: () => o55NierReady(),
  on: () => !!o55NierIsPainted(),
  wanted: () => o55NierWanted(),
  parts: () => o55NierParts(),
  has: key => !!o55NierIsPainted() && o55NierParts().includes(key),
  keyFor: label => o55NierByLabel.get(String(label)) || null,
  labelFor: key => o55NierByKey.get(String(key)) || null,
  set: (on, opts) => o55NierSet(on, opts),
  setParts: keys => o55NierSetParts(keys),
  background: () => o55NierBackground(),
  setBackground: label => o55NierSetBackground(label),
  onChange: cb => o55NierOnChange(cb),
  setTransition: fn => { const prev = o55NierTransition === o55NierDefaultTransition ? null : o55NierTransition; o55NierTransition = typeof fn === 'function' ? fn : o55NierDefaultTransition; return prev; },
  /* inside the onboarding window while it previews (the chips editor's Play reboot moment plays there) */
  replay: () => {
    const step = async () => {
      let done = false; const on = !!o55NierIsPainted(), within = o55NierWithin();
      const repaint = () => { if (!done) { done = true; o55NierRepaintTheme(); } };
      const info = { on, reason: 'replay' }; if (within) info.within = within;
      try { await o55NierTransition(repaint, info); } catch (e) { /* decoration only */ } finally { repaint(); }
    };
    o55NierChain = o55NierChain.then(step, step);
    return o55NierChain;
  },
  notePick: family => o55NierNotePick(family),
  preview: (patch, opts) => o55NierPreview(patch, opts),
  previewing: () => o55NierPreviewing(),
  commitPreview: () => o55NierCommitPreview(),
  linger: () => o55NierLinger(),
  store: kind => o55NierStore(kind)
});
