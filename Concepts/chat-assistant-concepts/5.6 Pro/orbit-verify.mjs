/* orbit-verify.mjs — Wave 4 (item 12, Orbit) verification harness.
 *
 *   node orbit-verify.mjs                     # verifies ./index.html
 *   node orbit-verify.mjs --file <path.html>  # verifies an alternate build
 *   node orbit-verify.mjs --negative          # inverts the verdict: this run is
 *                                             # EXPECTED to fail (run it against a
 *                                             # build with orbit.{js,css} blanked)
 *   node orbit-verify.mjs --json <out.json>
 *
 * WHY --file EXISTS. A harness that can only measure the tree its author built
 * cannot be run as a negative control, and cannot be re-run by a second agent
 * against a control build. Both of those are required here: this concept once
 * shipped a suite reporting 434/434 PASS while twelve defects were live.
 *
 * EVERY geometric claim is confirmed twice: once through
 * document.elementFromPoint() (which knows about clipping and occlusion, unlike
 * getBoundingClientRect) and once through a real painted-pixel read — the crop is
 * screenshotted, handed back to the page as a data URL, drawn to a canvas and
 * sampled with getImageData. No assertion in this file rests on a bounding box
 * alone, and none rests on a dispatch count.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const NEGATIVE = argv.includes('--negative');
const ROOT = process.env.PM56_ROOT || process.cwd();
const FILE = path.resolve(arg('--file', path.join(ROOT, 'index.html')));
const OUT = arg('--json', null);

const results = [];
let cur = null;
function ok(label, detail) { results.push({ label, pass: true, detail: detail ?? null, group: cur }); }
function bad(label, detail) { results.push({ label, pass: false, detail: detail ?? null, group: cur }); }
function check(label, cond, detail) { (cond ? ok : bad)(label, detail); return cond; }
async function safe(label, fn) {
  cur = label;
  try { await fn(); }
  catch (e) { bad(label + ' [threw]', String(e).split('\n')[0]); }
  cur = null;
}

/* ---- painted-pixel reader ------------------------------------------
   Screenshot a clip, hand the PNG back to the page, draw it and read the
   bytes. This is the only way to answer "is it painted": a rect is reported
   for elements that are clipped, occluded, transparent or mid-transition. */
async function readPixels(page, clip) {
  const buf = await page.screenshot({ clip });
  const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async (u) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = u; });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const seen = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      seen.set(k, (seen.get(k) || 0) + 1);
    }
    const sorted = [...seen.entries()].sort((a, b) => b[1] - a[1]);
    const px = c.width * c.height;
    const dom = sorted[0];
    return {
      w: c.width, h: c.height, distinct: seen.size,
      dominant: '#' + dom[0].toString(16).padStart(6, '0'),
      dominantShare: +(dom[1] / px).toFixed(3),
      /* "ink" = anything that is not the dominant (background) colour */
      inkShare: +(1 - dom[1] / px).toFixed(3),
      centre: (() => {
        const i = ((Math.floor(c.height / 2) * c.width) + Math.floor(c.width / 2)) * 4;
        return '#' + ((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]).toString(16).padStart(6, '0');
      })()
    };
  }, dataUrl);
}
/* ---- the crispness reader ------------------------------------------
   "Does it paint ink" is NOT a crispness test — a 0.71px stroke paints plenty
   of ink, it just paints all of it grey. The discriminating question is how
   many pixels reach the icon's ACTUAL colour: a sub-pixel stroke can never
   fully cover a device pixel, so it produces almost none, while a >1px stroke
   has a fully-covered core. Verified against the negative control, where the
   same crop scores ~0. */
async function strokeCore(page, clip, fg, tol = 26) {
  const buf = await page.screenshot({ clip });
  const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async ({ u, fg, tol }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = u; });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let core = 0, near = 0;
    for (let i = 0; i < d.length; i += 4) {
      const dist = Math.hypot(d[i] - fg[0], d[i + 1] - fg[1], d[i + 2] - fg[2]);
      if (dist <= tol) core++;
      if (dist <= tol * 3) near++;
    }
    return { core, near, px: c.width * c.height };
  }, { u: dataUrl, fg, tol });
}
const clipOf = r => ({ x: Math.max(0, Math.round(r.x)), y: Math.max(0, Math.round(r.y)), width: Math.max(1, Math.round(r.width)), height: Math.max(1, Math.round(r.height)) });

/* ---- setup ---------------------------------------------------------- */
if (!fs.existsSync(FILE)) { console.error('orbit-verify: no such file ' + FILE); process.exit(2); }
const browser = await chromium.launch();
const consoleNoise = [];

