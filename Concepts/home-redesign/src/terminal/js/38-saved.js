/* Saved scrollback (Plans canon 2026-10-09, after SPEC installment 1). While a terminal runs, its main-screen scrollback,
   its command marks and its images are saved, so a tab restored after a reload shows its scrollback as it was, above a
   new session (restore outcome restored_exited; never a fake live PTY, F3-226). The alternate screen, the command line
   being typed, selections and find highlights are never saved (transient_only).
   Storage, the concept's stand-in for canon's transcript chunks: IndexedDB "pm.home.terminal:v1:saved", one record per
   terminal (text, styles, links, command records, image placements) and one record per image frame, written once and
   reused by later saves. Saved images follow the saved scrollback's own storage and backup rules.
   Quota: 64 MiB stored per terminal, text and images together. Text is bounded by the 10,000-line scrollback and never
   gives way to images; images that do not fit are dropped oldest first (highest in the scrollback), and their cells then
   show a short placeholder naming the image: "[logo.png 640×480 · not kept]". A frame that cannot be read back gets
   the same placeholder.
   Saves are batched: 1.5 s after output settles, at most every 5 s while it streams, and when the page hides; an
   unchanged terminal is not written again. Clear scrollback empties the saved copy at the next save. Closing the tab
   keeps its saved copy while the tab can be reopened (the panels' reopen stack holds 20) and for at most 7 days. */
