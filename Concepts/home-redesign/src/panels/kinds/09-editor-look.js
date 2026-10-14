/* The editor's appearance model (F3-639, D30; the editor Customize proposal of 2026-10-14). One model for every editor
   tab, the editor's Customize screen (11-editor-customize.js) and Settings > Editor & Terminal > Editor look. Each field
   resolves through these layers, highest first:
     1. this tab   (the tab's own choices, saved with the tab: the Customize screen's "This editor"),
     2. Settings   (the Project's code.editing.* rows through window.PM_EDITOR_SETTINGS, kit.d/25-editor-look.js:
                    Settings and the Customize screen's "All editors" both write them, in one transaction),
     3. the earlier store (the host model's editor.* keys, CONTRACT section 12, and the pre-model key names the editor
                    kind used: read beneath Settings, written only while no Project's Settings can be written),
     4. the look   ("Follow look": each look's own caret, motion and colours, LOOKS below).
   A field left unset falls through, and every field applies live in every editor at once. The terminal's model
   (src/terminal/js/42-appearance.js) is the sibling: the same layers, the same words, one scheme catalog.
   The model is PMW.edLook; the editor kind (10-editor.js) registers each instance as a view ({ tabAppearance,
   previewAppearance, applyLook(resolved) }) and repaints when anything it reads changes. */

var LOOK_KEYS = ['basic', 'friendly', 'glass', 'retro', 'nier'];

/* the editor's faces (F3-644: JetBrains Mono, Atkinson Hyperlegible Mono, System monospace). weights is the range the
   page's files draw: JetBrains Mono's upright files are NieR Mode's PM NieR Mono, drawn 400 to 800 (lighter weights
   draw as 400, measured 2026-10-14); Atkinson Hyperlegible Mono 200 to 800; the system face 400 to 700 */
