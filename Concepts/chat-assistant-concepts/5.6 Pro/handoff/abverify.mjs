/* Wave 2 — Activity Bar (item 7) pixel verification.
 * Usage: node abverify.mjs <path-to-standalone.html> [outdir]
 * Every assertion that claims something is VISIBLE goes through
 * document.elementFromPoint() plus a painted-pixel read of a screenshot crop —
 * never getBoundingClientRect() alone.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');

const target = process.argv[2];
const outdir = process.argv[3] || path.join(path.dirname(target), 'abshots');
fs.mkdirSync(outdir, { recursive: true });
const url = pathToFileURL(path.resolve(target)).href;

const results = [];
const R = (ok, label, detail) => { results.push({ ok: !!ok, label, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + label + (detail ? ' :: ' + JSON.stringify(detail) : '')); };

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const consoleErrors = [], consoleWarnings = [], pageErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); if (m.type() === 'warning') consoleWarnings.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true, { timeout: 15000 });

/* ---- painted-pixel sampler: screenshot the crop, hand the PNG back to the
   page as a data URL, draw it to a canvas, read getImageData. ------------- */
async function sample(clip, name) {
  const buf = await page.screenshot({ clip });
  if (name) fs.writeFileSync(path.join(outdir, name), buf);
  const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async (u) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = u; });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const seen = new Set(); let r = 0, gg = 0, b = 0, n = 0;
    let best = null, bestScore = -1;
    const hist = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const key = (d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3);
      seen.add(key); r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++;
      /* track the most saturated pixel — that is the lit ink of an icon */
      const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
      const score = mx - mn;
      if (score > bestScore) { bestScore = score; best = [d[i], d[i + 1], d[i + 2]]; }
      hist.set(key, (hist.get(key) || 0) + 1);
    }
    return { w: c.width, h: c.height, distinct: seen.size, mean: [Math.round(r / n), Math.round(gg / n), Math.round(b / n)], mostSaturated: best, saturation: bestScore };
  }, dataUrl);
}
/* Mean RGB is a useless discriminator here: the card background is --glass,
   rgba(18,22,34,.92), which is within a few units of the surface underneath.
   Count pixels that actually CHANGED instead. */
async function diffPct(bufA, bufB) {
  return page.evaluate(async (u) => {
    const load = async src => { const i = new Image(); await new Promise((r, j) => { i.onload = r; i.onerror = j; i.src = src; }); return i; };
    const a = await load(u.a), b = await load(u.b);
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const g = c.getContext('2d');
    g.drawImage(a, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
    g.clearRect(0, 0, c.width, c.height); g.drawImage(b, 0, 0);
    const db = g.getImageData(0, 0, c.width, c.height).data;
    let diff = 0, n = 0;
    for (let i = 0; i < da.length; i += 4) {
      n++;
      if (Math.abs(da[i] - db[i]) > 10 || Math.abs(da[i + 1] - db[i + 1]) > 10 || Math.abs(da[i + 2] - db[i + 2]) > 10) diff++;
    }
    return Math.round(diff / n * 1000) / 10;
  }, { a: 'data:image/png;base64,' + bufA.toString('base64'), b: 'data:image/png;base64,' + bufB.toString('base64') });
}
async function shot(clip, name) {
  const buf = await page.screenshot({ clip });
  if (name) fs.writeFileSync(path.join(outdir, name), buf);
  return buf;
}

async function box(sel) {
  return page.evaluate(s => {
    const el = document.querySelector(s); if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }, sel);
}
async function hitTest(sel) {
  return page.evaluate(s => {
    const el = document.querySelector(s); if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { found: true, self: at === el, inside: !!(at && el.contains(at)), tag: at && at.className, w: r.width, h: r.height };
  }, sel);
}

/* ===================================================================== 0
   Every rule this module ships actually PARSED. A stray comment terminator
   inside a CSS comment closes it early and the parser swallows the next rule with no
   console error and no build failure — which is exactly what happened to the
   `display:none` on `.state-mark` the first time round. */
const rulesPresent = await page.evaluate(() => {
  const want = [
    'html[data-ab-ready] .activity-item .state-mark',
    'html[data-ab-ready] .activity-item > svg',
    'html[data-ab-ready] .activity-item[data-hover-domain="changes"] .count',
    '.hover-card.ab-card', '.ab-card .ab-head', '.ab-card .ab-row',
    '.ab-card .ab-glyph', '.ab-card .ab-avatar', '.ab-card .ab-foot', '.activity-wrap'
  ];
  const seen = new Set();
  const walk = rules => { for (const r of rules) { if (r.selectorText) seen.add(r.selectorText); if (r.cssRules) walk(r.cssRules); } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch (e) { } }
  return { missing: want.filter(w => ![...seen].some(s => s.split(',').map(x => x.trim()).includes(w))) };
});
R(rulesPresent.missing.length === 0, 'every activity-bar.css rule reached the CSSOM (no comment-eaten rules)', rulesPresent);

/* ===================================================================== 1
   The dots are gone and the icons are lit from derived state. */
const dots = await page.evaluate(() => [...document.querySelectorAll('.activity-item .state-mark')]
  .map(el => ({ cls: el.className, display: getComputedStyle(el).display, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height })));
R(dots.length === 5 && dots.every(d => d.display === 'none' && d.w === 0 && d.h === 0),
  'state-mark dots present in markup but paint nothing (0x0, display:none)', dots);

const iconState = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('.activity-item[data-hover-domain]').forEach(b => {
    const svg = b.querySelector('svg'); const cs = getComputedStyle(svg);
    const r = svg.getBoundingClientRect();
    out[b.dataset.hoverDomain] = {
      tone: document.documentElement.getAttribute('data-ab-' + b.dataset.hoverDomain),
      color: cs.color, filter: cs.filter, animation: cs.animationName + ' ' + cs.animationDuration,
      w: Math.round(r.width), h: Math.round(r.height), x: r.left, y: r.top
    };
  });
  return out;
});
R(Object.keys(iconState).length === 5 && Object.values(iconState).every(v => v.w === 14),
  'every domain icon is 14px and carries a derived tone', iconState);
