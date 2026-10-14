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
    return cmd(0, 'cargo test') +
      '    ' + ESC + '[1;32mFinished' + ESC + '[0m test in 2.31s\r\n' +
      'test media::thumbs ... ' + ESC + '[32mok' + ESC + '[0m\r\n' +
      'test search::rank ... ' + ESC + '[1;31mFAILED' + ESC + '[0m\r\n' +
      ESC + '[33mwarning' + ESC + '[0m: ' + ESC + '[3m2 ignored' + ESC + '[0m, see ' + ESC + '[4;36mtastebook.dev/t' + ESC + '[0m\r\n' +
      mark('D', 101) + cmd(101, 'ls') +
      'Cargo.toml  ' + ESC + '[1;34msrc/' + ESC + '[0m  ' + ESC + '[1;32mrun.sh*' + ESC + '[0m  ' + ESC + '[35mlogo.png' + ESC + '[0m  ' + ESC + '[1;31mdist.tgz' + ESC + '[0m\r\n' +
      blocks + ESC + '[0m\r\n' +
      mark('D', 0) + mark('A') + prompt(0) + mark('B');
  }
  function Preview(box, v) {
    var cwd = v.session && v.session.shell ? v.session.shell.cwd : v.session && v.session.cwd;
    this.session = new T.Session({ profile: 'zsh', cwd: cwd, by: 'user', cols: 64, rows: 12 });
    var api = { look: v.api && v.api.look ? function () { return v.api.look(); } : undefined };
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
  /* the cursor jumps twice and comes home: the trail, the shape and the blink show */
  Preview.prototype.moveCursor = function () {
    var pv = this.view, term = this.session.term, self = this;
    pv.lastInput = T.util.now(); if (pv._wakeCursor) pv._wakeCursor();
    term.write('\x1b7');
    this.later(140, function () { term.write('\x1b[3;22H'); pv.lastInput = T.util.now(); });
    this.later(560, function () { term.write('\x1b[7;38H'); pv.lastInput = T.util.now(); });
    this.later(980, function () { term.write('\x1b8'); pv.lastInput = T.util.now(); self.view.schedule(true); });
  };
  Preview.prototype.ring = function () { this.view._lastBell = 0; this.session.term.write('\x07'); };
  /* how a terminal you are not in looks, held a moment */
  Preview.prototype.dim = function () {
    var pv = this.view; pv.setDimmed(true);
    this.later(1600, function () { pv.setDimmed(false); });
  };
  Preview.prototype.dispose = function () {
    this.timers.forEach(clearTimeout);
    if (T.Appearance) T.Appearance.forget(this.view);
    this.view.dispose();
  };

  /* ---------------- what the screen offers ---------------- */
  var CURSORS = [['follow', 'Follow look'], ['block', 'Block'], ['bar', 'Bar'], ['underline', 'Underline']];
  var TRAILS = [['follow', 'Follow look', ''], ['off', 'Off', 'None'], ['soft', 'Soft', 'A short fade'], ['glow', 'Glow', 'A bright streak'],
    ['phosphor', 'Phosphor', 'An afterglow'], ['trace', 'Trace', 'A thin ink line']];
  var GROUNDS = [['follow', 'Follow look'], ['theme', 'Theme surface'], ['solid', 'Solid colour'], ['gradient', 'Gradient'], ['image', 'Picture']];
  var PICTURES = [['hills', 'Hills'], ['grid', 'Grid'], ['paper', 'Paper'], ['custom', 'Your picture']];
  var FACE_TAGS = { 'jetbrains-mono': 'Code face', 'atkinson': 'Easy reading', 'vt323': 'Retro', 'departure': 'Retro', 'sixtyfour': 'Retro, scan axes',
    'sixtyfour-raster': 'Retro, baked scan', 'system': 'This computer’s' };
  /* the effect chips: what each draws, in plain words */
  var EFFECTS = [
    { key: 'scanlines', name: 'Scanlines', help: 'Thin dark lines across the text, like an old monitor.', strength: ['scanStrength', 0, 0.6, 0.05] },
    { key: 'glow', name: 'Phosphor glow', help: 'A soft glow around the text in the scheme’s glow colour.', strength: ['glowStrength', 0, 1, 0.05] },
    { key: 'crt', name: 'Full CRT', help: 'Curved glass, burn-in and grain. Pointing follows the curve.' },
    { key: 'flicker', name: 'Flicker', help: 'A faint flicker, at most 3 % and never a flash.', strength: ['flickerAmount', 0, 0.03, 0.005] },
    { key: 'inactiveDim', name: 'Dim terminals I’m not in', help: 'Terminals you are not typing in step back.', tryIt: 'dim' },
    { key: 'smoothScroll', name: 'Smooth scrolling', help: 'Scrolling glides instead of jumping a line at a time.' }
  ];
  /* quick sets: several existing fields at once, in this scope (NieR's presets, for a terminal) */
  var SETS = [
    { id: 'look', label: 'The look’s own', help: 'Everything follows the look', patch: null },
    { id: 'calm', label: 'Calm', help: 'Nothing moves', patch: { effects: 'custom', cursorBlink: false, cursorTrail: 'off', smoothScroll: false, flicker: false, crt: false } },
    { id: 'reading', label: 'Easy reading', help: 'Clear face, high contrast', patch: { font: 'atkinson', minContrast: 7, lineHeight: 1.45, ligatures: false } },
    { id: 'crt', label: 'Old monitor', help: 'Scanlines, glow, curve', patch: { effects: 'custom', scanlines: true, glow: true, crt: true, cursorTrail: 'phosphor' } }
  ];
  /* the fields the meter counts, in the order the screen shows them */
  var COUNTED = ['scheme', 'schemePair', 'minContrast', 'font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'ligatures', 'boldBright',
    'fontRendering', 'sixtyfourScan', 'sixtyfourBleed', 'cursorShape', 'cursorBlink', 'cursorTrail', 'background', 'bgColor', 'bgGradient', 'bgImage',
    'bgImageData', 'bgDim', 'bgBlur', 'opacity', 'padding', 'effects', 'scanlines', 'scanStrength', 'glow', 'glowStrength', 'crt', 'curvature', 'burnIn',
    'noise', 'flicker', 'flickerAmount', 'inactiveDim', 'smoothScroll', 'bell', 'stickyHeader', 'copyOnSelect'];
  var GROUP_KEYS = {
    colors: ['scheme', 'schemePair', 'minContrast'],
    text: ['font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'ligatures', 'boldBright', 'fontRendering', 'sixtyfourScan', 'sixtyfourBleed'],
    cursor: ['cursorShape', 'cursorBlink', 'cursorTrail'],
    ground: ['background', 'bgColor', 'bgGradient', 'bgImage', 'bgImageData', 'bgDim', 'bgBlur', 'opacity', 'padding'],
    effects: ['effects', 'scanlines', 'scanStrength', 'glow', 'glowStrength', 'crt', 'curvature', 'burnIn', 'noise', 'flicker', 'flickerAmount', 'inactiveDim', 'smoothScroll'],
    behavior: ['bell', 'stickyHeader', 'copyOnSelect']
  };
  var GROUPS = [['colors', 'Colors'], ['text', 'Text'], ['cursor', 'Cursor'], ['ground', 'Background'], ['effects', 'Effects'], ['behavior', 'Behavior']];

  /* ---------------- markup ---------------- */
  function ghead(id, title, lead) {
    return '<header class="pmt-cz-ghead"><h3 id="pmt-cz-g-' + id + '">' + esc(title) + '</h3><span class="pmt-cz-gcount" data-count="' + id + '"></span>' +
      '<button type="button" class="pmt-textbtn pmt-cz-greset" data-act="group-reset" data-group="' + id + '" hidden' + NOTAG + '>Reset ' + esc(title.toLowerCase()) + '</button></header>' +
      (lead ? '<p class="pmt-cz-glead">' + esc(lead) + '</p>' : '');
  }
  /* a one-of-several row in the panels' chosen-fill grammar (45-frames.css), its ink moving between the choices */
  function seg(key, opts, label) {
    return '<div class="pmt-cz-seg pmw-ink-row" role="radiogroup" aria-label="' + esc(label) + '" data-seg="' + key + '">' + opts.map(function (o) {
      return '<button type="button" class="pmt-cz-segopt pmw-ink-opt" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(o[0]) + '"' + NOTAG + '>' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function chip(key, name, help, extra) {
    return '<div class="pmt-cz-chipbox" data-chip="' + key + '"><button type="button" class="pmt-cz-chip" role="switch" aria-checked="false" data-key="' + key + '" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-pins" aria-hidden="true"><i></i><i></i><i></i></span><span class="pmt-cz-chipcopy"><span class="pmt-cz-chipname">' + esc(name) + '</span>' +
      '<span class="pmt-cz-chiphelp">' + esc(help) + '</span><span class="pmt-cz-chipfoot"><span class="pmt-cz-chipstate">Off</span><span class="pmt-cz-mine">Changed</span></span></span>' +
      '<span class="pmt-cz-art pmt-cz-art-' + key + '" aria-hidden="true"></span></button>' + (extra || '') + '</div>';
  }
  function slider(key, label, min, max, step, unit) {
    return '<label class="pmt-cz-slider" data-slider="' + key + '"><span class="pmt-cz-slabel">' + esc(label) + '</span>' +
      '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" data-unit="' + (unit || '') + '"' + tagged(label) + NOTAG + '>' +
      '<output class="pmt-cz-out"></output></label>';
  }
  function tile(key, value, label, art, meta) {
    return '<button type="button" class="pmt-cz-tile" role="radio" aria-checked="false" data-key="' + key + '" data-value="' + esc(value) + '" data-pmh="tile"' + NOTAG + '>' +
      '<span class="pmt-cz-thumb">' + (art || '') + '</span><span class="pmt-cz-tname">' + esc(label) + '</span>' + (meta ? '<span class="pmt-cz-tmeta">' + esc(meta) + '</span>' : '') + '</button>';
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
      '<span class="pmt-cz-thumb" data-follow-art></span><span class="pmt-cz-tname">Follow look</span><span class="pmt-cz-tmeta" data-follow-meta></span></button>');
    list.forEach(function (s) {
      if (s.family !== fam) { fam = s.family; out.push('<span class="pmt-cz-fam" role="presentation">' + esc(fam === 'Puppet Master' ? 'Puppet Master originals' : fam) + '</span>'); }
      out.push('<button type="button" class="pmt-cz-tile pmt-cz-scheme" role="radio" aria-checked="false" data-key="scheme" data-value="' + esc(s.id) + '" data-name="' + esc((s.name + ' ' + s.family).toLowerCase()) + '" data-pmh="tile"' + NOTAG + '>' +
        '<span class="pmt-cz-thumb">' + schemeArt(s) + '</span><span class="pmt-cz-tname">' + esc(s.name) + '</span><span class="pmt-cz-tmeta">' + (s.appearance === 'light' ? 'Light' : 'Dark') + '</span></button>');
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

  function skeleton(v) {
    var label = 'Terminal';
    try { label = JSON.parse(v._lsig || '{}').label || label; } catch (e) {}
    var F = A().FIELDS;
    var html = '';
    html += '<div class="pmt-cz-scrim" data-act="scrim" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="pmt-cz-frame" aria-hidden="true"><span class="pmt-cz-framelabel">This terminal</span></div>';
    /* data-lg-surface="menu": the Liquid Glass layer's opt-in for a floating sheet (its CONTRACT.md); inert without it */
    html += '<section class="pmt-cz-dialog" role="dialog" aria-modal="true" aria-labelledby="pmt-cz-title" aria-describedby="pmt-cz-lead" tabindex="-1" data-lg-surface="menu">';
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
      '<div class="pmt-cz-cells" aria-hidden="true">' + COUNTED.map(function () { return '<i></i>'; }).join('') + '</div></div>' +
      '<div class="pmt-cz-sets" role="group" aria-label="Quick sets">' + SETS.map(function (s) {
        return '<button type="button" class="pmt-cz-set" aria-pressed="false" data-set="' + s.id + '" data-pmh="tile"' + NOTAG + '><span>' + esc(s.label) + '</span><small>' + esc(s.help) + '</small></button>';
      }).join('') + '</div>' +
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
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Size</span><span class="pmt-stepper pmt-cz-stepper"><button type="button" class="pmt-step" data-step="-0.5" aria-label="Smaller"' + tagged('Smaller', 'Text size half a pixel smaller') + '>−</button>' +
      '<output class="pmt-cz-out" data-out="fontSize"></output><button type="button" class="pmt-step" data-step="0.5" aria-label="Bigger"' + tagged('Bigger', 'Text size half a pixel bigger') + '>+</button></span>' +
      '<button type="button" class="pmt-textbtn pmt-cz-default" data-act="default" data-key="fontSize"' + NOTAG + '>Face default</button></div>' +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Weight</span>' + seg('fontWeight', [[200, 'Extra light'], [300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'Semibold'], [700, 'Bold'], [800, 'Heavy']], 'Weight') +
      '<span class="pmt-cz-fhelp" data-weight-why></span></div>' +
      slider('lineHeight', 'Line height', F.lineHeight.min, F.lineHeight.max, F.lineHeight.step, '×') +
      slider('letterSpacing', 'Letter spacing', F.letterSpacing.min, F.letterSpacing.max, F.letterSpacing.step, ' px') +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Text drawing</span>' + seg('fontRendering', [['auto', 'Auto'], ['crisp', 'Crisp'], ['smooth', 'Smooth']], 'Text drawing') +
      '<span class="pmt-cz-fhelp">Crisp keeps glyphs on whole pixels; try it if text looks blurry.</span></div>' +
      '</div><div class="pmt-cz-chips">' + chip('ligatures', 'Ligatures', 'Joins pairs such as -> and != into one glyph where the face has them.') +
      chip('boldBright', 'Bold as bright', 'Bold text in the bright version of its colour, as older terminals did.') + '</div>' +
      '<div class="pmt-cz-axes" data-axes hidden><p class="pmt-cz-glead">Sixtyfour’s own axes: scanlines and bleed drawn by the face itself, with no motion.</p><div class="pmt-cz-grid2">' +
      slider('sixtyfourScan', 'Scanlines', -53, 100, 1, '') + slider('sixtyfourBleed', 'Bleed', 0, 100, 1, '') + '</div></div></section>';
    /* cursor */
    html += '<section class="pmt-cz-group" data-group="cursor" aria-labelledby="pmt-cz-g-cursor">' + ghead('cursor', 'Cursor') +
      '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Cursor shape">' + CURSORS.map(function (c) { return tile('cursorShape', c[0], c[1], cursorArt(c[0] === 'follow' ? 'look' : c[0]), ''); }).join('') + '</div>' +
      '<div class="pmt-cz-chips">' + chip('cursorBlink', 'Blink', 'The cursor blinks while you type and rests after 15 seconds.') + '</div>' +
      '<h4 class="pmt-cz-sub">Trail when the cursor jumps</h4>' +
      '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Cursor trail">' + TRAILS.map(function (t) { return tile('cursorTrail', t[0], t[1], trailArt(t[0] === 'follow' ? 'look' : t[0]), t[2]); }).join('') + '</div>' +
      '<p class="pmt-cz-note" data-note-trail hidden></p></section>';
    /* background */
    html += '<section class="pmt-cz-group" data-group="ground" aria-labelledby="pmt-cz-g-ground">' + ghead('ground', 'Background') +
      '<div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Background">' + GROUNDS.map(function (g) { return tile('background', g[0], g[1], '<span class="pmt-cz-gnd" data-ground-art="' + g[0] + '"></span>', ''); }).join('') + '</div>' +
      '<div class="pmt-cz-sub-solid" data-when="solid" hidden><div class="pmt-cz-field"><span class="pmt-cz-flabel">Colour</span><input type="color" class="pmt-cz-color" data-key="bgColor" aria-label="Background colour"' + NOTAG + '><output class="pmt-cz-out" data-out="bgColor"></output></div></div>' +
      '<div data-when="gradient" hidden><div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Gradient">' +
      Object.keys(A().GRADIENTS).map(function (g) { return tile('bgGradient', g, g.charAt(0).toUpperCase() + g.slice(1), '<span class="pmt-cz-gnd" style="background:' + esc(A().GRADIENTS[g]) + '"></span>', ''); }).join('') + '</div></div>' +
      '<div data-when="image" hidden><div class="pmt-cz-tiles pmt-cz-small" role="radiogroup" aria-label="Picture">' +
      PICTURES.map(function (p) { return tile('bgImage', p[0], p[1], '<span class="pmt-cz-gnd" data-picture-art="' + p[0] + '"></span>', ''); }).join('') + '</div>' +
      '<div class="pmt-cz-import"><button type="button" class="pmt-textbtn" data-act="upload"' + tagged('Choose a picture', 'PNG, JPEG or WebP from this computer, under 4 MB') + '>Choose a picture…</button><span class="pmt-cz-fhelp" data-picture-name></span></div>' +
      '<div class="pmt-cz-grid2">' + slider('bgDim', 'Dimming', 0, 0.9, 0.05, '%') + slider('bgBlur', 'Blur', 0, 24, 1, ' px') + '</div></div>' +
      '<div class="pmt-cz-grid2">' + slider('opacity', 'Opacity (Glass)', 0.4, 1, 0.02, '%') + slider('padding', 'Padding', 0, 24, 1, ' px') + '</div>' +
      '<p class="pmt-cz-note" data-note-ground hidden></p></section>';
    /* effects */
    html += '<section class="pmt-cz-group" data-group="effects" aria-labelledby="pmt-cz-g-effects">' + ghead('effects', 'Effects', 'Effects run only in the terminal you are in and stop when it is idle.') +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Effects</span>' + seg('effects', [['follow', 'Follow look'], ['off', 'Off'], ['custom', 'Custom']], 'Effects') +
      '<span class="pmt-cz-fhelp" data-effects-why></span></div>' +
      '<div class="pmt-cz-chips pmt-cz-fxchips">' + EFFECTS.map(function (e) {
        var extra = '';
        if (e.strength) extra = '<div class="pmt-cz-chipmore" data-more="' + e.key + '">' + slider(e.strength[0], 'Strength', e.strength[1], e.strength[2], e.strength[3], e.key === 'flicker' ? '' : '%') + '</div>';
        if (e.key === 'crt') extra = '<div class="pmt-cz-chipmore" data-more="crt">' + slider('curvature', 'Curvature', 0, 0.2, 0.01, '') +
          '<label class="pmt-cz-mini"><input type="checkbox" data-key="burnIn"' + NOTAG + '><span>Burn-in</span></label>' + slider('noise', 'Grain', 0, 0.12, 0.005, '') + '</div>';
        return chip(e.key, e.name, e.help, extra);
      }).join('') + '</div><p class="pmt-cz-note" data-note-fx hidden></p></section>';
    /* behaviour */
    html += '<section class="pmt-cz-group" data-group="behavior" aria-labelledby="pmt-cz-g-behavior">' + ghead('behavior', 'Behavior') +
      '<div class="pmt-cz-field"><span class="pmt-cz-flabel">Bell</span>' + seg('bell', [['follow', 'Follow look'], ['visual', 'Visual'], ['off', 'Off']], 'Bell') +
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

  /* ---------------- the screen ---------------- */
  function open(v, opts) {
    opts = opts || {};
    if (v.pop) v.closeAppearance(true);
    var overlay = document.getElementById('pmw-overlay') || document.body;
    var root = el('div', 'pmt-cz pmt-calm');
    root.setAttribute('data-pmw-overlay', 'terminal-appearance');
    root.innerHTML = skeleton(v);
    overlay.appendChild(root);
    v.pop = root;
    v._apOnClose = typeof opts.onClose === 'function' ? opts.onClose : null;
    var dialog = root.querySelector('.pmt-cz-dialog'), body = root.querySelector('.pmt-cz-body');
    var scope = v._apScope || 'tab';
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
    function syncPreview() {
      if (!pv) return;
      pv.tabAppearance = scope === 'tab' ? v.tabAppearance || {} : {};
      pv.previewAppearance = v.previewAppearance || null;
      pv.applyAppearance(A().resolve(pv));
    }
    function write(patch) {
      A().setMany(scope, patch, v);
      syncPreview();
      paint();
    }
    function put(key, value) { var p = {}; p[key] = value; write(p); }

    /* ---- painting: every control shows this scope's value ---- */
    var setA = function (e, n, x) { if (e.getAttribute(n) !== x) e.setAttribute(n, x); };
    function fmt(key, x) {
      if (x === null || x === undefined || x === '') return '';
      if (key === 'lineHeight') return Number(x).toFixed(2) + '×';
      if (key === 'bgDim' || key === 'opacity' || key === 'scanStrength' || key === 'glowStrength') return Math.round(x * 100) + '%';
      if (key === 'letterSpacing' || key === 'bgBlur' || key === 'padding' || key === 'fontSize') return (Math.round(x * 100) / 100) + ' px';
      if (key === 'flickerAmount') return (Math.round(x * 1000) / 10) + '%';
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
      /* radios: tiles and segments */
      [].forEach.call(root.querySelectorAll('[role="radio"][data-key]'), function (b) {
        var key = b.getAttribute('data-key'), cur = key === 'scope' ? scope : val(key);
        if (key === 'scheme' && /^follow:/.test(String(cur))) cur = 'follow';
        if (key === 'fontWeight') cur = R.font.weight;
        setA(b, 'aria-checked', String(String(cur) === b.getAttribute('data-value')));
      });
      /* switches: what applies now (Follow look shows the look's own state) */
      var on = { scanlines: fx.scanlines.on, glow: fx.glow.on, crt: fx.crt, flicker: fx.flicker.on && !fx.off, inactiveDim: fx.dim > 0, smoothScroll: fx.smoothScroll,
        schemePair: !!val('schemePair'), ligatures: !!val('ligatures'), boldBright: !!val('boldBright'), cursorBlink: !!val('cursorBlink'),
        stickyHeader: !!val('stickyHeader'), copyOnSelect: !!val('copyOnSelect') };
      if (val('effects') === 'custom' && !R.look.reduced) on.flicker = !!val('flicker');
      [].forEach.call(root.querySelectorAll('.pmt-cz-chip'), function (c) {
        var key = c.getAttribute('data-key'), o = !!on[key];
        setA(c, 'aria-checked', String(o));
        var st = c.querySelector('.pmt-cz-chipstate'), word = o ? 'On' : 'Off';
        if (fx.off && c.closest('.pmt-cz-fxchips')) word = 'Off · effects off';
        else if (val('effects') === 'follow' && c.closest('.pmt-cz-fxchips')) word += ' · from the look';
        if (st.textContent !== word) st.textContent = word;
        c.classList.toggle('pmt-cz-is-mine', mine(key));
        var box = c.parentNode, more = box.querySelector('.pmt-cz-chipmore'); if (more) more.hidden = !o;
        box.classList.toggle('pmt-cz-lit', o);
      });
      var bi = root.querySelector('input[data-key="burnIn"]'); if (bi) bi.checked = !!val('burnIn');
      /* sliders and outputs */
      [].forEach.call(root.querySelectorAll('input[type="range"][data-key]'), function (r) {
        var key = r.getAttribute('data-key'), x = val(key);
        if (key === 'lineHeight' && (x === null || x === undefined)) x = R.font.lineHeight;
        if (key === 'opacity' && (x === null || x === undefined)) x = R.theme ? R.theme.bgAlpha : 1;
        if (key === 'sixtyfourScan' || key === 'sixtyfourBleed') x = x === null || x === undefined ? 0 : x;
        if (document.activeElement !== r) r.value = String(x);
        var out = r.parentNode.querySelector('output'); if (out) out.textContent = fmt(key, Number(r.value));
        r.closest('[data-slider]').classList.toggle('pmt-cz-is-mine', mine(key));
      });
      var fs = root.querySelector('[data-out="fontSize"]'); if (fs) fs.textContent = fmt('fontSize', R.font.size);
      setA(root.querySelector('[data-act="default"][data-key="fontSize"]'), 'aria-disabled', String(!mine('fontSize')));
      var col = root.querySelector('input[data-key="bgColor"]'), bgc = val('bgColor') || (R.theme ? T.color.toHex(R.theme.bg) : '#000000');
      if (col && document.activeElement !== col) col.value = bgc;
      var bo = root.querySelector('[data-out="bgColor"]'); if (bo) bo.textContent = bgc;
      /* what shows when (SSYS-051's visibility rule, kept for the person's sake: a hidden part keeps its value) */
      var ground = val('background');
      [].forEach.call(root.querySelectorAll('[data-when]'), function (w) { w.hidden = w.getAttribute('data-when') !== ground; });
      root.querySelector('[data-slider="opacity"]').hidden = look !== 'glass';
      root.querySelector('[data-axes]').hidden = R.font.id !== 'sixtyfour';
      /* weights the face has */
      var FD = A().fontDef(R.font.id), wr = FD && FD.weights;
      [].forEach.call(root.querySelectorAll('[data-key="fontWeight"]'), function (b) { var n = Number(b.getAttribute('data-value')); b.hidden = !wr || n < wr[0] || n > wr[1]; });
      var why = root.querySelector('[data-weight-why]'), wtxt = wr ? '' : R.font.label + ' comes in one weight.';
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
      [].forEach.call(root.querySelectorAll('[data-ground-art]'), function (g) {
        var k = g.getAttribute('data-ground-art'), bgc2 = R.theme ? T.color.toHex(R.theme.bg) : '#222';
        var css = k === 'solid' ? bgc : k === 'gradient' ? A().GRADIENTS[val('bgGradient')] || A().GRADIENTS.dusk : k === 'image' ? 'center / cover no-repeat url("' + (A().imageUrl(val('bgImage'), val('bgImageData'), 0) || '') + '")' : bgc2;
        if (k === 'follow' && look === 'friendly') css = 'linear-gradient(180deg, ' + bgc2 + ', color-mix(in srgb, ' + bgc2 + ' 70%, #f6e9f2))';
        if (g.getAttribute('data-css') !== css) { g.style.background = css; g.setAttribute('data-css', css); }
      });
      [].forEach.call(root.querySelectorAll('[data-picture-art]'), function (g) {
        var k = g.getAttribute('data-picture-art'), u = A().imageUrl(k, k === 'custom' ? val('bgImageData') : null, 0);
        if (k === 'custom' && !(val('bgImageData') || '').match(/^img:/)) u = '';
        if (g.getAttribute('data-u') !== u) { g.style.backgroundImage = u ? 'url("' + u + '")' : ''; g.setAttribute('data-u', u); g.classList.toggle('pmt-cz-empty', !u); }
      });
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
        look !== 'glass' && A().own(scope, v, 'opacity') !== undefined ? 'Opacity applies under a Glass look; this one draws the ground solid.' : '');
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
      roving();
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
    }

    /* ---- events ---- */
    function prevChosen(row) { return row ? row.querySelector('[aria-checked="true"]') : null; }
    function moveInk(key, before) { var row = root.querySelector('[data-seg="' + key + '"]'), now = prevChosen(row); if (inks[key] && before && now && before !== now && !reducedNow()) try { inks[key].move(before, now); } catch (e) {} }
    function choose(b) {
      var key = b.getAttribute('data-key'), raw = b.getAttribute('data-value');
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
      } else put(key, value);
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
      if (b.hasAttribute('data-step')) { var R = eff(); put('fontSize', T.util.clamp(R.font.size + parseFloat(b.getAttribute('data-step')), 8, 32)); return; }
      if (b.hasAttribute('data-set')) { quickSet(b.getAttribute('data-set')); return; }
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
        var x = parseFloat(t.value);
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
      var id = tileEl.getAttribute('data-value');
      if (previewing === id) return;
      intent = setTimeout(function () {
        if (!root.isConnected || v.pop !== root) return;
        previewing = id; v.recolorFrom.apply(v, centre(tileEl));
        A().preview(v, { scheme: id }); syncPreview();
      }, ms);
    }
    function endPreview() { clearTimeout(intent); if (previewing === null) return; previewing = null; A().endPreview(v); syncPreview(); }
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

    /* ---- open, refresh, close ---- */
    var offChange = A().onChange(function () { if (root.isConnected) { if (pv && pv.tabAppearance !== (scope === 'tab' ? v.tabAppearance || {} : pv.tabAppearance)) syncPreview(); paint(); } });
    var onResize = function () { place(); if (pv) pv.layout(); };
    window.addEventListener('resize', onResize);
    var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (list) {
      list.forEach(function (en) { if (en.target === v.root) place(); else if (pv) { pv.layout(); preview.select(); } });
    }) : null;
    if (ro) { ro.observe(v.root); if (pv) { ro.observe(root.querySelector('[data-pv-box]')); ro.observe(root.querySelector('[data-dock-box]')); } }
    function close(noFocus) {
      if (v.pop !== root) return;
      v.closeAppearance(noFocus);
    }
    root._pmtClose = function (noFocus) {
      endPreview();
      if (offChange) offChange();
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      if (preview) preview.dispose();
      root.setAttribute('aria-hidden', 'true'); root.inert = true;
      if (noFocus) root.remove(); else T.Motion.leave(root, function () { root.remove(); });
    };
    /* the preview follows you down the screen: when less than 40 % of its own place shows, the same live view moves
       into the dock under the group index, and back when its place returns */
    var dock = root.querySelector('[data-dock]'), dockBox = root.querySelector('[data-dock-box]'), homeBox = root.querySelector('[data-pv-box]'), io = null;
    function dockTo(on) {
      if (!pv || !!on === !dock.hidden) return;
      (on ? dockBox : homeBox).appendChild(pv.root);
      dock.hidden = !on; root.classList.toggle('pmt-cz-docked', !!on);
      if (on) T.Motion.play(dock);
      pv.layout(true); preview.select();
    }
    if (pv && typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(function (list) { var en = list[list.length - 1]; dockTo(en.intersectionRatio < 0.4); }, { root: body, threshold: [0, 0.4, 1] });
      io.observe(root.querySelector('.pmt-cz-preview'));
    }
    root._pmtPreview = preview; /* the preview, for checks that read what it draws */
    place();
    if (pv) { pv.layout(true); preview.select(); }
    syncPreview();
    paint();
    filter('');
    T.Motion.play(root);
    /* the focus starts on the scope switch, the first thing to decide; the dialog's name and lead are its context */
    var first = root.querySelector('[data-seg="scope"] [aria-checked="true"]') || dialog;
    first.focus({ preventScroll: true });
    v._apRender = function () { paint(); };
    return { el: root, close: function () { close(); }, refresh: function () { if (v.pop === root) { syncPreview(); paint(); } } };
  }

  T.Customize = { open: open, transcript: transcript };
})();
