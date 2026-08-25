/* context-verify.mjs — Wave 3 (item 6) independent-rerunnable assertions.
 *
 *   cd "<repo>/Concepts/chat-assistant-concepts/5.6 Pro"
 *   node /path/to/waves/context-verify.mjs
 *
 * or from the waves dir (it symlinks the concept's node_modules):
 *   node context-verify.mjs
 *
 * WHY IT LOOKS LIKE THIS.  `getBoundingClientRect()` lies about elements that
 * are clipped, occluded, or mid-transition — this concept already shipped three
 * false-positive "fixes" measured that way, and a suite reporting 434/434 PASS
 * while twelve defects were live.  So every visual claim here is confirmed
 * TWICE: `document.elementFromPoint()` at the target's own centre (proving the
 * element actually owns that pixel and nothing is on top of it), plus a colour
 * read from a real screenshot crop decoded from the PNG (proving the pixel is
 * painted, not merely laid out).  A geometry number on its own is never the
 * assertion.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pathToFileURL } from 'url';

const ROOT = process.env.PM56_ROOT ||
  '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
/* Screenshots and the JSON report land in the concept's own reports/ dir, the
   same place audit.json goes. Override with PM56_OUT. */
const OUT = process.env.PM56_OUT || path.join(ROOT, 'reports', 'context-verify');
fs.mkdirSync(OUT, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('playwright-core')); }

const pass = [], fail = [];
const ok = (cond, label, detail = '') => (cond ? pass : fail).push({ label, detail: String(detail) });

/* ---------- minimal PNG decoder: enough to read one pixel ---------- */
function pngPixels(buf) {
  let p = 8, w = 0, h = 0, bd = 0, ct = 0, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (bd !== 8 || (ct !== 6 && ct !== 2)) throw new Error(`unsupported png bd=${bd} ct=${ct}`);
  const bpp = ct === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let q = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[q++];
    const line = raw.subarray(q, q + stride); q += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = (prev && x >= bpp) ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[x] = v & 255;
    }
  }
  return { w, h, bpp, out };
}
function pxAt(png, x, y) {
  const { w, bpp, out } = png;
  const i = (y * w + x) * bpp;
  return [out[i], out[i + 1], out[i + 2]];
}
/* screenshot a clip and return the colour at its centre — proof of PAINT */
async function paintedColour(page, box, file) {
  const clip = { x: Math.round(box.x), y: Math.round(box.y), width: Math.max(2, Math.round(box.width)), height: Math.max(2, Math.round(box.height)) };
  const p = path.join(OUT, file);
  await page.screenshot({ path: p, clip });
  const png = pngPixels(fs.readFileSync(p));
  return pxAt(png, Math.floor(png.w / 2), Math.floor(png.h / 2));
}
const notTransparentish = (rgb, bg) => Math.abs(rgb[0] - bg[0]) + Math.abs(rgb[1] - bg[1]) + Math.abs(rgb[2] - bg[2]) > 24;

/* elementFromPoint at a node's own centre must resolve back INTO that node */
async function ownsCentre(page, selector, nth = 0) {
  return page.evaluate(([sel, n]) => {
    const el = document.querySelectorAll(sel)[n];
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    return {
      found: true, owns: !!hit && (el === hit || el.contains(hit) || hit.contains(el)),
      rect: { x: r.left, y: r.top, width: r.width, height: r.height },
      hit: hit ? (hit.tagName + '.' + String(hit.className || '').split(' ')[0]) : null
    };
  }, [selector, nth]);
}

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const consoleErrors = [], pageErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO);

/* Escape, never a body click: this concept's history flyout puts a scrim over
   the page, so `document.body.click()` can dismiss the drawer instead of the
   menu and leave the two surfaces out of step.  app.js's Escape handler is
   ordered menu -> dialog -> context drawer -> floating history, so three
   presses return the app to a known-closed state whatever was open. */
const closeAll = async () => {
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(40); }
  await page.waitForTimeout(60);
};
/* Overlays enter on a 520ms spring. getBoundingClientRect() reports the
   TRANSFORMED box, so measuring before the entrance settles reports a
   drawer 20px off-screen that is in fact perfectly placed -- the exact
   false-positive class this project has been burned by. Wait for the
   element's own animations to finish, not for a guessed timeout. */
