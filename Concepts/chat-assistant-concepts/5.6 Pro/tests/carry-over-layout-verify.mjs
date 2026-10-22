#!/usr/bin/env node
/* DL-218 port carry-over. Geometry is paired with clipping and hit tests. No CSS fixes here.
 * --page standalone|pm7 --file <html> --json <report> [--sweep] [--looks a,b]
 * --sweep measures every CSS width from 400 through 519; the default measures wrap boundaries.
 */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { chatTarget, LOOKS, testGeometry } from './chat-target.mjs';
import { launchGpuBrowser, gpuPage } from './gpu-browser.mjs';

const argv = process.argv.slice(2), opt = key => { const i = argv.indexOf(key); return i < 0 ? null : argv[i + 1]; };
const target = chatTarget(argv), results = [], errors = [];
const height = Number(opt('--height') || 860);
if (!Number.isFinite(height) || height < 400) throw new Error('--height must be at least 400');
const looks = opt('--looks')?.split(',') || LOOKS;
if (looks.some(l => !LOOKS.includes(l))) throw new Error('Unknown --looks value');
const section = opt('--section') || 'all';
if (!['all', 'sheets', 'plate', 'fonts'].includes(section)) throw new Error('--section all|sheets|plate|fonts');
if (section === 'fonts' && target.kind !== 'pm7') throw new Error('Hosted fonts require --page pm7');
const plannedLooks = section === 'fonts' ? looks.filter(l => l.startsWith('nier-')) : looks;
if (!plannedLooks.length) throw new Error('The fonts section requires a NieR look');
const widthStep = Number(opt('--width-step') || 1);
if (!Number.isInteger(widthStep) || widthStep < 1 || widthStep > 119) throw new Error('--width-step must be an integer from 1 to 119');
const boundaries = [400, 420, 440, 459, 460, 480, 519];
const widths = argv.includes('--sweep') ? [...new Set([...Array.from({ length: Math.ceil(120 / widthStep) }, (_, i) => 400 + i * widthStep), ...boundaries])].sort((a, b) => a - b) : [400, 420, 440, 459, 460, 480, 500, 519];
const check = (id, look, size, kind, pass, measured) => {
  results.push({ id, look, size, height, kind, pass: !!pass, owner: look.startsWith('nier-') ? 'c56port-nier' : 'c56port-looks', measured, sizeContext: testGeometry() });
  if (!pass) console.log(`FAIL ${id} ${look} ${kind}@${size} ${JSON.stringify(measured)}`);
};
const browser = await launchGpuBrowser(chromium), page = gpuPage(browser);
page.on('pageerror', e => errors.push(e.message));
const ev = (fn, data) => page.evaluate(fn, data);
const act = (name, data = {}) => ev(([name, data]) => {
  const b = document.createElement('button'); Object.assign(b.dataset, data);
  b.type = 'button'; b.dataset.action = name;
  (window.PM56_HOST?.root || document.body).appendChild(b);
  try { b.click(); PM56_EXT.ctx().renderApp(); } finally { b.remove(); }
}, [name, data]);

// Browser-side measurement helpers are installed after each navigation, outside product code.
async function installMeasurements() {
  await ev(() => {
    const box = r => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height });
    const cv = document.createElement('canvas').getContext('2d');
    const ink = (el, r, text) => {
      const cs = getComputedStyle(el); cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = cv.measureText(text), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
      const k = fa + fd > 0 ? r.height / (fa + fd) : 1, base = r.top + (fa || parseFloat(cs.fontSize)) * k;
      return { ...box(r), top: base - m.actualBoundingBoxAscent * k, bottom: base + m.actualBoundingBoxDescent * k };
    };
    const rects = el => {
      const out = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let t = walk.nextNode(); t; t = walk.nextNode()) {
        if (!t.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(t);
        for (const r of range.getClientRects()) if (r.width && r.height) out.push(ink(t.parentElement, r, t.textContent));
      }
      return out;
    };
    const visible = el => !!el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
    const inspect = el => {
      if (!visible(el)) return { text: el?.textContent, missing: true, clipped: true };
      let clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      for (let a = el; a; a = a.parentElement) {
        const cs = getComputedStyle(a), r = a.getBoundingClientRect();
        if (/hidden|clip|auto|scroll/.test(cs.overflowX)) { clip.left = Math.max(clip.left, r.left); clip.right = Math.min(clip.right, r.right); }
        if (/hidden|clip|auto|scroll/.test(cs.overflowY)) { clip.top = Math.max(clip.top, r.top); clip.bottom = Math.min(clip.bottom, r.bottom); }
      }
      const rs = rects(el), clipped = !rs.length || rs.some(r => r.left < clip.left - .6 || r.right > clip.right + .6 || r.top < clip.top - .6 || r.bottom > clip.bottom + .6);
      const misses = [];
      const hit = rs.every(r => [0.1, 0.5, 0.9].every(f => {
        const h = document.elementFromPoint(r.left + r.width * f, r.top + r.height * .5);
        const ok = !!h && (el.contains(h) || h.contains(el));
        if (!ok) misses.push({ x: r.left + r.width * f, y: r.top + r.height * .5, top: h ? `${h.tagName}#${h.id}.${h.className?.baseVal ?? h.className}` : null });
        return ok;
      }));
      return { text: el.textContent.trim(), rects: rs, clip, clipped, hit, ...(misses.length ? { misses } : {}) };
    };
    const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > .5;
    window.__c56layout = { box, rects, inspect, visible, overlap, ink };
  });
}

