// Adapted from the 2026-10-14 Demo Studio contrast evidence, pixels2.cjs
// (SHA-256 6e7b81f62ce1fa648e7b4567185dc639332bdb767059b64f44316f8c02c85789).
const {inflateSync}=require('node:zlib');
function textSnapshot(opt) {
  opt = opt || {};
  const canvas = document.createElement('canvas'); canvas.width = innerWidth; canvas.height = innerHeight;
  const ctx = canvas.getContext('2d'), items = [];
  const c1 = document.createElement('canvas'); c1.width = c1.height = 1; const cx1 = c1.getContext('2d', { willReadFrequently: true });
  const roots = [...document.querySelectorAll('#pmds-sheet,#o55-demo > button')];
  const path = (e) => { const a = []; for (; e && e.nodeType === 1; e = e.parentElement) a.unshift(e.localName + ':nth-child(' + ([...(e.parentElement ? e.parentElement.children : [e])].indexOf(e) + 1) + ')'); return a.join(' > '); };
  const visited = new Set();
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = walker.nextNode())) {
      if (visited.has(n)) continue; visited.add(n);
      const e = n.parentElement, raw = n.textContent; if (!e || !raw.trim() || e.closest('script,style,noscript,defs,.pmds-sr')) continue;
      const s = getComputedStyle(e), isSvg = e instanceof SVGTextContentElement;
      if (e.closest('svg') && !isSvg) continue;
      let opacity = 1, hidden = false;
      for (let a = e; a; a = a.parentElement) { const st = getComputedStyle(a); opacity *= parseFloat(st.opacity); if (st.visibility !== 'visible' || st.display === 'none' || a.hidden) hidden = true; }
      if (hidden || opacity <= 0.02) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      for (let a = e; a; a = a.parentElement) {
        const st = getComputedStyle(a), b = a.getBoundingClientRect();
        // Overflow clips to the inner border edge, not the outside of the border. Preserve scaling.
        const sx = a.offsetWidth ? b.width / a.offsetWidth : 1, sy = a.offsetHeight ? b.height / a.offsetHeight : 1;
        const left = opt.legacyClip ? b.left : b.left + (a.clientLeft || 0) * sx, top = opt.legacyClip ? b.top : b.top + (a.clientTop || 0) * sy;
        const right = opt.legacyClip || !a.offsetWidth ? b.right : left + a.clientWidth * sx, bottom = opt.legacyClip || !a.offsetHeight ? b.bottom : top + a.clientHeight * sy;
        if (/hidden|clip|scroll|auto/.test(st.overflowX)) { clip.left = Math.max(clip.left, left); clip.right = Math.min(clip.right, right); }
        if (/hidden|clip|scroll|auto/.test(st.overflowY)) { clip.top = Math.max(clip.top, top); clip.bottom = Math.min(clip.bottom, bottom); }
      }
      const rects = [...range.getClientRects()].map((r) => ({ x: Math.max(r.x, clip.left), y: Math.max(r.y, clip.top), w: Math.min(r.right, clip.right) - Math.max(r.x, clip.left), h: Math.min(r.bottom, clip.bottom) - Math.max(r.y, clip.top) })).filter((r) => r.w > 0 && r.h > 0);
      if (!rects.length) continue;
      /* guided Chat text outside the tour's spotlight lies under the tour's scrim: the app beneath, dimmed on purpose and
         inert while the step points elsewhere (as the app behind the onboarding window is); it is listed, not measured */
      if (e.closest('#chatPanel')) {
        const tr = document.querySelector('#pm-o55-tour'), scrim = tr && !tr.hidden && tr.querySelector('.o55t-scrim'), ring = tr && tr.querySelector('.o55t-ringbox');
        if (scrim && getComputedStyle(scrim).display !== 'none' && parseFloat(getComputedStyle(scrim).opacity) > 0.02) {
          const hb = ring && !ring.hidden ? ring.getBoundingClientRect() : null, r0 = rects[0];
          const inside = hb && r0.x >= hb.left - 1 && r0.y >= hb.top - 1 && r0.x + r0.w <= hb.right + 1 && r0.y + r0.h <= hb.bottom + 1;
          if (!inside) { items.push({ path: path(e), node: [...e.childNodes].indexOf(n), text: raw.trim().replace(/\s+/g, ' '), kind: 'ui', dimmed: true, rects }); continue; }
        }
      }
      /* selection views: the words wear their ::selection ink; words that cannot be selected keep their own paint and are
         listed, not measured, in that view (their resting state is measured in every other view) */
      let unselectable = false, selected = false;
      if (opt.selection && !isSvg) { const so = getSelection(); selected = !!(so.rangeCount && so.containsNode(n, true)); }
      if (selected) { for (let a = e; a; a = a.parentElement) { const u = getComputedStyle(a).userSelect; if (u === 'none') { unselectable = true; break; } if (u === 'text' || u === 'all' || u === 'contain') break; } }
      if (unselectable) { items.push({ path: path(e), node: [...e.childNodes].indexOf(n), text: raw.trim().replace(/\s+/g, ' '), kind: 'ui', unselectable: true, rects }); continue; }
      const ink = selected ? getComputedStyle(e, '::selection').color : isSvg ? s.fill : (s.webkitTextFillColor || s.color);
      /* a cut line's ellipsis is painted with the text's own ink, outside the highlight: in a selection view the boxes stop
         short of it (its resting state is measured in every other view) */
      if (selected) { for (let a = e; a && a !== root; a = a.parentElement) { const st = getComputedStyle(a); if (st.textOverflow === 'ellipsis' && a.scrollWidth > a.clientWidth + 1) {
        const ab = a.getBoundingClientRect(), cut = ab.right - parseFloat(st.paddingRight) - parseFloat(st.borderRightWidth) - parseFloat(s.fontSize) * 1.2;
        for (const r of rects) if (r.x + r.w > cut) r.w = Math.max(0, cut - r.x); break; } } }
      if (selected && !rects.some((r) => r.w > 0)) continue;
      const matrix = isSvg ? e.getScreenCTM() : null, scale = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
      const fontSize = parseFloat(s.fontSize) * scale, large = fontSize >= 24 || (fontSize >= 18.6667 && Number(s.fontWeight) >= 700);
      cx1.clearRect(0, 0, 1, 1); cx1.fillStyle = '#000'; cx1.fillStyle = ink; cx1.fillRect(0, 0, 1, 1); const inkRGBA = [...cx1.getImageData(0, 0, 1, 1).data];
      items.push({ path: path(e), node: [...e.childNodes].indexOf(n), text: raw.trim().replace(/\s+/g, ' '), kind: isSvg ? 'art' : 'ui', inkRGBA,
        cls: (e.className && e.className.baseVal != null ? e.className.baseVal : e.className) || '', parentCls: (e.parentElement && (e.parentElement.className.baseVal != null ? e.parentElement.className.baseVal : e.parentElement.className)) || '',
        ink, opacity: opacity * (isSvg ? parseFloat(s.fillOpacity || 1) : 1), fontSize, weight: s.fontWeight, floor: 4.5, clip, rects, disabled: !!e.closest(':disabled,[aria-disabled="true"]') });
      /* the glyphs are drawn clipped to what the overflow shows, grown by the two-pixel fringe guard: clipped exactly, a
         glyph the canvas places a pixel off from the page lost its part at the clip edge before the guard could cover
         it, and that sliver of the word's own ink was read as its background (Glass Dark's providers list, the comma of
         "plan," cut by the list's bottom edge: 2.25; pixels.mjs clips exactly) */
      ctx.save(); ctx.beginPath(); ctx.rect(clip.left - 2, clip.top - 2, clip.right - clip.left + 4, clip.bottom - clip.top + 4); ctx.clip(); ctx.fillStyle = 'white';
      ctx.font = s.font || `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`; ctx.textBaseline = 'alphabetic';
      if ('fontKerning' in ctx) ctx.fontKerning = s.fontKerning;
      if (isSvg && matrix) {
        ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
        for (let i = 0; i < raw.length; i++) { try { const p = e.getStartPositionOfChar(i); ctx.fillText(raw[i], p.x, p.y); } catch (_) {} }
      } else {
        for (let i = 0; i < raw.length; i++) {
          if (/\s/.test(raw[i])) continue;
          range.setStart(n, i); range.setEnd(n, i + 1); const r = range.getBoundingClientRect();
          const ch = s.textTransform === 'uppercase' ? raw[i].toUpperCase() : s.textTransform === 'lowercase' ? raw[i].toLowerCase() : raw[i];
          const met = ctx.measureText(ch), ascent = met.fontBoundingBoxAscent || parseFloat(s.fontSize) * 0.9, descent = met.fontBoundingBoxDescent || parseFloat(s.fontSize) * 0.2;
          /* drawn where the landing's mask draws it (the start of its advance) and again centred in that advance less the letter
             spacing: a tabular figure sits in the middle of a wider box than the canvas's own, and either place alone left the
             real glyph's edge outside the fringe guard (the Story clock's "1": 4.3 left-aligned, 1.9 centred, over its own edge) */
          const base = r.y + (r.height - ascent - descent) / 2 + ascent, mid = r.x + (r.width - (parseFloat(s.letterSpacing) || 0) - met.width) / 2;
          ctx.fillText(ch, r.x, base); if (Math.abs(mid - r.x) > 0.5) ctx.fillText(ch, mid, base);
        }
      }
      ctx.restore();
    }
  }
  const root = document.documentElement;
  return { width: innerWidth, height: innerHeight, dpr: devicePixelRatio, theme: root.dataset.theme, nier: root.getAttribute('data-o55-nier'), motion: root.getAttribute('data-motion'),
    screen: window.O55 && window.O55.S && window.O55.S.sess ? window.O55.S.sess.screen : null, items, mask: canvas.toDataURL() };
}
/* a minimal PNG reader (8-bit RGB or RGBA, non-interlaced: what Chrome's screenshots and canvases write) */
function readPng(buf) {
  let o = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (o < buf.length) { const len = buf.readUInt32BE(o), type = buf.toString('ascii', o + 4, o + 8), data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[12] !== 0) throw Error('unsupported PNG'); ct = data[9]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break; o += 12 + len; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : ct === 4 ? 2 : 0; if (!bpp) throw Error('unsupported PNG colour type ' + ct);
  const raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) { const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255; }
    for (let x = 0; x < w; x++) { const k = (y * w + x) * 4, s = x * bpp;
      if (bpp >= 3) { out[k] = cur[s]; out[k + 1] = cur[s + 1]; out[k + 2] = cur[s + 2]; out[k + 3] = bpp === 4 ? cur[s + 3] : 255; }
      else { out[k] = out[k + 1] = out[k + 2] = cur[s]; out[k + 3] = bpp === 2 ? cur[s + 1] : 255; } }
    [prev, cur] = [cur, prev];
  }
  return { w, h, data: out };
}
const fromDataUrl = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');
/* the landing check's worst-pixel reading (pixels.mjs), computed here instead of in the page so the screenshot is not
   sent back to the browser; the arithmetic is the same */
