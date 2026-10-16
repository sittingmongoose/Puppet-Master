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
   It lives in the panels' overlay root (#pmw-overlay, CONTRACT section 14), carries data-lg-surface="menu" and data-lg-dense
   for Liquid Glass (a dense sheet: a heavier tint keeps what is behind from mottling its text), and closes on Escape, Done, the close button or the scrim, giving the focus back to the editor. */

var EL = function () { return PMW.edLook; };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
var NOTAG = ' data-pm-hover-visual-suppressed="true"';
function tagged(label, detail) { return ' data-pm-hover-label="' + esc(label) + '"' + (detail ? ' data-pm-hover-detail="' + esc(detail) + '"' : ''); }
function reducedNow() { return PMW.reduced ? PMW.reduced() : false; }
function sheetBusy() {
  if (document.hidden) return true;
  if (typeof window.PM_BUSY === 'function') return !!window.PM_BUSY();
  var de = document.documentElement;
  var nier = window.PM_NIER;
  return de.hasAttribute('data-o55-open') || de.hasAttribute('data-o55-boot-wait') || de.hasAttribute('data-pm-page-transition') || de.hasAttribute('data-pmu-moment') || !!document.querySelector('#o55np-reboot,#o55np-calm,#o55nw-boot,.o55nw-boot') || !!(nier && nier.wanted && nier.on && nier.wanted() !== nier.on());
}