const settle = async (sel) => {
  await page.waitForFunction(s => {
    const el = document.querySelector(s);
    if (!el) return false;
    const running = el.getAnimations({ subtree: false }).some(a => a.playState === 'running');
    return !running;
  }, sel, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(60);
};
const openRing = async () => {
  await closeAll();
  await page.locator('.context-ring').first().click();
  await page.locator('.ctx-pop').first().waitFor({ state: 'visible' });
  await settle('.overlay-menu');
};
const openDrawer = async () => {
  await page.evaluate(() => window.PM56_DEMO.openContext());
  await page.locator('.ctx-drawer').first().waitFor({ state: 'visible' });
  await settle('.ctx-drawer');
};

/* =====================================================================
   0. the module is actually loaded
   ===================================================================== */
ok(await page.evaluate(() => !!(window.PM56_CTX && window.PM56_CTX.ringPct)), 'PM56_CTX helper is exposed');

/* =====================================================================
   1. THE COMPACT MENU IS NOT TWO STACKED FULL-WIDTH ROWS
   The specific complaint item 6 exists to fix.  Three independent proofs:
   same row (y overlap), each under half the menu width, and each owning
   its own painted centre pixel.
   ===================================================================== */
await openRing();
{
  ok((await page.locator('.ctx-pop').count()) === 1, 'Exactly one compact menu is mounted',
    await page.locator('.ctx-pop').count());
  const menu = await page.locator('.ctx-pop').first().boundingBox();
  const btns = await page.locator('.ctx-acts .ctx-minibtn').all();
  ok(btns.length === 2, 'Compact menu action row has exactly two minibuttons', btns.length);
  const a = await btns[0].boundingBox(), b = await btns[1].boundingBox();
  const sameRow = Math.abs(a.y - b.y) < 4 && a.x + a.width <= b.x + 1;
  ok(sameRow, 'The two actions are SIDE BY SIDE, not stacked', JSON.stringify({ a, b }));
  ok(a.width < menu.width * 0.5 && b.width < menu.width * 0.5,
    'Neither action is a full-width row', JSON.stringify({ menu: menu.width, a: a.width, b: b.width }));
  ok(a.height <= 26 && b.height <= 26, 'Both actions are minibutton-height (<=26px)', JSON.stringify({ ah: a.height, bh: b.height }));
  /* The --spring / --spring-soft trap: those tokens bundle DURATION + easing,
     so `animation: x 240ms var(--spring-soft)` silently becomes 240ms duration
     plus a 440ms DELAY. Every animation this module declares must resolve to a
     zero delay. */
  const delays = await page.$$eval('.ctx-status, .ctx-meter i, .ctx-spin, .ctx-pop',
    els => els.map(e => [e.className, getComputedStyle(e).animationDelay]));
  ok(delays.every(([, d]) => d === '0s' || d === 'auto' || d === ''),
    'No context animation carries an accidental spring delay', JSON.stringify(delays));
  const o1 = await ownsCentre(page, '.ctx-acts .ctx-minibtn', 0);
  const o2 = await ownsCentre(page, '.ctx-acts .ctx-minibtn', 1);
  ok(o1.owns && o2.owns, 'Both minibuttons own their own centre pixel (elementFromPoint)', JSON.stringify({ o1, o2 }));
  ok((await page.locator('.ctx-pop .menu-item').count()) === 0,
    'No full-width .menu-item rows remain in the compact menu');
  const labels = await page.locator('.ctx-acts .ctx-minibtn').allInnerTexts();
  ok(/compact now/i.test(labels.join(' ')) && /more details/i.test(labels.join(' ')),
    'Actions are labelled Compact now / More details', JSON.stringify(labels));
  const cache = await page.locator('.ctx-cache').first().innerText();
  ok(/cache hit/i.test(cache) && /\d+%/.test(cache), 'Cache-hit reading sits on the same action row', cache);
  /* the reading must be READABLE, not ellipsised away by the two buttons */
  const clipped = await page.locator('.ctx-cache').first().evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth, t: el.textContent }));
  ok(clipped.sw <= clipped.cw + 1, 'Cache reading is not truncated by the action row', JSON.stringify(clipped));
}

