/* T.FX: the effects policy for one terminal view (D16). It decides when T.FXGL and T.FXTrail run:
   - event-driven: the GL pass runs only after the grid repainted, or while something is animating;
   - only the focused, visible terminal animates; ambient motion (noise, flicker) runs at most 30 fps and stops 10 s
     after the last output or keystroke; burn-in and degauss run to completion then stop;
   - Reduced Motion turns off every moving part (trail, burn-in, noise, flicker, degauss, blink) and keeps the static
     looks (scanlines, glow, curvature, paper texture);
   - battery saver (when the browser reports it) and the no-GPU path keep only the static CSS fallbacks, and the
     Appearance popover says what could not be drawn ("effective" versus "requested"). */
(function () {
  var IDLE_MS = 10000, AMBIENT_MS = 1000 / 30;
  var gpu = null;          /* null unknown, true, false (shared across terminals) */
  var battery = { saver: false };
  try {
    if (navigator.getBattery) navigator.getBattery().then(function (b) {
      var upd = function () { battery.saver = !b.charging && b.level <= 0.2; };
      upd(); b.addEventListener('chargingchange', upd); b.addEventListener('levelchange', upd);
    }).catch(function () {});
  } catch (e) {}

  function Policy(view) {
    this.view = view; this.cfg = {}; this.gl = null; this.trail = null; this.active = false;
    this.lastActivity = T.util.now(); this.raf = 0; this.lastAmbient = 0; this.degaussAt = 0;
    this.lastCursor = null; this.effective = {};
    var self = this;
    view._on(view.term, 'dirty', function () { self.lastActivity = T.util.now(); });
    view.on('focus', function () { self.lastActivity = T.util.now(); self.kick(); });
  }
  Policy.prototype.configure = function (e) {
    this.cfg = e || {};
    var v = this.view, root = v.root, scr = v.screen;
    root.setAttribute('data-pmt-look', e.look || 'basic');
    root.setAttribute('data-pmt-focusfx', e.focus || 'line');
    root.setAttribute('data-pmt-bell', e.bell || 'marker');
    root.style.setProperty('--pmt-dim-amount', String(e.dim || 0));
    var reduced = !!e.reduced, saver = battery.saver;
    var wantGL = !e.off && ((e.scanlines && e.scanlines.on) || (e.glow && e.glow.on) || e.crt || (e.flicker && e.flicker.on));
    if (wantGL && gpu !== false && !this.gl) {
      this.gl = T.FXGL ? T.FXGL.create(v.fxCanvas, { onLost: function () {}, onRestored: function () {} }) : null;
      gpu = !!this.gl;
      if (this.gl) { var m = v.metrics; if (m) this.gl.resize(v.canvas.width, v.canvas.height, m.dpr); }
    }
    var wasActive = this.active;
    this.active = !!(wantGL && this.gl);
    if (wasActive !== this.active) v.renderer.invalidate();
    v.fxCanvas.hidden = !this.active;
    v.canvas.style.opacity = this.active ? '0' : '';
    /* CPU path (or no GL wanted): static fallbacks only */
    var cpuScan = wantGL && !this.active && e.scanlines && e.scanlines.on;
    var cpuGlow = wantGL && !this.active && e.glow && e.glow.on;
    scr.classList.toggle('pmt-fx-scan', !!cpuScan);
    scr.classList.toggle('pmt-fx-glow', !!cpuGlow);
    scr.classList.toggle('pmt-fx-paper', !!e.paper);
    root.style.setProperty('--pmt-glow-color', e.glowColor || '');
    this.effective = {
      gpu: this.active || (gpu === true),
      curvature: e.crt ? (this.active ? 'drawn' : 'not drawn: no GPU on this machine') : 'off',
      burnIn: e.burnIn && e.burnIn.on ? (this.active ? (reduced ? 'off: Reduced Motion' : 'drawn') : 'not drawn: no GPU') : 'off',
      noise: e.noise && e.noise.on ? (this.active ? 'drawn' : 'not drawn: no GPU') : 'off',
      motion: reduced ? 'Reduced Motion: nothing moves' : saver ? 'Battery saver: nothing moves' : 'on'
    };
    /* the trail canvas: composited by GL when active, shown directly otherwise */
    var style = reduced || saver ? 'off' : (e.trail || 'off');
    if (style !== 'off' && T.FXTrail && !this.trail) this.trail = T.FXTrail.create(v.trailCanvas);
    this.trailStyle = style;
    v.trailCanvas.hidden = style === 'off' || this.active;
    v.trailCanvas.style.mixBlendMode = this.trail && this.trail.blend === 'add' ? 'screen' : '';
    this.kick();
  };
  Policy.prototype.params = function (now) {
    var e = this.cfg, v = this.view, reduced = !!e.reduced || battery.saver;
    var moving = v.focused && v.visible && !reduced && now - this.lastActivity < IDLE_MS;
    var p = {
      scanlines: e.scanlines || { on: false }, glow: e.glow || { on: false },
      curvature: e.curvature || { on: false }, bezel: e.bezel || { on: false }, vignette: e.vignette || { on: false },
      burnIn: { on: !!(e.burnIn && e.burnIn.on) && !reduced, persistMs: e.burnIn ? e.burnIn.persistMs : 450 },
      noise: { on: !!(e.noise && e.noise.on) && moving, amount: e.noise ? e.noise.amount : 0 },
      flicker: { on: !!(e.flicker && e.flicker.on) && moving, amount: e.flicker ? Math.min(0.03, e.flicker.amount) : 0 },
      degauss: this.degaussAt && !reduced ? { startMs: this.degaussAt } : null,
      dim: 0
    };
    return p;
  };
  /* called by the view after each grid paint */
  Policy.prototype.frame = function () {
    var v = this.view, now = T.util.now();
    this._trackCursor(now);
    if (!this.active) { this._trailOnly(now); return; }
    var m = v.metrics;
    if (this.gl.lost) return;
    if (v.fxCanvas.width !== v.canvas.width || v.fxCanvas.height !== v.canvas.height) this.gl.resize(v.canvas.width, v.canvas.height, m.dpr);
    var changed = v.renderer.stats.frames !== this._frames; this._frames = v.renderer.stats.frames;
    var src = this.trail && this.trailStyle !== 'off' ? [v.canvas, { canvas: v.trailCanvas, blend: this.trail.blend }] : v.canvas;
    var trailMoving = this.trail && this.trailStyle !== 'off' ? this.trail.frame(this._stepTime(now)) : false;
    var p = this.params(now);
    this.gl.render(src, p, now, Array.isArray(src) ? [changed, true] : changed);
    this.lastParams = p;
    if (this.degaussAt && now - this.degaussAt > 650) this.degaussAt = 0;
    if (trailMoving || this.gl.animating(p, now)) this.kick(trailMoving || p.burnIn.on || p.degauss ? 0 : AMBIENT_MS);
  };
  Policy.prototype._trailOnly = function (now) {
    if (!this.trail || this.trailStyle === 'off') return;
    if (this.trail.frame(this._stepTime(now))) this.kick(0);
  };
  /* NieR motion is stepped: its trace advances in 35 ms steps instead of every frame */
  Policy.prototype._stepTime = function (now) { return this.cfg.look === 'nier' ? Math.floor(now / 35) * 35 : now; };
  Policy.prototype._trackCursor = function (now) {
    var v = this.view, cur = v.term.buf.cursor, m = v.metrics;
    if (!m || !this.trail || this.trailStyle === 'off' || !v.focused) { this.lastCursor = null; return; }
    var key = cur.x + ',' + cur.y;
    if (this.lastCursor && this.lastCursor.key !== key) {
      var from = { x: this.lastCursor.x * m.cellW, y: this.lastCursor.y * m.cellH, w: m.cellW, h: m.cellH };
      var to = { x: cur.x * m.cellW, y: cur.y * m.cellH, w: m.cellW, h: m.cellH };
      var color = v.theme ? T.color.toHex(v.term.dynamic.cursor !== null ? v.term.dynamic.cursor : v.theme.cursor) : '#ffffff';
      if (this.trail.jump(from, to, color, this.trailStyle, now)) this.kick(0);
    }
    if (!this.lastCursor || this.lastCursor.key !== key) this.lastCursor = { key: key, x: cur.x, y: cur.y };
  };
  /* request another frame (delay 0 = next animation frame) */
  Policy.prototype.kick = function (delay) {
    var self = this, v = this.view;
    if (!v.visible) return;
    if (this.raf) return;
    var go = function () { self.raf = 0; v.schedule(); };
    if (delay) { this.raf = setTimeout(function () { self.raf = 0; requestAnimationFrame(go); }, delay); }
    else this.raf = requestAnimationFrame(go);
  };
  Policy.prototype.degauss = function () {
    if (T.look().reduced) { this.view.announce('Degauss is off under Reduced Motion'); return; }
    if (!this.active) { this.view.announce('Degauss needs the GPU effects'); return; }
    this.degaussAt = T.util.now(); this.kick(0);
  };
  Policy.prototype.mapPointer = function (x, y, w, h) {
    if (this.active && this.cfg.crt) return this.gl.mapPointer(x, y, w, h);
    return { x: x, y: y };
  };
  Policy.prototype.visible = function (on) { if (on) this.kick(0); };
  Policy.prototype.dispose = function () {
    if (this.raf) { cancelAnimationFrame(this.raf); clearTimeout(this.raf); }
    if (this.gl) this.gl.dispose();
    if (this.trail && this.trail.clear) this.trail.clear();
  };

  T.FX = { attach: function (view) { return new Policy(view); }, gpu: function () { return gpu; }, battery: battery };
})();