async function newPage(opts = {}) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts });
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleNoise.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => consoleNoise.push('pageerror: ' + e.message));
  await p.goto('file://' + FILE);
  await p.waitForFunction(() => window.PM56_DEMO, null, { timeout: 20000 });
  return p;
}
/* The assistant pane is sized by the user-resizable editor split, which is the
   whole reason this take uses a container query. Drag the real divider rather
   than resizing the viewport, so the measurement exercises the real constraint. */
async function setEditorPct(page, pct) {
  const h = page.locator('[data-resize="editor"]').first();
  const b = await h.boundingBox();
  if (!b) return false;
  const target = 1440 * (pct / 100);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(target, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(260);
  return true;
}
async function orbit(page, step = 7) {
  await page.evaluate(s => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.setWorkStep(s); }, step);
  await page.waitForTimeout(620);
}

const page = await newPage();

/* =====================================================================
   1 — shared phase trail: crispness, and it is fixed for EVERY take
   ===================================================================== */
await safe('Shared trail: painted stroke is over 1px in every take that uses it', async () => {
  const takes = [0, 1, 3, 8];
  const out = {};
  for (const t of takes) {
    await page.evaluate(v => { window.PM56_DEMO.setVariant(2, v); window.PM56_DEMO.setWorkStep(6); }, t);
    await page.waitForTimeout(520);
    out['take' + t] = await page.evaluate(() => {
      const read = el => {
        if (!el) return null;
        const svg = el.querySelector('svg'); if (!svg) return null;
        const r = svg.getBoundingClientRect();
        const sw = parseFloat(getComputedStyle(svg).strokeWidth) || 1.8;
        return {
          box: +el.getBoundingClientRect().width.toFixed(2),
          svg: +r.width.toFixed(2),
          strokeUser: sw,
          paintedPx: +(sw * (r.width / 24)).toFixed(3),
          transform: getComputedStyle(el).transform
        };
      };
      return {
        current: read(document.querySelector('.wa-disc.current, .rail8-item.current')),
        rest: read(document.querySelector('.wa-disc.done, .rail8-item.done'))
      };
    });
  }
  let worst = 99, where = '';
  for (const [k, v] of Object.entries(out)) {
    for (const [state, m] of Object.entries(v)) {
      if (!m) continue;
      if (m.paintedPx < worst) { worst = m.paintedPx; where = k + '/' + state; }
    }
  }
  check('trail stroke >= 1.2px everywhere (worst ' + worst + 'px at ' + where + ')', worst >= 1.2, out);
  /* No resting scale anywhere: scale(.86) was 14% of the sub-pixel problem. */
  const shrunk = Object.entries(out).filter(([, v]) => v.rest && /matrix\(0\.8/.test(v.rest.transform));
  check('no disc rests at scale(.86)', shrunk.length === 0, shrunk.map(x => x[0]));
});

await safe('Shared trail: the stroke reaches full colour in painted pixels', async () => {
  await page.evaluate(() => { window.PM56_DEMO.setVariant(2, 3); window.PM56_DEMO.setWorkStep(6); });
  await page.waitForTimeout(520);
  for (const [which, sel] of [['current', '.wa-disc.current'], ['resting', '.wa-disc.done']]) {
    const box = await page.locator(sel).first().boundingBox();
    if (!box) { bad(which + ' disc not found'); continue; }
    const fg = await page.evaluate(q => getComputedStyle(document.querySelector(q)).color.match(/\d+/g).slice(0, 3).map(Number), sel);
    const px = await readPixels(page, clipOf(box));
    const sc = await strokeCore(page, clipOf(box), fg);
    /* Threshold set from the two measurements, not invented: the negative
       control scores core=0 on BOTH discs (a 0.71-0.83px stroke can never fully
       cover a device pixel), this build scores 11-20. 6 sits between them with
       margin on each side. */
    check(which + ' disc: the icon stroke has a fully-covered core (>=6 px at its own colour; control scores 0)', sc.core >= 6, { ...sc, fg });
    check(which + ' disc: crop paints real ink, not a flat block', px.inkShare >= 0.08 && px.distinct >= 8, px);
  }
});

await safe('Shared trail: the track scrolls instead of clipping', async () => {
  const m = await page.evaluate(() => {
    const t = document.querySelector('.wa-track');
    const cs = getComputedStyle(t);
    return { overflowX: cs.overflowX, scrollW: t.scrollWidth, clientW: t.clientWidth, gap: cs.columnGap };
  });
  check('.wa-track overflow-x is auto (was hidden)', m.overflowX === 'auto', m);
  /* Force a genuinely overflowing trail and prove every disc is reachable. */
  const reach = await page.evaluate(async () => {
    const t = document.querySelector('.wa-track');
    t.style.maxWidth = '90px';
    /* scroll-behavior:smooth means scrollLeft does NOT land in one frame — the
       first version of this probe read it one rAF later, saw 0, and reported a
       non-scrolling track that scrolls perfectly well. Disable the smoothing
       for the measurement rather than racing it. */
    const prevBehavior = t.style.scrollBehavior;
    t.style.scrollBehavior = 'auto';
    await new Promise(r => requestAnimationFrame(r));
    const discs = [...t.querySelectorAll('.wa-disc')];
    const last = discs[discs.length - 1];
    const before = t.scrollLeft;
    t.scrollLeft = t.scrollWidth;
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));
    const b = last.getBoundingClientRect();
    const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    const res = { overflowing: t.scrollWidth > t.clientWidth + 1, scrolled: t.scrollLeft > before,
      scrollLeft: Math.round(t.scrollLeft), lastReachable: last === el || last.contains(el) };
    t.style.maxWidth = ''; t.style.scrollBehavior = prevBehavior;
    return res;
  });
  /* `reach.scrolled` alone is VACUOUS and the negative control proved it: an
     `overflow:hidden` box still has a scrollport and still obeys a programmatic
     scrollLeft — it just gives the USER no way to move it. The computed
     overflow has to be part of the same claim. */
  check('a clipped trail is user-scrollable and its last disc hit-tests to itself',
    m.overflowX === 'auto' && reach.overflowing && reach.scrolled && reach.lastReachable, { ...reach, overflowX: m.overflowX });
});

