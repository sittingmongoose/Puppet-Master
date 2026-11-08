// FO-76: the chat Activity strip's tier (labels / compact / icons) must follow its real fit: after Chat is revealed
// from hidden, after CSS-only sizing changes that leave every live box unchanged (F76-3), and across the label
// boundary during a real handle drag in every look, located in the sizing regime the strip actually has there (F76-5).
// The oracle never reads the product's numbers: it lays out a fresh clone of the wrap at the live content width.
import pod from './pod-clearance.check.mjs';
import { LOOKS } from '../browser-check.config.mjs';

export const frames = (f, n = 3) => f.evaluate(async n => { for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame); }, n);
const rerender = f => f.evaluate(() => { PM56_DEMO.setVariant(3, 1); PM56_DEMO.setVariant(3, 0); });

// Installed in the page once per load: the live strip's state and the clone oracle.
export function installOracle() {
  if (window.__fo76) return;
  const live = () => { const bar = document.querySelector('#pmRoot .activity-bar, #pmRoot .pm56-activity-bar'); return { bar, wrap: bar.parentElement }; };
  // The wrap's content box, unrounded (the product's sizer reads the same box through inherited padding).
  const content = w => { const cs = getComputedStyle(w); return w.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth); };
  // A clone of the wrap with content width X beside the live one: same cascade, same container regime at X.
  const needs = (wrap, X) => {
    const clone = wrap.cloneNode(true);
    clone.querySelector('.activity-sizer')?.remove();
    clone.classList.remove('is-ab-compact', 'is-ab-icon-only');
    Object.assign(clone.style, { position: 'absolute', visibility: 'hidden', left: '0', top: '0', boxSizing: 'content-box', width: X + 'px' });
    wrap.parentElement.append(clone);
    // The bar is a flex item of the wrap: without flex 0 0 auto it shrinks to X and the oracle would see a fit.
    const full = clone.querySelector('.activity-bar, .pm56-activity-bar');
    Object.assign(full.style, { maxWidth: 'none', width: 'max-content', flex: '0 0 auto' });
    const need = full.getBoundingClientRect().width;
    clone.classList.add('is-ab-compact');
    const compactNeed = full.getBoundingClientRect().width;
    clone.remove();
    return { need, compactNeed };
  };
  const tierOf = wrap => wrap.classList.contains('is-ab-icon-only') ? 2 : wrap.classList.contains('is-ab-compact') ? 1 : 0;
  const read = () => {
    const { bar, wrap } = live(), available = content(wrap);
    return { available, ...needs(wrap, available), tier: tierOf(wrap),
      labels: [...bar.querySelectorAll('.label')].every(e => getComputedStyle(e).display !== 'none'),
      width: bar.clientWidth, scroll: bar.scrollWidth, chat: document.querySelector('#chatPanel').getBoundingClientRect().width,
      pinned: document.body.dataset.phDrawer === 'pinned', history: document.querySelector('.history-flyout')?.getBoundingClientRect().width,
      selected: PM56_DEMO.getState().selectedThread, resizing: document.body.classList.contains('pm-resizing'),
      rect: (r => [r.left, r.top, r.width, r.height].map(Math.round))(wrap.getBoundingClientRect()) };
  };
  // Label boundary at the current look: the smallest content width at and above which the labelled row fits, each
  // width measured in its own regime (the 700/330/220 container rules move it). Scanned down from well above.
  const boundary = () => {
    const { wrap } = live(), here = content(wrap);
    for (let X = Math.ceil(here + 240); X >= Math.floor(here - 320); X--) {
      const { need } = needs(wrap, X);
      if (X + 0.5 < need) return { boundary: X + 1, needAtBoundary: needs(wrap, X + 1).need, here };
    }
    return { boundary: null, here };
  };
  const rect = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => Math.round(v * 100) / 100).join(','); };
  const boxes = () => { const { bar, wrap } = live(); return { bar: rect(bar), wrap: rect(wrap), tier: tierOf(wrap) }; };
  // Count every tier change, not only the sampled ones.
  let mo = null, changes = [];
  const watch = () => { const { wrap } = live(); let prev = tierOf(wrap); changes = []; mo?.disconnect();
    mo = new MutationObserver(() => { const next = tierOf(wrap); if (next !== prev) { changes.push({ from: prev, to: next, chat: document.querySelector('#chatPanel').getBoundingClientRect().width }); prev = next; } });
    mo.observe(wrap, { attributes: true, attributeFilter: ['class'] }); };
  const unwatch = () => { mo?.disconnect(); mo = null; return changes; };
  window.__fo76 = { read, boundary, boxes, watch, unwatch, needsAt: needs, host: () => window.PM56_HOST ? PM56_HOST.root() : document.body };
}
export const readFit = async f => { await f.evaluate(installOracle); return f.evaluate(() => __fo76.read()); };