var FACES = {
  'jetbrains-mono': { label: 'JetBrains Mono', stack: "'JetBrains Mono', 'PM Symbols Mono', ui-monospace, Menlo, Consolas, monospace", weights: [400, 800], ligatures: true },
  'atkinson': { label: 'Atkinson Hyperlegible Mono', stack: "'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'PM Symbols Mono', ui-monospace, monospace", weights: [200, 800], ligatures: false },
  'system': { label: 'System monospace', stack: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, 'Liberation Mono', monospace", weights: [400, 700], ligatures: false }
};

/* Follow look, per look: what each look draws when a field is left to it. The caret, its blink and motion and the
   trail when it jumps are each look's voice, matching the terminal's (D15): Basic quiet and exact, Friendly soft and
   springy, Glass gliding with a light streak, Retro a block with a phosphor afterglow, NieR an ink line that cuts (its
   trace needs the Scan sweep part). Colours, italics and weights stay in 60-kind-editor.css (null: the look's CSS). */
var LOOKS = {
  basic: { caretShape: 'line', caretBlink: 'blink', caretMotion: 'instant', caretTrail: 'off', smoothScroll: false },
  friendly: { caretShape: 'line', caretBlink: 'smooth', caretMotion: 'glide', caretTrail: 'soft', smoothScroll: true },
  glass: { caretShape: 'line', caretBlink: 'smooth', caretMotion: 'glide', caretTrail: 'glow', smoothScroll: true },
  retro: { caretShape: 'block', caretBlink: 'blink', caretMotion: 'instant', caretTrail: 'phosphor', smoothScroll: false },
  nier: { caretShape: 'line', caretBlink: 'blink', caretMotion: 'instant', caretTrail: 'trace', smoothScroll: false }
};

/* every field the model knows, its default and its range. null: Follow look. Groups are the Customize screen's. */
var FIELDS = {
  /* colours */
  scheme: { type: 'enum', default: 'follow', label: 'Code colours' },
  schemePair: { type: 'bool', default: true, label: 'Switch with light and dark' },
  syntax: { type: 'bool', default: true, label: 'Colour code by meaning' },
  bracketPairs: { type: 'bool', default: false, label: 'Bracket pair colours' },
  contrast: { type: 'enum', values: [4.5, 7], default: 4.5, label: 'Text contrast' },
  italicComments: { type: 'tri', default: null, label: 'Comments in italics' },
  boldKeywords: { type: 'tri', default: null, label: 'Keywords in bold' },
  /* text */
  font: { type: 'enum', values: Object.keys(FACES), default: 'jetbrains-mono', label: 'Face' },
  fontSize: { type: 'number', min: 10, max: 24, step: 0.5, default: 13, label: 'Size' },
  fontWeight: { type: 'number', min: 200, max: 800, step: 100, default: 400, label: 'Weight' },
  lineHeight: { type: 'number', min: 1.2, max: 2, step: 0.05, default: 1.55, label: 'Line spacing' },
  letterSpacing: { type: 'number', min: -0.5, max: 2, step: 0.25, default: 0, label: 'Letter spacing' },
  ligatures: { type: 'bool', default: false, label: 'Ligatures' },
  /* caret */
  caretShape: { type: 'enum', values: ['follow', 'line', 'block', 'underline'], default: 'follow', label: 'Caret' },
  caretWidth: { type: 'number', min: 1, max: 4, step: 1, default: 2, label: 'Line width' },
  caretBlink: { type: 'enum', values: ['follow', 'blink', 'smooth', 'expand', 'solid'], default: 'follow', label: 'Blink' },
  caretMotion: { type: 'enum', values: ['follow', 'instant', 'snappy', 'glide'], default: 'follow', label: 'Caret movement' },
  caretTrail: { type: 'enum', values: ['follow', 'off', 'soft', 'glow', 'phosphor', 'trace'], default: 'follow', label: 'Trail' },
  /* lines and guides */
  lineNumbers: { type: 'bool', default: true, label: 'Line numbers' },
  relativeNumbers: { type: 'bool', default: false, label: 'Count from the caret' },
  lineHighlight: { type: 'enum', values: ['follow', 'all', 'line', 'gutter', 'off'], default: 'follow', label: 'Current line' },
  indentGuides: { type: 'enum', values: ['off', 'plain', 'rainbow'], default: 'off', label: 'Indent guides' },
  activeIndent: { type: 'bool', default: true, label: 'Light the guide of the block I am in' },
  whitespace: { type: 'enum', values: ['off', 'boundary', 'selection', 'trailing', 'all'], default: 'off', label: 'Show spaces' },
  rulers: { type: 'enum', values: ['', '80', '100', '120', '80,120'], default: '', label: 'Rulers' },
  wordWrap: { type: 'bool', default: false, label: 'Wrap long lines' },
  wrapColumn: { type: 'enum', values: [0, 80, 100, 120], default: 0, label: 'Wrap at' },
  minimap: { type: 'bool', default: true, label: 'Minimap scrollbar' },
  stickyScroll: { type: 'bool', default: true, label: 'Sticky scroll' },
  stickyLines: { type: 'number', min: 1, max: 5, step: 1, default: 3, label: 'Sticky lines' },
  /* motion and effects */
  smoothScroll: { type: 'tri', default: null, label: 'Smooth scrolling' },
  reveal: { type: 'bool', default: true, label: 'Lines arrive when a file opens' },
  scrollPastEnd: { type: 'enum', values: ['little', 'half', 'page'], default: 'little', label: 'Scroll past the last line' },
  inactiveDim: { type: 'bool', default: false, label: 'Fade editors I am not in' },
  scanlines: { type: 'bool', default: false, label: 'Scanlines' },
  glow: { type: 'bool', default: false, label: 'Text glow' },
  /* behaviour */
  diffLayout: { type: 'enum', values: ['auto', 'side', 'inline'], default: 'auto', label: 'Diff layout' },
  gotoHighlightMs: { type: 'number', min: 500, max: 10000, step: 500, default: 5000, label: 'A jumped-to line stays lit' },
  autosave: { type: 'enum', values: ['off', '500', '1000', 'focus'], default: '1000', label: 'Save automatically' },
  diagnostics: { type: 'enum', values: ['off', 'errors', 'warnings', 'all'], default: 'warnings', label: 'Problems to highlight' },
  /* Settings' Hover Tip Delay (Toolchain, language servers): how long the pointer rests on a problem before its card */
  hoverDelay: { type: 'number', min: 0, max: 5000, step: 50, default: 300, label: 'Wait before showing a hover tip' }
};
var DEFAULTS = {};
Object.keys(FIELDS).forEach(function (k) { DEFAULTS[k] = FIELDS[k].default; });

/* ---- the Settings rows: one row per field, its stored words to and from the field's value. in() returns undefined
   for a value it cannot read (the field then falls through) and null for an explicit Follow look. The canon rows
   (SSYS-050, Plans/settings_inventory.json) keep their stored words; the proposed rows' words are this model's
   (src/settings/proposed.d/25-editor-look.json). ---- */
var S = 'code.editing.', FOLLOW = 'Follow look';
var has = function (o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); };
function num(min, max, step) {
  return function (v) {
    if (v === null || v === undefined || v === '' || typeof v === 'boolean') return undefined;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
    if (!isFinite(n) || !/^\s*-?[\d.,]+\s*(px|ms|%)?\s*$/.test(String(v))) return undefined;
    n = Math.min(max, Math.max(min, n));
    return +(step ? Math.round(n / step) * step : n).toFixed(4);
  };
}
var numOut = function (v) { return typeof v === 'number' && isFinite(v) ? v : undefined; };
function bool(v) { if (v === true || v === 'true' || v === 'On' || v === 'on') return true; if (v === false || v === 'false' || v === 'Off' || v === 'off') return false; return undefined; }
var boolOut = function (v) { return typeof v === 'boolean' ? v : undefined; };
function tri(v) { if (v === FOLLOW || v === 'follow') return null; return bool(v); }
function triOut(v) { return v === null || v === undefined ? FOLLOW : v ? 'On' : 'Off'; }
function words(map) {
  var inv = {};
  Object.keys(map).forEach(function (k) { if (!has(inv, String(map[k]))) inv[String(map[k])] = k; });
  return {
    in: function (v) { var k = String(v); if (has(map, k)) return map[k]; var lo = k.toLowerCase(); for (var m in map) if (m.toLowerCase() === lo) return map[m]; return undefined; },
    out: function (v) { return has(inv, String(v)) ? inv[String(v)] : undefined; }
  };
}
/* the catalog lives in the terminal package (window.PMT.Appearance, D30: schemes() gives each scheme's id, name, mode
   and the sibling "Switch with light and dark" swaps to); without it the editor keeps Follow look */
