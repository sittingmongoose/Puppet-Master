// FO-96 / F96b-1, F96b-2: a film of the key focus mark on the open panel's icon in Glass Dark and Glass Light, where
// Liquid Glass's lens carries it. Tab to Files (the open panel), Enter (at 1920 it closes the panel), Enter again (it
// opens), a real click on the focused icon (it closes), Enter (it opens), Tab to Search, Enter (the panel changes to
// Search). Each step is marked on the film, and three things are asserted after it (F96-1 round 6, astra-review-g8 A):
// the key focus is on the step's icon (it is the active element and matches :focus-visible); that icon carries a mark:
// the rail's focus ring (.d-abring, F96-1 round 8: one ring above every layer, on the focused tile's box), its own
// 3 px accent outline (where anchor positioning is missing), or on builds before round 8 the lens's (data-lg-focus on a
// lens painted at rest on it), never none; and the panels are as the step says (Files open or shut, Search open or not). A Tab that can't reach its icon
// stops the test at once. No step here means to lose the key focus: a click on the key-focused icon keeps it, so a
// press that drops it fails.
// The mark is also judged on pixels in every compositor frame from each press to the settled state (sol-review-g8: the
// lens travelling onto the key-focused Search washed Search's own ring to 2.2:1 before it took the mark), and the Tab
// to Search and Enter is done twice more in each look, as the frames come at about 15 a second. In each frame each side
// of the focused tile must hold its ring at 3:1 (see ringSides). Record with --record /abs/file.mp4 (GPU, 1920x1080);
// `browser-check frames <film> --run <folder>` gives the frames after each mark. --set looks=glass-dark limits the looks.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { encodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
const LOOKS_FILM = ['glass-dark', 'glass-light'];

