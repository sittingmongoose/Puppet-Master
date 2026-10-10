/* T.View: one terminal tab's body. Header row (the host's shared component), command-mark gutter, the screen
   (canvas stack: background layer, grid, effects, cursor trail, overlays), the scrollbar in the editor minimap's
   language, the sticky command header, notices, the accessible buffer view and the polite live region. */
(function () {
  var C = T.color;
  var GUTTER = 20, SCROLLBAR = 14;
  var SVG = {
    ok: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>',
    fail: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
    run: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.4" class="pmt-fill"/></svg>',
    idle: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2.2"/></svg>',
    agent: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="4" width="8" height="8"/><path d="M6.5 8h3"/></svg>'
  };
  T.ICONS = {
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>',
    branch: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="4" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="6" r="1.5"/><path d="M5 5.5v5M11 7.5c0 2-2 2.5-6 3"/></svg>',
    folder: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4.5h4l1.5 1.5h5.5v6.5h-11z"/></svg>'
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function base(p) { var s = String(p || '').replace(/\/+$/, ''); var i = s.lastIndexOf('/'); return i >= 0 ? s.slice(i + 1) || '/' : s; }
  /* nothing moves under Reduced Motion, nor on battery saver (SPEC section 9); both are read live, so a change of
     either stops the blink and the smooth wheel at once */
  function motionOff() { return T.look().reduced || !!(T.FX && T.FX.battery && T.FX.battery.saver); }

  function View(host, api, session, state) {
    T.mixinEmitter(this);
    var self = this;
    this.host = host; this.api = api; this.session = session; this.state = state || {};
    this.term = session.term;
    this.opts = { ligatures: true, boldBright: false, minContrast: 4.5, cursor: { shape: 'block', blink: true } };
    this.focused = false; this.visible = true; this.dimmed = false;
    this.followBottom = true; this.scrollAbs = 0;
    this.blinkOn = true; this.lastInput = T.util.now();
    this.hoverLinkId = 0; this.hoverRange = null;
    this.findState = null; this.selection = null;
    this.disposers = [];
    this.tabAppearance = (this.state && this.state.appearance) || {};

    /* ---- DOM ---- */
    var root = this.root = el('div', 'pmt-root');
    root.setAttribute('data-pmh', 'off');
    if (api && api.headerRow) {
      this.hrow = api.headerRow({ left: this._headerLeft(), actions: this._headerActions() });
      root.appendChild(this.hrow.el);
    }
    this.progressEl = el('div', 'pmt-progress'); this.progressEl.hidden = true;
    this.agentRow = el('div', 'pmt-agentrow'); this.agentRow.hidden = true;
    this.noticeEl = el('div', 'pmt-notices');
    var body = this.bodyEl = el('div', 'pmt-body');
    this.gutter = el('div', 'pmt-gutter'); this.gutter.setAttribute('aria-label', 'Commands');
    var screen = this.screen = el('div', 'pmt-screen');
    screen.setAttribute('role', 'group');
    screen.setAttribute('aria-roledescription', 'terminal');
    this.bgLayer = el('div', 'pmt-bglayer');
    this.canvas = el('canvas', 'pmt-grid');
    this.fxCanvas = el('canvas', 'pmt-fxcanvas'); this.fxCanvas.hidden = true;
    this.trailCanvas = el('canvas', 'pmt-trail'); this.trailCanvas.hidden = true;
    this.sticky = el('button', 'pmt-sticky'); this.sticky.hidden = true; this.sticky.type = 'button';
    this.overlays = el('div', 'pmt-overlays');
    this.input = el('textarea', 'pmt-input');
    this.input.setAttribute('aria-label', 'Terminal input');
    /* the keys wantsKey gives back reach the host from this field too (CONTRACT.md section 9): the host otherwise
       leaves Alt+digits, Alt+arrows and Alt+W to any text field */
    this.input.setAttribute('data-pmw-keys', 'host');
    /* terminal text gets no hover tag (D24): the page's tag controller skips these, the hover engine skips data-pmh=off */
    this.input.setAttribute('data-pm-hover-exempt', 'terminal');
    screen.setAttribute('data-pm-hover-exempt', 'terminal');
    this.input.setAttribute('autocapitalize', 'off'); this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('autocorrect', 'off'); this.input.setAttribute('spellcheck', 'false');
    screen.appendChild(this.bgLayer); screen.appendChild(this.canvas); screen.appendChild(this.fxCanvas);
    screen.appendChild(this.trailCanvas); screen.appendChild(this.sticky); screen.appendChild(this.overlays); screen.appendChild(this.input);
    this.sb = el('div', 'pmt-scrollbar');
    this.sbMarks = el('canvas', 'pmt-sb-marks');
    this.sbThumb = el('div', 'pmt-sb-thumb');
    this.sb.appendChild(this.sbMarks); this.sb.appendChild(this.sbThumb);
    body.appendChild(this.gutter); body.appendChild(screen); body.appendChild(this.sb);
    this.live = el('div', 'pmt-live'); this.live.setAttribute('aria-live', 'polite');
    body.appendChild(this.progressEl);
    root.appendChild(this.agentRow); root.appendChild(this.noticeEl); root.appendChild(body); root.appendChild(this.live);
    host.appendChild(root);

    this.renderer = new T.Renderer(this);
    session.cellPx = function () { return self.metrics ? { w: self.metrics.cellW, h: self.metrics.cellH } : { w: 8, h: 17 }; };
    session.isDark = function () { return self.theme ? C.lum(self.theme.bg) < 0.2 : true; };

    /* ---- appearance ---- */
    this.applyAppearance(T.Appearance ? T.Appearance.resolve(this) : this._fallbackAppearance());

    /* ---- events ---- */
    var term = this.term;
    this._on(term, 'dirty', function () { self.schedule(); });
    this._on(term, 'scroll', function () { if (self.followBottom) self.scrollAbs = self.bottomAbs(); self.marksDirty = true; });
    this._on(term, 'alt', function () { self.followBottom = true; self.schedule(true); self._updateLabel(); });
    this._on(term, 'title', function () { self._updateLabel(); });
    this._on(term, 'cwd', function () { self._updateHeader(); self._updateLabel(); });
    this._on(term, 'bell', function () { self.bell(); });
    this._on(term, 'progress', function (p) { self.setProgress(p); });
    this._on(term, 'notify', function (n) { self.notify(n); });
    this._on(term, 'command', function (e) { self._onCommand(e); });
    this._on(term, 'palette', function () { self._applyDynamicColors(); self.renderer.invalidate(); self.schedule(true); });
    this._on(term, 'reset', function () { self._applyDynamicColors(); });
    this._on(term, 'cursorstyle', function () { self.schedule(); });
    this._on(term, 'clipboard', function (c) { if (self.focused && navigator.clipboard) navigator.clipboard.writeText(c.text).catch(function () {}); });
    this._on(session, 'job', function () { self._updateLabel(); self._updateHeader(); });
    this._on(session, 'exit', function (code) { self._ended(code); });
    this._on(session, 'secret', function (e) { self.secretInput = e.on; self.schedule(true); self.emit('secret', e); });

    this._bindInput();
    this._bindMouse();
    this._bindScrollbar();
    this.sticky.addEventListener('click', function () { if (self.stickyCmd) self.revealCommand(self.stickyCmd); });

    this.blinkTimer = setInterval(function () { self._blinkTick(); }, 530);
    this.clockTimer = setInterval(function () { self._updateHeader(); }, 1000);
    /* browser zoom and a move to another monitor change the device pixel ratio, often with no resize from the host:
       lay out again (layout() measures the cells anew) and re-arm the query for the new ratio */
    (function watchDpr() {
      if (!window.matchMedia) return;
      var mq = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
      var fn = function () { mq.removeEventListener('change', fn); self.layout(true); watchDpr(); };
      mq.addEventListener('change', fn);
      self._dprOff = function () { mq.removeEventListener('change', fn); };
    })();
    if (T.FX && T.FX.attach) { this.fx = T.FX.attach(this); this.fx.configure(this.appearance.effects || {}); }
    if (T.Agent && T.Agent.attach) this.agent = T.Agent.attach(this);
    this._updateLabel(); this._updateHeader();
  }
  T.View = View;

  View.prototype._on = function (target, ev, fn) { this.disposers.push(target.on(ev, fn)); };

  View.prototype._fallbackAppearance = function () {
    var dark = T.look().mode === 'dark';
    var ansi = dark ? ['#1e2127', '#e06c75', '#98c379', '#d19a66', '#61afef', '#c678dd', '#56b6c2', '#abb2bf', '#5c6370', '#e06c75', '#98c379', '#d19a66', '#61afef', '#c678dd', '#56b6c2', '#ffffff']
      : ['#383a42', '#e45649', '#50a14f', '#c18401', '#0184bc', '#a626a4', '#0997b3', '#fafafa', '#4f525e', '#e06c75', '#98c379', '#e5c07b', '#61afef', '#c678dd', '#56b6c2', '#ffffff'];
    return { theme: { id: 'fallback-' + (dark ? 'd' : 'l'), bg: C.hex(dark ? '#282c34' : '#fafafa'), fg: C.hex(dark ? '#dcdfe4' : '#383a42'),
      cursor: C.hex(dark ? '#a3b3cc' : '#bfceff'), cursorText: -1, selBg: C.hex(dark ? '#474e5d' : '#bfceff'), selFg: -1,
      palette: C.palette256(ansi), searchMatch: C.hex('#d19a66'), searchCurrent: C.hex('#e5c07b'), link: C.hex('#61afef'), bgAlpha: 1,
      roles: {} },
      font: { family: "'JetBrains Mono', 'PM Symbols Mono', ui-monospace, Menlo, Consolas, monospace", size: 13, weight: 400, boldWeight: 700, lineHeight: 1.3, letterSpacing: 0 },
      opts: { ligatures: true, minContrast: 4.5, boldBright: false, cursor: { shape: 'block', blink: true } }, padding: { x: 8, y: 6 }, background: { kind: 'theme' } };
  };

  /* appearance: { theme, font, opts, padding, background, effects } from T.Appearance */
  View.prototype.applyAppearance = function (ap) {
    var self = this;
    this.appearance = ap;
    this.theme = ap.theme;
    Object.assign(this.opts, ap.opts || {});
    this._applyDynamicColors();
    this.root.style.setProperty('--pmt-dim', C.css(ap.theme.fg, 0.55));
    this.root.style.setProperty('--pmt-sel', C.toHex(ap.theme.selBg));
    var roles = ap.theme.roles || {};
    this.root.style.setProperty('--pmt-ok', roles.markOk || C.toHex(ap.theme.palette[2]));
    this.root.style.setProperty('--pmt-bad', roles.markFail || C.toHex(ap.theme.palette[1]));
    this.root.style.setProperty('--pmt-warn', roles.searchMatch || C.toHex(ap.theme.palette[3]));
    this.root.style.setProperty('--pmt-accent', roles.link || C.toHex(ap.theme.palette[4]));
    this.root.style.setProperty('--pmt-glow-color', roles.glow || C.toHex(ap.theme.fg));
    this.root.style.setProperty('--pmt-pad-x', (ap.padding ? ap.padding.x : 8) + 'px');
    this.root.style.setProperty('--pmt-pad-y', (ap.padding ? ap.padding.y : 6) + 'px');
    this.root.setAttribute('data-pmt-scheme', ap.theme.appearance || '');
    this._applyBackground(ap.background || { kind: 'theme' });
    var f = ap.font, gen = this._fontGen = (this._fontGen || 0) + 1;
    this.fontReady = T.Metrics.ready(f.family, f.size).then(function () {
      if (gen !== self._fontGen) return; /* a later appearance replaced this font before it finished loading */
      self._measure();
      self.layout(true);
    });
    this._measure();
    if (this.fx) this.fx.configure(ap.effects || {});
    this.renderer.invalidate();
    this.layout(true);
    this.marksDirty = true;
  };
  /* the screen ground and text colour as the renderer paints default cells (OSC 10/11 over the scheme, mapped on mono
     schemes), so the contrast floor measures what is shown */
  View.prototype._applyDynamicColors = function () {
    var th = this.theme, d = this.renderer.defaults();
    this.root.style.setProperty('--pmt-bg', C.css(d.bg, th.bgAlpha === undefined ? 1 : th.bgAlpha));
    this.root.style.setProperty('--pmt-bg-solid', C.toHex(d.bg));
    this.root.style.setProperty('--pmt-fg', C.toHex(d.fg));
  };
  View.prototype._applyBackground = function (bg) {
    var L = this.bgLayer;
    L.style.cssText = '';
    L.className = 'pmt-bglayer pmt-bg-' + (bg.kind || 'theme');
    if (bg.kind === 'gradient') L.style.background = bg.css;
    else if (bg.kind === 'image' && bg.url) {
      L.style.backgroundImage = 'url("' + bg.url + '")';
      L.style.setProperty('--pmt-bg-dim', String(bg.dim === undefined ? 0.35 : bg.dim));
      if (bg.blurredUrl) L.style.backgroundImage = 'url("' + bg.blurredUrl + '")';
    } else if (bg.kind === 'solid' && bg.color) L.style.background = bg.color;
  };
  /* cell metrics for the current font at the current device pixel ratio */
  View.prototype._measure = function () {
    var f = this.appearance.font;
    this.metrics = T.Metrics.measure({ family: f.family, fontPx: f.size, weight: f.weight, boldWeight: f.boldWeight,
      lineHeight: f.lineHeight, letterSpacing: f.letterSpacing, dpr: window.devicePixelRatio || 1 });
  };

  /* ---- geometry ---- */
  View.prototype.layout = function (force) {
    var m = this.metrics; if (!m) return;
    /* the ratio changed (zoom, another monitor): measure again so a cell stays a whole number of device pixels */
    if (m.dpr !== (window.devicePixelRatio || 1)) { this._measure(); m = this.metrics; force = true; }
    var w = this.screen.clientWidth, h = this.screen.clientHeight;
    if (!w || !h) return;
    var ap = this.appearance, px = ap.padding ? ap.padding.x : 8, py = ap.padding ? ap.padding.y : 6;
    var cols = Math.max(2, Math.floor((w - px * 2) / m.cellW)), rows = Math.max(1, Math.floor((h - py * 2) / m.cellH));
    var changed = cols !== this.term.cols || rows !== this.term.rows;
    if (changed) {
      this.session.resize(cols, rows);
      if (this.followBottom) this.scrollAbs = this.bottomAbs();
    }
    var cw = cols * m.devW, ch = rows * m.devH;
    if (this.canvas.width !== cw || this.canvas.height !== ch || force) {
      this.canvas.width = cw; this.canvas.height = ch;
      this.canvas.style.width = (cw / m.dpr) + 'px'; this.canvas.style.height = (ch / m.dpr) + 'px';
      [this.fxCanvas, this.trailCanvas].forEach(function (c) { c.width = cw; c.height = ch; c.style.width = (cw / m.dpr) + 'px'; c.style.height = (ch / m.dpr) + 'px'; });
      this.renderer.invalidate();
    }
    this.gridLeft = px; this.gridTop = py;
    this.root.style.setProperty('--pmt-cell-h', m.cellH + 'px');
    this.root.style.setProperty('--pmt-cell-w', m.cellW + 'px');
    this.root.style.setProperty('--pmt-font', this.appearance.font.family);
    this.root.style.setProperty('--pmt-font-size', this.appearance.font.size + 'px');
    this.marksDirty = true;
    this.schedule(true);
  };
  View.prototype.bottomAbs = function () { var b = this.term.buf; return b.trimmed + b.lines.length - b.rows; };
  View.prototype.topAbs = function () { var b = this.term.buf; return b.trimmed; };
  View.prototype.viewTop = function () {
    var b = this.term.buf;
    if (b.isAlt || this.followBottom) return this.bottomAbs();
    return T.util.clamp(this.scrollAbs, b.trimmed, this.bottomAbs());
  };
  View.prototype.scrollTo = function (abs, opts) {
    var bottom = this.bottomAbs();
    abs = T.util.clamp(Math.round(abs), this.topAbs(), bottom);
    this.scrollAbs = abs; this.followBottom = abs >= bottom;
    this.marksDirty = true;
    this.schedule();
  };
  View.prototype.scrollBy = function (lines) { this.scrollTo(this.viewTop() + lines); };
  /* wheel: animated line steps when smooth scrolling is on (eases over a few frames), instant otherwise */
  View.prototype.wheelScroll = function (lines) {
    var fx = this.appearance && this.appearance.effects;
    if (!fx || !fx.smoothScroll || motionOff()) { this.scrollBy(lines); return; }
    this._wheelTarget = (this._wheelAnim ? this._wheelTarget : this.viewTop()) + lines;
    var self = this;
    if (this._wheelAnim) return;
    var step = function () {
      var cur = self.viewTop(), d = self._wheelTarget - cur;
      if (!d) { self._wheelAnim = 0; return; }
      var mv = Math.sign(d) * Math.max(1, Math.round(Math.abs(d) * 0.35));
      self.scrollTo(cur + mv);
      if (self.viewTop() === cur) { self._wheelAnim = 0; return; }
      self._wheelAnim = requestAnimationFrame(step);
    };
    this._wheelAnim = requestAnimationFrame(step);
  };
  View.prototype.cellFromPoint = function (clientX, clientY) {
    var r = this.canvas.getBoundingClientRect(), m = this.metrics;
    var x = clientX - r.left, y = clientY - r.top;
    if (this.fx && this.fx.mapPointer) { var mp = this.fx.mapPointer(x, y, r.width, r.height); if (!mp) return null; x = mp.x; y = mp.y; }
    var col = Math.floor(x / m.cellW), row = Math.floor(y / m.cellH);
    return { col: T.util.clamp(col, 0, this.term.cols - 1), row: T.util.clamp(row, 0, this.term.rows - 1), px: x, py: y,
      abs: this.viewTop() + T.util.clamp(row, 0, this.term.rows - 1), inside: col >= 0 && row >= 0 && col < this.term.cols && row < this.term.rows,
      half: (x / m.cellW) - col >= 0.5 };
  };
  /* where a cell's top-left corner shows, in overlay px: under Full CRT through the same warp the text is drawn with */
  View.prototype.cellToOverlay = function (col, row) {
    var m = this.metrics, x = col * m.cellW, y = row * m.cellH;
    if (this.fx && this.fx.unmapPointer) {
      var p = this.fx.unmapPointer(x, y, this.canvas.width / m.dpr, this.canvas.height / m.dpr);
      if (p) { x = p.x; y = p.y; }
    }
    return { left: this.gridLeft + x, top: this.gridTop + y };
  };

  /* ---- render loop ---- */
  View.prototype.schedule = function (full) {
    if (full) this.fullPending = true;
    if (this.raf || !this.visible) return;
    var self = this;
    this.raf = requestAnimationFrame(function () { self.raf = 0; self.frame(); });
  };
  View.prototype.frame = function () {
    var term = this.term;
    /* synchronized output (mode 2026): hold presents until it ends or 150 ms pass */
    if (term.modes.sync && T.util.now() - term.syncSince < 150) { var self = this; setTimeout(function () { self.schedule(); }, 16); return; }
    var full = this.fullPending; this.fullPending = false;
    this.renderer.render(full);
    if (this.fx) this.fx.frame();
    if (this.marksDirty) { this.marksDirty = false; this._renderGutter(); this._renderScrollbar(); this._renderSticky(); }
    else this._renderScrollbarThumb();
    if (this.agent) this.agent.frame();
    /* keep the hidden input at the cursor so IME candidate windows open there */
    var m = this.metrics, cur = term.buf.cursor;
    if (m) { var at = this.cellToOverlay(cur.x, cur.y); this.input.style.left = at.left + 'px'; this.input.style.top = at.top + 'px'; this.input.style.height = m.cellH + 'px'; }
    this.emit('frame');
  };
  /* the focused cursor blinks unless the program or the setting asks for a steady one, or motion is off */
  View.prototype._cursorBlinks = function () {
    var term = this.term, cs = term.cursorStyle || this.opts.cursor;
    var blink = term.modes.cursorBlink !== null && term.modes.cursorBlink !== undefined ? term.modes.cursorBlink : cs.blink;
    return !!blink && !motionOff();
  };
  View.prototype.cursorVisible = function () {
    if (!this.term.modes.cursorVisible) return false;
    if (!this.focused || !this._cursorBlinks()) return true;
    return this.blinkOn;
  };
  /* the blink's phase is _blinkPhase. Stepped looks show it through blinkOn; the eased looks keep blinkOn true and
     fade cursorAlpha toward it */
  View.prototype._blinkTick = function () {
    if (!this.focused || !this.visible) return;
    var fx = this.appearance && this.appearance.effects;
    var eased = !!(fx && fx.blink === 'eased') && !motionOff();
    var phase = this._blinkPhase !== false;
    /* the cursor rests on when it does not blink, and blinking stops after 15 s without input */
    var next = !this._cursorBlinks() || T.util.now() - this.lastInput > 15000 ? true : !phase;
    this._blinkPhase = next;
    if (!eased) {
      if (next === this.blinkOn && (this.cursorAlpha === undefined || this.cursorAlpha === 1)) return;
      this._fadeGen = (this._fadeGen || 0) + 1; /* a fade left over from an eased look stops where it is */
      this.blinkOn = next; this.cursorAlpha = 1;
      this.schedule();
      return;
    }
    if (next === phase && this.blinkOn) return;
    /* Friendly and Glass: the cursor fades over 150 ms instead of stepping (five frames per phase) */
    var self = this, to = next ? 1 : 0, t0 = T.util.now(), gen = this._fadeGen = (this._fadeGen || 0) + 1;
    var from = this.blinkOn ? (this.cursorAlpha === undefined ? 1 : this.cursorAlpha) : 0;
    var step = function () {
      if (gen !== self._fadeGen) return; /* input, focus or a later phase took over */
      var k = Math.min(1, (T.util.now() - t0) / 150);
      self.cursorAlpha = from + (to - from) * (k * k * (3 - 2 * k));
      self.schedule();
      if (k < 1) requestAnimationFrame(step);
    };
    this.blinkOn = true; /* stay drawable while fading; alpha carries the phase */
    requestAnimationFrame(step);
  };
  /* input and focus show the cursor at once and start its blink over */
  View.prototype._wakeCursor = function () {
    this.lastInput = T.util.now();
    this.blinkOn = true; this._blinkPhase = true; this.cursorAlpha = 1;
    this._fadeGen = (this._fadeGen || 0) + 1;
  };
  View.prototype.overlayKey = function (abs, y, line) {
    var k = '';
    var sel = this.selectionSpan(abs); if (sel) k += 's' + sel[0] + '-' + sel[1];
    var f = this.findSpans(abs); if (f) k += 'f' + f.map(function (m) { return m.x0 + ':' + m.x1 + (m.current ? '*' : ''); }).join(',');
    var b = this.term.buf;
    if (abs === b.abs(b.cursor.y)) k += 'c' + b.cursor.x + (this.cursorVisible() ? 1 : 0) + (this.focused ? 'f' : '') + (this.secretInput ? 'L' : '') + Math.round((this.cursorAlpha === undefined ? 1 : this.cursorAlpha) * 8) + JSON.stringify(this.term.cursorStyle || this.opts.cursor);
    if (this.hoverRange && this.hoverRange.abs === abs) k += 'h' + this.hoverRange.x0;
    if (this.hoverLinkId) k += 'l' + this.hoverLinkId;
    return k;
  };
  View.prototype.selectionSpan = function (abs) { return this.selection ? this.selection.span(abs, this.term.cols) : null; };
  View.prototype.findSpans = function (abs) { return this.findState ? this.findState.spans(abs) : null; };
  View.prototype.isHoverLink = function (abs, x, linkId) {
    if (linkId && linkId === this.hoverLinkId) return true;
    var h = this.hoverRange;
    return !!(h && h.abs === abs && x >= h.x0 && x < h.x1);
  };

  /* ---- header row and tab label (D12) ---- */
  View.prototype._cwd = function () {
    var sh = this.session.shell, inner = sh; while (inner && inner.child) inner = inner.child;
    return inner ? inner.short(inner.cwd) : (this.session.cwd || '~');
  };
  View.prototype._branch = function () {
    var sh = this.session.shell, inner = sh; while (inner && inner.child) inner = inner.child;
    if (!inner) return '';
    return inner.vfs && inner.vfs.gitBranch ? (inner.vfs.gitBranch(inner.cwd) || '') : (inner.cwd.indexOf('tastebook') >= 0 ? 'main' : '');
  };
  View.prototype._running = function () {
    var cmds = this.term.commands, c = cmds[cmds.length - 1];
    return c && c.state === 'running' ? c : null;
  };
  View.prototype._headerLeft = function () {
    var left = [{ id: 'cwd', text: this._cwd ? this._cwd() : '~', mono: true, title: 'Folder' }];
    var br = this._branch ? this._branch() : '';
    if (br) left.push({ id: 'branch', text: br, icon: 'git', title: 'Branch', priority: 1 });
    var run = this._running ? this._running() : null;
    if (run) left.push(this._runFact(run)); else this._runEl = null;
    return left;
  };
  /* the running command and its elapsed time m:ss. The host draws `el` in place of the text, so the time ticks in
     place and never ellipsizes with the command; a host that draws text and detail only (the harness's) gets detail */
  View.prototype._runFact = function (run) {
    var cmd = run.cmdline.length > 48 ? run.cmdline.slice(0, 47) + '…' : run.cmdline, r = this._runEl;
    if (!r || r._cmd !== cmd) {
      r = this._runEl = el('span', 'pmt-hrow-run'); r._cmd = cmd;
      r.appendChild(el('span', 'pmw-hfact-t')).textContent = cmd;
      r._t = r.appendChild(el('span', 'pmt-hrow-elapsed'));
    }
    var t = T.util.fmtElapsed(Date.now() - run.start);
    r._t.textContent = t;
    return { id: 'run', text: cmd, detail: t, el: r, icon: 'clock', title: 'Running: ' + run.cmdline, priority: 2 };
  };
  View.prototype._headerActions = function () {
    var self = this, api = this.api;
    return [
      { id: 'find', label: 'Find', icon: 'search', shortcut: T.keys.label('find'), run: function () { self.openFind(); } },
      { id: 'split', label: 'Split', icon: 'splitRight', shortcut: T.keys.label('split'), run: function () { self.split(); } },
      { id: 'max', label: api && api.isMaximized && api.isMaximized() ? 'Restore' : 'Maximize', icon: api && api.isMaximized && api.isMaximized() ? 'restore' : 'maximize', run: function () { self.toggleMaximize(); } },
      /* through api.menu (the contract's item shape: sub menus, shortcuts); the row's own `menu` takes raw rows */
      { id: 'more', label: 'More', icon: 'more', run: function (e, b) { self.menu(self.moreMenu(), b || e, { align: 'end', width: 260 }); } }
    ];
  };
  View.prototype._updateHeader = function () {
    if (!this.hrow) return;
    var left = this._headerLeft();
    /* once the host shows our element its time updates in place, so the ticking time leaves the signature and the row
       is rebuilt only when something else in it changes */
    var live = !!(this._runEl && this._runEl.isConnected);
    var sig = JSON.stringify(left, function (k, v) { return k === 'el' || (live && k === 'detail') ? undefined : v; });
    if (sig !== this._hsig) { this._hsig = sig; this.hrow.set({ left: left }); }
  };
  View.prototype._updateLabel = function () {
    if (!this.api || !this.api.update) return;
    var fgName = this.session.foreground();
    var proc = fgName || (this.session.shell && this.session.shell.child ? 'ssh' : this.session.profile.shell);
    var folder = base(this._cwd());
    var label = proc + ' · ' + folder;
    var last = this.lastExit;
    var title = label + (this.session.state === 'ended' ? ' (ended)' : '') + (this.agentName ? ' · ' + this.agentName + ' is driving' : '');
    var upd = { label: label, title: title, busy: !!fgName, exitCode: last && last !== 0 ? last : null };
    var sig = JSON.stringify(upd);
    if (sig !== this._lsig) { this._lsig = sig; this.api.update(upd); }
  };
  View.prototype.setAgent = function (name) {
    this.agentName = name || null;
    if (this.api && this.api.update) this.api.update({ agent: this.agentName });
    this._lsig = ''; this._updateLabel();
  };

  View.prototype._onCommand = function (e) {
    var c = e.cmd;
    if (e.type === 'end' && c && !c.empty) {
      this.lastExit = c.exit;
      this._updateLabel();
      var dur = c.end - c.start;
      if (c.exit && c.exit !== 0) this.announce((c.cmdline || 'Command') + ' failed with exit code ' + c.exit);
      else if (dur > 10000 && !this.focused) this.announce((c.cmdline || 'Command') + ' finished');
      if (!this.focused && dur > 10000 && this.api && this.api.update) this.api.update({ attention: true });
    }
    if (e.type === 'exec') { this.lastExit = null; this._updateLabel(); }
    this.marksDirty = true;
    this._updateHeader();
    this.schedule();
  };

  /* ---- gutter: one glyph per prompt line (D13), never a stripe ---- */
  View.prototype._renderGutter = function () {
    var g = this.gutter, m = this.metrics, buf = this.term.buf, self = this;
    if (buf.isAlt) { g.innerHTML = ''; g.classList.add('pmt-gutter-alt'); return; }
    g.classList.remove('pmt-gutter-alt');
    var top = this.viewTop(), rows = buf.rows, html = [], cmds = this.term.commands;
    var py = this.gridTop || 0;
    this._gutterCmds = [];
    for (var i = cmds.length - 1; i >= 0; i--) {
      var c = cmds[i];
      if (!c.promptLine) continue;
      var abs = buf.absOf(c.promptLine);
      if (abs < 0) continue;
      if (abs < top - 1) break;
      if (abs >= top + rows) continue;
      if (c.empty && c.state === 'done') continue;
      var kind = c.state === 'running' ? 'run' : c.state === 'done' ? (c.exit === 0 ? 'ok' : c.exit === null ? 'idle' : 'fail') : 'idle';
      var agent = /^agent:/.test(c.by);
      var label = (c.cmdline ? c.cmdline : 'Prompt') + (kind === 'fail' ? ', exit ' + c.exit : kind === 'ok' ? ', exit 0' : kind === 'run' ? ', running' : c.indeterminate ? ', ended with the earlier session' : '') + (agent ? ', typed by ' + c.by.slice(6) : '');
      this._gutterCmds.push(c);
      html.push('<button type="button" class="pmt-mark pmt-mark-' + kind + (agent ? ' pmt-mark-agent' : '') + '" data-pmt-cmd="' + c.id + '" style="top:' + (py + (abs - top) * m.cellH) + 'px;height:' + m.cellH + 'px" aria-label="' + T.util.esc(label) + '" data-pm-hover-label="' + T.util.esc(label) + '">' + (agent ? SVG.agent : SVG[kind]) + '</button>');
    }
    g.innerHTML = html.join('');
    if (!g._bound) {
      g._bound = true;
      g.addEventListener('click', function (e) {
        var b = e.target.closest('.pmt-mark'); if (!b) return;
        var id = +b.getAttribute('data-pmt-cmd');
        var cmd = self.term.commands.find(function (c) { return c.id === id; });
        if (cmd) self.markMenu(cmd, b);
      });
    }
  };
  View.prototype.markMenu = function (cmd, anchor) {
    var self = this, out = this.term.commandOutput(cmd);
    var who = /^agent:/.test(cmd.by) ? cmd.by.slice(6) + ' typed this' : 'You typed this';
    /* a prompt still waiting for its command has nothing to copy or rerun yet */
    var waiting = cmd.state === 'prompt' || cmd.state === 'input', has = !!cmd.cmdline;
    /* an indeterminate command's end is only the last save before the page went away, so its time is a lower bound */
    var meta = waiting ? 'Waiting for a command' : cmd.state === 'running' ? 'Running · ' + who
      : (cmd.indeterminate ? 'Ended with the earlier session' : cmd.exit === 0 ? 'Exit 0' : cmd.exit === null ? 'Ended' : 'Exit ' + cmd.exit) +
        (cmd.end && cmd.start ? ' · ' + (cmd.indeterminate ? 'at least ' : '') + T.util.fmtElapsed(cmd.end - cmd.start) : '') + (has ? ' · ' + who : '');
    var items = [
      { id: 'meta', label: has ? cmd.cmdline : waiting ? 'This prompt' : '(empty)', detail: meta, disabled: true },
      '-',
      { id: 'copy-cmd', label: 'Copy command', disabled: !has, run: function () { self.copyText(cmd.cmdline); } },
      { id: 'copy-out', label: 'Copy output', disabled: !out, run: function () { self.copyText(out); } },
      { id: 'rerun', label: 'Rerun', disabled: !has || this.session.state !== 'running', run: function () { self.session.input(cmd.cmdline + '\r', 'user'); self.focus(); } },
      { id: 'insert', label: 'Insert command', detail: 'Without Enter', disabled: !has || this.session.state !== 'running', run: function () { self.session.input(cmd.cmdline, 'user'); self.focus(); } },
      { id: 'open-out', label: 'Open output in an editor tab', disabled: !out, run: function () { self.openOutput(cmd); } },
      { id: 'select', label: 'Select output', disabled: !out, run: function () { if (self.selectCommandOutput) self.selectCommandOutput(cmd); } }
    ];
    this.menu(items, anchor);
  };
  View.prototype.openOutput = function (cmd) {
    var text = this.term.commandOutput(cmd);
    var spec = { kind: 'editor', title: (cmd.cmdline || 'output') + ' output', text: text, language: 'text' };
    if (this.api && this.api.open) this.api.open(spec); else if (window.PM_HOME) window.PM_HOME.open(spec);
  };
  View.prototype.revealCommand = function (cmd) {
    var abs = this.term.primary.absOf(cmd.promptLine);
    if (abs >= 0) this.scrollTo(abs - 1);
  };
  View.prototype.jumpCommand = function (dir) {
    var buf = this.term.primary, top = this.viewTop(), list = this.term.commands.filter(function (c) { return c.promptLine && !(c.empty && c.state === 'done'); });
    var target = null, i, abs;
    if (dir < 0) { for (i = list.length - 1; i >= 0; i--) { abs = buf.absOf(list[i].promptLine); if (abs >= 0 && abs < top) { target = list[i]; break; } } }
    else { for (i = 0; i < list.length; i++) { abs = buf.absOf(list[i].promptLine); if (abs > top) { target = list[i]; break; } } }
    if (target) { this.scrollTo(buf.absOf(target.promptLine)); this.announce((target.cmdline || 'Prompt') + (target.exit ? ', exit ' + target.exit : '')); }
    else if (dir > 0) this.scrollTo(this.bottomAbs());
  };

  /* ---- sticky command header: the command whose output fills the top of the view ---- */
  View.prototype._renderSticky = function () {
    var buf = this.term.buf, top = this.viewTop(), s = this.sticky;
    var cmd = null;
    if (!buf.isAlt && this.opts.stickyHeader !== false) {
      var list = this.term.commands;
      for (var i = list.length - 1; i >= 0; i--) {
        var c = list[i]; if (!c.promptLine || !c.outputLine) continue;
        var a = buf.absOf(c.promptLine);
        if (a < 0) continue;
        if (a >= top) continue;            /* its prompt is still on screen: no sticky needed */
        var endA = c.endLine ? buf.absOf(c.endLine) - (c.endCol === 0 ? 1 : 0) : Infinity;
        if (endA >= top + 1) cmd = c;      /* its output still fills the top of the view */
        break;
      }
    }
    if (!cmd) { s.hidden = true; this.stickyCmd = null; return; }
    this.stickyCmd = cmd;
    var promptText = cmd.promptLine.text();
    s.hidden = false;
    s.innerHTML = '<span class="pmt-sticky-text">' + T.util.esc(promptText) + '</span><span class="pmt-sticky-meta">' + (cmd.state === 'running' ? 'Running' : cmd.exit === 0 ? 'Exit 0' : cmd.indeterminate ? 'Ended with the earlier session' : cmd.exit === null ? '' : 'Exit ' + cmd.exit) + '</span>';
    s.setAttribute('aria-label', 'Jump to command: ' + (cmd.cmdline || promptText));
    this._placeSticky();
  };
  /* Full CRT draws a bezel and bends the screen inside it: the header then sits inside the glass, from the top of the
     bent screen, instead of flat across the bezel. The shader's forward map (source to screen) places it */
  View.prototype._placeSticky = function () {
    var s = this.sticky, fx = this.fx, m = this.metrics;
    var gl = fx && fx.active && fx.cfg && fx.cfg.crt && fx.gl && fx.gl.unmapPointer ? fx.gl : null;
    var w = m ? this.term.cols * m.cellW : 0, h = m ? this.term.rows * m.cellH : 0, band = m ? m.cellH + 8 : 0;
    var top = gl && w && h ? gl.unmapPointer(w / 2, 0.5, w, h) : null;
    var lt = top && gl.unmapPointer(0.5, band, w, h), rt = top && gl.unmapPointer(w - 0.5, band, w, h);
    if (!top || !lt || !rt) { s.style.top = s.style.left = s.style.width = s.style.paddingLeft = ''; return; }
    s.style.top = (this.gridTop + top.y) + 'px';
    s.style.left = (this.gridLeft + lt.x) + 'px';
    s.style.width = (rt.x - lt.x) + 'px';
    s.style.paddingLeft = '0px'; /* the text starts where the bent first column does */
  };

  /* ---- scrollbar in the editor minimap's language: thumb box, heat-strip marks ---- */
  View.prototype._renderScrollbar = function () {
    var sb = this.sb, c = this.sbMarks, buf = this.term.buf;
    var h = sb.clientHeight, w = sb.clientWidth;
    if (!h) return;
    var dpr = window.devicePixelRatio || 1;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    var ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height);
    var total = buf.lines.length, first = buf.trimmed;
    sb.classList.toggle('pmt-sb-empty', total <= buf.rows || buf.isAlt);
    if (!buf.isAlt) {
      var cs = getComputedStyle(this.root);
      var colCmd = cs.getPropertyValue('--pmt-mark-cmd').trim() || 'rgba(128,128,128,.7)';
      var colBad = cs.getPropertyValue('--pmt-bad').trim() || '#e06c75';
      var colFind = cs.getPropertyValue('--pmt-warn').trim() || '#d19a66';
      var colCur = cs.getPropertyValue('--pmt-accent').trim() || '#61afef';
      var self = this;
      var y = function (abs) { return Math.round(((abs - first) / Math.max(1, total)) * c.height); };
      var markH = Math.max(2, Math.round(2 * dpr));
      this.term.commands.forEach(function (cmd) {
        if (!cmd.promptLine || (cmd.empty && cmd.state === 'done')) return;
        var a = buf.absOf(cmd.promptLine); if (a < 0) return;
        ctx.fillStyle = cmd.exit && cmd.exit !== 0 ? colBad : colCmd;
        var wide = cmd.exit && cmd.exit !== 0 ? 1 : 0.55;
        ctx.fillRect(Math.round(c.width * (1 - wide)), y(a), Math.round(c.width * wide), markH);
      });
      if (this.findState) this.findState.allMatches().forEach(function (mm) {
        ctx.fillStyle = mm.current ? colCur : colFind;
        ctx.fillRect(0, y(mm.abs), Math.round(c.width * 0.45), markH);
      });
      void self;
    }
    this._renderScrollbarThumb();
  };
  View.prototype._renderScrollbarThumb = function () {
    var buf = this.term.buf, h = this.sb.clientHeight; if (!h) return;
    var total = Math.max(buf.lines.length, 1), top = this.viewTop() - buf.trimmed;
    var th = Math.max(18, Math.round(h * buf.rows / total)), ty = Math.round((h - th) * (total > buf.rows ? top / (total - buf.rows) : 1));
    this.sbThumb.style.height = th + 'px'; this.sbThumb.style.transform = 'translateY(' + ty + 'px)';
  };
  View.prototype._bindScrollbar = function () {
    var self = this, sb = this.sb, drag = null;
    sb.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var r = sb.getBoundingClientRect(), buf = self.term.buf, total = buf.lines.length;
      var thumbR = self.sbThumb.getBoundingClientRect();
      if (e.clientY >= thumbR.top && e.clientY <= thumbR.bottom) drag = { y: e.clientY, top: self.viewTop() };
      else { var frac = (e.clientY - r.top) / r.height; self.scrollTo(buf.trimmed + frac * total - buf.rows / 2); drag = { y: e.clientY, top: self.viewTop() }; }
      sb.setPointerCapture(e.pointerId);
      sb.classList.add('pmt-sb-drag');
    });
    sb.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var r = sb.getBoundingClientRect(), buf = self.term.buf, total = buf.lines.length;
      self.scrollTo(drag.top + (e.clientY - drag.y) / r.height * total);
    });
    sb.addEventListener('pointerup', function () { drag = null; sb.classList.remove('pmt-sb-drag'); });
  };

  /* ---- input ---- */
  View.prototype._bindInput = function () {
    var self = this, inp = this.input, composing = false;
    inp.addEventListener('focus', function () { self._setFocus(true); });
    inp.addEventListener('blur', function () { self._setFocus(false); });
    inp.addEventListener('compositionstart', function () { composing = true; self.root.classList.add('pmt-composing'); });
    inp.addEventListener('compositionend', function (e) { composing = false; self.root.classList.remove('pmt-composing'); if (e.data) self.type(e.data); inp.value = ''; });
    inp.addEventListener('input', function (e) {
      if (composing) { self._showPreedit(inp.value); return; }
      if (e.inputType === 'insertText' && e.data) { self.type(e.data); }
      inp.value = '';
    });
    inp.addEventListener('paste', function (e) { e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData('text'); self.paste(t); });
    inp.addEventListener('keydown', function (e) {
      if (composing || e.isComposing) return;
      self._wakeCursor();
      if (self.handleShortcut(e)) { e.preventDefault(); e.stopPropagation(); return; }
      var bytes = T.Input.encodeKey(e, self.term, self.opts);
      if (bytes === null) return;
      /* printable keys without modifiers come through 'input' so IME and dead keys work */
      if (bytes.length === 1 && bytes >= ' ' && !e.ctrlKey && !e.altKey && !e.metaKey) return;
      e.preventDefault();
      self.type(bytes);
    });
    this.screen.addEventListener('focus', function () { inp.focus({ preventScroll: true }); });
  };
  View.prototype._showPreedit = function (text) {
    var p = this.preedit || (this.preedit = el('div', 'pmt-preedit'));
    if (!p.parentNode) this.overlays.appendChild(p);
    var m = this.metrics, cur = this.term.buf.cursor, at = this.cellToOverlay(cur.x, cur.y);
    p.textContent = text;
    p.style.left = at.left + 'px'; p.style.top = at.top + 'px';
    p.style.height = m.cellH + 'px';
    p.hidden = !text;
  };
  View.prototype.type = function (bytes) {
    if (this.preedit) this.preedit.hidden = true;
    if (this.session.state !== 'running') { if (/\r/.test(bytes) && this.endedRestart) this.endedRestart(); return; }
    if (!this.followBottom && !this.term.buf.isAlt) this.scrollTo(this.bottomAbs());
    if (this.selection && !this.selection.copyMode) this.clearSelection();
    var r = this.session.input(bytes, 'user');
    if (!r.ok) this.announce(r.reason === 'ended' ? 'The session has ended' : 'Input was not accepted');
  };
  View.prototype.paste = function (text) {
    if (!text) return;
    var self = this;
    var lines = text.replace(/\r\n?/g, '\n').split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    if (lines.length > 1 && !this.term.modes.bracketedPaste) {
      /* multi-line paste without bracketed paste would run each line: ask first, inline, never a modal */
      this.notice({ id: 'paste', tone: 'warn', focus: true, text: 'Paste ' + lines.length + ' lines? Each line will run as a command.',
        actions: [{ label: 'Paste', primary: true, run: function () { self.session.input(T.Input.encodePaste(text, self.term), 'user'); self.focus(); } },
          { label: 'Paste as one line', run: function () { self.session.input(T.Input.encodePaste(lines.join(' '), self.term), 'user'); self.focus(); } },
          { label: 'Cancel', run: function () { self.focus(); } }] });
      return;
    }
    this.session.input(T.Input.encodePaste(text, this.term), 'user');
  };
  View.prototype._setFocus = function (on) {
    if (this.focused === on) return;
    this.focused = on;
    this.term.focused = on;
    this.root.classList.toggle('pmt-focused', on);
    var seq = T.Input.focus(on, this.term);
    if (seq && this.session.state === 'running' && this.session.shell) this.session.shell.deliver(seq, 'terminal');
    if (on && this.api && this.api.update) this.api.update({ attention: false });
    this._wakeCursor();
    this.schedule(true);
    this.emit('focus', on);
  };
  View.prototype.focus = function () { this.input.focus({ preventScroll: true }); };

  /* terminal-scoped shortcuts (T.keys has the map) */
  View.prototype.handleShortcut = function (e) {
    var k = T.keys.match(e);
    if (!k) return false;
    switch (k) {
      case 'find': this.openFind(); return true;
      case 'copy': if (this.selection) { this.copySelection(); return true; } return false;
      case 'paste': if (navigator.clipboard && navigator.clipboard.readText) { var self = this; navigator.clipboard.readText().then(function (t) { self.paste(t); }).catch(function () {}); return true; } return false;
      case 'prevCommand': this.jumpCommand(-1); return true;
      case 'nextCommand': this.jumpCommand(1); return true;
      case 'pageUp': this.scrollBy(-this.term.rows + 1); return true;
      case 'pageDown': this.scrollBy(this.term.rows - 1); return true;
      case 'top': this.scrollTo(this.topAbs()); return true;
      case 'bottom': this.scrollTo(this.bottomAbs()); return true;
      case 'copyMode': if (this.startCopyMode) this.startCopyMode(); return true;
      case 'quickSelect': if (this.startHints) this.startHints(); return true;
      case 'a11y': this.openA11y(); return true;
      case 'zoomIn': this.zoom(1); return true;
      case 'zoomOut': this.zoom(-1); return true;
      case 'zoomReset': this.zoom(0); return true;
      case 'clear': this.clearScreen(); return true;
      case 'split': this.split(); return true;
      case 'selectAll': if (this.selectAll) this.selectAll(); return true;
    }
    return false;
  };
  View.prototype.wantsKey = function (e) {
    /* the terminal keeps the shell's keys (Ctrl+W, Ctrl+K, Ctrl+T ...) and its own shortcuts, and gives the host back
       its navigation keys (CONTRACT.md section 9) */
    var k = e.key, ctrl = e.ctrlKey, alt = e.altKey, sh = e.shiftKey;
    if (T.keys.match(e)) return true;
    var digit = /^Digit[1-9]$/.test(e.code || '') || /^[1-9]$/.test(k);
    var arrow = /^Arrow(Up|Down|Left|Right)$/.test(k);
    var backtick = e.code === 'Backquote' || k === '`' || k === '~';
    if (alt && !ctrl && (digit || arrow)) return false;                         /* Alt(+Shift)+1..9, Alt(+Shift)+arrows */
    if (alt && !ctrl && (k === 't' || k === 'T' || k === 'w' || k === 'W' || backtick)) return false; /* browser stand-ins */
    if ((ctrl || alt) && (k === 'PageUp' || k === 'PageDown')) return false;     /* Ctrl(+Shift)+PgUp/PgDn; Alt+PgUp/PgDn in a browser */
    /* Ctrl(+Shift)+\\ split; AltGr (Windows reports it as Ctrl+Alt) types \\ and | on German layouts, so it stays here */
    var altGr = (e.getModifierState && e.getModifierState('AltGraph')) || (alt && ctrl);
    if (ctrl && !altGr && (k === '\\' || k === '|' || e.code === 'Backslash')) return false;
    if (sh && k === 'Escape') return false;                                      /* maximize / restore */
    if (ctrl && sh && (k === ' ' || e.code === 'Space' || backtick)) return false; /* "+" menu, new terminal */
    if (ctrl && k === 'Tab') return false;
    if (ctrl && !e.metaKey) return true;                                         /* every other Ctrl+key is the shell's */
    return false;
  };
  View.prototype.zoom = function (d) {
    var font = this.appearance.font;
    var base0 = this._baseSize || (this._baseSize = font.size);
    var size = d === 0 ? base0 : T.util.clamp(font.size + d, 8, 32);
    if (T.Appearance && T.Appearance.setTabFont) T.Appearance.setTabFont(this, { size: size });
    else { font.size = size; this.applyAppearance(this.appearance); }
    this.announce('Font size ' + size);
  };
  View.prototype.clearScreen = function () {
    var term = this.term;
    term.write('\x1b[H\x1b[2J\x1b[3J');
    if (this.session.shell && this.session.shell.ed) this.session.shell.ed.redrawPrompt(), this.session.shell.ed.refresh();
    this.scrollTo(this.bottomAbs());
  };

  /* ---- mouse ---- */
  View.prototype._bindMouse = function () {
    var self = this, scr = this.screen;
    scr.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (!e.deltaY) return; /* a sideways swipe is not a vertical scroll */
      /* trackpads send many small pixel deltas: the remainder carries over between events, so a swipe moves as many
         lines as the fingers travelled instead of a line per event */
      var term = self.term, cellH = self.metrics ? self.metrics.cellH : 17;
      var px = e.deltaMode === 1 ? e.deltaY * cellH : e.deltaMode === 2 ? e.deltaY * cellH * term.rows : e.deltaY;
      if (self._wheelAcc && (self._wheelAcc < 0) !== (px < 0)) self._wheelAcc = 0; /* a change of direction starts over */
      self._wheelAcc = (self._wheelAcc || 0) + px;
      var lines = Math.trunc(self._wheelAcc / cellH);
      if (!lines) return;
      self._wheelAcc -= lines * cellH;
      if (term.modes.mouse && !e.shiftKey) {
        var cell = self.cellFromPoint(e.clientX, e.clientY); if (!cell) return;
        var seq = T.Input.encodeMouse('wheel', lines < 0 ? 64 : 65, T.Input.modBits(e), cell.col, cell.row, cell.px, cell.py, term);
        if (seq) for (var i = 0; i < Math.min(Math.abs(lines), 5); i++) self.session.input(seq, 'user');
        return;
      }
      if (term.buf.isAlt) {
        /* alternate scroll: arrows for full-screen programs without mouse reporting */
        var key = (term.modes.appCursor ? '\x1bO' : '\x1b[') + (lines < 0 ? 'A' : 'B');
        for (var j = 0; j < Math.min(Math.abs(lines), 5); j++) self.session.input(key, 'user');
        return;
      }
      self.wheelScroll(lines);
    }, { passive: false });
    if (T.Select && T.Select.bind) T.Select.bind(this);
    else scr.addEventListener('mousedown', function () { self.focus(); });
  };

  /* ---- notices: inline rows above the screen, never modals ---- */
  View.prototype.notice = function (n) {
    var self = this;
    this.dismissNotice(n.id);
    var row = el('div', 'pmt-notice pmt-notice-' + (n.tone || 'info'));
    row.setAttribute('data-pmt-notice', n.id);
    row.setAttribute('role', n.tone === 'warn' ? 'alert' : 'status');
    var text = el('span', 'pmt-notice-text'); text.textContent = n.text; row.appendChild(text);
    var acts = el('span', 'pmt-notice-actions');
    (n.actions || []).forEach(function (a) {
      var b = el('button', 'pmt-textbtn' + (a.primary ? ' pmt-textbtn-primary' : '')); b.type = 'button'; b.textContent = a.label;
      b.addEventListener('click', function () { if (!a.keep) self.dismissNotice(n.id); a.run && a.run(); });
      acts.appendChild(b);
    });
    row.appendChild(acts);
    this.noticeEl.appendChild(row);
    this.layoutSoon();
    /* a notice takes the focus only when the caller says a user action caused it (a paste, closing the tab): program
       output and agents never pull the keyboard away from what the user is typing, here or elsewhere (D8) */
    var first = acts.querySelector('button'); if (first && n.focus === true) first.focus({ preventScroll: true });
    return row;
  };
  View.prototype.dismissNotice = function (id) {
    var old = this.noticeEl.querySelector('[data-pmt-notice="' + id + '"]');
    if (old) { old.remove(); this.layoutSoon(); }
  };
  View.prototype.layoutSoon = function () { var self = this; requestAnimationFrame(function () { self.layout(); }); };

  View.prototype._ended = function (code) {
    var self = this;
    this.root.classList.add('pmt-ended');
    this._updateLabel();
    this.notice({ id: 'ended', tone: 'info', focus: false, text: 'Session ended' + (code ? ' with exit code ' + code : ''),
      actions: [{ label: 'Restart', primary: true, run: function () { self.restart(); } }, { label: 'Close tab', run: function () { if (self.api && self.api.close) self.api.close(); } }] });
    this.endedRestart = function () { self.restart(); };
    this.announce('Session ended');
  };
  View.prototype.restart = function () { this.emit('restart'); };

  View.prototype.announce = function (text) {
    if (this.api && this.api.announce) this.api.announce(text);
    else { this.live.textContent = ''; var l = this.live; setTimeout(function () { l.textContent = text; }, 30); }
  };
  View.prototype.copyText = function (t) {
    if (!t) return;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(function () {});
    this.announce('Copied');
  };
  View.prototype.menu = function (items, anchor, o) {
    if (this.api && this.api.menu) return this.api.menu(items, anchor, o);
    console.warn('[pmt] no host menu');
  };
  View.prototype.split = function () {
    var spec = { kind: 'terminal', profile: this.session.profile.id, cwd: this.session.shell ? this.session.shell.cwd : this.session.cwd };
    if (this.api && this.api.split) this.api.split('auto', spec);
  };
  View.prototype.toggleMaximize = function () {
    if (this.api && this.api.toggleMaximize) this.api.toggleMaximize();
    if (this.hrow) {
      var max = this.api.isMaximized && this.api.isMaximized();
      this.hrow.setAction('max', { label: max ? 'Restore' : 'Maximize', icon: max ? 'restore' : 'maximize' });
    }
  };

  /* ---- bell, progress, notifications (D13, D16) ---- */
  View.prototype.bell = function () {
    var now = T.util.now();
    if (this._lastBell && now - this._lastBell < 1000) return; /* at most one visual bell a second (WCAG 2.3.1) */
    this._lastBell = now;
    var r = this.root;
    r.classList.remove('pmt-bell'); void r.offsetWidth; r.classList.add('pmt-bell');
    setTimeout(function () { r.classList.remove('pmt-bell'); }, 420);
    if (!this.focused && this.api && this.api.update) this.api.update({ attention: true });
  };
  View.prototype.setProgress = function (p) {
    var e = this.progressEl;
    e.hidden = !p.state;
    e.setAttribute('data-pmt-state', ['none', 'value', 'error', 'indeterminate', 'paused'][p.state] || 'none');
    e.style.setProperty('--pmt-progress', (p.state === 3 ? 100 : p.value) + '%');
    e.setAttribute('role', 'progressbar');
    e.setAttribute('aria-valuenow', String(p.value));
    e.setAttribute('aria-label', 'Progress');
  };
  View.prototype.notify = function (n) {
    this.announce((n.title ? n.title + ': ' : '') + n.body);
    if (!this.focused && this.api && this.api.update) this.api.update({ attention: true });
  };

  /* ---- accessible buffer view (D13): the scrollback as plain text with commands as headings ---- */
  View.prototype.openA11y = function () {
    var self = this;
    if (this.a11y) { this.a11y.remove(); this.a11y = null; this.focus(); return; }
    var pane = el('div', 'pmt-a11y');
    pane.setAttribute('role', 'document');
    pane.setAttribute('aria-label', 'Terminal buffer, plain text');
    pane.tabIndex = -1;
    var head = el('div', 'pmt-a11y-head');
    head.innerHTML = '<span>Plain-text buffer</span>';
    var close = el('button', 'pmt-textbtn'); close.type = 'button'; close.textContent = 'Back to terminal';
    close.addEventListener('click', function () { self.openA11y(); });
    head.appendChild(close);
    var bodyEl = el('div', 'pmt-a11y-body');
    var buf = this.term.primary, html = [], cmds = this.term.commands, ci = 0;
    var images = this.term.images;
    for (var i = 0; i < buf.lines.length; i++) {
      var line = buf.lines[i];
      if (line.mark && line.mark.kind === 'prompt' && line.mark.cmd && !line.mark.cmd.empty) {
        var c = line.mark.cmd;
        html.push('<h3 tabindex="-1">' + T.util.esc(c.cmdline || line.text()) + ' <span>' + (c.state === 'running' ? 'running' : c.exit === 0 ? 'exit 0' : c.indeterminate ? 'ended with the earlier session' : c.exit === null ? '' : 'exit ' + c.exit + ', failed') + '</span></h3>');
        continue;
      }
      var t = line.text();
      var imgs = images && images.describeLine ? images.describeLine(line) : null;
      if (imgs) t += (t ? ' ' : '') + imgs;
      html.push('<div class="pmt-a11y-line">' + (t ? T.util.esc(t) : '&nbsp;') + '</div>');
    }
    void cmds; void ci;
    bodyEl.innerHTML = html.join('');
    pane.appendChild(head); pane.appendChild(bodyEl);
    pane.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.openA11y(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        var hs = [].slice.call(bodyEl.querySelectorAll('h3')), cur = document.activeElement, idx = hs.indexOf(cur);
        var next = hs[e.key === 'ArrowUp' ? (idx < 0 ? hs.length - 1 : idx - 1) : idx + 1];
        if (next) next.focus();
      }
    });
    this.root.appendChild(pane);
    this.a11y = pane;
    bodyEl.scrollTop = bodyEl.scrollHeight;
    pane.focus();
    this.announce('Plain-text buffer. Ctrl+Up and Ctrl+Down move between commands. Escape returns to the terminal.');
  };

  /* ---- lifecycle from the host ---- */
  View.prototype.onResize = function () {
    this.layout();
    /* the host may have maximized or restored the panel itself (its menu, a key): keep the action's label true */
    if (this.hrow && this.api && this.api.isMaximized) {
      var max = !!this.api.isMaximized();
      if (max !== this._max) { this._max = max; this.hrow.setAction('max', { label: max ? 'Restore' : 'Maximize', icon: max ? 'restore' : 'maximize' }); }
    }
  };
  /* image animation runs only while the terminal shows (SPEC section 7) */
  View.prototype.onShow = function () { this.visible = true; if (this.term.images) this.term.images.pause(false); this.layout(); this.schedule(true); if (this.fx) this.fx.visible(true); };
  View.prototype.onHide = function () { this.visible = false; if (this.term.images) this.term.images.pause(true); if (this.fx) this.fx.visible(false); };
  View.prototype.onLook = function () {
    var h = document.documentElement;
    /* the resolved Reduced Motion flag too: the system setting can change with no attribute changing */
    var lk = this.api && this.api.look ? Object.assign(T.look(), this.api.look()) : T.look();
    var sig = [h.getAttribute('data-theme'), h.getAttribute('data-o55-nier'), h.getAttribute('data-o55-nier-parts'), h.getAttribute('data-motion'), lk.reduced ? 'r' : ''].join('|');
    if (sig === this._lookSig) return;
    this._lookSig = sig;
    if (T.Appearance) this.applyAppearance(T.Appearance.resolve(this));
    else this.applyAppearance(this._fallbackAppearance());
  };
  View.prototype.setDimmed = function (on) { if (this.dimmed === on) return; this.dimmed = on; this.root.classList.toggle('pmt-inactive', on); this.schedule(true); };
  View.prototype.dispose = function () {
    /* out of the appearance registry, so a closed or restarted terminal is neither kept alive nor configured again;
       an open popover goes with its document listener, without taking the focus */
    this.visible = false;
    if (this.closeAppearance) this.closeAppearance(true);
    if (T.Appearance && T.Appearance.forget) T.Appearance.forget(this);
    this.disposers.forEach(function (d) { try { d(); } catch (e) {} });
    clearInterval(this.blinkTimer); clearInterval(this.clockTimer);
    if (this._dprOff) this._dprOff();
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.fx) { this.fx.dispose(); this.fx = null; }
    this.root.remove();
  };
})();
