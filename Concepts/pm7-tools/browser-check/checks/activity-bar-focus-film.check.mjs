// FO-96 / F96b-1, F96b-2: a film of the key focus mark on the open panel's icon in Glass Dark and Glass Light, where
// Liquid Glass's lens carries it. Tab to Files (the open panel), Enter (at 1920 it closes the panel), Enter again (it
// opens), a real click on the focused icon (it closes), Enter (it opens), Tab to Search, Enter (the panel changes to
// Search). Each step is marked on the film, and three things are asserted after it (F96-1 round 6, astra-review-g8 A):
// the key focus is on the step's icon (it is the active element and matches :focus-visible); that icon carries a mark,
// its own (a 3 px accent outline on its tile) or the lens's (data-lg-focus on a lens painted at rest on it), never
// neither; and the panels are as the step says (Files open or shut, Search open or not). A Tab that can't reach its icon
// stops the test at once. No step here means to lose the key focus: a click on the key-focused icon keeps it, so a
// press that drops it fails.
// The mark is also judged on pixels in every compositor frame from each press to the settled state (sol-review-g8: the
// lens travelling onto the key-focused Search washed Search's own ring to 2.2:1 before it took the mark), and the Tab
// to Search and Enter is done twice more in each look, as the frames come at about 15 a second. In each frame each side
// of the focused tile must hold its ring at 3:1 (see ringSides). Record with --record /abs/file.mp4 (GPU, 1920x1080);
// `browser-check frames <film> --run <folder>` gives the frames after each mark. --set looks=glass-dark limits the looks.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng } from '../helpers/activity-cover-pixels.mjs';
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
  let onLens = false;
  if (lens && lens.hasAttribute('data-lg-focus') && parseFloat(getComputedStyle(lens).opacity) > 0.5) {
    const l = lens.getBoundingClientRect(), b = sym.getBoundingClientRect();
    onLens = Math.abs((l.left + l.right) / 2 - (b.left + b.right) / 2) <= 3 && Math.abs((l.top + l.bottom) / 2 - (b.top + b.bottom) / 2) <= 3;
  }
  return { active, keyFocus, own, onLens, iconFlag: el.hasAttribute('data-lg-focus'), lensFlag: !!lens && lens.hasAttribute('data-lg-focus'), files: isOpen('files'), search: isOpen('search') };
}

export default async function (t) {
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
    await t.check(`${look} ${label}: the key-focused ${k} carries a mark, its own or the lens's`, s.keyFocus === true && (s.own || s.onLens),
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
    await cdp.send('Page.stopScreencast').catch(() => {}); const got = frames; frames = null; return { at, got };
  };
  const boxOf = async sel => { const l = f.locator(sel); return (await l.count()) ? l.first().boundingBox() : null; };
  // the accent as the tile resolves it, in 8-bit sRGB (the canvas converts any CSS colour)
  const inkOf = k => f.evaluate(k => { const s = document.querySelector(`#activityBar .icon[data-ab-id="${k}"] .symbol`), c = document.createElement('canvas').getContext('2d');
    const probe = document.createElement('i'); probe.style.color = getComputedStyle(s).getPropertyValue('--accent-primary').trim(); probe.style.display = 'none';
    document.documentElement.appendChild(probe); const col = getComputedStyle(probe).color; probe.remove();
    c.fillStyle = col; c.fillRect(0, 0, 1, 1); return Array.from(c.getImageData(0, 0, 1, 1).data); }, k);
  // every frame of a press, judged: the tile is still (a focused tile stands still), the lens's resting box is read after
  const judge = async (look, label, k, cap) => {
    if (!cap) return;
    const tile = await boxOf(`#activityBar .icon[data-ab-id="${k}"] .symbol`), lens = await boxOf('#lg-lenses .lg-lens[data-lg-for="rail-icons"]'), ink = await inkOf(k);
    const near = lens && tile && Math.abs(lens.x + lens.width / 2 - tile.x - tile.width / 2) <= 3 && Math.abs(lens.y + lens.height / 2 - tile.y - tile.height / 2) <= 3 ? lens : null;
    const bad = [], seen = cap.got.length;
    for (const fr of cap.got) {
      const im = decodePng(Buffer.from(fr.data, 'base64')), sd = better(ringSides(im, tile, ink), near && ringSides(im, near, ink));
      if (Object.values(sd).every(v => v.share >= 0.9)) continue;
      const ms = Math.round(fr.wall - cap.at);
      bad.push({ ms, sides: Object.fromEntries(Object.entries(sd).map(([q, v]) => [q, `${v.share} ${v.median}`])) });
      if (bad.length <= 4 && t.run?.dir) { const dir = join(t.run.dir, 'ring-frames'); mkdirSync(dir, { recursive: true }); cropPng(im, tile, join(dir, `${look}-${label.replace(/[^a-z0-9]+/gi, '-')}-${ms}ms.png`)); }
    }
    t.log(`${look} ${label}: ${seen} frames on pixels, ink ${ink.slice(0, 3)}, ${bad.length} without the ring at 3:1 on every side${bad.length ? ' ' + JSON.stringify(bad.slice(0, 6)) : ''}`);
    await t.check(`${look} ${label}: in every frame from the press, ${k}'s ring on pixels at 3:1 on every side`, seen >= 5 && bad.length === 0,
      seen < 5 ? `only ${seen} frames came` : JSON.stringify({ frames: seen, without: bad.length, first: bad.slice(0, 4) }));
  };
  const filesOpen = { files: true, search: false }, shut = { files: false, search: false }, searchOpen = { files: false, search: true };
  for (const look of looks) {
    await t.app.look(look);
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), null, { timeout: 20000 }).catch(() => {});
    await f.waitForTimeout(800);
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