function catalogApi() {
  try { var A = window.PMT && window.PMT.Appearance; return A && typeof A.schemes === 'function' && typeof A.editorTokens === 'function' ? A : null; } catch (_) { return null; }
}
function catalogList() { var A = catalogApi(); try { var l = A ? A.schemes() : []; return Array.isArray(l) ? l : []; } catch (_) { return []; } }
function schemeById(id) { var l = catalogList(); for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i]; return null; }
/* the sibling of the other appearance, or the scheme itself (an imported one has none) */
function pairOf(s, mode) { if (!s || s.mode === mode || !s.pair) return s; return schemeById(s.pair) || s; }
/* the family a scheme belongs to, for the Customize screen's headings (the catalog names it; ids carry it) */
var FAMILIES = [['pm-', 'Puppet Master originals'], ['catppuccin', 'Catppuccin'], ['tokyo-night', 'Tokyo Night'], ['one-half', 'One Half'],
  ['rose-pine', 'Rosé Pine'], ['solarized', 'Solarized'], ['gruvbox', 'Gruvbox'], ['dracula', 'Dracula'], ['nord', 'Nord'], ['kanagawa', 'Kanagawa'],
  ['everforest', 'Everforest'], ['flexoki', 'Flexoki'], ['github', 'GitHub'], ['ayu', 'Ayu'], ['user-', 'Imported']];
function familyOf(s) {
  if (!s) return '';
  if (s.family) return s.family === 'Puppet Master' ? 'Puppet Master originals' : s.family;
  for (var i = 0; i < FAMILIES.length; i++) if (String(s.id).indexOf(FAMILIES[i][0]) === 0) return FAMILIES[i][1];
  return String(s.name || '').split(' ')[0];
}
/* Follow look's own colours are the editor's token tables (60-kind-editor.css), drawn from these schemes (D21) */
var FOLLOW_SCHEMES = { basic: ['one-half-light', 'one-half-dark'], friendly: ['catppuccin-latte', 'catppuccin-mocha'],
  glass: ['tokyo-night-day', 'tokyo-night-storm'], retro: ['pm-paper-teletype', 'pm-phosphor-green'], nier: ['pm-yorha-parchment', 'pm-yorha-ink'] };
/* Editor Colors: Follow look or a catalog scheme. The row's choices carry the scheme's id (as Terminal Colors' do); a
   stored name (the inventory's option words, "Catppuccin Mocha") or the earlier "Match App Theme" still reads */
function schemeIn(v) {
  var k = String(v == null ? '' : v).trim();
  if (!k) return undefined;
  if (k === FOLLOW || k === 'follow' || /^match app theme$/i.test(k) || /^follow theme$/i.test(k)) return 'follow';
  if (schemeById(k)) return k;
  var lo = k.toLowerCase(), l = catalogList();
  for (var i = 0; i < l.length; i++) if (String(l[i].name).toLowerCase() === lo || String(l[i].id).toLowerCase() === lo) return l[i].id;
  return undefined;
}
function schemeOut(v) { return v === 'follow' ? FOLLOW : schemeById(v) ? v : undefined; }
/* Editor Font: its three canon words. A terminal face id stored by the earlier compact popover (atkinson, system,
   jetbrains-mono) reads as that face; a terminal-only face (VT323, Sixtyfour) is not an editor face and falls through */
