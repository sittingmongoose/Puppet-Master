/* iTerm2 inline images (OSC 1337 File=, and MultipartFile / FilePart / FileEnd from iTerm2 3.5) into the same image
   store. Sizes in cells, px, % or auto; preserveAspectRatio; height capped at 255 rows; width capped at the columns left
   of the cursor. inline=0 (a download) is refused with a one-line notice. The file name is shown only when it decodes
   to printable text. Limits: 1 MiB per FilePart sequence (iTerm2's own), 16 MiB of base64 per image. */
(function () {
  var MAX_PART = 1024 * 1024, MAX_TOTAL = 16 * 1024 * 1024;
  function parseArgs(str) {
    var out = {};
    str.split(';').forEach(function (kv) { var e = kv.indexOf('='); if (e > 0) out[kv.slice(0, e)] = kv.slice(e + 1); });
    return out;
  }
  function sniff(b) {
    if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
    if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
    if (b[0] === 0x47 && b[1] === 0x49) return 'image/gif';
    if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57) return 'image/webp';
    return null;
  }
  function cells(spec, imgPx, cellPx, gridCells) {
    if (!spec || spec === 'auto') return null;
    var m = /^(\d+)(px|%)?$/.exec(spec);
    if (!m) return null;
    var n = +m[1];
    if (m[2] === 'px') return Math.max(1, Math.ceil(n / cellPx));
    if (m[2] === '%') return Math.max(1, Math.ceil(gridCells * Math.min(100, n) / 100));
    return Math.max(1, n);
  }
  function show(store, args, b64) {
    var term = store.term;
    if (args.inline !== '1') { if (store.session && store.session.emit) store.session.emit('notice', { text: 'A program offered a file download; downloads from the terminal are not supported here.' }); return; }
    var bytes = T.base64.decode(b64);
    if (!bytes || !bytes.length) return;
    var mime = sniff(bytes);
    if (!mime) return;
    var name = '';
    if (args.name) { var nb = T.base64.decode(args.name); if (nb) { var nm = T.util.utf8Decode(nb); if (/^[\x20-\x7e]{1,120}$/.test(nm)) name = nm.replace(/^.*\//, ''); } }
    term.hold();
    var blob = new Blob([bytes], { type: mime });
    var done = function () { term.release(); };
    (typeof createImageBitmap !== 'undefined' ? createImageBitmap(blob) : Promise.reject()).then(function (bmp) {
      if (bmp.width > T.IMAGE_LIMITS.maxDim || bmp.height > T.IMAGE_LIMITS.maxDim) return;
      var cell = store._cellPx(), buf = term.buf;
      var cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height; cv.getContext('2d').drawImage(bmp, 0, 0);
      var w = cells(args.width, bmp.width, cell.w, buf.cols), h = cells(args.height, bmp.height, cell.h, buf.rows);
      var keep = args.preserveAspectRatio !== '0';
      if (!w && !h) { w = Math.ceil(bmp.width / cell.w); h = Math.ceil(bmp.height / cell.h); }
      else if (!w) w = Math.max(1, Math.ceil(h * cell.h * bmp.width / bmp.height / cell.w));
      else if (!h) h = Math.max(1, Math.ceil(w * cell.w * bmp.height / bmp.width / cell.h));
      var room = buf.cols - buf.cursor.x;
      if (w > room) { h = Math.max(1, Math.round(h * room / w)); w = room; }
      h = Math.min(255, h);
      var o = { source: 'iterm', name: name || 'inline image', cols: w, rows: h, itermCursor: true };
      if (!keep) { o.stretch = true; }
      store.addCellImage(cv, o);
    }).then(done, done);
  }
  T.ITerm = {
    handle: function (store, rest, overflow) {
      if (overflow) { store.multipart = null; return; }
      if (/^File=/.test(rest)) {
        var colon = rest.indexOf(':');
        if (colon < 0) return;
        var data = rest.slice(colon + 1);
        if (data.length > MAX_TOTAL) return;
        show(store, parseArgs(rest.slice(5, colon)), data);
        return;
      }
      if (/^MultipartFile=/.test(rest)) { store.multipart = { args: parseArgs(rest.slice(14)), parts: [], size: 0 }; return; }
      if (/^FilePart=/.test(rest)) {
        var mp = store.multipart; if (!mp) return;
        var part = rest.slice(9);
        if (part.length > MAX_PART) { store.multipart = null; return; }
        mp.size += part.length; if (mp.size > MAX_TOTAL) { store.multipart = null; return; }
        mp.parts.push(part); return;
      }
      if (rest === 'FileEnd') { var m2 = store.multipart; store.multipart = null; if (m2) show(store, m2.args, m2.parts.join('')); return; }
      if (rest === 'ReportCellSize') { var c = store._cellPx(); store.term.reply('\x1b]1337;ReportCellSize=' + c.h.toFixed(1) + ';' + c.w.toFixed(1) + ';1\x07'); return; }
      if (rest === 'Capabilities') { store.term.reply('\x1b]1337;Capabilities=FSx\x07'); }
    }
  };
})();