/* motion: the terminal's one-shot classes (.pmt-in, .pmt-out; 60-motion.css gives them each look's voice) */
var Motion = {
  finished: function (node, fn) {
    if (node.classList.contains('pmed-cz')) {
      // The sheet has one entrance/exit on its dialog. Waiting for its event
      // avoids getAnimations(subtree), which flushes style for every tile in the
      // input handler just after adding the animation class.
      if (node._pmedFinish) node._pmedFinish();
      var target = node.querySelector('.pmt-cz-dialog'), timer, ended = false;
      var de = document.documentElement;
      // NieR without Slice has no dialog animation. Its scrim still owns the
      // short fade, including the stationary Reduced Motion version.
      if (de.getAttribute('data-o55-nier') === 'on' && (reducedNow() || !/(^|\s)slice(\s|$)/.test(de.getAttribute('data-o55-nier-parts') || ''))) target = node.querySelector('.pmt-cz-scrim > i');
      var clean = function () { clearTimeout(timer); target.removeEventListener('animationend', end); node._pmedFinish = null; };
      var end = function (e) { if (e && e.target !== target) return; if (ended) return; ended = true; clean(); fn(); };
      node._pmedFinish = clean;
      target.addEventListener('animationend', end);
      timer = setTimeout(end, 900);
      return;
    }
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
    if (node.classList.contains('pmed-cz')) { Motion.sheet(node, false, function () {}); return; }
    var gen = node._pmedGen = (node._pmedGen || 0) + 1;
    node.classList.remove('pmt-out');
    if (node.classList.contains(cls)) { node.classList.remove(cls); void node.offsetWidth; }
    node.classList.add(cls);
    Motion.finished(node, function () { if (node._pmedGen === gen) node.classList.remove(cls); });
  },
  leave: function (node, done) {
    if (node.classList.contains('pmed-cz')) { Motion.sheet(node, true, done); return; }
    var gen = node._pmedGen = (node._pmedGen || 0) + 1;
    node.classList.remove('pmt-in');
    node.classList.add('pmt-out');
    Motion.finished(node, function () { if (node._pmedGen === gen) { node.classList.remove('pmt-out'); done(); } });
  },
  sheet: function (node, leaving, done) {
    if (node._pmedFinish) node._pmedFinish();
    var gen = node._pmedGen = (node._pmedGen || 0) + 1;
    var parts = node.querySelectorAll('.pmt-cz-scrim > i, .pmt-cz-frame, .pmt-cz-dialog');
    var clear = function (p) { p.classList.remove('pmed-sheet-in', 'pmed-sheet-out', 'pmed-shade-in', 'pmed-shade-out'); };
    [].forEach.call(parts, function (p) { clear(p); p.classList.add((p.classList.contains('pmt-cz-dialog') ? 'pmed-sheet-' : 'pmed-shade-') + (leaving ? 'out' : 'in')); });
    // Keep the full family motion when the opening/closing frame is expensive.
    // The shared helper reads these six moving plates on a later frame, never
    // the sheet's subtree in the input handler. A newer visit owns its moves.
    if (!reducedNow() && window.PM_START_ON_SHOWN) window.PM_START_ON_SHOWN(function () {
      if (!node.isConnected || node._pmedGen !== gen) return [];
      var moves = [];
      [].forEach.call(parts, function (p) {
        if (p.getAnimations) p.getAnimations().forEach(function (a) {
          if (a.effect && a.effect.target === p && /^(?:pmt-m-|pmt-cz-slice-)/.test(a.animationName || '')) moves.push(a);
        });
      });
      return moves;
    });
    Motion.finished(node, function () { if (node._pmedGen !== gen) return; [].forEach.call(parts, clear); done(); });
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
  '        format!("{} serves {} in {} steps, about {} minutes from start to finish\\n", self.name, self.serves, self.steps.len(), self.minutes())',
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
  colors: ['scheme', 'schemePair', 'syntax', 'bracketPairs', 'contrast', 'italicComments', 'boldKeywords', 'tokenColors'],
  text: ['font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'ligatures'],
  caret: ['caretShape', 'caretWidth', 'caretBlink', 'caretMotion', 'caretTrail'],
  lines: ['lineNumbers', 'relativeNumbers', 'lineHighlight', 'indentGuides', 'activeIndent', 'whitespace', 'rulers', 'wordWrap', 'wrapColumn', 'minimap', 'stickyScroll', 'stickyLines'],
  motion: ['smoothScroll', 'reveal', 'scrollPastEnd', 'inactiveDim', 'scanlines', 'glow'],
  behavior: ['diffLayout', 'diagnostics', 'gotoHighlightMs', 'autosave', 'tabSize', 'insertSpaces', 'detectIndent']
};
var COUNTED = [].concat(GROUP_KEYS.colors, GROUP_KEYS.text, GROUP_KEYS.caret, GROUP_KEYS.lines, GROUP_KEYS.motion, GROUP_KEYS.behavior);
/* colour arithmetic for the token picker: #rrggbb to hue (degrees), saturation and lightness (percent), and back */
function hexHsl(hex) {
  var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim()); if (!m) return null;
  var n = parseInt(m[1], 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, sat = 0;
  if (d) {
    sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(sat * 100), Math.round(l * 100)];
}
function hslHex(h, sat, l) {
  sat /= 100; l /= 100;
  var k = function (n) { return (n + h / 30) % 12; }, a = sat * Math.min(l, 1 - l);
  var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
  return '#' + [f(0), f(8), f(4)].map(function (x) { return ('0' + Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16)).slice(-2); }).join('');
}
function normHex(v) { var m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(String(v || '').trim()); if (!m) return null; var x = m[1].toLowerCase(); if (x.length === 3) x = x.replace(/./g, '$&$&'); return '#' + x; }
/* Token colours: the seventeen kinds of word, each with a word to show it by */
var TOKENS = [['kw', 'Keywords', 'fn'], ['fn', 'Functions', 'scale()'], ['ty', 'Types', 'Recipe'], ['var', 'Variables', 'steps'],
  ['prop', 'Properties', '.serves'], ['str', 'Strings', '"cups"'], ['num', 'Numbers', '42'], ['esc', 'Escapes', '\\n'],
  ['com', 'Comments', '// note'], ['op', 'Operators', '+='], ['pun', 'Punctuation', '{ }'], ['mac', 'Macros', 'vec!'],
  ['tag', 'Tags', '<div>'], ['attr', 'Attributes', 'class='], ['head', 'Headings', '## Usage'], ['link', 'Links', 'docs.rs'], ['code', 'Inline code', '`cargo`']];
var TOKEN_NAME = {}; TOKENS.forEach(function (t) { TOKEN_NAME[t[0]] = t; });
function tokenRows() {
  return TOKENS.map(function (t) {
    return '<button type="button" class="pmed-tok-row" data-tok="' + t[0] + '" aria-expanded="false" aria-controls="pmed-tok-pick"' + NOTAG + '>' +
      '<span class="pmed-tok-word" aria-hidden="true">' + esc(t[2]) + '</span><span class="pmed-tok-name">' + esc(t[1]) + '</span>' +
      '<span class="pmed-tok-meta"><i class="pmed-tok-sw" aria-hidden="true"></i><code class="pmed-tok-hex"></code></span><span class="pmt-cz-mine">Changed</span></button>';
  }).join('');
}
function tokenPicker() {
  var sl = function (k, label, max) {
    return '<label class="pmed-tok-slider" data-hsl="' + k + '"><span class="pmed-tok-slabel">' + label + '</span>' +
      '<input type="range" min="0" max="' + max + '" step="1" data-hsl-in="' + k + '" aria-label="' + label + '"' + NOTAG + '><output data-hsl-out="' + k + '"></output></label>';
  };
  return '<div class="pmed-tok-pick" id="pmed-tok-pick" data-tok-pick role="group" aria-labelledby="pmed-tok-pick-title" hidden>' +
    '<div class="pmed-tok-pickhead"><span class="pmed-tok-big" data-pick-word aria-hidden="true"></span>' +
    '<div class="pmed-tok-picktitles"><h5 id="pmed-tok-pick-title" data-pick-title></h5><span class="pmed-tok-ratio" data-pick-ratio></span></div>' +
    '<button type="button" class="pmt-pop-x pmed-tok-x" data-act="tok-close" aria-label="Close the colour picker"' + NOTAG + '><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></div>' +
    '<span class="pmed-tok-cap">The scheme’s colours</span>' +
    '<div class="pmed-tok-swatches" role="radiogroup" aria-label="The scheme’s colours" data-pick-swatches></div>' +
    '<div class="pmed-tok-sliders">' + sl('h', 'Hue', 360) + sl('s', 'Saturation', 100) + sl('l', 'Lightness', 100) + '</div>' +
    '<div class="pmed-tok-actions"><label class="pmed-tok-hexlabel"><span>Hex</span><input class="pmed-tok-hexin" data-pick-hex maxlength="7" spellcheck="false" autocomplete="off" aria-label="Colour as hex"' + NOTAG + '></label>' +
    '<span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn" data-act="tok-own"' + NOTAG + '>The scheme’s own</button>' +
    '<button type="button" class="pmt-textbtn pmt-textbtn-primary" data-act="tok-close"' + NOTAG + '>Done</button></div>' +
    '<p class="pmt-cz-note" data-pick-note hidden></p></div>';
}
var GROUPS = [['colors', 'Colors'], ['text', 'Text'], ['caret', 'Caret'], ['lines', 'Lines & guides'], ['motion', 'Motion & effects'], ['behavior', 'Behavior']];

/* ---------------- markup ---------------- */
function ghead(id, title, lead) {
  return '<header class="pmt-cz-ghead"><h3 id="pmed-cz-g-' + id + '">' + esc(title) + '</h3><span class="pmt-cz-gcount" data-count="' + id + '"></span>' +
    '<button type="button" class="pmt-textbtn pmt-cz-greset" data-act="group-reset" data-group="' + id + '" hidden' + NOTAG + '>Reset ' + esc(title.toLowerCase()) + '</button></header>' +
    (lead ? '<p class="pmt-cz-glead">' + esc(lead) + '</p>' : '');
}
/* a one-of-several row in the panels' chosen-fill grammar (45-frames.css), its ink moving between the choices; a
   choice may carry shorter words (o[2]) for a row PMW.czFit finds too narrow for the full ones */
function seg(key, opts, label) {
  return '<div class="pmt-cz-seg pmw-ink-row" role="radiogroup" aria-label="' + esc(label) + '" data-seg="' + key + '">' + opts.map(function (o) {
    return '<button type="button" class="pmt-cz-segopt pmw-ink-opt" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(o[0]) + '"' + NOTAG +
      (o[2] ? ' aria-label="' + esc(o[1]) + '"><span class="pmt-cz-sl">' + esc(o[1]) + '</span><span class="pmt-cz-ss" aria-hidden="true">' + esc(o[2]) + '</span>' : '>' + esc(o[1])) + '</button>';
  }).join('') + '</div>';
}
/* One line for every one-of-several row in a Customize screen, the editor's and the terminal's (77-customize.js calls
   this too): a row never wraps, since its ink travels along one line. When a row's choices don't fit beside its
   neighbour, that pair of fields stacks into one column; when they don't fit the full width either, the row says them
   shorter (their full words stay their spoken names); in a phone-narrow window it becomes a list, its fill moving at
   once. Measured when the screen opens or is placed again (a resize), when the look or the shown choices change and
   when a face finishes loading; the key below is read from attributes only, so an unchanged screen costs no layout. */
var czFitEpoch = 0;
PMW.czFit = function (root, later) {
  var dialog = root && root.querySelector('.pmt-cz-dialog');
  if (!dialog || !dialog.style.width) return;               // placed first: the width decides
  var segs = [].slice.call(root.querySelectorAll('.pmt-cz-seg')).filter(function (s) { return !s.closest('[hidden]'); });
  var shown = segs.map(function (s) { return s.getAttribute('data-seg') + ':' + s.querySelectorAll('.pmt-cz-segopt:not([hidden])').length; }).join(',');
  var de = document.documentElement;
  var base = [dialog.style.width, root.getAttribute('data-pmt-look'), root.getAttribute('data-pmt-mode'), de.getAttribute('data-o55-nier-parts') || '', czFitEpoch].join('|');
  var key = base + '|' + shown;
  if (root._czFit === key) return;
  // Editor face choices change the available weights. Reuse the exact fit of
  // each offered set; the terminal keeps the existing fitting path.
  var fits = null;
  if (root.classList.contains('pmed-cz')) {
    if (root._pmedFitBase !== base) { root._pmedFitBase = base; root._pmedFits = Object.create(null); }
    fits = root._pmedFits;
    if (fits[shown]) {
      fits[shown].forEach(function (r) {
        ['data-cols', 'data-fit'].forEach(function (a, i) {
          if (r[0].getAttribute(a) === r[i + 1]) return;
          if (r[i + 1] === null) r[0].removeAttribute(a); else r[0].setAttribute(a, r[i + 1]);
        });
      });
      root._czFit = key;
      return;
    }
  }
  root._czFit = null;
  var gridOf = function (s) { var f = s.closest('.pmt-cz-field'), g = f && f.parentElement; return g && (g.classList.contains('pmt-cz-grid2') || g.classList.contains('pmt-cz-row')) ? g : null; };
  [].forEach.call(root.querySelectorAll('.pmt-cz-grid2[data-cols], .pmt-cz-row[data-cols]'), function (g) { g.removeAttribute('data-cols'); });
  [].forEach.call(root.querySelectorAll('.pmt-cz-seg[data-fit]'), function (s) { s.removeAttribute('data-fit'); });
  var over = function (s) { return s.scrollWidth > s.clientWidth + 1; };
  var left, grids = [], short;
  var next = later || function (fn) { fn(); };
  next(function fitColumns() {
    left = segs.filter(over);
    left.forEach(function (s) { var g = gridOf(s); if (g && grids.indexOf(g) < 0) grids.push(g); });
    grids.forEach(function (g) { g.setAttribute('data-cols', '1'); });
    next(function fitLabels() {
      if (grids.length) left = left.filter(over);
      short = left.filter(function (s) { return s.querySelector('.pmt-cz-ss'); });
      short.forEach(function (s) { s.setAttribute('data-fit', 'short'); });
      next(function fitStack() {
        if (short.length) left = left.filter(over);
        left.forEach(function (s) { s.setAttribute('data-fit', 'stack'); });
        if (fits) fits[shown] = [].map.call(root.querySelectorAll('.pmt-cz-grid2, .pmt-cz-row, .pmt-cz-seg'), function (e) { return [e, e.getAttribute('data-cols'), e.getAttribute('data-fit')]; });
        root._czFit = key;
      });
    });
  });
};
if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () {
  czFitEpoch += 1;
  [].forEach.call(document.querySelectorAll('.pmt-cz'), function (r) {
    // Its owner schedules parked fitting in small, cancellable phases.
    if (r.classList.contains('pmed-cz') && r.hasAttribute('aria-hidden')) return;
    PMW.czFit(r);
  });
});
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
    '<span class="pmt-cz-thumb" aria-hidden="true">' + (art || '') + '</span><span class="pmt-cz-tname">' + esc(label) + '</span>' + (meta ? '<span class="pmt-cz-tmeta">' + esc(meta) + '</span>' : '') + '</button>';
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
    '<span class="pmt-cz-thumb" aria-hidden="true" data-follow-art></span><span class="pmt-cz-tname">Follow look</span><span class="pmt-cz-tmeta" data-follow-meta></span></button>');
  list.forEach(function (s) {
    var f = EL().familyOf(s);
    if (f !== fam) { fam = f; out.push('<span class="pmt-cz-fam" role="presentation">' + esc(fam) + '</span>'); }
    var c = schemeColors(s);
    out.push('<button type="button" class="pmt-cz-tile pmt-cz-scheme" role="radio" aria-checked="false" data-key="scheme" data-value="' + esc(s.id) + '" data-name="' + esc((s.name + ' ' + f).toLowerCase()) + '" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-thumb" aria-hidden="true">' + (c ? codeArt(c) : '') + '</span><span class="pmt-cz-tname">' + esc(s.name) + '</span><span class="pmt-cz-tmeta">' + (s.mode === 'light' ? 'Light' : 'Dark') + '</span></button>');
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
  html += '<section class="pmt-cz-dialog" role="dialog" aria-modal="true" aria-labelledby="pmed-cz-title" aria-describedby="pmed-cz-lead" tabindex="-1" data-lg-surface="menu" data-lg-dense>';
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
    field('Comments in italics', seg('italicComments', [['follow', 'Follow look', 'Look'], ['on', 'On'], ['off', 'Off']], 'Comments in italics')) +
    field('Keywords in bold', seg('boldKeywords', [['follow', 'Follow look', 'Look'], ['on', 'On'], ['off', 'Off']], 'Keywords in bold')) + '</div>' +
    '<div class="pmed-tok" data-at="tokens"><h4 class="pmt-cz-sub">Token colours</h4><p class="pmt-cz-fhelp pmed-tok-lead" data-tok-lead></p>' +
    '<div class="pmed-tok-list" role="group" aria-label="Token colours">' + tokenRows() + '</div>' + tokenPicker() +
    '<div class="pmed-tok-foot"><button type="button" class="pmt-textbtn" data-act="tok-reset" hidden' + NOTAG + '>Reset token colours</button></div></div>' +
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
    '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Weight</span>' + seg('fontWeight', [[200, 'Extra light', '200'], [300, 'Light', '300'], [400, 'Regular', '400'], [500, 'Medium', '500'], [600, 'Semibold', '600'], [700, 'Bold', '700'], [800, 'Heavy', '800']], 'Weight') +
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
    '<div class="pmt-cz-grid2">' + field('Line numbers', seg('lineNumberMode', [['on', 'On'], ['relative', 'Count from the caret', 'Relative'], ['off', 'Off']], 'Line numbers')) +
    field('Highlight the current line', seg('lineHighlight', [['follow', 'Follow look', 'Look'], ['all', 'Line and number', 'Both'], ['line', 'Line'], ['gutter', 'Number'], ['off', 'Off']], 'Highlight the current line')) + '</div>' +
    '<h4 class="pmt-cz-sub">Indent guides</h4>' +
    '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Indent guides">' + GUIDES.map(function (g) { return tile('indentGuides', g[0], g[1], guideArt(g[0]), g[2]); }).join('') + '</div>' +
    '<div class="pmt-cz-chips">' + chip('activeIndent', 'Light the guide of the block I’m in', 'The guide of the block that holds the caret is drawn brighter.') + '</div>' +
    '<div class="pmt-cz-grid2">' + field('Show spaces', seg('whitespace', [['off', 'Off'], ['boundary', 'Between words', 'Between'], ['selection', 'In the selection', 'Selected'], ['trailing', 'At line ends', 'Line ends'], ['all', 'Everywhere', 'All']], 'Show spaces'), 'Faint dots where the spaces are.') +
    field('Rulers', seg('rulers', [['', 'Off'], ['80', '80'], ['100', '100'], ['120', '120'], ['80,120', '80 and 120', '80, 120']], 'Rulers'), 'Faint lines at the columns lines should stay within.') + '</div>' +
    '<div class="pmt-cz-chips">' + chip('wordWrap', 'Wrap long lines', 'Long lines fold onto the next row, keeping their indent, so you never scroll sideways.', '<div class="pmt-cz-chipmore" data-more="wordWrap">' +
      field('Wrap at', seg('wrapColumn', [[0, 'Window edge', 'Edge'], [80, '80'], [100, '100'], [120, '120']], 'Wrap at')) + '</div>', 'pmed-art-wrap') +
    chip('minimap', 'Minimap scrollbar', 'The scrollbar draws a small map of the file with its change marks. Off draws a plain one.', '', 'pmed-art-minimap') +
    chip('stickyScroll', 'Sticky scroll', 'The lines that open the block you are reading stay at the top.', '<div class="pmt-cz-chipmore" data-more="stickyScroll">' + slider('stickyLines', 'Lines', 1, 5, 1) + '</div>', 'pmed-art-sticky') + '</div>' +
    '<p class="pmt-cz-note" data-note-lines hidden></p></section>';
  /* motion and effects */
  html += '<section class="pmt-cz-group" data-group="motion" aria-labelledby="pmed-cz-g-motion">' + ghead('motion', 'Motion & effects', 'Nothing here moves while the editor is idle.') +
    '<div class="pmt-cz-grid2">' + field('Smooth scrolling', seg('smoothScroll', [['follow', 'Follow look', 'Look'], ['on', 'On'], ['off', 'Off']], 'Smooth scrolling'), 'A wheel’s notches, a page and a jump to a line glide instead of jumping. A trackpad scrolls as it always does.') +
    field('Scroll past the last line', seg('scrollPastEnd', [['little', 'A few lines', 'Few lines'], ['half', 'Half a page', 'Half page'], ['page', 'A full page', 'Full page']], 'Scroll past the last line')) + '</div>' +
    '<div class="pmt-cz-chips pmt-cz-fxchips">' +
    chip('reveal', 'Lines arrive when a file opens', 'The first screen of a file arrives line by line from the top, quickly.', '', 'pmed-art-reveal') +
    chip('inactiveDim', 'Fade editors I’m not in', 'While you work in another panel, editors you are not in step back a little.', '', 'pmt-cz-art-inactiveDim') +
    chip('scanlines', 'Scanlines', 'Thin still lines across the code, like an old monitor.', '', 'pmt-cz-art-scanlines') +
    chip('glow', 'Text glow', 'A soft glow around code in its own colour, like phosphor on a tube.', '', 'pmt-cz-art-glow') + '</div>' +
    '<p class="pmt-cz-note" data-note-motion hidden></p></section>';
  /* behaviour */
  html += '<section class="pmt-cz-group" data-group="behavior" aria-labelledby="pmed-cz-g-behavior">' + ghead('behavior', 'Behavior') +
    '<div class="pmt-cz-grid2">' + field('Diff layout', seg('diffLayout', [['auto', 'Automatic', 'Auto'], ['side', 'Side by side', 'Split'], ['inline', 'Inline']], 'Diff layout'), 'Automatic shows the two sides side by side when the tab is wide enough.') +
    field('Problems to highlight', seg('diagnostics', [['off', 'Off'], ['errors', 'Errors'], ['warnings', 'And warnings', 'Warnings'], ['all', 'Everything', 'All']], 'Problems to highlight'), 'A wavy line under each one; rest the pointer on it to read it.') +
    field('Save automatically', seg('autosave', [['off', 'Off'], ['500', 'After 0.5 s', '0.5 s'], ['1000', 'After 1 s', '1 s'], ['focus', 'When I leave', 'On leave']], 'Save automatically'), 'A pause after you stop typing, or when the focus leaves the file.') +
    '<div class="pmt-cz-field"><span class="pmt-cz-flabel">A jumped-to line stays lit</span>' + slider('gotoHighlightMs', 'For', F.gotoHighlightMs.min, F.gotoHighlightMs.max, F.gotoHighlightMs.step, true) +
    '<span class="pmt-cz-fhelp">A line opened from the chat, a problem or Go to line is lit this long, then fades.</span></div></div>' +
    '<div data-at="indent"><h4 class="pmt-cz-sub">Indentation</h4>' +
    '<div class="pmt-cz-grid2">' + field('Tab size', seg('tabSize', [['2', '2'], ['4', '4'], ['8', '8']], 'Tab size'), 'Columns in a level of indentation. Tab moves to the next one, and Backspace in the indentation goes back one.') +
    field('Indent with', seg('insertSpaces', [['true', 'Spaces'], ['false', 'Tabs']], 'Indent with'), 'What a new level is made of in a file that doesn’t say, and in every file while Follow the file’s indentation is off. A tab is drawn and copied as a tab; Show spaces marks it →.') + '</div>' +
    '<div class="pmt-cz-chips">' + chip('detectIndent', 'Follow the file’s indentation', 'A file indented with 2 spaces keeps 2, and one indented with tabs keeps tabs, whatever the two above say. Off, those two decide in every file.') + '</div>' +
    '<p class="pmt-cz-note" data-note-indent hidden></p></div>' +
    '<p class="pmt-cz-fhelp pmt-cz-more">Language servers, formatters, file encoding and big-file limits are in Settings, Editor & Terminal and Toolchain.</p></section>';
  html += '</div>';
  html += '<footer class="pmt-cz-foot"><button type="button" class="pmt-textbtn" data-act="reset"' + NOTAG + '>Reset this editor</button><span class="pmt-cz-footn" data-foot-n></span>' +
    '<span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn pmt-textbtn-primary pmt-cz-done" data-act="close"' + tagged('Done', 'Every change is already applied and saved') + '>Done</button></footer>';
  html += '</section>';
  return html;
}

/* ---------------- the screen ---------------- */
var openRoot = null, prepared = null;
function open(opts) {
  opts = opts || {};
  if (!EL()) return null;
  var inst = opts.view && opts.view.editor ? opts.view.editor() : (PMW.editorInView ? PMW.editorInView() : null);
  if (!inst || !inst.view) return null;
  var v = inst.view;
  if (prepared && prepared.inst === inst && prepared.el.isConnected) return prepared.show(opts);
  if (prepared) { prepared.dispose(); prepared = null; }
  if (openRoot && openRoot._pmedClose) openRoot._pmedClose(true);
  // the editor beside the screen draws its caret and current line while the screen is open (10-editor.js, customizing)
  if (!opts.prepare && inst.customizing) inst.customizing(true);
  var overlay = PMW.overlay ? PMW.overlay() : document.body;
  var root = el('div', 'pmt-cz pmed-cz pmt-calm pmed-prepared');
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('data-pmw-overlay', 'editor-appearance');
  var label = (inst.root && inst.root.querySelector('.pmw-ed-seg.is-file') || {}).textContent || 'Editor';
  root.innerHTML = skeleton(label);
  overlay.appendChild(root);
  var dialog = root.querySelector('.pmt-cz-dialog'), body = root.querySelector('.pmt-cz-body');
  /* the scope, as the terminal's screen keeps it: All editors when Settings opens it, for that visit only; otherwise
     the one last picked on this editor's screen (remembered while the tab lives), This editor at first */
  var scope = opts.scope === 'app' ? 'app' : v._apScope || 'tab';
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
      paintDeferred: function () { return closed && sheetBusy(); },
      lookDeferred: function () { return closed; },
      caret: { r: PV_SEL.r, c: PV_SEL.b, ar: PV_SEL.r, ac: PV_SEL.a } });
  } catch (err) { try { console.error('[pm-home] the editor preview could not start', err); } catch (_) {} }

  function scopeView() { return scope === 'tab' ? v : { tabAppearance: {}, previewAppearance: v.previewAppearance }; }
  function eff() { return EL().resolve(scopeView()); }
  var paintRead = null;
  function ownValue(key) {
    if (paintRead && Object.prototype.hasOwnProperty.call(paintRead.own, key)) return paintRead.own[key];
    var o = EL().own(scope, v, key);
    if (paintRead) paintRead.own[key] = o;
    return o;
  }
  function val(key) {
    if (paintRead && Object.prototype.hasOwnProperty.call(paintRead.values, key)) return paintRead.values[key];
    var o = ownValue(key), value = o !== undefined ? o : EL().get(scopeView(), key);
    if (paintRead) paintRead.values[key] = value;
    return value;
  }
  function mine(key) {
    if (key === 'lineNumberMode') return mine('lineNumbers') || mine('relativeNumbers');
    return ownValue(key) !== undefined;
  }
  function syncPreview() {
    pvView.tabAppearance = scope === 'tab' ? v.tabAppearance || {} : {};
    pvView.previewAppearance = v.previewAppearance || null;
    // This is the owner's explicit refresh: either a live choice or an idle
    // phase already guarded against covers and input. Model broadcasts wait.
    if (pvView.applyLook) pvView.applyLook(EL().resolve(pvView), true);
  }
  // setMany emits one change after updating the editors. That notification owns the
  // controls and preview too; doing them again here forced a second layout per pick.
  function write(patch) { EL().setMany(scope, patch, v); }
  function put(key, value) { var p = {}; p[key] = value; write(p); }

  /* ---- painting: every control shows this scope's value ---- */
  var setA = function (e, n, x) { if (e && e.getAttribute(n) !== x) e.setAttribute(n, x); };
  // text written only when it differs: a rewrite of the same words still lays the page out again, once per slider step
  var setT = function (e, x) { if (e && e.textContent !== x) e.textContent = x; };
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
  /* what the file in this editor does with the three choices above (the preview has a file of its own) */
  function indentNote(R) {
    var I = inst.indent ? inst.indent() : null;
    if (!I || !inst.path) return '';
    var name = inst.path.split('/').pop();
    if (I.tabs && I.own === 0 && R.indent.detect && I.tabbed) return name + ' is indented with tabs, so it keeps tabs, ' + I.unit + ' columns wide.';
    if (!R.indent.detect) return 'Follow the file’s indentation is off, so Tab puts in ' + (I.tabs ? 'a tab, ' + I.unit + ' columns wide,' : I.unit + ' spaces') + ' here and in every file.';
    if (I.own) return name + ' is indented with ' + I.own + ' spaces, so Tab puts in ' + I.own + '.';
    return name + ' has no indentation to follow yet, so Tab puts in ' + (I.tabs ? 'a tab, ' + I.unit + ' columns wide.' : I.unit + ' spaces.');
  }
  function note(sel, text) { var e = root.querySelector(sel); if (!e) return; e.hidden = !text; if (e.textContent !== text) e.textContent = text; }
  /* the look's own code colours (Follow look), read off the editor once per look, colour mode and phosphor,
     in a frame of its own; until it lands the screen keeps what it drew */
  var LOOK_TOKENS = ['--pmw-ed-fg', '--pmw-ed-bg', '--pmw-ed-gutbg', '--pmw-ed-s-kw', '--pmw-ed-s-fn', '--pmw-ed-s-str', '--pmw-ed-s-com', '--pmw-ed-bp-0', '--pmw-ed-bp-1', '--pmw-ed-bp-2'];
  var lookRead = { key: null, v: null }, lookRaf = 0, lookPending = null;
  function lookTokens(key) {
    if (lookRead.key === key) return lookRead.v;
    lookPending = key;
    if (!lookRaf) lookRaf = requestAnimationFrame(function () {
      var read = function () {
        lookRaf = 0;
        if (!root.isConnected || !inst.root) return;
        if (closed && sheetBusy()) { warmPaintSoon(); return; }
        var rs = getComputedStyle(inst.root), v = {};
        LOOK_TOKENS.forEach(function (n) { v[n] = rs.getPropertyValue(n).trim(); });
        lookRead = { key: lookPending, v: v };
        paint();
      };
      // These small control pictures can read the look after the frame's
      // layout, instead of forcing the whole page to restyle inside rAF.
      if (window.PM_AFTER_LAYOUT) window.PM_AFTER_LAYOUT(read); else setTimeout(read, 0);
    });
    return lookRead.v;
  }
  var varsSet = {}, artHosts = [].map.call(root.querySelectorAll('.pmt-cz-art'), function (a) { return a.parentElement; });
  // Only these small pictures use the chosen scheme. Putting their colours on
  // the sheet restyled every control and scheme tile for each colour pick.
  function setVar(n, val) { if (varsSet[n] === val) return; varsSet[n] = val; [].forEach.call(artHosts, function (a) { a.style.setProperty(n, val); }); }
  var warmMeasureJob = 0, warmMeasureStamp = '', warmMeasureQueue = [], warmGeneration = 0, warmWaiting = false;
  var warmCleanups = [], warmComplete = null, warmInputAt = 0;
  function warmInterrupted() {
    var pending = navigator.scheduling && navigator.scheduling.isInputPending;
    return performance.now() - warmInputAt < 250 || !!(pending && pending.call(navigator.scheduling, { includeContinuous: true }));
  }
  function measurementStamp() {
    return [dialog.style.width, root.getAttribute('data-pmt-look'), root.getAttribute('data-pmt-mode'), czFitEpoch,
      document.documentElement.getAttribute('data-o55-nier-parts') || '', scope, JSON.stringify(eff().font)].join('|');
  }
  function cancelWarmMeasurements() {
    ++warmGeneration;
    if (warmMeasureJob) {
      if (window.cancelIdleCallback) cancelIdleCallback(warmMeasureJob); else clearTimeout(warmMeasureJob);
    }
    warmMeasureJob = 0; warmWaiting = false; warmMeasureQueue = []; warmComplete = null;
    var cleanups = warmCleanups; warmCleanups = [];
    cleanups.forEach(function (clean) { clean(); });
  }
  function keepWarmCleanup(clean) { if (typeof clean === 'function') warmCleanups.push(clean); }
  function nextWarmPhase() {
    if (warmMeasureJob || warmWaiting || !warmMeasureQueue.length) return;
    var generation = warmGeneration;
    function idle() {
      warmMeasureJob = 0;
      if (generation !== warmGeneration || disposed || !closed) return;
      if (sheetBusy() || warmInterrupted() || !root.classList.contains('pmed-prepared')) { warmPaintSoon(300); return; }
      warmWaiting = true;
      function runWarmPhase() {
        if (generation !== warmGeneration) return;
        warmWaiting = false;
        if (disposed || !closed) return;
        if (sheetBusy() || warmInterrupted() || !root.classList.contains('pmed-prepared')) { warmPaintSoon(300); return; }
        var work = warmMeasureQueue.shift(); if (work) work();
        if (generation !== warmGeneration) return;
        if (warmMeasureQueue.length) nextWarmPhase();
        else { var done = warmComplete; warmComplete = null; warmCleanups = []; if (done) done(); }
      }
      // A separate layout pass follows each phase's writes. Idle alone does
      // not guarantee clean layout when another idle callback wrote before us.
      if (window.PM_AFTER_LAYOUT) window.PM_AFTER_LAYOUT(runWarmPhase);
      else requestAnimationFrame(function () { setTimeout(runWarmPhase, 0); });
    }
    warmMeasureJob = window.requestIdleCallback ? requestIdleCallback(idle) : setTimeout(idle, 50);
  }
  function fitWarm() { PMW.czFit(root, function (phase) { warmMeasureQueue.unshift(phase); }); }
  function warmMeasurementsSoon() {
    if (disposed || !closed || warmMeasureJob || warmWaiting || warmMeasureQueue.length || warmPaint || warmPaintIdle || !root.classList.contains('pmed-prepared')) return;
    if (sheetBusy() || warmInterrupted()) { warmPaintSoon(300); return; }
    var stamp = measurementStamp();
    if (warmMeasureStamp === stamp) return;
    var faces = EL().FACES || {}, base = scope === 'tab' ? v.tabAppearance || {} : {};
    var patches = Object.keys(faces).map(function (id) { return { font: id }; });
    SETS.forEach(function (s) { if (s.patch && s.patch.font) patches.push(s.patch); });
    var append = function (phase) { warmMeasureQueue.push(phase); };
    append(fitWarm);
    patches.forEach(function (patch) {
      if (preview && preview.primeFont) keepWarmCleanup(preview.primeFont(EL().resolve({ tabAppearance: Object.assign({}, base, patch) }).font, append));
    });
    var weights = [].slice.call(root.querySelectorAll('[data-seg="fontWeight"] [data-value]'));
    var seen = {};
    Object.keys(faces).forEach(function (id) {
      var range = faces[id].weights, key = range && range.join('|');
      if (!range || seen[key]) return; seen[key] = true;
      var hidden = null;
      var restore = function () { if (!hidden) return; weights.forEach(function (b, i) { if (b.hidden !== hidden[i]) b.hidden = hidden[i]; }); hidden = null; root._czFit = null; };
      keepWarmCleanup(restore);
      append(function () {
        hidden = weights.map(function (b) { return b.hidden; });
        weights.forEach(function (b) { var n = Number(b.getAttribute('data-value')), hide = n < range[0] || n > range[1]; if (b.hidden !== hide) b.hidden = hide; });
      });
      append(fitWarm); append(restore); append(fitWarm);
    });
    var tiles = [], heights = [], sizing = false, contained = false;
    keepWarmCleanup(function () { if (sizing && !contained) root.classList.remove('pmed-contained'); });
    append(function () { sizing = true; root.classList.remove('pmed-contained'); tiles = [].slice.call(root.querySelectorAll('.pmt-cz-scheme')); });
    append(function () {
      heights = tiles.map(function (tile) {
        var css = getComputedStyle(tile), height = parseFloat(css.height);
        if (tile.hidden || css.display === 'none' || !isFinite(height)) return null;
        if (css.boxSizing === 'border-box') height -= parseFloat(css.paddingTop) + parseFloat(css.paddingBottom) + parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
        return Math.max(0, height);
      });
    });
    append(function () {
      tiles.forEach(function (tile, i) {
        if (heights[i] === null) { tile.removeAttribute('data-pmed-sized'); return; }
        tile.style.containIntrinsicBlockSize = 'auto ' + heights[i] + 'px'; tile.setAttribute('data-pmed-sized', '');
      });
      root.classList.add('pmed-contained'); contained = true;
    });
    warmComplete = function () { if (measurementStamp() === stamp) warmMeasureStamp = stamp; else warmPaintSoon(300); };
    nextWarmPhase();
  }
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', warmMeasurementsSoon);
  var controlsDirty = true, paintedContext = '';
  function controlContext() {
    return JSON.stringify([scope, inst.path, inst.indent ? inst.indent() : null,
      EL().settingsReady(), v.tabAppearance || {}, v.previewAppearance || null]);
  }
  function paint() {
    // The tile, Changed mark, group count and footer all read the same fields.
    // Resolve each layer once for this paint, without caching across edits.
    // A pick still waiting for its write is applied first: painting the old
    // model would take back the state its control already shows.
    if (pendingWrite && !paintRead) flushWrite();
    if (paintRead) return;
    paintRead = { own: Object.create(null), values: Object.create(null) };
    try {
      paintControls();
      paintedContext = controlContext(); controlsDirty = false;
    } finally { paintRead = null; }
    if (closed) warmMeasurementsSoon();
  }
  function paintControls() {
    var R = eff(), lk = R.lookKey, isNier = lk === 'nier';
    setA(root, 'data-pmt-look', lk);
    setA(root, 'data-pmt-mode', R.look.mode === 'light' ? 'light' : 'dark');
    setA(root, 'data-scope', scope);
    root.classList.toggle('pmt-cz-reduced', !!R.look.reduced);
    /* the effect pictures are drawn in this scope's own colours (the terminal's art reads these): a scheme's from the
       editor's own variables, the look's from a reading taken once per look (lookTokens); never a computed-style read
       inside a choice, which made the page restyle everything at once and froze the sweep (a GPU film) */
    // The look tokens are inherited from the editor root; the contrast floor is
    // applied on its code surfaces. Changing the floor needs no new art reading.
    var lkKey = lk + '|' + R.look.mode + '|' + (inst.root && inst.root.getAttribute('data-phosphor') || '');
    // The preview has this scope's current choice. A hidden real editor keeps
    // its last drawn scheme until shown, so its colours can be stale here.
    var artSource = preview || inst;
    var sv = artSource.schemeVarsNow ? artSource.schemeVarsNow() : null, lt = lookTokens(lkKey);
    var tok = function (n) { return (sv && sv[n]) || (lt && lt[n]) || ''; };
    setVar('--pmt-cz-sfg', tok('--pmw-ed-fg') || '#ccc');
    setVar('--pmt-cz-sbg', tok('--pmw-ed-gutbg') || '#111');
    setVar('--pmt-cz-sglow', tok('--pmw-ed-s-str') || '#8f8');
    /* the bracket picture in this scope's own pair colours, each held at 4.5:1 on the picture's ground (landing QA EC-09:
       One Dark's yellow on a light ground read 1.46:1) */
    var leg = PMW.edLegible || function (c) { return c; }, sbg = tok('--pmw-ed-gutbg') || '#111';
    ['#e5c07b', '#c678dd', '#61afef'].forEach(function (d, i) { setVar('--pmt-cz-sbp' + i, leg(tok('--pmw-ed-bp-' + i) || d, sbg, 4.5)); });
    [].forEach.call(root.querySelectorAll('[role="radio"][data-key]'), function (b) {
      var key = b.getAttribute('data-key');
      setA(b, 'aria-checked', String(String(current(key, R)) === b.getAttribute('data-value')));
    });
    var on = { schemePair: !!val('schemePair'), syntax: R.colors.syntax, bracketPairs: R.colors.bracketPairs, ligatures: R.font.ligaturesAsked,
      activeIndent: R.lines.activeIndent, wordWrap: R.lines.wrap, minimap: R.lines.minimap, stickyScroll: R.lines.sticky,
      reveal: !!val('reveal'), inactiveDim: R.motion.inactiveDim, scanlines: R.motion.scanlines, glow: R.motion.glow, detectIndent: R.indent.detect };
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
      setT(r.parentNode.querySelector('output'), fmt(key, Number(r.value)));
      r.closest('[data-slider]').classList.toggle('pmt-cz-is-mine', mine(key));
    });
    setT(root.querySelector('[data-out="fontSize"]'), fmt('fontSize', R.font.size));
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
    if (fa && lt && fa.getAttribute('data-for') !== lkKey) {
      var g = function (n) { return lt[n] || ''; };
      fa.innerHTML = codeArt({ bg: g('--pmw-ed-gutbg') || g('--pmw-ed-bg'), fg: g('--pmw-ed-fg'), kw: g('--pmw-ed-s-kw'), fn: g('--pmw-ed-s-fn'), str: g('--pmw-ed-s-str'), com: g('--pmw-ed-s-com'), b0: g('--pmw-ed-bp-0'), word: 'the look' });
      fa.setAttribute('data-for', lkKey);
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
    note('[data-note-indent]', indentNote(R));
    var tabN = scope === 'app' ? Object.keys(EL().FIELDS).filter(function (k) { return EL().own('tab', v, k) !== undefined; }).length : 0;
    note('[data-note-side]', tabN ? 'This editor keeps ' + (tabN === 1 ? 'one choice of its own, which stays' : tabN + ' choices of its own, which stay') + ' on top of All editors on it. The preview shows All editors.' : '');
    /* the preview's caption, also its text alternative */
    var desc = R.schemeName + ', ' + R.font.label + ' ' + (Math.round(R.font.size * 10) / 10) + ' px, ' + R.caret.shape + ' caret' + (R.lines.wrap ? ', wraps' : '') + (R.lines.guides !== 'off' ? ', guides' : '');
    var pd = root.querySelector('[data-pv-desc]'); if (pd.textContent !== desc) pd.textContent = desc;
    setA(homeBox, 'aria-label', 'Preview: ' + desc);
    /* counts */
    var mineKeys = COUNTED.filter(mine), n = mineKeys.length;
    [].forEach.call(root.querySelectorAll('.pmt-cz-cells > i'), function (c, i) { c.classList.toggle('pmt-cz-on', mine(COUNTED[i])); });
    var mn = root.querySelector('[data-meter-n]'), mt = n ? n + (n === 1 ? ' change' : ' changes') : 'The look’s own';
    if (mn.textContent !== mt) mn.textContent = mt;
    setT(root.querySelector('[data-meter-scope]'), scope === 'tab' ? 'This editor' : 'All editors');
    GROUPS.forEach(function (gp) {
      var k = GROUP_KEYS[gp[0]].filter(mine).length, t = k ? k + ' changed' : '';
      var c = root.querySelector('[data-count="' + gp[0] + '"]'); if (c.textContent !== t) c.textContent = t;
      var nv = root.querySelector('[data-navn="' + gp[0] + '"]'); if (nv.textContent !== (k ? String(k) : '')) nv.textContent = k ? String(k) : '';
      root.querySelector('[data-act="group-reset"][data-group="' + gp[0] + '"]').hidden = !k;
    });
    var ft = root.querySelector('[data-foot-n]'), ftt = n ? n + (n === 1 ? ' change from the look in ' : ' changes from the look in ') + (scope === 'tab' ? 'this editor' : 'all editors') : 'Following the look';
    if (ft.textContent !== ftt) ft.textContent = ftt;
    var rb = root.querySelector('[data-act="reset"]'); setT(rb, scope === 'tab' ? 'Reset this editor' : 'Reset all editors'); setA(rb, 'aria-disabled', String(!n));
    [].forEach.call(root.querySelectorAll('[data-set]'), function (b) { setA(b, 'aria-pressed', String(setPressed(b.getAttribute('data-set'), mineKeys))); });
    var sw = root.querySelector('[data-scope-why]'), swt = scope === 'app' ? (EL().settingsReady() ? 'Saved in this project’s Settings' : 'Saved on this computer') : 'Saved with this tab';
    if (sw.textContent !== swt) sw.textContent = swt;
    setT(root.querySelector('.pmt-cz-framelabel'), scope === 'tab' ? 'This editor' : 'This editor, like all editors');
    paintTokens();
    roving();
    if (!closed) PMW.czFit(root);
  }
  function setPressed(id, mineKeys) {
    var s = SETS.filter(function (x) { return x.id === id; })[0]; if (!s) return false;
    if (!s.patch) return mineKeys.length === 0;
    return Object.keys(s.patch).every(function (k) { return String(ownValue(k)) === String(s.patch[k]); });
  }

  /* ---- a pick answers on its own control first; the write follows the frame that shows it ----
     A quick set, a scheme, a face or a switch saves Settings and gives the live preview its new look, whose first
     raster is large (a new face's text, a new scheme on every line). Drawn in the same frame, the pressed control
     waited for that raster too: Reading's tile changed 267 ms (Basic) and 283 ms (Glass) after the click on the
     P1000 (B7). The control's own state is painted from the patch at once and gets a frame of its own; the write runs
     once that frame is committed, and paints everything else exactly as before. A newer pick, any other input in the
     screen, a paint, close and dispose run a waiting write first, so writes keep their order and none is lost. */
  var pendingWrite = null, pendingFrame = 0, pendingTimer = 0, pendingGuard = 0;
  function flushWrite() {
    var w = pendingWrite; pendingWrite = null;
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    clearTimeout(pendingTimer); clearTimeout(pendingGuard);
    pendingFrame = pendingTimer = pendingGuard = 0;
    if (w) w();
  }
  function afterAck(w) {
    flushWrite();
    pendingWrite = w;
    pendingFrame = requestAnimationFrame(function () { pendingFrame = 0; pendingTimer = setTimeout(flushWrite, 0); });
    // A hidden tab has no frames; the write never waits on one for long.
    pendingGuard = setTimeout(flushWrite, 120);
  }
  function ackRadio(b) {
    var key = b.getAttribute('data-key');
    [].forEach.call(root.querySelectorAll('[role="radio"][data-key="' + key + '"]'), function (x) { setA(x, 'aria-checked', String(x === b)); });
  }
  function ackSets(patch) {
    // the quick sets' pressed states as this patch will leave them, through the same reads paint() makes
    paintRead = { own: Object.create(null), values: Object.create(null) };
    try {
      Object.keys(patch).forEach(function (k) { paintRead.own[k] = patch[k] === null ? undefined : patch[k]; });
      var mineKeys = COUNTED.filter(mine);
      [].forEach.call(root.querySelectorAll('[data-set]'), function (b) { setA(b, 'aria-pressed', String(setPressed(b.getAttribute('data-set'), mineKeys))); });
    } finally { paintRead = null; }
  }

  /* ---- placement: beside the editor when there is room, otherwise over the middle; the scrim leaves the editor
     itself uncovered ---- */
  var placed = '';
  function place() {
    var de = document.documentElement, W = de.clientWidth || 1024, H = de.clientHeight || 768;
    var homeVisible = opts.from !== 'settings' && document.getElementById('panel-dashboard').classList.contains('active');
    var r = homeVisible && inst.root && inst.root.isConnected ? inst.root.getBoundingClientRect() : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    var placement = [W, H, r.left, r.top, r.right, r.bottom].join('|');
    if (placed === placement) return;
    placed = placement;
    var hole = r.width > 0 && r.height > 0;
    var M = 12, want = Math.min(920, W - 2 * M), narrow = W < 720, left, width = want;
    if (narrow) { left = 8; width = W - 16; }
    else if (hole && W - r.right - M * 2 >= 560) { left = r.right + M; width = Math.min(want, W - r.right - M * 2); }
    else if (hole && r.left - M * 2 >= 560) { width = Math.min(want, r.left - M * 2); left = r.left - M - width; }
    else left = Math.round((W - width) / 2);
    // A new width can wrap a tile's name. Use normal layout until its next
    // idle measurement instead of reusing an intrinsic height at the old width.
    if (dialog.style.width !== width + 'px') root.classList.remove('pmed-contained');
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
    syncDock();
    if (!closed) PMW.czFit(root);
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
    flushWrite();
    var key = b.getAttribute('data-key'), raw = b.getAttribute('data-value');
    var before = prevChosen(b.closest('.pmw-ink-row'));
    if (key === 'scope') {
      if (raw === scope) return;
      scope = v._apScope = raw; endPreview(); syncPreview(); paint(); moveInk('scope', before);
      Motion.play(body, 'pmt-rescope');
      return;
    }
    pairNote = '';
    if (b.getAttribute('aria-checked') !== 'true') { ackRadio(b); moveInk(key, before); }
    if (key === 'lineNumberMode') { afterAck(function () { write({ lineNumbers: raw !== 'off', relativeNumbers: raw === 'relative' }); }); return; }
    if (key === 'italicComments' || key === 'boldKeywords' || key === 'smoothScroll') {
      afterAck(function () {
        put(key, raw === 'follow' ? null : raw === 'on');
        if (key === 'smoothScroll') tryScroll();
      });
      return;
    }
    var value = raw;
    if (key === 'contrast' || key === 'fontWeight' || key === 'wrapColumn' || key === 'tabSize') value = Number(raw);
    if (key === 'insertSpaces') value = raw === 'true';
    if (key === 'scheme') {
      // the hover preview's pending start is cancelled now; the preview itself ends with the write
      cancelIntent();
      var name = b.querySelector('.pmt-cz-tname').textContent;
      afterAck(function () {
        endPreview(); recolor(b);
        /* a scheme of the other appearance (a light one while the app is dark) is shown as picked: Switch with light and
           dark would show its sibling instead, so it turns off for this scope, and the screen says so */
        var pick = value !== 'follow' ? EL().scheme(value) : null, mode = eff().look.mode;
        if (pick && val('schemePair') && pick.mode !== mode && EL().pairOf(pick, mode) !== pick) {
          write({ scheme: value, schemePair: false });
          pairNote = 'Switch with light and dark is now off, so ' + pick.name + ' stays while the app is ' + mode + '.';
          paint();
        } else put('scheme', value);
      });
      PMW.announce('Code colours: ' + name);
      return;
    }
    afterAck(function () {
      put(key, value);
      if ((key === 'caretShape' || key === 'caretMotion' || key === 'caretTrail' || key === 'caretBlink') && preview) tryMove();
      /* the current line's band shows on a caret, not under a selection: the preview drops its selection to show the
         choice (Sol's review of the customizer audit: the selection hid the difference) */
      if (key === 'lineHighlight' && preview && preview.demo) { stopDemo(); preview.demo.place(PV_SEL.r, PV_SEL.b); }
    });
  }
  function toggle(c) {
    flushWrite();
    var key = c.getAttribute('data-key'), next = c.getAttribute('aria-checked') !== 'true';
    setA(c, 'aria-checked', String(next));
    c.parentNode.classList.toggle('pmt-cz-lit', next);
    // the plain word; the two qualified ones (Reduce motion, a face without ligatures) come with the write's paint
    if (key !== 'reveal' && key !== 'ligatures') setT(c.querySelector('.pmt-cz-chipstate'), next ? 'On' : 'Off');
    afterAck(function () {
      put(key, next);
      if (key === 'inactiveDim' && next) tryDim();
    });
  }
  root.addEventListener('click', function (e) {
    if (closed) return;
    var t = e.target;
    flushWrite();
    if (t.closest('.pmt-cz-scrim, .pmt-cz-frame')) { close(); return; }
    var b = t.closest('button, [role="radio"], [role="switch"]'); if (!b || !root.contains(b)) return;
    if (b.getAttribute('aria-disabled') === 'true') return;
    if (b.classList.contains('pmed-tok-row')) { openPick(b.getAttribute('data-tok')); return; }
    if (b.classList.contains('pmed-tok-swatch')) { if (tokOpen) tokSet(tokOpen, b.getAttribute('data-c'), 'keep'); return; }
    if (b.getAttribute('role') === 'radio' && b.hasAttribute('data-key')) { choose(b); return; }
    if (b.getAttribute('role') === 'switch') { toggle(b); return; }
    if (b.hasAttribute('data-step')) { var R = eff(); put('fontSize', Math.min(24, Math.max(10, R.font.size + parseFloat(b.getAttribute('data-step'))))); return; }
    if (b.hasAttribute('data-set')) { quickSet(b.getAttribute('data-set')); return; }
    if (b.hasAttribute('data-jump')) { var g = root.querySelector('[data-group="' + b.getAttribute('data-jump') + '"]'); if (g) { g.scrollIntoView({ block: 'start', behavior: reducedNow() ? 'auto' : 'smooth' }); var hd = g.querySelector('h3'); if (hd) { hd.tabIndex = -1; hd.focus({ preventScroll: true }); } } return; }
    var act = b.getAttribute('data-act');
    if (act === 'close') close();
    else if (act === 'reset') { EL().reset(scope, v); PMW.announce(scope === 'tab' ? 'This editor follows All editors again' : 'All editors follow the look again'); }
    else if (act === 'group-reset') { var gpatch = {}; GROUP_KEYS[b.getAttribute('data-group')].forEach(function (k) { if (EL().own(scope, v, k) !== undefined) gpatch[k] = null; }); write(gpatch); }
    else if (act === 'default') put(b.getAttribute('data-key'), null);
    else if (act === 'try-move') tryMove();
    else if (act === 'try-type') tryType();
    else if (act === 'try-problem') tryProblem();
    else if (act === 'try-dim') tryDim();
    else if (act === 'import') importScheme();
    else if (act === 'tok-close') closePick(true);
    else if (act === 'tok-own') { if (tokOpen) tokSet(tokOpen, null, 'keep'); }
    else if (act === 'tok-reset') {
      var I = tokInfo(); if (!I) return;
      var m = tokMap(); Object.keys(m).forEach(function (k) { if (k.indexOf(I.key + '/') === 0) delete m[k]; });
      put('tokenColors', Object.keys(m).length ? m : null); PMW.announce('Token colours in ' + tokOwner(I).name + ': ' + tokOwner(I).own.toLowerCase());
    }
  });
  function quickSet(id) {
    flushWrite();
    var s = SETS.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    if (!s.patch) {
      var clear = {};
      Object.keys(EL().FIELDS).forEach(function (k) { if (EL().own(scope, v, k) !== undefined) clear[k] = null; });
      ackSets(clear);
      afterAck(function () { EL().reset(scope, v); });
      return;
    }
    /* a set changes its own fields and leaves the rest of this scope's choices (the scheme you picked stays) */
    var patch = Object.assign({}, s.patch);
    ackSets(patch);
    afterAck(function () { write(patch); });
  }
  /* Try it: the preview plays a move, some typing, a jump to a problem and how an editor you are not in looks */
  var demoTimers = [];
  function later(ms, fn) { demoTimers.push(setTimeout(fn, ms)); }
  function stopDemo() { demoTimers.forEach(clearTimeout); demoTimers = []; if (preview && preview.demo && preview.demo.stop) preview.demo.stop(); }
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
  /* a Smooth scrolling choice: the preview goes to its last line and back, gliding or jumping as the choice says */
  function tryScroll() {
    if (!preview || !preview.demo || !preview.demo.goTo) return;
    stopDemo();
    later(60, function () { preview.demo.goTo(PV_LINES.length - 1); });
    later(1000, function () { preview.demo.goTo(0); });
    later(1800, function () { preview.demo.place(PV_SEL.r, PV_SEL.b, PV_SEL.r, PV_SEL.a); });
  }
  function tryDim() {
    if (!preview || !preview.demo) return;
    stopDemo();
    preview.demo.dim(true);
    later(1600, function () { if (preview) preview.demo.dim(false); });
  }
  /* sliders: shown while they move, written when let go */
  root.addEventListener('input', function (e) {
    flushWrite();
    var t = e.target, key = t.getAttribute('data-key');
    if (t.classList.contains('pmt-cz-search')) { filter(t.value); return; }
    if (t.hasAttribute('data-hsl-in') && tokOpen) { tokSet(tokOpen, tokFromSliders(), 'live'); return; }
    if (t.hasAttribute('data-pick-hex') && tokOpen) {
      var hx = normHex(t.value), note = root.querySelector('[data-pick-note]');
      note.hidden = !!hx || t.value.length < 4; note.textContent = 'A colour like #ff79c6.';
      if (hx && hx.length === 7 && /^#?[0-9a-f]{6}$/i.test(t.value.trim())) tokSet(tokOpen, hx, 'preview');
      return;
    }
    if (!key || t.type !== 'range') return;
    var x = parseFloat(t.value);
    EL().live(scope, key, x, v); syncPreview();
    setT(t.parentNode.querySelector('output'), fmt(key, x));
  });
  root.addEventListener('change', function (e) {
    flushWrite();
    var t = e.target, key = t.getAttribute('data-key');
    if (t.hasAttribute('data-hsl-in') && tokOpen) { EL().commit(scope, 'tokenColors', v); syncPreview(); paint(); return; }
    if (t.hasAttribute('data-pick-hex') && tokOpen) { var hx = normHex(t.value); if (hx) tokSet(tokOpen, hx, 'keep'); else tokEndPreview(); return; }
    if (!key) return;
    if (t.type === 'range') { EL().commit(scope, key, v); syncPreview(); paint(); }
  });
  function filter(q) {
    var ql = String(q || '').trim().toLowerCase(), n = 0, fam = null, famHas = false;
    [].forEach.call(root.querySelectorAll('.pmt-cz-schemes > *'), function (x) {
      if (x.classList.contains('pmt-cz-fam')) { if (fam && fam.hidden !== !famHas) fam.hidden = !famHas; fam = x; famHas = false; return; }
      var hit = !ql || (x.getAttribute('data-name') || '').indexOf(ql) >= 0;
      if (x.hidden !== !hit) x.hidden = !hit; if (hit) { n++; famHas = true; }
    });
    if (fam && fam.hidden !== !famHas) fam.hidden = !famHas;
    setT(root.querySelector('[data-find-n]'), ql ? (n ? n + (n === 1 ? ' scheme' : ' schemes') : 'No scheme matches') : '');
  }
  /* a scheme previews when the pointer rests on it (160 ms, so crossing the grid previews nothing on the way) or the
     arrow keys reach it, on the preview and on the editor, at once and without the sweep (the sweep is for keeping
     one); leaving the list or Escape puts the chosen one back */
  var INTENT_MS = 160, intent = 0, intentFrame = 0, previewing = null, intentTile = null, scrollUntil = 0, pointerX = null, pointerY = null;
  var intentPointer = false, previewPointer = false;
  function cancelIntent() { clearTimeout(intent); cancelAnimationFrame(intentFrame); intent = intentFrame = 0; intentTile = null; intentPointer = false; }
  function previewSoon(tileEl, ms, pointerIntent) {
    cancelIntent();
    intentTile = tileEl;
    intentPointer = !!pointerIntent;
    var id = tileEl.getAttribute('data-value');
    if (previewing === id) { previewPointer = !!pointerIntent; return; }
    intent = setTimeout(function () {
      intent = 0;
      // Passive wheel input can already be queued while this timer runs. The
      // frame's input delivery must get a chance to cancel before we recolour.
      intentFrame = requestAnimationFrame(function () {
        intentFrame = 0;
        if (!root.isConnected || openRoot !== root || intentTile !== tileEl || (pointerIntent && performance.now() < scrollUntil)) return;
        previewing = id;
        previewPointer = !!pointerIntent;
        EL().preview(v, { scheme: id }); syncPreview();
      });
    }, ms);
  }
  function endPreview() { cancelIntent(); previewPointer = false; if (previewing === null) return; previewing = null; EL().endPreview(v); syncPreview(); }
  var schemesEl = root.querySelector('.pmt-cz-schemes');
  // A scroll moves tiles under a stationary pointer. Only genuine pointer travel
  // can start hover intent, after scrolling has been quiet for 200 ms. Gaps and
  // departures cancel the pending tile even when the pointer stays in the grid.
  schemesEl.addEventListener('pointermove', function (e) {
    var moved = e.clientX !== pointerX || e.clientY !== pointerY;
    pointerX = e.clientX; pointerY = e.clientY;
    if (!moved) return;
    var o = e.target.closest('.pmt-cz-scheme');
    if (!o || e.buttons || performance.now() < scrollUntil) { cancelIntent(); return; }
    if (o !== intentTile) previewSoon(o, INTENT_MS, true);
  }, { passive: true });
  schemesEl.addEventListener('pointerout', function (e) {
    var next = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.pmt-cz-scheme') : null;
    if (intentPointer && next !== intentTile) cancelIntent();
  }, { passive: true });
  function endPointerPreview() { if (previewPointer) endPreview(); else if (intentPointer) cancelIntent(); }
  schemesEl.addEventListener('pointerleave', function () { pointerX = pointerY = null; endPointerPreview(); });
  // Keyboard focus can scroll its tile into view. Preserve that preview while
  // still cancelling intent caused by tiles scrolling beneath the pointer.
  function scrollPreview() { scrollUntil = performance.now() + 200; endPointerPreview(); }
  body.addEventListener('wheel', scrollPreview, { passive: true });
  body.addEventListener('scroll', scrollPreview, { passive: true });
  schemesEl.addEventListener('pointerdown', cancelIntent, { passive: true });
  /* ---- Token colours: one kind of word in the scheme this scope draws, picked from the scheme's own colours or by
     hue, saturation and lightness; shown on the preview and on the editor as it changes, and held to the text floor
     there like every scheme colour (the picker says when a colour is drawn lighter or darker to read) ---- */
  var tokOpen = null, tokPv = null, tokIntent = 0, tokPalSig = '', tokLive = false;
  var tokList = root.querySelector('.pmed-tok-list'), tokPick = root.querySelector('[data-tok-pick]'), tokSw = root.querySelector('[data-pick-swatches]');
  function tokInfo() { var src = preview && preview.tokenInfo ? preview : inst; try { return src.tokenInfo ? src.tokenInfo() : null; } catch (_) { return null; } }
  function tokMap() { var m = EL().own(scope, v, 'tokenColors'); return m && typeof m === 'object' ? Object.assign({}, m) : {}; }
  function tokNext(tok, hex) {
    var I = tokInfo(); if (!I) return null;
    var m = tokMap(), k = I.key + '/' + tok;
    if (hex) m[k] = hex; else delete m[k];
    return Object.keys(m).length ? m : null;
  }
  /* how: 'live' while a slider moves (shown, not written), 'keep' (written), 'preview' (a swatch the pointer rests on) */
  function tokSet(tok, hex, how) {
    if (how === 'preview') {
      var I = tokInfo(); if (!I) return;
      var pv = {}; pv[I.key + '/' + tok] = hex;
      tokPv = hex; EL().preview(v, { tokenColors: pv }); syncPreview(); paintTokens(); return;
    }
    if (tokPv !== null) { tokPv = null; EL().endPreview(v); }
    var next = tokNext(tok, hex);
    // while a slider is dragged the rows' spoken names wait for the step that keeps it: a new name rewrites its hover
    // description, which lays the whole page out again on every step
    if (how === 'live') { EL().live(scope, 'tokenColors', next, v); syncPreview(); tokLive = true; paintTokens(); tokLive = false; return; }
    put('tokenColors', next);
    PMW.announce(TOKEN_NAME[tok][1] + (hex ? ' ' + hex : ': the scheme’s own'));
  }
  function tokEndPreview() { clearTimeout(tokIntent); if (tokPv === null) return; tokPv = null; EL().endPreview(v); syncPreview(); paintTokens(); }
  function openPick(tok) {
    if (tokOpen === tok) { closePick(true); return; }
    tokEndPreview();
    tokOpen = tok; tokPalSig = '';
    tokPick.hidden = false;
    paintTokens();
    if (!reducedNow()) Motion.play(tokPick);
    tokPick.scrollIntoView({ block: 'nearest', behavior: reducedNow() ? 'auto' : 'smooth' });
    var first = tokSw.querySelector('[aria-checked="true"]') || tokSw.querySelector('[role="radio"]') || tokPick.querySelector('[data-hsl-in="h"]');
    if (first) first.focus({ preventScroll: true });
  }
  function closePick(focusRow) {
    if (!tokOpen) return;
    tokEndPreview();
    var row = tokList.querySelector('[data-tok="' + tokOpen + '"]');
    tokOpen = null; tokPick.hidden = true; paintTokens();
    if (focusRow && row) row.focus({ preventScroll: true });
  }
  /* the name a token colour belongs to: the scheme's, or the look's own colours under Follow look ('Basic dark') */
  var LOOK_NAME = { basic: 'Basic', friendly: 'Friendly', glass: 'Glass', retro: 'Retro', nier: 'NieR Mode' };
  function tokOwner(I) {
    var m = /^look:([a-z]+)-(light|dark)$/.exec(I.key);
    return m ? { name: (LOOK_NAME[m[1]] || m[1]) + ' ' + m[2], own: 'The look’s own', lead: (LOOK_NAME[m[1]] || m[1]) + ' ' + m[2] + '’s own colours' } : { name: I.scheme, own: 'The scheme’s own', lead: I.scheme };
  }
  var paintedTokens = '';
  function paintTokens() {
    if (!tokList) return;
    var I = tokInfo(); if (!I) return;
    var mine = tokMap(), held = 0, who = tokOwner(I);
    var signature = JSON.stringify([I, mine, tokOpen, tokLive]);
    if (paintedTokens === signature) return;
    paintedTokens = signature;
    var lead = root.querySelector('[data-tok-lead]'), ltxt = 'Change one kind of word in ' + who.lead +
      '. A colour that would read under ' + I.floor + ':1 on this ground is drawn a little lighter or darker, its hue kept.';
    if (lead.textContent !== ltxt) lead.textContent = ltxt;
    tokList.style.setProperty('--pmed-tok-ground', I.ground);
    [].forEach.call(tokList.querySelectorAll('.pmed-tok-row'), function (b) {
      var k = b.getAttribute('data-tok'), t = I.tokens[k] || {}, shown = t.set || t.own || '';
      b.style.setProperty('--pmed-tok-c', t.drawn || shown);
      var hx = b.querySelector('.pmed-tok-hex'); if (hx.textContent !== shown) hx.textContent = shown;
      var isMine = mine[I.key + '/' + k] !== undefined;
      b.classList.toggle('pmt-cz-is-mine', isMine);
      setA(b, 'aria-expanded', String(tokOpen === k));
      if (!tokLive) setA(b, 'aria-label', TOKEN_NAME[k][1] + ', ' + shown + (isMine ? ', changed' : '') + (t.held ? ', drawn at ' + I.floor + ':1' : ''));
      if (t.held) held++;
    });
    var anyMine = Object.keys(mine).some(function (k) { return k.indexOf(I.key + '/') === 0; });
    var rs = root.querySelector('[data-act="tok-reset"]'); if (rs.hidden !== !anyMine) rs.hidden = !anyMine; setT(rs, 'Reset token colours in ' + who.name);
    if (!tokOpen) return;
    /* the picker */
    var t = I.tokens[tokOpen] || {}, cur = normHex(tokPv || t.set || t.own) || '#888888', hsl = hexHsl(cur) || [0, 0, 50];
    tokPick.style.setProperty('--pmed-tok-ground', I.ground);
    tokPick.style.setProperty('--pmed-tok-c', tokPv ? cur : t.drawn || cur);
    var w = tokPick.querySelector('[data-pick-word]'); if (w.textContent !== TOKEN_NAME[tokOpen][2]) w.textContent = TOKEN_NAME[tokOpen][2];
    var ti = tokPick.querySelector('[data-pick-title]'), tt = TOKEN_NAME[tokOpen][1] + ' in ' + who.name; if (ti.textContent !== tt) ti.textContent = tt;
    var ra = tokPick.querySelector('[data-pick-ratio]'), rt = t.held && !tokPv ? t.ratio + ':1 on this ground. Drawn at ' + I.floor + ':1, as ' + t.drawn + ', so it reads' : t.ratio + ':1 on this ground';
    if (ra.textContent !== rt) ra.textContent = rt;
    ra.classList.toggle('is-held', !!t.held && !tokPv);
    var palSig = I.key + '|' + I.palette.join(',');
    if (palSig !== tokPalSig) {
      tokPalSig = palSig;
      tokSw.innerHTML = I.palette.map(function (c) { return '<button type="button" class="pmed-tok-swatch" role="radio" aria-checked="false" data-c="' + c + '" aria-label="' + c + '" style="--sw:' + c + '"' + NOTAG + '></button>'; }).join('');
    }
    [].forEach.call(tokSw.querySelectorAll('.pmed-tok-swatch'), function (b) { setA(b, 'aria-checked', String(b.getAttribute('data-c') === cur)); });
    ['h', 's', 'l'].forEach(function (k, i) {
      var inp = tokPick.querySelector('[data-hsl-in="' + k + '"]'); if (document.activeElement !== inp) inp.value = hsl[i];
      var out = tokPick.querySelector('[data-hsl-out="' + k + '"]'), ot = hsl[i] + (k === 'h' ? '°' : '%'); if (out.textContent !== ot) out.textContent = ot;
    });
    tokPick.style.setProperty('--pmed-h', hsl[0]); tokPick.style.setProperty('--pmed-s', hsl[1] + '%'); tokPick.style.setProperty('--pmed-l', hsl[2] + '%');
    var hx2 = tokPick.querySelector('[data-pick-hex]'); if (document.activeElement !== hx2 && hx2.value !== cur) hx2.value = cur;
    var ob = tokPick.querySelector('[data-act="tok-own"]'); setA(ob, 'aria-disabled', String(!t.set)); if (ob.textContent !== who.own) ob.textContent = who.own;
  }
  function tokFromSliders() {
    var g = function (k) { return parseFloat(tokPick.querySelector('[data-hsl-in="' + k + '"]').value) || 0; };
    return hslHex(g('h'), g('s'), g('l'));
  }
  tokSw.addEventListener('mouseover', function (e) {
    var sw = e.target.closest('.pmed-tok-swatch'); if (!sw || !tokOpen) return;
    clearTimeout(tokIntent);
    tokIntent = setTimeout(function () { if (tokOpen) tokSet(tokOpen, sw.getAttribute('data-c'), 'preview'); }, 90);
  });
  tokSw.addEventListener('mouseleave', function () { tokEndPreview(); });
  /* keyboard: Escape closes, Tab stays inside, arrows move within a group of tiles or a segment (choosing, as radios
     do; in the schemes they preview, and Enter or Space keeps one) */
  root.addEventListener('keydown', function (e) {
    if (closed) return;
    flushWrite();
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (previewing !== null) { endPreview(); return; }
      if (tokPv !== null) { tokEndPreview(); return; }
      if (tokOpen && tokPick.contains(document.activeElement)) { closePick(true); return; }
      close(); return;
    }
    if (e.key === 'Enter' && e.target.hasAttribute && e.target.hasAttribute('data-pick-hex')) {
      e.preventDefault(); e.stopPropagation(); var hx = normHex(e.target.value); if (hx && tokOpen) tokSet(tokOpen, hx, 'keep'); return;
    }
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
      else if (nx.classList.contains('pmed-tok-swatch')) { if (tokOpen) tokSet(tokOpen, nx.getAttribute('data-c'), 'preview'); }
      else choose(nx);
      return;
    }
    if (r && (e.key === 'Enter' || e.key === ' ') && r.classList.contains('pmt-cz-scheme')) { e.preventDefault(); choose(r); }
    if (r && (e.key === 'Enter' || e.key === ' ') && r.classList.contains('pmed-tok-swatch')) { e.preventDefault(); if (tokOpen) tokSet(tokOpen, r.getAttribute('data-c'), 'keep'); }
    e.stopPropagation();
  });
  function roving() {
    [].forEach.call(root.querySelectorAll('[role="radiogroup"]'), function (g) {
      var opts2 = g.querySelectorAll('[role="radio"]'), chosen = g.querySelector('[role="radio"][aria-checked="true"]:not([hidden])') || [].filter.call(opts2, function (o) { return !o.hidden; })[0];
      [].forEach.call(opts2, function (o) { var t = !closed && o === chosen ? 0 : -1; if (o.tabIndex !== t) o.tabIndex = t; });   // a write only where it changes: each one restyles
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
  var warmPaint = 0, warmPaintIdle = 0;
  function cancelWarmPaint() {
    clearTimeout(warmPaint); warmPaint = 0;
    if (warmPaintIdle && window.cancelIdleCallback) cancelIdleCallback(warmPaintIdle);
    warmPaintIdle = 0;
  }
  function warmPaintSoon(delay) {
    cancelWarmPaint();
    cancelWarmMeasurements();
    warmPaint = setTimeout(function wait() {
      warmPaint = 0;
      if (disposed || !closed) return;
      if (sheetBusy()) {
        warmPaint = setTimeout(wait, 500); return;
      }
      var refresh = function () {
        warmPaintIdle = 0;
        if (disposed || !closed) return;
        if (sheetBusy() || warmInterrupted() || !root.classList.contains('pmed-prepared')) { warmPaint = setTimeout(wait, 300); return; }
        var append = function (phase) { warmMeasureQueue.push(phase); };
        pvView.tabAppearance = scope === 'tab' ? v.tabAppearance || {} : {};
        pvView.previewAppearance = v.previewAppearance || null;
        if (preview && preview.primeLook) keepWarmCleanup(preview.primeLook(EL().resolve(pvView), append));
        append(syncPreview); append(paint);
        warmComplete = warmMeasurementsSoon;
        nextWarmPhase();
      };
      if (window.requestIdleCallback) warmPaintIdle = requestIdleCallback(refresh); else refresh();
    }, typeof delay === 'number' ? delay : 2000);
  }
  function onIdle() { if (!disposed && closed && root.isConnected && root.classList.contains('pmed-prepared')) warmPaintSoon(0); }
  window.addEventListener('pm-idle', onIdle);
  function warmInput() { if (!closed || disposed) return; warmInputAt = performance.now(); warmPaintSoon(300); }
  var warmInputTypes = ['pointerdown', 'pointermove', 'wheel', 'keydown'];
  warmInputTypes.forEach(function (type) { window.addEventListener(type, warmInput, { capture: true, passive: true }); });
  var offChange = EL().onChange(function () {
    if (!root.isConnected) return;
    controlsDirty = true;
    if (!closed) { syncPreview(); paint(); return; }
    warmPaintSoon();
  });
  var onResize = function () { if (closed) return; place(); if (preview && preview.demo) preview.demo.relayout(); };
  window.addEventListener('resize', onResize);
  var resizeRaf = 0, placeAfterResize = false;
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (list) {
    if (closed) return;
    list.forEach(function (en) { if (en.target === inst.root) placeAfterResize = true; });
    // Relayout writes the preview's geometry. Keep that out of the observer's
    // delivery loop and combine the home and dock notifications into one pass.
    if (!resizeRaf) resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      if (closed) return;
      if (placeAfterResize) { placeAfterResize = false; place(); }
      if (preview && preview.demo) preview.demo.relayout();
    });
  }) : null;
  if (ro) { if (inst.root) ro.observe(inst.root); ro.observe(homeBox); ro.observe(dockBox); }
  /* the preview follows you down the screen only where the real editor is not beside it (the one rule of both
     Customize screens, 2026-10-14): when less than 40 % of its own place shows and the screen is not placed beside the
     editor (a narrow window, or no room on either side), the same live editor moves into the dock under the group
     index, and back when its place returns. Beside the editor, the editor itself is the live preview */
  var io = null, wantDock = false;
  function syncDock() { if (dock) dockTo(wantDock && !dialog.classList.contains('pmt-cz-beside')); }
  function dockTo(on) {
    if (!preview || !!on === !dock.hidden) return;
    (on ? dockBox : homeBox).appendChild(pvHost);
    dock.hidden = !on; root.classList.toggle('pmt-cz-docked', !!on);
    if (on) Motion.play(dock);
    preview.demo.relayout();
  }
  /* the docked preview steps aside (it fades nearly clear) while the pointer or the focus is on what it floats over,
     so a control under it can be read as well as reached; it comes back when they leave */
  var asideRaf = 0, asideAt = null;
  function dockAside() {
    asideRaf = 0;
    if (dock.hidden || !asideAt) { dock.classList.remove('is-aside'); return; }
    var r = dock.getBoundingClientRect(), a = asideAt, hit;
    if (a.el) { var bx = a.el.getBoundingClientRect(); hit = bx.right > r.left && bx.left < r.right && bx.bottom > r.top && bx.top < r.bottom; }
    else hit = a.x >= r.left - 10 && a.x <= r.right + 10 && a.y >= r.top - 10 && a.y <= r.bottom + 10;
    dock.classList.toggle('is-aside', hit);
  }
  function asideSoon(at) { asideAt = at; if (!asideRaf) asideRaf = requestAnimationFrame(dockAside); }
  body.addEventListener('pointermove', function (e) { asideSoon({ x: e.clientX, y: e.clientY }); }, { passive: true });
  body.addEventListener('pointerleave', function () { asideSoon(null); });
  body.addEventListener('scroll', function () { if (asideAt) asideSoon(asideAt); }, { passive: true });
  root.addEventListener('focusin', function (e) { if (body.contains(e.target) && !dock.contains(e.target)) asideSoon({ el: e.target }); });
  if (preview && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(function (list) { if (closed) return; var en = list[list.length - 1]; wantDock = en.intersectionRatio < 0.4; syncDock(); }, { root: body, threshold: [0, 0.4, 1] });
    io.observe(root.querySelector('.pmt-cz-preview'));
  }
  var closed = true, disposed = false, visit = 0, parkedAtTop = true;
  var importError = root.querySelector('[data-import-error]');
  /* The sheet appears under a pointer that rests on Settings. Hit at once, the pointer's hover left Settings' column in
     the opening frame, and the page's :hover rules restyled that whole column (about 1100 icons and labels: 120 ms on
     Nas1, 29 ms on the P1000) before the sheet's first frame. Until the pointer next moves, presses or scrolls, or the
     entrance ends, the sheet's plates let it through, so that hover changes later, while the entrance plays on the
     compositor. A press or a wheel that comes first is kept from the page under the sheet. */
  var passing = false, PASS = ['pointermove', 'pointerdown', 'wheel'], passOpts = { capture: true, passive: false };
  function passThrough(on) {
    if (passing === on) return;
    passing = on;
    root.classList.toggle('pmed-pass', on);
    PASS.forEach(function (t) { if (on) window.addEventListener(t, endPass, passOpts); else window.removeEventListener(t, endPass, passOpts); });
  }
  function keepFromPage(e) { if (!root.contains(e.target)) { e.preventDefault(); e.stopPropagation(); } }
  function endPass(e) {
    if (!passing) return;
    passThrough(false);
    if (e.type === 'pointermove' || closed || root.contains(e.target)) return;
    keepFromPage(e);
    if (e.type !== 'pointerdown') return;
    // its mouse events and click would reach the page too
    var types = ['mousedown', 'mouseup', 'click'], done = function () { types.forEach(function (t) { window.removeEventListener(t, keepFromPage, true); }); };
    types.forEach(function (t) { window.addEventListener(t, keepFromPage, true); });
    window.addEventListener('pointerup', function () { setTimeout(done, 0); }, { capture: true, once: true });
    setTimeout(done, 1500);
  }
  function focusStopsOn(on) {
    // Keep layout available to idle preparation while excluding the entire
    // parked subtree from focus, selection and find-in-page, including the
    // browser's automatic focus stop on the overflow scroller.
    root.inert = !on;
    if (on) roving();
  }
  function dispose() {
    flushWrite();
    passThrough(false);
    disposed = true;
    stopDemo(); endPreview(); tokEndPreview();
    if (offChange) offChange();
    window.removeEventListener('pm-idle', onIdle);
    warmInputTypes.forEach(function (type) { window.removeEventListener(type, warmInput, true); });
    window.removeEventListener('resize', onResize);
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    if (root._pmedFinish) root._pmedFinish();
    cancelWarmMeasurements();
    if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener('loadingdone', warmMeasurementsSoon);
    cancelAnimationFrame(lookRaf); cancelAnimationFrame(asideRaf); cancelAnimationFrame(resizeRaf);
    cancelWarmPaint();
    if (preview) { try { preview.unmount(); } catch (_) {} preview = null; }
    if (inst.customizing) inst.customizing(false);
    root.remove();
    if (openRoot === root) openRoot = null;
  }
  function close(noFocus) {
    if (closed) return;
    flushWrite();
    passThrough(false);
    closed = true;
    var closing = ++visit;
    stopDemo(); endPreview(); tokEndPreview();
    if (openRoot === root) openRoot = null;
    // Return focus before making the sheet inert. Its measured contents and
    // all exit effects stay mounted through the family animation.
    if (!noFocus) { try { (anchor && anchor.isConnected ? anchor : null) ? anchor.focus({ preventScroll: true }) : inst.focus(); } catch (_) {} }
    root.setAttribute('aria-hidden', 'true'); focusStopsOn(false);
    // Keep the whole sheet through its exit and reuse it on the next visit.
    // Neither teardown nor a fresh 37-tile build belongs inside an animation.
    function park() {
      if (closing !== visit || disposed) return;
      root.classList.add('pmed-prepared');
      // Back to the top while nothing shows, so the next visit's handler need
      // not write the scroller and force the page's layout before its frame.
      if (body.scrollTop) body.scrollTop = 0;
      parkedAtTop = true;
      if (inst.customizing) inst.customizing(false);
      warmMeasurementsSoon();
    }
    if (noFocus) park(); else Motion.leave(root, park);
    if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (_) {} }
  }
  root._pmedClose = close;
  root._pmedPreview = preview;
  place();
  if (preview && preview.demo) preview.demo.relayout();
  syncPreview();
  paint();
  filter('');
  focusStopsOn(false);
  var handle = { el: root, inst: inst, dispose: dispose, show: show, close: function () { close(); }, refresh: function () { if (!closed) { syncPreview(); paint(); } }, preview: preview };
  function show(next) {
    if (next.prepare) return handle;
    flushWrite();
    cancelWarmMeasurements(); cancelWarmPaint();
    opts = next; anchor = opts.anchor || null;
    scope = opts.scope === 'app' ? 'app' : v._apScope || 'tab';
    // Read placement while the prepared sheet is still parked, before its
    // focus/animation writes invalidate style. A cached visit already has its
    // full preview and controls: only a changed model or context needs paint.
    place();
    // The retained DOM is a new visit. Keep saved appearance choices, but
    // discard the previous visit's open picker and one-off explanations.
    if (tokOpen) { tokEndPreview(); tokOpen = null; tokPick.hidden = true; controlsDirty = true; }
    if (pairNote) { pairNote = ''; controlsDirty = true; }
    if (importError && !importError.hidden) { importError.hidden = true; setT(importError, ''); }
    var needsPaint = controlsDirty || paintedContext !== controlContext();
    closed = false; ++visit; openRoot = root;
    root.inert = false;
    root._pmedGen = (root._pmedGen || 0) + 1;
    if (root.classList.contains('pmt-in') || root.classList.contains('pmt-out')) root.classList.remove('pmt-in', 'pmt-out');
    wantDock = false; dockTo(false);
    if (!parkedAtTop) body.scrollTop = 0;
    parkedAtTop = false;
    var search = root.querySelector('.pmt-cz-search');
    if (search.value) { search.value = ''; filter(''); }
    if (inst.customizing) inst.customizing(true);
    syncPreview();
    if (needsPaint) paint(); else PMW.czFit(root);
    focusStopsOn(true);
    root.removeAttribute('aria-hidden');
    passThrough(true);
    root.classList.remove('pmed-prepared');
    // the entrance's end lets the pointer hit the sheet too, for a pointer that has not moved
    Motion.sheet(root, false, function () { passThrough(false); });
    var first = root.querySelector('[data-seg="scope"] [aria-checked="true"]') || dialog;
    // Let the entrance paint before focus asks the browser for geometry. A
    // newer visit invalidates this job, so a quick close cannot reclaim focus.
    var showing = visit;
    requestAnimationFrame(function () { setTimeout(function () {
      if (!closed && showing === visit && !opts.group) first.focus({ preventScroll: true });
    }, 0); });
    var goTo = opts.group && root.querySelector('[data-group="' + opts.group + '"]' + (opts.at ? ' [data-at="' + opts.at + '"]' : ''));
    if (goTo) { goTo.scrollIntoView({ block: 'start' }); var gh = goTo.querySelector('h3, h4'); if (gh) { gh.tabIndex = -1; gh.focus({ preventScroll: true }); } }
    return handle;
  }
  prepared = handle;
  return opts.prepare ? handle : show(opts);
}

