/* The terminal's Customize screen: its Appearance (D15, D16, D17; F3-642, F3-643, F3-644), opened from the More menu's
   Appearance... and from T.AppearancePopover.open(anchor, { surface: 'terminal', view }) (the one Appearance component,
   DR-068; the editor's surface stays the compact popover in 76-popover.js, sharing its scheme rows).
   It is drawn after NieR Mode's Plug-in Chips popup (onboarding src/settings/kit.d/22-nier-chips.js): a kicker band and
   the title over a lead line; a preview at the top beside a side column (what this scope changes, as a meter, the
   quick sets, and try-it actions); then every option in its group, as tiles that show what they choose and chips that
   say what they turn on, with Done at the foot. Every look draws it its own way (26-customize.css); NieR paints only
   through its installed parts.
     - the preview is a real terminal view (T.View) on a session that never starts a program, written with a short
       scripted transcript and its command marks: it resolves the same layers as the terminal, so what it shows is
       what the terminal draws (scheme, face, cursor, trail, ground, effects, bell, dimming)
     - the scope switch chooses the layer written: "This terminal" (this tab) or "All terminals" (the Project's
       Settings rows, SSYS-051; the earlier stores where Settings is absent). The preview shows that scope's terminal
     - the real terminal stays visible through a cut-out in the scrim, so it changes beside the preview
     - everything applies live and is saved; sliders show while they move and are written when let go
   It lives in the panels' overlay root (#pmw-overlay, CONTRACT section 14) and closes on Escape, Done, the close
   button or the scrim, giving the focus back to the terminal. */
