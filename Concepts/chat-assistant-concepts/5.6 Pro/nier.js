/* nier.js — NieR Mode for the 5.6 Pro concept: the engine, PMConcept7's contract, and the Demo Studio wiring.
 * OWNER: NieR Mode, steps N-A (2026-10-02: engine, contract, paint hook) and N-B (2026-10-02: the transition path and
 * Demo Studio's parts manager and scene picker). Loads right after neon-icons.js (build.py MODULES), before app.js.
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
 *   onChange(cb) · setTransition(fn) · replay() · notePick(family), plus the concept's switchTo(themeId) and
 *   BACKGROUNDS / setBackground(label)
 * Here set(true) picks NieR in the current light or dark (Demo Studio's theme list is the real switch), set(false)
 * goes back to Basic in the same mode; parts and the background are kept in localStorage `pm56-nier` (per viewer, like
 * the other prefs), all 29 parts installed by default. notePick is a no-op: a theme picked here IS the switch.
 * Transition: setTransition(fn) registers fn(repaint, { on, reason }) (the reboot part); a person's switch across NieR
 * Mode's edge (Demo Studio's theme list, set(), switchTo()) runs it around the real repaint, the theme picked inside
 * repaint(); replay() runs it over an unchanged look. PM56_DEMO.setTheme (harnesses) stays instant and never covers.
 * Demo Studio: window.PM56_NIER_STUDIO(ctx) is the NieR section app.js puts under the theme list (the 29 parts as
 * PMConcept7's Plug-in Chips, presets, Play reboot moment, the background scenes), '' unless a NieR theme is painted;
 * its clicks are the PM56_EXT actions nier-part, nier-preset, nier-bg and nier-replay.
 * window.PM_THEME_PAINT_FAMILY(family) answers 'basic' while NieR Mode is painted (PMConcept7's paint hook).
 *
 * Type: the two embedded faces (nier-fonts.js, generated) are added to document.fonts while NieR Mode is painted and
 * deleted when it is not; nier.css maps the concept's --font-ui and --font-mono to them under the contract.
 * Motion voice: NieR moves in Retro's stepped voice (app.js motionVoice() maps the nier family to 'retro'); nier.css
 * strips Retro's phosphor glow under the contract, because NieR never glows.
 * Performance: no timer, no observer, no rAF; everything is attributes written during the render that changes them
 * (and one capture-phase change listener for Demo Studio's theme list).
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
      F.forEach(function (f) { try { faces.push(new window.FontFace(f.family, f.src, f.range ? { weight: f.weight, style: 'normal', display: 'swap', unicodeRange: f.range } : { weight: f.weight, style: 'normal', display: 'swap' })); } catch (e) { /* a face that will not parse falls back to the stack */ } });
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
    return want ? 'basic-' + m : id;
  };
  /* The transition (the reboot part, nier-parts.js) runs around a REAL repaint, PMConcept7's shape: switchTo() hands it
     repaint(), which picks the theme (Demo Studio's own setTheme + savePrefs), so the cover lands over the old look and
     the new one is painted under it. Only a person's switch goes through here (Demo Studio's theme list, PM_NIER.set,
     the manager's Play reboot moment); PM56_DEMO.setTheme stays instant, so harnesses that walk the themes never meet
     a cover. A transition that throws or never calls repaint() still repaints when it settles. */
  function runTransition(on, reason, repaint) {
    running = true;
    var done = false;
    var once = function () { if (done) return; done = true; repaint(); };
    return Promise.resolve().then(function () { return transition(once, { on: on, reason: reason }); })
      .catch(function () { /* decoration only */ })
      .then(function () { running = false; once(); });
  }
  function switchTo(id) {
    var want = isNier(id);
    if (want === painted || !transition || running) return Promise.resolve(pick(id));
    return runTransition(want, want ? 'on' : 'off', function () { pick(id); });
  }
  /* Demo Studio's theme list (app.js handleInput, k === 'theme'): a pick that crosses NieR Mode's edge is taken here in
     the capture phase and run through the transition; every other pick goes on to app.js unchanged. */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches('select[data-input="theme"]') || !transition) return;
    if (isNier(t.value) === painted) return;
    e.stopImmediatePropagation();
    switchTo(t.value);
  }, true);

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

  /* ---------- Demo Studio: the parts manager (PMConcept7's Plug-in Chips) and the scene picker ---------------------- */
  /* Shown in Demo Studio, under the theme list, only while a NieR theme is painted (app.js renderDemoDialog asks
     window.PM56_NIER_STUDIO(ctx); '' otherwise, so the default themes' dialog is byte-identical). Each of the 29 parts
     is a chip in its group, a click installs or removes it at once (PM_NIER.setParts, saved per viewer with the theme),
     four presets, Play reboot moment, and the background scenes as thumbnails (nier-scenes.js paints them). The styles
     are nier.css's Demo Studio section. The section is plain markup re-rendered with the dialog; actions are PM56_EXT
     actions, so app.js's click delegation reaches them before its own. */
  var HELP = {
    square: ['Square corners and fine ink lines everywhere.', 4], cursor: ['The row under the pointer becomes an ink bar with a small cursor.', 5],
    headers: ['Section titles in wide capitals over a ruled line.', 4], ground: ['A faint grid behind the whole concept.', 3],
    brackets: ['Four corner brackets mark keyboard focus, the chosen thread and a thread that needs you.', 5], diamonds: ['Spinners and the working mark become a turning diamond.', 3],
    reboot: ['A check list covers the screen while NieR Mode turns on or off.', 8], slice: ['Menus, pickers, dialogs and sheets open from a thin line.', 4],
    decode: ['Titles and labels unscramble.', 5], wipe: ['A quick band crosses the chat when you switch threads.', 4],
    particles: ['Small ink squares drift over the chat; alerts throw a few off.', 3], sweep: ['A faint scan line crosses the screen, and every alert.', 2],
    glitch: ['Warnings, refusals and failures arrive with a short jitter.', 4], sounds: ['Soft ticks and tones when you move and choose.', 5],
    voice: ['Notices and cards begin with Report, Alert or Proposal.', 3], pod: ['A small Pod hovers by the composer and delivers notices.', 6],
    pointer: ['The mouse pointer becomes a small ink square.', 2], boot: ['A short boot log when the concept opens in NieR Mode.', 5],
    readouts: ['The status bar reads like a unit’s status panel.', 4], blocks: ['The context meter, work and Orbit progress fill in blocks.', 3],
    charts: ['Charts in ink, told apart by patterns instead of colour.', 4], ticks: ['Map corner ticks and grid labels on cards.', 2],
    glyphs: ['A faint strip of machine script under headers.', 2], intel: ['Hover cards and tips become small intel cards.', 3],
    icons: ['Icons draw with square line ends.', 1], pod042: ['Adds Pod 042 to the personas in the composer.', 7],
    quests: ['A wide band when a plan is approved, a build finishes or a goal completes.', 5], empty: ['Small ink drawings on empty lists.', 4],
    save: ['Saving… and Data saved in the corner when a setting changes.', 2]
  };
  var PRESETS = [
    { id: 'full', label: 'Full install', help: 'Every part', keys: function () { return KEYS.slice(); } },
    { id: 'quiet', label: 'Quiet', help: 'No sounds, no Pod', keys: function () { return KEYS.filter(function (k) { return ['sounds', 'voice', 'pod', 'pod042'].indexOf(k) < 0; }); } },
    { id: 'still', label: 'Still', help: 'Nothing moves', keys: function () { return PARTS.filter(function (p) { return p.group !== 'Motion' && p.key !== 'pod' && p.key !== 'boot'; }).map(function (p) { return p.key; }); } },
    { id: 'colors', label: 'Colors only', help: 'Just ink and parchment', keys: function () { return []; } }
  ];
  var SCENE_KEY = { 'None': 'none', 'City Ruins': 'city', 'Bunker': 'bunker', 'Desert': 'desert', 'Forest Castle': 'forest',
    'Amusement Park': 'park', 'Flooded City': 'flooded', 'Follow the page': 'follow' };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var still = function () {
    return document.documentElement.getAttribute('data-motion') === 'reduced' || (document.body && document.body.classList.contains('pm56-reduced')) ||
      !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  function studio() {
    if (!painted) return '';
    if (window.PM56_NIER_SCENES) window.PM56_NIER_SCENES.thumbs();
    var have = prefs.parts, n = have.length, pre = '';
    PRESETS.forEach(function (p) { if (!pre && p.keys().join(' ') === have.join(' ')) pre = p.id; });
    var on = function (k) { return have.indexOf(k) >= 0; };
    var why = !on('reboot') ? 'Install Reboot moment to play it.' : still() ? 'Reduce motion is on, so it does not play.' : '';
    var chip = function (p) {
      var h = HELP[p.key] || ['', 1], inst = on(p.key);
      return '<button type="button" class="o55nc-chip" role="switch" aria-checked="' + inst + '" data-action="nier-part" data-key="' + p.key + '" aria-label="' + esc(p.label) + '">'
        + '<span class="o55nc-chip-pins" aria-hidden="true"><i></i><i></i><i></i></span><span class="o55nc-chip-copy"><span class="o55nc-chip-name">' + esc(p.label)
        + '</span><span class="o55nc-chip-help">' + esc(h[0]) + '</span><span class="o55nc-chip-foot"><span>Size ' + h[1] + '</span><span class="o55nc-chip-state">'
        + (inst ? 'Installed' : 'Removed') + '</span></span></span></button>';
    };
    var groups = ['Look', 'Motion', 'Sound & voice', 'Pointer', 'World'].map(function (g) {
      var ps = PARTS.filter(function (p) { return p.group === g; });
      var note = g === 'Motion' && still() ? '<p class="o55nc-note">Reduce motion is on, so these parts stay still. Your choices are kept for when it is off.</p>' : '';
      return '<section class="o55nc-group"><header class="o55nc-ghead"><h4>' + esc(g) + '</h4><span>' + ps.filter(function (p) { return on(p.key); }).length + ' / ' + ps.length
        + '</span></header>' + note + '<div class="o55nc-chips">' + ps.map(chip).join('') + '</div></section>';
    }).join('');
    var tiles = BACKGROUNDS.map(function (label) {
      var k = SCENE_KEY[label] || 'none';
      return '<button type="button" class="o55nc-scene" role="radio" aria-checked="' + (prefs.background === label) + '" data-action="nier-bg" data-value="' + esc(label) + '" data-key="' + k + '">'
        + '<span class="o55nc-scene-art o55ns-thumb" data-scene="' + k + '"></span><span class="o55nc-scene-name">' + esc(label) + '</span></button>';
    }).join('');
    return '<section class="demo-section o55nc-studio" style="margin-bottom:8px"><h3>NieR Mode · Plug-in Chips</h3><div class="demo-section-body o55nc" data-parts="' + have.join(' ') + '">'
      + '<div class="o55nc-top"><div class="o55nc-meter"><div class="o55nc-meter-head"><span>Storage</span><b>Installed ' + n + ' / ' + PARTS.length + '</b></div><div class="o55nc-meter-cells">'
      + PARTS.map(function (p, i) { return '<i' + (i < n ? ' class="on"' : '') + '></i>'; }).join('') + '</div></div>'
      + '<div class="o55nc-presets" role="group" aria-label="Presets">' + PRESETS.map(function (p) {
        return '<button type="button" class="o55nc-preset" aria-pressed="' + (p.id === pre) + '" data-action="nier-preset" data-value="' + p.id + '"><span>' + esc(p.label) + '</span><small>' + esc(p.help) + '</small></button>';
      }).join('') + '</div><div class="o55nc-replay-wrap"><button type="button" class="soft-button o55nc-replay" data-action="nier-replay" aria-disabled="' + (!!why) + '">Play reboot moment</button>'
      + (why ? '<p class="o55nc-replay-why">' + esc(why) + '</p>' : '') + '</div></div>'
      + groups
      + '<section class="o55nc-group o55nc-bg"><header class="o55nc-ghead"><h4>Background</h4><span>Behind the chat while NieR Mode is on</span></header><div class="o55nc-scenes" role="radiogroup" aria-label="NieR background">' + tiles + '</div></section>'
      + '</div></section>';
  }
  window.PM56_NIER_STUDIO = function () { try { return studio(); } catch (e) { return ''; } };
  var EXT = window.PM56_EXT;
  if (EXT && typeof EXT.action === 'function') {
    var rerender = function (c) { if (c && typeof c.renderOverlays === 'function') c.renderOverlays(); };
    EXT.action('nier-part', function (c, btn) {
      var k = btn && btn.dataset.key; if (KEYS.indexOf(k) < 0) return true;
      var want = prefs.parts.slice(), i = want.indexOf(k);
      if (i >= 0) want.splice(i, 1); else want.push(k);
      window.PM_NIER.setParts(want); rerender(c);
      return true;
    });
    EXT.action('nier-preset', function (c, btn) {
      var p = PRESETS.filter(function (x) { return x.id === (btn && btn.dataset.value); })[0];
      if (p) { window.PM_NIER.setParts(p.keys()); rerender(c); }
      return true;
    });
    EXT.action('nier-bg', function (c, btn) {
      var v = btn && btn.dataset.value;
      if (v && v !== prefs.background && window.PM_NIER.setBackground(v)) rerender(c);
      return true;
    });
    EXT.action('nier-replay', function (c, btn) {
      if (btn && btn.getAttribute('aria-disabled') !== 'true') window.PM_NIER.replay();
      return true;
    });
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
    set: function (on) { switchTo((on ? 'nier-' : 'basic-') + currentMode()); return true; },
    switchTo: function (id) { return switchTo(String(id || '')); },
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
      return runTransition(painted, 'replay', function () { /* nothing changes: the cover plays over the same look */ });
    },
    notePick: function () { /* a theme picked in Demo Studio is itself the switch */ }
  });
})();