async function sheet(kind) {
  await ev(kind => {
    const C = PM56_COLLAB, c = PM56_EXT.ctx(); c.switchThread('query'); C.openConfigure(kind);
    const d = C.draft(); d.purpose = 'Make search easier to reach.'; d.wonderer = true; d.grillMe = true;
    c.openDialog({ type: 'collab-configure' }); c.renderOverlays();
  }, kind);
  await page.waitForTimeout(900);
  return ev(() => PM56_COLLAB.draft().rows.length);
}
async function shelf() {
  await page.locator('#pmOverlayRoot .pmx-shelf .pmx-q-head').scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return ev(() => {
    const M = __c56layout, h = document.querySelector('#pmOverlayRoot .pmx-shelf .pmx-q-head');
    const parts = ['.pmx-q-n', '.pmx-q-title', '.pmx-q-meta'].map(s => h?.querySelector(s)).filter(Boolean).map(M.inspect);
    const overlaps = [];
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      if (parts[i].rects?.some(a => parts[j].rects?.some(b => M.overlap(a, b)))) overlaps.push([parts[i].text, parts[j].text]);
    }
    return { parts, overlaps };
  });
}
async function chrome() {
  const out = [];
  for (const sel of ['#pmOverlayRoot .pmx-roster-head', '#pmOverlayRoot .pmx-foot .primary-button']) {
    const el = page.locator(sel).first();
    if (!await el.count()) { out.push({ missing: sel, clipped: true }); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    out.push(...await ev(sel => {
      const M = __c56layout, el = document.querySelector(sel);
      return (sel.includes('roster') ? [...el.querySelectorAll('.pmx-roster-col > b')].filter(c => /Persona/.test(c.textContent)) : [el]).map(M.inspect);
    }, sel));
  }
  return out;
}
async function fonts(selector) {
  await ev(() => document.fonts.ready.then(() => true));
  return ev(selector => {
    const M = __c56layout, bad = [], used = new Set(); let checked = 0;
    const norm = s => s.trim().replace(/^["']|["']$/g, '').toLowerCase();
    for (const root of [...document.querySelectorAll(selector)].filter(M.visible)) {
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let text = walk.nextNode(); text; text = walk.nextNode()) {
        const el = text.parentElement;
        if (!text.textContent.trim() || !M.visible(el) || el.closest('script,style')) continue;
        // Native NieR header kickers use Mono only with the headers part installed
        // (pm7-port/css/41-nier-headers.css); body text still requires Sans.
        const kicker = document.documentElement.matches('[data-o55-nier="on"][data-o55-nier-parts~="headers"]') && el.closest('.pmx-view > .pmx-view-head > .pmx-view-kind');
        const want = kicker || el.closest('code,pre,kbd,samp,.pmx-code,.pmx-output-pre') ? 'pm nier mono' : 'pm nier sans';
        const family = norm(getComputedStyle(el).fontFamily.split(',')[0]); checked++; used.add(want);
        if (family !== want) bad.push({ text: text.textContent.trim().slice(0, 55), family, want });
      }
    }
    const loaded = [...document.fonts].filter(f => f.status === 'loaded' && f.unicodeRange.toLowerCase() === 'u+0-10ffff').map(f => norm(f.family));
    return { checked, bad, used: [...used], loaded: [...new Set(loaded)], missingFaces: [...used].filter(f => !loaded.includes(f)), viewport: { width: innerWidth, height: innerHeight } };
  }, selector);
}
async function fontCheck(look, size, kind, selector) {
  if (target.kind !== 'pm7' || !look.startsWith('nier-')) return;
  const f = await fonts(selector);
  check('CO-FONT', look, size, kind, f.checked > 0 && !f.bad.length && !f.missingFaces.length, f);
}

async function finishCrew() {
  await ev(() => PM56_WG_DEMOS.start('crew')); await page.waitForTimeout(900);
  await page.locator('#pmOverlayRoot [data-action="collab-modal-commit"]').click();
  await ev(() => PM56_CLOCK.setScale(4));
  const until = Date.now() + 120000;
  while (Date.now() < until) {
    const done = await ev(() => { const s = PM56_WG_DEMOS.snapshot(), r = s?.runId && PM56_COLLAB.run(s.runId); return r?.status === 'completed'; });
    if (done) { await ev(() => PM56_CLOCK.setScale(1)); return ev(() => PM56_WG_DEMOS.snapshot().runId); }
    for (const sel of ['.wg-agreed[data-state="open"] [data-action="wg-confirm"]', '.qs-grill [data-action="qs-accept-round"]']) {
      const b = page.locator(sel).filter({ visible: true }).first();
      if (await b.isVisible().catch(() => false)) await b.click({ timeout: 1500 }).catch(e => {
        if (!/Timeout|detached|not attached/.test(e.message)) throw e;
      });
    }
    await page.waitForTimeout(500);
  }
  throw new Error('Crew did not finish for the plate measurement');
}
async function plate() {
  return ev(() => {
    const M = __c56layout, ps = [...document.querySelectorAll('.pmx-view .pmx-plate')].filter(M.visible);
    const out = [];
    for (const p of ps) {
      const pr = p.getBoundingClientRect(), texts = [...p.querySelectorAll('text')].filter(M.visible);
      const result = texts.find(t => /got one checked result/.test(t.textContent));
      const r = result ? M.ink(result, result.getBoundingClientRect(), result.textContent) : null, edge = r ? Math.min(r.left - pr.left, pr.right - r.right) : null;
      const geoms = [...p.querySelectorAll('path.pmx-p-line, path.pmx-p-paper, rect.pmx-p-hatchbox, rect.pmx-m-floor, rect.pmx-p-floorbar, rect.pmx-p-hatch, line, polyline')].filter(M.visible).flatMap(el => {
        const cs = getComputedStyle(el), m = el.getScreenCTM();
        if (!m || !el.getTotalLength || cs.opacity === '0') return [];
        const length = el.getTotalLength(), n = Math.max(2, Math.min(600, Math.ceil(length * Math.abs(m.a || 1) / 2))), points = [];
        for (let i = 0; i <= n; i++) { const q = el.getPointAtLength(length * i / n); const v = new DOMPoint(q.x, q.y).matrixTransform(m); points.push([v.x, v.y]); }
        return [{ id: el.getAttribute('data-k') || el.tagName, points, half: cs.stroke === 'none' ? 0 : parseFloat(cs.strokeWidth) * Math.abs(m.a || 1) / 2 }];
      });
      const distances = a => geoms.map(g => ({ line: g.id, gap: Math.min(...g.points.map(([x, y]) => Math.hypot(Math.max(a.left - x, 0, x - a.right), Math.max(a.top - y, 0, y - a.bottom)))) - g.half })).sort((a, b) => a.gap - b.gap);
      const labels = texts.filter(t => t.textContent.trim() && getComputedStyle(t).opacity !== '0').map(t => ({ text: t.textContent.trim(), kind: 'svg', rect: M.ink(t, t.getBoundingClientRect(), t.textContent) }));
      for (const fo of p.querySelectorAll('foreignObject')) {
        const walk = document.createTreeWalker(fo, NodeFilter.SHOW_TEXT);
        for (let t = walk.nextNode(); t; t = walk.nextNode()) {
          const text = t.textContent.trim(), el = t.parentElement;
          if (!text || !M.visible(el) || getComputedStyle(el).opacity === '0') continue;
          const range = document.createRange(); range.selectNodeContents(t);
          for (const rr of range.getClientRects()) {
            if (rr.width < 1 || rr.height < 1) continue;
            const a = M.ink(el, rr, text), eb = el.getBoundingClientRect();
            if (/hidden|clip/.test(getComputedStyle(el).overflowX)) { a.left = Math.max(a.left, eb.left); a.right = Math.min(a.right, eb.right); }
            if (a.right - a.left >= 1) labels.push({ text, kind: 'html', rect: a });
          }
        }
      }
      for (const label of labels) { label.edge = Math.min(label.rect.left - pr.left, pr.right - label.rect.right); label.nearest = distances(label.rect).slice(0, 3); label.lineGap = label.nearest[0]?.gap ?? null; }
      const after = texts.filter(t => /after both/.test(t.textContent)).map(t => {
        const a = M.ink(t, t.getBoundingClientRect(), t.textContent);
        const ds = distances(a);
        return { text: t.textContent, gap: ds[0]?.gap ?? null, nearest: ds.slice(0, 3), rect: a };
      });
      const hit = r && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      out.push({ edge, after, labels, geometryCount: geoms.length, plate: M.box(pr), result: r && M.box(r), hit: !!hit && p.contains(hit) });
    }
    return out;
  });
}

try {
  await page.setViewportSize({ width: 1440, height: 900 }); await target.load(page); await installMeasurements();
  if (section !== 'plate') for (const look of plannedLooks) {
    await target.theme(page, look);
    for (const kind of ['crew', 'chat_room']) {
      const helperCount = await sheet(kind);
      await fontCheck(look, page.viewportSize().width, kind, '#pmOverlayRoot .pmx-sheet');
      for (const width of (section === 'fonts' ? [] : widths)) {
        await target.resize(page, { width, height }, 'window');
        const h = await shelf();
        check('CO-HEADER', look, width, kind, h.parts.length === 3 && !h.overlaps.length && h.parts.every(p => !p.clipped && p.hit), h);
        const c = await chrome();
        check('CO-CHROME', look, width, kind, c.length >= 2 && c.some(p => /Persona/.test(p.text)) && c.some(p => new RegExp('\\b' + helperCount + ' helpers\\b').test(p.text)) && c.every(p => !p.clipped && p.hit), { expectedHelpers: helperCount, parts: c });
      }
      console.log(`DONE sheets ${look} ${kind}: ${section === 'fonts' ? 'fonts' : widths.length + ' widths'} (${new Date().toISOString()})`);
      await ev(() => { const c = PM56_EXT.ctx(); c.closeDialog(); c.renderApp(); });
    }
  }
  if (section !== 'sheets') {
  await target.resize(page, { width: 1440, height: 900 }); await target.theme(page, 'basic-dark');
  const run = await finishCrew(); await act('wg-open-leads', { run }); await page.waitForTimeout(600);
  for (const look of plannedLooks) {
    await target.theme(page, look); await target.panelSize(page, { width: 480, height });
    const view = page.locator('.pmx-view').filter({ visible: true }).first();
    if (await view.count()) await view.evaluate(el => { let s = el; while (s && !(s.scrollHeight > s.clientHeight && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement; if (s) s.scrollTop = 0; });
    await page.waitForTimeout(400);
    await fontCheck(look, 480, 'crew-view', '.pmx-view');
    if (section === 'fonts') continue;
    const p = await plate();
    check('CO-PLATE-EDGE', look, 480, 'crew', p.some(p => p.result && p.hit) && p.every(p => p.labels.length > 0 && p.labels.every(l => l.edge >= 11.95)), p);
    check('CO-PLATE-LINE', look, 480, 'crew', p.length > 0 && p.every(p => p.geometryCount > 0 && p.labels.length > 0 && p.labels.every(l => l.lineGap !== null && l.lineGap >= 7.95)), p);
    check('CO-PLATE-AFTER', look, 480, 'crew', p.length > 0 && p.some(p => p.after.length) && p.every(p => p.after.every(a => a.gap !== null && a.gap >= 7.95)), p);
  }
  }
} catch (e) { results.push({ id: 'CO-RUN', pass: false, owner: 'c56port-tests', measured: e.stack }); console.error(e); }
finally { await browser.close(); }
if (errors.length) results.push({ id: 'CO-PAGEERROR', pass: false, owner: 'c56port-found', measured: errors });
const failed = results.filter(r => !r.pass), report = { page: target.kind, file: target.file, section, widths, widthStep, checks: results.length, failed: failed.length, results };
if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify(report, null, 2));
console.log(`carry-over-layout-verify (${target.kind}): ${results.length - failed.length} PASS, ${failed.length} FAIL`);
process.exitCode = failed.length ? 1 : 0;
