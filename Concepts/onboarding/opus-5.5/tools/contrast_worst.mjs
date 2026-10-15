/* Worst-case text contrast over the onboarding window and the guided tour (2026-10-14).
 *   node tools/contrast_worst.mjs <page path or url> --cdp <endpoint> [--looks basic,friendly,glass,retro,nier]
 *        [--modes light,dark] [--motion normal,reduced] [--screens a,b|all] [--tour all|none|<step ids>]
 *        [--frames 3] [--viewport 1440x900] [--out <dir>] [--coverage <file>]
 * The method is the landing check's (PuppetMaster-Evidence/tests/pm7-onboarding-landing-focused-20261013/scripts/
 * pixels.mjs, used here unchanged in substance): for every rendered text run in the window, the tour, its landing note
 * and the tour's guided Chat messages, a native Page.captureScreenshot frame is taken between two read-only text
 * snapshots; the two snapshots' glyphs are drawn into a detached canvas, unioned and grown by a two-pixel fringe guard,
 * and every remaining pixel inside the text's own boxes is a background pixel. (One difference from pixels.mjs: the
 * glyphs are drawn clipped to the overflow grown by the guard, not clipped exactly; see textSnapshot.) The text's ink (its alpha and the
 * opacity of every ancestor composited over that pixel) is compared with the pixel, and the minimum WCAG luminance
 * contrast over all of them is the text's reading. No text is hidden and no CSS or DOM is changed to measure.
 * The floor is 4.5:1, or 3:1 for large text (24 px, or 18.67 px at weight 700 or more; SVG text is scaled by its
 * transform). Text inside an inactive control (disabled, aria-disabled) is listed as exempt, as WCAG exempts it.
 * Normal motion is sampled in --frames frames 0.9 s apart (the art moves behind its captions) and the lowest reading of
 * each text kept; Reduced Motion holds the art still, so one frame is taken.
 * Screens are reached the way the repository's shot tools reach them (O55.ui.open({fresh}), then O55.ui.go(screen));
 * the SSH steps for files on another device first choose the first device found on Find it, as a person does. A screen
 * that refuses go() is recorded as unreachable, not skipped silently. Tour steps are reached by starting the tour
 * (PM7_GUIDED_TOUR.restart) and pressing Show Me or Next, as a person does. Each look and motion gets its own fresh
 * browser context.
 * A view is measured once it has settled: one screen layer, entrances finished, NieR's cold-open log gone, the tour's
 * spotlight arrived (O55.tour.afterGlide) and the callout, the screen, its words and its scroll unchanged over six reads.
 * A capture is taken again (twice at most, each retry recorded) when a window or tour word moved between the two
 * snapshots around it. --during 400,900,... also measures each screen at those moments (ms after it was asked for),
 * before it settles, for one-shot moments such as Ready's curtain call and its confetti. --hover also measures each
 * screen and tour step with the pointer resting on its main action.
 * Writes <out>/contrast.json and <out>/failures.json, a screenshot per failing view, and prints one line per view.
 * Exits 1 when any text is under its floor. Drives an existing GPU browser over CDP; it never launches one. */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { beginCoverage, endCoverage, takeCoverageFlag } from './coverage_union.mjs';

const require = createRequire(join(process.env.PM_PLAYWRIGHT_DIR || '/home/sittingmongoose/pmt-dev/pw/', 'noop.js'));
const { chromium } = require('playwright-core');
const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const coverageFile = takeCoverageFlag(argv);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const page0 = argv[0] && !argv[0].startsWith('--') ? argv[0] : null;
const cdp = opt('cdp');
if (!page0 || !cdp) { console.error('usage: contrast_worst.mjs <page path or url> --cdp <endpoint> [...]'); process.exit(2); }
const url = /^https?:|^file:/.test(page0) ? page0 : pathToFileURL(resolve(page0)).href;
const looks = opt('looks', 'basic,friendly,glass,retro,nier').split(',');
const modes = opt('modes', 'light,dark').split(',');
const motions = opt('motion', 'normal,reduced').split(',');
const coverage = JSON.parse(readFileSync(join(here, '..', 'src', 'coverage.json'), 'utf8'));
const screensOpt = opt('screens', 'all');
const NEEDS_DEVICE = new Set(['nas-identity', 'nas-key', 'nas-signin', 'nas-install', 'nas-pmpair', 'nas-folder']);
const screens = screensOpt === 'all' ? Object.keys(coverage.screens) : screensOpt === 'none' ? [] : screensOpt.split(',');
const tourOpt = opt('tour', 'all');
const frames = Number(opt('frames', '3'));
const hoverMain = argv.includes('--hover');
const during = String(opt('during', '')).split(',').filter(Boolean).map(Number).sort((x, y) => x - y);
const [VW, VH] = opt('viewport', '1440x900').split('x').map(Number);
const out = resolve(opt('out', '/tmp/o55/contrast')); mkdirSync(out, { recursive: true });