// The ring on pixels, with no picture of the tile without it to compare against (the lens moves): across each side, 6 px
// either side of the edge, through the side's middle 60%, a scanline counts when it holds a run of the mark's ink (each
// channel within 48 levels of the accent, the run's pixels within 32 of one another) standing at 3:1 or more against
// the 1 or 2 px just beyond it, the better of its two sides (as activity-bar-keys judges a two-tone ring); a side holds
// when 90% of its scanlines count. A ring washed by glass over it is either no longer the accent's ink or no longer at
// 3:1 beside it, and fails either way. Each side is read at the tile's edge and at the resting lens's (the lens draws
// the mark on its own edge), and the better is kept.
const lumP = (d, i) => { const c = [d[i], d[i + 1], d[i + 2]].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (p, q) => (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05);
function ringLine(im, pts, ink) {
  const px = pts.map(([x, y]) => (x < 0 || y < 0 || x >= im.width || y >= im.height) ? null : 4 * (y * im.width + x)), D = im.data;
  const far = (i, c) => Math.max(Math.abs(D[i] - c[0]), Math.abs(D[i + 1] - c[1]), Math.abs(D[i + 2] - c[2]));
  let core = -1, best = 49;
  px.forEach((i, k) => { if (i == null) return; const v = far(i, ink); if (v < best) { best = v; core = k; } });
  if (core < 0) return 0;
  const c0 = [D[px[core]], D[px[core] + 1], D[px[core] + 2]], same = j => px[j] != null && far(px[j], c0) <= 32;
  let a = core, b = core;
  while (a > 0 && same(a - 1)) a--;
  while (b < px.length - 1 && same(b + 1)) b++;
  const lc = lumP(D, px[core]);
  const beside = (from, step) => { let m = 0; for (let k = 1; k <= 2; k++) { const j = from + step * k; if (j < 0 || j >= px.length || px[j] == null) break; m = Math.max(m, ratio(lc, lumP(D, px[j]))); } return m; };
  return Math.max(beside(a, -1), beside(b, 1));
}
function ringSides(im, box, ink) {
  const L = Math.round(box.x), T = Math.round(box.y), R = Math.round(box.x + box.width), B = Math.round(box.y + box.height);
  const mid = (p, q) => { const o = []; for (let v = Math.round(p + (q - p) * 0.2); v < Math.round(p + (q - p) * 0.8); v++) o.push(v); return o; };
  const span = e => { const o = []; for (let v = e - 6; v < e + 6; v++) o.push(v); return o; };
  const side = lines => { const got = lines.map(pts => ringLine(im, pts, ink)).sort((p, q) => p - q), n = got.length;
    return { share: n ? +(got.filter(v => v >= 3).length / n).toFixed(2) : 0, median: n ? +got[Math.floor(n / 2)].toFixed(2) : 0 }; };
  return { top: side(mid(L, R).map(x => span(T).map(y => [x, y]))), bottom: side(mid(L, R).map(x => span(B).map(y => [x, y]))),
    left: side(mid(T, B).map(y => span(L).map(x => [x, y]))), right: side(mid(T, B).map(y => span(R).map(x => [x, y]))) };
}
// A screencast PNG's top rows only (the rail's tiles sit near the top of the window): every row is inflated, but only
// rows 0..rows-1 are unfiltered, as a row's filter reads the row above it. 8-bit RGB or RGBA, not interlaced (Chrome's).
function decodeTop(bytes, rows) {
  let width = 0, height = 0, ch = 4; const parts = [];
  for (let p = 8; p < bytes.length;) {
    const n = bytes.readUInt32BE(p), type = bytes.toString('ascii', p + 4, p + 8), data = bytes.subarray(p + 8, p + 8 + n);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); ch = data[9] === 6 ? 4 : 3; if (data[8] !== 8 || data[12]) throw new Error('unexpected PNG format'); }
    else if (type === 'IDAT') parts.push(data); else if (type === 'IEND') break;
    p += n + 12;
  }
  const raw = inflateSync(Buffer.concat(parts)), stride = width * ch, h = Math.min(height, rows), px = Buffer.alloc(stride * h), out = Buffer.alloc(width * h * 4, 255);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], o = y * (stride + 1) + 1, r = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[r + x - ch] : 0, b = y ? px[r + x - stride] : 0, c = y && x >= ch ? px[r + x - stride - ch] : 0;
      let pr = 0;
      if (f === 1) pr = a; else if (f === 2) pr = b; else if (f === 3) pr = (a + b) >> 1; else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[r + x] = (raw[o + x] + pr) & 255;
    }
  }
  if (ch === 4) return { width, height: h, data: px };
  for (let i = 0, j = 0; i < px.length; i += 3, j += 4) { out[j] = px[i]; out[j + 1] = px[i + 1]; out[j + 2] = px[i + 2]; }
  return { width, height: h, data: out };
}
// the tile and 24 px round it, native pixels, for a frame that fails (ring-frames/ in the run folder)
function cropPng(im, box, file) {
  const x0 = Math.max(0, Math.floor(box.x) - 24), y0 = Math.max(0, Math.floor(box.y) - 24), x1 = Math.min(im.width, Math.ceil(box.x + box.width) + 24), y1 = Math.min(im.height, Math.ceil(box.y + box.height) + 24);
  const w = x1 - x0, h = y1 - y0, data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) data.set(im.data.subarray(((y0 + y) * im.width + x0) * 4, ((y0 + y) * im.width + x1) * 4), y * w * 4);
  writeFileSync(file, encodePng({ width: w, height: h, data }));
}
const better = (a, b) => b ? Object.fromEntries(Object.keys(a).map(k => [k, b[k].share > a[k].share || (b[k].share === a[k].share && b[k].median > a[k].median) ? b[k] : a[k]])) : a;

function markState(k) {
  const el = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`), sym = el && el.querySelector('.symbol');
  const slot = document.getElementById('sidePanelSlot');
  const isOpen = id => { const i = document.querySelector(`#activityBar .icon[data-ab-id="${id}"]`), v = i && document.getElementById(i.getAttribute('data-target') || '');
    return !!slot && !slot.classList.contains('hidden') && !!v && v.classList.contains('active'); };
  const a = document.activeElement;
  const active = !a || a === document.body ? 'body' : (a.getAttribute('data-ab-id') || a.id || a.tagName.toLowerCase());
  if (!el || !sym) return { missing: true, active, files: isOpen('files'), search: isOpen('search') };
  const cs = getComputedStyle(sym), lens = document.querySelector('#lg-lenses .lg-lens[data-lg-for="rail-icons"]');
  const keyFocus = a === el && el.matches(':focus-visible');
  const ink = cs.outlineColor.match(/[\d.]+/g) || [];
  const own = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 && (ink.length < 4 || parseFloat(ink[3]) > 0);
  const b = sym.getBoundingClientRect();
  let onLens = false, onRing = false;
  if (lens && lens.hasAttribute('data-lg-focus') && parseFloat(getComputedStyle(lens).opacity) > 0.5) {
    const l = lens.getBoundingClientRect();
    onLens = Math.abs((l.left + l.right) / 2 - (b.left + b.right) / 2) <= 3 && Math.abs((l.top + l.bottom) / 2 - (b.top + b.bottom) / 2) <= 3;
  }
  const ring = document.getElementById('d-abring');
  if (ring) { const c = getComputedStyle(ring), r = ring.getBoundingClientRect();
    onRing = c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.5 && r.width > 4 && Math.abs(r.left - b.left) <= 1 && Math.abs(r.top - b.top) <= 1 && Math.abs(r.width - b.width) <= 1 && Math.abs(r.height - b.height) <= 1; }
  return { active, keyFocus, own, onLens, onRing, iconFlag: el.hasAttribute('data-lg-focus'), lensFlag: !!lens && lens.hasAttribute('data-lg-focus'), files: isOpen('files'), search: isOpen('search') };
}