(function () {
  var DB_NAME = 'pm.home.terminal:v1:saved';
  var LIMITS = { quota: 64 * 1024 * 1024, settleMs: 1500, maxWaitMs: 5000, loadMs: 5000, closedMax: 20, closedDays: 7 };
  var dbp = null;

  function openDb() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve) {
      var req = null;
      try { req = window.indexedDB ? window.indexedDB.open(DB_NAME, 1) : null; } catch (e) { req = null; }
      if (!req) { resolve(null); return; }
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains('snap')) d.createObjectStore('snap');
        if (!d.objectStoreNames.contains('img')) d.createObjectStore('img');
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
      req.onblocked = function () { resolve(null); };
    });
    return dbp;
  }
  /* one transaction; fn may return an IDBRequest (its result is the value) or any value filled in by the transaction */
  function run(names, mode, fn) {
    return openDb().then(function (d) {
      if (!d) return null;
      return new Promise(function (resolve, reject) {
        var t = d.transaction(names, mode), stores = {};
        names.forEach(function (n) { stores[n] = t.objectStore(n); });
        var r = fn(stores);
        t.oncomplete = function () { resolve(r instanceof IDBRequest ? r.result : r); };
        t.onerror = t.onabort = function () { reject(t.error); };
      });
    });
  }

  /* the layout is saved per project, so is the scrollback */
  function project() { try { return window.PMW && window.PMW.projectId ? window.PMW.projectId() : 'default'; } catch (e) { return 'default'; } }
  function keyFor(id) { return project() + '|' + id; }
  function ephemeral() { return !!(window.PMW && window.PMW.state && window.PMW.state.ephemeral); }

  /* ---- lines: used cells only, code points, style runs, flags and graphemes; cached per line version ---- */
  function packLine(line) {
    var w = line.wrapped ? 1 : 0;
    if (line._pk && line._pkVer === line.ver && line._pk.w === w) return line._pk;
    var n = line.lastUsed(), cp = line.cp.subarray(0, n), big = false, ph = false, x;
    for (x = 0; x < n; x++) if (cp[x] > 0xffff) { big = true; if (cp[x] === 0x10eeee) ph = true; }
    var runs = [], st = line.st;
    for (x = 0; x < n;) { var id = st[x], s = x; while (x < n && st[x] === id) x++; runs.push(id, x - s); }
    var fl = null;
    for (x = 0; x < n; x++) if (line.fl[x]) { fl = line.fl.slice(0, n); break; }
    var gr = null;
    if (line.gr && line.gr.size) { gr = []; line.gr.forEach(function (v, k) { if (k < n) gr.push(k, v); }); }
    var pk = { n: n, c: big ? cp.slice() : Uint16Array.from(cp), s: Uint32Array.from(runs), f: fl, g: gr, w: w, ph: ph };
    pk.b = pk.c.byteLength + pk.s.byteLength + (fl ? fl.byteLength : 0) + (gr ? gr.join('').length * 2 : 0) + 32;
    line._pk = pk; line._pkVer = line.ver;
    return pk;
  }
  function unpackLine(pk, cols, smap) {
    var line = new T.Line(cols), n = Math.min(pk.n, cols), x, k;
    for (x = 0; x < n; x++) line.cp[x] = pk.c[x];
    x = 0;
    for (k = 0; k < pk.s.length && x < cols; k += 2) { var id = smap[pk.s[k]] || 0, end = Math.min(cols, x + pk.s[k + 1]); while (x < end) line.st[x++] = id; }
    if (pk.f) line.fl.set(pk.f.subarray(0, n));
    if (pk.g) for (k = 0; k < pk.g.length; k += 2) if (pk.g[k] < cols) line.setGrapheme(pk.g[k], pk.g[k + 1]);
    line.wrapped = !!pk.w;
    line.restored = true;   /* placeholder cells on restored lines name restored images, never the new session's */
    return line;
  }

  /* ---- capture: what the terminal shows now, as one record (images still as live objects) ---- */
  function capture(session) {
    var term = session.term, buf = term.primary, store = term.images, B = store ? store.bufs.primary : null;
    var lines = buf.lines, end = lines.length, i;
    /* the command line being typed is not output: leave its prompt out */
    var cc = term.curCmd;
    if (cc && cc.promptLine && (cc.state === 'prompt' || cc.state === 'input')) { var pi = lines.lastIndexOf(cc.promptLine); if (pi >= 0) end = pi; }
    var index = new Map();
    for (i = 0; i < end; i++) index.set(lines[i], i);
    function rowOf(p) { if (p.parent) { var r = rowOf(p.parent); return r < 0 ? -1 : r + p.V; } var v = index.get(p.line); return v === undefined ? -1 : v; }
    /* images can reach below the last text line: keep their rows */
    var lastImg = -1;
    if (B) B.placements.forEach(function (p) { if (!p.virtual) { var r = rowOf(p); if (r >= 0) lastImg = Math.max(lastImg, r + p.rows - 1); } });
    while (end > 0 && end - 1 > lastImg && !lines[end - 1].mark && lines[end - 1].lastUsed() === 0) end--;
    var packs = [], textBytes = 0, phIds = null;
    for (i = 0; i < end; i++) {
      var pk = packLine(lines[i]); packs.push(pk); textBytes += pk.b;
      if (pk.ph && store) { store._placeholderRuns(lines[i]).forEach(function (c) { (phIds || (phIds = new Set())).add(c.id); }); }
    }
    function ix(l) { var v = l ? index.get(l) : undefined; return v === undefined || v >= end ? -1 : v; }
    var cmds = [];
    term.commands.forEach(function (c) {
      var p = ix(c.promptLine); if (p < 0) return;
      cmds.push({ cmdline: c.cmdline, cwd: c.cwd, by: c.by, exit: c.exit, start: c.start, end: c.end, state: c.state, empty: !!c.empty,
        ind: !!c.indeterminate, p: p, i: ix(c.inputLine), ic: c.inputCol || 0, o: ix(c.outputLine), e: ix(c.endLine), ec: c.endCol || 0 });
    });
    var imgs = [], imgIdx = new Map(), pls = [], plIdx = new Map();
    if (B) B.placements.forEach(function (p) {
      var row;
      /* placeholder cells hold the id the program chose; a restored image keeps it as phId */
      var phId = p.image.phId || p.image.id;
      if (p.virtual) {
        if (!phIds || !phIds.has(phId)) return;
        row = ix(p.line); if (row < 0) row = 0;
      } else {
        row = rowOf(p); if (row < 0 || row >= end) return;
        if (p.parent && !plIdx.has(p.parent)) return;
      }
      var ii = imgIdx.get(p.image);
      if (ii === undefined) { ii = imgs.length; imgIdx.set(p.image, ii); imgs.push({ im: p.image, first: row }); }
      else imgs[ii].first = Math.min(imgs[ii].first, row);
      plIdx.set(p, pls.length);
      pls.push({ img: ii, l: p.parent ? -1 : row, col: p.col, cols: p.cols, rows: p.rows, sx: p.sx, sy: p.sy, sw: p.sw, sh: p.sh,
        offX: p.offX, offY: p.offY, z: p.z, virtual: !!p.virtual, fit: !!p.fit, stretch: !!p.stretch, cuttable: !!p.cuttable,
        pid: p.pid, H: p.H, V: p.V, parent: p.parent ? plIdx.get(p.parent) : -1, masks: p.masks && p.masks.size ? Array.from(p.masks) : null,
        phId: p.virtual ? phId : 0 });
    });
    /* a cheap signature: an unchanged terminal (an animation stepping, a blink) is not written again */
    var sig = 0;
    for (i = 0; i < end; i++) sig = (sig * 31 + lines[i].id * 7 + lines[i].ver * 2 + (lines[i].wrapped ? 1 : 0)) | 0;
    sig = [sig, end, buf.trimmed, LIMITS.quota, term.styles.list.length, cmds.map(function (c) { return c.state + c.exit; }).join(), pls.length,
      imgs.map(function (e) { return e.im.frames.map(function (f) { return f.canvas ? f.canvas._gen || 0 : 'g'; }).join('.'); }).join()].join('|');
    return { sig: sig, cols: buf.cols, rows: buf.rows, packs: packs, textBytes: textBytes, cmds: cmds, imgs: imgs, pls: pls,
      styles: term.styles.list.map(function (s) { return { fg: s.fg, bg: s.bg, ul: s.ul, flags: s.flags, link: s.link }; }),
      links: term.links.list.map(function (l) { return l ? { uri: l.uri, params: Object.assign({}, l.params) } : null; }) };
  }

  /* PNG per frame, encoded once per frame content */
  function toBlob(cv) {
    if (cv.toBlob) return new Promise(function (resolve, reject) { cv.toBlob(function (b) { if (b) resolve(b); else reject(new Error('encode')); }, 'image/png'); });
    if (cv.convertToBlob) return cv.convertToBlob({ type: 'image/png' });
    return Promise.reject(new Error('encode'));
  }
  function encodeImage(im) {
    if (!im._suid) im._suid = T.uid('i');
    return Promise.all(im.frames.map(function (f, i) {
      var gen = f.canvas._gen || 0;
      if (f._png && f._pngGen === gen) return f._png;
      return toBlob(f.canvas).then(function (b) { f._png = { blob: b, key: im._suid + '#' + i + '@' + gen }; f._pngGen = gen; return f._png; });
    }));
  }

  /* ---- the saver: one per running session ---- */
  function Saver(session, id) {
    this.session = session; this.id = id; this.key = keyFor(id);
    this.timer = 0; this.first = 0; this.busy = null; this.again = false; this.dead = false;
    this.written = new Set();
    var self = this, term = session.term, soon = function () { self.soon(); };
    this.offs = [term.on('dirty', soon), term.on('command', soon), term.on('resize', soon)];
    this._vis = function () { if (document.visibilityState === 'hidden') self.now(); };
    this._hide = function () { self.now(); };
    document.addEventListener('visibilitychange', this._vis);
    window.addEventListener('pagehide', this._hide);
  }
  Saver.prototype.soon = function () {
    if (this.dead || ephemeral()) return;
    var now = Date.now(), self = this;
    if (!this.first) this.first = now;
    clearTimeout(this.timer);
    this.timer = setTimeout(function () { self.now(); }, Math.min(LIMITS.settleMs, Math.max(0, this.first + LIMITS.maxWaitMs - now)));
  };
  Saver.prototype.now = function (force) {
    clearTimeout(this.timer); this.timer = 0; this.first = 0;
    if (this.dead || ephemeral()) return Promise.resolve(false);
    var self = this;
    if (this.busy) {
      if (force) return this.busy.then(function () { return self.now(true); });   /* a forced save runs after the one in flight */
      this.again = true; return this.busy;
    }
    this.busy = save(this, force).catch(function (e) { console.warn('[pmt] scrollback not saved', e); return false; }).then(function (r) {
      self.busy = null;
      if (self.again && !self.dead) { self.again = false; self.soon(); }
      return r;
    });
    return this.busy;
  };
  Saver.prototype.dispose = function () {
    this.dead = true; clearTimeout(this.timer);
    this.offs.forEach(function (f) { f(); });
    document.removeEventListener('visibilitychange', this._vis);
    window.removeEventListener('pagehide', this._hide);
  };

  function save(sv, force) {
    var snap = capture(sv.session), budget = LIMITS.quota - snap.textBytes, used = 0, puts = [];
    if (!force && snap.sig === sv.sig) return Promise.resolve(false);
    /* images lowest in the scrollback are kept first; the oldest give way */
    var order = snap.imgs.map(function (e, i) { return i; }).sort(function (a, b) { return snap.imgs[b].first - snap.imgs[a].first; });
    return order.reduce(function (p, i) {
      return p.then(function () {
        var e = snap.imgs[i], im = e.im;
        if (im.ghost || used >= budget) { e.kept = false; return; }
        return encodeImage(im).then(function (frames) {
          var bytes = frames.reduce(function (s, f) { return s + f.blob.size; }, 0);
          if (used + bytes > budget) { e.kept = false; return; }
          used += bytes; e.kept = true; e.bytes = bytes;
          e.frames = frames.map(function (f, k) { return { key: f.key, gap: im.frames[k].gap || 0 }; });
          frames.forEach(function (f) { var k = sv.key + '|' + f.key; if (!sv.written.has(k)) puts.push([k, f.blob]); });
        }, function () { e.kept = false; });
      });
    }, Promise.resolve()).then(function () {
      if (sv.dead) return false;
      var rec = { v: 1, savedAt: Date.now(), cols: snap.cols, rows: snap.rows, lines: snap.packs, styles: snap.styles, links: snap.links,
        cmds: snap.cmds, pls: snap.pls, bytes: snap.textBytes + used,
        imgs: snap.imgs.map(function (e) {
          var im = e.im;
          return { kept: !!e.kept, frames: e.kept ? e.frames : [], w: im.w, h: im.h, name: im.name || '', source: im.source || 'kitty',
            current: im.current || 0, anim: { state: im.anim ? im.anim.state : 1, loops: im.anim ? im.anim.loops : 1 } };
        }) };
      var live = new Set();
      rec.imgs.forEach(function (e) { e.frames.forEach(function (f) { live.add(sv.key + '|' + f.key); }); });
      return run(['snap', 'img'], 'readwrite', function (s) {
        puts.forEach(function (p) { s.img.put(p[1], p[0]); });
        s.snap.put(rec, sv.key);
        /* frames no longer referenced go */
        var cur = s.img.openKeyCursor(IDBKeyRange.bound(sv.key + '|', sv.key + '|\uffff'));
        cur.onsuccess = function () { var c = cur.result; if (!c) return; if (!live.has(c.key)) s.img.delete(c.key); c.continue(); };
      }).then(function () {
        sv.sig = snap.sig;
        puts.forEach(function (p) { sv.written.add(p[0]); });
        sv.written.forEach(function (k) { if (!live.has(k)) sv.written.delete(k); });
        sv.last = { at: rec.savedAt, lines: rec.lines.length, images: rec.imgs.filter(function (e) { return e.kept; }).length,
          dropped: rec.imgs.filter(function (e) { return !e.kept; }).length, bytes: rec.bytes, text: snap.textBytes,
          detail: snap.imgs.map(function (e) { return { name: e.im.name || e.im.source, row: e.first, kept: !!e.kept, bytes: e.bytes || 0 }; }) };
        return true;
      });
    });
  }

  /* ---- load and restore ---- */
  function decodeFrame(blob) {
    return createImageBitmap(blob).then(function (bmp) {
      var c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
      c.getContext('2d').drawImage(bmp, 0, 0); if (bmp.close) bmp.close();
      return c;
    });
  }
  function load(id) {
    var key = keyFor(id);
    var work = run(['snap'], 'readonly', function (s) { return s.snap.get(key); }).then(function (rec) {
      if (!rec || rec.v !== 1 || !rec.lines) return null;
      var keys = [];
      rec.imgs.forEach(function (e) { if (e.kept) e.frames.forEach(function (f) { keys.push(key + '|' + f.key); }); });
      return (keys.length ? run(['img'], 'readonly', function (s) {
        var m = new Map();
        keys.forEach(function (k) { var r = s.img.get(k); r.onsuccess = function () { if (r.result) m.set(k, r.result); }; });
        return m;
      }) : Promise.resolve(new Map())).then(function (blobs) {
        /* an image whose frames cannot all be read back becomes a placeholder */
        return Promise.all(rec.imgs.map(function (e) {
          if (!e.kept) return null;
          return Promise.all(e.frames.map(function (f) {
            var b = blobs.get(key + '|' + f.key);
            if (!b) return Promise.reject(new Error('missing'));
            return decodeFrame(b).then(function (c) { return { canvas: c, gap: f.gap }; });
          })).catch(function () { return null; });
        })).then(function (decoded) { return { rec: rec, decoded: decoded }; });
      });
    });
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve('timeout'); }, LIMITS.loadMs); });
    return Promise.race([work, timeout]).catch(function (e) { console.warn('[pmt] saved scrollback not read', e); return null; });
  }

  function when(t) {
    var d = new Date(t), now = new Date();
    var hm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === now.toDateString() ? hm : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + hm;
  }

  /* puts the saved lines, marks and images into a session that has not started yet; the caller starts it */
  function restore(session, o) {
    var rec = o.rec, term = session.term, buf = term.primary, store = term.images;
    var c0 = term.cols, r0 = term.rows;
    if (term.cols !== rec.cols) term.resize(rec.cols, r0);
    var lmap = (rec.links || []).map(function (l, i) { return i && l ? term.links.id(l.uri, l.params) : 0; });
    var smap = rec.styles.map(function (s) { return term.styles.id({ fg: s.fg, bg: s.bg, ul: s.ul, flags: s.flags, link: s.link ? (lmap[s.link] || 0) : 0 }); });
    var drop = Math.max(0, rec.lines.length - (buf.maxScrollback + buf.rows - 1));
    var lines = rec.lines.map(function (pk, i) { return i < drop ? null : unpackLine(pk, rec.cols, smap); });
    function L(i) { return i >= drop && i < lines.length ? lines[i] : null; }
    rec.cmds.forEach(function (c) {
      var pl = L(c.p); if (!pl) return;
      /* a command still running when the page went away ended with it: its block is indeterminate, never "done ok" */
      var open = c.state !== 'done';
      var cmd = { id: ++term.cmdSeq, cmdline: c.cmdline, cwd: c.cwd, by: c.by, exit: open ? null : c.exit, start: c.start, end: c.end || rec.savedAt,
        promptLine: pl, inputLine: L(c.i), inputCol: c.ic, outputLine: L(c.o), endLine: L(c.e), endCol: c.ec, state: 'done',
        empty: c.empty, restored: true, indeterminate: open || c.ind };
      pl.mark = { cmd: cmd, kind: 'prompt' };
      term.commands.push(cmd);
    });
    var kept = lines.slice(drop), out = kept.slice(), rows = buf.rows, y;
    if (out.length < rows) { y = out.length; while (out.length < rows) out.push(new T.Line(rec.cols)); }
    else { out.push(new T.Line(rec.cols)); y = rows - 1; }
    buf.lines = out; buf.trimmed = 0;
    buf.cursor.x = 0; buf.cursor.y = y; buf.cursor.pendingWrap = false;

    var shown = 0, ghosts = 0;
    var B = store ? store.bufs.primary : null;
    if (B) {
      B.phAlias = new Map();
      var ims = rec.imgs.map(function (e, i) {
        var frames = o.decoded[i];
        if (!frames || !frames.length) {
          ghosts++;
          return { ghost: true, id: 0, clientId: 0, number: 0, w: e.w, h: e.h, name: e.name, source: e.source, frames: [], current: 0, phId: 0,
            anim: { state: 1, loops: 1, played: 0 }, bytes: 0, transient: false, lastUsed: 0, gen: 1 };
        }
        shown++;
        var bytes = e.w * e.h * 4;
        var im = { id: store._freeId(B, true), clientId: 0, number: 0, w: e.w, h: e.h, frames: frames, current: Math.min(e.current || 0, frames.length - 1),
          anim: { state: e.anim ? e.anim.state : 1, loops: e.anim ? e.anim.loops : 1, played: 0 }, bytes: bytes, transient: false,
          lastUsed: Date.now(), gen: 1, source: e.source, name: e.name, restored: true, phId: 0 };
        B.images.set(im.id, im); B.bytes += bytes; B.frameBytes += (frames.length - 1) * bytes;
        return im;
      });
      var made = [];
      rec.pls.forEach(function (q, i) {
        var im = ims[q.img], parent = q.parent >= 0 ? made[q.parent] : null;
        if (q.parent >= 0 && !parent) return;
        var line = parent ? parent.line : L(q.l);
        if (!line) { if (!q.virtual) return; line = kept[0]; }
        if (!line) return;
        var pl = { image: im, pid: q.pid, line: line, col: q.col, cols: q.cols, rows: q.rows, sx: q.sx, sy: q.sy, sw: q.sw, sh: q.sh,
          offX: q.offX, offY: q.offY, z: q.z, virtual: q.virtual, fit: q.fit, stretch: q.stretch, parent: parent, H: q.H, V: q.V,
          masks: q.masks ? new Set(q.masks) : null, cuttable: q.cuttable };
        B.placements.push(pl); made[i] = pl;
        if (q.virtual && q.phId) { B.phAlias.set(q.phId, im); im.phId = q.phId; }
      });
    }
    /* a dim rule between the saved scrollback and the new session */
    term.write('\x1b[2m── Restored ' + when(rec.savedAt) + ' · the earlier session ended ──\x1b[0m\r\n');
    if (term.cols !== c0 || term.rows !== r0) term.resize(c0, r0);
    if (store) { (B ? Array.from(B.images.values()) : []).forEach(function (im) { if (im.restored) store._startAnim(im); }); store.bump(); }
    term.emit('dirty');
    return { lines: kept.length, commands: term.commands.length, images: shown, dropped: ghosts };
  }

  function forgetKeys(s, keys) {
    keys.forEach(function (key) { s.snap.delete(key); s.img.delete(IDBKeyRange.bound(key + '|', key + '|\uffff')); });
  }
  function forget(id) {
    return run(['snap', 'img'], 'readwrite', function (s) { forgetKeys(s, [keyFor(id)]); }).catch(function () { return null; });
  }
  /* closed terminals, newest last, in one small record per project: [{ id, at }]; past the reopen stack or 7 days they go */
  function editClosed(fn) {
    var ck = project() + '|#closed', out = {};
    return run(['snap', 'img'], 'readwrite', function (s) {
      var r = s.snap.get(ck);
      r.onsuccess = function () {
        var list = Array.isArray(r.result) ? r.result : [], res = fn(list), cut = Date.now() - LIMITS.closedDays * 864e5;
        var keep = res.list.filter(function (e) { return e.at >= cut; });
        if (keep.length > LIMITS.closedMax) keep = keep.slice(keep.length - LIMITS.closedMax);
        var kept = new Set(keep.map(function (e) { return e.id; }));
        forgetKeys(s, res.list.filter(function (e) { return !kept.has(e.id); }).map(function (e) { return keyFor(e.id); }));
        s.snap.put(keep, ck);
        out.value = res.value;
      };
      return out;
    }).then(function (o) { return o ? o.value : false; }, function () { return false; });
  }
  /* the tab closed: keep its scrollback while it can be reopened */
  function markClosed(id) {
    return editClosed(function (list) { return { list: list.filter(function (e) { return e.id !== id; }).concat([{ id: id, at: Date.now() }]) }; });
  }
  /* a tab mounts without a live session: is it a closed terminal coming back? It leaves the closed list either way */
  function reopening(id) {
    return editClosed(function (list) {
      return { list: list.filter(function (e) { return e.id !== id; }), value: list.some(function (e) { return e.id === id; }) };
    });
  }

  T.Saved = {
    LIMITS: LIMITS,
    watch: function (session, id) { return new Saver(session, id); },
    load: load,
    restore: restore,
    forget: forget,
    markClosed: markClosed,
    reopening: reopening,
    /* label for an image the quota dropped (or that could not be read back) */
    label: function (im, short) {
      /* the separator stays with the word before it when the label wraps in a small box */
      return '[' + (im.name || (im.source === 'kitty' ? 'kitty image' : 'image')) + (short ? '' : ' ' + im.w + '×' + im.h) + '\u00a0· not kept]';
    }
  };
})();