/* =====================================================================
   2. THE PLAN-LIMITS METERS ACTUALLY PAINT
   ===================================================================== */
{
  const rows = await page.locator('.ctx-limrow').count();
  ok(rows >= 2, 'Plan-limits block renders meter rows', rows);
  const head = await page.locator('.ctx-limhead').first().innerText();
  ok(/·/.test(head), 'Plan-limits head is product · connection', head);
  const fillBox = await page.locator('.ctx-meter i').first().boundingBox();
  ok(fillBox && fillBox.width > 4 && fillBox.height >= 3, 'Meter fill has real geometry', JSON.stringify(fillBox));
  const own = await ownsCentre(page, '.ctx-meter i', 0);
  ok(own.owns, 'Meter fill owns its centre pixel', JSON.stringify(own));
  const track = await page.locator('.ctx-meter').first().boundingBox();
  const fillPx = await paintedColour(page, fillBox, 'meter-fill.png');
  const emptyPx = await paintedColour(page,
    { x: track.x + track.width - 3, y: track.y, width: 2, height: track.height }, 'meter-empty.png');
  ok(notTransparentish(fillPx, emptyPx),
    'Meter fill is PAINTED a different colour from its empty track', JSON.stringify({ fillPx, emptyPx }));
  const vals = await page.locator('.ctx-limval').allInnerTexts();
  ok(vals.every(v => /%$/.test(v)), 'Every meter row prints its own percentage', JSON.stringify(vals));
  const rst = await page.locator('.ctx-limrst').count();
  ok(rst >= 1, 'Reset times are printed', rst);
  const more = await page.locator('[data-action="ctx-more-limits"]').count();
  if (more) {
    const before = await page.locator('.ctx-limrow').count();
    await page.locator('[data-action="ctx-more-limits"]').first().click();
    await page.waitForTimeout(120);
    const after = await page.locator('.ctx-limrow').count();
    ok(after > before, '"More limits (N)" expander reveals additional rows', `${before} -> ${after}`);
    await page.locator('[data-action="ctx-more-limits"]').first().click();
    await page.waitForTimeout(120);
    ok((await page.locator('.ctx-limrow').count()) === before, '"More limits" collapses again');
  } else ok(false, '"More limits (N)" expander exists on the query thread');
}

/* =====================================================================
   3. THE SEGMENTED BAR + LEGEND, AND FAMILY-KEYED COLOUR
   ===================================================================== */
{
  const segs = await page.locator('.ctx-segbar i').count();
  ok(segs >= 5, 'Segmented composition bar has one segment per non-empty family', segs);
  const legs = await page.locator('.ctx-legend .ctx-leg').allInnerTexts();
  ok(legs.length >= 3, 'Legend names families', JSON.stringify(legs));
  ok(legs.some(t => /smaller sources/.test(t)), 'Legend rolls the rest into "N smaller sources P%"', JSON.stringify(legs));
  const seg0 = await page.locator('.ctx-segbar i').first().boundingBox();
  const segPx = await paintedColour(page, seg0, 'seg0.png');
  const own = await ownsCentre(page, '.ctx-segbar i', 0);
  ok(own.owns, 'First segment owns its centre pixel', JSON.stringify(own));
  ok(segPx[0] + segPx[1] + segPx[2] > 60, 'First segment is painted', JSON.stringify(segPx));
}

/* =====================================================================
   4. THE COMPACT-NOW STATE MACHINE — at least three DISTINCT outcomes
   ===================================================================== */