const tones = Object.values(iconState).map(v => v.tone);
R(new Set(tones).size >= 2, 'the five icons do NOT all share one tone', tones);

/* painted colour of each icon */
const iconPix = {};
for (const [id, v] of Object.entries(iconState)) {
  iconPix[id] = await sample({ x: Math.round(v.x) - 2, y: Math.round(v.y) - 2, width: 18, height: 18 }, `icon-${id}.png`);
}
R(Object.values(iconPix).every(p => p.saturation > 20),
  'each icon paints a saturated (lit) colour, not grey chrome',
  Object.fromEntries(Object.entries(iconPix).map(([k, v]) => [k, { sat: v.saturation, rgb: v.mostSaturated }])));

/* ===================================================================== 2
   Changes button shows the running diff total, derived from the fixture. */
const diff = await page.evaluate(() => {
  const el = document.querySelector('.activity-item[data-hover-domain="changes"] .count');
  const before = getComputedStyle(el, '::before').content;
  const after = getComputedStyle(el, '::after').content;
  const ch = (window.PM56_DATA.changes || []);
  const add = ch.reduce((s, c) => s + (Number(c.add) || 0), 0);
  const del = ch.reduce((s, c) => s + (Number(c.del) || 0), 0);
  return { before, after, expectAdd: '"+' + add + '"', expectDel: '"−' + del + '"', files: ch.length, text: el.textContent, rect: el.getBoundingClientRect().toJSON() };
});
R(diff.before === diff.expectAdd && diff.after === diff.expectDel,
  'Changes button prints the summed diff total (+ΣADD −ΣDEL)', diff);
const diffPix = await sample({ x: Math.round(diff.rect.x) - 1, y: Math.round(diff.rect.y) - 3, width: Math.ceil(diff.rect.width) + 2, height: Math.ceil(diff.rect.height) + 6 }, 'changes-count.png');
R(diffPix.distinct > 8, 'the diff total actually paints (crop is not blank)', diffPix);

/* ===================================================================== 3
   Five different hover cards, each with real content. */