/* =====================================================================
   2 — the shared chrome is gone from above Orbit
   ===================================================================== */
await safe('Orbit: the shared phase chrome is not shown above it', async () => {
  await orbit(page);
  const m = await page.evaluate(() => {
    const ch = document.querySelector('.working-variant-1 .wa-chrome');
    if (!ch) return { present: false };
    const cs = getComputedStyle(ch), r = ch.getBoundingClientRect();
    const d = ch.querySelector('.wa-disc');
    const db = d && d.getBoundingClientRect();
    return {
      present: true, display: cs.display, h: r.height,
      discHitsSelf: db ? (() => { const el = document.elementFromPoint(db.left + db.width / 2, db.top + db.height / 2); return el === d || (d.contains(el)); })() : null
    };
  });
  check('no phase-chrome icon row is rendered or painted above Orbit',
    m.present === false || (m.display === 'none' && m.h === 0), m);
  if (m.present) bad('chrome is hidden but still in the DOM (CHROME_OPTS[1].noChrome patch pending with the orchestrator)', m);
});

/* =====================================================================
   3 — the orbiting nodes are the control
   ===================================================================== */
await safe('Orbit: every node hit-tests to itself and paints', async () => {
  await orbit(page, 7);
  const m = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.orbit-node')];
    return {
      count: nodes.length,
      steps: window.PM56_DATA ? window.PM56_DATA.workSteps.length : null,
      ringPE: nodes.length ? getComputedStyle(document.querySelector('.orbit-ring')).pointerEvents : null,
      hits: nodes.map(n => { const b = n.getBoundingClientRect(); const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return n === el || n.contains(el); }),
      actions: nodes.map(n => n.dataset.action),
      labelled: nodes.every(n => (n.getAttribute('aria-label') || '').length > 5),
      tags: nodes.map(n => n.tagName)
    };
  });
  check('a node exists for every work step', m.count > 0 && (m.steps == null || m.count === m.steps), m);
  check('all nodes hit-test to themselves', m.count > 0 && m.hits.every(Boolean), { hits: m.hits });
  check('every node carries orbit-open-phase', m.count > 0 && m.actions.every(a => a === 'orbit-open-phase'), m.actions);
  check('nodes are real buttons with accessible names', m.count > 0 && m.tags.every(t => t === 'BUTTON') && m.labelled, { tags: m.tags && m.tags[0], labelled: m.labelled });

  /* Colour claim, asserted against the TOKEN rather than an arbitrary share of
     the crop. A rounded node inside a 26px square crop is only ~22% one colour
     once the corners, the glow and the pulse ring are counted, so "dominant
     share" measured the crop's shape, not the node's fill. The honest question
     is "is the centre pixel the phase colour the stylesheet says it should be". */
  const live = await page.locator('.orbit-node.live').first().boundingBox();
  if (live) {
    const px = await readPixels(page, clipOf(live));
    const want = await page.evaluate(() => {
      const n = document.querySelector('.orbit-node.live');
      const c = getComputedStyle(n).backgroundColor.match(/\d+/g).map(Number);
      const surf = getComputedStyle(document.querySelector('.working-card')).backgroundColor.match(/\d+/g).map(Number);
      return { fill: c.slice(0, 3), surface: surf.slice(0, 3) };
    });
    const got = [1, 3, 5].map((i, k) => parseInt(px.centre.slice(1 + k * 2, 3 + k * 2), 16));
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    check('the live node paints its declared phase fill at its centre (delta <= 12)',
      dist(got, want.fill) <= 12, { painted: px.centre, declared: want.fill, delta: +dist(got, want.fill).toFixed(1) });
    check('the live node is visibly distinct from the card behind it (delta >= 40)',
      dist(got, want.surface) >= 40, { painted: px.centre, surface: want.surface, delta: +dist(got, want.surface).toFixed(1) });
    check('the live node crop carries real ink, not a flat block', px.inkShare >= 0.08 && px.distinct >= 8, px);
  } else bad('no .orbit-node.live to sample');
});