// Prepare one editor sheet while the app is idle. The preview and static palette
// survive its visits; another editor replaces this bounded cache. Never build
// underneath onboarding or while a page/Usage transition is playing.
function prepareSoon() {
  if (prepared || openRoot) return;
  if (sheetBusy()) { setTimeout(prepareSoon, 1500); return; }
  var inst = PMW.editorInView && PMW.editorInView(true);
  if (!inst) { setTimeout(prepareSoon, 1500); return; }
  var build = function () {
    if (!prepared && !openRoot) {
      if (sheetBusy()) { setTimeout(prepareSoon, 1500); return; }
      // Settings is the app-level entry. Prepare its actual width and scope,
      // not the narrower editor cutout, which would reflow every tile on open.
      open({ view: inst.view, scope: 'app', from: 'settings', prepare: true });
    }
  };
  if (window.requestIdleCallback) requestIdleCallback(build); else setTimeout(build, 500);
}
window.addEventListener('load', function () { setTimeout(prepareSoon, 1500); }, { once: true });

/* the editor's More menu opens it on this editor (10-editor.js openCustomize); Settings' Editor look group opens it on
   the editor in view, for All editors, opening the project's entry file first when Home shows no editor */
PMW.edCustomize = { open: open };
window.PM_EDITOR_CUSTOMIZE = Object.freeze({
  open: function (o) {
    o = o || {};
    var inst = PMW.editorInView ? PMW.editorInView(o.from === 'settings') : null;
    if (inst) return open(Object.assign({}, o, { view: inst.view, scope: o.scope || 'app' }));
    try { PM_HOME.open({ kind: 'editor', path: 'src/main.rs' }); } catch (_) {}
    var tries = 0;
    (function wait() {
      var e2 = PMW.editorInView ? PMW.editorInView(o.from === 'settings') : null;
      if (e2) { open(Object.assign({}, o, { view: e2.view, scope: o.scope || 'app' })); return; }
      if (++tries < 30) setTimeout(wait, 100);
    })();
    return null;
  }
});
