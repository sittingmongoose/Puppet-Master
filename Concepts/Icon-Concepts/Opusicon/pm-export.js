/* ============================================================================
   Opusicon / pm-export.js
   Data-URI encoding, PNG rasterisation and a minimal ZIP writer.

   Every technique here was chosen because of a specific verified browser
   behaviour, noted inline. The overriding constraint: the page must work when
   double-clicked from Finder (file://), where fetch() of sibling files is
   blocked by Chrome. Nothing in this file performs a network request.
   ============================================================================ */
(function (root) {
  'use strict';

  /* --------------------------------------------------------------------------
     SVG string -> data: URI

     '#' MUST be percent-encoded or the URI truncates at the first hex colour
     (everything after '#' is a fragment identifier), and the image silently
     fails to load. '&' must be escaped too: assigning through innerHTML runs
     the value past the HTML entity parser, which can mangle it into invalid
     XML. Swapping " for ' first is legal in XML and cuts ~35% of the escaping.
     -------------------------------------------------------------------------- */
  function dataURI(svg) {
    var body = svg;
    // Swapping " for ' is legal XML and cuts ~35% of the escaping -- but ONLY
    // when the document contains no single quotes of its own. The lockup's
    // font stack does (font-family="'Cal Sans','Nunito',...}"), and swapping
    // there produces font-family=''Cal Sans',...'' which is invalid XML: the
    // image fails to parse and renders as nothing, silently. Guard the swap.
    if (body.indexOf("'") === -1) body = body.replace(/"/g, "'");
    return 'data:image/svg+xml;charset=utf-8,' + body
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/[%#<>?[\]^`{|}\\"&\r\n]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
      });
  }

  function loadImage(uri) {
    return new Promise(function (res, rej) {
      var i = new Image();
      i.onload = function () { res(i); };
      i.onerror = function () { rej(new Error('SVG failed to decode')); };
      i.src = uri;   // no crossOrigin: data: URIs never taint the canvas
    });
  }

  function b64ToBytes(b64) {
    var bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }

  /* --------------------------------------------------------------------------
     SVG -> PNG bytes at an exact pixel size.

     Uses toDataURL, NOT toBlob. toBlob dispatches its callback through a task
     queue that gets background-throttled to ~1Hz, so a 56-file export loop
     takes ~60s and looks hung. toDataURL is synchronous and immune.

     devicePixelRatio is deliberately NOT applied: "512px PNG" must mean 512
     device pixels, or we ship 1024s labelled 512.

     Note: a CSS animation inside the SVG rasterises at its t=0 frame. Pass
     `phase` (0..1) to sample any other frame -- buildSVG bakes in a negative
     animation-delay with animation-play-state:paused, which the compositor
     evaluates exactly.
     -------------------------------------------------------------------------- */
  function toPNG(svgSource, size) {
    return loadImage(dataURI(svgSource)).then(function (img) {
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      var cx = c.getContext('2d', { alpha: true });
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = 'high';
      cx.clearRect(0, 0, size, size);
      cx.drawImage(img, 0, 0, size, size);   // 5-arg: explicit destination size
      var url = c.toDataURL('image/png');
      if (url.indexOf('data:image/png') !== 0) throw new Error('PNG encode failed');
      return b64ToBytes(url.slice(url.indexOf(',') + 1));
    });
  }

  /* Same, for non-square artwork (the lockup). */
  function toPNGRect(svgSource, w, h) {
    return loadImage(dataURI(svgSource)).then(function (img) {
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var cx = c.getContext('2d', { alpha: true });
      cx.imageSmoothingQuality = 'high';
      cx.clearRect(0, 0, w, h);
      cx.drawImage(img, 0, 0, w, h);
      var url = c.toDataURL('image/png');
      return b64ToBytes(url.slice(url.indexOf(',') + 1));
    });
  }

  /* --------------------------------------------------------------------------
     Minimal ZIP writer, STORE method (compression 0).

     Why no DEFLATE: PNGs are already compressed, so the only gain would be on
     SVG text, and CompressionStream is async -- which reintroduces the
     throttling hazard above. STORE is in the original PKZIP spec and opens
     natively in macOS Finder, Windows Explorer and Linux unzip.

     CRC-32/ISO-HDLC, polynomial 0xEDB88320 (bit-reversed 0x04C11DB7).
     Check value: crc32("123456789") === 0xCBF43926.
     -------------------------------------------------------------------------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function dosDateTime(d) {
    return {
      time: ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31),
      date: (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31)
    };
  }

  /* files: [{ name: 'svg/x.svg', data: Uint8Array | string }] -> Uint8Array */
  function zipStore(files, when) {
    var enc = new TextEncoder();
    var dt = dosDateTime(when || new Date());
    var locals = [], centrals = [], offset = 0, n = 0;

    files.forEach(function (f) {
      var nameBytes = enc.encode(f.name);
      var data = (f.data instanceof Uint8Array) ? f.data : enc.encode(String(f.data));
      var crc = crc32(data);

      var lh = new Uint8Array(30 + nameBytes.length);
      var lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);        // bit 11: filename is UTF-8
      lv.setUint16(8, 0, true);             // STORE
      lv.setUint16(10, dt.time, true);
      lv.setUint16(12, dt.date, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      locals.push(lh, data);

      var ch = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 0x031E, true);        // made by UNIX / spec 3.0
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dt.time, true);
      cv.setUint16(14, dt.date, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true); cv.setUint16(36, 0, true);
      cv.setUint32(38, (0x81A4 << 16) >>> 0, true);   // -rw-r--r--
      cv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      centrals.push(ch);

      offset += lh.length + data.length;
      n++;
    });

    var cdSize = centrals.reduce(function (s, c) { return s + c.length; }, 0);
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true); ev.setUint16(6, 0, true);
    ev.setUint16(8, n, true); ev.setUint16(10, n, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    var parts = locals.concat(centrals, [eocd]);
    var total = parts.reduce(function (s, p) { return s + p.length; }, 0);
    var out = new Uint8Array(total), o = 0;
    parts.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }

  /* Single download per gesture. Chrome prompts (or silently blocks) on the
     2nd+ programmatic download from one origin, and under file:// the origin
     is opaque so the permission is not durably grantable. Bulk goes via zip. */
  function save(payload, name, mime) {
    var blob = new Blob([payload], { type: mime || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; },
        function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  root.PMExport = {
    dataURI: dataURI, loadImage: loadImage,
    toPNG: toPNG, toPNGRect: toPNGRect,
    crc32: crc32, zipStore: zipStore, save: save, copy: copy
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