/* ------------------------------------------------------------------ in-page: the landing check's method */
function textSnapshot() {
  const canvas = document.createElement('canvas'); canvas.width = innerWidth; canvas.height = innerHeight;
  const ctx = canvas.getContext('2d'), items = [];
  const c1 = document.createElement('canvas'); c1.width = c1.height = 1; const cx1 = c1.getContext('2d', { willReadFrequently: true });
  const roots = [...document.querySelectorAll('#pm-o55-onboarding,#pm-o55-tour,#o55tLanding,#chatPanel [data-o55-guided],#chatPanel [data-o55-pod042]')];
  const path = (e) => { const a = []; for (; e && e.nodeType === 1; e = e.parentElement) a.unshift(e.localName + ':nth-child(' + ([...(e.parentElement ? e.parentElement.children : [e])].indexOf(e) + 1) + ')'); return a.join(' > '); };
  const visited = new Set();
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = walker.nextNode())) {
      if (visited.has(n)) continue; visited.add(n);
      const e = n.parentElement, raw = n.textContent; if (!e || !raw.trim() || e.closest('script,style,noscript,defs')) continue;
      const s = getComputedStyle(e), isSvg = e instanceof SVGTextContentElement;
      if (e.closest('svg') && !isSvg) continue;
      let opacity = 1, hidden = false;
      for (let a = e; a; a = a.parentElement) { const st = getComputedStyle(a); opacity *= parseFloat(st.opacity); if (st.visibility !== 'visible' || st.display === 'none' || a.hidden) hidden = true; }
      if (hidden || opacity <= 0.02) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      for (let a = e; a; a = a.parentElement) {
        const st = getComputedStyle(a), b = a.getBoundingClientRect();
        if (/hidden|clip|scroll|auto/.test(st.overflowX)) { clip.left = Math.max(clip.left, b.left); clip.right = Math.min(clip.right, b.right); }
        if (/hidden|clip|scroll|auto/.test(st.overflowY)) { clip.top = Math.max(clip.top, b.top); clip.bottom = Math.min(clip.bottom, b.bottom); }
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
      const ink = isSvg ? s.fill : (s.webkitTextFillColor || s.color);
      const matrix = isSvg ? e.getScreenCTM() : null, scale = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
      const fontSize = parseFloat(s.fontSize) * scale, large = fontSize >= 24 || (fontSize >= 18.6667 && Number(s.fontWeight) >= 700);
      cx1.clearRect(0, 0, 1, 1); cx1.fillStyle = '#000'; cx1.fillStyle = ink; cx1.fillRect(0, 0, 1, 1); const inkRGBA = [...cx1.getImageData(0, 0, 1, 1).data];
      items.push({ path: path(e), node: [...e.childNodes].indexOf(n), text: raw.trim().replace(/\s+/g, ' '), kind: isSvg ? 'art' : 'ui', inkRGBA,
        cls: (e.className && e.className.baseVal != null ? e.className.baseVal : e.className) || '', parentCls: (e.parentElement && (e.parentElement.className.baseVal != null ? e.parentElement.className.baseVal : e.parentElement.className)) || '',
        ink, opacity: opacity * (isSvg ? parseFloat(s.fillOpacity || 1) : 1), fontSize, weight: s.fontWeight, floor: large ? 3 : 4.5, rects, disabled: !!e.closest(':disabled,[aria-disabled="true"]') });
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
          ctx.fillText(ch, r.x, r.y + (r.height - ascent - descent) / 2 + ascent);
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
function worstPixels({ shot, before, after }) {
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
    if (item.disabled) { rows.push(Object.assign({}, item, { exemption: 'inactive control text' })); continue; }
    if (item.dimmed) { rows.push(Object.assign({}, item, { exemption: "under the tour's scrim (outside the spotlight)" })); continue; }
    const fg = item.inkRGBA, alpha = (fg[3] / 255) * item.opacity; let count = 0, worst = null;
    for (let i = 0; i < item.rects.length; i++) {
      const r = item.rects[i], q = peer.rects[i] || r;
      const x0 = Math.max(0, Math.ceil(Math.max(r.x, q.x))), y0 = Math.max(0, Math.ceil(Math.max(r.y, q.y)));
      const x1 = Math.min(W, Math.floor(Math.min(r.x + r.w, q.x + q.w))), y1 = Math.min(H, Math.floor(Math.min(r.y + r.h, q.y + q.h)));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        if (textMask[y * W + x]) continue;
        const k = (y * W + x) * 4, bg0 = image.data[k], bg1 = image.data[k + 1], bg2 = image.data[k + 2];
        const e0 = alpha * fg[0] + (1 - alpha) * bg0, e1 = alpha * fg[1] + (1 - alpha) * bg1, e2 = alpha * fg[2] + (1 - alpha) * bg2;
        const la = 0.2126 * linf(e0) + 0.7152 * linf(e1) + 0.0722 * linf(e2), lb = 0.2126 * lin[bg0] + 0.7152 * lin[bg1] + 0.0722 * lin[bg2];
        const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); count++;
        if (!worst || ratio < worst.ratio) worst = { x, y, bg: [bg0, bg1, bg2], foreground: [Math.round(e0), Math.round(e1), Math.round(e2)], ratio };
      }
    }
    rows.push(Object.assign({}, item, { backgroundPixels: count, worst, pass: worst ? worst.ratio >= item.floor : null, hold: worst ? null : 'no background pixel inside the text boxes' }));
  }
  return rows.map((r) => { const c = Object.assign({}, r); delete c.rects; delete c.inkRGBA; return c; });
}