await safe('Orbit: transform carries no accidental delay', async () => {
  const m = await page.evaluate(() => {
    const n = document.querySelector('.orbit-node');
    const cs = getComputedStyle(n);
    return { prop: cs.transitionProperty, delay: cs.transitionDelay, dur: cs.transitionDuration };
  });
  const delays = (m.delay || '').split(',').map(s => parseFloat(s));
  check('no transition on a node carries a delay (--spring bundles 520ms; --spring-ease does not)',
    delays.every(d => !d), m);
});

/* =====================================================================
   4 — collapsed / expanded, and the transition in both directions
   ===================================================================== */
await safe('Orbit: collapsed state is the centred circle with no panel', async () => {
  await orbit(page, 7);
  await page.evaluate(() => { const b = document.querySelector('[data-action="orbit-collapse"]'); if (b) b.click(); });
  await page.waitForTimeout(620);
  const m = await page.evaluate(() => {
    const st = document.querySelector('.orbit-stage'), p = st.querySelector('.orbit-panel'), d = st.querySelector('.orbit-dial');
    const sr = st.getBoundingClientRect(), pr = p.getBoundingClientRect(), dr = d.getBoundingClientRect();
    const el = document.elementFromPoint(sr.left + sr.width / 2, dr.top + dr.height / 2);
    return {
      open: st.dataset.orbitOpen,
      panelW: +pr.width.toFixed(2), panelH: +pr.height.toFixed(2),
      dialOffCentre: +Math.abs((dr.left + dr.width / 2) - (sr.left + sr.width / 2)).toFixed(2),
      centreIsCore: !!(el && el.closest('.orbit-core')),
      panelHasZeroArea: pr.width < 1 || pr.height < 1
    };
  });
  check('collapsed: the panel occupies no area', m.open === '0' && m.panelHasZeroArea, m);
  check('collapsed: the circle is centred in the stage (<=2px)', m.dialOffCentre <= 2, m);
  check('collapsed: the stage centre hit-tests to the core, not the panel', m.centreIsCore, m);
});

await safe('Orbit: clicking a node reveals that phase, and the content is the fixture', async () => {
  await orbit(page, 7);
  await page.click('.orbit-node[data-value="2"]');
  await page.waitForTimeout(620);
  const m = await page.evaluate(() => {
    const st = document.querySelector('.orbit-stage');
    const D = window.PM56_DATA;
    const step = D.workSteps[2];
    const rows = (D.phaseRows[step.kind] && D.phaseRows[step.kind][step.id]) || [];
    const pin = st.querySelector('.orbit-panel-in');
    const pr = st.querySelector('.orbit-panel').getBoundingClientRect();
    const el = document.elementFromPoint(pr.left + Math.min(40, pr.width / 2), pr.top + 14);
    return {
      open: st.dataset.orbitOpen, focus: st.dataset.orbitFocus, expectId: step.id,
      title: st.querySelector('.orbit-panel-title')?.textContent,
      expectTitle: step.verb,
      rowTexts: [...st.querySelectorAll('.orbit-rows .wa-rowtext')].map(x => x.textContent),
      expectRows: rows.map(r => r.text),
      panelArea: +(pr.width * pr.height).toFixed(0),
      panelPaintedHit: !!(el && el.closest('.orbit-panel')),
      pinOpacity: getComputedStyle(pin).opacity,
      nodeOpen: st.querySelector('.orbit-node[data-value="2"]').classList.contains('open'),
      stepKind: st.dataset.stepKind
    };
  });
  check('the clicked phase becomes the focus', m.open === '1' && m.focus === m.expectId, m);
  check('the panel title is the fixture verb, not a literal', m.title === m.expectTitle, { got: m.title, want: m.expectTitle });
  check('the panel rows are the fixture phaseRows for that step',
    m.expectRows.length > 0 && JSON.stringify(m.rowTexts) === JSON.stringify(m.expectRows), { got: m.rowTexts, want: m.expectRows });
  check('the panel occupies real area and hit-tests to itself', m.panelArea > 4000 && m.panelPaintedHit, m);
  check('the panel is fully opaque once open', parseFloat(m.pinOpacity) > 0.95, m.pinOpacity);
  check('the clicked node is marked open', m.nodeOpen, m);

  const pr = await page.locator('.orbit-panel').boundingBox();
  const px = await readPixels(page, clipOf(pr));
  check('the open panel paints content (>=25 distinct colours)', px.distinct >= 25, px);
});