var FACE_WORDS = { 'JetBrains Mono': 'jetbrains-mono', 'Atkinson Hyperlegible Mono': 'atkinson', 'System monospace': 'system', 'System Monospace': 'system' };
function fontIn(v) {
  var k = String(v == null ? '' : v).trim();
  if (!k) return undefined;
  if (FACES[k]) return k;
  if (has(FACE_WORDS, k)) return FACE_WORDS[k];
  var lo = k.toLowerCase();
  for (var w in FACE_WORDS) if (w.toLowerCase() === lo) return FACE_WORDS[w];
  return undefined;
}
function fontOut(v) { return FACES[v] ? FACES[v].label : undefined; }
var WORDS = {
  contrast: words({ '4.5:1': 4.5, '7:1': 7 }),
  shape: words({ 'Follow look': 'follow', 'Line': 'line', 'Block': 'block', 'Underline': 'underline' }),
  blink: words({ 'Follow look': 'follow', 'Blink': 'blink', 'Smooth': 'smooth', 'Expand': 'expand', 'Solid': 'solid' }),
  motion: words({ 'Follow look': 'follow', 'Instant': 'instant', 'Snappy': 'snappy', 'Gliding': 'glide' }),
  trail: words({ 'Follow look': 'follow', 'Off': 'off', 'Soft': 'soft', 'Glow': 'glow', 'Phosphor': 'phosphor', 'Trace': 'trace' }),
  highlight: words({ 'Follow look': 'follow', 'Line and number': 'all', 'Line only': 'line', 'Number only': 'gutter', 'Off': 'off' }),
  guides: words({ 'Off': 'off', 'Lines': 'plain', 'Rainbow': 'rainbow' }),
  space: words({ 'Off': 'off', 'Between words': 'boundary', 'In the selection': 'selection', 'At line ends': 'trailing', 'Everywhere': 'all' }),
  rulers: words({ 'Off': '', '80': '80', '100': '100', '120': '120', '80 and 120': '80,120' }),
  wrapAt: words({ 'Window edge': 0, '80': 80, '100': 100, '120': 120 }),
  pastEnd: words({ 'A few lines': 'little', 'Half a page': 'half', 'A full page': 'page' }),
  diff: words({ 'Automatic': 'auto', 'Side by side': 'side', 'Inline': 'inline' }),
  autosave: words({ 'Off': 'off', 'After 500 ms': '500', 'After 1 second': '1000', 'On focus change': 'focus' }),
  problems: words({ 'Off': 'off', 'Errors Only': 'errors', 'Warnings & Errors': 'warnings', 'Everything': 'all' })
};
var LINK = {
  scheme: { id: S + 'color-scheme', in: schemeIn, out: schemeOut },
  schemePair: { id: S + 'scheme-pair', in: bool, out: boolOut },
  syntax: { id: S + 'syntax-highlighting', in: bool, out: boolOut },
  bracketPairs: { id: S + 'bracket-pair-colors', in: bool, out: boolOut },
  contrast: { id: S + 'min-contrast', in: WORDS.contrast.in, out: WORDS.contrast.out },
  italicComments: { id: S + 'italic-comments', in: tri, out: triOut },
  boldKeywords: { id: S + 'bold-keywords', in: tri, out: triOut },
  font: { id: S + 'font-family', in: fontIn, out: fontOut },
  fontSize: { id: S + 'font-size', in: num(10, 24, 0.5), out: numOut },
  fontWeight: { id: S + 'font-weight', in: num(200, 800, 100), out: numOut },
  lineHeight: { id: S + 'line-height', in: num(1.2, 2, 0.05), out: numOut },
  letterSpacing: { id: S + 'letter-spacing', in: num(-0.5, 2, 0.25), out: numOut },
  ligatures: { id: S + 'ligatures', in: bool, out: boolOut },
  caretShape: { id: S + 'cursor-shape', in: WORDS.shape.in, out: WORDS.shape.out },
  caretWidth: { id: S + 'cursor-width', in: num(1, 4, 1), out: numOut },
  caretBlink: { id: S + 'cursor-blink', in: WORDS.blink.in, out: WORDS.blink.out },
  caretMotion: { id: S + 'cursor-motion', in: WORDS.motion.in, out: WORDS.motion.out },
  caretTrail: { id: S + 'cursor-trail', in: WORDS.trail.in, out: WORDS.trail.out },
  lineNumbers: { id: S + 'line-numbers', in: bool, out: boolOut },
  relativeNumbers: { id: S + 'relative-line-numbers', in: bool, out: boolOut },
  lineHighlight: { id: S + 'line-highlight', in: WORDS.highlight.in, out: WORDS.highlight.out },
  indentGuides: { id: S + 'indent-guides', in: WORDS.guides.in, out: WORDS.guides.out },
  activeIndent: { id: S + 'indent-guides-active', in: bool, out: boolOut },
  whitespace: { id: S + 'render-whitespace', in: WORDS.space.in, out: WORDS.space.out },
  rulers: { id: S + 'rulers', in: WORDS.rulers.in, out: WORDS.rulers.out },
  wordWrap: { id: S + 'word-wrap', in: bool, out: boolOut },
  wrapColumn: { id: S + 'wrap-column', in: WORDS.wrapAt.in, out: WORDS.wrapAt.out },
  minimap: { id: S + 'minimap', in: bool, out: boolOut },
  stickyScroll: { id: S + 'sticky-scroll', in: bool, out: boolOut },
  stickyLines: { id: S + 'sticky-scroll-lines', in: num(1, 5, 1), out: numOut },
  smoothScroll: { id: S + 'smooth-scroll', in: tri, out: triOut },
  reveal: { id: S + 'reveal-lines', in: bool, out: boolOut },
  scrollPastEnd: { id: S + 'scroll-past-end', in: WORDS.pastEnd.in, out: WORDS.pastEnd.out },
  inactiveDim: { id: S + 'dim-unfocused', in: bool, out: boolOut },
  scanlines: { id: S + 'scanlines', in: bool, out: boolOut },
  glow: { id: S + 'text-glow', in: bool, out: boolOut },
  diffLayout: { id: S + 'diff-layout', in: WORDS.diff.in, out: WORDS.diff.out },
  gotoHighlightMs: { id: S + 'goto-highlight-ms', in: num(500, 10000, 500), out: numOut },
  autosave: { id: S + 'autosave', in: WORDS.autosave.in, out: WORDS.autosave.out },
  diagnostics: { id: S + 'diagnostics-visibility', in: WORDS.problems.in, out: WORDS.problems.out },
  hoverDelay: { id: S + 'lsp-hover-delay', in: num(0, 5000), out: numOut }
};

