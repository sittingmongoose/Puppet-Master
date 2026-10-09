/* VT500-series parser after Paul Williams' state machine (vt100.net/emu/dec_ansi_parser), fed with decoded text.
   Printable runs go to handler.print in one call; strings (OSC, DCS, APC) are collected in chunks with hard caps so a
   hostile stream cannot grow memory without bound. A string over its cap is dropped and reported as overflow. */
(function () {
  var GROUND = 0, ESC = 1, ESC_INT = 2, CSI_ENTRY = 3, CSI_PARAM = 4, CSI_INT = 5, CSI_IGNORE = 6,
    DCS_ENTRY = 7, DCS_PARAM = 8, DCS_INT = 9, DCS_PASS = 10, DCS_IGNORE = 11, OSC = 12, STR_IGNORE = 13, APC = 14;

  var LIMITS = {
    oscMax: 24 * 1024 * 1024,   /* OSC 1337 inline images ride OSC; other OSC are tiny */
    dcsMax: 24 * 1024 * 1024,   /* sixel payloads; the decoder has its own 16 MiB data cap */
    apcMax: 8 * 1024 * 1024,    /* one kitty graphics command (chunks are normally <= 4096) */
    maxParams: 32
  };

  function Parser(handler) {
    this.h = handler;
    this.state = GROUND;
    this.reset();
  }
  Parser.LIMITS = LIMITS;

  Parser.prototype.reset = function () {
    this.state = GROUND;
    this.params = []; this.cur = -1; this.sub = null; this.prefix = ''; this.inter = '';
    this.str = []; this.strLen = 0; this.overflow = false;
    this.dcsHook = null;
  };

  Parser.prototype._clearSeq = function () {
    this.params = []; this.cur = -1; this.sub = null; this.prefix = ''; this.inter = '';
  };

  Parser.prototype._pushParam = function () {
    if (this.params.length >= LIMITS.maxParams) { this.cur = -1; this.sub = null; return; }
    if (this.sub) { this.sub.push(this.cur); this.params.push(this.sub); this.sub = null; }
    else this.params.push(this.cur);
    this.cur = -1;
  };

  Parser.prototype._strStart = function () { this.str = []; this.strLen = 0; this.overflow = false; };
  Parser.prototype._strAdd = function (s, max) {
    if (this.overflow) return;
    this.strLen += s.length;
    if (this.strLen > max) {
      /* keep the control part (up to the first ';') so a handler can still reply with an error code */
      var head = this.str.join('') + s, semi = head.indexOf(';');
      this.str = [semi >= 0 ? head.slice(0, semi) : head.slice(0, 256)];
      this.overflow = true; return;
    }
    this.str.push(s);
  };
  Parser.prototype._strEnd = function () { var s = this.str.length === 1 ? this.str[0] : this.str.join(''); this.str = []; this.strLen = 0; return s; };

  Parser.prototype._dispatchString = function () {
    var st = this.state, data = this._strEnd(), ov = this.overflow;
    this.overflow = false;
    if (st === OSC) this.h.osc(data, ov);
    else if (st === APC) this.h.apc(data, ov);
    else if (st === DCS_PASS) { var hk = this.dcsHook; this.dcsHook = null; this.h.dcs(hk.prefix, hk.params, hk.inter, hk.final, data, ov); }
  };

  /* main entry: str is decoded text (UTF-16 JS string) */
  Parser.prototype.feed = function (s) {
    var h = this.h, i = 0, n = s.length, c, j;
    while (i < n) {
      var state = this.state;
      if (state === GROUND) {
        /* fast path: a printable run */
        j = i;
        while (j < n) {
          c = s.charCodeAt(j);
          if (c < 0x20 || c === 0x7f || (c >= 0x80 && c < 0xa0)) break;
          j++;
        }
        if (j > i) { h.print(s.slice(i, j)); i = j; continue; }
        c = s.charCodeAt(i); i++;
        if (c === 0x1b) { this.state = ESC; this._clearSeq(); }
        else if (c < 0x20) h.execute(c);
        /* DEL and 8-bit C1 code points are ignored in UTF-8 mode */
        continue;
      }
      if (state === OSC || state === APC || state === DCS_PASS || state === STR_IGNORE) {
        /* scan to the next terminator in bulk */
        j = i;
        while (j < n) {
          c = s.charCodeAt(j);
          if (c === 0x1b || c === 0x07 || c === 0x18 || c === 0x1a) break;
          j++;
        }
        if (j > i && state !== STR_IGNORE) this._strAdd(s.slice(i, j), state === OSC ? LIMITS.oscMax : state === APC ? LIMITS.apcMax : LIMITS.dcsMax);
        i = j;
        if (i >= n) break;
        c = s.charCodeAt(i); i++;
        if (c === 0x07) {
          if (state === OSC) this._dispatchString();
          else if (state !== STR_IGNORE) this._dispatchString();
          this.state = GROUND;
        } else if (c === 0x1b) {
          if (state !== STR_IGNORE) this._dispatchString();
          this.state = ESC; this._clearSeq();
          this._afterStringEsc = true;
        } else { /* CAN / SUB abort */
          this.str = []; this.strLen = 0; this.overflow = false; this.dcsHook = null;
          this.state = GROUND;
        }
        continue;
      }
      c = s.charCodeAt(i); i++;
      /* anywhere: CAN and SUB abort, ESC restarts */
      if (c === 0x18 || c === 0x1a) { this.state = GROUND; continue; }
      if (c === 0x1b) { this.state = ESC; this._clearSeq(); continue; }
      switch (state) {
        case ESC:
          if (this._afterStringEsc) {
            this._afterStringEsc = false;
            if (c === 0x5c) { this.state = GROUND; break; } /* ST after a string */
          }
          if (c < 0x20) { h.execute(c); break; }
          if (c >= 0x20 && c <= 0x2f) { this.inter += String.fromCharCode(c); this.state = ESC_INT; break; }
          if (c === 0x5b) { this.state = CSI_ENTRY; this._clearSeq(); break; }        /* [ */
          if (c === 0x5d) { this.state = OSC; this._strStart(); break; }              /* ] */
          if (c === 0x50) { this.state = DCS_ENTRY; this._clearSeq(); break; }        /* P */
          if (c === 0x5f) { this.state = APC; this._strStart(); break; }              /* _ */
          if (c === 0x58 || c === 0x5e) { this.state = STR_IGNORE; break; }           /* SOS, PM */
          if (c === 0x5c) { this.state = GROUND; break; }                              /* stray ST */
          if (c >= 0x30 && c <= 0x7e) { h.esc(this.inter, String.fromCharCode(c)); this.state = GROUND; break; }
          this.state = GROUND; break;
        case ESC_INT:
          if (c < 0x20) { h.execute(c); break; }
          if (c >= 0x20 && c <= 0x2f) { this.inter += String.fromCharCode(c); break; }
          if (c >= 0x30 && c <= 0x7e) { h.esc(this.inter, String.fromCharCode(c)); }
          this.state = GROUND; break;
        case CSI_ENTRY:
        case CSI_PARAM:
          if (c < 0x20) { h.execute(c); break; }
          if (c >= 0x30 && c <= 0x39) {
            this.cur = (this.cur < 0 ? 0 : this.cur) * 10 + (c - 0x30);
            if (this.cur > 0x7fffffff) this.cur = 0x7fffffff;
            this.state = CSI_PARAM; break;
          }
          if (c === 0x3b) { this._pushParam(); this.state = CSI_PARAM; break; }
          if (c === 0x3a) { if (!this.sub) this.sub = []; this.sub.push(this.cur); this.cur = -1; this.state = CSI_PARAM; break; }
          if (c >= 0x3c && c <= 0x3f) {
            if (state === CSI_ENTRY) { this.prefix = String.fromCharCode(c); this.state = CSI_PARAM; }
            else this.state = CSI_IGNORE;
            break;
          }
          if (c >= 0x20 && c <= 0x2f) {
            if (this.cur >= 0 || this.sub || this.params.length) this._pushParam();
            this.inter += String.fromCharCode(c); this.state = CSI_INT; break;
          }
          if (c >= 0x40 && c <= 0x7e) {
            if (this.cur >= 0 || this.sub || this.params.length) this._pushParam();
            h.csi(this.params, this.prefix, this.inter, String.fromCharCode(c));
            this.state = GROUND; break;
          }
          this.state = CSI_IGNORE; break;
        case CSI_INT:
          if (c < 0x20) { h.execute(c); break; }
          if (c >= 0x20 && c <= 0x2f) { this.inter += String.fromCharCode(c); break; }
          if (c >= 0x40 && c <= 0x7e) { h.csi(this.params, this.prefix, this.inter, String.fromCharCode(c)); this.state = GROUND; break; }
          this.state = CSI_IGNORE; break;
        case CSI_IGNORE:
          if (c < 0x20) { h.execute(c); break; }
          if (c >= 0x40 && c <= 0x7e) this.state = GROUND;
          break;
        case DCS_ENTRY:
        case DCS_PARAM:
          if (c < 0x20) break;
          if (c >= 0x30 && c <= 0x39) { this.cur = (this.cur < 0 ? 0 : this.cur) * 10 + (c - 0x30); if (this.cur > 0x7fffffff) this.cur = 0x7fffffff; this.state = DCS_PARAM; break; }
          if (c === 0x3b) { this._pushParam(); this.state = DCS_PARAM; break; }
          if (c === 0x3a) { this.state = DCS_IGNORE; break; }
          if (c >= 0x3c && c <= 0x3f) {
            if (state === DCS_ENTRY) { this.prefix = String.fromCharCode(c); this.state = DCS_PARAM; } else this.state = DCS_IGNORE;
            break;
          }
          if (c >= 0x20 && c <= 0x2f) { if (this.cur >= 0 || this.params.length) this._pushParam(); this.inter += String.fromCharCode(c); this.state = DCS_INT; break; }
          if (c >= 0x40 && c <= 0x7e) {
            if (this.cur >= 0 || this.params.length) this._pushParam();
            this.dcsHook = { prefix: this.prefix, params: this.params, inter: this.inter, final: String.fromCharCode(c) };
            this._strStart(); this.state = DCS_PASS; break;
          }
          this.state = DCS_IGNORE; break;
        case DCS_INT:
          if (c < 0x20) break;
          if (c >= 0x20 && c <= 0x2f) { this.inter += String.fromCharCode(c); break; }
          if (c >= 0x40 && c <= 0x7e) {
            this.dcsHook = { prefix: this.prefix, params: this.params, inter: this.inter, final: String.fromCharCode(c) };
            this._strStart(); this.state = DCS_PASS; break;
          }
          this.state = DCS_IGNORE; break;
        case DCS_IGNORE:
          /* swallow until ST (handled through ESC) */
          break;
        default:
          this.state = GROUND;
      }
    }
  };

  /* helpers for handlers: a param with a default (missing or 0 both mean default unless zeroOk) */
  Parser.arg = function (params, i, def, zeroOk) {
    var v = params[i];
    if (Array.isArray(v)) v = v[0];
    if (v === undefined || v < 0) return def;
    if (v === 0 && !zeroOk) return def;
    return v;
  };

  T.Parser = Parser;
})();
