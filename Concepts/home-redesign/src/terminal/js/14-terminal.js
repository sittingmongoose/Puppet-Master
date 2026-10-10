/* T.Terminal: applies parser actions to the buffers. One instance per session.
   Shell-integration marks (OSC 133 and PM's OSC 6973) are boundaries only when they carry the session's nonce;
   anything else is plain output. Error and status replies never echo text the program sent. */
(function () {
  var A = T.ATTR, CELL = T.CELL, arg = T.Parser.arg, C = T.color;
  var DEC_SPECIAL = {
    0x60: 0x25c6, 0x61: 0x2592, 0x62: 0x2409, 0x63: 0x240c, 0x64: 0x240d, 0x65: 0x240a, 0x66: 0x00b0, 0x67: 0x00b1,
    0x68: 0x2424, 0x69: 0x240b, 0x6a: 0x2518, 0x6b: 0x2510, 0x6c: 0x250c, 0x6d: 0x2514, 0x6e: 0x253c, 0x6f: 0x23ba,
    0x70: 0x23bb, 0x71: 0x2500, 0x72: 0x23bc, 0x73: 0x23bd, 0x74: 0x251c, 0x75: 0x2524, 0x76: 0x2534, 0x77: 0x252c,
    0x78: 0x2502, 0x79: 0x2264, 0x7a: 0x2265, 0x7b: 0x03c0, 0x7c: 0x2260, 0x7d: 0x00a3, 0x7e: 0x00b7
  };

  function Terminal(opts) {
    T.mixinEmitter(this);
    opts = opts || {};
    this.cols = opts.cols || 80; this.rows = opts.rows || 24;
    this.nonce = opts.nonce || '';
    this.cellPx = opts.cell || function () { return { w: 8, h: 17 }; };
    this.isDark = opts.isDark || function () { return true; };
    this.styles = new T.StyleTable();
    this.links = new T.LinkTable();
    this.primary = new T.Buffer(this.cols, this.rows, { scrollback: opts.scrollback === undefined ? 10000 : opts.scrollback });
    this.alt = new T.Buffer(this.cols, this.rows, { alt: true });
    this.buf = this.primary;
    this.parser = new T.Parser(this);
    this.commands = [];
    this.cmdSeq = 0;
    this.curCmd = null;
    this.pendingCmdline = null;
    this.pendingWho = null;
    this.images = null;
    this.focused = false;
    this.resetState();
  }
  T.Terminal = Terminal;

  Terminal.prototype.resetState = function () {
    this.pen = { fg: 0, bg: 0, ul: 0, flags: 0, link: 0 };
    this.penId = 0;
    this.modes = {
      appCursor: false, appKeypad: false, origin: false, autowrap: true, insert: false, lnm: false,
      cursorVisible: true, cursorBlink: null, bracketedPaste: false, mouse: 0, mouseSgr: false, mousePixels: false,
      focusEvents: false, sync: false, reverse: false, sixelScrolling: true, sixelCursorRight: false
    };
    this.charsets = ['B', 'B', 'B', 'B']; this.gl = 0;
    this.cursorStyle = null;
    this.title = ''; this.titleStack = [];
    this.kitty = { primary: [0], alt: [0] };
    this.paletteOverride = new Map();
    this.dynamic = { fg: null, bg: null, cursor: null };
    this.progress = { state: 0, value: 0 };
    this.lastCell = null;
    this.syncSince = 0;
  };

  Terminal.prototype.write = function (s) {
    if (!s) return;
    if (this._hold > 0) { this._pending.push(s); return; }
    this.parser.feed(s);
    this.emit('dirty');
  };
  /* hold: an image decode or file read is in flight; output after it waits so the cursor moves first */
  Terminal.prototype.hold = function () { this._hold = (this._hold || 0) + 1; if (!this._pending) this._pending = []; };
  Terminal.prototype.release = function () {
    this._hold = Math.max(0, (this._hold || 0) - 1);
    if (this._hold === 0 && this._pending && this._pending.length) {
      var q = this._pending.join(''); this._pending = [];
      this.write(q);
    }
    this.emit('dirty');
  };
  Terminal.prototype.held = function () { return (this._hold || 0) > 0; };
  Terminal.prototype.defer = function (rest) {
    if (!this._pending) this._pending = [];
    if (rest) this._pending.unshift(rest);
    this.emit('dirty');
  };

  Terminal.prototype.reply = function (s) { this.emit('reply', s); };

  Terminal.prototype._penStyle = function () { return this.penId; };
  Terminal.prototype._updatePen = function () { this.penId = this.styles.id(this.pen); };
  Terminal.prototype._eraseStyle = function () {
    if (!this.pen.bg) return 0;
    return this.styles.id({ fg: 0, bg: this.pen.bg, ul: 0, flags: 0, link: 0 });
  };

  Object.defineProperty(Terminal.prototype, 'cursor', { get: function () { return this.buf.cursor; } });

  /* ---- printing ---- */
  Terminal.prototype.print = function (s) {
    var buf = this.buf, cur = buf.cursor, cols = buf.cols, i = 0, n = s.length;
    var cs = this.charsets[this.gl];
    var st = this.penId, insert = this.modes.insert, autowrap = this.modes.autowrap;
    var line = buf.line(cur.y), lastLine = null, lastX = 0;
    while (i < n) {
      var cp = s.charCodeAt(i), w;
      if (cp >= 0x20 && cp < 0x7f && cs !== '0') { i++; w = 1; }
      else {
        cp = s.codePointAt(i); i += cp > 0xffff ? 2 : 1;
        if (cs === '0' && cp >= 0x60 && cp <= 0x7e) cp = DEC_SPECIAL[cp] || cp;
        w = T.wcwidth(cp);
        if (w === 0) {
          if (lastLine) this.lastCell = { line: lastLine, x: lastX };
          this._join(cp); line = buf.line(cur.y); continue;
        }
      }
      if (cur.pendingWrap) {
        if (autowrap) { line.wrapped = true; cur.x = 0; this._index(); line = buf.line(cur.y); }
        cur.pendingWrap = false;
      }
      if (w === 2 && cur.x >= cols - 1) {
        if (autowrap && cols > 1) {
          line.clear(cur.x, cols, 0);
          line.wrapped = true; cur.x = 0; this._index(); line = buf.line(cur.y);
        } else { cur.x = Math.max(0, cols - 2); }
      }
      var x = cur.x, fl = line.fl;
      if (insert) this._insertCells(line, x, w);
      /* overwriting half of a wide character clears its other half */
      if (fl[x] !== 0) {
        if ((fl[x] & CELL.SPACER) && x > 0) { line.cp[x - 1] = 0; fl[x - 1] = 0; }
        if ((fl[x] & CELL.WIDE) && x + 1 < cols && w === 1) { line.cp[x + 1] = 0; fl[x + 1] = 0; }
        if ((fl[x] & CELL.GRAPHEME) && line.gr) line.gr.delete(x);
      }
      line.cp[x] = cp; line.st[x] = st; fl[x] = w === 2 ? CELL.WIDE : 0;
      if (w === 2 && x + 1 < cols) {
        if ((fl[x + 1] & CELL.WIDE) && x + 2 < cols) { line.cp[x + 2] = 0; fl[x + 2] = 0; }
        line.cp[x + 1] = 0; line.st[x + 1] = st; fl[x + 1] = CELL.SPACER;
        if (line.gr) line.gr.delete(x + 1);
      }
      line.ver++;
      if (this.images && this.images.coverLines && this.images.coverLines.has(line)) this.images.noteText(line, x);
      lastLine = line; lastX = x;
      cur.x = x + w;
      if (cur.x >= cols) { cur.x = cols - 1; cur.pendingWrap = autowrap; }
    }
    if (lastLine) this.lastCell = { line: lastLine, x: lastX };
  };
  Terminal.prototype._join = function (cp) {
    var lc = this.lastCell;
    if (!lc || lc.line.cp[lc.x] === 0) return;
    var line = lc.line, x = lc.x;
    var base = line.chars(x);
    line.setGrapheme(x, base + String.fromCodePoint(cp));
    /* VS16 asks for emoji presentation: widen a narrow cell when there is room (mode 2027 semantics) */
    if (cp === 0xfe0f && !(line.fl[x] & CELL.WIDE) && x + 1 < line.cols && line.cp[x] >= 0x2000) {
      var cur = this.buf.cursor;
      if (cur.y >= 0 && this.buf.line(cur.y) === line && cur.x === x + 1) {
        line.fl[x] |= CELL.WIDE; line.cp[x + 1] = 0; line.fl[x + 1] = CELL.SPACER; line.st[x + 1] = line.st[x];
        cur.x = Math.min(line.cols - 1, x + 2);
        if (x + 2 >= line.cols) cur.pendingWrap = this.modes.autowrap;
      }
    }
    line.ver++;
  };
  Terminal.prototype._insertCells = function (line, x, n) {
    var cols = line.cols;
    for (var i = cols - 1; i >= x + n; i--) {
      line.cp[i] = line.cp[i - n]; line.st[i] = line.st[i - n]; line.fl[i] = line.fl[i - n];
      if (line.gr) { if (line.gr.has(i - n)) line.gr.set(i, line.gr.get(i - n)); else line.gr.delete(i); }
    }
    line.clear(x, Math.min(cols, x + n), this._eraseStyle());
  };

  /* ---- cursor motion ---- */
  Terminal.prototype._index = function () {
    var buf = this.buf, cur = buf.cursor;
    if (cur.y === buf.scrollBottom) this._scrollUp(1);
    else if (cur.y < buf.rows - 1) cur.y++;
  };
  Terminal.prototype._scrollUp = function (n) {
    var self = this;
    this.buf.scrollUp(n, this._eraseStyle(), function (gone) { self._onTrim(gone); });
    this.emit('scroll', n);
  };
  Terminal.prototype._onTrim = function (gone) {
    var set = new Set(gone);
    this.commands = this.commands.filter(function (c) { return !set.has(c.promptLine); });
    if (this.images) this.images.onTrim(set);
    this.emit('trim', set);
  };
  Terminal.prototype._reverseIndex = function () {
    var buf = this.buf, cur = buf.cursor;
    if (cur.y === buf.scrollTop) buf.scrollDown(1, this._eraseStyle());
    else if (cur.y > 0) cur.y--;
  };
  Terminal.prototype._setCursor = function (x, y) {
    var buf = this.buf, cur = buf.cursor;
    if (this.modes.origin) { y += buf.scrollTop; y = T.util.clamp(y, buf.scrollTop, buf.scrollBottom); }
    cur.x = T.util.clamp(x, 0, buf.cols - 1);
    cur.y = T.util.clamp(y, 0, buf.rows - 1);
    cur.pendingWrap = false;
  };

  /* ---- C0 ---- */
  Terminal.prototype.execute = function (c) {
    var buf = this.buf, cur = buf.cursor;
    switch (c) {
      case 7: this.emit('bell'); break;
      case 8: if (cur.pendingWrap) cur.pendingWrap = false; else if (cur.x > 0) cur.x--; break;
      case 9: {
        var x = cur.x + 1;
        while (x < buf.cols - 1 && !buf.tabs[x]) x++;
        cur.x = Math.min(x, buf.cols - 1); cur.pendingWrap = false; break;
      }
      case 10: case 11: case 12:
        this._index(); if (this.modes.lnm) cur.x = 0; cur.pendingWrap = false; break;
      case 13: cur.x = 0; cur.pendingWrap = false; break;
      case 14: this.gl = 1; break;
      case 15: this.gl = 0; break;
    }
  };

  /* ---- ESC ---- */
  Terminal.prototype.esc = function (inter, f) {
    var buf = this.buf, cur = buf.cursor;
    if (inter === '' ) {
      switch (f) {
        case '7': this._saveCursor(); return;
        case '8': this._restoreCursor(); return;
        case 'D': this._index(); return;
        case 'E': cur.x = 0; this._index(); return;
        case 'H': buf.tabs[cur.x] = 1; return;
        case 'M': this._reverseIndex(); return;
        case 'c': this.fullReset(); return;
        case '=': this.modes.appKeypad = true; return;
        case '>': this.modes.appKeypad = false; return;
      }
      return;
    }
    if (inter === '#' && f === '8') {
      var e = this.styles.id({ fg: 0, bg: 0, ul: 0, flags: 0, link: 0 });
      for (var y = 0; y < buf.rows; y++) { var l = buf.line(y); l.cp.fill(0x45); l.st.fill(e); l.fl.fill(0); l.ver++; }
      return;
    }
    var gi = '()*+'.indexOf(inter);
    if (gi >= 0) this.charsets[gi] = f === '0' ? '0' : 'B';
  };
  Terminal.prototype._saveCursor = function () {
    var c = this.buf.cursor;
    this.buf.saved = { x: c.x, y: c.y, pen: Object.assign({}, this.pen), charsets: this.charsets.slice(), gl: this.gl,
      origin: this.modes.origin, autowrap: this.modes.autowrap, pendingWrap: c.pendingWrap };
  };
  Terminal.prototype._restoreCursor = function () {
    var s = this.buf.saved, c = this.buf.cursor;
    if (!s) { c.x = 0; c.y = 0; return; }
    c.x = Math.min(s.x, this.buf.cols - 1); c.y = Math.min(s.y, this.buf.rows - 1); c.pendingWrap = s.pendingWrap;
    this.pen = Object.assign({}, s.pen); this._updatePen();
    this.charsets = s.charsets.slice(); this.gl = s.gl; this.modes.origin = s.origin; this.modes.autowrap = s.autowrap;
  };
  Terminal.prototype.fullReset = function () {
    this.primary = new T.Buffer(this.cols, this.rows, { scrollback: this.primary.maxScrollback });
    this.alt = new T.Buffer(this.cols, this.rows, { alt: true });
    this.buf = this.primary;
    this.commands = []; this.curCmd = null;
    this.resetState();
    if (this.images) this.images.reset();
    this.emit('alt', false);
    this.emit('reset');
  };

  /* ---- CSI ---- */
  Terminal.prototype.csi = function (p, prefix, inter, f) {
    var buf = this.buf, cur = buf.cursor, n, i, line, rows = buf.rows, cols = buf.cols;
    if (prefix === '?' && inter === '' && (f === 'h' || f === 'l')) { for (i = 0; i < p.length; i++) this._decMode(arg(p, i, 0, true), f === 'h'); return; }
    if (prefix === '' && inter === '' && (f === 'h' || f === 'l')) { for (i = 0; i < p.length; i++) this._ansiMode(arg(p, i, 0, true), f === 'h'); return; }
    if (inter === '$' && f === 'p') { this._decrqm(arg(p, 0, 0, true), prefix === '?'); return; }
    if (f === 'u' && (prefix === '?' || prefix === '>' || prefix === '<' || prefix === '=')) { this._kittyKeys(prefix, p); return; }
    if (inter === ' ' && f === 'q') { this._cursorStyle(arg(p, 0, 0, true)); return; }
    if (inter === '!' && f === 'p') { this._softReset(); return; }
    if (prefix === '>' && f === 'q') { this.reply('\x1bP>|PuppetMaster ' + T.VERSION + '\x1b\\'); return; }
    if (prefix === '>' && f === 'c') { this.reply('\x1b[>0;10;1c'); return; }
    if (prefix === '=' && f === 'c') { this.reply('\x1bP!|50554D54\x1b\\'); return; }
    if (prefix === '?' && f === 'n') { this._dsrPrivate(arg(p, 0, 0, true)); return; }
    if (prefix !== '' || inter !== '') return;
    switch (f) {
      case '@': n = arg(p, 0, 1); line = buf.line(cur.y); this._insertCells(line, cur.x, Math.min(n, cols - cur.x)); break;
      case 'A': n = arg(p, 0, 1); cur.y = Math.max(cur.y >= buf.scrollTop ? buf.scrollTop : 0, cur.y - n); cur.pendingWrap = false; break;
      case 'B': case 'e': n = arg(p, 0, 1); cur.y = Math.min(cur.y <= buf.scrollBottom ? buf.scrollBottom : rows - 1, cur.y + n); cur.pendingWrap = false; break;
      case 'C': case 'a': n = arg(p, 0, 1); cur.x = Math.min(cols - 1, cur.x + n); cur.pendingWrap = false; break;
      case 'D': n = arg(p, 0, 1); cur.x = Math.max(0, cur.x - n); cur.pendingWrap = false; break;
      case 'E': n = arg(p, 0, 1); cur.y = Math.min(buf.scrollBottom, cur.y + n); cur.x = 0; cur.pendingWrap = false; break;
      case 'F': n = arg(p, 0, 1); cur.y = Math.max(buf.scrollTop, cur.y - n); cur.x = 0; cur.pendingWrap = false; break;
      case 'G': case '`': cur.x = T.util.clamp(arg(p, 0, 1) - 1, 0, cols - 1); cur.pendingWrap = false; break;
      case 'H': case 'f': this._setCursor(arg(p, 1, 1) - 1, arg(p, 0, 1) - 1); break;
      case 'I': n = arg(p, 0, 1); while (n-- > 0) this.execute(9); break;
      case 'J': this._eraseDisplay(arg(p, 0, 0, true)); break;
      case 'K': this._eraseLine(arg(p, 0, 0, true)); break;
      case 'L': this._insertLines(arg(p, 0, 1)); break;
      case 'M': this._deleteLines(arg(p, 0, 1)); break;
      case 'P': this._deleteChars(arg(p, 0, 1)); break;
      case 'S': n = arg(p, 0, 1); this._scrollUp(n); break;
      case 'T': n = arg(p, 0, 1); buf.scrollDown(n, this._eraseStyle()); break;
      case 'X': n = arg(p, 0, 1); buf.line(cur.y).clear(cur.x, cur.x + n, this._eraseStyle()); break;
      case 'Z': n = arg(p, 0, 1); while (n-- > 0) { var x = cur.x - 1; while (x > 0 && !buf.tabs[x]) x--; cur.x = Math.max(0, x); } break;
      case 'b': {
        n = arg(p, 0, 1);
        if (this.lastCell) { var ch = this.lastCell.line.chars(this.lastCell.x); var rep = ''; for (i = 0; i < Math.min(n, 4096); i++) rep += ch; this.print(rep); }
        break;
      }
      case 'c': if (arg(p, 0, 0, true) === 0) this.reply('\x1b[?62;4;22c'); break;
      case 'd': cur.y = T.util.clamp(arg(p, 0, 1) - 1, 0, rows - 1); cur.pendingWrap = false; break;
      case 'g': n = arg(p, 0, 0, true); if (n === 0) buf.tabs[cur.x] = 0; else if (n === 3) buf.tabs.fill(0); break;
      case 'm': this._sgr(p); break;
      case 'n': n = arg(p, 0, 0, true);
        if (n === 5) this.reply('\x1b[0n');
        else if (n === 6) { var yy = this.modes.origin ? cur.y - buf.scrollTop : cur.y; this.reply('\x1b[' + (yy + 1) + ';' + (cur.x + 1) + 'R'); }
        break;
      case 'r': {
        var top = arg(p, 0, 1) - 1, bot = arg(p, 1, rows) - 1;
        bot = Math.min(bot, rows - 1);
        if (top < bot) { buf.scrollTop = top; buf.scrollBottom = bot; this._setCursor(0, 0); }
        break;
      }
      case 's': this._saveCursor(); break;
      case 'u': this._restoreCursor(); break;
      case 't': this._windowOp(p); break;
    }
  };

  Terminal.prototype._eraseDisplay = function (mode) {
    var buf = this.buf, cur = buf.cursor, st = this._eraseStyle(), y;
    if (mode === 0) {
      buf.line(cur.y).clear(cur.x, buf.cols, st);
      for (y = cur.y + 1; y < buf.rows; y++) { buf.line(y).clear(0, buf.cols, st); buf.line(y).wrapped = false; }
    } else if (mode === 1) {
      for (y = 0; y < cur.y; y++) { buf.line(y).clear(0, buf.cols, st); buf.line(y).wrapped = false; }
      buf.line(cur.y).clear(0, cur.x + 1, st);
    } else if (mode === 2) {
      /* xterm-style: push the screen into scrollback when it has content (clear keeps history) */
      if (!buf.isAlt) {
        var used = 0;
        for (y = buf.rows - 1; y >= 0; y--) if (!buf.line(y).isBlank()) { used = y + 1; break; }
        if (used) { var saveTop = buf.scrollTop, saveBot = buf.scrollBottom; buf.scrollTop = 0; buf.scrollBottom = buf.rows - 1; this._scrollUp(used); buf.scrollTop = saveTop; buf.scrollBottom = saveBot; }
      }
      for (y = 0; y < buf.rows; y++) { buf.line(y).clear(0, buf.cols, st); buf.line(y).wrapped = false; buf.line(y).mark = null; }
      if (this.images) this.images.onClearScreen(buf);
    } else if (mode === 3) {
      if (!buf.isAlt && buf.ybase > 0) {
        var gone = buf.lines.splice(0, buf.ybase);
        buf.trimmed += gone.length;
        this._onTrim(gone);
        this.emit('scroll', 0);
      }
    }
  };
  Terminal.prototype._eraseLine = function (mode) {
    var buf = this.buf, cur = buf.cursor, st = this._eraseStyle(), l = buf.line(cur.y);
    if (mode === 0) l.clear(cur.x, buf.cols, st);
    else if (mode === 1) l.clear(0, cur.x + 1, st);
    else if (mode === 2) l.clear(0, buf.cols, st);
    if (mode !== 1) l.wrapped = false;
  };
  Terminal.prototype._insertLines = function (n) {
    var buf = this.buf, cur = buf.cursor;
    if (cur.y < buf.scrollTop || cur.y > buf.scrollBottom) return;
    var saveTop = buf.scrollTop; buf.scrollTop = cur.y; buf.scrollDown(n, this._eraseStyle()); buf.scrollTop = saveTop;
    cur.x = 0;
  };
  Terminal.prototype._deleteLines = function (n) {
    var buf = this.buf, cur = buf.cursor;
    if (cur.y < buf.scrollTop || cur.y > buf.scrollBottom) return;
    var saveTop = buf.scrollTop; buf.scrollTop = cur.y;
    /* a partial-region scroll never feeds scrollback */
    var full = buf.scrollTop === 0 && buf.scrollBottom === buf.rows - 1 && !buf.isAlt;
    if (full) { buf.isAlt = true; buf.scrollUp(n, this._eraseStyle()); buf.isAlt = false; }
    else buf.scrollUp(n, this._eraseStyle());
    buf.scrollTop = saveTop; cur.x = 0;
  };
  Terminal.prototype._deleteChars = function (n) {
    var buf = this.buf, cur = buf.cursor, l = buf.line(cur.y), cols = buf.cols;
    n = Math.min(n, cols - cur.x);
    for (var x = cur.x; x < cols - n; x++) {
      l.cp[x] = l.cp[x + n]; l.st[x] = l.st[x + n]; l.fl[x] = l.fl[x + n];
      if (l.gr) { if (l.gr.has(x + n)) l.gr.set(x, l.gr.get(x + n)); else l.gr.delete(x); }
    }
    l.clear(cols - n, cols, this._eraseStyle());
  };

  /* ---- SGR ---- */
  function readColor(p, i) {
    /* returns [color, consumed] for 38/48/58 forms: 38;5;n  38;2;r;g;b  38:5:n  38:2::r:g:b  38:2:r:g:b */
    var v = p[i];
    if (Array.isArray(v)) {
      var kind = v[1];
      if (kind === 5 && v.length >= 3) return [C.PAL + T.util.clamp(v[2], 0, 255), 1];
      if (kind === 2) {
        var r, g, b;
        if (v.length >= 6) { r = v[3]; g = v[4]; b = v[5]; } else { r = v[2]; g = v[3]; b = v[4]; }
        return [C.RGB | C.rgb(Math.max(0, r | 0), Math.max(0, g | 0), Math.max(0, b | 0)), 1];
      }
      return [0, 1];
    }
    var k = p[i + 1];
    if (k === 5) return [C.PAL + T.util.clamp(p[i + 2] | 0, 0, 255), 3];
    if (k === 2) return [C.RGB | C.rgb(Math.max(0, p[i + 2] | 0), Math.max(0, p[i + 3] | 0), Math.max(0, p[i + 4] | 0)), 5];
    return [0, 1];
  }
  Terminal.prototype._sgr = function (p) {
    var pen = this.pen, i = 0;
    if (!p.length) p = [0];
    while (i < p.length) {
      var v = p[i], code = Array.isArray(v) ? v[0] : v;
      if (code < 0) code = 0;
      var used = 1, c;
      if (code === 0) { pen.fg = 0; pen.bg = 0; pen.ul = 0; pen.flags = 0; }
      else if (code === 1) pen.flags |= A.BOLD;
      else if (code === 2) pen.flags |= A.DIM;
      else if (code === 3) pen.flags |= A.ITALIC;
      else if (code === 4) {
        var kind = Array.isArray(v) ? (v[1] < 0 ? 1 : v[1]) : 1;
        pen.flags = (pen.flags & ~A.UL_MASK) | ((Math.min(kind, 5) & 7) << A.UL_SHIFT);
      }
      else if (code === 5 || code === 6) pen.flags |= A.BLINK;
      else if (code === 7) pen.flags |= A.INVERSE;
      else if (code === 8) pen.flags |= A.INVISIBLE;
      else if (code === 9) pen.flags |= A.STRIKE;
      else if (code === 21) pen.flags = (pen.flags & ~A.UL_MASK) | (2 << A.UL_SHIFT);
      else if (code === 22) pen.flags &= ~(A.BOLD | A.DIM);
      else if (code === 23) pen.flags &= ~A.ITALIC;
      else if (code === 24) pen.flags &= ~A.UL_MASK;
      else if (code === 25) pen.flags &= ~A.BLINK;
      else if (code === 27) pen.flags &= ~A.INVERSE;
      else if (code === 28) pen.flags &= ~A.INVISIBLE;
      else if (code === 29) pen.flags &= ~A.STRIKE;
      else if (code >= 30 && code <= 37) pen.fg = C.PAL + code - 30;
      else if (code === 38) { c = readColor(p, i); pen.fg = c[0]; used = c[1]; }
      else if (code === 39) pen.fg = 0;
      else if (code >= 40 && code <= 47) pen.bg = C.PAL + code - 40;
      else if (code === 48) { c = readColor(p, i); pen.bg = c[0]; used = c[1]; }
      else if (code === 49) pen.bg = 0;
      else if (code === 53) pen.flags |= A.OVERLINE;
      else if (code === 55) pen.flags &= ~A.OVERLINE;
      else if (code === 58) { c = readColor(p, i); pen.ul = c[0]; used = c[1]; }
      else if (code === 59) pen.ul = 0;
      else if (code >= 90 && code <= 97) pen.fg = C.PAL + code - 90 + 8;
      else if (code >= 100 && code <= 107) pen.bg = C.PAL + code - 100 + 8;
      i += used;
    }
    this._updatePen();
  };

  /* ---- modes ---- */
  Terminal.prototype._ansiMode = function (m, on) {
    if (m === 4) this.modes.insert = on;
    else if (m === 20) this.modes.lnm = on;
  };
  Terminal.prototype._decMode = function (m, on) {
    var md = this.modes;
    switch (m) {
      case 1: md.appCursor = on; break;
      case 5: md.reverse = on; this.buf.touchAll(); break;
      case 6: md.origin = on; this._setCursor(0, 0); break;
      case 7: md.autowrap = on; break;
      case 12: md.cursorBlink = on; break;
      case 25: md.cursorVisible = on; break;
      case 9: case 1000: case 1002: case 1003: md.mouse = on ? m : 0; break;
      case 1004: md.focusEvents = on; break;
      case 1006: md.mouseSgr = on; break;
      case 1016: md.mousePixels = on; md.mouseSgr = on || md.mouseSgr; break;
      case 2004: md.bracketedPaste = on; break;
      case 2026:
        md.sync = on; this.syncSince = on ? T.util.now() : 0;
        break;
      case 80: md.sixelScrolling = !on; break; /* DECSDM set = sixel display mode (no scrolling) */
      case 8452: md.sixelCursorRight = on; break;
      case 47: case 1047: this._altScreen(on, m === 1047, false); break;
      case 1048: if (on) this._saveCursor(); else this._restoreCursor(); break;
      case 1049: this._altScreen(on, true, true); break;
    }
    this.emit('mode', { mode: m, on: on });
  };
  Terminal.prototype._altScreen = function (on, clear, saveCursor) {
    if (on === (this.buf === this.alt)) return;
    if (on) {
      if (saveCursor) this._saveCursor();
      this.buf = this.alt;
      if (clear) { for (var y = 0; y < this.alt.rows; y++) this.alt.line(y).clear(0, this.alt.cols, 0); if (this.images) this.images.onClearScreen(this.alt); }
      this.alt.cursor.x = this.primary.cursor.x; this.alt.cursor.y = this.primary.cursor.y;
    } else {
      this.buf = this.primary;
      if (saveCursor) this._restoreCursor();
    }
    this.lastCell = null;
    this.buf.touchAll();
    this.emit('alt', on);
  };
  Terminal.prototype._decrqm = function (m, priv) {
    var v = 0, md = this.modes;
    if (priv) {
      var map = { 1: md.appCursor, 5: md.reverse, 6: md.origin, 7: md.autowrap, 12: !!md.cursorBlink, 25: md.cursorVisible,
        1000: md.mouse === 1000, 1002: md.mouse === 1002, 1003: md.mouse === 1003, 1004: md.focusEvents, 1006: md.mouseSgr,
        1016: md.mousePixels, 1049: this.buf === this.alt, 2004: md.bracketedPaste, 2026: md.sync, 80: !md.sixelScrolling,
        8452: md.sixelCursorRight };
      if (m === 2027) v = 3; /* grapheme clustering: always on */
      else if (m in map) v = map[m] ? 1 : 2;
      this.reply('\x1b[?' + m + ';' + v + '$y');
    } else {
      if (m === 4) v = md.insert ? 1 : 2; else if (m === 20) v = md.lnm ? 1 : 2;
      this.reply('\x1b[' + m + ';' + v + '$y');
    }
  };
  Terminal.prototype._kittyKeys = function (prefix, p) {
    var stack = this.buf === this.alt ? this.kitty.alt : this.kitty.primary;
    if (prefix === '?') { this.reply('\x1b[?' + stack[stack.length - 1] + 'u'); return; }
    if (prefix === '>') { if (stack.length > 32) stack.shift(); stack.push(arg(p, 0, 0, true) & 31); }
    else if (prefix === '<') { var n = arg(p, 0, 1); while (n-- > 0 && stack.length > 1) stack.pop(); if (stack.length === 1 && n >= 0) stack[0] = 0; }
    else if (prefix === '=') {
      var flags = arg(p, 0, 0, true) & 31, mode = arg(p, 1, 1);
      var top = stack.length - 1;
      if (mode === 1) stack[top] = flags; else if (mode === 2) stack[top] |= flags; else if (mode === 3) stack[top] &= ~flags;
    }
    this.emit('mode', { mode: 'kitty-keys', on: true });
  };
  Terminal.prototype.kittyFlags = function () {
    var stack = this.buf === this.alt ? this.kitty.alt : this.kitty.primary;
    return stack[stack.length - 1];
  };
  Terminal.prototype._cursorStyle = function (n) {
    if (n === 0) { this.cursorStyle = null; }
    else {
      var shape = n <= 2 ? 'block' : n <= 4 ? 'underline' : 'bar';
      this.cursorStyle = { shape: shape, blink: n % 2 === 1 };
    }
    this.emit('cursorstyle');
  };
  Terminal.prototype._softReset = function () {
    var md = this.modes;
    md.insert = false; md.origin = false; md.autowrap = true; md.cursorVisible = true; md.appCursor = false; md.appKeypad = false;
    this.buf.scrollTop = 0; this.buf.scrollBottom = this.buf.rows - 1;
    this.pen = { fg: 0, bg: 0, ul: 0, flags: 0, link: 0 }; this._updatePen();
    this.charsets = ['B', 'B', 'B', 'B']; this.gl = 0; this.buf.saved = null;
  };
  Terminal.prototype._dsrPrivate = function (n) {
    var cur = this.buf.cursor;
    if (n === 6) this.reply('\x1b[?' + (cur.y + 1) + ';' + (cur.x + 1) + ';1R');
    else if (n === 996) this.reply('\x1b[?997;' + (this.isDark() ? 1 : 2) + 'n');
  };
  Terminal.prototype._windowOp = function (p) {
    var op = arg(p, 0, 0, true), cell = this.cellPx();
    if (op === 14) this.reply('\x1b[4;' + Math.round(cell.h * this.rows) + ';' + Math.round(cell.w * this.cols) + 't');
    else if (op === 16) this.reply('\x1b[6;' + Math.round(cell.h) + ';' + Math.round(cell.w) + 't');
    else if (op === 18) this.reply('\x1b[8;' + this.rows + ';' + this.cols + 't');
    else if (op === 22) { if (this.titleStack.length < 10) this.titleStack.push(this.title); }
    else if (op === 23) { if (this.titleStack.length) { this.title = this.titleStack.pop(); this.emit('title', this.title); } }
  };

  /* ---- strings ---- */
  function parseColorSpec(s) {
    var m = /^rgb:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})$/i.exec(s);
    if (m) {
      var f = function (h) { var v = parseInt(h, 16); return Math.round(v * 255 / (Math.pow(16, h.length) - 1)); };
      return C.rgb(f(m[1]), f(m[2]), f(m[3]));
    }
    if (/^#[0-9a-f]{6}$/i.test(s)) return C.hex(s);
    if (/^#[0-9a-f]{3}$/i.test(s)) return C.hex(s);
    return null;
  }
  function colorReply(rgb) {
    var h = function (v) { var x = (v * 257).toString(16); return ('0000' + x).slice(-4); };
    return 'rgb:' + h(C.r(rgb)) + '/' + h(C.g(rgb)) + '/' + h(C.b(rgb));
  }
  Terminal.prototype.osc = function (data, overflow) {
    var semi = data.indexOf(';');
    var num = semi < 0 ? data : data.slice(0, semi), rest = semi < 0 ? '' : data.slice(semi + 1);
    if (!/^\d+$/.test(num)) return;
    var code = +num;
    if (overflow && code !== 1337) return;
    switch (code) {
      case 0: case 2: this.title = rest.slice(0, 256); this.emit('title', this.title); break;
      case 4: {
        var parts = rest.split(';');
        for (var i = 0; i + 1 < parts.length; i += 2) {
          var idx = +parts[i];
          if (!(idx >= 0 && idx < 256)) continue;
          if (parts[i + 1] === '?') {
            var cur = this.paletteOverride.has(idx) ? this.paletteOverride.get(idx) : this.paletteColor ? this.paletteColor(idx) : 0;
            this.reply('\x1b]4;' + idx + ';' + colorReply(cur) + '\x1b\\');
          } else {
            var col = parseColorSpec(parts[i + 1]);
            if (col !== null) this.paletteOverride.set(idx, col);
          }
        }
        this.buf.touchAll(); this.emit('palette');
        break;
      }
      case 7: {
        var m = /^file:\/\/([^/]*)(\/.*)$/.exec(rest);
        if (m) { var path; try { path = decodeURIComponent(m[2]); } catch (e) { path = m[2]; } this.cwd = path; this.cwdHost = m[1]; this.emit('cwd', { path: path, host: m[1] }); }
        break;
      }
      case 8: {
        var s2 = rest.indexOf(';');
        if (s2 < 0) break;
        var params = {}, ps = rest.slice(0, s2), uri = rest.slice(s2 + 1);
        ps.split(':').forEach(function (kv) { var e = kv.indexOf('='); if (e > 0) params[kv.slice(0, e)] = kv.slice(e + 1).slice(0, 250); });
        if (!uri || uri.length > 2083) this.pen.link = 0;
        else this.pen.link = this.links.id(uri, params);
        this._updatePen();
        break;
      }
      case 9: {
        var m4 = /^4;(\d)(?:;(\d{1,3}))?/.exec(rest);
        if (m4) {
          var st = +m4[1], val = m4[2] === undefined ? this.progress.value : T.util.clamp(+m4[2], 0, 100);
          if (st > 4) break;
          this.progress = { state: st, value: st === 0 ? 0 : val };
          this.emit('progress', this.progress);
        } else if (!/^\d;/.test(rest)) {
          this.emit('notify', { title: '', body: rest.slice(0, 512) });
        }
        break;
      }
      case 10: case 11: case 12: {
        var key = code === 10 ? 'fg' : code === 11 ? 'bg' : 'cursor';
        if (rest === '?') {
          var curc = this.dynamic[key] !== null ? this.dynamic[key] : this.defaultColor ? this.defaultColor(key) : 0;
          this.reply('\x1b]' + code + ';' + colorReply(curc) + '\x1b\\');
        } else {
          var c2 = parseColorSpec(rest);
          if (c2 !== null) { this.dynamic[key] = c2; this.buf.touchAll(); this.emit('palette'); }
        }
        break;
      }
      case 52: {
        var s3 = rest.indexOf(';');
        var payload = s3 < 0 ? '' : rest.slice(s3 + 1);
        if (payload === '?') break; /* clipboard reads are never answered silently */
        if (payload.length > 1024 * 1024) break;
        var bytes = T.base64.decode(payload);
        if (bytes) this.emit('clipboard', { text: T.util.utf8Decode(bytes) });
        break;
      }
      case 104: this.paletteOverride.clear(); this.buf.touchAll(); this.emit('palette'); break;
      case 110: case 111: case 112: this.dynamic[code === 110 ? 'fg' : code === 111 ? 'bg' : 'cursor'] = null; this.buf.touchAll(); this.emit('palette'); break;
      case 133: this._osc133(rest); break;
      case 777: {
        var q = rest.split(';');
        if (q[0] === 'notify') this.emit('notify', { title: (q[1] || '').slice(0, 128), body: (q.slice(2).join(';')).slice(0, 512) });
        break;
      }
      case 99: {
        var s4 = rest.indexOf(';');
        this.emit('notify', { title: '', body: (s4 < 0 ? rest : rest.slice(s4 + 1)).slice(0, 512) });
        break;
      }
      case 1337:
        if (/^CurrentDir=/.test(rest)) { this.cwd = rest.slice(11); this.emit('cwd', { path: this.cwd, host: '' }); }
        else if (this.images) this.images.iterm(rest, overflow);
        break;
      case 6973: this._oscPM(rest); break;
    }
  };

  /* shell integration: A prompt start, B input start, C output start, D[;exit] command end */
  Terminal.prototype._osc133 = function (rest) {
    var parts = rest.split(';'), kind = parts[0], opts = {};
    var exitPart = null;
    for (var i = 1; i < parts.length; i++) {
      var e = parts[i].indexOf('=');
      if (e > 0) opts[parts[i].slice(0, e)] = parts[i].slice(e + 1);
      else if (kind === 'D' && exitPart === null) exitPart = parts[i];
    }
    if (!this.nonce || opts.pmn !== this.nonce) { this.emit('forged', { kind: kind }); return; }
    var buf = this.primary;
    if (this.buf !== buf) return;
    var line = buf.line(buf.cursor.y), now = Date.now();
    if (kind === 'A') {
      if (this.curCmd && !this.curCmd.end && this.curCmd.outputLine) this._endCmd(null);
      var cmd = { id: ++this.cmdSeq, cmdline: '', cwd: this.cwd || '', by: 'user', exit: null, start: 0, end: 0,
        promptLine: line, inputLine: null, inputCol: 0, outputLine: null, endLine: null, state: 'prompt' };
      line.mark = { cmd: cmd, kind: 'prompt' }; line.ver++;
      this.curCmd = cmd;
      this.commands.push(cmd);
      if (this.commands.length > 5000) this.commands.shift();
      this.emit('command', { type: 'prompt', cmd: cmd });
    } else if (kind === 'B') {
      if (this.curCmd) { this.curCmd.inputLine = line; this.curCmd.inputCol = buf.cursor.x; this.curCmd.state = 'input'; }
      this.emit('command', { type: 'input', cmd: this.curCmd });
    } else if (kind === 'C') {
      var c = this.curCmd;
      if (c) {
        c.outputLine = line; c.start = now; c.state = 'running';
        if (this.pendingCmdline !== null) c.cmdline = this.pendingCmdline;
        else if (c.inputLine) c.cmdline = c.inputLine.text(c.inputCol).trim();
        if (this.pendingWho) c.by = this.pendingWho;
        this.pendingCmdline = null; this.pendingWho = null;
        this.emit('command', { type: 'exec', cmd: c });
      }
    } else if (kind === 'D') {
      var code = exitPart === null || exitPart === '' ? null : parseInt(exitPart, 10);
      this._endCmd(isNaN(code) ? null : code);
    }
  };
  Terminal.prototype._endCmd = function (code) {
    var c = this.curCmd;
    if (!c || c.state === 'done') return;
    var buf = this.primary;
    c.exit = c.outputLine ? code : null; c.end = Date.now(); c.state = 'done';
    c.endLine = buf.line(buf.cursor.y); c.endCol = buf.cursor.x;
    if (c.promptLine) c.promptLine.ver++;
    if (!c.outputLine) { /* an empty command line: nothing ran */ c.empty = true; }
    this.emit('command', { type: 'end', cmd: c });
  };
  Terminal.prototype._oscPM = function (rest) {
    var parts = rest.split(';');
    if (!this.nonce || parts[0] !== this.nonce) { this.emit('forged', { kind: 'pm' }); return; }
    if (parts[1] === 'E') {
      var b = T.base64.decode(parts[2] || '');
      this.pendingCmdline = b ? T.util.utf8Decode(b).slice(0, 4096) : '';
    } else if (parts[1] === 'W') {
      this.pendingWho = /^(user|agent:[A-Za-z0-9 _.-]{1,40})$/.test(parts[2] || '') ? parts[2] : 'user';
    }
  };

  Terminal.prototype.dcs = function (prefix, params, inter, f, data, overflow) {
    if (f === 'q' && inter === '' && prefix === '') {
      if (this.images) this.images.sixel(params, data, overflow);
      return;
    }
    if (inter === '$' && f === 'q') {
      var reply = null, buf = this.buf;
      if (data === 'm') reply = '0m';
      else if (data === 'r') reply = (buf.scrollTop + 1) + ';' + (buf.scrollBottom + 1) + 'r';
      else if (data === ' q') {
        var cs = this.cursorStyle, n = !cs ? 1 : cs.shape === 'block' ? (cs.blink ? 1 : 2) : cs.shape === 'underline' ? (cs.blink ? 3 : 4) : (cs.blink ? 5 : 6);
        reply = n + ' q';
      }
      this.reply(reply ? '\x1bP1$r' + reply + '\x1b\\' : '\x1bP0$r\x1b\\');
      return;
    }
    if (inter === '+' && f === 'q') {
      var caps = { 'TN': 'xterm-256color', 'Co': '256', 'colors': '256', 'RGB': '8/8/8' };
      var names = data.split(';'), out = [];
      for (var i = 0; i < names.length && i < 16; i++) {
        var hex = names[i], name = '';
        for (var k = 0; k + 1 < hex.length; k += 2) name += String.fromCharCode(parseInt(hex.substr(k, 2), 16));
        if (caps[name] === undefined) { this.reply('\x1bP0+r\x1b\\'); return; }
        var v = caps[name], vh = '';
        for (k = 0; k < v.length; k++) vh += v.charCodeAt(k).toString(16);
        out.push(hex + '=' + vh);
      }
      this.reply('\x1bP1+r' + out.join(';') + '\x1b\\');
    }
  };
  Terminal.prototype.apc = function (data, overflow) {
    if (data.charCodeAt(0) === 0x47 /* G */ && this.images) this.images.kitty(data.slice(1), overflow);
  };

  /* ---- resize ---- */
  Terminal.prototype.resize = function (cols, rows) {
    cols = Math.max(2, cols | 0); rows = Math.max(1, rows | 0);
    if (cols === this.cols && rows === this.rows) return null;
    var r = this.primary.resize(cols, rows);
    this.alt.resize(cols, rows);
    this.cols = cols; this.rows = rows;
    /* commands and images follow their cells */
    var remap = r.remap;
    this.commands.forEach(function (c) {
      ['promptLine', 'inputLine', 'outputLine', 'endLine'].forEach(function (k) {
        if (!c[k]) return;
        var m = remap(c[k], k === 'inputLine' ? c.inputCol : 0);
        if (m) { if (k === 'inputLine') c.inputCol = m.col; c[k] = m.line; } else c[k] = null;
      });
      if (c.promptLine && (!c.promptLine.mark || c.promptLine.mark.cmd !== c)) c.promptLine.mark = { cmd: c, kind: 'prompt' };
    });
    var alive = new Set(this.primary.lines);
    this.commands = this.commands.filter(function (c) { return c.promptLine && alive.has(c.promptLine); });
    if (this.images) this.images.onResize(remap);
    this.lastCell = null;
    this.emit('resize', { cols: cols, rows: rows });
    return r;
  };

  /* plain text of a range of absolute lines in the primary buffer, joining soft wraps */
  Terminal.prototype.textRange = function (fromLine, toLine, opts) {
    var buf = this.primary, a = buf.absOf(fromLine), b = toLine ? buf.absOf(toLine) : buf.trimmed + buf.lines.length - 1;
    if (a < 0) return '';
    var out = [], acc = '';
    for (var i = a; i <= b; i++) {
      var l = buf.lineAtAbs(i); if (!l) break;
      acc += l.text(0, l.cols, { keepTrailing: l.wrapped });
      if (!l.wrapped) { out.push(acc); acc = ''; }
    }
    if (acc) out.push(acc);
    if (opts && opts.trimEnd) while (out.length && !out[out.length - 1]) out.pop();
    return out.join('\n');
  };
  /* output of a finished command: from its output line up to the next prompt */
  Terminal.prototype.commandOutput = function (cmd) {
    if (!cmd || !cmd.outputLine) return '';
    var buf = this.primary, a = buf.absOf(cmd.outputLine);
    var endAbs = cmd.endLine ? buf.absOf(cmd.endLine) - (cmd.endCol === 0 ? 1 : 0) : buf.trimmed + buf.lines.length - 1;
    var idx = this.commands.indexOf(cmd), next = this.commands[idx + 1];
    if (next && next.promptLine) endAbs = Math.min(endAbs, buf.absOf(next.promptLine) - 1);
    if (a < 0) return '';
    var out = [], acc = '';
    for (var i = a; i <= endAbs; i++) {
      var l = buf.lineAtAbs(i); if (!l) break;
      if (l.mark && l.mark.kind === 'prompt' && l.mark.cmd !== cmd) break;
      acc += l.text(0, l.cols, { keepTrailing: l.wrapped });
      if (!l.wrapped) { out.push(acc); acc = ''; }
    }
    if (acc) out.push(acc);
    while (out.length && !out[out.length - 1].trim()) out.pop();
    return out.join('\n');
  };
})();