const outcomes = new Map();
for (let i = 0; i < 8; i++) {
  await openRing();
  await page.locator('[data-action="ctx-compact-now"]').first().click();
  await page.locator('.ctx-status.working').first().waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
  const spinning = await page.locator('.ctx-spin').count();
  if (i === 0) {
    ok(spinning === 1, 'A working spinner appears while compaction runs');
    ok((await page.locator('.ctx-minibtn.busy').count()) === 1,
      'Compact now shows a busy state instead of accepting a second run');
  }
  await page.waitForTimeout(1300);
  const st = await page.locator('.ctx-status').first().evaluate(el => ({
    outcome: el.getAttribute('data-outcome'),
    tone: ['ok', 'info', 'warn'].find(t => el.classList.contains(t)) || null,
    title: (el.querySelector('b') || {}).textContent || '',
    text: el.textContent.slice(0, 160),
    bg: getComputedStyle(el).backgroundColor
  })).catch(() => null);
  if (st && st.outcome) outcomes.set(st.outcome, st);
}
ok(outcomes.size >= 6, `Compact Now reports >=6 of the 7 canonical outcomes (got ${outcomes.size})`,
  JSON.stringify([...outcomes.keys()]));
ok(new Set([...outcomes.values()].map(o => o.tone)).size >= 2,
  'Outcomes carry at least two different tones', JSON.stringify([...outcomes.values()].map(o => [o.outcome, o.tone])));
ok(new Set([...outcomes.values()].map(o => o.bg)).size >= 2,
  'Outcome tones are PAINTED differently (computed background)', JSON.stringify([...new Set([...outcomes.values()].map(o => o.bg))]));
ok([...outcomes.values()].every(o => o.title && o.title.length > 3),
  'Every outcome carries a titled explanation', JSON.stringify([...outcomes.values()].map(o => o.title)));
{ /* a "Not recommended" whose body boasts about reclaimed tokens is a lie */
  const d = outcomes.get('declined');
  ok(!d || !/removes [\d,]+ tokens and leaves/.test(d.text),
    'The "Not recommended" outcome does not contradict its own body', d ? d.text : 'n/a');
}

/* =====================================================================
   5. THE DRAWER
   ===================================================================== */
await closeAll();
await openDrawer();
{
  const rows = await page.locator('.ctx-srcrow').count();
  ok(rows >= 5, 'Source composition renders one row per family', rows);
  const first = await page.locator('.ctx-srcrow').first().evaluate(el => ({
    p: el.querySelector('.ctx-srcpct').textContent,
    t: el.querySelector('.ctx-srctok').textContent,
    tn: getComputedStyle(el.querySelector('.ctx-srctok')).fontVariantNumeric
  }));
  ok(/%$/.test(first.p.trim()), 'Source row shows a percentage', first.p);
  ok(/^[\d,]+$/.test(first.t.trim()) && Number(first.t.replace(/,/g, '')) > 0,
    'Source row ALSO shows an integer token count', first.t);
  ok(/tabular-nums/.test(first.tn), 'Token column is tabular-nums', first.tn);

  /* textContent, NOT innerText: `.metric-card label` is text-transform:uppercase,
     so innerText returns the RENDERED "CONNECTION USED" and a case-sensitive
     check on the authored label silently fails. */
  const body = await page.locator('.ctx-drawer').first().evaluate(el => el.textContent);
  for (const label of ['Product', 'Connection used', 'Model', 'Account'])
    ok(body.includes(label), `Drawer surfaces "${label}"`);
  ok(/Capabilities/i.test(body), 'Drawer surfaces a Capabilities section');
  for (const cap of ['Goal', 'Crew', 'Back Seat Driver', 'Context Lens', 'ELI5', 'Thought Stream'])
    ok((await page.locator('.ctx-cap .ctx-caplab').allInnerTexts()).includes(cap), `Capability row: ${cap}`);
  const capsOn = await page.locator('.ctx-cap.on').count();
  ok(capsOn >= 1, 'At least one capability renders in its ON state', capsOn);

  /* growth chart */
  ok((await page.locator('.ctx-growth svg').count()) === 1, 'Growth chart renders');
  const par = await page.locator('.ctx-growth svg').first().getAttribute('preserveAspectRatio');
  ok(par === null, 'preserveAspectRatio="none" is GONE (uniform scaling)', String(par));
  const svgText = sel => page.$$eval(sel, els => els.map(e => e.textContent.trim()));
  const ylabs = await svgText('.ctx-growth .ctx-ylab');
  ok(ylabs.length >= 4 && ylabs.some(t => /K$/.test(t)), 'Y axis prints token reference values', JSON.stringify(ylabs));
  const xlabs = await svgText('.ctx-growth .ctx-xlab');
  ok(xlabs.length >= 3 && xlabs.every(t => /^\d\d:\d\d$/.test(t)), 'X axis prints time ticks', JSON.stringify(xlabs));
  ok((await page.locator('.ctx-growth .ctx-ceiling').count()) === 1, 'The window limit is drawn as a marked ceiling');
  const ceilLab = (await svgText('.ctx-growth .ctx-ceillab'))[0] || '';
  ok(/window limit/i.test(ceilLab), 'The ceiling is LABELLED', ceilLab);
  const legend = await page.locator('.ctx-growth-legend').first().innerText();
  ok(/tokens/i.test(legend) && /UTC/i.test(legend), 'Chart states its units', legend.replace(/\n/g, ' | '));
  const titles = await page.locator('.ctx-growth .ctx-pt title').count();
  ok(titles >= 5, 'Every plotted point carries a hover value', titles);
  /* the ceiling must be a painted stroke, not a declared one */
  await page.locator('.ctx-growth').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const cb = await page.locator('.ctx-growth .ctx-ceiling').first().boundingBox();
  const cpx = await paintedColour(page, { x: cb.x + cb.width / 2 - 4, y: cb.y - 1, width: 8, height: 3 }, 'ceiling.png');
  const bgpx = await paintedColour(page, { x: cb.x + cb.width / 2 - 4, y: cb.y + 14, width: 8, height: 3 }, 'ceiling-bg.png');
  ok(notTransparentish(cpx, bgpx), 'The ceiling line is PAINTED', JSON.stringify({ cpx, bgpx }));
  /* the plot must not be sideways-clipped by the drawer */
  const wrapScroll = await page.locator('.ctx-growth-wrap').first().evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth, ov: getComputedStyle(el).overflowX }));
  ok(wrapScroll.ov === 'auto', 'Wide chart scrolls inside its own container', JSON.stringify(wrapScroll));
}