/* the earlier store: the host model's editor.* keys (CONTRACT section 12; editor.font.family held either a family
   name or, from the compact popover, a terminal face id) */
var HOST = {
  scheme: 'editor.scheme', font: 'editor.font.family', fontSize: 'editor.font.size', lineHeight: 'editor.lineHeight',
  minimap: 'editor.minimap', stickyScroll: 'editor.stickyScroll', stickyLines: 'editor.stickyScroll.maxLines',
  diffLayout: 'editor.diff.layout', wordWrap: 'editor.wordWrap'
};
function hostKey(field) { return HOST[field] || 'editor.look.' + field; }
var HOST_IN = { font: fontIn, scheme: function (v) { return v === 'follow' ? 'follow' : schemeIn(v); } };

/* ---- events ---- */
function emitter() {
  var map = {};
  return {
    on: function (name, fn) { (map[name] = map[name] || []).push(fn); return function () { var a = map[name] || [], i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }; },
    emit: function (name, data) { (map[name] || []).slice().forEach(function (fn) { try { fn(data); } catch (err) { try { console.error('[pm-home] editor look listener failed', err); } catch (_) {} } }); }
  };
}
var events = emitter();

/* ---- the layers ---- */
function host() { return window.PM_HOME && window.PM_HOME.settings ? window.PM_HOME.settings : null; }
/* Settings (window.PM_EDITOR_SETTINGS while a Project's Settings can be written): the rows a person changed, read
   through LINK. Read again whenever Settings saved (its version moves) */