// The page, the key walk, the compositor frames and the pixel judge, shared by both tests.
async function rig(t) {
  await t.viewport(1920, 1080);
  const f = await t.app.open();
  const kb = t.page.keyboard;
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1880, 1040);
  const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS_FILM;
  const state = k => f.evaluate(markState, k);
  const sentinel = () => f.evaluate(() => { document.getElementById('fo96-film-s')?.remove(); const b = document.createElement('button'); b.id = 'fo96-film-s'; b.type = 'button'; b.setAttribute('aria-label', 'film sentinel');
    Object.assign(b.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', padding: '0', border: '0' }); const bar = document.getElementById('activityBar'); bar.parentNode.insertBefore(b, bar); b.focus(); });
  const tabTo = async k => { await sentinel(); for (let i = 0; i < 16; i++) { await kb.press('Tab'); if (await f.evaluate(k => document.activeElement?.getAttribute('data-ab-id') === k, k)) return true; } return false; };
  // A Tab walk from just before the bar must reach the icon, or the test stops here: the steps after it would act elsewhere.
  const reach = async (look, k, why) => {
    const ok = await tabTo(k);
    await t.check(`${look}: Tab from the bar's start reaches ${k} (${why})`, ok, ok ? 'reached' : `16 Tabs never focused ${k}; the focus is on ${JSON.stringify((await state(k)).active)}`, { hard: true });
  };
  const step = async (look, label, k, want, act, pixels = true) => {
    const cap = pixels ? await film(act) : (await act(), await f.waitForTimeout(1200), null);
    const s = await state(k);
    t.log(`${look} ${label}: ${JSON.stringify(s)}`);
    await t.check(`${look} ${label}: the key focus is on ${k}`, s.active === k && s.keyFocus === true, JSON.stringify(s));
    await t.check(`${look} ${label}: the key-focused ${k} carries a mark (the focus ring, its own or the lens's)`, s.keyFocus === true && (s.onRing || s.own || s.onLens),
      s.keyFocus ? JSON.stringify(s) : `no key focus on ${k} to carry a mark: ${JSON.stringify(s)}`);
    await t.check(`${look} ${label}: Files is ${want.files ? 'open' : 'shut'} and Search ${want.search ? 'open' : 'not open'}`, s.files === want.files && s.search === want.search,
      `files ${s.files}, search ${s.search}; wanted files ${want.files}, search ${want.search}`);
    await judge(look, label, k, cap);
  };
  // Compositor frames (CDP screencast, PNG) from just before a press until the step's state is read, judged after.
  const cdp = t.run?.tabCapture ? null : await t.page.context().newCDPSession(t.page);
  if (!cdp) t.log('the Mac recorder freezes screencast frames: the mark is not judged on pixels on this run');
  let frames = null;
  if (cdp) cdp.on('Page.screencastFrame', e => { cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); if (frames) frames.push({ wall: e.metadata.timestamp * 1000, data: e.data }); });
  const film = async act => {
    if (!cdp) { await act(); await f.waitForTimeout(1200); return null; }
    frames = []; await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 1920, maxHeight: 1080 });
    for (let i = 0; i < 60 && !frames.length; i++) await f.waitForTimeout(25);
    const at = Date.now(); await act(); await f.waitForTimeout(1200);
    /* in frame order: screencast frames can arrive out of it, and a late frame from before the press, read after one from
       after it, would end the Shift+Tab lead-in early and count as a missing ring (a film showed the ring move in one frame) */
    await cdp.send('Page.stopScreencast').catch(() => {}); const got = frames.sort((p, q) => p.wall - q.wall); frames = null; return { at, got };
  };
  const boxOf = async sel => { const l = f.locator(sel); return (await l.count()) ? l.first().boundingBox() : null; };
  // the accent as the tile resolves it, in 8-bit sRGB (the canvas converts any CSS colour)
  const inkOf = k => f.evaluate(k => { const s = document.querySelector(`#activityBar .icon[data-ab-id="${k}"] .symbol`), c = document.createElement('canvas').getContext('2d');
    const probe = document.createElement('i'); probe.style.color = getComputedStyle(s).getPropertyValue('--accent-primary').trim(); probe.style.display = 'none';
    document.documentElement.appendChild(probe); const col = getComputedStyle(probe).color; probe.remove();
    c.fillStyle = col; c.fillRect(0, 0, 1, 1); return Array.from(c.getImageData(0, 0, 1, 1).data); }, k);
  // every frame of a press, judged: the tile is still (a focused tile stands still), the lens's resting box is read after
  let crops = 0;   /* the first 24 failing frames of a test are cropped */
  // from: the control the key focus left, when a press moves it (Shift+Tab): the frames before the press shows, which
  // still hold that control's whole ring and not yet this one's, are passed over, only while they lead (a ring that goes
  // missing later still fails)
  const frameFaults = async (look, label, k, cap, from = null) => {
    const tile = await boxOf(`#activityBar .icon[data-ab-id="${k}"] .symbol`), lens = await boxOf('#lg-lenses .lg-lens[data-lg-for="rail-icons"]'), ink = await inkOf(k);
    const prev = from ? await boxOf(`#activityBar .icon[data-ab-id="${from}"] .symbol`) : null;
    const near = lens && tile && Math.abs(lens.x + lens.width / 2 - tile.x - tile.width / 2) <= 3 && Math.abs(lens.y + lens.height / 2 - tile.y - tile.height / 2) <= 3 ? lens : null;
    const bad = [], seen = cap.got.length, rows = Math.ceil(Math.max(tile.y + tile.height, near ? near.y + near.height : 0, prev ? prev.y + prev.height : 0)) + 32;
    let lead = !!prev, passed = 0;
    for (const fr of cap.got) {
      const im = decodeTop(Buffer.from(fr.data, 'base64'), rows), sd = better(ringSides(im, tile, ink), near && ringSides(im, near, ink));
      const whole = Object.values(sd).every(v => v.share >= 0.9);
      if (lead && !whole && Object.values(ringSides(im, prev, ink)).every(v => v.share >= 0.9)) { passed++; continue; }
      lead = false;
      if (whole) continue;
      const ms = Math.round(fr.wall - cap.at);
      bad.push({ ms, sides: Object.fromEntries(Object.entries(sd).map(([q, v]) => [q, `${v.share} ${v.median}`])) });
      const span = prev ? { x: Math.min(tile.x, prev.x), y: Math.min(tile.y, prev.y), width: Math.max(tile.x + tile.width, prev.x + prev.width) - Math.min(tile.x, prev.x), height: Math.max(tile.y + tile.height, prev.y + prev.height) - Math.min(tile.y, prev.y) } : tile;
      if (bad.length <= 4 && crops++ < 24 && t.run?.dir) { const dir = join(t.run.dir, 'ring-frames'); mkdirSync(dir, { recursive: true }); cropPng(im, span, join(dir, `${look}-${label.replace(/[^a-z0-9]+/gi, '-')}-${ms}ms.png`)); }
    }
    t.log(`${look} ${label}: ${seen} frames on pixels${passed ? ` (${passed} leading frames still before the press)` : ''}, ink ${ink.slice(0, 3)}, ${bad.length} without the ring at 3:1 on every side${bad.length ? ' ' + JSON.stringify(bad.slice(0, 6)) : ''}`);
    return { seen: seen - passed, bad };
  };
  const judge = async (look, label, k, cap) => {
    if (!cap) return;
    const { seen, bad } = await frameFaults(look, label, k, cap);
    // at least the frame before the press and one after it (a page with little moving, as in Reduced Motion, sends few)
    await t.check(`${look} ${label}: in every frame from the press, ${k}'s ring on pixels at 3:1 on every side`, seen >= 2 && bad.length === 0,
      seen < 2 ? `only ${seen} frames came` : JSON.stringify({ frames: seen, without: bad.length, first: bad.slice(0, 4) }));
  };
  return { f, kb, looks, state, reach, step, film, frameFaults, cdp };
}

