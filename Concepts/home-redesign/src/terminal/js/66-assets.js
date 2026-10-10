/* T.Assets: procedural images for the image demos (ARCHITECTURE.md section 4). Nothing is fetched: every picture is
   drawn on a canvas, then encoded with canvas.toBlob (PNG, JPEG) or by the small GIF89a encoder below (animation).
   Names: bench (bar chart in the proposal mock's look), chart (line chart), logo (the Puppet Master mark of strings and
   a hand-cross, no text), photo (a calm landscape), spinner (12-frame animation), avatar.
   Browser only: in node every entry point reports unavailable instead of throwing at load time. */
(function () {
  var hasDOM = typeof document !== 'undefined' && !!document.createElement;
  var cache = new Map();          /* encoded bytes: key -> Promise<Uint8Array> */
  var rgbaCache = new Map();      /* small LRU of decoded pixels */
  var RGBA_KEEP = 8;

  function canvas(w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
    return c;
  }
  function ctx2d(c) { return c.getContext('2d', { willReadFrequently: true }) || c.getContext('2d'); }
  /* deterministic noise */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function ridge(x, seed, amp, freq) {
    /* a hill line: a few sines with fixed phases */
    var r = rng(seed), p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28;
    return amp * (0.55 * Math.sin(x * freq + p1) + 0.3 * Math.sin(x * freq * 2.3 + p2) + 0.15 * Math.sin(x * freq * 5.1 + p3));
  }

  /* ------------------------------------------------------------------ drawings */
  var DRAW = {
    /* the proposal mock: eight green bars on the terminal background, with a faint baseline and grid */
    bench: function (g, w, h) {
      var sx = w / 150, sy = h / 36;
      g.clearRect(0, 0, w, h);
      g.strokeStyle = 'rgba(140,150,160,0.22)';
      g.lineWidth = Math.max(1, Math.round(sy * 0.25));
      g.setLineDash([Math.max(2, 3 * sx), Math.max(2, 3 * sx)]);
      [4, 14, 24].forEach(function (y) { g.beginPath(); g.moveTo(0, Math.round(y * sy) + 0.5); g.lineTo(w, Math.round(y * sy) + 0.5); g.stroke(); });
      g.setLineDash([]);
      var hs = [14, 20, 12, 26, 18, 30, 22, 28];
      hs.forEach(function (bh, i) {
        var x = Math.round((2 + 18 * i) * sx), bw = Math.round(14 * sx), y = Math.round((34 - bh) * sy), y2 = Math.round(34 * sy);
        var grad = g.createLinearGradient(0, y, 0, y2);
        grad.addColorStop(0, '#74d497'); grad.addColorStop(1, '#4fb374');
        g.fillStyle = grad;
        g.fillRect(x, y, bw, y2 - y);
        g.fillStyle = 'rgba(255,255,255,0.28)';
        g.fillRect(x, y, bw, Math.max(1, Math.round(sy * 0.5)));
      });
      g.fillStyle = 'rgba(140,150,160,0.55)';
      g.fillRect(0, Math.round(34 * sy), w, Math.max(1, Math.round(sy * 0.3)));
    },

    /* p50 and p99 request latency over 30 runs, with an area under p50 and a small legend */
    chart: function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var padL = Math.round(w * 0.04), padR = Math.round(w * 0.03), padT = Math.round(h * 0.16), padB = Math.round(h * 0.1);
      var pw = w - padL - padR, ph = h - padT - padB, n = 30, r = rng(7);
      var p50 = [], p99 = [], a = 0.42, b = 0.7;
      for (var i = 0; i < n; i++) {
        a += (r() - 0.55) * 0.05; a = Math.min(0.6, Math.max(0.18, a));
        b = a + 0.22 + r() * 0.12 + (i === 17 ? 0.16 : 0);
        p50.push(a); p99.push(Math.min(0.97, b));
      }
      var X = function (k) { return padL + pw * k / (n - 1); }, Y = function (v) { return padT + ph * (1 - v); };
      g.strokeStyle = 'rgba(140,150,160,0.2)'; g.lineWidth = 1;
      for (var q = 0; q <= 4; q++) { var y = Math.round(padT + ph * q / 4) + 0.5; g.beginPath(); g.moveTo(padL, y); g.lineTo(padL + pw, y); g.stroke(); }
      for (q = 0; q < n; q += 5) { var x = Math.round(X(q)) + 0.5; g.beginPath(); g.moveTo(x, padT + ph); g.lineTo(x, padT + ph + Math.max(3, h * 0.02)); g.stroke(); }
      function line(vals, color, width) {
        g.beginPath();
        vals.forEach(function (v, k) { var px = X(k), py = Y(v); if (!k) g.moveTo(px, py); else g.lineTo(px, py); });
        g.strokeStyle = color; g.lineWidth = width; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
      }
      var area = g.createLinearGradient(0, padT, 0, padT + ph);
      area.addColorStop(0, 'rgba(79,179,217,0.38)'); area.addColorStop(1, 'rgba(79,179,217,0)');
      g.beginPath(); g.moveTo(X(0), Y(0));
      p50.forEach(function (v, k) { g.lineTo(X(k), Y(v)); });
      g.lineTo(X(n - 1), Y(0)); g.closePath(); g.fillStyle = area; g.fill();
      var lw = Math.max(1.5, w / 320);
      line(p99, '#e0a84f', lw); line(p50, '#4fb3d9', lw * 1.3);
      [[p50, '#4fb3d9'], [p99, '#e0a84f']].forEach(function (s) {
        g.beginPath(); g.arc(X(n - 1), Y(s[0][n - 1]), lw * 2.2, 0, Math.PI * 2); g.fillStyle = s[1]; g.fill();
      });
      var fs = Math.max(9, Math.round(h * 0.055));
      g.font = fs + 'px ui-monospace, "JetBrains Mono", Menlo, monospace';
      g.textBaseline = 'middle';
      var ly = Math.round(padT * 0.5), lx = padL;
      [['p50', '#4fb3d9'], ['p99', '#e0a84f']].forEach(function (s) {
        g.fillStyle = s[1]; g.fillRect(lx, ly - 1, fs * 1.4, Math.max(2, fs * 0.22));
        g.fillStyle = 'rgba(150,158,168,0.95)'; g.fillText(s[0], lx + fs * 1.8, ly);
        lx += fs * 5;
      });
      g.fillStyle = 'rgba(150,158,168,0.8)'; g.textAlign = 'right';
      g.fillText('ms', padL + pw, ly);
      g.textAlign = 'left';
    },

    /* the Puppet Master mark: a hand-cross (control bar and grip) with strings hanging to small weights. No text. */
    logo: function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var s = Math.min(w, h), ox = (w - s) / 2, oy = (h - s) / 2;
      var P = function (x, y) { return [ox + x * s, oy + y * s]; };
      var grad = g.createLinearGradient(ox, oy, ox + s, oy + s);
      grad.addColorStop(0, '#9b8cff'); grad.addColorStop(0.55, '#6c8cff'); grad.addColorStop(1, '#2dd4bf');
      var t = Math.max(1, s * 0.055);
      /* strings first so the bar sits on top */
      var tops = [P(0.17, 0.3), P(0.38, 0.3), P(0.5, 0.13), P(0.62, 0.3), P(0.83, 0.3)];
      var ends = [P(0.26, 0.78), P(0.4, 0.88), P(0.5, 0.62), P(0.6, 0.88), P(0.74, 0.78)];
      g.lineCap = 'round';
      tops.forEach(function (a, i) {
        var e = ends[i];
        g.strokeStyle = 'rgba(160,170,255,0.75)';
        g.lineWidth = Math.max(1, s * 0.012);
        g.beginPath(); g.moveTo(a[0], a[1]);
        g.quadraticCurveTo((a[0] + e[0]) / 2 + (i - 2) * s * 0.01, (a[1] + e[1]) / 2, e[0], e[1]);
        g.stroke();
        g.beginPath(); g.arc(e[0], e[1], Math.max(1.5, s * (i === 2 ? 0.05 : 0.032)), 0, Math.PI * 2);
        g.fillStyle = i === 2 ? '#2dd4bf' : '#8b9cff'; g.fill();
      });
      /* the control bar and the grip crossing it */
      g.strokeStyle = grad; g.lineWidth = t;
      g.beginPath(); g.moveTo(P(0.14, 0.3)[0], P(0.14, 0.3)[1]); g.lineTo(P(0.86, 0.3)[0], P(0.86, 0.3)[1]); g.stroke();
      g.beginPath(); g.moveTo(P(0.5, 0.1)[0], P(0.5, 0.1)[1]); g.lineTo(P(0.5, 0.46)[0], P(0.5, 0.46)[1]); g.stroke();
      g.lineWidth = t * 0.8;
      g.beginPath(); g.moveTo(P(0.36, 0.42)[0], P(0.36, 0.42)[1]); g.lineTo(P(0.64, 0.42)[0], P(0.64, 0.42)[1]); g.stroke();
      [P(0.14, 0.3), P(0.86, 0.3), P(0.5, 0.1)].forEach(function (p) {
        g.beginPath(); g.arc(p[0], p[1], t * 0.75, 0, Math.PI * 2); g.fillStyle = '#c7c0ff'; g.fill();
      });
    },

    /* dusk over hills and a still lake */
    photo: function (g, w, h, o) {
      var horizon = Math.round(h * 0.66);
      var sky = g.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, '#1d2747'); sky.addColorStop(0.45, '#4b4f7c'); sky.addColorStop(0.8, '#c98a86'); sky.addColorStop(1, '#f1b98c');
      g.fillStyle = sky; g.fillRect(0, 0, w, horizon);
      var sx = w * 0.66, sy = horizon - h * 0.07, sr = Math.max(2, w * 0.035);
      var glow = g.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 7);
      glow.addColorStop(0, 'rgba(255,224,170,0.75)'); glow.addColorStop(1, 'rgba(255,224,170,0)');
      g.fillStyle = glow; g.fillRect(0, 0, w, horizon);
      g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fillStyle = '#ffe7bd'; g.fill();
      var layers = [
        { base: 0.5, amp: 0.07, freq: 3.1, color: 'rgba(104,98,146,0.85)', seed: 3 },
        { base: 0.56, amp: 0.06, freq: 4.3, color: 'rgba(72,74,118,0.95)', seed: 11 },
        { base: 0.62, amp: 0.045, freq: 6.2, color: '#323a5e', seed: 23 }
      ];
      layers.forEach(function (L) {
        g.beginPath(); g.moveTo(0, horizon);
        for (var x = 0; x <= w; x += Math.max(1, w / 200)) g.lineTo(x, h * L.base - ridge(x / w, L.seed, h * L.amp, L.freq * 2));
        g.lineTo(w, horizon); g.closePath(); g.fillStyle = L.color; g.fill();
      });
      /* the lake: the sky mirrored, darker, with a few calm ripples */
      var lake = g.createLinearGradient(0, horizon, 0, h);
      lake.addColorStop(0, '#d39a86'); lake.addColorStop(0.25, '#6d5f86'); lake.addColorStop(1, '#151b33');
      g.fillStyle = lake; g.fillRect(0, horizon, w, h - horizon);
      var refl = g.createLinearGradient(0, horizon, 0, horizon + h * 0.2);
      refl.addColorStop(0, 'rgba(255,226,180,0.55)'); refl.addColorStop(1, 'rgba(255,226,180,0)');
      g.fillStyle = refl; g.fillRect(sx - sr * 1.3, horizon, sr * 2.6, h * 0.2);
      var r = rng(5);
      g.strokeStyle = 'rgba(255,235,210,0.18)'; g.lineWidth = Math.max(1, h / 300);
      for (var k = 0; k < 26; k++) {
        var yy = horizon + (h - horizon) * Math.pow(r(), 1.4), xx = r() * w, len = w * (0.03 + r() * 0.12);
        g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + len, yy); g.stroke();
      }
      g.fillStyle = 'rgba(12,16,32,0.9)';
      g.beginPath(); g.moveTo(0, h);
      for (var x2 = 0; x2 <= w * 0.42; x2 += Math.max(1, w / 200)) g.lineTo(x2, h - h * 0.06 - ridge(x2 / w, 41, h * 0.025, 9) - (w * 0.42 - x2) / w * h * 0.12);
      g.lineTo(w * 0.42, h); g.closePath(); g.fill();
      if (o && o.grain) {
        var img = g.getImageData(0, 0, w, h), d = img.data, rr = rng(99), amp = o.grain;
        for (var p = 0; p < d.length; p += 4) { var n = (rr() - 0.5) * amp * 2; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
        g.putImageData(img, 0, 0);
      }
    },

    /* twelve spokes; the bright one moves one step per frame */
    spinner: function (g, w, h, o) {
      g.clearRect(0, 0, w, h);
      var n = (o && o.frames) || 12, f = (o && o.frame) || 0, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42, r0 = R * 0.48;
      g.lineCap = 'round'; g.lineWidth = Math.max(1.5, Math.min(w, h) * 0.085);
      for (var k = 0; k < 12; k++) {
        var age = ((f * 12 / n - k) % 12 + 12) % 12, a = k / 12 * Math.PI * 2 - Math.PI / 2;
        var alpha = 1 - age / 12 * 0.85;
        g.strokeStyle = 'rgba(139,124,246,' + alpha.toFixed(3) + ')';
        g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
      }
    },

    avatar: function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var s = Math.min(w, h), cx = w / 2, cy = h / 2;
      g.save();
      g.beginPath(); g.arc(cx, cy, s / 2, 0, Math.PI * 2); g.clip();
      var bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#f6b04a'); bg.addColorStop(1, '#e2574c');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,245,235,0.92)';
      g.beginPath(); g.arc(cx, cy - s * 0.1, s * 0.18, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(cx, cy + s * 0.42, s * 0.34, s * 0.26, 0, Math.PI, 0); g.fill();
      g.restore();
    }
  };

  /* ------------------------------------------------------------------ GIF89a encoder (fixed 6x7x6 palette) */
  function paletteIndex(r, g, b, a) {
    if (a < 128) return 255;
    return Math.round(r / 51) * 42 + Math.round(g / 42.5) * 6 + Math.round(b / 51);
  }
  function lzw(indices, minSize, out) {
    var clear = 1 << minSize, eoi = clear + 1, next = eoi + 1, size = minSize + 1, maxcode = (1 << size) - 1;
    var dict = new Map(), acc = 0, nbits = 0, bytes = [], clearFlag = false;
    function emit(code) {
      acc |= code << nbits; nbits += size;
      while (nbits >= 8) { bytes.push(acc & 255); acc >>>= 8; nbits -= 8; }
      if (next > maxcode || clearFlag) {
        if (clearFlag) { size = minSize + 1; maxcode = (1 << size) - 1; clearFlag = false; }
        else { size++; maxcode = size === 12 ? 4096 : (1 << size) - 1; }
      }
    }
    emit(clear);
    var ent = indices[0];
    for (var i = 1; i < indices.length; i++) {
      var c = indices[i], key = (ent << 8) | c, hit = dict.get(key);
      if (hit !== undefined) { ent = hit; continue; }
      emit(ent);
      ent = c;
      if (next < 4096) dict.set(key, next++);
      else { dict.clear(); next = eoi + 1; clearFlag = true; emit(clear); }
    }
    emit(ent); emit(eoi);
    if (nbits > 0) bytes.push(acc & 255);
    out.push(minSize);
    for (var p = 0; p < bytes.length; p += 255) { var n = Math.min(255, bytes.length - p); out.push(n); for (var q = 0; q < n; q++) out.push(bytes[p + q]); }
    out.push(0);
  }
  function gifEncode(frames, w, h) {
    var out = [];
    var str = function (s) { for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i)); };
    var u16 = function (v) { out.push(v & 255, (v >> 8) & 255); };
    str('GIF89a'); u16(w); u16(h); out.push(0xf7, 255, 0);
    for (var r = 0; r < 6; r++) for (var g = 0; g < 7; g++) for (var b = 0; b < 6; b++) out.push(r * 51, Math.round(g * 42.5), b * 51);
    for (var pad = 252; pad < 256; pad++) out.push(0, 0, 0);
    out.push(0x21, 0xff, 0x0b); str('NETSCAPE2.0'); out.push(3, 1, 0, 0, 0);
    frames.forEach(function (fr) {
      var d = fr.rgba, idx = new Uint8Array(w * h);
      for (var p = 0, o = 0; p < idx.length; p++, o += 4) idx[p] = paletteIndex(d[o], d[o + 1], d[o + 2], d[o + 3]);
      out.push(0x21, 0xf9, 4, (2 << 2) | 1); u16(Math.round((fr.delayMs || 80) / 10)); out.push(255, 0);
      out.push(0x2c); u16(0); u16(0); u16(w); u16(h); out.push(0);
      lzw(idx, 8, out);
    });
    out.push(0x3b);
    return new Uint8Array(out);
  }

  /* ------------------------------------------------------------------ API */
  function key(name, w, h, extra, o) { return name + '|' + w + 'x' + h + '|' + extra + '|' + (o ? JSON.stringify(o) : ''); }
  function need() { if (!hasDOM) throw new Error('T.Assets needs a browser canvas'); }
  function draw(name, w, h, o) {
    need();
    var fn = DRAW[name];
    if (!fn) throw new Error('unknown asset ' + name);
    var c = canvas(w, h), g = ctx2d(c);
    fn(g, c.width, c.height, o || {});
    return c;
  }
  function blob(c, type, q) {
    return new Promise(function (res, rej) {
      if (!c.toBlob) { rej(new Error('toBlob unavailable')); return; }
      c.toBlob(function (b) {
        if (!b) { rej(new Error('encode failed')); return; }
        if (b.arrayBuffer) b.arrayBuffer().then(function (ab) { res(new Uint8Array(ab)); }, rej);
        else { var fr = new FileReader(); fr.onload = function () { res(new Uint8Array(fr.result)); }; fr.onerror = rej; fr.readAsArrayBuffer(b); }
      }, type, q);
    });
  }
  function rgba(name, w, h, o) {
    var k = key(name, w, h, 'rgba', o);
    if (rgbaCache.has(k)) { var v = rgbaCache.get(k); rgbaCache.delete(k); rgbaCache.set(k, v); return v; }
    var c = draw(name, w, h, o), d = ctx2d(c).getImageData(0, 0, c.width, c.height).data;
    rgbaCache.set(k, d);
    if (rgbaCache.size > RGBA_KEEP) rgbaCache.delete(rgbaCache.keys().next().value);
    return d;
  }
  function frames(name, w, h, n, o) {
    n = n || 12;
    var out = [];
    for (var i = 0; i < n; i++) out.push({ rgba: rgba(name, w, h, Object.assign({}, o, { frame: i, frames: n })), delayMs: name === 'spinner' ? 80 : 100 });
    return out;
  }
  function memo(k, make) {
    if (cache.has(k)) return cache.get(k);
    var p = Promise.resolve().then(make);
    cache.set(k, p);
    p.catch(function () { cache.delete(k); });
    return p;
  }

  T.Assets = {
    names: Object.keys(DRAW),
    available: function () { return hasDOM; },
    draw: draw,
    rgba: rgba,
    frames: frames,
    png: function (name, w, h, o) { return memo(key(name, w, h, 'png', o), function () { return blob(draw(name, w, h, o), 'image/png'); }); },
    jpeg: function (name, w, h, q, o) { return memo(key(name, w, h, 'jpeg' + (q || 0.9), o), function () { return blob(draw(name, w, h, o), 'image/jpeg', q || 0.9); }); },
    gif: function (name, w, h, n, o) { return memo(key(name, w, h, 'gif' + (n || 12), o), function () { return gifEncode(frames(name, w, h, n || 12, o), w, h); }); },
    /* exposed for tests: encode frames that are already pixels */
    encodeGif: gifEncode
  };
})();