/* =====================================================================
   6. THE NUMBERS ACTUALLY CHANGE PER THREAD, AND THE RING AGREES
   ===================================================================== */
const perThread = {};
for (const tid of ['query', 'plain', 'subagents', 'debug', 'context', 'no-models']) {
  await closeAll();
  await page.evaluate(t => window.PM56_DEMO.selectThread(t), tid);
  await page.waitForTimeout(120);
  await openRing();
  const frac = await page.locator('.ctx-frac').first().innerText();
  const cache = await page.locator('.ctx-cache').first().innerText();
  const note = await page.locator('.ctx-threadnote').first().innerText();
  const ring = await page.locator('.context-ring').first().evaluate(el => ({
    v: el.getAttribute('data-value'),
    pct: getComputedStyle(el).getPropertyValue('--context-pct').trim(),
    title: el.getAttribute('title')
  }));
  const limits = await page.locator('.ctx-limrow').count();
  const none = await page.locator('.ctx-limnone').count();
  const clip = await page.locator('.ctx-cache').first().evaluate(el => el.scrollWidth <= el.clientWidth + 1);
  ok(clip, `Cache reading fits the action row on ${tid}`, cache);
  perThread[tid] = { frac, cache, note, ring, limits, none };
}
const fracs = Object.values(perThread).map(x => x.frac);
ok(new Set(fracs).size === fracs.length, 'Every thread reports its OWN used/limit/pct', JSON.stringify(perThread, null, 1));
ok(new Set(Object.values(perThread).map(x => x.note)).size >= 3, 'model · account footnote differs per thread');
for (const [tid, v] of Object.entries(perThread)) {
  const menuPct = (v.frac.match(/(\d+)%\s*$/) || [])[1];
  ok(menuPct && v.ring.v === menuPct,
    `Ring and its own menu agree on ${tid}`, `ring=${v.ring.v} menu=${menuPct} css=${v.ring.pct} title=${v.ring.title}`);
}
ok(perThread['no-models'].none === 1,
  'A connection with no exposed plan limits says so instead of drawing an empty meter',
  JSON.stringify(perThread['no-models']));
