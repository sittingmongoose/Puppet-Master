/* The cell grid: lines of 4+4+1 bytes per cell plus an interned style table (the native core uses 8-byte cells and
   page-based scrollback; the shape is the same), buffers with scrollback, and reflow on resize. */
(function () {
  var WIDE = 1, SPACER = 2, GRAPHEME = 4, PROTECTED = 8;
  T.CELL = { WIDE: WIDE, SPACER: SPACER, GRAPHEME: GRAPHEME, PROTECTED: PROTECTED };
  T.ATTR = { BOLD: 1, DIM: 2, ITALIC: 4, UL_SHIFT: 3, UL_MASK: 0x38, BLINK: 0x40, INVERSE: 0x80, INVISIBLE: 0x100,
    STRIKE: 0x200, OVERLINE: 0x400 };

  /* ---- styles ---- */
  function StyleTable() {
    this.list = [{ fg: 0, bg: 0, ul: 0, flags: 0, link: 0 }];
    this.map = new Map([['0,0,0,0,0', 0]]);
  }
  StyleTable.prototype.id = function (s) {
    var key = s.fg + ',' + s.bg + ',' + s.ul + ',' + s.flags + ',' + s.link;
    var id = this.map.get(key);
    if (id !== undefined) return id;
    id = this.list.length;
    this.list.push({ fg: s.fg, bg: s.bg, ul: s.ul, flags: s.flags, link: s.link });
    this.map.set(key, id);
    return id;
  };
  StyleTable.prototype.get = function (id) { return this.list[id] || this.list[0]; };
  T.StyleTable = StyleTable;

  function LinkTable() { this.list = [null]; this.map = new Map(); }
  LinkTable.prototype.id = function (uri, params) {
    var key = (params && params.id ? params.id : '') + '\u0000' + uri;
    var id = this.map.get(key);
    if (id !== undefined) return id;
    id = this.list.length; this.list.push({ uri: uri, params: params || {} }); this.map.set(key, id);
    return id;
  };
  LinkTable.prototype.get = function (id) { return this.list[id] || null; };
  T.LinkTable = LinkTable;

  /* ---- lines ---- */
  var lineSeq = 0;
  function Line(cols, st) {
    this.id = ++lineSeq;
    this.cols = cols;
    this.cp = new Uint32Array(cols);
    this.st = new Uint32Array(cols);
    if (st) this.st.fill(st);
    this.fl = new Uint8Array(cols);
    this.gr = null;
    this.wrapped = false;
    this.ver = 1;
    this.mark = null;
  }
  T.Line = Line;
  Line.prototype.touch = function () { this.ver++; };
  Line.prototype.clear = function (from, to, st) {
    if (from === undefined) from = 0; if (to === undefined) to = this.cols;
    from = Math.max(0, from); to = Math.min(this.cols, to);
    if (from >= to) return;
    /* an erased line holds nothing the earlier session wrote: its placeholder cells name this session's images */
    if (from === 0 && to === this.cols) this.restored = false;
    /* never leave half a wide character behind */
    if (from > 0 && (this.fl[from] & SPACER)) { this.cp[from - 1] = 0; this.fl[from - 1] = 0; }
    if (to < this.cols && (this.fl[to] & SPACER)) { this.cp[to] = 0; this.fl[to] = 0; }
    this.cp.fill(0, from, to); this.st.fill(st || 0, from, to); this.fl.fill(0, from, to);
    if (this.gr) for (var x = from; x < to; x++) this.gr.delete(x);
    this.ver++;
  };
  Line.prototype.setGrapheme = function (x, s) {
    if (!this.gr) this.gr = new Map();
    this.gr.set(x, s); this.fl[x] |= GRAPHEME;
  };
  Line.prototype.chars = function (x) {
    if (this.fl[x] & GRAPHEME) return this.gr.get(x);
    var c = this.cp[x];
    return c ? String.fromCodePoint(c) : '';
  };
  Line.prototype.lastUsed = function () {
    for (var x = this.cols - 1; x >= 0; x--) if (this.cp[x] || this.st[x] || (this.fl[x] & SPACER)) return x + 1;
    return 0;
  };
  Line.prototype.isBlank = function () {
    for (var x = 0; x < this.cols; x++) if (this.cp[x] && this.cp[x] !== 32) return false;
    return true;
  };
  /* plain text of [from, to) with trailing spaces trimmed; images and placeholders come back as '' */
  Line.prototype.text = function (from, to, opts) {
    if (from === undefined) from = 0; if (to === undefined) to = this.cols;
    var out = '', x, last = Math.min(to, this.lastUsed());
    for (x = from; x < last; x++) {
      if (this.fl[x] & SPACER) continue;
      var c = this.cp[x];
      if (c === 0x10eeee && !(opts && opts.keepPlaceholders)) { out += ' '; continue; }
      out += c ? this.chars(x) : ' ';
    }
    return opts && opts.keepTrailing ? out : out.replace(/ +$/, '');
  };
  Line.prototype.resize = function (cols, st) {
    if (cols === this.cols) return;
    var cp = new Uint32Array(cols), sv = new Uint32Array(cols), fl = new Uint8Array(cols);
    var n = Math.min(cols, this.cols);
    cp.set(this.cp.subarray(0, n)); sv.set(this.st.subarray(0, n)); fl.set(this.fl.subarray(0, n));
    if (cols > this.cols && st) sv.fill(st, this.cols);
    if (n > 0 && (fl[n - 1] & WIDE) && n === cols) { cp[n - 1] = 0; fl[n - 1] = 0; }
    if (this.gr) { this.gr.forEach(function (v, k) { if (k >= cols) this.gr.delete(k); }, this); }
    this.cp = cp; this.st = sv; this.fl = fl; this.cols = cols; this.ver++;
  };
  Line.prototype.copyCells = function (src, sx, dx, n) {
    for (var i = 0; i < n; i++) {
      this.cp[dx + i] = src.cp[sx + i]; this.st[dx + i] = src.st[sx + i]; this.fl[dx + i] = src.fl[sx + i];
      if (src.fl[sx + i] & GRAPHEME) this.setGrapheme(dx + i, src.gr.get(sx + i));
      else if (this.gr) this.gr.delete(dx + i);
    }
    this.ver++;
  };

  /* ---- buffers ---- */
  function Buffer(cols, rows, opts) {
    this.cols = cols; this.rows = rows;
    this.isAlt = !!(opts && opts.alt);
    this.maxScrollback = this.isAlt ? 0 : (opts && opts.scrollback !== undefined ? opts.scrollback : 10000);
    this.lines = [];
    for (var i = 0; i < rows; i++) this.lines.push(new Line(cols));
    this.trimmed = 0;
    this.cursor = { x: 0, y: 0, pendingWrap: false };
    this.saved = null;
    this.scrollTop = 0; this.scrollBottom = rows - 1;
    this.tabs = null; this.resetTabs();
  }
  T.Buffer = Buffer;
  Object.defineProperty(Buffer.prototype, 'ybase', { get: function () { return this.lines.length - this.rows; } });
  Buffer.prototype.line = function (y) { return this.lines[this.lines.length - this.rows + y]; };
  Buffer.prototype.abs = function (y) { return this.trimmed + this.lines.length - this.rows + y; };
  Buffer.prototype.lineAtAbs = function (a) { return this.lines[a - this.trimmed] || null; };
  Buffer.prototype.absOf = function (line) {
    /* search from the bottom: most queries are about recent lines */
    for (var i = this.lines.length - 1; i >= 0; i--) if (this.lines[i] === line) return this.trimmed + i;
    return -1;
  };
  Buffer.prototype.resetTabs = function () {
    this.tabs = new Uint8Array(this.cols);
    for (var x = 8; x < this.cols; x += 8) this.tabs[x] = 1;
  };

  /* scroll the region up by n lines; full-screen scrolls on the primary buffer feed scrollback. A region scroll clears
     the lines it pushes out and reuses them at the other end with a new id; onRecycle (set by the terminal) hears of
     them, so what was anchored on them can go */
  Buffer.prototype.scrollUp = function (n, st, onTrim) {
    var top = this.scrollTop, bot = this.scrollBottom, i;
    if (n <= 0) return;
    if (top === 0 && bot === this.rows - 1 && !this.isAlt) {
      /* scrolling past screen plus scrollback leaves the same result: every older line is pruned anyway */
      n = Math.min(n, this.rows + this.maxScrollback);
      for (i = 0; i < n; i++) this.lines.push(new Line(this.cols, st));
      var excess = this.lines.length - this.rows - this.maxScrollback;
      if (excess > 0) {
        /* prune in batches: one splice per 256 lines keeps long outputs cheap */
        var k = excess >= 256 ? excess : 0;
        if (k > 0) {
          var gone = this.lines.splice(0, k);
          this.trimmed += k;
          if (onTrim) onTrim(gone);
        }
      }
      return;
    }
    n = Math.min(n, bot - top + 1);
    var base = this.ybase;
    var removed = this.lines.splice(base + top, n);
    for (i = 0; i < n; i++) {
      var l = removed[i]; l.clear(0, l.cols, st); l.wrapped = false; l.mark = null; l.restored = false; l.id = ++lineSeq;
      this.lines.splice(base + bot - n + 1 + i, 0, l);
    }
    if (this.onRecycle) this.onRecycle(removed);
  };
  Buffer.prototype.scrollDown = function (n, st) {
    var top = this.scrollTop, bot = this.scrollBottom, i;
    n = Math.min(n, bot - top + 1);
    if (n <= 0) return;
    var base = this.ybase;
    var removed = this.lines.splice(base + bot - n + 1, n);
    for (i = 0; i < n; i++) {
      var l = removed[i]; l.clear(0, l.cols, st); l.wrapped = false; l.mark = null; l.restored = false; l.id = ++lineSeq;
      this.lines.splice(base + top + i, 0, l);
    }
    if (this.onRecycle) this.onRecycle(removed);
  };
  Buffer.prototype.touchAll = function () {
    for (var i = Math.max(0, this.lines.length - this.rows); i < this.lines.length; i++) this.lines[i].ver++;
  };

  /* Resize with reflow. Returns { remap(line, col) -> {line, col} | null, lineMap: Map(oldFirstLine -> newLine),
     gone: [Line] }, gone being the lines (after remap) the resize removed: blank ones below the cursor, rewrapped ones
     past the screen below it, and the scrollback overflow at the top. Whatever remap put on them goes with them.
     The alternate screen never reflows: it is truncated or padded. The saved cursor (DECSC, the 1049 save) follows
     its cell the way the live cursor does, so leaving the alternate screen after a resize lands on the right row. */
  Buffer.prototype.resize = function (cols, rows) {
    var self = this;
    var cur = this.cursor, sv = this.saved;
    var oldCols = this.cols, gone = [];
    if (this.isAlt || cols === oldCols) {
      var i;
      /* a pending wrap survives an unchanged width; a wider line puts the cursor after its last cell instead */
      var fitX = function (c) {
        if (cols === oldCols) return;
        if (c.pendingWrap && cols > oldCols) c.x++;
        c.x = Math.min(c.x, cols - 1); c.pendingWrap = false;
      };
      if (cols !== oldCols) for (i = 0; i < this.lines.length; i++) this.lines[i].resize(cols);
      /* rows: trim blank lines below the cursor first, then take from or give to the top */
      var curAbs = this.lines.length - this.rows + cur.y;
      var svAbs = sv ? this.lines.length - this.rows + sv.y : 0;
      if (rows < this.rows) {
        var drop = this.rows - rows;
        while (drop > 0 && this.lines.length - 1 > curAbs && this.lines[this.lines.length - 1].isBlank()) { gone.push(this.lines.pop()); drop--; }
        if (this.isAlt && drop > 0) { this.lines.splice(0, drop); curAbs -= drop; svAbs -= drop; }
      } else if (rows > this.rows) {
        var add = rows - this.rows;
        if (this.isAlt) { for (i = 0; i < add; i++) this.lines.push(new Line(cols)); }
        else {
          var fromBack = Math.min(add, this.lines.length - this.rows);
          /* pull scrollback into view only as far as content exists; pad the rest at the bottom */
          for (i = 0; i < add - fromBack; i++) this.lines.push(new Line(cols));
        }
      }
      this.rows = rows; this.cols = cols;
      while (this.lines.length < rows) this.lines.push(new Line(cols));
      cur.y = T.util.clamp(curAbs - (this.lines.length - rows), 0, rows - 1);
      fitX(cur);
      if (sv) { sv.y = T.util.clamp(svAbs - (this.lines.length - rows), 0, rows - 1); fitX(sv); }
      this.scrollTop = 0; this.scrollBottom = rows - 1;
      if (cols !== oldCols) this.resetTabs();
      this.touchAll();
      return { remap: function (line, col) { return { line: line, col: Math.min(col, cols - 1) }; }, lineMap: null, gone: this.isAlt ? [] : gone };
    }

    /* primary screen with a column change: rewrap logical lines */
    var lines = this.lines, n = lines.length;
    var curAbsIdx = n - this.rows + cur.y;
    /* the saved cursor's cell, found again through remap once the lines are rewrapped */
    var svLine = sv ? lines[n - this.rows + T.util.clamp(sv.y, 0, this.rows - 1)] : null;
    var svX = sv ? sv.x + (sv.pendingWrap ? 1 : 0) : 0;
    var logical = [];  /* {segs: [Line], cells: count} */
    var cursorLogical = -1, cursorOffset = 0;
    var idx = 0;
    while (idx < n) {
      var segs = [lines[idx]];
      while (lines[idx].wrapped && idx + 1 < n) { idx++; segs.push(lines[idx]); }
      logical.push(segs);
      idx++;
    }
    /* locate the cursor */
    var count = 0;
    for (var li = 0; li < logical.length; li++) {
      var segsL = logical[li];
      if (curAbsIdx >= count && curAbsIdx < count + segsL.length) {
        /* a pending wrap sits one cell past x: the next character belongs after the last one, not on it */
        cursorLogical = li; cursorOffset = (curAbsIdx - count) * oldCols + cur.x + (cur.pendingWrap ? 1 : 0);
        break;
      }
      count += segsL.length;
    }
    /* drop blank logical lines after the cursor's */
    while (logical.length - 1 > cursorLogical && logical[logical.length - 1].length === 1 && logical[logical.length - 1][0].isBlank() && !logical[logical.length - 1][0].mark) logical.pop();

    var out = [], segMap = new Map(); /* old Line -> [{newLine, startCol(old offset in logical), newStartOffset}] */
    var colAt = function (pl, o) { var c = o - pl.start; for (var s = 0; s < pl.skip.length && pl.skip[s] < o; s++) c--; return c; };
    var offsetIndex = []; /* per logical: array of new lines and their starting logical offset */
    var newCursor = null;
    for (li = 0; li < logical.length; li++) {
      var group = logical[li];
      /* flatten cells */
      var len = 0, g;
      for (g = 0; g < group.length; g++) {
        len += (g === group.length - 1) ? group[g].lastUsed() : oldCols;
      }
      if (li === cursorLogical) len = Math.max(len, cursorOffset);
      var produced = [];
      var off = 0;
      do {
        /* skip: offsets this line passes over without a cell (padding, a stray spacer), so columns are off - start less
           the skips before off */
        var nl = new Line(cols), startOff = off, skip = [];
        if (!produced.length) { nl.id = group[0].id; nl.mark = group[0].mark; }
        if (group[0].restored) nl.restored = true;
        var x = 0;
        while (x < cols && off < len) {
          var gi = Math.floor(off / oldCols), gx = off % oldCols, src = group[gi];
          if (!src) { off++; continue; }
          var f = src.fl[gx];
          if (f & SPACER) { skip.push(off++); continue; }
          /* the empty last cell an early-wrapped wide character left behind is padding, not a space */
          if (gx === oldCols - 1 && gi < group.length - 1 && !src.cp[gx] && !f && !src.st[gx] && (group[gi + 1].fl[0] & WIDE)) { skip.push(off++); continue; }
          if ((f & WIDE) && x === cols - 1) break; /* a wide char that does not fit wraps early */
          nl.cp[x] = src.cp[gx]; nl.st[x] = src.st[gx]; nl.fl[x] = f;
          if (f & GRAPHEME) nl.setGrapheme(x, src.gr.get(gx));
          if (f & WIDE) { x++; if (x < cols) { nl.cp[x] = 0; nl.fl[x] = SPACER; nl.st[x] = src.st[gx]; } off++; }
          x++; off++;
        }
        if (off === startOff && off < len) off++; /* guard: always progress */
        produced.push({ line: nl, start: startOff, end: off, skip: skip });
        out.push(nl);
      } while (off < len);
      for (var p = 0; p < produced.length - 1; p++) produced[p].line.wrapped = true;
      offsetIndex.push({ group: group, produced: produced });
      for (g = 0; g < group.length; g++) segMap.set(group[g], { li: offsetIndex.length - 1, base: g * oldCols });
      if (li === cursorLogical) {
        for (p = 0; p < produced.length; p++) {
          var st0 = produced[p].start, en0 = produced[p].end;
          if (cursorOffset >= st0 && (cursorOffset < en0 || p === produced.length - 1)) {
            var cx = colAt(produced[p], cursorOffset), pend = false;
            if (cx >= cols) { cx = cols - 1; pend = true; }
            newCursor = { idx: out.length - produced.length + p, x: cx, pend: pend };
            break;
          }
        }
      }
    }
    if (!newCursor) newCursor = { idx: Math.max(0, out.length - 1), x: Math.min(cur.x, cols - 1) };
    while (out.length < rows) out.push(new Line(cols));
    /* keep the cursor on screen */
    var ybase = Math.max(0, out.length - rows);
    if (newCursor.idx < ybase) {
      /* cursor would be above the screen: put it on row 0 and keep as much below it as fits */
      gone = out.splice(Math.max(rows, Math.min(out.length, newCursor.idx + rows)));
      ybase = Math.max(0, out.length - rows);
    }
    this.lines = out; this.cols = cols; this.rows = rows;
    cur.y = T.util.clamp(newCursor.idx - ybase, 0, rows - 1); cur.x = newCursor.x; cur.pendingWrap = !!newCursor.pend;
    this.scrollTop = 0; this.scrollBottom = rows - 1;
    this.resetTabs();
    /* trim scrollback overflow after reflow */
    var excess = this.lines.length - this.rows - this.maxScrollback;
    if (excess > 0) { gone = this.lines.splice(0, excess).concat(gone); this.trimmed += excess; }

    var lineMap = new Map();
    offsetIndex.forEach(function (e) { lineMap.set(e.group[0], e.produced[0].line); });
    /* old line and column -> new line and unclamped column (col === cols means one past the last cell) */
    var locate = function (line, col) {
      var m = segMap.get(line);
      if (!m) return null;
      var e = offsetIndex[m.li], off = m.base + col;
      for (var k = 0; k < e.produced.length; k++) {
        var pl = e.produced[k];
        if (off < pl.end || k === e.produced.length - 1) return { line: pl.line, col: Math.max(0, colAt(pl, off)) };
      }
      return null;
    };
    if (sv) {
      var sm = svLine ? locate(svLine, svX) : null, si = sm ? this.lines.indexOf(sm.line) : -1;
      if (si >= 0) {
        sv.y = T.util.clamp(si - (this.lines.length - rows), 0, rows - 1);
        sv.x = Math.min(sm.col, cols - 1); sv.pendingWrap = sm.col >= cols;
      } else { sv.y = Math.min(sv.y, rows - 1); sv.x = Math.min(sv.x, cols - 1); sv.pendingWrap = false; }
    }
    return {
      lineMap: lineMap,
      gone: gone,
      remap: function (line, col) {
        var r = locate(line, col);
        if (r) r.col = Math.min(cols - 1, r.col);
        return r;
      }
    };
  };
})();
