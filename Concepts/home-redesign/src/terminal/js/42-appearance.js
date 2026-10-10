/* T.Appearance: one appearance model (D15). Each field resolves through four layers:
     1. look defaults ("Follow look"): the per-look scheme, font and effects,
     2. app default  (settings model key 'terminal.<field>', what Settings > Terminal binds later),
     3. project default (same keys under 'terminal.project.<field>'; written only by Settings),
     4. this tab     (the tab's own overrides, saved with the tab).
   A field left unset falls through. Everything applies live: no field needs a restart. The Appearance popover
   writes layer 4 ("This terminal") or layer 2 ("All terminals").
   The scheme catalog is shared with the code editor (D27): every scheme carries its 17 editor syntax colours
   (editorTokens), and the Retro look's dark scheme choice is read by the editor through retroPhosphor(). */
(function () {
  var C = T.color;

  var FONTS = {
    'jetbrains-mono': { label: 'JetBrains Mono', stack: "'JetBrains Mono', 'PM Symbols Mono', ui-monospace, Menlo, Consolas, monospace", size: 13, lineHeight: 1.3, licence: 'OFL-1.1' },
    'atkinson': { label: 'Atkinson Hyperlegible Mono', stack: "'Atkinson Hyperlegible Mono', 'JetBrains Mono', ui-monospace, monospace", size: 13, lineHeight: 1.35, weight: 400, licence: 'OFL-1.1' },
    'vt323': { label: 'VT323', stack: "'VT323', 'JetBrains Mono', ui-monospace, monospace", size: 19, lineHeight: 1.05, licence: 'OFL-1.1' },
    'departure': { label: 'Departure Mono', stack: "'Departure Mono', 'JetBrains Mono', ui-monospace, monospace", size: 13.75, lineHeight: 1.2, licence: 'OFL-1.1' },
    'sixtyfour': { label: 'Sixtyfour', stack: "'Sixtyfour', 'JetBrains Mono', ui-monospace, monospace", size: 10, lineHeight: 1.45, licence: 'OFL-1.1' },
    'sixtyfour-raster': { label: 'Sixtyfour Raster', stack: "'Sixtyfour Raster', 'Sixtyfour', 'JetBrains Mono', ui-monospace, monospace", size: 10, lineHeight: 1.45, licence: 'OFL-1.1' },
    'system': { label: 'System monospace', stack: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace", size: 13, lineHeight: 1.3, licence: 'system' }
  };

  /* Follow look: per-look defaults (light / dark). The scheme pairs are D15's. */
  var LOOKS = {
    friendly: { light: 'catppuccin-latte', dark: 'catppuccin-mocha', font: 'jetbrains-mono', cursorShape: 'block', blink: 'eased', trail: 'soft', dim: 0.18, focus: 'ring', bell: 'flash', background: 'soft', opacity: 1 },
    glass: { light: 'tokyo-night-day', dark: 'tokyo-night-storm', font: 'jetbrains-mono', cursorShape: 'bar', blink: 'eased', trail: 'glow', dim: 0.22, focus: 'rim', bell: 'rim', background: 'theme', opacity: 0.74, opacityLight: 0.7 },
    retro: { light: 'pm-paper-teletype', dark: 'pm-phosphor-green', font: 'vt323', cursorShape: 'block', blink: 'step', trail: 'phosphor', dim: 0.4, focus: 'rule', bell: 'inverse', background: 'theme', opacity: 1, scanlines: true, glow: true },
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
    fontWeight: { type: 'number', min: 400, max: 600, step: 100, default: 400, label: 'Weight' },
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
    sixtyfourScan: { type: 'number', min: -53, max: 100, step: 1, default: 0, label: 'Sixtyfour scan (native renderer only)' },
    sixtyfourBleed: { type: 'number', min: 0, max: 100, step: 1, default: 0, label: 'Sixtyfour bleed (native renderer only)' }
  };
  var DEFAULTS = {}; Object.keys(FIELDS).forEach(function (k) { DEFAULTS[k] = FIELDS[k].default; });

  /* ---- schemes ---- */
  var user = [];
  try { user = JSON.parse(localStorage.getItem('pm.home.terminal:v1:schemes') || '[]') || []; } catch (e) { user = []; }
  function allSchemes() { return (T.SCHEMES || []).concat(user); }
  function scheme(id) { var l = allSchemes(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function pairOf(s, mode) {
    if (!s || s.appearance === mode) return s;
    /* 'Imported' is where every import goes, not a family: an imported scheme has no sibling and stays as it is */
    if (s.family === 'Imported' || s.licence === 'user') return s;
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
  /* NieR rule (NIER-RULES-for-new-surfaces.md): the YoRHa schemes are built from the NieR tokens at runtime, so they
     follow NieR Mode's palette (and its editor) exactly; the JSON values are only the fallback when the tokens are
     absent. Every slot is a token or a mix of ink and parchment, so nothing leaves the ink-parchment line. */
  function nierTokens() {
    var cs = getComputedStyle(document.documentElement), g = function (n) { return cs.getPropertyValue(n).trim(); };
    var ink = g('--o55-nier-ink'), paper = g('--o55-nier-paper');
    if (!ink || !paper) return null;
    return { ink: ink, paper: paper, onInk: g('--o55-nier-on-ink'), termBg: g('--terminal-bg') || paper, termFg: g('--terminal-fg') || ink,
      cursor: g('--o55-nier-term-cursor') || ink, sel: g('--o55-nier-term-selection'), err: g('--o55-nier-error-text') || g('--o55-nier-error'),
      errB: g('--o55-nier-error'), ok: g('--o55-nier-ok-text') || g('--o55-nier-ok'), okB: g('--o55-nier-ok'), warn: g('--o55-nier-warn-text') || g('--o55-nier-warn'),
      warnB: g('--o55-nier-warn') };
  }
  function nierScheme(base, dark) {
    var t = nierTokens(); if (!t) return base;
    var H = function (v) { return C.toHex(C.hex(v)); };
    var bg = C.hex(t.termBg), fg = C.hex(t.termFg);
    var m = function (k) { return C.toHex(C.mix(fg, bg, k)); }; /* k: share of the background */
    var colors = {
      background: H(t.termBg), foreground: H(t.termFg), cursor: H(t.cursor), cursorText: H(t.termBg),
      selectionBackground: H(t.termFg), selectionForeground: H(t.termBg),
      ansi: [dark ? m(0.78) : H(t.termFg), H(t.err), H(t.ok), H(t.warn), m(0.10), m(0.22), m(0.30), m(0.36),
        m(0.48), H(t.err), H(t.okB), H(t.warnB), H(t.termFg), m(0.16), m(0.26), m(0.06)]
    };
    var roles = { link: H(t.termFg), searchMatch: H(t.sel || m(0.75)), searchCurrent: H(t.warnB), markOk: H(t.ok), markFail: H(t.err),
      markNeutral: m(0.36), progress: H(t.termFg), attention: H(t.warn) };
    return Object.assign({}, base, { colors: colors, roles: roles, nierBuilt: true });
  }
  function toTheme(s, opacity) {
    var c = s.colors, ansi = c.ansi;
    var bg = C.hex(c.background), fg = C.hex(c.foreground);
    var roles = s.roles || {};
    var hexOr = function (v, d) { return v ? C.hex(v) : d; };
    var yellow = C.hex(ansi[3]), bright = C.hex(ansi[11]);
    var dark = C.lum(bg) < 0.2;
    var theme = {
      id: s.id + '@' + (opacity || 1) + (s.nierBuilt ? ':' + c.background + c.foreground + c.ansi.join('') : ''), name: s.name, appearance: s.appearance || (dark ? 'dark' : 'light'),
      bg: bg, fg: fg, cursor: hexOr(c.cursor, fg), cursorText: c.cursorText ? C.hex(c.cursorText) : -1,
      selBg: hexOr(c.selectionBackground, C.mix(bg, fg, 0.25)), selFg: c.selectionForeground ? C.hex(c.selectionForeground) : -1,
      palette: C.palette256(ansi), bgAlpha: opacity === undefined ? 1 : opacity,
      searchMatch: hexOr(roles.searchMatch, C.mix(bg, yellow, dark ? 0.42 : 0.38)),
      searchCurrent: hexOr(roles.searchCurrent, C.mix(bg, bright, dark ? 0.75 : 0.62)),
      link: hexOr(roles.link, C.hex(ansi[dark ? 12 : 4])),
      /* phosphor and YoRHa schemes: colours outside the 16 (256-cube, truecolor) are mapped onto the phosphor or onto
         ink and parchment by brightness, so a program's 38;5;196 never paints red on a green tube or on parchment */
      mono: roles.glow ? { lo: bg, hi: C.hex(roles.glow), light: false } : s.nierBuilt || /^pm-yorha/.test(s.id) ? { lo: bg, hi: fg, light: C.lum(bg) > 0.2 } : null,
      duotone: s.nierBuilt || /^pm-yorha/.test(s.id) ? { ink: fg, paper: bg } : null,
      roles: {
        markOk: roles.markOk || ansi[2], markFail: roles.markFail || ansi[1], link: roles.link || ansi[dark ? 12 : 4],
        searchMatch: roles.searchMatch || C.toHex(C.mix(bg, yellow, 0.7)), glow: roles.glow || c.foreground,
        attention: roles.attention || ansi[3], progress: roles.progress || ansi[4]
      }
    };
    return theme;
  }

  /* ---- the editor's view of the catalog (D27) ---- */
  var EDITOR_TOKENS = ['kw', 'str', 'num', 'com', 'fn', 'ty', 'var', 'prop', 'op', 'pun', 'tag', 'attr', 'esc', 'mac', 'link', 'head', 'code'];
  /* a scheme without its own editor block (imported, user) takes one from its ANSI 16: n is the ANSI index, 'fg' the
     foreground. Fixed; the curated schemes carry their own from schemes/editor-syntax.json */
  var EDITOR_FROM_ANSI = { kw: 5, str: 2, num: 3, com: 8, fn: 4, ty: 6, 'var': 'fg', prop: 4, op: 'fg', pun: 'fg', tag: 1, attr: 3,
    esc: 6, mac: 5, link: 4, head: 4, code: 2 };
  function editorFromAnsi(colors) {
    var out = {};
    EDITOR_TOKENS.forEach(function (t) { var n = EDITOR_FROM_ANSI[t]; out[t] = String(n === 'fg' ? colors.foreground : colors.ansi[n]).toLowerCase(); });
    return out;
  }
  function editorTokens(id) {
    var s = scheme(id); if (!s) return null;
    var e = s.editor || editorFromAnsi(s.colors), out = {};
    EDITOR_TOKENS.forEach(function (t) { out[t] = e[t]; });
    return out;
  }
  /* the terminal colours of a scheme as the catalog holds them; cursor and selection fall back the way toTheme does */
  function palette(id) {
    var s = scheme(id); if (!s) return null;
    var c = s.colors;
    return { background: c.background, foreground: c.foreground, cursor: c.cursor || c.foreground,
      selection: c.selectionBackground || C.toHex(C.mix(C.hex(c.background), C.hex(c.foreground), 0.25)), ansi: c.ansi.slice() };
  }
  /* every scheme, curated then imported and user ones; pair is the sibling "Switch with light and dark" swaps to, or
     null when there is none */
  function catalog() {
    return allSchemes().map(function (s) {
      var p = pairOf(s, s.appearance === 'light' ? 'dark' : 'light');
      return { id: s.id, name: s.name, mode: s.appearance === 'light' ? 'light' : 'dark', pair: p && p.id !== s.id ? p.id : null };
    });
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
    /* the host model answers its registered default when nothing is stored there, and that is nobody's choice */
    var a = appGet(key), s = settings(), d = s && s.defaults ? s.defaults()['terminal.' + key] : undefined;
    if (a !== undefined && a !== null && (localApp[key] !== undefined || a !== d)) return 'app';
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
    if (s && /^pm-yorha/.test(s.id) && look.nier) s = nierScheme(s, s.appearance === 'dark');
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
    /* NieR: the trace is motion, so it needs an installed motion part (Scan sweep); Still and Colors only get none */
    if (lk === 'nier' && !/(^|\s)sweep(\s|$)/.test(document.documentElement.getAttribute('data-o55-nier-parts') || '')) trail = 'off';
    if (reduced) trail = 'off';

    /* background */
    var bg = { kind: bgKind };
    if (f('background') === 'follow' && lk === 'friendly') {
      /* Friendly's stage: a soft light from above over a gentle fall to the look's tint; 30-looks.css adds the recess
         under the header and the paper grain */
      var top = C.toHex(theme.bg), foot = C.toHex(C.mix(theme.bg, C.hex(mode === 'dark' ? '#3b3550' : '#f6e9f2'), mode === 'dark' ? 0.35 : 0.6));
      bg = { kind: 'gradient', soft: true, css: 'radial-gradient(120% 70% at 50% -8%, ' + (mode === 'dark' ? 'rgb(255 236 250 / .10)' : 'rgb(255 255 255 / .8)') +
        ', transparent 62%), linear-gradient(180deg, ' + top + ' 0%, ' + foot + ' 100%)' };
    }
    else if (bgKind === 'solid') bg.color = f('bgColor') || C.toHex(theme.bg);
    else if (bgKind === 'gradient') bg.css = GRADIENTS[f('bgGradient')] || GRADIENTS.dusk;
    else if (bgKind === 'image') { bg.url = T.Appearance.imageUrl(f('bgImage'), f('bgImageData'), f('bgBlur')); bg.dim = f('bgDim'); }
    if (f('background') === 'follow' && lk === 'nier') bg.paper = true;

    /* effects (D16): Theme (follow) is the look's own effects whatever the per-effect fields hold; ticking an effect in
       the popover switches to Custom first, so choosing Theme again undoes it */
    var custom = f('effects');
    var fxOff = custom === 'off', follow = custom !== 'custom' && !fxOff;
    var gl = function (k, lookDefault) { if (follow) return lookDefault; var v = f(k); return v === null || v === undefined ? lookDefault : v; };
    var crtOn = !fxOff && !follow && !!f('crt');
    var retroDark = lk === 'retro' && mode === 'dark';
    var effects = {
      look: lk, mode: mode, reduced: reduced, off: fxOff,
      /* Basic has no dimming of its own; turned on there, it dims as Friendly does (18 %) */
      dim: fxOff ? 0 : (gl('inactiveDim', L.dim > 0) ? (L.dim || 0.18) : 0),
      focus: L.focus, bell: f('bell') === 'off' ? 'off' : L.bell, blink: L.blink,
      trail: fxOff ? 'off' : trail,
      smoothScroll: !reduced && gl('smoothScroll', lk !== 'retro'),
      paper: false, /* NieR's ground is the page's grid (40-nier.css, part 'ground'), never a texture */
      scanlines: { on: !fxOff && gl('scanlines', retroDark && !!L.scanlines), strength: f('scanStrength'), period: 3 },
      glow: { on: !fxOff && gl('glow', retroDark && !!L.glow), strength: f('glowStrength'), radius: 2.5 },
      crt: crtOn,
      curvature: { on: crtOn, amount: f('curvature') },
      bezel: { on: crtOn, light: mode === 'light' }, vignette: { on: crtOn, strength: mode === 'light' ? 0.10 : 0.25 },
      burnIn: { on: crtOn && f('burnIn') && !reduced, persistMs: 450 },
      noise: { on: crtOn && f('noise') > 0 && !reduced, amount: f('noise') },
      flicker: { on: !fxOff && !follow && !!f('flicker') && !reduced, amount: Math.min(0.03, f('flickerAmount')) },
      glowColor: theme && theme.roles.glow
    };
    var bgShow = lk === 'glass' && bgKind === 'theme';
    /* High Contrast schemes keep every cell at 7:1 unless the user chose a floor themselves */
    var floor = f('minContrast');
    if (s && /^pm-high-contrast/.test(s.id) && layerOf(view, 'minContrast') === 'look') floor = 7;
    return {
      look: look, lookKey: lk, scheme: s, theme: theme, font: font, background: bg, effects: effects, glassThrough: bgShow,
      opts: { ligatures: f('ligatures'), minContrast: floor, boldBright: f('boldBright'),
        cursor: { shape: shape, blink: f('cursorBlink') && L.blink !== 'off' }, stickyHeader: f('stickyHeader'), copyOnSelect: f('copyOnSelect') },
      padding: { x: f('padding'), y: Math.max(2, Math.round(f('padding') * 0.6)) },
      sixtyfour: { scan: f('sixtyfourScan'), bleed: f('sixtyfourBleed') }
    };
  }

  /* The Retro look's dark scheme, 'green' or 'amber' (D27). It is not stored anywhere of its own: it is what Retro dark
     resolves to at the All terminals layers (project over app, the 'scheme' and 'schemePair' fields), so choosing
     PM Phosphor Amber for All terminals is the choice. Follow look, or any scheme that is not Amber, reads 'green'. */
  function retroPhosphor() {
    var sid = field(null, 'scheme'), s = sid === 'follow' ? null : scheme(sid);
    if (s && field(null, 'schemePair')) s = pairOf(s, 'dark');
    return (s ? s.id : LOOKS.retro.dark) === 'pm-phosphor-amber' ? 'amber' : 'green';
  }
  var events = new T.Emitter(), lastRetro = null;
  function checkRetro() {
    var now = retroPhosphor();
    if (lastRetro !== null && now !== lastRetro) { lastRetro = now; events.emit('retro-phosphor', now); }
    lastRetro = now;
  }

  /* ---- writes ---- */
  var views = new Set();
  var writing = 0; /* inside our own host writes: they refresh once when done, not once per key */
  function refreshAll() { views.forEach(function (v) { v.applyAppearance(resolve(v)); }); checkRetro(); }
  function set(scope, key, value, view) {
    if (scope === 'tab' && view) {
      view.tabAppearance = view.tabAppearance || {};
      if (value === null || value === undefined) delete view.tabAppearance[key]; else view.tabAppearance[key] = value;
      view.state.appearance = view.tabAppearance;
      view.applyAppearance(resolve(view));
      return;
    }
    var s = settings(), k = scope === 'project' ? 'terminal.project.' + key : 'terminal.' + key;
    if (s) { writing++; try { s.set(k, value); } catch (e) { console.warn('[pmt] settings write failed', e); } writing--; }
    if (scope !== 'project') {
      if (value === null || value === undefined) delete localApp[key]; else localApp[key] = value;
      try { localStorage.setItem('pm.home.terminal:v1:app', JSON.stringify(localApp)); } catch (e) {}
    }
    refreshAll();
  }
  function resetScope(scope, view) {
    if (scope === 'tab' && view) { view.tabAppearance = {}; view.state.appearance = {}; view.applyAppearance(resolve(view)); return; }
    writing++;
    Object.keys(FIELDS).forEach(function (k) { if (localApp[k] !== undefined) delete localApp[k]; var s = settings(); if (s) try { s.set('terminal.' + k, null); } catch (e) {} });
    writing--;
    try { localStorage.setItem('pm.home.terminal:v1:app', JSON.stringify(localApp)); } catch (e) {}
    refreshAll();
  }
  function preview(view, patch) { view.previewAppearance = patch; view.applyAppearance(resolve(view)); }
  function endPreview(view) { if (!view.previewAppearance) return; view.previewAppearance = null; view.applyAppearance(resolve(view)); }

  function addUserScheme(sch) {
    var id = 'user-' + String(sch.name || 'imported').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    var entry = { id: id, name: sch.name || 'Imported scheme', family: 'Imported', appearance: sch.appearance, licence: 'user', colors: sch.colors,
      editor: editorFromAnsi(sch.colors) };
    user = user.filter(function (u) { return u.id !== id; }); user.push(entry);
    try { localStorage.setItem('pm.home.terminal:v1:schemes', JSON.stringify(user)); } catch (e) {}
    return entry;
  }

  /* procedural background images (nothing fetched); blur is baked once into the image (element blur, never a
     backdrop blur, so the closed blur budget F3-431 is untouched) */
  var imgCache = new Map();
  function imageUrl(name, data, blur) {
    /* a chosen image is a reference ('img:<hash>') to the copy kept on this machine (76-popover.js); one that is gone
       (evicted, or named by another machine's settings) falls back to the default image. Resolved before the cache,
       whose key holds only the data's length, the same for every reference */
    if (name === 'custom' && data && data.indexOf('img:') === 0) {
      var stored = null;
      try { stored = localStorage.getItem('pm.home.terminal:v1:bg:' + data.slice(4)); } catch (e) {}
      if (stored) return stored;
      name = 'hills'; data = null;
    }
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
    setTabFont: function (view, o) { if (o.size) set('tab', 'fontSize', o.size, view); },
    /* D27: the catalog as the editor reads it (window.PMT.Appearance, 90-kind.js) */
    EDITOR_TOKENS: EDITOR_TOKENS, EDITOR_FROM_ANSI: EDITOR_FROM_ANSI, editorFromAnsi: editorFromAnsi,
    catalog: catalog, editorTokens: editorTokens, palette: palette, retroPhosphor: retroPhosphor,
    on: function (name, fn) { return events.on(name, fn); }
  };
  lastRetro = retroPhosphor();

  /* register with the host settings model so Settings > Terminal only binds controls later (CONTRACT section 12) */
  var PH = window.PM_HOME;
  if (PH && PH.settings && PH.settings.register) {
    try {
      var schema = {}; var defs = {};
      Object.keys(FIELDS).forEach(function (k) { schema['terminal.' + k] = FIELDS[k]; defs['terminal.' + k] = FIELDS[k].default; });
      PH.settings.register('terminal', schema, defs);
      /* the host emits one { key, value, old } object per change (Settings > Terminal, the only writer of the project layer) */
      if (PH.settings.on) PH.settings.on('*', function (e) {
        var k = e && typeof e === 'object' ? e.key : e;
        if (!writing && (!k || String(k).indexOf('terminal.') === 0)) refreshAll();
      });
    } catch (e) { console.warn('[pmt] settings registration failed', e); }
  }
})();
