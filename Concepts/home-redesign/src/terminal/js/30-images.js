/* T.ImageStore: terminal images (D14), all protocols into one store per screen buffer.
   kitty graphics: direct, file, temporary-file and shared-memory transmission with the 2026-09-14 hardening (regular
   files only, /proc /sys /dev refused before opening, symlink loops fail, one identical read error), chunking,
   image ids and numbers, placements with source rects and cell boxes, the three z tiers, relative placements, every
   delete selector, Unicode placeholders, animation (frames, control, compose) and quotas with kitty's eviction order.
   sixel (32-sixel.js) and iTerm2 (34-iterm.js) decode into the same store. Images sit in cells: they scroll, reflow
   with their anchor cell, clip to the tab and are cleared with the screen. Error replies are fixed strings that never
   echo anything the program sent. Remote sessions and agent-run commands may only use direct transmission. */
(function () {
  var C = T.color;
  var LIMITS = {
    quota: 320 * 1024 * 1024,          /* decoded RGBA bytes per screen buffer (kitty's number) */
    frameQuota: 5 * 320 * 1024 * 1024, /* animation frames: kitty keeps 5x on disk; counted the same way here */
    maxDim: 10000,                     /* px per side */
    maxData: 64 * 1024 * 1024,         /* assembled base64-decoded payload per image in this concept (kitty: 400 MB) */
    maxPath: 2048,                     /* bytes of a file or shared-memory name */
    maxDepth: 8,                       /* relative placement chain */
    maxPlacements: 4096,               /* placements per screen buffer; past it the oldest that no other hangs from go */
    maxCells: 10000,                   /* columns or rows of one placement (c= and r= accept up to 2^32 - 1) */
    minGapMs: 20                       /* fastest animation frame the concept will show (50 fps) */
  };
  var Z_UNDER_BG = -1073741824;
  var ERR = {
    EINVAL: 'EINVAL:Invalid graphics command', ENOENT: 'ENOENT:Image not found', EBADF: 'EBADF:Failed to read image file',
    ENODATA: 'ENODATA:Insufficient image data', EFBIG: 'EFBIG:Too much data', ENOSPC: 'ENOSPC:Storage quota exceeded',
    ENOMEM: 'ENOMEM:Image too large', EBADPNG: 'EBADPNG:Image could not be decoded', EILSEQ: 'EILSEQ:Continuation for an upload that is not in progress',
    ETOODEEP: 'ETOODEEP:Too many levels of parent references', ECYCLE: 'ECYCLE:Parent reference creates a cycle', ENOPARENT: 'ENOPARENT:Parent not found'
  };
  T.IMAGE_LIMITS = LIMITS;

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }

  function Store(term, session) {
    this.term = term; this.session = session;
    this.bufs = { primary: this._empty(), alt: this._empty() };
    this.gen = 1;
    this.loading = null;    /* chunked upload in progress */
    this.nextAuto = 0x7f000000;
    this.nextSeq = 0;       /* transmit order: an image number names the newest image that has it */
    this.timers = new Set();
    this.descr = new Map();
  }
  Store.prototype._empty = function () { return { images: new Map(), placements: [], bytes: 0, frameBytes: 0 }; };
  Store.prototype.cur = function () { return this.term.buf === this.term.alt ? this.bufs.alt : this.bufs.primary; };
  /* keepCover: the change added nothing text can cut (kitty placements and frames), so the cover set stands; a set
     left holding lines of a removed image only costs one empty noteText */
  Store.prototype.bump = function (keepCover) { this.gen++; if (!keepCover) this._rebuildCover(); this.term.emit('dirty'); };
  /* lines covered by images that text can cut (sixel, iTerm2), so printing checks one Set lookup per run */
  Store.prototype._rebuildCover = function () {
    var B = this.cur(), buf = this.term.buf, set = null, self = this;
    B.placements.forEach(function (p) {
      if (!p.cuttable) return;
      var a = self._anchorAbs(p, buf); if (a < 0) return;
      for (var k = 0; k < p.rows; k++) { var ln = buf.lineAtAbs(a + k); if (ln) (set || (set = new Set())).add(ln); }
    });
    this.coverLines = set;
  };
  Store.prototype.reset = function () { this.bufs = { primary: this._empty(), alt: this._empty() }; this.loading = null; this.bump(); };

  T.ImageStore = {
    attach: function (term, session) { var s = new Store(term, session); term.images = s; return s; },
    LIMITS: LIMITS
  };

  /* ================= kitty graphics ================= */
  function parseControl(str) {
    var out = {}, parts = str.split(',');
    if (str === '') return out;
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i];
      if (kv.length < 3 || kv[1] !== '=') return null; /* malformed: dropped without a reply (kitty) */
      var k = kv[0], v = kv.slice(2);
      if ('atodU'.indexOf(k) >= 0 && k !== 'U') { if (v.length !== 1) return null; out[k] = v; continue; }
      if (!/^-?\d+$/.test(v)) return null;
      var n = Number(v);
      if ((k === 'z' || k === 'H' || k === 'V')) { if (n < -2147483648 || n > 2147483647) return null; }
      else if (n < 0 || n > 4294967295) return null;
      out[k] = n;
    }
    return out;
  }

  /* each chunk of an upload is decoded as it arrives (kitty), so '=' padding may end any chunk and the cap counts
     bytes; a chunk that is not base64 fails the whole upload once, at its final chunk */
  function addChunk(L, s) {
    var b = T.base64.decode(s);
    if (!b) { L.bad = true; return; }
    L.parts.push(b); L.size += b.length;
  }
  function joinParts(parts, size) {
    if (parts.length === 1) return parts[0];
    var out = new Uint8Array(size), o = 0;
    for (var i = 0; i < parts.length; i++) { out.set(parts[i], o); o += parts[i].length; }
    return out;
  }

  Store.prototype.kitty = function (data, overflow) {
    var semi = data.indexOf(';');
    var ctl = parseControl(semi < 0 ? data : data.slice(0, semi));
    var payload = semi < 0 ? '' : data.slice(semi + 1);
    if (!ctl) return;
    if (overflow) { this._reply(ctl, ERR.EFBIG); this.loading = null; return; }
    var a = ctl.a || 't';
    /* a continuation chunk of an upload in progress (kitty: any direct-medium transmit while loading continues it) */
    if (this.loading && (ctl.t === undefined || ctl.t === 'd') && a !== 'd' && a !== 'p' && a !== 'a' && a !== 'c') {
      var L = this.loading;
      if (ctl.q !== undefined) L.ctl.q = ctl.q;
      addChunk(L, payload);
      if (L.size > LIMITS.maxData) { this._reply(L.ctl, ERR.EFBIG); this.loading = null; return; }
      /* the image goes where the cursor is when the final chunk arrives (kitty), in the buffer shown then */
      if (!ctl.m) { this.loading = null; if (L.bad) this._reply(L.ctl, ERR.EINVAL); else this._transmit(L.ctl, joinParts(L.parts, L.size), this._cursorAnchor()); }
      return;
    }
    if (a === 'd') { this.loading = null; this._delete(ctl); return; }
    if ((ctl.i && ctl.I)) { this._reply(ctl, 'EINVAL:Must not specify both image id and image number'); return; }
    if (a === 't' || a === 'T' || a === 'q' || a === 'f') {
      if (ctl.m && (ctl.t === undefined || ctl.t === 'd')) {
        this.loading = { ctl: ctl, parts: [], size: 0, bad: false };
        addChunk(this.loading, payload);
        return;
      }
      this._transmit(ctl, payload, this._cursorAnchor());
      return;
    }
    if (a === 'p') { this._put(ctl, this._cursorAnchor()); return; }
    if (a === 'a') { this._animControl(ctl); return; }
    if (a === 'c') { this._compose(ctl); return; }
  };

  Store.prototype._cursorAnchor = function () {
    var buf = this.term.buf, cur = buf.cursor;
    return { line: buf.line(cur.y), col: cur.x, y: cur.y };
  };

  Store.prototype._reply = function (ctl, msg) {
    var q = ctl.q || 0;
    if (!ctl.i && !ctl.I) return;
    if (q >= 2) return;
    if (q === 1 && msg === 'OK') return;
    var keys = [];
    if (ctl.i || ctl._assignedId) keys.push('i=' + (ctl._assignedId || ctl.i));
    if (ctl.I) keys.push('I=' + ctl.I);
    if (ctl.p) keys.push('p=' + ctl.p);
    if (ctl._frame) keys.push('r=' + ctl._frame);
    this.term.reply('\x1b_G' + keys.join(',') + ';' + msg + '\x1b\\');
  };

  /* who may use file media: never a remote shell, never a command an agent typed (exfiltration risk). Fails closed: an
     agent holding the terminal, or the last to type into it or into any shell in the chain, refuses it too, so the rule
     never rests on the command's recorded author alone */
  Store.prototype._fileMediaAllowed = function () {
    var s = this.session; if (!s) return false;
    var agent = function (who) { return /^agent:/.test(who || ''); };
    /* every shell in the chain: a remote shell, or one running a remote command now (`ssh host cmd` makes no shell) */
    for (var sh = s.shell; sh; sh = sh.child) if (sh.remote || sh.remoteRuns > 0 || agent(sh.typer)) return false;
    var cmd = this.term.curCmd;
    if (cmd && agent(cmd.by)) return false;
    return !agent(s.owner) && !agent(s.lease) && !agent(s.lastTyper);
  };

  /* read file / temp / shm media with kitty's checks; resolves to bytes or rejects with the one generic error */
  Store.prototype._readMedium = function (ctl, payload) {
    var self = this, t = ctl.t;
    var raw = T.base64.decode(payload);
    if (!raw || raw.length > LIMITS.maxPath) return Promise.reject(ERR.EBADF);
    var name = T.util.utf8Decode(raw);
    if (!this._fileMediaAllowed()) return Promise.reject(ERR.EBADF);
    var vfs = this.session && this.session.vfs;
    if (!vfs) return Promise.reject(ERR.EBADF);
    var off = ctl.O || 0, size = ctl.S || 0;
    function slice(bytes) {
      if (off > bytes.length) throw ERR.EBADF;
      var end = size ? off + size : bytes.length;
      if (end > bytes.length) throw ERR.EBADF; /* a short read is the generic error, never a size leak */
      return bytes.subarray(off, end);
    }
    if (t === 's') {
      if (name[0] !== '/' || name.indexOf('/', 1) >= 0 || !vfs.shm) return Promise.reject(ERR.EBADF);
      var data;
      try { data = vfs.shm.read(name); } catch (e) { return Promise.reject(ERR.EBADF); }   /* missing, a bad name or not a file */
      try { vfs.shm.unlink(name); } catch (e) {}
      if (!data) return Promise.reject(ERR.EBADF);
      return Promise.resolve(data).then(function (b) { return slice(b instanceof Uint8Array ? b : new Uint8Array(b)); });
    }
    /* t=f / t=t: check the resolved path before opening */
    var real;
    try { real = vfs.realpath ? vfs.realpath(name) : vfs.resolve('/', name); } catch (e) { return Promise.reject(ERR.EBADF); }
    if (!real || real[0] !== '/') return Promise.reject(ERR.EBADF);
    var first = real.split('/')[1];
    if (first === 'proc' || first === 'sys' || (first === 'dev' && real.indexOf('/dev/shm/') !== 0)) return Promise.reject(ERR.EBADF);
    var st = vfs.stat(real);
    if (!st || st.type !== 'file') return Promise.reject(ERR.EBADF);
    if (t === 'f') ctl._name = Array.from(real.replace(/^.*\//, '').replace(/[\x00-\x1f\x7f]/g, '')).slice(0, 120).join('');
    /* a temporary file goes once it opened, whether or not the read then fails; the path given is removed (a link, not
       its target), and only when it resolves inside /tmp or /dev/shm (kitty) */
    var del = t === 't' && name.indexOf('tty-graphics-protocol') >= 0 && (real.indexOf('/tmp/') === 0 || real.indexOf('/dev/shm/') === 0);
    var read;
    try { read = Promise.resolve(vfs.readBytes(real)); } catch (e) { return Promise.reject(ERR.EBADF); }
    return read.then(function (b) {
      try {
        if (!b) throw ERR.EBADF;
        return slice(b instanceof Uint8Array ? b : new Uint8Array(b));
      } finally {
        if (del) { try { vfs.unlink(name); } catch (e) {} }
      }
    }, function () { throw ERR.EBADF; });
  };

  /* zlib, read until the output passes cap and then cancelled with overErr: a small payload never inflates without bound */
  function inflate(bytes, cap, overErr) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(ERR.EINVAL);
    var reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
    var parts = [], total = 0;
    function pump() {
      return reader.read().then(function (r) {
        if (r.done) return joinParts(parts, total);
        total += r.value.length;
        if (total > cap) { reader.cancel().catch(function () {}); throw overErr; }
        parts.push(r.value);
        return pump();
      });
    }
    return pump().catch(function (e) { throw e === overErr ? e : ERR.EINVAL; });
  }
  function decodeBlob(bytes, mime) {
    var blob = new Blob([bytes], { type: mime || 'image/png' });
    if (typeof createImageBitmap !== 'undefined') return createImageBitmap(blob).catch(function () { throw ERR.EBADPNG; });
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(blob);
      img.onload = function () { URL.revokeObjectURL(url); res(img); };
      img.onerror = function () { URL.revokeObjectURL(url); rej(ERR.EBADPNG); };
      img.src = url;
    });
  }
  function toCanvas(src, w, h) {
    var c = canvas(w || src.width, h || src.height);
    c.getContext('2d').drawImage(src, 0, 0);
    return c;
  }
  function rawToCanvas(bytes, w, h, fmt) {
    var bpp = fmt === 24 ? 3 : 4, need = w * h * bpp;
    if (bytes.length < need) throw ERR.ENODATA;
    if (bytes.length > need) throw ERR.EINVAL;
    var c = canvas(w, h), g = c.getContext('2d'), id = g.createImageData(w, h), d = id.data;
    for (var i = 0, j = 0; i < w * h; i++, j += bpp) {
      d[i * 4] = bytes[j]; d[i * 4 + 1] = bytes[j + 1]; d[i * 4 + 2] = bytes[j + 2]; d[i * 4 + 3] = bpp === 4 ? bytes[j + 3] : 255;
    }
    g.putImageData(id, 0, 0);
    return c;
  }

  /* decode the payload of a transmit into a canvas; resolves { canvas, w, h } */
  Store.prototype._decode = function (ctl, payload) {
    var self = this, fmt = ctl.f || 32, t = ctl.t || 'd';
    if ([24, 32, 100].indexOf(fmt) < 0) return Promise.reject(ERR.EINVAL);
    if ((fmt === 24 || fmt === 32) && (!ctl.s || !ctl.v)) return Promise.reject(ERR.EINVAL);
    if (ctl.s > LIMITS.maxDim || ctl.v > LIMITS.maxDim) return Promise.reject(ERR.ENOMEM);
    if (ctl.o !== undefined && ctl.o !== 'z') return Promise.reject(ERR.EINVAL);
    if ('dfts'.indexOf(t) < 0) return Promise.reject(ERR.EINVAL);
    var bpp = fmt === 24 ? 3 : 4, need = fmt === 100 ? 0 : ctl.s * ctl.v * bpp;
    /* raw pixels that could never fit the quota are refused before anything is read or inflated; a query is checked
       the way the transmit it asks about would be */
    if (need && ctl.s * ctl.v * 4 > LIMITS.quota) return Promise.reject(ERR.ENOSPC);
    var bytesP;
    if (t === 'd') {
      var b = typeof payload === 'string' ? T.base64.decode(payload) : payload;   /* a chunked upload arrives decoded */
      if (!b) return Promise.reject(ERR.EINVAL);
      if (b.length > LIMITS.maxData) return Promise.reject(ERR.EFBIG);
      bytesP = Promise.resolve(b);
    } else bytesP = this._readMedium(ctl, payload);
    var out = bytesP.then(function (bytes) {
      /* no further than the image can use: raw pixels exactly s*v*bpp, a PNG the data cap */
      if (ctl.o !== 'z') return bytes;
      return fmt === 100 ? inflate(bytes, LIMITS.maxData, ERR.EFBIG) : inflate(bytes, need, ERR.EINVAL);
    }).then(function (bytes) {
      if (t !== 'd' && need && ctl.o !== 'z') {
        /* raw pixels from a file medium: kitty reads no more than s*v*bpp, and a short file is the one generic error */
        if (bytes.length < need) throw ERR.EBADF;
        if (bytes.length > need) bytes = bytes.subarray(0, need);
      }
      if (fmt === 100) {
        return decodeBlob(bytes, 'image/png').then(function (bmp) {
          if (bmp.width > LIMITS.maxDim || bmp.height > LIMITS.maxDim) throw ERR.ENOMEM;
          return { canvas: toCanvas(bmp), w: bmp.width, h: bmp.height };
        });
      }
      return { canvas: rawToCanvas(bytes, ctl.s, ctl.v, fmt), w: ctl.s, h: ctl.v };
    });
    /* a file medium answers every failure with the one generic error: whether a file exists, is zlib, a PNG or the
       right size never shows in the reply */
    return t === 'd' ? out : out.catch(function () { throw ERR.EBADF; });
  };

  Store.prototype._transmit = function (ctl, payload, anchor) {
    var self = this, a = ctl.a || 't', term = this.term;
    var bufKey = term.buf === term.alt ? 'alt' : 'primary';
    term.hold();
    /* nothing between hold and release may throw, or later output would wait for good */
    var work;
    try { work = this._decode(ctl, payload); } catch (e) { work = Promise.reject(typeof e === 'string' ? e : (ctl.t && ctl.t !== 'd') ? ERR.EBADF : ERR.EINVAL); }
    work.then(function (img) {
      if (a === 'q') { self._reply(ctl, 'OK'); return; }
      if (a === 'f') { self._frame(ctl, img); return; }
      var B = self.bufs[bufKey];
      var id = ctl.i;
      if (!id && ctl.I) { id = self._freeId(B); ctl._assignedId = id; }
      if (!id) id = 0;
      var bytes = img.w * img.h * 4;
      if (!self._makeRoom(B, bytes)) { self._reply(ctl, ERR.ENOSPC); return; }
      if (id && B.images.has(id)) self._removeImage(B, B.images.get(id));
      var image = { id: id || self._freeId(B, true), clientId: id, number: ctl.I || 0, seq: ++self.nextSeq, w: img.w, h: img.h, frames: [{ canvas: img.canvas, gap: 0 }],
        current: 0, anim: { state: 1, loops: 1, played: 0 }, bytes: bytes, transient: !!(ctl.N & 1), lastUsed: Date.now(), gen: 1, source: 'kitty', name: ctl._name || '' };
      B.images.set(image.id, image); B.bytes += bytes;
      self._reply(ctl, 'OK');
      if (a === 'T') self._place(image, ctl, anchor, bufKey);
      self.bump(true);
    }, function (err) {
      self._reply(ctl, typeof err === 'string' ? err : ERR.EINVAL);
    }).then(function () { term.release(); }, function () { term.release(); });
  };

  Store.prototype._freeId = function (B, internal) {
    var id;
    do { id = internal ? ++this.nextAuto : 1 + Math.floor(Math.random() * 0xfffffe); } while (B.images.has(id));
    return id;
  };
  Store.prototype._findImage = function (B, ctl) {
    if (ctl.i) return B.images.get(ctl.i) || null;
    if (ctl.I) {
      /* the newest image with that number (ids for numbered images are random, so they say nothing about order) */
      var best = null;
      B.images.forEach(function (im) { if (im.number === ctl.I && (!best || (im.seq || 0) > (best.seq || 0))) best = im; });
      return best;
    }
    return null;
  };

  /* quota with kitty's eviction order: images without placements, then transient, then least recently used */
  Store.prototype._makeRoom = function (B, need) {
    if (need > LIMITS.quota) return false;
    if (B.bytes + need <= LIMITS.quota) return true;
    var self = this;
    var list = Array.from(B.images.values()).sort(function (x, y) {
      var px = self._hasPlacements(B, x) ? 1 : 0, py = self._hasPlacements(B, y) ? 1 : 0;
      if (px !== py) return px - py;
      if (x.transient !== y.transient) return x.transient ? -1 : 1;
      return x.lastUsed - y.lastUsed;
    });
    for (var i = 0; i < list.length && B.bytes + need > LIMITS.quota; i++) this._removeImage(B, list[i]);
    return B.bytes + need <= LIMITS.quota;
  };
  Store.prototype._hasPlacements = function (B, im) { return B.placements.some(function (p) { return p.image === im; }); };
  Store.prototype._removeImage = function (B, im) {
    /* its placements go, and with them every placement made relative to one of them (and an image only those held) */
    this._dropPlacements(B, B.placements.filter(function (p) { return p.image === im; }), false, true);
    if (B.images.get(im.id) === im) { B.images.delete(im.id); B.bytes -= im.bytes; im.frames.slice(1).forEach(function (f) { B.frameBytes -= im.w * im.h * 4; }); }
    if (im.timer) { clearTimeout(im.timer); im.timer = null; }
  };

  /* ---- placement ---- */
  Store.prototype._cellPx = function () { var c = this.term.cellPx(); return { w: c.w || 8, h: c.h || 17 }; };
  Store.prototype._put = function (ctl, anchor) {
    var B = this.cur(), im = this._findImage(B, ctl);
    if (!ctl.i && !ctl.I) return;
    if (!im) { this._reply(ctl, ERR.ENOENT); return; }
    var r = this._place(im, ctl, anchor, this.term.buf === this.term.alt ? 'alt' : 'primary');
    this._reply(ctl, r || 'OK');
    this.bump(true);
  };
  Store.prototype._place = function (im, ctl, anchor, bufKey) {
    var B = this.bufs[bufKey], term = this.term, buf = bufKey === 'alt' ? term.alt : term.primary;
    var cell = this._cellPx();
    var sx = ctl.x || 0, sy = ctl.y || 0;
    var sw = ctl.w ? Math.min(ctl.w, im.w - sx) : im.w - sx, sh = ctl.h ? Math.min(ctl.h, im.h - sy) : im.h - sy;
    if (sw <= 0 || sh <= 0) return ERR.EINVAL;
    var offX = Math.min(ctl.X || 0, cell.w - 1), offY = Math.min(ctl.Y || 0, cell.h - 1);
    /* c= and r= are bounded, so neither the cursor move below nor drawing ever meets a size in the billions */
    var cols = Math.min(ctl.c || 0, LIMITS.maxCells), rows = Math.min(ctl.r || 0, LIMITS.maxCells);
    if (!cols && !rows) { cols = Math.ceil((sw + offX) / cell.w); rows = Math.ceil((sh + offY) / cell.h); }
    else if (!cols) cols = Math.min(LIMITS.maxCells, Math.ceil(rows * cell.h * sw / sh / cell.w));
    else if (!rows) rows = Math.min(LIMITS.maxCells, Math.ceil(cols * cell.w * sh / sw / cell.h));
    var pl = { image: im, pid: ctl.p || 0, line: anchor.line, lineId: anchor.line.id, col: anchor.col, cols: cols, rows: rows, sx: sx, sy: sy, sw: sw, sh: sh,
      offX: offX, offY: offY, z: ctl.z || 0, virtual: ctl.U === 1, fit: !!(ctl.c || ctl.r), parent: null, H: ctl.H || 0, V: ctl.V || 0, masks: null };
    /* the placement this one replaces (same image id and placement id) */
    var old = pl.pid && im.clientId ? B.placements.filter(function (q) { return q.image === im && q.pid === pl.pid; }) : [];
    /* relative placements */
    if (ctl.P) {
      if (pl.virtual) return ERR.EINVAL;
      var parentImg = B.images.get(ctl.P);
      if (!parentImg) return ERR.ENOPARENT;
      var parent = B.placements.find(function (q) { return q.image === parentImg && (!ctl.Q || q.pid === ctl.Q); });
      if (!parent) return ERR.ENOPARENT;
      if (parent.image === im && parent.pid === pl.pid) return ERR.ECYCLE;
      /* the chain above must not reach this placement, by image and placement id, counting the one it replaces */
      for (var p2 = parent, depth = 1; p2; p2 = p2.parent, depth++) {
        if (old.indexOf(p2) >= 0 || (pl.pid && p2.image === im && p2.pid === pl.pid)) return ERR.ECYCLE;
        if (depth > LIMITS.maxDepth) return ERR.ETOODEEP;
      }
      pl.parent = parent;
    }
    if (old.length) {
      /* replace in place (moves without flicker): the new placement takes the old one's slot, so a parent stays ahead of
         its children, and the children follow it */
      B.placements.forEach(function (q) { if (old.indexOf(q.parent) >= 0) q.parent = pl; });
      if (old.length > 1) B.placements = B.placements.filter(function (q) { return q === old[0] || old.indexOf(q) < 0; });
      B.placements[B.placements.indexOf(old[0])] = pl;
    } else {
      B.placements.push(pl);
      this._capPlacements(B);
    }
    im.lastUsed = Date.now();
    this._startAnim(im);
    /* cursor: kitty moves right by cols and down by rows - 1 unless C=1, a relative or a virtual placement */
    if (!ctl.C && !pl.parent && !pl.virtual) {
      var cur = buf.cursor;
      /* the cursor ends on the image's last row (kitty); rows is at most maxCells, so a huge r= never hangs the tab */
      cur.x += cols;
      for (var k = 0; k < rows - 1; k++) this.term._index();
      if (cur.x >= buf.cols) { cur.x = 0; this.term._index(); }
      cur.pendingWrap = false;
    }
    return null;
  };

  /* absolute row of a placement's anchor (cached index, validated) */
  Store.prototype._anchorAbs = function (pl, buf) {
    if (pl.parent) { var pa = this._anchorAbs(pl.parent, buf); return pa < 0 ? -1 : pa + pl.V; }
    /* a line that scrolls out of a region (alternate screen, margins, IL/DL, RI) is cleared and reused at the other end
       with a new id: the image left with the line's content, it does not jump to the far edge */
    if (pl.lineId === undefined) pl.lineId = pl.line.id;
    else if (pl.line.id !== pl.lineId) return -1;
    var idx = pl._idx;
    if (idx !== undefined && buf.lines[idx] === pl.line) return buf.trimmed + idx;
    var a = buf.absOf(pl.line);
    pl._idx = a < 0 ? undefined : a - buf.trimmed;
    return a;
  };
  Store.prototype._anchorCol = function (pl) { return pl.parent ? this._anchorCol(pl.parent) + pl.H : pl.col; };

  /* NieR Mode: images are shown as an ink-and-parchment duotone (brightness kept, hue dropped), computed once per
     frame and palette and cached, so nothing on the screen leaves NieR's ink and parchment */
  Store.prototype._frameCanvas = function (frame, view) {
    var d = view && view.theme && view.theme.duotone;
    if (!d) return frame.canvas;
    var key = d.ink + '/' + d.paper;
    if (frame._duo && frame._duoKey === key && frame._duoGen === frame.canvas._gen) return frame._duo;
    var src = frame.canvas, w = src.width, h = src.height, out = canvas(w, h), g = out.getContext('2d');
    g.drawImage(src, 0, 0);
    try {
      var id = g.getImageData(0, 0, w, h), px = id.data;
      var lo = C.lum(d.ink) < C.lum(d.paper) ? d.ink : d.paper, hi = lo === d.ink ? d.paper : d.ink;
      var lr = C.r(lo), lg = C.g(lo), lb = C.b(lo), hr = C.r(hi), hg = C.g(hi), hb = C.b(hi);
      for (var i = 0; i < px.length; i += 4) {
        var L = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
        px[i] = lr + (hr - lr) * L; px[i + 1] = lg + (hg - lg) * L; px[i + 2] = lb + (hb - lb) * L;
      }
      g.putImageData(id, 0, 0);
    } catch (e) { return src; }
    frame._duo = out; frame._duoKey = key; frame._duoGen = src._gen;
    return out;
  };

  /* ---- drawing (called by the renderer per row; ctx is clipped to the row) ---- */
  Store.prototype.drawRow = function (ctx, abs, y0, layer, view) {
    var term = this.term, buf = term.buf, B = this.cur();
    if (!B.placements.length) return;
    var m = view.metrics, W = m.devW, H = m.devH, dpr = m.dpr;
    /* the placements in this row and tier, painted lower z first, then lower image id, then in the order placed (kitty) */
    var list = null, i;
    for (i = 0; i < B.placements.length; i++) {
      var p = B.placements[i];
      if (p.virtual) continue;
      var tier = p.z < Z_UNDER_BG ? 'under-bg' : p.z < 0 ? 'under-text' : 'over-text';
      if (tier !== layer) continue;
      var pa = this._anchorAbs(p, buf);
      if (pa < 0 || abs < pa || abs >= pa + p.rows) continue;
      (list || (list = [])).push(p);
    }
    if (!list) return;
    if (list.length > 1) list.sort(function (u, v) { return (u.z - v.z) || (u.image.id - v.image.id); });
    for (i = 0; i < list.length; i++) {
      var pl = list[i], a = this._anchorAbs(pl, buf), col = this._anchorCol(pl), top = y0 - (abs - a) * H;
      /* text written over sixel and iTerm2 images cuts the image out of those cells (foot): the image is clipped away
         there, so those cells keep exactly what the renderer painted (inverse, concealed, palette, selection, cursor) */
      var cut = null;
      if (pl.masks && pl.masks.size) {
        var row = abs - a, ln = buf.lineAtAbs(abs);
        pl.masks.forEach(function (key) {
          if (Math.floor(key / 4096) !== row) return;
          var cc = key % 4096; (cut || (cut = new Set())).add(cc);
          if (ln && (ln.fl[cc] & T.CELL.WIDE)) cut.add(cc + 1);   /* the spacer half of a wide character */
        });
      }
      if (cut) {
        /* a Set: a cell listed twice would cancel itself out under the even-odd rule */
        ctx.save(); ctx.beginPath(); ctx.rect(0, y0, buf.cols * W, H);
        cut.forEach(function (cc) { ctx.rect(cc * W, y0, W, H); });
        ctx.clip('evenodd');
      }
      if (pl.image.ghost) this._drawGhost(ctx, col * W, top, pl.cols * W, pl.rows * H, pl.image, view, true, (buf.cols - col) * W);
      else {
        var x = col * W + pl.offX * dpr, y = top + pl.offY * dpr;
        var dw, dh;
        if (pl.stretch) { dw = pl.cols * W; dh = pl.rows * H; }
        else if (pl.fit) {
          var bw = pl.cols * W - pl.offX * dpr, bh = pl.rows * H - pl.offY * dpr, sc = Math.min(bw / pl.sw, bh / pl.sh);
          dw = pl.sw * sc; dh = pl.sh * sc;
        } else { dw = pl.sw * (W / (m.cellW * dpr)) * dpr; dh = pl.sh * (H / (m.cellH * dpr)) * dpr; }
        var frame = pl.image.frames[pl.image.current] || pl.image.frames[0];
        if (frame && frame.canvas) ctx.drawImage(this._frameCanvas(frame, view), pl.sx, pl.sy, pl.sw, pl.sh, x, y, dw, dh);
      }
      if (cut) ctx.restore();
    }
  };
  /* an image the saved scrollback could not keep: a hairline box in its cells with a short label naming it, in the
     default text colour as the renderer works it out (OSC 10/11, reverse screen); the label wraps inside labelW, the
     part of the box left of the screen's right edge */
  Store.prototype._drawGhost = function (ctx, x, y, w, h, im, view, box, labelW) {
    var m = view.metrics, term = this.term, dpr = m.dpr || 1, lw = Math.max(1, Math.round(dpr));
    var d = view.renderer.defaults(), fg = C.toHex(term.modes.reverse ? d.bg : d.fg);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (box) {
      ctx.globalAlpha = 0.45; ctx.strokeStyle = fg; ctx.lineWidth = lw; ctx.setLineDash([3 * lw, 3 * lw]);
      ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
    }
    ctx.globalAlpha = 0.75; ctx.fillStyle = fg; ctx.font = m.font; ctx.textBaseline = 'alphabetic';
    var pad = box ? Math.round(3 * dpr) : 0;
    var maxRows = box ? Math.max(1, Math.floor(h / m.devH)) : 1;
    var rows = this._ghostRows(ctx, im, Math.min(w, labelW === undefined ? w : Math.max(0, labelW)) - 2 * pad, maxRows);
    for (var k = 0; k < rows.length; k++) ctx.fillText(rows[k], x + pad, y + m.baseline + k * m.devH);
    ctx.restore();
  };
  /* the wrapped label, kept on the image per width, row count and font: a repaint (every animation frame) measures nothing */
  Store.prototype._ghostRows = function (ctx, im, maxW, maxRows) {
    var cache = im._lbl || (im._lbl = new Map()), key = maxW + '|' + maxRows + '|' + ctx.font, rows = cache.get(key);
    if (rows) return rows;
    rows = wrapLabel(ctx, T.Saved ? T.Saved.label(im) : '[image]', maxW, maxRows);
    if (rows.cut && T.Saved) rows = wrapLabel(ctx, T.Saved.label(im, true), maxW, maxRows);   /* without the size */
    if (cache.size >= 8) cache.clear();
    cache.set(key, rows);
    return rows;
  };
  /* user-perceived characters, so a break never splits a surrogate pair, an emoji sequence or a combining mark */
  var graphemeSeg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  function graphemes(s) { return graphemeSeg ? Array.from(graphemeSeg.segment(s), function (g) { return g.segment; }) : Array.from(s); }
  /* the label in as many rows as the box has, words kept whole where they fit, the last row ellipsized; a word wider
     than the box breaks between characters, each piece grown forward (one measurement per character), and nothing
     past the last row is measured */
  function wrapLabel(ctx, text, maxW, maxRows) {
    var fits = function (t) { return ctx.measureText(t).width <= maxW; };
    var out = [], cur = '', words = text.split(' ');
    for (var i = 0; i < words.length && out.length <= maxRows; i++) {
      var next = cur ? cur + ' ' + words[i] : words[i];
      if (fits(next)) { cur = next; continue; }
      if (cur) { out.push(cur); cur = ''; }
      if (fits(words[i])) { cur = words[i]; continue; }
      var gs = graphemes(words[i]);
      for (var g = 0; g < gs.length && out.length <= maxRows; g++) {
        if (cur && !fits(cur + gs[g])) { out.push(cur); cur = ''; }
        cur += gs[g];
      }
    }
    if (cur && out.length <= maxRows) out.push(cur);
    if (out.length > maxRows) {
      out = out.slice(0, maxRows);
      var last = graphemes(out[maxRows - 1]);
      while (last.length > 1 && !fits(last.join('') + '…')) last.pop();
      out[maxRows - 1] = last.join('') + '…';
      out.cut = true;
    }
    return out;
  }
  /* printing over an image cell (called from the renderer's view of the terminal; cheap check) */
  Store.prototype.noteText = function (line, x) {
    var B = this.cur(), buf = this.term.buf;
    for (var i = 0; i < B.placements.length; i++) {
      var pl = B.placements[i];
      if (!pl.cuttable) continue;
      var a = this._anchorAbs(pl, buf); if (a < 0) continue;
      var la = buf.absOf(line);
      if (la < a || la >= a + pl.rows || x < pl.col || x >= pl.col + pl.cols) continue;
      (pl.masks || (pl.masks = new Set())).add((la - a) * 4096 + x);
    }
  };

  /* ---- Unicode placeholders ---- */
  function idFromColor(c) {
    if (!c) return 0;
    if (c < 0x200) return c - 0x100;
    return c & 0xffffff;
  }
  Store.prototype._placeholderRuns = function (line) {
    if (line._phVer === line.ver && line._ph) return line._ph;
    var runs = new Map(), styles = this.term.styles, idx = T.KITTY_DIACRITIC_INDEX;
    var prev = null;
    for (var x = 0; x < line.cols; x++) {
      if (line.cp[x] !== 0x10eeee) { prev = null; continue; }
      var st = styles.get(line.st[x]);
      var lo = idFromColor(st.fg), pid = idFromColor(st.ul);
      var g = line.chars(x), dia = [];
      for (var k = g.codePointAt(0) > 0xffff ? 2 : 1; k < g.length; k++) { var cp = g.codePointAt(k); if (cp > 0xffff) k++; dia.push(idx && idx.has(cp) ? idx.get(cp) + 1 : 0); }
      var row = dia[0] || 0, col = dia[1] || 0, hi = dia[2] || 0;
      if (prev && prev.lo === lo && prev.pid === pid && (!row || row === prev.row) && (!col || col === prev.col + 1) && (!hi || hi === prev.hi)) {
        row = Math.max(prev.row, 1); col = prev.col + 1; hi = Math.max(prev.hi, 1);
      } else { row = row || 1; col = col || 1; hi = hi || 1; }
      var cell = { lo: lo, pid: pid, row: row, col: col, hi: hi, id: (lo | ((hi - 1) << 24)) >>> 0 };
      runs.set(x, cell);
      prev = cell;
    }
    line._ph = runs; line._phVer = line.ver;
    return runs;
  };
  Store.prototype.drawPlaceholder = function (ctx, line, x, px, py, W, H, style, view) {
    var cell = this._placeholderRuns(line).get(x); if (!cell) return;
    var B = this.cur(), im = line.restored ? (B.phAlias ? B.phAlias.get(cell.id) : null) : B.images.get(cell.id);
    if (!im) return;
    var vp = null;
    for (var i = 0; i < B.placements.length; i++) {
      var p = B.placements[i];
      if (p.image === im && p.virtual && (!cell.pid || p.pid === cell.pid)) { vp = p; break; }
    }
    if (!vp) return;
    var cols = vp.cols, rows = vp.rows;
    var r = cell.row - 1, c = cell.col - 1;
    if (r >= rows || c >= cols) return;
    /* the label from the run's first cell, wrapped inside the screen rather than the run's full width */
    if (im.ghost) { if (r === 0 && c === 0) this._drawGhost(ctx, px, py, Math.min(cols * W, Math.max(0, (this.term.buf.cols - x) * W)), H, im, view, false); return; }
    var boxW = cols * W, boxH = rows * H, sc = Math.min(boxW / im.w, boxH / im.h);
    var dw = im.w * sc, dh = im.h * sc, ox = (boxW - dw) / 2, oy = (boxH - dh) / 2;
    /* this cell's slice of the fitted image */
    var cx0 = c * W, cy0 = r * H;
    var sx0 = (cx0 - ox) / sc, sy0 = (cy0 - oy) / sc, sw = W / sc, sh = H / sc;
    var frame = im.frames[im.current] || im.frames[0];
    var clipX0 = Math.max(0, sx0), clipY0 = Math.max(0, sy0), clipX1 = Math.min(im.w, sx0 + sw), clipY1 = Math.min(im.h, sy0 + sh);
    if (clipX1 <= clipX0 || clipY1 <= clipY0) return;
    ctx.drawImage(this._frameCanvas(frame, view), clipX0, clipY0, clipX1 - clipX0, clipY1 - clipY0,
      px + (clipX0 - sx0) * sc, py + (clipY0 - sy0) * sc, (clipX1 - clipX0) * sc, (clipY1 - clipY0) * sc);
    im.lastUsed = im._drawnAt = Date.now();
    this._startAnim(im);
  };

  /* ---- delete (a=d) ---- */
  Store.prototype._delete = function (ctl) {
    var self = this, B = this.cur(), buf = this.term.buf, d = ctl.d || 'a', free = d === d.toUpperCase();
    var lower = d.toLowerCase(), cur = buf.cursor, top = buf.abs(0);
    var hit = function (pl, col, absRow) {
      var a = self._anchorAbs(pl, buf); if (a < 0) return false;
      var c0 = self._anchorCol(pl);
      return (absRow === null || (absRow >= a && absRow < a + pl.rows)) && (col === null || (col >= c0 && col < c0 + pl.cols));
    };
    var victims;
    switch (lower) {
      case 'a': victims = B.placements.filter(function (p) { if (p.virtual) return false; var a = self._anchorAbs(p, buf); return a < 0 || (a + p.rows - 1 >= top && a < top + buf.rows); }); break;
      case 'i': { var im = B.images.get(ctl.i); if (!im) return; victims = B.placements.filter(function (p) { return p.image === im && (!ctl.p || p.pid === ctl.p); }); if (free && (!ctl.p || victims.length === B.placements.filter(function (p) { return p.image === im; }).length)) { this._removeImage(B, im); this.bump(); return; } break; }
      case 'n': { var imn = this._findImage(B, { I: ctl.I }); if (!imn) return; victims = B.placements.filter(function (p) { return p.image === imn && (!ctl.p || p.pid === ctl.p); }); if (free && !ctl.p) { this._removeImage(B, imn); this.bump(); return; } break; }
      case 'c': victims = B.placements.filter(function (p) { return !p.virtual && hit(p, cur.x, buf.abs(cur.y)); }); break;
      case 'p': victims = B.placements.filter(function (p) { return !p.virtual && hit(p, (ctl.x || 1) - 1, top + (ctl.y || 1) - 1); }); break;
      case 'q': victims = B.placements.filter(function (p) { return !p.virtual && p.z === (ctl.z || 0) && hit(p, (ctl.x || 1) - 1, top + (ctl.y || 1) - 1); }); break;
      case 'x': victims = B.placements.filter(function (p) { return !p.virtual && hit(p, (ctl.x || 1) - 1, null); }); break;
      case 'y': victims = B.placements.filter(function (p) { return !p.virtual && hit(p, null, top + (ctl.y || 1) - 1); }); break;
      case 'z': victims = B.placements.filter(function (p) { return !p.virtual && p.z === (ctl.z || 0); }); break;
      case 'r': {
        var lo = ctl.x || 0, hi = ctl.y || 0;
        Array.from(B.images.values()).forEach(function (imr) {
          if (imr.clientId < lo || imr.clientId > hi) return;
          if (free) self._removeImage(B, imr);
          else self._dropPlacements(B, B.placements.filter(function (p) { return p.image === imr; }), false, true);   /* children go too */
        });
        this.bump(); return;
      }
      case 'f': {
        var imf = this._findImage(B, ctl); if (!imf) return;
        if (imf.frames.length <= 1) { if (free) this._removeImage(B, imf); this.bump(); return; }
        var fi = Math.min(Math.max(1, ctl.r || 1), imf.frames.length) - 1;
        imf.frames.splice(fi, 1); B.frameBytes -= imf.w * imf.h * 4; if (imf.current >= imf.frames.length) imf.current = 0;
        this.bump(); return;
      }
      default: return;
    }
    this._dropPlacements(B, victims, free);
  };
  /* quiet: the caller bumps once it is done */
  Store.prototype._dropPlacements = function (B, victims, free, quiet) {
    if (!victims || !victims.length) return;
    var set = new Set(victims), self = this;
    /* relative children die with their parents */
    var changed = true;
    while (changed) { changed = false; B.placements.forEach(function (p) { if (p.parent && set.has(p.parent) && !set.has(p)) { set.add(p); changed = true; } }); }
    B.placements = B.placements.filter(function (p) { return !set.has(p); });
    var images = new Set(); set.forEach(function (p) { images.add(p.image); });
    images.forEach(function (im) {
      var left = B.placements.some(function (p) { return p.image === im; });
      if (!left && (free || !im.clientId)) self._removeImage(B, im);
    });
    if (!quiet) this.bump();
  };
  /* past the placement cap the oldest eighth that no other placement hangs from goes at once, so a flood of puts costs
     no more per put than it does below the cap; their images go with them unless an id keeps them. Called after the
     push: the newest placement and its parent are never among them */
  Store.prototype._capPlacements = function (B) {
    if (B.placements.length <= LIMITS.maxPlacements) return;
    var parents = new Set(), victims = [], i;
    B.placements.forEach(function (q) { if (q.parent) parents.add(q.parent); });
    for (i = 0; i < B.placements.length - 1 && victims.length < LIMITS.maxPlacements / 8; i++) if (!parents.has(B.placements[i])) victims.push(B.placements[i]);
    this._dropPlacements(B, victims, false, true);
  };

  /* ---- animation ---- */
  Store.prototype._frame = function (ctl, img) {
    var B = this.cur(), im = this._findImage(B, ctl);
    if (!im) { this._reply(ctl, ERR.ENOENT); return; }
    var x = ctl.x || 0, y = ctl.y || 0;
    if (x + img.w > im.w || y + img.h > im.h) { this._reply(ctl, ERR.EINVAL); return; }
    if (B.frameBytes + im.w * im.h * 4 > LIMITS.frameQuota) { this._reply(ctl, ERR.ENOSPC); return; }
    var target, isNew = !ctl.r || ctl.r > im.frames.length;
    if (isNew) {
      var base = ctl.c ? im.frames[ctl.c - 1] : null;
      if (ctl.c && !base) { this._reply(ctl, ERR.EINVAL); return; }
      var cv = canvas(im.w, im.h), g = cv.getContext('2d');
      if (base) g.drawImage(base.canvas, 0, 0);
      else if (ctl.Y) { var col = ctl.Y >>> 0; g.fillStyle = 'rgba(' + (col >>> 24) + ',' + ((col >>> 16) & 255) + ',' + ((col >>> 8) & 255) + ',' + ((col & 255) / 255) + ')'; g.fillRect(0, 0, im.w, im.h); }
      target = { canvas: cv, gap: 40 };
    } else target = im.frames[ctl.r - 1];
    var tg = target.canvas.getContext('2d');
    if (ctl.X === 1 || ctl.C === 1) tg.clearRect(x, y, img.w, img.h);
    tg.drawImage(img.canvas, x, y);
    target.canvas._gen = (target.canvas._gen || 0) + 1;
    if (ctl.z > 0) target.gap = Math.max(LIMITS.minGapMs, ctl.z); else if (ctl.z < 0) target.gap = 0;
    if (isNew) { im.frames.push(target); B.frameBytes += im.w * im.h * 4; }
    ctl._frame = isNew ? im.frames.length : ctl.r;
    im.gen++;
    this._reply(ctl, 'OK');
    this._startAnim(im);
    this.bump(true);
  };
  Store.prototype._animControl = function (ctl) {
    var B = this.cur(), im = this._findImage(B, ctl); if (!im) return;
    if (ctl.r && ctl.z !== undefined) { var fr = im.frames[ctl.r - 1]; if (fr) fr.gap = ctl.z > 0 ? Math.max(LIMITS.minGapMs, ctl.z) : 0; }
    if (ctl.v) { im.anim.loops = ctl.v; im.anim.played = 0; }
    if (ctl.c) { im.current = Math.min(im.frames.length, ctl.c) - 1; im.gen++; this.bump(true); }
    if (ctl.s) { im.anim.state = ctl.s; if (ctl.s === 1) { im.anim.played = 0; if (im.timer) { clearTimeout(im.timer); im.timer = null; } } }
    this._startAnim(im);
  };
  Store.prototype._compose = function (ctl) {
    var B = this.cur(), im = this._findImage(B, ctl);
    if (!im) { this._reply(ctl, ERR.ENOENT); return; }
    var src = im.frames[(ctl.r || 1) - 1], dst = im.frames[(ctl.c || 1) - 1];
    if (!src || !dst) { this._reply(ctl, ERR.ENOENT); return; }
    var w = ctl.w || im.w, h = ctl.h || im.h, sx = ctl.X || 0, sy = ctl.Y || 0, dx = ctl.x || 0, dy = ctl.y || 0;
    if (sx + w > im.w || sy + h > im.h || dx + w > im.w || dy + h > im.h) { this._reply(ctl, ERR.EINVAL); return; }
    if (src === dst && !(sx + w <= dx || dx + w <= sx || sy + h <= dy || dy + h <= sy)) { this._reply(ctl, ERR.EINVAL); return; }
    var g = dst.canvas.getContext('2d');
    if (ctl.C === 1) g.clearRect(dx, dy, w, h);
    g.drawImage(src.canvas, sx, sy, w, h, dx, dy, w, h);
    dst.canvas._gen = (dst.canvas._gen || 0) + 1;
    im.gen++; this._reply(ctl, 'OK'); this.bump(true);
  };
  /* frames advance only while the terminal is visible and Reduced Motion is off (content motion still moves) */
  Store.prototype._startAnim = function (im) {
    var self = this;
    if (im.timer || im.frames.length < 2 || im.anim.state === 1) return;
    if (T.look().reduced) return;
    var total = im.frames.reduce(function (s, f) { return s + f.gap; }, 0);
    if (total <= 0) return;
    var gap = im.frames[im.current].gap || 0;
    var step = function () {
      im.timer = null;
      if (!self.cur().images.has(im.id) && !self.bufs.primary.images.has(im.id) && !self.bufs.alt.images.has(im.id)) return;
      if (self.paused || T.look().reduced) return;
      /* nothing draws it (every placement deleted or cleared): a=p or a placeholder cell starts it again */
      if (!self._hasPlacements(self.bufs.primary, im) && !self._hasPlacements(self.bufs.alt, im)) return;
      /* only a Unicode-placeholder placement, and no cell of it drawn lately (cleared, or scrolled out of view): the next
         placeholder cell drawn starts it again */
      var cells = function (B) { return B.placements.some(function (p) { return p.image === im && !p.virtual; }); };
      if (!cells(self.bufs.primary) && !cells(self.bufs.alt) && Date.now() - (im._drawnAt || 0) > Math.max(1000, 4 * (im.frames[im.current].gap || 40))) return;
      var n = im.current, guard = 0;
      do { n = (n + 1) % im.frames.length; guard++; } while (im.frames[n].gap === 0 && n !== 0 && guard < im.frames.length + 1);
      if (n === 0 || n < im.current) {
        if (im.anim.state === 2) { im.timer = setTimeout(step, 40); return; } /* loading mode waits at the last frame */
        im.anim.played++;
        if (im.anim.loops > 1 && im.anim.played >= im.anim.loops - 1) { im.anim.state = 1; return; }
      }
      im.current = n; im.gen++;
      self.bump(true);
      im.timer = setTimeout(step, Math.max(LIMITS.minGapMs, im.frames[n].gap || 40));
    };
    im.timer = setTimeout(step, Math.max(LIMITS.minGapMs, gap || 40));
  };
  Store.prototype.pause = function (on) {
    this.paused = on;
    if (!on) { var self = this; [this.bufs.primary, this.bufs.alt].forEach(function (B) { B.images.forEach(function (im) { self._startAnim(im); }); }); }
  };

  /* ---- sixel and iTerm2 entry points (decoders live in 32-sixel.js and 34-iterm.js) ---- */
  Store.prototype.sixel = function (params, data, overflow) {
    if (overflow || !T.Sixel) return;
    var r = T.Sixel.decode(params, data, { maxWidth: LIMITS.maxDim, maxHeight: LIMITS.maxDim });
    if (!r || !r.ok) return;
    var cv = canvas(r.width, r.height), g = cv.getContext('2d'), id = g.createImageData(r.width, r.height);
    id.data.set(r.rgba); g.putImageData(id, 0, 0);
    var term = this.term, md = term.modes;
    if (!md.sixelScrolling) {
      /* DECSDM set: the image starts at the top-left of the screen and the cursor stays */
      var saved = { x: term.buf.cursor.x, y: term.buf.cursor.y };
      term.buf.cursor.x = 0; term.buf.cursor.y = 0;
      this.addCellImage(cv, { source: 'sixel', noCursor: true, name: 'sixel image' });
      term.buf.cursor.x = saved.x; term.buf.cursor.y = saved.y;
    } else this.addCellImage(cv, { source: 'sixel', sixelCursor: true, name: 'sixel image' });
  };
  Store.prototype.iterm = function (rest, overflow) {
    if (T.ITerm) T.ITerm.handle(this, rest, overflow);
  };
  /* a decoded image placed at the cursor like text (sixel, iTerm2): over-text tier, cut by text written over it */
  Store.prototype.addCellImage = function (cv, o) {
    var term = this.term, buf = term.buf, B = this.cur(), cell = this._cellPx();
    var w = o.drawW || cv.width, h = o.drawH || cv.height;
    var bytes = cv.width * cv.height * 4;
    if (!this._makeRoom(B, bytes)) return false;
    var im = { id: this._freeId(B, true), clientId: 0, number: 0, w: cv.width, h: cv.height, frames: [{ canvas: cv, gap: 0 }], current: 0,
      anim: { state: 1, loops: 1, played: 0 }, bytes: bytes, transient: false, lastUsed: Date.now(), gen: 1, source: o.source, name: o.name || '' };
    B.images.set(im.id, im); B.bytes += bytes;
    var cols = o.cols || Math.ceil(w / cell.w), rows = o.rows || Math.ceil(h / cell.h);
    cols = Math.min(cols, buf.cols - buf.cursor.x);
    var anchor = this._cursorAnchor();
    var pl = { image: im, pid: 0, line: anchor.line, lineId: anchor.line.id, col: anchor.col, cols: cols, rows: rows, sx: 0, sy: 0, sw: cv.width, sh: cv.height,
      offX: 0, offY: 0, z: 0, virtual: false, fit: !!(o.cols || o.rows || o.drawW), stretch: !!o.stretch, parent: null, H: 0, V: 0, masks: null, cuttable: true };
    B.placements.push(pl);
    this._capPlacements(B);
    if (!o.noCursor) {
      /* scroll so the whole image is on screen, cursor on the image's last row (xterm, iTerm2); rows is bounded by
         maxDim (and iTerm2's own cap) */
      for (var k = 0; k < rows - 1; k++) term._index();
      if (o.sixelCursor && term.modes.sixelCursorRight) { buf.cursor.x = Math.min(buf.cols - 1, anchor.col + cols); }
      else if (o.itermCursor) { buf.cursor.x = Math.min(buf.cols - 1, anchor.col + cols); }
      buf.cursor.pendingWrap = false;
    }
    this.bump();
    return true;
  };

  /* ---- grid events ---- */
  Store.prototype.onTrim = function (gone) {
    var B = this.bufs.primary, self = this;
    var victims = B.placements.filter(function (p) { var root = p; while (root.parent) root = root.parent; return gone.has(root.line); });
    if (victims.length) this._dropPlacements(B, victims, false);
    B.images.forEach(function (im) { if (!im.clientId && !self._hasPlacements(B, im)) self._removeImage(B, im); });
  };
  Store.prototype.onClearScreen = function (buf) {
    var B = buf === this.term.alt ? this.bufs.alt : this.bufs.primary, self = this;
    var top = buf.abs(0);
    /* a placement whose line a region scroll reused (anchor -1) is gone from view too */
    var victims = B.placements.filter(function (p) { if (p.virtual) return false; var a = self._anchorAbs(p, buf); return a < 0 || a + p.rows - 1 >= top; });
    this._dropPlacements(B, victims, false);
  };
  /* gone: the lines the resize removed. The terminal trims them next (onTrim), which drops what sits on them; a
     Unicode-placeholder placement is not drawn at its line, so it moves to the first line and its cells still name it */
  Store.prototype.onResize = function (remap, gone) {
    var B = this.bufs.primary, victims = [], lines = this.term.primary.lines, cut = gone && gone.length ? new Set(gone) : null;
    B.placements.forEach(function (p) {
      if (p.parent) return;
      /* a reused line would hand the placement a fresh id below: it left with the line's old content */
      if (!p.virtual && p.lineId !== undefined && p.line.id !== p.lineId) { victims.push(p); return; }
      var r = remap(p.line, p.col); if (!r) { victims.push(p); return; }
      if (p.virtual && cut && cut.has(r.line) && lines.length) r = { line: lines[0], col: 0 };
      p.line = r.line; p.col = r.col; p.lineId = r.line.id; p._idx = undefined;
    });
    this._dropPlacements(B, victims, false, true);   /* their relative children go with them */
    this.bump();
  };
  /* lines a region scroll cleared and reused at the other end (alternate screen, margins, IL/DL, CSI S/T, RI): the
     images anchored on them go, as kitty drops images that scroll out of the region */
  Store.prototype.onRecycle = function (buf, lines) {
    var B = buf === this.term.alt ? this.bufs.alt : this.bufs.primary;
    if (!B.placements.length || !lines) return;
    var gone = lines instanceof Set ? lines : new Set(lines);
    var victims = B.placements.filter(function (p) { var root = p; while (root.parent) root = root.parent; return !root.virtual && gone.has(root.line); });
    this._dropPlacements(B, victims, false);
  };

  /* plain-text description for the accessible buffer and agent reads: images never reach scrollback text */
  Store.prototype.describeLine = function (line) {
    var B = this.bufs.primary, out = [];
    B.placements.forEach(function (p) {
      if (p.line !== line || p.virtual) return;
      if (p.image.ghost) { out.push(T.Saved ? T.Saved.label(p.image) : '[image]'); return; }
      out.push('[image ' + p.image.w + '×' + p.image.h + ' px' + (p.image.frames.length > 1 ? ', animated' : '') + ']');
    });
    /* Unicode-placeholder runs, one per image: one saved scrollback could not keep reads as its placeholder label */
    var seen = new Set();
    this._placeholderRuns(line).forEach(function (cell) {
      if (seen.has(cell.id)) return;
      seen.add(cell.id);
      var im = line.restored ? (B.phAlias ? B.phAlias.get(cell.id) : null) : B.images.get(cell.id);
      out.push(im && im.ghost && T.Saved ? T.Saved.label(im) : '[image]');
    });
    return out.length ? out.join(' ') : '';
  };
  Store.prototype.stats = function () {
    var p = this.bufs.primary, a = this.bufs.alt;
    return { images: p.images.size + a.images.size, placements: p.placements.length + a.placements.length, bytes: p.bytes + a.bytes, frameBytes: p.frameBytes + a.frameBytes };
  };
})();