(function () {
  var A = function () { return T.Appearance; };
  var esc = function (s) { return T.util.esc(s); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var NOTAG = ' data-pm-hover-visual-suppressed="true"';
  function tagged(label, detail) { return ' data-pm-hover-label="' + esc(label) + '"' + (detail ? ' data-pm-hover-detail="' + esc(detail) + '"' : ''); }
  function reducedNow() { return T.look().reduced || !!(T.FX && T.FX.battery && T.FX.battery.saver); }

  /* ---------------- the preview ---------------- */
  /* a transcript the size of a small terminal: a test run with a failure, a listing in the scheme's colours, the
     sixteen colours as blocks and a waiting prompt; each command carries its mark */
  function transcript(nonce, cwd) {
    var ESC = '\x1b', BEL = '\x07';
    var mark = function (k, extra) { return ESC + ']133;' + k + (extra !== undefined ? ';' + extra : '') + ';pmn=' + nonce + BEL; };
    var path = '~/' + (cwd || 'tastebook/api').replace(/^.*\/(?=[^/]+\/[^/]+$)/, '').replace(/^\/home\/[^/]+\//, '');
    var prompt = function (code) { return ESC + '[34m' + path + ESC + '[0m ' + ESC + '[2mmain' + ESC + '[0m ' + (code ? ESC + '[31m' + code + ESC + '[0m ' : '') + '$ '; };
    var cmd = function (code, text) { return mark('A') + prompt(code) + mark('B') + text + '\r\n' + mark('C'); };
    var blocks = '';
    for (var i = 0; i < 8; i++) blocks += ESC + '[3' + i + 'm' + '██';
    blocks += ' ';
    for (i = 0; i < 8; i++) blocks += ESC + '[9' + i + 'm' + '██';
    /* the times and the ignored count in faint grey and faint white, as test runners print them: a dark scheme draws its
       faint grey, a light one its faint white, nearly as its own ground (round 5, Q15: nothing in the preview sat under
       3:1, so Minimum contrast's Off and 3:1 drew the same; this is the text the floor lifts) */
    var faint = function (s, c) { return ESC + '[2;' + c + 'm' + s + ESC + '[0m'; };
    return cmd(0, 'cargo test') +
      '    ' + ESC + '[1;32mFinished' + ESC + '[0m test ' + faint('[unoptimized]', 90) + ' in ' + faint('2.31s', 90) + '\r\n' +
      'test media::thumbs ... ' + ESC + '[32mok' + ESC + '[0m ' + faint('0.02s', 37) + '\r\n' +
      'test search::rank ... ' + ESC + '[1;31mFAILED' + ESC + '[0m ' + faint('0.31s', 90) + '\r\n' +
      ESC + '[33mwarning' + ESC + '[0m: ' + ESC + '[3;2;37m2 ignored' + ESC + '[0m, see ' + ESC + '[4;36mtastebook.dev/t' + ESC + '[0m\r\n' +
      mark('D', 101) + cmd(101, 'ls') +
      'Cargo.toml  ' + ESC + '[1;34msrc/' + ESC + '[0m  ' + ESC + '[1;32mrun.sh*' + ESC + '[0m  ' + ESC + '[35mlogo.png' + ESC + '[0m  ' + ESC + '[1;31mdist.tgz' + ESC + '[0m\r\n' +
      blocks + ESC + '[0m\r\n' +
      mark('D', 0) + mark('A') + prompt(0) + mark('B');
  }
  function cwdOf(v) { return v.session && v.session.shell ? v.session.shell.cwd : v.session && v.session.cwd; }
  function Preview(box, v) {
    var cwd = this.cwd = cwdOf(v), self = this;
    this.host = v;
    this.session = new T.Session({ profile: 'zsh', cwd: cwd, by: 'user', cols: 64, rows: 12 });
    var api = { look: v.api && v.api.look ? function () { return self.host.api.look(); } : undefined };
    this.view = new T.View(box, api, this.session, { appearance: {} });
    var pv = this.view;
    pv.root.classList.add('pmt-cz-pvroot');
    pv.input.tabIndex = -1;
    pv.input.setAttribute('aria-hidden', 'true');
    this.session.term.write(transcript(this.session.nonce, cwd));
    pv._setFocus(true);
    pv.renderer.invalidate(); pv.marksDirty = true; pv.schedule(true);
    this.timers = [];
  }
  /* moved with a kept screen to another terminal (open): its look, and its own folder in the transcript */
  Preview.prototype.retarget = function (v) {
    this.host = v;
    var cwd = cwdOf(v);
    if (cwd === this.cwd) return;
    this.cwd = cwd;
    this.session.term.write('\x1bc' + transcript(this.session.nonce, cwd));
    this.view.renderer.invalidate(); this.view.marksDirty = true; this.view.schedule(true);
  };
  /* "media::thumbs" selected, so the scheme's selection colours show too; found by its text after each layout (a
     resize reflows the lines under new absolute numbers) */
  Preview.prototype.select = function () {
    var pv = this.view, buf = this.session.term.buf;
    for (var abs = buf.trimmed || 0, end = abs + buf.lines.length; abs < end; abs++) {
      var line = buf.lineAtAbs(abs), s = line ? line.text(0, line.cols) : '', i = s.indexOf('media::thumbs');
      if (i >= 0) { pv.selection = new T.Selection({ abs: abs, x: i }, { abs: abs, x: i + 12 }); pv.renderer.invalidate(); pv.schedule(true); return; }
    }
  };
  Preview.prototype.later = function (ms, fn) { var t = setTimeout(fn, ms); this.timers.push(t); };
  /* one demo at a time (pm7-customizer-audit #1: two quick cursor choices overlapped their demos, the second saved
     the first's mid-jump position and left the cursor on row 2): a new demo cancels the old one's jumps, puts the
     cursor back at the prompt it started from without drawing a trail for that, and starts from there */
  Preview.prototype.stopDemo = function () {
    this.timers.forEach(clearTimeout); this.timers = [];
    var pv = this.view, home = this.home;
    if (!home) return;
    this.home = null;
    this.session.term.write('\x1b[' + (home.y + 1) + ';' + (home.x + 1) + 'H');
    if (pv.fx) { pv.fx.lastCursor = null; if (pv.fx.trail && pv.fx.trail.clear) pv.fx.trail.clear(); }
    pv.schedule(true);
  };
  /* the cursor jumps twice and comes home: the trail, the shape and the blink show */
  Preview.prototype.moveCursor = function () {
    var pv = this.view, term = this.session.term, self = this;
    this.stopDemo();
    var c = term.buf.cursor, home = this.home = { x: c.x, y: c.y };
    var go = function (row, col) { term.write('\x1b[' + row + ';' + col + 'H'); pv.lastInput = T.util.now(); pv.schedule(true); };
    pv.lastInput = T.util.now(); if (pv._wakeCursor) pv._wakeCursor();
    this.later(140, function () { go(3, 22); });
    this.later(560, function () { go(7, 38); });
    this.later(980, function () { go(home.y + 1, home.x + 1); self.home = null; self.timers = []; });
  };
  Preview.prototype.ring = function () { this.view._lastBell = 0; this.session.term.write('\x07'); };
  /* how a terminal you are not in looks, held a moment (its own timer: a cursor demo never cancels it) */
  Preview.prototype.dim = function () {
    var pv = this.view;
    clearTimeout(this.dimTimer); pv.setDimmed(true);
    this.dimTimer = setTimeout(function () { pv.setDimmed(false); }, 1600);
  };
  Preview.prototype.dispose = function () {
    clearTimeout(this.dimTimer);
    this.timers.forEach(clearTimeout);
    if (T.Appearance) T.Appearance.forget(this.view);
    this.view.dispose();
  };

  /* ---------------- what the screen offers ---------------- */
  var CURSORS = [['follow', 'Follow look'], ['block', 'Block'], ['bar', 'Bar'], ['underline', 'Underline']];
  var TRAILS = [['follow', 'Follow look', ''], ['off', 'Off', 'None'], ['soft', 'Soft', 'A short fade'], ['glow', 'Glow', 'A bright streak'],
    ['phosphor', 'Phosphor', 'An afterglow'], ['trace', 'Trace', 'A thin ink line']];
  /* the background's kinds as the screen sorts them (round 2): T.Grounds' categories between Plain and Yours. Show is
     only a filter of the tiles; a tile is the choice */
  /* round 3: Glass and Retro kinds, every moving design under Moving whatever its kind, and All: any design in any look */
  var GCATS = [['plain', 'Plain'], ['tonal', 'Tonal'], ['wash', 'Wash'], ['pattern', 'Pattern'], ['scene', 'Scene'], ['glass', 'Glass'], ['retro', 'Retro'], ['mark', 'Mark'], ['moving', 'Moving'], ['all', 'All'], ['yours', 'Yours']];
  var LOOK_NAMES = { basic: 'Basic', friendly: 'Friendly', glass: 'Glass', retro: 'Retro', nier: 'NieR' };
  var PLAIN = [['follow', 'Look’s own', 'The look’s own ground'], ['theme', 'Theme surface', 'The scheme’s own colour'], ['solid', 'Solid colour', 'Any colour you pick']];
  /* round 3: a slim lip or a monitor case (71-bezel.js), in the materials real housings were made of */
  var BEZELS = [['off', 'Off'], ['rim', 'Slim'], ['case', 'Monitor']];
  var BEZEL_COLORS = [['follow', 'Follow look', ''], ['charcoal', 'Graphite plastic', '#393a3e'], ['black', 'Black gloss', '#151517'], ['platinum', 'Platinum plastic', '#cfc8b8'],
    ['putty', 'Putty plastic', '#b8af9d'], ['aluminium', 'Brushed aluminium', ''], ['gunmetal', 'Gunmetal', ''], ['glass', 'Glass', ''], ['accent', 'Accent plastic', '']];
  var FACE_TAGS = { 'jetbrains-mono': 'Code face', 'atkinson': 'Easy reading', 'vt323': 'Retro', 'departure': 'Retro', 'sixtyfour': 'Retro, scan axes',
    'sixtyfour-raster': 'Retro, baked scan', 'system': 'This computer’s' };
  /* the effect chips: what each draws, in plain words */
  var EFFECTS = [
    { key: 'scanlines', name: 'Scanlines', help: 'Thin dark lines across the text, like an old monitor.', strength: ['scanStrength', 0, 0.6, 0.05, [0, 0.15, 0.3, 0.45, 0.6]] },
    { key: 'glow', name: 'Phosphor glow', help: 'A soft glow around the text in the scheme’s glow colour.', strength: ['glowStrength', 0, 1, 0.05, [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]] },
    { key: 'crt', name: 'Full CRT', help: 'A tube: gently curved glass with rounded corners, burn-in and grain. Pointing follows the curve.' },
    /* on or off at one faint level (Jared, 2026-10-16, P10): within the 3 % that keeps it from ever being a flash no two
       amounts looked apart, and the amount is retired */
    { key: 'flicker', name: 'Flicker', help: 'A faint flicker, at most 3 % and never a flash.' },
    { key: 'inactiveDim', name: 'Dim terminals I’m not in', help: 'Terminals you are not typing in step back.', tryIt: 'dim' },
    { key: 'smoothScroll', name: 'Smooth scrolling', help: 'Scrolling glides instead of jumping a line at a time.' }
  ];
  /* quick sets: several existing fields at once, in this scope (NieR's presets, for a terminal) */
  var SETS = [
    { id: 'look', label: 'The look’s own', help: 'Everything follows the look', patch: null },
    { id: 'calm', label: 'Calm', help: 'Nothing moves', patch: { effects: 'custom', cursorBlink: false, cursorTrail: 'off', smoothScroll: false, flicker: false, crt: false, bgMotion: 'off' } },
    { id: 'reading', label: 'Easy reading', help: 'Clear face, high contrast', patch: { font: 'atkinson', minContrast: 7, lineHeight: 1.45, ligatures: false } },
    { id: 'crt', label: 'Old monitor', help: 'A tube in a case', patch: { effects: 'custom', scanlines: true, glow: true, crt: true, curvature: 0.06, bezel: 'case', cursorTrail: 'phosphor' } }
  ];
  /* the fields the meter counts, in the order the screen shows them */
  var COUNTED = ['scheme', 'schemePair', 'minContrast', 'font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'ligatures', 'boldBright',
    'fontRendering', 'sixtyfourScan', 'sixtyfourBleed', 'cursorShape', 'cursorBlink', 'cursorTrail', 'background', 'bgColor', 'bgGradient', 'bgImage',
    'bgImageData', 'bgDim', 'bgBlur', 'bgStrength', 'bgScale', 'bgMotion', 'bgFit', 'bgDesat', 'opacity', 'padding', 'bezel', 'bezelWidth', 'bezelColor', 'bezelReflect',
    'effects', 'scanlines', 'scanStrength', 'glow', 'glowStrength', 'crt', 'curvature', 'crtMask', 'burnIn',
    'noise', 'flicker', 'inactiveDim', 'smoothScroll', 'bell', 'stickyHeader', 'copyOnSelect'];
  var GROUP_KEYS = {
    colors: ['scheme', 'schemePair', 'minContrast'],
    text: ['font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'ligatures', 'boldBright', 'fontRendering', 'sixtyfourScan', 'sixtyfourBleed'],
    cursor: ['cursorShape', 'cursorBlink', 'cursorTrail'],
    ground: ['background', 'bgColor', 'bgGradient', 'bgImage', 'bgImageData', 'bgDim', 'bgBlur', 'bgStrength', 'bgScale', 'bgMotion', 'bgFit', 'bgDesat', 'opacity', 'padding'],
    effects: ['effects', 'scanlines', 'scanStrength', 'glow', 'glowStrength', 'crt', 'curvature', 'crtMask', 'burnIn', 'noise', 'flicker', 'inactiveDim', 'smoothScroll',
      'bezel', 'bezelWidth', 'bezelColor', 'bezelReflect'],
    behavior: ['bell', 'stickyHeader', 'copyOnSelect']
  };
  var GROUPS = [['colors', 'Colors'], ['text', 'Text'], ['cursor', 'Cursor'], ['ground', 'Background'], ['effects', 'Effects'], ['behavior', 'Behavior']];

  /* ---------------- markup ---------------- */
  function ghead(id, title, lead) {
    return '<header class="pmt-cz-ghead"><h3 id="pmt-cz-g-' + id + '">' + esc(title) + '</h3><span class="pmt-cz-gcount" data-count="' + id + '"></span>' +
      '<button type="button" class="pmt-textbtn pmt-cz-greset" data-act="group-reset" data-group="' + id + '" hidden' + NOTAG + '>Reset ' + esc(title.toLowerCase()) + '</button></header>' +
      (lead ? '<p class="pmt-cz-glead">' + esc(lead) + '</p>' : '');
  }
  /* a one-of-several row in the panels' chosen-fill grammar (45-frames.css), its ink moving between the choices; a
     choice may carry shorter words (o[2]) for a row the panels' PMW.czFit finds too narrow for the full ones */
  function seg(key, opts, label) {
    return '<div class="pmt-cz-seg pmw-ink-row" role="radiogroup" aria-label="' + esc(label) + '" data-seg="' + key + '">' + opts.map(function (o) {
      return '<button type="button" class="pmt-cz-segopt pmw-ink-opt" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(o[0]) + '"' + NOTAG +
        (o[2] ? ' aria-label="' + esc(o[1]) + '"><span class="pmt-cz-sl">' + esc(o[1]) + '</span><span class="pmt-cz-ss" aria-hidden="true">' + esc(o[2]) + '</span>' : '>' + esc(o[1])) + '</button>';
    }).join('') + '</div>';
  }
  /* every one-of-several row on one line (the panels' PMW.czFit, 11-editor-customize.js, shared by both screens) */
  function fit(root) { if (window.PMW && PMW.czFit) PMW.czFit(root); }
  function chip(key, name, help, extra) {
    return '<div class="pmt-cz-chipbox" data-chip="' + key + '"><button type="button" class="pmt-cz-chip" role="switch" aria-checked="false" data-key="' + key + '" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-pins" aria-hidden="true"><i></i><i></i><i></i></span><span class="pmt-cz-chipcopy"><span class="pmt-cz-chipname">' + esc(name) + '</span>' +
      '<span class="pmt-cz-chiphelp">' + esc(help) + '</span><span class="pmt-cz-chipfoot"><span class="pmt-cz-chipstate">Off</span><span class="pmt-cz-mine">Changed</span></span></span>' +
      '<span class="pmt-cz-art pmt-cz-art-' + key + '" aria-hidden="true"></span></button>' + (extra || '') + '</div>';
  }
  /* stops (round 4, Q15 #4): the values a slider offers, each one drawing visibly apart from its neighbours, measured
     in every look; the thumb moves by index. [] is a list the screen works out as it paints (line height, letter
     spacing and a picture's dim follow the face, the display's density and the picture). A value Settings stored between
     two stops shows as itself until the slider moves */
  function slider(key, label, min, max, step, unit, stops) {
    var range = stops ? ' min="0" max="' + Math.max(0, stops.length - 1) + '" step="1" data-stops="' + esc(JSON.stringify(stops)) + '"' : ' min="' + min + '" max="' + max + '" step="' + step + '"';
    return '<label class="pmt-cz-slider" data-slider="' + key + '"><span class="pmt-cz-slabel">' + esc(label) + '</span>' +
      '<input type="range" data-key="' + key + '"' + range + ' data-unit="' + (unit || '') + '"' + tagged(label) + NOTAG + '>' +
      '<output class="pmt-cz-out"></output></label>';
  }
  /* how a face draws a weight: a hash of a line of text at 20 px, or null where a canvas cannot tell */
  var drawn = {};
  function weightDraws(stack, w) {
    var key = stack + '|' + w;
    if (key in drawn) return drawn[key];
    var h = null;
    try {
      var cv = document.createElement('canvas'); cv.width = 180; cv.height = 28;
      var g = cv.getContext('2d', { willReadFrequently: true });
      g.font = w + ' 20px ' + stack; g.fillStyle = '#000'; g.textBaseline = 'top'; g.fillText('Hamburg 0123 {[]} ->', 2, 3);
      var d = g.getImageData(0, 0, 180, 28).data; h = 0;
      for (var i = 3; i < d.length; i += 4) h = (Math.imul(h, 31) + d[i]) | 0;
    } catch (e) { h = null; }
    return (drawn[key] = h);
  }
  function stopsOf(r) { var s = r.getAttribute('data-stops'); return s ? JSON.parse(s) : null; }
  function rangeValue(r) { var st = stopsOf(r), x = parseFloat(r.value); return st && st.length ? st[Math.max(0, Math.min(st.length - 1, Math.round(x)))] : x; }
  function rangeShow(r, x) {
    var st = stopsOf(r);
    if (!st || !st.length) { r.value = String(x); return; }
    var best = 0; for (var i = 1; i < st.length; i++) if (Math.abs(st[i] - x) < Math.abs(st[best] - x)) best = i;
    r.value = String(best);
  }
  function setStops(r, list) {
    var j = JSON.stringify(list);
    if (r.getAttribute('data-stops') === j) return;
    r.setAttribute('data-stops', j); r.min = '0'; r.max = String(Math.max(0, list.length - 1)); r.step = '1';
  }
  function tile(key, value, label, art, meta) {
    return '<button type="button" class="pmt-cz-tile" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(value) + '" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-thumb" aria-hidden="true">' + (art || '') + '</span><span class="pmt-cz-tname">' + esc(label) + '</span>' + (meta ? '<span class="pmt-cz-tmeta">' + esc(meta) + '</span>' : '') + '</button>';
  }
  /* a scheme as a tiny terminal: its ground, a prompt line in its colours and eight of its sixteen */
  function schemeArt(sch) {
    var c = sch.colors, a = c.ansi;
    return '<span class="pmt-cz-sw" style="background:' + esc(c.background) + ';color:' + esc(c.foreground) + '"><span class="pmt-cz-swline"><b style="color:' + esc(a[4]) + '">~/api</b> <i style="color:' + esc(a[2]) + '">ok</i> $</span>' +
      '<span class="pmt-cz-swdots">' + [1, 2, 3, 4, 5, 6, 9, 11].map(function (i) { return '<i style="background:' + esc(a[i]) + '"></i>'; }).join('') + '</span></span>';
  }
  function schemeTiles() {
    var list = A().schemes(), out = [], fam = null;
    out.push('<button type="button" class="pmt-cz-tile pmt-cz-scheme" role="radio" aria-checked="false" data-key="scheme" data-value="follow" data-name="follow look" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-thumb" aria-hidden="true" data-follow-art></span><span class="pmt-cz-tname">Follow look</span><span class="pmt-cz-tmeta" data-follow-meta></span></button>');
    list.forEach(function (s) {
      if (s.family !== fam) { fam = s.family; out.push('<span class="pmt-cz-fam" role="presentation">' + esc(fam === 'Puppet Master' ? 'Puppet Master originals' : fam) + '</span>'); }
      out.push('<button type="button" class="pmt-cz-tile pmt-cz-scheme" role="radio" aria-checked="false" data-key="scheme" data-value="' + esc(s.id) + '" data-name="' + esc((s.name + ' ' + s.family).toLowerCase()) + '" data-pmh="tile"' + NOTAG + '>' +
        '<span class="pmt-cz-thumb" aria-hidden="true">' + schemeArt(s) + '</span><span class="pmt-cz-tname">' + esc(s.name) + '</span><span class="pmt-cz-tmeta">' + (s.appearance === 'light' ? 'Light' : 'Dark') + '</span></button>');
    });
    return out.join('');
  }
  function faceTiles() {
    var F = A().FONTS;
    return [tile('font', 'follow', 'Follow look', '<span class="pmt-cz-face" data-follow-face>Ab 0O {}</span>', '')]
      .concat(Object.keys(F).map(function (id) {
        return tile('font', id, F[id].label, '<span class="pmt-cz-face" style="font-family:' + esc(F[id].stack) + '">Ab 0O {}</span>', FACE_TAGS[id] || '');
      })).join('') + '<span class="pmt-cz-localface" data-local-face hidden></span>';
  }
  function cursorArt(shape) { return '<span class="pmt-cz-cur pmt-cz-cur-' + shape + '"><span>$ ls</span><i></i></span>'; }
  function trailArt(kind) { return '<span class="pmt-cz-trail pmt-cz-trail-' + kind + '"><i></i><b></b></span>'; }

  /* a preset as a tiny terminal in its own ground, scheme and face: what putting it on will show */
  function presetArt(v, fields) {
    var R = null;
    try { R = A().peek({ api: v.api, tabAppearance: fields || {}, previewAppearance: null, state: {} }); } catch (e) { R = null; }
    if (!R || !R.theme) return '<span class="pmt-cz-pswatch"></span>';
    var C = T.color, th = R.theme, b = R.background || {}, pal = th.palette || [];
    var ground = b.css ? b.css : b.url ? 'center / cover no-repeat url(&quot;' + esc(b.url) + '&quot;)' : b.color ? b.color : C.toHex(th.bg);
    var hex = function (i) { return pal[i] !== undefined ? C.toHex(pal[i]) : C.toHex(th.fg); };
    return '<span class="pmt-cz-pswatch" style="background:' + esc(C.toHex(th.bg)) + ';color:' + esc(C.toHex(th.fg)) + '"><span class="pmt-cz-psground" style="background:' + ground + '"></span>' +
      '<span class="pmt-cz-psline" style="font-family:' + esc(R.font.family) + '"><b style="color:' + esc(hex(4)) + '">~/api</b> <i style="color:' + esc(hex(2)) + '">ok</i> $</span>' +
      '<span class="pmt-cz-psdots">' + [1, 3, 5, 6].map(function (i) { return '<i style="background:' + esc(hex(i)) + '"></i>'; }).join('') + '</span></span>';
  }
  function sameFields(a, b) {
    var ka = Object.keys(a || {}).sort(), kb = Object.keys(b || {}).sort();
    return ka.join('|') === kb.join('|') && ka.every(function (k) { return String(a[k]) === String(b[k]); });
  }

  function termLabel(v) { var label = 'Terminal'; try { label = JSON.parse(v._lsig || '{}').label || label; } catch (e) {} return label; }
  function skeleton(v) {
    var label = termLabel(v);
    var F = A().FIELDS;
    var html = '';
    html += '<div class="pmt-cz-scrim" data-act="scrim" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="pmt-cz-frame" aria-hidden="true"><span class="pmt-cz-framelabel">This terminal</span></div>';
    /* data-lg-surface="menu": the Liquid Glass layer's opt-in for a floating sheet (its CONTRACT.md); data-lg-dense: a
       large dialog full of text takes its heavier tint (both inert without Liquid Glass) */
    html += '<section class="pmt-cz-dialog" role="dialog" aria-modal="true" aria-labelledby="pmt-cz-title" aria-describedby="pmt-cz-lead" tabindex="-1" data-lg-surface="menu" data-lg-dense>';
    html += '<header class="pmt-cz-head"><div class="pmt-cz-titles"><p class="pmt-cz-kicker"><span>' + esc('Customize · ' + label) + '</span></p>' +
      '<h2 class="pmt-cz-title" id="pmt-cz-title">Terminal appearance</h2>' +
      '<p class="pmt-cz-lead" id="pmt-cz-lead">Pick what you want to change. The preview and this terminal show it at once, and it is saved.</p></div>' +
      '<div class="pmt-cz-scope">' + seg('scope', [['tab', 'This terminal'], ['app', 'All terminals']], 'Apply to') + '<span class="pmt-cz-scopewhy" data-scope-why></span></div>' +
      '<button type="button" class="pmt-pop-x pmt-cz-x" data-act="close" aria-label="Close" aria-keyshortcuts="Escape"' + tagged('Close', 'Every change is already applied') + '><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></header>';
    html += '<div class="pmt-cz-body pmt-calm">';
    /* top: the preview and the side column */
    html += '<div class="pmt-cz-top"><figure class="pmt-cz-preview"><figcaption class="pmt-cz-pvcap"><span class="pmt-cz-pvtitle">Preview</span><span class="pmt-cz-pvdesc" data-pv-desc></span></figcaption>' +
      '<div class="pmt-cz-pvbox" data-pv-box inert></div></figure>' +
      '<aside class="pmt-cz-side"><div class="pmt-cz-meter"><div class="pmt-cz-meterhead"><span data-meter-scope>This terminal</span><b data-meter-n></b></div>' +
      '<div class="pmt-cz-cells" aria-hidden="true" style="grid-template-columns:repeat(' + COUNTED.length + ',1fr)">' + COUNTED.map(function () { return '<i></i>'; }).join('') + '</div></div>' +
      /* presets: the four built in (each changes its own few fields), then yours (each is a whole look), and saving the
         look this scope shows as a new one */
      '<div class="pmt-cz-presets" role="group" aria-labelledby="pmt-cz-presets-h"><div class="pmt-cz-presethead"><span class="pmt-cz-trylabel" id="pmt-cz-presets-h">Presets</span>' +
      '<button type="button" class="pmt-textbtn" data-act="preset-save"' + tagged('Save as a preset', 'Keep this look under a name, to put on any terminal later') + '>Save this look…</button></div>' +
      '<form class="pmt-cz-psave" data-psave hidden><input type="text" class="pmt-cz-pname-in" data-pname maxlength="40" autocomplete="off" spellcheck="false" aria-label="Preset name" placeholder="Name this look"' + NOTAG + '>' +
      '<button type="submit" class="pmt-textbtn pmt-cz-psave-go"' + NOTAG + '>Save</button><button type="button" class="pmt-textbtn" data-act="preset-cancel"' + NOTAG + '>Cancel</button></form>' +
      '<div class="pmt-cz-sets" role="group" aria-label="Built-in presets">' + SETS.map(function (s) {
        return '<button type="button" class="pmt-cz-set" aria-pressed="false" data-set="' + s.id + '" data-pmh="tile"' + NOTAG + '><span>' + esc(s.label) + '</span><small>' + esc(s.help) + '</small></button>';
      }).join('') + '</div>' +
      '<div class="pmt-cz-mylist" role="group" aria-label="Your presets" data-presets hidden></div>' +
      '<p class="pmt-cz-pnote" data-pnote role="status" hidden></p></div>' +
      '<div class="pmt-cz-try" role="group" aria-label="Try it in the preview"><span class="pmt-cz-trylabel">Try it</span>' +
      '<button type="button" class="pmt-textbtn" data-act="try-cursor"' + NOTAG + '>Move the cursor</button>' +
      '<button type="button" class="pmt-textbtn" data-act="try-bell"' + NOTAG + '>Ring the bell</button>' +
      '<button type="button" class="pmt-textbtn" data-act="try-dim"' + NOTAG + '>Step back</button>' +
      '<button type="button" class="pmt-textbtn" data-act="degauss" hidden' + tagged('Degauss', 'The tube wobbles and settles once, as a CRT does when you press its degauss button') + '>Degauss</button></div>' +
      '<p class="pmt-cz-note" data-note-side hidden></p></aside></div>';
    /* the group index */
    html += '<nav class="pmt-cz-nav" aria-label="Groups">' + GROUPS.map(function (g) { return '<button type="button" class="pmt-textbtn" data-jump="' + g[0] + '"' + NOTAG + '>' + esc(g[1]) + '<span class="pmt-cz-navn" data-navn="' + g[0] + '"></span></button>'; }).join('') +
      /* the preview docks here, small, while its own place is scrolled away */
      '<div class="pmt-cz-dock" data-dock hidden aria-hidden="true"><span class="pmt-cz-docktitle">Preview</span><div class="pmt-cz-dockbox" data-dock-box></div></div></nav>';
    /* colours */
    html += '<section class="pmt-cz-group" data-group="colors" aria-labelledby="pmt-cz-g-colors">' + ghead('colors', 'Colors', 'One catalog with the code editor. Hover a scheme to see it here and on the terminal; click to keep it.') +
      '<div class="pmt-cz-findrow"><input class="pmt-cz-search pmt-pop-search" type="search" placeholder="Find a scheme" aria-label="Find a scheme"' + NOTAG + '><span class="pmt-cz-findn" data-find-n></span></div>' +
      '<div class="pmt-cz-tiles pmt-cz-schemes" role="radiogroup" aria-label="Colour scheme">' + schemeTiles() + '</div>' +
      '<div class="pmt-cz-row">' + chip('schemePair', 'Switch with light and dark', 'A scheme you pick swaps for its family’s other version when the app changes mode.') +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Minimum text contrast</span>' + seg('minContrast', [[1, 'Off'], [3, '3:1'], [4.5, '4.5:1'], [7, '7:1']], 'Minimum text contrast') +
      '<span class="pmt-cz-fhelp">Text moves lighter or darker to stay readable; its hue never changes.</span></div></div>' +
      '<p class="pmt-cz-note" data-note-colors hidden></p>' +
      '<div class="pmt-cz-import"><button type="button" class="pmt-textbtn" data-act="import"' + tagged('Import a scheme', 'Adds a colour scheme from a file; it stays on this computer') + '>Import a scheme…</button>' +
      '<span class="pmt-cz-fhelp">iTerm2, Windows Terminal, kitty, Ghostty, Alacritty, base16 or base24, Xresources</span>' +
      '<p class="pmt-cz-error" data-import-error role="alert" hidden></p></div></section>';
    /* text */
    html += '<section class="pmt-cz-group" data-group="text" aria-labelledby="pmt-cz-g-text">' + ghead('text', 'Text') +
      '<div class="pmt-cz-tiles pmt-cz-faces" role="radiogroup" aria-label="Face">' + faceTiles() + '</div>' +
      '<p class="pmt-cz-note" data-note-face hidden></p>' +
      '<div class="pmt-cz-grid2">' +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Size</span><span class="pmt-stepper pmt-cz-stepper"><button type="button" class="pmt-step" data-step="-1" aria-label="Smaller"' + tagged('Smaller', 'The next smaller size that draws differently') + '>−</button>' +
      '<output class="pmt-cz-out" data-out="fontSize"></output><button type="button" class="pmt-step" data-step="1" aria-label="Bigger"' + tagged('Bigger', 'The next bigger size that draws differently') + '>+</button></span>' +
      '<button type="button" class="pmt-textbtn pmt-cz-default" data-act="default" data-key="fontSize"' + NOTAG + '>Face default</button></div>' +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Weight</span>' + seg('fontWeight', [[100, 'Thin', '100'], [200, 'Extra light', '200'], [300, 'Light', '300'], [400, 'Regular', '400'], [500, 'Medium', '500'], [600, 'Semibold', '600'], [700, 'Bold', '700'], [800, 'Heavy', '800']], 'Weight') +
      '<span class="pmt-cz-fhelp" data-weight-why></span></div>' +
      slider('lineHeight', 'Line height', F.lineHeight.min, F.lineHeight.max, F.lineHeight.step, '×', []) +
      slider('letterSpacing', 'Letter spacing', F.letterSpacing.min, F.letterSpacing.max, F.letterSpacing.step, ' px', []) +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Text drawing</span>' + seg('fontRendering', [['auto', 'Auto'], ['crisp', 'Crisp'], ['smooth', 'Smooth']], 'Text drawing') +
      '<span class="pmt-cz-fhelp">Crisp draws hard, pixel-sharp edges; try it if text looks blurry. Smooth draws the exact outlines.</span></div>' +
      '</div><div class="pmt-cz-chips">' + chip('ligatures', 'Ligatures', 'Joins pairs such as -> and != into one glyph where the face has them.') +
      chip('boldBright', 'Bold as bright', 'Bold text in the bright version of its colour, as older terminals did, or a more intense one where the scheme has none.') + '</div>' +
      '<div class="pmt-cz-axes" data-axes hidden><p class="pmt-cz-glead">Sixtyfour’s own axes: scanlines and bleed drawn by the face itself, with no motion.</p><div class="pmt-cz-grid2">' +
      slider('sixtyfourScan', 'Scanlines', -53, 100, 1, '', [-50, -25, 0, 25, 50, 75, 100]) + slider('sixtyfourBleed', 'Bleed', 0, 100, 1, '', [0, 33, 67, 100]) + '</div></div></section>';
    /* cursor */
    html += '<section class="pmt-cz-group" data-group="cursor" aria-labelledby="pmt-cz-g-cursor">' + ghead('cursor', 'Cursor') +
      '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Cursor shape">' + CURSORS.map(function (c) { return tile('cursorShape', c[0], c[1], cursorArt(c[0] === 'follow' ? 'look' : c[0]), ''); }).join('') + '</div>' +
      '<div class="pmt-cz-chips">' + chip('cursorBlink', 'Blink', 'The cursor blinks while you type and rests after 15 seconds.') + '</div>' +
      '<h4 class="pmt-cz-sub">Trail when the cursor jumps</h4>' +
      '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Cursor trail">' + TRAILS.map(function (t) { return tile('cursorTrail', t[0], t[1], trailArt(t[0] === 'follow' ? 'look' : t[0]), t[2]); }).join('') + '</div>' +
      '<p class="pmt-cz-note" data-note-trail hidden></p></section>';
    /* background (round 2): the look's own picks, then every kind; each tile is this scheme's own version of it */
    html += '<section class="pmt-cz-group" data-group="ground" aria-labelledby="pmt-cz-g-ground">' + ghead('ground', 'Background', 'Every background is drawn from the colour scheme, so it fits the look, light or dark, and keeps the text readable.') +
      '<div class="pmt-cz-field pmt-cz-forlook"><span class="pmt-cz-flabel" data-forlook-label>Suggested for this look</span><div class="pmt-cz-tiles pmt-cz-gtiles" role="radiogroup" aria-label="Suggested backgrounds" data-forlook></div>' +
      '<span class="pmt-cz-fhelp">Suggestions only: every background works in every look. Show lists them all.</span></div>' +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Show</span><div class="pmw-ink-row pmt-cz-gcats" role="tablist" aria-label="Kinds of background" data-seg="groundCat">' +
      GCATS.map(function (c) { return '<button type="button" class="pmt-cz-segopt pmw-ink-opt" role="tab" aria-selected="false" data-gcat="' + c[0] + '"' + NOTAG + '>' + esc(c[1]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="pmt-cz-tiles pmt-cz-gtiles" role="radiogroup" aria-label="Backgrounds" data-gtiles></div>' +
      '<div class="pmt-cz-gctl" data-gctl="solid" hidden><div class="pmt-cz-field"><span class="pmt-cz-flabel">Colour</span><span class="pmt-cz-swatches" data-solid-swatches></span>' +
      '<input type="color" class="pmt-cz-color" data-key="bgColor" aria-label="Background colour"' + NOTAG + '><output class="pmt-cz-out" data-out="bgColor"></output></div></div>' +
      '<div class="pmt-cz-gctl" data-gctl="yours" hidden><div class="pmt-cz-import"><button type="button" class="pmt-textbtn" data-act="upload"' + tagged('Choose a picture', 'PNG, JPEG or WebP from this computer, under 4 MB') + '>Choose a picture…</button><span class="pmt-cz-fhelp" data-picture-name></span></div>' +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Fit</span>' + seg('bgFit', [['cover', 'Fill'], ['contain', 'Fit'], ['tile', 'Tile'], ['center', 'Centre']], 'How the picture fits') + '</div>' +
      '<div class="pmt-cz-grid2">' + slider('bgDim', 'Dim', 0, 0.9, 0.05, '%', []) + slider('bgBlur', 'Blur', 0, 24, 1, ' px', [0, 3, 6, 12, 24]) + slider('bgDesat', 'Less colour', 0, 1, 0.05, '%', [0, 0.5, 1]) + '</div>' +
      '<p class="pmt-cz-fhelp" data-dim-why hidden></p></div>' +
      /* a design's Strength in three steps; no Blur on the built-in designs (round 4, Q15: their soft art barely changed
         under it), a picture of yours keeps it */
      '<div class="pmt-cz-gctl" data-gctl="design" hidden><div class="pmt-cz-grid2">' + slider('bgStrength', 'Strength', 0, 1, 0.05, '%', [0.35, 0.65, 1]) + '</div>' +
      '<div class="pmt-cz-field" data-gctl-sub="pattern"><span class="pmt-cz-flabel">Size</span>' + seg('bgScale', [['fine', 'Fine'], ['medium', 'Medium'], ['coarse', 'Coarse']], 'Pattern size') + '</div>' +
      '<div class="pmt-cz-field" data-gctl-sub="moving"><span class="pmt-cz-flabel">Motion</span>' + seg('bgMotion', [['off', 'Still'], ['gentle', 'Gentle'], ['lively', 'Lively']], 'Motion') +
      '<span class="pmt-cz-fhelp">It moves only while you work in this terminal, and never under Reduced Motion.</span></div></div>' +
      '<div class="pmt-cz-grid2">' + slider('opacity', 'Opacity (Glass)', 0.4, 1, 0.02, '%', []) + slider('padding', 'Padding', 0, 24, 1, ' px') + '</div>' +
      '<p class="pmt-cz-fhelp">Padding is the space round the text: the number is the sides, top and bottom take 60 % of it (8 / 5 px).</p>' +
      '<p class="pmt-cz-note" data-note-ground hidden></p></section>';
    /* effects */
    html += '<section class="pmt-cz-group" data-group="effects" aria-labelledby="pmt-cz-g-effects">' + ghead('effects', 'Effects', 'Effects run only in the terminal you are in and stop when it is idle.') +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Effects</span>' + seg('effects', [['follow', 'Follow look', 'Look'], ['off', 'Off'], ['custom', 'Custom']], 'Effects') +
      '<span class="pmt-cz-fhelp" data-effects-why></span></div>' +
      '<div class="pmt-cz-chips pmt-cz-fxchips">' + EFFECTS.map(function (e) {
        var extra = '';
        if (e.strength) extra = '<div class="pmt-cz-chipmore" data-more="' + e.key + '">' + slider(e.strength[0], 'Strength', e.strength[1], e.strength[2], e.strength[3], '%', e.strength[4]) + '</div>';
        if (e.key === 'crt') extra = '<div class="pmt-cz-chipmore" data-more="crt">' + slider('curvature', 'Curvature', 0, 0.2, 0.02, '') +
          '<label class="pmt-cz-mini"><input type="checkbox" data-key="burnIn"' + NOTAG + '><span>Burn-in</span></label>' +
          '<label class="pmt-cz-mini"><input type="checkbox" data-key="crtMask"' + NOTAG + '><span>Phosphor mask</span></label>' + slider('noise', 'Grain', 0, 0.12, 0.005, '', [0, 0.035, 0.075, 0.12]) + '</div>';
        return chip(e.key, e.name, e.help, extra);
      }).join('') + '</div>' +
      /* the bezel: its own choice, with or without Full CRT (round 2) */
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Bezel</span>' + seg('bezel', BEZELS, 'Bezel') + '<span class="pmt-cz-fhelp">A monitor housing round the screen that catches the screen’s light, on its own or with Full CRT.</span></div>' +
      /* Width by stops (round 5, Q15 #4): a pixel at a time moved NieR's flat frame too little to see; the slim lip's 6
         and the case's 24 are among them */
      '<div class="pmt-cz-bezelmore" data-bezel-more hidden><div class="pmt-cz-grid2">' + slider('bezelWidth', 'Width', 2, 48, 1, ' px', [2, 4, 6, 9, 12, 16, 20, 24, 30, 36, 42, 48]) + '</div>' +
      /* round 4 (Q15 #2): four levels a person can tell apart, the material's own marked */
      '<div class="pmt-cz-field" data-reflect-field><span class="pmt-cz-flabel">Reflection</span>' + seg('bezelReflect', [['off', 'Off'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']], 'Reflection') +
      '<span class="pmt-cz-fhelp" data-reflect-why></span></div>' +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Material</span><div class="pmt-cz-swatches" role="radiogroup" aria-label="Bezel material">' + BEZEL_COLORS.map(function (c) {
        return '<button type="button" class="pmt-cz-swatch" role="radio" aria-checked="false" data-key="bezelColor" data-value="' + c[0] + '" aria-label="' + esc(c[1]) + '"' + tagged(c[1]) + NOTAG + '><i data-bz="' + c[0] + '"' + (c[2] ? ' style="background:' + c[2] + '"' : '') + '></i></button>';
      }).join('') + '</div></div></div>' +
      '<p class="pmt-cz-note" data-note-fx hidden></p></section>';
    /* behaviour */
    html += '<section class="pmt-cz-group" data-group="behavior" aria-labelledby="pmt-cz-g-behavior">' + ghead('behavior', 'Behavior') +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Bell</span>' + seg('bell', [['follow', 'Follow look', 'Look'], ['off', 'Off']], 'Bell') +
      '<span class="pmt-cz-fhelp">What a program’s bell does: the look’s own flash, or nothing.</span></div>' +
      '<div class="pmt-cz-chips">' + chip('stickyHeader', 'Keep command titles visible', 'Pins each command’s line while you scroll its output.') +
      chip('copyOnSelect', 'Copy when I highlight', 'Text you select is copied, ready to paste.') + '</div>' +
      '<p class="pmt-cz-fhelp pmt-cz-more">Programs, starting folder, layout and saved output are in Settings, Editor & Terminal.</p></section>';
    html += '</div>';
    html += '<footer class="pmt-cz-foot"><button type="button" class="pmt-textbtn" data-act="reset"' + NOTAG + '>Reset this terminal</button><span class="pmt-cz-footn" data-foot-n></span>' +
      '<span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn pmt-textbtn-primary pmt-cz-done" data-act="close"' + tagged('Done', 'Every change is already applied and saved') + '>Done</button></footer>';
    html += '</section>';
    return html;
  }

  /* ---------------- the screen ----------------
     One screen is kept ready (P2-02, pm7-motion-part2: built on the click it held the More menu about 470 ms on the
     P1000 before it appeared whole). It is built while the app is idle for the terminal in view (prepareSoon), laid out
     and measured there, and parked: clipped away, its contents out of the tab order and the accessibility tree with no
     element in them touched (26-customize.css .pmt-cz-parked). A click shows it and plays its entrance; a close parks it
     again for the next visit. Opened on another terminal it moves there (one is kept), and it goes with its terminal,
     another being prepared then. The editor's screen does the same (11-editor-customize.js, .pmed-prepared) */
  var prepared = null;
  function open(v, opts) {
    opts = opts || {};
    if (prepared && prepared.el.isConnected) {
      if (prepared.v === v) return opts.prepare ? prepared : prepared.show(opts);
      /* another terminal's screen: closed there if it shows, and moved to this one rather than built again */
      if (!opts.prepare) { if (prepared.v.pop === prepared.el) prepared.v.closeAppearance(true); prepared.retarget(v); return prepared.show(opts); }
    }
    if (prepared) { prepared.dispose(); prepared = null; }
    if (v.pop) v.closeAppearance(true);
    var overlay = document.getElementById('pmw-overlay') || document.body;
    var root = el('div', 'pmt-cz pmt-calm pmt-cz-parked');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('data-pmw-overlay', 'terminal-appearance');
    root.innerHTML = skeleton(v);
    overlay.appendChild(root);
    var dialog = root.querySelector('.pmt-cz-dialog'), body = root.querySelector('.pmt-cz-body');
    /* the scope: All terminals when Settings opens it, for that visit only; otherwise the one last picked on this
       terminal's screen (remembered while the tab lives), This terminal at first. The editor's screen does the same */
    var scope = opts.scope === 'app' ? 'app' : v._apScope || 'tab';
    var closed = true, visit = 0, disposed = false;
    var preview = null;
    try { preview = new Preview(root.querySelector('[data-pv-box]'), v); } catch (e) { console.error('[pmt] the preview could not start', e); }
    var pv = preview && preview.view;
    var inks = {};
    [].forEach.call(root.querySelectorAll('.pmw-ink-row'), function (row) { try { if (window.PMW && PMW.frames && PMW.frames.ink) inks[row.getAttribute('data-seg')] = PMW.frames.ink(row); } catch (e) {} });

    /* what this scope resolves to: the terminal itself, or a terminal with no choices of its own */
    function scopeView() { return scope === 'tab' ? v : { api: v.api, tabAppearance: {}, previewAppearance: v.previewAppearance, state: {} }; }
    function eff() { return A().peek(scopeView()); }
    function val(key) { var o = A().own(scope, v, key); return o !== undefined ? o : A().get(scope === 'tab' ? v : scopeView(), key); }
    function mine(key) { return A().own(scope, v, key) !== undefined; }
    /* applied only when it resolves differently: applying measures the face again, a forced layout of the whole screen */
    var pvSig = '';
    function syncPreview() {
      if (!pv) return;
      pv.tabAppearance = scope === 'tab' ? v.tabAppearance || {} : {};
      pv.previewAppearance = v.previewAppearance || null;
      var R = A().resolve(pv), sig;
      try { sig = JSON.stringify(R); } catch (e) { sig = null; }
      if (sig !== null && sig === pvSig) return;
      pvSig = sig || '';
      pv.applyAppearance(R);
    }
    function write(patch) {
      A().setMany(scope, patch, v);
      syncPreview();
      paint();
    }
    function put(key, value) { var p = {}; p[key] = value; write(p); }

    /* ---- the background group (round 2): a tile's value is 'follow', 'theme', 'solid', 'custom', 'g:<gradient>' or
       'i:<picture>'; each tile is drawn in this scope's own scheme, with a line of its text ---- */
    var gcat = null, gSig = '';
    /* where the look's own ground is the scheme's own surface (Basic, Glass, Retro, NieR; Friendly has a stage of its own)
       the two choices draw the same ground, so only Look's own is offered; a saved Theme surface still resolves to that
       ground and shows as Look's own (coordinator, round 3c) */
    function ownIsTheme() {
      var Rf = A().peek({ api: v.api, tabAppearance: { background: 'follow', scheme: val('scheme') }, previewAppearance: null, state: {} }), b = Rf.background || {};
      return b.kind === 'theme' && !b.css && !b.soft;
    }
    function groundNow() {
      var k = val('background');
      if (k === 'theme' && ownIsTheme()) return 'follow';
      if (k === 'gradient') return 'g:' + val('bgGradient');
      if (k === 'image') { var im = val('bgImage'); return im === 'custom' ? 'custom' : 'i:' + (im === 'paper' ? 'fibre' : im); }
      return k;
    }
    function groundCat(gv) {
      if (gv === 'follow' || gv === 'theme' || gv === 'solid') return 'plain';
      if (gv === 'custom') return 'yours';
      return (T.Grounds && T.Grounds.cat(gv.slice(2))) || 'plain';
    }
    function groundPatch(gv) {
      if (gv === 'follow' || gv === 'theme' || gv === 'solid') return { background: gv };
      if (gv === 'custom') return { background: 'image', bgImage: 'custom' };
      var id = gv.slice(2);
      return gv.charAt(0) === 'g' ? { background: 'gradient', bgGradient: id } : { background: 'image', bgImage: id === 'fibre' ? 'paper' : id };
    }
    function chooseGround(gv) {
      clearTimeout(intent); if (previewing !== null) { previewing = null; A().endPreview(v); }
      if (gv === 'custom' && !String(val('bgImageData') || '').match(/^img:/)) { gcat = 'yours'; paint(); uploadImage(); return; }
      write(groundPatch(gv));
    }
    /* a tile's picture: the design as this scheme draws it, the look's own ground, or your picture */
    function groundArt(gv, th) {
      var G = T.Grounds, hexC = T.color.toHex;
      if (gv === 'follow') { var Rf = A().peek({ api: v.api, tabAppearance: { background: 'follow', scheme: val('scheme') }, previewAppearance: null, state: {} }); return Rf.background && Rf.background.css ? Rf.background.css : hexC(th.bg); }
      if (gv === 'theme') return hexC(th.bg);
      if (gv === 'solid') return val('bgColor') || A().solidDefault(th);
      if (gv === 'custom') { var u = A().imageUrl('custom', val('bgImageData'), 0); return String(val('bgImageData') || '').match(/^img:/) && u ? 'center / cover no-repeat url("' + u + '"), ' + hexC(th.bg) : hexC(th.bg); }
      var id = gv.slice(2), mot = G.motion(id), painted = G.painted(id);
      if (painted || mot) {
        var o = { rowPx: v.metrics ? v.metrics.cellH : 17, tile: true };
        var base = painted ? G.paint(id, th, 240, 150, o) : mot.under ? G.paint(mot.under, th, 240, 150, o) : null, lay = mot ? G.paint(id, th, 240, 150, o) : null;
        return (lay ? 'center / cover no-repeat url("' + lay.url + '"), ' : '') + (base ? 'center / cover no-repeat url("' + base.url + '"), ' : '') + hexC(th.bg);
      }
      var D = G.css(id, th, { scale: val('bgScale') }); return D ? D.css : hexC(th.bg);
    }
    function groundTile(gv, name, th, meta) {
      var fg = T.color.toHex(th.fg), acc = T.color.toHex(th.palette && th.palette[4] !== undefined ? th.palette[4] : th.fg);
      return tile('ground', gv, name, '<span class="pmt-cz-gnd" style="background:' + esc(groundArt(gv, th)) + '"><span class="pmt-cz-gline" style="color:' + fg + '"><b style="color:' + acc + '">~/api</b> $ ls</span></span>', meta || '');
    }
    function paintGround(R) {
      var G = T.Grounds, th = R.theme, now = groundNow(), cat0 = groundCat(now);
      if (!G || !th) return;
      if (!gcat) gcat = cat0;
      var sig = [gcat, th.id, th.bg, th.fg, R.lookKey, val('bgScale'), val('bgColor'), val('bgImageData'), val('scheme')].join('|');
      if (sig !== gSig) {
        gSig = sig;
        var fl = ['follow'].concat(G.forLook(R.lookKey).map(function (id) { return (G.isGradient(id) ? 'g:' : 'i:') + id; })).slice(0, 6);
        root.querySelector('[data-forlook]').innerHTML = fl.map(function (gv) { return groundTile(gv, gv === 'follow' ? 'Look’s own' : G.name(gv.slice(2)), th); }).join('');
        root.querySelector('[data-forlook-label]').textContent = 'Suggested for ' + (LOOK_NAMES[R.lookKey] || 'this look');
        var same = ownIsTheme();
        var tiles = gcat === 'plain' ? PLAIN.filter(function (p) { return !(same && p[0] === 'theme'); }).map(function (p) { return groundTile(p[0], p[1], th); }) :
          gcat === 'yours' ? [groundTile('custom', 'Your picture', th, A().pictureName(val('bgImageData') || '') || 'Choose one…')] :
          G.list().filter(function (d) { return gcat === 'all' || (gcat === 'moving' ? d.moving : d.cat === gcat); }).map(function (d) {
            /* in All, each design says which look suggests it, if one does: a hint, never a limit */
            var meta = d.moving ? 'Moves' : '';
            if (gcat === 'all' && d.looks.length) meta = (meta ? meta + ' · ' : '') + d.looks.map(function (l) { return LOOK_NAMES[l] || l; }).join(', ');
            return groundTile((G.isGradient(d.id) ? 'g:' : 'i:') + d.id, d.name, th, meta);
          });
        root.querySelector('[data-gtiles]').innerHTML = tiles.join('');
        /* solid: the scheme's own, a step deeper and a step softer, then any colour */
        /* Deeper is 35 % of the way to black, or further on a ground already near black, until it is a step the eye
           sees (round 5, Q15: Retro dark's phosphor black drew its 35 % as nearly the same); none under a black ground */
        var C = T.color, deep = null;
        for (var dk = 0.35; dk < 1.001 && deep === null; dk += 0.05) { var dc = C.mix(th.bg, 0, Math.min(1, dk)); if (Math.max(C.r(th.bg) - C.r(dc), C.g(th.bg) - C.g(dc), C.b(th.bg) - C.b(dc)) >= 12) deep = dc; }
        if (deep === null && Math.max(C.r(th.bg), C.g(th.bg), C.b(th.bg)) >= 8) deep = 0;
        var sw = [['Scheme', th.bg]].concat(deep === null ? [] : [['Deeper', deep]], [['Softer', C.mix(th.bg, th.fg, 0.08)]]);
        root.querySelector('[data-solid-swatches]').innerHTML = sw.map(function (s) {
          return '<button type="button" class="pmt-cz-swatch" data-solid-color="' + C.toHex(s[1]) + '" aria-label="' + esc(s[0]) + '"' + tagged(s[0]) + NOTAG + '><i style="background:' + C.toHex(s[1]) + '"></i></button>';
        }).join('');
      }
      [].forEach.call(root.querySelectorAll('[data-key="ground"]'), function (b) { setA(b, 'aria-checked', String(b.getAttribute('data-value') === now)); });
      [].forEach.call(root.querySelectorAll('[data-gcat]'), function (b) { setA(b, 'aria-selected', String(b.getAttribute('data-gcat') === gcat)); });
      var custom = now === 'custom', design = now.indexOf(':') === 1;
      root.querySelector('[data-gctl="solid"]').hidden = now !== 'solid';
      root.querySelector('[data-gctl="yours"]').hidden = !custom;
      root.querySelector('[data-gctl="design"]').hidden = !design;
      /* a design's own controls: Size for patterns, Motion for any that moves, whatever its kind */
      var did = design ? now.slice(2) : '', moves = !!did && !!G.motion(did);
      [].forEach.call(root.querySelectorAll('[data-gctl-sub]'), function (s) { var sub = s.getAttribute('data-gctl-sub');
        s.hidden = !(sub === 'moving' ? moves : sub === 'pattern' ? !!did && G.sized(did) : sub === cat0); });
      root.querySelector('[data-bezel-more]').hidden = val('bezel') === 'off';
      /* Reflection: the material's own level named; none for NieR's ink frame, which reflects nothing */
      var rf = reflect(R), rtxt = rf.own ? rf.name + '’s own is ' + rf.own.charAt(0).toUpperCase() + rf.own.slice(1) + '.' : '';
      root.querySelector('[data-reflect-field]').hidden = !rf.own;
      var rw = root.querySelector('[data-reflect-why]'); if (rw.textContent !== rtxt) rw.textContent = rtxt;
    }
    /* the case's Reflection now: its level, the material's own level and the material's name (Follow look: the look's own
       case), as the bezel resolves them (71-bezel.js) */
    function reflect(R) {
      var look = R.effects ? R.effects.look : 'basic', th = R.theme || {}, light = th.appearance === 'light' || (th.bg !== undefined && T.color.lum(th.bg) > 0.4);
      var id = val('bezelColor'), mat = !id || id === 'follow' ? (look === 'nier' ? null : T.Bezel.lookMaterial(look, light)) : id;
      var nm = BEZEL_COLORS.filter(function (c) { return c[0] === mat; })[0];
      return { level: T.Bezel.levelOf(val('bezelReflect'), id, look, light), own: T.Bezel.ownLevel(id, look, light), name: nm ? nm[1] : '' };
    }

    /* the size Smaller or Bigger goes to (round 5, Q15 #4): the nearest whole pixel whose cell is drawn a different
       number of device pixels wide or tall than the size shown. A cell is whole device pixels (20-metrics.js), so half a
       pixel often drew the same cell and much the same glyphs (13.5 and 14, 25 and 25.5). null at either end */
    function nextSize(R, dir) {
      var f = R.font, mt = pv && pv.metrics ? pv.metrics : v.metrics, dpr = mt ? mt.dpr : (window.devicePixelRatio || 1);
      var o = { family: f.family, weight: f.weight, boldWeight: f.boldWeight, lineHeight: f.lineHeight, letterSpacing: f.letterSpacing, dpr: dpr, crisp: f.crisp };
      var cell = function (px) { var m = T.Metrics.measure(Object.assign({}, o, { fontPx: px })); return m.devW + 'x' + m.devH; };
      var now = cell(f.size);
      for (var n = dir > 0 ? Math.floor(f.size + 1e-9) + 1 : Math.ceil(f.size - 1e-9) - 1; n >= 8 && n <= 32; n += dir) if (cell(n) !== now) return n;
      return null;
    }

    /* ---- your presets: listed with their own little picture; saved, renamed and deleted in place ---- */
    var presetSig = '', renaming = null, undoPreset = null;
    function paintPresets() {
      var box = root.querySelector('[data-presets]'), list = A().presets.list(), mineNow = A().presets.capture(scope, v);
      var sig = JSON.stringify(list) + '|' + renaming + '|' + JSON.stringify(mineNow) + '|' + eff().look.mode + '|' + eff().lookKey;
      if (sig === presetSig) return;
      presetSig = sig;
      box.hidden = !list.length;
      box.innerHTML = list.map(function (p) {
        var on = sameFields(mineNow, p.fields), n = Object.keys(p.fields).length;
        var label = renaming === p.id ? '<input type="text" class="pmt-cz-pname-in" data-rename="' + esc(p.id) + '" value="' + esc(p.name) + '" maxlength="40" autocomplete="off" spellcheck="false" aria-label="New name for ' + esc(p.name) + '"' + NOTAG + '>' :
          '<span class="pmt-cz-pname">' + esc(p.name) + '</span>';
        return '<div class="pmt-cz-mycard" data-pid="' + esc(p.id) + '">' +
          (renaming === p.id ? '<div class="pmt-cz-set pmt-cz-myset">' + presetArt(v, p.fields) + label + '</div>' :
          '<button type="button" class="pmt-cz-set pmt-cz-myset" aria-pressed="' + on + '" data-preset="' + esc(p.id) + '" data-pmh="tile"' + tagged('Put on ' + p.name, n ? n + (n === 1 ? ' choice' : ' choices') + '; everything else follows the look' : 'Everything follows the look') + '>' +
            presetArt(v, p.fields) + label + '<small>' + (n ? n + (n === 1 ? ' choice' : ' choices') : 'The look’s own') + '</small></button>') +
          '<span class="pmt-cz-pacts"><button type="button" class="pmt-pop-x pmt-cz-pact" data-act="preset-rename" data-pid="' + esc(p.id) + '" aria-label="Rename ' + esc(p.name) + '"' + NOTAG + '><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13l.6-2.6L10.5 3.5l2 2-6.9 6.9z M9.4 4.6l2 2"/></svg></button>' +
          '<button type="button" class="pmt-pop-x pmt-cz-pact" data-act="preset-delete" data-pid="' + esc(p.id) + '" aria-label="Delete ' + esc(p.name) + '"' + NOTAG + '><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></span></div>';
      }).join('');
      if (renaming) { var ri = box.querySelector('[data-rename]'); if (ri && document.activeElement !== ri) { ri.focus(); ri.select(); } }
    }
    function presetNote(text, undo) {
      var n = root.querySelector('[data-pnote]');
      n.hidden = !text;
      n.innerHTML = text ? esc(text) + (undo ? ' <button type="button" class="pmt-textbtn" data-act="preset-undo"' + NOTAG + '>Undo</button>' : '') : '';
    }
    function presetSaveOpen() {
      var f = root.querySelector('[data-psave]'), i = f.querySelector('[data-pname]'), R = eff();
      f.hidden = false;
      i.value = (R.scheme ? R.scheme.name : 'My look') + (R.font && R.font.label ? ' · ' + R.font.label : '');
      i.focus(); i.select();
    }
    function presetSaveClose(focusBtn) { var f = root.querySelector('[data-psave]'); f.hidden = true; if (focusBtn) { var b = root.querySelector('[data-act="preset-save"]'); if (b) b.focus(); } }
    function presetSave() {
      var i = root.querySelector('[data-pname]'), p = A().presets.save(i.value, scope, v);
      presetSaveClose(false);
      if (!p) { presetNote('This computer could not keep the preset (its storage is full).'); return; }
      presetNote('Saved “' + p.name + '”. It holds ' + (Object.keys(p.fields).length || 'none of the') + (Object.keys(p.fields).length === 1 ? ' choice.' : ' choices.'));
      v.announce('Saved the preset ' + p.name);
      paint();
      var card = root.querySelector('[data-preset="' + p.id + '"]'); if (card) card.focus();
    }
    function presetRenameEnd(commit, refocus) {
      var ri = root.querySelector('[data-rename]'), id = renaming;
      renaming = null;
      if (commit && ri && id) { var p = A().presets.rename(id, ri.value); if (p) v.announce('Renamed to ' + p.name); }
      presetSig = ''; paint();
      var card = refocus !== false && id && root.querySelector('[data-preset="' + id + '"]'); if (card) card.focus();
    }

    /* ---- painting: every control shows this scope's value ---- */
    var setA = function (e, n, x) { if (e.getAttribute(n) !== x) e.setAttribute(n, x); };
    function fmt(key, x) {
      if (x === null || x === undefined || x === '') return '';
      if (key === 'lineHeight') return Number(x).toFixed(2) + '×';
      if (key === 'bgDim' || key === 'opacity' || key === 'scanStrength' || key === 'glowStrength' || key === 'bgStrength' || key === 'bgDesat') return Math.round(x * 100) + '%';
      if (key === 'bezelWidth') return Math.round(x) + ' px';
      /* the number is the sides; top and bottom take 60 % of it (pm7-customizer-audit): both shown, the help says which */
      if (key === 'padding') return Math.round(x) + ' / ' + Math.round(x * 0.6) + ' px';
      if (key === 'letterSpacing' || key === 'bgBlur' || key === 'padding' || key === 'fontSize') return (Math.round(x * 100) / 100) + ' px';
      return String(Math.round(x * 1000) / 1000);
    }
    function paint() {
      var R = eff(), fx = R.effects, look = R.lookKey, isNier = !!R.look.nier;
      root.setAttribute('data-pmt-look', isNier ? 'nier' : look);
      root.setAttribute('data-pmt-mode', R.look.mode === 'light' ? 'light' : 'dark');
      root.setAttribute('data-scope', scope);
      /* the effect pictures are drawn in this scope's own scheme */
      if (R.theme) {
        root.style.setProperty('--pmt-cz-sfg', T.color.toHex(R.theme.fg));
        root.style.setProperty('--pmt-cz-sbg', T.color.toHex(R.theme.bg));
        root.style.setProperty('--pmt-cz-sglow', R.theme.roles && R.theme.roles.glow ? R.theme.roles.glow : T.color.toHex(R.theme.fg));
      }
      root.classList.toggle('pmt-cz-reduced', !!R.look.reduced);
      /* the weights the face draws apart: a face of this computer (System monospace, or one Settings names) often comes
         in only two weights, and the browser draws the others as the nearest of them, so each group of weights that
         draws the same is offered once, as its lightest (Q15 #5). The bundled faces carry every weight they list */
      var FDw = A().fontDef(R.font.id), wrange = FDw && FDw.weights, wrep = {};
      if (wrange && (R.font.id === 'system' || R.font.local)) {
        /* each group shows as Regular (400) or Bold (700) when it holds one, the weights such a face really has */
        var groups = [], ww, gi;
        for (ww = wrange[0]; ww <= wrange[1]; ww += 100) {
          var hh = weightDraws(R.font.family || FDw.stack, ww), last = groups[groups.length - 1];
          if (hh !== null && last && last.h === hh) last.w.push(ww); else groups.push({ h: hh, w: [ww] });
        }
        groups.forEach(function (g) {
          var lead = g.w.indexOf(400) >= 0 ? 400 : g.w.indexOf(700) >= 0 ? 700 : g.w[0];
          for (gi = 0; gi < g.w.length; gi++) if (g.w[gi] !== lead) wrep[g.w[gi]] = lead;
        });
      }
      /* radios: tiles and segments */
      [].forEach.call(root.querySelectorAll('[role="radio"][data-key]:not([data-key="ground"])'), function (b) {
        var key = b.getAttribute('data-key'), cur = key === 'scope' ? scope : val(key);
        if (key === 'scheme' && /^follow:/.test(String(cur))) cur = 'follow';
        if (key === 'fontWeight') cur = wrep[R.font.chosen] || R.font.chosen;
        if (key === 'bezelReflect') cur = reflect(R).level;
        setA(b, 'aria-checked', String(String(cur) === b.getAttribute('data-value')));
      });
      /* switches: what applies now (Follow look shows the look's own state) */
      var on = { scanlines: fx.scanlines.on, glow: fx.glow.on, crt: fx.crt, flicker: fx.flicker.on && !fx.off, inactiveDim: fx.dim > 0, smoothScroll: fx.smoothScroll,
        schemePair: !!val('schemePair'), ligatures: !!val('ligatures'), boldBright: !!val('boldBright'), cursorBlink: !!val('cursorBlink'),
        stickyHeader: !!val('stickyHeader'), copyOnSelect: !!val('copyOnSelect') };
      if (val('effects') === 'custom' && !R.look.reduced) on.flicker = !!val('flicker');
      /* ligatures cannot join letters that are spaced apart (canvas text drops them, as CSS does): the chip shows what
         applies and why, and the choice comes back when the spacing is 0 again (pm7-customizer-audit #2) */
      var ligPaused = !!val('ligatures') && !!R.font.letterSpacing, ligBlocked = !!R.font.letterSpacing;
      if (ligPaused) on.ligatures = false;
      [].forEach.call(root.querySelectorAll('.pmt-cz-chip'), function (c) {
        var key = c.getAttribute('data-key'), o = !!on[key];
        setA(c, 'aria-checked', String(o));
        var st = c.querySelector('.pmt-cz-chipstate'), word = o ? 'On' : 'Off';
        if (fx.off && c.closest('.pmt-cz-fxchips')) word = 'Off · effects off';
        else if (val('effects') === 'follow' && c.closest('.pmt-cz-fxchips')) word += ' · from the look';
        else if (key === 'ligatures' && ligBlocked) word = 'Needs letter spacing 0';
        if (st.textContent !== word) st.textContent = word;
        /* and while they are spaced the switch is not offered: either position would draw the same (Q15 #6) */
        if (key === 'ligatures') setA(c, 'aria-disabled', String(ligBlocked));
        c.classList.toggle('pmt-cz-is-mine', mine(key));
        var box = c.parentNode, more = box.querySelector('.pmt-cz-chipmore'); if (more) more.hidden = !o;
        box.classList.toggle('pmt-cz-lit', o);
      });
      var bi = root.querySelector('input[data-key="burnIn"]'); if (bi) bi.checked = !!val('burnIn');
      /* the stops that depend on what is drawn (round 4, Q15 #4): a cell is a whole number of device pixels (20-metrics.js),
         so letter spacing moves by one device pixel and line height by one device pixel of row, from the least row the
         face takes (anything under it draws that row); a picture's Dim starts at what keeps the text readable */
      var mt = pv && pv.metrics ? pv.metrics : v.metrics, dpr = mt ? mt.dpr : (window.devicePixelRatio || 1), sl = [], k, opacityOff = false;
      for (k = Math.ceil(-dpr - 1e-9); k <= Math.floor(3 * dpr + 1e-9); k++) sl.push(Math.round(k / dpr * 1000) / 1000);
      setStops(root.querySelector('input[data-key="letterSpacing"]'), sl);
      if (mt) {
        var fpx = mt.fontPx, lo = Math.max(Math.ceil((mt.ascent + mt.descent) * dpr * 0.9), Math.ceil(fpx * dpr - 1e-9)), hi = Math.round(fpx * 2 * dpr);
        sl = []; for (k = lo; k <= hi; k++) sl.push(Math.round(k / (fpx * dpr) * 10000) / 10000);
        if (sl.length) setStops(root.querySelector('input[data-key="lineHeight"]'), sl);
      }
      var bgR = R.background || {}, floor = bgR.custom ? Math.ceil((bgR.floor || 0) * 20 - 1e-6) / 20 : 0;
      sl = []; for (k = floor; k <= 0.9 + 1e-6; k += 0.05) sl.push(Math.round(k * 100) / 100);
      if (!sl.length) sl = [Math.min(1, Math.round((bgR.floor || 0.9) * 100) / 100)];
      setStops(root.querySelector('input[data-key="bgDim"]'), sl);
      root.querySelector('[data-slider="bgDim"]').hidden = sl.length < 2;
      /* under a heavy dim a picture keeps less of itself, so fewer of its steps can be told apart: from 85 % only full
         colour or grey, and from 90 % (a scheme with no contrast to spare) colour hardly shows and blur has two steps */
      var pdim = bgR.custom ? bgR.dim || 0 : 0;
      setStops(root.querySelector('input[data-key="bgDesat"]'), pdim >= 0.85 ? [0, 1] : [0, 0.5, 1]);
      setStops(root.querySelector('input[data-key="bgBlur"]'), pdim >= 0.9 ? [0, 12] : [0, 3, 6, 12, 24]);
      root.querySelector('[data-slider="bgDesat"]').hidden = pdim >= 0.9;
      note('[data-dim-why]', bgR.custom && sl.length < 2 ? 'Dim stays at ' + Math.round(sl[0] * 100) + ' %: any less and this picture would hide the text.' +
        (pdim >= 0.9 ? ' So little of it shows that its colour hardly changes, so Less colour is not offered.' : '') : '');
      /* Glass's opacity: the least, its own (0.74 dark, 0.7 light) and solid. Glass light's terminal lies on glass of its
         own pale tone, so there it shows only over a wallpaper, and is offered only then (round 4, Q15 #4) */
      var opLight = R.look && R.look.mode === 'light', opDef = opLight ? 0.7 : 0.74, wall = !!document.documentElement.getAttribute('data-lg-wall');
      setStops(root.querySelector('input[data-key="opacity"]'), [0.4, opDef, 1]);
      opacityOff = opLight && !wall;
      /* sliders and outputs */
      [].forEach.call(root.querySelectorAll('input[type="range"][data-key]'), function (r) {
        var key = r.getAttribute('data-key'), x = val(key);
        if (key === 'lineHeight' && (x === null || x === undefined)) x = R.font.lineHeight;
        if (key === 'opacity' && (x === null || x === undefined)) x = R.theme ? R.theme.bgAlpha : 1;
        if (key === 'sixtyfourScan' || key === 'sixtyfourBleed') x = x === null || x === undefined ? 0 : x;
        /* a width or a dim left to the style or to Auto shows the value in use */
        if (key === 'bezelWidth' && (x === null || x === undefined)) x = R.bezel && R.bezel.width ? R.bezel.width : 24;
        var autoDim = key === 'bgDim' && (x === null || x === undefined);
        if (autoDim) x = R.background && typeof R.background.dim === 'number' ? R.background.dim : 0.45;
        if (document.activeElement !== r) rangeShow(r, x);
        var out = r.parentNode.querySelector('output'); if (out) out.textContent = (autoDim ? 'Auto · ' : '') + fmt(key, document.activeElement === r ? rangeValue(r) : x);
        r.closest('[data-slider]').classList.toggle('pmt-cz-is-mine', mine(key));
      });
      var fs = root.querySelector('[data-out="fontSize"]'); if (fs) fs.textContent = fmt('fontSize', R.font.size);
      [].forEach.call(root.querySelectorAll('[data-step]'), function (b) { setA(b, 'aria-disabled', String(nextSize(R, parseFloat(b.getAttribute('data-step')) < 0 ? -1 : 1) === null)); });
      setA(root.querySelector('[data-act="default"][data-key="fontSize"]'), 'aria-disabled', String(!mine('fontSize')));
      var col = root.querySelector('input[data-key="bgColor"]'), bgc = val('bgColor') || (R.theme ? A().solidDefault(R.theme) : '#000000');
      if (col && document.activeElement !== col) col.value = bgc;
      var bo = root.querySelector('[data-out="bgColor"]'); if (bo) bo.textContent = bgc;
      /* what shows when (SSYS-051's visibility rule, kept for the person's sake: a hidden part keeps its value) */
      var ground = val('background');
      paintGround(R);
      root.querySelector('[data-slider="opacity"]').hidden = look !== 'glass' || opacityOff;
      root.querySelector('[data-axes]').hidden = R.font.id !== 'sixtyfour';
      /* weights the face has */
      var FD = A().fontDef(R.font.id), wr = FD && FD.weights;
      [].forEach.call(root.querySelectorAll('[data-key="fontWeight"]'), function (b) { var n = Number(b.getAttribute('data-value')); b.hidden = !wr || n < wr[0] || n > wr[1] || !!wrep[n]; });
      var nw = wr ? Object.keys(wrep).length : 0;
      var why = root.querySelector('[data-weight-why]'), wtxt = wr ? (nw ? 'Only the weights ' + R.font.label + ' has on this computer.' : '') : R.font.label + ' comes in one weight.';
      if (why.textContent !== wtxt) why.textContent = wtxt;
      root.querySelector('[data-seg="fontWeight"]').hidden = !wr;
      /* thumbnails that follow the look and the scheme */
      var follow = A().scheme(A().LOOKS[look][R.look.mode === 'light' ? 'light' : 'dark']);
      var fa = root.querySelector('[data-follow-art]'); if (follow && fa.getAttribute('data-for') !== follow.id) { fa.innerHTML = schemeArt(follow); fa.setAttribute('data-for', follow.id); }
      var fm = root.querySelector('[data-follow-meta]'), sidRaw = val('scheme'), ftxt = follow ? follow.name : '';
      if (sidRaw === 'follow:light' || sidRaw === 'follow:dark') ftxt = 'Always ' + sidRaw.slice(7) + ' (from Settings)';
      if (fm.textContent !== ftxt) fm.textContent = ftxt;
      var ff = root.querySelector('[data-follow-face]'), lf = A().fontDef(A().LOOKS[look].font);
      if (ff && lf) ff.style.fontFamily = lf.stack;
      var pn = root.querySelector('[data-picture-name]'), pname = A().pictureName(val('bgImageData') || '') || '';
      if (pn.textContent !== pname) pn.textContent = pname;
      /* a face from this computer, named by Settings */
      var lfBox = root.querySelector('[data-local-face]');
      lfBox.hidden = !R.font.local;
      if (R.font.local) lfBox.textContent = R.font.label + (R.font.local.installed ? ' (from Settings, on this computer)' : ' (from Settings)');
      /* notes */
      note('[data-note-face]', R.font.local && !R.font.local.installed ? R.font.label + ' is not on this computer, so JetBrains Mono shows in its place.' :
        R.font.axes && R.font.axes.unavailable ? 'This browser cannot set Sixtyfour’s axes, so its default draws.' : '');
      if (val('schemePair')) pairNote = '';
      note('[data-note-colors]', pairNote);
      note('[data-note-trail]', R.look.reduced ? 'Reduced Motion is on, so the cursor has no trail and does not blink.' :
        isNier && !/(^|\s)sweep(\s|$)/.test(document.documentElement.getAttribute('data-o55-nier-parts') || '') ? 'NieR’s trace needs its Scan sweep part; with it removed the trail stays off.' : '');
      var pic = String(val('bgImageData') || '');
      note('[data-note-ground]', ground === 'image' && val('bgImage') === 'custom' && pic.indexOf('path:') === 0 ? 'Settings names ' + pic.slice(5) + ', which this page cannot open; choose the picture here to use it.' :
        look !== 'glass' && A().own(scope, v, 'opacity') !== undefined ? 'Opacity applies under a Glass look; this one draws the ground solid.' :
        opacityOff && A().own(scope, v, 'opacity') !== undefined ? 'Opacity shows over a wallpaper: without one, Glass light’s terminal lies on glass of its own pale tone.' : '');
      var eNotes = [], effective = v.fx ? v.fx.effective : {};
      if (R.look.reduced) eNotes.push('Reduced Motion is on: nothing moves; still effects stay.');
      else if (effective.motion && /^Battery saver/.test(effective.motion)) eNotes.push('Battery saver is on: nothing moves; still effects stay.');
      if (T.FX && T.FX.gpu && T.FX.gpu() === false) eNotes.push('This computer draws the terminal without the GPU: scanlines and glow are drawn flat, and curvature, burn-in and grain are not drawn.');
      note('[data-note-fx]', eNotes.join(' '));
      /* All terminals, shown on a terminal with choices of its own: those stay on top on it (the tab comes first) */
      var tabN = scope === 'app' ? Object.keys(A().FIELDS).filter(function (k) { return A().own('tab', v, k) !== undefined; }).length : 0;
      note('[data-note-side]', tabN ? 'This terminal keeps ' + (tabN === 1 ? 'one choice of its own, which stays' : tabN + ' choices of its own, which stay') + ' on top of All terminals on it. The preview shows All terminals.' : '');
      var ew = root.querySelector('[data-effects-why]'), etext = val('effects') === 'follow' ? 'The look’s own: ' + lookEffects(R) + '. Turning one on or off switches to Custom.' : val('effects') === 'off' ? 'No effects in this scope.' : '';
      if (ew.textContent !== etext) ew.textContent = etext;
      root.querySelector('[data-act="degauss"]').hidden = look !== 'retro' || isNier;
      /* the preview's caption, also its text alternative */
      var desc = (R.scheme ? R.scheme.name : '') + ', ' + R.font.label + ' ' + (Math.round(R.font.size * 100) / 100) + ' px, ' + (R.opts.cursor.shape) + ' cursor' + (fx.off || !(fx.scanlines.on || fx.glow.on || fx.crt) ? '' : ', ' + lookEffects(R));
      var pd = root.querySelector('[data-pv-desc]'); if (pd.textContent !== desc) pd.textContent = desc;
      root.querySelector('[data-pv-box]').setAttribute('aria-label', 'Preview: ' + desc);
      /* counts: the meter, each group, the footer, the quick sets */
      var mineKeys = COUNTED.filter(mine), n = mineKeys.length;
      [].forEach.call(root.querySelectorAll('.pmt-cz-cells > i'), function (c, i) { c.classList.toggle('pmt-cz-on', mine(COUNTED[i])); });
      var mn = root.querySelector('[data-meter-n]'), mt = n ? n + (n === 1 ? ' change' : ' changes') : 'The look’s own';
      if (mn.textContent !== mt) mn.textContent = mt;
      root.querySelector('[data-meter-scope]').textContent = scope === 'tab' ? 'This terminal' : 'All terminals';
      GROUPS.forEach(function (g) {
        var k = GROUP_KEYS[g[0]].filter(mine).length, t = k ? k + ' changed' : '';
        var c = root.querySelector('[data-count="' + g[0] + '"]'); if (c.textContent !== t) c.textContent = t;
        var nv = root.querySelector('[data-navn="' + g[0] + '"]'); if (nv.textContent !== (k ? String(k) : '')) nv.textContent = k ? String(k) : '';
        root.querySelector('[data-act="group-reset"][data-group="' + g[0] + '"]').hidden = !k;
      });
      var ft = root.querySelector('[data-foot-n]'), ftt = n ? n + (n === 1 ? ' change from the look in ' : ' changes from the look in ') + (scope === 'tab' ? 'this terminal' : 'all terminals') : 'Following the look';
      if (ft.textContent !== ftt) ft.textContent = ftt;
      var rb = root.querySelector('[data-act="reset"]'); rb.textContent = scope === 'tab' ? 'Reset this terminal' : 'Reset all terminals'; setA(rb, 'aria-disabled', String(!n));
      [].forEach.call(root.querySelectorAll('[data-set]'), function (b) { setA(b, 'aria-pressed', String(setPressed(b.getAttribute('data-set'), mineKeys))); });
      /* the scope's reason */
      var sw = root.querySelector('[data-scope-why]'), swt = scope === 'app' ? (A().settingsReady() ? 'Saved in this project’s Settings' : 'Saved on this computer') : 'Saved with this tab';
      if (sw.textContent !== swt) sw.textContent = swt;
      root.querySelector('.pmt-cz-framelabel').textContent = scope === 'tab' ? 'This terminal' : 'This terminal, like all terminals';
      paintPresets();
      roving();
      fit(root);
    }
    function lookEffects(R) {
      var fx = R.effects, l = [];
      if (fx.scanlines.on) l.push('scanlines'); if (fx.glow.on) l.push('glow'); if (fx.crt) l.push('full CRT'); if (fx.dim > 0) l.push('dimming');
      return l.length ? l.join(', ') : 'none';
    }
    function note(sel, text) { var e = root.querySelector(sel); e.hidden = !text; if (e.textContent !== text) e.textContent = text; }
    function setPressed(id, mineKeys) {
      var s = SETS.filter(function (x) { return x.id === id; })[0]; if (!s) return false;
      if (!s.patch) return mineKeys.length === 0;
      return Object.keys(s.patch).every(function (k) { return String(A().own(scope, v, k)) === String(s.patch[k]); });
    }

    /* ---- placement: beside the terminal when there is room, otherwise over the middle; the scrim leaves the terminal
       itself uncovered ---- */
    function place() {
      var de = document.documentElement, W = de.clientWidth || 1024, H = de.clientHeight || 768;
      var r = v.root.isConnected ? v.root.getBoundingClientRect() : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
      var hole = r.width > 0 && r.height > 0;
      var M = 12, want = Math.min(900, W - 2 * M), narrow = W < 720, left, width = want;
      if (narrow) { left = 8; width = W - 16; }
      else if (hole && W - r.right - M * 2 >= 540) { left = r.right + M; width = Math.min(want, W - r.right - M * 2); }
      else if (hole && r.left - M * 2 >= 540) { width = Math.min(want, r.left - M * 2); left = r.left - M - width; }
      else left = Math.round((W - width) / 2);
      dialog.style.left = left + 'px'; dialog.style.width = width + 'px';
      var top = narrow ? 8 : Math.max(M, Math.min(56, H * 0.06));
      /* the page's status strip stays clear (the concept's demo badge sits above every overlay there) */
      dialog.style.top = top + 'px'; dialog.style.maxHeight = (H - top - 30) + 'px';
      dialog.classList.toggle('pmt-cz-beside', !narrow && hole && (left >= r.right || left + width <= r.left));
      /* the scrim around the terminal's rectangle (none when it is not on screen) */
      var s = root.querySelectorAll('.pmt-cz-scrim > i'), x0 = hole ? Math.max(0, r.left) : 0, y0 = hole ? Math.max(0, r.top) : 0, x1 = hole ? Math.min(W, r.right) : 0, y1 = hole ? Math.min(H, r.bottom) : 0;
      var rects = hole ? [[0, 0, W, y0], [0, y1, W, H - y1], [0, y0, x0, y1 - y0], [x1, y0, W - x1, y1 - y0]] : [[0, 0, W, H], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      rects.forEach(function (q, i) { s[i].style.cssText = 'left:' + q[0] + 'px;top:' + q[1] + 'px;width:' + Math.max(0, q[2]) + 'px;height:' + Math.max(0, q[3]) + 'px'; });
      var fr = root.querySelector('.pmt-cz-frame'); fr.hidden = !hole;
      if (hole) fr.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;width:' + (x1 - x0) + 'px;height:' + (y1 - y0) + 'px';
      root.classList.toggle('pmt-cz-narrow', narrow);
      syncDock();
      fit(root);
    }

    /* ---- events ---- */
    function prevChosen(row) { return row ? row.querySelector('[aria-checked="true"]') : null; }
    function moveInk(key, before) { var row = root.querySelector('[data-seg="' + key + '"]'), now = prevChosen(row); if (inks[key] && before && now && before !== now && !reducedNow()) try { inks[key].move(before, now); } catch (e) {} }
    function choose(b) {
      var key = b.getAttribute('data-key'), raw = b.getAttribute('data-value');
      if (key === 'ground') { chooseGround(raw); return; }
      var before = prevChosen(b.closest('.pmw-ink-row'));
      if (key === 'scope') {
        if (raw === scope) return;
        scope = v._apScope = raw;
        A().endPreview(v); syncPreview(); paint(); moveInk('scope', before);
        T.Motion.play(body, 'pmt-rescope');
        return;
      }
      var value = /^-?[\d.]+$/.test(raw) && key !== 'scheme' && key !== 'font' ? Number(raw) : raw;
      if (key === 'scheme') { clearTimeout(intent); A().endPreview(v); previewing = null; v.recolorFrom.apply(v, centre(b)); }
      /* a scheme of the other appearance (a light one while the app is dark) is shown as picked: "Switch with light and
         dark" would show its sibling instead, so it turns off for this scope, and the screen says so */
      var pick = key === 'scheme' && value !== 'follow' ? A().scheme(value) : null, mode = eff().look.mode === 'light' ? 'light' : 'dark';
      pairNote = '';
      if (pick && val('schemePair') && pick.appearance !== mode && A().pairOf(pick, mode) !== pick) {
        write({ scheme: value, schemePair: false });
        pairNote = 'Switch with light and dark is now off, so ' + pick.name + ' stays while the app is ' + mode + '.';
        paint();
      } else put(key, key === 'bezelReflect' && value === reflect(eff()).own ? null : value);   /* the material's own level is its Auto */
      moveInk(key, before);
      if (key === 'scheme') v.announce('Scheme: ' + b.querySelector('.pmt-cz-tname').textContent);
      if ((key === 'cursorShape' || key === 'cursorTrail') && preview) preview.moveCursor();
    }
    function centre(b) { var r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
    function toggle(c) {
      var key = c.getAttribute('data-key'), next = c.getAttribute('aria-checked') !== 'true', patch = {};
      var fxKey = EFFECTS.some(function (e) { return e.key === key; });
      /* an effect turned on or off while the scope follows the look (or has effects off) switches it to Custom first,
         so choosing Follow look again undoes it */
      if (fxKey && val('effects') !== 'custom') patch.effects = 'custom';
      patch[key] = next;
      write(patch);
      if (key === 'inactiveDim' && next && preview) preview.dim();
      if (key === 'cursorBlink' && preview) preview.moveCursor();
    }
    root.addEventListener('click', function (e) {
      var t = e.target;
      /* the scrim, or the terminal through its cut-out: back to the terminal */
      if (t.closest('.pmt-cz-scrim, .pmt-cz-frame')) { close(); return; }
      var b = t.closest('button, [role="radio"], [role="switch"]'); if (!b || !root.contains(b)) return;
      if (b.getAttribute('aria-disabled') === 'true') return;
      if (b.getAttribute('role') === 'radio' && b.hasAttribute('data-key')) { choose(b); return; }
      if (b.getAttribute('role') === 'switch') { toggle(b); return; }
      if (b.hasAttribute('data-step')) { var ns = nextSize(eff(), parseFloat(b.getAttribute('data-step')) < 0 ? -1 : 1); if (ns !== null) put('fontSize', ns); return; }
      if (b.hasAttribute('data-set')) { quickSet(b.getAttribute('data-set')); return; }
      if (b.hasAttribute('data-gcat')) { gcat = b.getAttribute('data-gcat'); gSig = ''; paint(); return; }
      if (b.hasAttribute('data-solid-color')) { write({ background: 'solid', bgColor: b.getAttribute('data-solid-color') }); return; }
      if (b.getAttribute('data-key') === 'ground') { chooseGround(b.getAttribute('data-value')); return; }
      if (b.hasAttribute('data-preset')) {
        var pid = b.getAttribute('data-preset'), pp = A().presets.list().filter(function (x) { return x.id === pid; })[0];
        if (pp && A().presets.apply(pid, scope, v)) { syncPreview(); paint(); presetNote(''); v.announce(pp.name + (scope === 'tab' ? ' is on this terminal' : ' is on all terminals')); }
        return;
      }
      if (b.hasAttribute('data-jump')) { var g = root.querySelector('[data-group="' + b.getAttribute('data-jump') + '"]'); if (g) { g.scrollIntoView({ block: 'start', behavior: reducedNow() ? 'auto' : 'smooth' }); var h = g.querySelector('h3'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } } return; }
      var act = b.getAttribute('data-act');
      if (act === 'close') close();
      else if (act === 'reset') { A().reset(scope, v); syncPreview(); paint(); v.announce(scope === 'tab' ? 'This terminal follows the defaults again' : 'All terminals follow the look again'); }
      else if (act === 'group-reset') { var gp = {}; GROUP_KEYS[b.getAttribute('data-group')].forEach(function (k) { if (mine(k)) gp[k] = null; }); write(gp); }
      else if (act === 'default') { put(b.getAttribute('data-key'), null); }
      else if (act === 'degauss') { if (v.fx) v.fx.degauss(); if (pv && pv.fx) pv.fx.degauss(); }
      else if (act === 'try-cursor') { if (preview) preview.moveCursor(); }
      else if (act === 'try-bell') { if (preview) preview.ring(); }
      else if (act === 'try-dim') { if (preview) preview.dim(); }
      else if (act === 'preset-save') presetSaveOpen();
      else if (act === 'preset-cancel') presetSaveClose(true);
      else if (act === 'preset-rename') { renaming = b.getAttribute('data-pid'); presetSig = ''; paint(); }
      else if (act === 'preset-delete') {
        var did = b.getAttribute('data-pid'), all = A().presets.list(), at = -1;
        all.forEach(function (x, i) { if (x.id === did) at = i; });
        if (at >= 0 && A().presets.remove(did)) { undoPreset = { entry: all[at], at: at }; presetNote('Deleted “' + all[at].name + '”.', true); paint(); var u = root.querySelector('[data-act="preset-undo"]'); if (u) u.focus(); }
      }
      else if (act === 'preset-undo') {
        if (undoPreset) { A().presets.restore(undoPreset.entry, undoPreset.at); v.announce('Restored ' + undoPreset.entry.name); undoPreset = null; presetNote(''); paint(); }
      }
      else if (act === 'import') importScheme();
      else if (act === 'upload') uploadImage();
    });
    function quickSet(id) {
      var s = SETS.filter(function (x) { return x.id === id; })[0]; if (!s) return;
      if (!s.patch) { A().reset(scope, v); syncPreview(); paint(); return; }
      /* a set changes its own fields and leaves the rest of this scope's choices (the scheme you picked stays) */
      write(Object.assign({}, s.patch));
      if (s.patch.cursorTrail && preview) preview.moveCursor();
    }
    /* sliders: shown while they move, written when let go */
    root.addEventListener('input', function (e) {
      var t = e.target, key = t.getAttribute('data-key');
      if (t.classList.contains('pmt-cz-search')) { filter(t.value); return; }
      if (!key) return;
      if (t.type === 'range') {
        var x = rangeValue(t);
        A().live(scope, key, x, v); syncPreview();
        var out = t.parentNode.querySelector('output'); if (out) out.textContent = fmt(key, x);
        return;
      }
      if (t.type === 'color') { A().live(scope, key, t.value, v); syncPreview(); var o2 = root.querySelector('[data-out="bgColor"]'); if (o2) o2.textContent = t.value; }
    });
    root.addEventListener('change', function (e) {
      var t = e.target, key = t.getAttribute('data-key'); if (!key) return;
      if (t.type === 'range' || t.type === 'color') { A().commit(scope, key, v); syncPreview(); paint(); return; }
      if (t.type === 'checkbox') { put(key, t.checked); }
    });
    function filter(q) {
      var ql = String(q || '').trim().toLowerCase(), n = 0, fam = null, famHas = false;
      var items = root.querySelectorAll('.pmt-cz-schemes > *');
      [].forEach.call(items, function (x) {
        if (x.classList.contains('pmt-cz-fam')) { if (fam) fam.hidden = !famHas; fam = x; famHas = false; return; }
        var hit = !ql || (x.getAttribute('data-name') || '').indexOf(ql) >= 0;
        x.hidden = !hit; if (hit) { n++; famHas = true; }
      });
      if (fam) fam.hidden = !famHas;
      var fn = root.querySelector('[data-find-n]'); fn.textContent = ql ? (n ? n + (n === 1 ? ' scheme' : ' schemes') : 'No scheme matches') : '';
    }
    /* a scheme previews when the pointer rests on it (hover intent, 110 ms) or the arrow keys reach it; leaving the
       list or Escape puts the chosen one back (SPEC section 6) */
    var INTENT_MS = 110, intent = 0, previewing = null, pairNote = '';
    function previewSoon(tileEl, ms) {
      clearTimeout(intent);
      var id = tileEl.getAttribute('data-value'), isGround = tileEl.getAttribute('data-key') === 'ground', pid = (isGround ? 'ground:' : '') + id;
      if (previewing === pid) return;
      /* your picture is shown only once there is one */
      if (isGround && id === 'custom' && !String(val('bgImageData') || '').match(/^img:/)) return;
      intent = setTimeout(function () {
        if (!root.isConnected || v.pop !== root) return;
        previewing = pid; v.recolorFrom.apply(v, centre(tileEl));
        A().preview(v, isGround ? groundPatch(id) : { scheme: id }); syncPreview();
      }, ms);
    }
    function endPreview() { clearTimeout(intent); if (previewing === null) return; previewing = null; A().endPreview(v); syncPreview(); }
    var schemesEl = root.querySelector('.pmt-cz-schemes');
    schemesEl.addEventListener('mouseover', function (e) { var o = e.target.closest('.pmt-cz-scheme'); if (o) previewSoon(o, INTENT_MS); });
    schemesEl.addEventListener('mouseleave', function () { endPreview(); });
    /* backgrounds preview the same way: hover one and the terminal and the preview show it; leave and it goes back */
    [].forEach.call(root.querySelectorAll('[data-forlook], [data-gtiles]'), function (box) {
      box.addEventListener('mouseover', function (e) { var o = e.target.closest('[data-key="ground"]'); if (o) previewSoon(o, INTENT_MS); });
      box.addEventListener('mouseleave', function () { endPreview(); });
    });
    /* keyboard: Escape closes, Tab stays inside, arrows move within a group of tiles or a segment (choosing, as radios
       do; in the schemes they preview, and Enter or Space keeps one) */
    /* naming a preset: Enter keeps it, Escape leaves it (and not the screen) */
    root.querySelector('[data-psave]').addEventListener('submit', function (e) { e.preventDefault(); presetSave(); });
    /* leaving the name field keeps the name typed (Enter and Escape have already ended it by then) */
    root.addEventListener('focusout', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-rename')) setTimeout(function () { if (renaming) presetRenameEnd(true, false); }, 0);
    });
    root.addEventListener('keydown', function (e) {
      var tg = e.target;
      if (tg && tg.hasAttribute && tg.hasAttribute('data-rename')) {
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); presetRenameEnd(true); return; }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); presetRenameEnd(false); return; }
      }
      if (tg && tg.hasAttribute && tg.hasAttribute('data-pname') && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); presetSaveClose(true); return; }
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
        var group = r.closest('[role="radiogroup"]'), opts = [].filter.call(group.querySelectorAll('[role="radio"]'), function (x) { return !x.hidden; });
        var i = opts.indexOf(r), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
        if (group.classList.contains('pmt-cz-tiles') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          /* up and down move a row of tiles */
          var rr = r.getBoundingClientRect(), best = null, bd = Infinity;
          opts.forEach(function (o) { var q = o.getBoundingClientRect(); if ((d > 0 ? q.top > rr.top + 4 : q.bottom < rr.bottom - 4)) { var dd = Math.abs(q.top - rr.top) * 4 + Math.abs(q.left - rr.left); if (dd < bd) { bd = dd; best = o; } } });
          if (best) i = opts.indexOf(best) - d;
        }
        var n = opts[Math.max(0, Math.min(opts.length - 1, i + d))];
        e.preventDefault(); e.stopPropagation();
        if (!n || n === r) return;
        n.focus();
        if (n.classList.contains('pmt-cz-scheme')) previewSoon(n, e.repeat ? INTENT_MS : 0);
        else choose(n);
        return;
      }
      if (r && (e.key === 'Enter' || e.key === ' ') && r.classList.contains('pmt-cz-scheme')) { e.preventDefault(); choose(r); }
      e.stopPropagation();
    });
    /* a roving tab stop: each group of tiles is one Tab stop, on its chosen tile */
    function roving() {
      [].forEach.call(root.querySelectorAll('[role="radiogroup"]'), function (g) {
        var opts = g.querySelectorAll('[role="radio"]'), chosen = g.querySelector('[role="radio"][aria-checked="true"]:not([hidden])') || [].filter.call(opts, function (o) { return !o.hidden; })[0];
        [].forEach.call(opts, function (o) { o.tabIndex = o === chosen ? 0 : -1; });
      });
    }

    function importScheme() {
      var errEl = root.querySelector('[data-import-error]');
      errEl.hidden = true;
      A().importFile({ onDone: function (r) {
        if (!r.ok) { errEl.textContent = 'Could not import that scheme: ' + r.error; errEl.hidden = false; return; }
        /* the new scheme joins the list, then is chosen */
        schemesEl.innerHTML = schemeTiles(); filter(root.querySelector('.pmt-cz-search').value);
        put('scheme', r.id);
        v.announce('Imported ' + r.name);
        var t = schemesEl.querySelector('[data-value="' + CSS.escape(r.id) + '"]'); if (t) { t.focus({ preventScroll: false }); }
      } });
    }
    /* the picture is kept once, on this machine, under its own key and a content hash; the layers hold 'img:<hash>'
       and Settings the file's name. A data URL in a layer would push this tab's saved state over the host's 16 KB cap
       or fill the settings store. It is scaled down (never up) to just cover the 960 x 600 the background uses, as a
       JPEG; the four most recent pictures stay, and the ones All terminals and this terminal use */
    function storeImage(img) {
      var k = Math.min(1, Math.max(960 / img.naturalWidth, 600 / img.naturalHeight));
      var cv = el('canvas'); cv.width = Math.max(1, Math.round(img.naturalWidth * k)); cv.height = Math.max(1, Math.round(img.naturalHeight * k));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      var data = cv.toDataURL('image/jpeg', 0.85);
      var h1 = 0x811c9dc5, h2 = 0x01000193;
      for (var i = 0; i < data.length; i++) { var c = data.charCodeAt(i); h1 = Math.imul(h1 ^ c, 0x01000193); h2 = Math.imul(h2 ^ c, 0x5bd1e995); }
      var hash = (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16), KEY = 'pm.home.terminal:v1:bg';
      try {
        var used = [A().get(null, 'bgImageData'), v.tabAppearance && v.tabAppearance.bgImageData];
        var kept = JSON.parse(localStorage.getItem(KEY) || '[]').filter(function (x) { return x !== hash; });
        var drop = kept.length + 1 - 4;
        kept = kept.filter(function (x) {
          if (drop <= 0 || used.indexOf('img:' + x) >= 0) return true;
          drop--; localStorage.removeItem(KEY + ':' + x); return false;
        });
        kept.push(hash);
        localStorage.setItem(KEY, JSON.stringify(kept));
        localStorage.setItem(KEY + ':' + hash, data);
      } catch (e) { return null; }
      return 'img:' + hash;
    }
    function uploadImage() {
      var input = el('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp';
      input.addEventListener('change', function () {
        var f = input.files && input.files[0]; if (!f) return;
        if (f.size > 4 * 1024 * 1024) { v.announce('Choose a picture under 4 MB'); return; }
        var url = URL.createObjectURL(f), img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(url);
          var ref = storeImage(img);
          if (!ref) { v.announce('There is no room to keep that picture on this computer'); return; }
          A().rememberPicture(f.name, ref);
          write({ background: 'image', bgImage: 'custom', bgImageData: ref });
        };
        img.onerror = function () { URL.revokeObjectURL(url); v.announce('That picture could not be read'); };
        img.src = url;
      });
      input.click();
    }

    /* ---- show, close, park ----
       While the screen shows it follows the appearance, the window and the terminal; parked, it listens to nothing and
       catches up when it shows again */
    var offChange = null, ro = null;
    var onResize = function () { place(); if (pv) pv.layout(); };
    function attach() {
      if (!offChange) offChange = A().onChange(function () { if (v.pop === root) { if (pv && pv.tabAppearance !== (scope === 'tab' ? v.tabAppearance || {} : pv.tabAppearance)) syncPreview(); paint(); } });
      window.addEventListener('resize', onResize);
      if (!ro && typeof ResizeObserver === 'function') {
        ro = new ResizeObserver(function (list) {
          if (v.pop !== root) return;
          list.forEach(function (en) { if (en.target === v.root) place(); else if (pv) { pv.layout(); preview.select(); } });
        });
        ro.observe(v.root); if (pv) { ro.observe(root.querySelector('[data-pv-box]')); ro.observe(root.querySelector('[data-dock-box]')); }
      }
      if (io) io.observe(root.querySelector('.pmt-cz-preview'));
      v._czLook = onLook;
    }
    function detach() {
      if (offChange) { offChange(); offChange = null; }
      window.removeEventListener('resize', onResize);
      if (ro) { ro.disconnect(); ro = null; }
      if (io) io.disconnect();
      if (v._czLook === onLook) v._czLook = null;
    }
    /* parked, it keeps up in idle time: a look, a setting or a window size that changes while it waits is drawn and
       measured then, not by the next click. Not while the change is still playing: drawing it reads the look's colours
       and measures the screen, which made the browser style and lay out the page in the gaps of the NieR switch (B5,
       pm7-motion-settings: 125 ms and 105 ms on Nas1, 131-253 ms over the P1000's cover). So it waits until nothing has
       changed for WARM_SETTLE_MS and no page, Usage or onboarding transition runs, and then for the page to be really
       idle: an idle period of WARM_IDLE_MS or more, which the browser gives only when nothing is drawing frames (a switch
       still playing leaves only slivers between its frames). WARM_LATEST_MS is the backstop for a page whose own motion
       never rests (no cover or switch is up by then). A click before that draws what changed itself */
    var WARM_SETTLE_MS = 3000, WARM_IDLE_MS = 45, WARM_LATEST_MS = 10000, warmJob = 0, warmWait = 0, warmSince = 0, offWarm = null;
    function settling() { return pageSettling(); }
    function warm(deadline) {
      warmJob = 0;
      if (!closed || disposed) return;
      if (settling()) { warmSoon(); return; }
      if (deadline && typeof deadline.timeRemaining === 'function' && !deadline.didTimeout && deadline.timeRemaining() < WARM_IDLE_MS && T.util.now() - warmSince < WARM_LATEST_MS) {
        warmJob = requestIdleCallback(warm, { timeout: Math.max(1000, WARM_LATEST_MS - (T.util.now() - warmSince)) });
        return;
      }
      place(); syncPreview(); paint();
      /* the preview draws what changed now, unseen, so the click has nothing left to draw */
      if (pv && pv.fullPending) pv.frame();
    }
    function warmCancel() {
      clearTimeout(warmWait); warmWait = 0;
      if (warmJob) { if (window.cancelIdleCallback) cancelIdleCallback(warmJob); clearTimeout(warmJob); warmJob = 0; }
    }
    function warmSoon() {
      if (!closed || disposed) return;
      warmCancel();
      warmWait = setTimeout(function () {
        warmWait = 0;
        if (!closed || disposed) return;
        if (settling()) { warmSoon(); return; }
        warmSince = T.util.now();
        warmJob = window.requestIdleCallback ? requestIdleCallback(warm, { timeout: WARM_LATEST_MS }) : setTimeout(warm, 300);
      }, WARM_SETTLE_MS);
    }
    function parkedWatch(on) {
      if (!on) warmCancel();
      if (offWarm) { offWarm(); offWarm = null; }
      window.removeEventListener('resize', warmSoon);
      if (v._czLook === warmSoon) v._czLook = null;
      if (!on) return;
      offWarm = A().onChange(warmSoon);
      window.addEventListener('resize', warmSoon);
      v._czLook = warmSoon;
    }
    function close(noFocus) {
      if (v.pop !== root) return;
      v.closeAppearance(noFocus);
    }
    /* v.closeAppearance has let go of it: its exit plays, then it parks */
    root._pmtClose = function (noFocus) {
      if (closed) return;
      closed = true;
      var closing = ++visit;
      endPreview(); detach();
      if (renaming) presetRenameEnd(false, false);
      if (preview) { preview.stopDemo(); if (pv) pv.onHide(); }
      root.setAttribute('aria-hidden', 'true');
      function park() { if (closing === visit && !disposed) { root.classList.add('pmt-cz-parked'); parkedWatch(true); } }
      if (noFocus) park(); else T.Motion.leave(root, park);
    };
    function dispose() {
      if (disposed) return;
      disposed = true;
      if (v.pop === root) v.closeAppearance(true);
      parkedWatch(false); detach();
      if (preview) preview.dispose();
      root.remove();
      if (prepared === handle) { prepared = null; setTimeout(prepareSoon, 1500); }
    }
    /* the preview follows you down the screen only where the real terminal is not beside it (the one rule of both
       Customize screens, 2026-10-14): when less than 40 % of its own place shows and the screen is not placed beside
       the terminal (a narrow window, or no room on either side), the same live view moves into the dock under the
       group index, and back when its place returns. Beside the terminal, the terminal itself is the live preview */
    var dock = root.querySelector('[data-dock]'), dockBox = root.querySelector('[data-dock-box]'), homeBox = root.querySelector('[data-pv-box]'), io = null, wantDock = false;
    function syncDock() { if (dock) dockTo(wantDock && !dialog.classList.contains('pmt-cz-beside')); }
    function dockTo(on) {
      if (!pv || !!on === !dock.hidden) return;
      (on ? dockBox : homeBox).appendChild(pv.root);
      dock.hidden = !on; root.classList.toggle('pmt-cz-docked', !!on);
      if (on) T.Motion.play(dock);
      pv.layout(true); preview.select();
    }
    if (pv && typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(function (list) { if (v.pop !== root) return; var en = list[list.length - 1]; wantDock = en.intersectionRatio < 0.4; syncDock(); }, { root: body, threshold: [0, 0.4, 1] });
    }
    /* the host's look or mode changed while the screen is open (View.onLook): the preview resolves again, so a scheme
       that switches with light and dark switches in the preview too (Q15 #7) */
    var onLook = function () { if (v.pop === root) { syncPreview(); paint(); } };
    var handle = { el: root, v: v, show: show, dispose: dispose, retarget: retarget, close: function () { close(); }, refresh: function () { if (v.pop === root) { syncPreview(); paint(); } } };
    /* it goes with the terminal that has it */
    function own(owner) { owner.disposers.push(function () { if (prepared === handle && handle.v === owner) dispose(); }); }
    /* moved, parked, to another terminal: every part of the screen reads the terminal through v */
    function retarget(nv) {
      if (nv === v) return;
      parkedWatch(false);
      v = handle.v = nv;
      own(nv);
      var k = root.querySelector('.pmt-cz-kicker span'); if (k) k.textContent = 'Customize · ' + termLabel(nv);
      if (preview) preview.retarget(nv);
      parkedWatch(true);
    }
    /* the visit: this terminal's scope (or All terminals from Settings), from the top, with an empty search; what changed
       while it was parked is drawn now, and what was measured before (the place, the fit, the tiles) is kept when
       nothing about it changed, so the click costs little more than the entrance */
    function show(next) {
      opts = next || {};
      if (v.pop && v.pop !== root) v.closeAppearance(true);
      v.pop = root;
      v._apOnClose = typeof opts.onClose === 'function' ? opts.onClose : null;
      scope = opts.scope === 'app' ? 'app' : v._apScope || 'tab';
      closed = false;
      parkedWatch(false);
      var showing = ++visit;
      gcat = null; wantDock = false; dockTo(false); body.scrollTop = 0;
      var q = root.querySelector('.pmt-cz-search'); if (q) q.value = '';
      presetSaveClose(false);
      attach();
      /* the preview's canvas still holds what it drew: only rows that changed are drawn again (the renderer redraws in
         full by itself when its frame or images changed) */
      if (pv) { var pend = pv.fullPending; pv.onShow(); if (!pend) pv.fullPending = false; }
      place();
      syncPreview(); paint(); filter('');
      if (preview) preview.select();
      /* the click is answered by the frame it paints (the menu goes, a press shows), and the screen comes in on the next
         one, already drawn and measured: revealed in the click, the browser would style and lay it out there, under the
         menu's focus return (P2-02). The focus starts on the scope switch, the first thing to decide (the dialog's name
         and lead are its context), once the screen has painted */
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (closed || showing !== visit) return;
        root.removeAttribute('aria-hidden');
        root.classList.remove('pmt-cz-parked');
        T.Motion.play(root);
        setTimeout(function () {
          if (closed || showing !== visit) return;
          (root.querySelector('[data-seg="scope"] [aria-checked="true"]') || dialog).focus({ preventScroll: true });
        }, 0);
      }); });
      return handle;
    }
    root._pmtPreview = preview; /* the preview, for checks that read what it draws */
    /* built parked: laid out, fitted and drawn once here, and the preview drawn once, then still until the screen shows */
    place();
    if (pv) { pv.layout(true); preview.select(); }
    syncPreview();
    paint();
    filter('');
    if (pv) pv.onHide();
    parkedWatch(true);
    own(v);
    prepared = handle;
    return opts.prepare ? handle : show(opts);
  }

  /* one screen ready while the app is idle, for the terminal in view (the one you are in, else the first on the page);
     never underneath onboarding or while a page or Usage transition plays, and not again while one is kept. Opened on
     another terminal, the kept screen moves there (open) */
  /* the page is in a moment the kept screen must not draw or measure during: the shared signal when the page has one
     (window.PM_BUSY, the coordinator's ask of the shell, 2026-10-16), and until then the moments themselves: a page or
     Usage transition, onboarding, the NieR Mode reboot's cover and its Reduce Animations cover (kit.d/19-nier-parts.js
     #o55np-reboot, #o55np-calm), a NieR switch asked for but not painted yet, or the tour's boot cover */
  function pageSettling() {
    var de = document.documentElement, N = window.PM_NIER;
    if (typeof window.PM_BUSY === 'function') { try { if (window.PM_BUSY()) return true; } catch (e) {} }
    if (de.hasAttribute('data-pm-page-transition') || de.hasAttribute('data-pmu-moment') || de.hasAttribute('data-o55-open')) return true;
    if (document.getElementById('o55np-reboot') || document.getElementById('o55np-calm') || document.querySelector('.o55t-bootcover')) return true;
    try { if (N && typeof N.wanted === 'function' && N.ready && N.ready() && !!N.wanted() !== !!N.on()) return true; } catch (e) {}
    return false;
  }
  function prepareSoon() {
    if (prepared) return;
    var de = document.documentElement, P = window.PMT;
    var busy = pageSettling();
    var v = !busy && P && typeof P.sessions === 'function' ? P.sessions().map(function (s) { return P.view(s.id); })
      .filter(function (x) { return x && x.root && x.root.isConnected && x.visible && !x.pop; })
      .sort(function (a, b) { return (b.focused ? 1 : 0) - (a.focused ? 1 : 0) || (a.root.compareDocumentPosition(b.root) & 4 ? -1 : 1); })[0] : null;
    if (!v) { setTimeout(prepareSoon, 1500); return; }
    /* built in a really idle moment where it can (an idle period of 45 ms or more: nothing is drawing frames), never under
       a cover or a switch; after 4 s it takes the next idle moment, since a page with motion of its own never fully rests
       and a screen built late only makes the first click pay for it */
    var since = T.util.now();
    var build = function (deadline) {
      if (prepared || v.pop || !v.root.isConnected) { if (!prepared) setTimeout(prepareSoon, 1500); return; }
      if (pageSettling()) { setTimeout(prepareSoon, 1500); return; }
      if (deadline && typeof deadline.timeRemaining === 'function' && !deadline.didTimeout && deadline.timeRemaining() < 45 && T.util.now() - since < 4000) {
        requestIdleCallback(build, { timeout: Math.max(500, 4000 - (T.util.now() - since)) }); return;
      }
      try { open(v, { prepare: true }); } catch (e) { console.error('[pmt] the Customize screen could not be prepared', e); }
    };
    if (window.requestIdleCallback) requestIdleCallback(build, { timeout: 4000 }); else setTimeout(build, 500);
  }
  if (document.readyState === 'complete') setTimeout(prepareSoon, 1500);
  else window.addEventListener('load', function () { setTimeout(prepareSoon, 1500); }, { once: true });

  T.Customize = { open: open, transcript: transcript };
})();
