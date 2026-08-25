/* menus-verify.mjs — Wave 3 (Menus, item 5) re-runnable assertion harness.
 *
 *   node menus-verify.mjs [path/to/index.html] [--json out.json]
 *
 * Written so a DIFFERENT agent can re-run these assertions without reading the
 * implementation. Everything is asserted on PAINTED PIXELS or on sampled
 * frames, never on a bounding box alone:
 *   - hit tests go through document.elementFromPoint()
 *   - "does it paint" is a screenshot crop decoded back into the page and read
 *     with getImageData(), so a transparent or clipped node fails
 *   - motion claims are sampled per frame, so a CSS rule that never runs fails
 *
 * Local chromium (http hangs in this sandbox; file:// only):
 *   ~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome
 */
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const EXE = process.env.PM_CHROME ||
  '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const TARGET = args[0] ||
  '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/index.html';
const jsonIdx = process.argv.indexOf('--json');
const JSON_OUT = jsonIdx > -1 ? process.argv[jsonIdx + 1] : null;
const URL = pathToFileURL(TARGET).href;

const results = [];
let failed = 0;
function ok(name, cond, detail) {
  results.push({ name, pass: !!cond, detail });
  if (!cond) failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  ' + JSON.stringify(detail) : ''}`);
}

/* ---- painted-pixel read: screenshot crop -> canvas -> getImageData ---- */
async function paint(page, clip) {
  const buf = await page.screenshot({
    clip: {
      x: Math.max(0, Math.round(clip.x)), y: Math.max(0, Math.round(clip.y)),
      width: Math.max(1, Math.round(clip.width)), height: Math.max(1, Math.round(clip.height))
    }
  });
  const url = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async (u) => {
    const img = new Image(); img.src = u; await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const seen = new Set(); let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++;
    }
    const cx = (c.width >> 1), cy = (c.height >> 1);
    const o = (cy * c.width + cx) * 4;
    return {
      colours: seen.size,
      mean: [Math.round(r / n), Math.round(gg / n), Math.round(b / n)],
      centre: [d[o], d[o + 1], d[o + 2]]
    };
  }, url);
}

async function paintOf(page, selector) {
  const box = await page.evaluate(s => {
    const el = document.querySelector(s); if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, selector);
  if (!box || box.width < 1 || box.height < 1) return null;
  return paint(page, box);
}

/* Does the element (or a descendant) own the pixel at its own centre? */
async function ownsCentre(page, selector) {
  return page.evaluate(s => {
    const el = document.querySelector(s); if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      found: true,
      owns: !!hit && (hit === el || el.contains(hit)),
      hit: hit ? (hit.tagName + '.' + (hit.className || '').toString().split(' ')[0]) : null,
      rect: { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }
    };
  }, selector);
}

const PICKERS = [
  ['persona', '.selector-button[data-kind="persona"]'],
  ['model', '.selector-button[data-kind="model"]'],
  ['mode', '.selector-button[data-kind="mode"]'],
  ['permissions', '.selector-button[data-kind="permissions"]'],
  ['worktree', '.chat-header .worktree-button']
];

const browser = await chromium.launch({ executablePath: EXE });