function worstPixels({ shot, before, after, exemptDisabled, auditClip }) {
  const image = readPng(shot), masks = [readPng(fromDataUrl(before.mask)), readPng(fromDataUrl(after.mask))], W = image.w, H = image.h;
  if (before.dpr !== 1 || before.width !== W || before.height !== H) throw Error('native pixel and viewport dimensions differ');
  const textMask = new Uint8Array(W * H);
  for (const m of masks) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m.data[(y * W + x) * 4 + 3]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H) textMask[(y + dy) * W + x + dx] = 1;
  const lin = new Float64Array(256); for (let i = 0; i < 256; i++) { const c = i / 255; lin[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
  const linf = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const rows = [];
  for (const item of before.items) {
    const peer = after.items.find((i) => i.path === item.path && i.node === item.node && i.text === item.text);
    if (item.dimmed && peer && peer.dimmed) { rows.push(Object.assign({}, item, { exemption: "under the tour's scrim (outside the spotlight)" })); continue; }
    if (!peer || peer.ink !== item.ink || peer.opacity !== item.opacity) { rows.push(Object.assign({}, item, { hold: 'text or paint changed during the capture' })); continue; }
    if (item.unselectable) { rows.push(Object.assign({}, item, { exemption: 'not selectable (measured at rest elsewhere)' })); continue; }
    if (item.disabled && exemptDisabled) { rows.push(Object.assign({}, item, { exemption: 'inactive control text' })); continue; }
    if (item.dimmed) { rows.push(Object.assign({}, item, { exemption: "under the tour's scrim (outside the spotlight)" })); continue; }
    const fg = item.inkRGBA, alpha = (fg[3] / 255) * item.opacity; let count = 0, worst = null, outsideClip = 0;
    for (let i = 0; i < item.rects.length; i++) {
      const r = item.rects[i], q = peer.rects[i] || r;
      const x0 = Math.max(0, Math.ceil(Math.max(r.x, q.x))), y0 = Math.max(0, Math.ceil(Math.max(r.y, q.y)));
      const x1 = Math.min(W, Math.floor(Math.min(r.x + r.w, q.x + q.w))), y1 = Math.min(H, Math.floor(Math.min(r.y + r.h, q.y + q.h)));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        if (textMask[y * W + x]) continue;
        if (auditClip && (x < auditClip.left || x >= auditClip.right || y < auditClip.top || y >= auditClip.bottom)) outsideClip++;
        const k = (y * W + x) * 4, bg0 = image.data[k], bg1 = image.data[k + 1], bg2 = image.data[k + 2];
        const e0 = alpha * fg[0] + (1 - alpha) * bg0, e1 = alpha * fg[1] + (1 - alpha) * bg1, e2 = alpha * fg[2] + (1 - alpha) * bg2;
        const la = 0.2126 * linf(e0) + 0.7152 * linf(e1) + 0.0722 * linf(e2), lb = 0.2126 * lin[bg0] + 0.7152 * lin[bg1] + 0.0722 * lin[bg2];
        const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); count++;
        if (!worst || ratio < worst.ratio) worst = { x, y, bg: [bg0, bg1, bg2], foreground: [Math.round(e0), Math.round(e1), Math.round(e2)], ratio };
      }
    }
    rows.push(Object.assign({}, item, { backgroundPixels: count, outsideClip, worst, pass: worst ? worst.ratio >= item.floor : null, hold: worst ? null : 'no background pixel inside the text boxes' }));
  }
  return rows.map((r) => { const c = Object.assign({}, r); delete c.rects; delete c.inkRGBA; return c; });
}

module.exports = { textSnapshot, worstPixels };
