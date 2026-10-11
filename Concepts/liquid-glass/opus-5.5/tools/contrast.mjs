/* contrast.mjs <page.html> <out.json> [--looks glass-dark,glass-light] [--clarity 0,2] [--tier cpu]
 *
 * The readability gate (BRIEF step 4): text 4.5:1 and glyphs 3:1 over what is really behind them. For each look and
 * clarity detent it records every visible text element and glyph in the concept surface (title bar, activity bar,
 * rail panel, Usage navigation, toolbar and cards), then hides all ink and photographs the page, so each label is
 * measured against the actual pixels under it (wallpaper, slab, fills, rims), taking the worst pixel in its box.
 * The ink colour is composited over each pixel first, so translucent ink is judged as it is drawn.
 * Exits 1 when anything fails. Headless Chrome on file:, nothing leaves the machine.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/sittingmongoose/pmt-dev/pw/noop.js');
const { chromium } = require('playwright-core');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const [pageFile, outFile] = argv;
const LOOKS = opt('looks', 'glass-dark,glass-light').split(',');
const CLAR = opt('clarity', '0,2').split(',');
const TIER = opt('tier', 'cpu');
const REGIONS = ['.title-bar', '#activityBar', '#sidePanelSlot', '.pmu-rail', '.pmu-stagehead', '.pmu-card'];

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.route('**/*', r => /^(file:|data:|blob:)/.test(r.request().url()) ? r.continue() : r.abort());
await page.goto(pathToFileURL(resolve(pageFile)).href + '?o55=off&lgtier=' + TIER, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 90000 });
await page.waitForTimeout(1500);
const report = { tier: TIER, runs: [] };
let fails = 0;
for (const look of LOOKS) for (const clar of CLAR) {
  const [f, m] = look.split('-');
  await page.evaluate(([f, m, clar]) => {
    const c = s => s[0].toUpperCase() + s.slice(1);
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', c(f) + ' ' + c(m));
    if (clar === '2') document.documentElement.removeAttribute('data-lg-clarity'); else document.documentElement.setAttribute('data-lg-clarity', clar);
    window.PM_PAGES.go('usage');
  }, [f, m, clar]);
  await page.mouse.move(1910, 1075);
  await page.waitForTimeout(3500);
  const items = await page.evaluate((REGIONS) => {
    const out = [];
    const seen = new Set();
    for (const sel of REGIONS) for (const reg of document.querySelectorAll(sel)) {
      const walker = document.createTreeWalker(reg, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        if (!n.nodeValue.trim()) continue;
        const e = n.parentElement; if (!e || seen.has(e)) continue; seen.add(e);
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); const r0 = rg.getBoundingClientRect();
        /* measure the ink, not the line box: inset by the leading and the empty space above the cap height */
        const fs = parseFloat(cs.fontSize) || 14, lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight) || fs * 1.2;
        const lines = Math.max(1, Math.round(r0.height / lh)), padY = Math.max(0, (lh - fs) / 2) + fs * 0.12;
        const r = { left: r0.left, right: r0.right, width: r0.width, top: r0.top + padY, bottom: r0.bottom - Math.max(0, (lh - fs) / 2), height: Math.max(1, r0.height - padY - Math.max(0, (lh - fs) / 2)) };
        void lines;
        if (r.width < 2 || r.height < 4 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue;
        let op = 1; for (let a = e; a; a = a.parentElement) op *= +getComputedStyle(a).opacity;
        if (op < 0.05) continue;
        /* text clipped away by a scrolling or overflow-hidden ancestor (rows past the board's edge) is not drawn */
        let vx0 = r.left, vy0 = r.top, vx1 = r.right, vy1 = r.bottom;
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
          const o = getComputedStyle(a); if (o.overflow === 'visible' && o.overflowX === 'visible' && o.overflowY === 'visible') continue;
          const ar = a.getBoundingClientRect(); vx0 = Math.max(vx0, ar.left); vy0 = Math.max(vy0, ar.top); vx1 = Math.min(vx1, ar.right); vy1 = Math.min(vy1, ar.bottom);
        }
        if (vx1 <= vx0 || vy1 <= vy0 || (vx1 - vx0) * (vy1 - vy0) < 0.5 * r.width * r.height) continue;
        /* text covered by another element (a clipped label under a switch) is not ink anyone reads */
        const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, (r.left + r.right) / 2)), Math.min(innerHeight - 1, Math.max(0, (r.top + r.bottom) / 2)));
        if (top && top !== e && !e.contains(top) && !top.contains(e) && !top.closest('.lg-lens, .lg-rim, #lg-sweep')) continue;
        out.push({ kind: 'text', sel: sel, name: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className).trim().split(/\s+/).slice(0, 2).join('.'),
          text: n.nodeValue.trim().slice(0, 40), color: cs.color, op, size: parseFloat(cs.fontSize), weight: +cs.fontWeight,
          r: [Math.max(0, vx0), Math.max(0, vy0), Math.min(innerWidth, vx1), Math.min(innerHeight, vy1)] });   /* only the drawn part */
      }
      for (const g of reg.querySelectorAll('svg, i.pm-ico, .pmu-ico, .pmu-navicon')) {
        const r = g.getBoundingClientRect(); if (r.width < 6 || r.height < 6 || r.width > 32 || r.height > 32) continue;   /* icons, not charts */
        const cs = getComputedStyle(g); if (cs.visibility === 'hidden') continue;
        let col = cs.color; const st = cs.stroke; if (st && st !== 'none' && !/url/.test(st)) col = st;
        let op = 1; for (let a = g; a; a = a.parentElement) op *= +getComputedStyle(a).opacity;
        if (op < 0.05) continue;
        let gx0 = r.left, gy0 = r.top, gx1 = r.right, gy1 = r.bottom;
        for (let a = g.parentElement; a && a !== document.body; a = a.parentElement) {
          const o = getComputedStyle(a); if (o.overflow === 'visible' && o.overflowX === 'visible' && o.overflowY === 'visible') continue;
          const ar = a.getBoundingClientRect(); gx0 = Math.max(gx0, ar.left); gy0 = Math.max(gy0, ar.top); gx1 = Math.min(gx1, ar.right); gy1 = Math.min(gy1, ar.bottom);
        }
        if (gx1 <= gx0 || gy1 <= gy0 || (gx1 - gx0) * (gy1 - gy0) < 0.5 * r.width * r.height) continue;
        out.push({ kind: 'glyph', sel, name: (g.closest('[class]') || g).className.toString().slice(0, 40), color: col, op, r: [gx0, gy0, gx1, gy1] });
      }
    }
    return out;
  }, REGIONS);
  await page.evaluate(() => { const st = document.createElement('style'); st.id = 'lg-ink-off'; st.textContent = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important} svg,i.pm-ico,.pmu-ico,.pmu-navicon,img,canvas{visibility:hidden!important}'; document.head.appendChild(st); });
  await page.waitForTimeout(300);
  const shot = (await page.screenshot({ type: 'png' })).toString('base64');
  await page.evaluate(() => document.getElementById('lg-ink-off').remove());
  const res = await page.evaluate(async ({ shot, items }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + shot; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const D = g.getImageData(0, 0, c.width, c.height).data, W = c.width;
    const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    function parse(col) { const m = col.match(/[\d.]+/g).map(Number); if (/^color\(srgb/.test(col)) return [m[0] * 255, m[1] * 255, m[2] * 255, m.length > 3 ? m[3] : 1]; return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; }
    return items.map(it => {
      const [cr, cg, cb, ca] = parse(it.color); const a = ca * it.op;
      let worst = 99, wpx = null;
      const [x0, y0, x1, y1] = it.r.map(Math.round);
      const sx = Math.max(1, Math.floor((x1 - x0) / 24)), sy = Math.max(1, Math.floor((y1 - y0) / 6));
      for (let y = y0; y < y1; y += sy) for (let x = x0; x < x1; x += sx) {
        const i = (y * W + x) * 4, br = D[i], bg = D[i + 1], bb = D[i + 2];
        const tr = cr * a + br * (1 - a), tg = cg * a + bg * (1 - a), tb = cb * a + bb * (1 - a);
        const l1 = L(tr, tg, tb), l2 = L(br, bg, bb);
        const cr_ = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        if (cr_ < worst) { worst = cr_; wpx = [br, bg, bb]; }
      }
      return Object.assign({}, it, { worst: +worst.toFixed(2), bg: wpx });
    });
  }, { shot, items });
  const need = it => it.kind === 'glyph' ? 3 : 4.5;
  /* gradient ink (background-clip: text, colour transparent) cannot be read this way; it is listed for an eye check */
  const gradient = res.filter(it => /^rgba\((?:[^,]+,){3}\s*0\)$/.test(it.color) || /\/\s*0\)$/.test(it.color) || it.color === 'transparent');
  const judged = res.filter(it => !gradient.includes(it));
  const bad = judged.filter(it => it.worst < need(it));
  fails += bad.length;
  report.runs.push({ look, clarity: clar, measured: judged.length, gradient_ink: gradient.map(g => g.name + ' ' + (g.text || '')), failing: bad.length,
    lowest_text: res.filter(i => i.kind === 'text').sort((a, b) => a.worst - b.worst).slice(0, 8),
    lowest_glyph: res.filter(i => i.kind === 'glyph').sort((a, b) => a.worst - b.worst).slice(0, 5), bad });
  console.log(`${look} clarity ${clar}: ${judged.length} measured (${gradient.length} gradient ink to check by eye), ${bad.length} failing; lowest text ${Math.min(...judged.filter(i => i.kind === 'text').map(i => i.worst))}, lowest glyph ${Math.min(...judged.filter(i => i.kind === 'glyph').map(i => i.worst))}`);
  for (const b of bad.slice(0, 12)) console.log('   FAIL', b.kind, b.worst, b.sel, b.name, JSON.stringify(b.text || ''), b.color, 'bg', b.bg);
}
writeFileSync(outFile, JSON.stringify(report, null, 1));
await browser.close();
process.exit(fails ? 1 : 0);
