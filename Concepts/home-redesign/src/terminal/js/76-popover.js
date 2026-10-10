/* The terminal's More menu (D12) and the Appearance popover (D15, D16, D17). The popover binds controls to
   T.Appearance only; Settings > Terminal will bind the same fields later. Everything applies live. Hovering a scheme
   previews it on this terminal; leaving the list or pressing Escape reverts the preview. The scope switch chooses the
   layer written: "This terminal" (the tab) or "All terminals" (the app default). The same popover, cut down to scheme,
   font and size, is the code editor's (T.AppearancePopover, surface 'editor', D27). */
(function () {
  var A = function () { return T.Appearance; };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  var esc = function (s) { return T.util.esc(s); };

  /* ---------------- More menu ---------------- */
  T.View.prototype.moreMenu = function () {
    var v = this, s = this.session, running = s.state === 'running';
    var profiles = window.PMT ? window.PMT.profiles() : [];
    var agentItems = [{ id: 'agents-ask', label: 'Ask each time', checked: true, disabled: true, detail: 'Agents ask before typing here' }];
    s.grants.forEach(function (a) {
      if (a === s.owner) return;
      var nm = a.replace(/^agent:/, '');
      agentItems.push({ id: 'agent-' + a, label: (s.inTerminal.has(a) ? 'Allowed in this terminal: ' : 'Allowed once: ') + nm, detail: 'Revoke', run: function () { s.revoke(a); v.announce(nm + ' can no longer type here'); } });
    });
    return [
      { id: 'new', label: 'New terminal', sub: profiles.map(function (p) { return { id: 'new-' + p.id, label: p.label, detail: p.detail, run: function () { if (v.api && v.api.open) v.api.open({ kind: 'terminal', profile: p.id, where: 'tab' }); } }; }) },
      { id: 'split-down', label: 'Split down', run: function () { if (v.api && v.api.split) v.api.split('down', { kind: 'terminal', profile: s.profile.id, cwd: s.shell ? s.shell.cwd : s.cwd }); } },
      '-',
      { id: 'appearance', label: 'Appearance…', run: function () { v.openAppearance(); } },
      { id: 'text', label: 'Text size', sub: [
        { id: 'zoom-in', label: 'Bigger', shortcut: T.keys.label('zoomIn'), run: function () { v.zoom(1); } },
        { id: 'zoom-out', label: 'Smaller', shortcut: T.keys.label('zoomOut'), run: function () { v.zoom(-1); } },
        { id: 'zoom-reset', label: 'Reset', shortcut: T.keys.label('zoomReset'), run: function () { v.zoom(0); } }] },
      '-',
      { id: 'copy-mode', label: 'Copy mode', shortcut: T.keys.label('copyMode'), run: function () { v.focus(); v.startCopyMode(); } },
      { id: 'quick-select', label: 'Quick select', shortcut: T.keys.label('quickSelect'), run: function () { v.focus(); v.startHints(); } },
      { id: 'select-all', label: 'Select all', run: function () { v.selectAll(); } },
      { id: 'clear', label: 'Clear', shortcut: T.keys.label('clear'), run: function () { v.clearScreen(); } },
      { id: 'clear-scrollback', label: 'Clear scrollback', run: function () { v.term.write('\x1b[3J'); v.scrollTo(v.bottomAbs()); v.marksDirty = true; v.schedule(true); } },
      { id: 'a11y', label: 'Plain-text buffer', shortcut: T.keys.label('a11y'), run: function () { v.openA11y(); } },
      '-',
      { id: 'agents', label: 'Agent input', sub: agentItems },
      { id: 'signal', label: 'Send signal', disabled: !running || !s.foreground(), sub: [
        { id: 'sig-int', label: 'Interrupt', detail: 'SIGINT', run: function () { s.interrupt(); } },
        { id: 'sig-term', label: 'Terminate', detail: 'SIGTERM', run: function () { s.shell.signal('SIGTERM', true); } },
        { id: 'sig-kill', label: 'Kill', detail: 'SIGKILL', danger: true, run: function () { s.kill(); } }] },
      { id: 'restart', label: 'Restart session', run: function () { v.restart(); } }
    ];
  };

  /* ---------------- Appearance popover ---------------- */
  /* T.AppearancePopover.open(anchor, { surface, get, set, onClose, view }) (D27). One popover for two surfaces:
       'terminal'  the terminal's own (View.openAppearance): anchor is the view's root and view the T.View; it reads
                   and writes T.Appearance at the scope its switch shows, so get and set are not used.
       'editor'    the code editor's: Colour scheme ('Follow look' first, the default), font face and size only; no
                   effects, cursor, trail, background or scope rows. get() returns the editor's { scheme, font, size }
                   and set(key, value) is called on every change (key 'scheme' | 'font' | 'size'); the editor keeps
                   the values. It floats under anchor (fixed, right-aligned to it), and closes on Escape, Done, the
                   close button or a click outside.
     Both call onClose once when they close, and return { el, close, refresh }. The rows, controls and scheme list
     are shared, so both read the same, and the NieR paint (40-nier.css) reaches both through the same classes. */
  function row(label, ctl) { return '<div class="pmt-pop-row"><span class="pmt-pop-label">' + esc(label) + '</span><span class="pmt-pop-ctl">' + ctl + '</span></div>'; }
  function fieldLabel(key) { return A().FIELDS[key] ? A().FIELDS[key].label : key; }
  function select(key, value, opts, label) {
    return '<select data-key="' + key + '" aria-label="' + esc(label || fieldLabel(key)) + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
  }
  function check(key, value, label) { return '<label class="pmt-check"><input type="checkbox" data-key="' + key + '"' + (value ? ' checked' : '') + '><span>' + esc(label) + '</span></label>'; }
  function range(key, value, min, max, step, text) { return '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" aria-label="' + esc(fieldLabel(key)) + '"><output>' + esc(text) + '</output>'; }
  function stepper(key, value, min, max, step) {
    return '<span class="pmt-stepper"><button type="button" class="pmt-step" data-step="-' + step + '" data-key="' + key + '" aria-label="Smaller">−</button><output>' + value + ' px</output><button type="button" class="pmt-step" data-step="' + step + '" data-key="' + key + '" aria-label="Bigger">+</button></span>';
  }
  function seg(key, value, opts) {
    return '<span class="pmt-seg" role="radiogroup">' + opts.map(function (o) { return '<button type="button" role="radio" data-key="' + key + '" data-value="' + o[0] + '" aria-checked="' + (String(value) === String(o[0])) + '">' + esc(o[1]) + '</button>'; }).join('') + '</span>';
  }
  function swatch(sch) {
    var c = sch.colors, a = c.ansi;
    return '<span class="pmt-swatch" style="background:' + c.background + ';color:' + c.foreground + '" aria-hidden="true"><span class="pmt-sw-fg">Aa</span>' +
      [1, 2, 3, 4, 5, 6].map(function (i) { return '<i style="background:' + a[i] + '"></i>'; }).join('') + '</span>';
  }
  /* the scheme list: the follow option ({ label, meta, swatch: a scheme }) first, then every scheme by family */
  function schemeOptions(sid, follow, q) {
    var list = A().schemes(), out = [], fam = null, ql = q.toLowerCase();
    if (!ql || follow.label.toLowerCase().indexOf(ql) >= 0 || (follow.meta || '').toLowerCase().indexOf(ql) >= 0) {
      out.push('<div class="pmt-scheme" role="option" tabindex="-1" data-id="follow" aria-selected="' + (sid === 'follow') + '">' + swatch(follow.swatch || list[0]) +
        '<span class="pmt-scheme-name">' + esc(follow.label) + '</span><span class="pmt-scheme-meta">' + esc(follow.meta || '') + '</span></div>');
    }
    list.forEach(function (sch) {
      if (ql && (sch.name + ' ' + sch.family).toLowerCase().indexOf(ql) < 0) return;
      if (sch.family !== fam) { fam = sch.family; out.push('<div class="pmt-scheme-group" role="presentation">' + esc(fam === 'Puppet Master' ? 'Puppet Master originals' : fam) + '</div>'); }
      out.push('<div class="pmt-scheme" role="option" tabindex="-1" data-id="' + esc(sch.id) + '" aria-selected="' + (sid === sch.id) + '">' + swatch(sch) +
        '<span class="pmt-scheme-name">' + esc(sch.name) + '</span><span class="pmt-scheme-meta">' + (sch.appearance === 'light' ? 'Light' : 'Dark') + '</span></div>');
    });
    if (out.length === 0) out.push('<div class="pmt-pop-note">No scheme matches</div>');
    return out.join('');
  }
  /* Up and Down move through the scheme list (from the search field too); returns the option moved to */
  function listStep(pop, e) {
    var o = e.target.closest && e.target.closest('.pmt-scheme');
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || !(o || e.target.classList.contains('pmt-pop-search'))) return null;
    e.preventDefault();
    var opts = [].slice.call(pop.querySelectorAll('.pmt-scheme')), i = opts.indexOf(o);
    var n = opts[e.key === 'ArrowDown' ? Math.min(opts.length - 1, i + 1) : Math.max(0, i - 1)];
    if (n) n.focus();
    return n || null;
  }
  function focusFirst(pop) {
    var first = pop.querySelector('.pmt-scheme[aria-selected="true"]') || pop.querySelector('.pmt-pop-search');
    if (first) { first.focus({ preventScroll: true }); if (first.scrollIntoView) first.scrollIntoView({ block: 'nearest' }); }
  }

  T.AppearancePopover = {
    open: function (anchor, opts) {
      opts = opts || {};
      return opts.surface === 'editor' ? openEditor(anchor, opts) : openTerminal(anchor, opts);
    }
  };

  T.View.prototype.openAppearance = function () {
    if (this.pop) { this.closeAppearance(); return; }
    T.AppearancePopover.open(this.root, { surface: 'terminal', view: this });
  };

  function openTerminal(anchor, opts) {
    var v = opts.view;
    if (v.pop) v.closeAppearance(true);
    v._apOnClose = typeof opts.onClose === 'function' ? opts.onClose : null;
    var scope = v._apScope || 'tab';
    var pop = el('div', 'pmt-pop');
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Terminal appearance'); pop.tabIndex = -1;
    (anchor || v.root).appendChild(pop);
    v.pop = pop;
    function val(key) {
      /* what the control shows: this scope's own value if set, otherwise the value in effect */
      if (scope === 'tab' && v.tabAppearance && v.tabAppearance[key] !== undefined) return v.tabAppearance[key];
      return A().get(scope === 'tab' ? v : null, key);
    }
    function set(key, value) { A().set(scope, key, value, v); render(true); }
    var ap = function () { return v.appearance; };
    /* the font metrics this scope has, so "All terminals" never starts from this tab's zoom: the scope's own value,
       otherwise the default of the font that scope resolves to */
    function scopeFont() {
      var fid = val('font'); if (fid === 'follow' || !A().FONTS[fid]) fid = A().LOOKS[ap().lookKey].font;
      var fd = A().FONTS[fid];
      return { size: val('fontSize') || fd.size, lineHeight: val('lineHeight') || fd.lineHeight, letterSpacing: val('letterSpacing') || 0 };
    }

    function render(keepScroll) {
      var body = pop.querySelector('.pmt-pop-body'), st = body ? body.scrollTop : 0;
      var R = ap(), look = R.lookKey;
      var sid = val('scheme');
      var html = '';
      html += '<div class="pmt-pop-head"><span class="pmt-pop-title">Appearance</span>' +
        '<span class="pmt-seg" role="radiogroup" aria-label="Apply to">' +
        '<button type="button" role="radio" data-scope="tab" aria-checked="' + (scope === 'tab') + '">This terminal</button>' +
        '<button type="button" role="radio" data-scope="app" aria-checked="' + (scope === 'app') + '">All terminals</button></span>' +
        '<button type="button" class="pmt-pop-x" data-act="close" aria-label="Close appearance" data-pm-hover-label="Close (Esc)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></div>';
      html += '<div class="pmt-pop-body">';
      /* scheme */
      html += '<section class="pmt-pop-sec" aria-label="Colour scheme"><h4>Colour scheme</h4>' +
        '<input class="pmt-pop-search" type="search" placeholder="Search schemes" aria-label="Search schemes" value="' + esc(v._apQuery || '') + '">' +
        '<div class="pmt-schemes" role="listbox" aria-label="Colour schemes">' + schemeOptions(sid, follow(sid), v._apQuery || '') + '</div>' +
        row('Light and dark', check('schemePair', val('schemePair'), 'Switch with the app\'s light and dark mode')) +
        row('Minimum contrast', select('minContrast', val('minContrast'), [[1, 'Off'], [3, '3:1'], [4.5, '4.5:1'], [7, '7:1']])) +
        '<div class="pmt-pop-row pmt-pop-import"><button type="button" class="pmt-textbtn" data-act="import">Import scheme…</button><span class="pmt-pop-note">iTerm2, Windows Terminal, kitty, Ghostty, Alacritty, base16 or base24, Xresources</span></div>' +
        '</section>';
      /* font */
      var fonts = [['follow', 'Follow theme (' + A().FONTS[A().LOOKS[look].font].label + ')']].concat(Object.keys(A().FONTS).map(function (k) { return [k, A().FONTS[k].label]; }));
      var sf = scopeFont();
      html += '<section class="pmt-pop-sec" aria-label="Font"><h4>Font</h4>' +
        row('Face', select('font', val('font'), fonts)) +
        row('Size', stepper('fontSize', sf.size, 8, 32, 0.5)) +
        row('Weight', select('fontWeight', val('fontWeight') || 400, [[400, 'Regular'], [500, 'Medium'], [600, 'Semibold']])) +
        row('Line height', range('lineHeight', sf.lineHeight, 1, 2, 0.05, sf.lineHeight.toFixed(2))) +
        row('Letter spacing', range('letterSpacing', sf.letterSpacing, -1, 3, 0.25, sf.letterSpacing + ' px')) +
        row('Ligatures', check('ligatures', val('ligatures'), 'Join ligatures where the font has them')) +
        (R.font.id === 'sixtyfour' || R.font.id === 'sixtyfour-raster' ? '<p class="pmt-pop-note">Sixtyfour Raster is Sixtyfour with its scanline and bleed axes set (45, 40): a CRT look with no motion.</p>' : '') +
        '</section>';
      /* cursor */
      html += '<section class="pmt-pop-sec" aria-label="Cursor"><h4>Cursor</h4>' +
        row('Shape', seg('cursorShape', val('cursorShape'), [['follow', 'Theme'], ['block', 'Block'], ['bar', 'Bar'], ['underline', 'Underline']])) +
        row('Blink', check('cursorBlink', val('cursorBlink'), 'Blink (stops after 15 s idle)')) +
        row('Trail', select('cursorTrail', val('cursorTrail'), [['follow', 'Follow theme'], ['off', 'Off'], ['soft', 'Soft'], ['glow', 'Glow'], ['phosphor', 'Phosphor'], ['trace', 'Trace']])) +
        '</section>';
      /* background */
      var bgk = val('background');
      html += '<section class="pmt-pop-sec" aria-label="Background"><h4>Background</h4>' +
        row('Fill', select('background', bgk, [['follow', 'Follow theme'], ['theme', 'Theme surface'], ['solid', 'Solid colour'], ['gradient', 'Gradient'], ['image', 'Image']]));
      if (bgk === 'solid') html += row('Colour', '<input type="color" class="pmt-pop-color" data-key="bgColor" value="' + esc(val('bgColor') || T.color.toHex(R.theme.bg)) + '" aria-label="Background colour">');
      if (bgk === 'gradient') html += row('Gradient', select('bgGradient', val('bgGradient'), [['dusk', 'Dusk'], ['dawn', 'Dawn'], ['deep', 'Deep'], ['paper', 'Paper']]));
      if (bgk === 'image') {
        html += row('Image', select('bgImage', val('bgImage'), [['hills', 'Hills'], ['grid', 'Grid'], ['paper', 'Paper'], ['custom', 'Your image']]) + '<button type="button" class="pmt-textbtn" data-act="upload">Choose…</button>');
        html += row('Dim', range('bgDim', val('bgDim'), 0, 0.9, 0.05, Math.round(val('bgDim') * 100) + '%'));
        html += row('Blur', range('bgBlur', val('bgBlur'), 0, 24, 1, val('bgBlur') + ' px'));
      }
      var op = val('opacity'); if (op === null || op === undefined) op = R.theme.bgAlpha || 1;
      if (look === 'glass' || val('opacity') !== null) html += row('Opacity', range('opacity', op, 0.4, 1, 0.02, Math.round(op * 100) + '%'));
      html += row('Padding', range('padding', val('padding'), 0, 24, 1, val('padding') + ' px'));
      html += '</section>';
      /* effects */
      var fx = R.effects, eff = v.fx ? v.fx.effective : {};
      var fxMode = val('effects');
      html += '<section class="pmt-pop-sec" aria-label="Effects"><h4>Effects</h4>' +
        row('Effects', seg('effects', fxMode, [['follow', 'Theme'], ['off', 'Off'], ['custom', 'Custom']]));
      if (fxMode !== 'off') {
        html += row('Inactive', check('inactiveDim', fx.dim > 0, 'Dim terminals that are not focused')) +
          row('Scrolling', check('smoothScroll', fx.smoothScroll, 'Smooth scrolling')) +
          row('Scanlines', check('scanlines', fx.scanlines.on, 'Scanlines') + (fx.scanlines.on ? range('scanStrength', val('scanStrength'), 0, 0.6, 0.05, Math.round(val('scanStrength') * 100) + '%') : '')) +
          row('Glow', check('glow', fx.glow.on, 'Phosphor glow') + (fx.glow.on ? range('glowStrength', val('glowStrength'), 0, 1, 0.05, Math.round(val('glowStrength') * 100) + '%') : '')) +
          /* Full CRT and Flicker show what applies: Theme does not apply a stored custom choice */
          row('Full CRT', check('crt', fx.crt, 'Curvature, bezel, burn-in and noise')) +
          (fx.crt ? row('Curvature', range('curvature', val('curvature'), 0, 0.2, 0.01, String(val('curvature')))) + row('Burn-in', check('burnIn', val('burnIn'), 'Afterglow when text moves')) + row('Noise', range('noise', val('noise'), 0, 0.12, 0.005, String(val('noise')))) : '') +
          row('Flicker', check('flicker', fxMode === 'custom' && !!val('flicker'), 'Flicker (at most 3% brightness change, below the WCAG flash threshold)')) +
          (look === 'retro' ? '<div class="pmt-pop-row"><span></span><button type="button" class="pmt-textbtn" data-act="degauss">Degauss</button></div>' : '');
      }
      var notes = [];
      if (fx.reduced) notes.push('Reduced Motion is on: nothing moves; static looks stay.');
      else if (eff.motion && /^Battery saver/.test(eff.motion)) notes.push('Battery saver is on: nothing moves; static looks stay.');
      if (eff.curvature && /not drawn/.test(eff.curvature)) notes.push('No GPU on this machine: curvature, burn-in and noise are not drawn; scanlines and glow use the flat fallback.');
      if (notes.length) html += '<p class="pmt-pop-note">' + notes.map(esc).join(' ') + '</p>';
      html += '</section></div>';
      html += '<div class="pmt-pop-foot"><button type="button" class="pmt-textbtn" data-act="reset">' + (scope === 'tab' ? 'Reset this terminal' : 'Reset all terminals') + '</button><span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn pmt-textbtn-primary" data-act="close">Done</button></div>';
      pop.innerHTML = html;
      var nb = pop.querySelector('.pmt-pop-body'); if (keepScroll && nb) nb.scrollTop = st;
      place();
    }
    /* Follow theme: the look's own scheme, swatched as it applies now when this scope follows */
    function follow(sid) {
      var R = ap(), L = A().LOOKS[R.lookKey];
      var name = L ? (A().scheme(L[R.look.mode === 'light' ? 'light' : 'dark']) || {}).name : '';
      return { label: 'Follow theme', meta: name || '', swatch: sid === 'follow' && R.scheme ? R.scheme : A().scheme(L[R.look.mode]) };
    }
    function place() {
      /* under the header row, right-aligned; full width in narrow panels; never taller than the body */
      var hr = v.hrow && v.hrow.el && !v.hrow.el.hidden ? v.hrow.el.offsetHeight : 0;
      pop.style.top = (hr + 6) + 'px';
      pop.style.maxHeight = Math.max(120, v.root.clientHeight - hr - 12) + 'px';
      pop.classList.toggle('pmt-pop-narrow', v.root.clientWidth < 420);
    }

    render(false);
    /* events */
    pop.addEventListener('input', function (e) {
      var t = e.target, key = t.getAttribute('data-key');
      if (t.classList.contains('pmt-pop-search')) {
        v._apQuery = t.value;
        pop.querySelector('.pmt-schemes').innerHTML = schemeOptions(val('scheme'), follow(val('scheme')), v._apQuery);
        return;
      }
      if (!key) return;
      if (t.type === 'range') { t.nextElementSibling && (t.nextElementSibling.textContent = t.value); A().set(scope, key, parseFloat(t.value), v); return; }
      if (t.type === 'color') { A().set(scope, key, t.value, v); }
    });
    pop.addEventListener('change', function (e) {
      var t = e.target, key = t.getAttribute('data-key'); if (!key) return;
      if (t.type === 'checkbox') {
        var value = t.checked;
        if (['scanlines', 'glow', 'inactiveDim', 'smoothScroll', 'crt', 'flicker'].indexOf(key) >= 0 && val('effects') === 'follow') A().set(scope, 'effects', 'custom', v);
        set(key, value); return;
      }
      if (t.tagName === 'SELECT') { var raw = t.value, num = Number(raw); set(key, raw !== '' && !isNaN(num) && /^-?[\d.]+$/.test(raw) ? num : raw); return; }
      if (t.type === 'range') render(true);
    });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('button, .pmt-scheme'); if (!b) return;
      if (b.classList.contains('pmt-scheme')) { A().endPreview(v); set('scheme', b.getAttribute('data-id')); v.announce('Scheme: ' + b.querySelector('.pmt-scheme-name').textContent); return; }
      if (b.hasAttribute('data-scope')) { scope = v._apScope = b.getAttribute('data-scope'); render(true); return; }
      if (b.hasAttribute('data-step')) { var k = b.getAttribute('data-key'); set(k, T.util.clamp(scopeFont().size + parseFloat(b.getAttribute('data-step')), 8, 32)); return; }
      if (b.getAttribute('role') === 'radio' && b.hasAttribute('data-key')) { set(b.getAttribute('data-key'), b.getAttribute('data-value')); return; }
      var act = b.getAttribute('data-act');
      if (act === 'close') v.closeAppearance();
      else if (act === 'reset') { A().reset(scope, v); render(true); v.announce(scope === 'tab' ? 'This terminal follows the defaults again' : 'All terminals reset'); }
      else if (act === 'degauss') { if (v.fx) v.fx.degauss(); }
      else if (act === 'import') importScheme();
      else if (act === 'upload') uploadImage();
    });
    /* live preview on hover and keyboard focus in the list */
    pop.addEventListener('mouseover', function (e) {
      var o = e.target.closest('.pmt-scheme'); if (!o) return;
      var id = o.getAttribute('data-id');
      if (v._previewId === id) return;
      v._previewId = id; A().preview(v, { scheme: id });
    });
    pop.addEventListener('mouseout', function (e) {
      var list = pop.querySelector('.pmt-schemes');
      if (list && !list.contains(e.relatedTarget)) { v._previewId = null; A().endPreview(v); }
    });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); A().endPreview(v); v.closeAppearance(); return; }
      var o = e.target.closest && e.target.closest('.pmt-scheme');
      var n = listStep(pop, e);
      if (n) { v._previewId = n.getAttribute('data-id'); A().preview(v, { scheme: v._previewId }); }
      if (e.key === 'Enter' && o) { e.preventDefault(); o.click(); }
      e.stopPropagation();
    });
    function importScheme() {
      var input = el('input'); input.type = 'file'; input.accept = '.itermcolors,.json,.conf,.toml,.yaml,.yml,.Xresources,.xresources,.txt,.theme';
      input.addEventListener('change', function () {
        var f = input.files && input.files[0]; if (!f) return;
        if (f.size > 256 * 1024) { v.announce('That file is too large for a colour scheme'); return; }
        f.text().then(function (text) {
          var r = T.SchemeImport ? T.SchemeImport.parse(text, f.name) : { ok: false, error: 'Import is not available' };
          if (!r.ok) { v.notice({ id: 'import', tone: 'warn', focus: true, text: 'Could not import that scheme: ' + r.error, actions: [{ label: 'OK' }] }); return; }
          var entry = A().addUserScheme(r.scheme);
          set('scheme', entry.id);
          v.announce('Imported ' + entry.name);
        });
      });
      input.click();
    }
    /* the image is kept once, on this machine, under its own key and a content hash; the layers hold only 'img:<hash>'.
       A data URL in a layer would push this tab's saved state over the host's 16 KB cap (the whole state then stops
       saving) or fill the settings store. It is scaled down (never up) to just cover the 960 x 600 the background uses,
       as a JPEG */
    function storeImage(img) {
      var k = Math.min(1, Math.max(960 / img.naturalWidth, 600 / img.naturalHeight));
      var cv = el('canvas'); cv.width = Math.max(1, Math.round(img.naturalWidth * k)); cv.height = Math.max(1, Math.round(img.naturalHeight * k));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      var data = cv.toDataURL('image/jpeg', 0.85);
      var h1 = 0x811c9dc5, h2 = 0x01000193;
      for (var i = 0; i < data.length; i++) { var c = data.charCodeAt(i); h1 = Math.imul(h1 ^ c, 0x01000193); h2 = Math.imul(h2 ^ c, 0x5bd1e995); }
      var hash = (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16), KEY = 'pm.home.terminal:v1:bg';
      try {
        /* the four most recent images stay, and the ones All terminals and this terminal use; an older one another tab
           still names falls back to the default image. The old ones go first, so they make room for the new one */
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
        if (f.size > 4 * 1024 * 1024) { v.announce('Choose an image under 4 MB'); return; }
        var url = URL.createObjectURL(f), img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(url);
          var ref = storeImage(img);
          if (!ref) { v.announce('There is no room to keep that image on this machine'); return; }
          A().set(scope, 'bgImageData', ref, v); set('bgImage', 'custom');
        };
        img.onerror = function () { URL.revokeObjectURL(url); v.announce('That image could not be read'); };
        img.src = url;
      });
      input.click();
    }
    v._popOutside = function (e) { if (v.pop && !v.pop.contains(e.target) && !e.target.closest('.pmw-hbtn, [role="menu"], .pmw-menu')) v.closeAppearance(); };
    setTimeout(function () { document.addEventListener('mousedown', v._popOutside, true); }, 0);
    focusFirst(pop);
    v._apRender = render;
    return { el: pop, close: function () { if (v.pop === pop) v.closeAppearance(); }, refresh: function () { if (v.pop === pop) render(true); } };
  }
  /* noFocus: the view is going away (dispose), so the focus is left where it is */
  T.View.prototype.closeAppearance = function (noFocus) {
    if (!this.pop) return;
    T.Appearance.endPreview(this);
    this.pop.remove(); this.pop = null;
    document.removeEventListener('mousedown', this._popOutside, true);
    var done = this._apOnClose; this._apOnClose = null;
    if (done) { try { done(); } catch (e) { console.error('[pmt] appearance onClose failed', e); } }
    if (!noFocus) this.focus();
  };

  /* ---- the editor surface ---- */
  /* the scheme 'Follow look' gives the editor now: the look's own scheme for the mode, and in Retro dark the phosphor
     the Retro look has chosen (retroPhosphor) */
  function editorFollowScheme() {
    var look = T.look(), lk = A().lookKey(look), mode = look.mode === 'light' ? 'light' : 'dark';
    if (lk === 'retro' && mode === 'dark') return A().scheme(A().retroPhosphor() === 'amber' ? 'pm-phosphor-amber' : 'pm-phosphor-green');
    return A().scheme(A().LOOKS[lk][mode]);
  }
  function openEditor(anchor, opts) {
    var pop = el('div', 'pmt-pop pmt-pop-float');
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Editor appearance'); pop.tabIndex = -1;
    /* inside the panels' overlay layer when there is one, so it takes the panel tokens and sits above the tabs */
    (document.getElementById && document.getElementById('pmw-overlay') || document.body).appendChild(pop);
    var query = '', closed = false;
    function cur() {
      var c = (typeof opts.get === 'function' && opts.get()) || {};
      return { scheme: c.scheme && (c.scheme === 'follow' || A().scheme(c.scheme)) ? c.scheme : 'follow',
        font: c.font && A().FONTS[c.font] ? c.font : 'follow', size: typeof c.size === 'number' && c.size > 0 ? c.size : null };
    }
    function put(key, value) {
      if (typeof opts.set === 'function') { try { opts.set(key, value); } catch (e) { console.error('[pmt] editor appearance set failed', e); } }
      render(true);
    }
    function follow() { var s = editorFollowScheme(); return { label: 'Follow look', meta: s ? s.name : '', swatch: s }; }
    function shownSize(c) { return c.size || (c.font !== 'follow' ? A().FONTS[c.font].size : 13); }
    function render(keepScroll) {
      var body = pop.querySelector('.pmt-pop-body'), st = body ? body.scrollTop : 0;
      var c = cur();
      var fonts = [['follow', 'Follow look']].concat(Object.keys(A().FONTS).map(function (k) { return [k, A().FONTS[k].label]; }));
      pop.innerHTML = '<div class="pmt-pop-head"><span class="pmt-pop-title">Appearance</span>' +
        '<button type="button" class="pmt-pop-x" data-act="close" aria-label="Close appearance" data-pm-hover-label="Close (Esc)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button></div>' +
        '<div class="pmt-pop-body">' +
        '<section class="pmt-pop-sec" aria-label="Colour scheme"><h4>Colour scheme</h4>' +
        '<input class="pmt-pop-search" type="search" placeholder="Search schemes" aria-label="Search schemes" value="' + esc(query) + '">' +
        '<div class="pmt-schemes" role="listbox" aria-label="Colour schemes">' + schemeOptions(c.scheme, follow(), query) + '</div></section>' +
        '<section class="pmt-pop-sec" aria-label="Font"><h4>Font</h4>' +
        row('Face', select('font', c.font, fonts, 'Font')) +
        row('Size', stepper('size', shownSize(c), 8, 32, 0.5)) +
        '</section></div>' +
        '<div class="pmt-pop-foot"><span class="pmt-pop-spacer"></span><button type="button" class="pmt-textbtn pmt-textbtn-primary" data-act="close">Done</button></div>';
      var nb = pop.querySelector('.pmt-pop-body'); if (keepScroll && nb) nb.scrollTop = st;
      place();
    }
    /* under the anchor, right-aligned to it, kept inside the page (an overlay, placed the way the panels' menus are);
       full width less a margin on a narrow page */
    function place() {
      var de = document.documentElement, vw = de.clientWidth || 1024, vh = de.clientHeight || 768;
      var r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { top: 0, bottom: 40, right: vw - 8 };
      var narrow = vw < 420, w = narrow ? vw - 12 : 384;
      var top = Math.min(r.bottom + 6, Math.max(6, vh - 132));
      pop.style.top = top + 'px';
      pop.style.left = (narrow ? 6 : Math.max(6, Math.min(r.right - w, vw - w - 6))) + 'px';
      pop.style.width = w + 'px';
      pop.style.maxHeight = Math.max(120, vh - top - 12) + 'px';
    }
    function close() {
      if (closed) return;
      closed = true;
      pop.remove();
      document.removeEventListener('mousedown', outside, true);
      window.removeEventListener('resize', place);
      if (anchor && anchor.focus && document.contains && document.contains(anchor)) anchor.focus({ preventScroll: true });
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) { console.error('[pmt] editor appearance onClose failed', e); } }
    }
    function outside(e) { if (!pop.contains(e.target) && !(anchor && anchor.contains && anchor.contains(e.target))) close(); }

    render(false);
    pop.addEventListener('input', function (e) {
      if (!e.target.classList.contains('pmt-pop-search')) return;
      query = e.target.value;
      pop.querySelector('.pmt-schemes').innerHTML = schemeOptions(cur().scheme, follow(), query);
    });
    pop.addEventListener('change', function (e) {
      var t = e.target;
      if (t.tagName === 'SELECT' && t.getAttribute('data-key') === 'font') put('font', t.value);
    });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('button, .pmt-scheme'); if (!b) return;
      if (b.classList.contains('pmt-scheme')) { put('scheme', b.getAttribute('data-id')); var o = pop.querySelector('.pmt-scheme[aria-selected="true"]'); if (o) o.focus({ preventScroll: true }); return; }
      if (b.hasAttribute('data-step')) { put('size', T.util.clamp(shownSize(cur()) + parseFloat(b.getAttribute('data-step')), 8, 32)); return; }
      if (b.getAttribute('data-act') === 'close') close();
    });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      var o = e.target.closest && e.target.closest('.pmt-scheme');
      listStep(pop, e);
      if (e.key === 'Enter' && o) { e.preventDefault(); o.click(); }
      e.stopPropagation();
    });
    window.addEventListener('resize', place);
    setTimeout(function () { if (!closed) document.addEventListener('mousedown', outside, true); }, 0);
    focusFirst(pop);
    return { el: pop, close: close, refresh: function () { if (!closed) render(true); } };
  }
})();