const filesOpen = { files: true, search: false }, shut = { files: false, search: false }, searchOpen = { files: false, search: true };
const settle = async (f, look, t) => { await t.app.look(look); await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), null, { timeout: 20000 }).catch(() => {}); await f.waitForTimeout(800); };

async function filmSteps(t) {
  const { f, kb, looks, state, reach, step, cdp } = await rig(t);
  await pinMotion(t, f);
  for (const look of looks) {
    await settle(f, look, t);
    if (!(await state('files')).files) { await reach(look, 'files', 'to open Files first'); await kb.press('Enter'); await f.waitForTimeout(800); }
    await t.check(`${look}: Files is open before the film's steps`, (await state('files')).files, JSON.stringify(await state('files')), { hard: true });
    await step(look, 'Tab to Files (open)', 'files', filesOpen, async () => { await reach(look, 'files', 'the film\'s first step'); await t.mark(`${look}: Tab to Files`); }, false);
    await step(look, 'Enter closes the panel', 'files', shut, async () => { await t.mark(`${look}: Enter on open Files`); await kb.press('Enter'); });
    await step(look, 'Enter opens it again', 'files', filesOpen, async () => { await t.mark(`${look}: Enter on shut Files`); await kb.press('Enter'); });
    await step(look, 'a click on the focused icon closes it', 'files', shut, async () => { await t.mark(`${look}: click on focused Files`); await f.locator('#activityBar .icon[data-ab-id="files"]').click(); await t.page.mouse.move(1880, 1040); });
    await step(look, 'Enter opens it again', 'files', filesOpen, async () => { await t.mark(`${look}: Enter on shut Files (after click)`); await kb.press('Enter'); });
    await step(look, 'Tab to Search', 'search', filesOpen, async () => { await kb.press('Tab'); await t.mark(`${look}: Tab to Search`); }, false);
    await step(look, 'Enter changes the panel to Search', 'search', searchOpen, async () => { await t.mark(`${look}: Enter on Search`); await kb.press('Enter'); });
    await reach(look, 'files', 'to open Files again for the next look'); await kb.press('Enter'); await f.waitForTimeout(800);
    // the lens's travel onto the key-focused Search, twice more (its frames come about every 60-90 ms)
    for (const rep of [2, 3]) {
      await t.check(`${look}: Files is open again before Search's travel ${rep}`, (await state('files')).files, JSON.stringify(await state('files')), { hard: true });
      await reach(look, 'search', `Search's travel ${rep}`); await f.waitForTimeout(600);
      await step(look, `Enter changes the panel to Search (${rep})`, 'search', searchOpen, async () => { await t.mark(`${look}: Enter on Search ${rep}`); await kb.press('Enter'); });
      await reach(look, 'files', 'to open Files again'); await kb.press('Enter'); await f.waitForTimeout(800);
    }
  }
  if (cdp) await cdp.detach().catch(() => {});
  await f.evaluate(() => document.getElementById('fo96-film-s')?.remove());
}