/* ------------------------------------------------------------------ driving */
const browser = await chromium.connectOverCDP(cdp);
const results = [], failures = [], unreachable = [], layerHolds = [], recaptured = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function movedWords(before, after) {
  const at = new Map(after.items.filter((i) => i.kind !== 'art').map((i) => [i.path + '#' + i.node + '#' + i.text, i.rects]));
  return before.items.some((i) => { if (i.kind === 'art') return false; const q = at.get(i.path + '#' + i.node + '#' + i.text); if (!q) return false;
    return i.rects.some((r, k) => !q[k] || Math.abs(r.x - q[k].x) > 0.5 || Math.abs(r.y - q[k].y) > 0.5); });
}
async function measure(page, label, nFrames) {
  const best = new Map(), tStart = Date.now();
  const n = nFrames || (label.motion === 'reduced' ? 1 : frames);
  for (let f = 0; f < n; f++) {
    if (f) await sleep(900);
    /* a capture is taken again (up to twice) when a window or tour word moved between the two snapshots around it: the
       screenshot then shows the words where neither snapshot's glyph mask has them. The art's labels ride the ambient
       loops and move on purpose; the frames sample them as they are. */
    let before, shot, after;
    for (let t = 0; t < 3; t++) {
      if (t) await sleep(400);
      before = await page.evaluate(textSnapshot);
      shot = await page.screenshot({ type: 'png' });
      after = await page.evaluate(textSnapshot);
      if (!movedWords(before, after)) break;
      if (t === 2) recaptured.push(Object.assign({}, label, { frame: f, still: 'moving after three captures' }));
      else recaptured.push(Object.assign({}, label, { frame: f, retry: t + 1 }));
    }
    const rows = worstPixels({ shot, before, after });
    /* the frame a text failed in is kept as it was captured (the art moves between frames) */
    if (rows.some((r) => r.pass === false)) writeFileSync(join(out, `fail--${label.look}-${label.mode}-${label.motion}--${label.view.replace(/[^a-z0-9_-]/gi, '_')}--frame${f}.png`), shot);
    for (const r of rows) {
      const k = r.path + '#' + r.node + '#' + r.text, prev = best.get(k);
      if (!prev || (r.worst && (!prev.worst || r.worst.ratio < prev.worst.ratio))) best.set(k, Object.assign(r, { frame: f }));
    }
    if (f === n - 1) label.theme = before.theme, label.nier = before.nier, label.dataMotion = before.motion;
    if ([...best.values()].some((r) => r.pass === false) && f === n - 1) await page.screenshot({ path: join(out, `fail--${label.look}-${label.mode}-${label.motion}--${label.view.replace(/[^a-z0-9_-]/gi, '_')}.png`) });
  }
  const rows = [...best.values()];
  const fails = rows.filter((r) => r.pass === false), min = rows.filter((r) => r.worst).reduce((m, r) => Math.min(m, r.worst.ratio / r.floor * 4.5), Infinity);
  results.push(Object.assign({}, label, { texts: rows.length, measured: rows.filter((r) => r.worst).length, holds: rows.filter((r) => r.hold).length, exempt: rows.filter((r) => r.exemption).length, fails: fails.length, minRatioAt45: Number.isFinite(min) ? +min.toFixed(3) : null, rows }));
  for (const r of fails) failures.push(Object.assign({ look: label.look, mode: label.mode, motion: label.motion, view: label.view }, { text: r.text, kind: r.kind, cls: r.cls, parentCls: r.parentCls, floor: r.floor, ratio: +r.worst.ratio.toFixed(3), at: [r.worst.x, r.worst.y], bg: r.worst.bg, fg: r.worst.foreground, ink: r.ink, opacity: r.opacity, fontSize: r.fontSize, frame: r.frame }));
  console.log(`${fails.length ? 'FAIL' : 'pass'} ${label.look}-${label.mode} ${label.motion} ${label.view} (${((Date.now() - tStart) / 1000).toFixed(1)} s): ${rows.length} texts, min ${Number.isFinite(min) ? min.toFixed(2) : '-'}${fails.length ? ' | ' + fails.map((r) => `"${r.text.slice(0, 28)}" ${r.worst.ratio.toFixed(2)}`).join('; ') : ''}${label.theme ? '' : ''}`);
}
/* --hover: the main action with the pointer resting on it (where a person's pointer stays after the click before),
   measured as its own view; the pointer then leaves to the corner */