var linked = false, slCache = null, slVer = -1, writing = 0;
function bridge() {
  var b = window.PM_EDITOR_SETTINGS;
  if (!b || typeof b.values !== 'function') return null;
  if (!linked && typeof b.onChange === 'function') {
    linked = true;
    b.onChange(function () { slVer = -1; if (!writing) refreshAll(); });
  }
  return b;
}
function settingsReady() { var b = bridge(); try { return !!(b && b.ready()); } catch (_) { return false; } }
function settingsLayer() {
  var b = bridge(); if (!b) return {};
  var ver = typeof b.version === 'function' ? b.version() : 0;
  if (slCache && ver === slVer) return slCache;
  var raw = {}, out = {};
  try { raw = b.values() || {}; } catch (_) { raw = {}; }
  Object.keys(LINK).forEach(function (k) {
    var L = LINK[k]; if (!has(raw, L.id)) return;
    var v = L.in(raw[L.id]);
    if (v !== undefined) out[k] = v;
  });
  /* the catalog arrives after Settings: a scheme id the catalog does not know yet is read again once it does */
  slCache = out; slVer = catalogApi() ? ver : -1;
  return out;
}
function hostLayer(k) {
  var s = host(); if (!s) return undefined;
  var key = hostKey(k), v;
  try { v = s.get(key); } catch (_) { return undefined; }
  if (v === undefined || v === null) return undefined;
  /* the host model answers its registered default when nothing is stored, and that is nobody's choice */
  var d = s.defaults ? s.defaults()[key] : undefined;
  if (d !== undefined && JSON.stringify(v) === JSON.stringify(d)) return undefined;
  if (HOST_IN[k]) { v = HOST_IN[k](v); if (v === undefined) return undefined; }
  return v;
}
/* "All editors" while a slider is being dragged: shown at once, written when it is let go */
var liveApp = {};
function field(view, key) {
  if (view && view.previewAppearance && view.previewAppearance[key] !== undefined) return view.previewAppearance[key];
  var t = view && view.tabAppearance;
  if (t && t[key] !== undefined && t[key] !== null) return t[key];
  if (has(liveApp, key)) return liveApp[key];
  var sl = settingsLayer(); if (has(sl, key)) return sl[key] === null ? DEFAULTS[key] : sl[key];
  var hv = hostLayer(key); if (hv !== undefined) return hv;
  return DEFAULTS[key];
}
/* where a field's value comes from: 'tab', 'settings', 'host' or 'look' */
function layerOf(view, key) {
  var t = view && view.tabAppearance;
  if (t && t[key] !== undefined && t[key] !== null) return 'tab';
  if (has(liveApp, key) || has(settingsLayer(), key)) return 'settings';
  if (hostLayer(key) !== undefined) return 'host';
  return 'look';
}
/* the value a scope holds itself (undefined when it holds none): 'tab' this editor's own, 'app' All editors' */
function own(scope, view, key) {
  if (scope === 'tab') { var t = view && view.tabAppearance; return t && t[key] !== undefined && t[key] !== null ? t[key] : undefined; }
  if (has(liveApp, key)) return liveApp[key];
  var sl = settingsLayer(); if (has(sl, key)) return sl[key] === null ? undefined : sl[key];
  var hv = hostLayer(key); return hv === undefined ? undefined : hv;
}

/* ---- the look ---- */
function lookNow() {
  var l = PMW.look ? PMW.look() : { family: 'basic', mode: 'dark', nier: false, reduced: false };
  var key = l.nier ? 'nier' : (LOOKS[l.family] ? l.family : 'basic');
  return { family: l.family, mode: l.mode === 'light' ? 'light' : 'dark', nier: !!l.nier, reduced: !!l.reduced, key: key };
}
function nierPart(name) { return new RegExp('(^|\\s)' + name + '(\\s|$)').test(document.documentElement.getAttribute('data-o55-nier-parts') || ''); }
/* the scheme the Follow look tile shows: the look's own scheme for the mode in the shared catalog (the editor draws
   Follow look from its own token table, which uses the same schemes, D21) and Retro dark's chosen phosphor */