const cards = {};
for (const id of ['goal', 'todo', 'subagents', 'changes', 'artifacts']) {
  /* Baseline the crop region with NO card, so "the card paints" can be proved
     against what was underneath instead of against "the crop is not blank" —
     a nearly-transparent card lets the transcript show through and passes a
     naive distinct-colour test. This is how the 440ms animation-delay bug got
     past the first harness. */
  await page.hover(`[data-hover-domain="${id}"]`);
  await page.waitForSelector(`.hover-card.ab-card[data-domain="${id}"]`, { timeout: 4000 });
  await page.waitForFunction(() => {
    const c = document.querySelector('.hover-card.ab-card');
    return c && getComputedStyle(c).opacity === '1';
  }, { timeout: 3000 });
  const info = await page.evaluate(() => {
    const c = document.querySelector('.hover-card.ab-card');
    const r = c.getBoundingClientRect();
    const anchor = document.querySelector(`[data-hover-domain="${c.dataset.domain}"]`).getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + 12);
    return {
      domain: c.dataset.domain, tone: c.dataset.tone,
      text: c.innerText.replace(/\s+/g, ' ').trim(),
      rows: c.querySelectorAll('.ab-row').length,
      buttons: c.querySelectorAll('button.ab-row').length,
      more: (c.querySelector('.ab-more') || {}).textContent || '',
      head: (c.querySelector('.ab-head-meta') || {}).textContent || '',
      foot: (c.querySelector('.ab-foot') || {}).textContent || '',
      rect: { x: r.left, y: r.top, w: r.width, h: r.height },
      opacity: getComputedStyle(c).opacity,
      anim: getComputedStyle(c).animationName + ' ' + getComputedStyle(c).animationDuration + ' delay ' + getComputedStyle(c).animationDelay,
      above: r.bottom <= anchor.top + 1,
      insideViewport: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
      hitSelf: !!(at && c.contains(at)),
      ids: [...c.querySelectorAll('.ab-row')].map(e => e.dataset.k)
    };
  });
  cards[id] = info;
  const clip = { x: Math.round(info.rect.x), y: Math.round(info.rect.y), width: Math.round(info.rect.w), height: Math.round(info.rect.h) };
  info.pix = await sample(clip, `card-${id}.png`);
  const openBuf = await shot(clip);
  /* close it and re-shoot the SAME rectangle */
  await page.mouse.move(700, 200);
  await page.waitForFunction(() => !document.querySelector('.hover-card'), { timeout: 3000 });
  await page.waitForTimeout(120);
  const bareBuf = await shot(clip, `under-${id}.png`);
  const changed = await diffPct(openBuf, bareBuf);
  info.changedPct = changed;
  R(info.insideViewport && info.hitSelf && info.opacity === '1' && info.pix.distinct > 60 && changed > 12,
    `hover card ${id}: opaque, inside viewport, hit-tests to itself, and repaints its own area (>12% of pixels change vs the same crop with the card closed; a transparent card changes ~0%)`,
    { rows: info.rows, distinct: info.pix.distinct, opacity: info.opacity, anim: info.anim, changedPct: changed, head: info.head, above: info.above });
}
const texts = Object.values(cards).map(c => c.text);
R(new Set(texts).size === 5, 'all five hover cards render DIFFERENT content', texts.map(t => t.slice(0, 70)));
fs.writeFileSync(path.join(outdir, 'cards.json'), JSON.stringify(cards, null, 2));

/* ===================================================================== 4
   Every list is capped at 5 with an honest overflow, and counts are derived. */
const derived = await page.evaluate(() => {
  const D = window.PM56_DATA;
  return {
    todos: (D.todos || []).length, agents: (D.subagents || []).length,
    changes: (D.changes || []).length, artifacts: (D.artifacts || []).length,
    todoDone: (D.todos || []).filter(t => ['done', 'completed'].includes(t.status)).length
  };
});
R(cards.todo.rows === Math.min(5, derived.todos) &&
  cards.subagents.rows === Math.min(5, derived.agents) &&
  cards.changes.rows === Math.min(5, derived.changes) &&
  cards.artifacts.rows === Math.min(5, derived.artifacts),
  'every list caps at 5 rows', { derived, rows: Object.fromEntries(Object.entries(cards).map(([k, v]) => [k, v.rows])) });
R(cards.todo.head === derived.todoDone + '/' + derived.todos + ' done' &&
  cards.subagents.head === derived.agents + ' total',
  'hover card head counts match the fixtures (no literals)',
  { todo: cards.todo.head, subagents: cards.subagents.head, derived });

/* ===================================================================== 5
   Artifacts are in recency order. */
const recency = await page.evaluate(() => {
  const arts = window.PM56_DATA.artifacts || [];
  const dated = arts.filter(a => a.updatedAt), undated = arts.filter(a => !a.updatedAt);
  dated.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return { expect: dated.concat(undated).slice(0, 5).map(a => 'art:' + a.id), anyDated: dated.length };
});
R(JSON.stringify(cards.artifacts.ids) === JSON.stringify(recency.expect),
  'Artifacts hover card lists the 5 most recent, ISO-sorted',
  { got: cards.artifacts.ids, expect: recency.expect, dated: recency.anyDated });

/* ===================================================================== 6
   Subagent rows are clickable and actually open the agent. */
