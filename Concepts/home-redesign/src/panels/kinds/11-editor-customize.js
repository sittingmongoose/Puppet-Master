/* The editor's Customize screen (the editor Customize proposal of 2026-10-14; F3-642's Appearance component, the
   editor's surface, beside the terminal's Customize screen, src/terminal/js/77-customize.js). Opened from the editor's
   More menu (Appearance..., "This editor") and from Settings > Editor & Terminal > Editor look (Open Customize, "All
   editors"), as the terminal's is from its menu and from Terminal look.
   It is the terminal screen's sibling and wears its classes (.pmt-cz, 26-customize.css), so the two read as one family
   in every look: a kicker band and the title over a lead line; a live preview beside a side column (what this scope
   changes, as a meter, the quick sets and Try it); a group index; then every option in its group, as tiles that show
   what they choose and chips that say what they turn on; Done at the foot. 66-editor-customize.css adds only the
   editor's own pictures.
     - the preview is a real editor (PMW.editorPreview, the editor's own renderer) on a short Rust file with a change, two
       problems, nested brackets, a long line and trailing spaces, so every option shows on it; it resolves the same
       layers as the editor, so what it shows is what the editor draws
     - the scope switch chooses the layer written: "This editor" (this tab) or "All editors" (the Project's Settings
       rows, code.editing.*; the earlier store where Settings is absent). The preview shows that scope's editor
     - the real editor stays visible through a cut-out in the scrim, framed, and changes beside the preview
     - everything applies live and is saved; sliders show while they move and are written when let go
   It lives in the panels' overlay root (#pmw-overlay, CONTRACT section 14), carries data-lg-surface="menu" for Liquid
   Glass, and closes on Escape, Done, the close button or the scrim, giving the focus back to the editor. */

var EL = function () { return PMW.edLook; };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
var NOTAG = ' data-pm-hover-visual-suppressed="true"';
function tagged(label, detail) { return ' data-pm-hover-label="' + esc(label) + '"' + (detail ? ' data-pm-hover-detail="' + esc(detail) + '"' : ''); }
function reducedNow() { return PMW.reduced ? PMW.reduced() : false; }

/* motion: the terminal's one-shot classes (.pmt-in, .pmt-out; 60-motion.css gives them each look's voice) */
var Motion = {
  finished: function (node, fn) {
    var list = node.isConnected && node.getAnimations ? node.getAnimations({ subtree: true }).filter(function (a) {
      var t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
      return !t || t.endTime !== Infinity;
    }) : [];
    if (!list.length) { fn(); return; }
    var done = false, go = function () { if (!done) { done = true; clearTimeout(timer); fn(); } };
    var timer = setTimeout(go, 900);
    Promise.all(list.map(function (a) { return a.finished.catch(function () {}); })).then(go);
  },
  play: function (node, cls) {
    cls = cls || 'pmt-in';
    var gen = node._pmedGen = (node._pmedGen || 0) + 1;
    node.classList.remove('pmt-out');
    if (node.classList.contains(cls)) { node.classList.remove(cls); void node.offsetWidth; }
    node.classList.add(cls);
    Motion.finished(node, function () { if (node._pmedGen === gen) node.classList.remove(cls); });
  },
  leave: function (node, done) {
    var gen = node._pmedGen = (node._pmedGen || 0) + 1;
    node.classList.remove('pmt-in');
    node.classList.add('pmt-out');
    Motion.finished(node, function () { if (node._pmedGen === gen) { node.classList.remove('pmt-out'); done(); } });
  }
};

/* ---------------- the preview's file ---------------- */
/* a small Rust file from the demo project (Tastebook), written so every option has something to show: a comment, a
   changed line (against BASE), nested brackets, three levels of indentation, trailing spaces, a long line, a warning and
   an error */
var PREVIEW = [
  '// Scale a recipe to the servings asked for',
  'impl Recipe {',
  '    pub fn scaled(&self, n: u32) -> Recipe {',
  '        let k = n as f32 / self.serves.max(1) as f32;',
  '        let steps: Vec<_> = self.steps.iter()   ',
  '            .map(|s| s.scale(k)).collect();',
  '        if steps.is_empty() && n != 0 {',
  '            return Recipe { serves: n, ..self.clone() };',
  '        }',
  '        Recipe { serves: n, steps, ..self.clone() }',
  '    }',
  '',
  '    pub fn summary(&self) -> String {',
  '        format!("{} serves {} in {} steps, about {} minutes from start to finish", self.name, self.serves, self.steps.len(), self.minutes())',
  '    }',
  '}'
].join('\n');
var BASE = PREVIEW.replace('self.serves.max(1) as f32', 'self.serves as f32')
  .replace('        if steps.is_empty() && n != 0 {\n            return Recipe { serves: n, ..self.clone() };\n        }\n', '');
var PV_LINES = PREVIEW.split('\n');
/* where the preview's caret rests: the word "serves" on line 4, selected */
var PV_SEL = { r: 3, a: PV_LINES[3].indexOf('serves'), b: PV_LINES[3].indexOf('serves') + 6 };
function previewProblems() {
  return [
    { sev: 'warn', line: 4, col: PV_LINES[3].indexOf('n as') + 1, msg: 'casting `u32` to `f32` can lose precision above 16,777,216', src: 'clippy cast_precision_loss' },
    { sev: 'error', line: 14, col: PV_LINES[13].indexOf('minutes') + 1, msg: 'no method named `minutes` found for `&Recipe`', src: 'rustc E0599' }
  ];
}

/* ---------------- what the screen offers ---------------- */
var CARETS = [['follow', 'Follow look'], ['line', 'Line'], ['block', 'Block'], ['underline', 'Underline']];
var BLINKS = [['follow', 'Follow look', ''], ['blink', 'Blink', 'On and off'], ['smooth', 'Smooth', 'A fade'], ['expand', 'Expand', 'From its middle'], ['solid', 'Solid', 'Never blinks']];
var MOVES = [['follow', 'Follow look', ''], ['instant', 'Instant', 'Jumps'], ['snappy', 'Snappy', 'A quick glide'], ['glide', 'Gliding', 'A slower glide']];
var TRAILS = [['follow', 'Follow look', ''], ['off', 'Off', 'None'], ['soft', 'Soft', 'A short fade'], ['glow', 'Glow', 'A bright streak'],
  ['phosphor', 'Phosphor', 'An afterglow'], ['trace', 'Trace', 'A thin ink line']];