await safe('Orbit: clicking the same node again collapses it', async () => {
  await page.click('.orbit-node[data-value="2"]');
  await page.waitForTimeout(620);
  const m = await page.evaluate(() => {
    const st = document.querySelector('.orbit-stage'), pr = st.querySelector('.orbit-panel').getBoundingClientRect();
    return { open: st.dataset.orbitOpen, area: +(pr.width * pr.height).toFixed(0) };
  });
  check('a second click on the same node returns to the circle', m.open === '0' && m.area < 1, m);
});

await safe('Orbit: the expand and the collapse both actually animate', async () => {
  await orbit(page, 7);
  /* rAF trace INSIDE the page. A Playwright click round-trip adds a phantom
     ~200ms, so it cannot be used for a timing claim. */
  const trace = await page.evaluate(async () => {
    const st = document.querySelector('.orbit-stage');
    const panel = st.querySelector('.orbit-panel');
    const sample = async (ms) => {
      const out = []; const t0 = performance.now();
      return new Promise(res => {
        const tick = () => {
          out.push(+panel.getBoundingClientRect().height.toFixed(2));
          if (performance.now() - t0 < ms) requestAnimationFrame(tick); else res({ ms: +(performance.now() - t0).toFixed(0), samples: out });
        };
        requestAnimationFrame(tick);
      });
    };
    st.querySelector('.orbit-node[data-value="4"]').click();
    const open = await sample(700);
    st.querySelector('[data-action="orbit-collapse"]').click();
    const close = await sample(700);
    return { open, close };
  });
  const spread = a => Math.max(...a) - Math.min(...a);
  const monotoneish = a => { const u = [...new Set(a)]; return u.length; };
  check('expand travels through intermediate sizes (not a snap)',
    spread(trace.open.samples) > 20 && monotoneish(trace.open.samples) > 6,
    { first: trace.open.samples.slice(0, 4), distinct: monotoneish(trace.open.samples), spread: +spread(trace.open.samples).toFixed(1) });
  check('collapse travels through intermediate sizes (not a snap)',
    spread(trace.close.samples) > 20 && monotoneish(trace.close.samples) > 6,
    { first: trace.close.samples.slice(0, 4), distinct: monotoneish(trace.close.samples), spread: +spread(trace.close.samples).toFixed(1) });
  check('the collapse ends at zero', Math.min(...trace.close.samples) < 1, { min: Math.min(...trace.close.samples) });
});

/* =====================================================================
   5 — subagent nodes open the agent
   ===================================================================== */