await page.hover('[data-hover-domain="subagents"]');
await page.waitForSelector('.hover-card.ab-card[data-domain="subagents"] button.ab-row');
await page.waitForFunction(() => { const c = document.querySelector('.hover-card.ab-card'); return c && getComputedStyle(c).opacity === '1'; }, { timeout: 3000 });
const rowInfo = await page.evaluate(() => {
  const b = document.querySelector('.hover-card.ab-card button.ab-row');
  const r = b.getBoundingClientRect();
  const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { id: b.dataset.id, action: b.dataset.action, cx: r.left + r.width / 2, cy: r.top + r.height / 2, hit: !!(at && b.contains(at)), tabsBefore: window.PM56_DEMO ? JSON.stringify(PM56_DEMO.getState().editorTabs) : null };
});
R(rowInfo.hit, 'subagent row is the topmost element at its own centre (really clickable)', rowInfo);
/* travel through the card the way a pointer would, then wait past the 160ms
   debounce, to prove the close timer does not steal the click */
await page.mouse.move(rowInfo.cx, rowInfo.cy);
await page.waitForTimeout(400);
const stillOpen = await page.evaluate(() => !!document.querySelector('.hover-card.ab-card'));
R(stillOpen, 'card stays open 400ms after the pointer entered it (debounce cancelled)');
await page.mouse.click(rowInfo.cx, rowInfo.cy);
await page.waitForTimeout(400);
const after = await page.evaluate(() => ({
  tabs: PM56_DEMO.getState().editorTabs, active: PM56_DEMO.getState().activeEditor,
  docs: [...document.querySelectorAll('.editor-doc, .editor-tab')].map(e => e.textContent.trim().slice(0, 40))
}));
R(after.active === 'thread-' + rowInfo.id, 'clicking the row opened THAT agent', { expected: 'thread-' + rowInfo.id, after });
await sample({ x: 0, y: 0, width: 1440, height: 900 }, 'after-agent-click.png');

/* the card must eventually close when the pointer leaves it entirely */
await page.mouse.move(720, 160);
await page.waitForTimeout(500);
R(await page.evaluate(() => !document.querySelector('.hover-card')), 'card closes once the pointer leaves it');

/* ===================================================================== 7
   Flip: the card must render below the anchor when there is no room above. */
await page.setViewportSize({ width: 1440, height: 420 });
await page.waitForTimeout(300);
await page.hover('[data-hover-domain="artifacts"]');
await page.waitForSelector('.hover-card.ab-card', { timeout: 4000 });
await page.waitForFunction(() => { const c = document.querySelector('.hover-card.ab-card'); return c && getComputedStyle(c).opacity === '1'; }, { timeout: 3000 });
const flip = await page.evaluate(() => {
  const c = document.querySelector('.hover-card.ab-card'); const r = c.getBoundingClientRect();
  const a = document.querySelector('[data-hover-domain="artifacts"]').getBoundingClientRect();
  const at = document.elementFromPoint(r.left + r.width / 2, r.top + 10);
  return { cardTop: r.top, cardBottom: r.bottom, anchorTop: a.top, anchorBottom: a.bottom, vh: innerHeight, inside: r.top >= -1 && r.bottom <= innerHeight + 1, hit: !!(at && c.contains(at)) };
});
R(flip.inside && flip.hit, 'card stays inside a 420px-tall viewport and still hit-tests to itself', flip);
await sample({ x: 0, y: 0, width: 1440, height: 420 }, 'flip-short-viewport.png');
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(250);

/* ===================================================================== 8
   No page overflow, no console noise, 8 themes. */
const themes = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
const themeOut = {};
for (const t of themes) {
  await page.evaluate(th => PM56_DEMO.setTheme(th), t);
  await page.waitForTimeout(260);
  await page.hover('[data-hover-domain="subagents"]');
  await page.waitForSelector('.hover-card.ab-card', { timeout: 4000 });
  await page.waitForFunction(() => { const c = document.querySelector('.hover-card.ab-card'); return c && getComputedStyle(c).opacity === '1'; }, { timeout: 3000 });
  const m = await page.evaluate(() => {
    const c = document.querySelector('.hover-card.ab-card'); const r = c.getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, rect: { x: r.left, y: r.top, w: r.width, h: r.height } };
  });
  const pix = await sample({ x: Math.round(m.rect.x), y: Math.round(m.rect.y), width: Math.round(m.rect.w), height: Math.round(m.rect.h) }, `theme-${t}-card.png`);
  const barBox = await box('.activity-bar');
  await sample({ x: Math.round(barBox.x) - 4, y: Math.round(barBox.y) - 4, width: Math.round(barBox.width) + 8, height: Math.round(barBox.height) + 8 }, `theme-${t}-bar.png`);
  themeOut[t] = { overflow: m.sw - m.cw, distinct: pix.distinct, mean: pix.mean, barW: Math.round(barBox.width) };
  await page.mouse.move(700, 200); await page.waitForTimeout(220);
}
R(Object.values(themeOut).every(v => v.overflow <= 1 && v.distinct > 60),
  'all 8 themes: no horizontal overflow, card paints content', themeOut);
