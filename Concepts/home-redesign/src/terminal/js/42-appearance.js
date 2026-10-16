/* T.Appearance: one appearance model (D15, F3-642). Each field resolves through these layers, highest first:
     1. this tab      (the tab's own overrides, saved with the tab: the Customize screen's "This terminal"),
     2. Settings      (the Project's Terminal look rows, code.terminal.*, SSYS-051, through window.PM_TERMINAL_SETTINGS:
                       Settings > Editor & Terminal and the Customize screen's "All terminals" both write them),
     3. project/app   (the earlier stores: 'terminal.project.<field>' and 'terminal.<field>' in the host settings model,
                       and this machine's local copy; read beneath Settings, written only where Settings is absent),
     4. look defaults ("Follow look"): the per-look scheme, font and effects.
   A field left unset falls through. Everything applies live: no field needs a restart.
   The scheme catalog is shared with the code editor (D30): every scheme carries its 17 editor syntax colours
   (editorTokens), and the Retro look's dark scheme choice is read by the editor through retroPhosphor(). */
(function () {
  var C = T.color;

  /* weights: the range the face is drawn in (Settings' Terminal Text Weight help: JetBrains Mono 100 to 800, Atkinson
     Hyperlegible Mono 200 to 800; Jared 2026-10-14: JetBrains Mono keeps its full range, so its Latin file runs 100-800,
     opus-5.5 src/fonts/SOURCE.md); a face without it has one weight */
  var FONTS = {
    /* drawn: where the face's own steps sit too close at text size, the weight its variable axis is drawn at (round 4,
       Q15 #6: JetBrains Mono's Semibold and Bold were the closest pair in every look; 580 and 720 space its eight evenly) */
    'jetbrains-mono': { label: 'JetBrains Mono', stack: "'JetBrains Mono', 'PM Symbols Mono', ui-monospace, Menlo, Consolas, monospace", size: 13, lineHeight: 1.3, weights: [100, 800], drawn: { 600: 580, 700: 720 }, licence: 'OFL-1.1' },
    'atkinson': { label: 'Atkinson Hyperlegible Mono', stack: "'Atkinson Hyperlegible Mono', 'JetBrains Mono', ui-monospace, monospace", size: 13, lineHeight: 1.35, weight: 400, weights: [200, 800], licence: 'OFL-1.1' },
    'vt323': { label: 'VT323', stack: "'VT323', 'JetBrains Mono', ui-monospace, monospace", size: 19, lineHeight: 1.05, licence: 'OFL-1.1' },
    'departure': { label: 'Departure Mono', stack: "'Departure Mono', 'JetBrains Mono', ui-monospace, monospace", size: 13.75, lineHeight: 1.2, licence: 'OFL-1.1' },
    'sixtyfour': { label: 'Sixtyfour', stack: "'Sixtyfour', 'JetBrains Mono', ui-monospace, monospace", size: 10, lineHeight: 1.45, axes: true, licence: 'OFL-1.1' },
    'sixtyfour-raster': { label: 'Sixtyfour Raster', stack: "'Sixtyfour Raster', 'Sixtyfour', 'JetBrains Mono', ui-monospace, monospace", size: 10, lineHeight: 1.45, licence: 'OFL-1.1' },
    'system': { label: 'System monospace', stack: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace", size: 13, lineHeight: 1.3, weights: [400, 700], licence: 'system' }
  };
  /* A face named by an earlier Settings value (Fira Code, SF Mono, or a name typed under Custom...): F3-644 removed them
     as choices, so nothing offers them, but a stored one is drawn from this computer's own fonts when it has the face,
     like System monospace, and reads "not on this computer" when it does not (the stack then shows JetBrains Mono) */
  var localFaces = {};
  function localFont(name) {
    var n = String(name || '').replace(/["'\\;{}<>]/g, '').trim().slice(0, 64);
    if (!n) return null;
    if (!localFaces[n]) localFaces[n] = { label: n, stack: "'" + n + "', 'JetBrains Mono', 'PM Symbols Mono', ui-monospace, monospace", size: 13, lineHeight: 1.3, weights: [400, 700], local: true, licence: 'system' };
    return localFaces[n];
  }
  function fontDef(id) {
    if (FONTS[id]) return FONTS[id];
    if (typeof id === 'string' && id.indexOf('local:') === 0) return localFont(id.slice(6));
    return null;
  }
  /* is a local face installed? its text measures differently from the generic fallback in two generics */
  var installed = {};
  function hasLocalFace(name) {
    if (installed[name] !== undefined) return installed[name];
    var cv = document.createElement('canvas').getContext('2d'), s = 'mmmmmmmmmmlli10WQ@', w = function (f) { cv.font = '32px ' + f; return cv.measureText(s).width; };
    var q = "'" + name + "'";
    installed[name] = w(q + ', monospace') !== w('monospace') || w(q + ', serif') !== w('serif');
    return installed[name];
  }
  /* Sixtyfour's own SCAN and BLED axes (Settings' Sixtyfour Scanlines and Sixtyfour Bleed): an instance of the page's
     Sixtyfour faces with those axes set, as a FontFace of its own (the grid is a canvas, which reads no
     font-variation-settings); made once per pair, the faces' own unicode ranges kept */
  var axisFaces = {};
  function sixtyfourFamily(scan, bleed) {
    var s = Math.round(T.util.clamp(scan || 0, -53, 100)), b = Math.round(T.util.clamp(bleed || 0, 0, 100));
    var fam = 'PMT Sixtyfour S' + (s < 0 ? 'm' + -s : s) + ' B' + b;
    if (axisFaces[fam] !== undefined) return axisFaces[fam] ? fam : null;
    axisFaces[fam] = false;
    if (typeof FontFace === 'undefined' || !document.fonts) return null;
    var made = 0;
    try {
      [].forEach.call(document.styleSheets, function (ss) {
        var rules; try { rules = ss.cssRules; } catch (e) { return; }
        [].forEach.call(rules || [], function (r) {
          if (r.type !== 5 || !/^["']?Sixtyfour["']?$/.test(r.style.getPropertyValue('font-family').trim())) return;
          var src = r.style.getPropertyValue('src'); if (!src) return;
          var d = { variationSettings: '"SCAN" ' + s + ', "BLED" ' + b };
          var ur = r.style.getPropertyValue('unicode-range'); if (ur) d.unicodeRange = ur;
          try { document.fonts.add(new FontFace(fam, src, d)); made++; } catch (e) {}
        });
      });
    } catch (e) {}
    axisFaces[fam] = made > 0;
    return made ? fam : null;
  }

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
    fontWeight: { type: 'number', min: 100, max: 800, step: 100, default: 400, label: 'Weight' },
    lineHeight: { type: 'number', min: 1, max: 2, step: 0.05, default: null, label: 'Line height' },
    letterSpacing: { type: 'number', min: -1, max: 3, step: 0.25, default: 0, label: 'Letter spacing' },
    ligatures: { type: 'bool', default: true, label: 'Ligatures' },
    boldBright: { type: 'bool', default: false, label: 'Bold text in bright colours' },
    /* Settings' Font Rendering (Text drawing): Crisp draws the text at a whole number of device pixels with hard edges
       (24-renderer.js, round 5), Smooth draws the outlines unhinted (canvas textRendering geometricPrecision); Auto is the
       browser's own */
    fontRendering: { type: 'enum', values: ['auto', 'crisp', 'smooth'], default: 'auto', label: 'Text drawing' },
    cursorShape: { type: 'enum', values: ['follow', 'block', 'bar', 'underline'], default: 'follow', label: 'Cursor' },
    cursorBlink: { type: 'bool', default: true, label: 'Blink' },
    cursorTrail: { type: 'enum', values: ['follow', 'off', 'soft', 'glow', 'phosphor', 'trace'], default: 'follow', label: 'Trail' },
    background: { type: 'enum', values: ['follow', 'theme', 'solid', 'gradient', 'image'], default: 'follow', label: 'Background' },
    bgColor: { type: 'color', default: null, label: 'Colour' },
    /* round 2: the gradients and pictures are T.Grounds' recipes (43-grounds.js); the earlier ids (dusk, dawn, deep and
       paper; hills, grid, paper) keep their meaning as recipes of the scheme */
    bgGradient: { type: 'enum', values: null, default: 'fade', label: 'Gradient' },
    bgImage: { type: 'enum', values: null, default: 'hills', label: 'Image' },
    bgImageData: { type: 'string', default: null, label: 'Custom image' },
    /* Dim: Auto (null) lays just enough of the scheme's ground over a picture to keep the text readable; a chosen dim
       never goes under that */
    bgDim: { type: 'number', min: 0, max: 0.9, step: 0.05, default: null, label: 'Dim' },
    bgBlur: { type: 'number', min: 0, max: 24, step: 1, default: 0, label: 'Blur' },
    /* round 2 (research: one strength scaled to what stays readable; size for patterns; motion off, gentle or lively;
       a picture's fit and desaturation) */
    bgStrength: { type: 'number', min: 0, max: 1, step: 0.05, default: 1, label: 'Strength' },
    bgScale: { type: 'enum', values: ['fine', 'medium', 'coarse'], default: 'medium', label: 'Size' },
    bgMotion: { type: 'enum', values: ['off', 'gentle', 'lively'], default: 'gentle', label: 'Motion' },
    bgFit: { type: 'enum', values: ['cover', 'contain', 'tile', 'center'], default: 'cover', label: 'Fit' },
    /* round 4: half by default, one of the three stops Customize offers (full colour, half, grey; Q15 #4) */
    bgDesat: { type: 'number', min: 0, max: 1, step: 0.05, default: 0.5, label: 'Desaturate' },
    opacity: { type: 'number', min: 0.4, max: 1, step: 0.02, default: null, label: 'Opacity' },
    /* none by default (Jared, 2026-10-14: "Default padding should be 0"); a bezel brings its own margin */
    padding: { type: 'number', min: 0, max: 24, step: 1, default: 0, label: 'Padding' },
    /* the housing round the screen (Jared, 2026-10-14: removable, customizable; round 3: "still really ugly", so a real
       monitor case, 71-bezel.js): its own choice, never part of a look's defaults, drawn with or without the GPU. Width
       null is the style's own; Reflection null is the material's own level (how much of the screen its surface gives back) */
    bezel: { type: 'enum', values: ['off', 'rim', 'case'], default: 'off', label: 'Bezel' },
    bezelWidth: { type: 'number', min: 2, max: 48, step: 1, default: null, label: 'Bezel width' },
    bezelColor: { type: 'enum', values: ['follow', 'charcoal', 'black', 'platinum', 'putty', 'aluminium', 'gunmetal', 'glass', 'accent'], default: 'follow', label: 'Bezel material' },
    /* round 4 (Q15): four levels, each material starting at its own (null); a number stored by round 3's slider reads as
       the nearest level (71-bezel.js) */
    bezelReflect: { type: 'enum', values: ['off', 'low', 'medium', 'high'], default: null, label: 'Reflection' },
    effects: { type: 'enum', values: ['follow', 'off', 'custom'], default: 'follow', label: 'Effects' },
    scanlines: { type: 'bool', default: null, label: 'Scanlines' },
    scanStrength: { type: 'number', min: 0, max: 0.6, step: 0.05, default: 0.3, label: 'Scanline strength' },
    glow: { type: 'bool', default: null, label: 'Phosphor glow' },
    glowStrength: { type: 'number', min: 0, max: 1, step: 0.05, default: 0.45, label: 'Glow strength' },
    crt: { type: 'bool', default: false, label: 'Full CRT' },
    /* round 2: the edge sag is Curvature x 0.125 (50-fx-gl.js), subtle by default; the phosphor mask is Full CRT's own
       choice (an aperture grille three device px to a triad, at any density since round 4) */
    curvature: { type: 'number', min: 0, max: 0.2, step: 0.01, default: 0.04, label: 'Curvature' },
    crtMask: { type: 'bool', default: false, label: 'Phosphor mask' },
    burnIn: { type: 'bool', default: true, label: 'Burn-in' },
    noise: { type: 'number', min: 0, max: 0.12, step: 0.005, default: 0.035, label: 'Noise' },
    /* on or off, at one faint, safe level (Jared, 2026-10-16, P10: the amount slider and its Settings row are retired; an
       amount stored by them reads as Flicker on, see legacy() below) */
    flicker: { type: 'bool', default: false, label: 'Flicker' },
    inactiveDim: { type: 'bool', default: null, label: 'Dim inactive terminals' },
    smoothScroll: { type: 'bool', default: null, label: 'Smooth scrolling' },
    /* Follow look or Off (Jared, 2026-10-16, P14: Visual drew what Follow look draws in every look and is retired; a
       stored Visual reads as Follow look) */
    bell: { type: 'enum', values: ['follow', 'off'], default: 'follow', label: 'Bell' },
    stickyHeader: { type: 'bool', default: true, label: 'Sticky command header' },
    copyOnSelect: { type: 'bool', default: false, label: 'Copy on select' },
    /* Sixtyfour's own axes, drawn through an instance of the face (sixtyfourFamily); none until someone sets them */
    sixtyfourScan: { type: 'number', min: -53, max: 100, step: 1, default: null, label: 'Sixtyfour scanlines' },
    sixtyfourBleed: { type: 'number', min: 0, max: 100, step: 1, default: null, label: 'Sixtyfour bleed' }
  };
  var DEFAULTS = {}; Object.keys(FIELDS).forEach(function (k) { DEFAULTS[k] = FIELDS[k].default; });
  /* Flicker's one level: canon's default, under its 3 % cap (P10) */
  var FLICKER_AMOUNT = 0.02;
  /* fields with no Settings row: none since round 5, when the bezel, background and mask rows were admitted (the Plans
     pass's code.terminal.background-strength ... phosphor-mask). Until a Project's Settings carries a row, "All
     terminals" still keeps that field on this computer (setMany asks the bridge whether it has the row) */
  var LOCAL_FIELDS = [];

  /* ---- the Settings rows (SSYS-051, the Terminal look groups): one row per field, its stored words to and from the
     field's value. in() returns undefined for a value it cannot read (the field then falls through) and null for an
     explicit Follow look. Rows that never change a look (Rendering Mode, Performance Mode, Shell Integration, the
     shell, layout and history rows) are not read here. ---- */
  var S = 'code.terminal.', FOLLOW = 'Follow look';
  var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  function num(min, max, step) {
    return function (v) {
      if (v === null || v === undefined || v === '' || typeof v === 'boolean') return undefined;
      var n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
      if (!isFinite(n) || !/^\s*-?[\d.,]+\s*(px|%)?\s*$/.test(String(v))) return undefined;
      n = Math.min(max, Math.max(min, n));
      /* to the step, without the binary remainder (1.45 stays 1.45, not 1.4500000000000002) */
      return +(step ? Math.round(n / step) * step : n).toFixed(4);
    };
  }
  function bool(v) { if (v === true || v === 'true' || v === 'On' || v === 'on') return true; if (v === false || v === 'false' || v === 'Off' || v === 'off') return false; return undefined; }
  function tri(v) { if (v === FOLLOW || v === 'follow') return null; return bool(v); }
  function triOut(v) { return v === null || v === undefined ? FOLLOW : v ? 'On' : 'Off'; }
  function words(map) {
    var inv = {}; Object.keys(map).forEach(function (k) { if (!has(inv, String(map[k]))) inv[String(map[k])] = k; });
    return {
      in: function (v) { var k = String(v); if (has(map, k)) return map[k]; var lo = k.toLowerCase(); for (var m in map) if (m.toLowerCase() === lo) return map[m]; return undefined; },
      out: function (v) { return has(inv, String(v)) ? inv[String(v)] : undefined; }
    };
  }
  function lazyWords(make) { var w = null; return { in: function (v) { return (w = w || words(make())).in(v); }, out: function (v) { return (w = w || words(make())).out(v); } }; }
  function groundWords(gradients, legacy) {
    var m = Object.assign({}, legacy);
    if (T.Grounds) T.Grounds.list().forEach(function (d) { if (T.Grounds.isGradient(d.id) === gradients && !has(m, d.name)) m[d.name] = d.id; });
    return m;
  }
  var same = function (v) { return v; };
  function colorIn(v) { var s = String(v || '').trim(); if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return undefined; return s.length === 4 ? '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3] : s.toLowerCase(); }
  /* the scheme: Follow look or a catalog id (F3-642); the earlier words still read: Match App Theme is Follow look,
     Light and Dark are the look's own light or dark scheme whatever the app's mode, Solarized and High Contrast their
     family (switching with light and dark), a name the scheme's own, and Custom the scheme named under it */
  function schemeIn(v, custom) {
    var k = String(v || '').trim();
    if (!k) return undefined;
    if (k === FOLLOW || /^match app theme$/i.test(k) || k === 'follow') return 'follow';
    if (/^light$/i.test(k)) return 'follow:light';
    if (/^dark$/i.test(k)) return 'follow:dark';
    if (/^solarized$/i.test(k)) return 'solarized-dark';
    if (/^high contrast$/i.test(k)) return 'pm-high-contrast-dark';
    if (/^custom$/i.test(k)) k = String(custom || '').replace(/\.[a-z0-9]+$/i, '').trim();
    if (!k) return undefined;
    if (scheme(k)) return k;
    var lo = k.toLowerCase(), l = allSchemes();
    for (var i = 0; i < l.length; i++) if (l[i].name.toLowerCase() === lo || l[i].id.toLowerCase() === lo) return l[i].id;
    return undefined;
  }
  function schemeOut(v) { return v === 'follow' ? FOLLOW : v === 'follow:light' ? 'Light' : v === 'follow:dark' ? 'Dark' : scheme(v) ? v : undefined; }
  var FACE_WORDS = { 'System Monospace': 'system', 'System monospace': 'system', 'JetBrains Mono': 'jetbrains-mono', 'Atkinson Hyperlegible Mono': 'atkinson',
    'VT323': 'vt323', 'Departure Mono': 'departure', 'Sixtyfour': 'sixtyfour', 'Sixtyfour Raster': 'sixtyfour-raster' };
  function fontIn(v, custom) {
    var k = String(v || '').trim();
    if (!k) return undefined;
    if (k === FOLLOW || k === 'follow') return 'follow';
    if (FONTS[k]) return k;
    if (has(FACE_WORDS, k)) return FACE_WORDS[k];
    if (/^custom/i.test(k)) return custom ? 'local:' + localFont(custom).label : undefined;
    return localFont(k) ? 'local:' + localFont(k).label : undefined; /* Fira Code, SF Mono: this computer's own face */
  }
  function fontOut(v) { return v === 'follow' ? FOLLOW : FONTS[v] ? v : undefined; }
  /* a picture is kept on this machine under a hash (76-popover.js); Settings holds the name it was chosen under, and
     that name finds the copy again. A path typed in Settings names no copy here and falls back to the default picture */
  var NAMES = 'pm.home.terminal:v1:bg-names';
  function picNames() { try { return JSON.parse(localStorage.getItem(NAMES) || '{}') || {}; } catch (e) { return {}; } }
  function pictureIn(v) {
    var k = String(v || '').trim(); if (!k) return undefined;
    if (/^img:[0-9a-f]+$/.test(k)) return k;
    var n = picNames(), base = k.split(/[\\/]/).pop();
    return has(n, k) ? 'img:' + n[k] : has(n, base) ? 'img:' + n[base] : 'path:' + k;
  }
  function pictureOut(v) {
    var k = String(v || ''); if (k.indexOf('path:') === 0) return k.slice(5);
    if (k.indexOf('img:') !== 0) return undefined;
    var n = picNames(), h = k.slice(4);
    for (var name in n) if (n[name] === h) return name;
    return k;
  }
  var WORDS = {
    contrast: words({ 'Off': 1, '3:1': 3, '4.5:1': 4.5, '7:1': 7 }),
    drawing: words({ 'Auto': 'auto', 'Crisp': 'crisp', 'Smooth': 'smooth' }),
    shape: words({ 'Follow look': 'follow', 'Block': 'block', 'Bar': 'bar', 'Underline': 'underline' }),
    trail: words({ 'Follow look': 'follow', 'Off': 'off', 'Soft': 'soft', 'Glow': 'glow', 'Phosphor': 'phosphor', 'Trace': 'trace' }),
    ground: words({ 'Follow look': 'follow', 'Theme surface': 'theme', 'Solid color': 'solid', 'Gradient': 'gradient', 'Image': 'image' }),
    /* T.Grounds' names, read when asked (43-grounds.js loads after this file); the earlier words still read */
    gradient: lazyWords(function () { return groundWords(true, { 'Dusk': 'dusk', 'Dawn': 'dawn', 'Deep': 'deep', 'Paper': 'paper' }); }),
    picture: lazyWords(function () { return groundWords(false, { 'Hills': 'hills', 'Grid': 'grid', 'Paper': 'paper', 'Custom': 'custom' }); }),
    effects: words({ 'Follow look': 'follow', 'Off': 'off', 'Custom': 'custom' }),
    /* the retired Visual still reads, as Follow look */
    bell: words({ 'Follow look': 'follow', 'Off': 'off', 'Visual': 'follow' }),
    scale: words({ 'Fine': 'fine', 'Medium': 'medium', 'Coarse': 'coarse' }),
    motion: words({ 'Off': 'off', 'Gentle': 'gentle', 'Lively': 'lively', 'Still': 'off' }),
    fit: words({ 'Cover': 'cover', 'Contain': 'contain', 'Tile': 'tile', 'Centre': 'center', 'Center': 'center', 'Fill': 'cover', 'Fit': 'contain' }),
    bezel: words({ 'Off': 'off', 'Slim': 'rim', 'Monitor': 'case', 'Rim': 'rim', 'Case': 'case' }),
    material: words({ 'Follow look': 'follow', 'Graphite': 'charcoal', 'Black gloss': 'black', 'Platinum': 'platinum', 'Putty': 'putty',
      'Brushed aluminium': 'aluminium', 'Gunmetal': 'gunmetal', 'Glass': 'glass', 'Accent': 'accent', 'Graphite plastic': 'charcoal',
      'Platinum plastic': 'platinum', 'Putty plastic': 'putty', 'Accent plastic': 'accent', 'Charcoal': 'charcoal', 'Aluminium': 'aluminium' })
  };
  /* Bezel Reflection: Auto is the material's own level; a level is a word or the nearest of these numbers */
  var REFLECT_AT = { off: 0, low: 0.25, medium: 0.5, high: 1 };
  function reflectIn(v) {
    var k = String(v === undefined || v === null ? '' : v).trim().toLowerCase();
    if (!k) return undefined;
    if (k === 'auto' || k === 'follow look' || k === 'material') return null;
    if (has(REFLECT_AT, k)) return k;
    var n = num(0, 1)(v); if (n === undefined) return undefined;
    var best = 'off'; Object.keys(REFLECT_AT).forEach(function (l) { if (Math.abs(REFLECT_AT[l] - n) < Math.abs(REFLECT_AT[best] - n)) best = l; });
    return best;
  }
  var numOut = function (v) { return typeof v === 'number' && isFinite(v) ? v : undefined; };
  var boolOut = function (v) { return typeof v === 'boolean' ? v : undefined; };
  var LINK = {
    scheme: { id: S + 'theme', in: schemeIn, out: schemeOut, custom: true },
    schemePair: { id: S + 'scheme-pair', in: bool, out: boolOut },
    minContrast: { id: S + 'min-contrast', in: WORDS.contrast.in, out: WORDS.contrast.out },
    font: { id: S + 'font-family', in: fontIn, out: fontOut, custom: true },
    /* no step: a face's own size need not sit on the half pixel (Departure Mono's is 13.75) */
    fontSize: { id: S + 'font-size', in: num(8, 32), out: numOut },
    fontWeight: { id: S + 'font-weight', in: num(100, 800, 100), out: numOut },
    /* no step either (round 5, Q15 #4): Customize offers line height and letter spacing by device pixel (1.2308, 1.2692
       at 2x), and rounding them to Settings' 0.05 and 0.25 here made neighbouring stops of All terminals draw alike */
    lineHeight: { id: S + 'line-height', in: num(1, 2), out: numOut },
    letterSpacing: { id: S + 'letter-spacing', in: num(-1, 3), out: numOut },
    ligatures: { id: S + 'ligatures', in: bool, out: boolOut },
    boldBright: { id: S + 'bold-bright', in: bool, out: boolOut },
    fontRendering: { id: S + 'font-rendering', in: WORDS.drawing.in, out: WORDS.drawing.out },
    cursorShape: { id: S + 'cursor-shape', in: WORDS.shape.in, out: WORDS.shape.out },
    cursorBlink: { id: S + 'cursor-blink', in: bool, out: boolOut },
    cursorTrail: { id: S + 'cursor-trail', in: WORDS.trail.in, out: WORDS.trail.out },
    background: { id: S + 'background', in: WORDS.ground.in, out: WORDS.ground.out },
    bgColor: { id: S + 'background-color', in: colorIn, out: colorIn },
    bgGradient: { id: S + 'background-gradient', in: WORDS.gradient.in, out: WORDS.gradient.out },
    bgImage: { id: S + 'background-image', in: WORDS.picture.in, out: WORDS.picture.out },
    bgImageData: { id: S + 'background-image-file', in: pictureIn, out: pictureOut },
    bgDim: { id: S + 'background-dim', in: function (v) { return /^(auto|follow look)$/i.test(String(v)) ? null : num(0, 0.9)(v); }, out: function (v) { return v === null ? 'Auto' : numOut(v); } },
    bgBlur: { id: S + 'background-blur', in: num(0, 24, 1), out: numOut },
    opacity: { id: S + 'opacity', in: function (v) { return v === FOLLOW ? null : num(0.4, 1)(v); }, out: function (v) { return v === null ? FOLLOW : numOut(v); } },
    padding: { id: S + 'padding', in: num(0, 24, 1), out: numOut },
    effects: { id: S + 'effects', in: WORDS.effects.in, out: WORDS.effects.out },
    scanlines: { id: S + 'scanlines', in: tri, out: triOut, effect: true },
    scanStrength: { id: S + 'scan-strength', in: num(0, 0.6), out: numOut },
    glow: { id: S + 'glow', in: tri, out: triOut, effect: true },
    glowStrength: { id: S + 'glow-strength', in: num(0, 1), out: numOut },
    crt: { id: S + 'crt', in: bool, out: boolOut, effect: true },
    curvature: { id: S + 'curvature', in: num(0, 0.2), out: numOut },
    burnIn: { id: S + 'burn-in', in: bool, out: boolOut },
    noise: { id: S + 'noise', in: num(0, 0.12), out: numOut },
    flicker: { id: S + 'flicker', in: bool, out: boolOut, effect: true },
    inactiveDim: { id: S + 'inactive-dim', in: tri, out: triOut, effect: true },
    smoothScroll: { id: S + 'smooth-scroll', in: tri, out: triOut, effect: true },
    bell: { id: S + 'bell', in: WORDS.bell.in, out: WORDS.bell.out },
    stickyHeader: { id: S + 'sticky-header', in: bool, out: boolOut },
    copyOnSelect: { id: S + 'copy-on-select', in: bool, out: boolOut },
    sixtyfourScan: { id: S + 'sixtyfour-scan', in: num(-53, 100, 1), out: numOut },
    sixtyfourBleed: { id: S + 'sixtyfour-bleed', in: num(0, 100, 1), out: numOut },
    /* round 5: the bezel, background and mask rows (the Plans pass's ids and words) */
    bgStrength: { id: S + 'background-strength', in: num(0, 1), out: numOut },
    bgScale: { id: S + 'background-scale', in: WORDS.scale.in, out: WORDS.scale.out },
    bgMotion: { id: S + 'background-motion', in: WORDS.motion.in, out: WORDS.motion.out },
    bgFit: { id: S + 'background-fit', in: WORDS.fit.in, out: WORDS.fit.out },
    bgDesat: { id: S + 'background-desaturate', in: num(0, 1), out: numOut },
    bezel: { id: S + 'bezel', in: WORDS.bezel.in, out: WORDS.bezel.out },
    bezelWidth: { id: S + 'bezel-width', in: function (v) { return /^(style default|auto|follow look)$/i.test(String(v)) ? null : num(2, 48)(v); }, out: function (v) { return v === null ? 'Style default' : numOut(v); } },
    bezelColor: { id: S + 'bezel-material', in: WORDS.material.in, out: WORDS.material.out },
    /* the row is round 3's 0-1 slider (or its levels, if canon takes P2's words); a level is written as the number that
       reads back as it on a dark screen and a light one alike, and a number reads as the nearest level */
    bezelReflect: { id: S + 'bezel-reflection', in: reflectIn, out: function (v) { return v === null ? 'Auto' : has(REFLECT_AT, v) ? REFLECT_AT[v] : undefined; } },
    crtMask: { id: S + 'phosphor-mask', in: bool, out: boolOut }
  };

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

  /* ---- the editor's view of the catalog (D30) ---- */
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
  function saveLocal() { try { localStorage.setItem('pm.home.terminal:v1:app', JSON.stringify(localApp)); } catch (e) {} }
  /* retired choices still read (Jared, 2026-10-16, P10 and P14): in a layer that holds no Flicker of its own, an amount
     stored by the retired slider means Flicker on; Bell's Visual means Follow look */
  function legacy(key, get) {
    var v = get(key);
    if ((v === undefined || v === null) && key === 'flicker') { var a = get('flickerAmount'); if (a !== undefined && a !== null && parseFloat(a) > 0) return true; }
    return key === 'bell' && v === 'visual' ? 'follow' : v;
  }
  function appGet(key) {
    return legacy(key, function (k) {
      var s = settings();
      if (s) { try { var v = s.get('terminal.' + k); if (v !== undefined && v !== null) return v; } catch (e) {} }
      return localApp[k];
    });
  }
  function projectGet(key) {
    return legacy(key, function (k) {
      var s = settings();
      if (s) { try { var v = s.get('terminal.project.' + k); if (v !== undefined && v !== null) return v; } catch (e) {} }
      return undefined;
    });
  }
  function tabGet(t, key) { return t ? legacy(key, function (k) { var v = t[k]; return v === null ? undefined : v; }) : undefined; }
  /* Settings (kit.d/24-terminal-look.js publishes window.PM_TERMINAL_SETTINGS while a Project's Settings can be
     written): the rows a person changed, read through LINK. Read again whenever Settings saved (its version moves) */
  var linked = false, slCache = null, slVer = -1;
  function bridge() {
    var b = window.PM_TERMINAL_SETTINGS;
    if (!b || typeof b.values !== 'function') return null;
    if (!linked && typeof b.onChange === 'function') {
      linked = true;
      b.onChange(function () { slVer = -1; if (!writing) refreshAll(); });
    }
    return b;
  }
  function settingsReady() { var b = bridge(); try { return !!(b && b.ready()); } catch (e) { return false; } }
  function settingsLayer() {
    var b = bridge(); if (!b) return {};
    var ver = typeof b.version === 'function' ? b.version() : 0;
    if (slCache && ver === slVer) return slCache;
    var raw = {}, out = {};
    try { raw = b.values() || {}; } catch (e) { raw = {}; }
    var promote = false;
    Object.keys(LINK).forEach(function (k) {
      var L = LINK[k];
      if (!has(raw, L.id)) return;
      var v = L.in(raw[L.id], L.custom ? raw[L.id + '#custom'] : undefined);
      if (v === undefined) return;
      out[k] = v;
      /* turning an effect on or off in Settings while Terminal Effects is left on Follow look means Custom, as ticking
         it in the Customize screen does (Follow look draws the look's own effects whatever those rows hold) */
      if (L.effect && v !== null) promote = true;
    });
    /* the retired Flicker Amount row (P10): an amount stored there reads as Flicker on, unless Flicker itself is stored */
    if (!has(out, 'flicker') && has(raw, S + 'flicker-amount') && num(0, 0.03)(raw[S + 'flicker-amount']) > 0) { out.flicker = true; promote = true; }
    if (promote && !has(out, 'effects')) out.effects = 'custom';
    slCache = out; slVer = ver;
    return out;
  }
  /* "All terminals" while a slider is being dragged: shown at once, written to Settings when it is let go */
  var liveApp = {};
  function field(view, key) {
    var t = view && view.tabAppearance, tv = tabGet(t, key);
    if (view && view.previewAppearance && view.previewAppearance[key] !== undefined) return view.previewAppearance[key];
    if (tv !== undefined) return tv;
    if (has(liveApp, key)) return liveApp[key];
    var sl = settingsLayer(); if (has(sl, key)) return sl[key] === null ? DEFAULTS[key] : sl[key];
    var p = projectGet(key); if (p !== undefined) return p;
    var a = appGet(key); if (a !== undefined && a !== null) return a;
    return DEFAULTS[key];
  }
  /* where a field's value comes from: 'tab', 'settings', 'project' and 'app' (the earlier stores) or 'look' */
  function layerOf(view, key) {
    if (view && tabGet(view.tabAppearance, key) !== undefined) return 'tab';
    if (has(liveApp, key) || has(settingsLayer(), key)) return 'settings';
    if (projectGet(key) !== undefined) return 'project';
    /* the host model answers its registered default when nothing is stored there, and that is nobody's choice */
    var a = appGet(key), s = settings(), d = s && s.defaults ? s.defaults()['terminal.' + key] : undefined;
    if (a !== undefined && a !== null && (localApp[key] !== undefined || a !== d)) return 'app';
    return 'look';
  }
  /* the value a scope holds itself (undefined when it holds none): 'tab' this terminal's own, 'app' All terminals' */
  function own(scope, view, key) {
    if (scope === 'tab') return tabGet(view && view.tabAppearance, key);
    if (has(liveApp, key)) return liveApp[key];
    var sl = settingsLayer(); if (has(sl, key)) return sl[key] === null ? undefined : sl[key];
    var p = projectGet(key); if (p !== undefined) return p;
    var l = layerOf(null, key);
    return l === 'app' ? appGet(key) : undefined;
  }

  function lookKey(look) { return look.nier ? 'nier' : (LOOKS[look.family] ? look.family : 'basic'); }

  var GRADIENTS = {
    dusk: 'linear-gradient(160deg, #2a2340 0%, #1b2033 55%, #14161f 100%)',
    dawn: 'linear-gradient(160deg, #fbf3ea 0%, #f1ecf7 60%, #e9f1f6 100%)',
    deep: 'radial-gradient(120% 90% at 20% 0%, #23324a 0%, #12161f 70%)',
    paper: 'linear-gradient(180deg, #f3ecdc 0%, #ebe2cf 100%)'
  };

  /* Solid colour with no colour of its own: the scheme's ground a visible step away from its text (deeper under light
     text, paler under dark text), so choosing it always shows and the text only gains contrast (round 5, Q15: the
     scheme's own ground drew exactly as Look's own). A ground already at black or white steps toward its text instead.
     The Scheme swatch is the ground itself */
  function solidDefault(th) {
    var to = C.lum(th.fg) > C.lum(th.bg) ? 0 : 0xffffff, step = function (c) { return Math.max(Math.abs(C.r(th.bg) - C.r(c)), Math.abs(C.g(th.bg) - C.g(c)), Math.abs(C.b(th.bg) - C.b(c))); };
    for (var k = 0.35; k < 1.001; k += 0.05) { var c = C.mix(th.bg, to, Math.min(1, k)); if (step(c) >= 12) return C.toHex(c); }
    return C.toHex(C.mix(th.bg, th.fg, 0.08));
  }

  function resolve(view) {
    var look = view && view.api && view.api.look ? Object.assign(T.look(), view.api.look()) : T.look();
    var lk = lookKey(look), L = LOOKS[lk], mode = look.mode;
    if (look.nier) mode = look.mode;
    var f = function (k) { return field(view, k); };

    /* scheme ('follow:light' and 'follow:dark', from Settings' earlier Light and Dark, are the look's own scheme of that
       appearance whatever the app's mode) */
    var sid = f('scheme'), s;
    if (sid === 'follow:light' || sid === 'follow:dark') s = scheme(L[sid.slice(7)]);
    else if (sid === 'follow' || !scheme(sid)) s = scheme(L[mode]) || scheme(mode === 'light' ? 'one-half-light' : 'one-half-dark');
    /* a scheme being previewed (hovered in the Customize screen) shows as it is: "Switch with light and dark" never
       shows a hovered light scheme as its dark sibling */
    else { s = scheme(sid); if (f('schemePair') && !(view && view.previewAppearance && view.previewAppearance.scheme !== undefined)) s = pairOf(s, mode); }
    if (!s) s = (T.SCHEMES || [])[0];
    /* the tokens are NieR's palette for the mode it is in: the YoRHa scheme of the other mode keeps its own colours (the
       same palette's other half), or Parchment in NieR dark drew as Ink (round 5, Q15) */
    if (s && /^pm-yorha/.test(s.id) && look.nier && s.appearance === (mode === 'light' ? 'light' : 'dark')) s = nierScheme(s, s.appearance === 'dark');
    var bgKind = f('background'); if (bgKind === 'follow') bgKind = L.background === 'soft' || L.background === 'paper' ? 'theme' : L.background;
    /* Terminal Opacity is Glass's (SSYS-051: "only under a Glass theme"): every other look draws its ground solid */
    var opacity = lk === 'glass' ? f('opacity') : 1;
    if (opacity === null || opacity === undefined) opacity = mode === 'light' ? L.opacityLight || L.opacity : L.opacity;
    var theme = s ? toTheme(s, bgKind === 'theme' ? opacity : 0) : null;
    if (theme && bgKind !== 'theme') theme.bgAlpha = 0; /* the background layer shows through default cells */
    if (theme && lk === 'friendly' && bgKind === 'theme' && f('background') === 'follow') theme.bgAlpha = 0; /* Friendly's soft gradient */

    /* font */
    var fid = f('font'); if (fid === 'follow' || !fontDef(fid)) fid = L.font;
    var FD = fontDef(fid);
    var size = f('fontSize') || FD.size, lh = f('lineHeight') || FD.lineHeight;
    /* the weight within the face's own range; a face with one weight draws it. Bold stays visibly heavier */
    var wt = FD.weights ? T.util.clamp(f('fontWeight') || FD.weight || 400, FD.weights[0], FD.weights[1]) : 400;
    var family = FD.stack;
    var axes = null;
    if (FD.axes && (f('sixtyfourScan') !== null || f('sixtyfourBleed') !== null)) {
      axes = { scan: f('sixtyfourScan') || 0, bleed: f('sixtyfourBleed') || 0 };
      var inst = sixtyfourFamily(axes.scan, axes.bleed);
      if (inst) family = "'" + inst + "', " + FD.stack; else axes.unavailable = true;
    }
    var drawing = f('fontRendering');
    var font = { id: fid, family: family, size: size, weight: FD.drawn && FD.drawn[wt] || wt, chosen: wt, boldWeight: FD.weights ? Math.min(FD.weights[1], wt <= 500 ? 700 : 800) : 700,
      lineHeight: lh, letterSpacing: f('letterSpacing') || 0, label: FD.label, crisp: drawing === 'crisp', axes: axes,
      local: FD.local ? { name: FD.label, installed: hasLocalFace(FD.label) } : null };

    /* cursor */
    var shape = f('cursorShape'); if (shape === 'follow') shape = L.cursorShape;
    var reduced = look.reduced;
    var trail = f('cursorTrail'); if (trail === 'follow') trail = L.trail;
    /* NieR: the trace is motion, so it needs an installed motion part (Scan sweep); Still and Colors only get none */
    if (lk === 'nier' && !/(^|\s)sweep(\s|$)/.test(document.documentElement.getAttribute('data-o55-nier-parts') || '')) trail = 'off';
    if (reduced) trail = 'off';

    /* background */
    var bg = { kind: bgKind }, stage = null, darkStage = false;
    if (f('background') === 'follow' && lk === 'friendly') {
      /* Friendly's stage: a soft light from above over a gentle fall to the look's tint; 30-looks.css adds the recess
         under the header and the paper grain */
      /* the scheme's own lightness decides the tint, not the look's mode: a dark scheme picked in Friendly light keeps a
         dark stage (a light tint under it would leave its last rows on mid-grey) */
      var darkGround = s ? s.appearance === 'dark' : mode === 'dark';
      var top = C.toHex(theme.bg), foot = C.toHex(C.mix(theme.bg, C.hex(darkGround ? '#3b3550' : '#f6e9f2'), darkGround ? 0.35 : 0.6));
      bg = { kind: 'gradient', soft: true, css: 'radial-gradient(120% 70% at 50% -8%, ' + (darkGround ? 'rgb(255 236 250 / .10)' : 'rgb(255 255 255 / .8)') +
        ', transparent 62%), linear-gradient(180deg, ' + top + ' 0%, ' + foot + ' 100%)' };
      // the stage's lightest and darkest grounds (the light from above at its centre, the foot), for the text floor below
      stage = [C.mix(theme.bg, C.hex(darkGround ? '#ffecfa' : '#ffffff'), darkGround ? 0.10 : 0.8), C.hex(foot)]; darkStage = darkGround;
    }
    else if (bgKind === 'solid') { bg.color = f('bgColor') || solidDefault(theme); bg.ground = C.hex(bg.color); }
    else if ((bgKind === 'gradient' || bgKind === 'image') && T.Grounds) {
      /* round 2: a recipe of this scheme (43-grounds.js). Strength scales it between the plain ground (0) and the most
         that stays readable (1): a scrim of the scheme's ground, never thinner than Auto readability needs */
      var G = T.Grounds, id = bgKind === 'gradient' ? f('bgGradient') : f('bgImage');
      if (bgKind === 'image' && id === 'paper') id = 'fibre';
      if (bgKind === 'image' && id === 'custom') {
        var dim = f('bgDim');
        var purl = T.Appearance.imageUrl('custom', f('bgImageData'), f('bgBlur'), f('bgDesat')), st = pictureStats(purl);
        /* the worst pixel for this scheme's text: the picture's lightest under light text, its darkest under dark text */
        var pw = st ? (C.lum(theme.fg) > C.lum(theme.bg) ? st.hi : st.lo) : (C.lum(theme.fg) > C.lum(theme.bg) ? 0xffffff : 0);
        var pAuto = T.Grounds.scrim(pw, theme), veil = null;
        /* round 4 (Q15 #2): a scheme with little contrast to spare (Tokyo Night Day's 4.52:1, Glass light's own) needs
           almost all of its own ground over a picture, which then vanished with every Fit and Dim the same. There the
           veil is white under dark text (black under light text) instead: the picture stays as a pale (or deep) print
           of itself, its light squeezed into what the text allows, as 3c's lighter-than-ground designs do */
        if (st && pAuto >= 0.9) {
          var vt = C.lum(theme.fg) < C.lum(theme.bg) ? 0xffffff : 0x000000, va = veilTo(pw, theme, vt);
          if (va < pAuto - 0.04) { veil = vt; pAuto = va; }
        }
        var pDim = dim === null || dim === undefined ? (st ? pAuto : 0.6) : Math.max(dim, st ? pAuto : 0);
        bg = { kind: 'image', custom: true, url: purl, fit: f('bgFit'), dim: pDim, dimAuto: dim === null || dim === undefined, raised: dim !== null && dim !== undefined && st && pAuto > dim,
          floor: st ? pAuto : 0, veil: veil === null ? null : C.toHex(veil), ground: C.mix(pw, veil === null ? theme.bg : veil, pDim) };
      } else {
        if (!G.has(id) || (bgKind === 'gradient') !== G.isGradient(id)) id = bgKind === 'gradient' ? 'fade' : 'hills';
        var strength = T.util.clamp(f('bgStrength'), 0, 1), cat = G.cat(id), mot = G.motion(id);
        bg = { kind: bgKind, design: id, cat: cat, strength: strength };
        if (G.painted(id) || mot) {
          /* painted at the terminal's own size by the view (_applyBackground), which then knows the worst pixel */
          bg.paint = G.painted(id) ? id : (mot.under || null);
          var lively = f('bgMotion') === 'lively';
          if (mot) bg.motion = { id: id, anim: lively && mot.livelyAnim || mot.anim, ms: mot.ms * (lively ? mot.lively || 0.5 : 1), pulse: lively && mot.pulse || 0, on: f('bgMotion') !== 'off' && !reduced };
          /* Blur is a picture's own (round 4): the built-in designs are drawn soft already and barely changed under it */
          if (mot && !mot.under) bg.base = C.toHex(theme.bg);
        } else {
          var D = G.css(id, theme, { scale: f('bgScale') }) || { css: C.toHex(theme.bg), colors: [theme.bg] };
          var w = G.worst(D.colors, theme), auto = G.scrim(w, theme), a = 1 - (1 - auto) * strength;
          bg.css = D.css; bg.dim = a; bg.ground = C.mix(w, theme.bg, a);
        }
      }
    }
    else if (bgKind === 'gradient') bg.css = GRADIENTS[f('bgGradient')] || GRADIENTS.dusk;
    else if (bgKind === 'image') { bg.url = T.Appearance.imageUrl(f('bgImage'), f('bgImageData'), f('bgBlur')); bg.dim = f('bgDim'); }
    if (f('background') === 'follow' && lk === 'nier') bg.paper = true;
    if (lk === 'glass' && bg.kind !== 'theme' && !bg.soft) bg.alpha = opacity;

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
      mask: { on: crtOn && !!f('crtMask') },
      tube: theme ? C.toHex(theme.bg) : null,
      /* the bezel is the view's own frame now (resolve's bezel, 30-looks.css), never drawn by the shader */
      bezel: { on: false }, vignette: { on: crtOn, strength: mode === 'light' ? 0.05 : 0.08 },
      burnIn: { on: crtOn && f('burnIn') && !reduced, persistMs: 450 },
      noise: { on: crtOn && f('noise') > 0 && !reduced, amount: f('noise') },
      flicker: { on: !fxOff && !follow && !!f('flicker') && !reduced, amount: FLICKER_AMOUNT },
      glowColor: theme && theme.roles.glow
    };
    /* the bezel: a slim frame (6 px) or a monitor case (24 px) unless a width was chosen. Round 3's research: a case
       reads as a housing only when its sloped face is wide enough to show the screen's reflection (Mega Bezel's face is
       about 5 % of the screen's height; round 2's 10 px, about 2 %, read as a flat band). The text is laid out inside it,
       never squeezed */
    var bzStyle = f('bezel'), bezel = { style: 'off', width: 0, gap: 0, color: 'follow', reflect: null };
    if (bzStyle === 'rim' || bzStyle === 'case') {
      var bw = f('bezelWidth');
      /* and a breath of glass inside it (3 px in a rim, 6 px in a case), so no glyph touches the frame */
      bezel = { style: bzStyle, width: bw === null || bw === undefined ? (bzStyle === 'rim' ? 6 : 24) : bw, gap: bzStyle === 'rim' ? 3 : 6,
        color: f('bezelColor') || 'follow', reflect: f('bezelReflect') };
    }
    var bgShow = lk === 'glass' && bgKind === 'theme';
    /* High Contrast schemes keep every cell at 7:1 unless the user chose a floor themselves */
    var floor = f('minContrast');
    if (s && /^pm-high-contrast/.test(s.id) && layerOf(view, 'minContrast') === 'look') floor = 7;
    /* Friendly's soft stage is lighter (dark) or darker (light) than the scheme's own ground, which is what the renderer
       floors text on: the floor is raised by the stage's worst step, so every word holds the chosen floor on every part
       of the stage (landing QA EC-13: the prompt's branch name read 3.97:1 on the dark stage's foot) */
    if (stage && floor > 1) {
      var g0 = C.lum(theme.bg), step = 1;
      stage.forEach(function (c) { var l = C.lum(c); step = Math.min(step, darkStage ? (g0 + 0.05) / (l + 0.05) : (l + 0.05) / (g0 + 0.05)); });
      // 3 % more for the paper grain and the recess under the header that 30-looks.css lays over the stage
      if (step < 1) floor = Math.min(21, Math.round(floor / step * 1.03 * 100) / 100);
    }
    /* scanlines and phosphor glow are drawn over the painted text and take some of what a word reads on the screen: in
       Retro dark (both on, at 0.3 and 0.45) the prompt's branch name painted at 4.54:1 read 3.84:1 as drawn. The floor
       rises by what they take, so every word holds the chosen floor as it is drawn */
    if (floor > 1 && (effects.scanlines.on || effects.glow.on)) {
      var take = 1 + (effects.scanlines.on ? 0.6 * (+effects.scanlines.strength || 0) : 0) + (effects.glow.on ? 0.06 * (+effects.glow.strength || 0) : 0);
      floor = Math.min(21, Math.round(floor * take * 100) / 100);
    }
    return {
      look: look, lookKey: lk, scheme: s, theme: theme, font: font, background: bg, effects: effects, glassThrough: bgShow,
      opts: { ligatures: f('ligatures'), minContrast: floor, boldBright: f('boldBright'),
        cursor: { shape: shape, blink: f('cursorBlink') && L.blink !== 'off' }, stickyHeader: f('stickyHeader'), copyOnSelect: f('copyOnSelect'),
        textRendering: drawing === 'smooth' ? 'geometricPrecision' : drawing === 'crisp' ? 'optimizeLegibility' : 'auto', crispText: drawing === 'crisp' },
      padding: { x: f('padding') + bezel.width + bezel.gap, y: Math.round(f('padding') * 0.6) + bezel.width + bezel.gap, own: f('padding') },
      bezel: bezel,
      sixtyfour: { scan: f('sixtyfourScan'), bleed: f('sixtyfourBleed') }
    };
  }

  /* The Retro look's dark scheme, 'green' or 'amber' (D30). It is not stored anywhere of its own: it is what Retro dark
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
  var changeEvents = new T.Emitter();
  function refreshAll() { views.forEach(function (v) { v.applyAppearance(resolve(v)); }); checkRetro(); changeEvents.emit('change'); }
  /* the earlier stores for one field: the host model's key and this machine's copy */
  function writeLocal(scope, key, value) {
    var s = settings(), k = scope === 'project' ? 'terminal.project.' + key : 'terminal.' + key;
    if (s) { writing++; try { s.set(k, value); } catch (e) { console.warn('[pmt] settings write failed', e); } writing--; }
    if (scope !== 'project') { if (value === null || value === undefined) delete localApp[key]; else localApp[key] = value; }
  }
  /* setMany(scope, { field: value | null }, view): one write for several fields (a quick set, an effect and the switch
     to Custom), so Settings records one transaction and every terminal repaints once. null clears the field in that
     scope. "All terminals" goes to Settings when a Project's Settings can be written; a value Settings has no words for
     (none today) and every write without Settings go to the earlier stores */
  function setMany(scope, patch, view) {
    var keys = Object.keys(patch || {});
    if (!keys.length) return true;
    if (scope === 'tab' && view) {
      view.tabAppearance = view.tabAppearance || {};
      keys.forEach(function (k) { var v = patch[k]; if (v === null || v === undefined) delete view.tabAppearance[k]; else view.tabAppearance[k] = v; });
      view.state.appearance = view.tabAppearance;
      view.applyAppearance(resolve(view));
      changeEvents.emit('change');
      return true;
    }
    var b = scope === 'app' && settingsReady() ? bridge() : null, rows = {}, rest = {}, ok = true;
    keys.forEach(function (k) {
      delete liveApp[k];
      var L = LINK[k], v = patch[k];
      /* only a row this Project's Settings carries (a row not yet admitted, or held back, keeps the field on this computer) */
      if (b && L && (typeof b.has !== 'function' || b.has(L.id))) {
        var out = v === null || v === undefined ? null : L.out(v);
        if (out !== undefined) { rows[L.id] = out; return; }
      }
      rest[k] = v;
    });
    if (b && Object.keys(rows).length) {
      writing++;
      try { ok = b.set(rows) !== false; } catch (e) { ok = false; console.warn('[pmt] Settings write failed', e); }
      writing--;
      slVer = -1;
      if (ok) {
        /* Settings holds it now: the earlier copy of the same field would only come back when the row is reset */
        Object.keys(LINK).forEach(function (k) { if (has(rows, LINK[k].id)) writeLocal(scope, k, null); });
      } else Object.keys(LINK).forEach(function (k) { if (has(rows, LINK[k].id)) rest[k] = patch[k]; });
    }
    Object.keys(rest).forEach(function (k) { writeLocal(scope, k, rest[k]); });
    if (scope !== 'project') saveLocal();
    refreshAll();
    return ok;
  }
  function set(scope, key, value, view) { var p = {}; p[key] = value; return setMany(scope, p, view); }
  /* a value shown at once while a slider moves; commit() writes it (setMany) when the slider is let go */
  function live(scope, key, value, view) {
    if (scope === 'tab' && view) { view.tabAppearance = view.tabAppearance || {}; view.tabAppearance[key] = value; view.state.appearance = view.tabAppearance; view.applyAppearance(resolve(view)); changeEvents.emit('change'); return; }
    liveApp[key] = value; refreshAll();
  }
  function commit(scope, key, view) {
    if (scope === 'tab') return set('tab', key, view && view.tabAppearance ? view.tabAppearance[key] : null, view);
    if (!has(liveApp, key)) return true;
    return set(scope, key, liveApp[key], view);
  }
  function resetScope(scope, view) {
    if (scope === 'tab' && view) { view.tabAppearance = {}; view.state.appearance = {}; view.applyAppearance(resolve(view)); changeEvents.emit('change'); return; }
    liveApp = {};
    var b = settingsReady() ? bridge() : null;
    writing++;
    if (b) {
      var rows = {}, sl = settingsLayer();
      Object.keys(LINK).forEach(function (k) { if (has(sl, k)) rows[LINK[k].id] = null; });
      try { if (Object.keys(rows).length) b.set(rows); } catch (e) { console.warn('[pmt] Settings reset failed', e); }
      slVer = -1;
    }
    Object.keys(FIELDS).forEach(function (k) { if (localApp[k] !== undefined) delete localApp[k]; var s = settings(); if (s) try { s.set('terminal.' + k, null); } catch (e) {} });
    writing--;
    saveLocal();
    refreshAll();
  }
  /* ---- presets (Jared, 2026-10-14: "a way to save looks as presets"). A preset is a named set of field values, kept on
     this machine beside imported schemes. It holds every field the scope it was saved from chose (any layer above the
     look's own), and applying it makes a scope hold exactly those, so it looks the same wherever it is applied; the
     fields it leaves out follow the look there ---- */
  var PRESETS_KEY = 'pm.home.terminal:v1:presets', PRESETS_MAX = 40;
  function presetList() {
    try {
      var l = JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]');
      return Array.isArray(l) ? l.filter(function (p) { return p && typeof p.id === 'string' && typeof p.name === 'string' && p.fields && typeof p.fields === 'object'; }) : [];
    } catch (e) { return []; }
  }
  function presetStore(l) {
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(l.slice(0, PRESETS_MAX))); } catch (e) { return false; }
    changeEvents.emit('change');
    return true;
  }
  /* what a scope chose: This terminal reads through its own choices, All terminals without them; never a preview */
  function capture(scope, view) {
    var sv = { api: view && view.api, tabAppearance: scope === 'tab' && view ? view.tabAppearance || {} : {}, previewAppearance: null, state: {} };
    var out = {};
    Object.keys(FIELDS).forEach(function (k) {
      if (layerOf(sv, k) === 'look') return;
      var v = field(sv, k); if (v !== undefined && v !== null) out[k] = v;
    });
    return out;
  }
  function presetName(name, l, except) {
    var base = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'My look', n = base, i = 2;
    var taken = function (x) { return l.some(function (p) { return p.id !== except && p.name.toLowerCase() === x.toLowerCase(); }); };
    while (taken(n)) n = base + ' ' + i++;
    return n;
  }
  var presets = {
    list: presetList,
    capture: capture,
    save: function (name, scope, view) {
      var l = presetList();
      var entry = { id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), name: presetName(name, l), fields: capture(scope, view), at: Date.now() };
      l.unshift(entry);
      return presetStore(l) ? entry : null;
    },
    rename: function (id, name) {
      var l = presetList(), p = l.filter(function (x) { return x.id === id; })[0]; if (!p) return null;
      p.name = presetName(name, l, id);
      return presetStore(l) ? p : null;
    },
    remove: function (id) { var l = presetList(), n = l.filter(function (x) { return x.id !== id; }); return n.length !== l.length && presetStore(n); },
    /* Undo after a delete: the same preset, back where it was */
    restore: function (entry, at) {
      if (!entry || !entry.id) return false;
      var l = presetList().filter(function (x) { return x.id !== entry.id; });
      l.splice(Math.max(0, Math.min(at || 0, l.length)), 0, entry);
      return presetStore(l);
    },
    /* every field the preset holds, and null (follow the look) for every other: one write, one transaction */
    patch: function (fields) { var out = {}; Object.keys(FIELDS).forEach(function (k) { var v = fields ? tabGet(fields, k) : undefined; out[k] = v === undefined ? null : v; }); return out; },
    apply: function (id, scope, view) {
      var p = presetList().filter(function (x) { return x.id === id; })[0]; if (!p) return false;
      return setMany(scope, presets.patch(p.fields), view);
    }
  };

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
  /* the canvas filter where the browser has it; otherwise three box passes approximate the same Gaussian on the
     pixels once (Safari before canvas filters), so Blur draws on every browser */
  var canFilter = (function () { try { var g = document.createElement('canvas').getContext('2d'); g.filter = 'blur(2px)'; return g.filter === 'blur(2px)'; } catch (e) { return false; } })();
  function boxBlur(g, w, h, sigma) {
    var n = 3, wIdeal = Math.sqrt((12 * sigma * sigma / n) + 1), wl = Math.floor(wIdeal); if (wl % 2 === 0) wl--;
    var m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4)), sizes = [];
    for (var i = 0; i < n; i++) sizes.push(i < m ? wl : wl + 2);
    var img = g.getImageData(0, 0, w, h), a = img.data, b = new Uint8ClampedArray(a.length);
    function pass(src, dst, r, horiz) {
      var len = horiz ? w : h, lines = horiz ? h : w, step = horiz ? 4 : w * 4, iarr = 1 / (r + r + 1);
      for (var l = 0; l < lines; l++) {
        var base = horiz ? l * w * 4 : l * 4;
        for (var c = 0; c < 4; c++) {
          var first = src[base + c], last = src[base + (len - 1) * step + c], acc = (r + 1) * first, j;
          for (j = 0; j < r; j++) acc += src[base + Math.min(j, len - 1) * step + c];
          for (j = 0; j < len; j++) {
            acc += (j + r < len ? src[base + (j + r) * step + c] : last) - (j - r - 1 >= 0 ? src[base + (j - r - 1) * step + c] : first);
            dst[base + j * step + c] = acc * iarr;
          }
        }
      }
    }
    sizes.forEach(function (s) { var r = (s - 1) / 2; pass(a, b, r, true); pass(b, a, r, false); });
    g.putImageData(img, 0, 0);
  }
  function blurCanvas(cv, blur) { if (!blur || canFilter) return; boxBlur(cv.getContext('2d'), cv.width, cv.height, blur); }
  /* a picture of the person's own, blurred once at this blur and cached; until it is ready the sharp copy shows, and
     every terminal repaints when it is */
  var pending = {};
  function blurredPicture(key, url, blur, desat) {
    if (imgCache.has(key)) return imgCache.get(key);
    if (pending[key]) return null;
    pending[key] = true;
    var im = new Image();
    im.onload = function () {
      /* at the picture's own size (at most 1920 x 1200): drawn into a fixed 960 x 600 a small picture filled it, so Tile
         and Centre showed the same (round 4, Q15). A blurred picture is drawn a little larger so its edges stay whole */
      var k = Math.min(1, 1920 / im.naturalWidth, 1200 / im.naturalHeight), W = Math.max(1, Math.round(im.naturalWidth * k)), H = Math.max(1, Math.round(im.naturalHeight * k));
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var g = cv.getContext('2d'), pad = blur ? blur * 2 : 0;
      if (canFilter) g.filter = (blur ? 'blur(' + blur + 'px) ' : '') + (desat ? 'saturate(' + (1 - desat) + ')' : '') || 'none';
      g.drawImage(im, -pad, -pad, W + pad * 2, H + pad * 2);
      if (blur && !canFilter) blurCanvas(cv, blur);
      if (desat && !canFilter) desaturate(g, W, H, desat);
      imgCache.set(key, cv.toDataURL('image/jpeg', 0.86)); delete pending[key];
      refreshAll();
    };
    im.onerror = function () { delete pending[key]; };
    im.src = url;
    return null;
  }
  function desaturate(g, w, h, amt) {
    var img = g.getImageData(0, 0, w, h), a = img.data;
    for (var i = 0; i < a.length; i += 4) { var y = 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2]; a[i] += (y - a[i]) * amt; a[i + 1] += (y - a[i + 1]) * amt; a[i + 2] += (y - a[i + 2]) * amt; }
    g.putImageData(img, 0, 0);
  }
  /* a picture's brightest and darkest pixels (its 98th and 2nd percentile by luminance on a 64 x 40 copy): what Auto
     dim and the text's contrast floor measure against (research: the WCAG F83 check, against the picture's own
     lightest or darkest area) */
  var picStats = new Map();
  /* the least veil of colour t over the worst pixel w that keeps the text at its floor (T.Grounds.scrim's rule, with
     a colour of its own in place of the scheme's ground) */
  function veilTo(w, th, t) {
    var own = C.contrast(th.fg, th.bg), want = Math.min(own, 4.8) - 0.004;
    if (C.contrast(th.fg, w) >= want) return 0;
    for (var a = 0.05; a < 0.999; a += 0.05) if (C.contrast(th.fg, C.mix(w, t, a)) >= want) return Math.round(a * 100) / 100;
    return 1;
  }
  function pictureStats(url) {
    if (!url) return null;
    if (picStats.has(url)) return picStats.get(url);
    picStats.set(url, null);
    var im = new Image();
    im.onload = function () {
      try {
        var cv = document.createElement('canvas'); cv.width = 64; cv.height = 40;
        var g = cv.getContext('2d'); g.drawImage(im, 0, 0, 64, 40);
        var d = g.getImageData(0, 0, 64, 40).data, px = [];
        for (var i = 0; i < d.length; i += 4) px.push(C.rgb(d[i], d[i + 1], d[i + 2]));
        px.sort(function (x, y) { return C.lum(x) - C.lum(y); });
        picStats.set(url, { lo: px[Math.floor(px.length * 0.02)], hi: px[Math.floor(px.length * 0.98)] });
        if (picStats.size > 24) picStats.delete(picStats.keys().next().value);
        refreshAll();
      } catch (e) { /* a picture the canvas cannot read keeps the cautious dim */ }
    };
    im.src = url;
    return null;
  }
  function imageUrl(name, data, blur, desat) {
    /* a chosen image is a reference ('img:<hash>') to the copy kept on this machine (77-customize.js); one that is
       gone (evicted, or named by another machine's settings) falls back to the default image, as does a path typed in
       Settings ('path:'), which a browser cannot open. Resolved before the cache, whose key holds only the data's
       length, the same for every reference */
    if (name === 'custom' && data && data.indexOf('img:') === 0) {
      var stored = null;
      try { stored = localStorage.getItem('pm.home.terminal:v1:bg:' + data.slice(4)); } catch (e) {}
      if (stored) return blur || desat ? blurredPicture(data + '|' + blur + '|' + (desat || 0), stored, blur, desat || 0) || stored : stored;
      name = 'hills'; data = null;
    }
    if (name === 'custom' && data && data.indexOf('path:') === 0) { name = 'hills'; data = null; }
    var key = name + '|' + (data ? data.length : 0) + '|' + blur;
    if (imgCache.has(key)) return imgCache.get(key);
    var cv = document.createElement('canvas'); cv.width = 960; cv.height = 600;
    var g = cv.getContext('2d');
    if (name === 'custom' && data) { imgCache.set(key, data); return data; }
    if (blur && canFilter) g.filter = 'blur(' + blur + 'px)';
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
    blurCanvas(cv, blur);
    var url = cv.toDataURL('image/jpeg', 0.86);
    imgCache.set(key, url);
    return url;
  }
  /* the name a picture was chosen under, so Settings' Custom Background Image can name it and find it again */
  function rememberPicture(name, ref) {
    if (!name || !ref || ref.indexOf('img:') !== 0) return;
    var n = picNames(); n[String(name).split(/[\\/]/).pop().slice(0, 120)] = ref.slice(4);
    var keys = Object.keys(n); if (keys.length > 16) delete n[keys[0]];
    try { localStorage.setItem(NAMES, JSON.stringify(n)); } catch (e) {}
  }
  function pictureName(ref) { var o = pictureOut(ref); return o && o.indexOf('img:') !== 0 ? o : null; }

  /* import from text (the Customize screen and Settings' Import a Color Scheme): { ok, id, name } or { ok: false, error }
     with a fixed message that never repeats the file */
  function importText(text, fileName) {
    var r = T.SchemeImport ? T.SchemeImport.parse(text, fileName || '') : { ok: false, error: 'Import is not available' };
    if (!r.ok) return { ok: false, error: r.error };
    var entry = addUserScheme(r.scheme);
    return { ok: true, id: entry.id, name: entry.name };
  }
  /* importFile({ onDone(result) }): opens a file chooser (call it from a click) */
  function importFile(opts) {
    opts = opts || {};
    var done = function (r) { if (typeof opts.onDone === 'function') { try { opts.onDone(r); } catch (e) { console.error('[pmt] import onDone failed', e); } } };
    var input = document.createElement('input'); input.type = 'file';
    input.accept = '.itermcolors,.json,.conf,.toml,.yaml,.yml,.Xresources,.xresources,.txt,.theme';
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; if (!f) return;
      if (f.size > 256 * 1024) { done({ ok: false, error: 'That file is too large for a colour scheme (256 KB at most).' }); return; }
      f.text().then(function (text) { done(importText(text, f.name)); }, function () { done({ ok: false, error: 'That file could not be read.' }); });
    });
    input.click();
  }

  T.Appearance = {
    FIELDS: FIELDS, FONTS: FONTS, LOOKS: LOOKS, DEFAULTS: DEFAULTS, GRADIENTS: GRADIENTS, LINK: LINK, LOCAL_FIELDS: LOCAL_FIELDS,
    schemes: allSchemes, scheme: scheme, pairOf: pairOf, toTheme: toTheme, fontDef: fontDef, hasLocalFace: hasLocalFace,
    resolve: function (view) { if (view) views.add(view); return resolve(view); },
    /* the same resolution without joining the live terminals (thumbnails and previews that repaint themselves) */
    peek: function (view) { return resolve(view); },
    forget: function (view) { views.delete(view); },
    get: field, layerOf: layerOf, own: own, set: set, setMany: setMany, live: live, commit: commit, reset: resetScope,
    preview: preview, endPreview: endPreview, settingsReady: settingsReady, settingsValues: settingsLayer, presets: presets,
    refreshAll: refreshAll, addUserScheme: addUserScheme, imageUrl: imageUrl, lookKey: lookKey, solidDefault: solidDefault,
    rememberPicture: rememberPicture, pictureName: pictureName, importText: importText, importFile: importFile, canBlur: canFilter,
    onChange: function (fn) { return changeEvents.on('change', fn); },
    setTabFont: function (view, o) { if (o.size) set('tab', 'fontSize', o.size, view); },
    /* D30: the catalog as the editor reads it (window.PMT.Appearance, 90-kind.js) */
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