/* ================================================================== */
/* Pass 1 — normal motion                                             */
/* ================================================================== */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [], pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  /* ---- B1. worktree control sits between search and the context ring ---- */
  const hdr = await page.evaluate(() => {
    const h = document.querySelector('.chat-header');
    const kids = [...h.children];
    const wt = h.querySelector('.worktree-button');
    const search = h.querySelector('[data-menu-anchor="thread-search"]');
    const ring = h.querySelector('.context-ring');
    const rc = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(1), r: +r.right.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
    return {
      order: kids.map(k => k.className.split(' ').filter(Boolean).slice(0, 2).join('.') || k.tagName),
      idxSearch: kids.indexOf(search), idxWt: kids.indexOf(wt), idxRing: kids.indexOf(ring),
      wt: wt ? rc(wt) : null, search: search ? rc(search) : null, ring: ring ? rc(ring) : null,
      state: wt ? wt.getAttribute('data-wt-state') : null,
      anchors: [...document.querySelectorAll('[data-menu-anchor="worktree"]')]
        .map(e => ({ tag: e.tagName, cls: e.className, display: getComputedStyle(e).display })),
      fixture: (() => {
        const st = window.PM56_DEMO.getState();
        const w = (window.PM56_DATA.operational.worktrees || []).find(x => x.id === st.worktree);
        return w ? { id: w.id, state: w.state } : null;
      })()
    };
  });
  ok('worktree button exists in .chat-header', !!hdr.wt, hdr.wt);
  /* NB: `headerExtras` has more than one registrant — the Wave 2 Goals agent
     puts a goal chip in the same slot and registers earlier (build.py MODULES
     order) and the Wave 3 Lens agent adds .pm-lens-trigger after it, so no
     adjacency is controllable from menus.js. The contract is the one the task
     states: inside .chat-header, after the search icon, before the context
     ring. Live order today: search / goal chip / WORKTREE / lens / ring. */
  ok('worktree sits between the search icon and the context ring',
    hdr.idxSearch > -1 && hdr.idxWt > hdr.idxSearch && hdr.idxRing > hdr.idxWt,
    { idxSearch: hdr.idxSearch, idxWt: hdr.idxWt, idxRing: hdr.idxRing, order: hdr.order });
  ok('worktree is horizontally between them in painted geometry',
    hdr.wt && hdr.search && hdr.ring && hdr.wt.l >= hdr.search.r - 1 && hdr.wt.r <= hdr.ring.l + 1,
    { search: hdr.search, wt: hdr.wt, ring: hdr.ring });
  ok('worktree button keeps its 30x30 hit target (no flex-shrink)',
    hdr.wt && hdr.wt.w >= 29 && hdr.wt.h >= 29, hdr.wt);
  ok('worktree state is read from D.operational.worktrees, not the branch string',
    hdr.fixture && hdr.state === hdr.fixture.state, { attr: hdr.state, fixture: hdr.fixture });
  ok('exactly one VISIBLE data-menu-anchor="worktree"',
    hdr.anchors.filter(a => a.display !== 'none').length === 1, hdr.anchors);

  const wtHit = await ownsCentre(page, '.chat-header .worktree-button');
  ok('worktree button owns the pixel at its own centre', wtHit.owns, wtHit);
  const wtPaint = await paintOf(page, '.chat-header .worktree-button');
  ok('worktree button paints (crop has real content)', wtPaint && wtPaint.colours > 8, wtPaint);

  /* dot colour must differ between fixture states */
  const dotColours = {};
  for (const id of ['main', 'feature/query-index', 'concept/chat-5-6-pro', 'review/query-benchmarks']) {
    /* Driven through the real control, not a back door: open the header menu
       and click the row, exactly as a user would. */
    await page.evaluate(async (v) => {
      document.querySelector('.chat-header .worktree-button').click();
      await new Promise(r => setTimeout(r, 200));
      const row = document.querySelector(`#pmOverlayRoot [data-action="set-worktree"][data-value="${v.replace(/["\\]/g, '\\$&')}"]`);
      if (row) row.click();
    }, id);
    await page.waitForTimeout(450);
    const st = await page.evaluate(() => {
      const b = document.querySelector('.chat-header .worktree-button');
      const d = b.querySelector('.wt-dot');
      const r = d.getBoundingClientRect();
      return { state: b.getAttribute('data-wt-state'), x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const p = await paint(page, { x: st.x, y: st.y, width: st.w, height: st.h });
    dotColours[id] = { state: st.state, centre: p.centre };
  }
  const uniqueDots = new Set(Object.values(dotColours).map(d => d.centre.join(',')));
  ok('the state dot paints a different colour per worktree state',
    uniqueDots.size >= 3, dotColours);

  /* ---- C. every picker opens, paints, hit-tests, and closes ---- */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  for (const [name, sel] of PICKERS) {
    await page.click(sel);
    await page.waitForTimeout(430);
    const info = await page.evaluate(() => {
      const roots = document.querySelectorAll('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
      const el = roots[0];
      if (!el) return { count: roots.length };
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(24, r.height / 2));
      return {
        count: roots.length,
        rect: { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
        opacity: +cs.opacity, transform: cs.transform,
        origin: cs.transformOrigin,
        sprout: document.getElementById('pmOverlayRoot').getAttribute('data-pm56-sprout'),
        inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5,
        owns: !!hit && el.contains(hit)
      };
    });
    ok(`${name}: exactly one root menu open`, info.count === 1, info);
    ok(`${name}: settles fully open (opacity 1, transform none)`,
      info.opacity === 1 && (info.transform === 'none' || info.transform === 'matrix(1, 0, 0, 1, 0, 0)'),
      { opacity: info.opacity, transform: info.transform });
    ok(`${name}: inside the viewport`, info.inView, info.rect);
    ok(`${name}: hit-tests to itself`, info.owns, info);
    ok(`${name}: sprout origin published`, info.sprout === 'b' || info.sprout === 't', info.sprout);
    const p = await paintOf(page, '#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
    ok(`${name}: paints real content`, p && p.colours > 40, p);

    /* it must not cover its own trigger (the pre-fix mis-measure bug) */
    const cover = await page.evaluate(s => {
      const a = document.querySelector(s).getBoundingClientRect();
      const m = document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]').getBoundingClientRect();
      const overlap = !(m.right < a.left || m.left > a.right || m.bottom < a.top || m.top > a.bottom);
      const sprout = document.getElementById('pmOverlayRoot').getAttribute('data-pm56-sprout');
      const gap = sprout === 'b' ? a.top - m.bottom : m.top - a.bottom;
      return { overlap, gap: +gap.toFixed(1), sprout,
               anchor: { t: +a.top.toFixed(1), b: +a.bottom.toFixed(1) },
               menu: { t: +m.top.toFixed(1), b: +m.bottom.toFixed(1) } };
    }, sel);
    ok(`${name}: does not cover its own trigger`, !cover.overlap, cover);
    /* positionOverlays' designed gap is exactly 7px, and it is deterministic
       once the three measurement traps are handled (transform, left-dependent
       width, and mid-sprout re-measurement). A drifting gap here means one of
       them has come back: a box was measured that the menu was not going to
       keep. Loosening this tolerance instead of fixing the cause is how a
       green suite ends up hiding a menu that overlaps its own trigger. */
    ok(`${name}: sits against its trigger (gap ~7px, not floated away)`,
      cover.gap >= 0 && cover.gap <= 10, cover);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({
      menus: document.querySelectorAll('#pmOverlayRoot .overlay-menu').length,
      ghosts: document.querySelectorAll('.pm56-menu-ghost').length
    }));
    ok(`${name}: closes cleanly (no menu, no leaked ghost)`,
      after.menus === 0 && after.ghosts === 0, after);
  }

  /* ---- C2. model menu: 14 rows across provider groups, scrolls to the last ---- */
  await page.click('.selector-button[data-kind="model"]');
  await page.waitForTimeout(450);
  await page.click('.provider-button[data-value="all"]');
  await page.waitForTimeout(500);
  const model = await page.evaluate(() => {
    const m = document.querySelector('.overlay-menu.model-menu');
    const sc = m.querySelector('.model-scroll');
    return {
      fixture: window.PM56_DATA.models.length,
      rows: m.querySelectorAll('.model-row').length,
      groups: m.querySelectorAll('.menu-section-label').length,
      providers: new Set([...m.querySelectorAll('.menu-section-label')].map(x => x.textContent)).size,
      clientH: sc.clientHeight, scrollH: sc.scrollHeight,
      overflow: getComputedStyle(sc).overflowY
    };
  });
  ok('model menu paints every fixture model', model.rows === model.fixture && model.rows === 14, model);
  ok('model menu groups them by provider', model.groups >= 5, model);
  ok('model list overflows and is scrollable', model.scrollH > model.clientH && model.overflow === 'auto', model);

  const lastRow = await page.evaluate(async () => {
    const sc = document.querySelector('.model-scroll');
    sc.scrollTop = sc.scrollHeight;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const rows = sc.querySelectorAll('.model-row');
    const last = rows[rows.length - 1];
    const r = last.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + 60, r.top + r.height / 2);
    return {
      scrolled: sc.scrollTop > 0, scrollTop: sc.scrollTop,
      name: last.querySelector('strong') ? last.querySelector('strong').textContent.trim() : null,
      owns: !!hit && last.contains(hit),
      rect: { x: +r.left.toFixed(1), y: +r.top.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) }
    };
  });
  ok('model list actually scrolls', lastRow.scrolled, lastRow);
  ok('the LAST model row hit-tests to itself after scrolling', lastRow.owns, lastRow);
  const lastPaint = await paint(page, lastRow.rect);
  ok('the last model row paints', lastPaint.colours > 15, lastPaint);

  /* provider rail filters */
  const rail = await page.evaluate(async () => {
    const out = {};
    const btns = [...document.querySelectorAll('.provider-button')];
    for (const b of btns) {
      b.click();
      await new Promise(r => setTimeout(r, 60));
      const m = document.querySelector('.overlay-menu.model-menu');
      out[b.getAttribute('data-value')] = m.querySelectorAll('.model-row').length;
    }
    return out;
  });
  const railVals = Object.values(rail);
  ok('provider rail filters the list', new Set(railVals).size > 2 && rail.all === 14, rail);

  /* ---- A3. search filter springs the height, pinned on the bottom edge ---- */
  await page.evaluate(() => document.querySelector('.provider-button[data-value="all"]').click());
  await page.waitForTimeout(500);
  const spring = await page.evaluate(async () => {
    const m = document.querySelector('.overlay-menu.model-menu');
    const start = m.getBoundingClientRect();
    const inp = m.querySelector('input[data-input="model-search"]');
    const samples = [];
    inp.value = 'claude'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    const t0 = performance.now();
    await new Promise(res => {
      (function step() {
        const r = m.getBoundingClientRect();
        samples.push([+(performance.now() - t0).toFixed(0), +r.height.toFixed(2), +r.bottom.toFixed(2)]);
        if (performance.now() - t0 < 700) requestAnimationFrame(step); else res();
      })();
    });
    const end = m.getBoundingClientRect();
    return {
      startH: +start.height.toFixed(1), startBottom: +start.bottom.toFixed(1),
      endH: +end.height.toFixed(1), endBottom: +end.bottom.toFixed(1),
      target: parseFloat(m.style.height),
      rows: m.querySelectorAll('.model-row').length,
      samples
    };
  });
  const hs = spring.samples.map(s => s[1]);
  const bs = spring.samples.map(s => s[2]);
  /* "in flight" = neither the start height nor the settled height. A jump would
     produce zero such frames. Counting only values BETWEEN start and end would
     wrongly exclude the overshoot frames, which are below the end height. */
  const inFlight = hs.filter(h => Math.abs(h - spring.startH) > 1 && Math.abs(h - spring.endH) > 0.75).length;
  ok('height animates rather than jumping (intermediate frames exist)', inFlight >= 4,
    { inFlight, first10: spring.samples.slice(0, 10) });
  ok('height overshoots past the target and settles (spring, not an ease)',
    Math.min(...hs) < spring.endH - 0.75,
    { min: +Math.min(...hs).toFixed(2), end: spring.endH });
  ok('the BOTTOM edge stays pinned while filtering (top edge absorbs the change)',
    Math.max(...bs) - Math.min(...bs) < 2.5,
    { spread: +(Math.max(...bs) - Math.min(...bs)).toFixed(2), startBottom: spring.startBottom, endBottom: spring.endBottom });
  ok('filter really filtered', spring.rows === 6 && spring.endH < spring.startH, { rows: spring.rows, startH: spring.startH, endH: spring.endH });

  /* ---- A2. the close stays opaque through most of the collapse ---- */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.click('.selector-button[data-kind="persona"]');
  await page.waitForTimeout(450);
  const close = await page.evaluate(async () => {
    const samples = [];
    const t0 = performance.now();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(res => {
      (function step() {
        const g = document.querySelector('.pm56-menu-ghost');
        if (g) {
          const cs = getComputedStyle(g);
          const m = new DOMMatrixReadOnly(cs.transform);
          samples.push([+(performance.now() - t0).toFixed(0), +(+cs.opacity).toFixed(3), +m.a.toFixed(3), +m.d.toFixed(3)]);
        }
        if (performance.now() - t0 < 400) requestAnimationFrame(step); else res();
      })();
    });
    return { samples, ghostGone: !document.querySelector('.pm56-menu-ghost'), menus: document.querySelectorAll('#pmOverlayRoot .overlay-menu').length };
  });
  /* samples are [t, opacity, scaleX, scaleY]. The closed scale is
     scale3d(.72,.48,1), so the vertical collapse spans 1.0 -> 0.48 and
     "50% collapsed" is scaleY 0.74. */
  const s = close.samples;
  ok('a closing ghost exists (there is an exit animation at all)', s.length > 4, { frames: s.length });
  const half = s.find(x => x[3] <= 0.74);
  ok('still fully opaque at 50% of the vertical collapse',
    !!half && half[1] >= 0.95,
    { at50pct: half, sample: s.slice(0, 14) });
  const t0 = s[0][0], tEnd = s[s.length - 1][0];
  const fade = s.find(x => x[1] < 0.99);
  const fadeFrac = fade ? (fade[0] - t0) / Math.max(1, tEnd - t0) : 1;
  ok('the fade is held back to the last third of the close',
    fadeFrac >= 0.6,
    { fadeStartsAtFraction: +fadeFrac.toFixed(3), fadeFrame: fade, firstT: t0, lastT: tEnd });
  ok('close is non-uniform (y collapses further than x)',
    s.length > 2 && s[s.length - 1][3] < s[s.length - 1][2],
    { last: s[s.length - 1] });
  ok('ghost is cleaned up', close.ghostGone && close.menus === 0, close);

  /* ---- one transient overlay at a time ---- */
  const solo = await page.evaluate(async () => {
    const seq = ['persona', 'model', 'mode', 'permissions'];
    const counts = [];
    for (const k of seq) {
      document.querySelector(`.selector-button[data-kind="${k}"]`).click();
      await new Promise(r => setTimeout(r, 120));
      counts.push(document.querySelectorAll('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]').length);
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return counts;
  });
  ok('never more than one root menu at a time', solo.every(c => c === 1), solo);
  await page.waitForTimeout(400);

  /* ---- 8 themes ---- */
  const themes = await page.evaluate(() => window.PM56_DATA.themes.map(t => t.id));
  const themeOut = {};
  for (const t of themes) {
    await page.evaluate(id => window.PM56_DEMO.setTheme(id), t);
    await page.waitForTimeout(320);
    const p = await paintOf(page, '.chat-header .worktree-button');
    const hit = await ownsCentre(page, '.chat-header .worktree-button');
    themeOut[t] = { colours: p ? p.colours : 0, owns: hit.owns };
  }
  ok('worktree control paints and hit-tests in all 8 themes',
    Object.keys(themeOut).length === 8 && Object.values(themeOut).every(v => v.colours > 5 && v.owns),
    themeOut);
  await page.evaluate(() => window.PM56_DEMO.setTheme('basic-dark'));

  ok('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 4));
  ok('no page errors', pageErrors.length === 0, pageErrors.slice(0, 4));
  await page.close();
}

/* ================================================================== */
/* Pass 2 — prefers-reduced-motion                                    */
/* ================================================================== */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const rm = await page.evaluate(async () => {
    document.querySelector('.selector-button[data-kind="model"]').click();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
    const el = document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
    const cs = el ? getComputedStyle(el) : null;
    const r = el ? el.getBoundingClientRect() : null;
    const hit = r ? document.elementFromPoint(r.left + r.width / 2, r.top + 20) : null;
    const state = {
      opened: !!el,
      opacity: cs ? +cs.opacity : null,
      transform: cs ? cs.transform : null,
      transition: cs ? cs.transitionDuration : null,
      owns: !!(hit && el && el.contains(hit))
    };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r2 => requestAnimationFrame(() => requestAnimationFrame(r2)));
    state.ghosts = document.querySelectorAll('.pm56-menu-ghost').length;
    state.menus = document.querySelectorAll('#pmOverlayRoot .overlay-menu').length;
    return state;
  });
  ok('reduced motion: menu is fully open within 3 frames', rm.opened && rm.opacity === 1, rm);
  ok('reduced motion: no residual transform', rm.transform === 'none' || rm.transform === 'matrix(1, 0, 0, 1, 0, 0)', rm.transform);
  ok('reduced motion: transitions are off', /^0s(,\s*0s)*$/.test(rm.transition || ''), rm.transition);
  ok('reduced motion: menu is hit-testable', rm.owns, rm);
  ok('reduced motion: close is instant, no ghost', rm.ghosts === 0 && rm.menus === 0, rm);
  ok('reduced motion: no console/page errors', errs.length === 0, errs.slice(0, 4));
  await page.close();
}

await browser.close();



console.log(`\n${results.length - failed} passed / ${failed} failed`);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ target: TARGET, failed, results }, null, 1));
process.exit(failed ? 1 : 0);