function followScheme(lk) {
  var A = catalogApi(); if (!A) return null;
  var L = lk || lookNow();
  try {
    if (L.key === 'retro' && L.mode === 'dark') return schemeById(A.retroPhosphor && A.retroPhosphor() === 'amber' ? 'pm-phosphor-amber' : 'pm-phosphor-green');
    return schemeById(FOLLOW_SCHEMES[L.key][L.mode === 'light' ? 0 : 1]);
  } catch (_) { return null; }
}
/* resolve(view): every field as the editor draws it now, with Follow look and Reduced Motion applied */
function resolve(view) {
  var L = lookNow(), lk = LOOKS[L.key];
  var f = function (k) { return field(view, k); };
  /* the scheme: 'follow' keeps the look's own token table; a catalog id is drawn through the catalog; "Switch with
     light and dark" swaps a scheme for its family's other version when the app changes mode, but a scheme being
     previewed (hovered) shows exactly as it is */
  var sid = f('scheme'), sch = null;
  if (sid && sid !== 'follow') {
    sch = schemeById(sid);
    if (sch && f('schemePair') && !(view && view.previewAppearance && view.previewAppearance.scheme !== undefined)) sch = pairOf(sch, L.mode);
  }
  var face = FACES[f('font')] ? f('font') : 'jetbrains-mono', FD = FACES[face];
  var weight = Math.min(FD.weights[1], Math.max(FD.weights[0], f('fontWeight') || 400));
  var shape = f('caretShape'); if (shape === 'follow') shape = lk.caretShape;
  var blink = f('caretBlink'); if (blink === 'follow') blink = lk.caretBlink;
  var motion = f('caretMotion'); if (motion === 'follow') motion = lk.caretMotion;
  var trail = f('caretTrail'); if (trail === 'follow') trail = lk.caretTrail;
  /* NieR: its trace is motion, so it needs an installed motion part (Scan sweep); everything else cuts */
  if (L.key === 'nier' && !nierPart('sweep')) trail = 'off';
  var smooth = f('smoothScroll'); if (smooth === null || smooth === undefined) smooth = lk.smoothScroll;
  if (L.reduced) { blink = 'solid'; motion = 'instant'; trail = 'off'; smooth = false; }
  var hl = f('lineHighlight'); if (hl === 'follow') hl = 'all';
  return {
    look: L, lookKey: L.key,
    scheme: sch ? sch.id : 'follow', schemeName: sch ? sch.name : 'Follow look', schemeObj: sch, followScheme: followScheme(L),
    colors: { syntax: !!f('syntax'), bracketPairs: !!f('bracketPairs'), contrast: f('contrast') === 7 ? 7 : 4.5,
      italicComments: f('italicComments'), boldKeywords: f('boldKeywords') },
    font: { id: face, label: FD.label, stack: FD.stack, size: f('fontSize') || 13, weight: weight, weights: FD.weights,
      lineHeight: f('lineHeight') || 1.55, letterSpacing: f('letterSpacing') || 0, ligatures: !!f('ligatures') && FD.ligatures, ligaturesAsked: !!f('ligatures') },
    caret: { shape: shape, width: f('caretWidth') || 2, blink: blink, motion: motion, trail: trail },
    lines: { numbers: !!f('lineNumbers'), relative: !!f('relativeNumbers'), highlight: hl, guides: f('indentGuides') || 'off',
      activeIndent: !!f('activeIndent'), whitespace: f('whitespace') || 'off', rulers: String(f('rulers') || '').split(',').filter(Boolean).map(Number),
      wrap: !!f('wordWrap'), wrapColumn: +f('wrapColumn') || 0, minimap: !!f('minimap'), sticky: !!f('stickyScroll'), stickyLines: f('stickyLines') || 3 },
    motion: { smoothScroll: !!smooth, reveal: !!f('reveal') && !L.reduced, pastEnd: f('scrollPastEnd') || 'little', inactiveDim: !!f('inactiveDim'),
      scanlines: !!f('scanlines'), glow: !!f('glow') },
    behavior: { diffLayout: f('diffLayout') || 'auto', gotoHighlightMs: f('gotoHighlightMs') || 5000, autosave: String(f('autosave') || 'off'),
      diagnostics: f('diagnostics') || 'warnings', hoverDelay: f('hoverDelay') }
  };
}

/* ---- the views (the editor instances and the Customize preview) ---- */
var views = new Set();
function refreshAll() {
  views.forEach(function (v) { try { v.applyLook(resolve(v)); } catch (err) { try { console.error('[pm-home] editor look apply failed', err); } catch (_) {} } });
  events.emit('change');
}

/* ---- writes ---- */
function writeHost(k, v) {
  var s = host(); if (!s) return;
  writing++;
  try { s.set(hostKey(k), v === undefined ? null : v); } catch (err) { try { console.warn('[pm-home] editor look host write failed', err); } catch (_) {} }
  writing--;
}
/* setMany(scope, { field: value | null }, view): one write for several fields (a quick set), so Settings records one
   transaction and every editor repaints once. null clears the field in that scope. "All editors" goes to Settings
   when a Project's Settings can be written, and to the earlier store otherwise */