async function hovered(page, sel, label) {
  const box = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null; }, sel).catch(() => null);
  if (!box) return;
  await page.mouse.move(box.x, box.y); await sleep(450);
  await measure(page, label, 1);
  await page.mouse.move(2, 2); await sleep(250);
}
/* NieR's cold open (its boot log over the first screen) is cancelled by any key or press a person makes; a screen
   changed from here during it leaves the log standing over the next screen, which no person sees. Let it finish. */
async function coldOpen(page) {
  await sleep(600);
  await page.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55fx-log'), null, { timeout: 12000, polling: 200 }).catch(() => {});
}
async function settle(page, view) {
  await sleep(500);
  /* exactly one screen layer, released: the one leaving is gone and the new one is no longer held */
  const one = await page.waitForFunction(() => { const r = document.querySelector('#pm-o55-onboarding'); if (!r || r.hidden) return true;
    return !r.querySelector('.o55-pane > .o55-layer.o55-out') && !r.querySelector('.o55-pane > .o55-layer.o55-hold'); }, null, { timeout: 6000, polling: 150 }).then(() => true).catch(() => false);
  if (!one && view) layerHolds.push(view);
  await sleep(400);
  /* entrances and one-shot moments finish first (endless ambient loops keep running: they are what the frames sample) */
  await page.waitForFunction(() => {
    const all = ['#pm-o55-onboarding .o55-stage', '#pm-o55-onboarding .o55-pane', '#pm-o55-tour'].flatMap((s) => { const e = document.querySelector(s); return e ? e.getAnimations({ subtree: true }) : []; });
    return !all.some((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations !== Infinity); }, null, { timeout: 5000, polling: 200 }).catch(() => {});
  /* NieR's cold-open log is a one-shot drawn over the screen, and a tour callout glides to its target on its own clock
     (not a CSS animation): wait until the log is gone and the callout, its ring, the screen and its words stand still
     across six reads, read from here so the page is never written to */
  await page.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55fx-log'), null, { timeout: 8000, polling: 200 }).catch(() => {});
  /* the tour's own word that its spotlight stands where it is going (the callout is placed with it) */
  await page.evaluate(() => new Promise((res) => { const t = window.O55 && window.O55.tour; if (!t || !t.running || !t.afterGlide) return res(); setTimeout(res, 3000); t.afterGlide(res); })).catch(() => {});
  const geo = () => page.evaluate(() => ['#pm-o55-tour .o55t-callout', '#pm-o55-tour .o55t-ringbox', '#pm-o55-onboarding .o55-pane > .o55-layer'].map((s) => {
    const e = document.querySelector(s); if (!e) return '-'; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => v.toFixed(1)).join(','); })
    /* and the screen's words and scroll: an operation still answering (a provider's "Checking...") moves the rows */
    .concat([...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-scroll')].map((e) => e.scrollTop + ',' + e.scrollHeight + ',' + e.textContent.length))
    .join('|')).catch(() => '');
  for (let k = 0, last = await geo(), same = 0; k < 60 && same < 6; k++) { await sleep(150); const g = await geo(); same = g === last ? same + 1 : 0; last = g; }
  await sleep(300);
}
try {
  for (const look of looks) for (const mode of modes) for (const motion of motions) {
    const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, reducedMotion: motion === 'reduced' ? 'reduce' : 'no-preference', colorScheme: mode });
    const page = await ctx.newPage();
    /* a context's tab on a remote browser can open behind the session's own tab, where animation frames are throttled:
       screens never finish leaving and the art never moves. Bring it to the front and emulate focus. */
    await page.bringToFront().catch(() => {});
    let cov = null;
    if (coverageFile) {
      const c = await ctx.newCDPSession(page);
      await c.send('Emulation.setFocusEmulationEnabled', { enabled: true });
      await c.send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
      await beginCoverage(c);
      cov = c;
    } else {
      try { const c = await ctx.newCDPSession(page); await c.send('Emulation.setFocusEmulationEnabled', { enabled: true }); await c.send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {}); } catch (_) {}
    }
    const errors = []; page.on('pageerror', (e) => errors.push(String(e && e.message || e).slice(0, 240)));
    try {
      await page.goto(url + (url.includes('?') ? '&' : '?') + 'o55=off&o55scenario=fresh', { waitUntil: 'load', timeout: 180000 });
      await page.waitForFunction(() => !!(window.O55 && window.O55.ui && window.PM_THEME && window.PM7_SETTINGS_TOME), null, { timeout: 180000 });
      await sleep(1000);
      await page.evaluate(async ([f, m, nier]) => {
        const T = window.PM7_SETTINGS_TOME, fam = nier ? 'basic' : f;
        window.PM_THEME.setFamily(fam, { persist: false }); window.PM_THEME.setMode(m, { persist: false });
        try { T.setChromeThemeFamily(fam); T.setChromeThemeMode(m); } catch (_) {}
        if (window.PM_NIER) { const on = window.PM_NIER.on() || window.PM_NIER.wanted(); if (nier !== on) { window.PM_NIER.set(nier, { sound: false }); await new Promise((r) => setTimeout(r, 3200)); } }
      }, [look, mode, look === 'nier']);
      await sleep(800);
      const label0 = { look, mode, motion };
      if (screens.length) {
        await page.evaluate(() => { localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true }); });
        await page.waitForFunction(() => !!(window.O55.S && window.O55.S.sess && document.querySelector('#pm-o55-onboarding .o55-win')), null, { timeout: 60000 });
        await coldOpen(page);
        for (const sc of screens) {
          /* the SSH steps for files on another device follow a device chosen on Find it: choose one there first, the way
             a person does (the first one found), unless one is already chosen */
          if (NEEDS_DEVICE.has(sc)) await page.evaluate(async () => {
            const O = window.O55; if (O.S.sess.nas && O.S.sess.nas.device) return;
            O.ui.go('nas-find', { silent: true });
            for (let i = 0; i < 80; i++) {
              await new Promise((r) => setTimeout(r, 150));
              const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-do="device"]');
              if (b) { b.click(); await new Promise((r) => setTimeout(r, 600)); return; }
            }
          }).catch(() => {});
          try { await page.evaluate((id) => { if (window.O55.S.sess.screen !== id) window.O55.ui.go(id, { silent: true }); }, sc); }
          catch (e) {
            unreachable.push({ look, mode, motion, view: sc, why: String(e.message).split('\n')[0].slice(0, 160) });
            /* a screen that refused (it needs answers from earlier screens) can leave the screen before it stuck on the
               way out; the window is closed and opened fresh, so the next screen starts clean */
            await page.evaluate(() => { try { window.O55.ui.close(); } catch (_) {} });
            await sleep(900);
            await page.evaluate(() => { localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true }); });
            await page.waitForFunction(() => !!(window.O55.S && window.O55.S.sess && document.querySelector('#pm-o55-onboarding .o55-win')), null, { timeout: 60000 }).catch(() => {});
            await sleep(1500);
            await coldOpen(page);
            continue;
          }
          /* --during: also measure the screen at these moments after it was asked for (ms), before it settles: the
             one-shot moments (Ready's curtain call and its confetti) that the settled frames come after */
          if (during.length) { const t0 = Date.now(); for (const ms of during) { await sleep(Math.max(0, t0 + ms - Date.now())); await measure(page, Object.assign({}, label0, { view: `${sc}@${ms}ms` }), 1); } }
          await settle(page, `${look}-${mode}-${motion}:${sc}`);
          const actual = await page.evaluate(() => window.O55.S.sess.screen);
          if (actual !== sc) { unreachable.push({ look, mode, motion, view: sc, why: 'went to ' + actual }); continue; }
          await measure(page, Object.assign({}, label0, { view: sc }));
          if (hoverMain) await hovered(page, '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary:not([aria-disabled="true"]), #pm-o55-onboarding .o55-foot .o55-primary:not([aria-disabled="true"])', Object.assign({}, label0, { view: sc + '+hover' }));
        }
        await page.evaluate(() => { try { window.O55.ui.close && window.O55.ui.close(); } catch (_) {} });
        await sleep(1200);
      }
      if (tourOpt !== 'none') {
        /* the tour is walked through its own controls (Show Me where a step has one, else Next), so each step is seen in
           the state the person reaches, with its target present; a step id is the tour's own */
        await page.evaluate(() => { try { if (window.O55.ui.close) window.O55.ui.close(); } catch (_) {} window.PM7_GUIDED_TOUR.restart(); });
        await page.waitForFunction(() => !!document.querySelector('#pm-o55-tour .o55t-callout'), null, { timeout: 30000 }).catch(() => {});
        const want = tourOpt === 'all' ? null : new Set(tourOpt.split(','));
        const seen = new Set();
        for (let k = 0; k < 60; k++) {
          await settle(page);
          const st = await page.evaluate(() => { const t = window.O55.tour, s = t && t.state ? t.state() : null; return { running: !!(t && t.running), id: s && (s.step || s.id) || (t && t.current && t.current.id) || null }; });
          if (!st.running) break;
          const id = st.id || 'step' + k;
          if (!seen.has(id) && (!want || want.has(id))) { seen.add(id); await measure(page, Object.assign({}, label0, { view: 'tour:' + id }));
            if (hoverMain) await hovered(page, '#pm-o55-tour .o55t-callout .o55t-primary:not([aria-disabled="true"])', Object.assign({}, label0, { view: 'tour:' + id + '+hover' })); }
          const clicked = await page.evaluate(() => { const b = document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="showMe"]') || document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]') || document.querySelector('#pm-o55-tour .o55t-callout .o55t-primary'); if (!b) return false; b.click(); return b.getAttribute('data-o55t') || 'primary'; });
          if (!clicked) break;
          if (clicked === 'showMe') await page.waitForFunction(() => !document.querySelector('#pm-o55-tour .o55t-pointer.o55t-on'), null, { timeout: 25000, polling: 300 }).catch(() => {});
        }
        if (seen.size === 0) unreachable.push({ look, mode, motion, view: 'tour', why: 'no step reached' });
      }
    } catch (e) { unreachable.push({ look, mode, motion, view: '*', why: String(e.message).split('\n')[0].slice(0, 200) }); console.log('ERROR', look, mode, motion, String(e.message).split('\n')[0]); }
    if (errors.length) unreachable.push({ look, mode, motion, view: 'page errors', why: errors.slice(0, 5).join(' | ') });
    if (cov) await endCoverage(cov, coverageFile);
    await ctx.close().catch(() => {});
    writeFileSync(join(out, 'contrast.json'), JSON.stringify({ url, viewport: [VW, VH], frames, method: 'landing-check worst background pixel (pixels.mjs), two-pixel glyph fringe guard', results, unreachable, layerHolds, recaptured }, null, 1));
    writeFileSync(join(out, 'failures.json'), JSON.stringify(failures, null, 1));
  }
} finally { await browser.close().catch(() => {}); }
console.log(JSON.stringify({ views: results.length, failing: results.filter((r) => r.fails).length, failures: failures.length, unreachable: unreachable.length, layerHolds: layerHolds.length, recaptured: recaptured.length }));
process.exit(failures.length ? 1 : 0);
