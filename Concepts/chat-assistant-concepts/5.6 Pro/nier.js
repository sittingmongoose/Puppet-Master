/* nier.js — NieR Mode for the 5.6 Pro concept: the engine, PMConcept7's contract, and the Demo Studio wiring.
 * OWNER: NieR Mode, step N-A (2026-10-02). Loads right after neon-icons.js (build.py MODULES), before app.js.
 *
 * Jared (2026-10-02): NieR Light and NieR Dark are Demo Studio themes for the whole concept, built on PMConcept7's
 * NieR Mode contract so that every rule ports to PMConcept7 unchanged. PMConcept7 is the source of truth (read only):
 * Concepts/onboarding/opus-5.5/src/settings/kit.d/18-nier.js (engine, PM_NIER, the 29 parts), 19/20-nier-*.js and
 * styles.d/13-17 (palette and parts), nier/ (theme JSON, fonts, scenes).
 *
 * How it works here. The two theme ids live in data.js (`nier-light`, `nier-dark`); state.theme keeps the chosen id
 * and persists with the other prefs. NieR Mode PAINTS BASIC: app.js asks window.PM56_NIER_PAINT(state.theme) for the
 * id it writes to <body data-theme>, and this answers basic-light / basic-dark for a NieR theme (every other id comes
 * back unchanged), writing the contract attributes on <html> in the same call, so a NieR rule never sees another
 * family and the attributes appear and disappear in the same task as the repaint.
 *
 * Attribute contract on <html> (PMConcept7's, verbatim; nothing is written while NieR Mode is off):
 *   data-o55-nier="on"                    NieR Mode is painted;
 *   data-o55-nier-parts="square cursor…"  the installed parts' keys, space separated, in PARTS order; match one with
 *                                         html[data-o55-nier-parts~="cursor"]. Present (maybe empty) only while on.
 *   data-o55-nier-scene=…                 owned by the scenes part (step N-B); this engine only reports background
 *                                         changes through onChange.
 * The palette (nier.css) sits at html[data-o55-nier="on"] body[data-theme="basic-…"], one step above the concept's
 * own body[data-theme] blocks (the theme attribute is on body in this concept, on html in PMConcept7).
 *
 * window.PM_NIER (PMConcept7's API, the one the parts code against):
 *   on() · parts() · has(key) · PARTS · keyFor(label) · labelFor(key) · set(on) · setParts(keys) · background() ·
 *   onChange(cb) · setTransition(fn) · replay() · notePick(family)
 * Here set(true) picks NieR in the current light or dark (Demo Studio's theme list is the real switch), set(false)
 * goes back to Basic in the same mode; parts and the background are kept in localStorage `pm56-nier` (per viewer, like
 * the other prefs), all 29 parts installed by default. notePick is a no-op: a theme picked here IS the switch.
 * window.PM_THEME_PAINT_FAMILY(family) answers 'basic' while NieR Mode is painted (PMConcept7's paint hook).
 *
 * Type: the two embedded faces (nier-fonts.js, generated) are added to document.fonts while NieR Mode is painted and
 * deleted when it is not; nier.css maps the concept's --font-ui and --font-mono to them under the contract.
 * Motion voice: NieR moves in Retro's stepped voice (app.js motionVoice() maps the nier family to 'retro'); nier.css
 * strips Retro's phosphor glow under the contract, because NieR never glows.
 * Performance: no timer, no observer, no rAF; everything is attributes written during the render that changes them.
 */