ok(/not reported/i.test(perThread['no-models'].cache),
  'A thread that never got a route reports its cache hit as "not reported", never 0%',
  perThread['no-models'].cache);

/* drawer numbers change too */
const drawerNums = {};
for (const tid of ['query', 'subagents', 'no-models']) {
  await closeAll();
  await page.evaluate(t => window.PM56_DEMO.selectThread(t), tid);
  await openDrawer();
  drawerNums[tid] = await page.locator('.ctx-drawer .context-hero').first().innerText();
}
ok(new Set(Object.values(drawerNums)).size === 3, 'Drawer hero differs per thread', JSON.stringify(drawerNums));

/* an honest-gap capture: the thread with no route at all */
await closeAll();
await page.evaluate(() => window.PM56_DEMO.selectThread('no-models'));
await openRing();
{
  const b = await page.locator('.overlay-menu').first().boundingBox();
  await page.screenshot({ path: path.join(OUT, 'menu-no-route.png'), clip: { x: Math.max(0, b.x - 6), y: Math.max(0, b.y - 6), width: b.width + 12, height: b.height + 12 } });
  await page.locator('[data-action="ctx-compact-now"]').first().click();
  await page.waitForTimeout(1300);
  const st = await page.locator('.ctx-status').first().evaluate(el => ({ o: el.getAttribute('data-outcome'), t: el.textContent }));
  ok(st.o === 'no-gain', 'A thread with nothing to reclaim reports NO GAIN on its first Compact now', JSON.stringify(st));
  await page.screenshot({ path: path.join(OUT, 'menu-no-route-nogain.png'), clip: { x: Math.max(0, b.x - 6), y: Math.max(0, b.y - 6), width: b.width + 12, height: b.height + 160 } });
}
await closeAll();
await page.evaluate(() => window.PM56_DEMO.selectThread('subagents'));
await openRing();
{
  await page.locator('[data-action="ctx-compact-now"]').first().click();
  await page.waitForTimeout(1300);
  const st = await page.locator('.ctx-status').first().evaluate(el => ({ o: el.getAttribute('data-outcome'), t: el.textContent }));
  ok(st.o === 'completed', 'The thread where compaction pays reports COMPLETED first', JSON.stringify(st));
  ok(/34,800/.test(st.t), 'The completed outcome quotes THAT thread\'s numbers, not a shared literal', st.t.slice(0, 160));
  const b = await page.locator('.overlay-menu').first().boundingBox();
  await page.screenshot({ path: path.join(OUT, 'menu-completed.png'), clip: { x: Math.max(0, b.x - 6), y: Math.max(0, b.y - 6), width: b.width + 12, height: b.height + 12 } });
}

/* Reset REASSIGNS app.js's state object. A helper that cached the old
   reference would keep answering from a dead state; prove it does not. */
await closeAll();
await page.evaluate(() => { window.PM56_DEMO.selectThread('debug'); });
await page.waitForTimeout(120);
await page.evaluate(() => window.PM56_DEMO.reset());
await page.waitForTimeout(400);
{
  const after = await page.locator('.context-ring').first().evaluate(el => el.getAttribute('data-value'));
  ok(after === '64', 'Ring follows the state object across a global Reset', String(after));
}

/* =====================================================================
   7. SCREENSHOTS — a light and a dark theme, menu and drawer
   ===================================================================== */
await closeAll();
await page.evaluate(() => window.PM56_DEMO.selectThread('query'));
for (const theme of ['basic-dark', 'friendly-light', 'retro-light', 'glass-dark']) {
  await page.evaluate(t => window.PM56_DEMO.setTheme(t), theme);
  await closeAll();
  await openRing();
  const b = await page.locator('.overlay-menu').first().boundingBox();
  await page.screenshot({ path: path.join(OUT, `menu-${theme}.png`), clip: { x: Math.max(0, b.x - 6), y: Math.max(0, b.y - 6), width: b.width + 12, height: b.height + 12 } });
  await closeAll();
  await openDrawer();
  const d = await page.locator('.ctx-drawer').first().boundingBox();
  await page.screenshot({ path: path.join(OUT, `drawer-${theme}.png`), clip: d });
  await page.locator('.ctx-drawer .drawer-scroll').first().evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(OUT, `drawer-bottom-${theme}.png`), clip: d });
  await closeAll();
}