// Reduced Motion as asked (--set motion=reduce: the app's own setting and the media query), else pinned off, so a host
// whose system asks for less motion does not quietly run every travel as Reduced Motion's fade (opus-recheck-f96g K2).
const pinMotion = async (t, f) => {
  const reduce = t.args.motion === 'reduce';
  await t.page.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await f.evaluate(on => { const r = document.documentElement; if (on) r.setAttribute('data-motion', 'reduced'); else if (r.getAttribute('data-motion') === 'reduced') r.removeAttribute('data-motion'); }, reduce);
  return reduce ? 'Reduced Motion' : 'motion';
};
// The load (round 7, see below): armed for one key or pointer press, it finds the rail lens's motion in the frames after
// and holds the main thread ms from the frame after the one that started it (or in a task after that frame's commit).
const installStall = f => f.evaluate(() => {
  if (window.__fo96Stall) return;
  const S = window.__fo96Stall = { arm: 0, held: 0, late: 0 };
  const go = () => { const ms = S.arm; if (!ms) return; S.arm = 0; let tries = 0;
    const hold = () => { const t0 = performance.now(); while (performance.now() - t0 < ms) { /* held */ } S.held++; };
    const look = () => {
      const l = document.querySelector('.lg-lens[data-lg-for="rail-icons"]'), a = l && l.getAnimations().find(x => x.playState === 'running' || x.pending);
      if (a) { if (!tries) setTimeout(hold, 0); else { S.late++; hold(); } return; }
      if (++tries < 150) requestAnimationFrame(look);   /* 2.5 s: a held press's motion starts on its release (in Reduced Motion, the jump's fade) */
    };
    requestAnimationFrame(look); };
  window.addEventListener('keydown', go, true); window.addEventListener('pointerdown', go, true);
});

