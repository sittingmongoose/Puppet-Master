/* T.Renderer: paints the visible rows of a terminal onto one canvas in the order the native Skia renderer uses:
   default background, images under cell backgrounds, cell backgrounds (with search and selection), images under
   text, text and procedural glyphs, decorations, cursor, images over text. Only rows whose content, overlays or
   cursor changed are repainted (per-row key = line id, line version and an overlay signature). */
(function () {
  var C = T.color, A = T.ATTR, CELL = T.CELL;
  var cssCache = new Map();
  function css(rgb) {
    var s = cssCache.get(rgb);
    if (!s) { s = C.toHex(rgb); if (cssCache.size > 2048) cssCache.clear(); cssCache.set(rgb, s); }
    return s;
  }

  function Renderer(view) {
    this.view = view;
    this.canvas = view.canvas;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.keys = [];
    this.pal = null;
    this.palKey = '';
    this.stats = { rows: 0, ms: 0, frames: 0 };
  }
  T.Renderer = Renderer;

  Renderer.prototype.invalidate = function () { this.keys = []; this.pal = null; };

  Renderer.prototype._palette = function () {
    var v = this.view, th = v.theme, term = v.term;
    var key = th.id + '|' + term.paletteOverride.size + '|' + (term._palGen || 0);
    if (this.pal && this.palKey === key) return this.pal;
    var p = new Uint32Array(th.palette);
    term.paletteOverride.forEach(function (rgb, i) { p[i] = rgb; });
    this.pal = p; this.palKey = key;
    return p;
  };

  Renderer.prototype.render = function (full) {
    var t0 = T.util.now();
    var v = this.view, term = v.term, buf = term.buf, m = v.metrics, th = v.theme;
    if (!m || !th) return 0;
    var ctx = this.ctx, rows = buf.rows, cols = buf.cols;
    var pal = this._palette();
    var top = v.viewTop(); /* absolute index of the first visible line */
    var curAbs = buf.abs(buf.cursor.y);
    var painted = 0;
    var imgGen = term.images ? term.images.gen : 0;
    if (imgGen !== this.imgGen) { full = true; this.imgGen = imgGen; }
    var frameKey = th.id + '|' + m.devW + 'x' + m.devH + '|' + v.focused + '|' + (v.opts.ligatures ? 1 : 0) + '|' + v.opts.minContrast + '|' + (term.modes.reverse ? 1 : 0) + '|' + (v.dimmed ? 1 : 0);
    if (frameKey !== this.frameKey) { full = true; this.frameKey = frameKey; }
    for (var y = 0; y < rows; y++) {
      var abs = top + y;
      var line = buf.lineAtAbs(abs);
      var ov = v.overlayKey(abs, y, line);
      var key = (line ? line.id + ':' + line.ver : 'x') + '|' + ov;
      if (!full && this.keys[y] === key) continue;
      this.keys[y] = key;
      this._row(ctx, y, abs, line, cols, m, th, pal, abs === curAbs && v.cursorVisible());
      painted++;
    }
    this.keys.length = rows;
    var dt = T.util.now() - t0;
    if (painted) { this.stats.rows = painted; this.stats.ms = dt; this.stats.frames++; this.stats.full = !!full; }
    return painted;
  };

  /* phosphor schemes map colours outside the 16 onto the tube by brightness, so 38;5;196 never paints red on green */
  function mono(rgb, th) {
    var L = Math.sqrt(C.lum(rgb));
    /* light grounds (parchment): darker colours become stronger ink; dark grounds: brighter colours become brighter */
    return C.mix(th.mono.lo, th.mono.hi, th.mono.light ? 0.35 + 0.65 * (1 - L) : 0.18 + 0.82 * L);
  }
  Renderer.prototype._fg = function (st, pal, th, term) {
    var c = st.fg, rgb;
    if (c === 0) rgb = term.dynamic.fg !== null ? term.dynamic.fg : th.fg;
    else if (c < 0x200) {
      var idx = c - 0x100;
      if ((st.flags & A.BOLD) && idx < 8 && this.view.opts.boldBright) idx += 8;
      rgb = pal[idx];
      if (th.mono && idx >= 16) rgb = mono(rgb, th);
    } else { rgb = c & 0xffffff; if (th.mono) rgb = mono(rgb, th); }
    return rgb;
  };
  Renderer.prototype._bg = function (st, pal, th, term) {
    var c = st.bg, rgb;
    if (c === 0) return -1;
    var bgMono = function (v) { var L = Math.sqrt(C.lum(v)); return C.mix(th.mono.lo, th.mono.hi, th.mono.light ? 0.6 * (1 - L) : 0.6 * L); };
    if (c < 0x200) { rgb = pal[c - 0x100]; if (th.mono && c - 0x100 >= 16) rgb = bgMono(rgb); return rgb; }
    rgb = c & 0xffffff;
    return th.mono ? bgMono(rgb) : rgb;
  };

  Renderer.prototype._row = function (ctx, y, abs, line, cols, m, th, pal, hasCursor) {
    var v = this.view, term = v.term, styles = term.styles;
    var W = m.devW, H = m.devH, y0 = y * H, x, i;
    var defBg = term.dynamic.bg !== null ? term.dynamic.bg : th.bg;
    var reverse = term.modes.reverse;
    var minC = v.opts.minContrast || 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y0, cols * W, H); ctx.clip();
    /* 1. default background: the screen body paints it (--pmt-bg), so the canvas stays transparent there. That keeps
       translucent (Glass) backgrounds single-layered and lets glow and effects act on glyphs only. */
    ctx.clearRect(0, y0, cols * W, H);
    if (reverse) { ctx.fillStyle = C.toHex(th.fg); ctx.fillRect(0, y0, cols * W, H); }
    else if (v.fx && v.fx.active) {
      /* the GPU effects see the whole screen (curvature, bezel and scanlines act on the background too) */
      var bgA = th.bgAlpha === undefined ? 1 : th.bgAlpha;
      if (bgA > 0) { ctx.fillStyle = C.css(defBg, bgA); ctx.fillRect(0, y0, cols * W, H); }
    }
    if (!line) { ctx.restore(); return; }
    var images = term.images;
    if (images) images.drawRow(ctx, abs, y0, 'under-bg', v);
    /* 2. cell backgrounds, search and selection */
    var sel = v.selectionSpan(abs);            /* [x0, x1) or null */
    var finds = v.findSpans(abs);              /* [{x0, x1, current}] */
    var runStart = 0, runColor = -2;
    function flush(xEnd) {
      if (runColor >= 0 && xEnd > runStart) { ctx.fillStyle = css(runColor); ctx.fillRect(runStart * W, y0, (xEnd - runStart) * W, H); }
    }
    var fgs = new Int32Array(cols), bgs = new Int32Array(cols);
    for (x = 0; x < cols; x++) {
      var st = styles.get(line.st[x]);
      var fg = this._fg(st, pal, th, term), bg = this._bg(st, pal, th, term);
      if (st.flags & A.INVERSE) { var tmp = bg < 0 ? defBg : bg; bg = fg; fg = tmp; }
      if (reverse) { var tmp2 = bg < 0 ? defBg : bg; bg = fg; fg = tmp2; }
      if (st.flags & A.DIM) fg = C.mix(fg, bg < 0 ? defBg : bg, 0.45);
      var hl = -1;
      if (finds) for (i = 0; i < finds.length; i++) if (x >= finds[i].x0 && x < finds[i].x1) { hl = finds[i].current ? th.searchCurrent : th.searchMatch; }
      if (sel && x >= sel[0] && x < sel[1]) { hl = th.selBg; if (th.selFg >= 0) fg = th.selFg; }
      if (hl >= 0) bg = hl;
      fgs[x] = fg; bgs[x] = bg;
      if (bg !== runColor) { flush(x); runStart = x; runColor = bg; }
    }
    flush(cols);
    if (finds) for (i = 0; i < finds.length; i++) if (finds[i].current) {
      /* the current match also gets a 1 px outline in the text colour (fills alone can sit too close together) */
      var lw = Math.max(1, Math.round(m.dpr));
      ctx.strokeStyle = css(term.dynamic.fg !== null ? term.dynamic.fg : th.fg); ctx.lineWidth = lw;
      ctx.strokeRect(finds[i].x0 * W + lw / 2, y0 + lw / 2, (finds[i].x1 - finds[i].x0) * W - lw, H - lw);
    }
    if (images) images.drawRow(ctx, abs, y0, 'under-text', v);
    /* 3. text */
    var lig = v.opts.ligatures && !m.letterSpacing;
    var curFont = '';
    ctx.textBaseline = 'alphabetic';
    var baseY = y0 + m.baseline;
    x = 0;
    while (x < cols) {
      var cp = line.cp[x], f = line.fl[x];
      if (f & CELL.SPACER || cp === 0 || cp === 32) { x++; continue; }
      var stx = styles.get(line.st[x]);
      if (stx.flags & A.INVISIBLE) { x++; continue; }
      var fgc = fgs[x], cellBg = bgs[x] < 0 ? defBg : bgs[x];
      if (cp === 0x10eeee) {
        if (images) images.drawPlaceholder(ctx, line, x, x * W, y0, W, H, stx, v);
        x++; continue;
      }
      if (T.Glyphs.has(cp)) {
        if (minC && !T.Glyphs.contrastExempt(cp)) fgc = C.ensure(fgc, cellBg, minC);
        ctx.fillStyle = css(fgc);
        T.Glyphs.draw(ctx, cp, x * W, y0, W, H);
        x++; continue;
      }
      var font = (stx.flags & A.BOLD) ? ((stx.flags & A.ITALIC) ? m.fontBoldItalic : m.fontBold) : ((stx.flags & A.ITALIC) ? m.fontItalic : m.font);
      if (font !== curFont) { ctx.font = font; curFont = font; }
      if (minC) fgc = C.ensure(fgc, cellBg, minC);
      ctx.fillStyle = css(fgc);
      if (f & CELL.GRAPHEME || f & CELL.WIDE || cp > 0xffff) {
        /* wide and clustered characters: one draw centred in their cells, squeezed if the fallback is wider */
        var s = line.chars(x), span = (f & CELL.WIDE) ? 2 : 1;
        var tw = ctx.measureText(s).width, room = span * W;
        if (tw > room * 1.02) {
          ctx.save(); ctx.translate(x * W, 0); ctx.scale(room / tw, 1); ctx.fillText(s, 0, baseY); ctx.restore();
        } else ctx.fillText(s, x * W + (room - tw) / 2, baseY);
        x += span; continue;
      }
      if (lig) {
        /* a run of same-style narrow cells in one call so the font's ligatures apply */
        var x1 = x + 1, str = String.fromCharCode(cp);
        while (x1 < cols) {
          var c2 = line.cp[x1], f2 = line.fl[x1];
          if (f2 || c2 === 0 || c2 > 0xffff || line.st[x1] !== line.st[x] || fgs[x1] !== fgs[x] || T.Glyphs.has(c2) || c2 === 0x10eeee) break;
          str += String.fromCharCode(c2); x1++;
        }
        ctx.fillText(str, x * W, baseY);
        x = x1; continue;
      }
      ctx.fillText(String.fromCharCode(cp), x * W, baseY);
      x++;
    }
    /* 4. decorations */
    for (x = 0; x < cols; x++) {
      var sd = styles.get(line.st[x]);
      var ulKind = (sd.flags & A.UL_MASK) >> A.UL_SHIFT;
      var hoverLink = v.isHoverLink(abs, x, sd.link);
      if (!ulKind && !(sd.flags & (A.STRIKE | A.OVERLINE)) && !hoverLink) continue;
      var x1d = x + 1;
      while (x1d < cols && line.st[x1d] === line.st[x] && v.isHoverLink(abs, x1d, sd.link) === hoverLink) x1d++;
      var color = sd.ul ? (sd.ul < 0x200 ? pal[sd.ul - 0x100] : sd.ul & 0xffffff) : fgs[x];
      if (sd.ul && th.mono && (sd.ul >= 0x200 || sd.ul - 0x100 >= 16)) color = mono(color, th);
      var thick = Math.max(1, Math.round(m.dpr));
      var uy = y0 + Math.min(H - thick, m.baseline + Math.max(thick, Math.round(m.descent * m.dpr * 0.45)));
      ctx.fillStyle = css(color); ctx.strokeStyle = css(color); ctx.lineWidth = thick;
      if (ulKind) this._underline(ctx, ulKind, x * W, (x1d - x) * W, uy, thick, W);
      else if (hoverLink) { ctx.fillStyle = css(th.link >= 0 ? th.link : fgs[x]); this._underline(ctx, 4, x * W, (x1d - x) * W, uy, thick, W); }
      if (sd.flags & A.STRIKE) ctx.fillRect(x * W, y0 + Math.round(m.baseline - m.ascent * m.dpr * 0.32), (x1d - x) * W, thick);
      if (sd.flags & A.OVERLINE) ctx.fillRect(x * W, y0, (x1d - x) * W, thick);
      x = x1d - 1;
    }
    /* 5. cursor */
    if (hasCursor) { this._cursor(ctx, line, y0, m, th, fgs, bgs, defBg); ctx.globalAlpha = 1; }
    if (images) images.drawRow(ctx, abs, y0, 'over-text', v);
    ctx.restore();
  };

  Renderer.prototype._underline = function (ctx, kind, x, w, y, t, cellW) {
    if (kind === 1) { ctx.fillRect(x, y, w, t); return; }
    if (kind === 2) { ctx.fillRect(x, y - t, w, t); ctx.fillRect(x, y + t, w, t); return; }
    if (kind === 3) {
      var amp = Math.max(1, t * 1.2), per = Math.max(4, cellW);
      ctx.beginPath();
      for (var i = 0; i <= w; i += 1) { var yy = y + Math.sin((x + i) / per * Math.PI * 2) * amp; if (i === 0) ctx.moveTo(x + i, yy); else ctx.lineTo(x + i, yy); }
      ctx.stroke(); return;
    }
    var on = kind === 4 ? t : t * 3, off = kind === 4 ? t : t * 2;
    for (var j = x; j < x + w; j += on + off) ctx.fillRect(j, y, Math.min(on, x + w - j), t);
  };

  Renderer.prototype._cursor = function (ctx, line, y0, m, th, fgs, bgs, defBg) {
    var v = this.view, term = v.term, cur = term.buf.cursor, W = m.devW, H = m.devH;
    var x = Math.min(cur.x, term.cols - 1), wide = line.fl[x] & CELL.WIDE ? 2 : 1;
    var cs = term.cursorStyle || v.opts.cursor;
    var shape = cs.shape || 'block';
    var color = term.dynamic.cursor !== null ? term.dynamic.cursor : th.cursor;
    var cx = x * W, cw = W * wide;
    var thick = Math.max(1, Math.round(m.dpr * (shape === 'bar' ? 2 : 2)));
    ctx.fillStyle = css(color);
    if (v.secretInput) { this._lock(ctx, cx, y0, W, H, color); return; }
    var alpha = v.focused && v.cursorAlpha !== undefined ? v.cursorAlpha : 1;
    if (alpha < 0.03) return;
    ctx.globalAlpha = alpha;
    if (!v.focused) {
      ctx.strokeStyle = css(color); ctx.lineWidth = Math.max(1, Math.round(m.dpr));
      var o = ctx.lineWidth / 2; ctx.strokeRect(cx + o, y0 + o, cw - ctx.lineWidth, H - ctx.lineWidth); return;
    }
    if (shape === 'bar') { ctx.fillRect(cx, y0, thick, H); return; }
    if (shape === 'underline') { ctx.fillRect(cx, y0 + H - thick, cw, thick); return; }
    ctx.fillRect(cx, y0, cw, H);
    /* the character under a block cursor in the cursor-text colour */
    var cp = line.cp[x];
    if (cp && cp !== 32) {
      var st = term.styles.get(line.st[x]);
      var tc = th.cursorText >= 0 ? th.cursorText : (bgs[x] < 0 ? defBg : bgs[x]);
      ctx.fillStyle = css(tc);
      if (T.Glyphs.has(cp)) { T.Glyphs.draw(ctx, cp, cx, y0, W, H); return; }
      ctx.font = (st.flags & A.BOLD) ? m.fontBold : m.font;
      ctx.fillText(line.chars(x), cx, y0 + m.baseline);
    }
  };
  Renderer.prototype._lock = function (ctx, x, y, w, h, color) {
    /* the cursor becomes a padlock while the program reads a secret (no echo) */
    var bw = Math.round(w * 0.8), bh = Math.round(h * 0.38), bx = x + Math.round((w - bw) / 2), by = y + Math.round(h * 0.5);
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = C.toHex(color); ctx.lineWidth = Math.max(1, Math.round(w / 7));
    ctx.beginPath(); ctx.arc(x + w / 2, by, bw * 0.32, Math.PI, 0); ctx.stroke();
  };
})();