// The product rule with its 8 px hysteresis, judged by the oracle: a decided width must have the decided tier; inside
// a hysteresis band either tier passes. No overflow anywhere.
export const valid = r => r.scroll <= r.width + 1 &&
  (r.available >= r.need + 8 ? r.tier === 0 && r.labels : r.available + 0.5 < r.need ? r.tier >= 1 && !r.labels : true) &&
  (r.tier === 0 || (r.available + 0.5 < r.compactNeed ? r.tier === 2 : r.available >= r.compactNeed + 8 && r.available + 0.5 < r.need ? r.tier === 1 : true));
export const strip = r => JSON.stringify({ ...r, available: +r.available.toFixed(2), need: +r.need.toFixed(2), compactNeed: +r.compactNeed.toFixed(2) });

// A real drag of the column handle across the label boundary, 1 px per two frames, down 32 px and back; returns its
// summary after the check. `onStep(step, previous)` runs after each sampled step (the film companion marks there).
export async function boundaryDrag(t, f, label, onStep) {
  const setWidth = async w => { await f.evaluate(w => PMW.chatCol.setWidth(w), w); await t.settle(); };
  const b = await f.evaluate(() => __fo76.boundary());
  if (b.boundary == null) { await t.check(`label boundary found ${label}`, false, JSON.stringify(b)); return null; }
  // Map content width to column width at the current history width, then start 20 px above the boundary.
  const fit0 = await readFit(f), w0 = await f.evaluate(() => PMW.chatCol.widthPx());
  const offset = w0 - fit0.available, top = Math.round(b.boundary + 20 + offset), bottom = Math.round(b.boundary - 12 + offset);
  await setWidth(top); await f.waitForTimeout(400);
  const start = await readFit(f);
  const p = await f.locator('#chatResizer').boundingBox();
  if (!p) throw Error('Chat resizer absent');
  const x0 = p.x + p.width / 2, y0 = p.y + p.height / 2;
  const input = await t.page.context().newCDPSession(t.page);
  await input.send('Input.setInterceptDrags', { enabled: true });
  const steps = [];
  let dir = 0;
  await f.evaluate(() => __fo76.watch());
  await t.page.mouse.move(x0, y0); await t.page.mouse.down();
  try {
    // Learn which way the handle widens the column (dir 1: moving left widens it), then walk 1 px per frame down
    // to `bottom` and back to `top`.
    await t.page.mouse.move(x0 - 4, y0); await frames(f, 2);
    dir = Math.sign((await f.evaluate(() => document.querySelector('#chatPanel').getBoundingClientRect().width)) - start.chat);
    if (!dir) throw Error('Chat handle did not move the column: ' + JSON.stringify(start));
    const targets = [];
    for (let w = top; w >= bottom; w--) targets.push(w);
    for (let w = bottom + 1; w <= top; w++) targets.push(w);
    for (const w of targets) {
      await t.page.mouse.move(x0 - (w - top) * dir, y0);
      await frames(f, 2);
      steps.push({ target: w, ...await readFit(f) });
      if (onStep) await onStep(steps[steps.length - 1], steps[steps.length - 2]);
    }
  } finally { await t.page.mouse.up(); await input.send('Input.setInterceptDrags', { enabled: false }); await input.detach(); }
  const changes = await f.evaluate(() => __fo76.unwatch());
  // Hold 60 frames after release: no self-induced change.
  await f.evaluate(() => __fo76.watch()); await frames(f, 60);
  const held = await f.evaluate(() => __fo76.unwatch());
  const end = await readFit(f);
  const half = steps.findIndex(s => s.target === bottom) + 1, down = steps.slice(0, half), up = steps.slice(half);
  const flips = list => list.reduce((n, s, i) => n + (i && s.tier !== list[i - 1].tier ? 1 : 0), 0);
  const where = (list, from, to) => list.findIndex((s, i) => i && list[i - 1].tier === from && s.tier === to);
  const dn = where(down, 0, 1), upAt = where(up, 1, 0);
  const near = (s, edge) => Math.abs(s.available - edge) <= 1.5;
  const summary = { label, boundary: b.boundary, top, bottom, dir, start: start.tier, end: end.tier, changes, held,
    held_all: steps.every(s => s.resizing), range: Math.max(...steps.map(s => s.chat)) - Math.min(...steps.map(s => s.chat)),
    downAt: dn >= 0 ? { available: down[dn].available, need: down[dn].need } : null, upAt: upAt >= 0 ? { available: up[upAt].available, need: up[upAt].need } : null,
    invalid: steps.filter(s => !valid(s)).map(s => JSON.parse(strip(s))).slice(0, 4) };
  t.log(JSON.stringify(summary));
  await t.check(`label boundary drag ${label}`,
    start.tier === 0 && summary.held_all && summary.range >= 25 && summary.invalid.length === 0 &&
    flips(down) === 1 && flips(up) === 1 && changes.length === 2 && held.length === 0 && end.tier === 0 && end.labels &&
    dn >= 0 && near(down[dn], down[dn].need - 0.5) && upAt >= 0 && near(up[upAt], up[upAt].need + 8),
    JSON.stringify(summary));
  return summary;
}