// F96-1 round 7 (opus-recheck-g8fix): the lens's arrivals on the key-focused Files under load. Under a 60 fps recorder
// on Nas1 a travel onto Files washed its ring to 2.2-2.5:1 in about 1 of 25-30 arrivals, with no cue drawn: the frame
// that starts a travel is committed to the compositor, which runs it, and anything the page decides about the mark
// after that waits for the main thread. The load is made the same every time here: the check's own keydown listener
// (on the window, capturing, so its frame callback is asked for before the app's), armed for one press, looks in each
// frame for the rail lens's motion and, once it has one, holds the main thread for --set stall= ms (600; the panel's
// own build held it 100-500 ms under the recorder): in a task right after that frame if the motion was already there in
// the first frame after the key (that frame commits it), else at once, ahead of the page's own callbacks of the frame
// after the one that started it. Every later frame then waits while the compositor runs the travel, as it did under the
// recorder; what the page put in the travel's own frame is all that shows. With the key focus kept on Files, Search open: Ctrl+1
// and Enter on Files in turn (the lens travels up onto Files), then Ctrl+2 (it leaves Files), --set arrivals= times
// (30) in each look. Every compositor frame of each is judged as the film steps judge theirs; each arrival must also end
// with Files open and the key focus on it.
async function arrivals(t) {
  const { f, kb, looks, state, reach, film, frameFaults } = await rig(t);
  const n = Math.max(1, Number(t.args.arrivals || 30)), stall = Math.max(0, Number(t.args.stall ?? 600));
  const motion = await pinMotion(t, f);
  await installStall(f);
  let armed = 0;
  const press = async key => { await f.evaluate(ms => { window.__fo96Stall.arm = ms; }, stall); if (stall) armed++; await kb.press(key); };
  for (const look of looks) {
    await settle(f, look, t);
    await pinMotion(t, f);
    armed = 0; const held0 = await f.evaluate(() => window.__fo96Stall.held);
    await reach(look, 'files', 'to keep the key focus on Files');
    if (!(await state('search')).search) { await kb.press('Control+2'); await f.waitForTimeout(1200); }
    await t.check(`${look}: Search is open, with the key focus on Files, before the arrivals`, await state('files').then(s => s.search && s.active === 'files' && s.keyFocus), JSON.stringify(await state('files')), { hard: true });
    const arrive = { bad: [], frames: 0, wrong: [] }, leave = { bad: [], frames: 0, wrong: [] };
    for (let i = 0; i < n; i++) {
      const how = i % 2 ? 'Enter' : 'Control+1';
      let cap = await film(async () => { await t.mark(`${look}: arrival ${i + 1} (${how})`); await press(how); });
      let s = await state('files');
      if (!(s.files && s.active === 'files' && s.keyFocus)) arrive.wrong.push({ i, how, s });
      if (cap) { const r = await frameFaults(look, `arrival ${i + 1} (${how})`, 'files', cap); arrive.frames += r.seen; if (r.bad.length) arrive.bad.push({ i: i + 1, how, frames: r.bad.slice(0, 2) }); }
      cap = await film(async () => { await t.mark(`${look}: leaving ${i + 1} (Ctrl+2)`); await press('Control+2'); });
      s = await state('files');
      if (!(s.search && s.active === 'files' && s.keyFocus)) leave.wrong.push({ i, s });
      if (cap) { const r = await frameFaults(look, `leaving ${i + 1} (Ctrl+2)`, 'files', cap); leave.frames += r.seen; if (r.bad.length) leave.bad.push({ i: i + 1, frames: r.bad.slice(0, 2) }); }
      if (arrive.wrong.length + leave.wrong.length > 2) break;
    }
    const held = await f.evaluate(() => window.__fo96Stall);
    t.log(`${look} (${motion}) arrivals under a ${stall} ms stall: ${n} arrivals, ${arrive.frames} frames, ${arrive.bad.length} with a frame below 3:1; leaving: ${leave.frames} frames, ${leave.bad.length}; stalls held ${held.held - held0} of ${armed} armed (all so far: ${held.held}, ${held.late} at once)`);
    // K1 (opus-recheck-f96g): every press was held, or the test ran unloaded
    await t.check(`${look}: each of the ${armed} presses was held ${stall} ms under the stall`, held.held - held0 === armed, JSON.stringify({ armed, held: held.held - held0 }));
    await t.check(`${look}: each of ${n} arrivals on the key-focused Files (Ctrl+1, Enter) under a ${stall} ms main-thread stall ends with Files open and the key focus on it, and so does each Ctrl+2`,
      arrive.wrong.length === 0 && leave.wrong.length === 0, JSON.stringify({ arrive: arrive.wrong.slice(0, 3), leave: leave.wrong.slice(0, 3) }));
    await t.check(`${look}: in every frame of ${n} arrivals on the key-focused Files under a ${stall} ms main-thread stall, its ring on pixels at 3:1 on every side`,
      arrive.frames >= 5 * n && arrive.bad.length === 0, JSON.stringify({ arrivals: n, frames: arrive.frames, failed: arrive.bad.length, first: arrive.bad.slice(0, 4) }));
    await t.check(`${look}: in every frame of ${n} departures from the key-focused Files (Ctrl+2) under the stall, its ring on pixels at 3:1 on every side`,
      leave.frames >= 5 * n && leave.bad.length === 0, JSON.stringify({ departures: n, frames: leave.frames, failed: leave.bad.length, first: leave.bad.slice(0, 4) }));
    await kb.press('Control+1'); await f.waitForTimeout(1200);
  }
  await f.evaluate(() => document.getElementById('fo96-film-s')?.remove());
}

