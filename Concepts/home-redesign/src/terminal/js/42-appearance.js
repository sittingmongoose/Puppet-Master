/* T.Appearance: one appearance model (D15). Each field resolves through four layers:
     1. look defaults ("Follow theme"): the per-look scheme, font and effects,
     2. app default  (settings model key 'terminal.<field>', what Settings > Terminal binds later),
     3. project default (same keys under 'terminal.project.<field>'; written only by Settings),
     4. this tab     (the tab's own overrides, saved with the tab).
   A field left unset falls through. Everything applies live: no field needs a restart. The Appearance popover
   writes layer 4 ("This terminal") or layer 2 ("All terminals"). */
(function () {
  var C = T.color;

  var FONTS = {
    'jetbrains-mono': { label: 'JetBrains Mono', stack: "'JetBrains Mono', 'PM Symbols Mono', ui-monospace, Menlo, Consolas, monospace", size: 13, lineHeight: 1.3, licence: 'OFL-1.1' },
    'atkinson': { label: 'Atkinson Hyperlegible Mono', stack: "'Atkinson Hyperlegible Mono', 'JetBrains Mono', ui-monospace, monospace", size: 13, lineHeight: 1.35, weight: 400, licence: 'OFL-1.1' },
    'vt323': { label: 'VT323', stack: "'VT323', 'JetBrains Mono', ui-monospace, monospace", size: 19, lineHeight: 1.05, licence: 'OFL-1.1' },
    'departure': { label: 'Departure Mono', stack: "'Departure Mono', 'JetBrains Mono', ui-monospace, monospace", size: 13.75, lineHeight: 1.2, licence: 'OFL-1.1' },
    'sixtyfour': { label: 'Sixtyfour', stack: "'Sixtyfour', 'JetBrains Mono', ui-monospace, monospace", size: 10, lineHeight: 1.45, licence: 'OFL-1.1' },
    'system': { label: 'System monospace', stack: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace", size: 13, lineHeight: 1.3, licence: 'system' }
  };

  /* Follow theme: per-look defaults (light / dark). The scheme pairs are D15's. */
  var LOOKS = {
    friendly: { light: 'catppuccin-latte', dark: 'catppuccin-mocha', font: 'jetbrains-mono', cursorShape: 'block', blink: 'eased', trail: 'soft', dim: 0.18, focus: 'ring', bell: 'flash', background: 'soft', opacity: 1 },
    glass: { light: 'tokyo-night-day', dark: 'tokyo-night-storm', font: 'jetbrains-mono', cursorShape: 'bar', blink: 'eased', trail: 'glow', dim: 0.22, focus: 'rim', bell: 'rim', background: 'theme', opacity: 0.74, opacityLight: 0.7 },
    retro: { light: 'pm-paper-teletype', dark: 'pm-phosphor-green', font: 'vt323', cursorShape: 'block', blink: 'step', trail: 'phosphor', dim: 0.4, focus: 'inverse', bell: 'inverse', background: 'theme', opacity: 1, scanlines: true, glow: true },
    basic: { light: 'one-half-light', dark: 'one-half-dark', font: 'jetbrains-mono', cursorShape: 'block', blink: 'step', trail: 'off', dim: 0, focus: 'line', bell: 'marker', background: 'theme', opacity: 1 },
    nier: { light: 'pm-yorha-parchment', dark: 'pm-yorha-ink', font: 'jetbrains-mono', cursorShape: 'block', blink: 'step', trail: 'trace', dim: 0.32, focus: 'brackets', bell: 'snap', background: 'paper', opacity: 1 }
  };

  /* every field the model knows; Settings > Terminal binds these keys (SPEC.md lists them) */
  var FIELDS = {
    scheme: { type: 'enum', default: 'follow', label: 'Colour scheme' },
    schemePair: { type: 'bool', default: true, label: 'Switch with light and dark' },
    minContrast: { type: 'enum', values: [1, 3, 4.5, 7], default: 4.5, label: 'Minimum contrast' },
    font: { type: 'enum', values: Object.keys(FONTS).concat(['follow']), default: 'follow', label: 'Font' },
    fontSize: { type: 'number', min: 8, max: 32, step: 0.5, default: null, label: 'Size' },
    fontWeight: { type: 'number', min: 300, max: 600, step: 100, default: 400, label: 'Weight' },
    lineHeight: { type: 'number', min: 1, max: 2, step: 0.05, default: null, label: 'Line height' },
    letterSpacing: { type: 'number', min: -1, max: 3, step: 0.25, default: 0, label: 'Letter spacing' },
    ligatures: { type: 'bool', default: true, label: 'Ligatures' },
    boldBright: { type: 'bool', default: false, label: 'Bold text in bright colours' },
    cursorShape: { type: 'enum', values: ['follow', 'block', 'bar', 'underline'], default: 'follow', label: 'Cursor' },
    cursorBlink: { type: 'bool', default: true, label: 'Blink' },
    cursorTrail: { type: 'enum', values: ['follow', 'off', 'soft', 'glow', 'phosphor', 'trace'], default: 'follow', label: 'Trail' },
    background: { type: 'enum', values: ['follow', 'theme', 'solid', 'gradient', 'image'], default: 'follow', label: 'Background' },
    bgColor: { type: 'color', default: null, label: 'Colour' },
    bgGradient: { type: 'enum', values: ['dusk', 'dawn', 'deep', 'paper'], default: 'dusk', label: 'Gradient' },
    bgImage: { type: 'enum', values: ['hills', 'grid', 'paper', 'custom'], default: 'hills', label: 'Image' },
    bgImageData: { type: 'string', default: null, label: 'Custom image' },
    bgDim: { type: 'number', min: 0, max: 0.9, step: 0.05, default: 0.45, label: 'Dim' },
    bgBlur: { type: 'number', min: 0, max: 24, step: 1, default: 0, label: 'Blur' },
    opacity: { type: 'number', min: 0.4, max: 1, step: 0.02, default: null, label: 'Opacity' },
    padding: { type: 'number', min: 0, max: 24, step: 1, default: 8, label: 'Padding' },
    effects: { type: 'enum', values: ['follow', 'off', 'custom'], default: 'follow', label: 'Effects' },
    scanlines: { type: 'bool', default: null, label: 'Scanlines' },
    scanStrength: { type: 'number', min: 0, max: 0.6, step: 0.05, default: 0.3, label: 'Scanline strength' },
    glow: { type: 'bool', default: null, label: 'Phosphor glow' },
    glowStrength: { type: 'number', min: 0, max: 1, step: 0.05, default: 0.45, label: 'Glow strength' },
    crt: { type: 'bool', default: false, label: 'Full CRT' },
    curvature: { type: 'number', min: 0, max: 0.2, step: 0.01, default: 0.08, label: 'Curvature' },
    burnIn: { type: 'bool', default: true, label: 'Burn-in' },
    noise: { type: 'number', min: 0, max: 0.12, step: 0.005, default: 0.035, label: 'Noise' },
    flicker: { type: 'bool', default: false, label: 'Flicker' },
    flickerAmount: { type: 'number', min: 0, max: 0.03, step: 0.005, default: 0.02, label: 'Flicker amount' },
    inactiveDim: { type: 'bool', default: null, label: 'Dim inactive terminals' },
    smoothScroll: { type: 'bool', default: null, label: 'Smooth scrolling' },
    bell: { type: 'enum', values: ['follow', 'visual', 'off'], default: 'follow', label: 'Bell' },
    stickyHeader: { type: 'bool', default: true, label: 'Sticky command header' },
    copyOnSelect: { type: 'bool', default: false, label: 'Copy on select' },
    sixtyfourScan: { type: 'number', min: -53, max: 100, step: 1, default: 0, label: 'Sixtyfour scan' },
    sixtyfourBleed: { type: 'number', min: 0, max: 100, step: 1, default: 0, label: 'Sixtyfour bleed' }
  };
  var DEFAULTS = {}; Object.keys(FIELDS).forEach(function (k) { DEFAULTS[k] = FIELDS[k].default; });

  /* ---- schemes ---- */
  var user = [];
  try { user = JSON.parse(localStorage.getItem('pm.home.terminal:v1:schemes') || '[]') || []; } catch (e) { user = []; }
  function allSchemes() { return (T.SCHEMES || []).concat(user); }
  function scheme(id) { var l = allSchemes(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function pairOf(s, mode) {
    if (!s || s.appearance === mode) return s;
    /* the sibling of the same family in the other appearance, preferring the documented pairs */
    var PAIRS = { 'pm-phosphor-green': 'pm-paper-teletype', 'pm-phosphor-amber': 'pm-paper-teletype', 'pm-paper-teletype': 'pm-phosphor-green',
      'pm-yorha-ink': 'pm-yorha-parchment', 'pm-yorha-parchment': 'pm-yorha-ink', 'pm-high-contrast-dark': 'pm-high-contrast-light',
      'pm-high-contrast-light': 'pm-high-contrast-dark', 'catppuccin-latte': 'catppuccin-mocha', 'catppuccin-mocha': 'catppuccin-latte',
      'catppuccin-frappe': 'catppuccin-latte', 'catppuccin-macchiato': 'catppuccin-latte', 'tokyo-night-day': 'tokyo-night-storm',
      'tokyo-night-storm': 'tokyo-night-day', 'tokyo-night-night': 'tokyo-night-day', 'rose-pine-dawn': 'rose-pine-main', 'rose-pine-main': 'rose-pine-dawn', 'rose-pine-moon': 'rose-pine-dawn',
      'kanagawa-wave': 'kanagawa-lotus', 'kanagawa-lotus': 'kanagawa-wave' };
    var p = PAIRS[s.id] && scheme(PAIRS[s.id]);
    if (p && p.appearance === mode) return p;
    var l = allSchemes();
    for (var i = 0; i < l.length; i++) if (l[i].family === s.family && l[i].appearance === mode && l[i].id !== s.id) return l[i];
    return s;
  }
  function toTheme(s, opacity) {
    var c = s.colors, ansi = c.ansi;
    var bg = C.hex(c.background), fg = C.hex(c.foreground);
    var roles = s.roles || {};
    var hexOr = function (v, d) { return v ? C.hex(v) : d; };
    var yellow = C.hex(ansi[3]), bright = C.hex(ansi[11]);
    var dark = C.lum(bg) < 0.2;
    var theme = {
      id: s.id + '@' + (opacity || 1), name: s.name, appearance: s.appearance || (dark ? 'dark' : 'light'),
      bg: bg, fg: fg, cursor: hexOr(c.cursor, fg), cursorText: c.cursorText ? C.hex(c.cursorText) : -1,
      selBg: hexOr(c.selectionBackground, C.mix(bg, fg, 0.25)), selFg: c.selectionForeground ? C.hex(c.selectionForeground) : -1,
      palette: C.palette256(ansi), bgAlpha: opacity === undefined ? 1 : opacity,
      searchMatch: hexOr(roles.searchMatch, C.mix(bg, yellow, dark ? 0.42 : 0.38)),
      searchCurrent: hexOr(roles.searchCurrent, C.mix(bg, bright, dark ? 0.75 : 0.62)),
      link: hexOr(roles.link, C.hex(ansi[dark ? 12 : 4])),
      roles: {
        markOk: roles.markOk || ansi[2], markFail: roles.markFail || ansi[1], link: roles.link || ansi[dark ? 12 : 4],
        searchMatch: roles.searchMatch || C.toHex(C.mix(bg, yellow, 0.7)), glow: roles.glow || c.foreground,
        attention: roles.attention || ansi[3], progress: roles.progress || ansi[4]
      }
    };
    return theme;
  }

  /* ---- layers ---- */
  function settings() { return window.PM_HOME && window.PM_HOME.settings ? window.PM_HOME.settings : null; }
  var localApp = {};
  try { localApp = JSON.parse(localStorage.getItem('pm.home.terminal:v1:app') || '{}') || {}; } catch (e) { localApp = {}; }
  function appGet(key) {
    var s = settings();
    if (s) { try { var v = s.get('terminal.' + key); if (v !== undefined && v !== null) return v; } catch (e) {} }
    return localApp[key];
  }
  function projectGet(key) {
    var s = settings();
    if (s) { try { var v = s.get('terminal.project.' + key); if (v !== undefined && v !== null) return v; } catch (e) {} }
    return undefined;
  }
  function field(view, key) {
    var t = view && view.tabAppearance;
    if (view && view.previewAppearance && view.previewAppearance[key] !== undefined) return view.previewAppearance[key];
    if (t && t[key] !== undefined && t[key] !== null) return t[key];
    var p = projectGet(key); if (p !== undefined) return p;
    var a = appGet(key); if (a !== undefined && a !== null) return a;
    return DEFAULTS[key];
  }
  function layerOf(view, key) {
    if (view && view.tabAppearance && view.tabAppearance[key] !== undefined && view.tabAppearance[key] !== null) return 'tab';
    if (projectGet(key) !== undefined) return 'project';
    var a = appGet(key); if (a !== undefined && a !== null) return 'app';
    return 'look';
  }

  function lookKey(look) { return look.nier ? 'nier' : (LOOKS[look.family] ? look.family : 'basic'); }

  var GRADIENTS = {
    dusk: 'linear-gradient(160deg, #2a2340 0%, #1b2033 55%, #14161f 100%)',
    dawn: 'linear-gradient(160deg, #fbf3ea 0%, #f1ecf7 60%, #e9f1f6 100%)',
    deep: 'radial-gradient(120% 90% at 20% 0%, #23324a 0%, #12161f 70%)',
    paper: 'linear-gradient(180deg, #f3ecdc 0%, #ebe2cf 100%)'
  };

  function resolve(view) {
    var look = view && view.api && view.api.look ? Object.assign(T.look(), view.api.look()) : T.look();
    var lk = lookKey(look), L = LOOKS[lk], mode = look.mode;
    if (look.nier) mode = look.mode;
    var f = function (k) { return field(view, k); };

    /* scheme */
    var sid = f('scheme'), s;
    if (sid === 'follow' || !scheme(sid)) s = scheme(L[mode]) || scheme(mode === 'light' ? 'one-half-light' : 'one-half-dark');
    else { s = scheme(sid); if (f('schemePair')) s = pairOf(s, mode); }
    if (!s) s = (T.SCHEMES || [])[0];
    var bgKind = f('background'); if (bgKind === 'follow') bgKind = L.background === 'soft' || L.background === 'paper' ? 'theme' : L.background;
    var opacity = f('opacity');
    if (opacity === null || opacity === undefined) opacity = lk === 'glass' ? (mode === 'light' ? L.opacityLight || L.opacity : L.opacity) : 1;
    var theme = s ? toTheme(s, bgKind === 'theme' ? opacity : 0) : null;
    if (theme && bgKind !== 'theme') theme.bgAlpha = 0; /* the background layer shows through default cells */
    if (theme && lk === 'friendly' && bgKind === 'theme' && f('background') === 'follow') theme.bgAlpha = 0; /* Friendly's soft gradient */

    /* font */
    var fid = f('font'); if (fid === 'follow' || !FONTS[fid]) fid = L.font;
    var FD = FONTS[fid];
    var size = f('fontSize') || FD.size, lh = f('lineHeight') || FD.lineHeight;
    var font = { id: fid, family: FD.stack, size: size, weight: f('fontWeight') || FD.weight || 400, boldWeight: 700, lineHeight: lh,
      letterSpacing: f('letterSpacing') || 0, label: FD.label };

    /* cursor */
    var shape = f('cursorShape'); if (shape === 'follow') shape = L.cursorShape;
    var reduced = look.reduced;
    var trail = f('cursorTrail'); if (trail === 'follow') trail = L.trail;
    if (reduced) trail = 'off';

    /* background */
    var bg = { kind: bgKind };
    if (f('background') === 'follow' && lk === 'friendly') bg = { kind: 'gradient', css: mode === 'dark' ? 'linear-gradient(180deg, ' + C.toHex(theme.bg) + ' 0%, ' + C.toHex(C.mix(theme.bg, C.hex('#3b3550'), 0.35)) + ' 100%)' : 'linear-gradient(180deg, ' + C.toHex(theme.bg) + ' 0%, ' + C.toHex(C.mix(theme.bg, C.hex('#f6e9f2'), 0.6)) + ' 100%)', soft: true };
    else if (bgKind === 'solid') bg.color = f('bgColor') || C.toHex(theme.bg);
    else if (bgKind === 'gradient') bg.css = GRADIENTS[f('bgGradient')] || GRADIENTS.dusk;
    else if (bgKind === 'image') { bg.url = T.Appearance.imageUrl(f('bgImage'), f('bgImageData'), f('bgBlur')); bg.dim = f('bgDim'); }
    if (f('background') === 'follow' && lk === 'nier') bg.paper = true;

    /* effects (D16) */
    var custom = f('effects');
    var fxOff = custom === 'off';
    var gl = function (k, lookDefault) { var v = f(k); return v === null || v === undefined ? lookDefault : v; };
    var retroDark = lk === 'retro' && mode === 'dark';
    var effects = {
      look: lk, mode: mode, reduced: reduced, off: fxOff,
      dim: fxOff ? 0 : (gl('inactiveDim', L.dim > 0) ? L.dim : 0),
      focus: L.focus, bell: f('bell') === 'off' ? 'off' : L.bell, blink: L.blink,
      trail: fxOff ? 'off' : trail,
      smoothScroll: !reduced && gl('smoothScroll', lk !== 'retro'),
      paper: lk === 'nier' && !fxOff,
      scanlines: { on: !fxOff && gl('scanlines', retroDark && !!L.scanlines), strength: f('scanStrength'), period: 3 },
      glow: { on: !fxOff && gl('glow', retroDark && !!L.glow), strength: f('glowStrength'), radius: 2.5 },
      crt: !fxOff && !!f('crt'),
      curvature: { on: !fxOff && !!f('crt'), amount: f('curvature') },
      bezel: { on: !fxOff && !!f('crt') }, vignette: { on: !fxOff && !!f('crt'), strength: 0.25 },
      burnIn: { on: !fxOff && !!f('crt') && f('burnIn') && !reduced, persistMs: 450 },
      noise: { on: !fxOff && !!f('crt') && f('noise') > 0 && !reduced, amount: f('noise') },
      flicker: { on: !fxOff && !!f('flicker') && !reduced, amount: Math.min(0.03, f('flickerAmount')) },
      glowColor: theme && theme.roles.glow
    };
    var bgShow = lk === 'glass' && bgKind === 'theme';
    return {
      look: look, lookKey: lk, scheme: s, theme: theme, font: font, background: bg, effects: effects, glassThrough: bgShow,
      opts: { ligatures: f('ligatures'), minContrast: f('minContrast'), boldBright: f('boldBright'),
        cursor: { shape: shape, blink: f('cursorBlink') && L.blink !== 'off' }, stickyHeader: f('stickyHeader'), copyOnSelect: f('copyOnSelect') },
      padding: { x: f('padding'), y: Math.max(2, Math.round(f('padding') * 0.6)) },
      sixtyfour: { scan: f('sixtyfourScan'), bleed: f('sixtyfourBleed') }
    };
  }

  /* ---- writes ---- */
  var views = new Set();
  function refreshAll() { views.forEach(function (v) { v.applyAppearance(resolve(v)); }); }
  function set(scope, key, value, view) {
    if (scope === 'tab' && view) {
      view.tabAppearance = view.tabAppearance || {};
      if (value === null || value === undefined) delete view.tabAppearance[key]; else view.tabAppearance[key] = value;
      view.state.appearance = view.tabAppearance;
      view.applyAppearance(resolve(view));
      return;
    }
    var s = settings(), k = scope === 'project' ? 'terminal.project.' + key : 'terminal.' + key;
    if (s) { try { s.set(k, value); } catch (e) { console.warn('[pmt] settings write failed', e); } }
    if (scope !== 'project') {
      if (value === null || value === undefined) delete localApp[key]; else localApp[key] = value;
      try { localStorage.setItem('pm.home.terminal:v1:app', JSON.stringify(localApp)); } catch (e) {}
    }
    refreshAll();
  }
  function resetScope(scope, view) {
    if (scope === 'tab' && view) { view.tabAppearance = {}; view.state.appearance = {}; view.applyAppearance(resolve(view)); return; }
    Object.keys(FIELDS).forEach(function (k) { if (localApp[k] !== undefined) delete localApp[k]; var s = settings(); if (s) try { s.set('terminal.' + k, null); } catch (e) {} });
    try { localStorage.setItem('pm.home.terminal:v1:app', JSON.stringify(localApp)); } catch (e) {}
    refreshAll();
  }
  function preview(view, patch) { view.previewAppearance = patch; view.applyAppearance(resolve(view)); }
  function endPreview(view) { if (!view.previewAppearance) return; view.previewAppearance = null; view.applyAppearance(resolve(view)); }

  function addUserScheme(sch) {
    var id = 'user-' + String(sch.name || 'imported').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    var entry = { id: id, name: sch.name || 'Imported scheme', family: 'Imported', appearance: sch.appearance, licence: 'user', colors: sch.colors };
    user = user.filter(function (u) { return u.id !== id; }); user.push(entry);
    try { localStorage.setItem('pm.home.terminal:v1:schemes', JSON.stringify(user)); } catch (e) {}
    return entry;
  }

  /* procedural background images (nothing fetched); blur is baked once into the image (element blur, never a
     backdrop blur, so the closed blur budget F3-431 is untouched) */
  var imgCache = new Map();
  function imageUrl(name, data, blur) {
    var key = name + '|' + (data ? data.length : 0) + '|' + blur;
    if (imgCache.has(key)) return imgCache.get(key);
    var cv = document.createElement('canvas'); cv.width = 960; cv.height = 600;
    var g = cv.getContext('2d');
    if (name === 'custom' && data) { imgCache.set(key, data); return data; }
    if (blur) g.filter = 'blur(' + blur + 'px)';
    if (name === 'grid') {
      g.fillStyle = '#10131a'; g.fillRect(0, 0, 960, 600);
      g.strokeStyle = 'rgba(120,160,255,.16)'; g.lineWidth = 1;
      for (var x = 0; x < 960; x += 32) { g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, 600); g.stroke(); }
      for (var y = 0; y < 600; y += 32) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(960, y + .5); g.stroke(); }
    } else if (name === 'paper') {
      g.fillStyle = '#e9e1cc'; g.fillRect(0, 0, 960, 600);
      for (var i = 0; i < 9000; i++) { g.fillStyle = 'rgba(80,60,30,' + (Math.random() * 0.06) + ')'; g.fillRect(Math.random() * 960, Math.random() * 600, 1.5, 1.5); }
    } else {
      var gr = g.createLinearGradient(0, 0, 0, 600); gr.addColorStop(0, '#2b3557'); gr.addColorStop(0.55, '#6b5b7b'); gr.addColorStop(1, '#d08c6a');
      g.fillStyle = gr; g.fillRect(0, 0, 960, 600);
      [[0.62, '#3c3550'], [0.72, '#2c2840'], [0.84, '#1d1b2b']].forEach(function (h, k) {
        g.fillStyle = h[1]; g.beginPath(); g.moveTo(0, 600);
        for (var xx = 0; xx <= 960; xx += 40) g.lineTo(xx, 600 * h[0] + Math.sin(xx / (140 + k * 60) + k) * (26 + k * 10));
        g.lineTo(960, 600); g.closePath(); g.fill();
      });
    }
    var url = cv.toDataURL('image/jpeg', 0.86);
    imgCache.set(key, url);
    return url;
  }

  T.Appearance = {
    FIELDS: FIELDS, FONTS: FONTS, LOOKS: LOOKS, DEFAULTS: DEFAULTS, GRADIENTS: GRADIENTS,
    schemes: allSchemes, scheme: scheme, pairOf: pairOf, toTheme: toTheme,
    resolve: function (view) { if (view) views.add(view); return resolve(view); },
    forget: function (view) { views.delete(view); },
    get: field, layerOf: layerOf, set: set, reset: resetScope, preview: preview, endPreview: endPreview,
    refreshAll: refreshAll, addUserScheme: addUserScheme, imageUrl: imageUrl, lookKey: lookKey,
    setTabFont: function (view, o) { if (o.size) set('tab', 'fontSize', o.size, view); }
  };

  /* register with the host settings model so Settings > Terminal only binds controls later (CONTRACT section 12) */
  var PH = window.PM_HOME;
  if (PH && PH.settings && PH.settings.register) {
    try {
      var schema = {}; var defs = {};
      Object.keys(FIELDS).forEach(function (k) { schema['terminal.' + k] = FIELDS[k]; defs['terminal.' + k] = FIELDS[k].default; });
      PH.settings.register('terminal', schema, defs);
      if (PH.settings.on) PH.settings.on('*', function (key) { if (!key || String(key).indexOf('terminal.') === 0) refreshAll(); });
    } catch (e) { console.warn('[pmt] settings registration failed', e); }
  }
})();