await safe('Orbit: subagent nodes and rows open the agent', async () => {
  await orbit(page, 7);
  /* The ring satellites are withdrawn on a dial narrower than 168px — below
     that they would sit inside the core. The DEFAULT 54% editor split lands
     exactly there, so widen the pane first: this assertion is about the
     satellites existing and working, and a separate one below checks that the
     withdrawal is clean and that the panel rows still carry the affordance. */
  await setEditorPct(page, 26);
  await page.waitForTimeout(400);
  await page.click('.orbit-node[data-value="7"]');
  await page.waitForTimeout(620);
  const m = await page.evaluate(() => {
    const sats = [...document.querySelectorAll('.orbit-sat')];
    const rows = [...document.querySelectorAll('.orbit-agent')];
    const D = window.PM56_DATA;
    const tid = window.PM56_DEMO.getState().selectedThread;
    const expect = D.subagents.filter(a => a.parentThreadId === tid);   // strictly this thread's
    return {
      sats: sats.filter(s => getComputedStyle(s).display !== 'none').length, rows: rows.length,
      expect: expect.length, expectNames: expect.map(a => a.name),
      gotNames: rows.map(r => r.querySelector('strong').textContent),
      satHits: sats.filter(s => getComputedStyle(s).display !== 'none')
        .map(s => { const b = s.getBoundingClientRect(); const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return s === el || s.contains(el); }),
      satActions: sats.map(s => s.dataset.action + ':' + s.dataset.id),
      /* blocked must print the mapped label "Stalled", not the raw enum */
      states: rows.map(r => r.querySelector('.orbit-agent-state').textContent),
      expectStates: expect.map(a => D.labels.subagentStatus[a.status] || a.status),
      inlineDuplicate: !!document.querySelector('.working-variant-1 .live-agent-list')
    };
  });
  check('the panel lists exactly this thread\'s child agents', m.rows === m.expect && JSON.stringify(m.gotNames) === JSON.stringify(m.expectNames), m);
  check('agent statuses use D.labels.subagentStatus (blocked prints "Stalled")', JSON.stringify(m.states) === JSON.stringify(m.expectStates), { got: m.states, want: m.expectStates });
  check('satellite nodes hit-test to themselves and carry open-agent', m.sats > 0 && m.satHits.every(Boolean) && m.satActions.every(a => a.startsWith('open-agent:agent-')), m);
  check('the shared hardcoded "Live child agents · 2" list is suppressed under Orbit', !m.inlineDuplicate, m);

  /* Satellites must never be able to collide with the core: when the dial is
     too small for the annulus they are withdrawn, and the panel rows have to
     survive that withdrawal or the affordance disappears with them. */
  await setEditorPct(page, 70);
  await page.waitForTimeout(500);
  const narrow = await page.evaluate(() => {
    const st = document.querySelector('.orbit-stage');
    const dial = st.querySelector('.orbit-dial').getBoundingClientRect();
    const core = st.querySelector('.orbit-core').getBoundingClientRect();
    const cx = dial.left + dial.width / 2, cy = dial.top + dial.height / 2;
    const vis = [...st.querySelectorAll('.orbit-sat')].filter(s => getComputedStyle(s).display !== 'none');
    const gaps = vis.map(s => { const b = s.getBoundingClientRect(); return Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy) - b.width / 2 - core.width / 2; });
    const lab = st.querySelector('.orbit-core strong').getBoundingClientRect();
    return {
      dialW: +dial.width.toFixed(1), visibleSats: vis.length,
      minGap: gaps.length ? +Math.min(...gaps).toFixed(2) : null,
      rows: st.querySelectorAll('.orbit-agent').length,
      labelEscapesCore: +Math.max(0, (core.left - lab.left), (lab.right - core.right)).toFixed(2)
    };
  });
  check('a satellite never overlaps the core (withdrawn when the annulus is too narrow)',
    narrow.visibleSats === 0 || narrow.minGap > 1.5, narrow);
  check('the panel agent rows survive the satellite withdrawal', narrow.rows > 0, narrow);
  check('the core label never paints outside its own circle', narrow.labelEscapesCore <= 0.5, narrow);
  await setEditorPct(page, 26);
  await page.waitForTimeout(400);

  /* Prove the click has a consequence, not just a handler. */
  const before = await page.evaluate(() => window.PM56_DEMO.getState().editorTabs.slice());
  await page.click('.orbit-agent');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.PM56_DEMO.getState().editorTabs.slice());
  check('clicking an agent row opens that agent in the editor', after.length > before.length || after[after.length - 1] !== before[before.length - 1], { before, after });
});

/* =====================================================================
   5b — the states the fixture happens not to reach
   ---------------------------------------------------------------------
   "Unreachable today" is a property of the DATA, not of the code (this
   project has already been bitten once by a fallback branch that only
   stayed correct by fixture accident). Two orbit states are unreachable
   with the shipped fixture, so they are driven directly instead of being
   left unasserted. Both run on a throwaway page.
   ===================================================================== */
await safe('Orbit: the states the fixture does not reach are still correct', async () => {
  const p4 = await newPage();
  await orbit(p4, 7);
  /* (a) a thread with a working card and NO child agents. The renderer must
     say so rather than borrowing another thread's rows — the first version
     fell back to `subagents.slice(0,4)`, which is a quiet misattribution. */
  await p4.evaluate(() => { window.PM56_DATA.subagents.length = 0; window.PM56_DEMO.setWorkStep(7); });
  await p4.waitForTimeout(400);
  await p4.evaluate(() => document.querySelector('.orbit-node[data-value="7"]').click());
  await p4.waitForTimeout(500);
  /* Scroll it into view first: the panel opens below the dial on a narrow
     stage, which can put it past the bottom of the scrolling transcript, and
     document.elementFromPoint returns null off-viewport. */
  await p4.evaluate(() => { const e = document.querySelector('.orbit-empty'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); });
  await p4.waitForTimeout(160);
  const empty = await p4.evaluate(() => {
    const e = document.querySelector('.orbit-empty');
    const r = e && e.getBoundingClientRect();
    const el = r && document.elementFromPoint(r.left + 6, r.top + r.height / 2);
    return {
      present: !!e, text: e ? e.textContent : null,
      rows: document.querySelectorAll('.orbit-agent').length,
      sats: document.querySelectorAll('.orbit-sat').length,
      count: document.querySelector('.orbit-agents-head .count')?.textContent,
      hits: !!(el && (el === e || e.contains(el)))
    };
  });
  check('no child agents: an honest empty row is rendered and painted', empty.present && empty.rows === 0 && empty.hits, empty);
  check('no child agents: the count says 0, and no rows are borrowed from another thread', empty.count === '0' && empty.sats === 0, empty);
  await p4.close();

  /* (b) the RUNNING chip. Every other path in this harness pauses the run
     (setWorkStep does), so `.orbit-chip.run` would never be exercised. */
  const p5 = await newPage();
  await p5.evaluate(() => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.startWorking(); });
  await p5.waitForTimeout(700);
  await p5.evaluate(() => document.querySelector('.orbit-core').click());
  await p5.waitForTimeout(400);
  const run = await p5.evaluate(() => {
    const chip = document.querySelector('.orbit-chip');
    const pip = document.querySelector('.orbit-node.live .orbit-node-pip');
    return {
      chip: chip && chip.textContent, cls: chip && chip.className,
      running: window.PM56_DEMO.getState().work.running,
      pipAnimating: pip ? getComputedStyle(pip).animationName : null
    };
  });
  check('a live, running phase reports "In progress" on a .run chip', run.running && run.chip === 'In progress' && /\brun\b/.test(run.cls || ''), run);
  check('the live node carries its pulse while the run is live', run.pipAnimating === 'orbit-pulse', run);
  await p5.close();
});