var GUIDES = [['off', 'Off', 'No guides'], ['plain', 'Lines', 'One tint'], ['rainbow', 'Rainbow', 'A colour a level']];
var FACE_TAGS = { 'jetbrains-mono': 'Code face, ligatures', 'atkinson': 'Easy reading', 'system': 'This computer’s' };
/* quick sets: several existing fields at once, in this scope */
var SETS = [
  { id: 'look', label: 'The look’s own', help: 'Everything follows the look', patch: null },
  { id: 'calm', label: 'Calm', help: 'Nothing moves', patch: { caretBlink: 'solid', caretMotion: 'instant', caretTrail: 'off', smoothScroll: false, reveal: false } },
  { id: 'reading', label: 'Easy reading', help: 'Clear face, roomy lines', patch: { font: 'atkinson', fontSize: 15, lineHeight: 1.75, letterSpacing: 0.25, ligatures: false, contrast: 7, italicComments: false } },
  { id: 'guides', label: 'Show structure', help: 'Guides, brackets, rulers', patch: { indentGuides: 'rainbow', activeIndent: true, bracketPairs: true, rulers: '80,120', whitespace: 'boundary', stickyLines: 5 } }
];
/* the fields the meter counts, in the order the screen shows them */
var GROUP_KEYS = {
  colors: ['scheme', 'schemePair', 'syntax', 'bracketPairs', 'contrast', 'italicComments', 'boldKeywords'],
  text: ['font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'ligatures'],
  caret: ['caretShape', 'caretWidth', 'caretBlink', 'caretMotion', 'caretTrail'],
  lines: ['lineNumbers', 'relativeNumbers', 'lineHighlight', 'indentGuides', 'activeIndent', 'whitespace', 'rulers', 'wordWrap', 'wrapColumn', 'minimap', 'stickyScroll', 'stickyLines'],
  motion: ['smoothScroll', 'reveal', 'scrollPastEnd', 'inactiveDim', 'scanlines', 'glow'],
  behavior: ['diffLayout', 'diagnostics', 'gotoHighlightMs', 'autosave']
};
var COUNTED = [].concat(GROUP_KEYS.colors, GROUP_KEYS.text, GROUP_KEYS.caret, GROUP_KEYS.lines, GROUP_KEYS.motion, GROUP_KEYS.behavior);
var GROUPS = [['colors', 'Colors'], ['text', 'Text'], ['caret', 'Caret'], ['lines', 'Lines & guides'], ['motion', 'Motion & effects'], ['behavior', 'Behavior']];

/* ---------------- markup ---------------- */
function ghead(id, title, lead) {
  return '<header class="pmt-cz-ghead"><h3 id="pmed-cz-g-' + id + '">' + esc(title) + '</h3><span class="pmt-cz-gcount" data-count="' + id + '"></span>' +
    '<button type="button" class="pmt-textbtn pmt-cz-greset" data-act="group-reset" data-group="' + id + '" hidden' + NOTAG + '>Reset ' + esc(title.toLowerCase()) + '</button></header>' +
    (lead ? '<p class="pmt-cz-glead">' + esc(lead) + '</p>' : '');
}
/* a one-of-several row in the panels' chosen-fill grammar (45-frames.css), its ink moving between the choices */
function seg(key, opts, label) {
  return '<div class="pmt-cz-seg pmw-ink-row" role="radiogroup" aria-label="' + esc(label) + '" data-seg="' + key + '">' + opts.map(function (o) {
    return '<button type="button" class="pmt-cz-segopt pmw-ink-opt" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(o[0]) + '"' + NOTAG + '>' + esc(o[1]) + '</button>';
  }).join('') + '</div>';
}
function field(label, ctl, help, attrs) {
  return '<div class="pmt-cz-field"' + (attrs || '') + '><span class="pmt-cz-flabel">' + esc(label) + '</span>' + ctl + (help != null ? '<span class="pmt-cz-fhelp"' + (help === '' ? '' : '') + '>' + esc(help) + '</span>' : '') + '</div>';
}
/* help may name code (`->`), drawn in the code face with nothing joined, so the words show what they mean */
function helpHtml(t) { return esc(t).replace(/`([^`]+)`/g, '<code class="pmed-code">$1</code>'); }
function chip(key, name, help, extra, art) {
  return '<div class="pmt-cz-chipbox" data-chip="' + key + '"><button type="button" class="pmt-cz-chip" role="switch" aria-checked="false" data-key="' + key + '" data-pmh="tile"' + NOTAG + '>' +
    '<span class="pmt-cz-pins" aria-hidden="true"><i></i><i></i><i></i></span><span class="pmt-cz-chipcopy"><span class="pmt-cz-chipname">' + esc(name) + '</span>' +
    '<span class="pmt-cz-chiphelp">' + helpHtml(help) + '</span><span class="pmt-cz-chipfoot"><span class="pmt-cz-chipstate">Off</span><span class="pmt-cz-mine">Changed</span></span></span>' +
    (art ? '<span class="pmt-cz-art ' + art + '" aria-hidden="true"></span>' : '') + '</button>' + (extra || '') + '</div>';
}
function slider(key, label, min, max, step, bare) {
  return '<label class="pmt-cz-slider' + (bare ? ' pmed-slider-bare' : '') + '" data-slider="' + key + '"><span class="pmt-cz-slabel">' + esc(label) + '</span>' +
    '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '"' + tagged(label) + NOTAG + '>' +
    '<output class="pmt-cz-out"></output></label>';
}
function tile(key, value, label, art, meta) {
  return '<button type="button" class="pmt-cz-tile" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(value) + '" data-pmh="tile"' + NOTAG + '>' +
    '<span class="pmt-cz-thumb">' + (art || '') + '</span><span class="pmt-cz-tname">' + esc(label) + '</span>' + (meta ? '<span class="pmt-cz-tmeta">' + esc(meta) + '</span>' : '') + '</button>';
}
/* a scheme as a tiny editor: its ground, two lines of code in its syntax colours and its bracket colours */
function codeArt(c) {
  return '<span class="pmed-sw" style="background:' + esc(c.bg) + ';color:' + esc(c.fg) + '">' +
    '<span class="pmed-swl"><b style="color:' + esc(c.kw) + '">fn</b> <i style="color:' + esc(c.fn) + '">scale</i><u style="color:' + esc(c.b0) + '">(</u>n<u style="color:' + esc(c.b0) + '">)</u> <u style="color:' + esc(c.b0) + '">{</u></span>' +
    '<span class="pmed-swl">  <b style="color:' + esc(c.kw) + '">let</b> s = <i style="color:' + esc(c.str) + '">"cups"</i>;</span>' +
    '<span class="pmed-swl pmed-swc" style="color:' + esc(c.com) + '">  // ' + esc(c.word || 'ok') + '</span></span>';
}
function schemeColors(s) {
  var A = EL().catalog(); if (!A || !s) return null;
  var t = A.editorTokens(s.id) || {}, p = A.palette(s.id) || {};
  return { bg: p.background, fg: p.foreground, kw: t.kw, fn: t.fn, str: t.str, com: t.com, b0: (p.ansi || [])[3] || t.ty };
}
function schemeTiles() {
  var list = EL().schemes(), out = [], fam = null;
  out.push('<button type="button" class="pmt-cz-tile pmt-cz-scheme" role="radio" aria-checked="false" data-key="scheme" data-value="follow" data-name="follow look" data-pmh="tile"' + NOTAG + '>' +
    '<span class="pmt-cz-thumb" data-follow-art></span><span class="pmt-cz-tname">Follow look</span><span class="pmt-cz-tmeta" data-follow-meta></span></button>');
  list.forEach(function (s) {
    var f = EL().familyOf(s);
    if (f !== fam) { fam = f; out.push('<span class="pmt-cz-fam" role="presentation">' + esc(fam) + '</span>'); }
    var c = schemeColors(s);
    out.push('<button type="button" class="pmt-cz-tile pmt-cz-scheme" role="radio" aria-checked="false" data-key="scheme" data-value="' + esc(s.id) + '" data-name="' + esc((s.name + ' ' + f).toLowerCase()) + '" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-thumb">' + (c ? codeArt(c) : '') + '</span><span class="pmt-cz-tname">' + esc(s.name) + '</span><span class="pmt-cz-tmeta">' + (s.mode === 'light' ? 'Light' : 'Dark') + '</span></button>');
  });
  return out.join('');
}
function faceTiles() {
  var F = EL().FACES;
  return Object.keys(F).map(function (id) {
    return tile('font', id, F[id].label, '<span class="pmt-cz-face pmed-face" style="font-family:' + esc(F[id].stack) + '">Ab 0O {}<em>-&gt; !=</em></span>', FACE_TAGS[id] || '');
  }).join('');
}
function caretArt(shape) { return '<span class="pmed-cur pmed-cur-' + shape + '"><span>let s</span><i></i><span>= 1</span></span>'; }
function blinkArt(kind) { return '<span class="pmed-cur pmed-cur-line pmed-blink-' + kind + '"><span>s.len()</span><i></i></span>'; }
function moveArt(kind) { return '<span class="pmed-move pmed-move-' + kind + '"><b></b><b></b><i></i></span>'; }
function trailArt(kind) { return '<span class="pmt-cz-trail pmt-cz-trail-' + kind + '"><i></i><b></b></span>'; }
function guideArt(kind) { return '<span class="pmed-guides pmed-guides-' + kind + '"><span></span><span></span><span></span><span></span></span>'; }

function skeleton(name) {
  var F = EL().FIELDS, html = '';
  html += '<div class="pmt-cz-scrim" data-act="scrim" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="pmt-cz-frame" aria-hidden="true"><span class="pmt-cz-framelabel">This editor</span></div>';
  html += '<section class="pmt-cz-dialog" role="dialog" aria-modal="true" aria-labelledby="pmed-cz-title" aria-describedby="pmed-cz-lead" tabindex="-1" data-lg-surface="menu">';
  html += '<header class="pmt-cz-head"><div class="pmt-cz-titles"><p class="pmt-cz-kicker"><span>' + esc('Customize · ' + name) + '</span></p>' +
    '<h2 class="pmt-cz-title" id="pmed-cz-title">Editor appearance</h2>' +
    '<p class="pmt-cz-lead" id="pmed-cz-lead">Pick what you want to change. The preview and this editor show it at once, and it is saved.</p></div>' +
    '<div class="pmt-cz-scope">' + seg('scope', [['tab', 'This editor'], ['app', 'All editors']], 'Apply to') + '<span class="pmt-cz-scopewhy" data-scope-why></span></div>' +
    '<button type="button" class="pmt-pop-x pmt-cz-x" data-act="close" aria-label="Close" aria-keyshortcuts="Escape"' + tagged('Close', 'Every change is already applied') + '><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></header>';
  html += '<div class="pmt-cz-body pmt-calm">';
  /* top: the preview and the side column */
  html += '<div class="pmt-cz-top"><figure class="pmt-cz-preview"><figcaption class="pmt-cz-pvcap"><span class="pmt-cz-pvtitle">Preview</span><span class="pmt-cz-pvdesc" data-pv-desc></span></figcaption>' +
    '<div class="pmt-cz-pvbox pmed-pvbox" data-pv-box inert></div></figure>' +
    '<aside class="pmt-cz-side"><div class="pmt-cz-meter"><div class="pmt-cz-meterhead"><span data-meter-scope>This editor</span><b data-meter-n></b></div>' +
    '<div class="pmt-cz-cells" aria-hidden="true" style="grid-template-columns: repeat(' + COUNTED.length + ', 1fr)">' + COUNTED.map(function () { return '<i></i>'; }).join('') + '</div></div>' +
    '<div class="pmt-cz-sets" role="group" aria-label="Quick sets">' + SETS.map(function (s) {
      return '<button type="button" class="pmt-cz-set" aria-pressed="false" data-set="' + s.id + '" data-pmh="tile"' + NOTAG + '><span>' + esc(s.label) + '</span><small>' + esc(s.help) + '</small></button>';
    }).join('') + '</div>' +
    '<div class="pmt-cz-try" role="group" aria-label="Try it in the preview"><span class="pmt-cz-trylabel">Try it</span>' +
    '<button type="button" class="pmt-textbtn" data-act="try-move"' + NOTAG + '>Move the caret</button>' +
    '<button type="button" class="pmt-textbtn" data-act="try-type"' + NOTAG + '>Type</button>' +
    '<button type="button" class="pmt-textbtn" data-act="try-problem"' + NOTAG + '>Go to a problem</button>' +
    '<button type="button" class="pmt-textbtn" data-act="try-dim"' + NOTAG + '>Step back</button></div>' +
    '<p class="pmt-cz-note" data-note-side hidden></p></aside></div>';
  /* the group index; the preview docks here, small, while its own place is scrolled away */
  html += '<nav class="pmt-cz-nav" aria-label="Groups">' + GROUPS.map(function (g) { return '<button type="button" class="pmt-textbtn" data-jump="' + g[0] + '"' + NOTAG + '>' + esc(g[1]) + '<span class="pmt-cz-navn" data-navn="' + g[0] + '"></span></button>'; }).join('') +
    '<div class="pmt-cz-dock" data-dock hidden aria-hidden="true"><span class="pmt-cz-docktitle">Preview</span><div class="pmt-cz-dockbox pmed-pvbox" data-dock-box></div></div></nav>';
  /* colours */
  html += '<section class="pmt-cz-group" data-group="colors" aria-labelledby="pmed-cz-g-colors">' + ghead('colors', 'Colors', 'One catalog with the terminal. Hover a scheme to see it here and on the editor; click to keep it.') +
    '<div class="pmt-cz-findrow"><input class="pmt-cz-search pmt-pop-search" type="search" placeholder="Find a scheme" aria-label="Find a scheme"' + NOTAG + '><span class="pmt-cz-findn" data-find-n></span></div>' +
    '<div class="pmt-cz-tiles pmt-cz-schemes" role="radiogroup" aria-label="Code colours">' + schemeTiles() + '</div>' +
    '<p class="pmt-cz-note" data-note-colors hidden></p>' +
    '<div class="pmt-cz-chips">' + chip('schemePair', 'Switch with light and dark', 'A scheme you pick swaps for its family’s other version when the app changes mode.') +
    chip('syntax', 'Colour code by meaning', 'Keywords, strings, names and comments each in their own colour. Off draws all code in the text colour.', '', 'pmed-art-syntax') +
    chip('bracketPairs', 'Bracket pair colours', 'Matching brackets share a colour, a new one at each depth; a stray closing one shows in red.', '', 'pmed-art-brackets') + '</div>' +
    '<div class="pmt-cz-grid2">' + field('Text contrast', seg('contrast', [[4.5, '4.5:1'], [7, '7:1']], 'Text contrast'), 'Every colour keeps at least this contrast. 7:1 moves dim ones lighter or darker; hue stays.') +
    field('Comments in italics', seg('italicComments', [['follow', 'Follow look'], ['on', 'On'], ['off', 'Off']], 'Comments in italics')) +
    field('Keywords in bold', seg('boldKeywords', [['follow', 'Follow look'], ['on', 'On'], ['off', 'Off']], 'Keywords in bold')) + '</div>' +
    '<div class="pmt-cz-import"><button type="button" class="pmt-textbtn" data-act="import"' + tagged('Import a scheme', 'Adds a colour scheme from a file to the catalog the editor and the terminal share') + '>Import a scheme…</button>' +
    '<span class="pmt-cz-fhelp">iTerm2, Windows Terminal, kitty, Ghostty, Alacritty, base16 or base24, Xresources</span>' +
    '<p class="pmt-cz-error" data-import-error role="alert" hidden></p></div></section>';
  /* text */
  html += '<section class="pmt-cz-group" data-group="text" aria-labelledby="pmed-cz-g-text">' + ghead('text', 'Text') +
    '<div class="pmt-cz-tiles pmt-cz-faces" role="radiogroup" aria-label="Face">' + faceTiles() + '</div>' +
    '<div class="pmt-cz-grid2">' +
    '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Size</span><span class="pmt-stepper pmt-cz-stepper"><button type="button" class="pmt-step" data-step="-0.5" aria-label="Smaller"' + tagged('Smaller', 'Text size half a pixel smaller') + '>−</button>' +
    '<output class="pmt-cz-out" data-out="fontSize"></output><button type="button" class="pmt-step" data-step="0.5" aria-label="Bigger"' + tagged('Bigger', 'Text size half a pixel bigger') + '>+</button></span>' +
    '<button type="button" class="pmt-textbtn pmt-cz-default" data-act="default" data-key="fontSize"' + NOTAG + '>13 px, the default</button></div>' +
    '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Weight</span>' + seg('fontWeight', [[200, 'Extra light'], [300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Heavy']], 'Weight') +
    '<span class="pmt-cz-fhelp" data-weight-why></span></div>' +
    slider('lineHeight', 'Line spacing', F.lineHeight.min, F.lineHeight.max, F.lineHeight.step) +
    slider('letterSpacing', 'Letter spacing', F.letterSpacing.min, F.letterSpacing.max, F.letterSpacing.step) +
    '</div><div class="pmt-cz-chips">' + chip('ligatures', 'Ligatures', 'Joins `->` and `!=` into one symbol where the face has them. Each still takes its own columns.', '', 'pmed-art-lig') + '</div>' +
    '<p class="pmt-cz-note" data-note-text hidden></p></section>';
  /* caret */
  html += '<section class="pmt-cz-group" data-group="caret" aria-labelledby="pmed-cz-g-caret">' + ghead('caret', 'Caret') +
    '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Caret shape">' + CARETS.map(function (c) { return tile('caretShape', c[0], c[1], caretArt(c[0] === 'follow' ? 'look' : c[0]), ''); }).join('') + '</div>' +
    '<div class="pmt-cz-grid2" data-when-line>' + slider('caretWidth', 'Line width', 1, 4, 1) + '</div>' +
    '<h4 class="pmt-cz-sub">Blink</h4>' +
    '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Blink">' + BLINKS.map(function (b) { return tile('caretBlink', b[0], b[1], blinkArt(b[0] === 'follow' ? 'look' : b[0]), b[2]); }).join('') + '</div>' +
    '<h4 class="pmt-cz-sub">Movement</h4>' +
    '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Caret movement">' + MOVES.map(function (m) { return tile('caretMotion', m[0], m[1], moveArt(m[0] === 'follow' ? 'look' : m[0]), m[2]); }).join('') + '</div>' +
    '<h4 class="pmt-cz-sub">Trail when the caret jumps</h4>' +
    '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Caret trail">' + TRAILS.map(function (t) { return tile('caretTrail', t[0], t[1], trailArt(t[0] === 'follow' ? 'look' : t[0]), t[2]); }).join('') + '</div>' +
    '<p class="pmt-cz-fhelp pmt-cz-more">A trail shows where the caret went when it jumps several lines you did not point at: a search match, a line you named, a page, a change.</p>' +
    '<p class="pmt-cz-note" data-note-caret hidden></p></section>';
  /* lines and guides */
  html += '<section class="pmt-cz-group" data-group="lines" aria-labelledby="pmed-cz-g-lines">' + ghead('lines', 'Lines & guides') +
    '<div class="pmt-cz-grid2">' + field('Line numbers', seg('lineNumberMode', [['on', 'On'], ['relative', 'Count from the caret'], ['off', 'Off']], 'Line numbers')) +
    field('Highlight the current line', seg('lineHighlight', [['follow', 'Follow look'], ['all', 'Line and number'], ['line', 'Line'], ['gutter', 'Number'], ['off', 'Off']], 'Highlight the current line')) + '</div>' +
    '<h4 class="pmt-cz-sub">Indent guides</h4>' +
    '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Indent guides">' + GUIDES.map(function (g) { return tile('indentGuides', g[0], g[1], guideArt(g[0]), g[2]); }).join('') + '</div>' +
    '<div class="pmt-cz-chips">' + chip('activeIndent', 'Light the guide of the block I’m in', 'The guide of the block that holds the caret is drawn brighter.') + '</div>' +
    '<div class="pmt-cz-grid2">' + field('Show spaces', seg('whitespace', [['off', 'Off'], ['boundary', 'Between words'], ['selection', 'In the selection'], ['trailing', 'At line ends'], ['all', 'Everywhere']], 'Show spaces'), 'Faint dots where the spaces are.') +
    field('Rulers', seg('rulers', [['', 'Off'], ['80', '80'], ['100', '100'], ['120', '120'], ['80,120', '80 and 120']], 'Rulers'), 'Faint lines at the columns lines should stay within.') + '</div>' +
    '<div class="pmt-cz-chips">' + chip('wordWrap', 'Wrap long lines', 'Long lines fold onto the next row, keeping their indent, so you never scroll sideways.', '<div class="pmt-cz-chipmore" data-more="wordWrap">' +
      field('Wrap at', seg('wrapColumn', [[0, 'Window edge'], [80, '80'], [100, '100'], [120, '120']], 'Wrap at')) + '</div>', 'pmed-art-wrap') +
    chip('minimap', 'Minimap scrollbar', 'The scrollbar draws a small map of the file with its change marks. Off draws a plain one.', '', 'pmed-art-minimap') +
    chip('stickyScroll', 'Sticky scroll', 'The lines that open the block you are reading stay at the top.', '<div class="pmt-cz-chipmore" data-more="stickyScroll">' + slider('stickyLines', 'Lines', 1, 5, 1) + '</div>', 'pmed-art-sticky') + '</div>' +
    '<p class="pmt-cz-note" data-note-lines hidden></p></section>';
  /* motion and effects */
  html += '<section class="pmt-cz-group" data-group="motion" aria-labelledby="pmed-cz-g-motion">' + ghead('motion', 'Motion & effects', 'Nothing here moves while the editor is idle.') +
    '<div class="pmt-cz-grid2">' + field('Smooth scrolling', seg('smoothScroll', [['follow', 'Follow look'], ['on', 'On'], ['off', 'Off']], 'Smooth scrolling'), 'A wheel’s notches, a page and a jump to a line glide instead of jumping. A trackpad scrolls as it always does.') +
    field('Scroll past the last line', seg('scrollPastEnd', [['little', 'A few lines'], ['half', 'Half a page'], ['page', 'A full page']], 'Scroll past the last line')) + '</div>' +
    '<div class="pmt-cz-chips pmt-cz-fxchips">' +
    chip('reveal', 'Lines arrive when a file opens', 'The first screen of a file arrives line by line from the top, quickly.', '', 'pmed-art-reveal') +
    chip('inactiveDim', 'Fade editors I’m not in', 'While you work in another panel, editors you are not in step back a little.', '', 'pmt-cz-art-inactiveDim') +
    chip('scanlines', 'Scanlines', 'Thin still lines across the code, like an old monitor.', '', 'pmt-cz-art-scanlines') +
    chip('glow', 'Text glow', 'A soft glow around code in its own colour, like phosphor on a tube.', '', 'pmt-cz-art-glow') + '</div>' +
    '<p class="pmt-cz-note" data-note-motion hidden></p></section>';
  /* behaviour */
  html += '<section class="pmt-cz-group" data-group="behavior" aria-labelledby="pmed-cz-g-behavior">' + ghead('behavior', 'Behavior') +
    '<div class="pmt-cz-grid2">' + field('Diff layout', seg('diffLayout', [['auto', 'Automatic'], ['side', 'Side by side'], ['inline', 'Inline']], 'Diff layout'), 'Automatic shows the two sides side by side when the tab is wide enough.') +
    field('Problems to highlight', seg('diagnostics', [['off', 'Off'], ['errors', 'Errors'], ['warnings', 'And warnings'], ['all', 'Everything']], 'Problems to highlight'), 'A wavy line under each one; rest the pointer on it to read it.') +
    field('Save automatically', seg('autosave', [['off', 'Off'], ['500', 'After 0.5 s'], ['1000', 'After 1 s'], ['focus', 'When I leave']], 'Save automatically'), 'A pause after you stop typing, or when the focus leaves the file.') +
    '<div class="pmt-cz-field"><span class="pmt-cz-flabel">A jumped-to line stays lit</span>' + slider('gotoHighlightMs', 'For', F.gotoHighlightMs.min, F.gotoHighlightMs.max, F.gotoHighlightMs.step, true) +
    '<span class="pmt-cz-fhelp">A line opened from the chat, a problem or Go to line is lit this long, then fades.</span></div></div>' +
    '<p class="pmt-cz-fhelp pmt-cz-more">Language servers, formatters, file encoding and big-file limits are in Settings, Editor & Terminal and Toolchain.</p></section>';
  html += '</div>';
  html += '<footer class="pmt-cz-foot"><button type="button" class="pmt-textbtn" data-act="reset"' + NOTAG + '>Reset this editor</button><span class="pmt-cz-footn" data-foot-n></span>' +
    '<span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn pmt-textbtn-primary pmt-cz-done" data-act="close"' + tagged('Done', 'Every change is already applied and saved') + '>Done</button></footer>';
  html += '</section>';
  return html;
}

/* ---------------- the screen ---------------- */
var openRoot = null;
function open(opts) {
  opts = opts || {};
  if (!EL()) return null;
  var inst = opts.view && opts.view.editor ? opts.view.editor() : (PMW.editorInView ? PMW.editorInView() : null);
  if (!inst || !inst.view) return null;
  var v = inst.view;
  if (openRoot && openRoot._pmedClose) openRoot._pmedClose(true);
  var overlay = PMW.overlay ? PMW.overlay() : document.body;
  var root = el('div', 'pmt-cz pmed-cz pmt-calm');
  root.setAttribute('data-pmw-overlay', 'editor-appearance');
  var label = (inst.root && inst.root.querySelector('.pmw-ed-seg.is-file') || {}).textContent || 'Editor';
  root.innerHTML = skeleton(label);
  overlay.appendChild(root);
  openRoot = root;
  var dialog = root.querySelector('.pmt-cz-dialog'), body = root.querySelector('.pmt-cz-body');
  var scope = opts.scope === 'app' ? 'app' : 'tab';
  var anchor = opts.anchor || null;
  var inks = {};
  [].forEach.call(root.querySelectorAll('.pmw-ink-row'), function (row) { try { if (PMW.frames && PMW.frames.ink) inks[row.getAttribute('data-seg')] = PMW.frames.ink(row); } catch (_) {} });

  /* the preview: a live editor whose view is this scope's (this tab's own choices, or none) plus the hovered scheme */
  var pvView = { tabAppearance: scope === 'tab' ? v.tabAppearance || {} : {}, previewAppearance: null };
  var homeBox = root.querySelector('[data-pv-box]'), dockBox = root.querySelector('[data-dock-box]'), dock = root.querySelector('[data-dock]');
  var pvHost = el('div', 'pmed-pvhost');
  homeBox.appendChild(pvHost);
  var preview = null;
  try {
    preview = PMW.editorPreview(pvHost, { text: PREVIEW, base: BASE, language: 'rust', title: 'recipe.rs', problems: previewProblems(), view: pvView,
      caret: { r: PV_SEL.r, c: PV_SEL.b, ar: PV_SEL.r, ac: PV_SEL.a } });
  } catch (err) { try { console.error('[pm-home] the editor preview could not start', err); } catch (_) {} }

  function scopeView() { return scope === 'tab' ? v : { tabAppearance: {}, previewAppearance: v.previewAppearance }; }
  function eff() { return EL().resolve(scopeView()); }
  function val(key) { var o = EL().own(scope, v, key); return o !== undefined ? o : EL().get(scopeView(), key); }
  function mine(key) {
    if (key === 'lineNumberMode') return mine('lineNumbers') || mine('relativeNumbers');
    return EL().own(scope, v, key) !== undefined;
  }
  function syncPreview() {
    pvView.tabAppearance = scope === 'tab' ? v.tabAppearance || {} : {};
    pvView.previewAppearance = v.previewAppearance || null;
    if (pvView.applyLook) pvView.applyLook(EL().resolve(pvView));
  }
  function write(patch) { EL().setMany(scope, patch, v); syncPreview(); paint(); }
  function put(key, value) { var p = {}; p[key] = value; write(p); }

  /* ---- painting: every control shows this scope's value ---- */
  var setA = function (e, n, x) { if (e && e.getAttribute(n) !== x) e.setAttribute(n, x); };
  function fmt(key, x) {
    if (x === null || x === undefined || x === '' || isNaN(x)) return '';
    if (key === 'lineHeight') return Number(x).toFixed(2) + '×';
    if (key === 'letterSpacing' || key === 'caretWidth' || key === 'fontSize') return (Math.round(x * 100) / 100) + ' px';
    if (key === 'gotoHighlightMs') return (Math.round(x / 100) / 10) + ' s';
    if (key === 'stickyLines') return String(x) + (x === 1 ? ' line' : ' lines');
    return String(x);
  }
  function triWord(v0) { return v0 === null || v0 === undefined ? 'follow' : v0 ? 'on' : 'off'; }
  function current(key, R) {
    if (key === 'scope') return scope;
    if (key === 'lineNumberMode') return !R.lines.numbers ? 'off' : R.lines.relative ? 'relative' : 'on';
    if (key === 'fontWeight') return R.font.weight;
    if (key === 'italicComments' || key === 'boldKeywords' || key === 'smoothScroll') return triWord(val(key));
    if (key === 'scheme') return val('scheme') || 'follow';
    return val(key);
  }
  function note(sel, text) { var e = root.querySelector(sel); if (!e) return; e.hidden = !text; if (e.textContent !== text) e.textContent = text; }
  function paint() {
    var R = eff(), lk = R.lookKey, isNier = lk === 'nier';
    root.setAttribute('data-pmt-look', lk);
    root.setAttribute('data-pmt-mode', R.look.mode === 'light' ? 'light' : 'dark');
    root.setAttribute('data-scope', scope);
    root.classList.toggle('pmt-cz-reduced', !!R.look.reduced);
    /* the effect pictures are drawn in this scope's own colours (the terminal's art reads these) */
    var codeEl = inst.root && inst.root.querySelector('.pmw-ed-scroll');
    if (codeEl) {
      var cs = getComputedStyle(codeEl);
      root.style.setProperty('--pmt-cz-sfg', cs.getPropertyValue('--pmw-ed-fg').trim() || '#ccc');
      root.style.setProperty('--pmt-cz-sbg', cs.getPropertyValue('--pmw-ed-gutbg').trim() || '#111');
      root.style.setProperty('--pmt-cz-sglow', cs.getPropertyValue('--pmw-ed-s-str').trim() || '#8f8');
    }
    [].forEach.call(root.querySelectorAll('[role="radio"][data-key]'), function (b) {
      var key = b.getAttribute('data-key');
      setA(b, 'aria-checked', String(String(current(key, R)) === b.getAttribute('data-value')));
    });
    var on = { schemePair: !!val('schemePair'), syntax: R.colors.syntax, bracketPairs: R.colors.bracketPairs, ligatures: R.font.ligaturesAsked,
      activeIndent: R.lines.activeIndent, wordWrap: R.lines.wrap, minimap: R.lines.minimap, stickyScroll: R.lines.sticky,
      reveal: !!val('reveal'), inactiveDim: R.motion.inactiveDim, scanlines: R.motion.scanlines, glow: R.motion.glow };
    [].forEach.call(root.querySelectorAll('.pmt-cz-chip'), function (c) {
      var key = c.getAttribute('data-key'), o = !!on[key];
      setA(c, 'aria-checked', String(o));
      var st = c.querySelector('.pmt-cz-chipstate'), word = o ? 'On' : 'Off';
      if (key === 'reveal' && R.look.reduced) word = 'Off · Reduce motion';
      if (key === 'ligatures' && o && !R.font.ligatures) word = 'On · this face has none';
      if (st.textContent !== word) st.textContent = word;
      c.classList.toggle('pmt-cz-is-mine', mine(key));
      var box = c.parentNode, more = box.querySelector('.pmt-cz-chipmore'); if (more) more.hidden = !o;
      box.classList.toggle('pmt-cz-lit', o);
    });
    [].forEach.call(root.querySelectorAll('input[type="range"][data-key]'), function (r) {
      var key = r.getAttribute('data-key'), x = val(key);
      if (document.activeElement !== r) r.value = String(x);
      var out = r.parentNode.querySelector('output'); if (out) out.textContent = fmt(key, Number(r.value));
      r.closest('[data-slider]').classList.toggle('pmt-cz-is-mine', mine(key));
    });
    var fs = root.querySelector('[data-out="fontSize"]'); if (fs) fs.textContent = fmt('fontSize', R.font.size);
    setA(root.querySelector('[data-act="default"][data-key="fontSize"]'), 'aria-disabled', String(!mine('fontSize')));
    root.querySelector('[data-when-line]').hidden = R.caret.shape !== 'line';
    root.querySelector('[data-chip="activeIndent"]').hidden = R.lines.guides === 'off';
    /* weights the face has */
    var wr = R.font.weights;
    [].forEach.call(root.querySelectorAll('[data-key="fontWeight"]'), function (b) { var n = Number(b.getAttribute('data-value')); b.hidden = !wr || n < wr[0] || n > wr[1]; });
    var why = root.querySelector('[data-weight-why]'), wtxt = R.font.id === 'jetbrains-mono' ? 'JetBrains Mono comes from Regular to Heavy here.' : '';
    if (why.textContent !== wtxt) why.textContent = wtxt;
    /* the Follow look tile: the look's own colours, read from the editor's own tokens */
    var fa = root.querySelector('[data-follow-art]');
    if (fa && inst.root) {
      var rs = getComputedStyle(inst.root), g = function (n) { return rs.getPropertyValue(n).trim(); };
      var sig = lk + R.look.mode + g('--pmw-ed-s-kw');
      if (fa.getAttribute('data-for') !== sig) {
        fa.innerHTML = codeArt({ bg: g('--pmw-ed-gutbg') || g('--pmw-ed-bg'), fg: g('--pmw-ed-fg'), kw: g('--pmw-ed-s-kw'), fn: g('--pmw-ed-s-fn'), str: g('--pmw-ed-s-str'), com: g('--pmw-ed-s-com'), b0: g('--pmw-ed-bp-0'), word: 'the look' });
        fa.setAttribute('data-for', sig);
      }
    }
    var fm = root.querySelector('[data-follow-meta]'), fs2 = EL().followScheme(), ftxt = fs2 ? 'Like ' + fs2.name : 'The look’s own';
    if (fm.textContent !== ftxt) fm.textContent = ftxt;
    /* notes */
    note('[data-note-colors]', pairNote || (R.scheme !== 'follow' && R.schemeObj && val('scheme') !== R.scheme ? 'Showing ' + R.schemeName + ', the ' + (R.look.mode === 'light' ? 'light' : 'dark') + ' version of your pick, because the app is ' + R.look.mode + '.' : ''));
    note('[data-note-text]', R.font.ligaturesAsked && !R.font.ligatures ? R.font.label + ' has no ligatures, so -> and != stay as they are.' : '');
    note('[data-note-caret]', R.look.reduced ? 'Reduce motion is on, so the caret does not blink, glide or leave a trail.' :
      isNier && !/(^|\s)sweep(\s|$)/.test(document.documentElement.getAttribute('data-o55-nier-parts') || '') && val('caretTrail') !== 'off' ? 'NieR’s trace needs its Scan sweep part; with it removed the trail stays off.' : '');
    var ln = [];
    if (val('wrapColumn') && !R.lines.wrap) ln.push('Wrap at applies while Wrap long lines is on.');
    if (R.lines.rulers.length) ln.push('Rulers sit at column ' + R.lines.rulers.join(' and ') + '; the preview is narrower than that, so look at the editor beside this screen.');
    note('[data-note-lines]', ln.join(' '));
    note('[data-note-motion]', R.look.reduced ? 'Reduce motion is on: nothing moves; still effects stay.' : '');
    var tabN = scope === 'app' ? Object.keys(EL().FIELDS).filter(function (k) { return EL().own('tab', v, k) !== undefined; }).length : 0;
    note('[data-note-side]', tabN ? 'This editor keeps ' + (tabN === 1 ? 'one choice of its own, which stays' : tabN + ' choices of its own, which stay') + ' on top of All editors on it. The preview shows All editors.' : '');
    /* the preview's caption, also its text alternative */
    var desc = R.schemeName + ', ' + R.font.label + ' ' + (Math.round(R.font.size * 10) / 10) + ' px, ' + R.caret.shape + ' caret' + (R.lines.wrap ? ', wraps' : '') + (R.lines.guides !== 'off' ? ', guides' : '');
    var pd = root.querySelector('[data-pv-desc]'); if (pd.textContent !== desc) pd.textContent = desc;
    homeBox.setAttribute('aria-label', 'Preview: ' + desc);
    /* counts */
    var mineKeys = COUNTED.filter(mine), n = mineKeys.length;
    [].forEach.call(root.querySelectorAll('.pmt-cz-cells > i'), function (c, i) { c.classList.toggle('pmt-cz-on', mine(COUNTED[i])); });
    var mn = root.querySelector('[data-meter-n]'), mt = n ? n + (n === 1 ? ' change' : ' changes') : 'The look’s own';
    if (mn.textContent !== mt) mn.textContent = mt;
    root.querySelector('[data-meter-scope]').textContent = scope === 'tab' ? 'This editor' : 'All editors';
    GROUPS.forEach(function (gp) {
      var k = GROUP_KEYS[gp[0]].filter(mine).length, t = k ? k + ' changed' : '';
      var c = root.querySelector('[data-count="' + gp[0] + '"]'); if (c.textContent !== t) c.textContent = t;
      var nv = root.querySelector('[data-navn="' + gp[0] + '"]'); if (nv.textContent !== (k ? String(k) : '')) nv.textContent = k ? String(k) : '';
      root.querySelector('[data-act="group-reset"][data-group="' + gp[0] + '"]').hidden = !k;
    });
    var ft = root.querySelector('[data-foot-n]'), ftt = n ? n + (n === 1 ? ' change from the look in ' : ' changes from the look in ') + (scope === 'tab' ? 'this editor' : 'all editors') : 'Following the look';
    if (ft.textContent !== ftt) ft.textContent = ftt;
    var rb = root.querySelector('[data-act="reset"]'); rb.textContent = scope === 'tab' ? 'Reset this editor' : 'Reset all editors'; setA(rb, 'aria-disabled', String(!n));
    [].forEach.call(root.querySelectorAll('[data-set]'), function (b) { setA(b, 'aria-pressed', String(setPressed(b.getAttribute('data-set'), mineKeys))); });
    var sw = root.querySelector('[data-scope-why]'), swt = scope === 'app' ? (EL().settingsReady() ? 'Saved in this project’s Settings' : 'Saved on this computer') : 'Saved with this tab';
    if (sw.textContent !== swt) sw.textContent = swt;
    root.querySelector('.pmt-cz-framelabel').textContent = scope === 'tab' ? 'This editor' : 'This editor, like all editors';
    roving();
  }
  function setPressed(id, mineKeys) {
    var s = SETS.filter(function (x) { return x.id === id; })[0]; if (!s) return false;
    if (!s.patch) return mineKeys.length === 0;
    return Object.keys(s.patch).every(function (k) { return String(EL().own(scope, v, k)) === String(s.patch[k]); });
  }

  /* ---- placement: beside the editor when there is room, otherwise over the middle; the scrim leaves the editor
     itself uncovered ---- */
  function place() {
    var de = document.documentElement, W = de.clientWidth || 1024, H = de.clientHeight || 768;
    var r = inst.root && inst.root.isConnected ? inst.root.getBoundingClientRect() : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    var hole = r.width > 0 && r.height > 0;
    var M = 12, want = Math.min(920, W - 2 * M), narrow = W < 720, left, width = want;
    if (narrow) { left = 8; width = W - 16; }
    else if (hole && W - r.right - M * 2 >= 560) { left = r.right + M; width = Math.min(want, W - r.right - M * 2); }
    else if (hole && r.left - M * 2 >= 560) { width = Math.min(want, r.left - M * 2); left = r.left - M - width; }
    else left = Math.round((W - width) / 2);
    dialog.style.left = left + 'px'; dialog.style.width = width + 'px';
    var top = narrow ? 8 : Math.max(M, Math.min(56, H * 0.06));
    dialog.style.top = top + 'px'; dialog.style.maxHeight = (H - top - 30) + 'px';
    dialog.classList.toggle('pmt-cz-beside', !narrow && hole && (left >= r.right || left + width <= r.left));
    var s = root.querySelectorAll('.pmt-cz-scrim > i'), x0 = hole ? Math.max(0, r.left) : 0, y0 = hole ? Math.max(0, r.top) : 0, x1 = hole ? Math.min(W, r.right) : 0, y1 = hole ? Math.min(H, r.bottom) : 0;
    var rects = hole ? [[0, 0, W, y0], [0, y1, W, H - y1], [0, y0, x0, y1 - y0], [x1, y0, W - x1, y1 - y0]] : [[0, 0, W, H], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    rects.forEach(function (q, i) { s[i].style.cssText = 'left:' + q[0] + 'px;top:' + q[1] + 'px;width:' + Math.max(0, q[2]) + 'px;height:' + Math.max(0, q[3]) + 'px'; });
    var fr = root.querySelector('.pmt-cz-frame'); fr.hidden = !hole;
    if (hole) fr.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;width:' + (x1 - x0) + 'px;height:' + (y1 - y0) + 'px';
    root.classList.toggle('pmt-cz-narrow', narrow);
  }

  /* ---- events ---- */
  var pairNote = '';
  function prevChosen(row) { return row ? row.querySelector('[aria-checked="true"]') : null; }
  function moveInk(key, before) { var row = root.querySelector('[data-seg="' + key + '"]'), now = prevChosen(row); if (inks[key] && before && now && before !== now && !reducedNow()) try { inks[key].move(before, now); } catch (_) {} }
  function centre(b) { var r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function recolor(b) {
    var c = centre(b);
    if (inst.recolorFrom) inst.recolorFrom(c[0], c[1]);
    if (preview && preview.recolorFrom) preview.recolorFrom(c[0], c[1]);
  }
  function choose(b) {
    var key = b.getAttribute('data-key'), raw = b.getAttribute('data-value');
    var before = prevChosen(b.closest('.pmw-ink-row'));
    if (key === 'scope') {
      if (raw === scope) return;
      scope = raw; endPreview(); syncPreview(); paint(); moveInk('scope', before);
      Motion.play(body, 'pmt-rescope');
      return;
    }
    pairNote = '';
    if (key === 'lineNumberMode') { write({ lineNumbers: raw !== 'off', relativeNumbers: raw === 'relative' }); moveInk(key, before); return; }
    if (key === 'italicComments' || key === 'boldKeywords' || key === 'smoothScroll') { put(key, raw === 'follow' ? null : raw === 'on'); moveInk(key, before); return; }
    var value = raw;
    if (key === 'contrast' || key === 'fontWeight' || key === 'wrapColumn') value = Number(raw);
    if (key === 'scheme') {
      clearTimeout(intent); endPreview(); recolor(b);
      /* a scheme of the other appearance (a light one while the app is dark) is shown as picked: Switch with light and
         dark would show its sibling instead, so it turns off for this scope, and the screen says so */
      var pick = value !== 'follow' ? EL().scheme(value) : null, mode = eff().look.mode;
      if (pick && val('schemePair') && pick.mode !== mode && EL().pairOf(pick, mode) !== pick) {
        write({ scheme: value, schemePair: false });
        pairNote = 'Switch with light and dark is now off, so ' + pick.name + ' stays while the app is ' + mode + '.';
        paint();
      } else put('scheme', value);
      PMW.announce('Code colours: ' + b.querySelector('.pmt-cz-tname').textContent);
      return;
    }
    put(key, value);
    moveInk(key, before);
    if ((key === 'caretShape' || key === 'caretMotion' || key === 'caretTrail' || key === 'caretBlink') && preview) tryMove();
  }
  function toggle(c) {
    var key = c.getAttribute('data-key'), next = c.getAttribute('aria-checked') !== 'true';
    put(key, next);
    if (key === 'inactiveDim' && next) tryDim();
  }
  root.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.pmt-cz-scrim, .pmt-cz-frame')) { close(); return; }
    var b = t.closest('button, [role="radio"], [role="switch"]'); if (!b || !root.contains(b)) return;
    if (b.getAttribute('aria-disabled') === 'true') return;
    if (b.getAttribute('role') === 'radio' && b.hasAttribute('data-key')) { choose(b); return; }
    if (b.getAttribute('role') === 'switch') { toggle(b); return; }
    if (b.hasAttribute('data-step')) { var R = eff(); put('fontSize', Math.min(24, Math.max(10, R.font.size + parseFloat(b.getAttribute('data-step'))))); return; }
    if (b.hasAttribute('data-set')) { quickSet(b.getAttribute('data-set')); return; }
    if (b.hasAttribute('data-jump')) { var g = root.querySelector('[data-group="' + b.getAttribute('data-jump') + '"]'); if (g) { g.scrollIntoView({ block: 'start', behavior: reducedNow() ? 'auto' : 'smooth' }); var hd = g.querySelector('h3'); if (hd) { hd.tabIndex = -1; hd.focus({ preventScroll: true }); } } return; }
    var act = b.getAttribute('data-act');
    if (act === 'close') close();
    else if (act === 'reset') { EL().reset(scope, v); syncPreview(); paint(); PMW.announce(scope === 'tab' ? 'This editor follows All editors again' : 'All editors follow the look again'); }
    else if (act === 'group-reset') { var gpatch = {}; GROUP_KEYS[b.getAttribute('data-group')].forEach(function (k) { if (EL().own(scope, v, k) !== undefined) gpatch[k] = null; }); write(gpatch); }
    else if (act === 'default') put(b.getAttribute('data-key'), null);
    else if (act === 'try-move') tryMove();
    else if (act === 'try-type') tryType();
    else if (act === 'try-problem') tryProblem();
    else if (act === 'try-dim') tryDim();
    else if (act === 'import') importScheme();
  });
  function quickSet(id) {
    var s = SETS.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    if (!s.patch) { EL().reset(scope, v); syncPreview(); paint(); return; }
    /* a set changes its own fields and leaves the rest of this scope's choices (the scheme you picked stays) */
    write(Object.assign({}, s.patch));
  }
  /* Try it: the preview plays a move, some typing, a jump to a problem and how an editor you are not in looks */
  var demoTimers = [];
  function later(ms, fn) { demoTimers.push(setTimeout(fn, ms)); }
  function stopDemo() { demoTimers.forEach(clearTimeout); demoTimers = []; }
  function tryMove() {
    if (!preview || !preview.demo) return;
    stopDemo();
    preview.demo.jump(12, 8);
    later(520, function () { preview.demo.jump(1, 4); });
    later(1040, function () { preview.demo.jump(9, 21); });
    later(1560, function () { preview.demo.place(PV_SEL.r, PV_SEL.b, PV_SEL.r, PV_SEL.a); });
  }
  function tryType() {
    if (!preview || !preview.demo) return;
    stopDemo();
    preview.demo.place(9, PV_LINES[9].length);
    preview.demo.type(' // tidy', function (start) { later(900, function () { preview.demo.erase(start, 8); }); });
  }
  function tryProblem() {
    if (!preview || !preview.demo) return;
    stopDemo();
    var p = previewProblems()[1];
    preview.demo.jump(p.line - 1, p.col - 1);
    later(1400, function () { preview.demo.place(PV_SEL.r, PV_SEL.b, PV_SEL.r, PV_SEL.a); });
  }
  function tryDim() {
    if (!preview || !preview.demo) return;
    preview.demo.dim(true);
    later(1600, function () { if (preview) preview.demo.dim(false); });
  }
  /* sliders: shown while they move, written when let go */
  root.addEventListener('input', function (e) {
    var t = e.target, key = t.getAttribute('data-key');
    if (t.classList.contains('pmt-cz-search')) { filter(t.value); return; }
    if (!key || t.type !== 'range') return;
    var x = parseFloat(t.value);
    EL().live(scope, key, x, v); syncPreview();
    var out = t.parentNode.querySelector('output'); if (out) out.textContent = fmt(key, x);
  });
  root.addEventListener('change', function (e) {
    var t = e.target, key = t.getAttribute('data-key'); if (!key) return;
    if (t.type === 'range') { EL().commit(scope, key, v); syncPreview(); paint(); }
  });
  function filter(q) {
    var ql = String(q || '').trim().toLowerCase(), n = 0, fam = null, famHas = false;
    [].forEach.call(root.querySelectorAll('.pmt-cz-schemes > *'), function (x) {
      if (x.classList.contains('pmt-cz-fam')) { if (fam) fam.hidden = !famHas; fam = x; famHas = false; return; }
      var hit = !ql || (x.getAttribute('data-name') || '').indexOf(ql) >= 0;
      x.hidden = !hit; if (hit) { n++; famHas = true; }
    });
    if (fam) fam.hidden = !famHas;
    var fn = root.querySelector('[data-find-n]'); fn.textContent = ql ? (n ? n + (n === 1 ? ' scheme' : ' schemes') : 'No scheme matches') : '';
  }
  /* a scheme previews when the pointer rests on it (110 ms) or the arrow keys reach it, on the preview and on the
     editor; leaving the list or Escape puts the chosen one back */
  var INTENT_MS = 110, intent = 0, previewing = null;
  function previewSoon(tileEl, ms) {
    clearTimeout(intent);
    var id = tileEl.getAttribute('data-value');
    if (previewing === id) return;
    intent = setTimeout(function () {
      if (!root.isConnected || openRoot !== root) return;
      previewing = id; recolor(tileEl);
      EL().preview(v, { scheme: id }); syncPreview();
    }, ms);
  }
  function endPreview() { clearTimeout(intent); if (previewing === null) return; previewing = null; EL().endPreview(v); syncPreview(); }
  var schemesEl = root.querySelector('.pmt-cz-schemes');
  schemesEl.addEventListener('mouseover', function (e) { var o = e.target.closest('.pmt-cz-scheme'); if (o) previewSoon(o, INTENT_MS); });
  schemesEl.addEventListener('mouseleave', function () { endPreview(); });
  /* keyboard: Escape closes, Tab stays inside, arrows move within a group of tiles or a segment (choosing, as radios
     do; in the schemes they preview, and Enter or Space keeps one) */
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (previewing !== null) { endPreview(); return; } close(); return; }
    if (e.key === 'Tab') {
      var items = [].filter.call(dialog.querySelectorAll('button, input, select, textarea, [tabindex]'), function (x) {
        return !x.disabled && x.tabIndex >= 0 && !x.closest('[hidden], [inert]') && x.getClientRects().length && x.getAttribute('aria-hidden') !== 'true';
      });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || !dialog.contains(a))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (a === last || !dialog.contains(a))) { e.preventDefault(); first.focus(); }
      e.stopPropagation();
      return;
    }
    var r = e.target.closest && e.target.closest('[role="radio"]');
    if (r && /^Arrow(Up|Down|Left|Right)$/.test(e.key)) {
      var group = r.closest('[role="radiogroup"]'), opts2 = [].filter.call(group.querySelectorAll('[role="radio"]'), function (x) { return !x.hidden; });
      var i = opts2.indexOf(r), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      if (group.classList.contains('pmt-cz-tiles') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        var rr = r.getBoundingClientRect(), best = null, bd = Infinity;
        opts2.forEach(function (o) { var q = o.getBoundingClientRect(); if ((d > 0 ? q.top > rr.top + 4 : q.bottom < rr.bottom - 4)) { var dd = Math.abs(q.top - rr.top) * 4 + Math.abs(q.left - rr.left); if (dd < bd) { bd = dd; best = o; } } });
        if (best) i = opts2.indexOf(best) - d;
      }
      var nx = opts2[Math.max(0, Math.min(opts2.length - 1, i + d))];
      e.preventDefault(); e.stopPropagation();
      if (!nx || nx === r) return;
      nx.focus();
      if (nx.classList.contains('pmt-cz-scheme')) previewSoon(nx, e.repeat ? INTENT_MS : 0);
      else choose(nx);
      return;
    }
    if (r && (e.key === 'Enter' || e.key === ' ') && r.classList.contains('pmt-cz-scheme')) { e.preventDefault(); choose(r); }
    e.stopPropagation();
  });
  function roving() {
    [].forEach.call(root.querySelectorAll('[role="radiogroup"]'), function (g) {
      var opts2 = g.querySelectorAll('[role="radio"]'), chosen = g.querySelector('[role="radio"][aria-checked="true"]:not([hidden])') || [].filter.call(opts2, function (o) { return !o.hidden; })[0];
      [].forEach.call(opts2, function (o) { o.tabIndex = o === chosen ? 0 : -1; });
    });
  }
  function importScheme() {
    var errEl = root.querySelector('[data-import-error]'), A = window.PMT && window.PMT.Appearance;
    errEl.hidden = true;
    if (!A || typeof A.importFile !== 'function') { errEl.textContent = 'Import is not available on this page.'; errEl.hidden = false; return; }
    A.importFile({ onDone: function (res) {
      if (!res.ok) { errEl.textContent = 'Could not import that scheme: ' + res.error; errEl.hidden = false; return; }
      schemesEl.innerHTML = schemeTiles(); filter(root.querySelector('.pmt-cz-search').value);
      put('scheme', res.id);
      PMW.announce('Imported ' + res.name);
      var t2 = schemesEl.querySelector('[data-value="' + CSS.escape(res.id) + '"]'); if (t2) t2.focus({ preventScroll: false });
    } });
  }

  /* ---- open, refresh, close ---- */
  var offChange = EL().onChange(function () { if (root.isConnected) paint(); });
  var onResize = function () { place(); if (preview && preview.demo) preview.demo.relayout(); };
  window.addEventListener('resize', onResize);
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (list) {
    list.forEach(function (en) { if (en.target === inst.root) place(); else if (preview && preview.demo) preview.demo.relayout(); });
  }) : null;
  if (ro) { if (inst.root) ro.observe(inst.root); ro.observe(homeBox); ro.observe(dockBox); }
  /* the preview follows you down the screen: when less than 40 % of its own place shows, the same live editor moves
     into the dock under the group index, and back when its place returns */
  var io = null;
  function dockTo(on) {
    if (!preview || !!on === !dock.hidden) return;
    (on ? dockBox : homeBox).appendChild(pvHost);
    dock.hidden = !on; root.classList.toggle('pmt-cz-docked', !!on);
    if (on) Motion.play(dock);
    preview.demo.relayout();
  }
  if (preview && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(function (list) { var en = list[list.length - 1]; dockTo(en.intersectionRatio < 0.4); }, { root: body, threshold: [0, 0.4, 1] });
    io.observe(root.querySelector('.pmt-cz-preview'));
  }
  var closed = false;
  function close(noFocus) {
    if (closed) return;
    closed = true;
    stopDemo(); endPreview();
    if (offChange) offChange();
    window.removeEventListener('resize', onResize);
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    if (preview) { try { preview.unmount(); } catch (_) {} preview = null; }
    if (openRoot === root) openRoot = null;
    root.setAttribute('aria-hidden', 'true'); root.inert = true;
    if (noFocus) root.remove(); else Motion.leave(root, function () { root.remove(); });
    if (!noFocus) { try { (anchor && anchor.isConnected ? anchor : null) ? anchor.focus({ preventScroll: true }) : inst.focus(); } catch (_) {} }
    if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (_) {} }
  }
  root._pmedClose = close;
  root._pmedPreview = preview;
  place();
  if (preview && preview.demo) preview.demo.relayout();
  syncPreview();
  paint();
  filter('');
  Motion.play(root);
  var first = root.querySelector('[data-seg="scope"] [aria-checked="true"]') || dialog;
  first.focus({ preventScroll: true });
  return { el: root, close: function () { close(); }, refresh: function () { if (!closed) { syncPreview(); paint(); } }, preview: preview };
}

/* the editor's More menu opens it on this editor (10-editor.js openCustomize); Settings' Editor look group opens it on
   the editor in view, for All editors, opening the project's entry file first when Home shows no editor */
PMW.edCustomize = { open: open };
window.PM_EDITOR_CUSTOMIZE = Object.freeze({
  open: function (o) {
    o = o || {};
    var inst = PMW.editorInView ? PMW.editorInView() : null;
    if (inst) return open({ view: inst.view, scope: o.scope || 'app' });
    try { PM_HOME.open({ kind: 'editor', path: 'src/main.rs' }); } catch (_) {}
    var tries = 0;
    (function wait() {
      var e2 = PMW.editorInView ? PMW.editorInView() : null;
      if (e2) { open({ view: e2.view, scope: o.scope || 'app' }); return; }
      if (++tries < 30) setTimeout(wait, 100);
    })();
    return null;
  }
});