// F96-1 round 8 (opus-recheck-f96g F1, N1, N2): a pointer on the key-focused Files, with Search open. A press there keeps
// :focus-visible (Chrome keeps it on an element that already has it; a press on an unfocused icon gives none), so the
// ring is due in every frame: a quick click with the pointer left on Files (Glass's hover bead comes to rest over it,
// N1), a quick click with the pointer moved off at once, a press held 900 ms (round 7 moved the lens there on the press
// while the app makes Files current only on the release, F1), each also under the round 7 stall armed on the press; the
// pointer resting on Files with no press (the bead over it); and Shift+Tab back to Files from Search after Search's
// focus tag has shown (the tag fades out over Files, N2). Every compositor frame is judged as the film steps judge
// theirs; each route must end with the key focus on Files and the panel it should have. --set clicks= reps (6).
async function pointerRoutes(t) {
  const { f, kb, looks, state, reach, film, frameFaults, cdp } = await rig(t);
  // Search's focus tag fades out over 240 ms (ease-out), so it lies over Files' ring for one to three frames, which the
  // screencast's 15 or so a second catch only sometimes (a 60 fps film caught it in 6 of 6 Shift+Tabs on a617252319). For
  // that press the page's animations run at --set slowTag= (0.1) of their speed, through the DevTools Animation domain,
  // so the fade lasts ten times as long; the ring itself has no animation and is not slowed.
  const slowTag = Number(t.args.slowTag ?? 0.1);
  const pace = async rate => { if (!cdp || !(slowTag > 0 && slowTag < 1)) return;
    await cdp.send('Animation.enable').catch(() => {}); await cdp.send('Animation.setPlaybackRate', { playbackRate: rate }).catch(() => {});
    if (rate === 1) await cdp.send('Animation.disable').catch(() => {}); };   /* enabled only while slowed: its events are not wanted */
  const n = Math.max(1, Number(t.args.clicks || 6)), stall = Math.max(0, Number(t.args.stall ?? 600));
  const motion = await pinMotion(t, f);
  await installStall(f);
  const away = () => t.page.mouse.move(1880, 1040);
  const centre = async k => { const b = await f.locator(`#activityBar .icon[data-ab-id="${k}"] .symbol`).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  const ready = async look => {   // Search open, the key focus on Files, the pointer away
    await away();
    let s = await state('files');
    if (!(s.active === 'files' && s.keyFocus)) await reach(look, 'files', 'to keep the key focus on Files');
    if (!(await state('files')).search) { await kb.press('Control+2'); await f.waitForTimeout(1200); }
    s = await state('files');
    await t.check(`${look}: Search is open, with the key focus on Files, before a pointer route`, s.search && s.active === 'files' && s.keyFocus, JSON.stringify(s), { hard: true });
  };
  for (const look of looks) {
    await settle(f, look, t);
    await pinMotion(t, f);
    t.log(`${look} boxes ${JSON.stringify({ files: await f.locator('#activityBar .icon[data-ab-id="files"] .symbol').boundingBox(), search: await f.locator('#activityBar .icon[data-ab-id="search"] .symbol').boundingBox() })}`);
    const routes = [
      { name: 'a quick click, the pointer left on Files', reps: n, load: 0, act: async () => { await t.page.mouse.move(...(await centre('files'))); await t.page.mouse.down(); await t.page.mouse.up(); }, end: 'files' },
      { name: 'a quick click, the pointer moved off at once', reps: n, load: 0, act: async () => { await t.page.mouse.move(...(await centre('files'))); await t.page.mouse.down(); await t.page.mouse.up(); await away(); }, end: 'files' },
      { name: 'a press held 900 ms', reps: Math.ceil(n / 2), load: 0, act: async () => { await t.page.mouse.move(...(await centre('files'))); await t.page.mouse.down(); await f.waitForTimeout(900); await t.page.mouse.up(); }, end: 'files' },
      { name: `a quick click under a ${stall} ms stall, the pointer left on Files`, reps: n, load: stall, act: async () => { await t.page.mouse.move(...(await centre('files'))); await t.page.mouse.down(); await t.page.mouse.up(); }, end: 'files' },
      { name: `a quick click under a ${stall} ms stall, the pointer moved off`, reps: n, load: stall, act: async () => { await t.page.mouse.move(...(await centre('files'))); await t.page.mouse.down(); await t.page.mouse.up(); await away(); }, end: 'files' },
      { name: `a press held 900 ms under a ${stall} ms stall`, reps: Math.ceil(n / 2), load: stall, act: async () => { await t.page.mouse.move(...(await centre('files'))); await t.page.mouse.down(); await f.waitForTimeout(900); await t.page.mouse.up(); }, end: 'files' },
      { name: 'the pointer resting on the key-focused Files', reps: Math.ceil(n / 2), load: 0, act: async () => { await t.page.mouse.move(...(await centre('files'))); await f.waitForTimeout(600); }, end: 'search' },
      { name: 'Shift+Tab back to Files after Search\'s focus tag shows', reps: n, load: 0, from: 'search', pre: async () => { await kb.press('Tab'); await f.waitForTimeout(1200); await pace(slowTag); }, act: () => kb.press('Shift+Tab'), after: () => pace(1), end: 'search' },
    ];
    for (const r of routes) {
      if (!stall && r.load) continue;
      if (t.args.route && !r.name.includes(String(t.args.route))) continue;   /* --set route=<part of a route's name> */
      const out = { bad: [], frames: 0, wrong: [] }; let armed = 0; const held0 = await f.evaluate(() => window.__fo96Stall.held);
      for (let i = 0; i < r.reps; i++) {
        await ready(look);
        if (r.pre) await r.pre();
        if (r.load) { await f.evaluate(ms => { window.__fo96Stall.arm = ms; }, r.load); armed++; }
        const cap = await film(async () => { await t.mark(`${look}: ${r.name} ${i + 1}`); await r.act(); });
        if (r.after) await r.after();
        const s = await state('files');
        const ok = s.active === 'files' && s.keyFocus === true && (r.end === 'files' ? s.files : s.search);
        if (!ok) out.wrong.push({ i: i + 1, s });
        if (cap) { const q = await frameFaults(look, `${r.name} ${i + 1}`, 'files', cap, r.from || null); out.frames += q.seen; if (q.bad.length) out.bad.push({ i: i + 1, frames: q.bad.slice(0, 2) }); }
        await away(); await f.waitForTimeout(300);
      }
      const held = await f.evaluate(() => window.__fo96Stall.held) - held0;
      t.log(`${look} (${motion}) ${r.name}: ${r.reps} presses, ${out.frames} frames, ${out.bad.length} with a frame below 3:1${r.load ? `; held ${held} of ${armed}` : ''}`);
      await t.check(`${look} (${motion}): ${r.name}, ${r.reps} times: the key focus stays on Files with its ring on pixels at 3:1 on every side in every frame, and the panel is as it should be`,
        out.wrong.length === 0 && out.bad.length === 0 && out.frames >= 3 * r.reps && (!r.load || held === armed), JSON.stringify({ frames: out.frames, failed: out.bad.length, first: out.bad.slice(0, 3), wrong: out.wrong.slice(0, 2), held: r.load ? `${held}/${armed}` : undefined }));
    }
    await away(); await kb.press('Control+1'); await f.waitForTimeout(1200);
  }
  await f.evaluate(() => document.getElementById('fo96-film-s')?.remove());
}

export const tests = { 'film steps': filmSteps, 'arrivals under a main-thread stall': arrivals, 'pointer routes': pointerRoutes };