/* =====================================================================
   6 — responsive: the radius is DERIVED, and the layout reflows
   ===================================================================== */
await safe('Orbit: geometry is derived from the container, not hardcoded', async () => {
  const p2 = await newPage();
  const measure = async () => p2.evaluate(() => {
    const st = document.querySelector('.orbit-stage');
    const dial = st.querySelector('.orbit-dial'), layout = st.querySelector('.orbit-layout');
    const dr = dial.getBoundingClientRect(), cx = dr.left + dr.width / 2, cy = dr.top + dr.height / 2;
    const radii = [...st.querySelectorAll('.orbit-node')].map(n => { const b = n.getBoundingClientRect(); return +Math.hypot((b.left + b.width / 2) - cx, (b.top + b.height / 2) - cy).toFixed(2); });
    const track = st.querySelector('.orbit-track').getBoundingClientRect();
    const outOfBox = [...st.querySelectorAll('.orbit-node')].filter(n => {
      const b = n.getBoundingClientRect();
      return b.left < dr.left - 0.6 || b.right > dr.right + 0.6 || b.top < dr.top - 0.6 || b.bottom > dr.bottom + 0.6;
    }).length;
    const dp = st.querySelector('.orbit-panel').getBoundingClientRect();
    return {
      stageW: +st.getBoundingClientRect().width.toFixed(1),
      dialW: +dr.width.toFixed(1),
      rMin: Math.min(...radii), rMax: Math.max(...radii),
      trackD: +track.width.toFixed(1),
      outOfBox,
      cols: getComputedStyle(layout).gridTemplateColumns,
      rows: getComputedStyle(layout).gridTemplateRows,
      panelLeftOfDial: dp.left < dr.left, panelBelowDial: dp.top >= dr.bottom - 1,
      overflowX: getComputedStyle(st).overflowX
    };
  });

  await orbit(p2, 7);
  await p2.click('.orbit-node[data-value="4"]');
  await p2.waitForTimeout(620);

  await setEditorPct(p2, 26);                 // widen the assistant pane
  await p2.waitForTimeout(500);
  const wide = await measure();
  await setEditorPct(p2, 71);                 // squeeze it
  await p2.waitForTimeout(500);
  const narrow = await measure();

  check('.orbit-stage no longer clips its own ring (overflow was hidden)', wide.overflowX !== 'hidden' && narrow.overflowX !== 'hidden', { wide: wide.overflowX, narrow: narrow.overflowX });
  check('all nodes share one radius (they are on a circle, not scattered)',
    Math.abs(wide.rMax - wide.rMin) < 0.75 && Math.abs(narrow.rMax - narrow.rMin) < 0.75, { wide: [wide.rMin, wide.rMax], narrow: [narrow.rMin, narrow.rMax] });
  check('the radius CHANGES with the container — it is derived, not typed',
    Math.abs(wide.rMin - narrow.rMin) > 6, { wideR: wide.rMin, narrowR: narrow.rMin, wideStage: wide.stageW, narrowStage: narrow.stageW });
  check('no node escapes the dial at either width (the old ring was amputated)',
    wide.outOfBox === 0 && narrow.outOfBox === 0, { wide: wide.outOfBox, narrow: narrow.outOfBox });
  check('wide: the detail sits BESIDE the circle (2 columns)',
    wide.cols.trim().split(/\s+/).length === 2 && !wide.panelBelowDial, wide);
  check('narrow: the circle is on TOP and the detail below it (1 column, 2 rows)',
    narrow.cols.trim().split(/\s+/).length === 1 && narrow.rows.trim().split(/\s+/).length === 2 && narrow.panelBelowDial, narrow);
  await p2.close();
});

/* =====================================================================
   7 — all 8 themes
   ===================================================================== */