(function () {
  'use strict';
  var STORE = 'pm56-nier';
  var PARTS = Object.freeze([
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
  ].map(function (p) { return Object.freeze({ key: p[2], label: p[1], group: p[0] }); }));
  var KEYS = PARTS.map(function (p) { return p.key; });
  var BACKGROUNDS = ['None', 'City Ruins', 'Bunker', 'Desert', 'Forest Castle', 'Amusement Park', 'Flooded City', 'Follow the page'];
  var LABEL = 'NieR: Automata';

  /* ---------- the viewer's parts and background (localStorage, guarded: a private window may refuse it) ---------- */
  function load() {
    var v = null;
    try { v = JSON.parse(window.localStorage.getItem(STORE) || 'null'); } catch (e) { v = null; }
    var parts = v && Array.isArray(v.parts) ? KEYS.filter(function (k) { return v.parts.indexOf(k) >= 0; }) : KEYS.slice();
    var bg = v && BACKGROUNDS.indexOf(v.background) >= 0 ? v.background : 'City Ruins';
    return { parts: parts, background: bg };
  }
  var prefs = load();
  function save() { try { window.localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* per-viewer convenience only */ } }

  /* ---------- what is painted ------------------------------------------------------------------------------------ */
  var painted = false, mode = 'dark';
  var isNier = function (id) { return /^nier-(light|dark)$/.test(String(id || '')); };
  function writeAttrs() {
    var html = document.documentElement;
    if (painted) {
      if (html.getAttribute('data-o55-nier') !== 'on') html.setAttribute('data-o55-nier', 'on');
      var p = prefs.parts.join(' ');
      if (html.getAttribute('data-o55-nier-parts') !== p) html.setAttribute('data-o55-nier-parts', p);
    } else if (html.hasAttribute('data-o55-nier') || html.hasAttribute('data-o55-nier-parts')) {
      html.removeAttribute('data-o55-nier'); html.removeAttribute('data-o55-nier-parts');
    }
  }

  /* ---------- change events (PMConcept7's onChange shape) ------------------------------------------------------- */
  var listeners = [];
  var last = null;
  function snapshot() { return { on: painted, parts: prefs.parts.slice(), background: prefs.background, mode: painted ? mode : null }; }
  function emit(forced) {
    var snap = snapshot(), was = last, changed = [];
    if (was) {
      if (snap.on !== was.on) changed.push(snap.on ? 'on' : 'off');
      if (snap.parts.join(' ') !== was.parts.join(' ')) changed.push('parts');
      if (snap.background !== was.background) changed.push('background');
      if (snap.mode !== was.mode && snap.on === was.on) changed.push('mode');
    }
    last = snap;
    var reason = forced || changed[0] || null;
    if (!reason || (!was && !forced)) return;
    listeners.slice().forEach(function (cb) {
      try { cb(Object.assign({ reason: reason, changed: forced ? [forced] : changed.slice() }, snap, { parts: snap.parts.slice() })); }
      catch (e) { /* a listener never blocks the look */ }
    });
  }

  /* ---------- the faces (nier-fonts.js): in document.fonts only while NieR Mode is painted ------------------------ */
  /* The default themes' font set never holds them (pmx-verify's theme-font check lists every face the document
     carries); FontFace objects are made once and added or deleted with the paint. */
  var faces = null;
  function syncFaces() {
    var F = window.PM56_NIER_FACES, set = document.fonts;
    if (!F || !set || typeof window.FontFace !== 'function') return;
    if (!faces) {
      faces = [];
      F.forEach(function (f) { try { faces.push(new window.FontFace(f.family, f.src, { weight: f.weight, style: 'normal', display: 'swap' })); } catch (e) { /* a face that will not parse falls back to the stack */ } });
    }
    faces.forEach(function (f) {
      var has = set.has(f);
      if (painted && !has) set.add(f); else if (!painted && has) set.delete(f);
    });
  }

  /* ---------- the paint hook app.js calls while it writes <body data-theme> ------------------------------------- */
  /* Returns the id to paint: basic-<mode> for a NieR theme, the id itself otherwise. Idempotent per render. */
  var transition = null, running = false;
  window.PM56_NIER_PAINT = function (id) {
    var want = isNier(id), m = want ? String(id).slice(5) : mode;
    var turned = want !== painted;
    painted = want; mode = m;
    writeAttrs();
    if (turned || (painted && !faces)) syncFaces();
    if (last === null) { last = snapshot(); if (painted) Promise.resolve().then(function () { emit('init'); }); }
    else Promise.resolve().then(function () { emit(); });
    if (turned && transition && !running) runTransition(want);
    return want ? 'basic-' + m : id;
  };
  /* A registered transition (the reboot part, step N-B) animates around a repaint that has already happened here: the
     concept repaints inside its own render, so the transition's repaint() is a no-op kept for PMConcept7's shape. */
  function runTransition(on) {
    running = true;
    var done = false;
    var repaint = function () { done = true; };
    Promise.resolve().then(function () { return transition(repaint, { on: on, reason: on ? 'on' : 'off' }); })
      .catch(function () { /* decoration only */ })
      .then(function () { running = false; if (!done) repaint(); });
  }

  function ctx() { try { return window.PM56_EXT && window.PM56_EXT.ctx ? window.PM56_EXT.ctx() : null; } catch (e) { return null; } }
  function pick(id) {
    var D = window.PM56_DEMO; if (!D || typeof D.setTheme !== 'function') return false;
    D.setTheme(id);
    var c = ctx(); if (c && typeof c.savePrefs === 'function') c.savePrefs();
    return true;
  }
  function currentMode() {
    var t = document.body ? document.body.getAttribute('data-theme') || '' : '';
    return /-light$/.test(t) ? 'light' : 'dark';
  }

  window.PM_THEME_PAINT_FAMILY = function (family) { return painted ? 'basic' : family; };
  window.PM_THEME_PAINT_LABEL = function () { return painted ? LABEL : ''; };
  window.PM_NIER = Object.freeze({
    PARTS: PARTS,
    BACKGROUNDS: BACKGROUNDS,
    on: function () { return painted; },
    parts: function () { return prefs.parts.slice(); },
    has: function (key) { return painted && prefs.parts.indexOf(key) >= 0; },
    keyFor: function (label) { var p = PARTS.filter(function (x) { return x.label === String(label); })[0]; return p ? p.key : null; },
    labelFor: function (key) { var p = PARTS.filter(function (x) { return x.key === String(key); })[0]; return p ? p.label : null; },
    set: function (on) { return pick((on ? 'nier-' : 'basic-') + currentMode()); },
    setParts: function (keys) {
      var want = Array.isArray(keys) ? keys.map(String) : [];
      prefs.parts = KEYS.filter(function (k) { return want.indexOf(k) >= 0; });
      save(); writeAttrs(); emit();
      return true;
    },
    background: function () { return prefs.background; },
    setBackground: function (label) {
      if (BACKGROUNDS.indexOf(label) < 0) return false;
      prefs.background = label; save(); emit();
      return true;
    },
    onChange: function (cb) {
      if (typeof cb !== 'function') return function () {};
      listeners.push(cb);
      return function () { listeners = listeners.filter(function (x) { return x !== cb; }); };
    },
    setTransition: function (fn) { var prev = transition; transition = typeof fn === 'function' ? fn : null; return prev; },
    replay: function () {
      if (!transition || running) return Promise.resolve();
      runTransition(painted);
      return Promise.resolve();
    },
    notePick: function () { /* a theme picked in Demo Studio is itself the switch */ }
  });
})();