function setMany(scope, patch, view) {
  var keys = Object.keys(patch || {}).filter(function (k) { return has(FIELDS, k); });
  if (!keys.length) return true;
  if (scope === 'tab' && view) {
    view.tabAppearance = view.tabAppearance || {};
    keys.forEach(function (k) { var v = patch[k]; if (v === null || v === undefined) delete view.tabAppearance[k]; else view.tabAppearance[k] = v; });
    if (typeof view.saveLook === 'function') view.saveLook(view.tabAppearance);
    try { view.applyLook(resolve(view)); } catch (_) {}
    events.emit('change');
    return true;
  }
  var b = settingsReady() ? bridge() : null, rows = {}, rest = {}, ok = true;
  keys.forEach(function (k) {
    delete liveApp[k];
    var L = LINK[k], v = patch[k];
    if (b && L) {
      var out = v === null || v === undefined ? null : L.out(v);
      if (out !== undefined) { rows[L.id] = out; return; }
    }
    rest[k] = v;
  });
  if (b && Object.keys(rows).length) {
    writing++;
    try { ok = b.set(rows) !== false; } catch (err) { ok = false; try { console.warn('[pm-home] editor Settings write failed', err); } catch (_) {} }
    writing--;
    slVer = -1;
    /* Settings holds it now: the earlier copy of the same field would only come back when the row is reset */
    if (ok) Object.keys(LINK).forEach(function (k) { if (has(rows, LINK[k].id) && hostLayer(k) !== undefined) writeHost(k, null); });
    else Object.keys(LINK).forEach(function (k) { if (has(rows, LINK[k].id)) rest[k] = patch[k]; });
  }
  Object.keys(rest).forEach(function (k) { writeHost(k, rest[k]); });
  refreshAll();
  return ok;
}
function set(scope, key, value, view) { var p = {}; p[key] = value; return setMany(scope, p, view); }
/* a value shown at once while a slider moves; commit() writes it when the slider is let go */
function live(scope, key, value, view) {
  if (scope === 'tab' && view) {
    view.tabAppearance = view.tabAppearance || {}; view.tabAppearance[key] = value;
    try { view.applyLook(resolve(view)); } catch (_) {}
    events.emit('change'); return;
  }
  liveApp[key] = value; refreshAll();
}
function commit(scope, key, view) {
  if (scope === 'tab') return set('tab', key, view && view.tabAppearance ? view.tabAppearance[key] : null, view);
  if (!has(liveApp, key)) return true;
  return set(scope, key, liveApp[key], view);
}
function resetScope(scope, view) {
  if (scope === 'tab' && view) {
    view.tabAppearance = {};
    if (typeof view.saveLook === 'function') view.saveLook({});
    try { view.applyLook(resolve(view)); } catch (_) {}
    events.emit('change'); return;
  }
  liveApp = {};
  var patch = {};
  Object.keys(FIELDS).forEach(function (k) { if (own('app', null, k) !== undefined) patch[k] = null; });
  if (Object.keys(patch).length) setMany('app', patch, null); else refreshAll();
}
function preview(view, patch) { view.previewAppearance = patch; try { view.applyLook(resolve(view)); } catch (_) {} }
function endPreview(view) { if (!view || !view.previewAppearance) return; view.previewAppearance = null; try { view.applyLook(resolve(view)); } catch (_) {} }

/* the host model's own writes (another surface, an older binding) repaint every editor */
try {
  var HS = host();
  if (HS && HS.on) HS.on('*', function (e) { var k = e && typeof e === 'object' ? e.key : e; if (!writing && (!k || String(k).indexOf('editor.') === 0)) refreshAll(); });
} catch (_) {}
/* a look change (theme, light or dark, NieR, Reduced Motion) resolves every Follow look field again */
try { PM_HOME.on('look', function () { refreshAll(); }); } catch (_) {}

PMW.edLook = {
  FIELDS: FIELDS, DEFAULTS: DEFAULTS, FACES: FACES, LOOKS: LOOKS, LINK: LINK, WORDS: WORDS, LOOK_KEYS: LOOK_KEYS,
  resolve: function (view) { return resolve(view); },
  attach: function (view) { views.add(view); return function () { views.delete(view); }; },
  get: field, own: own, layerOf: layerOf, set: set, setMany: setMany, live: live, commit: commit, reset: resetScope,
  preview: preview, endPreview: endPreview, refreshAll: refreshAll, settingsReady: settingsReady, settingsValues: settingsLayer,
  catalog: catalogApi, schemes: catalogList, scheme: schemeById, pairOf: pairOf, familyOf: familyOf,
  followScheme: function () { return followScheme(lookNow()); }, look: lookNow,
  onChange: function (fn) { return events.on('change', fn); }
};