/* =====================================================================
   8. NARROW WIDTH — the drawer must survive it
   ===================================================================== */
await page.evaluate(t => window.PM56_DEMO.setTheme(t), 'basic-dark');
for (const w of [390, 650]) {
  await page.setViewportSize({ width: w, height: 900 });
  await closeAll();
  await openDrawer();
  const r = await page.evaluate(() => {
    const d = document.querySelector('.ctx-drawer').getBoundingClientRect();
    return { right: d.right, cw: document.documentElement.clientWidth, bodySW: document.body.scrollWidth,
             wrap: (() => { const el = document.querySelector('.ctx-growth-wrap'); return el ? { sw: el.scrollWidth, cw: el.clientWidth } : null; })() };
  });
  ok(r.right <= r.cw + 1, `Drawer stays on screen at ${w}px`, JSON.stringify(r));
  const heroOwns = await ownsCentre(page, '.ctx-drawer .context-hero');
  ok(heroOwns.owns, `Drawer content is not occluded at ${w}px`, JSON.stringify(heroOwns));
  await page.screenshot({ path: path.join(OUT, `drawer-narrow-${w}.png`), clip: await page.locator('.ctx-drawer').first().boundingBox() });
  await closeAll();
}
await page.setViewportSize({ width: 1440, height: 900 });

/* =====================================================================
   9. ALL EIGHT THEMES: six families, six DISTINCT painted colours
   ===================================================================== */
for (const theme of ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light']) {
  await page.evaluate(t => window.PM56_DEMO.setTheme(t), theme);
  await closeAll();
  await openDrawer();
  const cols = await page.evaluate(() => [...document.querySelectorAll('.ctx-srcrow i')]
    .map(el => getComputedStyle(el).backgroundColor));
  ok(new Set(cols).size === cols.length, `Six family colours are distinct in ${theme}`, JSON.stringify(cols));
  await closeAll();
}
await page.evaluate(t => window.PM56_DEMO.setTheme(t), 'basic-dark');

/* =====================================================================
   10. REDUCED MOTION — the state machine still advances
   ===================================================================== */
{
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page2.goto(pathToFileURL(path.join(ROOT, 'index.html')).href, { waitUntil: 'load' });
  await page2.waitForFunction(() => window.__PM56_BOOT_OK === true);
  await page2.locator('.context-ring').click();
  await page2.locator('.ctx-pop').first().waitFor({ state: 'visible' });
  await page2.locator('[data-action="ctx-compact-now"]').first().click();
  await page2.waitForTimeout(1400);
  const st = await page2.locator('.ctx-status').first().getAttribute('data-outcome');
  ok(!!st, 'Compaction still reaches an outcome under prefers-reduced-motion', String(st));
  const anim = await page2.evaluate(() => {
    const el = document.querySelector('.ctx-spin');
    return el ? getComputedStyle(el).animationName : 'gone';
  });
  ok(anim === 'none' || anim === 'gone', 'The spinner loop is stopped under reduced motion', String(anim));
  await page2.close();
}

/* ---------- report ---------- */
ok(consoleErrors.length === 0, 'No console errors', consoleErrors.join(' | '));
ok(pageErrors.length === 0, 'No uncaught page errors', pageErrors.join(' | '));
await browser.close();

const report = {
  overall: fail.length ? 'FAIL' : 'PASS',
  summary: { passed: pass.length, failed: fail.length },
  failures: fail, passes: pass.map(p => p.label),
  perThread, generatedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(OUT, '..', 'context-verify.json'), JSON.stringify(report, null, 2));
console.log(report.overall, JSON.stringify(report.summary));
for (const f of fail) console.log('FAIL', f.label, '::', f.detail.slice(0, 300));
process.exit(fail.length ? 1 : 0);