export default async function(t) {
  const previous = { width: t.args.width, only: t.args.only };
  t.args.width = 1512; t.args.only = 'query';
  try { await pod(t); } finally {
    for (const key of ['width', 'only']) {
      if (previous[key] === undefined) delete t.args[key];
      else t.args[key] = previous[key];
    }
  }
  const f = t.root;
  await t.viewport(1920, 1100);
  const setWidth = async w => { await f.evaluate(w => PMW.chatCol.setWidth(w), w); await t.settle(); };

  // A. No intervening render/reveal: the exact narrow-return history that made kit2f's sizing signature reuse the
  // smaller generated text.
  for (const width of [720, 560, 400, 560, 660, 665, 680, 720]) {
    await setWidth(width); await f.waitForTimeout(500);
    const fit = await readFit(f);
    await t.check(`activity narrow return ${width}`, fit.selected === 'query' && fit.pinned && Math.abs(fit.chat - width - fit.history) <= 1 && valid(fit), strip(fit));
  }

  // B. Every width before and after a hidden render and reveal.
  for (const width of [720, 560, 400, 560, 660, 665, 680, 800, 600, 720]) {
    await setWidth(width); await f.waitForTimeout(500);
    for (const phase of ['before', 'after']) {
      if (phase === 'after') {
        await f.evaluate(() => PMW.chatCol.setVisible(false));
        await f.waitForFunction(() => document.querySelector('#chatPanel').getBoundingClientRect().width === 0);
        await f.evaluate(() => { PM56_DEMO.setVariant(3, 1); PM56_DEMO.setVariant(3, 0); PMW.chatCol.setVisible(true); });
        await t.settle(); await f.waitForTimeout(1500);
      }
      const fit = await readFit(f);
      t.log(JSON.stringify({ columnWidth: width, phase, ...fit }));
      await t.check(`activity labels follow fit ${width} ${phase}`, fit.selected === 'query' && fit.pinned &&
        (width === 400 ? fit.history > 0 && fit.history <= 320 : Math.abs(fit.history - 320) <= 1) && Math.abs(fit.chat - width - fit.history) <= 1 && valid(fit), strip(fit));
    }
  }

  // C. F76-3: sizing inputs that change no live box (they act on hidden labels or counts, or come from a stylesheet,
  // the host or the CSSOM). Each change is made and the live boxes are read again in the same task, before any
  // observer can run, to show the box did not move; the strip must take the fitting tier within three frames and
  // keep it through a 500 ms hold.
  const cssCase = async (name, width, setup, change, expectBefore, expectAfter, cleanup) => {
    await setWidth(width); await f.waitForTimeout(300);
    await f.evaluate(setup); await frames(f);
    const before = await readFit(f);
    // The page's CSP has no unsafe-eval: install the change as a function through the harness, then run it between
    // two box reads in one task.
    await f.evaluate(`window.__fo76Change = ${change.toString()}`);
    const moved = await f.evaluate(() => { const a = __fo76.boxes(); window.__fo76Change(); const b = __fo76.boxes(); return { a, b }; });
    await frames(f);
    const after = await readFit(f);
    await f.waitForTimeout(500);
    const held = await readFit(f);
    await f.evaluate(cleanup); await rerender(f); await t.settle();
    await t.check(`css-only ${name}: live boxes unchanged by the change`, moved.a.bar === moved.b.bar && moved.a.wrap === moved.b.wrap && moved.a.tier === moved.b.tier, JSON.stringify(moved));
    await t.check(`css-only ${name}: tier ${expectBefore} before, ${expectAfter} within 3 frames and after 500 ms`,
      before.tier === expectBefore && valid(before) && after.tier === expectAfter && valid(after) && held.tier === expectAfter && valid(held),
      JSON.stringify({ before: JSON.parse(strip(before)), after: JSON.parse(strip(after)), held: JSON.parse(strip(held)) }));
  };
  await f.evaluate(installOracle);
  // The oracle itself: inside one regime the labelled row's width must not follow the clone's width.
  const selfTest = await f.evaluate(() => { const bar = document.querySelector('#pmRoot .activity-bar, #pmRoot .pm56-activity-bar');
    return [460, 520, 580, 640].map(X => ({ X, ...__fo76.needsAt(bar.parentElement, X) })); });
  await t.check('oracle measures the intrinsic row, not the clone width', selfTest.every(r => Math.abs(r.need - selfTest[0].need) < 0.01 && r.need > 460), JSON.stringify(selfTest));
  for (let rep = 0; rep < 2; rep++) {
    await cssCase(`hidden-label suffix removed ${rep}`, 800,
      () => { let s = document.getElementById('fo76-pseudo'); if (!s) { s = document.createElement('style'); s.id = 'fo76-pseudo'; document.head.append(s); } s.textContent = '#pmRoot .activity-item .label::after{content:" additional actions"}'; },
      () => { document.getElementById('fo76-pseudo').textContent = '#pmRoot .activity-item .label::after{content:""}'; },
      1, 0, () => document.getElementById('fo76-pseudo')?.remove());
    await cssCase(`host count restored ${rep}`, 560,
      () => { const h = __fo76.host(); window.__fo76Add = h.style.getPropertyValue('--ab-add'); h.style.setProperty('--ab-add', '"+123456789123456789123456789"'); },
      () => { __fo76.host().style.setProperty('--ab-add', window.__fo76Add); },
      2, 1, () => {});
    await cssCase(`hidden-label font stack ${rep}`, 660, () => {},
      () => { const s = document.createElement('style'); s.id = 'fo76-font'; s.textContent = '#pmRoot .activity-item .label{font-family:Arial,sans-serif!important;letter-spacing:-1px!important;font-size:8px!important}'; document.head.append(s); },
      1, 0, () => document.getElementById('fo76-font')?.remove());
    // No DOM mutation at all: a rule inserted and deleted through the CSSOM.
    await cssCase(`cssom rule deleted ${rep}`, 800,
      () => { let s = document.getElementById('fo76-cssom'); if (!s) { s = document.createElement('style'); s.id = 'fo76-cssom'; document.head.append(s); } s.sheet.insertRule('#pmRoot .activity-item .label::after{content:" additional actions"}', 0); },
      () => { document.getElementById('fo76-cssom').sheet.deleteRule(0); },
      1, 0, () => document.getElementById('fo76-cssom')?.remove());
  }

  // G. FO-76 follow-up: an item another layer injects into the live strip (the background-activity concept's
  // Processes button, the way its rw-thread.js does it: a keyed button after Subagents that the chat's reconcile
  // removes and a root MutationObserver puts back, its attributes rewritten with the same values on a timer). The fit
  // must measure it too: the 36 widths of the review's sweep, a content change, its removal and the reported reveals,
  // and the two observers must not answer each other forever.
  await setWidth(800);
  await f.evaluate(() => {
    const root = document.getElementById('pmRoot');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'activity-item fo76-foreign'; btn.setAttribute('data-k', 'fo76-foreign');
    btn.setAttribute('aria-label', 'Injected activity, 3 running'); btn.setAttribute('data-tone', 'working');
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg><span class="label">Processes</span><span class="count">3</span>';
    const place = () => {
      const bar = document.querySelector('#pmRoot .activity-wrap > :is(.activity-bar, .pm56-activity-bar)');
      if (!bar || !window.__fo76Foreign) return;
      const after = bar.querySelector(':scope > .activity-item[data-domain="subagents"]') || bar.querySelector(':scope > .activity-item[data-domain="todo"]');
      const ref = after ? after.nextSibling : bar.firstChild;
      if (btn.parentNode !== bar || (after && btn.previousSibling !== after)) bar.insertBefore(btn, ref);
    };
    // As rw-thread.js's sync(): every root change repaints the item (same values) and re-places it.
    const paint = () => { btn.setAttribute('data-tone', 'working'); btn.setAttribute('aria-label', btn.getAttribute('aria-label')); };
    let sched = false;
    const mo = new MutationObserver(() => { if (!sched) { sched = true; Promise.resolve().then(() => { sched = false; paint(); place(); }); } });
    mo.observe(root, { childList: true, subtree: true });
    const timer = setInterval(() => { paint(); place(); }, 700);
    window.__fo76Foreign = { btn, mo, timer, place };
    place();
  });
  await frames(f);
  const sweep = [], badSweep = [];
  for (const w of [900, 860, 820, 800, 780, 760, 740, 720, 700, 680, 660, 640, 620, 600, 580, 560, 540, 520, 500, 480, 460, 440, 420, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 860, 900]) {
    await setWidth(w); await f.waitForTimeout(300);
    const r = await readFit(f);
    const injected = await f.evaluate(() => !!document.querySelector('#pmRoot .activity-wrap > :is(.activity-bar, .pm56-activity-bar) > .fo76-foreign'));
    sweep.push({ w, injected, tier: r.tier, available: +r.available.toFixed(1), need: +r.need.toFixed(1), client: r.width, scroll: r.scroll });
    if (!injected || !valid(r)) badSweep.push({ w, injected, ...JSON.parse(strip(r)) });
  }
  t.log(JSON.stringify({ foreignSweep: sweep }));
  await t.check('injected strip item: 36 widths valid and unclipped', badSweep.length === 0, JSON.stringify({ n: badSweep.length, first: badSweep.slice(0, 3) }));
  // Its label grows past the fit, then shrinks back: the fit follows within 3 frames.
  await setWidth(1000); await f.waitForTimeout(300);
  const grow0 = await readFit(f);
  await f.evaluate(() => { __fo76Foreign.btn.querySelector('.label').textContent = 'Processes, scripts, watchers, builds and browser sessions'; });
  await frames(f);
  const grow1 = await readFit(f);
  await f.evaluate(() => { __fo76Foreign.btn.querySelector('.label').textContent = 'Processes'; });
  await frames(f);
  const grow2 = await readFit(f);
  await t.check('injected strip item: its own content change reaches the fit within 3 frames',
    grow0.tier === 0 && valid(grow0) && grow1.tier >= 1 && valid(grow1) && grow2.tier === 0 && valid(grow2),
    JSON.stringify([grow0, grow1, grow2].map(r => JSON.parse(strip(r)))));
  // No observer ping-pong. Inside one task (microtasks only, so no chat render can interleave): one real change to
  // the injected item must give exactly one new copy per fit row, even though the injector answers that write from
  // its own root observer; then fifty same-value rewrites, as its timer does, must give none.
  const pingpong = await f.evaluate(async () => {
    const sizer = document.querySelector('#pmRoot .activity-wrap > .activity-sizer');
    const { btn } = __fo76Foreign;
    let inserted = 0;
    const mo = new MutationObserver(rs => { for (const r of rs) for (const n of r.addedNodes) if (n.nodeType === 1 && n.hasAttribute('data-ab-foreign')) inserted++; });
    mo.observe(sizer, { childList: true, subtree: true });
    const drain = async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); };
    btn.querySelector('.count').textContent = '4';
    await drain(); mo.takeRecords().forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1 && n.hasAttribute('data-ab-foreign')) inserted++; }));
    const afterChange = inserted;
    for (let i = 0; i < 50; i++) { btn.setAttribute('data-tone', 'working'); btn.setAttribute('aria-label', btn.getAttribute('aria-label')); await drain(); }
    mo.takeRecords().forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1 && n.hasAttribute('data-ab-foreign')) inserted++; }));
    mo.disconnect();
    const copies = [...sizer.querySelectorAll(':scope > .activity-fit > *')].map(row => [...row.querySelectorAll(':scope > .fo76-foreign .count')].map(c => c.textContent).join(','));
    btn.querySelector('.count').textContent = '3';
    return { afterChange, afterRewrites: inserted - afterChange, copies };
  });
  t.log(JSON.stringify({ foreignPingPong: pingpong }));
  await t.check('injected strip item: one copy per fit row per real change, none for same-value rewrites (no observer ping-pong)',
    pingpong.afterChange === 2 && pingpong.afterRewrites === 0 && pingpong.copies.length === 2 && pingpong.copies.every(c => c === '4'), JSON.stringify(pingpong));
  // The reported route with the item in the strip.
  await t.viewport(1512, 982); await setWidth(560);
  const foreignReveals = [];
  for (let i = 0; i < 3; i++) {
    await f.evaluate(() => PMW.chatCol.setVisible(false));
    await f.waitForFunction(() => document.querySelector('#chatPanel').getBoundingClientRect().width === 0);
    await f.evaluate(() => { PM56_DEMO.setVariant(3, 1); PM56_DEMO.setVariant(3, 0); PMW.chatCol.setVisible(true); });
    await t.settle(); await f.waitForTimeout(1000);
    foreignReveals.push(await readFit(f));
  }
  await t.check('injected strip item: reveals at 1512×982 column 560 fit', foreignReveals.every(r => r.scroll - r.width <= 1 && valid(r)), JSON.stringify(foreignReveals.map(r => JSON.parse(strip(r)))));
  // Removed: the copies follow.
  await t.viewport(1920, 1100); await setWidth(700); await f.waitForTimeout(300);
  await f.evaluate(() => { const x = __fo76Foreign; delete window.__fo76Foreign; x.mo.disconnect(); clearInterval(x.timer); x.btn.remove(); });
  await frames(f);
  const gone = await readFit(f), left = await f.evaluate(() => document.querySelectorAll('#pmRoot .activity-sizer .fo76-foreign').length);
  await t.check('injected strip item removed: copies gone and the fit follows within 3 frames', left === 0 && valid(gone), JSON.stringify({ left, ...JSON.parse(strip(gone)) }));
  await rerender(f); await t.settle();

  // D. Every look, both motion settings: widths across the pseudo-content and container boundaries, a look switch
  // while Chat is hidden, and a real drag of the column handle across the label boundary in both directions.
  const motions = t.args.targeted ? [] : ['no-preference', 'reduce'];
  for (const motion of motions) {
    await t.emulate({ reducedMotion: motion });
    for (const [i, look] of LOOKS.entries()) {
      await t.app.look(look);
      await f.evaluate(installOracle);
      for (const width of [800, 400, 560, 660, 720, 800]) {
        await setWidth(width);
        const fit = await readFit(f);
        await t.check(`live activity fit ${look} ${motion} ${width}`, valid(fit), strip(fit));
      }
      await boundaryDrag(t, f, `${look} ${motion}`);
      // Look switch while Chat is hidden, then reveal at a width near the next look's boundary region.
      const next = LOOKS[(i + 1) % LOOKS.length];
      await setWidth(660);
      await f.evaluate(() => PMW.chatCol.setVisible(false));
      await f.waitForFunction(() => document.querySelector('#chatPanel').getBoundingClientRect().width === 0);
      await t.app.look(next);
      await f.evaluate(() => { PM56_DEMO.setVariant(3, 1); PM56_DEMO.setVariant(3, 0); PMW.chatCol.setVisible(true); });
      await t.settle(); await frames(f);
      const fit = await readFit(f);
      await t.check(`hidden look switch ${look}->${next} ${motion}`, fit.chat > 0 && valid(fit), strip(fit));
    }
  }
  if (motions.length) await t.emulate({ reducedMotion: 'no-preference' });
  await t.app.look('nier-dark');

  // E. The reported route: 1512×982, six hidden-render/reveal cycles at 560.
  await t.viewport(1512, 982);
  await f.evaluate(() => PMW.chatCol.setWidth(560));
  await t.settle();
  const results = [];
  for (let i = 0; i < 6; i++) {
    await f.evaluate(() => PMW.chatCol.setVisible(false));
    await f.waitForFunction(() => document.querySelector('#chatPanel').getBoundingClientRect().width === 0);
    await f.evaluate(() => { PM56_DEMO.setVariant(3, 1); PM56_DEMO.setVariant(3, 0); });
    await f.evaluate(() => PMW.chatCol.setVisible(true));
    await f.waitForTimeout(1500);
    const r = await readFit(f);
    results.push(r); t.log(JSON.stringify(r));
    if (r.scroll - r.width > 1) await t.shot('hidden-fit-' + i, 'Activity overflow after Chat is revealed, native window');
  }
  await t.shot('activity-visible-final', 'Activity strip after six hidden-render/reveal cycles');
  await t.check('activity fit survives hidden rendering', results.length === 6 && results.every(r => r.selected === 'query' && r.pinned &&
    Math.abs(r.history - 320) <= 1 && Math.abs(r.chat - 880) <= 1 && r.scroll - r.width <= 1 && valid(r)), JSON.stringify(results.map(r => JSON.parse(strip(r)))));

  // F. The kit's outer window sizes, NieR Dark and Friendly Dark, at whatever column each layout gives the chat.
  for (const look of ['nier-dark', 'friendly-dark']) {
    await t.app.look(look);
    for (const [w, h] of [[860, 1080], [1024, 1080], [1280, 1080], [1390, 1080], [1920, 1100], [740, 1000], [1280, 500]]) {
      await t.viewport(w, h); await t.settle(); await frames(f);
      const fit = await readFit(f);
      await t.check(`window ${w}x${h} ${look}`, fit.chat > 0 && valid(fit), strip(fit));
    }
  }
  await t.app.look('nier-dark');
}