await page.evaluate(() => PM56_DEMO.setTheme('basic-dark'));

/* ===================================================================== 9
   Reduced motion: state still legible, no perpetual loops from this module. */
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForTimeout(300);
const rm = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.activity-item svg').forEach(s => {
    const cs = getComputedStyle(s);
    out.push({ anim: cs.animationName, color: cs.color, filter: cs.filter !== 'none' });
  });
  const inf = document.getAnimations().filter(a => a.effect && a.effect.getTiming().iterations === Infinity).length;
  return { out, infinite: inf };
});
R(rm.out.every(o => o.anim === 'none') && rm.out.some(o => o.filter),
  'reduced motion: icon loops stop, colour + glow still carry the state', rm);
await page.emulateMedia({ reducedMotion: 'no-preference' });

/* ===================================================================== 10
   Narrow viewport. */
await page.setViewportSize({ width: 520, height: 900 });
await page.waitForTimeout(300);
const narrow = await page.evaluate(() => {
  const el = document.querySelector('.activity-item[data-hover-domain="changes"] .count');
  return { before: getComputedStyle(el, '::before').content, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
});
R(narrow.before === '""' && narrow.sw - narrow.cw <= 1, 'at 520px the diff total drops and the page does not overflow', narrow);
await page.setViewportSize({ width: 1440, height: 900 });

/* ===================================================================== 11
   The six tones must be TELLABLE APART, and not by colour alone: retro-light
   has --accent #19734c against --positive #16734c, and retro-dark #60f39a
   against #74ffb0. Force each tone through the real data path (mutate the
   subagent statuses, re-render) and read what the icon actually computes to. */
const TONE_BY_STATUS = { working: 'working', done: 'complete', idle: 'queued', blocked: 'blocked', attention: 'waiting' };
const originalStatuses = await page.evaluate(() => (window.PM56_DATA.subagents || []).map(a => a.status));
const toneReadout = {};
for (const theme of ['retro-light', 'retro-dark', 'basic-dark']) {
  await page.evaluate(t => PM56_DEMO.setTheme(t), theme);
  toneReadout[theme] = {};
  for (const [tone, status] of Object.entries(TONE_BY_STATUS)) {
    await page.evaluate(st => { window.PM56_DATA.subagents.forEach(a => a.status = st); PM56_DEMO.setTheme(PM56_DEMO.getState().theme); }, status);
    await page.waitForTimeout(260);
    const r = await page.evaluate(() => {
      const b = document.querySelector('.activity-item[data-hover-domain="subagents"]');
      const svg = b.querySelector('svg'), cs = getComputedStyle(svg), rect = svg.getBoundingClientRect();
      return { tone: document.documentElement.getAttribute('data-ab-subagents'), color: cs.color,
        stroke: cs.strokeWidth, glow: cs.filter !== 'none', anim: cs.animationName,
        x: rect.left, y: rect.top };
    });
    const pix = await sample({ x: Math.round(r.x) - 2, y: Math.round(r.y) - 2, width: 18, height: 18 }, `tone-${theme}-${tone}.png`);
    r.expected = tone; r.rgb = pix.mostSaturated; r.sat = pix.saturation;
    delete r.x; delete r.y;
    toneReadout[theme][tone] = r;
  }
  const sigs = Object.values(toneReadout[theme]).map(v => [v.color, v.stroke, v.glow, v.anim].join('|'));
  R(new Set(sigs).size === sigs.length && Object.entries(toneReadout[theme]).every(([k, v]) => v.tone === k),
    `six tones are pairwise distinguishable in ${theme} (colour + stroke-width + glow + motion)`, toneReadout[theme]);
}
await page.evaluate(o => { window.PM56_DATA.subagents.forEach((a, i) => a.status = o[i]); PM56_DEMO.setTheme('basic-dark'); }, originalStatuses);
await page.waitForTimeout(250);
fs.writeFileSync(path.join(outdir, 'tones.json'), JSON.stringify(toneReadout, null, 2));

R(consoleErrors.length === 0 && pageErrors.length === 0, 'zero console errors / page errors', { consoleErrors, pageErrors, consoleWarnings });

const failed = results.filter(r => !r.ok);
fs.writeFileSync(path.join(outdir, 'abverify.json'), JSON.stringify({ results, consoleErrors, consoleWarnings, pageErrors, cards, themeOut }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) console.log('FAILED:\n' + failed.map(f => ' - ' + f.label).join('\n'));
await browser.close();
process.exit(failed.length ? 1 : 0);