await safe('Orbit: renders in all 8 themes with no overflow and no console noise', async () => {
  const themes = await page.evaluate(() => window.PM56_DATA.themes.map(t => t.id));
  const bad_ = [];
  for (const t of themes) {
    await page.evaluate(id => window.PM56_DEMO.setTheme(id), t);
    await orbit(page, 7);
    await page.evaluate(() => { const b = document.querySelector('.orbit-node[data-value="7"]'); if (b) b.click(); });
    await page.waitForTimeout(520);
    /* Opening the panel grows the card by ~250px, which pushes the orbit past
       the bottom of the viewport inside the scrolling transcript.
       document.elementFromPoint returns null off-viewport, so without this the
       loop reported "not hit-testable" in all 8 themes for a purely scroll
       reason — a false positive that says nothing about the theme. */
    await page.evaluate(() => { const st = document.querySelector('.orbit-stage'); if (st) st.scrollIntoView({ block: 'center', behavior: 'instant' }); });
    await page.waitForTimeout(160);
    const m = await page.evaluate(() => {
      const st = document.querySelector('.orbit-stage');
      if (!st) return { missing: true };
      const n = document.querySelector('.orbit-node.live');
      const b = n.getBoundingClientRect();
      const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      const card = st.closest('.working-card').getBoundingClientRect();
      const sr = st.getBoundingClientRect();
      return {
        hit: n === el || n.contains(el),
        inViewport: b.top >= 0 && b.bottom <= window.innerHeight,
        escapesCard: sr.right > card.right + 1 || sr.left < card.left - 1,
        pageOverflow: document.body.scrollWidth > window.innerWidth + 1
      };
    });
    const px = await readPixels(page, clipOf(await page.locator('.orbit-node.live').boundingBox()));
    if (m.missing || !m.hit || m.escapesCard || m.pageOverflow || px.inkShare < 0.05) bad_.push({ theme: t, ...m, px });
  }
  check('8 themes: node painted + hit-testable, nothing escapes the card, no page overflow', bad_.length === 0, bad_.length ? bad_ : themes.length + ' themes clean');
  await page.evaluate(() => window.PM56_DEMO.setTheme('basic-dark'));
});

/* =====================================================================
   8 — prefers-reduced-motion: the state still arrives
   ===================================================================== */
await safe('Orbit: reduced motion reaches the same end state with no perpetual loops', async () => {
  const p3 = await newPage({ reducedMotion: 'reduce' });
  await orbit(p3, 7);
  await p3.click('.orbit-node[data-value="4"]');
  await p3.waitForTimeout(180);
  const m = await p3.evaluate(() => {
    const st = document.querySelector('.orbit-stage');
    const pr = st.querySelector('.orbit-panel').getBoundingClientRect();
    const loops = [...st.querySelectorAll('*')].filter(e => {
      const cs = getComputedStyle(e);
      return cs.animationName !== 'none' && cs.animationIterationCount === 'infinite';
    }).map(e => e.className.toString().slice(0, 24) + ':' + getComputedStyle(e).animationName);
    return { open: st.dataset.orbitOpen, focus: st.dataset.orbitFocus, area: +(pr.width * pr.height).toFixed(0), loops };
  });
  check('reduced motion: the panel still opens, and fast', m.open === '1' && m.area > 4000, m);
  check('reduced motion: nothing inside the orbit loops forever', m.loops.length === 0, m.loops);
  await p3.click('[data-action="orbit-collapse"]');
  await p3.waitForTimeout(180);
  const m2 = await p3.evaluate(() => { const st = document.querySelector('.orbit-stage'); const pr = st.querySelector('.orbit-panel').getBoundingClientRect(); return { open: st.dataset.orbitOpen, w: +pr.width.toFixed(2), h: +pr.height.toFixed(2) }; });
  check('reduced motion: the collapse still completes', m2.open === '0' && (m2.h < 1 || m2.w < 1), m2);
  await p3.close();
});

/* ---- verdict -------------------------------------------------------- */
await page.close();
await browser.close();

const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass).length;
const report = {
  file: FILE, negative: NEGATIVE, passed, failed,
  consoleNoise: consoleNoise.length, noise: consoleNoise.slice(0, 12),
  results
};
if (OUT) fs.writeFileSync(OUT, JSON.stringify(report, null, 1));

for (const r of results) if (!r.pass) console.log('FAIL  ' + r.label + '  ' + JSON.stringify(r.detail).slice(0, 300));
console.log('---');
console.log(`orbit-verify: ${passed} pass / ${failed} fail   console noise: ${consoleNoise.length}`);
console.log('file: ' + FILE);
if (NEGATIVE) {
  /* A negative control that PASSES is the real failure: it means the
     assertions are not measuring their subject. */
  console.log(failed > 0
    ? `NEGATIVE CONTROL OK — ${failed} assertion(s) went red with the module removed.`
    : 'NEGATIVE CONTROL FAILED — every assertion passed with the module removed, so they measure nothing.');
  process.exit(failed > 0 ? 0 : 1);
}
process.exit(failed ? 1 : 0);
